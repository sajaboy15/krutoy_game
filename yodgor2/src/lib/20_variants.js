/* Three cheap "new locations" built from existing biomes with G.BiomeKit (load biomekit.js first).
 *   tail_night     — from bukhara:  night, moon + stars, darkened parallax with lit windows, lanterns everywhere, fireflies
 *   dream_drowned  — from registan: the city under water: blue gradient-mapped tiles and parallax, wobble, caustics, bubbles
 *   ruins_under    — from afrasiab: same ruins with a cave ceiling, rock back walls, deep-cave parallax, torches, crystals
 */
(function () {
  'use strict';
  const G = window.G, K = G.BiomeKit, U = G.U, TS = G.TS, T = G.T, Art = G.Art, PK = G.PixKit;
  if (!K) { console.error('[variants] load biomekit.js first'); return; }
  const R = Math.round;

  /* ================================================================ tail_night (bukhara at night) */
  const NIGHT_BG = K.grade([{ sat: .5 }, { mul: '#46528c' }, { add: '#05071a' }]);
  const NIGHT_FG = K.grade([{ mul: '#30385a' }]);
  // warm lit windows sprinkled over building silhouettes (on our own graded copy, once)
  function addWindows(cv, seed) {
    if (cv.__win) return; cv.__win = true;
    const ctx = cv.getContext('2d'), w = cv.width, h = cv.height, img = ctx.getImageData(0, 0, w, h), d = img.data, rng = U.RNG(seed);
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] > 200;
    const n = Math.floor(w * h / 260);
    for (let i = 0; i < n; i++) {
      const x = rng.int(2, w - 5), y = rng.int(8, h - 6), ww = rng.chance(.5) ? 2 : 1, tall = rng.chance(.6) ? 3 : 2;
      if (!(solid(x - 1, y - 2) && solid(x + ww, y + tall + 1) && solid(x - 1, y + tall) && solid(x + ww, y - 1))) continue;
      const c = rng.pick([[255, 207, 122], [255, 178, 90], [255, 230, 170], [255, 160, 80]]);
      for (let yy = 0; yy < tall; yy++) for (let xx = 0; xx < ww; xx++) { const k = ((y + yy) * w + x + xx) * 4; d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; }
    }
    ctx.putImageData(img, 0, 0);
  }
  // string of small bulbs between two points (catenary) — one light in the middle, glows per bulb
  function garland(x0, y0, x1, y1, sag, seed) {
    const n = Math.max(3, Math.floor(Math.abs(x1 - x0) / 14)), cols = ['#ffcf6a', '#ff7a4a', '#7ae0ff', '#ffe9a8'];
    const pt = (k, t) => { const u = k / n; return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u) + Math.sin(t * 1.3 + seed + u * 3) * .8]; };
    return {
      x: (x0 + x1) / 2, y: (y0 + y1) / 2 + sag, r: Math.abs(x1 - x0) / 2 + 30, layer: 'back',
      light: { r: Math.min(110, Math.abs(x1 - x0) * .6), color: '#ffb868', a: .6, flicker: true },
      draw(ctx, t) {
        ctx.fillStyle = '#1a1210';
        for (let k = 0; k < n * 4; k++) { const [x, y] = pt(k / 4, t); ctx.fillRect(R(x), R(y), 1, 1); }
        for (let k = 1; k < n; k++) { const [x, y] = pt(k, t); ctx.fillStyle = cols[(k + seed) % cols.length]; ctx.fillRect(R(x) - 1, R(y) + 1, 2, 2); }
      },
      fx(ctx, t) {
        for (let k = 1; k < n; k++) { const [x, y] = pt(k, t); G.Glow.add(x, y + 2, 8, cols[(k + seed) % cols.length], .55 + .25 * Math.sin(t * 3 + k)); }
      }
    };
  }
  // street lamp on a pole (static art is drawn every frame here; it is tiny)
  function streetLamp(x, y, ph) {
    return {
      x, y: y - 34, r: 60, layer: 'back', light: { r: 86, color: '#ffb060', a: .95, flicker: true },
      draw(ctx, t) {
        ctx.fillStyle = '#20160f'; ctx.fillRect(R(x), y - 32, 2, 32); ctx.fillRect(R(x) - 3, y - 2, 8, 2);
        ctx.fillStyle = '#3a2a1a'; ctx.fillRect(R(x) - 3, y - 40, 8, 2); ctx.fillRect(R(x) - 2, y - 31, 6, 1);
        ctx.fillStyle = '#ffd88a'; ctx.fillRect(R(x) - 2, y - 38, 6, 7);
        ctx.fillStyle = '#fff4cc'; ctx.fillRect(R(x), y - 36, 2, 4);
      },
      fx(ctx, t) { G.Glow.add(x + 1, y - 35, 26, '#ffb24a', .6 + .1 * Math.sin(t * 7 + ph)); }
    };
  }
  K.variant('bukhara', 'tail_night', {
    name: 'Хвост. Ночь', subtitle: 'Фонари над крышами бедняков',
    def: {
      ambient: '#56649a', shade: '#2c3462', deepShade: '#0c0c1e', bloom: .9, wind: .35,
      dust: ['#6a6a8a', '#4e4e6e', '#8a8aa8'],
      drawSky: K.nightSky({ seed: 3, bands: [[0, '#05071a'], [.45, '#10163a'], [.78, '#262a56'], [1, '#3e3460']] }),
      buildBackground(level) {
        const layers = K.gradeLayers(G.Biomes.defs.bukhara.buildBackground.call(this, level), NIGHT_BG);
        layers.forEach((L, i) => { if (L.canvas && L.canvas.height >= 200) addWindows(L.canvas, level.seed + i); });
        return layers;
      },
      fogBehind(ctx, cam, t) {
        ctx.globalAlpha = .16; ctx.fillStyle = '#5a6aa8'; ctx.fillRect(0, .64 * G.H, G.W, .36 * G.H); ctx.globalAlpha = 1;
      },
      post(ctx, cam, t) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let s = 0; s < 3; s++) { // faint moon shafts from the upper right
          const x = 300 - 120 * s + (.04 * cam.x) % 120, a = .025 + .012 * Math.sin(.3 * t + 2 * s), g = ctx.createLinearGradient(x, 0, x - 120, G.H);
          g.addColorStop(0, `rgba(170,190,255,${a})`); g.addColorStop(1, 'rgba(170,190,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x + 24, -10); ctx.lineTo(x - 100, G.H); ctx.lineTo(x - 160, G.H); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .22; ctx.fillStyle = '#2a3a9a'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      },
      ambientFx(world, cam, t) {
        if (Math.random() < .06) G.FX.spawn({ // fireflies
          x: cam.x + U.rand(0, G.W), y: cam.y + U.rand(G.H * .3, G.H), vx: U.rand(-.2, .2), vy: U.rand(-.15, .05), drag: 1, life: 260, size: 1,
          color: U.choose(['#d8ff7a', '#ffe680', '#b8ff9a']), glow: true, glowR: 6, alpha: 1,
          update: p => { p.vx += U.rand(-.03, .03); p.vy += U.rand(-.03, .03); p.vx *= .97; p.vy *= .97; p.alpha = .35 + .65 * Math.max(0, Math.sin(p.t * .08 + p.x)); }
        });
      }
    },
    gradeBg: NIGHT_BG,
    gradeFg: NIGHT_FG,
    decorate(L, rng) {
      const D = L.decos;
      for (const s of L.structures || []) {
        if (s.kind === 'building') {
          const ry = (s.roofY + 1) * TS;
          D.push(K.lantern((s.x0 - 1) * TS + 8, ry, { color: '#c8302a' }), K.lantern((s.x1 + 1) * TS + 8, ry, { color: '#2a7ab0', lightC: '#ffc070' }));
          if (s.x1 - s.x0 > 6) D.push(K.lantern((s.x0 + s.x1) / 2 * TS + 8, ry, { color: '#d89a2a', len: 4 }));
        } else if (s.kind === 'colonnade') {
          for (let k = 1; k < s.pillars.length; k++) D.push(K.lantern((s.pillars[k - 1] + s.pillars[k]) / 2 * TS + 10, (s.roofY + 1) * TS, { color: rng.pick(['#c8302a', '#d89a2a']), len: 6 }));
        } else if (s.kind === 'bridge' && !s.high) {
          for (let x = s.x0 + 3; x < s.x1 - 2; x += 6) D.push(K.lantern(x * TS + 8, (s.y + 1) * TS, { color: '#c8302a', len: 3, lightR: 60 }));
        } else if (s.kind === 'tower') {
          D.push(K.lantern((s.x0 + s.x1 + 1) / 2 * TS, (s.roofY + 1) * TS, { color: '#d89a2a', len: 10, lightR: 90 }));
        }
      }
      // garlands between neighbouring roofs + street lamps on long flat runs
      const roofs = (L.structures || []).filter(s => s.kind === 'building' || s.kind === 'colonnade').sort((a, b) => a.x0 - b.x0);
      for (let i = 1; i < roofs.length; i++) {
        const a = roofs[i - 1], b = roofs[i], gap = b.x0 - a.x1;
        if (gap > 3 && gap < 26) D.push(garland((a.x1 + 1) * TS + 14, a.roofY * TS + 4, (b.x0 - 1) * TS + 2, b.roofY * TS + 4, 14 + gap * 1.2, i));
      }
      let last = -99;
      for (const run of K.floorRuns(L, 5, 4)) {
        if (L.structOf && L.structOf(run.x0 + 2, run.ty)) continue;
        for (let x = run.x0 + 2; x <= run.x1 - 2; x += 15) if (x - last > 12) { D.push(streetLamp(x * TS + 7, run.y, rng.range(0, 6))); last = x; }
      }
    },
    aksakal: ['Ночью Хвост светлее, чем днём: каждый двор вешает фонарь, чтобы Спящий не перепутал его с пустотой.']
  });

  /* ================================================================ dream_drowned (registan under water) */
  const DROWN_MAP = [[0, '#030c26'], [.3, '#0c3466'], [.62, '#2584ae'], [.86, '#7fd8e8'], [1, '#e4fffa']];
  const DROWN_BG = K.grade([{ map: DROWN_MAP, k: .85 }, { mul: '#c8e4ff' }]);
  const DROWN_TILES = K.grade([{ map: DROWN_MAP, k: .55 }, { sat: .8 }]);
  // horizontal "heat haze" wobble for canvas parallax layers (draws in row bands)
  function wobble(layers, o) {
    return layers.map(L => {
      if (!L.canvas) return L;
      const src = L.canvas, band = o.band || 3, w = src.width, h = src.height;
      return {
        draw(ctx, cam, t) {
          const n = -cam.x * (L.fx || 0) + (L.drift ? t * L.drift : 0), y0 = R((L.y || 0) - cam.y * (L.fy || 0));
          if (L.alpha !== undefined) ctx.globalAlpha = L.alpha;
          for (let r = 0; r < h; r += band) {
            const yy = y0 + r, bh = Math.min(band, h - r);
            if (yy + bh < 0 || yy > G.H) continue;
            const dx = o.amp * Math.sin(t * o.speed + yy * o.freq);
            if (L.repeat === false) { ctx.drawImage(src, 0, r, w, bh, R(n + (L.x || 0) + dx), yy, w, bh); continue; }
            for (let x = ((n + dx) % w + w) % w - w; x < G.W; x += w) ctx.drawImage(src, 0, r, w, bh, R(x), yy, w, bh);
          }
          const rest = G.H - (y0 + h);
          if (rest > 0 && L.extend !== false && L.repeat !== false) for (let x = (n % w + w) % w - w; x < G.W; x += w) ctx.drawImage(src, 0, h - 1, w, 1, R(x), y0 + h, w, rest);
          ctx.globalAlpha = 1;
        }
      };
    });
  }
  // tileable animated caustics (8 frames, 128x128), drawn additively in post
  let caustic = null;
  function causticFrames() {
    if (caustic) return caustic;
    caustic = [];
    const N = 128, P = 2 * Math.PI / N;
    for (let f = 0; f < 8; f++) {
      const pix = new Art.Pix(N, N), ph = f / 8 * 2 * Math.PI;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const a = Math.sin(x * P * 2 + 1.7 * Math.sin(y * P * 3 + ph) + ph), b = Math.sin(y * P * 2 + 1.7 * Math.sin(x * P * 3 - ph) - ph);
        const v = 1 - Math.min(1, Math.abs(a + b) * 2.2);
        if (v > .45) pix.set(x, y, Art.C('#bff6ff', Math.round(255 * Math.min(1, (v - .45) * 2.4))));
      }
      caustic.push(pix.canvas());
    }
    return caustic;
  }
  function kelp(x, y, h, ph, glow) {
    return {
      x, y: y - h / 2, r: h, layer: 'mid',
      draw(ctx, t) {
        for (let i = 0; i < h; i++) {
          const u = i / h, sx = Math.sin(t * 1.4 + ph + i * .18) * u * 4;
          ctx.fillStyle = i % 5 === 0 ? '#2a8a7a' : u > .7 ? '#1f6e6a' : '#164e56';
          ctx.fillRect(R(x + sx), y - i, (i % 7 < 2 && u > .2) ? 2 : 1, 1);
        }
      },
      fx(ctx, t) { if (glow) G.Glow.add(x + Math.sin(t * 1.4 + ph + h * .18) * 4, y - h, 10, '#7affd8', .55 + .3 * Math.sin(t * 2 + ph)); }
    };
  }
  K.variant('registan', 'dream_drowned', {
    name: 'Сон. Утонувший город', subtitle: 'Купола под толщей синей воды',
    def: {
      ambient: '#b4e4ff', shade: '#4a7cc0', deepShade: '#08183c', bloom: .85, wind: .25,
      dust: ['#9fd8f0', '#6ab0d8', '#d8f4ff'], rock: ['#3a8ab8', '#1c4c80', '#a8e8f8'],
      drawSky(ctx, cam, t) {
        if (!this._sky) this._sky = PK.skyCanvas([[0, '#7ad8ea'], [.12, '#2a9ac4'], [.4, '#14588e'], [.75, '#0a2a5a'], [1, '#051634']], 18,
          { x: 240, y: -6, r: 26, core: '#e8fffc', rim: '#bdf2f6', halo: [[8, '#bdf2f6', .45, 0], [22, '#8adcec', .25, 1], [46, '#5ac0e0', .12, 2], [80, '#3aa0d0', .06, 3]] });
        ctx.drawImage(this._sky, 0, 0);
        ctx.fillStyle = '#e8fffc'; // surface shimmer
        for (let x = 0; x < G.W; x += 2) { const y = 6 + 3 * Math.sin(x * .07 + t * 1.8) + 2 * Math.sin(x * .023 - t); if (Math.sin(x * .31 + t * 3) > .3) { ctx.globalAlpha = .5; ctx.fillRect(x, R(y), 2, 1); } }
        ctx.globalAlpha = 1;
      },
      buildBackground(level) {
        return wobble(K.gradeLayers(G.Biomes.defs.registan.buildBackground.call(this, level), DROWN_BG), { amp: 1.6, freq: .09, speed: 1.3, band: 3 });
      },
      fogBehind(ctx) {
        const g = ctx.createLinearGradient(0, 0, 0, G.H);
        g.addColorStop(0, 'rgba(20,90,150,0.05)'); g.addColorStop(1, 'rgba(6,30,70,0.45)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, G.W, G.H);
      },
      drawForeground: null,
      post(ctx, cam, t) {
        const fr = causticFrames()[Math.floor(t * 6) % 8], ox = (-cam.x * .6) % 256, oy = (-cam.y * .6) % 256;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .05; ctx.imageSmoothingEnabled = false;
        for (let x = ox - 256; x < G.W; x += 256) for (let y = oy - 256; y < G.H; y += 256) ctx.drawImage(fr, R(x), R(y), 256, 256);
        ctx.globalAlpha = 1;
        for (let s = 0; s < 4; s++) { // light shafts from the surface
          const x = 60 + 120 * s - (.05 * cam.x) % 120, a = .03 + .02 * Math.sin(.5 * t + 1.9 * s), g = ctx.createLinearGradient(x, 0, x + 60, G.H);
          g.addColorStop(0, `rgba(190,250,255,${a})`); g.addColorStop(1, 'rgba(190,250,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, -10); ctx.lineTo(x + 18, -10); ctx.lineTo(x + 90, G.H); ctx.lineTo(x + 40, G.H); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
        ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .3; ctx.fillStyle = '#1a6ad0'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      },
      ambientFx(world, cam, t) {
        if (Math.random() < .12) G.FX.spawn({ // bubbles
          x: cam.x + U.rand(0, G.W), y: cam.y + G.H + 4, vx: 0, vy: -U.rand(.35, .8), drag: 1, life: 340, shape: 'ring', width: 1,
          size: U.rand(.8, 2.2), color: '#d8fbff', alpha: .7, fade: false, update: p => { p.vx = .25 * Math.sin(p.t * .09 + p.max); }
        });
        if (Math.random() < .2) G.FX.spawn({ // marine snow
          x: cam.x + U.rand(0, G.W), y: cam.y - 2, vx: U.rand(-.05, .1), vy: U.rand(.12, .3), drag: 1, life: 600, size: 1,
          color: U.choose(['#cfefff', '#9fd0e8', '#ffffff']), alpha: .55
        });
      }
    },
    gradeTiles: DROWN_TILES,
    decorate(L, rng) {
      let next = 0;
      for (const run of K.floorRuns(L, 2, 3)) for (let x = run.x0; x <= run.x1; x++) {
        if (x < next || !rng.chance(.12)) continue;
        for (let k = 0; k < rng.int(1, 3); k++) L.decos.push(kelp(x * TS + rng.int(0, 15), run.y, rng.int(14, 34), rng.range(0, 6), rng.chance(.25)));
        next = x + rng.int(3, 7);
      }
    },
    aksakal: ['Говорят, Спящему снится, что его город утонул. Во сне вода тёплая, и никто не тонет — все просто забывают, что умеют дышать.']
  });

  /* ================================================================ ruins_under (afrasiab underground) */
  const CAVE_BG = K.grade([{ map: [[0, '#040308'], [.45, '#141020'], [.8, '#2c2438'], [1, '#544864']], k: .92 }]);
  // cave back wall: rough rock; afrasiab's own back tile (frescoes) is kept inside structures
  const caveBack = Art.pixTile((pix, info, ox, oy) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const wx = info.x + x, wy = info.y + y, n = U.noise2(wx / 14, wy / 10, 3), n2 = U.noise2(wx / 5, wy / 4, 8);
      let c = n > .62 ? '#6a5a70' : n > .4 ? '#584a60' : '#483c50';
      if (Math.abs(n2 - .5) < .03) c = '#2a2232'; // cracks
      else if (U.hash(wx, wy, 5) < .02) c = '#7a6a80';
      pix.set(ox + x, oy + y, Art.C(c));
    }
  }, 0);
  function crystal(x, y, col, ph) {
    return {
      x, y: y - 8, r: 40, layer: 'back', light: { r: 64, color: col, a: .7, dy: -4 },
      draw(ctx) {
        ctx.fillStyle = U.shade(col, -.45); ctx.fillRect(x - 5, y - 3, 11, 3);
        for (const [dx, h, w] of [[-4, 7, 2], [-1, 12, 3], [3, 9, 2], [5, 5, 2]]) {
          ctx.fillStyle = col; ctx.fillRect(x + dx, y - h, w, h);
          ctx.fillStyle = U.shade(col, .5); ctx.fillRect(x + dx, y - h, 1, h - 1);
        }
      },
      fx(ctx, t) { G.Glow.add(x, y - 7, 18, col, .45 + .2 * Math.sin(t * 1.5 + ph)); }
    };
  }
  function roots(x, y, len, seed) {
    return {
      x, y: y + len / 2, r: len, layer: 'mid',
      draw(ctx, t) {
        for (let k = 0; k < 3; k++) {
          const l = len * (.5 + .25 * k);
          for (let i = 0; i < l; i++) { const sx = Math.sin(t * .9 + seed + k + i * .15) * (i / l) * 2 + (k - 1) * 3; ctx.fillStyle = k === 1 ? '#4a3626' : '#3a2a1e'; ctx.fillRect(R(x + sx), y + i, 1, 1); }
        }
      }
    };
  }
  K.variant('afrasiab', 'ruins_under', {
    name: 'Под Старым Ёдгором', subtitle: 'Руины, которые город съел сам',
    def: {
      ambient: '#7a6a7c', shade: '#5a4c64', deepShade: '#0a060c', bloom: .8, wind: .1, sunDir: [.3, -1],
      dust: ['#8a7a70', '#6a5a52', '#a89888'],
      tiles: Object.assign({}, G.Biomes.defs.afrasiab.tiles, {
        back(ctx, x, y, info) { return (info.level.structOf && info.level.structOf(info.tx, info.ty) ? G.Biomes.defs.afrasiab.tiles.back : caveBack)(ctx, x, y, info); }
      }),
      drawSky(ctx, cam, t) {
        if (!this._sky) { this._sky = G.makeCanvas(G.W, G.H); Art.bandGrad(this._sky.ctx, 0, 0, G.W, G.H, [[0, '#020104'], [.6, '#0c0812'], [1, '#2a1620']], 14, true); }
        ctx.drawImage(this._sky, 0, 0);
      },
      buildBackground(level) {
        const layers = K.gradeLayers(G.Biomes.defs.afrasiab.buildBackground.call(this, level), CAVE_BG);
        // a cave "mouth" silhouette that frames the far ruins: stalactites from the top, rubble from the bottom
        const cv = Art.paint(960, 270, pix => {
          const c1 = Art.C('#07050b'), c2 = Art.C('#0d0a14');
          for (let x = 0; x < 960; x++) {
            const top = 30 + 26 * U.fbm1(x * .02, 41, 4) + (U.hash(x >> 2, 1, 7) < .2 ? 18 * U.hash(x >> 2, 2, 7) : 0);
            const bot = 210 + 30 * U.fbm1(x * .015, 43, 4);
            for (let y = 0; y < 270; y++) if (y < top || y > bot) pix.set(x, y, y < top - 3 || y > bot + 3 ? c1 : c2);
          }
        });
        layers.push({ canvas: cv, fx: .35, fy: .1, y: -20 });
        return layers;
      },
      postGen(L, rng) {
        if (!L.isOpen) return; // arenas/rests untouched
        K.addCeiling(L, rng, { headroom: [6, 11], stal: .2 });
        // windows in the back wall where the deep cave shows through
        for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
          const i = y * L.w + x;
          if (L.back[i] && !(L.structOf && L.structOf(x, y)) && U.noise2(x / 9, y / 6, L.seed % 97) > .66) L.back[i] = 0;
        }
      },
      fogBehind(ctx) { ctx.globalAlpha = .25; ctx.fillStyle = '#1a1028'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; },
      drawForeground: null,
      post(ctx) {
        ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .25; ctx.fillStyle = '#2a1840'; ctx.fillRect(0, 0, G.W, G.H);
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      },
      ambientFx(world, cam, t) {
        const L = G.level;
        if (Math.random() < .08 && L.ceilRow) { // grit falling from the ceiling
          const x = cam.x + U.rand(0, G.W), cx = Math.floor(x / TS), cy = L.ceilRow[Math.max(0, Math.min(L.w - 1, cx))];
          G.FX.spawn({ x, y: (cy + 1) * TS + 1, vx: 0, vy: .2, grav: .06, drag: .99, life: 120, size: 1, color: U.choose(['#8a7a70', '#6a5a52']), alpha: .9, bounce: true });
        }
        if (Math.random() < .05) G.FX.spawn({ // glowing spores
          x: cam.x + U.rand(0, G.W), y: cam.y + U.rand(0, G.H), vx: U.rand(-.1, .1), vy: -U.rand(.02, .12), drag: 1, life: 300, size: 1,
          color: U.choose(['#9af0ff', '#c8a0ff']), glow: true, glowR: 4, alpha: .8
        });
      }
    },
    gradeBg: CAVE_BG,
    decorate(L, rng) {
      if (!L.isOpen) return;
      const D = L.decos;
      // torches on walls 2 tiles above the floor
      let last = -99;
      for (const s of L.spots.wallL.concat(L.spots.wallR).sort((a, b) => a.tx - b.tx)) {
        if (s.tx - last < 10) continue;
        if (L.get(s.tx, s.ty + 2) !== T.SOLID && L.get(s.tx, s.ty + 2) !== T.PLAT) continue;
        const left = L.get(s.tx - 1, s.ty) === T.SOLID, x = left ? s.tx * TS + 4 : (s.tx + 1) * TS - 4;
        D.push(PK.flameDeco(x, s.y - 2, { w: 7, h: 11, lightR: 100, embers: true, draw(ctx) { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(R(x) - 1, s.y - 2, 3, 7); ctx.fillStyle = '#6a5038'; ctx.fillRect(R(x) - 2, s.y - 3, 5, 2); } }));
        last = s.tx;
      }
      // crystals on floors, roots from the ceiling
      for (const run of K.floorRuns(L, 3, 3)) if (rng.chance(.35)) D.push(crystal((rng.int(run.x0, run.x1) + .5) * TS, run.y, rng.pick(['#7ae8ff', '#b890ff', '#7affc0']), rng.range(0, 6)));
      if (L.ceilRow) for (let x = 4; x < L.w - 4; x += rng.int(5, 12)) D.push(roots(x * TS + 8, (L.ceilRow[x] + 1) * TS, rng.int(12, 30), x));
    },
    aksakal: ['Под Старым Ёдгором есть второй город. Его построили те, кто строил первый, — и закопали, когда он перестал быть нужен.']
  });
})();
