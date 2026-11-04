// Region locals and traces (89b_world_folk.js): each local stands in its region, talks (first time and again),
// each trace shows its lines and gives its coins once.     node test/s9_folk.js [lang=ru]
const T = require('./s5_lib');
const lang = process.argv[2] || 'ru';
const EV = { streets: 'breath', mines: 'whip', tower: 'crows', rabat: 'caravan', withers: 'flags', spine: 'quiet' };
const LIST = { streets: ['broom', 'slate', 'pot'], mines: ['tally', 'boots', 'stash'], tower: ['keeper', 'stamp', 'coins'], rabat: ['salt', 'names', 'bell'], withers: ['silence', 'flag', 'purse'], spine: ['bells', 'wool', 'bundle'] };
(async () => {
  const b = await T.chromium.launch();
  const p = await T.openWorld(b, '?stage=25&god', {});
  const W = (f, a) => p.evaluate(f, a);
  await W(l => G.LANG.set(l), lang); await T.watchText(p);
  await T.settle(p, 200); await T.drain(p);
  let bad = 0;
  for (const [r, [npc, ...tr]] of Object.entries(LIST)) {
    await W(r => G.WORLD2.go(r, 'start', { now: true, force: true }), r); await T.settle(p, 200); await T.drain(p); await T.tick(p, 30);
    await W(() => G.WORLD2.syncPeople()); await T.tick(p, 5);
    const res = { region: r };
    const has = await W(id => !!G.world.ents.find(e => e._w2npc === 'folk_' + id && !e.dead), npc);
    res.npc = has;
    if (has) for (let k = 0; k < 2; k++) {
      await W(id => { const o = G.world.ents.find(e => e._w2npc === 'folk_' + id); const pl = G.world.player; pl.x = o.x - 20; pl.y = o.y; o.onUse(pl, o); }, npc);
      const log = []; await T.drain(p, log); res['talk' + k] = log.length;
      if (k === 0) res.sample = log[0];
    }
    for (const id of tr) {
      const g0 = await W(() => G.run.gold || 0);
      const ok = await W(id => { const o = G.world.ents.find(e => e.sid && String(e.sid).endsWith(id) && e.onUse); if (!o) return false; const pl = G.world.player; pl.x = o.x - 10; pl.y = o.y; o.onUse(pl, o); return true; }, id);
      const log = []; if (ok) await T.drain(p, log);
      await T.tick(p, 90);
      for (let i = 0; i < 10; i++) await W(() => { const pl = G.world.player; for (const e of G.world.ents) if (e.kind === 'pickup' || /Pickup|Gold/i.test(e.constructor.name)) { e.x = pl.x; e.y = pl.y - 4; } }), await T.tick(p, 6);
      const g1 = await W(() => G.run.gold || 0);
      res[id] = ok ? log.length + ' lines, +' + (g1 - g0) : 'MISSING';
      if (!ok) bad++;
    }
    // the moment: walk onto its spot
    const ev = EV[r];
    await W(id => { const q = G.level.w2.spots['ev_' + id]; if (!q) return; const pl = G.world.player; pl.x = q.x; pl.y = q.y; pl.vx = pl.vy = 0; }, ev);
    await T.tick(p, 20); const elog = []; await T.drain(p, elog);
    res.moment = elog.length;
    if (!elog.length) bad++;
    if (!res.npc) bad++;
    console.log(JSON.stringify(res));
  }
  const un = await T.untranslated(p);
  console.log(bad ? 'FAIL ' + bad : 'OK', 'errs', p._errs.slice(0, 5), 'untranslated', un);
  await b.close();
})();
