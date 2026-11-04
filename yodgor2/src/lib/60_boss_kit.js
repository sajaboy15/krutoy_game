/* boss_kit.js — runtime helpers for new bosses (window.G.BK). Needs enemy_kit.js (colour + proxy helpers).
   BK.variant(baseId, newId, over, tune)   re-skinned / re-tuned copy of kempir|barys|aidahar
   BK.champion(enemyId, newId, o)          boss built from a regular enemy def (boss bar, intro card, phases, scripted extras)
   BK.story(id, {name,title,quote})        text for the intro card (G.STORY.bosses[id])
   Place with a PLAN entry {type:'boss', biome:'<arena biome>', boss:'<id>'}. */
(function () {
  'use strict';
  const G = window.G, EK = G.EK, U = G.U;
  if (!G || !G.Boss || !EK) return;
  const BP = G.Boss.prototype, BK = G.BK = G.BK || {};
  const KIT = G.BossKit;

  BK.story = function (id, s) { G.STORY = G.STORY || {}; G.STORY.bosses = G.STORY.bosses || {}; G.STORY.bosses[id] = s; };

  // tune = { look, weights:{attack:mul (0 removes)}, restMul, teleMul, spd, enrageAt, enrageSpd, extra:{name:{w, phase, update(b, t)}} }
  function install(def, tune) {
    const setup = def.setup, update = def.update, extra = tune.extra || {};
    def.setup = function (b) {
      setup && setup.call(this, b);
      if (tune.spd) b.spd = tune.spd;
      b.pick = function (list) {
        list = list.map(([n, w]) => [n, w * (tune.weights && tune.weights[n] !== undefined ? tune.weights[n] : 1)]).filter(a => a[1] > 0);
        for (const n in extra) if (this.phase >= (extra[n].phase || 1)) list.push([n, extra[n].w || 2]);
        return BP.pick.call(this, list.length ? list : [['idle', 1]]);
      };
      if (tune.restMul) b.rest = function (a) { return BP.rest.call(this, a.map(v => v * tune.restMul)); };
      if (tune.teleMul) b.tele = function (t) { return BP.tele.call(this, t * tune.teleMul); };
    };
    def.update = function (b) {
      const x = extra[b.state];
      if (x) { if (x.update(b, b.stateT) === true) { b.rest([50, 40, 30]); b.setState('idle'); } return; }
      return update.call(this, b);
    };
  }

  BK.variant = function (baseId, id, over, tune) {
    const base = G.Enemies.defs[baseId];
    const def = Object.defineProperties({}, Object.getOwnPropertyDescriptors(base));
    Object.assign(def, over || {}, { id, baseId });
    tune = tune || {};
    const look = tune.look;
    if (look) {
      for (const f of ['roarColor', 'blood', 'outline']) if (typeof def[f] === 'string' && !(over && f in over)) def[f] = EK.mapHex(look, def[f]);
      for (const f of ['debris', 'deathColors']) if (def[f] && !(over && f in over)) def[f] = def[f].map(c => EK.mapHex(look, c));
      if (base.rims && !(over && over.rims)) def.rims = (s, b) => base.rims(s, b).map(r => r && Object.assign({}, r, { color: EK.mapHex(look, r.color) }));
      const draw = base.drawBoss, fx = base.drawFx;
      // drawBoss puts its puppet canvases on the world ctx: recolour them through the proxy ('live' = no caching)
      def.drawBoss = function (ctx, b) { return EK.withMappedLights(look, () => draw.call(this, EK.proxyCtx(ctx, look, 'live'), b)); };
      if (fx) def.drawFx = function (ctx, b, f) { return EK.withMappedLights(look, () => fx.call(this, EK.proxyCtx(ctx, look, 'memo'), b, f)); };
      // particles/hazard FX spawned from the AI
      for (const h of ['update', 'intro', 'always', 'phaseAnim', 'deathAnim', 'onDeath']) {
        const fn = def[h]; if (fn) def[h] = function () { const a = arguments; return EK.withMappedParticles(look, () => fn.apply(this, a)); };
      }
    }
    install(def, tune);
    G.Enemies.register(def);
    return def;
  };

  // Champion: Boss subclass instance drawn & driven by a regular enemy's def.
  BK.champion = function (baseId, id, o) {
    const base = G.Enemies.defs[baseId], k = o.scale || 2;
    const s = Object.assign({ w: 64, h: 64, ox: 32, oy: 60 }, base.sprite || {});
    const spr = { w: Math.ceil(s.w * k) + 4, h: Math.ceil(s.h * k) + 4, ox: Math.round(s.ox * k) + 2, oy: Math.round(s.oy * k) + 2 };
    const look = o.look;
    const def = {
      id, baseId, name: o.name, title: o.title, boss: true, biomes: [], hp: o.hp || 600, dmg: o.dmg || base.dmg * 1.3,
      w: Math.round(base.w * k), h: Math.round(base.h * k), speed: (base.speed || 1) * (o.speedMul || 1), fly: base.fly, scale: k,
      gold: [0, 0], blood: base.blood, debris: base.debris, fxPal: o.fxPal || 'violet', sight: 9999, sightY: 999,
      phaseAt: o.phaseAt || [0.6, 0.3], phaseNames: o.phaseNames || null, roarColor: o.roarColor || '#ffd77a', music: o.music || 'boss',
      arena: o.arena || { w: 46, h: 22 }, introLen: o.introLen || 120, phaseLen: 80, deathLen: 150, kbResist: 1,
      outline: base.outline || '#100a1b', deathColors: o.deathColors || ['#ffffff', '#ffd77a', '#ff7a2a'],
      rims: () => [base.rim || { color: '#fff0c8', dx: -1, dy: -1, a: 0.4 }, null],
      init: base.init,                                   // Enemy constructor calls def.init (file-1 init also sets an instance draw)
      setup(b) {
        delete b.draw;                                   // back to Boss.prototype.draw -> def.drawBoss
        b.spr = spr; b.contact = o.contact === undefined ? 0.4 : o.contact; b.alpha = 0;
        b.attackBox = function (x, y, w, h) { return G.Enemy.prototype.attackBox.call(this, x * k, y * k, w * k, h * k); };
        if (o.scaleAI !== false) b.dx = function () { return G.Enemy.prototype.dx.call(this) / k; };   // AI distance checks follow the bigger body
        b.data.sCD = 200;
      },
      intro(b, t) {
        b.alpha = U.clamp(t / 40, 0, 1);
        if (t === 2) G.FX.poof(b.x, b.cy, { pal: def.fxPal, r: 18 });
        if (t === 60) b.roar({ y: b.cy });
        return t >= def.introLen;
      },
      update(b) {
        const x = o.extra && o.extra[b.state];
        if (x) { if (x.update(b, b.stateT) === true) { b.data.sCD = U.randi(140, 220) / b.phase; b.setState('chase'); } return; }
        if (o.extra && --b.data.sCD <= 0 && (b.state === 'chase' || b.state === 'idle') && (b.onGround || b.fly)) {
          const list = Object.keys(o.extra).filter(n => b.phase >= (o.extra[n].phase || 1)).map(n => [n, o.extra[n].w || 1]);
          if (list.length) { b.setState(b.pick(list)); return; }
        }
        base.update(b);
      },
      onPhase(b, ph) { o.onPhase && o.onPhase(b, ph); },
      drawBoss(ctx, b) {
        const opts = Object.assign(b.popts(), { w: spr.w, h: spr.h, ox: spr.ox, oy: spr.oy, flip: b.facing < 0, scale: k });
        G.Art.puppet(ctx, b.x, b.y, opts, c => {
          c.imageSmoothingEnabled = false;
          base.draw(c, b, G.frame);
          for (const key of ['eyes']) if (b.data[key]) b.data[key] = b.data[key].map(p => [p[0] * k, p[1] * k]);
          if (look) EK._lutPass(c, spr.w, spr.h, look);
        });
      },
      drawFx(ctx, b, f) { if (base.drawFx) look ? EK.withMappedLights(look, () => base.drawFx(EK.proxyCtx(ctx, look, 'memo'), b, f)) : base.drawFx(ctx, b, f); }
    };
    if (look) { def.debris = def.debris && def.debris.map(c => EK.mapHex(look, c)); def.blood = EK.mapHex(look, def.blood); }
    G.Enemies.register(def);
    return def;
  };
})();
