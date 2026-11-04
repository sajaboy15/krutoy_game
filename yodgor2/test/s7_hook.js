// Companions follow the hero up the hook line (W2.zip) instead of being teleported: every hook ring of a region.
//   node test/s7_hook.js [region=rabat]
const T = require('./s6_lib');
const region = process.argv[2] || 'rabat';
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region, lang: 'en', party: 'alp,nargiza,surayyo' });
  await T.tick(p, 30); await T.drain(p, []);
  const r = await T.W(p, () => {
    const W2 = G.WORLD2, PX = G.PARTY._px, pl = G.world.player, L = G.level, out = [];
    W2.S().keys.hook = 1;
    for (const e of G.world.enemies) e.dead = true;
    for (let x = 60; x < L.pw - 60 && out.length < 3; x += 24) {
      pl.x = x; pl.y = L.groundBelow(x, 20, 4000) || pl.y; pl.vx = pl.vy = 0; pl.onGround = true;
      if (!W2.ringInReach()) continue;
      for (const c of PX.actors()) { c.x = pl.x - 30; c.y = pl.y; c.vx = c.vy = 0; c.zipF = null; c.stuckT = 0; c.offT = 0; }
      for (let i = 0; i < 30; i++) G.debugTick(1);
      if (!W2.ringInReach()) continue;
      const tp0 = PX.teleports || 0, z0 = PX.zips || 0, y0 = pl.y;
      W2.useHook();
      for (let i = 0; i < 240; i++) { G.debugTick(1); if (!pl._zip && PX.actors().every(c => !c.zipF)) break; }
      for (let i = 0; i < 60; i++) G.debugTick(1);
      out.push({ x, rise: Math.round(y0 - pl.y), zips: (PX.zips || 0) - z0, teleports: (PX.teleports || 0) - tp0, dy: PX.actors().map(c => Math.round(c.y - pl.y)).join(',') });
      x += 300;
    }
    return out;
  });
  console.log(JSON.stringify(r), p._errs.slice(0, 3));
  await b.close();
})();
