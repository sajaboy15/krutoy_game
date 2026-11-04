/* =====================================================================
   Yodgor v2 — the world: locations (biomes), the 33-entry plan, the
   difficulty curve, lore enemies, bosses, weapons/skills/perks, music.
   Gameplay stays the engine's. Story files (70–72) own the words on the
   cards; names here are placeholders registered with N().
   Exposes G.WORLD (ids, hooks) for the story files and tests.
   ===================================================================== */
(function world() {
  const K = G.BiomeKit, EK = G.EK, BK = G.BK, X = G.ItemsExt, MU = G.Music;
  const U = G.U, TS = G.TS, T = G.T, Art = G.Art, PK = G.PixKit, KIT = G.BossKit;
  if (!K || !EK || !BK || !X) { console.error('[world] libraries missing'); return; }
  const RD = Math.round;
  const W = G.WORLD = { biomes: {}, enemies: {}, bosses: {}, items: [], perks: [], rest: {} };

  /* ================================================================ helpers */
  // ambient particles relative to the camera
  function fall(o) {
    o = Object.assign({ rate: .2, cols: ['#ffffff'], vx: [-.1, .1], vy: [.2, .5], size: 1, life: 360, glow: false, glowR: 4, alpha: .8, from: 'top', grav: 0, sway: 0 }, o);
    return function (world, cam, t) {
      let n = o.rate;
      while (n > 0) {
        if (Math.random() < Math.min(1, n)) {
          const side = o.from === 'side' ? (o.vx[0] < 0 ? G.W + 4 : -4) : null;
          const x = cam.x + (side != null ? side : U.rand(-20, G.W + 20));
          const y = cam.y + (o.from === 'top' ? -4 : o.from === 'bottom' ? G.H + 4 : U.rand(0, G.H));
          G.FX.spawn({
            x, y, vx: U.rand(o.vx[0], o.vx[1]), vy: U.rand(o.vy[0], o.vy[1]), drag: 1, grav: o.grav, life: o.life, size: Array.isArray(o.size) ? U.rand(o.size[0], o.size[1]) : o.size,
            color: U.choose(o.cols), glow: o.glow, glowR: o.glowR, alpha: o.alpha, shape: o.shape,
            update: o.sway ? p => { p.vx += Math.sin(p.t * .05 + p.y * .01) * o.sway; } : undefined
          });
        }
        n -= 1;
      }
    };
  }
  const both = (...fns) => function () { for (const f of fns) if (f) f.apply(this, arguments); };
  // screen tint after lighting (grading by blend)
  function tint(col, a, op, pulse) {
    return function (ctx, cam, t) {
      const k = pulse ? pulse(t) : 1;
      ctx.globalCompositeOperation = op || 'soft-light'; ctx.globalAlpha = a * k; ctx.fillStyle = col; ctx.fillRect(0, 0, G.W, G.H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    };
  }
  function vignette(col, a) {
    let cv = null;
    return function (ctx) {
      if (!cv) {
        cv = G.makeCanvas(G.W, G.H);
        const g = cv.ctx.createRadialGradient(G.W / 2, G.H / 2, G.H * .35, G.W / 2, G.H / 2, G.W * .62);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col);
        cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, G.W, G.H);
      }
      ctx.globalAlpha = a; ctx.drawImage(cv, 0, 0); ctx.globalAlpha = 1;
    };
  }
  function gradSky(stops, sun) {
    let cv = null;
    return function (ctx) {
      if (!cv) cv = PK.skyCanvas(stops, 18, sun || null);
      ctx.drawImage(cv, 0, 0);
    };
  }
  // longer levels: the fixed scrolls/lore/food of an open level sit at fixed fractions, add more along the way
  const EXTRA_OBJ = [[.88, 'scroll'], [.22, 'lore'], [.5, 'lore'], [.8, 'lore'], [.4, 'food'], [.66, 'urn'], [.93, 'food']];
  function longPostGen(L, rng, genName) {
    if (genName !== 'open' && genName !== 'generate') return;
    try { K.addObjectsAt(L, EXTRA_OBJ, rng); } catch (e) { console.error('[world] objects', e); }
  }
  // lanterns hung under roofs/colonnades/bridges (like tail_night)
  function hangLanterns(L, rng, o) {
    o = Object.assign({ cols: ['#c8302a', '#d89a2a', '#2a7ab0'], lightC: '#ffb060', glow: '#ffb24a', every: 1 }, o);
    const D = L.decos;
    for (const s of L.structures || []) {
      if (!rng.chance(o.every)) continue;
      if (s.kind === 'building') {
        const ry = (s.roofY + 1) * TS;
        D.push(K.lantern((s.x0 - 1) * TS + 8, ry, { color: rng.pick(o.cols), lightC: o.lightC, glow: o.glow }), K.lantern((s.x1 + 1) * TS + 8, ry, { color: rng.pick(o.cols), lightC: o.lightC, glow: o.glow }));
      } else if (s.kind === 'colonnade' && s.pillars) {
        for (let k = 1; k < s.pillars.length; k++) D.push(K.lantern((s.pillars[k - 1] + s.pillars[k]) / 2 * TS + 10, (s.roofY + 1) * TS, { color: rng.pick(o.cols), len: 6, lightC: o.lightC, glow: o.glow }));
      } else if (s.kind === 'bridge' && !s.high && s.y != null) {
        for (let x = s.x0 + 3; x < s.x1 - 2; x += 6) D.push(K.lantern(x * TS + 8, (s.y + 1) * TS, { color: rng.pick(o.cols), len: 3, lightR: 60, lightC: o.lightC, glow: o.glow }));
      } else if (s.kind === 'tower' && s.roofY != null) {
        D.push(K.lantern((s.x0 + s.x1 + 1) / 2 * TS, (s.roofY + 1) * TS, { color: rng.pick(o.cols), len: 10, lightR: 90, lightC: o.lightC, glow: o.glow }));
      }
    }
  }
  // lamp on a pole, standing on the floor
  function lampPost(x, y, o) {
    o = Object.assign({ body: '#ffd88a', core: '#fff4cc', light: '#ffb060', glow: '#ffb24a', h: 32 }, o);
    const ph = x * .07;
    return {
      x, y: y - o.h, r: 60, layer: 'back', light: { r: 86, color: o.light, a: .95, flicker: true },
      draw(ctx) {
        ctx.fillStyle = '#20160f'; ctx.fillRect(RD(x), y - o.h, 2, o.h); ctx.fillRect(RD(x) - 3, y - 2, 8, 2);
        ctx.fillStyle = '#3a2a1a'; ctx.fillRect(RD(x) - 3, y - o.h - 8, 8, 2); ctx.fillRect(RD(x) - 2, y - o.h + 1, 6, 1);
        ctx.fillStyle = o.body; ctx.fillRect(RD(x) - 2, y - o.h - 6, 6, 7);
        ctx.fillStyle = o.core; ctx.fillRect(RD(x), y - o.h - 4, 2, 4);
      },
      fx(ctx, t) { G.Glow.add(x + 1, y - o.h - 3, 24, o.glow, .55 + .1 * Math.sin(t * 7 + ph)); }
    };
  }
  function lampsOnRuns(L, rng, every, o) {
    let last = -99;
    for (const run of K.floorRuns(L, 5, 4)) {
      if (L.structOf && L.structOf(run.x0 + 2, run.ty)) continue;
      for (let x = run.x0 + 2; x <= run.x1 - 2; x += every) if (x - last > every * .7 && rng.chance(.8)) { L.decos.push(lampPost(x * TS + 7, run.y, o)); last = x; }
    }
  }
  // candles / small flames on floor runs
  function candles(L, rng, chance, o) {
    o = Object.assign({ lightR: 60, lightC: '#ffd8a0', step: [5, 10] }, o);
    for (const run of K.floorRuns(L, 3, 3)) {
      for (let tx = run.x0; tx <= run.x1; tx += rng.int(o.step[0], o.step[1])) {
        if (!rng.chance(chance)) continue;
        const n = rng.int(1, 3);
        for (let k = 0; k < n; k++) {
          const x = tx * TS + 4 + k * 5, y = run.y, h = rng.int(3, 6);
          L.decos.push(PK.flameDeco(x, y - h - 1, {
            w: 3, h: 5, lightR: o.lightR, lightC: o.lightC, embers: false,
            draw(ctx) { ctx.fillStyle = o.wax || '#e8e0d0'; ctx.fillRect(RD(x) - 1, y - h, 2, h); ctx.fillStyle = '#9a9080'; ctx.fillRect(RD(x), y - h, 1, h); }
          }));
        }
      }
    }
  }
  // recolour every deco (draw, fx, light) through a look — used to turn the gut's pink into other waters
  function remapDecos(L, look) {
    for (const d of L.decos) {
      if (d.static || d._rm) continue;
      d._rm = 1;
      if (d.light && d.light.color) d.light = Object.assign({}, d.light, { color: EK.mapHex(look, d.light.color) });
      if (d.draw) { const f = d.draw; d.draw = function (ctx, t, dd) { return f.call(this, EK.proxyCtx(ctx, look, 'memo'), t, dd); }; }
      if (d.fx) { const f = d.fx; d.fx = function (ctx, t, dd) { return EK.withMappedLights(look, () => f.call(this, EK.proxyCtx(ctx, look, 'memo'), t, dd)); }; }
    }
    for (const n of L.nodes || []) if (n.col) n.col = EK.mapHex(look, n.col);
  }
  // registered name helper: biome names are placeholders, story files put the real ones on the card
  function V(base, id, o) {
    const d = K.variant(base, id, o);
    W.biomes[id] = d;
    return d;
  }

  /* ================================================================ locations */
  const NIGHT_BG = [{ sat: .5 }, { mul: '#46528c' }, { add: '#05071a' }];

  // 0 — the Tail at night, the Night of Payment
  V('tail_night', 'yd_tail_night', {
    name: N(`The Tail at Night|Хвост ночью|Tungi Dum`), subtitle: N(`Lanterns over the roofs of the poor|Фонари над крышами бедноты|Kambag'allar tomlari ustida chiroqlar`),
    def: { music: 'yd_roofs', enemyBiome: 'yd_tail', ambient: '#4a5890', shade: '#262e5a' },
    gen: { width: 300, enemies: [1, 2] },
    postGen: longPostGen
  });

  // 3 — the Tail, the morning after: grey, smoky dawn after a disaster
  const ASH_SKY = [{ sat: .25 }, { mul: '#c8b8b0' }, { add: '#141012' }, { contrast: .85, pivot: .55 }];
  const ASH_BG = [{ sat: .3 }, { mul: '#a89c9c' }, { add: '#100c0e' }];
  const ASH_TILES = [{ sat: .55 }, { mul: '#d8ccc8' }];
  V('bukhara', 'yd_tail_dawn', {
    name: N(`The Tail, Morning|Хвост наутро|Dum, ertasi tong`), subtitle: N(`Smoke where the houses were|Дым там, где стояли дома|Uylar turgan joyda tutun`),
    def: {
      music: 'yd_ash', enemyBiome: 'yd_tail2', ambient: '#c8bcb8', shade: '#7a6c70', deepShade: '#201818', bloom: .45, wind: .6,
      dust: ['#8a8080', '#6a6262', '#a8a0a0'],
      drawForeground: null,
      fogBehind(ctx) { ctx.globalAlpha = .18; ctx.fillStyle = '#8a8088'; ctx.fillRect(0, .45 * G.H, G.W, .55 * G.H); ctx.globalAlpha = 1; },
      post: both(tint('#5a5058', .3), vignette('rgba(20,14,16,1)', .45)),
      ambientFx: both(
        fall({ rate: .25, cols: ['#3a3434', '#5a5252', '#8a8080', '#c8c0b8'], vx: [.1, .5], vy: [.15, .45], life: 420, sway: .01 }),
        function (world, cam) { // smoke columns rising from the ruins
          const L = G.level;
          if (!L.smoke || Math.random() > .5) return;
          for (const sx of L.smoke) {
            if (sx < cam.x - 60 || sx > cam.x + G.W + 60 || Math.random() > .3) continue;
            G.FX.spawn({ x: sx + U.rand(-6, 6), y: L.smokeY(sx), vx: U.rand(.1, .35), vy: -U.rand(.25, .55), drag: .995, life: 260, size: U.rand(3, 6), size1: U.rand(10, 18), shape: 'circle', color: U.choose(['#3a3436', '#4a4446', '#5a5254']), alpha: .32 });
          }
        })
    },
    gradeSky: ASH_SKY, gradeBg: ASH_BG, gradeTiles: ASH_TILES,
    gen: { width: 310, enemies: [1, 2] },
    postGen: longPostGen,
    decorate(L, rng) {
      L.smoke = [];
      for (let x = 30; x < L.w - 20; x += rng.int(18, 34)) L.smoke.push(x * TS + 8);
      L.smokeY = x => { const tx = Math.floor(x / TS); let y = 0; while (y < L.h - 1 && L.get(tx, y) === T.AIR) y++; return y * TS; };
      // a few dying fires among the rubble
      for (const run of K.floorRuns(L, 4, 3)) if (rng.chance(.18)) {
        const x = (rng.int(run.x0, run.x1) + .5) * TS;
        L.decos.push(PK.flameDeco(x, run.y - 4, { w: 6, h: 8, lightR: 80, lightC: '#ff9a5a', embers: true, draw(ctx) { ctx.fillStyle = '#2a1e1a'; ctx.fillRect(RD(x) - 5, run.y - 3, 11, 3); ctx.fillStyle = '#4a3428'; ctx.fillRect(RD(x) - 3, run.y - 4, 6, 1); } }));
      }
    }
  });

  // 4 — the Rabat and the Salt Road: pale salt-white steppe
  const SALT_SKY = [{ map: [[0, '#5a6a80'], [.45, '#a8b4c4'], [.8, '#e8e8e4'], [1, '#ffffff']], k: .7 }, { sat: .45 }];
  const SALT_BG = [{ sat: .3 }, { map: [[0, '#4a4644'], [.4, '#9a948c'], [.75, '#dcd8d0'], [1, '#ffffff']], k: .6 }];
  const SALT_TILES = [{ sat: .35 }, { map: [[0, '#3a3430'], [.45, '#a09080'], [.8, '#e0d8cc'], [1, '#fffcf4']], k: .5 }];
  V('steppe', 'yd_salt', {
    name: N(`The Rabat and the Salt Road|Рабат и Соляная дорога|Rabot va Tuz yo'li`), subtitle: N(`Caravans wait outside the walls|Караваны ждут за стеной|Karvonlar devor ortida kutib turibdi`),
    def: {
      music: 'yd_salt', enemyBiome: 'yd_salt', ambient: '#fff6ee', shade: '#c8bcb4', bloom: .7, wind: .9,
      dust: ['#e8e4dc', '#d0c8bc', '#ffffff'], rock: ['#c8bca8', '#a89c88', '#e8e0d0'],
      post: tint('#d8dce8', .18),
      ambientFx: fall({ rate: .3, cols: ['#ffffff', '#f4f0e8', '#e0e4ec'], vx: [.5, 1.2], vy: [-.05, .15], from: 'any', life: 300, alpha: .7 })
    },
    gradeSky: SALT_SKY, gradeBg: SALT_BG, gradeTiles: SALT_TILES, gradeFg: SALT_BG,
    gen: { width: 320, enemies: [1, 2] },
    postGen: longPostGen,
    decorate(L) { remapDecos(L, { sat: .22, light: 1.15 }); } // grass and poppies bleached by salt
  });

  // 7 — the Memory Bazaar at night, lanterns
  V('bazaar', 'yd_bazaar_night', {
    name: N(`The Memory Bazaar|Базар памяти|Xotira bozori`), subtitle: N(`Lanterns over stalls of other people's lives|Фонари над прилавками, где торгуют чужими жизнями|Begona umrlar sotiladigan rastalar ustida chiroqlar`),
    def: {
      music: 'yd_bazaar', enemyBiome: 'yd_bazaar', ambient: '#6e60a0', shade: '#3a3062', deepShade: '#0c0818', bloom: .95, wind: .3,
      drawSky: K.nightSky({ seed: 5, bands: [[0, '#07051a'], [.45, '#1a1238'], [.8, '#3a2250'], [1, '#6a3450']], moon: { x: 90, y: 40, r: 9 } }),
      fogBehind(ctx) { ctx.globalAlpha = .18; ctx.fillStyle = '#5a3a7a'; ctx.fillRect(0, .6 * G.H, G.W, .4 * G.H); ctx.globalAlpha = 1; },
      drawForeground: null,
      post: tint('#2a2a8a', .2),
      ambientFx: fall({ rate: .05, cols: ['#ffd08a', '#ffb060'], vx: [-.1, .1], vy: [-.2, -.05], from: 'any', glow: true, glowR: 5, life: 240, alpha: .9, sway: .02 })
    },
    gradeBg: [{ sat: .55 }, { mul: '#5a4a90' }, { add: '#08051a' }],
    gen: { width: 320, enemies: [1, 2] },
    postGen: longPostGen,
    decorate(L, rng) { hangLanterns(L, rng, { cols: ['#c8302a', '#d89a2a', '#b03a8a', '#2a8ab0'] }); lampsOnRuns(L, rng, 11); }
  });

  // 8 — the Ark, gardens of the Divan: gilded palaces
  const GOLD_BG = [{ map: [[0, '#1a0c04'], [.35, '#5a3010'], [.7, '#c88a34'], [1, '#fff0c0']], k: .6 }];
  const GOLD_TILES = [{ map: [[0, '#1a0e06'], [.4, '#6a4a1c'], [.75, '#d8a850'], [1, '#fff4d0']], k: .38 }, { sat: 1.1 }];
  V('registan', 'yd_ark', {
    name: N(`The Ark|Арк|Ark`), subtitle: N(`Gardens of the Divan on the Sleeper's shoulders|Сады Дивана на плечах Спящего|Uxlovchining yelkasidagi Devon bog'lari`),
    def: {
      music: 'yd_palace', enemyBiome: 'yd_ark', ambient: '#ffe2b8', shade: '#a07858', deepShade: '#2a1408', bloom: .9, wind: .3,
      drawSky: gradSky([[0, '#2a1440'], [.35, '#7a3a50'], [.62, '#d87a3a'], [.82, '#ffc060'], [1, '#fff0c0']],
        { x: 340, y: 150, r: 20, core: '#fff8e0', rim: '#ffe0a0', halo: [[6, '#ffe8b0', .6, 0], [18, '#ffd080', .3, 1], [40, '#ffb060', .14, 2], [70, '#ff9040', .06, 3]] }),
      fogBehind(ctx) { ctx.globalAlpha = .16; ctx.fillStyle = '#ffb060'; ctx.fillRect(0, .55 * G.H, G.W, .45 * G.H); ctx.globalAlpha = 1; },
      drawForeground: null,
      post: tint('#ffb040', .2),
      ambientFx: fall({ rate: .12, cols: ['#ffe080', '#ffd040', '#fff4c0'], vx: [-.15, .15], vy: [.1, .3], life: 400, glow: true, glowR: 3, alpha: .8, sway: .015 })
    },
    gradeBg: GOLD_BG, gradeTiles: GOLD_TILES,
    gen: { width: 320, enemies: [1, 2] },
    postGen: longPostGen,
    decorate(L, rng) { hangLanterns(L, rng, { cols: ['#d8a020', '#f0c040', '#c84a2a'], lightC: '#ffd080', glow: '#ffd060', every: .7 }); }
  });

  // 11 — the Cloister of the Singers: cold white and blue
  const COLD_BG = [{ map: [[0, '#060a18'], [.45, '#3a4a6a'], [.8, '#a8b8d8'], [1, '#ffffff']], k: .75 }];
  const COLD_TILES = [{ map: [[0, '#0a0e1a'], [.45, '#4a5a7a'], [.8, '#c0ccdc'], [1, '#ffffff']], k: .5 }, { sat: .6 }];
  V('registan', 'yd_cloister', {
    name: N(`The Cloister of the Singers|Обитель Певцов|Xonandalar xonaqohi`), subtitle: N(`White walls that remember every voice|Белые стены, что помнят каждый голос|Har bir ovozni eslab qoladigan oq devorlar`),
    def: {
      music: 'yd_cloister', enemyBiome: 'yd_cloister', ambient: '#aab4dc', shade: '#4a5482', deepShade: '#080a1a', bloom: .9, wind: .2,
      drawSky: K.nightSky({ seed: 11, bands: [[0, '#0a1024'], [.5, '#1e2a4a'], [.85, '#4a5a80'], [1, '#8a9ac0']], moon: { x: 380, y: 46, r: 14 }, crescent: false }),
      fogBehind(ctx) { ctx.globalAlpha = .2; ctx.fillStyle = '#c8d4f0'; ctx.fillRect(0, .6 * G.H, G.W, .4 * G.H); ctx.globalAlpha = 1; },
      drawForeground: null,
      post: tint('#3a5ac0', .22),
      ambientFx: fall({ rate: .25, cols: ['#ffffff', '#e0e8ff', '#c8d4f0'], vx: [-.1, .2], vy: [.2, .45], life: 520, alpha: .75, sway: .01 })
    },
    gradeBg: COLD_BG, gradeTiles: COLD_TILES,
    gen: { width: 320, enemies: [1, 2] },
    postGen: longPostGen,
    decorate(L, rng) { candles(L, rng, .3, { lightC: '#d8e4ff', lightR: 64 }); }
  });

  // 14 — the Karez: dark wet tunnels inside the Sleeper (Sado's light grows)
  const KAREZ_LOOK = { hue: 205, sat: .8, light: .9, map: { '#ff7aa8': '#4ad0d8', '#ff9ac0': '#8ae8f0', '#ff3a6a': '#1a6a7a', '#ff2a5a': '#1a5a6a', '#c86a7a': '#5a9aa0', '#5af0e0': '#5af0e0', '#7af0e6': '#7af0e6' } };
  const KAREZ_TILES = [{ map: [[0, '#020608'], [.35, '#16303a'], [.7, '#3e6a72'], [1, '#a0d8d0']], k: .78 }];
  // the gut's drips, in clear water
  function drips(rate, cols) {
    return function (world, cam) {
      const L = G.level;
      if (!L.dripCols || Math.random() > rate) return;
      const c0 = Math.floor(cam.x / TS) >> 3, c1 = Math.floor((cam.x + G.W) / TS) >> 3, col = L.dripCols[U.randi(c0, c1)];
      const s = col && col[Math.floor(Math.random() * col.length)];
      if (!s || !G.onScreen(s.x, s.y, 0)) return;
      const glow = Math.random() < .4, color = glow ? cols[0] : cols[1];
      G.FX.spawn({ x: s.x + U.rand(-6, 6), y: s.y + 2, vy: .3, grav: .14, drag: 1, life: 240, shape: 'rect', w: 1, h: 2, size: 1, color, glow, glowR: glow ? 4 : 0, fade: false,
        update(p) { if (G.level.solidPx(p.x, p.y + 1)) { p.t = p.life; G.FX.burst(p.x, p.y - 1, 4, { speed: .9, life: 14, size: 1, color: p.color, grav: .15, angle: -Math.PI / 2, spread: 2.4, glow: p.glow, glowR: 0 }); } } });
    };
  }
  const karezDef = {
    music: 'yd_tunnels', enemyBiome: 'yd_karez', dark: true,
    ambient: '#5a7480', shade: '#4e6874', deepShade: '#030607', bloom: 1,
    dust: ['#2a3a40', '#1a2a30', '#4a6a6a'], rock: ['#2a3a40', '#1a2228', '#5a7a7a'],
    drawSky(ctx) { ctx.fillStyle = '#04141a'; ctx.fillRect(0, 0, G.W, G.H); },
    fogBehind(ctx) { ctx.globalAlpha = .3; ctx.fillStyle = '#04161c'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; },
    lights(Light, cam, t, L) { for (const n of L.nodes || []) Light.add(n.x, n.y, 30, n.col, .45 + .15 * Math.sin(t * .8 + n.x)); },
    post: both(tint('#0a3a4a', .25), vignette('rgba(0,4,6,1)', .6)),
    ambientFx: both(drips(.35, ['#7af0e6', '#4a8a90']), fall({ rate: .04, cols: ['#7af0e6', '#5ac8d0'], vx: [-.05, .05], vy: [-.08, -.01], from: 'any', glow: true, glowR: 3, life: 300, alpha: .7 }))
  };
  V('dev_gut', 'yd_karez', {
    name: N(`The Karez|Кяриз|Koriz`), subtitle: N(`Water tunnels under the Sleeper's skin|Водяные ходы под кожей Спящего|Uxlovchining terisi ostidagi suv yo'llari`),
    def: karezDef, gradeTiles: KAREZ_TILES, gradeBg: [{ map: [[0, '#000203'], [.5, '#0a1a20'], [1, '#2a4a50']], k: .9 }],
    gen: { cols: 10, enemies: [2, 3] },
    postGen: longPostGen,
    decorate(L) { remapDecos(L, KAREZ_LOOK); }
  });

  // 15 — the Swallowed Streets
  V('ruins_under', 'yd_streets', {
    name: N(`The Swallowed Streets|Проглоченные улицы|Yutilgan ko'chalar`), subtitle: N(`Half the Tail slid down here twenty years ago|Двадцать лет назад сюда сполз пол-Хвоста|Yigirma yil oldin Dumning yarmi shu yerga sirg'alib tushgan`),
    def: { music: 'yd_deep', enemyBiome: 'yd_streets', dark: true, ambient: '#5a5068', shade: '#3e3450' },
    gen: { width: 320, enemies: [1, 3] },
    postGen: longPostGen,
    decorate(L, rng) {
      // dripping water from the ceiling
      L.drips = [];
      if (L.ceilRow) for (let x = 6; x < L.w - 6; x += rng.int(4, 9)) L.drips.push(x);
    }
  });
  W.biomes.yd_streets.ambientFx = both(W.biomes.yd_streets.ambientFx, function (world, cam) {
    const L = G.level;
    if (!L.drips || !L.ceilRow || Math.random() > .25) return;
    const tx = L.drips[Math.floor(Math.random() * L.drips.length)], x = tx * TS + 8;
    if (x < cam.x || x > cam.x + G.W) return;
    G.FX.spawn({ x, y: (L.ceilRow[tx] + 1) * TS + 1, vy: .3, grav: .14, drag: 1, life: 200, shape: 'rect', w: 1, h: 2, size: 1, color: '#7ac8d8', fade: false,
      update(p) { if (G.level.solidPx(p.x, p.y + 1)) { p.t = p.life; G.FX.burst(p.x, p.y - 1, 3, { speed: .8, life: 12, size: 1, color: '#9ae0e8', grav: .15, angle: -Math.PI / 2, spread: 2.2 }); } } });
  });

  // 18 — Old Yodgor: crimson ruins
  V('afrasiab', 'yd_old', {
    name: N(`Old Yodgor|Старый Ёдгор|Eski Yodgor`), subtitle: N(`The city erased in one night|Город, стёртый за одну ночь|Bir kechada yer yuzidan o'chgan shahar`),
    def: {
      music: 'yd_old', enemyBiome: 'yd_old', ambient: '#c88a80', shade: '#6a3a40', bloom: .85,
      post: both(G.Biomes.defs.afrasiab.post, tint('#6a0a1a', .18)),
      ambientFx: both(G.Biomes.defs.afrasiab.ambientFx, fall({ rate: .12, cols: ['#ff9a4a', '#ff6a2a', '#ffd08a'], vx: [-.2, .2], vy: [-.4, -.1], from: 'bottom', glow: true, glowR: 3, life: 300, alpha: .9, sway: .02 }))
    },
    gen: { width: 320, enemies: [1, 3] },
    postGen: longPostGen
  });

  // 19 — the Founders' Well: deep blue
  const DEEP_LOOK = { hue: 200, sat: .9, light: 1 };
  const DEEP_TILES = [{ map: [[0, '#01030c'], [.35, '#0a1a40'], [.7, '#2a5a9a'], [1, '#a8d8ff']], k: .6 }];
  const wellDef = {
    music: 'yd_well', enemyBiome: 'yd_well', dark: true, ambient: '#7484c0', shade: '#46569a', deepShade: '#02040e', bloom: 1,
    dust: ['#3a5a8a', '#2a4070', '#8ab0e0'], rock: ['#2a4070', '#1a2850', '#8ab0e0'],
    drawSky(ctx) { if (!this._wsky) { this._wsky = G.makeCanvas(G.W, G.H); Art.bandGrad(this._wsky.ctx, 0, 0, G.W, G.H, [[0, '#000006'], [.6, '#020a20'], [1, '#08204a']], 14, true); } ctx.drawImage(this._wsky, 0, 0); },
    fogBehind(ctx) { ctx.globalAlpha = .3; ctx.fillStyle = '#04102a'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; },
    post: both(tint('#1a4ad0', .28, 'soft-light', t => .8 + .2 * Math.sin(t * .7)), vignette('rgba(0,2,10,1)', .5)),
    ambientFx: fall({ rate: .14, cols: ['#bfe8ff', '#8ac8ff', '#ffffff'], vx: [-.06, .06], vy: [-.5, -.15], from: 'bottom', shape: 'ring', size: [.8, 2], life: 360, alpha: .6 })
  };
  V('ruins_under', 'yd_well', {
    name: N(`The Founders' Well|Колодец основателей|Asoschilar qudug'i`), subtitle: N(`Black water under the oldest stones|Чёрная вода под самыми старыми камнями|Eng qadimiy toshlar ostidagi qora suv`),
    def: wellDef, gradeTiles: DEEP_TILES, gradeBg: [{ map: [[0, '#000208'], [.5, '#0a1a40'], [1, '#4a7ac0']], k: .9 }],
    gen: { width: 320, enemies: [1, 3] },
    postGen: longPostGen,
    decorate(L) { remapDecos(L, DEEP_LOOK); }
  });

  // 22 — the Spine of the Sleeper: alatoo, night snow on the giant's back
  V('alatoo', 'yd_spine', {
    name: N(`The Spine of the Sleeper|Хребет Спящего|Uxlovchining umurtqasi`), subtitle: N(`Snow on the giant's back|Снег на спине великана|Devning orqasida qor`),
    def: {
      music: 'yd_spine', enemyBiome: 'yd_spine', ambient: '#6a78b0', shade: '#343c6a', deepShade: '#06081a', bloom: .9, wind: 1.4,
      drawSky: K.nightSky({ seed: 22, bands: [[0, '#02040e'], [.5, '#0c1430'], [.85, '#1e2a50'], [1, '#3a3a64']], moon: { x: 120, y: 60, r: 12 } }),
      drawForeground: null,
      post: tint('#2a4ab0', .22),
      ambientFx: fall({ rate: .7, cols: ['#ffffff', '#e8f0ff', '#c8d8f0'], vx: [.6, 1.6], vy: [.4, .9], life: 380, alpha: .85, sway: .02 })
    },
    gradeBg: [{ sat: .55 }, { mul: '#4a5aa0' }, { add: '#03051a' }],
    gen: { width: 320, enemies: [1, 3] },
    postGen: longPostGen,
    decorate(L, rng) { // cold blue glow-ice and lonely shrine lamps
      lampsOnRuns(L, rng, 28, { body: '#a8d8ff', core: '#ffffff', light: '#9ac8ff', glow: '#9ad8ff' });
    }
  });

  // 25 — the Heart: dev_gut, red and pulsing
  const beat = t => { const p = (t * 1.25) % 1; return Math.max(0, Math.sin(p * Math.PI * 2) * (p < .5 ? 1 : .4)); };
  V('dev_gut', 'yd_heart', {
    name: N(`The Heart|Сердце|Yurak`), subtitle: N(`Where the Sleeper's dreams flow back|Сюда стекаются сны Спящего|Uxlovchining tushlari shu yerga oqib keladi`),
    def: {
      music: 'yd_heart', enemyBiome: 'yd_heart', ambient: '#b07c88', shade: '#8a4a5a', deepShade: '#1a0206',
      post: both(tint('#ff1a3a', .2, 'soft-light', t => .5 + beat(t)), vignette('rgba(30,0,6,1)', .5))
    },
    gen: { cols: 10, enemies: [2, 3] },
    postGen: longPostGen
  });

  // 26 — the Dream of the City: registan, dreamlike
  const DREAM_BG = [{ map: [[0, '#10061e'], [.4, '#4a2a6a'], [.75, '#c890d0'], [1, '#fff0ff']], k: .7 }];
  const DREAM_TILES = [{ map: [[0, '#140a20'], [.45, '#5a3a7a'], [.8, '#d8a8e0'], [1, '#fff4ff']], k: .4 }];
  V('registan', 'yd_dream_city', {
    name: N(`The Dream of the City|Сон о городе|Shahar tushi`), subtitle: N(`Three hundred years of memories laid out as streets|Улицы из трёхсот лет чужой памяти|Ko'chaga aylangan uch yuz yillik xotira`),
    def: {
      music: 'yd_dream', enemyBiome: 'yd_dream', ambient: '#c8a8e0', shade: '#6a4a8a', deepShade: '#10061a', bloom: 1.1,
      drawSky: gradSky([[0, '#1a0a3a'], [.4, '#5a2a7a'], [.7, '#c070a0'], [.9, '#ffb0a0'], [1, '#ffe0c0']],
        { x: 140, y: 70, r: 22, core: '#fff4ff', rim: '#f0c8ff', halo: [[8, '#f0c8ff', .5, 0], [24, '#d0a0ff', .25, 1], [50, '#a070e0', .1, 2]] }),
      drawForeground: null,
      post: both(tint('#a040e0', .22, 'soft-light', t => .7 + .3 * Math.sin(t * .6)), vignette('rgba(20,6,30,1)', .4)),
      ambientFx: fall({ rate: .2, cols: ['#ffe0ff', '#d0b0ff', '#fff4c0', '#a0f0ff'], vx: [-.2, .2], vy: [-.25, .1], from: 'any', glow: true, glowR: 5, life: 360, alpha: .85, sway: .03 })
    },
    gradeBg: DREAM_BG, gradeTiles: DREAM_TILES,
    gen: { width: 320, enemies: [1, 3] },
    postGen: longPostGen,
    decorate(L, rng) { hangLanterns(L, rng, { cols: ['#d070c0', '#70a0e0', '#e0c060'], lightC: '#e0b0ff', glow: '#e0a0ff', every: .5 }); }
  });

  // 27 — the Drowned Wedding
  V('dream_drowned', 'yd_wedding', {
    name: N(`The Drowned Wedding|Утонувшая свадьба|Cho'kkan to'y`), subtitle: N(`A wedding two hundred years long|Свадьба длиной в двести лет|Ikki yuz yildan beri tugamagan to'y`),
    def: { music: 'yd_wedding', enemyBiome: 'yd_wedding' },
    gen: { width: 320, enemies: [1, 3] },
    postGen: longPostGen,
    decorate(L, rng) { hangLanterns(L, rng, { cols: ['#d8402a', '#e0a030', '#ff6a8a'], lightC: '#ffc090', glow: '#ffb070', every: .8 }); }
  });

  // 28 — the Year of Sand: afrasiab in a sand storm
  const SAND_BG = [{ map: [[0, '#1a1006'], [.4, '#6a4a20'], [.75, '#c8984a'], [1, '#fff0c8']], k: .7 }];
  const SAND_TILES = [{ map: [[0, '#1a1208'], [.45, '#7a5a30'], [.8, '#d8b070'], [1, '#fff4d8']], k: .35 }];
  let sandFg = null;
  V('afrasiab', 'yd_sand', {
    name: N(`The Year of Sand|Год Песка|Qum yili`), subtitle: N(`The night Old Yodgor was erased|Ночь, когда стёрли Старый Ёдгор|Eski Yodgor o'chirib tashlangan tun`),
    def: {
      music: 'yd_sand', enemyBiome: 'yd_sand', ambient: '#d8b088', shade: '#8a6440', bloom: .7, wind: 2,
      dust: ['#c8a060', '#a88040', '#e8c890'],
      drawSky: gradSky([[0, '#3a2410'], [.4, '#8a5a24'], [.75, '#c89040'], [1, '#e8c070']], { x: 300, y: 80, r: 16, core: '#fff0c0', rim: '#e0b060', halo: [[10, '#e0b060', .3, 0], [36, '#c89040', .15, 1]] }),
      fogBehind(ctx) { ctx.globalAlpha = .3; ctx.fillStyle = '#c89a5a'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; },
      drawForeground(ctx, cam, t) { // bands of blown sand
        if (!sandFg) {
          sandFg = G.makeCanvas(512, G.H);
          const c = sandFg.ctx;
          for (let i = 0; i < 1400; i++) { c.globalAlpha = U.rand(.05, .25); c.fillStyle = U.choose(['#e8c890', '#c8a060', '#fff0c8']); c.fillRect(U.randi(0, 511), U.randi(0, G.H - 1), U.randi(4, 18), 1); }
        }
        for (let k = 0; k < 2; k++) {
          const ox = -((t * (220 + 140 * k) + cam.x * (1 + k * .4)) % 512);
          ctx.globalAlpha = .55 + .25 * Math.sin(t * .7 + k);
          for (let x = ox; x < G.W; x += 512) ctx.drawImage(sandFg, RD(x), RD(Math.sin(t * .4 + k) * 6));
        }
        ctx.globalAlpha = 1;
      },
      post: both(tint('#c87a20', .22), vignette('rgba(40,20,4,1)', .45)),
      ambientFx: fall({ rate: 1.2, cols: ['#e8c890', '#c8a060', '#fff0c8', '#a88040'], vx: [2.5, 4.5], vy: [-.1, .3], from: 'side', life: 200, alpha: .8 })
    },
    gradeBg: SAND_BG, gradeTiles: SAND_TILES,
    gen: { width: 320, enemies: [1, 3] },
    postGen: longPostGen
  });

  // 30 — Your House: warm, dim, dreamy Tail
  const HOME_BG = [{ map: [[0, '#0a0604'], [.45, '#3a2414'], [.8, '#a07040'], [1, '#ffe0b0']], k: .7 }];
  V('tail_night', 'yd_house', {
    name: N(`Your House|Твой дом|Sening uying`), subtitle: N(`It smells of bread and grief|Здесь пахнет хлебом и горем|Bu yerda non va g'am hidi`),
    def: {
      music: 'yd_house', enemyBiome: 'yd_house', ambient: '#a08070', shade: '#5a4234', deepShade: '#0c0604', bloom: 1.1,
      drawSky: gradSky([[0, '#0a0608'], [.5, '#2a1810'], [.85, '#6a3a20'], [1, '#a05a2a']], { x: 80, y: 60, r: 10, core: '#fff0d0', rim: '#ffd090', halo: [[6, '#ffd090', .4, 0], [20, '#ffb060', .2, 1]] }),
      post: both(tint('#ff9a40', .22, 'soft-light', t => .8 + .2 * Math.sin(t * .5)), vignette('rgba(16,8,4,1)', .7)),
      ambientFx: fall({ rate: .15, cols: ['#ffe0a0', '#ffd090', '#fff4d0'], vx: [-.08, .08], vy: [-.12, .04], from: 'any', glow: true, glowR: 4, life: 420, alpha: .7, sway: .02 })
    },
    gradeBg: HOME_BG,
    gen: { width: 300, enemies: [1, 3] },
    postGen: longPostGen
  });

  /* ---------------- boss arenas */
  V('ruins_under', 'yd_vault', {
    name: N(`The Singers' Vault|Хранилище Певцов|Xonandalar xazinasi`), subtitle: N(`Where the tithe is kept|Здесь хранят десятину|Ushr shu yerda saqlanadi`),
    def: { music: 'yd_vault', enemyBiome: 'yd_tail', ambient: '#6a5a50', shade: '#4a3a34', post: both(tint('#ffa040', .16), vignette('rgba(10,4,2,1)', .5)) },
    arena: { w: 48, h: 22 },
    decorate(L, rng) {
      candles(L, rng, .6, { lightC: '#ffc070', lightR: 70 });
      for (let x = 5; x < L.w - 4; x += rng.int(3, 6)) L.decos.push(K.lantern(x * TS + 8, 2 * TS, { color: '#e2b452', len: rng.int(4, 40), lightR: 50, lightC: '#ffd890', glow: '#ffe2a8', glowR: 12 })); // tumars on cords
    }
  });
  V('kempir_lair', 'yd_tower', {
    name: N(`The Tower of Silence|Башня молчания|Sukunat minorasi`), subtitle: N(`Where the dead are left to the birds|Здесь мёртвых оставляют птицам|O'liklar shu yerda qushlarga qoldiriladi`),
    def: { music: 'yd_tower_wait', ambient: '#a898a8', shade: '#5a4a5a', post: both(tint('#4a3a6a', .3), vignette('rgba(10,6,14,1)', .5)),
      ambientFx: both(G.Biomes.defs.kempir_lair.ambientFx, fall({ rate: .2, cols: ['#2a2430', '#4a4048'], vx: [.1, .4], vy: [.2, .4], life: 380 })) },
    gradeSky: [{ sat: .3 }, { mul: '#8a7a9a' }, { add: '#0a0610' }], gradeBg: [{ sat: .3 }, { mul: '#8a7a9a' }, { add: '#0a0610' }], gradeTiles: [{ sat: .45 }, { mul: '#b0a4b0' }]
  });
  V('registan_square', 'yd_court', {
    name: N(`The Hound's Court|Двор Пса|Itning hovlisi`), subtitle: N(`Gold on every wall|Золото на каждой стене|Har bir devorda oltin`),
    def: { music: 'yd_palace', update: null, ambient: '#ffe0b0', shade: '#a07850', deepShade: '#2a1408', post: tint('#ffb040', .22), drawSky: gradSky([[0, '#2a1030'], [.5, '#8a3a40'], [.85, '#e0904a'], [1, '#ffd890']], { x: 240, y: 110, r: 22, core: '#fff8e0', rim: '#ffd890', halo: [[8, '#ffe0a0', .5, 0], [30, '#ffc060', .2, 1], [60, '#ff9040', .08, 2]] }) },
    gradeBg: [{ tint: '#b07028', k: .5 }], gradeTiles: [{ map: [[0, '#1a0e06'], [.4, '#6a4a1c'], [.75, '#d8a850'], [1, '#fff4d0']], k: .55 }]
  });
  V('registan_square', 'yd_choir_hall', {
    name: N(`The Hall of the Silent Choir|Зал Безмолвного хора|Sokin xor zali`), subtitle: N(`Seven mouths open, no sound|Семь открытых ртов — и ни звука|Yetti og'iz ochiq, ammo tovush yo'q`),
    def: { music: 'yd_cloister', update: null, ambient: '#a8b4e0', deepShade: '#080a1a', shade: '#4a5482', post: both(tint('#3a5ac0', .25), vignette('rgba(4,6,20,1)', .5)),
      drawSky: K.nightSky({ seed: 12, bands: [[0, '#04060e'], [.5, '#10182e'], [1, '#3a4a70']], moon: false }),
      ambientFx: fall({ rate: .2, cols: ['#ffffff', '#c8d4f0'], vx: [-.1, .1], vy: [.2, .4], life: 500, alpha: .7 }) },
    gradeBg: [{ sat: .3 }, { tint: '#8a9ad0', k: .45 }], gradeTiles: [{ sat: .35 }, { map: [[0, '#0a0e1a'], [.45, '#4a5a7a'], [.8, '#c8d2e0'], [1, '#ffffff']], k: .6 }],
    decorate(L, rng) { candles(L, rng, .6, { lightC: '#d8e4ff', lightR: 60 }); }
  });
  V('dev_gut', 'yd_cistern', {
    name: N(`The Great Cistern|Большая цистерна|Katta sardoba`), subtitle: N(`The Karez gathers here|Сюда сходится весь кяриз|Butun koriz shu yerga yig'iladi`),
    def: Object.assign({}, karezDef, { music: 'yd_cistern_wait', ambient: '#6a808a', shade: '#55707a', deepShade: '#06100f' }), gradeTiles: KAREZ_TILES, gradeBg: [{ map: [[0, '#000203'], [.5, '#0a1a20'], [1, '#2a4a50']], k: .9 }],
    arena: { w: 50, h: 24 },
    decorate(L) { remapDecos(L, KAREZ_LOOK); }
  });
  V('yd_well', 'yd_well_bottom', {
    name: N(`The Bottom of the Well|Дно Колодца|Quduq tubi`), subtitle: N(`Seven shadows around one black mirror|Семь теней вокруг чёрного зеркала|Bitta qora ko'zgu atrofida yetti soya`),
    def: { music: 'yd_well' }, arena: { w: 50, h: 22 },
    decorate(L, rng) { candles(L, rng, .7, { lightC: '#8ab8ff', lightR: 70, wax: '#c8d8f0' }); }
  });
  V('barys_shrine', 'yd_withers', {
    name: N(`The Shrine on the Withers|Святилище на холке|Yag'rindagi qadamjo`), subtitle: N(`A white guardian in a singing chain|Белый страж на поющей цепи|Kuylayotgan zanjirdagi oq qo'riqchi`),
    def: { music: 'yd_spine', wind: 1.2, ambientFx: both(G.Biomes.defs.barys_shrine.ambientFx, fall({ rate: .5, cols: ['#ffffff', '#e0ecff'], vx: [.6, 1.4], vy: [.4, .8], life: 380, alpha: .85 })) }
  });
  V('registan_square', 'yd_nest', {
    name: N(`The Nightmare's Nest|Гнездо Кошмара|Dahshat uyasi`), subtitle: N(`The bottom of the Sleeper's sleep|Самое дно сна Спящего|Uxlovchi uyqusining eng tubi`),
    def: { music: 'yd_dream', ambient: '#a07890', shade: '#5a2a40', post: both(tint('#a01040', .24), vignette('rgba(20,0,8,1)', .55)) },
    gradeBg: [{ sat: .5 }, { tint: '#6a1030', k: .5 }],
    gradeTiles: [{ map: [[0, '#0a0208'], [.45, '#4a1a3a'], [.8, '#c06a8a'], [1, '#fff0f4']], k: .4 }]
  });

  /* ---------------- rest stops: the chaikhana, lit for where it stands */
  const restLook = (id, o) => { const d = V('chaikhana', id, Object.assign({ name: N(`Chaikhana|Чайхана|Choyxona`), subtitle: N(`Tea, bread, a little warmth|Чай, лепёшка, немного тепла|Choy, non, ozgina iliqlik`) }, o)); W.rest[id] = d; return d; };
  restLook('yd_chai_dusk', {
    def: { music: 'yd_chai', ambient: '#e8c8b8', shade: '#a88078', post: tint('#c06040', .2), drawForeground: null },
    gradeSky: [{ map: [[0, '#1a1030'], [.5, '#8a4a5a'], [.85, '#e8906a'], [1, '#ffd8a0']], k: .55 }],
    gradeBg: [{ sat: .7 }, { mul: '#c8a0a0' }]
  });
  restLook('yd_chai_under', {
    def: {
      music: 'yd_chai', ambient: '#7a6458', shade: '#4a3a34', deepShade: '#0a0604', drawForeground: null, wind: 0,
      drawSky(ctx) { ctx.fillStyle = '#060404'; ctx.fillRect(0, 0, G.W, G.H); },
      fogBehind(ctx) { ctx.globalAlpha = .5; ctx.fillStyle = '#0a0606'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; },
      post: both(tint('#ff9a40', .2), vignette('rgba(6,2,0,1)', .6)), ambientFx: null
    },
    gradeBg: [{ map: [[0, '#020101'], [.6, '#1a1210'], [1, '#4a3a30']], k: .9 }],
    decorate(L, rng) { for (let x = 6; x < L.w - 4; x += 7) L.decos.push(K.lantern(x * TS + 8, 3 * TS, { color: rng.pick(['#c8302a', '#d89a2a']), len: 6, lightR: 90 })); }
  });
  restLook('yd_chai_night', {
    def: {
      music: 'yd_chai', ambient: '#7a84b0', shade: '#3a406a', drawForeground: null, wind: 1.2,
      drawSky: K.nightSky({ seed: 24, bands: [[0, '#02040e'], [.5, '#0c1430'], [1, '#2a3058']] }),
      post: tint('#2a4ab0', .2),
      ambientFx: fall({ rate: .5, cols: ['#ffffff', '#e8f0ff'], vx: [.5, 1.2], vy: [.4, .8], life: 380, alpha: .85 })
    },
    gradeBg: [{ sat: .5 }, { mul: '#4a5aa0' }, { add: '#03051a' }],
    decorate(L, rng) { for (let x = 8; x < L.w - 4; x += 9) L.decos.push(K.lantern(x * TS + 8, 3 * TS, { color: '#d89a2a', len: 5 })); }
  });
  restLook('yd_chai_dream', {
    def: { music: 'yd_dream', ambient: '#d8b8f0', shade: '#7a5a9a', drawForeground: null, post: tint('#a040e0', .25),
      ambientFx: fall({ rate: .2, cols: ['#ffe0ff', '#d0b0ff', '#fff4c0'], vx: [-.2, .2], vy: [-.25, .1], from: 'any', glow: true, glowR: 5, life: 360, alpha: .85 }) },
    gradeSky: [{ map: [[0, '#1a0a3a'], [.5, '#7a3a9a'], [.85, '#e0a0d0'], [1, '#fff0ff']], k: .6 }],
    gradeBg: DREAM_BG
  });
  // the engine always builds rests from "chaikhana": give it the look of this plan entry
  {
    const get0 = G.Biomes.get;
    G.Biomes.get = function (id) {
      if (id === 'chaikhana' && G.run && G.PLAN) {
        const p = G.PLAN[G.run.planIndex];
        if (p && p.type === 'rest' && p.look && this.defs[p.look]) return this.defs[p.look];
      }
      return get0.apply(this, arguments);
    };
  }

  /* ================================================================ enemies */
  const ED = G.Enemies.defs;
  const named = (id, name) => { if (ED[id]) ED[id].name = N(name); };
  // every stock enemy that stays in the game gets a name from the city
  const RENAME = {
    zindan_prisoner: `Hollow|Пустой|Bo'sh`,
    jailer: `Warden of the Well|Страж Колодца|Quduq qo'riqchisi`,
    rat_div: `Gutter rat|Крыса из арыка|Ariq kalamushi`,
    torch_zealot: `Tithe torchbearer|Факельщик десятины|Ushr mash'aladori`,
    bori: `Salt jackal|Соляной шакал|Tuz chiyabo'risi`,
    ghost_archer: `Shade of the Salt Road|Тень Соляной дороги|Tuz yo'li soyasi`,
    balbal_golem: `Salt idol|Соляной идол|Tuz sanami`,
    assassin: `Tumar thief|Вор тумаров|Tumar o'g'risi`,
    jinn: `Bottled dream|Сон в бутылке|Shishadagi tush`,
    guard: `Divan mercenary|Наёмник Дивана|Devonning yollanma askari`,
    snake_charmer: `Memory hawker|Разносчик памяти|Xotira sotuvchisi`,
    snake: `Bazaar cobra|Базарная кобра|Bozor kobrasi`,
    ice_div: `Frost div of the Spine|Морозный дэв Хребта|Umurtqadagi ayoz devi`,
    ibex_spirit: `Ibex of the Spine|Горный козёл Хребта|Umurtqa tog' takasi`,
    frost_shaman: `Dead Singer|Мёртвый Певец|O'lgan Xonanda`,
    berkut_wraith: `Eagle wraith|Призрачный беркут|Burgut arvohi`,
    mummy_warrior: `Buried guardsman|Погребённый стражник|Ko'milgan soqchi`,
    scorpion: `Ash scorpion|Пепельный скорпион|Kul chayoni`,
    sand_worm: `Sand worm|Песчаный червь|Qum qurti`,
    ghul: `Ghoul of Old Yodgor|Гуль Старого Ёдгора|Eski Yodgor g'uli`,
    peri: `Fallen peri|Падшая пери|Yo'ldan ozgan pari`,
    div_spearman: `Div spearman|Дэв-копейщик|Nayzador dev`,
    sher: `Palace tiger|Дворцовый тигр|Saroy yo'lbarsi`,
    tile_golem: `Wall that remembers|Помнящая стена|Eslaydigan devor`,
    kempir_crow: `Tower raven|Ворон с башни|Minora qarg'asi`,
    dummy: `Hollow debtor|Пустой должник|Bo'sh qarzdor`
  };
  for (const id in RENAME) named(id, RENAME[id]);
  // the stock albasty becomes a boss id below; her daughters keep the regular body
  const C = (base, id, name, over, look) => { const d = EK.clone(base, id, Object.assign({ name: N(name) }, over || {}), look); W.enemies[id] = d; return d; };

  // the Hollow: slow, patient, drawn to full tumars
  C('zindan_prisoner', 'yd_hollow', `Hollow drifter|Пустой бродяга|Bo'sh daydi`, { hp: 46, speed: .7, sight: 170, weight: 10 }, { sat: .25, light: .9, hue: 200 });
  {
    const d = ED.yd_hollow, upd = d.update;
    d.update = function (e) {
      upd.call(this, e);
      if (e.aggro || e.dead) return;
      if (!(e.t % 30)) {
        let best = null, bd = 320;
        for (const o of G.world.interactables) if ((o.art === 'lostMemory' || o.art === 'lostTumar') && !o.dead) { const dd = Math.abs(o.x - e.x); if (dd < bd && Math.abs(o.y - e.y) < 80) { bd = dd; best = o; } }
        e.data.tumar = best;
      }
      const o = e.data.tumar;
      if (o && !o.dead && Math.abs(o.x - e.x) > 14 && e.onGround && !e.edgeAhead() && !e.wallAhead()) { e.facing = Math.sign(o.x - e.x); e.vx = e.facing * .45; }
    };
  }
  C('jailer', 'yd_warden', `Warden of the Singers|Страж Певцов|Xonandalar qo'riqchisi`, { hp: 100 }, { hue: 160, sat: .55, light: 1.15 });
  C('torch_zealot', 'yd_acolyte', `Acolyte of the Well|Послушник Колодца|Quduq muridi`, { hp: 34 }, { hue: 170, sat: .6, light: 1.2 });
  EK.volley(ED.yd_acolyte, { count: 3, every: [170, 250], color: '#bfe8ff', glow: '#6ac8ff', speed: 3.2 });
  C('assassin', 'yd_scavenger', `Ash scavenger|Пепельный мародёр|Kul talonchisi`, { hp: 40 }, { sat: .35, light: .85 });
  C('ghost_archer', 'yd_divan_archer', `Divan archer|Лучник Дивана|Devon kamonchisi`, {}, { hue: 40, sat: 1.2, light: 1.05 });
  C('div_spearman', 'yd_gilded', `Gilded spearman|Золочёный копейщик|Zarhal nayzador`, {}, { hue: 175, sat: 1.1, light: 1.15 });
  // the guard's tunic is blue; the Divan wears crimson, its champion wears gold
  const GILT = { '#2c58b4': '#d8a030', '#1a356e': '#8a5a18', '#6a9ae8': '#ffe08a', '#a8202c': '#5a1a2a', '#561018': '#2a0a14', '#b8bccc': '#e8c060', '#8b92b2': '#b08a3a', '#eef3fa': '#fff4c0', '#2fc0c0': '#ffd040' };
  C('guard', 'yd_divan_merc', `Divan sell-sword|Мечник-наёмник Дивана|Devonning yollanma qilichbozi`, { hp: 115 }, { map: { '#2c58b4': '#8a2a2a', '#1a356e': '#4a1418', '#6a9ae8': '#c85a4a', '#2fc0c0': '#e0b040' } });
  C('albasty', 'yd_albasty_kin', `Daughter of Albasty|Дочь Албасты|Albasti qizi`, { biomes: [] }, { hue: 150, sat: .7 });
  // the Karez
  C('sand_worm', 'yd_eel', `Blind eel|Слепой угорь|Ko'r ilonbaliq`, { hp: 70 }, { sat: .2, light: 1.35 });
  C('rat_div', 'yd_leech', `Karez leech|Пиявка из кяриза|Koriz zulugi`, { hp: 26, dmg: 9 }, { hue: -40, sat: .9, light: .75 });
  EK.haste(ED.yd_leech, 1.25);
  EK.deathHazard(ED.yd_leech, { kind: 'poison', w: 20, life: 110, dmgMul: .25 });
  C('mummy_warrior', 'yd_drowned', `The Drowned|Утопленник|Suvga cho'kkan`, { hp: 88 }, { hue: 150, sat: .55, light: .95 });
  EK.deathHazard(ED.yd_drowned, { kind: 'spirit', w: 30, life: 160, dmgMul: .2 });
  // the founders' places
  C('div_spearman', 'yd_founder_guard', `Guard of the Seven|Стражник Семерых|Yettilar soqchisi`, { hp: 100 }, { sat: .25, light: .8 });
  EK.haste(ED.yd_founder_guard, 1.12);
  C('peri', 'yd_shade', `Shade of a founder|Тень основателя|Asoschi soyasi`, {}, { hue: 190, sat: .5, light: .8 });
  EK.volley(ED.yd_shade, { count: 3, every: [190, 260], color: '#9ad0ff', glow: '#4a8aff', speed: 3 });
  // the Heart and the Dream
  C('jinn', 'yd_ember', `Heart ember|Уголёк сердца|Yurak cho'g'i`, {}, { hue: -150, sat: 1.2 });
  EK.deathHazard(ED.yd_ember, { kind: 'fire', w: 26, life: 120, dmgMul: .3 });
  C('ghul', 'yd_walker', `Walking memory|Бродячее воспоминание|Daydi xotira`, { hp: 52 }, { hue: 230, sat: .7, light: 1.2 });
  EK.haste(ED.yd_walker, 1.2);
  EK.deathHazard(ED.yd_walker, { kind: 'spirit', w: 24, life: 120, dmgMul: .2 });
  C('zindan_prisoner', 'yd_guest', `Drowned guest|Гость-утопленник|Cho'kkan mehmon`, { hp: 60 }, { hue: 190, sat: .7, light: 1.05 });
  EK.deathSummon(ED.yd_guest, { id: 'yd_leech', count: 1, chance: .35, pal: 'ice' });
  C('ghul', 'yd_sand_ghul', `Sand ghoul|Песчаный гуль|Qum g'uli`, { hp: 56 }, { hue: 30, sat: .6, light: 1.1 });
  EK.haste(ED.yd_sand_ghul, 1.3);
  C('div_spearman', 'yd_nightmare', `Nightmare spawn|Порождение кошмара|Dahshat zurriyoti`, { hp: 110 }, { hue: 120, sat: .5, light: .6 });
  EK.haste(ED.yd_nightmare, 1.2);
  EK.volley(ED.yd_nightmare, { count: 4, every: [200, 280], color: '#ff6a8a', glow: '#c0204a', speed: 3.4, spread: .18 });
  C('sher', 'yd_dream_tiger', `Tiger from a child's dream|Тигр из детского сна|Bola tushidagi yo'lbars`, {}, { hue: 230, sat: .6, light: 1.1 });
  C('scorpion', 'yd_salt_scorpion', `Salt scorpion|Соляной скорпион|Tuz chayoni`, {}, { sat: .2, light: 1.4 });

  // who lives where (enemy pools keyed by biome.enemyBiome); weights per pool
  const POOLS = {
    yd_tail: [['yd_hollow', 12], ['zindan_prisoner', 4], ['rat_div', 7], ['torch_zealot', 6], ['jailer', 3]],
    yd_tail2: [['yd_hollow', 10], ['yd_scavenger', 6], ['rat_div', 6], ['assassin', 3], ['yd_warden', 3]],
    yd_salt: [['bori', 10], ['ghost_archer', 7], ['balbal_golem', 3], ['yd_salt_scorpion', 5], ['yd_warden', 4], ['yd_hollow', 3]],
    yd_bazaar: [['assassin', 9], ['guard', 6], ['snake_charmer', 5], ['jinn', 5], ['snake', 2], ['yd_hollow', 4]],
    yd_ark: [['yd_divan_merc', 8], ['yd_divan_archer', 7], ['yd_gilded', 6], ['sher', 4], ['assassin', 3]],
    yd_cloister: [['yd_warden', 8], ['yd_acolyte', 8], ['frost_shaman', 5], ['tile_golem', 3], ['yd_hollow', 3]],
    yd_karez: [['yd_eel', 7], ['yd_leech', 9], ['yd_drowned', 8], ['yd_albasty_kin', 4], ['yd_hollow', 3]],
    yd_streets: [['yd_drowned', 8], ['ghul', 7], ['yd_leech', 6], ['scorpion', 4], ['yd_divan_merc', 4], ['yd_albasty_kin', 3]],
    yd_old: [['mummy_warrior', 9], ['ghul', 8], ['scorpion', 6], ['sand_worm', 4], ['yd_founder_guard', 5]],
    yd_well: [['yd_drowned', 8], ['yd_founder_guard', 8], ['yd_shade', 6], ['berkut_wraith', 4], ['yd_eel', 4]],
    yd_spine: [['ice_div', 6], ['ibex_spirit', 8], ['berkut_wraith', 6], ['frost_shaman', 6], ['yd_albasty_kin', 3]],
    yd_heart: [['yd_ember', 7], ['yd_leech', 8], ['yd_eel', 6], ['yd_drowned', 6], ['yd_walker', 5]],
    yd_dream: [['yd_walker', 10], ['peri', 6], ['yd_dream_tiger', 5], ['tile_golem', 4], ['div_spearman', 5]],
    yd_wedding: [['yd_guest', 10], ['yd_walker', 6], ['peri', 6], ['yd_drowned', 6], ['jinn', 4]],
    yd_sand: [['yd_sand_ghul', 9], ['sand_worm', 6], ['scorpion', 6], ['mummy_warrior', 6], ['yd_founder_guard', 6]],
    yd_house: [['yd_walker', 9], ['yd_nightmare', 7], ['yd_dream_tiger', 5], ['yd_hollow', 5], ['yd_shade', 5]]
  };
  for (const pool in POOLS) for (const [id, w] of POOLS[pool]) EK.addToBiome(id, pool, w);
  W.pools = POOLS;

  /* ================================================================ bosses */
  const BOSS_NAMES = {};
  const bossName = (id, name, title) => { BOSS_NAMES[id] = { name: N(name), title: N(title) }; BK.story(id, { name: N(name), title: N(title), quote: '' }); };
  const arenaFloor = () => KIT.arena();
  // jump at the player, shockwaves both ways on landing
  const quake = (pal, color, k) => ({ w: 3, update(b, t) {
    const a = arenaFloor();
    if (t === 1) { b.data.W = b.tele(24); b.add(new KIT.Marker({ x: b.player.x, y: a.floor, w: 60, life: 60, color })); b.data.tx = b.player.x; b.data.landT = 0; }
    if (t === b.data.W) { KIT.ballistic(b, b.data.tx, a.floor, -7, 6); b.data.air = true; }
    if (t > b.data.W + 2 && b.data.air && b.onGround) {
      b.data.air = false; b.vx = 0; G.shake(.5); G.FX.shockwave(b.x, a.floor, 60, { pal: pal });
      for (const d of [-1, 1]) b.add(new KIT.Shockwave(b.x + 14 * d, a.floor, d, { pal: G.Art['FLAME_' + pal.toUpperCase()] || G.Art.FLAME_GOLD, color, dmg: (k || .7) * b.dmg, spd: 3 }));
      b.data.landT = t;
    }
    return b.data.landT && t > b.data.landT + 30 || t > 150;
  } });
  const summon = (id, max, n) => ({ w: 2, phase: 2, update(b, t) {
    b.vx *= .8;
    if (t === 1) b.tele(26);
    if (t === 26) {
      b.roar({ y: b.cy });
      const a = arenaFloor();
      for (let i = 0; i < (n || 2); i++) if (b.minionsAlive(id) < max) { const m = b.minion(id, i % 2 ? a.x0 + 30 : a.x1 - 30, a.floor); if (m && b._choir) m._choir = true; }
    }
    return t >= 60;
  } });
  const meteorRain = (kind2, n, k) => ({ w: 2, phase: 2, update(b, t) {
    b.vx *= .85;
    if (t === 1) b.data.W = b.tele(28);
    if (t === b.data.W) {
      const a = arenaFloor(), cnt = n + b.phase;
      for (let i = 0; i < cnt; i++) { const h = b.add(new KIT.Meteor(U.clamp(b.player.x + U.rand(-140, 140), a.x0 + 20, a.x1 - 20), a.floor, 20 + 14 * i, { kind2, dmg: (k || .7) * b.dmg, R: 20 })); if (b._choir && h) h._choir = true; }
    }
    return t >= (b.data.W || 28) + 70 + 14 * n;
  } });
  const fan = (n, color, glow, k) => ({ w: 2, update(b, t) {
    b.vx *= .8;
    if (t === 1) { b.data.W = b.tele(26); b.facePlayer(); }
    if (t === b.data.W || (b.phase >= 3 && t === b.data.W + 26)) {
      const x = b.x + 10 * b.facing, y = b.cy - 6, base = Math.atan2(b.player.cy - y, b.player.x - x), cnt = n + b.phase - 1;
      for (let i = 0; i < cnt; i++) {
        const a = base + .2 * (i - (cnt - 1) / 2);
        b.add(new G.Projectile({ x, y, vx: Math.cos(a) * 3.4, vy: Math.sin(a) * 3.4, r: 3, grav: 0, life: 170, dmg: (k || .6) * b.dmg, faction: 'enemy', owner: b, color, kbx: 2, kby: -1.5,
          trail: { color: glow, life: 10, size: 1, every: 2 }, light: { r: 30, color: glow, a: .5 } }));
      }
      G.Audio && G.Audio.sfx('magic', { x: b.x });
    }
    return t >= (b.data.W || 26) + 60;
  } });
  const charge = (color) => ({ w: 3, update(b, t) {
    const a = arenaFloor();
    if (t === 1) { b.data.W = b.tele(22); b.facePlayer(); b.add(new KIT.Marker({ x: b.x + b.facing * 120, y: a.floor, w: 240, life: 30, color })); }
    if (t > b.data.W && t < b.data.W + 44) {
      b.vx = 6.5 * b.facing;
      if (!(t % 3)) G.FX.dust(b.x - b.facing * 10, b.y, 2, 2);
      if (!b.data.hit && b.hitPlayer(b.attackBox(-6, -30, 34, 30), { dmg: .9 * b.dmg, kbx: 5 * b.facing, kby: -3, heavy: true })) b.data.hit = true;
      if (b.x < a.x0 + 20 || b.x > a.x1 - 20) { b.vx = 0; G.shake(.3); return true; }
    }
    if (t === b.data.W + 44) { b.vx = 0; b.data.hit = false; }
    return t >= (b.data.W || 22) + 70;
  } });

  // Prologue — the Glutton: Hollow fused around spilled relic memories
  BK.champion('jailer', 'glutton', {
    name: N(`The Glutton|Обжора|Ochko'z`), title: N(`Hollow fused around spilled memories|Пустые, сросшиеся вокруг пролитой памяти|To'kilgan xotira atrofida qorishib ketgan Bo'shlar`),
    hp: 430, dmg: 12, scale: 2.1, phaseAt: [.5], phaseNames: [null, N(`The spilled memories wake|Пролитая память просыпается|To'kilgan xotiralar uyg'onmoqda`)],
    roarColor: '#ffd77a', fxPal: 'gold', music: 'yd_boss_glutton', arena: { w: 46, h: 22 }, speedMul: .8,
    look: { sat: .3, light: 1.05, hue: 20 },
    extra: { slam: quake('gold', '#ffcf4a', .6), spill: meteorRain('sun', 2, .55), call: summon('yd_hollow', 3, 2) }
  });
  bossName('glutton', `The Glutton|Обжора|Ochko'z`, `Hollow fused around spilled memories|Пустые, сросшиеся вокруг пролитой памяти|To'kilgan xotira atrofida qorishib ketgan Bo'shlar`);

  // Act I — Yalmog'iz Kampir, harder
  BK.variant('kempir', 'kempir', { name: N(`Yalmog'iz Kampir|Ялмогиз-кампир|Yalmog'iz Kampir`), title: N(`The witch of the Tower of Silence|Ведьма Башни молчания|Sukunat minorasi jodugari`), hp: 900, music: 'yd_boss_kempir',
    phaseNames: [null, N(`The heads remember|Головы вспоминают|Boshlar eslay boshladi`), N(`Seven hungers|Семь голодных ртов|Yetti och og'iz`)] },
    { restMul: .85, teleMul: .92, weights: { rain: 1.3, crows: 1.2 } });
  bossName('kempir', `Yalmog'iz Kampir|Ялмогиз-кампир|Yalmog'iz Kampir`, `The witch of the Tower of Silence|Ведьма Башни молчания|Sukunat minorasi jodugari`);

  // Bahodir, the Gilded Hound
  BK.champion('guard', 'hound', {
    name: N(`Bahodir|Баходир|Bahodir`), title: N(`The Gilded Hound|Золотой Пёс|Oltin It`),
    hp: 820, dmg: 15, scale: 2.3, phaseAt: [.6, .3], phaseNames: [null, N(`The gold answers|Золото отвечает|Oltin javob beradi`), N(`The pack of the Divan|Свора Дивана|Devon to'dasi`)],
    roarColor: '#ffd040', fxPal: 'gold', music: 'yd_boss_hound', arena: { w: 50, h: 22 },
    look: { map: GILT },
    extra: { charge: charge('#ffcf4a'), leap: quake('gold', '#ffcf4a', .7), coins: Object.assign(fan(5, '#ffe060', '#ffb020', .5), { phase: 2 }), pack: Object.assign(summon('yd_divan_merc', 2, 1), { phase: 3 }) }
  });
  bossName('hound', `Bahodir|Баходир|Bahodir`, `The Gilded Hound|Золотой Пёс|Oltin It`);

  // the Silent Choir — its blows take memories
  BK.champion('frost_shaman', 'choir', {
    name: N(`The Silent Choir|Безмолвный хор|Sokin xor`), title: N(`Seven mouths, no sound|Семь ртов — ни звука|Yetti og'iz — tovush yo'q`),
    hp: 820, dmg: 14, scale: 2, phaseAt: [.66, .33], phaseNames: [null, N(`The choir draws breath|Хор делает вдох|Xor nafas olmoqda`), N(`The last note|Последняя нота|So'nggi nota`)],
    roarColor: '#bfe8ff', fxPal: 'ice', music: 'yd_boss_choir', arena: { w: 52, h: 22 },
    look: { sat: .25, light: 1.3, hue: 30 },
    extra: {
      hush: { w: 3, update(b, t) {
        const a = arenaFloor();
        if (t === 1) b.data.W = b.tele(26);
        if (t === b.data.W) for (const d of b.phase >= 3 ? [-1, 1] : [b.facing]) { const h = b.add(new KIT.IceCrack(b.x + 20 * d, a.floor, d, { dmg: .6 * b.dmg, owner: b })); if (h) h._choir = true; }
        b.vx *= .8;
        return t >= (b.data.W || 26) + 50;
      } },
      wail: fan(3, '#e8f4ff', '#6ac8ff', .55),
      chorus: summon('frost_shaman', 3, 2),
      shards: Object.assign(meteorRain('ice', 2, .6), { phase: 3 })
    }
  });
  {
    const d = ED.choir, setup = d.setup;
    d.setup = function (b) { setup.call(this, b); b._choir = true; };
  }
  bossName('choir', `The Silent Choir|Безмолвный хор|Sokin xor`, `Seven mouths, no sound|Семь ртов — ни звука|Yetti og'iz — tovush yo'q`);
  // hits from the Choir (and anything it sings into being) take a memory: Hollowness +2, at most once a second
  {
    const hit0 = G.Combat.hit;
    let last = -999;
    const choirSrc = s => !!s && (s._choir || (s.owner && s.owner._choir));
    G.Combat.hit = function (src, target, info) {
      const pl = G.world && G.world.player, hp0 = target && target === pl ? pl.hp : null;
      const r = hit0.apply(this, arguments);
      try {
        if (hp0 != null && pl.hp < hp0 && choirSrc(src) && G.time - last > 1 && !R().ended && G.run && G.run.mode) {
          last = G.time;
          addVoid(2, `the Choir took a memory|хор забрал воспоминание|xor bir xotirani olib ketdi`);
        }
      } catch (e) { console.error('[world] choir', e); }
      return r;
    };
  }

  // Albasty, Mother of the Karez
  BK.champion('yd_albasty_kin', 'albasty', {
    name: N(`Albasty|Албасты|Albasti`), title: N(`Mother of the Karez|Мать кяризов|Korizlar onasi`),
    hp: 880, dmg: 15, scale: 2.3, phaseAt: [.6, .3], phaseNames: [null, N(`Her daughters come|Идут её дочери|Qizlari kelyapti`), N(`The cistern rises|Вода в цистерне поднимается|Sardoba suvi ko'tarilmoqda`)],
    roarColor: '#7af0e6', fxPal: 'ice', music: 'yd_boss_water', arena: { w: 50, h: 24 },
    look: { hue: 160, sat: .6, light: .85 },
    extra: {
      tide: { w: 3, update(b, t) {
        const a = arenaFloor();
        if (t === 1) b.data.W = b.tele(26);
        if (t === b.data.W) { G.shake(.4); for (const d of [-1, 1]) b.add(new KIT.Shockwave(U.clamp(b.x, a.x0 + 30, a.x1 - 30) + 14 * d, a.floor, d, { pal: G.Art.FLAME_SPIRIT, color: '#5ff2ff', dmg: .65 * b.dmg, spd: 2.6, status: { slow: { t: 60 } } })); }
        b.vx *= .85; b.vy *= .85;
        return t >= (b.data.W || 26) + 50;
      } },
      drown: { w: 2, update(b, t) {
        const a = arenaFloor();
        if (t === 1) { b.data.W = b.tele(30); b.data.xs = [-70, 0, 70].map(dx => U.clamp(b.player.x + dx, a.x0 + 20, a.x1 - 20)); for (const x of b.data.xs) b.add(new KIT.Marker({ x, y: a.floor, w: 40, life: 34, color: '#5ff2ff' })); }
        if (t === b.data.W) for (const x of b.data.xs) { const h = EK.pool(b, x, a.floor - 4, { kind: 'spirit', w: 40, life: 240, dmgMul: .35 }); if (h) b.own && b.own(h); }
        b.vx *= .85; b.vy *= .85;
        return t >= (b.data.W || 30) + 40;
      } },
      brood: summon('yd_leech', 3, 2),
      rain: Object.assign(meteorRain('ice', 2, .6), { phase: 3 })
    }
  });
  bossName('albasty', `Albasty|Албасты|Albasti`, `Mother of the Karez|Мать кяризов|Korizlar onasi`);

  // the Seven — the founders' shades: seven heads, one hunger
  BK.variant('kempir', 'seven', {
    name: N(`The Seven|Семеро|Yettilar`), title: N(`Shades of the founders|Тени основателей|Asoschilar soyalari`), hp: 1100, music: 'yd_boss_seven',
    phaseNames: [null, N(`The caravan-bashi wake|Караван-баши просыпаются|Karvonboshilar uyg'onmoqda`), N(`The chaining song|Сковывающая песня|Kishanlovchi qo'shiq`)]
  }, {
    look: { hue: 180, sat: .45, light: 1.05 }, restMul: .82, teleMul: .9, weights: { crows: .4 },
    extra: {
      shades: { w: 2, phase: 2, update(b, t) {
        b.vx *= .8;
        if (t === 1) b.tele(26);
        if (t === 26) { const a = arenaFloor(); for (const x of [a.x0 + 40, a.x1 - 40]) if (b.minionsAlive('yd_shade') < 2) b.minion('yd_shade', x, a.floor - 30); }
        return t >= 60;
      } },
      pillars: { w: 2, phase: 2, update(b, t) {
        if (t === 1) b.tele(30);
        if (t === 30) { const a = arenaFloor(); for (let i = -2; i <= 2; i++) b.add(new KIT.Pillar(U.clamp(b.player.x + i * 60, a.x0 + 16, a.x1 - 16), a.floor, 30 + Math.abs(i) * 14, { kind2: 'sun', w: 24, dmg: .75 * b.dmg })); }
        b.vx *= .8;
        return t >= 110;
      } }
    }
  });
  bossName('seven', `The Seven|Семеро|Yettilar`, `Shades of the founders|Тени основателей|Asoschilar soyalari`);

  // Ak Bars — tuned harder
  BK.variant('barys', 'barys', { name: N(`Ak Bars|Ак Барс|Oq Bars`), title: N(`The white guardian of the Spine|Белый страж Хребта|Umurtqaning oq qo'riqchisi`), hp: 1100, music: 'yd_boss_barys',
    phaseNames: [null, N(`The chain sings|Цепь поёт|Zanjir kuylayapti`), N(`The snow remembers|Снег помнит|Qor eslaydi`)] },
    { restMul: .85, teleMul: .9, weights: { icicles: 1.4, dash: 1.2 } });
  bossName('barys', `Ak Bars|Ак Барс|Oq Bars`, `The white guardian of the Spine|Белый страж Хребта|Umurtqaning oq qo'riqchisi`);

  // Ajdaho, the Nightmare — tuned harder, darker, and it brings the night down on you
  BK.variant('aidahar', 'aidahar', { name: N(`Ajdaho|Аждахо|Ajdaho`), title: N(`The Nightmare of the Sleeper|Кошмар Спящего|Uxlovchining dahshatli tushi`), hp: 1000, music: 'yd_boss_nightmare',
    phaseNames: [null, N(`The dream burns|Сон горит|Tush yonmoqda`), N(`Three hundred years of screaming|Триста лет крика|Uch yuz yillik faryod`)] },
    { look: { hue: -25, sat: .85, light: .8 }, restMul: .86, teleMul: .92,
      extra: { nightfall: { w: 2, phase: 2, update(b, t) {
        if (t === 1) b.tele(30);
        if (t === 30) { const a = arenaFloor(); for (let i = -3; i <= 3; i++) b.add(new KIT.Pillar(U.clamp(b.player.x + i * 52, a.x0 + 16, a.x1 - 16), a.floor, 26 + Math.abs(i) * 12, { kind2: 'sun', w: 22, dmg: .7 * b.dmg })); }
        return t >= 120;
      } } } });
  bossName('aidahar', `Ajdaho|Аждахо|Ajdaho`, `The Nightmare of the Sleeper|Кошмар Спящего|Uxlovchining dahshatli tushi`);
  W.bosses = BOSS_NAMES;

  /* ================================================================ weapons, skills, perks */
  const ID = G.Items.defs;
  const ITEM_TEXT = {
    kylysh: [`Yodchi's sabre|Сабля ёдчи|Yodchi qilichi`, `A tithe collector's curved sabre. A steady three-strike chain; the last cut slams the ground and throws the enemy back.|Кривая сабля сборщика десятины. Надёжная серия из трёх ударов; последний бьёт в землю и отбрасывает врага.|Ushr yig'uvchining egri qilichi. Uch zarbali ishonchli seriya; oxirgisi yerga urilib, dushmanni uloqtirib yuboradi.`],
    aibalta: [`Karez-digger's axe|Топор кяризчи|Korizchi boltasi`, `It dug the tunnels; now it cuts men. Slow, crushing blows; the third stuns and splits the ground.|Им рыли кяризы, теперь им рубят людей. Медленные сокрушительные удары; третий оглушает и раскалывает землю.|U bilan koriz qazishgan, endi odam chopishadi. Sekin, ezib tashlaydigan zarbalar; uchinchisi gangitadi va yerni yoradi.`],
    naiza: [`Warden's spear|Копьё стража|Qo'riqchi nayzasi`, `A spear of the Well's wardens. Long thrusts; a strike with the very tip is critical.|Копьё стражей Колодца. Длинные выпады; удар самым остриём — критический.|Quduq qo'riqchilarining nayzasi. Uzun hamlalar; nayza uchi bilan zarba — kritik.`],
    kamcha: [`Caravan whip|Плеть караван-баши|Karvonboshi qamchisi`, `Kept the camels moving on the Salt Road. Long, fast lashes; a crack of the tip is critical.|Ею гнали верблюдов по Соляной дороге. Длинные быстрые удары; щелчок кончиком — критический.|U bilan Tuz yo'lida tuyalarni haydashgan. Uzun, tez zarbalar; uchi bilan shartillatish — kritik.`],
    kanjar: [`Smuggler's twin knives|Ножи контрабандиста|Kontrabandachi pichoqlari`, `Two curved knives from the Karez. A swift chain of four cuts; a blow in the back is critical.|Два кривых ножа из кяриза. Быстрая серия из четырёх ударов; удар в спину — критический.|Korizdan chiqqan ikki egri pichoq. To'rt zarbali tez seriya; orqadan urilgan zarba — kritik.`],
    shokpar: [`Mace of the Divan|Палица Дивана|Devon gurzisi`, `A studded club that settles debts. Heavy blows, the third stuns; stunned enemies take critical damage.|Кованая дубина, которой закрывают долги. Тяжёлые удары, третий оглушает; по оглушённым — критический урон.|Qarzlarni yopadigan temir gurzi. Og'ir zarbalar, uchinchisi gangitadi; gangiganlarga — kritik zarar.`],
    ketmen: [`Ketmon|Кетмень|Ketmon`, `A hoe from a Tail garden. Wide swings toss enemies up; the third ploughs the ground.|Кетмень с огорода в Хвосте. Широкие взмахи подбрасывают врагов; третий вспахивает землю.|Dumdagi tomorqadan olingan ketmon. Keng siltashlar dushmanni havoga otadi; uchinchisi yerni ag'daradi.`],
    tulpar_kylysh: [`Blade of a burning memory|Клинок горящей памяти|Yonayotgan xotira tig'i`, `Someone burned their best day into this steel. Sets enemies alight; burning ones take critical damage. The third strike sends a wave of fire.|Кто-то сжёг в этой стали свой лучший день. Поджигает врагов; по горящим — критический урон. Третий удар пускает огненную волну.|Kimdir eng yaxshi kunini shu po'latga solib yondirgan. Dushmanni yondiradi; yonayotganlarga — kritik. Uchinchi zarba olov to'lqinini yuboradi.`],
    muz_kylysh: [`Blade from the Spine|Клинок с Хребта|Umurtqadan olingan tig'`, `Cut from the ice on the Sleeper's back. Slows enemies, the third strike freezes; hitting the frozen shatters the ice (+30% damage).|Вырезан изо льда на спине Спящего. Замедляет, третий удар замораживает; удар по замёрзшему раскалывает лёд (+30% урона).|Uxlovchining orqasidagi muzdan yo'nilgan. Sekinlatadi, uchinchi zarba muzlatadi; muzlagan dushmanga zarba muzni sindiradi (+30% zarar).`],
    oraq: [`Sickle of the Tail|Серп Хвоста|Dum o'rog'i`, `For wheat, for debts. Quick cuts make enemies bleed; the third pulls them close. Critical against the badly bleeding (3+).|Для пшеницы и для долгов. Быстрые порезы пускают кровь; третий подтягивает врага. По сильно кровоточащим (3+) — критический.|Bug'doy uchun ham, qarz uchun ham. Tez kesishlar qon oqizadi; uchinchisi dushmanni tortib keladi. Qoni ko'p oqayotganlarga (3+) — kritik.`],
    sadak: [`Rabat bow|Лук Рабата|Rabot kamoni`, `A caravan guard's composite bow. Arrows that fly more than seven paces strike critically.|Составной лук караванной охраны. Стрелы, пролетевшие больше семи шагов, бьют критически.|Karvon soqchisining murakkab kamoni. Yetti qadamdan uzoqqa uchgan o'q — kritik.`],
    multuk: [`Divan musket|Мултук Дивана|Devon miltig'i`, `An old matchlock on a forked rest. Long aim, a mighty piercing shot; point-blank is critical.|Старое фитильное ружьё с сошкой. Долгое прицеливание, мощный пробивающий выстрел; в упор — критический.|Ayri tayanchli eski pilikli miltiq. Uzoq nishon, kuchli teshuvchi o'q; yaqindan — kritik.`],
    kalkan: [`Tumar shield|Щит с тумаром|Tumarli qalqon`, `A round shield with a mother's tumar sewn to the boss. Hold to block; raise it at the moment of the blow to parry: stuns, reflects projectiles, strikes back with a wave.|Круглый щит, к умбону пришит материнский тумар. Держи — блок; подними в миг удара — парирование: оглушает, отражает снаряды и бьёт волной.|O'rtasiga onaning tumari tikilgan dumaloq qalqon. Ushlab tursang — to'sadi; zarba payti ko'tarsang — qaytaradi: gangitadi, o'qlarni qaytaradi, to'lqin bilan uradi.`],
    sopak: [`Shepherd's sling|Праща пастуха|Cho'pon sopqoni`, `Whirl and loose a stone: it stuns and ricochets to the next target; ricochets are critical.|Раскрути и метни камень: он оглушает и отскакивает к следующей цели; отскоки — критические.|Aylantirib tosh ot: u gangitadi va keyingi nishonga sakraydi; sakragan tosh — kritik.`],
    zhezde: [`Singer's ring-blade|Кольцо Певца|Xonanda halqasi`, `A sharpened ring the Singers spin like a held note. Flies out and returns, cutting all in its path; critical on the way back. Press again to call it.|Заточенное кольцо: Певцы крутят его, как тянут долгую ноту. Летит и возвращается, раня всех на пути; на обратном пути — критический. Нажми снова, чтобы вернуть.|Xonandalar uzun notani cho'zgandek aylantiradigan o'tkir halqa. Uchib borib qaytadi, yo'lidagilarni yaralaydi; qaytishda — kritik. Qaytarish uchun yana bos.`],
    naphtha_pot: [`Jug of lamp oil|Кувшин лампового масла|Chiroq moyi ko'zasi`, `Oil for the Tail's lanterns, lit. Bursts into fire and leaves a burning pool.|Горящее масло для фонарей Хвоста. Разбивается огнём и оставляет горящую лужу.|Dum chiroqlarining moyi, o't qo'yilgan. Yorilib alanga oladi va yonayotgan ko'lmak qoldiradi.`],
    berkut: [`Falcon of the Ark|Сокол Арка|Ark lochini`, `A hunting falcon of the Divan, stolen. For ten seconds it dives at the nearest enemies.|Ловчий сокол Дивана, краденый. Десять секунд бьёт с лёта ближайших врагов.|Devonning o'g'irlangan ov lochini. O'n soniya eng yaqin dushmanlarga tashlanadi.`],
    spirit_wolf: [`Dog from a dream|Пёс из сна|Tushdagi it`, `A dog someone remembered too well. For nine seconds it runs down enemies, biting and slowing them.|Пёс, которого кто-то помнил слишком хорошо. Девять секунд гонит врагов, кусает и замедляет.|Kimdir juda yaxshi eslab qolgan it. To'qqiz soniya dushmanlarni quvib, tishlaydi va sekinlatadi.`],
    arkan: [`Debtor's rope|Аркан должника|Qarzdor arqoni`, `The rope the tithe men use. Catches the nearest enemy ahead, drags it to you and stuns it.|Аркан сборщиков десятины. Захлёстывает ближайшего врага впереди, подтаскивает к тебе и оглушает.|Ushr yig'uvchilarning arqoni. Oldingdagi eng yaqin dushmanni ilib, o'zingga tortadi va gangitadi.`],
    throwing_knives: [`Thief's needles|Иглы вора|O'g'ri ignalari`, `A fan of three blades from a tumar thief's sleeve. Each makes the enemy bleed.|Веер из трёх лезвий из рукава вора тумаров. Каждое пускает кровь.|Tumar o'g'risining yengidan uchgan uchta tig'. Har biri qon oqizadi.`],
    dauylpaz: [`The Singers' drum|Барабан Певцов|Xonandalar dog'arasi`, `The drum that keeps the tithe in time. A blow births a wave: throws back and stuns all around.|Барабан, под который собирают десятину. Удар рождает волну: отбрасывает и оглушает всех вокруг.|Ushr yig'ilganda chalinadigan dog'ara. Zarbadan to'lqin chiqadi: atrofdagilarni uloqtirib, gangitadi.`],
    kobyz_wail: [`Kobyz lament|Плач кобыза|Qo'biz nolasi`, `An old bakhshi's kobyz. A long note strikes in a cone ahead, wounding and slowing for a long time.|Кобыз старого бахши. Протяжная нота бьёт конусом вперёд, ранит и надолго замедляет.|Keksa baxshining qo'bizi. Cho'zilgan nota oldinga yelpig'ichdek tarqalib, yaralaydi va uzoq sekinlatadi.`],
    smoke_bomb: [`Isiriq smoke|Дым исрыка|Isiriq tutuni`, `A pouch of burning wild rue against the evil eye. Enemies in the smoke are slowed and lost; for 3 seconds all your blows are critical.|Мешочек тлеющего исрыка от сглаза. Враги в дыму замедлены и сбиты с толку; 3 секунды все твои удары — критические.|Ko'z tegmasin deb tutatilgan isiriq xaltachasi. Tutundagi dushmanlar sekinlashib adashadi; 3 soniya hamma zarbalaring — kritik.`],
    trap: [`Salt-road snare|Капкан Соляной дороги|Tuz yo'li qopqoni`, `A steel snare. The first enemy to step in is wounded, bleeds and is held fast. Up to two at once.|Стальной капкан. Первый, кто наступит, ранен, истекает кровью и надолго обездвижен. Можно поставить два сразу.|Po'lat qopqon. Birinchi bosgan dushman yaralanadi, qoni oqadi va qimirlay olmay qoladi. Bir yo'la ikkitagacha.`],
    tumar: [`Mother's tumar|Материнский тумар|Ona tumari`, `A triangle of leather and old thread. For 2.5 seconds a ward surrounds you and swallows any harm.|Треугольник из кожи и старых ниток. На 2,5 секунды тебя окружает оберег и поглощает любой урон.|Charm va eski ipdan tikilgan uchburchak. 2,5 soniya seni har qanday zararni yutadigan himoya o'rab turadi.`]
  };
  for (const id in ITEM_TEXT) if (ID[id]) { ID[id].name = N(ITEM_TEXT[id][0]); ID[id].desc = N(ITEM_TEXT[id][1]); }

  const NEW = (base, id, name, desc, patch, opts) => {
    const d = X.clone(base, id, Object.assign({ name: N(name), desc: N(desc) }, patch || {}), opts || {});
    W.items.push(id);
    return d;
  };
  // a Singer's tuning-blade: every cut carries a held note that slows
  {
    const d = NEW('kylysh', 'yd_tuning_blade', `Singer's tuning-blade|Камертон-клинок Певца|Xonandaning sozlovchi tig'i`,
      `A blade tuned to the Pledge Song. Every cut slows the enemy; a critical note stuns.|Клинок, настроенный на Песню залога. Каждый удар замедляет врага; критическая нота оглушает.|Garov qo'shig'iga sozlangan tig'. Har zarba dushmanni sekinlatadi; kritik nota gangitadi.`,
      { color: 'purple', weight: 5, minStage: 2, onAnyHit(p, target, info) { if (info.crit && target && !target.dead && target.addStatus && !target.isBoss) target.addStatus('stun', { t: 40 }); } },
      { speedMul: .9, dmgMul: .95, recolor: { hue: 150, sat: .8, minSat: .05, map: { '#d4ddf0': '#bff4ff' } } });
    for (const st of X.steps(d)) st.status = Object.assign({}, st.status, { slow: { t: 70 } });
  }
  // a smuggler's hooked knife: fast, every cut bleeds, crits pull
  {
    const d = NEW('kanjar', 'yd_hook_knife', `Smuggler's hooked knife|Крюк-нож контрабандиста|Kontrabandachining ilmoqli pichog'i`,
      `Made for cutting tumar cords in a crowd. Every cut bleeds; the fourth hooks the enemy closer.|Им срезают тумары с шеи в толпе. Каждый порез кровоточит; четвёртый подтягивает врага.|Olomonda tumar iplarini kesish uchun. Har kesik qon oqizadi; to'rtinchisi dushmanni tortib keladi.`,
      { color: 'green', color2: 'purple', weight: 5, minStage: 3 }, { dmgMul: 1.05, recolor: { hue: -60, sat: .7, minSat: .05 } });
    for (const st of X.steps(d)) st.status = Object.assign({}, st.status, { bleed: { t: 180, dps: 2, max: 5 } });
    if (d.combo && d.combo[3]) Object.assign(d.combo[3], { kbx: -2.5 });
  }
  // a gilded glaive of the Divan
  NEW('naiza', 'yd_divan_glaive', `Gilded glaive of the Divan|Позолоченная глефа Дивана|Devonning zarhal nayzasi`,
    `Gold leaf over old iron. Long, heavy thrusts that stagger; tip strikes are critical.|Сусальное золото поверх старого железа. Длинные тяжёлые выпады сбивают с ног; удары остриём — критические.|Eski temir ustiga varaq oltin qoplangan. Uzun, og'ir hamlalar oyoqdan qoqadi; uchi bilan zarba — kritik.`,
    { color: 'red', color2: 'purple', weight: 4, minStage: 4, priceMul: 1.2 }, { dmgMul: 1.18, speedMul: 1.1, recolor: { hue: 50, sat: 1.4, minSat: .05, map: { '#d4ddf0': '#ffe08a' } } });
  for (const st of X.steps(ID.yd_divan_glaive)) { st.stun = Math.max(st.stun || 0, 14); st.kbx = (st.kbx || 2) * 1.3; }
  // a whip of blind-eel skin: poisons
  {
    const d = NEW('kamcha', 'yd_eel_whip', `Whip of blind-eel skin|Плеть из кожи слепого угря|Ko'r ilonbaliq terisidan qamchi`,
      `Pale, wet, it never dries. Long lashes that poison; the crack of the tip is critical.|Бледная, мокрая, никогда не просыхает. Длинные удары отравляют; щелчок кончиком — критический.|Oqish, ho'l, hech qachon qurimaydi. Uzun zarbalar zaharlaydi; uchi bilan shartillatish — kritik.`,
      { color: 'purple', color2: 'green', weight: 5, minStage: 5 }, { recolor: { sat: .2, light: .25, minSat: 0 } });
    for (const st of X.steps(d)) st.status = Object.assign({}, st.status, { poison: { t: 200, dps: 2, max: 5 } });
  }
  // the founders' sabre: drinks the life of what it cuts
  NEW('tulpar_kylysh', 'yd_founder_sabre', `Sabre of the Seven|Сабля Семерых|Yettilar qilichi`,
    `Drawn by a caravan-bashi three hundred years ago. Burns like its maker's greed; every critical cut gives back a little life.|Её выхватил из ножен караван-баши триста лет назад. Жжёт, как жадность хозяина; каждый критический удар возвращает немного жизни.|Uch yuz yil oldin uni bir karvonboshi qinidan sug'urgan. Egasining ochko'zligidek kuydiradi; har kritik zarba ozgina jon qaytaradi.`,
    { weight: 3, minStage: 7, priceMul: 1.3, onAnyHit(p, target, info) { if (info.crit && p && p.hp > 0) p.heal(Math.max(1, Math.round(p.maxHp * .02))); } },
    { dmgMul: 1.12, recolor: { hue: 190, sat: .7, minSat: .05 } });
  // a tumar sling: every stone that lands gives back a sliver of health
  {
    const d = NEW('sopak', 'yd_tumar_sling', `Tumar sling|Праща с тумарами|Tumarli sopqon`,
      `Slings old tumars instead of stones; each one that lands breaks and gives you back a little life. Stuns and ricochets like a stone.|Мечет старые тумары вместо камней; каждый, что попал, лопается и возвращает немного жизни. Оглушает и отскакивает, как камень.|Tosh o'rniga eski tumarlarni otadi; tekkani yorilib, ozgina jon qaytaradi. Toshdek gangitadi va sakraydi.`,
      { weight: 5, minStage: 2, onAnyHit(p) { if (p && p.hp > 0) p.heal(1); } }, { recolor: { hue: 40, sat: 1.3, minSat: .05 } });
    const fire0 = d.fire;
    d.fire = function (pl, item, ws) {
      const n0 = G.world.ents.length;
      const r = fire0.call(this, pl, item, ws);
      for (let i = n0; i < G.world.ents.length; i++) { const e = G.world.ents[i]; if (e instanceof G.Projectile && e.owner === pl) { e.info = Object.assign({}, e.info, { item }); e.color = '#e2b452'; } }
      return r;
    };
  }
  // Burn: a memory flares into power and is gone forever
  {
    const drum = ID.dauylpaz;
    NEW('dauylpaz', 'yd_burn', `Burn|Сжечь|Yondirish`,
      `Burn one of your own memories: a blast of white fire throws back and stuns all around and sets them alight. Strong. Each use costs Hollowness +3.|Сожги одно из своих воспоминаний: вспышка белого огня отбрасывает, оглушает и поджигает всех вокруг. Сильно. Каждый раз — Пустота +3.|Xotiralaringdan birini yondir: oq olov chaqnab, atrofdagilarni uloqtiradi, gangitadi va yondiradi. Kuchli. Har safar — Bo'shliq +3.`,
      { color: 'red', color2: 'purple', weight: 4, minStage: 1, cooldown: 540, priceMul: .8,
        canUse() {
          if (R().ended) return t(`Not now|Не сейчас|Hozir emas`);
          if (R().void + 3 >= VOID_MAX) return t(`Nothing left to burn|Больше нечего сжигать|Yondiradigan hech narsa qolmadi`);
          return true;
        },
        use(p, item, ws) {
          drum.use.call(this, p, item, ws);
          G.Combat.area(p, { x: p.x - 70, y: p.y - 60, w: 140, h: 70 }, () => ({ dmg: G.Combat.playerDmg(item, 10), status: { burn: { t: 180, dps: 5 } }, type: 'magic', skill: true, item }), new Set());
          G.FX.ring(p.x, p.y - 14, 6, 80, '#ffffff', 18, { width: 3 });
          G.FX.flash('#fff4e0', .25);
          R().burns = (R().burns || 0) + 1;
          addVoid(3, `a memory burned|сгорело воспоминание|bir xotira yonib ketdi`);
        } },
      { dmgMul: 1.6, recolor: { hue: 30, sat: .3, light: .2, minSat: .05 } });
  }
  // Alla: the lullaby as a weapon — a soft cone that slows, and a little warmth back
  {
    const kob = ID.kobyz_wail;
    NEW('kobyz_wail', 'yd_alla', `Alla|Алла|Alla`,
      `Hum the lullaby. The note goes out in a cone, slowing and wounding; you mend a little (6% health).|Напеваешь колыбельную. Нота расходится конусом, замедляет и ранит, а ты немного приходишь в себя (6% здоровья).|Alla aytib xirgoyi qilasan. Ovoz yelpig'ichdek tarqalib, sekinlatadi va yaralaydi; o'zing ozgina tuzalasan (6% sog'liq).`,
      { color: 'green', weight: 4, minStage: 3, cooldown: 600, use(p, item, ws) { kob.use.call(this, p, item, ws); p.heal(Math.round(p.maxHp * .06)); } },
      { dmgMul: .8, recolor: { hue: 120, sat: .8, minSat: .05 } });
  }

  // perks: the bakhshi's songs
  const PD = G.Perks.defs;
  const PERK_TEXT = {
    bori_rage: [`Jackal's hunger|Голод шакала|Chiyabo'ri ochligi`, `After each kill you deal 35% more damage for 5 seconds.|После каждого убийства 5 секунд бьёшь на 35% сильнее.|Har o'ldirgandan keyin 5 soniya 35% kuchliroq urasan.`],
    kumis_grandma: [`Grandmother's spring|Бабушкин родник|Buvining bulog'i`, `+1 flask of the Sleeper's spring water. All flasks are refilled at once.|+1 фляга воды из родников Спящего. Все фляги сразу наполняются.|Uxlovchi buloqlaridan +1 idish suv. Hamma idishlar darhol to'ladi.`],
    silk_luck: [`Silk Road luck|Удача Шёлкового пути|Ipak yo'li omadi`, `You find 50% more tilla.|Тиллы находишь на 50% больше.|50% ko'proq tilla topasan.`],
    berkut_shadow: [`Falcon's shadow|Тень сокола|Lochin soyasi`, `Each roll shortens skill cooldowns by 1 second (once a second at most).|Каждый перекат сокращает перезарядку приёмов на 1 секунду (не чаще раза в секунду).|Har dumalash usullar tiklanishini 1 soniyaga qisqartiradi (soniyasiga bir martadan ko'p emas).`],
    tulpar_blood: [`Roof-runner|Бегущий по крышам|Tomdan-tomga`, `Running speed +15%.|Скорость бега +15%.|Yugurish tezligi +15%.`],
    ancestors: [`The Sleeper's mercy|Милость Спящего|Uxlovchining marhamati`, `Once a journey, when struck a deadly blow, you rise again with 35% health.|Раз за поход смертельный удар не убивает: ты встаёшь с 35% здоровья.|Safarda bir marta halokatli zarbadan so'ng 35% sog'liq bilan qaytadan turasan.`],
    stone_skin: [`Salt skin|Соляная кожа|Tuz terisi`, `Damage taken −20%.|Получаемый урон −20%.|Olinadigan zarar −20%.`],
    mergen_eye: [`Yodchi's eye|Глаз ёдчи|Yodchi ko'zi`, `Any blow has a 15% chance to be critical.|Любой удар может стать критическим (шанс 15%).|Har qanday zarba 15% ehtimol bilan kritik bo'ladi.`],
    fire_blood: [`Burning memory|Горящая память|Yonayotgan xotira`, `Melee blows have a 25% chance to set the enemy alight.|Удары в ближнем бою с шансом 25% поджигают врага.|Yaqin jangdagi zarbalar 25% ehtimol bilan dushmanni yondiradi.`],
    steppe_wind: [`Desert wind|Ветер пустыни|Cho'l shamoli`, `Skill cooldowns −25%.|Перезарядка приёмов −25%.|Usullar tiklanishi −25%.`],
    third_jump: [`Third step on the air|Третий шаг по воздуху|Havodagi uchinchi qadam`, `One more jump in the air.|Дополнительный прыжок в воздухе.|Havoda yana bir sakrash.`],
    korkyt_song: [`The bakhshi's song|Песня бахши|Baxshi qo'shig'i`, `A parry heals 8% health, a last-moment dodge 4%.|Парирование лечит 8% здоровья, уклонение в последний миг — 4%.|Qaytarish 8% sog'liq tiklaydi, so'nggi lahzada chetlanish — 4%.`],
    vampire_tamga: [`Tithe of blood|Десятина крови|Qon ushri`, `Every kill restores 4% health.|Каждое убийство возвращает 4% здоровья.|Har o'ldirish 4% sog'liq qaytaradi.`],
    batyr_wrath: [`Ravshan's wrath|Гнев Равшана|Ravshan g'azabi`, `Below 40% health you deal 40% more damage.|Когда здоровья меньше 40%, бьёшь на 40% сильнее.|Sog'lig'ing 40% dan kam bo'lsa, 40% kuchliroq urasan.`],
    tengri_tamga: [`Seal of the Well|Печать Колодца|Quduq muhri`, `Skills, summoned beasts, bombs and snares deal 40% more damage.|Приёмы, призванные звери, бомбы и капканы наносят на 40% больше урона.|Usullar, chaqirilgan jonivorlar, bombalar va qopqonlar 40% ko'proq zarar beradi.`],
    blood_tamga: [`Red tamga|Красная тамга|Qizil tamg'a`, `Critical blows make the enemy bleed.|Критические удары пускают кровь.|Kritik zarbalar qon oqizadi.`],
    barys_heart: [`Heart of Ak Bars|Сердце Ак Барса|Oq Bars yuragi`, `Maximum health +25%.|Максимальное здоровье +25%.|Sog'liq chegarasi +25%.`]
  };
  for (const id in PERK_TEXT) if (PD[id]) { PD[id].name = N(PERK_TEXT[id][0]); PD[id].desc = N(PERK_TEXT[id][1]); }
  // two new songs
  X.perk({ id: 'yd_apricot', name: N(`Apricot stones|Абрикосовые косточки|O'rik danaklari`),
    desc: N(`Dry apricot stones that rattle in a pocket, kept for luck. At the start of every land you mend 15% health.|Сухие абрикосовые косточки гремят в кармане — на счастье. В начале каждой земли восстанавливаешь 15% здоровья.|Cho'ntakda shaqillaydigan quruq o'rik danaklari — omad uchun. Har bir yer boshida 15% sog'liq tiklanadi.`),
    icon: X.perkIcon(c => { c.fillStyle = '#e8a040'; c.beginPath(); c.ellipse(-3, 1, 4, 5, -.4, 0, 7); c.fill(); c.fillStyle = '#c87a2a'; c.beginPath(); c.ellipse(4, -1, 3.5, 4.5, .5, 0, 7); c.fill(); c.fillStyle = '#ffd890'; c.fillRect(-4, -2, 1, 2); }),
    onStageStart(plan) { const p = G.world && G.world.player; if (p && plan && plan.type !== 'rest') p.heal(Math.round(p.maxHp * .15)); } });
  X.perk({ id: 'yd_salt_ward', name: N(`Salt on the threshold|Соль на пороге|Ostonadagi tuz`),
    desc: N(`Salt keeps the hungry out. Damage taken in a lair fight −15%.|Соль не пускает в дом голодных. В бою в логове получаешь на 15% меньше урона.|Tuz ochlarni uyga kiritmaydi. Uyadagi jangda 15% kam zarar olasan.`),
    icon: X.perkIcon(c => { c.fillStyle = '#f4f0e8'; c.beginPath(); c.moveTo(-6, 5); c.lineTo(6, 5); c.lineTo(0, -5); c.closePath(); c.fill(); c.fillStyle = '#c8c0b0'; c.fillRect(-6, 5, 12, 2); }),
    mods: { dmgIn: v => (G.Game.boss && !G.Game.boss.dead && G.Game.stage && G.Game.stage.bossStarted ? v * .85 : v) } });
  W.perks = ['yd_apricot', 'yd_salt_ward'];

  /* ================================================================ music */
  if (MU) {
    const tryM = (what, f) => { try { f(); } catch (e) { console.warn('[world] music', what, e && e.message); } };
    const DARK = { j: null, J: null, c: null, T: ['tom', .55], t: ['tek', .2] };
    const vr = (base, name, o) => tryM(name, () => MU.variant(base, name, o));
    // darker versions of the engine's own tracks
    vr('bukhara', 'yd_ash', { bpm: 76, transpose: -3, mode: 'phrygian', drums: DARK, buses: { pc: { lp: 1400, wet: .25 }, bdL: { mute: true }, bdR: { mute: true }, pad: { mute: true } }, voices: { wet: .3 }, tone: { lp: 3800 }, layers: [{ drone: 28, g: .1, lp: 2.5, wet: .6 }, { wind: .05 }] });
    vr('steppe', 'yd_salt', { bpm: 84, transpose: -2, mode: 'phrygian', drums: { j: null, J: null, c: null }, voices: { wet: .35 }, tone: { lp: 3400 }, layers: [{ wind: .08 }, { drone: 33, g: .08, lp: 2.5, wet: .5 }] });
    vr('bazaar', 'yd_bazaar', { bpm: 88, mode: 'hijaz', drums: { j: null, c: null }, voices: { wet: .3 }, tone: { lp: 3200 }, layers: [{ crackle: .04 }, { drone: 31, g: .07, lp: 2.5, wet: .45 }] });
    vr('zindan', 'yd_deep', { transpose: -2, tone: { lp: 2400 }, layers: [{ wind: .04 }, { fx: ['drip', 'plunk'], count: [1, 2], pitch: [.5, .75, 1], wet: .9, echo: .45 }] });
    vr('afrasiab', 'yd_old', { bpm: 70, mode: 'phrygian', drums: DARK, voices: { wet: .35 }, tone: { lp: 3000 }, layers: [{ drone: 29, g: .1, lp: 2.5, wet: .55 }, { wind: .05 }] });
    vr('alatoo', 'yd_spine', { bpm: 66, transpose: -2, mode: 'aeolian', drums: { j: null, J: null }, voices: { wet: .4 }, tone: { lp: 3200 }, layers: [{ wind: .09 }] });
    vr('registan', 'yd_sand', { bpm: 92, mode: 'hijaz', voices: { wet: .3 }, tone: { lp: 3000 }, layers: [{ wind: .12 }, { drone: 30, g: .09, lp: 2.5, wet: .45 }] });
    vr('chaikhana', 'yd_chai', { bpm: 72, mode: 'dorian', drums: { j: null, J: null, c: null }, voices: { wet: .35 }, tone: { lp: 3400 } });
    vr('chaikhana', 'yd_wedding', { bpm: 64, transpose: -1, mode: 'hijaz', drums: { j: null, J: null }, voices: { wet: .6 }, tone: { lp: 1700 }, layers: [{ drone: 30, g: .08, lp: 2, wet: .7 }, { fx: ['drip', 'plunk'], count: [0, 2], pitch: [.5, .75], wet: .9, echo: .5 }] });
    vr('title', 'yd_house', { bpm: 60, mode: 'aeolian', drums: { j: null, J: null, c: null }, voices: { wet: .5 }, tone: { lp: 2600 }, layers: [{ crackle: .03 }] });
    vr('victory', 'yd_victory', { bpm: 70, mode: 'dorian', voices: { wet: .4 }, tone: { lp: 3600 } });
    vr('death', 'yd_death', { transpose: -2, tone: { lp: 2000 }, layers: [{ wind: .05 }] });
    vr('arena', 'yd_boss_glutton', { transpose: -2, mode: 'phrygian', tone: { lp: 3400 }, layers: [{ drone: 28, g: .12, lp: 2.5, wet: .5 }] });
    vr('boss_kempir', 'yd_boss_kempir', { transpose: -1, mode: 'phrygian', tone: { lp: 3600 }, layers: [{ drone: 29, g: .1, lp: 2.5, wet: .5 }, { wind: .04 }] });
    vr('boss_aidahar', 'yd_boss_hound', { bpm: 128, mode: 'hijaz', tone: { lp: 4200 } });
    vr('boss_barys', 'yd_boss_choir', { bpm: 92, mode: 'phrygian', drums: { j: null, J: null, c: null, D: .5, d: .5 }, voices: { wet: .6 }, tone: { lp: 2600 },
      layers: [{ pad: [[50, 53, 57], [49, 53, 56], [47, 50, 54], [45, 49, 52]], choir: true, every: 2, hold: 2, level: .11, att: 1.5, rel: 2.5 }] });
    vr('boss_kempir', 'yd_boss_seven', { transpose: -3, mode: 'phrygian', tone: { lp: 3000 }, layers: [{ drone: 26, ot: 4, harm: [6, 7, 6, 5], g: .12, lp: 2.5, wet: .5 }] });
    vr('boss_barys', 'yd_boss_barys', { mode: 'aeolian', tone: { lp: 3800 }, layers: [{ wind: .06 }] });
    vr('boss_aidahar', 'yd_boss_nightmare', { transpose: -1, mode: 'phrygian', tone: { lp: 3600 }, layers: [{ drone: 26, g: .12, lp: 2.5, wet: .5 }, { pad: [[38, 41, 45], [37, 41, 44]], choir: true, every: 2, hold: 2, level: .08, att: 1.5, rel: 2.5 }] });
    // new tracks as data
    tryM('yd_cloister', () => MU.define('yd_cloister', { bpm: 50, root: 50, mode: 'aeolian', vol: .95, echoBeats: 1.5, form: 'A:8 B:8', layers: [
      { drone: 38, g: .12, lp: 2.5, wet: .6 },
      { wind: .03 },
      { pad: [[50, 53, 57], [48, 52, 55], [46, 50, 53], [45, 48, 52]], choir: true, every: 2, hold: 2, level: .12, att: 2, rel: 3 },
      { bells: [0, 3, 7], oct: 1, chance: .3, every: 4, gain: [.12, .25] },
      { voice: 'ney', root: 62, in: 'B', g: .5, pan: .2, wet: .6, echo: .3, phrase: '0:16~ 2:8 3:8 | 2:16 0:16 | -1:8 0:8 2:16~ | 0:32' }
    ] }));
    tryM('yd_well', () => MU.define('yd_well', { bpm: 46, root: 40, mode: 'phrygian', vol: .95, form: 'A:8 B:8', layers: [
      { drone: 28, ot: 4, harm: [6, 7, 6, 5], breath: 4, g: .18, lp: 2.5, wet: .5 },
      { wind: .03 },
      { fx: ['drip', 'plunk'], count: [1, 3], pitch: [.5, .75, 1], wet: .9, echo: .45 },
      { voice: 'kobyz_dark', root: 52, in: 'B', g: .7, wet: .5, phrase: '0:32~ | 1:16 0:16 | -1:24 0:8 | -2:32' }
    ] }));
    tryM('yd_heart', () => MU.define('yd_heart', { bpm: 62, root: 38, mode: 'phrygian', vol: 1, form: 'A:8 B:8', layers: [
      { drums: 'H.......H.......', g: .9, lp: 900 },
      { drone: 26, g: .2, lp: 2, sub: .8, wet: .4 },
      { pad: [[38, 41, 45], [37, 41, 44]], every: 2, hold: 2, level: .08, att: 1.5, rel: 2.5, in: 'B' },
      { voice: 'kobyz_dark', root: 50, g: .6, wet: .5, in: 'B', phrase: '0:8 1:8 0:16~ | -1:16 0:16' }
    ] }));
    // where each track plays
    MU.remap({ title: 'yd_title', chaikhana: 'yd_chai', death: 'yd_death', victory: 'yd_victory' });
    const AT = { yd_vault: 'yd_tunnels', yd_tower: 'yd_ash', yd_cistern: 'yd_tunnels', yd_court: 'yd_palace', yd_choir_hall: 'yd_cloister', yd_well_bottom: 'yd_well', yd_withers: 'yd_spine', yd_nest: 'yd_dream' };
    for (const id in AT) tryM(id, () => MU.biome(id, AT[id]));
    W.music = { remap: MU.remaps, arenas: AT };
  }

  /* ================================================================ the plan */
  K.setPlan([
    { type: 'level', id: 'p_tail', act: 0, biome: 'yd_tail_night' },
    { type: 'boss', id: 'b_vault', act: 0, biome: 'yd_vault', boss: 'glutton' },
    { type: 'rest', id: 'r_plane', act: 1, look: 'yd_chai_dusk' },
    { type: 'level', id: 'a1_tail', act: 1, biome: 'yd_tail_dawn' },
    { type: 'level', id: 'a1_rabat', act: 1, biome: 'yd_salt' },
    { type: 'boss', id: 'b_tower', act: 1, biome: 'yd_tower', boss: 'kempir' },
    { type: 'rest', id: 'r_salt', act: 1, look: 'yd_chai_dusk' },
    { type: 'level', id: 'a1_bazaar', act: 1, biome: 'yd_bazaar_night' },
    { type: 'level', id: 'a1_ark', act: 1, biome: 'yd_ark' },
    { type: 'boss', id: 'b_court', act: 1, biome: 'yd_court', boss: 'hound' },
    { type: 'rest', id: 'r_ark', act: 1, look: 'yd_chai_dusk' },
    { type: 'level', id: 'a1_cloister', act: 1, biome: 'yd_cloister' },
    { type: 'boss', id: 'b_choir', act: 1, biome: 'yd_choir_hall', boss: 'choir' },
    { type: 'rest', id: 'r_den', act: 2, look: 'yd_chai_under' },
    { type: 'level', id: 'a2_karez', act: 2, biome: 'yd_karez' },
    { type: 'level', id: 'a2_streets', act: 2, biome: 'yd_streets' },
    { type: 'boss', id: 'b_cistern', act: 2, biome: 'yd_cistern', boss: 'albasty' },
    { type: 'rest', id: 'r_lamp', act: 2, look: 'yd_chai_under' },
    { type: 'level', id: 'a2_old', act: 2, biome: 'yd_old' },
    { type: 'level', id: 'a2_well', act: 2, biome: 'yd_well' },
    { type: 'boss', id: 'b_seven', act: 2, biome: 'yd_well_bottom', boss: 'seven' },
    { type: 'rest', id: 'r_rib', act: 2, look: 'yd_chai_under' },
    { type: 'level', id: 'a2_spine', act: 2, biome: 'yd_spine' },
    { type: 'boss', id: 'b_shrine', act: 2, biome: 'yd_withers', boss: 'barys' },
    { type: 'rest', id: 'r_spine', act: 2, look: 'yd_chai_night' },
    { type: 'level', id: 'a2_heart', act: 2, biome: 'yd_heart' },
    { type: 'level', id: 'a3_dream', act: 3, biome: 'yd_dream_city' },
    { type: 'level', id: 'a3_wedding', act: 3, biome: 'yd_wedding' },
    { type: 'level', id: 'a3_sand', act: 3, biome: 'yd_sand' },
    { type: 'rest', id: 'r_dream', act: 3, look: 'yd_chai_dream' },
    { type: 'level', id: 'a3_house', act: 3, biome: 'yd_house' },
    { type: 'boss', id: 'b_nightmare', act: 3, biome: 'yd_nest', boss: 'aidahar' },
    { type: 'victory', id: 'victory' }
  ]);
  // the last fight is about stage 10 (stock peak 8); mode multipliers come later from G.ADJUST_DIFF
  K.difficulty = K.linearDifficulty(10);
  W.planIndex = id => G.PLAN.findIndex(p => p.id === id);


})();
