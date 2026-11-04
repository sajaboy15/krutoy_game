/* 65g_boss_barys.js — stage 8a: Ak Bars, the white guardian of the Spine (GDD ch. 17 §7). A snow leopard the size of a horse on a
   chain that is a sound. Fast; his danger is speed and rhythm, never a wall of numbers.
   Phase 1:  pounce (crouches — and waits; sometimes twice — then leaps where his mark lies)
             tail (a low sweep behind him: jump it)
             roar (snow and ice come down from the rocks where the marks are)
             circle (he runs round you and strikes from the other side)
             swipe (two claws; three in phase 2)
   Phase 2 (60%): blizzard (the storm comes down: you see little; he fades into it and pounces from the white — his eyes and
             the mark on the snow show where), breath (a cone of frost: it slows, and it piles up), walldive (up onto the
             rock face, a breath of stillness, then a dive at you)
   Phase 3 (30%): the chain pulls taut. It lashes across the shrine on its own (low: jump, high: roll), and he throws himself
             against it (strain): while he strains the links glow — break the chain in the fight and the fight ends another
             way (he is freed; 71_act2.js reads G.BM.barysFreed). */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (BM && ED && ED.barys) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const A = () => BM.arena(), sfx = BM.sfx;
    const ICE = '#9fe8ff', SONG = '#c8b8ff';
    const TX = {
      storm: `The blizzard comes down|Налетает метель|Bo'ron bostirib keldi`,
      strain: `He strains at the chain — strike the links!|Он рвётся с цепи — бей по звеньям!|U zanjirni yulqiyapti — halqalarga ur!`,
      freed: `The chain breaks|Цепь лопнула|Zanjir uzildi`
    };
    const cold = () => ({ slow: { t: 70 } });
    const NECK = b => ({ x: b.x + b.facing * 30, y: b.y - 34 });
    const anchor = () => { const a = A(); return { x: a.cx, y: a.floor }; };

    // a leap along a parabola to tx (manual, gravity off); lands on the floor
    function leap(b, m, t, T, H) {
      const a = A(), u = clamp((t - m.L0) / T, 0, 1);
      b.x = lerp(m.x0, m.tx, u); b.y = lerp(m.y0, a.floor, u) - H * 4 * u * (1 - u); b.vx = 0; b.vy = 0; b.onGround = u >= 1; b.noGrav = u < 1;
      return u >= 1;
    }
    function landing(b, k) {
      const a = A();
      G.shake(.35 * k); sfx('land', { x: b.x }); G.FX.dust(b.x, a.floor, 10, 1.8);
      for (let i = 0; i < 8; i++) G.FX.spawn({ x: b.x + U.rand(-20, 20), y: a.floor - 2, vx: U.rand(-1.5, 1.5), vy: -U.rand(.5, 2), grav: .08, life: 30, size: 1, color: '#ffffff' });
    }
    const swipeBox = b => BM.box(b, 0, -64, 56, 64);
    function swipes(b, t, m, T0, n) {
      const d = b.data;
      for (let i = 0; i < n; i++) {
        const T = T0 + i * 36;
        if (t === T) { d.sw = i + 1; d.swT = b.stateT; b.facePlayer(); b.vx = b.facing * (i === n - 1 ? 4 : 2.2); sfx('swing_heavy', { x: b.x, pitch: 1.2 }); G.FX.smear({ owner: b, ox: 10, oy: -46, r0: 12, r1: i === n - 1 ? 54 : 46, a0: -1.6, a1: 1.1, dir: b.facing, color: '#ffffff', color2: '#7fd8ff', life: 10 }); }
        if (t >= T && t <= T + 4) BM.strike(b, swipeBox(b), { k: i === n - 1 ? .8 : .6, kbx: 3.5, kby: -3.5, status: cold() }, m['s' + i] || (m['s' + i] = new Set()));
      }
    }
    const swipeThreats = (b, T0, n) => { for (let i = 0; i < n; i++) BM.threat(b, { in: T0 + i * 36, dur: 5, box: () => { const q = swipeBox(b), st = i === n - 1 ? 18 : 10; return { x: b.facing > 0 ? q.x : q.x - st, y: q.y, w: q.w + st, h: q.h }; }, how: 'roll', noWalk: true }); };

    const moves = {
      pounce: { w: [5, 4, 3], range: [50, 999], open: [40, 36, 32],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) {
            b.vx = 0; m.W = b.tele(26); d.W = m.W + 999; b.setState('pounce');
            m.waits = b.phase >= 2 ? (Math.random() < .5 ? 2 : 1) : (Math.random() < .55 ? 1 : 0);   // the two delays
            m.go = m.W + m.waits * 14; m.T = 32;
            m.tx = clamp(pl.x, a.x0 + 40, a.x1 - 40);
            m.mk = BM.mark(b, m.tx, 64, m.go + m.T + 4, ICE, { hgt: 30 });
            m.th = BM.threat(b, { in: m.go + m.T, dur: 5, box: BM.boxAt(m.tx, a.floor - 40, 70, 40), how: 'out', feint: m.waits > 0 });
            if (d.storm > 0) { m.storm = true; }
          }
          if (t < m.go) {
            b.vx *= .7; b.facing = Math.sign(m.tx - b.x) || b.facing;
            if (t < m.go - 10 && BM.okP(pl)) { m.tx += clamp(clamp(pl.x, a.x0 + 40, a.x1 - 40) - m.tx, -2.2, 2.2); m.mk.x = m.tx; m.th.box = BM.boxAt(m.tx, a.floor - 40, 70, 40); }
            if (m.waits && (t === m.W || t === m.W + 14) && t < m.go) sfx('whoosh', { x: b.x, vol: .25, pitch: 1.8 });   // the tail twitch: not yet
            return false;
          }
          if (t === m.go) { m.L0 = t; m.x0 = b.x; m.y0 = b.y; b.setState('leap'); sfx('whoosh', { x: b.x }); b.facing = Math.sign(m.tx - b.x) || b.facing; }
          if (t < m.go + m.T) { leap(b, m, t, m.T, 70); return false; }
          if (t === m.go + m.T) { leap(b, m, t, m.T, 70); landing(b, 1); b.setState('land'); }
          if (t >= m.go + m.T && t <= m.go + m.T + 4) BM.strike(b, BM.boxAt(m.tx, a.floor - 40, 70, 40), { k: 1, kbx: 4, kby: -4, dir: Math.sign(pl.x - b.x) || 1, status: cold() }, m.hit || (m.hit = new Set()));
          return t >= m.go + m.T + 8;
        },
        cancel(b) { b.noGrav = false; b.alpha = 1; } },
      tail: { w: (b, dx) => { const pl = b.player; return BM.okP(pl) && Math.sign(pl.x - b.x) !== b.facing && dx < 100 ? 7 : dx < 60 ? 1.5 : 0; }, open: [30, 28, 24],
        run(b, t, m) {
          const a = A();
          const box = () => b.facing > 0 ? { x: b.x - 92, y: a.floor - 18, w: 70, h: 18 } : { x: b.x + 22, y: a.floor - 18, w: 70, h: 18 };
          if (t === 1) { b.vx = 0; m.W = b.tele(20); b.data.W = m.W; b.setState('tail'); const bx = box(); BM.hint(b, bx.x + bx.w / 2, bx.w, m.W + 4, '#9fe8ff'); BM.threat(b, { in: m.W, dur: 7, box, how: 'jump' }); }
          if (t === m.W) sfx('whoosh', { x: b.x });
          if (t >= m.W && t <= m.W + 7) BM.strike(b, box(), { k: .6, kbx: 4, kby: -4.5, dir: -b.facing }, m.hit || (m.hit = new Set()));
          b.vx *= .8;
          return t >= m.W + 20;
        } },
      roar: { w: [2.5, 2, 2], cd: 300, open: [40, 36, 30],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(28); d.W = m.W; b.setState('crack'); }
          if (t === m.W) {
            sfx('boss_roar', { x: b.x, pitch: 1.2 }); G.FX.flash('#dff4ff', .15); G.shake(.3);
            const n = b.phase >= 2 ? 6 : 5, xs = [clamp(pl.x, a.x0 + 20, a.x1 - 20)];
            for (let k = 0; k < 40 && xs.length < n; k++) { const x = U.rand(a.x0 + 20, a.x1 - 20); if (xs.every(q => Math.abs(q - x) > 50)) xs.push(x); }
            xs.forEach((x, i) => { b.add(new KIT.Meteor(x, a.floor, 26 + 12 * i, { kind2: 'ice', dmg: .6 * b.dmg, R: 20 })); BM.threat(b, { in: 26 + 12 * i + 24, dur: 8, box: BM.boxAt(x, a.floor - 40, 42, 40), how: 'out' }); });
          }
          b.vx *= .8;
          return t >= m.W + 40;
        } },
      circle: { w: [3, 3, 2], range: [0, 140], open: [40, 36, 32],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) { m.side = Math.sign(b.x - pl.x) || 1; m.tx = clamp(pl.x - m.side * 70, a.x0 + 40, a.x1 - 40); if (Math.abs(m.tx - pl.x) < 50) m.tx = clamp(pl.x + m.side * 70, a.x0 + 40, a.x1 - 40); }
          if (!m.arr) {
            b.vx = clamp(m.tx - b.x, -4.6, 4.6); b.facing = Math.sign(b.vx) || b.facing;
            if (Math.abs(m.tx - b.x) < 6 || t > 70) { m.arr = t; b.vx = 0; b.facePlayer(); m.W = b.tele(18); d.W = m.W; b.setState('swipe'); d.sw = 0; d.swT = -99; m.n = b.phase >= 2 ? 3 : 2; swipeThreats(b, m.W, m.n); BM.hint(b, b.x + b.facing * 28, 56, m.W + 4, '#9fe8ff', b.facing); }
            return false;
          }
          const k = t - m.arr;
          swipes(b, k, m, m.W, m.n); b.vx *= .85;
          return k >= m.W + 36 * (m.n - 1) + 14;
        } },
      swipe: { w: [3, 3, 2], range: [0, 80], open: [34, 30, 28],
        run(b, t, m) {
          const d = b.data;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(22); d.W = m.W; b.setState('swipe'); d.sw = 0; d.swT = -99; m.n = b.phase >= 2 ? 3 : 2; swipeThreats(b, m.W, m.n); BM.hint(b, b.x + b.facing * 28, 56, m.W + 4, '#9fe8ff', b.facing); }
          swipes(b, t, m, m.W, m.n); b.vx *= .85;
          return t >= m.W + 36 * (m.n - 1) + 14;
        } },
      /* phase 2 */
      blizzard: { ph: 2, w: [0, 3, 2], cd: [0, 1100, 1000], open: [0, 20, 20], ok: b => !(b.data.storm > 0),
        run(b, t, m) {
          const d = b.data;
          if (t === 1) { b.vx = 0; m.W = b.tele(30); b.setState('crack'); d.W = m.W; }
          if (t === m.W) { d.storm = 540; sfx('boss_roar', { x: b.x, pitch: .9 }); G.UI && G.UI.toast && G.UI.toast(t0(TX.storm), '#dff4ff'); }
          return t >= m.W + 16;
        } },
      breath: { ph: 2, w: [0, 3, 2.5], range: [0, 170], open: [0, 46, 40],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          const box = () => BM.box(b, 14, -46, 140, 46);
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(28); d.W = m.W; b.setState('crack'); const bx = box(); BM.mark(b, bx.x + bx.w / 2, bx.w, m.W + 42, ICE, { hgt: 20 }); BM.threat(b, { in: m.W, dur: 40, box, how: 'out' }); m.hit = new Set(); m.chill = 0; }
          if (t >= m.W && t < m.W + 40) {
            if (t % 4 === 0) sfx('ice', { x: b.x, vol: .3 });
            const n = NECK(b);
            for (let i = 0; i < 2; i++) G.FX.spawn({ x: n.x + b.facing * 6, y: n.y + 4, vx: b.facing * U.rand(2.5, 4.5), vy: U.rand(-.3, .9), drag: .97, life: 34, size: U.rand(1, 3), size1: 4, color: '#ffffff', color2: '#9fe8ff', alpha: .7, glow: true, glowR: 0 });
            G.Light && G.Light.add(b.x + b.facing * 80, b.y - 20, 110, '#bfe8ff', .5);
            if ((t - m.W) % 10 === 0) { m.hit = new Set(); BM.strike(b, box(), { k: .22, kbx: 1.2, kby: -1, status: { slow: { t: 90 } }, type: 'magic', noFlinch: true }, m.hit); }
            if (BM.okP(pl) && G.U.overlap(box(), pl.box()) && !(pl.state === 'roll')) { m.chill++; if (m.chill === 36 && !G.godMode) { pl.addStatus && pl.addStatus('freeze', { t: 50 }); G.FX.text(pl.x, pl.top - 12, t0(`Frozen|Замёрз|Muzlading`), '#dff4ff', { size: 7 }); } }
          }
          b.vx *= .8;
          return t >= m.W + 44;
        } },
      walldive: { ph: 2, w: [0, 2.5, 2], range: [80, 999], open: [0, 48, 42],
        run(b, t, m) {
          const a = A(), pl = b.player, d = b.data;
          if (t === 1) {
            m.side = pl.x > a.cx ? -1 : 1; m.wx = m.side < 0 ? a.x0 + 26 : a.x1 - 26; m.wy = a.floor - 110;
            b.setState('leap'); m.L0 = 1; m.x0 = b.x; m.y0 = b.y; m.T1 = 26; sfx('whoosh', { x: b.x });
          }
          if (t <= m.T1) { const u = t / m.T1; b.x = lerp(m.x0, m.wx, u); b.y = lerp(m.y0, m.wy, u) - 50 * 4 * u * (1 - u); b.noGrav = true; b.vx = b.vy = 0; b.onGround = false; b.facing = -m.side; return false; }
          if (t === m.T1 + 1) { m.W = b.tele(30); b.setState('crouch'); m.tx = clamp(pl.x, a.x0 + 40, a.x1 - 40); m.mk = BM.mark(b, m.tx, 70, m.W + 26, ICE, { hgt: 30 }); m.th = BM.threat(b, { in: m.W + 22, dur: 5, box: BM.boxAt(m.tx, a.floor - 40, 70, 40), how: 'out' }); G.FX.debris(b.x, b.y, 6, -m.side, ['#ffffff', '#c8d8f0'], { speed: 2 }); }
          if (t > m.T1 && t < m.T1 + 1 + m.W) {
            b.x = m.wx; b.y = m.wy; b.vy = 0; b.facing = m.side;
            if (t < m.T1 + m.W - 12 && BM.okP(pl)) { m.tx += clamp(clamp(pl.x, a.x0 + 40, a.x1 - 40) - m.tx, -2, 2); m.mk.x = m.tx; m.th.box = BM.boxAt(m.tx, a.floor - 40, 70, 40); }
            return false;
          }
          const k = t - (m.T1 + 1 + m.W);
          if (k === 0) { b.setState('leap'); sfx('whoosh', { x: b.x, pitch: .8 }); m.x1 = b.x; m.y1 = b.y; }
          if (k <= 22) { const u = k / 22; b.x = lerp(m.x1, m.tx, u); b.y = lerp(m.y1, a.floor, u * u); b.vx = b.vy = 0; b.onGround = false; if (k < 22) return false; }
          if (k === 22) { b.noGrav = false; b.onGround = true; b.y = a.floor; landing(b, 1.4); b.setState('land'); }
          if (k >= 22 && k <= 26) BM.strike(b, BM.boxAt(m.tx, a.floor - 40, 70, 40), { k: 1.1, kbx: 4.5, kby: -4.5, dir: Math.sign(pl.x - b.x) || 1, heavy: true, status: cold() }, m.hit || (m.hit = new Set()));
          return k >= 30;
        },
        cancel(b) { b.noGrav = false; } },
      /* phase 3 */
      strain: { ph: 3, w: [0, 0, 3], cd: 600, open: [0, 0, 40],
        run(b, t, m) {
          const a = A(), d = b.data, an = anchor();
          if (t === 1) {
            m.dir = b.x >= an.x ? 1 : -1; m.tx = clamp(an.x + m.dir * 200, a.x0 + 50, a.x1 - 50);
            b.setState('pounce'); d.W = 999; sfx('boss_roar', { x: b.x, pitch: .8 });
            G.UI && G.UI.toast && G.UI.toast(t0(TX.strain), SONG);
          }
          if (!m.at) { b.vx = clamp(m.tx - b.x, -4, 4); b.facing = m.dir; if (Math.abs(m.tx - b.x) < 6 || t > 80) { m.at = t; d.strain = 1; } return false; }
          const k = t - m.at;
          b.vx = m.dir * .3 * Math.sin(k * .3); b.facing = m.dir;
          if (k % 20 === 0) { G.shake(.15); sfx('chain', { x: b.x }); }
          if (k >= 170 || d.freed) { d.strain = 0; return true; }
          return false;
        },
        cancel(b) { b.data.strain = 0; } }
    };
    const t0 = s => t(s);

    // phase 3: the chain lashes the shrine on its own (only when no move of his lands within half a second)
    function chainTick(b) {
      const d = b.data, a = A();
      if (b.phase < 3 || b.mode !== 'fight' || d.freed) return;
      if (d.lash) {
        const L = d.lash, k = BM.now() - L.t0;
        if (k === L.W) { sfx('whoosh', { x: a.cx, pitch: .6 }); G.shake(.2); }
        if (k >= L.W && k <= L.W + 6) BM.strike(b, L.box, { k: .6, kbx: 3, kby: L.low ? -4 : -2, dir: Math.sign(b.player.x - a.cx) || 1, type: 'magic' }, L.hit);
        if (k > L.W + 14) d.lash = null;
        return;
      }
      if (d.strain) return;
      d.lashCD = (d.lashCD || 300) - 1;
      if (d.lashCD > 0) return;
      const now = BM.now(), W = 40;
      if (BM.live().some(q => Math.abs(q.at - (now + W)) < 34 && q.id === 'barys')) { d.lashCD = 20; return; }
      const low = Math.random() < .5;
      const box = low ? { x: a.x0, y: a.floor - 16, w: a.x1 - a.x0, h: 16 } : { x: a.x0, y: a.floor - 44, w: a.x1 - a.x0, h: 20 };
      d.lash = { t0: now, W, low, box, hit: new Set() };
      b.add(new KIT.Marker({ style: 'hline', x: a.cx, y: box.y + box.h / 2, w: a.x1 - a.x0, life: W + 2, color: SONG }));
      BM.threat(b, { in: W, dur: 7, box, how: low ? 'jump' : 'roll', mv: 'chain' });
      sfx('telegraph', { x: a.cx, pitch: 1.6 });
      d.lashCD = 240 + Math.floor(Math.random() * 90);
      BM.ev(b, 'chain', 'lash');
      d.log.chain = (d.log.chain || 0) + 1;
    }
    // the links: while he strains, the chain near the anchor can be struck; 12 blows break it
    function linkPart(b) {
      const d = b.data;
      if (!d.link) {
        d.link = new KIT.BossPart(b, .0001, 26, 30); G.world.add(d.link); b.parts.push(d.link);
        const p = d.link, th0 = p.takeHit;
        p.takeHit = function (e) {
          if (!d.strain || d.freed || !(e && e.src && e.src.faction === 'player')) return false;
          d.links = (d.links || 0) + 1; this.hurtT = 6;
          G.FX.sparks(this.x, this.y - 14, 5, 0, { color: '#ffffff', color2: SONG }); sfx('shield_block', { x: this.x, pitch: 1.5 });
          G.FX.text(this.x, this.y - 34, String(Math.max(0, 12 - d.links)), SONG, { size: 7, life: 30 });
          if (d.links >= 12) freeIt(b);
          return true;
        };
        void th0;
      }
      const an = anchor(), n = NECK(b);
      d.link.x = lerp(an.x, n.x, .35); d.link.y = lerp(an.y, n.y, .35) + 14;
      d.link.untargetable = !d.strain || !!d.freed; d.link.preferred = !d.link.untargetable && !!BM.preferLinks;
    }
    function freeIt(b) {
      const d = b.data; if (d.freed) return;
      d.freed = true; BM.barysFreed = true;
      BM.ev(b, 'chain', 'broken');
      G.UI && G.UI.toast && G.UI.toast(t(TX.freed), SONG);
      G.FX.flash('#ffffff', .5); G.shake(.8); sfx('break', { x: b.x }); sfx('boss_roar', { x: b.x, pitch: .7 });
      const an = anchor(), n = NECK(b);
      for (let i = 0; i < 14; i++) { const u = i / 13; G.FX.spawn({ x: lerp(an.x, n.x, u), y: lerp(an.y, n.y, u) - 10, vx: U.rand(-1.5, 1.5), vy: -U.rand(1, 3), grav: .12, life: 50, size: 2, shape: 'sq', color: SONG, glow: true, glowR: 0 }); }
      // the fight ends: he lies down (the death sequence carries the story hooks: the scene offers only to let him go)
      setTimeout(() => { try { if (!b.dead && b.mode !== 'dying') b.die({ freed: true }); } catch (e) { /* ignore */ } }, 0);
    }

    BM.install('barys', {
      moves, rest: [40, 34, 28], moteColor: '#dff4ff',
      def0: { hp: 1100, dmg: 20 },
      setup(b) { delete b.pick; delete b.rest; delete b.tele; b.contact = 0; BM.barysFreed = false; b.data.storm = 0; },
      tick(b) {
        const d = b.data, a = A();
        if (b.mode === 'fight') { chainTick(b); linkPart(b); }
        if (d.storm > 0 && b.mode === 'fight') {
          d.storm--;
          const k = Math.min(1, Math.min(d.storm, 540 - d.storm) / 50);
          BM.dark(b, .55 * k, '#1a2230');
          d.stormK = k;
          // he fades into the white between strings; he shows himself when he strikes
          const vis = d.mv && (d.mv !== 'pounce' || (d.mt > (d.m.go || 99) - 12)) ? 1 : .25;
          b.alpha = U.approach(b.alpha, lerp(1, vis, k), .08);
          const cam = G.cam;
          if (cam) for (let i = 0; i < 3; i++) G.FX.spawn({ x: cam.x + U.rand(-20, G.W + 40), y: cam.y + U.rand(0, G.H), vx: -U.rand(2.5, 5), vy: U.rand(.3, 1.2), life: 70, size: U.rand(1, 2), color: '#ffffff', alpha: .5 + .3 * k });
        } else if (d.stormK) { d.stormK = 0; BM.dark(b, 0); b.alpha = 1; }
      },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .85; return; }
        b.facePlayer();
        const u = pl.x - b.x, dx = Math.abs(u), want = 110;
        const dir = dx > want + 25 ? Math.sign(u) : dx < want - 40 ? -Math.sign(u) : 0;
        b.vx = U.approach(b.vx, dir * (dir === Math.sign(u) ? 1.5 : .9) * (1 + .12 * (b.phase - 1)) * b.spdK(), .12);
      },
      onPhaseInterrupt(b) { const d = b.data; b.noGrav = false; b.alpha = 1; d.strain = 0; d.lash = null; if (d.storm > 0) { d.storm = 0; } BM.dark(b, 0); d.stormK = 0; },
      onDying(b) { const d = b.data; b.noGrav = false; b.alpha = 1; d.strain = 0; d.storm = 0; BM.dark(b, 0); if (d.link) d.link.untargetable = true; },
      drawFx(ctx, b) {
        const d = b.data, an = anchor(), n = NECK(b), ph = b.phase;
        if (d.freed && b.mode === 'dying') return;
        // the song-chain: a thin sound from his neck to the post in the middle of the shrine; taut and bright in phase 3
        const taut = ph >= 3 || b.mode === 'phase' && ph >= 3, str = d.strain ? 1 : 0;
        const sag = taut ? 6 : 26, N = 24;
        ctx.globalAlpha = (taut ? .9 : .45) * Math.max(.3, b.alpha);
        for (let i = 0; i <= N; i++) {
          const u = i / N, x = lerp(an.x, n.x, u), y = lerp(an.y - 6, n.y, u) + Math.sin(u * Math.PI) * sag + Math.sin(b.t * .4 + u * 20) * (str ? 1.5 : .4);
          ctx.fillStyle = i % 2 ? SONG : '#ffffff'; ctx.fillRect(Math.round(x), Math.round(y), i % 2 ? 2 : 1, 1);
        }
        ctx.globalAlpha = 1;
        // the post
        ctx.fillStyle = '#3a3e52'; ctx.fillRect(Math.round(an.x) - 2, Math.round(an.y) - 12, 5, 12); ctx.fillStyle = '#9aa0c0'; ctx.fillRect(Math.round(an.x) - 2, Math.round(an.y) - 12, 5, 1);
        G.Glow.add(an.x, an.y - 8, 14, SONG, .4);
        if (str && d.link) { const p = d.link; G.Glow.add(p.x, p.y - 14, 22 + 6 * Math.sin(b.t * .4), '#ffffff', .7); ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 16, 5, 3); }
        if (d.lash) { const L = d.lash, k = BM.now() - L.t0; if (k >= L.W && k <= L.W + 8) { ctx.globalAlpha = 1 - (k - L.W) / 9; ctx.fillStyle = SONG; ctx.fillRect(Math.round(L.box.x), Math.round(L.box.y + L.box.h / 2), Math.round(L.box.w), 2); ctx.globalAlpha = 1; } }
        // the storm: eyes in the white
        if (d.stormK > .3 && b.alpha < .6) { const e = { x: b.x + b.facing * 38, y: b.y - 38 }; ctx.fillStyle = '#bff4ff'; ctx.fillRect(Math.round(e.x) - 2, Math.round(e.y), 2, 1); ctx.fillRect(Math.round(e.x) + 2, Math.round(e.y), 2, 1); G.Glow.add(e.x, e.y, 12, '#9fe8ff', .7); }
      }
    });
  } catch (e) { console.error('[barys]', e); }
}
