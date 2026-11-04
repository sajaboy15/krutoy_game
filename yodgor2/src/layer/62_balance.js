/* =====================================================================
   Balance (GDD ch. 18). Owned by stage 3 "Персонаж".
   The red/purple/green scrolls are gone: damage, health and stamina come
   from four attributes (Strength, Agility, Endurance, Memory), the level,
   the weapon (model power, quality, upgrade +1…+5, scaling letters) and
   the gear. Everything here is a pure formula; the state lives in G.CH
   (66_character.js), the items in 67_items.js.

   Rules enforced here:
   - attributes give diminishing returns: full to 10, 70% for 11–15, 40% for 16–20
   - no single hit takes more than 8% of a boss's health (legendary moves on a
     cooldown carry info.legend and may reach 14%)
   - damage reduction and status resistances never exceed 60%
   - enemies hit a little harder than the stock curve (GDD table), boss health
     multipliers by difficulty stay ≤ ×1.3 (20_modes.js)
   - tilla is scarce: ordinary enemies mostly drop nothing
   ===================================================================== */
// the character API is filled by 66_character.js; earlier files may already register saves and absorbs
G.CH = G.CH || { ready: false, lethalSaves: [], absorbs: [] };
const BAL = G.BAL = {
  // scaling letters: damage coefficient per effective attribute point
  LETTER: { S: 0.12, A: 0.095, B: 0.07, C: 0.045, D: 0.02 },
  ATTR_BASE: 0.5,          // weapon multiplier with every attribute at zero
  QUAL: [1, 1.08, 1.16, 1.25],
  UPG: 0.08,               // +8% base damage per upgrade level
  REQ_PEN: 0.6,            // damage ×0.6 when an attribute requirement is not met
  HIT_CAP: 0.08, LEGEND_CAP: 0.14,
  RES_CAP: 0.6,
  HP_BASE: 64, HP_END: 12, HP_LVL: 7,
  STAM_BASE: 80, STAM_END: 5, STAM_REGEN: 42, STAM_DELAY: 0.55,
  FLASK_HEAL: 0.35, FLASKS_BASE: 3,   // GDD: a flask mends 35%; three at the start, up to six
  ENEMY_DMG: 1.3,          // stock enemy damage ×1.3 → 13 at the start, ~50 at the end (GDD 12–18 → 45–60)
  // XP: GDD ch. 9 amounts × a content factor. This build has about a third of the fights of a 10-hour
  // game and the threshold 100·L^1.35 is steep, so combat and exploration XP grow with the stage
  // (×0.9 in the prologue → ×5.9 at the end). Simulated over the plan (s3_levels.js): prologue L2–3,
  // end of Act I L10–11, Albasty L14, end of Act II L18–20, finale L24; split 57 / 34 / 8.
  xpContent: stage => 0.9 + 0.5 * (stage || 0),
  POISE: { staff: 1.7, shield: 1.35, sabre: 0.9, knife: 0.55, ranged: 0.6, dutar: 0.75, focus: 0.6 },
  eff(n) {
    n = Math.max(0, Math.min(20, n || 0));
    return Math.min(n, 10) + 0.7 * Math.max(0, Math.min(n, 15) - 10) + 0.4 * Math.max(0, n - 15);
  },
  attrMul(scal, at) {
    let m = BAL.ATTR_BASE;
    for (const k in scal || {}) m += (BAL.LETTER[scal[k]] || 0) * BAL.eff(at[k]);
    return m;
  },
  // level threshold: XP needed to go from level L to L+1 (GDD: 100 · L^1.35)
  xpNeed: L => Math.round(100 * Math.pow(L, 1.35)),
  skillMul(lvl, mem) { return (0.85 + 0.07 * (lvl - 1)) * (0.85 + 0.035 * BAL.eff(mem)); }
};

