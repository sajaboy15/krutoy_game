// Hunts (89j): a plain contract (kill → reward) and a twist (meet the "monster" → spare). node test/s9_hunt.js
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang: 'ru' });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const ticks = n => W(n => { for (let i = 0; i < n; i++) { G.debugTick(1); for (const f of G.WORLD2.ticks) f(G.WORLD2.S()); } }, n);
  await W(() => { const s = G.HUNT.S(); s.taken.jackal = 1; s.taken.kiln = 1; s.tasted.jackal = 1; G.run.gold = 0; });
  const res = {};
  await W(() => G.WORLD2.go('rabat', 'start', { now: true, force: true })); await T.settle(p, 200); await T.drain(p, []);
  res.jackal = await W(() => { const e = G.world.enemies.find(x => x._hunt === 'jackal'); if (!e) return 'no target'; const elite = e.elite; e.hp = 0; e.dead = true; return { elite, hp: e.maxHp }; });
  await ticks(30);
  res.jackalDone = await W(() => [G.HUNT.S().done.jackal, G.run.gold]);
  await W(() => G.WORLD2.go('potters', 'start', { now: true, force: true })); await T.settle(p, 200); await T.drain(p, []);
  await W(() => { const e = G.world.enemies.find(x => x._hunt === 'kiln'); const pl = G.world.player; if (e) { pl.x = e.x - 60; pl.y = e.y; } });
  await ticks(30);
  await T.drain(p, [], { pick: o => { const i = o.findIndex(x => /Уйти|Walk away/.test(x)); return i >= 0 ? i : null; } });
  res.kiln = await W(() => G.HUNT.S().done.kiln);
  console.log(JSON.stringify(res), p._errs.slice(0, 4), (await T.untranslated(p)).filter(s => !/^Level/.test(s)).slice(0, 5));
  await b.close();
})();
