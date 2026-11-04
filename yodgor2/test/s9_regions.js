// Region look check at 1920x1080: every region at evenly spaced spots along its length (before/after the dressing).
//   node test/s9_regions.js <tag> [region,...] [spots=5]       pictures: $YODGOR_SHOTS/reg_<tag>_<region>_<pct>.png
const T = require('./s5_lib');
const tag = process.argv[2] || 'now';
const ALL = ['tail', 'potters', 'bazaar', 'karez', 'rabat', 'tower', 'ark', 'cloister', 'mines', 'streets', 'cistern', 'old', 'spine', 'withers', 'well', 'heart', 'dream', 'wedding', 'sand', 'house'];
const only = (process.argv[3] || '').split(',').filter(Boolean);
const N = +(process.argv[4] || 5);
(async () => {
  const b = await T.chromium.launch();
  const p = await T.openWorld(b, '?stage=25&god', { viewport: { width: 1920, height: 1080 } });
  const W = (f, a) => p.evaluate(f, a);
  await T.settle(p, 200); await T.drain(p);
  await W(() => { const s = G.WORLD2.S(); for (const k of ['light', 'hook', 'water', 'breath']) s.keys[k] = 1; G.WORLD2.setHour && G.WORLD2.setHour(+(process.env.HOUR || 10)); });
  const stats = {};
  for (const r of ALL) {
    if (only.length && !only.includes(r)) continue;
    await W(r => G.WORLD2.go(r, 'start', { now: true, force: true }), r); await T.settle(p, 200); await T.drain(p); await T.tick(p, 30);
    await W(() => { const c = G.UI._debug().card; if (c) c.t = 9999; }); await T.tick(p, 20);
    stats[r] = await W(() => { const L = G.level; return { pw: L.pw, ph: L.ph, decos: (L.decos || []).length, objects: (L.objects || []).length, dress: L.w2dress ? L.w2dress.n : 0 }; });
    for (let i = 0; i < N; i++) {
      const f = (i + 0.5) / N;
      await W(f => {
        const L = G.level, pl = G.world.player, d = G.WORLD2.regions[G.WORLD2.active];
        pl.x = Math.max(80, Math.min(L.pw - 80, L.pw * f));
        const y0 = d && d.outdoor === false ? Math.max(16, L.spawn.y - 8 * 16) : 16;
        pl.y = L.groundBelow(pl.x, y0, 4000) || L.spawn.y; pl.vx = pl.vy = 0;
        for (const e of G.world.enemies) if (Math.abs(e.x - pl.x) < 90) e.x += 160;
        G.cam.snap(pl.x, pl.y - 40);
      }, f);
      await T.tick(p, 40); await T.drain(p);
      await T.shot(p, `reg_${tag}_${r}_${Math.round(f * 100)}`);
    }
  }
  console.log(JSON.stringify(stats), p._errs.slice(0, 5));
  await b.close();
})();
