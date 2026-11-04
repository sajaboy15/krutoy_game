/* 65_boss_seven.js — THE SEVEN, rebuilt with their own mechanics (replaces the kempir re-skin of 60_world.js and its art in 63).
   Seven founders' shades chained neck to neck on one chain. Each is a separate target with its own health; the encounter's
   health bar is the sum of the seven. Each founder carries an object and owns one move:
     Bell   — a toll: a zone of silence for 4 s (no healing, no skills inside)
     Chain  — a lash across the whole arena: low (jump it) or high (roll through it)
     Staff  — slams the floor, a wave runs along the ground (phase 2+: slams twice, the second after a false recovery)
     Scales — weighs two founders: swaps the health of the most wounded and the healthiest and heals the wounded one
              (interrupted if you hurt the Scales enough while it weighs; it never weighs itself — kill it first)
     Knife  — vanishes, reappears behind the hero, holds the blade up for a beat, stabs
     Torch  — floor strips catch fire
     Book   — "written into debt": a seal on the hero; after 5 s every founder strikes the marked spot, then all stand open 2 s
   Phase 1: three founders stand forward (Bell, Staff, Chain) and attack in turns; the one about to strike raises its head, the
            next one lifts it halfway. The other four stand back in the circle (untargetable).
   Phase 2 (70%): everyone steps into the line; the founders swap places along the chain; Scales, Knife, Torch and Book join.
            Killing a founder snaps the chain taut: its two neighbours on the chain lose 12% of their health and reel.
   Phase 3 (36%): they tear off their blindfolds — light from their eyes burns strips of the floor — and attack in pairs.
   Self-contained; overrides the 'seven' def registered by 60_world.js (and with it the art hooks 63 put on that def). */
{
  const KIT = G.BossKit, Art = G.Art, U = G.U, ED = G.Enemies && G.Enemies.defs;
  const OLD = ED && ED.seven;
  if (KIT && Art && OLD && G.Boss && G.Player) try {
    const TT = s => G.LANG.t(s);
    const TAU = Math.PI * 2, PI = Math.PI;
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const lerp = (a, b, k) => a + (b - a) * k;
    const ease = k => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
    const lerpP = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    const sign = v => v > 0 ? 1 : v < 0 ? -1 : 0;
    const RR = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
    const PX = (c, x, y, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), 1, 1); };
    const LX = .45, LY = -.9;
    const BALLS = new Map();
    const ball = (c, x, y, rx, ry, pal, rot) => {
      rx = Math.max(.6, Math.round(rx * 2) / 2); ry = Math.max(.6, Math.round(ry * 2) / 2); rot = Math.round((rot || 0) * 8) / 8;
      const key = rx + ',' + ry + ',' + rot + pal.join('');
      let cv = BALLS.get(key);
      if (!cv) {
        if (BALLS.size > 400) BALLS.clear();
        const R = Math.ceil(Math.max(rx, ry)) + 2;
        cv = G.makeCanvas(2 * R, 2 * R, true); KIT.ball(cv.ctx, R, R, rx, ry, pal, LX, LY, rot); cv.o = R; BALLS.set(key, cv);
      }
      c.drawImage(cv, Math.round(x - cv.o), Math.round(y - cv.o));
    };
    const tube = (c, pts, w0, w1, pal) => KIT.tube(c, pts, w0, w1, pal, LX, LY);
    const cel = (c, pts, pal, ins) => KIT.cel(c, KIT.shape(KIT.SP.poly(pts)), pal, LX, LY, ins || pal.slice(1).map((_, i) => 1.5 + 2.2 * i));
    const thick = (c, x0, y0, x1, y1, w, col) => { c.fillStyle = col; const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)))), h = (w - 1) / 2; for (let i = 0; i <= n; i++) { const u = i / n; c.fillRect(Math.round(x0 + (x1 - x0) * u - h), Math.round(y0 + (y1 - y0) * u - h), w, w); } };
    const elbow = (a, h, len, dir) => {
      const dx = h[0] - a[0], dy = h[1] - a[1], d = Math.hypot(dx, dy) || 1, k = Math.sqrt(Math.max(0, len * len / 4 - d * d / 4));
      return [(a[0] + h[0]) / 2 - dy / d * k * dir, (a[1] + h[1]) / 2 + dx / d * k * dir];
    };
    const glow = (x, y, r, col, a) => G.Glow.add(x, y, r, col, a);
    const light = (x, y, r, col, a) => G.Light && G.Light.add(x, y, r, col, a);
    const sfx = (n, o) => G.Audio && G.Audio.sfx(n, o || {});
    const arena = () => KIT.arena();
    const okP = p => !!p && !p.dead && p.hp > 0;
    const budget = (b, n) => { const d = b.data; d._pf = (d._pf || 0) + 1; return d._pf % n === 0; };

    /* ------------------------------------------------------------ palettes (from the art in 63, extended) */
    const GH = ['#141a2a', '#2a3650', '#4e6284', '#8498b8', '#bccce0', '#eef4fa'];
    const ROBE = ['#10142a', '#222a48', '#36406c', '#525e8e', '#7884b4'];
    const IKAT = [['#3a1824', '#6a2a3a', '#9a4a50'], ['#4a3a14', '#7a6224', '#b0924a'], ['#14284a', '#24467a', '#4a72a8']];
    const TURB = [['#5a6070', '#9aa2b4', '#d4dae6', '#f4f8fc'], ['#141c3a', '#283a6a', '#4a64a0', '#7a96c8'], ['#3a2a1a', '#6a4e30', '#9c7a4e', '#c8a874']];
    const BLIND = ['#3a0a14', '#7a1a26', '#b0343a'];
    const CHAIN = ['#1a1a22', '#4a4a58', '#8a8a9a', '#c8c8d4'];
    const BRASS = ['#3a2408', '#7a5418', '#c8963a', '#ffe08a'];
    const WOOD = ['#1a0e06', '#3e2412', '#6a4220'];
    const STEEL = ['#4a5264', '#9aa4b8', '#e0e8f4'];
    const PAGE = ['#7a6a4a', '#c8b890', '#efe4c8'];
    const LEATHER = ['#2a0e14', '#5a1a24', '#8a3038'];
    const EYE_PAL = ['#ffffff', '#fff2c0', '#ffd070', '#c8803a', '#5a2a10'];          // eye-light burn (pale gold)
    const WAVE_PAL = ['#ffffff', '#dfe6ff', '#9aa8ff', '#5a58c8', '#241c5a'];         // the staff's ground wave
    const OFF = { x: -99999, y: -99999, w: 1, h: 1 };                                  // the encounter body is never hit directly

    /* ------------------------------------------------------------ the founders */
    const ROLES = ['torch', 'bell', 'book', 'staff', 'scales', 'chain', 'knife'];      // initial order along the chain
    const FRONT1 = { bell: 1, staff: 1, chain: 1 };                                    // phase 1: forward of the circle
    const PROMOTE = ['knife', 'torch', 'book', 'scales'];                              // who steps forward when one falls in phase 1
    const HPW = { bell: 1, chain: 1.1, staff: 1.15, scales: .8, knife: .85, torch: 1, book: 1.1 };
    const IKI = { bell: 2, chain: 0, staff: 1, scales: 1, knife: 0, torch: 2, book: 0 };   // ikat / turban palette per founder
    const BEARD = { staff: 1, book: 1, scales: 1, bell: 0, chain: 0, knife: 0, torch: 0 };
    const FALL = {
      bell: `The Bell falls silent|Колокол умолк|Qo'ng'iroq jim bo'ldi`,
      chain: `The Chain goes slack|Цепь ослабла|Zanjir bo'shashdi`,
      staff: `The Staff breaks|Посох сломан|Hassa sindi`,
      scales: `The Scales are broken|Весы разбиты|Tarozi sindi`,
      knife: `The Knife falls|Нож упал|Pichoq qo'ldan tushdi`,
      torch: `The Torch goes out|Факел погас|Mash'al o'chdi`,
      book: `The Book is closed|Книга закрыта|Daftar yopildi`
    };
    const TX = {
      debt: `Written into debt|Вписан в долг|Qarzga yozilding`,
      hush: `Silence|Тишина|Sukunat`,
      falter: `The Scales falter|Весы дрогнули|Tarozi tebrandi`,
      weigh: `The Scales weigh the dead|Весы взвешивают мёртвых|Tarozi o'liklarni tortyapti`
    };
    const PHASE2 = N(`The chain turns|Цепь проворачивается|Zanjir aylanyapti`);
    const PHASE3 = N(`They open their eyes|Они открывают глаза|Ular ko'zlarini ochyapti`);
    const BOX_STAFF = { w: 72, h: 98, ox: 36, oy: 89 }, BOX = { w: 64, h: 82, ox: 32, oy: 73 };

    const living = b => b.order.filter(f => !f.dead);
    const front = b => b.F.filter(f => !f.dead && f.depth === 1);
    const wpt = (f, p) => ({ x: f.x + f.dir * p[0], y: f.y + p[1] });
    const neck = f => wpt(f, [f.P.head[0], f.P.head[1] + 8]);
    const inZone = (z, pl) => Math.abs(pl.x - z.x) < z.w / 2 && pl.y > arena().floor - 110;

    /* ------------------------------------------------------------ health: each founder has its own pool, the bar shows the sum */
    function setHp(b, f, v) {
      const d = b.data; v = clamp(v, 0, f.hpMax);
      d.sync += v - f.hp; f.hp = v; b.hp = d.sync;
      if (f.hp <= 0 && !f.dead) d.killQ.push(f);
    }
    function hpSync(b) {
      const d = b.data;
      if (b.mode === 'dying' || b.dead) return;
      const ext = d.sync - b.hp;
      if (ext > .01) {                                     // damage that bypassed the founders (burn/poison ticks on the body)
        const f = (d.lastF && !d.lastF.dead) ? d.lastF : living(b).sort((p, q) => p.hp - q.hp)[0];
        if (f) setHp(b, f, f.hp - ext);
      }
      b.hp = d.sync;
    }
    function founderDies(b, f) {
      const d = b.data, A = arena();
      if (f.dead) return;
      f.dead = true; f.dying = 1; f.hp = 0; f.part.untargetable = true; f.lock = false;
      d.lastDead = { x: f.x, y: f.y - 30 };
      for (const a of d.acts.slice()) if (a.f === f || (a.kind === 'scales' && (a.w === f || a.dn === f))) endAct(b, a, true);
      const k = b.order.indexOf(f), nb = [b.order[k - 1], b.order[k + 1]].filter(g => g && !g.dead);
      b.order.splice(k, 1);
      d.drops.push({ role: f.role, x: clamp(f.x, A.x0 + 8, A.x1 - 8), dir: f.dir, i: f.i });
      if (b.mode === 'fight' || b.mode === 'phase') {
        G.UI && G.UI.toast && G.UI.toast(TT(FALL[f.role]), '#c8b8ff');
        // the chain snaps taut and lashes the neighbours
        const n0 = neck(f);
        for (const g of nb) {
          setHp(b, g, Math.max(1, g.hp - .12 * g.hpMax));
          g.open = Math.max(g.open, 70); g.hurtT = 10;
          G.FX.dmg(g.x, g.y - 60, Math.round(.12 * g.hpMax), false, '#c8b8ff');
          d.snaps.push({ x0: n0.x, y0: n0.y, g, t: 0 });
          // the snapping chain also cuts anything standing in its line
          const pl = b.player, n1 = neck(g);
          if (okP(pl)) {
            const x0 = Math.min(n0.x, n1.x) - 4, x1 = Math.max(n0.x, n1.x) + 4, yy = (n0.y + n1.y) / 2;
            if (pl.x > x0 && pl.x < x1 && pl.y > yy - 6 && pl.y - 26 < yy + 10) G.Combat.hit(b, pl, { dmg: .5 * b.dmg, kbx: 3, kby: -3, dir: sign(pl.x - n0.x) || 1, type: 'magic', dmgColor: '#c8b8ff' });
          }
        }
        G.shake(.5); G.hitstop(6); sfx('break', { x: f.x }); sfx('enemy_die', { x: f.x });
        G.FX.flashLight(n0.x, n0.y, 120, 10, '#c8b8ff');
        G.FX.sparks(n0.x, n0.y, 12, 0, { speed: 4, color: '#ffffff', color2: '#8a7aff' });
        // phase 1: someone from the circle steps forward
        if (b.phase === 1 && b.mode === 'fight') {
          const back = PROMOTE.map(r => b.F.find(g => g.role === r && !g.dead && g.depth === 0)).find(Boolean);
          if (back) back.depth = 1;
        }
      }
      d.log.kills = (d.log.kills || 0) + 1;
      d.log['kill_' + f.role] = b.t;
      if (!living(b).length && b.mode !== 'dying' && !b.dead) { b.hp = 0; d.sync = 0; b.die(b.lastHit || {}); }
    }

    /* ------------------------------------------------------------ pose: local points (facing right, origin at the founder's base) */
    function pose(f, b) {
      const P = f.P, t = b.t + f.i * 41, arm = clamp(f.arm, 0, 1), sw = clamp(f.swing, 0, 1), cue = clamp(f.cue, -1, 1);
      P.head = [1 + (cue < 0 ? -cue * 2 : 0), -49 - (cue > 0 ? cue * 6 : 0) + (cue < 0 ? -cue * 4 : 0)];
      P.B = [-10, -22];
      let H;
      switch (f.role) {
        case 'staff': { const r = [10, -24], u = [4, -55], dn = [16, -25]; H = sw > .02 ? lerpP(u, dn, sw) : lerpP(r, u, arm); P.sa = sw > .02 ? lerp(-2.3, 1.12, sw) : lerp(-1.62, -2.3, arm); break; }
        case 'chain': H = f.lashing ? [17, -33] : lerpP([9, -25], [4, -57], arm); break;
        case 'bell': H = lerpP([11, -27], [7, -57], arm); P.ba = Math.round((Math.sin(t * .45) * .9 * arm + Math.sin(t * .05) * .15) * 4) / 4; break;
        case 'scales': H = lerpP([10, -31], [6, -56], arm); P.tilt = Math.round((f.tilt || 0) * 8) / 8; break;
        case 'knife': { const r = [9, -22], u = [3, -50], st = [19, -31]; H = sw > .02 ? lerpP(u, st, sw) : lerpP(r, u, arm); P.ka = sw > .02 ? lerp(-1.9, 0, sw) : lerp(1.3, -1.9, arm); break; }
        case 'torch': { const r = [10, -30], u = [6, -57], th = [19, -18]; H = sw > .02 ? lerpP(u, th, sw) : lerpP(r, u, arm); P.ta = sw > .02 ? lerp(-1.6, .5, sw) : lerp(-1.1, -1.6, arm); break; }
        case 'book': H = lerpP([9, -31], [9, -51], arm); P.B = [H[0] - 10, H[1] + 1]; break;
        default: H = [9, -24];
      }
      // a founder tearing its blindfold off reaches for its face
      if (f.tear > 0 && f.tear < 1) { H = lerpP(H, [P.head[0] + 4, P.head[1] + 1], Math.sin(f.tear * PI)); }
      P.H = H; P.fE = elbow([5, -38], H, 22, 1); P.bE = elbow([-6, -38], P.B, 20, -1);
    }

    /* ------------------------------------------------------------ drawing one founder into its puppet (local coords) */
    function drawHead(c, f, t) {
      const P = f.P, k = IKI[f.role], tp = TURB[k], x = Math.round(P.head[0]), y = Math.round(P.head[1]);
      c.save(); c.translate(x, y);
      if (BEARD[f.role]) cel(c, [-3, 2, 4, 2, 3, 9 + (f.role === 'book' ? 3 : 0), 0, 11 + (f.role === 'book' ? 3 : 0), -2, 7], GH.slice(2, 5), [1, 2]);
      ball(c, 0, 0, 5.5, 6, GH.slice(1, 6), 0);
      const op = clamp(f.mouth || 0, 0, 1);
      if (op > .25) { ball(c, 3, 3 + op * 2, 2.5, 1 + op * 2.2, ['#04060c', '#04060c']); PX(c, 2, 3, GH[5]); PX(c, 4, 3, GH[5]); }
      else thick(c, 1, 3, 4, 3, 1, GH[1]);
      if (f.blind > .5) {
        RR(c, -5, -2, 11, 3, BLIND[1]); RR(c, -5, -2, 11, 1, BLIND[2]);
        const fl = Math.sin(t * .15 + f.i) * 2;
        thick(c, -5, -1, -11, 1 + fl, 2, BLIND[0]); thick(c, -5, 0, -10, 4 + fl * .7, 1, BLIND[1]);
      } else {
        // torn off: burnt sockets (the light is painted unlit in drawFx), a rag of the blindfold left on the back of the head
        RR(c, 0, -2, 6, 2, '#05030a'); RR(c, 1, -3, 4, 1, GH[1]);
        thick(c, -5, -1, -7, 5 + Math.sin(t * .12 + f.i), 1, BLIND[0]);
      }
      ball(c, -.5, -5.5, 6.5, 4, tp, 0);
      for (let q = 0; q < 3; q++) thick(c, -5 + q, -7 + q * 2, 5 - q, -9 + q * 2.5, 1, tp[q === 1 ? 0 : 3]);
      c.restore();
    }
    function drawObject(c, f, t) {
      const P = f.P, H = P.H;
      switch (f.role) {
        case 'staff': {
          const a = P.sa, h = Math.cos(a), s = Math.sin(a), top = [H[0] + 34 * h, H[1] + 34 * s], bot = [H[0] - 18 * h, H[1] - 18 * s];
          tube(c, [bot, H, top], 3, 3, WOOD);
          ball(c, top[0], top[1], 2.8, 2.8, BRASS, 0);
          thick(c, top[0] - 3 * h + 2 * s, top[1] - 3 * s - 2 * h, top[0] - 3 * h - 2 * s, top[1] - 3 * s + 2 * h, 1, BRASS[2]);
          P.tip = top; break;
        }
        case 'chain': {
          if (!f.whirl && !f.lashing) for (let k = 0; k < 4; k++) {
            const x = H[0] - 1 + Math.sin(t * .07 + k) * .6, y = H[1] + 3 + k * 3;
            if (k & 1) { RR(c, x - 1, y, 3, 1, CHAIN[2]); PX(c, x, y, CHAIN[3]); } else RR(c, x, y - 1, 1, 3, CHAIN[1]);
          }
          // coils over the shoulder
          for (const [cy, r] of [[-35, 8], [-31, 9]]) for (let k = 0; k < 14; k++) { const a = k / 14 * TAU, x = -1 + Math.cos(a) * r, y = cy + Math.sin(a) * 3; RR(c, x, y, 2, 2, CHAIN[0]); RR(c, x, y, k & 1 ? 2 : 1, 1, k & 1 ? CHAIN[3] : CHAIN[2]); }
          break;
        }
        case 'bell': {
          const ba = P.ba, bx = H[0] + Math.sin(ba) * 7, by = H[1] + Math.cos(ba) * 7;
          thick(c, H[0], H[1], bx, by, 1, CHAIN[2]);
          ball(c, bx, by - 1, 2, 2, BRASS.slice(1), 0);
          cel(c, [bx - 2, by, bx + 2, by, bx + 4, by + 5, bx + 6, by + 8, bx - 6, by + 8, bx - 4, by + 5], BRASS, [1, 2, 3]);
          RR(c, bx - 6, by + 8, 13, 1, BRASS[1]); RR(c, bx - 5, by + 8, 9, 1, BRASS[3]);
          RR(c, bx - 1 + Math.round(Math.sin(t * .5) * 2), by + 9, 2, 2, BRASS[0]);
          P.tip = [bx, by + 4]; break;
        }
        case 'scales': {
          const top = [H[0], H[1] - 11], ta = P.tilt, ex = Math.cos(ta) * 14, ey = Math.sin(ta) * 14;
          thick(c, H[0], H[1] + 2, top[0], top[1], 2, BRASS[1]);
          thick(c, top[0] - ex, top[1] - ey, top[0] + ex, top[1] + ey, 2, BRASS[1]);
          thick(c, top[0] - ex, top[1] - ey - 1, top[0] + ex, top[1] + ey - 1, 1, BRASS[2]);
          ball(c, top[0], top[1] - 2, 1.6, 1.6, BRASS.slice(1), 0);
          P.pans = [];
          for (const s of [-1, 1]) {
            const px = top[0] + s * ex, py = top[1] + s * ey;
            thick(c, px, py, px - 4, py + 9, 1, BRASS[2]); thick(c, px, py, px + 4, py + 9, 1, BRASS[2]);
            RR(c, px - 5, py + 9, 11, 1, BRASS[3]); RR(c, px - 4, py + 10, 9, 1, BRASS[1]); RR(c, px - 3, py + 11, 7, 1, BRASS[0]);
            P.pans.push([px, py + 9]);
          }
          break;
        }
        case 'knife': {
          const a = P.ka, h = Math.cos(a), s = Math.sin(a);
          thick(c, H[0] - 3 * h, H[1] - 3 * s, H[0], H[1], 2, WOOD[1]);
          for (let k = 1; k <= 13; k++) { const cv = Math.sin(k / 13 * PI) * 1.6; PX(c, H[0] + k * h - cv * s, H[1] + k * s + cv * h, k > 9 ? STEEL[2] : STEEL[1]); PX(c, H[0] + k * h - (cv - 1) * s, H[1] + k * s + (cv - 1) * h, STEEL[2]); PX(c, H[0] + k * h - (cv + 1) * s, H[1] + k * s + (cv + 1) * h, STEEL[0]); }
          RR(c, H[0] - 1, H[1] - 1, 3, 3, BRASS[1]);
          P.tip = [H[0] + 13 * h, H[1] + 13 * s]; break;
        }
        case 'torch': {
          const a = P.ta, h = Math.cos(a), s = Math.sin(a), tip = [H[0] + 17 * h, H[1] + 17 * s];
          thick(c, H[0] - 5 * h, H[1] - 5 * s, tip[0], tip[1], 2, WOOD[1]);
          thick(c, H[0] - 5 * h + .7, H[1] - 5 * s - .7, tip[0] + .7, tip[1] - .7, 1, WOOD[2]);
          ball(c, tip[0], tip[1], 3, 3.4, ['#2a1a10', '#5a3a20', '#8a5a30'], 0);
          for (let k = -1; k <= 1; k++) PX(c, tip[0] + k * 2, tip[1] + 1, '#1a0e06');
          P.tip = tip; break;
        }
        case 'book': {
          const x = Math.round(H[0] - 5), y = Math.round(H[1] - 8), op = f.write ? (f._wq ? 1 : -1) : 0;
          RR(c, x - 9, y - 1, 19, 12, LEATHER[0]); RR(c, x - 9, y - 1, 19, 1, LEATHER[2]); RR(c, x - 9, y + 10, 19, 1, LEATHER[1]);
          RR(c, x - 8, y, 8, 10, PAGE[2]); RR(c, x + 1, y, 8, 10, PAGE[1]); RR(c, x, y, 1, 10, PAGE[0]);
          for (let r = 0; r < 4; r++) { RR(c, x - 7, y + 2 + r * 2, 5 - (r & 1), 1, '#4a3a5a'); RR(c, x + 2, y + 2 + r * 2, 4 + (r & 1), 1, '#4a3a5a'); }
          RR(c, x + 6, y + 6, 2, 2, '#8a1a24');
          if (f.write) { const qx = x + 4 + op * 2, qy = y + 2; thick(c, qx, qy, qx + 5, qy - 9, 1, '#e8e0d0'); PX(c, qx + 5, qy - 9, '#ffffff'); }
          P.tip = [x, y + 3]; break;
        }
      }
    }
    // the robe is baked per founder and per step of its hem's sway (8 steps), then blitted: the cel shading is too slow per frame
    const ROBES = new Map();
    function robeCv(f, q) {
      const key = f.role + q;
      let cv = ROBES.get(key);
      if (cv) return cv;
      cv = G.makeCanvas(40, 56, true); const c = cv.ctx; c.translate(20, 51); cv.ox = 20; cv.oy = 51;
      const ph = q / 8 * TAU, pal = IKAT[IKI[f.role]];
      // a long caravan chapan, hunched forward; its hem frays into strands of mist
      const hem = [];
      for (let k = 0; k <= 8; k++) { const u = k / 8; hem.push(lerp(14, -15, u), (k & 1 ? -5 : 0) + Math.round(Math.sin(ph + k * 1.1) * 1.5)); }
      cel(c, [-2, -45, 6, -43, 10, -38, 11, -30, 12, -21, 14, -11, ...hem, -15, -10, -13, -22, -12, -34, -9, -41], ROBE, [2, 4.5, 8, 12]);
      // strands of mist below the hem
      for (let k = 0; k < 5; k++) { const x = -11 + k * 6 + Math.round(Math.sin(ph + k * 2) * 1.5), y0 = (k & 1) ? -4 : 0, L = 3 + ((k * 7 + q) % 4); RR(c, x, y0, 2, L, ROBE[1]); RR(c, x + 1, y0, 1, L - 1, ROBE[2]); }
      // the open front of the chapan: a dark inner robe between two ikat-trimmed edges
      for (let y = -43; y < -2; y++) {
        const u = (y + 43) / 41, xe = Math.round(lerp(2, 9, u * u) + (y > -10 ? Math.sin(ph + y * .4) : 0));
        RR(c, xe - 2, y, 2, 1, ROBE[1]);
        RR(c, xe, y, 2, 1, pal[((y >> 1) & 1) ? 1 : 2]);
        if ((y & 3) === 0) RR(c, xe - 4, y, 1, 1, pal[0]);
      }
      // an abr-dyed band above the hem
      for (let x = -13; x < 13; x += 2) { const y = -9 + Math.round(Math.sin(x * .5 + ph) * .8); RR(c, x, y, 2, 2, pal[((x + 13) >> 1) % 3 === 0 ? 2 : 1]); }
      // sash with a hanging tail behind
      RR(c, -12, -27, 24, 3, BRASS[0]); RR(c, -12, -27, 24, 1, BRASS[2]); RR(c, -11, -26, 22, 1, BRASS[1]);
      thick(c, -12, -25, -15 + Math.sin(ph) * 1.5, -17, 2, BRASS[1]);
      ROBES.set(key, cv);
      return cv;
    }
    function drawFounder(c, f, q) {
      const P = f.P, t = q * 8;
      c.imageSmoothingEnabled = false;
      if (f.depth === 0 || f.depthK < .99) { const s = lerp(.8, 1, f.depthK); c.scale(s, s); }
      // back sleeve: wide, hanging
      tube(c, [[-6, -38], P.bE, P.B], 8, 6, ROBE.slice(0, 3));
      ball(c, P.B[0], P.B[1], 2.4, 2.4, GH.slice(1, 4));
      if (f.role === 'staff') drawObject(c, f, t);
      const cv = robeCv(f, q);
      c.drawImage(cv, -cv.ox, -cv.oy);
      drawHead(c, f, t);
      // front sleeve with a flared cuff, then the hand
      tube(c, [[5, -39], P.fE, P.H], 8, 6, ROBE.slice(1, 4));
      const ca = Math.atan2(P.H[1] - P.fE[1], P.H[0] - P.fE[0]), cx = P.H[0] - Math.cos(ca) * 3, cy = P.H[1] - Math.sin(ca) * 3;
      thick(c, cx - Math.sin(ca) * 4, cy + Math.cos(ca) * 4, cx + Math.sin(ca) * 4, cy - Math.cos(ca) * 4, 2, IKAT[IKI[f.role]][2]);
      ball(c, P.H[0], P.H[1], 2.6, 2.6, GH.slice(1, 4));
      if (f.role !== 'staff') drawObject(c, f, t);
    }

    /* ------------------------------------------------------------ the attacks */
    const tel = (b, f, n) => { b.data.teleF = f; return b.tele(Math.round(n * (b.phase >= 3 ? .9 : 1))); };
    const hitP = (b, o) => { const pl = b.player; return okP(pl) && G.Combat.hit(b, pl, Object.assign({ dmg: b.dmg, kbx: 3.5, kby: -3, dir: 1, type: 'melee', dmgColor: '#c8b8ff' }, o)); };
    const marker = (b, o) => b.add(new KIT.Marker(o));

    function slamStaff(b, f) {
      const A = arena(), x = clamp(f.x + f.dir * 22, A.x0 + 10, A.x1 - 10);
      G.shake(.45); G.hitstop(3); sfx('stomp', { x }); sfx('hit_heavy', { x, vol: .6 });
      G.FX.dust(x, A.floor, 12, 2, ['#3a4060', '#5a6488', '#8a94b8']);
      G.FX.flashRing(x, A.floor - 1, 40, { pal: 'violet', flat: true, rate: 3 });
      G.FX.flashLight(x, A.floor - 10, 120, 8, '#a8b0ff');
      for (const dir of [-1, 1]) b.add(new KIT.Shockwave(x + 10 * dir, A.floor, dir, { pal: WAVE_PAL, color: '#9aa8ff', color2: '#3a3a8a', dust: '#3a4060', dmg: .85 * b.dmg, spd: 2.9 + .25 * b.phase, h: 18, life: 150 }));
    }
    function lashMarker(b, kind, life) {
      const A = arena();
      if (kind === 'low') marker(b, { style: 'hline', x0: A.x0, x1: A.x1, y: A.floor - 4, band: 3, life, color: '#ffc860', dir: 1 });
      else marker(b, { style: 'hline', x0: A.x0, x1: A.x1, y: A.floor - 30, band: 16, life, color: '#ff5aa0', dir: -1 });
    }
    function scalesPick(b, sc) {
      const L = living(b).filter(g => g !== sc && g.depth === 1 && !g.strike);
      if (L.length < 2) return null;
      const w = L.slice().sort((p, q) => p.hp / p.hpMax - q.hp / q.hpMax)[0];
      if (w.hp / w.hpMax > .72) return null;
      const dn = L.filter(g => g !== w).sort((p, q) => q.hp / q.hpMax - p.hp / p.hpMax)[0];
      return dn ? { w, dn } : null;
    }
    function vanish(b, f) { G.FX.poof(f.x, f.y - 30, { pal: 'violet', r: 12, beam: false }); G.FX.smokePuff && G.FX.smokePuff(f.x, f.y - 26, { r: 5, cols: 'spirit' }); f.vis = 0; sfx('whoosh', { x: f.x }); }

    const ACT = {
      // close quarters: a sleeve swept at whoever hugs the founder
      swat: { update(b, a, f, t) {
        const pl = b.player;
        if (t === 1) { a.W = tel(b, f, 26); a.dir = sign(pl.x - f.x) || f.dir; }
        f.cueT = 1; f.dir = a.dir; f.lockDir = true;
        f.armT = t < a.W ? ease(t / a.W) * .8 : 0; f.swingT = t >= a.W && t < a.W + 10 ? 1 : 0;
        if (t === a.W) {
          G.FX.smear({ owner: { x: f.x, y: f.y, facing: a.dir }, ox: 4, oy: -32, r0: 10, r1: 40, a0: -2.2, a1: .8, dir: a.dir, color: '#e8e4ff', color2: '#6a5ac8', life: 12 });
          sfx('swing_heavy', { x: f.x });
          const box = { x: a.dir > 0 ? f.x - 4 : f.x - 40, y: f.y - 48, w: 44, h: 48 };
          if (okP(pl) && U.overlap(box, pl.box())) hitP(b, { dmg: .85 * b.dmg, kbx: 4.5, kby: -3.5, dir: a.dir });
        }
        if (t === a.W + 12) f.open = 26;
        if (t > a.W + 12) f.cueT = -1;
        return t >= a.W + 38;
      }, end(b, a, f) { f.lockDir = false; } },

      staff: { update(b, a, f, t) {
        const ph = b.phase;
        if (t === 1) { a.W = tel(b, f, [38, 32, 28][ph - 1]); a.hits = [a.W]; if (ph >= 2) a.hits.push(a.W + 46); a.last = a.hits[a.hits.length - 1]; }
        f.cueT = t <= a.last ? 1 : -1;
        let arm = 0, sw = 0;
        if (t < a.W) arm = ease(t / a.W);
        else {
          let k = 0; while (k < a.hits.length && a.hits[k] <= t) k++;
          const h = a.hits[k - 1], nx = a.hits[k];
          sw = 1;
          if (nx !== undefined) { const r = (t - h - 12) / (nx - h - 18); if (r > 0) { arm = ease(r); sw = 1 - ease(r * 1.6); } }   // a false recovery, then again
        }
        f.armT = arm; f.swingT = sw;
        if (a.hits.indexOf(t) >= 0) { slamStaff(b, f); b.data.log.staff = (b.data.log.staff || 0) + 1; }
        if (t === a.last + 1) f.open = 70;
        return t >= a.last + 70;
      } },

      chain: { update(b, a, f, t) {
        const ph = b.phase, A = arena(), pl = b.player;
        if (t === 1) {
          a.W = tel(b, f, [48, 42, 36][ph - 1]);
          a.seq = a.seq || (ph >= 2 ? (Math.random() < .5 ? ['low', 'high'] : ['high', 'low']) : [Math.random() < .5 ? 'low' : 'high']);
          a.at = a.seq.map((k, i) => a.W + i * 44); a.sw = [];
          lashMarker(b, a.seq[0], a.W + 4);
        }
        f.cueT = 1;
        const last = a.at[a.at.length - 1];
        f.whirl = (t < a.W || (t > a.at[0] + 14 && t < last)) ? 1 : 0;
        f.armT = f.whirl ? 1 : 0;
        a.at.forEach((at, i) => {
          if (t !== at) return;
          a.sw.push({ kind: a.seq[i], x: [f.x, f.x], hand: null, t: 0, done: false, checked: false, ret: 0 });
          sfx('whoosh', { x: f.x, pitch: a.seq[i] === 'low' ? .8 : 1.1 }); sfx('swing_heavy', { x: f.x }); G.shake(.25);
          if (a.seq[i + 1]) lashMarker(b, a.seq[i + 1], 44);
          b.data.log['lash_' + a.seq[i]] = (b.data.log['lash_' + a.seq[i]] || 0) + 1;
        });
        for (const s of a.sw) {
          if (s.done) continue;
          s.t++;
          if (s.x[0] > A.x0 - 16 || s.x[1] < A.x1 + 16) {
            for (const side of [0, 1]) {
              const x0 = s.x[side], x1 = clamp(x0 + (side ? 16 : -16), A.x0 - 20, A.x1 + 20);
              if (!s.checked && okP(pl) && (x0 - pl.x) * (x1 - pl.x) <= 0) {
                s.checked = true;
                const hit = s.kind === 'low' ? pl.y > A.floor - 12 : (pl.y > A.floor - 88 && pl.state !== 'roll');
                if (hit) hitP(b, { dmg: b.dmg, kbx: 4, kby: s.kind === 'low' ? -4.5 : -3, dir: side ? 1 : -1, type: 'melee', heavy: true });
                else b.data.log['dodge_' + s.kind] = (b.data.log['dodge_' + s.kind] || 0) + 1;
              }
              s.x[side] = x1;
            }
          } else if (++s.ret > 14) s.done = true;
        }
        f.lashing = a.sw.some(s => !s.done) && !f.whirl;
        if (t > last && a.sw.every(s => s.done)) { if (!a.openAt) { a.openAt = t; f.open = 60; } f.cueT = -1; return t >= a.openAt + 60; }
        return false;
      }, end(b, a, f) { f.whirl = 0; f.lashing = false; } },

      bell: { update(b, a, f, t) {
        const ph = b.phase, A = arena(), pl = b.player;
        if (t === 1) {
          a.W = tel(b, f, [42, 38, 32][ph - 1]); a.w = ph >= 3 ? 150 : 120;
          a.zx = clamp(pl.x + (pl.vx || 0) * 14, A.x0 + a.w / 2, A.x1 - a.w / 2);
          marker(b, { x: a.zx, y: A.floor, w: a.w, life: a.W + 2, color: '#8ab0ff', hgt: 44 });
        }
        f.cueT = t < a.W + 10 ? 1 : -1; f.armT = t < a.W ? 1 : .5; f.ringK = t < a.W ? t / a.W : 0;
        if (t === a.W) {
          b.data.zones.push({ x: a.zx, w: a.w, t: 0, life: 240 });
          sfx('magic', { x: a.zx, pitch: .55 }); sfx('thunder', { x: a.zx, vol: .35, pitch: 1.6 });
          G.FX.ring(a.zx, A.floor - 20, 8, a.w / 2 + 6, '#bcd0ff', 26, { width: 2 });
          G.FX.flashLight(a.zx, A.floor - 30, 160, 12, '#9ab8ff');
          if (okP(pl) && inZone({ x: a.zx, w: a.w }, pl)) hitP(b, { dmg: .4 * b.dmg, kbx: 1.5, kby: -2, type: 'magic', dir: sign(pl.x - a.zx) || 1, noFlinch: true });
          b.data.log.bell = (b.data.log.bell || 0) + 1;
        }
        if (t === a.W + 1) f.open = 40;
        return t >= a.W + 40;
      }, end(b, a, f) { f.ringK = 0; } },

      scales: { update(b, a, f, t) {
        const d = b.data;
        if (t === 1) {
          const pk = scalesPick(b, f); if (!pk) return true;
          a.w = pk.w; a.dn = pk.dn; a.W = tel(b, f, 26); a.hp0 = f.hp;
          G.FX.text(f.x, f.y - 74, TT(TX.weigh), '#ffe08a', { size: 7, life: 70 });
        }
        if (a.w.dead || a.dn.dead) return true;
        f.cueT = 1; f.armT = 1; a.k = t < a.W ? 0 : clamp((t - a.W) / 96, 0, 1);
        f.tilt = t < a.W ? 0 : Math.sin(t * .2) * .35 * (1 - a.k) + (a.w.x < f.x ? -1 : 1) * .3 * a.k;
        if (t >= a.W && a.hp0 - f.hp >= .09 * f.hpMax) {           // hit hard enough while it weighs: the scales falter
          f.open = 90; f.tilt = 0; sfx('break', { x: f.x });
          G.FX.text(f.x, f.y - 74, TT(TX.falter), '#c8b8ff', { size: 7, life: 60 });
          G.FX.sparks(f.x, f.y - 60, 10, 0, { speed: 3, color: '#ffffff', color2: '#ffe08a' });
          d.log.scales_broken = (d.log.scales_broken || 0) + 1; d.scalesCD = 520;
          return true;
        }
        if (t === a.W + 96) {
          const hw = a.w.hp / a.w.hpMax, hd = a.dn.hp / a.dn.hpMax;
          if (hd > hw) { setHp(b, a.w, hd * a.w.hpMax); setHp(b, a.dn, Math.max(1, hw * a.dn.hpMax)); }
          const heal = .1 * a.w.hpMax;
          setHp(b, a.w, a.w.hp + heal);
          G.FX.dmg(a.w.x, a.w.y - 64, Math.round((hd > hw ? (hd - hw) * a.w.hpMax : 0) + heal), false, '#9dffb0');
          G.FX.healSparkle(a.w.x, a.w.y, { pal: '#ffe08a', h: 50 });
          G.FX.flashLight(a.w.x, a.w.y - 40, 100, 12, '#ffe08a');
          sfx('heal', { x: f.x, pitch: .7 });
          d.log.scales = (d.log.scales || 0) + 1; d.scalesCD = 600;
        }
        if (t === a.W + 97) f.open = 40;
        return t >= a.W + 130;
      }, end(b, a, f) { f.tilt = 0; } },

      knife: { update(b, a, f, t) {
        const ph = b.phase, A = arena(), pl = b.player;
        if (t === 1) { a.W = tel(b, f, [26, 22, 20][ph - 1]); a.n = ph >= 3 ? 2 : 1; a.k = 0; a.st = 'wind'; }
        f.cueT = 1; f.lock = true;
        if (a.st === 'wind') { f.armT = ease(t / a.W); if (t >= a.W) { vanish(b, f); a.st = 'gone'; a.ev = t + 14; } return false; }
        if (a.st === 'gone') {
          f.vis = 0;
          if (t >= a.ev) {
            const side = -(pl.facing || 1);
            let x = pl.x + side * 26; if (x < A.x0 + 14 || x > A.x1 - 14) x = pl.x - side * 26;
            f.x = clamp(x, A.x0 + 14, A.x1 - 14); f.dir = sign(pl.x - f.x) || 1; f.lockDir = true;
            G.FX.poof(f.x, f.y - 30, { pal: 'violet', r: 10, beam: false }); sfx('swing', { x: f.x, pitch: 1.6 });
            a.st = 'poised'; a.ev = t + (ph >= 3 ? 18 : 24) - (a.k ? 4 : 0);
          }
          return false;
        }
        if (a.st === 'poised') {
          f.vis = Math.min(1, f.vis + .14); f.armT = 1; f.glint = 1;
          if (t >= a.ev) {
            f.glint = 0; a.k++; f.x += f.dir * 8;
            G.FX.smear({ owner: { x: f.x, y: f.y, facing: f.dir }, ox: 6, oy: -32, r0: 8, r1: 34, a0: -1.2, a1: .5, dir: f.dir, color: '#ffffff', color2: '#9a8aff', life: 10 });
            sfx('swing_heavy', { x: f.x, pitch: 1.3 });
            const box = { x: f.dir > 0 ? f.x - 6 : f.x - 34, y: f.y - 40, w: 40, h: 40 };
            if (okP(pl) && U.overlap(box, pl.box())) hitP(b, { dmg: 1.05 * b.dmg, kbx: 4, kby: -3, dir: f.dir, heavy: true });
            b.data.log.knife = (b.data.log.knife || 0) + 1;
            a.st = 'stab'; a.ev = t + 14;
          }
          return false;
        }
        if (a.st === 'stab') {
          f.swingT = 1; f.armT = 1;
          if (t >= a.ev) { if (a.k < a.n) { vanish(b, f); a.st = 'gone'; a.ev = t + 12; } else { f.open = 70; a.st = 'open'; a.ev = t + 70; } }
          return false;
        }
        f.swingT = .5; f.cueT = -1;
        return t >= a.ev;
      }, end(b, a, f) { f.lock = false; f.lockDir = false; f.vis = 1; f.glint = 0; } },

      torch: { update(b, a, f, t) {
        const ph = b.phase, A = arena(), pl = b.player;
        if (t === 1) {
          a.W = tel(b, f, [46, 42, 38][ph - 1]);
          const n = ph >= 3 ? 4 : 3, s = Math.random() < .5 ? 1 : -1, xs = [];
          for (const o of [0, 104 * s, -104 * s, 208 * s, -208 * s]) {
            const x = clamp(pl.x + o, A.x0 + 26, A.x1 - 26);
            if (xs.length < n && xs.every(q => Math.abs(q - x) > 60)) xs.push(x);
          }
          a.xs = xs; for (const x of xs) marker(b, { x, y: A.floor, w: 44, life: a.W + 4, color: '#ff9a40', hgt: 30 });
        }
        f.cueT = t < a.W + 6 ? 1 : -1; f.armT = t < a.W ? 1 : 0; f.swingT = t >= a.W && t < a.W + 20 ? 1 : 0;
        if (t === a.W) {
          for (const x of a.xs) b.add(new KIT.FirePool(x, A.floor, { w: 44, life: 210, dmg: .3 * b.dmg, rehit: 40, pal: Art.FLAME_FIRE, glowC: '#ff8a2a' }));
          sfx('fire', { x: f.x }); G.FX.flashLight(f.x, f.y - 40, 120, 8, '#ffb060');
          b.data.log.torch = (b.data.log.torch || 0) + 1;
        }
        if (t === a.W + 1) f.open = 34;
        return t >= a.W + 34;
      } },

      // "written into debt": the big one. Every founder strikes the marked spot, then all of them stand open.
      book: { update(b, a, f, t) {
        const d = b.data, A = arena(), pl = b.player;
        if (t === 1) { a.W = tel(b, f, 36); }
        if (t < a.W) { f.cueT = 1; f.armT = 1; f.write = 1; return false; }
        if (t === a.W) {
          f.write = 0;
          d.mark = { x: pl.x, y: pl.y, t: 0, lock: false };
          G.FX.text(pl.x, pl.y - 40, TT(TX.debt), '#ff7a8a', { size: 8, life: 90 });
          sfx('magic', { x: pl.x, pitch: .7 }); sfx('scroll', { x: pl.x });
          G.FX.flashRing(pl.x, pl.y - 14, 18, { pal: 'blood', ringOnly: true, rate: 2 });
          d.log.book = (d.log.book || 0) + 1;
        }
        const m = d.mark; if (!m) return true;
        m.t = t - a.W;
        a.allowOthers = m.t < 140;
        if (!m.lock) {
          if (okP(pl)) { m.x = pl.x; m.y = pl.y; }
          if (m.t >= 270) { m.lock = true; m.x = clamp(m.x, A.x0 + 20, A.x1 - 20); m.y = A.floor; sfx('telegraph', { x: m.x }); marker(b, { style: 'column', x: m.x, y: A.floor, w: 60, life: 34, color: '#ff3a5a' }); }
        }
        if (m.t === 286) for (const o of d.acts.slice()) if (o !== a) endAct(b, o, true);
        if (m.t === 300) {
          a.L = living(b);
          a.L.forEach((g, k) => { g.strike = { x0: g.x, y0: g.y, tx: clamp(m.x + (k - (a.L.length - 1) / 2) * 7, A.x0 + 10, A.x1 - 10), t0: 300 + k * 3 }; g.lock = true; g.vis = 1; g.depth = 1; });
          sfx('boss_roar', { x: m.x, pitch: 1.3, vol: .6 });
        }
        if (a.L) {
          for (const g of a.L) {
            if (g.dead || !g.strike) continue;
            const s = m.t - g.strike.t0;
            g.cueT = s < 10 ? 1 : -1; g.armT = s < 10 ? 1 : 0; g.swingT = s >= 10 ? 1 : 0;
            if (s >= 0 && s <= 10) { g.x = lerp(g.strike.x0, g.strike.tx, ease(s / 10)); g.yOff = -Math.sin(s / 10 * PI) * 34; g.dir = sign(m.x - g.strike.x0) || g.dir; g.lockDir = true; }
            if (s === 10) {
              G.FX.hitStar(g.x, A.floor - 16, { r: 9, n: 6, pal: '#ff7a9a', variant: 0 });
              G.FX.sparks(g.x, A.floor - 8, 5, 0, { speed: 3, color: '#ffffff', color2: '#ff5a7a' });
              G.shake(.35); sfx('hit_heavy', { x: g.x, vol: .5 });
              if (!a.hit && okP(pl) && Math.abs(pl.x - m.x) < 40 && pl.y > A.floor - 64) { if (hitP(b, { dmg: 1.2 * b.dmg, kbx: 5, kby: -5, dir: sign(pl.x - m.x) || 1, heavy: true })) a.hit = true; }
            }
          }
          const end = 300 + 3 * (a.L.length - 1) + 10;
          if (m.t === end + 1) { for (const g of a.L) if (!g.dead) g.open = 120; d.log.debt_window = (d.log.debt_window || 0) + 1; G.FX.flashLight(m.x, A.floor - 30, 160, 16, '#ff7a8a'); }
          if (m.t > end + 120) return true;
        }
        f.cueT = f.cueT || 0;
        return false;
      }, end(b, a, f) {
        const d = b.data; d.mark = null; f.write = 0; d.bookCD = 1100;
        for (const g of b.F) if (g.strike) { g.strike = null; g.lock = false; g.lockDir = false; }
      } },

      // phase 3: the light of their eyes burns a strip of floor
      gaze: { update(b, a, f, t) {
        const A = arena(), pl = b.player;
        if (t === 1) {
          a.W = tel(b, f, 34); const dir = sign(pl.x - f.x) || f.dir;
          a.x0 = clamp(f.x + dir * 20, A.x0 + 10, A.x1 - 10); a.x1 = clamp(pl.x + dir * 70, A.x0 + 10, A.x1 - 10);
          if (Math.abs(a.x1 - a.x0) < 60) a.x1 = clamp(a.x0 + dir * 120, A.x0 + 10, A.x1 - 10);
          a.last = a.x0; a.hcd = 0; a.dir = sign(a.x1 - a.x0) || 1;
          marker(b, { x: (a.x0 + a.x1) / 2, y: A.floor, w: Math.abs(a.x1 - a.x0) + 16, life: a.W + 50, color: '#ffe08a', hgt: 24 });
        }
        f.cueT = -.5; f.lockDir = true; f.dir = sign(a.x0 - f.x) || f.dir;
        if (t < a.W) { f.beam = { x: a.x0, y: A.floor, k: t / a.W * .35 }; return false; }
        const k = clamp((t - a.W) / 50, 0, 1), x = lerp(a.x0, a.x1, ease(k));
        f.beam = { x, y: A.floor, k: 1 };
        if (t === a.W) { sfx('fire', { x, pitch: 1.4 }); b.data.log.gaze = (b.data.log.gaze || 0) + 1; }
        while ((x - a.last) * a.dir >= 22) { a.last += 22 * a.dir; b.add(new KIT.FirePool(a.last, A.floor, { w: 24, life: 170, dmg: .25 * b.dmg, rehit: 40, pal: EYE_PAL, glowC: '#ffd070' })); }
        if (a.hcd > 0) a.hcd--;
        else if (okP(pl) && Math.abs(pl.x - x) < 9 && pl.y > A.floor - 30 && hitP(b, { dmg: .4 * b.dmg, kbx: 2, kby: -3, type: 'magic', dmgColor: '#ffd070', dir: a.dir })) a.hcd = 30;
        if (k >= 1) { f.beam = null; return t >= a.W + 70; }
        return false;
      }, end(b, a, f) { f.beam = null; f.lockDir = false; } }
    };
    const MAIN = { swat: 1, staff: 1, chain: 1, bell: 1, scales: 1, knife: 1, torch: 1, book: 1, gaze: 1 };

    function startAct(b, f, kind, wait, opt) {
      const d = b.data, a = Object.assign({ f, kind, t: 0, wait: wait || 0, main: !!MAIN[kind] }, opt || {});
      f.busy = a; d.acts.push(a);
      d.log['start_' + kind] = (d.log['start_' + kind] || 0) + 1;
      return a;
    }
    function endAct(b, a, cancel) {
      const d = b.data, i = d.acts.indexOf(a); if (i < 0) return;
      d.acts.splice(i, 1);
      try { ACT[a.kind].end && ACT[a.kind].end(b, a, a.f, cancel); } catch (e) { console.error('[seven] end', e); }
      if (a.f.busy === a) a.f.busy = null;
      if (cancel) { a.f.lock = false; a.f.lockDir = false; a.f.vis = 1; }
      if (a.main && !d.acts.some(o => o.main)) b.rest([64, 46, 42]);
    }

    // what can this founder do now?
    function kindsFor(b, f) {
      const d = b.data, ph = b.phase, pl = b.player, out = [];
      const close = okP(pl) && Math.abs(pl.x - f.x) < 34 && pl.y > f.y - 60;
      if (close) out.push(['swat', 3.4]);
      switch (f.role) {
        case 'staff': out.push(['staff', 3]); break;
        case 'chain': out.push(['chain', 3]); break;
        case 'bell': if (d.zones.length < 2) out.push(['bell', 2.2]); break;
        case 'knife': out.push(['knife', 2.6]); break;
        case 'torch': out.push(['torch', 2.4]); break;
        case 'scales': if (ph >= 2 && d.scalesCD <= 0 && scalesPick(b, f)) out.push(['scales', 6]); break;
        case 'book': if (ph >= 2 && d.bookCD <= 0 && !d.mark) out.push(['book', 3.4]); break;
      }
      if (ph >= 3) out.push(['gaze', 2.2]);
      return out;
    }
    function pickW(list) { let s = 0; for (const o of list) s += o[2]; let r = Math.random() * s; for (const o of list) { r -= o[2]; if (r <= 0) return o; } return list[list.length - 1]; }

    function schedule(b) {
      const d = b.data, ph = b.phase;
      const book = d.acts.find(a => a.kind === 'book');
      if (book && !book.allowOthers) return;
      if (d.acts.some(a => a.main && a !== book)) return;
      if (b.atkCD > 0) return;
      const idle = f => !f.dead && !f.busy && f.depth === 1 && !f.strike && f.depthK > .9;
      if (ph === 1) {
        // the forward founders take turns; the queue is readable by who raises the head
        const act = front(b).filter(idle);
        if (!act.length) return;
        if (!d.q.length || !d.q.some(f => act.includes(f))) d.q = act.slice().sort(() => Math.random() - .5);
        let f = d.q.shift(); if (!act.includes(f)) f = act[0];
        if (!d.q.length) d.q = act.filter(g => g !== f).sort(() => Math.random() - .5);   // so the next one is always known
        let ks = kindsFor(b, f).filter(k => k[0] !== 'scales' && k[0] !== 'book');
        if (!ks.length) ks = [['swat', 1]];
        const close = act.find(g => kindsFor(b, g).some(k => k[0] === 'swat'));
        if (close && Math.random() < .5) { startAct(b, close, 'swat'); return; }
        const own = ks.filter(k => k[0] !== 'swat');
        startAct(b, f, (own.length ? own[0] : ks[0])[0]);
        return;
      }
      if (book && book.allowOthers) {        // during the debt countdown: one quick move from someone else
        if (d.acts.length > 1) return;
        const L = living(b).filter(f => idle(f) && f !== book.f);
        const ks = []; for (const f of L) for (const [k, w] of kindsFor(b, f)) if (k === 'staff' || k === 'torch' || k === 'bell' || k === 'swat') ks.push([f, k, w]);
        if (ks.length) { const o = pickW(ks); startAct(b, o[0], o[1]); }
        return;
      }
      const L = living(b).filter(idle);
      if (!L.length) return;
      const ks = [];
      for (const f of L) for (const [k, w] of kindsFor(b, f)) ks.push([f, k, d.hist[0] === k ? w * .25 : d.hist[1] === k ? w * .6 : w]);
      if (!ks.length) return;
      const o1 = pickW(ks);
      d.hist.unshift(o1[1]); d.hist.length = 2;
      startAct(b, o1[0], o1[1]);
      if (ph >= 3 && o1[1] !== 'book' && o1[1] !== 'scales') {
        // phase 3: they attack in pairs — a second founder joins a beat later
        const ks2 = ks.filter(o => o[0] !== o1[0] && o[1] !== 'book' && o[1] !== 'scales' && o[1] !== o1[1]);
        if (ks2.length) { const o2 = pickW(ks2); startAct(b, o2[0], o2[1], 30 + Math.floor(Math.random() * 16)); d.log.pairs = (d.log.pairs || 0) + 1; }
      }
    }

    /* ------------------------------------------------------------ kinematics, every frame in every mode */
    function layout(b) {
      const d = b.data, A = arena(), L = living(b), N = L.length, pl = b.player;
      const S = N > 1 ? Math.min(52, 300 / (N - 1)) : 0, half = S * (N - 1) / 2;
      if (b.phase >= 2 && b.mode === 'fight' && !d.mark && okP(pl)) d.lc += clamp(clamp(pl.x, A.x0 + 40 + half, A.x1 - 40 - half) - d.lc, -.3, .3);
      d.lc = clamp(d.lc, A.x0 + 30 + half, A.x1 - 30 - half);
      L.forEach((f, k) => { f.home = d.lc + (k - (N - 1) / 2) * S; });
    }
    function kin(b, f) {
      const A = arena(), pl = b.player;
      if (f.dead) { if (f.dying > 0) f.dying++; return; }
      if (!f.lock) { const dx = f.home - f.x; f.x += clamp(dx * .08, -Math.max(1.3, Math.abs(dx) * .05), Math.max(1.3, Math.abs(dx) * .05)); }
      if (f.swap) { f.swap.t++; const k = f.swap.t / 44; f.yOff = -Math.sin(Math.min(1, k) * PI) * 16 * f.swap.up; if (k >= 1) f.swap = null; }
      else if (!f.strike) f.yOff *= .8;
      f.depthK += clamp(f.depth - f.depthK, -.04, .04);
      const hov = Math.sin((b.t + f.i * 50) * .045) * 1.5;
      f.y = A.floor - 3 - hov - (1 - f.depthK) * 10 + (f.yOff || 0);
      if (!f.lockDir && okP(pl)) f.dir = sign(pl.x - f.x) || f.dir;
      f.cue += (f.cueT - f.cue) * .18; f.arm += (f.armT - f.arm) * .25; f.swing += (f.swingT - f.swing) * .5;
      f.mouth += ((f.cue > .6 ? .7 : f.open > 0 ? .5 : 0) - f.mouth) * .2;
      if (f.tear > 0 && f.tear < 1) f.tear = Math.min(1, f.tear + 1 / 16);
      if (f.open > 0) f.open--;
      if (f.part) {
        f.part.x = f.x; f.part.y = f.y;
        f.part.mul = f.open > 0 ? 1.35 : 1;
        f.part.untargetable = b.mode !== 'fight' || f.depthK < .6 || f.vis < .5;
      }
      if (f.hurtT > 0) f.hurtT--;
      pose(f, b);
    }

    /* ------------------------------------------------------------ founder sprites: painted + outlined + rim-lit once per quantized pose, then blitted */
    const SPR = new Map();
    const QZ = (v, k) => Math.round(v / k) * k;
    function sprite(b, f, base) {
      const q = (((b.t + f.i * 37) / 8) | 0) & 7, S = f.role === 'staff' ? BOX_STAFF : BOX;
      const cue = QZ(f.cue, .25), arm = QZ(f.arm, .2), sw = QZ(f.swing, .25), dk = QZ(f.depthK, .25), tear = f.tear > 0 && f.tear < 1 ? QZ(f.tear, .25) : 0;
      const fl = f.part && f.part.hurtT > 0 ? 'w' + Math.ceil(Math.min(1, f.part.hurtT / 4) * 2) : f.dead ? (f.dying % 8 < 4 ? 'D' : 'd') : f.hurtT > 6 ? 'h' : (b.data.teleF === f && b.teleT > 0 && b.teleT % 6 < 3) ? 'r' : '';
      const wq = f.write ? ((b.t >> 3) & 1) : 0;
      const key = [f.role, f.dir, q, cue, arm, sw, dk, tear, f.blind > .5 ? 1 : 0, f.mouth > .4 ? 1 : 0, f.P.ba, f.P.tilt, f.whirl ? 1 : 0, f.lashing ? 1 : 0, f.write ? 1 + wq : 0,
        fl, f.open > 0 ? 1 : 0, base.tint ? base.tint.color : '', base.rim ? base.rim.dx : 0].join('|');
      let cv = SPR.get(key);
      if (cv) return cv;
      if (SPR.size > 520) SPR.clear();
      const keep = [f.cue, f.arm, f.swing, f.tear, f.mouth, f.depthK];
      f.depthK = dk; f.cue = cue; f.arm = arm; f.swing = sw; f.tear = tear || f.tear; f.mouth = f.mouth > .4 ? .7 : 0; f._wq = wq;
      pose(f, b);
      const o = Object.assign({}, base, {
        w: S.w, h: S.h, ox: S.ox, oy: S.oy, flip: f.dir < 0, snap: false, alpha: 1,
        flash: fl[0] === 'w' ? .4 * +fl[1] : fl === 'D' ? .6 : fl === 'd' ? .2 : fl === 'h' ? .5 : fl === 'r' ? .4 : 0,
        flashColor: fl === 'r' ? '#ff3030' : '#ffffff',
        tint: dk < .9 ? { color: '#141428', a: .45 * (1 - dk) } : f.open > 0 ? { color: '#2a2a40', a: .18 } : base.tint
      });
      cv = G.makeCanvas(S.w, S.h, true);
      KIT.puppet(cv.ctx, S.ox, S.oy, o, c => drawFounder(c, f, q));
      SPR.set(key, cv);
      [f.cue, f.arm, f.swing, f.tear, f.mouth, f.depthK] = keep; pose(f, b);
      return cv;
    }

    /* ------------------------------------------------------------ the def */
    const def = {
      id: 'seven', name: OLD.name, title: OLD.title, boss: true, biomes: [], hp: 1250, dmg: 22, w: 20, h: 56, speed: 0, gold: [0, 0],
      blood: '#1a1830', fxPal: 'violet', debris: ['#1a1e34', '#454e74', '#8a7aff', '#bccce0'], phaseAt: [.7, .36],
      phaseNames: [null, PHASE2, PHASE3], roarColor: '#a8b8ff', music: OLD.music || 'yd_boss_seven',
      arena: { w: 50, h: 22, platforms: [] }, introLen: 180, phaseLen: 150, deathLen: 200, enrageAt: 0, noPhys: true, kbResist: 1,
      outline: '#04060e', deathColors: ['#ffffff', '#e8e4ff', '#8a7aff'], noEnrageFx: true,
      rims: (sun, b) => [{ color: '#d8ecff', dx: sun || 1, dy: -1, a: .5 }, { color: '#7a6aff', dx: -(sun || 1), dy: 0, a: .3 }],
      camX: b => b.x, camY: b => b.y,
      telePos: b => { const f = b.data && b.data.teleF; return f && !f.dead && f.P.head ? { x: wpt(f, f.P.head).x, y: f.y + f.P.head[1] - 24 } : { x: b.x, y: b.y - 90 }; },
      setup(b) {
        const A = arena();
        b.alpha = 0; b.boxOv = OFF; b.contact = 0;
        b.data = { acts: [], zones: [], drops: [], snaps: [], killQ: [], q: [], hist: [], log: {}, mark: null, lc: A.cx || (A.x0 + A.x1) / 2,
          sync: b.hp, scalesCD: 0, bookCD: 300, swapCD: 300, lastF: null, teleF: null };
        b.F = ROLES.map((role, i) => ({
          i, role, hp: 0, hpMax: 0, x: 0, y: A.floor, home: 0, dir: -1, depth: FRONT1[role] ? 1 : 0, depthK: FRONT1[role] ? 1 : 0,
          cue: 0, cueT: 0, arm: 0, armT: 0, swing: 0, swingT: 0, mouth: 0, open: 0, vis: 1, alpha: 0, blind: 1, tear: 0, yOff: 0,
          dead: false, dying: 0, busy: null, lock: false, lockDir: false, P: {}, part: null, hurtT: 0
        }));
        b.order = b.F.slice();
        layout(b);
        for (const f of b.F) { f.x = f.home; pose(f, b); }
      },
      start(b) {
        const d = b.data, sw = ROLES.reduce((s, r) => s + HPW[r], 0), take0 = KIT.BossPart.prototype.takeHit;
        for (const f of b.F) {
          f.hpMax = f.hp = b.maxHp * HPW[f.role] / sw;
          const part = f.part = new KIT.BossPart(b, 1, 20, 48);
          part.takeHit = function (h) {
            if (f.dead || f.vis < .5 || f.depthK < .6) return false;
            b._hitF = f; b.lastHitKey = null;            // each founder is its own target: one swing may cut two of them
            try { return take0.call(this, h); } finally { b._hitF = null; }
          };
          part.x = f.x; part.y = f.y;
          G.world.add(part); b.parts.push(part);
        }
        d.sync = b.hp = b.F.reduce((s, f) => s + f.hp, 0);
      },
      intro(b, t) {
        const A = arena();
        b.alpha = 1;
        b.F.forEach((f, k) => {
          f.alpha = clamp((t - 14 - k * 11) / 26, 0, 1);
          if (t === 14 + k * 11) { G.FX.poof(f.x, f.y - 28, { pal: 'violet', r: 10, beam: false }); sfx('summon', { x: f.x, vol: .4, pitch: .7 + k * .06 }); }
          f.cueT = t > 100 && t < 150 ? 1 : 0;
        });
        if (t > 8 && t < 100 && t % 3 === 0) G.FX.spawn({ x: b.x + U.rand(-160, 160), y: A.floor - U.rand(0, 4), vy: -U.rand(.6, 1.8), life: 36, size: 1, color: '#c8d0ff', color2: '#5a4ac8', glow: true, glowR: 0 });
        if (t === 112) b.roar({ color: '#a8b8ff', y: A.floor - 56 });
        return t >= 180;
      },
      update(b) {
        const d = b.data, pl = b.player;
        b.vx = 0;
        if (d.scalesCD > 0) d.scalesCD--; if (d.bookCD > 0) d.bookCD--;
        // pose targets are re-declared every frame by whoever moves the founder
        for (const f of b.F) { f.cueT = 0; f.armT = 0; f.swingT = 0; f.whirl = 0; if (!f.busy) { f.lockDir = !!f.strike; } if (f.open > 0 && !f.busy) f.cueT = -1; }
        if (!okP(pl)) return;
        for (const a of d.acts.slice()) {
          if (d.acts.indexOf(a) < 0) continue;
          if (a.wait > 0) { a.wait--; continue; }
          a.t++;
          let done = false;
          try { done = ACT[a.kind].update(b, a, a.f, a.t); } catch (e) { console.error('[seven] ' + a.kind, e); done = true; }
          if (done) endAct(b, a);
        }
        // the next founder in line lifts its head halfway
        if (b.phase === 1 && d.q[0] && !d.q[0].busy && !d.q[0].dead) d.q[0].cueT = Math.max(d.q[0].cueT, .45);
        // phase 2+: founders change places along the chain
        if (b.phase >= 2 && --d.swapCD <= 0) {
          d.swapCD = U.randi(300, 460);
          const L = living(b), ks = [];
          for (let k = 0; k + 1 < L.length; k++) if (!L[k].busy && !L[k + 1].busy && !L[k].lock && !L[k + 1].lock) ks.push(k);
          if (ks.length) {
            const k = ks[Math.floor(Math.random() * ks.length)], p = L[k], q = L[k + 1], i = b.order.indexOf(p), j = b.order.indexOf(q);
            b.order[i] = q; b.order[j] = p; p.swap = { t: 0, up: 1 }; q.swap = { t: 0, up: -.4 };
            sfx('swing', { x: (p.x + q.x) / 2, pitch: .6, vol: .5 }); d.chainFlash = 30;
            d.log.swaps = (d.log.swaps || 0) + 1;
          }
        }
        schedule(b);
      },
      always(b) {
        const d = b.data, A = arena();
        if (!b.F[0].part && b.started) return;
        hpSync(b);
        while (d.killQ.length) founderDies(b, d.killQ.shift());
        layout(b);
        for (const f of b.F) kin(b, f);
        for (const z of d.zones) z.t++;
        d.zones = d.zones.filter(z => z.t < z.life);
        for (const s of d.snaps) s.t++;
        d.snaps = d.snaps.filter(s => s.t < 16);
        if (d.chainFlash > 0) d.chainFlash--;
        const L = living(b);
        if (L.length) { let sx = 0; for (const f of L) sx += f.x; b.x = sx / L.length; }
        b.y = A.floor; b.boxOv = OFF; b.contact = 0; b.vx = 0; b.vy = 0;
      },
      modDamageIn(b, o, hit) {
        const d = b.data;
        let f = b._hitF;
        // a blow aimed at the encounter itself (scripts, tests, odd skills) lands on the weakest founder that can be hit
        if (!f) f = b.F.filter(g => !g.dead && g.part && !g.part.untargetable).sort((p, q) => p.hp - q.hp)[0];
        if (!f || f.dead) return 0;
        o = Math.min(o, .08 * b.maxHp, f.hp);                       // no single blow takes more than 8% of the encounter
        d.lastF = f; f.hurtT = 6;
        f.hp -= o; d.sync -= o;
        if (f.hp <= .001) {
          f.hp = 0; d.killQ.push(f);
          if (!b.F.some(g => !g.dead && g.hp > 0)) return b.hp + 1;   // the last founder: make sure the encounter ends exactly here
        }
        return o;
      },
      onPhaseInterrupt(b) {
        const d = b.data;
        for (const a of d.acts.slice()) endAct(b, a, true);
        d.mark = null; d.q = [];
        for (const f of b.F) { f.strike = null; f.lock = false; f.lockDir = false; f.vis = 1; f.open = 0; f.beam = null; }
      },
      phaseAnim(b, t) {
        const L = living(b);
        if (b.phase === 2) {
          for (const f of L) { f.depth = 1; f.cueT = t > 20 && t < 90 ? 1 : 0; f.armT = t > 30 && t < 80 ? .6 : 0; }
          if (t === 1) b.data.chainFlash = 90;
          return t >= 110;
        }
        // phase 3: one by one they tear the blindfolds off
        L.forEach((f, k) => {
          const t0 = 26 + k * 9;
          f.cueT = t > t0 - 6 ? 1 : 0;
          if (t === t0) f.tear = .01;
          if (t === t0 + 8) {
            f.blind = 0;
            const h = wpt(f, f.P.head);
            G.FX.spawn({ x: h.x - f.dir * 4, y: h.y, vx: -f.dir * U.rand(.6, 1.2), vy: -U.rand(.8, 1.4), grav: .06, drag: .98, life: 90, shape: 'rect', w: 5, h: 2, size: 2, color: BLIND[1], vr: .15 });
            G.FX.flashLight(h.x, h.y, 90, 10, '#ffe08a'); sfx('fire', { x: h.x, pitch: 1.6, vol: .4 });
          }
        });
        return t >= 26 + L.length * 9 + 44;
      },
      onPhase(b, ph) { const d = b.data; d.swapCD = 160; d.q = []; if (ph === 2) d.bookCD = Math.min(d.bookCD, 420); b.atkCD = 40; },
      onDying(b) {
        const d = b.data;
        for (const a of d.acts.slice()) endAct(b, a, true);
        d.zones.length = 0; d.mark = null;
        for (const f of b.F) if (!f.dead) { f.dead = true; f.dying = 1; }
      },
      deathAnim(b, t) { b.alpha = clamp((b.deathLen - t) / 40, 0, 1); },
      deathPoint(b) { const p = b.data.lastDead || { x: b.x, y: b.y - 30 }; return { x: p.x + U.rand(-14, 14), y: p.y + U.rand(-20, 16) }; },
      onDeath(b) {
        G.FX.flash('#e8e4ff', .6);
        for (const f of b.F) G.FX.burst(f.x, arena().floor - 20, 5, { speed: 2.5, life: 40, size: 1, colors: ['#ffffff', '#a8b8ff'], glow: true, grav: -.03 });
        G.FX.ring(b.x, b.y - 30, 6, 180, '#c8b8ff', 30, { width: 3 });
      },

      drawBoss(ctx, b) {
        if (!b.F || !b.F[0].P.head) return;
        const base = b.popts(), sorted = b.F.slice().sort((p, q) => p.depthK - q.depthK);
        const A = arena();
        // the objects of the fallen lie where they dropped
        for (const o of b.data.drops) drawDrop(ctx, o, A.floor);
        // silence zones: a dome of dead air, behind the founders
        for (const z of b.data.zones) {
          const k = Math.min(1, z.t / 8) * Math.min(1, (z.life - z.t) / 20), rw = z.w / 2;
          ctx.globalAlpha = .3 * k; ctx.fillStyle = '#1a2460';
          for (let y = 0; y < 70; y += 2) { const w = Math.round(rw * Math.sqrt(1 - (y / 70) * (y / 70))); ctx.fillRect(Math.round(z.x - w), A.floor - y - 2, 2 * w, 2); }
          ctx.globalAlpha = 1;
        }
        for (const f of sorted) {
          if (f.dead && f.dying > 46) continue;
          const al = b.alpha * f.alpha * f.vis * (f.dead ? clamp(1 - f.dying / 46, 0, 1) : 1);
          if (al < .03 || !G.onScreen(f.x, f.y - 40, 70)) continue;
          const S = f.role === 'staff' ? BOX_STAFF : BOX, cv = sprite(b, f, base);
          ctx.globalAlpha = al * .96;
          ctx.drawImage(cv, Math.round(f.x) - S.ox, Math.round(f.y) - S.oy);
          ctx.globalAlpha = 1;
        }
        drawChain(ctx, b);
      },
      drawFx(ctx, b) { if (b.F && b.F[0].P.head && b.alpha > .05) drawFx(ctx, b); }
    };

    /* ------------------------------------------------------------ the chain, neck to neck (drawn straight on the lit world canvas) */
    function drawChain(ctx, b) {
      const L = living(b).filter(f => f.vis > .5 && f.alpha > .5);
      if (L.length < 2) return;
      const d = b.data, A = arena();
      for (let k = 0; k + 1 < L.length; k++) {
        const p = neck(L[k]), q = neck(L[k + 1]), dist = Math.hypot(q.x - p.x, q.y - p.y);
        const taut = L[k].strike || L[k + 1].strike || dist > 90, sag = taut ? 2 : 4 + dist * .14;
        const n = Math.max(3, Math.round(dist / 3));
        for (let j = 0; j <= n; j++) {
          const u = j / n, x = Math.round(lerp(p.x, q.x, u)), y = Math.round(Math.min(lerp(p.y, q.y, u) + Math.sin(u * PI) * sag, A.floor - 2));
          ctx.fillStyle = CHAIN[0];
          if (j & 1) { ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillStyle = CHAIN[2]; ctx.fillRect(x - 1, y, 3, 1); }
          else { ctx.fillRect(x - 1, y - 2, 3, 5); ctx.fillStyle = CHAIN[1]; ctx.fillRect(x, y - 1, 1, 3); ctx.fillStyle = CHAIN[3]; ctx.fillRect(x, y - 1, 1, 1); }
        }
      }
      // a collar on every neck
      for (const f of L) { const p = neck(f); ctx.fillStyle = CHAIN[0]; ctx.fillRect(Math.round(p.x) - 4, Math.round(p.y) - 2, 8, 4); ctx.fillStyle = CHAIN[2]; ctx.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 1, 6, 1); ctx.fillStyle = CHAIN[1]; ctx.fillRect(Math.round(p.x) - 3, Math.round(p.y), 6, 1); }
    }
    function drawDrop(ctx, o, fy) {
      const x = Math.round(o.x), y = fy - 1;
      ctx.fillStyle = '#0a0a12'; ctx.fillRect(x - 6, y, 13, 1);
      switch (o.role) {
        case 'staff': ctx.fillStyle = WOOD[1]; ctx.fillRect(x - 16, y - 2, 30, 2); ctx.fillStyle = BRASS[2]; ctx.fillRect(x + 14 * o.dir, y - 3, 3, 3); break;
        case 'bell': ctx.fillStyle = BRASS[1]; ctx.fillRect(x - 3, y - 6, 7, 6); ctx.fillStyle = BRASS[2]; ctx.fillRect(x - 2, y - 6, 3, 2); break;
        case 'chain': ctx.fillStyle = CHAIN[1]; for (let i = -8; i < 8; i += 2) ctx.fillRect(x + i, y - 1 - (i & 2 ? 1 : 0), 2, 1); break;
        case 'scales': ctx.fillStyle = BRASS[1]; ctx.fillRect(x - 7, y - 2, 15, 1); ctx.fillRect(x - 6, y - 1, 4, 1); ctx.fillRect(x + 3, y - 1, 4, 1); break;
        case 'knife': ctx.fillStyle = STEEL[1]; ctx.fillRect(x - 4, y - 1, 8, 1); ctx.fillStyle = WOOD[1]; ctx.fillRect(x + 4, y - 1, 3, 1); break;
        case 'torch': ctx.fillStyle = WOOD[1]; ctx.fillRect(x - 6, y - 2, 12, 2); ctx.fillStyle = '#2a1a10'; ctx.fillRect(x + 5, y - 3, 3, 3); break;
        case 'book': ctx.fillStyle = LEATHER[1]; ctx.fillRect(x - 5, y - 3, 11, 3); ctx.fillStyle = PAGE[1]; ctx.fillRect(x - 4, y - 3, 9, 1); break;
      }
    }

    /* ------------------------------------------------------------ unlit effects: eyes, telegraphs, hazards, marks */
    function drawFx(ctx, b) {
      const d = b.data, A = arena(), t = b.t, ph = b.phase, pl = b.player;
      // silence zones: a dome of dead air
      for (const z of d.zones) {
        const k = Math.min(1, z.t / 8) * Math.min(1, (z.life - z.t) / 20), x0 = Math.round(z.x - z.w / 2), rw = z.w / 2;
        ctx.globalAlpha = .75 * k; ctx.fillStyle = '#bcd0ff';
        for (let i = 0; i < 90; i++) { const a = i / 90 * PI, px = z.x - Math.cos(a) * rw, py = A.floor - Math.sin(a) * 70; if (((i + (t >> 2)) % 6) !== 0) ctx.fillRect(Math.round(px), Math.round(py), 1, 1); }
        ctx.globalAlpha = .35 * k; for (let i = 0; i < 60; i++) { const a = i / 60 * PI, px = z.x - Math.cos(a) * (rw - 4), py = A.floor - Math.sin(a) * 64; if ((i & 1)) ctx.fillRect(Math.round(px), Math.round(py), 1, 1); }
        ctx.globalAlpha = .9 * k; ctx.fillRect(x0, A.floor - 2, z.w, 1);
        ctx.globalAlpha = 1;
        glow(z.x, A.floor - 20, rw, '#4a6ae0', .18 * k);
        if (budget(b, 3)) G.FX.spawn({ x: z.x + U.rand(-rw, rw), y: A.floor - U.rand(4, 60), vy: -U.rand(.1, .3), life: 40, size: 1, color: '#9ab8ff', alpha: .7 });
      }
      if (okP(pl) && d.zones.some(z => inZone(z, pl))) {
        ctx.globalAlpha = .85; ctx.fillStyle = '#bcd0ff';
        for (let i = 0; i < 10; i++) { const a = t * .05 + i / 10 * TAU; ctx.fillRect(Math.round(pl.x + Math.cos(a) * 9), Math.round(pl.y - 32 + Math.sin(a) * 3), 1, 1); }
        ctx.globalAlpha = 1;
      }
      // the founders
      for (const f of b.F) {
        if (f.dead) {
          if (f.dying > 0 && f.dying < 46 && budget(b, 2)) G.FX.spawn({ x: f.x + U.rand(-10, 10), y: f.y - U.rand(4, 56), vy: -U.rand(.6, 1.6), life: 30, size: 1, color: '#e8e4ff', color2: '#5a4ac8', glow: true, glowR: 0 });
          continue;
        }
        const al = b.alpha * f.alpha * f.vis;
        if (al < .2) continue;
        const h = wpt(f, f.P.head), hot = f.cue > .5 || (d.teleF === f && b.teleT > 0);
        const ex = Math.round(h.x + f.dir * 1), ey = Math.round(h.y - 1);
        if (f.blind > .5) {
          ctx.fillStyle = f.open > 0 ? '#2a3050' : hot ? '#e8e0ff' : '#7a98e8';
          ctx.fillRect(f.dir > 0 ? ex - 2 : ex - 3, ey + 1, 5, 1);
          if (!(f.open > 0)) glow(ex, ey, hot ? 12 : 7, hot ? '#a080ff' : '#4a6ae0', (hot ? .5 : .25) * al);
        } else {
          // eyes open: two burning points of pale gold
          const on = f.open > 0 ? .35 : 1;
          ctx.globalAlpha = al * on; ctx.fillStyle = '#ffffff';
          ctx.fillRect(Math.round(h.x + f.dir * 1.5), ey, 1, 1); ctx.fillRect(Math.round(h.x + f.dir * 4), ey, 1, 1);
          ctx.fillStyle = '#ffd070'; ctx.fillRect(Math.round(h.x + f.dir * 1.5) - (f.dir > 0 ? 1 : -1), ey, 1, 1);
          ctx.globalAlpha = 1;
          glow(h.x + f.dir * 3, ey, hot ? 16 : 10, '#ffc860', (hot ? .6 : .35) * al * on);
          light(h.x, ey, 50, '#ffe0a0', .4 * on);
        }
        // the founder whose turn comes next: a faint upward thread of light over the head
        if (f.cue > .3) { const k = clamp(f.cue, 0, 1); ctx.globalAlpha = .5 * k * al; ctx.fillStyle = '#c8d0ff'; for (let y = 0; y < 12; y += 2) ctx.fillRect(Math.round(h.x), Math.round(h.y - 14 - y - (t >> 1) % 2), 1, 1); ctx.globalAlpha = 1; }
        // open: they reel — three dim motes circle the head
        if (f.open > 0) { ctx.fillStyle = '#c8b8ff'; for (let i = 0; i < 3; i++) { const a = t * .12 + i * TAU / 3; ctx.fillRect(Math.round(h.x + Math.cos(a) * 7), Math.round(h.y - 12 + Math.sin(a) * 2), 1, 1); } }
        // health tick over each forward founder (only once it has been wounded)
        if (f.depth === 1 && f.hp < f.hpMax - .5) {
          const w = 16, x0 = Math.round(h.x - 8), y0 = Math.round(h.y - 17), k = f.hp / f.hpMax;
          ctx.fillStyle = '#0a0812'; ctx.fillRect(x0 - 1, y0 - 1, w + 2, 3);
          ctx.fillStyle = f.role === 'scales' ? '#ffd870' : '#b8a8ff'; ctx.fillRect(x0, y0, Math.max(1, Math.round(w * k)), 1);
        }
        const P = f.P;
        if (f.role === 'torch' && P.tip) {
          const p = wpt(f, P.tip);
          Art.drawFlame(ctx, Math.round(p.x), Math.round(p.y) + 1, G.time + f.i, { w: 5, h: 9 + (f.arm > .5 ? 3 : 0), pal: Art.FLAME_FIRE, seed: 3, glowR: 14, glowA: .4, glow: '#ff9a40', fps: 16 });
          light(p.x, p.y, 70, '#ffb060', .6);
        }
        if (f.role === 'bell' && P.tip) {
          const p = wpt(f, P.tip);
          glow(p.x, p.y, 8, '#ffd070', .3);
          if (f.ringK > 0) {
            ctx.strokeStyle = '#d8e4ff'; ctx.globalAlpha = .6 * f.ringK; ctx.lineWidth = 1;
            for (let r = 0; r < 3; r++) { const rr = ((t * .6 + r * 6) % 18) + 3; ctx.beginPath(); ctx.arc(Math.round(p.x) + .5, Math.round(p.y) + .5, rr, 0, TAU); ctx.stroke(); }
            ctx.globalAlpha = 1;
          }
        }
        if (f.role === 'knife' && f.glint && P.tip) {
          const p = wpt(f, P.tip), s = 2 + (t & 2);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(p.x) - s, Math.round(p.y), 2 * s + 1, 1); ctx.fillRect(Math.round(p.x), Math.round(p.y) - s, 1, 2 * s + 1);
          glow(p.x, p.y, 14, '#c8c0ff', .8); light(p.x, p.y, 60, '#d8d0ff', .7);
        }
        if (f.role === 'chain' && (f.whirl || f.lashing)) drawLash(ctx, b, f);
        if (f.role === 'scales' && f.busy && f.busy.kind === 'scales' && f.busy.w && P.pans) {
          const a = f.busy, k = a.k || 0;
          for (const [g, pan, col] of [[a.w, P.pans[a.w.x < f.x ? 0 : 1], '#9dffb0'], [a.dn, P.pans[a.w.x < f.x ? 1 : 0], '#ffe08a']]) {
            if (!g || g.dead) continue;
            const p = wpt(f, pan), q = wpt(g, [0, -30]);
            ctx.fillStyle = col; ctx.globalAlpha = .4 + .4 * k;
            for (let u = 0; u < 1; u += .04) { if (((u * 25 + (t >> 1)) | 0) % 3) continue; const y = lerp(p.y, q.y, u) - Math.sin(u * PI) * 14; ctx.fillRect(Math.round(lerp(p.x, q.x, u)), Math.round(y), 1, 1); }
            ctx.globalAlpha = 1;
            glow(q.x, q.y, 16 + 10 * k, col, .3 + .3 * k);
          }
        }
        // phase 3: the eye-light burns the floor
        if (f.beam) {
          const p = { x: h.x + f.dir * 3, y: ey }, q = f.beam, k = q.k;
          ctx.globalAlpha = k < 1 ? .35 + .3 * ((t >> 1) & 1) : .9;
          Art.thick(ctx, p.x, p.y, q.x, q.y - 1, k < 1 ? 1 : 2, k < 1 ? '#ffe08a' : '#fff6d0');
          if (k >= 1) Art.thick(ctx, p.x, p.y, q.x, q.y - 1, 1, '#ffffff');
          ctx.globalAlpha = 1;
          glow(q.x, q.y - 2, k < 1 ? 8 : 18, '#ffd070', k < 1 ? .3 : .7);
          if (k >= 1) { light(q.x, q.y - 6, 70, '#ffe0a0', .8); if (budget(b, 2)) G.FX.spawn({ x: q.x + U.rand(-3, 3), y: q.y - 2, vx: U.rand(-.6, .6), vy: -U.rand(.6, 1.4), life: 20, size: 1, color: '#fff6d0', color2: '#ff9a40', glow: true, glowR: 0 }); }
        }
        light(f.x, f.y - 34, 72, '#a8b8ff', .45 * al);
      }
      // the chain snapping taut
      for (const s of d.snaps) {
        if (s.g.dead) continue;
        const q = neck(s.g), k = 1 - s.t / 16;
        ctx.globalAlpha = k; Art.thick(ctx, s.x0, s.y0, q.x, q.y, 2, '#e8e4ff'); Art.thick(ctx, s.x0, s.y0, q.x, q.y, 1, '#ffffff'); ctx.globalAlpha = 1;
        glow((s.x0 + q.x) / 2, (s.y0 + q.y) / 2, 30, '#8a7aff', .5 * k);
      }
      // phase change / swaps: the chain glows
      if (d.chainFlash > 0 || b.mode === 'phase') {
        const L = living(b), k = b.mode === 'phase' ? .8 : d.chainFlash / 30;
        for (let j = 0; j + 1 < L.length; j++) { const p = neck(L[j]), q = neck(L[j + 1]); glow((p.x + q.x) / 2, (p.y + q.y) / 2 + 6, 22, '#8a7aff', .35 * Math.min(1, k)); }
      }
      // the debt seal
      if (d.mark) drawMark(ctx, b, d.mark);
      light(b.x, A.floor - 50, 160, '#a8b8ff', .25 * b.alpha);
    }
    function drawLash(ctx, b, f) {
      const A = arena(), t = b.t, H = wpt(f, f.P.H);
      if (f.whirl) {
        // the chain whirls over the head: an ellipse of links
        ctx.fillStyle = '#d8d8e4';
        for (let i = 0; i < 14; i++) { const a = t * .35 + i / 14 * TAU, x = H.x + Math.cos(a) * 15, y = H.y - 4 + Math.sin(a) * 4; ctx.globalAlpha = Math.sin(a) > 0 ? 1 : .5; ctx.fillRect(Math.round(x), Math.round(y), i & 1 ? 2 : 1, 1); }
        ctx.globalAlpha = 1;
        glow(H.x, H.y - 4, 18, '#c8c8ff', .3);
        return;
      }
      const a = f.busy; if (!a || !a.sw) return;
      for (const s of a.sw) {
        if (s.done) continue;
        const yb = s.kind === 'low' ? A.floor - 4 : A.floor - 30, col = s.kind === 'low' ? '#ffd890' : '#ff9ac0';
        const ret = s.ret / 14;
        for (const side of [0, 1]) {
          const fx = lerp(s.x[side], f.x, ret), dir = side ? 1 : -1;
          // from the hand down to the lash height, then flat along the arena
          const bx = f.x + dir * 24, n = Math.max(2, Math.round(Math.abs(fx - bx) / 3));
          Art.thick(ctx, H.x, H.y, bx, yb, 2, '#8a8a9a');
          if (ret < .1) { ctx.globalAlpha = .35; ctx.fillStyle = col; ctx.fillRect(Math.round(Math.min(bx, fx)), yb - (s.kind === 'low' ? 3 : 8), Math.round(Math.abs(fx - bx)), s.kind === 'low' ? 6 : 16); ctx.globalAlpha = 1; }
          for (let j = 0; j <= n; j++) {
            const x = Math.round(lerp(bx, fx, j / n)), y = Math.round(yb + Math.sin(j * .9 + t * .8) * (s.kind === 'low' ? 1 : 2));
            ctx.fillStyle = '#0e0e16'; ctx.fillRect(x - 2, y - 2, 5, 4);
            if (j & 1) { ctx.fillStyle = '#9a9aac'; ctx.fillRect(x - 1, y - 1, 3, 2); ctx.fillStyle = '#ececf4'; ctx.fillRect(x - 1, y - 1, 2, 1); }
            else { ctx.fillStyle = '#6a6a7c'; ctx.fillRect(x, y - 1, 1, 2); }
          }
          // the head of the lash
          if (ret < .1 && fx > A.x0 - 4 && fx < A.x1 + 4) {
            ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(fx) - 2, yb - 2, 5, 5);
            ctx.fillStyle = col; for (let k = 1; k < 7; k++) ctx.fillRect(Math.round(fx - dir * k * 4), yb - (k & 1), 3, 1);
            glow(fx, yb, 22, col, .7); light(fx, yb, 60, col, .6);
          }
        }
      }
    }
    function drawMark(ctx, b, m) {
      const t = b.t, A = arena(), pl = b.player;
      if (!m.lock) {
        // a red wax seal over the hero's head; five pips count the seconds
        const x = Math.round(okP(pl) ? pl.x : m.x), y = Math.round((okP(pl) ? pl.y : m.y) - 40 + Math.sin(t * .1));
        ctx.fillStyle = '#3a0a14'; ctx.fillRect(x - 4, y - 4, 9, 9);
        ctx.fillStyle = '#b0243a'; ctx.fillRect(x - 3, y - 4, 7, 9); ctx.fillRect(x - 4, y - 3, 9, 7);
        ctx.fillStyle = '#ff6a7a'; ctx.fillRect(x - 1, y - 2, 3, 1); ctx.fillRect(x, y - 2, 1, 5); ctx.fillRect(x - 2, y + 2, 5, 1);
        const left = Math.max(0, 5 - Math.floor(m.t / 60));
        for (let i = 0; i < 5; i++) { const a = -PI / 2 + i / 5 * TAU; ctx.fillStyle = i < left ? '#ff8a9a' : '#3a1420'; ctx.fillRect(Math.round(x + Math.cos(a) * 9), Math.round(y + Math.sin(a) * 9), 2, 2); }
        glow(x, y, 14, '#ff3a5a', .5 + .2 * Math.sin(t * .3));
        if (m.t > 210) { ctx.globalAlpha = .5; ctx.fillStyle = '#ff3a5a'; ctx.fillRect(x - 20, A.floor - 1, 41, 1); ctx.globalAlpha = 1; }
      } else {
        const k = (t >> 2) & 1, x = Math.round(m.x);
        ctx.globalAlpha = .9; ctx.fillStyle = k ? '#ff3a5a' : '#ffd0d8';
        for (let i = -40; i <= 40; i++) { const y = A.floor - 1 - Math.round(Math.sqrt(Math.max(0, 1 - (i / 40) * (i / 40))) * 4); if ((i & 1) === 0) ctx.fillRect(x + i, y, 1, 1); }
        ctx.fillRect(x - 40, A.floor - 1, 81, 1);
        ctx.globalAlpha = 1;
        glow(x, A.floor - 6, 46, '#ff3a5a', .5);
      }
    }

    /* ------------------------------------------------------------ silence: no healing and no skills inside a zone */
    const silenced = () => {
      const bz = G.Game && G.Game.boss, pl = G.world && G.world.player;
      if (!bz || bz.dead || !bz.def || bz.def.id !== 'seven' || !bz.data || !bz.data.zones || !bz.data.zones.length || !pl) return false;
      return bz.data.zones.some(z => inZone(z, pl));
    };
    let hushAt = -99;
    const hush = p => {
      if ((G.frame || 0) - hushAt < 40) return;
      hushAt = G.frame || 0;
      G.FX.text(p.x, p.top - 12, TT(TX.hush), '#bcd0ff', { size: 7, life: 50 });
      sfx('denied', { x: p.x });
      const bz = G.Game.boss; if (bz && bz.data && bz.data.log) bz.data.log.hushed = (bz.data.log.hushed || 0) + 1;
    };
    {
      const PP = G.Player.prototype, ss0 = PP.setState, si0 = PP.startItem, he0 = PP.heal;
      PP.setState = function (s) { if (s === 'heal' && silenced()) { hush(this); return; } return ss0.apply(this, arguments); };
      PP.startItem = function (slot) { if ((slot === 'skill1' || slot === 'skill2') && silenced()) { hush(this); return false; } return si0.apply(this, arguments); };
      PP.heal = function () { if (silenced()) return; return he0.apply(this, arguments); };
    }

    G.Enemies.register(def);
    G.SEVEN = { def, ACT, startAct, endAct, silenced, ROLES, setHp, schedule, SPR };
  } catch (e) { console.error('[seven]', e); }
}
