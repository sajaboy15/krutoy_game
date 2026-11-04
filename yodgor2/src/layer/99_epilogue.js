/* =====================================================================
   Epilogue slides — the end of the run told as painted pictures
   (Fallout / Baldur's Gate / Pathfinder end slides).
   - One baked 480x270 pixel painting per epilogue line, chosen from
     G.STORY.epilogueKeys ({k: subject, v: variant, e: ending}), 4–6
     parallax layers, slow camera drift, particles, cross-fades.
   - The ending title (G.ENDING_TITLE) opens as a card; Ravshan's slide
     closes; then the engine's own end-of-run screen takes over unchanged.
   - Input: Enter / Space / click / → next, ← previous, Esc skips all;
     every slide also advances by itself after ~8 s.
   - The engine still owns the victory state: while the slides run we keep
     its timer at 0 (it draws nothing visible then and takes no input), and
     when they end we hand it the timer it would have reached.
   Scenes are painted once into canvases (cached by scene id); per frame we
   only blit layers, a bottom shade and a few particles.
   ===================================================================== */
{
  const EPI = G.EPILOGUE = { on: true, stats: { ms: 0, n: 0, bakeMs: 0, bakes: 0 } };
  const ART = G.ART_CITY, PEOPLE = G.PEOPLE;
  const RD = Math.round, FL = Math.floor, PI = Math.PI;
  const SW = 520, SH = 284, VX = 20, VY = 7;          // baked layer size, visible window origin
  const DUR = 480, XF = 56, TITLE_DUR = 290, PAN = 18;
  const SERIF = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, "DejaVu Serif", serif';
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = x => { x = cl(x, 0, 1); return x * x * (3 - 2 * x); };
  const oc = x => 1 - Math.pow(1 - cl(x, 0, 1), 3);
  const VS = () => G.UI._debug().VS;
  if (!ART || !PEOPLE) { console.warn('[epilogue] art toolkit missing: slides off'); }

  /* =====================================================================
     COLOUR + PIXEL HELPERS
     ===================================================================== */
  const Px = ART && ART.Px, P32 = ART && ART.P32, mix = ART && ART.mix, shade = ART && ART.shade;
  const n2 = ART && ART.n2, fbm = ART && ART.fbm, hash = ART && ART.hash, dth = ART && ART.dth, rngOf = ART && ART.rngOf;
  const rgbA = (h, a) => { const c = ART.rgb(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; };
  const ramp = (stops, v) => {
    if (v <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) { const a = stops[i - 1], b = stops[i]; return mix(a[1], b[1], (v - a[0]) / Math.max(1e-6, b[0] - a[0])); }
    return stops[stops.length - 1][1];
  };
  const evenStops = cols => cols.map((c, i) => [i / (cols.length - 1), c]);

  // dithered vertical gradient sky with optional glows, stars, moon
  function sky(px, cols, o) {
    o = o || {};
    const W = px.w, H = o.h || px.h, n = o.steps || 26, st = Array.isArray(cols[0]) ? cols : evenStops(cols), pal = [];
    for (let i = 0; i < n; i++) pal.push(P32(ramp(st, i / (n - 1))));
    for (let y = 0; y < H; y++) {
      const q = (y / (H - 1)) * (n - 1), lo = FL(q), f = q - lo;
      for (let x = 0; x < W; x++) px.d[y * W + x] = pal[Math.min(n - 1, lo + (f > dth(x, y) ? 1 : 0))];
    }
    for (const g of [].concat(o.glow || [])) {
      for (let y = Math.max(0, FL(g.y - g.ry)); y < Math.min(H, g.y + g.ry); y++) for (let x = Math.max(0, FL(g.x - g.rx)); x < Math.min(W, g.x + g.rx); x++) {
        const dx = (x - g.x) / g.rx, dy = (y - g.y) / g.ry, d = Math.sqrt(dx * dx + dy * dy);
        if (d >= 1) continue;
        const k = (1 - d) * (1 - d) * g.a;
        if (k > dth(x, y) * .85) px.blend(x, y, g.col, Math.min(1, k * 1.3));
      }
    }
    const r = rngOf(o.seed || 11);
    if (o.stars) for (let i = 0; i < o.stars; i++) {
      const x = r.int(0, W - 1), y = r.int(0, FL(H * (o.starH || .55))), b = r();
      const c = r.pick(['#ffffff', '#d8e4ff', '#ffe8c8', '#a8b8f0']);
      px.blend(x, y, c, .25 + .6 * b * (1 - y / (H * (o.starH || .55))));
      if (b > .97) { px.blend(x - 1, y, c, .3); px.blend(x + 1, y, c, .3); px.blend(x, y - 1, c, .3); px.blend(x, y + 1, c, .3); }
    }
    if (o.moon) {
      const m = Object.assign({ col: '#f4f0e0', dark: '#c8c4c0', halo: '#a8b8f0', haloA: .45 }, o.moon);
      for (let y = FL(m.y - m.r * 8); y <= m.y + m.r * 8; y++) for (let x = FL(m.x - m.r * 8); x <= m.x + m.r * 8; x++) {
        const d = Math.hypot(x + .5 - m.x, y + .5 - m.y) / m.r;
        if (d > 1 && d < 8) { const k = m.haloA * Math.pow(1 / d, 1.5) * (d < 1.25 ? 1.4 : 1); if (k > dth(x, y) * .55) px.blend(x, y, m.halo, Math.min(.85, k)); }
      }
      for (let y = FL(m.y - m.r); y <= m.y + m.r; y++) for (let x = FL(m.x - m.r); x <= m.x + m.r; x++) {
        const d = Math.hypot(x + .5 - m.x, y + .5 - m.y);
        if (d > m.r) continue;
        if (m.phase) { const sd = Math.hypot(x + .5 - (m.x + m.r * m.phase), y + .5 - m.y + m.r * .15); if (sd < m.r * .95) continue; }
        let c = n2(x * .35, y * .35, 5) > .62 ? m.dark : m.col;
        if (d > m.r - 1) c = mix(m.col, m.halo, .3);
        px.set(x, y, P32(c));
      }
    }
    if (o.sun) {
      const s = Object.assign({ core: '#fffaf0', rim: '#ffe0a0', halo: '#ffb060', haloA: .55 }, o.sun);
      for (let y = FL(s.y - s.r * 9); y <= s.y + s.r * 9; y++) for (let x = FL(s.x - s.r * 9); x <= s.x + s.r * 9; x++) {
        const d = Math.hypot(x + .5 - s.x, y + .5 - s.y) / s.r;
        if (d <= 1) { if (s.cut == null || y < s.cut) px.set(x, y, P32(d > .8 ? s.rim : s.core)); continue; }
        if (d < 9) { const k = s.haloA * Math.pow(1 / d, 1.3); if (k > dth(x, y) * .5) px.blend(x, y, s.halo, Math.min(.9, k)); }
      }
    }
  }
  // soft horizontal cloud streaks
  function streaks(px, n, y0, y1, cols, seed, o) {
    o = o || {};
    const r = rngOf(seed);
    for (let i = 0; i < n; i++) {
      const cx = r.range(-40, px.w + 40), cy = r.range(y0, y1), w = r.range(o.w0 || 40, o.w1 || 140), h = r.range(1.5, o.h || 4);
      const col = r.pick(cols);
      for (let y = FL(cy - h); y <= cy + h; y++) for (let x = FL(cx - w); x <= cx + w; x++) {
        const dx = (x - cx) / w, dy = (y - cy) / h, d = dx * dx + dy * dy;
        if (d >= 1) continue;
        const a = (1 - d) * (o.a || .5) * (.6 + .8 * n2(x * .08, y * .5, seed + i));
        if (a > dth(x, y) * .7) px.blend(x, y, col, Math.min(1, a));
      }
    }
  }
  // profile fill from a function top(x) down to the bottom, with a gradient and rim
  function land(px, top, o) {
    for (let x = 0; x < px.w; x++) {
      const ty = RD(top(x));
      for (let y = Math.max(0, ty); y < px.h; y++) {
        let c = o.col;
        if (o.grad) c = mix(o.col, o.grad, Math.min(1, (y - ty) / (o.gradH || 40)));
        if (o.tex && n2(x * (o.texF || .2), y * .35, o.seed || 3) > (o.texT || .64)) c = mix(c, o.tex, .45);
        if (o.ripple && ((y + RD(Math.sin(x * .05 + y * .3) * 2)) % o.ripple === 0) && y > ty + 2) c = mix(c, o.rippleCol || o.tex || o.col, .35);
        px.set(x, y, P32(c));
      }
      if (o.rim) { const lit = top(x + 2) > top(x - 2) ? (o.rimSide || 1) > 0 : (o.rimSide || 1) < 0; if (lit || o.rimAll) px.set(x, ty, P32(o.rim)); }
    }
  }
  // dune profile from layered sines + fbm
  const duneTop = (base, amp, seed, per) => x => base - amp * (.55 * Math.sin(x / (per || 90) + seed) + .3 * Math.sin(x / ((per || 90) * .43) + seed * 2.1) + .35 * fbm(x / 140, seed, 3));
  // a reflection of rows [y0 - (y1 - y0), y0) mirrored into [y0, y1), rippled and tinted
  function reflect(px, y0, y1, tint, a, o) {
    o = o || {};
    const W = px.w;
    for (let y = y0; y < y1; y++) {
      const k = y - y0, src = y0 - 1 - FL(k * (o.squash || 1));
      if (src < 0) continue;
      const wob = RD(Math.sin(y * .9 + (o.seed || 0)) * (1 + k * .04) * (o.wob == null ? 1 : o.wob));
      for (let x = 0; x < W; x++) {
        const s = px.get(x + wob, src);
        if (!(s >>> 24)) continue;
        const r0 = s & 255, g0 = s >> 8 & 255, b0 = s >> 16 & 255;
        const t = ART.rgb(tint), m = a + (1 - a) * Math.min(1, k / (y1 - y0)) * (o.fade || .5);
        let cr = r0 + (t[0] - r0) * m, cg = g0 + (t[1] - g0) * m, cb = b0 + (t[2] - b0) * m;
        if (o.lines && ((y + (x >> 3)) % 4 === 0) && hash(x >> 2, y, 3) < .5) { cr *= .85; cg *= .85; cb *= .9; }
        px.d[y * W + x] = ((255 << 24) | (FL(cb) << 16) | (FL(cg) << 8) | FL(cr)) >>> 0;
      }
    }
  }
  // flat water band (gradient + glints) with no reflection
  function waterBand(px, y0, y1, c0, c1, seed) {
    for (let y = y0; y < y1; y++) for (let x = 0; x < px.w; x++) {
      let c = mix(c0, c1, (y - y0) / Math.max(1, y1 - y0));
      if (hash(x >> 2, y, seed || 1) < .08 && (y % 3) === 0) c = shade(c, .12);
      px.set(x, y, P32(c));
    }
  }
  // haze: blend a colour over a band, strongest at yPeak
  function haze(px, y0, y1, col, a, yPeak) {
    for (let y = Math.max(0, y0); y < Math.min(px.h, y1); y++) {
      const t = yPeak == null ? 1 - (y - y0) / (y1 - y0) : 1 - Math.abs(y - yPeak) / Math.max(yPeak - y0, y1 - yPeak);
      const k = a * cl(t, 0, 1);
      for (let x = 0; x < px.w; x++) if (k > dth(x, y) * .9) px.tint(x, y, col, Math.min(1, k * 1.2));
    }
  }
  // recolour every opaque pixel toward col by k (atmospheric perspective)
  function fade(px, col, k) { if (k <= 0) return; for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) px.tint(x, y, col, k); }

  /* ---------- canvas helpers (after the Px pass) ---------- */
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.ctx = c.getContext('2d'); c.ctx.imageSmoothingEnabled = false; return c; };
  const glowCache = new Map();
  function glowSpr(col, r, soft) {
    const key = col + '|' + r + '|' + (soft || 0);
    let cv = glowCache.get(key);
    if (cv) return cv;
    cv = mk(r * 2, r * 2);
    const g = cv.ctx.createRadialGradient(r, r, 0, r, r, r), c = ART.rgb(col);
    g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},1)`); g.addColorStop(soft ? .5 : .3, `rgba(${c[0]},${c[1]},${c[2]},${soft ? .45 : .32})`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
    cv.ctx.fillStyle = g; cv.ctx.fillRect(0, 0, r * 2, r * 2);
    glowCache.set(key, cv);
    return cv;
  }
  function glow(c, x, y, r, col, a, op) {
    c.save(); c.globalCompositeOperation = op || 'lighter'; c.globalAlpha = a == null ? .5 : a;
    c.drawImage(glowSpr(col, r), RD(x - r), RD(y - r)); c.restore();
  }
  // a person from G.PEOPLE; o: {face, s (scale), lamp, talk, rim, dark:[col,a], alpha, t}
  const figTmp = mk(48, 72);
  function fig(c, look, x, y, o) {
    o = o || {};
    const s = o.s || 1;
    const tc = figTmp.ctx;
    tc.setTransform(1, 0, 0, 1, 0, 0); tc.globalCompositeOperation = 'source-over'; tc.globalAlpha = 1;
    tc.clearRect(0, 0, 48, 72);
    try { PEOPLE.drawPerson(tc, { look, x: 24, y: 66, face: o.face || 1, t: o.t || 0, phase: o.ph || 0, lamp: !!o.lamp, talking: !!o.talk, rim: o.rim || '#ffe8c0' }); } catch (e) { console.warn('[epilogue] figure', e && e.message); return; }
    if (o.dark) { tc.globalCompositeOperation = 'source-atop'; tc.globalAlpha = o.dark[1]; tc.fillStyle = o.dark[0]; tc.fillRect(0, 0, 48, 72); tc.globalCompositeOperation = 'source-over'; tc.globalAlpha = 1; }
    c.save(); c.imageSmoothingEnabled = false;
    if (o.cut != null) { c.beginPath(); c.rect(-1000, -1000, 3000, 1000 + o.cut); c.clip(); }
    if (o.alpha != null) c.globalAlpha = o.alpha;
    c.drawImage(figTmp, RD(x - 24 * s), RD(y - 66 * s), 48 * s, 72 * s);
    c.restore();
  }
  // a pixel rect / poly on a 2d context
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(RD(x), RD(y), RD(w), RD(h)); };
  function tumar(c, x, y, col, lit) { // a small triangular amulet
    R(c, x - 2, y, 5, 1, col); R(c, x - 1, y + 1, 3, 1, col); R(c, x, y + 2, 1, 1, col);
    if (lit) { R(c, x, y, 1, 1, '#fff6d0'); glow(c, x, y + 1, 6, lit, .55); }
  }
  function chainLink(c, x, y, a, len, col, hi) { // chain along a line from (x,y) at angle a
    const n = FL(len / 4);
    for (let i = 0; i < n; i++) {
      const px = x + Math.cos(a) * i * 4, py = y + Math.sin(a) * i * 4;
      if (i & 1) { R(c, px - 1, py - 1, 3, 3, col); R(c, px, py, 1, 1, '#05040a'); }
      else { R(c, px - 2, py, 5, 1, col); R(c, px - 1, py - 1, 3, 1, hi || col); }
    }
  }
  // a catenary chain of links from p0 to p1 with sag
  function chainCurve(c, x0, y0, x1, y1, sag, col, hi, w) {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, FL(len / (w || 4)));
    for (let i = 0; i < n; i++) {
      const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + sag * 4 * u * (1 - u);
      const big = (w || 4) > 5;
      if (i & 1) { R(c, x - 1, y - (big ? 2 : 1), big ? 3 : 2, big ? 5 : 3, col); }
      else { R(c, x - (big ? 3 : 2), y - 1, big ? 6 : 4, big ? 3 : 2, col); R(c, x - (big ? 2 : 1), y - 1, big ? 4 : 2, 1, hi || col); if (big) R(c, x - 1, y, 2, 1, '#05040a'); }
    }
  }

  /* =====================================================================
     LOOKS used on the slides
     ===================================================================== */
  const LK = PEOPLE ? PEOPLE.LOOKS : {};
  const RAV = { body: 'man', robe: '#26305a', trim: '#d6a24a', skin: '#c9a27f', head: 'doppi', headC: '#1d1a26', headC2: '#eee6d2', beard: 'short', beardC: '#2e2220', pat: 'ikat', patA: '#a8343e', patB: '#d29a48', sash: '#b83a3a', outer: '#171c3a' };
  const RAVH = Object.assign({}, RAV, { robe: '#3e4252', trim: '#7a7468', skin: '#a8a49a', patA: '#5a5458', patB: '#7a7468', sash: '#5a5052', hollow: 1, outer: '#2e3040' });
  const FAR = { body: 'man', robe: '#c07a28', trim: '#f2d48a', skin: '#c8956a', head: 'doppi', headC: '#2a1a14', headC2: '#f2c14a', beard: 'short', beardC: '#2a1810', pat: 'stripes', stripes: '#8a2a30', sash: '#8a2a30', outer: '#6a2a24' };
  const TUR = { body: 'old', robe: '#1f4a56', trim: '#a8c0b0', skin: '#b98a63', head: 'doppi', headC: '#1c1a1e', headC2: '#d8d0c0', beard: 'long', beardC: '#d8d4cc', pat: 'stripes', stripes: '#2f6a74', sash: '#a8c0b0' };
  const RUS = { body: 'old', robe: '#5a3a2e', trim: '#8a6a52', skin: '#a8a49a', head: 'turban', headC: '#d8d0c0', beard: 'long', beardC: '#d8d4cc', pat: 'stripes', stripes: '#6a4a3a', hollow: 1 };
  const OYD = LK.oydin || 'oydin';
  const OYDF = { body: 'woman', robe: '#3a2430', trim: '#8a5a5a', skin: '#c08a62', head: 'scarf', headC: '#2a2030', headC2: '#4a3a46', scar: 1, pat: 'plain', outer: '#241820' }; // Oydin unhooded
  const OYDH = Object.assign({}, OYDF, { robe: '#4a4448', trim: '#6a6466', skin: '#a8a49a', headC: '#4a4448', hollow: 1, outer: '#3a3436' }); // sung empty
  const KID = ['child', 'girl'];

  /* =====================================================================
     SCENES
     A scene builder returns { layers: [{d, paint(px, r), post(c, r)}], fx: [...] }.
     Coordinates are in the baked canvas (520x284); the screen shows about
     x 20..500, y 7..277. Everything that matters stands above y ≈ 200:
     the band below sits under the text shade. Figures stand on GY.
     ===================================================================== */
  const SC = {};
  const lay = (d, paint, post) => ({ d, paint, post });
  const GY = 196;
  const FX = {
    dust: (n, col) => ({ type: 'dust', n: n || 26, col: col || '#e8d8b8', d: .8 }),
    motes: (x0, y0, x1, y1, col, n) => ({ type: 'motes', n: n || 18, area: [x0, y0, x1, y1], col: col || '#ffe2a8', d: .6 }),
    embers: (x, y, col, n) => ({ type: 'embers', n: n || 14, x, y, col: col || '#ffb050', d: .8 }),
    sand: (n, col) => ({ type: 'sand', n: n || 40, col: col || '#e8c890', d: 1 }),
    glints: (x0, y0, x1, y1, col, n) => ({ type: 'glints', n: n || 30, area: [x0, y0, x1, y1], col: col || '#ffe8c0', d: .5 }),
    stars: (n, h) => ({ type: 'stars', n: n || 40, h: h || 120, d: .04 }),
    flame: (x, y, d, s) => ({ type: 'flame', x, y, d: d == null ? .7 : d, s: s || 1 }),
    fireflies: (x0, y0, x1, y1, n) => ({ type: 'fireflies', n: n || 12, area: [x0, y0, x1, y1], col: '#d8ff9a', d: .8 }),
    birds: (n, y) => ({ type: 'birds', n: n || 5, y: y || 60, col: '#141018', d: .3 }),
    ash: (n, col) => ({ type: 'ash', n: n || 30, col: col || '#a8a0a8', d: .9 })
  };

  const PAL = {
    night: { sky: ['#04030a', '#0a0c22', '#141a3c', '#232650', '#363260'], far: '#1c1c3c', mid: '#141430', near: '#07060e', win: '#ffcf7a', winCore: '#fff0c0', haze: '#363260', rim: '#8a98d8' },
    dawn: { sky: ['#0d0b1e', '#272246', '#5a4268', '#b06a6a', '#f2a878'], far: '#4a3a5a', mid: '#2a2038', near: '#0e0a14', win: '#ffd08a', winCore: '#fff2d0', haze: '#b06a6a', rim: '#f2a878' },
    dusk: { sky: ['#0e0816', '#2e1430', '#6a2a3a', '#c25a3a', '#f4a456'], far: '#4a2034', mid: '#28121e', near: '#0c060a', win: '#ffc070', winCore: '#fff0c8', haze: '#c25a3a', rim: '#f4a456' },
    grey: { sky: ['#0e0e14', '#24242e', '#44424c', '#6a6670', '#8e8a90'], far: '#3a3840', mid: '#24222a', near: '#0c0b10', win: '#c8b890', winCore: '#e8dcc0', haze: '#6a6670', rim: '#a8a4b0' },
    day: { sky: ['#2a4a7a', '#4a6a9a', '#8aa4c4', '#d0c8b4', '#ecdcbc'], far: '#8a7a80', mid: '#6a5448', near: '#2a1c18', win: '#2a2028', winCore: '#3a2e30', haze: '#d0c8b4', rim: '#fff0d0' },
    morning: { sky: ['#1a2a50', '#3a5480', '#7a90b0', '#d8b8a0', '#f4d8a8'], far: '#7a6a78', mid: '#4a3a40', near: '#1a1218', win: '#ffd890', winCore: '#fff4d8', haze: '#d8b8a0', rim: '#ffe0b0' },
    dream: { sky: ['#06041a', '#1a0c3a', '#3a1a5a', '#6a3a7a', '#a86a9a'], far: '#3a2a5a', mid: '#22183a', near: '#0a0618', win: '#9ff3e6', winCore: '#e8fffa', haze: '#6a3a7a', rim: '#c8a8f0' },
    red: { sky: ['#0a0406', '#220a10', '#4a1418', '#8a2a1e', '#d0602a'], far: '#3a1418', mid: '#1e0a0e', near: '#080305', win: '#ffd060', winCore: '#fff4c0', haze: '#8a2a1e', rim: '#ff9a50' }
  };
  const housePal = (base, m) => ({ wall: base, lit: shade(base, .14), dark: shade(base, -.38), roof: shade(base, -.2), rim: m.rimH || shade(base, .3), win: m.win, winCore: m.winCore, winDark: shade(base, -.55), door: shade(base, -.6) });
  const domePal = (lo, mid, hi, m) => ({ lo, mid, hi, rim: m && m.rim, drum: m && m.drum || shade(mid, -.25), drumD: shade(mid, -.5), gold: m && m.gold });
  const DOME_BLUE = domePal('#163a6a', '#2a5a9a', '#5a8ac8', { gold: '#e2b452', rim: '#9ad0f0' });
  const DOME_TURQ = domePal('#14505a', '#1f8a90', '#5fd0c8', { gold: '#e2b452', rim: '#b8fff0' });
  const mkMin = (wall, m) => ({ lo: shade(wall, -.35), mid: wall, hi: shade(wall, .18), band: '#2a6a8a', bandHi: '#5aa8b8', win: m.win, winCore: m.winCore, gold: '#e2b452' });

  /* ---------- shared painters ---------- */
  // a skyline whose base follows top(x): landmarks then low houses
  function skyline(px, r, o) {
    const m = o.m, lx = o.lx || -1, lit = o.lit == null ? .4 : o.lit, base = o.base, sink = o.sink || 0;
    const hp = housePal(o.wall, m), mp = mkMin(o.wall, m), dp = o.dome || DOME_BLUE;
    if (o.arkX != null) {
      const by = RD(base(o.arkX)) + 6 + sink;
      ART.fortWall(px, o.arkX - 50, o.arkX + 50, by, 30, { lo: shade(o.wall, -.35), mid: shade(o.wall, -.1), hi: shade(o.wall, .12), win: m.win }, { lx, step: 34, br: 8, lit: lit > .3 });
      ART.house(px, o.arkX - 26, by - 30, 40, 16, hp, r, { lx, wp: .5, lit: Math.min(1, lit + .2), ww: 2, wh: 2, wsx: 5, wsy: 6 });
    }
    for (const [kind, x, s] of o.items) {
      const yb = RD(base(x)) + 4 + sink;
      if (kind === 'dome') { ART.house(px, x - s - 4, yb, s * 2 + 8, RD(s * .8), hp, r, { lx, wp: .3, lit, ww: 1, wh: 2, wsx: 4, wsy: 5, beams: false }); ART.dome(px, x, yb - RD(s * .8), s, dp, { kind: s > 18 ? 'onion' : 'melon', ribs: 10, lx, tiles: true, drumWin: m.win }); }
      else if (kind === 'minaret') ART.minaret(px, x, yb, s, 8, 6, mp, { lx, bands: 8, brick: true, lit: lit > .2, lantern: 5 });
      else if (kind === 'portal') { ART.dome(px, x + RD(s * .55), yb - RD(s * .7), RD(s * .4), dp, { kind: 'melon', ribs: 12, lx, tiles: true }); ART.portal(px, x - RD(s / 2), yb, s, RD(s * 1.15), { lo: shade(o.wall, -.3), mid: o.wall, hi: shade(o.wall, .15), tile: '#2a5a9a', tile2: '#3a8ab8', recess: shade(o.wall, -.55), recessHi: shade(o.wall, -.4), win: m.win, gold: '#e2b452' }, { lx, guld: true, lit: lit > .3 }); }
    }
    let x = o.x0;
    while (x < o.x1) {
      const hw = r.int(8, 18), hh = r.int(6, 14);
      ART.house(px, x, RD(base(x + hw / 2)) + 8 + sink, hw, hh, hp, r, { lx, wp: .45, lit, ww: 1, wh: 2, wsx: 4, wsy: 4 });
      x += hw + (r.chance(.25) ? r.int(1, 4) : 0);
    }
  }
  // camel caravan silhouettes along y(x); lanterns optional
  function caravan(px, x0, n, y, col, o) {
    o = o || {};
    const lamps = [];
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (o.gap || 19) * (o.flip ? -1 : 1), yy = RD(typeof y === 'function' ? y(x) : y) - 11;
      ART.sprite(px, 'camel', x, yy, col, 1, o.flip);
      if (i % 2 === 0 || o.riders) { px.rect(x + (o.flip ? 6 : 7), yy - 3, 2, 4, P32(col)); px.set(x + (o.flip ? 6 : 8), yy - 4, P32(col)); }
      if (o.lamps && i % 2 === 1) lamps.push([x + (o.flip ? 2 : 13), yy + 4]);
      if (o.walker && i % 3 === 0) ART.sprite(px, 'walker', x + (o.flip ? 16 : -6), yy + 3, col);
    }
    return lamps;
  }
  // a thin chain in pixels
  function pxChain(px, x0, y0, x1, y1, sag, col, hi) {
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, FL(len / 2.5));
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = RD(x0 + (x1 - x0) * u), y = RD(y0 + (y1 - y0) * u + sag * 4 * u * (1 - u));
      px.set(x, y, P32(i % 3 === 0 ? hi : col)); if (i % 3 === 1) px.set(x, y + 1, P32(col));
    }
  }
  // the Sleeper: head resting on the left, a long back carrying the city
  const sleeperTop = (o) => x => {
    const g = o.ground || 182;
    const hx = o.headX == null ? 54 : o.headX, hw = 46, hh = o.headH || 36;
    const head = Math.abs(x - hx) < hw ? g - hh * Math.sqrt(1 - Math.pow((x - hx) / hw, 2)) : g + 20;
    const t = (x - (o.b0 || 96)) / ((o.b1 || 500) - (o.b0 || 96));
    const back = t > 0 && t < 1 ? g - (o.backH || 56) * Math.pow(Math.sin(t * PI), .6) - 3 * Math.sin(x * .09) : g + 20;
    const tail = x > 470 ? g - 10 - 14 * Math.sin((x - 470) * .08) : g + 20;
    return Math.min(head, back, tail, g + 6);
  };
  function sleeper(px, o) {
    const top = sleeperTop(o), m = o.m;
    land(px, top, { col: o.col || m.far, grad: o.grad || m.mid, gradH: 50, tex: shade(o.col || m.far, -.18), texT: .62, texF: .12, rim: o.rim || m.rim, rimSide: -1, seed: 9 });
    // spine plates along the back
    for (let x = 110; x < 480; x += 9) { const y = RD(top(x)); if (y > (o.ground || 182) - 4) continue; px.set(x, y - 1, P32(shade(o.col || m.far, -.25))); px.set(x + 1, y - 2, P32(shade(o.col || m.far, -.25))); px.set(x + 1, y - 1, P32(o.rim || m.rim)); }
    // folds of skin
    for (let i = 0; i < 26; i++) { const x = 70 + i * 16 + (i * 7) % 5, y0 = RD(top(x)) + 6; for (let k = 0; k < 14; k++) px.blend(x + RD(Math.sin(k * .5) * 2), y0 + k, '#000000', .18); }
    // the face: a closed eye, a brow, a nostril, water at the mouth
    const hx = o.headX == null ? 54 : o.headX, g = o.ground || 182;
    if (o.face !== false) {
      const col = o.col || m.far, ey = g - 17, ex = hx - 4;
      for (let k = -13; k <= 13; k++) { const y = ey + RD((k * k) / 34); px.set(ex + k, y, P32(o.eyeOpen ? '#ffe8a0' : shade(col, -.55))); px.set(ex + k, y + 1, P32(o.eyeOpen ? o.eyeOpen : shade(col, -.35))); px.set(ex + k, y - 1, P32(shade(col, .12))); if (!o.eyeOpen && k % 4 === 0 && Math.abs(k) < 12) px.set(ex + k - 1, y + 2, P32(shade(col, -.5))); }
      for (let k = -15; k <= 12; k++) px.set(ex + k, ey - 8 - RD(Math.abs(k + 2) * .22), P32(shade(col, -.35)));
      px.rect(hx - 38, g - 11, 3, 2, P32(shade(col, -.55))); px.rect(hx - 31, g - 12, 2, 2, P32(shade(col, -.55)));
      for (let k = 0; k < 22; k++) px.set(hx - 44 + k, g - 4 + RD(Math.sin(k * .35)), P32(shade(col, -.45)));
      for (let k = 0; k < 6; k++) px.set(hx - 42 + k * 3, g - 2 + (k & 1), P32('#7fd8d0'));
    }
  }
  // a Tail street row facing the camera
  function tailRow(px, r, o) {
    const m = o.m, hp = housePal(o.wall, m), doors = [];
    let x = o.x0 == null ? -10 : o.x0;
    while (x < (o.x1 || SW + 10)) {
      const hw = r.int(o.hw[0], o.hw[1]), hh = r.int(o.hh[0], o.hh[1]);
      const by = o.by + (o.slope ? RD(o.slope(x)) : 0);
      const top = ART.house(px, x, by, hw, hh, hp, r, { lx: o.lx || -1, wp: o.wp == null ? .5 : o.wp, lit: o.lit == null ? .45 : o.lit, ww: o.ww || 2, wh: o.wh || 3, wsx: o.wsx || 6, wsy: o.wsy || 8, door: false, courses: true, lattice: true, spill: true, sill: true });
      if (o.doors !== false && hw > 12) {
        const dw = o.dw || 6, dh = o.dh || 12, dx = x + r.int(3, Math.max(3, hw - dw - 3));
        for (let a = 0; a < dh; a++) for (let b = 0; b < dw; b++) {
          let c = o.doorCol || mix(shade(o.wall, -.55), '#3a2418', .5);
          if (b === 0 || b === dw - 1 || a === 0) c = shade(o.wall, -.3);
          else if (a > 1 && (b === RD(dw / 2) || a === RD(dh / 2))) c = shade(c, -.25);
          px.set(dx + b, by - dh + a, P32(c));
        }
        if (o.doorLit && r.chance(o.doorLit)) for (let a = 1; a < dh; a++) for (let b = 1; b < dw - 1; b++) px.set(dx + b, by - dh + a, P32(mix(m.win, '#3a1a0c', .35 + .4 * (1 - a / dh) + (b === RD(dw / 2) ? .2 : 0))));
        doors.push([dx, by, dw, dh]);
      }
      if (o.roofs && r.chance(.3)) { const jx = x + r.int(2, hw - 4); px.rect(jx, top - 3, 3, 3, P32(hp.dark)); }
      for (let yy = by; yy < Math.min(px.h, by + (o.fillDown || 0)); yy++) for (let xx = x; xx < x + hw; xx++) if (!px.has(xx, yy)) px.set(xx, yy, P32(hp.dark));
      x += hw + (r.chance(.2) ? r.int(2, 5) : 0);
    }
    return doors;
  }
  // a pointed arcade; the arch openings are filled by fillArch(x, y)
  function arcade(px, x0, x1, top, by, o) {
    const step = o.step || 34, aw = o.aw || 22, ah = o.ah || 40, wall = o.wall;
    for (let y = top; y < by; y++) for (let x = x0; x < x1; x++) {
      const k = (((x - x0) % step) + step) % step, cx = step / 2, dxa = Math.abs(k - cx);
      const ay = by - ah;
      if (y >= ay && dxa < aw / 2) {
        const t = (y - ay) / (aw * .7);
        const w = t < 1 ? (aw / 2) * Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : aw / 2;
        if (dxa < w) { if (o.fillArch) px.set(x, y, P32(o.fillArch(x, y, k))); continue; }
        if (dxa < w + 1.2) { px.set(x, y, P32(o.trim || shade(wall, .2))); continue; }
      }
      let c = wall;
      if (y < top + 3) c = o.cornice || shade(wall, -.25);
      else if (o.tile && y < top + 7) c = ((x + y) & 1) ? o.tile : (o.tile2 || o.tile);
      else if (hash(x, y, 31) < .06) c = shade(c, -.12);
      if (o.lightY && y > by - 8) c = mix(c, o.lightCol || '#000000', .2);
      px.set(x, y, P32(c));
    }
  }
  // the Well of the Singers: a wide stone mouth with a tile band
  function wellMouth(c, cx, cy, rx, o) {
    o = o || {};
    const ry = Math.max(4, RD(rx * .26)), st = o.stone || '#4a4456';
    if (o.light) glow(c, cx, cy - 6, RD(rx * 1.5), o.light, .3);
    c.fillStyle = shade(st, -.35); c.beginPath(); c.ellipse(cx, cy + 9, rx + 5, ry + 3, 0, 0, PI); c.fill();
    R(c, cx - rx - 5, cy, (rx + 5) * 2, 9, shade(st, -.1));
    for (let x = cx - rx - 4; x < cx + rx + 4; x += 2) R(c, x, cy + 3, 1, 3, ((x >> 1) & 1) ? '#2a8a9a' : '#d8e4dc');
    R(c, cx - rx - 5, cy + 2, (rx + 5) * 2, 1, shade(st, -.3));
    c.fillStyle = st; c.beginPath(); c.ellipse(cx, cy, rx + 5, ry + 3, 0, 0, PI * 2); c.fill();
    c.fillStyle = o.water || '#041e28'; c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, PI * 2); c.fill();
    if (o.light) { glow(c, cx, cy, rx, o.light, .5); glow(c, cx, cy - 30, rx, o.light, .16); }
    c.strokeStyle = o.rim || '#c8f0e8'; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, cy, rx + .5, ry + .5, 0, PI * 1.05, PI * 1.95); c.stroke();
    c.fillStyle = shade(st, .25); c.fillRect(cx - rx - 4, cy - 1, 2, 1); c.fillRect(cx + rx + 2, cy - 1, 2, 1);
    return cy - ry;
  }
  function lampAt(c, x, y, col, r, a) {
    R(c, x, y - 4, 1, 2, '#2a1a10'); R(c, x - 1, y - 2, 3, 1, '#4a2a14'); R(c, x - 1, y - 1, 3, 3, col || '#ffd27a'); R(c, x, y, 1, 1, '#fff4d0'); R(c, x - 1, y + 2, 3, 1, '#4a2a14');
    glow(c, x, y, r || 14, col || '#ffb850', a == null ? .6 : a);
  }
  function torch(c, x, y) { R(c, x, y, 1, 8, '#3a2414'); glow(c, x, y - 2, 18, '#ff8a30', .55); }
  // a raised wooden platform (tapchan) with a carpet and a low table
  function tapchan(c, x, y, w, o) {
    o = o || {};
    R(c, x, y - 8, w, 3, '#5a3a22'); R(c, x, y - 9, w, 1, '#7a5432');
    for (const lx of [x + 1, x + w - 3, x + RD(w / 2)]) R(c, lx, y - 5, 2, 5, '#3a2414');
    R(c, x + 2, y - 11, w - 4, 2, o.carpet || '#8a2a30'); for (let k = x + 3; k < x + w - 3; k += 3) R(c, k, y - 11, 1, 1, '#e2b452');
    R(c, x + 4, y - 12, w - 8, 1, '#a83a3a');
    if (o.table !== false) { const tx = x + RD(w / 2) - 7; R(c, tx, y - 15, 14, 2, '#6a4428'); R(c, tx + 1, y - 13, 1, 2, '#4a2a18'); R(c, tx + 12, y - 13, 1, 2, '#4a2a18'); R(c, tx + 3, y - 18, 3, 3, '#2f8f96'); R(c, tx + 4, y - 19, 1, 1, '#2f8f96'); R(c, tx + 8, y - 17, 2, 2, '#e8e0cc'); R(c, tx + 10, y - 17, 2, 2, '#e8e0cc'); }
  }
  function samovar(c, x, y) {
    R(c, x - 3, y - 14, 7, 9, '#b8862a'); R(c, x - 2, y - 15, 5, 1, '#e2b452'); R(c, x - 1, y - 17, 3, 2, '#8a5a1a'); R(c, x - 4, y - 5, 9, 2, '#6a4214'); R(c, x + 4, y - 10, 2, 1, '#e2b452');
    R(c, x - 2, y - 13, 1, 6, '#f2d48a'); glow(c, x, y - 6, 8, '#ff9a40', .35);
  }
  // little props
  function bread(c, x, y) { R(c, x - 4, y - 2, 9, 2, '#c08a4a'); R(c, x - 3, y - 3, 7, 1, '#d8a868'); R(c, x - 1, y - 3, 3, 1, '#a86a30'); R(c, x - 5, y, 11, 1, '#a83a3a'); }
  function book(c, x, y, open) { if (open) { R(c, x - 6, y - 2, 6, 4, '#e8dcc0'); R(c, x + 1, y - 2, 6, 4, '#f2e6c8'); R(c, x, y - 2, 1, 5, '#6a4a2a'); for (let k = 0; k < 3; k++) { R(c, x - 5, y - 1 + k, 4, 1, '#8a7a6a'); R(c, x + 2, y - 1 + k, 4, 1, '#8a7a6a'); } } else { R(c, x - 3, y - 4, 6, 5, '#5a2a1a'); R(c, x - 3, y - 4, 6, 1, '#e2b452'); } }
  function candle(c, x, y, a) { R(c, x, y - 4, 1, 4, '#e8dcc0'); R(c, x, y - 6, 1, 2, '#ffd27a'); glow(c, x, y - 6, 22, '#ffb050', a == null ? .55 : a); }
  function jar(c, x, y, col) { col = col || '#7a4a2a'; R(c, x - 3, y - 9, 7, 8, col); R(c, x - 2, y - 10, 5, 1, shade(col, -.2)); R(c, x - 1, y - 12, 3, 2, col); R(c, x - 3, y - 9, 1, 7, shade(col, .2)); R(c, x - 2, y - 1, 5, 1, shade(col, -.3)); }
  function sadoWisp(c, x, y, a) { glow(c, x, y, 16, '#5ff0e0', .5 * a); glow(c, x, y, 6, '#c8fff6', .8 * a); R(c, x, y, 1, 1, '#ffffff'); }
  // a big foreground chain on the 2d context
  function heavyChain(c, x0, y0, x1, y1, sag, col, hi, w) {
    const len = Math.hypot(x1 - x0, y1 - y0), step = (w || 6) * 1.1, n = Math.max(2, FL(len / step));
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u + sag * 4 * u * (1 - u);
      const s = w || 6;
      if (i & 1) { R(c, x - 1, y - s * .55, 3, s * 1.1, col); R(c, x - 1, y - s * .55, 1, s * 1.1, hi); }
      else { R(c, x - s * .6, y - s * .3, s * 1.2, s * .6, col); R(c, x - s * .6, y - s * .3, s * 1.2, 1, hi); R(c, x - s * .3, y - .5, s * .6, 1, '#060408'); }
    }
  }
  // the moon shadow of a great bird (Humo) over a disc
  function birdShadow(c, x, y, s, col) {
    c.fillStyle = col;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x - s * .5, y - s * .35, x - s * 1.4, y - s * .1);
    c.quadraticCurveTo(x - s * .7, y + s * .02, x - s * .25, y + s * .18);
    c.lineTo(x - s * .18, y + s * .5); c.lineTo(x, y + s * .3); c.lineTo(x + s * .18, y + s * .5); c.lineTo(x + s * .25, y + s * .18);
    c.quadraticCurveTo(x + s * .7, y + s * .02, x + s * 1.4, y - s * .1);
    c.quadraticCurveTo(x + s * .5, y - s * .35, x, y);
    c.fill();
    c.fillRect(x - 1, y - s * .12, 3, s * .14);
  }
  const people = (c, list) => { for (const p of list) fig(c, p[0], p[1], p[2], p[3] || {}); };

  /* =====================================================================
     1. THE CITY on the Sleeper's back — the wide establishing picture
     ===================================================================== */
  SC.city = o => {
    const m = PAL[o.mood || 'dawn'];
    const G0 = 184;
    const top = sleeperTop({ ground: G0, backH: o.sink ? 30 : 58, headH: o.sink ? 20 : 38, headX: 96, b0: 134 });
    return {
      layers: [
        lay(.04, px => {
          sky(px, o.sky || m.sky, { stars: o.stars == null ? (o.mood === 'night' || o.mood === 'red' ? 260 : o.mood === 'dawn' ? 60 : 0) : o.stars, starH: .45, glow: o.glow || [{ x: o.sunX || 400, y: 178, rx: 280, ry: 95, col: m.haze, a: .75 }], moon: o.moon, sun: o.sun, seed: 3 });
          if (o.clouds !== false) streaks(px, 16, 30, 140, [shade(m.haze, -.25), shade(m.sky[2], .1), m.sky[3]], 21, { a: .35 });
        }),
        lay(.12, px => {
          land(px, x => 166 - 16 * fbm(x / 70, 4, 4) - 10 * Math.sin(x / 130), { col: mix(m.far, m.haze, .55), grad: mix(m.far, m.haze, .35), rim: mix(m.rim, m.haze, .5) });
        }),
        lay(.26, (px, r) => {
          if (o.sink) {
            // the city gone into the sand: only crowns stand out
            skyline(px, r, { m, base: x => 150, wall: o.wall || mix('#8a6a52', m.far, .5), lit: 0, items: [['dome', 150, 24], ['minaret', 205, 64], ['dome', 262, 30], ['minaret', 320, 52], ['portal', 372, 40], ['dome', 430, 20]], x0: 600, x1: 600, sink: 30 });
            land(px, x => 156 - 6 * Math.sin(x / 60 + 1) - 4 * fbm(x / 40, 3, 3), { col: o.sandCol || '#8a7058', grad: shade(o.sandCol || '#8a7058', -.25), rim: shade(o.sandCol || '#8a7058', .3), ripple: 5, seed: 5, gradH: 30 });
          } else {
            sleeper(px, { m, ground: G0, backH: 58, headH: 38, headX: 96, b0: 134, col: o.body || mix(m.far, '#3a2e3a', .3), eyeOpen: o.eyeOpen });
            skyline(px, r, { m, base: x => top(x) - 2, wall: o.wall || mix('#9a7a62', m.far, .5), lit: o.lit == null ? .45 : o.lit, arkX: 150, lx: 1, items: [['dome', 214, 18], ['minaret', 246, 58], ['portal', 280, 30], ['dome', 318, 24], ['minaret', 352, 48], ['dome', 392, 15], ['portal', 424, 24], ['minaret', 452, 34]], x0: 110, x1: 474, dome: o.dome });
          }
          fade(px, m.haze, o.farFade == null ? .16 : o.farFade);
        }, (c, r) => {
          if (o.chain) { // a chain from the Ark down to the Sleeper's neck
            heavyChain(c, 150, 104, 92, 168, 16, '#2a2224', '#8a7a6a', 4);
            heavyChain(c, 92, 168, 40, 176, 4, '#2a2224', '#8a7a6a', 4);
          }
          if (o.lit > .6) for (let i = 0; i < 18; i++) glow(c, 120 + r.int(0, 360), r.int(110, 170), r.int(8, 18), '#ffb040', .25);
          if (o.cityPost) o.cityPost(c, r);
        }),
        lay(.5, (px, r) => {
          if (o.water) {
            land(px, x => 170 + 2 * Math.sin(x / 50), { col: shade(o.sandCol || '#8a7058', -.2) });
            waterBand(px, 172, 214, mix(m.sky[3], '#8a8a98', .3), m.sky[1], 7);
            for (let y = 174; y < 214; y += 3) for (let x = 0; x < SW; x++) if (hash(x >> 3, y, 2) < .25) px.set(x, y, P32(mix(m.sky[3], '#ffffff', .25)));
            land(px, x => (x < 110 ? 172 + (x - 20) * .3 : x > 420 ? 172 + (500 - x) * .3 : 999), { col: shade(o.sandCol || '#8a7058', -.35), grad: '#0c0a10', gradH: 40, rim: shade(o.sandCol || '#8a7058', .1) });
          } else {
            land(px, x => 190 - 6 * Math.sin(x / 70 + 1.3) - 3 * fbm(x / 30, 8, 3), { col: o.groundCol || mix(m.mid, m.far, .3), grad: m.near, gradH: 40, rim: shade(m.rim, -.25), ripple: 5, rippleCol: shade(o.groundCol || m.mid, .15), seed: 8 });
            if (o.caravan) {
              const lamps = caravan(px, 250, 7, x => 190 - 6 * Math.sin(x / 70 + 1.3) - 3 * fbm(x / 30, 8, 3) + 1, m.near, { lamps: true, gap: 21, walker: true });
              px._lamps = lamps;
            }
          }
        }, (c) => { if (o.caravan) for (let i = 0; i < 4; i++) lampAt(c, 263 + i * 42, 184, '#ffc070', 12, .55); if (o.midPost) o.midPost(c); }),
        lay(.85, (px, r) => {
          land(px, x => 206 + 8 * Math.sin(x / 60 + .4) + 3 * fbm(x / 25, 12, 3), { col: m.near, grad: '#000000', gradH: 30, rim: shade(m.mid, .1), seed: 12 });
          if (o.plants !== false) { ART.tree(px, 28, 210, 52, 'saxaul', { trunk: m.near, trunkHi: shade(m.mid, .2), mid: shade(m.near, .1), lo: m.near }, 5); ART.tree(px, 482, 212, 44, 'dead', { trunk: m.near, trunkHi: shade(m.mid, .15) }, 9); }
        })
      ],
      fx: o.fx || [FX.dust(18, shade(m.haze, .4))]
    };
  };

  /* =====================================================================
     CLOSE PICTURES — painted at half resolution (260x142, 1x people)
     and blown up 2x: the camera is closer, the pixels stay one size.
     Visible: x 10..250, y 4..138; people stand on GD = 98.
     ===================================================================== */
  const W = 260, H = 142, GD = 98;
  const half = def => Object.assign(def, { k: 2 });

  /* ---------- 2. A Tail street facing the camera ---------- */
  SC.tail = o => {
    const m = PAL[o.mood || 'night'];
    const day = o.mood === 'day' || o.mood === 'morning';
    const wall = o.wall || (day ? '#b08a68' : o.mood === 'grey' ? '#6a6460' : '#6a4c3a');
    return half({
      layers: [
        lay(.04, px => { sky(px, m.sky, { stars: o.mood === 'night' ? 110 : o.mood === 'dusk' || o.mood === 'grey' ? 14 : 0, starH: .4, moon: o.moon === false ? null : (o.moon || (o.mood === 'night' ? { x: 196, y: 16, r: 4, halo: m.rim } : null)), sun: o.sun, glow: o.glow || [{ x: 130, y: 76, rx: 160, ry: 40, col: m.haze, a: .5 }], seed: 5 }); if (!(o.mood === 'night')) streaks(px, 7, 8, 44, [m.sky[2], m.sky[3]], 4, { a: .3, w0: 20, w1: 60, h: 2 }); }),
        lay(.18, (px, r) => {
          ART.fortWall(px, 186, 270, 34, 12, { lo: shade(m.far, -.2), mid: m.far, hi: shade(m.far, .15), win: m.win }, { lx: -1, step: 24, br: 5, lit: !day });
          tailRow(px, r, { m, wall: mix(wall, m.far, .55), by: 76, slope: x => -x * .15 + 6, hw: [7, 12], hh: [7, 13], lit: o.lit == null ? .35 : o.lit * .8, doors: false, wp: .4, ww: 1, wh: 1, wsx: 3, wsy: 4, fillDown: 60 });
          fade(px, m.haze, .3);
        }),
        lay(.42, (px, r) => {
          px._doors = tailRow(px, r, { m, wall, by: GD, hw: [26, 40], hh: [40, 66], lit: o.lit == null ? .45 : o.lit, doorLit: o.doorLit, dw: 11, dh: 22, ww: 3, wh: 4, wsx: 9, wsy: 12, fillDown: 60, roofs: true });
          land(px, x => GD, { col: o.street || mix(shade(wall, -.45), m.mid, .5), grad: m.near, gradH: 26, tex: shade(wall, -.6), texT: .6, texF: .4 });
          for (let x = 0; x < W; x++) px.set(x, GD, P32(shade(wall, -.2)));
          if (o.boards) for (const [dx, by, dw, dh] of px._doors) for (const yy of [by - dh + 5, by - 7]) for (let k = -2; k < dw + 2; k++) { px.set(dx + k, yy + RD(k * .25), P32('#8a6a44')); px.set(dx + k, yy + 1 + RD(k * .25), P32('#5a3a24')); }
          if (o.chalk) for (const [dx, by, dw, dh] of px._doors) { px.set(dx + 3, by - dh - 3, P32('#e8e0d0')); px.set(dx + 4, by - dh - 2, P32('#e8e0d0')); px.set(dx + 5, by - dh - 3, P32('#e8e0d0')); px.set(dx + 7, by - dh - 3, P32('#e8e0d0')); }
          if (o.cracks) for (let i = 0; i < 24; i++) { let x = r.int(0, W), y = r.int(GD + 2, H); for (let k = 0; k < 10; k++) { px.set(x, y, P32(shade(wall, -.7))); x += r.int(-1, 1) + (k & 1); y += r.int(0, 1); } }
          if (o.tree) ART.tree(px, o.tree[0], GD, o.tree[1], o.tree[2] || 'apricot', { lo: '#2e4a24', mid: '#4a6a30', hi: '#7a9a40', deep: '#1a2a14', trunk: '#4a3424', trunkHi: '#7a5a3a', bloom: '#f0a030', bloom2: '#f8c860' }, 31, { lx: -1 });
          if (o.sand) land(px, x => GD - 10 + 8 * Math.sin(x / 30) + 4 * fbm(x / 20, 3, 3), { col: '#9a7454', grad: '#5a4030', rim: '#e8b890', ripple: 4, seed: 4 });
        }, (c, r) => {
          if (o.lamps) for (const x of o.lamps) lampAt(c, x, 60, '#ffd27a', 14, .7);
          if (o.post) o.post(c, r);
        }),
        lay(.9, (px, r) => {
          if (o.frame !== false) {
            land(px, x => (x < 16 ? 14 + x * .3 : x > 244 ? 24 - (x - 244) * .4 : 999), { col: shade(m.near, .05), grad: '#000000', gradH: 120 });
            land(px, x => 120 + 2 * Math.sin(x / 20), { col: m.near });
          }
        }, o.nearPost)
      ],
      fx: o.fx || [FX.dust(10, '#c8b8a0')]
    });
  };

  /* ---------- 3. A doorway up close ---------- */
  SC.door = o => {
    const m = PAL[o.mood || 'night'];
    const wall = o.wall || '#5e4636';
    const DX = 117, DW = 26, DT = 56;
    return half({
      layers: [
        lay(.04, px => sky(px, m.sky, { stars: 70, starH: .3, moon: { x: 40, y: 14, r: 4, halo: m.rim }, seed: 13 })),
        lay(.3, (px, r) => {
          for (const [x0, x1, top, col] of [[-4, 60, 22, shade(wall, -.35)], [208, W + 4, 14, shade(wall, -.3)]]) for (let y = top; y < GD + 2; y++) for (let x = x0; x < x1; x++) { let c = col; if (y < top + 2) c = shade(col, .2); else if ((y % 5) === 4 && hash(x >> 2, y, 6) < .5) c = shade(col, -.12); px.set(x, y, P32(c)); }
          for (let x = 54; x < 214; x++) { px.set(x, 5, P32(shade(wall, .2))); if (x % 4 === 1) px.set(x, 4, P32(shade(wall, .1))); }
          for (let y = 6; y < GD + 2; y++) for (let x = 54; x < 214; x++) {
            let c = wall;
            if ((y % 5) === 4 && hash(x >> 2, y, 4) < .6) c = shade(wall, -.15);
            if (hash(x, y, 9) < .05) c = shade(wall, -.25);
            if (x < 56) c = shade(wall, .15);
            if (y < 9) c = shade(wall, -.3);
            c = mix(c, '#05030a', cl(Math.abs(x - 130) / 140, 0, 1) * .5);
            px.set(x, y, P32(c));
          }
          for (let y = DT - 6; y < GD; y++) for (let x = DX - 5; x < DX + DW + 5; x++) {
            const t = (y - (DT - 6)) / 13, hw = (DW / 2 + 5) * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1);
            if (Math.abs(x + .5 - (DX + DW / 2)) < hw) px.set(x, y, P32(shade(wall, -.35)));
          }
          for (let y = DT; y < GD - 2; y++) for (let x = DX; x < DX + DW; x++) {
            const t = (y - DT) / 11, hw = (DW / 2) * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1);
            if (Math.abs(x + .5 - (DX + DW / 2)) >= hw) continue;
            let c = o.open ? '#120a08' : '#4a2e1c';
            if (!o.open) {
              const lx = x - DX;
              if (lx === DW / 2 || lx === DW / 2 - 1) c = '#2a180e';
              else if ((lx % 6) === 2 || ((y - DT) % 9) === 3) c = '#6a4428';
              else if (hash(lx, y, 3) < .1) c = '#3a2214';
              if ((lx === DW / 2 - 3 || lx === DW / 2 + 2) && y === DT + 20) c = '#e2b452';
            }
            px.set(x, y, P32(c));
          }
          if (o.open) for (let y = DT + 8; y < GD - 2; y++) for (let x = DX + 3; x < DX + DW - 3; x++) px.blend(x, y, '#ffb050', .1 + .35 * (y - DT - 8) / (GD - DT - 10));
          px.rect(DX - 7, GD - 3, DW + 14, 3, P32(shade(wall, -.12))); px.rect(DX - 7, GD - 3, DW + 14, 1, P32(shade(wall, .2)));
          px.rect(DX - 12, GD, DW + 24, 3, P32(shade(wall, -.3)));
          for (let y = 44; y < 60; y++) for (let x = 164; x < 180; x++) { let c = '#160e0a'; if (((x - 164) % 4 === 0) || ((y - 44) % 4 === 0)) c = '#6a4a30'; else if (o.winLit) c = (y < 48 ? '#ffe0a0' : '#ffb860'); px.set(x, y, P32(c)); }
          land(px, x => GD + 3, { col: mix(shade(wall, -.5), m.mid, .5), grad: m.near, gradH: 26, tex: shade(wall, -.65), texT: .6 });
        }, (c, r) => {
          if (o.winLit) glow(c, 172, 52, 16, '#ffb050', .4);
          if (o.lamp !== false) lampAt(c, 104, 46, '#ffd27a', 18, .65);
          if (o.post) o.post(c, r);
        }),
        lay(.8, (px, r) => {
          for (let y = 0; y < H; y++) for (let x = 0; x < 30 - RD(y * .04); x++) px.set(x, y, P32(mix(m.near, '#000000', x / 60)));
          for (let y = 0; y < H; y++) for (let x = 234 + RD(y * .03); x < W; x++) px.set(x, y, P32(m.near));
          for (let i = 0; i < 60; i++) { const x = 28 + r.int(-5, 6), y = r.int(0, 80); px.set(x, y, P32(r.chance(.5) ? '#1a2414' : '#24301a')); }
        })
      ],
      fx: o.fx || [FX.dust(8, '#c8b8a0'), FX.flame(104, 46, .3, .5)]
    });
  };

  /* ---------- 4. The Well of the Singers ---------- */
  SC.well = o => {
    const m = PAL[o.mood || 'night'];
    const light = o.light === undefined ? '#4fe8d8' : o.light;
    const day = o.mood === 'day' || o.mood === 'morning';
    const wall = o.wall || (day ? '#c8b494' : mix('#a89a88', m.mid, .45));
    return half({
      layers: [
        lay(.04, px => { sky(px, m.sky, { stars: o.mood === 'night' ? 120 : 0, starH: .5, moon: o.moon, glow: o.glow || [{ x: 130, y: 60, rx: 140, ry: 36, col: m.haze, a: .5 }], seed: 9 }); if (day) streaks(px, 6, 4, 30, ['#e8ecf0', '#c8d4e0'], 6, { a: .4, w0: 20, w1: 50, h: 2 }); }),
        lay(.16, (px, r) => {
          const w2 = mix(wall, m.far, .35);
          ART.dome(px, 131, 38, 27, o.mood === 'night' ? DOME_TURQ : DOME_BLUE, { kind: 'melon', ribs: 12, lx: -1, tiles: true, drumWin: m.win });
          ART.minaret(px, 62, 40, 36, 8, 6, mkMin(w2, m), { lx: -1, bands: 6, brick: true, lit: !day, lantern: 5 });
          ART.minaret(px, 200, 40, 32, 7, 5, mkMin(w2, m), { lx: -1, bands: 6, brick: true, lit: !day, lantern: 4 });
          fade(px, m.haze, .12);
        }),
        lay(.34, (px, r) => {
          arcade(px, -6, W + 6, 34, 74, { wall, step: 26, aw: 17, ah: 30, tile: '#1d4c9a', tile2: '#2fb3b8', cornice: shade(wall, -.3), trim: shade(wall, .22), fillArch: (x, y) => mix(day ? '#3a2a24' : '#0c0a14', day ? '#5a4232' : '#1a1424', cl((y - 44) / 30, 0, 1) * .6) });
          land(px, x => 74, { col: shade(wall, -.38), grad: m.near, gradH: 50, tex: shade(wall, -.48), texF: .4, texT: .6 });
          for (let y = 76; y < H; y += 3) for (let x = 0; x < W; x++) if ((((x - 131) * (1 + (y - 74) * .05) | 0) % 14) === 0) px.tint(x, y, '#000000', .25);
          if (o.flood) { land(px, x => 80, { col: '#0a1c26' }); reflect(px, 80, H, day ? '#4a6a7a' : '#0a2a3a', .5, { lines: true, seed: 4, squash: 1 }); }
        }, (c, r) => {
          if (!day) for (const x of [23, 75, 127, 179, 231]) lampAt(c, x, 50, '#ffd27a', 9, .5);
        }),
        lay(.6, null, (c, r) => {
          c.translate(0, -8);
          if (o.post) o.post(c, r);
          if (!o.flood && o.well !== false) wellMouth(c, o.wellX || 131, 102, o.wellR || 34, { light, stone: o.stone || (day ? '#8a7a70' : '#4a4456'), water: o.wellWater });
          if (o.front) o.front(c, r);
        }),
        lay(.92, (px, r) => {
          if (o.frame !== false) for (const [x0, x1] of [[0, 18], [242, W]]) for (let y = 0; y < H; y++) for (let x = x0; x < x1; x++) { const e = x0 === 0 ? x1 - x : x - x0; px.set(x, y, P32(mix(m.near, shade(wall, -.6), e < 2 ? .5 : .15))); }
        })
      ],
      fx: o.fx || [FX.motes(96, 40, 166, 88, light || '#ffe2a8', 18)]
    });
  };

  /* ---------- 5. A vaulted cellar of tumars ---------- */
  SC.cellar = o => {
    const brick = o.brick || '#4a3428';
    const niches = [];
    for (let row = 0; row < 2; row++) for (let col = 0; col < 5; col++) { const nx = 16 + col * 48, ny = 14 + row * 34; if (row === 1 && col === 2) continue; niches.push([nx, ny]); }
    return half({
      layers: [
        lay(.15, (px, r) => {
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            let c = brick;
            const row = FL(y / 3), off = (row & 1) * 3;
            if (y % 3 === 2 || (x + off) % 6 === 5) c = shade(brick, -.3);
            else if (hash((x + off) >> 3, row, 5) < .2) c = shade(brick, .08);
            c = mix(c, '#05030a', cl(Math.abs(x - 130) / 150, 0, 1) * .55 + cl((y - 30) / 110, 0, 1) * .3);
            px.set(x, y, P32(c));
          }
          for (const [nx, ny] of niches) {
            for (let y = ny; y < ny + 26; y++) for (let x = nx; x < nx + 34; x++) {
              const t = (y - ny) / 9, hw = 17 * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1);
              if (Math.abs(x + .5 - nx - 17) < hw) px.set(x, y, P32(mix('#0c0806', shade(brick, -.5), (y - ny) / 40)));
            }
            px.rect(nx, ny + 25, 34, 2, P32(shade(brick, .12)));
          }
          // the passage arch in the middle
          for (let y = 50; y < GD; y++) for (let x = 108; x < 154; x++) { const t = (y - 50) / 14, hw = 23 * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1); if (Math.abs(x + .5 - 131) < hw) px.set(x, y, P32(mix('#050304', '#140c08', (y - 50) / 50))); }
          land(px, x => 94, { col: '#2a1e18', grad: '#0a0604', gradH: 40, tex: '#1a120e', texT: .6 });
        }, (c, r) => {
          const cols = o.dark ? ['#3a3036', '#2a2228', '#4a3e40'] : ['#ffc860', '#7fe8dc', '#ff9ab0', '#c8b0ff', '#ffe0a0'];
          for (const [nx, ny] of niches) {
            const n = o.sparse ? 0 : r.int(4, 6);
            for (let i = 0; i < n; i++) { const x = nx + 6 + i * 5 + r.int(-1, 1), col = r.pick(cols); tumar(c, x, ny + 21, col, o.dark ? null : (r.chance(.35) ? col : null)); }
            if (!o.dark && n) glow(c, nx + 17, ny + 18, 18, '#ffc070', .12);
          }
          if (o.one) { tumar(c, 160, 35, '#ffd060', '#ffd060'); glow(c, 160, 36, 18, '#ffd060', .5); }
          if (o.lamp !== false) lampAt(c, o.lampX || 96, 60, '#ffc070', 26, .55);
          if (o.shaft) {
            c.save(); c.globalCompositeOperation = 'lighter';
            const g = c.createLinearGradient(160, 0, 120, 100); g.addColorStop(0, 'rgba(255,220,170,0.38)'); g.addColorStop(1, 'rgba(255,220,170,0)');
            c.fillStyle = g; c.beginPath(); c.moveTo(156, 0); c.lineTo(172, 0); c.lineTo(150, 98); c.lineTo(112, 98); c.closePath(); c.fill(); c.restore();
            for (let k = 0; k < 4; k++) R(c, 157 + k * 4, 0, 1, 3, '#1a1210');
          }
          if (o.post) o.post(c, r);
        }),
        lay(.7, (px, r) => {
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const t = y / 36, hw = 150 * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1);
            if (Math.abs(x + .5 - 130) > hw - 2 || x < 6 || x > 254) px.set(x, y, P32('#0a0605'));
          }
        }, (c, r) => {
          if (o.jars) { jar(c, 30, 100, '#6a3a22'); jar(c, 38, 101, '#5a3020'); jar(c, 226, 101, '#6a3a22'); }
          if (o.fg) o.fg(c, r);
        })
      ],
      fx: o.fx || [FX.motes(30, 20, 230, 94, '#ffe2a8', 14)]
    });
  };

  /* ---------- 6. The Ark hall, a feast ---------- */
  SC.hall = o => half({
    layers: [
      lay(.12, (px, r) => {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          let c = mix('#3a1a1e', '#120608', cl(y / 110, 0, 1));
          if (y > 22 && y < 84 && ((x % 34) > 4 && (x % 34) < 30)) {
            const lx = x % 34, ly = y - 22, d = Math.hypot(lx - 17, (ly - 31) * .7);
            c = '#5a1820';
            if (d < 10 && d > 8) c = '#e2b452'; else if (d < 6) c = (hash(x, y, 4) < .5 ? '#a8303e' : '#c84a40'); else if ((lx + ly) % 6 === 0) c = '#7a2a2a';
            if (lx === 5 || lx === 29) c = '#e2b452';
            c = mix(c, '#000000', .35 + .2 * (y / 100));
          }
          px.set(x, y, P32(c));
        }
        for (let x = 0; x < W; x++) for (let k = 0; k < 6; k++) if (((x + k * 2) % 6) < 4 - k / 2) px.set(x, 14 + k, P32(k < 2 ? '#e2b452' : '#8a5a2a'));
        land(px, x => 90, { col: '#3a1418', grad: '#0e0406', gradH: 40 });
        for (let y = 92; y < 120; y++) for (let x = 20; x < 240; x++) if (((x + y) % 5) === 0 || ((x - y + 400) % 5) === 0) px.tint(x, y, '#c84a40', .25);
      }, (c, r) => {
        for (const x of [30, 80, 130, 180, 230]) { R(c, x, 0, 1, 22 + (x % 3) * 3, '#5a3a1a'); lampAt(c, x, 26 + (x % 3) * 3, '#ffc860', 20, .55); }
        for (const [x, y] of [[50, 96], [212, 96]]) { R(c, x - 14, y - 4, 28, 2, '#6a3a1a'); R(c, x - 11, y - 6, 4, 2, '#e8d8c0'); R(c, x - 4, y - 7, 6, 3, '#c88a3a'); R(c, x + 5, y - 6, 4, 2, '#e8d8c0'); }
        if (o.guests !== false) people(c, [['divan', 34, GD, { face: 1 }], ['auctioneer', 64, GD, { face: -1 }], ['divan', 198, GD, { face: 1 }], ['tillabek', 228, GD, { face: -1 }]]);
        if (o.post) o.post(c, r);
      }),
      lay(.75, (px, r) => {
        for (const cx of [10, 250]) for (let y = 0; y < H; y++) for (let x = cx - 6; x <= cx + 6; x++) {
          const n = (x - cx) / 6; let c = n < -.4 ? '#7a4a24' : n < .4 ? '#5a3418' : '#341c0c';
          if (y % 16 < 2) c = '#a8742e';
          if (y > 10 && y < 26) c = ((x + y) % 3 === 0) ? '#c8923a' : c;
          px.set(x, y, P32(mix(c, '#000000', .3)));
        }
      })
    ],
    fx: o.fx || [FX.motes(40, 20, 220, 90, '#ffd890', 12)]
  });

  /* ---------- 7. The Ark terrace above the night city ---------- */
  SC.terrace = o => {
    const m = PAL[o.mood || 'night'];
    return half({
      layers: [
        lay(.04, px => sky(px, m.sky, { stars: 140, starH: .55, moon: o.moon || { x: 186, y: 24, r: 5, halo: m.rim }, glow: [{ x: 130, y: 90, rx: 160, ry: 36, col: o.cityGlow || '#5a3a40', a: .7 }], seed: 17 }), c => { if (o.bird) birdShadow(c, o.moon ? o.moon.x : 186, o.moon ? o.moon.y : 24, 17, 'rgba(10,6,14,0.92)'); }),
        lay(.14, (px, r) => {
          land(px, x => 66 - 2 * Math.sin(x / 25), { col: '#0e0c1c', grad: '#06050c', gradH: 20 });
          for (let i = 0; i < 360; i++) { const x = r.int(0, W), y = r.int(68, 92), k = (y - 66) / 26; if (r.chance(.6)) px.set(x, y, P32(r.pick([m.win, m.winCore, '#ff9a50']), FL(110 + 145 * k))); }
          ART.dome(px, 60, 70, 9, DOME_BLUE, { kind: 'onion', ribs: 8, lx: 1, tiles: true });
          ART.minaret(px, 212, 70, 24, 5, 3, mkMin('#5a4a50', m), { lx: 1, bands: 5, lit: true, lantern: 3 });
          if (o.water) { land(px, x => 80, { col: '#04060e' }); reflect(px, 80, 108, '#0a1630', .5, { lines: true, seed: 6, squash: 1.2 }); }
        }),
        lay(.55, (px, r) => {
          const wall = o.wall || '#5a4234';
          for (let y = 82; y < H; y++) for (let x = 0; x < W; x++) {
            const top = 82 + (((x % 16) < 9) ? 0 : 4);
            if (y < top) continue;
            let c = wall; if (y === top) c = shade(wall, .25); else if ((y - top) % 5 === 4 && hash(x >> 2, y, 3) < .5) c = shade(wall, -.2);
            c = mix(c, '#000000', cl((y - 82) / 60, 0, 1) * .55);
            px.set(x, y, P32(c));
          }
          land(px, x => GD - 1, { col: '#2a1e1a', grad: '#0a0606', gradH: 30, tex: '#1a1210', texT: .62 });
        }, (c, r) => {
          lampAt(c, 238, 80, '#ffd27a', 20, .6);
          if (o.post) o.post(c, r);
        })
      ],
      fx: o.fx || [FX.stars(30, 70), FX.flame(238, 80, .55, .5)]
    });
  };

  /* ---------- 8. The desert ---------- */
  SC.desert = o => {
    const m = PAL[o.mood || 'night'];
    const sand = o.sand || (o.mood === 'night' ? '#3a3450' : o.mood === 'dawn' ? '#8a6458' : o.mood === 'grey' ? '#6a6060' : '#a87a50');
    const ridge = o.ridgeY || 92;
    return half({
      layers: [
        lay(.04, px => { sky(px, m.sky, { stars: o.mood === 'night' ? 160 : o.mood === 'dawn' ? 30 : 0, starH: .6, moon: o.moon === false ? null : (o.moon || (o.mood === 'night' ? { x: 196, y: 24, r: 6, halo: m.rim } : null)), sun: o.sun, glow: o.glow || [{ x: 150, y: 76, rx: 160, ry: 40, col: m.haze, a: .55 }], seed: 23 }); if (o.storm) haze(px, 20, 110, '#8a6a50', .55, 80); }),
        lay(.14, (px, r) => {
          land(px, duneTop(74, 6, 1.1, 60), { col: mix(sand, m.haze, .55), grad: mix(sand, m.far, .5), rim: mix(m.rim, sand, .4), rimSide: -1, seed: 3 });
          if (o.sunk) {
            skyline(px, r, { m, base: x => 74, wall: mix('#7a6a5a', m.far, .5), lit: 0, items: [['dome', 96, 9], ['minaret', 116, 24], ['dome', 142, 11], ['minaret', 168, 20]], x0: 900, x1: 900, sink: 5 });
            land(px, duneTop(79, 3, 2.3, 30), { col: mix(sand, m.haze, .5), grad: mix(sand, m.far, .4), seed: 4 });
          }
          if (o.wall) { ART.fortWall(px, 100, 170, 80, 22, { lo: '#5a4a40', mid: '#7a6450', hi: '#9a8064', win: '#ffd08a' }, { lx: -1, step: 24, br: 5 }); land(px, duneTop(79, 4, 2.8, 25), { col: mix(sand, m.haze, .35), grad: sand, seed: 6 }); }
          fade(px, m.haze, .12);
        }),
        lay(.4, (px, r) => {
          land(px, duneTop(ridge, 5, 2.4, 45), { col: sand, grad: shade(sand, -.35), gradH: 30, rim: shade(sand, .3), rimSide: -1, ripple: 4, rippleCol: shade(sand, -.12), seed: 7 });
          if (o.army) {
            const top = duneTop(ridge - 8, 5, 2.4, 45);
            for (let row = 0; row < 3; row++) for (let x = 14 + row * 4; x < 250; x += 7) {
              const y = RD(top(x)) - row * 3;
              ART.sprite(px, 'walker', x, y - 8, mix('#0a0810', m.far, row * .3));
            }
          }
        }, (c, r) => { if (o.midPost) o.midPost(c, r); }),
        lay(.7, (px, r) => {
          land(px, duneTop(101, 5, 4.2, 35), { col: shade(sand, -.45), grad: '#05040a', gradH: 20, rim: shade(sand, -.1), rimSide: -1, seed: 11 });
        }, (c, r) => { c.translate(0, -18); if (o.post) o.post(c, r); })
      ],
      fx: o.fx || (o.storm ? [FX.sand(50, '#c8a880')] : [FX.sand(14, shade(sand, .3)), FX.stars(20, 60)])
    });
  };

  /* ---------- 9. The new river ---------- */
  SC.river = o => {
    const m = PAL[o.mood || 'dusk'];
    const sand = o.sand || (o.mood === 'night' ? '#2a2638' : o.mood === 'grey' ? '#4a4648' : '#6a4a40');
    const WY = 86;
    return half({
      layers: [
        lay(.04, px => { sky(px, m.sky, { stars: o.mood === 'night' ? 140 : 10, starH: .5, moon: o.moon, sun: o.sun, glow: o.glow || [{ x: o.sunX || 150, y: 78, rx: 150, ry: 36, col: m.haze, a: .7 }], seed: 29 }); streaks(px, 8, 18, 66, [m.sky[2], m.sky[3], shade(m.haze, .1)], 31, { a: .4, w0: 20, w1: 70, h: 2 }); }),
        lay(.14, (px, r) => {
          land(px, x => 74 - 4 * fbm(x / 30, 2, 3), { col: mix(sand, m.haze, .5), grad: mix(sand, m.haze, .4) });
          if (o.sunk !== false) skyline(px, r, { m, base: x => 78, wall: mix('#7a6a5a', m.far, .55), lit: o.sunkLit || 0, items: o.sunkItems || [['dome', 60, 9], ['minaret', 80, 26], ['dome', 180, 11], ['minaret', 200, 18], ['portal', 222, 13]], x0: 900, x1: 900, sink: 4 });
          fade(px, m.haze, .2);
          land(px, x => 80, { col: m.sky[3] });
          reflect(px, 80, 98, m.sky[2], .35, { seed: 3, squash: 1.2, lines: true });
        }),
        lay(.4, (px, r) => {
          for (let y = WY - 2; y < H; y++) {
            const hw = 92 + (y - WY) * 1.6;
            for (let x = 0; x < W; x++) {
              if (Math.abs(x - 130) < hw) {
                const k = (y - WY + 2) / (H - WY);
                let c = mix(m.sky[3], m.sky[1], cl(k * 1.2, 0, 1));
                if ((y + RD(Math.sin(x * .1 + y) * 1.5)) % 4 === 0) c = mix(c, m.haze, .3);
                px.set(x, y, P32(c));
              } else px.set(x, y, P32(mix(sand, '#000000', cl((y - WY) / 60, 0, .7))));
            }
          }
          for (let x = 0; x < W; x++) { const e = RD(130 - (92 + 0)), y = WY - 2; if (Math.abs(x - 130) >= 92 && Math.abs(x - 130) < 94) px.set(x, y, P32(shade(sand, .2))); void e; }
          if (o.lightsInWater) for (let i = 0; i < 40; i++) { const x = r.int(70, 190), y = r.int(WY + 2, 116); px.set(x, y, P32(r.pick(['#ffd08a', '#ffb060', '#fff0c0']), r.int(120, 255))); }
          if (o.reeds) for (let i = 0; i < 26; i++) { const x = r.chance(.5) ? r.int(4, 50) : r.int(212, 256), y = WY + r.int(2, 14), h = r.int(4, 9); for (let k = 0; k < h; k++) px.set(x + RD(k * .15), y - k, P32(k > h - 2 ? '#8a6a3a' : '#2a3a20')); }
          if (o.dome) for (let y = WY + 3; y < WY + 20; y++) for (let x = 100; x < 160; x++) { const dx = (x - 130) / 28, dy = (y - (WY + 20)) / 16; if (dx * dx + dy * dy < 1) px.blend(x, y, '#1f8a90', .35 + (hash(x, y, 3) < .3 ? .15 : 0)); }
        }, (c, r) => {
          if (o.dome) glow(c, 130, WY + 12, 30, '#4fe8d8', .35);
          if (o.post) o.post(c, r);
        }),
        lay(.8, (px, r) => {
          land(px, x => (x < 52 ? 97 + RD(Math.sin(x / 9)) : x < 72 ? 97 + (x - 52) * .9 : x > 214 ? 98 + RD(Math.sin(x / 7)) : x > 194 ? 98 + (214 - x) * .9 : 200), { col: shade(sand, -.55), grad: '#05040a', gradH: 20, rim: shade(sand, -.2), seed: 15 });
        }, (c, r) => { if (o.nearPost) o.nearPost(c, r); })
      ],
      fx: o.fx || [FX.glints(60, WY, 200, 120, mix(m.haze, '#ffffff', .5), 30)]
    });
  };

  /* ---------- 10. The chaikhana under a chinar ---------- */
  SC.chai = o => {
    const m = PAL[o.mood || 'dusk'];
    return half({
      layers: [
        lay(.04, px => sky(px, m.sky, { stars: o.mood === 'night' ? 100 : 10, starH: .4, glow: [{ x: 60, y: 72, rx: 140, ry: 40, col: m.haze, a: .6 }], seed: 41 })),
        lay(.18, (px, r) => {
          tailRow(px, r, { m, wall: mix(o.grey ? '#6a6460' : '#7a5a44', m.far, .55), by: 80, hw: [9, 16], hh: [12, 24], lit: o.grey ? .1 : .4, doors: false, wp: .4, ww: 1, wh: 2, wsx: 4, wsy: 5, fillDown: 40 });
          fade(px, m.haze, .22);
        }),
        lay(.38, (px, r) => {
          const pal = o.grey ? { lo: '#2a2a2e', mid: '#3a3a40', hi: '#4a4a50', deep: '#18181c', trunk: '#3a3634', trunkHi: '#5a5650', bark: '#6a6660' } : { lo: '#1e2a1a', mid: '#2e4024', hi: '#4a6030', deep: '#121a10', rim: shade(m.rim, -.25), trunk: '#4a3a2e', trunkHi: '#7a6a58', bark: '#9a8a74' };
          ART.tree(px, 120, GD, 100, 'chinar', pal, 77, { lx: -1 });
          const wall = o.grey ? '#5a5450' : '#8a6a4c';
          for (let y = 50; y < GD; y++) for (let x = 170; x < W; x++) { let c = wall; if (y < 53) c = shade(wall, -.3); if (x < 171) c = shade(wall, .2); if (hash(x, y, 2) < .05) c = shade(wall, -.2); px.set(x, y, P32(c)); }
          for (const cx of [182, 212, 242]) for (let y = 53; y < GD; y++) { px.set(cx, y, P32('#3a2414')); px.set(cx + 1, y, P32('#6a4428')); }
          for (let y = 56; y < GD; y++) for (let x = 184; x < 260; x++) if ((x - 184) % 30 > 1 && (x - 184) % 30 < 28) px.set(x, y, P32(mix('#1a100a', '#3a2214', (y - 56) / 42)));
          land(px, x => GD, { col: '#3a2a20', grad: m.near, gradH: 34, tex: '#2a1c14', texT: .6 });
        }, (c, r) => {
          for (let k = 0; k < 2; k++) {
            const y0 = 44 + k * 7;
            for (let x = 20; x < 168; x++) R(c, x, y0 + RD(6 * Math.sin((x - 20) / 148 * PI)), 1, 1, '#2a1a10');
            if (!o.grey) for (let x = 30; x < 164; x += 22) lampAt(c, x, y0 + 2 + RD(6 * Math.sin((x - 20) / 148 * PI)), r.pick(['#ffd27a', '#ff9a50', '#7fe8dc']), 9, .5);
          }
          lampAt(c, 212, 62, '#ffd27a', 18, o.grey ? .25 : .6);
          tapchan(c, 36, GD, 52, { carpet: o.grey ? '#5a4a4a' : '#8a2a30' });
          if (o.second !== false) tapchan(c, 116, GD + 1, 40, { carpet: o.grey ? '#4a4648' : '#2a5a6a', table: false });
          samovar(c, 196, GD - 4); R(c, 184, GD - 4, 26, 4, '#4a2e1a'); R(c, 184, GD - 5, 26, 1, '#7a5432');
          if (o.post) o.post(c, r);
        }),
        lay(.85, (px, r) => { land(px, x => 120 + RD(Math.sin(x / 14)), { col: m.near, grad: '#000000', gradH: 10 }); })
      ],
      fx: o.fx || [FX.motes(20, 40, 166, 96, '#ffd890', 12), FX.flame(196, GD - 15, .38, .5)]
    });
  };

  /* ---------- 11. The gate at night ---------- */
  SC.gate = o => {
    const m = PAL[o.mood || 'night'];
    const wall = o.wall || (o.rich ? '#8a6a52' : '#5a4434');
    const gx = 130, gw = 38, gh = 52, top = 42;
    return half({
      layers: [
        lay(.04, px => sky(px, m.sky, { stars: o.mood === 'night' ? 120 : 16, starH: .5, moon: o.moon === false ? null : (o.mood === 'night' ? { x: 56, y: 20, r: 4, halo: m.rim } : null), sun: o.sun, glow: [{ x: 130, y: 60, rx: 160, ry: 30, col: m.haze, a: .5 }], seed: 51 })),
        lay(.2, (px, r) => {
          if (o.rich) { ART.dome(px, 190, 40, 15, DOME_BLUE, { kind: 'onion', ribs: 8, lx: -1, tiles: true }); ART.minaret(px, 70, 44, 32, 6, 4, mkMin('#7a6a60', m), { lx: -1, bands: 6, brick: true, lit: true, lantern: 4 }); }
          else tailRow(px, r, { m, wall: mix(wall, m.far, .6), by: 60, hw: [7, 12], hh: [8, 15], lit: .3, doors: false, ww: 1, wh: 1, wsx: 3, wsy: 4, fillDown: 30 });
          fade(px, m.haze, .25);
        }),
        lay(.42, (px, r) => {
          for (let y = top; y < GD; y++) for (let x = -6; x < W + 6; x++) {
            let c = wall;
            if ((y - top) % 6 === 5 && hash(x >> 2, y, 2) < .7) c = shade(wall, -.18);
            if (hash(x, y, 7) < .05) c = shade(wall, -.25);
            if (y < top + 2) c = shade(wall, .18);
            px.set(x, y, P32(c));
          }
          for (let x = -6; x < W + 6; x++) if ((x % 9) < 5) for (let k = 1; k <= 4; k++) px.set(x, top - k, P32(k === 4 ? shade(wall, .25) : wall));
          for (const bx of [gx - gw / 2 - 11, gx + gw / 2 + 11]) for (let y = top - 12; y < GD; y++) for (let x = bx - 9; x <= bx + 9; x++) { const n = (x - bx) / 9; px.set(x, y, P32(n < -.5 ? shade(wall, .15) : n > .5 ? shade(wall, -.3) : wall)); }
          for (const bx of [gx - gw / 2 - 11, gx + gw / 2 + 11]) for (let x = bx - 9; x <= bx + 9; x++) if (((x - bx + 20) % 5) < 3) { px.set(x, top - 13, P32(wall)); px.set(x, top - 14, P32(shade(wall, .25))); }
          for (let y = GD - gh; y < GD; y++) for (let x = gx - gw / 2 - 2; x < gx + gw / 2 + 2; x++) {
            const t = (y - (GD - gh)) / 18, hw = gw / 2 * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1);
            const dx = Math.abs(x + .5 - gx);
            if (dx < hw) {
              let c = o.open ? mix('#0a0810', m.haze, .3) : '#3e2616';
              if (!o.open) { if (dx < 1) c = '#1e1008'; else if ((x - gx + 40) % 5 === 0) c = '#2a180c'; if ((y % 14) === 0) c = '#5a3a1e'; if ((y % 14) === 1 && (x - gx + 40) % 5 === 2) c = '#c8a050'; }
              px.set(x, y, P32(c));
            } else if (dx < hw + 2) px.set(x, y, P32(shade(wall, .22)));
          }
          if (o.open) land(px, x => Math.abs(x - gx) < gw / 2 ? GD - 14 + 3 * Math.sin(x / 9) : 999, { col: mix(m.far, m.haze, .4) });
          if (o.rich) for (let y = 52; y < 72; y += 8) for (let x = 14; x < 250; x += 13) if (Math.abs(x - gx) > 40) px.rect(x, y, 3, 4, P32(r.chance(.7) ? m.win : shade(wall, -.5)));
          land(px, x => GD, { col: mix(shade(wall, -.5), m.mid, .4), grad: m.near, gradH: 30, tex: shade(wall, -.6), texT: .6 });
        }, (c, r) => {
          lampAt(c, gx - gw / 2 - 11, 58, '#ffd27a', 18, .7); lampAt(c, gx + gw / 2 + 11, 58, '#ffd27a', 18, .7);
          if (o.rich) for (let i = 0; i < 5; i++) glow(c, 30 + i * 50, 58, 14, '#ffb050', .3);
          if (o.post) o.post(c, r);
        }),
        lay(.85, (px, r) => { land(px, x => 122 + 2 * Math.sin(x / 15), { col: m.near }); })
      ],
      fx: o.fx || [FX.dust(8, '#c8b8a0'), FX.flame(gx - gw / 2 - 11, 58, .42, .45), FX.flame(gx + gw / 2 + 11, 58, .42, .45)]
    });
  };

  /* ---------- 12. The Heart, inside the Sleeper ---------- */
  SC.heart = o => half({
    layers: [
      lay(.1, (px, r) => {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const v = n2(x * .05, y * .08, 3) * .6 + n2(x * .16, y * .2, 4) * .4, d = Math.hypot((x - 130) / 130, (y - 56) / 80);
          let c = mix('#3a0e1e', '#120408', cl(d, 0, 1));
          if (v > .62) c = mix(c, '#6a1a2a', .5); else if (v < .3) c = mix(c, '#05020a', .5);
          if (((x + RD(Math.sin(y * .1) * 5)) % 24) < 1) c = shade(c, -.3);
          px.set(x, y, P32(c));
        }
        land(px, x => 94 + 3 * Math.sin(x / 20), { col: '#2a0a14', grad: '#080206', gradH: 30, rim: '#8a2a3a' });
      }, (c, r) => {
        glow(c, 130, 50, 56, '#ff4a5a', .35);
        c.fillStyle = '#7a1424'; c.beginPath(); c.ellipse(130, 50, 24, 28, 0, 0, PI * 2); c.fill();
        c.fillStyle = '#a82434'; c.beginPath(); c.ellipse(126, 46, 18, 21, 0, 0, PI * 2); c.fill();
        c.fillStyle = '#e04a4a'; c.beginPath(); c.ellipse(123, 42, 8, 10, 0, 0, PI * 2); c.fill();
        for (let i = 0; i < 6; i++) { let x = 130 + r.int(-16, 16), y = 50 + r.int(-16, 16); for (let k = 0; k < 22; k++) { R(c, x, y, 1, 1, '#ffb0a0'); x += r.int(-1, 1); y += r.int(-1, 1); } }
        glow(c, 125, 44, 22, '#ffd0c0', .35);
        for (const [x1, y1] of [[14, 10], [246, 14], [10, 84], [250, 80]]) heavyChain(c, 130 + (x1 < 130 ? -20 : 20), 50 + (y1 < 50 ? -14 : 14), x1, y1, 10, '#2a2228', '#8a7a7a', 3);
        if (o.post) o.post(c, r);
      })
    ],
    fx: [{ type: 'pulse', x: 130, y: 50, r: 40, col: '#ff5060', d: .1 }, FX.motes(70, 30, 190, 94, '#ff9a90', 12)]
  });

  /* ---------- 13. The road: salt flats and caravans ---------- */
  SC.road = o => {
    const m = PAL[o.mood || 'dusk'];
    const salt = o.salt || (o.mood === 'night' ? '#3a3a52' : '#d8c8b8');
    return half({
      layers: [
        lay(.04, px => { sky(px, m.sky, { stars: o.mood === 'night' ? 150 : o.mood === 'dawn' ? 24 : 0, starH: .5, moon: o.mood === 'night' ? { x: 56, y: 20, r: 4, halo: m.rim } : null, sun: o.sun, glow: [{ x: o.sunX || 166, y: 74, rx: 160, ry: 36, col: m.haze, a: .8 }], seed: 61 }); streaks(px, 8, 16, 60, [m.sky[2], m.sky[3]], 64, { a: .4, w0: 20, w1: 70, h: 2 }); }),
        lay(.12, (px, r) => {
          land(px, x => 72 - 12 * Math.pow(Math.max(0, Math.sin(x / 45 + 1)), 2) - 4 * fbm(x / 15, 6, 4), { col: mix(m.far, m.haze, .5), grad: mix(m.far, m.haze, .35), rim: m.rim });
          if (o.city) skyline(px, r, { m, base: x => 76, wall: mix('#7a6050', m.far, .5), lit: .4, items: [['dome', 44, 7], ['minaret', 58, 18], ['dome', 70, 5]], arkX: 30, x0: 20, x1: 86 });
          fade(px, m.haze, .2);
        }),
        lay(.35, (px, r) => {
          land(px, x => 78, { col: mix(salt, m.haze, .35), grad: shade(salt, -.25), gradH: 40, seed: 3 });
          for (let y = 80; y < H; y++) for (let x = 0; x < W; x++) { if (n2(x * .18, y * .5, 4) > .7) px.tint(x, y, '#ffffff', .2); if (Math.abs(x - 130 - (y - 78) * (o.roadSlope || -1.1)) < 2 + (y - 78) * .3) px.tint(x, y, shade(salt, -.4), .35); }
          if (o.caravan) caravan(px, o.cx || 70, o.cn || 6, o.cy || 88, o.ccol || '#1a1218', { gap: 18, flip: o.flip, walker: true });
        }, (c, r) => { if (o.midPost) o.midPost(c, r); }),
        lay(.7, (px, r) => {
          land(px, x => 96 + 2 * Math.sin(x / 25), { col: shade(salt, -.55), grad: '#06050a', gradH: 20, rim: shade(salt, -.3), seed: 9 });
        }, (c, r) => { c.translate(0, -14); if (o.post) o.post(c, r); })
      ],
      fx: o.fx || [FX.dust(14, shade(m.haze, .4)), FX.birds(3, 30)]
    });
  };

  /* ---------- 14. The karez ---------- */
  SC.karez = o => half({
    layers: [
      lay(.15, (px, r) => {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const dx = x - 130, dy = y - 56, d = Math.max(Math.abs(dx) / 1.6, Math.abs(dy) * 1.1 + Math.max(0, -dy) * .4);
          let c = mix('#4a3428', '#0a0604', cl(1 - d / 80, 0, 1));
          const ring = FL(Math.log(Math.max(2, d)) * 6);
          if ((ring & 1) && hash(FL(Math.atan2(dy, dx) * 12), ring, 3) < .5) c = shade(c, -.12);
          if (n2(x * .2, y * .2, 3) > .7) c = shade(c, .08);
          px.set(x, y, P32(c));
        }
        for (let y = 62; y < H; y++) { const hw = 3 + (y - 62) * .9; for (let x = RD(130 - hw); x < 130 + hw; x++) { let c = mix('#0a2a34', '#2a5a6a', (y - 62) / 80); if ((y + RD(Math.sin(x * .3) * 1.5)) % 4 === 0) c = shade(c, .25); px.set(x, y, P32(c)); } }
      }, (c, r) => {
        for (let k = 0; k < 5; k++) { const s = 1 - k * .18, x = 130 + (k & 1 ? 1 : -1) * 64 * s, y = 56 + 5 * s; lampAt(c, RD(x), RD(y), '#ffc070', RD(18 * s), .5 * s + .1); }
        glow(c, 130, 54, 16, '#ffe0b0', .25);
        if (o.post) o.post(c, r);
      })
    ],
    fx: [FX.motes(70, 30, 190, 96, '#ffd890', 12), FX.glints(100, 74, 160, 130, '#c8f0ff', 20)]
  });

  /* ---------- 15. A roof at night ---------- */
  SC.roof = o => {
    const m = PAL[o.mood || 'night'];
    const grey = o.grey;
    return half({
      layers: [
        lay(.03, px => { sky(px, m.sky, { stars: o.mood === 'night' ? 300 : o.mood === 'dawn' ? 30 : 0, starH: .75, moon: o.moon, glow: [{ x: 130, y: 100, rx: 160, ry: 40, col: m.haze, a: .5 }], seed: 71 }); if (o.mood === 'night') { const r = rngOf(4); for (let i = 0; i < 160; i++) { const t = r(), x = RD(20 + t * 220), y = RD(76 - t * 62 + (r() - .5) * 14 * (1 - Math.abs(t - .5))); px.blend(x, y, '#c8d0ff', .25 * r()); } } if (grey) fade(px, '#5a5866', .45); }),
        lay(.2, (px, r) => {
          tailRow(px, r, { m, wall: mix(grey ? '#5a5652' : '#6a4c3a', m.far, .55), by: 92, hw: [9, 16], hh: [10, 26], lit: grey ? .05 : .35, doors: false, ww: 1, wh: 2, wsx: 4, wsy: 5, fillDown: 60, roofs: true });
          ART.dome(px, 200, 74, 9, DOME_BLUE, { kind: 'onion', ribs: 8, lx: -1, tiles: true }); ART.minaret(px, 224, 80, 28, 5, 4, mkMin('#5a4a50', m), { lx: -1, bands: 5, lit: !grey, lantern: 3 });
          fade(px, m.haze, .3);
        }),
        lay(.55, (px, r) => {
          const roof = grey ? '#4a4646' : '#5a4034';
          for (let y = GD - 3; y < H; y++) for (let x = 0; x < W; x++) { let c = y < GD - 2 ? shade(roof, .25) : roof; if (hash(x, y, 2) < .08) c = shade(c, -.2); c = mix(c, '#000000', cl((y - GD) / 40, 0, 1) * .5); px.set(x, y, P32(c)); }
          for (let k = 0; k < 20; k++) { px.set(30 + (k >> 2), GD - 3 - k, P32('#3a2414')); px.set(36 + (k >> 2), GD - 3 - k, P32('#3a2414')); if (k % 4 === 0) for (let q = 0; q < 6; q++) px.set(30 + (k >> 2) + q, GD - 3 - k, P32('#4a2e1a')); }
        }, (c, r) => {
          jar(c, 210, GD - 2, grey ? '#4a4040' : '#7a4a2a');
          if (o.post) o.post(c, r);
        })
      ],
      fx: o.fx || [FX.stars(50, 76)]
    });
  };

  /* ---------- 16. Saffron fields ---------- */
  SC.saffron = o => {
    const m = PAL[o.mood || 'morning'];
    const HZ = 62;
    const flowerRows = (px, y0, y1, near) => {
      for (let y = y0, k = 0; y < y1; k++) {
        const t = (y - y0) / (y1 - y0), gap = 1 + RD(t * 4), sz = t < .35 ? 1 : t < .75 ? 2 : 3;
        for (let x = (k * 3) % 5; x < W; x += 2 + sz * 2 + (hash(x, y, 9) < .3 ? 1 : 0)) {
          if (hash(x, y, 5) < .18) continue;
          const pet = o.faded ? (hash(x, y, 6) < .5 ? '#e8a838' : '#f0c060') : (hash(x, y, 6) < .5 ? '#8a5ab8' : '#a878d0'), hi = o.faded ? '#f8d890' : '#c8a0e8';
          if (sz === 1) { px.set(x, y, P32(pet)); if (hash(x, y, 7) < .3) px.set(x, y - 1, P32('#e05a2a')); }
          else { px.rect(x, y - sz + 1, sz, sz, P32(pet)); px.set(x, y - sz, P32(hi)); px.set(x + sz - 1, y - sz, P32(hi)); px.set(x + (sz >> 1), y - (sz >> 1), P32('#e8502a')); if (sz === 3) px.set(x + 1, y + 1, P32('#3a5a2a')); }
        }
        y += gap + 1;
      }
    };
    return half({
      layers: [
        lay(.04, px => { sky(px, m.sky, { stars: 0, sun: o.sun || { x: 196, y: 50, r: 5 }, glow: [{ x: 196, y: 56, rx: 140, ry: 40, col: m.haze, a: .8 }], seed: 81 }); streaks(px, 7, 10, 46, ['#f0d0b0', '#c8a8b0'], 82, { a: .35, w0: 20, w1: 60, h: 2 }); if (o.faded) fade(px, '#e8b040', .55); }),
        lay(.14, (px, r) => {
          land(px, x => HZ - 12 * Math.pow(Math.max(0, Math.sin(x / 55 + .4)), 1.5) - 3 * fbm(x / 15, 2, 4), { col: mix('#6a5a78', m.haze, .45), grad: mix('#5a4a6a', m.haze, .3), rim: '#f0d0c0' });
          if (o.house !== false) { ART.house(px, 176, HZ + 2, 18, 10, housePal('#b89a78', m), r, { lx: 1, wp: .3, lit: 0, ww: 1, wh: 1 }); ART.tree(px, 200, HZ + 2, 22, 'poplar', { lo: '#3a4a3a', mid: '#4a5a44', hi: '#6a7a54' }, 3); }
          fade(px, m.haze, .15);
          if (o.faded) fade(px, '#e8a030', .5);
        }),
        lay(.38, (px, r) => {
          land(px, x => HZ + 2, { col: o.harvested ? '#6a5040' : '#4a3a4a', grad: o.harvested ? '#3a2a20' : '#2a1e28', gradH: 50 });
          // furrows converging to the house
          for (let y = HZ + 3; y < H; y++) for (let x = 0; x < W; x++) if ((((x - 185) / (1 + (y - HZ) * .35)) | 0) % 3 === 0) px.tint(x, y, '#000000', .18);
          if (!o.harvested) flowerRows(px, HZ + 4, H, false);
          else for (let y = HZ + 4; y < H; y += 2) for (let x = 0; x < W; x++) if (hash(x, y, 8) < .08) px.set(x, y, P32('#8a6a4a'));
          if (o.faded) fade(px, '#e8a030', .45);
        }, (c, r) => { if (o.post) o.post(c, r); }),
        lay(.8, (px, r) => {
          if (!o.harvested) for (let i = 0; i < 40; i++) { const x = r.int(0, W), y = r.int(110, H), pet = o.faded ? '#e8a838' : '#7a4aa8'; px.rect(x, y, 4, 3, P32(pet)); px.set(x + 1, y - 1, P32(o.faded ? '#f8d890' : '#b888e0')); px.set(x + 2, y - 1, P32(o.faded ? '#f8d890' : '#b888e0')); px.set(x + 2, y + 1, P32('#e8502a')); px.set(x + 2, y + 3, P32('#2a4a1a')); }
        }, (c, r) => { if (o.nearPost) o.nearPost(c, r); })
      ],
      fx: o.fx || [FX.motes(20, 40, 240, 96, '#ffe0a0', 16)]
    });
  };

  /* ---------- 17. The dream ---------- */
  SC.dream = o => {
    const m = PAL.dream;
    return half({
      layers: [
        lay(.03, px => sky(px, m.sky, { stars: 200, starH: .9, glow: [{ x: 130, y: 110, rx: 160, ry: 56, col: '#4fe8d8', a: .35 }, { x: 130, y: 20, rx: 100, ry: 30, col: '#a86a9a', a: .4 }], seed: 91 })),
        lay(.12, (px, r) => {
          const tmp = new Px(W, 60);
          skyline(tmp, r, { m, base: x => 50, wall: '#4a3a6a', lit: .6, items: [['dome', 60, 9], ['minaret', 86, 26], ['dome', 120, 13], ['minaret', 150, 22], ['portal', 176, 16], ['dome', 210, 8]], x0: 40, x1: 230 });
          for (let y = 0; y < 60; y++) for (let x = 0; x < W; x++) { const v = tmp.get(x, 59 - y); if (v >>> 24) px.d[y * W + x] = v; }
          fade(px, '#6a4a9a', .35);
          for (let y = 80; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot((x - 130) / 150, (y - 150) / 65); if (d < 1) px.blend(x, y, '#1a6a7a', .45 * (1 - d)); }
          for (const ex of [95, 165]) for (let k = -9; k <= 9; k++) px.set(ex + k, 100 + RD(k * k / 20), P32('#4fe8d8', 180));
        }),
        lay(.45, (px, r) => {
          for (const [x, y, w] of o.carpets || [[40, 60, 26], [190, 52, 22], [118, 84, 36]]) {
            for (let k = 0; k < w; k++) { const yy = y + RD(Math.sin(k / w * PI * 2)); px.set(x + k, yy, P32('#a8303e')); px.set(x + k, yy + 1, P32(k % 4 < 2 ? '#e2b452' : '#7a1a2a')); px.set(x + k, yy + 2, P32('#5a1020')); }
          }
        }, (c, r) => {
          for (const [x, y] of [[48, 56], [196, 48]]) lampAt(c, x + 8, y - 4, '#9ff3e6', 10, .45);
          if (o.post) o.post(c, r);
        })
      ],
      fx: [FX.motes(20, 10, 240, 120, '#c8fff6', 30), FX.stars(40, 130)]
    });
  };

  /* ---------- 18. The grave in the Ark court ---------- */
  SC.grave = o => {
    const m = PAL.dusk;
    return half({
      layers: [
        lay(.04, px => sky(px, m.sky, { stars: 16, starH: .3, sun: { x: 60, y: 74, r: 5, cut: 76 }, glow: [{ x: 60, y: 74, rx: 140, ry: 44, col: m.haze, a: .8 }], seed: 101 })),
        lay(.2, (px, r) => { ART.fortWall(px, -6, 266, 80, 26, { lo: '#3a1e22', mid: '#5a3030', hi: '#7a4a40', win: m.win }, { lx: 1, step: 36, br: 6, lit: true }); fade(px, m.haze, .15); }),
        lay(.45, (px, r) => {
          for (const x of [74, 96, 166, 188]) ART.tree(px, x, GD - 1, 42, 'cypress', { lo: '#10140e', mid: '#1a2216', hi: '#2a3420' }, x);
          land(px, x => GD - 1, { col: '#3a2422', grad: '#0c0606', gradH: 30, tex: '#2a1816', texT: .6 });
        }, (c, r) => {
          R(c, 124, 72, 14, 24, '#c89a38'); R(c, 125, 70, 12, 2, '#c89a38'); R(c, 127, 68, 8, 2, '#c89a38');
          R(c, 124, 72, 2, 24, '#f2d48a'); R(c, 136, 72, 2, 24, '#8a6420');
          for (let y = 76; y < 92; y += 3) R(c, 128, y, 6, 1, '#8a6420');
          glow(c, 131, 82, 26, '#ffc040', .35);
          R(c, 118, 96, 26, 2, '#5a4030');
          if (o.post) o.post(c, r);
        })
      ],
      fx: [FX.motes(100, 60, 160, 96, '#ffe090', 12), FX.birds(3, 26)]
    });
  };

  /* ---------- 19. An empty bazaar at dusk ---------- */
  SC.bazaar = o => {
    const m = PAL[o.mood || 'dusk'];
    return half({
      layers: [
        lay(.04, px => sky(px, m.sky, { stars: 10, glow: [{ x: 130, y: 66, rx: 160, ry: 40, col: m.haze, a: .6 }], seed: 111 })),
        lay(.2, (px, r) => {
          const wall = mix('#8a6a52', m.far, .45);
          for (let y = 52; y < 86; y++) for (let x = 92; x < 168; x++) px.set(x, y, P32(hash(x, y, 2) < .06 ? shade(wall, -.15) : wall));
          ART.dome(px, 130, 52, 22, domePal(shade(wall, -.35), wall, shade(wall, .2)), { kind: 'bowl', lx: -1 });
          for (const dx of [104, 148]) ART.dome(px, dx + 4, 52, 7, domePal(shade(wall, -.35), wall, shade(wall, .2)), { kind: 'bowl', lx: -1 });
          for (let y = 62; y < 86; y++) for (let x = 118; x < 142; x++) { const t = (y - 62) / 7, hw = 12 * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1); if (Math.abs(x + .5 - 130) < hw) px.set(x, y, P32('#1a0e0c')); }
          fade(px, m.haze, .2);
        }),
        lay(.45, (px, r) => {
          for (const side of [-1, 1]) for (let i = 0; i < 3; i++) {
            const x0 = side < 0 ? 4 + i * 30 : 166 + i * 30, w = 27;
            for (let y = 58; y < GD; y++) for (let x = x0; x < x0 + w; x++) {
              let c = '#5a3e2c'; if (y < 62) c = ((x >> 1) & 1) ? '#8a2a30' : '#d8c8a8'; else if (y < 64) c = '#2a1a12'; else if ((x - x0) % 5 === 0) c = '#3a2418'; else if (y > GD - 16 && y < GD - 14) c = '#7a5432';
              px.set(x, y, P32(mix(c, '#000000', .2 + .1 * (side < 0 ? 2 - i : i))));
            }
          }
          land(px, x => GD, { col: '#3a2a24', grad: '#0a0606', gradH: 30, tex: '#2a1c18', texT: .6 });
          for (let i = 0; i < 18; i++) px.rect(r.int(30, 230), r.int(GD + 2, GD + 16), 2, 1, P32(r.pick(['#a8303e', '#e2b452', '#6a4a2a'])));
        }, (c, r) => { if (o.post) o.post(c, r); })
      ],
      fx: [FX.dust(12, '#e8c8a0')]
    });
  };

  /* ---------- 20. A room with a window ---------- */
  SC.room = o => {
    const m = PAL[o.mood || 'night'];
    const wall = o.wall || '#6a5040';
    const wx = o.winX || 110, ww = o.winW || 64, wy = 18, wh = 62;
    return half({
      layers: [
        lay(.06, px => {
          sky(px, m.sky, { stars: o.mood === 'night' ? 160 : 0, starH: .8, moon: o.moon || (o.mood === 'night' ? { x: 156, y: 30, r: 4, halo: m.rim } : null), glow: [{ x: 150, y: 74, rx: 100, ry: 36, col: m.haze, a: .5 }], seed: 121 });
          if (o.view === 'desert') { const top = duneTop(74, 5, 2, 35); land(px, top, { col: '#2a2638', grad: '#141220', rim: '#6a6a9a', seed: 2 }); if (o.walkers) for (let i = 0; i < 4; i++) ART.sprite(px, 'walker', 124 + i * 7, RD(top(124 + i * 7)) - 8, '#0a0812'); }
          else { land(px, x => 78 - 3 * Math.sin(x / 20), { col: mix('#3a2e3a', m.haze, .3), grad: '#1a1420' }); }
        }),
        lay(.3, (px, r) => {
          for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
            const inWin = x >= wx && x < wx + ww && y >= wy && y < wy + wh && (y > wy + 10 || Math.abs(x + .5 - wx - ww / 2) < (ww / 2) * Math.sqrt(Math.max(0, 1 - Math.pow(1 - (y - wy) / 10, 2))));
            if (inWin) { if (o.lattice !== false && (((x - wx) % 8 === 0) || ((y - wy) % 8 === 0))) px.set(x, y, P32('#2a1a10')); continue; }
            let c = wall;
            if (hash(x >> 1, y >> 1, 3) < .1) c = shade(wall, -.12);
            c = mix(c, '#000000', cl(Math.abs(x - (o.lightX || 70)) / 190 + y / 300, 0, .85));
            px.set(x, y, P32(c));
          }
          for (const nx of [18, 204]) for (let y = 34; y < 56; y++) for (let x = nx; x < nx + 20; x++) { const t = (y - 34) / 7, hw = 10 * (t < 1 ? Math.sqrt(Math.max(0, 1 - (1 - t) * (1 - t))) : 1); if (Math.abs(x + .5 - nx - 10) < hw) px.set(x, y, P32('#1a100c')); }
          land(px, x => 90, { col: '#2a1c16', grad: '#080404', gradH: 30 });
          for (let y = 92; y < 114; y++) for (let x = 30; x < 230; x++) { let c = (((x >> 1) + (y >> 1)) & 1) ? '#7a2a2a' : '#5a1a20'; if (y < 93 || y > 112 || x < 32 || x > 227) c = '#c8a050'; px.set(x, y, P32(mix(c, '#000000', .45))); }
        }, (c, r) => {
          jar(c, 28, 55, '#7a4a2a'); jar(c, 214, 55, '#2a6a7a');
          if (o.candle !== false) candle(c, o.candleX || 58, 88, .6);
          if (o.post) o.post(c, r);
        })
      ],
      fx: o.fx || [FX.motes(40, 40, 120, 90, '#ffd890', 8)]
    });
  };

  /* ---------- registry ---------- */
  const SCENE_OF = {};
  const def = (id, base, o) => { SCENE_OF[id] = () => SC[base](o || {}); };
  function buildScene(id) { const f = SCENE_OF[id]; return f ? f() : null; }

  /* =====================================================================
     VARIANTS: which picture for which line
     ===================================================================== */
  const kids = (c, x0, y, n, o) => { o = o || {}; for (let i = 0; i < n; i++) fig(c, KID[(i + (o.first || 0)) % 2], x0 + i * (o.gap || 9), y + (i & 1), { face: o.face || (i & 1 ? -1 : 1), ph: i * 9, rim: o.rim, dark: o.dark, alpha: o.alpha }); };
  const P = (c, list) => { for (const p of list) fig(c, p[0], p[1], p[2], p[3] || {}); };

  // --- the city (wide, full resolution)
  def('city:tithe', 'city', { mood: 'dawn', caravan: true, lit: .5, fx: [FX.dust(16, '#f0c8a0'), FX.birds(5, 60)] });
  def('city:chain', 'city', { mood: 'red', lit: .85, chain: true, glow: [{ x: 300, y: 170, rx: 280, ry: 100, col: '#a8401e', a: .75 }], fx: [FX.embers(300, 150, '#ffc050', 22), FX.dust(10, '#ffb080')] });
  def('city:awake', 'city', { mood: 'grey', sink: 1, water: true, waterCol: '#5a5866', plants: false, glow: [{ x: 260, y: 170, rx: 300, ry: 60, col: '#a89aa0', a: .5 }], fx: [FX.glints(120, 190, 420, 226, '#d8d0d8', 30), FX.birds(3, 70)] });
  def('city:tale', 'city', { mood: 'night', lit: .22, moon: { x: 120, y: 40, r: 9, halo: '#8a9ad8' }, glow: [{ x: 260, y: 196, rx: 320, ry: 70, col: '#2a3266', a: .7 }], midPost: c => {
    for (const [x, f, l] of [[92, 1, 'tailman'], [104, 1, 'child'], [132, -1, 'tailwoman'], [144, -1, 'tailman']]) fig(c, l, x, 192, { face: f, rim: '#ffb060', dark: ['#0a0812', .4] });
  }, fx: [FX.flame(118, 191, .5, .8), FX.motes(100, 60, 460, 180, '#ffe2a8', 34), FX.stars(40, 110)] });
  def('city:hollowSingers', 'city', { mood: 'grey', lit: .06, fx: [FX.ash(36)] });
  def('city:hollowDivan', 'city', { mood: 'red', lit: .8, chain: true, fx: [FX.embers(300, 150)] });
  def('city:hollowAwake', 'city', { mood: 'grey', sink: 1, water: true, waterCol: '#5a5866', plants: false, fx: [FX.glints(120, 190, 420, 226, '#d8d0d8', 30)] });
  def('city:hollowNone', 'city', { mood: 'dusk', lit: .3, eyeOpen: '#ff9a50', fx: [FX.sand(60, '#c89060')] });

  // --- the Tail
  def('tail:fight', 'tail', { mood: 'night', lamps: [40, 100, 160, 222], lit: .7, doorLit: .4, glow: [{ x: 130, y: 84, rx: 160, ry: 40, col: '#8a3a20', a: .55 }], post: c => {
    P(c, [['singer', 196, GD, { face: -1, rim: '#c8d0ff' }], ['singer', 210, GD + 1, { face: -1 }], ['inspector', 224, GD, { face: -1, rim: '#c8d0ff' }]]);
    P(c, [['tailman', 70, GD + 1, { face: 1, lamp: true, rim: '#ffc070' }], ['tailwoman', 90, GD, { face: 1, lamp: true, rim: '#ffc070' }], ['tailman', 112, GD + 2, { face: 1, rim: '#ffc070' }], ['tailman', 134, GD, { face: 1, rim: '#ffc070', lamp: true }], ['tailwoman', 152, GD + 1, { face: 1, rim: '#ffc070' }], ['child', 54, GD, { face: 1 }]]);
  }, fx: [FX.embers(110, GD - 16, '#ffb050', 18), FX.dust(8, '#ffc8a0')] });
  def('tail:hide', 'tail', { mood: 'night', boards: true, lit: .05, post: c => {
    c.fillStyle = '#4a3a30'; c.beginPath(); c.ellipse(150, GD + 6, 14, 4, 0, 0, PI * 2); c.fill();
    c.fillStyle = '#050304'; c.beginPath(); c.ellipse(150, GD + 6, 11, 3, 0, 0, PI * 2); c.fill();
    for (const [x, y] of [[145, GD + 6], [152, GD + 6]]) { R(c, x, y, 1, 1, '#e8f0ff'); R(c, x + 2, y, 1, 1, '#e8f0ff'); }
  } });
  def('tail:give', 'tail', { mood: 'grey', lit: .02, moon: false, post: c => {
    for (let i = 0; i < 8; i++) fig(c, i % 3 === 1 ? 'tailwoman' : i % 4 === 3 ? 'child' : 'hollow', 40 + i * 18, GD + (i & 1), { face: 1, ph: i * 5, dark: ['#6a6670', .25] });
    P(c, [['singer', 200, GD, { face: -1, rim: '#e8e8ff' }], ['inspector', 216, GD, { face: -1, rim: '#e8e8ff' }]]);
  }, fx: [FX.ash(18, '#b8b4bc')] });
  def('tail:refuse', 'tail', { mood: 'day', lit: 0, moon: false, cracks: true, sun: { x: 50, y: 18, r: 5 }, post: c => {
    R(c, 120, GD - 9, 20, 9, '#8a7058'); R(c, 120, GD - 10, 20, 1, '#b8987a'); R(c, 122, GD - 20, 1, 11, '#5a3a24'); R(c, 137, GD - 20, 1, 11, '#5a3a24'); R(c, 121, GD - 21, 18, 1, '#6a4428'); R(c, 129, GD - 20, 1, 5, '#3a2414'); R(c, 127, GD - 15, 4, 3, '#6a4428');
    P(c, [['tailman', 70, GD, { face: 1, rim: '#fff0d0' }], ['tailwoman', 92, GD + 1, { face: 1, rim: '#fff0d0' }], ['child', 104, GD, { face: 1 }], ['guard', 190, GD, { face: -1, rim: '#fff0d0' }]]);
  }, fx: [FX.dust(20, '#f0e0c0')] });
  def('tail:dig', 'tail', { mood: 'day', lit: 0, moon: false, wall: '#d8c8b0', sun: { x: 200, y: 16, r: 5 }, post: c => {
    for (const x of [74, 160]) { R(c, x - 8, GD - 1, 16, 2, '#6a5040'); R(c, x - 7, GD - 18, 1, 17, '#5a3a24'); R(c, x + 6, GD - 18, 1, 17, '#5a3a24'); R(c, x - 8, GD - 19, 16, 1, '#6a4428'); R(c, x, GD - 18, 1, 8, '#3a2414'); }
    R(c, 222, 44, 1, 54, '#3a2414'); R(c, 223, 45, 12, 16, '#8a1e2a'); R(c, 226, 50, 6, 1, '#e2b452'); R(c, 228, 54, 3, 3, '#e2b452');
    P(c, [['tailman', 92, GD, { face: -1, rim: '#fff0d0' }], ['tailman', 142, GD + 1, { face: 1, rim: '#fff0d0' }], ['guard', 206, GD, { face: -1, rim: '#fff0d0' }], ['tailman', 178, GD, { face: -1 }]]);
  }, fx: [FX.dust(20, '#fff0d8')] });
  def('tail:awake', 'desert', { mood: 'dawn', wall: true, ridgeY: 94, midPost: c => {
    for (let i = 0; i < 8; i++) { const x = 178 + i * 9, y = 96 + (i % 3), hx = x - 3, hy = y - 13; const x0 = 168, y0 = 62 + i * 2; const n = Math.max(1, hx - x0); for (let k = 0; k <= n; k++) R(c, x0 + k, y0 + (hy - y0) * k / n + 3 * Math.sin(k / n * PI), 1, 1, '#a8784a'); }
    for (let i = 0; i < 8; i++) fig(c, i % 3 ? 'tailman' : 'tailwoman', 178 + i * 9, 96 + (i % 3), { face: 1, ph: i * 3, rim: '#f2a878', dark: ['#1a1018', .3] });
    for (let i = 0; i < 3; i++) fig(c, i % 2 ? 'child' : 'tailman', 60 + i * 14, 97, { face: 1, ph: i * 5, rim: '#f2a878', dark: ['#1a1018', .45] });
  }, fx: [FX.sand(24, '#e8b090'), FX.dust(8, '#f2c8a0')] });
def('tail:stories', 'well', { mood: 'dusk', light: '#ffd08a', post: c => {
    for (let i = 0; i < 8; i++) fig(c, ['tailman', 'tailwoman', 'child', 'girl'][i % 4], 50 + i * 22 + (i > 3 ? 30 : 0), 92 + (i & 1), { face: i < 4 ? 1 : -1, lamp: i % 3 === 0, ph: i * 4, rim: '#ffc070' });
    fig(c, 'elder', 131, 91, { face: 1, talk: true, rim: '#ffd08a' });
  } });
  def('tail:doorstep', 'door', { mood: 'night', post: c => { tumar(c, 126, GD - 5, '#c8b090', null); tumar(c, 133, GD - 5, '#a89880', null); glow(c, 130, GD - 4, 8, '#ffd08a', .25); } });

  // --- Shirin
  def('shirin:tithe', 'well', { mood: 'night', post: c => fig(c, 'shirin', 131, 93, { face: -1, talk: true, rim: '#9ff3e6' }) });
  def('shirin:withNargiza', 'well', { mood: 'night', post: c => { fig(c, 'shirin', 143, 93, { face: -1, talk: true, rim: '#9ff3e6' }); fig(c, 'nargiza', 117, 93, { face: 1, rim: '#9ff3e6' }); } });
  def('shirin:chain', 'well', { mood: 'night', light: '#2a6a9a', moon: { x: 200, y: 18, r: 4, halo: '#8a98d8' }, front: c => {
    c.strokeStyle = 'rgba(200,240,255,0.5)'; c.lineWidth = 1;
    for (const r0 of [5, 11, 18]) { c.beginPath(); c.ellipse(131, 102, r0, r0 * .26, 0, 0, PI * 2); c.stroke(); }
    R(c, 136, 101, 5, 1, '#ece5d6'); R(c, 139, 102, 4, 1, '#c8bfae');
    heavyChain(c, 70, 18, 112, 100, 16, '#2a2228', '#7a6a6a', 3);
  }, fx: [FX.motes(96, 60, 166, 98, '#8ac0ff', 8)] });
  def('shirin:awake', 'well', { mood: 'grey', flood: true, light: null, post: c => {
    fig(c, 'shirin', 150, 98, { face: -1, rim: '#c8d0e0', dark: ['#2a2a34', .2], cut: 90 }); R(c, 140, 90, 20, 1, '#8aa8b8'); R(c, 144, 92, 12, 1, '#4a6a7a');
    fig(c, 'girl', 84, 96, { face: 1, alpha: .5, rim: '#c8fff6' }); glow(c, 84, 86, 12, '#9ff3e6', .35);
  }, fx: [FX.glints(20, 90, 240, 130, '#c8d8e0', 30)] });
  def('shirin:tale', 'well', { mood: 'night', light: '#ffd08a', post: c => {
    for (let i = 0; i < 6; i++) fig(c, ['tailman', 'tailwoman', 'child', 'girl'][i % 4], 72 + i * 23 + (i > 2 ? 26 : 0), 93 + (i & 1), { face: i < 3 ? 1 : -1, ph: i * 3, rim: '#ffc070' });
    fig(c, 'nargiza', 131, 91, { face: 1, talk: true, rim: '#ffd08a' });
    fig(c, 'shirin', 228, 84, { face: -1, rim: '#8a98d8', dark: ['#0a0812', .35] });
  } });

  // --- Tilla-bek
  def('tillabek:tithe', 'cellar', { post: c => { fig(c, 'tillabek', 116, 96, { face: 1, rim: '#ffd890' }); fig(c, 'singer', 148, 96, { face: -1, rim: '#ffd890' }); } });
  def('tillabek:accepted', 'terrace', { post: c => { fig(c, 'tillabek', 150, GD - 1, { face: -1, rim: '#8a98d8' }); fig(c, RAV, 112, GD - 1, { face: 1, rim: '#8a98d8' }); heavyChain(c, 118, 82, 70, 74, -4, '#2a2228', '#8a7a7a', 3); heavyChain(c, 70, 74, 24, 120, 14, '#2a2228', '#8a7a7a', 3); } });
  def('tillabek:refused', 'terrace', { bird: true, moon: { x: 176, y: 30, r: 14, halo: '#e8d8b0', haloA: .6 }, post: c => fig(c, 'tillabek', 164, GD - 1, { face: 1, rim: '#e8d8b0', dark: ['#120a14', .3] }) });
  def('tillabek:awake', 'cellar', { dark: true, shaft: true, lamp: false, post: (c, r) => {
    for (let i = 0; i < 26; i++) tumar(c, 80 + r.int(0, 110), 92 + r.int(0, 6), r.pick(['#3a3036', '#4a3e40', '#2a2228']), null);
    fig(c, 'tillabek', 131, 97, { face: 1, rim: '#ffe0b0', dark: ['#2a2020', .2] });
  }, fx: [FX.dust(20, '#ffe0c0')] });
  def('tillabek:tale', 'bazaar', { post: c => fig(c, 'tillabek', 130, GD, { face: 1, rim: '#f4a456' }) });

  // --- Oydin
  def('oydin:fled', 'room', { mood: 'night', view: 'desert', walkers: true, lightX: 50 });
  def('oydin:sung', 'well', { mood: 'day', light: null, post: c => { fig(c, OYDH, 131, 93, { face: 1, rim: '#fff0d0' }); P(c, [['tailman', 62, 94, { face: 1 }], ['tailwoman', 200, 94, { face: -1 }], ['child', 212, 95, { face: -1 }]]); }, fx: [FX.dust(14, '#fff0d8')] });
  def('oydin:voice', 'well', { mood: 'day', light: null, post: c => { fig(c, OYDH, 131, 93, { face: 1, rim: '#fff0d0' }); sadoWisp(c, 142, 66, .8); }, fx: [FX.dust(14, '#fff0d8')] });
  def('oydin:fire', 'desert', { mood: 'night', post: c => {
    P(c, [['rebel', 88, 112, { face: 1, rim: '#ffb060' }], ['rebel', 100, 113, { face: 1, rim: '#ffb060' }], ['rebel', 168, 113, { face: -1, rim: '#ffb060' }]]);
    fig(c, OYD, 150, 112, { face: -1, rim: '#ffb060', talk: true });
    fig(c, 'girl', 116, 112, { face: 1, alpha: .25, rim: '#9ff3e6' }); sadoWisp(c, 116, 96, .5);
  }, fx: [FX.flame(132, 94, .7, 1), FX.embers(132, 90, '#ffb050', 14), FX.stars(24, 60)] });
  def('oydin:army', 'desert', { mood: 'night', army: true, moon: { x: 70, y: 22, r: 6, halo: '#a8b8f0' }, post: c => fig(c, OYD, 131, 116, { face: 1, rim: '#a8b8f0' }) });
  def('oydin:girl', 'river', { mood: 'dusk', reeds: true, sun: { x: 166, y: 78, r: 5, cut: 80 }, sunX: 166, nearPost: c => { fig(c, OYDF, 34, 98, { face: 1, rim: '#f4a456' }); fig(c, 'girl', 48, 98, { face: -1, rim: '#f4a456' }); } });
  def('oydin:hand', 'river', { mood: 'night', lightsInWater: true, moon: { x: 196, y: 22, r: 4, halo: '#8a98d8' }, sunkLit: .6, post: c => {
    fig(c, OYDF, 122, 106, { face: 1, rim: '#ffd08a', cut: 95 }); fig(c, RAV, 140, 106, { face: -1, rim: '#ffd08a', cut: 95 });
    R(c, 112, 95, 8, 1, '#8a98c8'); R(c, 124, 96, 4, 1, '#ffd08a'); R(c, 134, 95, 10, 1, '#8a98c8'); R(c, 118, 97, 22, 1, '#3a4870');
  }, fx: [FX.glints(60, 88, 200, 120, '#ffd08a', 30)] });
  def('oydin:got', 'desert', { mood: 'dawn', sunk: true, post: c => fig(c, OYD, 168, 118, { face: -1, rim: '#f2a878' }) });
  def('oydin:apricots', 'tail', { mood: 'morning', lit: 0, moon: false, tree: [50, 80], post: c => {
    R(c, 74, 86, 60, 2, '#6a4a30'); R(c, 76, 88, 2, 10, '#4a2e1a'); R(c, 130, 88, 2, 10, '#4a2e1a');
    fig(c, OYDF, 96, 97, { face: 1, rim: '#ffe0b0' }); fig(c, RAV, 116, 97, { face: -1, rim: '#ffe0b0' });
    for (let i = 0; i < 3; i++) R(c, 103 + i * 2, 84, 1, 1, '#f0a030');
  }, fx: [FX.dust(14, '#fff0d8'), FX.birds(3, 24)] });
  def('oydin:hollow', 'tail', { mood: 'dusk', lit: .3, moon: false, post: c => { fig(c, OYD, 146, GD, { face: -1, rim: '#f4a456' }); fig(c, RAVH, 118, GD, { face: 1, rim: '#c8a8a0' }); } });
  def('oydin:hollowStranger', 'tail', { mood: 'dusk', lit: .3, moon: false, post: c => { fig(c, OYD, 146, GD, { face: -1, rim: '#f4a456', dark: ['#0a0610', .35] }); fig(c, RAVH, 118, GD, { face: 1, rim: '#c8a8a0' }); } });

  // --- Nargiza
  def('nargiza:tale', 'dream', { post: c => { fig(c, 'nargiza', 136, 83, { face: -1, talk: true, rim: '#9ff3e6' }); glow(c, 136, 66, 22, '#4fe8d8', .25); } });
  def('nargiza:believes', 'tail', { mood: 'night', lit: .02, post: c => fig(c, 'nargiza', 130, GD + 1, { face: 1, rim: '#8a98d8' }) });
  def('nargiza:returned', 'well', { mood: 'night', post: c => { fig(c, 'nargiza', 119, 93, { face: 1, talk: true, rim: '#9ff3e6' }); fig(c, 'shirin', 145, 93, { face: -1, rim: '#9ff3e6' }); } });
  def('nargiza:silenced', 'room', { mood: 'night', post: c => fig(c, 'nargiza', 150, 92, { face: 1, rim: '#8a98d8' }) });
  def('nargiza:none', 'well', { mood: 'night', light: '#2a5a7a' });
  def('nargiza:chain:believes', 'well', { mood: 'night', light: '#2a6a9a', post: c => { fig(c, 'nargiza', 131, 94, { face: -1, rim: '#8a98d8' }); heavyChain(c, 56, 12, 112, 100, 20, '#2a2228', '#7a6a6a', 3); } });
  def('nargiza:chain:returned', 'roof', { mood: 'dawn', post: c => { fig(c, 'nargiza', 130, GD - 3, { face: 1, talk: true, rim: '#f2a878' }); heavyChain(c, 260, 26, 168, 74, 10, '#2a2228', '#8a6a6a', 3); } });
  def('nargiza:chain:silenced', 'hall', { post: c => fig(c, 'nargiza', 130, GD, { face: 1, talk: true, rim: '#ffd890' }) });
  def('nargiza:chain:none', 'road', { mood: 'dawn', city: true, caravan: true, cx: 110, cn: 6 });
  def('nargiza:awake:believes', 'river', { mood: 'dusk', sunk: false, nearPost: c => fig(c, 'nargiza', 40, 98, { face: 1, talk: true, rim: '#f4a456' }), fx: [FX.glints(80, 88, 210, 120, '#ffe0b0', 40)] });
  def('nargiza:awake:returned', 'river', { mood: 'grey', dome: true });
  def('nargiza:awake:silenced', 'desert', { mood: 'grey', sunk: true, post: c => fig(c, 'nargiza', 120, 120, { face: 1, rim: '#c8c0c8' }) });
  def('nargiza:awake:none', 'river', { mood: 'dusk', reeds: true });

  // --- Alp
  def('alp:chained', 'heart', { post: c => { fig(c, 'alp', 172, 96, { face: -1, rim: '#ff9a90' }); heavyChain(c, 168, 74, 150, 58, 4, '#2a2228', '#8a7a7a', 2); } });
  def('alp:unchained', 'tail', { mood: 'dusk', lit: .3, moon: false, post: c => { fig(c, 'alp', 150, GD, { face: 1, rim: '#f4a456' }); kids(c, 96, GD, 4, { face: 1 }); } });
  def('alp:carry', 'desert', { mood: 'night', storm: true, moon: { x: 190, y: 20, r: 5, halo: '#a89890' }, post: c => { fig(c, 'alp', 131, 116, { face: 1, rim: '#c8b8a0' }); fig(c, 'child', 125, 98, { face: 1 }); fig(c, 'girl', 139, 99, { face: -1 }); } });
  const alpGate = alone => c => { fig(c, 'alp', 131, GD, { face: 1, rim: '#ffd08a' }); if (!alone) { fig(c, 'child', 110, GD, { face: 1, rim: '#ffd08a' }); fig(c, 'girl', 152, GD, { face: -1, rim: '#ffd08a' }); fig(c, 'child', 164, GD + 1, { face: -1 }); } };
  def('alp:returned', 'gate', { post: alpGate(false) });
  def('alp:destroyed', 'gate', { post: alpGate(false) });
  def('alp:guard', 'gate', { post: alpGate(false) });
  def('alp:choice', 'gate', { post: alpGate(true) });

  // --- Farrukh
  def('farrukh:tithe', 'hall', { post: c => fig(c, FAR, 130, GD, { face: 1, talk: true, rim: '#ffd890' }) });
  def('farrukh:chain', 'road', { mood: 'dusk', caravan: true, cx: 40, cn: 8, post: c => fig(c, FAR, 180, 106, { face: -1, rim: '#f4a456' }) });
  def('farrukh:awake', 'desert', { mood: 'dawn', sunk: true, post: c => fig(c, FAR, 130, 119, { face: 1, talk: true, rim: '#f2a878' }) });
  def('farrukh:tale', 'chai', { post: c => { fig(c, FAR, 198, GD - 2, { face: -1, talk: true, rim: '#ffd08a' }); P(c, [['tailman', 54, GD - 7, { face: 1 }], ['tailwoman', 74, GD - 7, { face: -1 }], ['elder', 130, GD - 6, { face: 1 }]]); } });
  def('farrukh:kept', 'saffron', { mood: 'morning', post: c => { glow(c, 130, 58, 40, '#ffe090', .4); R(c, 128, 46, 1, 8, '#c8a050'); tumar(c, 130, 54, '#ffd060', '#ffd060'); R(c, 127, 55, 7, 4, '#e8c060'); R(c, 128, 59, 5, 2, '#e8c060'); R(c, 129, 61, 3, 1, '#e8c060'); R(c, 130, 62, 1, 1, '#e8c060'); } });
  def('farrukh:home', 'saffron', { mood: 'morning', post: c => fig(c, FAR, 150, 90, { face: -1, rim: '#ffe0b0' }) });
  def('farrukh:sold', 'saffron', { mood: 'dusk', harvested: true, sun: { x: 190, y: 54, r: 5 }, post: c => fig(c, FAR, 160, 80, { face: 1, rim: '#f4a456' }) });
  def('farrukh:drunk', 'saffron', { mood: 'morning', faded: true, house: false });

  // --- Turab
  def('turab:tithe', 'chai', { mood: 'night', grey: true, post: c => { fig(c, TUR, 130, GD - 6, { face: 1, rim: '#a8a4b0', dark: ['#5a5866', .2] }); kids(c, 70, GD, 3, { face: 1 }); } });
  def('turab:chain', 'road', { mood: 'dusk', caravan: true, cx: 150, cn: 6, flip: true, city: true, post: c => fig(c, TUR, 96, 106, { face: 1, rim: '#f4a456' }) });
  def('turab:awake', 'river', { mood: 'dusk', nearPost: c => fig(c, TUR, 40, 98, { face: 1, talk: true, rim: '#f4a456' }), fx: [FX.glints(80, 88, 210, 120, '#ffe0b0', 30)] });
  const turabKids = c => { fig(c, TUR, 70, GD - 7, { face: 1, talk: true, rim: '#ffd08a' }); kids(c, 86, GD - 6, 3, { face: -1, gap: 8 }); kids(c, 116, GD + 1, 2, { face: -1, first: 1 }); };
  def('turab:tale', 'chai', { post: turabKids });
  def('turab:hands', 'chai', { post: turabKids });
  def('turab:voiceHome', 'river', { mood: 'dawn', sun: { x: 150, y: 78, r: 5, cut: 80 }, sunX: 150, nearPost: c => fig(c, TUR, 40, 98, { face: 1, talk: true, rim: '#f2a878' }) });
  def('turab:voiceSold', 'gate', { rich: true, post: c => fig(c, TUR, 92, GD, { face: 1, rim: '#ffd08a', dark: ['#0a0810', .2] }) });

  // --- Mehri
  def('mehri:forgot', 'room', { mood: 'dusk', post: c => fig(c, 'widow', 130, 92, { face: -1, talk: true, rim: '#f4a456' }) });
  def('mehri:sings', 'room', { mood: 'night', post: c => { fig(c, 'widow', 136, 92, { face: -1, talk: true, rim: '#ffd08a' }); fig(c, 'child', 112, 92, { face: 1, alpha: .3, rim: '#ffe0b0' }); glow(c, 112, 78, 14, '#ffe0b0', .2); } });
  def('mehri:tumar', 'room', { mood: 'night', post: c => { fig(c, 'widow', 130, 92, { face: -1, rim: '#ffd08a' }); tumar(c, 126, 76, '#ffd060', '#ffd060'); } });
  def('mehri:carried', 'river', { mood: 'night', sunkLit: .5, lightsInWater: true, post: c => { fig(c, 'widow', 130, 106, { face: 1, rim: '#ffd08a', cut: 95 }); R(c, 120, 95, 20, 1, '#8a98c8'); R(c, 124, 97, 12, 1, '#3a4870'); tumar(c, 130, 72, '#ffd060', '#ffd060'); glow(c, 130, 72, 18, '#ffe090', .4); } });
  def('mehri:angry', 'door', { mood: 'night', open: true, post: c => fig(c, 'widow', 130, GD - 3, { face: 1, rim: '#ffb060', dark: ['#0a0608', .35] }) });
  def('mehri:sung', 'door', { mood: 'night', post: c => { fig(c, 'singer', 100, GD, { face: 1, rim: '#c8d0ff' }); fig(c, 'inspector', 162, GD, { face: -1, rim: '#c8d0ff' }); } });
  def('mehri:kept', 'cellar', { sparse: true, one: true, brick: '#3a3448', lampX: 70 });
  def('mehri:cellar', 'cellar', { sparse: true, jars: true, brick: '#4a3a2e', post: c => { fig(c, 'widow', 166, 95, { face: -1, rim: '#ffc070', lamp: true }); fig(c, 'child', 100, 96, { face: 1 }); fig(c, 'girl', 88, 96, { face: 1 }); } });
  const bread0 = c => { bread(c, 130, GD - 3); fig(c, 'widow', 196, GD + 2, { face: 1, rim: '#8a98d8' }); };
  def('mehri:bread', 'door', { mood: 'night', winLit: true, post: bread0 });
  def('mehri:books', 'room', { mood: 'night', candleX: 122, post: c => { R(c, 100, 86, 60, 2, '#4a2e1a'); book(c, 130, 84, true); R(c, 104, 88, 2, 5, '#3a2414'); R(c, 154, 88, 2, 5, '#3a2414'); } });
  def('mehri:hollow', 'door', { mood: 'night', winLit: true, post: bread0 });

  // --- Davron and the children
  def('davron:led', 'road', { mood: 'dusk', caravan: true, cx: 40, cn: 7, post: c => { fig(c, 'caravan', 160, 106, { face: -1, rim: '#f4a456' }); kids(c, 176, 106, 3, { face: -1, gap: 10, rim: '#f4a456' }); } });
  def('davron:water', 'river', { mood: 'dusk', post: c => { }, nearPost: c => { fig(c, 'caravan', 28, 98, { face: 1, rim: '#f4a456' }); kids(c, 40, 99, 2, { face: 1 }); fig(c, 'tailwoman', 226, 99, { face: -1, rim: '#f4a456' }); fig(c, 'child', 238, 100, { face: -1 }); } });
  def('davron:reported', 'road', { mood: 'night', city: true, caravan: true, cx: 230, cn: 6, flip: true });
  const camp = c => { fig(c, 'caravan', 112, 112, { face: 1, talk: true, rim: '#ffb060' }); kids(c, 146, 112, 3, { face: -1, gap: 10, rim: '#ffb060' }); };
  def('davron:bribe', 'road', { mood: 'night', post: camp, fx: [FX.flame(130, 98, .7, 1), FX.embers(130, 94, '#ffb050', 12), FX.stars(24, 60)] });
  def('davron:bluff', 'road', { mood: 'night', post: camp, fx: [FX.flame(130, 98, .7, 1), FX.embers(130, 94, '#ffb050', 12), FX.stars(24, 60)] });

  // --- Bahodir
  const BAH_PLAIN = { body: 'hound', robe: '#4a3a2a', trim: '#7a6a4a', skin: '#b8865c', head: 'bare', hair: '#2a1a10', beard: 'short', beardC: '#2a1a10', scale: 1.15, pat: 'plain' };
  def('bahodir:shown', 'gate', { mood: 'dawn', rich: true, open: true, sun: { x: 130, y: 70, r: 5 }, post: c => fig(c, 'hound', 131, GD, { face: 1, rim: '#f2a878' }) });
  def('bahodir:killed', 'grave', {});
  def('bahodir:spared', 'karez', { post: c => { fig(c, 'hound', 84, 100, { face: 1, rim: '#ffc070' }); fig(c, 'tailman', 180, 100, { face: -1, rim: '#ffc070' }); R(c, 96, 84, 1, 16, '#4a2e1a'); R(c, 94, 99, 5, 2, '#8a8a90'); } });
  def('bahodir:gone', 'road', { mood: 'dawn', post: c => { R(c, 70, 104, 8, 3, '#c8a040'); R(c, 71, 102, 5, 2, '#d8b040'); R(c, 80, 105, 4, 2, '#a88a30'); fig(c, BAH_PLAIN, 170, 104, { face: 1, rim: '#f2a878' }); } });

  // --- Sado
  def('sado:keep', 'roof', { mood: 'night', post: c => { fig(c, RAV, 130, GD - 2, { face: 1, rim: '#8a98d8' }); sadoWisp(c, 146, 64, 1); } });
  def('sado:sister', 'tail', { mood: 'morning', lit: 0, moon: false, tree: [214, 70], post: c => { fig(c, 'girl', 116, GD, { face: 1, rim: '#ffe0b0' }); fig(c, RAV, 138, GD, { face: -1, rim: '#ffe0b0' }); R(c, 121, GD - 15, 1, 1, '#f0a030'); }, fx: [FX.dust(14, '#fff0d8'), FX.birds(3, 24)] });
  def('sado:oydin', 'desert', { mood: 'night', post: c => { fig(c, OYD, 124, 112, { face: 1, talk: true, rim: '#ffb060' }); sadoWisp(c, 112, 72, .7); }, fx: [FX.flame(146, 94, .7, 1), FX.embers(146, 90, '#ffb050', 12), FX.stars(24, 60)] });
  def('sado:tale', 'chai', { mood: 'night', post: c => { kids(c, 56, GD - 6, 4, { gap: 8 }); kids(c, 106, GD, 3, { face: -1 }); fig(c, 'girl', 92, 76, { face: 1, alpha: .28, rim: '#9ff3e6' }); glow(c, 92, 64, 18, '#9ff3e6', .25); } });
  def('sado:unsung', 'roof', { mood: 'night', post: c => { fig(c, RAV, 130, GD - 2, { face: 1, rim: '#8a98d8' }); sadoWisp(c, 146, 64, .35); } });
  def('sado:hollowVoice', 'roof', { mood: 'night', grey: true, post: c => { fig(c, RAVH, 130, GD - 2, { face: 1, rim: '#a8a4b0' }); sadoWisp(c, 146, 64, .2); } });
  def('sado:hollowSister', 'roof', { mood: 'night', grey: true, post: c => fig(c, RAVH, 130, GD - 2, { face: 1, rim: '#a8a4b0' }) });

  // --- Ravshan, last
  def('ravshan:tithe', 'tail', { mood: 'night', chalk: true, lit: .3, post: c => fig(c, RAV, 130, GD, { face: 1, lamp: true, rim: '#ffd08a' }) });
  def('ravshan:chain', 'terrace', { water: true, post: c => { fig(c, RAV, 130, GD - 1, { face: 1, rim: '#8a98d8' }); heavyChain(c, 137, 80, 190, 74, -3, '#2a2228', '#8a7a7a', 3); heavyChain(c, 190, 74, 236, 136, 10, '#2a2228', '#8a7a7a', 3); } });
  def('ravshan:awake', 'river', { mood: 'night', lightsInWater: true, sunkLit: .4, moon: { x: 200, y: 20, r: 4, halo: '#8a98d8' }, nearPost: c => fig(c, RAV, 40, 98, { face: 1, rim: '#ffd08a' }), fx: [FX.glints(70, 88, 200, 120, '#ffd08a', 30), FX.stars(20, 50)] });
  def('ravshan:tale', 'well', { mood: 'night', light: '#ffd08a', post: c => { fig(c, RAV, 131, 93, { face: 1, talk: true, rim: '#ffd08a' }); kids(c, 80, 94, 3, { face: 1 }); kids(c, 166, 94, 3, { face: -1 }); } });
  def('ravshan:hollow', 'tail', { mood: 'grey', lit: 0, moon: false, post: c => { fig(c, RAVH, 130, GD, { face: 1, rim: '#c8c4cc' }); tumar(c, 136, 82, '#8a8488', null); } });
  def('rustam:hollow', 'chai', { mood: 'dusk', grey: true, post: c => { fig(c, RUS, 64, GD - 6, { face: 1, rim: '#c8b8a8' }); fig(c, RAVH, 86, GD - 6, { face: -1, rim: '#c8b8a8' }); fig(c, 'child', 112, GD, { face: -1 }); } });

  def('default', 'dream', {});

  /* subject → scene id: "k:e:v", "k:v", "k:e", then a per-subject fallback */
  const FALLBACK = { city: 'city:tale', tail: 'tail:hide', shirin: 'shirin:tithe', tillabek: 'tillabek:tithe', oydin: 'oydin:fire', nargiza: 'nargiza:believes', alp: 'alp:guard', farrukh: 'farrukh:tale', turab: 'turab:tale', mehri: 'mehri:forgot', davron: 'davron:led', bahodir: 'bahodir:shown', sado: 'sado:keep', ravshan: 'ravshan:tithe', rustam: 'rustam:hollow' };
  function sceneIdFor(key) {
    if (!key || !key.k) return 'default';
    const { k, v, e } = key;
    for (const id of [k + ':' + e + ':' + v, k + ':' + v, k + ':' + e]) if (SCENE_OF[id]) return id;
    return FALLBACK[k] || 'default';
  }

  /* =====================================================================
     BAKING: one layer per job, a few per frame
     ===================================================================== */
  const SCENES = new Map(); // id -> {layers:[{d, cv}], fx, ready}
  const JOBS = [];
  function want(id) {
    let s = SCENES.get(id);
    if (s) { SCENES.delete(id); SCENES.set(id, s); return s; }
    s = { id, layers: [], fx: [], ready: false, jobs: 0, k: 1 };
    SCENES.set(id, s);
    while (SCENES.size > 7) { const old = SCENES.keys().next().value; if (old === id) break; SCENES.delete(old); }
    let d;
    try { d = buildScene(id); } catch (e) { console.error('[epilogue] scene', id, e); }
    if (!d) d = { layers: [lay(0, px => sky(px, PAL.night.sky, { stars: 200 }))], fx: [] };
    s.k = d.k || 1;
    s.fx = (d.fx || []).map(f => Object.assign({}, f));
    s.layers = d.layers.map(L => ({ d: L.d, cv: null }));
    d.layers.forEach((L, i) => { s.jobs++; JOBS.push(() => { s.layers[i].cv = bakeLayer(L, id + '#' + i, s.k); if (--s.jobs <= 0) s.ready = true; }); });
    return s;
  }
  function bakeLayer(L, seedKey, k) {
    const t0 = performance.now();
    k = k || 1;
    const px = new Px(SW / k, SH / k);
    const r = rngOf(hashStr(seedKey));
    try { if (L.paint) L.paint(px, r); } catch (e) { console.error('[epilogue] paint', seedKey, e); }
    const cv = px.canvas();
    cv.ctx = cv.ctx || cv.getContext('2d');
    cv.ctx.imageSmoothingEnabled = false;
    try { if (L.post) L.post(cv.ctx, rngOf(hashStr(seedKey) ^ 77)); } catch (e) { console.error('[epilogue] post', seedKey, e); }
    let out = cv;
    if (k > 1) { out = mk(SW, SH); out.ctx.imageSmoothingEnabled = false; out.ctx.drawImage(cv, 0, 0, SW, SH); }
    EPI.stats.bakeMs += performance.now() - t0; EPI.stats.bakes++;
    return out;
  }
  const hashStr = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  function runJobs(budget) {
    const t0 = performance.now();
    while (JOBS.length && performance.now() - t0 < budget) JOBS.shift()();
  }
  function finishScene(s) { // bake what is left of one scene now
    if (s.ready) return;
    for (let guard = 0; !s.ready && JOBS.length && guard < 200; guard++) JOBS.shift()();
  }

  /* =====================================================================
     PARTICLES (cheap, integer pixels)
     ===================================================================== */
  function fxInit(f, seed, k) {
    const r = rngOf(seed), P = [];
    const n = f.n || 10, a = f.area || [0, 0, SW / k, SH / k];
    for (let i = 0; i < n; i++) P.push({ x: r.range(a[0], a[2]), y: r.range(a[1], a[3]), v: r.range(.6, 1.4), p: r.range(0, 6.28), s: r.range(0, 1) });
    f.P = P;
  }
  function fxDraw(c, f, T, ox, oy, k) {
    k = k || 1;
    if (!f.P) fxInit(f, (f.x || 0) * 7 + (f.n || 1) * 13 + (f.type || '').length, k);
    const W0 = SW / k, H0 = SH / k;
    c.save(); c.translate(ox - 2 * VX, oy - 2 * VY); c.scale(k, k); ox = VX; oy = VY;
    const P = f.P, col = f.col || '#ffffff';
    c.fillStyle = col;
    switch (f.type) {
      case 'dust': for (const p of P) { const x = ((p.x + T * .12 * p.v) % W0 + W0) % W0, y = p.y + Math.sin(T * .02 + p.p) * 4; c.globalAlpha = .25 + .25 * Math.sin(T * .03 + p.p); c.fillRect(RD(x + ox - VX), RD(y + oy - VY), 1, 1); } break;
      case 'ash': for (const p of P) { const y = ((p.y + T * .18 * p.v) % H0 + H0) % H0, x = p.x + Math.sin(T * .015 + p.p) * 8; c.globalAlpha = .35; c.fillRect(RD(x + ox - VX), RD(y + oy - VY), 1, 1); } break;
      case 'sand': for (const p of P) { const x = ((p.x + T * 1.6 * p.v) % W0 + W0) % W0, y = p.y + Math.sin(T * .05 + p.p) * 2; c.globalAlpha = .3 * p.v; c.fillRect(RD(x + ox - VX), RD(y + oy - VY), 3, 1); } break;
      case 'motes': {
        const a = f.area;
        for (const p of P) { const h = a[3] - a[1], y = a[3] - ((p.s * h + T * .15 * p.v) % h), x = p.x + Math.sin(T * .02 + p.p) * 6; const k = Math.sin(((a[3] - y) / h) * PI); c.globalAlpha = .7 * k; c.fillRect(RD(x + ox - VX), RD(y + oy - VY), 1, 1); if (p.v > 1.2) { c.globalAlpha = .25 * k; c.fillRect(RD(x + ox - VX) - 1, RD(y + oy - VY), 3, 1); c.fillRect(RD(x + ox - VX), RD(y + oy - VY) - 1, 1, 3); } }
        break;
      }
      case 'fireflies': for (const p of P) { const x = p.x + Math.sin(T * .011 * p.v + p.p) * 14, y = p.y + Math.cos(T * .017 * p.v + p.p) * 8; c.globalAlpha = Math.max(0, Math.sin(T * .05 * p.v + p.p)); c.fillRect(RD(x + ox - VX), RD(y + oy - VY), 1, 1); } break;
      case 'embers': for (const p of P) { const life = (T * .01 * p.v + p.s) % 1, x = f.x + (p.x - W0 / 2) * .08 + Math.sin(life * 6 + p.p) * 6, y = f.y - life * 90; c.globalAlpha = (1 - life) * .9; c.fillRect(RD(x + ox - VX), RD(y + oy - VY), 1, 1); } break;
      case 'glints': for (const p of P) { const k = Math.sin(T * .06 * p.v + p.p); if (k > .7) { c.globalAlpha = (k - .7) * 3; c.fillRect(RD(p.x + ox - VX), RD(p.y + oy - VY), k > .92 ? 3 : 2, 1); } } break;
      case 'stars': for (const p of P) { const k = Math.sin(T * .04 * p.v + p.p); if (k > .6) { c.globalAlpha = (k - .6) * 2.2; c.fillRect(RD(p.x + ox - VX), RD(p.y * (f.h / H0) + oy - VY), 1, 1); } } break;
      case 'birds': for (const p of P) { const x = ((p.x + T * .25 * p.v) % (W0 + 60)) - 30, y = f.y + p.s * 30 + Math.sin(T * .02 + p.p) * 3, fl = Math.sin(T * .2 + p.p) > 0 ? 1 : 0; c.globalAlpha = .8; const X = RD(x + ox - VX), Y = RD(y + oy - VY); c.fillRect(X - 2, Y - fl, 1, 1); c.fillRect(X - 1, Y, 1, 1); c.fillRect(X, Y + 1 - fl, 1, 1); c.fillRect(X + 1, Y, 1, 1); c.fillRect(X + 2, Y - fl, 1, 1); } break;
      case 'pulse': { const k = .5 + .5 * Math.sin(T * .09); c.globalCompositeOperation = 'lighter'; c.globalAlpha = .15 + .25 * k; c.drawImage(glowSpr(f.col, f.r), RD(f.x + ox - VX - f.r), RD(f.y + oy - VY - f.r)); c.globalCompositeOperation = 'source-over'; break; }
      case 'flame': {
        const X = RD(f.x + ox - VX), Y = RD(f.y + oy - VY), s = f.s || 1, fl = Math.sin(T * .31) + Math.sin(T * .83 + 1.7);
        c.globalAlpha = 1;
        c.globalCompositeOperation = 'lighter';
        c.globalAlpha = .35 + .08 * fl; c.drawImage(glowSpr('#ff9a40', 26 * s), X - 26 * s, Y - 26 * s);
        c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
        const h = RD((5 + fl) * s);
        c.fillStyle = '#ff7a2a'; c.fillRect(X - RD(2 * s), Y - RD(h * .6), RD(4 * s) + 1, RD(h * .6));
        c.fillStyle = '#ffc050'; c.fillRect(X - RD(1 * s), Y - h, RD(2 * s) + 1, h);
        c.fillStyle = '#fff4c0'; c.fillRect(X, Y - RD(h * .5), 1, RD(h * .4) + 1);
        break;
      }
    }
    c.restore();
    c.globalAlpha = 1;
  }

  /* =====================================================================
     RUNTIME
     ===================================================================== */
  const ST = { active: false, pending: false, slides: [], i: -1, t: 0, from: null, xt: 0, outro: 0, release: 0, T: 0, holdIn: 0, music: false };
  EPI.state = ST;
  const titleOf = key => {
    if (!key) return '';
    const N = {
      city: `Yodgor|Ёдгор|Yodgor`, tail: `The Tail|Хвост|Dum`, shirin: `Ustoz Shirin|Устоз Ширин|Ustoz Shirin`, tillabek: `Akhror Tilla-bek|Ахрор Тилла-бек|Axror Tillabek`,
      oydin: key.v === 'hollowStranger' ? `A woman in black|Женщина в чёрном|Qora kiyimli ayol` : `Oydin|Ойдин|Oydin`, nargiza: `Nargiza|Наргиза|Nargiza`, alp: `Alp|Алп|Alp`,
      farrukh: `Farrukh|Фаррух|Farrux`, turab: `Turab the bakhshi|Тураб-бахши|Turob baxshi`, mehri: `Mehri|Мехри|Mehri`, davron: `Davron's children|Дети Даврона|Davronning bolalari`,
      bahodir: `Bahodir, the Gilded Hound|Баходир, Золотой Пёс|Bahodir, Oltin It`, sado: `Sado|Садо|Sado`, ravshan: `Ravshan|Равшан|Ravshan`, rustam: `Rustam-aka|Рустам-ака|Rustam aka`
    }[key.k];
    return N ? t(N) : '';
  };
  function start() {
    const S = G.STORY, list = S.epilogue || [], keys = S.epilogueKeys || [];
    ST.slides = list.map((_, i) => ({ i, key: keys[i] || null, id: sceneIdFor(keys[i]), dir: i % 2 ? -1 : 1, dy: (i % 3) - 1 }));
    ST.active = EPI.on && !!ART && !!PEOPLE && ST.slides.length > 0;
    ST.i = -1; ST.t = 0; ST.from = null; ST.xt = 0; ST.outro = 0; ST.release = 0; ST.T = 0; ST.music = false; ST.done = false;
    if (ST.active) {
      want(ST.slides[0].id); if (ST.slides[1]) want(ST.slides[1].id);
      try { const d = G.UI._debug(); if (d.card) d.card.t = Math.max(d.card.t, d.card.life); if (d.bossCard) d.bossCard.t = Math.max(d.bossCard.t, d.bossCard.life); } catch (e) { /* ignore */ }
    }
  }
  function goTo(n) {
    if (n === ST.i) return;
    if (n >= ST.slides.length) { ST.outro = 1; return; }
    n = Math.max(0, n);
    ST.from = ST.i >= 0 ? { slide: ST.slides[ST.i], t: ST.t } : { title: true, t: ST.t };
    ST.i = n; ST.t = 0; ST.xt = 0;
    const s = want(ST.slides[n].id); finishScene(s);
    if (ST.slides[n + 1]) want(ST.slides[n + 1].id);
    try { if (G.Audio && G.Audio.sfx) G.Audio.sfx('ui_move', { vol: .4 }); } catch (e) { /* ignore */ }
  }
  function releaseToEngine() {
    const v = VS(), n = (G.STORY.epilogue || []).length;
    v.shown = n; v.t = 60 + n * 150 + 21; v.sel = 0; v.busy = false;
    ST.active = false; ST.release = 48;
  }
  function step() {
    ST.T++;
    runJobs(ST.i < 0 && ST.t < 30 ? 14 : 5);
    const I = G.input;
    const nextP = I.pressed('confirm') || I.pressed('attack') || I.pressed('right');
    const prevP = I.pressed('left');
    const skipP = I.pressed('back');
    if (!ST.music) { ST.music = true; try { if (G.Audio && G.Audio.music) G.Audio.music(EPI.track || 'victory'); } catch (e) { /* ignore */ } }
    if (ST.outro) {
      ST.outro++;
      if (ST.outro > 46) releaseToEngine();
      return;
    }
    ST.t++; ST.xt++;
    if (skipP && ST.T > 20) { ST.outro = 1; return; }
    const minT = 24; // ignore presses right after a change
    if (ST.i < 0) {
      if ((nextP && ST.t > minT) || ST.t >= TITLE_DUR) goTo(0);
      return;
    }
    if (prevP && ST.t > minT && ST.i > 0) { goTo(ST.i - 1); return; }
    if ((nextP && ST.t > minT) || ST.t >= DUR) goTo(ST.i + 1);
  }

  /* ---------- hooks: update ---------- */
  G.Events.on('state', s => { if (s === 'victory') ST.pending = true; else { ST.active = false; ST.pending = false; ST.release = 0; } });
  {
    const up0 = G.UI.update;
    G.UI.update = function (state) {
      if (state === 'victory' && ST.pending) { ST.pending = false; try { start(); } catch (e) { console.error('[epilogue] start', e); ST.active = false; } }
      const r = up0.apply(this, arguments);
      if (state === 'victory' && ST.active) {
        const v = VS(); v.t = 0; v.shown = 0;
        try { step(); } catch (e) { console.error('[epilogue] step', e); releaseToEngine(); }
      } else if (ST.release > 0) ST.release--;
      return r;
    };
  }

  /* ---------- draw: picture (pixel pass) ---------- */
  let shadeCv = null;
  function bottomShade() {
    if (shadeCv) return shadeCv;
    shadeCv = mk(G.W, G.H);
    const c = shadeCv.ctx, g = c.createLinearGradient(0, 0, 0, G.H);
    g.addColorStop(0, 'rgba(4,2,8,0.3)'); g.addColorStop(.1, 'rgba(4,2,8,0)'); g.addColorStop(.66, 'rgba(4,2,8,0)'); g.addColorStop(.75, 'rgba(4,2,8,0.6)'); g.addColorStop(.82, 'rgba(4,2,8,0.86)'); g.addColorStop(1, 'rgba(4,2,8,0.97)');
    c.fillStyle = g; c.fillRect(0, 0, G.W, G.H);
    return shadeCv;
  }
  function drawSlide(c, slide, tt, alpha) {
    const s = want(slide.id);
    if (!s.ready) finishScene(s);
    const u = ease(tt / DUR) * .85 + (tt / DUR) * .15;
    c.globalAlpha = alpha;
    let ox = 0, oy = 0;
    for (const L of s.layers) {
      if (!L.cv) continue;
      ox = RD(slide.dir * (u - .5) * 2 * PAN * L.d); oy = RD(slide.dy * (u - .5) * 2 * 5 * L.d);
      c.drawImage(L.cv, -VX + ox, -VY + oy);
    }
    // particles over everything at their own depth
    for (const f of s.fx) {
      const fo = RD(slide.dir * (u - .5) * 2 * PAN * f.d), fy = RD(slide.dy * (u - .5) * 2 * 5 * f.d);
      c.globalAlpha = alpha; fxDraw(c, f, ST.T, fo + VX, fy + VY, s.k);
    }
    c.globalAlpha = 1;
  }
  function drawTitleBg(c, a, T) {
    c.globalAlpha = a;
    c.fillStyle = '#040208'; c.fillRect(0, 0, G.W, G.H);
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = a * .22; c.drawImage(glowSpr('#c08a3a', 150, 1), G.W / 2 - 150, G.H / 2 - 150 - 6);
    c.globalCompositeOperation = 'source-over';
    // slow gold dust
    for (let i = 0; i < 40; i++) {
      const x = (i * 97.3 + T * (.05 + (i % 5) * .02)) % G.W, y = G.H - ((i * 53.1 + T * (.08 + (i % 3) * .03)) % G.H);
      c.globalAlpha = a * (.25 + .25 * Math.sin(T * .03 + i)); c.fillStyle = i % 4 ? '#e2b452' : '#fff0c0'; c.fillRect(RD(x), RD(y), 1, 1);
    }
    c.globalAlpha = 1;
  }
  PIXEL_DRAW.push((c, st) => {
    if (st !== 'victory') return;
    if (!ST.active && !(ST.release > 0)) return;
    const t0 = performance.now();
    c.save();
    c.imageSmoothingEnabled = false;
    try {
      if (!ST.active) { // handing over: black fades away to the engine's screen
        c.globalAlpha = cl(ST.release / 48, 0, 1); c.fillStyle = '#040208'; c.fillRect(0, 0, G.W, G.H);
      } else {
        c.fillStyle = '#040208'; c.fillRect(0, 0, G.W, G.H);
        const k = cl(ST.xt / XF, 0, 1), from = ST.from;
        if (ST.i < 0) drawTitleBg(c, oc(ST.t / 40), ST.T);
        else {
          if (from && k < 1) {
            if (from.title) drawTitleBg(c, 1, ST.T); else drawSlide(c, from.slide, from.t + ST.xt, 1);
          }
          drawSlide(c, ST.slides[ST.i], ST.t, from ? ease(k) : oc(ST.t / 40));
          c.globalAlpha = 1; c.drawImage(bottomShade(), 0, 0);
        }
        if (ST.outro) { c.globalAlpha = cl(ST.outro / 40, 0, 1); c.fillStyle = '#040208'; c.fillRect(0, 0, G.W, G.H); }
      }
    } finally { c.restore(); }
    EPI.stats.ms += performance.now() - t0; EPI.stats.n++;
  });

  /* ---------- draw: text (HD pass) ---------- */
  const WRAP = new Map();
  function wrap(c, s, maxW) {
    const key = c.font + '|' + maxW + '|' + s;
    let L = WRAP.get(key);
    if (L) return L;
    L = [];
    const words = String(s).split(/\s+/);
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (c.measureText(test).width > maxW && line) { L.push(line); line = w; } else line = test;
    }
    if (line) L.push(line);
    if (WRAP.size > 300) WRAP.clear();
    WRAP.set(key, L);
    return L;
  }
  function textBlock(c, s, x, y, maxW, size, lh, col, a, maxLines) {
    let sz = size;
    let lines;
    for (let k = 0; k < 4; k++) {
      c.font = `400 ${sz}px ${SERIF}`;
      lines = wrap(c, s, maxW);
      if (lines.length <= (maxLines || 4)) break;
      sz *= .92;
    }
    const L = lh * sz / size;
    EPI.lastText = { lines: lines.length, size: sz, maxW, wide: Math.max(...lines.map(l => c.measureText(l).width)) };
    c.textAlign = 'center'; c.textBaseline = 'top';
    c.globalAlpha = a;
    lines.forEach((ln, i) => {
      c.fillStyle = 'rgba(4,2,8,0.9)'; c.fillText(ln, x + .35, y + i * L + .45);
      c.fillStyle = col; c.fillText(ln, x, y + i * L);
    });
    return lines.length * L;
  }
  function rule(c, x, y, w, a) {
    c.globalAlpha = a;
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    g.addColorStop(0, 'rgba(226,180,82,0)'); g.addColorStop(.5, 'rgba(226,180,82,0.85)'); g.addColorStop(1, 'rgba(226,180,82,0)');
    c.fillStyle = g; c.fillRect(x - w / 2, y, w, .35);
    c.fillStyle = '#e2b452';
    c.save(); c.translate(x, y + .2); c.rotate(PI / 4); c.fillRect(-1, -1, 2, 2); c.restore();
  }
  function spaced(c, s, x, y, size, ls, col, a) {
    c.font = `600 ${size}px ${SERIF}`;
    c.textAlign = 'left'; c.textBaseline = 'top';
    const chars = [...s], ws = chars.map(ch => c.measureText(ch).width);
    const total = ws.reduce((p, q) => p + q, 0) + ls * (chars.length - 1);
    let xx = x - total / 2;
    c.globalAlpha = a;
    chars.forEach((ch, i) => { c.fillStyle = 'rgba(4,2,8,0.9)'; c.fillText(ch, xx + .3, y + .4); c.fillStyle = col; c.fillText(ch, xx, y); xx += ws[i] + ls; });
    return total;
  }
  SMOOTH_DRAW.push((c, st) => {
    if (st !== 'victory' || !ST.active) return;
    const t0 = performance.now();
    c.save();
    c.imageSmoothingEnabled = true;
    try {
      const W = G.W, out = ST.outro ? 1 - cl(ST.outro / 30, 0, 1) : 1;
      if (ST.i < 0) {
        const a = oc((ST.t - 20) / 50) * out * (ST.from ? 1 : 1);
        const title = String(G.ENDING_TITLE || '').toUpperCase();
        c.globalAlpha = a;
        spaced(c, t(`EPILOGUE|ЭПИЛОГ|EPILOG`), W / 2, 104, 6.5, 2.4, '#b8a890', a * .9);
        rule(c, W / 2, 116, 180 * oc((ST.t - 30) / 60), a);
        const tw = spaced(c, title, W / 2, 124, 20, 3.2, '#f2d48a', a);
        rule(c, W / 2, 152, Math.max(180, tw + 40) * oc((ST.t - 40) / 60), a);
      } else {
        const sl = ST.slides[ST.i], txt = (G.STORY.epilogue || [])[sl.i] || '';
        const k = cl(ST.xt / XF, 0, 1);
        const a = oc((ST.t - 16) / 40) * out;
        const name = titleOf(sl.key);
        let y = 211;
        if (name) { spaced(c, name.toUpperCase(), W / 2, y, 7.4, 1.6, '#e8c46a', a); y += 10.5; rule(c, W / 2, y, 120, a * .8); y += 4; }
        else y += 6;
        textBlock(c, txt, W / 2, y, 410, 7.2, 9.9, '#efe4cc', a, 4);
        // progress dots
        const n = ST.slides.length, gap = 6, x0 = W / 2 - (n - 1) * gap / 2;
        for (let i = 0; i < n; i++) {
          c.globalAlpha = out * (i === ST.i ? .95 : i < ST.i ? .5 : .25);
          c.fillStyle = i === ST.i ? '#f2d48a' : '#c8b898';
          c.beginPath(); c.arc(x0 + i * gap, 265.5, i === ST.i ? 1.3 : .9, 0, PI * 2); c.fill();
        }
        // a quiet hint
        c.globalAlpha = out * .5 * oc((ST.t - 120) / 60) * (ST.i === 0 ? 1 : .6);
        c.font = `400 5px ${SERIF}`; c.textAlign = 'right'; c.textBaseline = 'top'; c.fillStyle = '#b8a890';
        c.fillText(t(`Enter — next   Esc — skip|Enter — дальше   Esc — пропустить|Enter — keyingi   Esc — o'tkazib yuborish`), W - 10, 261);
        void k;
      }
    } finally { c.restore(); }
    EPI.stats.ms += performance.now() - t0;
  });

  /* ---------- music ---------- */
  try {
    const MU = G.Music;
    if (MU && MU.define) {
      MU.define('yd_epilogue', { bpm: 52, root: 45, mode: 'aeolian', vol: .9, echoBeats: 1.5, form: 'A:8 B:8', layers: [
        { drone: 33, g: .1, lp: 2.5, wet: .6 },
        { wind: .025 },
        { pad: [[45, 48, 52], [43, 47, 50], [41, 45, 48], [40, 44, 47]], choir: true, every: 2, hold: 2, level: .1, att: 2.5, rel: 3.5 },
        { bells: [0, 3, 7], oct: 1, chance: .22, every: 4, gain: [.08, .18] },
        { voice: 'ney', root: 57, in: 'B', g: .45, pan: -.15, wet: .65, echo: .35, phrase: '0:16~ -2:8 0:8 | 3:16 2:16 | 0:8 -2:8 -4:16~ | -5:32' }
      ] });
      EPI.track = 'yd_epilogue';
    }
  } catch (e) { console.warn('[epilogue] music', e && e.message); }

  // test hooks
  EPI.sceneIdFor = sceneIdFor; EPI.scenes = () => Object.keys(SCENE_OF); EPI.goTo = n => goTo(n);
  EPI.renderScene = (id, tt) => { const s = want(id); finishScene(s); return s.ready; };
  EPI.paintTo = (c, id, tt, dir) => { c.save(); c.imageSmoothingEnabled = false; c.fillStyle = '#040208'; c.fillRect(0, 0, G.W, G.H); drawSlide(c, { id, dir: dir || 1, dy: 0 }, tt || DUR / 2, 1); c.restore(); };
}
