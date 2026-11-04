/* Yodgor v2 — the hero, Ravshan the yodchi (drawing only; gameplay untouched).
   Dark indigo ikat chapan with a madder sash tied at the back, leather tithe satchel
   on a cross strap, silver tumar on a cord, tall boots, chust doppi.
   Replaces Player.prototype.drawPuppet / drawDead / draw / updateScarf (visual-only),
   re-skins the head sprite of the head patch (G.HERO_HEAD) and adds secondary motion
   (chapan hem and sash with velocity, satchel bounce) stepped after Player.update. */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.Player || !G.Art || !G.PLAYER_PAL) return;
  const A = G.Art, PP = G.Player.prototype, PAL = G.PLAYER_PAL;
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const R = Math.round;

  // ------------------------------------------------------------------ palette
  // Every colour is used by >= 4 pixels on a normal frame so the engine's colour
  // snapping (Art.process) keeps the small details.
  const C = {
    out: PAL.out || '#100a1b',
    robe: '#26305a', robeD: '#171c3a', robeL: '#3a4a86', robeX: '#0f1228',
    ikA: '#a8343e', ikAd: '#6a1e30', ikB: '#d29a48', ikC: '#2f8f96',
    trim: '#d6a24a', trimD: '#8a5a24',
    shirt: '#e2d6b8', shirtD: '#a8987a',
    sash: '#b83a3a', sashD: '#741c2a', sashL: '#e2664a',
    leather: '#5e3820', leatherD: '#381e10', leatherL: '#86542c', brass: '#f0c25a',
    silver: '#e4e8ec', silverD: '#8a929e',
    pants: '#2c2638', pantsD: '#1c1826',
    boot: '#3e261a', bootL: '#6e4a32', bootD: '#1e120c',
    skin: '#c9a27f', skinD: '#a8825f', skinF: '#8a6a52',
    hair: '#2e2220', cap: '#1d1a26', capL: '#3e3852', capW: '#eee6d2'
  };
  Object.assign(PAL, {
    robe: C.robe, robeD: C.robeD, robeL: C.robeL, trim: C.trim, trimD: C.trimD,
    sash: C.sash, sashD: C.sashD, pants: C.pants, pantsD: C.pantsD, pantsF: C.pantsD,
    boot: C.boot, bootL: C.bootL, bootD: C.bootD, skin: C.skin, skinF: C.skinF, skinD: C.skinD,
    fur: C.shirt, furD: C.shirtD, armF: C.robeD, hair: C.hair, cap: C.cap, capW: C.capW
  });

  // ------------------------------------------------------------------ head
  // 8x9, facing right; neck pixel at (3,8). k cap top, K cap, W pepper motif and band,
  // H hair, B beard/brow, s skin, D shade/ear, E eye, n nose.
  const H = G.HERO_HEAD;
  if (H) {
    H.rows = [
      '.KKKKK..',
      'KKKWKKK.',
      'KKWKKKK.',
      'HDsssBs.',
      'HDsssEs.',
      'HDssssss',
      '.BssBBB.',
      '.BBBBBB.',
      '...Ds...'
    ];
    H.ax = 3; H.ay = 8; H.tuck = [2, 6]; H.v = 7;
    const pal0 = H.pal;
    H.pal = function () {
      const p = pal0 ? pal0.call(this) : {};
      return Object.assign(p, { k: C.capL, K: C.cap, W: C.capW, H: C.hair, B: C.hair, E: '#1a1012', s: C.skin, D: C.skinD, n: C.skin, F: C.skinF, w: '#efe8dc' });
    };
  }

  // ------------------------------------------------------------------ helpers
  const px = (o, x, y, w, h, col) => { o.fillStyle = col; o.fillRect(R(x), R(y), w, h); };
  const thick = (o, x0, y0, x1, y1, w, col) => A.thick(o, x0, y0, x1, y1, w, col);
  // abr (ikat) motif: blurred diamonds in crimson with an ochre halo, teal sparks
  function ikat(x, y) {
    const j = ((y * 7) % 5 === 0) ? 1 : 0; // the "blur" of resist-dyed threads
    const u = (((x + j) % 6) + 6) % 6, v = ((y % 8) + 8) % 8;
    const w = v === 0 || v === 7 ? -1 : v === 1 || v === 6 ? 0.5 : v === 2 || v === 5 ? 1 : 1.5;
    if (Math.abs(u - 2.5) <= w) return 1;
    if ((v === 0 || v === 7) && (u === 2 || u === 3)) return 2;
    if (u === 5 && (v === 3 || v === 4)) return 3;
    return 0;
  }
  const BOOT = ['BBBn.', 'BBBBn', 'ooooo'];
  const bootN = () => A.sprite('ydBootN', BOOT, { B: C.boot, n: C.bootL, o: C.bootD });
  const bootF = () => A.sprite('ydBootF', BOOT, { B: C.bootD, n: C.boot, o: '#140c08' });

  // ------------------------------------------------------------------ cloth state
  function cloth(p) {
    return p._ha || (p._ha = { hem: 0, hemV: 0, lift: 0, liftV: 0, bag: 0, bagV: 0, bagX: 0, bagXV: 0, step: -1, sway: 0 });
  }
  function stepCloth(p) {
    const s = cloth(p), f = p.facing || 1, vx = p.vx || 0, vy = p.vy || 0;
    const fwd = vx * f;
    const T = G.time || 0;
    const speed = Math.min(1, Math.abs(vx) / 2.05);
    // hem trails behind (negative local x) when moving forward; flutters at speed
    let tgt = clamp(-fwd * 1.1, -2.6, 1.6) + Math.sin(T * 9 + 1.3) * 0.55 * speed + Math.sin(T * 1.7) * 0.25;
    if (p.state === 'hurt') tgt = 1.5;
    s.hemV += (tgt - s.hem) * 0.2; s.hemV *= 0.74; s.hem += s.hemV;
    // falling lifts the skirt, jumping drags it
    const lt = p.onGround ? 0 : clamp(vy * 0.55, -1, 2.6);
    s.liftV += (lt - s.lift) * 0.22; s.liftV *= 0.72; s.lift += s.liftV;
    // satchel: lags vertical motion, bounces on every step
    const st = p.anim ? p.anim.step : -1;
    if (p.onGround && Math.abs(vx) > 0.25 && st !== s.step && st % 2 === 0) s.bagV -= 0.55;
    s.step = st;
    if (p.anim && p.anim.land > 4) s.bagV += 0.35;
    const bt = clamp(-vy * 0.3, -1.6, 1.8);
    s.bagV += (bt - s.bag) * 0.24; s.bagV *= 0.8; s.bag += s.bagV;
    const bx = clamp(-fwd * 0.45, -1.2, 1);
    s.bagXV += (bx - s.bagX) * 0.2; s.bagXV *= 0.78; s.bagX += s.bagXV;
  }

  // sash tails: same verlet chain as the engine's scarf, anchored at the back of the waist
  PP.updateScarf = function () {
    const e = this.scarf, a = this.facing, o = this.pose || {};
    if (!e || !e.length) return;
    let sx = this.x - 4 * a, sy = this.y - 13;
    if (this.state === 'roll') { sx = this.x - a; sy = this.y - 8; }
    else if (o.hip) { sx = this.x + a * (o.hip[0] - 4); sy = this.y + o.hip[1] - 1; }
    e[0].x = e[0].px = sx; e[0].y = e[0].py = sy;
    const i = Math.min(1, Math.abs(this.vx) / 2.05), r = G.time || 0;
    const f = 0.035 * -this.vx + 0.16 * Math.sin(2.7 * r) + 0.05 * (G.level && G.level.biome && G.level.biome.wind || 0);
    for (let t = 1; t < e.length; t++) {
      const q = e[t], ox = 0.86 * (q.x - q.px), oy = 0.86 * (q.y - q.py);
      q.px = q.x; q.py = q.y;
      q.x += ox + f * (0.5 + 0.12 * t) + 0.012 * Math.sin(6.5 * r + 0.9 * t) * t;
      q.y += oy + 0.16 + 0.07 * Math.sin(11 * r - 1.3 * t) * t * i;
    }
    const L = 2.1;
    for (let k = 0; k < 4; k++)
      for (let t = 1; t < e.length; t++) {
        const a0 = e[t - 1], b = e[t], dx = b.x - a0.x, dy = b.y - a0.y, d = Math.hypot(dx, dy) || 0.001, q = (d - L) / d;
        if (t === 1) { b.x -= dx * q; b.y -= dy * q; } else { a0.x += dx * q * 0.5; a0.y += dy * q * 0.5; b.x -= dx * q * 0.5; b.y -= dy * q * 0.5; }
      }
    for (let t = 1; t < e.length; t++) if (e[t].y > this.y - 1) e[t].y = this.y - 1;
  };

  const up0 = PP.update;
  PP.update = function () {
    up0.apply(this, arguments);
    try { stepCloth(this); } catch (err) { /* drawing only */ }
  };

  // ------------------------------------------------------------------ body parts
  function drawTails(o, p, s) {
    const v = p.scarf, k = p.facing || 1;
    if (!v || v.length < 3 || s.roll > 0) return;
    const pts = [];
    for (let t = 0; t < Math.min(v.length, 7); t++) pts.push([(v[t].x - p.x) * k, v[t].y - p.y]);
    // second (shorter, darker) tail first, offset down
    for (let t = 0; t < 4; t++) thick(o, pts[t][0] + 0.5, pts[t][1] + 1.5, pts[t + 1][0] + 0.5, pts[t + 1][1] + 2, 1, C.sashD);
    for (let t = 0; t < pts.length - 1; t++) thick(o, pts[t][0], pts[t][1], pts[t + 1][0], pts[t + 1][1], t < 3 ? 2 : 1, t < 4 ? C.sash : C.sashD);
    const e = pts[pts.length - 1];
    px(o, e[0], e[1], 1, 1, C.trim); px(o, e[0] - 1, e[1] + 1, 1, 1, C.trim);
    px(o, pts[1][0], pts[1][1] - 1, 1, 1, C.sashL);
  }
  function sleeve(o, a, el, h, near) {
    const base = near ? C.robe : C.robeD;
    thick(o, a[0], a[1], el[0], el[1], 3, base);
    thick(o, el[0], el[1], h[0], h[1], near ? 3 : 2, near ? C.robe : C.robeD);
    if (near) {
      thick(o, a[0] - 0.5, a[1] - 1, el[0] - 0.5, el[1] - 1, 1, C.robeL);
      thick(o, el[0], el[1] - 1, el[0] + (h[0] - el[0]) * 0.6, el[1] + (h[1] - el[1]) * 0.6 - 1, 1, C.robeL);
    }
    // cuff
    const cx = el[0] + (h[0] - el[0]) * 0.78, cy = el[1] + (h[1] - el[1]) * 0.78;
    px(o, cx - (near ? 1 : 0.5), cy - (near ? 1 : 0.5), near ? 2 : 1, near ? 2 : 1, near ? C.trim : C.trimD);
    px(o, h[0] - 1, h[1] - 1, 2, 2, near ? C.skin : C.skinF);
  }
  function leg(o, hipP, knee, foot, near) {
    thick(o, hipP[0], hipP[1], knee[0], knee[1], 3, near ? C.pants : C.pantsD);
    // tall boot from just under the knee
    const bx = knee[0] + (foot[0] - knee[0]) * 0.25, by = knee[1] + (foot[1] - knee[1]) * 0.25;
    thick(o, knee[0], knee[1], bx, by, 3, near ? C.pants : C.pantsD);
    thick(o, bx, by, foot[0], foot[1], 3, near ? C.boot : C.bootD);
    if (near) { thick(o, bx + 1, by, foot[0] + 1, foot[1] - 1, 1, C.bootL); px(o, bx - 1, by, 3, 1, C.bootD); }
    o.drawImage(near ? bootN() : bootF(), R(foot[0] - 1), R(foot[1]));
  }

  // upper torso + skirt, drawn row by row (pattern, shading, trims)
  function drawCoat(o, sh, hip, s, cl, info) {
    const top = R(sh[1] - 1), waist = R(hip[1] - 1);
    const M = Math.max(4, waist - top);
    const rows = [];
    // --- upper body
    for (let k = 0; k <= M; k++) {
      const t = k / M, cx = R(sh[0] + (hip[0] - sh[0]) * t), y = top + k;
      const xl = cx - (k === 0 ? 3 : 4), xr = cx + (k === 0 ? 3 : k < M - 1 ? 4 : 3);
      rows.push([y, xl, xr, cx, 0]);
    }
    // --- skirt (from the sash down to the hem)
    const hemY = R(-5 - Math.max(0, cl.lift) * 0.8);
    const hy0 = waist + 1, L = Math.max(2, hemY - hy0);
    const kn = info.knees, kmax = Math.max(kn[0][0], kn[1][0]), kmin = Math.min(kn[0][0], kn[1][0]);
    const openF = Math.max(0, kmax - hip[0] - 3), openB = Math.max(0, hip[0] - 3 - kmin);
    const lag = cl.hem, flare = Math.max(0, cl.lift) * 0.6;
    for (let k = 0; k <= L; k++) {
      const t = k / L, y = hy0 + k, cx = hip[0];
      const g = Math.pow(t, 1.4);
      const xl = R(cx - 4 - 1.2 * t - openB * t - flare * t + lag * g);
      const xr = R(cx + 3 + 0.8 * t + openF * t + flare * t + lag * g * 0.55);
      rows.push([y, xl, xr, cx, k === L ? 2 : 1]);
    }
    for (const [y, xl, xr, cx, kind] of rows) {
      for (let x = xl; x <= xr; x++) {
        const rel = x - cx;
        let col;
        const back = x <= xl + 1;
        const m = ikat(rel + 7, y);
        if (kind === 2) col = (x % 3 === 0) ? C.trim : C.trimD;
        else if (x === xr && kind === 1) col = C.robeL;         // front edge catches the light
        else if (back) col = C.robeD;
        else if (m === 1) col = C.ikA;
        else if (m === 2) col = C.ikB;
        else if (m === 3) col = C.ikC;
        else col = x >= xr - 1 && !kind ? C.robeL : C.robe;
        if (x === xl && kind) col = C.robeX;
        px(o, x, y, 1, 1, col);
      }
    }
    // collar: shirt V and lapel
    const cx0 = R(sh[0]);
    for (let k = 0; k < 3; k++) {
      const y = top + k, lx = cx0 + 1 + k;
      px(o, lx, y, 1, 1, C.trim);
      for (let x = lx + 1; x <= cx0 + (k === 0 ? 3 : 4); x++) px(o, x, y, 1, 1, k === 2 ? C.shirtD : C.shirt);
    }
    // lapel continues down the chest to the sash
    for (let k = 3; k <= M - 2; k++) {
      const t = k / M, cx = R(sh[0] + (hip[0] - sh[0]) * t);
      px(o, cx + 4, top + k, 1, 1, C.trim);
    }
    info.top = top; info.waist = waist; info.hemY = hemY; info.M = M;
  }
  function drawStrapTumar(o, sh, hip, info) {
    const top = info.top, M = info.M;
    // strap: far shoulder (back-top) to near hip (front-low)
    const x0 = sh[0] + 2, y0 = top, x1 = hip[0] - 3, y1 = top + M;
    thick(o, x0, y0, x1, y1, 1, C.leather);
    thick(o, x0 - 1, y0 + 1, x1 - 1, y1, 1, C.leatherD);
    // tumar on its cord, on the chest
    const tx = R(sh[0] + 2), ty = top + 3;
    px(o, tx, ty - 1, 1, 1, C.sashD);
    px(o, tx, ty, 2, 1, C.silver); px(o, tx, ty + 1, 1, 1, C.silver);
    px(o, tx + 1, ty + 1, 1, 1, C.silverD);
  }
  function drawSash(o, hip, info) {
    const y = info.waist - 1, cx = hip[0];
    for (let x = cx - 5; x <= cx + 4; x++) {
      px(o, x, y + 1, 1, 1, x === cx - 5 ? C.sashD : ((x + 2) % 4 === 0) ? C.trimD : C.sash);
      px(o, x, y + 2, 1, 1, C.sashD);
    }
    // knot at the back
    px(o, cx - 6, y + 1, 2, 2, C.sash); px(o, cx - 6, y + 1, 1, 1, C.sashL); px(o, cx - 6, y + 3, 1, 1, C.sashD);
  }
  function drawSatchel(o, hip, cl, info) {
    const bx = R(hip[0] - 5 + cl.bagX), by = R(info.waist + 1 + clamp(cl.bag, -1.5, 2));
    px(o, bx, by, 4, 5, C.leather);
    px(o, bx, by + 4, 4, 1, C.leatherD);
    px(o, bx, by, 1, 5, C.leatherD);
    px(o, bx, by, 4, 1, C.leatherL);              // flap edge
    px(o, bx + 1, by + 1, 3, 1, C.leatherL);
    px(o, bx + 2, by + 2, 1, 1, C.brass);         // buckle
    px(o, bx + 1, by + 5, 1, 1, C.silverD);       // a spent tumar tag
  }

  // ------------------------------------------------------------------ the rig
  function drawBody(p, o, s0, opt) {
    opt = opt || {};
    const cl = p._ha || { hem: 0, lift: 0, bag: 0, bagX: 0 };
    const lean = s0.lean || 0;
    const dl = s0.item && p.act ? R(clamp(lean, -0.5, 0.6) * 2) : 0;
    const hurt = p.state === 'hurt';
    const sh = [s0.sh[0] + dl - (hurt ? 1 : 0), s0.sh[1]], hip = s0.hip;
    const pN = [sh[0] + 1, sh[1] + 2], pF = [sh[0] - 2, sh[1] + 2], hN = [hip[0] + 1, hip[1]], hF = [hip[0] - 1, hip[1]];
    const kN = A.ik(hN[0], hN[1], s0.nf[0], s0.nf[1], 6, 6, -1), kF = A.ik(hF[0], hF[1], s0.ff[0], s0.ff[1], 6, 6, -1);
    const eN = A.ik(pN[0], pN[1], s0.nh[0], s0.nh[1], 5, 5, 1), eF = A.ik(pF[0], pF[1], s0.fh[0], s0.fh[1], 5, 5, 1);
    const info = { knees: [kN, kF] };
    if (!opt.noTails) drawTails(o, p, s0);
    sleeve(o, pF, eF, s0.fh, false);
    leg(o, hF, kF, s0.ff, false);
    leg(o, hN, kN, s0.nf, true);
    drawCoat(o, sh, hip, s0, cl, info);
    drawStrapTumar(o, sh, hip, info);
    drawSash(o, hip, info);
    drawSatchel(o, hip, cl, info);
    // boots over the hem
    o.drawImage(bootN(), R(s0.nf[0] - 1), R(s0.nf[1]));
    if (H) H.draw(o, sh[0], sh[1] - 2, p, s0.dead ? { dead: 1 } : s0);
    else px(o, sh[0] - 1, sh[1] - 8, 4, 6, C.skin);
    const F = s0.item;
    if (s0.flask) p.drawFlask(o, s0.nh);
    else if (F && F.def && F.def.held) {
      o.save(); o.translate(R(s0.nh[0]), R(s0.nh[1])); o.rotate(s0.wAng !== undefined ? s0.wAng : 0); o.scale(0.8, 0.8);
      F.def.held(o, F, p.act ? p.act.ws : {}, p); o.restore();
    }
    if (s0.itemBack && s0.itemBack.def && s0.itemBack.def.held) {
      o.save(); o.translate(R(s0.fh[0]), R(s0.fh[1])); o.scale(0.8, 0.8); s0.itemBack.def.held(o, s0.itemBack, {}, p); o.restore();
    }
    sleeve(o, pN, eN, s0.nh, true);
    return sh;
  }

  PP.drawPuppet = function (o, s) {
    if (this.state === 'dead') return void this.drawDead(o);
    if (s.roll > 0) { o.translate(0, -9); o.rotate(s.roll * Math.PI / 2); o.translate(0, 9); }
    const sh = drawBody(this, o, s);
    this.neck = { x: sh[0], y: sh[1] - 2 };
    if (s.roll > 0) this.neck = null;
  };

  // death: buckle to the knees, then topple back and lie with the chapan spread
  PP.drawDead = function (o) {
    const T = this.stateT || 0;
    const kneel = { hip: [0, -8], sh: [1, -16], nf: [4, -1], ff: [-3, 0], nh: [4, -9], fh: [-3, -9], lean: 0, roll: -1, dead: 1 };
    if (T < 8) { drawBody(this, o, kneel, { noTails: false }); return; }
    const lie = { hip: [0, -11], sh: [0, -20], nf: [2, -3], ff: [-2, -2], nh: [6, -15], fh: [-5, -25], lean: 0, roll: -1, dead: 1 };
    if (T < 14) { o.translate(0, -3); o.rotate(-0.75); drawBody(this, o, kneel, { noTails: true }); return; }
    o.translate(0, -4); o.rotate(-Math.PI / 2);
    drawBody(this, o, lie, { noTails: true });
  };

  PP.draw = function (e) {
    const o = this.computePose(), s = this.invulnT > 0 && !this.dead && this.state !== 'roll' && this.invulnT % 6 < 3;
    A.puppet(e, this.x, this.y, {
      w: 96, h: 80, ox: 48, oy: 64, flip: this.facing < 0, flash: this.flashT > 0 ? 0.85 : 0, flashColor: '#fffaf0', outline: C.out,
      rim: { color: '#ffeccc', dx: -1, dy: -1, a: 0.36 }, alpha: s ? 0.55 : 1
    }, c => this.drawPuppet(c, o));
    if (this.state === 'roll' && --this.ghostT <= 0) { this.ghostT = 2; G.FX.ghost('#5a7ac8', 13, 0.38); }
    if (this.act && this.act.item.def.drawWorld) this.act.item.def.drawWorld(e, this, this.act.item, this.act.ws);
  };

  // pose-sheet / tooling helper: settle the cloth for a frozen pose
  G.HERO_ART = {
    C,
    settle(p, n) {
      p.computePose();
      const sv = p._ha; if (sv) { sv.hem = sv.hemV = sv.lift = sv.liftV = sv.bag = sv.bagV = sv.bagX = sv.bagXV = 0; }
      for (let i = 0; i < (n || 30); i++) { stepCloth(p); p.updateScarf(); }
    }
  };
})();
