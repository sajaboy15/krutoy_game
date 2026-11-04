// Stage 8a: every move of every redesigned boss is forced once (in its own phase) and must start AND end with no page
// error. God-mode hero kept near the boss.   node test/s8_moves.js [pi,...]
const L = require('./s8_lib');
const PIS = (process.argv[2] || '1,5,9,12,16,23,31').split(',').map(Number);
(async () => {
  const b = await L.chromium.launch();
  let bad = 0;
  for (const pi of PIS) {
    const p = await L.lair(b, pi, {});
    const r = await p.evaluate(() => {
      const bz = G.Game.boss, pl = G.world.player, S = G.BM.specs[bz.def.id], out = { id: bz.def.id, ok: [], miss: [] };
      const orig = {}; for (const k in S.moves) orig[k] = Object.assign({}, S.moves[k]);
      const names = Object.keys(S.moves).filter(k => k !== 'def0').sort((a, c) => (orig[a].ph || 1) - (orig[c].ph || 1));
      const ph3 = (v, ph) => Array.isArray(v) ? v[Math.min(v.length, ph) - 1] : v;
      for (const name of names) {
        const ph = Math.min(bz.nPhases, Math.max(bz.phase, orig[name].ph || 1));
        if (ph > bz.phase) { bz.hp = bz.maxHp * bz.phaseAt[ph - 2] - 1; for (let i = 0; i < 900 && (bz.phase < ph || bz.mode !== 'fight'); i++) G.debugTick(1); }
        for (const k in S.moves) { Object.assign(S.moves[k], orig[k]); if (k !== name) S.moves[k].ok = () => false; }
        const m = S.moves[name]; m.ok = null; m.range = null; m.until = 0; m.ph = 1; m.w = 1; m.cd = 0;
        if (!ph3(orig[name].open, bz.phase)) m.open = 30;
        bz.data.cd = {};
        const n0 = G.BM.log.length; let st = false, en = false;
        for (let i = 0; i < 3000 && !en; i += 5) {
          G.debugTick(5); if (G.UI._debug().modal) G.UI._debug().modal = null;
          if (Math.abs(pl.x - bz.x) > 90) pl.x += Math.sign(bz.x - pl.x) * 10;
          bz.hp = Math.max(bz.hp, bz.maxHp * 0.02);
          for (const e of G.BM.log.slice(n0)) if (e.mv === name && e.id === bz.def.id) { if (e.ev === 'start') st = true; if (e.ev === 'end' && st) en = true; }
          if (bz.dead) break;
        }
        (st && en ? out.ok : out.miss).push(name + '@' + bz.phase + (st && !en ? '(no end)' : ''));
      }
      for (const k in S.moves) Object.assign(S.moves[k], orig[k]);
      return out;
    });
    if (r.miss.length || p._errs.length) bad++;
    console.log(pi, JSON.stringify(r), JSON.stringify(p._errs.slice(0, 4)));
    await p.close();
  }
  await b.close();
  console.log(bad ? 'FAIL ' + bad : 'PASS');
})();
