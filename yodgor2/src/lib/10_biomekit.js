/* BiomeKit — runtime helpers for new locations on the Kyok Bori engine (no engine edits).
 * Load AFTER the engine script and BEFORE boot (i.e. as an extra <script> before </body>;
 * the engine boots on window 'load', so anything in a later inline <script> runs first).
 *
 * What it adds (all on window.G.BiomeKit):
 *   hooks      biome.postGen(level, rng, genName)  — after LevelGen.open/generate/arena/chaikhana
 *              biome.postBake(level)               — after LevelGen.bake (chunks exist, before shadows/light)
 *              plan.label / plan.title / plan.sub   — override the stage-start card; roman numerals > VII
 *              K.difficulty(rawStage, planIndex)    — remap run.stage (enemy HP/dmg, loot tier, prices)
 *   plan       K.setPlan(entries), K.roman(n), K.linearDifficulty(maxStage)
 *   grading    K.grade(ops) -> grade; K.gradeCanvas / gradedCopy / gradeLevelChunks / gradeLayers / gradedDraw / staticSky
 *   variants   K.variant(baseId, newId, opts)
 *   helpers    K.nightSky(opts), K.addCeiling(level, opts), K.lantern(x, y, opts), K.addObjectsAt(level, list)
 */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.Biomes || !G.LevelGen || !G.Game) { console.error('[BiomeKit] engine not found'); return; }
  if (G.BiomeKit && G.BiomeKit.__installed) return;
  const U = G.U, TS = G.TS, T = G.T;
  const K = G.BiomeKit = { __installed: true };

  /* ------------------------------------------------------------------ 1. hooks */
  // postGen: lets a biome edit tiles/back/objects after generation and BEFORE decorate/bake.
  for (const name of ['open', 'generate', 'arena', 'chaikhana']) {
    const orig = G.LevelGen[name];
    if (typeof orig !== 'function' || orig.__bk) continue;
    const wrapped = function (biome) {
      const L = orig.apply(this, arguments);
      try { if (biome && biome.postGen) biome.postGen(L, U.RNG(((L && L.seed) || 1) + 77), name); }
      catch (e) { console.error('[BiomeKit] postGen ' + (biome && biome.id), e); }
      return L;
    };
    wrapped.__bk = orig;
    G.LevelGen[name] = wrapped;
  }
  // postBake: chunk canvases are fresh per level here, safe to recolor in place.
  {
    const orig = G.LevelGen.bake;
    if (!orig.__bk) {
      const wrapped = function (level, biome) {
        const r = orig.apply(this, arguments);
        try { if (biome && biome.postBake) biome.postBake(level); }
        catch (e) { console.error('[BiomeKit] postBake ' + (biome && biome.id), e); }
        return r;
      };
      wrapped.__bk = orig;
      G.LevelGen.bake = wrapped;
    }
  }

  /* ------------------------------------------------------------------ 2. plan, labels, difficulty */
  K.roman = function (n) {
    n = Math.max(1, Math.floor(n));
    const map = [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
    let s = '';
    for (const [v, r] of map) while (n >= v) { s += r; n -= v; }
    return s;
  };
  // Replace G.PLAN in place (other code keeps the same array object). Warns about unknown biome ids.
  K.setPlan = function (entries) {
    const P = G.PLAN;
    P.length = 0;
    for (const e of entries) P.push(Object.assign({}, e));
    if (!P.some(e => e.type === 'victory')) P.push({ type: 'victory' });
    for (const [i, e] of P.entries()) {
      if ((e.type === 'level' || e.type === 'boss') && !G.Biomes.defs[e.biome]) console.warn('[BiomeKit] PLAN[' + i + '] unknown biome "' + e.biome + '" -> _fallback');
      if (e.type === 'boss' && !(G.Enemies.defs[e.boss] && G.Enemies.defs[e.boss].boss)) console.warn('[BiomeKit] PLAN[' + i + '] unknown boss "' + e.boss + '"');
    }
    return P;
  };
  // Difficulty: loadStage sets run.stage = G.stageOf(i) and then diff.hpMul = 1+.42*stage, diff.dmgMul = 1+.2*stage.
  // run.stage also drives loot tier (floor(.8*stage)), gold, shop prices and boss loot.
  // K.difficulty(rawStage, planIndex) -> stage (may be fractional). null = engine default.
  K.difficulty = null;
  K.linearDifficulty = function (maxStage) { // last combat entry gets `maxStage` (original game: 8)
    return function (raw) {
      const total = G.PLAN.filter(e => e.type === 'level' || e.type === 'boss').length;
      return total > 1 ? raw * maxStage / (total - 1) : raw;
    };
  };
  {
    const origStageOf = G.stageOf;
    G.stageOf = function (i) {
      const raw = origStageOf(i);
      return K.difficulty ? K.difficulty(raw, i) : raw;
    };
    G.stageOf.__bk = origStageOf;
  }
  // Stage card: engine indexes ["I".."VII"] by the number of 'level' entries so far -> "ЗЕМЛЯ undefined" after 7.
  K.levelLabel = n => 'ЗЕМЛЯ ' + K.roman(n);
  if (G.UI && G.UI.onStageStart && !G.UI.onStageStart.__bk) {
    const orig = G.UI.onStageStart;
    G.UI.onStageStart = function (plan, biome, level) {
      const r = orig.apply(this, arguments);
      try {
        const card = G.UI._debug && G.UI._debug().card;
        if (card && plan) {
          if (plan.type === 'level' && G.run) {
            const n = G.PLAN.slice(0, G.run.planIndex + 1).filter(e => e.type === 'level').length;
            card.label = K.levelLabel(n);
          }
          if (plan.label != null) card.label = plan.label;
          if (plan.title != null) card.title = plan.title;
          if (plan.sub != null) card.sub = plan.sub;
        }
      } catch (e) { console.error('[BiomeKit] card', e); }
      return r;
    };
    G.UI.onStageStart.__bk = orig;
  }

  /* ------------------------------------------------------------------ 3. color grading */
  const hex01 = h => U.hex2rgb(h).map(v => v / 255);
  const col01 = c => typeof c === 'number' ? [c, c, c] : typeof c === 'string' ? hex01(c) : c;
  const luma = (r, g, b) => .299 * r + .587 * g + .114 * b;
  function rampAt(stops, x) {
    if (x <= stops[0][0]) return stops[0][1];
    for (let i = 0; i < stops.length - 1; i++) {
      const [a, ca] = stops[i], [b, cb] = stops[i + 1];
      if (x <= b) { const t = (x - a) / Math.max(1e-6, b - a); return [0, 1, 2].map(k => ca[k] + (cb[k] - ca[k]) * t); }
    }
    return stops[stops.length - 1][1];
  }
  // ops: array of { mul } { add } { sat } { contrast, pivot } { gamma } { bright } { hue }
  //      { tint:'#hex', k } { screen:'#hex', k } { map:[[pos,'#hex'],...], k } { fn:(r,g,b)=>[r,g,b] }   (channels 0..1)
  function compile(ops) {
    const steps = (Array.isArray(ops) ? ops : [ops]).map(op => {
      if (op.mul != null) { const m = col01(op.mul); return c => [c[0] * m[0], c[1] * m[1], c[2] * m[2]]; }
      if (op.add != null) { const m = col01(op.add); return c => [c[0] + m[0], c[1] + m[1], c[2] + m[2]]; }
      if (op.bright != null) return c => c.map(v => v * op.bright);
      if (op.sat != null) return c => { const l = luma(c[0], c[1], c[2]); return c.map(v => l + (v - l) * op.sat); };
      if (op.contrast != null) { const p = op.pivot == null ? .5 : op.pivot; return c => c.map(v => p + (v - p) * op.contrast); }
      if (op.gamma != null) return c => c.map(v => Math.pow(Math.max(0, v), op.gamma));
      if (op.hue != null) {
        const a = op.hue * Math.PI / 180, cs = Math.cos(a), sn = Math.sin(a);
        return c => { // rotate chroma in YIQ
          const y = .299 * c[0] + .587 * c[1] + .114 * c[2], i = .596 * c[0] - .274 * c[1] - .322 * c[2], q = .211 * c[0] - .523 * c[1] + .312 * c[2];
          const i2 = i * cs - q * sn, q2 = i * sn + q * cs;
          return [y + .956 * i2 + .621 * q2, y - .272 * i2 - .647 * q2, y - 1.106 * i2 + 1.703 * q2];
        };
      }
      if (op.tint != null) { const m = col01(op.tint), k = op.k == null ? .5 : op.k; return c => c.map((v, j) => v + (m[j] - v) * k); }
      if (op.screen != null) { const m = col01(op.screen), k = op.k == null ? 1 : op.k; return c => c.map((v, j) => v + (1 - (1 - v) * (1 - m[j]) - v) * k); }
      if (op.map != null) {
        const stops = op.map.map(([p, h]) => [p, col01(h)]), k = op.k == null ? 1 : op.k;
        return c => { const m = rampAt(stops, luma(c[0], c[1], c[2])); return c.map((v, j) => v + (m[j] - v) * k); };
      }
      if (op.fn) return c => op.fn(c[0], c[1], c[2]);
      throw new Error('[BiomeKit] unknown grade op ' + JSON.stringify(op));
    });
    return (r, g, b) => { let c = [r, g, b]; for (const s of steps) c = s(c); return c; };
  }
  const gradeCache = new Map();
  // Returns { key, f, lut(Uint32Array 2^18, 6 bits/channel, ImageData byte order), approx:{color,alpha} }
  K.grade = function (ops, key) {
    key = key || JSON.stringify(ops, (k, v) => typeof v === 'function' ? String(v) : v);
    if (gradeCache.has(key)) return gradeCache.get(key);
    const f = compile(ops), lut = new Uint32Array(1 << 18), q = v => v < 0 ? 0 : v > 1 ? 255 : Math.round(v * 255);
    for (let i = 0; i < lut.length; i++) {
      const r = (i >> 12) & 63, g = (i >> 6) & 63, b = i & 63;
      const c = f((r << 2 | r >> 4) / 255, (g << 2 | g >> 4) / 255, (b << 2 | b >> 4) / 255);
      lut[i] = (q(c[2]) << 16 | q(c[1]) << 8 | q(c[0])) >>> 0;
    }
    // per-frame approximation for things we cannot pre-grade: mix toward `color` by `alpha` (fitted on black/white)
    const B = f(0, 0, 0).map(v => Math.min(1, Math.max(0, v))), W = f(1, 1, 1).map(v => Math.min(1, Math.max(0, v)));
    const alpha = Math.min(1, Math.max(0, 1 - ((W[0] - B[0]) + (W[1] - B[1]) + (W[2] - B[2])) / 3));
    const color = alpha > .01 ? U.rgb2hex(...B.map(v => Math.min(255, v / alpha * 255))) : '#000000';
    const g = { key, f, lut, approx: { color, alpha } };
    gradeCache.set(key, g);
    return g;
  };
  const asGrade = g => g && g.lut ? g : K.grade(g);
  // In place. Skips fully transparent pixels, keeps alpha.
  K.gradeCanvas = function (cv, grade) {
    grade = asGrade(grade);
    const ctx = cv.getContext('2d'), w = cv.width, h = cv.height;
    if (!w || !h) return cv;
    const img = ctx.getImageData(0, 0, w, h), d = new Uint32Array(img.data.buffer), lut = grade.lut;
    for (let i = 0; i < d.length; i++) {
      const p = d[i], a = p >>> 24;
      if (!a) continue;
      d[i] = ((lut[((p & 255) >> 2) << 12 | (((p >> 8) & 255) >> 2) << 6 | (((p >> 16) & 255) >> 2)] & 0xffffff) | (a << 24)) >>> 0;
    }
    ctx.putImageData(img, 0, 0);
    return cv;
  };
  const copyCache = new WeakMap(); // source canvas -> Map(gradeKey -> graded copy)
  K.gradedCopy = function (src, grade) {
    grade = asGrade(grade);
    let m = copyCache.get(src);
    if (!m) copyCache.set(src, m = new Map());
    if (m.has(grade.key)) return m.get(grade.key);
    const cv = G.makeCanvas(src.width, src.height);
    cv.ctx.drawImage(src, 0, 0);
    K.gradeCanvas(cv, grade);
    m.set(grade.key, cv);
    return cv;
  };
  // which: 'back' | 'front' | 'both'
  K.gradeLevelChunks = function (level, grade, which = 'both') {
    grade = asGrade(grade);
    for (const k of which === 'both' ? ['back', 'front'] : [which])
      for (const cv of level.chunks[k]) if (cv) K.gradeCanvas(cv, grade);
  };
  // Parallax layers: canvas layers -> exact graded copies (cached); draw-layers -> per-frame approximation.
  K.gradeLayers = function (layers, grade) {
    grade = asGrade(grade);
    return (layers || []).map(L => {
      if (L.canvas) return Object.assign({}, L, { canvas: K.gradedCopy(L.canvas, grade) });
      if (L.draw) return Object.assign({}, L, { draw: K.gradedDraw((ctx, cam, t) => L.draw.call(L, ctx, cam, t), grade) });
      return L;
    });
  };
  // Wrap a screen-space draw(ctx, ...args): render into a scratch canvas, tint its own pixels, composite.
  let scratch = null;
  K.gradedDraw = function (draw, grade) {
    grade = asGrade(grade);
    return function (ctx, ...args) {
      if (!scratch) scratch = G.makeCanvas(G.W, G.H);
      const s = scratch.ctx;
      s.setTransform(1, 0, 0, 1, 0, 0); s.globalAlpha = 1; s.globalCompositeOperation = 'source-over';
      s.clearRect(0, 0, G.W, G.H);
      draw.call(this, s, ...args);
      s.setTransform(1, 0, 0, 1, 0, 0);
      if (grade.approx.alpha > .01) {
        s.globalCompositeOperation = 'source-atop'; s.globalAlpha = grade.approx.alpha;
        s.fillStyle = grade.approx.color; s.fillRect(0, 0, G.W, G.H);
        s.globalCompositeOperation = 'source-over'; s.globalAlpha = 1;
      }
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(scratch, 0, 0);
      ctx.restore();
    };
  };
  // For bases whose drawSky is static (bukhara, steppe): render once, grade exactly, cache per (variant, grade).
  K.staticSky = function (baseDef, grade) {
    grade = asGrade(grade);
    let cv = null;
    return function (ctx, cam, t, level) {
      if (!cv) {
        cv = G.makeCanvas(G.W, G.H);
        baseDef.drawSky.call(baseDef, cv.ctx, cam, t, level);
        K.gradeCanvas(cv, grade);
      }
      ctx.drawImage(cv, 0, 0);
    };
  };

  /* ------------------------------------------------------------------ 4. variants */
  // opts: { name, subtitle, def:{...field overrides...}, gen:{...merged into base.gen, segments merged},
  //         gradeTiles, gradeBg, gradeSky ('static' base sky only), gradeFg  (grade ops or K.grade result),
  //         decorate(level, rng, base)  extra decoration after the base one,
  //         postGen(level, rng, genName, base), aksakal:[pages], lore:[...] }
  K.variant = function (baseId, id, o = {}) {
    const base = G.Biomes.defs[baseId];
    if (!base) throw new Error('[BiomeKit] no base biome ' + baseId);
    const def = Object.assign({}, base, { id, baseId }, o.def || {});
    if (o.name) def.name = o.name;
    if (o.subtitle) def.subtitle = o.subtitle;
    if (o.lore) def.lore = o.lore;
    if (base.gen || o.gen) {
      const bg = base.gen || {}, og = o.gen || {};
      def.gen = Object.assign({}, bg, og);
      if (bg.segments || og.segments) def.gen.segments = Object.assign({}, bg.segments || {}, og.segments || {});
      if (bg.features || og.features) def.gen.features = Object.assign({}, bg.features || {}, og.features || {});
    }
    if (o.arena) def.arena = Object.assign({}, base.arena || {}, o.arena);
    if (o.gradeBg && base.buildBackground && !(o.def && o.def.buildBackground)) {
      const g = asGrade(o.gradeBg);
      def.buildBackground = function (level) { return K.gradeLayers(base.buildBackground.call(this, level), g); };
    }
    if (o.gradeTiles) {
      const g = asGrade(o.gradeTiles), prev = def.postBake;
      def.postBake = function (level) { if (prev) prev.call(this, level); K.gradeLevelChunks(level, g); };
    }
    if (o.gradeSky && base.drawSky && !(o.def && o.def.drawSky)) def.drawSky = K.staticSky(base, o.gradeSky);
    if (o.gradeFg && base.drawForeground && !(o.def && 'drawForeground' in o.def)) def.drawForeground = K.gradedDraw(base.drawForeground, o.gradeFg);
    if (o.postGen) { const pg = o.postGen; def.postGen = function (L, rng, genName) { if (base.postGen) base.postGen.call(this, L, rng, genName); pg.call(this, L, rng, genName, base); }; }
    if (o.decorate) {
      const extra = o.decorate;
      def.decorate = function (L, rng) { if (base.decorate) base.decorate.call(this, L, rng); extra.call(this, L, rng, base); };
    }
    G.Biomes.register(def);
    const S = G.STORY;
    if (S) {
      if (S.aksakal && !S.aksakal[id]) S.aksakal[id] = o.aksakal || S.aksakal[baseId] || S.aksakal.steppe;
      if (S.biomes) S.biomes[id] = [def.name, def.subtitle];
    }
    return def;
  };

  /* ------------------------------------------------------------------ 5. drawing helpers */
  // Night sky: banded gradient + stars + moon (+ optional moon halo). Cached canvas, twinkle per frame.
  K.nightSky = function (o = {}) {
    const bands = o.bands || [[0, '#060816'], [.45, '#121a3c'], [.8, '#2a2c58'], [1, '#4a3a62']];
    const moon = o.moon === false ? null : Object.assign({ x: 372, y: 52, r: 11, core: '#f6f4ea', rim: '#d8d8e8', halo: [[3, '#e8eaff', .55, 0], [9, '#b8c4f0', .28, 1], [22, '#8c9ad8', .14, 2], [40, '#6a78c0', .07, 3]] }, o.moon || {});
    let cv = null, tw = null;
    return function (ctx, cam, t) {
      if (!cv) {
        const PK = G.PixKit, rng = U.RNG(o.seed || 9);
        cv = PK.skyCanvas(bands, o.steps || 18, moon, pix => {
          const n = o.stars == null ? 260 : o.stars;
          for (let i = 0; i < n; i++) {
            const x = rng.int(0, G.W - 1), y = rng.int(0, Math.floor(G.H * (o.starH || .7)));
            const c = G.Art.C(rng.pick(o.starCols || ['#ffffff', '#cfe0ff', '#ffe9c0', '#9fb0e0']), rng.int(90, 255));
            if (!pix.get(x, y)) pix.set(x, y, c);
          }
          if (moon && o.crescent !== false) { // shadow bite for a crescent: clear to show the gradient behind
            const cx = moon.x + moon.r * .55, cy = moon.y - moon.r * .25, rr = moon.r * .92;
            for (let y = Math.floor(cy - rr); y <= cy + rr; y++) for (let x = Math.floor(cx - rr); x <= cx + rr; x++)
              if ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 < rr * rr && (x + .5 - moon.x) ** 2 + (y + .5 - moon.y) ** 2 <= moon.r * moon.r) pix.set(x, y, 0);
          }
        });
        const r2 = U.RNG((o.seed || 9) + 1); tw = [];
        for (let i = 0; i < 24; i++) tw.push([r2.int(0, G.W - 1), r2.int(0, Math.floor(G.H * .55)), r2.range(0, 6)]);
      }
      ctx.drawImage(cv, 0, 0);
      ctx.fillStyle = '#ffffff';
      for (const [x, y, ph] of tw) { const a = .5 + .5 * Math.sin(t * 2.3 + ph); if (a > .55) { ctx.globalAlpha = a; ctx.fillRect(x, y, 1, 1); } }
      ctx.globalAlpha = 1;
    };
  };
  // Hanging lantern deco (world coords: anchor x,y = hook point). layer 'back' by default.
  K.lantern = function (x, y, o = {}) {
    const len = o.len == null ? 8 : o.len, body = o.color || '#d8402a', glowC = o.glow || '#ffb24a', ph = o.ph == null ? x * .013 : o.ph;
    return {
      x, y: y + len + 6, r: 40, layer: o.layer || 'back',
      light: { r: o.lightR || 72, color: o.lightC || '#ffb060', a: o.lightA == null ? .95 : o.lightA, flicker: true, dy: 0 },
      draw(ctx, t) {
        const sw = Math.sin(t * 1.7 + ph) * 1.2 * (1 + .3 * ((G.level && G.level.biome && G.level.biome.wind) || 0));
        const bx = Math.round(x + sw), by = Math.round(y + len);
        ctx.fillStyle = '#2a1a14';
        for (let i = 0; i < len; i++) ctx.fillRect(Math.round(x + sw * i / len), y + i, 1, 1);
        ctx.fillStyle = '#3a2418'; ctx.fillRect(bx - 2, by, 5, 1); ctx.fillRect(bx - 2, by + 10, 5, 1);
        ctx.fillStyle = body; ctx.fillRect(bx - 3, by + 1, 7, 9);
        ctx.fillStyle = U.shade(body, .35); ctx.fillRect(bx - 2, by + 2, 2, 7);
        ctx.fillStyle = '#ffe2a0'; ctx.fillRect(bx, by + 3, 2, 5);
        ctx.fillStyle = U.shade(body, -.4); ctx.fillRect(bx + 3, by + 1, 1, 9);
      },
      fx(ctx, t) {
        const sw = Math.sin(t * 1.7 + ph) * 1.2, fl = .85 + .15 * U.noise1(t * 6 + x, 4);
        G.Glow.add(x + sw, y + len + 5, o.glowR || 20, glowC, .55 * fl);
      }
    };
  };
  // Make an open level "underground": solid ceiling above the walkable profile (+ stalactites), back walls under it.
  // opts: { headroom:[min,max] tiles above the highest non-air tile within +-reach, reach, stal:chance, minRow, back:true }
  K.addCeiling = function (L, rng, o = {}) {
    const W = L.w, H = L.h, hr = o.headroom || [6, 10], reach = o.reach == null ? 3 : o.reach;
    const top = new Int16Array(W);
    for (let x = 0; x < W; x++) { let y = 0; while (y < H && L.get(x, y) === T.AIR) y++; top[x] = y; }
    const ceil = new Int16Array(W);
    for (let x = 0; x < W; x++) {
      let m = H;
      for (let dx = -reach; dx <= reach; dx++) { const xx = Math.min(W - 1, Math.max(0, x + dx)); m = Math.min(m, top[xx]); }
      const room = hr[0] + (hr[1] - hr[0]) * U.fbm1(x * .05, (L.seed % 991) + 5, 3);
      ceil[x] = Math.max(o.minRow == null ? 1 : o.minRow, Math.floor(m - room));
    }
    for (let x = 0; x < W; x++) {
      for (let y = 0; y <= ceil[x]; y++) L.set(x, y, T.SOLID);
      if (o.stal !== 0 && rng.chance(o.stal || .18)) { // stalactite 1..3 tiles, keep >=4 tiles of air above the floor
        const n = rng.int(1, 3);
        for (let k = 1; k <= n; k++) if (top[x] - (ceil[x] + k) >= 5 && L.get(x, ceil[x] + k) === T.AIR) L.set(x, ceil[x] + k, T.SOLID);
      }
    }
    L.openTop = false;
    if (o.back !== false) for (let i = 0; i < L.tiles.length; i++) if (L.tiles[i] !== T.SOLID) L.back[i] = 1;
    L.ceilRow = ceil;
    L.computeSpots();
    L.computeDepth();
    return ceil;
  };
  // Add objects (scroll/lore/urn/food/chest/altar) at fractions of the level width, on free floor (like LevelGen.open).
  K.addObjectsAt = function (L, list, rng) {
    rng = rng || U.RNG(L.seed + 404);
    const ok = (x, y) => { const s = L.get(x, y); return (s === T.SOLID || s === T.PLAT) && L.get(x, y - 1) === T.AIR && L.get(x, y - 2) === T.AIR; };
    const floor = L.spots.floor.filter(s => s.tx > 24 && s.tx < L.w - 16 && !s.plat && ok(s.tx, s.ty + 1));
    const used = new Set(L.objects.map(o => Math.round(o.x / TS)));
    for (const [frac, kind] of list) {
      let best = null, bd = 1e9;
      for (const s of floor) { if (used.has(s.tx)) continue; const d = Math.abs(s.tx - L.w * frac) + 6 * rng.next(); if (d < bd) { bd = d; best = s; } }
      if (best) { L.objects.push({ kind, x: best.x, y: best.y }); for (let k = -2; k <= 2; k++) used.add(best.tx + k); }
    }
  };
  // Flat floor runs (>= minLen tiles, AIR above for `clear` tiles) — handy for placing props.
  K.floorRuns = function (L, minLen = 3, clear = 3) {
    const runs = [], byRow = new Map();
    for (const s of L.spots.floor) {
      if (s.plat) continue;
      let ok = true; for (let k = 1; k <= clear; k++) if (L.get(s.tx, s.ty - k + 1) !== T.AIR) ok = false;
      if (ok) (byRow.get(s.ty) || byRow.set(s.ty, []).get(s.ty)).push(s.tx);
    }
    for (const [ty, xs] of byRow) {
      xs.sort((a, b) => a - b);
      let st = xs[0], pv = xs[0];
      for (let i = 1; i <= xs.length; i++) {
        if (i < xs.length && xs[i] === pv + 1) { pv = xs[i]; continue; }
        if (pv - st + 1 >= minLen) runs.push({ ty, x0: st, x1: pv, y: (ty + 1) * TS });
        st = pv = xs[i];
      }
    }
    return runs.sort((a, b) => a.x0 - b.x0);
  };
})();
