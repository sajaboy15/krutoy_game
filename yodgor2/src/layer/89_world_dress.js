/* 89_world_dress.js — the open-world regions dressed along their whole length (the author: "the regions look empty").
   The widened regions (85a) kept the props of the old short stages, so long stretches were bare and the deep places black.
   This pass, per region:
     · light along every floor run (no stretch of more than ~22 tiles without a lamp, a torch, a crystal or a fire),
     · props on the floor and on the back walls (house fronts swallowed by the earth, mine timbers and rails, tumar heaps,
       tents, carpets, cargo), hangings under the ceilings (roots, chains, lanterns, veins), small life (crows that take off
       when you come near, rats, moths round the lamps, drips),
     · the deep places' backgrounds lifted out of the black (a haze and far lights behind the rock),
     · own looks where two regions were the same picture: the Tower of Silence (ashen dusk, the dakhma, crows) against the
       Rabat (white salt, caravans), the Withers (dawn above a sea of clouds, the sky caravanserai) against the Spine (night snow).
   Drawing only: tiles, collisions, objects and enemies are untouched. Uses the art kit of 61 (G.ART_CITY).
   L.w2dress = { n: decos added } for the tests (test/s9_regions.js). */
{
(function worldDress() {
  const A = G.ART_CITY, K = G.BiomeKit, DEFS = G.Biomes && G.Biomes.defs, U = G.U, TS = G.TS, PK = G.PixKit;
  if (!A || !K || !DEFS || !A.Px) { console.error('[dress] art kit missing'); return; }
  const { Px, P32, mix, shade, prop, addStatic, jarCv, carpetCv, lamp, cloth, runs, busyXs, free, rngOf, hash, layer, refOf, memo, emit, all, ridge, dome, minaret, tree, fortWall, paintSky, skyDraw, hazeDraw, grade, vignette } = A;
  const RD = Math.round, PI = Math.PI;
  const W2 = G.WORLD2;
  const DRESS = G.W2DRESS = { regions: {} };

  /* ============================================================ hooks on a biome */
  function onDecorate(id, fn) {
    const d = DEFS[id]; if (!d) { console.warn('[dress] no biome', id); return; }
    const prev = d.decorate;
    d.decorate = function (L, rng) {
      if (prev) prev.call(this, L, rng);
      const n0 = L.decos.length;
      try { fn(L, rngOf((L.seed || 1) * 13 + 5)); } catch (e) { console.error('[dress] ' + id, e); }
      L.w2dress = { n: (L.w2dress ? L.w2dress.n : 0) + L.decos.length - n0 };
    };
  }
  function onFog(id, fn) { const d = DEFS[id]; if (!d) return; const prev = d.fogBehind; d.fogBehind = function () { if (prev) prev.apply(this, arguments); fn.apply(this, arguments); }; }
  function onBg(id, fn) {
    const d = DEFS[id]; if (!d) return; const prev = d.buildBackground;
    d.buildBackground = function (L) { const base = prev ? prev.call(this, L) || [] : []; try { return base.concat(fn(L, refOf(L)) || []); } catch (e) { console.error('[dress] bg ' + id, e); return base; } };
  }
  // the deep places: the parallax drawn brighter (it was painted near-black), the shade under the rock a little lighter
  function bright(id, k, tint, sk) {
    const d = DEFS[id]; if (!d) return;
    if (tint) { if (d.shade) d.shade = mix(d.shade, tint, sk || .3); if (d.deepShade) d.deepShade = mix(d.deepShade, tint, (sk || .3) * .4); }
    const prev = d.buildBackground; if (!prev) return;
    // ctx.filter is far too slow per frame (x15 frame time); the layer is drawn a second time, added ('lighter')
    const a2 = Math.min(1, Math.max(0, k - 1));
    d.buildBackground = function (L) {
      const out = prev.call(this, L) || [];
      return out.map(ly => (!ly || !ly.draw || ly._lit) ? ly : Object.assign(Object.create(ly), { _lit: 1, draw(ctx) {
        const r = ly.draw.apply(ly, arguments);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a2;
        try { ly.draw.apply(ly, arguments); } finally { ctx.restore(); }
        return r;
      } }));
    };
  }
  const light = (d, o) => Object.assign(d, { light: Object.assign({ r: 70, color: '#ffb060', a: .9, flicker: true }, o) });

  /* ============================================================ placement */
  // walks every floor run; every `gap` tiles a light (lit(x, y, run)); between them props(x, y, run, rr) may place a prop
  // and returns the tiles it took. Objects, exits and the spawn keep a clear margin.
  function along(L, rng, o) {
    const busy = busyXs(L), out = { lights: 0, props: 0 };
    for (const run of runs(L, o.min || 3, o.clear || 3)) {
      const len = run.x1 - run.x0;
      let sinceLight = RD(rng() * (o.gap * .6));
      for (let tx = run.x0 + 1; tx <= run.x1 - 1; tx++) {
        const x = tx * TS + 8;
        if (!free(busy, x, 30)) { sinceLight++; continue; }
        if (o.lit && sinceLight >= o.gap && len >= 4) { o.lit(x, run.y, run, rng); sinceLight = 0; out.lights++; tx += 1; continue; }
        sinceLight++;
        if (o.props && rng() < (o.density || .12)) { const took = o.props(x, run.y, run, rng, tx); if (took) { out.props++; tx += took; sinceLight += took; } }
      }
    }
    return out;
  }
  // ceilings: every so often a hanging thing (only where the air below is tall enough)
  function hangers(L, rng, chance, fn) {
    const busy = busyXs(L); let last = -99;
    for (const s of L.spots.ceil || []) {
      if (s.tx - last < 4 || rng() > chance || !free(busy, s.x, 20)) continue;
      let air = 0; while (air < 8 && L.get(s.tx, s.ty + air) === G.T.AIR) air++;
      if (air < 5) continue;
      last = s.tx; fn(s.x, s.y, air, rng);
    }
  }
  // back walls: the air in front of a solid back wall (the deep places) — a wall piece every so often
  function backSpots(L, rng, every, h) {
    const out = [];
    for (const run of runs(L, 4, Math.ceil(h / TS) + 1)) for (let tx = run.x0 + 1; tx <= run.x1 - 2; tx += every + RD(rng() * every * .5)) out.push({ x: tx * TS + 8, y: run.y, run });
    return out;
  }

  /* ============================================================ painted pieces (cached canvases) */
  const C = h => P32(h);
  // a house front the earth swallowed: brick, an arched door, a lattice window that still glows
  function facadeCv(v, pal) {
    const w = 34 + (v % 3) * 8, h = 40 + (v % 2) * 10;
    return prop('fac' + v + pal.mid, w, h, px => {
      const r = rngOf(v * 31 + 7);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const course = (y >> 2) & 1, brick = ((x + course * 3) % 6) === 0 || (y & 3) === 0;
        let c = brick ? pal.lo : hash(x >> 1, y >> 1, v) < .2 ? pal.hi : pal.mid;
        // the earth took the top in a slant
        const top = 4 + RD((x / w) * (v % 2 ? 10 : -6) + 6 * hash(x >> 3, 0, v));
        if (y < top) continue;
        if (y < top + 2) c = pal.lo;
        px.set(x, y, C(c));
      }
      // arched door
      const dx = 4 + (v % 3) * 3, dw = 10, dh = 18;
      for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) { const ax = x - dw / 2 + .5, ay = y - 5; if (y < 5 && ax * ax / 25 + ay * ay / 25 > 1) continue; px.set(dx + x, h - dh + y, C(y < 2 ? pal.lo : pal.door)); }
      for (let y = h - dh + 4; y < h; y += 4) for (let x = 1; x < dw - 1; x++) px.set(dx + x, y, C(pal.lo));
      // window with lattice
      const wx = dx + dw + 6, wy = h - dh - 2, ww = 10, wh = 9;
      if (wx + ww < w - 2) {
        for (let y = 0; y < wh; y++) for (let x = 0; x < ww; x++) px.set(wx + x, wy + y, C(((x + y) % 3 === 0 || (x - y + 30) % 3 === 0) ? pal.lat : pal.glow));
        for (let x = -1; x <= ww; x++) { px.set(wx + x, wy - 1, C(pal.lo)); px.set(wx + x, wy + wh, C(pal.hi)); }
      }
      // a carved beam over the door, cracks, a niche
      for (let x = dx - 2; x < dx + dw + 2; x++) px.set(x, h - dh - 2, C(pal.wood));
      for (let k = 0; k < 3; k++) { let x = r.int(2, w - 3), y = r.int(8, h - 4); for (let i = 0; i < 8; i++) { px.set(x, y, C(pal.lo)); x += r.int(-1, 1); y += 1; } }
    });
  }
  // mine timbers: two posts and a cap beam (the corridors read as tunnels)
  function timberCv(h) {
    return prop('timber' + h, 44, h, px => {
      const wood = ['#3a2a1c', '#5a4028', '#7a5a38'];
      for (const x0 of [2, 38]) for (let y = 3; y < h; y++) for (let x = 0; x < 4; x++) px.set(x0 + x, y, C(wood[x === 0 ? 2 : x === 3 ? 0 : 1]));
      for (let x = 0; x < 44; x++) for (let y = 0; y < 4; y++) px.set(x, y, C(wood[y === 0 ? 2 : y === 3 ? 0 : 1]));
      for (let k = 0; k < 6; k++) { px.set(6 + k, 4 + k, C(wood[1])); px.set(37 - k, 4 + k, C(wood[1])); }   // braces
      for (let y = 6; y < h; y += 9) { px.set(3, y, C('#2a1e14')); px.set(39, y, C('#2a1e14')); }
    });
  }
  function railCv(w) {
    return prop('rail' + w, w, 4, px => {
      for (let x = 0; x < w; x++) { px.set(x, 0, C('#8a8c90')); px.set(x, 1, C('#4a4c50')); if (x % 6 < 3) { px.set(x, 2, C('#4a3220')); px.set(x, 3, C('#2a1c12')); } }
    });
  }
  function cartCv() {
    return prop('cart', 20, 14, px => {
      for (let y = 0; y < 9; y++) for (let x = 1 + (y > 6 ? 1 : 0); x < 19 - (y > 6 ? 1 : 0); x++) px.set(x, y + 1, C(y === 0 ? '#9a9ca0' : (x % 5 === 0) ? '#3a3a3e' : '#5a5c60'));
      for (let x = 3; x < 17; x++) px.set(x, 0, C(hash(x, 0, 3) < .5 ? '#f4f8fc' : '#c8d0d8'));      // salt heaped in it
      for (const cx of [5, 15]) for (let y = 0; y < 4; y++) for (let x = -2; x <= 2; x++) if (x * x + (y - 1.5) ** 2 < 5) px.set(cx + x, 10 + y, C('#2a2a2e'));
    });
  }
  // a heap of empty tumars: little cloth triangles with cords, wax cracked
  function tumarHeapCv(v) {
    const w = 22 + (v % 3) * 6, h = 9 + (v % 2) * 3;
    return prop('tumh' + v, w, h + 2, px => {
      const r = rngOf(v * 17 + 3), cols = ['#8a7a6a', '#6a5a50', '#a89880', '#5a4a44', '#7a6a8a', '#9a6a4a'];
      for (let k = 0; k < w * 1.6; k++) {
        const x = r.int(0, w - 4), top = RD(h * (1 - Math.sin((x + 2) / w * PI)) * .9), y = r.int(top, h - 2), c = r.pick(cols);
        px.set(x, y, C(c)); px.set(x + 1, y, C(c)); px.set(x + 2, y, C(shade(c, -.25))); px.set(x + 1, y + 1, C(shade(c, -.3)));
        if (r.chance(.25)) px.set(x + 1, y - 1, C('#c8b890'));                    // cracked wax seal
      }
      for (let x = 0; x < w; x++) px.set(x, h + 1, C('#2a2220'));
    });
  }
  function steleCv(v) {
    const h = 14 + (v % 3) * 4;
    return prop('stele' + v, 9, h, px => {
      for (let y = 0; y < h; y++) for (let x = 0; x < 9; x++) { if (y < 3 && (x < 3 - y || x > 5 + y)) continue; px.set(x, y, C(x < 2 ? '#c8bcb0' : x > 6 ? '#6a6060' : hash(x, y, v) < .15 ? '#7a7070' : '#9a908a')); }
      for (let y = 5; y < h - 4; y += 3) for (let x = 2; x < 7; x++) if (hash(x, y, v + 4) < .6) px.set(x, y, C('#5a5250'));
    });
  }
  function tentCv(v) {
    const pals = [['#a8323a', '#e8dcc0'], ['#2a5a9a', '#e8dcc0'], ['#c88a2a', '#5a2a1a'], ['#3a6a4a', '#e8d0a0']], p = pals[v % 4];
    return prop('tent' + v, 40, 26, px => {
      for (let y = 0; y < 24; y++) { const hw = 3 + y * .75; for (let x = RD(20 - hw); x <= 20 + hw; x++) { const stripe = ((x + 40) >> 2) & 1; px.set(x, y + 1, C(y === 23 ? '#3a2a1c' : stripe ? p[0] : p[1])); } }
      for (let y = 10; y < 25; y++) for (let x = 17; x < 24; x++) if (Math.abs(x - 20.5) < (y - 9) * .3) px.set(x, y, C('#1a120c'));   // the opening
      px.set(20, 0, C('#5a4028')); px.set(20, 1, C('#5a4028'));
    });
  }
  function sackCv(v) {
    return prop('sacks' + v, 18, 9, px => { const r = rngOf(v + 40); for (let k = 0; k < 3; k++) { const bx = k * 6, h = r.int(6, 9), c = r.pick(['#a87a4a', '#8a6a4a', '#c8a070', '#7a5a3a']); for (let y = 0; y < h; y++) for (let x = 0; x < 6; x++) if (!(y === 0 && (x === 0 || x === 5))) px.set(bx + x, 9 - h + y, C(x === 0 ? shade(c, .2) : x === 5 ? shade(c, -.3) : c)); } });
  }
  // a person at rest (a robe, a cap; sitting or standing); drawn small and dark-on-light like the city's walkers
  function personCv(v, pal) {
    const sit = v % 2 === 0;
    return prop('pp' + v + pal[0], 8, 14, px => {
      const robe = pal[v % pal.length], cap = ['#e8e0cc', '#2a2a3a', '#a8323a', '#2a5a9a'][v % 4], skin = '#b07a50';
      if (sit) {
        for (let y = 6; y < 14; y++) for (let x = 1; x < 7; x++) if (!(y > 11 && x === 1)) px.set(x, y, C(x === 1 ? shade(robe, .2) : robe));
        for (let x = 0; x < 8; x++) px.set(x, 13, C(shade(robe, -.3)));
        px.rect(2, 2, 4, 4, C(skin)); px.rect(2, 1, 4, 2, C(cap));
      } else {
        for (let y = 5; y < 14; y++) for (let x = 2; x < 6; x++) px.set(x + (y > 11 ? (x < 4 ? -0 : 0) : 0), y, C(x === 2 ? shade(robe, .2) : robe));
        px.rect(2, 1, 4, 4, C(skin)); px.rect(2, 0, 4, 2, C(cap)); px.set(1, 8, C(robe)); px.set(6, 8, C(robe));
      }
    });
  }
  function boneArchCv(v) {     // the Sleeper's vertebra breaking out of the snow: a bone ring
    const w = 60 + (v % 2) * 20, h = 44;
    return prop('vert' + v, w, h, px => {
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const nx = (x - w / 2) / (w / 2), ny = (y - h) / h, d = nx * nx + ny * ny;
        if (d > 1 || d < .62) continue;
        const k = (d - .62) / .38;
        px.set(x, y, C(k < .25 ? '#f4f0e4' : k < .7 ? '#d8d0c0' : '#9a9488'));
        if (hash(x >> 1, y >> 1, v) < .08) px.set(x, y, C('#b8b0a0'));
      }
      for (let x = 0; x < w; x++) for (let y = h - 4; y < h; y++) if (px.has(x, y)) px.set(x, y, C('#f8fbff'));   // snow at the foot
    });
  }

  /* ============================================================ living decos */
  // a lamp on a post (lit by day too, brighter at night when the region keeps the clock)
  function postLamp(L, x, y, o) {
    o = Object.assign({ h: 30, post: '#2a1e14', postHi: '#4a3626' }, o);
    L.decos.push({ static: true, layer: 'back', bx: x - 4, by: y - o.h - 2, bw: 10, bh: o.h + 2, draw(ctx) { ctx.fillStyle = o.post; ctx.fillRect(x, y - o.h, 2, o.h); ctx.fillRect(x - 3, y - 2, 8, 2); ctx.fillRect(x, y - o.h, 6, 2); ctx.fillStyle = o.postHi; ctx.fillRect(x, y - o.h, 1, o.h); } });
    L.decos.push(lamp(x + 5, y - o.h + 1, { len: 3, body: o.body || '#8a6a3a', glass: o.glass || '#ffcf6a', core: o.core || '#fff4c0', light: o.lightC || '#ffb060', lightR: o.lightR || 92, glow: o.glow || '#ffb24a', glowR: 18 }));
  }
  function torch(L, x, y, o) {
    o = o || {};
    if (PK && PK.flameDeco) L.decos.push(PK.flameDeco(x, y - (o.dy || 22), { w: 5, h: 8, lightR: o.lightR || 88, lightC: o.lightC || '#ff9a5a', embers: true, draw(ctx) { ctx.fillStyle = '#2a1e14'; ctx.fillRect(RD(x) - 1, RD(y - (o.dy || 22)), 3, 8); ctx.fillStyle = '#5a4028'; ctx.fillRect(RD(x) - 2, RD(y - (o.dy || 22)) + 1, 5, 2); } }));
    else postLamp(L, x, y, {});
  }
  function brazier(L, x, y, o) {
    o = o || {};
    if (PK && PK.flameDeco) L.decos.push(PK.flameDeco(x, y - 9, { w: 8, h: 10, lightR: o.lightR || 110, lightC: o.lightC || '#ff9a5a', embers: true, draw(ctx) { ctx.fillStyle = '#2a201c'; ctx.fillRect(RD(x) - 6, y - 9, 13, 3); ctx.fillRect(RD(x) - 1, y - 6, 3, 6); ctx.fillRect(RD(x) - 4, y - 1, 9, 1); ctx.fillStyle = '#5a4a40'; ctx.fillRect(RD(x) - 6, y - 9, 13, 1); } }));
  }
  // a glowing crystal cluster (salt, ice, the Heart's nodules)
  function crystal(L, x, y, o) {
    const n = 2 + (x * 7 % 3), ph = x * .013;
    L.decos.push(light({
      x, y: y - 8, r: 24, layer: 'mid',
      draw(ctx, t) {
        const k = .75 + .25 * Math.sin(t * (o.pulse || 1.2) + ph);
        for (let i = 0; i < n; i++) {
          const cx = RD(x - 4 + i * 4), hh = 5 + ((i * 5 + x) % 6);
          ctx.fillStyle = o.dark; ctx.fillRect(cx, y - hh, 3, hh);
          ctx.fillStyle = o.col; ctx.fillRect(cx + 1, y - hh, 1, hh - 1);
          ctx.globalAlpha = k; ctx.fillStyle = o.core; ctx.fillRect(cx + 1, y - hh, 1, 2); ctx.globalAlpha = 1;
        }
      },
      fx(ctx, t) { G.Glow.add(x, y - 6, o.glowR || 16, o.col, (o.glowA || .45) * (.75 + .25 * Math.sin(t * (o.pulse || 1.2) + ph))); }
    }, { r: o.lightR || 60, color: o.col, a: o.a || .75, flicker: false }));
  }
  // a crow that sits on something and takes off when the hero comes close; it comes back after a while
  function crow(L, x, y) {
    const d = { x, y, r: 260, layer: 'mid', st: 'sit', t0: 0, fx0: 0, fy0: 0, ph: x * .1 };
    d.update = function (dd, t) {
      const pl = G.world && G.world.player; if (!pl) return;
      const near = Math.abs(pl.x - x) < 56 && Math.abs(pl.y - y) < 60;
      if (d.st === 'sit' && near) { d.st = 'fly'; d.t0 = t; d.dir = pl.x < x ? 1 : -1; if (G.Audio && Math.random() < .5) try { G.Audio.sfx('whoosh', { x, vol: .2, pitch: 1.8 }); } catch (e) { /* ignore */ } }
      if (d.st === 'fly' && t - d.t0 > 9 && !near) { d.st = 'back'; d.t0 = t; }
      if (d.st === 'back' && t - d.t0 > 6) d.st = 'sit';
    };
    d.draw = function (ctx, t) {
      let cx = x, cy = y, flap = 0;
      if (d.st === 'fly') { const k = Math.min(1, (t - d.t0) / 3); cx = x + d.dir * k * 160; cy = y - k * 120 - Math.sin(t * 3) * 4; flap = Math.sin(t * 30) > 0 ? 1 : 0; }
      else if (d.st === 'back') { const k = 1 - Math.min(1, (t - d.t0) / 6); cx = x + d.dir * k * 160; cy = y - k * 120; flap = Math.sin(t * 22) > 0 ? 1 : 0; }
      if (cy < (G.cam ? G.cam.y - 40 : -1e9)) return;
      const X = RD(cx), Y = RD(cy);
      ctx.fillStyle = '#141018';
      if (d.st === 'sit') {
        const peck = Math.sin(t * 2 + d.ph) > .92 ? 1 : 0;
        ctx.fillRect(X - 3, Y - 4, 6, 3); ctx.fillRect(X + 2, Y - 6 + peck, 3, 3); ctx.fillRect(X - 5, Y - 3, 2, 1); ctx.fillRect(X - 1, Y - 1, 1, 1); ctx.fillRect(X + 1, Y - 1, 1, 1);
        ctx.fillStyle = '#c8a040'; ctx.fillRect(X + 5, Y - 5 + peck, 1, 1);
      } else {
        ctx.fillRect(X - 1, Y - 1, 3, 2); ctx.fillRect(X - 4, Y - 1 - flap * 2, 3, 1); ctx.fillRect(X + 2, Y - 1 - flap * 2, 3, 1); ctx.fillRect(X - 6, Y - flap * 3, 2, 1); ctx.fillRect(X + 5, Y - flap * 3, 2, 1);
      }
    };
    L.decos.push(d);
  }
  // a rat that runs along a floor run now and then
  function rat(L, x0, x1, y) {
    const d = { x: (x0 + x1) / 2, y, r: (x1 - x0) / 2 + 30, layer: 'mid', ph: x0 * .37 };
    d.draw = function (ctx, t) {
      const cyc = (t * .25 + d.ph) % 3; if (cyc > 1) return;            // runs one third of the time
      const k = cyc, dir = Math.floor((t * .25 + d.ph) / 3) % 2 ? 1 : -1, X = RD(dir > 0 ? x0 + (x1 - x0) * k : x1 - (x1 - x0) * k), b = Math.sin(t * 40) > 0 ? 1 : 0;
      ctx.fillStyle = '#2a2224'; ctx.fillRect(X - 3, y - 3 - b, 6, 3); ctx.fillRect(X + dir * 3, y - 3, 2, 2); ctx.fillRect(X - dir * 6, y - 2, 3, 1);
      ctx.fillStyle = '#c8a8a0'; ctx.fillRect(X + dir * 4, y - 3, 1, 1);
    };
    L.decos.push(d);
  }
  // water drops from a crack in the ceiling, a ring on the floor
  function drip(L, x, y0, y1, col) {
    const per = 1.6 + (x % 7) * .25, fall = Math.sqrt(2 * (y1 - y0) / .2) / 60;
    L.decos.push({
      x, y: (y0 + y1) / 2, r: (y1 - y0) / 2 + 10, layer: 'mid',
      draw(ctx, t) {
        const k = ((t + x * .1) % per);
        ctx.fillStyle = col;
        if (k < fall) { const y = y0 + .5 * .2 * (k * 60) ** 2; ctx.fillRect(RD(x), RD(Math.min(y, y1 - 1)), 1, 2); }
        else if (k < fall + .25) { const s = RD((k - fall) * 16); ctx.globalAlpha = 1 - (k - fall) * 4; ctx.fillRect(RD(x) - s, y1 - 1, 1, 1); ctx.fillRect(RD(x) + s, y1 - 1, 1, 1); ctx.globalAlpha = 1; }
        else if (k > per - .4) { ctx.globalAlpha = (k - per + .4) * 2.5; ctx.fillRect(RD(x), y0, 1, 1); ctx.globalAlpha = 1; }
      }
    });
  }
  // a hanging root / vein / chain under a ceiling (swaying)
  function hang(L, x, y, len, o) {
    const ph = x * .07;
    L.decos.push({
      x, y: y + len / 2, r: len / 2 + 8, layer: o.layer || 'back',
      draw(ctx, t) {
        for (let i = 0; i < len; i++) {
          const sw = Math.sin(t * (o.speed || .9) + ph + i * .08) * i / len * (o.sway || 2);
          ctx.fillStyle = o.chain ? (i % 3 === 0 ? o.col2 : o.col) : (i > len - 3 ? o.tip || o.col : o.col);
          ctx.fillRect(RD(x + sw), y + i, o.w || 1, 1);
          if (o.branch && i % 9 === 4) ctx.fillRect(RD(x + sw) + (i % 18 ? 1 : -2), y + i, 2, 1);
        }
        if (o.pulse) { const k = .5 + .5 * Math.sin(t * 3 + ph); ctx.globalAlpha = k; ctx.fillStyle = o.pulse; ctx.fillRect(RD(x + Math.sin(t * (o.speed || .9) + ph + len * .08) * (o.sway || 2)) - 1, y + len - 1, 3, 3); ctx.globalAlpha = 1; }
      },
      fx(ctx, t) { if (o.pulse) G.Glow.add(x, y + len, 8, o.pulse, .35 * (.5 + .5 * Math.sin(t * 3 + ph))); }
    });
  }
  // moths round a light (fx: unlit, on top)
  function moths(L, x, y, col) {
    L.decos.push({ x, y, r: 30, layer: 'front', draw() { /* only fx */ }, fx(ctx, t) { ctx.fillStyle = col || '#fff0c8'; for (let i = 0; i < 3; i++) { const a = t * (2.2 + i * .7) + i * 2.1; ctx.fillRect(RD(x + Math.cos(a) * (6 + i * 3)), RD(y + Math.sin(a * 1.3) * (4 + i * 2)), 1, 1); } } });
  }
  // prayer flags / pennants on a line between two posts
  function flags(L, x0, x1, y, cols) {
    const n = Math.max(3, RD((x1 - x0) / 7));
    L.decos.push({ static: true, layer: 'back', bx: x0 - 1, by: y - 2, bw: 3, bh: 40, draw(ctx) { ctx.fillStyle = '#3a2a1c'; ctx.fillRect(x0, y, 2, 40); ctx.fillRect(x1, y, 2, 40); } });
    L.decos.push({
      x: (x0 + x1) / 2, y: y + 6, r: (x1 - x0) / 2 + 10, layer: 'back',
      draw(ctx, t) {
        const wind = ((G.level && G.level.biome && G.level.biome.wind) || .5);
        ctx.fillStyle = '#2a2018';
        for (let i = 0; i <= 20; i++) { const u = i / 20; ctx.fillRect(RD(x0 + (x1 - x0) * u), RD(y + 1 + Math.sin(u * PI) * 6), 1, 1); }
        for (let i = 1; i < n; i++) {
          const u = i / n, fx = x0 + (x1 - x0) * u, fy = y + 2 + Math.sin(u * PI) * 6, sw = Math.sin(t * 3 + i) * (1 + wind);
          ctx.fillStyle = cols[i % cols.length];
          ctx.fillRect(RD(fx), RD(fy), 3, 4); ctx.fillRect(RD(fx + sw * .5), RD(fy + 4), 2, 1);
        }
      }
    });
  }

  /* ============================================================ background helpers */
  // lifts a dark background out of the black: a coloured haze screened over the parallax (behind the world)
  const liftCache = {};
  function lift(key, stops, a) {
    return function (ctx) {
      let cv = liftCache[key];
      if (!cv) { cv = liftCache[key] = G.makeCanvas(G.W, G.H); const c = cv.ctx, g = c.createLinearGradient(0, 0, 0, G.H); for (const [p, col] of stops) g.addColorStop(p, col); c.fillStyle = g; c.fillRect(0, 0, G.W, G.H); }
      ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = a; ctx.drawImage(cv, 0, 0, G.W, G.H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    };
  }
  // far lights in the dark (windows, lamps, crystals): a slowly scrolling layer of soft points
  function farLights(seed, o) {
    const r = rngOf(seed), pts = [];
    for (let i = 0; i < o.n; i++) pts.push({ x: r.range(0, o.w), y: r.range(o.y[0], o.y[1]), s: r.range(.6, 1.4), ph: r.range(0, 6), c: r.pick(o.cols), win: r.chance(o.win || 0) });
    return {
      draw(ctx, cam, t) {
        const R = refOf(G.level), base = R.horizon - (cam.y - R.ref) * (o.fy || .08), off = -cam.x * o.fx;
        for (const p of pts) {
          let x = ((p.x + off) % o.w + o.w) % o.w; if (x > G.W + 20) x -= o.w; if (x < -20) continue;
          const y = base + p.y, k = o.twinkle ? .6 + .4 * Math.sin(t * o.twinkle + p.ph) : 1;
          ctx.globalAlpha = .5 * k; ctx.fillStyle = p.c;
          if (p.win) { ctx.fillRect(RD(x) - 1, RD(y) - 2, 3, 4); ctx.globalAlpha = .9 * k; ctx.fillRect(RD(x), RD(y) - 1, 1, 2); }
          else { ctx.fillRect(RD(x) - 1, RD(y), 3, 1); ctx.fillRect(RD(x), RD(y) - 1, 1, 3); ctx.globalAlpha = k; ctx.fillRect(RD(x), RD(y), 1, 1); }
          ctx.globalAlpha = .12 * k * p.s; ctx.beginPath(); ctx.arc(x, y, 6 * p.s, 0, 6.3); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
    };
  }

  /* ============================================================ the regions */
  // ---------------------------------------------------------- 9. the Swallowed Streets: a street under the earth that still has its windows
  {
    const pal = { lo: '#2a2026', mid: '#4a3a3a', hi: '#5e4c48', door: '#140c0e', lat: '#3a2414', glow: '#ffb860', wood: '#5a3a22' };
    onDecorate('w_streets', (L, r) => {
      for (const s of backSpots(L, r, 9, 52)) if (r() < .75) {
        const v = r.int(0, 5), cv = facadeCv(v, pal), x0 = s.x - 20, y0 = s.y - cv.height + 1;
        addStatic(L, cv, x0, y0);
        const wx = x0 + 4 + (v % 3) * 3 + 10 + 6 + 5, wy = y0 + cv.height - 18 - 2 + 4;   // the lattice window (see facadeCv)
        if (wx < x0 + cv.width - 4 && r() < .8) L.decos.push(light({ x: wx, y: wy, r: 14, layer: 'back', draw() { /* the glass is painted */ }, fx(ctx, t) { G.Glow.add(wx, wy, 9, '#ffb860', .35 + .05 * Math.sin(t * 3 + wx)); } }, { r: 46, color: '#ffa850', a: .75 }));
      }
      along(L, r, { gap: 16, density: .16,
        lit: (x, y) => { if (r() < .5) { postLamp(L, x, y, { h: 26 }); moths(L, x + 5, y - 22); } else torch(L, x, y, { lightC: '#ffa860' }); },
        props: (x, y, run, rr, tx) => {
          const q = rr();
          if (q < .35) { const cv = jarCv(rr.int(0, 3)); addStatic(L, cv, x, y - cv.height + 1); return 1; }
          if (q < .5) { addStatic(L, sackCv(rr.int(0, 3)), x - 9, y - 9); return 2; }
          if (q < .62 && run.x1 - tx > 4) { rat(L, x, x + 48, y); return 0; }
          if (q < .75) { const cv = carpetCv(rr.int(0, 3), 12, 16); addStatic(L, cv, x - 6, y - 40); return 1; }       // a rug still on its wall
          return 0;
        } });
      hangers(L, r, .18, (x, y, air, rr) => { if (rr() < .55) hang(L, x, y, rr.int(10, 26), { col: '#2a1e18', tip: '#4a3428', branch: true, sway: 1.5 }); else drip(L, x, y + 1, y + air * TS, '#8ab8c8'); });
    });
    onFog('w_streets', lift('streets', [[0, '#2a2234'], [.55, '#4a3442'], [1, '#6a4436']], .85));
    onBg('w_streets', () => [farLights(61, { n: 70, w: 900, y: [-170, 20], fx: .1, cols: ['#ffb860', '#ff9a40', '#ffd890'], win: .7, twinkle: .7 })]);
  }
  // ---------------------------------------------------------- 11. the Salt Mines: timbered galleries, rails, carts, white salt that glows
  {
    onDecorate('w_mines', (L, r) => {
      // timbers framing the galleries, rails along them
      for (const run of runs(L, 6, 4)) {
        for (let tx = run.x0 + 2; tx <= run.x1 - 4; tx += 7 + r.int(0, 3)) addStatic(L, timberCv(52), tx * TS - 6, run.y - 52, 'back');
        if (run.x1 - run.x0 >= 10 && r() < .7) { const w = (run.x1 - run.x0 - 2) * TS; addStatic(L, railCv(w), run.x0 * TS + 16, run.y - 3, 'back'); if (r() < .6) addStatic(L, cartCv(), (run.x0 + 3 + r.int(0, run.x1 - run.x0 - 6)) * TS, run.y - 15, 'back'); }
      }
      along(L, r, { gap: 14, density: .18,
        lit: (x, y) => { if (r() < .55) crystal(L, x, y, { col: '#d8f0ff', core: '#ffffff', dark: '#8aa0b8', lightR: 70, a: .7, pulse: .8 }); else { torch(L, x, y, { lightC: '#ffb070' }); moths(L, x, y - 26, '#fff4d8'); } },
        props: (x, y, run, rr) => {
          const q = rr();
          if (q < .3) { crystal(L, x, y, { col: '#c8e8ff', core: '#ffffff', dark: '#7a90a8', lightR: 34, a: .4, glowR: 10 }); return 1; }
          if (q < .45) { L.decos.push({ static: true, layer: 'back', bx: x - 6, by: y - 20, bw: 14, bh: 20, draw(ctx) { ctx.fillStyle = '#5a4028'; ctx.fillRect(x, y - 18, 1, 18); ctx.fillStyle = '#8a8c90'; ctx.fillRect(x - 5, y - 19, 11, 2); ctx.fillRect(x + 5, y - 18, 1, 2); } }); return 1; }   // a pick against the wall
          if (q < .6) { L.decos.push({ static: true, layer: 'back', bx: x - 10, by: y - 46, bw: 22, bh: 16, draw(ctx) { ctx.fillStyle = '#d8dce0'; for (let i = 0; i < 4; i++) for (let k = 0; k < 7; k++) ctx.fillRect(x - 10 + i * 6 + (k === 6 ? -3 : 0), y - 46 + (k === 6 ? 7 : 0) + (k < 6 ? 0 : 0), 1, k === 6 ? 1 : 14); } }); return 2; }   // tally marks, rows of seven
          if (q < .7) { rat(L, x, x + 40, y); return 0; }
          return 0;
        } });
      hangers(L, r, .2, (x, y, air, rr) => { if (rr() < .4) hang(L, x, y, rr.int(14, 30), { chain: true, col: '#5a5c60', col2: '#8a8c90', sway: .8, speed: .6 }); else if (rr() < .6) lampHang(L, x, y, '#ffcf8a'); else drip(L, x, y + 1, y + air * TS, '#e8f4ff'); });
    });
    onFog('w_mines', lift('mines', [[0, '#2a3440'], [.7, '#48545e'], [1, '#5a646c']], .8));
    onBg('w_mines', () => [farLights(85, { n: 60, w: 900, y: [-160, 30], fx: .12, cols: ['#e8f4ff', '#c8e0ff', '#ffd8a0'], twinkle: 1.6 })]);
  }
  function lampHang(L, x, y, col) { L.decos.push(lamp(x, y, { len: 10, body: '#5a4a3a', glass: col, core: '#fff8e0', light: col, lightR: 80, glow: col, glowR: 14 })); }
  // ---------------------------------------------------------- 16. the Heart: veins on the walls, tendrils, nodules that beat
  {
    onDecorate('w_heart', (L, r) => {
      along(L, r, { gap: 12, density: .2, clear: 3,
        lit: (x, y) => crystal(L, x, y, { col: '#ff4a6a', core: '#ffd0d8', dark: '#6a1424', lightR: 84, a: .8, pulse: 2.6, glowR: 20 }),
        props: (x, y, run, rr) => { if (rr() < .5) { crystal(L, x, y, { col: '#ff7a8a', core: '#ffe0e8', dark: '#4a0e1a', lightR: 30, a: .4, glowR: 8, pulse: 2.6 }); return 1; } return 0; } });
      hangers(L, r, .35, (x, y, air, rr) => hang(L, x, y, rr.int(12, Math.min(40, air * TS - 10)), { col: '#5a1224', tip: '#8a2234', w: rr() < .4 ? 2 : 1, sway: 2.5, speed: 1.4, pulse: rr() < .5 ? '#ff6a80' : null }));
      // veins on the back walls
      for (const s of backSpots(L, r, 6, 40)) {
        const x0 = s.x, y0 = s.y - 8, pts = []; let x = x0, y = y0; for (let i = 0; i < 18; i++) { pts.push([x, y]); x += r.int(-3, 3); y -= r.int(1, 3); }
        L.decos.push({ static: true, layer: 'back', bx: x0 - 30, by: y0 - 60, bw: 60, bh: 62, draw(ctx) { ctx.fillStyle = '#4a0c1a'; for (const [a, b] of pts) ctx.fillRect(a, b, 2, 3); ctx.fillStyle = '#7a1a2a'; for (const [a, b] of pts) ctx.fillRect(a, b, 1, 2); } });
      }
    });
    onFog('w_heart', lift('heart', [[0, '#3a0c18'], [.5, '#5a1424'], [1, '#7a2030'], ], .8));
    onBg('w_heart', () => [farLights(161, { n: 50, w: 900, y: [-180, 20], fx: .1, cols: ['#ff4a6a', '#ff8a9a', '#c82a4a'], twinkle: 2.6 })]);
  }
  // ---------------------------------------------------------- 15. the Founders' Well and 12. Old Yodgor: lifted out of the black too
  onFog('w_well', lift('well', [[0, '#0e1420'], [.6, '#1a2438'], [1, '#2a3048']], .45));
  onDecorate('w_well', (L, r) => along(L, r, { gap: 18, density: .06, lit: (x, y) => { const v = r(); if (v < .7) { L.decos.push(light({ x, y: y - 6, r: 20, layer: 'mid', draw(ctx, t) { ctx.fillStyle = '#e8e0c8'; ctx.fillRect(RD(x) - 1, y - 7, 3, 7); ctx.fillStyle = '#ffd890'; ctx.fillRect(RD(x), y - 9 - (Math.sin(t * 9 + x) > .7 ? 1 : 0), 1, 2); }, fx(ctx, t) { G.Glow.add(x, y - 9, 10, '#ffd890', .5); } }, { r: 70, color: '#ffd8a0', a: .8 })); } else brazier(L, x, y, { lightC: '#8ab8ff' }); } }));
  onFog('w_old', lift('old', [[0, '#1a0e10'], [.6, '#3a1a1a'], [1, '#4a2420']], .4));
  onDecorate('w_old', (L, r) => along(L, r, { gap: 18, density: .1,
    lit: (x, y) => brazier(L, x, y, { lightC: '#ff7a4a' }),
    props: (x, y, run, rr) => { if (rr() < .4) { const cv = jarCv(rr.int(0, 3), { lo: '#3a1a14', mid: '#6a2a1e', hi: '#9a4a2a', rim: '#c86a3a', dark: '#1a0a08' }); addStatic(L, cv, x, y - cv.height + 1); return 1; } return 0; } }));

  // ---------------------------------------------------------- 7. the Tower of Silence: ashen dusk, the dakhma on its hill, crows, tumar graves
  {
    const tw = A.places && A.places.yd_tower;
    const d = DEFS.w_tower;
    if (tw && d) {
      for (const k of ['drawSky', 'post', 'ambientFx']) if (tw[k]) d[k] = tw[k];
      d.ambient = '#d0c4cc'; d.shade = '#6a5a68'; d.bloom = .8;
      d.w2tod = { night: '#3e3a6e', dusk: '#ff9070' };
      const fog0 = tw.fogBehind;
      d.fogBehind = function () { if (fog0) fog0.apply(this, arguments); W2 && W2.skyNight && W2.skyNight(arguments[0]); };
      d.buildBackground = function (L) {
        L._artRef = null;
        const R = refOf(L);
        let out = [];
        try { out = tw.layers(L, R, 17).slice(); } catch (e) { console.error('[dress] tower bg', e); }
        out.splice(1, 0, memo('dakhma', () => {
          const px = new Px(1300, 120, true), r = rngOf(171);
          ridge(px, { seed: 172, base: 119, amp: 70, per: 1, oct: 4, col: '#3a2434', grad: '#24141e', rim: '#c87a6a', rimSide: -1, shape: u => .25 + .75 * Math.max(0, 1 - Math.abs(u - .38) * 3.2) });
          const cx = 494; let y = 0; while (y < 120 && !px.has(cx, y)) y++;
          for (let k = 0; k < 40; k++) { const hw = 58 - k * .22; for (let xx = RD(cx - hw); xx <= cx + hw; xx++) { const n = (xx - cx) / hw, v = n * .9 + (A.dth(xx, y - k) - .5) * .3; px.set(xx, y + 4 - k, P32(v < -.5 ? '#e0a088' : v < .1 ? '#8a5a5e' : '#4a2c3c')); } }
          for (let xx = cx - 50; xx <= cx + 50; xx += 4) { px.set(xx, y - 36, P32('#24141e')); px.set(xx, y - 37, P32('#24141e')); }
          px.rect(cx - 5, y - 14, 10, 18, P32('#140a12'));
          for (let k = 0; k < 26; k++) px.rect(cx - 60 - k * 2, y + 4 + RD(k * .9), 3, 1, P32('#5a3644'));            // the ramp up to the door
          for (let i = 0; i < 9; i++) { const x = r.int(40, 1260), yy = (() => { let q = 0; while (q < 119 && !px.has(x, q)) q++; return q; })(); for (let k = 0; k < 12; k++) px.set(x, yy - k, P32('#24141e')); px.rect(x - 3, yy - 12, 7, 1, P32('#24141e')); }   // grave poles
          return layer(px.canvas(), { fx: .12, fy: .08, base: R.horizon + 18, fill: '#24141e' });
        }));
        return out;
      };
    }
    onDecorate('w_tower', (L, r) => {
      along(L, r, { gap: 20, density: .2,
        lit: (x, y) => { if (r() < .6) brazier(L, x, y, { lightC: '#ff8a5a', lightR: 100 }); else { L.decos.push(light({ x, y: y - 4, r: 16, layer: 'mid', draw(ctx, t) { for (let i = 0; i < 3; i++) { ctx.fillStyle = '#e8dcc8'; ctx.fillRect(RD(x) - 4 + i * 4, y - 4 - i % 2, 2, 4 + i % 2); ctx.fillStyle = '#ffd890'; ctx.fillRect(RD(x) - 4 + i * 4, y - 6 - i % 2 - (Math.sin(t * 8 + i + x) > .8 ? 1 : 0), 1, 2); } }, fx() { G.Glow.add(x, y - 6, 12, '#ffc070', .45); } }, { r: 64, color: '#ffc080', a: .8 })); } },
        props: (x, y, run, rr, tx) => {
          const q = rr();
          if (q < .3) { const cv = tumarHeapCv(rr.int(0, 5)); addStatic(L, cv, x - cv.width / 2, y - cv.height + 1); if (rr() < .5) crow(L, x + rr.int(-6, 6), y - cv.height + 2); return 2; }
          if (q < .5) { const cv = steleCv(rr.int(0, 5)); addStatic(L, cv, x - 4, y - cv.height + 1); if (rr() < .35) crow(L, x, y - cv.height); return 1; }
          if (q < .62 && run.x1 - tx > 4) { const x1 = x + 40; flags(L, x, x1, y - 38, ['#8a7a6a', '#a89880', '#6a5a60', '#c8b8a0']); return 3; }   // cords of tumars between two poles
          if (q < .7) { crow(L, x, y); return 1; }
          return 0;
        } });
    });
  }
  // ---------------------------------------------------------- 6. the Rabat: the caravanserai's life on the salt
  onDecorate('w_rabat', (L, r) => {
    along(L, r, { gap: 22, density: .16,
      lit: (x, y) => { postLamp(L, x, y, { h: 32, post: '#5a4430', postHi: '#8a6a48' }); },
      props: (x, y, run, rr, tx) => {
        const q = rr();
        if (q < .2 && run.x1 - tx > 4) { addStatic(L, tentCv(rr.int(0, 3)), x - 20, y - 26); if (rr() < .6) addStatic(L, personCv(rr.int(0, 7), ['#a8323a', '#2a5a9a', '#6a4a2a', '#e8dcc0']), x + 16, y - 14); return 4; }
        if (q < .4) { addStatic(L, sackCv(rr.int(0, 3)), x - 9, y - 9); return 2; }
        if (q < .55) { addStatic(L, personCv(rr.int(0, 7), ['#a8323a', '#2a5a9a', '#6a4a2a', '#c88a2a']), x - 4, y - 14); return 1; }
        if (q < .65 && run.x1 - tx > 3) { const cv = carpetCv(rr.int(0, 3), 22, 3); addStatic(L, cv, x - 11, y - 4); if (rr() < .7) addStatic(L, jarCv(rr.int(0, 3), { lo: '#5a3a28', mid: '#8a5a3a', hi: '#b8804a', rim: '#d8a870', dark: '#2a1a10' }), x + 2, y - 15); return 3; }   // goods spread on a rug
        return 0;
      } });
  });
  // ---------------------------------------------------------- 13. the Spine: the Sleeper's vertebrae out of the snow, ice that glows
  onDecorate('w_spine', (L, r) => {
    for (const s of backSpots(L, r, 22, 46)) if (r() < .6) addStatic(L, boneArchCv(r.int(0, 3)), s.x - 34, s.y - 44 + 2);
    along(L, r, { gap: 20, density: .08,
      lit: (x, y) => crystal(L, x, y, { col: '#9ad8ff', core: '#ffffff', dark: '#3a6a9a', lightR: 76, a: .75, pulse: .7 }),
      props: (x, y, run, rr) => { if (rr() < .4) { crystal(L, x, y, { col: '#8ac8f0', core: '#e8f8ff', dark: '#2a5a8a', lightR: 30, a: .4, glowR: 8, pulse: .7 }); return 1; } return 0; } });
  });
  // ---------------------------------------------------------- 14. the Withers: dawn above a sea of clouds, the last caravanserai under the sky
  {
    const d = DEFS.w_withers;
    if (d) {
      const SKY = [[0, '#2a3a7a'], [.3, '#6a6aa8'], [.55, '#d88aa0'], [.75, '#ffb48a'], [.9, '#ffe0a8'], [1, '#fff4d8']];
      d.drawSky = skyDraw(() => paintSky(SKY, { seed: 141, stars: 40, starH: .25, sun: { x: 300, y: 196, r: 14, core: '#ffffff', rim: '#fff0c8', halo: '#ffc890', haloA: .8 }, glow: [{ x: 300, y: 210, rx: 460, ry: 120, col: '#ffb070', a: .6 }] }));
      d.ambient = '#f0e0e8'; d.shade = '#8a7a9a'; d.deepShade = '#2a2034'; d.bloom = .9; d.wind = .9;
      d.buildBackground = function (L) {
        L._artRef = null;
        const R = refOf(L), seed = 141;
        return memo('withers' + seed, () => {
          const out = [];
          const mt = new Px(1600, 120, true);
          ridge(mt, { seed: seed + 1, base: 118, amp: 90, per: 4, oct: 5, col: '#7a6a9a', grad: '#c89ab0', gradH: 70, rim: '#fff0e0', snow: { col: '#fff4ec', col2: '#e8c8d0', depth: 22 } });
          out.push(layer(mt.canvas(), { fx: .03, fy: .03, base: R.horizon - 40 }));
          // the sky caravanserai on a far crag, banners and domes catching the dawn
          const cs = new Px(1400, 130, true), r = rngOf(seed + 3);
          const dp = { lo: '#2a6a8a', mid: '#3a96b0', hi: '#8ad0e0', rim: '#e8fcff', drum: '#e8c8b0', drumD: '#b8908a', gold: '#ffd070', win: '#ff9a50' };
          for (const x0 of [180, 900]) {
            ridge(cs, { seed: seed + 5 + x0, base: 129, amp: 40, per: 1, col: '#5a4a6a', rim: '#ffd0b0', shape: u => Math.max(0, 1 - Math.abs(u * 1400 - x0 - 150) / 220) });
            fortWall(cs, x0, x0 + 300, 92, 26, { lo: '#b88a7a', mid: '#e8c0a8', hi: '#ffe8d0', win: '#ff9a50' }, { lx: 1, step: 100, br: 8, courses: true });
            dome(cs, x0 + 90, 66, 14, dp, { kind: 'melon', ribs: 10, lx: 1, tiles: true });
            dome(cs, x0 + 210, 68, 10, dp, { kind: 'bowl', lx: 1, drum: 3 });
            minaret(cs, x0 + 320, 92, 60, 8, 6, { lo: '#b88a7a', mid: '#e8c0a8', hi: '#ffe8d0', band: '#3a96b0', bandHi: '#8ad0e0', win: '#ff9a50', gold: '#ffd070' }, { lx: 1, bands: 8, brick: true });
            for (let k = 0; k < 6; k++) { const fx = x0 + 20 + k * 50; for (let y = 0; y < 14; y++) cs.set(fx, 78 - y, P32('#5a4030')); cs.rect(fx + 1, 64, 6, 4, P32(r.pick(['#c8323a', '#ffd070', '#3a6aaa', '#e8e0d0']))); }
          }
          out.push(layer(cs.canvas(), { fx: .08, fy: .06, base: R.horizon + 4 }));
          // the sea of clouds below the edge
          const cl = new Px(1000, 70, true);
          for (let x = 0; x < 1000; x++) { const top = 20 + 14 * Math.sin(x * .02) + 8 * Math.sin(x * .071 + 1) + 4 * hash(x >> 2, 0, 9); for (let y = RD(top); y < 70; y++) cl.set(x, y, P32(y < top + 2 ? '#fff4ec' : y < top + 8 ? '#f4d8d8' : y < top + 22 ? '#d8b0c0' : '#a888a8')); }
          out.push(layer(cl.canvas(), { fx: .14, fy: .1, base: R.horizon + 40, drift: .25, fill: '#a888a8' }));
          return out;
        });
      };
      d.fogBehind = hazeDraw([[0, '#ffffff', 0], [.6, '#ffe0d0', .08], [.8, '#ffc8b0', .22], [1, '#c8a0b8', .25]]);
      d.post = all(grade('#ffb090', .16), vignette('rgba(40,20,40,1)', .3));
    }
    onDecorate('w_withers', (L, r) => {
      along(L, r, { gap: 18, density: .16,
        lit: (x, y) => { if (r() < .5) brazier(L, x, y, { lightC: '#ffa060' }); else postLamp(L, x, y, { h: 30, body: '#c8902a', lightC: '#ffc080' }); },
        props: (x, y, run, rr, tx) => {
          const q = rr();
          if (q < .25 && run.x1 - tx > 5) { flags(L, x, x + 56, y - 40, ['#c8323a', '#ffd070', '#3a6aaa', '#e8e0d0', '#3a8a5a']); return 4; }
          if (q < .42 && run.x1 - tx > 4) { addStatic(L, tentCv(rr.int(0, 3) + 1), x - 20, y - 26); return 4; }
          if (q < .55) { addStatic(L, personCv(rr.int(0, 7), ['#3a6aaa', '#c8323a', '#e8e0d0', '#8a5a2a']), x - 4, y - 14); return 1; }
          if (q < .65) { addStatic(L, sackCv(rr.int(0, 3)), x - 9, y - 9); return 2; }
          return 0;
        } });
    });
  }
  // ---------------------------------------------------------- the rest get the light rule only (no long dark stretches)
  for (const [id, lc] of [['w_cistern', '#8ae0e0'], ['w_cloister', '#d8e4ff'], ['w_ark', '#ffd080'], ['w_dream', '#e0b0ff'], ['w_wedding', '#ffc090'], ['w_sand', '#ffd080'], ['w_house', '#ffd8a0']]) {
    onDecorate(id, (L, r) => along(L, r, { gap: 24, density: 0, lit: (x, y) => postLamp(L, x, y, { h: 28, lightC: lc, glass: lc, glow: lc }) }));
  }

  bright('w_streets', 2.1, '#6a4a48', .32);
  bright('w_mines', 1.9, '#6a7480', .32);
  bright('w_heart', 1.4, '#7a2a3a', .3);
  bright('w_well', 1.7, '#3a4a6a', .25);
  bright('w_old', 1.5, '#5a3030', .22);
  bright('w_cistern', 1.4, '#2a5a5a', .2);
  DRESS.along = along; DRESS.lift = lift; DRESS.bright = bright;
})();
}
