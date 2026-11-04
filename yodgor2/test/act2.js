// Act II (71_act2.js): play every scene in EN/RU/UZ with several flag sets and choice strategies.
// Part A drives the scenes in-page with the dialog/choice UI stubbed (fast, covers branches).
// Part B plays a few scenes through the real UI (keyboard), incl. walking up to the people at a gate.
// YODGOR_OUT=/tmp/w_act2 node test/act2.js
const L = require('./lib');
const fs = require('fs');
const path = require('path');

// ---------- static: every three-part string in the file ----------
function staticCheck() {
  const src = fs.readFileSync(path.join(__dirname, '..', 'src', 'layer', '71_act2.js'), 'utf8');
  const bad = [];
  let n = 0;
  for (const m of src.matchAll(/`([^`]*)`/g)) {
    const parts = m[1].split('|');
    if (parts.length === 1) continue;
    n++;
    const line = src.slice(0, m.index).split('\n').length;
    if (parts.length !== 3) { bad.push(`L${line}: ${parts.length} parts`); continue; }
    parts.forEach((p, i) => {
      if (!p.trim()) bad.push(`L${line}: empty part ${i}`);
      if (p.length > 220) bad.push(`L${line}: part ${i} has ${p.length} chars`);
      if (i !== 1 && /[Ѐ-ӿ]/.test(p)) bad.push(`L${line}: Cyrillic in part ${i}`);
      if (i === 1 && !/[Ѐ-ӿ]/.test(p) && /[A-Za-z]{3}/.test(p)) bad.push(`L${line}: Russian part has no Cyrillic`);
      if (i === 2 && /[‘’ʻʼ`]/.test(p)) bad.push(`L${line}: Uzbek apostrophe not ASCII`);
    });
  }
  return { strings: n, bad };
}

const BASE = { singers: 0, divan: 0, remember: 0, tail: 0, rabat: 0 };
const PRESETS = {
  grim: { f: { sado: 1, widow: 'force', alp: 'collected', davron: 'reported', chain: 'seal', voice: 'left', gulnora: 'blackmail', tillabek: 'accepted', hound: 'killed', nargiza: 'stayed', rustamMem: 1 }, void: 40, trust: -3, rep: { divan: 3 } },
  kind: { f: { sado: 1, widow: 'paid', alp: 'helped', davron: 'led', chain: 'carried', voice: 'bought', gulnora: 'returned', tillabek: 'refused', hound: 'shown', truth: 1, nargiza: 'down', rustamMem: 3, oydinName: 1 }, void: 10, trust: 4, rep: { remember: 2 } },
  hollow: { f: { sado: 1, widow: 'written', alp: 'paid', davron: 'bluff', chain: 'silent', voice: 'stolen', gulnora: 'left', hound: 'spared', nargiza: 'down', rustamMem: 2 }, void: 76, trust: 2, rep: { singers: 2 } },
  bare: { f: { sado: 1 }, void: 0, trust: 0, rep: {} }
};

