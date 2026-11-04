/* =====================================================================
   Yodgor v2 — ART: THE DEEP AND THE DREAM (Act II / Act III locations)
   Repaints the look of the biomes built in 60_world.js (only visual
   hooks: drawSky, buildBackground, tiles of the Karez, decorate props,
   lights, fogBehind, drawForeground, post, ambientFx). Gameplay geometry,
   gen and enemy settings stay untouched; dark biomes stay dark.
   Everything is painted by code once and cached; per-frame work is a
   handful of drawImage calls, a few lights and capped particles.
   ===================================================================== */
{
  const DEEP_IDS = ['yd_karez', 'yd_streets', 'yd_old', 'yd_well', 'yd_spine', 'yd_heart', 'yd_dream_city', 'yd_wedding', 'yd_sand', 'yd_house', 'yd_cistern', 'yd_well_bottom', 'yd_withers', 'yd_nest'];
  const DD = G.Biomes && G.Biomes.defs;
  if (!DD || !G.BiomeKit || !DEEP_IDS.every(id => DD[id])) console.error('[art_deep] world biomes missing');
  else {
    const K = G.BiomeKit, U = G.U, TS = G.TS, T = G.T, Art = G.Art, PK = G.PixKit;
    const C = Art.C, R = Math.round, PI2 = Math.PI * 2;
    const shadeP = Art.shadeP, mixP = Art.mixP;

    /* =============================================================== toolkit */
    const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
    const bay = (x, y) => (BAY[((y & 3) << 2) | (x & 3)] + .5) / 16;
    const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
    const ramp = hexes => hexes.map(h => C(h));
    // dithered pick in a packed ramp, t in 0..1
    const rampAt = (r, t, x, y) => { const f = clamp01(t) * (r.length - 1 - 1e-6), i = Math.floor(f); return r[Math.min(r.length - 1, i + ((f - i) > bay(x, y) ? 1 : 0))]; };
    // periodic 1D value noise (period = per px, `cells` lattice cells across)
    function pn1(x, per, cells, seed) {
      const u = x / per * cells, i = Math.floor(u), f = u - i, s = f * f * (3 - 2 * f);
      const a = U.hash(((i % cells) + cells) % cells, 0, seed), b = U.hash((((i + 1) % cells) + cells) % cells, 0, seed);
      return a + (b - a) * s;
    }
    function pfbm(x, per, cells, seed, oct = 4) { let s = 0, a = .5, n = 0; for (let o = 0; o < oct; o++) { s += pn1(x, per, cells << o, seed + o * 17) * a; n += a; a *= .5; } return s / n; }
    const pn2 = (x, y, per, cell, seed) => Art.pnoise(x / cell, y / cell, Math.max(1, R(per / cell)), 0, seed);
    // a wrapping painter over Art.Pix
    function painter(w, h) {
      const pix = new Art.Pix(w, h), d = pix.d;
      const P = {
        w, h, pix,
        set(x, y, c) { x = R(x); y = R(y); if (y < 0 || y >= h) return; x = ((x % w) + w) % w; d[y * w + x] = c; },
        get(x, y) { x = R(x); y = R(y); if (y < 0 || y >= h) return 0; x = ((x % w) + w) % w; return d[y * w + x]; },
        under(x, y, c) { x = R(x); y = R(y); if (y < 0 || y >= h) return; x = ((x % w) + w) % w; if (!(d[y * w + x] >>> 24)) d[y * w + x] = c; },
        rect(x, y, ww, hh, c) { for (let j = 0; j < hh; j++) for (let i = 0; i < ww; i++) P.set(x + i, y + j, c); },
        col(x, y0, y1, c) { for (let y = Math.max(0, R(y0)); y < Math.min(h, R(y1)); y++) P.set(x, y, c); },
        disc(cx, cy, r, c) { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r) P.set(x, y, c); },
        ell(cx, cy, rx, ry, c) { for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) if (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) P.set(x, y, c); },
        line(x0, y0, x1, y1, c, th = 1) { const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5)), o = (th - 1) / 2; for (let i = 0; i <= n; i++) { const u = i / n; P.rect(R(x0 + (x1 - x0) * u - o), R(y0 + (y1 - y0) * u - o), th, th, c); } },
        poly(pts, c) {
          let y0 = 1e9, y1 = -1e9;
          for (let i = 1; i < pts.length; i += 2) { y0 = Math.min(y0, pts[i]); y1 = Math.max(y1, pts[i]); }
          for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
            const xs = [], yc = y + .5;
            for (let i = 0; i < pts.length; i += 2) { const ax = pts[i], ay = pts[i + 1], bx = pts[(i + 2) % pts.length], by = pts[(i + 3) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax)); }
            xs.sort((a, b) => a - b);
            for (let k = 0; k + 1 < xs.length; k += 2) for (let x = R(xs[k]); x < R(xs[k + 1]); x++) P.set(x, y, c);
          }
        },
        // light the top edges (pixels with empty above) — rim light / snow caps
        rim(c, n = 1, only) { const s = d.slice(); for (let y = 1; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!(s[i] >>> 24) || (only && s[i] !== only)) continue; for (let k = 1; k <= n; k++) { if (y - k < 0 || (s[(y - k) * w + x] >>> 24)) continue; d[i] = c; break; } } },
        // side rim: pixels whose neighbour at dx is empty
        side(c, dx, only) { const s = d.slice(); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (!(s[i] >>> 24) || (only && s[i] !== only)) continue; const xx = (((x + dx) % w) + w) % w; if (!(s[y * w + xx] >>> 24)) d[i] = c; } },
        canvas() { return pix.canvas(); }
      };
      return P;
    }
    const paint = (w, h, fn) => { const P = painter(w, h); fn(P); return P.canvas(); };
    // shapes ------------------------------------------------------------
    // onion / round dome with drum and finial, base at (cx, by)
    function dome(P, cx, by, r, c, o = {}) {
      const drum = o.drum == null ? R(r * .55) : o.drum, onion = o.onion == null ? .25 : o.onion, ht = r * (o.tall || 1.15);
      P.rect(R(cx - r * .86), by - drum, R(r * 1.72), drum + 1, c);
      const top = by - drum;
      for (let y = 0; y <= ht; y++) {
        const u = y / ht; // 0 = base, 1 = tip
        let hw = r * Math.sqrt(Math.max(0, 1 - u * u));
        if (onion) hw *= 1 + onion * Math.sin(u * Math.PI) * (u < .5 ? 1 : -.6);
        if (u > .82) hw = Math.min(hw, r * (1 - u) * 1.2);
        for (let x = R(cx - hw); x <= R(cx + hw); x++) P.set(x, top - y, c);
      }
      if (o.finial !== false) { P.col(R(cx), top - ht - 6, top - ht + 1, c); P.set(R(cx) - 1, top - ht - 3, c); P.set(R(cx) + 1, top - ht - 3, c); }
      return top - ht;
    }
    function minaret(P, x, by, h, w, c, o = {}) {
      for (let y = 0; y < h; y++) { const hw = w / 2 * (1 - .25 * y / h); for (let xx = R(x - hw); xx <= R(x + hw); xx++) P.set(xx, by - y, c); }
      const ty = by - h;
      P.rect(R(x - w * .7), ty + 2, R(w * 1.4) + 1, 2, c); // balcony
      P.rect(R(x - w * .3), ty - 6, R(w * .6) + 1, 8, c); // lantern
      for (let y = 0; y < 5; y++) P.rect(R(x - w * .3 * (1 - y / 5)), ty - 6 - y, R(w * .6 * (1 - y / 5)) + 1, 1, c);
      P.col(R(x), ty - 14, ty - 10, c);
      if (o.bands) for (let y = by - h * .3; y > ty; y -= h * .3) P.rect(R(x - w * .65), R(y), R(w * 1.3) + 1, 1, c);
      return ty;
    }
    // pointed arch opening cut from (or painted on) a wall, base at by
    function archShape(P, cx, by, w, h, c) {
      const hw = w / 2, sp = h - hw * 1.2;
      for (let y = 0; y < h; y++) {
        let ww = hw;
        if (y > sp) { const u = (y - sp) / (h - sp); ww = hw * Math.sqrt(Math.max(0, 1 - u * u)) * (1 - .35 * u); }
        for (let x = R(cx - ww); x <= R(cx + ww); x++) P.set(x, by - y, c);
      }
    }
    // windows: small lit rectangles inside a filled silhouette area
    function windows(P, x0, x1, y0, y1, rng, density, cols, solid) {
      for (let y = y0; y < y1; y += 5) for (let x = x0; x < x1; x += 4) {
        if (!rng.chance(density)) continue;
        const xx = x + rng.int(0, 1), ww = rng.chance(.3) ? 2 : 1, hh = rng.chance(.6) ? 2 : 3;
        if (solid && !(solid(xx - 1, y - 1) && solid(xx + ww, y + hh))) continue;
        P.rect(xx, y, ww, hh, rng.pick(cols));
      }
    }
    // vertical dithered gradient (canvas) for skies
    const skyCache = {};
    function sky(key, stops, extra) {
      return skyCache[key] || (skyCache[key] = (() => {
        const cv = G.makeCanvas(G.W, G.H);
        Art.bandGrad(cv.ctx, 0, 0, G.W, G.H, stops, 22, true);
        if (extra) extra(cv.ctx, cv);
        return cv;
      })());
    }
    // glow blob (additive) on a screen ctx
    function glow(ctx, x, y, r, col, a) {
      if (a <= 0.01) return;
      const s = Art.glowSprite(R(r), col, 1);
      ctx.globalAlpha = Math.min(1, a); ctx.drawImage(s, R(x - r), R(y - r));
    }
    // light shaft sprite: trapezoid fading downward (additive)
    const shaftCache = {};
    function shaftSprite(w, h, col, spread, key) {
      key = key || [w, h, col, spread].join();
      if (shaftCache[key]) return shaftCache[key];
      const cv = G.makeCanvas(w + 2 * spread, h), c = cv.ctx, [r, g, b] = U.hex2rgb(col);
      const gr = c.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(.45, `rgba(${r},${g},${b},.45)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
      c.fillStyle = gr; c.beginPath(); c.moveTo(spread, 0); c.lineTo(spread + w, 0); c.lineTo(w + 2 * spread, h); c.lineTo(0, h); c.closePath(); c.fill();
      // soften the sides
      c.globalCompositeOperation = 'destination-out';
      const sg = c.createLinearGradient(0, 0, w + 2 * spread, 0);
      sg.addColorStop(0, 'rgba(0,0,0,1)'); sg.addColorStop(.3, 'rgba(0,0,0,0)'); sg.addColorStop(.7, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,1)');
      c.fillStyle = sg; c.fillRect(0, 0, w + 2 * spread, h);
      return (shaftCache[key] = cv);
    }
    // a soft horizontal fog band (tileable), alpha from periodic noise
    function fogBand(w, h, col, seed, dens = .55) {
      const P = painter(w, h), [r, g, b] = U.hex2rgb(col);
      for (let y = 0; y < h; y++) {
        const vy = Math.sin(y / h * Math.PI);
        for (let x = 0; x < w; x++) {
          const n = pn2(x, y * 2.2, w, 40, seed) * .65 + pn2(x, y * 2.2, w, 13, seed + 3) * .35;
          const a = clamp01((n - (1 - dens)) * 2.2) * vy;
          if (a > .02) P.set(x, y, (R(a * 255) << 24 | b << 16 | g << 8 | r) >>> 0);
        }
      }
      return P.canvas();
    }
    // camera reference for open levels: where the camera sits over the main ground
    const camRef = L => Math.max(0, ((L.groundRow != null ? L.groundRow : L.h - 15) * TS) - 62 - G.H / 2);
    // canvas parallax layer anchored at screen y `sy` when the camera stands at the ground
    const lay = (L, canvas, fx, fy, sy, o) => Object.assign({ canvas, fx, fy, y: R(sy + camRef(L) * fy) }, o || {});
    // draw-layer helper: callback gets (ctx, ox, oy, t, cam) with parallax offsets
    const dlay = (L, fx, fy, fn) => { const ref = camRef(L); return { draw(ctx, cam, t) { fn(ctx, -cam.x * fx, -(cam.y - ref) * fy, t, cam); } }; };
    const isArena = L => !!(L && (L.isArena || (!L.isOpen && L.w <= 64)));
    // dynamic deco helpers ------------------------------------------------
    const onS = (x, y, r) => G.onScreen(x, y, r);
    // extend a def's decorate
    function addDecorate(def, fn) { const prev = def.decorate; def.decorate = function (L, rng) { if (prev) prev.call(this, L, rng); try { fn.call(this, L, rng); } catch (e) { console.error('[art_deep] decorate ' + def.id, e); } }; }
    const both = (...fns) => function () { for (const f of fns) if (f) f.apply(this, arguments); };
    // camera-relative ambient particles (capped)
    function particles(o) {
      o = Object.assign({ rate: .1, cols: ['#ffffff'], vx: [-.1, .1], vy: [.1, .3], size: 1, life: 300, glow: false, glowR: 3, alpha: .8, from: 'any', grav: 0, sway: 0, shape: undefined }, o);
      return function (world, cam) {
        let n = o.rate;
        while (n > 0) {
          if (Math.random() < Math.min(1, n)) {
            let x = cam.x + U.rand(-20, G.W + 20), y = cam.y + U.rand(0, G.H);
            if (o.from === 'top') y = cam.y - 4; else if (o.from === 'bottom') y = cam.y + G.H + 4; else if (o.from === 'left') x = cam.x - 6; else if (o.from === 'right') x = cam.x + G.W + 6;
            const sw = o.sway, ph = Math.random() * 6;
            G.FX.spawn({
              x, y, vx: U.rand(o.vx[0], o.vx[1]), vy: U.rand(o.vy[0], o.vy[1]), drag: 1, grav: o.grav, life: o.life,
              size: Array.isArray(o.size) ? U.rand(o.size[0], o.size[1]) : o.size, color: U.choose(o.cols), glow: o.glow, glowR: o.glowR, alpha: o.alpha, shape: o.shape, width: o.width,
              update: sw ? p => { p.vx += Math.sin(p.t * .05 + ph) * sw; } : o.update
            });
          }
          n -= 1;
        }
      };
    }
    function vignetteCv(col, inner, outer) {
      const cv = G.makeCanvas(G.W, G.H), g = cv.ctx.createRadialGradient(G.W / 2, G.H * .55, G.H * inner, G.W / 2, G.H * .55, G.W * outer);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col);
      cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, G.W, G.H);
      return cv;
    }
    // vertical gradient overlay canvas (screen space)
    function vgradCv(stops) {
      const cv = G.makeCanvas(G.W, G.H), g = cv.ctx.createLinearGradient(0, 0, 0, G.H);
      for (const [p, c] of stops) g.addColorStop(p, c);
      cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, G.W, G.H);
      return cv;
    }
    // soft-light / other blend fill
    function blendFill(ctx, col, a, op) { ctx.globalCompositeOperation = op || 'soft-light'; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, G.W, G.H); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }
    // draw a tiled canvas horizontally at offset
    function tileX(ctx, cv, ox, y) { const w = cv.width; for (let x = ((ox % w) + w) % w - w; x < G.W; x += w) ctx.drawImage(cv, R(x), R(y)); }
    const lazy = f => { let v = null; return () => v || (v = f()); };
    function guard(id, fn) { try { fn(DD[id]); } catch (e) { console.error('[art_deep] ' + id, e); } }

    /* ---------------------------------------------- shared props (world decos) */
    // roots hanging from ceilings, slowly swaying; optional glowing tip
    function rootDeco(x, y, len, seed, o = {}) {
      const cols = o.cols || ['#2a2420', '#3a3028', '#4a3e32'], tip = o.tip;
      const strands = [];
      const rng = U.RNG(seed * 977 + 3);
      for (let k = 0; k < (o.n || 3); k++) strands.push({ dx: rng.int(-4, 4), l: len * rng.range(.45, 1), ph: rng.range(0, 6), th: k === 0 ? 2 : 1 });
      return {
        x, y: y + len / 2, r: len + 16, layer: o.layer || 'mid',
        draw(ctx, t) {
          for (const s of strands) {
            for (let i = 0; i < s.l; i++) {
              const u = i / s.l, sx = Math.sin(t * .8 + s.ph + i * .09) * u * u * 3 + Math.sin(i * .4 + s.ph) * .8;
              ctx.fillStyle = cols[u < .3 ? 0 : u < .7 ? 1 : 2];
              ctx.fillRect(R(x + s.dx + sx), y + i, u < .55 ? s.th : 1, 1);
            }
          }
        },
        fx: tip ? function (ctx, t) {
          for (const s of strands) if (s.th === 1) { const sx = Math.sin(t * .8 + s.ph + s.l * .09) * 3 + Math.sin(s.l * .4 + s.ph) * .8; ctx.fillStyle = tip; ctx.fillRect(R(x + s.dx + sx), R(y + s.l), 1, 1); G.Glow.add(x + s.dx + sx, y + s.l, 7, tip, .45 + .2 * Math.sin(t * 2 + s.ph)); }
        } : undefined
      };
    }
    // wall niche with a clay oil lamp (chirog): warm motivated light in the cold tunnels
    function nicheLamp(x, y, o = {}) {
      const lc = o.light || '#ffb060';
      return PK.flameDeco(x, y - 3, {
        w: 4, h: 6, lightR: o.r || 78, lightC: lc, lightA: .9, glowR: 16, glowC: o.glow || '#ffa040', glowI: .55, embers: false,
        draw(ctx) {
          const X = R(x), Y = R(y);
          ctx.fillStyle = '#06100f'; // niche hollow
          ctx.fillRect(X - 6, Y - 12, 12, 13); ctx.fillRect(X - 5, Y - 14, 10, 2); ctx.fillRect(X - 3, Y - 16, 6, 2); ctx.fillRect(X - 1, Y - 17, 2, 1);
          ctx.fillStyle = '#2a1e16'; ctx.fillRect(X - 7, Y + 1, 14, 2); // sill
          ctx.fillStyle = '#7a4a2a'; ctx.fillRect(X - 3, Y - 2, 7, 3); ctx.fillRect(X + 3, Y - 3, 2, 1); // lamp
          ctx.fillStyle = '#a86a3a'; ctx.fillRect(X - 2, Y - 2, 4, 1);
          ctx.fillStyle = '#4a2a18'; ctx.fillRect(X - 2, Y, 5, 1);
        }
      });
    }
    // floor crystals / salt
    function crystalDeco(x, y, col, ph, scale = 1) {
      const sh = [[-4, 6, 2], [-1, 11, 3], [3, 8, 2], [5, 4, 2], [-6, 3, 1]].map(([dx, h, w]) => [dx, R(h * scale), w]);
      return {
        x, y: y - 8, r: 40, layer: 'back', light: { r: 46, color: col, a: .55, dy: -4 },
        draw(ctx, t) {
          ctx.fillStyle = U.shade(col, -.6); ctx.fillRect(x - 7, y - 2, 15, 2);
          for (const [dx, h, w] of sh) {
            ctx.fillStyle = U.shade(col, -.25); ctx.fillRect(x + dx, y - h, w, h);
            ctx.fillStyle = col; ctx.fillRect(x + dx, y - h, 1, h - 1);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(x + dx, y - h, 1, 1);
          }
        },
        fx(ctx, t) { G.Glow.add(x, y - 6, 14, col, .3 + .15 * Math.sin(t * 1.3 + ph)); }
      };
    }
    // luminous fungus cluster on floor / walls
    function fungusDeco(x, y, col, ph, flip) {
      const caps = []; const rng = U.RNG(R(x * 7 + y));
      for (let k = 0; k < rng.int(2, 4); k++) caps.push([rng.int(-5, 5), rng.int(2, 6), rng.int(1, 2)]);
      return {
        x, y, r: 30, layer: 'back',
        draw(ctx, t) {
          for (const [dx, h, r] of caps) {
            const s = flip ? 1 : -1;
            ctx.fillStyle = '#c8e8e0'; ctx.fillRect(x + dx, flip ? y : y - h, 1, h);
            ctx.fillStyle = col; ctx.fillRect(x + dx - r, y + s * h - (flip ? 0 : 1), 2 * r + 1, 1 + (r > 1 ? 1 : 0));
          }
        },
        fx(ctx, t) { G.Glow.add(x, y - (flip ? -3 : 3), 10, col, .35 + .2 * Math.sin(t * 1.7 + ph)); }
      };
    }
    // water reflections dancing on a wall above glowing water (caustic light)
    function causticDeco(x0, x1, y, col, ph) {
      const n = Math.max(2, R((x1 - x0) / 7)), pts = [];
      const rng = U.RNG(R(x0 * 3 + y));
      for (let i = 0; i < n * 3; i++) pts.push([rng.range(x0, x1), rng.range(4, 30), rng.range(0, 6), rng.int(2, 5)]);
      return {
        x: (x0 + x1) / 2, y: y - 16, r: (x1 - x0) / 2 + 30, layer: 'back',
        draw(ctx, t) {
          ctx.fillStyle = col;
          for (const [px, py, p, w] of pts) {
            const a = Math.sin(t * 2.1 + p) * .5 + .5;
            if (a < .35) continue;
            ctx.globalAlpha = a * .55 * (1 - py / 34);
            ctx.fillRect(R(px + Math.sin(t * 1.3 + p) * 3), R(y - py), w, 1);
          }
          ctx.globalAlpha = 1;
        }
      };
    }
    // a slow fish swimming in world space (for flooded places)
    function fishDeco(x, y, range, col, ph, o = {}) {
      const s = o.s || 1;
      return {
        x, y, r: range + 20, layer: o.layer || 'back',
        draw(ctx, t) {
          const u = Math.sin(t * .25 * (o.speed || 1) + ph), dir = Math.cos(t * .25 * (o.speed || 1) + ph) > 0 ? 1 : -1;
          const fx = R(x + u * range), fy = R(y + Math.sin(t * .7 + ph) * 3), tail = Math.sin(t * 8 + ph) > 0 ? 1 : 0;
          ctx.fillStyle = col;
          ctx.fillRect(fx - 3 * s, fy, 6 * s, 2 * s); ctx.fillRect(fx - 2 * s, fy - 1, 4 * s, 1);
          ctx.fillRect(fx - dir * 4 * s - (dir < 0 ? s - 1 : 0), fy - tail, s, 2 * s + 1 - tail);
          ctx.fillStyle = o.belly || U.shade(col, .5); ctx.fillRect(fx - 2 * s, fy + 2 * s - 1, 4 * s, 1);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(fx + dir * 2 * s, fy, 1, 1);
        },
        fx: o.glow ? function (ctx, t) { const u = Math.sin(t * .25 * (o.speed || 1) + ph); G.Glow.add(x + u * range, y, 8, o.glow, .35); } : undefined
      };
    }
    // floating lantern (memory lantern / underwater lantern), bobbing in world space
    function floatLantern(x, y, o = {}) {
      const body = o.body || '#ff9a4a', core = o.core || '#fff0c0', ph = o.ph || x * .013, amp = o.amp || 6, rise = o.rise || 0;
      const pos = t => [x + Math.sin(t * .4 + ph) * amp * .6, y + Math.sin(t * .7 + ph) * amp - (rise ? ((t * rise + ph * 40) % 120) : 0)];
      return {
        x, y: y - (rise ? 60 : 0), r: 80 + amp, layer: o.layer || 'back',
        light: o.light === false ? undefined : { r: o.lightR || 56, color: o.lightC || body, a: .8, flicker: true },
        update(d, t) { },
        draw(ctx, t) {
          const [px, py] = pos(t), X = R(px), Y = R(py);
          if (o.kind === 'paper') { // paper lantern: rounded, ribbed
            ctx.fillStyle = U.shade(body, -.35); ctx.fillRect(X - 3, Y - 4, 7, 9); ctx.fillRect(X - 4, Y - 2, 9, 5);
            ctx.fillStyle = body; ctx.fillRect(X - 2, Y - 3, 5, 7); ctx.fillRect(X - 3, Y - 1, 7, 3);
            ctx.fillStyle = core; ctx.fillRect(X - 1, Y - 1, 3, 3);
            ctx.fillStyle = '#2a1a14'; ctx.fillRect(X - 1, Y - 5, 3, 1); ctx.fillRect(X - 1, Y + 5, 3, 1); ctx.fillRect(X, Y + 6, 1, 2 + (Math.sin(t * 3 + ph) > 0 ? 1 : 0));
          } else { // brass chirog lantern
            ctx.fillStyle = '#3a2418'; ctx.fillRect(X - 2, Y - 6, 5, 1); ctx.fillRect(X, Y - 8, 1, 2); ctx.fillRect(X - 2, Y + 5, 5, 1);
            ctx.fillStyle = body; ctx.fillRect(X - 3, Y - 5, 7, 10);
            ctx.fillStyle = core; ctx.fillRect(X - 1, Y - 3, 3, 6);
            ctx.fillStyle = U.shade(body, -.4); ctx.fillRect(X + 3, Y - 5, 1, 10); ctx.fillRect(X - 3, Y - 1, 7, 1);
          }
        },
        fx(ctx, t) { const [px, py] = pos(t); G.Glow.add(px, py, o.glowR || 18, o.glow || body, (o.glowA || .55) * (.85 + .15 * Math.sin(t * 5 + ph))); },
        _pos: pos
      };
    }
    // string of hanging lanterns between two points (catenary)
    function lanternString(x0, y0, x1, y1, sag, cols, o = {}) {
      const n = Math.max(2, Math.floor(Math.abs(x1 - x0) / (o.step || 16)));
      const pt = (k, t) => { const u = k / n; return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u) + Math.sin(t * 1.1 + u * 3 + x0) * .8]; };
      return {
        x: (x0 + x1) / 2, y: (y0 + y1) / 2 + sag, r: Math.abs(x1 - x0) / 2 + 40, layer: o.layer || 'back',
        light: { r: Math.min(120, Math.abs(x1 - x0) * .55), color: o.lightC || '#ffb070', a: o.lightA || .7, flicker: true },
        draw(ctx, t) {
          ctx.fillStyle = o.cord || '#1a1210';
          for (let k = 0; k < n * 4; k++) { const [x, y] = pt(k / 4, t); ctx.fillRect(R(x), R(y), 1, 1); }
          for (let k = 1; k < n; k++) {
            const [x, y] = pt(k, t), c = cols[k % cols.length];
            ctx.fillStyle = U.shade(c, -.4); ctx.fillRect(R(x) - 2, R(y) + 1, 5, 6);
            ctx.fillStyle = c; ctx.fillRect(R(x) - 1, R(y) + 1, 3, 6); ctx.fillRect(R(x) - 2, R(y) + 2, 5, 4);
            ctx.fillStyle = '#fff2c8'; ctx.fillRect(R(x), R(y) + 3, 1, 2);
          }
        },
        fx(ctx, t) { for (let k = 1; k < n; k++) { const [x, y] = pt(k, t); G.Glow.add(x, y + 4, 10, cols[k % cols.length], .5 + .2 * Math.sin(t * 3 + k)); } }
      };
    }
    // vertical light beam in the world (from a shaft in the ceiling), drawn additively in fx
    function beamDeco(x, y0, y1, w, col, a, ph) {
      const h = Math.max(8, y1 - y0), spr = shaftSprite(w, R(h), col, R(w * .8));
      const motes = []; const rng = U.RNG(R(x + y0));
      for (let i = 0; i < 10; i++) motes.push([rng.range(-w / 2, w / 2), rng.range(0, h), rng.range(0, 6)]);
      return {
        x, y: y0 + h / 2, r: h / 2 + w + 10, layer: 'front',
        draw(ctx, t) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.globalAlpha = a * (.8 + .2 * Math.sin(t * .6 + ph)); ctx.drawImage(spr, R(x - spr.width / 2), R(y0));
          ctx.fillStyle = col;
          for (const [mx, my, p] of motes) { const yy = (my + t * 6 + p * 10) % h; ctx.globalAlpha = a * 1.6 * (1 - yy / h) * (.5 + .5 * Math.sin(t * 2 + p)); ctx.fillRect(R(x + mx + Math.sin(t * .7 + p) * 3), R(y0 + yy), 1, 1); }
          ctx.restore();
        }
      };
    }
    // places on floors near back walls, spaced
    function spaced(list, minGap, key = 'tx') { const out = []; let last = -1e9; for (const s of list.slice().sort((a, b) => a[key] - b[key])) if (s[key] - last >= minGap) { out.push(s); last = s[key]; } return out; }
    const air = (L, x, y) => L.get(x, y) === T.AIR;
    // open extra windows in a cave's back wall so the painted depth shows (visual only; runs before bake)
    function caveWindows(L, thr, seedK) {
      if (!L.isOpen || !L.back) return;
      const sd = (L.seed % 83) + (seedK || 5);
      for (let y = 1; y < L.h - 1; y++) for (let x = 1; x < L.w - 1; x++) {
        const i = y * L.w + x;
        if (!L.back[i] || L.get(x, y) !== T.AIR || (L.structOf && L.structOf(x, y))) continue;
        const n = U.noise2(x / 11, y / 7, sd) * .75 + U.noise2(x / 4, y / 3, sd + 1) * .25;
        if (n > thr) L.back[i] = 0;
      }
    }

    /* ================================================================== */
    /* =========================== THE KAREZ ============================ */
    /* ================================================================== */
    // wet clay, the Sleeper's flesh-rock, salt and teal mineral water
    const KZ = {
      clay: ramp(['#14100e', '#211a16', '#2e241e', '#3c3027', '#4a3c30', '#5a4a3a']),
      flesh: ramp(['#120a10', '#1e1018', '#2a1620', '#38202a']),
      wet: C('#8adcd0'), wet2: C('#3e8a86'), salt: C('#d8ece6'), salt2: C('#a8c8c0'), moss: C('#2a6a5a'), moss2: C('#4aa08a'),
      under: C('#060a0a'), drip: C('#8af8ee'), bone: ramp(['#5a5448', '#7a7262', '#a89e88', '#d0c6ae']),
      brick: ramp(['#0c0f0f', '#151a19', '#1c2221', '#242b29', '#2c3431']), mortar: C('#080b0b'), stain: C('#0e2424'), root: C('#2a2018')
    };
    const kzStrata = (wx, wy) => { const n = U.noise2(wx / 40, wy / 9, 501); return (wy + n * 9) / 6; };
    const kzSolidTile = Art.pixTile((pix, info, ox, oy) => {
      const dk = [1, 1, .86, .74, .64, .56, .5, .46, .44][Math.min(8, info.depth)];
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const wx = info.x + x, wy = info.y + y;
        const fl = U.noise2(wx / 26, wy / 18, 502) > .6; // flesh-rock of the Sleeper showing through
        const s = kzStrata(wx, wy), band = ((Math.floor(s) % 4) + 4) % 4, n = U.noise2(wx / 7, wy / 5, 503);
        let c;
        if (fl) c = rampAt(KZ.flesh, .3 + .5 * n + (band === 1 ? .2 : 0), wx, wy);
        else c = rampAt(KZ.clay, .25 + .12 * band + .35 * n, wx, wy);
        const cr = Math.abs(U.noise2(wx / 9, wy / 6, 504) - .5);
        if (cr < .022) c = fl ? C('#4a2432') : C('#0e0b0a');
        else if (!fl && U.hash(wx, wy, 505) < .012) c = KZ.salt2;            // salt grains
        else if (!fl && Math.abs(s - Math.round(s)) < .07) c = shadeP(c, 1.18); // strata line
        // embedded bones / ribs of the giant
        const bn = U.noise2(wx / 30, wy / 30, 506);
        if (bn > .78 && Math.abs(U.noise2(wx / 5, wy / 14, 507) - .5) < .08) c = rampAt(KZ.bone, .3 + .6 * n, wx, wy);
        pix.set(ox + x, oy + y, shadeP(c, dk));
      }
      if (info.up) for (let x = 0; x < 16; x++) { // wet top: moss, glistening film, salt crust
        const wx = info.x + x, h = U.hash(wx, info.ty, 510);
        pix.set(ox + x, oy, h < .6 ? KZ.moss2 : KZ.salt); pix.set(ox + x, oy + 1, h < .4 ? KZ.moss : KZ.wet2);
        if (h < .25) pix.set(ox + x, oy + 2, KZ.moss);
        if (U.hash(wx, info.ty, 511) < .12) pix.set(ox + x, oy - 1, h < .5 ? KZ.moss2 : KZ.salt); // tufts
        if (U.hash(wx, info.ty, 512) < .05) pix.set(ox + x, oy, KZ.wet);
      }
      if (info.left) for (let y = 0; y < 16; y++) pix.set(ox, oy + y, shadeP(pix.get(ox, oy + y), 1.25));
      if (info.right) for (let y = 0; y < 16; y++) pix.set(ox + 15, oy + y, shadeP(pix.get(ox + 15, oy + y), .62));
      if (info.down) for (let x = 0; x < 16; x++) { // ceiling: dark lip, wet beads, little roots
        const wx = info.x + x, h = U.hash(wx, info.ty, 513);
        pix.set(ox + x, oy + 15, KZ.under); pix.set(ox + x, oy + 14, shadeP(pix.get(ox + x, oy + 14), .55));
        if (h < .07) { pix.set(ox + x, oy + 16, KZ.wet2); if (h < .03) pix.set(ox + x, oy + 17, KZ.drip); }
        else if (h > .9) { const l = 1 + Math.floor(5 * U.hash(wx, info.ty, 514)); for (let k = 0; k < l; k++) pix.set(ox + x + (k > 2 ? 1 : 0), oy + 16 + k, KZ.root); }
      }
    }, 6);
    const kzSolid = PK.deepWrap(kzSolidTile, ['#0c0a09', '#0e0b0a', '#0a0908'], { minDepth: 5, dk: [1, 1, .9, .8, .72, .66, .62, .6, .58] });
    const kzBack = Art.pixTile((pix, info, ox, oy) => { // brick-lined tunnel wall, wet streaks, raw rock patches
      for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
        const wx = info.x + x, wy = info.y + y, row = Math.floor(wy / 5), bx = wx + (row & 1) * 5, inB = (wy % 5) !== 0 && (((bx % 10) + 10) % 10) !== 0;
        const raw = U.noise2(wx / 34, wy / 22, 520) > .62, n = U.noise2(wx / 6, wy / 6, 521);
        let c;
        if (raw) { c = rampAt([C('#070b0b'), C('#0b1112'), C('#101818'), C('#152020')], .2 + .6 * n, wx, wy); if (Math.abs(U.noise2(wx / 8, wy / 8, 525) - .5) < .02) c = C('#2a141c'); }
        else if (!inB) c = KZ.mortar;
        else c = rampAt(KZ.brick, .2 + .5 * U.hash(Math.floor(bx / 10), row, 522) + .25 * n, wx, wy);
        const streak = U.noise2(wx / 3, wy / 60, 523);
        if (streak > .72) c = shadeP(mixP(c, KZ.stain, .5), .9);
        if (U.hash(wx, wy, 524) < .004) c = C('#2e5a54');
        pix.set(ox + x, oy + y, c);
      }
    }, 0);
    const kzPlat = Art.pixTile((pix, info, ox, oy) => { // repair boards on rope over the channels
      const wood = ramp(['#1e140e', '#3a2618', '#5a3c24', '#7a5634']);
      for (let x = 0; x < 16; x++) {
        const wx = info.x + x, seam = ((wx % 7) + 7) % 7 === 0;
        for (let y = 0; y < 4; y++) pix.set(ox + x, oy + y, seam ? wood[0] : rampAt(wood, (y === 0 ? .95 : y === 3 ? .15 : .55) + .2 * (U.hash(wx, y, 530) - .5), wx, y));
        if (U.hash(wx, info.ty, 531) < .1) pix.set(ox + x, oy, KZ.moss2);
      }
      pix.rect(ox, oy + 4, 16, 1, C('#0a0806'));
      if (info.leftT !== T.PLAT) { pix.rect(ox, oy - 1, 2, 7, C('#2a1c12')); pix.set(ox, oy + 7, C('#2a1c12')); }
      if (info.rightT !== T.PLAT) { pix.rect(ox + 14, oy - 1, 2, 7, C('#2a1c12')); pix.set(ox + 15, oy + 7, C('#2a1c12')); }
      if ((info.tx & 3) === 0) for (let y = 5; y < 8; y++) pix.set(ox + 8, oy + y, C('#8a7a5a')); // rope ties
    }, 4);
    const kzSpike = Art.pixTile((pix, info, ox, oy) => { // salt-and-bone stalagmites
      for (let k = 0; k < 4; k++) {
        const bx = ox + 4 * k, h = 6 + ((info.tx * 5 + k * 3) % 4) * 2;
        for (let y = 0; y < h; y++) { const w = Math.max(0, 1.7 * (1 - y / h)); for (let x = R(2 - w); x <= R(1 + w); x++) pix.set(bx + x, oy + 13 - y, x < 2 ? KZ.salt : KZ.salt2); }
        pix.set(bx + 1, oy + 13 - h, C('#ffffff'));
      }
      pix.rect(ox, oy + 13, 16, 3, KZ.clay[2]); pix.rect(ox, oy + 13, 16, 1, KZ.moss);
    }, 4);
    const KAREZ_TILES = { solid: kzSolid, plat: kzPlat, back: kzBack, spike: kzSpike };

    // background: a gallery of tunnel mouths with water light, karez shafts of daylight, the giant's roots and ribs
    function karezBG(L, o = {}) {
      const seed = (L.seed || 1) % 997;
      const far = paint(480, 270, P => { // tunnel mouths receding
        for (let y = 0; y < 270; y++) for (let x = 0; x < 480; x++) P.set(x, y, rampAt([C('#061416'), C('#0a1d20'), C('#0e2629'), C('#13302f')], .15 + .55 * pn2(x, y, 480, 30, seed + 1) + .25 * (y / 270), x, y));
        for (let y = 2; y < 196; y += 7) for (let x = 0; x < 480; x++) { const bx = (x + ((y / 7) & 1) * 7) % 14; if (bx === 0) P.set(x, y, C('#081618')); P.set(x, y + 6, C('#081618')); }
        const rng = U.RNG(seed + 11);
        for (let k = 0; k < 5; k++) {
          const cx = 48 + k * 96 + rng.int(-10, 10), by = 150 + rng.int(-14, 14), w = rng.int(26, 40), h = w * 1.5;
          archShape(P, cx, by + 2, w + 10, h + 8, C('#1c3a3a'));   // brick ring
          archShape(P, cx, by + 1, w + 6, h + 4, C('#0c2224'));
          archShape(P, cx, by, w, h, C('#020707'));               // darkness inside
          archShape(P, cx, by, w * .6, h * .66, C('#041214'));    // the tunnel goes on
          archShape(P, cx, by, w * .3, h * .36, C('#0a3436'));    // light at its far end
          archShape(P, cx, by, w * .14, h * .18, C('#3a9a94'));
          for (let x = -w / 2 + 2; x < w / 2 - 1; x++) { P.set(cx + x, by - 1, C('#2a8a86')); P.set(cx + x, by, C('#1a5a5a')); if ((x & 3) === 0) P.set(cx + x, by - 2, C('#7ae8dc')); } // water glint
          for (let y = 1; y < 40; y++) for (let x = -w / 2 + 3; x < w / 2 - 2; x += 2) if (U.hash(x + cx, y, 7) < .25 * (1 - y / 40)) P.set(cx + x, by + y, C('#1e6a68')); // reflection below
          for (let y = 0; y < h; y += 5) { P.set(cx - w / 2 - 4, by - y, C('#0f2426')); P.set(cx + w / 2 + 3, by - y, C('#0f2426')); }
        }
        // a lower floor of black water with reflections
        for (let y = 196; y < 270; y++) for (let x = 0; x < 480; x++) P.set(x, y, rampAt([C('#020607'), C('#031012'), C('#06191b')], .4 + .3 * Math.sin(x * .05 + y * .3) * pn2(x, y, 480, 20, seed + 2), x, y));
        for (let i = 0; i < 260; i++) { const x = rng.int(0, 479), y = rng.int(198, 268); P.rect(x, y, rng.int(2, 6), 1, rng.chance(.3) ? C('#2aa49a') : C('#0e3a3a')); }
      });
      const ribs = paint(640, 270, P => { // the giant's ribs and roots arching through the rock
        const rng = U.RNG(seed + 21), col = C('#0a1a1c'), hi = C('#1c3a3a');
        for (let k = 0; k < 4; k++) {
          const cx = 80 + k * 160 + rng.int(-20, 20), w = rng.int(60, 90), top = rng.int(-30, 20), th = rng.int(5, 8);
          for (let a = 0; a <= 1; a += .004) { // rib arch
            const x = cx + Math.cos(Math.PI * (1 - a)) * w, y = top + 250 - Math.sin(Math.PI * a) * 230;
            P.rect(R(x - th / 2), R(y), th, 2, col); P.set(R(x - th / 2), R(y), hi);
          }
        }
        for (let k = 0; k < 18; k++) { // roots from the top
          let x = rng.int(0, 639), y = 0; const l = rng.int(40, 160);
          for (let i = 0; i < l; i++) { x += Math.sin(i * .07 + k) * .6 + rng.range(-.4, .4); y++; P.rect(x, y, i < l * .3 ? 3 : i < l * .7 ? 2 : 1, 1, col); }
          P.set(x, y + 1, C('#5af0e0'));
        }
        P.rim(hi, 1);
      });
      const pillars = paint(800, 270, P => { // near brick columns and arches of the karez
        const rng = U.RNG(seed + 31), c = C('#040b0c'), c2 = C('#0a1717'), hi = C('#16302e');
        for (let k = 0; k < 4; k++) {
          const x0 = k * 200 + rng.int(0, 40), w = rng.int(26, 40);
          P.rect(x0, 0, w, 270, c);
          for (let y = 0; y < 270; y += 6) for (let x = x0 + ((y / 6) & 1) * 4; x < x0 + w; x += 9) P.rect(x, y, 1, 6, c2);
          // arch springing from the pillar
          for (let a = 0; a <= 1; a += .003) { const x = x0 + w + Math.sin(a * Math.PI / 2) * 90, y = 40 - Math.cos(a * Math.PI / 2) * 40; P.rect(R(x), R(y) - 22, 2, 22 + R(Math.cos(a * Math.PI / 2) * 6), c); }
        }
        for (let x = 0; x < 800; x++) { const t = 236 + 18 * pfbm(x, 800, 8, seed + 32); P.col(x, t, 270, c); }
        P.rim(hi, 1); P.side(C('#0f2726'), -1);
      });
      const layers = [
        lay(L, far, .05, .02, 0),
        dlay(L, .05, .02, (ctx, ox, oy, t) => { // daylight down the karez shafts (the wells above)
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const spr = shaftSprite(10, 230, '#9ad8e0', 20);
          for (let k = 0; k < 3; k++) { const x = ((ox * 2 + 70 + k * 160) % 480 + 480) % 480 - 20; ctx.globalAlpha = .09 + .03 * Math.sin(t * .4 + k * 2); ctx.drawImage(spr, R(x), -10); }
          ctx.restore();
        }),
        lay(L, ribs, .14, .06, -8),
        dlay(L, .05, .02, (ctx, ox, oy, t) => { // the lower water breathes
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#2ad0c4';
          for (let i = 0; i < 26; i++) { const x = ((i * 53 + ox) % 480 + 480) % 480, y = 214 + oy + (i * 7) % 50, a = Math.sin(t * 1.4 + i) * .5 + .5; ctx.globalAlpha = .12 * a; ctx.fillRect(x + R(Math.sin(t + i) * 4), y, 3 + (i % 4), 1); }
          ctx.restore();
        }),
        lay(L, pillars, .3, .12, -14)
      ];
      return layers;
    }
    function karezDecor(L, rng, o = {}) {
      const D = L.decos;
      if (o.holes !== false) { // windows in the tunnel wall to the galleries beyond (visual only, before bake)
        const sd = (L.seed % 89) + 11;
        for (let y = 2; y < L.h - 2; y++) for (let x = 2; x < L.w - 2; x++) {
          const i = y * L.w + x;
          if (!L.back[i] || L.get(x, y) !== T.AIR) continue;
          if (U.noise2(x / 7, y / 5, sd) > .64 && air(L, x, y + 1) && air(L, x, y - 1)) L.back[i] = 0;
        }
      }
      // oil-lamp niches on back walls 1 tile above floors (warm, rare: the smugglers' marks)
      let n = 0;
      for (const run of spaced(K.floorRuns(L, 4, 3), o.lampGap || 34, 'x0')) {
        const tx = rng.int(run.x0 + 1, run.x1 - 1), ty = run.ty - 1;
        if (!L.back[ty * L.w + tx] || !air(L, tx, ty) || !air(L, tx, ty - 1)) continue;
        D.push(nicheLamp(tx * TS + 8, run.y - 12, { light: '#ffa860', r: 74 })); n++;
      }
      // roots from ceilings with glowing tips
      let next = 0;
      for (const s of L.spots.ceil.slice().sort((a, b) => a.tx - b.tx)) {
        if (s.tx < next || !rng.chance(.3)) continue;
        let room = 0; while (room < 8 && air(L, s.tx, s.ty + room)) room++;
        if (room < 4) continue;
        D.push(rootDeco(s.x + rng.int(-4, 4), s.y - 1, rng.int(10, Math.min(52, (room - 2) * 14)), s.tx, { tip: rng.chance(.5) ? '#7af8e8' : null, cols: ['#1a1410', '#2a2018', '#3e3024'] }));
        next = s.tx + rng.int(3, 7);
      }
      // salt crystals and glowing fungus on floors
      for (const run of K.floorRuns(L, 3, 3)) {
        if (rng.chance(.16)) D.push(crystalDeco((rng.int(run.x0, run.x1) + .5) * TS, run.y, rng.pick(['#8af8ee', '#bfefff', '#7ae8c8']), rng.range(0, 6), rng.range(.6, 1)));
        if (rng.chance(.25)) D.push(fungusDeco((rng.int(run.x0, run.x1) + .5) * TS, run.y, rng.pick(['#5af0d0', '#9affe0', '#6ad8ff']), rng.range(0, 6)));
      }
      // caustic reflections on the walls above glowing channels
      for (const ch of L.channels || []) D.push(causticDeco(ch.x0 * TS, (ch.x1 + 1) * TS, ch.ty * TS, '#8af8ee', rng.range(0, 6)));
      // daylight beams under some karez shafts: ceilings with a back-wall hole above
      let beams = 0;
      for (const s of spaced(L.spots.ceil, 40)) {
        if (beams > (o.beams || 4) || !rng.chance(.5)) continue;
        let room = 0; while (room < 12 && air(L, s.tx, s.ty + room)) room++;
        if (room < 5) continue;
        D.push(beamDeco(s.x, s.y, s.y + room * TS, 12, '#a8e8f0', .16, rng.range(0, 6))); beams++;
      }
    }
    function karezFg() { // dark hanging roots & clay lip silhouettes at the screen edges (closest layer)
      return lazy(() => paint(960, G.H, P => {
        const rng = U.RNG(77), c = C('#010304'), c2 = C('#04100f');
        for (let x = 0; x < 960; x++) { const t = 6 + 14 * pfbm(x, 960, 10, 71); P.col(x, 0, t, c); const b = G.H - 4 - 10 * pfbm(x, 960, 12, 72); P.col(x, b, G.H, c); }
        for (let k = 0; k < 16; k++) { let x = rng.int(0, 959); const l = rng.int(18, 60); for (let i = 0; i < l; i++) { x += Math.sin(i * .2 + k) * .4; P.rect(x, 8 + i, i < l * .5 ? 2 : 1, 1, i > l - 3 ? c2 : c); } }
      }));
    }

    guard('yd_karez', def => {
      def.tiles = KAREZ_TILES; def.postBake = null; // our own tiles replace the graded gut
      def.ambient = '#5a7480'; def.shade = '#4e6874'; def.deepShade = '#020405';
      def.dust = ['#2a3430', '#3a4a44', '#5a6a60']; def.rock = ['#3c3027', '#2e241e', '#a8c8c0'];
      def.drawSky = function (ctx) { ctx.drawImage(sky('karez', [[0, '#010405'], [.55, '#031012'], [1, '#062226']]), 0, 0); };
      def.buildBackground = L => karezBG(L);
      const fog = lazy(() => vgradCv([[0, 'rgba(2,10,12,0.55)'], [.5, 'rgba(4,20,24,0.25)'], [1, 'rgba(10,50,54,0.45)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(fog(), 0, 0); };
      const fg = karezFg();
      def.drawForeground = function (ctx, cam) { tileX(ctx, fg(), -cam.x * 1.25, 0); };
      const vig = lazy(() => vignetteCv('rgba(0,3,4,1)', .3, .62));
      def.post = function (ctx, cam, t) { blendFill(ctx, '#0a4a5a', .26); ctx.globalAlpha = .75; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1; };
      const prevAmb = def.ambientFx;
      def.ambientFx = both(prevAmb, particles({ rate: .03, cols: ['#bfffff', '#7af0e6'], vx: [-.04, .04], vy: [.03, .12], glow: true, glowR: 2, life: 420, alpha: .6, sway: .004 }));
      addDecorate(def, (L, rng) => karezDecor(L, rng));
    });

    /* ============================ THE GREAT CISTERN (arena) ============================ */
    guard('yd_cistern', def => {
      def.tiles = KAREZ_TILES; def.postBake = null;
      def.ambient = '#56707a'; def.shade = '#4a646e'; def.deepShade = '#020506';
      def.drawSky = function (ctx) { ctx.drawImage(sky('cistern', [[0, '#010304'], [.5, '#041214'], [1, '#08262a']]), 0, 0); };
      def.buildBackground = function (L) { // the sardoba: a huge ribbed brick dome with an oculus, and the pool below
        const domeCv = paint(520, 270, P => {
          const cx = 260, cy = 250, rx = 260, ry = 236, br = ramp(['#030a0b', '#061214', '#0a1b1c', '#0f2425', '#142c2c']);
          for (let y = 0; y < 270; y++) for (let x = 0; x < 520; x++) {
            const dx = (x - cx) / rx, dy = (y - cy) / ry, r = Math.hypot(dx, dy);
            if (r > 1) { P.set(x, y, C('#020607')); continue; }
            const ang = Math.atan2(dy, dx), ring = Math.floor(r * 26), rib = Math.abs(((ang / Math.PI * 16) % 1 + 1) % 1 - .5);
            const brickRow = Math.floor((r * ry) / 4), bpos = (((ang * 140 + (brickRow & 1) * 3) % 7) + 7) % 7;
            let t = .25 + .5 * (1 - r) + .2 * pn2(x, y, 480, 16, 61);
            if (rib < .04) t += .3; else if (bpos < .6 || ((r * ry) % 4) < .7) t -= .2;
            P.set(x, y, rampAt(br, t, x, y));
            if (rib < .04 && ring % 3 === 0) P.set(x, y, C('#1e3c3a'));
          }
          P.disc(cx, cy - ry + 10, 16, C('#cfeff0')); P.disc(cx, cy - ry + 10, 12, C('#ffffff')); // oculus
          P.ell(cx, cy - ry + 12, 20, 7, C('#0a1b1c'));
          P.disc(cx, cy - ry + 10, 10, C('#e8ffff'));
          for (let y = 206; y < 270; y++) for (let x = 0; x < 520; x++) P.set(x, y, rampAt([C('#020708'), C('#04141a'), C('#0a2a30')], .3 + .5 * (y - 206) / 64 * pn2(x, y * 3, 520, 26, 62), x, y));
          for (let x = 0; x < 520; x++) if (Math.abs(x - 260) < 70 && (x * 7) % 5 < 2) P.set(x, 208 + R(Math.abs(x - 260) / 18), C('#8adcd8')); // oculus reflection
        });
        return [
          { canvas: domeCv, fx: .05, fy: .03, y: -6, repeat: false, x: -10 + 0 },
          dlay(L, .05, .03, (ctx, ox, oy, t) => {
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            const spr = shaftSprite(22, 250, '#b8f0f0', 30);
            ctx.globalAlpha = .2 + .04 * Math.sin(t * .5); ctx.drawImage(spr, R(250 - 41 + ox), R(18 + oy - 6));
            ctx.globalAlpha = .1; ctx.fillStyle = '#8adcd8';
            for (let i = 0; i < 14; i++) ctx.fillRect(R(170 + ox - 10 + ((i * 37 + t * 8) % 140)), R(212 + oy + (i * 5) % 20), 4, 1);
            ctx.restore();
          }),
          ...karezBG(L).slice(2)
        ];
      };
      const fog = lazy(() => vgradCv([[0, 'rgba(2,10,12,0.4)'], [1, 'rgba(10,50,54,0.4)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(fog(), 0, 0); };
      const vig = lazy(() => vignetteCv('rgba(0,3,4,1)', .32, .64));
      def.post = function (ctx, cam, t) {
        blendFill(ctx, '#0a4a5a', .24);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; const s = shaftSprite(26, 300, '#a8e8f0', 40); ctx.globalAlpha = .07 + .02 * Math.sin(t * .5); ctx.drawImage(s, R(G.W / 2 - 53 - (cam.x - 200) * .04), -10); ctx.restore();
        ctx.globalAlpha = .7; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1;
      };
      addDecorate(def, (L, rng) => karezDecor(L, rng, { lampGap: 14, beams: 0 }));
    });

    /* ================================================================== */
    /* ======================= THE SWALLOWED STREETS ===================== */
    /* ================================================================== */
    // half the Tail slid down here: tilted houses buried in the cave walls, lamps still burning in a few windows
    function tiltedHouse(P, x, by, w, h, tilt, c, win, rng, o = {}) {
      // tilt: shear in px per px of height (houses leaning as they slid)
      for (let y = 0; y < h; y++) { const sx = R(tilt * y); for (let xx = 0; xx < w; xx++) P.set(x + xx + sx, by - y, c); }
      const sx = R(tilt * h);
      if (o.dome) dome(P, x + sx + w / 2, by - h + 1, w * .38, c, { drum: 3, onion: .3 });
      else { for (let k = 0; k < 3; k++) P.rect(x + sx - 2 + R(tilt * k), by - h - k, w + 4, 1, c); } // flat roof with eaves
      // ayvan posts / doors / windows
      const rows = Math.floor((h - 6) / 9);
      for (let r = 0; r < rows; r++) for (let k = 0; k < Math.floor(w / 7); k++) {
        if (!rng.chance(.55)) continue;
        const wx = x + 3 + k * 7 + R(tilt * (6 + r * 9)), wy = by - 6 - r * 9;
        const lit = rng.chance(o.lit || .25);
        P.rect(wx, wy - 4, 3, 4, lit ? rng.pick(win) : o.dark || C('#04030a'));
        if (lit) P.rect(wx, wy, 3, 1, C('#2a1a10'));
      }
    }
    guard('yd_streets', def => {
      def.drawSky = function (ctx) { ctx.drawImage(sky('streets', [[0, '#020104'], [.5, '#08060e'], [1, '#18101a']]), 0, 0); };
      def.buildBackground = function (L) {
        const seed = (L.seed || 1) % 991;
        const WIN = [C('#ffb860'), C('#ff9a40'), C('#ffd890')];
        const far = paint(720, 270, P => { // cavern wall with a whole street embedded at odd angles
          for (let y = 0; y < 270; y++) for (let x = 0; x < 720; x++) P.set(x, y, rampAt([C('#07050b'), C('#0b0812'), C('#100c18'), C('#151020')], .2 + .7 * pn2(x, y * 1.4, 720, 36, seed + 1) * (y / 270 + .4), x, y));
          const rng = U.RNG(seed + 2);
          let x = 0;
          while (x < 700) { // a street sliding down to the right
            const w = rng.int(18, 34), h = rng.int(20, 44), by = 120 + R(x * .12) + rng.int(-6, 6);
            tiltedHouse(P, x, by, w, h, rng.range(-.25, .35), C('#1c1626'), WIN, rng, { lit: .12, dome: rng.chance(.15), dark: C('#0a0812') });
            x += w + rng.int(2, 10);
          }
          for (let y = 0; y < 270; y++) for (let xx = 0; xx < 720; xx++) { // earth over the street (strata), slanted
            const top = 40 + 30 * pfbm(xx, 720, 6, seed + 3) + xx * .02, bot = 150 + xx * .12 + 20 * pfbm(xx, 720, 9, seed + 4);
            if (y < top || y > bot) { const cur = P.get(xx, y); if (y < top || !(cur >>> 24) || y > bot + 4) P.set(xx, y, rampAt([C('#06040a'), C('#0d0912'), C('#130e1a')], .3 + .5 * pn2(xx, y * 3, 720, 18, seed + 5), xx, y)); }
          }
        });
        const mid = paint(800, 270, P => { // closer: a leaning minaret, roofs half-swallowed, hanging beams
          const rng = U.RNG(seed + 11), c = C('#0c0912'), hi = C('#2a2034');
          for (let k = 0; k < 3; k++) {
            const x0 = k * 270 + rng.int(0, 60);
            // leaning minaret
            const lean = rng.range(-.35, .35), h = rng.int(100, 150), by = 230;
            for (let y = 0; y < h; y++) { const hw = 6 - 2 * y / h, cx = x0 + lean * y; for (let xx = R(cx - hw); xx <= R(cx + hw); xx++) P.set(xx, by - y, c); }
            P.rect(R(x0 + lean * h) - 9, by - h, 19, 3, c);
            for (let y = 20; y < h - 10; y += 22) P.rect(R(x0 + lean * y) - 7, by - y, 15, 1, hi);
            // houses half under the earth
            let x = x0 + 30;
            for (let j = 0; j < 4; j++) { const w = rng.int(24, 40), hh = rng.int(30, 56); tiltedHouse(P, x, 236, w, hh, rng.range(-.3, .3), c, WIN, rng, { lit: .1, dome: rng.chance(.2) }); x += w + rng.int(4, 14); }
          }
          for (let x = 0; x < 800; x++) { const t = 205 + 30 * pfbm(x, 800, 8, seed + 12); P.col(x, t, 270, C('#08060c')); }
          P.rim(hi, 1);
        });
        const near = paint(960, 270, P => { // stalactites, roots, a fallen beam, rubble
          const rng = U.RNG(seed + 21), c = C('#040306');
          for (let x = 0; x < 960; x++) { const t = 14 + 26 * pfbm(x, 960, 14, seed + 22) + (U.hash(x >> 2, 0, seed) < .15 ? 20 * U.hash(x >> 2, 1, seed) : 0); P.col(x, 0, t, c); const b = 246 + 16 * pfbm(x, 960, 16, seed + 23); P.col(x, b, 270, c); }
          for (let k = 0; k < 4; k++) { const x = rng.int(0, 900), y = rng.int(150, 220); P.line(x, y, x + rng.int(60, 120), y + rng.int(-40, 40), c, 4); }
          for (let k = 0; k < 20; k++) { let x = rng.int(0, 959); const l = rng.int(20, 90); for (let i = 0; i < l; i++) { x += Math.sin(i * .15 + k) * .5; P.rect(x, 20 + i, i < l * .4 ? 2 : 1, 1, c); } }
          P.rim(C('#1a1222'), 1);
        });
        return [
          { canvas: far, fx: .06, fy: .03, y: R(-10 + camRef(L) * .03) },
          dlay(L, .06, .03, (ctx, ox, oy, t) => { // window lights breathe; sand trickles from the cave roof
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (let k = 0; k < 4; k++) { const x = ((ox + 90 + k * 180) % 720 + 720) % 720 - 60, y = 60 + oy; ctx.fillStyle = '#b89870'; for (let i = 0; i < 12; i++) { const yy = (t * 40 + i * 13 + k * 7) % 160; ctx.globalAlpha = .18 * (1 - yy / 160); ctx.fillRect(R(x + Math.sin(i) * .7), R(y + yy), 1, 3); } }
            ctx.restore();
          }),
          { canvas: mid, fx: .16, fy: .07, y: R(-20 + camRef(L) * .07) },
          { canvas: near, fx: .34, fy: .14, y: R(-10 + camRef(L) * .14) }
        ];
      };
      const fog = lazy(() => vgradCv([[0, 'rgba(4,2,8,0.5)'], [.6, 'rgba(14,10,24,0.2)'], [1, 'rgba(30,22,40,0.5)']]));
      const band = lazy(() => fogBand(480, 60, '#3a2e48', 81, .5));
      def.fogBehind = function (ctx, cam, t) { ctx.drawImage(fog(), 0, 0); ctx.globalAlpha = .35; tileX(ctx, band(), -cam.x * .2 + t * 3, 190); ctx.globalAlpha = 1; };
      const vig = lazy(() => vignetteCv('rgba(2,0,4,1)', .3, .62));
      def.post = function (ctx) { blendFill(ctx, '#2a1840', .26); ctx.globalAlpha = .7; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1; };
      def.ambientFx = both(def.ambientFx, particles({ rate: .025, cols: ['#ffd8a0', '#c8a0ff'], vx: [-.05, .05], vy: [-.08, -.02], glow: true, glowR: 3, life: 360, alpha: .7, sway: .004 }));
      addDecorate(def, (L, rng) => {
        const D = L.decos;
        caveWindows(L, .52, 3);
        // broken lanterns still hanging under the swallowed roofs (dim, uneven)
        for (const s of L.structures || []) {
          if (s.kind === 'building' && rng.chance(.7)) D.push(K.lantern((rng.chance(.5) ? s.x0 - 1 : s.x1 + 1) * TS + 8, (s.roofY + 1) * TS, { color: rng.pick(['#8a3020', '#a06a20', '#2a5a80']), lightC: '#ff9a50', glow: '#ff9a40', lightR: 62, len: rng.int(3, 9), lightA: .8 }));
          if (s.kind === 'colonnade' && s.pillars && s.pillars.length > 2 && rng.chance(.6)) { const k = rng.int(1, s.pillars.length - 1); D.push(K.lantern((s.pillars[k - 1] + s.pillars[k]) / 2 * TS + 10, (s.roofY + 1) * TS, { color: '#a06a20', len: 5, lightC: '#ffa860', lightR: 64 })); }
        }
        // sand trickling from cracks in the cave ceiling
        if (L.ceilRow) for (let x = 8; x < L.w - 8; x += rng.int(14, 30)) {
          const X = x * TS + rng.int(2, 13), Y = (L.ceilRow[x] + 1) * TS;
          let fy = L.ceilRow[x] + 1; while (fy < L.h - 1 && air(L, x, fy)) fy++;
          const len = (fy - L.ceilRow[x] - 1) * TS, ph = rng.range(0, 6);
          if (len < 32) continue;
          D.push({ x: X, y: Y + len / 2, r: len / 2 + 10, layer: 'back', draw(ctx, t) {
            ctx.fillStyle = '#6a5a4a';
            for (let i = 0; i < 9; i++) { const yy = (t * 70 + i * len / 9 + ph * 30) % len; ctx.globalAlpha = .7; ctx.fillRect(X + (i & 1), R(Y + yy), 1, 3); }
            ctx.globalAlpha = .5; ctx.fillRect(X - 2, Y + len - 2, 5, 2); ctx.fillRect(X - 1, Y + len - 3, 3, 1); ctx.globalAlpha = 1;
          } });
        }
        // puddles that hold a little light
        for (const run of K.floorRuns(L, 5, 3)) if (rng.chance(.25)) {
          const x0 = (rng.int(run.x0, run.x1 - 2)) * TS, w = rng.int(14, 34), y = run.y - 1, ph = rng.range(0, 6);
          D.push({ x: x0 + w / 2, y, r: w, layer: 'mid', draw(ctx, t) {
            ctx.fillStyle = '#0a1420'; ctx.fillRect(x0, y, w, 1);
            ctx.fillStyle = '#5a7aa8'; for (let i = 0; i < w; i += 5) if (Math.sin(t * 2 + i + ph) > .2) ctx.fillRect(x0 + i, y, 2, 1);
          } });
        }
        // roots with dim violet tips
        if (L.ceilRow) for (let x = 6; x < L.w - 6; x += rng.int(9, 18)) D.push(rootDeco(x * TS + 8, (L.ceilRow[x] + 1) * TS, rng.int(14, 36), x, { tip: rng.chance(.3) ? '#c8a0ff' : null, cols: ['#1e1612', '#2c2018', '#3a2c20'] }));
      });
    });

    /* ================================================================== */
    /* ============================ OLD YODGOR =========================== */
    /* ================================================================== */
    // crimson ruins under a bitten sun
    guard('yd_old', def => {
      const SUN = { x: 330, y: 92, r: 30 };
      def.drawSky = function (ctx, cam, t) {
        const cv = sky('old', [[0, '#12030a'], [.28, '#3a0a16'], [.55, '#7a1a1e'], [.78, '#c0402a'], [.92, '#e8743a'], [1, '#f0a050']], (c) => {
          // cloud streaks lit from below
          const rng = U.RNG(31);
          for (let i = 0; i < 46; i++) { const y = rng.int(30, 200), x = rng.int(-40, 480), w = rng.int(40, 160); c.fillStyle = y > 120 ? 'rgba(255,140,80,0.10)' : 'rgba(150,30,40,0.18)'; c.fillRect(x, y, w, 1); if (rng.chance(.5)) { c.fillStyle = 'rgba(30,4,10,0.3)'; c.fillRect(x + 6, y + 1, w - 10, 2); } }
          // the bitten sun: a disc with a bite of darkness taken out of it
          const g = c.createRadialGradient(SUN.x, SUN.y, SUN.r * .6, SUN.x, SUN.y, SUN.r * 4);
          g.addColorStop(0, 'rgba(255,200,120,0.55)'); g.addColorStop(.3, 'rgba(255,90,50,0.22)'); g.addColorStop(1, 'rgba(120,10,20,0)');
          c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
          const P = painter(G.W, G.H);
          P.disc(SUN.x, SUN.y, SUN.r, C('#ffd890')); P.disc(SUN.x, SUN.y, SUN.r - 2, C('#fff0c8'));
          for (let k = 0; k < 7; k++) { const a = -1.2 + k * .22; P.disc(SUN.x + Math.cos(a) * SUN.r * 1.05, SUN.y + Math.sin(a) * SUN.r * 1.05, SUN.r * .26, 0); } // tooth marks
          P.disc(SUN.x + SUN.r * .62, SUN.y - SUN.r * .5, SUN.r * .72, 0);
          // dark rim inside the bite
          const s = P.pix.d.slice();
          for (let y = 1; y < G.H - 1; y++) for (let x = 1; x < G.W - 1; x++) { const i = y * G.W + x; if ((s[i] >>> 24) && (!(s[i - 1] >>> 24) || !(s[i + 1] >>> 24) || !(s[i - G.W] >>> 24) || !(s[i + G.W] >>> 24))) P.pix.d[i] = C('#ff8a4a'); }
          c.drawImage(P.canvas(), 0, 0);
        });
        ctx.drawImage(cv, 0, 0);
        // slow ash clouds crossing the sun
        ctx.globalAlpha = .5; tileX(ctx, ashBand(), -cam.x * .03 + t * 2, 70); ctx.globalAlpha = .35; tileX(ctx, ashBand(), -cam.x * .05 - t * 3.5, 128); ctx.globalAlpha = 1;
      };
      const ashBand = lazy(() => fogBand(480, 50, '#2a0810', 41, .55));
      def.buildBackground = function (L) {
        const seed = (L.seed || 1) % 997;
        const EMB = [C('#ff7a3a'), C('#ffb060'), C('#ff5a2a')];
        const ridge = paint(480, 270, P => { // far mesas in haze
          for (let x = 0; x < 480; x++) { const t = 150 + 40 * pfbm(x, 480, 5, seed + 1); for (let y = R(t); y < 270; y++) P.set(x, y, rampAt([C('#8a2a2a'), C('#6a1e24'), C('#4a141c')], (y - t) / 90, x, y)); }
          P.rim(C('#c8503a'), 1);
        });
        const city = paint(720, 270, P => { // Old Yodgor's skyline, broken
          const rng = U.RNG(seed + 2), c = C('#3a0c16');
          let x = 0;
          while (x < 720) {
            const k = rng.next(), by = 200 + rng.int(-4, 4);
            if (k < .3) { const r = rng.int(10, 20); P.rect(x, by - rng.int(10, 26), r * 2, 30, c); dome(P, x + r, by - 22, r, c); if (rng.chance(.6)) P.disc(x + r + rng.int(-r, r), by - 22 - r, r * .55, 0); x += r * 2 + rng.int(4, 14); }
            else if (k < .5) { const h = rng.int(50, 100), top = minaret(P, x + 4, by, h, 8, c); if (rng.chance(.6)) P.rect(x - 4, top - 16, 16, rng.int(10, 30), 0); x += rng.int(12, 24); }
            else if (k < .75) { const w = rng.int(30, 54), h = rng.int(40, 70); P.rect(x, by - h, w, h + 30, c); archShape(P, x + w / 2, by, w * .5, h * .8, 0); archShape(P, x + w / 2, by, w * .5 - 4, h * .8 - 4, C('#2a0810')); if (rng.chance(.5)) P.poly([x + w * .6, by - h - 1, x + w + 1, by - h - 1, x + w + 1, by - h * .5], 0); x += w + rng.int(2, 10); }
            else { const w = rng.int(20, 50), h = rng.int(14, 30); P.rect(x, by - h, w, h + 30, c); for (let i = 0; i < w; i += 3) P.rect(x + i, by - h - rng.int(0, 5), 2, 5, c); x += w + rng.int(0, 8); }
          }
          for (let i = 0; i < 90; i++) { const xx = rng.int(0, 719), yy = rng.int(150, 240); if (P.get(xx, yy) === c && P.get(xx, yy - 3) === c) P.rect(xx, yy, rng.int(1, 2), rng.int(1, 2), rng.pick(EMB)); } // embers in the rubble
          P.rim(C('#a8343a'), 1); P.side(C('#7a2230'), -1, c);
          for (let x2 = 0; x2 < 720; x2++) P.col(x2, 228, 270, c);
        });
        const mid = paint(960, 270, P => { // a broken pishtaq, columns, collapsed arches
          const rng = U.RNG(seed + 3), c = C('#1c050c'), hi = C('#8a2a2a'), tile = [C('#1a3a4a'), C('#2a5a6a'), C('#123040')];
          for (let k = 0; k < 2; k++) {
            const x0 = k * 480 + rng.int(40, 200), w = 120, h = 150, by = 250;
            P.rect(x0, by - h, w, h + 20, c);
            archShape(P, x0 + w / 2, by, w * .6, h * .78, 0);
            for (let y = by - h + 6; y < by; y += 4) for (let x = x0 + 4; x < x0 + w - 4; x += 4) if (!(P.get(x, y) === 0) && rng.chance(.25) && (x < x0 + 14 || x > x0 + w - 16 || y < by - h + 30)) P.rect(x, y, 2, 2, rng.pick(tile)); // surviving majolica
            for (let i = 0; i < 9; i++) P.disc(x0 + w - rng.int(0, 40), by - h + rng.int(-4, 40), rng.int(6, 14), 0); // collapse
            for (let i = 0; i < 6; i++) { const cx = x0 + w + 30 + i * 26, ch = rng.int(30, 110); P.rect(cx, by - ch, 7, ch + 20, c); P.rect(cx - 2, by - ch, 11, 3, c); }
          }
          for (let x = 0; x < 960; x++) { const t = 236 + 22 * pfbm(x, 960, 12, seed + 4); P.col(x, t, 270, c); }
          P.rim(hi, 1); P.side(C('#4a1218'), -1, c);
        });
        const near = paint(960, 270, P => { // dead trees and a toppled column, darkest
          const rng = U.RNG(seed + 5), c = C('#0a0204');
          for (let k = 0; k < 4; k++) {
            const x = rng.int(0, 900), by = 270, h = rng.int(80, 140);
            const br = (x0, y0, a, l, th) => { if (l < 6 || th < 1) return; const x1 = x0 + Math.cos(a) * l, y1 = y0 + Math.sin(a) * l; P.line(x0, y0, x1, y1, c, R(th)); br(x1, y1, a - rng.range(.2, .6), l * .68, th * .7); if (rng.chance(.8)) br(x1, y1, a + rng.range(.2, .6), l * .6, th * .65); };
            br(x, by, -Math.PI / 2 + rng.range(-.2, .2), h * .5, 6);
          }
          for (let x = 0; x < 960; x++) { const t = 252 + 12 * pfbm(x, 960, 18, seed + 6); P.col(x, t, 270, c); }
          P.rim(C('#3a0a10'), 1);
        });
        return [
          lay(L, ridge, .04, .02, 0),
          lay(L, city, .1, .05, -6),
          dlay(L, .1, .05, (ctx, ox, oy, t) => { // smoke columns rising from the far city
            ctx.fillStyle = '#1a0408';
            for (let k = 0; k < 5; k++) {
              const bx = ((ox + 60 + k * 150) % 720 + 720) % 720 - 60, by = 196 + oy;
              for (let i = 0; i < 10; i++) { const u = ((t * .05 + i / 10 + k * .13) % 1), r = 3 + u * 14; ctx.globalAlpha = .28 * (1 - u); ctx.beginPath(); ctx.arc(bx + Math.sin(u * 4 + k) * 8 + u * 30, by - u * 120, r, 0, PI2); ctx.fill(); }
            }
            ctx.globalAlpha = 1;
          }),
          lay(L, mid, .22, .1, -8),
          lay(L, near, .45, .2, 0)
        ];
      };
      const haze = lazy(() => vgradCv([[0, 'rgba(60,8,16,0)'], [.55, 'rgba(120,30,30,0.12)'], [1, 'rgba(200,70,40,0.3)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(haze(), 0, 0); };
      def.drawForeground = null;
      const vig = lazy(() => vignetteCv('rgba(24,2,6,1)', .3, .66));
      def.post = function (ctx, cam, t) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const s = shaftSprite(16, 300, '#ff8a50', 70, 'oldray');
        for (let k = 0; k < 3; k++) { ctx.globalAlpha = .045 + .02 * Math.sin(t * .3 + k * 2); ctx.save(); ctx.translate(SUN.x - cam.x * .02, SUN.y); ctx.rotate(.5 - k * .45); ctx.drawImage(s, -s.width / 2, 10); ctx.restore(); }
        ctx.restore();
        blendFill(ctx, '#8a0a1a', .2);
        ctx.globalAlpha = .6; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1;
      };
      def.ambientFx = both(
        particles({ rate: .22, cols: ['#2a1a1a', '#4a3030', '#6a4a44'], vx: [.15, .5], vy: [.12, .35], from: 'top', life: 520, alpha: .8, sway: .006 }), // ash
        particles({ rate: .1, cols: ['#ff9a4a', '#ff6a2a', '#ffd08a'], vx: [-.2, .3], vy: [-.45, -.12], from: 'bottom', glow: true, glowR: 3, life: 300, alpha: .9, sway: .02 }) // embers
      );
      addDecorate(def, (L, rng) => { // smouldering braziers / fires in the ruins
        for (const run of spaced(K.floorRuns(L, 4, 3), 26, 'x0')) if (rng.chance(.5)) {
          const x = (rng.int(run.x0, run.x1) + .5) * TS;
          L.decos.push(PK.flameDeco(x, run.y - 4, { w: 7, h: 10, lightR: 90, lightC: '#ff7a40', embers: true, draw(ctx) { ctx.fillStyle = '#1a0806'; ctx.fillRect(R(x) - 6, run.y - 3, 13, 3); ctx.fillStyle = '#4a1a10'; ctx.fillRect(R(x) - 4, run.y - 4, 9, 1); ctx.fillStyle = '#ff5a20'; ctx.fillRect(R(x) - 3, run.y - 3, 1, 1); ctx.fillRect(R(x) + 2, run.y - 2, 1, 1); } }));
        }
      });
    });

    /* ================================================================== */
    /* ========================= THE FOUNDERS' WELL ====================== */
    /* ================================================================== */
    // a vast round shaft: ring galleries with candles, a pale mouth far above, drowned blue domes and fish below
    function wellBG(L, o = {}) {
      const seed = (L.seed || 1) % 983;
      const shaft = paint(480, 270, P => { // concentric masonry rings of the shaft, the mouth of light high up
        const st = ramp(['#01030a', '#030818', '#061026', '#0a1834', '#0e2040']);
        for (let y = 0; y < 270; y++) for (let x = 0; x < 480; x++) {
          const cx = 240, curve = ((x - cx) / 240) ** 2 * 26, ring = (y + curve) / 9, fr = ring - Math.floor(ring), course = Math.floor(ring);
          const block = Math.floor((x + (course & 1) * 9) / 18);
          let t = .25 + .35 * (1 - Math.abs(x - cx) / 260) - y / 270 * .25 + .2 * U.hash(block, course, seed);
          if (fr < .12) t -= .25; if (((x + (course & 1) * 9) % 18) < 1) t -= .2;
          P.set(x, y, rampAt(st, t, x, y));
        }
        // the mouth: a pale ellipse of sky far above, with a rope and bucket silhouette
        P.ell(240, 6, 70, 16, C('#2a4a7a')); P.ell(240, 4, 60, 12, C('#7aa8d8')); P.ell(240, 2, 50, 9, C('#c8e4ff'));
        P.col(240, 0, 120, C('#02040c')); P.rect(236, 120, 9, 7, C('#02040c')); P.rect(235, 119, 11, 1, C('#1a2a4a'));
        // galleries: dark arcades in three rings with candle points
        const rng = U.RNG(seed + 3);
        for (const [gy, gh, n] of [[70, 14, 14], [130, 18, 11], [196, 22, 9]]) {
          for (let k = 0; k < n; k++) {
            const x = 240 + (k - n / 2 + .5) * (460 / n), curve = ((x - 240) / 240) ** 2 * 26;
            archShape(P, x, gy + gh - curve, 460 / n * .5, gh, C('#01020a'));
            if (rng.chance(.6)) { P.set(x, gy + gh - curve - 2, C('#9ac8ff')); P.set(x, gy + gh - curve - 3, C('#ffffff')); }
          }
          for (let x = 0; x < 480; x++) { const curve = ((x - 240) / 240) ** 2 * 26; P.set(x, gy + gh - curve + 1, C('#16284a')); }
        }
      });
      const pool = paint(640, 270, P => { // the flooded floor: drowned blue domes under a black-blue surface
        const rng = U.RNG(seed + 7), surf = 176;
        const wt = ramp(['#010612', '#021026', '#04203e', '#083058']);
        for (let y = surf; y < 270; y++) for (let x = 0; x < 640; x++) P.set(x, y, rampAt(wt, .9 - (y - surf) / 110 + .15 * pn2(x, y * 2, 640, 32, seed + 8), x, y));
        // domes under water
        const dc = [C('#0a3a6a'), C('#0e4a80'), C('#1a6aa0')], gold = C('#c8a040');
        for (let k = 0; k < 5; k++) {
          const cx = 50 + k * 128 + rng.int(-16, 16), r = rng.int(18, 32), by = surf + 70 + rng.int(-10, 10);
          P.rect(cx - r, by - 2, 2 * r, 80, C('#06203e'));
          for (let y = 0; y < r * 1.1; y++) { const u = y / (r * 1.1), hw = r * Math.sqrt(1 - u * u) * (1 + .2 * Math.sin(u * Math.PI)); for (let x = R(cx - hw); x <= R(cx + hw); x++) { const ribs = ((x - cx + 64) % 6) < 1; P.set(x, by - y, dc[ribs ? 0 : (x < cx ? 2 : 1)]); } }
          P.col(cx, by - r * 1.1 - 6, by - r * 1.1, gold);
          for (let y = 4; y < 60; y += 8) for (let x = cx - r + 4; x < cx + r - 4; x += 8) P.rect(x, by + y, 3, 4, C('#021226')); // windows
        }
        // surface line
        for (let x = 0; x < 640; x++) { P.set(x, surf, C('#3a6aa8')); if ((x * 13) % 7 < 2) P.set(x, surf + 1, C('#6a9ad8')); }
        // above the surface: the foot of the shaft wall
        for (let x = 0; x < 640; x++) { const t = 120 + 30 * pfbm(x, 640, 6, seed + 9); P.col(x, t, surf, C('#030a1c')); P.set(x, t, C('#1a2c50')); }
      });
      const near = paint(960, 270, P => { // chains, beams and founders' statues, darkest
        const rng = U.RNG(seed + 11), c = C('#01020a');
        for (let k = 0; k < 5; k++) { const x = rng.int(0, 959), l = rng.int(60, 200); for (let y = 0; y < l; y += 3) { P.rect(x, y, 1, 2, c); P.rect(x - 1, y + 1, 3, 1, c); } P.rect(x - 3, l, 7, 5, c); }
        for (let k = 0; k < 3; k++) { // a founder statue, robed, with a raised hand
          const x = k * 320 + rng.int(40, 260), by = 270, h = rng.int(80, 110);
          P.poly([x - 16, by, x + 16, by, x + 9, by - h * .7, x - 9, by - h * .7], c);
          P.disc(x, by - h * .78, 8, c); P.rect(x - 9, by - h * .7 - 2, 18, 4, c); P.line(x + 8, by - h * .65, x + 18, by - h * .95, c, 4);
          P.rect(x - 22, by - 14, 44, 14, c);
        }
        for (let x = 0; x < 960; x++) { const t = 254 + 10 * pfbm(x, 960, 14, seed + 12); P.col(x, t, 270, c); }
        P.rim(C('#14244a'), 1);
      });
      return [
        lay(L, shaft, .03, .015, o.shY || -4),
        dlay(L, .03, .015, (ctx, ox, oy, t) => { // pale light falling from the mouth, candles flicker on the galleries
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const s = shaftSprite(60, 280, '#9ac8ff', 50, 'wellmouth');
          ctx.globalAlpha = .12 + .03 * Math.sin(t * .35); const mx = ((ox + 240) % 480 + 480) % 480; ctx.drawImage(s, R(mx - 80), -6 + R(oy)); ctx.drawImage(s, R(mx - 560), -6 + R(oy));
          ctx.restore();
        }),
        lay(L, pool, .1, .05, o.poolY || 0),
        dlay(L, .1, .05, (ctx, ox, oy, t) => { // fish drifting among the drowned domes, ripples on the surface
          const y0 = (o.poolY || 0) + oy;
          ctx.fillStyle = '#7ab8e8';
          for (let i = 0; i < 9; i++) {
            const sp = .18 + (i % 3) * .07, dir = i & 1 ? 1 : -1, x = ((((t * 14 * sp * dir + i * 97 + ox) % 640) + 640) % 640) - 80, y = y0 + 196 + (i * 23) % 60 + Math.sin(t * .8 + i) * 3;
            if (x < -10 || x > G.W + 10) continue;
            ctx.globalAlpha = .5 + .3 * ((i * 7) % 3) / 3;
            ctx.fillRect(R(x) - 2, R(y), 5, 2); ctx.fillRect(R(x) - dir * 4, R(y) - (Math.sin(t * 7 + i) > 0 ? 1 : 0), 1, 3);
          }
          ctx.globalAlpha = .5; ctx.fillStyle = '#bfe0ff';
          for (let i = 0; i < 12; i++) { const x = ((i * 61 + ox * 1.0) % 480 + 480) % 480, a = Math.sin(t * 1.5 + i * 2); if (a > .3) ctx.fillRect(R(x), R(y0 + 176), 3 + (i % 3), 1); }
          ctx.globalAlpha = 1;
        }),
        lay(L, near, .3, .12, o.nearY || 0)
      ];
    }
    function wellDecor(L, rng, o = {}) {
      const D = L.decos;
      if (!o.noHoles) caveWindows(L, .42, 9);
      // blue-flame candles on ledges (the founders' vigil)
      for (const run of spaced(K.floorRuns(L, 3, 3), o.gap || 22, 'x0')) if (rng.chance(o.cand || .35)) {
        const n = rng.int(1, 3);
        for (let k = 0; k < n; k++) {
          const x = (rng.int(run.x0, run.x1) + .5) * TS + k * 4, h = rng.int(3, 7);
          D.push(PK.flameDeco(x, run.y - h - 1, { w: 3, h: 5, lightR: 58, lightC: '#7ab0ff', glowC: '#6aa0ff', glowR: 14, pal: Art.FLAME_ICE, embers: false,
            draw(ctx) { ctx.fillStyle = '#c8d4e8'; ctx.fillRect(R(x) - 1, run.y - h, 2, h); ctx.fillStyle = '#8a98b0'; ctx.fillRect(R(x), run.y - h, 1, h); } }));
          if (k > 0) delete D[D.length - 1].light; // one light per group of candles
        }
      }
      // pale beams from cracks to the surface
      let beams = 0;
      if (L.ceilRow) for (let x = 10; x < L.w - 10; x += rng.int(22, 40)) {
        if (beams > 3) break;
        let fy = L.ceilRow[x] + 1; while (fy < L.h - 1 && air(L, x, fy)) fy++;
        const y0 = (L.ceilRow[x] + 1) * TS, y1 = fy * TS;
        if (y1 - y0 < 48) continue;
        D.push(beamDeco(x * TS + 8, y0, y1, 10, '#9ac8ff', .14, rng.range(0, 6))); beams++;
      }
      // glimmering wet stones: tiny fish in puddles of black water where the floor dips
      for (const run of K.floorRuns(L, 6, 3)) if (rng.chance(.12)) D.push(fishDeco((run.x0 + run.x1) / 2 * TS, run.y - 10, (run.x1 - run.x0) * 4, '#6aa8e0', rng.range(0, 6), { glow: '#4a8aff', s: 1, speed: .7 }));
    }
    guard('yd_well', def => {
      def.drawSky = function (ctx) { ctx.drawImage(sky('well', [[0, '#000005'], [.5, '#020818'], [1, '#061638']]), 0, 0); };
      def.buildBackground = L => wellBG(L);
      const fog = lazy(() => vgradCv([[0, 'rgba(0,2,10,0.4)'], [.6, 'rgba(4,14,40,0.2)'], [1, 'rgba(10,30,80,0.45)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(fog(), 0, 0); };
      const vig = lazy(() => vignetteCv('rgba(0,1,8,1)', .3, .62));
      def.post = function (ctx, cam, t) { blendFill(ctx, '#1a4ad0', .22 + .05 * Math.sin(t * .7)); ctx.globalAlpha = .7; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1; };
      def.ambientFx = both(
        particles({ rate: .1, cols: ['#bfe8ff', '#8ac8ff'], vx: [-.04, .04], vy: [-.45, -.15], from: 'bottom', shape: 'ring', size: [.8, 2], life: 360, alpha: .5 }),
        particles({ rate: .05, cols: ['#c8e0ff', '#ffffff'], vx: [-.03, .03], vy: [.05, .14], glow: true, glowR: 2, life: 500, alpha: .5, sway: .004 })
      );
      addDecorate(def, (L, rng) => wellDecor(L, rng));
    });
    guard('yd_well_bottom', def => {
      def.drawSky = DD.yd_well.drawSky;
      def.buildBackground = function (L) {
        const layers = wellBG(L, { shY: -20, poolY: 6, nearY: 0 });
        // the black mirror: seven tall shadows standing round it
        const seven = paint(520, 270, P => {
          const c = C('#000108'), rng = U.RNG(7);
          for (let k = 0; k < 7; k++) {
            const x = 40 + k * 72, h = 120 + (k === 3 ? 30 : rng.int(0, 20)), by = 230;
            P.poly([x - 12, by, x + 12, by, x + 7, by - h * .75, x - 7, by - h * .75], c); P.disc(x, by - h * .82, 7, c);
            P.rect(x - 2, by - h * .82 + 1, 1, 1, C('#7ab0ff')); P.rect(x + 2, by - h * .82 + 1, 1, 1, C('#7ab0ff'));
          }
          for (let x = 0; x < 520; x++) P.col(x, 228, 270, c);
          P.rim(C('#2a4a8a'), 1);
        });
        layers.splice(4, 0, { canvas: seven, fx: .16, fy: .05, y: 0, repeat: false, x: -20 });
        return layers;
      };
      def.fogBehind = DD.yd_well.fogBehind; def.post = DD.yd_well.post; def.ambientFx = DD.yd_well.ambientFx;
      addDecorate(def, (L, rng) => { // the black mirror at the centre of the floor: reflections of the candles
        const cx = L.w * TS / 2, fy = (L.fy || L.h - 3) * TS;
        let y = fy; for (let ty = 0; ty < L.h; ty++) if (L.get(Math.floor(L.w / 2), ty) !== T.AIR) { y = ty * TS; break; }
        L.decos.push({ x: cx, y: y - 1, r: 200, layer: 'mid', draw(ctx, t) {
          ctx.fillStyle = '#000208'; ctx.fillRect(R(cx - 120), y - 1, 240, 2);
          ctx.fillStyle = '#6a9aff';
          for (let i = 0; i < 40; i++) { const x = cx - 118 + ((i * 37) % 236), a = Math.sin(t * 1.3 + i * 1.7); if (a > .4) { ctx.globalAlpha = (a - .4) * 1.2; ctx.fillRect(R(x), y - 1, 2 + (i % 3), 1); } }
          ctx.globalAlpha = 1;
        } });
      });
    });

    /* ================================================================== */
    /* ======================= THE SPINE OF THE SLEEPER ================== */
    /* ================================================================== */
    // snow on the giant's back; vertebrae like mountain peaks; the city lights far below
    const spineSky = function (ctx, cam, t) {
      const cv = sky('spine', [[0, '#01020a'], [.4, '#060c24'], [.72, '#162048'], [.9, '#2a2a5a'], [1, '#3a3462']], c => {
        const P = painter(G.W, G.H), rng = U.RNG(222);
        for (let i = 0; i < 340; i++) { const x = rng.int(0, G.W - 1), y = rng.int(0, 190); P.set(x, y, C(rng.pick(['#ffffff', '#cfe0ff', '#9fb0e0', '#ffe8c0']), rng.int(80, 255))); }
        // the milky band of the dream-sky
        for (let i = 0; i < 1600; i++) { const u = rng.next(), x = u * G.W, y = 20 + u * 90 + rng.range(-14, 14) * (1 + rng.next()); P.set(x, y, C('#c8d0ff', rng.int(20, 90))); }
        // the moon, a thin silver crescent
        P.disc(96, 54, 12, C('#e8eeff')); P.disc(102, 50, 11, 0);
        c.drawImage(P.canvas(), 0, 0);
        const g = c.createRadialGradient(96, 54, 4, 96, 54, 70); g.addColorStop(0, 'rgba(180,200,255,0.25)'); g.addColorStop(1, 'rgba(120,140,220,0)'); c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
      });
      ctx.drawImage(cv, 0, 0);
      // aurora ribbons (green-teal), slowly breathing
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const a = aurora();
      ctx.globalAlpha = .55 + .2 * Math.sin(t * .23); ctx.drawImage(a, R(-((cam.x * .02 + t * 1.5) % 480)), 6); ctx.drawImage(a, R(480 - ((cam.x * .02 + t * 1.5) % 480)), 6);
      ctx.restore();
      ctx.globalAlpha = 1;
    };
    const aurora = lazy(() => {
      const P = painter(480, 140);
      for (let x = 0; x < 480; x++) {
        const y0 = 40 + 30 * Math.sin(x / 480 * PI2 * 2) + 14 * Math.sin(x / 480 * PI2 * 5 + 1);
        const inten = .4 + .6 * pfbm(x, 480, 12, 9);
        for (let y = 0; y < 140; y++) {
          const d = y - y0; if (d < -6 || d > 70) continue;
          const a = (d < 0 ? (6 + d) / 6 : Math.exp(-d / 22)) * inten * (.6 + .4 * Math.sin(x * .9 + y * .05));
          if (a < .05) continue;
          const col = d < 10 ? [140, 255, 210] : d < 30 ? [80, 220, 200] : [110, 120, 255];
          P.set(x, y, (R(clamp01(a) * 110) << 24 | col[2] << 16 | col[1] << 8 | col[0]) >>> 0);
        }
      }
      return P.canvas();
    });
    function spineLayers(L, o = {}) {
      const seed = (L.seed || 1) % 977, cy = o.cityY || 0;
      const ranges = paint(720, 270, P => { // far ranges beyond the valley, pale with distance
        const c = C('#3c4688'), snow = C('#c8d2f8');
        for (let x = 0; x < 720; x++) { const t = 128 + 26 * pfbm(x, 720, 6, seed + 1) - 22 * Math.exp(-(((x - 500) / 60) ** 2)); P.col(x, t, 270, c); }
        P.rim(snow, 2); P.side(C('#5a64a8'), -1, c);
        for (let y = 0; y < 270; y++) for (let x = 0; x < 720; x++) if (P.get(x, y) === c && pn2(x, y * 2, 720, 12, seed + 2) > .58 && y < 170) P.set(x, y, C('#6a76b8')); // snowfields
      });
      const city = paint(960, 270, P => { // Yodgor far below: a valley of warm lights under mist
        const rng = U.RNG(seed + 3), dark = C('#0c1030'), dark2 = C('#090c26');
        for (let x = 0; x < 960; x++) { const t = 158 + 8 * pfbm(x, 960, 6, seed + 4) - 26 * Math.exp(-(((x - 300) / 90) ** 2)); P.col(x, t, 270, dark); P.set(x, t, C('#28306a')); } // the valley floor, the Ark rising on its hill
        for (let k = 0; k < 40; k++) { const x = rng.int(0, 959), by = 166 + rng.int(0, 30) - R(26 * Math.exp(-(((x - 300) / 90) ** 2))); if (rng.chance(.55)) dome(P, x, by, rng.int(3, 7), dark2, { drum: 2 }); else minaret(P, x, by, rng.int(10, 22), 3, dark2); }
        const lights = [C('#ffcf7a'), C('#ffb060'), C('#ffe8a8'), C('#ff9a4a')];
        for (let i = 0; i < 1400; i++) { const x = rng.int(0, 959), y = 160 + R(Math.pow(rng.next(), .8) * 90); if ((P.get(x, y) >>> 24) && rng.chance(.8)) P.set(x, y, rng.pick(lights)); }
        for (let i = 0; i < 90; i++) { const x = rng.int(0, 959), y = rng.int(164, 220); P.rect(x, y, 2, 1, C('#fff4d0')); }
        for (let k = 0; k < 6; k++) { const x0 = rng.int(0, 900), y0 = rng.int(175, 240); for (let i = 0; i < 70; i++) P.set(x0 + i, y0 + R(Math.sin(i * .1) * 3), lights[i % 4]); } // lamp-lit streets
      });
      const spineMid = paint(960, 270, P => { // the Sleeper's vertebrae stand on the ridge: tall blades with gaps between them
        const rng = U.RNG(seed + 6), c = C('#1a2250'), snow = C('#eef2ff'), snow2 = C('#a8b6e8');
        for (let x = 0; x < 960; x++) { const t = 214 + 16 * pfbm(x, 960, 8, seed + 7); P.col(x, t, 270, c); }
        for (let k = 0; k < 6; k++) {
          const cx = k * 160 + rng.int(10, 120), h = rng.int(100, 170), w = rng.int(22, 34), lean = rng.range(-.25, .05);
          P.poly([cx - w / 2, 236, cx + w / 2, 236, cx + w * .3 + lean * h, 236 - h, cx - w * .1 + lean * h, 236 - h - 10], c);
          P.ell(cx, 226, w * 1.1, 14, c); // vertebral body
          for (const s of [-1, 1]) P.poly([cx + s * w * .5, 222, cx + s * (w * .5 + 34), 212 + rng.int(-6, 6), cx + s * (w * .5 + 38), 218, cx + s * w * .5, 230], c); // transverse processes
        }
        P.rim(snow, 2); P.rim(snow2, 3, c);
        P.side(C('#3a4888'), -1, c); P.side(C('#10163a'), 1, c);
        for (let y = 0; y < 270; y++) for (let x = 0; x < 960; x++) if (P.get(x, y) === c && U.hash(x, y, 9) < .03) P.set(x, y, C('#242c60'));
      });
      const near = paint(960, 270, P => { // snowdrifts and bone spikes
        const rng = U.RNG(seed + 8), c = C('#04060f');
        for (let x = 0; x < 960; x++) { const t = 244 + 14 * pfbm(x, 960, 10, seed + 9); P.col(x, t, 270, c); }
        for (let k = 0; k < 7; k++) { const x = rng.int(0, 959), h = rng.int(20, 50); P.poly([x - 4, 260, x + 4, 260, x + 1, 260 - h], c); }
        P.rim(C('#8a98d0'), 1);
      });
      return [
        lay(L, ranges, .02, .01, cy),
        lay(L, city, .035, .015, cy),
        dlay(L, .035, .015, (ctx, ox, oy, t) => { // the city's lights twinkle; a warm glow under the mist
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (let k = 0; k < 5; k++) glow(ctx, ((ox + 100 + k * 192) % 960 + 960) % 960 - 100, cy + oy + 196, 70, '#ff9a40', .2 + .06 * Math.sin(t * .5 + k));
          ctx.fillStyle = '#fff0c0';
          for (let i = 0; i < 36; i++) { const a = Math.sin(t * 2.2 + i * 1.7); if (a < .6) continue; ctx.globalAlpha = a - .5; ctx.fillRect(R(((ox + i * 131) % 480 + 480) % 480), R(cy + oy + 168 + (i * 17) % 60), 1, 1); }
          ctx.restore();
          ctx.globalAlpha = .5; tileX(ctx, mistBand(), ox * 1.3 + t * 2, cy + oy + 150); ctx.globalAlpha = .3; tileX(ctx, mistBand(), ox * 1.6 - t * 1.5 + 200, cy + oy + 190); ctx.globalAlpha = 1;
        }),
        lay(L, spineMid, .12, .05, o.midY || 0),
        lay(L, near, .3, .12, o.nearY || 10)
      ];
    }
    const mistBand = lazy(() => fogBand(480, 50, '#6a7ab8', 57, .62));
    const gustCv = lazy(() => { // a translucent sheet of blown snow (screen fg)
      const P = painter(640, G.H);
      for (let y = 0; y < G.H; y++) for (let x = 0; x < 640; x++) {
        const n = pn2(x - y * 1.6, y, 640, 50, 91) * .7 + pn2(x - y * 1.6, y, 640, 16, 92) * .3;
        const a = clamp01((n - .52) * 2.4);
        if (a > .03) P.set(x, y, (R(a * 70) << 24 | 0xf0 << 16 | 0xe8 << 8 | 0xe0) >>> 0);
      }
      const rng = U.RNG(93);
      for (let i = 0; i < 260; i++) { const x = rng.int(0, 639), y = rng.int(0, G.H - 1); P.rect(x, y, rng.int(2, 6), 1, C('#ffffff', rng.int(90, 200))); }
      return P.canvas();
    });
    guard('yd_spine', def => {
      def.drawSky = spineSky;
      def.buildBackground = L => spineLayers(L);
      const fog = lazy(() => vgradCv([[0, 'rgba(10,14,40,0)'], [.6, 'rgba(40,50,100,0.12)'], [1, 'rgba(90,100,160,0.28)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(fog(), 0, 0); };
      def.drawForeground = function (ctx, cam, t) { // gusts of snow sweep across
        const g = gustCv(), k = .5 + .5 * Math.sin(t * .31);
        ctx.globalAlpha = .35 + .4 * k; tileX(ctx, g, -cam.x * 1.4 - t * 90, 0);
        ctx.globalAlpha = .2 + .2 * (1 - k); tileX(ctx, g, -cam.x * 1.1 - t * 55 + 300, 0); ctx.globalAlpha = 1;
      };
      const vig = lazy(() => vignetteCv('rgba(2,4,16,1)', .34, .66));
      def.post = function (ctx) { blendFill(ctx, '#2a4ab0', .22); ctx.globalAlpha = .55; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1; };
      def.ambientFx = both(
        particles({ rate: .55, cols: ['#ffffff', '#e8f0ff', '#c8d8f0'], vx: [.8, 1.8], vy: [.35, .8], from: 'any', life: 300, alpha: .85, sway: .02 }),
        particles({ rate: .06, cols: ['#ffffff'], vx: [1.6, 2.6], vy: [.5, 1], from: 'left', size: 2, life: 260, alpha: .7 })
      );
      addDecorate(def, (L, rng) => { // prayer flags strung between high points, bone spikes in the snow
        const D = L.decos, runs = K.floorRuns(L, 6, 5);
        for (const run of spaced(runs, 30, 'x0')) if (rng.chance(.55)) {
          const x0 = run.x0 * TS + 6, x1 = Math.min(run.x1 * TS + 10, x0 + rng.int(70, 130)), y = run.y;
          const cols = ['#e8e8f0', '#3a6ae0', '#e03a3a', '#ffd040', '#3ac06a'], n = Math.floor((x1 - x0) / 9), ph = rng.range(0, 6);
          D.push({ x: (x0 + x1) / 2, y: y - 40, r: (x1 - x0) / 2 + 30, layer: 'back', draw(ctx, t) {
            ctx.fillStyle = '#1a1a2a'; ctx.fillRect(x0, y - 44, 2, 44); ctx.fillRect(x1, y - 36, 2, 36);
            for (let i = 0; i <= n * 3; i++) { const u = i / (n * 3), xx = x0 + (x1 - x0) * u, yy = y - 44 + 8 * u + 10 * 4 * u * (1 - u) * .5; ctx.fillRect(R(xx), R(yy), 1, 1); }
            for (let i = 1; i < n; i++) {
              const u = i / n, xx = x0 + (x1 - x0) * u, yy = y - 44 + 8 * u + 5 * 4 * u * (1 - u), fl = Math.sin(t * 6 + i * 1.3 + ph);
              ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(R(xx), R(yy) + 1, 4, 4 + (fl > 0 ? 1 : 0)); ctx.fillRect(R(xx) + 4, R(yy) + 2 + (fl > .3 ? 1 : 0), 1, 2);
            }
          } });
        }
      });
    });
    guard('yd_withers', def => {
      const base = DD.barys_shrine;
      def.buildBackground = function (L) { // the shrine stands on the withers: the city lights far below behind its own moonlit layers
        const mine = spineLayers(L, { cityY: -10, midY: 10, nearY: 30 });
        let theirs = [];
        try { theirs = base.buildBackground.call(this, L) || []; } catch (e) { theirs = []; }
        // keep the shrine's nearest layers only (the moon and far ranges are ours now)
        return mine.slice(0, 4).concat(theirs.slice(-1));
      };
      def.drawSky = spineSky;
      def.drawForeground = function (ctx, cam, t) { const g = gustCv(); ctx.globalAlpha = .3 + .2 * Math.sin(t * .4); tileX(ctx, g, -cam.x * 1.3 - t * 70, 0); ctx.globalAlpha = 1; };
      const vig = lazy(() => vignetteCv('rgba(2,4,16,1)', .36, .7));
      const prevPost = def.post;
      def.post = function (ctx, cam, t, L) { if (prevPost) prevPost.call(this, ctx, cam, t, L); blendFill(ctx, '#3a5ac0', .14); ctx.globalAlpha = .45; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1; };
    });

    /* ================================================================== */
    /* ============================== THE HEART ========================== */
    /* ================================================================== */
    // lub-dub: two bumps per beat, ~0.8 s (matches 60_world's heart tint rhythm)
    const hbeat = t => { const p = (t * 1.25) % 1; return Math.max(Math.exp(-((p - .04) ** 2) / .0016), .65 * Math.exp(-((p - .2) ** 2) / .002)); };
    guard('yd_heart', def => {
      def.drawSky = function (ctx) { ctx.drawImage(sky('heart', [[0, '#050002'], [.5, '#1a0208'], [1, '#3a0610']]), 0, 0); };
      def.buildBackground = function (L) {
        const seed = (L.seed || 1) % 971;
        const wall = paint(480, 270, P => { // the inner wall of the heart: twisting muscle trabeculae
          const m = ramp(['#120206', '#1e040a', '#2c0810', '#3c0c16', '#4e121c']);
          for (let y = 0; y < 270; y++) for (let x = 0; x < 480; x++) {
            const warp = 18 * pn2(x, y, 480, 60, seed + 1);
            const fib = Math.sin((x * .7 + y * .35 + warp * 3) * .18) * .5 + .5, n = pn2(x, y, 480, 14, seed + 2);
            P.set(x, y, rampAt(m, .15 + .5 * fib * (.5 + .5 * n) + .2 * (1 - y / 270) * 0, x, y));
          }
          // trabeculae: thick muscular cords
          const rng = U.RNG(seed + 3);
          for (let k = 0; k < 12; k++) { let x = rng.int(0, 479), y = rng.int(-20, 60); const l = rng.int(120, 280), dx = rng.range(-.6, .6); for (let i = 0; i < l; i++) { x += dx + Math.sin(i * .03 + k) * .6; y += 1; const th = 4 + 3 * Math.sin(i / l * Math.PI); P.rect(x - th / 2, y, th, 1, C('#3a0a12')); P.set(x - th / 2, y, C('#6a1a22')); } }
        });
        const veins = paint(480, 270, P => { // arteries in the wall: lit on each beat
          const rng = U.RNG(seed + 4);
          const branch = (x, y, a, l, th, d) => { for (let i = 0; i < l; i++) { a += rng.range(-.12, .12); x += Math.cos(a); y += Math.sin(a); P.rect(x, y, th, th, C(th > 1 ? '#ff3a5a' : '#ff6a7a')); if (d < 4 && rng.chance(.025)) branch(x, y, a + rng.pick([-1, 1]) * rng.range(.5, 1), l * .5, Math.max(1, th - 1), d + 1); } };
          for (let k = 0; k < 7; k++) branch(rng.int(0, 479), rng.int(0, 270), rng.range(0, PI2), rng.int(60, 140), 2, 0);
        });
        const valves = paint(720, 270, P => { // chordae tendineae: cords from the top to the valve leaflets
          const rng = U.RNG(seed + 5), c = C('#1a0306'), hi = C('#7a2030');
          for (let k = 0; k < 4; k++) {
            const cx = k * 180 + rng.int(20, 140), by = rng.int(150, 200);
            P.ell(cx, by + 20, 46, 26, c); P.ell(cx, by + 40, 60, 30, c); // papillary muscle
            for (let j = 0; j < 7; j++) { const tx = cx + rng.int(-90, 90); P.line(tx, 0, cx + rng.int(-20, 20), by, c, 1); P.line(tx + 1, 0, cx + rng.int(-20, 20), by, c, 1); }
          }
          for (let x = 0; x < 720; x++) { const t = 226 + 30 * pfbm(x, 720, 6, seed + 6); P.col(x, t, 270, c); }
          P.rim(hi, 1);
        });
        const near = paint(960, 270, P => { // membranes and ribs close by
          const rng = U.RNG(seed + 7), c = C('#0a0103');
          for (let x = 0; x < 960; x++) { const t = 20 + 40 * pfbm(x, 960, 10, seed + 8); P.col(x, 0, t, c); if (rng.chance(.03)) { const l = rng.int(10, 50); P.col(x, t, t + l, c); } const b = 250 + 14 * pfbm(x, 960, 14, seed + 9); P.col(x, b, 270, c); }
          P.rim(C('#5a1018'), 1);
          for (let y = 1; y < 270; y++) for (let x = 0; x < 960; x++) if (P.get(x, y) === c && !(P.get(x, y + 1) >>> 24)) P.set(x, y, C('#8a2a3a')); // wet lower lip
        });
        return [
          lay(L, wall, .04, .02, 0),
          dlay(L, .04, .02, (ctx, ox, oy, t) => { const b = hbeat(t); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .12 + .5 * b; tileX(ctx, veins, ox, oy); ctx.restore(); }),
          dlay(L, 0, 0, (ctx, ox, oy, t) => { const b = hbeat(t); ctx.globalAlpha = .06 + .16 * b; ctx.fillStyle = '#ff2a4a'; ctx.globalCompositeOperation = 'lighter'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }),
          lay(L, valves, .14, .06, -6),
          dlay(L, .14, .06, (ctx, ox, oy, t) => { // streams of memory-light flowing toward the heart
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 24; i++) { const sp = 20 + (i % 5) * 9, x = ((t * sp + i * 71 + ox) % 560 + 560) % 560 - 40, y = 40 + (i * 37) % 180 + oy + Math.sin(t + i) * 6; ctx.fillStyle = i % 4 ? '#ff6a7a' : '#ffd08a'; ctx.globalAlpha = .35; ctx.fillRect(R(x), R(y), 3, 1); ctx.globalAlpha = .15; ctx.fillRect(R(x) - 6, R(y), 6, 1); }
            ctx.restore();
          }),
          lay(L, near, .34, .14, 0)
        ];
      };
      const fog = lazy(() => vgradCv([[0, 'rgba(20,0,4,0.4)'], [.6, 'rgba(60,4,14,0.15)'], [1, 'rgba(120,10,30,0.4)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(fog(), 0, 0); };
      const vigC = lazy(() => vignetteCv('rgba(30,0,6,1)', .26, .6));
      def.post = function (ctx, cam, t) {
        const b = hbeat(t);
        blendFill(ctx, '#ff1a3a', .14 + .22 * b);
        ctx.globalAlpha = .55 + .3 * (1 - b); ctx.drawImage(vigC(), 0, 0); ctx.globalAlpha = 1; // the walls close in between beats
      };
      const prevLights = def.lights;
      def.lights = function (Light, cam, t, L) { // lights in the heart swell on the beat
        const b = hbeat(t);
        for (const n of L.nodes || []) Light.add(n.x, n.y, 36 + 18 * b, n.col, .5 + .45 * b);
        for (const v of L.heartVeins || []) if (onS(v.x, v.y, 80)) Light.add(v.x, v.y, 50 + 20 * b, '#ff3a5a', .25 + .45 * b);
      };
      def.ambientFx = both(def.ambientFx,
        particles({ rate: .14, cols: ['#ff6a7a', '#ff3a5a', '#ffd08a'], vx: [.3, .9], vy: [-.1, .1], from: 'any', glow: true, glowR: 3, life: 260, alpha: .8, sway: .01 }));
      addDecorate(def, (L, rng) => { // glowing vessels across the back walls, pulsing
        const D = L.decos; L.heartVeins = [];
        for (let i = 0, n = R(L.w * L.h / 120); i < n; i++) {
          const tx = rng.int(2, L.w - 3), ty = rng.int(2, L.h - 3);
          if (!L.back[ty * L.w + tx] || !air(L, tx, ty)) continue;
          if (L.heartVeins.some(v => Math.abs(v.x - tx * TS) < 120 && Math.abs(v.y - ty * TS) < 90)) continue;
          const pts = []; let x = tx * TS + 8, y = ty * TS + 8, a = rng.range(0, PI2);
          for (let k = 0; k < 40; k++) { a += rng.range(-.25, .25); x += Math.cos(a) * 2; y += Math.sin(a) * 2; if (L.solidPx(x, y)) break; pts.push([R(x), R(y)]); }
          if (pts.length < 10) continue;
          const v = { x: pts[pts.length >> 1][0], y: pts[pts.length >> 1][1] };
          L.heartVeins.push(v);
          D.push({ x: v.x, y: v.y, r: 90, layer: 'back', draw(ctx, t) {
            const b = hbeat(t - pts.length * .002);
            ctx.fillStyle = '#5a0a18'; for (const [px, py] of pts) ctx.fillRect(px, py, 2, 2);
            ctx.fillStyle = b > .4 ? '#ff6a80' : '#c8243c'; for (let k = 0; k < pts.length; k += 2) ctx.fillRect(pts[k][0], pts[k][1], 1, 1);
          }, fx(ctx, t) { const b = hbeat(t); if (b > .2) G.Glow.add(v.x, v.y, 26, '#ff3a5a', .35 * b); } });
        }
      });
    });

    /* ================================================================== */
    /* ========================= THE DREAM OF THE CITY =================== */
    /* ================================================================== */
    // three hundred years of memories stacked into impossible streets; floating islands, carpets, lanterns
    function islandSprite(seed, w) { // a floating chunk of city: earth cone below, buildings above, roots hanging
      const h = R(w * 1.4);
      return paint(w + 8, h, P => {
        const rng = U.RNG(seed), earth = ramp(['#2a1838', '#3a2448', '#4a3058']), wall = ramp(['#6a5088', '#8a6aa8', '#a888c0']);
        const top = R(h * .45);
        for (let y = top; y < h; y++) { const u = (y - top) / (h - top), hw = (w / 2) * (1 - u) ** .8 * (1 + .1 * Math.sin(y * .5)); for (let x = R(4 + w / 2 - hw); x <= R(4 + w / 2 + hw); x++) P.set(x, y, rampAt(earth, 1 - u, x, y)); }
        for (let k = 0; k < 5; k++) { let x = rng.int(8, w); for (let y = top + 6; y < h - 2; y++) { if (P.get(x, y) >>> 24) continue; P.set(x, y, C('#2a1838')); if (rng.chance(.3)) x += rng.pick([-1, 1]); if (rng.chance(.08)) break; } }
        let x = 4;
        while (x < w) { // houses and domes, some upside-down memories
          const bw = rng.int(6, 12), bh = rng.int(6, 18);
          for (let y = 0; y < bh; y++) for (let xx = 0; xx < bw; xx++) P.set(x + xx, top - y, rampAt(wall, .3 + .5 * (xx / bw), x + xx, y));
          if (rng.chance(.35)) dome(P, x + bw / 2, top - bh + 1, bw * .45, C('#4ac8d8'), { drum: 1 });
          for (let y = 3; y < bh - 2; y += 4) for (let xx = 1; xx < bw - 1; xx += 3) if (rng.chance(.5)) P.rect(x + xx, top - bh + y, 1, 2, rng.pick([C('#ffd890'), C('#ff9ad0'), C('#2a1838')]));
          x += bw + rng.int(0, 3);
        }
        P.rim(C('#ffe0ff'), 1);
      });
    }
    guard('yd_dream_city', def => {
      def.drawSky = function (ctx, cam, t) {
        ctx.drawImage(sky('dream', [[0, '#120626'], [.3, '#3a1a5a'], [.58, '#8a4a8a'], [.8, '#d88aa0'], [.94, '#ffc8a8'], [1, '#ffe4c4']], c => {
          const P = painter(G.W, G.H), rng = U.RNG(260);
          for (let i = 0; i < 160; i++) P.set(rng.int(0, G.W - 1), rng.int(0, 120), C(rng.pick(['#ffffff', '#ffd8ff', '#c8e8ff']), rng.int(80, 230)));
          // two moons: a great pale one and a small blue one, as in a child's drawing
          P.disc(130, 70, 26, C('#fff0ff')); P.disc(130, 70, 24, C('#ffe4f8')); P.disc(122, 64, 6, C('#f0d0ee')); P.disc(140, 78, 4, C('#f0d0ee'));
          P.disc(388, 46, 8, C('#c8f0ff')); P.disc(391, 44, 7, 0);
          c.drawImage(P.canvas(), 0, 0);
          const g = c.createRadialGradient(130, 70, 20, 130, 70, 110); g.addColorStop(0, 'rgba(255,220,255,0.35)'); g.addColorStop(1, 'rgba(200,140,255,0)'); c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
        }), 0, 0);
        ctx.globalAlpha = .5; tileX(ctx, dreamCloud(), -cam.x * .02 + t * 3, 120); ctx.globalAlpha = .35; tileX(ctx, dreamCloud(), -cam.x * .035 - t * 2, 160); ctx.globalAlpha = 1;
      };
      const dreamCloud = lazy(() => fogBand(480, 60, '#ffd0f0', 33, .5));
      def.buildBackground = function (L) {
        const seed = (L.seed || 1) % 953;
        const stack = paint(960, 270, P => { // impossible stacked city in lavender haze
          const rng = U.RNG(seed + 1), c1 = C('#5e4686'), c2 = C('#6a5094'), win = [C('#ffe8c8'), C('#ffd0f0'), C('#c8f0ff'), C('#3a2858'), C('#3a2858')];
          const sh = C('#3e2c62'), lt = C('#8a70b8'), corn = C('#b090d8');
          let x = 0;
          while (x < 960) {
            const w = rng.int(20, 44); let by = 236, floors = rng.int(3, 7), off = 0;
            for (let f = 0; f < floors; f++) { // houses stacked on houses, each shifted, some leaning
              const fw = w + rng.int(-6, 10), fh = rng.int(14, 26), fx = x + off;
              P.rect(fx, by - fh, fw, fh, f & 1 ? c1 : c2);
              P.rect(fx + fw - 3, by - fh, 3, fh, sh); P.rect(fx, by - fh, 1, fh, lt); P.rect(fx - 1, by - fh, fw + 2, 1, corn); // light from the left, a cornice
              if (rng.chance(.4)) for (let i = 0; i < fw; i += 6) archShape(P, fx + 3 + i, by, 4, 6, sh); // little arcades
              for (let yy = by - fh + 4; yy < by - 4; yy += 6) for (let xx = fx + 2; xx < fx + fw - 4; xx += 4) if (rng.chance(.3)) P.rect(xx, yy, 2, 3, rng.pick(win));
              if (rng.chance(.25)) { for (let s = 0; s < 14; s++) P.rect(fx + fw + s, by - fh - s, 3, 1, c1); } // stair to nowhere
              by -= fh; off += rng.int(-8, 8);
            }
            if (rng.chance(.5)) dome(P, x + off + w / 2, by + 1, w * .4, c2); else if (rng.chance(.5)) minaret(P, x + off + w / 2, by + 1, rng.int(20, 40), 5, c1);
            if (rng.chance(.3)) { const iy = by - rng.int(20, 50); P.ell(x + w / 2, iy, w * .35, 6, c1); dome(P, x + w / 2, iy + 10, w * .3, c2, { finial: false }); } // an upside-down dome hanging in the air
            x += w + rng.int(4, 18);
          }
          for (let x2 = 0; x2 < 960; x2++) P.col(x2, 236, 270, c1);
          P.rim(C('#f0d8ff'), 1);
        });
        const islands = [0, 1, 2, 3, 4, 5].map(k => islandSprite(seed * 7 + k, 40 + (k % 3) * 18));
        const arches = paint(960, 270, P => { // the dream bazaar: arcades and doorways leading nowhere
          const rng = U.RNG(seed + 3), c = C('#3a2058'), hi = C('#c8a0e8');
          for (let k = 0; k < 5; k++) {
            const x0 = k * 192 + rng.int(0, 60), w = rng.int(60, 110), h = rng.int(70, 120), by = 250 - rng.int(0, 30);
            P.rect(x0, by - h, w, h + 40, c);
            for (let j = 0; j < 3; j++) archShape(P, x0 + w * (j + .5) / 3, by, w / 3 - 6, h * .6, 0);
            for (let j = 0; j < 3; j++) { const ax = x0 + w * (j + .5) / 3; for (let y = by - 2; y > by - h * .45; y -= 3) if (rng.chance(.4)) P.rect(ax - 2, y, 4, 2, C('#ffd8a0')); } // light behind the arches
            P.rect(x0 - 4, by - h - 3, w + 8, 3, c);
            for (let i = 0; i < w; i += 6) P.rect(x0 + i, by - h - 7, 3, 4, c);
          }
          for (let x = 0; x < 960; x++) { const t = 240 + 16 * pfbm(x, 960, 8, seed + 4); P.col(x, t, 270, c); }
          P.rim(hi, 1);
        });
        const carpet = paint(40, 14, P => { // a flying suzani carpet
          for (let y = 2; y < 10; y++) for (let x = 2; x < 38; x++) P.set(x, y + R(Math.sin(x * .3) * 1.2), C((x + y) % 6 < 2 ? '#e8b040' : (x % 8 < 4 ? '#c8304a' : '#a02040')));
          for (let x = 2; x < 38; x += 4) { P.set(x, 10 + R(Math.sin(x * .3) * 1.2), C('#fff0c0')); P.set(x, 11 + R(Math.sin(x * .3) * 1.2), C('#fff0c0')); }
          P.disc(20, 5 + R(Math.sin(20 * .3) * 1.2), 2, C('#2a6ac8'));
        });
        return [
          lay(L, stack, .05, .025, -10, { alpha: .92 }),
          dlay(L, .1, .04, (ctx, ox, oy, t) => { // floating islands bobbing at different depths
            for (let k = 0; k < islands.length; k++) {
              const s = islands[k], par = .5 + (k % 3) * .25, x = ((ox * par + k * 170 + 40) % 1020 + 1020) % 1020 - 120, y = 30 + (k * 53) % 90 + oy * par + Math.sin(t * .4 + k * 1.7) * 5;
              ctx.globalAlpha = .7 + .1 * (k % 3); ctx.drawImage(s, R(x), R(y));
            }
            ctx.globalAlpha = 1;
          }),
          lay(L, arches, .18, .08, -4),
          dlay(L, .25, .1, (ctx, ox, oy, t) => { // carpets drift by; paper lanterns rise slowly
            for (let k = 0; k < 3; k++) { const x = ((ox + t * (6 + k * 3) + k * 330) % 1100 + 1100) % 1100 - 100, y = 70 + k * 40 + oy + Math.sin(t * .8 + k) * 6; ctx.drawImage(carpet, R(x), R(y)); }
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (let i = 0; i < 18; i++) {
              const x = ((ox * (.6 + (i % 3) * .2) + i * 61) % 520 + 520) % 520 - 20, y = 260 - ((t * (4 + (i % 4) * 2) + i * 41) % 300) + oy * .5;
              glow(ctx, x, y, 7 + (i % 3) * 2, i % 3 ? '#ffb070' : '#ff8ad0', .5);
              ctx.globalAlpha = .9; ctx.fillStyle = '#ffe0b0'; ctx.fillRect(R(x) - 1, R(y) - 1, 2 + (i % 2), 3);
            }
            ctx.restore();
          })
        ];
      };
      const haze = lazy(() => vgradCv([[0, 'rgba(60,20,100,0)'], [.6, 'rgba(200,140,220,0.12)'], [1, 'rgba(255,200,230,0.28)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(haze(), 0, 0); };
      const vig = lazy(() => vignetteCv('rgba(20,6,34,1)', .32, .66));
      def.post = function (ctx, cam, t) { blendFill(ctx, '#a040e0', .16 + .06 * Math.sin(t * .6)); ctx.globalAlpha = .5; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1; };
      addDecorate(def, (L, rng) => { // floating memory lanterns over the streets
        for (let x = 20; x < L.w - 20; x += rng.int(10, 20)) {
          let ty = 0; while (ty < L.h - 1 && air(L, x, ty)) ty++;
          if (ty < 8) continue;
          const y = (ty - rng.int(4, 7)) * TS;
          L.decos.push(floatLantern(x * TS + 8, y, { kind: 'paper', body: rng.pick(['#ff9ad0', '#ffb070', '#c8a0ff', '#8ad8ff']), core: '#fff4e0', lightR: 60, amp: 5, ph: rng.range(0, 6), glowR: 16 }));
        }
      });
    });

    /* ================================================================== */
    /* ========================= THE DROWNED WEDDING ===================== */
    /* ================================================================== */
    guard('yd_wedding', def => {
      def.drawSky = function (ctx, cam, t) {
        ctx.drawImage(sky('wedding', [[0, '#9ae8f0'], [.08, '#3aa8c8'], [.3, '#16609a'], [.62, '#0a2e60'], [1, '#03122e']], c => {
          const g = c.createRadialGradient(250, -20, 10, 250, -20, 220); g.addColorStop(0, 'rgba(220,255,250,0.5)'); g.addColorStop(1, 'rgba(120,220,240,0)'); c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
        }), 0, 0);
        ctx.fillStyle = '#e8fffc'; // the surface, seen from below
        for (let x = 0; x < G.W; x += 2) { const y = 7 + 3 * Math.sin(x * .07 + t * 1.8) + 2 * Math.sin(x * .023 - t); if (Math.sin(x * .31 + t * 3) > .3) { ctx.globalAlpha = .55; ctx.fillRect(x, R(y), 2, 1); } }
        ctx.globalAlpha = 1;
      };
      def.buildBackground = function (L) {
        const seed = (L.seed || 1) % 941;
        const domes = paint(960, 270, P => { // the drowned city in blue haze
          const rng = U.RNG(seed + 1), c = C('#1e5a8a'), c2 = C('#2a6a9a');
          let x = 0;
          while (x < 960) {
            const k = rng.next(), by = 210;
            if (k < .4) { const r = rng.int(14, 26); P.rect(x, by - r, 2 * r, 70, c); dome(P, x + r, by - r + 1, r, c2, { tall: 1.25 }); x += 2 * r + rng.int(6, 20); }
            else if (k < .65) { minaret(P, x + 4, by, rng.int(60, 110), 8, c, { bands: true }); x += rng.int(16, 30); }
            else { const w = rng.int(40, 70), h = rng.int(40, 70); P.rect(x, by - h, w, h + 70, c); archShape(P, x + w / 2, by, w * .5, h * .8, C('#103a66')); x += w + rng.int(4, 16); }
          }
          for (let x2 = 0; x2 < 960; x2++) P.col(x2, 208, 270, c);
          P.rim(C('#6ac0e0'), 1);
        });
        const canopy = paint(960, 270, P => { // the wedding: a great ayvan with suzani hangings, tables, a canopy for the bride
          const rng = U.RNG(seed + 2), wood = C('#0c2a4a'), cloth = [C('#7a2a4a'), C('#a03a50'), C('#c8803a')], c = C('#0a2240');
          for (let k = 0; k < 2; k++) {
            const x0 = k * 480 + rng.int(40, 160), w = 220, by = 240, h = 120;
            for (let i = 0; i <= 5; i++) { const cx = x0 + i * w / 5; P.rect(cx - 2, by - h, 5, h, wood); P.rect(cx - 4, by - h, 9, 4, wood); P.rect(cx - 3, by - 6, 7, 6, wood); } // carved columns
            P.rect(x0 - 10, by - h - 8, w + 20, 8, wood); P.poly([x0 - 14, by - h - 8, x0 + w + 14, by - h - 8, x0 + w / 2, by - h - 34], wood);
            for (let i = 0; i < 5; i++) { // suzani hangings between columns, with a round medallion
              const cx = x0 + (i + .5) * w / 5, cw = w / 5 - 10;
              for (let y = by - h + 4; y < by - h + 54 + (i % 2) * 12; y++) for (let x = cx - cw / 2; x < cx + cw / 2; x++) P.set(x, y, cloth[(Math.floor((y + x) / 5)) % 3]);
              P.disc(cx, by - h + 26, 7, C('#d8b050')); P.disc(cx, by - h + 26, 4, C('#7a2a4a'));
            }
            for (let i = 0; i < 4; i++) { const tx = x0 + 20 + i * 50; P.rect(tx, by - 16, 30, 3, wood); P.rect(tx + 3, by - 13, 2, 13, wood); P.rect(tx + 25, by - 13, 2, 13, wood); P.rect(tx + 10, by - 20, 4, 4, C('#c8a040')); } // low tables, bowls
          }
          for (let x = 0; x < 960; x++) P.col(x, 240, 270, c);
          P.rim(C('#4aa0c8'), 1);
        });
        const kelpCv = paint(960, 270, P => { // near kelp forest silhouettes
          const rng = U.RNG(seed + 3), c = C('#031428');
          for (let k = 0; k < 16; k++) { let x = rng.int(0, 959); const h = rng.int(50, 150); for (let y = 0; y < h; y++) { x += Math.sin(y * .05 + k) * .5; P.rect(x, 270 - y, y < h * .7 ? 2 : 1, 1, c); if (y % 11 === 5) { const sd = (y / 11) & 1 ? 1 : -3; P.ell(x + sd + 1, 270 - y, 3, 1.5, c); } } }
          for (let x = 0; x < 960; x++) P.col(x, 258 + 8 * pfbm(x, 960, 12, seed + 4), 270, c);
        });
        return [
          lay(L, domes, .05, .025, -4),
          dlay(L, .05, .025, (ctx, ox, oy, t) => { // a school of fish turning slowly in the blue
            ctx.fillStyle = '#9ad8f0';
            const cx = ((ox + 300 + t * 6) % 900 + 900) % 900 - 200, cy = 110 + oy + Math.sin(t * .3) * 20;
            for (let i = 0; i < 26; i++) { const a = t * .5 + i * .7, r = 14 + (i % 5) * 5, x = cx + Math.cos(a) * r * 1.6, y = cy + Math.sin(a * 1.3) * r * .5; ctx.globalAlpha = .55; ctx.fillRect(R(x), R(y), 3, 1); ctx.fillRect(R(x) + (Math.sin(a) > 0 ? -1 : 3), R(y), 1, 1); }
            ctx.globalAlpha = 1;
          }),
          lay(L, canopy, .16, .07, -6),
          dlay(L, .16, .07, (ctx, ox, oy, t) => { // the wedding lanterns still burn under water; petals rise
            ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (let k = 0; k < 2; k++) for (let i = 0; i < 9; i++) {
              const x = ((ox + k * 480 + 100 + i * 26) % 960 + 960) % 960 - 40, y = 104 + oy + 8 * Math.sin(i / 8 * Math.PI) + Math.sin(t * 1.1 + i) * 1.5;
              glow(ctx, x, y, 10, i % 2 ? '#ffb060' : '#ff6a5a', .55 + .15 * Math.sin(t * 3 + i)); ctx.globalAlpha = 1; ctx.fillStyle = '#ffe8b0'; ctx.fillRect(R(x) - 1, R(y) - 2, 3, 4);
            }
            ctx.restore();
          }),
          lay(L, kelpCv, .36, .14, 0, { alpha: .8 })
        ];
      };
      const haze = lazy(() => vgradCv([[0, 'rgba(20,90,150,0.04)'], [1, 'rgba(4,24,60,0.45)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(haze(), 0, 0); };
      const prevAmb = def.ambientFx;
      def.ambientFx = both(prevAmb, particles({ rate: .06, cols: ['#ff7a8a', '#ffb0b8', '#ffd890'], vx: [-.1, .1], vy: [-.25, -.08], from: 'bottom', life: 700, alpha: .8, sway: .02 })); // petals
      addDecorate(def, (L, rng) => { // strings of wedding lanterns between roofs, lanterns rising from the floor, fish
        const D = L.decos;
        const roofs = (L.structures || []).filter(s => (s.kind === 'building' || s.kind === 'colonnade') && s.roofY != null).sort((a, b) => a.x0 - b.x0);
        for (let i = 1; i < roofs.length; i++) { const a = roofs[i - 1], b = roofs[i], gap = b.x0 - a.x1; if (gap > 3 && gap < 24) D.push(lanternString((a.x1 + 1) * TS, a.roofY * TS + 6, b.x0 * TS, b.roofY * TS + 6, 12 + gap, ['#ff6a4a', '#ffb040', '#ff8ab0'], { lightC: '#ffb080' })); }
        for (let x = 24; x < L.w - 20; x += rng.int(14, 26)) {
          let ty = 0; while (ty < L.h - 1 && air(L, x, ty)) ty++;
          if (ty < 8) continue;
          D.push(floatLantern(x * TS + 8, (ty - rng.int(3, 6)) * TS, { kind: 'paper', body: rng.pick(['#ff6a4a', '#ffb040', '#ff8ab0']), lightC: '#ffa070', amp: 7, ph: rng.range(0, 6) }));
          if (rng.chance(.6)) D.push(fishDeco(x * TS + 8, (ty - rng.int(2, 8)) * TS, rng.int(30, 80), rng.pick(['#e8a040', '#d0d8e0', '#ff7a5a']), rng.range(0, 6), { s: 1, speed: rng.range(.6, 1.2) }));
        }
      });
    });

    /* ================================================================== */
    /* ============================= THE YEAR OF SAND ==================== */
    /* ================================================================== */
    guard('yd_sand', def => {
      def.drawSky = function (ctx, cam, t) {
        ctx.drawImage(sky('sand', [[0, '#2a1608'], [.35, '#6a3c18'], [.65, '#b07434'], [.88, '#d8a058'], [1, '#e8c07a']], c => {
          const g = c.createRadialGradient(330, 80, 6, 330, 80, 120); g.addColorStop(0, 'rgba(255,240,200,0.9)'); g.addColorStop(.12, 'rgba(255,220,160,0.5)'); g.addColorStop(1, 'rgba(200,140,60,0)'); c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
        }), 0, 0);
        ctx.globalAlpha = .6; tileX(ctx, dust(), -cam.x * .04 - t * 30, 40); ctx.globalAlpha = .45; tileX(ctx, dust(), -cam.x * .06 - t * 46 + 200, 110); ctx.globalAlpha = 1;
      };
      const dust = lazy(() => fogBand(480, 80, '#a87038', 61, .55));
      def.buildBackground = function (L) {
        const seed = (L.seed || 1) % 929;
        const giant = paint(720, 270, P => { // the Sleeper rising in the storm: a head and shoulder the size of the sky
          const c = C('#6a4020');
          for (let x = 0; x < 720; x++) {
            const u = x / 720;
            const sh = 120 - 80 * Math.exp(-(((u - .55) / .14) ** 2)) - 30 * Math.exp(-(((u - .3) / .2) ** 2)) + 10 * pfbm(x, 720, 6, seed + 1);
            P.col(x, sh, 270, c);
          }
          P.ell(396, 40, 46, 40, c); P.ell(396, 24, 28, 22, c); // head
          for (const [hx, hy, l] of [[372, 10, 30], [420, 10, 30]]) for (let i = 0; i < l; i++) P.rect(hx + (hx < 396 ? -i * .6 : i * .6), hy - i, 4 - i / 10, 2, c); // horns of the div
          P.rect(380, 36, 6, 2, C('#ffd890')); P.rect(406, 36, 6, 2, C('#ffd890')); P.set(382, 35, C('#fff4d0')); P.set(408, 35, C('#fff4d0')); // eyes
          P.rim(C('#a8703a'), 1);
        });
        const city = paint(720, 270, P => { // the city dissolving into sand from the top down
          const rng = U.RNG(seed + 2), c = C('#5a3418');
          let x = 0;
          while (x < 720) {
            const k = rng.next(), by = 210;
            if (k < .35) { const r = rng.int(10, 18); P.rect(x, by - 18, 2 * r, 40, c); dome(P, x + r, by - 17, r, c); x += 2 * r + rng.int(4, 12); }
            else if (k < .55) { minaret(P, x + 4, by, rng.int(50, 90), 7, c); x += rng.int(14, 24); }
            else { const w = rng.int(24, 50), h = rng.int(20, 50); P.rect(x, by - h, w, h + 40, c); x += w + rng.int(2, 8); }
          }
          // erosion: the storm eats the silhouettes (more at the top)
          for (let y = 0; y < 270; y++) for (let xx = 0; xx < 720; xx++) if ((P.get(xx, y) >>> 24) && pn2(xx * 2, y * 3 - xx * .5, 720, 9, seed + 3) > .38 + y / 270 * .55) P.set(xx, y, 0);
          for (let i = 0; i < 70; i++) { const xx = rng.int(0, 719), yy = rng.int(150, 230); if (P.get(xx, yy) === c) P.rect(xx, yy, 2, 2, rng.pick([C('#ff8a3a'), C('#ffc060')])); } // fires inside
          for (let x2 = 0; x2 < 720; x2++) P.col(x2, 212, 270, c);
          P.rim(C('#c8904a'), 1);
        });
        const dunes = paint(960, 270, P => { // dunes pouring over roofs
          const rng = U.RNG(seed + 4), c = C('#3a200c');
          for (let x = 0; x < 960; x++) { const t = 200 + 40 * pfbm(x, 960, 5, seed + 5) - 20 * Math.max(0, Math.sin(x / 960 * PI2 * 3)); P.col(x, t, 270, c); }
          for (let k = 0; k < 7; k++) { const x = rng.int(0, 900), w = rng.int(20, 40), h = rng.int(16, 40); P.rect(x, 230 - h, w, h, c); P.poly([x - 4, 230 - h, x + w + 4, 230 - h, x + w / 2, 230 - h - 10], c); }
          P.rim(C('#d8a860'), 1); P.side(C('#6a4020'), -1, c);
        });
        return [
          lay(L, giant, .015, .008, -10),
          dlay(L, .015, .008, (ctx, ox, oy, t) => { // the eyes of the waking spirit glow through the dust
            const k = .5 + .5 * Math.sin(t * .5); ctx.save(); ctx.globalCompositeOperation = 'lighter';
            for (const ex of [383, 409]) { const x = ((ox + ex - 10) % 720 + 720) % 720 + 10 - 10; glow(ctx, x - 0, 27 + oy - 10 + 10, 16, '#ffb050', .35 + .35 * k); if (x - 720 > -40) glow(ctx, x - 720, 27 + oy, 16, '#ffb050', .35 + .35 * k); }
            ctx.restore();
          }),
          dlay(L, .03, .015, (ctx, ox, oy, t) => { ctx.globalAlpha = .55; tileX(ctx, dust(), ox * 2 - t * 40, 120 + oy); ctx.globalAlpha = 1; }),
          lay(L, city, .08, .04, 0),
          dlay(L, .12, .05, (ctx, ox, oy, t) => { ctx.globalAlpha = .5; tileX(ctx, dust(), ox * 1.4 - t * 70, 170 + oy); ctx.globalAlpha = 1; }),
          lay(L, dunes, .22, .1, 4)
        ];
      };
      const haze = lazy(() => vgradCv([[0, 'rgba(160,100,40,0.18)'], [1, 'rgba(210,150,80,0.4)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(haze(), 0, 0); };
      const curtain = lazy(() => { // sheets of sand: long diagonal streaks, tileable
        const P = painter(640, G.H), rng = U.RNG(64);
        for (let y = 0; y < G.H; y++) for (let x = 0; x < 640; x++) { const n = pn2(x + y * .7, y * 4, 640, 64, 65); const a = clamp01((n - .5) * 2); if (a > .04) P.set(x, y, (R(a * 90) << 24 | 0x60 << 16 | 0xa0 << 8 | 0xd0) >>> 0); }
        for (let i = 0; i < 1100; i++) { const x = rng.int(0, 639), y = rng.int(0, G.H - 1); P.rect(x, y, rng.int(4, 16), 1, C(rng.pick(['#e8c890', '#c8a060', '#fff0c8']), rng.int(30, 110))); }
        return P.canvas();
      });
      def.drawForeground = function (ctx, cam, t) {
        const g = curtain(), k = .5 + .5 * Math.sin(t * .27);
        ctx.globalAlpha = .45 + .35 * k; tileX(ctx, g, -cam.x * 1.2 - t * 260, R(Math.sin(t * .4) * 5));
        ctx.globalAlpha = .3 + .25 * (1 - k); tileX(ctx, g, -cam.x * 1.6 - t * 380 + 320, R(Math.sin(t * .3 + 1) * 6));
        ctx.globalAlpha = 1;
      };
      const vig = lazy(() => vignetteCv('rgba(40,20,4,1)', .3, .62));
      def.post = function (ctx, cam, t) { blendFill(ctx, '#c87a20', .22); ctx.globalAlpha = .55; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1; };
      addDecorate(def, (L, rng) => { // houses burning on the night of erasure; dropped lanterns
        for (const run of spaced(K.floorRuns(L, 4, 3), 30, 'x0')) if (rng.chance(.45)) {
          const x = (rng.int(run.x0, run.x1) + .5) * TS;
          L.decos.push(PK.flameDeco(x, run.y - 3, { w: 8, h: 13, lightR: 96, lightC: '#ff8a40', embers: true, emberC: '#ffd890', draw(ctx) { ctx.fillStyle = '#2a1408'; ctx.fillRect(R(x) - 7, run.y - 3, 15, 3); ctx.fillRect(R(x) - 5, run.y - 6, 3, 3); ctx.fillRect(R(x) + 3, run.y - 5, 4, 2); } }));
        }
      });
    });

    /* ================================================================== */
    /* ============================== YOUR HOUSE ========================= */
    /* ================================================================== */
    // the Tail as a child remembers it: warm windows, apricot trees, washing on lines, a blue gate
    guard('yd_house', def => {
      def.drawSky = function (ctx, cam, t) {
        ctx.drawImage(sky('house', [[0, '#0a0610'], [.4, '#24121e'], [.7, '#5a2a24'], [.88, '#a0522a'], [1, '#d08040']], c => {
          const P = painter(G.W, G.H), rng = U.RNG(300);
          for (let i = 0; i < 120; i++) P.set(rng.int(0, G.W - 1), rng.int(0, 110), C(rng.pick(['#ffe8c8', '#ffffff', '#ffd8a8']), rng.int(60, 200)));
          P.disc(96, 96, 20, C('#ffe2b0')); P.disc(96, 96, 18, C('#fff0d0')); P.disc(90, 90, 4, C('#f4dcb0')); P.disc(102, 100, 3, C('#f4dcb0'));
          c.drawImage(P.canvas(), 0, 0);
          const g = c.createRadialGradient(96, 96, 16, 96, 96, 140); g.addColorStop(0, 'rgba(255,210,150,0.4)'); g.addColorStop(1, 'rgba(255,150,80,0)'); c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
        }), 0, 0);
        ctx.globalAlpha = .35; tileX(ctx, warmMist(), -cam.x * .02 + t * 1.5, 150); ctx.globalAlpha = 1;
      };
      const warmMist = lazy(() => fogBand(480, 60, '#e8a060', 71, .5));
      def.buildBackground = function (L) {
        const seed = (L.seed || 1) % 919;
        const WIN = [C('#ffd890'), C('#ffb860'), C('#ffe8b0')];
        const roofs = paint(960, 270, P => { // the Tail at dusk: flat roofs, lit windows, a few domes and a minaret
          const rng = U.RNG(seed + 1), c = C('#2a1418');
          let x = 0;
          while (x < 960) {
            const w = rng.int(18, 40), h = rng.int(18, 44), by = 214 + rng.int(-4, 4);
            P.rect(x, by - h, w, h + 60, c);
            if (rng.chance(.15)) dome(P, x + w / 2, by - h + 1, w * .38, c, { drum: 3 });
            else if (rng.chance(.08)) minaret(P, x + w / 2, by - h + 1, rng.int(30, 50), 6, c);
            else for (let i = 0; i < w; i += 7) if (rng.chance(.5)) P.rect(x + i, by - h - 3, 4, 3, c); // roof clutter
            windows(P, x + 2, x + w - 2, by - h + 4, by - 2, rng, .22, WIN);
            x += w + rng.int(0, 3);
          }
          for (let x2 = 0; x2 < 960; x2++) P.col(x2, 216, 270, c);
          P.rim(C('#8a4a30'), 1);
        });
        const trees = paint(960, 270, P => { // apricot trees in fruit and lines of washing
          const rng = U.RNG(seed + 2), bark = C('#1a0c0a'), leaf = [C('#2a1a14'), C('#3a2418'), C('#4a2e1a')], fruit = [C('#ffa040'), C('#ffc060')];
          for (let k = 0; k < 6; k++) {
            const x = k * 160 + rng.int(0, 80), by = 250, h = rng.int(60, 90);
            P.line(x, by, x + rng.int(-6, 6), by - h * .55, bark, 4);
            for (let j = 0; j < 14; j++) { const cx = x + rng.int(-34, 34), cy = by - h * .6 - rng.int(0, h * .45), r = rng.int(8, 16); P.disc(cx, cy, r, rng.pick(leaf)); }
            for (let j = 0; j < 22; j++) { const fx = x + rng.int(-34, 34), fy = by - h * .55 - rng.int(0, h * .5); if (P.get(fx, fy) >>> 24) P.rect(fx, fy, 2, 2, rng.pick(fruit)); }
          }
          for (let x = 0; x < 960; x++) { const t = 236 + 8 * pfbm(x, 960, 10, seed + 3); P.col(x, t, 270, C('#140808')); }
          P.rim(C('#a05a34'), 1, leaf[2]);
        });
        const yard = paint(960, 270, P => { // courtyard walls, an ayvan, and the blue gate
          const rng = U.RNG(seed + 4), c = C('#0e0606');
          for (let x = 0; x < 960; x++) { const t = 222 + (((x / 160) | 0) % 2 ? 0 : 8); P.col(x, t, 270, c); }
          for (let k = 0; k < 2; k++) { // the blue gate (Sado remembers it)
            const gx = k * 480 + 300, by = 270;
            P.rect(gx - 22, by - 64, 44, 64, c); archShape(P, gx, by, 30, 56, C('#1a3a6a'));
            for (let y = by - 50; y < by; y += 6) P.rect(gx - 14, y, 28, 1, C('#2a5a9a'));
            P.rect(gx - 1, by - 50, 2, 50, C('#0e2240')); P.rect(gx + 4, by - 24, 2, 2, C('#c8a050'));
          }
          for (let k = 0; k < 3; k++) { const x0 = k * 320 + 40; for (let i = 0; i < 4; i++) { const px = x0 + i * 22; P.rect(px, 170, 3, 60, c); P.rect(px - 2, 170, 7, 3, c); } P.rect(x0 - 6, 164, 80, 6, c); } // ayvan
          P.rim(C('#5a2a1a'), 1);
        });
        const lines = (ctx, ox, oy, t) => { // washing lines with cloth swaying (ikat colours)
          const cols = ['#c83a3a', '#e8c070', '#3a6ac8', '#f0e0d0', '#8a3a8a'];
          for (let k = 0; k < 3; k++) {
            const x0 = ((ox + k * 330 + 60) % 990 + 990) % 990 - 140, y0 = 150 + oy + k * 8, w = 120;
            ctx.fillStyle = '#1a0c08'; for (let i = 0; i <= w; i += 2) ctx.fillRect(R(x0 + i), R(y0 + 10 * Math.sin(i / w * Math.PI)), 1, 1);
            for (let i = 1; i < 7; i++) { const u = i / 7, x = x0 + w * u, y = y0 + 10 * Math.sin(u * Math.PI), sw = Math.sin(t * 1.6 + i + k) * 2; ctx.fillStyle = cols[(i + k) % cols.length]; ctx.fillRect(R(x), R(y) + 1, 8, 10 + (i % 3) * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(R(x + sw), R(y) + 10 + (i % 3) * 2, 8, 2); }
          }
        };
        return [
          lay(L, roofs, .06, .03, -6),
          dlay(L, .06, .03, (ctx, ox, oy, t) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 6; k++) glow(ctx, ((ox + k * 160 + 50) % 960 + 960) % 960 - 60, 200 + oy, 34, '#ff9a40', .1 + .04 * Math.sin(t * .7 + k)); ctx.restore(); }),
          lay(L, trees, .16, .07, -10),
          dlay(L, .24, .1, lines),
          lay(L, yard, .3, .13, 0)
        ];
      };
      const haze = lazy(() => vgradCv([[0, 'rgba(40,20,20,0)'], [.6, 'rgba(160,90,50,0.1)'], [1, 'rgba(220,140,70,0.22)']]));
      def.fogBehind = function (ctx) { ctx.drawImage(haze(), 0, 0); };
      def.drawForeground = null;
      const vig = lazy(() => vignetteCv('rgba(20,10,4,1)', .26, .6));
      def.post = function (ctx, cam, t) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; // warm motes in the evening light
        const s = shaftSprite(26, 300, '#ffc080', 60, 'houseray');
        for (let k = 0; k < 3; k++) { const x = ((-cam.x * .1 + k * 180) % 540 + 540) % 540 - 60; ctx.globalAlpha = .035 + .015 * Math.sin(t * .4 + k); ctx.save(); ctx.translate(x, -10); ctx.rotate(-.35); ctx.drawImage(s, 0, 0); ctx.restore(); }
        ctx.restore();
        blendFill(ctx, '#ff9a40', .18 + .04 * Math.sin(t * .5));
        ctx.globalAlpha = .7; ctx.drawImage(vig(), 0, 0); ctx.globalAlpha = 1;
      };
      def.ambientFx = both(def.ambientFx,
        particles({ rate: .05, cols: ['#ffd8e0', '#fff0f0', '#ffc8a8'], vx: [.1, .4], vy: [.15, .35], from: 'top', life: 600, alpha: .8, sway: .02 })); // apricot blossom
    });

    /* ================================================================== */
    /* =========================== THE NIGHTMARE'S NEST ================== */
    /* ================================================================== */
    guard('yd_nest', def => {
      const prevBG = def.buildBackground; // the arena's own (already graded) layers
      def.buildBackground = function (L) {
        let theirs = [];
        try { theirs = (prevBG && prevBG.call(this, L)) || []; } catch (e) { theirs = []; }
        const coils = paint(720, 270, P => { // the dragon's coils looping through the dark sky, scaled and barbed
          const c = C('#140308'), sc = C('#2a0812'), hi = C('#8a1a3a');
          const path = u => [u * 720, 150 + 60 * Math.sin(u * PI2 * 2 + .5) + 20 * Math.sin(u * PI2 * 5)];
          for (let i = 0; i < 2400; i++) { const u = i / 2400, [x, y] = path(u), th = 16 + 6 * Math.sin(u * PI2 * 3); P.disc(x, y, th / 2, c); }
          for (let i = 0; i < 2400; i += 6) { const u = i / 2400, [x, y] = path(u); P.set(x, y - 6, sc); P.set(x + 2, y - 4, sc); }
          for (let i = 0; i < 2400; i += 40) { const u = i / 2400, [x, y] = path(u), th = 16 + 6 * Math.sin(u * PI2 * 3); P.poly([x - 3, y - th / 2 + 1, x + 3, y - th / 2 + 1, x + 1, y - th / 2 - 8], c); }
          P.rim(hi, 1);
        });
        const shards = paint(480, 270, P => { // floating shards of broken memories
          const rng = U.RNG(91);
          for (let k = 0; k < 30; k++) { const x = rng.int(0, 479), y = rng.int(20, 230), s = rng.int(3, 9); P.poly([x, y - s, x + s * .6, y, x, y + s * .7, x - s * .5, y], C(rng.pick(['#3a0a1a', '#5a1028', '#2a0614']))); P.set(x, y - s + 1, C('#ff6a8a')); }
        });
        return [theirs[0], { canvas: coils, fx: .06, fy: .03, y: -10 },
          dlay(L, .06, .03, (ctx, ox, oy, t) => { const k = Math.max(0, Math.sin(t * .9) * Math.sin(t * 2.3)); if (k > .7) { ctx.globalAlpha = (k - .7) * .5; ctx.fillStyle = '#ff2a5a'; ctx.globalCompositeOperation = 'lighter'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; } }),
          ...theirs.slice(1),
          dlay(L, .2, .08, (ctx, ox, oy, t) => { ctx.globalAlpha = .9; tileX(ctx, shards, ox, oy + Math.sin(t * .5) * 4); ctx.globalAlpha = 1; })
        ].filter(Boolean);
      };
      def.ambientFx = both(def.ambientFx,
        particles({ rate: .12, cols: ['#ff3a5a', '#ff8a6a', '#c01040'], vx: [-.2, .2], vy: [-.4, -.1], from: 'bottom', glow: true, glowR: 3, life: 320, alpha: .85, sway: .02 }),
        particles({ rate: .15, cols: ['#1a0408', '#2a0a10'], vx: [.1, .4], vy: [.15, .4], from: 'top', life: 500, alpha: .8 }));
    });

    G.ART_DEEP = { ids: DEEP_IDS };
  }
}
