// Act I (70_act1.js): plays every scene of the Prologue and Act I in all three languages
// with an in-page auto-driver (all branches by choice strategy), then a short pass through
// the real dialog UI. Checks: no errors, pages ≤ 220 chars, no unresolved three-part strings,
// all three-part strings in the file have three non-empty parts, Uzbek has no Cyrillic.
const L = require('./lib');
const fs = require('fs');
const path = require('path');

function staticCheck() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'layer', '70_act1.js'), 'utf8');
  const bad = [];
  let n = 0;
  for (const m of src.matchAll(/`([^`]*)`/g)) {
    const x = m[1];
    if (!x.includes('|')) continue;
    n++;
    const p = x.split('|');
    if (p.length !== 3 || p.some(q => !q.trim())) bad.push('parts: ' + x.slice(0, 70));
    p.forEach(q => { if (q.length > 220) bad.push('long ' + q.length + ': ' + q.slice(0, 60)); });
    if (p[2] && /[Ѐ-ӿ]/.test(p[2])) bad.push('cyrillic in uz: ' + p[2].slice(0, 60));
    if (p[2] && /[’ʻʼ‘`]/.test(p[2])) bad.push('apostrophe in uz: ' + p[2].slice(0, 60));
  }
  return { strings: n, bad };
}

