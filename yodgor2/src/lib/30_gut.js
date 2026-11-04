/* A genuinely new biome: "dev_gut" — water tunnels inside the sleeping giant.
 * Rock-flesh walls, bone-rib platforms, bone-teeth spike pits, glowing water channels carved into floors,
 * glowing nodules on the walls, hanging tendrils, drips, heartbeat pulse. Room generator (LevelGen.generate).
 * Needs biomekit.js only for K.floorRuns (and the postGen hook used to carve channels).
 */
(function () {
  'use strict';
  const G = window.G, K = G.BiomeKit, U = G.U, TS = G.TS, T = G.T, Art = G.Art, PK = G.PixKit;
  const R = Math.round, C = Art.C, shadeP = Art.shadeP;

  // heartbeat: two quick bumps every 1.4 s (0..1)
  const beat = t => { const p = (t % 1.4) / 1.4; return Math.max(Math.exp(-((p - .05) ** 2) / .0012), .6 * Math.exp(-((p - .2) ** 2) / .0015)); };

  /* ------------------------------------------------ tiles (Art.pixTile: draw into a 16x16 Pix + padding) */
  const P = {
    rock: ['#5a4450', '#4a3844', '#3c2c38'], flesh: ['#8a3442', '#74283a', '#5e2032'], vein: '#c24a5c', crack: '#24161e',
    wet: '#f0a0b0', wet2: '#c86a7c', under: '#1e0a12', drip: '#7ae8e0', bone: ['#f2e8d6', '#d8c8b0', '#b4a088', '#7a6454'],
    wall: ['#4a2230', '#3e1a28', '#341620'], wallVein: '#6a2a3c', pore: '#1c0a12'
  };
  const DK = [1, 1, .84, .7, .58, .5, .46, .44, .42];
  const fleshAt = (x, y) => U.noise2(x / 22, y / 14, 61) > .52;
  const solidTile = Art.pixTile((pix, info, ox, oy) => {
    const dk = DK[Math.min(8, info.depth)];
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const wx = info.x + x, wy = info.y + y, fl = fleshAt(wx, wy), n = U.noise2(wx / 9, wy / 7, 62);
      const pal = fl ? P.flesh : P.rock;
      let c = C(pal[n > .62 ? 0 : n > .38 ? 1 : 2]);
      const v = Math.abs(U.noise2(wx / 7, wy / 6, 63) - .5);
      if (v < .025) c = C(fl ? P.vein : P.crack);
      else if (fl && U.hash(wx, wy, 64) < .03) c = C('#a8485a');
      pix.set(ox + x, oy + y, shadeP(c, dk));
    }
    if (info.up) for (let x = 0; x < 16; x++) { // glossy wet membrane + short drips
      const wx = info.x + x;
      pix.set(ox + x, oy, C(P.wet)); pix.set(ox + x, oy + 1, C(P.wet2));
      if (U.hash(wx, info.ty, 65) < .18) { const n = 1 + Math.floor(3 * U.hash(wx, info.ty, 66)); for (let k = 0; k < n; k++) pix.set(ox + x, oy + 2 + k, C(P.wet2)); }
    }
    if (info.left) for (let y = 0; y < 16; y++) pix.set(ox, oy + y, shadeP(pix.get(ox, oy + y), .7));
    if (info.right) for (let y = 0; y < 16; y++) pix.set(ox + 15, oy + y, shadeP(pix.get(ox + 15, oy + y), .6));
    if (info.down) for (let x = 0; x < 16; x++) { // ceiling underside: dark lip + glowing beads hanging below the tile
      pix.set(ox + x, oy + 15, C(P.under)); pix.set(ox + x, oy + 14, shadeP(pix.get(ox + x, oy + 14), .6));
      const h = U.hash(info.x + x, info.ty, 67);
      if (h < .07) { pix.set(ox + x, oy + 16, C(P.wet2)); if (h < .035) pix.set(ox + x, oy + 17, C(P.drip)); }
    }
  }, 4);
  const solid = PK.deepWrap(solidTile, ['#2a1018', '#26101a', '#200c16'], { minDepth: 5, dk: [1, 1, .9, .8, .72, .66, .62, .6, .58] });
  const plat = Art.pixTile((pix, info, ox, oy) => { // cartilage / rib beam with vertebra joints
    for (let x = 0; x < 16; x++) {
      const wx = info.x + x, joint = (wx % 8 + 8) % 8 === 0;
      const col = [P.bone[0], P.bone[1], P.bone[1], P.bone[2], P.bone[3]];
      for (let y = 0; y < 5; y++) pix.set(ox + x, oy + y, C(joint && y > 0 && y < 4 ? P.bone[3] : col[y]));
      if (!joint && U.hash(wx, info.ty, 68) < .1) pix.set(ox + x, oy + 2, C(P.bone[0]));
    }
    if (info.leftT !== T.PLAT) { pix.rect(ox, oy, 2, 5, C(P.bone[3])); pix.set(ox, oy + 5, C(P.bone[3])); }
    if (info.rightT !== T.PLAT) { pix.rect(ox + 14, oy, 2, 5, C(P.bone[3])); pix.set(ox + 15, oy + 5, C(P.bone[3])); }
  }, 4);
  const back = Art.pixTile((pix, info, ox, oy) => { // muscle-fibre wall with pores and faint veins
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const wx = info.x + x, wy = info.y + y, n = U.noise2(wx / 30, wy / 20, 71);
      const stripe = ((wx + R(6 * U.noise2(wx / 40, wy / 12, 72))) % 7 + 7) % 7;
      let c = P.wall[stripe < 2 ? 2 : n > .55 ? 0 : 1];
      if (Math.abs(U.noise2(wx / 11, wy / 9, 73) - .5) < .02) c = P.wallVein;
      if (U.hash(wx >> 1, wy >> 1, 74) < .012) c = P.pore;
      pix.set(ox + x, oy + y, C(c));
    }
  }, 0);
  const spike = Art.pixTile((pix, info, ox, oy) => { // bone teeth on gums
    for (let k = 0; k < 4; k++) {
      const bx = ox + 4 * k, h = 6 + ((info.tx * 3 + k) % 3) * 2;
      for (let y = 0; y < h; y++) { const w = Math.max(0, 1.6 * (1 - y / h)); for (let x = R(2 - w); x <= R(1 + w); x++) pix.set(bx + x, oy + 16 - 3 - y, C(x < 2 ? P.bone[0] : P.bone[2])); }
    }
    pix.rect(ox, oy + 13, 16, 3, C('#7a2232')); pix.rect(ox, oy + 13, 16, 1, C('#b84a5a'));
  }, 4);

  /* ------------------------------------------------ decos */
  function channelDeco(x0, x1, ty, ph) { // glowing water in a 1-tile trench; one deco per <=4 tiles so each has a light
    const X0 = x0 * TS, X1 = (x1 + 1) * TS, top = ty * TS + 5, bot = (ty + 1) * TS;
    return {
      x: (X0 + X1) / 2, y: top, r: (X1 - X0) / 2 + 30, layer: 'front',
      light: { r: 40 + (X1 - X0) * .3, color: '#3ae0d0', a: .8, flicker: true, dy: 2 },
      draw(ctx, t) {
        ctx.globalAlpha = .5; ctx.fillStyle = '#16707e'; ctx.fillRect(X0, top + 1, X1 - X0, bot - top - 1);
        ctx.globalAlpha = .85; ctx.fillStyle = '#5af0e2';
        for (let x = X0; x < X1; x += 4) ctx.fillRect(x, top + R(Math.sin(x * .2 + t * 3 + ph)), 4, 1);
        ctx.fillStyle = '#e0fffa';
        for (let x = X0 + ((t * 18 + ph * 7) % 19); x < X1 - 2; x += 19) ctx.fillRect(R(x), top, 3, 1);
        ctx.globalAlpha = 1;
      },
      fx(ctx, t) { for (let x = X0 + 10; x < X1; x += 26) G.Glow.add(x, top + 3, 16, '#3ae0d0', .35 + .1 * Math.sin(t * 2 + x)); }
    };
  }
  function tendril(x, y, len, seed, glowTip) {
    return {
      x, y: y + len / 2, r: len + 10, layer: 'mid',
      draw(ctx, t) {
        for (let i = 0; i < len; i++) {
          const u = i / len, sx = Math.sin(t * 1.1 + seed + i * .12) * u * 3;
          ctx.fillStyle = u < .3 ? '#6a2432' : u < .8 ? '#8a3444' : '#b8566a';
          ctx.fillRect(R(x + sx), y + i, u < .5 ? 2 : 1, 1);
        }
      },
      fx(ctx, t) { if (glowTip) G.Glow.add(x + Math.sin(t * 1.1 + seed + len * .12) * 3, y + len, 9, '#ff8ab0', .5 + .3 * beat(t)); }
    };
  }
  function node(x, y, col, r) { // bioluminescent nodule on the back wall (lights added in biome.lights)
    return {
      x, y, r: 30, layer: 'back', node: true, col,
      draw(ctx, t) {
        const b = beat(t);
        ctx.fillStyle = U.shade(col, -.5); ctx.fillRect(x - r, y - r + 1, 2 * r, 2 * r - 2); ctx.fillRect(x - r + 1, y - r, 2 * r - 2, 2 * r);
        ctx.fillStyle = col; ctx.fillRect(x - r + 1, y - r + 1, 2 * r - 2, 2 * r - 2);
        ctx.fillStyle = b > .5 ? '#ffffff' : U.shade(col, .6); ctx.fillRect(x - 1, y - 1, 2, 2);
      },
      fx(ctx, t) { G.Glow.add(x, y, 10 + 4 * r, col, .35 + .4 * beat(t)); }
    };
  }

  /* ------------------------------------------------ background (seen through holes in the back wall) */
  function ribsCanvas(seed) { // receding rib arches, 480 wide, repeats horizontally
    return Art.paint(480, 270, pix => {
      const rng = U.RNG(seed);
      for (let k = 0; k < 4; k++) {
        const cx = 60 + k * 120 + rng.int(-10, 10), w = 34 + rng.int(0, 14), col = C(k % 2 ? '#2a0c18' : '#240a14'), hi = C('#4a1a2a');
        for (let y = 0; y < 270; y++) {
          const u = y / 270, off = Math.sin(u * Math.PI) * w; // bow outwards in the middle
          for (const s of [-1, 1]) { const x = R(cx + s * (w - off * .6)); for (let d = -3; d <= 3; d++) pix.set(x + d, y, d === -3 * s ? hi : col); }
        }
        for (let y = 20; y < 250; y += 9) if (rng.chance(.5)) pix.set(cx + rng.int(-w, w) * .3, y, C('#ff6a9a'));
      }
    });
  }
  function membraneCanvas(seed) {
    return Art.paint(640, 140, pix => {
      const rng = U.RNG(seed);
      for (let x = 0; x < 640; x++) {
        const h = 30 + 50 * U.fbm1(x * .02, seed % 97, 3);
        for (let y = 0; y < h; y++) pix.set(x, y, C(y > h - 2 ? '#5a2032' : '#1e0810'));
        if (rng.chance(.04)) { const l = rng.int(10, 60); for (let y = R(h); y < h + l; y++) pix.set(x, y, C('#2a0c16')); }
      }
    });
  }

  /* ------------------------------------------------ the biome */
  const def = {
    id: 'dev_gut', name: 'Утроба Спящего', subtitle: 'Светящиеся протоки под кожей дэва',
    music: 'zindan', enemyBiome: 'zindan',
    ambient: '#a07c90', shade: '#7a5a70', deepShade: '#140408', bloom: 1, wind: .2, sunDir: [0, -1],
    dust: ['#8a3a4a', '#6a2a3a', '#c86a7a'], rock: ['#8a3442', '#5a4450', '#f2e8d6'],
    gen: {
      cols: 7, rows: 3, rw: 30, rh: 18, vertChance: .55, sideRooms: .45, enemies: [2, 3], outdoor: false,
      spikes: true, hang: true, loops: .35, features: { raise: 3, pit: 2, plats: 4, pillar: 1.5, deck: 2, low: 2, none: 1 }
    },
    arena: { w: 50, h: 24 },
    tiles: { solid, plat, back, spike },
    // holes in the back wall: the deep tunnels behind show through
    backMask: (L, x, y, v) => v && !(U.noise2(x / 10, y / 7, (L.seed % 89) + 3) > .7 && L.get(x, y + 1) === T.AIR),
    lore: ['Вода внутри Спящего тёплая и светится. Говорят, это его сны текут к сердцу.',
      'Здесь нет ни дня, ни ночи — только удары сердца. Считай их, если хочешь знать время.'],
    // carve 1-tile trenches for glowing channels (before decorate/bake; keep spawns/objects dry)
    postGen(L, rng, genName) {
      L.channels = [];
      if (genName !== 'generate') return;
      const busy = new Set();
      for (const o of L.objects.concat(L.spawns)) { const tx = Math.floor(o.x / TS); for (let k = -3; k <= 3; k++) busy.add(tx + k); }
      for (const run of K.floorRuns(L, 7, 3)) {
        if (!rng.chance(.55)) continue;
        const ty = run.ty + 1; // the floor row
        let a = run.x0 + 1, b = run.x1 - 1;
        while (a <= b && busy.has(a)) a++;
        while (b >= a && busy.has(b)) b--;
        if (b - a < 3) continue;
        let ok = true;
        for (let x = a; x <= b; x++) if (L.get(x, ty) !== T.SOLID || L.get(x, ty + 1) !== T.SOLID || busy.has(x)) ok = false;
        if (!ok) continue;
        for (let x = a; x <= b; x++) L.set(x, ty, T.AIR);
        L.channels.push({ x0: a, x1: b, ty });
      }
      for (let i = 0; i < L.tiles.length; i++) if (L.tiles[i] !== T.SOLID && !L.back[i]) L.back[i] = 1; // trenches get a back wall
      if (G.Biomes.defs.dev_gut.backMask) for (let i = 0; i < L.tiles.length; i++) { const x = i % L.w, y = (i / L.w) | 0; L.back[i] = G.Biomes.defs.dev_gut.backMask(L, x, y, L.back[i]) ? 1 : 0; }
      L.computeSpots(); L.computeDepth();
    },
    decorate(L, rng) {
      const D = L.decos;
      for (const ch of L.channels || []) for (let x = ch.x0; x <= ch.x1; x += 4) D.push(channelDeco(x, Math.min(ch.x1, x + 3), ch.ty, rng.range(0, 6)));
      // tendrils from ceilings
      let next = 0;
      for (const s of L.spots.ceil.slice().sort((a, b) => a.tx - b.tx)) {
        if (s.tx < next || !rng.chance(.25)) continue;
        let room = 0; while (room < 8 && L.get(s.tx, s.ty + room) === T.AIR) room++;
        if (room < 5) continue;
        D.push(tendril(s.x + rng.int(-5, 5), s.y, rng.int(10, Math.min(46, (room - 3) * 16)), rng.range(0, 9), rng.chance(.4)));
        next = s.tx + rng.int(2, 6);
      }
      // glowing nodules on back walls (2+ tiles from any solid)
      L.nodes = [];
      for (let i = 0, n = Math.round(L.w * L.h / 40); i < n; i++) {
        const x = rng.int(2, L.w - 3), y = rng.int(2, L.h - 3);
        if (!L.back[y * L.w + x] || L.get(x, y) !== T.AIR) continue;
        if (L.nodes.some(o => Math.abs(o.x - x * TS) < 80 && Math.abs(o.y - y * TS) < 64)) continue;
        let clear = true; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (L.get(x + dx, y + dy) === T.SOLID) clear = false;
        if (!clear) continue;
        const n = node(x * TS + rng.int(2, 13), y * TS + rng.int(2, 13), rng.pick(['#ff7aa8', '#ff9ac0', '#5af0e0']), rng.int(1, 3));
        D.push(n); L.nodes.push(n);
      }
      // bucket ceiling spots by 8-tile columns for cheap drip spawning
      L.dripCols = [];
      for (const s of L.spots.ceil) (L.dripCols[s.tx >> 3] = L.dripCols[s.tx >> 3] || []).push(s);
    },
    buildBackground(L) {
      return [
        { canvas: ribsCanvas(L.seed + 1), fx: .12, fy: .05, y: 0 },
        { draw(ctx, cam, t) { const b = beat(t); ctx.globalAlpha = .12 + .2 * b; ctx.fillStyle = '#ff3a6a'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; } },
        { canvas: ribsCanvas(L.seed + 2), fx: .3, fy: .12, y: -10, alpha: .9 },
        { canvas: membraneCanvas(L.seed + 3), fx: .45, fy: .2, y: -20 }
      ];
    },
    drawSky(ctx, cam, t) {
      if (!this._sky) { this._sky = G.makeCanvas(G.W, G.H); Art.bandGrad(this._sky.ctx, 0, 0, G.W, G.H, [[0, '#050104'], [.5, '#14040c'], [1, '#2c0a18']], 14, true); }
      ctx.drawImage(this._sky, 0, 0);
    },
    fogBehind(ctx) { ctx.globalAlpha = .3; ctx.fillStyle = '#1a0410'; ctx.fillRect(0, 0, G.W, G.H); ctx.globalAlpha = 1; },
    lights(Light, cam, t, L) {
      const b = beat(t);
      for (const n of L.nodes || []) Light.add(n.x, n.y, 34 + 10 * b, n.col, .55 + .35 * b);
    },
    post(ctx, cam, t) {
      const b = beat(t);
      ctx.globalCompositeOperation = 'soft-light'; ctx.globalAlpha = .1 + .12 * b; ctx.fillStyle = '#ff2a5a'; ctx.fillRect(0, 0, G.W, G.H);
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    },
    ambientFx(world, cam, t) {
      const L = G.level;
      if (L.dripCols && Math.random() < .35) { // drips from on-screen ceilings
        const c0 = Math.floor(cam.x / TS) >> 3, c1 = Math.floor((cam.x + G.W) / TS) >> 3, col = L.dripCols[U.randi(c0, c1)];
        const s = col && col[Math.floor(Math.random() * col.length)];
        if (s && G.onScreen(s.x, s.y, 0)) {
          const glow = Math.random() < .4, color = glow ? '#7af0e6' : '#c86a7a';
          G.FX.spawn({
            x: s.x + U.rand(-6, 6), y: s.y + 2, vy: .3, grav: .14, drag: 1, life: 240, shape: 'rect', w: 1, h: 2, size: 1, color, glow, glowR: glow ? 4 : 0, fade: false,
            update(p) {
              if (G.level.solidPx(p.x, p.y + 1)) {
                p.t = p.life;
                G.FX.burst(p.x, p.y - 1, 4, { speed: .9, life: 14, size: 1, color: p.color, grav: .15, angle: -Math.PI / 2, spread: 2.4, glow: p.glow, glowR: 0 });
              }
            }
          });
        }
      }
      if (Math.random() < .06) G.FX.spawn({ // spores
        x: cam.x + U.rand(0, G.W), y: cam.y + U.rand(0, G.H), vx: U.rand(-.08, .08), vy: -U.rand(.02, .1), drag: 1, life: 320, size: 1,
        color: U.choose(['#ff9ac0', '#7af0e6']), glow: true, glowR: 4, alpha: .8
      });
    }
  };
  G.Biomes.register(def);
  if (G.STORY) {
    if (G.STORY.aksakal) G.STORY.aksakal.dev_gut = ['Под кожей Спящего текут светящиеся реки. Пей из них только если хочешь видеть его сны.'];
    if (G.STORY.biomes) G.STORY.biomes.dev_gut = [def.name, def.subtitle];
  }
})();
