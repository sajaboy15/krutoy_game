// Region look audit: every open-world region at 1920x1080, at several spots along its full length, at a fixed hour.
//   node test/s9_regions.js <tag> [region,...] [hour]      pictures: $YODGOR_SHOTS/reg_<tag>_<region>_<pct>.png
// Also prints per region: width, decos (static/dynamic), lights on screen, mean screen brightness at each spot.
const T = require('./s5_lib');
const tag = process.argv[2] || 'now';
const ALL = ['tail', 'potters', 'bazaar', 'karez', 'rabat', 'tower', 'ark', 'cloister', 'mines', 'streets', 'cistern', 'old', 'spine', 'withers', 'well', 'heart', 'dream', 'wedding', 'sand', 'house'];
const ONLY = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3].split(',') : ALL;
const HOUR = +(process.argv[4] || 14);
const FR = [0.12, 0.37, 0.62, 0.88];
(async () => {
  const b = await T.chromium.launch();
  const p = await T.openWorld(b, '?stage=25&god', { viewport: { width: 1920, height: 1080 } });
  const W = (f, a) => p.evaluate(f, a);
  await T.settle(p, 200); await T.drain(p);
  await W(h => { const s = G.WORLD2.S(); for (const k of ['light', 'hook', 'water', 'breath']) s.keys[k] = 1; G.WORLD2.setHour && G.WORLD2.setHour(h); }, HOUR);
  const out = {};
  for (const r of ONLY) {
    if (!(await W(r => !!G.WORLD2.regions[r], r))) { console.log('no region', r); continue; }
    await W(r => G.WORLD2.go(r, 'start', { now: true, force: true }), r); await T.settle(p, 200); await T.drain(p); await T.tick(p, 30);
    await W(() => { const c = G.UI._debug().card; if (c) c.t = 9999; }); await T.tick(p, 20);
    const info = await W(() => { const L = G.level; const dec = L.decos || []; return { pw: L.pw, ph: L.ph, st: dec.filter(d => d.static).length, dyn: dec.filter(d => !d.static).length, biome: L.biome && L.biome.id }; });
    info.spots = [];
    for (const f of FR) {
      await W(([x]) => {
        const L = G.level, pl = G.world.player;
        pl.x = Math.max(80, Math.min(L.pw - 80, x));
        const d = G.WORLD2.regions[G.WORLD2.active], y0 = d && d.outdoor === false ? Math.max(16, L.spawn.y - 8 * 16) : 16;
        pl.y = L.groundBelow(pl.x, y0, 4000) || L.spawn.y; pl.vx = pl.vy = 0;
        for (const e of G.world.enemies) if (Math.abs(e.x - pl.x) < 120) e.x += 200;
        G.cam.snap(pl.x, pl.y - 40);
      }, [info.pw * f]);
      await T.tick(p, 50); await T.drain(p);
      const st = await W(() => {
        const c = document.querySelector('canvas'); const x = document.createElement('canvas'); x.width = 96; x.height = 54;
        const g = x.getContext('2d'); g.drawImage(c, 0, 0, 96, 54); const d = g.getImageData(0, 0, 96, 54).data; let s = 0, dark = 0;
        for (let i = 0; i < d.length; i += 4) { const l = .3 * d[i] + .59 * d[i + 1] + .11 * d[i + 2]; s += l; if (l < 20) dark++; }
        const cam = G.cam, near = (G.level.decos || []).filter(o => !o.static && Math.abs((o.x || 0) - (cam.x + 240)) < 300).length;
        return { lum: Math.round(s / (d.length / 4)), dark: +(dark / (d.length / 4)).toFixed(2), near };
      });
      info.spots.push(st);
      await T.shot(p, `reg_${tag}_${r}_${Math.round(f * 100)}`);
    }
    out[r] = info;
    console.log(r, JSON.stringify(info));
  }
  console.log('errs', JSON.stringify((p._errs || []).slice(0, 5)));
  await b.close();
})();
