/* 63_art_bosses.js — graphics overhaul for bosses and enemies (art only).
   Replaces drawBoss/drawFx (plus purely visual intro/phase/death touches) of the boss defs built in 60_world.js,
   and adds detail/idle motion to the common regular enemies. AI, hitboxes, timing and damage are untouched:
   every hook here only reads boss state (state, stateT, teleT, mode, modeT, phase, data.W ...) and paints. */
{
  const KIT = G.BossKit, Art = G.Art, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (KIT && Art && ED) try {
    const TAU = Math.PI * 2, PI = Math.PI;
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const lerp = (a, b, t) => a + (b - a) * t;
    const ease = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
    const outC = t => { t = clamp(t, 0, 1); return 1 - (1 - t) * (1 - t) * (1 - t); };
    const hsh = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
    const RR = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
    const PX = (c, x, y, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); };
    const LX = .45, LY = -.9;                                      // light from above, slightly in front (puppets flip with facing)
    // shaded ellipse, baked once per (size, palette, rotation, light) and blitted: KIT.ball clips and re-fills per shade,
    // which is too slow to repeat ~100 times a frame on software canvas
    const BALLS = new Map();
    const ball = (c, x, y, rx, ry, pal, rot, lx, ly) => {
      rx = Math.max(.6, Math.round(rx * 2) / 2); ry = Math.max(.6, Math.round(ry * 2) / 2);
      rot = Math.round((rot || 0) * 8) / 8; lx = lx === undefined ? LX : Math.round(lx * 4) / 4; ly = ly === undefined ? LY : Math.round(ly * 4) / 4;
      const key = rx + ',' + ry + ',' + rot + ',' + lx + ',' + ly + pal.join('');
      let cv = BALLS.get(key);
      if (!cv) {
        if (BALLS.size > 900) BALLS.clear();
        G.ART_BOSSES && (G.ART_BOSSES.miss = (G.ART_BOSSES.miss || 0) + 1);
        const R = Math.ceil(Math.max(rx, ry)) + 2;
        cv = G.makeCanvas(2 * R, 2 * R, true); KIT.ball(cv.ctx, R, R, rx, ry, pal, lx, ly, rot); cv.o = R; BALLS.set(key, cv);
      }
      c.drawImage(cv, Math.round(x - cv.o), Math.round(y - cv.o));
    };
    const tube = (c, pts, w0, w1, pal, lx, ly) => KIT.tube(c, pts, w0, w1, pal, lx === undefined ? LX : lx, ly === undefined ? LY : ly);
    const polyP = pts => KIT.shape(KIT.SP.poly(pts));
    const cel = (c, pts, pal, ins, lx, ly) => KIT.cel(c, polyP(pts), pal, lx === undefined ? LX : lx, ly === undefined ? LY : ly, ins || pal.slice(1).map((_, i) => 1.5 + 2.2 * i));
    const thick = (c, x0, y0, x1, y1, w, col) => { c.fillStyle = col; const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), h = (w - 1) / 2; for (let i = 0; i <= n; i++) { const u = i / n; c.fillRect(Math.round(x0 + (x1 - x0) * u - h), Math.round(y0 + (y1 - y0) * u - h), w, w); } };
    const fillPoly = (c, pts, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); };
    // world point of a local (facing-relative) point
    const wp = (b, lx, ly) => ({ x: b.x + b.facing * lx, y: b.y + ly });
    const glow = (x, y, r, col, a) => G.Glow.add(x, y, r, col, a);
    const light = (x, y, r, col, a) => G.Light && G.Light.add(x, y, r, col, a);
    const spawn = o => G.FX.spawn(o);
    const onS = (x, y, m) => G.onScreen(x, y, m || 80);
    // own cache of baked parts (keyed canvases; origin stored on the canvas)
    const BAKE = new Map();
    const bake = (key, w, h, ox, oy, fn) => {
      let cv = BAKE.get(key);
      if (!cv) { cv = G.makeCanvas(w, h, true); cv.ctx.save(); cv.ctx.translate(ox, oy); fn(cv.ctx); cv.ctx.restore(); cv.ox = ox; cv.oy = oy; BAKE.set(key, cv); }
      return cv;
    };
    const blit = (c, cv, x, y) => c.drawImage(cv, Math.round(x - cv.ox), Math.round(y - cv.oy));
    // 2-segment limb with a bent elbow (dir = which side the elbow bulges)
    const elbow = (ax, ay, hx, hy, len, dir) => {
      const dx = hx - ax, dy = hy - ay, d = Math.hypot(dx, dy) || 1, h = Math.sqrt(Math.max(0, len * len / 4 - d * d / 4));
      return [(ax + hx) / 2 - dy / d * h * dir, (ay + hy) / 2 + dx / d * h * dir];
    };
    // fingered hand
    const hand = (c, x, y, ang, sz, pal, open) => {
      for (let k = -1; k <= 1; k++) {
        const a = ang + k * (.32 + (open || 0) * .35), l = sz + 1.5 + (open || 0) * 1.5;
        thick(c, x + Math.cos(a) * sz * .5, y + Math.sin(a) * sz * .5, x + Math.cos(a) * l, y + Math.sin(a) * l, 1, pal[1]);
      }
      thick(c, x, y, x + Math.cos(ang - 1.3) * (sz + 1), y + Math.sin(ang - 1.3) * (sz + 1), 1, pal[1]);
      const r = Math.max(1, Math.round(sz * .7));
      RR(c, x - r, y - r + 1, 2 * r, 2 * r - 1, pal[0]); RR(c, x - r + 1, y - r, 2 * r - 1, 2 * r - 1, pal[1]); PX(c, x - r + 1, y - r, pal[2]);
    };
    // a cheap shaded strand (hair, weed): stamped squares, then a thinner lit core; far fewer rects than KIT.tube
    const stamp = (c, x0, y0, x1, y1, w, col) => { c.fillStyle = col; const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / Math.max(1, w * .6))), h = (w - 1) / 2; for (let i = 0; i <= n; i++) { const u = i / n; c.fillRect(Math.round(x0 + (x1 - x0) * u - h), Math.round(y0 + (y1 - y0) * u - h), w, w); } };
    const strandD = (c, P, w0, w1, pal) => {
      const L = P.length - 1;
      for (let i = 0; i < L; i++) { const w = Math.max(1, Math.round(lerp(w0, w1, i / L))); stamp(c, P[i][0], P[i][1], P[i + 1][0], P[i + 1][1], w, pal[0]); }
      for (let i = 0; i < L; i++) { const w = Math.max(1, Math.round(lerp(w0, w1, i / L)) - 2); stamp(c, P[i][0] + .6, P[i][1] - .6, P[i + 1][0] + .6, P[i + 1][1] - .6, w, pal[1]); }
      c.fillStyle = pal[2]; for (let i = 1; i < L; i += 2) c.fillRect(Math.round(P[i][0] + 1), Math.round(P[i][1] - 1), 1, 1);
    };
    // filled ellipse from fillRect rows (cheap, no path, no image)
    const oval = (c, x, y, rw, rh, col) => { c.fillStyle = col; const H = Math.max(1, Math.round(rh * 2)); for (let j = 0; j < H; j++) { const v = (j + .5) / H * 2 - 1, w = Math.max(1, Math.round(rw * 2 * Math.sqrt(Math.max(0, 1 - v * v)))); c.fillRect(Math.round(x - w / 2), Math.round(y - rh + j), w, 1); } };
    // puppet box that flips correctly when the box is not centred on the feet
    const box = (S, b) => ({ w: S.w, h: S.h, ox: b.facing < 0 ? S.w - S.ox : S.ox, oy: S.oy, flip: b.facing < 0, snap: false });
    // boss def helpers
    const B = id => ED[id];
    const phaseK = b => b.mode === 'phase' ? clamp(b.modeT / 40, 0, 1) : 0;           // 0..1 during the phase-change anim
    const dyingK = b => b.mode === 'dying' ? clamp(b.modeT / (b.deathLen || 150), 0, 1) : 0;
    const teleK = b => b.teleT > 0 ? 1 - b.teleT / (b.teleMax || 24) : 0;               // build-up 0..1
    const wrap = (def, name, fn) => { const f0 = def[name]; def[name] = function () { const r = f0 ? f0.apply(this, arguments) : undefined; fn.apply(this, arguments); return r; }; };
    // light-weight particle budget per boss (spawns from drawFx happen once per rendered frame)
    const budget = (b, n) => { const d = b.data || (b.data = {}); d._pf = (d._pf || 0) + 1; return d._pf % n === 0; };
    const ART = G.ART_BOSSES = { ok: [], err: [] };
    const guard = (name, fn) => { try { fn(); ART.ok.push(name); } catch (e) { ART.err.push(name + ': ' + e.message); console.error('[art_bosses] ' + name, e); } };
    // drama shared by every boss: intro summoning column, phase-change floor cracks + inward rush + light pillar,
    // telegraph floor glow, dissolve on death. col = key colour, hot = bright core colour; cy = height of the body centre.
    const CRACKS = [];
    for (let i = 0; i < 9; i++) { const pts = [[0, 0]]; let x = 0, y = 0, a = (i / 9 - .5) * 2.6 + (hsh(i) - .5) * .4; for (let k = 0; k < 6; k++) { x += Math.cos(a) * (8 + hsh(i * 7 + k) * 8) * (i & 1 ? 1 : -1) * (a > 0 ? 1 : 1); y = (hsh(i * 3 + k) - .5) * 2.5; a += (hsh(i * 11 + k) - .5) * .8; pts.push([x, y]); } CRACKS.push(pts); }
    const drama = (ctx, b, col, hot, cy) => {
      const a = KIT.arena(), fy = a.floor, t = b.t;
      if (b.mode === 'intro') {
        const k = clamp(b.modeT / 50, 0, 1);
        if (b.modeT < 70) { glow(b.x, b.y - cy, 30 + 50 * k, col, .3 * (1 - k * .4)); if (budget(b, 2)) spawn({ x: b.x + U.rand(-30, 30), y: fy - U.rand(0, 6), vy: -U.rand(.8, 2.4), life: U.randi(24, 44), size: 1, shape: 'spark', len: 2, color: hot, color2: col, glow: true, glowR: 0 }); }
      }
      if (b.mode === 'phase') {
        const m = b.modeT, k = ease(m / 30), fade = 1 - ease((m - 60) / 30);
        if (m < 30 && budget(b, 1)) { const an = U.rand(0, TAU), r = U.rand(50, 90); spawn({ x: b.x + Math.cos(an) * r, y: b.y - cy + Math.sin(an) * r * .6, vx: -Math.cos(an) * r / 16, vy: -Math.sin(an) * r * .6 / 16, drag: .97, life: 16, size: 1, shape: 'spark', len: 3, color: hot, color2: col, glow: true, glowR: 0 }); }
        // floor cracks of light radiating from the boss
        ctx.globalAlpha = clamp(k * fade, 0, 1);
        for (let i = 0; i < CRACKS.length; i++) {
          const P = CRACKS[i], L = Math.floor(P.length * clamp(m / 34 - i * .03, 0, 1));
          for (let j = 0; j + 1 < L; j++) Art.thick(ctx, b.x + P[j][0], fy + P[j][1] * .4, b.x + P[j + 1][0], fy + P[j + 1][1] * .4, 1, j < 2 ? '#ffffff' : hot);
        }
        ctx.globalAlpha = 1;
        glow(b.x, fy, 50 + 30 * k, col, .3 * k * fade);
        if (m >= 30 && m < 70) { const q = 1 - (m - 30) / 40; ctx.globalAlpha = .35 * q; ctx.fillStyle = hot; ctx.fillRect(Math.round(b.x - 6 * q), Math.round(fy - 200), Math.round(12 * q) + 1, 200); ctx.globalAlpha = 1; glow(b.x, b.y - cy, 60, col, .3 * q); }
        light(b.x, b.y - cy, 140, col, .5 * k * fade);
      }
      if (b.mode === 'fight' && b.teleT > 0) { const k = teleK(b); glow(b.x, fy - 1, 26 + 26 * k, col, .18 + .25 * k); }
      if (b.mode === 'dying') {
        const k = dyingK(b);
        if (budget(b, 1) && k < .95) spawn({ x: b.x + U.rand(-b.w * .7, b.w * .7), y: b.y - U.rand(0, b.h), vy: -U.rand(.5, 1.6), vx: U.rand(-.3, .3), life: U.randi(20, 40), size: U.rand(1, 2), shape: 'sq', color: Math.random() < .5 ? hot : col, glow: true, glowR: 0, grav: -.01 });
        glow(b.x, b.y - cy, 40 + 40 * k, col, .2 + .2 * k);
      }
    };
    const withDrama = (def, col, hot, cy) => { const f = def.drawFx; def.drawFx = function (ctx, b, fr) { try { drama(ctx, b, col, hot, cy); } catch (e) { } return f && f.call(this, ctx, b, fr); }; };

    /* ================================================================== THE GLUTTON
       A mound of Hollow bodies fused around spilled tumars: heads with gaping mouths, reaching arms,
       a long tendril of arms for the whip, a merged fist for the punch. Base AI: jailer (crack/pcrack/pwind/pwait/punch/kick)
       plus slam / spill / call. Local units are world pixels (scale 2.1 champion; hitbox 38x65). */
    guard('glutton', () => {
      const def = B('glutton'); if (!def) return; def._drawBoss0 = def.drawBoss; def._drawFx0 = def.drawFx;
      const SK0 = ['#0c0a12', '#16141e', '#22202c', '#2e2b3a'];                    // far bodies (cool ash, deep shadow)
      const SK1 = ['#100e18', '#1e1a28', '#302b3e', '#463f56', '#5e5670'];         // mid
      const SK2 = ['#14121c', '#262236', '#3c364e', '#57506a', '#776e8a', '#978ea8']; // near
      const RAG = ['#1c1210', '#33221a', '#4c3426', '#684a34'];
      const MOUTH = '#12040a', GUM = '#4a0c18', TOOTH = '#d6ccb8', EYE = '#08060c';
      const GOLD = ['#5a3a10', '#9a6a1c', '#d8a03a', '#ffd77a', '#fff4c8'];
      // fused bodies of the mound: [cx, cy, rx, ry, rot, layer, head end (+1/-1 along the long axis, 0 = none)]
      const BODIES = [
        [-22, -26, 15, 9, -.7, 0, 1], [18, -24, 14, 9, .8, 0, -1], [-2, -52, 12, 8, .2, 0, 1],
        [-14, -14, 20, 11, .12, 1, -1], [12, -32, 16, 11, -.5, 1, 1], [-18, -40, 13, 10, .9, 1, -1], [22, -12, 12, 8, -.15, 1, 1],
        [2, -22, 17, 13, -.1, 2, 0], [-8, -46, 11, 8, -.35, 2, -1], [14, -50, 10, 8, .55, 2, 1]
      ];
      // heads of the fused bodies + extra heads pushing out: [x, y, r, angle(face dir), layer, mouthPhase]
      const HEADS = [[4, -64, 6.5, -1.3, 2, 2.2], [-30, -22, 5, 3.0, 1, 3.1]];
      for (let i = 0; i < BODIES.length; i++) { const q = BODIES[i]; if (!q[6]) continue; const ca = Math.cos(q[4]) * q[6], sa = Math.sin(q[4]) * q[6]; HEADS.push([q[0] + ca * (q[2] + 2), q[1] + sa * (q[2] + 2), q[5] === 0 ? 4.5 : 5, Math.atan2(sa, ca) - .6, q[5], i * 1.3]); }
      // faces pressed into the front of the mound (eyes + mouths only)
      const FACES = [[-6, -28, 1.1, .3], [10, -18, .9, 2.1], [-16, -16, .8, 4.2]];
      // arms: [shoulderX, shoulderY, restX, restY, len, layer, kind] kind 0 = props on ground, 1 = reaching, 2 = flailing up
      const ARMS = [[-26, -16, -40, 0, 26, 0, 0], [24, -14, 36, 0, 24, 0, 0], [-20, -48, -36, -66, 22, 1, 2], [-8, -52, -14, -78, 22, 1, 2],
        [14, -38, 40, -50, 28, 1, 1], [20, -24, 44, -30, 28, 2, 1], [-30, -32, -48, -40, 22, 2, 2], [6, -10, 30, 0, 22, 2, 0]];
      // embedded tumars [x, y, rot, size]
      const TUMS = [[-6, -24, .2, 4], [12, -36, -.3, 3], [-18, -34, .5, 3], [4, -48, 0, 3], [-24, -14, -.2, 3], [18, -18, .3, 3]];
      const tumar = (c, x, y, rot, s, pal) => {
        c.save(); c.translate(Math.round(x), Math.round(y)); c.rotate(rot);
        fillPoly(c, [-s - 1, s * .7 + 1, s + 1, s * .7 + 1, 0, -s - 1], pal[0]);
        fillPoly(c, [-s, s * .7, s, s * .7, 0, -s], pal[2]);
        fillPoly(c, [-s * .45, s * .5, s * .2, s * .5, -s * .1, -s * .45], pal[3]);
        c.restore();
        RR(c, x, y - 1, 1, 1, pal[4]);
      };
      const head = (c, h, t, open, bright) => {
        const [x, y, r, a, layer] = h, pal = layer === 0 ? SK0 : layer === 1 ? SK1 : SK2;
        const fx = Math.cos(a), fy = Math.sin(a);
        ball(c, x, y + .5, r + 1.2, r * 1.08 + 1.2, [pal[0], pal[0]], 0);
        ball(c, x, y, r, r * 1.08, pal.slice(0, 4), 0);
        // hair strands
        for (let k = 0; k < 3; k++) thick(c, x - fx * r * .6 + (k - 1) * 2, y - r * .7, x - fx * (r + 3) + (k - 1) * 3, y - r * .3 + 3 + k, 1, RAG[0]);
        const ex = x + fx * r * .45, ey = y + fy * r * .3 - 1;
        RR(c, ex - 2, ey - 1, 2, 2, EYE); RR(c, ex + 1, ey - 1, 2, 2, EYE);
        if (bright) { RR(c, ex - 2, ey - 1, 1, 1, '#ffe7a0'); RR(c, ex + 1, ey - 1, 1, 1, '#ffe7a0'); }
        if (open < 0) return;
        const mw = Math.max(2, r * .55), mh = 1 + open * r * .9, mx = x + fx * r * .4, my = y + r * .45 + fy * 1.5;
        oval(c, mx, my + mh / 2, mw, Math.max(1, mh / 2 + .5), MOUTH);
        if (open > .3) { RR(c, mx - mw + 1, my, 1, 1, TOOTH); RR(c, mx + mw - 2, my, 1, 1, TOOTH); RR(c, mx - 1, my + mh, 2, 1, GUM); }
      };
      const arm = (c, sx, sy, hx, hy, len, layer, dir, open) => {
        const pal = layer === 0 ? SK0 : layer === 1 ? SK1 : SK2, e = elbow(sx, sy, hx, hy, len, dir);
        tube(c, [[sx, sy], e, [hx, hy]], layer === 2 ? 5 : 4, 3, pal.slice(0, 3));
        hand(c, hx, hy, Math.atan2(hy - e[1], hx - e[0]), 2.6, pal.slice(1), open);
      };
      // the arm-tendril (whip): list of points from shoulder to tip
      const tendril = (b, out) => {
        const s = b.state, n = b.stateT, d = b.data, P = [];
        const sx = 16, sy = -40, N = 12;
        let L = 0, ang = -.15, curl = 0, swirl = false, toPl = null;
        if (d.lash) { L = d.lash.L; ang = d.lash.a; curl = d.lash.curl || 0; }                  // stage 8a: the move drives the whip
        else if (s === 'wwind') { L = lerp(20, 34, ease(n / 14)); ang = lerp(-.6, -2.4, ease(n / 14)); curl = .5; }
        else if (s === 'crack' || s === 'pcrack') { const max = s === 'crack' ? 150 : 166; const k = n < 4 ? outC(n / 4) : 1 - ease((n - 9) / 12); L = lerp(30, max, k); ang = lerp(-2.4, s === 'crack' ? -.12 : -.05, outC(n / 4)); curl = .12 * (1 - k); }
        else if (s === 'pwind') { swirl = true; L = 40; }
        else if ((s === 'pwait' || (d.pull || 0) > 0) && b.player) { toPl = b.player; }
        else return null;
        for (let i = 0; i <= N; i++) {
          const u = i / N;
          if (swirl) { const a = b.t * .34 - u * 4.2; P.push([sx + Math.cos(a) * u * 40, sy - 12 + Math.sin(a) * u * 14 - u * 8]); }
          else if (toPl) { const px = (toPl.x - b.x) * b.facing, py = toPl.y - 14 - b.y; P.push([lerp(sx, px, u), lerp(sy, py, u) - Math.sin(u * PI) * 10 + Math.sin(b.t * .5 + u * 9) * 1.5]); }
          else { const a = ang + curl * Math.sin(u * 5 + b.t * .3) + Math.sin(u * 7 - b.t * .45) * .05; P.push([sx + Math.cos(a) * u * L, sy + Math.sin(a) * u * L + Math.sin(u * 9 + b.t * .3) * 2 * (1 - u)]); }
        }
        if (out) out.push(...P);
        return P;
      };
      // static flesh baked per layer (bodies, rags, heads without mouths, sunken faces); mouths and arms stay live
      const LAYER = l => bake('glutL' + l, 150, 120, 75, 104, c => {
        const pal = l === 0 ? SK0 : l === 1 ? SK1 : SK2;
        if (l === 0) for (let i = 0; i < 9; i++) { const x = -34 + i * 8 + hsh(i) * 4, y = -1 - hsh(i + 9) * 2; tumar(c, x, y, hsh(i + 3) * 2 - 1, 2 + (i % 3 === 0), GOLD); }
        for (const q of BODIES) if (q[5] === l) {
          const [x, y, rx, ry, rot] = q;
          ball(c, x, y + 1, rx + 1.5, ry + 1.5, [pal[0], pal[0]], rot);
          ball(c, x, y, rx, ry, pal.slice(0, 4), rot);
          const ca = Math.cos(rot), sa = Math.sin(rot);
          for (let k = -2; k <= 2; k++) { const px = x + ca * k * rx * .3, py = y + sa * k * rx * .3; thick(c, px - sa * ry * .4, py + ca * ry * .4, px - sa * ry * .75, py + ca * ry * .75, 1, pal[1]); }
          if (l === 2) PX(c, x - rx * .3, y - ry * .5, pal[pal.length - 1]);
        }
        if (l === 1) { cel(c, [-30, -20, -14, -30, 6, -26, 18, -32, 26, -18, 14, -8, -6, -6, -24, -6], RAG.slice(0, 3), [1.5, 3.5]); for (let k = 0; k < 6; k++) thick(c, -26 + k * 9, -9, -27 + k * 9 + Math.sin(k), -2, 1, RAG[0]); }
        for (const h of HEADS) if (h[4] === l) head(c, h, 0, -1, false);
        if (l === 2) for (const [x, y, sc] of FACES) {
          ball(c, x + .5, y, 5 * sc + 1, 6 * sc + 1, [SK2[0], SK2[1]], 0);
          RR(c, x - 3 * sc, y - 3, 2, 3, EYE); RR(c, x + 2 * sc, y - 3, 2, 3, EYE);
          thick(c, x - 4 * sc, y - 4, x - 1, y - 6, 1, SK2[3]); thick(c, x + 1, y - 6, x + 4 * sc, y - 4, 1, SK2[3]);
        }
      });
      const TUMB = () => bake('glutT', 150, 120, 75, 104, c => { for (const q of TUMS) tumar(c, q[0], q[1], q[2], q[3], GOLD); });
      const SPR0 = { w: 132, h: 108, ox: 66, oy: 99 }, SPR1 = { w: 250, h: 132, ox: 62, oy: 112 };
      const SCR = new Map(), scr = S => { let v = SCR.get(S); if (!v) { v = G.makeCanvas(S.w, S.h, true); SCR.set(S, v); } return v; };
      const drawBody = (c, b, S) => {
        const s = b.state, n = b.stateT, t = b.t, ph = b.phase, d = b.data, dk = dyingK(b), pk = phaseK(b);
        const breathe = Math.sin(t * .06), walk = Math.abs(b.vx) > .15 && b.onGround ? Math.sin(t * .22) : 0;
        let sqx = 1 + breathe * .015, sqy = 1 - breathe * .02, lean = walk * .04, tx = 0, ty = 0;
        // anticipation / follow-through
        if (s === 'slam') { const W = d.W || 24; if (n < W) { const k = ease(n / W); sqx += .14 * k; sqy -= .16 * k; } else if (!b.onGround) { sqx -= .1; sqy += .14; } else if (d.landT) { const k = 1 - ease((n - d.landT) / 14); sqx += .22 * k; sqy -= .2 * k; } }
        if (s === 'wwind' || s === 'pwind') lean -= .1 * ease(n / 12);
        if (s === 'crack' || s === 'pcrack') lean += .14 * (1 - ease((n - 4) / 16));
        if (s === 'punch') { const k = n < 4 ? outC(n / 4) : 1 - ease((n - 8) / 18); lean += .22 * k; tx += 4 * k; }
        if (s === 'pwait') lean -= .12;
        if (s === 'kwind') { lean -= .1 * ease(n / 10); sqy -= .05; }
        if (s === 'kick') { const k = n < 3 ? outC(n / 3) : 1 - ease((n - 6) / 16); tx += 8 * k; lean += .1 * k; }
        if (s === 'spill' || s === 'call') { const W = d.W || 26, k = ease(n / W); sqy += .06 * k * Math.sin(t * .8); lean -= .08 * k; }
        if (s === 'recover') lean += .06 * (1 - ease(n / 20));
        if (b.mode === 'phase') { tx += Math.sin(t * 1.7) * 1.5 * (1 - pk * .5); sqy += .04 * Math.sin(t * .9); }
        if (dk) { sqy *= 1 - .55 * ease(dk * 1.2); sqx *= 1 + .25 * ease(dk); tx += Math.sin(t * 1.3) * 2 * (1 - dk); }
        // everything is painted untransformed into a scratch canvas, then squashed/leaned with one blit
        const main = c, sc = scr(S); c = sc.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, S.w, S.h); c.imageSmoothingEnabled = false; c.translate(S.ox, S.oy);
        const mouthBase = s === 'spill' || s === 'call' ? .85 + .15 * Math.sin(t * .5) : b.teleT > 0 ? .6 + .4 * teleK(b) : b.mode === 'phase' ? 1 : .2;
        const bright = b.teleT > 0 || b.mode === 'phase' || ph >= 2;
        for (const layer of [0, 1, 2]) {
          for (const a of ARMS) if (a[5] === layer && a[6] === 0) {
            const st = Math.sin(t * .22 + a[0]) * (walk ? 6 : 1);
            arm(c, a[0], a[1], a[2] + st, a[3] - Math.max(0, Math.sin(t * .22 + a[0])) * (walk ? 4 : 0), a[4], layer, a[0] < 0 ? -1 : 1, .2);
          }
          const L = LAYER(layer); c.drawImage(L, -L.ox, -L.oy);
          for (const h of HEADS) if (h[4] === layer) {         // live mouths (and golden pupils when awake)
            const [x, y, r, an] = h, fx = Math.cos(an), fy = Math.sin(an), open = clamp(mouthBase + .35 * Math.sin(t * .09 + h[5]), 0, 1);
            const mw = Math.max(2, r * .55), mh = 1 + open * r * .9, mx = x + fx * r * .4, my = y + r * .45 + fy * 1.5;
            oval(c, mx, my + mh / 2, mw, Math.max(1, mh / 2 + .5), MOUTH);
            if (open > .3) { RR(c, mx - mw + 1, my, 1, 1, TOOTH); RR(c, mx + mw - 2, my, 1, 1, TOOTH); RR(c, mx - 1, my + mh, 2, 1, GUM); }
            if (bright) { const ex = x + fx * r * .45, ey = y + fy * r * .3 - 1; RR(c, ex - 2, ey - 1, 1, 1, '#ffe7a0'); RR(c, ex + 1, ey - 1, 1, 1, '#ffe7a0'); }
          }
          if (layer === 2) for (const [x, y, sc0, phs] of FACES) {
            const mo = clamp(mouthBase + .4 * Math.sin(t * .07 + phs), 0, 1);
            oval(c, x + .5, y + 2 + mo * 2.5, 1.2 * sc0 + .5, 1.2 + mo * 3.2 * sc0, MOUTH); oval(c, x + .5, y + 2.5 + mo * 3, .8 * sc0, .5 + mo * 1.6 * sc0, GUM);
            if (mo > .4) { PX(c, x - 1, y + 1, TOOTH); PX(c, x + 2, y + 1, TOOTH); }
          }
          const pal = layer === 0 ? SK0 : layer === 1 ? SK1 : SK2;
          for (const a of ARMS) if (a[5] === layer && a[6] !== 0) {
            let hx = a[2], hy = a[3];
            const wav = Math.sin(t * .07 + a[0] * .3);
            if (a[6] === 2) { hx += wav * 4; hy += Math.cos(t * .06 + a[1]) * 3; }
            else { const reach = b.player ? .5 + .5 * Math.sin(t * .05 + a[1]) : 0; hx += reach * 6 + wav * 2; hy += wav * 2; }
            if (s === 'call' || s === 'spill') { hy -= 10 * ease(n / 20); hx += (a[0] < 0 ? -6 : 6) * ease(n / 20); }
            if (b.mode === 'phase' || dk) { hx += Math.sin(t * .6 + a[0]) * 5; hy -= 6; }
            arm(c, a[0], a[1], hx, hy, a[4], layer, a[6] === 2 ? (a[0] < 0 ? 1 : -1) : 1, .6 + .4 * wav);
          }
        }
        // embedded tumars (dull in the puppet, the glow is drawn unlit in drawFx)
        { const T = TUMB(); c.drawImage(T, -T.ox, -T.oy); }
        // the maw: a gaping mouth in the front-top body
        const mo = clamp(mouthBase + (s === 'punch' || s === 'crack' ? .4 : 0), 0, 1);
        oval(c, 16, -40, 8, 3 + mo * 6, MOUTH); oval(c, 16, -39, 5, 1.5 + mo * 4, GUM); oval(c, 16, -38.5, 3, .5 + mo * 3, MOUTH);
        for (let k = 0; k < 5; k++) { RR(c, 10 + k * 3, -42 - mo * 5 + (k & 1), 1, 2, TOOTH); RR(c, 11 + k * 3, -38 + mo * 5 - (k & 1), 1, 2, TOOTH); }
        // merged fist (punch) / sweeping legs-of-arms (kick)
        if (s === 'pwait' || s === 'punch' || d.fist) {
          const k = s === 'punch' ? (n < 4 ? outC(n / 4) : 1 - ease((n - 10) / 16)) : 0;
          let fx = lerp(-6, 46, k), fy = lerp(-58, -30, k), ex = lerp(-2, 26, k), ey = lerp(-58, -40, k);
          if (d.fist) { fx = d.fist.x; fy = d.fist.y; ex = (8 + fx) / 2 - 6; ey = Math.min(-36, fy) - 10; }   // stage 8a: the ram is driven by the move
          tube(c, [[8, -36], [ex, ey], [fx, fy]], 11, 8, SK2.slice(0, 4));
          ball(c, fx, fy, 9, 8, SK2.slice(0, 5), 0);
          for (let i = 0; i < 4; i++) thick(c, fx + 4, fy - 5 + i * 3, fx + 9, fy - 5 + i * 3, 1, SK2[1]);
          tumar(c, fx - 2, fy, .3, 3, GOLD);
        }
        if (s === 'kwind' || s === 'kick') {
          const k = s === 'kick' ? (n < 3 ? outC(n / 3) : 1 - ease((n - 8) / 14)) : -.3 * ease(n / 10);
          for (let i = 0; i < 3; i++) arm(c, 10 + i * 4, -14 + i * 3, lerp(26, 52, k) - i * 3, -6 - i * 4, 26, 2, 1, 1);
        }
        // the tendril of arms
        const P = tendril(b);
        if (P) {
          tube(c, P, 8, 4, SK2.slice(0, 4));
          for (let i = 2; i < P.length - 1; i += 2) {
            const a = Math.atan2(P[i + 1][1] - P[i - 1][1], P[i + 1][0] - P[i - 1][0]), side = i & 2 ? 1 : -1;
            const hx = P[i][0] + Math.cos(a + side * 1.2) * 6, hy = P[i][1] + Math.sin(a + side * 1.2) * 6;
            tube(c, [P[i], [hx, hy]], 3, 2, SK1.slice(1, 4)); hand(c, hx, hy, a + side * .6, 2, SK1.slice(1), 1);
          }
          const tp = P[P.length - 1], a = Math.atan2(tp[1] - P[P.length - 2][1], tp[0] - P[P.length - 2][0]);
          hand(c, tp[0], tp[1], a, 4.5, SK2.slice(1), s === 'pwait' ? .2 : 1);
        }
        main.translate(tx, ty); main.scale(sqx, sqy); if (lean) main.transform(1, 0, lean, 1, 0, 0);
        main.drawImage(sc, -S.ox, -S.oy);
      };
      def.drawBoss = function (ctx, b) {
        const P = (b.state === 'wwind' || b.state === 'crack' || b.state === 'pcrack' || b.state === 'pwind' || b.state === 'pwait' || (b.data.pull || 0) > 0 || !!b.data.lash || !!b.data.fist);
        const S = P ? SPR1 : SPR0;
        KIT.puppet(ctx, b.x, b.y, Object.assign(b.popts(), box(S, b)), c => { c.imageSmoothingEnabled = false; drawBody(c, b, S); });
      };
      def.rims = () => [{ color: '#ffd9a0', dx: 1, dy: -1, a: .5 }, { color: '#8a7ab8', dx: -1, dy: 0, a: .3 }];
      def.outline = '#0a0610';
      def.telePos = b => ({ x: b.x, y: b.y - 84 });
      def.drawFx = function (ctx, b) {
        if (b.alpha < .1) return;
        const t = b.t, ph = b.phase, tk = teleK(b), dk = dyingK(b), pk = phaseK(b), f = b.facing;
        const sq = 1 - (dk ? .55 * ease(dk * 1.2) : 0);
        const P = (x, y) => wp(b, x, y * sq);
        // tumar glows (emissive), stronger with phase, telegraph and the phase change
        const base = .35 + .25 * (ph - 1) + .4 * tk + .5 * pk;
        for (let i = 0; i < TUMS.length; i++) {
          const q = TUMS[i], p = P(q[0], q[1]), pul = .7 + .3 * Math.sin(t * .1 + i * 1.7);
          ctx.fillStyle = '#fff4c8'; ctx.fillRect(Math.round(p.x), Math.round(p.y - 1), 1, 1);
          ctx.fillStyle = '#ffd77a'; ctx.fillRect(Math.round(p.x - f), Math.round(p.y), 1, 1);
          glow(p.x, p.y, 8 + 5 * base, '#ffc850', clamp(base * pul * .7, 0, .6));
        }
        const fl = P(0, -2); glow(fl.x, fl.y, 40, '#ffb030', .14 + .06 * Math.sin(t * .07)); light(fl.x, fl.y - 30, 110, '#e0b0a0', .3);
        // the maw glows on telegraph / spill / call
        const m = P(16, -38);
        if (tk > 0 || b.state === 'spill' || b.state === 'call' || b.mode === 'phase') {
          const k = Math.max(tk, b.mode === 'phase' ? 1 : .7);
          glow(m.x, m.y, 14 + 10 * k, '#ffd060', .3 + .25 * k);
          if (budget(b, 2)) spawn({ x: m.x + U.rand(-5, 5), y: m.y + U.rand(-2, 3), vx: f * U.rand(-.3, .6), vy: -U.rand(.4, 1.4), life: U.randi(16, 30), size: 1, shape: 'spark', len: 1, color: '#fff4c8', color2: '#ffb030', glow: true, glowR: 0, grav: -.02 });
        }
        // eyes of every head: pinpricks of remembered gold when awake
        if (tk > 0 || ph >= 2 || b.mode === 'phase') for (const h of HEADS) {
          const e = P(h[0] + Math.cos(h[3]) * h[2] * .45, h[1] + Math.sin(h[3]) * h[2] * .3 - 1);
          ctx.fillStyle = tk > .5 ? '#ffffff' : '#ffe08a'; ctx.fillRect(Math.round(e.x - 1), Math.round(e.y), 1, 1); ctx.fillRect(Math.round(e.x + 1 * f + (f > 0 ? 1 : -1)), Math.round(e.y), 1, 1);
          glow(e.x, e.y, 8, '#ffd060', .45);
        }
        // phase 2+: cracks of light across the flesh, orbiting memory-tumars
        if (ph >= 2 || b.mode === 'phase') {
          const k = b.mode === 'phase' ? pk : 1;
          const CR = [[-20, -30, -8, -36, 2, -30, 10, -40], [-2, -14, 6, -22, 16, -20], [-16, -46, -6, -52, 4, -50]];
          ctx.globalAlpha = (.55 + .35 * Math.sin(t * .12)) * k;
          for (const cr of CR) for (let i = 0; i + 3 < cr.length; i += 2) {
            const a = P(cr[i], cr[i + 1]), c2 = P(cr[i + 2], cr[i + 3]);
            Art.thick(ctx, a.x, a.y, c2.x, c2.y, 1, '#ffe9a8');
          }
          ctx.globalAlpha = 1;
          for (let i = 0; i < 5; i++) {
            const a = t * .03 + i * TAU / 5, r = 40 + 6 * Math.sin(t * .05 + i), c0 = P(Math.cos(a) * r, -34 + Math.sin(a) * r * .45);
            if (Math.sin(a) < -.2 && dk === 0) continue;                           // behind the mound
            ctx.fillStyle = '#ffd77a'; ctx.fillRect(Math.round(c0.x) - 1, Math.round(c0.y), 3, 1); ctx.fillRect(Math.round(c0.x), Math.round(c0.y) - 1, 1, 1);
            ctx.fillStyle = '#fff8e0'; ctx.fillRect(Math.round(c0.x), Math.round(c0.y), 1, 1);
            glow(c0.x, c0.y, 12, '#ffc040', .55 * k);
          }
        }
        // the tendril's tip sparks while it winds up
        if ((b.state === 'wwind' || b.state === 'pwind') && b.stateT > 10) { const tp = tendril(b); if (tp) { const q = tp[tp.length - 1], p = P(q[0], q[1]); glow(p.x, p.y, 16, '#ff6040', .6); if (budget(b, 2)) spawn({ x: p.x, y: p.y, life: 10, size: 1, shape: 'spark', len: 1, color: '#fff2c0', glow: true, glowR: 0 }); } }
        if (b.state === 'slam' && b.stateT < (b.data.W || 24)) { const g = P(0, -2); glow(g.x, g.y, 30 + 30 * ease(b.stateT / (b.data.W || 24)), '#ffcf4a', .5); }
        // dying: tumars spill out of the collapsing mound
        if (dk > 0 && dk < .9 && budget(b, 3)) { const p = P(U.rand(-30, 30), U.rand(-50, -10)); spawn({ x: p.x, y: p.y, vx: U.rand(-1.5, 1.5), vy: -U.rand(1, 3), grav: .15, life: 50, size: 2, shape: 'sq', color: '#ffd77a', glow: true, glowR: 0, bounce: true }); }
      };
      wrap(def, 'onPhase', () => {});
    });

    /* ================================================================== BAHODIR, THE GILDED HOUND
       A towering warrior of the Divan: gilded lamellar, a hound-faced helm with a horsehair plume, crimson kaftan and cloak,
       a round gilded shield (the guard's frontal block stays readable) and a great glaive.
       Base AI: guard (twind/thrust, bwind/bash, broken) + charge / leap / coins / pack. Champion scale 2.3 (hitbox 37x69). */
    guard('hound', () => {
      const def = B('hound'); if (!def) return; def._drawBoss0 = def.drawBoss; def._drawFx0 = def.drawFx;
      const GOLD = ['#1e1006', '#40260a', '#6c4612', '#9a6c22', '#c8983a', '#f2d890'];
      const GOLDD = ['#160c06', '#32200a', '#563810', '#7c561c', '#a8802e'];
      const CRIM = ['#16040a', '#300810', '#521018', '#761a22', '#962c2c'];
      const MAIL = ['#161824', '#2c3044', '#4c5470', '#7a84a0'];
      const LEA = ['#140c08', '#2c1a10', '#4a2e1a', '#6a4426'];
      const SHAFT = ['#1a0c06', '#3c2010', '#6a3a1a', '#8e5426'];
      const STEEL = ['#20283a', '#4a5670', '#8a96b0', '#d0d8e8', '#ffffff'];
      const SPRI = { w: 124, h: 150, ox: 60, oy: 138 }, SPRW = { w: 250, h: 150, ox: 92, oy: 138 }, SPRU = { w: 124, h: 184, ox: 60, oy: 172 };
      const WIDE = { twind: 1, thrust: 1, charge: 1, leap: 1, broken: 1, bash: 1, bwind: 1, recover: 1 };
      // pose: everything in local px, x forward
      const pose = b => {
        const s = b.state, n = b.stateT, t = b.t, d = b.data, W = d.W || 24;
        const run = Math.abs(b.vx) > .2 && b.onGround, cyc = t * (Math.abs(b.vx) > 3 ? .45 : .2);
        const P = { lean: 0, crouch: 0, hipX: 0, fF: [10, 0], bF: [-9, 0], fLift: 0, bLift: 0,
          sh: [6, -62], sb: [-5, -61], shield: [16, -42], shA: 0, shieldUp: 1, grip: [-2, -46], gA: -1.45, gB: null,
          head: 0, helmUp: 0, cape: 0, plume: 0, broken: 0, roar: 0 };
        // idle breathing
        P.crouch = Math.sin(t * .05) * .8;
        if (run) {
          const a = Math.sin(cyc), c2 = Math.cos(cyc);
          P.fF = [8 + 9 * a, -Math.max(0, c2) * 5]; P.bF = [-8 - 9 * a, -Math.max(0, -c2) * 5];
          P.crouch = Math.abs(a) * 1.5; P.lean = .08; P.cape = 1;
        }
        if (s === 'twind') { const k = ease(n / 16); P.grip = [lerp(-2, -16, k), lerp(-46, -50, k)]; P.gA = lerp(-1.45, -.05, ease(n / 10)); P.lean = -.1 * k; P.crouch = 3 * k; P.fF = [14, 0]; P.bF = [-12, 0]; P.shield = [18, -46]; }
        if (s === 'thrust') { const k = n < 4 ? outC(n / 4) : 1 - ease((n - 12) / 16); P.grip = [lerp(-16, 30, k), -46]; P.gA = -.02; P.lean = .16 * k; P.crouch = 4 * k; P.fF = [lerp(14, 22, k), 0]; P.bF = [-14, 0]; P.shield = [lerp(18, 6, k), -40]; P.cape = 1; }
        if (s === 'bwind') { const k = ease(n / 10); P.shield = [lerp(16, 6, k), -46]; P.lean = -.08 * k; P.crouch = 4 * k; P.grip = [-10, -44]; P.gA = -1.9; }
        if (s === 'bash') { const k = n < 3 ? outC(n / 3) : 1 - ease((n - 8) / 14); P.shield = [lerp(6, 32, k), -40]; P.lean = .2 * k; P.crouch = 3; P.fF = [18, 0]; P.bF = [-12, 0]; P.grip = [-10, -44]; P.gA = -1.9; P.cape = 1; }
        if (s === 'broken') { const k = 1 - ease((n - 30) / 26); P.broken = k; P.shield = [lerp(16, -6, k), lerp(-42, -34, k)]; P.shA = 1.1 * k; P.shieldUp = 0; P.lean = -.18 * k; P.head = -.3 * k; P.crouch = 5 * k; P.grip = [-6, -40]; P.gA = -1.2; }
        if (s === 'recover') { P.lean = .05 * (1 - ease(n / 20)); }
        if (s === 'guard') { const k = ease(n / 10); P.shield = [lerp(16, 22, k), lerp(-42, -50, k)]; P.lean = -.04 * k; P.crouch = 3 * k; P.grip = [-6, -44]; P.gA = lerp(-1.45, -1.8, k); }   // stage 8a: the front block
        if (s === 'charge') {
          if (n < W) { const k = ease(n / W); P.crouch = 6 * k; P.lean = .22 * k; P.grip = [lerp(-2, 18, k), lerp(-46, -40, k)]; P.gA = lerp(-1.45, .12, k); P.fF = [16, 0]; P.bF = [-16, 0]; }
          else { const a = Math.sin(t * .5); P.lean = .28; P.crouch = 5; P.grip = [22, -40]; P.gA = .1; P.fF = [12 + 12 * a, -Math.max(0, Math.cos(t * .5)) * 6]; P.bF = [-12 - 12 * a, -Math.max(0, -Math.cos(t * .5)) * 6]; P.cape = 2; }
        }
        if (s === 'leap') {
          if (n < W) { const k = ease(n / W); P.crouch = 9 * k; P.lean = .1 * k; P.grip = [lerp(-2, -8, k), lerp(-46, -66, k)]; P.gA = lerp(-1.45, -2.4, k); P.helmUp = .3 * k; }
          else if (!b.onGround) { P.crouch = -2; P.grip = [0, -74]; P.gA = -2.6; P.fF = [10, -10]; P.bF = [-8, -6]; P.cape = 2; P.helmUp = .2; }
          else { const k = 1 - ease((n - (d.landT || n)) / 20); P.crouch = 10 * k; P.grip = [lerp(-2, 26, k), lerp(-46, -20, k)]; P.gA = lerp(-1.45, .9, k); P.lean = .2 * k; }
        }
        if (s === 'coins') { const k = n < W ? ease(n / W) : 1 - ease((n - W) / 30); P.grip = [lerp(-2, 4, k), lerp(-46, -76, k)]; P.gA = lerp(-1.45, -1.62, k); P.helmUp = .25 * k; P.lean = -.06 * k; P.shield = [lerp(16, 22, k), lerp(-42, -50, k)]; }
        if (s === 'pack') { const k = n < 26 ? ease(n / 26) : 1 - ease((n - 26) / 30); P.helmUp = .5 * k; P.roar = k; P.grip = [lerp(-2, -6, k), lerp(-46, -80, k)]; P.gA = -1.57; P.lean = -.12 * k; }
        if (b.mode === 'phase') { const k = phaseK(b); P.helmUp = .45 * k; P.roar = k; P.grip = [-6, -78 * k - 46 * (1 - k)]; P.gA = -1.57; P.lean = -.1 * k; }
        if (b.mode === 'intro') { const k = ease((b.modeT - 50) / 20) * (1 - ease((b.modeT - 90) / 20)); P.helmUp = .4 * k; P.roar = k; }
        const dk = dyingK(b);
        if (dk) { const k = ease(dk * 1.6); P.crouch = 14 * k; P.lean = .25 * k; P.head = .5 * k; P.grip = [lerp(-2, 20, k), lerp(-46, -10, k)]; P.gA = lerp(-1.45, .5, k); P.shieldUp = 0; P.shield = [10, -24]; }
        if (b.hurtT > 0 || b.flashT > 3) P.lean -= .04;
        return P;
      };
      // lamellar plates on a torso polygon area (rows of small gilded scales)
      const lamellar = (c, x0, y0, w, h, pal, sh) => {
        for (let r = 0; r < h; r += 3) {
          RR(c, x0, y0 + r + 2, w + 1, 1, pal[0]);
          for (let x = 0; x < w; x += 3) {
            const off = (r / 3) & 1 ? 1 : 0, xx = x0 + x + off, lit = (x + sh) / w;
            RR(c, xx, y0 + r, 2, 2, pal[lit > .55 ? 4 : lit < .2 ? 2 : 3]);
            if (lit > .45) PX(c, xx, y0 + r, pal[5]);
          }
        }
      };
      const leg = (c, hip, foot, lift, pal) => {
        const knee = elbow(hip[0], hip[1], foot[0], foot[1] - lift, 34, 1);
        tube(c, [hip, knee], 9, 7, CRIM.slice(1, 4));
        tube(c, [knee, [foot[0], foot[1] - lift - 2]], 7, 6, pal);
        // knee guard + boot with upturned toe
        ball(c, knee[0] + 1, knee[1], 3.5, 3, GOLD.slice(1, 5));
        const fx = foot[0], fy = foot[1] - lift;
        fillPoly(c, [fx - 4, fy - 4, fx + 5, fy - 4, fx + 8, fy - 2, fx + 9, fy - 4, fx + 8, fy, fx - 4, fy], LEA[1]);
        RR(c, fx - 3, fy - 4, 8, 1, LEA[3]);
      };
      const glaive = (c, g, a, len) => {
        const ca = Math.cos(a), sa = Math.sin(a), px = -sa, py = ca;
        const butt = [g[0] - ca * 34, g[1] - sa * 34], head = [g[0] + ca * len, g[1] + sa * len];
        tube(c, [butt, head], 3, 3, SHAFT.slice(0, 3));
        // gold bands on the shaft
        for (const u of [-30, -6, 14, len - 2]) { const x = g[0] + ca * u, y = g[1] + sa * u; ball(c, x, y, 2.2, 2.2, GOLD.slice(2, 5)); }
        // tassel (red horsehair) below the blade
        const tx = g[0] + ca * (len - 4), ty = g[1] + sa * (len - 4);
        thick(c, tx, ty, tx - ca * 2 + 1, ty + 7, 2, CRIM[3]); thick(c, tx + 1, ty, tx + 2, ty + 8, 1, CRIM[4]);
        // the great curved blade
        const L = 26, Wd = 7, pts = [];
        for (let i = 0; i <= 6; i++) { const u = i / 6, bow = Math.sin(u * PI) * Wd * .9 + u * 2; pts.push(head[0] + ca * L * u + px * bow, head[1] + sa * L * u + py * bow); }
        for (let i = 6; i >= 0; i--) { const u = i / 6, bow = -1 - (1 - u) * 2 + Math.sin(u * PI) * 1.5; pts.push(head[0] + ca * L * u + px * bow, head[1] + sa * L * u + py * bow); }
        fillPoly(c, pts, STEEL[0]);
        const inner = []; for (let i = 0; i < pts.length; i += 2) { inner.push(lerp(pts[i], head[0] + ca * 12, .2), lerp(pts[i + 1], head[1] + sa * 12, .2)); }
        fillPoly(c, inner, STEEL[2]);
        // cutting edge highlight + gilded spine engraving
        for (let i = 1; i < 6; i++) { const u = i / 6, bow = Math.sin(u * PI) * Wd * .9 + u * 2; PX(c, head[0] + ca * L * u + px * (bow - .5), head[1] + sa * L * u + py * (bow - .5), STEEL[3]); }
        for (let i = 1; i < 5; i++) { const u = i / 6; PX(c, head[0] + ca * L * u - px * .5, head[1] + sa * L * u - py * .5, GOLD[4]); }
        return { tip: [head[0] + ca * L, head[1] + sa * L], head };
      };
      const shield = (c, x, y, a, broken, t) => {
        ball(c, x, y, 10, 11, GOLDD.slice(0, 4), 0);
        ball(c, x + .5, y, 8.5, 9.5, GOLD.slice(1, 5), 0);
        // crimson field + gold boss + rivets
        ball(c, x + 1, y, 5.5, 6.5, CRIM.slice(1, 4), 0);
        ball(c, x + 1, y, 2.6, 2.8, GOLD.slice(2, 6), 0);
        for (let i = 0; i < 6; i++) { const q = i * TAU / 6 + .3; PX(c, x + 1 + Math.cos(q) * 7.5, y + Math.sin(q) * 8.3, GOLD[5]); }
        if (broken) { thick(c, x - 4, y - 8, x + 1, y - 1, 1, GOLD[0]); thick(c, x + 1, y - 1, x - 2, y + 6, 1, GOLD[0]); }
      };
      const helm = (c, P, t, ph, local) => {
        c.save(); if (!local) { c.translate(2, -68); c.rotate(P.head - P.helmUp); }
        // aventail (mail curtain) behind
        for (let x = -7; x <= 5; x += 2) for (let y = 2; y < 9; y += 2) RR(c, x + ((y >> 1) & 1), y, 1, 1, MAIL[2 + ((x + y) & 1)]);
        cel(c, [-8, 1, 7, 1, 6, 9, -9, 9], MAIL.slice(0, 3), [1, 2.5]);
        // ears (pointed, laid back)
        fillPoly(c, [-6, -6, -9, -17, -2, -8], GOLD[2]); fillPoly(c, [-5, -7, -8, -14, -3, -8], GOLD[1]);
        fillPoly(c, [-1, -8, -2, -18, 3, -8], GOLD[3]); PX(c, -1, -15, GOLD[5]);
        // dome
        ball(c, -1, -2, 8, 8, GOLD.slice(1, 6), 0);
        // the hound's muzzle (long, snarling) + jaw
        cel(c, [3, -5, 15, -2, 17, 1, 15, 3, 4, 4], GOLD.slice(1, 5), [1, 2.2, 3.4]);
        const jaw = P.roar * 4;
        cel(c, [4, 4, 14, 4 + jaw * .5, 13, 6 + jaw, 4, 7], GOLDD.slice(1, 4), [1, 2]);
        if (jaw > 1) { RR(c, 6, 4, 7, Math.round(jaw), '#14040a'); for (let k = 0; k < 3; k++) { PX(c, 7 + k * 2, 4, '#f0e8d0'); PX(c, 7 + k * 2, 3 + jaw, '#f0e8d0'); } }
        else for (let k = 0; k < 3; k++) PX(c, 7 + k * 3, 4, '#f0e8d0');
        PX(c, 16, -1, '#140806');                                          // nostril
        RR(c, 3, -4, 6, 2, '#0c0406');                                      // eye slit (glow drawn in drawFx)
        // brow ridge + crest
        thick(c, 1, -6, 9, -4, 1, GOLD[5]);
        thick(c, -8, -6, 2, -10, 1, GOLD[4]);
        c.restore();
      };
      def.drawBoss = function (ctx, b) {
        const P = pose(b), t = b.t, ph = b.phase;
        b.data._hp = P;
        const SPR = b.mode === 'phase' || b.state === 'pack' || b.state === 'coins' ? SPRU : WIDE[b.state] || b.mode === 'dying' ? SPRW : SPRI;
        KIT.puppet(ctx, b.x, b.y, Object.assign(b.popts(), box(SPR, b)), c => {
          c.imageSmoothingEnabled = false;
          P.crouch = Math.round(P.crouch); if (Math.abs(P.lean) < .03) P.lean = 0;
          c.translate(0, P.crouch);
          const hip = [P.hipX, -34], lean = P.lean;
          // cloak (behind everything)
          const sw = Math.sin(t * .08) * 2 + P.cape * 4 + Math.abs(b.vx) * 2;
          const cl = [-6, -62, -12 - sw * .3, -44, -16 - sw, -16, -10 - sw * .6, -6, -2, -20, 2, -60];
          cel(c, cl, CRIM.slice(0, 4), [1.5, 3.5, 6]);
          if (ph >= 3) for (let k = 0; k < 3; k++) RR(c, -14 - sw + k * 3, -10 - k * 2, 2, 3, CRIM[0]);
          // back leg, back arm (glaive hand)
          c.save(); c.transform(1, 0, -lean, 1, 0, 0);
          leg(c, [hip[0] - 4, hip[1]], P.bF, 0, GOLDD.slice(1, 4));
          c.restore();
          // the glaive: behind the body except when thrusting/charging
          const front = b.state === 'thrust' || b.state === 'charge' || (b.state === 'leap' && b.onGround && b.stateT > (b.data.W || 24));
          let gl = null;
          const drawGlaive = () => { gl = glaive(c, P.grip, P.gA, 58); };
          if (!front) drawGlaive();
          c.save(); c.transform(1, 0, -lean, 1, 0, 0);
          leg(c, [hip[0] + 4, hip[1]], P.fF, 0, GOLD.slice(1, 4));
          // kaftan skirt with gold trim
          cel(c, [-11, -42, 11, -42, 15, -16, 4, -14, -2, -18, -14, -14], CRIM.slice(1, 5), [1.5, 3]);
          thick(c, -14, -15, -2, -18, 1, GOLD[3]); thick(c, 4, -15, 15, -17, 1, GOLD[3]);
          for (let x = -10; x <= 10; x += 2) for (let y = -39; y < -33; y += 2) RR(c, x + ((y >> 1) & 1), y, 1, 1, MAIL[2 + ((x + y) & 1)]);   // mail skirt
          for (let k = 0; k < 4; k++) { RR(c, -10 + k * 6, -32, 4, 8, GOLD[1]); RR(c, -10 + k * 6, -32, 3, 7, GOLD[3]); RR(c, -10 + k * 6, -32, 3, 1, GOLD[5]); }  // lamellar tassets
          // torso (lamellar cuirass)
          cel(c, [-10, -62, 12, -62, 13, -50, 10, -40, -10, -40, -12, -52], GOLD.slice(0, 3), [1.5]);
          lamellar(c, -9, -60, 20, 19, GOLD, 4);
          // belt with buckle
          RR(c, -11, -42, 23, 3, LEA[1]); RR(c, -11, -42, 23, 1, LEA[3]); ball(c, 3, -41, 2.2, 2, GOLD.slice(2, 6));
          // pauldrons (layered plates)
          for (const [x, y] of [[-6, -62], [8, -62]]) { ball(c, x, y, 6, 4, GOLD.slice(1, 5), 0); ball(c, x, y + 3, 5.5, 3.5, GOLD.slice(1, 5), 0); }
          { // the helm is baked per jaw opening (5 steps) and drawn rotated only when the head tilts
            const r = P.head - P.helmUp, jq = Math.round(clamp(P.roar, 0, 1) * 4);
            const hv = bake('hdHelm' + jq, 40, 40, 20, 26, cc => helm(cc, { head: 0, helmUp: 0, roar: jq / 4 }, 0, 0, true));
            if (Math.abs(r) < .02) c.drawImage(hv, 2 - hv.ox, -68 - hv.oy); else { c.save(); c.translate(2, -68); c.rotate(r); c.drawImage(hv, -hv.ox, -hv.oy); c.restore(); }
          }
          // back arm to the glaive grip (dark sleeve)
          const sb = P.sb, gH = P.grip, eB = elbow(sb[0], sb[1], gH[0], gH[1], 26, -1);
          tube(c, [sb, eB, gH], 6, 5, CRIM.slice(1, 4));
          ball(c, gH[0], gH[1], 3, 3, GOLD.slice(1, 5));
          c.restore();
          if (front) drawGlaive();
          // shield arm
          c.save(); c.transform(1, 0, -lean, 1, 0, 0);
          const sf = P.sh, shp = P.shield, eF = elbow(sf[0], sf[1], shp[0] - 4, shp[1] + 2, 26, 1);
          tube(c, [sf, eF, [shp[0] - 4, shp[1] + 2]], 7, 6, GOLD.slice(1, 4));
          { const br = P.broken > 0 || b.state === 'broken', sv = bake('hdShield' + (br ? 1 : 0), 28, 30, 14, 15, cc => shield(cc, 0, 0, 0, br, 0));
            if (Math.abs(P.shA) < .02) c.drawImage(sv, Math.round(shp[0]) - sv.ox, Math.round(shp[1]) - sv.oy); else { c.save(); c.translate(shp[0], shp[1]); c.rotate(P.shA); c.drawImage(sv, -sv.ox, -sv.oy); c.restore(); } }
          c.restore();
          if (gl) { P.tip = gl.tip; P.head = P.head; }
        });
      };
      def.rims = () => [{ color: '#ffe6a0', dx: 1, dy: -1, a: .55 }, { color: '#ff7a50', dx: -1, dy: 0, a: .28 }];
      def.outline = '#0c0604';
      def.telePos = b => ({ x: b.x, y: b.y - 104 });
      def.drawFx = function (ctx, b) {
        const P = b.data._hp; if (!P || b.alpha < .1) return;
        const t = b.t, ph = b.phase, tk = teleK(b), f = b.facing, s = b.state, n = b.stateT, W = b.data.W || 24;
        const L = (x, y) => wp(b, x - P.lean * y, y + P.crouch);                     // inside the lean skew
        // helm eye slit: amber (red in phase 3)
        const r = P.head - P.helmUp, hx = 2 + Math.cos(r) * 5.5 - Math.sin(r) * -3.5, hy = -68 + Math.sin(r) * 5.5 + Math.cos(r) * -3.5;
        const e = L(hx, hy);
        const ec = ph >= 3 ? '#ff4a3a' : '#ffd04a';
        ctx.fillStyle = ec; ctx.fillRect(Math.round(e.x) - 2, Math.round(e.y), 5, 1);
        ctx.fillStyle = '#fff8e0'; ctx.fillRect(Math.round(e.x) + f, Math.round(e.y), 1, 1);
        glow(e.x + f * 2, e.y, 12 + 10 * tk, ec, .55 + .4 * tk);
        // glaive blade: glint along its edge; flare on the thrust wind-up
        if (P.tip) {
          const tp = wp(b, P.tip[0], P.tip[1] + P.crouch);
          if (s === 'twind' || (s === 'charge' && n < W) || tk > 0) {
            const k = s === 'twind' ? ease(n / 26) : tk;
            glow(tp.x, tp.y, 14 + 18 * k, '#fff0a0', .5 + .5 * k);
            if (k > .5) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(tp.x) - 3, Math.round(tp.y), 7, 1); ctx.fillRect(Math.round(tp.x), Math.round(tp.y) - 3, 1, 7); }
          }
          if (Math.sin(t * .05) > .97) glow(tp.x, tp.y, 10, '#ffffff', .6);
          b.data.tipW = [tp.x, tp.y];
        }
        // shield boss flares before the bash
        if (s === 'bwind' || s === 'bash') { const sp = L(P.shield[0] + 1, P.shield[1]); glow(sp.x, sp.y, 20 + 10 * ease(n / 16), '#ffe080', .7); }
        // charge: gold streaks behind
        if (s === 'charge' && n >= W && n < W + 44 && budget(b, 1)) { spawn({ x: b.x - f * 14, y: b.y - U.rand(10, 60), vx: -f * U.rand(1, 3), life: 14, size: 1, shape: 'spark', len: 3, color: '#ffe08a', color2: '#c08020', glow: true, glowR: 0 }); }
        // phase 2+: molten seams in the lamellar, embers rising
        if (ph >= 2 || b.mode === 'phase') {
          const k = b.mode === 'phase' ? phaseK(b) : 1, pul = .55 + .3 * Math.sin(t * .1);
          ctx.globalAlpha = k * pul;
          for (const [x0, y0, x1, y1] of [[-8, -58, 10, -56], [-8, -52, 11, -50], [-9, -46, 10, -45], [-2, -62, -1, -42]]) { const a = L(x0, y0), c2 = L(x1, y1); Art.thick(ctx, a.x, a.y, c2.x, c2.y, 1, ph >= 3 ? '#ff9a40' : '#ffe48a'); }
          ctx.globalAlpha = 1;
          const ch = L(0, -50);
          glow(ch.x, ch.y, 34, ph >= 3 ? '#ff6020' : '#ffc040', .3 * k);
          if (budget(b, ph >= 3 ? 2 : 4)) spawn({ x: b.x + U.rand(-16, 16), y: b.y - U.rand(10, 70), vx: U.rand(-.2, .2), vy: -U.rand(.3, 1), life: U.randi(20, 40), size: 1, shape: 'sq', color: ph >= 3 ? '#ff7a3a' : '#ffd060', glow: true, glowR: 0, grav: -.01 });
        }
        light(b.x, b.y - 50, 110, '#ffd890', .35);
      };
    });

    /* ================================================================== THE SILENT CHOIR
       Seven tall Singers in white felt hats float in a row; their mouths open with no sound. A ring of frozen sound-glyphs turns
       around them. The lead Singer (centre) carries the hitbox. Base AI: frost_shaman (cast_ice, cast_orb, tp_out/tp_in)
       + hush / wail / chorus / shards. Champion scale 2 (hitbox 24x52). */
    guard('choir', () => {
      const def = B('choir'); if (!def) return; def._drawBoss0 = def.drawBoss; def._drawFx0 = def.drawFx;
      const ROBE = ['#0e1222', '#1e2640', '#3a4666', '#6a7898', '#a8b4cc', '#dde4f0'];
      const ROBEB = ['#0a0c18', '#161c30', '#2a3250', '#4c5874', '#76829e'];
      const HAT = ['#3a4050', '#7a8294', '#bcc4d4', '#eef2f8', '#ffffff'];
      const FACE = ['#4a4048', '#8a7e84', '#c4b8b6', '#e6dcd6'];
      const BAND = ['#0e3a44', '#1f7a80', '#3fc0c0'];
      const MOUTH = '#04050a';
      // singers: [x offset, scale, depth 0 = back, phase]
      const SING = [[-56, .72, 0, 0], [-38, .8, 1, 1.3], [-19, .9, 2, 2.6], [0, 1, 3, 3.9], [19, .9, 2, 5.2], [38, .8, 1, .6], [56, .72, 0, 1.9]];
      const SPR = { w: 210, h: 100, ox: 105, oy: 90 };
      // glyphs: small pixel signs of a lost notation (baked)
      const GLY = [['..x..', '.xxx.', 'x.x.x', '..x..', '..x..', '.x.x.', 'x...x'], ['x...x', '.x.x.', '..x..', 'xxxxx', '....x', '...x.', '..x..'], ['xxx..', 'x..x.', 'x..x.', 'xxx..', 'x.x..', 'x..x.', 'x...x'], ['.xxx.', 'x...x', 'x.x.x', 'x...x', '.xxx.', '..x..', 'xxxxx'], ['x....', 'xx...', 'x.x..', 'x..x.', 'x.x..', 'xx...', 'x....'], ['xxxxx', '....x', '..xx.', '.x...', 'x....', 'x...x', '.xxx.']];
      const glyphCv = (i, col) => Art.sprite('chg' + i + col, GLY[i % GLY.length].map(r => r.replace(/x/g, 'a')), { a: col });
      const vis = b => {                                               // teleport fade (tp_out / tp_in) of the base shaman
        if (b.state === 'tp_out') return 1 - clamp(b.stateT / 20, 0, 1);
        if (b.state === 'tp_in') return clamp(b.stateT / 18, 0, 1);
        return 1;
      };
      // per-singer mouth opening: casting opens them in a wave from the lead outwards
      const mouth = (b, i, sg) => {
        const s = b.state, n = b.stateT, d = Math.abs(i - 3), ph = b.phase;
        let m = .08 + .06 * Math.sin(b.t * .03 + sg[3]) + (ph >= 2 ? .15 : 0);
        if (s === 'cast_ice' || s === 'cast_orb' || s === 'wail' || s === 'hush' || s === 'chorus' || s === 'shards') m = Math.max(m, ease((n - d * 3) / 10) * (s === 'hush' ? .5 : 1));
        if (b.teleT > 0) m = Math.max(m, teleK(b) * .9);
        if (b.mode === 'phase') m = Math.max(m, ease((b.modeT - d * 4) / 14));
        if (b.mode === 'intro') m = Math.max(m, ease((b.modeT - 50 - d * 4) / 12) * (1 - ease((b.modeT - 100) / 16)));
        if (b.mode === 'dying') m = 1;
        return clamp(m, 0, 1);
      };
      // a Singer's body is baked in 4 hem/hat frames x (resting | singing); only the mouth and the ink tears stay live
      const singerBake = (i, cast, fr) => bake('chS' + i + (cast ? 'c' : 'r') + fr, 44, 84, 22, 74, c => {
        const [, s, depth, phs] = SING[i], t = fr * 13 + phs * 10;
        const H = 56 * s, R = depth < 2 ? ROBEB : depth < 3 ? ROBE.slice(0, 5) : ROBE;
        const sw = 4.5 * s, hw = 8 * s + (cast ? 1.5 : 0), top = -H * .64, hem = [];
        for (let k = 0; k <= 4; k++) { const u = k / 4; hem.push(lerp(hw, -hw, u) + Math.sin(t * .12 + k * 1.7 + phs) * 1.5, -2 + Math.sin(t * .15 + k * 2.1 + phs) * 2 + (k & 1) * 3); }
        cel(c, [-sw, top, sw, top, hw * .8, -H * .3, ...hem, -hw * .8, -H * .3], R.slice(0, 4), [1.5, 3.2, 5]);
        for (let k = -1; k <= 1; k++) thick(c, k * sw * .5, top + 6, k * hw * .7, -6, 1, R[1]);
        cel(c, [sw * .2, top + 1, sw * .9, top + 1, sw * .7 + 1, -H * .18, sw * .1 + 1, -H * .14], R.slice(2, 5), [1]);
        const hy = cast ? -H * .76 : -H * .5, hx = cast ? 6.5 * s : 2 * s;
        if (cast) { tube(c, [[sw * .6, top + 2], [hx, hy]], 2.5, 2, R.slice(1, 4)); tube(c, [[-sw * .6, top + 2], [-hx, hy]], 2.5, 2, R.slice(1, 4)); }
        ball(c, hx, hy, 1.6 * s + .4, 1.8 * s + .4, FACE.slice(0, 3)); ball(c, cast ? -hx : -1, hy + (cast ? 0 : 1), 1.6 * s + .4, 1.8 * s + .4, FACE.slice(0, 3));
        const hy0 = -H * .72;
        ball(c, 0, hy0, 4.4 * s + .3, 5.4 * s + .3, depth < 2 ? FACE.slice(0, 3) : FACE, 0);
        RR(c, -3, hy0 - 2, 2, 1, FACE[0]); RR(c, 1, hy0 - 2, 2, 1, FACE[0]);
        const hb = hy0 - 3.6 * s, ht = hb - 15 * s, bend = -2 - Math.sin(t * .05 + phs) * .8;
        cel(c, [-4 * s, hb, 4.2 * s, hb, 2.6 * s + bend * .4, lerp(hb, ht, .6), 1.2 * s + bend, ht, -1 * s + bend, ht + .5, -2.8 * s + bend * .3, lerp(hb, ht, .55)], HAT.slice(0, 4), [1, 2.4, 3.6]);
        RR(c, -4 * s, hb - 1.5, Math.round(8.4 * s), 2, BAND[1]); RR(c, -4 * s, hb - 1.5, Math.round(8.4 * s), 1, BAND[2]);
      });
      const singer = (c, b, i, sg) => {
        const [ox, s, depth, phs] = sg, t = b.t, ph = b.phase, dk = dyingK(b);
        const H = 56 * s, bob = Math.sin(t * .045 + phs) * 2 - 4 - depth * 2.5, x = ox, y = bob;
        const m = mouth(b, i, sg), cast = b.state === 'cast_ice' || b.state === 'cast_orb' || b.state === 'wail' || b.state === 'chorus' || b.mode === 'phase';
        const fall = dk ? ease((dk - i * .08) * 2) : 0;            // the Singers fall silent one by one
        const fr = (Math.floor(t / 9) + i) & 3, cv = singerBake(i, cast, fr);
        c.save(); c.translate(Math.round(x), Math.round(y + fall * 10)); if (fall) c.rotate(fall * (i < 3 ? -.5 : .5));
        c.drawImage(cv, -cv.ox, -cv.oy);
        const hy0 = Math.round(-H * .72);
        if (ph >= 3) { RR(c, -2, hy0, 1, 3 + (i & 1), '#10060c'); RR(c, 2, hy0, 1, 2 + (i % 3), '#10060c'); }
        // the mouth: a long dark oval that opens and makes no sound
        const mh = 1 + m * 3.6 * s, mw = .9 + m * 1.2 * s;
        oval(c, 0, hy0 + 1 + mh / 2, mw, mh / 2 + .2, MOUTH);
        c.restore();
        return { x, y: y + hy0 + 1 + mh / 2, m, hat: [x, y + hy0 - 3.6 * s - 15 * s] };
      };
      def.drawBoss = function (ctx, b) {
        const v = vis(b); if (v <= .02) { b.data._ch = null; return; }
        const out = [];
        KIT.puppet(ctx, b.x, b.y, Object.assign(b.popts(), { w: SPR.w, h: SPR.h, ox: SPR.ox, oy: SPR.oy, flip: b.facing < 0, snap: false, alpha: b.alpha * v }), c => {
          c.imageSmoothingEnabled = false;
          for (const depth of [0, 1, 2, 3]) for (let i = 0; i < 7; i++) if (SING[i][2] === depth && !(i === 3 && b.data.soloOut)) out[i] = singer(c, b, i, SING[i]);
        });
        b.data._ch = out;
      };
      // stage 8a: the soloist away from the row (he holds the note); drawn at world x,y (feet), a = alpha
      def._solo = function (ctx, b, x, y, a, fl) {
        const S = { w: 44, h: 84, ox: 22, oy: 74 }, sg = SING[3];
        KIT.puppet(ctx, x, y, Object.assign(b.popts(), { w: S.w, h: S.h, ox: S.ox, oy: S.oy, flip: fl < 0, snap: false, alpha: a }), c => {
          c.imageSmoothingEnabled = false;
          const cv = singerBake(3, true, (Math.floor(b.t / 9) + 3) & 3); c.drawImage(cv, -cv.ox, -cv.oy);
          const H = 56, hy0 = Math.round(-H * .72), m = .8 + .2 * Math.sin(b.t * .3), mh = 1 + m * 3.6, mw = .9 + m * 1.2;
          oval(c, 0, hy0 + 1 + mh / 2, mw, mh / 2 + .2, MOUTH);
        });
        void sg;
      };
      def.rims = () => [{ color: '#d8f4ff', dx: 1, dy: -1, a: .55 }, { color: '#6a7ad8', dx: -1, dy: 0, a: .3 }];
      def.outline = '#06081a';
      def.telePos = b => ({ x: b.x, y: b.y - 92 });
      def.drawFx = function (ctx, b) {
        const v = vis(b) * b.alpha, ch = b.data._ch, t = b.t, ph = b.phase, s = b.state, n = b.stateT, tk = teleK(b), f = b.facing;
        // the ring of glyphs (drawn even while fading, it is what the Choir leaves behind)
        const cast = s === 'cast_ice' || s === 'cast_orb' || s === 'wail' || s === 'hush' || s === 'chorus' || s === 'shards' || b.mode === 'phase';
        const pull = cast ? ease(n / 20) : 0, red = ph >= 3;
        const N = ph >= 2 ? 18 : 14, rx = 80 - 18 * pull + 8 * tk, ry = 16, cy = b.y - 32 + Math.sin(t * .04) * 2;
        const col = red ? '#ff9a9a' : '#bfe8ff', core = red ? '#fff0f0' : '#ffffff';
        for (let i = 0; i < N; i++) {
          const a = t * (.012 + .02 * pull) + i * TAU / N, x = b.x + Math.cos(a) * rx, y = cy + Math.sin(a) * ry, front = Math.sin(a) > 0;
          const al = clamp(v * (front ? .95 : .4) * (.7 + .3 * Math.sin(t * .1 + i)), 0, 1);
          if (al < .05) continue;
          ctx.globalAlpha = al;
          ctx.drawImage(glyphCv(i, (i + Math.floor(t / 40)) % 5 === 0 ? core : col), Math.round(x) - 2, Math.round(y) - 3);
          glow(x, y, 10 + 6 * pull, red ? '#ff4060' : '#6ac8ff', (front ? .5 : .25) * al);
        }
        ctx.globalAlpha = 1;
        if (ph >= 2 && v > .1) { // the inner, counter-turning ring
          for (let i = 0; i < 9; i++) { const a = -t * .02 + i * TAU / 9, x = b.x + Math.cos(a) * 34, y = b.y - 70 + Math.sin(a) * 6; ctx.globalAlpha = .6 * v; ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), 1, 2); ctx.fillRect(Math.round(x) - 1, Math.round(y), 3, 1); }
          ctx.globalAlpha = 1;
        }
        if (!ch) return;
        // open mouths breathe out silent rings; the lead's mouth glows with what it is about to sing
        for (let i = 0; i < 7; i++) {
          const q = ch[i]; if (!q || q.m < .45) continue;
          const p = wp(b, q.x, q.y);
          glow(p.x, p.y, 6 + 10 * q.m, red ? '#ff5050' : '#9fdcff', .35 * q.m * v);
          if (cast && budget(b, 9) && Math.random() < .5) spawn({ x: p.x, y: p.y, shape: 'ring', size: 1, size1: 9, life: 22, color: red ? '#ffb0b0' : '#d8f4ff', drag: 1, glow: true, alpha: .7 });
        }
        if (tk > 0 || s === 'cast_orb') { const q = ch[3]; if (q) { const p = wp(b, q.x + 4, q.y - 6); glow(p.x, p.y, 16 + 20 * Math.max(tk, ease(n / 24)), red ? '#ff6070' : '#bff4ff', .7 * v); } }
        light(b.x, b.y - 40, 120, red ? '#ffb0c0' : '#c8ecff', .45 * v);
        if (budget(b, 6) && v > .3) { const q = ch[(t >> 3) % 7]; if (q) { const p = wp(b, q.hat[0], q.hat[1]); spawn({ x: p.x + U.rand(-2, 2), y: p.y, vy: -U.rand(.2, .5), life: 30, size: 1, color: '#e8f6ff', glow: true, glowR: 0 }); } }
      };
    });

    /* ================================================================== ALBASTY, MOTHER OF THE KAREZ
       A drowned giantess: black-green hair longer than she is, pale water-swollen skin, a clinging wet shift, long clawed arms,
       feet turned backwards, water dripping from every strand. Base AI: albasty (rwind/rake, shriek/dive) + tide / drown / brood / rain.
       Champion scale 2.3 (hitbox 32x51, flies). */
    guard('albasty', () => {
      const def = B('albasty'); if (!def) return; def._drawBoss0 = def.drawBoss; def._drawFx0 = def.drawFx;
      const HAIR = ['#020506', '#081214', '#10221f', '#1c3631', '#2e504a'];
      const SKIN = ['#16201f', '#2e4240', '#52706a', '#82a49a', '#b4d0c4', '#dceee4'];
      const SHIFT = ['#141c20', '#34444a', '#62767a', '#98acaa', '#c6d6d2', '#eef6f2'];
      const CLAW = '#0a0c0c', WEED = ['#16301a', '#2c5228', '#4a7a3a'];
      const SPRB = { w: 164, h: 176, ox: 82, oy: 140 }, SPRS = { w: 112, h: 116, ox: 56, oy: 96 };
      const SCRM = new Map(), SCRA = S => { let v = SCRM.get(S); if (!v) { v = G.makeCanvas(S.w, S.h, true); SCRM.set(S, v); } return v; };
      // the hair curtain and the wet shift are baked in 8 sway frames
      const MASS = fr => bake('alM' + fr, 44, 96, 22, 74, c => {
        const t = fr * 8, sw = Math.sin(t * .05 * 3.1) * 2, edge = [];
        for (let k = 0; k <= 6; k++) { const u = k / 6; edge.push(lerp(12, -15, u) + sw * (1 - Math.abs(u - .5)), 14 + Math.sin(fr * .8 + k * 1.7) * 2 + (k & 1) * 5); }
        cel(c, [-6, -68, 6, -68, 10, -56, 13, -30, ...edge, -15, -30, -10, -56], HAIR.slice(0, 4), [1.5, 3.5, 6]);
        for (let k = 0; k < 6; k++) thick(c, -11 + k * 4, -50, -13 + k * 4.6 + sw, 12 + (k & 1) * 4, 1, HAIR[k & 1 ? 0 : 3]);
      });
      const DRESS = fr => bake('alD' + fr, 40, 76, 20, 60, c => {
        const hem = []; for (let k = 0; k <= 6; k++) { const u = k / 6; hem.push(lerp(13, -13, u) + Math.sin(fr * .8 + k) * 1.2, 4 + (k & 1) * 4 + Math.sin(fr * .9 + k * 1.3) * 1.5); }
        cel(c, [-8, -52, 9, -52, 12, -30, ...hem, -12, -30], SHIFT.slice(0, 5), [1.5, 3, 5, 7]);
        for (let k = 0; k < 4; k++) thick(c, -6 + k * 4, -36, -8 + k * 5, 3, 1, SHIFT[1]);
        for (let k = 0; k < 5; k++) PX(c, -4 + k * 3, -44 + (k * 7) % 11, SHIFT[5]);
      });
      const pose = b => {
        const s = b.state, n = b.stateT, t = b.t, d = b.data, W = d.W || 26, ph = b.phase;
        const P = { rot: 0, headBack: 0, mouth: 0, armF: [10, -16], armB: [-9, -14], spread: 0, float: ph >= 2 ? .6 : 0, bob: Math.sin(t * .05) * 2, lift: 0 };
        P.armF = [8 + Math.sin(t * .04) * 1.5, -12 + Math.sin(t * .05) * 2]; P.armB = [-8, -10 + Math.sin(t * .05 + 1) * 2];
        if (s === 'shriek') { const k = ease(n / 12); P.headBack = .5 * k; P.mouth = k; P.armF = [lerp(8, 26, k), lerp(-12, -50, k)]; P.armB = [lerp(-8, -24, k), lerp(-10, -48, k)]; P.float = Math.max(P.float, k); }
        if (s === 'crawl') { const k = ease(n / 8); P.rot = .95 * k; P.float = -1; P.armF = [lerp(10, 36, k), lerp(-16, -4, k)]; P.armB = [lerp(-9, 28, k), lerp(-14, -2, k)]; P.headBack = d.back ? .9 * k : .2 * k; P.mouth = .5 * k; }   // stage 8a: on her hands
        if (s === 'dive' && d.dv) { P.rot = clamp(Math.atan2(d.dv[1], Math.abs(d.dv[0])) * .8 + .5, -.2, 1.1); P.armF = [32, -30]; P.armB = [26, -22]; P.mouth = .8; P.float = -1; }
        if (s === 'rwind') { const k = ease(n / 10); P.armF = [lerp(8, -6, k), lerp(-12, -66, k)]; P.rot = -.12 * k; P.mouth = .4 * k; }
        if (s === 'rake') { const k = n < 3 ? outC(n / 3) : 1; const r = 1 - ease((n - 8) / 12); P.armF = [lerp(-6, 44, k * r + (1 - r) * .4), lerp(-66, -6, k)]; P.armB = [20 * r, -20]; P.rot = .25 * k * r; P.mouth = .6 * r; }
        if (s === 'recover') { P.rot = -.08 * (1 - ease(n / 20)); }
        if (s === 'tide') { if (n < W) { const k = ease(n / W); P.armF = [12, lerp(-12, -70, k)]; P.armB = [-10, lerp(-10, -68, k)]; P.headBack = .25 * k; P.float = Math.max(P.float, k); } else { const k = 1 - ease((n - W) / 24); P.armF = [26, lerp(10, -40, 1 - k)]; P.armB = [-22, lerp(10, -40, 1 - k)]; P.rot = .1 * k; P.mouth = .7 * k; } }
        if (s === 'drown') { const k = n < (W || 30) ? ease(n / 20) : 1 - ease((n - W) / 30); P.armF = [lerp(8, 34, k), lerp(-12, -26, k)]; P.armB = [lerp(-8, 22, k), lerp(-10, -20, k)]; P.float = Math.max(P.float, k); P.mouth = .3 * k; }
        if (s === 'brood' || s === 'rain') { const k = n < 26 ? ease(n / 26) : 1 - ease((n - 26) / 30); P.armF = [lerp(8, 24, k), lerp(-12, s === 'rain' ? -70 : -30, k)]; P.armB = [lerp(-8, -24, k), lerp(-10, s === 'rain' ? -70 : -28, k)]; P.headBack = .3 * k; P.mouth = .6 * k; P.float = Math.max(P.float, k); }
        if (b.mode === 'phase' || (b.mode === 'intro' && b.modeT > 50)) { const k = b.mode === 'phase' ? phaseK(b) : ease((b.modeT - 50) / 15) * (1 - ease((b.modeT - 95) / 20)); P.headBack = .5 * k; P.mouth = k; P.armF = [lerp(P.armF[0], 30, k), lerp(P.armF[1], -56, k)]; P.armB = [lerp(P.armB[0], -28, k), lerp(P.armB[1], -54, k)]; P.float = Math.max(P.float, k); }
        if (b.teleT > 0) P.mouth = Math.max(P.mouth, teleK(b) * .6);
        const dk = dyingK(b); if (dk) { P.rot = -.2 * ease(dk * 2); P.float = 1; P.mouth = 1; P.lift = dk; }
        return P;
      };
      // a strand of hair as a polyline from the scalp, hanging with sway; float > 0 lifts it like underwater, < 0 streams it back
      const strand = (b, P, i, n) => {
        const t = b.t, u0 = i / (n - 1), base = [lerp(-7, 6, u0), -64 + Math.abs(u0 - .5) * 4];
        const len = 64 + 16 * hsh(i * 3.1) - (i % 3) * 6, pts = [base];
        const back = -(b.vx || 0) * b.facing * 3 - 2;
        let x = base[0], y = base[1], ang = PI / 2 + (u0 - .5) * .5 + .25;
        for (let k = 1; k <= 7; k++) {
          const w = Math.sin(t * .06 + i * .9 + k * .7) * .12 * (1 + P.float) + back * .015;
          ang += w + (P.float > 0 ? -P.float * (.18 + .03 * k) * (u0 < .5 ? -1 : 1) * -1 : 0) + (P.float < 0 ? .12 : 0);
          if (P.float > 0) ang = lerp(ang, -PI / 2 + (u0 - .5) * 2.4, P.float * .07 * k);
          x += Math.cos(ang) * len / 7; y += Math.sin(ang) * len / 7;
          pts.push([x, y]);
        }
        return pts;
      };
      const armDraw = (c, sh, hd, front) => {
        const e = elbow(sh[0], sh[1], hd[0], hd[1], 50, front ? 1 : -1);
        tube(c, [sh, e, hd], front ? 5 : 4, 3, front ? SKIN.slice(1, 5) : SKIN.slice(0, 3));
        // long claws
        const a = Math.atan2(hd[1] - e[1], hd[0] - e[0]);
        for (let k = -1; k <= 2; k++) { const q = a + k * .28; thick(c, hd[0], hd[1], hd[0] + Math.cos(q) * 8, hd[1] + Math.sin(q) * 8, 1, CLAW); }
        ball(c, hd[0], hd[1], 2.6, 2.4, SKIN.slice(1, 4), a);
      };
      def.drawBoss = function (ctx, b) {
        const P = pose(b), t = b.t, ph = b.phase;
        b.data._ap = P;
        const SPR = P.float > .05 || P.float < 0 || P.rot || b.mode !== 'fight' || (b.state !== 'idle' && b.state !== 'chase' && b.state !== 'recover') ? SPRB : SPRS;
        KIT.puppet(ctx, b.x, b.y, Object.assign(b.popts(), box(SPR, b), { alpha: b.alpha * (1 - .7 * ease((dyingK(b) - .6) / .4)) }), c => {
          c.imageSmoothingEnabled = false;
          c.translate(0, Math.round(P.bob - P.lift * 20)); if (Math.abs(P.rot) > .04) c.transform(1, 0, -Math.round(P.rot * 10) / 10, 1, 0, 0);   // lean as a shear
          const NS = 11, strands = []; for (let i = 0; i < NS; i++) strands.push(strand(b, P, i, NS));
          // back hair mass: a curtain of wet hair longer than she is
          const SK = G.ART_BOSSES.skip || {};
          const FR = (t >> 3) & 7;
          if (P.float < .5 && !SK.mass) { const m = MASS(FR); c.drawImage(m, -m.ox, -m.oy); }
          if (!SK.hair) for (let i = 0; i < NS; i += 2) strandD(c, strands[i], 7, 2, HAIR.slice(0, 3));
          // back arm
          if (!SK.arms) armDraw(c, [-6, -50], P.armB, false);
          // backward feet below the hem (heels forward, toes trailing back)
          for (const [fx, sh] of [[-4, 0], [5, 1]]) {
            const fy = 12 + Math.sin(t * .05 + sh) * 1.5;
            tube(c, [[fx, 4], [fx + 1, fy - 3]], 3, 3, SKIN.slice(0, 3));
            fillPoly(c, [fx + 3, fy - 3, fx + 2, fy + 1, fx - 8, fy + 1, fx - 9, fy - 1, fx - 2, fy - 3], SKIN[2]);
            RR(c, fx + 1, fy - 2, 2, 2, SKIN[3]);                                         // the heel, in front
            for (let k = 0; k < 3; k++) PX(c, fx - 9 + k * 2, fy, CLAW);
          }
          // the wet shift: clinging, torn hem
          { const m = DRESS(FR); c.drawImage(m, -m.ox, -m.oy); }
          // neck + shoulders
          ball(c, 0, -52, 9, 4, SKIN.slice(1, 5));
          // head (tilting back on the shriek)
          c.save(); c.translate(1, -60); c.rotate(-P.headBack);
          ball(c, 0, 0, 6, 7, SKIN.slice(1, 6));
          RR(c, 2, -1, 2, 2, '#060a0a'); if (ph >= 3) RR(c, -2, -1, 2, 2, '#060a0a');
          if (P.mouth > .1) ball(c, 2, 4 + P.mouth * 2, 1.6 + P.mouth, 1 + P.mouth * 3, ['#030404', '#030404']);
          // the crown of wet hair over the scalp and face
          cel(c, [-7, -2, -6, -7, 0, -9, 6, -6, 7, -1, 4, -4, 1, -5, -2, -3, -4, 4, -7, 6], HAIR.slice(1, 5), [1, 2.4]);
          c.restore();
          // front hair (over the body, covering half the face) with river-weed tangled in it
          if (!SK.hair) for (let i = 1; i < NS; i += 2) strandD(c, strands[i], 5, 2, [HAIR[1], HAIR[3], HAIR[4]]);
          for (let i = 1; i < NS; i += 4) { const q = strands[i][4]; thick(c, q[0], q[1], q[0] + 3, q[1] + 6, 1, WEED[1]); PX(c, q[0] + 1, q[1] + 2, WEED[2]); }
          // front arm (the clawing one)
          if (!SK.arms) armDraw(c, [7, -50], P.armF, true);
          b.data._hairTips = strands.map(s => s[s.length - 1]);
        });
      };
      def.rims = () => [{ color: '#bffff4', dx: 1, dy: -1, a: .5 }, { color: '#2a8a9a', dx: -1, dy: 0, a: .35 }];
      def.outline = '#020608';
      def.telePos = b => ({ x: b.x, y: b.y - 92 });
      def.drawFx = function (ctx, b) {
        const P = b.data._ap; if (!P || b.alpha < .1) return;
        const t = b.t, ph = b.phase, tk = teleK(b), f = b.facing;
        const sh = Math.abs(P.rot) > .04 ? Math.round(P.rot * 10) / 10 : 0, R = (x, y) => wp(b, x - sh * y, y + Math.round(P.bob - P.lift * 20));
        // eye(s): drowned pale cyan pin-lights behind the hair
        const ca = Math.cos(-P.headBack), sa = Math.sin(-P.headBack);
        const eyes = ph >= 3 ? [[3, -1], [-1, -1]] : [[3, -1]];
        for (const [ex, ey] of eyes) {
          const e = R(1 + ex * ca - ey * sa, -60 + ex * sa + ey * ca);
          ctx.fillStyle = tk > .3 ? '#ffffff' : '#9ffcf0'; ctx.fillRect(Math.round(e.x), Math.round(e.y), 1, 1);
          glow(e.x, e.y, 10 + 10 * tk, '#5ff2e6', .6 + .4 * tk);
        }
        // the shriek: rings of water-sound from the mouth
        if (P.mouth > .5 && budget(b, 7)) { const m = R(3, -56); spawn({ x: m.x, y: m.y, shape: 'ring', size: 2, size1: 16, life: 18, color: '#9ff8ee', drag: 1, glow: true, alpha: .7 }); }
        // dripping water: from hair tips, fingers and the hem
        const tips = b.data._hairTips;
        if (tips && budget(b, ph >= 2 ? 2 : 3)) {
          const q = tips[(Math.random() * tips.length) | 0], p = R(q[0], q[1]);
          spawn({ x: p.x, y: p.y, vx: U.rand(-.1, .1), vy: U.rand(0, .5), grav: .18, life: 40, size: 1, color: Math.random() < .5 ? '#7af0e6' : '#c8fff8', glow: true, glowR: 0, update: o => { const a = KIT.arena(); if (o.y > a.floor - 1) { o.life = 0; if (Math.random() < .4) spawn({ x: o.x, y: a.floor - 1, shape: 'ring', size: 1, size1: 4, life: 10, color: '#7af0e6', drag: 1, alpha: .6 }); } } });
        }
        if (budget(b, 5)) { const p = R(U.rand(-12, 12), 8); spawn({ x: p.x, y: p.y, vy: .3, grav: .15, life: 30, size: 1, color: '#5fe2da', glow: true, glowR: 0 }); }
        // a cold water-light around her; the karez answers in phase 2+
        light(b.x, b.y - 30, 100, '#7af0e6', .4);
        glow(b.x, b.y - 30, 40, '#3ac8c8', .12 + .1 * (ph - 1) + .3 * tk);
        if ((ph >= 2 || b.mode === 'phase') && budget(b, 4)) spawn({ x: b.x + U.rand(-40, 40), y: b.y + U.rand(-70, 10), vy: -U.rand(.2, .6), life: 40, shape: 'circle', size: 1, color: '#bffff4', glow: true, glowR: 0, alpha: .7 });
      };
    });

    /* ================================================================== THE SEVEN
       The founders' shades: one great headless caravan robe (striped ikat chapan, chained shut) from which the seven founders rise,
       each blindfolded, turbaned, chained neck to neck. The kempir AI moves the seven heads (bite/spit) and the robe (leap/sweep);
       we draw founders where the head hurtboxes are and the caravan-bashi's bell-staff where the witch's staff was. */
    guard('seven', () => {
      const def = B('seven'); if (!def) return; def._drawBoss0 = def.drawBoss; def._drawFx0 = def.drawFx;
      const GH = ['#141a2a', '#2a3650', '#4e6284', '#8498b8', '#bccce0', '#eef4fa'];      // ghost skin / light
      const ROBE = ['#0c0e1c', '#1a1e34', '#2c3252', '#454e74', '#6a729a'];
      const IKAT = [['#3a1824', '#6a2a3a', '#9a4a50'], ['#4a3a14', '#7a6224', '#b0924a'], ['#14284a', '#24467a', '#4a72a8']];
      const TURB = [['#5a6070', '#9aa2b4', '#d4dae6', '#f4f8fc'], ['#141c3a', '#283a6a', '#4a64a0', '#7a96c8'], ['#3a2a1a', '#6a4e30', '#9c7a4e', '#c8a874']];
      const BLIND = ['#3a0a14', '#7a1a26', '#b0343a'];
      const CHAIN = ['#1a1a22', '#4a4a58', '#8a8a9a', '#c8c8d4'];
      const BRASS = ['#3a2408', '#7a5418', '#c8963a', '#ffe08a'];
      const wt = (b, x, y) => { const o = b.pose || {}, sq = o.sq || 0; return { x: b.x + b.facing * (x - .04 * (o.lean || 0) * y) * (1 + .012 * sq), y: b.y + y * (1 - .03 * sq) + (o.bob || 0) }; };
      const XT = [[-13, -45], [-10, -50], [-7, -53], [-4, -55], [-1, -53], [2, -50], [4, -45]];
      // a founder's head at world position (drawn into a world-space puppet)
      const founder = (c, b, h, t) => {
        const f = h.f || b.facing, i = h.i, tp = TURB[i % 3], big = h.big, sc = big ? 1.15 : 1;
        c.save(); c.translate(Math.round(h.x), Math.round(h.y)); if (f < 0) c.scale(-1, 1); c.scale(sc, sc);
        // beard for the elders (0, 3, 5)
        if (i === 0 || i === 3 || i === 5) cel(c, [-3, 2, 4, 2, 3, 9 + (i === 3 ? 3 : 0), 0, 11 + (i === 3 ? 3 : 0), -2, 7], GH.slice(2, 5), [1, 2]);
        ball(c, 0, 0, 5.5, 6, GH.slice(1, 6), 0);
        // the jaw drops when the head opens (bite / spit)
        const op = clamp(h.open || 0, 0, 1);
        if (op > .25) { ball(c, 3, 3 + op * 2, 2.5, 1 + op * 2.2, ['#04060c', '#04060c']); PX(c, 2, 3, GH[5]); PX(c, 4, 3, GH[5]); }
        else thick(c, 1, 3, 4, 3, 1, GH[1]);
        // blindfold: a crimson band over the eyes, its tails fluttering behind
        RR(c, -5, -2, 11, 3, BLIND[1]); RR(c, -5, -2, 11, 1, BLIND[2]);
        const fl = Math.sin(t * .15 + i) * 2;
        thick(c, -5, -1, -11, 1 + fl, 2, BLIND[0]); thick(c, -5, 0, -10, 4 + fl * .7, 1, BLIND[1]);
        // turban (caravan head-wrap) with a tail of cloth
        ball(c, -.5, -5.5, 6.5, 4, tp, 0);
        for (let k = 0; k < 3; k++) thick(c, -5 + k, -7 + k * 2, 5 - k, -9 + k * 2.5, 1, tp[k === 1 ? 0 : 3]);
        if (big) { ball(c, 0, -10, 3.5, 3, tp.slice(1), 0); ball(c, 2, -6, 1.6, 1.6, BRASS.slice(1), 0); }
        c.restore();
      };
      const drawHeads = (ctx, b, depth, opts) => {
        const hs = (b.heads || []).filter(h => h.depth === depth && h.grow > .02);
        if (!hs.length) return;
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const h of hs) { const base = wt(b, XT[h.i][0], XT[h.i][1]); h._b = base; x0 = Math.min(x0, h.x - 20, base.x - 12); x1 = Math.max(x1, h.x + 20, base.x + 12); y0 = Math.min(y0, h.y - 20); y1 = Math.max(y1, h.y + 18, base.y + 14); }
        const o = Object.assign({}, opts, { snap: false });
        if (!depth) o.tint = o.tint || { color: '#1a1830', a: .25 };
        KIT.wpuppet(ctx, x0, y0, x1, y1, o, c => {
          c.imageSmoothingEnabled = false;
          for (const h of hs) {
            const base = h._b, g = clamp(h.grow, 0, 1);
            // the spectral torso: a robe tapering from the founder's shoulders down into the great robe
            const mx = lerp(base.x, h.x, .5) - (h.f || 1) * 4, my = lerp(base.y, h.y, .5) + 4, far = clamp((Math.hypot(h.x - base.x, h.y - base.y) - 30) / 60, 0, 1);
            const w0 = lerp(6, 3, far), w1 = lerp(10, 5, far) * g;
            tube(c, [[base.x, base.y], [mx, my], [h.x - (h.f || 1) * 2, h.y + 8]], w0, w1, ROBE.slice(1, 5), .3 * b.facing, -1);
            // ikat stripe running down the torso
            tube(c, [[base.x, base.y], [mx, my], [h.x - (h.f || 1) * 2, h.y + 8]], 1, Math.max(1, 3 * g * (1 - far * .6)), IKAT[h.i % 3], .3 * b.facing, -1);
            if (g > .3) founder(c, b, h, b.t);
          }
        });
      };
      const chains = (ctx, b) => {                         // chained together: neck to neck, sagging, in one world-space puppet
        const hs = (b.heads || []).filter(h => h.grow > .3).sort((a, c) => a.i - c.i);
        if (hs.length < 2) return;
        let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
        for (const h of hs) { x0 = Math.min(x0, h.x - 6); x1 = Math.max(x1, h.x + 6); y0 = Math.min(y0, h.y); y1 = Math.max(y1, h.y + 30); }
        KIT.wpuppet(ctx, x0, y0, x1, y1, { outline: '#06060c', snap: false, rim: { color: '#ffffff', dx: 0, dy: -1, a: .35 } }, c => {
          c.imageSmoothingEnabled = false;
          for (let k = 0; k + 1 < hs.length; k++) {
            const a = hs[k], e = hs[k + 1], ax = a.x, ay = a.y + 8, ex = e.x, ey = e.y + 8, dist = Math.hypot(ex - ax, ey - ay), sag = 4 + dist * .18;
            const n = Math.max(3, Math.round(dist / 3));
            for (let j = 0; j <= n; j++) {
              const u = j / n, x = lerp(ax, ex, u), y = lerp(ay, ey, u) + Math.sin(u * PI) * sag;
              if (j & 1) RR(c, x - 1, y, 3, 1, CHAIN[2]); else { RR(c, x, y - 1, 1, 3, CHAIN[1]); PX(c, x, y - 1, CHAIN[3]); }
            }
            // the collar on each neck
            RR(c, ax - 3, ay - 1, 6, 2, CHAIN[1]); RR(c, ax - 3, ay - 1, 6, 1, CHAIN[3]);
          }
          const l = hs[hs.length - 1]; RR(c, l.x - 3, l.y + 7, 6, 2, CHAIN[1]);
        });
      };
      const body = (c, b) => {
        const o = b.pose, t = b.t, lx = o.lx || 1;
        o.sq && c.scale(1 + .012 * o.sq, 1 - .03 * o.sq);
        o.lean && c.transform(1, 0, .04 * -o.lean, 1, 0, 0);
        c.translate(0, o.bob || 0);
        // back arm (wide sleeve)
        tube(c, [[-7, -44], o.bElb, o.bHand], 7, 5, ROBE.slice(0, 3), lx, -1);
        ball(c, o.bHand[0], o.bHand[1], 2.5, 2.5, GH.slice(1, 4));
        // the great chapan: a long caravan robe, striped ikat, ragged into mist at the hem
        const hem = []; for (let k = 0; k <= 8; k++) { const u = k / 8; hem.push(lerp(25, -25, u), -1 + Math.sin(t * .1 + k * 1.3) * 2 + (k & 1) * 3); }
        cel(c, [-17, -40, -11, -52, 4, -53, 12, -44, 16, -24, ...hem, -22, -18], ROBE.slice(0, 5), [2, 5, 9, 13]);
        // ikat bands (wavy, abr-dyed edges)
        for (let k = 0; k < 5; k++) {
          const x = -16 + k * 8, pal = IKAT[k % 3];
          for (let y = -48 + Math.abs(k - 2) * 2; y < -2; y += 2) { const w = Math.sin(y * .5 + k) > .3 ? 3 : 2; RR(c, x + Math.round(Math.sin(y * .25 + k) * 1.2), y, w, 2, pal[(y >> 2) & 1 ? 1 : 2]); }
        }
        // chains wrapped around the robe
        for (const [y0, y1] of [[-36, -30], [-20, -15]]) for (let x = -18; x <= 16; x += 2) { const y = lerp(y0, y1, (x + 18) / 34) + Math.sin(x * .3) * .5; RR(c, x, Math.round(y), 2, 1, (x >> 1) & 1 ? CHAIN[2] : CHAIN[1]); }
        // the empty hood: a dark well where the eighth face should be
        cel(c, [-12, -42, -9, -56, 0, -60, 9, -54, 11, -44, 0, -40], ROBE.slice(1, 5), [1.5, 3]);
        ball(c, 1, -48, 6, 5, ['#020208', '#06060e'], 0);
        // the caravan-bashi's staff: a pole with a brass bell and a lantern (sweep attack)
        const l = o.staffA, fx = o.fHand[0], fy = o.fHand[1], h = Math.cos(l), d = Math.sin(l), u = [fx + 38 * h, fy + 38 * d];
        tube(c, [[fx - 30 * h, fy - 30 * d], [fx, fy], u], 3, 3, ['#1a0e06', '#3e2412', '#6a4220'], lx, -1);
        const sw = Math.sin(t * .09) * 2;
        thick(c, u[0], u[1], u[0] - 1 + sw, u[1] + 8, 1, CHAIN[2]);
        ball(c, u[0] - 1 + sw, u[1] + 11, 3, 3.5, BRASS, 0); RR(c, u[0] - 2 + sw, u[1] + 14, 3, 1, BRASS[0]);
        ball(c, u[0], u[1] - 2, 2.5, 3, BRASS.slice(0, 3), 0);
        o._lamp = [u[0] - 1 + sw, u[1] + 11];
        // front sleeve + hand on the staff
        tube(c, [[5, -45], o.fElb, o.fHand], 8, 6, ROBE.slice(1, 4), lx, -1);
        ball(c, o.fHand[0], o.fHand[1], 2.6, 2.6, GH.slice(1, 4));
      };
      def.drawBoss = function (ctx, b) {
        const o = b.pose; if (!o || !o.lx) return;
        const s = b.popts();
        drawHeads(ctx, b, 0, s);
        KIT.puppet(ctx, b.x, b.y, Object.assign({}, s, { w: 156, h: 134, ox: 78, oy: 122, flip: b.facing < 0, snap: false }), c => { c.imageSmoothingEnabled = false; body(c, b); });
        drawHeads(ctx, b, 1, s);
        chains(ctx, b);
      };
      def.rims = (sun, b) => [{ color: '#d8ecff', dx: sun || 1, dy: -1, a: .5 }, { color: '#7a6aff', dx: -(sun || 1), dy: 0, a: .3 }];
      def.outline = '#04060e';
      def.drawFx = function (ctx, b) {
        const o = b.pose; if (!o || b.alpha < .15) return;
        const t = b.t, ph = b.phase, tk = teleK(b);
        for (const h of b.heads || []) {
          if (h.grow < .5) continue;
          const dead = h.st === 'dying' && h.t > h.dly, f = h.f || b.facing;
          if (dead) continue;
          // light leaks from under the blindfold; a striking/winding head burns through it
          const hot = h.st === 'wind' || h.st === 'strike' || h.st === 'spit' || h.st === 'aim' || tk > 0;
          const ey = Math.round(h.y - 1), ex = Math.round(h.x);
          ctx.fillStyle = hot ? '#e8e0ff' : '#7a98e8';
          ctx.fillRect(ex - 2, ey + 1, 5, 1);
          glow(h.x + f * 1, h.y, hot ? 11 : 7, hot ? '#a080ff' : '#4a6ae0', hot ? .45 : .25);
          if (h.open > .5) glow(h.x + 3 * f, h.y + 4, 9, '#8aa8ff', .3);
          if (budget(b, 23) && Math.random() < .5) spawn({ x: h.x + U.rand(-5, 5), y: h.y + 8, vy: U.rand(.2, .5), vx: U.rand(-.2, .2), life: 30, size: 1, color: '#9ab8ff', glow: true, glowR: 0, alpha: .6 });
        }
        // the lantern on the staff
        if (o._lamp) { const p = wt(b, o._lamp[0], o._lamp[1]); ctx.fillStyle = '#ffe9a8'; ctx.fillRect(Math.round(p.x) - 1, Math.round(p.y), 2, 2); glow(p.x, p.y, 16, '#ffc860', .6); light(p.x, p.y, 70, '#ffd890', .5); }
        // mist rolling off the hem
        if (budget(b, 3)) spawn({ x: b.x + U.rand(-26, 26), y: b.y - U.rand(0, 6), vx: U.rand(-.4, .4), vy: -U.rand(.05, .3), life: 50, shape: 'circle', size: 2, size1: 4, color: '#2a3a6a', alpha: .35 });
        // phase 2+: the chains glow, the chaining song
        if (ph >= 2 || b.mode === 'phase') {
          const hs = (b.heads || []).filter(h => h.grow > .3).sort((a, c) => a.i - c.i), k = b.mode === 'phase' ? phaseK(b) : .6 + .3 * Math.sin(t * .1);
          for (let j = 0; j + 1 < hs.length; j++) { const a = hs[j], e = hs[j + 1]; glow((a.x + e.x) / 2, (a.y + e.y) / 2 + 12, 16, '#8a7aff', .35 * k); }
        }
        light(b.x, b.y - 50, 130, '#a8b8ff', .35 * b.alpha);
        let hx = 0, hy = 0, hn = 0; for (const h of b.heads || []) if (h.grow > .5) { hx += h.x; hy += h.y; hn++; }
        if (hn) light(hx / hn, hy / hn, 90, '#d8e4ff', .45 * b.alpha);
      };
    });

    /* ================================================================== polish: YALMOG'IZ KAMPIR, AK BARS, AJDAHO
       Their engine drawings are kept (they were designed), with richer light, particles, readable telegraphs and phase drama. */
    guard('kempir', () => {
      const def = B('kempir'); if (!def || !def.drawFx) return; def._drawFx0 = def.drawFx;
      const fx0 = def.drawFx;
      def.rims = (sun, b) => [{ color: '#ffe2a8', dx: sun || 1, dy: -1, a: .62 }, { color: '#9dff7a', dx: -(sun || 1), dy: 0, a: .5 }];
      def.drawFx = function (ctx, b, fr) {
        fx0.call(this, ctx, b, fr);
        if (b.alpha < .15 || !b.pose) return;
        const t = b.t, ph = b.phase, a = KIT.arena();
        // a witch-circle on the floor: runes turning under her
        const k = ph >= 2 ? 1 : .55, R = 34 + 4 * Math.sin(t * .03);
        for (let i = 0; i < 16; i++) {
          const an = t * .015 * (ph >= 3 ? 2 : 1) + i * TAU / 16, x = b.x + Math.cos(an) * R, y = a.floor - 1 + Math.sin(an) * 3;
          if (!onS(x, y)) continue;
          ctx.globalAlpha = (Math.sin(an) > 0 ? .9 : .35) * k * b.alpha; ctx.fillStyle = i & 1 ? '#b8ff7a' : '#5fd84a';
          ctx.fillRect(Math.round(x), Math.round(y), i % 4 ? 1 : 2, 1);
        }
        ctx.globalAlpha = 1;
        glow(b.x, a.floor - 2, 50, '#5fd84a', .18 * k);
        // heads winding up a bite/spit flare at the mouth: readable per head
        for (const h of b.heads || []) {
          if (h.grow < .5) continue;
          if (h.st === 'wind' || h.st === 'aim' || h.st === 'spit') {
            const q = h.st === 'wind' ? clamp(h.t / (h.wind || 20), 0, 1) : .7;
            glow(h.x + 4 * h.f, h.y + 3, 8 + 8 * q, '#c8ff8a', .25 + .3 * q);
            if (q > .6 && (t & 3) === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(h.x + 3 * h.f), Math.round(h.y - 1), 1, 1); }
          }
        }
        // witch-fire motes rising from the robe; ash-feathers in phase 3
        if (budget(b, ph >= 3 ? 2 : 4)) spawn({ x: b.x + U.rand(-22, 22), y: b.y - U.rand(0, 10), vx: U.rand(-.2, .2), vy: -U.rand(.4, 1.1), life: U.randi(30, 50), size: 1, shape: 'spark', len: 1, color: '#d8ffb0', color2: '#3a9a3a', glow: true, glowR: 0, grav: -.01 });
        if (ph >= 3 && budget(b, 9)) spawn({ x: b.x + U.rand(-40, 40), y: b.y - U.rand(60, 110), vx: U.rand(-.4, .4), vy: U.rand(.2, .5), life: 80, shape: 'rect', w: 2, h: 1, size: 1, color: '#1a1424', vr: .1 });
      };
      withDrama(def, '#5fd84a', '#e8ffd0', 50);
    });
    guard('barys', () => {
      const def = B('barys'); if (!def || !def.drawFx) return; def._drawFx0 = def.drawFx;
      const fx0 = def.drawFx;
      def.rims = (sun, b) => [{ color: '#ffffff', dx: sun || 1, dy: -1, a: .5 }, { color: '#5aa8f0', dx: -(sun || 1), dy: 0, a: .4 }];
      def.drawFx = function (ctx, b, fr) {
        fx0.call(this, ctx, b, fr);
        const s = b.pose; if (b.alpha < .2 || !s || !s.S) return;
        const t = b.t, ph = b.phase, tk = teleK(b);
        const hd = b.wpt(s.H[0] + 6, s.H[1] + 2, s.rot);
        // frost breath: puffs from the muzzle
        if ((t % 70) < 14 && budget(b, 2)) spawn({ x: hd.x, y: hd.y, vx: b.facing * U.rand(.3, .8), vy: -U.rand(0, .3), drag: .95, life: 34, shape: 'circle', size: 1, size1: 4, color: '#e8f6ff', alpha: .45 });
        // snow sparkle in the fur
        if (budget(b, 3)) { const p = b.wpt(U.rand(-24, 24), -U.rand(4, 30), s.rot); spawn({ x: p.x, y: p.y, life: 14, shape: 'star', size: 1, color: '#ffffff', glow: true }); }
        // telegraph: ice crystals grow at the paws, the eyes burn
        if (tk > 0) { glow(hd.x, hd.y - 4, 16 + 16 * tk, '#9ffcff', .6 * tk + .2); if (budget(b, 2)) spawn({ x: b.x + U.rand(-24, 24), y: b.y - 1, vy: -U.rand(.2, .8), life: 20, shape: 'spark', len: 2, size: 1, color: '#ffffff', color2: '#7ad8ff', glow: true, glowR: 0 }); }
        // cold light around the leopard, aurora wisps in phase 2+
        light(b.x, b.y - 20, 100, '#bfe8ff', .25);
        glow(b.x, b.y - 2, 50, '#6fc8ff', .15 + .1 * (ph - 1));
        if ((ph >= 2 || b.mode === 'phase') && budget(b, 3)) spawn({ x: b.x + U.rand(-36, 36), y: b.y - U.rand(10, 50), vx: U.rand(-.3, .3), vy: -U.rand(.3, .8), life: 40, size: 1, shape: 'spark', len: 2, color: ph >= 3 ? '#d8b0ff' : '#a8fff0', color2: '#4a8aff', glow: true, glowR: 0, grav: -.01 });
      };
      withDrama(def, '#7ad8ff', '#ffffff', 22);
    });
    guard('aidahar', () => {
      const def = B('aidahar'); if (!def || !def.drawFx) return; def._drawFx0 = def.drawFx;
      const fx0 = def.drawFx;
      def.drawFx = function (ctx, b, fr) {
        fx0.call(this, ctx, b, fr);
        if (b.alpha < .2 || !b.segs) return;
        const t = b.t, ph = b.phase, tk = teleK(b), N = b.segs.length;
        // the body smoulders: embers from the scales, underglow light along the spine
        for (let i = 0; i < N; i += 6) { const q = b.segs[i]; if (onS(q.x, q.y)) light(q.x, q.y, 50, '#ff9a50', .35); }
        if (budget(b, ph >= 2 ? 1 : 2)) { const q = b.segs[(Math.random() * N) | 0]; if (q && onS(q.x, q.y)) spawn({ x: q.x + U.rand(-q.r, q.r), y: q.y - q.r * .5, vx: U.rand(-.3, .3), vy: -U.rand(.4, 1.2), life: U.randi(24, 44), size: 1, shape: 'spark', len: 1, color: '#ffe0a0', color2: ph >= 3 ? '#ff3a20' : '#ff8a2a', glow: true, glowR: 0, grav: -.02 }); }
        // telegraph: the maw fills with fire before it opens
        if (tk > 0 && b.hx !== undefined) {
          const ca = Math.cos(b.ha), sa = Math.sin(b.ha), mx = b.hx + ca * 26, my = b.hy + sa * 26;
          glow(mx, my, 18 + 22 * tk, '#ffb030', .5 + .5 * tk);
          if (budget(b, 1)) spawn({ x: mx + U.rand(-20, 20), y: my + U.rand(-20, 20), life: 12, size: 1, color: '#ffe8a0', glow: true, glowR: 0, update: o => { o.x += (mx - o.x) * .2; o.y += (my - o.y) * .2; } });
        }
        // phase 3: dark smoke streams from between the scales
        if (ph >= 3 && budget(b, 4)) { const q = b.segs[(Math.random() * N) | 0]; if (q) spawn({ x: q.x, y: q.y, vy: -U.rand(.3, .7), life: 50, shape: 'circle', size: 2, size1: 5, color: '#1a0608', alpha: .5 }); }
      };
      withDrama(def, '#ff8a2a', '#fff0c0', 0);
    });
    // drama for the custom bosses (their own drawFx stays the second step)
    for (const [id, col, hot, cy] of [['glutton', '#ffb030', '#fff4c8', 34], ['hound', '#ffc040', '#fff2c0', 46], ['choir', '#6ac8ff', '#ffffff', 40], ['albasty', '#3ad8d0', '#d8fff8', 34], ['seven', '#8a7aff', '#e8e4ff', 50]])
      guard('drama_' + id, () => { const d = B(id); if (d && d.drawFx) withDrama(d, col, hot, cy); });

    /* ================================================================== REGULAR ENEMIES
       Each family gets a rim colour that separates it from its backgrounds, silhouette details painted into the same puppet
       (so they share the outline, flash and death shatter), secondary motion, and unlit eyes/particles in drawFx.
       Anchors: file-1 enemies record their eye in e.data.eyes[0], file-2 in e.data.eye (local puppet coordinates). */
    const headOf = e => { const d = e.data; return d && (d.eyes && d.eyes[0] || d.eye) || null; };
    const setRim = (d, rim) => {
      const ds = Object.getOwnPropertyDescriptor(d, 'rim');
      if (ds && ds.get) { if (ds.configurable) Object.defineProperty(d, 'rim', { get: () => rim, enumerable: true, configurable: true }); }
      else d.rim = rim;
    };
    const enemyArt = (id, o) => guard('en_' + id, () => {
      const d = ED[id]; if (!d) return;
      if (o.rim) setRim(d, o.rim);
      if (o.outline) d.outline = o.outline;
      if (o.draw) { const f = d.draw; d.draw = function (c, e, fr) { const r = f.apply(this, arguments); try { if (!(e.data && e.data.alpha < .05)) o.draw(c, e, headOf(e), e.t || 0); } catch (x) { } return r; }; }
      if (o.fx) { const f = d.drawFx; d.drawFx = function (ctx, e, fr) { const r = f ? f.apply(this, arguments) : undefined; try { if (!e.dead && G.onScreen(e.x, e.y, 40)) o.fx(ctx, e, headOf(e), e.t || 0); } catch (x) { } return r; }; }
    });
    const W = (e, p, dx, dy) => ({ x: e.x + e.facing * (p[0] + (dx || 0)) * (e.scale || 1), y: e.y + (p[1] + (dy || 0)) * (e.scale || 1) });
    const eb = (e, n) => { const d = e.data || (e.data = {}); d._ef = (d._ef || 0) + 1; return d._ef % n === 0; };
    // the Hollow: a grey shawl over the head, its tail swaying; empty eye holes with a faint pale light
    enemyArt('yd_hollow', {
      rim: { color: '#d0c4ff', dx: -1, dy: -1, a: .5 }, outline: '#08060e',
      draw(c, e, h, t) {
        if (!h) return;
        const [x, y] = h, sw = Math.sin(t * .07 + (e.data.ph || 0)) * 1.5 - (e.vx || 0) * e.facing * 2;
        fillPoly(c, [x - 7, y - 2, x - 4, y - 7, x + 1, y - 7, x + 2, y - 3, x - 1, y + 1, x - 6, y + 5], '#4a4652');
        fillPoly(c, [x - 6, y - 3, x - 4, y - 6, x, y - 6, x, y - 3, x - 3, y], '#6a6676');
        thick(c, x - 6, y + 3, x - 9 + sw, y + 10, 2, '#4a4652'); thick(c, x - 8 + sw, y + 9, x - 10 + sw * 1.4, y + 13, 1, '#3a3642');
        RR(c, x - 1, y - 1, 2, 2, '#06040a');
      },
      fx(ctx, e, h, t) {
        if (!h) return; const p = W(e, h, 0, 0);
        ctx.fillStyle = '#e8e0ff'; ctx.fillRect(Math.round(p.x - (e.facing > 0 ? 1 : 0)), Math.round(p.y), 1, 1);
        glow(p.x, p.y, 6, '#b8a8ff', .35);
        if (eb(e, 40)) spawn({ x: e.x + U.rand(-5, 5), y: e.y - U.rand(8, 20), vy: -.2, vx: U.rand(-.1, .1), life: 50, size: 1, color: '#a8a0c0', alpha: .7 });
      }
    });
    // wardens of the Singers: the Choir's tall white hat with a turquoise band, a white stole; cold cyan eyes
    enemyArt('yd_warden', {
      rim: { color: '#d8f4ff', dx: -1, dy: -1, a: .5 }, outline: '#06081a',
      draw(c, e, h, t) {
        if (!h) return;
        const [x, y] = h, b = Math.sin(t * .05) * .5;
        fillPoly(c, [x - 6, y - 5, x + 3, y - 5, x + 1, y - 14, x - 1 + b, y - 18, x - 4 + b, y - 17, x - 5, y - 12], '#c8d0dc');
        fillPoly(c, [x - 2, y - 6, x + 2, y - 6, x + 0, y - 14, x - 1 + b, y - 16], '#eef2f8');
        RR(c, x - 6, y - 6, 9, 2, '#1f7a80'); RR(c, x - 6, y - 6, 9, 1, '#3fc0c0');
      },
      fx(ctx, e, h) { if (!h) return; const p = W(e, h); ctx.fillStyle = '#bff4ff'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); glow(p.x, p.y, 7, '#6ac8ff', .45); }
    });
    // Divan sell-swords: a spiked helm with a crimson horsehair plume
    enemyArt('yd_divan_merc', {
      rim: { color: '#ffd8b0', dx: -1, dy: -1, a: .5 }, outline: '#0e0406',
      draw(c, e, h, t) {
        if (!h) return;
        const [x, y] = h, sw = Math.sin(t * .09) * 1.5 - (e.vx || 0) * e.facing * 2;
        fillPoly(c, [x - 6, y - 3, x - 4, y - 7, x + 1, y - 8, x + 3, y - 4], '#9a9aa8');
        RR(c, x - 5, y - 4, 8, 1, '#d8a040');
        thick(c, x - 2, y - 8, x - 1, y - 12, 1, '#d8d8e0');
        thick(c, x - 2, y - 11, x - 7 + sw, y - 8, 2, '#8a1a22'); thick(c, x - 6 + sw, y - 8, x - 9 + sw * 1.5, y - 3, 1, '#b02a2a');
      },
      fx(ctx, e, h, t) { if (h && (t % 90) < 6) { const p = W(e, h, -1, -12); glow(p.x, p.y, 6, '#ffffff', .7); } }
    });
    // karez leech: a lamprey ring of teeth, slime sheen, drips
    enemyArt('yd_leech', {
      rim: { color: '#d8ffa8', dx: 0, dy: -1, a: .45 }, outline: '#060a04',
      draw(c, e, h, t) {
        if (!h) return;
        const [x, y] = h, o = 1 + (Math.sin(t * .2) > 0 ? 1 : 0);
        ball(c, x + 2, y + 1, 2.5, 2.5, ['#e8d8c0', '#f8f0e0'], 0);
        RR(c, x + 1, y + 1 - (o > 1 ? 1 : 0), 2, o, '#2a0408');
        for (let k = 0; k < 3; k++) PX(c, x - 4 - k * 3, y - 2 + (k & 1), '#c8ffb0');
      },
      fx(ctx, e) { if (eb(e, 26)) spawn({ x: e.x + U.rand(-5, 5), y: e.y - 2, vy: .2, grav: .1, life: 24, size: 1, color: '#a8e86a', glow: true, glowR: 0 }); }
    });
    // blind eel: a pale lure on a stalk, bioluminescent freckles
    enemyArt('yd_eel', {
      rim: { color: '#c8fff4', dx: 0, dy: -1, a: .5 }, outline: '#020608',
      fx(ctx, e, h, t) {
        const p = h ? W(e, h, 3, -6) : { x: e.x + e.facing * 8, y: e.y - 12 };
        const q = { x: p.x + Math.sin(t * .08) * 1.5, y: p.y - 2 + Math.cos(t * .06) };
        ctx.globalAlpha = .7; Art.thick(ctx, p.x, p.y + 4, q.x, q.y, 1, '#6a8a8a'); ctx.globalAlpha = 1;
        ctx.fillStyle = '#e8fff8'; ctx.fillRect(Math.round(q.x) - 1, Math.round(q.y) - 1, 2, 2);
        glow(q.x, q.y, 12, '#5ff2e6', .6); light(q.x, q.y, 40, '#7af0e6', .5);
      }
    });
    // the drowned: lank wet hair and river-weed, water dripping, a puddle ring
    enemyArt('yd_drowned', {
      rim: { color: '#a8fff0', dx: -1, dy: -1, a: .5 }, outline: '#020608',
      draw(c, e, h, t) {
        if (!h) return;
        const [x, y] = h, sw = Math.sin(t * .05) * .8;
        for (let k = 0; k < 4; k++) thick(c, x - 4 + k * 2, y - 3, x - 5 + k * 2 + sw, y + 6 + (k & 1) * 3, 1, k & 1 ? '#0c1c1a' : '#16302c');
        thick(c, x - 5, y + 2, x - 6 + sw, y + 12, 1, '#2c5228'); PX(c, x - 6 + sw, y + 8, '#4a7a3a');
      },
      fx(ctx, e, h, t) {
        if (h) { const p = W(e, h); ctx.fillStyle = '#9ffcf0'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); glow(p.x, p.y, 7, '#3ad8d0', .5); }
        if (eb(e, 14)) spawn({ x: e.x + U.rand(-6, 6), y: e.y - U.rand(6, 22), vy: .4, grav: .16, life: 26, size: 1, color: '#7af0e6', glow: true, glowR: 0 });
        if ((t % 50) === 0) spawn({ x: e.x, y: e.y - 1, shape: 'ring', size: 2, size1: 8, life: 20, color: '#5fd8d0', drag: 1, alpha: .5 });
      }
    });
    // walking memories (dream): a soft halo, afterimages, star motes; their eyes are white
    enemyArt('yd_walker', {
      rim: { color: '#e8d8ff', dx: -1, dy: -1, a: .55 }, outline: '#0a0618',
      fx(ctx, e, h, t) {
        glow(e.x, e.y - 8, 18, '#8a7aff', .25);
        if (h) { const p = W(e, h); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); glow(p.x, p.y, 6, '#c8b8ff', .5); }
        if (eb(e, 10)) spawn({ x: e.x + U.rand(-7, 7), y: e.y - U.rand(2, 16), vy: -.3, life: 24, shape: 'star', size: 1, color: '#e8e0ff', glow: true });
        if (Math.abs(e.vx || 0) > 1.2 && eb(e, 6)) G.FX.ghost && e.data && (e.data.ghostT = 3);
      }
    });
    // the rest of the Yodgor families: at least a rim and outline that read against their backgrounds
    const RIMS = { yd_acolyte: ['#ffe6b0', '#100608'], yd_scavenger: ['#e8d8c0', '#0a0806'], yd_divan_archer: ['#ffe0a0', '#0e0806'], yd_gilded: ['#fff0b0', '#100a02'],
      yd_albasty_kin: ['#c8fff4', '#04080a'], yd_founder_guard: ['#c8d8ff', '#04060e'], yd_shade: ['#c8e0ff', '#040818'], yd_ember: ['#ffd090', '#140402'],
      yd_guest: ['#d8f0ff', '#04080e'], yd_sand_ghul: ['#ffe0b0', '#0e0804'], yd_nightmare: ['#ff9ab0', '#0e0208'], yd_dream_tiger: ['#e0d8ff', '#080418'], yd_salt_scorpion: ['#ffffff', '#08080a'] };
    for (const id in RIMS) enemyArt(id, { rim: { color: RIMS[id][0], dx: -1, dy: -1, a: .5 }, outline: RIMS[id][1] });
    // the guests and shades shimmer; founder guards' eyes
    enemyArt('yd_shade', { fx(ctx, e) { glow(e.x, e.y - 12, 16, '#4a8aff', .3); if (eb(e, 12)) spawn({ x: e.x + U.rand(-6, 6), y: e.y - U.rand(0, 20), vy: -.4, life: 26, size: 1, color: '#9ad0ff', glow: true, glowR: 0 }); } });
    enemyArt('yd_founder_guard', { fx(ctx, e, h) { if (h) { const p = W(e, h); ctx.fillStyle = '#c8d8ff'; ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1); glow(p.x, p.y, 7, '#6a8aff', .5); } } });

    G.ART_BOSSES.version = 1;
  } catch (e) { console.error('[art_bosses]', e); }
}
