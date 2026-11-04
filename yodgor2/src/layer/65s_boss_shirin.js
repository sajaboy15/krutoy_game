/* 65s_boss_shirin.js — stage 6: the three faction-final bosses share a few helpers here (G.BM6), and SHIRIN, VOICE OF THE WELL
   (GDD ch. 17, §9: "a singer whose voice is the weapon: song-waves, a summoned choir, the Pledge Song — if it lands, the hero
   loses control for 2 s and strikes a companion; phase 3: she sings until the floor becomes water").
   Built on the stage-8a moveset runner (G.BM, 65a): every move telegraphs and registers its threat; after each string she stands
   open (the motes over her head). The figure is the Shirin of the story (G.PEOPLE look 'shirin'), drawn at twice her size.
   Phase 1:  wave (a song-wave rolls along the floor both ways: jump it)
             crescendo (three rings bloom round her, each wider: step out)
             pledge (a slow glyph of the Pledge Song drifts after you: if it touches you, 2 s of someone else's will)
             glide (she fades and reappears across the hall; a short cone of song where she lands)
   Phase 2 (66%): choir (two acolytes of the Well step out of the water), note (a held note: a wall of sound crosses the hall —
             roll through it), wave2 (a wave, a false pause, a second wave)
   Phase 3 (33%): flood (the floor turns to water in bands; stand on the dry ones), lament (notes fall like rain where the marks are)
   Windows: after the pledge glyph 0.9 s; after the flood 1.6 s; after the wall of sound 1.2 s. */
{
  const BM = G.BM, KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs, BK = G.BK;
  const B6 = G.BM6 = {};
  if (BM && KIT && ED && BK) try {
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, k) => a + (b - a) * k;
    const A = () => BM.arena(), sfx = BM.sfx;
    B6.clamp = clamp; B6.lerp = lerp;
    // a person of the story, drawn at k× as a boss (k integer keeps the pixels square)
    B6.figure = (def, look, o) => {
      o = o || {};
      def.drawBoss = function (ctx, b) {
        if (b.alpha <= 0.01) return;
        ctx.save();
        ctx.globalAlpha = (b.alpha == null ? 1 : b.alpha) * (b.data.fade == null ? 1 : b.data.fade);
        ctx.translate(Math.round(b.x), Math.round(b.y));
        const k = o.k || 2; ctx.scale(k, k);
        try { G.PEOPLE.drawPerson(ctx, { look: typeof look === 'function' ? look(b) : look, x: 0, y: 0, t: b.t, face: b.facing, phase: 0, talking: !!b.data.sing, rim: o.rim || '#fff0c8' }); } catch (e) { /* ignore */ }
        ctx.restore();
        if (b.hurtT > 0 && (b.t & 2)) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(b.x - b.w / 2), Math.round(b.y - b.h), b.w, b.h); ctx.globalAlpha = 1; }
        if (o.aura) o.aura(ctx, b);
      };
    };
    // a song-wave along the floor (a Shockwave: jump it)
    B6.wave = (b, x0, dir, delay, o) => {
      o = o || {};
      const spd = o.spd || 3.2, color = o.color || '#bfe8ff';
      b.data.q = b.data.q || [];
      b.data.q.push({ at: BM.now() + delay, fn: () => b.add(new KIT.Shockwave(x0, A().floor, dir, { dmg: (o.k || .55) * b.dmg, spd, life: 300, h: o.h || 16, color, owner: b, pal: G.Art.FLAME_SPIRIT || G.Art.FLAME_ICE })) });
      const pl = b.player; if (!BM.okP(pl)) return;
      const dist = Math.max(0, (pl.x - x0) * dir);   // registered even when the hero is behind it now: he may step into its path
      BM.threat(b, { in: delay + Math.max(0, Math.round((dist - 12) / spd)), dur: Math.ceil(20 / spd) + 2, box: BM.boxAt(pl.x, A().floor - 18, 26, 18), how: 'jump' });
    };
    // run queued spawns (waves etc.) in tick
    B6.runQ = b => { const d = b.data; if (!d.q || !d.q.length) return; const now = BM.now(); for (let i = d.q.length - 1; i >= 0; i--) if (d.q[i].at <= now) { const f = d.q[i].fn; d.q.splice(i, 1); try { f(); } catch (e) { console.error('[bm6] q', e); } } };
    // things falling where marks are
    B6.fall = (b, xs, kind2, step, k) => { const a = A(); xs.forEach((x, i) => { b.add(new KIT.Meteor(x, a.floor, 22 + (step || 12) * i, { kind2: kind2 || 'sun', dmg: (k || .6) * b.dmg, R: 20 })); BM.threat(b, { in: 22 + (step || 12) * i + 24, dur: 8, box: BM.boxAt(x, a.floor - 40, 40, 40), how: 'out' }); }); };
    // a tall wall of sound crossing the hall: too tall to jump, roll through it
    class SoundWall extends KIT.Hazard {
      constructor(x, y, dir, o) { super(x, y, 10, 70, Object.assign({ dir, spd: 3.2, life: 260, rehit: 0 }, o)); this.col = (o && o.color) || '#e8f0ff'; }
      update() {
        super.update();
        this.x += this.dir * this.spd;
        const a = A();
        if (this.t > this.life || this.x < a.x0 - 6 || this.x > a.x1 + 6) { this.dead = true; return; }
        this.hitBox({ x: this.x - 5, y: this.y - 70, w: 10, h: 70 }, { kbx: 3 * this.dir, kby: -2, dir: this.dir, type: 'magic', dmgColor: this.col });
        G.Light && G.Light.add(this.x, this.y - 35, 56, this.col, .45);
      }
      drawFx(ctx) {
        const x = Math.round(this.x), y = Math.round(this.y);
        for (let k = 0; k < 70; k += 2) { const w = 3 + Math.round(2 * Math.sin(this.t * .4 + k * .3)); ctx.globalAlpha = .25 + .35 * Math.abs(Math.sin(k * .2 + this.t * .2)); ctx.fillStyle = k % 6 ? this.col : '#ffffff'; ctx.fillRect(x - w, y - k - 2, 2 * w, 2); }
        ctx.globalAlpha = 1; G.Glow.add(x, y - 35, 38, this.col, .45);
      }
    }
    B6.SoundWall = SoundWall;
    // the Pledge Song / a burned memory: someone else's will for a moment — the hero walks to the nearest companion and strikes
    // (with no companion, he stands dazed). Inputs are put back afterwards.
    B6.charm = (frames, who) => {
      const p = G.world && G.world.player; if (!p || p.dead) return;
      p._b6charm = frames; p._b6who = who || null;
      try { G.FX.text(p.x, p.top - 16, G.LANG.t(`The Pledge Song!|Песнь Залога!|Garov qo'shig'i!`), '#c9b4ff', { size: 8, life: 60 }); } catch (e) { /* ignore */ }
      BM.ev({ def: { id: 'hero' }, phase: 0, hp: 1, maxHp: 1 }, 'charm', 'start');
    };
    {
      const PP = G.Player.prototype, up0 = PP.update;
      PP.update = function () {
        if (this._b6charm > 0 && G.world && this === G.world.player) {
          this._b6charm--;
          const K = G.input.keys; K.delete('KeyA'); K.delete('KeyD'); K.delete('ArrowLeft'); K.delete('ArrowRight'); K.delete('KeyJ'); K.delete('KeyK'); K.delete('Space');
          const ally = (G.world.ents || []).filter(e => e && e.faction === 'ally' && !e.dead && e.isActor).sort((a, c) => Math.abs(a.x - this.x) - Math.abs(c.x - this.x))[0];
          if (ally) {
            const dx = ally.x - this.x;
            if (Math.abs(dx) > 22) K.add(dx > 0 ? 'KeyD' : 'KeyA');
            else if (this._b6charm % 30 === 0) { K.add('KeyJ'); try { ally.hp = Math.max(1, ally.hp - Math.round(ally.maxHp * 0.12)); G.FX.text(ally.x, ally.top - 10, '!', '#ff8a7a', { size: 8, life: 30 }); } catch (e) { /* ignore */ } }
          } else { this.vx *= 0.5; if (this._b6charm % 20 === 0) try { G.FX.spawn({ x: this.x, y: this.top - 4, vy: -.5, life: 18, size: 1, color: '#c9b4ff', glow: true }); } catch (e) { /* ignore */ } }
          if (this._b6charm === 0) { K.delete('KeyA'); K.delete('KeyD'); K.delete('KeyJ'); }
        }
        return up0.apply(this, arguments);
      };
    }
    B6.sub = (text, who) => { try { G.SADO.subtitle(G.LANG.t(text), { who: who || 'boss', now: true, pri: 2 }); } catch (e) { /* ignore */ } };

    /* ================================================================ SHIRIN */
    const VOICE = '#dfe8ff', BLUE = '#6a9ae8', WATER = '#4ab0d8';
    const def = BK.champion('assassin', 'f_shirin', {
      name: N(`Shirin, Voice of the Well|Ширин, Голос Колодца|Shirin, Quduq ovozi`), title: N(`The song that holds the city|Песня, что держит город|Shaharni ushlab turgan qo'shiq`),
      hp: 1050, dmg: 20, scale: 2.4, phaseAt: [.66, .33],
      phaseNames: [null, N(`The choir answers|Хор отвечает|Xor javob beradi`), N(`The floor becomes water|Пол становится водой|Pol suvga aylanadi`)],
      roarColor: VOICE, fxPal: 'ice', music: 'yd_boss_choir', arena: { w: 52, h: 22 }, contact: 0
    });
    B6.figure(def, 'shirin', { k: 2, rim: '#e8f0ff', aura: (ctx, b) => { if (b.data.sing) { G.Glow.add(b.x, b.y - 50, 26, VOICE, .45); for (let i = 0; i < 3; i++) { const a = b.t * .12 + i * 2.1; ctx.fillStyle = VOICE; ctx.fillRect(Math.round(b.x + Math.cos(a) * 16), Math.round(b.y - 56 + Math.sin(a) * 6), 2, 2); } } } });
    // Pledge glyph: a slow homing sigil; touching it = the charm
    class Glyph extends G.Entity {
      constructor(x, y, b) { super(x, y); this.b = b; this.t = 0; this.life = 300; this.layer = 4; this.vx = 0; this.vy = 0; }
      update() {
        this.t++;
        const p = G.world.player;
        if (!p || p.dead || this.t > this.life || this.b.dead) { this.dead = true; return; }
        const dx = p.x - this.x, dy = (p.cy || p.y - 14) - this.y, d = Math.hypot(dx, dy) || 1;
        const sp = this.t < 30 ? .4 : 1.15;
        this.vx = lerp(this.vx, dx / d * sp, .06); this.vy = lerp(this.vy, dy / d * sp, .06);
        this.x += this.vx; this.y += this.vy;
        if (d < 12 && !(p.invulnT > 0) && p.state !== 'roll') { this.dead = true; B6.charm(120); sfx('magic', { x: this.x }); BM.hits.push({ t: BM.now(), id: 'f_shirin', mv: 'pledge', dmg: 0 }); }
      }
      draw(ctx) {
        const x = Math.round(this.x), y = Math.round(this.y), k = (this.t % 20) < 10;
        ctx.fillStyle = k ? '#c9b4ff' : '#ffffff'; ctx.fillRect(x - 3, y, 7, 1); ctx.fillRect(x, y - 3, 1, 7);
        ctx.fillStyle = '#c9b4ff'; ctx.fillRect(x - 2, y - 2, 1, 1); ctx.fillRect(x + 2, y + 2, 1, 1); ctx.fillRect(x - 2, y + 2, 1, 1); ctx.fillRect(x + 2, y - 2, 1, 1);
        G.Glow.add(x, y, 16, '#c9b4ff', .6);
      }
    }
    // flooded bands: the floor in alternating strips turns to water, then the water strikes
    class Flood extends KIT.Hazard {
      constructor(x, y, w, fuse, o) { super(x, y, w, 10, Object.assign({ fuse, rehit: 30 }, o)); this.bw = w; }
      update() {
        super.update();
        if (this.t >= this.fuse && this.t <= this.fuse + 40) this.hitBox({ x: this.x - this.bw / 2, y: this.y - 16, w: this.bw, h: 16 }, { kbx: 0, kby: -4, dir: 1, type: 'magic', dmgColor: WATER });
        if (this.t > this.fuse + 44) this.dead = true;
      }
      drawFx(ctx) {
        const x0 = Math.round(this.x - this.bw / 2), y = Math.round(this.y), on = this.t >= this.fuse;
        const a = on ? 1 - Math.max(0, this.t - this.fuse - 30) / 14 : Math.min(1, this.t / 10) * (this.t % 10 < 5 ? .55 : .35);
        ctx.globalAlpha = a; ctx.fillStyle = on ? WATER : '#9fd8ff';
        for (let i = 0; i < this.bw; i += 3) { const h = on ? 3 + Math.round(3 * Math.abs(Math.sin(this.t * .3 + i * .4))) : 1; ctx.fillRect(x0 + i, y - h, 3, h); }
        ctx.globalAlpha = 1;
        if (on) G.Glow.add(this.x, y - 4, this.bw * .5, WATER, .35);
      }
    }
    const moves = {
      wave: { w: [4, 3, 3], range: [40, 999], open: [40, 34, 30],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(26); b.data.sing = 1; sfx('magic', { x: b.x, pitch: 1.3 }); B6.wave(b, b.x - 12, -1, m.W); B6.wave(b, b.x + 12, 1, m.W); }
          if (t === m.W) b.data.sing = 0;
          return t >= m.W + 16;
        } },
      crescendo: { w: [3, 2, 2], range: [0, 120], open: [46, 40, 36],
        run(b, t, m) {
          if (t === 1) { b.vx = 0; m.W = b.tele(22); b.data.sing = 1; m.hit = new Set(); for (let i = 0; i < 3; i++) { BM.ring(b, b.x, 50 + i * 36, m.W + i * 14 + 4, VOICE); BM.threat(b, { in: m.W + i * 14, dur: 5, box: BM.boxAt(b.x, A().floor - 40, 50 + i * 36, 40), how: 'out' }); } }
          for (let i = 0; i < 3; i++) if (t >= m.W + i * 14 && t <= m.W + i * 14 + 4) { if (t === m.W + i * 14) { sfx('magic', { x: b.x, pitch: 1 + i * .2 }); G.shake(.15); } BM.strike(b, BM.boxAt(b.x, A().floor - 40, 50 + i * 36, 40), { k: .55, kbx: 3.5, kby: -3, type: 'magic' }, m.hit); }
          if (t === m.W + 32) b.data.sing = 0;
          return t >= m.W + 36;
        } },
      pledge: { w: [2.5, 2, 2], range: [60, 999], cd: [360, 300, 260], open: [54, 48, 44],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(34); b.data.sing = 1; if (!b.data.saidPledge) { b.data.saidPledge = 1; B6.sub(`"I bound you once. Hush now."|«Я тебя уже связывала. Тише».|«Seni bir marta bog'laganman. Jim».`, 'boss'); } }
          if (t === m.W) { b.add(new Glyph(b.x + b.facing * 14, b.y - 50, b)); sfx('magic', { x: b.x, pitch: .7 }); BM.threat(b, { in: 40, dur: 200, box: () => { const g = (G.world.ents || []).find(e => e instanceof Glyph); return g ? { x: g.x - 8, y: g.y - 8, w: 16, h: 16 } : { x: -9e4, y: -9e4, w: 1, h: 1 }; }, how: 'roll' }); }
          if (t === m.W + 10) b.data.sing = 0;
          return t >= m.W + 12;
        } },
      glide: { w: [2, 2, 2], range: [0, 999], cd: [200, 160, 140], open: [38, 34, 30],
        run(b, t, m) {
          const a = A(), pl = b.player;
          if (t === 1) { m.W = b.tele(16); b.vx = 0; m.tx = clamp(BM.okP(pl) ? pl.x + (pl.x > (a.x0 + a.x1) / 2 ? -110 : 110) : b.x, a.x0 + 40, a.x1 - 40); m.hit = new Set(); b.untargetable = false; }
          if (t > m.W && t <= m.W + 14) { b.data.fade = 1 - (t - m.W) / 14; if (t === m.W + 14) { b.x = m.tx; b.facePlayer(); b.untargetable = true; } }
          if (t > m.W + 14 && t <= m.W + 28) { b.data.fade = (t - m.W - 14) / 14; if (t === m.W + 28) { b.untargetable = false; b.data.fade = 1; b.data.sing = 1; BM.hint(b, b.x + b.facing * 40, 80, 14, VOICE, b.facing); BM.threat(b, { in: 14, dur: 6, box: BM.box(b, 0, -40, 80, 40), how: 'roll' }); } }
          if (t >= m.W + 42 && t <= m.W + 46) BM.strike(b, BM.box(b, 0, -40, 80, 40), { k: .7, kbx: 4, kby: -3, type: 'magic' }, m.hit);
          if (t === m.W + 46) b.data.sing = 0;
          return t >= m.W + 50;
        },
        cancel(b) { b.data.fade = 1; b.untargetable = false; } },
      choir: { ph: 2, w: [0, 2, 1.5], cd: [0, 600, 520], open: [0, 30, 26], ok: b => b.minionsAlive('yd_acolyte') < 2,
        run(b, t, m) {
          if (t === 1) { m.W = b.tele(24); b.data.sing = 1; if (!b.data.saidChoir) { b.data.saidChoir = 1; B6.sub(`"Sing with me, children."|«Пойте со мной, дети».|«Men bilan kuylanglar, bolalar».`, 'boss'); } }
          if (t === m.W) { const a = A(); sfx('summon', { x: b.x }); for (const dir of [-1, 1]) { const x = clamp(b.x + dir * 80, a.x0 + 30, a.x1 - 30); const mn = b.minion('yd_acolyte', x, a.floor); if (mn) G.FX.poof(x, a.floor - 14, { pal: 'ice', r: 12 }); } b.data.sing = 0; }
          return t >= m.W + 10;
        } },
      note: { ph: 2, w: [0, 2.5, 2.5], range: [50, 999], cd: [0, 300, 260], open: [0, 72, 66],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(30); b.data.sing = 1; BM.hint(b, b.x + b.facing * 120, 220, m.W + 4, VOICE, b.facing); const pl = b.player; if (BM.okP(pl)) BM.threat(b, { in: m.W + Math.max(0, Math.round((Math.abs(pl.x - b.x) - 20) / 3.2)), dur: 6, box: BM.boxAt(pl.x, A().floor - 70, 20, 70), how: 'roll' }); }
          if (t === m.W) { b.add(new SoundWall(b.x + 14 * b.facing, A().floor, b.facing, { dmg: .8 * b.dmg, color: VOICE })); sfx('boss_roar', { x: b.x, pitch: 1.6, vol: .4 }); }
          if (t === m.W + 30) b.data.sing = 0;
          return t >= m.W + 30;
        } },
      wave2: { ph: 2, w: [0, 2.5, 2], range: [40, 999], open: [0, 40, 36],
        run(b, t, m) {
          if (t === 1) { b.facePlayer(); b.vx = 0; m.W = b.tele(24); b.data.sing = 1; B6.wave(b, b.x + 12 * b.facing, b.facing, m.W); B6.wave(b, b.x + 12 * b.facing, b.facing, m.W + 26, { spd: 3.8 }); }
          if (t === m.W + 26) b.data.sing = 0;
          return t >= m.W + 34;
        } },
      flood: { ph: 3, w: [0, 0, 3], cd: [0, 0, 360], open: [0, 0, 96],
        run(b, t, m) {
          if (t === 1) {
            b.vx = 0; m.W = b.tele(30); b.data.sing = 1;
            if (!b.data.saidFlood) { b.data.saidFlood = 1; B6.sub(`"Listen. Under the stone, it's all water."|«Слушай. Под камнем — одна вода».|«Tingla. Tosh ostida — faqat suv».`, 'boss'); }
            const a = A(), W = 60, n = Math.floor((a.x1 - a.x0) / W), off = Math.random() < .5 ? 0 : 1;
            for (let i = 0; i < n; i++) if ((i + off) % 2 === 0) { const x = a.x0 + W * (i + .5); b.add(new Flood(x, a.floor, W, m.W + 50, { dmg: .7 * b.dmg })); BM.threat(b, { in: m.W + 50, dur: 40, box: BM.boxAt(x, a.floor - 16, W, 16), how: 'out' }); }
          }
          if (t === m.W + 50) { sfx('splash', { x: b.x }); G.shake(.3); }
          if (t === m.W + 90) b.data.sing = 0;
          return t >= m.W + 92;
        } },
      lament: { ph: 3, w: [0, 0, 2.5], range: [0, 999], open: [0, 0, 44],
        run(b, t, m) {
          if (t === 1) { b.vx = 0; m.W = b.tele(22); b.data.sing = 1; const a = A(), pl = b.player, px = BM.okP(pl) ? pl.x : b.x; const xs = [px, px - 70, px + 70, px - 140, px + 140].map(x => clamp(x, a.x0 + 24, a.x1 - 24)); B6.fall(b, xs, 'ice', 10, .6); }
          if (t === m.W + 60) b.data.sing = 0;
          return t >= m.W + 64;
        } }
    };
    BM.install('f_shirin', {
      moves, rest: [44, 34, 28], moteColor: '#e8f0ff',
      def0: { hp: 1050, dmg: 20, phaseAt: [.66, .33] },
      setup(b) { b.contact = 0; b.data.fade = 1; },
      tick(b) { B6.runQ(b); },
      idle(b) {
        const pl = b.player; if (!BM.okP(pl)) { b.vx *= .8; return; }
        b.facePlayer();
        const dx = Math.abs(pl.x - b.x), want = 120;
        const dir = dx < want - 30 ? -Math.sign(pl.x - b.x) : dx > want + 60 ? Math.sign(pl.x - b.x) * .6 : 0;
        b.vx = U.approach(b.vx, dir * .9 * b.spdK(), .08);
      },
      onPhaseInterrupt(b) { b.data.fade = 1; b.untargetable = false; b.data.sing = 0; },
      onPhase(b, ph) { if (ph === 2) B6.sub(`The water under the Well starts to hum.|Вода под Колодцем начинает гудеть.|Quduq ostidagi suv g'uvillay boshlaydi.`, ''); },
      onDying(b) { b.data.fade = 1; b.untargetable = false; b.data.sing = 0; const p = G.world && G.world.player; if (p) p._b6charm = 0; }
    });
    { const op = def.onPhase; def.onPhase = function (b, ph) { op && op.call(this, b, ph); BM.specs.f_shirin.onPhase(b, ph); }; }
  } catch (e) { console.error('[f_shirin]', e); }
}
