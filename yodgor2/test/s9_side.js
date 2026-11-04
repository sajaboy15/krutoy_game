// Side stories (89c–89f): each one played to its end with the first available choices (props and people in their
// regions, story flags set so they're offered). Prints each quest's state and branch, page errors, untranslated text.
//   node test/s9_side.js [lang=ru]
const T = require('./s6_lib');
const lang = process.argv[2] || 'ru';
// [quest, region, hour, [entity ids to use, in order, repeated until done]]
const PLAN = [
  ['sd12', 'tail', 20, ['hakim', 'sd12cup', 'hakim']], ['sd18', 'tail', 20, ['zuhra']], ['sd18', 'potters', 12, ['sd18kiln']], ['sd18', 'tail', 20, ['zuhra']],
  ['sd7', 'potters', 12, ['dilbar']], ['sd7', 'bazaar', 21, ['farrukh_n']],
  ['sd9', 'bazaar', 12, ['cartographer']], ['sd9', 'karez', 12, ['sd9cache']],
  ['sd8', 'ark', 12, ['bahodir_s']], ['sd14', 'ark', 12, ['gardener', 'sd14tree', 'gardener']], ['sd4', 'potters', 12, ['mirshab', 'sd4ash', 'mirshab']],
  ['sd5', 'streets', 12, ['sd5', 'sd5', 'sd5']], ['sd10', 'mines', 12, ['bobur', 'sd10book', 'bobur']], ['sd13', 'karez', 12, ['sardor']], ['sd11', 'tower', 12, ['sd11']],
  ['sd15', 'withers', 12, ['altan']], ['sd16', 'cloister', 22, ['sd16']], ['sd17', 'rabat', 12, ['sherali']], ['sd20', 'sand', 12, ['sd20']], ['sd6', 'ark', 12, ['rahim']]
];
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const frames = n => W(n => { for (let i = 0; i < n; i++) { G.debugTick(1); for (const f of G.WORLD2.ticks) f(G.WORLD2.S()); } }, n);   // debugTick skips the world's per-frame hooks
  await W(() => { const r = G.YODGOR.run; for (const k of ['b_choir', 'b_tower', 'a1_ark', 'a1_tail', 'a1_cloister']) r.at['done:' + k] = 1; r.f.voice = 'left'; r.f.hound = 'spared'; G.run.gold = 3000; const S = G.WORLD2.S(); S.charts = S.charts || {}; S.charts.tail = 1; S.moon = 1; G.COMP.S().arc.alp = 2; });
  const out = {};
  let cur = null;
  for (const [qid, region, hour, ids] of PLAN) {
    if (cur !== region) { await W(r => G.WORLD2.go(r, 'start', { now: true, force: true }), region); await T.settle(p, 200); await T.drain(p, []); cur = region; }
    await W(h => { G.WORLD2.setHour(h); G.WORLD2.syncPeople(); }, hour); await frames(65);
    for (const id of ids) {
      const ok = await W(id => { const e = G.world.ents.find(x => !x.dead && (x._w2npc === id || x._f6 === id) && x.onUse); if (!e) return false; const pl = G.world.player; pl.x = e.x - 14; pl.y = e.y; e.onUse(pl, e); return true; }, id);
      if (!ok) { out[qid] = out[qid] || {}; (out[qid].miss = out[qid].miss || []).push(id); continue; }
      await T.drain(p, [], { pick: (opts, title, okIdx) => okIdx[0] }); await frames(65);
    }
    out[qid] = Object.assign(out[qid] || {}, await W(q => G.FAC.q(q), qid));
  }
  const rows = Object.entries(out).map(([k, v]) => k + ':' + v.st + (v.br ? '/' + v.br : '') + (v.miss ? ' miss ' + v.miss.join(',') : ''));
  console.log(rows.join('\n'));
  console.log('errs', p._errs.slice(0, 6));
  console.log('untranslated', (await T.untranslated(p)).filter(s => !/^Level|^Уровень/.test(s)).slice(0, 10));
  await b.close();
})();
