/* =====================================================================
   Stage 4 — time in the open city: a 24-minute day (day 14, evening 2,
   night 6, dawn 2), light that follows it, night spawns, NPC schedules,
   shops that open and close, and the HUD: time-of-day icon + one line
   of the current objective (top right).
   The clock runs only while playing in the open world; resting in a
   chaikhana moves it to the morning or to the night. The new moon does
   not tick with the clock (W2.advanceMoon, story milestones only).
   ===================================================================== */
{
  const TS = G.TS, U = G.U;
  const DAY = 840, EVE = 960, NIGHT = 1320, CYCLE = 1440;   // seconds of the cycle
  const clockOf = () => { const s = W2.S(); return s ? s.clock : 0; };
  const sm = x => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
  W2.CYCLE = CYCLE;
  W2.phase = (c) => { c = c == null ? clockOf() : c; return c < DAY ? 'day' : c < EVE ? 'evening' : c < NIGHT ? 'night' : 'dawn'; };
  // 0 by day, 1 at night, smooth through evening and dawn
  W2.nightK = (c) => { c = c == null ? clockOf() : c; if (c < DAY) return 0; if (c < EVE) return sm((c - DAY) / (EVE - DAY)); if (c < NIGHT) return 1; return 1 - sm((c - NIGHT) / (CYCLE - NIGHT)); };
  // golden hour around the evening and the dawn
  W2.duskK = (c) => { c = c == null ? clockOf() : c; const a = Math.max(0, 1 - Math.abs(c - (DAY + 40)) / 140), b = Math.max(0, 1 - Math.abs(c - (NIGHT + 70)) / 120); return sm(Math.max(a, b)); };
  // the clock face: 06:00 at the start of the day, one real minute = one hour
  W2.hour = (c) => { c = c == null ? clockOf() : c; return (6 + c / 60) % 24; };
  W2.clockText = () => { const h = W2.hour(), hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm - mm % 10).padStart(2, '0'); };
  W2.setHour = h => { const s = W2.S(); if (!s) return; s.clock = (((h - 6) % 24 + 24) % 24) * 60; save(); };
  W2.isNight = () => W2.nightK() > 0.5;
  // rest skips: to the next morning (06:00) or the next night (22:00)
  W2.skipTo = which => {
    const s = W2.S(); if (!s) return;
    const target = which === 'night' ? EVE : 0;
    let d = target - s.clock; if (d <= 0) d += CYCLE;
    s.clock = (s.clock + d) % CYCLE;
    if (which !== 'night' || target < s.clock - d) s.day = (s.day || 1) + 1;
    save();
  };
  W2.addTime = sec => { const s = W2.S(); if (!s) return; const n = s.clock + sec; if (n >= CYCLE) s.day = (s.day || 1) + Math.floor(n / CYCLE); s.clock = n % CYCLE; };

  /* ---------------------------------------------------------------- the clock runs */
  let lastRT = null;
  W2.ticks.push(s => {
    const rt = G.run ? G.run.time : 0;
    if (lastRT == null || rt < lastRT) { lastRT = rt; return; }
    const dt = Math.min(0.25, rt - lastRT); lastRT = rt;
    if (dt <= 0 || W2.inside) return;            // inside a chaikhana time waits for the dastarkhan
    const before = W2.phase(s.clock);
    W2.addTime(dt * (W2.timeScale || 1));
    s.stats.regionT[W2.active] = (s.stats.regionT[W2.active] || 0) + dt;
    const now = W2.phase(s.clock);
    if (now !== before) for (const f of W2.hooks.phase || []) { try { f(now, before); } catch (e) { console.error(e); } }
  });
  W2.hooks.phase = [];
  W2.hooks.phase.push(now => {
    if (now === 'evening') toast(t(`Evening. The shops are closing.|Вечер. Лавки закрываются.|Kech. Do'konlar yopilmoqda.`), '#ffcf9a');
    if (now === 'night') toast(t(`Night. The collectors are out on the streets.|Ночь. Сборщики вышли на улицы.|Tun. Yig'uvchilar ko'chaga chiqdi.`), '#9fb0ff');
    if (now === 'dawn') toast(t(`Dawn.|Рассвет.|Tong.`), '#ffe2c0');
    if (now === 'day') toast(t(`Morning. The city wakes.|Утро. Город просыпается.|Tong otdi. Shahar uyg'onmoqda.`), '#ffe7a6');
  });

  /* ---------------------------------------------------------------- light by the hour */
  // The engine multiplies the world by a light map: ambient + baked light base + additive lights.
  // We darken (or warm) the base under the additive lights, so lanterns and windows keep shining at night.
  const mixHex = (a, b, k) => { const A = U.hex2rgb(a), B = U.hex2rgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  W2.mixHex = mixHex;
  W2.tint = () => {
    const b = G.level && G.level.biome;
    if (!W2.on() || W2.inside || !b || !b.w2tod) return null;
    const k = b.w2night ? 0 : W2.nightK(), d = b.w2night ? 0 : W2.duskK();
    if (k < 0.01 && d < 0.01) return null;
    const night = b.w2tod.night || '#4a5698', dusk = b.w2tod.dusk || '#ffb08a';
    return mixHex(mixHex('#ffffff', dusk, d * 0.55), night, k);
  };
  {
    const r0 = G.Light.render;
    G.Light.render = function () {
      const tint = W2.tint();
      if (tint) {
        const b = this.base;
        this.base = ctx => {
          if (b) b(ctx);
          ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = tint; ctx.fillRect(0, 0, G.W / 2, G.H / 2);
          ctx.globalCompositeOperation = 'source-over';
        };
      }
      return r0.apply(this, arguments);
    };
  }
  // the sky and the far city: darkened, stars and a moon come out (biomes call this from fogBehind)
  let stars = null;
  W2.skyNight = (ctx) => {
    const b = G.level && G.level.biome;
    if (!W2.on() || !b || !b.w2tod || b.w2night) return;
    const k = W2.nightK(), d = W2.duskK();
    if (k < 0.01 && d < 0.01) return;
    if (d > 0.01) { ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = d * 0.55; ctx.fillStyle = '#ff7a4a'; ctx.fillRect(0, 0, G.W, G.H); }
    if (k > 0.01) {
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = k;
      if (!stars) {
        stars = G.makeCanvas(G.W, G.H);
        const c = stars.ctx, g = c.createLinearGradient(0, 0, 0, G.H);
        g.addColorStop(0, '#0e1230'); g.addColorStop(.55, '#2a3060'); g.addColorStop(1, '#4a4a78');
        c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
        stars.st = G.makeCanvas(G.W, G.H);
        const r = U.RNG(77), s2 = stars.st.ctx;
        for (let i = 0; i < 260; i++) { s2.globalAlpha = r.range(0.3, 1); s2.fillStyle = r.pick(['#ffffff', '#cfe0ff', '#ffe9c0']); s2.fillRect(r.int(0, G.W - 1), r.int(0, Math.floor(G.H * 0.5)), 1, 1); }
        s2.globalAlpha = 1;
        // a thin moon
        const mx = 396, my = 46;
        s2.fillStyle = '#f4f0dc'; s2.beginPath(); s2.arc(mx, my, 9, 0, 6.3); s2.fill();
        s2.globalCompositeOperation = 'destination-out'; s2.beginPath(); s2.arc(mx + 5, my - 2, 8, 0, 6.3); s2.fill(); s2.globalCompositeOperation = 'source-over';
      }
      ctx.drawImage(stars, 0, 0);
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k * 0.9; ctx.drawImage(stars.st, 0, 0);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  };
  // window glows and street lamps: dynamic decos whose light follows the night
  W2.nightLight = (x, y, o) => {
    o = o || {};
    const d = {
      x, y, r: 30, layer: 'back', light: { r: o.r || 52, color: o.color || '#ffb060', a: 0, flicker: !!o.flicker },
      draw(ctx) { const k = W2.on() ? W2.nightK() : 1; if (k < 0.1 || !o.win) return; ctx.globalAlpha = k; ctx.fillStyle = o.win; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 2, 3, 4); ctx.globalAlpha = 1; },
      fx() { const k = W2.on() ? W2.nightK() : 1; if (k > 0.1 && o.glow) G.Glow.add(x, y, o.glowR || 10, o.glow, 0.4 * k); },
      update(dd) { dd.light.a = (o.a || 0.9) * Math.max(o.day || 0, W2.on() ? W2.nightK() : 1); }
    };
    return d;
  };

  /* ---------------------------------------------------------------- night: more of the Hollow, patrols */
  W2.nightSpawns = (L, plan, killed) => {
    const def = W2.regions[plan.region];
    if (!def || !def.night || W2.nightK() < 0.5) return;
    const nn = def.night, rng = U.RNG((L.seed || 1) * 31 + 7);
    const floor = (L.spots.floor || []).filter(s => !s.plat && s.tx > 14 && s.tx < L.w - 14 && L.get(s.tx, s.ty - 1) === G.T.AIR && L.get(s.tx, s.ty - 2) === G.T.AIR);
    if (!floor.length || !nn.pool) return;
    const n = nn.extra || 6;
    for (let i = 0; i < n; i++) {
      const sp = floor[Math.floor((i + rng.next()) / n * floor.length) % floor.length];
      const id = 'n' + i;
      if (killed.has(id)) continue;
      const pick = rng.weighted(nn.pool.map(([d, w]) => ({ d, w }))).d;
      const e = G.Enemies.spawn(pick, sp.x, sp.y, { elite: !!(nn.elite && i === 0) });
      if (e) { e._w2id = id; e._w2night = true; }
    }
  };

  /* ---------------------------------------------------------------- people and their hours */
  // W2.npc(id, {name, look, prompt, talk(done)}); W2.schedule(id, [{from, to, region, spot}]) hours 0..24 (wraps)
  // W2.where(id) -> the slot for this hour (or a story pin); W2.pin(id, region, spot) keeps someone in place
  W2.npc = (id, def) => { W2.npcs[id] = Object.assign({ id, sched: [] }, W2.npcs[id] || {}, def); return W2.npcs[id]; };
  W2.schedule = (id, list) => { W2.npc(id, {}).sched = list || []; };
  W2.pin = (id, region, spot) => { const s = W2.S(); if (!s) return; s.pins = s.pins || {}; if (region) s.pins[id] = { region, spot }; else delete s.pins[id]; save(); };
  const inHours = (h, a, b) => (a <= b ? h >= a && h < b : h >= a || h < b);
  W2.where = id => {
    const n = W2.npcs[id], s = W2.S();
    if (!n) return null;
    if (s && s.pins && s.pins[id]) return Object.assign({ pinned: true }, s.pins[id]);
    const h = W2.hour();
    return n.sched.find(x => inHours(h, x.from, x.to)) || null;
  };
  // shops: W2.shop(id, {open:[from,to]}) and W2.shopOpen(id); stalls in a region read it
  W2.shops = {};
  W2.shop = (id, def) => { W2.shops[id] = Object.assign({ id, open: [7, 20] }, def); };
  W2.shopOpen = id => { const sh = W2.shops[id]; return !!sh && inHours(W2.hour(), sh.open[0], sh.open[1]); };

  // spots: named places in a region (L.w2.spots), filled by 'spot' objects, exits and chaikhanas
  const people = new Map();   // npc id -> Interactable
  function spotPos(name) {
    const L = G.level, w2 = L && L.w2;
    if (!w2) return null;
    if (W2.inside) { // inside a chaikhana: people sit on the left half of the room
      if (name !== 'chai:' + W2.inside + ':in') return null;
      const k = people.size;
      return { x: (6 + k * 3) * TS, y: L.fy * TS };
    }
    return (w2.spots && w2.spots[name]) || w2.entries[name] || null;
  }
  function syncPeople() {
    if (!G.world) return;
    for (const id in W2.npcs) {
      const n = W2.npcs[id], w = W2.where(id);
      const here = w && w.region === W2.active && (W2.inside ? w.spot === 'chai:' + W2.inside + ':in' : !/:in$/.test(w.spot));
      let o = people.get(id);
      if (o && (o.dead || !G.world.ents.includes(o))) { people.delete(id); o = null; }
      if (here && !o) {
        const p = spotPos(w.spot);
        if (!p) continue;
        o = new G.Interactable(p.x + (n.dx || 0), p.y, { art: 'person', w: 14, h: 30, look: n.look, phase: id.length * 31, face: n.face || -1, prompt: n.prompt ? t(n.prompt) : tf(`Talk to {n}|Говорить: {n}|Gaplashish: {n}`, { n: t(n.name || '') }) });
        o.interact = !!n.talk; o.layer = -1; o._w2npc = id;
        if (n.talk) o.onUse = () => { if (!busy) scene(done => n.talk(done, o)); return true; };
        G.world.add(o); people.set(id, o);
      } else if (!here && o) { o.dead = true; people.delete(id); }
    }
  }
  W2.syncPeople = syncPeople;
  W2.hooks.enter.push(() => { people.clear(); syncPeople(); });
  let pt = 0;
  W2.ticks.push(() => { if (++pt % 120 === 0) syncPeople(); });

  /* ---------------------------------------------------------------- HUD: the hour and the objective */
  // a small medallion: sun / setting sun / moon / rising sun, with the hour; one line of the objective under it
  function todIcon(ctx, x, y, ph, k) {
    const R = 6;
    ctx.fillStyle = '#120c14'; ctx.fillRect(x - R - 2, y - R - 2, 2 * R + 4, 2 * R + 4);
    ctx.fillStyle = '#e2b452'; ctx.fillRect(x - R - 1, y - R - 2, 2 * R + 2, 1); ctx.fillRect(x - R - 1, y + R + 1, 2 * R + 2, 1);
    ctx.fillRect(x - R - 2, y - R - 1, 1, 2 * R + 2); ctx.fillRect(x + R + 1, y - R - 1, 1, 2 * R + 2);
    const sky = ph === 'day' ? '#5a8ad0' : ph === 'evening' ? '#c8603a' : ph === 'night' ? '#141838' : '#a86a7a';
    ctx.fillStyle = sky; ctx.fillRect(x - R, y - R, 2 * R, 2 * R);
    ctx.fillStyle = ph === 'night' ? '#0c1028' : '#2a1a14'; ctx.fillRect(x - R, y + 2, 2 * R, R - 2); // the roofs
    ctx.fillStyle = '#1a1210'; ctx.fillRect(x - R + 2, y + 1, 3, 1); ctx.fillRect(x + 1, y, 4, 2);
    if (ph === 'night') {
      ctx.fillStyle = '#f4f0dc'; ctx.fillRect(x - 1, y - 4, 4, 4); ctx.fillStyle = sky; ctx.fillRect(x + 1, y - 5, 3, 3);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 4, y - 4, 1, 1); ctx.fillRect(x + 4, y - 2, 1, 1);
      ctx.fillStyle = '#ffcf6a'; ctx.fillRect(x - 3, y + 3, 1, 1); ctx.fillRect(x + 3, y + 3, 1, 1);
    } else {
      const sy = ph === 'day' ? y - 3 : y + 1 - Math.round(2 * (1 - k));
      ctx.fillStyle = ph === 'day' ? '#fff0a8' : '#ffb060';
      ctx.fillRect(x - 2, sy - 2, 4, 4); ctx.fillRect(x - 1, sy - 3, 2, 6); ctx.fillRect(x - 3, sy - 1, 6, 2);
      ctx.fillStyle = ph === 'night' ? '#0c1028' : '#2a1a14'; ctx.fillRect(x - R, y + 2, 2 * R, R - 2);
      ctx.fillStyle = '#1a1210'; ctx.fillRect(x - R + 2, y + 1, 3, 1); ctx.fillRect(x + 1, y, 4, 2);
    }
  }
  const hudOK = st => st === 'play' && W2.on() && G.world && G.world.player && !(G.UI.isOpen && G.UI.isOpen()) && !W2.mapOpen;
  // under the engine's minimap and the place name (top right): the hour, then the objective
  const HUD_Y = 92;
  PIXEL_DRAW.push((ctx, st) => {
    if (!hudOK(st)) return;
    todIcon(ctx, G.W - 13, HUD_Y, W2.phase(), W2.nightK());
  });
  SMOOTH_DRAW.push((ctx, st) => {
    if (!hudOK(st)) return;
    const s = W2.S();
    ctx.save();
    FX.tt(ctx, W2.clockText(), G.W - 24, HUD_Y - 4, 60, { size: 6, align: 'right', color: '#f2e6c8' });
    if (s && s.obj) FX.tt(ctx, '◆ ' + t(s.obj), G.W - 6, HUD_Y + 10, 170, { size: 5.5, align: 'right', color: '#ffe7a6' });
    ctx.restore();
  });
}
