// Stage 4 — frame time: the linear campaign (with and without the world layer: run twice with two builds)
// and the open-world regions. Each sample = one update + one render (G.debugTick(1)), the page's own loop stopped.
//   YODGOR_OUT=<build> node test/s4_perf.js [linear|world]
const L = require('./s4_lib');
const what = process.argv[2] || 'linear';
async function meas(p, n) {
  return p.evaluate(n => {
    const pl = G.world.player, ts = [];
    for (let i = 0; i < n; i++) { pl.x = Math.min(G.level.pw - 200, pl.x + 3); const t0 = performance.now(); G.debugTick(1); ts.push(performance.now() - t0); }
    ts.sort((a, b) => a - b);
    return { med: +ts[n >> 1].toFixed(2), p90: +ts[Math.floor(n * 0.9)].toFixed(2), mean: +(ts.reduce((a, b) => a + b, 0) / n).toFixed(2) };
  }, n);
}
(async () => {
  const b = await L.chromium.launch();
  const out = {};
  if (what === 'linear') {
    for (const st of [3, 7, 14]) {
      const p = await L.openWorld(b, '?stage=' + st + '&god', { liveRaf: false });
      await L.tick(p, 120);
      await p.evaluate(() => { for (let i = 0; i < 20; i++) { const m = G.UI._debug().modal; if (!m) break; m.picked = true; G.debugTick(30); } });
      await meas(p, 30);
      out['stage' + st] = await meas(p, 240);
      out.world = await p.evaluate(() => !!G.WORLD2);
      await p.close();
    }
  } else {
    const p = await L.openWorld(b, '?world=tail&god', { liveRaf: false });
    await L.settle(p);
    for (const r of ['tail', 'potters', 'bazaar', 'karez']) {
      await p.evaluate(r => G.WORLD2.go(r, 'start', { now: true }), r); await L.settle(p);
      await meas(p, 30);
      out[r] = await meas(p, 240);
      out[r].loadMs = await p.evaluate(() => G.WORLD2.stats.lastLoadMs);
    }
  }
  console.log(JSON.stringify(out));
  await b.close();
})();
