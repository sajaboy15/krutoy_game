// Companions on the karez ladders: the hero climbs a ladder (up, then back down); the companions must climb it too
// (PX.climbs) instead of catching up by teleport (PX.teleports).      node test/s7_ladder.js [region=karez] [n=3]
const T = require('./s6_lib');
const region = process.argv[2] || 'karez', N = +(process.argv[3] || 3);
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region, lang: 'en', party: 'alp,nargiza,surayyo' });
  await T.tick(p, 30); await T.drain(p, []);
  const r = await T.W(p, N => {
    const L = G.level, LD = G.T.LADDER, TS = G.TS, cols = [];
    // ladder columns: runs of >= 5 ladder tiles with floor at the bottom
    for (let tx = 2; tx < L.w - 2; tx++) { let run = 0; for (let ty = 1; ty < L.h - 1; ty++) { if (L.get(tx, ty) === LD) run++; else { if (run >= 5 && L.get(tx, ty) === G.T.SOLID) cols.push({ tx, top: ty - run, bot: ty }); run = 0; } } }
    const out = { ladders: cols.length, tries: [] };
    for (const e of G.world.enemies) e.dead = true;
    const pl = G.world.player, PX = G.PARTY._px;
    for (const c of cols.slice(0, N)) {
      const x = c.tx * TS + 8, yb = c.bot * TS, yt = c.top * TS;
      // stand at the bottom with the party
      pl.x = x - 20; pl.y = yb; pl.vx = pl.vy = 0; PX.trail.length = 0;
      for (const a of PX.actors()) { a.x = x - 40 - Math.random() * 30; a.y = yb; a.vx = a.vy = 0; a.climbing = null; a.stuckT = 0; a.offT = 0; }
      for (let i = 0; i < 60; i++) G.debugTick(1);
      const tp0 = PX.teleports || 0, cl0 = PX.climbs || 0;
      // the hero walks onto the ladder and climbs (moved by hand: 2 px a frame), then steps off at the top
      pl.x = x; for (let y = yb; y > yt - 2; y -= 2) { pl.y = y; pl.vx = 0; pl.vy = 0; pl.onGround = false; G.debugTick(1); }
      const side = L.get(c.tx + 1, c.top) === G.T.AIR ? 1 : -1;
      pl.y = yt; for (let i = 0; i < 40; i++) { pl.x += side * 1; pl.y = L.groundBelow(pl.x, yt - 20, 60) || yt; pl.vy = 0; pl.onGround = true; G.debugTick(1); }
      for (let i = 0; i < 420; i++) { G.debugTick(1); if (PX.actors().every(a => Math.abs(a.y - pl.y) < 20 && Math.abs(a.x - pl.x) < 90)) break; }
      out.tries.push({ h: yb - yt, up: PX.actors().map(a => Math.round(pl.y - a.y)).join(','), climbs: (PX.climbs || 0) - cl0, teleports: (PX.teleports || 0) - tp0 });
    }
    return out;
  }, N);
  console.log(JSON.stringify(r), p._errs.slice(0, 3));
  await b.close();
})();
