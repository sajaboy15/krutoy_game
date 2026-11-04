/* =====================================================================
   Stage 4 — the first four regions of the open city (GDD ch.3):
     1 The Tail (hub)        — surface; west: Potters, east: Bazaar, down: the karez
                               through Mehri's well (her yard is barred from inside:
                               the first shortcut), the Rabat road (closed for now)
     2 The Potters' Quarter  — surface; kilns, clay lanes, the wax workshop;
                               a kiln hatch only Sado's light shows leads down
     3 The Memory Bazaar     — surface; the auction hall over the great drain,
                               stalls by day, the secret market by night, the
                               Singers' stair on a tower (hook), the Ark gate
     4 The Upper Karez       — underground room labyrinth joining the three from
                               below; a grate that opens only from the Bazaar side
   Their looks: day and night biomes for the Tail and the Bazaar (painted night
   from 61_art_city.js), a new painted biome for the Potters' Quarter, the karez
   from 60_world.js. The clock (81) darkens the day looks as the evening comes.
   ===================================================================== */
(function worldRegions() {
  const K = G.BiomeKit, ART = G.ART_CITY, EK = G.EK, U = G.U, TS = G.TS, T = G.T;
  if (!K || !ART || !EK) { console.error('[world2] libraries missing'); return; }
  const RD = Math.round, FL = Math.floor, PI = Math.PI;
  const { Px, P32, mix, shade, paintSky, ridge, house, dome, tree, cloud, layer, skyDraw, hazeDraw, grade, vignette, all, fgStrip, emit, prop, addStatic, jarCv, lamp, cloth, runs, interiors, place, memo, rngOf, hash, dth } = ART;
  const DEFS = G.Biomes.defs;

  /* ================================================================ enemy pools */
  const POOLS = {
    w_tail_day: [['yd_scavenger', 7], ['rat_div', 7], ['yd_hollow', 5], ['assassin', 2]],
    w_tail_night: [['yd_hollow', 12], ['torch_zealot', 6], ['zindan_prisoner', 4], ['rat_div', 4], ['jailer', 2]],
    w_potters: [['yd_hollow', 8], ['rat_div', 6], ['yd_scavenger', 5], ['torch_zealot', 3], ['yd_ember', 3]],
    w_bazaar_day: [['assassin', 8], ['guard', 6], ['snake_charmer', 5], ['snake', 3], ['yd_scavenger', 3]],
    w_bazaar_night: [['assassin', 9], ['jinn', 6], ['yd_hollow', 6], ['guard', 4], ['snake', 3]]
  };
  for (const pool in POOLS) for (const [id, w] of POOLS[pool]) { try { if (G.Enemies.defs[id]) EK.addToBiome(id, pool, w); } catch (e) { console.error('[world2] pool', id, e); } }

  // the clock's darkening for day looks; the night looks are already night
  const TOD = { night: '#46528e', dusk: '#ffa070' };
  const tod = d => { d.w2tod = TOD; return d; };
  const withSky = f => function (ctx, cam, t, L) { if (f) f.call(this, ctx, cam, t, L); W2.skyNight(ctx); };

  /* ================================================================ street lamps and lit windows for the night */
  function nightLamps(L, rng, every) {
    let last = -99;
    for (const r of runs(L, 5, 4)) {
      if (L.structOf && L.structOf(r.x0 + 2, r.ty)) continue;
      for (let x = r.x0 + 2; x <= r.x1 - 2; x += every) {
        if (x - last < every * 0.7 || !rng.chance(0.75)) continue;
        last = x;
        const px = x * TS + 7, y = r.y;
        L.decos.push({ static: true, layer: 'back', bx: px - 3, by: y - 34, bw: 9, bh: 34, draw(ctx) { ctx.fillStyle = '#20160f'; ctx.fillRect(px, y - 32, 2, 32); ctx.fillRect(px - 3, y - 2, 8, 2); ctx.fillStyle = '#3a2a1a'; ctx.fillRect(px - 3, y - 34, 8, 2); ctx.fillStyle = '#6a5030'; ctx.fillRect(px - 2, y - 32, 6, 6); } });
        L.decos.push(W2.nightLight(px + 1, y - 29, { r: 84, color: '#ffb060', a: 0.95, win: '#ffe0a0', glow: '#ffb24a', glowR: 16, flicker: true }));
      }
    }
    // windows of the street houses
    for (const s of L.structures || []) {
      if (s.kind !== 'building' || s.roofY == null || s.floorY == null) continue;
      for (let x = s.x0 + 2; x < s.x1 - 1; x += 4) if (rng.chance(0.5)) L.decos.push(W2.nightLight(x * TS + 8, (s.roofY + 2) * TS, { r: 40, color: '#ffa850', a: 0.7 }));
    }
  }

  /* ================================================================ 1. THE TAIL by day (the night look is 61's Night of Payment) */
  {
    K.variant('yd_tail_night', 'w_tail_day', {
      name: N(`The Tail|Хвост|Dum`), subtitle: N(`Home of the poor on the Sleeper's tail|Дом бедняков на хвосте Спящего|Uxlovchi dumidagi kambag'allar uyi`),
      def: { music: 'yd_roofs', enemyBiome: 'w_tail_day', wind: 0.4 },
      gen: { width: 400, enemies: [1, 2], segments: { building: 5, terrace: 3, plain: 3, hills: 2, bridge: 2, colonnade: 1, tower: 1.5, chasm: 1, cliff: 1, islands: 0.5, arena: 1.5 } }
    });
    const SKY = [[0, '#3e70b0'], [.35, '#6c9ac8'], [.62, '#a8c0d4'], [.82, '#e4d4b8'], [1, '#f4dcb0']];
    const far = { wall: '#a89480', lit: '#c8b49a', dark: '#8a7866', roof: '#9a8672', rim: '#e8dcc4', win: '#6a5a4c', winCore: '#7a6a5a', winDark: '#5e5044' };
    const mid = { wall: '#b08a64', lit: '#d0aa7c', dark: '#7a5c40', roof: '#9a7652', rim: '#f0d8a8', win: '#3a2a1e', winCore: '#4a3626', winDark: '#2e2218', door: '#2a1c12' };
    const near = { wall: '#7a5638', lit: '#a07448', dark: '#4a3220', roof: '#6a4a30', rim: '#e8c890', win: '#2a1a10', winCore: '#3a2414', winDark: '#20140c' };
    function band(seed, o) {
      const r = rngOf(seed), w = o.w, h = o.h, px = new Px(w, h, true);
      let x = 0;
      while (x < w) {
        const hw = r.int(o.hw[0], o.hw[1]), hh = r.int(o.hh[0], o.hh[1]);
        const slope = RD(o.slope * (Math.sin(x / w * PI * 2 * (o.waves || 2) + seed) * 0.5 + 0.5));
        const by = h - slope - r.int(0, o.jit || 0);
        const top = house(px, x, by, hw, hh, o.pal, r, { lx: -1, wp: o.wp, lit: 0, ww: o.ww, wh: o.wh, wsx: o.wsx, wsy: o.wsy, door: o.door, courses: true });
        for (let yy = by; yy < h; yy++) for (let xx = x; xx < x + hw; xx++) if (!px.has(xx, yy)) px.set(xx, yy, P32(o.pal.dark));
        if (o.laundry && r.chance(o.laundry)) { // a line of washing to the next roof
          const x2 = x + hw + r.int(6, 14), y0 = top - 4, cols = ['#a8323a', '#2a5a9a', '#e8dcc0', '#c89a3a', '#4a8a5a'];
          ART.rope(px, x + hw - 1, y0, x2, y0 + r.int(-3, 3), r.int(2, 4), P32(o.pal.dark), pt => { for (let u = 0.15; u < 0.9; u += r.range(0.14, 0.26)) { const [qx, qy] = pt(u), cw = r.int(2, 4), ch = r.int(3, 6), cc = r.pick(cols); px.rect(RD(qx), RD(qy) + 1, cw, ch, P32(o.clothDark ? mix(cc, o.pal.dark, o.clothDark) : cc)); } });
        }
        if (o.trees && r.chance(o.trees)) tree(px, x + r.int(0, hw), h - 2, r.int(36, 56), r.pick(['poplar', 'chinar']), o.tpal, seed + x);
        x += hw + (r.chance(0.2) ? r.int(1, 4) : 0);
      }
      return px;
    }
    place('w_tail_day', {
      ambient: '#fff2e0', shade: '#a08470', deepShade: '#2a1c14', bloom: 0.55, wind: 0.4,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 51, sun: { x: 120, y: 64, r: 11, core: '#fffcf0', rim: '#fff0c0', halo: '#ffe8b0', haloA: 0.45 }, glow: [{ x: 240, y: 270, rx: 340, ry: 110, col: '#ffe0b0', a: 0.4 }] })),
      layers(L, R, seed) {
        return memo('w_tail_day' + seed, () => {
          const out = [];
          const cl = new Px(1400, 100, true);
          for (let i = 0; i < 6; i++) cloud(cl, 120 + i * 230, 36 + (i % 3) * 14, 150 + (i * 37) % 80, 14 + (i % 2) * 8, { lo: '#b8c4d4', mid: '#dce4ec', hi: '#ffffff' }, seed + i);
          out.push(layer(cl.canvas(), { fx: 0.02, fy: 0.02, base: 120, drift: 1.8 }));
          const sl = new Px(1600, 110, true);
          ridge(sl, { seed: seed + 2, base: 108, amp: 46, per: 3, oct: 4, col: '#8a96b0', grad: '#9aa4b8', gradH: 60, rim: '#dce4f0', shape: (u, v) => 0.2 + v * 0.45 + 0.45 * Math.pow(Math.max(0, Math.sin(u * PI * 2 + 0.6)), 3) });
          const dp = { lo: '#2a6a9a', mid: '#3a8ab8', hi: '#6ab4d8', rim: '#c8ecf8', drum: '#a89a88', drumD: '#887a6a', gold: '#e8c070', win: '#4a3a2a' };
          for (let i = 0; i < 4; i++) { const cx = 180 + i * 400 + (seed % 60); let y = 0; while (y < 110 && !sl.has(cx, y)) y++; dome(sl, cx, y - 2, 6, dp, { kind: i % 2 ? 'onion' : 'melon', drum: 3, ribs: 8 }); }
          out.push(layer(sl.canvas(), { fx: 0.05, fy: 0.04, base: R.horizon - 20 }));
          out.push(layer(band(seed + 3, { w: 1300, h: 120, pal: far, hw: [8, 18], hh: [10, 30], slope: 36, waves: 3, jit: 6, wp: 0.45, ww: 1, wh: 2, wsx: 4, wsy: 5, laundry: 0.1 }).canvas(), { fx: 0.14, fy: 0.1, base: R.horizon + 4, fill: far.dark }));
          out.push(layer(band(seed + 4, { w: 1100, h: 130, pal: mid, hw: [12, 26], hh: [18, 42], slope: 30, waves: 2, jit: 8, wp: 0.5, ww: 2, wh: 3, wsx: 6, wsy: 8, door: true, laundry: 0.35, trees: 0.25, tpal: { lo: '#3a5a2a', mid: '#4e7a36', hi: '#6a9a46', deep: '#2a4020', trunk: '#6a5038', trunkHi: '#8a7058', bark: '#a89070' } }).canvas(), { fx: 0.3, fy: 0.22, base: R.horizon + 18, fill: mid.dark }));
          out.push(layer(band(seed + 5, { w: 900, h: 130, pal: near, hw: [20, 40], hh: [34, 62], slope: 16, waves: 1, jit: 6, wp: 0.45, ww: 3, wh: 4, wsx: 8, wsy: 10, laundry: 0.5, clothDark: 0.35 }).canvas(), { fx: 0.5, fy: 0.38, base: R.horizon + 40, fill: near.dark }));
          return out;
        });
      },
      fogBehind: withSky(hazeDraw([[0, '#e8e0d0', 0], [0.6, '#e8dcc8', 0.06], [0.8, '#f0e0c0', 0.22], [1, '#7a6050', 0.3]])),
      drawForeground: null,
      post: all(ART.shafts([{ x: 120, w: 50, slope: 0.45, col: '#fff0c8', a: 0.22 }, { x: 420, w: 30, slope: 0.45, col: '#fff0c8', a: 0.16 }]), grade('#ffd8a0', 0.12), vignette('rgba(30,18,10,1)', 0.35)),
      ambientFx: all(
        emit({ rate: 0.06, cols: ['#fff8e0', '#e8dcc0'], vx: [0.05, 0.3], vy: [-0.05, 0.08], from: 'any', life: 400, alpha: 0.5, max: 40 }),
        function (world, cam) { if (Math.random() < 0.004) G.FX.spawn({ x: cam.x - 4, y: cam.y + U.rand(20, 80), vx: U.rand(1, 1.8), vy: U.rand(-0.1, 0.1), life: 500, size: 1, color: '#2a2024', drag: 1, shape: 'sq' }); }
      ),
      filterDecos: d => !(d.static && d.layer !== 'front' && d.bh >= 56 && d.bh <= 86 && d.bw <= 100),
      decorate(L, r) { ART.tailProps(L, r, 'day'); nightLamps(L, U.RNG(L.seed + 3), 12); }
    });
    tod(DEFS.w_tail_day);
    const nt = K.variant('yd_tail_night', 'w_tail_night', {
      name: N(`The Tail|Хвост|Dum`), subtitle: N(`Lanterns over the roofs of the poor|Фонари над крышами бедноты|Kambag'allar tomlari ustida chiroqlar`),
      def: { music: 'yd_roofs', enemyBiome: 'w_tail_night', w2night: true },
      gen: { width: 400, enemies: [1, 2], segments: { building: 5, terrace: 3, plain: 3, hills: 2, bridge: 2, colonnade: 1, tower: 1.5, chasm: 1, cliff: 1, islands: 0.5, arena: 1.5 } }
    });
    nt.w2tod = TOD;
  }

  /* ================================================================ 2. THE POTTERS' QUARTER — a new painted biome
     kilns like clay bottles breathing smoke, lanes of drying pots, the wax workshop with tumars on cords */
  {
    K.variant('bukhara', 'w_potters', {
      name: N(`The Potters' Quarter|Квартал гончаров|Kulollar mahallasi`), subtitle: N(`Kilns, clay lanes, the wax for the tumars|Печи, глиняные улицы, воск для тумаров|Xumdonlar, loy ko'chalar, tumarlar uchun mum`),
      def: { music: 'yd_roofs', enemyBiome: 'w_potters', wind: 0.5, dust: ['#a86a44', '#c8875a', '#8a5434'], rock: ['#9a5a3a', '#7a4428', '#c07a50'] },
      gradeTiles: [{ map: [[0, '#1a0c06'], [0.35, '#5a2e18'], [0.7, '#b0683e'], [1, '#f4c890']], k: 0.55 }, { sat: 1.05 }],
      gen: { width: 300, enemies: [1, 2], segments: { building: 5, terrace: 4, plain: 3, hills: 3, cliff: 2, tower: 2, bridge: 1, colonnade: 1, chasm: 1, islands: 0.5, arena: 1.5 } }
    });
    const SKY = [[0, '#4a6a9a'], [0.3, '#8a9cb0'], [0.55, '#c8b8a0'], [0.78, '#e8c498'], [1, '#f4d0a0']];
    const clay = { wall: '#b0704a', lit: '#d8946a', dark: '#7a4628', roof: '#8a5232', rim: '#ffd0a0', win: '#3a1e10', winCore: '#4a2614', winDark: '#2a160a', door: '#24120a' };
    const clayFar = { wall: '#b08a7a', lit: '#c8a090', dark: '#94746a', roof: '#a07e70', rim: '#f0d8c8', win: '#7a5a50', winCore: '#86665a', winDark: '#6a4e46' };
    const clayNear = { wall: '#6a3a22', lit: '#8a5030', dark: '#3a1e10', roof: '#5a3018', rim: '#e8a070', win: '#1a0c06', winCore: '#2a140a', winDark: '#140804' };
    // a bottle kiln: wide belly, a neck, a chimney; the mouth glows
    function kiln(px, cx, by, s, pal, lit) {
      const h = RD(s * 1.6);
      for (let y = 0; y < h; y++) {
        const t = y / h; // 0 bottom .. 1 top
        const hw = t < 0.55 ? s * (0.5 + 0.18 * Math.sin(t / 0.55 * PI)) : t < 0.75 ? s * (0.5 - (t - 0.55) / 0.2 * 0.32) : s * 0.16;
        for (let x = RD(cx - hw); x <= cx + hw; x++) {
          const n = (x - cx) / (hw + 0.5);
          let c = n < -0.45 ? pal.lit : n > 0.45 ? pal.dark : pal.wall;
          if ((by - y) % 5 === 0 && hash(x >> 1, y, 4) < 0.5) c = mix(c, pal.dark, 0.3);
          px.set(x, by - y, P32(c));
        }
      }
      for (let x = RD(cx - s * 0.18); x <= cx + s * 0.18; x++) px.set(x, by - h, P32(pal.rim));
      // the mouth
      const mw = Math.max(2, RD(s * 0.22)), mh = Math.max(3, RD(s * 0.3));
      for (let y = 0; y < mh; y++) for (let x = -mw; x <= mw; x++) if (x * x / (mw * mw) + (y - mh) * (y - mh) / (mh * mh) <= 1) px.set(cx + x, by - y, P32(lit ? (y < mh * 0.5 ? '#ffd070' : '#ff8a3a') : '#1a0c06'));
      return h;
    }
    function smoke(o) { // puffs rising from kiln chimneys (procedural, no particles)
      const r = rngOf(o.seed), cols = [];
      for (let i = 0; i < o.n; i++) cols.push({ x: r.range(0, o.w), sp: r.range(0.03, 0.05), ph: r(), h: r.range(o.h[0], o.h[1]) });
      const spr = (() => { const cv = G.makeCanvas(32, 32), g = cv.ctx.createRadialGradient(16, 16, 0, 16, 16, 16), q = U.hex2rgb(o.col); g.addColorStop(0, `rgba(${q[0]},${q[1]},${q[2]},1)`); g.addColorStop(0.6, `rgba(${q[0]},${q[1]},${q[2]},.5)`); g.addColorStop(1, `rgba(${q[0]},${q[1]},${q[2]},0)`); cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, 32, 32); return cv; })();
      return {
        draw(ctx, cam, t) {
          const R = ART.refOf(G.level), base = R.horizon + (o.dy || 0) - (cam.y - R.ref) * (o.fy || 0.1), off = -cam.x * o.fx;
          for (const c of cols) {
            let x0 = ((c.x + off) % o.w + o.w) % o.w; if (x0 > G.W + 80) x0 -= o.w; if (x0 < -80) continue;
            for (let k = 0; k < 8; k++) {
              const p = ((t * c.sp + c.ph + k / 8) % 1), y = base - p * c.h, s = 5 + p * 30, x = x0 + Math.sin(p * 5 + c.ph * 9) * 4 + p * p * c.h * 0.4;
              ctx.globalAlpha = o.a * Math.min(1, p * 6) * (1 - p);
              ctx.drawImage(spr, RD(x - s / 2), RD(y - s / 2), RD(s), RD(s));
            }
          }
          ctx.globalAlpha = 1;
        }
      };
    }
    place('w_potters', {
      ambient: '#fff0e0', shade: '#a07060', deepShade: '#2a140c', bloom: 0.6, wind: 0.5,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 61, sun: { x: 360, y: 88, r: 12, core: '#fffaf0', rim: '#ffe8c0', halo: '#ffc890', haloA: 0.5 }, glow: [{ x: 360, y: 200, rx: 320, ry: 120, col: '#ffd0a0', a: 0.45 }] })),
      layers(L, R, seed) {
        return memo('w_potters' + seed, () => {
          const out = [];
          const cl = new Px(1400, 90, true);
          for (let i = 0; i < 5; i++) cloud(cl, 140 + i * 280, 40 + (i % 3) * 12, 170, 12 + (i % 2) * 6, { lo: '#c8a898', mid: '#e0c8b8', hi: '#fff0e0' }, seed + i);
          out.push(layer(cl.canvas(), { fx: 0.02, fy: 0.02, base: 110, drift: 1.2 }));
          const sl = new Px(1600, 100, true);
          ridge(sl, { seed: seed + 2, base: 98, amp: 40, per: 3, oct: 4, col: '#a08a90', grad: '#a89098', gradH: 60, rim: '#f0dcd0', shape: (u, v) => 0.25 + v * 0.45 + 0.35 * Math.pow(Math.max(0, Math.sin(u * PI * 2 + 2.1)), 3) });
          out.push(layer(sl.canvas(), { fx: 0.05, fy: 0.04, base: R.horizon - 24 }));
          out.push(smoke({ seed: seed + 9, n: 7, w: 1100, fx: 0.12, fy: 0.08, h: [110, 170], col: '#6a5650', a: 0.5, dy: -14 }));
          // far: houses and bottle kilns
          const f = new Px(1300, 130, true), rf = rngOf(seed + 3);
          let x = 0;
          while (x < 1300) { const hw = rf.int(10, 22), hh = rf.int(10, 28); house(f, x, 130 - rf.int(0, 10), hw, hh, clayFar, rf, { wp: 0.4, lit: 0, ww: 1, wh: 2, wsx: 4, wsy: 5 }); x += hw + rf.int(0, 3); }
          for (let i = 0; i < 9; i++) kiln(f, 60 + i * 145 + rf.int(-20, 20), 124 - rf.int(0, 8), rf.int(10, 16), clayFar, false);
          for (let xx = 0; xx < 1300; xx++) for (let yy = 120; yy < 130; yy++) if (!f.has(xx, yy)) f.set(xx, yy, P32(clayFar.dark));
          out.push(layer(f.canvas(), { fx: 0.14, fy: 0.1, base: R.horizon + 6, fill: clayFar.dark }));
          // mid: workshops with pots drying on the roofs, kilns breathing
          const m = new Px(1100, 150, true), rm = rngOf(seed + 4);
          x = 0;
          while (x < 1100) {
            const hw = rm.int(14, 28), hh = rm.int(18, 40), by = 150 - rm.int(0, 12);
            const top = house(m, x, by, hw, hh, clay, rm, { wp: 0.5, lit: 0, ww: 2, wh: 3, wsx: 6, wsy: 8, door: true, courses: true });
            for (let yy = by; yy < 150; yy++) for (let xx = x; xx < x + hw; xx++) if (!m.has(xx, yy)) m.set(xx, yy, P32(clay.dark));
            for (let k = x + 2; k < x + hw - 2; k += rm.int(3, 5)) if (rm.chance(0.55)) { const s = rm.int(2, 3); for (let yy = 0; yy < s + 1; yy++) for (let xx = -s + 1; xx < s; xx++) if (Math.abs(xx) <= s - (yy === 0 ? 1 : 0)) m.set(k + xx, top - 1 - yy, P32(yy === s ? clay.rim : clay.wall)); }
            x += hw + rm.int(0, 4);
          }
          for (let i = 0; i < 6; i++) kiln(m, 90 + i * 180 + rm.int(-20, 20), 146, rm.int(16, 22), clay, rm.chance(0.6));
          out.push(layer(m.canvas(), { fx: 0.3, fy: 0.22, base: R.horizon + 22, fill: clay.dark }));
          // near: dark kiln shoulders and stacked pots
          const n = new Px(900, 120, true), rn = rngOf(seed + 5);
          for (let i = 0; i < 4; i++) kiln(n, 110 + i * 225 + rn.int(-30, 30), 119, rn.int(26, 34), clayNear, rn.chance(0.7));
          for (let i = 0; i < 20; i++) { const cx = rn.int(0, 900), s = rn.int(6, 10); for (let y = 0; y < s * 1.3; y++) { const hw = s * 0.45 * Math.sin(Math.min(1, y / (s * 1.3) * 1.1 + 0.1) * PI); for (let xx = RD(cx - hw); xx <= cx + hw; xx++) n.set(xx, 119 - y, P32(xx === RD(cx - hw) ? clayNear.lit : clayNear.dark)); } }
          out.push(layer(n.canvas(), { fx: 0.5, fy: 0.38, base: R.horizon + 44, fill: clayNear.dark }));
          return out;
        });
      },
      fogBehind: withSky(hazeDraw([[0, '#f0d8c0', 0], [0.55, '#e8c8a8', 0.08], [0.8, '#d8a880', 0.24], [1, '#6a3a24', 0.32]])),
      drawForeground: (() => {
        let strip = null;
        return function (ctx, cam, t) {
          if (!strip) {
            const px = new Px(1600, 36, true), r = rngOf(71);
            for (let i = 0; i < 16; i++) { const cx = i * 100 + r.int(0, 60); for (let k = 0; k < r.int(1, 3); k++) { const s = r.int(10, 18), x = cx + k * 13; for (let y = 0; y < s; y++) { const hw = s * 0.42 * Math.sin(Math.min(1, y / s * 1.15 + 0.12) * PI); for (let xx = RD(x - hw); xx <= x + hw; xx++) px.set(xx, 36 - s + y, P32(xx === RD(x - hw) ? '#5a2a14' : '#140804')); } } }
            strip = fgStrip(px.canvas(), { fx: 1.6, drop: 8 });
          }
          strip(ctx, cam, t);
        };
      })(),
      post: all(ART.shafts([{ x: 300, w: 60, slope: -0.4, col: '#ffe0b0', a: 0.24 }, { x: 520, w: 34, slope: -0.4, col: '#ffd8a0', a: 0.18 }]), grade('#ff9a50', 0.12), vignette('rgba(30,12,4,1)', 0.4)),
      ambientFx: all(
        emit({ rate: 0.12, cols: ['#ff9a4a', '#ffc070', '#ff6a2a'], vx: [-0.1, 0.3], vy: [-0.6, -0.25], from: 'bottom', life: 240, glow: true, glowR: 4, alpha: 1, wander: 0.02, flicker: true, max: 36 }),
        emit({ rate: 0.08, cols: ['#c8a890', '#a88878', '#e0c8b0'], vx: [0.1, 0.35], vy: [-0.08, 0.06], from: 'any', life: 420, alpha: 0.4, max: 50 })
      ),
      filterDecos: d => !(d.static && d.layer !== 'front' && d.bh >= 56 && d.bh <= 86 && d.bw <= 100),
      decorate(L, r) { pottersProps(L, r); nightLamps(L, U.RNG(L.seed + 3), 14); }
    });
    tod(DEFS.w_potters);
    // the street: kilns with fire in the mouth, stacks of pots, drying racks, clay heaps; candles and tumars in the workshops
    const kilnCv = (v) => prop('w2kiln' + v, 44, 50, px => {
      const pal = { wall: '#9a5a36', lit: '#c07a4c', dark: '#5a3018', rim: '#e8a070' };
      kiln(px, 22, 49, 16 + (v % 3) * 2, pal, false);
      for (let y = 44; y < 50; y++) for (let x = 2; x < 42; x++) if (!px.has(x, y) && Math.abs(x - 22) < 20) px.set(x, y, P32(y === 44 ? '#b07048' : '#6a3a20'));
    });
    const rackCv = (v) => prop('w2rack' + v, 36, 26, px => {
      const r = rngOf(v + 9);
      for (const yy of [10, 22]) { px.rect(1, yy, 34, 2, P32('#5a3a20')); px.rect(1, yy, 34, 1, P32('#8a6038')); }
      px.rect(1, 6, 2, 20, P32('#3a2414')); px.rect(33, 6, 2, 20, P32('#3a2414'));
      for (const yy of [10, 22]) for (let x = 4; x < 32; x += r.int(5, 7)) { const s = r.int(2, 3), c = r.pick(['#b0683e', '#c87a4a', '#8a4a2a', '#d8a070']); for (let a = 0; a <= s + 1; a++) for (let b = -s + 1; b < s; b++) if (Math.abs(b) <= s - (a === 0 || a === s + 1 ? 1 : 0)) px.set(x + b, yy - 1 - a, P32(a === s + 1 ? shade(c, 0.3) : c)); }
    });
    const heapCv = (v) => prop('w2heap' + v, 28, 10, px => { const r = rngOf(v + 31); for (let x = 0; x < 28; x++) { const h = RD(9 * Math.sin((x + 0.5) / 28 * PI) * (0.8 + 0.2 * r())); for (let y = 0; y < h; y++) px.set(x, 9 - y, P32(y === h - 1 ? '#c88a5a' : hash(x, y, v) < 0.2 ? '#7a4a2a' : '#9a6038')); } });
    function pottersProps(L, r) {
      const busy = ART.busyXs(L) || [];
      const pots = { lo: '#6a3018', mid: '#a0582e', hi: '#d08a52', rim: '#f0b07a', dark: '#2a140a' };
      let lastKiln = -999;
      for (const run of runs(L, 5, 5)) {
        const indoor = L.structOf && L.structOf(run.x0, run.ty);
        for (let tx = run.x0 + 1; tx <= run.x1 - 1; tx++) {
          const x = tx * TS + 8;
          if (!ART.free(busy, x, 30)) continue;
          const roll = r();
          if (!indoor && roll < 0.06 && x - lastKiln > 300 && run.x1 - tx > 4) {
            const v = r.int(0, 2), cv = kilnCv(v); addStatic(L, cv, x - 22, run.y - 49, 'back'); lastKiln = x;
            const mx = x, my = run.y - 4;
            L.decos.push({ x: mx, y: my, r: 40, layer: 'back', light: { r: 76, color: '#ff8a3a', a: 0.95, flicker: true },
              draw(ctx, t) { const k = 0.7 + 0.3 * U.noise1(t * 6 + mx, 3); ctx.fillStyle = '#ffb050'; ctx.globalAlpha = k; ctx.fillRect(RD(mx) - 3, my - 5, 7, 5); ctx.fillStyle = '#fff0a0'; ctx.fillRect(RD(mx) - 1, my - 3, 3, 3); ctx.globalAlpha = 1; },
              fx(ctx, t) { G.Glow.add(mx, my - 3, 14, '#ff8a3a', 0.6 + 0.2 * U.noise1(t * 6 + mx, 3)); },
              update(d) { if (Math.random() < 0.06 && G.onScreen(mx, my, 40)) G.FX.spawn({ x: mx + U.rand(-3, 3), y: my - 50 - U.rand(0, 4), vx: U.rand(0.05, 0.3), vy: -U.rand(0.25, 0.5), life: 200, size: 2, size1: 9, shape: 'circle', color: U.choose(['#4a3a36', '#5a4a44', '#3a2e2a']), alpha: 0.35, drag: 0.995 }); if (Math.random() < 0.05 && G.onScreen(mx, my, 40)) G.FX.spawn({ x: mx + U.rand(-2, 2), y: my - 4, vx: U.rand(-0.3, 0.3), vy: -U.rand(0.5, 1.1), life: 50, size: 1, color: U.choose(['#ffd070', '#ff8a3a']), glow: true, glowR: 3 }); } });
            tx += 4;
          } else if (roll < 0.14) {
            let ox = 0; for (let k = 0, n = r.int(1, 4); k < n; k++) { const cv = jarCv(r.int(0, 3), pots); addStatic(L, cv, x + ox, run.y - cv.height + 1, 'back'); ox += cv.width - 1; }
            tx += 2;
          } else if (roll < 0.19 && run.x1 - tx > 3) {
            const cv = rackCv(r.int(0, 3)); addStatic(L, cv, x - 4, run.y - 26, 'back'); tx += 3;
          } else if (roll < 0.22 && !indoor) {
            const cv = heapCv(r.int(0, 3)); addStatic(L, cv, x - 6, run.y - 10, 'back'); tx += 2;
          }
        }
      }
      // the wax workshops: candles, wax tumars on cords (they glow), a lamp
      for (const s of interiors(L)) {
        const fy = s.floorY * TS, ry = (s.roofY + 1) * TS, w = (s.x1 - s.x0) * TS;
        if (fy - ry < 40 || w < 40) continue;
        const cx = (s.x0 + s.x1) / 2 * TS + 8;
        L.decos.push(lamp(cx, ry, { len: r.int(4, 9), light: '#ffd890', glass: '#ffe8a0' }));
        for (let k = 0; k < 3; k++) { const x0 = (s.x0 + 1) * TS + k * 22; if (x0 > (s.x1 - 1) * TS) break; L.decos.push(G.BiomeKit.lantern(x0 + 6, ry + 2, { color: '#e2c870', len: r.int(6, 14), lightR: 36, lightC: '#ffe0a0', glow: '#ffe2a8', glowR: 8 })); }
        for (let k = 0; k < 4; k++) { const x = (s.x0 + 1) * TS + r.int(0, Math.max(1, w - 24)), h = r.int(4, 8); L.decos.push(G.PixKit.flameDeco(x, fy - h - 1, { w: 3, h: 5, lightR: 40, lightC: '#ffd8a0', embers: false, draw(ctx) { ctx.fillStyle = '#efe6cc'; ctx.fillRect(RD(x) - 1, fy - h, 3, h); ctx.fillStyle = '#c8bca0'; ctx.fillRect(RD(x) + 1, fy - h, 1, h); } })); }
      }
    }
  }

  /* ================================================================ 3. THE MEMORY BAZAAR — day (the engine's warm bazaar) and night (61's) */
  {
    K.variant('bazaar', 'w_bazaar_day', {
      name: N(`The Memory Bazaar|Базар памяти|Xotira bozori`), subtitle: N(`Everything is sold here, even yesterday|Здесь продаётся всё, даже вчерашний день|Bu yerda hamma narsa sotiladi, hatto kechagi kun ham`),
      def: { music: 'yd_bazaar', enemyBiome: 'w_bazaar_day' },
      gen: { width: 440, enemies: [1, 2], segments: { building: 5, colonnade: 3, plain: 3, terrace: 2, bridge: 2, hills: 1, tower: 1.5, arena: 2, chasm: 1, cliff: 1, islands: 0.5 } },
      decorate(L) { nightLamps(L, U.RNG(L.seed + 3), 10); }
    });
    const bd = DEFS.w_bazaar_day;
    bd.fogBehind = withSky(bd.fogBehind);
    tod(bd);
    const bn = K.variant('yd_bazaar_night', 'w_bazaar_night', {
      name: N(`The Memory Bazaar|Базар памяти|Xotira bozori`), subtitle: N(`After dark, the Night market opens|Как стемнеет, открывается Ночной рынок|Qorong'i tushgach, Tungi bozor ochiladi`),
      def: { music: 'yd_bazaar', enemyBiome: 'w_bazaar_night', w2night: true },
      gen: { width: 440, enemies: [1, 2], segments: { building: 5, colonnade: 3, plain: 3, terrace: 2, bridge: 2, hills: 1, tower: 1.5, arena: 2, chasm: 1, cliff: 1, islands: 0.5 } }
    });
    bn.w2tod = TOD;
  }

  /* ================================================================ 4. THE UPPER KAREZ — the room labyrinth under the Tail and the Bazaar */
  {
    // the upper karez is not the black deep: daylight falls down the wells, smugglers keep oil lamps burning
    const kd = K.variant('yd_karez', 'w_karez', {
      name: N(`The Upper Karez|Верхние кяризы|Yuqori korizlar`), subtitle: N(`Water tunnels under the streets|Водяные тоннели под улицами|Ko'chalar ostidagi suv yo'llari`),
      def: { music: 'yd_tunnels', enemyBiome: 'yd_karez', ambient: '#8aa2aa', shade: '#7a949c', deepShade: '#0a1214', dark: false },
      gen: { cols: 11, rows: 3, enemies: [2, 3], loops: 0.25, sideRooms: 0.5 },
      decorate(L, rng) {
        // smugglers' lamps on niches, every few rooms; water glints along the floors
        let last = -99;
        for (const r of runs(L, 4, 3)) {
          if (r.x0 - last < 14 || !rng.chance(0.55)) continue;
          last = r.x0;
          const x = (r.x0 + 1) * TS + 8, y = r.y;
          L.decos.push({ static: true, layer: 'back', bx: x - 5, by: y - 22, bw: 11, bh: 22, draw(ctx) { ctx.fillStyle = '#2a1e16'; ctx.fillRect(x - 4, y - 20, 9, 2); ctx.fillStyle = '#4a3424'; ctx.fillRect(x - 3, y - 18, 7, 1); ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x - 2, y - 24 + 2, 5, 3); } });
          L.decos.push(G.PixKit.flameDeco(x, y - 22, { w: 3, h: 4, lightR: 96, lightC: '#ffb870', embers: false }));
        }
      }
    });
    kd.post = all(grade('#0a3a4a', 0.18), vignette('rgba(0,4,6,1)', 0.45));
  }

  /* ================================================================ the regions (data) */
  const TAIL_HOST = {
    prompt: `Sit with Rustam-aka|Сесть рядом с Рустамом-ака|Rustam aka yoniga o'tirish`,
    talk(done) {
      if (!W2.hasKey('hook')) {
        play([
          ['rustam', `Sit, son, sit. The tea is hot. The tea is always hot. ...Here. It was in my bag. A long time in my bag.|Садись, сынок, садись. Чай горячий. Чай всегда горячий. ...Вот. Лежал в сумке. Долго лежал.|O'tir, bolam, o'tir. Choy issiq. Choy doim issiq. ...Mana. Xaltamda yotgan edi. Ancha yotdi.`],
          ['', `An iron hook on a long cord, the cord black with old hands.|Железный крюк на длинном шнуре, шнур чёрный от старых рук.|Uzun ipdagi temir ilmoq; ip eski qo'llardan qoraygan.`],
          ['rustam', `A yodchi's hook. For washing lines. For beams. For the rings on the old towers — up, where legs won't take you. And a thief who stands too close comes to you. ...Yes. By himself.|Крюк ёдчи. Для верёвок с бельём. Для балок. Для колец на старых башнях — наверх, куда ноги не донесут. А вор, что подошёл слишком близко, сам к тебе придёт. ...Да. Сам.|Yodchi ilmog'i. Kir arqonlariga. To'sinlarga. Eski minoralardagi halqalarga — oyoq yetmagan joyga, yuqoriga. Juda yaqin kelgan o'g'ri esa o'zi oldingga keladi. ...Ha. O'zi.`],
          ['hero', `Whose was it?|Чей он?|Bu kimniki?`],
          ['rustam', `Someone's. Drink your tea. The tea is hot.|Чей-то. Пей чай. Чай горячий.|Kimningdir. Choyingni ich. Choy issiq.`]
        ], () => { W2.giveKey('hook'); try { G.YITEMS.add(G.YITEMS.key('w2_hook', N(`The yodchi hook|Крюк ёдчи|Yodchi ilmog'i`), N(`[G] near a ring or a beam: pull yourself to it. Near a light enemy: pull it to you.|[G] у кольца или балки: подтянуться. У лёгкого врага: притянуть его.|[G] halqa yoki to'sin yonida: o'zingni tort. Yengil dushman yonida: uni tort.`), '#9a9aa8').id); } catch (e) { /* key items are optional */ } W2.objective(`Use the hook (G) on a ring above the roofs|Используй крюк (G) на кольце над крышами|Tomlar ustidagi halqada ilmoqni (G) ishlat`); done(); });
        return;
      }
      play([['rustam', pick([
        `Mehri's well is older than the street. They say it goes down to where the city drinks.|Колодец Мехри старше улицы. Говорят, он уходит туда, где город пьёт.|Mehrining qudug'i ko'chadan ham qadimiy. Aytishlaricha, u shahar suv ichadigan joygacha tushadi.`,
        `At night the collectors walk the Tail. Sleep here, or walk quietly.|Ночью по Хвосту ходят сборщики. Спи здесь — или ходи тихо.|Tunda Dumda yig'uvchilar yuradi. Shu yerda uxla — yoki sekin yur.`,
        `The potters fire their kilns at dawn. Their smoke is the only thing in this city that goes up.|Гончары разжигают печи на рассвете. Их дым — единственное в этом городе, что поднимается вверх.|Kulollar xumdonlarini tongda yoqadi. Ularning tutuni bu shahardagi yuqoriga ko'tariladigan yagona narsa.`
      ])]], done);
    }
  };

  W2.region('tail', {
    name: `The Tail|Хвост|Dum`, sub: `Home of the poor on the Sleeper's tail|Дом бедняков на хвосте Спящего|Uxlovchi dumidagi kambag'allar uyi`,
    tier: 'surface', stage: 1.0, seed: 41011, biome: { day: 'w_tail_day', night: 'w_tail_night' },
    map: { x: 0.43, y: 0.32, w: 0.16, h: 0.1, col: '#c89a64' },
    night: { extra: 7, pool: [['yd_hollow', 10], ['torch_zealot', 6], ['zindan_prisoner', 3]], elite: true },
    exits: {
      west: { at: 'left', to: ['potters', 'east'], label: `To the Potters' Quarter|В Квартал гончаров|Kulollar mahallasiga` },
      east: { at: 'right', to: ['bazaar', 'west'], label: `To the Memory Bazaar|На Базар памяти|Xotira bozoriga` },
      well: { kind: 'well', inHouse: true, to: ['karez', 'tail_well'], prompt: `Climb down Mehri's well|Спуститься в колодец Мехри|Mehrining qudug'iga tushish` },
      rabat: { kind: 'gate', at: { frac: 0.72 }, to: ['rabat', 'west'], chain: true, label: `The Rabat road|Дорога на Рабат|Rabot yo'li`, closed: `A Divan chain across the caravan road. Not today.|Цепь Дивана поперёк караванной дороги. Не сегодня.|Karvon yo'li bo'ylab Devon zanjiri. Bugun emas.` }
    },
    objects: [
      { kind: 'chai', id: 'tail_plane', at: { frac: 0.24 }, look: 'yd_chai_dusk', name: `Chaikhana of the Two Plane Trees|Чайхана у двух чинар|Ikki chinor choyxonasi`, host: TAIL_HOST, seed: 3 },
      { kind: 'house', id: 'mehri', at: { frac: 0.5 }, w: 13, h: 4, doors: { w: 'shortcut', e: 'wall' }, inside: [{ kind: 'exit_well', exit: 'well', dx: 0.62 }], barred: `Mehri's gate. Barred from the yard side.|Ворота Мехри. Заперты со двора.|Mehrining darvozasi. Hovli tomondan zulfinlangan.` },
      { kind: 'hooktower', id: 'dovecote', at: { frac: 0.84 }, h: 11, top: [{ kind: 'cache', loot: 'gold' }] },
      { kind: 'sealed', id: 'cellar', at: { frac: 0.38 }, side: 'e' },
      { kind: 'cache', id: 'roofs', at: { frac: 0.62 } },
      { kind: 'miniboss', id: 'collector', at: { frac: 0.92 }, enemy: 'torch_zealot', hpMul: 1.6, adds: ['yd_hollow', 'yd_hollow'] },
      { kind: 'spot', id: 'yard_gate', at: { frac: 0.47 } },
      { kind: 'spot', id: 'square', at: { frac: 0.3 } }
    ]
  });

  W2.region('potters', {
    name: `The Potters' Quarter|Квартал гончаров|Kulollar mahallasi`, sub: `Kilns, clay lanes, the wax for the tumars|Печи, глиняные улицы, воск для тумаров|Xumdonlar, loy ko'chalar, tumarlar uchun mum`,
    tier: 'surface', stage: 1.4, seed: 52021, biome: 'w_potters',
    map: { x: 0.24, y: 0.32, w: 0.14, h: 0.1, col: '#c07a50' },
    night: { extra: 5, pool: [['yd_hollow', 10], ['rat_div', 4], ['yd_ember', 3]] },
    exits: {
      east: { at: 'right', to: ['tail', 'west'], label: `To the Tail|В Хвост|Dumga` },
      west: { at: 'left', to: ['tower', 'east'], label: `The road to the Tower of Silence|Дорога к Башне молчания|Sukunat minorasi yo'li`, closed: `The road to the Tower is full of Singers today. Another time.|На дороге к Башне сегодня полно Певцов. В другой раз.|Minora yo'lida bugun xonandalar to'la. Boshqa safar.` },
      kiln: { kind: 'shaft', hidden: true, to: ['karez', 'potters_drain'], prompt: `Climb down into the karez|Спуститься в кяриз|Korizga tushish` }
    },
    objects: [
      { kind: 'lightfloor', id: 'kiln', at: { frac: 0.66 }, below: [{ kind: 'exit', exit: 'kiln' }] },
      { kind: 'house', id: 'wax', at: { frac: 0.42 }, w: 16, h: 5, doors: { w: 'open', e: 'open' }, inside: [{ kind: 'cache', dx: 0.3 }] },
      { kind: 'hooktower', id: 'chimney', at: { frac: 0.22 }, h: 12, top: [{ kind: 'cache' }] },
      { kind: 'sealed', id: 'clay', at: { frac: 0.82 }, side: 'w' },
      { kind: 'miniboss', id: 'golem', at: { frac: 0.55 }, enemy: 'tile_golem', hpMul: 1.3 },
      { kind: 'stall', id: 'pots', shop: 'potter', at: { frac: 0.3 }, kinds: ['consumable', 'material', 'charm'] },
      { kind: 'spot', id: 'kilnyard', at: { frac: 0.62 } }
    ]
  });

  W2.region('bazaar', {
    name: `The Memory Bazaar|Базар памяти|Xotira bozori`, sub: `Everything is sold here, even yesterday|Здесь продаётся всё, даже вчерашний день|Bu yerda hamma narsa sotiladi, hatto kechagi kun ham`,
    tier: 'surface', stage: 2.0, seed: 63031, biome: { day: 'w_bazaar_day', night: 'w_bazaar_night' },
    map: { x: 0.62, y: 0.32, w: 0.18, h: 0.1, col: '#d8a040' },
    night: { extra: 6, pool: [['assassin', 8], ['yd_hollow', 6], ['jinn', 3]] },
    exits: {
      west: { at: 'left', to: ['tail', 'east'], label: `To the Tail|В Хвост|Dumga` },
      east: { at: 'right', to: ['ark', 'west'], key: 'divan_seal', label: `The Ark gate|Ворота Арка|Ark darvozasi`, closed: `Divan guards and a seal on the gate. Without the Seal, no.|Стража Дивана и печать на воротах. Без Печати — нет.|Devon soqchilari va darvozada muhr. Muhrsiz — yo'q.` },
      drain: { kind: 'well', inHouse: true, art: 'w2drain', to: ['karez', 'bazaar_drain'], prompt: `Climb down the great drain|Спуститься в большой сток|Katta ariqqa tushish` },
      stair: { kind: 'gate', onTower: true, to: ['cloister', 'west'], key: 'well_sign', trim: '#c8d8f0', seal: '#3a6ab0', label: `The Singers' stair|Лестница Певцов|Xonandalar zinasi`, locked: `A door with the Sign of the Well. It will not open for you.|Дверь со Знаком Колодца. Тебе она не откроется.|Quduq belgisi bor eshik. U senga ochilmaydi.` }
    },
    objects: [
      { kind: 'house', id: 'hall', at: { frac: 0.34 }, w: 18, h: 5, doors: { w: 'shortcut', e: 'open' }, inside: [{ kind: 'exit_well', exit: 'drain', dx: 0.35 }], barred: `The auction hall's back door. The bar is on the inside.|Задняя дверь аукционного зала. Засов изнутри.|Kimoshdi zalining orqa eshigi. Zulfin ichkarida.` },
      { kind: 'chai', id: 'bazaar_salt', at: { frac: 0.58 }, look: 'yd_chai_dusk', name: `Chaikhana by the Salt Well|Чайхана у солёного колодца|Sho'r quduq choyxonasi`, seed: 8, wall: '#b89470', wallD: '#8a6a4a' },
      { kind: 'hooktower', id: 'singers', at: { frac: 0.76 }, h: 13, w: 6, top: [{ kind: 'exit', exit: 'stair' }, { kind: 'cache', dx: -1.6 }] },
      { kind: 'stall', id: 'cloth', shop: 'bazaar', night: 'secret', at: { frac: 0.16 }, kinds: ['weapon', 'armour', 'consumable'], nightKinds: ['consumable', 'charm', 'mod'], nightKey: 'lamp', nightKeyPrice: 120, closedText: `The cloth row is shut for the night.|Суконный ряд закрыт на ночь.|Movut rastasi tunga yopilgan.` },
      { kind: 'stall', id: 'copper', shop: 'bazaar', at: { frac: 0.47 }, kinds: ['weapon', 'material', 'tumar'] },
      { kind: 'sealed', id: 'vault', at: { frac: 0.88 }, side: 'w' },
      { kind: 'miniboss', id: 'captain', at: { frac: 0.68 }, enemy: 'guard', hpMul: 1.5, adds: ['assassin'] },
      { kind: 'spot', id: 'carto', at: { frac: 0.52 } },
      { kind: 'spot', id: 'auction', at: { frac: 0.4 } }
    ]
  });

  // karez rooms: start = the left column (under the Tail), the end = the right column (under the Bazaar)
  const roomAt = frac => (list) => { const cols = Math.max(...list.map(r => r.c)) + 1, c = Math.min(cols - 1, Math.round(frac * (cols - 1))); const inCol = list.filter(r => r.c === c).sort((a, b) => a.r - b.r); return inCol[0]; };
  const bottomRoom = frac => (list) => { const rows = Math.max(...list.map(r => r.r)); const cand = list.filter(r => r.r === rows); if (!cand.length) return roomAt(frac)(list); cand.sort((a, b) => Math.abs(a.c - frac * 10) - Math.abs(b.c - frac * 10)); return cand[0]; };
  W2.region('karez', {
    name: `The Upper Karez|Верхние кяризы|Yuqori korizlar`, sub: `Water tunnels under the streets|Водяные тоннели под улицами|Ko'chalar ostidagi suv yo'llari`,
    tier: 'under', stage: 2.4, seed: 74041, biome: 'w_karez', outdoor: false,
    map: { x: 0.5, y: 0.56, w: 0.4, h: 0.12, col: '#3a7a84' },
    exits: {
      tail_well: { kind: 'shaft', room: roomAt(0.12), dx: 0.4, to: ['tail', 'well'], label: `Up Mehri's well|Наверх по колодцу Мехри|Mehrining qudug'idan yuqoriga` },
      potters_drain: { kind: 'shaft', room: roomAt(0.0), dx: 0.6, to: ['potters', 'kiln'], label: `Up into the Potters' Quarter|Наверх, в Квартал гончаров|Yuqoriga, Kulollar mahallasiga` },
      bazaar_drain: { kind: 'shaft', room: roomAt(1.0), dx: 0.5, to: ['bazaar', 'drain'], label: `Up the great drain to the Bazaar|Наверх по стоку на Базар|Katta ariqdan bozorga` },
      deeper: { kind: 'gate', room: bottomRoom(0.5), to: ['streets', 'east'], key: 'water', trim: '#1a4a5a', label: `The sluice to the Swallowed Streets|Шлюз к Проглоченным улицам|Yutilgan ko'chalarga shlyuz`, locked: `The sluice is under black water. You won't get through without air.|Шлюз под чёрной водой. Без воздуха туда не пройти.|Shlyuz qora suv ostida. Havosiz u yerdan o'tib bo'lmaydi.` }
    },
    objects: [
      { kind: 'grate', id: 'mid', at: { frac: 0.5 }, from: 'e' },
      { kind: 'chai', id: 'karez_den', at: { frac: 0.8 }, look: 'yd_chai_under', name: `The Smugglers' Den|Логово контрабандистов|Kontrabandachilar ini`, wall: '#5a4a3e', wallD: '#3a2e26', wallL: '#7a6654', seed: 13 },
      { kind: 'lightwall', id: 'old', at: { frac: 0.3 }, inside: [{ kind: 'chest' }] },
      { kind: 'lightwall', id: 'deep', at: { frac: 0.66 }, inside: [{ kind: 'cache' }] },
      { kind: 'miniboss', id: 'mother', at: { frac: 0.72 }, enemy: 'yd_albasty_kin', hpMul: 1.4, adds: ['yd_leech', 'yd_leech'] },
      { kind: 'chest', id: 'cistern', at: { frac: 0.45 } },
      { kind: 'spot', id: 'den', at: { frac: 0.83 } }
    ]
  });

  // the regions that stage 5 will build: on the map as places not yet reached
  W2.region('ark', { name: `The Ark|Арк|Ark`, tier: 'surface', stage: 3, todo: true, map: { x: 0.8, y: 0.26, w: 0.12, h: 0.1, col: '#e0b860' } });
  W2.region('cloister', { name: `The Cloister of the Singers|Обитель Певцов|Xonandalar xonaqohi`, tier: 'surface', stage: 3, todo: true, map: { x: 0.72, y: 0.15, w: 0.12, h: 0.08, col: '#c8d4f0' } });
  W2.region('rabat', { name: `The Rabat and the Salt Road|Рабат и Соляная дорога|Rabot va Tuz yo'li`, tier: 'surface', stage: 2.5, todo: true, map: { x: 0.12, y: 0.47, w: 0.09, h: 0.06, col: '#e8e0d0' } });
  W2.region('tower', { name: `The Tower of Silence|Башня молчания|Sukunat minorasi`, tier: 'surface', stage: 3, todo: true, map: { x: 0.12, y: 0.2, w: 0.07, h: 0.09, col: '#a09080' } });
  W2.region('streets', { name: `The Swallowed Streets|Проглоченные улицы|Yutilgan ko'chalar`, tier: 'under', stage: 4, todo: true, map: { x: 0.36, y: 0.72, w: 0.14, h: 0.08, col: '#5a6a70' } });
  // a todo region is not loadable yet: exits to it stay closed
  for (const id in W2.regions) if (W2.regions[id].todo) W2.regions[id]._todo = true;
  {
    const r0 = W2.regions;
    W2.loadable = id => !!(r0[id] && !r0[id].todo);
  }

  /* ================================================================ people, their hours, shops */
  W2.shop('potter', { open: [7, 19] });
  W2.shop('bazaar', { open: [8, 20] });
  W2.shop('secret', { open: [22, 4] });
  W2.npc('mehri', {
    name: `Mehri|Мехри|Mehri`, look: 'widow', prompt: `Talk to Mehri|Говорить с Мехри|Mehri bilan gaplashish`,
    talk(done) {
      const yard = W2.isOpen('tail:door:mehri:w');
      play([['mehri', yard
        ? `You came up my well like a wet cat. Fine, leave the gate open. The city takes everything anyway — let it leave me the yard.|Вылез из моего колодца, как мокрый кот. Ладно, пусть ворота стоят открытыми. Город и так всё забирает — двор пусть оставит.|Qudug'imdan ho'l mushukdek chiqding. Mayli, darvoza ochiq tursin. Shahar baribir hammasini oladi — hovlini qoldirsin.`
        : `The gate's barred, son. Since the collectors came I only open it from inside. The well? It goes down to the karez. Nobody goes down there twice.|Ворота на засове, сынок. С тех пор как пришли сборщики, открываю только изнутри. Колодец? Он уходит в кяризы. Туда дважды не спускаются.|Darvoza zulfinda, bolam. Yig'uvchilar kelgandan beri faqat ichkaridan ochaman. Quduqmi? U korizlarga tushadi. U yerga ikki marta tushishmaydi.`]], done);
    }
  });
  W2.schedule('mehri', [
    { from: 6, to: 18, region: 'tail', spot: 'yard_gate' },
    { from: 18, to: 22, region: 'tail', spot: 'chai:tail_plane:in' }
  ]);
  W2.npc('cartographer', {
    name: `The cartographer|Картограф|Xaritachi`, look: { robe: '#3a4a6a', trim: '#e2b452', skin: '#c89a78', head: 'turban', headC: '#e8e0d0', beard: 'long' },
    prompt: `Buy a map from the cartographer|Купить карту у картографа|Xaritachidan xarita sotib olish`,
    talk(done) {
      const s = W2.S(), list = Object.values(W2.regions).filter(r => !r.todo && !s.charts[r.id]);
      play([['', `"Maps of the city. Just the outlines — what's hidden inside, you find on foot."|«Карты города. Только очертания — что спрятано внутри, ищут ногами».|«Shahar xaritalari. Faqat shakli — ichida nima yashiringanini oyoq bilan izlaysan».`]], () => {
        if (!list.length) { play([['', `"You have all I sell."|«У тебя есть всё, что я продаю».|«Men sotadigan hammasi sende bor».`]], done); return; }
        ask(`Which map?|Какую карту?|Qaysi xarita?`, list.map(r => ({ label: r.name, price: 40, id: r.id })).concat([{ label: `Nothing|Ничего|Hech narsa`, id: null }]), o => {
          if (o.id) { W2.chart(o.id); toast(tf(`The map of {r} is yours (M).|Карта: {r} — теперь твоя (M).|{r} xaritasi endi sening (M).`, { r: t(W2.regions[o.id].name) }), '#ffe7a6'); }
          done();
        });
      });
    }
  });
  W2.schedule('cartographer', [{ from: 8, to: 20, region: 'bazaar', spot: 'carto' }]);
  W2.npc('smuggler', {
    name: `A smuggler|Контрабандист|Kontrabandachi`, look: { robe: '#2a2a30', trim: '#5a4a3a', skin: '#a07a5a', head: 'hood', headC: '#1a1a20' },
    talk(done) { play([['', `"Down here nobody pays the tithe. Up there they pay it twice. So you tell me where the real city is."|«Тут, внизу, десятину не платит никто. Наверху платят дважды. Вот и подумай, где настоящий город».|«Bu yerda, pastda, hech kim ushr to'lamaydi. Tepada ikki marta to'lashadi. O'ylab ko'r, asl shahar qayerda».`]], done); }
  });
  W2.schedule('smuggler', [{ from: 20, to: 6, region: 'karez', spot: 'den' }, { from: 6, to: 20, region: 'karez', spot: 'chai:karez_den:in' }]);
  W2.npc('potter', {
    name: `Old Usto Karim|Старый усто Карим|Keksa usto Karim`, look: { robe: '#7a4a2a', trim: '#c89a5a', skin: '#b08060', head: 'doppi', headC: '#2a2a2a', beard: 'short' },
    talk(done) { play([['', `"The wax for the tumars comes from my neighbour's workshop. Clay remembers the hand; wax remembers nothing. That is why they use wax."|«Воск для тумаров — из мастерской моего соседа. Глина помнит руку, воск не помнит ничего. Потому его и берут».|«Tumarlar uchun mum qo'shnimning ustaxonasidan. Loy qo'lni eslaydi, mum hech narsani eslamaydi. Shuning uchun uni olishadi».`]], done); }
  });
  W2.schedule('potter', [{ from: 6, to: 20, region: 'potters', spot: 'kilnyard' }]);

  /* ================================================================ a fresh open world: where the story stands */
  W2.hooks.newWorld.push(s => {
    s.cur = s.cur && s.cur.region !== 'tail' ? s.cur : { region: 'tail', entry: 'west', inside: null };
    s.keys.light = 1;          // Sado woke in the prologue
    s.obj = `Find a way down into the karez|Найди путь вниз, в кяризы|Korizlarga tushadigan yo'lni top`;
  });
  // a small chain of objectives through the first regions (the story API stage 5 will fill: onEnter / trigger / objective / mark)
  W2.onEnter('karez', (def, o) => {
    const s = W2.S();
    if (o.first) subtitle(`Water. Old water, under everything. Mind the leeches.|Вода. Старая вода, подо всем. Осторожно, пиявки.|Suv. Eski suv, hamma narsaning ostida. Zuluklardan ehtiyot bo'l.`);
    if (W2.story) return;      // stage 5: the story director keeps the objective
    if (!W2.isOpen('tail:door:mehri:w') && /karez/.test(s.obj || '')) {
      W2.objective(`Find Mehri's well: it leads up into her yard|Найди колодец Мехри: он ведёт наверх, в её двор|Mehrining qudug'ini top: u hovlisiga olib chiqadi`);
      W2.mark('w2:well', 'tail', 'yard_gate', 'quest', `Mehri's yard|Двор Мехри|Mehrining hovlisi`);
    }
  });
  W2.onEnter('tail', () => {
    if (W2.story) return;
    const s = W2.S();
    if (W2.isOpen('tail:door:mehri:w') && /Mehri/.test(s.obj || '')) {
      W2.unmark('w2:well');
      W2.objective(W2.hasKey('hook') ? `Explore the city: the Bazaar, the kilns, the karez|Исследуй город: Базар, печи, кяризы|Shaharni kez: bozor, xumdonlar, korizlar` : `Rest at the chaikhana of the two plane trees|Отдохни в чайхане у двух чинар|Ikki chinor choyxonasida dam ol`);
    }
  });
  W2.trigger('tail', 'yard_gate', { r: 40, when: () => W2.isOpen('tail:door:mehri:w') }, done => play([
    ['hero', `The bar is up. Whoever comes up the well now walks out into the street.|Засов снят. Кто теперь поднимется из колодца — выйдет прямо на улицу.|Zulfin olindi. Endi quduqdan chiqqan har kim to'g'ri ko'chaga chiqadi.`]
  ], done));
  // the art for a drain grate in the floor of the auction hall
  G.ObjArt.w2drain = (ctx, o) => {
    const x = RD(o.x), y = RD(o.y);
    ctx.fillStyle = '#1a1614'; ctx.fillRect(x - 14, y - 4, 28, 4);
    ctx.fillStyle = '#4a4e56'; for (let i = 0; i < 6; i++) ctx.fillRect(x - 12 + i * 5, y - 4, 2, 4);
    ctx.fillStyle = '#6a5a4a'; ctx.fillRect(x - 16, y - 6, 32, 2);
    ctx.fillStyle = '#3a2a1e'; ctx.fillRect(x - 13, y - 22, 2, 16); ctx.fillRect(x + 11, y - 22, 2, 16); ctx.fillRect(x - 14, y - 24, 28, 2);
  };
})();
