/* 89p_minibosses.js — the eight minibosses of GDD ch. 17. Each one is a named, scripted elite that stays dead, with
   one idea of its own (difficulty from the moveset, not from numbers):
     Tandirchi        Potters' Quarter  a Hollow potter with a red-hot shovel; the kilns around him spew fire
     The Auctioneer   Bazaar (night)    fights with a gavel; puts your techniques "up for auction" (a skill goes dark)
     Plume Captain    the Ark           a sabre duel: parries frontal blows; parry HIS thrust and his guard opens
     Mother of Vultures  Tower of Silence  an air fight: high and quick; slings, bows and magic hurt her most
     Clay Golem       the Karez         slow; crumbles and pulls itself back together, unless you wash it away with water
     The Overseer     Salt Mines        a whip, and convicts kept as hostages: you cannot strike through them
     Banner-bearer    Old Yodgor        while the banner stands, he and his people cannot be hurt
     The Bride        the Drowned Wedding  dances; her attacks fall on the beat of the music
   A miniboss: XP 150, 60–100 tilla (GDD ch. 18). A bar with its name at the top of the screen while you fight it. */
{
  const EK = G.EK, ED = G.Enemies.defs, U = G.U, KIT = G.BossKit, W2 = G.WORLD2;
  const pl = () => G.world && G.world.player;
  const MB = G.MINIBOSS = { defs: {} };
  const mark = (o) => { try { return G.world.add(new KIT.Marker(Object.assign({ style: 'floor', hgt: 22, color: '#ff3a2a' }, o))); } catch (e) { return null; } };
  const say = (e, s, col) => { try { G.FX.text(e.x, e.top - 14, t(s), col || '#ffe7a6', { size: 7 }); } catch (x) { /* ignore */ } };
  const snd = (n, o) => { try { G.Audio.sfx(n, o || {}); } catch (e) { /* ignore */ } };
  // later(e, frames, fn): a small per-instance timer (runs in the enemy's update, so it pauses with the game)
  const later = (e, n, fn) => { (e._mbT = e._mbT || []).push({ n, fn }); };
  function def(id, o) {
    const d = EK.clone(o.base, 'mb_' + id, Object.assign({ name: N(o.name), biomes: [], weight: 0, miniboss: true, codexAs: null }, o.over || {}), o.look);
    if (!d) { console.warn('[mb] no base', o.base); return; }
    MB.defs[id] = Object.assign({ id, d }, o);
    const i0 = d.init;
    d.init = function (e, op) { if (i0) i0.call(this, e, op); e._mb = id; e._mbPh = 0; try { o.setup && o.setup(e); } catch (x) { console.error('[mb] setup', id, x); } };
    const u0 = d.update;
    d.update = function (e) {
      if (e._mbT && e._mbT.length) for (let i = e._mbT.length - 1; i >= 0; i--) { const q = e._mbT[i]; if (--q.n <= 0) { e._mbT.splice(i, 1); try { q.fn(); } catch (x) { console.error('[mb] timer', x); } } }
      let skip = false;
      if (e.aggro && !e.dead) { try { skip = o.tick ? o.tick(e) === true : false; } catch (x) { console.error('[mb] tick', id, x); } }
      if (!skip && u0) u0.call(this, e);
    };
    if (o.modIn) {
      const i1 = d.init;
      d.init = function (e, op) { i1.call(this, e, op); const m0 = e.modDamageIn; e.modDamageIn = function (dmg, hit) { let v = m0 ? m0.call(this, dmg, hit) : dmg; try { v = o.modIn(e, v, hit); } catch (x) { /* ignore */ } return v; }; };
    }
    // the region: replace the old elite ambush there, or add one
    const reg = W2.regions[o.region];
    if (reg && reg.objects) {
      const old = reg.objects.find(x => x.kind === 'miniboss' && (x.id === o.replaces));
      const od = { kind: 'miniboss', id: o.replaces || id, at: { frac: o.frac }, enemy: 'mb_' + id, hpMul: o.hpMul || 1.3, adds: o.adds || [], night: !!o.night };
      if (old) Object.assign(old, od, { adds: od.adds }); else reg.objects.push(od);
    } else console.warn('[mb] no region', o.region);
  }
  // only at night, if the miniboss says so
  {
    const K = W2.kinds && W2.kinds.miniboss;
    if (K) { const s0 = K.spawn; K.spawn = function (o) { if (o.od.night && !(W2.isNight && W2.isNight())) return; return s0.apply(this, arguments); }; }
  }
  // reward
  G.Events.on('kill', e => {
    try {
      if (!e || !e._mb) return;
      const M = MB.defs[e._mb];
      gold(60 + Math.floor(Math.random() * 41));
      if (G.CH && G.CH.addXp) G.CH.addXp(150, 'miniboss');
      if (M && M.onDeath) M.onDeath(e);
      toast(tf(`{n} is down|{n} повержен(а)|{n} yengildi`, { n: t(M.name) }), '#ffd77a');
      MB.down = MB.down || {}; MB.down[e._mb] = 1;
    } catch (x) { console.error('[mb] kill', x); }
  });

  /* ================================================================ 1. Tandirchi */
  def('tandirchi', {
    base: 'jailer', region: 'potters', frac: .55, replaces: 'golem', hpMul: 1.45,
    name: `Tandirchi, the Hollow potter|Тандырщик, пустой гончар|Tandirchi, bo'sh kulol`,
    look: { hue: 20, sat: .9, light: .75, scale: 1.3, map: {} },
    setup(e) { const h0 = e.hitPlayer.bind(e); e.hitPlayer = (b, o) => h0(b, Object.assign({}, o || {}, { status: { burn: { t: 150, dps: 2.5 } } })); e._kiln = 160; },
    tick(e) {
      if (--e._kiln > 0) return;
      e._kiln = e.hp < e.maxHp * .5 ? 170 : 230;
      // the kilns around him breathe: two (three when hurt) spots on the floor, then fire
      const p = pl(); if (!p) return;
      const xs = [p.x + U.rand(-20, 20), e.x + (Math.random() < .5 ? -1 : 1) * U.rand(60, 110)];
      if (e.hp < e.maxHp * .5) xs.push(p.x + (Math.random() < .5 ? -70 : 70));
      say(e, `The kilns!|Печи!|Xumdonlar!`, '#ffb060'); snd('fire', { x: e.x, pitch: .6 });
      for (const x of xs) { const gy = G.level.groundBelow(x, p.y - 30, 90); if (gy === null) continue; mark({ x, y: gy, w: 34, life: 52, color: '#ff8a3a' }); later(e, 52, () => { try { G.world.add(new KIT.FirePool(x, gy, { w: 34, life: 150, dmg: e.dmg * .45, rehit: 34 })); G.FX.burst(x, gy - 8, 14, { color: '#ff8a3a', speed: 2, life: 26, size: 2, glow: true }); } catch (x2) { /* ignore */ } }); }
    }
  });

  /* ================================================================ 2. The Auctioneer */
  def('auctioneer', {
    base: 'guard', region: 'bazaar', frac: .68, replaces: 'captain', hpMul: 1.4, night: true, adds: ['assassin'],
    name: `The Auctioneer|Аукционист|Kim oshdi savdochisi`,
    look: { hue: 270, sat: .7, light: .95, scale: 1.2 },
    setup(e) { e._sale = 300; },
    tick(e) {
      const p = pl(); if (!p) return;
      if (e._calling) return;
      if (--e._sale > 0 || Math.abs(p.x - e.x) > 220) return;
      const slots = ['skill1', 'skill2'].filter(k => G.run.slots && G.run.slots[k] && G.run.slots[k].def);
      if (!slots.length) { e._sale = 400; return; }
      e._calling = true; e._hp0 = e.hp; e._sale = 480;
      const k = slots[Math.floor(Math.random() * slots.length)], it = G.run.slots[k];
      const nm = (() => { const n = String(it.def.name || ''); return n.indexOf('|') >= 0 ? t(n) : (window.__T ? window.__T(n) : n); })();
      say(e, `Going once…|Раз…|Bir…`); snd('coin', { x: e.x });
      later(e, 40, () => { if (!e.dead) { say(e, `Going twice…|Два…|Ikki…`); snd('coin', { x: e.x, pitch: 1.2 }); } });
      later(e, 80, () => {
        e._calling = false;
        if (e.dead) return;
        // a hard enough hit while he calls the lots spoils the sale
        if (e._hp0 - e.hp >= e.maxHp * 0.08) { say(e, `Bid withdrawn!|Торги сорваны!|Savdo buzildi!`, '#9cf0a0'); return; }
        it.cd = Math.max(it.cd || 0, 600); it.cdMax = Math.max(it.cdMax || 0, it.cd);
        say(e, `Sold!|Продано!|Sotildi!`, '#ff8a7a'); snd('denied');
        toast(tf(`Sold at auction: {n} (10 s)|Продано с торгов: {n} (10 с)|Kim oshdi savdosida sotildi: {n} (10 s)`, { n: nm }), '#ff8a7a');
      });
    }
  });

  /* ================================================================ 3. Plume Captain */
  def('plume', {
    base: 'yd_gilded', region: 'ark', frac: .44, replaces: 'steward', hpMul: 1.5,
    name: `The Plume Captain|Капитан плюмажа|Patli sardor`,
    look: { hue: -15, sat: 1.1, light: 1.0, scale: 1.2 },
    setup(e) { e._open = 0; },
    tick(e) { if (e._open > 0) { e._open--; if (e.t % 6 === 0) try { G.FX.spawn({ x: e.x + U.rand(-6, 6), y: e.top + 4, vy: -.6, life: 20, size: 1, color: '#ffe7a6' }); } catch (x) { /* ignore */ } } },
    modIn(e, v, hit) {
      const p = pl(); if (!p) return v;
      if (e._open > 0) return v * 1.3;
      const front = Math.sign(p.x - e.x) === e.facing;
      if (front && hit && hit.type === 'melee' && !hit.heavy && !(e.teleT > 0)) {
        snd('parry', { x: e.x }); try { G.FX.sparks(e.x + e.facing * 8, e.cy - 4, 8, -e.facing, { color: '#ffffff', color2: '#ffe7a6' }); } catch (x) { /* ignore */ }
        if (!MB.taughtParry) { MB.taughtParry = true; toast(t(`He parries anything from the front. Parry HIS thrust, or strike from behind.|Всё, что спереди, он парирует. Отбей ЕГО выпад или бей со спины.|Oldidan kelgan har narsani qaytaradi. UNING sanchishini qaytar yoki orqadan ur.`), '#ffe7a6'); }
        p.vx = -e.facing * -2.5; e.atkCD = Math.min(e.atkCD, 6);
        return 0;
      }
      return v;
    }
  });
  // your parry opens his guard
  {
    const em0 = G.Perks.emit;
    G.Perks.emit = function (ev) {
      const r = em0.apply(this, arguments);
      if (ev === 'onParry') try { const p = pl(); for (const e of G.world.enemies) if (!e.dead && e._mb === 'plume' && p && Math.abs(e.x - p.x) < 120) { e._open = 150; say(e, `Open!|Открыт!|Ochiq!`, '#9cf0a0'); e.hurtT = Math.max(e.hurtT || 0, 30); } } catch (x) { /* ignore */ }
      return r;
    };
  }

  /* ================================================================ 4. Mother of Vultures */
  def('vultures', {
    base: 'berkut_wraith', region: 'tower', frac: .42, replaces: 'vulture', hpMul: 1.6, adds: ['yd_vulture'],
    name: `Mother of Vultures|Мать стервятников|Tasqaralar onasi`,
    look: { hue: 10, sat: .4, light: .65, scale: 1.7 },
    setup(e) { e._call = 300; },
    tick(e) {
      if (--e._call > 0) return;
      e._call = 420;
      const n = G.world.enemies.filter(o => !o.dead && o.def.id === 'yd_vulture').length;
      if (n >= 3) return;
      say(e, `*shriek*|*крик*|*chinqiriq*`, '#c8b8a0'); snd('summon', { x: e.x });
      for (let i = 0; i < (e.hp < e.maxHp * .5 ? 2 : 1); i++) G.Enemies.spawn('yd_vulture', e.x + (i ? 30 : -30), e.y - 20, { noMods: true });
    },
    // high up she is hard to reach with a blade; arrows, stones and magic hurt her most
    modIn(e, v, hit) { const t0 = hit && hit.type; return t0 === 'melee' ? v * 0.75 : v * 1.5; }
  });

  /* ================================================================ 5. Clay Golem */
  def('claygolem', {
    base: 'tile_golem', region: 'karez', frac: .72, replaces: 'mother', hpMul: 1.25,
    name: `The Clay Golem|Глиняный голем|Loy golem`,
    look: { hue: 25, sat: .9, light: .8, scale: 1.3 },
    setup(e) { e._reform = 2; },
    tick(e) {
      if (!e._crumb) return;
      e.vx = 0; e.invulnT = Math.max(e.invulnT || 0, 3);
      if (--e._crumb > 0) return true;
      // it pulls itself together
      e._crumb = 0; e.hp = Math.round(e.maxHp * .45); e.alpha = 1;
      if (e._pour) { e._pour.dead = true; e._pour = null; }
      say(e, `The clay rises again.|Глина поднимается снова.|Loy yana ko'tariladi.`, '#c8875a'); snd('stomp', { x: e.x, pitch: .6 });
      return true;
    },
    modIn(e, v) {
      if (e._crumb) return 0;
      if (v >= e.hp && e._reform > 0) {
        e._reform--; e._crumb = 240; e.hp = 1;
        try { G.FX.burst(e.x, e.cy, 26, { color: '#8a5434', speed: 2.4, life: 34, size: 2 }); } catch (x) { /* ignore */ }
        snd('break', { x: e.x });
        if (!MB.toldClay) { MB.toldClay = true; toast(t(`It is pulling itself back together. Clay cannot hold in water.|Он собирается обратно. Глина не держится в воде.|U yana yig'ilyapti. Loy suvda turolmaydi.`), '#9fe4ff'); }
        // pour water on it (one flask) and it never rises again
        try {
          const o = new G.Interactable(e.x, e.y, { art: 'w2trace', w: 20, h: 16, prompt: t(`Pour water on the clay (1 flask)|Полить глину водой (1 фляга)|Loyga suv quyish (1 idish)`), onUse: (p2, self) => {
            if (!G.run || (G.run.flasks || 0) < 1) { toast(t(`No water left.|Воды не осталось.|Suv qolmadi.`), '#b0a0c0'); return true; }
            G.run.flasks--; self.dead = true; e._pour = null; e._reform = 0; e._crumb = 0; e.invulnT = 0;
            try { G.FX.burst(e.x, e.cy, 20, { color: '#9fe4ff', speed: 2, life: 30, size: 2 }); } catch (x) { /* ignore */ }
            snd('drink'); e.hp = 1; e.die({}); return true;
          } });
          G.world.add(o); e._pour = o;
        } catch (x) { console.error('[mb] pour', x); }
        return 0;
      }
      return v;
    }
  });

  /* ================================================================ 6. The Overseer */
  const hostage = EK.clone('zindan_prisoner', 'yd_hostage', { name: N(`Convict|Каторжник|Mahbus`), biomes: [], weight: 0, contact: false, hp: 30 }, { sat: .15, light: 1.25, hue: 10 });
  if (hostage) {
    const i0 = hostage.init; hostage.init = function (e, o) { if (i0) i0.call(this, e, o); e.untargetable = true; e.aggro = false; };
    hostage.update = function (e) {
      const ov = e._of; if (!ov || ov.dead) { e.vx = e.facing * 1.4; e.alpha = Math.max(0, (e.alpha == null ? 1 : e.alpha) - 0.01); if (e.alpha <= 0) { e.dead = true; e.remove = true; } return; }
      const p = pl(); const want = ov.x + (p ? Math.sign(p.x - ov.x) || 1 : 1) * (18 + (e._slot || 0) * 12);
      e.facing = Math.sign(want - e.x) || e.facing; e.vx = Math.abs(want - e.x) > 4 ? Math.sign(want - e.x) * 1.1 : 0;
    };
  }
  def('overseer', {
    base: 'jailer', region: 'mines', frac: .62, replaces: 'overseer', hpMul: 1.5,
    name: `The Overseer|Надсмотрщик|Nazoratchi`,
    look: { hue: 0, sat: .5, light: .7, scale: 1.25 },
    setup(e) {
      e._whip = 160;
      later(e, 1, () => { for (let i = 0; i < 3; i++) { const h = G.Enemies.spawn('yd_hostage', e.x + (i + 1) * 14, e.y, { noMods: true }); if (h) { h._of = e; h._slot = i; } } });
    },
    tick(e) {
      const p = pl(); if (!p) return;
      if (--e._whip > 0) return;
      e._whip = e.hp < e.maxHp * .5 ? 140 : 190;
      e.facePlayer(); e.telegraph(34);
      const dir = e.facing, x0 = dir > 0 ? e.x : e.x - 120;
      mark({ x: e.x + dir * 60, y: e.y, w: 120, life: 34, color: '#ff8a5a' });
      later(e, 34, () => {
        if (e.dead) return;
        snd('whoosh', { x: e.x, pitch: .7 });
        const pp = pl(); if (pp && !pp.dead && pp.x > x0 && pp.x < x0 + 120 && Math.abs(pp.cy - e.cy) < 30) G.Combat.hit(e, pp, { dmg: e.dmg * 1.15, kbx: 3, kby: -2, dir, type: 'melee', status: { bleed: { t: 120, dps: 2 } } });
        try { G.FX.sparks(e.x + dir * 100, e.cy, 6, dir, { color: '#c8a078' }); } catch (x) { /* ignore */ }
      });
    },
    // you cannot strike through a convict standing between you and him
    modIn(e, v, hit) {
      const p = pl(); if (!p) return v;
      const shield = G.world.enemies.some(h => !h.dead && h._of === e && Math.sign(h.x - e.x) === Math.sign(p.x - e.x) && Math.abs(h.x - e.x) < Math.abs(p.x - e.x) && Math.abs(h.x - e.x) < 40);
      if (shield && hit && hit.type !== 'magic') { if (!e._shT || G.frame - e._shT > 30) { e._shT = G.frame; say(e, `Not through the convict!|Не сквозь каторжника!|Mahbus orqali emas!`, '#ff8a7a'); } return 0; }
      return v;
    },
    onDeath() { rep('rabat', 1); toast(t(`The convicts drop their picks and walk out into the light.|Каторжники бросают кирки и уходят к свету.|Mahbuslar cho'kichlarini tashlab, yorug'likka chiqib ketishadi.`), '#e8d8a8'); }
  });

  /* ================================================================ 7. Banner-bearer of Those Who Remember */
  if (!ED.yd_banner) G.Enemies.register({
    id: 'yd_banner', name: N(`Banner of Those Who Remember|Знамя Помнящих|Eslovchilar bayrog'i`), biomes: [], weight: 0, hp: 70, w: 10, h: 44, contact: false, poise: 1, kbResist: 1, sight: 0,
    sprite: { w: 40, h: 60, ox: 20, oy: 58 }, blood: '#4a4048',
    init(e) { e.aggro = true; },
    update(e) { e.vx = 0; },
    draw(ctx, e, f) {
      ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-1, -52, 2, 52);
      const w = Math.sin(f * 0.08) * 1.5;
      ctx.fillStyle = '#5a5a64'; ctx.fillRect(1, -50, 15, 12); ctx.fillStyle = '#7a7a84'; ctx.fillRect(1, -50, 15, 3);
      ctx.fillStyle = '#c9b4ff'; ctx.fillRect(6 + Math.round(w), -46, 4, 4);
      ctx.fillStyle = '#5a5a64'; ctx.fillRect(16, -48 + Math.round(w), 3, 8);
      ctx.fillStyle = '#c8a046'; ctx.fillRect(-2, -54, 4, 2);
    },
    drawFx(ctx, e) { try { G.Glow.add(e.x + 8, e.y - 44, 16, '#c9b4ff', .35); } catch (x) { /* ignore */ } }
  });
  def('banner', {
    base: 'yd_founder_guard', region: 'old', frac: .44, replaces: 'masked', hpMul: 1.4, adds: ['yd_mask', 'yd_mask'],
    name: `Banner-bearer of Those Who Remember|Знаменосец Помнящих|Eslovchilar bayroqdori`,
    look: { hue: 250, sat: .3, light: .7, scale: 1.25 },
    setup(e) { later(e, 1, () => { const b = G.Enemies.spawn('yd_banner', e.x - 40, e.y, { noMods: true }); if (b) { b._of = e; e._banner = b; } }); },
    tick(e) { if (e._banner && !e._banner.dead && e.t % 90 === 0) try { G.FX.ring(e._banner.x, e._banner.y - 30, 4, 140, '#c9b4ff', 16); } catch (x) { /* ignore */ } },
    modIn(e, v) { return bannerUp(e) ? 0 : v; },
    onDeath(e) { if (e._banner && !e._banner.dead) e._banner.die({}); }
  });
  function bannerUp(e) { const b = e._banner || (e._ownBanner); return b && !b.dead && Math.abs(b.x - e.x) < 260; }
  // the bearer's people are held by the banner too
  {
    const u0 = G.Enemy.prototype.takeHit;
    G.Enemy.prototype.takeHit = function (hit) {
      const e = this;
      if (!e._mb && e.def.id !== 'yd_banner' && G.world) {
        const bb = G.world.enemies.find(o => !o.dead && o.def.id === 'yd_banner' && Math.abs(o.x - e.x) < 220);
        if (bb) { if (!e._bnT || G.frame - e._bnT > 30) { e._bnT = G.frame; try { G.FX.text(e.x, e.top - 10, t(`the banner holds|знамя держит|bayroq ushlab turibdi`), '#c9b4ff', { size: 6 }); G.Audio.sfx('shield_block', { x: e.x }); } catch (x) { /* ignore */ } } return false; }
      }
      if (e._mb === 'banner' && bannerUp(e)) { if (!e._bnT || G.frame - e._bnT > 30) { e._bnT = G.frame; say(e, `The banner holds! Cut it down!|Знамя держит! Сруби его!|Bayroq ushlab turibdi! Uni kes!`, '#c9b4ff'); try { G.Audio.sfx('shield_block', { x: e.x }); } catch (x) { /* ignore */ } } return false; }
      return u0.apply(this, arguments);
    };
  }

  /* ================================================================ 8. The Bride */
  def('bride', {
    base: 'yd_guest', region: 'wedding', frac: .7, hpMul: 1.5,
    name: `The Drowned Bride|Утопленная невеста|Cho'kkan kelin`,
    look: { hue: 190, sat: .3, light: 1.45, scale: 1.2 },
    setup(e) { e._beat = 0; e._bt = 0; },
    tick(e) {
      const p = pl(); if (!p) return true;
      const BEAT = e.hp < e.maxHp * .5 ? 32 : 40;
      if (++e._bt < BEAT) { e.vx *= .85; return true; }
      e._bt = 0; e._beat = (e._beat + 1) % 8;
      snd('stomp', { x: e.x, vol: .25, pitch: e._beat % 4 === 0 ? .8 : 1.2 });
      const b = e._beat, dir = Math.sign(p.x - e.x) || 1;
      e.facing = dir;
      if (b === 1 || b === 2 || b === 5) { e.vx = dir * 3.2; e.setState('chase'); }
      else if (b === 3) { e.telegraph(BEAT); mark({ x: e.x + dir * 20, y: e.y, w: 110, life: BEAT, color: '#9fe4ff' }); e._spinX = e.x + dir * 20; }
      else if (b === 4) {
        // the spin: a circle of her veil and the water in it
        try { G.FX.ring(e._spinX, e.cy, 4, 55, '#9fe4ff', 16); } catch (x) { /* ignore */ }
        snd('whoosh', { x: e.x });
        if (Math.abs(p.x - e._spinX) < 55 && Math.abs(p.cy - e.cy) < 34) G.Combat.hit(e, p, { dmg: e.dmg * 1.1, kbx: 3.5, kby: -3, dir: Math.sign(p.x - e._spinX) || 1, type: 'melee' });
      } else if (b === 6) { e.telegraph(BEAT); }
      else if (b === 7) {
        // three drops of the river, thrown along the floor
        for (let i = 0; i < 3; i++) later(e, i * 8, () => { if (!e.dead) e.shoot({ x: e.x + dir * 8, y: e.cy, vx: dir * 3.4, vy: -0.2 * i, r: 3, grav: .02, dmg: e.dmg * .6, color: '#9fe4ff', light: { r: 24, color: '#9fe4ff', a: .4 } }); });
      } else if (b === 0) { e.vx = -dir * 2.4; }
      return true;
    }
  });

  /* ================================================================ the bar at the top of the screen */
  SMOOTH_DRAW.push(ctx => {
    if (!G.world || !G.world.enemies || G.Game.state !== 'play') return;
    const p = pl(); if (!p) return;
    const e = G.world.enemies.find(o => o._mb && !o.dead && o.aggro && Math.abs(o.x - p.x) < 360);
    if (!e) return;
    const M = MB.defs[e._mb]; if (!M) return;
    const w = 180, x = G.W / 2 - w / 2, y = 20;
    ctx.save();
    ctx.fillStyle = 'rgba(8,5,12,.75)'; ctx.fillRect(x - 2, y - 2, w + 4, 8);
    ctx.fillStyle = '#3a1018'; ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = e._crumb ? '#8a5434' : '#d8a046'; ctx.fillRect(x, y, Math.max(0, w * e.hp / e.maxHp), 4);
    ctx.font = '600 6px ' + (G.FONT_UI || 'sans-serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.fillText(t(M.name), G.W / 2 + .5, y - 2.5);
    ctx.fillStyle = '#ffe7a6'; ctx.fillText(t(M.name), G.W / 2, y - 3);
    ctx.restore();
  });
}
