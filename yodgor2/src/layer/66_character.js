/* =====================================================================
   The character (GDD ch. 9, 12, 14, 18): attributes, levels and XP,
   stamina, armour weight and the roll, resistances, checks, respec,
   the effect aggregator (skill nodes + Sado + gear + set bonuses), and
   how the gear shows on the hero.
   State: R().ch (inside the journey, so checkpoints and slots save it).
   API: G.CH (see the bottom of the file).
   ===================================================================== */
{
  const CH = G.CH; CH.ready = false;
  const ATTRS = ['str', 'agi', 'end', 'mem'];
  const ATTR_NAME = {
    str: `Strength|Сила|Kuch`, agi: `Agility|Ловкость|Chaqqonlik`, end: `Endurance|Стойкость|Chidamlilik`, mem: `Memory|Память|Xotira`
  };
  const ATTR_SHORT = { str: `STR|СИЛ|KCH`, agi: `AGI|ЛОВ|CHQ`, end: `END|СТК|CHD`, mem: `MEM|ПАМ|XTR` };
  CH.ATTRS = ATTRS; CH.ATTR_NAME = ATTR_NAME; CH.ATTR_SHORT = ATTR_SHORT;
  const MAXLVL = 30, ATTR_MAX = 20;
  const pl = () => (G.world && G.world.player) || null;
  const fr = () => G.frame || 0;

  /* ---------------------------------------------------------------- state */
  const blankCh = () => ({
    v: 1, lvl: 1, xp: 0, xpTotal: 0,
    attr: { str: 3, agi: 3, end: 3, mem: 3 }, free: 3,
    bonus: { str: 0, agi: 0, end: 0, mem: 0 },       // story gifts (never refunded by respec)
    sk: {},                                           // yodchi nodes: id -> rank
    inv: [], eq: {}, nextU: 1,
    respecUsed: 0, respecFreeUsed: false,
    landXp: {}, xpLog: { combat: 0, quest: 0, explore: 0 },
    legends: {}, stats0: null, voidAcc: 0, seen: {}
  });
  let seeding = false;
  function S() {
    const r = R();
    if (!r.ch || r.ch.v !== 1) {
      r.ch = blankCh();
      if (G.run && !seeding) { seeding = true; try { G.YITEMS && G.YITEMS.seed(r.ch); } catch (e) { console.error('[ch] seed', e); } finally { seeding = false; } }
      dirty();
    }
    return r.ch;
  }
  CH.S = S;

  /* ---------------------------------------------------------------- dirty / cache */
  let gen = 1, cache = { gen: 0 };
  function dirty() { gen++; }
  CH.dirty = dirty;
  function C0() {
    if (cache.gen === gen) return cache;
    cache = { gen };
    try { build(cache); } catch (e) { console.error('[ch] build', e); }
    return cache;
  }

  /* ---------------------------------------------------------------- attributes */
  CH.level = () => (G.run ? S().lvl : 1);
  function gearAttr(k) { return C0().attrGear ? C0().attrGear[k] || 0 : 0; }
  CH.attrs = () => {
    const c = C0();
    if (c.attrs) return c.attrs;
    const s = S(), a = {};
    for (const k of ATTRS) a[k] = clamp((s.attr[k] || 0) + (s.bonus[k] || 0) + gearAttr(k), 1, ATTR_MAX + 5);
    c.attrs = a;
    return a;
  };
  CH.attrBase = k => S().attr[k] || 0;
  CH.attrPoints = () => S().free;
  CH.addPoint = k => {
    const s = S();
    if (!ATTRS.includes(k) || s.free <= 0 || (s.attr[k] + s.bonus[k]) >= ATTR_MAX) return false;
    s.attr[k]++; s.free--; dirty(); save(); syncHp(true); return true;
  };
  // story gifts: G.CH.addAttr('str', 1)
  CH.addAttr = (k, n) => { const s = S(); if (!ATTRS.includes(k)) return; s.bonus[k] = (s.bonus[k] || 0) + (n || 1); dirty(); save(); syncHp(true); };
  CH.skillPoints = () => (S().lvl - 1) + (S().skBonus || 0) - Object.values(S().sk).reduce((a, b) => a + b, 0);
  function syncHp(grow) { try { const p = pl(); if (p && p.syncStats) p.syncStats(false); } catch (e) { /* ignore */ } void grow; }
  CH.syncHp = syncHp;

  /* ---------------------------------------------------------------- XP and levels */
  const XPK0 = () => BAL.xpContent(G.run ? G.run.stage : 0);
  CH.xpNeed = L => BAL.xpNeed(L);
  CH.addXp = (n, src) => {
    if (!G.run || R().ended || !n || n <= 0) return 0;
    const s = S();
    n = Math.round(n * G.Perks.mod('xp', 1));
    if (s.lvl >= MAXLVL) { s.xpTotal += n; return 0; }
    s.xp += n; s.xpTotal += n;
    const k = src === 'quest' ? 'quest' : src === 'explore' ? 'explore' : 'combat';
    s.xpLog[k] = (s.xpLog[k] || 0) + n;
    let up = 0;
    while (s.lvl < MAXLVL && s.xp >= CH.xpNeed(s.lvl)) { s.xp -= CH.xpNeed(s.lvl); s.lvl++; s.free++; up++; }
    if (s.lvl >= MAXLVL) s.xp = 0;
    if (up) {
      dirty(); syncHp(true);
      const p = pl(); if (p && !p.dead) p.heal(Math.round(p.maxHp * 0.25));
      toast(tf(`Level {n}! +1 attribute, +1 skill — [C] and [T]|Уровень {n}! +1 к атрибутам, +1 к умениям — [C] и [T]|{n}-daraja! +1 atribut, +1 mahorat ochkosi — [C] va [T]`, { n: s.lvl }), '#f2c14a');
      sfx('ready');
      try { G.FX.ring(p.x, p.cy, 6, 46, '#ffe7a6', 22, { width: 2 }); G.FX.burst(p.x, p.cy, 24, { speed: 3, life: 40, size: 2, size1: 0, color: '#ffd77a', glow: true }); } catch (e) { /* ignore */ }
      G.Events.emit('levelUp', s.lvl);
    }
    save();
    return n;
  };
  // story XP (GDD: quests 100–600). tier: 'minor' 100, 'normal' 250, 'major' 400, 'arc' 600, or a number.
  const QXP = { minor: 100, normal: 250, major: 400, arc: 600 };
  CH.questXp = (tier, why) => {
    const n = typeof tier === 'number' ? tier : QXP[tier] || 250;
    const s = S(), pi = SK();
    s.landXp[pi] = (s.landXp[pi] || 0) + n;
    if (why) toast(tf(`+{n} experience · {why}|+{n} опыта · {why}|+{n} tajriba · {why}`, { n, why: t(why) }), '#e8d8a8');
    return CH.addXp(n, 'quest');
  };
  // the region's story budget: what quests in this land are worth. Writers' questXp calls count toward it;
  // whatever they did not hand out is given when the land is left (so nothing is counted twice).
  const ACT_BUDGET = [100, 800, 2300, 6200];
  // pi: a plan index (the prologue) or a chapter id of the open city (G.STORY_ACT gives its act)
  CH.landBudget = pi => { if (typeof pi === 'string') { const a = G.STORY_ACT ? G.STORY_ACT(pi) : null; return a == null ? 0 : ACT_BUDGET[a] || 0; } const p = G.PLAN[pi]; if (!p || p.type !== 'level' || p.world) return 0; return ACT_BUDGET[p.act || 0] || 0; };
  function landDone(pi) {
    const s = S();
    if (s.seen['land' + pi]) return;
    s.seen['land' + pi] = 1;
    const rest = CH.landBudget(pi) - (s.landXp[pi] || 0);
    if (rest > 0) { CH.addXp(rest, 'quest'); toast(tf(`The land is behind you · +{n} experience|Земля пройдена · +{n} опыта|Bu yer ortda qoldi · +{n} tajriba`, { n: rest }), '#e8d8a8'); }
  }
  CH.landDone = landDone;
  // combat XP (GDD: ordinary 4–10, elite 25–40, mini-boss 150, boss 400–600) × content density
  CH.killXp = e => {
    if (!e || e.isBossPart) return 0;
    const mul = G.diff && G.diff.hpMul ? G.diff.hpMul : 1;
    const k = clamp(((e.maxHp || 30) / (e.elite ? 3.2 : 1) / mul - 20) / 120, 0, 1);
    if (e.isBoss) { const n = (G.run && G.run.bossesKilled ? G.run.bossesKilled.length : 0); return Math.round((400 + 200 * clamp(n / 7, 0, 1)) * XPK0()); }
    if (e.def && e.def.miniboss) return Math.round(150 * XPK0());
    return Math.round((e.elite ? 25 + 15 * k : 4 + 6 * k) * XPK0());
  };

  /* ---------------------------------------------------------------- derived stats */
  function build(c) {
    const s = S();
    // gear (67_items): attribute bonuses, armour, resistances, weight, flat stats, effect sources
    const g = G.YITEMS ? G.YITEMS.gearSummary(s) : { attr: {}, armor: 0, res: {}, weight: 0, flat: {}, effects: [] };
    c.attrGear = g.attr || {};
    c.gear = g;
    const fx = [];
    // skill nodes and Sado
    if (G.PROG && G.PROG.activeNodes) for (const [n, r] of G.PROG.activeNodes()) fx.push({ src: n, r });
    for (const e of g.effects || []) fx.push(e);
    c.fx = fx;
    c.mods = {}; c.on = {};
    for (const e of fx) {
      const n = e.src;
      if (n.mods) for (const k in n.mods) (c.mods[k] || (c.mods[k] = [])).push([n.mods[k], e.r || 1, e]);
      if (n.on) for (const k in n.on) (c.on[k] || (c.on[k] = [])).push([n.on[k], e.r || 1, e]);
    }
  }
  CH.gearStat = k => { const g = C0().gear; return g && g.flat ? g.flat[k] || 0 : 0; };
  CH.modList = k => C0().mods[k] || null;
  CH.onList = k => C0().on[k] || null;
  CH.effects = () => C0().fx;
  CH.armor = () => {                       // physical damage reduction 0..0.6
    const a = (C0().gear.armor || 0);
    return Math.min(BAL.RES_CAP, a / (a + 100));
  };
  CH.res = k => clamp(((C0().gear.res || {})[k] || 0) + G.Perks.mod('res_' + k, 0), 0, BAL.RES_CAP);
  CH.weight = () => C0().gear.weight || 0;
  const ROLL = {
    light: { name: `Light|Лёгкий|Yengil`, rollT: 18, rollSpd: 4.45, rollI: 15, rollCD: 14, cost: 16, poise: 0 },
    medium: { name: `Medium|Средний|O'rta`, rollT: 18, rollSpd: 4.1, rollI: 13, rollCD: 16, cost: 20, poise: 0.15 },
    heavy: { name: `Heavy|Тяжёлый|Og'ir`, rollT: 17, rollSpd: 3.25, rollI: 10, rollCD: 20, cost: 26, poise: 0.45 }
  };
  CH.ROLL = ROLL;
  CH.rollClass = () => { const w = CH.weight(); return w <= 10 ? 'light' : w <= 20 ? 'medium' : 'heavy'; };
  CH.rollStats = () => {
    const c = C0();
    if (c.roll) return c.roll;
    const b = ROLL[CH.rollClass()];
    const iF = Math.round(clamp(G.Perks.mod('rollI', b.rollI), 6, b.rollT));
    c.roll = Object.assign({}, b, { rollI: iF, cost: Math.round(G.Perks.mod('rollCost', b.cost)) });
    return c.roll;
  };
  CH.maxStam = () => {
    const c = C0();
    if (c.stamMax) return c.stamMax;
    const at = CH.attrs();
    c.stamMax = Math.round(G.Perks.mod('stamMax', BAL.STAM_BASE + BAL.STAM_END * BAL.eff(at.end) + CH.gearStat('stam')));
    return c.stamMax;
  };
  CH.critChance = () => clamp(G.Perks.mod('crit', 0.05 + 0.004 * BAL.eff(CH.attrs().agi)), 0, 0.6);
  CH.poise = () => clamp(CH.rollStats().poise + G.Perks.mod('poise', 0), 0, 0.85);
  CH.attackSpeed = () => 1 + 0.01 * BAL.eff(CH.attrs().agi); // display: Agility shortens windups a little
  CH.voidMagicMul = () => clamp(G.Perks.mod('voidMagic', 1) * (1 - 0.015 * BAL.eff(CH.attrs().mem)), 0.25, 2);
  // Hollowness from magic: fractional amounts are kept until they make a whole point
  CH.magicVoid = (n, why) => {
    const s = S(); const v = n * CH.voidMagicMul();
    s.voidAcc = (s.voidAcc || 0) + v;
    const whole = Math.floor(s.voidAcc + 1e-6);
    if (whole >= 1) { s.voidAcc -= whole; addVoid(whole, why || `a memory burned|сгорело воспоминание|bir xotira yonib ketdi`); }
    save();
  };
  // weapon attribute requirements
  CH.reqShort = item => {
    const req = item && item.def && item.def.yd && item.def.yd.req;
    if (!req || G.Perks.mod('noReq', 0) > 0) return null;
    const a = CH.attrs();
    for (const k in req) if ((a[k] || 0) < req[k]) return k;
    return null;
  };

  /* ---------------------------------------------------------------- effect aggregator */
  // Engine perks + buffs first, then nodes, Sado, gear, sets. dmgIn ends with the 60% cap and the lethal saves.
  const P0 = G.Perks;
  const mod0 = P0.mod, emit0 = P0.emit;
  P0.mod = function (name, base, a, b) {
    let v = mod0.apply(this, arguments);
    if (!G.run || R().ended) return v;
    try {
      const L = CH.modList(name);
      if (L) for (const [f, r] of L) v = f(v, a, b, r);
      if (name === 'dmgIn') v = finalIn(v, a);
      else if (name === 'heal') v *= BAL.FLASK_HEAL / 0.6;          // the engine heals 60%; GDD: a flask is 35%
    } catch (e) { console.error('[ch] mod ' + name, e); }
    return v;
  };
  P0.emit = function (ev, a, b) {
    const res = emit0.apply(this, arguments);
    if (!G.run || R().ended) return res;
    try {
      if (ev === 'onKill' && a) { const n = CH.killXp(a); if (n) CH.addXp(n, 'combat'); }
      const L = CH.onList(ev);
      if (L) for (const [f, r] of L) f(r, a, b);
    } catch (e) { console.error('[ch] emit ' + ev, e); }
    return res;
  };
  // armour, cap, absorbs, last-moment saves
  const saves = CH.lethalSaves; // fns(dmg, info, player) -> multiplier | null (Forty steps, Sado's pull, a charm)
  const absorbs = CH.absorbs;   // fns(dmg, info) -> damage left (wax ward, Forty steps window)
  function finalIn(v, info) {
    // physical armour applies to blows; statuses and traps go through resistances elsewhere
    if (!info || info.type !== 'trap') v *= 1 - CH.armor();
    v = Math.max(v, 1 - BAL.RES_CAP);                    // never more than 60% off
    const p = pl();
    if (!p || !info || !(info.dmg > 0)) return v;
    let dmg = info.dmg * v;
    for (const f of absorbs) { dmg = f(dmg, info); if (dmg <= 0) return 0; }
    if (p.hp - Math.round(dmg) <= 0 && !p.dead) {
      for (const f of saves) { const m = f(dmg, info, p); if (m != null) return m; }
    }
    return dmg / info.dmg;
  }

  /* ---------------------------------------------------------------- stamina */
  const ST = CH.st = { v: 100, lastUse: -99, lock: 0, flash: 0, shown: 1 };
  CH.stam = () => ST.v;
  CH.spend = (n, why) => {
    if (!G.run || G.godMode && CH.godStam) return true;
    n = Math.max(0, n);
    ST.v = Math.max(0, ST.v - n); ST.lastUse = fr();
    if (ST.v <= 0) { ST.lock = 60; ST.flash = 30; }
    void why;
    return true;
  };
  CH.canAct = () => ST.v > 0 && !(G.godMode && CH.godStam === false && 0);
  function stamTick(p) {
    const max = CH.maxStam();
    if (ST.v > max) ST.v = max;
    if (ST.lock > 0) ST.lock--;
    if (ST.flash > 0) ST.flash--;
    const busy = p.act && p.act.kind !== G.ItemKinds.shield;
    if (fr() - ST.lastUse > BAL.STAM_DELAY * 60 && !busy) ST.v = Math.min(max, ST.v + BAL.STAM_REGEN / 60 * G.Perks.mod('stamRegen', 1) * (p.act ? 0.4 : 1));
    if (ST.lock > 0 || ST.v <= 0) p.rollCD = Math.max(p.rollCD || 0, 2);
  }
  // weapon / skill costs
  CH.costOf = (item, heavy) => {
    const d = item && item.def; if (!d) return 0;
    if (d.slot === 'skill') return 0;
    let c = d.yd && d.yd.st != null ? d.yd.st : d.kind === 'shield' ? 6 : d.kind === 'bow' ? 8 : d.kind === 'sling' ? 9 : d.kind === 'gun' ? 12 : 11;
    if (heavy) c *= 2;
    if (CH.reqShort(item)) c *= 1.5;
    return Math.round(G.Perks.mod('stamCost', c, item));
  };

  /* ---------------------------------------------------------------- the player */
  const PP = G.Player.prototype;
  {
    const up0 = PP.update;
    PP.update = function () {
      if (G.run && !this.dead) { try { stamTick(this); applyRoll(); } catch (e) { console.error('[ch] tick', e); } }
      return up0.apply(this, arguments);
    };
    const si0 = PP.startItem;
    PP.startItem = function (action, item) {
      if (G.run && item && item.def && item.def.slot !== 'skill') {
        if (ST.v <= 0 && !G.godMode) { if (fr() % 4 === 0 || ST.flash < 20) { ST.flash = 30; G.FX.text(this.x, this.top - 10, t(`No strength|Нет сил|Mador yo'q`), '#e8c86a', { size: 7 }); if (G.Audio) G.Audio.sfx('denied'); } return false; }
      }
      const ok = si0.apply(this, arguments);
      if (ok && item && item.def && item.def.slot !== 'skill' && !(this.act && this.act.ws && this.act.ws.noStartCost)) CH.spend(CH.costOf(item, false), 'attack');
      return ok;
    };
    const sr0 = PP.startRoll;
    PP.startRoll = function () {
      CH.spend(CH.rollStats().cost, 'roll');
      return sr0.apply(this, arguments);
    };
    // resistances against statuses (cap 60%), salt underfoot
    PP.addStatus = function (k, e) {
      if (G.run) {
        if (k === 'slow' && G.Perks.mod('noSlow', 0) > 0) return;
        const res = CH.res(k === 'freeze' ? 'frost' : k);
        if (res > 0) e = Object.assign({}, e, { t: Math.round((e.t || 60) * (1 - res)), dps: e.dps ? e.dps * (1 - res * 0.5) : e.dps });
      }
      return G.Actor.prototype.addStatus.call(this, k, e);
    };
    // poise: heavy armour (and some nodes) keep you on your feet
    const th0 = PP.takeHit;
    PP.takeHit = function (e) {
      if (G.run && e && !e.noFlinch && !this.dead) {
        let keep = Math.random() < CH.poise();
        if (!keep && G.Perks.mod('spineGuard', 0) > 0 && ST.v > CH.maxStam() * 0.5) keep = true;
        if (keep) e = Object.assign({}, e, { noFlinch: true, kbx: (e.kbx || 2.5) * 0.3 });
      }
      return th0.call(this, e);
    };
  }
  let rollGen = -1;
  function applyRoll() {
    if (rollGen === cache.gen && cache.roll) return;
    const r = CH.rollStats(); rollGen = cache.gen;
    const M = G.MOVE;
    M.rollT = r.rollT; M.rollSpd = r.rollSpd; M.rollI = Math.min(r.rollI, r.rollT); M.rollCD = r.rollCD;
  }
  CH.applyRoll = () => { rollGen = -1; applyRoll(); };

  /* ---------------------------------------------------------------- checks (deterministic, no dice) */
  // CH.check('str', 8) / CH.check('collection', 3) -> { ok, have, need, label }
  const BRANCH_CHECK = { collection: 0, backbone: 1, song: 2 };
  CH.check = (kind, need, extra) => {
    let have = 0, label = '';
    if (ATTRS.includes(kind)) { have = CH.attrs()[kind]; label = t(ATTR_NAME[kind]); }
    else if (kind in BRANCH_CHECK) {
      have = G.PROG ? G.PROG.branchPoints(BRANCH_CHECK[kind]) : 0;
      label = G.PROG ? t(G.PROG.BRANCHES[BRANCH_CHECK[kind]].name) : kind;
    }
    have += G.Perks.mod('check_' + kind, 0) + (extra || 0);
    return { ok: have >= need, have, need, label: '[' + label + ' ' + need + ']' };
  };

  /* ---------------------------------------------------------------- respec */
  CH.respecCost = () => (CH.respecFree() ? 0 : 60 * S().lvl + 100 * (S().respecUsed || 0));
  CH.respecFree = () => !S().respecFreeUsed && (PI() >= 2 || !!R().world);
  CH.respec = (o) => {
    o = o || {};
    const s = S(), cost = CH.respecCost();
    if (!o.force) {
      if (G.run.gold < cost) return { ok: false, why: tf(`needs {n} tilla|нужно {n} тилла|{n} tilla kerak`, { n: cost }) };
      if (cost) G.run.gold -= cost;
    }
    if (CH.respecFree()) s.respecFreeUsed = true; else s.respecUsed = (s.respecUsed || 0) + 1;
    const spent = ATTRS.reduce((a, k) => a + (s.attr[k] - 3), 0);
    for (const k of ATTRS) s.attr[k] = 3;
    s.free += spent;
    if (G.PROG && G.PROG.resetYodchi) G.PROG.resetYodchi();
    dirty(); save(); syncHp(true);
    sfx('scroll');
    return { ok: true, cost };
  };

  /* ---------------------------------------------------------------- compatibility */
  // story files that still bump run.stats (old "scroll" colours) turn into attribute gifts
  const STAT2ATTR = { red: 'str', purple: 'agi', green: 'end' };
  function statShim() {
    const r = G.run; if (!r || !r.stats) return;
    const s = S();
    if (!s.stats0) { s.stats0 = Object.assign({ red: 0, purple: 0, green: 0 }, r.stats); return; }
    for (const k in STAT2ATTR) {
      const d = (r.stats[k] || 0) - (s.stats0[k] || 0);
      if (d > 0) { CH.addAttr(STAT2ATTR[k], d); toast(tf(`{a} +{n}|{a} +{n}|{a} +{n}`, { a: t(ATTR_NAME[STAT2ATTR[k]]), n: d }), '#f2c14a'); }
    }
    s.stats0 = Object.assign({ red: 0, purple: 0, green: 0 }, r.stats);
  }

  /* ---------------------------------------------------------------- scrolls are gone: caches instead */
  // A "scroll" spot in a land is now a yodchi's cache: materials, a blank tumar or a little tilla, and a
  // little exploration experience. Boss rewards: no scroll, a bundle of upgrade materials instead.
  G.Game.offerScroll = function (p, obj) {
    if (obj) { obj.dead = true; obj.usedUp = true; }
    try { G.YITEMS && G.YITEMS.openCache(obj, p); } catch (e) { console.error('[ch] cache', e); }
    CH.addXp(10 * XPK0(), 'explore');
  };
  G.ObjArt.ydCache = (ctx, o) => {
    const x = Math.round(o.x), y = Math.round(o.y);
    ctx.fillStyle = '#1a1014'; ctx.fillRect(x - 7, y - 9, 14, 9);
    ctx.fillStyle = '#6a4426'; ctx.fillRect(x - 6, y - 8, 12, 7);
    ctx.fillStyle = '#8a5a30'; ctx.fillRect(x - 6, y - 8, 12, 2);
    ctx.fillStyle = '#c8302a'; ctx.fillRect(x - 1, y - 9, 2, 8);
    ctx.fillStyle = '#e2b452'; ctx.fillRect(x - 2, y - 6, 4, 2);
    ctx.fillStyle = '#9ff3e6'; if ((G.frame >> 4) & 1) ctx.fillRect(x + 4, y - 11, 1, 1);
  };
  function cacheify() {
    if (!G.world) return;
    for (const o of G.world.interactables) if (o.art === 'scroll' && !o._yd) {
      o._yd = 1; o.art = 'ydCache'; o.h = 12;
      o.prompt = N(`Search the cache|Обыскать тайник|Yashirin joyni tintish`);
    }
  }
  G.Events.on('bossDefeated', () => { setTimeout(cacheify, 0); });

  /* ---------------------------------------------------------------- wiring */
  ON_STAGE.push((plan, biome, level) => {
    S(); dirty();
    try { G.YITEMS && G.YITEMS.syncSlots(true); } catch (e) { console.error('[ch] sync', e); }
    cacheify(); statShim();
    ST.v = CH.maxStam(); ST.lock = 0;
    CH.applyRoll();
    syncHp(false);
    // region discovered (exploration)
    const s = S();
    if (plan && plan.type === 'level' && !s.seen['reg' + PI()]) { s.seen['reg' + PI()] = 1; CH.addXp(50 * XPK0(), 'explore'); }
    void biome; void level;
  });
  G.Events.on('bossDefeated', b => { const n = CH.killXp(Object.assign({}, b || {}, { isBoss: true })); void n; });
  // memories found and clues are investigation; lore stones are a little exploration
  {
    const sl0 = G.Game.showLore;
    G.Game.showLore = function (lvl, obj) {
      if (obj && !obj.read && G.run) CH.addXp(6 * XPK0(), 'explore');
      return sl0.apply(this, arguments);
    };
  }
  let memSeen = -1, clueSeen = -1;
  TICK.push(() => {
    if (!G.run) return;
    const r = R();
    const m = Object.keys(r.mem || {}).length, cl = r.clues || 0;
    if (memSeen >= 0 && m > memSeen) CH.addXp(80 * (m - memSeen) * XPK0() * 0.5, 'explore');
    if (clueSeen >= 0 && cl > clueSeen) CH.addXp(80 * (cl - clueSeen) * XPK0() * 0.5, 'explore');
    memSeen = m; clueSeen = cl;
    statShim();
    if (fr() % 90 === 0) dirty();          // conditions in effects (Hollowness thresholds, flags) refresh
  });
  ON_NEWRUN.push(() => { memSeen = -1; clueSeen = -1; });
  {
    const ex0 = G.Game.exitStage;
    G.Game.exitStage = function () {
      try { const pi = PI(), p = G.PLAN[pi]; if (G.run && p && p.type === 'level' && !p.world && !R().ended) landDone(pi); } catch (e) { console.error('[ch] land', e); }
      return ex0.apply(this, arguments);
    };
  }

  /* ---------------------------------------------------------------- HUD: stamina where the scroll counters were */
  // build.py routes the engine's stat-diamond row through G.HUD_STATS (pixel and text pass).
  G.HUD_STATS = (ctx, run, p, barW) => {
    if (!FX.pixel || !FX.pixel() || !p) return;
    const max = CH.maxStam(), v = ST.v;
    ST.shown += (v / max - ST.shown) * 0.35;
    const w = Math.max(40, Math.round(barW * 0.82 * Math.min(1.6, max / 100) / 1.2)), x = 8, y = 31;
    ctx.fillStyle = '#120c14'; ctx.fillRect(x, y, w + 2, 6);
    ctx.fillStyle = '#2a1e2a'; ctx.fillRect(x + 1, y + 1, w, 4);
    const f = Math.round(w * clamp(ST.shown, 0, 1));
    const empty = ST.lock > 0 || v <= 0;
    ctx.fillStyle = empty ? ((ST.flash >> 2) & 1 ? '#ff8a6a' : '#7a4a2a') : '#d8b048';
    ctx.fillRect(x + 1, y + 1, f, 4);
    ctx.fillStyle = empty ? '#a0503a' : '#fff0a8'; ctx.fillRect(x + 1, y + 1, f, 1);
    ctx.fillStyle = '#8a6a22'; ctx.fillRect(x + 1, y + 4, f, 1);
    // level pip and unspent points
    const s = S(), lx = x + w + 6;
    ctx.fillStyle = '#120c14'; ctx.fillRect(lx - 1, y - 1, 9, 8);
    ctx.fillStyle = s.free > 0 || CH.skillPoints() > 0 ? ((fr() >> 4) & 1 ? '#ffe7a6' : '#e2b452') : '#7a6a50';
    ctx.fillRect(lx, y, 7, 6);
    ctx.fillStyle = '#120c14'; ctx.fillRect(lx + 3, y + 1, 1, 4); ctx.fillRect(lx + 1, y + 3, 5, 1);
    void run;
  };
  SMOOTH_DRAW.push((ctx, st) => {
    if (st !== 'play' || !G.run || !pl() || (G.UI.isOpen && G.UI.isOpen()) || R().ended) return;
    const hud = G.UI._debug().hud; if (!hud || hud.show < 0.5) return;
    const s = S();
    const max = CH.maxStam();
    const w = Math.max(40, Math.round(clamp(Math.round(84 + 0.3 * (pl().maxHp - 100)), 84, 150) * 0.82 * Math.min(1.6, max / 100) / 1.2));
    ctx.save();
    ctx.font = '600 5.2px ' + (G.FONT_UI || 'sans-serif'); ctx.textBaseline = 'top';
    ctx.fillStyle = '#f2e6c8'; ctx.globalAlpha = 0.9;
    ctx.fillText(t(`Lv|Ур.|Dr.`) + ' ' + s.lvl, 8 + w + 16, 30.6);
    ctx.restore();
  });

  /* ---------------------------------------------------------------- the hero wears the gear */
  const HA = G.HERO_ART, HC = HA && HA.C, HH = G.HERO_HEAD;
  const DEF_C = HC ? Object.assign({}, HC) : null;
  const DEF_ROWS = HH ? HH.rows.slice() : null, DEF_AY = HH ? HH.ay : 8;
  const HEADS = {
    doppi: null,
    turban: ['..kKKk..', '.KKWWKK.', 'KKWKKWKK', 'KKKKKKK.', 'HDsssBs.', 'HDsssEs.', 'HDssssss', '.BssBBB.', '.BBBBBB.', '...Ds...'],
    hood: ['.KKKKK..', 'KKKKKKK.', 'KKKKKKs.', 'KKsssBs.', 'KKsssEs.', 'KKssssss', 'KKssBBB.', '.KBBBBB.', '...Ds...'],
    helmet: ['...k....', '..kKk...', '.KKKKK..', 'KKWWWKK.', 'KKKKKKs.', 'HDsssEs.', 'HDssssss', '.BssBBB.', '.BBBBBB.', '...Ds...'],
    cap: ['..KKKK..', '.KKKKKK.', 'KKKKKKKK', 'HDsssBs.', 'HDsssEs.', 'HDssssss', '.BssBBB.', '.BBBBBB.', '...Ds...'],
    kerchief: ['.KKKKK..', 'KKKWKKKK', 'HKKKKKK.', 'HDsssBs.', 'HDsssEs.', 'HDssssss', '.BssBBB.', '.BBBBBB.', '...Ds...']
  };
  let lookKey = '';
  function applyLook() {
    if (!HC || !G.run || !G.YITEMS) return;
    const s = S(), L = G.YITEMS.looks(s);
    const key = JSON.stringify(L);
    if (key === lookKey) return;
    lookKey = key;
    Object.assign(HC, DEF_C, L.body || {}, L.belt || {}, L.boots || {}, L.headCol || {});
    if (HH) {
      const rows = (L.head && HEADS[L.head]) || DEF_ROWS;
      HH.rows = rows.slice(); HH.ay = rows.length - 1; HH.v = (HH.v || 1) + 1;
      HH._yd = L.headCol || null;
    }
  }
  CH.applyLook = () => { lookKey = ''; applyLook(); };
  if (HH) {
    const pal0 = HH.pal;
    HH.pal = function () {
      const p = pal0.call(this);
      if (HC) Object.assign(p, { K: HC.cap, k: HC.capL || HC.cap, W: HC.capW });
      return p;
    };
  }
  // silhouette: pauldrons on heavy armour, a plume on the Divan helmet, a cape for the Ash cloak
  {
    const dp0 = PP.drawPuppet;
    PP.drawPuppet = function (o, s) {
      if (G.run && this === pl()) { try { applyLook(); } catch (e) { /* drawing only */ } }
      const r = dp0.apply(this, arguments);
      if (G.run && this === pl() && this.state !== 'dead' && !(s.roll > 0) && s.sh) {
        try { drawGearOver(o, s); } catch (e) { /* drawing only */ }
      }
      return r;
    };
  }
  function drawGearOver(o, s) {
    const L = G.YITEMS ? G.YITEMS.looks(S()) : null;
    if (!L || !L.extra) return;
    const R2 = Math.round, sx = R2(s.sh[0]), sy = R2(s.sh[1]);
    const E = L.extra;
    if (E.pauldron) {
      o.fillStyle = '#100a1b'; o.fillRect(sx - 3, sy, 6, 4);
      o.fillStyle = E.pauldron[0]; o.fillRect(sx - 2, sy, 5, 3);
      o.fillStyle = E.pauldron[1]; o.fillRect(sx - 2, sy, 5, 1);
      o.fillStyle = E.pauldron[2]; o.fillRect(sx + 2, sy + 1, 1, 2);
    }
    if (E.plume) {
      const T = G.time || 0, sway = Math.round(Math.sin(T * 6) * 0.6 - (this_vx() * 0.4));
      o.fillStyle = E.plume[0]; o.fillRect(sx - 2 + sway, sy - 13, 2, 3); o.fillRect(sx - 3 + sway, sy - 12, 1, 3);
      o.fillStyle = E.plume[1]; o.fillRect(sx - 1 + sway, sy - 13, 1, 1);
    }
    if (E.mantle) {
      o.fillStyle = E.mantle[0]; o.fillRect(sx - 5, sy + 1, 3, 9);
      o.fillStyle = E.mantle[1]; o.fillRect(sx - 5, sy + 1, 1, 9);
    }
    if (E.glow && (G.frame >> 3) % 3 === 0) { o.fillStyle = E.glow; o.fillRect(sx + 1, sy + 3, 1, 1); }
  }
  const this_vx = () => { const p = pl(); return p ? clamp(p.vx * p.facing, -2, 2) : 0; };

  /* ---------------------------------------------------------------- API */
  Object.assign(CH, {
    MAXLVL, ATTR_MAX, blank: blankCh,
    pts: () => ({ lvl: S().lvl, xp: S().xp, need: CH.xpNeed(S().lvl), attr: S().free, skill: CH.skillPoints() }),
    xpLog: () => Object.assign({}, S().xpLog, { total: S().xpTotal })
  });
  CH.ready = true;
}
