/* =====================================================================
   Items (GDD ch. 13–15): seven weapon categories (46 models), quality,
   upgrades +1…+5, scaling letters, ten stones and wax mods, ten
   legendary weapons, armour in four slots with weight classes and seven
   faction sets, 32 charms, consumables, materials, memory tumars, keys;
   the inventory (R().ch.inv / .eq), drops, chaikhana shops, the smith.
   API: G.YITEMS (inventory and data), G.CH.grantLegend(id) for the story.
   ===================================================================== */
{
  const X = G.ItemsExt, WL = G.WeaponsLib, ID = G.Items.defs, U = G.U;
  const YI = G.YITEMS = {};
  const CH = G.CH;
  const pl = () => (G.world && G.world.player) || null;
  const now = () => G.time || 0;
  const RD = Math.round;
  const S = () => CH.S();

  /* ================================================================ quality, categories */
  const QUAL = [
    { name: `Common|Обычное|Oddiy`, col: '#d8d0c0', slots: 0 },
    { name: `Sound|Добротное|Puxta`, col: '#8fd47a', slots: 1 },
    { name: `Masterwork|Мастерское|Ustakor`, col: '#78b4ff', slots: 2 },
    { name: `Legendary|Легендарное|Afsonaviy`, col: '#ffb648', slots: 2 }
  ];
  YI.QUAL = QUAL;
  const CAT = {
    sabre: { name: `Sabres and klych|Сабли и клычи|Qilichlar`, branch: 0, st: 11, w: 'medium', good: `chains of blows, versatility|серии ударов, годится на всё|zarba seriyalari, har ishga yaraydi`, bad: `heavy armour|тяжёлая броня|og'ir sovut` },
    staff: { name: `Staffs and clubs|Посохи и дубины|Hassa va to'qmoqlar`, branch: 0, st: 18, w: 'heavy', good: `stuns, balance, breaking guards|оглушение, равновесие, пробивание защиты|gangitish, muvozanat, himoyani yorish`, bad: `fast enemies|быстрые враги|tez dushmanlar` },
    knife: { name: `Knives and daggers|Ножи и кинжалы|Pichoq va xanjarlar`, branch: 0, st: 7, w: 'light', good: `bleeding, blows in the back|кровотечение, удары в спину|qon ketishi, orqadan zarba`, bad: `armoured bosses|боссы в броне|sovutli bosslar` },
    shield: { name: `Shield and mace|Щит и булава|Qalqon va gurzi`, branch: 1, st: 14, w: 'heavy', good: `block, counter-blows, guarding others|блок, контрудар, защита спутников|to'sish, qarshi zarba, hamrohlarni himoya qilish`, bad: `mobility|подвижность|harakatchanlik` },
    ranged: { name: `Sling, bow, crossbow|Праща, лук, самострел|Sopqon, kamon, arbalet`, branch: 0, st: 9, w: 'medium', good: `distance, weak points, flyers|дистанция, слабые места, летающие враги|masofa, zaif joylar, uchuvchi dushmanlar`, bad: `up close|вплотную|yaqin masofada` },
    dutar: { name: `Dutar and drum|Дутар и бубен|Dutor va doira`, branch: 2, st: 10, w: 'light', good: `sound that hurts a crowd, control|звук бьёт по толпе, контроль|tovush to'dani uradi, nazorat`, bad: `single fast targets|быстрые одиночные цели|tez yakka nishonlar` },
    focus: { name: `Tumar foci|Тумары-фокусы|Tumar-fokuslar`, branch: 2, st: 13, w: 'light', good: `Burning, blast damage|сожжение, урон взрывом|yondirish, portlash zarari`, bad: `Hollowness, stamina|Пустота, выносливость|Bo'shliq, chidam` }
  };
  YI.CAT = CAT;
  const LETTERS = ['S', 'A', 'B', 'C', 'D'];
  const TIER = { 1: { power: 1, minStage: 0, price: 120 }, 2: { power: 1.35, minStage: 2, price: 300 }, 3: { power: 1.7, minStage: 4.3, price: 450 }, 4: { power: 2.05, minStage: 6.5, price: 650 }, 5: { power: 2.4, minStage: 8.4, price: 900 } };

  /* ================================================================ pen art */
  const P = {
    wood: '#7a5032', woodL: '#a87444', woodD: '#4a2e1c', iron: '#8e96a4', ironL: '#c8d0dc', ironD: '#4a5060', gold: '#e2b452', goldL: '#ffe7a6',
    cord: '#c8302a', leather: '#5e3820', bone: '#e8dcc0', boneD: '#a89878', wax: '#f2ead0'
  };
  const pens = {
    staff(o) {
      return (z, e) => {
        const a = e.icon ? -9 : -12, b = e.icon ? 10 : 22;
        z.line(a, 0, b, 0, 2, o.wood || P.wood); z.line(a, -0.5, b, -0.5, 1, o.woodL || P.woodL);
        for (const u of o.rings || [b - 3, b - 6, a + 2]) z.line(u, -1.5, u, 1.5, 1, o.ring || P.iron);
        z.disc(b + 1, 0, o.knob || 2, o.knobCol || P.ironD); z.dot(b + 1, -1, o.knobL || P.ironL);
        if (o.tassel) { z.path([b - 7, 1, b - 8, 4, b - 7, 6], 1, o.tassel); }
      };
    },
    mallet(o) {
      return (z, e) => {
        const a = e.icon ? -8 : -10, b = e.icon ? 8 : 14;
        z.line(a, 0, b, 0, 2, o.wood || P.wood); z.line(a, -0.5, b, -0.5, 1, P.woodL);
        z.poly([b - 1, -4, b + 6, -4, b + 6, 4, b - 1, 4], o.head || P.woodD);
        z.line(b, -4, b + 5, -4, 1, o.headL || P.woodL); z.line(b + 1, -1.5, b + 1, 1.5, 1, o.band || P.iron); z.line(b + 4, -1.5, b + 4, 1.5, 1, o.band || P.iron);
      };
    },
    mace(o) {
      return (z, e) => {
        const a = e.icon ? -6 : -7, b = e.icon ? 7 : 10;
        z.line(a, 0, b, 0, 2, o.grip || P.leather); z.line(b - 2, 0, b + 1, 0, 2, o.iron || P.iron);
        z.disc(b + 4, 0, o.r || 3.2, o.head || P.iron); z.ring(b + 4, 0, (o.r || 3.2) - 0.8, o.headL || P.ironL, -2.2, -0.6);
        for (const [u, v] of [[b + 4, -4.5], [b + 4, 4.5], [b + 8, 0], [b + 7, -3], [b + 7, 3]]) z.dot(u, v, o.spike || P.ironL);
      };
    },
    dagger(o) {
      return (z, e) => {
        const L = o.len || 9;
        z.line(-4, 0, -0.5, 0, 2, o.grip || P.leather); z.dot(-5, 0, o.pommel || P.gold);
        z.line(0, -2, 0, 2, 1, o.guard || P.gold);
        z.path([1, 0, 1 + L * 0.6, o.curve || -0.4, 1 + L, o.curve ? o.curve * 2.4 : -0.8], 2, o.blade || P.iron);
        z.path([1, 0.5, 1 + L * 0.7, 0.2], 1, o.bladeL || P.ironL);
        if (o.glow && !e.icon) z.dot(1 + L, o.curve ? o.curve * 2.4 : -0.8, o.glow);
      };
    },
    dutar(o) {
      return (z, e) => {
        const a = e.icon ? -7 : -6, b = e.icon ? 13 : 22;
        z.poly([a - 3, 0, a, -4, a + 6, -4.5, a + 9, -2, a + 9, 2, a + 6, 4.5, a, 4, a - 3, 0], o.body || P.wood);
        z.path([a, -3, a + 6, -3.6], 1, o.bodyL || P.woodL);
        z.dot(a + 4, 0, o.hole || P.woodD); z.dot(a + 5, 0, o.hole || P.woodD);
        z.line(a + 9, 0, b, 0, 1, o.neck || P.woodD); z.line(a + 9, -0.6, b, -0.6, 1, o.neckL || P.woodL);
        z.dot(b + 1, -1, o.peg || P.bone); z.dot(b, 1, o.peg || P.bone);
        z.line(a + 1, 0, b, 0, 1, o.string || '#f2e6c8');
        if (o.tassel) z.path([b, 0, b + 1, 3, b, 5], 1, o.tassel);
      };
    },
    drum(o) {
      return (z, e) => {
        const c = e.icon ? 2 : 5, r = o.r || 6;
        z.line(-3, 0, c - r + 1, 0, 2, P.leather);
        z.disc(c, 0, r, o.frame || P.woodD); z.disc(c, 0, r - 1, o.skin || '#e8d8b0');
        z.ring(c, 0, r - 2.2, o.ring || '#c8a868');
        for (let k = 0; k < 5; k++) { const ang = k / 5 * 6.283; z.dot(c + Math.cos(ang) * (r - 0.4), Math.sin(ang) * (r - 0.4), o.jingle || P.gold); }
        if (o.mark) z.dot(c, 0, o.mark);
      };
    },
    focus(o) {
      return (z, e) => {
        const c = e.icon ? 3 : 7;
        z.path([-3, 0, c - 3, -1], 1, o.cord || P.cord);
        z.poly([c - 4, -4, c + 5, 0, c - 4, 4], o.body || P.gold);
        z.path([c - 3, -3, c + 3, 0], 1, o.bodyL || P.goldL);
        z.disc(c - 1, 0, 1.4, o.gem || '#7fe8dc'); z.dot(c - 1.4, -0.6, '#ffffff');
        if (!e.icon && o.glow) { z.dot(c + 6, -1, o.glow); z.dot(c + 7, 1, o.glow); }
      };
    },
    crossbow(o) {
      return (z, e) => {
        const a = e.icon ? -6 : -6, b = e.icon ? 10 : 14;
        z.line(a, 0.5, b, 0.5, 2, o.stock || P.wood); z.line(a, 0, b, 0, 1, o.stockL || P.woodL);
        z.path([b - 2, -7, b, -3, b + 1, 0, b, 3, b - 2, 7], 1, o.arm || P.ironD);
        z.path([b - 2, -7, b - 7, 0.5, b - 2, 7], 1, '#e8e0c8');
        z.line(b - 9, -0.5, b + 3, -0.5, 1, o.bolt || P.ironL);
        z.dot(a + 2, 1.5, o.trigger || P.iron);
      };
    }
  };
  const held = pen => WL.heldOf(pen);
  const pic = (pen, o) => WL.pixIcon(pen, Object.assign({ cu: 4, cv: 0 }, o || {}));

  /* ================================================================ kinds */
  const WM = G.ItemKinds.wmelee, HMIN = 16, HMAX = 42;
  {
    const st0 = WM.steps;
    WM.steps = function (item, ws) { return ws && ws.heavyMode && ws.hsteps ? ws.hsteps : st0.call(this, item, ws); };
    const b0 = WM.begin;
    WM.begin = function (p, item, ws) {
      ws.swings = (ws.swings || 0) + 1;
      if (p === pl() && ws.swings > 1 && !ws.heavyMode) CH.spend(CH.costOf(item, false));
      const r = b0.apply(this, arguments);
      ws.spd = (1 + 0.01 * BAL.eff(CH.attrs().agi)) * G.Perks.mod('swingSpeed', 1, item);
      return r;
    };
  }
  function chargeFx(p, item, ws) {
    const k = clamp((ws.ct - HMIN) / (HMAX - HMIN), 0, 1);
    if (ws.ct === HMIN) { const h = WL.handW(p); G.FX.star(h.x, h.y, false, '#fff2b0'); sfx('ready', { x: p.x, pitch: 1.4, vol: 0.4 }); }
    if (ws.ct > HMIN && G.frame % 3 === 0) { const h = WL.handW(p); G.FX.spawn({ x: h.x + U.rand(-3, 3), y: h.y + U.rand(-3, 3), vy: -0.3, life: 10, size: 1, color: k >= 1 ? '#ffffff' : '#ffe7a6', glow: true }); }
  }
  function startHeavy(p, item, ws) {
    const d = item.def, k = clamp((ws.ct - HMIN) / (HMAX - HMIN), 0, 1);
    ws.heavyMode = true; ws.swings = 0;
    const hs = Object.assign({}, d.heavyStep);
    hs.dmg = (hs.dmg || 20) * (1 + 0.35 * k); hs.heavy = true; hs.charged = true;
    const kn = G.PROG ? G.PROG.rank('c_knock') : 0;
    if (kn) hs.stun = Math.max(hs.stun || 0, 50 + 30 * kn);
    let steps = [hs];
    ws.legend = false;
    const lm = d.yd && d.yd.legendMove;
    if (lm && !(item.cd > 0) && LEG_MOVES[lm]) {
      const r = LEG_MOVES[lm].heavy ? LEG_MOVES[lm].heavy(p, item, ws, hs) : null;
      if (r) { steps = r; ws.legend = true; item.cd = item.cdMax = LEG_MOVES[lm].cd; }
    }
    ws.hsteps = steps;
    CH.spend(CH.costOf(item, true) - CH.costOf(item, false));
    WM.start.call(WM, p, item, ws);
  }
  G.ItemKinds.ydm = {
    start(p, item, ws) {
      ws.swings = 0; ws.heavyMode = false; ws.acc = 0; ws.hsteps = null;
      if (item.def.heavyStep && p.onGround && (G.input.isDown(ws.action) || ws.forceCharge)) { ws.charging = true; ws.ct = 0; ws.t = 0; ws.cancelable = true; return true; }
      return WM.start.call(WM, p, item, ws);
    },
    update(p, item, ws) {
      if (ws.charging) {
        ws.ct++; ws.cancelable = true;
        if (p.onGround) p.vx *= 0.75;
        const held2 = ws.forceCharge ? ws.ct < ws.forceCharge : G.input.isDown(ws.action);
        chargeFx(p, item, ws);
        if (!held2 || ws.ct >= HMAX) {
          ws.charging = false;
          if (ws.ct >= HMIN) startHeavy(p, item, ws); else WM.start.call(WM, p, item, ws);
        }
        return false;
      }
      const r = WM.update.call(WM, p, item, ws);
      if (!r && ws.st && ws.t > ws.st.windup + ws.st.active + 1) {
        ws.acc += (ws.spd || 1) - 1;
        while (ws.acc >= 1 && ws.t < ws.total - 1) { ws.acc -= 1; ws.t++; }
      }
      return r;
    },
    pose(p, item, ws) {
      if (ws.charging) {
        const k = clamp(ws.ct / HMIN, 0, 1), sh = ws.ct > HMIN ? Math.sin(ws.ct * 1.7) * 0.05 : 0;
        p.pose.armF = U.lerp(0.9, -2.5, U.ease.outCubic(k)) + sh; p.pose.ext = 0.95; p.pose.item = item; p.pose.wAng = p.pose.armF + (item.def.wOff || 0);
        p.pose.lean = -0.3; if (p.onGround) p.pose.legs = 'brace';
        if (item.def.twoHand) { p.pose.armB = p.pose.armF + 0.15; p.pose.extB = 0.8; }
        return;
      }
      return WM.pose.call(WM, p, item, ws);
    },
    end(p, item, ws) { return WM.end.call(WM, p, item, ws); }
  };
  // tumar foci: a bolt; hold for Burn (an explosion, Hollowness)
  G.ItemKinds.ydcast = {
    start(p, item, ws) { ws.t = 0; ws.fired = false; ws.ct = 0; ws.burn = false; ws.charging = p.onGround && (G.input.isDown(ws.action) || ws.forceCharge); return true; },
    update(p, item, ws) {
      const d = item.def;
      if (ws.charging) {
        ws.ct++; ws.cancelable = true; if (p.onGround) p.vx *= 0.7;
        const held2 = ws.forceCharge ? ws.ct < ws.forceCharge : G.input.isDown(ws.action);
        chargeFx(p, item, ws);
        if (!held2 || ws.ct >= HMAX) {
          ws.charging = false; ws.burn = ws.ct >= HMIN; ws.t = 0;
          if (ws.burn) CH.spend(CH.costOf(item, true) - CH.costOf(item, false));
        }
        return false;
      }
      ws.t++; if (p.onGround) p.vx *= 0.7;
      const castT = ws.burn ? Math.round(d.castT * 1.5) : d.castT;
      if (!ws.fired && ws.t >= castT) { ws.fired = true; ws.fireT = ws.t; (ws.burn ? burnFire : boltFire)(p, item, ws); }
      ws.cancelable = ws.fired && ws.t > castT + 4;
      return ws.t >= castT + d.recover * (ws.burn ? 1.4 : 1) / (1 + 0.01 * BAL.eff(CH.attrs().agi));
    },
    pose(p, item, ws) {
      const k = ws.charging ? clamp(ws.ct / HMIN, 0, 1) : ws.fired ? 1 - clamp((ws.t - ws.fireT) / 10, 0, 1) : clamp(ws.t / 8, 0, 1);
      p.pose.armF = U.lerp(0.6, -0.35, k) + (ws.charging ? Math.sin(ws.ct * 0.5) * 0.05 : 0); p.pose.ext = U.lerp(1, 1.4, k);
      p.pose.item = item; p.pose.wAng = p.pose.armF - 0.6; p.pose.lean = 0.15 * k; if (p.onGround) p.pose.legs = 'brace';
      if (G.frame % 2 === 0 && (ws.charging || !ws.fired)) { const h = WL.handW(p); G.Glow.add(h.x, h.y, 10 + 8 * k, item.def.glowCol || '#7fe8dc', 0.5); }
    }
  };
  function boltFire(p, item, ws) {
    const d = item.def, h = WL.handW(p);
    const legend = d.yd && d.yd.legendMove;
    G.world.add(new G.Projectile({
      x: h.x + 4 * p.facing, y: h.y, vx: 5.4 * p.facing, vy: -0.2, r: 3, faction: 'player', owner: p,
      dmg: G.Combat.playerDmg(item, d.boltDmg || 11), life: 110, homing: 0.1, homingDelay: 5, pierce: d.pierce || 0,
      color: d.glowCol || '#9ff6ff', light: { r: 36, color: d.glowCol || '#4ec9b8', a: 0.6 },
      trail: { color: d.glowCol || '#4ec9b8', life: 12, size: 1.5, every: 1 },
      status: d.boltStatus, info: { item, type: 'magic', magic: true }
    }));
    sfx('magic', { x: p.x, pitch: 1.5, vol: 0.6 });
    void ws; void legend;
  }
  function burnFire(p, item, ws) {
    const d = item.def, lm = d.yd && d.yd.legendMove;
    if (lm === 'cradle' && !(item.cd > 0) && !LEG.cradleUsed) { LEG_MOVES.cradle.cast(p, item, ws); return; }
    const x = p.x + p.facing * 46, y = p.y - 20, dmg = G.Combat.playerDmg(item, d.burnDmg || 42);
    G.Combat.area(p, { x: x - 44, y: y - 34, w: 88, h: 58 }, tg => ({ dmg, type: 'magic', magic: true, item, heavy: true, kbx: 3, kby: -2.5, dir: Math.sign(tg.x - p.x) || p.facing, status: d.burnStatus || { burn: { t: 150, dps: 3 + CH.level() * 0.8 } }, fxPal: 'fire' }), new Set());
    try { G.FX.explosion(x, y, { size: 's', pal: d.burnPal || 'fire' }); } catch (e) { G.FX.ring(x, y, 4, 44, '#ffb060', 18, { width: 3 }); }
    G.shake(0.3);
    CH.magicVoid(1, `a tumar burned|сгорел тумар|tumar yonib ketdi`);
  }

  /* ================================================================ weapons */
  const W = YI.W = [];         // model ids in display order
  const steps = d => X.steps(d);
  function retune(d, dm, tempo) {
    const c = d.combo || [];
    c.forEach((s, i) => { s.dmg = dm[i % dm.length]; if (tempo && tempo !== 1) for (const k of ['windup', 'recover']) s[k] = Math.max(1, RD(s[k] * tempo)); });
    if (d.air) for (const s of [].concat(d.air)) s.dmg = Math.round(dm[0] * 1.05);
  }
  // category movesets (base damage per step before model power, quality, upgrade and attributes)
  const MOVES = {
    sabre: { dm: [11, 11, 18], heavy: { pose: 'thrust', poseOverride: { a0: -0.3, a1: -0.02, ext0: 0.4, ext1: 1.55 }, windup: 4, active: 6, recover: 20, dmg: 30, reach: 38, box: [-2, -30, 42, 22], lunge: 3.4, kbx: 4, hitstop: 8, shake: 0.4, glint: true, sfx: 'swing_heavy', smear: { r0: 10, r1: 38, a0: -0.3, a1: 0, life: 12 } } },
    staff: { dm: [17, 19, 30], tempo: 1, heavy: { pose: 'smash', poseOverride: { a0: -3, a1: 1.6, ext1: 1.25 }, windup: 6, active: 7, recover: 30, dmg: 46, reach: 36, box: [-4, -46, 42, 50], lunge: 1.4, hop: -1.4, stun: 90, kbx: 5, kby: -3, hitstop: 11, shake: 0.65, glint: true, sfx: 'swing_heavy', slamK: 1.6, smear: { r0: 9, r1: 36, life: 14 } } },
    knife: { dm: [7, 7, 8, 10], heavy: { pose: 'thrust', poseOverride: { a0: -0.1, a1: 0, ext0: 0.4, ext1: 1.6 }, windup: 3, active: 5, recover: 14, dmg: 18, reach: 30, box: [0, -28, 32, 18], lunge: 4.2, kbx: 1.5, hitstop: 6, shake: 0.25, sfx: 'whoosh', smear: { r0: 8, r1: 30, a0: -0.15, a1: 0, life: 8 } } },
    mace: { dm: [13, 14, 23], heavy: { pose: 'overhead', poseOverride: { a0: -2.9, a1: 1.6, ext1: 1.2 }, windup: 5, active: 6, recover: 26, dmg: 36, reach: 30, box: [-3, -42, 36, 46], lunge: 1.2, stun: 70, kbx: 4, kby: -2.5, hitstop: 10, shake: 0.55, glint: true, sfx: 'swing_heavy', slamK: 1.3 } },
    dutar: { dm: [9, 9, 15], heavy: { pose: 'spin', poseOverride: { a0: -3.2, a1: 3.1 }, windup: 6, active: 10, recover: 26, dmg: 32, reach: 60, box: [-58, -50, 118, 56], kbx: 3, kby: -2, hitstop: 6, shake: 0.4, sfx: 'whoosh', smear: false, burn: 1 } },
    drum: { dm: [14, 22], heavy: { pose: 'smash', poseOverride: { a0: -2.6, a1: 1.3 }, windup: 6, active: 8, recover: 28, dmg: 38, reach: 64, box: [-62, -54, 126, 60], stun: 40, kbx: 4, kby: -3, hitstop: 8, shake: 0.5, sfx: 'swing_heavy', smear: false, burn: 1 } }
  };
  // instruments: the strike is a wave of sound around the bakhshi
  function soundSteps(d, kind) {
    const c = d.combo;
    const boxes = kind === 'drum' ? [[-40, -46, 84, 50], [-50, -50, 104, 54]] : [[-10, -40, 62, 44], [-14, -42, 66, 46], [-24, -46, 82, 50]];
    c.forEach((s, i) => {
      s.box = boxes[i % boxes.length]; s.reach = s.box[2] + s.box[0]; s.smear = false; s.kbx = 2.2; s.lunge = 0.2;
      s.onFire = soundFire;
    });
    d.heavyStep.onFire = soundFire;
  }
  function soundFire(p, item, ws) {
    const st = ws.st, col = item.def.waveCol || '#ffe7a6';
    const x = p.x + p.facing * Math.max(8, (st.box[0] + st.box[2] / 2)), y = p.y - 20;
    G.FX.ring(x, y, 6, Math.max(30, st.box[2] / 2), col, 16, { width: 2 });
    G.FX.ring(x, y, 3, Math.max(20, st.box[2] / 3), '#ffffff', 12, { width: 1 });
    sfx('magic', { x: p.x, pitch: 1.8 + Math.random() * 0.4, vol: 0.35 });
    // the dutar's song: a ring of sound hurting everyone around
    const r = G.Perks.mod('soundRing', 0);
    if (r > 0) {
      const R2 = 46 + 12 * r, k = r >= 2 ? 0.55 : 0.35;
      G.Combat.area(p, { x: p.x - R2, y: p.y - 50, w: R2 * 2, h: 56 }, tg => ({ dmg: G.Combat.playerDmg(item, st.dmg) * k, type: 'sound', magic: true, item, kbx: 1.2, dir: Math.sign(tg.x - p.x) || 1, hitstop: 0, shake: 0.05 }), new Set(ws.hit || []));
      G.FX.ring(p.x, y, R2 - 10, R2, '#c9b4ff', 14, { width: 1 });
    }
    if (st.burn) CH.magicVoid(1, `a chord burned|сгорел аккорд|akkord yonib ketdi`);
  }
  /**
   * weapon(def): one model
   *  id, base, cat, tier, name, desc, scal{str,agi,end,mem}, req, rec (recolor), art (pen + opts), power (override), patch
   */
  function weapon(o) {
    const T = TIER[o.tier] || TIER[1];
    const base = o.base;
    const patch = Object.assign({ name: N(o.name), desc: N(o.desc), weight: o.drop === false ? 0 : (o.weight || 6), minStage: T.minStage, noDrop: o.drop === false, priceMul: 1 }, o.patch || {});
    if (o.art) { const pen = pens[o.art[0]](o.art[1] || {}); patch.held = held(pen); patch.icon = pic(pen, o.art[2]); }
    let d;
    if (ID[o.id] && o.id === base) {         // re-tune a stock item in place (keeps saves working)
      d = ID[o.id]; Object.assign(d, patch);
      if (o.rec) { const xf = X.colorFn(o.rec); if (!o.art) { d.held = X.recolorHeld(d.held, xf); d.icon = X.recolorIcon(d.icon, xf); } }
    } else d = X.clone(base, o.id, patch, o.rec ? { recolor: o.rec, replace: !!ID[o.id] } : { replace: !!ID[o.id] });
    d.color = undefined; d.color2 = undefined; d.dmgMul = undefined;   // the model's power lives in d.yd
    const mv = MOVES[o.move || o.cat];
    if (d.kind === 'wmelee' && mv) {
      d.combo = X.dclone(d.combo);
      if (d.air) d.air = X.dclone(d.air);
      retune(d, o.dm || mv.dm, o.tempo || mv.tempo);
      if (o.status) for (const st of steps(d)) st.status = Object.assign({}, st.status, o.status);
      d.heavyStep = Object.assign({}, X.dclone(mv.heavy), o.heavy || {});
      if (d.heavyStep.smear !== false && d.smearColor) d.heavyStep.smear = Object.assign({ color: '#ffffff', color2: d.smearColor2 || d.smearColor }, d.heavyStep.smear || {});
      if (o.status) d.heavyStep.status = Object.assign({}, o.status);
      d.kind = 'ydm';
      if (o.move === 'dutar' || o.move === 'drum') soundSteps(d, o.move);
    }
    d.yd = Object.assign({ cat: o.cat, tier: o.tier, power: o.power || T.power, scal: o.scal, req: o.req || null, st: o.st != null ? o.st : CAT[o.cat].st, price: o.price || T.price, legend: !!o.legend, legendMove: o.legendMove || null, move: o.move || o.cat, sub: o.sub || null }, o.yd || {});
    if (o.waveCol) d.waveCol = o.waveCol;
    if (o.setup) o.setup(d);
    if (!o.legend) W.push(o.id);
    return d;
  }
  YI.weapon = weapon;

  /* ---------- 1. Sabres and klych (Agility + Strength) ---------- */
  weapon({ id: 'kylysh', base: 'kylysh', cat: 'sabre', tier: 1, scal: { agi: 'B', str: 'C' },
    name: `Yodchi's sabre|Сабля ёдчи|Yodchi qilichi`, desc: `A tithe collector's curved sabre. A steady three-strike chain; hold the attack for a lunging thrust.|Кривая сабля сборщика десятины. Надёжная серия из трёх ударов; удержи атаку — выпад с рывком.|Ushr yig'uvchining egri qilichi. Uch zarbali ishonchli seriya; hujumni bosib tursang — oldinga otilib sanchiladi.` });
  weapon({ id: 'yd_caravan_klych', base: 'kylysh', cat: 'sabre', tier: 1, scal: { agi: 'A', str: 'D' }, tempo: 0.9, dm: [10, 10, 17],
    rec: { hue: 25, sat: 0.9, minSat: 0.05, map: { '#d4ddf0': '#e8e4d8' } },
    name: `Caravan klych|Клыч караванщика|Karvon qilichi`, desc: `Light and quick: guards of the Salt Road wear it on the saddle. Faster than a yodchi's sabre, a little weaker.|Лёгкий и быстрый: стража Соляной дороги возит его у седла. Быстрее сабли ёдчи, но чуть слабее.|Yengil va tez: Tuz yo'li soqchilari uni egarga osib yuradi. Yodchi qilichidan tezroq, biroz kuchsizroq.` });
  weapon({ id: 'yd_divan_sabre', base: 'kylysh', cat: 'sabre', tier: 2, scal: { str: 'B', agi: 'C' }, req: { str: 8 }, tempo: 1.12, dm: [13, 13, 21],
    rec: { hue: 45, sat: 1.4, minSat: 0.05, map: { '#d4ddf0': '#f4e2a8' } },
    name: `Sabre of the Divan guard|Сабля стражи Дивана|Devon soqchisi qilichi`, desc: `Heavier steel with gilt on the guard. Slower; the third cut staggers.|Сталь тяжелее, гарда в позолоте. Медленнее; третий удар сбивает с ног.|Og'irroq po'lat, dastasi zarhal. Sekinroq; uchinchi zarba yiqitadi.`,
    setup(d) { d.combo[2].stun = 30; } });
  weapon({ id: 'yd_tuning_blade', base: 'yd_tuning_blade', cat: 'sabre', tier: 2, scal: { agi: 'B', mem: 'C' }, status: { slow: { t: 70 } },
    name: `Singer's tuning-blade|Камертон-клинок Певца|Xonandaning sozlovchi tig'i`, desc: `A blade tuned to the Pledge Song. Every cut slows the enemy.|Клинок, настроенный на Песню залога. Каждый удар замедляет врага.|Garov qo'shig'iga sozlangan tig'. Har zarba dushmanni sekinlatadi.` });
  weapon({ id: 'muz_kylysh', base: 'muz_kylysh', cat: 'sabre', tier: 3, scal: { agi: 'A', str: 'C' }, req: { agi: 10 },
    name: `Blade from the Spine|Клинок с Хребта|Umurtqadan olingan tig'`, desc: `Cut from the ice on the Sleeper's back. Slows; the third strike freezes.|Вырезан изо льда на спине Спящего. Замедляет; третий удар замораживает.|Uxlovchining orqasidagi muzdan yo'nilgan. Sekinlatadi; uchinchi zarba muzlatadi.` });
  weapon({ id: 'tulpar_kylysh', base: 'tulpar_kylysh', cat: 'sabre', tier: 3, scal: { agi: 'B', mem: 'B' }, req: { mem: 8 },
    name: `Blade of a burning memory|Клинок горящей памяти|Yonayotgan xotira tig'i`, desc: `Someone burned their best day into this steel. Sets enemies alight.|Кто-то сжёг в этой стали свой лучший день. Поджигает врагов.|Kimdir eng yaxshi kunini shu po'latga solib yondirgan. Dushmanni yondiradi.` });
  weapon({ id: 'yd_founder_sabre', base: 'yd_founder_sabre', cat: 'sabre', tier: 5, scal: { agi: 'A', str: 'B' }, req: { agi: 14, str: 10 },
    name: `Sabre of the Seven|Сабля Семерых|Yettilar qilichi`, desc: `Drawn by a caravan-bashi three hundred years ago. Every critical cut gives back a little life.|Её выхватил из ножен караван-баши триста лет назад. Каждый критический удар возвращает немного жизни.|Uch yuz yil oldin uni bir karvonboshi qinidan sug'urgan. Har kritik zarba ozgina jon qaytaradi.` });

  /* ---------- 2. Staffs and clubs (Strength) ---------- */
  weapon({ id: 'yd_yodchi_staff', base: 'aibalta', cat: 'staff', tier: 1, scal: { str: 'B', end: 'D' }, dm: [15, 17, 27], tempo: 0.92,
    art: ['staff', { tassel: '#c8302a' }, { cu: 6, cv: 0 }], patch: { twoHand: true, tipLen: 22, smearColor: '#f2e6c8', smearColor2: '#c8a868' },
    name: `Yodchi's staff|Посох ёдчи|Yodchi hassasi`, desc: `The tool of the trade: forty years of knocking on doors. Wide, steady swings; hold for a crushing blow that stuns.|Орудие ремесла: сорок лет стука в двери. Широкие ровные удары; удержи — сокрушительный удар, который оглушает.|Kasb quroli: qirq yil eshik taqillatgan. Keng, bir maromdagi zarbalar; bosib tursang — gangitib qo'yadigan qattiq zarba.` });
  weapon({ id: 'ketmen', base: 'ketmen', cat: 'staff', tier: 1, scal: { str: 'B' }, dm: [16, 18, 28],
    name: `Ketmon|Кетмень|Ketmon`, desc: `A hoe from a Tail garden. Wide swings toss enemies up.|Кетмень с огорода в Хвосте. Широкие взмахи подбрасывают врагов.|Dumdagi tomorqadan olingan ketmon. Keng siltashlar dushmanni havoga otadi.` });
  weapon({ id: 'aibalta', base: 'aibalta', cat: 'staff', tier: 2, scal: { str: 'A' }, req: { str: 10 },
    name: `Karez-digger's axe|Топор кяризчи|Korizchi boltasi`, desc: `It dug the tunnels; now it cuts men. Slow, crushing blows; the third stuns.|Им рыли кяризы, теперь им рубят людей. Медленные сокрушительные удары; третий оглушает.|U bilan koriz qazishgan, endi odam chopishadi. Sekin, ezib tashlaydigan zarbalar; uchinchisi gangitadi.` });
  weapon({ id: 'yd_watch_mallet', base: 'aibalta', cat: 'staff', tier: 2, scal: { str: 'A', end: 'C' }, req: { str: 9 }, dm: [18, 20, 32],
    art: ['mallet', {}, { cu: 6, cv: 0 }], patch: { twoHand: true, tipLen: 18, smearColor: '#e8d8b0', smearColor2: '#a88050' },
    name: `Night watchman's mallet|Колотушка сторожа|Qorovul to'qmog'i`, desc: `It beat the hours on the Tail's walls. Every blow shakes the ground.|Ею отбивали часы на стенах Хвоста. Каждый удар сотрясает землю.|U bilan Dum devorlarida tunda soat urishgan. Har zarba yerni silkitadi.` });
  weapon({ id: 'naiza', base: 'naiza', cat: 'staff', tier: 2, scal: { str: 'B', agi: 'C' }, dm: [14, 14, 26],
    name: `Warden's spear|Копьё стража|Qo'riqchi nayzasi`, desc: `A spear of the Well's wardens. Long thrusts; a strike with the very tip is critical.|Копьё стражей Колодца. Длинные выпады; удар самым остриём — критический.|Quduq qo'riqchilarining nayzasi. Uzun hamlalar; nayza uchi bilan zarba — kritik.` });
  weapon({ id: 'yd_divan_glaive', base: 'yd_divan_glaive', cat: 'staff', tier: 4, scal: { str: 'A', agi: 'C' }, req: { str: 12 }, dm: [16, 16, 30],
    name: `Gilded glaive of the Divan|Позолоченная глефа Дивана|Devonning zarhal nayzasi`, desc: `Gold leaf over old iron. Long, heavy thrusts that stagger.|Сусальное золото поверх старого железа. Длинные тяжёлые выпады сбивают с ног.|Eski temir ustiga varaq oltin qoplangan. Uzun, og'ir hamlalar oyoqdan qoqadi.` });
  weapon({ id: 'yd_spine_club', base: 'aibalta', cat: 'staff', tier: 5, scal: { str: 'S' }, req: { str: 16 }, dm: [19, 22, 34], tempo: 1.08,
    art: ['mallet', { head: '#d8dce4', headL: '#ffffff', band: '#5a8ab0' }, { cu: 6, cv: 0 }], patch: { twoHand: true, tipLen: 18, smearColor: '#e8faff', smearColor2: '#9fe4ff' },
    name: `Vertebra club|Палица из позвонка|Umurtqa suyagidan to'qmoq`, desc: `A bone of the Sleeper's spine on an iron haft. Nothing stands after the third blow.|Позвонок Спящего на железной рукояти. После третьего удара не устоит никто.|Temir dastaga o'rnatilgan Uxlovchi umurtqasi. Uchinchi zarbadan keyin hech kim oyoqda turolmaydi.`,
    setup(d) { d.combo[2].stun = 80; } });

  /* ---------- 3. Knives and daggers (Agility) ---------- */
  const knifeBleed = { bleed: { t: 150, dps: 1.6, max: 5 } };
  weapon({ id: 'yd_wax_knife', base: 'kanjar', cat: 'knife', tier: 1, scal: { agi: 'A' }, dm: [7, 7, 8, 10],
    art: ['dagger', { blade: '#d8d0b8', bladeL: '#ffffff', len: 8 }, { cu: 3, cv: 0 }],
    name: `Wax knife|Нож для воска|Mum pichog'i`, desc: `Every yodchi carries one to cut tumar seals. Four quick cuts; a blow in the back is critical.|Такой нож есть у каждого ёдчи — срезать печати с тумаров. Четыре быстрых удара; удар в спину — критический.|Har bir yodchida bor: tumar muhrlarini kesish uchun. To'rtta tez zarba; orqadan urilgan zarba — kritik.` });
  weapon({ id: 'kanjar', base: 'kanjar', cat: 'knife', tier: 2, scal: { agi: 'A', str: 'D' }, status: knifeBleed,
    name: `Smuggler's twin knives|Ножи контрабандиста|Kontrabandachi pichoqlari`, desc: `Two curved knives from the Karez. Every cut bleeds.|Два кривых ножа из кяриза. Каждый удар пускает кровь.|Korizdan chiqqan ikki egri pichoq. Har zarba qon oqizadi.` });
  weapon({ id: 'oraq', base: 'oraq', cat: 'knife', tier: 2, scal: { agi: 'B', end: 'C' }, dm: [8, 8, 11],
    name: `Sickle of the Tail|Серп Хвоста|Dum o'rog'i`, desc: `For wheat, for debts. Quick cuts make enemies bleed; the third pulls them close.|Для пшеницы и для долгов. Быстрые удары пускают кровь; третий подтягивает врага.|Bug'doy uchun ham, qarz uchun ham. Tez zarbalar qon oqizadi; uchinchisi dushmanni tortib keladi.` });
  weapon({ id: 'yd_thief_dagger', base: 'kanjar', cat: 'knife', tier: 3, scal: { agi: 'S' }, req: { agi: 10 }, dm: [7, 7, 8, 11], tempo: 0.88,
    art: ['dagger', { blade: '#b8c0cc', guard: '#8a6a3a', pommel: '#c8302a', len: 9, curve: -0.2 }, { cu: 3, cv: 0 }],
    name: `Thief's dagger|Кинжал вора|O'g'ri xanjari`, desc: `Thin, quiet, fast. A thief of the Night Market swore by it.|Тонкий, тихий, быстрый. Вор с Ночного рынка клялся, что лучше не бывает.|Ingichka, tovushsiz, tez. Tungi bozordagi o'g'ri uni hammasidan a'lo derdi.` });
  weapon({ id: 'yd_hook_knife', base: 'yd_hook_knife', cat: 'knife', tier: 3, scal: { agi: 'A', mem: 'D' }, status: knifeBleed,
    name: `Smuggler's hooked knife|Крюк-нож контрабандиста|Kontrabandachining ilmoqli pichog'i`, desc: `Made for cutting tumar cords in a crowd. Every cut bleeds; the fourth hooks the enemy closer.|Им срезают тумары с шеи в толпе. Каждый удар пускает кровь; четвёртый подтягивает врага.|Olomon ichida tumar iplarini kesish uchun. Har zarba qon oqizadi; to'rtinchisi dushmanni tortib keladi.` });
  weapon({ id: 'yd_ash_dagger', base: 'kanjar', cat: 'knife', tier: 5, scal: { agi: 'S', mem: 'C' }, req: { agi: 14 }, dm: [8, 8, 9, 12], status: { bleed: { t: 180, dps: 2, max: 5 } },
    art: ['dagger', { blade: '#3a3440', bladeL: '#c9b4ff', guard: '#8a8090', len: 10, glow: '#c9b4ff' }, { cu: 3, cv: 0 }],
    name: `Dagger of Those Who Remember|Кинжал Помнящих|Eslaganlar xanjari`, desc: `Ash-black steel. Its cuts bleed long and quietly.|Пепельно-чёрная сталь. Раны от неё кровоточат долго и тихо.|Kuldek qora po'lat. Yarasi uzoq va jimgina qonaydi.` });

  /* ---------- 4. Shield and mace (Strength + Endurance) ---------- */
  weapon({ id: 'shokpar', base: 'shokpar', cat: 'shield', move: 'mace', tier: 1, scal: { str: 'B', end: 'C' }, sub: 'mace',
    name: `Mace of the Divan|Палица Дивана|Devon gurzisi`, desc: `A studded club that settles debts. Heavy blows, the third stuns.|Окованная дубина: ею решают споры о долгах. Тяжёлые удары, третий оглушает.|Qarz janjallarini hal qiladigan tikanli gurzi. Og'ir zarbalar, uchinchisi gangitadi.` });
  weapon({ id: 'yd_guard_mace', base: 'shokpar', cat: 'shield', move: 'mace', tier: 2, scal: { str: 'A', end: 'C' }, req: { str: 9 }, sub: 'mace', dm: [14, 15, 25],
    art: ['mace', { head: '#9aa2b0', spike: '#e8ecf4' }, { cu: 6, cv: 0 }], patch: { smearColor: '#f0f0f4', smearColor2: '#9aa2b0' },
    name: `Guard's mace|Булава стражника|Soqchi gurzisi`, desc: `An iron ball with blunt flanges, the Ark's door-breaker.|Железный шар с тупыми рёбрами: им в Арке вышибают двери.|To'mtoq qirrali temir shar: Arkda u bilan eshik buzishadi.` });
  weapon({ id: 'yd_morning_star', base: 'shokpar', cat: 'shield', move: 'mace', tier: 4, scal: { str: 'A', end: 'B' }, req: { str: 13, end: 10 }, sub: 'mace', dm: [15, 16, 27],
    art: ['mace', { head: '#4a4a58', headL: '#8a8a9a', spike: '#ffe7a6', r: 3.6, grip: '#2a1a14' }, { cu: 6, cv: 0 }], patch: { smearColor: '#ffe7a6', smearColor2: '#a87a30' },
    name: `Star of the Well|Звезда Колодца|Quduq yulduzi`, desc: `Black iron, golden spikes; forged for the Well's wardens.|Чёрное железо, золотые шипы; выкована для стражей Колодца.|Qora temir, oltin tikanlar; Quduq qo'riqchilari uchun yasalgan.`,
    setup(d) { d.combo[2].stun = 60; } });
  const shield = o => weapon(Object.assign({ cat: 'shield', sub: 'shield', st: 6 }, o, { setup(d) { d.block = o.block; d.parryWindow = o.parryWindow; d.parryDmg = o.parryDmg; if (o.setup2) o.setup2(d); } }));
  shield({ id: 'kalkan', base: 'kalkan', tier: 1, scal: { end: 'B', str: 'D' }, block: 0.75, parryWindow: 9, parryDmg: 22,
    name: `Tumar shield|Щит с тумаром|Tumarli qalqon`, desc: `A round shield with a mother's tumar sewn to the boss. Hold to block; raise it at the moment of the blow to parry.|Круглый щит, на умбоне — материнский тумар. Держи — блок; подними в миг удара — парирование.|O'rtasiga onaning tumari tikilgan dumaloq qalqon. Ushlab tursang — to'sadi; zarba payti ko'tarsang — qaytaradi.` });
  shield({ id: 'yd_white_shield', base: 'kalkan', tier: 2, scal: { end: 'A' }, block: 0.82, parryWindow: 9, parryDmg: 24, rec: { sat: 0.15, light: 0.35, minSat: 0 },
    name: `White-cap shield|Щит белых шапок|Oq qalpoqlilar qalqoni`, desc: `The Singers' guards carry these. Blocks more.|С такими ходят стражи Певцов. Держит больше.|Bunday qalqonni Xonandalar soqchilari olib yuradi. Ko'proq zarbani ushlaydi.` });
  shield({ id: 'yd_caravan_buckler', base: 'kalkan', tier: 2, scal: { agi: 'B', end: 'C' }, block: 0.66, parryWindow: 13, parryDmg: 26, st: 4, rec: { hue: 30, sat: 0.8, minSat: 0.05 },
    name: `Caravan buckler|Кулачный щит караванщика|Karvonchi qalqonchasi`, desc: `Small and light: a wide parry window, a weaker block.|Маленький и лёгкий: окно парирования шире, блок слабее.|Kichik va yengil: qaytarish oynasi keng, to'sish kuchsizroq.` });
  shield({ id: 'yd_divan_shield', base: 'kalkan', tier: 4, scal: { str: 'B', end: 'A' }, req: { end: 12 }, block: 0.9, parryWindow: 8, parryDmg: 30, rec: { hue: 45, sat: 1.5, minSat: 0.05, map: { '#b8343a': '#e2b452' } },
    name: `Gilded shield of the Divan|Золочёный щит Дивана|Devonning zarhal qalqoni`, desc: `Heavy gilded steel. Almost nothing gets through.|Тяжёлая золочёная сталь. Сквозь неё почти ничего не проходит.|Og'ir zarhal po'lat. Undan deyarli hech narsa o'tmaydi.` });

  /* ---------- 5. Sling, bow, crossbow (Agility) ---------- */
  weapon({ id: 'sopak', base: 'sopak', cat: 'ranged', tier: 1, scal: { agi: 'B' }, sub: 'sling', st: 9,
    name: `Shepherd's sling|Праща пастуха|Cho'pon sopqoni`, desc: `Whirl and loose a stone: it stuns and ricochets to the next target.|Раскрути и метни камень: он оглушает и отскакивает к следующей цели.|Aylantirib tosh ot: u gangitadi va keyingi nishonga sakraydi.`,
    setup(d) { d.dmgMul = 10 / 15; } });
  weapon({ id: 'yd_tumar_sling', base: 'yd_tumar_sling', cat: 'ranged', tier: 2, scal: { agi: 'B', mem: 'C' }, sub: 'sling',
    name: `Tumar sling|Праща с тумарами|Tumarli sopqon`, desc: `Slings old tumars instead of stones; each one that lands gives you back a little life.|Мечет старые тумары вместо камней; каждый попавший возвращает немного жизни.|Tosh o'rniga eski tumarlarni otadi; har tekkani ozgina jon qaytaradi.`,
    setup(d) { d.dmgMul = 10.5 / 15; } });
  weapon({ id: 'sadak', base: 'sadak', cat: 'ranged', tier: 1, scal: { agi: 'A' }, sub: 'bow', st: 8,
    name: `Rabat bow|Лук Рабата|Rabot kamoni`, desc: `A caravan guard's composite bow. Arrows that fly far strike critically.|Составной лук караванной охраны. Стрелы, пущенные издалека, бьют критически.|Karvon soqchisining murakkab kamoni. Uzoqqa uchgan o'qlar kritik uradi.`,
    setup(d) { d.dmg = 10; d.drawT = 16; d.recover = 11; } });
  weapon({ id: 'yd_vulture_bow', base: 'sadak', cat: 'ranged', tier: 3, scal: { agi: 'S' }, req: { agi: 11 }, sub: 'bow', rec: { hue: -20, sat: 0.6, light: -0.1, minSat: 0.05 },
    name: `Vulture-hunter's bow|Лук ловца стервятников|Tasqara ovchisi kamoni`, desc: `Horn and sinew from the Tower of Silence. Strong and swift.|Рог и жилы с Башни молчания. Мощный и быстрый.|Sukunat minorasidan olingan shox va pay. Kuchli va tez.`,
    setup(d) { d.dmg = 13; d.drawT = 14; d.recover = 10; } });
  weapon({ id: 'yd_smuggler_bow', base: 'sadak', cat: 'ranged', tier: 2, scal: { agi: 'A', str: 'D' }, sub: 'bow', rec: { hue: 160, sat: 0.5, minSat: 0.05 },
    name: `Smuggler's short bow|Короткий лук контрабандиста|Kontrabandachi kalta kamoni`, desc: `For tunnels: two arrows at once, short range.|Для тоннелей: две стрелы разом, бьёт недалеко.|Tunnellar uchun: bir yo'la ikki o'q, yaqin masofa.`,
    setup(d) { d.dmg = 6; d.count = 2; d.spread = 0.1; d.drawT = 15; d.recover = 12; d.projectile = Object.assign({}, d.projectile, { life: 45 }); } });
  const xbowFire = (dmg, pierce, col) => function (p, item) {
    const i = p.facing, h = WL.wpt(p, 14, -0.5);
    G.world.add(new G.Projectile({
      x: p.x + 4 * i, y: h.y, vx: 11 * i, vy: 0, r: 2, faction: 'player', owner: p, dmg: G.Combat.playerDmg(item, dmg), life: 50, pierce,
      kbx: 3.5, kby: -1, heavy: true, hitstop: 5, shake: 0.25, color: col, info: { item, type: 'ranged' },
      trail: { color: col, life: 6, size: 1, every: 1 }
    }));
    aimAssist(p, G.world.ents[G.world.ents.length - 1]);
    G.FX.sparks(h.x, h.y, 5, i, { speed: 3, color2: '#e8e0c8' });
    p.vx -= 1.4 * i; G.shake(0.2);
    sfx('bow', { x: p.x, pitch: 0.7 });
  };
  weapon({ id: 'multuk', base: 'multuk', cat: 'ranged', tier: 2, scal: { agi: 'B', str: 'C' }, sub: 'crossbow', st: 12,
    art: ['crossbow', {}, { cu: 4, cv: 0 }],
    name: `Divan crossbow|Самострел Дивана|Devon arbaleti`, desc: `Slow to wind, hits like a door. The bolt pierces one enemy.|Долго взводить, зато бьёт, как дверью. Болт пробивает одного врага.|Tortish uzoq, ammo eshik bilan urgandek uradi. O'q bitta dushmanni teshib o'tadi.`,
    setup(d) { d.aimT = 30; d.recover = 24; d.fire = xbowFire(30, 1, '#ffe2a0'); d.drawFx = null; } });
  weapon({ id: 'yd_heavy_xbow', base: 'multuk', cat: 'ranged', tier: 4, scal: { str: 'B', agi: 'B' }, req: { str: 10 }, sub: 'crossbow', st: 14,
    art: ['crossbow', { stock: '#4a2e1c', arm: '#2a2a34', bolt: '#ffe7a6' }, { cu: 4, cv: 0 }],
    name: `Heavy crossbow|Тяжёлый самострел|Og'ir arbalet`, desc: `An iron arm and a windlass. The bolt goes through three.|Железные дуги и ворот. Болт прошивает троих.|Temir yoy va chig'ir. O'q uch kishini teshib o'tadi.`,
    setup(d) { d.aimT = 36; d.recover = 26; d.fire = xbowFire(38, 3, '#fff0c0'); d.drawFx = null; } });
  weapon({ id: 'yd_reed_sling', base: 'sopak', cat: 'ranged', tier: 3, scal: { agi: 'A' }, sub: 'sling', rec: { hue: 80, sat: 0.7, minSat: 0.05 },
    name: `Plaited reed sling|Плетёная праща|To'qilgan sopqon`, desc: `Karez reeds and silk thread: whirls fast.|Кяризный камыш и шёлковая нить: раскручивается быстро.|Koriz qamishi va ipak ip: tez aylanadi.`,
    setup(d) { d.dmgMul = 11 / 15; d.whirlT = 15; } });

  /* ---------- 6. Dutar and drum (Memory) ---------- */
  weapon({ id: 'yd_tail_dutar', base: 'kylysh', cat: 'dutar', move: 'dutar', tier: 1, scal: { mem: 'B', agi: 'D' }, waveCol: '#ffe7a6',
    art: ['dutar', {}, { cu: 6, cv: 0 }], patch: { tipLen: 20, smearColor: '#ffe7a6', smearColor2: '#c8a868' },
    name: `Tail dutar|Дутар Хвоста|Dum dutori`, desc: `Two strings and a cracked bowl. Each strike rings out around you; hold for a burning chord (Hollowness +1).|Две струны и треснувшая чаша. Каждый удар звенит вокруг тебя; удержи — горящий аккорд (Пустота +1).|Ikki tor va yorilgan kosa. Har zarba atrofingda jaranglaydi; bosib tursang — yonuvchi akkord (Bo'shliq +1).` });
  weapon({ id: 'yd_bakhshi_dutar', base: 'kylysh', cat: 'dutar', move: 'dutar', tier: 2, scal: { mem: 'A', agi: 'D' }, req: { mem: 7 }, waveCol: '#9ff3e6',
    art: ['dutar', { body: '#6a3a22', bodyL: '#b07a44', tassel: '#2fb3b8' }, { cu: 6, cv: 0 }], patch: { tipLen: 20, smearColor: '#9ff3e6', smearColor2: '#2fb3b8' },
    name: `Bakhshi's dutar|Дутар бахши|Baxshi dutori`, desc: `Mulberry wood, silk strings. Sings wider.|Шелковица и шёлковые струны. Звенит шире.|Tut yog'ochi, ipak torlar. Ovozi kengroq yoyiladi.` });
  weapon({ id: 'yd_bone_dutar', base: 'kylysh', cat: 'dutar', move: 'dutar', tier: 4, scal: { mem: 'S' }, req: { mem: 13 }, waveCol: '#e8dcc0',
    art: ['dutar', { body: '#e8dcc0', bodyL: '#ffffff', neck: '#a89878', hole: '#3a2a20', tassel: '#c9b4ff' }, { cu: 6, cv: 0 }], patch: { tipLen: 20, smearColor: '#ffffff', smearColor2: '#c9b4ff' },
    name: `Bone dutar|Костяной дутар|Suyak dutor`, desc: `Its bowl is a piece of the Sleeper's skull. It hears more than it plays.|Его чаша — кусок черепа Спящего. Он больше слышит, чем играет.|Kosasi — Uxlovchi bosh suyagining bir bo'lagi. Chalishdan ko'ra ko'proq eshitadi.` });
  weapon({ id: 'yd_singer_doira', base: 'shokpar', cat: 'dutar', move: 'drum', tier: 2, scal: { mem: 'A', end: 'D' }, req: { mem: 6 }, waveCol: '#f2ead0',
    art: ['drum', {}, { cu: 3, cv: 0 }], patch: { tipLen: 10, smearColor: '#f2ead0', smearColor2: '#c8a868' },
    name: `Singers' doira|Дойра Певцов|Xonandalar doirasi`, desc: `A frame drum of the tithe. Slow, heavy beats that ring in a circle around you.|Бубен, под который собирают десятину. Медленные тяжёлые удары звенят кругом.|Ushr yig'ilganda chalinadigan doira. Sekin, og'ir zarbalar atrofingda halqa bo'lib jaranglaydi.` });
  weapon({ id: 'yd_guard_nagora', base: 'shokpar', cat: 'dutar', move: 'drum', tier: 3, scal: { mem: 'B', str: 'C' }, req: { str: 8 }, waveCol: '#ffb070',
    art: ['drum', { frame: '#6a1c22', skin: '#d8c090', r: 7, jingle: '#c8a868' }, { cu: 3, cv: 0 }], patch: { tipLen: 10, smearColor: '#ffb070', smearColor2: '#a83a2a' },
    name: `Watch nagora|Нагора дозора|Qorovul nog'orasi`, desc: `The drum that called the Divan's patrols. Louder, heavier, stuns.|Барабан, которым созывали дозоры Дивана. Громче, тяжелее, оглушает.|Devon soqchilarini chaqirgan nog'ora. Balandroq, og'irroq, gangitadi.`,
    setup(d) { d.combo[1].stun = 40; } });
  weapon({ id: 'yd_cloister_doira', base: 'shokpar', cat: 'dutar', move: 'drum', tier: 5, scal: { mem: 'S' }, req: { mem: 15 }, waveCol: '#c9b4ff',
    art: ['drum', { frame: '#2a2040', skin: '#f2ead0', ring: '#c9b4ff', jingle: '#e8e0ff', mark: '#7a5ac8' }, { cu: 3, cv: 0 }], patch: { tipLen: 10, smearColor: '#c9b4ff', smearColor2: '#7a5ac8' },
    name: `Doira of the Cloister|Дойра Обители|Xonaqoh doirasi`, desc: `Played only on the Night of Payment. Its ring makes the air forget.|На ней играют только в Ночь Уплаты. От её звона забывает даже воздух.|Faqat To'lov kechasida chalinadi. Jarangidan havo ham unutadi.` });

  /* ---------- 7. Tumar foci (Memory) ---------- */
  const focus = o => weapon(Object.assign({ cat: 'focus', base: 'kylysh' }, o, {
    setup(d) {
      d.kind = 'ydcast'; d.combo = null; d.air = null; d.heavyStep = null;
      d.castT = o.castT || 9; d.recover = o.recover || 16; d.boltDmg = o.bolt || 11; d.burnDmg = o.burnDmg || 42; d.glowCol = o.glow || '#7fe8dc';
      d.boltStatus = o.boltStatus || null; d.burnStatus = o.burnStatus || null; d.burnPal = o.burnPal || 'fire'; d.pierce = o.pierce || 0;
      d.dmg = d.boltDmg;
    }
  }));
  focus({ id: 'yd_apprentice_tumar', tier: 1, scal: { mem: 'B' }, art: ['focus', {}, { cu: 3, cv: 0 }],
    name: `Apprentice's tumar|Тумар подмастерья|Shogird tumari`, desc: `A charged amulet: loose a seeking bolt of memory; hold to Burn it in a blast (Hollowness +1).|Заряженный амулет: пускает самонаводящийся сгусток памяти; удержи — Сожжение со взрывом (Пустота +1).|Zaryadlangan tumar: nishonni o'zi topadigan xotira o'qini otadi; bosib tursang — Yondirish, portlash bilan (Bo'shliq +1).` });
  focus({ id: 'yd_salt_tumar', tier: 2, scal: { mem: 'A' }, req: { mem: 7 }, glow: '#f4f0e8', boltStatus: { poison: { t: 150, dps: 1.6, max: 5 } },
    art: ['focus', { body: '#e8e4dc', bodyL: '#ffffff', gem: '#8fe35a' }, { cu: 3, cv: 0 }],
    name: `Salt tumar|Тумар соли|Tuz tumari`, desc: `Salt from the flats sewn into leather. Its bolts poison.|Соль солончака, зашитая в кожу. Его сгустки отравляют.|Charmga tikilgan sho'rxok tuzi. O'qlari zaharlaydi.` });
  focus({ id: 'yd_wax_tumar', tier: 2, scal: { mem: 'A', end: 'D' }, glow: '#f2ead0', boltStatus: { slow: { t: 90 } }, burnPal: 'gold',
    art: ['focus', { body: '#f2ead0', bodyL: '#ffffff', gem: '#e2b452', cord: '#8a6a3a' }, { cu: 3, cv: 0 }],
    name: `Wax tumar|Тумар воска|Mum tumari`, desc: `Sealed with white wax. Its bolts slow.|Запечатан белым воском. Его сгустки замедляют.|Oq mum bilan muhrlangan. O'qlari sekinlashtiradi.` });
  focus({ id: 'yd_ash_tumar', tier: 3, scal: { mem: 'S', agi: 'D' }, req: { mem: 10 }, glow: '#c9b4ff', castT: 8, recover: 14, burnPal: 'violet',
    art: ['focus', { body: '#3a3440', bodyL: '#8a8090', gem: '#c9b4ff', cord: '#2a2030', glow: '#c9b4ff' }, { cu: 3, cv: 0 }],
    name: `Ash tumar|Тумар пепла|Kul tumari`, desc: `Those Who Remember burn the tithe into these. Fast casts.|Помнящие сжигают в них десятину. Быстрые заклинания.|Eslaganlar ushrni shularga solib yondiradi. Afsunlar tez.` });
  focus({ id: 'yd_well_tumar', tier: 4, scal: { mem: 'S' }, req: { mem: 13 }, glow: '#5ac8d8', pierce: 1, bolt: 12, burnDmg: 46,
    art: ['focus', { body: '#1f4a56', bodyL: '#5ac8d8', gem: '#ffffff', cord: '#0e2a32', glow: '#5ac8d8' }, { cu: 3, cv: 0 }],
    name: `Tumar of the Well|Тумар Колодца|Quduq tumari`, desc: `Water from the bottom of the Well, set in silver. Its bolts pierce.|Вода со дна Колодца в серебряной оправе. Его сгустки пробивают насквозь.|Quduq tubidan olingan suv, kumushga solingan. O'qlari teshib o'tadi.` });
  focus({ id: 'yd_prayer_tumar', tier: 5, scal: { mem: 'A', end: 'C' }, req: { mem: 14, end: 8 }, glow: '#ffd27a', bolt: 12, burnDmg: 50,
    art: ['focus', { body: '#a8762a', bodyL: '#ffe7a6', gem: '#ff8a7a', glow: '#ffd27a' }, { cu: 3, cv: 0 }],
    name: `Tumar of a stranger's prayer|Тумар чужой молитвы|Begona duo tumari`, desc: `Someone prayed into it for forty years. It answers anyone.|В него сорок лет молился кто-то чужой. Отвечает любому.|Unga kimdir qirq yil duo qilgan. U hammaga javob beradi.` });

  // whips and the jug stay registered (old saves) but leave the drop pool: not one of the seven categories
  for (const id of ['kamcha', 'yd_eel_whip', 'zhezde']) if (ID[id]) { ID[id].noDrop = true; ID[id].yd = Object.assign({ cat: 'sabre', tier: 2, power: 1.2, scal: { agi: 'B' }, st: 10, price: 200 }, ID[id].yd || {}); }

  // the engine's own techniques (falcon, oil jug, needles, snare, drum, kobyz, smoke, ward, Burn, Alla) stay as
  // rarer finds for the skill slots; they scale with an attribute, Memory and the level like the branch techniques
  const SKILL_SCAL = { red: { str: 'B', mem: 'C' }, purple: { agi: 'B', mem: 'C' }, green: { end: 'B', mem: 'C' } };
  for (const id in ID) {
    const d = ID[id];
    if (!d || d.slot !== 'skill' || d.yd || /^ys_/.test(id)) continue;
    d.yd = { cat: 'technique', skill: true, power: 1, scal: SKILL_SCAL[d.color] || { mem: 'B' }, price: 160, found: true };
    d.weight = d.noDrop ? 0 : 1; d.minStage = Math.max(d.minStage || 0, 0.8);
  }

  /* ================================================================ legendary weapons */
  const LEG = YI.LEG = { cradleUsed: false };
  const LEG_MOVES = YI.LEG_MOVES = {
    knock: { cd: 480, heavy(p, item, ws, hs) { return [Object.assign(hs, { dmg: hs.dmg * 1.25, stun: 150, poiseMul: 6, legend: true, glint: true, slamK: 2, smear: { r0: 9, r1: 40, color: '#ffffff', color2: '#e2b452', life: 16 } })]; } },
    hunt: { cd: 600, heavy(p, item, ws, hs) {
      const tg = nearestFoe(p, 150); if (!tg) return null;
      p.x = tg.x - p.facing * Math.max(14, (tg.w || 12) / 2 + 10); p.facing = Math.sign(tg.x - p.x) || p.facing;
      G.FX.ghost('#ffd27a', 13, 0.5); sfx('whoosh', { x: p.x });
      const k = S().legends.gilded_gift ? 1.25 : 1, base = Object.assign({}, hs, { lunge: 0.6, legend: true, recover: 6, windup: 3 });
      ws.huntTarget = tg;
      return [0, 1, 2].map(i => Object.assign({}, base, { dmg: 24 * k, pose: i === 1 ? 'slash2' : i === 2 ? 'overhead' : 'slash', poseOverride: null, box: [-4, -38, 36, 40], reach: 34, recover: i === 2 ? 18 : 4, chainAt: 1, onHitEnemy: i === 2 ? huntEnd : undefined }));
    } },
    dastan: { cd: 1200, heavy(p, item, ws, hs) {
      for (const e of G.world.enemies) if (e && !e.dead && G.onScreen(e.x, e.y)) { const b = e.isBossPart ? e.boss : e; b._forgetT = b.isBoss ? 120 : 180; }
      G.FX.flash('#fff6d8', 0.35); G.FX.ring(p.x, p.cy, 8, 240, '#ffe7a6', 30, { width: 3 });
      toast(t(`Dastan: the enemies are blind|Дастан: враги ослеплены|Doston: dushmanlar ko'r bo'ldi`), '#ffe7a6');
      return [Object.assign(hs, { legend: true, box: [-80, -60, 160, 66], reach: 80 })];
    } },
    chain: { cd: 480, heavy(p, item, ws, hs) {
      for (const e of G.world.enemies) if (e && !e.dead && !e.isBoss && !e.isBossPart && Math.abs(e.x - p.x) < 130 && Math.abs(e.cy - p.cy) < 60) { e.x += (p.x + p.facing * 24 - e.x) * 0.6; e.addStatus('stun', { t: 40 }); }
      G.FX.ring(p.x, p.cy, 130, 10, '#c8d0ff', 18, { width: 2 });
      CH.magicVoid(1 / Math.max(0.25, CH.voidMagicMul()), `the chain remembers|цепь помнит|zanjir eslaydi`);
      return [Object.assign(hs, { legend: true, box: [-70, -52, 140, 58], reach: 70, kbx: -2.5, dmg: hs.dmg * 1.1 })];
    } },
    blizzard: { cd: 0 }, seal: { cd: 0 }, drown: { cd: 0 },
    humo: { cd: 600 },
    stones: { cd: 300 },
    cradle: { cd: 0, cast(p, item) {
      LEG.cradleUsed = true;
      const dmg = G.Combat.playerDmg(item, 40);
      G.Combat.area(p, { x: p.x - 120, y: p.y - 70, w: 240, h: 76 }, tg => ({ dmg, type: 'magic', magic: true, item, legend: true, kbx: 3, kby: -2, dir: Math.sign(tg.x - p.x) || 1 }), new Set());
      const w = G.PROG && G.PROG.ward; if (w) { w.left = Math.round(p.maxHp * 0.25); w.until = now() + 12; }
      G.FX.ring(p.x, p.cy, 8, 130, '#ffe2a8', 30, { width: 3 }); G.FX.flash('#fff0d8', 0.3);
      toast(t(`A lullaby, without a price.|Колыбельная — даром.|Alla — tekinga.`), '#ffe2a8');
    } }
  };
  function huntEnd(p, item, ws, tg) {
    if (tg && !tg.dead && tg.maxHp && tg.hp < tg.maxHp * 0.3 && !ws._huntAgain) { ws._huntAgain = true; item.cd = 0; G.FX.text(p.x, p.top - 14, t(`Again!|Ещё!|Yana!`), '#ffd27a', { size: 8 }); }
  }
  function nearestFoe(p, r) {
    let best = null, bd = r;
    for (const e of G.world.enemies) { if (!e || e.dead || e.untargetable) continue; const d = Math.hypot(e.x - p.x, e.cy - p.cy); if (d < bd) { bd = d; best = e; } }
    return best;
  }
  // a legendary in the hand glows and sheds sparks
  function legendHeld(h0, col) {
    return function (ctx, item, ws, p) {
      h0.apply(this, arguments);
      if (p && p === pl() && G.frame % 7 === 0) { const h = WL.wpt(p, 10, 0); G.FX.spawn({ x: h.x + U.rand(-4, 4), y: h.y + U.rand(-4, 4), vy: -U.rand(0.2, 0.6), life: 22, size: 1, color: col, glow: true }); }
      if (p && p === pl()) { const h = WL.wpt(p, 8, 0); G.Glow.add(h.x, h.y, 16, col, 0.35); }
    };
  }
  const LEGENDS = YI.LEGENDS = {};
  function legend(o) {
    const d = weapon(Object.assign({ legend: true, drop: false, tier: o.tier || 4 }, o));
    d.yd.legend = true; d.yd.legendMove = o.move2; d.yd.price = 0; d.noDrop = true;
    if (d.held) d.held = legendHeld(d.held, o.glow || '#ffd27a');
    d.legendName = N(o.moveName); d.legendDesc = N(o.moveDesc);
    LEGENDS[o.key] = { id: o.id, where: o.where };
    return d;
  }
  legend({ key: 'rustam', id: 'leg_rustam_staff', base: 'aibalta', cat: 'staff', tier: 4, power: 2.0, scal: { str: 'A', end: 'B' }, move2: 'knock', glow: '#ffe7a6', dm: [17, 19, 31],
    art: ['staff', { wood: '#5a3a22', woodL: '#8a5a32', ring: '#e2b452', knob: 2.6, knobCol: '#e2b452', knobL: '#fff4d0', tassel: '#c8302a' }, { cu: 6, cv: 0 }], patch: { twoHand: true, tipLen: 22, smearColor: '#fff4d0', smearColor2: '#e2b452' },
    name: `Rustam's staff|Посох Рустама|Rustamning hassasi`, desc: `For forty years it knocked on the doors of the Tail.|Сорок лет им стучали в двери Хвоста.|Qirq yil u bilan Dum eshiklarini taqillatishgan.`,
    moveName: `The Knock|Стук|Taqillatish`, moveDesc: `Charged: a blow that stuns any enemy that is not a boss at once; on a boss — a huge blow to its balance. Cooldown 8 s.|Заряженный: удар сразу оглушает любого врага, кроме босса; боссу — огромный урон по равновесию. Перезарядка 8 с.|Zaryadlangan: bossdan boshqa har qanday dushmanni darhol gangitadi; bossning muvozanatiga — katta zarar. Tiklanish 8 s.`,
    where: 'Sleepy chaikhana, Rustam\'s last words (Act I) — or taken from the Hollow Rustam earlier' });
  legend({ key: 'gilded_fang', id: 'leg_gilded_fang', base: 'kylysh', cat: 'sabre', tier: 4, power: 2.1, scal: { agi: 'A', str: 'B' }, move2: 'hunt', glow: '#ffd27a',
    rec: { hue: 45, sat: 1.6, minSat: 0.05, map: { '#d4ddf0': '#ffe08a' } },
    name: `The Gilded Fang|Золотой клык|Oltin qoziq`, desc: `Bahodir's blade, the Hound of the Divan.|Клинок Баходира, Пса Дивана.|Devon iti Bahodirning tig'i.`,
    moveName: `The Hunt|Охота|Ov`, moveDesc: `Charged: dash to the nearest enemy and strike three times; if it is left below 30%, the hunt is ready again. Stronger if Bahodir gave it to you. Cooldown 10 s.|Заряженный: рывок к ближайшему врагу и три удара; если у него осталось меньше 30% — «Охота» снова готова. Сильнее, если Баходир отдал клинок сам. Перезарядка 10 с.|Zaryadlangan: eng yaqin dushmanga otilib, uch zarba; unda 30% dan kam jon qolsa — «Ov» yana tayyor. Bahodir o'zi bergan bo'lsa, kuchliroq. Tiklanish 10 s.`,
    where: 'Bahodir\'s court (b_court): spare him and show his loyalty was planted — a gift (G.CH.grantLegend(\'gilded_fang\',{gift:true})); or kill him and take it' });
  legend({ key: 'turab', id: 'leg_turab_dutar', base: 'kylysh', cat: 'dutar', move: 'dutar', tier: 4, power: 2.0, scal: { mem: 'S', agi: 'C' }, move2: 'dastan', glow: '#9ff3e6', waveCol: '#9ff3e6',
    art: ['dutar', { body: '#8a4a1a', bodyL: '#e2b452', neck: '#5a3a22', tassel: '#2fb3b8', peg: '#ffe7a6', string: '#9ff3e6' }, { cu: 6, cv: 0 }], patch: { tipLen: 20, smearColor: '#9ff3e6', smearColor2: '#2fb3b8' },
    name: `Turab's dutar|Дутар Тураба|Turobning dutori`, desc: `The echo of his voice is still in the strings.|В струнах ещё живёт эхо его голоса.|Torlarida hamon uning ovozi aks-sado beradi.`,
    moveName: `Dastan|Дастан|Doston`, moveDesc: `Charged: a song that blinds every enemy on screen for 3 s (a boss for 2 s). Cooldown 20 s.|Заряженный: песня ослепляет всех врагов на экране на 3 с (босса — на 2 с). Перезарядка 20 с.|Zaryadlangan: ekrandagi hamma dushmanlarni 3 s ko'r qiladigan qo'shiq (bossni — 2 s). Tiklanish 20 s.`,
    where: 'Turab\'s quest "The last song" after his voice is returned at the auction' });
  legend({ key: 'seven_link', id: 'leg_seven_link', base: 'naiza', cat: 'staff', tier: 5, power: 2.25, scal: { str: 'A', mem: 'B' }, move2: 'chain', glow: '#c8d0ff', dm: [16, 18, 30],
    rec: { hue: 230, sat: 0.4, light: -0.15, minSat: 0.05, map: { '#c8302a': '#8a90b0' } },
    name: `Link of the Seven|Звено Семерых|Yettilar halqasi`, desc: `A piece of the chain that bound the Sleeper. Every blow with it costs a little Hollowness: it remembers what it was forged for.|Кусок цепи, которой сковали Спящего. Каждый удар им стоит немного Пустоты: цепь помнит, для чего её ковали.|Uxlovchini kishanlagan zanjirning bir bo'lagi. U bilan har zarba ozgina Bo'shliqqa tushadi: zanjir nima uchun yasalganini eslaydi.`,
    moveName: `Bind|Сковать|Kishanlash`, moveDesc: `Charged: the chain sweeps around you and drags enemies in (Hollowness +1). Cooldown 8 s.|Заряженный: цепь хлещет вокруг и стягивает врагов (Пустота +1). Перезарядка 8 с.|Zaryadlangan: zanjir atrofni savalab, dushmanlarni tortib keladi (Bo'shliq +1). Tiklanish 8 s.`,
    where: 'The bottom of the Well, after the Seven (b_seven)' });
  legend({ key: 'first_wax', id: 'leg_first_wax', base: 'kanjar', cat: 'knife', tier: 4, power: 2.0, scal: { agi: 'S', mem: 'C' }, move2: 'seal', glow: '#f2ead0',
    art: ['dagger', { blade: '#f2ead0', bladeL: '#ffffff', guard: '#e2b452', pommel: '#c9b4ff', len: 10, glow: '#ffffff' }, { cu: 3, cv: 0 }],
    name: `Knife of the first wax|Нож первого воска|Birinchi mum pichog'i`, desc: `It sealed Yodgor's first tumar.|Им запечатали первый тумар Ёдгора.|U bilan Yodgorning birinchi tumari muhrlangan.`,
    moveName: `Seal|Запечатать|Muhrlash`, moveDesc: `Every blow steals 10% of its damage as health; a blow in the back seals the enemy in place for 2 s.|Каждый удар крадёт 10% урона в виде здоровья; удар в спину запечатывает врага на месте на 2 с.|Har zarba zararning 10% ini sog'liq qilib o'g'irlaydi; orqadan zarba dushmanni 2 s joyiga muhrlab qo'yadi.`,
    where: 'The Cloister archive, the Singers\' arc (or stolen)' });
  legend({ key: 'humo', id: 'leg_humo_shield', base: 'kalkan', cat: 'shield', sub: 'shield', st: 6, tier: 5, power: 2.1, scal: { end: 'A', str: 'B' }, move2: 'humo', glow: '#ffd27a',
    rec: { hue: 40, sat: 1.6, light: 0.1, minSat: 0.1, map: { '#b8343a': '#e2b452', '#8a1c22': '#ffe7a6' } },
    setup(d) { d.block = 0.9; d.parryWindow = 11; d.parryDmg = 30; },
    name: `Humo's shield|Щит Хумо|Humo qalqoni`, desc: `A shield with the bird of fortune: Tilla-bek's own.|Щит с птицей счастья — личный щит Тилла-бека.|Baxt qushi Humo tasvirlangan qalqon — Tillabekning shaxsiy qalqoni.`,
    moveName: `Humo's shadow|Тень Хумо|Humo soyasi`, moveDesc: `A perfect parry throws missiles back and for 4 s your allies cannot be hurt — and you take half damage. Cooldown 10 s.|Идеальное парирование отражает снаряды, и 4 с твоих союзников не ранить, а ты получаешь вдвое меньше урона. Перезарядка 10 с.|Mukammal qaytarish o'qlarni qaytaradi; 4 s ittifoqchilaringga zarar yetmaydi, sen esa yarim zarar olasan. Tiklanish 10 s.`,
    where: 'The Divan\'s arc (reward) or victory over Humo' });
  legend({ key: 'davron', id: 'leg_davron_sling', base: 'sopak', cat: 'ranged', sub: 'sling', tier: 4, power: 2.0, scal: { agi: 'S' }, move2: 'stones', glow: '#e8f0c0',
    rec: { hue: 30, sat: 1.3, minSat: 0.05 }, setup(d) { d.dmgMul = 11 / 15; },
    name: `Davron's sling|Праща Даврона|Davronning sopqoni`, desc: `The caravan-bashi drove wolves from the herd with it.|Ею караван-баши отгонял волков от стада.|Karvonboshi u bilan bo'rilarni poda yonidan haydagan.`,
    moveName: `Three stones|Три камня|Uch tosh`, moveDesc: `When ready, the throw becomes three stones, each to its own target; they break enemy casts and stun. Ready every 5 s.|Когда готово, бросок — три камня, каждый в свою цель; они сбивают заклинания врагов и оглушают. Готово раз в 5 с.|Tayyor bo'lganda bir otishda uch tosh uchadi, har biri o'z nishoniga; dushman afsunini buzadi va gangitadi. Har 5 s tayyor.`,
    where: 'Rabat: save Davron\'s children and his caravan' });
  legend({ key: 'albasty', id: 'leg_albasty_claw', base: 'oraq', cat: 'knife', tier: 4, power: 2.1, scal: { agi: 'A', end: 'C' }, move2: 'drown', glow: '#7fe8dc', dm: [8, 8, 12],
    rec: { hue: 170, sat: 0.6, light: -0.1, minSat: 0.05 },
    name: `Albasty's claw|Коготь Албасты|Albastining tirnog'i`, desc: `The drowned woman's crooked claw.|Кривой коготь утопленницы.|Suvga cho'kkan ayolning egri tirnog'i.`,
    moveName: `Drag under|Утянуть на дно|Suvga tortish`, moveDesc: `A blow on an enemy in water — the karez, the cistern, the Well — kills it outright if it has less than 40% health (not a boss).|Удар по врагу в воде — в кяризе, цистерне, Колодце — сразу добивает его, если здоровья меньше 40% (кроме боссов).|Suvdagi dushmanga zarba — korizda, sardobada, Quduqda — sog'lig'i 40% dan kam bo'lsa, darhol o'ldiradi (bossdan tashqari).`,
    where: 'The Cistern after Albasty (b_cistern), choice "take the claw"' });
  legend({ key: 'akbars', id: 'leg_akbars_fang', base: 'muz_kylysh', cat: 'sabre', tier: 5, power: 2.3, scal: { agi: 'A', str: 'B' }, move2: 'blizzard', glow: '#bff4ff',
    rec: { light: 0.15, sat: 0.7, minSat: 0.05, map: { '#8fd4f2': '#e8faff' } },
    name: `Fang of Ak Bars|Клык Ак Барса|Oq Bars qozig'i`, desc: `An ice blade from the white guardian's fang. Nargiza and Sado will not forgive it.|Ледяной клинок из клыка белого стража. Наргиза и Садо тебе этого не простят.|Oq qo'riqchining qozig'idan yasalgan muz tig'. Nargiza bilan Sado buni senga kechirmaydi.`,
    moveName: `Blizzard|Метель|Qor bo'roni`, moveDesc: `Every blow piles up cold; a frozen enemy shatters for heavy damage (a boss only staggers).|Каждый удар копит холод; замёрзший враг разлетается с огромным уроном (босс только шатается).|Har zarba sovuq to'playdi; muzlagan dushman katta zarar bilan chil-chil bo'ladi (boss faqat gandiraklaydi).`,
    where: 'The Withers: kill Ak Bars (b_shrine)' });
  legend({ key: 'cradle', id: 'leg_cradle', base: 'kylysh', cat: 'focus', tier: 5, power: 2.2, scal: { mem: 'S' }, move2: 'cradle', glow: '#ffe2a8',
    art: ['focus', { body: '#f2ead0', bodyL: '#ffffff', gem: '#ffb0a0', cord: '#c8a868', glow: '#ffe2a8' }, { cu: 3, cv: 0 }],
    setup(d) { d.kind = 'ydcast'; d.combo = null; d.air = null; d.heavyStep = null; d.castT = 8; d.recover = 15; d.boltDmg = 12; d.burnDmg = 48; d.glowCol = '#ffe2a8'; d.dmg = 12; },
    name: `Cradle|Колыбель|Beshik`, desc: `A tumar worn under the collarbone and tasted once a year.|Тумар, который носили под ключицей и раз в год испивали.|O'mrov suyagi ostida taqib yurilgan va yiliga bir marta totilgan tumar.`,
    moveName: `Alla|Алла|Alla`, moveDesc: `Once per fight, the charged cast costs no Hollowness: a wave, after which you and your allies are shielded.|Раз за бой заряженное заклинание не стоит Пустоты: волна, после которой ты и спутники под защитой.|Har jangda bir marta zaryadlangan afsun Bo'shliq olmaydi: to'lqindan so'ng sen va hamrohlaring himoyada bo'lasiz.`,
    where: 'Only in the arc of Those Who Remember, depending on the choice with Oydin' });
  // the Cradle hides its secret until Old Yodgor
  const cradleOpen = () => !!(F().oydin || F().oydinName || F().sadoFate || (G.STORY_REACHED ? G.STORY_REACHED(18) : (G.run && G.run.planIndex > 18)));
  {
    const d = ID.leg_cradle, n0 = d.name, d0 = d.desc;
    Object.defineProperty(d, 'name', { get: () => (cradleOpen() ? n0 : N(`Warm tumar|Тёплый тумар|Iliq tumar`)), set() { }, configurable: true });
    Object.defineProperty(d, 'desc', { get: () => (cradleOpen() ? d0 : N(`A small, old tumar. It is warm, as if someone had just held it.|Маленький старый тумар. Тёплый, будто его только что держали в руке.|Kichkina, eski tumar. Iliq — go'yo hozirgina kimdir kaftida ushlab turgandek.`)), set() { }, configurable: true });
  }

  /* ================================================================ gear (armour, charms, materials, consumables, tumars, keys) */
  G.ItemKinds.ydgear = { start: () => false, update: () => true, pose() { } };
  const GEAR = YI.GEAR = {};
  function gear(o) {
    const d = G.Items.register(Object.assign({
      id: o.id, kind: 'ydgear', slot: 'gear', noDrop: o.drop === false, weight: o.dropW != null ? o.dropW : 4, minStage: o.minStage || 0,
      name: N(o.name), desc: N(o.desc), icon: o.icon
    }));
    d.yd = Object.assign({ type: o.type, price: o.price || 50 }, o.yd || {});
    GEAR[o.id] = d;
    return d;
  }
  YI.gear = gear;
  /* ---------- icons ---------- */
  const mi = draw => X.perkIcon(draw);
  const ICO = {
    head(shape, a, b, c) {
      return mi(x => {
        if (shape === 'turban') { x.fillStyle = a; x.beginPath(); x.ellipse(0, 0, 7, 5, 0, 0, 7); x.fill(); x.fillStyle = b; x.fillRect(-6, -1, 12, 2); x.fillStyle = c; x.fillRect(-1, -4, 2, 2); }
        else if (shape === 'hood') { x.fillStyle = a; x.beginPath(); x.moveTo(-6, 6); x.lineTo(-6, -2); x.quadraticCurveTo(0, -9, 6, -2); x.lineTo(6, 6); x.closePath(); x.fill(); x.fillStyle = '#1a1014'; x.beginPath(); x.ellipse(1, 1, 3.5, 4, 0, 0, 7); x.fill(); x.fillStyle = b; x.fillRect(-6, 5, 12, 1); }
        else if (shape === 'helmet') { x.fillStyle = a; x.beginPath(); x.moveTo(-6, 4); x.lineTo(-6, -1); x.quadraticCurveTo(0, -8, 6, -1); x.lineTo(6, 4); x.closePath(); x.fill(); x.fillStyle = b; x.fillRect(-6, 2, 12, 2); x.fillStyle = c; x.fillRect(-1, -9, 2, 4); }
        else if (shape === 'kerchief') { x.fillStyle = a; x.beginPath(); x.moveTo(-7, 2); x.lineTo(0, -6); x.lineTo(7, 2); x.lineTo(4, 6); x.lineTo(-4, 6); x.closePath(); x.fill(); x.fillStyle = b; x.fillRect(-1, -1, 2, 2); }
        else { x.fillStyle = a; x.beginPath(); x.moveTo(-6, 4); x.lineTo(-5, -3); x.lineTo(5, -3); x.lineTo(6, 4); x.closePath(); x.fill(); x.fillStyle = b; x.fillRect(-4, -1, 2, 2); x.fillRect(2, -1, 2, 2); x.fillStyle = c; x.fillRect(-6, 3, 12, 1); }
      });
    },
    body(shape, a, b, c) {
      return mi(x => {
        x.fillStyle = a; x.beginPath(); x.moveTo(-4, -7); x.lineTo(4, -7); x.lineTo(7, -3); x.lineTo(6, 7); x.lineTo(-6, 7); x.lineTo(-7, -3); x.closePath(); x.fill();
        x.fillStyle = b;
        if (shape === 'lamellar') { for (let yy = -4; yy < 7; yy += 2) x.fillRect(-5, yy, 10, 1); }
        else if (shape === 'cloak') { x.fillRect(-7, -3, 2, 10); x.fillRect(5, -3, 2, 10); }
        else { x.fillRect(-1, -7, 2, 14); x.fillStyle = c; x.fillRect(-3, -1, 2, 2); x.fillRect(2, 3, 2, 2); }
        x.fillStyle = c; x.fillRect(-6, 6, 12, 1);
      });
    },
    belt(a, b) { return mi(x => { x.fillStyle = a; x.fillRect(-7, -2, 14, 5); x.fillStyle = b; x.fillRect(-2, -3, 4, 7); x.fillStyle = '#120c14'; x.fillRect(-1, -1, 2, 3); x.fillStyle = a; x.fillRect(3, 3, 2, 4); }); },
    boots(a, b) { return mi(x => { x.fillStyle = a; x.fillRect(-5, -7, 4, 10); x.fillRect(-5, 1, 8, 4); x.fillRect(2, -5, 4, 9); x.fillRect(2, 2, 6, 3); x.fillStyle = b; x.fillRect(-5, -7, 4, 1); x.fillRect(2, -5, 4, 1); }); },
    tumar(a, b, mark) { return mi(x => { x.strokeStyle = '#c8302a'; x.lineWidth = 1; x.beginPath(); x.moveTo(-4, -8); x.lineTo(0, -4); x.lineTo(4, -8); x.stroke(); x.fillStyle = a; x.beginPath(); x.moveTo(0, -4); x.lineTo(7, 6); x.lineTo(-7, 6); x.closePath(); x.fill(); x.fillStyle = b; x.beginPath(); x.moveTo(0, -1); x.lineTo(4, 4.5); x.lineTo(-4, 4.5); x.closePath(); x.fill(); if (mark) { x.fillStyle = mark; x.fillRect(-1, 1, 2, 2); } }); },
    ingot(a, b) { return mi(x => { x.fillStyle = a; x.beginPath(); x.moveTo(-6, 3); x.lineTo(-4, -2); x.lineTo(6, -2); x.lineTo(4, 3); x.closePath(); x.fill(); x.fillStyle = b; x.fillRect(-4, -2, 10, 1); }); },
    bone() { return mi(x => { x.fillStyle = '#e8dcc0'; x.fillRect(-5, -1, 10, 2); x.beginPath(); x.arc(-5, -1.5, 1.8, 0, 7); x.arc(-5, 1.5, 1.8, 0, 7); x.fill(); x.beginPath(); x.arc(5, -1.5, 1.8, 0, 7); x.arc(5, 1.5, 1.8, 0, 7); x.fill(); x.fillStyle = '#c9b4ff'; x.fillRect(-1, -1, 2, 2); }); },
    gem(a, b) { return mi(x => { x.fillStyle = a; x.beginPath(); x.moveTo(0, -6); x.lineTo(5, -1); x.lineTo(0, 6); x.lineTo(-5, -1); x.closePath(); x.fill(); x.fillStyle = b; x.beginPath(); x.moveTo(0, -6); x.lineTo(2, -1); x.lineTo(0, 1); x.lineTo(-2, -1); x.closePath(); x.fill(); }); },
    wax(a, b) { return mi(x => { x.fillStyle = a; x.beginPath(); x.ellipse(0, 2, 6, 4, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(-1, -2, 3.5, 3, 0, 0, 7); x.fill(); x.fillStyle = b; x.fillRect(-2, -4, 2, 2); }); },
    thread() { return mi(x => { x.fillStyle = '#8a5a30'; x.fillRect(-5, -6, 10, 2); x.fillRect(-5, 4, 10, 2); x.fillStyle = '#e04a6a'; x.fillRect(-4, -4, 8, 8); x.fillStyle = '#ff9ab0'; x.fillRect(-4, -3, 8, 1); x.fillRect(-4, 0, 8, 1); }); },
    herb(a) { return mi(x => { x.strokeStyle = '#4a7a2a'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 7); x.lineTo(0, -5); x.stroke(); x.fillStyle = a; for (const [px, py] of [[-3, -4], [3, -2], [-3, 1], [3, 3]]) { x.beginPath(); x.ellipse(px, py, 2.5, 1.4, px > 0 ? -0.5 : 0.5, 0, 7); x.fill(); } }); },
    bowl(a, b) { return mi(x => { x.fillStyle = b; x.beginPath(); x.ellipse(0, -1, 6, 3, 0, 0, 7); x.fill(); x.fillStyle = a; x.beginPath(); x.moveTo(-7, -1); x.lineTo(7, -1); x.lineTo(4, 5); x.lineTo(-4, 5); x.closePath(); x.fill(); x.fillStyle = '#ffffff'; x.fillRect(-3, 1, 1, 1); x.fillRect(1, 2, 1, 1); }); },
    vial(a) { return mi(x => { x.fillStyle = '#c8d0dc'; x.fillRect(-1, -7, 2, 3); x.fillStyle = a; x.beginPath(); x.arc(0, 1, 5, 0, 7); x.fill(); x.fillStyle = '#ffffff'; x.fillRect(-2, -2, 1, 2); }); },
    samsa() { return mi(x => { x.fillStyle = '#d8a04a'; x.beginPath(); x.moveTo(0, -6); x.lineTo(7, 5); x.lineTo(-7, 5); x.closePath(); x.fill(); x.fillStyle = '#f2d080'; x.fillRect(-3, 0, 6, 1); x.fillStyle = '#3a2a10'; x.fillRect(-1, 2, 1, 1); x.fillRect(2, 3, 1, 1); }); },
    bandage() { return mi(x => { x.fillStyle = '#f2ead8'; x.beginPath(); x.ellipse(-1, 0, 5, 5, 0, 0, 7); x.fill(); x.fillStyle = '#c8b898'; x.beginPath(); x.ellipse(-1, 0, 2, 2, 0, 0, 7); x.fill(); x.fillStyle = '#f2ead8'; x.fillRect(2, 2, 6, 3); x.fillStyle = '#c8302a'; x.fillRect(5, 3, 1, 1); }); },
    key(a) { return mi(x => { x.fillStyle = a; x.beginPath(); x.arc(-3, 0, 3.5, 0, 7); x.fill(); x.fillStyle = '#120c14'; x.beginPath(); x.arc(-3, 0, 1.4, 0, 7); x.fill(); x.fillStyle = a; x.fillRect(0, -1, 8, 2); x.fillRect(5, 1, 1, 3); x.fillRect(7, 1, 1, 2); }); },
    salt() { return mi(x => { x.fillStyle = '#f4f0e8'; for (const [px, py, s] of [[-3, 2, 4], [2, 0, 5], [0, -4, 3]]) x.fillRect(px - s / 2, py - s / 2, s, s); x.fillStyle = '#c8c0b0'; x.fillRect(1, 1, 2, 2); }); }
  };
  YI.ICO = ICO;

  /* ---------- armour ---------- */
  const SETS = YI.SETS = {
    yodchi: { name: `Yodchi|Ёдчи|Yodchi`, n: 4, bonus: `+10% to Collection checks (rounded up, at least +1)|+10% к проверкам Взыскания (с округлением вверх, не меньше +1)|Hisob-kitob tekshiruvlariga +10% (yuqoriga yaxlitlanadi, kamida +1)`,
      mods: { check_collection: v => v + Math.max(1, Math.ceil(G.PROG.branchPoints(0) * 0.1)) } },
    singers: { name: `White robes of the Singers|Белые одежды Певцов|Xonandalarning oq liboslari`, n: 4, bonus: `Hollowness from magic −15%, wax resistance +40%|Пустота от магии −15%, стойкость к воску +40%|Sehrdan Bo'shliq −15%, mumga chidamlilik +40%`,
      mods: { voidMagic: v => v * 0.85, res_wax: v => v + 0.4 } },
    divan: { name: `Gilded steel of the Divan|Золочёная сталь Дивана|Devonning zarhal po'lati`, n: 4, bonus: `+20% balance; the Divan's guards leave you alone|+20% к равновесию; стража Дивана тебя не трогает|+20% muvozanat; Devon soqchilari senga tegmaydi`,
      mods: { poise: v => v + 0.2, flag_divanPeace: v => v + 1 } },
    ash: { name: `Ash cloak of Those Who Remember|Пепельный плащ Помнящих|Eslaganlarning kul plashi`, n: 4, bonus: `Stealth +30% at night (enemies see you worse in the dark), blows in the back +25%|Скрытность ночью +30% (в темноте враги замечают тебя хуже), удары в спину +25%|Tunda yashirinish +30% (qorong'ida dushmanlar seni yomonroq ko'radi), orqadan zarba +25%`,
      mods: { sightMul: v => v * 0.7, backstab: v => v * 1.25 } },
    caravan: { name: `Caravaneer's|Караванщика|Karvonchi`, n: 4, bonus: `Resistance to poison and heat +35%; travel costs less|Сопротивление яду и жару +35%; дорога обходится дешевле|Zahar va issiqqa chidamlilik +35%; yo'l arzonroq tushadi`,
      mods: { res_poison: v => v + 0.35, res_burn: v => v + 0.35, flag_travelCheap: v => v + 1 } },
    smuggler: { name: `Smuggler's|Контрабандиста|Kontrabandachi`, n: 4, bonus: `Lockpicking +2; you hold your breath longer under water|Взлом замков +2; под водой дольше задерживаешь дыхание|Qulf ochish +2; suv ostida nafasingni uzoqroq ushlaysan`,
      mods: { check_lockpick: v => v + 2, check_agi_lock: v => v + 2, flag_longDive: v => v + 1 } },
    dream: { name: `Chapan from a dream|Чапан из сна|Tushdagi to'n`, n: 1, bonus: `Unique: Sado shines brighter; her lullaby works twice|Уникальный: Садо светит ярче, её колыбельная действует дважды|Noyob: Sado yorqinroq porlaydi, allasi ikki marta ta'sir qiladi`,
      mods: { flag_sadoBright: v => v + 1, flag_allaTwice: v => v + 1, voidMagic: v => v * 0.95 } }
  };
  const LOOK = {
    yodchi: { body: null, head: 'doppi', belt: null, boots: null },
    singers: { body: { robe: '#d8d4cc', robeD: '#a8a49c', robeL: '#f4f0e8', robeX: '#6a665e', ikA: '#c8c0b0', ikAd: '#8a8478', ikB: '#e2b452', ikC: '#9ad8d0', trim: '#e2b452', trimD: '#8a6a2a' }, headCol: { cap: '#ece8e0', capL: '#ffffff', capW: '#c8c0b0' }, head: 'cap', belt: { sash: '#e2b452', sashD: '#8a6a2a', sashL: '#ffe7a6' }, boots: { boot: '#c8c0b0', bootL: '#ece8e0', bootD: '#6a665e' } },
    divan: { body: { robe: '#7a5a22', robeD: '#4a3412', robeL: '#c8a048', robeX: '#2a1c08', ikA: '#e2b452', ikAd: '#8a6a22', ikB: '#ffe7a6', ikC: '#a83a2a', trim: '#ffe7a6', trimD: '#a87a30' }, headCol: { cap: '#9a7a2a', capL: '#e2b452', capW: '#ffe7a6' }, head: 'helmet', belt: { sash: '#8a1c22', sashD: '#4a0e14', sashL: '#c8302a' }, boots: { boot: '#5a4a3a', bootL: '#a88a50', bootD: '#2a2018' }, extra: { pauldron: ['#c8a048', '#ffe7a6', '#7a5a22'], plume: ['#c8302a', '#ff8a7a'] } },
    ash: { body: { robe: '#3a3440', robeD: '#26222c', robeL: '#5a5464', robeX: '#141018', ikA: '#4a4250', ikAd: '#2a2430', ikB: '#8a8090', ikC: '#c9b4ff', trim: '#8a8090', trimD: '#4a4250' }, headCol: { cap: '#3a3440', capL: '#5a5464', capW: '#8a8090' }, head: 'hood', belt: { sash: '#5a5464', sashD: '#2a2430', sashL: '#8a8090' }, boots: { boot: '#26222c', bootL: '#4a4250', bootD: '#141018' }, extra: { mantle: ['#3a3440', '#5a5464'], glow: '#c9b4ff' } },
    caravan: { body: { robe: '#8a6a3a', robeD: '#5a4224', robeL: '#b8945a', robeX: '#2a1c0e', ikA: '#c8302a', ikAd: '#7a1c18', ikB: '#e8d8a8', ikC: '#2f8f96', trim: '#e8d8a8', trimD: '#8a7448' }, headCol: { cap: '#e8dcc0', capL: '#ffffff', capW: '#c8302a' }, head: 'turban', belt: { sash: '#2f8f96', sashD: '#1a5a5e', sashL: '#7ad8d0' }, boots: { boot: '#6a4a2a', bootL: '#9a7448', bootD: '#3a2410' } },
    smuggler: { body: { robe: '#3a4a3a', robeD: '#243024', robeL: '#5a6a4a', robeX: '#101810', ikA: '#6a4a2a', ikAd: '#3a2414', ikB: '#a88a50', ikC: '#2a5a5a', trim: '#6a4a2a', trimD: '#3a2414' }, headCol: { cap: '#5a2a2a', capL: '#8a3a3a', capW: '#2a1a1a' }, head: 'kerchief', belt: { sash: '#5a3a1a', sashD: '#2a1a0a', sashL: '#8a6a3a' }, boots: { boot: '#2a2a24', bootL: '#4a4a3a', bootD: '#121210' } },
    dream: { body: { robe: '#1d2a5a', robeD: '#0e1838', robeL: '#4a6ab8', robeX: '#080c20', ikA: '#9ff3e6', ikAd: '#2fb3b8', ikB: '#ffe2a8', ikC: '#c9b4ff', trim: '#9ff3e6', trimD: '#2f8f96' }, extra: { glow: '#9ff3e6' } }
  };
  YI.LOOK = LOOK;
  // armour stats per weight class and slot: [armour, weight]
  const AW = { light: { head: [2, 1], body: [6, 3], belt: [1, 1], boots: [1, 1] }, medium: { head: [4, 2], body: [12, 6], belt: [2, 2], boots: [3, 3] }, heavy: { head: [8, 4], body: [22, 11], belt: [4, 3], boots: [6, 5] } };
  function armour(o) {
    const base = AW[o.cls][o.slot], q = o.k || 1;
    const look = o.set && LOOK[o.set] ? LOOK[o.set] : o.look || {};
    const ic = o.slot === 'head' ? ICO.head(o.shape || look.head || 'doppi', o.c[0], o.c[1], o.c[2]) : o.slot === 'body' ? ICO.body(o.shape || (o.cls === 'heavy' ? 'lamellar' : 'chapan'), o.c[0], o.c[1], o.c[2]) : o.slot === 'belt' ? ICO.belt(o.c[0], o.c[1]) : ICO.boots(o.c[0], o.c[1]);
    return gear({
      id: o.id, type: 'armour', name: o.name, desc: o.desc, icon: ic, minStage: o.minStage || 0, drop: o.drop, dropW: o.dropW != null ? o.dropW : 3, price: o.price || [60, 120, 220][['light', 'medium', 'heavy'].indexOf(o.cls)] * (o.slot === 'body' ? 2 : 1) * (1 + (o.minStage || 0) / 6),
      yd: { slot: o.slot, cls: o.cls, armor: Math.round(base[0] * q), weight: o.weight != null ? o.weight : base[1], res: o.res || {}, set: o.set || null, flat: o.flat || {}, mods: o.mods || null, look: o.slot === 'body' ? look.body || o.look2 : o.slot === 'head' ? { shape: o.shape || look.head, col: look.headCol || o.look2 } : o.slot === 'belt' ? look.belt || o.look2 : look.boots || o.look2, extra: o.slot === 'body' ? look.extra : o.slot === 'head' && look.extra && look.extra.plume ? { plume: look.extra.plume } : null, flasks: o.flasks || 0 }
    });
  }
  // the seven sets
  armour({ id: 'ar_yodchi_doppi', slot: 'head', cls: 'light', set: 'yodchi', c: ['#1d1a26', '#eee6d2', '#c8302a'], res: { void: 0.05 }, name: `Yodchi's doppi|Тюбетейка ёдчи|Yodchi do'ppisi`, desc: `A black chust doppi with white peppers. The city knows it at a glance.|Чёрная чустская тюбетейка с белыми «перчиками». Город узнаёт её издалека.|Oq qalampir naqshli qora chust do'ppisi. Shahar uni uzoqdan taniydi.`, dropW: 0 });
  armour({ id: 'ar_yodchi_chapan', slot: 'body', cls: 'medium', k: 0.85, weight: 5, set: 'yodchi', c: ['#26305a', '#a8343e', '#d6a24a'], res: { bleed: 0.05 }, name: `Yodchi's chapan|Чапан ёдчи|Yodchi to'ni`, desc: `Indigo ikat over quilted cotton. Warm, a little stiff, good against knives.|Индиговый икат на стёганой вате. Тёплый, жестковатый, от ножа неплохо спасает.|Paxtali qavima ustidan nil rang abr. Issiq, biroz qattiq, pichoqdan yaxshi asraydi.`, dropW: 0 });
  armour({ id: 'ar_yodchi_sash', slot: 'belt', cls: 'light', set: 'yodchi', c: ['#b83a3a', '#e2b452'], flat: { stam: 5 }, name: `Yodchi's sash|Кушак ёдчи|Yodchi belbog'i`, desc: `Madder-red, tied at the back. The satchel hangs from it.|Цвета марены, завязан сзади. На нём висит сумка.|Ro'yan rangidagi qizil belbog', orqadan bog'langan. Sumka shunga osiladi.`, dropW: 0 });
  armour({ id: 'ar_yodchi_boots', slot: 'boots', cls: 'light', set: 'yodchi', c: ['#3e261a', '#6e4a32'], name: `Yodchi's boots|Сапоги ёдчи|Yodchi etiklari`, desc: `Tall boots that have walked every street of the Tail.|Высокие сапоги, что исходили все улицы Хвоста.|Dumning hamma ko'chalarini kezib chiqqan baland etiklar.`, dropW: 0 });
  armour({ id: 'ar_singer_cap', slot: 'head', cls: 'light', set: 'singers', c: ['#ece8e0', '#c8c0b0', '#e2b452'], res: { void: 0.15, wax: 0.1 }, minStage: 3, name: `White cap of the Singers|Белая шапка Певцов|Xonandalarning oq qalpog'i`, desc: `Felt, bleached in salt. The Singers' guards wear it.|Войлок, выбеленный солью. Её носят стражи Певцов.|Tuzda oqartirilgan kigiz. Uni Xonandalar soqchilari kiyadi.` });
  armour({ id: 'ar_singer_robe', slot: 'body', cls: 'light', set: 'singers', k: 1.2, c: ['#d8d4cc', '#e2b452', '#9ad8d0'], res: { void: 0.1, wax: 0.15 }, flat: { stam: 10 }, minStage: 3, name: `White robe of the Singers|Белое облачение Певца|Xonandaning oq libosi`, desc: `Layer over layer of white cotton. It hushes footsteps.|Слой за слоем белого хлопка. Глушит шаги.|Qavat-qavat oq paxta. Qadam tovushini bosadi.` });
  armour({ id: 'ar_singer_belt', slot: 'belt', cls: 'light', set: 'singers', c: ['#e2b452', '#f4f0e8'], flat: { stam: 8 }, minStage: 3, name: `Chorister's belt|Пояс певчего|Xonanda kamari`, desc: `Braided with silver thread; little bells inside are stuffed with wax.|Сплетён с серебряной нитью; бубенчики внутри забиты воском.|Kumush ip bilan to'qilgan; ichidagi qo'ng'iroqchalar mum bilan tiqib qo'yilgan.` });
  armour({ id: 'ar_singer_shoes', slot: 'boots', cls: 'light', set: 'singers', c: ['#c8c0b0', '#ece8e0'], mods: { speed: v => v * 1.03 }, minStage: 3, name: `Soft shoes|Мягкие туфли|Yumshoq kavushlar`, desc: `For walking the cloister without a sound.|Чтобы ходить по Обители без звука.|Xonaqohda tovushsiz yurish uchun.` });
  armour({ id: 'ar_divan_helm', slot: 'head', cls: 'heavy', set: 'divan', c: ['#c8a048', '#7a5a22', '#c8302a'], minStage: 3, name: `Plumed helmet|Шлем с плюмажем|Patli dubulg'a`, desc: `Gilded iron with a red plume. You can hear the plume in the wind.|Золочёное железо и красный плюмаж. Плюмаж слышно на ветру.|Qizil patli zarhal temir. Shamolda pati shitirlaydi.` });
  armour({ id: 'ar_divan_lamellar', slot: 'body', cls: 'heavy', set: 'divan', c: ['#c8a048', '#7a5a22', '#ffe7a6'], res: { bleed: 0.2 }, minStage: 3, name: `Gilded lamellar|Золочёный ламеллярный доспех|Zarhal plastinkali sovut`, desc: `Hundreds of gilded plates laced with silk. Heavy and loud.|Сотни золочёных пластин на шёлковых шнурах. Тяжёлый и громкий.|Ipak bog'ichli yuzlab zarhal plastinka. Og'ir va shaqildoq.` });
  armour({ id: 'ar_divan_belt', slot: 'belt', cls: 'heavy', set: 'divan', c: ['#8a1c22', '#e2b452'], flat: { hp: 10 }, minStage: 3, name: `Belt of plaques|Пояс с бляхами|Nishonli kamar`, desc: `Each plaque is a year of service.|Каждая бляха — год службы.|Har bir nishon — bir yillik xizmat.` });
  armour({ id: 'ar_divan_greaves', slot: 'boots', cls: 'heavy', set: 'divan', c: ['#5a4a3a', '#c8a048'], minStage: 3, name: `Greaves of the Divan|Поножи Дивана|Devon oyoq sovutlari`, desc: `Plates over riding boots.|Пластины поверх сапог для верховой езды.|Otliq etigi ustidan taqiladigan plastinkalar.` });
  armour({ id: 'ar_ash_hood', slot: 'head', cls: 'light', set: 'ash', c: ['#3a3440', '#8a8090'], res: { void: 0.1 }, minStage: 5.5, name: `Ash hood|Пепельный капюшон|Kul qalpoq`, desc: `It smells of burned tumars.|Пахнет сожжёнными тумарами.|Yondirilgan tumarlar hidi keladi.` });
  armour({ id: 'ar_ash_cloak', slot: 'body', cls: 'light', set: 'ash', k: 1.35, c: ['#3a3440', '#5a5464', '#c9b4ff'], shape: 'cloak', res: { void: 0.1, burn: 0.15 }, minStage: 5.5, name: `Ash cloak|Пепельный плащ|Kul plash`, desc: `Woven from the ashes of the tithe. In the dark it is the dark.|Соткан из пепла десятины. В темноте он и есть темнота.|Ushr kulidan to'qilgan. Qorong'ida u qorong'ining o'zi.` });
  armour({ id: 'ar_ash_cord', slot: 'belt', cls: 'light', set: 'ash', c: ['#5a5464', '#c9b4ff'], flat: { stam: 6 }, minStage: 5.5, name: `Rope belt|Верёвочный пояс|Arqon kamar`, desc: `Knotted: every knot a name that must not be forgotten.|Весь в узлах: каждый узел — имя, которое нельзя забыть.|Tugun-tugun: har bir tugun — unutilmasligi kerak bo'lgan ism.` });
  armour({ id: 'ar_ash_boots', slot: 'boots', cls: 'light', set: 'ash', c: ['#26222c', '#4a4250'], mods: { speed: v => v * 1.04 }, minStage: 5.5, name: `Quiet boots|Тихие сапоги|Tovushsiz etiklar`, desc: `Felt soles.|Войлочные подошвы.|Kigiz taglik.` });
  armour({ id: 'ar_caravan_turban', slot: 'head', cls: 'medium', set: 'caravan', c: ['#e8dcc0', '#c8302a', '#2f8f96'], res: { burn: 0.1 }, minStage: 1, name: `Caravaneer's turban|Чалма караванщика|Karvonchi sallasi`, desc: `Twelve cubits of cotton against the sun of the Salt Road.|Двенадцать локтей хлопка от солнца Соляной дороги.|Tuz yo'li quyoshidan asraydigan o'n ikki gaz paxta mato.` });
  armour({ id: 'ar_caravan_khalat', slot: 'body', cls: 'medium', set: 'caravan', c: ['#8a6a3a', '#c8302a', '#e8d8a8'], res: { poison: 0.1, burn: 0.1 }, minStage: 1, name: `Caravaneer's khalat|Халат караванщика|Karvonchi xalati`, desc: `Dust-coloured, with a quilted lining for the cold nights.|Цвета пыли, со стёганой подкладкой для холодных ночей.|Chang rangida, sovuq tunlar uchun qavima astarli.` });
  armour({ id: 'ar_caravan_sash', slot: 'belt', cls: 'medium', set: 'caravan', c: ['#2f8f96', '#e8d8a8'], flasks: 0, flat: { stam: 12 }, minStage: 1, name: `Caravan-bashi's sash|Кушак караван-баши|Karvonboshi belbog'i`, desc: `Wide enough to carry a day's water.|Такой широкий, что в нём можно нести дневной запас воды.|Bir kunlik suvni ko'tarib yursa bo'ladigan darajada keng.` });
  armour({ id: 'ar_caravan_boots', slot: 'boots', cls: 'medium', set: 'caravan', c: ['#6a4a2a', '#9a7448'], res: { poison: 0.1 }, minStage: 1, name: `Road boots|Дорожные сапоги|Yo'l etiklari`, desc: `Soles of camel leather.|Подошвы из верблюжьей кожи.|Tuya terisidan taglik.` });
  armour({ id: 'ar_smug_kerchief', slot: 'head', cls: 'light', set: 'smuggler', c: ['#5a2a2a', '#2a1a1a'], minStage: 3.5, name: `Smuggler's kerchief|Платок контрабандиста|Kontrabandachi ro'moli`, desc: `Tied low over the brow; pulled over the face in the tunnels.|Повязан низко над бровями; в тоннелях его натягивают на лицо.|Qoshlar ustidan past bog'langan; tunnellarda yuzga tortib olinadi.` });
  armour({ id: 'ar_smug_jacket', slot: 'body', cls: 'medium', set: 'smuggler', k: 0.9, weight: 4, c: ['#3a4a3a', '#6a4a2a', '#a88a50'], res: { poison: 0.1, bleed: 0.1 }, minStage: 3.5, name: `Oiled leather jacket|Промасленная кожаная куртка|Moylangan charm kurtka`, desc: `Water runs off it. So do questions.|С неё стекает вода. И вопросы тоже.|Undan suv oqib ketadi. Savollar ham.` });
  armour({ id: 'ar_smug_belt', slot: 'belt', cls: 'light', set: 'smuggler', c: ['#5a3a1a', '#c8ccd8'], flat: { stam: 6 }, minStage: 3.5, name: `Belt of picks|Пояс с отмычками|Ochqichlar kamari`, desc: `Seven picks, a file and a candle stub.|Семь отмычек, напильник и огарок свечи.|Yettita ochqich, egov va sham qoldig'i.` });
  armour({ id: 'ar_smug_boots', slot: 'boots', cls: 'light', set: 'smuggler', c: ['#2a2a24', '#4a4a3a'], mods: { speed: v => v * 1.05 }, minStage: 3.5, name: `Wet boots|Мокрые сапоги|Ho'l etiklar`, desc: `They never dry in the karez. They never squeak, either.|В кяризе они не просыхают. Зато и не скрипят.|Korizda ular hech qachon qurimaydi. G'ichirlamaydi ham.` });
  armour({ id: 'ar_dream_chapan', slot: 'body', cls: 'light', set: 'dream', k: 2, weight: 2, c: ['#1d2a5a', '#9ff3e6', '#ffe2a8'], res: { void: 0.2, frost: 0.2 }, flat: { hp: 15 }, drop: false, minStage: 8, name: `Chapan from a dream|Чапан из сна|Tushdagi to'n`, desc: `It is light as a thought and it remembers your mother's hands.|Лёгкий, как мысль, и помнит руки твоей матери.|Xayoldek yengil, onangning qo'llarini eslaydi.` });
  // loose pieces
  armour({ id: 'ar_tail_tubeteika', slot: 'head', cls: 'light', c: ['#2a5a3a', '#e2b452', '#c8302a'], minStage: 0, look2: { cap: '#2a5a3a', capL: '#4a8a5a', capW: '#e2b452' }, name: `Tail tubeteika|Тюбетейка Хвоста|Dum do'ppisi`, desc: `Green, with a gold border. Someone's grandmother sewed it.|Зелёная, с золотой каймой. Шила чья-то бабушка.|Yashil, oltin hoshiyali. Kimningdir buvisi tikkan.` });
  armour({ id: 'ar_quilted_chapan', slot: 'body', cls: 'medium', c: ['#5a2a3a', '#e2b452', '#2f8f96'], minStage: 1, look2: { robe: '#5a2a3a', robeD: '#3a1824', robeL: '#8a4a5a', ikA: '#e2b452', ikB: '#2f8f96', ikC: '#f2e6c8' }, name: `Quilted chapan|Стёганый чапан|Qavima to'n`, desc: `Thick cotton, sewn in lines. A blade slides off it.|Толстый хлопок, простёганный рядами. Клинок соскальзывает.|Qalin paxta, qator-qator qavilgan. Tig' sirpanib ketadi.` });
  armour({ id: 'ar_mail', slot: 'body', cls: 'heavy', k: 0.9, weight: 9, c: ['#8e96a4', '#c8d0dc', '#4a5060'], minStage: 4, look2: { robe: '#6a7280', robeD: '#4a5060', robeL: '#a8b0bc', ikA: '#8e96a4', ikB: '#c8d0dc', ikC: '#4a5060', trim: '#c8d0dc', trimD: '#6a7280' }, name: `Mail shirt|Кольчуга|Halqa sovut`, desc: `Riveted rings to the knee. It sings when you run.|Клёпаные кольца до колен. На бегу звенит.|Tizzagacha parchinlangan halqalar. Yugurganda jaranglaydi.` });
  armour({ id: 'ar_felt_cap', slot: 'head', cls: 'medium', c: ['#8a7a5a', '#4a3a2a', '#c8302a'], res: { frost: 0.15 }, minStage: 4, look2: { cap: '#8a7a5a', capL: '#a89878', capW: '#4a3a2a' }, name: `Felt cap of the Spine|Войлочная шапка с Хребта|Umurtqa kigiz qalpog'i`, desc: `Thick felt against the cold of the Spine.|Толстый войлок против холода Хребта.|Umurtqa sovug'iga qarshi qalin kigiz.` });
  armour({ id: 'ar_leather_helm', slot: 'head', cls: 'medium', c: ['#6a4426', '#3a2414', '#c8ccd8'], shape: 'helmet', minStage: 2, look2: { cap: '#6a4426', capL: '#8a5a30', capW: '#c8ccd8' }, name: `Boiled leather helmet|Шлем из варёной кожи|Qaynatilgan charm dubulg'a`, desc: `A cap of hardened leather with iron bands.|Шапка из твёрдой кожи с железными полосами.|Temir tasmali qattiq charm qalpoq.` });
  armour({ id: 'ar_heavy_boots', slot: 'boots', cls: 'heavy', c: ['#3a3a44', '#8e96a4'], minStage: 4, look2: { boot: '#3a3a44', bootL: '#8e96a4', bootD: '#1a1a20' }, name: `Iron-shod boots|Окованные сапоги|Temir qoplangan etiklar`, desc: `Heavy; they crack tiles.|Тяжёлые, от них трескается плитка.|Og'ir; koshinlarni yorib yuboradi.` });
  armour({ id: 'ar_herbalist_belt', slot: 'belt', cls: 'light', c: ['#4a6a2a', '#e8d8a8'], flasks: 1, minStage: 2.5, look2: { sash: '#4a6a2a', sashD: '#2a3a14', sashL: '#7a9a4a' }, name: `Herbalist's belt|Пояс травницы|Tabib kamari`, desc: `Loops for one more flask.|Петли ещё под одну флягу.|Yana bitta idish uchun ilgaklar.` });
  armour({ id: 'ar_runner_boots', slot: 'boots', cls: 'light', c: ['#8a5a30', '#c8302a'], mods: { speed: v => v * 1.07 }, minStage: 2, look2: { boot: '#8a5a30', bootL: '#c8302a', bootD: '#4a2a14' }, name: `Roof-runner's shoes|Туфли бегуна по крышам|Tom chopar kavushi`, desc: `Thin soles: you feel every tile.|Тонкие подошвы: чувствуешь каждую черепицу.|Yupqa taglik: oyog'ing har bir g'ishtni sezadi.` });
  armour({ id: 'ar_salt_veil', slot: 'head', cls: 'light', c: ['#f4f0e8', '#c8c0b0', '#8fe35a'], shape: 'kerchief', res: { poison: 0.2 }, minStage: 2, look2: { cap: '#f4f0e8', capL: '#ffffff', capW: '#c8c0b0' }, name: `Salt veil|Соляная повязка|Tuzli niqob`, desc: `Gauze soaked in brine: poison dust sticks to it.|Марля, пропитанная рассолом: к ней липнет ядовитая пыль.|Sho'r suvga botirilgan doka: zaharli chang shunga yopishadi.` });
  armour({ id: 'ar_lamellar_vest', slot: 'body', cls: 'heavy', k: 0.8, weight: 8, c: ['#5a3a2a', '#c8a048', '#a83a2a'], minStage: 6, look2: { robe: '#5a3a2a', robeD: '#3a2414', robeL: '#8a5a3a', ikA: '#c8a048', ikB: '#a83a2a', ikC: '#2f8f96', trim: '#c8a048', trimD: '#7a5a22' }, name: `Mercenary's lamellar vest|Ламеллярный жилет наёмника|Yollanma askarning plastinkali nimchasi`, desc: `Lighter than the Divan's, but it has seen more.|Легче диванного, зато повидал больше.|Devonnikidan yengilroq, lekin ko'pni ko'rgan.` });

  /* ---------- charms (32) ---------- */
  const CHARMS = YI.CHARMS = [];
  function charm(id, ic, name, desc, fx, o) {
    o = o || {};
    const d = gear({ id, type: 'charm', name, desc, icon: ic, minStage: o.minStage || 0, drop: o.drop, dropW: o.dropW != null ? o.dropW : 2, price: o.price || 180, yd: { mods: fx.mods || null, on: fx.on || null, attr: fx.attr || null, flat: fx.flat || null, res: fx.res || null, minus: !!o.minus } });
    CHARMS.push(id);
    return d;
  }
  const tm = (a, b, m) => ICO.tumar(a, b, m);
  const plh = () => pl();
  const killStack = { n: 0 };
  charm('ch_patience', tm('#e2b452', '#a8762a', '#7fe8dc'), `Tumar of patience|Тумар терпения|Sabr tumari`, `+1 flask of water.|+1 фляга воды.|+1 idish suv.`, { mods: { flasks: v => v + 1 } });
  charm('ch_count', tm('#c8302a', '#7a1c18', '#ffe7a6'), `Tumar of the count|Тумар счёта|Hisob tumari`, `+5% damage for every enemy killed in this fight (up to +25%; resets each land).|+5% урона за каждого убитого в этом бою (до +25%; в новой земле — заново).|Shu jangda o'ldirilgan har bir dushman uchun +5% zarar (+25% gacha; har yangi yerda boshidan).`, { mods: { dmgOut: v => v * (1 + Math.min(0.25, 0.05 * killStack.n)) }, on: { onKill: () => { killStack.n++; } } });
  charm('ch_shadow', tm('#3a3440', '#1a1420', '#c9b4ff'), `Tumar of shadow|Тумар тени|Soya tumari`, `Enemies notice you 20% later; blows in the back +20%.|Враги замечают тебя на 20% позже; удары в спину +20%.|Dushmanlar seni 20% kechroq payqaydi; orqadan zarba +20%.`, { mods: { sightAll: v => v * 0.8, backstab: v => v * 1.2 } }, { minStage: 2 });
  charm('ch_salt', tm('#f4f0e8', '#c8c0b0', '#8fe35a'), `Tumar of salt|Тумар соли|Tuz tumari`, `Poison resistance +40%, bleeding resistance +20%.|Сопротивление яду +40%, кровотечению +20%.|Zaharga chidamlilik +40%, qon ketishiga +20%.`, { res: { poison: 0.4, bleed: 0.2 } });
  charm('ch_loud', tm('#ffe7a6', '#e2b452', '#2fb3b8'), `Tumar of the loud voice|Тумар громкого голоса|Baland ovoz tumari`, `Songs reach further: dutars and drums +12% damage and their rings of sound are wider.|Песни слышнее: дутары и бубны +12% урона, а кольца звука шире.|Qo'shiqlar uzoqqa yetadi: dutor va doiralar +12% zarar, tovush halqalari kengroq.`, { mods: { dmgOut: (v, i) => (i && i.item && i.item.def.yd && i.item.def.yd.cat === 'dutar' ? v * 1.12 : v), soundRing: v => Math.max(v, 0.5) } }, { minStage: 1 });
  charm('ch_luck', tm('#8fd47a', '#4a7a2a', '#ffe7a6'), `Tumar of someone else's luck|Тумар чужой удачи|Begona omad tumari`, `+20% loot (tilla and finds). But every death: Hollowness +1.|+20% добычи (тилла и находки). Но каждая смерть — Пустота +1.|+20% o'lja (tilla va topilmalar). Lekin har o'lim — Bo'shliq +1.`, { mods: { gold: v => v * 1.2, loot: v => v * 1.2 }, on: {} }, { minus: true, minStage: 1 });
  charm('ch_steel', tm('#8e96a4', '#4a5060', '#ffffff'), `Tumar of steel|Тумар стали|Po'lat tumari`, `Damage taken −6%.|Получаемый урон −6%.|Olinadigan zarar −6%.`, { mods: { dmgIn: v => v * 0.94 } });
  charm('ch_wind', tm('#9fe4ff', '#5fb8e8', '#ffffff'), `Tumar of the wind|Тумар ветра|Shamol tumari`, `The roll is untouchable a little longer; stamina returns 15% faster.|Перекат дольше неуязвим; выносливость восстанавливается на 15% быстрее.|Dumalashdagi daxlsizlik biroz uzoqroq; chidam 15% tezroq tiklanadi.`, { mods: { rollI: v => v + 2, stamRegen: v => v * 1.15 } }, { minStage: 1 });
  charm('ch_blood', tm('#8a1c22', '#4a0e14', '#ff8a7a'), `Tumar of blood|Тумар крови|Qon tumari`, `+15% damage, but −10% health.|+15% урона, но −10% здоровья.|+15% zarar, lekin −10% sog'liq.`, { mods: { dmgOut: v => v * 1.15, maxHp: v => v * 0.9 } }, { minus: true, minStage: 2 });
  charm('ch_wax', tm('#f2ead0', '#c8b890', '#e2b452'), `Tumar of wax|Тумар воска|Mum tumari`, `Wax resistance +50%, cold +20%.|Сопротивление воску +50%, холоду +20%.|Mumga chidamlilik +50%, sovuqqa +20%.`, { res: { wax: 0.5, frost: 0.2 } }, { minStage: 3 });
  charm('ch_fire', tm('#ff8a3a', '#a83a1a', '#ffe7a6'), `Tumar of fire|Тумар огня|Olov tumari`, `Burn resistance +40%; your blows sometimes set enemies alight.|Сопротивление горению +40%; удары порой поджигают врагов.|Yonishga chidamlilik +40%; zarbalar ba'zan dushmanni yondiradi.`, { res: { burn: 0.4 }, mods: { dmgOut: (v, i, tg) => { if (tg && tg.addStatus && i && i.type === 'melee' && Math.random() < 0.08) tg.addStatus('burn', { t: 120, dps: 3 + CH.level() * 0.6 }); return v; } } }, { minStage: 2 });
  charm('ch_spine', tm('#bff4ff', '#5fb8e8', '#ffffff'), `Tumar of the Spine|Тумар Хребта|Umurtqa tumari`, `Cold resistance +40%; your blows chill.|Сопротивление холоду +40%; удары холодят.|Sovuqqa chidamlilik +40%; zarbalar sovutadi.`, { res: { frost: 0.4 }, mods: { frostBuild: v => v + 10 } }, { minStage: 5 });
  charm('ch_silence', tm('#5a5464', '#2a2430', '#c9b4ff'), `Tumar of silence|Тумар молчания|Sukunat tumari`, `Hollowness from magic −20%.|Пустота от магии −20%.|Sehrdan Bo'shliq −20%.`, { mods: { voidMagic: v => v * 0.8 } }, { minStage: 3 });
  charm('ch_hunger', tm('#a83a1a', '#5a1a0a', '#e2b452'), `Tumar of hunger|Тумар голода|Ochlik tumari`, `Every kill mends 3% health; but water heals 30% less.|Каждое убийство лечит 3% здоровья; но вода лечит на 30% меньше.|Har o'ldirish 3% sog'liq tiklaydi; lekin suv 30% kam davolaydi.`, { mods: { heal: v => v * 0.7 }, on: { onKill: () => { const p = plh(); if (p && !p.dead) p.heal(Math.max(1, Math.round(p.maxHp * 0.03))); } } }, { minus: true, minStage: 2 });
  charm('ch_shepherd', tm('#8a6a44', '#5a4224', '#e8f0c0'), `Shepherd's tumar|Тумар пастуха|Cho'pon tumari`, `Slings, bows and crossbows +12% damage.|Праща, лук и самострел +12% урона.|Sopqon, kamon va arbalet +12% zarar.`, { mods: { dmgOut: (v, i) => (i && i.item && i.item.def.yd && i.item.def.yd.cat === 'ranged' ? v * 1.12 : v) } });
  charm('ch_smith', tm('#4a5060', '#2a2a34', '#ff8a3a'), `Smith's tumar|Тумар кузнеца|Temirchi tumari`, `You wield weapons you are not strong or quick enough for without penalty.|Оружие не по силе или ловкости — без штрафа.|Kuching yoki chaqqonliging yetmagan qurolni ham jarimasiz ishlatasan.`, { mods: { noReq: v => v + 1 } }, { minStage: 2 });
  charm('ch_guard', tm('#c8a048', '#7a5a22', '#ffffff'), `Guard's tumar|Тумар стража|Soqchi tumari`, `Blocks cost 25% less stamina; the parry window is a little wider.|Блок тратит на 25% меньше выносливости; окно парирования чуть шире.|To'sish 25% kam chidam oladi; qaytarish oynasi biroz kengroq.`, { mods: { blockCost: v => v * 0.75, parryWin: v => v + 3 } }, { minStage: 1 });
  charm('ch_runner', tm('#c8302a', '#8a1c18', '#ffe7a6'), `Runner's tumar|Тумар бегуна|Yuguruvchi tumari`, `Movement speed +10%.|Скорость бега +10%.|Yugurish tezligi +10%.`, { mods: { speed: v => v * 1.1 } });
  charm('ch_pupil', tm('#2fb3b8', '#1a5a5e', '#ffe7a6'), `Pupil's tumar|Тумар школяра|Tolib tumari`, `Experience +10%.|Опыт +10%.|Tajriba +10%.`, { mods: { xp: v => v * 1.1 } });
  charm('ch_broker', tm('#e2b452', '#8a6a22', '#ffffff'), `Broker's tumar|Тумар скупщика|Dallol tumari`, `Tilla found +15%.|Найденная тилла +15%.|Topilgan tilla +15%.`, { mods: { gold: v => v * 1.15 } }, { minStage: 1 });
  charm('ch_lastbreath', tm('#9ff3e6', '#2f8f96', '#ffffff'), `Tumar of the last breath|Тумар последнего вздоха|So'nggi nafas tumari`, `Once per land, a killing blow leaves you on 1 health — and Hollowness +2.|Раз за землю смертельный удар оставляет тебе 1 здоровья — но Пустота +2.|Har yerda bir marta o'ldiruvchi zarbadan keyin 1 sog'liq bilan qolasan — lekin Bo'shliq +2.`, { mods: { lastBreath: v => v + 1 } }, { minus: true, minStage: 3 });
  charm('ch_rage', tm('#ff5a3a', '#8a1c18', '#ffe066'), `Tumar of rage|Тумар ярости|G'azab tumari`, `Below 40% health: +20% damage.|Ниже 40% здоровья: +20% урона.|Sog'liq 40% dan past: +20% zarar.`, { mods: { dmgOut: v => { const p = plh(); return p && p.hp < p.maxHp * 0.4 ? v * 1.2 : v; } } }, { minStage: 1 });
  charm('ch_hush', tm('#6a6080', '#3a3448', '#9fd8ff'), `Tumar of hush|Тумар безмолвия|Jimlik tumari`, `Techniques recharge 20% faster, but −8% health.|Приёмы перезаряжаются на 20% быстрее, но здоровье −8%.|Usullar 20% tezroq tiklanadi, lekin sog'liq −8%.`, { mods: { cooldown: v => v * 0.8, maxHp: v => v * 0.92 } }, { minus: true, minStage: 3 });
  charm('ch_debt', tm('#e2b452', '#5a4220', '#c8302a'), `Tumar of debt|Тумар долга|Qarz tumari`, `Collection checks +1; marked and stunned enemies take +8%.|Проверки Взыскания +1; отмеченные и оглушённые враги получают на 8% больше урона.|Hisob-kitob tekshiruvlari +1; belgilangan va gangigan dushmanlar 8% ko'proq zarar oladi.`, { mods: { check_collection: v => v + 1, dmgOut: (v, i, tg) => (tg && ((tg._debt || 0) > now() || (tg.st && tg.st.stun)) ? v * 1.08 : v) } }, { minStage: 2 });
  charm('ch_eye', tm('#ffe066', '#a87a20', '#ffffff'), `Tumar of the clear eye|Тумар ясного глаза|Tiniq ko'z tumari`, `Critical chance +8%.|Шанс крита +8%.|Kritik ehtimoli +8%.`, { mods: { dmgOut: (v, i) => { if (i && !i.crit && Math.random() < 0.08) i.crit = true; return v; } } }, { minStage: 1 });
  charm('ch_stone', tm('#8a8070', '#4a4438', '#c8c0b0'), `Tumar of stone|Тумар камня|Tosh tumari`, `Balance +25% and damage taken −5%; but movement −5%.|Равновесие +25% и получаемый урон −5%; но скорость бега −5%.|Muvozanat +25%, olinadigan zarar −5%; lekin yugurish tezligi −5%.`, { mods: { poise: v => v + 0.25, dmgIn: v => v * 0.95, speed: v => v * 0.95 } }, { minus: true, minStage: 2 });
  charm('ch_widow', tm('#5a4a6a', '#2a2030', '#f2e6c8'), `Widow's tumar|Тумар вдовы|Beva tumari`, `Water heals 25% more.|Вода лечит на 25% больше.|Suv 25% ko'proq davolaydi.`, { mods: { heal: v => v * 1.25 } }, { minStage: 2 });
  charm('ch_dream', tm('#1d2a5a', '#4a6ab8', '#9ff3e6'), `Tumar of sleep|Тумар сна|Uyqu tumari`, `Memory +3; but at the start of every land, Hollowness +1.|Память +3; но в начале каждой земли — Пустота +1.|Xotira +3; lekin har yer boshida Bo'shliq +1.`, { attr: { mem: 3 }, on: { onStageStart: (r, plan) => { if (plan && plan.type === 'level') addVoid(1, `a dream took something|сон кое-что унёс|tush nimanidir olib ketdi`); } } }, { minus: true, minStage: 4 });
  charm('ch_singers', tm('#ece8e0', '#c8c0b0', '#c9b4ff'), `Tumar of the Singers|Тумар Певцов|Xonandalar tumari`, `Magic deals +12% damage.|Магия наносит +12% урона.|Sehr +12% zarar beradi.`, { mods: { dmgOut: (v, i) => (i && (i.magic || i.type === 'magic') ? v * 1.12 : v) } }, { minStage: 3 });
  charm('ch_divan', tm('#c8a048', '#7a5a22', '#c8302a'), `Tumar of the Divan|Тумар Дивана|Devon tumari`, `Strength +2.|Сила +2.|Kuch +2.`, { attr: { str: 2 } }, { minStage: 2 });
  charm('ch_trickster', tm('#2f8f96', '#1a5a5e', '#ffffff'), `Trickster's tumar|Тумар ловкача|Epchil tumari`, `Agility +2.|Ловкость +2.|Chaqqonlik +2.`, { attr: { agi: 2 } }, { minStage: 2 });
  charm('ch_elder', tm('#8a6a44', '#5a4224', '#f2e6c8'), `Old man's tumar|Тумар старика|Chol tumari`, `Endurance +2.|Стойкость +2.|Chidamlilik +2.`, { attr: { end: 2 } }, { minStage: 2 });
  ON_STAGE.push(() => { killStack.n = 0; });
  // the last breath charm
  CH.lethalSaves.push((dmg, info, p) => {
    if (G.Perks.mod('lastBreath', 0) > 0 && !YI._lastBreath) { YI._lastBreath = true; p.invulnT = Math.max(p.invulnT || 0, 60); addVoid(2, `the last breath|последний вздох|so'nggi nafas`); return Math.max(0, p.hp - 1) / info.dmg; }
    return null;
  });
  ON_STAGE.push(() => { YI._lastBreath = false; });
  // the luck charm: a death costs Hollowness
  G.Events.on('playerDeath', () => { try { if (G.run && (S().eq.charm1 && invGet(S().eq.charm1) && invGet(S().eq.charm1).id === 'ch_luck' || S().eq.charm2 && invGet(S().eq.charm2) && invGet(S().eq.charm2).id === 'ch_luck')) addVoid(1, `someone else's luck|чужая удача|begona omad`); } catch (e) { /* ignore */ } });

  /* ---------- mods: stones and wax ---------- */
  const MODS = YI.MODS = {
    m_ruby: { type: 'stone', name: `Blood ruby|Кровавый рубин|Qonli yoqut`, desc: `Blows build bleeding.|Удары копят кровотечение.|Zarbalar qon ketishini to'playdi.`, icon: ICO.gem('#c8202a', '#ff8a8a'), where: `Bazaar, Swallowed Streets|Базар, Проглоченные улицы|Bozor, Yutilgan ko'chalar`, price: 350 },
    m_garnet: { type: 'stone', name: `Garnet of the blow|Ударный гранат|Zarba granati`, desc: `+40% damage to balance; ordinary enemies stagger more often.|+40% урона по равновесию; обычные враги чаще шатаются.|Muvozanatga +40% zarar; oddiy dushmanlar tez-tez gandiraklaydi.`, icon: ICO.gem('#8a1a3a', '#e0607a'), where: `The smith, the salt mines|Кузнец, соляные копи|Temirchi, tuz konlari`, price: 350 },
    m_lapis: { type: 'stone', name: `Lapis of the Spine|Лазурит Хребта|Umurtqa lojuvardi`, desc: `Blows pile up cold (full: freeze).|Удары копят холод, пока враг не замёрзнет.|Zarbalar sovuq to'playdi, to'lsa — dushman muzlaydi.`, icon: ICO.gem('#2a4ab8', '#8ab0ff'), where: `The Spine|Хребет|Umurtqa`, price: 400 },
    m_salt: { type: 'stone', name: `Salt of the flats|Соль солончака|Sho'rxok tuzi`, desc: `Blows poison.|Удары отравляют.|Zarbalar zaharlaydi.`, icon: ICO.salt(), where: `Rabat, the mines|Рабат, копи|Rabot, konlar`, price: 300 },
    m_turq: { type: 'stone', name: `Turquoise|Бирюза|Feruza`, desc: `+10% damage against the Hollow and shades.|+10% урона против Пустых и теней.|Bo'shlar va soyalarga qarshi +10% zarar.`, icon: ICO.gem('#2fb3b8', '#9ff3e6'), where: `The Cloister|Обитель|Xonaqoh`, price: 300 },
    w_oil: { type: 'wax', name: `Oil wax|Масляный воск|Moyli mum`, desc: `A charged blow sets the enemy alight.|Заряженный удар поджигает врага.|Zaryadlangan zarba dushmanni yondiradi.`, icon: ICO.wax('#d89a2a', '#ffe7a6'), where: `Potters' quarter|Квартал гончаров|Kulollar mahallasi`, price: 300 },
    w_white: { type: 'wax', name: `White wax|Белый воск|Oq mum`, desc: `Blows pile up wax: the enemy slows, then sets fast for a second.|Удары копят воск: враг замедляется, потом на секунду застывает.|Zarbalar mum to'playdi: dushman sekinlashadi, so'ng bir soniya qotib qoladi.`, icon: ICO.wax('#f2ead0', '#ffffff'), where: `The Singers|Певцы|Xonandalar`, price: 350 },
    w_forget: { type: 'wax', name: `Wax of oblivion|Воск забвения|Unutish mumi`, desc: `A blow in the back may make the enemy forget its target.|Удар в спину может заставить врага забыть, кого он бил.|Orqadan zarba dushmanga nishonini unuttirishi mumkin.`, icon: ICO.wax('#9fd8ff', '#ffffff'), where: `Night market|Ночной рынок|Tungi bozor`, price: 500 },
    w_black: { type: 'wax', name: `Black wax|Чёрный воск|Qora mum`, desc: `+1% damage for every 2 points of Hollowness.|Урон +1% за каждые 2 очка Пустоты.|Har 2 Bo'shliq ochkosi uchun +1% zarar.`, icon: ICO.wax('#2a2030', '#c9b4ff'), where: `Those Who Remember|Помнящие|Eslaganlar`, price: 800 },
    w_return: { type: 'wax', name: `Wax of return|Воск возврата|Qaytish mumi`, desc: `A kill mends 5 health (a little more as you grow).|Убийство возвращает 5 здоровья (с уровнем — чуть больше).|O'ldirish 5 sog'liq qaytaradi (darajang oshgani sari ko'proq).`, icon: ICO.wax('#8fe0a0', '#ffffff'), where: `The herbalist|Травница|Tabib`, price: 300 }
  };
  for (const id in MODS) { const m = MODS[id]; gear({ id, type: 'mod', name: m.name, desc: m.desc, icon: m.icon, minStage: 1.5, dropW: 1, price: m.price, yd: { modType: m.type, where: m.where } }); }

  /* ---------- materials, consumables, memory tumars ---------- */
  gear({ id: 'mat_iron', type: 'material', name: `Iron|Железо|Temir`, desc: `For the smith: upgrades +1 and +2.|Для кузнеца: улучшения +1 и +2.|Temirchi uchun: +1 va +2 ga yaxshilash.`, icon: ICO.ingot('#8e96a4', '#c8d0dc'), dropW: 8, price: 40 });
  gear({ id: 'mat_bulat', type: 'material', name: `Bulat|Булат|Bulat`, desc: `Watered steel: upgrades +3 and +4.|Узорчатая сталь: улучшения +3 и +4.|Naqshli po'lat: +3 va +4 ga yaxshilash.`, icon: ICO.ingot('#5a6070', '#d8e0f0'), dropW: 4, minStage: 3, price: 160 });
  gear({ id: 'mat_bone', type: 'material', name: `Bone of the Sleeper|Кость Спящего|Uxlovchi suyagi`, desc: `A splinter of the city's skeleton: upgrade +5.|Осколок скелета, на котором стоит город: улучшение +5.|Shahar ustida turgan skeletning parchasi: +5 ga yaxshilash.`, icon: ICO.bone(), dropW: 1, minStage: 6, price: 600 });
  gear({ id: 'mat_salt', type: 'material', name: `Salt|Соль|Tuz`, desc: `Against the water's creatures; for brines and charms.|Против водных тварей; для рассолов и оберегов.|Suv maxluqlariga qarshi; sho'rob va tumarlar uchun.`, icon: ICO.salt(), dropW: 4, price: 10 });
  gear({ id: 'mat_wax', type: 'material', name: `Wax|Воск|Mum`, desc: `For tumars and charms.|Для тумаров и оберегов.|Tumarlar va ko'zmunchoqlar uchun.`, icon: ICO.wax('#e8d8a8', '#ffffff'), dropW: 4, price: 12 });
  gear({ id: 'mat_thread', type: 'material', name: `Silk thread|Шёлковая нить|Ipak ip`, desc: `Tumars are sewn with it.|Ею шьют тумары.|U bilan tumar tikiladi.`, icon: ICO.thread(), dropW: 4, price: 15 });
  gear({ id: 'mat_herbs', type: 'material', name: `Herbs: wormwood, isiriq, sage|Травы: полынь, исрык, шалфей|O'tlar: shuvoq, isiriq, marmarak`, desc: `For the herbalist's brews.|Для отваров травницы.|Tabib damlamalari uchun.`, icon: ICO.herb('#7a9a4a'), dropW: 4, price: 8 });
  gear({ id: 'it_plov', type: 'consumable', name: `Plov|Плов|Palov`, desc: `For this land: +10% health.|На эту землю: +10% здоровья.|Shu yer uchun: +10% sog'liq.`, icon: ICO.bowl('#c8a060', '#e8b860'), dropW: 2, price: 30, yd: { use: 'plov' } });
  gear({ id: 'it_samsa', type: 'consumable', name: `Samsa|Самса|Somsa`, desc: `For this land: stamina returns 25% faster.|На эту землю: выносливость возвращается на 25% быстрее.|Shu yer uchun: chidam 25% tezroq qaytadi.`, icon: ICO.samsa(), dropW: 2, price: 20, yd: { use: 'samsa' } });
  gear({ id: 'it_bitter_tea', type: 'consumable', name: `Bitter tea|Горький чай|Achchiq choy`, desc: `Rare. Hollowness −3; clears oblivion.|Редкость. Пустота −3; снимает забвение.|Kamyob. Bo'shliq −3; unutishni ketkazadi.`, icon: ICO.bowl('#5a3a1a', '#3a2a10'), dropW: 0.5, minStage: 2, price: 90, yd: { use: 'tea' } });
  gear({ id: 'it_bandage', type: 'consumable', name: `Bandage|Бинт|Bint`, desc: `Stops bleeding and mends 8% health.|Останавливает кровь и лечит 8% здоровья.|Qonni to'xtatadi va 8% sog'liq tiklaydi.`, icon: ICO.bandage(), dropW: 3, price: 15, yd: { use: 'bandage' } });
  gear({ id: 'it_antidote', type: 'consumable', name: `Antidote|Противоядие|Panzahr`, desc: `Cures poison; poison resistance +50% for this land.|Лечит яд; сопротивление яду +50% до конца земли.|Zaharni davolaydi; shu yer oxirigacha zaharga chidamlilik +50%.`, icon: ICO.vial('#8fe35a'), dropW: 2, price: 25, yd: { use: 'antidote' } });
  gear({ id: 'it_firebrew', type: 'consumable', name: `Pepper brew|Перцовый отвар|Qalampir qaynatmasi`, desc: `Warms: cold resistance +50% for this land.|Греет: сопротивление холоду +50% до конца земли.|Isitadi: shu yer oxirigacha sovuqqa chidamlilik +50%.`, icon: ICO.vial('#ff8a3a'), dropW: 1.5, minStage: 4, price: 30, yd: { use: 'firebrew' } });
  gear({ id: 'tu_blank', type: 'tumar', name: `Blank tumar|Тумар-заготовка|Toza tumar`, desc: `Wax, thread, a scrap of leather. Needed to Taste a memory on the spot (the yodchi's sense).|Воск, нить, кусочек кожи. Нужен, чтобы испить воспоминание на месте («чутьё ёдчи»).|Mum, ip, bir parcha charm. Xotirani joyida totish uchun kerak («yodchi sezgisi»).`, icon: ICO.tumar('#c8b890', '#8a7a5a', null), dropW: 3, price: 20, yd: { tq: 0 } });
  gear({ id: 'tu_memory', type: 'tumar', name: `Memory tumar|Тумар с воспоминанием|Xotirali tumar`, desc: `Someone's memory, sung into leather. Taste it (a gift, and Hollowness), Burn it (a blast), sell it, return it, or give it as tithe.|Чьё-то воспоминание, выпетое в кожу. Испить (дар и Пустота), сжечь (взрыв), продать, вернуть или отдать в десятину.|Kimningdir xotirasi, charmga kuylab solingan. Totish (sovg'a va Bo'shliq), yondirish (portlash), sotish, qaytarish yoki ushrga berish.`, icon: ICO.tumar('#e2b452', '#a8762a', '#7fe8dc'), dropW: 3, price: 80, yd: { tq: 1 } });

  /* ---------- key items (story): G.YITEMS.key(id, name, desc) registers, G.CH.give(id) gives ---------- */
  YI.key = (id, name, desc, col) => GEAR[id] || gear({ id, type: 'key', name, desc, icon: ICO.key(col || '#e2b452'), drop: false, price: 0 });
  YI.key('key_yodchi_seal', `Yodchi's seal|Печать ёдчи|Yodchi muhri`, `The bronze seal of a tithe collector. It opens doors, and mouths.|Бронзовая печать сборщика десятины. Открывает двери — и рты.|Ushr yig'uvchining bronza muhri. Eshiklarni ham, og'izlarni ham ochadi.`);

  /* ================================================================ the inventory */
  const TYPE_OF = id => { const d = ID[id]; if (!d) return null; if (d.kind === 'ydgear') return d.yd.type; if (d.slot === 'skill') return 'skill'; return 'weapon'; };
  YI.typeOf = TYPE_OF;
  const STACK = new Set(['material', 'consumable', 'tumar', 'mod']);
  function invGet(u) { const s = S(); for (const e of s.inv) if (e.u === u) return e; return null; }
  YI.get = invGet;
  YI.list = () => S().inv;
  function addEntry(s, id, o) {
    o = o || {};
    const ty = TYPE_OF(id);
    if (!ty) return null;
    if (STACK.has(ty)) {
      const ex = s.inv.find(e => e.id === id && (e.q || 0) === (o.q || 0));
      if (ex) { ex.n = (ex.n || 1) + (o.n || 1); ex.isNew = 1; return ex; }
    }
    if (ty === 'key' && s.inv.some(e => e.id === id)) return s.inv.find(e => e.id === id);
    if (ty === 'skill' && s.inv.some(e => e.id === id)) return s.inv.find(e => e.id === id);
    const e = { u: s.nextU++, id, q: o.q || 0, up: o.up || 0, mods: (o.mods || []).slice(), n: o.n || 1, isNew: o.quiet ? 0 : 1 };
    if (ID[id].yd && ID[id].yd.legend) e.q = 3;
    s.inv.push(e);
    return e;
  }
  YI.add = (id, o) => { const e = addEntry(S(), id, o); if (e) { CH.dirty(); save(); } return e; };
  YI.remove = (u, n) => {
    const s = S(), e = invGet(u); if (!e) return false;
    if ((e.n || 1) > (n || 1)) { e.n -= (n || 1); save(); return true; }
    s.inv.splice(s.inv.indexOf(e), 1);
    for (const k in s.eq) if (s.eq[k] === u) { s.eq[k] = null; }
    CH.dirty(); YI.syncSlots(); save();
    return true;
  };
  YI.count = id => S().inv.filter(e => e.id === id).reduce((a, e) => a + (e.n || 1), 0);
  YI.take = (id, n) => {
    n = n || 1;
    if (YI.count(id) < n) return false;
    for (const e of S().inv.slice()) { if (e.id !== id || n <= 0) continue; const k = Math.min(n, e.n || 1); YI.remove(e.u, k); n -= k; }
    return true;
  };
  // the first inventory of a journey: whatever the engine handed out + the yodchi's clothes
  YI.seed = s => {
    // old saves (the first tree): keep the level, give the points to spend again
    const r = R();
    if (r.lvl > 1 && !s.migrated) { s.lvl = Math.min(30, r.lvl); s.free = 3 + s.lvl - 1; s.migrated = 1; }
    for (const k of ['attack', 'secondary', 'skill1', 'skill2']) {
      const it = G.run && G.run.slots[k];
      if (!it || !ID[it.id]) continue;
      const e = addEntry(s, it.id, { up: it.tier || 0, quiet: true });
      if (e) { s.eq[k] = e.u; it.iu = e.u; it.up = e.up; it.q = e.q; it.mods = e.mods.slice(); }
    }
    for (const [slot, id] of [['head', 'ar_yodchi_doppi'], ['body', 'ar_yodchi_chapan'], ['belt', 'ar_yodchi_sash'], ['boots', 'ar_yodchi_boots']]) { const e = addEntry(s, id, { quiet: true }); s.eq[slot] = e.u; }
    addEntry(s, 'mat_iron', { n: 1, quiet: true });
    addEntry(s, 'tu_blank', { n: 2, quiet: true });
    addEntry(s, 'it_bandage', { n: 2, quiet: true });
  };
  // the engine's four slots follow our equipment
  const ENG = ['attack', 'secondary', 'skill1', 'skill2'];
  YI.ENG = ENG;
  function makeInst(e) {
    const it = G.Items.create(e.id, e.up || 0);
    if (!it) return null;
    it.iu = e.u; it.q = e.q || 0; it.up = e.up || 0; it.mods = (e.mods || []).slice();
    const d = it.def;
    Object.defineProperty(it, 'name', { configurable: true, get() { return LANG.T(d.name) + (this.up > 0 ? ' +' + this.up : ''); } });
    return it;
  }
  YI.makeInst = makeInst;
  YI.syncSlots = (force) => {
    if (!G.run) return;
    const s = S();
    for (const k of ENG) {
      const u = s.eq[k], e = u ? invGet(u) : null, cur = G.run.slots[k];
      if (!e) { if (cur && cur.iu) G.run.slots[k] = null; continue; }
      if (cur && cur.iu === e.u && cur.up === (e.up || 0) && cur.q === (e.q || 0) && JSON.stringify(cur.mods || []) === JSON.stringify(e.mods || []) && !force) continue;
      const it = makeInst(e); if (!it) continue;
      if (cur && cur.iu === e.u) { it.cd = cur.cd || 0; it.cdMax = cur.cdMax || 0; }
      G.run.slots[k] = it;
    }
    if (G.Game.snap && G.Game.snap.slots) for (const k of ENG) { const it = G.run.slots[k]; G.Game.snap.slots[k] = it ? { id: it.id, tier: it.tier } : null; }
  };
  // things the engine (or a story file) put straight into a slot become ours
  function reconcile() {
    if (!G.run || !R().ch) return;
    const s = S();
    for (const k of ENG) {
      const it = G.run.slots[k];
      if (!it) { if (s.eq[k] && !reconcile.hold) { s.eq[k] = null; CH.dirty(); } continue; }
      if (it.iu && invGet(it.iu)) continue;
      const e0 = s.eq[k] ? invGet(s.eq[k]) : null;
      if (e0 && e0.id === it.id) { G.run.slots[k] = Object.assign(makeInst(e0), { cd: it.cd || 0, cdMax: it.cdMax || 0 }); continue; }
      const e = addEntry(s, it.id, { up: it.tier || 0 });
      if (!e) continue;
      for (const kk of ENG) if (s.eq[kk] === e.u && kk !== k) s.eq[kk] = null;
      s.eq[k] = e.u;
      const inst = makeInst(e); if (inst) { inst.cd = it.cd || 0; G.run.slots[k] = inst; }
      CH.dirty(); save();
    }
  }
  YI.reconcile = reconcile;
  TICK.push(reconcile);
  {
    const up0 = G.Player.prototype.update;
    G.Player.prototype.update = function () { if (G.run && this === pl()) { try { reconcile(); } catch (e) { /* ignore */ } } return up0.apply(this, arguments); };
  }
  // where can an entry go?
  YI.slotsFor = e => {
    const ty = TYPE_OF(e.id);
    if (ty === 'weapon') return ['attack', 'secondary'];
    if (ty === 'skill') return ['skill1', 'skill2'];
    if (ty === 'armour') return [ID[e.id].yd.slot];
    if (ty === 'charm') return ['charm1', 'charm2'];
    return [];
  };
  YI.equip = (u, slot) => {
    const s = S(), e = invGet(u); if (!e) return false;
    const ok = YI.slotsFor(e); if (!ok.length) return false;
    slot = slot && ok.includes(slot) ? slot : ok.find(k => !s.eq[k]) || ok[0];
    for (const k in s.eq) if (s.eq[k] === u) s.eq[k] = null;
    s.eq[slot] = u; e.isNew = 0;
    CH.dirty(); YI.syncSlots(); CH.syncHp(); CH.applyRoll(); CH.applyLook(); G.PROG.applyFlasks(); save();
    sfx('pickup');
    return slot;
  };
  YI.unequip = slot => {
    const s = S(); if (!s.eq[slot]) return false;
    s.eq[slot] = null;
    if (ENG.includes(slot) && G.run) G.run.slots[slot] = null;
    CH.dirty(); YI.syncSlots(); CH.syncHp(); CH.applyRoll(); CH.applyLook(); G.PROG.applyFlasks(); save();
    sfx('ui_back');
    return true;
  };
  YI.equippedIn = u => { const s = S(); for (const k in s.eq) if (s.eq[k] === u) return k; return null; };
  YI.twinKnives = () => { const a = G.run && G.run.slots.attack, b = G.run && G.run.slots.secondary; return !!(a && b && a.def.yd && b.def.yd && a.def.yd.cat === 'knife' && b.def.yd.cat === 'knife'); };

  /* ---------- techniques from the tree ---------- */
  YI.learnTechnique = id => {
    const s = S();
    const e = addEntry(s, id, {});
    if (!e) return;
    const free = ['skill1', 'skill2'].find(k => !s.eq[k]);
    if (free) YI.equip(e.u, free);
    toast(tf(`New technique: {n} — [Q]/[E]|Новый приём: {n} — [Q]/[E]|Yangi usul: {n} — [Q]/[E]`, { n: LANG.T(ID[id].name) }), '#c9b4ff');
  };
  YI.forgetTechnique = id => { for (const e of S().inv.slice()) if (e.id === id) YI.remove(e.u, 999); };

  /* ---------- memory tumars ---------- */
  YI.bestTumar = () => { let b = null; for (const e of S().inv) if (TYPE_OF(e.id) === 'tumar' && (!b || (ID[e.id].yd.tq || 0) + (e.q || 0) > (ID[b.id].yd.tq || 0) + (b.q || 0))) b = e; return b; };
  YI.takeTumar = () => { const b = YI.bestTumar(); if (!b) return null; const q = (ID[b.id].yd.tq || 0) + (b.q || 0); YI.remove(b.u, 1); return { q: Math.min(3, q) }; };

  /* ---------- gear summary for G.CH ---------- */
  const GEAR_SLOTS = ['head', 'body', 'belt', 'boots', 'charm1', 'charm2'];
  YI.GEAR_SLOTS = GEAR_SLOTS;
  const MODFX = { src: { id: 'weaponMods', mods: {
    dmgOut: (v, i, tg) => {
      const it = i && i.item; if (!it || !it.mods || !it.mods.length) return v;
      if (it.mods.includes('m_turq') && tg && /hollow|pust|shade|shadow|ghost|spirit|wraith|choir|crowd|husk|void|dream|memory/.test(String((tg.def && tg.def.id) || ''))) v *= 1.1;
      if (it.mods.includes('w_black')) v *= 1 + Math.floor(R().void / 2) / 100;
      return v;
    },
    poiseOut: (v, i) => (i && i.item && i.item.mods && i.item.mods.includes('m_garnet') ? v * 1.4 : v)
  } }, r: 1 };
  YI.gearSummary = s => {
    const out = { attr: {}, armor: 0, res: {}, weight: 0, flat: {}, effects: [MODFX], sets: {} };
    for (const k of GEAR_SLOTS) {
      const e = s.eq[k] ? invGet(s.eq[k]) : null; if (!e) continue;
      const d = ID[e.id]; if (!d || !d.yd) continue;
      const y = d.yd, qk = 1 + 0.1 * (e.q || 0);
      out.armor += (y.armor || 0) * qk; out.weight += y.weight || 0;
      for (const r in y.res || {}) out.res[r] = (out.res[r] || 0) + y.res[r] * qk;
      for (const a in y.attr || {}) out.attr[a] = (out.attr[a] || 0) + y.attr[a];
      for (const f in y.flat || {}) out.flat[f] = (out.flat[f] || 0) + y.flat[f];
      if (y.flasks) out.effects.push({ src: { id: 'flasks_' + k, mods: { flasks: v => v + y.flasks } }, r: 1 });
      if (y.mods || y.on) out.effects.push({ src: { id: e.id, mods: y.mods, on: y.on }, r: 1 });
      if (y.set) out.sets[y.set] = (out.sets[y.set] || 0) + 1;
    }
    for (const k in out.sets) { const st = SETS[k]; if (st && out.sets[k] >= st.n) out.effects.push({ src: { id: 'set_' + k, mods: st.mods }, r: 1 }); }
    // weapons in hand add their weight class to the roll a little
    for (const k of ['attack', 'secondary']) { const e = s.eq[k] ? invGet(s.eq[k]) : null; if (e && ID[e.id] && ID[e.id].yd) out.weight += { heavy: 2, medium: 1, light: 0 }[(CAT[ID[e.id].yd.cat] || {}).w] || 0; }
    return out;
  };
  YI.sets = () => { const s = S(), c = {}; for (const k of GEAR_SLOTS) { const e = s.eq[k] ? invGet(s.eq[k]) : null; const st = e && ID[e.id] && ID[e.id].yd && ID[e.id].yd.set; if (st) c[st] = (c[st] || 0) + 1; } return c; };
  YI.looks = s => {
    const L = { body: null, head: null, headCol: null, belt: null, boots: null, extra: null };
    const g = k => { const e = s.eq[k] ? invGet(s.eq[k]) : null; return e && ID[e.id] && ID[e.id].yd; };
    const b = g('body'), h = g('head'), bt = g('belt'), bo = g('boots');
    if (b) { L.body = b.look || null; if (b.extra) L.extra = Object.assign({}, b.extra); if (b.cls === 'heavy' && !(L.extra && L.extra.pauldron)) L.extra = Object.assign({}, L.extra, { pauldron: ['#8e96a4', '#c8d0dc', '#4a5060'] }); }
    if (h && h.look) { L.head = h.look.shape || 'doppi'; L.headCol = h.look.col || null; if (h.extra && h.extra.plume) L.extra = Object.assign({}, L.extra, { plume: h.extra.plume }); }
    if (bt) L.belt = bt.look || null;
    if (bo) L.boots = bo.look || null;
    return L;
  };

  /* ================================================================ on-hit: buildups, mods, legendaries */
  const BU = { bleed: { col: '#d0283c', decay: 18 }, frost: { col: '#9fe4ff', decay: 22 }, wax: { col: '#f2ead0', decay: 20 } };
  function build(tg, kind, amt, p, info) {
    if (!tg || tg.dead || !tg.isActor || amt <= 0) return;
    const b = tg.isBossPart ? tg.boss : tg;
    const st = b._bu || (b._bu = {});
    const o = st[kind] || (st[kind] = { v: 0, t: now() });
    o.v = Math.max(0, o.v - (now() - o.t) * BU[kind].decay); o.t = now();
    o.v += amt * (b.isBoss ? 0.5 : b.elite ? 0.75 : 1);
    if (o.v < 100) return;
    o.v = 0;
    if (kind === 'bleed') {
      const dmg = b.maxHp * (b.isBoss ? 0.03 : 0.15);
      G.Combat.hit(p, b, { dmg, type: 'bleed', item: info.item, kbx: 0, dir: info.dir || 1, hitstop: 2, noFlinch: true, color: '#d0283c', dmgColor: '#ff5060', burst: 'bleed' });
      G.FX.burst(b.x, b.cy, 14, { speed: 2.5, life: 26, size: 2, color: '#b0182c', grav: 0.2 });
      G.FX.text(b.x, b.top - 12, t(`Bleeding!|Кровотечение!|Qon ketyapti!`), '#ff6070', { size: 7 });
    } else if (kind === 'frost') {
      if (b.isBoss) b.addStatus('slow', { t: 150 }); else b.addStatus('freeze', { t: 90 });
      G.FX.text(b.x, b.top - 12, t(`Frozen!|Замёрз!|Muzladi!`), '#bff4ff', { size: 7 });
    } else if (kind === 'wax') {
      b.addStatus('slow', { t: 120 }); if (!b.isBoss) b.addStatus('stun', { t: 60 });
      G.FX.text(b.x, b.top - 12, t(`Wax sets!|Воск застыл!|Mum qotdi!`), '#f2ead0', { size: 7 });
    }
  }
  YI.build = build;
  const behind = (p, tg) => tg && tg.facing && Math.sign(p.x - tg.x) !== tg.facing && Math.abs(p.x - tg.x) > 2;
  const wetLand = () => { const b = G.level && G.level.biome; return !!(b && /karez|cistern|well|gut|tunnel|wedding|water|deep/.test(b.id || '')); };
  {
    const hit0 = G.Combat.hit;
    G.Combat.hit = function (src, target, info) {
      const p = pl();
      if (src && src === p && info) {
        const ws = p.act && info.item && p.act.item === info.item ? p.act.ws : null;
        if (ws) { info.charged = !!ws.heavyMode; if (ws.legend) info.legend = true; if (ws.st && ws.st.poiseMul) info.poiseMul = ws.st.poiseMul; info.swing = ws.swings; }
        // backstab: knives crit, sets add more
        if (info.item && target && behind(p, target) && info.type === 'melee') {
          const it = info.item, cat = it.def && it.def.yd && it.def.yd.cat;
          if (cat === 'knife') { info.crit = true; info.critMul = Math.max(info.critMul || 1.75, 2); }
          info.dmg *= G.Perks.mod('backstab', 1);
          info.back = true;
        }
        // legendary: Ak Bars shatters the frozen
        if (info.item && info.item.def.yd && info.item.def.yd.legendMove === 'blizzard' && target && target.st && target.st.freeze && !target.isBoss) { info.dmg *= 3; info.legend = true; G.FX.text(target.x, target.top - 12, t(`Shatter!|Вдребезги!|Chil-chil!`), '#ffffff', { size: 8 }); }
        // crits from Agility
        if (info.item && !info.crit && Math.random() < CH.critChance() - 0.05) info.crit = true;
      }
      const ok = hit0.apply(this, arguments);
      if (ok && src && src === p && info && info.item && target) { try { afterHit(p, target, info); } catch (e) { console.error('[items] hit', e); } }
      return ok;
    };
  }
  function afterHit(p, tg, info) {
    const it = info.item, d = it.def, y = d.yd || {}, mods = it.mods || [];
    if (info.type === 'bleed') return;
    const b = tg.isBossPart ? tg.boss : tg;
    // bleeding buildup: knives, the blood ruby, twin knives, Blood for the debt
    let bl = (y.cat === 'knife' ? 18 : 0) + (mods.includes('m_ruby') ? 16 : 0);
    bl = G.Perks.mod('bleedBuild', bl, info);
    if (bl > 0) build(tg, 'bleed', bl, p, info);
    if (bl > 0 || (info.status && info.status.bleed)) { const dur = G.Perks.mod('bleedDur', 1); if (dur > 1 && b.st && b.st.bleed) b.st.bleed.t = Math.round(Math.max(b.st.bleed.t, 150 * dur)); }
    let fr = (mods.includes('m_lapis') ? 18 : 0) + (y.legendMove === 'blizzard' ? 26 : 0);
    fr = G.Perks.mod('frostBuild', fr, info);
    if (fr > 0) build(tg, 'frost', fr, p, info);
    if (mods.includes('w_white')) build(tg, 'wax', 18, p, info);
    if (mods.includes('m_salt') && b.addStatus) b.addStatus('poison', { t: 180, dps: 1.2 + CH.level() * 0.25, max: 5 });
    if (mods.includes('w_oil') && info.charged && b.addStatus) b.addStatus('burn', { t: 180, dps: 3 + CH.level() * 0.8 });
    if (mods.includes('m_garnet') && !b.isBoss && Math.random() < 0.25) b.addStatus('stun', { t: 18 });
    if (mods.includes('w_forget') && info.back && Math.random() < 0.35) { b._forgetT = b.isBoss ? 60 : 180; G.FX.text(b.x, b.top - 10, t(`forgot|забыл|unutdi`), '#9fd8ff', { size: 6 }); }
    // legendaries
    const lm = y.legendMove;
    if (lm === 'seal') { p.heal(Math.max(0, Math.round((tg.lastHit && tg.lastHit.dmg || info.dmg) * 0.1))); if (info.back && !b.isBoss) { b.addStatus('stun', { t: 120 }); G.FX.ring(b.x, b.cy, 3, 20, '#f2ead0', 14); } }
    if (lm === 'drown' && wetLand() && !b.isBoss && !b.dead && b.hp < b.maxHp * 0.4) { G.Combat.hit(p, b, { dmg: b.hp + 1, item: it, type: 'drown', legend: true, dir: info.dir }); G.FX.text(b.x, b.top - 12, t(`Dragged under|Утянут на дно|Suvga tortildi`), '#7fe8dc', { size: 7 }); }
    if (lm === 'chain' && info.type === 'melee') { YI._chainAcc = (YI._chainAcc || 0) + 0.2; if (YI._chainAcc >= 1) { YI._chainAcc -= 1; addVoid(1, `the chain remembers|цепь помнит|zanjir eslaydi`); } }
    if (lm === 'stones' && info.stones && b.teleT) b.teleT = 0;
  }
  // kills with the wax of return
  G.Events.on('kill', (e, info) => {
    try {
      const it = info && info.item; const p = pl();
      if (p && it && it.mods && it.mods.includes('w_return')) p.heal(Math.round(5 + 0.2 * CH.level()));
    } catch (x) { /* ignore */ }
  });

  /* ---------- shields: stamina, parry nodes, Humo ---------- */
  {
    const SH = G.ItemKinds.shield, g0 = SH.guard;
    SH.guard = function (p, item, ws, info) {
      if (G.run && CH.st.v <= 0 && !G.godMode) return null;          // guard broken: no stamina, no block
      const d = item.def, pw0 = d.parryWindow, pd0 = d.parryDmg;
      d.parryWindow = Math.round((pw0 || 9) + G.Perks.mod('parryWin', 0)); d.parryDmg = (pd0 || 20) * G.Perks.mod('parryDmg', 1);
      let r;
      try { r = g0.apply(this, arguments); } finally { d.parryWindow = pw0; d.parryDmg = pd0; }
      if (r === 'block') CH.spend(Math.max(4, (info.dmg || 10) * 0.5) * G.Perks.mod('blockCost', 1));
      else if (r === 'parry') {
        if (!(G.PROG && G.PROG.rank('b_block'))) CH.spend(8);
        if (d.yd && d.yd.legendMove === 'humo' && !(item.cd > 0)) {
          item.cd = item.cdMax = LEG_MOVES.humo.cd;
          for (const e of G.world.ents || []) if (e !== p && e.faction === 'player' && e.isActor) e.invulnT = Math.max(e.invulnT || 0, 240);
          G.Buffs.add('humo', 4, { mods: { dmgIn: v => v * 0.5 }, drawFx(ctx, pp) { G.Glow.add(pp.x, pp.y - 14, 26, '#ffd27a', 0.4); } });
          G.FX.ring(p.x, p.cy, 6, 48, '#ffd27a', 22, { width: 2 }); toast(t(`Humo's shadow|Тень Хумо|Humo soyasi`), '#ffd27a');
        }
      }
      return r;
    };
  }
  /* ---------- ranged: faster draw (Steady eye), sling volley, Davron's three stones ---------- */
  for (const k of ['bow', 'sling', 'gun']) {
    const K = G.ItemKinds[k], u0 = K.update;
    K.update = function (p, item, ws) {
      const r = u0.apply(this, arguments);
      const sp = G.Perks.mod('rangedSpeed', 1) * (1 + 0.006 * BAL.eff(CH.attrs().agi));
      if (!r && sp > 1) { ws._acc = (ws._acc || 0) + sp - 1; if (ws._acc >= 1) { ws._acc -= 1; ws.t++; } }
      return r;
    };
  }
  {
    const SL = G.ItemKinds.sling, u0 = SL.update;
    SL.update = function (p, item, ws) {
      const d = item.def, f0 = d.fire;
      if (!f0 || f0._yd) return u0.apply(this, arguments);
      const wrap = function (pp, it, w2) {
        const n0 = G.world.ents.length;
        if (d.yd && d.yd.legendMove === 'stones' && !(it.cd > 0)) { threeStones(pp, it); it.cd = it.cdMax = LEG_MOVES.stones.cd; return; }
        const vol = G.Perks.mod('slingVolley', 0) > 0;
        f0.call(this, pp, it, w2);
        if (vol) { f0.call(this, pp, it, w2); f0.call(this, pp, it, w2); }
        const fresh = G.world.ents.slice(n0).filter(e => e instanceof G.Projectile && e.owner === pp);
        fresh.forEach((e, i) => { e.info = Object.assign({}, e.info, { item: it, type: 'ranged' }); if (vol) e.vy += (i % 3 - 1) * 1.1; });
      };
      wrap._yd = true;
      d.fire = wrap;
      try { return u0.apply(this, arguments); } finally { d.fire = f0; }
    };
  }
  function threeStones(p, item) {
    const L = G.world.enemies.filter(e => e && !e.dead && !e.untargetable && Math.abs(e.x - p.x) < 260 && Math.abs(e.cy - p.cy) < 120).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x)).slice(0, 3);
    const h = WL.handW(p);
    for (let i = 0; i < 3; i++) {
      const tg = L[i % Math.max(1, L.length)];
      const ang = tg ? Math.atan2(tg.cy - h.y, tg.x - h.x) : (p.facing > 0 ? 0 : Math.PI) + (i - 1) * 0.12;
      G.world.add(new G.Projectile({ x: h.x, y: h.y, vx: Math.cos(ang) * 8, vy: Math.sin(ang) * 8, r: 2, faction: 'player', owner: p, dmg: G.Combat.playerDmg(item, 16), life: 70, homing: 0.12, kbx: 2, color: '#e8f0c0', info: { item, type: 'ranged', stun: 60, stones: true, legend: true }, trail: { color: '#ffe7a6', life: 8, size: 1.5, every: 1, glow: true } }));
    }
    G.FX.text(p.x, p.top - 12, t(`Three stones|Три камня|Uch tosh`), '#ffe7a6', { size: 7 }); sfx('throw', { x: p.x });
  }
  // bow arrows carry their bow (for mods)
  // a drawn bow or a crossbow finds its mark within a narrow cone (a low, crawling or hovering target)
  function aimAssist(p, proj) {
    if (!G.world) return;
    let best = null, bd = 1e9;
    for (const e of G.world.enemies) {
      if (!e || e.dead || e.untargetable) continue;
      const dx = (e.x - proj.x) * p.facing; if (dx < 8 || dx > 300) continue;
      const dy = e.cy - proj.y; if (Math.abs(dy) > dx * 0.45 + 10) continue;
      const d = dx + Math.abs(dy) * 2; if (d < bd) { bd = d; best = e; }
    }
    if (!best) return;
    const sp = Math.hypot(proj.vx, proj.vy) || 9, ang = Math.atan2(best.cy - proj.y, Math.abs(best.x - proj.x));
    proj.vx = Math.cos(ang) * sp * p.facing; proj.vy = Math.sin(ang) * sp;
  }
  YI.aimAssist = aimAssist;
  for (const id of W) { const d = ID[id]; if (d && d.kind === 'bow') { const f0 = d.onFire; d.onFire = function (p, it, proj) { proj.info = Object.assign({}, proj.info, { item: it, type: 'ranged' }); aimAssist(p, proj); if (f0) f0.apply(this, arguments); }; } }

  /* ================================================================ drops, pickups, shops */
  const dropPool = (stage, kind) => {
    const L = [];
    for (const id in ID) {
      const d = ID[id]; if (!d || d.noDrop || !d.yd || (d.minStage || 0) > stage + 0.01) continue;
      const ty = TYPE_OF(id); if (ty === 'key' || (ty === 'skill' && !(d.yd && d.yd.found))) continue;
      if (kind && kind !== ty) continue;
      L.push(d);
    }
    return L;
  };
  YI.dropPool = dropPool;
  const pickW = L => { let t2 = 0; for (const d of L) t2 += d.weight || 1; let r = Math.random() * t2; for (const d of L) { r -= d.weight || 1; if (r <= 0) return d; } return L[0]; };
  const rollQ = stage => { const r = Math.random(); const m = 0.06 + 0.02 * stage, g = 0.28 + 0.01 * stage; return r < m ? 2 : r < m + g ? 1 : 0; };
  YI.rollQ = rollQ;
  function dropFor(stage, opts) {
    opts = opts || {};
    const r = Math.random() / G.Perks.mod('loot', 1);
    let kind = opts.kind || (r < 0.42 ? 'material' : r < 0.6 ? 'consumable' : r < 0.77 ? 'weapon' : r < 0.88 ? 'armour' : r < 0.94 ? 'charm' : r < 0.97 ? 'tumar' : 'skill');
    if (opts.slot === 'skill') kind = ['consumable', 'charm', 'tumar', 'skill'][Math.floor(Math.random() * 4)];
    let L = dropPool(stage, kind);
    if (!L.length) L = dropPool(stage, 'material');
    const d = pickW(L);
    const it = G.Items.create(d.id, 0);
    if (!it) return null;
    const ty = TYPE_OF(d.id);
    it.q = ty === 'weapon' || ty === 'armour' ? rollQ(stage) : 0; it.up = 0; it.mods = [];
    it.n = ty === 'material' ? (d.id === 'mat_bone' ? 1 : 1 + (Math.random() < 0.4 ? 1 : 0)) : 1;
    const dd = it.def;
    Object.defineProperty(it, 'name', { configurable: true, get() { return LANG.T(dd.name) + (this.n > 1 ? ' ×' + this.n : ''); } });
    return it;
  }
  YI.dropFor = dropFor;
  {
    const rd0 = G.Items.randomDrop;
    G.Items.randomDrop = function (stage, opts) {
      if (!G.run) return rd0.apply(this, arguments);
      try { return dropFor(stage || 0, opts); } catch (e) { console.error('[items] drop', e); return null; }
    };
    const cHex = G.Items.colorHex;
    G.Items.colorHex = function (it) { if (it && it.def && it.def.yd) return QUAL[it.q || 0].col; return cHex.apply(this, arguments); };
    const pu0 = G.Items.pickUp;
    G.Items.pickUp = function (p, drop) {
      const it = drop && drop.item;
      if (!G.run || !it || !it.def) return pu0.apply(this, arguments);
      const e = addEntry(S(), it.id, { q: it.q || 0, up: it.up || 0, mods: it.mods || [], n: it.n || 1 });
      if (!e) return pu0.apply(this, arguments);
      drop.dead = true;
      sfx('pickup');
      G.FX.burst(p.x, p.cy, 16, { speed: 2.5, life: 30, size: 2, size1: 0, color: QUAL[e.q || 0].col, glow: true });
      const ty = TYPE_OF(it.id), cat = YI.slotsFor(e), free = cat.find(k => !S().eq[k]);
      if ((ty === 'weapon' || ty === 'skill') && free) YI.equip(e.u, free);
      toast(tf(`Found: {n}  · [I]|Найдено: {n}  · [I]|Topildi: {n}  · [I]`, { n: LANG.T(it.name) }), QUAL[e.q || 0].col);
      CH.dirty(); save();
      G.Events.emit('equip', it, null);
      return true;
    };
  }
  // the yodchi's cache (former scroll spots)
  YI.openCache = (obj, p) => {
    const st = G.run ? G.run.stage : 0;
    const x = obj ? obj.x : p.x, y = obj ? obj.y - 10 : p.y - 10;
    const r = Math.random();
    const it = r < 0.55 ? dropFor(st, { kind: 'material' }) : r < 0.8 ? dropFor(st, { kind: 'consumable' }) : r < 0.9 ? dropFor(st, { kind: 'tumar' }) : null;
    if (it) G.Pickups.item(x, y, it); else { BAL.goldCtx('cache'); G.Pickups.gold(x, y, 12 + 4 * st); BAL.goldCtx(null); }
    G.FX.burst(x, y, 12, { speed: 2, life: 26, size: 2, color: '#e2b452', glow: true });
    sfx('chest');
  };
  // boss: a bundle of upgrade material instead of a scroll
  G.Events.on('bossDefeated', b => {
    setTimeout(() => {
      try {
        if (!G.world || !b) return;
        const st = G.run.stage, n = G.run.bossesKilled ? G.run.bossesKilled.length : 1;
        const mat = st >= 6.5 ? 'mat_bone' : st >= 3 ? 'mat_bulat' : 'mat_iron';
        const it = G.Items.create(mat, 0); it.q = 0; it.n = mat === 'mat_iron' ? 2 : 1; it.up = 0; it.mods = [];
        G.Pickups.item(b.x + 10, b.cy, it);
        if (n % 2 === 0) { const m = Object.keys(MODS)[Math.floor(Math.random() * 10)]; const mi2 = G.Items.create(m, 0); mi2.q = 0; mi2.n = 1; mi2.mods = []; G.Pickups.item(b.x - 30, b.cy, mi2); }
      } catch (e) { console.error('[items] boss drop', e); }
    }, 0);
  });

  /* ---------- prices, the chaikhana rugs, selling ---------- */
  YI.price = e => {
    const d = ID[e.id]; if (!d || !d.yd) return 50;
    let p = d.yd.price || 50;
    if (TYPE_OF(e.id) === 'weapon' || TYPE_OF(e.id) === 'armour') p *= [1, 1.6, 2.4, 0][e.q || 0] || 1;
    p *= 1 + 0.25 * (e.up || 0);
    return Math.max(1, Math.round(p));
  };
  YI.sellPrice = e => (ID[e.id].yd.legend || TYPE_OF(e.id) === 'key' || TYPE_OF(e.id) === 'skill' ? 0 : Math.max(1, Math.round(YI.price(e) * 0.3)));
  YI.atRest = () => !!(G.level && G.level.isRest) || !!(G.Game.stage && G.Game.stage.plan && G.Game.stage.plan.type === 'rest');
  const SELL_LIMIT = 200;
  YI.sellLeft = () => { const s = S(); const key = 'sold' + SK(); return SELL_LIMIT - (s.seen[key] || 0); };
  YI.sell = (u, n) => {
    const e = invGet(u); if (!e || !YI.atRest()) return false;
    const pr = YI.sellPrice(e); if (!pr || YI.equippedIn(u)) return false;
    if (YI.sellLeft() < pr) { toast(t(`The buyer has no more tilla this time.|У скупщика на сегодня кончилась тилла.|Xaridorning bu safar tillasi qolmadi.`), C.danger); return false; }
    const s = S(); s.seen['sold' + SK()] = (s.seen['sold' + SK()] || 0) + pr;
    YI.remove(u, n || 1); gold(pr);
    return true;
  };
  ON_STAGE.push((plan, biome, level) => {
    if (!plan || plan.type !== 'rest' || !G.world) return;
    const st = G.run.stage;
    // rug 1: a weapon or a piece of armour; rug 2: a charm, a brew, a tumar or a mod; rug 3: food or material
    const rugs = G.world.interactables.filter(o => o.art === 'shopRug').sort((a, b2) => a.x - b2.x);
    rugs.forEach((o, i) => {
      if (i === 0) o.item = dropFor(st + 1, { kind: Math.random() < 0.6 ? 'weapon' : 'armour' });
      else if (i === 1) o.item = dropFor(st + 1, { kind: ['charm', 'consumable', 'tumar', 'mod', 'skill'][Math.floor(Math.random() * 5)] });
      if (o.item) o.food = false;
    });
    for (const o of rugs) {
      if (!o.item) {                 // plov rug: sometimes a material instead
        if (Math.random() < 0.5) { const it = dropFor(st + 1, { kind: 'material' }); o.item = it; o.food = false; }
        else { o.price = 30; o.prompt = `Купить плов — ${o.price} тилла`; continue; }
      }
      const e = { id: o.item.id, q: o.item.q || 0, up: 0 };
      o.price = Math.round(YI.price(e) * (TYPE_OF(e.id) === 'material' ? (o.item.n || 1) : 1));
      o.prompt = `Купить «${o.item.name}» — ${o.price} тилла`;
    }
    // the smith's anvil (until Ma'ruf the smith gets his own scene)
    if (level && level.spawn) {
      const a = new G.Interactable(level.spawn.x + 120, level.spawn.y, { art: 'ydAnvil', w: 22, h: 16, prompt: N(`The smith's anvil (upgrades, stones and wax)|Наковальня кузнеца (улучшения, камни и воск)|Temirchi sandoni (yaxshilash, tosh va mum)`) });
      a.onUse = () => { if (!busy) setTimeout(() => G.INV_OPEN && G.INV_OPEN({ smith: true }), 60); return true; };
      G.world.add(a);
    }
    void biome;
  });
  G.ObjArt.ydAnvil = (ctx, o) => {
    const x = RD(o.x), y = RD(o.y);
    ctx.fillStyle = '#120c14'; ctx.fillRect(x - 10, y - 12, 20, 12);
    ctx.fillStyle = '#4a5060'; ctx.fillRect(x - 9, y - 11, 18, 4); ctx.fillRect(x - 4, y - 7, 8, 5); ctx.fillRect(x - 7, y - 2, 14, 2);
    ctx.fillStyle = '#8e96a4'; ctx.fillRect(x - 9, y - 11, 18, 1); ctx.fillRect(x + 6, y - 10, 4, 1);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(x + 5, y - 17, 1, 6); ctx.fillStyle = '#8e96a4'; ctx.fillRect(x + 3, y - 18, 5, 2);
    if ((G.frame >> 3) % 6 === 0) { ctx.fillStyle = '#ffd060'; ctx.fillRect(x - 2, y - 13, 1, 1); }
  };

  /* ---------- the smith: upgrades and mods ---------- */
  const UPG_COST = [null, { gold: 80, mat: 'mat_iron', n: 1 }, { gold: 160, mat: 'mat_iron', n: 2 }, { gold: 600, mat: 'mat_bulat', n: 1 }, { gold: 900, mat: 'mat_bulat', n: 2 }, { gold: 1500, mat: 'mat_bone', n: 1 }];
  YI.UPG_COST = UPG_COST;
  YI.upgradeCost = e => (e && (e.up || 0) < 5 ? UPG_COST[(e.up || 0) + 1] : null);
  YI.canUpgrade = e => {
    const c = YI.upgradeCost(e); if (!c) return t(`Fully upgraded|Улучшено до предела|Oxirigacha yaxshilangan`);
    if (TYPE_OF(e.id) !== 'weapon') return t(`Only weapons|Только оружие|Faqat qurol`);
    if ((G.run.gold || 0) < c.gold) return tf(`needs {n} tilla|нужно {n} тилла|{n} tilla kerak`, { n: c.gold });
    if (YI.count(c.mat) < c.n) return tf(`needs {m} ×{n}|нужно: {m} ×{n}|kerak: {m} ×{n}`, { m: LANG.T(ID[c.mat].name), n: c.n });
    return null;
  };
  YI.upgrade = u => {
    const e = invGet(u); if (!e || YI.canUpgrade(e)) return false;
    const c = YI.upgradeCost(e);
    G.run.gold -= c.gold; YI.take(c.mat, c.n);
    e.up = (e.up || 0) + 1;
    YI.syncSlots(); CH.dirty(); save();
    sfx('buy'); sfx('hit_heavy', { pitch: 1.6 });
    return true;
  };
  YI.socketCount = e => (TYPE_OF(e.id) === 'weapon' ? QUAL[e.q || 0].slots : 0);
  YI.socket = (u, modU) => {
    const e = invGet(u), m = invGet(modU); if (!e || !m || TYPE_OF(m.id) !== 'mod') return false;
    if ((e.mods || []).length >= YI.socketCount(e)) return false;
    if (e.mods.includes(m.id)) return false;
    e.mods.push(m.id); YI.remove(modU, 1);
    YI.syncSlots(); CH.dirty(); save(); sfx('scroll');
    return true;
  };
  YI.unsocket = (u, i) => {
    const e = invGet(u); if (!e || !e.mods || !e.mods[i]) return false;
    const id = e.mods.splice(i, 1)[0]; addEntry(S(), id, { quiet: true });
    YI.syncSlots(); CH.dirty(); save(); sfx('ui_back');
    return true;
  };

  /* ---------- consumables and tumars from the satchel ---------- */
  YI.use = u => {
    const e = invGet(u); if (!e) return false;
    const d = ID[e.id], ty = TYPE_OF(e.id), p = pl();
    if (!p || p.dead) return false;
    if (ty === 'consumable') {
      const k = d.yd.use;
      if (k === 'plov') { G.Buffs.add('plov', 9999, { mods: { maxHp: v => v * 1.1 } }); CH.dirty(); CH.syncHp(); p.heal(Math.round(p.maxHp * 0.1)); }
      else if (k === 'samsa') G.Buffs.add('samsa', 9999, { mods: { stamRegen: v => v * 1.25 } });
      else if (k === 'tea') { addVoid(-3, `bitter tea|горький чай|achchiq choy`); }
      else if (k === 'bandage') { if (p.st) p.st.bleed = null; p.heal(Math.round(p.maxHp * 0.08)); }
      else if (k === 'antidote') { if (p.st) p.st.poison = null; G.Buffs.add('antidote', 9999, { mods: { res_poison: v => v + 0.5 } }); }
      else if (k === 'firebrew') G.Buffs.add('firebrew', 9999, { mods: { res_frost: v => v + 0.5 } });
      YI.remove(u, 1); sfx('drink'); CH.dirty();
      return true;
    }
    return false;
  };
  ON_STAGE.push(() => { for (const k of ['plov', 'samsa', 'antidote', 'firebrew', 'ys_drink', 'humo']) { const L = G.Buffs.list(); const i = L.findIndex(b => b.id === k); if (i >= 0) L.splice(i, 1); } CH.dirty(); });
  const DRINK = [
    { name: `courage|отвага|jasorat`, mods: { dmgOut: v => v * 1.1 } },
    { name: `endurance|выносливость|chidam`, mods: { stamMax: v => v * 1.15 } },
    { name: `a steady hand|твёрдая рука|mustahkam qo'l`, mods: { crit: v => v + 0.08 } },
    { name: `a light step|лёгкий шаг|yengil qadam`, mods: { speed: v => v * 1.1 } }
  ];
  YI.drink = u => {
    const e = invGet(u); if (!e || TYPE_OF(e.id) !== 'tumar' || e.id === 'tu_blank') return false;
    const q = (ID[e.id].yd.tq || 0) + (e.q || 0), k = DRINK[Math.floor(Math.random() * DRINK.length)];
    G.Buffs.add('tumarDrink', 180, { mods: k.mods }); CH.dirty();
    YI.remove(u, 1);
    addVoid(2 + q, `a tasted memory|испитое воспоминание|totilgan xotira`);
    toast(tf(`Someone else's {k} fills you (3 min).|В тебе чужое: {k} (3 мин).|Birovning {k}i endi sende (3 daq.)`, { k: t(k.name) }), '#ffe2a8');
    return true;
  };
  YI.burn = u => {
    const e = invGet(u), p = pl(); if (!e || !p || TYPE_OF(e.id) !== 'tumar') return false;
    const q = (ID[e.id].yd.tq || 0) + (e.q || 0);
    YI.remove(u, 1);
    YI._pendingBurn = q;
    return true;
  };
  // the burn goes off when the satchel closes
  YI.flushBurn = () => {
    const q = YI._pendingBurn; if (q == null) return; YI._pendingBurn = null;
    const p = pl(); if (!p) return;
    const dmg = G.Combat.playerDmg({ def: { yd: { scal: { mem: 'A' }, power: 1, skill: true } } }, 30 * [0.7, 1, 1.35, 1.8][Math.min(3, q)]);
    G.Combat.area(p, { x: p.x - 60, y: p.y - 56, w: 120, h: 62 }, tg => ({ dmg, type: 'magic', magic: true, kbx: 3, kby: -2, dir: Math.sign(tg.x - p.x) || 1, status: { burn: { t: 150, dps: 3 + CH.level() * 0.6 } } }), new Set());
    try { G.FX.explosion(p.x, p.y - 20, { size: 's', pal: 'fire' }); } catch (x) { G.FX.ring(p.x, p.y - 20, 4, 50, '#ffb060', 18); }
    CH.magicVoid(1 + q, `a tumar burned|сгорел тумар|tumar yonib ketdi`);
  };

  /* ================================================================ story API */
  CH.give = (id, o) => {
    if (!ID[id]) { console.warn('[items] no item', id); return null; }
    const e = YI.add(id, o || {});
    if (e && !(o && o.quiet)) toast(tf(`Received: {n}|Получено: {n}|Olindi: {n}`, { n: LANG.T(ID[id].name) + ((o && o.n > 1) ? ' ×' + o.n : '') }), QUAL[e.q || 0].col);
    return e;
  };
  CH.has = id => YI.count(id) > 0;
  CH.takeItem = (id, n) => YI.take(id, n);
  // legendary weapons: the story calls G.CH.grantLegend('rustam'), ('gilded_fang', { gift: true }) ...
  CH.grantLegend = (key, o) => {
    const L = LEGENDS[key]; if (!L) { console.warn('[items] no legend', key); return null; }
    const s = S();
    if (s.legends[key]) return null;
    s.legends[key] = 1;
    if (o && o.gift) s.legends[key + '_gift'] = 1;
    const e = YI.add(L.id, { q: 3 });
    toast(tf(`Legendary: {n}|Легендарное: {n}|Afsonaviy: {n}`, { n: LANG.T(ID[L.id].name) }), QUAL[3].col);
    sfx('ready'); try { G.FX.flash('#ffd27a', 0.3); } catch (x) { /* ignore */ }
    return e;
  };
  CH.LEGENDS = LEGENDS;
  CH.flag = name => G.Perks.mod('flag_' + name, 0) > 0;
  ON_STAGE.push(() => { LEG.cradleUsed = false; });
  G.Events.on('bossStart', () => { LEG.cradleUsed = false; });
}
