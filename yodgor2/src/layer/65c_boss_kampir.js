/* 65c_boss_kampir.js — stage 8a: Yalmog'iz Kampir's moveset (GDD ch. 17 §2). The seven-headed witch; every head is its own attack.
   Phase 1:  bite (one head rears, a red aim line shows where it will land; sometimes it hangs a beat before it falls)
             bite2 (a second head 0.4 s after the first, from the other side)
             spit (two heads spit poison in an arc; it lands where the hero stood and leaves a pool)
             broom (the staff sweeps the ground in front of her: close range)
   Phase 2 (62%): chorus (five heads bite in turn, the line passes along her necks; then they all droop — the big window)
             curse (a circle of runes under the hero; it bursts 2 s later)
             vultures (two crows from her shoulders)
             feint (her body lunges with a hiss, the head holds back and strikes a beat later)
   Phase 3 (30%, or when four heads have been knocked down in phase 2): four heads are cut away for good;
             body (she throws her whole body at the hero; the landing sends green fire both ways)
             dark (the tower goes dark, only eyes and aim lines show; the remaining heads bite from the dark)
   Window rule of the heads: a head whose balance is broken (enough damage on it) drops to the floor for 2 s and the witch
   reels — nothing attacks meanwhile. */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (BM && ED && ED.kempir) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const A = () => BM.arena(), sfx = BM.sfx;
    const GREEN = '#7dff6a';
    const TX = {
      cut: `A head is cut away|Голова срублена|Bosh chopib tashlandi`,
      dark: `The tower goes dark|Башня погружается во тьму|Minora zulmatga cho'mdi`
    };
    const poison = () => ({ poison: { t: 150, dps: 2 * G.diff.dmgMul } });
    const live = b => b.heads.filter(h => h.st !== 'dying' && !h.cut);
    const free = b => live(b).filter(h => h.st === 'idle' || h.st === 'rear');
    // neck root of a head (engine Mt): body point bx,by with the body's lean/bob
    const root = (b, h) => { const o = b.pose || {}, s = o.sq || 0; return { x: b.x + b.facing * (h.bx - .04 * (o.lean || 0) * h.by) * (1 + .012 * s), y: b.y + h.by * (1 - .03 * s) + (o.bob || 0) }; };
    const reach = (b, h, x, y) => { const a = A(), r = root(b, h); let dx = x - r.x, dy = y - r.y; const d = Math.hypot(dx, dy); if (d > 150) { dx *= 150 / d; dy *= 150 / d; } return [clamp(r.x + dx, a.x0 + 8, a.x1 - 8), Math.min(r.y + dy, a.floor - 7)]; };

    // a head bite: aim line now, the strike lands `wind` frames later (the aim stops following at `lock`)
    function bite(b, h, wind, hold, lock) {
      const pl = b.player;
      h.st = 'wind'; h.t = 0; h.wind = wind; h.hold = hold; h.lockAt = lock === undefined ? wind - 14 : lock; h.hit = false;
      const p = reach(b, h, BM.okP(pl) ? pl.x : h.x, BM.okP(pl) ? pl.cy - 2 : h.y); h.tx = p[0]; h.ty = p[1];
      b.add(new KIT.Marker({ style: 'aim', x: h.x, y: h.y, x1: h.tx, y1: h.ty, life: wind + 2, color: '#ff4a3a', follow: m => { m.x = h.x; m.y = h.y; m.x1 = h.tx; m.y1 = h.ty; } }));
      h.th = BM.threat(b, { in: wind, dur: 7, box: () => ({ x: h.tx - 13, y: h.ty - 12, w: 26, h: 24 }), how: 'roll' });
      sfx('whoosh', { x: h.x, vol: .25, pitch: 1.6 });
      return h;
    }
    // a poison spit: an arc to where the hero stands; the puddle stays
    function spit(b, h, delay) {
      const pl = b.player, a = A(); if (!BM.okP(pl)) return;
      const tx = clamp(pl.x + U.rand(-8, 8), a.x0 + 12, a.x1 - 12);
      h.st = 'spit'; h.t = -delay; h.wind = 999;                   // the head rears (pose); we fire ourselves
      const u = 40, at = delay + 1 + u;
      BM.mark(b, tx, 30, at + 2, GREEN, { hgt: 18 });
      BM.threat(b, { in: at, dur: 100, box: { x: tx - 16, y: a.floor - 14, w: 32, h: 14 }, how: 'out' });
      h.spit = { at: delay, tx };
    }
    function fireSpit(b, h) {
      const a = A(), x = h.x + 6 * h.f, y = h.y + 3, u = 40, tx = h.spit.tx, vx = (tx - x) / u, g = .2, vy = (a.floor - 3 - y - .5 * g * u * u) / u;
      sfx('fire', { x, vol: .45 }); G.FX.sparks(x, y, 4, h.f, { color: '#f4ffe0', color2: '#8dff6a' });
      b.add(new G.Projectile({ x, y, vx, vy, grav: g, r: 4, faction: 'enemy', owner: b, dmg: .55 * b.dmg, life: 200, color: '#8dff6a', kbx: 2, kby: -3, status: poison(), light: { r: 50, color: '#8dff6a', a: .7 }, trail: { color: '#8dff6a', life: 12, size: 1, every: 2 }, info: { dmgColor: '#8dff6a' },
        onWall: e => { if (!b.dead && b.mode !== 'dying') b.add(new KIT.FirePool(e.x, a.floor, { w: 30, life: 100, pal: G.Art.FLAME_WITCH, glowC: GREEN, dmg: .3 * b.dmg, status: poison() })); G.FX.dustFan && G.FX.dustFan(e.x, a.floor, { r: 10, cols: 'witch', rate: 2 }); } }));
      h.spit = null; h.st = 'idle'; h.t = 0;
    }
    const busyHeads = b => b.heads.some(h => h.st === 'wind' || h.st === 'strike' || h.st === 'hold' || h.st === 'ret' || h.spit);
    const nearest = (b, list) => { const pl = b.player; return list.sort((p, q) => Math.abs(p.x - pl.x) - Math.abs(q.x - pl.x)); };

    const moves = {
      bite: { w: [4, 2.5, 2], open: [40, 34, 30],
        run(b, t, m) {
          if (t === 1) {
            b.facePlayer(); m.W = b.tele(30);
            const h = nearest(b, free(b))[0]; if (!h) return true;
            const delay = Math.random() < .4 ? 22 : 0;                 // the hanging bite: same aim, the fall comes later
            bite(b, h, m.W + delay, [26, 22, 18][b.phase - 1], m.W - 8);
            m.h = h; b.setState('bite');
            if (delay) BM.threats[BM.threats.length - 1].feint = true;
          }
          b.vx *= .85;
          return t > 8 && m.h && (m.h.st === 'idle' || m.h.cut);
        } },
      bite2: { w: [3, 2.5, 2], open: [46, 40, 34],
        run(b, t, m) {
          if (t === 1) {
            b.facePlayer(); m.W = b.tele(30); const L = nearest(b, free(b));
            if (L.length < 2) return true;
            m.a = bite(b, L[0], m.W, 22); m.second = L[L.length > 2 ? 2 : 1]; b.setState('bite');
          }
          if (t === 25 && m.second) m.b = bite(b, m.second, m.W, 22);
          b.vx *= .85;
          return t > 30 && [m.a, m.b].every(h => !h || h.st === 'idle' || h.cut);
        } },
      spit: { w: [3, 2.5, 2], range: [90, 999], open: [40, 34, 30],
        run(b, t, m) {
          if (t === 1) {
            b.facePlayer(); m.W = b.tele(26); b.setState('spit');
            m.hs = free(b).sort(() => Math.random() - .5).slice(0, b.phase >= 2 ? 3 : 2);
            m.hs.forEach((h, i) => spit(b, h, m.W + i * 14));
          }
          for (const h of m.hs) if (h.spit && t === h.spit.at) fireSpit(b, h);
          b.vx *= .85;
          return t > m.W + 14 * m.hs.length + 20;
        } },
      broom: { w: [4, 3, 3], range: [0, 72], open: [34, 30, 26],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) { b.facePlayer(); m.W = b.tele(24); d.W = m.W; b.setState('sweep'); m.hit = new Set(); BM.hint(b, b.x + b.facing * 30, 78, m.W + 6, '#ff6a3a', b.facing); BM.threat(b, { in: m.W, dur: 7, box: BM.box(b, -6, -78, 72, 78), how: 'roll' }); }
          b.vx *= .8;
          if (t === m.W) { G.FX.smear({ owner: b, ox: 10, oy: -44, r0: 16, r1: 56, a0: -2.3, a1: .9, dir: b.facing, color: '#e8ffd8', color2: '#5fd84a', life: 12 }); sfx('swing_heavy', { x: b.x }); b.vx = 2.4 * b.facing; }
          if (t >= m.W && t <= m.W + 6) BM.strike(b, BM.box(b, -6, -78, 72, 78), { k: 1.15, kbx: 4.5, kby: -4 }, m.hit);
          return t >= m.W + 16;
        } },
      /* phase 2 */
      chorus: { ph: 2, w: [0, 3, 3], open: [0, 74, 64], cd: 360,
        run(b, t, m) {
          if (t === 1) {
            b.facePlayer(); m.W = b.tele(26); b.setState('frenzy');
            const L = free(b).sort((p, q) => p.i - q.i);
            const n = Math.min(b.phase >= 3 ? L.length : 5, L.length), order = [];
            for (let k = 0; k < n; k++) order.push(L[k % 2 ? L.length - 1 - (k >> 1) : k >> 1]);   // from the outside in, side to side
            m.q = order.map((h, k) => ({ h, at: 1 + k * 16 })); m.n = n;
          }
          for (const q of m.q) if (!q.go && t >= q.at) { q.go = true; if (q.h.st === 'idle' || q.h.st === 'rear') bite(b, q.h, m.W, 18); }
          b.vx *= .85;
          const done = t > m.q.length * 16 + 4 && m.q.every(q => !q.go || q.h.st === 'idle' || q.h.cut);
          if (done) { for (const h of live(b)) { h.st = 'droop'; h.t = 0; } m.droop = true; }
          return done;
        } },
      curse: { ph: 2, w: [0, 3, 2.5], open: [0, 12, 10], cd: [0, 420, 360],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) {
            b.facePlayer(); m.W = b.tele(22); b.setState('rain');
            for (const h of free(b).slice(0, 3)) { h.st = 'rear'; h.t = 0; }
          }
          if (t === m.W && BM.okP(pl)) {
            const x = clamp(pl.x, a.x0 + 50, a.x1 - 50), fuse = 120;
            sfx('magic', { x }); G.FX.flash('#8dff6a', .08);
            BM.ring(b, x, 96, fuse, GREEN, { runes: true });
            b.add(new KIT.Pillar(x, a.floor, fuse, { kind2: 'witch', w: 96, dmg: .9 * b.dmg }));
            BM.threat(b, { in: fuse, dur: 26, box: { x: x - 46, y: a.floor - 120, w: 92, h: 120 }, how: 'out' });
          }
          b.vx *= .85;
          return t >= m.W + 14;
        } },
      vultures: { ph: 2, w: [0, 2, 1.5], open: [0, 30, 26], cd: 900, ok: b => b.minionsAlive('kempir_crow') < 1,
        run(b, t, m) {
          if (t === 1) { m.W = b.tele(24); b.setState('crows'); for (const i of [1, 5]) if (!b.heads[i].cut) { b.heads[i].st = 'rear'; b.heads[i].t = 0; } }
          if (t === m.W) { sfx('summon', { x: b.x }); for (const i of [1, 5]) { const h = b.heads[i]; if (h.cut) continue; b.minion('kempir_crow', h.x + 6 * h.f, h.y + 4); G.FX.poof(h.x + 6 * h.f, h.y + 2, { pal: 'witch', r: 9, beam: false }); } }
          b.vx *= .85;
          return t >= m.W + 20;
        } },
      feint: { ph: 2, w: [0, 3, 2], range: [0, 160], open: [0, 40, 34],
        run(b, t, m) {
          if (t === 1) {
            b.facePlayer(); m.W = b.tele(24); const h = nearest(b, free(b))[0]; if (!h) return true;
            m.h = bite(b, h, m.W + 24, 20, m.W - 6); BM.threats[BM.threats.length - 1].feint = true; b.setState('bite');
          }
          // the body lunges with a hiss at the normal time — the head is still up
          if (t === m.W) { b.vx = 2.6 * b.facing; sfx('boss_roar', { x: b.x, pitch: 1.7, vol: .35 }); G.FX.dust(b.x, b.y, 6, 1.2); }
          b.vx *= .88;
          return t > 8 && m.h && (m.h.st === 'idle' || m.h.cut);
        } },
      /* phase 3 */
      body: { ph: 3, w: [0, 0, 4], range: [60, 999], open: [0, 0, 50],
        run(b, t, m) {
          const a = A(), d = b.data, pl = b.player;
          if (t === 1) {
            m.W = b.tele(30); d.W = m.W; b.setState('leap'); m.T = 40;
            m.tx = clamp(pl.x + 10 * pl.vx, a.x0 + 40, a.x1 - 40);
            BM.mark(b, m.tx, 76, m.W + m.T + 4, GREEN, { hgt: 34 });
            BM.threat(b, { in: m.W + m.T, dur: 5, box: BM.boxAt(m.tx, a.floor - 50, 76, 50), how: 'out' });
            for (const h of live(b)) { h.st = 'rear'; h.t = 0; }
          }
          if (t < m.W) { b.vx *= .8; return false; }
          if (t === m.W) { m.x0 = b.x; b.noGrav = true; sfx('whoosh', { x: b.x }); G.FX.dust(b.x, b.y, 8, 1.4); b.facing = Math.sign(m.tx - b.x) || b.facing; }
          if (t < m.W + m.T) { const u = (t - m.W) / m.T; b.x = lerp(m.x0, m.tx, u); b.y = a.floor - 120 * 4 * u * (1 - u); b.vx = 0; b.vy = 0; b.onGround = false; return false; }
          if (t === m.W + m.T) {
            b.x = m.tx; b.y = a.floor; b.noGrav = false; b.onGround = true; b.setState('land');
            G.shake(.55); G.hitstop(4); sfx('stomp', { x: b.x }); sfx('explosion', { x: b.x, vol: .5 });
            G.FX.flashRing(b.x, a.floor - 1, 50, { pal: 'witch', flat: true, rate: 3 }); G.FX.magicBurst(b.x, a.floor - 8, 'witch', { size: 's' });
            for (const dir of [-1, 1]) {
              b.add(new KIT.Shockwave(b.x + 18 * dir, a.floor, dir, { pal: G.Art.FLAME_WITCH, color: '#8dff6a', color2: '#2a8a3a', dust: '#6a5a40', dmg: .6 * b.dmg, spd: 3.2, h: 20, status: poison() }));
              waveThreat(b, b.x + 18 * dir, dir, 3.2, 0);
            }
            for (const h of live(b)) { h.st = 'droop'; h.t = 0; }
          }
          if (t >= m.W + m.T && t <= m.W + m.T + 4) BM.strike(b, BM.boxAt(b.x, a.floor - 50, 76, 50), { k: 1.25, kbx: 4.5, kby: -4.5, dir: Math.sign(pl.x - b.x) || 1, heavy: true }, m.hit || (m.hit = new Set()));
          return t >= m.W + m.T + 6;
        },
        cancel(b) { b.noGrav = false; } },
      dark: { ph: 3, w: [0, 0, 3], cd: 600, open: [0, 0, 80],
        run(b, t, m) {
          if (t === 1) { m.W = b.tele(28); b.setState('rain'); sfx('boss_roar', { x: b.x, pitch: .6, vol: .5 }); G.UI && G.UI.toast && G.UI.toast(t0(TX.dark), '#8dff6a'); m.k = 0; }
          m.k = Math.min(1, m.k + .04);
          if (t > m.W + 150) m.k = Math.max(0, 1 - (t - m.W - 150) / 30);
          BM.dark(b, .82 * m.k, '#040806');
          const L = free(b);
          for (const at of [m.W, m.W + 44, m.W + 88]) if (t === at && L.length) { const h = L[Math.floor(Math.random() * L.length)]; bite(b, h, 30, 16); }
          b.vx *= .85;
          if (t >= m.W + 180) { BM.dark(b, 0); return true; }
          return false;
        },
        cancel(b) { BM.dark(b, 0); } }
    };
    const t0 = s => t(s);
    function waveThreat(b, x0, dir, spd, delay) {
      const pl = b.player; if (!BM.okP(pl)) return;
      const dist = (pl.x - x0) * dir; if (dist < 0) return;
      BM.threat(b, { in: delay + Math.max(0, Math.round((dist - 12) / spd)), dur: 8, box: BM.boxAt(pl.x, A().floor - 20, 26, 20), how: 'jump', wave: { x0, dir, spd, t0: BM.now() + delay } });
    }
    // phase 3: four heads cut away for good (the ones knocked down most)
    function sever(b) {
      const L = live(b).sort((p, q) => (q.breaks || 0) - (p.breaks || 0) || (q.pd || 0) - (p.pd || 0)).filter(h => h.i !== 3).slice(0, 4);
      L.forEach((h, k) => { h.cut = true; h.st = 'dying'; h.t = 0; h.dly = 8 + 10 * k; if (h.part) h.part.untargetable = true; });
      G.UI && G.UI.toast && G.UI.toast(t(TX.cut), '#8dff6a');
    }
    // a head's balance: enough damage on it and it drops for 2 s; the witch reels
    function headHurt(b, h, dmg) {
      const d = b.data;
      if (h.cut || b.mode !== 'fight') return;
      h.pd = (h.pd || 0) + dmg;
      if (h.pd < .035 * b.maxHp || h.st === 'droop') return;
      h.pd = 0; h.breaks = (h.breaks || 0) + 1; h.st = 'droop'; h.t = 0; h.downT = 120;
      sfx('break', { x: h.x }); G.FX.text(h.x, h.y - 14, t(`Head down!|Голова пала!|Bosh yiqildi!`), '#c8ff9a', { size: 7 });
      G.FX.hitStar(h.x, h.y, { r: 9, n: 6, pal: 'witch' });
      if (b.phase === 2) d.downs2 = (d.downs2 || 0) + 1;
      BM.ev(b, 'head', 'break', { head: h.i });
      // the witch reels: whatever she was doing stops, nothing attacks for 1.5 s
      if (d.mv) { const mv = moves[d.mv]; mv.cancel && mv.cancel(b, d.m); BM.end(b, 90); for (const q of live(b)) if (q.st === 'wind') { q.st = 'idle'; q.t = 0; } }
      else if (d.rec < 90) { d.rec = 90; d.recMv = d.recMv || 'head'; }
      if (b.phase === 2 && d.downs2 >= 4) { b.hp = Math.min(b.hp, b.maxHp * .3); }    // four heads down: the third phase comes now
    }

    BM.install('kempir', {
      moves, rest: [44, 36, 30], moteColor: '#c8ff9a',
      def0: { hp: 560, dmg: 20 },
      setup(b) { delete b.pick; delete b.rest; delete b.tele; },
      tick(b) {
        const d = b.data;
        // the vultures do not stay forever: 15 s, then they fly off
        for (const e of b.owned) if (e && !e.dead && e.kind === 'enemy' && e.type === 'kempir_crow') { e._age = (e._age || 0) + 1; if (e._age > 900) { e.dead = true; G.FX.poof(e.x, e.y, { pal: 'witch', r: 8, beam: false }); } }
        if (!d.wrapped && b.heads && b.heads[0] && b.heads[0].part) {
          d.wrapped = true;
          for (const h of b.heads) { const p = h.part, th0 = p.takeHit; p.takeHit = function (e) { const hp0 = b.hp, r = th0.apply(this, arguments); if (r && b.hp < hp0) headHurt(b, h, hp0 - b.hp); return r; }; }
        }
      },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer();
        const u = pl.x - b.x, p = Math.abs(u), dir = p > 130 ? Math.sign(u) : p < 44 ? -.8 * Math.sign(u) : 0;
        b.vx = U.approach(b.vx, .62 * dir * b.spdK(), .05);
      },
      always(b) {
        const d = b.data;
        if (!b.heads) return;
        for (const h of b.heads) {
          if (h.cut) { if (h.part) h.part.untargetable = true; continue; }
          if (h.st === 'wind' && h.lockAt !== undefined && h.t >= h.lockAt && h.lock === undefined) h.lock = [h.tx, h.ty];
          if (h.st === 'wind' && h.lock) { h.tx = h.lock[0]; h.ty = h.lock[1]; }
          if (h.st !== 'wind') h.lock = undefined;
          if (h.st === 'droop' && h.downT > 0 && --h.downT === 0) { h.st = 'idle'; h.t = 0; }
          if (h.st === 'droop' && !(h.downT > 0) && b.mode === 'fight' && !d.mv && h.t > 40) { h.st = 'idle'; h.t = 0; }
          if (h.part && h.st === 'droop') h.part.mul = 1;
        }
      },
      onPhaseInterrupt(b, ph) { BM.dark(b, 0); for (const h of b.heads || []) if (!h.cut) { h.spit = null; h.lock = undefined; } b.noGrav = false; },
      onDying(b) { b.noGrav = false; }
    });
    { const def = ED.kempir, op = def.onPhase; def.onPhase = function (b, ph) { op && op.call(this, b, ph); if (ph === 3) sever(b); }; }
  } catch (e) { console.error('[kampir]', e); }
}