{
  const CHx = () => G.CH && G.CH.ready ? G.CH : null;

  /* ---------- weapon damage ---------- */
  G.Combat.playerDmg = function (item, base) {
    if (!item || !item.def) return base;
    const d = item.def, ch = CHx();
    let v = base * (d.dmgMul || 1);
    if (!G.run || !ch) return v;
    const at = ch.attrs(), meta = d.yd;
    if (meta && meta.scal) {
      v *= (meta.power || 1) * BAL.QUAL[item.q || 0] * (1 + BAL.UPG * (item.up || 0)) * BAL.attrMul(meta.scal, at);
      if (meta.skill) v *= 1 + 0.045 * (ch.level() - 1);   // techniques grow with the yodchi, weapons with the smith
      if (ch.reqShort(item)) v *= BAL.REQ_PEN;
    } else {
      // skills and stock items without our metadata: level and Memory
      v *= BAL.skillMul(ch.level(), at.mem) * (1 + 0.06 * (item.tier || 0));
    }
    return v;
  };

  /* ---------- health ---------- */
  G.MAXHP = () => {
    const ch = CHx();
    if (!ch) return 100;
    const at = ch.attrs();
    return Math.round(BAL.HP_BASE + BAL.HP_END * BAL.eff(at.end) + BAL.HP_LVL * (ch.level() - 1) + ch.gearStat('hp'));
  };

  /* ---------- the 8% rule ---------- */
  const B = G.Boss && G.Boss.prototype;
  if (B) {
    const take0 = B.takeHit;
    B.takeHit = function (e) {
      if (e && e.src && e.src.faction === 'player' && this.maxHp > 0) {
        const cap = (e.legend ? BAL.LEGEND_CAP : BAL.HIT_CAP) * this.maxHp / (e.partMul === undefined ? 1 : Math.max(0.05, e.partMul));
        if (e.dmg > cap) { e = Object.assign({}, e, { dmg: cap, capped: true }); }
        // a staggered boss is open: +25% (still under the cap)
        if (this._open > 0 && !e.capped) e = Object.assign({}, e, { dmg: Math.min(cap, e.dmg * 1.25) });
      }
      const ok = take0.call(this, e);
      if (ok && e && e.src && e.src.faction === 'player') { try { BAL.poiseHit(this, e); } catch (x) { /* ignore */ } }
      return ok;
    };
    const up0 = B.update;
    B.update = function () {
      if (this._open > 0) { this._open--; if (G.frame % 6 === 0 && !this.dead) G.FX.spawn({ x: this.x + G.U.rand(-12, 12), y: this.top - 4, life: 16, shape: 'star', size: 2, color: '#ffe066', glow: true }); }
      if (this._poise > 0 && !(this._open > 0)) this._poise = Math.max(0, this._poise - this.maxHp * 0.0004);
      return up0.apply(this, arguments);
    };
  }
  // boss equilibrium: heavy weapons break it; a broken boss is open for 3 s (slowed, +25% damage taken)
  BAL.poiseHit = function (b, e) {
    if (b.dead || b._open > 0) return;
    const it = e.item, cat = it && it.def && it.def.yd && it.def.yd.cat;
    let k = (BAL.POISE[cat] || 0.6) * (e.heavy ? 1.6 : 1) * (e.poiseMul || 1);
    try { k = G.Perks.mod('poiseOut', k, e, b); } catch (x) { /* ignore */ }
    b._poise = (b._poise || 0) + e.dmg * k;
    if (b._poise >= b.maxHp * 0.16) BAL.breakBoss(b);
  };
  BAL.breakBoss = function (b) {
    b._poise = 0; b._open = 180;
    try { b.addStatus('slow', { t: 150 }); } catch (x) { /* ignore */ }
    G.FX.ring(b.x, b.cy, 6, 60, '#ffe066', 20, { width: 3 });
    G.FX.text(b.x, b.top - 14, t(`Off balance!|Равновесие сбито!|Muvozanatdan chiqdi!`), '#ffe066', { size: 8 });
    G.shake(0.4); G.hitstop(8);
    if (G.Audio) G.Audio.sfx('parry');
    G.Events.emit('bossBroken', b);
  };

  /* ---------- enemy damage curve (difficulty stays in 20_modes.js) ---------- */
  const adj0 = G.ADJUST_DIFF;
  G.ADJUST_DIFF = function (diff, run) {
    if (adj0) adj0.apply(this, arguments);
    diff.dmgMul *= BAL.ENEMY_DMG;
  };

  /* ---------- tilla is scarce ---------- */
  let goldCtx = null;
  const E0 = G.Enemy && G.Enemy.prototype;
  if (E0) {
    const die0 = E0.die;
    E0.die = function () {
      if (this.dead) return die0.apply(this, arguments);
      const prev = goldCtx; goldCtx = this.isBoss ? 'boss' : this.elite ? 'elite' : 'enemy';
      try { return die0.apply(this, arguments); } finally { goldCtx = prev; }
    };
  }
  {
    const ub0 = G.Game.updateBossStage;
    G.Game.updateBossStage = function () { const prev = goldCtx; goldCtx = 'boss'; try { return ub0.apply(this, arguments); } finally { goldCtx = prev; } };
  }
  const gold0 = G.Pickups.gold;
  G.Pickups.gold = function (x, y, n) {
    const st = G.run ? G.run.stage : 0, R2 = Math.random();
    if (goldCtx === 'enemy') n = R2 < 0.65 ? 0 : R2 < 0.9 ? 1 + (Math.random() < 0.5 ? 1 : 0) : 3;
    else if (goldCtx === 'elite') n = 10 + Math.round(Math.random() * 15 * (0.6 + 0.04 * st));
    else if (goldCtx === 'boss') n = 150 + Math.round(8 * st) + Math.round(Math.random() * 20);   // GDD: 150–250
    else n = Math.round(n * 0.55);                     // chests, urns, story drops
    if (n <= 0) return;
    return gold0.call(this, x, y, n);
  };
  BAL.goldCtx = v => { goldCtx = v; };
}
