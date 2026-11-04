/* 65h_boss_ajdaho.js — stage 8a: Ajdaho, the Nightmare of the Sleeper (GDD ch. 17 §8). The dragon of nightmares, the last "clean"
   fight. A flying serpent (stock aidahar body: head hx,hy; the body follows).
   Phase 1:  breath (from one side, low: a fan of fire lobbed across the floor — stand in a gap; after it the head lies at the
                     ground for 1.5 s: the window)
             sweep (the head and the fore-body skim the floor across the nest: jump it, or stand on a ledge)
             bite (a red aim line, then the lunge)
   Phase 2 (66%): dive (up high; a column of light follows you, stops; he falls, sticks in the ground, fire runs both ways)
             rain (circling high, he calls fire down on the marks)
             coil (the body wraps a ledge: its ends burn, the ledge narrows)
             bite gains a feint (the line locks, he waits, then lunges)
   Phase 3 (33%): eclipse (the nest goes dark; only Sado's light shows — and the fire)
             float (his roar lifts pieces of the floor: they burst up where marked, hang, and fall back where they rose)
             strafe (he crosses the nest lobbing fire) */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (BM && ED && ED.aidahar) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const A = () => BM.arena(), sfx = BM.sfx;
    const FIRE = '#ffb02a';
    const TX = {
      eclipse: `The eclipse — only Sado's light|Затмение — светит только Садо|Tutilish — faqat Sado yorug'i qoldi`,
      float: `The memories float up|Воспоминания всплывают|Xotiralar yuzaga qalqiyapti`
    };
    const burn = () => ({ burn: { t: 90, dps: 3 * G.diff.dmgMul } });
    const angTo = (a, b, k) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
    const steer = (b, tx, ty, spd, turn) => { b.ha = angTo(b.ha, Math.atan2(ty - b.hy, tx - b.hx), turn); b.hs = U.approach(b.hs, spd, .25); b.hx += Math.cos(b.ha) * b.hs; b.hy += Math.sin(b.ha) * b.hs; };
    const mouth = b => { const o = Math.cos(b.ha), s = Math.sin(b.ha), n = o < 0, e = 32, a2 = 5 + 4 * b.jaw; return { x: b.hx + o * e + (n ? s : -s) * a2, y: b.hy + s * e + (n ? -o : o) * a2 }; };
    const headBox = b => ({ x: b.hx - 22, y: b.hy - 16, w: 44, h: 32 });
    const lob = (b, x0, y0, tx, u, o) => {
      const a = A(), g = .22, vx = (tx - x0) / u, vy = (a.floor - 3 - y0 - .5 * g * u * u) / u;
      return b.add(new G.Projectile(Object.assign({ x: x0, y: y0, vx, vy, grav: g, r: 5, faction: 'enemy', owner: b, dmg: .55 * b.dmg, life: 220, color: FIRE, kbx: 2.5, kby: -3, status: burn(), light: { r: 70, color: '#ffb040', a: .8 }, trail: { color: '#ff8a2a', life: 14, size: 1, every: 1 }, info: { dmgColor: '#ffb040' },
        onWall: e => { if (!b.dead && b.mode !== 'dying') b.add(new KIT.FirePool(e.x, a.floor, { w: 30, life: (o && o.poolLife) || 120, pal: G.Art.FLAME_FIRE, glowC: '#ff8a2a', dmg: .3 * b.dmg, status: burn() })); },
        onDie: e => G.FX.explosion(e.x, e.y - 2, { size: 's', pal: 'fire', shake: .06 }) }, o || {})));
    };
    const poolThreat = (b, x, inF) => BM.threat(b, { in: inF, dur: 120, box: { x: x - 18, y: A().floor - 14, w: 36, h: 14 }, how: 'out' });

    const moves = {
      breath: { w: [4, 3, 3], cd: 240, open: [96, 90, 84],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.side = pl.x > a.cx ? -1 : 1; m.hx0 = m.side < 0 ? a.x0 + 60 : a.x1 - 60; m.st = 'go'; m.k = 0; }
          const dir = -m.side;
          if (m.st === 'go') {
            steer(b, m.hx0, a.floor - 100, 5, .09); b.jaw = Math.max(0, b.jaw - .05);
            if (Math.hypot(b.hx - m.hx0, b.hy - (a.floor - 100)) < 26 || t > 110) {
              m.st = 'aim'; m.t0 = t; m.W = b.tele(40);
              // seven lobs from near to far: the landing spots (with the gaps between them) show on the floor now
              m.xs = []; for (let i = 0; i < 7; i++) m.xs.push(clamp(m.hx0 + dir * (70 + i * 72 + (b.phase >= 2 ? 36 * (i & 1) : 0)), a.x0 + 16, a.x1 - 16));
              m.xs.forEach((x, i) => { BM.mark(b, x, 32, m.W + 30 + i * 6, FIRE, { hgt: 22 }); poolThreat(b, x, m.W + 30 + i * 6); });
            }
            return false;
          }
          const k = t - m.t0;
          if (m.st === 'aim') {
            b.hs = 0; b.hx += .1 * (m.hx0 - b.hx); b.hy += .1 * (a.floor - 100 - b.hy); b.ha = angTo(b.ha, dir > 0 ? .45 : Math.PI - .45, .08); b.jaw = Math.min(.6, b.jaw + .03);
            if (k >= m.W) { m.st = 'fire'; m.t0 = t; sfx('fire', { x: b.hx }); }
            return false;
          }
          if (m.st === 'fire') {
            b.jaw = 1; b.hot = 0;
            const i = Math.floor(k / 6);
            if (k % 6 === 0 && i < 7) { const mo = mouth(b); lob(b, mo.x, mo.y, m.xs[i], 30); sfx('fire', { x: mo.x, vol: .4 }); }
            b.ha = angTo(b.ha, Math.atan2(a.floor - b.hy, (m.xs[Math.min(6, i)] || b.hx) - b.hx), .15);
            G.Light && G.Light.add(b.hx, b.hy, 90, '#ffb040', .8);
            if (k >= 44) { m.st = 'tired'; m.t0 = t; }
            return false;
          }
          // the head sinks to the ground: this is the window (the move's open time keeps it there)
          return true;
        } },
      sweep: { w: [3, 3, 2], cd: 200, open: [50, 46, 40],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.dir = pl.x > b.hx ? 1 : -1; m.sx0 = m.dir > 0 ? a.x0 - 60 : a.x1 + 60; m.st = 'go'; }
          if (m.st === 'go') {
            steer(b, m.sx0, a.floor - 120, 6, .1);
            if (Math.hypot(b.hx - m.sx0, b.hy - (a.floor - 120)) < 40 || t > 120) {
              m.st = 'wind'; m.t0 = t; m.n0 = BM.now(); m.W = b.tele(30);
              b.add(new KIT.Marker({ style: 'hline', x0: a.x0, x1: a.x1, x: a.cx, w: a.x1 - a.x0, y: a.floor - 2, life: m.W + 10, color: FIRE, dir: m.dir }));
              m.th = BM.threat(b, { in: 999, dur: 400, box: () => ({ x: a.x0, y: a.floor - 32, w: a.x1 - a.x0, h: 32 }), how: 'jump' });
              m.th.dyn = p => { if (m.st !== 'skim' && m.st !== 'wind') return null; const sx = m.st === 'wind' ? m.sx0 : b.hx; const d = (p.x - sx) * m.dir; if (d < -40) return null; const tt = (m.st === 'wind' ? (m.W - (t2() - m.n0)) : 0) + Math.round((d - 26) / 6.5); return tt; };
            }
            return false;
          }
          const k = t - m.t0;
          if (m.st === 'wind') { b.hs = 0; b.hy += .15 * (a.floor - 30 - b.hy); b.ha = angTo(b.ha, m.dir > 0 ? 0 : Math.PI, .15); b.jaw = .5; if (k >= m.W) { m.st = 'skim'; m.t0 = t; sfx('boss_roar', { x: b.hx, pitch: 1.2, vol: .5 }); m.hit = new Set(); } return false; }
          if (m.st === 'skim') {
            b.ha = m.dir > 0 ? 0 : Math.PI; b.hs = 6.5; b.hx += 6.5 * m.dir; b.hy += .3 * (a.floor - 22 - b.hy); b.jaw = .8;
            if (k % 3 === 0) G.FX.dust(b.hx, a.floor, 3, 2);
            // the head and the first seven body rings skim the floor
            BM.strike(b, { x: b.hx - 24, y: a.floor - 32, w: 48, h: 32 }, { k: .9, kbx: 4.5 * m.dir, kby: -4, dir: m.dir, status: burn() }, m.hit);
            for (let i = 0; i < 7; i++) { const s = b.segs[i]; if (s) BM.strike(b, { x: s.x - s.r * .8, y: Math.max(s.y - s.r * .8, a.floor - 30), w: s.r * 1.6, h: Math.min(30, a.floor - (s.y - s.r * .8)) }, { k: .7, kbx: 3 * m.dir, kby: -4, dir: m.dir }, m.hit); }
            if ((m.dir > 0 && b.hx > a.x1 + 60) || (m.dir < 0 && b.hx < a.x0 - 60) || k > 220) { m.st = 'up'; m.t0 = t; }
            return false;
          }
          b.hx = U.approach(b.hx, m.dir > 0 ? a.x1 - 70 : a.x0 + 70, 5); b.hy += .2 * (a.floor - 20 - b.hy); b.ha = angTo(b.ha, m.dir > 0 ? Math.PI - .2 : .2, .1);
          return k >= 24 ? 56 : false;
        } },
      bite: { w: [3, 3, 2.5], open: [44, 40, 36],
        run(b, t, m) { if (t === 1) b.data.biteLow = false; const r = biteRun(b, t, m, b.phase >= 2 && Math.random() < .45 ? 22 : 0); if (r && m.ground) { b.data.biteLow = true; return 54; } return r; } },
      /* phase 2 */
      dive: { ph: 2, w: [0, 3, 2.5], open: [0, 70, 60],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.st = 'rise'; m.tx = clamp(pl.x, a.x0 + 30, a.x1 - 30); }
          const k = t - (m.t0 || 0);
          if (m.st === 'rise') {
            steer(b, m.tx + (b.hx < m.tx ? -40 : 40), a.floor - 300, 6, .1);
            if (b.hy < a.floor - 250 || t > 80) { m.st = 'aim'; m.t0 = t; m.W = b.tele(40); m.mk = b.add(new KIT.Marker({ style: 'column', x: m.tx, y: a.floor, w: 46, life: m.W + 24, color: FIRE, top0: a.floor - 420 })); m.th = BM.threat(b, { in: m.W + 16, dur: 6, box: BM.boxAt(m.tx, a.floor - 60, 56, 60), how: 'out' }); sfx('boss_roar', { x: b.hx, pitch: 1.3, vol: .5 }); }
            return false;
          }
          if (m.st === 'aim') {
            if (k < m.W - 16 && BM.okP(pl)) { m.tx = lerp(m.tx, clamp(pl.x, a.x0 + 30, a.x1 - 30), .08); m.mk.x = m.tx; m.th.box = BM.boxAt(m.tx, a.floor - 60, 56, 60); }
            b.hx += .12 * (m.tx - b.hx); b.hy += .1 * (a.floor - 270 - b.hy); b.hs = 0; b.ha = angTo(b.ha, Math.PI / 2, .14); b.jaw = Math.min(.7, b.jaw + .05);
            if (k >= m.W) {
              m.st = 'fall'; m.t0 = t; m.v = 3; sfx('whoosh', { x: b.hx });
              // the fall takes ~24 frames; the fire leaves the crater 8 frames after it
              m.wth = [-1, 1].map(dir => waveThreat(b, m.tx + 22 * dir, dir, 3 + .3 * b.phase, 32)).filter(Boolean);
            }
            return false;
          }
          if (m.st === 'fall') {
            m.v = Math.min(13, m.v + .75); b.ha = Math.PI / 2; b.hx += .2 * (m.tx - b.hx); b.hy += m.v;
            if (b.hy >= a.floor - 18) {
              b.hy = a.floor - 18; m.st = 'stuck'; m.t0 = t; b.drape = true; m.lie = b.hx > a.cx ? Math.PI - .12 : .12; b.jaw = .8;
              G.shake(.85); G.hitstop(6); sfx('explosion', { x: b.hx }); sfx('stomp', { x: b.hx }); G.FX.explosion(b.hx, a.floor - 14, { size: 'l', pal: 'fire', shake: 0, debris: false });
              BM.strike(b, BM.boxAt(b.hx, a.floor - 60, 56, 60), { k: 1.1, kbx: 4, kby: -5, dir: Math.sign(pl.x - b.hx) || 1, status: burn(), heavy: true }, new Set());
              m.waveAt = t + 8;
              for (const th of m.wth || []) { th.wave.t0 = BM.now() + 8; th.wave.x0 = b.hx + 22 * th.wave.dir; }
              G.FX.flashRing && G.FX.flashRing(b.hx, a.floor, 40, { pal: 'gold', flat: true, rate: 2 });
            }
            return false;
          }
          if (m.waveAt && t === m.waveAt) {
            m.waveAt = 0;
            for (const dir of [-1, 1]) { const x0 = b.hx + 22 * dir; b.add(new KIT.Shockwave(x0, a.floor, dir, { pal: G.Art.FLAME_FIRE, color: FIRE, color2: '#c83a1a', dust: '#6a4a3a', dmg: .55 * b.dmg, spd: 3 + .3 * b.phase, h: 20, status: burn() })); }
          }
          if (m.waveAt) return false;
          // stuck in the ground: the window is the move's open time
          return true;
        } },
      rain: { ph: 2, w: [0, 2.5, 2], cd: 360, open: [0, 40, 36],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) m.st = 'go';
          if (m.st === 'go') { steer(b, a.cx + 40 * Math.sin(b.t * .03), a.floor - 230, 4.5, .08); if (t > 50) { m.st = 'cast'; m.t0 = t; m.W = b.tele(32); } return false; }
          const k = t - m.t0;
          b.hs = U.approach(b.hs, .8, .2); b.hx += Math.cos(b.ha) * b.hs; b.hy += Math.sin(b.ha) * b.hs; b.ha = angTo(b.ha, -Math.PI / 2 + .4 * Math.sin(b.t * .05), .05);
          b.jaw = k > m.W - 10 && k < m.W + 40 ? 1 : Math.max(0, b.jaw - .05);
          if (k === m.W) {
            b.roar({ color: '#ffd76e', x: b.hx, y: b.hy, flashA: .2, shake: .4 });
            const n = b.phase >= 3 ? 7 : 6, xs = [clamp(pl.x, a.x0 + 20, a.x1 - 20)];
            for (let i = 0; i < 50 && xs.length < n; i++) { const x = U.rand(a.x0 + 20, a.x1 - 20); if (xs.every(q => Math.abs(q - x) > 54)) xs.push(x); }
            xs.forEach((x, i) => { b.add(new KIT.Meteor(x, a.floor, 26 + 12 * i, { kind2: 'sun', dmg: .7 * b.dmg, R: 24 })); BM.threat(b, { in: 26 + 12 * i + 24, dur: 8, box: BM.boxAt(x, a.floor - 40, 50, 40), how: 'out' }); });
          }
          return k >= m.W + 100;
        } },
      coil: { ph: 2, w: [0, 2, 2], cd: 900, open: [0, 40, 36],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) {
            const P = KIT.plats().filter(p => p.y < a.floor - 20);
            P.sort((p, q) => Math.abs((p.cx || (p.x0 + p.x1) / 2) - pl.x) - Math.abs((q.cx || (q.x0 + q.x1) / 2) - pl.x));
            m.p = P[0]; if (!m.p) return true;
            m.cx = m.p.cx || (m.p.x0 + m.p.x1) / 2; m.pw = (m.p.x1 - m.p.x0) || m.p.w || 96; m.st = 'go'; m.an = 0;
          }
          if (m.st === 'go') { steer(b, m.cx - m.pw, m.p.y - 40, 5, .1); if (Math.hypot(b.hx - (m.cx - m.pw), b.hy - (m.p.y - 40)) < 30 || t > 90) { m.st = 'wrap'; m.t0 = t; m.W = b.tele(24); } return false; }
          const k = t - m.t0;
          if (m.st === 'wrap') {
            // one loop round the ledge
            m.an += .09; const r = m.pw * .7;
            b.hx = lerp(b.hx, m.cx - Math.cos(m.an) * r, .25); b.hy = lerp(b.hy, m.p.y - 10 - Math.sin(m.an) * 34, .25); b.ha = m.an + Math.PI / 2; b.hs = 2;
            if (k === m.W) {
              sfx('fire', { x: m.cx }); G.shake(.3);
              const w = Math.round(m.pw * .3);
              for (const side of [-1, 1]) { const x = m.cx + side * (m.pw / 2 - w / 2); const fp = b.add(new KIT.FirePool(x, m.p.y, { w, life: 420, pal: G.Art.FLAME_FIRE, glowC: '#ff8a2a', dmg: .3 * b.dmg, status: burn() })); void fp; BM.threat(b, { in: 0, dur: 420, box: { x: x - w / 2, y: m.p.y - 14, w, h: 14 }, how: 'out' }); }
              d.coiled = { x: m.cx, y: m.p.y, w: m.pw, t: 420 };
            }
            if (m.an > Math.PI * 2) { m.st = 'off'; m.t0 = t; }
            return false;
          }
          steer(b, a.cx, a.floor - 170, 4, .08);
          return k >= 20;
        } },
      /* phase 3 */
      eclipse: { ph: 3, w: [0, 0, 4], cd: 1500, open: [0, 0, 20], ok: b => !(b.data.eclipse > 0),
        run(b, t, m) {
          const a = A();
          if (t === 1) { m.W = b.tele(30); m.st = 'go'; }
          steer(b, a.cx, a.floor - 240, 3, .06); b.jaw = Math.min(1, b.jaw + .05);
          if (t === m.W) { b.roar({ color: '#2a1020', x: b.hx, y: b.hy, flashA: .1 }); b.data.eclipse = 720; G.UI && G.UI.toast && G.UI.toast(t0(TX.eclipse), '#9ff3e6'); }
          return t >= m.W + 20;
        } },
      float: { ph: 3, w: [0, 0, 3], cd: 420, open: [0, 0, 44],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) { m.W = b.tele(28); }
          steer(b, a.cx + 120 * Math.sin(b.t * .02), a.floor - 200, 3, .06);
          if (t === m.W) {
            b.roar({ color: '#ffd76e', x: b.hx, y: b.hy, flashA: .15, shake: .3 }); G.UI && G.UI.toast && G.UI.toast(t0(TX.float), '#ffd76e');
            const xs = [clamp(pl.x, a.x0 + 30, a.x1 - 30)];
            for (let i = 0; i < 40 && xs.length < 4; i++) { const x = U.rand(a.x0 + 30, a.x1 - 30); if (xs.every(q => Math.abs(q - x) > 90)) xs.push(x); }
            d.slabs = xs.map((x, i) => ({ x, t: 0, d: 36 + i * 8, hit: new Set(), hit2: new Set() }));
            for (const s of d.slabs) { BM.mark(b, s.x, 44, s.d + 2, '#ffd76e', { hgt: 30 }); BM.threat(b, { in: s.d, dur: 8, box: BM.boxAt(s.x, a.floor - 70, 44, 70), how: 'out' }); BM.threat(b, { in: s.d + 100, dur: 6, box: BM.boxAt(s.x, a.floor - 40, 44, 40), how: 'out' }); }
          }
          return t >= m.W + 30;
        } },
      strafe: { ph: 3, w: [0, 0, 2.5], cd: 300, open: [0, 0, 40],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.dir = b.hx < a.cx ? 1 : -1; m.st = 'go'; m.sx0 = m.dir > 0 ? a.x0 - 80 : a.x1 + 80; }
          if (m.st === 'go') { steer(b, m.sx0, a.floor - 140, 6, .1); if (Math.hypot(b.hx - m.sx0, b.hy - (a.floor - 140)) < 40 || t > 100) { m.st = 'run'; m.t0 = t; m.W = b.tele(22); } return false; }
          const k = t - m.t0;
          if (k < m.W) { b.ha = angTo(b.ha, m.dir > 0 ? 0 : Math.PI, .1); return false; }
          steer(b, b.hx + 200 * m.dir, a.floor - 135 + 16 * Math.sin(k * .08), 4.4, .12); b.jaw = .8;
          if ((k - m.W) % 18 === 0 && b.hx > a.x0 && b.hx < a.x1 && BM.okP(pl)) {
            const mo = mouth(b), tx = clamp(pl.x + U.rand(-30, 30), a.x0 + 10, a.x1 - 10), u = 36;
            lob(b, mo.x, mo.y, tx, u, { poolLife: 70 }); BM.mark(b, tx, 30, u + 2, FIRE, { hgt: 18 }); BM.threat(b, { in: u, dur: 70, box: { x: tx - 18, y: a.floor - 20, w: 36, h: 20 }, how: 'out' });
            { const sw = Math.abs(tx - mo.x) / u * 10 + 24; BM.threat(b, { in: u - 10, dur: 12, box: { x: tx > mo.x ? tx + 12 - sw : tx - 12, y: a.floor - 40, w: sw, h: 40 }, how: 'out' }); }   // the fireball's last frames cross the hero's height sfx('fire', { x: mo.x, vol: .5 });
          }
          return (m.dir > 0 && b.hx > a.x1 + 60) || (m.dir < 0 && b.hx < a.x0 - 60) || k > 260;
        } }
    };
    const t0 = s => t(s);
    const t2 = () => BM.now();
    function waveThreat(b, x0, dir, spd, delay) {
      const pl = b.player; if (!BM.okP(pl)) return;
      const dist = (pl.x - x0) * dir; if (dist < 0) return;
      return BM.threat(b, { in: delay + Math.max(0, Math.round((dist - 12) / spd)), dur: 8, box: BM.boxAt(pl.x, A().floor - 20, 26, 20), how: 'jump', wave: { x0, dir, spd, t0: BM.now() + delay } });
    }
    // the bite: rise to the side, a red aim line, the lunge (phase 2: sometimes the line locks and he waits)
    function biteRun(b, t, m, delay) {
      const a = A(), pl = b.player;
      if (t === 1) { m.side = b.hx < pl.x ? -1 : 1; m.st = 'go'; m.delay = delay; }
      if (m.st === 'go') {
        const tx = clamp(pl.x + 170 * m.side, a.x0 - 40, a.x1 + 40), ty = Math.min(pl.y - 80, a.floor - 90);
        steer(b, tx, ty, 5, .09);
        if (Math.hypot(b.hx - tx, b.hy - ty) < 28 || t > 90) {
          m.st = 'wind'; m.t0 = t; m.n0 = BM.now(); m.W = b.tele(32); m.ax = pl.x; m.ay = pl.cy;
          b.add(new KIT.Marker({ style: 'aim', x: b.hx, y: b.hy, x1: m.ax, y1: m.ay, life: m.W + m.delay + 2, color: '#ff4a3a', follow: q => { q.x = b.hx; q.y = b.hy; q.x1 = m.ax; q.y1 = m.ay; } }));
          m.th = BM.threat(b, { in: m.W + m.delay + 6, dur: 40, box: () => ({ x: m.ax - 30, y: m.ay - 30, w: 60, h: 60 }), how: 'roll', feint: !!m.delay, noWalk: true });
          m.th.dyn = p => { if (m.st === 'wind') return (m.W + m.delay - (t2() - m.n0)) + Math.round(Math.max(0, Math.hypot(p.x - b.hx, p.cy - b.hy) - 26) / 9.5); if (m.st === 'lunge') { const dd = Math.hypot(p.x - b.hx, p.cy - b.hy); return dd > 120 ? null : Math.round(Math.max(0, dd - 26) / 9.5); } return null; };
        }
        return false;
      }
      const k = t - m.t0;
      if (m.st === 'wind') {
        if (k < m.W - 10) { m.ax = lerp(m.ax, pl.x, .25); m.ay = lerp(m.ay, pl.cy, .25); }
        const an = Math.atan2(m.ay - b.hy, m.ax - b.hx);
        b.ha = angTo(b.ha, an, .15); b.hs = 0; b.hx -= .5 * Math.cos(an); b.hy -= .5 * Math.sin(an); b.jaw = Math.min(1, b.jaw + .06);
        if (m.delay && k === m.W) sfx('telegraph', { x: b.hx, pitch: 1.5, vol: .5 });
        if (k >= m.W + m.delay) { m.st = 'lunge'; m.t0 = t; m.ux = Math.cos(an); m.uy = Math.sin(an); sfx('boss_roar', { x: b.hx, pitch: 1.4, vol: .6 }); sfx('whoosh', { x: b.hx }); m.hit = new Set(); }
        return false;
      }
      if (m.st === 'lunge') {
        const sp = k < 24 ? 9.5 : 6;
        if (b.hy > a.floor - 30 && m.uy > -.6) { m.uy -= .12; const n = Math.hypot(m.ux, m.uy); m.ux /= n; m.uy /= n; }
        b.hx += m.ux * sp; b.hy += m.uy * sp; b.hs = sp; b.ha = Math.atan2(m.uy, m.ux); b.jaw = k < 14 ? 1 : Math.max(0, b.jaw - .2);
        if (k < 26) BM.strike(b, headBox(b), { k: 1, kbx: 4.5, kby: -4, dir: Math.sign(m.ux) || 1, status: burn() }, m.hit);
        if (k === 14) { sfx('hit_heavy', { x: b.hx, vol: .5 }); const mo = mouth(b); G.FX.hitStar(mo.x, mo.y, { r: 10, n: 6, pal: 'fire' }); }
        if (b.hy >= a.floor - 26 && k > 8 && !m.ground) { m.ground = t; G.shake(.4); sfx('stomp', { x: b.hx }); G.FX.dust(b.hx, a.floor, 10, 2); }
        if (m.ground) { b.hy = Math.min(b.hy, a.floor - 20); b.hx -= m.ux * sp * .9; b.hs = 0; }
        if (k >= 32) { m.st = 'rise'; m.t0 = t; if (m.ground) return true; }
        return false;
      }
      steer(b, b.hx + (b.hx < a.cx ? 50 : -50), a.floor - 140, lerp(1.5, 4, Math.min(1, k / 30)), .08);
      return k >= 20;
    }
    // the floor slabs of phase 3: burst up, hang, fall back where they rose
    function slabs(b) {
      const d = b.data, a = A(); if (!d.slabs) return;
      for (const s of d.slabs) {
        s.t++;
        const up = s.t - s.d;
        if (up === 0) { G.shake(.3); sfx('break', { x: s.x }); G.FX.debris(s.x, a.floor - 4, 10, 0, ['#5a3a2a', '#8a6a4a', '#ffd76e'], { speed: 3 }); }
        if (up >= 0 && up <= 8) BM.strike(b, BM.boxAt(s.x, a.floor - 70, 44, 70), { k: .7, kbx: 2, kby: -5, dir: 1, type: 'magic' }, s.hit);
        if (up === 70) BM.mark(b, s.x, 44, 32, '#ffd76e', { hgt: 30 });
        if (up >= 100 && up <= 106) BM.strike(b, BM.boxAt(s.x, a.floor - 40, 44, 40), { k: .8, kbx: 3, kby: -4, dir: 1, heavy: true }, s.hit2);
        if (up === 100) { G.shake(.4); sfx('stomp', { x: s.x }); G.FX.dust(s.x, a.floor, 10, 2); }
      }
      d.slabs = d.slabs.filter(s => s.t - s.d < 120);
      if (!d.slabs.length) d.slabs = null;
    }
    const slabY = (s, a) => { const up = s.t - s.d; if (up < 0) return a.floor; if (up < 20) return a.floor - 140 * (1 - (1 - up / 20) ** 2); if (up < 88) return a.floor - 140 + Math.sin(up * .2) * 3; return Math.min(a.floor, a.floor - 140 + 140 * ((up - 88) / 12) ** 2); };

    BM.install('aidahar', {
      moves, rest: [56, 46, 36], moteColor: '#ffd76e',
      def0: { hp: 720, dmg: 20 },   // the head is in reach far less often than any other boss: fewer hp, same moveset (no damage sponge)
      setup(b) { delete b.pick; delete b.rest; delete b.tele; b.contact = 0; },
      tick(b) {
        const d = b.data;
        b.hot = 0; b.bodyHot = 0;
        if (!d.partsK && b.parts.length) { d.partsK = 1; for (const q of b.parts) if (q.mul === .25) q.mul = .5; }   // the body rings: what a blade can reach while he flies
        if (b.mode === 'fight') slabs(b);
        if (d.coiled && --d.coiled.t <= 0) d.coiled = null;
        if (d.eclipse > 0 && b.mode === 'fight') {
          d.eclipse--;
          const k = Math.min(1, Math.min(d.eclipse, 720 - d.eclipse) / 60);
          BM.dark(b, .93 * k, '#020104'); d.eclK = k;
          // only Sado's light: his wisp shines brighter in the dark (without him, the hero's own lamp)
          const pl = b.player, w = G.world && G.world.ents && G.world.ents.find(e => e && (e.art === 'sadoWisp' || e.objArt === 'sadoWisp'));
          const p = w || (pl ? { x: pl.x, y: pl.y - 20 } : null);
          if (p) { G.Light && G.Light.add(p.x, p.y, 150 * k + 20, '#9ff3e6', .9 * k); G.Light && G.Light.add(p.x, p.y, 70, '#ffffff', .4 * k); }
        } else if (d.eclK) { d.eclK = 0; BM.dark(b, 0); }
      },
      idle(b) {
        const pl = b.player, a = A(), d = b.data;
        if (!BM.okP(pl)) return;
        if (d.idleSide === undefined || b.state !== 'idle') d.idleSide = pl.x > a.cx ? -1 : 1;
        const tx = a.cx + 200 * d.idleSide + 40 * Math.cos(.02 * b.t), ty = a.floor - 110 + 14 * Math.sin(.035 * b.t);
        steer(b, tx, ty, 2.4 * b.spdK(), .05); b.jaw = Math.max(0, b.jaw - .04); b.drape = false;
      },
      recover(b, left) {
        const d = b.data, a = A();
        // after the breath / the dive the head lies at the ground (the window)
        if (d.recMv === 'breath' || d.recMv === 'dive' || (d.recMv === 'bite' && d.biteLow) || d.recMv === 'sweep') {
          b.hs = 0; b.drape = true; b.hx += .06 * ((d.recX || b.hx) - b.hx); b.hy += .08 * (a.floor - 18 - b.hy);
          b.ha = angTo(b.ha, b.hx > a.cx ? Math.PI - .12 : .12, .06); b.jaw = .3;
          if (b.t % 24 === 0) G.FX.spawn({ x: b.hx + U.rand(-6, 6), y: b.hy - 26, vy: -.3, life: 24, shape: 'star', size: 2, color: '#ffe066', glow: true });
          if (left <= 1) b.drape = false;
        } else steer(b, b.hx + Math.cos(b.ha) * 20, b.hy - 2, 1.2, .03);
      },
      onPhaseInterrupt(b) { b.drape = false; b.data.slabs = null; },
      onDying(b) { b.data.eclipse = 0; b.data.slabs = null; BM.dark(b, 0); },
      drawFx(ctx, b) {
        const d = b.data, a = A();
        if (d.slabs) for (const s of d.slabs) {
          if (s.t < s.d) continue;
          const y = Math.round(slabY(s, a)), x = Math.round(s.x);
          ctx.fillStyle = '#2a1a14'; ctx.fillRect(x - 22, y - 12, 44, 14); ctx.fillStyle = '#5a3a2a'; ctx.fillRect(x - 21, y - 12, 42, 3); ctx.fillStyle = '#8a6a4a'; ctx.fillRect(x - 20, y - 12, 40, 1);
          ctx.fillStyle = '#ffd76e'; ctx.fillRect(x - 6, y - 7, 3, 1); ctx.fillRect(x + 4, y - 5, 2, 1);
          G.Glow.add(x, y - 6, 26, '#ffd76e', .35);
          if (y < a.floor - 4) { ctx.globalAlpha = .4; ctx.fillStyle = '#000000'; ctx.fillRect(x - 22, a.floor - 2, 44, 2); ctx.globalAlpha = 1; }
        }
      }
    });
    { const def = ED.aidahar, ui = def.update; void ui; }
    // remember where the head was when a window begins (it settles there)
    { const end0 = BM.end; BM.end = function (b, open) { if (b.def.id === 'aidahar') b.data.recX = b.hx; return end0.apply(this, arguments); }; }
  } catch (e) { console.error('[ajdaho]', e); }
}
