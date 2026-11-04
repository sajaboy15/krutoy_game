/* 65t_boss_humo.js — stage 6: HUMO, THE DIVAN'S GOLDEN BIRD (GDD ch. 17, §10: "a construct of gold and a thousand childhoods from
   Tilla-bek's cellar. Dives, golden rain, 'other people's childhoods' — copies of child-memories you cannot strike, only avoid.
   Tilla-bek comments from the balcony").
   A flyer: it hovers above the court and comes down to strike. Moves (G.BM runner, 65a; shared helpers G.BM6, 65s):
   Phase 1:  dive (a shadow on the floor locks on, then it drops; the beak sticks in the stone 1 s — the main window)
             rain (gold coins fall where the marks are: step out)
             rake (it sweeps the court low, wing-tip to wing-tip: jump it)
             gust (a beat of the wings shoves you back, then a fan of coins)
   Phase 2 (60%): children (three child-memories walk towards you: they cannot be hurt, only avoided), dive2 (two dives, the
             second after a false rise)
   Phase 3 (30%): fold (wings close: gold armour for 2 s, coins orbit; then they burst outward — roll through the ring)
             storm (rain and a rake together)
   Windows: after a dive 1 s (the beak in the stone); after the fold burst 1.3 s. */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, BK = G.BK, B6 = G.BM6;
  if (BM && KIT && BK && B6 && B6.wave && G.Enemies.defs.berkut_wraith) try {
    const clamp = B6.clamp, lerp = B6.lerp, A = () => BM.arena(), sfx = BM.sfx;
    const GOLD = '#ffd04a', PALE = '#fff0b0';
    const def = BK.champion('berkut_wraith', 'f_humo', {
      name: N(`Humo, the Divan's golden bird|Хумо, золотая птица Дивана|Humo, Devonning oltin qushi`), title: N(`A thousand childhoods, gilded|Тысяча детств, позолоченных|Zarhallangan ming bolalik`),
      hp: 1000, dmg: 20, scale: 3, phaseAt: [.6, .3],
      phaseNames: [null, N(`The children in the gold|Дети в золоте|Oltindagi bolalar`), N(`The bird folds its wings|Птица складывает крылья|Qush qanotini yig'adi`)],
      roarColor: GOLD, fxPal: 'gold', music: 'yd_boss_hound', arena: { w: 54, h: 24 }, contact: 0,
      look: { hue: -14, sat: 1.25, light: 1.12, minSat: 0.15 }
    });
    const quips = {
      dive: `"Mind the beak, yodchi. It cost more than your street."|«Осторожно с клювом, ёдчи. Он стоил дороже твоей улицы».|«Tumshug'iga ehtiyot bo'l, yodchi. U sening ko'changdan qimmatroq turgan».`,
      rain: `"Free money! Don't say the Divan never gave you anything."|«Деньги даром! Не говори потом, что Диван тебе ничего не дал».|«Tekin pul! Keyin Devon senga hech narsa bermadi, dema».`,
      children: `"Don't hit them. They're somebody's. Well — they were."|«Не бей их. Они чьи-то. Ну... были чьими-то».|«Ularni urma. Ular kimningdir. Xo'sh... kimningdir edi».`,
      fold: `"Gold doesn't bleed. It only gets more expensive."|«Золото не кровоточит. Оно только дорожает».|«Oltin qon ketmaydi. U faqat qimmatlashadi».`
    };
    const quip = (b, k) => { const d = b.data; d.quip = d.quip || {}; if (d.quip[k]) return; d.quip[k] = 1; B6.sub(quips[k], 'tillabek'); };
    // a child-memory: cannot be struck; walks after the hero; hurts on touch
    class Child extends KIT.Hazard {
      constructor(x, y, o) { super(x, y, 14, 28, Object.assign({ rehit: 50, life: 420 }, o)); this.ph = Math.random() * 6; }
      update() {
        super.update();
        const p = G.world.player;
        if (this.t > this.life || !p || (this.boss && this.boss.dead)) { this.dead = true; return; }
        const dx = p.x - this.x; this.x += Math.sign(dx) * Math.min(Math.abs(dx), .55); this.face = Math.sign(dx) || 1;
        if (this.t > 30) this.hitBox({ x: this.x - 7, y: this.y - 28, w: 14, h: 28 }, { kbx: 3 * (Math.sign(dx) || 1), kby: -2.5, dir: Math.sign(dx) || 1, type: 'magic', dmgColor: GOLD });
      }
      drawFx(ctx) {
        const a = Math.min(1, this.t / 30) * (this.t > this.life - 30 ? (this.life - this.t) / 30 : 1);
        ctx.save(); ctx.globalAlpha = .62 * a;
        try { G.PEOPLE.drawPerson(ctx, { look: 'child', x: Math.round(this.x), y: Math.round(this.y), t: this.t + this.ph * 20, face: this.face || 1, rim: PALE }); } catch (e) { /* ignore */ }
        ctx.restore();
        G.Glow.add(this.x, this.y - 14, 18, GOLD, .4 * a);
      }
    }
    const hover = b => A().floor - 110;
    const toFloor = b => A().floor;
    const moves = {
      dive: { w: [4, 3, 3], range: [0, 999], open: [64, 58, 52],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { quip(b, 'dive'); m.W = b.tele(28); m.tx = clamp(BM.okP(pl) ? pl.x : b.x, a.x0 + 30, a.x1 - 30); m.mk = BM.mark(b, m.tx, 64, m.W + 18, GOLD); m.th = BM.threat(b, { in: m.W + 14, dur: 6, box: BM.boxAt(m.tx, a.floor - 40, 64, 40), how: 'out' }); m.hit = new Set(); m.y0 = b.y; m.x0 = b.x; }
          if (t < m.W - 8 && BM.okP(pl)) { m.tx += clamp(clamp(pl.x, a.x0 + 30, a.x1 - 30) - m.tx, -2, 2); m.mk.x = m.tx; m.th.box = BM.boxAt(m.tx, a.floor - 40, 64, 40); }
          if (t >= m.W && t <= m.W + 14) { const k = (t - m.W) / 14; b.x = lerp(m.x0, m.tx, k); b.y = lerp(m.y0, toFloor(b) - 6, k * k); b.vx = b.vy = 0; if (t === m.W) sfx('whoosh', { x: b.x }); }
          if (t >= m.W + 12 && t <= m.W + 16) BM.strike(b, BM.boxAt(m.tx, a.floor - 40, 64, 40), { k: 1, kbx: 4.5, kby: -4, heavy: true }, m.hit);
          if (t === m.W + 14) { G.shake(.5); G.hitstop(3); sfx('stomp', { x: b.x }); G.FX.debris(b.x, a.floor - 4, 10, 0, ['#ffd04a', '#c8902a', '#fff0b0'], { speed: 3 }); }
          return t >= m.W + 16;
        } },
      rain: { w: [3, 2.5, 2], range: [0, 999], open: [40, 36, 32],
        run(b, t, m) {
          if (t === 1) { quip(b, 'rain'); m.W = b.tele(20); const a = A(), pl = b.player, px = BM.okP(pl) ? pl.x : b.x; B6.fall(b, [px, px + 64, px - 64, px + 128, px - 128].map(x => clamp(x, a.x0 + 24, a.x1 - 24)), 'sun', 10, .55); }
          return t >= m.W + 60;
        } },
      rake: { w: [3, 2.5, 2.5], range: [0, 999], open: [40, 36, 32],
        run(b, t, m) {
          const a = A();
          if (t === 1) { m.W = b.tele(26); m.dir = b.x < (a.x0 + a.x1) / 2 ? 1 : -1; m.hit = new Set(); m.sx = m.dir > 0 ? a.x0 + 20 : a.x1 - 20; BM.hint(b, (a.x0 + a.x1) / 2, a.x1 - a.x0 - 40, m.W + 30, GOLD, m.dir); const pl = b.player; if (BM.okP(pl)) BM.threat(b, { in: m.W + 10 + Math.round(Math.abs(pl.x - m.sx) / 7), dur: 6, box: BM.boxAt(pl.x, a.floor - 22, 30, 22), how: 'jump' }); }
          if (t < m.W) { b.x = lerp(b.x, m.sx, .12); b.y = lerp(b.y, a.floor - 14, .12); b.facing = m.dir; return false; }
          if (t >= m.W + 10) { b.x += m.dir * 7; b.y = a.floor - 12; BM.strike(b, { x: b.x - 26, y: a.floor - 22, w: 52, h: 22 }, { k: .75, kbx: 4 * m.dir, kby: -3 }, m.hit); if (t % 3 === 0) G.FX.dust(b.x, a.floor, 3, 1); }
          return t >= m.W + 10 && (b.x < a.x0 + 16 || b.x > a.x1 - 16);
        } },
      gust: { w: [2.5, 2, 2], range: [0, 220], open: [44, 40, 36],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); m.W = b.tele(22); m.hit = new Set(); BM.threat(b, { in: m.W + 24, dur: 60, box: BM.box(b, 0, -80, 240, 80), how: 'roll' }); }
          if (t === m.W) { sfx('whoosh', { x: b.x, pitch: .6 }); const pl = b.player; if (BM.okP(pl) && Math.abs(pl.x - b.x) < 220) { pl.vx += 6 * (Math.sign(pl.x - b.x) || 1); pl.vy = Math.min(pl.vy, -2); } }
          if (t === m.W + 24) { const pl = b.player, base = BM.okP(pl) ? Math.atan2(pl.cy - b.y, pl.x - b.x) : 0; for (let i = 0; i < 5 + b.phase; i++) { const an = base + .22 * (i - (4 + b.phase) / 2); b.add(new G.Projectile({ x: b.x, y: b.y, vx: Math.cos(an) * 3.6, vy: Math.sin(an) * 3.6, r: 3, grav: 0, life: 170, dmg: .5 * b.dmg, faction: 'enemy', owner: b, color: GOLD, kbx: 2, kby: -1.5, light: { r: 30, color: GOLD, a: .5 } })); } sfx('coin', { x: b.x }); }
          return t >= m.W + 30;
        } },
      children: { ph: 2, w: [0, 2.5, 2], cd: [0, 560, 480], open: [0, 30, 26],
        run(b, t, m) {
          const a = A();
          if (t === 1) { quip(b, 'children'); m.W = b.tele(26); }
          if (t === m.W) { sfx('summon', { x: b.x }); const pl = b.player; for (const dx of [-160, 160, 260]) { const x = clamp((BM.okP(pl) ? pl.x : b.x) + dx, a.x0 + 20, a.x1 - 20); b.add(new Child(x, a.floor, { dmg: .45 * b.dmg })); G.FX.poof(x, a.floor - 14, { pal: 'gold', r: 10 }); } }
          return t >= m.W + 12;
        } },
      dive2: { ph: 2, w: [0, 2.5, 2.5], range: [0, 999], open: [0, 66, 58],
        run(b, t, m) {
          if (!m.n) { m.n = 1; m.t0 = 0; m.sub = {}; }
          const r = moves.dive.run(b, t - m.t0, m.sub);
          if (r && m.n === 1) { m.n = 2; m.t0 = t + 18; m.sub = {}; m.rise = true; }
          if (m.rise && t < m.t0) { b.y = lerp(b.y, hover(b), .15); return false; }
          return r && m.n === 2;
        } },
      fold: { ph: 3, w: [0, 0, 2.5], cd: [0, 0, 420], open: [0, 0, 80],
        run(b, t, m) {
          if (t === 1) { quip(b, 'fold'); m.W = b.tele(18); b.data.fold = 1; }
          if (t === m.W) { b.data.armour = 1; sfx('ready', { x: b.x }); }
          if (t > m.W && t < m.W + 120 && t % 10 === 0) G.FX.spawn({ x: b.x + Math.cos(t * .2) * 30, y: b.y + Math.sin(t * .2) * 18, life: 20, size: 2, color: GOLD, glow: true });
          if (t === m.W + 100) { const a = A(), pl = b.player; if (BM.okP(pl)) BM.threat(b, { in: 20, dur: 12, box: { x: pl.x - 10, y: pl.y - 30, w: 20, h: 30 }, how: 'roll' }); BM.ring(b, b.x, 160, 20, GOLD); void a; }
          if (t === m.W + 120) { b.data.armour = 0; b.data.fold = 0; for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2; b.add(new G.Projectile({ x: b.x, y: b.y, vx: Math.cos(an) * 3.2, vy: Math.sin(an) * 3.2, r: 3, grav: 0, life: 150, dmg: .55 * b.dmg, faction: 'enemy', owner: b, color: GOLD, kbx: 2, kby: -2, light: { r: 30, color: GOLD, a: .5 } })); } G.shake(.3); sfx('explosion', { x: b.x, vol: .5 }); }
          return t >= m.W + 124;
        },
        cancel(b) { b.data.armour = 0; b.data.fold = 0; } },
      storm: { ph: 3, w: [0, 0, 2.5], open: [0, 0, 40],
        run(b, t, m) {
          if (t === 1) { m.rain = {}; m.rake = {}; }
          if (t < 30) { moves.rain.run(b, t, m.rain); return false; }
          return moves.rake.run(b, t - 29, m.rake);
        } }
    };
    BM.install('f_humo', {
      moves, rest: [40, 32, 26], moteColor: PALE,
      def0: { hp: 1000, dmg: 20, phaseAt: [.6, .3] },
      setup(b) { b.contact = 0; b.noGrav = true; },
      tick(b) { B6.runQ(b); },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer();
        const a = A(), tx = clamp(pl.x - b.facing * 90, a.x0 + 40, a.x1 - 40);
        b.vx = U.approach(b.vx, clamp((tx - b.x) * .04, -1.8, 1.8), .1);
        b.y = lerp(b.y, hover(b) + Math.sin(b.t * .05) * 8, .06); b.vy = 0;
      },
      recover(b) { const a = A(); if (b.data.rec < 30) b.y = lerp(b.y, hover(b), .05); else b.y = Math.max(b.y, a.floor - 30); },
      onPhaseInterrupt(b) { b.data.armour = 0; b.data.fold = 0; b.noGrav = true; },
      onPhase(b, ph) { B6.sub(ph === 2 ? `"Now you'll see what a childhood is worth on the open market."|«Сейчас увидишь, почём детство на открытом рынке».|«Hozir ochiq bozorda bolalik necha pul turishini ko'rasan».` : `"Careful. That bird is my whole inheritance."|«Осторожнее. Эта птица — всё моё наследство».|«Ehtiyot bo'l. Bu qush — mening butun merosim».`, 'tillabek'); },
      drawFx(ctx, b) { G.Glow.add(b.x, b.y - 10, b.data.fold ? 50 : 30, GOLD, b.data.fold ? .6 : .3); if (b.data.armour) { ctx.globalAlpha = .5; ctx.fillStyle = PALE; ctx.fillRect(Math.round(b.x - 30), Math.round(b.y - 40), 60, 1); ctx.fillRect(Math.round(b.x - 30), Math.round(b.y + 4), 60, 1); ctx.globalAlpha = 1; } },
      onDying(b) { b.data.armour = 0; b.noGrav = false; }
    });
    // folded wings: gold armour (hits glance off)
    { const T0 = G.Boss.prototype.takeHit; const def2 = G.Enemies.defs.f_humo; def2._armourCheck = true;
      G.Boss.prototype.takeHit = function (h) { if (this.def && this.def.id === 'f_humo' && this.data && this.data.armour) { try { G.FX.text(this.x, this.top - 10, G.LANG.t(`Gold!|Золото!|Oltin!`), '#ffd04a', { size: 6, life: 20 }); sfx('block', { x: this.x }); } catch (e) { /* ignore */ } return false; } return T0.apply(this, arguments); }; }
    { const op = def.onPhase; def.onPhase = function (b, ph) { op && op.call(this, b, ph); BM.specs.f_humo.onPhase(b, ph); }; }
  } catch (e) { console.error('[f_humo]', e); }
}
