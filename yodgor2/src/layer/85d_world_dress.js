/* =====================================================================
   Stage 8 / top priority — the open-world regions dressed along their
   whole length (the author: "regions look empty and dark").
   The looks of 85a were the old short stages stretched 3-4x: bare walls,
   black voids between the few props, two regions that were the same
   picture twice (Tower = grey Rabat, Withers = Spine).

   This file only paints (decorate / lights / skies / parallax / grading)
   and adds a few hidden caches; geometry, enemies and story stay as they
   are. Per region (cfg below):
     light   a light source every `gap` px along every floor run, so no
             stretch of a deep region is left without one
     props   region things on the floor (salt blocks, bones, bales, ...)
     hang    things hanging from the ceiling (roots, chains, lanterns)
     wins    lit cracks / windows cut into the back wall (life behind)
     life    animated people and creatures in the background
     open    more holes in the back wall of cave regions, so the painted
             depth behind shows (caveWindows of 62_art_deep)
   New looks: the Tower of Silence (ash dusk, dakhmas on bare hills,
   vultures, braziers, ossuaries) and the Withers (dawn above a sea of
   clouds, the Sky Caravanserai on its peak) — no longer copies of the
   Rabat and the Spine.  Test: test/s9_regions.js (shots + brightness).
   ===================================================================== */
{
(function worldDress() {
  const A = G.ART_CITY, D = G.ART_DEEP, K = G.BiomeKit, DEFS = G.Biomes && G.Biomes.defs, U = G.U, TS = G.TS, T = G.T, PK = G.PixKit;
  if (!A || !A.prop || !D || !D.rootDeco || !K || !DEFS || typeof W2 === 'undefined') { console.error('[dress] art libraries missing'); return; }
  const RD = Math.round, PI = Math.PI;
  const P32 = A.P32, mix = A.mix, shade = A.shade;
  const DR = G.DRESS = { stats: {} };

  /* ================================================================ helpers */
  const busyOf = L => { const xs = A.busyXs(L); for (const o of (L.w2 && L.w2.objs) || []) if (o && o.x != null) xs.push(o.x); return xs; };
  const freeAt = (busy, x, pad) => A.free(busy, x, pad || 30);
  const lightsOf = L => L.decos.filter(d => d && d.light).map(d => [d.x, d.y]);
  const lit = (ls, x, y, gap) => ls.some(p => Math.abs(p[0] - x) < gap && Math.abs(p[1] - y) < 90);
  // the floor runs (open floor with head room) of a level
  const floors = (L, min, clear) => A.runs(L, min || 2, clear || 3);
  // along every run, every `gap` px (jittered), call fn(x, y, run)
  function along(L, rng, gap, fn, o) {
    o = o || {};
    for (const run of floors(L, o.min || 2, o.clear || 3)) {
      const x0 = run.x0 * TS + 6, x1 = (run.x1 + 1) * TS - 6;
      if (x1 - x0 < (o.minW || 8)) continue;
      for (let x = x0 + rng.int(0, Math.max(1, Math.min(gap, x1 - x0) * .6)); x < x1; x += gap * rng.range(.7, 1.3)) fn(RD(x), run.y, run);
    }
  }
  function wrap(id, fn) {
    const d = DEFS[id]; if (!d) { console.warn('[dress] no biome', id); return; }
    const prev = d.decorate;
    d.decorate = function (L, rng) {
      if (prev) prev.call(this, L, rng);
      const n0 = L.decos.length;
      try { fn(L, U.RNG(((L.seed || 1) * 131 + 17) >>> 0), d); } catch (e) { console.error('[dress] ' + id, e); }
      DR.stats[id] = { added: L.decos.length - n0, total: L.decos.length };
    };
  }
  const set = (id, o) => { const d = DEFS[id]; if (d) Object.assign(d, o); };
  const addStatic = A.addStatic;

  /* ================================================================ props (painted once, cached) */
  const salt = ['#f4f6f8', '#d8dee4', '#b4bec8', '#8a94a0', '#5a6470'];
  function saltStack(v) {
    return A.prop('dr_salt' + v, 22, 18, px => {
      const r = A.rngOf(v + 3), n = 2 + (v % 3);
      let y = 17;
      for (let row = 0; row < n; row++) {
        const cnt = Math.max(1, 3 - row - (v & 1)), bw = 7, h = 5;
        for (let k = 0; k < cnt; k++) {
          const x = 1 + row * 3 + k * (bw + 0) + r.int(0, 1);
          for (let j = 0; j < h; j++) for (let i = 0; i < bw; i++) {
            const e = i === 0 || j === h - 1, top = j === 0;
            px.set(x + i, y - h + j, P32(e ? salt[4] : top ? salt[0] : (A.hash(i, j, v + k) < .2 ? salt[2] : salt[1])));
          }
        }
        y -= 5;
      }
    });
  }
  function basket(v) {
    return A.prop('dr_basket' + v, 11, 9, px => {
      for (let y = 1; y < 9; y++) { const hw = 4 + (y > 2 ? 1 : 0) - (y > 7 ? 1 : 0); for (let x = 5 - hw; x <= 5 + hw; x++) px.set(x, y, P32(((x + y) & 1) ? '#8a6a3a' : '#a8844a')); }
      for (let x = 1; x < 10; x++) px.set(x, 1, P32('#c8a060'));
      if (v % 2 === 0) for (let x = 2; x < 9; x++) px.set(x, 0, P32(x & 1 ? '#f4f6f8' : '#d8dee4'));   // salt heaped in it
    });
  }
  const pick = () => A.prop('dr_pick', 9, 14, px => { for (let y = 2; y < 14; y++) px.set(4 + (y > 8 ? 1 : 0), y, P32('#7a5a3a')); for (let x = 0; x < 9; x++) px.set(x, 1 + (x === 0 || x === 8 ? 1 : 0), P32('#6a7078')); px.set(4, 0, P32('#9aa0a8')); });
  function bones(v) {
    return A.prop('dr_bones' + v, 16, 7, px => {
      const c = ['#d8d0bc', '#b0a890', '#7a7262'];
      for (let x = 1; x < 14; x++) px.set(x, 5 - ((x * 7 + v) % 3 === 0 ? 1 : 0), P32(c[1]));
      px.set(1, 4, P32(c[0])); px.set(13, 4, P32(c[0]));
      if (v % 2 === 0) { for (let y = 0; y < 5; y++) for (let x = 4; x < 10; x++) if ((x - 7) ** 2 / 9 + (y - 2) ** 2 / 6 < 1) px.set(x, y + 1, P32(y < 2 ? c[0] : c[1])); px.set(5, 3, P32('#2a2420')); px.set(8, 3, P32('#2a2420')); }
      for (let x = 0; x < 16; x++) px.set(x, 6, P32(c[2]));
    });
  }
  // astodan: a small stone ossuary chest with a lid
  function ossuary(v) {
    return A.prop('dr_oss' + v, 18, 14, px => {
      const c = ['#e0d8c8', '#b8ac98', '#8a8070', '#5a5248'];
      for (let y = 3; y < 14; y++) for (let x = 1; x < 17; x++) px.set(x, y, P32(x === 1 || y === 13 ? c[3] : x === 16 ? c[2] : (A.hash(x, y, v) < .15 ? c[2] : c[1])));
      for (let x = 0; x < 18; x++) { px.set(x, 2, P32(c[0])); px.set(x, 3, P32(c[2])); }
      for (let x = 3; x < 15; x++) px.set(x, 1, P32(c[0]));
      for (let x = 6; x < 12; x++) px.set(x, 0, P32(c[1]));
      // carved arcade
      for (let k = 0; k < 3; k++) { const x0 = 3 + k * 4; for (let y = 6; y < 11; y++) px.set(x0 + 1, y, P32(c[3])); px.set(x0, 6, P32(c[3])); px.set(x0 + 2, 6, P32(c[3])); }
    });
  }
  function bale(v) {
    const pal = [['#8a6a40', '#a8844e', '#5a4428'], ['#7a6a5a', '#9a8a74', '#4a3e34'], ['#9a5a3a', '#c07a4a', '#5a3020']][v % 3];
    return A.prop('dr_bale' + v, 14, 9, px => {
      for (let y = 0; y < 9; y++) for (let x = 0; x < 14; x++) { const e = (x === 0 || x === 13 || y === 8); if ((x === 0 || x === 13) && (y === 0)) continue; px.set(x, y, P32(e ? pal[2] : y < 2 ? pal[1] : pal[0])); }
      for (let y = 1; y < 8; y++) { px.set(4, y, P32(pal[2])); px.set(9, y, P32(pal[2])); }
    });
  }
  function crate(v) {
    return A.prop('dr_crate' + v, 12, 10, px => {
      for (let y = 0; y < 10; y++) for (let x = 0; x < 12; x++) px.set(x, y, P32(x === 0 || y === 0 || x === 11 || y === 9 ? '#3a2818' : (y % 3 === 0 ? '#5a4028' : '#7a5838')));
      for (let k = 1; k < 9; k++) px.set(k + 1, k, P32('#4a3220'));
    });
  }
  function rubble(v) {
    return A.prop('dr_rub' + v, 20, 8, px => {
      const r = A.rngOf(v + 9);
      for (let i = 0; i < 14; i++) { const cx = r.int(1, 18), s = r.int(1, 3), top = 8 - s * 2 - r.int(0, 2); for (let y = top; y < 8; y++) for (let x = cx - s; x <= cx + s; x++) px.set(x, y, P32(y === top ? '#6a6460' : '#3e3a38')); }
    });
  }
  // a brazier on three legs, burning (lights the ground around it)
  function brazier(x, y, o) {
    o = o || {};
    return PK.flameDeco(x, y - 9, {
      w: o.w || 6, h: o.h || 9, lightR: o.r || 110, lightC: o.light || '#ffa050', lightA: .95, glowR: 22, glowC: o.glow || '#ff9030', glowI: .6, embers: true,
      draw(ctx) {
        const X = RD(x), Y = RD(y);
        ctx.fillStyle = '#2a1e18'; ctx.fillRect(X - 4, Y - 6, 1, 6); ctx.fillRect(X + 3, Y - 6, 1, 6); ctx.fillRect(X, Y - 5, 1, 5);
        ctx.fillStyle = o.bowl || '#5a3a24'; ctx.fillRect(X - 5, Y - 9, 11, 3); ctx.fillStyle = '#8a5a34'; ctx.fillRect(X - 5, Y - 9, 11, 1);
      }
    });
  }
  // a torch in an iron ring on a post (cave regions)
  function torchPost(x, y, o) {
    o = o || {};
    return PK.flameDeco(x, y - 22, {
      w: 4, h: 7, lightR: o.r || 96, lightC: o.light || '#ffb060', lightA: .9, glowR: 16, glowC: o.glow || '#ffa040', glowI: .55, embers: true,
      draw(ctx) {
        const X = RD(x), Y = RD(y);
        ctx.fillStyle = o.post || '#2a2018'; ctx.fillRect(X - 1, Y - 18, 2, 18); ctx.fillStyle = '#4a3a2a'; ctx.fillRect(X - 1, Y - 18, 1, 18);
        ctx.fillStyle = '#3a3a40'; ctx.fillRect(X - 2, Y - 21, 4, 2);
        ctx.fillStyle = '#5a3a20'; ctx.fillRect(X - 1, Y - 23, 2, 2);
      }
    });
  }
  // an oil lamp standing in a niche cut into the rock (cave walls)
  const niche = (x, y, o) => D.nicheLamp(x, y, o || {});

  /* ================================================================ life (animated, cheap) */
  const onS = (x, y, r) => G.onScreen(x, y, r || 60);
  // a little figure (5x9) in a pose; frame 0..1 alternates
  function figure(ctx, X, Y, col, flip, pose, k) {
    const f = flip ? -1 : 1, px = (dx, dy, w, h) => ctx.fillRect(X + (flip ? -dx - w + 1 : dx), Y + dy, w, h);
    ctx.fillStyle = col;
    px(-1, -9, 3, 3);                 // head
    px(-2, -6, 5, 4);                 // body
    px(-2, -2, 2, 2); px(1, -2, 2, 2);   // legs
    if (pose === 'pick') { const up = k > .5; px(2, up ? -9 : -5, 1, 3); px(up ? 1 : 3, up ? -11 : -3, up ? 4 : 3, 1); }
    else if (pose === 'carry') { px(-3, -10, 7, 2); }
    else if (pose === 'kneel') { px(2, -4, 2, 1); }
    else if (pose === 'lamp') { px(3, -6, 1, 3); ctx.fillStyle = '#ffd890'; px(3, -3, 1, 1); }
    return f;
  }
  // a worker cutting at the rock / wall (swinging a pick), a light by him
  function worker(x, y, o) {
    o = o || {};
    const ph = x * .07, flip = !!o.flip, col = o.col || '#1a1614';
    return {
      x, y: y - 8, r: 30, layer: 'back', light: o.light === false ? null : { r: 60, color: o.lightC || '#ffc070', a: .7, flicker: true, dy: -6 },
      draw(ctx, t) {
        const k = ((t * .9 + ph) % 1);
        figure(ctx, RD(x), RD(y), col, flip, o.pose || 'pick', k);
        if ((o.pose || 'pick') === 'pick' && k > .5 && k < .56 && onS(x, y)) G.FX.spawn({ x: x + (flip ? -5 : 5), y: y - 6, vx: (flip ? -1 : 1) * U.rand(.2, .9), vy: -U.rand(.3, 1), grav: .08, life: 18, size: 1, color: o.chip || '#e8eef4' });
      }
    };
  }
  // a figure who walks slowly between two points (a porter, a mourner, a pilgrim)
  function walker(x0, x1, y, o) {
    o = o || {};
    const sp = o.sp || 8, ph = (x0 * 13) % 97, w = Math.max(8, x1 - x0), col = o.col || '#1a1614';
    return {
      x: (x0 + x1) / 2, y: y - 8, r: w / 2 + 20, layer: 'back',
      draw(ctx, t) {
        const p = ((t * sp + ph) % (2 * w)), dir = p < w ? 1 : -1, x = x0 + (p < w ? p : 2 * w - p);
        figure(ctx, RD(x), RD(y) + (Math.floor(t * 4 + ph) % 2 ? 0 : -1), col, dir < 0, o.pose || 'carry', 0);
      }
    };
  }
  // birds circling over a point (vultures over a dakhma, crows over the road); screen-cheap
  function circling(cx, cy, n, o) {
    o = o || {};
    const rows = A.SPR[o.kind || 'crow'], seed = cx * .01;
    return {
      x: cx, y: cy, r: (o.rx || 90) + 30, layer: o.layer || 'back',
      draw(ctx, t) {
        ctx.fillStyle = o.col || '#1a1418';
        for (let i = 0; i < n; i++) {
          const a = t * (o.sp || .5) * (i & 1 ? 1 : -1) + i * 2.1 + seed, x = RD(cx + Math.cos(a) * (o.rx || 90) * (.6 + .4 * ((i * 37) % 10) / 10)), y = RD(cy + Math.sin(a) * (o.ry || 22) - i * 3);
          const flap = Math.sin(t * 6 + i) > 0;
          for (let j = 0; j < rows.length; j++) for (let q = 0; q < rows[j].length; q++) if (rows[j][q] !== ' ') ctx.fillRect(x + q - 3, y + j - (flap && (q === 0 || q === rows[j].length - 1) ? 1 : 0), 1, 1);
        }
      }
    };
  }
  // bats that flutter about under a cave roof
  function bats(cx, cy, n) {
    return {
      x: cx, y: cy, r: 80, layer: 'back',
      draw(ctx, t) {
        ctx.fillStyle = '#0a0608';
        for (let i = 0; i < n; i++) {
          const a = t * (1.3 + i * .2) + i * 1.7, x = RD(cx + Math.sin(a) * (30 + i * 8) + Math.sin(a * 2.3) * 6), y = RD(cy + Math.cos(a * 1.4) * 10 + Math.sin(a * 3.1) * 4);
          const w = Math.sin(t * 18 + i * 3) > 0;
          ctx.fillRect(x - 1, y, 3, 1); if (w) { ctx.fillRect(x - 3, y - 1, 2, 1); ctx.fillRect(x + 2, y - 1, 2, 1); } else { ctx.fillRect(x - 3, y + 1, 2, 1); ctx.fillRect(x + 2, y + 1, 2, 1); }
        }
      }
    };
  }
  // a crack in the back wall with warm light behind it: somebody lives there
  function litCrack(x, y, o) {
    o = o || {};
    const w = o.w || 3, h = o.h || 6, col = o.col || '#ffb860', ph = x * .03;
    return {
      x, y, r: 24, layer: 'back', light: { r: o.r || 34, color: col, a: .55, flicker: true },
      draw(ctx, t) {
        const a = .75 + .25 * Math.sin(t * 1.3 + ph);
        ctx.fillStyle = '#060406'; ctx.fillRect(RD(x) - 1, RD(y) - 1, w + 2, h + 2);
        ctx.globalAlpha = a; ctx.fillStyle = col; ctx.fillRect(RD(x), RD(y), w, h);
        ctx.fillStyle = '#fff0c8'; ctx.fillRect(RD(x) + (w > 2 ? 1 : 0), RD(y) + 1, 1, Math.max(1, h - 3)); ctx.globalAlpha = 1;
        if (o.shadow && Math.sin(t * .4 + ph) > .7) { ctx.fillStyle = '#060406'; ctx.fillRect(RD(x), RD(y) + 1, w, h - 2); }   // someone passes behind
      },
      fx(ctx, t) { G.Glow.add(x + w / 2, y + h / 2, 10, col, .3); }
    };
  }
  // dust / spores / embers hanging in the air around the camera (particles)
  const motes = o => D.particles(o);

  /* ================================================================ the generic dresser */
  // cfg: {light:{gap, make(x,y,rng,run)}, props:{gap, make(L,x,y,rng)}, hang:{gap, make(x,y,len,rng)}, wins:{n, make(x,y,rng)}, life(L,rng,busy), open}
  function dress(L, rng, cfg) {
    const busy = busyOf(L), Dc = L.decos;
    if (cfg.open && L.isOpen === false) { /* only open-generator caves have a back mask we can cut */ }
    if (cfg.open) try { D.caveWindows(L, cfg.open, 11); } catch (e) { /* not a cave level */ }
    // lights first: every run gets one every `gap` px (unless an existing light is near)
    if (cfg.light) {
      const ls = lightsOf(L);
      along(L, rng, cfg.light.gap, (x, y, run) => {
        if (!freeAt(busy, x, 26) || lit(ls, x, y, cfg.light.gap * .55)) return;
        const d = cfg.light.make(x, y, rng, run); if (!d) return;
        Dc.push(d); ls.push([x, y]);
      }, { minW: 24 });
    }
    if (cfg.props) along(L, rng, cfg.props.gap, (x, y) => { if (freeAt(busy, x, 22)) cfg.props.make(L, x, y, rng); });
    if (cfg.hang && L.ceilRow) for (let tx = 4; tx < L.w - 4; tx += rng.int(cfg.hang.gap[0], cfg.hang.gap[1])) {
      const cy = L.ceilRow[tx]; if (cy == null || cy < 0) continue;
      let fy = cy + 1; while (fy < L.h - 1 && L.get(tx, fy) === T.AIR) fy++;
      const len = (fy - cy - 1) * TS; if (len < 40) continue;
      const d = cfg.hang.make(tx * TS + 8, (cy + 1) * TS, len, rng); if (d) Dc.push(d);
    }
    if (cfg.wins && L.back) {
      let n = 0, tries = 0;
      const want = Math.round(cfg.wins.n * L.w / 100);
      while (n < want && tries++ < want * 30) {
        const tx = rng.int(3, L.w - 4), ty = rng.int(3, L.h - 4), i = ty * L.w + tx;
        if (!L.back[i] || L.get(tx, ty) !== T.AIR || (L.structOf && L.structOf(tx, ty))) continue;
        // only near where the hero walks (within ~7 tiles above a floor)
        let fl = 0; for (let k = 1; k < 8; k++) if (ty + k < L.h && L.get(tx, ty + k) !== T.AIR) { fl = k; break; }
        if (!fl || fl < 2) continue;
        const d = cfg.wins.make(tx * TS + rng.int(2, 10), ty * TS + rng.int(2, 8), rng); if (d) { Dc.push(d); n++; }
      }
    }
    // the grid pass: any part of the level (rooms, pits, lower galleries the floor runs missed) more than ~sx px from a light
    // gets one on the nearest floor tile
    if (cfg.grid) {
      const ls = lightsOf(L), g = cfg.grid, sx = Math.round(g.sx / TS), sy = Math.round((g.sy || 96) / TS);
      for (let ty = 2; ty < L.h - 2; ty += sy) for (let tx = 2; tx < L.w - 2; tx += sx) {
        let fx = -1, fy = -1;
        for (let k = 0; k < sx * sy && fx < 0; k++) {
          const x = tx + rng.int(0, sx - 1), y = ty + rng.int(0, sy - 1);
          if (x < 1 || y < 1 || x >= L.w - 1 || y >= L.h - 1) continue;
          if (L.get(x, y) === T.AIR && L.get(x, y - 1) === T.AIR && L.get(x, y + 1) !== T.AIR && L.get(x, y + 1) !== T.SPIKE && L.get(x, y + 1) !== T.LADDER) { fx = x; fy = y; }
        }
        if (fx < 0) continue;
        const X = fx * TS + 8, Y = (fy + 1) * TS;
        if (lit(ls, X, Y, g.sx * .7) || !freeAt(busy, X, 24)) continue;
        const d = g.make(X, Y, rng); if (d) { Dc.push(d); ls.push([X, Y]); }
      }
    }
    if (cfg.life) cfg.life(L, rng, busy);
  }

  /* ================================================================ open up a deep region's background */
  // grade its parallax lighter (gamma + a screen colour), lift its sky, and lay a thin haze of the region's own colour over the
  // background only (fogBehind runs after sky+parallax, before the world): the painted depth behind the caves becomes visible.
  function openBg(id, o) {
    const d = DEFS[id]; if (!d) return;
    const gr = K.grade([{ gamma: o.gamma || .75 }, { screen: o.screen || '#30283a', k: o.k == null ? .5 : o.k }].concat(o.map ? [{ map: o.map, k: o.mapK || .6 }] : []), 'open_' + id);
    const bb = d.buildBackground;
    if (bb) d.buildBackground = function (L) { let ls = []; try { ls = bb.call(this, L) || []; } catch (e) { console.error('[dress] bg ' + id, e); } return K.gradeLayers(ls, gr); };
    const sky0 = d.drawSky;
    if (sky0) d.drawSky = function (ctx, cam, t, L) { sky0.call(this, ctx, cam, t, L); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.skyA || .35; ctx.fillStyle = o.sky || o.screen || '#30283a'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; };
    const fog0 = d.fogBehind;
    d.fogBehind = function (ctx, cam, t, L) { if (fog0) fog0.call(this, ctx, cam, t, L); ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = o.hazeA || .16; ctx.fillStyle = o.haze || o.screen || '#30283a'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; };
    if (o.post !== undefined) d.post = o.post;
  }
  openBg('w_streets', { screen: '#5a4662', k: .55, gamma: .65, haze: '#6a4c70', hazeA: .22, sky: '#2a2034', skyA: .5 });
  openBg('w_mines', { screen: '#8a94a4', k: .5, gamma: .7, map: [[0, '#1a1e26'], [.3, '#4a5260'], [.65, '#a4aebc'], [1, '#f0f4f8']], mapK: .75, haze: '#9aa4b4', hazeA: .14, sky: '#3a4250',
    post(ctx) { D.blendFill(ctx, '#c8d8f0', .12); } });
  openBg('w_heart', { screen: '#7a2434', k: .55, gamma: .7, haze: '#8a2a3a', hazeA: .22, sky: '#4a0e1a', skyA: .5 });
  openBg('w_cistern', { screen: '#2a6060', k: .5, gamma: .7, haze: '#2a7070', hazeA: .2, sky: '#0e2a2a', skyA: .5 });
  openBg('w_well', { screen: '#4a3e2a', k: .45, gamma: .75, haze: '#5a4a30', hazeA: .16 });
  openBg('w_karez', { screen: '#1a3a3a', k: .3, gamma: .85, haze: '#2a5050', hazeA: .08 });

  /* ================================================================ secrets: hidden caches in the long empty stretches */
  const CACHES = { streets: [0.08, 0.93], mines: [0.12, 0.5], heart: [0.66], tower: [0.22, 0.9], rabat: [0.55], withers: [0.42], spine: [0.66], old: [0.15, 0.58], well: [0.22], cistern: [0.85], cloister: [0.82] };
  for (const id in CACHES) {
    const R = W2.regions[id]; if (!R || !R.objects) continue;
    CACHES[id].forEach((f, k) => R.objects.push({ kind: 'cache', id: 'dr_' + id + k, at: { frac: f } }));
  }

  /* ================================================================ THE SWALLOWED STREETS */
  // a whole street the wall swallowed: lanterns still burn in some windows, people live in the houses' upper rooms
  set('w_streets', { ambient: '#6a6078', shade: '#4a4058', deepShade: '#140e1a' });
  wrap('w_streets', (L, rng) => dress(L, rng, {
    open: .5,
    grid: { sx: 180, make: (x, y, r) => torchPost(x, y, { r: 96 }) },
    light: { gap: 150, make: (x, y, r) => r.chance(.55) ? K.lantern(x, y - r.int(34, 50), { len: r.int(4, 14), color: r.pick(['#a03a24', '#b8782a', '#2a5a90', '#7a2a6a']), lightR: 92, lightC: '#ffb868' }) : torchPost(x, y, { r: 100 }) },
    props: { gap: 70, make: (L, x, y, r) => { const k = r.int(0, 5); if (k === 0) addStatic(L, A.jarCv(r.int(0, 3)), x - 5, y - 12); else if (k === 1) addStatic(L, rubble(r.int(0, 3)), x - 10, y - 8); else if (k === 2) addStatic(L, crate(r.int(0, 2)), x - 6, y - 10); else if (k === 3) L.decos.push(A.cloth(x - 6, y - r.int(40, 56), r.int(8, 12), r.int(10, 16), r.pick([['#7a2a2a', '#9a4a3a'], ['#2a4a7a', '#3a5a8a'], ['#6a5a2a', '#8a7a3a']]))); } },
    hang: { gap: [10, 22], make: (x, y, len, r) => r.chance(.75) ? D.rootDeco(x, y, Math.min(len - 20, r.int(14, 40)), x, { tip: r.chance(.25) ? '#ffb070' : null, cols: ['#1e1814', '#2a2018', '#3a2e22'] }) : null },
    wins: { n: 1.6, make: (x, y, r) => litCrack(x, y, { w: r.int(2, 4), h: r.int(4, 7), col: r.pick(['#ffb860', '#ffa040', '#ffd890']), shadow: r.chance(.3) }) },
    life(L, r, busy) {
      // squatters by the lanterns: someone sitting, someone carrying water up a swallowed stair
      let n = 0;
      along(L, r, 420, (x, y) => { if (n > 14 || !freeAt(busy, x, 40)) return; n++; L.decos.push(r.chance(.5) ? walker(x - 30, x + 30, y, { pose: 'carry', col: '#120e14', sp: 6 }) : worker(x, y, { pose: 'kneel', col: '#120e14', light: true, lightC: '#ffb060' })); }, { minW: 80 });
      along(L, r, 900, (x, y) => L.decos.push(bats(x, y - r.int(70, 110), r.int(3, 6))), { minW: 60 });
    }
  }));
  DEFS.w_streets && (DEFS.w_streets.ambientFx = D.both(DEFS.w_streets.ambientFx, motes({ rate: .03, cols: ['#ffd8a0', '#ffb070'], vx: [-.05, .05], vy: [-.1, -.03], glow: true, glowR: 3, life: 300, alpha: .7, sway: .004 })));

  /* ================================================================ THE SALT MINES */
  // debtors cut salt from the Sleeper's body: white walls, stacked blocks, baskets, oil lamps in niches, the pick strokes heard and seen
  set('w_mines', { ambient: '#a0a8b4', shade: '#727a88', deepShade: '#1c2028', bloom: .8 });
  wrap('w_mines', (L, rng) => {
    // the old streets' dead trees and swallowed houses do not belong in a mine: keep only lights and hanging roots
    L.decos = L.decos.filter(d => !d.static || d.bh < 30);
    dress(L, rng, {
      open: .55,
      grid: { sx: 170, make: (x, y, r) => torchPost(x, y, { r: 104, light: '#ffd8a0', post: '#3a3a40' }) },
      light: { gap: 130, make: (x, y, r) => r.chance(.6) ? torchPost(x, y, { r: 110, light: '#ffd8a0', post: '#3a3a40' }) : niche(x, y - r.int(18, 30), { r: 90, light: '#ffd0a0' }) },
      props: { gap: 52, make: (L, x, y, r) => { const k = r.int(0, 6); if (k < 3) addStatic(L, saltStack(r.int(0, 5)), x - 11, y - 18); else if (k === 3) addStatic(L, basket(r.int(0, 3)), x - 5, y - 9); else if (k === 4) addStatic(L, pick(), x - 4, y - 14); else if (k === 5) L.decos.push(D.crystalDeco(x, y, '#e8f4ff', r.range(0, 6), r.range(.7, 1.2))); } },
      hang: { gap: [8, 16], make: (x, y, len, r) => r.chance(.5) ? D.rootDeco(x, y, Math.min(len - 24, r.int(10, 26)), x, { cols: ['#c8d0d8', '#a8b0b8', '#e8eef4'], n: 2 }) : null },     // salt icicles
      wins: { n: 1.6, make: (x, y, r) => litCrack(x, y, { w: 2, h: r.int(3, 5), col: '#fff0d8', r: 26 }) },
      life(L, r, busy) {
        // the debtors at work, every few hundred px; porters with baskets of salt between them
        let n = 0;
        along(L, r, 300, (x, y) => { if (n > 18 || !freeAt(busy, x, 40)) return; n++; L.decos.push(r.chance(.65) ? worker(x, y, { flip: r.chance(.5), col: '#2a2626', chip: '#f4f8fc' }) : walker(x - 40, x + 40, y, { pose: 'carry', col: '#2a2626', sp: 5 })); }, { minW: 60 });
      }
    });
  });
  DEFS.w_mines && (DEFS.w_mines.ambientFx = D.both(DEFS.w_mines.ambientFx, motes({ rate: .08, cols: ['#ffffff', '#e8eef4'], vx: [-.08, .08], vy: [.02, .1], life: 300, alpha: .6, sway: .01 })));

  /* ================================================================ THE HEART */
  // a glowing nodule in the heart's wall that swells with every beat
  const hbeat = t => { const p = (t * 1.25) % 1; return Math.max(Math.exp(-((p - .04) ** 2) / .0016), .65 * Math.exp(-((p - .2) ** 2) / .002)); };
  function heartNode(x, yy) {
    return { x, y: yy, r: 30, layer: 'back', light: { r: 96, color: '#ff6a7a', a: .85, flicker: false },
      draw(ctx, t) { const k = hbeat(t); ctx.fillStyle = '#4a0a14'; ctx.fillRect(RD(x) - 3, RD(yy) - 2, 7, 5); ctx.fillStyle = k > .5 ? '#ff8a9a' : '#c83a4a'; ctx.fillRect(RD(x) - 2, RD(yy) - 1, 5, 3); ctx.fillStyle = '#ffd0d8'; ctx.fillRect(RD(x), RD(yy) - 1, 1, 1); },
      fx(ctx, t) { G.Glow.add(x, yy, 14 + 6 * hbeat(t), '#ff4a5a', .45 + .3 * hbeat(t)); } };
  }
  set('w_heart', { ambient: '#c08a96', shade: '#9a5a6a', deepShade: '#2a060c' });
  wrap('w_heart', (L, rng) => dress(L, rng, {
    light: { gap: 120, make: (x, y, r) => heartNode(x, y - r.int(10, 40), r) },
    grid: { sx: 150, sy: 96, make: (x, y, r) => heartNode(x, y - r.int(8, 30), r) },
    wins: { n: 2, make: (x, y, r) => litCrack(x, y, { w: 2, h: r.int(5, 9), col: '#ff6a7a', r: 30 }) },
    hang: { gap: [8, 18], make: (x, y, len, r) => D.rootDeco(x, y, Math.min(len - 20, r.int(16, 44)), x, { tip: r.chance(.4) ? '#ff8a9a' : null, cols: ['#3a0a12', '#5a1420', '#7a2030'] }) }
  }));

  /* ================================================================ RABAT AND THE SALT ROAD — a living road */
  wrap('w_rabat', (L, rng) => dress(L, rng, {
    props: { gap: 90, make: (L, x, y, r) => { const k = r.int(0, 5); if (k < 2) addStatic(L, bale(r.int(0, 2)), x - 7, y - 9); else if (k === 2) addStatic(L, A.jarCv(r.int(0, 3)), x - 5, y - 12); else if (k === 3) addStatic(L, saltStack(r.int(0, 5)), x - 11, y - 18); } },
    life(L, r, busy) {
      // the caravan resting along the road: a lying camel, a drover, the salt bales beside them
      let n = 0;
      along(L, r, 520, (x, y) => {
        if (n > 9 || !freeAt(busy, x, 60)) return; n++;
        const cv = A.prop('dr_camel' + (n & 1), 16, 8, px => A.sprite(px, 'camelLie', 0, 0, n & 1 ? '#8a6a4a' : '#a07a52'));
        addStatic(L, cv, x - 8, y - 8);
        L.decos.push(walker(x + 14, x + 54, y, { pose: n % 3 ? 'carry' : 'lamp', col: '#3a2c24', sp: 5 }));
      }, { minW: 90 });
      along(L, r, 800, (x, y) => L.decos.push(circling(x, y - 150, 4, { kind: 'bird', rx: 70, ry: 14, col: '#4a4038', sp: .6 })), { minW: 40 });
    }
  }));

  /* ================================================================ THE TOWER OF SILENCE — its own look */
  // the dead are given to the sky here: ash dusk, bare ochre hills, round dakhmas, vultures, braziers that never go out, ossuaries
  if (DEFS.w_tower) {
    const SKY = [[0, '#2a2232'], [.35, '#5a4652'], [.62, '#9a7068'], [.82, '#d0987a'], [.94, '#e8b890'], [1, '#f0caa0']];
    const hills = { col: '#6a5048', grad: '#8a6a58', rim: '#c8a080' };
    // a dakhma: a low round tower on a hill, flat top with a parapet, a ramp, a dark door
    function dakhma(px, cx, by, w, h, pal) {
      // a wide low drum seen a little from above: curved courses, a lit and a shadowed side, the parapet's ellipse on top
      const x0 = Math.round(cx - w / 2);
      for (let x = 0; x < w; x++) {
        const n = (x + .5) / w * 2 - 1, bulge = Math.round(3 * Math.sqrt(Math.max(0, 1 - n * n)));
        for (let y = -bulge; y < h; y++) {
          const k = -n * .95 + (A.hash(x >> 1, y, cx) - .5) * .18, course = ((y + bulge) % 4 === 0);
          px.set(x0 + x, by - h + y + bulge * 2 - bulge, P32(course ? pal.lo : k > .5 ? pal.hi : k > -.35 ? pal.mid : pal.lo));
        }
        // the top: the far half of the parapet ring, darker inside
        const ry = Math.round(4 * Math.sqrt(Math.max(0, 1 - n * n)));
        for (let y = 0; y < ry; y++) px.set(x0 + x, by - h - 1 - y, P32(y === ry - 1 ? pal.hi : '#4a3a38'));
      }
      for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) px.set(cx - 2 + x, by - y, P32(y === 7 ? pal.lo : '#1a1214'));      // door
      for (let k = 0; k < h + 6; k++) for (let q = 0; q < 2; q++) px.set(x0 + w + k, by - Math.round(k * .55) + q, P32(q ? pal.lo : pal.mid));   // the bearers' ramp
    }
    A.place('w_tower', {
      ambient: '#e8d8cc', shade: '#a89088', bloom: .75, wind: .7,
      drawSky: A.skyDraw(() => A.paintSky(SKY, { seed: 61, sun: { x: 120, y: 150, r: 16, core: '#fff0d8', rim: '#ffd8a8', halo: '#f0a878', haloA: .55 }, glow: [{ x: 120, y: 200, rx: 360, ry: 90, col: '#f0b080', a: .45 }] })),
      layers(L, R, seed) {
        return A.memo('tw' + seed, () => {
          const out = [];
          const far = new A.Px(1400, 120, true);
          A.ridge(far, { seed: seed + 4, base: 118, amp: 60, per: 4, oct: 4, col: '#5a4650', grad: '#7a5c5c', gradH: 50, rim: '#b08878' });
          out.push(A.layer(far.canvas(), { fx: .03, fy: .03, base: R.horizon - 18 }));
          // fire-temple smoke far away
          out.push(A.smokeLayer({ n: 3, w: 1400, fx: .05, fy: .04, h: [60, 110], col: '#6a5a60', a: .25, dy: -40, seed: seed + 2 }));
          const mid = new A.Px(1600, 120, true), r = A.rngOf(seed + 7);
          A.ridge(mid, { seed: seed + 5, base: 119, amp: 46, per: 5, oct: 4, col: hills.col, grad: hills.grad, gradH: 40, rim: hills.rim });
          const pal = { lo: '#8a7a6c', mid: '#c8baa4', hi: '#f0e6d4' };
          for (let i = 0; i < 4; i++) { const cx = 160 + i * 400 + r.int(-50, 50); let top = 0; while (top < 119 && !mid.has(cx, top)) top++; dakhma(mid, cx, top + 3, r.int(60, 84), r.int(18, 26), pal); }
          for (let i = 0; i < 14; i++) A.tree(mid, r.int(0, 1600), 119, r.int(14, 22), 'saxaul', { trunk: '#3a2a26', trunkHi: '#5a4440', mid: '#4a3a34', lo: '#3a2a26' }, seed + 30 + i);
          out.push(A.layer(mid.canvas(), { fx: .1, fy: .07, base: R.horizon + 6, fill: '#7a5c50' }));
          // vultures over the far dakhmas
          out.push({ draw(ctx, cam, t) {
            const RR = A.refOf(G.level), base = RR.horizon - 60 - (cam.y - RR.ref) * .07;
            ctx.fillStyle = '#2a1e22';
            for (let k = 0; k < 4; k++) { const cx = ((160 + k * 400 - cam.x * .1) % 1600 + 1600) % 1600 - 100; if (cx < -80 || cx > G.W + 80) continue;
              for (let i = 0; i < 4; i++) { const a = t * .35 * (i & 1 ? 1 : -1) + i * 1.6 + k, x = RD(cx + Math.cos(a) * (26 + i * 7)), y = RD(base + Math.sin(a) * 6 - i * 4); const fl = Math.sin(t * 3 + i) > .6; ctx.fillRect(x - 3, y - (fl ? 1 : 0), 2, 1); ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x + 2, y - (fl ? 1 : 0), 2, 1); } }
          } });
          // near: ossuary mounds, cairns, a broken procession path
          const near = new A.Px(1100, 50, true), r2 = A.rngOf(seed + 9);
          for (let i = 0; i < 12; i++) { const x = r2.int(0, 1100), w = r2.int(30, 70), h = r2.int(6, 16); for (let k = 0; k < w; k++) { const hh = h * Math.sin(k / w * PI); for (let y = 0; y < hh; y++) near.set(x + k, 49 - y, P32(y > hh - 2 ? '#a08070' : '#6a5048')); } }
          for (let i = 0; i < 8; i++) { const x = r2.int(0, 1100); for (let y = 0; y < 12; y++) { const w = 4 - (y >> 2); for (let k = -w; k <= w; k++) near.set(x + k, 49 - y, P32(k < 0 ? '#8a7466' : '#c0a894')); } }   // cairns
          out.push(A.layer(near.canvas(), { fx: .35, fy: .25, base: R.horizon + 34, fill: '#5a4440' }));
          return out;
        });
      },
      fogBehind: A.hazeDraw([[0, '#2a2232', 0], [.5, '#c09080', .06], [.75, '#e8b890', .22], [1, '#a07868', .18]]),
      post: A.all(A.grade('#7a5060', .14), A.vignette ? A.vignette('#140a10', .5) : null),
      ambientFx: D.particles({ rate: .1, cols: ['#c8b8b0', '#a89890', '#e8d8d0'], vx: [.15, .45], vy: [-.05, .08], life: 360, alpha: .55, sway: .01 }),
      keepDecor: false,
      decorate(L, r) {
        dress(L, r, {
          light: { gap: 210, make: (x, y) => brazier(x, y, { r: 120 }) },
          props: { gap: 64, make: (L, x, y, rr) => { const k = rr.int(0, 6); if (k < 2) addStatic(L, ossuary(rr.int(0, 3)), x - 9, y - 14); else if (k < 4) addStatic(L, bones(rr.int(0, 3)), x - 8, y - 7); else if (k === 4) L.decos.push(A.cloth(x - 3, y - 26, 6, 18, ['#e8e0d4', '#d0c8bc'], { stripe: 3 })); } },
          life(L, rr, busy) {
            let n = 0;
            along(L, rr, 460, (x, y) => { if (n > 10 || !freeAt(busy, x, 50)) return; n++; L.decos.push(rr.chance(.5) ? walker(x - 50, x + 50, y, { pose: 'lamp', col: '#e8e0d4', sp: 4 }) : worker(x, y, { pose: 'kneel', col: '#e8e0d4', light: false })); }, { minW: 110 });
            along(L, rr, 700, (x, y) => L.decos.push(circling(x, y - rr.int(110, 160), rr.int(3, 5), { kind: 'crow', rx: 80, ry: 18, col: '#1e1418', sp: .45 })), { minW: 40 });
          }
        });
      }
    });
  }

  /* ================================================================ THE WITHERS — dawn above the clouds */
  if (DEFS.w_withers) {
    const def = DEFS.w_withers, SKYW = [[0, '#1a1e48'], [.3, '#4a3a78'], [.55, '#a0587a'], [.75, '#e88a6a'], [.9, '#ffc490'], [1, '#ffe4b8']];
    const warm = K.grade([{ map: [[0, '#1a1030'], [.35, '#5a3a6a'], [.7, '#d08a8a'], [1, '#fff0d8']], k: .55 }, { sat: .9 }], 'withers_dawn');
    def.drawSky = A.skyDraw(() => A.paintSky(SKYW, { seed: 71, sun: { x: 380, y: 196, r: 18, core: '#fffaf0', rim: '#ffe8c0', halo: '#ffb878', haloA: .7 }, glow: [{ x: 380, y: 230, rx: 420, ry: 110, col: '#ffb070', a: .55 }] }), A.twinkles(72, 40, .3, '#ffffff'));
    const bb0 = DEFS.yd_withers && DEFS.yd_withers.buildBackground, sp0 = def.buildBackground;
    def.buildBackground = function (L) {
      let base = [];
      try { base = (bb0 || sp0).call(this, L) || []; } catch (e) { try { base = sp0.call(this, L) || []; } catch (e2) { base = []; } }
      const R = A.refOf(L), seed = (L.seed || 1) % 911;
      const graded = K.gradeLayers(base, warm);
      // a sea of clouds just under the ledges, lit pink-gold from below; the Sky Caravanserai on a far peak with its lamps
      const sea = A.memo('ws_sea' + seed, () => { const px = new A.Px(1200, 70, true); for (let i = 0; i < 26; i++) A.cloud(px, (i * 47) % 1200, 30 + (i % 3) * 8, 90, 26, { lo: '#c8789a', mid: '#f0a8a0', hi: '#ffe0c0' }, seed + i, { flat: true }); return px.canvas(); });
      const kv = A.memo('ws_kv' + seed, () => {
        const px = new A.Px(1500, 110, true), r = A.rngOf(seed + 3);
        A.ridge(px, { seed: seed + 8, base: 109, amp: 70, per: 3, oct: 4, col: '#3a2a52', grad: '#5a3a62', gradH: 50, rim: '#ffb890', rimSide: -1 });
        const cx = 420; let top = 0; while (top < 109 && !px.has(cx, top)) top++;
        A.fortWall(px, cx - 60, cx + 60, top + 4, 18, { lo: '#3a2a4a', mid: '#5a4268', hi: '#ffc8a0', win: '#ffd890' }, { lx: -1, step: 40, br: 6 });
        A.dome(px, cx, top - 14, 9, { lo: '#3a3a6a', mid: '#5a5a8a', hi: '#ffd0a0', rim: '#fff0d8', drum: '#5a4268', drumD: '#3a2a4a', gold: '#ffd890', win: '#ffd890' }, { kind: 'bowl', lx: -1, drum: 3 });
        return px.canvas();
      });
      return graded.concat([
        A.layer(kv, { fx: .05, fy: .04, base: R.horizon - 30, glows: [[420, 0, '#ffd890', 14, .6]] }),
        A.layer(sea, { fx: .12, fy: .1, base: R.horizon + 40, drift: 3, alpha: .9 })
      ]);
    };
    def.post = function (ctx) { D.blendFill(ctx, '#ff9a7a', .12); };
    def.drawForeground = null;
    def.ambient = '#d8b8c8'; def.shade = '#8a6a8a'; def.deepShade = '#1a0e20'; def.bloom = .95;
    def.ambientFx = D.particles({ rate: .05, cols: ['#ffe8d0', '#ffd0b0'], vx: [.3, .8], vy: [-.05, .05], glow: true, glowR: 2, life: 300, alpha: .6, sway: .01 });
    wrap('w_withers', (L, rng) => dress(L, rng, {
      light: { gap: 260, make: (x, y, r) => K.lantern(x, y - 46, { len: 6, color: '#c83a2a', lightR: 84, lightC: '#ffc080' }) },
      props: { gap: 110, make: (L, x, y, r) => { const k = r.int(0, 4); if (k === 0) addStatic(L, bale(r.int(0, 2)), x - 7, y - 9); else if (k === 1) addStatic(L, A.jarCv(r.int(0, 3)), x - 5, y - 12); else if (k === 2) L.decos.push(A.cloth(x - 4, y - 30, 8, 22, r.pick([['#e03a3a', '#ffd040'], ['#3a6ae0', '#e8e8f0'], ['#3ac06a', '#ffd040']]), { stripe: 2 })); } },
      life(L, r, busy) { along(L, r, 640, (x, y) => L.decos.push(circling(x, y - r.int(90, 140), 3, { kind: 'bird', rx: 60, ry: 10, col: '#3a2440', sp: .5 })), { minW: 40 }); }
    }));
  }

  /* ================================================================ THE SPINE — night snow, keep its blue, give the long ledges life */
  wrap('w_spine', (L, rng) => dress(L, rng, {
    light: { gap: 300, make: (x, y) => brazier(x, y, { r: 120, light: '#ffb070' }) },
    props: { gap: 120, make: (L, x, y, r) => { if (r.chance(.4)) addStatic(L, bones(r.int(0, 3)), x - 8, y - 7); } }
  }));

  /* ================================================================ the other dark regions: lights along their full length */
  wrap('w_cistern', (L, rng) => dress(L, rng, {
    light: { gap: 150, make: (x, y, r) => niche(x, y - r.int(16, 30), { r: 96, light: '#a8f0e8', glow: '#6ae0d8' }) },
    grid: { sx: 170, make: (x, y, r) => niche(x, y - r.int(14, 26), { r: 96, light: '#a8f0e8', glow: '#6ae0d8' }) },
    wins: { n: 1.4, make: (x, y, r) => litCrack(x, y, { w: 2, h: r.int(4, 7), col: '#7af0e0', r: 30 }) },
    life(L, r) { along(L, r, 700, (x, y) => L.decos.push(bats(x, y - r.int(60, 100), r.int(2, 5))), { minW: 40 }); }
  }));
  wrap('w_well', (L, rng) => dress(L, rng, {
    light: { gap: 170, make: (x, y, r) => niche(x, y - r.int(16, 30), { r: 100, light: '#ffc888' }) },
    grid: { sx: 190, make: (x, y, r) => niche(x, y - r.int(14, 26), { r: 100, light: '#ffc888' }) },
    wins: { n: 1.2, make: (x, y, r) => litCrack(x, y, { w: 2, h: r.int(4, 6), col: '#ffd0a0' }) },
    life(L, r) { along(L, r, 640, (x, y) => L.decos.push(bats(x, y - r.int(60, 100), r.int(3, 6))), { minW: 40 }); }
  }));
  wrap('w_old', (L, rng) => dress(L, rng, {
    light: { gap: 240, make: (x, y) => brazier(x, y, { r: 110, light: '#ff9050' }) },
    props: { gap: 90, make: (L, x, y, r) => { const k = r.int(0, 4); if (k === 0) addStatic(L, rubble(r.int(0, 3)), x - 10, y - 8); else if (k === 1) addStatic(L, bones(r.int(0, 3)), x - 8, y - 7); } },
    life(L, r) { along(L, r, 760, (x, y) => L.decos.push(circling(x, y - r.int(120, 170), 4, { kind: 'crow', rx: 90, col: '#1a0608', sp: .4 })), { minW: 40 }); }
  }));
  wrap('w_karez', (L, rng) => dress(L, rng, {
    light: { gap: 200, make: (x, y, r) => niche(x, y - r.int(16, 28), { r: 90 }) },
    life(L, r) { along(L, r, 700, (x, y) => L.decos.push(bats(x, y - r.int(60, 100), r.int(2, 4))), { minW: 40 }); }
  }));
  wrap('w_cloister', (L, rng) => dress(L, rng, {
    light: { gap: 220, make: (x, y, r) => K.lantern(x, y - r.int(40, 54), { len: r.int(4, 10), color: '#2a5a90', lightR: 84, lightC: '#c8d8ff' }) }
  }));
})();
}
