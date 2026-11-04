/* items_ext.js — runtime helpers for new weapons, skills and perks in the Kök Böri engine.
 * Append as a <script> after the engine (before </body>); it only touches window.G.
 * Idempotent (guards on G.ItemsExt). No build-time patches needed.
 *
 * Adds these optional def fields (all ignored by the stock engine):
 *   item.def.dmgMul                       extra damage multiplier for everything the item deals
 *                                         (applied in Combat.playerDmg, so the tooltip shows it too)
 *   item.def.onAnyHit(player, target, info, item)
 *                                         after every successful player hit whose info.item is this item
 *                                         (melee steps, skills/summons that pass item; see ITEMS.md for projectiles)
 *   item.def.canUse(player, item, ws)     skills/throws only: return true to cast, or a string/false to refuse
 *                                         (refused casts show the text, play "denied", start no cooldown)
 *   perk.noOffer                          keep the perk out of the shaman's random offer (Perks.random)
 */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.Items || !G.Perks || !G.Combat || !G.ItemKinds || !G.Game) return;
  if (G.ItemsExt) return;
  const U = G.U;
  const X = (G.ItemsExt = { version: 1 });

  /* ---------- data helpers ---------- */
  const isPlain = (v) => v && typeof v === 'object' && (Array.isArray(v) || Object.getPrototypeOf(v) === Object.prototype);
  // deep copy of plain objects/arrays; functions and class instances are shared
  function dclone(v) {
    if (Array.isArray(v)) return v.map(dclone);
    if (isPlain(v)) { const o = {}; for (const k in v) o[k] = dclone(v[k]); return o; }
    return v;
  }
  X.dclone = dclone;
  // all attack steps of a weapon def (ground combo + air steps)
  X.steps = (d) => [].concat(d.combo || [], d.air ? [].concat(d.air) : []);

  /* ---------- colours ---------- */
  const norm = (c) => {
    c = String(c).toLowerCase();
    return /^#[0-9a-f]{3}$/.test(c) ? '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3] : c;
  };
  function rgb2hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    let h = 0, s = 0;
    if (mx !== mn) {
      const d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }
  function hsl2rgb(h, s, l) {
    h = (((h % 360) + 360) % 360) / 360;
    if (!s) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
  }
  // spec: function(hex)->hex, or { map: {'#d4ddf0': '#c8b4ff', ...}, hue: deg, sat: mul, light: add, minSat: 0.12 }
  // map wins; hue/sat/light only touch colours with saturation >= minSat (keeps outlines and greys)
  X.colorFn = function (spec) {
    if (typeof spec === 'function') return spec;
    spec = spec || {};
    const map = {};
    for (const k in spec.map || {}) map[norm(k)] = spec.map[k];
    const cache = new Map();
    const hsl = spec.hue || spec.sat != null || spec.light;
    return function (c) {
      if (typeof c !== 'string' || c[0] !== '#') return c;
      const k = norm(c);
      let r = cache.get(k);
      if (r) return r;
      r = map[k];
      if (!r && hsl) {
        const rgb = U.hex2rgb(k), q = rgb2hsl(rgb[0], rgb[1], rgb[2]);
        if (q[1] >= (spec.minSat == null ? 0.12 : spec.minSat)) {
          const o = hsl2rgb(q[0] + (spec.hue || 0), Math.min(1, q[1] * (spec.sat == null ? 1 : spec.sat)), Math.max(0, Math.min(1, q[2] + (spec.light || 0))));
          r = U.rgb2hex(o[0], o[1], o[2]);
        }
      }
      r = r || k;
      cache.set(k, r);
      return r;
    };
  };
  // Recolour a "held" drawer made with WeaponsLib.heldOf (pixel pen): every pen.fill colour goes through xf.
  X.recolorHeld = function (held0, xf) {
    if (!held0) return held0;
    xf = X.colorFn(xf);
    return function (ctx, item, ws, p) {
      const pen = G.WeaponsLib.pen, f0 = pen.fill;
      pen.fill = function (x, y, w, h, c) { return f0.call(this, x, y, w, h, xf(c)); };
      try { return held0.call(this, ctx, item, ws, p); } finally { pen.fill = f0; }
    };
  };
  // Recolour any icon(ctx, size, item) by baking it once at size 16 and remapping pixels through xf.
  X.recolorIcon = function (icon0, xf) {
    if (!icon0) return icon0;
    xf = X.colorFn(xf);
    let cv = null;
    return function (ctx, size, item) {
      if (!cv) {
        cv = G.makeCanvas(40, 40, true);
        const c = cv.ctx;
        c.save(); c.translate(20, 20); icon0(c, 16, item); c.restore();
        const im = c.getImageData(0, 0, 40, 40), d = im.data, memo = new Map();
        for (let i = 0; i < d.length; i += 4) {
          if (!d[i + 3]) continue;
          const key = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];
          let o = memo.get(key);
          if (!o) { o = U.hex2rgb(xf(U.rgb2hex(d[i], d[i + 1], d[i + 2]))); memo.set(key, o); }
          d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2];
        }
        c.putImageData(im, 0, 0);
      }
      const k = (size || 16) / 16, sm = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(cv, -20 * k, -20 * k, 40 * k, 40 * k);
      ctx.imageSmoothingEnabled = sm;
    };
  };

  /* ---------- cloning items ---------- */
  // X.clone(baseId, newId, patch, opts) -> registered def
  //   patch: fields to override (name, desc, color, color2, weight, minStage, priceMul, noDrop, combo, use, ...)
  //   opts.dmgMul   multiplies all damage of the new item (def.dmgMul, see header)
  //   opts.speedMul scales windup/active/recover of every melee step (<1 = faster)
  //   opts.recolor  colour spec (see colorFn) applied to held art, icon and smear/crit colours
  X.clone = function (baseId, id, patch, opts) {
    patch = patch || {};
    opts = opts || {};
    const base = G.Items.defs[baseId];
    if (!base) throw new Error('ItemsExt.clone: no base item "' + baseId + '"');
    if (G.Items.defs[id] && !opts.replace) throw new Error('ItemsExt.clone: id "' + id + '" already registered');
    const d = dclone(base);
    delete d.slot; // Items.register derives it from kind
    Object.assign(d, dclone(patch), { id: id, baseId: baseId });
    if (opts.speedMul)
      for (const st of X.steps(d))
        for (const k of ['windup', 'active', 'recover']) if (st[k]) st[k] = Math.max(1, Math.round(st[k] * opts.speedMul));
    if (opts.recolor) {
      const xf = X.colorFn(opts.recolor);
      if (!('held' in patch)) d.held = X.recolorHeld(base.held, xf);
      if (!('icon' in patch)) d.icon = X.recolorIcon(base.icon, xf);
      for (const k of ['smearColor', 'smearColor2', 'critColor', 'arrowColor', 'trailColor']) if (d[k] && !(k in patch)) d[k] = xf(d[k]);
      for (const st of X.steps(d))
        if (st.smear && typeof st.smear === 'object') {
          if (st.smear.color) st.smear.color = xf(st.smear.color);
          if (st.smear.color2) st.smear.color2 = xf(st.smear.color2);
        }
    }
    if (opts.dmgMul) d.dmgMul = (d.dmgMul || 1) * opts.dmgMul;
    return G.Items.register(d);
  };

  /* ---------- engine hooks (runtime wrappers, installed once) ---------- */
  // def.dmgMul
  const pd0 = G.Combat.playerDmg;
  G.Combat.playerDmg = function (item, base) {
    const v = pd0.call(this, item, base), m = item && item.def && item.def.dmgMul;
    return m ? v * m : v;
  };
  // def.onAnyHit
  const hit0 = G.Combat.hit;
  G.Combat.hit = function (src, target, info) {
    const ok = hit0.apply(this, arguments);
    const it = ok && info && info.item;
    if (it && it.def && it.def.onAnyHit && src && src.faction === 'player') {
      try { it.def.onAnyHit(G.world.player, target, info, it); } catch (e) { console.error('[ItemsExt] onAnyHit', e); }
    }
    return ok;
  };
  // def.canUse for skills (ItemKinds.throw is the same object as ItemKinds.skill)
  const SK = G.ItemKinds.skill, start0 = SK.start;
  SK.start = function (p, item, ws) {
    const d = item.def;
    if (d.canUse && !(item.cd > 0)) {
      let r;
      try { r = d.canUse(p, item, ws); } catch (e) { console.error('[ItemsExt] canUse', e); r = false; }
      if (r !== true) {
        G.FX.text(p.x, p.top - 10, typeof r === 'string' ? r : 'Нельзя', '#ff9a8a', { size: 7 });
        if (G.Audio) G.Audio.sfx('denied');
        return false;
      }
    }
    return start0.call(this, p, item, ws);
  };
  // perk.noOffer
  const rnd0 = G.Perks.random;
  G.Perks.random = function (n, excl) {
    const ex = (excl || []).concat(Object.values(this.defs).filter((d) => d.noOffer).map((d) => d.id));
    return rnd0.call(this, n, ex);
  };
  // forced altar / shop contents: X.forceNext('altar'|'shop', id, tier, {slot, biome})
  const queue = (X.queue = []);
  X.forceNext = function (kind, id, tier, o) { queue.push(Object.assign({ kind: kind, id: id, tier: tier || 0 }, o || {})); };
  // Stock bug fix (X.fixAltarFocus, default on): the altar stand is an Interactable too and, standing on the floor,
  // Player.findNearby() prefers it over its floating item, so F does nothing unless airborne. Make stands unfocusable.
  X.fixAltarFocus = true;
  const unfocusAltars = () => {
    if (!X.fixAltarFocus || !G.world) return;
    for (const e of G.world.interactables) if (e.art === 'altar' && !e.canUse) e.canUse = () => false;
  };
  const so0 = G.Game.spawnObject;
  G.Game.spawnObject = function (obj, stage, level) {
    if (obj && obj.kind === 'altar') { try { return spawn.apply(this, arguments); } finally { unfocusAltars(); } }
    return spawn.apply(this, arguments);
  };
  function spawn(obj, stage, level) {
    const i = queue.findIndex((q) => q.kind === obj.kind && (q.slot == null || q.slot === obj.slot) &&
      (!q.biome || (level && level.biome && level.biome.id === q.biome)));
    if (i < 0) return so0.apply(this, arguments);
    const q = queue.splice(i, 1)[0], rd0 = G.Items.randomDrop;
    let used = false;
    G.Items.randomDrop = function () {
      if (used) return rd0.apply(this, arguments);
      used = true;
      return G.Items.create(q.id, q.tier);
    };
    try { return so0.apply(this, arguments); } finally {
      G.Items.randomDrop = rd0;
      if (!used) queue.splice(i, 0, q); // e.g. shop slot 2 rolled food: keep the request for the next one
    }
  }

  /* ---------- giving / spawning ---------- */
  // Put an item straight into run.slots. slot: 'attack'|'secondary'|'skill1'|'skill2' (default: first free of its category,
  // else the first one). o.dropOld drops the replaced item at the player's feet; o.keepOnRetry (default true) also writes
  // the slot into Game.snap so "Возродиться здесь" keeps it; o.toast (default true).
  X.give = function (id, tier, slot, o) {
    o = o || {};
    const run = G.run;
    if (!run) return null;
    const it = G.Items.create(id, tier || 0);
    if (!it) return null;
    const cats = G.Items.categoryOf(it);
    slot = slot || cats.find((s) => !run.slots[s]) || cats[0];
    const old = run.slots[slot];
    run.slots[slot] = it;
    const p = G.world && G.world.player;
    if (old && o.dropOld && p) G.Pickups.item(p.x, p.y - 8, old);
    if (o.keepOnRetry !== false && G.Game.snap && G.Game.snap.slots) G.Game.snap.slots[slot] = { id: it.id, tier: it.tier };
    if (o.toast !== false && G.UI && G.UI.toast) G.UI.toast('Получено: ' + it.name, G.Items.colorHex(it));
    G.Events.emit('equip', it, slot);
    return it;
  };
  // Drop an item pickup (default: in front of the player). onAltar=true makes it float in place.
  X.drop = function (id, tier, x, y, onAltar) {
    const p = G.world && G.world.player;
    if (x == null && p) { x = p.x + 24 * p.facing; y = p.y - 8; }
    return G.Pickups.item(x, y, G.Items.create(id, tier || 0), !!onAltar);
  };
  // An altar with a chosen item at (x, y) = floor point.
  X.altar = function (id, tier, x, y) {
    G.world.add(new G.Interactable(x, y, { art: 'altar', w: 26, h: 10, layer: -2, canUse: () => false }));
    return G.Pickups.item(x, y - 10, G.Items.create(id, tier || 0), true);
  };
  // A shop rug selling a chosen item (same behaviour as the chaikhana rugs). price default = engine formula.
  X.shopRug = function (id, tier, x, y, price) {
    const it = G.Items.create(id, tier || 0), st = G.run ? G.run.stage : 0;
    if (price == null) price = Math.round((60 + 40 * st) * (1 + 0.15 * it.tier) * (it.def.priceMul || 1));
    return G.world.add(new G.Interactable(x, y, {
      art: 'shopRug', w: 22, h: 30, item: it, price: price, food: false,
      prompt: 'Купить «' + it.name + '» — ' + price + ' тилла',
      onUse(pl, rug) {
        if (G.run.gold < rug.price) {
          if (G.Audio) G.Audio.sfx('denied');
          G.FX.text(rug.x, rug.y - 40, 'Не хватает тилла', '#ff8080', { size: 8 });
          return false;
        }
        G.run.gold -= rug.price;
        rug.dead = true;
        if (G.Audio) G.Audio.sfx('buy');
        G.Pickups.item(rug.x, rug.y - 12, rug.item);
        return true;
      },
    }));
  };

  /* ---------- perks ---------- */
  // icon from a vector drawing in a 16x16 box centred on 0,0 (baked, outlined, same look as stock perks)
  X.perkIcon = (draw, bakeOpts) => G.WeaponsLib.makeIcon(draw, bakeOpts);
  X.perk = (def) => G.Perks.register(def);
})();
