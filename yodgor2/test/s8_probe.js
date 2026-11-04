// Stage 8a probe: boss numbers at each lair (maxHp, dmg, hero hp, arena, phases).  node test/s8_probe.js [pi,...]
const L = require('./s8_lib');
const PIS = (process.argv[2] || '1,5,9,12,16,23,31').split(',').map(Number);
(async () => {
  const b = await L.chromium.launch();
  for (const pi of PIS) {
    const p = await L.lair(b, pi, {});
    const r = await p.evaluate(() => { const bz = G.Game.boss, A = G.BossKit.arena(), pl = G.world.player;
      return bz ? { id: bz.def.id, maxHp: Math.round(bz.maxHp), dmg: +bz.dmg.toFixed(1), heroHp: pl.maxHp, mode: bz.mode, phaseAt: bz.phaseAt, w: bz.w, h: bz.h, arena: [Math.round(A.x0), Math.round(A.x1), Math.round(A.floor)], plats: G.BossKit.plats().map(q => [Math.round(q.x0 || q.x), Math.round(q.y), Math.round(q.w || 0)]), hpMul: G.diff.hpMul, dmgMul: G.diff.dmgMul } : 'noboss'; });
    console.log(pi, JSON.stringify(r), JSON.stringify(p._arm), p._errs.slice(0, 3));
    await p.close();
  }
  await b.close();
})();
