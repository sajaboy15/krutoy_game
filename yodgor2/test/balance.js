// For each boss: HP after scaling, and how many hits a typical and a min-maxed build need.
// (Stage 3: attributes replaced the red/purple/green scrolls; the old "all-red" build is now all points in
// Strength with a +5 masterwork heavy crossbow — the "shotgun" of the old complaint. No hit may exceed 8%.)
const L = require('./s3_lib');
(async () => {
  const b = await L.chromium.launch(); const rows = [];
  const idx = [1, 5, 9, 12, 16, 20, 23, 31];
  const LVL = { 1: 3, 5: 7, 9: 9, 12: 11, 16: 14, 20: 16, 23: 17, 31: 24 };
  for (const diff of ['normal', 'hard']) for (const pi of idx) {
    const p = await L.open(b, '');
    p.setDefaultTimeout(600000);
    await L.tick(p, 30);
    const r = await p.evaluate(async ([pi, diff, lvl]) => {
      G.Game.startRun({ mode: 'wanderer' }); G.run.diffLevel = diff;
      G.Game.loadStage(pi);
      await new Promise(r => setTimeout(r, 300));
      const pl = G.world.player; pl.x = 12 * 16; G.debugTick(5);
      const bz = G.Game.boss; if (!bz) return { pi, err: 'no boss' };
      const s = G.CH.S(), stage = G.run.stage;
      while (s.lvl < lvl) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp);
      const up = Math.min(5, Math.floor(stage / 1.8)), q = stage < 3 ? 0 : stage < 6 ? 1 : 2;
      const mk = (id, q2, up2) => G.YITEMS.makeInst({ id, u: -1, q: q2, up: up2, mods: [] });
      const out = { pi, diff, boss: bz.def.id, hp: Math.round(bz.maxHp), lvl: s.lvl, up, q };
      const cap = 0.08 * bz.maxHp;
      const builds = {
        typical: () => { const P = s.free; for (const [k, f] of [['agi', 0.45], ['str', 0.2], ['end', 0.35]]) for (let i = 0; i < Math.round(P * f); i++) G.CH.addPoint(k); },
        allStrength: () => { s.attr.str = 20; s.attr.agi = 20; G.CH.dirty(); }
      };
      for (const name in builds) {
        for (const k of ['str', 'agi', 'end', 'mem']) s.attr[k] = 3; s.free = 3 + s.lvl - 1; G.CH.dirty();
        if (name === 'allStrength') { while (s.lvl < 30) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp); }
        builds[name](); pl.syncStats(false);
        const sab = name === 'typical' ? mk('kylysh', q, up) : mk('yd_founder_sabre', 2, 5), xb = name === 'typical' ? mk('multuk', q, up) : mk('yd_heavy_xbow', 2, 5);
        const sv = G.Combat.playerDmg(sab, 11), gv = G.Combat.playerDmg(xb, 38) * 1.75;   // a crossbow crit
        out[name] = { sabreHit: Math.round(Math.min(sv, cap)), sabreHits: Math.ceil(bz.maxHp / Math.min(sv, cap)), xbowCritRaw: Math.round(gv), xbowShots: Math.ceil(bz.maxHp / Math.min(gv, cap)), playerHp: pl.maxHp, lvl: s.lvl };
      }
      out.bossDmgMul = +G.diff.dmgMul.toFixed(2);
      return out;
    }, [pi, diff, LVL[pi]]);
    rows.push(r); await p.close();
  }
  for (const r of rows) console.log(JSON.stringify(r));
  const bad = rows.filter(r => r.allStrength && r.allStrength.xbowShots < 13);
  console.log(bad.length ? 'TOO STRONG: ' + bad.map(r => r.boss).join(',') : 'no build kills a boss in under 13 blows');
  await b.close();
})();