(async () => {
  const st = staticCheck();
  const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=0&god');
  const warns = [];
  p.on('console', m => { if (m.type() === 'warning' && /need 3 parts/.test(m.text())) warns.push(m.text()); });
  await L.tick(p, 120);
  // close whatever is open (start scene of the land)
  for (let i = 0; i < 20 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.press(p, 'Enter'); await L.tick(p, 10); }

  const out = {};
  for (const lang of ['en', 'ru', 'uz']) {
    out[lang] = await p.evaluate(async lang => {
      G.LANG.set(lang);
      const A = G.__act1, Y = G.YODGOR;
      const log = { scenes: 0, pages: 0, choices: 0, long: [], pipes: [], empty: [], stuck: [], errors: [], maxLen: 0 };
      const checkText = (s, where) => {
        if (typeof s !== 'string' || !s.trim()) { log.empty.push(where); return; }
        log.maxLen = Math.max(log.maxLen, s.length);
        if (s.length > 220) log.long.push(where + ': ' + s.length + ' ' + s.slice(0, 50));
        if (s.includes('|')) log.pipes.push(where + ': ' + s.slice(0, 60));
      };
      // auto-driver
      let strategy = 0, titles = {}, asks = 0, where = '';
      const realDialog = G.UI.dialog, realChoice = G.UI.choice;
      G.UI.dialog = o => {
        (o.pages || []).forEach((pg, i) => { log.pages++; checkText(pg, where + ' p' + i); });
        if (o.speaker != null && /\|/.test(o.speaker)) log.pipes.push(where + ' speaker ' + o.speaker);
        setTimeout(() => o.onClose && o.onClose(), 0);
      };
      G.UI.choice = o => {
        log.choices++; asks++;
        checkText(o.title || 'untitled', where + ' title');
        o.options.forEach((op, i) => checkText(op.label, where + ' opt' + i));
        if (asks > 40) { log.stuck.push(where); return; }
        const open = o.options.map((op, i) => i).filter(i => o.options[i].color !== '#7a7080');
        // question hubs: ask every open question first (they disappear once asked),
        // then pick an action by strategy; a title seen again picks the last action (Leave)
        const qTag = /^\[(Ask|Спросить|So'rash)\]/;
        const qs = open.filter(i => qTag.test(o.options[i].label));
        const acts = open.filter(i => !qTag.test(o.options[i].label));
        let i;
        if (qs.length) { i = qs[0]; log.questions = (log.questions || 0) + 1; }
        else {
          const pool = acts.length ? acts : open;
          titles[o.title] = (titles[o.title] || 0) + 1;
          i = titles[o.title] > 1 ? pool[pool.length - 1] : pool[strategy % pool.length];
          (log.picked = log.picked || {})[where.split('/')[0] + ' ' + o.options[i].label.slice(0, 24)] = 1;
        }
        setTimeout(() => o.onPick(o.options[i].value), 0);
      };
      const run = (name, fn, setup) => new Promise(res => {
        where = name; titles = {}; asks = 0;
        Y.set({ void: 0, trust: 3 });
        if (G.run) G.run.gold = 9999;
        if (setup) setup();
        let finished = false;
        const tm = setTimeout(() => { if (!finished) { log.stuck.push(name + ' (no done)'); res(); } }, 4000);
        try { fn(() => { finished = true; clearTimeout(tm); log.scenes++; res(); }); }
        catch (e) { log.errors.push(name + ': ' + e.message); clearTimeout(tm); res(); }
      });
      const playLines = lines => done => Y.play(lines, done);
      const F = () => Y.run.f;
      for (strategy = 0; strategy < 4; strategy++) {
        for (const id of A.ids) {
          const Ld = A.LANDS[id], Rs = A.RESTS[id];
          const B = Object.values(A.BOSSES).find(b => ({ b_vault: 'glutton', b_tower: 'kempir', b_court: 'hound', b_choir: 'choir' })[id] === b.id);
          if (Ld) {
            if (strategy === 0) {
              if (Ld.start) await run(id + ':start', typeof Ld.start === 'function' ? Ld.start : playLines(Ld.start), () => Y.set({ f: { sado: 1 } }));
              if (Ld.mid) await run(id + ':mid', typeof Ld.mid === 'function' ? Ld.mid : playLines(Ld.mid));
              for (let s = 0; s < (Ld.stones || []).length; s++) {
                let e = Ld.stones[s]; if (typeof e === 'function') e = e(); if (typeof e === 'string') e = { text: e };
                await run(id + ':stone' + s, playLines([[e.who || 'stone', e.text]].concat(e.then || [])));
              }
              if (Ld.memory) await run(id + ':memory', playLines(Ld.memory.lines));
              checkText(G.LANG.t(Ld.name), id + ' name'); checkText(G.LANG.t(Ld.sub), id + ' sub');
            }
            await run(id + ':exit/s' + strategy, Ld.exit, () => { Y.set({ f: { sado: id === 'p_tail' ? 0 : 1, rustamMem: strategy === 1 ? 3 : 0, widow: 'fake' } }); if (strategy === 3) Y.set({ void: 60 }); });
          }
          if (Rs) {
            checkText(G.LANG.t(Rs.name), id + ' name'); checkText(G.LANG.t(Rs.sub), id + ' sub');
            const cap = { r_plane: 1, r_salt: 2, r_ark: 3 }[id];
            if (strategy === 0) {
              await run(id + ':arrive', Rs.arrive);
              await run(id + ':lullaby-hi', Rs.lullaby, () => Y.set({ trust: 3 }));
              await run(id + ':lullaby-lo', Rs.lullaby, () => Y.set({ trust: 0 }));
            }
            for (let m = 1; m <= cap; m++) {
              await run(id + ':rustam' + m + '/s' + strategy, Rs.rustam, () => { Y.set({ f: { rustamMem: m - 1 } }); delete Y.run.at['taste' + G.run.planIndex]; if (strategy === 3) Y.set({ void: 55 }); });
            }
            await run(id + ':rustam-none', Rs.rustam, () => Y.set({ f: { rustamMem: 3 } }));
            for (const v of ['bought', 'stolen', 'left']) {
              await run(id + ':turab-' + v + '/s' + strategy, Rs.turab, () => { Y.set({ f: { voice: v } }); for (const k in Y.run.at) if (/^turab/.test(k)) delete Y.run.at[k]; });
              await run(id + ':turab-again-' + v, Rs.turab, () => Y.set({ f: { voice: v } }));
            }
            await run(id + ':farrukh/s' + strategy, Rs.farrukh, () => { Y.set({ f: { truth: 0 } }); for (const k in Y.run.at) if (/^f(str|info)|^farrukh/.test(k)) delete Y.run.at[k]; });
            await run(id + ':farrukh-again', Rs.farrukh);
          }
          if (B) {
            if (strategy === 0) {
              for (const tl of ['accepted', 'refused']) await run(id + ':pre-' + tl, playLines(B.pre), () => Y.set({ f: { tillabek: tl, sado: 1 } }));
              for (const a of B.again || []) await run(id + ':again', playLines([['boss', a]]));
              ['name', 'title', 'quote', 'lair', 'lairSub'].forEach(k => checkText(G.LANG.t(B[k]), id + ' ' + k));
            }
            await run(id + ':post/s' + strategy, B.post, () => Y.set({ f: { sado: id === 'b_vault' ? 0 : 1, widow: strategy % 2 ? 'force' : undefined, tillabek: strategy % 2 ? 'accepted' : 'refused' } }));
          }
        }
      }
      // barks, death lines, intro, about, credits
      for (const k in A.BARKS) A.BARKS[k].forEach((x, i) => { if (typeof x === 'function') x = x(); checkText(G.LANG.t(x), 'bark ' + k + i); });
      A.DEATH_LINES.forEach((x, i) => checkText(G.LANG.t(x), 'death' + i));
      const introLong = [];
      for (const runs of [1, 3]) {
        const s = Y.saga; const r0 = s.runs, e0 = s.endings; s.runs = runs; if (runs > 1) s.endings = { tithe: 1 };
        A.introPages().forEach((pg, i) => { checkText(pg.text, 'intro' + runs + ':' + i); if (pg.text.length > 200) introLong.push(i + ':' + pg.text.length); if (pg.speaker) checkText(pg.speaker, 'intro speaker'); });
        s.runs = r0; s.endings = e0;
      }
      G.STORY.about.forEach((x, i) => checkText(x, 'about' + i));
      G.STORY.credits.forEach(([a, b2], i) => { checkText(a, 'credit' + i); checkText(b2, 'credit' + i); });
      log.introLong = introLong;
      log.about0 = G.STORY.about[0].slice(0, 30);
      G.UI.dialog = realDialog; G.UI.choice = realChoice;
      return log;
    }, lang);
  }

  // ---- real UI: a land exit and a rest, through the actual dialog boxes ----
  const ui = {};
  await p.evaluate(() => G.LANG.set('ru'));
  await p.evaluate(() => { G.YODGOR.set({ f: { sado: 1 }, void: 0, trust: 3 }); G.YODGOR.scene(G.__act1.LANDS.a1_rabat.exit); });
  ui.rabat = await L.advance(p, 80);
  const m = await L.modal(p);
  ui.rabatChoice = m && m.options;
  if (m && m.type === 'choice') { const pickR = m.options.find(o => o.startsWith('[Помочь]')) || m.options[0]; await L.choose(p, pickR.slice(0, 24)); ui.rabatAfter = await L.advance(p, 40); }
  ui.davron = await p.evaluate(() => G.YODGOR.run.f.davron);
  await p.evaluate(() => G.LANG.set('uz'));
  await p.evaluate(() => { G.YODGOR.set({ f: { rustamMem: 0 } }); delete G.YODGOR.run.at['taste' + G.run.planIndex]; G.YODGOR.scene(G.__act1.RESTS.r_plane.rustam); });
  await L.advance(p, 10);
  const m2 = await L.modal(p);
  ui.rustamChoice = m2 && m2.options;
  if (m2 && m2.type === 'choice') { const pickU = m2.options.find(o => o.startsWith('[Xotirani totish]')) || m2.options[0]; await L.choose(p, pickU.slice(0, 24)); ui.rustam = await L.advance(p, 60); }
  ui.state = await p.evaluate(() => ({ void: G.YODGOR.run.void, mem: G.YODGOR.run.f.rustamMem, busy: G.YODGOR.busy }));
  await L.shot(p, 'act1_ui');

  const res = { static: st, warns: warns.slice(0, 5), errs: p._errs.slice(0, 10), ui };
  for (const lang in out) {
    const o = out[lang];
    res[lang] = { questions: o.questions, picked: Object.keys(o.picked || {}).length, scenes: o.scenes, pages: o.pages, choices: o.choices, maxLen: o.maxLen, long: o.long.slice(0, 5), pipes: o.pipes.slice(0, 5), empty: o.empty.slice(0, 5), stuck: o.stuck.slice(0, 5), errors: o.errors.slice(0, 5), introLong: o.introLong, about0: o.about0 };
  }
  console.log(JSON.stringify(res, null, 1));
  const fail = st.bad.length || warns.length || p._errs.length || Object.values(out).some(o => o.long.length || o.pipes.length || o.empty.length || o.stuck.length || o.errors.length || o.introLong.length);
  console.log(fail ? 'FAIL' : 'OK');
  await b.close();
  process.exit(fail ? 1 : 0);
})();