async function runAct(p, presetName, k, lang) {
  const preset = PRESETS[presetName];
  return p.evaluate(async ({ preset, k, lang, BASE }) => {
    const A = G.ACT2, Y = G.YODGOR, errs = [], seen = { dialogs: 0, pages: 0, choices: 0, scenes: 0 };
    G.LANG.set(lang);
    const r = Y.run;
    r.f = JSON.parse(JSON.stringify(preset.f)); r.at = {}; r.mem = {}; r.void = preset.void; r.trust = preset.trust;
    r.rep = Object.assign({}, BASE, preset.rep); r.hollow = false; r.ended = null; r.tastes = 0;
    Y.hollowEnd = () => {};
    if (G.run) G.run.gold = 99999;
    const cyr = /[Ѐ-ӿ]/;
    let where = '';
    const chk = (s, what) => {
      if (typeof s !== 'string' || !s.trim()) { errs.push(`empty ${what} @${where}`); return; }
      if (s.length > 220) errs.push(`long(${s.length}) ${what} @${where}: ${s.slice(0, 60)}`);
      if (s.includes('|')) errs.push(`unresolved ${what} @${where}: ${s.slice(0, 60)}`);
      if (lang === 'ru' ? (!cyr.test(s) && /[A-Za-z]{3}/.test(s)) : cyr.test(s)) errs.push(`script ${what} @${where}: ${s.slice(0, 60)}`);
    };
    let ci = 0;
    G.UI.dialog = o => {
      seen.dialogs++;
      if (o.speaker && /^[a-z]+$/.test(o.speaker)) errs.push(`raw speaker '${o.speaker}' @${where}`);
      (o.pages || []).forEach(pg => { seen.pages++; chk(pg, 'page'); });
      setTimeout(() => { try { o.onClose && o.onClose(); } catch (e) { errs.push('onClose ' + e.message); } }, 0);
    };
    G.UI.choice = o => {
      seen.choices++;
      chk(o.title, 'title');
      o.options.forEach(x => chk(x.label, 'option'));
      const valid = o.options.filter(x => x.color !== '#7a7080');
      if (!valid.length) { errs.push('all options locked @' + where); return; }
      const pick = valid[(k + ci++) % valid.length];
      setTimeout(() => { try { o.onPick(pick.value); } catch (e) { errs.push('onPick ' + e.message); } }, 0);
    };
    const run = (name, fn) => new Promise(res => {
      where = name; seen.scenes++;
      let fin = false;
      const to = setTimeout(() => { if (!fin) { errs.push('timeout @' + name); res(); } }, 6000);
      try {
        Y.scene(done => fn(() => { fin = true; clearTimeout(to); done(); setTimeout(res, 0); }));
      } catch (e) { errs.push('throw @' + name + ': ' + e.message); res(); }
      // keep the journey alive for the next scenes
    }).then(() => { r.hollow = false; r.ended = null; if (r.void > 92) r.void = 80; if (G.run) G.run.gold = 99999; });
    const lines = ls => done => Y.play(ls, done);
    const BOSS_OF = { b_cistern: 'albasty', b_seven: 'seven', b_shrine: 'barys' };
    for (const id of A.ids) {
      const Ld = A.LANDS[id], Rs = A.RESTS[id], B = A.BOSSES[BOSS_OF[id]];
      if (Ld) {
        if (!Ld.name || !Ld.sub) errs.push('no name/sub ' + id);
        for (const k2 of [':start', ':mid']) if (!(A.BARKS[id + k2] || []).length) errs.push('no barks ' + id + k2);
        if (!Ld.stones || Ld.stones.length < 3) errs.push('few stones ' + id);
        if (!Ld.memory || !Ld.memory.lines) errs.push('no memory ' + id);
        if (!Ld.people || !Ld.people.length) errs.push('no people ' + id);
        if (Ld.start) await run(id + ':start', typeof Ld.start === 'function' ? Ld.start : lines(Ld.start));
        if (Ld.mid) await run(id + ':mid', typeof Ld.mid === 'function' ? Ld.mid : lines(Ld.mid));
        for (let i = 0; i < Ld.stones.length; i++) { const s = Ld.stones[i]; await run(id + ':stone' + i, lines([['stone', typeof s === 'string' ? s : s.text]])); }
        await run(id + ':memory', done => Y.play(Ld.memory.lines, () => { r.mem[Ld.memory.id] = 1; if (Ld.memory.after) Ld.memory.after(); done(); }));
        if (Ld.peopleAfter) { const g = Ld.people.map(x => ({ look: x.look })); Ld.peopleAfter(g); g.forEach(o => { if (!o.look) errs.push('look lost ' + id); }); }
        await run(id + ':exit', Ld.exit);
        for (const b of A.BARKS[id + ':start'].concat(A.BARKS[id + ':mid'])) { where = id + ':bark'; chk(G.LANG.t(typeof b === 'function' ? b() : b), 'bark'); }
      } else if (Rs) {
        if (!Rs.name || !Rs.sub) errs.push('no name/sub ' + id);
        for (const key of ['arrive', 'rustam', 'turab', 'farrukh', 'lullaby']) if (!Rs[key]) errs.push(`no ${key} ${id}`);
        await run(id + ':arrive', Rs.arrive);
        await run(id + ':rustam', Rs.rustam);
        await run(id + ':rustam2', Rs.rustam);
        await run(id + ':turab', Rs.turab);
        await run(id + ':farrukh', Rs.farrukh);
        await run(id + ':farrukh2', Rs.farrukh);
        for (const [i, pp] of (Rs.people || []).entries()) { await run(id + ':people' + i, pp.talk); await run(id + ':people' + i + 'b', pp.talk); if (typeof pp.x !== 'number') errs.push('people x ' + id); }
        const before = r.void;
        await run(id + ':lullaby', Rs.lullaby);
        for (const b of A.BARKS[id + ':start'] || []) { where = id + ':bark'; chk(G.LANG.t(b), 'bark'); }
      } else if (B) {
        for (const key of ['name', 'title', 'quote', 'lair', 'lairSub', 'pre', 'again', 'post']) if (!B[key]) errs.push(`no ${key} ${id}`);
        await run(id + ':pre', lines(B.pre));
        for (const a of B.again) await run(id + ':again', lines([[B.who, a]]));
        await run(id + ':post', B.post);
      } else errs.push('missing content ' + id);
    }
    // memory "after" subtitles are three-part
    return { errs, seen, flags: JSON.parse(JSON.stringify(r.f)), void: r.void, trust: r.trust, rep: r.rep };
  }, { preset, k, lang, BASE });
}

