// Stage 5 — the whole story through the open city, region by region, by exits only (no teleports between regions).
//   node test/s5_route.js <lang> <mode> [ending] [strat]
//   mode full : "New journey" from the title: the prologue, then every chapter of Acts I–III in a free order
//               (the Cloister thread after the moon wanes, to show the third thread waits), saves and loads mid-act,
//               the ending, the epilogue slides
//   mode act3 : from the start of Act III (?stage=26) through the dream to the ending
//   mode final: from the nest (?stage=31) straight to the ending (tale: with its conditions met; hollow: by Hollowness)
const T = require('./s5_lib');
const lang = process.argv[2] || 'ru', mode = process.argv[3] || 'full', want = process.argv[4] || 'tithe', strat = process.argv[5] || 'first';
const ENDS = ['tithe', 'chain', 'awake', 'tale'];
const TALE_LABEL = /Give Nargiza your story|Отдать Наргизе свою историю|Nargizaga hikoyangni berish/;
const pick = (opts) => {
  if (!opts.some(o => TALE_LABEL.test(o))) return null;
  const acts = opts.map((o, i) => [o, i]).filter(([o]) => !/^\s*—/.test(o));
  const k = ENDS.indexOf(want);
  return acts[k] ? acts[k][1] : null;
};
const R = { lang, mode, want, steps: [], errs: [], fail: [] };
const ACT12 = [
  ['rest', 'r_plane', 'tail_plane'], ['land', 'a1_tail', 'tail'], ['land', 'a1_bazaar', 'bazaar'],
  ['save'],
  ['land', 'a1_rabat', 'rabat'], ['boss', 'b_tower', 'tower_top'], ['rest', 'r_salt', 'rabat_salt'],
  ['land', 'a1_ark', 'ark'], ['boss', 'b_court', 'court'], ['rest', 'r_ark', 'ark_wall', { sign: true }],
  ['rest', 'r_den', 'karez_den'],
  ['land', 'a1_cloister', 'cloister'], ['boss', 'b_choir', 'choir'],
  ['land', 'a2_karez', 'karez'], ['land', 'a2_streets', 'streets'], ['boss', 'b_cistern', 'lair'], ['rest', 'r_lamp', 'last_lamp'],
  ['save'],
  ['land', 'a2_old', 'old'], ['land', 'a2_well', 'well'], ['boss', 'b_seven', 'bottom'], ['rest', 'r_rib', 'ribs'],
  ['land', 'a2_spine', 'spine'], ['boss', 'b_shrine', 'shrine'], ['rest', 'r_spine', 'spine_chai'], ['land', 'a2_heart', 'heart']
];
const ACT3 = [['land', 'a3_dream', 'dream'], ['rest', 'r_dream', 'dream_chai'], ['land', 'a3_sand', 'sand'], ['land', 'a3_wedding', 'wedding'], ['land', 'a3_house', 'house'], ['boss', 'b_nightmare', 'nest']];

