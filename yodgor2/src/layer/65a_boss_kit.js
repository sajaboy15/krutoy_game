/* 65a_boss_kit.js — stage 8a: the moveset runner shared by the redesigned bosses (65b–65h).
   A boss is a set of moves. A move is a small script run(b, t, m) -> true when its string is over (t = frames since the
   move began, m = the move's own scratch). After every string the boss stands open for move.open[phase] frames (the punish
   window: no attack can start), then rests (b.rest) and picks again. Phases add moves (move.ph), they do not just speed up.
   Every attack that can hurt registers a threat (when it lands, how long, where, how to avoid it: roll / jump / out) at the
   moment its telegraph begins — the test bots read them (test/s8_*.js) and so can anything else that wants to react.
   Floor dangers are KIT.Marker subclasses so the companions (87_party_ai.js) step out of them.
   G.BM.log keeps start / end / ready / phase / hit events for the tests. */
{
  const KIT = G.BossKit, U = G.U, ED = G.Enemies && G.Enemies.defs;
  if (KIT && ED && G.Boss) try {
    const BM = G.BM = { log: [], threats: [], hits: [], specs: {}, noHeal: [] };
    const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
    const now = BM.now = () => (G.world && G.world.t) || 0;
    const arena = BM.arena = () => KIT.arena();
    const sfx = BM.sfx = (n, o) => { try { G.Audio && G.Audio.sfx(n, o || {}); } catch (e) { /* ignore */ } };
    const okP = BM.okP = p => !!p && !p.dead && p.hp > 0;
    BM.pl = () => G.world && G.world.player;
    const ph3 = (v, b) => Array.isArray(v) ? v[Math.min(v.length, b.phase) - 1] : v;
    BM.ph3 = ph3;

    /* ------------------------------------------------------------ events and threats */
    BM.ev = (b, mv, ev, x) => {
      const r = Object.assign({ t: now(), id: b.def.id, mv, ev, ph: b.phase, hp: +(b.hp / b.maxHp).toFixed(3) }, x || {});
      BM.log.push(r);
      if (BM.log.length > 8000) BM.log.splice(0, 3000);
      return r;
    };
    // o: { in: frames until the first active frame, dur: active frames, box: {x,y,w,h} | fn() -> box, how: 'roll'|'jump'|'out'|'any', feint }
    BM.threat = (b, o) => {
      const th = Object.assign({ id: b.def.id, mv: b.data.mv, dur: 6, how: 'roll' }, o);
      th.seen = now(); th.at = th.seen + (o.in || 0); th.end = th.at + th.dur;
      BM.threats.push(th);
      if (BM.threats.length > 64) { const t0 = now(); BM.threats = BM.threats.filter(q => q.end >= t0 - 2); }
      return th;
    };
    BM.live = () => { const t0 = now(); return BM.threats.filter(q => q.end >= t0); };

    /* ------------------------------------------------------------ geometry and strikes */
    // a box in world px, x measured forward from the boss along its facing
    BM.box = (b, x, y, w, h) => ({ x: b.facing > 0 ? b.x + x : b.x - x - w, y: b.y + y, w, h });
    BM.boxAt = (cx, y, w, h) => ({ x: cx - w / 2, y, w, h });
    // hits the hero and the companions (Combat.area is wrapped by 86_party.js); set = one hit per target per swing
    BM.strike = (b, box, o, set) => {
      o = o || {};
      const opts = Object.assign({ kbx: 3.5, kby: -3, dir: b.facing, type: 'melee' }, o, { dmg: b.dmg * (o.k || 1) });
      delete opts.k;
      return G.Combat.area(b, box, opts, set);
    };
    // floor danger (red glow, columns of motes): the stock marker
    BM.mark = (b, x, w, life, color, o) => b.add(new KIT.Marker(Object.assign({ x, y: arena().floor, w, life, color: color || '#ff3a2a', hgt: 26 }, o || {})));
    // a quiet hint for melee reach: a thin pulsing line on the floor (still a Marker: companions step out of it)
    class Hint extends KIT.Marker {
      drawFx(ctx) {
        const k = this.t / this.life, a = Math.min(1, this.t / 5) * (k > .85 ? (1 - k) / .15 : 1) * (this.t % 8 < 4 ? .9 : .6);
        const x0 = Math.round(this.x - this.w / 2), w = Math.round(this.w), y = Math.round(this.y);
        ctx.globalAlpha = .55 * a; ctx.fillStyle = this.color; ctx.fillRect(x0, y - 1, w, 1);
        ctx.globalAlpha = .9 * a; ctx.fillRect(x0, y - 3, 1, 3); ctx.fillRect(x0 + w - 1, y - 3, 1, 3);
        const f = Math.round(k * (w - 4)); ctx.fillRect(x0 + 2 + (this.dir < 0 ? w - 4 - f : 0), y - 2, Math.max(1, f), 1);
        ctx.globalAlpha = 1;
        G.Glow.add(this.x, y - 2, Math.min(60, w * .5), this.color, .25 * a);
      }
    }
    BM.Hint = Hint;
    BM.hint = (b, x, w, life, color, dir) => b.add(new Hint({ x, y: arena().floor, w, life, color: color || '#ff5a3a', dir: dir || 1 }));
    // circle on the floor (rune circles, ripples): drawn as a flat ellipse; a Marker for the companions
    class Ring extends KIT.Marker {
      drawFx(ctx) {
        const k = clamp(this.t / this.life, 0, 1), blink = this.t % 6 < 3, fy = this.y, r = this.w / 2, col = this.color;
        const a = Math.min(1, this.t / 6) * (k > .9 ? (1 - k) / .1 : 1);
        ctx.globalAlpha = a * (k > .7 && blink ? 1 : .75); ctx.fillStyle = col;
        const n = Math.max(24, Math.round(r * 1.4));
        for (let i = 0; i < n; i++) { const an = i / n * Math.PI * 2; ctx.fillRect(Math.round(this.x + Math.cos(an) * r), Math.round(fy - 3 + Math.sin(an) * r * .22), 2, 1); }
        // inner fill grows with the fuse
        const ri = r * k;
        ctx.globalAlpha = a * .22;
        for (let yy = -2; yy <= 2; yy++) { const w = Math.round(ri * Math.sqrt(Math.max(0, 1 - (yy / 2.2) ** 2)) * 2); ctx.fillRect(Math.round(this.x - w / 2), Math.round(fy - 3 + yy * r * .09), w, 1); }
        if (this.runes) { ctx.globalAlpha = a * .9; for (let i = 0; i < 6; i++) { const an = i / 6 * Math.PI * 2 + this.t * .03; const x = Math.round(this.x + Math.cos(an) * r * .75), y = Math.round(fy - 3 + Math.sin(an) * r * .16); ctx.fillRect(x, y - 3, 1, 3); ctx.fillRect(x - 1, y - 2, 3, 1); } }
        ctx.globalAlpha = 1;
        G.Glow.add(this.x, fy - 3, r * 1.2, col, (.25 + .35 * k) * a);
      }
    }
    BM.Ring = Ring;
    BM.ring = (b, x, w, life, color, o) => b.add(new Ring(Object.assign({ x, y: arena().floor, w, life, color }, o || {})));

    /* ------------------------------------------------------------ darkness (blizzard, eclipse) */
    const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
    const mixHex = (a, b, k) => { const p = hex(a), q = hex(b); return '#' + p.map((v, i) => Math.round(v + (q[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
    BM.mixHex = mixHex;
    // k 0..1 blend of the stage ambient towards col (call every frame while it lasts; BM.dark(b,0) restores)
    BM.dark = (b, k, col) => {
      const d = b.data, L = G.Light; if (!L) return;
      if (d._amb0 === undefined) d._amb0 = L.ambient;
      d._darkK = k;
      L.ambient = k > .001 ? mixHex(d._amb0, col || '#05040a', clamp(k, 0, 1)) : d._amb0;
    };

    /* ------------------------------------------------------------ the runner */
    const start = BM.start = (b, name) => {
      const d = b.data, S = BM.specs[b.def.id], m = S.moves[name];
      d.mv = name; d.mt = 0; d.m = {}; d.log[name] = (d.log[name] || 0) + 1;
      if (m.cd) d.cd[name] = now() + ph3(m.cd, b);
      BM.ev(b, name, 'start');
    };
    function choose(b) {
      const d = b.data, S = BM.specs[b.def.id], pl = b.player;
      const dx = okP(pl) ? Math.abs(pl.x - b.x) : 999, list = [];
      for (const name in S.moves) {
        const m = S.moves[name];
        if (b.phase < (m.ph || 1) || (m.until && b.phase > m.until)) continue;
        if (d.cd[name] > now()) continue;
        if (m.range && (dx < m.range[0] || dx > m.range[1])) continue;
        if (m.ok && !m.ok(b, dx)) continue;
        const w = typeof m.w === 'function' ? m.w(b, dx) : ph3(m.w === undefined ? 1 : m.w, b);
        if (w > 0) list.push([name, w]);
      }
      if (!list.length) return null;
      return G.Boss.prototype.pick.call(b, list);
    }
    BM.end = (b, open) => {
      const d = b.data, S = BM.specs[b.def.id], m = S.moves[d.mv];
      BM.ev(b, d.mv, 'end', { open });
      d.rec = Math.max(1, open | 0); d.recMv = d.mv; d.mv = null;
      b.setState(m && m.recArt || S.recArt || 'recover');
      b.rest(S.rest || [40, 32, 26]);
    };
    // spec: { moves:{name:{w,ph,until,range,cd,ok,open:[p1,p2,p3],recArt,run(b,t,m)}}, idle(b), rest:[...], recover(b,t), tick(b) every fight frame }
    BM.install = (id, spec) => {
      const def = ED[id]; if (!def) { console.error('[bm] no def', id); return null; }
      BM.specs[id] = spec; spec.def = def;
      const setup0 = def.setup, piv0 = def.onPhaseInterrupt, always0 = def.always, fx0 = def.drawFx, dying0 = def.onDying;
      def.enrageAt = -1; def.noEnrageFx = true;
      def.setup = function (b) {
        setup0 && setup0.call(this, b);
        const d = b.data; d.log = {}; d.cd = {}; d.mv = null; d.rec = 0; d.m = {};
        const add0 = b.add;
        b.add = function (e) { if (e && !e._mv) { e._mv = this.data.mv || this.state; e._boss = this; } return add0.call(this, e); };
        b.dmg *= spec.dmgK || 1;
        spec.setup && spec.setup(b);
      };
      def.update = function (b) {
        const d = b.data;
        spec.tick && spec.tick(b);
        if (b.mode !== 'fight') return;
        if (d.hold) { d.hold(b); return; }                       // arena takeovers (staggers, grabs) run instead of moves
        if (d.rec > 0) {
          d.rec--; b.vx *= .82; if (b.fly) b.vy *= .85;
          spec.recover && spec.recover(b, d.rec);
          if (d.rec === 0) { BM.ev(b, d.recMv, 'ready'); b.setState('idle'); }
          return;
        }
        if (d.mv) {
          const m = spec.moves[d.mv];
          d.mt++;
          const r = m.run(b, d.mt, d.m);
          if (r) BM.end(b, typeof r === 'number' ? r : ph3(m.open || 40, b));
          return;
        }
        if (b.state !== 'idle') b.setState('idle');
        spec.idle(b);
        if (b.atkCD <= 0) { const n = choose(b); if (n) start(b, n); }
      };
      def.onPhaseInterrupt = function (b, ph) {
        const d = b.data;
        if (d.mv) { const m = spec.moves[d.mv]; m.cancel && m.cancel(b, d.m); BM.ev(b, d.mv, 'cut'); }
        d.mv = null; d.rec = 0; d.hold = null;
        BM.ev(b, 'phase' + ph, 'phase');
        piv0 && piv0.call(this, b, ph);
        spec.onPhaseInterrupt && spec.onPhaseInterrupt(b, ph);
      };
      def.always = function (b) {
        always0 && always0.call(this, b);
        spec.always && spec.always(b);
      };
      def.onDying = function (b) {
        const d = b.data;
        if (d.mv) { const m = spec.moves[d.mv]; m && m.cancel && m.cancel(b, d.m); }
        d.mv = null; d.hold = null;
        if (d._amb0 !== undefined) BM.dark(b, 0);
        BM.ev(b, 'death', 'death');
        dying0 && dying0.call(this, b);
        spec.onDying && spec.onDying(b);
      };
      // the punish window reads: three dim motes circle over the head while the boss stands open
      def.drawFx = function (ctx, b, f) {
        const r = fx0 ? fx0.apply(this, arguments) : undefined;
        try {
          const d = b.data;
          if (b.mode === 'fight' && d.rec > 12 && b.alpha > .3 && !spec.noMotes) {
            const p = def.telePos ? def.telePos(b) : { x: b.x, y: b.top - 14 };
            ctx.fillStyle = spec.moteColor || '#ffe9b0';
            for (let i = 0; i < 3; i++) { const a = b.t * .13 + i * 2.094; ctx.fillRect(Math.round(p.x + Math.cos(a) * 9), Math.round(p.y + 6 + Math.sin(a) * 2.5), 2, 1); }
          }
          spec.drawFx && spec.drawFx(ctx, b);
        } catch (e) { if (!BM._fxErr) { BM._fxErr = 1; console.error('[bm] fx', e); } }
        return r;
      };
      if (spec.def0) Object.assign(def, spec.def0);
      return def;
    };

    /* ------------------------------------------------------------ hit attribution (tests) and no-heal zones */
    {
      const hit0 = G.Combat.hit;
      G.Combat.hit = function (src, target, info) {
        const pl = G.world && G.world.player;
        if (!pl || target !== pl || !src) return hit0.apply(this, arguments);
        const hp0 = pl.hp, r = hit0.apply(this, arguments);
        try {
          if (r && pl.hp < hp0) {
            const boss = src.isBoss ? src : src._boss || (src.owner && src.owner.isBoss ? src.owner : null) || (src.bossOwner || null);
            if (boss && boss.def && BM.specs[boss.def.id]) BM.hits.push({ t: now(), id: boss.def.id, mv: src._mv || boss.data.mv || boss.data.recMv || boss.state, dmg: hp0 - pl.hp, ph: boss.phase, minion: !!src.bossOwner, py: Math.round(boss.y - pl.y), dx: Math.round(pl.x - boss.x), st: pl.state + (pl.act ? ':act' : '') + (pl.onGround ? '' : ':air'), th: BM.threats.filter(q => q.id === boss.def.id && q.end >= now() - 4).map(q => q.mv + '/' + q.how + '/lead' + (q.at - q.seen) + '/in' + (q.at - now())).slice(-4) });
            if (BM.hits.length > 4000) BM.hits.splice(0, 1500);
          }
        } catch (e) { /* ignore */ }
        return r;
      };
      // healing is refused inside a no-heal zone (the Choir's ink of silence)
      const PP = G.Player.prototype, ss0 = PP.setState, he0 = PP.heal;
      const blocked = p => { for (const f of BM.noHeal) { try { if (f(p)) return true; } catch (e) { /* ignore */ } } return false; };
      let hushAt = -99;
      const hush = p => {
        if (now() - hushAt < 40) return; hushAt = now();
        G.FX.text(p.x, p.top - 12, t(`No healing in the ink|В чернилах не лечатся|Siyohda shifo yo'q`), '#c8b8ff', { size: 7, life: 50 });
        sfx('denied', { x: p.x });
        BM.ev({ def: { id: 'hero' }, phase: 0, hp: 1, maxHp: 1 }, 'heal', 'refused');
      };
      PP.setState = function (s) { if (s === 'heal' && blocked(this)) { hush(this); return; } return ss0.apply(this, arguments); };
      PP.heal = function () { if (blocked(this)) return; return he0.apply(this, arguments); };
      BM.blocked = blocked;
    }
  } catch (e) { console.error('[bm]', e); }
}
