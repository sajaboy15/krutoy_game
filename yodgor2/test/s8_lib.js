// Stage 8a (boss movesets) test helpers: open a lair (?stage=N), level and arm the hero like s3_bosses.js,
// walk in until the boss wakes, drain the scenes.  Output dir: YODGOR_OUT (build) / YODGOR_SHOTS (pictures).
const L = require('./s7_lib');
const LVL = { 1: 3, 5: 7, 9: 9, 12: 11, 16: 14, 20: 16, 23: 17, 31: 24 };
const MAIN = { sabre: ['agi', 'str'], staff: ['str', 'end'], knife: ['agi', 'str'], shield: ['str', 'end'], ranged: ['agi', 'str'], dutar: ['mem', 'agi'], focus: ['mem', 'agi'] };
const IDS = { 1: 'glutton', 5: 'kempir', 9: 'hound', 12: 'choir', 16: 'albasty', 20: 'seven', 23: 'barys', 31: 'aidahar' };

// level + attributes + region weapon of a category (same rules as s3_bosses.js)
async function arm(p, pi, cat) {
  return p.evaluate(([pi, cat, lvl, main]) => {
    const stage = G.run.stage, s = G.CH.S();
    while (s.lvl < lvl) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp);
    const P = s.free; const a1 = Math.min(17, Math.round(P * 0.6)), a2 = Math.min(17, Math.round(P * 0.15)), a3 = P - a1 - a2;
    for (let i = 0; i < a1; i++) G.CH.addPoint(main[0]); for (let i = 0; i < a2; i++) G.CH.addPoint(main[1]); for (let i = 0; i < a3; i++) G.CH.addPoint(main.includes('end') ? 'agi' : 'end');
    const W = G.YITEMS.W.map(id => G.Items.defs[id]).filter(d => d.yd.cat === cat && !d.noDrop && (d.minStage || 0) <= stage + 0.01);
    const at0 = G.CH.attrs(), meets = d => !d.yd.req || Object.keys(d.yd.req).every(k => (at0[k] || 0) >= d.yd.req[k]);
    const pick = sub => W.filter(d => (sub ? d.yd.sub === sub : d.yd.sub !== 'shield') && meets(d)).sort((x, y) => y.yd.tier - x.yd.tier || y.yd.power - x.yd.power)[0];
    const m0 = cat === 'shield' ? pick('mace') : cat === 'ranged' ? (pick('crossbow') && pick('bow') && pick('crossbow').yd.tier > pick('bow').yd.tier ? pick('crossbow') : pick('bow') || pick(null)) : pick(null);
    const up = Math.min(5, Math.floor(stage / 1.8 + 0.4)), q = stage < 3 ? 0 : stage < 6 ? 1 : 2;
    const e = G.CH.give(m0.id, { q, up, quiet: true }); G.YITEMS.equip(e.u, 'attack');
    if (cat === 'shield') { const sh = pick('shield'); const e2 = G.CH.give(sh.id, { q, up, quiet: true }); G.YITEMS.equip(e2.u, 'secondary'); }
    G.CH.dirty(); const pl = G.world.player; pl.syncStats(false); pl.hp = pl.maxHp;
    return { lvl: s.lvl, weapon: m0.id + ' q' + q + ' +' + up, hp: pl.maxHp };
  }, [pi, cat, LVL[pi], MAIN[cat]]);
}

// open the lair, arm, wake the boss; returns the page (boss in 'intro' or 'fight')
async function lair(b, pi, o = {}) {
  const p = await L.open(b, '?stage=' + pi + (o.god === false ? '' : '&god') + (o.party ? '&party=' + o.party : ''), { hd: !!o.hd });
  p.on('crash', () => console.log('CRASH', pi));
  await L.tick(p, 40); await L.drain(p);
  p._arm = await arm(p, pi, o.cat || 'sabre');
  for (let i = 0; i < 160; i++) { if (await p.evaluate(() => !!G.Game.stage.bossStarted)) break; await p.evaluate(() => { G.world.player.x += 8; }); await L.tick(p, 2); }
  await L.tick(p, 10); await L.drain(p);
  // skip the intro card quickly
  await p.evaluate(() => { const bz = G.Game.boss; if (bz) for (let i = 0; i < 400 && bz.mode === 'intro'; i++) G.debugTick(1); });
  await L.drain(p);
  if (o.god === false) await p.evaluate(() => { G.godMode = false; });
  return p;
}
module.exports = Object.assign({}, L, { LVL, MAIN, IDS, arm, lair });
