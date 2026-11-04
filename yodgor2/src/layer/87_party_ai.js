/* =====================================================================
   Companions in the world: the actors (follow, fight by role, the
   commanded skill, downed / revive / out until rest), their drawing
   (the people figures of src/people.js, animated: idle, run, jump,
   attacks, skill, hit, downed), water puddles and sound waves.
   Per tick (inside World#update, so it runs in debugTick as in play):
   the hero's trail, keys 1/2/3 and V, targeting, revive, scaling.
   ===================================================================== */
{
  const PX = G.PARTY._px, PARTY = G.PARTY, DEF = PX.DEF, U = G.U, A = G.Art, TS = G.TS;
  const fr = () => G.frame || 0;
  const pl = () => (G.world && G.world.player) || null;
  const GRAV = 0.3;
  const sgn = v => (v < 0 ? -1 : v > 0 ? 1 : 0);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const enemiesNear = (x, y, r) => G.world.enemies.filter(e => !e.dead && !e.untargetable && !e.isBossPart && Math.abs(e.x - x) < r && Math.abs(e.cy - y) < r * 0.7);
  const isHeavy = e => !!(e.elite || e.isBoss || (e.def && (e.def.miniboss || (e.def.hp || 0) >= 90)) || (e.w || 0) >= 22);
  const isWeak = e => !e.elite && !e.isBoss && !(e.def && e.def.miniboss);

  /* ================================================================ the hero's trail */
  const trail = []; let seq = 0, lastHero = null;
  function trailTick(p) {
    if (lastHero && Math.hypot(p.x - lastHero.x, p.y - lastHero.y) > 140) { trail.length = 0; for (const c of PX.actors()) c.catchUp = 1; }
    lastHero = { x: p.x, y: p.y };
    if (!p.onGround) return;
    const l = trail[trail.length - 1];
    if (!l || Math.abs(l.x - p.x) > 12 || Math.abs(l.y - p.y) > 6) { trail.push({ x: p.x, y: p.y, n: ++seq }); if (trail.length > 420) trail.shift(); }
  }
  PX.trail = trail;
  // the hook line: companions near the hero follow it (82_world_places.js W2.zip) instead of waiting for a teleport
  if (G.WORLD2 && G.WORLD2.zip) {
    const z0 = G.WORLD2.zip;
    G.WORLD2.zip = (p, o) => {
      const x0 = p && p.x, y0 = p && p.y, ok = z0(p, o);
      try {
        if (ok && p === pl() && o && o.pts && o.pts.length) {
          let k = 0;
          for (const c of PX.actors()) {
            if (c.downed || c.gone || Math.hypot(c.x - x0, c.y - y0) > 220) continue;
            c.zipF = { pts: [{ x: x0, y: y0 }].concat(o.pts.map(q => ({ x: q.x, y: q.y }))), i: 0, speed: o.speed || 5, delay: 10 + 9 * k++ };
            c.climbing = null; PX.zips = (PX.zips || 0) + 1;
          }
        }
      } catch (e) { console.error('[party] zip', e); }
      return ok;
    };
  }

  /* ================================================================ the figure (people.js art, animated) */
  // capture the raw (un-outlined) figure that people.js paints, so it can be cut and moved
  const RAW = new Map();
  function rawFigure(id) {
    if (RAW.has(id)) return RAW.get(id);
    const L0 = G.PEOPLE.LOOKS[DEF[id].look];
    const L = Object.assign({}, L0, { staff: 0, spear: 0 });
    const S = G.PEOPLE.spec(L);
    const out = { S, L, f: [] };
    // two breaths, eyes open, no hip shift
    const want = [0, 1];
    for (const br of want) {
      let tt = 8;
      for (; tt < 4000; tt++) {
        const t = tt / 60, hol = !!L.hollow;
        const b = Math.sin(t * (hol ? 1.1 : 1.6)) > 0.2 ? 1 : 0, sh = Math.sin(t * (hol ? 0.7 : 0.38)) > 0.55 ? 1 : 0, bl = (tt % 230) < 7;
        if (b === br && !sh && !bl) break;
      }
      let raw = null; const b0 = A.bake;
      A.bake = (w, h, fn) => { const r = G.makeCanvas(w, h, true); fn(r.ctx); raw = r; return r; };
      try { const tmp = G.makeCanvas(4, 4, true); G.PEOPLE.drawPerson(tmp.ctx, { look: L, x: 24, y: 66, t: tt, face: 1 }); } catch (e) { console.error('[party] figure', e); } finally { A.bake = b0; }
      if (raw) eraseArm(raw, S);
      out.f.push(raw);
    }
    RAW.set(id, out);
    return out;
  }
  // people.js bakes the near arm hanging at the side; paint it over with the torso next to it (we draw our own arm)
  function eraseArm(cv, S) {
    const c = cv.ctx, OX = 24, OY = 66;
    const nsx = S.sw - 2, y0 = S.sh + 2, y1 = S.waist + 5, x0 = nsx - 1, x1 = nsx + 3;
    const img = c.getImageData(0, 0, cv.width, cv.height), d = img.data, W = cv.width;
    for (let y = y0; y <= y1; y++) for (let x = x1; x >= x0; x--) {
      const i = ((OY + y) * W + OX + x) * 4, j = ((OY + y) * W + OX + x - 3) * 4;
      if (d[j + 3] > 100 && x - 3 >= -S.sw) { d[i] = d[j]; d[i + 1] = d[j + 1]; d[i + 2] = d[j + 2]; d[i + 3] = 255; }
      else if (x > nsx + 1) d[i + 3] = 0;
    }
    c.putImageData(img, 0, 0);
  }
  const line = (c, x0, y0, x1, y1, w, col) => A.thick(c, Math.round(x0), Math.round(y0), Math.round(x1), Math.round(y1), w, col);
  const R2 = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  // weapons in the hand (hand at 0,0, angle a: 0 = pointing forward, −π/2 = up)
  function weapon(c, id, hx, hy, a) {
    const ca = Math.cos(a), sa = Math.sin(a);
    const P2 = (d, o) => [hx + ca * d - sa * o, hy + sa * d + ca * o];
    if (id === 'alp') {               // an iron-bound cudgel
      const [x1, y1] = P2(17, 0), [xa, ya] = P2(-3, 0);
      line(c, xa, ya, x1, y1, 2, '#5a3a22');
      const [x2, y2] = P2(11, 0); line(c, x2, y2, x1, y1, 4, '#6e4a2a');
      const [b1x, b1y] = P2(12, 0), [b2x, b2y] = P2(16, 0);
      R2(c, b1x - 1, b1y - 1, 2, 2, '#9a9aa4'); R2(c, b2x - 1, b2y - 1, 2, 2, '#c8c8d0');
    } else if (id === 'nargiza') {    // a dutar: long neck, small pear body
      const [x1, y1] = P2(13, 0), [xa, ya] = P2(-6, 0);
      line(c, xa, ya, x1, y1, 1, '#4a2a14');
      const [bx, by] = P2(-6, 0);
      c.fillStyle = '#a8642a'; c.beginPath(); c.ellipse(Math.round(bx), Math.round(by), 3.2, 2.4, a, 0, 6.3); c.fill();
      R2(c, bx - 1, by - 1, 1, 1, '#e0a060');
      R2(c, x1, y1, 1, 1, '#e8f4ee');
    } else {                          // the mirab's hook-staff
      const [x1, y1] = P2(26, 0), [xa, ya] = P2(-8, 0);
      line(c, xa, ya, x1, y1, 1, '#7a5230');
      const [h1x, h1y] = P2(27, 0), [h2x, h2y] = P2(29, -2), [h3x, h3y] = P2(27, -4), [h4x, h4y] = P2(25, -4);
      line(c, h1x, h1y, h2x, h2y, 1, '#b8c0c8'); line(c, h2x, h2y, h3x, h3y, 1, '#b8c0c8'); line(c, h3x, h3y, h4x, h4y, 1, '#8a929e');
    }
  }
  // the pose for the current animation
  function pose(c) {
    const s = c.anim, t = c.animT, D = c.def;
    const o = { lean: 0, bob: 0, legs: 0, step: 0, arm: [0.5, 0.2], wa: 1.25, crouch: 0, air: 0 };
    if (s === 'run') { const ph = c.runPh; o.step = Math.sin(ph); o.bob = Math.abs(Math.sin(ph)) > 0.7 ? -1 : 0; o.lean = c.id === 'alp' ? 1 : 2; o.arm = [0.9 - 0.5 * Math.sin(ph), 0.4]; o.wa = c.id === 'surayyo' ? 0.35 : 0.9; }
    else if (s === 'jump' || s === 'fall') { o.air = s === 'jump' ? 1 : 2; o.arm = [s === 'jump' ? -0.6 : 0.2, 0.2]; o.wa = c.id === 'surayyo' ? -0.4 : 0.2; o.lean = 1; }
    else if (s === 'atk' || s === 'atk2' || s === 'slam' || s === 'trip' || s === 'jab' || s === 'spin') {
      const k = c.atk || { w: 12, a: 4 }, ph = t < k.w ? t / k.w : t < k.w + k.a ? 1 + (t - k.w) / k.a : 2;
      if (s === 'slam') { const up = Math.min(1, ph); o.arm = ph < 1 ? [-2.3 * up, -0.6] : [0.9, 0.7]; o.wa = ph < 1 ? -2.6 * up : 1.3; o.crouch = ph >= 1 ? 2 : 0; o.lean = ph >= 1 ? 3 : -1; }
      else if (s === 'trip') { o.arm = ph < 1 ? [-0.2, -0.4] : [1.2, 0.5]; o.wa = ph < 1 ? -0.9 : 1.15; o.crouch = ph >= 1 ? 3 : 1; o.lean = 2; }
      else if (s === 'jab') { o.arm = ph < 1 ? [0.2, -0.5] : [0.05, 0.0]; o.wa = ph < 1 ? -0.15 : -0.05; o.lean = ph < 1 ? -1 : 2; c._reach = ph >= 1 ? 6 : 0; }
      else if (s === 'spin') { const a = t * 0.6; o.arm = [0.2, 0]; o.wa = a; o.crouch = 1; }
      else { o.arm = ph < 1 ? [-1.9 * Math.min(1, ph * 1.4), -0.5] : [0.4 + 0.5 * Math.min(1, ph - 1), 0.5]; o.wa = ph < 1 ? -2.4 * Math.min(1, ph * 1.4) : 0.2 + 0.9 * Math.min(1, ph - 1); o.lean = ph < 1 ? -1 : 2; }
    } else if (s === 'cast' || s === 'sing' || s === 'skill' || s === 'pour' || s === 'hook' || s === 'taunt' || s === 'throw') {
      const k = c.atk || { w: 16 }, ph = Math.min(1, t / Math.max(1, k.w));
      if (c.id === 'nargiza') { o.arm = [-0.6 - 0.4 * ph, -0.9]; o.wa = -0.75; o.bob = (t >> 3) & 1 ? -1 : 0; }
      else if (c.id === 'surayyo' && s === 'hook') { o.arm = [-0.2 + 0.3 * ph, -0.3]; o.wa = -0.25 + 0.2 * ph; o.lean = -1; }
      else if (c.id === 'surayyo') { o.arm = [-1.3 * ph, -0.5]; o.wa = -1.9 * ph; o.lean = 1; }
      else if (s === 'throw') { o.arm = ph < 0.7 ? [-2.4, -0.4] : [0.6, 0.3]; o.wa = -2.6; o.lean = ph < 0.7 ? -2 : 2; }
      else { o.arm = [-2.6 * ph, -0.6]; o.wa = -2.8 * ph; o.lean = -1; }
    } else if (s === 'block') { o.arm = [-0.6, -1.4]; o.wa = -1.45; o.crouch = 1; o.lean = 1; }
    else if (s === 'hurt') { o.lean = -3; o.arm = [1.4, 0.6]; o.wa = 1.6; }
    else if (s === 'idle') { o.arm = c.id === 'nargiza' ? [0.6, -0.6] : c.id === 'surayyo' ? [0.25, -0.45] : [0.55, 0.15]; o.wa = c.id === 'nargiza' ? -0.55 : c.id === 'surayyo' ? -1.45 : 1.3; }
    if (c.inCombat && s === 'idle') { o.crouch = 1; if (c.id === 'alp') { o.arm = [-0.1, -0.5]; o.wa = -0.9; } }
    void D;
    return o;
  }
  function drawFigure(ctx, c) {
    const F = rawFigure(c.id), S = F.S, raw = F.f[(c.t >> 5) & 1 && c.anim === 'idle' ? 1 : 0];
    if (!raw) return;
    const o = pose(c);
    const flash = c.flashT > 0 ? Math.min(1, c.flashT / 4) : 0;
    const rot = c.downed ? -Math.PI / 2 : 0;
    A.puppet(ctx, c.x, c.y - (c.downed ? 5 : 0), {
      w: 84, h: 84, ox: 42, oy: 76, flip: c.facing < 0, rot,
      outline: '#140c14', rim: { color: c.def.rim || '#ffe8c0', dx: -1, dy: -1, a: c.id === 'alp' ? 0.62 : 0.34 },   // the grey Hollow needs more light to read against stone
      flash: flash || (c.shieldT > 0 ? 0.25 : 0), flashColor: flash ? '#ffffff' : '#8ff6ef',
      tint: c.st.burn ? { color: '#ff7a2a', a: 0.22 } : c.st.slow ? { color: '#8fb0ff', a: 0.15 } : c.downed ? { color: '#40304a', a: 0.35 } : null, alpha: c.alpha
    }, x => {
      const hem = S.hem, waist = S.waist, crouch = o.crouch, bob = o.bob + crouch;
      // legs (ours): boots step, a dress shows the feet
      const legY = hem + 1;
      if (S.legs === 'dress') {
        const s1 = Math.round(o.step * 3), s2 = -s1;
        if (o.air) { R2(x, -3, -2 - (o.air === 1 ? 2 : 0), 3, 1, '#2a1c18'); R2(x, 1, -3, 3, 1, '#3a2620'); }
        else { R2(x, -3 + s2, -1, 3, 1, '#2a1c18'); R2(x, 1 + s1, -1, 3, 1, '#3a2620'); }
      } else {
        const lh = -legY + 1, kneeA = o.air ? 3 : 0;
        const bl = Math.round(-o.step * 3), fl = Math.round(o.step * 3);
        R2(x, -3 + bl, legY + crouch, 3, Math.max(1, lh - crouch - kneeA), '#33241c'); R2(x, -3 + bl, -1 - kneeA, 4, 1, '#1e140e');
        R2(x, 1 + fl, legY + crouch, 3, Math.max(1, lh - crouch - kneeA), '#4a3426'); R2(x, 1 + fl, -1 - kneeA, 4, 1, '#24180f');
      }
      // the body from the raw figure, cut in bands for lean and bob (feet at 24,66 in the raw canvas)
      const top = -60, rows = legY - top, airK = o.air ? (S.legs === 'dress' ? 0 : 2) : 0;
      for (let y = top; y < legY; y += 3) {
        const k = (legY - y) / Math.max(1, legY - S.fy), sx = Math.round(o.lean * k), h = Math.min(3, legY - y);
        x.drawImage(raw, 24 + y * 0 - 24, 66 + y, 48, h, -24 + sx, y + bob - airK, 48, h);
      }
      void rows;
      // the near arm and the weapon
      const shx = S.sw - 2 + Math.round(o.lean * 0.8), shy = S.sh + 2 + bob - airK;
      const ua = o.arm[0] + Math.PI / 2, la = ua + o.arm[1];
      const L1 = S.type === 'huge' ? 6 : 5, L2 = S.type === 'huge' ? 6 : 5;
      const ex = shx + Math.cos(ua) * L1, ey = shy + Math.sin(ua) * L1, hx = ex + Math.cos(la) * L2, hy = ey + Math.sin(la) * L2;
      const wBack = c.id === 'nargiza' && (c.anim === 'idle' || c.anim === 'run');
      if (!wBack) weapon(x, c.id, hx, hy, o.wa);
      else weapon(x, c.id, -2, waist - 4 + bob, -0.9);
      line(x, shx, shy, ex, ey, S.arm, S.robe);
      line(x, ex, ey, hx, hy, S.arm, S.robeL);
      const hs = S.type === 'huge' ? 3 : 2;
      R2(x, hx - (hs >> 1), hy - (hs >> 1), hs, hs, S.skin);
      // Nargiza's mouth open when singing (a pale dot under the face)
      if (c.id === 'nargiza' && (c.anim === 'cast' || c.anim === 'sing' || c.anim === 'skill') && (c.animT >> 2) & 1) R2(x, 3 + Math.round(o.lean), S.fy + 7 + bob, 1, 1, '#5a2a2a');
    });
  }

  /* ================================================================ water puddles and sound waves */
  class Puddle extends G.Entity {
    constructor(x, y, w, life, owner) { super(x, y, w, 6); this.life = this.max = life; this.owner = owner; this.layer = 1; this.kind = 'puddle'; this.seed = Math.random() * 100; this.big = w > 90; }
    update() {
      this.t++;
      if (--this.life <= 0) { this.dead = true; return; }
      if (this.t % 8) return;
      const box = { x: this.x - this.w / 2, y: this.y - 14, w: this.w, h: 18 };
      const slowT = PARTY.node('surayyo', 'puddle') ? 70 : 40;
      for (const e of G.world.enemies) {
        if (e.dead || e.isBossPart || !U.overlap(box, e.box())) continue;
        if (!e.isBoss) e.addStatus('slow', { t: slowT });
        e._wetT = fr() + 30;
        if (PARTY.node('surayyo', 'current') && !e.isBoss) { const p = pl(); if (p) e.vx += sgn(e.x - p.x) * 0.6; }
      }
      const p = pl();
      for (const a of [p, ...PX.actors()]) if (a && a.st && a.st.burn && U.overlap(box, a.box())) { a.st.burn = null; G.FX.burst(a.x, a.cy, 6, { speed: 1, life: 30, size: 2, colors: ['#a8a4a0', '#6a6660'], grav: -0.05 }); }
    }
    draw(ctx) {
      if (!G.onScreen(this.x, this.y, this.w)) return;
      const k = Math.min(1, this.life / 30, this.t / 8), w = Math.round(this.w * (0.6 + 0.4 * Math.min(1, this.t / 10)));
      const x0 = Math.round(this.x - w / 2), y = Math.round(this.y);
      ctx.globalAlpha = 0.85 * k;
      ctx.fillStyle = '#163c60'; ctx.fillRect(x0 + 3, y - 3, w - 6, 3); ctx.fillRect(x0, y - 1, w, 1);
      ctx.fillStyle = '#3f86b8'; ctx.fillRect(x0 + 4, y - 3, w - 8, 1); ctx.fillStyle = '#2a5f8e'; ctx.fillRect(x0 + 2, y - 2, w - 4, 1);
      ctx.fillStyle = '#bfe8ff';
      for (let i = 0; i < w; i += 7) { const s = Math.sin(this.t * 0.12 + i * 0.7 + this.seed); if (s > 0.6) ctx.fillRect(x0 + i, y - 2, 2, 1); }
      ctx.globalAlpha = 1;
    }
    drawFx() { if (this.t % 6 === 0 && G.onScreen(this.x, this.y)) G.Glow.add(this.x, this.y - 2, this.w * 0.5, '#5fb8ff', 0.12); }
    has(e) { return Math.abs(e.x - this.x) < this.w / 2 + 2 && Math.abs(e.y - this.y) < 14; }
  }
  PX.Puddle = Puddle;
  PX.BOSS_K = 0.13;
  PX.rawFigure = rawFigure; PX.drawFigure = drawFigure;
  const puddles = () => G.world.ents.filter(e => e instanceof Puddle && !e.dead);
  const wetPuddle = e => puddles().find(p => p.has(e)) || null;
  function pour(c, x, w, life) {
    const gy = G.level.groundBelow ? G.level.groundBelow(x, c.y - 8, 90) : null;
    const y = gy == null ? c.y : gy;
    const p = new Puddle(x, y, w, life, c); G.world.add(p);
    G.FX.burst(x, y - 4, 16, { speed: 2.6, life: 26, size: 2, colors: ['#bfe8ff', '#5fb8ff', '#2a6aa0'], grav: 0.2, angle: -Math.PI / 2, spread: 1.6 });
    sfx('ice', { x, pitch: 0.6 });
    if (PARTY.node('surayyo', 'douse')) for (const a of [pl(), ...PX.actors()]) if (a && a.st && a.st.burn) a.st.burn = null;
    return p;
  }
  // the song finds water: everyone standing in the same puddle takes it too
  function songHit(c, e, k, o) {
    const pud = wetPuddle(e);
    let mul = 1;
    if (pud) mul = PARTY.node('nargiza', 'reson') ? 2 : 1.5;
    if (pud && PARTY.node('surayyo', 'conduct') && PARTY.has('surayyo')) mul *= 1.5;
    const ok = PX.deal(c, e, k * mul, o);
    if (PARTY.node('nargiza', 'weak')) e._weakT = fr() + 240;
    if (pud && !pud._zap) {
      pud._zap = fr();
      for (const e2 of G.world.enemies) if (e2 !== e && !e2.dead && !e2.isBossPart && pud.has(e2)) { PX.deal(c, e2, k * mul * 0.6, Object.assign({}, o, { stun: o && o.stun ? Math.round(o.stun * 0.6) : 0 })); zap(e.x, e.y - 2, e2.x, e2.y - 2); }
      zap(pud.x - pud.w / 2, pud.y - 2, pud.x + pud.w / 2, pud.y - 2);
      setTimeout(() => { pud._zap = 0; }, 0);
      PX.combo = (PX.combo || 0) + 1;
    }
    return ok;
  }
  function zap(x0, y0, x1, y1) {
    const n = Math.max(2, Math.round(Math.abs(x1 - x0) / 8));
    for (let i = 0; i <= n; i++) G.FX.spawn({ x: x0 + (x1 - x0) * i / n, y: y0 + (y1 - y0) * i / n + rnd(-2, 2), life: 16, size: 2, size1: 0, color: '#bff8ff', glow: true });
    G.FX.ring((x0 + x1) / 2, (y0 + y1) / 2, 4, 26, '#8ff6ef', 14, { width: 1 });
  }
  class Wave extends G.Entity {
    constructor(c, tg, k, o) { super(c.x + c.facing * 8, c.y - 15, 10, 10); this.c = c; this.k = k; this.o = o || {}; const a = Math.atan2(tg.cy - this.y, tg.x - this.x); this.vx = Math.cos(a) * 3.4; this.vy = Math.sin(a) * 3.4; this.life = 70; this.layer = 3; this.hitSet = new Set(); }
    update() {
      this.t++; this.x += this.vx; this.y += this.vy;
      if (--this.life <= 0 || G.level.solidPx(this.x, this.y)) { this.burst(); return; }
      const b = { x: this.x - 6, y: this.y - 7, w: 12, h: 14 };
      for (const e of G.world.enemies) {
        if (e.dead || e.untargetable || e.isBossPart || this.hitSet.has(e) || !U.overlap(b, e.box())) continue;
        this.hitSet.add(e);
        songHit(this.c, e, this.k, this.o);
        if (PARTY.node('nargiza', 'interrupt') && e.teleT > 0 && !e.isBoss) { e.teleT = 0; e.atkCD = Math.max(e.atkCD, 50); e.setState && e.state !== 'idle' && e.setState('chase'); }
        this.burst(); return;
      }
    }
    burst() {
      if (this.dead) return; this.dead = true;
      G.FX.ring(this.x, this.y, 3, 22, '#8ff6ef', 14, { width: 1 });
      if (PARTY.node('nargiza', 'burst')) for (const e of enemiesNear(this.x, this.y, 34)) if (!this.hitSet.has(e)) songHit(this.c, e, this.k * 0.5, {});
    }
    draw() { }
    drawFx(ctx) {
      const a = Math.atan2(this.vy, this.vx);
      ctx.save(); ctx.translate(Math.round(this.x), Math.round(this.y)); ctx.rotate(a);
      ctx.strokeStyle = '#8ff6ef'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) { ctx.globalAlpha = 0.9 - i * 0.25; ctx.beginPath(); ctx.arc(-i * 4, 0, 4 + i * 1.5 + (this.t % 6) * 0.3, -0.9, 0.9); ctx.stroke(); }
      ctx.restore(); ctx.globalAlpha = 1;
      G.Glow.add(this.x, this.y, 16, '#8ff6ef', 0.5);
    }
  }
  class Surge extends G.Entity {   // the sluice: a wall of water running out along the floor
    constructor(x, y, dir, range) { super(x, y, 8, 14); this.dir = dir; this.range = range; this.d = 0; this.layer = 3; }
    update() { this.t++; this.d += 4.2 - this.t * 0.04; if (this.d >= this.range || this.t > 50) this.dead = true; if (this.t % 2 === 0) G.FX.spawn({ x: this.x + this.dir * this.d, y: this.y - 4 - Math.random() * 8, vx: this.dir * 1.5, vy: -1.5 - Math.random(), grav: 0.2, life: 18, size: 2, size1: 0, color: Math.random() < 0.5 ? '#bfe8ff' : '#5fb8ff' }); }
    draw(ctx) {
      const k = 1 - this.d / this.range, h = Math.round(4 + 10 * k), x = Math.round(this.x + this.dir * this.d), y = Math.round(this.y);
      for (let i = 0; i < 18; i++) { const xx = x - this.dir * i * 2, hh = Math.max(1, Math.round(h * (1 - i / 18) + Math.sin(this.t * 0.5 + i) * 1.2)); ctx.fillStyle = i < 3 ? '#d8f4ff' : i % 3 ? '#3f86b8' : '#5fb8ff'; ctx.fillRect(xx, y - hh, 2, hh); }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - h, 2, 2);
    }
    drawFx() { G.Glow.add(this.x + this.dir * this.d, this.y - 6, 22, '#5fb8ff', 0.35); }
  }
  class Stone extends G.Entity {   // Surayyo's neighbours ("Our people")
    constructor(e) { const p = pl(); const s = Math.random() < 0.5 ? -1 : 1; super(p.x + s * 230, p.y - 120, 4, 4); this.tg = e; this.vx = (e.x - this.x) / 46; this.vy = -1.6; this.layer = 3; }
    update() { this.t++; this.vy += 0.12; this.x += this.vx; this.y += this.vy; const e = this.tg; if (e && !e.dead && Math.abs(e.x - this.x) < 10 && Math.abs(e.cy - this.y) < 14) { const c = PARTY.actor('surayyo'); if (c) PX.deal(c, e, 0.5, { kbx: 1, stun: 12 }); this.dead = true; G.FX.debris(this.x, this.y, 6, sgn(this.vx), ['#8a8378', '#4d4740']); } if (this.t > 120) this.dead = true; }
    draw(ctx) { ctx.fillStyle = '#6a6458'; ctx.fillRect(Math.round(this.x) - 1, Math.round(this.y) - 1, 3, 3); ctx.fillStyle = '#9a9488'; ctx.fillRect(Math.round(this.x) - 1, Math.round(this.y) - 1, 1, 1); }
  }

  // the boss kit's floor dangers this frame (pools, pillars, marked ground; shockwaves are hopped instead)
  let hzAt = -1, hz = [];
  function hazards() {
    const w = G.world; if (!w) return hz;
    if (hzAt === w.t) return hz;
    hzAt = w.t; hz = [];
    const BK = G.BossKit; if (!BK || !PX.list.length) return hz;
    for (const h of w.ents) {
      if (h.dead) continue;
      if (BK.Marker && h instanceof BK.Marker) { hz.push(h); continue; }
      if (BK.Hazard && h instanceof BK.Hazard && !(BK.Shockwave && h instanceof BK.Shockwave) && h.faction !== 'player' && h.faction !== 'ally' && h.dmg > 0) hz.push(h);
    }
    return hz;
  }
  const hazardAt = (x, y) => { for (const h of hazards()) if (Math.abs(h.y - y) < 34 && Math.abs(x - h.x) < (h.w || 24) / 2 + 2) return h; return null; };
  PX.hazards = hazards;

  /* ================================================================ the companion */
  class Comp extends G.Actor {
    constructor(id, x, y) {
      const D = DEF[id];
      super(x, y, D.w, D.h);
      this.id = id; this.def = D; this.faction = 'ally'; this.kind = 'ally'; this.layer = 4;
      this.grav = GRAV; this.maxFall = 7.4; this.facing = 1;
      this.state = 'follow'; this.stateT = 0; this.anim = 'idle'; this.animT = 0; this.runPh = 0;
      this.atkCD = 30; this.skillCD = 0; this.cds = { a: 0, b: 0, c: 0, d: 0, heal: 120 };
      this.lastN = 0; this.stuckT = 0; this.offT = 0; this.prog = { t: 0, d: 1e9 };
      this.downed = false; this.downT = 0; this.rev = 0; this.alpha = 1; this.shieldT = 0;
      this.poise = D.poise; this.kbResist = this.id === 'alp' ? 0.6 : 0.15;
      this.bloodColor = '#3a0d1c';
      this.refresh(true);
    }
    get m() { return PX.M(this.id); }
    get stance() { return this.m.stance; }
    refresh(init) {
      const lvl = G.CH && G.CH.ready && G.run ? G.CH.level() : 1, g = PX.gearMods(this.id);
      let hp = (64 + 12 * G.BAL.eff(5 + Math.floor((lvl - 1) / 3)) + 9 * (lvl - 1)) * this.def.hpK * g.hp;   // their endurance grows like the hero's
      if (PARTY.node(this.id, 'k_hollow')) hp *= 1.3;
      const was = this.maxHp || 1, f = init ? this.m.hpF : this.hp / was;
      this.maxHp = Math.round(hp); this.hp = Math.max(1, Math.round(this.maxHp * clamp(f, 0, 1)));
      this.gear = g;
    }
    // damage per hit: the hero's damage per second × share × attack period, gear and nodes
    hitDmg() {
      const D = this.def;
      let v = PX.heroDps() * D.share * (D.eff || 1) * (D.period / 60) * PX.CAL * this.gear.dmg;
      if (this.id === 'alp') {
        if (PARTY.node('alp', 'rage')) v *= 1 + 0.4 * (1 - this.hp / this.maxHp);
        if (PARTY.node('alp', 'forget') && !this.m.flags.memory) v *= 1.15;
        if (this._painT > fr()) { v *= 1.5; this._painT = 0; }
      }
      if (PARTY.node('nargiza', 'wave') && this.id === 'nargiza') v *= 1.25;
      if (this.id === 'surayyo' && PARTY.node('surayyo', 'ours') && /tail/.test(String((G.Game.stage && G.Game.stage.plan && G.Game.stage.plan.biome) || ''))) v *= 1.1;
      return v;
    }
    box() { return this.downed ? { x: this.x - this.h / 2, y: this.y - 8, w: this.h, h: 8 } : { x: this.x - this.w / 2, y: this.y - this.h, w: this.w, h: this.h }; }
    setState(s) { this.state = s; this.stateT = 0; }
    setAnim(a) { if (this.anim !== a) { this.anim = a; this.animT = 0; } }

    /* ------------------------------------------------ being hit */
    takeHit(e) {
      if (this.dead || this.downed || this.gone || this.invulnT > 0 || (this.untargetable && e.type !== 'cover')) return false;
      this.climbing = null;
      let d = e.dmg || 0;
      if (!e.raw) {
        d *= 1 - Math.max(this.def.armor, this.gear.armor);
        if (this.id === 'alp') {
          const src = e.src;
          if (this.state === 'block' && (!src || sgn(src.x - this.x) === this.facing)) { d *= 0.3; G.FX.sparks(this.x + this.facing * 6, this.cy - 4, 4, -this.facing, { color: '#ffffff', color2: '#c8c8d0' }); sfx('shield_block', { x: this.x }); e = Object.assign({}, e, { noFlinch: true, kbx: 0.3 }); }
          if (PARTY.node('alp', 'stand') && (this.state === 'block' || Math.abs(this.vx) < 0.3)) d *= 0.8;
          if (PARTY.node('alp', 'k_hollow')) d *= 0.85;
          if (this.wallT > fr()) { d *= 0.2; e = Object.assign({}, e, { noFlinch: true, kbx: 0 }); }
        }
        if (PARTY.node('surayyo', 'k_tail') && PX.up('surayyo')) d *= 0.8;
        const alp = PARTY.actor('alp');
        if (alp && alp !== this && !alp.downed && PARTY.node('alp', 'shelter') && e.src && Math.abs(alp.x - this.x) < 44 && sgn(e.src.x - alp.x) === sgn(alp.x - this.x)) d *= 0.85;
        if (this._ward > 0) { const a = Math.min(this._ward, d); this._ward -= a; d -= a; }
      }
      if (d <= 0) return false;
      if (e.status) for (const k in e.status) {
        if (this.id === 'alp' && PARTY.node('alp', 'immune') && (k === 'stun' || k === 'slow' || k === 'freeze')) continue;
        this.addStatus(k, e.status[k]);
      }
      d = Math.max(1, Math.round(d));
      // Surayyo's stubbornness: the first deadly blow in a land does not bring her down
      if (this.hp - d <= 0 && this.id === 'surayyo' && PARTY.node('surayyo', 'stubborn') && !PX.land.stubborn) { PX.land.stubborn = 1; d = this.hp - 1; G.FX.text(this.x, this.top - 10, t(`Not today!|Не сегодня!|Bugun emas!`), '#e8c070', { size: 7 }); }
      this.hp -= d; this.flashT = 7; this.invulnT = 10;
      PARTY.stats.taken[this.id] = (PARTY.stats.taken[this.id] || 0) + d;
      G.FX.dmg(this.x, this.top - 2, d, false, '#ffb0a0');
      if (!e.noFlinch && Math.random() >= this.poise && this.state !== 'skill') {
        this.vx += (e.kbx || 2) * (1 - this.kbResist) * (e.dir || sgn(this.x - (e.src ? e.src.x : this.x)) || 1); if (e.kby) this.vy = Math.min(this.vy, e.kby * (1 - this.kbResist));
        this.setState('hurt');
      }
      if (e.stun && !(this.id === 'alp' && PARTY.node('alp', 'immune'))) this.addStatus('stun', { t: e.stun });
      // Alp feels it
      const alp = PARTY.actor('alp');
      if (alp && alp !== this && PARTY.node('alp', 'pain') && Math.abs(alp.x - this.x) < 120) alp._painT = fr() + 600;
      if (this.hp <= 0) this.fall();
      return true;
    }
    die() { if (!this.downed) { this.hp = 0; this.fall(); } }
    fall() {
      if (this.downed) return;
      this.downed = true; this.hp = 0; this.downT = 1800; this.rev = 0; this.untargetable = true; this.setState('downed'); this.setAnim('downed');
      for (const k in this.st) this.st[k] = null;
      G.FX.burst(this.x, this.cy, 12, { speed: 2, life: 30, size: 2, colors: ['#3a0d1c', '#5a1424'], grav: 0.2 });
      G.shake(0.2); sfx('player_hurt', { x: this.x, pitch: this.id === 'alp' ? 0.7 : 1.2 });
      toast(tf(PX.gen(this.id, `{who} is down! Hold [F] next to him.|{who} упал! Держи [F] рядом, чтобы поднять.|{who} yiqildi! Yonida [F] ni bosib tur.`, `{who} is down! Hold [F] next to her.|{who} упала! Держи [F] рядом, чтобы поднять.|{who} yiqildi! Yonida [F] ni bosib tur.`), { who: PX.nameOf(this.id) }), '#ff8a7a');
      PX.emit('downed', this.id); PX.downs = (PX.downs || 0) + 1;
      // Alp's "Getting up": once per land
      if (this.id === 'alp' && PARTY.node('alp', 'rise') && !PX.land.rise) { PX.land.rise = 1; this.selfRise = 180; }
    }
    revive(by) {
      if (!this.downed) return;
      const sh = PARTY.node('surayyo', 'shoulder') && PX.up('surayyo');
      this.downed = false; this.untargetable = this.stance === 'silent'; this.hp = Math.round(this.maxHp * (sh ? 0.5 : 0.35)); this.rev = 0; this.invulnT = 90; this.setState('follow'); this.setAnim('idle');
      G.FX.ring(this.x, this.cy, 4, 34, '#9cf0a0', 18, { width: 2 }); sfx('heal', { x: this.x });
      toast(tf(PX.gen(this.id, `{who} is back on his feet.|{who} снова на ногах.|{who} yana oyoqda.`, `{who} is back on her feet.|{who} снова на ногах.|{who} yana oyoqda.`), { who: PX.nameOf(this.id) }), '#9cf0a0');
      PX.emit('revived', this.id, by || 'hero');
    }
    goOut() {
      this.m.out = true; this.m.hpF = 0; save();
      toast(tf(PX.gen(this.id, `{who} is out until you rest.|{who} выбыл до привала.|{who} dam olguncha safdan chiqdi.`, `{who} is out until you rest.|{who} выбыла до привала.|{who} dam olguncha safdan chiqdi.`), { who: PX.nameOf(this.id) }), '#d9a0a0');
      PX.emit('out', this.id);
      this.gone = true; this.dead = true;
      G.FX.wisps(this.x, this.cy, 10, 'violet');
    }

    /* ------------------------------------------------ per frame */
    update() {
      this.t++; this.stateT++; this.animT++;
      if (this.flashT > 0) this.flashT--; if (this.invulnT > 0) this.invulnT--; if (this.shieldT > 0) this.shieldT--;
      for (const k in this.cds) if (this.cds[k] > 0) this.cds[k]--;
      if (this.skillCD > 0) this.skillCD--;
      if (this.atkCD > 0) this.atkCD--;
      if (this.gone) return;
      this.tickStatus();
      const p = pl();
      if (!p) return;
      if (this.downed) {
        this.vx *= 0.85; G.Phys.step(this);
        if (this.selfRise > 0 && --this.selfRise <= 0) { this.revive('self'); return; }
        if (--this.downT <= 0) this.goOut();
        return;
      }
      if (this.t % 30 === 0) this.m.hpF = this.hp / this.maxHp;
      this.untargetable = this.stance === 'silent';
      if (this.st.stun || this.st.freeze) { this.vx *= 0.8; G.Phys.step(this); this.setAnim('hurt'); return; }
      if (this.state === 'hurt') { this.vx *= 0.88; G.Phys.step(this); this.setAnim('hurt'); if (this.stateT > 14) this.setState('follow'); return; }
      if (p.dead) { this.vx *= 0.8; G.Phys.step(this); this.setAnim('idle'); return; }
      if (this.zipF) { this.zipStep(); return; }
      if (this.climbing) { this.climbStep(); this.watch(p); return; }
      if (!this.dodge(p)) this.brain(p);
      const spd = this.st.slow ? 0.5 : 1;
      if (this.st.slow) this.vx *= 0.9;
      G.Phys.step(this);
      this.watch(p);
      // animation from motion
      if (!this.busy()) {
        if (!this.onGround) this.setAnim(this.vy < 0 ? 'jump' : 'fall');
        else if (Math.abs(this.vx) > 0.3) { this.setAnim('run'); this.runPh += Math.abs(this.vx) * 0.22; const st = Math.floor(this.runPh / Math.PI); if (st !== this._st) { this._st = st; if (G.onScreen(this.x, this.y) && st % 2) G.FX.dust(this.x - 2 * this.facing, this.y, 1, 0.3); } }
        else this.setAnim('idle');
      }
      void spd;
    }
    // boss-kit danger on the floor: step out of pools, pillars and marked ground, hop over shockwaves
    dodge(p) {
      if (this.dodgeT > 0) {
        this.dodgeT--;
        this.walk(this.dodgeDir, this.def.speed * 1.35);
        if (this.dodgeT === 0) this.facing = sgn(p.x - this.x) || this.facing;
        return true;
      }
      // a boss's telegraphed blow (G.BM threats, 65a): they read the wind-up like the hero does — and miss a quarter of them
      if (this.onGround && G.Game.boss && G.BM && G.BM.live) {
        const now = G.BM.now(), mb = this.box();
        for (const th of G.BM.live()) {
          const seen = th._cs || (th._cs = {});
          if (seen[this.id]) continue;
          const bx = typeof th.box === 'function' ? th.box() : th.box; if (!bx) continue;
          let left = th.at - now, hit;
          if (th.wave) { const dd = (this.x - th.wave.x0) * th.wave.dir; if (dd < -8) continue; left = th.wave.t0 + Math.round((dd - 14) / th.wave.spd) - now; hit = true; }
          else hit = mb.x - 6 < bx.x + bx.w && mb.x + mb.w + 6 > bx.x && mb.y - 6 < bx.y + bx.h && mb.y + mb.h + 6 > bx.y;
          if (!hit || left > 10 || left < -1) continue;
          seen[this.id] = 1;
          if (Math.random() > (this.def.dodgeK || 0.75)) continue;
          if (th.how === 'jump' || th.wave) this.hop(34, 0, this.vx);
          else { const cx = bx.x + bx.w / 2; this.dodgeDir = sgn(this.x - cx) || -this.facing; this.dodgeT = 20; this.invulnT = Math.max(this.invulnT || 0, 12); }
          PX.dodges = (PX.dodges || 0) + 1; PX.tdodges = (PX.tdodges || 0) + 1;
          return true;
        }
      }
      if (this.t % 4 || !this.onGround || this.stance === 'silent' && !G.Game.boss) return false;
      const BK = G.BossKit; if (!BK) return false;
      const b = this.box(), x0 = b.x - 4, x1 = b.x + b.w + 4;
      for (const h of G.world.ents) {
        if (h.dead || h === this) continue;
        const mark = BK.Marker && h instanceof BK.Marker;
        if (!mark && (!((BK.Hazard && h instanceof BK.Hazard) || h.kind === 'hazard') || h.faction === 'player' || h.faction === 'ally' || !(h.dmg > 0))) continue;   // (pools may carry their own kind: 'spirit')
        if (Math.abs(h.y - this.y) > 34) continue;
        if (BK.Shockwave && h instanceof BK.Shockwave) {
          const d = (this.x - h.x) * (h.dir || 1);
          if (d > 0 && d < 30 + (h.spd || 3) * 6) { this.hop(30, 0, this.vx); PX.dodges = (PX.dodges || 0) + 1; }
          continue;
        }
        const hw = (h.w || 24) / 2, hx0 = h.x - hw, hx1 = h.x + hw;
        if (x1 < hx0 || x0 > hx1) continue;
        // out the nearer side, towards the hero when it is a tie
        const toL = this.x - hx0, toR = hx1 - this.x;
        const dir = Math.abs(toL - toR) < 10 ? (sgn(p.x - this.x) || 1) : toL < toR ? -1 : 1;
        if (this.busy() && this.state !== 'skill') this.setState('follow');
        this.dodgeDir = dir; this.dodgeT = Math.min(40, Math.ceil(((dir < 0 ? toL : toR) + this.w) / (this.def.speed * 1.2)) + 4);
        PX.dodges = (PX.dodges || 0) + 1;
        return true;
      }
      return false;
    }
    busy() { return ['atk', 'atk2', 'slam', 'trip', 'jab', 'spin', 'cast', 'sing', 'skill', 'pour', 'hook', 'taunt', 'block', 'throw', 'ram'].includes(this.state); }
    draw(ctx) { if (this.gone || !G.onScreen(this.x, this.y, 70)) return; drawFigure(ctx, this); }
    drawFx(ctx) {
      if (this.gone) return;
      if (this.state === 'hook' && this.atk && this.atk.tg && this.stateT >= this.atk.w && this.stateT < this.atk.w + this.atk.a) {
        const tg = this.atk.tg, k = Math.min(1, (this.stateT - this.atk.w + 1) / 4), hx = this.x + this.facing * 8, hy = this.top + 8;
        const ex = hx + (tg.x - hx) * k, ey = hy + (tg.cy - hy) * k;
        ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(Math.round(hx) + 0.5, Math.round(hy) + 0.5); ctx.lineTo(Math.round(ex) + 0.5, Math.round(ey) + 0.5); ctx.stroke();
        ctx.fillStyle = '#c8d0d8'; ctx.fillRect(Math.round(ex) - 1, Math.round(ey) - 2, 3, 3); G.Glow.add(ex, ey, 10, '#c8d0d8', 0.4);
      }
      if (this.downed) {
        const k = this.rev / 120, y = this.y - 22, x = this.x;
        ctx.globalAlpha = 0.85; ctx.fillStyle = '#120c14'; ctx.fillRect(Math.round(x) - 11, Math.round(y) - 1, 22, 4);
        ctx.fillStyle = '#5a1424'; ctx.fillRect(Math.round(x) - 10, Math.round(y), 20, 2);
        ctx.fillStyle = (G.frame >> 3) & 1 && this.downT < 600 ? '#ffffff' : '#e8434f'; ctx.fillRect(Math.round(x) - 10, Math.round(y), Math.round(20 * this.downT / 1800), 2);
        if (k > 0) { ctx.strokeStyle = '#9cf0a0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(Math.round(x), Math.round(y) - 9, 6, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); ctx.stroke(); }
        ctx.globalAlpha = 1;
        G.Glow.add(x, this.y - 6, 24, '#ff5050', 0.25 + 0.15 * Math.sin(G.frame * 0.15));
      } else {
        if (this.shieldT > 0 || this._ward > 0) G.Glow.add(this.x, this.cy, 18, '#8ff6ef', 0.35);
        if (this.wallT > fr()) { ctx.fillStyle = 'rgba(232,220,200,0.35)'; ctx.fillRect(Math.round(this.x + this.facing * 10) - 1, Math.round(this.y) - 36, 3, 36); }
        G.Light.add(this.x, this.y - 16, 56, this.def.col, 0.12);
      }
    }

    /* ------------------------------------------------ moving: follow the hero's trail */
    walk(dir, spd) {
      const s = (spd || this.def.speed) * (this.st.slow ? 0.55 : 1);
      this.facing = dir || this.facing;
      // never walk into a boss's pool or marked ground (stepping out of one is the dodge's job)
      if (dir && this.onGround && !(this.dodgeT > 0) && hazardAt(this.x + dir * (this.w / 2 + 5), this.y) && !hazardAt(this.x, this.y)) { this.stop(); return; }
      this.vx = U.approach(this.vx, dir * s, this.onGround ? 0.35 : 0.2);
      if (this.onGround && dir && this.wallAhead(dir)) this.hop(this.wallH(dir) + 6, dir);
    }
    stop() { this.vx = U.approach(this.vx, 0, 0.4); }
    // a ladder column within a tile of the feet: going up, a ladder at the chest; going down, one under the feet
    ladderNear(dir) {
      const L = G.level, LD = G.T.LADDER, ty = Math.floor((dir < 0 ? this.y - 10 : this.y + 4) / TS);
      for (const d of [0, -1, 1]) { const tx = Math.floor(this.x / TS) + d; if (L.get(tx, ty) === LD) return tx * TS + TS / 2; }
      return null;
    }
    // the hero's hook line (W2.zip): the companions go up the same rope, one after another
    zipStep() {
      const z = this.zipF;
      if (z.delay > 0) { z.delay--; this.vx *= 0.8; G.Phys.step(this); return; }
      const q = z.pts[z.i], dx = q.x - this.x, dy = q.y - this.y, d = Math.hypot(dx, dy);
      if (d <= z.speed) { this.x = q.x; this.y = q.y; z.i++; } else { this.x += dx / d * z.speed; this.y += dy / d * z.speed; if (Math.abs(dx) > 1) this.facing = sgn(dx); }
      this.vx = 0; this.vy = 0; this.onGround = false; this.setAnim('jump');
      if (z.i >= z.pts.length) { this.zipF = null; this.vy = -1.5; this.stuckT = 0; this.offT = 0; this.lastN = seq; }
    }
    climbStep() {
      const c = this.climbing, L = G.level, LD = G.T.LADDER;
      c.t++;
      this.x += (c.x - this.x) * 0.5; this.vx = 0; this.vy = 0; this.onGround = false;
      this.y += c.dir * 1.9;
      this.setAnim('jump');
      const chest = L.get(Math.floor(this.x / TS), Math.floor((this.y - 10) / TS)), feet = L.get(Math.floor(this.x / TS), Math.floor((this.y + 2) / TS));
      if (c.dir < 0 && (chest !== LD && feet !== LD || this.y <= c.ty - 2)) { this.climbing = null; this.vy = -3.2; this.vx = c.side * 1.6; }   // over the top: step off
      else if (c.dir > 0 && (L.solidPx(this.x, this.y + 1) || feet !== LD && chest !== LD)) { this.climbing = null; }
      if (c.t > 600) this.climbing = null;
    }
    wallAhead(d) { const x = this.x + d * (this.w / 2 + 2); return G.level.solidPx(x, this.y - 4) || G.level.solidPx(x, this.y - this.h + 3); }
    wallH(d) { const x = this.x + d * (this.w / 2 + 3); let h = 0; while (h < 120 && G.level.solidPx(x, this.y - 2 - h)) h += 4; return h; }
    edgeAhead(d) { return G.level.groundBelow(this.x + d * (this.w / 2 + 4), this.y + 1, 40) === null; }
    hop(h, dir, vx) {
      if (!this.onGround) return;
      h = clamp(h, 12, 125);
      this.vy = -Math.sqrt(2 * GRAV * (h + 4)) * (this.def.jump || 1) * 0.98;
      if (vx !== undefined) this.vx = vx; else if (dir) this.vx = dir * Math.max(Math.abs(this.vx), this.def.speed);
      this.onGround = false;
      if (G.onScreen(this.x, this.y)) G.FX.dust(this.x, this.y, 3, 0.6);
    }
    // go to a point on the hero's path (x, y = feet)
    goTo(tx, ty, spd, near) {
      const dx = tx - this.x, dy = ty - this.y, ad = Math.abs(dx);
      near = near === undefined ? 6 : near;
      if (!this.onGround) { if (ad > 3) this.vx = U.approach(this.vx, sgn(dx) * (spd || this.def.speed) * 1.1, 0.25); return false; }
      if (Math.abs(dy) > 14 && ad < 70) {      // a karez ladder: climb it (it used to wait for the teleport)
        const lx = this.ladderNear(dy < 0 ? -1 : 1);
        if (lx !== null) { this.climbing = { x: lx, dir: dy < 0 ? -1 : 1, ty, side: sgn(dx) || this.facing, t: 0 }; PX.climbs = (PX.climbs || 0) + 1; return false; }
      }
      if (dy < -14 && ad < 80) {               // up: a measured jump
        const h = -dy + 6, vy = Math.sqrt(2 * GRAV * (h + 4)), tUp = vy / GRAV, tf = tUp + Math.sqrt(2 * Math.max(1, 6) / GRAV);
        if (this.cds.d <= 0) { this.cds.d = 24; this.hop(h, sgn(dx), clamp(dx / tf, -3.2, 3.2)); }
        else this.stop();
        return false;
      }
      if (dy > 14 && ad < 14 && this.onPlat) { this.dropT = 14; this.onGround = false; return false; }
      if (ad <= near) { this.stop(); return Math.abs(dy) < 16; }
      const dir = sgn(dx);
      // a gap to jump: the ground ahead is missing but the target is level or above
      if (this.edgeAhead(dir) && dy < 30 && ad > 18) { this.hop(Math.max(18, -dy + 14), dir, dir * Math.min(3.2, this.def.speed * 1.5)); return false; }
      this.walk(dir, spd);
      return false;
    }
    follow(p, slotD) {
      let want = p.x - p.facing * slotD;
      // a narrow roof or a ledge: no floor at the slot — stand by the hero instead of walking off the edge
      if (p.onGround && G.level.groundBelow(want, p.y - 4, 24) === null) { want = p.x; for (const k of [0.5, -0.5, -1]) { const w2 = p.x - p.facing * slotD * k; if (G.level.groundBelow(w2, p.y - 4, 24) !== null) { want = w2; break; } } }
      const far = Math.abs(p.x - this.x) > 50 || Math.abs(p.y - this.y) > 40;
      this.runSpd = far ? Math.max(this.def.speed * 1.35, 2.3) : this.def.speed;
      // direct: the same floor, nothing in between
      if (Math.abs(p.y - this.y) < 10 && p.onGround && this.onGround && this.clearTo(want)) { this.lastN = seq; return this.goTo(want, p.y, this.runSpd, 8); }
      // the trail: the first crumb after the last one reached, skipping to the farthest one in plain reach
      let c = null;
      for (let i = 0; i < trail.length; i++) if (trail[i].n > this.lastN) { c = trail[i]; break; }
      if (!c) return this.goTo(want, p.y);
      if (Math.abs(c.x - this.x) < 9 && Math.abs(c.y - this.y) < 14) { this.lastN = c.n; return false; }
      const i0 = trail.indexOf(c);
      for (let i = Math.min(trail.length - 1, i0 + 10); i > i0; i--) { const q = trail[i]; if (Math.abs(q.y - this.y) < 4 && this.onGround && this.clearTo(q.x)) { this.lastN = trail[i - 1].n; c = q; break; } }
      return this.goTo(c.x, c.y, this.runSpd, 4);
    }
    clearTo(x) {
      const d = sgn(x - this.x), n = Math.ceil(Math.abs(x - this.x) / 8);
      for (let i = 1; i <= n; i++) { const xx = this.x + d * i * 8; if (G.level.solidPx(xx, this.y - 6) || G.level.solidPx(xx, this.y - this.h + 3)) return false; if (G.level.groundBelow(xx, this.y + 1, 18) === null) return false; }
      return true;
    }
    // stuck or off-screen for 3 s: catch up with the hero
    watch(p) {
      const d = Math.hypot(p.x - this.x, p.y - this.y);
      if (this.t % 30 === 0) {
        // stuck = wants to reach the hero but has not moved (running behind a running hero is not stuck)
        const moved = Math.hypot(this.x - (this.prog.x || 0), this.y - (this.prog.y || 0));
        if (d > 70 && moved < 10 && (!this.inCombat || d > 200)) this.stuckT += 30; else this.stuckT = Math.max(0, this.stuckT - 30);
        this.prog.d = d; this.prog.x = this.x; this.prog.y = this.y;
      }
      if (!G.onScreen(this.x, this.y, 4) || d > 340) this.offT++; else this.offT = 0;
      const why = this.y > G.level.ph + 30 ? 'fall' : this.catchUp ? 'hero' : this.stuckT >= 180 && this.state !== 'skill' ? 'stuck' : this.offT > 180 ? 'off' : null;
      if (why) { const W = PX.tpWhy || (PX.tpWhy = {}); W[why] = (W[why] || 0) + 1; this.teleport(p); }
    }
    teleport(p) {
      this.catchUp = 0; this.stuckT = 0; this.offT = 0; this.prog.d = 1e9;
      if (!p.onGround && trail.length === 0) { this.catchUp = 1; return; }      // wait for him to land
      const c = trail.length ? trail[trail.length - 1] : { x: p.x, y: p.y };
      let x = c.x - p.facing * (10 + 10 * PX.actors().indexOf(this)), y = c.y;
      if (G.level.solidPx(x, y - 6) || G.level.groundBelow(x, y + 1, 10) === null) x = c.x;
      G.FX.poof && G.FX.poof(this.x, this.cy, { pal: 'spirit', r: 8 });
      this.x = x; this.y = y; this.vx = this.vy = 0; this.lastN = seq; this.setState('follow');
      G.FX.dust(x, y, 6, 0.8);
      PX.teleports = (PX.teleports || 0) + 1;
    }

    /* ------------------------------------------------ deciding */
    leash() { return this.stance === 'defend' ? 70 : 165; }
    pickTarget(p) {
      if (this.stance === 'silent') return null;
      const L = enemiesNear(p.x, p.cy, this.leash() + 40).filter(e => (e.aggro || Math.abs(e.x - this.x) < 90) && Math.abs(e.cy - this.cy) < 90);
      if (!L.length) return null;
      let best = null, bs = -1e9;
      for (const e of L) {
        let s = -Math.abs(e.x - this.x) - Math.abs(e.cy - this.cy) * 1.5;
        if (e === this.tg) s += 40;
        if (this.id === 'alp') { if (isHeavy(e)) s += 60; if (e.player === p) s += 30; }
        if (this.id === 'surayyo') { if (e._ranged) s += 90; s -= Math.abs(e.x - p.x) * 0.2; }
        if (this.id === 'nargiza') { s = -Math.abs(e.x - p.x); if (e.player === this) s += 50; }
        if (e.isBoss) s += 20;
        if (s > bs) { bs = s; best = e; }
      }
      return best;
    }
    brain(p) {
      if (this.busy()) { this.act(p); return; }
      const slot = 20 + 18 * Math.max(0, PX.actors().indexOf(this));
      const dh = Math.hypot(p.x - this.x, p.y - this.y);
      const tg = dh < 230 ? this.pickTarget(p) : null;
      this.tg = tg; this.inCombat = !!tg;
      if (tg && this.role(p, tg)) return;
      if (this.id === 'nargiza' && this.healCheck(p)) return;
      this.follow(p, slot);
      if (Math.abs(this.vx) < 0.2 && this.onGround) this.facing = sgn(p.x - this.x) || this.facing;
    }
    begin(st, w, a, r, extra) { this.setState(st); this.setAnim(st); this.atk = Object.assign({ w, a, r, hit: false }, extra || {}); }
    act(p) {
      const k = this.atk || { w: 10, a: 4, r: 10 }, s = this.stateT;
      if (this.state !== 'block') this.vx *= this.state === 'spin' ? 0.92 : 0.8;
      const fn = this['do_' + this.state];
      if (fn) fn.call(this, p, s, k);
      if (s >= k.w + k.a + k.r && this.state !== 'block') { this.setState('follow'); this.setAnim('idle'); }
    }
    meleeBox(reach, h) { return { x: this.facing > 0 ? this.x : this.x - reach, y: this.y - h, w: reach, h }; }
    strike(box, k, o, max) {
      let n = 0;
      for (const e of G.world.enemies) {
        if (e.dead || e.untargetable || e.isBossPart || !U.overlap(box, e.box())) continue;
        if (PX.deal(this, e, k, o)) n++;
        if (max && n >= max) break;
      }
      return n;
    }
  }
  PX.Comp = Comp;

  /* ================================================================ roles */
  const RP = Comp.prototype;
  // ---- Alp: holds the front, taunts the heavy, blocks, slams
  RP.role = function (p, tg) {
    const dx = tg.x - this.x, ad = Math.abs(dx), dy = tg.cy - this.cy;
    this.facing = sgn(dx) || this.facing;
    if (this.id === 'alp') return roleAlp.call(this, p, tg, dx, ad, dy);
    if (this.id === 'nargiza') return roleNar.call(this, p, tg, dx, ad, dy);
    return roleSur.call(this, p, tg, dx, ad, dy);
  };
  function roleAlp(p, tg, dx, ad, dy) {
    const st = this.stance;
    // block a blow that is coming (a red "!" over an enemy close in front)
    const threat = enemiesNear(this.x, this.cy, 46).find(e => e.teleT > 0 && sgn(e.x - this.x) === this.facing);
    if (threat && this.cds.b <= 0 && this.atkCD > 6) { this.begin('block', 0, 0, 0); this.cds.b = 150; this.blockT = 12 + Math.min(24, threat.teleT); return true; }
    // taunt the heavy ones (and everyone close) off the hero
    const tauntCD = PARTY.node('alp', 'provoke') ? 330 : 540, tr = PARTY.node('alp', 'provoke') ? 200 : 150;
    if (st !== 'range' && this.cds.a <= 0 && enemiesNear(this.x, this.cy, tr).some(e => isHeavy(e) && e.player === p)) { this.begin('taunt', 18, 4, 16); this.cds.a = tauntCD; return true; }
    if (st === 'range' && ad > 28) { this.follow(p, 18); return true; }
    if (PARTY.node('alp', 'boulder') && tg._ranged && (Math.abs(dy) > 40 || ad > 90) && ad < 200 && this.cds.c <= 0) { this.begin('throw', 22, 4, 18, { tg }); this.cds.c = 420; return true; }
    if (PARTY.node('alp', 'ram') && ad > 50 && ad < 130 && Math.abs(dy) < 20 && this.cds.d <= 0 && enemiesNear(tg.x, tg.cy, 40).length >= 2) { this.begin('ram', 12, 26, 14); this.cds.d = 480; return true; }
    if (ad > 24 || Math.abs(dy) > 24) { this.goTo(tg.x - sgn(dx) * 20, tg.y, this.def.speed * (ad > 50 ? 1.3 : 1), 4); return true; }   // a heavy charge into the fight
    if (this.atkCD > 0) { this.stop(); return true; }
    this.swings = (this.swings || 0) + 1;
    const crowd = enemiesNear(this.x, this.cy, 54).length;
    if (this.swings % 3 === 0 && (crowd >= 2 || isHeavy(tg))) { this.begin('slam', 28, 4, 24); this.atkCD = 30; }
    else { this.begin('atk', 20, 4, 22); this.atkCD = 22; }
    return true;
  }
  RP.do_atk = function (p, s, k) {
    if (this.id === 'nargiza') { if (s >= k.w && s < k.w + k.a && !k.hit && this.strike(this.meleeBox(18, 20), 0.45, { kbx: 3, kby: -1.5 }, 1)) { k.hit = true; sfx('hit', { x: this.x, pitch: 1.6 }); } return; }
    if (s === k.w) { sfx('swing_heavy', { x: this.x, pitch: 0.8 }); G.FX.smear && G.FX.smear({ owner: this, ox: 4, oy: -20, r0: 8, r1: 24, a0: -2.4, a1: 0.6, dir: this.facing, color: '#e8dcc8', life: 8 }); }
    if (s >= k.w && s < k.w + k.a && !k.hit) {
      const toss = PARTY.node('alp', 'toss');
      const n = this.strike(this.meleeBox(30, 28), 1, { kbx: 3, kby: toss ? -4.5 : -2, heavy: true }, 2);
      if (n) { k.hit = true; if (PARTY.node('alp', 'gaze')) for (const e of enemiesNear(this.x + this.facing * 16, this.cy, 22)) if (isWeak(e) && Math.random() < 0.2) { e.addStatus('stun', { t: 50 }); G.FX.text(e.x, e.top - 6, '?', '#c8c4bc', { size: 7 }); } }
    }
  };
  RP.do_slam = function (p, s, k) {
    if (s === k.w) {
      const crush = PARTY.node('alp', 'crush');
      G.shake(0.25); sfx('stomp', { x: this.x });
      G.FX.ring(this.x + this.facing * 10, this.y - 2, 6, 44, '#e8dcc8', 16, { width: 2, flat: true });
      G.FX.debris(this.x + this.facing * 12, this.y - 2, 10, this.facing, ['#8a7a60', '#5a4a38', '#c8b490'], { speed: 2.6 });
      G.FX.dustFan ? G.FX.dustFan(this.x + this.facing * 12, this.y) : G.FX.dust(this.x, this.y, 10, 1.4);
      for (const e of enemiesNear(this.x + this.facing * 12, this.cy, 52)) {
        PX.deal(this, e, 1.3 * (crush ? 1.2 : 1), { stun: e.isBoss ? 0 : Math.round(70 * (crush ? 1.5 : 1)), kbx: 2, kby: -2.5, heavy: true, poiseMul: 2 });
        if (PARTY.node('alp', 'dread') && isWeak(e)) { e.vx = sgn(e.x - this.x) * 3.5; e._fearT = fr() + 90; }
      }
    }
  };
  RP.do_block = function (p, s) {
    this.stop();
    if (s > (this.blockT || 30)) { this.setState('follow'); this.setAnim('idle'); }
  };
  RP.do_taunt = function (p, s, k) {
    if (s === k.w) {
      const r = PARTY.node('alp', 'provoke') ? 200 : 150;
      G.FX.ring(this.x, this.cy, 8, r * 0.6, '#ff8a6a', 18, { width: 2 }); sfx('boss_roar', { x: this.x, pitch: 1.6, vol: 0.4 });
      G.FX.text(this.x, this.top - 10, t(`Me.|Я здесь.|Men shu yerda.`), '#e8dcc8', { size: 7 });
      PX.taunt(this, r, 300);
    }
  };
  RP.do_throw = function (p, s, k) {
    if (s === k.w && k.tg && !k.tg.dead) {
      const tg = k.tg, b = new Stone(tg); b.x = this.x + this.facing * 6; b.y = this.top + 2; b.vx = (tg.x - b.x) / 40; b.vy = ((tg.cy - b.y) - 0.5 * 0.12 * 40 * 40) / 40; b.tg = tg; b.thrower = this;
      b.update = function () { this.t++; this.vy += 0.12; this.x += this.vx; this.y += this.vy; const e = this.tg; if (e && !e.dead && Math.abs(e.x - this.x) < 12 && Math.abs(e.cy - this.y) < 16) { PX.deal(this.thrower, e, 1.4, { kbx: 3, kby: -2, stun: e.isBoss ? 0 : 40, heavy: true }); this.dead = true; G.FX.debris(this.x, this.y, 10, sgn(this.vx), ['#8a8378', '#4d4740', '#6a645a']); sfx('break', { x: this.x }); } if (this.t > 90 || G.level.solidPx(this.x, this.y)) this.dead = true; };
      b.draw = function (ctx) { ctx.fillStyle = '#4d4740'; ctx.fillRect(Math.round(this.x) - 3, Math.round(this.y) - 3, 6, 6); ctx.fillStyle = '#8a8378'; ctx.fillRect(Math.round(this.x) - 2, Math.round(this.y) - 3, 3, 2); };
      G.world.add(b); sfx('throw', { x: this.x });
    }
  };
  RP.do_ram = function (p, s, k) {
    if (s >= k.w && s < k.w + k.a) {
      this.vx = this.facing * 3.6;
      if (s % 3 === 0) G.FX.dust(this.x, this.y, 2, 0.8);
      for (const e of enemiesNear(this.x + this.facing * 8, this.cy, 18)) if (!(k.set || (k.set = new Set())).has(e)) { k.set.add(e); PX.deal(this, e, 0.9, { kbx: 5, kby: -3, heavy: true, stun: e.isBoss ? 0 : 30 }); }
    }
  };
  // ---- Nargiza: keeps distance, flees melee, heals the group under 50%, songs that stun and blind
  function roleNar(p, tg, dx, ad, dy) {
    if (this.healCheck(p)) return true;
    const close = enemiesNear(this.x, this.cy, 34).filter(e => !e.isBoss || Math.abs(e.x - this.x) < 24);
    const want = this.stance === 'range' ? 120 : this.stance === 'defend' ? 60 : 90;
    if (close.length && this.cds.c <= 0 && this.stance !== 'silent') {
      const e = close[0], away = sgn(this.x - e.x) || -this.facing;
      // cornered: a weak bonk with the dutar; otherwise run (and jump) away
      if (this.wallAhead(away) || this.edgeAhead(away)) { if (this.atkCD <= 0) { this.facing = -away; this.begin('atk', 10, 4, 14); this.atkCD = 40; } else this.hop(36, -away, -away * 2.6); }
      else { this.walk(away, this.def.speed * 1.25); this.facing = away; }
      return true;
    }
    if (ad < want - 20 && !this.wallAhead(-sgn(dx)) && !this.edgeAhead(-sgn(dx))) { this.walk(-sgn(dx), this.def.speed); this.facing = sgn(dx) || 1; return true; }
    if (ad > want + 60 || Math.abs(dy) > 70 || !G.Phys.los(this.x, this.top + 4, tg.x, tg.cy)) { this.goTo(tg.x - sgn(dx) * want, tg.y, this.def.speed, 12); return true; }
    this.stop(); this.facing = sgn(dx) || this.facing;
    if (this.atkCD <= 0 && this.stance !== 'silent') {
      this.songs = (this.songs || 0) + 1;
      if (this.songs % 4 === 0) { this.begin('sing', 22, 6, 18, { tg, stunSong: true }); }
      else this.begin('cast', 16, 2, 14, { tg });
      this.atkCD = this.def.period - 30;
    }
    return true;
  }
  RP.healCheck = function (p) {
    if (this.id !== 'nargiza' || this.cds.heal > 0 || this.stance === 'silent') return false;
    const lim = this.stance === 'defend' ? 0.6 : 0.5;
    const all = [p, ...PX.actors().filter(c => !c.downed)];
    const need = all.some(a => a.hp < a.maxHp * lim && !a.dead);
    // Calling back: raise a fallen friend from afar
    const fallen = PARTY.node('nargiza', 'farraise') ? PX.actors().find(c => c.downed && Math.abs(c.x - this.x) < 160) : null;
    if (!need && !fallen) return false;
    if (Math.abs(p.x - this.x) > 110 && !fallen) { this.goTo(p.x - p.facing * 30, p.y, this.def.speed * 1.3, 20); return true; }
    this.begin('sing', 30, 10, 20, { heal: true, fallen });
    this.cds.heal = 720;
    return true;
  };
  RP.do_cast = function (p, s, k) {
    if (s === k.w && k.tg && !k.tg.dead) {
      G.world.add(new Wave(this, k.tg, 1, {}));
      sfx('magic', { x: this.x, pitch: 1.5, vol: 0.5 });
      if (PARTY.node('nargiza', 'echo')) { const tg = k.tg; setTimeoutFrames(60, () => { if (!this.downed && !tg.dead && this.world === G.world) G.world.add(new Wave(this, tg, 0.5, {})); }); }
    }
  };
  RP.do_sing = function (p, s, k) {
    if (s % 8 === 0) G.FX.spawn({ x: this.x + rnd(-6, 6), y: this.top - 2, vy: -0.6, vx: rnd(-0.3, 0.3), life: 40, size: 2, size1: 0, color: k.heal ? '#9cf0c0' : '#8ff6ef', glow: true, shape: 'star' });
    if (s === k.w && k.heal) {
      const amt = PARTY.node('nargiza', 'heal') ? 0.31 : 0.22, all = [p, ...PX.actors().filter(c => !c.downed)];
      for (const a of all) {
        if (Math.hypot(a.x - this.x, a.y - this.y) > 140 || a.dead) continue;
        const h = Math.round(a.maxHp * amt); if (a.heal) a.heal(h); else a.hp = Math.min(a.maxHp, a.hp + h);
        PARTY.stats.heals = (PARTY.stats.heals || 0) + h;
        G.FX.ring(a.x, a.cy, 4, 22, '#9cf0c0', 18, { width: 1 });
        if (PARTY.node('nargiza', 'vshield')) { a._ward = Math.round(a.maxHp * 0.1); if (a !== p) a.shieldT = 300; }
        if (PARTY.node('nargiza', 'cleanse')) for (const st of ['burn', 'poison', 'bleed']) if (a.st) a.st[st] = null;
      }
      if (k.fallen && k.fallen.downed) k.fallen.revive('nargiza');
      sfx('heal', { x: this.x }); PX.emit('heal', this.id);
      G.FX.ring(this.x, this.cy, 6, 46, '#9cf0c0', 22, { width: 1 });
    }
    if (s === k.w && k.stunSong && k.tg && !k.tg.dead) {
      const tg = k.tg, sleep = PARTY.node('nargiza', 'sleep');
      G.FX.ring(tg.x, tg.cy, 6, 46, '#8ff6ef', 20, { width: 2 }); sfx('magic', { x: tg.x, pitch: 0.7 });
      for (const e of enemiesNear(tg.x, tg.cy, 44)) { songHit(this, e, 0.7, { stun: e.isBoss ? 0 : (sleep && isWeak(e) ? 180 : 55), kbx: 0.5 }); if (!e.isBoss) { e.atkCD = Math.max(e.atkCD || 0, 70); e._blindT = fr() + 120; } }
    }
  };
  // ---- Surayyo: flanks, hooks the ranged ones in, trips, pours water
  function roleSur(p, tg, dx, ad, dy) {
    const st = this.stance;
    const hookR = PARTY.node('surayyo', 'pull') ? 210 : 150, hookCD = PARTY.node('surayyo', 'pull') ? 250 : 360;
    // hook-pull a ranged enemy (or one on a ledge)
    const far = G.world.enemies.find(e => !e.dead && !e.isBoss && !e.isBossPart && (e._ranged || e.fly || e.cy < this.cy - 40) && Math.abs(e.x - this.x) < hookR && Math.abs(e.x - this.x) > 40 && Math.abs(e.cy - this.cy) < 110 && G.Phys.los(this.x, this.top + 4, e.x, e.cy));
    if (far && this.cds.a <= 0) { this.facing = sgn(far.x - this.x) || 1; this.begin('hook', 14, 10, 14, { tg: far }); this.cds.a = hookCD; return true; }
    // pour water where they bunch up (Nargiza's song will run through it)
    const crowd = enemiesNear(tg.x, tg.cy, 40);
    if (this.cds.b <= 0 && (crowd.length >= 2 || (PARTY.has('nargiza') && PX.up('nargiza'))) && ad < 120 && Math.abs(dy) < 40) { this.begin('pour', 18, 6, 14, { tg }); this.cds.b = 600; return true; }
    if (st === 'range') { this.follow(p, 30); return true; }
    // spin when surrounded
    if (PARTY.node('surayyo', 'spin') && enemiesNear(this.x, this.cy, 30).length >= 2 && this.cds.d <= 0) { this.begin('spin', 6, 24, 10); this.cds.d = 300; return true; }
    // flank: the far side of the target from the hero
    const side = sgn(tg.x - p.x) || 1, fx = tg.x + side * 22;
    const canFlank = st !== 'defend' && Math.abs(tg.x - p.x) < 140 && !G.level.solidPx(fx, tg.y - 6) && G.level.groundBelow(fx, tg.y + 1, 20) !== null;
    const tx = canFlank && Math.abs(this.x - fx) > 14 && Math.abs(this.x - tg.x) > 12 ? fx : tg.x - sgn(dx) * 22;
    // in reach: strike (she flanks on the way in, never dances around a target already in reach)
    if (ad > 34 || Math.abs(dy) > 24) {
      // run past under the enemy to the far side
      this.goTo(tx, tg.y, this.def.speed * 1.15, 6); return true;
    }
    this.facing = sgn(tg.x - this.x) || this.facing;
    if (this.atkCD > 0) { this.stop(); return true; }
    if (this.cds.c <= 0 && tg.onGround !== false && !tg.isBoss && !tg.fly) { this.begin('trip', 10, 4, 18); this.cds.c = 300; this.atkCD = 30; return true; }
    this.begin('jab', 8, 4, 14); this.atkCD = this.def.period - 26;
    return true;
  }
  RP.do_jab = function (p, s, k) {
    if (s === k.w) sfx('swing', { x: this.x, pitch: 1.2 });
    if (s >= k.w && s < k.w + k.a && !k.hit && this.strike(this.meleeBox(36, 20), 1, { kbx: 1.6 }, 1)) k.hit = true;
  };
  RP.do_trip = function (p, s, k) {
    if (s === k.w) {
      sfx('swing', { x: this.x, pitch: 0.9 }); G.FX.dust(this.x + this.facing * 16, this.y, 5, 1);
      const pro = PARTY.node('surayyo', 'trip');
      for (const e of G.world.enemies) if (!e.dead && !e.isBossPart && U.overlap(this.meleeBox(34, 10), e.box()) && (pro || !e.elite)) PX.deal(this, e, 0.8, { stun: e.isBoss ? 0 : pro ? 90 : 55, kbx: 1, kby: -1.5 });
    }
  };
  RP.do_spin = function (p, s, k) {
    if (s >= k.w && s < k.w + k.a && (s - k.w) % 8 === 0) { sfx('whoosh', { x: this.x }); this.strike({ x: this.x - 30, y: this.y - 26, w: 60, h: 26 }, 0.55, { kbx: 2.5, kby: -1.5 }); }
  };
  RP.do_hook = function (p, s, k) {
    const tg = k.tg;
    if (!tg || tg.dead) { this.setState('follow'); return; }
    if (s === k.w) sfx('throw', { x: this.x });
    if (s === k.w + 4) {
      // caught: drag him in, down from a ledge if he stood on one
      const high = tg.cy < this.cy - 30;
      tg.vx = sgn(this.x - tg.x) * Math.min(6.5, Math.abs(this.x - tg.x) / 9); tg.vy = high ? 1.5 : -2.5; tg.y -= 1;
      if (tg.fly) tg.vy = (this.cy - tg.cy) / 14;
      PX.deal(this, tg, 0.6 * (high && PARTY.node('surayyo', 'drop') ? 2.2 : 1), { stun: 45, kbx: 0, kby: 0 });
      tg.aggro = true; tg._ranged = false; tg._pulledT = fr();
      PX.hooks = (PX.hooks || 0) + 1;
      sfx('hit_heavy', { x: tg.x });
    }
  };
  RP.do_pour = function (p, s, k) {
    if (s === k.w) {
      const tg = k.tg && !k.tg.dead ? k.tg : null, x = tg ? tg.x : this.x + this.facing * 30;
      pour(this, x, PARTY.node('surayyo', 'puddle') ? 96 : 64, 480);
    }
  };
  PX.pour = pour;

  /* ================================================================ the commanded skills (1 / 2 / 3) */
  PX.command = id => {
    const c = PARTY.actor(id);
    if (!c || c.downed || c.gone) { sfx('denied'); return false; }
    if (c.skillCD > 0) { sfx('denied'); G.FX.text(c.x, c.top - 8, t(`Not yet|Ещё рано|Hali erta`), '#b0a0c0', { size: 6 }); return false; }
    c.skillCD = c.def.skill.cd * 60;
    c.atk = { w: id === 'alp' ? 22 : id === 'nargiza' ? 26 : 18, a: 6, r: 20, hit: false };
    c.setState('skill'); c.setAnim('skill'); c.st.stun = null;
    const bark = { alp: `Over here!|Сюда!|Bu yoqqa!`, nargiza: `Listen!|Слушайте!|Tinglang!`, surayyo: `Water's coming!|Вода пошла!|Suv keldi!` }[id];
    G.FX.text(c.x, c.top - 12, t(bark), c.def.col, { size: 7 });
    PX.emit('skill', id);
    return true;
  };
  RP.do_skill = function (p, s, k) {
    const combo = PARTY.talks(this.id);    // approval ≥ +40: the hero gets an opening on those it touched
    const open = e => { if (combo && !e.dead) { e._openT = fr() + 180; G.FX.hitStar(e.x, e.top - 4, { r: 5, n: 4, pal: 'gold' }); } };
    if (this.id === 'alp') {
      if (s === k.w) {
        G.shake(0.5); G.hitstop(4); sfx('explosion', { x: this.x, pitch: 0.7 });
        G.FX.ring(this.x, this.y - 2, 10, 90, '#ffd9a0', 24, { width: 2, flat: true }); G.FX.ring(this.x, this.cy, 6, 50, '#ff8a6a', 18, { width: 1 }); G.FX.dust(this.x, this.y, 18, 2);
        G.FX.debris(this.x, this.y - 2, 22, 0, ['#8a7a60', '#5a4a38', '#c8b490', '#3a2e24'], { speed: 3.6 });
        for (const e of enemiesNear(this.x, this.cy, 84)) { PX.deal(this, e, 2.2, { stun: e.isBoss ? 0 : 120, kbx: 3, kby: -3, heavy: true, poiseMul: 3 }); open(e); }
        PX.taunt(this, 160, 360, true);
        if (PARTY.node('alp', 'k_wall')) { this.wallT = fr() + 240; G.FX.text(this.x, this.top - 22, t(`You shall not pass.|Не пройдёшь.|O'tolmaysan.`), '#e8dcc8', { size: 7 }); }
        if (PARTY.node('alp', 'k_captain')) this.captain = 5;
      }
      if (this.captain > 0 && s > k.w && (s - k.w) % 12 === 0) { this.captain--; this.vx = this.facing * 2.2; sfx('swing_heavy', { x: this.x }); this.strike(this.meleeBox(34, 30), 0.9, { kbx: 3, kby: -2, heavy: true }); if (this.captain > 0) k.r = Math.max(k.r, (s - k.w) + 14); }
    } else if (this.id === 'nargiza') {
      if (s % 6 === 0 && s < k.w) G.FX.ring(this.x, this.top, 2, 12 + s, '#8ff6ef', 10, { width: 1 });
      if (s === k.w) {
        const big = PARTY.node('nargiza', 'k_ustoz');
        G.FX.ring(this.x, this.cy, 8, 130, '#8ff6ef', 26, { width: 3 }); G.FX.ring(this.x, this.cy, 4, 90, '#e8f4ee', 20, { width: 1 }); G.FX.flash('#8ff6ef', 0.12);
        sfx('magic', { x: this.x, pitch: 0.6 }); sfx('thunder', { x: this.x, vol: 0.3 });
        for (const e of enemiesNear(this.x, this.cy, big ? 170 : 130)) { songHit(this, e, 2, { stun: e.isBoss ? 0 : 90, kbx: 2, kby: -1 }); if (!e.isBoss) { e.atkCD = Math.max(e.atkCD || 0, big ? 200 : 110); e._blindT = fr() + (big ? 240 : 150); } open(e); }
      }
    } else {
      if (s === k.w) {
        const flood = PARTY.node('surayyo', 'k_sluices');
        sfx('ice', { x: this.x, pitch: 0.4 }); G.shake(0.3);
        for (const d of [-1, 1]) for (let i = 0; i < 26; i++) G.FX.spawn({ x: this.x + d * i * 6, y: this.y - 2 - Math.random() * 10, vx: d * rnd(1, 3), vy: -rnd(0.5, 2.5), grav: 0.15, life: 26 + i, size: 2, size1: 0, color: i % 3 ? '#5fb8ff' : '#bfe8ff', glow: i % 4 === 0 });
        pour(this, this.x, flood ? 220 : 150, 540);
        for (const d of [-1, 1]) G.world.add(new Surge(this.x, this.y, d, flood ? 170 : 120));
        for (const e of enemiesNear(this.x, this.cy, flood ? 170 : 120)) {
          const weak = isWeak(e);
          PX.deal(this, e, (flood && weak ? 2.6 : 1.1) * (PARTY.node('surayyo', 'strike') ? 1.4 : 1), { kbx: e.isBoss ? 0 : 5.5, kby: -2.5, stun: e.isBoss ? 0 : flood ? 90 : 45 });
          if (!e.isBoss) e.addStatus('slow', { t: 200 });
          open(e);
        }
        for (const a of [p, ...PX.actors()]) if (a && a.st && a.st.burn) a.st.burn = null;
        if (PARTY.node('surayyo', 'k_life')) for (const a of [p, ...PX.actors().filter(c => !c.downed)]) { const h = Math.round(a.maxHp * 0.2); if (a.heal) a.heal(h); else a.hp = Math.min(a.maxHp, a.hp + h); G.FX.ring(a.x, a.cy, 4, 20, '#9cf0c0', 16, { width: 1 }); }
      }
    }
  };
  // taunt: enemies around turn on him (bosses only for a moment)
  PX.taunt = (c, r, frames, bosses) => {
    for (const e of G.world.enemies) {
      if (e.dead || e.isBossPart || Math.abs(e.x - c.x) > r || Math.abs(e.cy - c.cy) > r * 0.6) continue;
      if (e.isBoss && !bosses) continue;
      e._tgt = c; e._tgtUntil = fr() + (e.isBoss ? 150 : frames); e._taunted = true; e.aggro = true;
      G.FX.text(e.x, e.top - 6, '!', '#ff8a6a', { size: 7 });
    }
    PX.taunts = (PX.taunts || 0) + 1;
  };
  // the companion's blow on an enemy
  PX.deal = (c, e, k, o) => {
    if (!e || e.dead || e.untargetable) return false;
    let dmg = c.hitDmg() * k;
    if (e._weakT > fr()) dmg *= 1.1;
    // a boss is the hero's fight: companions keep it busy and chip at it (×BOSS_K), they do not carry it
    // (measured, test/s7_balance.js boss: without this the full party killed bosses in a third of the solo time)
    if (e.isBoss || e.isBossPart || (e.def && e.def.boss)) dmg = Math.min(dmg * PX.BOSS_K, G.BAL.HIT_CAP * (e.boss && e.boss.maxHp || e.maxHp));
    const before = e.hp;
    const hit = Object.assign({ dmg, kbx: 2, kby: -1.5, dir: sgn(e.x - c.x) || c.facing, type: 'ally', src: c, dmgColor: c.def.col, flinch: 10 }, o || {});
    if (e.isBoss) { delete hit.stun; hit.kbx = 0; hit.kby = 0; }
    const ok = e.takeHit(hit);
    if (ok) {
      const d = Math.max(0, before - Math.max(0, e.hp));
      PARTY.stats.dealt[c.id] = (PARTY.stats.dealt[c.id] || 0) + d;
      if (e.isBoss) { const B = PARTY.stats.boss || (PARTY.stats.boss = {}); B[c.id] = (B[c.id] || 0) + d; }
      if (G.onScreen(e.x, e.y)) { G.FX.hitStar(e.x - hit.dir * 3, e.cy + G.U.rand(-3, 3), { r: hit.heavy ? 6 : 4, n: 4, pal: c.id === 'nargiza' ? 'spirit' : c.id === 'surayyo' ? 'ice' : 'hit' }); G.FX.debris(e.x, e.cy, hit.heavy ? 7 : 4, hit.dir, [e.bloodColor || '#3a0d1c']); }
      sfx(hit.heavy ? 'hit_heavy' : 'hit', { x: e.x, vol: 0.6 });
      if (hit.heavy) G.hitstop(1);
      if (e.isBoss && hit.poiseMul && G.BAL.poiseHit) { try { G.BAL.poiseHit(e, Object.assign({}, hit, { dmg: d * 0.5 })); } catch (x) { /* ignore */ } }
      if (!e.aggro) e.aggro = true;
    }
    return ok;
  };
  // frame timers (not setTimeout: tests step the world by hand)
  const LATER = [];
  function setTimeoutFrames(n, fn) { LATER.push({ at: (G.world ? G.world.t : 0) + n, fn }); }

  /* ================================================================ spawning */
  PX.spawn = id => {
    if (!G.world || !G.world.player || !G.run || PARTY.actor(id)) return null;
    const m = PX.M(id);
    if (!m.joined || m.left || !m.active || m.out) return null;
    const plan = G.Game.stage && G.Game.stage.plan;
    if (plan && plan.type === 'victory') return null;
    const p = G.world.player, i = PX.actors().length;
    let x = p.x - (p.facing || 1) * (18 + 16 * i), y = p.y;
    if (G.level.solidPx(x, y - 6) || G.level.groundBelow(x, y + 1, 30) === null) x = p.x;
    const c = new Comp(id, x, y);
    G.world.add(c);
    PX.list = PX.list.filter(a => a.world === G.world && !a.gone);
    PX.list.push(c);
    return c;
  };
  PX.spawnAll = () => { for (const id of PARTY.active()) PX.spawn(id); };
  PX.despawn = (id, why) => { const c = PARTY.actor(id); if (c) { c.gone = true; c.dead = true; if (why === 'leave') G.FX.poof && G.FX.poof(c.x, c.cy, { pal: 'violet', r: 10 }); } PX.list = PX.list.filter(a => a !== c); };
  PX.refresh = id => { const c = PARTY.actor(id); if (c) c.refresh(false); };
  PX.restActors = () => { for (const c of PX.actors()) { if (c.downed) c.revive('rest'); c.refresh(true); c.hp = c.maxHp; c.skillCD = 0; } PX.spawnAll(); };

  /* ================================================================ the tick (inside World#update) */
  const keyPrev = {};
  const edge = code => { const d = G.input.keys.has(code); const r = d && !keyPrev[code]; keyPrev[code] = d; return r; };
  let lastWorld = null;
  const wu0 = G.World.prototype.update;
  G.World.prototype.update = function () {
    if (G.run && this === G.world && this.player) { try { tick(this); } catch (e) { console.error('[party] tick', e); } }
    return wu0.apply(this, arguments);
  };
  PX.radial = { open: false, holdT: 0, sel: -1 };
  PX.STANCE_KEY = 'KeyV';
  function tick(w) {
    const p = w.player;
    if (w !== lastWorld) { lastWorld = w; PX.list = PX.list.filter(c => c.world === w && !c.gone); trail.length = 0; PX.spawnAll(); }
    if (!PX.list.length && !PARTY.active().length) return;
    PX.agg = 0.1 * PX.K();
    trailTick(p);
    for (let i = LATER.length - 1; i >= 0; i--) if (w.t >= LATER[i].at) { const f = LATER.splice(i, 1)[0]; try { f.fn(); } catch (e) { console.error(e); } }
    // keys: 1 / 2 / 3 the commanded skills, V the stance (tap: next, hold: the wheel); G is the hero's hook (82)
    const busyUI = (G.UI.isOpen && G.UI.isOpen()) || (G.CHUI && G.CHUI.open);
    if (!busyUI && !p.dead) {
      for (const id of PX.IDS) if (edge(DEF[id].key) && !PX.radial.open) PARTY.command(id);
      const g = G.input.keys.has(PX.STANCE_KEY), Rd = PX.radial;
      if (g) {
        Rd.holdT++;
        if (Rd.holdT === 16) { Rd.open = true; Rd.sel = PX.STANCES.indexOf(PARTY.stance()); }
        if (Rd.open) {
          const k = G.input.keys;
          if (k.has('KeyW') || k.has('ArrowUp')) Rd.sel = 0; else if (k.has('KeyD') || k.has('ArrowRight')) Rd.sel = 1; else if (k.has('KeyS') || k.has('ArrowDown')) Rd.sel = 2; else if (k.has('KeyA') || k.has('ArrowLeft')) Rd.sel = 3;
          for (let i = 0; i < 4; i++) if (k.has('Digit' + (i + 1))) Rd.sel = i;
          for (let i = 1; i <= 3; i++) keyPrev['Digit' + i] = k.has('Digit' + i);
        }
      } else if (Rd.holdT > 0) {
        const st = Rd.open ? PX.STANCES[Math.max(0, Rd.sel)] : PX.STANCES[(PX.STANCES.indexOf(PARTY.stance()) + 1) % 4];
        if (PARTY.active().length) { PARTY.stance(st); toast(tf(`Stance: {s}|Стойка: {s}|Holat: {s}`, { s: t(PX.STANCE_NAME_OF(st)) }), '#e8dcc8'); sfx('ui_select'); }
        Rd.holdT = 0; Rd.open = false;
      }
    }
    // revive: hold F next to a fallen companion (blows on the hero set it back)
    const hold = G.input.isDown && G.input.isDown('interact');
    for (const c of PX.actors()) {
      if (!c.downed) { c.reviving = false; continue; }
      const near = Math.abs(c.x - p.x) < 30 && Math.abs(c.y - p.y) < 26 && !p.dead;
      c.reviving = near && hold;
      if (c.reviving) {
        const sh = PARTY.node('surayyo', 'shoulder') && PX.up('surayyo');
        c.rev += sh ? 1.6 : 1;
        if (PX.heroHurtF === fr()) c.rev = Math.max(0, c.rev - 36);
        if (c.rev >= 120) c.revive('hero');
      } else c.rev = Math.max(0, c.rev - 2);
    }
    // who hunts whom: about a third of the enemies in a fight go for a companion
    if (w.t % 20 === 0) target(p);
    // Surayyo's neighbours in the Tail; her wall of water; Nargiza's sight; laughter
    const s = PARTY.actor('surayyo');
    if (s && !s.downed) {
      if (PARTY.node('surayyo', 'ours') && w.t % 360 === 0 && /tail/.test(String((G.Game.stage && G.Game.stage.plan && G.Game.stage.plan.biome) || ''))) { const e = enemiesNear(p.x, p.cy, 180).find(e => e.aggro); if (e) w.add(new Stone(e)); }
      if (PARTY.node('surayyo', 'wwall') && s.cds.e === undefined) s.cds.e = 0;
      if (PARTY.node('surayyo', 'wwall') && s.cds.e <= 0) {
        const pr = w.ents.find(q => q.isProj && !q.dead && q.faction === 'enemy' && Math.abs(q.x - p.x) < 46 && Math.abs(q.y - p.cy) < 30 && sgn(q.vx) === sgn(p.x - q.x));
        if (pr) { pr.die(); s.cds.e = 360; G.FX.burst(pr.x, pr.y, 14, { speed: 2, life: 24, size: 2, colors: ['#bfe8ff', '#5fb8ff'], grav: 0.2 }); G.FX.ring(pr.x, pr.y, 4, 20, '#8fd0ff', 14, { width: 2 }); sfx('ice', { x: pr.x, pitch: 1.3 }); }
      }
      if (PARTY.node('surayyo', 'laugh') && w.t % 480 === 0) { let any = false; for (const a of [p, ...PX.actors()]) if (a.st && (a.st.stun || a.st.slow)) { a.st.stun = null; a.st.slow = null; any = true; } if (any) G.FX.text(s.x, s.top - 10, t(`Ha!|Ха!|Ha!`), '#e8c070', { size: 7 }); }
    }
    const n = PARTY.actor('nargiza');
    if (n && !n.downed && PARTY.node('nargiza', 'hidden') && w.t % 4 === 0) for (const o of w.interactables) if (!o.dead && !o.used && /ydCache|lostMemory|chest|lore/.test(o.art || '') && Math.hypot(o.x - n.x, o.y - n.y) < 150) G.Glow.add(o.x, o.y - 8, 26, '#c9b4ff', 0.35 + 0.15 * Math.sin(w.t * 0.1));
  }
  PX.STANCE_NAME_OF = st => PX.STANCE_NAME_OF_T[st];
  PX.STANCE_NAME_OF_T = G.PARTY.STANCE_NAME;
  function target(p) {
    const fighters = PX.actors().filter(c => !c.downed && !c.untargetable);
    let toC = 0, all = 0;
    for (const e of G.world.enemies) {
      if (e.dead || e.isBossPart) continue;
      if (e.isBoss) { if (e._tgt && e._tgtUntil < fr()) e._tgt = null; continue; }
      if (e._fearT > fr()) { e.vx = U.approach(e.vx, sgn(e.x - (PARTY.actor('alp') || p).x) * 1.6, 0.3); }
      const valid = e._tgt && !e._tgt.downed && !e._tgt.gone && !e._tgt.untargetable && e._tgt.world === G.world;
      if (!valid && e._tgt) e._tgt = null;
      if (e._tgtUntil > fr() && (valid || !e._tgt)) { if (e.aggro) { all++; if (e._tgt) toC++; } continue; }
      e._taunted = false;
      if (!fighters.length) { e._tgt = null; e._tgtUntil = fr() + 120; continue; }
      if (!e.aggro && Math.hypot(e.x - p.x, e.cy - p.cy) > 240) continue;
      const near = fighters.filter(c => Math.hypot(c.x - e.x, c.cy - e.cy) < 260);
      if (near.length && Math.random() < 1 / 3) {
        let tot = 0; const wts = near.map(c => { const v = c.id === 'alp' ? 2 : c.id === 'surayyo' ? 1.2 : 0.7; tot += v; return v; });
        let r = Math.random() * tot, pick = near[0];
        for (let i = 0; i < near.length; i++) { r -= wts[i]; if (r <= 0) { pick = near[i]; break; } }
        e._tgt = pick;
      } else e._tgt = null;
      e._tgtUntil = fr() + 300 + Math.floor(Math.random() * 180);
      if (e.aggro) { all++; if (e._tgt) toC++; }
    }
    PARTY.stats.targets = { toC, all };
  }
  // enemies that shoot are "ranged" (Surayyo hooks them, Alp throws at them)
  {
    const sh0 = G.Enemy.prototype.shoot;
    G.Enemy.prototype.shoot = function () { this._ranged = true; return sh0.apply(this, arguments); };
    // a blinded enemy swings at the air
    const hp0 = G.Enemy.prototype.hitPlayer;
    G.Enemy.prototype.hitPlayer = function () { if (this._blindT > fr() && Math.random() < 0.6) return false; return hp0.apply(this, arguments); };
  }
  // Nargiza's warning before a boss's blow
  PX.warn = b => {
    const n = PARTY.actor('nargiza'), p = pl(); if (!n || !p || (PX._warnF || 0) > fr()) return;
    PX._warnF = fr() + 40;
    G.FX.text(p.x, p.top - 18, t(`Now!|Сейчас!|Hozir!`), '#8ff6ef', { size: 7 });
    G.FX.ring(p.x, p.cy, 6, 24, '#8ff6ef', 12, { width: 1 });
  };
  // bosses with a party get support (+1 support enemy per companion, ch. 12)
  G.Events.on('bossStart', b => {
    const K = PX.K(); if (!K || !b) return;
    PX.bossSupport = { b, K, next: (G.world ? G.world.t : 0) + 600 };
  });
  {
    const ub0 = G.Game.updateBossStage;
    G.Game.updateBossStage = function () {
      const r = ub0.apply(this, arguments);
      try {
        const S = PX.bossSupport, w = G.world;
        if (S && S.b && !S.b.dead && S.b === G.Game.boss && w && w.t >= S.next && S.b.mode === 'fight') {
          S.next = w.t + 900;
          const alive = w.enemies.filter(e => !e.dead && e._support).length;
          if (alive < S.K) {
            let bio = null;
            for (let i = (G.run.planIndex || 0); i >= 0; i--) { const q = G.PLAN[i]; if (q && q.type === 'level' && q.biome) { const bd = G.Biomes.get(q.biome); bio = (bd && bd.enemyBiome) || q.biome; break; } }
            const L = (bio && G.Enemies.list(bio).filter(d => !d.boss && !d.fly && (d.hp || 30) < 120)) || [];
            if (L.length) {
              const d = L[Math.floor(Math.random() * L.length)], A0 = G.BossKit && G.BossKit.arena ? G.BossKit.arena() : null;
              const x = A0 ? (Math.random() < 0.5 ? A0.x0 + 30 : A0.x1 - 30) : S.b.x;
              PX.noScale = true;
              try { const e = G.Enemies.spawn(d.id, x, A0 ? A0.floor : S.b.y, {}); if (e) { e._support = true; e.aggro = true; e.maxHp = e.hp = Math.round(e.hp * 0.7); G.FX.poof && G.FX.poof(e.x, e.cy, { pal: 'violet', r: 10 }); PX.supports = (PX.supports || 0) + 1; } } finally { PX.noScale = false; }
            }
          }
        }
      } catch (e) { console.error('[party] support', e); }
      return r;
    };
  }
}
