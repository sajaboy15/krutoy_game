/* =====================================================================
   Yodgor v2 — art of THE CITY (Prologue + Act I + every chaikhana).
   Repaints the biomes built by 60_world.js: skies, 4–6 layer parallax,
   haze, foreground silhouettes, grading, ambient life and props.
   Gameplay (gen, tiles' collision, enemies) is untouched: only the
   drawing fields of G.Biomes.defs[id] are replaced or extended.
   Everything static is painted once into canvases (cached per level
   seed); per frame we only blit and spawn a few particles.
   ===================================================================== */
{
(function artCity() {
  const K = G.BiomeKit, U = G.U, TS = G.TS, T = G.T;
  const DEFS = G.Biomes && G.Biomes.defs;
  if (!K || !DEFS || !U) { console.error('[art_city] engine/BiomeKit missing'); return; }
  const RD = Math.round, FL = Math.floor, PI = Math.PI;
  const ART = G.ART_CITY = { places: {} };

  /* ============================================================ colour */
  const _rgb = Object.create(null);
  function rgb(h) {
    let c = _rgb[h]; if (c) return c;
    let s = h.charAt(0) === '#' ? h.slice(1) : h;
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    const n = parseInt(s, 16);
    return (_rgb[h] = [n >> 16 & 255, n >> 8 & 255, n & 255]);
  }
  const c255 = v => v < 0 ? 0 : v > 255 ? 255 : RD(v);
  const hex = (r, g, b) => '#' + ((1 << 24) | (c255(r) << 16) | (c255(g) << 8) | c255(b)).toString(16).slice(1);
  function mix(a, b, k) { const A = rgb(a), B = rgb(b); return hex(A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k, A[2] + (B[2] - A[2]) * k); }
  const shade = (a, k) => k >= 0 ? mix(a, '#ffffff', k) : mix(a, '#000000', -k);
  const _pk = Object.create(null);
  function P32(h, a) {
    if (a == null) a = 255;
    const key = h + ':' + a; let v = _pk[key];
    if (v !== undefined) return v;
    const c = rgb(h);
    return (_pk[key] = ((a << 24) | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0);
  }
  function rampHex(stops, v) {
    if (v <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const a = stops[i - 1], b = stops[i]; return mix(a[1], b[1], (v - a[0]) / Math.max(1e-6, b[0] - a[0])); }
    return stops[stops.length - 1][1];
  }
  const BY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const dth = (x, y) => (BY[((y & 3) << 2) | (x & 3)] + .5) / 16;

  /* ============================================================ noise (periodic where asked) */
  function hash(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  function n1(x, s, p) { const i = FL(x), f = x - i, u = f * f * (3 - 2 * f); const a = p ? ((i % p) + p) % p : i, b = p ? (((i + 1) % p) + p) % p : i + 1; return hash(a, 7, s) * (1 - u) + hash(b, 7, s) * u; }
  function fbm(x, s, o, p) { let a = 0, m = .5, f = 1, n = 0; for (let k = 0; k < (o || 4); k++) { a += n1(x * f, s + k * 31, p ? p * f : 0) * m; n += m; m *= .5; f *= 2; } return a / n; }
  function n2(x, y, s) {
    const ix = FL(x), iy = FL(y), fx = x - ix, fy = y - iy, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
    const a = hash(ix, iy, s), b = hash(ix + 1, iy, s), c = hash(ix, iy + 1, s), d = hash(ix + 1, iy + 1, s);
    return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
  }
  function rngOf(seed) { // small deterministic rng
    let s = (seed | 0) ^ 0x5bd1e995;
    const r = () => { s = Math.imul(s ^ (s >>> 15), 2246822507); s = Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; };
    r.int = (a, b) => a + FL(r() * (b - a + 1));
    r.range = (a, b) => a + r() * (b - a);
    r.pick = arr => arr[FL(r() * arr.length)];
    r.chance = p => r() < p;
    return r;
  }

  /* ============================================================ pixel buffer */
  class Px {
    constructor(w, h, wrap) { this.w = w | 0; this.h = h | 0; this.wrap = !!wrap; this.d = new Uint32Array(this.w * this.h); }
    ix(x, y) {
      x = FL(x); y = FL(y);
      if (y < 0 || y >= this.h) return -1;
      if (this.wrap) x = ((x % this.w) + this.w) % this.w; else if (x < 0 || x >= this.w) return -1;
      return y * this.w + x;
    }
    set(x, y, c) { const i = this.ix(x, y); if (i >= 0) this.d[i] = c; }
    get(x, y) { const i = this.ix(x, y); return i >= 0 ? this.d[i] : 0; }
    has(x, y) { return (this.get(x, y) >>> 24) > 0; }
    rect(x, y, w, h, c) { const x0 = FL(x), y0 = FL(y), x1 = FL(x + w), y1 = FL(y + h); for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) this.set(xx, yy, c); }
    // alpha blend a hex colour over what is there
    blend(x, y, h, a) {
      const i = this.ix(x, y); if (i < 0 || a <= 0) return;
      const o = this.d[i], oa = o >>> 24, c = rgb(h);
      if (!oa) { this.d[i] = P32(h, c255(a * 255)); return; }
      const r = (o & 255) + (c[0] - (o & 255)) * a, g = (o >> 8 & 255) + (c[1] - (o >> 8 & 255)) * a, b = (o >> 16 & 255) + (c[2] - (o >> 16 & 255)) * a;
      const na = Math.max(oa, c255(a * 255));
      this.d[i] = ((na << 24) | (c255(b) << 16) | (c255(g) << 8) | c255(r)) >>> 0;
    }
    // recolour existing opaque pixels toward hex
    tint(x, y, h, a) { const i = this.ix(x, y); if (i < 0 || !(this.d[i] >>> 24)) return; this.blend(x, y, h, a); }
    disc(cx, cy, r, c) { for (let y = FL(cy - r); y <= cy + r; y++) for (let x = FL(cx - r); x <= cx + r; x++) if ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r) this.set(x, y, c); }
    line(x0, y0, x1, y1, c) { const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1); for (let k = 0; k <= n; k++) this.set(RD(x0 + (x1 - x0) * k / n), RD(y0 + (y1 - y0) * k / n), c); }
    canvas() {
      const cv = G.makeCanvas(this.w, this.h);
      const id = cv.ctx.createImageData(this.w, this.h);
      new Uint32Array(id.data.buffer).set(this.d);
      cv.ctx.putImageData(id, 0, 0);
      return cv;
    }
  }
  ART.Px = Px;

  /* ============================================================ sky */
  // stops: [[pos, hex]...] top→bottom. o: {steps, stars, starH, moon:{x,y,r,col,shadow,halo}, sun:{x,y,r,core,rim,halo}, glow:{y,h,col,a}}
  function paintSky(stops, o) {
    o = o || {};
    const W = G.W, H = G.H, px = new Px(W, H), n = o.steps || 22, cols = [];
    for (let i = 0; i < n; i++) cols.push(P32(rampHex(stops, i / (n - 1))));
    for (let y = 0; y < H; y++) {
      const q = (y / (H - 1)) * (n - 1), lo = FL(q), f = q - lo;
      for (let x = 0; x < W; x++) px.d[y * W + x] = cols[Math.min(n - 1, lo + (f > dth(x, y) ? 1 : 0))];
    }
    const r = rngOf(o.seed || 7);
    if (o.glow) for (const g of [].concat(o.glow)) { // horizon or sun glow: radial, dithered
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const dx = (x - g.x) / g.rx, dy = (y - g.y) / g.ry, d = Math.sqrt(dx * dx + dy * dy);
        if (d >= 1) continue;
        const k = (1 - d) * (1 - d) * g.a;
        if (k > dth(x, y) * .9) px.blend(x, y, g.col, Math.min(1, k * 1.3));
      }
    }
    if (o.stars) {
      for (let i = 0; i < o.stars; i++) {
        const x = r.int(0, W - 1), y = r.int(0, FL(H * (o.starH || .6))), b = r();
        const c = r.pick(o.starCols || ['#ffffff', '#d8e4ff', '#ffe8c8', '#a8b8f0']);
        px.blend(x, y, c, .35 + .65 * b * (1 - y / (H * (o.starH || .6))));
        if (b > .965) { px.blend(x - 1, y, c, .35); px.blend(x + 1, y, c, .35); px.blend(x, y - 1, c, .35); px.blend(x, y + 1, c, .35); }
      }
      if (o.milky) { // a faint band of the milky way
        const m = o.milky;
        for (let y = 0; y < H * .7; y++) for (let x = 0; x < W; x++) {
          const t = (x - m.x0) / W, cy = m.y0 + t * m.dy, dd = Math.abs(y - cy) / m.w;
          if (dd > 1) continue;
          const v = (1 - dd) * n2(x * .08, y * .08, 99) * m.a;
          if (v > dth(x, y) * .7) px.blend(x, y, m.col, .18);
          if (hash(x, y, 77) < (1 - dd) * .04) px.blend(x, y, '#ffffff', .5);
        }
      }
    }
    if (o.moon) {
      const m = Object.assign({ col: '#f4f0e0', dark: '#c8c4c0', halo: '#a8b8f0', haloA: .5 }, o.moon);
      for (let y = FL(m.y - m.r * 7); y <= m.y + m.r * 7; y++) for (let x = FL(m.x - m.r * 7); x <= m.x + m.r * 7; x++) {
        const d = Math.hypot(x + .5 - m.x, y + .5 - m.y) / m.r;
        if (d > 1 && d < 7) { const k = m.haloA * Math.pow(1 / d, 1.6) * (d < 1.25 ? 1.4 : 1); if (k > dth(x, y) * .55) px.blend(x, y, m.halo, Math.min(.85, k)); }
      }
      for (let y = FL(m.y - m.r); y <= m.y + m.r; y++) for (let x = FL(m.x - m.r); x <= m.x + m.r; x++) {
        const dx = x + .5 - m.x, dy = y + .5 - m.y, d = Math.hypot(dx, dy);
        if (d > m.r) continue;
        let c = m.col;
        if (n2(x * .35, y * .35, 5) > .62) c = m.dark; // maria
        if (d > m.r - 1) c = mix(m.col, m.halo, .3);
        if (m.phase) { const sx = m.x + m.r * m.phase, sd = Math.hypot(x + .5 - sx, y + .5 - m.y + m.r * .15); if (sd < m.r * .95) continue; }
        px.set(x, y, P32(c));
      }
    }
    if (o.sun) {
      const s = Object.assign({ core: '#fffaf0', rim: '#ffe0a0', halo: '#ffb060', haloA: .6, rays: 0 }, o.sun);
      for (let y = FL(s.y - s.r * 9); y <= s.y + s.r * 9; y++) for (let x = FL(s.x - s.r * 9); x <= s.x + s.r * 9; x++) {
        const d = Math.hypot(x + .5 - s.x, y + .5 - s.y) / s.r;
        if (d <= 1) { px.set(x, y, P32(d > .82 ? s.rim : s.core)); continue; }
        if (d < 9) { const k = s.haloA * Math.pow(1 / d, 1.3); if (k > dth(x, y) * .5) px.blend(x, y, s.halo, Math.min(.9, k)); }
      }
    }
    return px;
  }

  /* ============================================================ landscape painters (into wrapping Px) */
  // silhouette ridge: profile from fbm, filled down; rim light on top
  function ridge(px, o) {
    const W = px.w, r = rngOf(o.seed || 3);
    const per = o.per || 8;
    for (let x = 0; x < W; x++) {
      let v = fbm(x / W * per, o.seed || 3, o.oct || 5, per);
      if (o.shape) v = o.shape(x / W, v);
      const top = RD(o.base - o.amp * v);
      const litCol = (fbm((x + 4) / W * per, o.seed || 3, 3, per) - fbm((x - 4) / W * per, o.seed || 3, 3, per)) * (o.rimSide || 1) < 0;
      for (let y = Math.max(0, top); y < px.h; y++) {
        let c = o.col;
        if (o.grad) c = mix(o.col, o.grad, Math.min(1, (y - top) / (o.gradH || 40)));
        if (o.tex && n2(x * .2, y * .3, o.seed || 3) > .62) c = mix(c, o.tex, .5);
        if (o.snow) { const lim = o.snow.depth * (.35 + .9 * n1(x * .09, (o.seed || 3) + 1)) * (top < o.base - o.amp * .35 ? 1 : .3); const dd = y - top; if (dd < lim - 1) c = litCol ? o.snow.col : o.snow.col2; else if (dd < lim + 2 && dth(x, y) > (dd - lim + 1) / 3) c = o.snow.col2; }
        px.set(x, y, P32(c));
      }
      if (o.rim && (litCol || o.rimAll)) px.set(x, top, P32(o.rim));
    }
    if (o.lights) for (let i = 0; i < o.lights; i++) {
      const x = r.int(0, W - 1); let y = 0; while (y < px.h && !px.has(x, y)) y++;
      const yy = y + r.int(1, o.lightsDepth || 8);
      if (yy < px.h) px.set(x, yy, P32(r.pick(o.lightCols || ['#ffcf7a', '#ffb05a'])));
    }
  }
  // the shading helper used by round things: n = normal x (-1..1), light from lx (-1 left, +1 right)
  const tone = (n, lx, ny) => -n * lx * .75 + (ny || 0);

  // mud-brick house; pal: {wall, lit, dark, roof, rim, win, winCore, winDark, door}
  function house(px, x, by, w, h, pal, r, o) {
    o = o || {};
    const lx = o.lx || -1, top = by - h;
    for (let yy = top; yy < by; yy++) for (let xx = x; xx < x + w; xx++) {
      let c = pal.wall;
      const ex = lx < 0 ? xx - x : x + w - 1 - xx;
      if (ex === 0) c = pal.lit; else if (ex >= w - 2) c = pal.dark;
      if (o.tex !== false && hash(xx, yy, 13) < .07) c = mix(c, pal.dark, .5);
      if (o.courses && (yy - top) % 4 === 3 && hash(xx >> 1, yy, 3) < .5) c = mix(c, pal.dark, .25);
      px.set(xx, yy, P32(c));
    }
    // flat roof: rounded clay edge, rim light, beam ends (vassa)
    for (let xx = x - 1; xx <= x + w; xx++) px.set(xx, top, P32(pal.roof));
    for (let xx = x; xx < x + w; xx++) if (hash(xx, top, 5) < .6) px.set(xx, top - 1, P32(pal.roof));
    px.set(lx < 0 ? x - 1 : x + w, top - 1, P32(pal.rim || pal.lit));
    for (let xx = x; xx < x + w; xx++) if (hash(xx, top, 6) < .45) px.set(xx, top - 1, P32(pal.rim || pal.lit));
    if (o.beams !== false) for (let xx = x + 1; xx < x + w - 1; xx += 3) px.set(xx, top + 1, P32(pal.dark));
    // windows: a loose grid
    const ww = o.ww || 2, wh = o.wh || 3, sx = o.wsx || 5, sy = o.wsy || 7;
    for (let yy = top + 3; yy + wh < by - 3; yy += sy) for (let xx = x + 2; xx + ww < x + w - 1; xx += sx) {
      if (!r.chance(o.wp == null ? .55 : o.wp)) continue;
      const lit = r.chance(o.lit == null ? .45 : o.lit);
      for (let a = 0; a < wh; a++) for (let b = 0; b < ww; b++) {
        let c = lit ? (a === 0 || b === 0 ? pal.winCore : pal.win) : pal.winDark;
        if (lit && o.lattice && ww >= 3 && (a + b) % 2 === 1) c = pal.win;
        px.set(xx + b, yy + a, P32(c));
      }
      if (lit && o.spill) px.blend(xx + RD(ww / 2), yy + wh, pal.win, .35);
      if (!lit && o.sill) for (let b = -1; b <= ww; b++) px.set(xx + b, yy + wh, P32(pal.lit));
    }
    if (o.door && w > 7) { const dx = x + r.int(2, w - 6); for (let a = 0; a < 6; a++) for (let b = 0; b < 3; b++) if (!(a === 0 && b !== 1)) px.set(dx + b, by - 6 + a, P32(o.doorLit ? pal.win : pal.door || pal.winDark)); }
    return top;
  }
  // dome on a drum. kind: 'onion' | 'melon' | 'bowl' | 'cone'. pal: {lo, mid, hi, rim, drum, drumD, gold}
  function dome(px, cx, by, r, pal, o) {
    o = o || {};
    const lx = o.lx || -1, kind = o.kind || 'melon', dh = o.drum == null ? RD(r * .55) : o.drum;
    // drum
    for (let yy = by - dh; yy < by; yy++) for (let xx = RD(cx - r - 1); xx <= cx + r + 1; xx++) {
      const n = (xx - cx) / (r + 1); let c = pal.drum;
      if (tone(n, lx) > .35) c = shade(pal.drum, .12); else if (tone(n, lx) < -.4) c = pal.drumD;
      if (o.band && (yy === by - dh + 1)) c = pal.mid;
      px.set(xx, yy, P32(c));
    }
    if (o.drumWin) for (let xx = RD(cx - r + 2); xx < cx + r - 1; xx += 4) for (let a = 0; a < 3; a++) px.set(xx, by - dh + 3 + a, P32(o.drumWin));
    const H = kind === 'onion' ? r * 1.9 : kind === 'cone' ? r * 1.6 : kind === 'bowl' ? r * .85 : r * 1.25;
    const base = by - dh;
    for (let k = 0; k < H; k++) {
      const t = k / H; let hw;
      if (kind === 'onion') hw = r * (t < .45 ? 1 + .22 * Math.sin(t / .45 * PI) : Math.max(0, Math.cos((t - .45) / .55 * PI / 2)) ** 1.5 * 1.04);
      else if (kind === 'cone') hw = r * (1 - t);
      else hw = r * Math.sqrt(Math.max(0, 1 - t * t));
      const yy = RD(base - k - 1);
      for (let xx = RD(cx - hw); xx <= cx + hw; xx++) {
        const n = hw > 0 ? (xx + .5 - cx) / (hw + .5) : 0, v = tone(n, lx, .25 * (t - .3)) + (dth(xx, yy) - .5) * .25;
        let c = v > .45 ? pal.hi : v > -.05 ? pal.mid : pal.lo;
        if (o.ribs && kind !== 'cone') { const a = Math.asin(Math.max(-1, Math.min(1, n))) * o.ribs; if (Math.abs(Math.sin(a)) < .16 && t < .92) c = shade(c, -.22); }
        if (o.tiles && ((xx + yy) % 3 === 0) && t > .1 && t < .85 && v > -.3) c = shade(c, .1);
        if (Math.abs(xx - (cx + lx * hw)) < .7 && pal.rim) c = pal.rim;
        px.set(xx, yy, P32(c));
      }
    }
    if (pal.gold) { const ty = RD(base - H); for (let k = 1; k <= (o.finial || 4); k++) px.set(RD(cx), ty - k, P32(pal.gold)); px.set(RD(cx) - 1, ty - 2, P32(pal.gold)); px.set(RD(cx) + 1, ty - 2, P32(pal.gold)); }
    return base - H;
  }
  // minaret: tapered shaft, banded brick, gallery (lit arches), cap
  function minaret(px, cx, by, h, w0, w1, pal, o) {
    o = o || {};
    const lx = o.lx || -1;
    for (let k = 0; k < h; k++) {
      const t = k / h, hw = (w0 + (w1 - w0) * t) / 2, yy = by - k - 1;
      const band = o.bands && (k % o.bands < 2);
      for (let xx = RD(cx - hw); xx <= cx + hw; xx++) {
        const n = (xx + .5 - cx) / (hw + .5), v = tone(n, lx) + (dth(xx, yy) - .5) * .2;
        let c = v > .4 ? pal.hi : v > -.15 ? pal.mid : pal.lo;
        if (band) c = v > .2 ? pal.bandHi || pal.band : pal.band;
        else if (o.brick && ((xx + (k >> 1)) & 3) === 0 && (k & 1)) c = shade(c, -.12);
        px.set(xx, yy, P32(c));
      }
    }
    const gy = by - h, gw = w1 / 2 + 2;
    for (let xx = RD(cx - gw); xx <= cx + gw; xx++) { px.set(xx, gy, P32(pal.hi)); px.set(xx, gy + 1, P32(pal.lo)); if ((xx & 1) === 0) px.set(xx, gy + 2, P32(pal.lo)); }
    const lh = o.lantern || 6;
    for (let k = 1; k <= lh; k++) for (let xx = RD(cx - w1 / 2); xx <= cx + w1 / 2; xx++) {
      const n = (xx + .5 - cx) / (w1 / 2 + .5), arch = ((xx - RD(cx - w1 / 2)) % 3 === 1) && k > 1 && k < lh;
      px.set(xx, gy - k, P32(arch ? (o.lit ? (k === 2 ? pal.winCore || pal.win : pal.win) : pal.lo) : (tone(n, lx) > .2 ? pal.hi : pal.mid)));
    }
    const ty = dome(px, cx, gy - lh, w1 / 2 + .5, { lo: pal.lo, mid: pal.capMid || pal.mid, hi: pal.capHi || pal.hi, drum: pal.mid, drumD: pal.lo, gold: pal.gold }, { kind: o.cap || 'bowl', drum: 1, lx });
    return ty;
  }
  // pishtaq portal with pointed arch recess and tile frame
  function portal(px, x, by, w, h, pal, o) {
    o = o || {};
    const lx = o.lx || -1;
    for (let yy = by - h; yy < by; yy++) for (let xx = x; xx < x + w; xx++) {
      const ex = lx < 0 ? xx - x : x + w - 1 - xx;
      let c = ex < 1 ? pal.hi : ex > w - 3 ? pal.lo : pal.mid;
      const fr = xx - x < 3 || x + w - 1 - xx < 3 || yy - (by - h) < 3;
      if (fr && pal.tile) c = ((xx + yy) & 1) ? pal.tile : pal.tile2 || pal.tile;
      px.set(xx, yy, P32(c));
    }
    const aw = Math.max(4, RD(w * .56)), ax = x + RD((w - aw) / 2), ah = RD(h * .74), ay = by - ah;
    for (let yy = ay; yy < by; yy++) {
      const t = (yy - ay) / (aw * .62);
      let hw = aw / 2;
      if (t < 1) hw = aw / 2 * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) * 1.02;
      for (let xx = RD(x + w / 2 - hw); xx < x + w / 2 + hw; xx++) {
        let c = pal.recess;
        if (yy - ay < aw * .5 && ((xx + yy) % 3 === 0)) c = pal.recessHi || shade(pal.recess, .15);
        if (o.lit && yy > by - ah * .45 && Math.abs(xx - (x + w / 2)) < hw - 1) c = (yy > by - 3 || Math.abs(xx - (x + w / 2)) > hw - 2) ? pal.recess : pal.win;
        px.set(xx, yy, P32(c));
      }
    }
    if (o.guld) for (const gx of [x, x + w - 1]) { for (let k = 0; k < 8; k++) px.set(gx, by - h - k, P32(pal.hi)); px.set(gx, by - h - 9, P32(pal.gold || pal.hi)); }
  }
  // Ark-style battered wall with merlons and round bastions
  function fortWall(px, x0, x1, by, h, pal, o) {
    o = o || {};
    const lx = o.lx || -1, bat = o.batter || .12;
    for (let xx = x0; xx < x1; xx++) for (let k = 0; k < h; k++) {
      const yy = by - k - 1; let c = (hash(xx >> 1, yy >> 1, 41) < .1) ? pal.lo : pal.mid;
      if (o.courses && k % 5 === 0) c = shade(pal.mid, -.1);
      px.set(xx, yy, P32(c));
    }
    for (let xx = x0; xx < x1; xx++) if (((xx - x0) % 5) < 3) { px.set(xx, by - h - 1, P32(pal.mid)); px.set(xx, by - h - 2, P32(pal.hi)); }
    const step = o.step || 46;
    for (let bx = x0 + 12; bx < x1 - 8; bx += step) {
      const r = o.br || 9, bh = h + 6;
      for (let k = 0; k < bh; k++) {
        const hw = r * (1 - bat * (k / bh)), yy = by - k - 1;
        for (let xx = RD(bx - hw); xx <= bx + hw; xx++) {
          const n = (xx + .5 - bx) / (hw + .5), v = tone(n, lx) + (dth(xx, yy) - .5) * .25;
          px.set(xx, yy, P32(v > .45 ? pal.hi : v > -.2 ? pal.mid : pal.lo));
        }
      }
      for (let xx = RD(bx - r + 1); xx <= bx + r - 1; xx++) if (((xx - bx + 20) % 4) < 2) { px.set(xx, by - bh - 1, P32(pal.mid)); px.set(xx, by - bh - 2, P32(pal.hi)); }
      if (o.lit) { px.set(bx, by - bh + 5, P32(pal.win)); px.set(bx, by - bh + 6, P32(pal.win)); }
    }
  }
  // trees. kind: 'chinar' | 'poplar' | 'cypress' | 'apricot' | 'dead' | 'saxaul' | 'willow'. pal: {lo, mid, hi, rim, trunk, trunkHi, bloom}
  function tree(px, cx, by, size, kind, pal, seed, o) {
    o = o || {};
    if (!pal.trunk) pal = Object.assign({ trunk: pal.lo || '#202020' }, pal);
    const lx = o.lx || -1, r = rngOf(seed);
    const trunkW = Math.max(1, RD(size * (kind === 'chinar' ? .11 : .07)));
    const blobs = [];
    if (kind === 'poplar' || kind === 'cypress') {
      const h = size * (kind === 'cypress' ? 1.25 : 1.6), w = size * (kind === 'cypress' ? .22 : .3);
      for (let k = 0; k < h; k++) {
        const t = k / h, hw = w * (kind === 'cypress' ? Math.sin(Math.min(1, (1 - t) * 1.25) * PI / 2) * (t < .1 ? t * 10 : 1) : Math.sin(t * PI) ** .6), yy = RD(by - size * .12 - k);
        for (let xx = RD(cx - hw); xx <= cx + hw; xx++) {
          const n = (xx + .5 - cx) / (hw + .5), v = tone(n, lx) + (n2(xx * .5, yy * .25, seed) - .5) * .9;
          px.set(xx, yy, P32(v > .45 ? pal.hi : v > -.2 ? pal.mid : pal.lo));
        }
      }
      for (let k = 0; k < size * .14; k++) px.set(RD(cx), by - k, P32(pal.trunk));
      return;
    }
    if (kind === 'dead' || kind === 'saxaul') {
      const br = (x, y, a, len, w, d) => {
        const x2 = x + Math.cos(a) * len, y2 = y + Math.sin(a) * len;
        const n = Math.max(1, RD(len));
        for (let k = 0; k <= n; k++) { const xx = x + (x2 - x) * k / n, yy = y + (y2 - y) * k / n; for (let q = 0; q < w; q++) px.set(RD(xx + q - w / 2), RD(yy), P32(q === 0 ? pal.trunkHi || pal.trunk : pal.trunk)); }
        if (d > 0) { const m = r.int(2, 3); for (let i = 0; i < m; i++) br(x2, y2, a + r.range(-.75, .75), len * r.range(.55, .78), Math.max(1, w - 1), d - 1); }
        else if (kind === 'saxaul' && pal.mid) for (let i = 0; i < 4; i++) px.set(RD(x2 + r.int(-2, 2)), RD(y2 + r.int(-1, 1)), P32(r.chance(.5) ? pal.mid : pal.lo));
      };
      br(cx, by, -PI / 2 + r.range(-.15, .15), size * .38, trunkW + 1, kind === 'saxaul' ? 3 : 4);
      return;
    }
    // broad-leaved crowns from blobs
    const cw = size * (kind === 'apricot' ? .62 : kind === 'willow' ? .6 : .7), ch = size * (kind === 'apricot' ? .5 : .62), ccy = by - size * (kind === 'apricot' ? .55 : .62);
    const nb = kind === 'chinar' ? 13 : 9;
    for (let i = 0; i < nb; i++) {
      const a = r.range(0, PI * 2), d = Math.sqrt(r());
      blobs.push([cx + Math.cos(a) * d * cw * .62, ccy + Math.sin(a) * d * ch * .55, size * r.range(.16, .27)]);
    }
    blobs.push([cx, ccy - ch * .18, size * .3]);
    // trunk + limbs (pale mottled bark for chinar)
    const tTop = ccy + ch * .1;
    for (let yy = RD(tTop); yy < by; yy++) {
      const t = (yy - tTop) / (by - tTop), w = trunkW + (t > .85 ? 1 : 0);
      for (let q = -w; q <= w; q++) {
        let c = q * lx < 0 ? (pal.trunkHi || pal.trunk) : pal.trunk;
        if (kind === 'chinar' && n2((cx + q) * .6, yy * .4, seed) > .64) c = pal.bark || shade(pal.trunk, .25);
        px.set(RD(cx + q), yy, P32(c));
      }
    }
    for (let i = 0; i < 3; i++) { const bx = cx + (i - 1) * cw * .35, byy = ccy + ch * .05; px.line(cx, tTop + 4, bx, byy, P32(pal.trunk)); px.line(cx + 1, tTop + 4, bx + 1, byy, P32(pal.trunk)); }
    // crown pixels
    const x0 = FL(cx - cw - size * .3), x1 = cx + cw + size * .3, y0 = FL(ccy - ch - size * .3), y1 = ccy + ch * .8;
    for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) {
      let best = -1e9, bn = 0, bny = 0;
      const edge = 1 + (n2(xx * .55, yy * .55, seed + 3) - .5) * .55;
      for (const b of blobs) {
        const dx = (xx + .5 - b[0]) / b[2], dy = (yy + .5 - b[1]) / b[2], d = dx * dx + dy * dy;
        if (d < edge && -d > best) { best = -d; bn = dx; bny = dy; }
      }
      if (best === -1e9) continue;
      let v = tone(bn, lx, -bny * .55) + (n2(xx * .7, yy * .7, seed + 9) - .5) * .7;
      if (kind === 'willow' && hash(xx, 0, seed) < .3) v -= .3;
      let c = v > .55 ? pal.hi : v > .05 ? pal.mid : v > -.45 ? pal.lo : pal.deep || pal.lo;
      if (pal.rim && v > .85) c = pal.rim;
      if (pal.bloom && v > -.2 && hash(xx, yy, seed + 5) < (kind === 'apricot' ? .32 : .08)) c = hash(xx, yy, seed + 6) < .5 ? pal.bloom : pal.bloom2 || pal.bloom;
      px.set(xx, yy, P32(c));
    }
    if (kind === 'willow') for (let i = 0; i < 18; i++) { const xx = RD(cx + r.range(-cw, cw)), yy0 = RD(ccy + r.range(0, ch * .5)), l = r.int(4, 12); for (let k = 0; k < l; k++) px.set(xx, yy0 + k, P32(k & 1 ? pal.lo : pal.mid)); }
  }
  // tiny sprites from strings ('#' = col, '+' = col2/highlight)
  const SPR = {
    camel: ['        ##      ', '       ####     ', '   ## ######    ', '  ############  ', '#############   ', ' ## ########  ##', '     ######  ## ', '     #    #  #  ', '     #    #  #  ', '     #    #  #  ', '    ##   ##  ## '],
    camelLie: ['        ##     ', '  ##   ####    ', ' ###########   ', '############ ##', ' ########### # ', '##############'],
    walker: ['  #  ', ' ### ', ' ### ', '#####', ' ### ', ' ### ', ' # # ', ' # # '],
    stork: ['   ##  ', '  ###  ', '#####  ', ' ####  ', '  #    ', '  #    ', ' ##    '],
    crow: ['#     #', '##   ##', ' ##### ', '   #   '],
    bird: ['#   #', ' # # ', '  #  ']
  };
  function sprite(px, name, x, y, col, s, flip) {
    const rows = SPR[name], c = P32(col); s = s || 1;
    for (let j = 0; j < rows.length; j++) for (let i = 0; i < rows[j].length; i++) if (rows[j][i] !== ' ') {
      const xx = flip ? rows[j].length - 1 - i : i;
      for (let a = 0; a < s; a++) for (let b = 0; b < s; b++) px.set(x + xx * s + b, y + j * s + a, c);
    }
  }
  // catenary line with hanging cloth / bulbs
  function rope(px, x0, y0, x1, y1, sag, col, items) {
    const n = Math.max(2, Math.abs(x1 - x0));
    const pt = u => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + sag * 4 * u * (1 - u)];
    const c = typeof col === 'number' ? col : P32(col);
    for (let k = 0; k <= n; k++) { const [x, y] = pt(k / n); px.set(RD(x), RD(y), c); }
    if (items) items(pt);
  }
  // soft stratus / cumulus bank: ellipse blobs with lit top and dithered edges
  function cloud(px, cx, cy, w, h, pal, seed, o) {
    o = o || {};
    const r = rngOf(seed), bl = [];
    const nb = Math.max(3, RD(w / (h * .9)));
    for (let i = 0; i < nb; i++) bl.push([cx - w / 2 + (i + .5) * w / nb + r.range(-3, 3), cy + r.range(-h * .15, h * .2), w / nb * r.range(.7, 1.15), h * r.range(.45, .8)]);
    for (let yy = FL(cy - h); yy <= cy + h; yy++) for (let xx = FL(cx - w / 2 - 12); xx <= cx + w / 2 + 12; xx++) {
      let best = 0, by = 0;
      for (const b of bl) { const dx = (xx - b[0]) / b[2], dy = (yy - b[1]) / b[3], d = 1 - (dx * dx + dy * dy); if (d > best) { best = d; by = dy; } }
      if (best <= 0) continue;
      const fl = yy > cy + h * .25 ? (yy - cy - h * .25) / (h * .2) : 0; // flat-ish base
      const a = Math.min(1, best * 2.2) - fl;
      if (a < dth(xx, yy) * (o.soft || 1)) continue;
      const v = -by * .9 + (n2(xx * .15, yy * .3, seed) - .5) * .6;
      px.set(xx, yy, P32(v > .45 ? pal.hi : v > -.1 ? pal.mid : pal.lo, o.alpha == null ? 255 : o.alpha));
    }
  }

  /* ============================================================ layer runtime */
  // ground reference: the camera's y when the hero stands on the main ground
  function refOf(L) {
    if (L._artRef) return L._artRef;
    let gy;
    const bg = L.biome && L.biome.gen && L.biome.gen.base;
    if (L.isOpen && bg) gy = (L.h - bg) * TS;
    else if (L.groundRow && L.groundRow.length) { const a = Array.from(L.groundRow).filter(v => v > 0).sort((p, q) => p - q); gy = a[FL(a.length / 2)] * TS; }
    else {
      const ys = (L.spots && L.spots.floor || []).filter(s => !s.plat).map(s => s.y).sort((p, q) => p - q);
      gy = ys.length ? ys[FL(ys.length * .7)] : (L.h - 3) * TS;
    }
    const maxY = Math.max(0, L.h * TS - G.H);
    const ref = Math.max(0, Math.min(maxY, gy - 197));
    return (L._artRef = { gy, ref, horizon: gy - ref - (L.isOpen ? 34 : 0) });
  }
  // a parallax layer from a wrapping canvas. base = screen y of the canvas bottom at the reference camera
  function layer(cv, o) {
    const w = cv.width, h = cv.height;
    return {
      art: true,
      draw(ctx, cam, t) {
        const L = G.level, R = refOf(L);
        const base = (o.base == null ? R.horizon : o.base) - (cam.y - R.ref) * (o.fy || 0);
        const y = RD(base - h);
        if (y > G.H) return;
        let x = -cam.x * (o.fx || 0) + (o.drift ? t * o.drift : 0) + (o.x || 0);
        x = ((x % w) + w) % w - w;
        if (o.alpha != null) ctx.globalAlpha = o.alpha;
        for (; x < G.W; x += w) {
          ctx.drawImage(cv, RD(x), y);
          if (o.glows) {
            ctx.globalCompositeOperation = 'lighter';
            for (const g of o.glows) { const gx = x + g[0]; if (gx < -g[3] || gx > G.W + g[3]) continue; ctx.globalAlpha = (g[4] || .5) * (.8 + .2 * Math.sin(t * 2.3 + g[0])); ctx.drawImage(glowCv(g[2], g[3]), RD(gx - g[3]), RD(y + g[1] - g[3])); }
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = o.alpha != null ? o.alpha : 1;
          }
        }
        ctx.globalAlpha = 1;
        if (o.fill && y + h < G.H) { ctx.fillStyle = o.fill; ctx.fillRect(0, y + h, G.W, G.H - y - h); }
      }
    };
  }
  const _glow = {};
  function glowCv(col, r) {
    const key = col + r; if (_glow[key]) return _glow[key];
    const cv = G.makeCanvas(r * 2, r * 2), g = cv.ctx.createRadialGradient(r, r, 0, r, r, r), c = rgb(col);
    g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`); g.addColorStop(.35, `rgba(${c[0]},${c[1]},${c[2]},.35)`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, r * 2, r * 2);
    return (_glow[key] = cv);
  }
  // cached full-screen sky
  function skyDraw(make, extra) {
    let cv = null;
    return function (ctx, cam, t, L) {
      if (!cv) cv = make().canvas();
      ctx.drawImage(cv, 0, 0);
      if (extra) extra(ctx, cam, t, L);
    };
  }
  function twinkles(seed, n, hMax, col) {
    const r = rngOf(seed), pts = [];
    for (let i = 0; i < n; i++) pts.push([r.int(0, G.W - 1), r.int(0, FL(G.H * hMax)), r.range(0, 6), r.range(1.2, 3.2)]);
    return function (ctx, cam, t) {
      ctx.fillStyle = col || '#ffffff';
      for (const p of pts) { const a = Math.sin(t * p[3] + p[2]); if (a > .4) { ctx.globalAlpha = (a - .4) * 1.6; ctx.fillRect(p[0], p[1], 1, 1); } }
      ctx.globalAlpha = 1;
    };
  }
  // vertical haze gradient canvas (screen), drawn between parallax and world
  function hazeCanvas(stops) {
    const px = new Px(8, G.H);
    for (let y = 0; y < G.H; y++) { const v = y / (G.H - 1); let a = 0, col = stops[0][1]; for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const p = stops[i - 1], q = stops[i], k = (v - p[0]) / (q[0] - p[0]); a = p[2] + (q[2] - p[2]) * k; col = mix(p[1], q[1], k); break; } for (let x = 0; x < 8; x++) px.set(x, y, P32(col, c255(a * 255))); }
    return px.canvas();
  }
  function hazeDraw(stops) { let cv = null; return function (ctx) { if (!cv) cv = hazeCanvas(stops); ctx.drawImage(cv, 0, 0, G.W, G.H); }; }
  // a soft diagonal light shaft sprite
  const _shaft = {};
  function shaftCv(col, w, slope) {
    const key = col + w + ':' + slope; if (_shaft[key]) return _shaft[key];
    const H = G.H, W = w + RD(Math.abs(slope) * H) + 2, px = new Px(W, H);
    for (let y = 0; y < H; y++) {
      const off = slope >= 0 ? slope * y : W - w - 2 + slope * y, fade = Math.pow(1 - y / H, 1.2);
      for (let x = 0; x < w; x++) {
        const e = Math.sin((x + .5) / w * PI);
        const a = e * fade;
        if (a > .02) px.set(RD(off + x), y, P32(col, c255(a * 110)));
      }
    }
    return (_shaft[key] = px.canvas());
  }
  function shafts(list) { // list: [{x, w, slope, col, a, fx, speed}]
    return function (ctx, cam, t) {
      ctx.globalCompositeOperation = 'lighter';
      for (const s of list) {
        const cv = shaftCv(s.col, s.w, s.slope);
        const x = ((s.x - cam.x * (s.fx || .05)) % 700 + 700) % 700 - 110;
        ctx.globalAlpha = s.a * (.75 + .25 * Math.sin(t * (s.speed || .35) + s.x));
        ctx.drawImage(cv, RD(x), 0);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    };
  }
  function grade(col, a, op) { return function (ctx) { ctx.globalCompositeOperation = op || 'soft-light'; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(0, 0, G.W, G.H); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; }; }
  function vignette(col, a, inner) {
    let cv = null;
    return function (ctx) {
      if (!cv) {
        cv = G.makeCanvas(G.W, G.H);
        const g = cv.ctx.createRadialGradient(G.W / 2, G.H * .48, G.H * (inner || .32), G.W / 2, G.H / 2, G.W * .64);
        g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col);
        cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, G.W, G.H);
      }
      ctx.globalAlpha = a; ctx.drawImage(cv, 0, 0); ctx.globalAlpha = 1;
    };
  }
  const all = (...fns) => { fns = fns.filter(Boolean); return function () { for (const f of fns) f.apply(this, arguments); }; };
  // foreground strip: a wrapping canvas scrolled faster than the world, glued to the top or bottom of the screen
  function fgStrip(cv, o) {
    const w = cv.width, h = cv.height;
    return function (ctx, cam, t) {
      let x = -cam.x * (o.fx || 1.3) + (o.x || 0);
      x = ((x % w) + w) % w - w;
      const y = o.top ? RD(-(o.lift || 0) + Math.sin(t * .6) * (o.bob || 0) - (cam.y - refOf(G.level).ref) * (o.fy || 0)) : RD(G.H - h + (o.drop || 0) - (cam.y - refOf(G.level).ref) * (o.fy || 0));
      if (o.alpha != null) ctx.globalAlpha = o.alpha;
      for (; x < G.W; x += w) ctx.drawImage(cv, RD(x), y);
      ctx.globalAlpha = 1;
    };
  }

  /* ============================================================ particles */
  function emit(o) {
    o = Object.assign({ rate: .2, cols: ['#ffffff'], vx: [-.1, .1], vy: [.2, .5], size: 1, life: 360, glow: false, glowR: 4, alpha: .8, from: 'top', grav: 0, sway: 0, max: 220 }, o);
    let live = 0;
    return function (world, cam) {
      let n = o.rate;
      while (n > 0) {
        if (Math.random() < Math.min(1, n) && live < o.max) {
          const x = cam.x + (o.from === 'left' ? -4 : o.from === 'right' ? G.W + 4 : U.rand(-20, G.W + 20));
          const y = cam.y + (o.from === 'top' ? -4 : o.from === 'bottom' ? G.H + 4 : o.band ? U.rand(G.H * o.band[0], G.H * o.band[1]) : U.rand(0, G.H));
          live++;
          G.FX.spawn({
            x, y, vx: U.rand(o.vx[0], o.vx[1]), vy: U.rand(o.vy[0], o.vy[1]), drag: 1, grav: o.grav, life: o.life * U.rand(.7, 1.1),
            size: Array.isArray(o.size) ? U.rand(o.size[0], o.size[1]) : o.size, size1: o.size1, shape: o.shape, w: o.w, h: o.h,
            color: U.choose(o.cols), glow: o.glow, glowR: o.glowR, alpha: o.alpha,
            update: p => {
              if (o.sway) p.vx += Math.sin(p.t * .05 + p.y * .02) * o.sway;
              if (o.flicker) p.alpha = o.alpha * (.35 + .65 * Math.max(0, Math.sin(p.t * .09 + p.x)));
              if (o.wander) { p.vx += U.rand(-o.wander, o.wander); p.vy += U.rand(-o.wander, o.wander); p.vx *= .97; p.vy *= .97; }
              if (p.t >= p.life - 1) live--;
            }
          });
        }
        n -= 1;
      }
    };
  }

  /* ============================================================ props (world space; lit by the level light) */
  const propCache = new Map();
  function prop(key, w, h, paint) {
    let cv = propCache.get(key);
    if (!cv) { const px = new Px(w, h); paint(px); cv = px.canvas(); propCache.set(key, cv); }
    return cv;
  }
  function addStatic(L, cv, x, y, layer) { L.decos.push({ static: true, layer: layer || 'back', bx: RD(x), by: RD(y), bw: cv.width, bh: cv.height, draw(ctx) { ctx.drawImage(cv, RD(x), RD(y)); } }); }
  // clay khum / jug
  function jarCv(v, pal) {
    pal = pal || { lo: '#5a2e1c', mid: '#8a4a2a', hi: '#b8703e', rim: '#d89a5a', dark: '#2a160e' };
    const w = [9, 7, 12, 5][v % 4], h = [12, 9, 15, 7][v % 4];
    return prop('jar' + v + pal.mid, w + 2, h + 1, px => {
      for (let y = 0; y < h; y++) {
        const t = y / h, hw = (w / 2) * (t < .18 ? .55 : Math.sin(Math.min(1, (t - .05) * 1.15) * PI) * .9 + .1);
        for (let x = RD(w / 2 + 1 - hw); x <= w / 2 + hw; x++) {
          const n = (x - w / 2 - .5) / (hw + .5), vv = -n * .8 + (dth(x, y) - .5) * .3;
          px.set(x, y, P32(y === 0 ? pal.rim : vv > .45 ? pal.hi : vv > -.25 ? pal.mid : pal.lo));
        }
      }
      if (v % 2 === 0) for (let x = 2; x < w; x++) if ((x & 1)) px.set(x, RD(h * .35), P32(pal.lo));
      for (let x = 1; x <= w; x++) px.set(x, h, P32(pal.dark));
    });
  }
  // suzani / ikat carpet hung on a wall or a rail
  const CARPET_PALS = [
    ['#7a1a22', '#b8323a', '#e8c070', '#1e2a5a', '#e8dcc0'],
    ['#1e2a5a', '#2c4a9a', '#e8c070', '#9a2a2a', '#e8dcc0'],
    ['#4a1a3a', '#8a2a5a', '#e8a040', '#2a6a5a', '#f0e0c8'],
    ['#6a3a12', '#c87a2a', '#f0d8a0', '#2a3a6a', '#3a1a10']
  ];
  function carpetCv(v, w, h) {
    const p = CARPET_PALS[v % CARPET_PALS.length], kind = v % 3;
    return prop('carpet' + v + ':' + w + 'x' + h, w, h + 2, px => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const bx = Math.min(x, w - 1 - x), byy = Math.min(y, h - 1 - y), b = Math.min(bx, byy);
        let c = p[1];
        if (b === 0) c = p[0]; else if (b === 1) c = p[2]; else if (b === 2) c = ((x + y) & 1) ? p[3] : p[0];
        else {
          const cx = x - w / 2 + .5, cy = y - h / 2 + .5;
          if (kind === 0) { const d = Math.abs(cx) + Math.abs(cy) * .8; if (d < Math.min(w, h) * .32) c = d < Math.min(w, h) * .18 ? p[2] : p[3]; if (((x + y) % 6) === 0) c = p[4]; }
          else if (kind === 1) { if (Math.sin(y * .9 + Math.sin(x * .45) * 2) > .45) c = p[2]; else if (Math.sin(y * .9 + Math.sin(x * .45) * 2) < -.6) c = p[3]; } // ikat waves
          else { const r = Math.hypot(cx, cy * (w / h)); if ((r % 6) < 2) c = p[2]; else if ((r % 6) < 3) c = p[3]; } // suzani rosette
        }
        if (hash(x, y, v) < .05) c = shade(c, -.15);
        px.set(x, y, P32(c));
      }
      for (let x = 1; x < w - 1; x += 2) { px.set(x, h, P32(p[2])); if (hash(x, 1, v) < .5) px.set(x, h + 1, P32(p[2])); } // fringe
    });
  }
  // tandir clay oven
  function tandirCv() {
    return prop('tandir', 14, 11, px => {
      for (let y = 0; y < 11; y++) { const hw = 6.5 * Math.sqrt(Math.max(0, 1 - ((10 - y) / 11) ** 2)) + .5; for (let x = RD(7 - hw); x < 7 + hw; x++) { const n = (x + .5 - 7) / hw; px.set(x, y, P32(n < -.4 ? '#c89a6a' : n > .5 ? '#6a4a30' : '#a07850')); } }
      for (let x = 4; x < 10; x++) px.set(x, 2, P32('#2a1408')); for (let x = 5; x < 9; x++) px.set(x, 3, P32('#1a0a04'));
      for (let x = 1; x < 13; x++) px.set(x, 10, P32('#3a2618'));
    });
  }
  // wooden ayvan column with carved capital
  function columnCv(h, pal) {
    pal = pal || { lo: '#3a2414', mid: '#6a4426', hi: '#9a6a3a', cap: '#b8864a' };
    return prop('col' + h + pal.mid, 9, h, px => {
      for (let y = 0; y < h; y++) {
        const t = y / h; let hw = 1.6 + (t > .86 ? (t - .86) * 14 : 0);
        if (y < 7) hw = 4 - y * .3;
        for (let x = RD(4.5 - hw); x <= 4.5 + hw; x++) {
          const n = (x - 4.5) / (hw + .5); let c = n < -.3 ? pal.hi : n > .4 ? pal.lo : pal.mid;
          if (y < 7 && ((x + y) & 1)) c = pal.cap; if (y > 8 && y % 9 === 0) c = pal.lo;
          px.set(x, y, P32(c));
        }
      }
    });
  }
  // a glowing pierced brass lantern hanging from a cord (dynamic, cheap)
  function lamp(x, y, o) {
    o = Object.assign({ len: 8, body: '#c8902a', glass: '#ffcf6a', core: '#fff4c0', light: '#ffb060', lightR: 78, glow: '#ffb24a', glowR: 22, a: .95 }, o);
    const ph = x * .021;
    return {
      x, y: y + o.len + 6, r: 40, layer: o.layer || 'back', light: { r: o.lightR, color: o.light, a: o.a, flicker: true },
      draw(ctx, t) {
        const sw = Math.sin(t * 1.4 + ph) * (.8 + .5 * ((G.level && G.level.biome && G.level.biome.wind) || 0));
        const bx = RD(x + sw), byy = RD(y + o.len);
        ctx.fillStyle = '#1a120c';
        for (let i = 0; i < o.len; i += 1) ctx.fillRect(RD(x + sw * i / o.len), y + i, 1, 1);
        ctx.fillStyle = o.body; ctx.fillRect(bx - 1, byy, 3, 1); ctx.fillRect(bx - 3, byy + 1, 7, 1); ctx.fillRect(bx - 3, byy + 8, 7, 1); ctx.fillRect(bx - 1, byy + 9, 3, 1);
        ctx.fillStyle = o.glass; ctx.fillRect(bx - 3, byy + 2, 7, 6);
        ctx.fillStyle = o.core; ctx.fillRect(bx - 1, byy + 3, 3, 4);
        ctx.fillStyle = o.body; ctx.fillRect(bx - 3, byy + 4, 1, 2); ctx.fillRect(bx + 3, byy + 4, 1, 2); ctx.fillRect(bx, byy + 2, 1, 1);
      },
      fx(ctx, t) { const sw = Math.sin(t * 1.4 + ph); G.Glow.add(x + sw, y + o.len + 5, o.glowR, o.glow, .5 + .12 * U.noise1(t * 5 + x, 4)); }
    };
  }
  // a cloth banner / laundry piece that sways (dynamic)
  function cloth(x, y, w, h, cols, o) {
    o = o || {};
    const ph = x * .05;
    return {
      x: x + w / 2, y: y + h / 2, r: Math.max(w, h) + 10, layer: o.layer || 'back',
      draw(ctx, t) {
        const wind = ((G.level && G.level.biome && G.level.biome.wind) || .3);
        for (let j = 0; j < h; j++) {
          const sw = Math.sin(t * 2.1 + ph + j * .25) * j / h * (1.2 + wind * 1.4);
          ctx.fillStyle = cols[(j >> (o.stripe || 2)) % cols.length];
          ctx.fillRect(RD(x + sw), y + j, w, 1);
        }
      }
    };
  }
  // aryk: a narrow stone-lined canal sunk into the floor (front static) + shimmer (dynamic)
  function aryk(L, x0, x1, y, pal) {
    pal = pal || { stone: '#6a6050', stoneHi: '#9a8c70', water: '#1e4a5a', waterHi: '#4a9aa8' };
    const w = x1 - x0;
    const cv = prop('aryk' + w + pal.water, w, 6, px => {
      for (let x = 0; x < w; x++) {
        px.set(x, 0, P32(hash(x >> 2, 0, 9) < .5 ? pal.stoneHi : pal.stone));
        for (let yy = 1; yy < 5; yy++) px.set(x, yy, P32(yy === 1 ? shade(pal.water, -.3) : pal.water));
        px.set(x, 5, P32(pal.stone));
        if ((x % 9) === 0) px.set(x, 0, P32(shade(pal.stone, -.3)));
      }
    });
    addStatic(L, cv, x0, y - 1, 'front');
    L.decos.push({
      x: x0 + w / 2, y, r: w / 2 + 20, layer: 'mid',
      draw(ctx, t) {
        ctx.fillStyle = pal.waterHi;
        for (let x = x0 + 2; x < x1 - 2; x += 5) { const k = Math.sin(t * 2 + x * .3); if (k > .3) ctx.fillRect(x + RD(k * 2), y + 1 + ((x >> 3) & 1), 2, 1); }
      }
    });
  }

  /* ============================================================ placement helpers */
  function runs(L, min, clear) { try { return K.floorRuns(L, min || 3, clear || 3); } catch (e) { return []; } }
  function busyXs(L) {
    const xs = [];
    for (const o of L.objects || []) xs.push(o.x);
    if (L.exit) xs.push(L.exit.x != null ? L.exit.x : (L.exit.tx || 0) * TS);
    if (L.spawn) xs.push(L.spawn.x != null ? L.spawn.x : (L.spawn.tx || 0) * TS);
    return xs;
  }
  function free(busy, x, pad) { for (const b of busy) if (Math.abs(b - x) < (pad || 24)) return false; return true; }
  function inStruct(L, tx, ty) { return L.structOf && L.structOf(tx, ty); }
  // structures that have an interior back wall (building/colonnade) — good for carpets and lamps
  function interiors(L) { return (L.structures || []).filter(s => (s.kind === 'building' || s.kind === 'colonnade' || s.kind === 'tower') && s.floorY != null && s.roofY != null); }

  /* ============================================================ the override machinery */
  function place(id, spec) {
    const d = DEFS[id];
    if (!d) { console.error('[art_city] no biome', id); return; }
    ART.places[id] = spec;
    const orig = { buildBackground: d.buildBackground, decorate: d.decorate };
    for (const k of ['drawSky', 'fogBehind', 'drawForeground', 'post', 'ambientFx', 'lights']) if (k in spec) d[k] = spec[k];
    for (const k of ['ambient', 'shade', 'deepShade', 'bloom', 'wind', 'dust', 'rock', 'sunDir']) if (spec[k] != null) d[k] = spec[k];
    if (spec.layers) d.buildBackground = function (L) {
      L._artRef = null;
      const R = refOf(L), out = [];
      try { for (const ly of spec.layers(L, R, spec.seed || 17)) if (ly) out.push(ly); } // one look per place: painted once per session
      catch (e) { console.error('[art_city] layers ' + id, e); return orig.buildBackground ? orig.buildBackground.call(this, L) : []; }
      return out;
    };
    if (spec.decorate) d.decorate = function (L, rng) {
      if (orig.decorate && spec.keepDecor !== false) orig.decorate.call(this, L, rng);
      if (spec.filterDecos) L.decos = L.decos.filter(d => spec.filterDecos(d, L));
      try { spec.decorate(L, rngOf((L.seed || 1) * 7 + 3), L); } catch (e) { console.error('[art_city] decorate ' + id, e); }
    };
  }
  // memoised canvases per level seed (backgrounds are rebuilt per level; painting is the slow part)
  const bgCache = new Map();
  function memo(key, make) {
    let v = bgCache.get(key);
    if (!v) { v = make(); bgCache.set(key, v); if (bgCache.size > 80) bgCache.delete(bgCache.keys().next().value); }
    return v;
  }
  Object.assign(ART, { Px, P32, mix, shade, rgb, paintSky, ridge, house, dome, minaret, portal, fortWall, tree, sprite, rope, cloud, layer, refOf, skyDraw, twinkles, hazeDraw, shafts, grade, vignette, all, fgStrip, emit, prop, addStatic, jarCv, carpetCv, tandirCv, columnCv, lamp, cloth, aryk, runs, busyXs, free, interiors, place, memo, rngOf, hash, n2, fbm, dth });

  /* =====================================================================
     PLACES
     ===================================================================== */
  const W = () => G.W;
  // -------- shared skyline builders ---------------------------------------
  // a band of Tail houses climbing a slope; returns a canvas
  function tailBand(seed, o) {
    const r = rngOf(seed), w = o.w || 1200, h = o.h || 150, px = new Px(w, h, true);
    const pal = o.pal;
    let x = 0;
    while (x < w) {
      const hw = r.int(o.hw[0], o.hw[1]), hh = r.int(o.hh[0], o.hh[1]);
      const slope = o.slope ? RD(o.slope * (Math.sin(x / w * PI * 2 * (o.waves || 2) + seed) * .5 + .5)) : 0;
      const by = h - slope - r.int(0, o.jit || 0);
      const top = house(px, x, by, hw, hh, pal, r, { lx: o.lx || -1, wp: o.wp, lit: o.lit, ww: o.ww, wh: o.wh, wsx: o.wsx, wsy: o.wsy, door: o.door, lattice: o.lattice, courses: o.courses });
      for (let yy = by; yy < h; yy++) for (let xx = x; xx < x + hw; xx++) if (!px.has(xx, yy)) px.set(xx, yy, P32(pal.dark));
      if (o.extra) o.extra(px, x, by, hw, hh, top, r);
      x += hw + (r.chance(o.gap || .15) ? r.int(1, 4) : 0);
    }
    for (let xx = 0; xx < w; xx++) for (let yy = h - 1; yy >= h - (o.floorFill || 4); yy--) if (!px.has(xx, yy)) px.set(xx, yy, P32(pal.dark));
    return px;
  }
  // rooftop clutter for house bands: jars, ladders, small pavilions, laundry
  function roofClutter(pal, o) {
    o = o || {};
    return function (px, x, by, hw, hh, top, r) {
      if (r.chance(o.jar || .25)) { const jx = x + r.int(1, Math.max(1, hw - 3)); px.rect(jx, top - 3, 2, 2, P32(pal.dark)); px.set(jx, top - 4, P32(pal.dark)); }
      if (r.chance(o.ladder || .12)) { const lx = x + r.int(0, hw - 2); for (let k = 0; k < 8; k++) { px.set(lx + (k >> 2), top - k + 4, P32(pal.dark)); px.set(lx + 3 + (k >> 2), top - k + 4, P32(pal.dark)); if (k % 2 === 0) px.set(lx + 1 + (k >> 2), top - k + 4, P32(pal.dark)); } }
      if (r.chance(o.pav || .1) && hw > 10) { // bolakhona pavilion with posts
        const pw = RD(hw * .6), px0 = x + RD((hw - pw) / 2), ph = 7;
        for (let xx = px0 - 1; xx <= px0 + pw; xx++) { px.set(xx, top - ph, P32(pal.roof)); px.set(xx, top - ph - 1, P32(pal.rim || pal.lit)); }
        for (let xx = px0; xx < px0 + pw; xx += 3) for (let k = 1; k < ph; k++) px.set(xx, top - k, P32(pal.dark));
        if (o.pavLit) for (let xx = px0 + 1; xx < px0 + pw - 1; xx++) for (let k = 2; k < ph; k++) if ((xx - px0) % 3) px.blend(xx, top - k, pal.win, .55);
      }
      if (r.chance(o.line || .18)) { // laundry line to the next roof
        const x2 = x + hw + r.int(6, 14), y0 = top - 4, cols = o.clothCols || ['#a8323a', '#2a5a9a', '#d8c8a0', '#c89a3a'];
        rope(px, x + hw - 1, y0, x2, y0 + r.int(-3, 3), r.int(2, 4), P32(pal.dark), pt => {
          for (let u = .15; u < .9; u += r.range(.15, .3)) { const [qx, qy] = pt(u), cw = r.int(2, 4), ch = r.int(3, 6), cc = r.pick(cols); for (let a = 0; a < ch; a++) for (let b = 0; b < cw; b++) px.set(RD(qx) + b, RD(qy) + a + 1, P32(o.clothDark ? mix(cc, pal.dark, o.clothDark) : cc)); }
        });
      }
    };
  }

  /* ---------------------------------------------------------------- shared scene pieces */
  // base-biome lollipop trees (bukhara decorate) are replaced by our own trees
  const isBaseTree = (d, L) => d.static && d.layer !== 'front' && d.bh >= 56 && d.bh <= 86 && d.bw <= 100 && !(L.structOf && L.structOf(FL((d.bx + d.bw / 2) / TS), FL((d.by + d.bh - 4) / TS)));
  // a city skyline band: landmarks (domes / minarets / portals / fort) behind a row of low houses
  function cityBand(seed, o) {
    const r = rngOf(seed), w = o.w || 1400, h = o.h || 140, px = new Px(w, h, true), lx = o.lx || -1, n = o.n || 4;
    const by = h - (o.lift || 8);
    for (let i = 0; i < n; i++) {
      const cx = RD((i + .5) * w / n + r.range(-w / n / 4, w / n / 4)), kind = o.kinds[(i + seed) % o.kinds.length];
      if (kind === 'dome') {
        const rr = r.int(o.dr[0], o.dr[1]), bh = RD(rr * .9);
        dome(px, cx, by - bh, rr, o.dpal, { kind: r.pick(o.domeKinds || ['melon', 'onion']), ribs: r.chance(.7) ? 10 : 0, lx, drumWin: o.dpal.win, tiles: true });
        house(px, cx - rr - 5, by, rr * 2 + 10, bh, o.pal, r, { lx, wp: .3, lit: o.lit, ww: 1, wh: 2, wsx: 4, wsy: 5, beams: false });
      } else if (kind === 'minaret') {
        minaret(px, cx, by, r.int(o.mh[0], o.mh[1]), o.mw || 9, (o.mw || 9) - 3, o.mpal, { lx, bands: 9, brick: true, lit: (o.lit || 0) > .2, lantern: o.ml || 6 });
      } else if (kind === 'portal') {
        const pw = r.int(o.pw[0], o.pw[1]), ph = RD(pw * 1.15);
        if (r.chance(.75)) dome(px, cx + RD(pw * .5), by - RD(ph * .55), RD(pw * .36), o.dpal, { kind: r.pick(['melon', 'onion']), ribs: 12, lx, tiles: true });
        portal(px, RD(cx - pw / 2), by, pw, ph, o.ppal, { lx, guld: true, lit: (o.lit || 0) > .3 });
      } else if (kind === 'fort') {
        fortWall(px, cx - 90, cx + 90, by, r.int(30, 40), o.fpal || o.ppal, { lx, step: 44, br: 9, lit: (o.lit || 0) > .3 });
      } else if (kind === 'tree') {
        tree(px, cx, by, r.int(40, 60), r.pick(['poplar', 'chinar', 'cypress']), o.tpal, seed + i);
      }
    }
    let x = 0;
    while (x < w) {
      const hw = r.int(o.hw[0], o.hw[1]), hh = r.int(o.hh[0], o.hh[1]);
      house(px, x, h, hw, hh, o.pal, r, { lx, wp: o.wp == null ? .4 : o.wp, lit: o.lit, ww: o.ww || 1, wh: o.wh || 2, wsx: o.wsx || 4, wsy: o.wsy || 5, beams: o.beams });
      x += hw + (r.chance(o.gap || .25) ? r.int(2, 6) : 0);
    }
    if (o.trees) for (let i = 0; i < o.trees; i++) tree(px, r.int(0, w), h - 2, r.int(o.ts[0], o.ts[1]), r.pick(o.tkinds || ['poplar', 'chinar']), o.tpal, seed + 70 + i, { lx });
    return px;
  }
  // smoke columns rising behind the houses (procedural puffs; no particles)
  function smokeLayer(o) {
    const cols = [], r = rngOf(o.seed || 5);
    for (let i = 0; i < o.n; i++) cols.push({ x: r.range(0, o.w), sp: r.range(.035, .06), ph: r(), h: r.range(o.h[0], o.h[1]) });
    const puff = {};
    const sprite = c => puff[c] || (puff[c] = (() => { const cv = G.makeCanvas(32, 32), g = cv.ctx.createRadialGradient(16, 16, 0, 16, 16, 16), q = rgb(c); g.addColorStop(0, `rgba(${q[0]},${q[1]},${q[2]},1)`); g.addColorStop(.6, `rgba(${q[0]},${q[1]},${q[2]},.55)`); g.addColorStop(1, `rgba(${q[0]},${q[1]},${q[2]},0)`); cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, 32, 32); return cv; })());
    return {
      draw(ctx, cam, t) {
        const R = refOf(G.level), base = R.horizon + (o.dy || 0) - (cam.y - R.ref) * (o.fy || .1);
        const off = -cam.x * o.fx;
        for (const c of cols) {
          let x0 = ((c.x + off) % o.w + o.w) % o.w; if (x0 > G.W + 80) x0 -= o.w; if (x0 < -80) continue;
          for (let k = 0; k < 9; k++) {
            const p = ((t * c.sp + c.ph + k / 9) % 1), y = base - p * c.h, s = 6 + p * 34;
            const x = x0 + Math.sin(p * 5 + c.ph * 9) * 4 + p * p * c.h * .35 * (o.wind || 1);
            ctx.globalAlpha = (o.a || .5) * Math.min(1, p * 6) * (1 - p);
            ctx.drawImage(sprite(p < .2 && o.hot ? o.hot : o.col), RD(x - s / 2), RD(y - s / 2), RD(s), RD(s));
          }
        }
        ctx.globalAlpha = 1;
      }
    };
  }
  // birds crossing the sky (pixel V's), a slow flock
  function birdsLayer(o) {
    const r = rngOf(o.seed || 9), list = [];
    for (let i = 0; i < o.n; i++) list.push({ x: r.range(0, 900), y: r.range(o.y[0], o.y[1]), sp: r.range(o.sp[0], o.sp[1]), ph: r.range(0, 6), circle: o.circle ? r.range(30, 70) : 0 });
    return {
      draw(ctx, cam, t) {
        ctx.fillStyle = o.col;
        for (const b of list) {
          let x, y;
          if (b.circle) { x = o.cx + Math.cos(t * b.sp * .02 + b.ph) * b.circle * 1.8 - cam.x * .05; y = b.y + Math.sin(t * b.sp * .02 + b.ph) * b.circle * .35; x = ((x % 600) + 600) % 600 - 60; }
          else { x = ((b.x + t * b.sp * 10 - cam.x * .08) % 900 + 900) % 900 - 200; y = b.y + Math.sin(t + b.ph) * 2; }
          const f = Math.sin(t * 8 + b.ph) > 0 ? 1 : 0, X = RD(x), Y = RD(y);
          if (o.big) { ctx.fillRect(X - 4, Y - f, 3, 1); ctx.fillRect(X + 2, Y - f, 3, 1); ctx.fillRect(X - 1, Y, 3, 1); ctx.fillRect(X - 6, Y - f * 2 + 1, 2, 1); ctx.fillRect(X + 5, Y - f * 2 + 1, 2, 1); }
          else { ctx.fillRect(X - 2, Y - f, 1, 1); ctx.fillRect(X - 1, Y, 1, 1); ctx.fillRect(X, Y + 1 - f, 1, 1); ctx.fillRect(X + 1, Y, 1, 1); ctx.fillRect(X + 2, Y - f, 1, 1); }
        }
      }
    };
  }
  // a strip of foreground silhouettes painted once
  function fgPaint(w, h, seed, fn) { const px = new Px(w, h, true); fn(px, rngOf(seed)); return px.canvas(); }
  function fgLayers(list) { // list: [{make, top, fx, fy, lift, drop, alpha}]
    const made = [];
    return function (ctx, cam, t) {
      for (let i = 0; i < list.length; i++) {
        if (!made[i]) made[i] = fgStrip(list[i].make(), list[i]);
        made[i](ctx, cam, t);
      }
    };
  }
  // hanging foreground cloth + lanterns along a rope at the top of the screen
  function fgRopes(px, r, o) {
    for (let i = 0; i < o.n; i++) {
      const x0 = i * px.w / o.n + r.int(0, 60), x1 = x0 + r.int(140, 220), y0 = r.int(0, 4);
      rope(px, x0, y0, x1, y0 + r.int(-3, 3), r.int(10, 18), P32(o.ink), pt => {
        for (let u = .12; u < .9; u += r.range(.13, .22)) {
          const [qx, qy] = pt(u), X = RD(qx), Y = RD(qy) + 1, kind = r.int(0, 2), col = r.pick(o.cloth);
          if (kind === 0) { for (let a = 0; a < 9; a++) for (let b = -3; b <= 3; b++) if (a < 3 || Math.abs(b) < 3) px.set(X + b, Y + a, P32(col)); }
          else if (kind === 1) { const ch = r.int(10, 18); for (let a = 0; a < ch; a++) for (let b = 0; b < 4; b++) px.set(X + b + (a > ch - 3 && b === 3 ? -1 : 0), Y + a, P32(col)); }
          else { px.line(X, Y, X, Y + 4, P32(o.ink)); for (let a = 0; a < 6; a++) for (let b = -2; b <= 2; b++) if (!(a === 0 && Math.abs(b) === 2) && !(a === 5 && Math.abs(b) === 2)) px.set(X + b, Y + 5 + a, P32(o.lamp || col)); if (o.lampCore) { px.set(X, Y + 7, P32(o.lampCore)); px.set(X, Y + 8, P32(o.lampCore)); } }
          px.set(X - 1, Y + 2, P32(o.rim));
        }
      });
    }
  }
  function fgPots(px, r, o) {
    for (let i = 0; i < o.n; i++) {
      const x = i * px.w / o.n + r.int(0, 140);
      for (let k = 0; k < r.int(1, 3); k++) {
        const s = r.int(10, 18), cx = x + k * 13;
        for (let y = 0; y < s; y++) { const hw = s * .42 * Math.sin(Math.min(1, y / s * 1.15 + .12) * PI); for (let xx = RD(cx - hw); xx <= cx + hw; xx++) px.set(xx, px.h - s + y, P32(xx === RD(cx - hw) && o.rim ? o.rim : o.ink)); }
      }
      if (o.grass) for (let g = 0; g < 14; g++) { const gx = x + r.int(-20, 50), gh = r.int(3, 9); for (let k = 0; k < gh; k++) px.set(gx + (k > gh / 2 ? 1 : 0), px.h - 1 - k, P32(o.ink)); }
    }
  }

  /* ---------------------------------------------------------------- 0. THE TAIL AT NIGHT (Night of Payment)
     indigo night, a low full moon over the Sleeper's long back; the upper city glows far away on its shoulders;
     the Tail's mud-brick houses climb in tiers with warm windows; tumar-lights of the tithe drift up toward the Ark. */
  {
    const SKY = [[0, '#04061a'], [.35, '#0c1238'], [.58, '#1e2658'], [.8, '#48407e'], [1, '#7c5a8a']];
    const far = { wall: '#1e2250', lit: '#323c74', dark: '#181c44', roof: '#1c204c', rim: '#6470b0', win: '#e8a860', winCore: '#ffd890', winDark: '#161a40' };
    const mid = { wall: '#1c2044', lit: '#323c70', dark: '#141734', roof: '#191d3c', rim: '#6a76b8', win: '#ffb860', winCore: '#ffe4a0', winDark: '#10122a', door: '#0c0e20' };
    const near = { wall: '#101226', lit: '#262c56', dark: '#0a0b1a', roof: '#0e1022', rim: '#4e5898', win: '#ffa850', winCore: '#ffe0a0', winDark: '#08091a' };
    place('yd_tail_night', {
      ambient: '#4c5a94', shade: '#262e5a', deepShade: '#0a0a1c', bloom: 1, wind: .35,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 31, stars: 420, starH: .62, milky: { x0: 0, y0: 20, dy: 70, w: 26, col: '#8a9ad8', a: 1.4 },
        moon: { x: 118, y: 84, r: 15, col: '#f6f0dc', dark: '#d0cab8', halo: '#9aa8e8', haloA: .55 },
        glow: [{ x: 118, y: 160, rx: 260, ry: 110, col: '#4a4888', a: .55 }, { x: 380, y: 270, rx: 300, ry: 90, col: '#7a4a7a', a: .4 }] }), twinkles(32, 40, .55)),
      layers(L, R, seed) {
        return memo('tn' + seed, () => {
          const out = [];
          const cl = new Px(1400, 90, true);
          for (let i = 0; i < 6; i++) cloud(cl, 120 + i * 230, 40 + (i % 3) * 12, 140 + (i * 37) % 80, 14 + (i % 2) * 8, { lo: '#1a1e48', mid: '#262c5e', hi: '#5a64a4' }, seed + i);
          out.push(layer(cl.canvas(), { fx: .02, fy: .02, base: 110, drift: 1.6 }));
          // the Sleeper: a long hazy body-ridge; the Ark's palaces on its shoulders
          const sl = new Px(1600, 110, true);
          ridge(sl, { seed: seed + 2, base: 108, amp: 48, per: 3, oct: 4, col: '#262660', grad: '#202258', gradH: 60, rim: '#8a94d8', shape: (u, v) => .2 + v * .45 + .45 * Math.pow(Math.max(0, Math.sin(u * PI * 2 + .6)), 3) });
          const dp = { lo: '#2a3878', mid: '#3a5a9a', hi: '#5a8ac8', rim: '#8ab8f0', drum: '#363a74', drumD: '#2c2e62', gold: '#e8c070', win: '#ffd890' };
          for (let i = 0; i < 4; i++) {
            const cx = 180 + i * 400 + (seed % 60); let y = 0; while (y < 110 && !sl.has(cx, y)) y++;
            for (let k = -22; k <= 22; k += 8) { let yy = 0; while (yy < 110 && !sl.has(cx + k, yy)) yy++; house(sl, cx + k - 4, yy + 3, 9, 8 + (k & 3), far, rngOf(i * 9 + k), { wp: .9, lit: .7, ww: 1, wh: 1, wsx: 3, wsy: 3, beams: false, tex: false }); }
            dome(sl, cx, y - 4, 6, dp, { kind: i % 2 ? 'onion' : 'melon', drum: 3, ribs: 8 });
            minaret(sl, cx + 24, y + 4, 30, 4, 3, { lo: '#2a2e64', mid: '#363a74', hi: '#4a5490', band: '#3a5a9a', win: '#ffd890', gold: '#e8c070' }, { lit: true, lantern: 3, bands: 6 });
          }
          ridge(sl, { seed: seed + 9, base: 110, amp: 0, per: 1, col: '#202258', lights: 90, lightsDepth: 18, lightCols: ['#d8a060', '#ffcf7a', '#8ab0ff'] });
          out.push(layer(sl.canvas(), { fx: .05, fy: .04, base: R.horizon - 20 }));
          out.push(smokeLayer({ n: 4, w: 900, fx: .1, fy: .08, h: [50, 90], col: '#3a3a6a', a: .28, dy: -10, seed: seed + 1 }));
          // far Tail tiers, blue haze, minarets
          const t3 = tailBand(seed + 3, { w: 1300, h: 120, pal: far, hw: [8, 18], hh: [10, 30], slope: 36, waves: 3, jit: 6, wp: .45, lit: .45, ww: 1, wh: 2, wsx: 4, wsy: 5, gap: .3, floorFill: 40, extra: roofClutter(far, { line: .12 }) });
          for (let i = 0; i < 3; i++) minaret(t3, 260 + i * 470, 120 - 26, 56, 7, 5, { lo: '#242a58', mid: '#2e3668', hi: '#46508c', band: '#3a5a9a', win: '#ffcf7a', winCore: '#fff0b0', gold: '#c8a060' }, { lit: true, bands: 9, brick: true });
          out.push(layer(t3.canvas(), { fx: .14, fy: .1, base: R.horizon + 4, fill: far.dark }));
          // mid Tail houses with pavilions, laundry and warm windows
          const t4 = tailBand(seed + 4, { w: 1100, h: 130, pal: mid, hw: [12, 26], hh: [18, 42], slope: 30, waves: 2, jit: 8, wp: .5, lit: .5, ww: 2, wh: 3, wsx: 6, wsy: 8, door: true, gap: .25, floorFill: 40, extra: roofClutter(mid, { line: .3, pav: .25, pavLit: true, clothDark: .45 }) });
          for (let i = 0; i < 4; i++) { const tx = 120 + i * 280 + (seed * 7 % 50); tree(t4, tx, 130 - 4, 50, i % 2 ? 'poplar' : 'chinar', { lo: '#0e1428', mid: '#18213e', hi: '#2c3e68', rim: '#4a5a90', trunk: '#141a30', trunkHi: '#2a3458', bark: '#3a4470' }, seed + 40 + i); }
          out.push(layer(t4.canvas(), { fx: .3, fy: .22, base: R.horizon + 18, fill: mid.dark }));
          // near roofs, almost black, with lantern strings tied to poles
          const t5 = tailBand(seed + 5, { w: 900, h: 130, pal: near, hw: [20, 40], hh: [34, 62], slope: 16, waves: 1, jit: 6, wp: .45, lit: .55, ww: 3, wh: 4, wsx: 8, wsy: 10, lattice: true, floorFill: 40, extra: roofClutter(near, { line: .3, jar: .4, clothDark: .6 }) });
          const glows = [];
          for (let i = 0; i < 4; i++) {
            const x0 = i * 225 + 30, x1 = x0 + 160, y0 = 20 + (i % 2) * 6;
            t5.rect(x0, y0, 1, 130 - y0, P32('#06060e')); t5.rect(x1, y0 + 3, 1, 130 - y0, P32('#06060e'));
            rope(t5, x0, y0, x1, y0 + 3, 16, P32('#06060e'), pt => { for (let u = .08; u < .95; u += .1) { const [qx, qy] = pt(u), c = ['#ffcf6a', '#ff7a4a', '#ffe9a8', '#7ae0ff'][FL(u * 10) % 4]; t5.rect(RD(qx), RD(qy) + 1, 2, 2, P32(c)); glows.push([RD(qx) + 1, RD(qy) + 2, c, 6, .55]); } });
          }
          out.push(layer(t5.canvas(), { fx: .5, fy: .38, base: R.horizon + 40, fill: near.dark, glows }));
          return out;
        });
      },
      fogBehind: hazeDraw([[0, '#1a1e48', 0], [.5, '#2a2e64', .04], [.74, '#4a4482', .2], [1, '#1a1838', .38]]),
      drawForeground: fgLayers([
        { top: true, fx: 1.35, fy: .3, lift: 1, make: () => fgPaint(1500, 40, 77, (px, r) => fgRopes(px, r, { n: 3, ink: '#05050c', cloth: ['#14142a', '#1a1630', '#101826'], rim: '#2a3060', lamp: '#2a1c14', lampCore: '#ffb860' })) },
        { fx: 1.6, fy: .5, drop: 6, make: () => fgPaint(1700, 30, 78, (px, r) => fgPots(px, r, { n: 4, ink: '#05050c', rim: '#1e2448', grass: true })) }
      ]),
      post: all(shafts([{ x: 90, w: 46, slope: .55, col: '#8a9ae8', a: .3 }, { x: 260, w: 26, slope: .55, col: '#8a9ae8', a: .2 }, { x: 520, w: 60, slope: .55, col: '#7a88d8', a: .18 }]), grade('#2a3a9a', .2), vignette('rgba(2,2,14,1)', .55)),
      ambientFx: all(
        emit({ rate: .05, cols: ['#d8ff7a', '#ffe680', '#b8ff9a'], vx: [-.2, .2], vy: [-.15, .05], from: 'any', band: [.35, 1], life: 260, glow: true, glowR: 6, alpha: 1, wander: .03, flicker: true, max: 40 }),
        emit({ rate: .04, cols: ['#8ae0ff', '#c0f0ff', '#ffe0a0'], vx: [-.05, .1], vy: [-.35, -.18], from: 'bottom', life: 520, glow: true, glowR: 7, alpha: .9, sway: .004, max: 26 }),
        emit({ rate: .03, cols: ['#3a3a5a', '#5a5a7a'], vx: [.1, .3], vy: [.05, .2], life: 400, alpha: .6, max: 30 })
      ),
      filterDecos: (d, L) => !isBaseTree(d, L),
      decorate(L, r) { tailProps(L, r, 'night'); }
    });
  }

  /* ---------------------------------------------------------------- 3. THE TAIL, MORNING AFTER
     ash-rose dawn through smoke; tilted, half-collapsed houses; smoke columns; crows; embers in the rubble. */
  {
    const SKY = [[0, '#3a3040'], [.3, '#6a5262'], [.58, '#a87a78'], [.8, '#d8a68e'], [1, '#ecc4a4']];
    const far = { wall: '#8a7276', lit: '#a68a88', dark: '#7a6268', roof: '#806a6e', rim: '#c8a49a', win: '#5a4448', winCore: '#6a5054', winDark: '#6a5458' };
    const mid = { wall: '#5e4a4e', lit: '#86686a', dark: '#4a3a3e', roof: '#54424a', rim: '#d8a890', win: '#3a2a2e', winCore: '#3a2a2e', winDark: '#2e2226', door: '#241a1e' };
    const near = { wall: '#2e2428', lit: '#4e3c3e', dark: '#221a1e', roof: '#2a2024', rim: '#c89070', win: '#ff8a3a', winCore: '#ffc070', winDark: '#1a1416' };
    // crack a band: bite collapsed corners out of roofs and tilt some houses
    function ruin(px, seed) {
      const r = rngOf(seed);
      for (let i = 0; i < px.w / 40; i++) {
        const cx = r.int(0, px.w), w = r.int(6, 18), d = r.int(4, 14);
        let top = 0; while (top < px.h && !px.has(cx, top)) top++;
        for (let k = 0; k < w; k++) for (let y = top - 2; y < top + d * (1 - Math.abs(k - w / 2) / (w / 2)) * (.6 + .4 * hash(cx + k, 1, seed)); y++) px.set(cx - w / 2 + k, y, 0);
      }
    }
    place('yd_tail_dawn', {
      ambient: '#c4b4b0', shade: '#76666c', deepShade: '#1e1618', bloom: .55, wind: .6,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 41, sun: { x: 336, y: 150, r: 12, core: '#fff2e2', rim: '#ffd8b8', halo: '#f0a888', haloA: .55 },
        glow: [{ x: 336, y: 170, rx: 300, ry: 120, col: '#f0b090', a: .5 }] })),
      layers(L, R, seed) {
        return memo('td' + seed, () => {
          const out = [];
          const cl = new Px(1400, 110, true);
          for (let i = 0; i < 7; i++) cloud(cl, 100 + i * 200, 30 + (i % 3) * 22, 160 + (i * 41) % 90, 12 + (i % 2) * 8, { lo: '#5a4650', mid: '#7a6068', hi: '#c8968c' }, seed + i);
          out.push(layer(cl.canvas(), { fx: .02, fy: .02, base: 120, drift: 2.4 }));
          const sl = new Px(1600, 100, true);
          ridge(sl, { seed: seed + 2, base: 98, amp: 42, per: 3, oct: 4, col: '#6a4c58', grad: '#5e4450', rim: '#f0c8b0', shape: (u, v) => .2 + v * .5 + .4 * Math.pow(Math.max(0, Math.sin(u * PI * 2 + 1.6)), 3) });
          out.push(layer(sl.canvas(), { fx: .05, fy: .04, base: R.horizon - 22 }));
          out.push(smokeLayer({ n: 6, w: 1000, fx: .12, fy: .08, h: [100, 170], col: '#3a2e32', hot: '#5a3a2e', a: .62, dy: -6, seed: seed + 3, wind: 1.4 }));
          const t3 = tailBand(seed + 3, { w: 1300, h: 120, pal: far, hw: [8, 18], hh: [10, 28], slope: 34, waves: 3, jit: 6, wp: .5, lit: 0, ww: 1, wh: 2, wsx: 4, wsy: 5, gap: .3, floorFill: 40, extra: roofClutter(far, { line: .05 }) });
          minaret(t3, 300, 120 - 24, 50, 7, 5, { lo: '#7a6268', mid: '#8a7276', hi: '#a88a88', band: '#6a7a8a' }, { bands: 9, brick: true });
          ruin(t3, seed + 4);
          out.push(layer(t3.canvas(), { fx: .14, fy: .1, base: R.horizon + 4, fill: far.dark }));
          const t4 = tailBand(seed + 4, { w: 1100, h: 130, pal: mid, hw: [12, 26], hh: [16, 40], slope: 28, waves: 2, jit: 8, wp: .5, lit: 0, ww: 2, wh: 3, wsx: 6, wsy: 8, door: true, gap: .3, floorFill: 40, extra: roofClutter(mid, { line: .06, pav: .15 }) });
          ruin(t4, seed + 5);
          for (let i = 0; i < 4; i++) tree(t4, 140 + i * 270, 128, 52, 'dead', { trunk: '#3a2c2e', trunkHi: '#5a4648' }, seed + 50 + i);
          out.push(layer(t4.canvas(), { fx: .3, fy: .22, base: R.horizon + 18, fill: mid.dark }));
          const t5 = tailBand(seed + 6, { w: 900, h: 120, pal: near, hw: [18, 36], hh: [30, 56], slope: 14, waves: 1, jit: 6, wp: .25, lit: .25, ww: 2, wh: 3, wsx: 8, wsy: 9, floorFill: 40, extra: roofClutter(near, { line: .1 }) });
          ruin(t5, seed + 7);
          // fallen beams leaning on the ruins
          const rr = rngOf(seed + 8); for (let i = 0; i < 6; i++) { const x = rr.int(0, 900), l = rr.int(16, 30); t5.line(x, 119, x + l, 119 - rr.int(10, 22), P32('#1a1214')); t5.line(x + 1, 119, x + l + 1, 119 - rr.int(10, 22), P32('#3a2a26')); }
          out.push(layer(t5.canvas(), { fx: .5, fy: .38, base: R.horizon + 40, fill: near.dark }));
          out.push(birdsLayer({ n: 7, col: '#2a2024', y: [40, 110], sp: [1.2, 2.2], seed: seed }));
          return out;
        });
      },
      fogBehind: hazeDraw([[0, '#c8a0a0', 0], [.5, '#b89090', .08], [.74, '#c8a49c', .32], [1, '#6a5458', .4]]),
      drawForeground: fgLayers([
        { fx: 1.6, fy: .5, drop: 6, make: () => fgPaint(1700, 34, 88, (px, r) => { fgPots(px, r, { n: 3, ink: '#140e10', rim: '#5a3a30' }); for (let i = 0; i < 4; i++) { const x = r.int(0, 1700), l = r.int(30, 50); for (let q = 0; q < 3; q++) px.line(x, 33 - q, x + l, 33 - r.int(14, 26) - q, P32('#140e10')); } }) },
        { top: true, fx: 1.25, fy: .2, lift: 0, alpha: .35, make: () => fgPaint(1200, 60, 89, (px, r) => { for (let i = 0; i < 5; i++) cloud(px, r.int(0, 1200), r.int(5, 25), r.int(120, 200), r.int(12, 22), { lo: '#3a2e32', mid: '#4a3c40', hi: '#5a4a4c' }, i + 5, { soft: 1.6 }); }) }
      ]),
      post: all(shafts([{ x: 420, w: 54, slope: -.5, col: '#ffc8a0', a: .34 }, { x: 560, w: 30, slope: -.5, col: '#ffd0a8', a: .26 }, { x: 150, w: 70, slope: -.5, col: '#f8b890', a: .2 }]), grade('#5a4e58', .28), grade('#ffb090', .08, 'overlay'), vignette('rgba(20,12,14,1)', .5)),
      ambientFx: all(
        emit({ rate: .3, cols: ['#3a3434', '#5a5252', '#8a8080', '#c8c0b8'], vx: [.1, .5], vy: [.15, .45], life: 420, sway: .01, alpha: .8, max: 120 }),
        emit({ rate: .07, cols: ['#ff9a4a', '#ffc070', '#ff6a2a'], vx: [-.1, .3], vy: [-.5, -.2], from: 'bottom', life: 220, glow: true, glowR: 4, alpha: 1, wander: .02, flicker: true, max: 30 })
      ),
      filterDecos: (d, L) => !isBaseTree(d, L),
      decorate(L, r) { tailProps(L, r, 'ruin'); }
    });
  }

  /* ---------------------------------------------------------------- 4. THE RABAT AND THE SALT ROAD
     white heat: salt flats with a mirage, blue mountains, the caravanserai wall with portal and domes, a camel caravan. */
  {
    const SKY = [[0, '#4a7ab0'], [.35, '#86aed0'], [.7, '#d0dde4'], [.9, '#f2eee4'], [1, '#fffaf0']];
    const rab = { mid: '#d8c8b0', hi: '#f4ead8', lo: '#a89480', tile: '#2a8aa0', tile2: '#e8e0cc', recess: '#7a6654', recessHi: '#9a8470', win: '#3a2c22', gold: '#d8a850' };
    const rabH = { wall: '#d4c4aa', lit: '#d4c4aa', dark: '#a8947c', roof: '#c8b498', rim: '#fff4e0', win: '#4a3a2e', winCore: '#5a4838', winDark: '#6a5848' };
    const dpal = { lo: '#1a6a80', mid: '#2a96aa', hi: '#7ad0d8', rim: '#c8f4f0', drum: '#d8c8b0', drumD: '#a89480', gold: '#d8a850', win: '#4a3a2e' };
    place('yd_salt', {
      ambient: '#fff4ea', shade: '#c4b8b0', bloom: .7, wind: 1,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 51, sun: { x: 360, y: 40, r: 11, core: '#ffffff', rim: '#fffbe8', halo: '#fff4d0', haloA: .7 }, glow: [{ x: 240, y: 270, rx: 520, ry: 120, col: '#fff8ec', a: .7 }] }),
        (() => { let cv = null; return (ctx, cam, t) => { if (!cv) { const px = new Px(1200, 60, true), r = rngOf(52); for (let i = 0; i < 14; i++) { const x = r.int(0, 1200), y = r.int(4, 56), l = r.int(40, 140); for (let k = 0; k < l; k++) if (hash(x + k, y, 3) < .8) px.blend(x + k, y + RD(Math.sin(k * .05) * 2), '#ffffff', .45 * Math.sin(k / l * PI)); } cv = px.canvas(); } const x = ((-cam.x * .01 - t * 1.2) % 1200 + 1200) % 1200 - 1200; ctx.globalAlpha = .9; for (let xx = x; xx < G.W; xx += 1200) ctx.drawImage(cv, RD(xx), 20); ctx.globalAlpha = 1; }; })()),
      layers(L, R, seed) {
        return memo('sa' + seed, () => {
          const out = [];
          const mt = new Px(1600, 110, true);
          ridge(mt, { seed: seed + 1, base: 108, amp: 84, per: 5, oct: 5, col: '#6a84aa', grad: '#9aaec8', gradH: 60, rim: '#ffffff', snow: { col: '#f4f6fa', col2: '#b8c6dc', depth: 18 } });
          out.push(layer(mt.canvas(), { fx: .03, fy: .03, base: R.horizon - 26 }));
          // salt flat with mirage: a bright band that reflects the mountains, shimmering
          const sf = new Px(800, 26, true);
          for (let y = 0; y < 26; y++) for (let x = 0; x < 800; x++) sf.set(x, y, P32(y < 3 ? '#c8d0dc' : n2(x * .05, y * .6, 9) > .6 ? '#ffffff' : (y + x) % 7 === 0 ? '#e8e8ea' : '#f4f2ee'));
          const sfc = sf.canvas();
          out.push({ draw(ctx, cam, t) { const R = refOf(G.level), base = R.horizon - 28 - (cam.y - R.ref) * .05; let x = ((-cam.x * .06) % 800 + 800) % 800 - 800; for (; x < G.W; x += 800) for (let y = 0; y < 26; y += 2) ctx.drawImage(sfc, 0, y, 800, 2, RD(x + Math.sin(t * 2 + y * .7) * (y < 8 ? 2 : 1)), RD(base + y), 800, 2); } });
          // caravanserai (rabat): long wall, bastions, portal and domes
          const rb = new Px(1500, 110, true), r = rngOf(seed + 3);
          for (let i = 0; i < 2; i++) {
            const x0 = 80 + i * 750;
            fortWall(rb, x0, x0 + 420, 108, 30, { lo: '#a89480', mid: '#d0c0a6', hi: '#f0e4d0', win: '#3a2c22' }, { lx: 1, step: 140, br: 10, courses: true });
            dome(rb, x0 + 150, 76, 16, dpal, { kind: 'melon', ribs: 12, lx: 1, drumWin: '#4a3a2e', tiles: true });
            dome(rb, x0 + 300, 78, 11, dpal, { kind: 'bowl', lx: 1, drum: 3 });
            portal(rb, x0 + 190, 108, 46, 56, rab, { lx: 1, guld: true });
            for (let k = 0; k < 3; k++) tree(rb, x0 + 470 + k * 26, 108, r.int(36, 50), 'poplar', { lo: '#6a7a5a', mid: '#8a9a6a', hi: '#b8c08a', trunk: '#8a7a64' }, seed + k + i * 5, { lx: 1 });
            minaret(rb, x0 + 560, 108, 70, 10, 7, { lo: '#a89480', mid: '#d0c0a6', hi: '#f0e4d0', band: '#2a8aa0', bandHi: '#7ad0d8', win: '#3a2c22', gold: '#d8a850' }, { lx: 1, bands: 10, brick: true });
          }
          out.push(layer(rb.canvas(), { fx: .16, fy: .1, base: R.horizon + 2, fill: '#c8b8a0' }));
          // the caravan walking along the salt road
          const cam1 = new Px(16, 11), camCv = (sprite(cam1, 'camel', 0, 0, '#6a5444'), cam1.canvas()), walk = new Px(5, 8); sprite(walk, 'walker', 0, 0, '#4a3c34'); const walkCv = walk.canvas();
          out.push({ draw(ctx, cam, t) { const R = refOf(G.level), base = R.horizon + 6 - (cam.y - R.ref) * .12; for (let i = 0; i < 9; i++) { const X = ((i * 22 + t * 4 - cam.x * .2) % 1500 + 1500) % 1500 - 200; if (X < -20 || X > G.W + 20) continue; const bob = RD(Math.sin(t * 3 + i) * .6); if (i % 4 === 0) ctx.drawImage(walkCv, RD(X + 18), RD(base - 8)); else ctx.drawImage(camCv, RD(X), RD(base - 11 + bob)); } } });
          // near: saxaul scrub and salt mounds
          const nr = new Px(1000, 60, true);
          for (let i = 0; i < 9; i++) { const x = i * 110 + r.int(0, 60); for (let k = 0; k < 40; k++) { const hw = 30 * Math.sin(k / 40 * PI); for (let y = 0; y < hw * .35; y++) nr.set(x + k, 59 - y, P32(y > hw * .3 ? '#ffffff' : hash(x + k, y, 3) < .3 ? '#d8d4cc' : '#ece8e0')); } }
          for (let i = 0; i < 10; i++) tree(nr, r.int(0, 1000), 59, r.int(24, 38), 'saxaul', { trunk: '#5a4a3a', trunkHi: '#8a7a64', mid: '#7a8a5a', lo: '#5a6a44' }, seed + 20 + i);
          out.push(layer(nr.canvas(), { fx: .4, fy: .3, base: R.horizon + 30, fill: '#e8e4dc' }));
          return out;
        });
      },
      fogBehind: hazeDraw([[0, '#ffffff', 0], [.55, '#fffaf0', .06], [.74, '#fff6ea', .28], [1, '#e8e0d4', .2]]),
      drawForeground: fgLayers([{ fx: 1.6, fy: .5, drop: 4, make: () => fgPaint(1800, 40, 98, (px, r) => { for (let i = 0; i < 5; i++) tree(px, r.int(0, 1800), 40, r.int(30, 44), 'saxaul', { trunk: '#2a2018', trunkHi: '#4a3a2a', mid: '#3a3a24', lo: '#2a2a1a' }, 300 + i); }) }]),
      post: all(grade('#fff0d8', .22), grade('#ffffff', .05, 'screen'), vignette('rgba(60,40,20,1)', .28)),
      ambientFx: all(
        emit({ rate: .35, cols: ['#ffffff', '#f4f0e8', '#e0e4ec'], vx: [.6, 1.4], vy: [-.05, .12], from: 'left', life: 360, alpha: .7, max: 120 }),
        emit({ rate: .06, cols: ['#ffffff'], vx: [-.05, .05], vy: [-.02, .02], from: 'any', band: [.55, 1], life: 90, glow: true, glowR: 3, alpha: 1, flicker: true, max: 20 }),
        emit({ rate: .03, cols: ['#e8dcc8'], vx: [1.6, 2.6], vy: [0, .05], from: 'left', band: [.5, .95], life: 260, shape: 'rect', w: 6, h: 1, alpha: .35, max: 14 })
      ),
      decorate(L, r) { saltProps(L, r); }
    });
  }
  function saltProps(L, r) {
    const busy = busyXs(L);
    for (const run of runs(L, 4, 4)) for (let tx = run.x0; tx <= run.x1; tx++) {
      const x = tx * TS + 8; if (!free(busy, x, 26)) continue;
      const q = r();
      if (q < .05) { // salt blocks stacked
        const cv = prop('salt' + (tx % 3), 24, 14, px => { const rr = rngOf(tx % 3); for (let k = 0; k < 5; k++) { const bx = rr.int(0, 16), by = k < 3 ? 8 : 2, w = 8, h = 6; px.rect(bx, by, w, h, P32('#f0ece4')); px.rect(bx, by, w, 1, P32('#ffffff')); px.rect(bx + w - 1, by, 1, h, P32('#c8c0b4')); px.rect(bx, by + h - 1, w, 1, P32('#a8a094')); } });
        addStatic(L, cv, x - 12, run.y - 14); tx += 3;
      } else if (q < .08) { // bales and sacks
        const cv = prop('bales' + (tx % 3), 26, 14, px => { const rr = rngOf(tx % 3 + 9); for (let k = 0; k < 3; k++) { const bx = k * 8, h = rr.int(8, 12), c = rr.pick(['#a87a4a', '#8a6a4a', '#c8a070', '#6a4a8a']); for (let y = 0; y < h; y++) for (let xx = 0; xx < 9; xx++) px.set(bx + xx, 14 - h + y, P32(xx === 0 ? shade(c, .2) : xx > 6 ? shade(c, -.25) : c)); px.rect(bx + 1, 14 - h + 3, 7, 1, P32('#3a2a1a')); } });
        addStatic(L, cv, x - 13, run.y - 14); tx += 3;
      } else if (q < .095 && run.x1 - tx > 3) { // a resting camel
        const cv = prop('camelLie', 30, 12, px => { sprite(px, 'camelLie', 0, 0, '#8a6a4a', 2); for (let y = 0; y < 12; y++) for (let xx = 0; xx < 30; xx++) if (px.has(xx, y) && !px.has(xx, y - 1)) px.set(xx, y, P32('#b8946a')); px.set(4, 3, P32('#2a1a10')); px.rect(10, 4, 10, 2, P32('#a8323a')); px.rect(10, 6, 10, 1, P32('#e8c070')); });
        addStatic(L, cv, x - 15, run.y - 12); tx += 4;
      } else if (q < .11) { // a post with a tattered flag
        L.decos.push({ static: true, layer: 'back', bx: x, by: run.y - 40, bw: 2, bh: 40, draw(ctx) { ctx.fillStyle = '#5a4430'; ctx.fillRect(x, run.y - 40, 2, 40); ctx.fillStyle = '#8a6a48'; ctx.fillRect(x, run.y - 40, 1, 40); } });
        L.decos.push(cloth(x + 2, run.y - 39, 10, 6, ['#2a8aa0', '#e8e0cc', '#2a8aa0'], { stripe: 1 })); tx += 4;
      } else if (q < .125) { const cv = jarCv(r.int(0, 3), { lo: '#8a6a50', mid: '#b8946a', hi: '#d8b88a', rim: '#f0d8b0', dark: '#5a4430' }); addStatic(L, cv, x, run.y - cv.height + 1); tx += 1; }
    }
  }

  /* ---------------------------------------------------------------- 7. THE MEMORY BAZAAR (night)
     violet night lit from below by the market; toki trading domes, the great minaret, striped awnings, lantern strings. */
  {
    const SKY = [[0, '#06041a'], [.35, '#160c34'], [.62, '#34164a'], [.84, '#6a2450'], [1, '#a03a4a']];
    const farP = { wall: '#3a1e4a', lit: '#52306a', dark: '#2e1840', roof: '#36204a', rim: '#9a5a9a', win: '#ff9a50', winCore: '#ffd890', winDark: '#2a1438' };
    const dp = { lo: '#1a3a6a', mid: '#2a5a8a', hi: '#4a8aba', rim: '#9ad0f0', drum: '#3a2050', drumD: '#2e1840', gold: '#ffc860', win: '#ffb860' };
    const mp = { lo: '#2e1840', mid: '#40265a', hi: '#5a3a74', band: '#2a5a8a', bandHi: '#4a8aba', win: '#ffb860', winCore: '#fff0b0', gold: '#ffc860' };
    const pp = { mid: '#3e2456', hi: '#5a3a74', lo: '#2a1438', tile: '#2a5a8a', tile2: '#1a3a6a', recess: '#1e0e2a', recessHi: '#2e1840', win: '#ffb060', gold: '#ffc860' };
    const midP = { wall: '#24122e', lit: '#3a2048', dark: '#1a0c22', roof: '#200f28', rim: '#b86a8a', win: '#ffb060', winCore: '#ffe4a0', winDark: '#14081a', door: '#100614' };
    place('yd_bazaar_night', {
      ambient: '#6a5c9c', shade: '#382e60', deepShade: '#0c0818', bloom: 1, wind: .3,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 71, stars: 260, starH: .5, moon: { x: 70, y: 36, r: 8, col: '#fff0e0', halo: '#c890d0', haloA: .4, phase: .55 }, glow: [{ x: 240, y: 290, rx: 420, ry: 140, col: '#ff7a50', a: .45 }] }), twinkles(72, 30, .45)),
      layers(L, R, seed) {
        return memo('bz' + seed, () => {
          const out = [];
          out.push(smokeLayer({ n: 5, w: 1000, fx: .06, fy: .04, h: [70, 120], col: '#5a2a5a', hot: '#a04a50', a: .3, dy: -24, seed: seed + 2 }));
          const c1 = cityBand(seed + 1, { w: 1500, h: 150, pal: farP, dpal: dp, mpal: mp, ppal: pp, kinds: ['minaret', 'dome', 'portal', 'dome'], n: 5, dr: [14, 22], mh: [90, 120], mw: 12, ml: 8, pw: [38, 54], hw: [10, 22], hh: [12, 26], lit: .5, wp: .5 });
          out.push(layer(c1.canvas(), { fx: .08, fy: .06, base: R.horizon - 8, fill: farP.dark }));
          // toki: clusters of small domes on the trading halls, lit arches beneath
          const tk = new Px(1200, 100, true), r = rngOf(seed + 5);
          for (let i = 0; i < 5; i++) {
            const x0 = i * 240 + r.int(0, 60), w = r.int(110, 160);
            house(tk, x0, 100, w, 30, midP, r, { wp: 0, beams: false });
            for (let a = x0 + 6; a < x0 + w - 8; a += 12) { for (let k = 0; k < 9; k++) for (let b = 0; b < 6; b++) if (!(k < 2 && (b === 0 || b === 5))) tk.set(a + b, 100 - 12 + k - 6, P32(k > 4 ? '#ffb060' : '#ff8a3a')); }
            dome(tk, x0 + w / 2, 70, 16, { lo: '#2a1438', mid: '#3e2456', hi: '#6a3a7a', rim: '#d88aa8', drum: '#2e1840', drumD: '#24122e', gold: '#ffc860' }, { kind: 'bowl', drum: 4, drumWin: '#ffb060' });
            for (const dx of [-36, 36]) dome(tk, x0 + w / 2 + dx, 70, 8, { lo: '#2a1438', mid: '#3e2456', hi: '#6a3a7a', rim: '#d88aa8', drum: '#2e1840', drumD: '#24122e' }, { kind: 'bowl', drum: 2 });
          }
          out.push(layer(tk.canvas(), { fx: .2, fy: .14, base: R.horizon + 8, fill: midP.dark }));
          // market rooftops with striped awnings and strings of lanterns
          const mk = tailBand(seed + 6, { w: 1000, h: 130, pal: { wall: '#180a1e', lit: '#2c163a', dark: '#120816', roof: '#160a1c', rim: '#c87a8a', win: '#ffa850', winCore: '#ffe0a0', winDark: '#0e0612' }, hw: [16, 34], hh: [30, 56], slope: 10, waves: 1, jit: 4, wp: .5, lit: .6, ww: 3, wh: 3, wsx: 7, wsy: 8, lattice: true, floorFill: 40,
            extra(px, x, by, hw, hh, top, rr) { if (rr.chance(.55)) { const cols = rr.pick([['#a8283a', '#e8d0a0'], ['#2a5aa0', '#e8d0a0'], ['#c87a2a', '#3a1a2a'], ['#3a8a6a', '#e8d0a0']]); for (let k = 0; k < 6; k++) for (let b = -2; b < hw + 2; b++) px.set(x + b, top + 4 + k + (b < 0 ? 0 : RD(k * .3)), P32(mix(cols[((b + 40) >> 2) & 1], '#120816', .35 + k * .05))); for (let b = -2; b < hw + 2; b += 2) px.set(x + b, top + 10, P32(mix(cols[0], '#120816', .4))); } } });
          const glows = [];
          for (let i = 0; i < 5; i++) { const x0 = i * 200 + 20, x1 = x0 + 170, y0 = 18 + (i % 2) * 8; rope(mk, x0, y0, x1, y0 + 2, 18, P32('#08040c'), pt => { for (let u = .06; u < .96; u += .085) { const [qx, qy] = pt(u), c = ['#ff5a3a', '#ffc040', '#ff8ad0', '#6ad0ff', '#ffe9a8'][FL(u * 12 + i) % 5]; mk.rect(RD(qx) - 1, RD(qy) + 1, 3, 3, P32(c)); mk.set(RD(qx), RD(qy) + 2, P32('#ffffff')); glows.push([RD(qx), RD(qy) + 2, c, 7, .6]); } }); }
          out.push(layer(mk.canvas(), { fx: .42, fy: .32, base: R.horizon + 34, fill: '#120816', glows }));
          return out;
        });
      },
      fogBehind: hazeDraw([[0, '#2a1440', 0], [.5, '#5a2450', .06], [.75, '#a04a5a', .22], [1, '#2a0e2a', .35]]),
      drawForeground: fgLayers([
        { top: true, fx: 1.35, fy: .3, make: () => fgPaint(1500, 44, 171, (px, r) => fgRopes(px, r, { n: 4, ink: '#06020a', cloth: ['#1a0a1e', '#220c22', '#160a1a'], rim: '#5a2a4a', lamp: '#3a1a10', lampCore: '#ffb050' })) },
        { fx: 1.6, fy: .5, drop: 6, make: () => fgPaint(1700, 30, 172, (px, r) => fgPots(px, r, { n: 5, ink: '#06020a', rim: '#3a1a3a' })) }
      ]),
      post: all(grade('#3a2a8a', .2), grade('#ff7a50', .08, 'overlay'), vignette('rgba(8,2,14,1)', .5)),
      ambientFx: all(
        emit({ rate: .07, cols: ['#ffd08a', '#ffb060', '#ff8a5a'], vx: [-.1, .1], vy: [-.25, -.05], from: 'any', glow: true, glowR: 5, life: 240, alpha: .9, sway: .02, flicker: true, max: 40 }),
        emit({ rate: .04, cols: ['#8a6a9a', '#6a4a7a'], vx: [-.05, .1], vy: [-.3, -.15], from: 'bottom', life: 300, size: 2, size1: 7, shape: 'circle', alpha: .18, max: 20 })
      ),
      decorate(L, r) { bazaarProps(L, r); }
    });
  }
  function stallCv(v) {
    const cols = [['#a8283a', '#e8d0a0'], ['#2a5aa0', '#e8d0a0'], ['#c87a2a', '#3a1a2a'], ['#3a8a6a', '#e8d0a0']][v % 4];
    return prop('stall' + v, 44, 40, px => {
      for (const sx of [2, 40]) for (let y = 6; y < 40; y++) { px.set(sx, y, P32('#3a2414')); px.set(sx + 1, y, P32('#5a3a20')); }
      for (let k = 0; k < 8; k++) for (let x = 0; x < 44; x++) px.set(x, 2 + k + RD((x / 44) * 2), P32(shade(cols[(x >> 2) & 1], -k * .04)));
      for (let x = 0; x < 44; x += 4) { px.set(x + 1, 11, P32(cols[0])); px.set(x + 2, 11, P32(cols[0])); px.set(x + 2, 12, P32(cols[0])); }
      px.rect(4, 28, 36, 2, P32('#7a4a28')); px.rect(4, 30, 36, 10, P32('#4a2a18')); px.rect(4, 30, 36, 1, P32('#9a6a3a'));
      const r = rngOf(v + 3);
      for (let i = 0; i < 9; i++) { const gx = 6 + i * 4, kind = (v + i) % 3, c = kind === 0 ? r.pick(['#d8a020', '#c84a2a', '#8ab040']) : kind === 1 ? r.pick(['#c82a3a', '#e8c070']) : r.pick(['#d86a2a', '#e8b030', '#a83a1a']); if (kind === 2) { for (let k = 0; k < 4; k++) for (let b = -k; b <= k; b++) px.set(gx + 1 + b, 24 + k, P32(b < 0 ? shade(c, .2) : c)); } else { px.disc(gx + 1.5, 26, 2, P32(c)); px.set(gx + 1, 25, P32(shade(c, .5))); } }
      if (v % 2) for (let k = 0; k < 3; k++) { const cx = 10 + k * 10; for (let y = 13; y < 21; y++) px.set(cx, y, P32('#3a2414')); px.rect(cx - 2, 21, 5, 4, P32(['#c86a2a', '#7a8a2a', '#a8323a'][k])); }
    });
  }
  function bazaarProps(L, r) {
    const busy = busyXs(L);
    for (const run of runs(L, 5, 5)) {
      const indoor = inStruct(L, run.x0, run.ty);
      for (let tx = run.x0 + 1; tx <= run.x1 - 3; tx++) {
        const x = tx * TS; if (!free(busy, x + 22, 34)) continue;
        const q = r();
        if (q < .09 && !indoor) { addStatic(L, stallCv(r.int(0, 7)), x, run.y - 40); L.decos.push(lamp(x + 22, run.y - 30, { len: 3, lightR: 70 })); tx += 4; }
        else if (q < .14) { let ox = 0; for (let k = 0; k < r.int(2, 3); k++) { const cv = jarCv(r.int(0, 3), { lo: '#4a2a3a', mid: '#7a3a3a', hi: '#a85a4a', rim: '#d88a5a', dark: '#1a0a14' }); addStatic(L, cv, x + ox, run.y - cv.height + 1); ox += cv.width - 1; } tx += 2; }
        else if (q < .18) { const cw = r.int(18, 26), ch = r.int(26, 34); L.decos.push({ static: true, layer: 'back', bx: x, by: run.y - ch - 8, bw: cw, bh: 2, draw(ctx) { ctx.fillStyle = '#3a2414'; ctx.fillRect(x - 2, run.y - ch - 8, cw + 4, 2); } }); addStatic(L, carpetCv(r.int(0, 11), cw, ch), x, run.y - ch - 6); tx += 3; }
      }
    }
    for (const s of interiors(L)) { const ry = (s.roofY + 1) * TS; for (let x = s.x0 + 1; x < s.x1; x += r.int(3, 5)) L.decos.push(lamp(x * TS + 8, ry, { len: r.int(3, 9), glass: r.pick(['#ffcf6a', '#ff8a5a', '#8ad0ff', '#ff9ad0']), lightR: 64 })); }
  }

  /* ---------------------------------------------------------------- 8. THE ARK — gardens of the Divan at golden hour
     the fortress on its hill with battered walls and gilded domes; cypress and apricot gardens; petals in the wind. */
  {
    const SKY = [[0, '#2a1440'], [.3, '#6a2e52'], [.55, '#c8603a'], [.78, '#ffb050'], [1, '#fff0c0']];
    const fort = { lo: '#7a3a2a', mid: '#a85a3a', hi: '#e8a060', win: '#ffd890' };
    const gd = { lo: '#a86a1a', mid: '#e0a830', hi: '#ffe080', rim: '#fff8d0', drum: '#b8683a', drumD: '#7a3a2a', gold: '#fff0a0', win: '#3a1a10' };
    const tq = { lo: '#1a5a6a', mid: '#2a8a9a', hi: '#6ad0d0', rim: '#ffe8a0', drum: '#a85a3a', drumD: '#7a3a2a', gold: '#ffe080', win: '#3a1a10' };
    const gardenPal = { lo: '#2a140c', mid: '#3c2012', hi: '#6a3a18', rim: '#ffb850', deep: '#1e0e08', trunk: '#2a140c', trunkHi: '#4a2a14', bark: '#6a4a2a' };
    place('yd_ark', {
      ambient: '#ffe0b4', shade: '#9c7456', deepShade: '#281206', bloom: .95, wind: .4,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 81, sun: { x: 330, y: 150, r: 22, core: '#fffbe8', rim: '#ffe6a0', halo: '#ffb050', haloA: .8 }, glow: [{ x: 330, y: 160, rx: 330, ry: 150, col: '#ffc060', a: .6 }] })),
      layers(L, R, seed) {
        return memo('ak' + seed, () => {
          const out = [];
          const cl = new Px(1400, 100, true);
          for (let i = 0; i < 6; i++) cloud(cl, 100 + i * 240, 30 + (i % 3) * 18, 170 + (i * 31) % 90, 10 + (i % 2) * 6, { lo: '#8a3a4a', mid: '#d0704a', hi: '#ffd090' }, seed + i);
          out.push(layer(cl.canvas(), { fx: .02, fy: .02, base: 110, drift: 1.2 }));
          // the Ark on its hill
          const ak = new Px(1600, 150, true), r = rngOf(seed + 2);
          ridge(ak, { seed: seed + 3, base: 150, amp: 40, per: 2, oct: 3, col: '#a85a3a', grad: '#7a3a2a', rim: '#ffd090', shape: (u, v) => .2 + .8 * Math.pow(Math.max(0, Math.sin(u * PI * 2)), 1.5) * .9 + v * .2 });
          for (const cx0 of [300, 1100]) {
            let y = 0; while (y < 150 && !ak.has(cx0, y)) y++;
            fortWall(ak, cx0 - 150, cx0 + 150, y + 10, 40, fort, { lx: 1, step: 50, br: 11, courses: true, lit: true });
            dome(ak, cx0 - 40, y - 30, 14, gd, { kind: 'onion', ribs: 10, lx: 1, drum: 6, drumWin: '#3a1a10' });
            dome(ak, cx0 + 50, y - 30, 10, tq, { kind: 'melon', ribs: 8, lx: 1, drum: 4, tiles: true });
            minaret(ak, cx0 + 10, y - 26, 56, 8, 6, { lo: '#7a3a2a', mid: '#b8683a', hi: '#f0b070', band: '#2a8a9a', bandHi: '#6ad0d0', win: '#ffd890', gold: '#ffe080' }, { lx: 1, bands: 8, brick: true, lit: true });
          }
          out.push(layer(ak.canvas(), { fx: .05, fy: .04, base: R.horizon - 4, fill: '#7a3a2a' }));
          // gardens: rows of cypress, poplars, chinars, with a pavilion
          const g1 = new Px(1300, 110, true);
          for (let x = 0; x < 1300; x += r.int(18, 34)) tree(g1, x, 110, r.int(40, 70), r.pick(['cypress', 'cypress', 'poplar', 'cypress', 'chinar']), gardenPal, seed + x, { lx: 1 });
          for (let x = 0; x < 1300; x++) for (let y = 100; y < 110; y++) g1.set(x, y, P32('#2a140c'));
          out.push(layer(g1.canvas(), { fx: .16, fy: .12, base: R.horizon + 10, fill: '#2a140c' }));
          // garden wall with majolica panels and blossoming apricots
          const g2 = new Px(1000, 90, true);
          for (let x = 0; x < 1000; x++) for (let y = 62; y < 90; y++) { const panel = (x % 50) > 8 && (x % 50) < 42 && y > 66 && y < 84; g2.set(x, y, P32(y === 62 ? '#ffd090' : panel ? (((x + y) % 4 === 0) ? '#e8e0c0' : ((x >> 1) + (y >> 1)) % 3 ? '#1a4a7a' : '#2a8a9a') : y < 65 ? '#c8783a' : '#8a4a2a')); }
          for (let i = 0; i < 6; i++) tree(g2, 80 + i * 170 + r.int(-20, 20), 70, r.int(46, 60), 'apricot', { lo: '#4a2a1e', mid: '#6a4a24', hi: '#a8782a', trunk: '#3a2014', trunkHi: '#6a3a1e', bloom: '#ffb8c0', bloom2: '#fff0e8' }, seed + 90 + i, { lx: 1 });
          out.push(layer(g2.canvas(), { fx: .36, fy: .28, base: R.horizon + 30, fill: '#6a3420' }));
          return out;
        });
      },
      fogBehind: hazeDraw([[0, '#ffc060', 0], [.5, '#ffb050', .06], [.74, '#ffc878', .26], [1, '#8a4a2a', .3]]),
      drawForeground: fgLayers([
        { top: true, fx: 1.35, fy: .25, lift: 2, make: () => fgPaint(1600, 50, 181, (px, r) => { for (let i = 0; i < 3; i++) { const x = i * 540 + r.int(0, 200); for (let k = 0; k < 3; k++) px.line(x + k * 30, 0, x + 40 + k * 26, 18 + k * 6, P32('#1a0c08')); for (let j = 0; j < 40; j++) { const bx = x + r.int(0, 110), by = r.int(2, 34), c = r.chance(.8) ? '#2a120c' : '#c86a7a'; px.disc(bx, by, r.range(1.5, 3.2), P32(c)); } } }) },
        { fx: 1.6, fy: .5, drop: 4, make: () => fgPaint(1700, 30, 182, (px, r) => { for (let i = 0; i < 6; i++) { const x = r.int(0, 1700); for (let k = 0; k < 30; k++) { const bx = x + r.int(0, 40), by = 30 - r.int(0, 18); px.disc(bx, by, r.range(1.5, 3.5), P32(r.chance(.12) ? '#c83040' : '#160a06')); } } }) }
      ]),
      post: all(shafts([{ x: 330, w: 60, slope: -.35, col: '#ffd890', a: .38 }, { x: 430, w: 34, slope: -.35, col: '#ffe0a0', a: .3 }, { x: 600, w: 80, slope: -.35, col: '#ffc070', a: .22 }]), grade('#ffb040', .2), vignette('rgba(40,10,4,1)', .45)),
      ambientFx: all(
        emit({ rate: .14, cols: ['#ffb8c0', '#ffe0e8', '#fff4f0', '#ff9ab0'], vx: [.2, .6], vy: [.15, .35], life: 420, size: [1, 2], alpha: .9, sway: .02, max: 70 }),
        emit({ rate: .08, cols: ['#ffe080', '#fff4c0'], vx: [-.15, .15], vy: [-.1, .2], from: 'any', life: 300, glow: true, glowR: 3, alpha: .8, flicker: true, max: 30 })
      ),
      decorate(L, r) { arkProps(L, r); }
    });
  }
  function arkProps(L, r) {
    const busy = busyXs(L);
    for (const run of runs(L, 5, 5)) {
      const indoor = inStruct(L, run.x0, run.ty);
      for (let tx = run.x0 + 1; tx <= run.x1 - 2; tx++) {
        const x = tx * TS + 8; if (!free(busy, x, 30)) continue;
        const q = r();
        if (q < .06 && !indoor) { const s = r.int(40, 56), cv = prop('apr' + s, s * 2, s + 4, px => tree(px, s, s + 2, s, 'apricot', { lo: '#3a5a2a', mid: '#5a7a34', hi: '#8aa040', trunk: '#4a2a18', trunkHi: '#7a4a2a', bloom: '#ffb8c8', bloom2: '#fff0f0' }, s, { lx: 1 })); addStatic(L, cv, x - s, run.y - s - 2); tx += 5; }
        else if (q < .1 && !indoor) { const s = r.int(44, 60), cv = prop('cyp' + s, 24, s + 2, px => tree(px, 12, s + 1, s, 'cypress', { lo: '#1a2a14', mid: '#2a4220', hi: '#4a6a2a', trunk: '#3a2414' }, s, { lx: 1 })); addStatic(L, cv, x - 12, run.y - s - 1); tx += 2; }
        else if (q < .125 && run.x1 - tx > 4) { // hauz: a tiled pool with water
          const w = 48; addStatic(L, prop('hauz', w, 8, px => { for (let xx = 0; xx < w; xx++) { px.set(xx, 0, P32(xx % 4 ? '#e8d0a0' : '#2a8a9a')); px.set(xx, 1, P32('#c8a070')); for (let y = 2; y < 8; y++) px.set(xx, y, P32(xx < 2 || xx > w - 3 ? '#8a5a3a' : y < 4 ? '#2a6a8a' : '#1a4a6a')); } }), x - 4, run.y - 8, 'back');
          const X = x - 4; L.decos.push({ x: X + w / 2, y: run.y - 5, r: 40, layer: 'back', light: { r: 40, color: '#8ad0ff', a: .3 }, draw(ctx, t) { ctx.fillStyle = '#9ae0f0'; for (let k = 4; k < w - 4; k += 6) if (Math.sin(t * 2 + k) > .2) ctx.fillRect(X + k + RD(Math.sin(t + k) * 2), run.y - 5, 3, 1); } }); tx += 4;
        } else if (q < .15) { const cv = columnCv(r.int(36, 46), { lo: '#5a2a14', mid: '#a0622a', hi: '#e0a050', cap: '#ffd070' }); addStatic(L, cv, x - 4, run.y - cv.height); L.decos.push(lamp(x, run.y - cv.height - 12, { len: 4, body: '#e0a830', glass: '#fff0a0', lightR: 60, light: '#ffd080' })); tx += 3; }
        else if (q < .18) { const cv = prop('rose' + (tx % 3), 16, 9, px => { const rr = rngOf(tx % 3); for (let k = 0; k < 18; k++) px.disc(rr.int(2, 13), rr.int(3, 8), rr.range(1, 2.2), P32(rr.pick(['#2a4a1a', '#3a5a22', '#1e3a14']))); for (let k = 0; k < 6; k++) px.set(rr.int(2, 13), rr.int(2, 6), P32(rr.pick(['#e8304a', '#ff8aa0', '#fff0f0']))); }); addStatic(L, cv, x - 8, run.y - 9); tx += 1; }
      }
    }
    for (const s of interiors(L)) { const ry = (s.roofY + 1) * TS; if (r.chance(.8)) L.decos.push(lamp((s.x0 + s.x1) / 2 * TS + 8, ry, { len: 6, body: '#e0a830', glass: '#fff0a0', light: '#ffd080' })); const fy = s.floorY * TS, w = (s.x1 - s.x0) * TS; if (fy - ry > 44 && w > 50 && r.chance(.6)) addStatic(L, carpetCv(r.int(0, 11), 22, 28), (s.x0 + 2) * TS, ry + 8); }
  }

  /* ---------------------------------------------------------------- 11. THE CLOISTER OF THE SINGERS
     cold moonlight on white walls and cobalt domes; rows of hujra cells with candles; snow; white cloth banners. */
  {
    const SKY = [[0, '#03061a'], [.4, '#0e1a3a'], [.7, '#24365e'], [1, '#4e6290']];
    const wall = { mid: '#98a4c4', hi: '#d4dcf0', lo: '#5a6688', tile: '#2a4aa8', tile2: '#e8ecf8', recess: '#1e2848', recessHi: '#2c3a62', win: '#ffd8a0', gold: '#c8d4f0' };
    const cob = { lo: '#14286a', mid: '#2a4aa8', hi: '#5a8ae0', rim: '#c8dcff', drum: '#8a96b8', drumD: '#5a6688', gold: '#e8ecf8', win: '#1e2848' };
    place('yd_cloister', {
      ambient: '#a8b2da', shade: '#485280', deepShade: '#080a1a', bloom: .95, wind: .25,
      drawSky: skyDraw(() => paintSky(SKY, { seed: 111, stars: 300, starH: .6, moon: { x: 360, y: 52, r: 20, col: '#f4f8ff', dark: '#d0d8e8', halo: '#9ab0e8', haloA: .7 }, glow: [{ x: 360, y: 60, rx: 220, ry: 140, col: '#3a5088', a: .55 }] }), twinkles(112, 30, .5)),
      layers(L, R, seed) {
        return memo('cl' + seed, () => {
          const out = [];
          const mt = new Px(1600, 110, true);
          ridge(mt, { seed: seed + 1, base: 108, amp: 64, per: 5, oct: 5, col: '#1e2850', grad: '#182040', rim: '#c8d4f4', rimSide: -1, snow: { col: '#8a9ac4', col2: '#5a6a98', depth: 14 } });
          out.push(layer(mt.canvas(), { fx: .03, fy: .03, base: R.horizon - 24 }));
          const c1 = cityBand(seed + 2, { w: 1400, h: 160, lx: 1, pal: { wall: '#6a7698', lit: '#a4b0d0', dark: '#4e5a7c', roof: '#6a7698', rim: '#d4dcf0', win: '#ffd8a0', winCore: '#fff0d0', winDark: '#3a4466' }, dpal: cob, mpal: { lo: '#4e5a7c', mid: '#7a86a8', hi: '#b8c4e0', band: '#2a4aa8', bandHi: '#5a8ae0', win: '#ffd8a0', winCore: '#fff0d0', gold: '#e8ecf8' }, ppal: wall, kinds: ['portal', 'dome', 'minaret', 'portal'], n: 4, dr: [20, 28], mh: [100, 130], mw: 12, pw: [56, 70], hw: [14, 30], hh: [14, 30], lit: .35, wp: .35, domeKinds: ['melon'] });
          out.push(layer(c1.canvas(), { fx: .1, fy: .07, base: R.horizon - 2, fill: '#4e5a7c' }));
          // the cloister wall: arcade of hujra cells, a few candle-lit
          const ar = new Px(1000, 80, true), r = rngOf(seed + 3), glows = [];
          for (let x = 0; x < 1000; x++) for (let y = 20; y < 80; y++) ar.set(x, y, P32(y === 20 ? '#e8ecf8' : y < 24 ? (((x + y) & 1) ? '#2a4aa8' : '#e8ecf8') : '#7a86a8'));
          for (let x = 8; x < 1000; x += 24) {
            const lit = r.chance(.4);
            for (let y = 30; y < 74; y++) { const t = (y - 30) / 10, hw = t < 1 ? 7 * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 7; for (let k = RD(-hw); k <= hw; k++) ar.set(x + 8 + k, y, P32(lit && y > 52 ? (y > 70 ? '#3a2a2a' : '#c89a5a') : y < 34 ? '#2c3a62' : '#1e2848')); }
            for (let y = 26; y < 74; y++) { ar.set(x - 1, y, P32('#c8d0e8')); ar.set(x, y, P32('#a4b0d0')); }
            if (lit) { ar.set(x + 8, 62, P32('#fff4d0')); ar.set(x + 8, 63, P32('#ffd890')); glows.push([x + 8, 62, '#ffc070', 10, .55]); }
          }
          for (let i = 0; i < 5; i++) tree(ar, r.int(0, 1000), 80, r.int(50, 70), 'cypress', { lo: '#0e1428', mid: '#18223e', hi: '#2c3c62' }, seed + 30 + i, { lx: 1 });
          out.push(layer(ar.canvas(), { fx: .26, fy: .2, base: R.horizon + 24, fill: '#5a6688', glows }));
          return out;
        });
      },
      fogBehind: hazeDraw([[0, '#3a4a7a', 0], [.5, '#5a6a9a', .06], [.75, '#a8b8e0', .22], [1, '#1a2240', .35]]),
      drawForeground: fgLayers([
        { top: true, fx: 1.3, fy: .3, make: () => fgPaint(1500, 44, 211, (px, r) => { fgRopes(px, r, { n: 3, ink: '#05060e', cloth: ['#c8d0e8', '#a8b4d4', '#e8ecf8'], rim: '#ffffff' }); for (let x = 0; x < 1500; x++) for (let y = 0; y < 44; y++) if (px.has(x, y) && (px.get(x, y) >>> 0) !== P32('#05060e')) px.tint(x, y, '#1a2040', .62); }) },
        { fx: 1.6, fy: .5, drop: 6, make: () => fgPaint(1700, 30, 212, (px, r) => { fgPots(px, r, { n: 4, ink: '#05060e', rim: '#4a5a8a' }); for (let x = 0; x < 1700; x++) for (let y = 1; y < 30; y++) if (px.has(x, y) && !px.has(x, y - 1)) { px.set(x, y, P32('#8a9ac8')); px.set(x, y - 1, P32('#c8d4f0')); } }) }
      ]),
      post: all(shafts([{ x: 360, w: 50, slope: -.4, col: '#a8c0ff', a: .3 }, { x: 470, w: 24, slope: -.4, col: '#c0d0ff', a: .24 }]), grade('#3a5ac0', .22), vignette('rgba(2,4,18,1)', .55)),
      ambientFx: all(
        emit({ rate: .3, cols: ['#ffffff', '#e0e8ff', '#c8d4f0'], vx: [-.1, .25], vy: [.2, .45], life: 520, alpha: .8, sway: .01, size: [1, 1.6], max: 110 }),
        emit({ rate: .02, cols: ['#a8c8ff'], vx: [-.05, .05], vy: [-.25, -.1], from: 'bottom', life: 360, glow: true, glowR: 6, alpha: .8, flicker: true, max: 10 })
      ),
      decorate(L, r) { cloisterProps(L, r); }
    });
  }
  function tumarString(x, y, n, o) { // a cord with triangular tumar amulets, glowing faintly
    o = o || {};
    return { x, y: y + n * 5, r: n * 6 + 20, layer: 'back', light: o.light ? { r: 36, color: o.light, a: .5, flicker: true } : null,
      draw(ctx, t) { const sw = Math.sin(t * 1.2 + x) * .8; ctx.fillStyle = '#2a2420'; ctx.fillRect(RD(x), y, 1, n * 3); ctx.fillRect(RD(x + sw), y + n * 3, 1, n * 3); for (let k = 1; k <= n; k++) { const X = RD(x + sw * k / n), Y = y + k * 6 - 2; ctx.fillStyle = o.col || '#e8d8a0'; ctx.fillRect(X - 2, Y, 5, 1); ctx.fillRect(X - 1, Y + 1, 3, 1); ctx.fillRect(X, Y + 2, 1, 1); } },
      fx(ctx, t) { if (o.glow) G.Glow.add(x, y + n * 3, 14, o.glow, .25 + .1 * Math.sin(t * 2 + x)); } };
  }
  function cloisterProps(L, r) {
    const busy = busyXs(L);
    for (const s of interiors(L)) {
      const ry = (s.roofY + 1) * TS, fy = s.floorY * TS;
      for (let x = s.x0 + 1; x < s.x1; x += r.int(3, 6)) if (r.chance(.45)) L.decos.push(tumarString(x * TS + 8, ry, r.int(2, Math.max(2, Math.min(6, FL((fy - ry - 30) / 6)))), { col: r.pick(['#e8d8a0', '#c8d4f0', '#a8c0ff']), glow: '#8ab0ff' }));
      if (fy - ry > 44 && r.chance(.6)) { const x = (s.x0 + 2) * TS; L.decos.push(cloth(x, ry + 2, 10, Math.min(40, fy - ry - 14), ['#e8ecf8', '#e8ecf8', '#2a4aa8', '#e8ecf8'], { stripe: 2 })); }
    }
    for (const run of runs(L, 4, 4)) for (let tx = run.x0; tx <= run.x1; tx++) {
      const x = tx * TS + 8; if (!free(busy, x, 26)) continue;
      const q = r();
      if (q < .05) { // stone lantern with a cold flame
        addStatic(L, prop('stlamp', 10, 20, px => { px.rect(2, 8, 6, 12, P32('#8a96b8')); px.rect(2, 8, 1, 12, P32('#c8d0e8')); px.rect(1, 6, 8, 2, P32('#a4b0d0')); px.rect(3, 10, 4, 5, P32('#1e2848')); px.rect(0, 18, 10, 2, P32('#5a6688')); }), x - 5, run.y - 20);
        L.decos.push({ x, y: run.y - 8, r: 20, layer: 'back', light: { r: 50, color: '#a8c0ff', a: .7, flicker: true }, draw(ctx, t) { ctx.fillStyle = '#d8e8ff'; ctx.fillRect(x - 1, run.y - 9 + RD(Math.sin(t * 9) * .5), 2, 2); }, fx(ctx, t) { G.Glow.add(x, run.y - 8, 12, '#8ab0ff', .5); } });
        tx += 2;
      } else if (q < .08) { const cv = columnCv(r.int(34, 44), { lo: '#3a2a20', mid: '#6a5040', hi: '#a08068', cap: '#c8d4f0' }); addStatic(L, cv, x - 4, run.y - cv.height); tx += 2; }
      else if (q < .1) { const cv = prop('bell', 9, 10, px => { for (let y = 0; y < 9; y++) { const hw = 1 + y * .45; for (let k = RD(-hw); k <= hw; k++) px.set(4 + k, y, P32(k < 0 ? '#c8a050' : '#8a6a30')); } px.set(4, 9, P32('#5a4020')); }); addStatic(L, cv, x - 4, run.y - 46); L.decos.push({ static: true, layer: 'back', bx: x, by: run.y - 60, bw: 1, bh: 14, draw(ctx) { ctx.fillStyle = '#2a2420'; ctx.fillRect(x, run.y - 60, 1, 14); } }); tx += 2; }
    }
  }

  /* ---------------------------------------------------------------- BOSS ARENAS */
  // 1 — the Singers' Vault: underground amber; tumars hang in thousands; dust in lamp light
  place('yd_vault', {
    ambient: '#6a5a50', shade: '#4a3a34', bloom: 1,
    drawForeground: fgLayers([
      { top: true, fx: 1.3, fy: .2, make: () => fgPaint(1200, 60, 301, (px, r) => { for (let i = 0; i < 26; i++) { const x = r.int(0, 1200), n = r.int(3, 9); for (let k = 0; k < n * 6; k++) px.set(x, k, P32('#0a0604')); for (let k = 1; k <= n; k++) { const y = k * 6 - 2; px.rect(x - 2, y, 5, 1, P32('#1a100a')); px.rect(x - 1, y + 1, 3, 1, P32('#1a100a')); px.set(x, y + 2, P32('#1a100a')); if (r.chance(.3)) px.set(x, y, P32('#ffd890')); } } }) },
      { fx: 1.6, fy: .4, drop: 4, make: () => fgPaint(1600, 30, 302, (px, r) => fgPots(px, r, { n: 5, ink: '#060302', rim: '#3a2210' })) }
    ]),
    post: all(shafts([{ x: 200, w: 40, slope: .15, col: '#ffc070', a: .26 }, { x: 420, w: 22, slope: .15, col: '#ffd890', a: .2 }]), grade('#ffa040', .18), vignette('rgba(10,4,2,1)', .6)),
    ambientFx: all(
      emit({ rate: .2, cols: ['#c8a070', '#a07850', '#e8c890'], vx: [-.08, .08], vy: [.02, .12], from: 'any', life: 400, alpha: .6, sway: .004, max: 60 }),
      emit({ rate: .04, cols: ['#ffe0a0', '#ffd070'], vx: [-.05, .05], vy: [-.2, -.08], from: 'any', band: [.4, 1], life: 260, glow: true, glowR: 5, alpha: .9, flicker: true, max: 14 })
    ),
    decorate(L, r) {
      // shelves of tumar jars along the back walls
      for (let x = 3; x < L.w - 4; x += r.int(6, 9)) {
        const X = x * TS, Y = r.int(5, 8) * TS;
        addStatic(L, prop('shelf' + (x % 4), 40, 26, px => { const rr = rngOf(x % 4); for (const sy of [10, 24]) { px.rect(0, sy, 40, 2, P32('#5a3a20')); px.rect(0, sy, 40, 1, P32('#8a5a30')); for (let k = 2; k < 38; k += rr.int(4, 7)) { const h = rr.int(4, 8), c = rr.pick(['#8a4a2a', '#6a3a22', '#a8703e', '#4a5a7a']); px.rect(k, sy - h, 3, h, P32(c)); px.set(k, sy - h, P32('#e8d8a0')); } } px.rect(1, 0, 1, 26, P32('#3a2414')); px.rect(38, 0, 1, 26, P32('#3a2414')); }), X, Y);
      }
      for (let x = 4; x < L.w - 4; x += r.int(8, 12)) L.decos.push(lamp(x * TS + 8, 2 * TS, { len: r.int(10, 30), lightR: 70 }));
    }
  });
  // 5 — the Tower of Silence: ash-violet dusk, the round dakhma on its hill, vultures circling
  place('yd_tower', {
    ambient: '#a898a8', shade: '#5a4a5a', bloom: .8,
    drawSky: skyDraw(() => paintSky([[0, '#140c22'], [.4, '#3a2440'], [.7, '#7a4050'], [.9, '#c06a50'], [1, '#e89a60']], { seed: 501, stars: 60, starH: .3, sun: { x: 120, y: 200, r: 16, core: '#ffe0b0', rim: '#ffb070', halo: '#e06040', haloA: .6 }, glow: [{ x: 120, y: 220, rx: 300, ry: 100, col: '#e07050', a: .5 }] })),
    layers(L, R, seed) {
      return memo('tw' + seed, () => {
        const out = [], hl = new Px(1400, 140, true);
        ridge(hl, { seed: seed + 1, base: 138, amp: 60, per: 2, oct: 4, col: '#4a2c3e', grad: '#2e1a28', rim: '#e08a6a', rimSide: -1, shape: (u, v) => .15 + .85 * Math.pow(Math.max(0, Math.sin(u * PI * 2 + 1)), 2) + v * .15 });
        for (const cx of [430, 1130]) { // the dakhma: a low round tower, wall battered, a door, a ramp
          let y = 0; while (y < 140 && !hl.has(cx, y)) y++;
          for (let k = 0; k < 30; k++) { const hw = 34 - k * .15; for (let xx = RD(cx - hw); xx <= cx + hw; xx++) { const n = (xx - cx) / hw, v = n * .9 + (dth(xx, y - k) - .5) * .3; hl.set(xx, y + 4 - k, P32(v < -.45 ? '#e8a080' : v < .2 ? '#8a5a5a' : '#5a3644')); } }
          for (let xx = cx - 33; xx <= cx + 33; xx += 3) hl.set(xx, y - 27, P32('#2e1a28'));
          hl.rect(cx - 3, y - 10, 6, 10, P32('#1a0e16'));
        }
        out.push(layer(hl.canvas(), { fx: .06, fy: .05, base: R.horizon - 10, fill: '#2e1a28' }));
        const g = new Px(1000, 90, true), r = rngOf(seed + 4);
        ridge(g, { seed: seed + 5, base: 90, amp: 30, per: 3, col: '#1e1220', rim: '#8a5060' });
        for (let i = 0; i < 8; i++) tree(g, r.int(0, 1000), 88 - r.int(0, 10), r.int(40, 60), 'dead', { trunk: '#140a12', trunkHi: '#3a2430' }, seed + 10 + i);
        out.push(layer(g.canvas(), { fx: .22, fy: .15, base: R.horizon + 30, fill: '#1e1220' }));
        out.push(birdsLayer({ n: 9, col: '#120a12', y: [40, 110], sp: [1, 2], seed, circle: true, cx: 240, big: true }));
        return out;
      });
    },
    fogBehind: hazeDraw([[0, '#3a2440', 0], [.6, '#7a4050', .1], [1, '#2a1828', .35]]),
    post: all(grade('#6a3a6a', .26), grade('#ff8a50', .06, 'overlay'), vignette('rgba(10,4,12,1)', .55)),
    ambientFx: all(
      emit({ rate: .2, cols: ['#2a2430', '#4a4048', '#6a5a60'], vx: [.1, .4], vy: [.2, .4], life: 380, alpha: .7, max: 60 }),
      emit({ rate: .015, cols: ['#3a2a30'], vx: [.3, .6], vy: [.2, .4], life: 500, shape: 'rect', w: 3, h: 1, alpha: .8, max: 6 })
    )
  });
  // 9 — the Hound's court: a gilded palace courtyard in hard gold sunset
  place('yd_court', {
    drawSky: skyDraw(() => paintSky([[0, '#2a1030'], [.4, '#7a2e40'], [.7, '#d87a40'], [1, '#ffd890']], { seed: 901, sun: { x: 240, y: 170, r: 26, core: '#fffbe8', rim: '#ffe0a0', halo: '#ffa040', haloA: .8 }, glow: [{ x: 240, y: 180, rx: 300, ry: 140, col: '#ffb050', a: .6 }] })),
    layers(L, R, seed) {
      return memo('ct' + seed, () => {
        const out = [];
        const c1 = cityBand(seed + 1, { w: 1300, h: 160, lx: 1, pal: { wall: '#8a4a2a', lit: '#d08a4a', dark: '#6a3420', roof: '#8a4a2a', rim: '#ffd090', win: '#ffd890', winCore: '#fff0c0', winDark: '#4a2414' }, dpal: { lo: '#a86a1a', mid: '#e0a830', hi: '#ffe080', rim: '#fff8d0', drum: '#a85a3a', drumD: '#6a3420', gold: '#fff0a0', win: '#3a1a10' }, mpal: { lo: '#6a3420', mid: '#a85a3a', hi: '#e8a060', band: '#e0a830', bandHi: '#ffe080', win: '#ffd890', gold: '#fff0a0' }, ppal: { mid: '#a85a3a', hi: '#e8a060', lo: '#6a3420', tile: '#e0a830', tile2: '#2a8a9a', recess: '#3a1a10', recessHi: '#5a2a18', win: '#ffd890', gold: '#fff0a0' }, kinds: ['portal', 'dome', 'minaret', 'dome', 'portal'], n: 5, dr: [16, 26], mh: [90, 120], mw: 12, pw: [50, 66], hw: [14, 26], hh: [14, 30], lit: .4, wp: .3 });
        out.push(layer(c1.canvas(), { fx: .08, fy: .05, base: R.horizon, fill: '#6a3420' }));
        const bn = new Px(800, 90, true);
        for (let i = 0; i < 8; i++) { const x = i * 100 + 20; bn.rect(x, 0, 2, 90, P32('#3a1a0a')); for (let y = 6; y < 50; y++) for (let k = 0; k < 14; k++) if (y < 44 || k < 7 - (y - 44)) bn.set(x + 2 + k, y, P32(y % 10 < 2 ? '#e0a830' : '#8a1a1a')); bn.disc(x + 9, 24, 4, P32('#e0a830')); }
        out.push(layer(bn.canvas(), { fx: .3, fy: .2, base: R.horizon + 30 }));
        return out;
      });
    },
    post: all(shafts([{ x: 240, w: 70, slope: .05, col: '#ffd890', a: .34 }, { x: 380, w: 30, slope: -.1, col: '#ffe0a0', a: .26 }]), grade('#ffb040', .24), vignette('rgba(40,10,0,1)', .5)),
    ambientFx: emit({ rate: .14, cols: ['#ffe080', '#ffd040', '#fff4c0'], vx: [-.15, .15], vy: [.1, .3], life: 400, glow: true, glowR: 3, alpha: .8, sway: .015, max: 50 })
  });
  // 12 — the hall of the Silent Choir: colossal arches, seven veiled statues with open mouths, cold candlelight
  place('yd_choir_hall', {
    drawSky: skyDraw(() => paintSky([[0, '#02030a'], [.5, '#0a1024'], [1, '#1e2a4a']], { seed: 1201, stars: 0 })),
    layers(L, R, seed) {
      return memo('ch' + seed, () => {
        const out = [], ah = new Px(840, 230, true), glows = [];
        for (let x = 0; x < 840; x++) for (let y = 0; y < 230; y++) ah.set(x, y, P32(n2(x * .1, y * .1, 3) > .6 ? '#141c34' : '#101830'));
        for (let i = 0; i < 7; i++) {
          const cx = 60 + i * 120, top = 40;
          for (let y = top; y < 230; y++) { const t = (y - top) / 30, hw = t < 1 ? 40 * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 40; for (let k = RD(-hw); k <= hw; k++) ah.set(cx + k, y, P32(y < top + 4 ? '#2a3a6a' : mix('#1e2a4a', '#3a4a7a', (y - top) / 190))); }
          // statue of a singer: robed, head tilted, mouth a dark hole
          for (let y = 0; y < 120; y++) { const hw = y < 16 ? 6 * Math.sin(y / 16 * PI) + 1 : 8 + y * .1; for (let k = RD(-hw); k <= hw; k++) ah.set(cx + k, 106 + y, P32(k < -hw * .4 ? '#a8b4d4' : k < hw * .3 ? '#6a7698' : '#3e4a6a')); }
          ah.rect(cx - 1, 113, 3, 3, P32('#05060e'));
          ah.rect(cx - 30, 210, 4, 12, P32('#c8c0b0')); ah.set(cx - 29, 208, P32('#fff4d0')); glows.push([cx - 28, 208, '#a8c0ff', 9, .6]);
          ah.rect(cx + 26, 214, 4, 8, P32('#c8c0b0')); ah.set(cx + 27, 212, P32('#fff4d0')); glows.push([cx + 28, 212, '#a8c0ff', 9, .6]);
        }
        out.push(layer(ah.canvas(), { fx: .2, fy: .1, base: R.horizon + 30, fill: '#1e2a4a', glows }));
        return out;
      });
    },
    post: all(shafts([{ x: 120, w: 30, slope: .08, col: '#a8c0ff', a: .3 }, { x: 300, w: 30, slope: .08, col: '#a8c0ff', a: .3 }, { x: 480, w: 30, slope: .08, col: '#a8c0ff', a: .3 }]), grade('#3a5ac0', .26), vignette('rgba(2,4,16,1)', .6)),
    ambientFx: all(
      emit({ rate: .15, cols: ['#ffffff', '#c8d4f0'], vx: [-.08, .08], vy: [.15, .3], life: 500, alpha: .6, max: 50 }),
      emit({ rate: .03, cols: ['#a8c8ff'], vx: [-.05, .05], vy: [-.3, -.1], from: 'bottom', life: 400, glow: true, glowR: 6, alpha: .8, flicker: true, max: 12 })
    )
  });

  /* ---------------------------------------------------------------- CHAIKHANAS (four looks; the engine builds every rest from "chaikhana") */
  function chaiTrees(px, seed, pal, n) { const r = rngOf(seed); for (let i = 0; i < n; i++) tree(px, RD((i + .5) * px.w / n + r.int(-30, 30)), px.h, r.int(110, 140), 'chinar', pal, seed + i); }
  place('yd_chai_dusk', { // two great plane trees, dusk over the city on the Sleeper's back
    drawSky: skyDraw(() => paintSky([[0, '#1a1034'], [.35, '#4a2450'], [.65, '#a8506a'], [.85, '#f0906a'], [1, '#ffd0a0']], { seed: 2001, stars: 80, starH: .3, moon: { x: 80, y: 40, r: 7, col: '#fff4e8', halo: '#e8a0c0', haloA: .35, phase: .6 }, glow: [{ x: 300, y: 260, rx: 360, ry: 140, col: '#ffb070', a: .55 }] })),
    layers(L, R, seed) {
      return memo('cd' + seed, () => {
        const out = [], cl = new Px(1200, 80, true);
        for (let i = 0; i < 5; i++) cloud(cl, 100 + i * 240, 30 + (i % 2) * 16, 170, 12, { lo: '#6a3050', mid: '#c06a6a', hi: '#ffc090' }, i + 3);
        out.push(layer(cl.canvas(), { fx: .02, fy: 0, base: 100, drift: 1 }));
        const c1 = cityBand(seed + 1, { w: 1200, h: 130, pal: { wall: '#6a3a5a', lit: '#9a5a6a', dark: '#5a3050', roof: '#6a3a5a', rim: '#ffb090', win: '#ffc070', winCore: '#fff0c0', winDark: '#4a2844' }, dpal: { lo: '#2a4a7a', mid: '#3a6a9a', hi: '#6a9ac0', rim: '#ffd0b0', drum: '#6a3a5a', drumD: '#5a3050', gold: '#ffd890', win: '#ffc070' }, mpal: { lo: '#5a3050', mid: '#7a4462', hi: '#a8607a', band: '#3a6a9a', win: '#ffc070', gold: '#ffd890' }, ppal: { mid: '#7a4462', hi: '#a8607a', lo: '#5a3050', tile: '#3a6a9a', recess: '#3a1e34', win: '#ffc070', gold: '#ffd890' }, kinds: ['dome', 'minaret', 'portal'], n: 5, dr: [10, 16], mh: [60, 80], mw: 8, pw: [30, 40], hw: [8, 18], hh: [8, 22], lit: .5 });
        out.push(layer(c1.canvas(), { fx: .06, fy: 0, base: R.horizon - 4, fill: '#5a3050' }));
        const tr = new Px(900, 150, true);
        chaiTrees(tr, seed + 5, { lo: '#2a1828', mid: '#3e2236', hi: '#6a3a48', rim: '#e08a70', deep: '#1e1020', trunk: '#4a3036', trunkHi: '#8a6a6a', bark: '#b89a90' }, 2);
        out.push(layer(tr.canvas(), { fx: .16, fy: 0, base: R.horizon + 30 }));
        return out;
      });
    },
    post: all(grade('#c06040', .2), vignette('rgba(30,8,10,1)', .4)),
    ambientFx: all(
      emit({ rate: .05, cols: ['#ffe8a0', '#d8ff9a'], vx: [-.15, .15], vy: [-.1, .05], from: 'any', band: [.3, .9], life: 300, glow: true, glowR: 5, alpha: 1, wander: .03, flicker: true, max: 20 }),
      emit({ rate: .05, cols: ['#c89a3a', '#a86a2a', '#e8b860'], vx: [.15, .45], vy: [.2, .4], life: 420, alpha: .9, sway: .02, shape: 'rect', w: 2, h: 1, max: 20 })
    )
  });
  place('yd_chai_under', { // a smugglers' den in the karez: lamplight on wet clay, the dark beyond
    layers(L, R, seed) {
      return memo('cu' + seed, () => {
        const out = [], rk = new Px(900, 320, true), glows = [], r = rngOf(seed);
        for (let x = 0; x < 900; x++) for (let y = 0; y < 320; y++) { const v = n2(x * .06, y * .09, 5) + n2(x * .2, y * .2, 6) * .3; rk.set(x, y, P32(v > .9 ? '#3a2a20' : v > .65 ? '#24180f' : '#160e08')); }
        for (let i = 0; i < 6; i++) { const x = r.int(0, 900), y = r.int(150, 260); for (let k = 0; k < 18; k++) for (let j = -6; j <= 6; j++) if (Math.hypot(j, (k - 9) * .7) < 7) rk.set(x + j, y + k, P32('#05030a')); rk.rect(x - 1, y + 9, 3, 3, P32('#ffb060')); glows.push([x, y + 10, '#ff9040', 14, .55]); }
        out.push(layer(rk.canvas(), { fx: .2, fy: .1, base: R.horizon + 60, fill: '#160e08', glows }));
        return out;
      });
    },
    ambientFx: all(
      emit({ rate: .12, cols: ['#a07850', '#c8a070'], vx: [-.05, .05], vy: [.02, .1], from: 'any', life: 400, alpha: .5, max: 40 }),
      emit({ rate: .04, cols: ['#6a8a9a'], vx: [0, 0], vy: [1.5, 2.2], from: 'top', life: 120, shape: 'rect', w: 1, h: 2, alpha: .6, max: 10 })
    )
  });
  place('yd_chai_night', { // high on the Spine: snow, stars, the white ranges of the Sleeper's back
    drawSky: skyDraw(() => paintSky([[0, '#02040e'], [.45, '#0c1430'], [.8, '#22305a'], [1, '#3a4a78']], { seed: 2401, stars: 380, starH: .7, milky: { x0: 0, y0: 0, dy: 110, w: 30, col: '#8aa0e0', a: 1.5 }, moon: { x: 400, y: 50, r: 12, col: '#f4f8ff', halo: '#8aa0e0', haloA: .5 } }), twinkles(2402, 40, .6)),
    layers(L, R, seed) {
      return memo('cn' + seed, () => {
        const out = [];
        for (let j = 0; j < 2; j++) {
          const mt = new Px(1400, 160, true);
          ridge(mt, { seed: seed + j * 5, base: 158, amp: 140 - j * 50, per: 4 + j, oct: 5, col: j ? '#141a34' : '#26345c', grad: j ? '#0e1228' : '#1e2a50', rim: '#d8e4ff', snow: { col: j ? '#8a9ac8' : '#b8c8e8', col2: j ? '#5a6a98' : '#8a9ac8', depth: 24 - j * 6 } });
          out.push(layer(mt.canvas(), { fx: .04 + j * .1, fy: 0, base: R.horizon - 40 + j * 30 }));
        }
        return out;
      });
    },
    post: all(grade('#2a4ab0', .22), vignette('rgba(2,4,16,1)', .45))
  });
  place('yd_chai_dream', { // the dream chaikhana: stacked impossible cities floating in violet clouds
    drawSky: skyDraw(() => paintSky([[0, '#140830'], [.4, '#4a2470'], [.75, '#b06ab0'], [1, '#ffd0e8']], { seed: 2901, stars: 160, starH: .5, moon: { x: 250, y: 56, r: 17, col: '#fff0ff', dark: '#e8c8f0', halo: '#d090e8', haloA: .32, phase: .45 } }), twinkles(2902, 40, .5, '#ffe8ff')),
    layers(L, R, seed) {
      return memo('cdr' + seed, () => {
        const out = [], fl = new Px(1200, 170, true), r = rngOf(seed);
        const pal = { wall: '#7a4a9a', lit: '#b88ad0', dark: '#5a3a7a', roof: '#7a4a9a', rim: '#ffe0ff', win: '#fff0a0', winCore: '#ffffff', winDark: '#4a2a6a' };
        for (let i = 0; i < 4; i++) {
          const cx = i * 300 + r.int(40, 120), cy = r.int(50, 120), w = r.int(70, 110);
          for (let k = 0; k < 30; k++) { const hw = w / 2 * (1 - k / 30); for (let x = RD(cx - hw); x <= cx + hw; x++) fl.set(x, cy + k, P32(k < 3 ? '#b88ad0' : '#4a2a6a')); } // floating rock, root down
          let x = cx - w / 2; while (x < cx + w / 2 - 6) { const hw = r.int(8, 16); house(fl, x, cy, hw, r.int(10, 30), pal, r, { wp: .6, lit: .7, ww: 1, wh: 2, wsx: 4, wsy: 5 }); x += hw; }
          dome(fl, cx, cy - 26, 9, { lo: '#3a5aa0', mid: '#5a8ad0', hi: '#a8d0ff', rim: '#ffffff', drum: '#7a4a9a', drumD: '#5a3a7a', gold: '#fff0a0' }, { kind: 'onion', ribs: 8 });
          // the same city hanging upside down beneath
          for (let y = 0; y < 30; y++) for (let xx = RD(cx - w / 2); xx <= cx + w / 2; xx++) { const c = fl.get(xx, cy - 1 - y); if (c >>> 24) fl.set(xx, cy + 30 + y, P32(hash(xx, y, 3) < .5 ? '#6a4a8a' : '#5a3a7a', 200)); }
        }
        out.push(layer(fl.canvas(), { fx: .05, fy: 0, base: R.horizon - 20, drift: .6 }));
        const cl = new Px(1000, 70, true);
        for (let i = 0; i < 6; i++) cloud(cl, i * 170 + 60, 40, 160, 16, { lo: '#8a5ab0', mid: '#d0a0e0', hi: '#fff0ff' }, i + 40);
        out.push(layer(cl.canvas(), { fx: .12, fy: 0, base: R.horizon + 40, drift: 2 }));
        return out;
      });
    },
    post: all(grade('#a040e0', .24), grade('#ffd0f0', .06, 'screen'), vignette('rgba(20,4,30,1)', .45))
  });

  // street life of the Tail: jars, tandirs, laundry, carpets, aryk, lamps
  function tailProps(L, r, mode) {
    const busy = busyXs(L), night = mode === 'night', ruin = mode === 'ruin';
    for (const run of runs(L, 4, 4)) {
      const indoor = inStruct(L, run.x0, run.ty);
      for (let tx = run.x0; tx <= run.x1; tx++) {
        const x = tx * TS + 8;
        if (!free(busy, x, 26)) continue;
        const roll = r();
        if (roll < .07) { // jars group
          let ox = 0; for (let k = 0, n = r.int(1, 3); k < n; k++) { const cv = jarCv(r.int(0, 3), ruin ? { lo: '#3a2a26', mid: '#5a4440', hi: '#7a625a', rim: '#8a7a70', dark: '#1a1210' } : undefined); addStatic(L, cv, x + ox, run.y - cv.height + 1, 'back'); ox += cv.width - 1; }
          tx += 2;
        } else if (roll < .1 && !indoor && run.x1 - tx > 3) { // tandir with embers
          const cv = tandirCv(); addStatic(L, cv, x - 7, run.y - 11, 'back');
          if (!ruin || r.chance(.5)) L.decos.push({ x, y: run.y - 9, r: 30, layer: 'back', light: { r: 46, color: '#ff8a3a', a: .8, flicker: true }, draw() {}, fx(ctx, t) { G.Glow.add(x, run.y - 9, 10, '#ff7a2a', .45 + .2 * U.noise1(t * 4 + x, 3)); } });
          tx += 3;
        } else if (roll < .13 && !ruin) { // laundry on a short line between two poles
          const w = r.int(28, 44), y = run.y - 30, cols = ['#a8323a', '#2a5a9a', '#d8c8a0', '#c89a3a', '#5a8a4a', '#e8e0d0'];
          L.decos.push({ static: true, layer: 'back', bx: x, by: y - 2, bw: w + 2, bh: 32, draw(ctx) { ctx.fillStyle = '#2a1c14'; ctx.fillRect(x, y - 2, 1, 32); ctx.fillRect(x + w, y - 2, 1, 32); ctx.fillStyle = '#1a120c'; for (let k = 0; k <= w; k++) ctx.fillRect(x + k, y + RD(Math.sin(k / w * PI) * 4), 1, 1); } });
          for (let k = 4; k < w - 4; k += r.int(6, 9)) L.decos.push(cloth(x + k, y + RD(Math.sin(k / w * PI) * 4) + 1, r.int(3, 6), r.int(6, 12), [r.pick(cols)], { stripe: 9 }));
          tx += FL(w / TS) + 1;
        } else if (roll < .15 && !indoor) { // a chinar or apricot growing from the street
          const kind = r.chance(.6) ? 'chinar' : 'apricot', size = kind === 'chinar' ? r.int(56, 74) : r.int(34, 44);
          const pal = ruin ? { lo: '#2a2622', mid: '#3a3430', hi: '#5a524a', trunk: '#2a2420', trunkHi: '#4a423a', bark: '#6a5e52' }
            : kind === 'apricot' ? { lo: '#2a4a2a', mid: '#3e6a36', hi: '#5a8a46', trunk: '#3a2a1e', trunkHi: '#5a4430', bloom: '#f4c8c8', bloom2: '#ffe8e0' }
              : { lo: '#1e3a26', mid: '#2e5232', hi: '#4a7040', deep: '#14281a', trunk: '#8a8068', trunkHi: '#b8ae90', bark: '#d8d0b8' };
          const key = 'tree' + kind + size + (ruin ? 'r' : '') + (tx % 5);
          const cv = prop(key, size * 2, size + 4, px => tree(px, size, size + 2, size, ruin ? 'dead' : kind, pal, tx % 5 + 11));
          addStatic(L, cv, x - size, run.y - size - 2, 'back');
          tx += 5;
        } else if (roll < .17 && night) { // a lamp on a bracket
          L.decos.push(lamp(x, run.y - 46, { len: 6 }));
          L.decos.push({ static: true, layer: 'back', bx: x - 6, by: run.y - 47, bw: 8, bh: 3, draw(ctx) { ctx.fillStyle = '#20140c'; ctx.fillRect(x - 6, run.y - 47, 7, 1); ctx.fillRect(x - 6, run.y - 47, 1, 3); } });
          tx += 6;
        } else if (roll < .19 && ruin) { // rubble and a broken beam
          const cv = prop('rubble' + (tx % 4), 26, 10, px => { const rr = rngOf(tx % 4 + 50); for (let i = 0; i < 16; i++) { const cx = rr.int(2, 23), s = rr.int(1, 3); px.rect(cx, 10 - s * 2 - rr.int(0, 3), s * 2, s * 2, P32(rr.pick(['#6a5a50', '#8a7868', '#4a3e38', '#a08a74']))); } px.line(1, 9, 22, 1, P32('#3a2618')); px.line(1, 8, 22, 0, P32('#5a3a20')); });
          addStatic(L, cv, x - 13, run.y - 10, 'back'); tx += 2;
        }
      }
    }
    // carpets on interior back walls, lamps under roofs
    for (const s of interiors(L)) {
      const fy = (s.floorY) * TS, ry = (s.roofY + 1) * TS, w = (s.x1 - s.x0) * TS;
      if (fy - ry < 40 || w < 48) continue;
      if (r.chance(ruin ? .3 : .7)) { const cw = r.int(16, 26), chh = r.int(20, 30), cx = (s.x0 + 2) * TS + r.int(0, Math.max(0, w - cw - 40)); if (free(busy, cx + cw / 2, 20)) addStatic(L, carpetCv(r.int(0, 11), cw, chh), cx, ry + 6, 'back'); }
      if (night && r.chance(.8)) L.decos.push(lamp((s.x0 + s.x1) / 2 * TS + 8, ry, { len: r.int(4, 10) }));
    }
    // an aryk along a long open run
    if (!ruin) { let n = 0; for (const run of runs(L, 12, 4)) { if (n > 4 || inStruct(L, run.x0 + 2, run.ty) || r.chance(.4)) continue; const a0 = (run.x0 + 2) * TS, a1 = Math.min(run.x1 - 1, run.x0 + 12) * TS; if (busy.some(b => b > a0 - 10 && b < a1 + 10)) continue; aryk(L, a0, a1, run.y, night ? { stone: '#4a4658', stoneHi: '#6a6a84', water: '#141e40', waterHi: '#8aa8ff' } : undefined); n++; } }
  }

  ART.tailProps = tailProps;
})();
}
