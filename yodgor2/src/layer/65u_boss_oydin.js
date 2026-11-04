/* 65u_boss_oydin.js — stage 6: OYDIN, SHE WHO REMEMBERS (GDD ch. 17, §11: "fast, daggers, Burn. Each of her attacks is a memory
   she burns. If Sado's trust is high, Sado steps into the fight. The fight can be ended with words in phase 3 (a check)").
   The figure is the Oydin of the story (G.PEOPLE look 'oydin') at twice her size. Every move burns one of her memories: its name
   flares over her head as she strikes.
   Phase 1:  slash (a dash and two cuts: roll through), flurry (three cuts, the third held back — the feint),
             burn (a memory flares round her: step out of the ring), knives (two thrown knives, one high, one low)
   Phase 2 (62%): blink (she is gone, then behind you, holding the blade up for a beat), pyre (three memories burn in a row
             where the marks are)
             — if Sado trusts him (trust ≥ 3), once: Sado flares her light at Oydin and calls her by name; Oydin reels 1.5 s.
   Phase 3 (30%): frenzy (five cuts, the last a burning wave along the floor)
             — once, when she first stands open in this phase, he may speak instead of strike: [Memory 7] (easier when Sado
               trusts him). The right words end the fight.
   Windows: after slash 0.8 s; after the frenzy 1.4 s; after blink 1 s. */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, BK = G.BK, B6 = G.BM6;
  if (BM && KIT && BK && B6 && B6.figure) try {
    const clamp = B6.clamp, lerp = B6.lerp, A = () => BM.arena(), sfx = BM.sfx;
    const FIRE = '#ff8a3a', EMBER = '#ffd08a', BLADE = '#e8e8f0';
    const def = BK.champion('assassin', 'f_oydin', {
      name: N(`Oydin, She Who Remembers|Ойдин, Та, что помнит|Oydin, Eslaydigan`), title: N(`Every blow a memory she burns|Каждый удар — сожжённое воспоминание|Har bir zarba — yondirilgan xotira`),
      hp: 950, dmg: 20, scale: 2.4, phaseAt: [.62, .3], speedMul: 1.3,
      phaseNames: [null, N(`She burns faster|Она жжёт быстрее|U tezroq yondiradi`), N(`The last memories|Последние воспоминания|So'nggi xotiralar`)],
      roarColor: FIRE, fxPal: 'fire', music: 'yd_boss_kempir', arena: { w: 50, h: 22 }, contact: 0
    });
    B6.figure(def, 'oydin', { k: 2, rim: '#ffd8b0', aura: (ctx, b) => { const d = b.data; if (d.blade) { const x = Math.round(b.x + b.facing * 18), y = Math.round(b.y - 34); ctx.fillStyle = BLADE; ctx.fillRect(x, y, b.facing * 10, 1); ctx.fillRect(x, y + 3, b.facing * 8, 1); G.Glow.add(x, y, 12, EMBER, .4); } if (d.memT > 0) { d.memT--; } } });
    // the memories she burns: a word over her head as she strikes (all of them already revealed by Act III)
    const MEM = [
      `Mother's bread|Мамин хлеб|Onamning noni`, `The cellar|Погреб|Yerto'la`, `Alla|Алла|Alla`, `The loose board|Шаткая доска|Qimirlaydigan taxta`,
      `Apricot stones|Абрикосовые косточки|O'rik danaklari`, `Your hand|Твоя рука|Sening qo'ling`, `The Night of Payment|Ночь Уплаты|To'lov kechasi`, `First snow|Первый снег|Birinchi qor`
    ];
    const burnMem = b => {
      const d = b.data; d.mi = ((d.mi || 0) + 1) % MEM.length;
      try { G.FX.text(b.x, b.top - 20, G.LANG.t(MEM[d.mi]), EMBER, { size: 6.5, life: 46 }); } catch (e) { /* ignore */ }
      G.Light && G.Light.add(b.x, b.y - 40, 70, FIRE, .5);
    };
    class Pillar extends KIT.Hazard {
      constructor(x, y, fuse, o) { super(x, y, 30, 70, Object.assign({ fuse, rehit: 0 }, o)); }
      update() { super.update(); if (this.t >= this.fuse && this.t <= this.fuse + 10) this.hitBox({ x: this.x - 15, y: this.y - 70, w: 30, h: 70 }, { kbx: 2, kby: -4, dir: 1, type: 'magic', dmgColor: FIRE }); if (this.t === this.fuse) { sfx('fire', { x: this.x }); G.FX.flashLight(this.x, this.y - 30, 90, 10, FIRE); } if (this.t > this.fuse + 26) this.dead = true; }
      drawFx(ctx) {
        if (this.t < this.fuse) return;
        const k = 1 - (this.t - this.fuse) / 26, x = Math.round(this.x), y = Math.round(this.y);
        for (let i = 0; i < 70; i += 3) { const w = Math.round((6 + 4 * Math.sin(i * .3 + this.t)) * k); ctx.globalAlpha = .4 + .5 * k; ctx.fillStyle = i < 20 ? '#fff0c0' : i < 45 ? EMBER : FIRE; ctx.fillRect(x - w, y - i - 3, 2 * w, 3); }
        ctx.globalAlpha = 1; G.Glow.add(x, y - 30, 40, FIRE, .6 * k);
      }
    }
    const cut = (b, m, at, reach, k) => { if (m.t === at) { sfx('swing', { x: b.x }); burnMem(b); } if (m.t >= at && m.t <= at + 3) BM.strike(b, BM.box(b, 0, -40, reach || 54, 40), { k: k || .65, kbx: 3.5, kby: -2.5 }, m.hit); };
    const moves = {
      slash: { w: [4, 3, 2.5], range: [0, 220], open: [48, 42, 38],
        run(b, t, m) {
          m.t = t;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(16); m.hit = new Set(); b.data.blade = 1; BM.hint(b, b.x + b.facing * 70, 140, m.W + 10, FIRE, b.facing); BM.threat(b, { in: m.W + 4, dur: 14, box: BM.box(b, 0, -40, 140, 40), how: 'roll' }); }
          if (t >= m.W && t < m.W + 10) b.vx = 6.5 * b.facing; else b.vx *= .7;
          if (t === m.W + 4) m.hit = new Set();
          cut(b, m, m.W + 4, 54, .6); if (t === m.W + 12) m.hit = new Set(); cut(b, m, m.W + 12, 54, .6);
          if (t === m.W + 20) b.data.blade = 0;
          return t >= m.W + 22;
        } },
      flurry: { w: [3, 3, 2.5], range: [0, 120], open: [44, 40, 36],
        run(b, t, m) {
          m.t = t;
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(14); b.data.blade = 1; m.hold = Math.random() < .6 ? 18 : 0; BM.threat(b, { in: m.W + 22 + m.hold, dur: 5, box: BM.box(b, 0, -40, 62, 40), how: 'roll', feint: !!m.hold }); }
          for (const [i, at] of [[0, m.W], [1, m.W + 10], [2, m.W + 22 + m.hold]]) { if (t === at) { m.hit = new Set(); b.vx = 3 * b.facing; } void i; cut(b, m, at, 62, .55); }
          if (t > m.W && t % 4 === 0) b.vx *= .6;
          if (t === m.W + 30 + m.hold) b.data.blade = 0;
          return t >= m.W + 30 + m.hold;
        } },
      burn: { w: [2.5, 2.5, 2], range: [0, 140], cd: [180, 150, 120], open: [40, 36, 32],
        run(b, t, m) {
          if (t === 1) { b.vx = 0; m.W = b.tele(20); m.hit = new Set(); BM.ring(b, b.x, 120, m.W + 4, FIRE); BM.threat(b, { in: m.W, dur: 8, box: BM.boxAt(b.x, A().floor - 50, 120, 50), how: 'out' }); }
          if (t === m.W) { burnMem(b); sfx('explosion', { x: b.x, vol: .5 }); G.FX.explosion(b.x, b.y - 20, { size: 'm', pal: 'fire', shake: .25 }); addVoidSafe(); }
          if (t >= m.W && t <= m.W + 6) BM.strike(b, BM.boxAt(b.x, A().floor - 50, 120, 50), { k: .8, kbx: 4, kby: -4, type: 'magic' }, m.hit);
          return t >= m.W + 10;
        } },
      knives: { w: [2.5, 2, 2], range: [70, 999], open: [36, 32, 30],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(18); BM.threat(b, { in: m.W + 10, dur: 20, box: () => { const p = b.player; return p ? { x: p.x - 10, y: p.y - 30, w: 20, h: 30 } : { x: -9e4, y: -9e4, w: 1, h: 1 }; }, how: 'roll' }); }
          for (const [at, dy] of [[m.W, -38], [m.W + 12, -8]]) if (t === at) { sfx('throw', { x: b.x }); b.add(new G.Projectile({ x: b.x + b.facing * 10, y: b.y + dy, vx: 6 * b.facing, vy: 0, r: 2, grav: 0, life: 120, dmg: .5 * b.dmg, faction: 'enemy', owner: b, color: BLADE, kbx: 2, kby: -1.5, trail: { color: EMBER, life: 8, size: 1, every: 2 } })); }
          return t >= m.W + 20;
        } },
      blink: { ph: 2, w: [0, 3, 2.5], range: [0, 999], cd: [0, 220, 180], open: [0, 60, 54],
        run(b, t, m) {
          const pl = b.player, a = A();
          m.t = t;
          if (t === 1) { m.W = b.tele(12); m.hit = new Set(); }
          if (t > m.W && t <= m.W + 10) { b.data.fade = 1 - (t - m.W) / 10; if (t === m.W + 10) { b.untargetable = true; m.tx = clamp(BM.okP(pl) ? pl.x - (pl.facing || 1) * 36 : b.x, a.x0 + 20, a.x1 - 20); } }
          if (t === m.W + 22) { b.x = m.tx; b.facePlayer(); b.untargetable = false; b.data.fade = 1; b.data.blade = 1; BM.threat(b, { in: 14, dur: 5, box: BM.box(b, 0, -40, 50, 40), how: 'roll' }); }
          cut(b, m, m.W + 36, 50, .8);
          if (t === m.W + 42) b.data.blade = 0;
          return t >= m.W + 42;
        },
        cancel(b) { b.data.fade = 1; b.untargetable = false; } },
      pyre: { ph: 2, w: [0, 2.5, 2.5], range: [0, 999], open: [0, 40, 36],
        run(b, t, m) {
          if (t === 1) { b.vx = 0; m.W = b.tele(18); const pl = b.player, a = A(), px = BM.okP(pl) ? pl.x : b.x; m.xs = [px, px + 48 * b.facing, px + 96 * b.facing].map(x => clamp(x, a.x0 + 20, a.x1 - 20)); m.xs.forEach((x, i) => { const at = m.W + 18 + i * 16; BM.mark(b, x, 30, at, FIRE, { hgt: 30 }); b.add(new Pillar(x, a.floor, at, { dmg: .65 * b.dmg })); BM.threat(b, { in: at, dur: 10, box: BM.boxAt(x, a.floor - 70, 30, 70), how: 'out' }); }); }
          if (t === m.W) burnMem(b);
          return t >= m.W + 60;
        } },
      frenzy: { ph: 3, w: [0, 0, 3], range: [0, 200], open: [0, 0, 84],
        run(b, t, m) {
          m.t = t;
          if (t === 1) { b.facePlayer(); m.W = b.tele(18); b.data.blade = 1; }
          for (let i = 0; i < 4; i++) { const at = m.W + i * 11; if (t === at) { m.hit = new Set(); b.facePlayer(); b.vx = 3.4 * b.facing; } cut(b, m, at, 56, .5); }
          if (t === m.W + 50) { burnMem(b); B6.wave(b, b.x + b.facing * 12, b.facing, 0, { color: FIRE, k: .6, spd: 3.6 }); sfx('fire', { x: b.x }); }
          if (t > m.W) b.vx *= .8;
          if (t === m.W + 56) b.data.blade = 0;
          return t >= m.W + 58;
        } }
    };
    function addVoidSafe() { /* her Burn costs her, not him: nothing to add to his Hollowness */ }
    // Sado steps in (trust ≥ 3, once, phase 2)
    function sadoSteps(b) {
      const d = b.data;
      if (d.sado || b.phase < 2 || !(R().trust >= 3) || !F().sado) return;
      d.sado = 1;
      B6.sub(`"Oydin! Oydin, look at me. It's me. It's us."|«Ойдин! Ойдин, посмотри на меня. Это я. Это мы».|«Oydin! Oydin, menga qara. Bu men. Bu biz».`, 'sado');
      G.FX.flashLight(b.x, b.y - 30, 160, 20, '#9ff3e6');
      d.hold = bb => { bb.vx *= .8; if (++bb.data.holdT > 90) { bb.data.hold = null; bb.data.holdT = 0; BM.end(bb, 20); } };
      d.holdT = 0; BM.ev(b, 'sado', 'start');
    }
    // the words in phase 3 (once): a check of Memory; Sado's trust makes it easier
    function words(b) {
      const d = b.data;
      if (d.wordsAsked || b.phase < 3 || b.dead) return;
      d.wordsAsked = 1;
      const bonus = (R().trust >= 4 && F().sado) ? 2 : 0;
      const c = FAC.check('mem', 7 - bonus);
      const lab = FAC.cat3('[', `Memory|Память|Xotira`, ' ' + (7 - bonus) + '] ', `"Under the table. I came back for you. I was twelve, and I came back."|«Под столом. Я вернулся за тобой. Мне было двенадцать — и я вернулся».|«Stol tagida. Men sen uchun qaytib keldim. O'n ikki yoshda edim — va qaytib keldim».`);
      ask(`She stands with the knives lowered for one breath, waiting to see what you'll do.|Она стоит, опустив ножи, на один вдох — ждёт, что ты сделаешь.|U bir nafas pichoqlarini tushirib turibdi — nima qilishingni kutyapti.`, [
        { id: 'fight', label: `Raise your weapon.|Поднять оружие.|Qurolni ko'tarish.` },
        { id: 'words', label: lab }
      ], o => {
        if (o.id !== 'words') return;
        if (c.ok) {
          FAC.flag('oydinWords', 1);
          const p = G.world.player;
          try { b.hp = 1; G.Combat.hit(p, b, { dmg: 99999, type: 'magic', kbx: 0, kby: 0, words: true }); } catch (e) { b.hp = 0; }
        } else {
          B6.sub(`"Twelve. And then you sold it. Don't you dare."|«Двенадцать. А потом ты это продал. Не смей».|«O'n ikki. Keyin esa sotding. Jur'at etma».`, 'boss');
        }
      });
    }
    BM.install('f_oydin', {
      moves, rest: [30, 24, 20], moteColor: EMBER,
      def0: { hp: 950, dmg: 20, phaseAt: [.62, .3] },
      setup(b) { b.contact = 0; b.data.fade = 1; },
      tick(b) {
        B6.runQ(b);
        const d = b.data;
        if (b.mode === 'fight' && b.phase >= 2 && !d.sado && d.rec > 10) sadoSteps(b);
        if (b.mode === 'fight' && b.phase >= 3 && !d.wordsAsked && d.rec > 20 && !d.mv) setTimeout(() => words(b), 0);
      },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer();
        const dx = Math.abs(pl.x - b.x), want = 70;
        const dir = dx > want + 20 ? Math.sign(pl.x - b.x) : dx < 36 ? -Math.sign(pl.x - b.x) : 0;
        b.vx = U.approach(b.vx, dir * 1.6 * b.spdK(), .14);
      },
      onPhaseInterrupt(b) { b.data.fade = 1; b.untargetable = false; b.data.blade = 0; },
      onPhase(b, ph) { B6.sub(ph === 2 ? `"Do you remember this one, Toychoq? No? Then it won't hurt to lose it."|«А это помнишь, Тойчок? Нет? Тогда и терять не больно».|«Buni eslaysanmi, Toychoq? Yo'qmi? Unda yo'qotish ham og'rimaydi».` : `"I've only a few left. Let's see who runs out first."|«У меня их осталось немного. Посмотрим, у кого кончатся первыми».|«Menda ozgina qoldi. Kimniki birinchi tugashini ko'ramiz».`, 'boss'); },
      onDying(b) { b.data.fade = 1; b.untargetable = false; b.data.blade = 0; }
    });
    { const op = def.onPhase; def.onPhase = function (b, ph) { op && op.call(this, b, ph); BM.specs.f_oydin.onPhase(b, ph); }; }
  } catch (e) { console.error('[f_oydin]', e); }
}
