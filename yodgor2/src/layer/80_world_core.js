/* =====================================================================
   Stage 4 — the world frame ("Каркас мира"): G.WORLD2.
   The linear campaign (G.PLAN 0..32) stays as it was. The open world
   lives on two reserved plan entries appended after the victory entry:
     WPI = { type:'level', id:'w_region' }  — any region (its biome, seed and
           objects are filled in just before the engine loads it)
     WRI = { type:'rest',  id:'w_chai' }    — any chaikhana interior
   so the engine's loader, populate, death/retry, checkpoint and slots all
   keep working; this file decides WHICH region they build.

   State (saved with the journey: R().world — checkpoint, slots, autosave):
     cur {region, entry, inside}  where the hero is / will appear
     bench {region, chai}         last chaikhana rested at (death returns here)
     seeds {region: n}            fixed layout seed per save
     visited, killed{region:[spawn idx]}, mb (minibosses), open (doors, chests,
     shortcuts, gates), taken (one-time items), seen{region: b64 cells},
     sil{region: silhouette}, chai (discovered chaikhanas), keys, clock, day,
     moon (story phase), marks, obj (objective)
   Regions are data: W2.region(id, def) (84_world_regions.js).
   Objects inside a region are data too: W2.kind(name, {place, spawn}).

   Files: 80 core (state, loading, transitions, persistence, death, menu, story hooks)
          81 time (clock, light by the hour, night spawns, schedules, shops, HUD)
          82 places (exits, chaikhanas + rest/travel, houses/shortcuts, grate, hook, light
             gates, cracked walls, chests/caches, miniboss, stalls, spots)
          83 map (silhouettes, seen cells, charts, the scroll screen)
          84 regions (biomes/art of the four regions, region data, NPCs, objectives)

   API for the story (stage 5)
     W2.region(id, {name, sub, tier, stage, seed, biome:{day,night}|id, map:{x,y,w,h,col},
        night:{extra, pool, elite}, exits:{id:{kind:'street'|'well'|'shaft'|'gate', at, to:[region, entry],
        key, label, closed|locked}}, objects:[{kind, id, at:{frac}, ...}]})
     W2.go(region, entry, {inside: chaiId})       move the hero (fade + load)
     W2.onEnter(region|'*', fn(def, {first}))     an arrival (LAND.start / barks / memory placement)
     W2.trigger(region, spot, {r, once, when}, fn(done))   a scene at a spot (LAND.people/exit, BOSS.pre)
     W2.objective(text3), W2.mark(id, region, x|spot, y, kind, label), W2.unmark(id)
     W2.npc(id, {name, look, talk(done)}), W2.schedule(id, [{from, to, region, spot}]), W2.pin(id, region, spot)
     W2.shop(id, {open:[from,to]}), W2.shopOpen(id)
     W2.giveKey(k), W2.hasKey(k), W2.can(k) (with alternatives), W2.key(id, {name, alt})
     W2.advanceMoon() (story milestones), W2.moonPhase(), W2.hooks.moon / phase / rest / chai / enter / leave
     W2.isOpen(sid), W2.setOpen(sid), W2.taken(sid), W2.take(sid)    any persistent fact by a stable id
     chaikhana hosts: objects [{kind:'chai', id, look, name, host:{prompt, talk(done)}}] (REST.rustam/turab/farrukh)
   ===================================================================== */
