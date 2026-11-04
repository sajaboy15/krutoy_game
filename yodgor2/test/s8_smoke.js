// Stage 8a smoke: each lair, a god-mode hero standing near the boss; the boss is pushed through its phases.
// Prints the moves started per phase and any page errors.   node test/s8_smoke.js [pi,...] [framesPerPhase]
const L = require('./s8_lib');
const PIS = (process.argv[2] || '1,5,9,12,16,23,31').split(',').map(Number);
const N = +(process.argv[3] || 2400);
(async () => {
  const b = await L.chromium.launch();
  for (const pi of PIS) {
    const p = await L.lair(b, pi, {});
    const r = await p.evaluate(N => {
      const bz = G.Game.boss, pl = G.world.player, out = { id: bz.def.id, ph: {} };
      const n0 = G.BM.log.length;
      for (let ph = 1; ph <= bz.nPhases; ph++) {
        if (ph > 1) { bz.hp = bz.maxHp * bz.phaseAt[ph - 2] - 1; }
        for (let i = 0; i < N; i += 10) { G.debugTick(10); if (G.UI._debug().modal) G.UI._debug().modal = null; if (Math.abs(pl.x - bz.x) > 160) pl.x += Math.sign(bz.x - pl.x) * 20; if (bz.dead || bz.mode === 'dying') break; }
        const L2 = G.BM.log.slice(n0).filter(e => e.ev === 'start' && e.ph === ph && e.id === bz.def.id);
        out.ph[ph] = {}; for (const e of L2) out.ph[ph][e.mv] = (out.ph[ph][e.mv] || 0) + 1;
      }
      out.phaseNow = bz.phase; out.mode = bz.mode; out.evs = G.BM.log.slice(n0).filter(e => e.ev !== 'start' && e.ev !== 'end' && e.ev !== 'ready').map(e => e.mv + ':' + e.ev).slice(0, 12);
      return out;
    }, N);
    console.log(pi, JSON.stringify(r), p._errs.slice(0, 4));
    await p.close();
  }
  await b.close();
})();
