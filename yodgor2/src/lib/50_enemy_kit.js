/* enemy_kit.js — runtime helpers for new enemies (window.G.EK).
   Load AFTER the engine (append a <script> before </body>; boot() runs on window 'load', so defs registered here
   are in place before any level is populated). Never edits engine code.

   API (all return the def they touched):
     EK.clone(baseId, newId, over, look)  copy a def under a new id, override stats/fields, optional new look
     EK.look(def, look)                   recolor / rescale an already registered def (wraps def.draw etc.)
     EK.addToBiome(id, biomes, weight)    make an enemy appear in more enemy-biomes (optional per-biome weight)
     EK.removeFromBiome(id, biomes)
     EK.haste(def, k)                     run the whole enemy (AI, physics, timers) k× per frame
     EK.volley(def, opts)                 periodic telegraphed ranged volley on top of the base AI
     EK.deathSummon(def, opts)            spawn minions when it dies
     EK.deathHazard(def, opts)            leave a burning/poison pool when it dies (BossKit.FirePool)
     EK.trailHazard(def, opts)            drop small pools while it walks
     EK.colorFn(spec), EK.mapHex(spec, hex), EK.cssFilter(spec)   colour utilities

   look = { hue: deg, sat: ×, light: ×  (HSL shift)  |  map: {'#rrggbb': '#rrggbb'} (exact palette swap; unmapped
            colours fall back to the HSL shift if one is given), mode: 'lut' (default, exact per-pixel LUT) |
            'filter' (ctx.filter post-pass) | 'pre' (ctx.filter while drawing), scale: k, fx: true (remap Glow/Light colours
            and filter drawFx), proj: true (recolor projectiles fired through e.shoot) }
*/
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.Enemies || !G.Enemy) return;
  const U = G.U, EK = G.EK = G.EK || {};
  const proto = G.Enemy.prototype;

  /* ------------------------------------------------------------------ colour */
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360;
    if (s <= 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = t < 0 ? t + 1 : t > 1 ? t - 1 : t; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
  }
  const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
  // spec -> (r,g,b) => [r,g,b].  spec.map: exact palette swap; colours within spec.near (default 28, ~per channel) of a
  // map key snap to that key's target (catches anti-aliased / scaled in-between colours); the rest get the HSL shift.
  EK.colorFn = function (spec) {
    const exact = {}, keys = [], vals = [];
    if (spec.map) for (const k in spec.map) { const a = U.hex2rgb(k), b = U.hex2rgb(spec.map[k]); exact[(a[0] << 16) | (a[1] << 8) | a[2]] = b; keys.push(a); vals.push(b); }
    const near = spec.near === undefined ? 28 : spec.near, lim = near * near * 9;
    const hue = spec.hue || 0, sat = spec.sat === undefined ? 1 : spec.sat, light = spec.light === undefined ? 1 : spec.light;
    const shift = hue || sat !== 1 || light !== 1;
    return (r, g, b) => {
      const m = exact[(r << 16) | (g << 8) | b];
      if (m) return m;
      if (near > 0 && keys.length) {
        let best = -1, bd = lim;
        for (let i = 0; i < keys.length; i++) {
          const k = keys[i], dr = k[0] - r, dg = k[1] - g, db = k[2] - b, d = dr * dr * 3 + dg * dg * 4 + db * db * 2;
          if (d < bd) { bd = d; best = i; }
        }
        if (best >= 0) return vals[best];
      }
      if (!shift) return [r, g, b];
      const [h, s, l] = rgb2hsl(r, g, b);
      return hsl2rgb(h + hue, clamp01(s * sat), clamp01(l * light));
    };
  };
  EK.mapHex = function (spec, hex) {
    if (typeof hex !== 'string' || hex[0] !== '#') return hex;
    const f = spec._fn || (spec._fn = EK.colorFn(spec)), c = U.hex2rgb(hex), o = f(c[0], c[1], c[2]);
    return U.rgb2hex(o[0], o[1], o[2]);
  };
  EK.cssFilter = function (spec) {
    if (spec.filter) return spec.filter;
    const p = [];
    if (spec.hue) p.push('hue-rotate(' + spec.hue + 'deg)');
    if (spec.sat !== undefined && spec.sat !== 1) p.push('saturate(' + spec.sat + ')');
    if (spec.light !== undefined && spec.light !== 1) p.push('brightness(' + spec.light + ')');
    return p.join(' ') || 'none';
  };
  const mapList = (spec, a) => Array.isArray(a) ? a.map(c => EK.mapHex(spec, c)) : EK.mapHex(spec, a);
  function mapRim(spec, rim) {
    if (!rim) return rim;
    return Object.assign({}, rim, { color: EK.mapHex(spec, rim.color) });
  }

  // Per-pixel LUT pass over the puppet canvas (called inside the puppet callback, before Art.process).
  const lutCache = new WeakMap();
  function lutPass(ctx, w, h, spec) {
    let cache = lutCache.get(spec);
    if (!cache) { cache = new Map(); lutCache.set(spec, cache); }
    const f = spec._fn || (spec._fn = EK.colorFn(spec));
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    let last = -1, lr = 0, lg = 0, lb = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
      if (key !== last) {
        let v = cache.get(key);
        if (v === undefined) { const o = f(d[i], d[i + 1], d[i + 2]); v = (o[0] << 16) | (o[1] << 8) | o[2]; cache.set(key, v); if (cache.size > 4096) cache.clear(); }
        last = key; lr = v >> 16 & 255; lg = v >> 8 & 255; lb = v & 255;
      }
      d[i] = lr; d[i + 1] = lg; d[i + 2] = lb;
    }
    ctx.putImageData(img, 0, 0);
  }
  // ctx.filter post-pass through a scratch canvas (one filtered drawImage per frame).
  let scratch = null;
  function filterPass(ctx, w, h, css) {
    if (!scratch || scratch.width < w || scratch.height < h) scratch = G.makeCanvas(Math.max(w, scratch ? scratch.width : 0), Math.max(h, scratch ? scratch.height : 0), true);
    const s = scratch.ctx;
    s.setTransform(1, 0, 0, 1, 0, 0); s.clearRect(0, 0, w, h); s.drawImage(ctx.canvas, 0, 0, w, h, 0, 0, w, h);
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, w, h); ctx.filter = css; ctx.drawImage(scratch, 0, 0, w, h, 0, 0, w, h); ctx.restore();
  }
  EK._lutPass = lutPass; EK._filterPass = filterPass;

  // Temporarily recolor Glow/Light registrations (used around drawFx / projectile fx).
  function withMappedLights(spec, fn) {
    const ga = G.Glow.add, la = G.Light.add;
    G.Glow.add = function (x, y, r, c, a) { return ga.call(this, x, y, r, EK.mapHex(spec, c), a); };
    G.Light.add = function (x, y, r, c, a) { return la.call(this, x, y, r, EK.mapHex(spec, c), a); };
    try { return fn(); } finally { G.Glow.add = ga; G.Light.add = la; }
  }
  EK.withMappedLights = withMappedLights;

  // A Proxy over a 2D context that recolors what a draw function puts on it:
  // fillStyle/strokeStyle hex strings are mapped; drawImage sources are LUT-recoloured through a copy
  // ('memo': cache per source canvas+rect, for static sprites such as flame frames/glow sprites;
  //  'live': recolour every call, for scratch canvases whose content changes, e.g. a boss puppet canvas).
  const memo = new WeakMap();
  let tmp = null;
  function recolorRect(src, sx, sy, sw, sh, spec, live) {
    sw = Math.max(1, Math.ceil(sw)); sh = Math.max(1, Math.ceil(sh));
    let m = null, key = null;
    if (!live) { m = memo.get(src); if (!m) { m = new Map(); memo.set(src, m); } key = sx + ',' + sy + ',' + sw + ',' + sh + '|' + (spec._id || (spec._id = Math.random())); const hit = m.get(key); if (hit) return hit; }
    let c;
    if (live) { if (!tmp || tmp.width < sw || tmp.height < sh) tmp = G.makeCanvas(Math.max(sw, tmp ? tmp.width : 0), Math.max(sh, tmp ? tmp.height : 0), true); c = tmp; c.ctx.clearRect(0, 0, sw, sh); }
    else c = G.makeCanvas(sw, sh, true);
    c.ctx.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
    lutPass(c.ctx, sw, sh, spec);
    if (m) { if (m.size > 64) m.clear(); m.set(key, c); }
    return c;
  }
  EK.proxyCtx = function (ctx, spec, images) {
    const cacheKey = images || 'memo';
    const store = ctx.__ekProxies || (ctx.__ekProxies = new Map());
    const k = (spec._id || (spec._id = Math.random())) + cacheKey;
    let px = store.get(k);
    if (px) return px;
    const bound = {};
    const live = images === 'live';
    const drawImage = function (src) {
      const a = arguments;
      if (images === false || !src || !src.getContext) return ctx.drawImage.apply(ctx, a);
      if (a.length === 9) { const c = recolorRect(src, a[1], a[2], a[3], a[4], spec, live); return ctx.drawImage(c, 0, 0, Math.ceil(a[3]), Math.ceil(a[4]), a[5], a[6], a[7], a[8]); }
      const c = recolorRect(src, 0, 0, src.width, src.height, spec, live);
      return a.length === 5 ? ctx.drawImage(c, 0, 0, src.width, src.height, a[1], a[2], a[3], a[4]) : ctx.drawImage(c, 0, 0, src.width, src.height, a[1], a[2], src.width, src.height);
    };
    px = new Proxy(ctx, {
      get(t, p) {
        if (p === 'drawImage') return drawImage;
        if (p === '__ekReal') return t;
        const v = t[p];
        return typeof v === 'function' ? (bound[p] || (bound[p] = v.bind(t))) : v;
      },
      set(t, p, v) { t[p] = (p === 'fillStyle' || p === 'strokeStyle' || p === 'shadowColor') && typeof v === 'string' ? EK.mapHex(spec, v) : v; return true; }
    });
    store.set(k, px);
    return px;
  };
  // Map colours of particles spawned while fn runs (FX.spawn is used by burst/sparks/debris/dust/embers...).
  function withMappedParticles(spec, fn) {
    const sp = G.FX.spawn;
    G.FX.spawn = function (o) {
      if (o) {
        if (typeof o.color === 'string') o.color = EK.mapHex(spec, o.color);
        if (typeof o.color2 === 'string') o.color2 = EK.mapHex(spec, o.color2);
        if (typeof o.lightColor === 'string') o.lightColor = EK.mapHex(spec, o.lightColor);
      }
      return sp.call(this, o);
    };
    try { return fn(); } finally { G.FX.spawn = sp; }
  }
  EK.withMappedParticles = withMappedParticles;

  /* ------------------------------------------------------------------ clone */
  // Fields the engine's file-1 register wrapper (zindan/steppe/bazaar enemies) reads from the ORIGINAL def object
  // through closures: armor, onHit, onInterrupt, hurtRecover (instance onHurt), debris, deathDebris (onDeath).
  const CLOSURE_FIELDS = ['debris', 'deathDebris', 'onHit', 'onInterrupt', 'hurtRecover'];
  function rimGetter(color, a) { // same as the engine's rimC/rimA getter (rim follows the biome's sun direction)
    const cache = {};
    return () => {
      const b = G.level && G.level.biome, s = (b && b.sunDir) || [-1, -1.3];
      const dx = Math.abs(s[0]) > 0.3 ? Math.sign(s[0]) : 0, dy = Math.abs(s[1]) > 0.3 ? Math.sign(s[1]) : 0, k = 3 * dx + dy;
      return cache[k] || (cache[k] = { color, dx, dy, a });
    };
  }
  EK.clone = function (baseId, newId, over, look) {
    const base = G.Enemies.defs[baseId];
    if (!base) throw new Error('EK.clone: no enemy ' + baseId);
    over = over || {};
    const def = {};
    const desc = Object.getOwnPropertyDescriptors(base);
    for (const k in desc) {
      if (k in over) continue;
      if (k === 'rim' && desc.rim.get && (over.rimC || look)) continue; // rebuilt below
      Object.defineProperty(def, k, Object.assign({}, desc[k], { configurable: true }));
    }
    for (const k in over) def[k] = over[k];
    def.id = newId;
    def.baseId = baseId;
    if (base.biomes && !over.biomes) def.biomes = [];          // a clone is not in the base's biomes unless asked
    if (desc.rim && desc.rim.get && !('rim' in over)) {          // file-2 enemy: rim is a sun-direction getter
      const a = over.rimA || base.rimA || 0.5;
      const c = over.rimC || (look ? EK.mapHex(look, base.rimC) : base.rimC);   // an explicit rimC is already final
      Object.defineProperty(def, 'rim', { get: rimGetter(c, a), enumerable: true, configurable: true });
    }
    // Let closure-bound fields (see CLOSURE_FIELDS) follow the clone: swap them on the base def during the calls.
    const swapped = CLOSURE_FIELDS.filter(k => k in over || (look && (k === 'debris')));
    if (swapped.length) {
      const swap = (fn) => function () {
        const keep = swapped.map(k => base[k]);
        swapped.forEach(k => { base[k] = def[k]; });
        try { return fn.apply(this, arguments); } finally { swapped.forEach((k, i) => { base[k] = keep[i]; }); }
      };
      if (base.onDeath) def.onDeath = swap(def.onDeath === base.onDeath ? base.onDeath : def.onDeath);
      if (base.init && def.init === base.init) {
        const init = base.init;
        def.init = function (e, opt) {
          init.call(this, e, opt);
          if (typeof e.onHurt === 'function') e.onHurt = swap(e.onHurt);   // onHurt reads onHit/onInterrupt/hurtRecover
        };
      }
    }
    G.Enemies.register(def);
    if (look) EK.look(def, Object.assign({ keep: Object.keys(over) }, look));   // fields given in `over` are final colours
    return def;
  };

  /* ------------------------------------------------------------------ look (recolor + scale) */
  EK.look = function (def, look) {
    look = Object.assign({ mode: 'lut', fx: true, proj: true }, look);
    const hasColor = !!(look.hue || look.map || look.filter || (look.sat !== undefined && look.sat !== 1) || (look.light !== undefined && look.light !== 1));
    const k = look.scale || 1;
    const css = hasColor ? EK.cssFilter(look) : 'none';
    // data colours
    if (hasColor) {
      const keep = look.keep || [];
      for (const f of ['blood', 'ghostCol', 'outline']) if (typeof def[f] === 'string' && !keep.includes(f)) def[f] = EK.mapHex(look, def[f]);
      if (def.debris && !keep.includes('debris')) def.debris = mapList(look, def.debris);
      const rd = Object.getOwnPropertyDescriptor(def, 'rim');
      if (rd && !rd.get && def.rim && !keep.includes('rim')) def.rim = mapRim(look, def.rim);
    }
    // size: hitbox, puppet canvas, HP-bar offset
    if (k !== 1) {
      def.w = Math.round((def.w || 14) * k); def.h = Math.round((def.h || 24) * k);
      const s = Object.assign({ w: 64, h: 64, ox: 32, oy: 60 }, def.sprite || {});
      def.sprite = { w: Math.ceil(s.w * k) + 2, h: Math.ceil(s.h * k) + 2, ox: Math.round(s.ox * k) + 1, oy: Math.round(s.oy * k) + 1 };
      if (def.barY) def.barY = Math.round(def.barY * k);
      def.ekScale = k;
    }
    const baseInit = def.init, baseDraw = def.draw, baseFx = def.drawFx;
    def.init = function (e, opt) {
      baseInit && baseInit.call(this, e, opt);
      // file-1 enemies get a per-instance draw closure from their init: the puppet then ignores def.scale
      e._ekSelfScale = k !== 1 && Object.prototype.hasOwnProperty.call(e, 'draw');
      if (k !== 1 && !e._ekSelfScale) { def.scale = k; e.scale = k * (e.elite ? 1.15 : 1); }
      if (k !== 1) {
        e.attackBox = function (x, y, w, h) { return proto.attackBox.call(this, x * k, y * k, w * k, h * k); };
      }
      if (hasColor && look.proj) {
        const shoot = e.shoot;
        e.shoot = function (o) { return EK.recolorProjectile(shoot.call(this, o), look); };
      }
    };
    def.draw = function (ctx, e, frame) {
      if (k !== 1 && !look.smooth) ctx.imageSmoothingEnabled = false;   // crisp sprite parts when scaled (puppet restore() resets it)
      if (e._ekSelfScale) ctx.scale(k, k);
      if (hasColor && look.mode === 'pre') ctx.filter = css;
      const r = baseDraw.call(this, ctx, e, frame);
      if (hasColor && look.mode === 'pre') ctx.filter = 'none';
      if (e._ekSelfScale) scalePoints(e.data, k);
      if (hasColor && look.mode !== 'pre') {
        const s = e.spr || def.sprite || { w: 64, h: 64 };
        if (look.mode === 'filter') filterPass(ctx, s.w, s.h, css); else lutPass(ctx, s.w, s.h, look);
      }
      return r;
    };
    if (baseFx && hasColor && look.fx) {
      def.drawFx = function (ctx, e, frame) {
        if (look.fx === 'filter') { // exact but slow: ctx.filter on the main canvas costs ~0.5-1.5 ms per enemy per frame
          ctx.save(); ctx.filter = css;
          try { return withMappedLights(look, () => baseFx.call(this, ctx, e, frame)); } finally { ctx.restore(); }
        }
        const px = EK.proxyCtx(ctx, look, 'memo');
        return withMappedLights(look, () => baseFx.call(this, px, e, frame));
      };
    }
    if (hasColor && look.fxUpdate) { // particles the AI spawns (breath, sparks, dust...) — also recolours biome dust it kicks up
      const upd = def.update;
      def.update = function (e) { return withMappedParticles(look, () => upd.call(this, e)); };
      const od = def.onDeath;
      if (od) def.onDeath = function (e, i) { return withMappedParticles(look, () => od.call(this, e, i)); };
    }
    def.ekLook = look;
    return def;
  };
  // file-1 draw code stores local points (eyes, mouth...) in e.data for drawFx; scale them with the body
  const POINT_KEYS = ['eyes', 'eye', 'mouth', 'glyph', 'fn', 'ff', 'hand', 'tipL'];
  function scalePoints(d, k) {
    for (const key of POINT_KEYS) {
      const v = d[key];
      if (!Array.isArray(v) || !v.length) continue;
      if (Array.isArray(v[0])) d[key] = v.map(p => [p[0] * k, p[1] * k]);
      else if (typeof v[0] === 'number') d[key] = [v[0] * k, v[1] * k];
    }
  }
  EK.recolorProjectile = function (p, look) {
    if (!p || p._ekLook) return p;
    p._ekLook = look;
    if (typeof p.color === 'string') p.color = EK.mapHex(look, p.color);
    if (p.trail && p.trail.color) p.trail = Object.assign({}, p.trail, { color: EK.mapHex(look, p.trail.color) });
    if (p.light && p.light.color) p.light = Object.assign({}, p.light, { color: EK.mapHex(look, p.light.color) });
    for (const fk of ['drawFn', 'fxFn']) {
      const fn = p[fk];
      if (!fn) continue;
      p[fk] = function (ctx, q) { return withMappedLights(look, () => fn.call(this, EK.proxyCtx(ctx, look, 'memo'), q)); };
    }
    if (p.onDie) { const od = p.onDie; p.onDie = q => withMappedParticles(look, () => od(q)); }
    if (p.trail || p.onDie) { const u2 = p.update2; if (u2) p.update2 = q => withMappedParticles(look, () => u2(q)); }
    return p;
  };

  /* ------------------------------------------------------------------ biomes */
  // populate(): Enemies.list(level.biome.enemyBiome || level.biome.id) -> weighted pick by def.weight (default 10).
  EK.addToBiome = function (id, biomes, weight) {
    const d = G.Enemies.defs[id];
    if (!d) throw new Error('EK.addToBiome: no enemy ' + id);
    biomes = [].concat(biomes);
    d.biomes = Array.from(new Set((d.biomes || []).concat(biomes)));
    if (weight !== undefined) { d.biomeWeight = d.biomeWeight || {}; for (const b of biomes) d.biomeWeight[b] = weight; }
    return d;
  };
  EK.removeFromBiome = function (id, biomes) {
    const d = G.Enemies.defs[id];
    biomes = [].concat(biomes);
    d.biomes = (d.biomes || []).filter(b => !biomes.includes(b));
    return d;
  };
  if (!G.Enemies._ekList) {
    const list0 = G.Enemies.list; // engine version already falls back to [dummy] for empty pools
    G.Enemies.list = function (b) {
      return list0.call(this, b).map(d => d.biomeWeight && d.biomeWeight[b] !== undefined ? Object.create(d, { weight: { value: d.biomeWeight[b] } }) : d);
    };
    G.Enemies._ekList = list0;
  }

  /* ------------------------------------------------------------------ behaviour tweaks */
  const noop = () => {};
  // Whole-entity tempo: extra Enemy.update calls (AI, physics, timers). Status DoT ticks only once per frame.
  EK.haste = function (def, k) {
    const init = def.init;
    def.init = function (e, opt) {
      init && init.call(this, e, opt);
      e._ekAcc = 0;
      e.update = function () {
        proto.update.call(this);
        this._ekAcc += k - 1;
        while (this._ekAcc >= 1 && !this.dead) {
          this._ekAcc -= 1;
          const ts = this.tickStatus; this.tickStatus = noop;
          try { proto.update.call(this); } finally { this.tickStatus = ts; }
        }
      };
    };
    return def;
  };

  // Telegraphed volley layered over the base AI. Only starts from neutral states (opts.states) so it never cuts an attack.
  EK.volley = function (def, o) {
    o = Object.assign({ every: [150, 230], range: 260, minRange: 40, count: 3, spread: 0.22, speed: 3.6, grav: 0.02, windup: 30,
      dmgMul: 0.7, r: 2, color: '#c8a0ff', glow: '#a070ff', from: [6, -18], states: ['idle', 'chase', 'hover', 'patrol', 'walk'], sfx: 'magic' }, o);
    const upd = def.update;
    def.update = function (e) {
      const d = e.data.ekV || (e.data.ekV = { cd: U.randi(o.every[0], o.every[1]), wind: 0 });
      if (d.wind > 0) {
        e.fly ? (e.vx *= 0.85, e.vy *= 0.85) : e.stop(0.3);
        e.facePlayer();
        if (--d.wind === 0) fireVolley(e, o);
        return;
      }
      const p = e.player;
      if (e.aggro && p && !p.dead && --d.cd <= 0) {
        const dist = Math.abs(e.dx()), k = e.scale || 1;
        if (o.states.includes(e.state) && !(e.teleT > 0) && dist < o.range && dist > o.minRange && G.Phys.los(e.x, e.y + o.from[1] * k, p.x, p.cy)) {
          d.wind = o.windup; d.cd = U.randi(o.every[0], o.every[1]);
          e.telegraph(o.windup);
          return;
        }
        d.cd = 20;
      }
      upd && upd(e);
    };
    const fx = def.drawFx;
    def.drawFx = function (ctx, e, f) {
      fx && fx.call(this, ctx, e, f);
      const d = e.data.ekV;
      if (d && d.wind > 0) {
        const k = e.scale || 1, x = e.x + o.from[0] * k * e.facing, y = e.y + o.from[1] * k, a = 1 - d.wind / o.windup;
        G.Glow.add(x, y, 6 + 14 * a, o.glow, 0.5 + 0.4 * a);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
    };
    return def;
  };
  function fireVolley(e, o) {
    const p = e.player, k = e.scale || 1;
    const x = e.x + o.from[0] * k * e.facing, y = e.y + o.from[1] * k;
    const base = Math.atan2(p.cy - y, p.x - x);
    G.Audio && G.Audio.sfx(o.sfx, { x: e.x });
    for (let i = 0; i < o.count; i++) {
      const a = base + o.spread * (i - (o.count - 1) / 2);
      e.shoot({
        x, y, vx: Math.cos(a) * o.speed, vy: Math.sin(a) * o.speed - 0.4, r: o.r, grav: o.grav, life: 160, dmg: e.dmg * o.dmgMul,
        kbx: 2, kby: -1.5, color: o.color, trail: { color: o.glow, life: 10, size: 1, every: 2 }, light: { r: 30, color: o.glow, a: 0.5 },
        info: { dmgColor: o.color }, status: o.status
      });
    }
    G.FX.sparks(x, y, 5, e.facing, { color: '#ffffff', color2: o.color, speed: 2 });
  }

  EK.deathSummon = function (def, o) {
    o = Object.assign({ id: def.id, count: 2, spread: 14, vy: -2.2, aggro: true, elite: false, chance: 1 }, o);
    const od = def.onDeath;
    def.onDeath = function (e, info) {
      od && od.call(this, e, info);
      if (e._ekSummoned || Math.random() > o.chance) return;
      const sd = G.Enemies.defs[o.id];
      for (let i = 0; i < o.count; i++) {
        const dx = (i - (o.count - 1) / 2) * o.spread;
        const m = G.Enemies.spawn(o.id, e.x + dx, sd && sd.fly ? e.y - 16 : e.y, { elite: o.elite });
        if (!m) continue;
        m._ekSummoned = !o.recursive;
        m.vx = Math.sign(dx || 1) * 1.2; m.vy = o.vy; m.aggro = o.aggro;
        if (o.onSpawn) o.onSpawn(m, e);
        G.FX.poof(m.x, m.cy, { pal: o.pal || 'violet', r: 8, beam: false });
      }
      G.Audio && G.Audio.sfx('summon', { x: e.x });
    };
    return def;
  };

  const POOLS = {
    fire: () => ({ pal: G.Art.FLAME_FIRE, glowC: '#ff8a2a', status: { burn: { t: 90, dps: 2 * G.diff.dmgMul } } }),
    poison: () => ({ pal: G.Art.FLAME_WITCH, glowC: '#7dff6a', status: { poison: { t: 120, dps: 2 * G.diff.dmgMul } } }),
    spirit: () => ({ pal: G.Art.FLAME_SPIRIT, glowC: '#5ff2ff', status: { slow: { t: 60 } } }),
    ice: () => ({ pal: G.Art.FLAME_ICE, glowC: '#9fe4ff', status: { slow: { t: 90 } } }),
    gold: () => ({ pal: G.Art.FLAME_GOLD, glowC: '#ffcf4a', status: { burn: { t: 60, dps: 2 * G.diff.dmgMul } } })
  };
  EK.pool = function (owner, x, y, o) { // one hazard on the ground under (x, y)
    o = Object.assign({ kind: 'fire', w: 30, life: 150, dmgMul: 0.35 }, o);
    const gy = G.level.groundBelow(x, y - 8, 64);
    if (gy === null) return null;
    const h = new G.BossKit.FirePool(x, gy, Object.assign({ w: o.w, life: o.life, dmg: (owner ? owner.dmg : 10) * o.dmgMul, rehit: 40 }, POOLS[o.kind]()));
    return G.world.add(h);
  };
  EK.deathHazard = function (def, o) {
    const od = def.onDeath;
    def.onDeath = function (e, info) { od && od.call(this, e, info); EK.pool(e, e.x, e.y, o); };
    return def;
  };
  EK.trailHazard = function (def, o) {
    o = Object.assign({ every: 40, w: 14, life: 110, kind: 'poison', dmgMul: 0.25 }, o);
    const upd = def.update;
    def.update = function (e) {
      upd && upd(e);
      if (e.aggro && e.onGround && Math.abs(e.vx) > 0.4 && e.t % o.every === 0) EK.pool(e, e.x - e.facing * 6, e.y, o);
    };
    return def;
  };
})();
