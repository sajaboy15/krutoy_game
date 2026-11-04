/* 65d_boss_hound.js — stage 8a: Bahodir, the Gilded Hound (GDD ch. 17 §3). The Divan's champion in gilded lamellar, glaive and
   round shield. The most "souls" duel of the game: the danger is in his timing, not in his numbers.
   Phase 1:  thrust (the glaive draws back and glints; often he holds it a beat longer — the main deceit)
             bash (a short shield bash: it throws you back and empties your stamina)
             triple (three thrusts; the third waits for you to roll too early)
             dash (crosses the whole arena; after it he needs a second to turn round)
   Phase 2 (60%): grab (the shield hand reaches out slowly with a growl; caught — lifted and thrown; roll through him)
             leap (a jump with an overhead blow where you stood)
             coins (he tosses gold: the coins sting, and your companions run after them)
             guard (he raises the shield: blows from the front glance off — get behind him, or break it: a broken
                    shield leaves him reeling for 3 s; he answers anyone who keeps hammering the front with a bash)
             thrust gains a feint (the lunge stops short, the real one follows)
   Phase 3 (30%): howl (two hounds of the Divan)
             blaze (the glaive burns: four blows, the last one slams the ground and sends a wave of fire)
   Windows: after the dash he turns for 1 s; the broken shield — 3 s. */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (BM && ED && ED.hound) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const A = () => BM.arena(), sfx = BM.sfx;
    const GOLD = '#ffcf4a';
    const TX = {
      broke: `The shield breaks!|Щит расколот!|Qalqon yorildi!`,
      gold: `Gold!|Золото!|Oltin!`,
      glance: `Blocked|Блок|To'sildi`
    };
    const burn = b => b.phase >= 3 ? { burn: { t: 90, dps: 3 * G.diff.dmgMul } } : null;
    // one thrust: lunge, 5 active frames, the long reach of a glaive
    function thrust(b, t, T0, m, k, key) {
      if (t === T0) { b.setState('thrust'); b.vx = 4.2 * b.facing; sfx('swing_heavy', { x: b.x, pitch: 1.1 }); G.FX.smear && G.FX.smear({ owner: b, ox: 20, oy: -32, r0: 30, r1: 112, a0: -.12, a1: .06, dir: b.facing, color: '#fff4c0', color2: b.phase >= 3 ? '#ff6a1a' : '#c89a3a', life: 8 }); }
      if (t >= T0 && t <= T0 + 5) BM.strike(b, BM.box(b, 0, -44, 118, 40), { k: k || 1, kbx: 4, kby: -2.5, status: burn(b) }, m[key || 'hit'] || (m[key || 'hit'] = new Set()));
      if (t > T0 + 5) b.vx *= .8;
    }
    const thrustThreat = (b, inF, feint) => BM.threat(b, { in: inF, dur: 6, box: () => BM.box(b, 0, -44, 118, 40), how: 'roll', feint, noWalk: true });

    const moves = {
      thrust: { w: [5, 4, 3], range: [0, 150], open: [38, 34, 30],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(28); d.W = m.W; b.setState('twind');
            m.hold = Math.random() < .45 ? (b.phase >= 2 ? 24 : 20) : 0;             // the held glaive
            m.fake = b.phase >= 2 && !m.hold && Math.random() < .4;                   // phase 2: a lunge that stops short
            m.T = m.W + m.hold + (m.fake ? 22 : 0);
            BM.hint(b, b.x + b.facing * 60, 118, m.T + 4, '#ffb03a', b.facing);
            thrustThreat(b, m.T, !!(m.hold || m.fake));
          }
          if (t < m.T && t >= m.W) { b.vx *= .7; if (t === m.W && (m.hold || m.fake)) { if (m.fake) { b.vx = 2 * b.facing; sfx('whoosh', { x: b.x, vol: .4 }); } } }
          if (t < m.W) b.vx *= .7;
          thrust(b, t, m.T, m, 1);
          return t >= m.T + 12;
        } },
      bash: { w: [3, 3, 2], range: [0, 70], open: [34, 30, 28],
        run(b, t, m) {
          const pl = b.player;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(20); b.setState('bwind'); BM.hint(b, b.x + b.facing * 30, 60, m.W + 4, '#ffb03a', b.facing); BM.threat(b, { in: m.W, dur: 5, box: () => BM.box(b, 0, -60, 60, 60), how: 'roll' }); m.hit = new Set(); }
          if (t === m.W) { b.setState('bash'); b.vx = 3 * b.facing; sfx('shield_block', { x: b.x, pitch: .7 }); }
          if (t >= m.W && t <= m.W + 4) {
            const n = m.hit.size;
            BM.strike(b, BM.box(b, 0, -60, 60, 60), { k: .5, kbx: 6, kby: -3 }, m.hit);
            if (m.hit.size > n && m.hit.has(pl) && G.CH && G.CH.spend) { G.CH.spend(40, 'bash'); G.FX.text(pl.x, pl.top - 10, t0(`Off balance|Равновесие сбито|Muvozanat buzildi`), '#ffd040', { size: 7 }); }
          }
          b.vx *= .85;
          return t >= m.W + 12;
        } },
      triple: { w: [3, 3, 2.5], range: [0, 150], open: [56, 50, 44],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(26); d.W = m.W; b.setState('twind');
            m.T = [m.W, m.W + 36, m.W + 36 + 46];                                    // the third waits
            m.T.forEach((T, i) => thrustThreat(b, T, i === 2));
            BM.hint(b, b.x + b.facing * 60, 118, m.W + 4, '#ffb03a', b.facing);
          }
          if (t < m.W) b.vx *= .7;
          for (let i = 0; i < 3; i++) {
            if (t === m.T[i] - 10 && i) { b.setState('twind'); b.facePlayer(); }
            if (i === 2 && t === m.T[1] + 24) { sfx('telegraph', { x: b.x, pitch: 1.4, vol: .5 }); }
            thrust(b, t, m.T[i], m, i === 2 ? .85 : .7, 'h' + i);
          }
          return t >= m.T[2] + 12;
        } },
      dash: { w: [2.5, 2, 2], range: [120, 999], open: [62, 58, 54],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(26); d.W = m.W; b.setState('charge'); m.dir = b.facing;
            const end = m.dir > 0 ? a.x1 - 30 : a.x0 + 30;
            BM.mark(b, (b.x + end) / 2, Math.abs(end - b.x), m.W + 4, GOLD, { hgt: 14 });
            const dist = Math.abs(pl.x - b.x);
            BM.threat(b, { in: m.W + Math.max(0, Math.floor((dist - 46) / 7)), dur: 8, box: () => BM.boxAt(b.x, b.y - 62, 70, 62), how: 'roll', noWalk: true });
            m.hit = new Set(); m.stop = null;
          }
          if (t < m.W) { b.vx *= .7; return false; }
          if (!m.stop) {
            b.vx = 7 * m.dir;
            if (t % 3 === 0) G.FX.dust(b.x - m.dir * 10, b.y, 2, 2);
            BM.strike(b, BM.box(b, -10, -62, 44, 62), { k: .9, kbx: 5 * m.dir, kby: -3.5, dir: m.dir, heavy: true }, m.hit);
            const passed = BM.okP(pl) && (b.x - pl.x) * m.dir > 90;
            if (passed || b.x < a.x0 + 34 || b.x > a.x1 - 34 || t > m.W + 120) { m.stop = t; if (!passed) { G.shake(.3); sfx('stomp', { x: b.x }); } }
            return false;
          }
          b.vx *= .86; if (t % 4 === 0) G.FX.dust(b.x, b.y, 2, 1.4);
          return t >= m.stop + 10;
        } },
      /* phase 2 */
      grab: { ph: 2, w: [0, 3, 2.5], range: [0, 110], open: [0, 50, 44],
        run(b, t, m) {
          const pl = b.player, d = b.data;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(32); b.setState('bwind');
            sfx('boss_roar', { x: b.x, pitch: .5, vol: .45 });                       // the growl that marks a grab
            BM.hint(b, b.x + b.facing * 40, 76, m.W + 8, '#ff7a3a', b.facing);
            BM.threat(b, { in: m.W, dur: 8, box: () => BM.box(b, 0, -62, 56, 62), how: 'roll', noWalk: true });
          }
          if (t < m.W) { b.vx *= .7; return false; }
          if (t === m.W) { b.setState('bash'); b.vx = 3.4 * b.facing; sfx('whoosh', { x: b.x, pitch: .8 }); }
          if (t >= m.W && t <= m.W + 7 && !m.caught && BM.okP(pl) && !G.godMode && !(pl.state === 'roll' && pl.rollT < (G.CH && G.CH.rollStats ? G.CH.rollStats().rollI : 13)) && !(pl.invulnT > 0) && pl.state !== 'door' && G.U.overlap(BM.box(b, 0, -62, 56, 62), pl.box())) {
            m.caught = t; b.setState('bwind'); sfx('hit_heavy', { x: b.x }); BM.ev(b, 'grab', 'caught');
            BM.hits.push({ t: BM.now(), id: b.def.id, mv: 'grab', dmg: 0, ph: b.phase, caught: true });
          }
          if (m.caught) {
            const k = t - m.caught;
            if (k < 36) { b.vx = 0; pl.x = b.x + b.facing * 26; pl.y = b.y - 40 - Math.min(10, k); pl.vx = 0; pl.vy = 0; pl.invulnT = Math.max(pl.invulnT, 2); return false; }
            if (k === 36) {
              b.setState('bash'); pl.invulnT = 0; pl.y = b.y - 30;
              G.Combat.hit(b, pl, { dmg: 1.3 * b.dmg, kbx: 7 * b.facing, kby: -5, dir: b.facing, type: 'melee', heavy: true });
              G.shake(.6); G.hitstop(6); sfx('stomp', { x: pl.x });
            }
            return k >= 46;
          }
          b.vx *= .86;
          return t >= m.W + 14 ? 46 : false;
        },
        cancel(b, m) { const pl = b.player; if (m.caught && pl) pl.invulnT = 0; } },
      leap: { ph: 2, w: [0, 2.5, 2.5], range: [70, 999], open: [0, 46, 42],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) {
            m.W = b.tele(28); d.W = m.W; b.setState('leap'); m.T = 38; m.tx = clamp(pl.x, a.x0 + 40, a.x1 - 40);
            m.mk = BM.mark(b, m.tx, 88, m.W + m.T + 4, GOLD);
            m.th = BM.threat(b, { in: m.W + m.T, dur: 5, box: BM.boxAt(m.tx, a.floor - 44, 88, 44), how: 'out' });
          }
          if (t < m.W) { b.vx *= .7; return false; }
          if (t < m.W + m.T - 14 && BM.okP(pl)) { m.tx += clamp(clamp(pl.x, a.x0 + 40, a.x1 - 40) - m.tx, -2, 2); m.mk.x = m.tx; m.th.box = BM.boxAt(m.tx, a.floor - 44, 88, 44); }
          if (t === m.W) { m.x0 = b.x; b.noGrav = true; sfx('whoosh', { x: b.x }); G.FX.dust(b.x, b.y, 8, 1.4); }
          if (t < m.W + m.T) { const u = (t - m.W) / m.T; b.x = lerp(m.x0, m.tx, u); b.y = a.floor - 130 * 4 * u * (1 - u); b.vx = 0; b.vy = 0; b.onGround = false; b.facing = Math.sign(m.tx - m.x0) || b.facing; return false; }
          if (t === m.W + m.T) {
            b.x = m.tx; b.y = a.floor; b.noGrav = false; b.onGround = true; d.landT = b.stateT;
            G.shake(.55); G.hitstop(4); sfx('stomp', { x: b.x }); G.FX.shockwave(b.x, a.floor, 54, { pal: 'gold' }); G.FX.dust(b.x, a.floor, 12, 2);
            if (b.phase >= 3) { b.add(new KIT.Shockwave(b.x + 20 * b.facing, a.floor, b.facing, { pal: G.Art.FLAME_FIRE, color: '#ff8a2a', color2: '#c83a1a', dmg: .55 * b.dmg, spd: 3.4, h: 18, status: burn(b) })); waveThreat(b, b.x + 20 * b.facing, b.facing, 3.4, 0); }
          }
          if (t >= m.W + m.T && t <= m.W + m.T + 4) BM.strike(b, BM.boxAt(b.x, a.floor - 44, 88, 44), { k: 1.1, kbx: 4, kby: -4, dir: Math.sign(pl.x - b.x) || 1, heavy: true }, m.hit || (m.hit = new Set()));
          return t >= m.W + m.T + 8;
        },
        cancel(b) { b.noGrav = false; } },
      coins: { ph: 2, w: [0, 2, 1.5], cd: 600, open: [0, 30, 26],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(22); d.W = m.W; b.setState('coins'); }
          if (t === m.W && BM.okP(pl)) {
            sfx('coin', { x: b.x }); sfx('whoosh', { x: b.x, pitch: 1.4 });
            const xs = [-96, -48, 0, 48, 96].map(dx => clamp(pl.x + dx + U.rand(-6, 6), a.x0 + 14, a.x1 - 14));
            m.coins = [];
            for (const x of xs) {
              const x0 = b.x + b.facing * 10, y0 = b.y - 80, u = 44, vx = (x - x0) / u, g = .18, vy = (a.floor - 4 - y0 - .5 * g * u * u) / u;
              b.add(new G.Projectile({ x: x0, y: y0, vx, vy, grav: g, r: 3, faction: 'enemy', owner: b, dmg: .3 * b.dmg, life: 120, color: '#ffe060', kbx: 1.5, kby: -2, trail: { color: '#ffb020', life: 8, size: 1, every: 2 }, light: { r: 26, color: '#ffd040', a: .6 }, onWall: e => { d.coins = d.coins || []; d.coins.push({ x: e.x, t: 0 }); G.FX.sparks(e.x, a.floor - 2, 3, 0, { color: '#fff4c0', color2: '#ffb020' }); } }));
              { const sw = Math.max(14, Math.abs(vx) * 9 + 14), bx0 = vx > 0 ? x + 7 - sw : x - 7; BM.threat(b, { in: u - 9, dur: 12, box: { x: bx0, y: a.floor - 36, w: sw, h: 36 }, how: 'out' }); }
              m.coins.push(x);
            }
            // the companions run after the gold
            const PX = G.PARTY && G.PARTY._px;
            if (PX) for (const c of PX.actors()) {
              if (c.downed || c.dead) continue;
              const x = m.coins.sort((p, q) => Math.abs(p - c.x) - Math.abs(q - c.x))[0];
              c.dodgeDir = Math.sign(x - c.x) || 1; c.dodgeT = 70; c._coinT = 120;
              G.FX.text(c.x, c.top - 12, t0(TX.gold), '#ffd040', { size: 7 });
            }
          }
          b.vx *= .85;
          return t >= m.W + 30;
        } },
      guard: { ph: 2, w: [0, 3, 2], cd: [0, 420, 360], open: [0, 24, 20],
        run(b, t, m) {
          const pl = b.player, d = b.data;
          if (t === 1) { b.setState('guard'); d.guard = true; m.front = 0; sfx('shield_block', { x: b.x, pitch: .6 }); }
          if (m.bash) {
            const k = t - m.bash;
            if (k === 0) { b.facePlayer(); m.W = b.tele(18); b.setState('bwind'); BM.threat(b, { in: m.W, dur: 5, box: () => BM.box(b, 0, -60, 60, 60), how: 'roll' }); m.hit = new Set(); BM.hint(b, b.x + b.facing * 30, 60, m.W + 4, '#ffb03a', b.facing); }
            if (k === m.W) { b.setState('bash'); b.vx = 3 * b.facing; sfx('shield_block', { x: b.x, pitch: .7 }); }
            if (k >= m.W && k <= m.W + 4) BM.strike(b, BM.box(b, 0, -60, 60, 60), { k: .5, kbx: 6, kby: -3 }, m.hit);
            b.vx *= .85;
            if (k >= m.W + 14) { m.bash = 0; b.setState('guard'); }
            return false;
          }
          // he turns slowly to face whoever gets behind him; he steps in behind the shield
          if (BM.okP(pl)) {
            const side = Math.sign(pl.x - b.x) || b.facing;
            if (side !== b.facing) { m.turn = (m.turn || 0) + 1; if (m.turn > 34) { b.facing = side; m.turn = 0; } } else m.turn = 0;
            const dx = Math.abs(pl.x - b.x);
            b.vx = U.approach(b.vx, side === b.facing && dx > 54 ? .7 * side : 0, .05);
            m.front = side === b.facing && dx < 70 ? m.front + 1 : 0;
            if (d.blockedT && BM.now() - d.blockedT < 20 && m.front > 30) { m.bash = t; m.front = 0; }
          }
          return t >= 150;
        },
        cancel(b) { b.data.guard = false; } },
      /* phase 3 */
      howl: { ph: 3, w: [0, 0, 2.5], cd: 900, open: [0, 0, 30], ok: b => b.minionsAlive('bori') < 1,
        run(b, t, m) {
          if (t === 1) { b.vx = 0; m.W = b.tele(26); b.setState('pack'); }
          if (t === m.W) {
            b.roar({ y: b.cy, push: 0 }); const a = A();
            for (const x of [a.x0 + 40, a.x1 - 40]) { const mn = b.minion('bori', x, a.floor); if (mn) { mn.elite = false; G.FX.poof(x, a.floor - 10, { pal: 'gold', r: 10 }); } }
          }
          return t >= m.W + 30;
        } },
      blaze: { ph: 3, w: [0, 0, 4], range: [0, 160], open: [0, 0, 72],
        run(b, t, m) {
          const a = A(), d = b.data, pl = b.player;
          if (t === 1) {
            b.facePlayer(); b.vx = 0; m.W = b.tele(26); d.W = m.W; b.setState('twind');
            m.T = [m.W, m.W + 36, m.W + 72, m.W + 72 + 46];
            thrustThreat(b, m.T[0]); thrustThreat(b, m.T[1]);
            BM.threat(b, { in: m.T[2], dur: 6, box: () => BM.box(b, -24, -64, 112, 64), how: 'roll' });
            BM.threat(b, { in: m.T[3], dur: 5, box: () => BM.box(b, 0, -50, 80, 50), how: 'roll', feint: true });
            BM.hint(b, b.x + b.facing * 60, 118, m.W + 4, '#ff7a2a', b.facing);
            sfx('fire', { x: b.x });
          }
          if (t < m.W) b.vx *= .7;
          thrust(b, t, m.T[0], m, .75, 'h0');
          if (t === m.T[1] - 10) { b.setState('twind'); b.facePlayer(); }
          thrust(b, t, m.T[1], m, .75, 'h1');
          // the sweep
          if (t === m.T[2] - 12) { b.setState('bwind'); b.facePlayer(); }
          if (t === m.T[2]) { b.setState('bash'); sfx('swing_heavy', { x: b.x }); G.FX.smear && G.FX.smear({ owner: b, ox: 8, oy: -40, r0: 20, r1: 96, a0: -1.9, a1: 1, dir: b.facing, color: '#fff0c0', color2: '#ff6a1a', life: 10 }); }
          if (t >= m.T[2] && t <= m.T[2] + 5) BM.strike(b, BM.box(b, -24, -64, 112, 64), { k: .8, kbx: 4, kby: -3, status: burn(b) }, m.h2 || (m.h2 = new Set()));
          // the slam — it waits, then the fire runs along the ground
          if (t === m.T[2] + 14) { b.setState('leap'); d.W = 999; d.landT = 0; }
          if (t === m.T[3] - 8) sfx('telegraph', { x: b.x, pitch: 1.3 });
          if (t === m.T[3]) {
            b.setState('leap'); d.W = 0; d.landT = 0; b.data.landT = b.stateT;
            G.shake(.5); sfx('stomp', { x: b.x }); G.FX.shockwave(b.x + b.facing * 40, a.floor, 40, { pal: 'fire' });
            b.add(new KIT.Shockwave(b.x + 50 * b.facing, a.floor, b.facing, { pal: G.Art.FLAME_FIRE, color: '#ff8a2a', color2: '#c83a1a', dmg: .6 * b.dmg, spd: 3.6, h: 20, status: burn(b) }));
            waveThreat(b, b.x + 50 * b.facing, b.facing, 3.6, 0);
          }
          if (t >= m.T[3] && t <= m.T[3] + 4) BM.strike(b, BM.box(b, 0, -50, 80, 50), { k: 1.1, kbx: 4, kby: -4.5, heavy: true, status: burn(b) }, m.h3 || (m.h3 = new Set()));
          return t >= m.T[3] + 12;
        } }
    };
    const t0 = s => t(s);
    function waveThreat(b, x0, dir, spd, delay) {
      const pl = b.player; if (!BM.okP(pl)) return;
      const dist = (pl.x - x0) * dir; if (dist < 0) return;
      BM.threat(b, { in: delay + Math.max(0, Math.round((dist - 12) / spd)), dur: 8, box: BM.boxAt(pl.x, A().floor - 20, 26, 20), how: 'jump', wave: { x0, dir, spd, t0: BM.now() + delay } });
    }
    // the shield takes the blows from the front while he guards; enough of them and it breaks: 3 s of reeling
    function shieldBreak(b) {
      const d = b.data;
      d.guard = false; d.shield = 0; d.broken = (d.broken || 0) + 1;
      if (d.mv) { BM.ev(b, d.mv, 'end', { open: 180 }); d.mv = null; }
      BM.ev(b, 'shield', 'break');
      sfx('break', { x: b.x }); G.shake(.5); G.hitstop(8);
      G.FX.text(b.x, b.top - 16, t(TX.broke), '#ffe066', { size: 9 });
      G.FX.debris(b.x + b.facing * 16, b.y - 44, 14, b.facing, ['#c8983a', '#f2d890', '#6c4612'], { speed: 3 });
      b.setState('broken'); d.rec = 180; d.recMv = 'shield';
    }
    const def = ED.hound;
    def.modDamageIn = function (b, dmg, hit) {
      const d = b.data, src = hit && (hit.src || hit.proj);
      if (d.guard && src && b.mode === 'fight') {
        const side = Math.sign(src.x - b.x) || b.facing;
        if (side === b.facing) {
          d.blockedT = BM.now();
          d.shield = (d.shield || 0) + (hit.heavy ? 2 : 1);
          G.FX.sparks(b.x + b.facing * 20, b.y - 46, 5, -b.facing, { color: '#ffffff', color2: '#ffd040' });
          sfx('shield_block', { x: b.x });
          if (G.frame % 3 === 0) G.FX.text(b.x + b.facing * 20, b.y - 70, t(TX.glance), '#e8d8a0', { size: 6, life: 30 });
          if (d.shield >= 7) shieldBreak(b);
          return 0;
        }
        return dmg * 1.15;                                     // a blow from behind lands well
      }
      return dmg;
    };

    BM.install('hound', {
      moves, rest: [44, 36, 30], moteColor: '#ffe9b0',
      def0: { hp: 600, dmg: 21 },
      setup(b) { b.contact = 0; b.data.shield = 0; },
      tick(b) { const d = b.data; if (d.mv !== 'guard') d.guard = false; if (d.coins) { for (const c of d.coins) c.t++; d.coins = d.coins.filter(c => c.t < 200); } },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer();
        const u = pl.x - b.x, dx = Math.abs(u), want = 96;
        const dir = dx > want + 24 ? Math.sign(u) : dx < want - 36 ? -Math.sign(u) : Math.sin(b.t * .03) * .4;
        b.vx = U.approach(b.vx, dir * 1.15 * b.spdK(), .08);
      },
      recover(b) { const d = b.data; if (d.recMv === 'shield' && b.state !== 'broken') b.setState('broken'); },
      onPhaseInterrupt(b) { const d = b.data; d.guard = false; d.shield = 0; b.noGrav = false; const pl = b.player; if (pl && pl.invulnT > 2) pl.invulnT = 0; },
      onDying(b) { b.noGrav = false; b.data.guard = false; },
      drawFx(ctx, b) {
        const d = b.data;
        // coins on the floor glint for a while
        if (d.coins) for (const c of d.coins) { const y = A().floor - 2; ctx.fillStyle = c.t % 20 < 10 ? '#fff4c0' : '#ffd040'; ctx.fillRect(Math.round(c.x) - 1, y - 1, 3, 2); G.Glow.add(c.x, y, 8, '#ffd040', .4 * (1 - c.t / 200)); }
        // phase 3: the glaive burns
        if (b.phase >= 3 && d.tipW && b.mode !== 'dying') {
          const [x, y] = d.tipW;
          G.Glow.add(x, y, 22, '#ff7a2a', .7); G.Light && G.Light.add(x, y, 70, '#ff8a3a', .7);
          if (G.frame % 2 === 0) G.FX.spawn({ x: x + U.rand(-3, 3), y: y + U.rand(-3, 3), vx: U.rand(-.3, .3), vy: -U.rand(.5, 1.4), life: 18, size: 1, color: '#ffd060', color2: '#ff4a10', glow: true, glowR: 0 });
        }
        // guard: the shield shines
        if (d.guard) { const x = b.x + b.facing * 22, y = b.y - 48; G.Glow.add(x, y, 26, '#ffe080', .45 + .2 * Math.sin(b.t * .2)); const k = Math.min(1, (d.shield || 0) / 7); if (k > 0) { ctx.fillStyle = '#2a1608'; for (let i = 0; i < Math.round(k * 5); i++) ctx.fillRect(Math.round(x - 2 + i), Math.round(y - 6 + i * 2), 1, 2); } }
      }
    });
  } catch (e) { console.error('[hound]', e); }
}
