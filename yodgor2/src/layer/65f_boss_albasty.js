/* 65f_boss_albasty.js — stage 8a: Albasty, Mother of the Karez (GDD ch. 17 §5). A drowned giantess, hair longer than she is, feet
   turned backwards. The cistern is part of the fight: deep pools at both ends, salt heaped at their edges.
   Phase 1:  claws (two rakes, a step with each)
             lunge (she sinks; a ripple runs under the water to you, stops — and she bursts up there)
             hair (her hair lashes out in a long arc at chest height: roll)
             shriek (a scream that stuns whoever stands close: get away or roll)
   Phase 2 (60%): the water rises — the pools spread inward and the dry floor shrinks; in deep water you wade slowly and she swims.
             drag (hands come up from under you: a ring on the floor, then she drags you to the deep water)
             rain (her hair falls from the vault in wet ropes where the marks are)
             tide (she slaps the water: waves run both ways — jump)
             lunge comes twice
   Phase 3 (30%): the water drains away. She crawls on her hands, fast, and her backward feet lie about her direction:
             crawl (she turns her back, then rushes at you backwards — the line on the floor tells the truth)
             scurry (she skitters past you and rakes from the other side)
   Window: salt. If she bursts out of the water into the salt at a pool's edge, she reels for 3 s (that heap is spent;
   the salt is heaped anew with each phase). Lure her lunges and drags onto the salt. */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (BM && ED && ED.albasty) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const ease = k => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
    const A = () => BM.arena(), sfx = BM.sfx;
    const TEAL = '#5ff2ff', SALT = '#f4f0e8';
    const TX = {
      rise: `The water rises|Вода поднимается|Suv ko'tarilmoqda`,
      fall: `The water drains away|Вода уходит|Suv chekinmoqda`,
      salt: `Salt! She reels|Соль! Она шатается|Tuz! U gandiraklayapti`,
      hint: `Salt burns her — lure her into it|Соль жжёт её — заманите её в соль|Tuz uni kuydiradi — uni tuzga torting`
    };
    // the pools: width from each wall; the salt heaps sit at their inner edge
    const POOL = [150, 236, 120];
    const poolW = b => b.data.poolW || POOL[0];
    const inDeep = (b, x) => { const a = A(), w = poolW(b); return x < a.x0 + w || x > a.x1 - w; };
    function heapSalt(b) {
      const a = A(), w = POOL[Math.min(2, b.phase - 1)];
      b.data.salt = [{ x: a.x0 + w + 6, ok: true }, { x: a.x1 - w - 6, ok: true }];
    }
    // she surfaces at x: the salt check
    function surface(b, x) {
      const d = b.data;
      const s = (d.salt || []).find(q => q.ok && Math.abs(q.x - x) < 36);
      if (!s) return false;
      s.ok = false;
      BM.ev(b, 'salt', 'stagger');
      G.FX.burst(s.x, A().floor - 8, 18, { speed: 3, life: 40, size: 1, colors: [SALT, '#ffffff', '#c8d8d0'], grav: .12 });
      sfx('break', { x: s.x }); sfx('boss_roar', { x: b.x, pitch: 1.5, vol: .6 });
      G.FX.text(b.x, b.top - 16, t(TX.salt), '#ffffff', { size: 8 });
      G.shake(.4);
      return true;
    }
    const salted = (b, m) => { b.data.saltT = 180; b.setState('shriek'); return 180; };

    /* a rope of wet hair falling from the vault */
    class Rope extends KIT.Hazard {
      constructor(x, y, delay, o) { super(x, y, 20, 10, Object.assign({ delay, rehit: 0 }, o)); this.top0 = A().floor - 240; }
      update() {
        super.update();
        if (this.t === 1 && this.boss) this.boss.add(new KIT.Marker({ style: 'column', x: this.x, y: this.y, w: 22, life: this.delay + 2, color: TEAL, top0: this.top0 }));
        if (this.t >= this.delay && this.t <= this.delay + 6) this.hitBox({ x: this.x - 10, y: this.y - 110, w: 20, h: 110 }, { kbx: 2, kby: -3, dir: G.U.sign(G.world.player.x - this.x) || 1, dmgColor: TEAL });
        if (this.t === this.delay) { sfx('whoosh', { x: this.x, pitch: .7 }); G.FX.dust(this.x, this.y, 4, 1); for (let i = 0; i < 6; i++) G.FX.spawn({ x: this.x + U.rand(-6, 6), y: this.y - 4, vx: U.rand(-1, 1), vy: -U.rand(1, 2.5), grav: .15, life: 26, size: 1, color: TEAL }); }
        if (this.t > this.delay + 26) this.dead = true;
      }
      drawFx(ctx) {
        const k = this.t - this.delay; if (k < -10 || k > 26) return;
        const top = this.top0, bot = k < 0 ? lerp(top, this.y, ease((k + 10) / 10)) : this.y, a = k > 14 ? 1 - (k - 14) / 12 : 1;
        ctx.globalAlpha = a;
        for (let s = 0; s < 3; s++) { ctx.fillStyle = s === 1 ? '#1c3631' : '#081214'; for (let y = top; y < bot; y += 2) ctx.fillRect(Math.round(this.x - 3 + s * 3 + Math.sin(y * .05 + s + this.t * .2) * 2), Math.round(y), 2, 2); }
        ctx.globalAlpha = 1;
      }
    }

    const moves = {
      claws: { w: [4, 3, 2], range: [0, 90], open: [38, 34, 30],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(24); d.W = m.W; b.setState('rwind'); m.T = [m.W, m.W + 36]; m.T.forEach(T => BM.threat(b, { in: T, dur: 5, box: () => BM.box(b, -4, -60, 64, 60), how: 'roll', noWalk: true })); BM.hint(b, b.x + b.facing * 34, 70, m.W + 4, '#5ff2ff', b.facing); }
          for (let i = 0; i < 2; i++) {
            const T = m.T[i];
            if (t === T - 10 && i) { b.setState('rwind'); b.facePlayer(); }
            if (t === T) { b.setState('rake'); b.vx = 3 * b.facing; sfx('swing_heavy', { x: b.x, pitch: 1.2 }); G.FX.smear && G.FX.smear({ owner: b, ox: 8, oy: -36, r0: 14, r1: 58, a0: -1.8, a1: .8, dir: b.facing, color: '#e8fff8', color2: '#3a9a90', life: 9 }); }
            if (t >= T && t <= T + 4) BM.strike(b, BM.box(b, -4, -60, 64, 60), { k: .7, kbx: 3.5, kby: -3 }, m['h' + i] || (m['h' + i] = new Set()));
          }
          b.vx *= .85; if (b.fly) b.vy *= .85;
          return t >= m.T[1] + 12;
        } },
      lunge: { w: [3, 3, 0], until: 2, open: [46, 42, 40], cd: [0, 0, 0],
        run(b, t, m) { return lungeRun(b, t, m, b.phase >= 2 ? 2 : 1); },
        cancel(b) { b.alpha = 1; b.untargetable = false; } },
      hair: { w: [3, 3, 2], range: [40, 220], open: [40, 36, 32],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(28); d.W = m.W; b.setState('tide');
            BM.hint(b, b.x + b.facing * 100, 180, m.W + 6, '#5ff2ff', b.facing);
            BM.threat(b, { in: m.W, dur: 8, box: () => BM.box(b, 10, -44, 180, 30), how: 'roll' }); m.hit = new Set();
          }
          if (t === m.W) sfx('whoosh', { x: b.x, pitch: .6 });
          if (t >= m.W && t <= m.W + 8) {
            // the hair whips along an arc from over her head down to chest height far in front
            const u = (t - m.W) / 8, L = lerp(40, 190, u), y = lerp(-90, -30, u);
            BM.strike(b, BM.box(b, Math.max(10, L - 50), y - 14, 50, 30), { k: .8, kbx: 4, kby: -3 }, m.hit);
            d.lashP = { L, y, u };
          } else if (t > m.W + 8 && t < m.W + 20) d.lashP = { L: lerp(190, 60, (t - m.W - 8) / 12), y: -30, u: 1 };
          else d.lashP = t < m.W ? { L: 30, y: -96 + 6 * Math.sin(t * .3), u: 0 } : null;
          b.vx *= .85; if (b.fly) b.vy *= .85;
          return t >= m.W + 20;
        },
        cancel(b) { b.data.lashP = null; } },
      shriek: { w: [2.5, 2, 2], range: [0, 110], open: [44, 40, 36],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(26); b.setState('shriek'); m.hit = new Set(); BM.ring(b, b.x, 170, m.W + 4, TEAL); BM.threat(b, { in: m.W, dur: 6, box: BM.boxAt(b.x, b.y - 100, 170, 100), how: 'out' }); }
          if (t === m.W) { sfx('boss_roar', { x: b.x, pitch: 1.9, vol: .7 }); G.FX.ring(b.x, b.y - 50, 8, 90, TEAL, 18, { width: 3 }); G.shake(.3); }
          if (t >= m.W && t <= m.W + 5) BM.strike(b, BM.boxAt(b.x, b.y - 100, 170, 100), { k: .4, kbx: 3, kby: -2, dir: Math.sign(b.player.x - b.x) || 1, stun: 45, type: 'magic' }, m.hit);
          b.vx *= .85; if (b.fly) b.vy *= .85;
          return t >= m.W + 16;
        } },
      /* phase 2 */
      drag: { ph: 2, w: [0, 3, 0], until: 2, cd: 300, open: [0, 48, 0],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) { m.W = b.tele(20); b.setState('drown'); sfx('splash', { x: b.x }); }
          if (t === m.W) { b.alpha = 0; b.untargetable = true; G.FX.burst(b.x, a.floor - 6, 12, { speed: 2.5, life: 30, size: 1, colors: [TEAL, '#ffffff'], grav: .1 }); m.rx = clamp(pl.x, a.x0 + 30, a.x1 - 30); m.ring = BM.ring(b, m.rx, 56, 60, TEAL); m.th = BM.threat(b, { in: 60, dur: 6, box: BM.boxAt(m.rx, a.floor - 40, 56, 40), how: 'out' }); }
          if (t > m.W && t < m.W + 36 && BM.okP(pl)) { m.rx += clamp(clamp(pl.x, a.x0 + 30, a.x1 - 30) - m.rx, -1.6, 1.6); m.ring.x = m.rx; m.th.box = BM.boxAt(m.rx, a.floor - 40, 56, 40); b.x = m.rx; }
          if (t === m.W + 60) {
            b.x = m.rx; b.y = a.floor - 6; b.alpha = 1; b.untargetable = false; b.setState('drown');
            G.FX.burst(m.rx, a.floor - 6, 20, { speed: 3.5, life: 34, size: 1, colors: [TEAL, '#ffffff'], grav: .15 }); sfx('hit_heavy', { x: m.rx });
            if (surface(b, m.rx)) return salted(b, m);
            if (BM.okP(pl) && !G.godMode && G.U.overlap(BM.boxAt(m.rx, a.floor - 40, 56, 40), pl.box()) && !(pl.state === 'roll' && pl.rollT < 13) && !(pl.invulnT > 0)) {
              m.caught = t; BM.hits.push({ t: BM.now(), id: b.def.id, mv: 'drag', dmg: 0, ph: b.phase, caught: true });
            }
          }
          if (m.caught) {
            const k = t - m.caught, deep = pl.x < a.cx ? a.x0 + poolW(b) / 2 : a.x1 - poolW(b) / 2;
            if (k < 30) { pl.x += clamp(deep - pl.x, -3, 3); b.x = pl.x; pl.vx = 0; pl.y = a.floor; pl.invulnT = Math.max(pl.invulnT, 2); return false; }
            if (k === 30) { pl.invulnT = 0; G.Combat.hit(b, pl, { dmg: 1.1 * b.dmg, kbx: 3, kby: -5, dir: Math.sign(pl.x - b.x) || 1, type: 'melee' }); G.FX.burst(pl.x, a.floor - 6, 16, { speed: 3, life: 30, size: 1, colors: [TEAL, '#ffffff'], grav: .15 }); }
            return k >= 40;
          }
          return t >= m.W + 74;
        },
        cancel(b, m) { b.alpha = 1; b.untargetable = false; const pl = b.player; if (m.caught && pl) pl.invulnT = 0; } },
      rain: { ph: 2, w: [0, 2.5, 2], open: [0, 36, 32],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.W = b.tele(24); b.setState('rain'); }
          if (t === m.W) {
            const xs = [pl.x, pl.x - 64, pl.x + 64, pl.x + U.rand(130, 200) * (Math.random() < .5 ? 1 : -1), pl.x + U.rand(-260, 260)].map(x => clamp(x, a.x0 + 16, a.x1 - 16));
            xs.forEach((x, i) => { const delay = 44 + i * 10; b.add(new Rope(x, a.floor, delay, { dmg: .6 * b.dmg, boss: b })); BM.threat(b, { in: delay, dur: 7, box: BM.boxAt(x, a.floor - 110, 20, 110), how: 'out' }); });
          }
          b.vx *= .85; if (b.fly) b.vy *= .85;
          return t >= m.W + 90;
        } },
      tide: { ph: 2, w: [0, 2.5, 0], until: 2, open: [0, 40, 0],
        run(b, t, m) {
          const a = A(), d = b.data;
          if (t === 1) {
            m.W = b.tele(26); d.W = m.W; b.setState('tide'); m.x = clamp(b.x, a.x0 + 30, a.x1 - 30);
            for (const dir of [-1, 1]) {
              const x0 = m.x + 14 * dir, pl = b.player, dist = BM.okP(pl) ? (pl.x - x0) * dir : -1;
              if (dist >= -12) BM.threat(b, { in: m.W + Math.max(0, Math.round((dist - 12) / 2.6)), dur: 8, box: BM.boxAt(pl.x, a.floor - 20, 26, 20), how: 'jump', wave: { x0, dir, spd: 2.6, t0: BM.now() + m.W } });
            }
          }
          if (t === m.W) {
            G.shake(.4); sfx('splash', { x: b.x });
            for (const dir of [-1, 1]) b.add(new KIT.Shockwave(m.x + 14 * dir, a.floor, dir, { pal: G.Art.FLAME_SPIRIT, color: TEAL, dmg: .55 * b.dmg, spd: 2.6, status: { slow: { t: 60 } } }));
          }
          b.vx *= .85; if (b.fly) b.vy *= .85;
          return t >= m.W + 30;
        } },
      /* phase 3: on her hands */
      crawl: { ph: 3, w: [0, 0, 5], range: [60, 999], open: [0, 0, 46],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) {
            m.dir = Math.sign(pl.x - b.x) || 1; b.facing = -m.dir; d.back = true;           // her back to you — the feet point your way
            m.W = b.tele(26); b.setState('crawl'); b.vx = 0;
            const len = Math.min(220, Math.abs(pl.x - b.x) + 70);
            BM.hint(b, b.x + m.dir * len / 2, len, m.W + 4, '#ff6a3a', m.dir);
            m.th = BM.threat(b, { in: m.W + Math.max(0, Math.round((Math.abs(pl.x - b.x) - 30) / 7)), dur: 7, box: () => BM.boxAt(b.x, a.floor - 34, 60, 34), how: 'any', noWalk: true });
            m.hit = new Set(); m.len = len;
          }
          if (t < m.W) { b.vx *= .7; return false; }
          if (t < m.W + m.len / 7) {
            b.vx = 7 * m.dir; if (t % 3 === 0) G.FX.dust(b.x, a.floor, 2, 1.6);
            BM.strike(b, BM.boxAt(b.x, a.floor - 34, 60, 34), { k: .8, kbx: 4 * m.dir, kby: -3, dir: m.dir }, m.hit);
            return false;
          }
          b.vx *= .8; d.back = false; b.facing = m.dir;
          return t >= m.W + m.len / 7 + 6;
        },
        cancel(b) { b.data.back = false; } },
      scurry: { ph: 3, w: [0, 0, 3], range: [0, 160], open: [0, 0, 40],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.side = Math.sign(b.x - pl.x) || 1; m.tx = clamp(pl.x - m.side * 64, a.x0 + 30, a.x1 - 30); b.setState('crawl'); sfx('whoosh', { x: b.x, pitch: 1.5 }); }
          if (!m.arr) {
            b.vx = clamp(m.tx - b.x, -6, 6); if (t % 3 === 0) G.FX.dust(b.x, a.floor, 2, 1.4);
            if (Math.abs(m.tx - b.x) < 6 || t > 60) { m.arr = t; b.vx = 0; b.facePlayer(); m.W = b.tele(18); b.setState('rwind'); BM.threat(b, { in: m.W, dur: 5, box: () => BM.box(b, -4, -60, 64, 60), how: 'roll' }); BM.hint(b, b.x + b.facing * 34, 70, m.W + 4, '#5ff2ff', b.facing); }
            return false;
          }
          const k = t - m.arr;
          if (k === m.W) { b.setState('rake'); b.vx = 3 * b.facing; sfx('swing_heavy', { x: b.x, pitch: 1.3 }); }
          if (k >= m.W && k <= m.W + 4) BM.strike(b, BM.box(b, -4, -60, 64, 60), { k: .7, kbx: 3.5, kby: -3 }, m.hit || (m.hit = new Set()));
          b.vx *= .85;
          return k >= m.W + 12;
        } }
    };
    // she sinks, a ripple runs under the water to the hero, stops; she bursts out (n times)
    function lungeRun(b, t, m, n) {
      const a = A(), pl = b.player, d = b.data;
      if (t === 1) { m.k = 0; m.W = b.tele(20); b.setState('drown'); m.st = 'sink'; m.t0 = 1; }
      const k = t - m.t0;
      if (m.st === 'sink') {
        if (k === m.W) { b.alpha = 0; b.untargetable = true; G.FX.burst(b.x, a.floor - 6, 12, { speed: 2.5, life: 30, size: 1, colors: [TEAL, '#ffffff'], grav: .1 }); sfx('splash', { x: b.x }); m.rx = b.x; m.st = 'run'; m.t0 = t; }
        b.vx *= .8; return false;
      }
      if (m.st === 'run') {
        const tx = clamp(pl.x, a.x0 + 24, a.x1 - 24);
        m.rx += clamp(tx - m.rx, -3.2, 3.2); b.x = m.rx; b.y = a.floor;
        d.ripple = { x: m.rx, t: t };
        if (Math.abs(tx - m.rx) < 4 || k > 70) {
          m.st = 'wait'; m.t0 = t; m.mk = BM.ring(b, m.rx, 64, 32, TEAL);
          BM.threat(b, { in: 32, dur: 6, box: BM.boxAt(m.rx, a.floor - 76, 64, 76), how: 'out' });
          sfx('telegraph', { x: m.rx, pitch: .7 });
        }
        return false;
      }
      if (m.st === 'wait') {
        d.ripple = { x: m.rx, t: t, hot: true };
        if (k === 32) {
          b.x = m.rx; b.y = a.floor - 10; b.alpha = 1; b.untargetable = false; b.setState('dive'); d.dv = [0, -1]; d.ripple = null;
          G.FX.burst(m.rx, a.floor - 6, 24, { speed: 4, life: 36, size: 1, colors: [TEAL, '#ffffff', '#bff8ee'], grav: .15 }); sfx('hit_heavy', { x: m.rx }); G.shake(.35);
          m.k++;
          if (surface(b, m.rx)) return salted(b, m);
          m.hit = new Set();
        }
        if (k >= 32 && k <= 37) BM.strike(b, BM.boxAt(m.rx, a.floor - 76, 64, 76), { k: 1, kbx: 3, kby: -5.5, dir: Math.sign(pl.x - m.rx) || 1, heavy: true }, m.hit);
        if (k > 37) {
          if (m.k < n) { if (k === 46) { m.st = 'sink'; m.t0 = t; m.W = 14; } return false; }
          return k >= 46;
        }
        return false;
      }
      return false;
    }

    BM.install('albasty', {
      moves, rest: [44, 36, 30], moteColor: '#bff8ee',
      def0: { hp: 880, dmg: 21 },
      setup(b) { b.contact = 0; heapSalt(b); b.data.poolW = POOL[0]; },
      tick(b) {
        const d = b.data, a = A(), pl = b.player;
        // the water level follows the phase
        const want = POOL[Math.min(2, b.phase - 1)];
        d.poolW = U.approach(d.poolW || want, want, .6);
        if (d.saltT > 0) d.saltT--;
        if (!d.hinted && b.mode === 'fight' && b.modeT > 90) { d.hinted = 1; G.UI && G.UI.toast && G.UI.toast(t(TX.hint), SALT); }
        // deep water (phase 2) slows the hero
        if (b.mode === 'fight' && b.phase === 2 && BM.okP(pl) && pl.onGround && inDeep(b, pl.x)) { if (!pl.st.slow || pl.st.slow.t < 4) pl.addStatus('slow', { t: 6 }); if (b.t % 9 === 0) G.FX.spawn({ x: pl.x + U.rand(-5, 5), y: a.floor - 4, vy: -.4, life: 14, size: 1, color: TEAL }); }
        if (b.mode === 'fight' && !d.mv) d.ripple = null;
      },
      idle(b) {
        const pl = b.player, a = A(); if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer(); b.alpha = 1; b.untargetable = false;
        const u = pl.x - b.x, dx = Math.abs(u), want = b.phase >= 3 ? 70 : 80;
        const dir = dx > want + 20 ? Math.sign(u) : dx < want - 30 ? -Math.sign(u) : 0;
        b.vx = U.approach(b.vx, dir * (b.phase >= 3 ? 2.2 : 1.1) * b.spdK(), .08);
        if (b.fly) { const ty = a.floor - (b.phase === 2 ? 4 : b.phase >= 3 ? 0 : 6) + Math.sin(b.t * .05) * 2; b.vy = clamp((ty - b.y) * .1, -1.5, 1.5); }
      },
      recover(b) { const d = b.data; b.alpha = 1; b.untargetable = false; if (d.saltT > 0 && b.state !== 'shriek' && b.state !== 'recover') b.setState('recover'); if (d.saltT > 0 && b.t % 6 === 0) G.FX.spawn({ x: b.x + U.rand(-12, 12), y: b.y - U.rand(10, 60), vy: -.6, life: 20, shape: 'star', size: 2, color: SALT, glow: true }); },
      onPhaseInterrupt(b) { const d = b.data; b.alpha = 1; b.untargetable = false; d.ripple = null; d.lashP = null; d.back = false; },
      onPhase(b, ph) { heapSalt(b); if (ph === 2) G.UI && G.UI.toast && G.UI.toast(t(TX.rise), TEAL); if (ph === 3) G.UI && G.UI.toast && G.UI.toast(t(TX.fall), TEAL); },
      onDying(b) { b.alpha = 1; b.data.ripple = null; b.data.lashP = null; },
      drawFx(ctx, b) {
        const d = b.data, a = A(), w = Math.round(d.poolW || POOL[0]), t2 = b.t;
        // the pools: dark water at both ends, a bright surface line, slow ripples
        const depth = b.phase === 2 ? 26 : 14;
        for (const side of [-1, 1]) {
          const x0 = side < 0 ? a.x0 : a.x1 - w, y = a.floor - depth;
          ctx.globalAlpha = .55; ctx.fillStyle = '#0a2a30'; ctx.fillRect(Math.round(x0), Math.round(y), w, depth);
          ctx.globalAlpha = .8; ctx.fillStyle = '#3aa8b0';
          for (let x = 0; x < w; x += 2) ctx.fillRect(Math.round(x0 + x), Math.round(y + Math.sin((x0 + x) * .08 + t2 * .07) * 1.2), 2, 1);
          ctx.globalAlpha = .5; ctx.fillStyle = '#bff8ee';
          for (let x = 6; x < w; x += 23) if (((x + (t2 >> 3)) % 46) < 23) ctx.fillRect(Math.round(x0 + x), Math.round(y + 3), 6, 1);
          ctx.globalAlpha = 1;
          G.Light && G.Light.add(x0 + w / 2, y, w * .7, '#2a8a90', .25);
        }
        // salt heaps at the pools' edges
        for (const s of d.salt || []) {
          const x = Math.round(s.x), y = a.floor;
          if (s.ok) {
            ctx.fillStyle = '#9a948a'; ctx.fillRect(x - 9, y - 3, 18, 3); ctx.fillStyle = '#d8d2c6'; ctx.fillRect(x - 7, y - 5, 14, 3); ctx.fillStyle = SALT; ctx.fillRect(x - 4, y - 7, 8, 3); ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 8, 2, 1);
            if ((t2 >> 4) % 3 === 0) { ctx.fillStyle = '#ffffff'; ctx.fillRect(x + 3, y - 6, 1, 1); }
            G.Glow.add(x, y - 4, 16, '#ffffff', .25);
          } else { ctx.fillStyle = '#6a665e'; ctx.fillRect(x - 8, y - 2, 16, 2); }
        }
        // the ripple of her under the water
        if (d.ripple) {
          const r = d.ripple, y = a.floor - 3;
          for (let i = 0; i < 3; i++) { const rr = ((t2 * .6 + i * 8) % 24); ctx.globalAlpha = (1 - rr / 24) * (r.hot ? 1 : .7); ctx.fillStyle = r.hot ? '#ffffff' : TEAL; for (let k = -1; k <= 1; k += 2) ctx.fillRect(Math.round(r.x + k * rr * 1.4), y, 3, 1); }
          ctx.globalAlpha = 1; G.Glow.add(r.x, y, 18, TEAL, .45);
          if (t2 % 3 === 0) G.FX.spawn({ x: r.x + U.rand(-8, 8), y, vy: -U.rand(.3, 1), life: 14, size: 1, color: '#bff8ee' });
        }
        // the hair lash
        if (d.lashP && b.alpha > .3) {
          const p = d.lashP, f = b.facing, hx = b.x, hy = b.y - 70;
          ctx.fillStyle = '#081214';
          for (let i = 0; i <= 24; i++) { const u = i / 24, x = hx + f * p.L * u, y = lerp(hy, b.y + p.y, u) - Math.sin(u * Math.PI) * 18 * (1 - p.u); ctx.fillRect(Math.round(x), Math.round(y), 2, 2 + (i < 8 ? 1 : 0)); }
          ctx.fillStyle = '#2e504a'; for (let i = 0; i <= 24; i += 3) { const u = i / 24, x = hx + f * p.L * u, y = lerp(hy, b.y + p.y, u) - Math.sin(u * Math.PI) * 18 * (1 - p.u); ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
        }
      }
    });
    { const def = ED.albasty, op = def.onPhase; def.onPhase = function (b, ph) { op && op.call(this, b, ph); BM.specs.albasty.onPhase(b, ph); }; }
  } catch (e) { console.error('[albasty]', e); }
}