(async () => {
  const b = await T.chromium.launch();
  const q = mode === 'full' ? '?god' : mode === 'act3' ? '?stage=26&god' : '?stage=31&god';
  let p = await T.open(b, q);
  await p.evaluate(l => G.LANG.set(l), lang);
  await T.watchText(p);
  const log = [];
  const o = { strat, pick };
  const W = (f, a) => p.evaluate(f, a);
  const note = async (tag) => { const s = await T.story(p); R.steps.push(tag + ' @' + s.at + (s.inside ? '/' + s.inside : '') + ' m' + s.moon + ' done=' + s.done.length); if (process.env.PROG) console.error(new Date().toISOString().slice(11, 19), tag, s.at, 'm' + s.moon, s.done.length); };
  const guard = async () => { await W(() => { const r = G.YODGOR.run; if (r.void > 85) { r.void = 55; } if (G.run && G.run.gold < 400) G.run.gold = 900; }); };

  if (mode === 'full') {
    await T.tick(p, 60);
    await W(() => { G.Game.startRun({ mode: 'wanderer' }); G.godMode = true; });
    await T.tick(p, 120); await T.drain(p, log, o);
    // prologue 1: the Tail at night, the widow at the gate
    await W(() => { const d = G.world.interactables.find(o => o.art === 'door'); if (d) { G.world.player.x = d.x - 110; G.world.player.y = d.y - 2; } });
    await T.tick(p, 60); await T.drain(p, log, o);
    await W(() => G.Game.exitStage()); await T.tick(p, 30); await T.drain(p, log, o);
    await T.tick(p, 120); await p.waitForTimeout(200); await T.tick(p, 60);
    await note('p_tail');
    // prologue 2: the vault, the Glutton
    R.vaultPlan = await W(() => G.Game.stage.plan.id);
    await T.fightBoss(p, log, o);
    await W(() => G.Game.exitStage()); await T.tick(p, 20); await T.drain(p, log, o);
    await T.settle(p, 200); await T.tick(p, 100); await T.drain(p, log, o);
    R.afterPrologue = await W(() => ({ plan: G.Game.stage.plan.id, region: G.WORLD2.active, inside: G.WORLD2.inside, world: !!G.YODGOR.run.world }));
    await note('b_vault');
  } else {
    await T.settle(p, 200); await T.tick(p, 100);
  }
  if (mode === 'final' && want === 'tale') await W(() => { Object.assign(G.YODGOR.run.f, { nargizaQ: 'believes', truth: 1, tales: 1, name: 1, sadoFate: 'remember' }); G.YODGOR.run.void = 20; });

  const steps = mode === 'full' ? ACT12.concat(ACT3) : mode === 'act3' ? ACT3 : [['boss', 'b_nightmare', 'nest']];
  for (const st of steps) {
    await guard();
    const [kind, id, where, x] = st;
    try {
      if (kind === 'save') {
        // save to slot 1 mid-act, reload the page, load the slot, check the world came back as it was
        const before = await T.story(p);
        await W(() => { const cp = G.YODGOR.checkpoint; localStorage.setItem('yodgor2_slot_1', JSON.stringify(cp)); });
        await W(() => { localStorage.setItem('yodgor2_lang_probe', '1'); });
        await p.goto(p.url().split('?')[0] + '?god'); await p.waitForTimeout(900);
        await W(() => { const g = document.getElementById('gate'); if (g) g.hidden = true; });
        await p.evaluate(l => G.LANG.set(l), lang); await T.watchText(p);
        await T.tick(p, 30);
        await W(() => { const c = JSON.parse(localStorage.getItem('yodgor2_slot_1')); G.YODGOR.continueRun(c); G.godMode = true; });
        await T.settle(p, 200); await T.tick(p, 80); await T.drain(p, log, o);
        const after = await T.story(p);
        const same = before.done.join() === after.done.join() && before.moon === after.moon;
        (same ? R.steps : R.fail).push('save/load: ' + (same ? 'same story state' : JSON.stringify({ before, after })));
        continue;
      }
      if (kind === 'rest') {
        const region = await W(c => G.WORLD2.chaiDef(c).region, where);
        if (!(await T.travel(p, region, log))) { R.fail.push('no way to ' + region + ' for ' + id); continue; }
        const r = await T.enterChai(p, where, log);
        if (r !== 'ok') { R.fail.push(id + ': ' + r); continue; }
        await T.drain(p, log, o);
        await T.useArt(p, 'aksakal', log, o);
        await T.useArt(p, 'shaman', log, o);
        await T.useArt(p, 'merchant', log, o);
        if (x && x.sign) { await T.useArt(p, 'merchant', log, { pick: (opts) => { const i = opts.findIndex(s => /Sign of the Well|Знак Колодца|Quduq belgisi/.test(s)); return i >= 0 ? i : null; } }); await T.drain(p, log, o); R.forged = await W(() => G.WORLD2.hasKey('forged_sign')); }
        await T.tick(p, 700); await T.drain(p, log, o);    // the lullaby comes in a quiet moment
        await W(() => G.Game.exitStage()); await T.settle(p, 120); await T.drain(p, log, o);
      } else if (kind === 'land') {
        if (!(await T.travel(p, where, log))) { R.fail.push('no way to ' + where + ' for ' + id); continue; }
        await T.tick(p, 120); await T.drain(p, log, o);
        const ok = await T.meetPeople(p, log, o);
        if (!ok) R.fail.push(id + ': the people did not finish');
        await T.tick(p, 40); await T.drain(p, log, o);
        if (id === 'a2_heart') { await T.tick(p, 60); await T.settle(p, 300); await T.drain(p, log, o); }
      } else if (kind === 'boss') {
        const out = await W(a => G.WORLD2.regions[a].out, where);
        const inLair = (await T.info(p)).region === where;
        if (!inLair) {
          if (!(await T.travel(p, out[0], log))) { R.fail.push('no way to ' + out[0] + ' for ' + id); continue; }
          const r = await T.useExit(p, out[1]);
          if (r !== 'ok') { R.fail.push(id + ' gate: ' + r); continue; }
          await T.tick(p, 6); await T.drain(p, log, o); await T.settle(p, 200); await T.drain(p, log, o);
        }
        const reg = (await T.info(p)).region;
        if (reg !== where) { R.fail.push(id + ': not in the lair (' + reg + ')'); continue; }
        await T.fightBoss(p, log, o);
        if (id !== 'b_nightmare') {
          await T.leaveLair(p, log, o);
          const back = await T.info(p);
          if (back.region !== out[0]) R.fail.push(id + ': out to ' + back.region + ' not ' + out[0]);
        }
      }
      const d = await W(id => G.WORLD2.story.done(id), id);
      if (!d && id !== 'b_nightmare') R.fail.push(id + ' not done');
      await note(id);
    } catch (e) { R.fail.push(id + ': ' + e.message); }
  }
  // the ending: the epilogue slides, then the victory screen
  if (mode === 'final' && want === 'hollow') {
    await W(() => { G.YODGOR.set({ void: 100 }); G.YODGOR.run.hollow = true; G.YODGOR.hollowEnd(); });
    await T.tick(p, 60); await T.drain(p, log, o);
  }
  for (let i = 0; i < 40; i++) { await T.tick(p, 30); await T.drain(p, log, o); if (await W(() => G.Game.state === 'victory')) break; }
  await T.tick(p, 200);
  R.final = await W(() => ({ state: G.Game.state, title: G.ENDING_TITLE, ended: G.YODGOR.run.ended, void: G.YODGOR.run.void, epi: G.STORY.epilogue.length, epiSlides: (G.STORY.epilogueKeys || []).filter(Boolean).length }));
  await T.shot(p, 's5_route_' + lang + '_' + mode + '_' + want);
  R.finalStory = await T.story(p).catch(() => null);
  R.choices = log.filter(l => l[0] === '?').length;
  R.errs = (p._errs || []).slice(0, 12);
  R.untranslated = await T.untranslated(p);
  console.log(JSON.stringify(R, null, 1));
  require('fs').writeFileSync(T.out + '/s5_route_' + lang + '_' + mode + '_' + want + '.log', log.join('\n'));
  await b.close();
})();
