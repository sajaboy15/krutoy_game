// Stage 7: frame-time cost of three companions (same land, same spot, enemies removed, rAF off),
// and the cost of the companions' own update + draw measured inside the frame.   node test/s7_perf.js
const L = require('./s7_lib');
(async () => {
  const b = await L.chromium.launch();
  const out = {};
  for (const party of ['', '&party=alp,nargiza,surayyo']) {
    const p = await L.open(b, '?stage=3&god' + party);
    await L.tick(p, 30); await L.drain(p);
    out[party ? 'party' : 'solo'] = await p.evaluate(() => {
      window.requestAnimationFrame = () => 0;
      for (const e of G.world.enemies) e.dead = true;
      G.debugTick(30);
      const C = G.PARTY._px.Comp.prototype, u0 = C.update, d0 = C.draw; let own = 0;
      C.update = function () { const t = performance.now(); const r = u0.apply(this, arguments); own += performance.now() - t; return r; };
      C.draw = function () { const t = performance.now(); const r = d0.apply(this, arguments); own += performance.now() - t; return r; };
      const T = []; for (let r = 0; r < 5; r++) { const t0 = performance.now(); for (let i = 0; i < 60; i++) G.debugTick(1); T.push((performance.now() - t0) / 60); }
      C.update = u0; C.draw = d0;
      T.sort((a, b) => a - b);
      return { msPerFrame: +T[2].toFixed(2), companionsMsPerFrame: +(own / 300).toFixed(3), actors: G.PARTY._px.actors().length };
    });
    await p.close();
  }
  console.log(JSON.stringify(out));
  await b.close();
})();
