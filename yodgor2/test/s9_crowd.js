// The crowd (89t) and bigger regions (89s): people by region and hour, they walk, talk, and leave when a fight starts. node test/s9_crowd.js
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang: process.env.LANG2 || 'ru' });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const ticks = n => W(n => { for (let i = 0; i < n; i++) { G.debugTick(1); for (const f of G.WORLD2.ticks) f(G.WORLD2.S()); } }, n);
  const res = {};
  for (const [r, h] of [['bazaar', 11], ['bazaar', 22], ['ark', 11], ['tail', 9]]) {
    await W(([r, h]) => { G.WORLD2.setHour(h); G.WORLD2.go(r, 'start', { now: true, force: true }); }, [r, h]);
    await T.settle(p, 80); await T.drain(p, []);
    res[r + h] = await W(() => { const L = G.CROWD.live; const roles = {}; for (const o of L) roles[o._crowd] = (roles[o._crowd] || 0) + 1; return { n: L.length, roles: Object.keys(roles).length, w: Math.round(G.level.pw / 480) }; });
  }
  // they move
  const x0 = await W(() => G.CROWD.live.map(o => o.x));
  await ticks(120);
  res.moved = await W(x0 => G.CROWD.live.filter((o, i) => Math.abs(o.x - x0[i]) > 4).length, x0);
  // talk to someone who has something to say
  res.talk = await W(() => { const o = G.CROWD.live.find(o => o.interact); if (!o) return 'none'; o.onUse(G.world.player, o); return 'ok'; });
  await T.drain(p, []);
  // a fight nearby: they run
  res.flee = await W(() => {
    const o = G.CROWD.live[0], pl = G.world.player; pl.x = o.x; const e = G.Enemies.spawn('yd_hollow', o.x + 30, pl.y); e.aggro = true;
    const d0 = Math.abs(o.x - pl.x);
    for (let i = 0; i < 80; i++) for (const f of G.WORLD2.ticks) f(G.WORLD2.S());
    e.dead = true; return Math.round(Math.abs(o.x - pl.x) - d0);
  });
  console.log(JSON.stringify(res), p._errs.slice(0, 4), (await T.untranslated(p)).filter(s => !/^Level|^Talk/.test(s)).slice(0, 6));
  await b.close();
})();
