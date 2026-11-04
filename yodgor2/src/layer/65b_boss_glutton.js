/* 65b_boss_glutton.js — stage 8a: the Glutton's moveset (GDD ch. 17 §1). A mound of Hollow bodies fused around spilled tumars.
   The prologue boss: slow, every move has a big, honest wind-up — but it already punishes greed.
   Phase 1:  ram (the merged fist slams down; the arm sticks in the floor 1.2 s — the main window)
             lash (a whip of arms slides along the floor: jump it or roll through the tip)
             drop (leaps high; its shadow follows you, then stops; it lands there)
             inhale (draws the hero in for ~2 s; tumar shelves fall from the walls; then it bites whatever is close)
             swipe (the arms round the mound sweep both sides: quick, for those who hug it)
   Phase 2 (50%): it splits — the core and two fallen bodies (Hollow) —
             crack (both arms slam the floor, cracks run both ways: jump)
             burst (throws glowing tumars round the hero: yellow glow = run, they blow 1.2 s later)
             lash2 (a low lash, then a high one 0.4 s later: jump the first, roll the second)
             ram gains a delayed variant (the fist hangs, trembles, then falls), drop gains cracks on landing,
             shed (calls the fallen bodies back when they are gone). */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (BM && ED && ED.glutton) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const ease = k => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
    const outC = k => { k = clamp(k, 0, 1); return 1 - (1 - k) ** 3; };
    const A = () => BM.arena(), sfx = BM.sfx;
    const GOLD = '#ffcf4a';

    /* a tumar shelf torn off the wall by the inhale: a column marker, then the plank and its tumars fall */
    class Shelf extends KIT.Hazard {
      constructor(x, y, delay, o) { super(x, y, 44, 10, Object.assign({ delay, dmg: 10, rehit: 0 }, o)); this.fy = y; this.y0 = A().floor - 210; this.mk = null; this.layer = 3; }
      update() {
        super.update();
        if (this.t === 1 && this.boss) this.mk = this.boss.add(new KIT.Marker({ style: 'column', x: this.x, y: this.fy, w: 44, life: this.delay + 4, color: GOLD, top0: this.y0 }));
        const k = (this.t - this.delay + 14) / 14;           // falls during the last 14 frames of its delay
        this.yy = k <= 0 ? this.y0 : lerp(this.y0, this.fy - 4, Math.min(1, k * k));
        if (this.t >= this.delay && this.t <= this.delay + 4) this.hitBox({ x: this.x - 22, y: this.fy - 40, w: 44, h: 40 }, { kbx: 2, kby: -3, dir: G.U.sign(G.world.player.x - this.x) || 1, heavy: true, dmgColor: GOLD });
        if (this.t === this.delay) {
          G.shake(.25); sfx('break', { x: this.x }); sfx('stomp', { x: this.x, vol: .5 });
          G.FX.debris(this.x, this.fy - 6, 12, 0, ['#4a2e1a', '#6a4426', '#2c1a10', '#ffd77a'], { speed: 3 });
          G.FX.dust(this.x, this.fy, 8, 1.4);
          for (let i = 0; i < 4; i++) G.FX.spawn({ x: this.x + U.rand(-16, 16), y: this.fy - 6, vx: U.rand(-1.6, 1.6), vy: -U.rand(1.5, 3), grav: .18, life: 60, size: 2, shape: 'sq', color: '#ffd77a', glow: true, glowR: 0, bounce: true });
        }
        if (this.t > this.delay + 30) this.dead = true;
      }
      drawFx(ctx) {
        if (this.t < this.delay - 14 || this.t > this.delay + 30) return;
        const x = Math.round(this.x - 20), y = Math.round(this.yy), a = this.t > this.delay ? 1 - (this.t - this.delay) / 30 : 1;
        ctx.globalAlpha = a;
        ctx.fillStyle = '#1a0e06'; ctx.fillRect(x - 1, y - 5, 42, 7);
        ctx.fillStyle = '#5a3a1e'; ctx.fillRect(x, y - 4, 40, 4);
        ctx.fillStyle = '#7a5430'; ctx.fillRect(x, y - 4, 40, 1);
        for (let i = 0; i < 4; i++) { ctx.fillStyle = '#d8a03a'; ctx.fillRect(x + 5 + i * 9, y - 8, 4, 4); ctx.fillStyle = '#fff4c8'; ctx.fillRect(x + 6 + i * 9, y - 8, 1, 1); }
        ctx.globalAlpha = 1;
        G.Glow.add(this.x, y - 6, 20, '#ffc850', .35 * a);
      }
    }
    /* a thrown tumar that lands, glows yellow and blows: run */
    class Bomb extends KIT.Hazard {
      constructor(x0, y0, x, y, fuse, o) { super(x, y, 72, 12, Object.assign({ fuse, dmg: 10, rehit: 0 }, o)); this.x0 = x0; this.y0 = y0; this.tx = x; this.ring = null; }
      update() {
        super.update();
        const fl = 22;
        if (this.t <= fl) { const k = this.t / fl; this.px = lerp(this.x0, this.tx, k); this.py = lerp(this.y0, this.y, k) - Math.sin(k * Math.PI) * 60; }
        if (this.t === fl) { sfx('land', { x: this.tx, vol: .4 }); if (this.boss) this.ring = this.boss.add(new BM.Ring({ x: this.tx, y: this.y, w: 72, life: this.fuse - fl, color: '#ffd84a' })); }
        if (this.t === this.fuse) {
          G.FX.explosion(this.tx, this.y - 12, { size: 'm', pal: 'gold', shake: .25 }); sfx('explosion', { x: this.tx, vol: .6 });
          G.FX.flashLight(this.tx, this.y - 20, 110, 10, '#ffd84a');
        }
        if (this.t >= this.fuse && this.t <= this.fuse + 4) this.hitBox({ x: this.tx - 36, y: this.y - 54, w: 72, h: 54 }, { kbx: 3.5, kby: -4, dir: G.U.sign(G.world.player.x - this.tx) || 1, dmgColor: '#ffd84a' });
        if (this.t > this.fuse + 6) this.dead = true;
      }
      drawFx(ctx) {
        if (this.t >= this.fuse) return;
        const x = Math.round(this.t <= 22 ? this.px : this.tx), y = Math.round(this.t <= 22 ? this.py : this.y - 3);
        const hot = this.t > 22 ? (this.t - 22) / (this.fuse - 22) : 0, bl = hot > .6 && this.t % 6 < 3;
        ctx.fillStyle = '#5a3a10'; ctx.fillRect(x - 3, y - 2, 7, 5);
        ctx.fillStyle = bl ? '#ffffff' : '#ffd77a'; ctx.fillRect(x - 2, y - 1, 5, 3);
        G.Glow.add(x, y, 14 + 26 * hot, '#ffd84a', .5 + .4 * hot);
        G.Light && G.Light.add(x, y - 6, 50 + 50 * hot, '#ffd84a', .5 + .4 * hot);
      }
    }

    const toward = b => { const pl = b.player; return BM.okP(pl) ? (Math.sign(pl.x - b.x) || b.facing) : b.facing; };
    const SH = [8, -36];                                   // the fist's shoulder (local)

    const moves = {
      /* the ram: a long, honest wind-up; the arm sticks for 1.2 s */
      ram: { w: [3, 2.5], range: [0, 140], open: [72, 66],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) {
            b.facePlayer(); b.vx = 0;
            m.W = b.tele(36);
            m.delay = b.phase >= 2 && Math.random() < .5 ? 24 : 0;            // phase 2: the fist hangs, trembles, then falls
            m.hit = new Set();
            BM.hint(b, b.x + b.facing * 46, 92, m.W + m.delay + 6, '#ff6a3a', b.facing);
            BM.threat(b, { in: m.W + m.delay, dur: 5, box: BM.box(b, 0, -44, 96, 44), how: 'roll', feint: !!m.delay });
            sfx('boss_roar', { x: b.x, pitch: .6, vol: .35 });
          }
          const W = m.W, D = m.delay, T0 = W + D;
          if (t < W) { const k = ease(t / W); d.fist = { x: lerp(8, -8, k), y: lerp(-40, -66, k) }; }
          else if (t < T0) { d.fist = { x: -8 + Math.sin(t * 1.3) * 1.5, y: -66 + Math.sin(t * .9) }; if (t === W + 2) sfx('telegraph', { x: b.x, pitch: .8 }); }
          else if (t <= T0 + 4) {
            const k = outC((t - T0 + 1) / 4); d.fist = { x: lerp(-8, 72, k), y: lerp(-66, -6, k) };
            if (t === T0) { sfx('swing_heavy', { x: b.x }); b.vx = 1.2 * b.facing; }
            BM.strike(b, BM.box(b, 0, -44, 96, 44), { k: 1, kbx: 4.5, kby: -3.5, heavy: true }, m.hit);
            if (t === T0 + 4) { G.shake(.5); G.hitstop(3); sfx('hit_heavy', { x: b.x }); const p = BM.box(b, 64, -4, 10, 4); G.FX.dust(p.x + 5, A().floor, 12, 2); G.FX.debris(p.x + 5, A().floor - 4, 10, b.facing, ['#3c364e', '#57506a', '#ffd77a'], { speed: 3 }); }
          }
          return t >= T0 + 4;
        } },
      /* the low lash: a whip of arms slides along the floor; only its leading tip hurts */
      lash: { w: [4, 3], range: [30, 200], open: [40, 34],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(28); m.hit = new Set();
            BM.hint(b, b.x + b.facing * 100, 160, m.W + 8, '#ff6a3a', b.facing);
            BM.threat(b, { in: m.W, dur: 9, box: BM.box(b, 20, -14, 160, 14), how: 'jump' });
            b.setState('wwind');
          }
          return lashStep(b, t, m, 0) && t > m.W + 22;
        },
        cancel(b) { b.data.lash = null; } },
      /* drop: a high leap; the shadow follows the hero, then stops */
      drop: { w: [2.5, 2.5], range: [60, 999], open: [50, 44],
        run(b, t, m) {
          const d = b.data, a = A(), pl = b.player;
          if (t === 1) {
            m.W = b.tele(28); d.W = m.W; b.setState('slam'); m.T = 44; m.tx = clamp(pl.x, a.x0 + 40, a.x1 - 40);
            m.mk = BM.mark(b, m.tx, 80, m.W + m.T + 4, GOLD);
            m.th = BM.threat(b, { in: m.W + m.T, dur: 5, box: BM.boxAt(m.tx, a.floor - 34, 80, 34), how: 'out' });
            sfx('stomp', { x: b.x, vol: .4 });
          }
          if (t < m.W) { b.vx *= .7; return false; }
          const lock = m.W + m.T - 16;                     // the shadow stops following 16 frames before the fall
          if (t < lock && BM.okP(pl)) { m.tx += clamp(clamp(pl.x, a.x0 + 40, a.x1 - 40) - m.tx, -2.4, 2.4); m.mk.x = m.tx; m.th.box = BM.boxAt(m.tx, a.floor - 34, 80, 34); }
          if (t === m.W) { m.x0 = b.x; b.noGrav = true; sfx('whoosh', { x: b.x }); G.FX.dust(b.x, a.floor, 10, 1.6); }
          if (t >= m.W && t < m.W + m.T) {
            const u = (t - m.W) / m.T; b.x = lerp(m.x0, m.tx, ease(u)); b.y = a.floor - 150 * 4 * u * (1 - u); b.vx = 0; b.vy = 0; b.onGround = false;
            b.facing = Math.sign(m.tx - m.x0) || b.facing;
            return false;
          }
          if (t === m.W + m.T) {
            b.x = m.tx; b.y = a.floor; b.noGrav = false; b.onGround = true; d.landT = t;
            G.shake(.6); G.hitstop(4); sfx('stomp', { x: b.x }); sfx('explosion', { x: b.x, vol: .4 });
            G.FX.shockwave(b.x, a.floor, 60, { pal: 'gold' }); G.FX.dust(b.x, a.floor, 16, 2.2);
            if (b.phase >= 2) for (const dir of [-1, 1]) {
              b.add(new KIT.Shockwave(b.x + 30 * dir, a.floor, dir, { pal: G.Art.FLAME_GOLD, color: GOLD, dmg: .55 * b.dmg, spd: 2.6, life: 90 }));
              crackThreat(b, b.x + 30 * dir, dir, 2.6, 0);
            }
          }
          if (t >= m.W + m.T && t <= m.W + m.T + 4) BM.strike(b, BM.boxAt(b.x, a.floor - 34, 80, 34), { k: 1, kbx: 4, kby: -4, dir: Math.sign(pl.x - b.x) || 1, heavy: true }, m.hit || (m.hit = new Set()));
          return t >= m.W + m.T + 4;
        },
        cancel(b) { b.noGrav = false; } },
      /* inhale: the mound draws breath and the hero in; tumar shelves fall; it bites what is close */
      inhale: { w: [2, 2], cd: [600, 520], open: [62, 56],
        run(b, t, m) {
          const d = b.data, a = A(), pl = b.player;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(30); b.setState('spill'); m.L = 104;
            sfx('boss_roar', { x: b.x, pitch: .55, vol: .5 });
            // the shelves: fixed spots on the walls, the falls are staggered; the one nearest the hero comes first
            const spots = [a.x0 + 70, a.x0 + 190, a.cx - 40, a.cx + 80, a.x1 - 190, a.x1 - 70].filter(x => Math.abs(x - b.x) > 60);
            spots.sort((p, q) => Math.abs(p - pl.x) - Math.abs(q - pl.x));
            const pick = [spots[0], spots[2], spots[3]].filter(x => x !== undefined);
            pick.forEach((x, i) => {
              const delay = m.W + 34 + i * 26;
              b.add(new Shelf(x, a.floor, delay, { dmg: .6 * b.dmg, boss: b }));
              BM.threat(b, { in: delay, dur: 5, box: BM.boxAt(x, a.floor - 40, 44, 40), how: 'out' });
            });
            m.bite = m.W + m.L;
            BM.threat(b, { in: m.bite, dur: 5, box: BM.box(b, -10, -50, 84, 50), how: 'out' });
          }
          if (t >= m.W && t < m.bite) {
            // the pull: slower than a walk, much slower than a roll
            if (BM.okP(pl) && Math.abs(pl.x - b.x) > 30 && pl.state !== 'door') KIT.windPlayer(-Math.sign(pl.x - b.x) * .95);
            d.pull = 1;
            if (t % 3 === 0 && BM.okP(pl)) G.FX.spawn({ x: pl.x + U.rand(-30, 30), y: pl.y - U.rand(4, 40), vx: Math.sign(b.x - pl.x) * U.rand(2, 4), life: 22, size: 1, shape: 'spark', len: 3, color: '#fff2c0', glow: true, glowR: 0 });
          }
          if (t === m.bite - 20) { sfx('boss_roar', { x: b.x, pitch: 1.3, vol: .45 }); G.FX.flashRing && G.FX.flashRing(b.x + b.facing * 16, b.y - 38, 18, { pal: 'gold', rate: 3, ringOnly: true }); }
          if (t >= m.bite && t <= m.bite + 4) {
            d.pull = 0;
            if (t === m.bite) { b.setState('punch'); sfx('hit_heavy', { x: b.x }); G.shake(.3); }
            BM.strike(b, BM.box(b, -10, -50, 84, 50), { k: .9, kbx: 4, kby: -4 }, m.hit || (m.hit = new Set()));
          }
          return t >= m.bite + 4;
        },
        cancel(b) { b.data.pull = 0; } },
      /* the arms round the mound sweep both sides: quick, close, light */
      swipe: { w: [2.5, 2], range: [0, 64], open: [34, 30],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(22); b.setState('kwind'); m.hit = new Set(); BM.hint(b, b.x, 120, m.W + 6, '#ff6a3a'); BM.threat(b, { in: m.W, dur: 6, box: BM.boxAt(b.x, b.y - 30, 120, 30), how: 'roll' }); }
          if (t === m.W) { b.setState('kick'); sfx('swing_heavy', { x: b.x }); G.FX.smear && G.FX.smear({ owner: b, ox: 10, oy: -14, r0: 12, r1: 58, a0: -1.2, a1: .9, dir: b.facing, color: '#e8dccb', color2: '#57506a', life: 10 }); }
          if (t >= m.W && t <= m.W + 5) BM.strike(b, BM.boxAt(b.x, b.y - 30, 120, 30), { k: .5, kbx: 3, kby: -2.5, dir: Math.sign(b.player.x - b.x) || 1 }, m.hit);
          return t >= m.W + 12;
        } },
      /* phase 2: both arms slam the floor, cracks run both ways */
      crack: { ph: 2, w: 3, range: [0, 400], open: 46,
        run(b, t, m) {
          const a = A();
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(30); b.data.W = m.W; b.setState('slam'); m.hit = new Set(); m.noJump = true;
            for (const dir of [-1, 1]) crackThreat(b, b.x + 28 * dir, dir, 3, m.W);
            BM.threat(b, { in: m.W, dur: 5, box: BM.boxAt(b.x, a.floor - 30, 90, 30), how: 'out' }); BM.hint(b, b.x, 90, m.W + 4, '#ff6a3a'); }
          if (t < m.W) { b.vx *= .7; return false; }
          if (t === m.W) {
            b.data.landT = t; G.shake(.55); G.hitstop(3); sfx('stomp', { x: b.x }); G.FX.shockwave(b.x, a.floor, 50, { pal: 'gold' });
            for (const dir of [-1, 1]) b.add(new KIT.Shockwave(b.x + 28 * dir, a.floor, dir, { pal: G.Art.FLAME_GOLD, color: GOLD, dmg: .6 * b.dmg, spd: 3, life: 140 }));
          }
          if (t <= m.W + 4) BM.strike(b, BM.boxAt(b.x, a.floor - 30, 90, 30), { k: .7 }, m.hit);
          return t >= m.W + 10;
        } },
      /* phase 2: tumars thrown round the hero; yellow glow = run */
      burst: { ph: 2, w: 2.5, cd: 360, open: 40,
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(24); b.setState('spill'); }
          if (t === m.W) {
            sfx('magic', { x: b.x }); const fuse = 84;
            const xs = [pl.x, pl.x - 112, pl.x + 112].map(x => clamp(x, a.x0 + 30, a.x1 - 30));
            xs.forEach((x, i) => { const bo = b.add(new Bomb(b.x + b.facing * 14, b.y - 50, x, a.floor, fuse + i * 6, { dmg: .75 * b.dmg, boss: b })); BM.threat(b, { in: fuse + i * 6, dur: 5, box: BM.boxAt(x, a.floor - 54, 72, 54), how: 'out' }); });
          }
          return t >= m.W + 30;
        } },
      /* phase 2: low lash, then a high one 0.4 s later */
      lash2: { ph: 2, w: 3, range: [30, 200], open: 48,
        run(b, t, m) {
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(28); m.hit = new Set(); m.W2 = m.W + 24;
            BM.hint(b, b.x + b.facing * 100, 160, m.W + 8, '#ff6a3a', b.facing);
            BM.threat(b, { in: m.W, dur: 9, box: BM.box(b, 20, -14, 160, 14), how: 'jump' });
            BM.threat(b, { in: m.W2, dur: 9, box: BM.box(b, 20, -40, 160, 22), how: 'roll' });
            b.setState('wwind');
          }
          if (t <= m.W + 14) lashStep(b, t, m, 0);
          else { if (t === m.W + 15) { m.hit = new Set(); sfx('whoosh', { x: b.x, pitch: 1.2 }); } lashStep(b, t - 24, m, 1); }
          return t > m.W2 + 22;
        },
        cancel(b) { b.data.lash = null; } },
      /* phase 2: the fallen bodies come back when they are gone */
      shed: { ph: 2, w: 2, cd: 900, open: 30, ok: b => b.minionsAlive('yd_hollow') < 1,
        run(b, t, m) {
          if (t === 1) { b.vx = 0; m.W = b.tele(26); b.setState('call'); sfx('boss_roar', { x: b.x, pitch: .7, vol: .45 }); }
          if (t === m.W) split(b);
          return t >= m.W + 24;
        } }
    };
    // the whip: wind up from wwind pose, then slide out along the floor (hi = chest height); the tip alone hurts
    function lashStep(b, t, m, hi) {
      const d = b.data, a = A(), W = m.W;
      if (t < 1) return false;
      if (t < W) { const k = ease(t / Math.min(14, W)); d.lash = { L: lerp(24, 36, k), a: lerp(-.7, -2.5, k), curl: .5 }; return false; }
      const u = t - W;
      if (u === 0) { sfx('whoosh', { x: b.x }); b.setState(hi ? 'pcrack' : 'crack'); }
      const L = u <= 8 ? lerp(30, 176, outC(u / 8)) : lerp(176, 30, ease((u - 10) / 12));
      const ang = hi ? lerp(-1.2, .06, outC(u / 5)) : lerp(-1.2, .25, outC(u / 5));
      d.lash = { L, a: ang, curl: .08 };
      if (u <= 8) {
        // the tip (last 34 px) along the floor (low) or at chest height (high)
        const tipX = 16 + Math.cos(ang) * L, y0 = hi ? -40 : -14, h = hi ? 22 : 14;
        BM.strike(b, BM.box(b, Math.max(16, tipX - 34), y0, 34, h), { k: .6, kbx: 3.5, kby: -3.5 }, m.hit);
        if (!hi && u === 6) G.FX.dust(b.x + b.facing * tipX, a.floor, 4, 1.2);
      }
      if (u >= 22) { d.lash = null; return true; }
      return false;
    }
    // when a crack (shockwave from x0 moving dir at spd, starting in `delay` frames) reaches the hero
    function crackThreat(b, x0, dir, spd, delay) {
      const pl = b.player; if (!BM.okP(pl)) return;
      const dist = (pl.x - x0) * dir; if (dist < 0) return;
      const at = delay + Math.max(0, Math.round((dist - 12) / spd));
      BM.threat(b, { in: at, dur: Math.ceil(20 / spd) + 2, box: BM.boxAt(pl.x, A().floor - 18, 26, 18), how: 'jump', wave: { x0, dir, spd, t0: BM.now() + delay } });
    }
    function split(b) {
      const a = A();
      G.FX.burst(b.x, b.y - 30, 16, { speed: 3, life: 40, size: 2, colors: ['#57506a', '#3c364e', '#ffd77a'], grav: .1 });
      for (const dir of [-1, 1]) {
        if (b.minionsAlive('yd_hollow') >= 2) break;
        const x = clamp(b.x + dir * 70, a.x0 + 30, a.x1 - 30);
        const mn = b.minion('yd_hollow', x, a.floor);
        if (mn) { G.FX.poof(x, a.floor - 14, { pal: 'gold', r: 12 }); mn.vx = dir * 2; }
      }
      sfx('summon', { x: b.x });
    }

    BM.install('glutton', {
      moves, rest: [46, 36], moteColor: '#ffe9b0',
      def0: { hp: 470, dmg: 21, phaseAt: [.5] },
      setup(b) { b.contact = 0; },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer();
        const dx = Math.abs(pl.x - b.x), want = 84;
        const dir = dx > want + 20 ? Math.sign(pl.x - b.x) : dx < 40 ? -Math.sign(pl.x - b.x) * .5 : 0;
        b.vx = U.approach(b.vx, dir * .75 * b.spdK(), .06);
      },
      recover(b) { const d = b.data; if (d.recMv === 'ram') { if (d.fist) d.fist = { x: 72 + Math.sin(b.t * .8) * (d.rec < 18 ? 2 : .6), y: -6 + (d.rec < 18 ? -3 * (1 - d.rec / 18) : 0) }; if (d.rec < 2) d.fist = null; } else d.fist = null; },
      onPhaseInterrupt(b) { const d = b.data; d.fist = null; d.lash = null; d.pull = 0; b.noGrav = false; },
      onPhase(b, ph) { if (ph === 2) split(b); },
      onDying(b) { const d = b.data; d.fist = null; d.lash = null; d.pull = 0; b.noGrav = false; }
    });
    { const def = ED.glutton, op = def.onPhase; def.onPhase = function (b, ph) { op && op.call(this, b, ph); BM.specs.glutton.onPhase(b, ph); }; }
  } catch (e) { console.error('[glutton]', e); }
}