(async () => {
  const st = staticCheck();
  console.log('static: strings', st.strings, 'bad', st.bad.length);
  st.bad.slice(0, 20).forEach(b => console.log('  ' + b));
  const b = await L.chromium.launch();
  const report = { static: st.bad.length, runs: 0, errors: [], pageErrors: [], flags: {}, pages: 0, choices: 0 };

  // ---------- Part A ----------
  const p = await L.open(b, '?stage=13&god');
  await L.tick(p, 30);
  for (const lang of ['en', 'ru', 'uz']) {
    for (const name of Object.keys(PRESETS)) {
      for (let k = 0; k < 4; k++) {
        const res = await runAct(p, name, k, lang);
        report.runs++;
        report.pages += res.seen.pages; report.choices += res.seen.choices;
        res.errs.forEach(e => report.errors.push(`[${lang}/${name}/${k}] ${e}`));
        const f = res.flags;
        const key = ['masked', 'rustamMem', 'alpTumars', 'nest', 'farrukh', 'oydin', 'wellLine', 'seven', 'sevenEnd', 'barys', 'name', 'nargizaQ', 'tales', 'faction', 'dreamBy'].map(x => x + '=' + (f[x] == null ? '-' : f[x])).join(' ');
        report.flags[`${name}/${k}`] = key;
      }
    }
  }
  report.pageErrors.push(...p._errs);
  await p.close();

  // ---------- Part B: real UI ----------
  const realUI = [];
  // B1: the Karez — start scene through the real dialog, then walk up to the masked woman.
  for (const lang of ['ru', 'uz', 'en']) {
    const q = await L.open(b, '?stage=14&god');
    await q.evaluate(l => { G.LANG.set(l); G.YODGOR.set({ f: { sado: 1, gulnora: 'returned' }, void: 20, trust: 3 }); }, lang);
    let log = [];
    for (let i = 0; i < 40 && !(await L.modal(q)); i++) await L.tick(q, 10);
    log = await L.advance(q, 80, log);
    if (lang === 'ru') await L.shot(q, 'act2_karez_ru');
    // walk to the people before the gate
    const tp = await q.evaluate(() => {
      const door = G.world.interactables.find(o => o.art === 'door');
      const ppl = G.world.ents.concat(G.world.interactables).filter(o => o.art === 'person');
      if (!door || !ppl.length) return 'no door/people: ' + ppl.length;
      const near = ppl[ppl.length - 1];
      const pl = G.world.player; pl.x = near.x - 30; pl.y = near.y; pl.vx = 0;
      return 'ok ' + ppl.length;
    });
    for (let i = 0; i < 40 && !(await L.modal(q)); i++) await L.tick(q, 10);
    log = await L.advance(q, 80, log);
    const m = await L.modal(q);
    if (m && m.type === 'choice') { await L.choose(q, m.options[0].split(' · ')[0]); log = await L.advance(q, 60, log); }
    const r = await L.run(q);
    realUI.push({ lang, scene: 'a2_karez', teleport: tp, lines: log.length, masked: r.f.masked, maskedAns: r.f.maskedAns, errs: q._errs.slice() });
    if (lang === 'uz') await L.shot(q, 'act2_karez_uz');
    report.pageErrors.push(...q._errs);
    await q.close();
  }
  // B2: Old Yodgor — the sister scene through the real UI (ru), choosing "show Rustam's memory".
  {
    const q = await L.open(b, '?stage=18&god');
    await q.evaluate(() => { G.LANG.set('ru'); G.YODGOR.set({ f: { sado: 1, rustamMem: 4, oydinName: 1, masked: 1, maskedAns: 'give' }, void: 30, trust: 4 }); });
    for (let i = 0; i < 40 && !(await L.modal(q)); i++) await L.tick(q, 10);
    let log = await L.advance(q, 60, []);
    await q.evaluate(() => {
      const ppl = G.world.ents.concat(G.world.interactables).filter(o => o.art === 'person');
      const near = ppl[ppl.length - 1]; const pl = G.world.player; pl.x = near.x - 30; pl.y = near.y;
    });
    for (let i = 0; i < 40 && !(await L.modal(q)); i++) await L.tick(q, 10);
    log = await L.advance(q, 120, log);
    await L.shot(q, 'act2_oydin_q1');
    await L.choose(q, 'Голос');
    log = await L.advance(q, 120, log);
    await L.shot(q, 'act2_oydin_q2');
    await L.choose(q, '[Показать]');
    log = await L.advance(q, 120, log);
    const r = await L.run(q);
    realUI.push({ lang: 'ru', scene: 'a2_old', lines: log.length, oydin: r.f.oydin, oydinAns: r.f.oydinAns, errs: q._errs.slice() });
    report.pageErrors.push(...q._errs);
    await q.close();
  }
  // B3: the den — messengers spawn and talk through the real UI (en).
  {
    const q = await L.open(b, '?stage=13&god');
    await q.evaluate(() => { G.LANG.set('en'); G.YODGOR.set({ f: { sado: 1 }, void: 10, trust: 2 }); });
    for (let i = 0; i < 40 && !(await L.modal(q)); i++) await L.tick(q, 10);
    let log = await L.advance(q, 60, []);
    const n = await q.evaluate(() => G.world.interactables.filter(o => o.art === 'person' && o.interact).length);
    await q.evaluate(() => { const o = G.world.interactables.find(o => o.art === 'person' && o.interact); o.use(G.world.player); });
    log = await L.advance(q, 60, log);
    const m = await L.modal(q);
    if (m && m.type === 'choice') { await L.choose(q, m.options[1].split(' · ')[0]); log = await L.advance(q, 30, log); }
    await L.shot(q, 'act2_den');
    realUI.push({ lang: 'en', scene: 'r_den', messengers: n, lines: log.length, errs: q._errs.slice() });
    report.pageErrors.push(...q._errs);
    await q.close();
  }
  await b.close();

  const uniq = [...new Set(report.errors.map(e => e.replace(/^\[[^\]]+\] /, '')))];
  console.log('runs', report.runs, 'pages', report.pages, 'choices', report.choices);
  console.log('errors', report.errors.length, 'unique', uniq.length);
  uniq.slice(0, 40).forEach(e => console.log('  ' + e));
  console.log('page errors', report.pageErrors.length);
  [...new Set(report.pageErrors)].slice(0, 20).forEach(e => console.log('  ' + e));
  console.log('flags by run:');
  for (const k in report.flags) console.log('  ' + k + ': ' + report.flags[k]);
  console.log('real UI:', JSON.stringify(realUI, null, 1));
  const ok = !st.bad.length && !report.errors.length && !report.pageErrors.length;
  console.log(ok ? 'ACT2 OK' : 'ACT2 FAIL');
  process.exit(ok ? 0 : 1);
})();
