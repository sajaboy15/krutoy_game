// Stage 8a: every move of every redesigned boss, forced one by one (god hero placed inside the move's range).
// Checks that each move starts, ends within 20 s, registers threats and throws no page error.
//   node test/s8_moves.js [pi,...]
const L = require('./s8_lib');
// moves that never strike by themselves (summons, buffs, darkness, pools, the chain strain)
const UTIL = ['shed', 'vultures', 'guard', 'howl', 'ink', 'blizzard', 'strain', 'eclipse'];
const PIS = (process.argv[2] || '1,5,9,12,16,23,31').split(',').map(Number);
(async () => {
  const b = await L.chromium.launch();
  let bad = 0;
  for (const pi of PIS) {
    const p = await L.lair(b, pi, {});
    const r = await p.evaluate(() => {
      const bz = G.Game.boss, pl = G.world.player, BM = G.BM, S = BM.specs[bz.def.id], A = G.BossKit.arena(), out = {};
      bz.def.phaseAt = [-1, -1];
      for (const name of Object.keys(S.moves)) {
        const m = S.moves[name], ph = m.ph || 1;
        try {
          if (bz.phase < ph) { bz.phase = ph; }
          const d = bz.data; d.mv = null; d.rec = 0; d.hold = null; bz.hp = bz.maxHp * 0.9;
          const rg = m.range || [40, 90], dx = Math.min(Math.max((rg[0] + Math.min(rg[1], 200)) / 2, 10), 200);
          pl.x = Math.max(A.x0 + 10, Math.min(A.x1 - 10, bz.x + (bz.x < A.cx ? dx : -dx))); pl.vx = 0;
          const th0 = BM.threats.length, h0 = BM.log.length;
          BM.start(bz, name);
          let f = 0;
          for (; f < 1200; f++) { pl.hp = pl.maxHp; G.debugTick(1); if (G.UI._debug().modal) G.UI._debug().modal = null; if (!d.mv && !d.hold) break; if (d.mv && d.mv !== name) break; }
          const evs = BM.log.slice(h0).filter(e => e.mv === name).map(e => e.ev);
          out[name] = { ph, frames: f, ended: f < 1200, threats: BM.threats.length - th0, evs: [...new Set(evs)].join(',') };
          for (let i = 0; i < 200 && (d.rec > 0 || d.hold); i++) G.debugTick(1);
        } catch (e) { out[name] = { err: String(e) }; }
      }
      return { id: bz.def.id, out };
    });
    for (const [k, v] of Object.entries(r.out)) if (v.err || !v.ended || (!v.threats && !UTIL.includes(k))) { bad++; console.log('  !', pi, k, JSON.stringify(v)); }
    console.log(pi, r.id, Object.entries(r.out).map(([k, v]) => k + ':' + (v.frames || 'x') + '/' + v.threats).join(' '), p._errs.slice(0, 3));
    if (p._errs.length) bad++;
    await p.close();
  }
  console.log(bad ? 'FAIL ' + bad : 'OK');
  await b.close();
})();
