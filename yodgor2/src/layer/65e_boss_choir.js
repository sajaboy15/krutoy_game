/* 65e_boss_choir.js — stage 8a: the Silent Choir (GDD ch. 17 §4). Seven singers whose soundless song drinks memory: every blow
   that lands adds Hollowness (60_world.js). The lead singer in the middle of the row carries the body.
   Phase 1:  rings (rings of silence roll out along the floor both ways: jump them)
             wave (the whole row opens its mouths: a wall of silence crosses the arena — roll through it; then all seven stand
                   open for 2 s and take more damage)
             teleport (the row fades and reappears behind the hero, singing a fan of notes as it lands)
             wail (a fan of slow notes)
   Phase 2 (66%): glyphs (a ring of glyphs closes round the hero, turning; leave by the gap or roll through it)
             note (the soloist steps out of the row and holds the note somewhere in the hall: while he sings the others cannot
                   be touched; find him and strike him three times — the note breaks and the row reels; if he is left alone
                   the note ends in a wall of silence)
   Phase 3 (33%): ink (ink tears drip from their eyes and pool on the floor: no healing inside the ink)
             chorus (rings and the wall together: jump, then roll)
             shards (frozen notes fall where the marks are) */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (BM && ED && ED.choir) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const A = () => BM.arena(), sfx = BM.sfx;
    const ICE = '#bfe8ff', INK = '#2a1840';
    const TX = {
      solo: `The soloist holds the note|Солист держит ноту|Yakkaxon notani cho'zmoqda`,
      found: `The note breaks!|Нота сорвалась!|Nota uzildi!`,
      silent: `Untouchable|Неуязвимы|Daxlsiz`
    };
    const tag = h => { if (h) h._choir = true; return h; };

    /* a ring of silence rolling along the floor (a Shockwave: companions hop it) */
    class Ring extends KIT.Shockwave {
      drawFx(ctx) {
        const x = Math.round(this.x), y = Math.round(this.y), a = Math.min(1, (this.life - this.t) / 12);
        ctx.globalAlpha = .85 * a; ctx.fillStyle = '#e8f6ff';
        for (let i = 0; i < 20; i++) { const an = i / 20 * Math.PI * 2, px = x + Math.cos(an) * 5, py = y - 9 + Math.sin(an) * 9; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); }
        ctx.globalAlpha = .45 * a; ctx.fillStyle = '#9fdcff';
        for (let i = 0; i < 14; i++) { const an = i / 14 * Math.PI * 2, px = x - this.dir * 4 + Math.cos(an) * 3, py = y - 8 + Math.sin(an) * 6; ctx.fillRect(Math.round(px), Math.round(py), 1, 1); }
        ctx.globalAlpha = 1;
        G.Glow.add(x, y - 9, 22, '#6ac8ff', .5 * a);
      }
    }
    /* the wall of silence: a tall pale band crossing the hall (too tall to jump: roll through) */
    class Wall extends KIT.Hazard {
      constructor(x, y, dir, o) { super(x, y, 10, 74, Object.assign({ dir, spd: 3.4, life: 260, rehit: 0 }, o)); }
      update() {
        super.update();
        this.x += this.dir * this.spd;
        const a = A();
        if (this.t > this.life || this.x < a.x0 - 6 || this.x > a.x1 + 6) { this.dead = true; return; }
        this.hitBox({ x: this.x - 5, y: this.y - 74, w: 10, h: 74 }, { kbx: 3 * this.dir, kby: -2, dir: this.dir, type: 'magic', dmgColor: ICE });
        if (this.t % 3 === 0 && G.onScreen(this.x, this.y)) G.FX.spawn({ x: this.x + U.rand(-4, 4), y: this.y - U.rand(4, 70), vx: -this.dir * U.rand(.2, .8), life: 18, size: 1, color: '#e8f6ff', glow: true, glowR: 0 });
        G.Light && G.Light.add(this.x, this.y - 36, 60, '#bfe8ff', .5);
      }
      drawFx(ctx) {
        const x = Math.round(this.x), y = Math.round(this.y);
        for (let k = 0; k < 74; k += 2) { const w = 3 + Math.round(2 * Math.sin(this.t * .4 + k * .3)); ctx.globalAlpha = .25 + .35 * Math.abs(Math.sin(k * .2 + this.t * .2)); ctx.fillStyle = k % 6 ? '#bfe8ff' : '#ffffff'; ctx.fillRect(x - w, y - k, 2 * w, 1); }
        ctx.globalAlpha = 1;
        G.Glow.add(x, y - 36, 40, '#6ac8ff', .5);
      }
    }
    /* ink of silence: a pool where nobody can heal (not a danger to step in) */
    class Ink extends G.Entity {
      constructor(x, y, w, life) { super(x, y, w, 4); this.w = w; this.life = life; this.layer = 1; this.kind = 'fx'; this.t = 0; }
      update() { this.t++; if (this.t > this.life) this.dead = true; }
      vanish() { this.dead = true; }
      k() { return Math.min(1, this.t / 40) * Math.min(1, (this.life - this.t) / 40); }
      drawFx(ctx) {
        const k = this.k(), w = Math.round(this.w * k), x = Math.round(this.x), y = Math.round(this.y);
        if (w < 2) return;
        ctx.globalAlpha = .85; ctx.fillStyle = '#120a1e'; ctx.fillRect(x - (w >> 1), y - 2, w, 2);
        ctx.fillStyle = INK; ctx.fillRect(x - (w >> 1) + 2, y - 3, w - 4, 1);
        ctx.fillStyle = '#5a3a8a'; for (let i = 0; i < w - 6; i += 7) if ((i * 7 + (this.t >> 3)) % 5 < 2) ctx.fillRect(x - (w >> 1) + 3 + i, y - 3, 2, 1);
        ctx.globalAlpha = 1;
        G.Glow.add(x, y - 2, w * .6, '#5a2a9a', .3 * k);
      }
    }
    BM.noHeal.push(p => { const bz = G.Game && G.Game.boss; if (!bz || bz.dead || !bz.def || bz.def.id !== 'choir' || !bz.data.ink) return false; return bz.data.ink.some(o => !o.dead && o.k() > .3 && Math.abs(p.x - o.x) < o.w / 2 && Math.abs(p.y - o.y) < 10); });

    function rings(b, delay, dirs, spd) {
      const a = A();
      for (const dir of dirs) {
        const x0 = b.x + 8 * dir;
        b.data.q = b.data.q || [];
        b.data.q.push({ at: BM.now() + delay, fn: () => tag(b.add(new Ring(x0, a.floor, dir, { dmg: .55 * b.dmg, spd, life: 300, h: 18, color: ICE, owner: b, pal: G.Art.FLAME_ICE || G.Art.FLAME_SPIRIT }))) });
        const pl = b.player; if (!BM.okP(pl)) continue;
        const dist = (pl.x - x0) * dir; if (dist < -10) continue;
        BM.threat(b, { in: delay + Math.max(0, Math.round((dist - 12) / spd)), dur: 8, box: BM.boxAt(pl.x, a.floor - 20, 26, 20), how: 'jump', wave: { x0, dir, spd, t0: BM.now() + delay } });
      }
    }
    function wall(b, x0, delay, dirs) {
      const a = A();
      for (const dir of dirs) {
        b.data.q = b.data.q || [];
        b.data.q.push({ at: BM.now() + delay, fn: () => tag(b.add(new Wall(x0 + 10 * dir, a.floor, dir, { dmg: .8 * b.dmg }))) });
        const pl = b.player; if (!BM.okP(pl)) continue;
        if ((pl.x - x0) * dir < -6) continue;
        const th = BM.threat(b, { in: delay, dur: 300, box: { x: a.x0, y: a.floor - 80, w: a.x1 - a.x0, h: 80 }, how: 'roll' });
        const t0 = BM.now() + delay;
        th.rollTo = () => x0 + 10 * dir + dir * 3.4 * (BM.now() - t0);
        th.dyn = p => { const wx = x0 + 10 * dir + dir * 3.4 * (BM.now() - t0); const d = (p.x - wx) * dir; if (d < -10) return null; return Math.round((d - 8) / (3.4 + 1)) ; };
      }
    }
    function fan(b, n, spd) {
      const pl = b.player; if (!BM.okP(pl)) return;
      const x = b.x + 10 * b.facing, y = b.cy - 10, base = Math.atan2(pl.cy - y, pl.x - x);
      const P = [];
      for (let i = 0; i < n; i++) {
        const an = base + .22 * (i - (n - 1) / 2);
        P.push(b.add(new G.Projectile({ x, y, vx: Math.cos(an) * spd, vy: Math.sin(an) * spd, r: 3, grav: 0, life: 220, dmg: .5 * b.dmg, faction: 'enemy', owner: b, color: '#e8f4ff', kbx: 2, kby: -1.5, trail: { color: '#6ac8ff', life: 10, size: 1, every: 2 }, light: { r: 30, color: '#6ac8ff', a: .5 } })));
      }
      sfx('magic', { x: b.x });
      const d = Math.hypot(pl.x - x, pl.cy - y);
      const th = BM.threat(b, { in: Math.round(d / spd) - 2, dur: 200, box: () => { const p = G.world.player; return BM.boxAt(p.x, p.y - 30, 30, 30); }, how: 'roll', noWalk: true });
      // when does the nearest note reach the hero? (null when none is coming)
      th.dyn = p => { let best = null; for (const q of P) { if (!q || q.dead) continue; const dx = p.x - q.x, dy = p.cy - q.y, dd = Math.hypot(dx, dy); if ((dx * q.vx + dy * q.vy) <= 0 || dd > 110) continue; const tt = Math.round(Math.max(0, dd - 10) / spd); if (best === null || tt < best) best = tt; } return best; };
    }

    const moves = {
      rings: { w: [4, 3, 2], open: [40, 36, 32],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); m.W = b.tele(28); b.setState('hush'); const n = b.phase >= 2 ? 3 : 2; for (let i = 0; i < n; i++) rings(b, m.W + i * 56, [-1, 1], 3); m.n = n; }
          if (t === m.W) sfx('magic', { x: b.x, pitch: .7 });
          return t >= m.W + 56 * (m.n - 1) + 20;
        } },
      wave: { w: [3, 3, 2], cd: 360, open: [120, 120, 110],
        run(b, t, m) {
          // phase 2+: half the time they hold the breath a beat longer before the wall comes
          if (t === 1) { b.facePlayer(); m.W = b.tele(34); m.D = b.phase >= 2 && Math.random() < .5 ? 26 : 0; b.setState('chorus'); wall(b, b.x, m.W + m.D, [-1, 1]); if (m.D) BM.threats[BM.threats.length - 1].feint = true; sfx('boss_roar', { x: b.x, pitch: 1.6, vol: .35 }); }
          if (m.D && t === m.W) sfx('telegraph', { x: b.x, pitch: 1.8, vol: .4 });
          if (t === m.W + m.D) { G.FX.flash('#dff4ff', .12); G.shake(.25); }
          if (t >= m.W + m.D + 10) { b.data.openWave = 1; return true; }
          return false;
        } },
      teleport: { w: [3, 2.5, 2], range: [0, 200], open: [40, 36, 32],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { b.setState('tp_out'); sfx('whoosh', { x: b.x, pitch: 1.6 }); G.FX.poof(b.x, b.y - 30, { pal: 'ice', r: 14 }); }
          if (t === 20) { b.untargetable = true; const side = pl.x > a.cx ? -1 : 1; m.tx = clamp(pl.x + side * 110, a.x0 + 70, a.x1 - 70); }
          if (t === 34) { b.x = m.tx; b.facePlayer(); b.setState('tp_in'); b.untargetable = false; G.FX.poof(b.x, b.y - 30, { pal: 'ice', r: 14 }); m.W = 34 + b.tele(22); }
          if (t > 34 && t < m.W) b.facePlayer();
          if (t === m.W) { b.setState('cast_orb'); fan(b, b.phase >= 2 ? 5 : 3, 3); }
          return m.W && t >= m.W + 20;
        },
        cancel(b) { b.untargetable = false; } },
      wail: { w: [3, 2.5, 2], range: [90, 999], open: [36, 32, 30],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); m.W = b.tele(26); b.setState('wail'); }
          if (t === m.W) fan(b, b.phase >= 2 ? 5 : 3, 2.8);
          if (b.phase >= 3 && t === m.W + 30) fan(b, 3, 3.2);
          return t >= m.W + (b.phase >= 3 ? 50 : 22);
        } },
      /* phase 2 */
      glyphs: { ph: 2, w: [0, 3, 2.5], cd: 300, open: [0, 40, 36],
        run(b, t, m) {
          const pl = b.player, a = A(), d = b.data;
          if (t === 1) {
            b.facePlayer(); m.W = b.tele(24); b.setState('cast_ice');
            m.cx = clamp(pl.x, a.x0 + 60, a.x1 - 60); m.cy = a.floor - 22; m.R0 = 120; m.T = 110; m.gap = Math.random() * Math.PI * 2;
            m.th = BM.threat(b, { in: m.W + m.T, dur: 200, box: () => { const r = ringR(m, BM.now()); return BM.boxAt(m.cx, a.floor - 60, 2 * r + 20, 60); }, how: 'roll' });
            m.th.dyn = p => { const dd = Math.abs(p.x - m.cx), now = BM.now(); if (now < m.t0) return null; const r = ringR(m, now); if (r < dd - 6) return null; return Math.max(0, Math.round((r - dd) / (m.R0 / m.T))); };
          }
          if (t === m.W) { m.t0 = BM.now(); d.glyph = m; sfx('magic', { x: m.cx }); m.hit = new Set(); }
          if (t >= m.W) {
            const r = ringR(m, BM.now()), rot = (t - m.W) * .02, n = 14;
            for (let i = 0; i < n; i++) {
              const an = m.gap + rot + i / n * Math.PI * 2;
              if (i === 0 || i === 1) continue;                                        // the gap
              if (Math.abs(Math.cos(an)) < .9) continue;                               // seen edge-on: only the ring's two sides sweep the floor
              const x = m.cx + Math.cos(an) * r, y = m.cy + Math.sin(an) * r * .2;
              BM.strike(b, { x: x - 4, y: y - 4, w: 8, h: 8 }, { k: .45, kbx: 2, kby: -2, type: 'magic', dir: Math.sign(x - m.cx) || 1 }, m.hit);
            }
          }
          if (t >= m.W + m.T) { d.glyph = null; G.FX.ring(m.cx, m.cy, 2, 30, ICE, 14, { width: 2 }); return true; }
          return false;
        },
        cancel(b) { b.data.glyph = null; } },
      note: { ph: 2, w: [0, 3, 2.5], cd: [0, 900, 720], open: [0, 30, 30],
        run(b, t, m) {
          const a = A(), d = b.data, pl = b.player;
          if (t === 1) {
            m.W = b.tele(26); b.setState('chorus'); sfx('boss_roar', { x: b.x, pitch: 1.8, vol: .3 });
            G.UI && G.UI.toast && G.UI.toast(t0(TX.solo), ICE);
          }
          if (t === m.W) {
            // the soloist steps out: somewhere in the hall away from the row and from the hero
            const spots = [a.x0 + 60, a.x0 + 180, a.cx, a.x1 - 180, a.x1 - 60].filter(x => Math.abs(x - b.x) > 120 && Math.abs(x - pl.x) > 80);
            const x = spots.length ? spots[Math.floor(Math.random() * spots.length)] : (b.x > a.cx ? a.x0 + 60 : a.x1 - 60);
            d.solo = { x, y: a.floor, hits: 0, t: 0, fl: Math.sign(b.x - x) || 1 };
            d.soloOut = true;
            G.FX.poof(b.x, b.y - 40, { pal: 'ice', r: 10 }); G.FX.poof(x, a.floor - 30, { pal: 'ice', r: 14 });
            if (!d.part) { d.part = new KIT.BossPart(b, 1, 16, 50); G.world.add(d.part); b.parts.push(d.part); const p = d.part, th0 = p.takeHit; p.takeHit = function (e) { d._solo = true; try { return th0.apply(this, arguments); } finally { d._solo = false; } }; }
            d.part.untargetable = false; d.part.preferred = true; d.part.x = x; d.part.y = a.floor;
          }
          if (t > m.W && d.solo) {
            const s = d.solo; s.t++;
            s.x = clamp(s.x + Math.sin(s.t * .02) * .4, a.x0 + 30, a.x1 - 30); d.part.x = s.x; d.part.y = s.y - 6;
            // the row keeps singing rings while the soloist holds
            // (with the same 24-frame tell as every other ring: a hum and a frost flash on the row)
            if (s.t % 90 === 30) { rings(b, 24, [-1, 1], 2.6); sfx('telegraph', { x: b.x, pitch: 1.5 }); G.FX.ring(b.x, a.floor - 2, 4, 26, ICE, 22, { width: 2 }); }
            if (s.hits >= 3) { endSolo(b, true); return 150; }
            if (s.t >= 420) { const x = s.x; endSolo(b, false); wall(b, x, 12, [-1, 1]); sfx('boss_roar', { x, pitch: 1.6, vol: .5 }); m.end = t; }
          }
          return m.end && t >= m.end + 30;
        },
        cancel(b) { endSolo(b, null); } },
      /* phase 3 */
      ink: { ph: 3, w: [0, 0, 3], cd: 500, open: [0, 0, 30],
        run(b, t, m) {
          const a = A(), d = b.data, pl = b.player;
          if (t === 1) { m.W = b.tele(24); b.setState('cast_ice'); }
          if (t === m.W) {
            d.ink = (d.ink || []).filter(o => !o.dead);
            const xs = [pl.x, pl.x + U.rand(110, 170) * (Math.random() < .5 ? -1 : 1), b.x];
            for (const x of xs) { if (d.ink.length >= 5) d.ink.shift().life = 0; const o = new Ink(clamp(x, a.x0 + 40, a.x1 - 40), a.floor, U.randi(70, 96), 720); G.world.add(o); b.own(o); d.ink.push(o); }
            sfx('poison', { x: b.x });
          }
          return t >= m.W + 20;
        } },
      chorus: { ph: 3, w: [0, 0, 3], cd: 400, open: [0, 0, 90],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); m.W = b.tele(30); b.setState('chorus'); rings(b, m.W, [-1, 1], 3); wall(b, b.x, m.W + 46, [-1, 1]); }
          if (t >= m.W + 56) { b.data.openWave = 1; return true; }
          return false;
        } },
      shards: { ph: 3, w: [0, 0, 2], open: [0, 0, 40],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.W = b.tele(26); b.setState('shards'); }
          if (t === m.W) {
            const xs = [pl.x, pl.x - 70, pl.x + 70, pl.x + U.rand(-180, 180)].map(x => clamp(x, a.x0 + 20, a.x1 - 20));
            xs.forEach((x, i) => { tag(b.add(new KIT.Meteor(x, a.floor, 20 + 12 * i, { kind2: 'ice', dmg: .6 * b.dmg, R: 20 }))); BM.threat(b, { in: 20 + 12 * i + 24, dur: 8, box: BM.boxAt(x, a.floor - 40, 40, 40), how: 'out' }); });
          }
          return t >= m.W + 90;
        } }
    };
    const t0 = s => t(s);
    const ringR = (m, now) => m.t0 === undefined ? m.R0 : Math.max(0, m.R0 * (1 - (now - m.t0) / m.T));
    function endSolo(b, broken) {
      const d = b.data; if (!d.solo) return;
      const s = d.solo; d.solo = null; d.soloOut = false;
      if (d.part) d.part.untargetable = true;
      G.FX.poof(s.x, s.y - 30, { pal: 'ice', r: 12 }); G.FX.poof(b.x, b.y - 40, { pal: 'ice', r: 10 });
      if (broken) { G.UI && G.UI.toast && G.UI.toast(t(TX.found), '#ffffff'); G.shake(.4); sfx('break', { x: s.x }); BM.ev(b, 'note', 'broken'); b.setState('tp_in'); }
      else if (broken === false) BM.ev(b, 'note', 'held');
    }

    const def = ED.choir;
    def.modDamageIn = function (b, dmg, hit) {
      const d = b.data;
      if (d.solo) {
        if (d._solo) { d.solo.hits++; G.FX.text(d.solo.x, d.solo.y - 64, '♪'.repeat(Math.max(0, 3 - d.solo.hits)) || '!', '#ffffff', { size: 8, life: 30 }); return dmg * 1.25; }
        if (G.frame % 4 === 0) { G.FX.sparks(b.x, b.y - 30, 4, 0, { color: '#ffffff', color2: ICE }); G.FX.text(b.x, b.y - 80, t(TX.silent), ICE, { size: 6, life: 30 }); }
        return 0;
      }
      if (d.rec > 0 && d.openWave) return dmg * 1.25;                                  // after the wave all seven stand open
      return dmg;
    };

    BM.install('choir', {
      moves, rest: [46, 38, 32], moteColor: '#dff4ff',
      def0: { hp: 700, dmg: 21 },
      setup(b) { b.contact = 0; b._choir = true; b.data.q = []; },
      tick(b) {
        const d = b.data, now = BM.now();
        if (d.q && d.q.length) { for (const q of d.q.slice()) if (now >= q.at) { d.q.splice(d.q.indexOf(q), 1); if (b.mode === 'fight') q.fn(); } }
        if (d.rec <= 0) d.openWave = 0;
      },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer();
        const u = pl.x - b.x, dx = Math.abs(u), want = 150;
        const dir = dx > want + 40 ? Math.sign(u) : dx < want - 60 ? -Math.sign(u) : 0;
        b.vx = U.approach(b.vx, dir * .7 * b.spdK(), .05);
      },
      onPhaseInterrupt(b) { endSolo(b, null); const d = b.data; d.glyph = null; d.q = []; b.untargetable = false; },
      onDying(b) { endSolo(b, null); b.data.q = []; },
      drawFx(ctx, b) {
        const d = b.data, a = A();
        if (d.solo && def._solo) {
          const s = d.solo, k = Math.min(1, s.t / 16);
          def._solo(ctx, b, s.x, s.y - 4 + Math.sin(b.t * .05) * 2, k, s.fl);
          G.Glow.add(s.x, s.y - 44, 26 + 8 * Math.sin(b.t * .2), '#ffffff', .6 * k);
          G.Light && G.Light.add(s.x, s.y - 40, 110, '#dff4ff', .6 * k);
          if (b.t % 12 === 0) G.FX.spawn({ x: s.x, y: s.y - 46, shape: 'ring', size: 1, size1: 14, life: 26, color: '#ffffff', drag: 1, glow: true, alpha: .8 });
          // the rest of the row is sealed: a faint glyph-shield
          ctx.globalAlpha = .35 + .15 * Math.sin(b.t * .2); ctx.strokeStyle = ICE; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(Math.round(b.x) + .5, Math.round(b.y - 34) + .5, 70, 40, 0, 0, Math.PI * 2); ctx.stroke(); ctx.globalAlpha = 1;
        }
        if (d.glyph && d.glyph.t0 !== undefined) {
          const m = d.glyph, r = ringR(m, BM.now()), n = 14, rot = (BM.now() - m.t0) * .02;
          for (let i = 2; i < n; i++) {
            const an = m.gap + rot + i / n * Math.PI * 2, x = Math.round(m.cx + Math.cos(an) * r), y = Math.round(m.cy + Math.sin(an) * r * .2);
            ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 1, y - 3, 3, 1); ctx.fillRect(x, y - 3, 1, 6); ctx.fillStyle = ICE; ctx.fillRect(x - 2, y + 1, 5, 1);
            G.Glow.add(x, y, 10, '#6ac8ff', .5);
          }
        } else if (d.glyph) {
          // the ring forms: a faint circle where it will close
          const m = d.glyph; void m;
        }
        // the ink weeps from their eyes in phase 3
        if (b.phase >= 3 && b.mode === 'fight' && b.t % 7 === 0 && !d.soloOut) G.FX.spawn({ x: b.x + U.rand(-50, 50), y: b.y - U.rand(36, 48), vy: .6, grav: .08, life: 40, size: 1, color: '#2a1840', color2: '#5a3a8a' });
        void a;
      }
    });
  } catch (e) { console.error('[choir]', e); }
}
