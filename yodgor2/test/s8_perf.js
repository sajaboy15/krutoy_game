// Stage 8a: boss draw cost (draw + drawFx of the boss and of everything it owns) and whole-frame time during the fight.
// Run against a build dir: YODGOR_OUT=<dir> node test/s8_perf.js [pi,...]   (compare the old build with the new one)
const L = require('./s8_lib');
const PIS = (process.argv[2] || '1,5,9,12,16,23,31').split(',').map(Number);
(async () => {
  const b = await L.chromium.launch();
  for (const pi of PIS) {
    const p = await L.lair(b, pi, {});
    const r = await p.evaluate(() => {
      window.requestAnimationFrame = () => 0;
      const bz = G.Game.boss, pl = G.world.player;
      let own = 0;
      const wrap = (o, k) => { const f = o[k]; o[k] = function () { const t = performance.now(); try { return f.apply(this, arguments); } finally { own += performance.now() - t; } }; return () => { o[k] = f; }; };
      const un = [wrap(bz, 'draw'), wrap(bz, 'drawFx')];
      const Ent = G.Entity.prototype; const ownedDraw = Ent.drawFx;
      const T = [];
      for (let r = 0; r < 6; r++) {
        const t0 = performance.now();
        for (let i = 0; i < 60; i++) { G.debugTick(1); pl.hp = pl.maxHp; if (Math.abs(pl.x - bz.x) > 140) pl.x += Math.sign(bz.x - pl.x) * 10; if (G.UI._debug().modal) G.UI._debug().modal = null; }
        T.push((performance.now() - t0) / 60);
      }
      un.forEach(f => f()); void ownedDraw;
      T.sort((a, c) => a - c);
      return { id: bz.def.id, msPerFrame: +T[3].toFixed(2), bossDrawMs: +(own / 360).toFixed(3) };
    });
    console.log(pi, JSON.stringify(r), p._errs.slice(0, 2));
    await p.close();
  }
  await b.close();
})();