const W2 = G.WORLD2 = {
  regions: {}, kinds: {}, keys: {}, tiers: [], npcs: {}, hooks: { enter: [], leave: [], rest: [], spot: {} },
  WPI: -1, WRI: -1, busy: false, active: null, _gen: null, _sil: {}
};
{
  const TS = G.TS, T = G.T, U = G.U;
  W2.TS = TS;

  /* ---------------------------------------------------------------- plan entries */
  const P = G.PLAN;
  W2.noPreview = true;
  W2.WPI = P.length; P.push({ type: 'level', id: 'w_region', act: 1, biome: 'yd_tail_night', world: true });
  W2.WRI = P.length; P.push({ type: 'rest', id: 'w_chai', act: 1, look: 'yd_chai_dusk', world: true });
  // stage 5: any boss arena (a region with def.arena = {boss, biome}); its gate leads back out (def.out)
  W2.WBI = P.length; P.push({ type: 'boss', id: 'w_boss', act: 1, biome: 'yd_vault', boss: 'glutton', world: true });
  // The campaign counts its lands with PLAN.filter (BiomeKit's linear difficulty: level+boss entries).
  // The world's entries must not be counted, or every linear land would get ~4% easier.
  Object.defineProperty(P, 'filter', {
    value: function (fn, self) { return Array.prototype.filter.call(this, (e, i, a) => !(e && e.world) && fn.call(self, e, i, a)); },
    enumerable: false, configurable: true, writable: true
  });
  const isWorldPI = i => i === W2.WPI || i === W2.WRI || i === W2.WBI;
  W2.isWorldPI = isWorldPI;
  W2.on = () => !!(G.run && isWorldPI(G.run.planIndex) && R().world);

  /* ---------------------------------------------------------------- state */
  const blankWorld = () => ({
    v: 1, cur: { region: 'tail', entry: 'start', inside: null }, bench: null, seeds: {}, visited: {}, killed: {}, mb: {}, open: {}, taken: {},
    seen: {}, sil: {}, chai: {}, keys: {}, clock: 120, day: 1, moon: 0, marks: {}, obj: null, charts: {}, perk: {}, stats: { regionT: {} }
  });
  W2.blank = blankWorld;
  const S = () => {
    const r = R();
    if (!r.world) return null;
    const b = blankWorld();
    for (const k in b) if (r.world[k] == null) r.world[k] = b[k];
    return r.world;
  };
  W2.S = S;
  const sid = (region, kind, tx, ty) => region + ':' + kind + ':' + tx + ',' + ty;  // stable id from position
  W2.sid = sid;
  W2.isOpen = id => { const s = S(); return !!(s && s.open[id]); };
  W2.setOpen = (id, v) => { const s = S(); if (!s) return; if (v === false) delete s.open[id]; else s.open[id] = 1; save(); W2.autosave(); };
  W2.taken = id => { const s = S(); return !!(s && s.taken[id]); };
  W2.take = id => { const s = S(); if (!s) return; s.taken[id] = 1; save(); W2.autosave(); };
  W2.hasKey = k => { const s = S(); return !!(s && s.keys[k]); };
  W2.giveKey = (k, quiet) => {
    const s = S(); if (!s || s.keys[k]) return;
    s.keys[k] = 1; save();
    const K = W2.keys[k];
    if (!quiet && K) { toast(tf(`New way: {k}|Новый путь: {k}|Yangi yo'l: {k}`, { k: t(K.name) }), '#ffe7a6'); sfx('scroll'); }
    W2.autosave();
  };

  /* ---------------------------------------------------------------- registries */
  // tiers of the city in cross-section (the map draws them top to bottom)
  W2.tiers = [
    { id: 'heights', name: `The Heights|Высоты|Tepalar` },
    { id: 'surface', name: `The Surface|Поверхность|Yer yuzi` },
    { id: 'under', name: `The Underground|Подземье|Yer osti` },
    { id: 'deep', name: `The Depths|Глубина|Chuqurlik` },
    { id: 'dream', name: `The Dream|Сон|Tush` }
  ];
  W2.region = (id, def) => { W2.regions[id] = Object.assign({ id, exits: {}, objects: [], stage: 1, tier: 'surface' }, def); return W2.regions[id]; };
  W2.kind = (name, def) => { W2.kinds[name] = def; };
  W2.key = (id, def) => { W2.keys[id] = Object.assign({ id }, def); };

  /* ---------------------------------------------------------------- level helpers (placement) */
  const H = W2.H = {};
  H.ground = (L, tx, fromY) => { // first standable row under air at column tx, from fromY down
    for (let y = Math.max(1, fromY || 1); y < L.h - 1; y++) {
      const a = L.get(tx, y), b = L.get(tx, y + 1);
      if (a === T.AIR && (b === T.SOLID || b === T.PLAT) && L.get(tx, y - 1) === T.AIR) return y + 1;
    }
    return null;
  };
  H.topGround = (L, tx) => { // highest walkable row in a column (open levels: the street)
    for (let y = 1; y < L.h - 1; y++) if (L.get(tx, y) === T.AIR && L.get(tx, y + 1) === T.SOLID) return y + 1;
    return null;
  };
  H.runs = (L, min, clear) => { try { return G.BiomeKit.floorRuns(L, min || 3, clear || 3); } catch (e) { return []; } };
  H.inStruct = (L, tx, ty) => !!(L.structOf && L.structOf(tx, ty));
  // a floor run near a fraction of the width, outdoors, with `need` free tiles and `head` free rows above
  H.runNear = (L, frac, o) => {
    o = o || {};
    const need = o.need || 4, head = o.head || 4, used = L._w2used || (L._w2used = []);
    let best = null, bd = 1e9;
    for (const r of H.runs(L, need, head)) {
      if (o.ground !== false && L.isOpen && !(H.isGround(L, r.x0, r.ty) && H.isGround(L, r.x1, r.ty))) continue;
      if (o.outdoor !== false && H.inStruct(L, r.x0 + 1, r.ty)) continue;
      if (o.minY != null && r.ty < o.minY) continue;
      for (let x = r.x0; x + need - 1 <= r.x1; x++) {
        if (used.some(u => x + need > u[0] - 2 && x < u[1] + 2)) continue;
        if (o.clearAbove) { let ok = true; for (let xx = x; xx < x + need && ok; xx++) for (let y = r.ty - head; y >= Math.max(0, r.ty - o.clearAbove); y--) if (L.get(xx, y) !== T.AIR) { ok = false; break; } if (!ok) continue; }
        const d = Math.abs(x + need / 2 - L.w * frac);
        if (d >= bd) continue;
        const c = { tx: x, ty: r.ty, x0: x, x1: x + need - 1, y: r.y };
        if (o.test && !o.test(c)) continue;
        bd = d; best = c;
      }
    }
    if (best) used.push([best.x0, best.x1]);
    return best;
  };
  // a structure of ours that the tile painters and decorations know (structOf reads L.sid)
  H.struct = (L, st, x0, y0, x1, y1) => {
    L.structures = L.structures || [];
    L.structures.push(st);
    const i = L.structures.length - 1;
    if (L.sid) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (L.in(x, y)) L.sid[y * L.w + x] = i;
    return st;
  };
  // the street: solid all the way down under (tx, ty+1)
  H.isGround = (L, tx, ty) => { for (let y = ty + 1; y < L.h; y++) if (L.get(tx, y) !== T.SOLID) return false; return true; };
  const topSolid = (L, x) => { let y = 0; while (y < L.h && L.get(x, y) !== T.SOLID) y++; return y; };   // floating beams (PLAT) do not count
  H.topSolid = topSolid;
  const isBeam = (L, i) => { const st = L.structures && L.structures[i]; return !!st && st.kind === 'beam'; };
  // a building site on the street of an open level: no structure over it, roughly level ground; it is flattened.
  // returns {tx, ty (the air row of the floor), x0, x1, y} or null. o: {need, head, frac, pad, maxStep}
  H.site = (L, frac, o) => {
    o = o || {};
    if (!L.isOpen) return H.runNear(L, frac, o);
    const need = o.need || 6, head = o.head || 5, pad = o.pad == null ? 2 : o.pad, used = L._w2used || (L._w2used = []);
    let best = null, bd = 1e9;
    for (let x0 = 12; x0 + need + pad < L.w - 12; x0++) {
      const d = Math.abs(x0 + need / 2 - L.w * frac);
      if (d >= bd) continue;
      if (used.some(u => x0 + need + pad > u[0] - 2 && x0 - pad < u[1] + 2)) continue;
      const tops = [];
      let ok = true;
      for (let x = x0 - pad; x < x0 + need + pad && ok; x++) {
        const ty = topSolid(L, x);
        if (ty >= L.h - 2 || !H.isGround(L, x, ty - 1)) { ok = false; break; }
        for (let y = Math.max(0, ty - head - 3); y < ty; y++) { const si = L.sid ? L.sid[y * L.w + x] : -1; if (si >= 0 && !isBeam(L, si)) { ok = false; break; } }
        tops.push(ty);
      }
      if (!ok) continue;
      const sorted = tops.slice().sort((a, b) => a - b), med = sorted[sorted.length >> 1];
      if (sorted[sorted.length - 1] - sorted[0] > (o.maxStep || 4)) continue;
      const c = { tx: x0, ty: med - 1, x0, x1: x0 + need - 1, y: med * TS, med };
      if (o.test && !o.test(c)) continue;
      bd = d; best = c;
    }
    if (!best) return o.fallback === false ? null : H.runNear(L, frac, Object.assign({}, o, { ground: false }));
    // flatten: solid up to the floor, air above it
    for (let x = best.x0 - pad; x < best.x1 + 1 + pad; x++) {
      for (let y = best.med; y < L.h; y++) { if (L.get(x, y) === T.SOLID) break; L.set(x, y, T.SOLID); }
      for (let y = Math.max(1, best.med - head - 1); y < best.med; y++) L.set(x, y, T.AIR);
    }
    used.push([best.x0 - pad, best.x1 + pad]);
    return best;
  };
  // room-grid levels: the floor of the path room nearest to frac, cleared and levelled
  H.roomSite = (L, frac, need, head) => {
    const rooms = (L.rooms || []).filter(r => r.path && r.kind !== 'start' && r.kind !== 'end');
    if (!rooms.length) return null;
    const used = L._w2used || (L._w2used = []);
    rooms.sort((a, b) => Math.abs(a.ox + a.w / 2 - frac * L.w) - Math.abs(b.ox + b.w / 2 - frac * L.w));
    for (const rm of rooms) {
      const x0 = rm.ox + Math.floor((rm.w - need) / 2), fy = rm.fy;
      if (used.some(u => x0 + need > u[0] - 2 && x0 < u[1] + 2)) continue;
      for (let x = x0 - 1; x <= x0 + need; x++) { for (let y = fy - head; y < fy; y++) L.set(x, y, T.AIR); L.set(x, fy, T.SOLID); for (let y = fy - head; y <= fy; y++) L.back[L.idx(x, y)] = 1; }
      used.push([x0 - 1, x0 + need]);
      return { tx: x0, ty: fy - 1, x0, x1: x0 + need - 1, y: fy * TS };
    }
    return null;
  };
  H.reserve = (L, x0, x1) => { (L._w2used || (L._w2used = [])).push([x0, x1]); };
  H.fill = (L, x0, y0, x1, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) L.set(x, y, v); };
  H.back = (L, x0, y0, x1, y1, v) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (L.in(x, y)) L.back[L.idx(x, y)] = v == null ? 1 : v; };
  // tiles set after the bake: physically there, never painted (gates draw themselves)
  H.afterBake = (L, fn) => { (L._w2after || (L._w2after = [])).push(fn); };
  H.tile = (L, tx, ty) => ({ x: tx * TS + TS / 2, y: (ty + 1) * TS });

  /* ---------------------------------------------------------------- choosing the look */
  // a region may have a day and a night biome; the clock decides at load time (81 animates the rest)
  W2.biomeOf = def => {
    const b = def.biome;
    if (typeof b === 'string') return b;
    const night = W2.nightK ? W2.nightK() > 0.5 : false;
    return (night ? b.night : b.day) || b.day || b.night;
  };

  /* ---------------------------------------------------------------- loading */
  const prep = () => {
    const s = S();
    if (!s) return null;
    let def = W2.regions[s.cur.region];
    if (!def) { s.cur = { region: 'tail', entry: 'start', inside: null }; def = W2.regions.tail; }
    if (!def) return null;
    if (s.seeds[def.id] == null) s.seeds[def.id] = def.seed || 1;
    W2.stats.loads++;
    if (s.cur.inside) {
      const ch = W2.chaiDef(s.cur.inside);
      const p = G.PLAN[W2.WRI];
      p.region = def.id; p.chai = s.cur.inside; p.look = (ch && ch.look) || 'yd_chai_dusk';
      W2._gen = null;
      return W2.WRI;
    }
    if (def.arena) {
      const pb = G.PLAN[W2.WBI];
      pb.region = def.id; pb.biome = def.arena.biome; pb.boss = def.arena.boss; pb.act = W2.actOf ? W2.actOf(def) : (def.act || 1);
      W2._gen = null;
      return W2.WBI;
    }
    const p = G.PLAN[W2.WPI];
    p.region = def.id; p.biome = W2.biomeOf(def); p.act = W2.actOf ? W2.actOf(def) : (def.act || 1);
    W2._gen = { def, seed: s.seeds[def.id], entry: s.cur.entry };
    return W2.WPI;
  };
  {
    const ls0 = G.Game.loadStage;
    G.Game.loadStage = function (i, retry) {
      if (isWorldPI(i)) {
        const j = prep();
        if (j == null) { console.error('[world] no world state'); return ls0.call(this, 0, retry); }
        W2._t0 = performance.now();
        try { return ls0.call(this, j, retry); } finally { W2._gen = null; W2.stats.lastLoadMs = Math.round(performance.now() - W2._t0); }
      }
      W2._gen = null;
      return ls0.apply(this, arguments);
    };
  }
  // difficulty: a region has its own stage (tier and place), not its plan index
  {
    const K = G.BiomeKit, d0 = K.difficulty;
    K.difficulty = function (raw, i) {
      if (isWorldPI(i)) { const s = S(); const def = s && W2.regions[s.cur.region]; return def ? W2.stageOf(def) : 1; }
      return d0 ? d0(raw, i) : raw;
    };
  }
  // stage 5 replaces this with the moon-phase scaling (85c_world_story.js)
  W2.stageOf = def => (typeof def.stage === 'function' ? def.stage() : def.stage);
  // the fixed seed of a region, and the region's own shaping after generation
  for (const nm of ['open', 'generate']) {
    const f = G.LevelGen[nm];
    G.LevelGen[nm] = function (biome, seed) {
      const g = W2._gen;
      if (!g) return f.apply(this, arguments);
      const L = f.call(this, biome, g.seed);
      try { shape(L, g); } catch (e) { console.error('[world] shape', e); }
      return L;
    };
  }
  {
    const bake0 = G.LevelGen.bake;
    G.LevelGen.bake = function (L) {
      const r = bake0.apply(this, arguments);
      if (L && L._w2after) for (const f of L._w2after) { try { f(L); } catch (e) { console.error('[world] afterBake', e); } }
      return r;
    };
  }

  // shape: remove the linear gate, place exits and objects (data), carve what they need, choose the spawn
  function shape(L, g) {
    const def = g.def;
    L.w2 = { region: def.id, objs: [], entries: {}, missing: [] };
    L.objects = L.objects.filter(o => o.kind !== 'door' && o.kind !== 'entrance');
    L._w2used = [];
    H.reserve(L, 0, 9); H.reserve(L, L.w - 10, L.w - 1);
    if (def.shape) def.shape(L, H, g);
    // exits
    for (const id in def.exits) {
      const ex = Object.assign({ id, kind: 'street' }, def.exits[id]);
      if (ex.inHouse || ex.onTower || ex.hidden) continue;   // placed by the house / tower / hidden hatch that holds them
      const K = W2.kinds['exit_' + ex.kind] || W2.kinds.exit_street;
      const at = K.place(L, ex, H, def);
      if (!at) { console.warn('[world] no place for exit', def.id, id); L.w2.missing.push('exit:' + id); continue; }
      const o = Object.assign({ type: 'exit', ex, sid: sid(def.id, 'exit', id, 0) }, at);
      L.w2.objs.push(o);
      L.w2.entries[id] = at.entry || { x: at.x, y: at.y, face: 1 };
    }
    // other objects: chaikhanas, shortcuts, gates, secrets, caches, miniboss, props
    for (const od of def.objects) {
      const K = W2.kinds[od.kind];
      if (!K) { console.warn('[world] unknown kind', od.kind); continue; }
      try {
        const at = K.place ? K.place(L, od, H, def) : null;
        if (!at) { console.warn('[world] no place for', def.id, od.kind, od.id || ''); L.w2.missing.push(od.kind + ':' + (od.id || '')); continue; }
        const o = Object.assign({ type: od.kind, od, sid: def.id + ':' + od.kind + ':' + (od.id || (at.tx + ',' + at.ty)) }, at);
        L.w2.objs.push(o);
        if (at.entry) L.w2.entries[od.kind + ':' + (od.id || '')] = at.entry;
      } catch (e) { console.error('[world] place ' + od.kind, e); }
    }
    // decorations keep away from our objects (art_city reads L.objects positions)
    for (const o of L.w2.objs) L.objects.push({ kind: 'w2', x: o.x, y: o.y });
    // start: the region's own start or the first exit
    const ent = L.w2.entries;
    if (!ent.start) ent.start = def.start ? def.start(L, H) : (ent[Object.keys(ent)[0]] || { x: L.spawn.x, y: L.spawn.y, face: 1 });
    // every entry stands on the floor below it
    for (const k in ent) { const e0 = ent[k], gy = L.groundBelow(e0.x, e0.y - 24, 600); if (gy != null) e0.y = gy; }
    const e = ent[g.entry] || ent.start;
    L.spawn = { x: e.x, y: e.y };
    L.w2.face = e.face || 1;
    L.computeSpots();
    if (L.depth) L.computeDepth();
    // the map keeps a small silhouette of the region (see 83)
    try { W2.silhouette(L, def.id); } catch (e2) { console.error('[world] silhouette', e2); }
  }
  W2._shape = shape;

  /* ---------------------------------------------------------------- populate: persistence of the living */
  {
    const pop0 = G.Game.populate;
    G.Game.populate = function (L, plan) {
      if (!plan || !plan.world) return pop0.apply(this, arguments);
      const s = S();
      W2.active = plan.region; W2.inside = plan.type === 'rest' ? plan.chai : null;
      // remember which spawn point each enemy came from (populate goes through spawns in order)
      const sp0 = G.Enemies.spawn;
      let k = 0, rec = [];
      G.Enemies.spawn = function () { const e = sp0.apply(this, arguments); rec.push(e); return e; };
      try { pop0.apply(this, arguments); } finally { G.Enemies.spawn = sp0; }
      if (plan.type !== 'level' || !s) return;
      const killed = new Set(s.killed[plan.region] || []);
      for (const e of rec) {
        if (!e) { k++; continue; }
        e._w2id = 's' + (k++);
        if (killed.has(e._w2id)) e.dead = true;
      }
      try { spawnObjects(L, plan); } catch (e) { console.error('[world] objects', e); }
      try { if (W2.nightSpawns) W2.nightSpawns(L, plan, killed); } catch (e) { console.error('[world] night', e); }
    };
  }
  function spawnObjects(L, plan) {
    if (!L.w2) return;
    for (const o of L.w2.objs) {
      const K = o.type === 'exit' ? (W2.kinds['exit_' + o.ex.kind] || W2.kinds.exit_street) : W2.kinds[o.type];
      if (K && K.spawn) { try { K.spawn(o, L, plan); } catch (e) { console.error('[world] spawn ' + o.type, e); } }
    }
    // the engine's own chests, caches and altars: a stable id from their tile, opened stays opened
    for (const it of G.world.interactables.slice()) {
      if (it._w2) continue;
      const tx = Math.floor(it.x / TS), ty = Math.floor((it.y - 1) / TS);
      if (it.art === 'chest') {
        const id = sid(plan.region, 'chest', tx, ty); it._w2 = id;
        if (W2.isOpen(id)) { it.open = true; it.interact = false; continue; }
        const u0 = it.onUse;
        it.onUse = function (p, self) { const r = u0.apply(this, arguments); if (self.open) W2.setOpen(id); return r; };
      } else if (it.art === 'scroll' || it.art === 'ydCache') {
        const id = sid(plan.region, 'cache', tx, ty); it._w2 = id;
        if (W2.taken(id)) { it.dead = true; continue; }
        const u0 = it.onUse;
        it.onUse = function () { W2.take(id); return u0.apply(this, arguments); };
      }
    }
  }
  W2.spawnObjects = spawnObjects;
  // a killed enemy stays dead until the hero rests (minibosses stay dead for good)
  G.Events.on('kill', e => {
    if (!W2.on() || !e || !e._w2id) return;
    const s = S(), reg = W2.active;
    if (!reg) return;
    if (e._w2mb) { s.mb[e._w2mb] = 1; save(); W2.autosave(); return; }
    const a = s.killed[reg] || (s.killed[reg] = []);
    if (!a.includes(e._w2id)) a.push(e._w2id);
  });
  W2.respawnAll = () => { const s = S(); if (s) s.killed = {}; };

  /* ---------------------------------------------------------------- arriving */
  // runs before 90_wire's stageStart handler (checkpoint, Sado's wisp): the hero must already stand at the entry
  G.Events.on('stageStart', (plan, biome, L) => {
    W2.busy = false;
    const was = W2.active;
    W2.active = null; W2.inside = null;
    if (!plan || !plan.world || !S()) return;
    const s = S(), def = W2.regions[plan.region];
    if (!def) return;
    W2.active = def.id;
    W2.inside = plan.type === 'rest' ? plan.chai : null;
    const pl = G.world && G.world.player;
    if (pl && L && L.w2) pl.facing = L.w2.face || 1;
    if (plan.type === 'rest') {
      const ch = W2.chaiDef(plan.chai);
      G.Game.stage.landName = N(ch ? ch.name : `Chaikhana|Чайхана|Choyxona`);
      if (ch && !s.chai[ch.id]) { s.chai[ch.id] = 1; toast(t(`A new chaikhana: you can travel here.|Новая чайхана: сюда можно перемещаться.|Yangi choyxona: bu yerga ko'chib o'tish mumkin.`), '#ffe7a6'); }
    } else {
      G.Game.stage.landName = N(def.name);
      const first = !s.visited[def.id];
      s.visited[def.id] = s.visited[def.id] || Date.now();
      if (first && G.CH && G.CH.addXp) { try { G.CH.addXp(50, 'explore'); } catch (e) { /* ignore */ } }
    }
    s.cur.region = def.id;
    save();
    for (const f of W2.hooks.enter) { try { f(def, plan, L, was); } catch (e) { console.error('[world] enter hook', e); } }
  });
  // the stage card names the region
  ON_STAGE.push((plan) => {
    if (!plan || !plan.world || !S()) return;
    const def = W2.regions[plan.region];
    const card = G.UI._debug().card;
    if (!card || !def) return;
    if (plan.type === 'rest') {
      const ch = W2.chaiDef(plan.chai);
      card.title = N(ch ? ch.name : `Chaikhana|Чайхана|Choyxona`); card.sub = N(def.name); card.label = N(`REST|ПРИВАЛ|DAM OLISH`);
    } else {
      const tier = W2.tiers.find(x => x.id === def.tier);
      card.title = N(def.name); card.sub = N(def.sub || ''); card.label = tier ? N(tier.name) : '';
      if (S().cur._quiet) { card.delay = 0; card.t = card.life || 999; }
    }
  });

  /* ---------------------------------------------------------------- leaving */
  // go(region, entry, {inside}) — fade out, remember where we go, load (the engine's own deferred loader)
  W2.go = (region, entry, o) => {
    o = o || {};
    if (W2.busy || !S()) return false;
    if (!W2.regions[region]) { console.warn('[world] no region', region); return false; }
    const s = S();
    W2.busy = true;
    const pl = G.world && G.world.player;
    if (pl) { G.run.hp = pl.hp; if (pl.state !== 'dead') { pl.setState('door'); pl.invulnT = 999; } }
    for (const f of W2.hooks.leave) { try { f(W2.active, region, entry); } catch (e) { console.error('[world] leave hook', e); } }
    W2.flushSeen && W2.flushSeen();
    s.cur = { region, entry: entry || 'start', inside: o.inside || null };
    save();
    sfx(o.sfx || 'door');
    const pi = o.inside ? W2.WRI : W2.WPI;
    if (o.now) { G.Game.deferLoad(pi); return true; }
    G.Game.fadeTo(() => G.Game.deferLoad(pi), o.speed || 0.035);
    return true;
  };
  // the engine's gate in a chaikhana interior leads back out into the region
  {
    const ex0 = G.Game.exitStage;
    G.Game.exitStage = function () {
      if (W2.on()) {
        if (W2.inside) { const ch = W2.chaiDef(W2.inside); W2.go(ch.region, 'chai:' + ch.id); return; }
        const def = W2.regions[W2.active];
        if (def && def.arena && def.out) W2.go(def.out[0], def.out[1]);
        return;
      }
      return ex0.apply(this, arguments);
    };
  }
  // death: back to the last chaikhana rested at; ordinary enemies come back (minibosses do not)
  {
    const rt0 = G.Game.retryStage;
    G.Game.retryStage = function () {
      if (W2.on()) {
        const s = S();
        W2.respawnAll();
        if (s.bench && W2.chaiDef(s.bench.chai)) { const ch = W2.chaiDef(s.bench.chai); s.cur = { region: ch.region, entry: 'chai:' + ch.id, inside: null }; }
        else s.cur = { region: s.cur.region, entry: 'start', inside: null };
        W2.stats.deaths++;
        save();
      }
      return rt0.apply(this, arguments);
    };
  }
  // the Oath: the lost tumar belongs to the region where he fell
  let tumarStash = null;
  G.Events.on('state', st => {
    if (st !== 'dead' || !W2.on()) return;
    try { if (typeof lostTumar !== 'undefined' && lostTumar) lostTumar.region = W2.active; } catch (e) { /* ignore */ }
  });
  W2.hooks.enter.push(def => {
    try {
      if (typeof lostTumar === 'undefined') return;
      if (lostTumar && lostTumar.region && lostTumar.region !== def.id) { tumarStash = lostTumar; lostTumar = null; if (G.run) G.run.gold = 0; }
      else if (!lostTumar && tumarStash && tumarStash.region === def.id) { lostTumar = tumarStash; tumarStash = null; lostTumar.pi = G.run.planIndex; }
    } catch (e) { /* ignore */ }
  });

  /* ---------------------------------------------------------------- saving */
  // the checkpoint (autosave) is the journey as it is now, and where the hero will wake: the last entry or chaikhana
  let asPending = false;
  W2.autosave = () => {
    if (!W2.on() || asPending) return;
    asPending = true;
    setTimeout(() => { asPending = false; try { if (W2.on() && G.Game.state === 'play' && !R().ended) { W2.flushSeen && W2.flushSeen(); checkpoint(); } } catch (e) { console.error('[world] autosave', e); } }, 0);
  };
  {
    const sm0 = G.SAVE_MENU;
    G.SAVE_MENU = function () { if (W2.on()) { try { W2.flushSeen && W2.flushSeen(); checkpoint(); } catch (e) { console.error(e); } } return sm0.apply(this, arguments); };
  }

  /* ---------------------------------------------------------------- a new journey into the open world */
  W2.startNew = (o) => {
    o = o || {};
    if (o.diff) pendingDiff = o.diff;
    G.newRun({ mode: o.mode || 'wanderer' });
    const r = R();
    r.world = blankWorld();
    r.f.sado = 1;                       // the world begins after the prologue: Sado is awake
    if (o.region) r.world.cur = { region: o.region, entry: o.entry || 'start', inside: null };
    if (o.keys) for (const k of o.keys) r.world.keys[k] = 1;
    for (const id in W2.regions) r.world.seeds[id] = W2.regions[id].seed || 1;
    for (const f of W2.hooks.newWorld || []) { try { f(r.world); } catch (e) { console.error(e); } }
    save();
    G.ENDING_TITLE = null;
    G.Game.loadStage(W2.WPI);
  };
  W2.hooks.newWorld = [];
  // main menu: "The open city (preview)"; ?world[=region] starts there directly
  const MENU_LABEL = () => t(`The Open City (preview)|Открытый город (пробная версия)|Ochiq shahar (sinov)`);
  function menuWorld() {
    const M = G.MAIN_MENU;
    if (!Array.isArray(M)) return;
    const i = M.findIndex(x => x && x.act === 'world');
    // stage 5: "New journey" plays the whole story in the open city; the preview entry is gone (?world stays for tests)
    if (W2.noPreview) { if (i >= 0) M.splice(i, 1); return; }
    if (i >= 0) { M[i].label = MENU_LABEL(); return; }
    const at = M.findIndex(x => x && x.label === 'Новый поход');
    M.splice(at < 0 ? M.length : at + 1, 0, { label: MENU_LABEL(), act: 'world' });
  }
  G.Events.on('boot', () => {
    const ma0 = G.MENU_ACT;
    G.MENU_ACT = act => {
      if (act === 'world') {
        const go = () => G.Game.fadeTo(() => { try { W2.startNew({ mode: 'wanderer' }); } catch (e) { console.error(e); } }, 0.035);
        if (G.MODE_PICK) G.MODE_PICK('wanderer', go); else go();
        return true;
      }
      return ma0 ? ma0(act) : false;
    };
    menuWorld();
    const q = new URLSearchParams(location.search);
    if (q.has('world') && !q.has('stage')) setTimeout(() => {
      const v = q.get('world');
      W2.startNew({ mode: 'wanderer', region: W2.regions[v] ? v : null, keys: (q.get('keys') || '').split(',').filter(Boolean) });
    }, 30);
  });
  G.Events.on('state', st => { if (st === 'title') menuWorld(); });
  LANG.onChange(menuWorld);

  /* ---------------------------------------------------------------- per-frame */
  W2.stats = { loads: 0, deaths: 0, lastLoadMs: 0 };
  TICK.push(() => {
    if (!W2.on() || !W2.active) return;
    const s = S();
    for (const f of W2.ticks) { try { f(s); } catch (e) { console.error('[world] tick', e); } }
  });
  W2.ticks = [];

  /* ---------------------------------------------------------------- the objective line (HUD, 81) */
  W2.objective = text3 => { const s = S(); if (!s) return; s.obj = text3 || null; save(); };
  // quest marks on the map: kind = 'quest' | 'trade' | 'person' | 'pin'
  W2.mark = (id, region, x, y, kind, label) => { const s = S(); if (!s) return; if (region == null) delete s.marks[id]; else s.marks[id] = { region, x, y, kind: kind || 'quest', label: label || null }; save(); };
  W2.unmark = id => W2.mark(id, null);
  // the new moon: moves only by story milestones (stage 5 calls this)
  W2.moonPhase = () => { const s = S(); return s ? s.moon : 0; };
  W2.advanceMoon = () => { const s = S(); if (!s) return; s.moon = Math.min(3, (s.moon || 0) + 1); save(); for (const f of W2.hooks.moon || []) { try { f(s.moon); } catch (e) { console.error(e); } } };
  W2.hooks.moon = [];

  /* ---------------------------------------------------------------- story hooks (stage 5 attaches the story here) */
  // W2.onEnter(region, fn(def, {first, from, plan, level}))  — every arrival in a region (after the engine's stageStart)
  // W2.trigger(region, spot, {r, once, when}, fn(done))       — a scene when the hero comes near a named spot (or {x,y} px);
  //   once: a key in R().at (default region:spot) so it plays once per journey; when(): extra condition
  const enterFns = [], triggers = [];
  W2.onEnter = (region, fn) => enterFns.push({ region, fn });
  W2.trigger = (region, spot, o, fn) => triggers.push({ region, spot, o: o || {}, fn });
  ON_STAGE.push((plan, biome, L) => {
    if (!plan || !plan.world || plan.type !== 'level' || !S()) return;
    const def = W2.regions[plan.region], s = S();
    const first = !s.entered || !s.entered[def.id];
    s.entered = s.entered || {}; s.entered[def.id] = (s.entered[def.id] || 0) + 1;
    for (const e of enterFns) if (e.region === def.id || e.region === '*') { try { e.fn(def, { first, plan, level: L }); } catch (err) { console.error('[world] onEnter', err); } }
    for (const tr of triggers) {
      if (tr.region !== def.id) continue;
      const key = tr.o.once === false ? null : (tr.o.once || ('w2t:' + def.id + ':' + (typeof tr.spot === 'string' ? tr.spot : tr.spot.x)));
      if (key && R().at[key]) continue;
      const pos = typeof tr.spot === 'string' ? ((L.w2.spots && L.w2.spots[tr.spot]) || L.w2.entries[tr.spot]) : tr.spot;
      if (!pos) { console.warn('[world] trigger: no spot', def.id, tr.spot); continue; }
      const r = tr.o.r || 48;
      const ent = new G.Entity(pos.x, pos.y); ent.layer = -9;
      ent.update = () => {
        const p = G.world.player;
        if (!p || ent.fired || busy || !quiet()) return;
        if (Math.abs(p.x - pos.x) > r || Math.abs(p.y - pos.y) > r * 1.5) return;
        if (tr.o.when && !tr.o.when()) return;
        ent.fired = true;
        if (key) { R().at[key] = 1; save(); }
        scene(done => tr.fn(done, def));
        if (tr.o.once === false) setTimeout(() => { ent.fired = false; }, 3000);
      };
      G.world.add(ent);
    }
  });
  // tests and stage 5: where is he
  W2.where = W2.where || null;
  W2.debug = () => { const s = S(); return s && { cur: s.cur, active: W2.active, inside: W2.inside, clock: s.clock, keys: s.keys, open: Object.keys(s.open).length }; };
}
