/* =====================================================================
   Story API. Content files describe lands, rests and bosses as data:

   LAND(id, {
     biome, act, name, sub,                 // name/sub: three-language strings
     start: [lines] | fn(done),             // optional scene when the land opens (after the card)
     barks: { start: [...], mid: [...] },   // Sado subtitles: on arrival, in the middle of the land
     stones: [text | {who, text}],          // memory stones in this land
     memory: { id, title, lines, clue },    // Ravshan's lost memory hidden here (lowers Hollowness)
     people: [{ look, name, x? }],          // the group standing before the gate
     exit(done)                             // their scene; runs when he walks up to them
   })
   REST(id, { rustam(done), turab(done), farrukh(done), extra(done), barks, next })
   BOSS(id, { name, title, quote, pre: [lines], post(done), deaths: [...] })
   ===================================================================== */
const ORIG = { showLore: G.Game.showLore, offerPerk: G.Game.offerPerk };
const LANDS = {}, RESTS = {}, BOSSES = {};
const LAND = (id, def) => { LANDS[id] = Object.assign({ id }, def); };
const REST = (id, def) => { RESTS[id] = Object.assign({ id }, def); };
const BOSS = (id, def) => { BOSSES[id] = Object.assign({ id }, def); };
const curPlan = () => (G.Game.stage && G.Game.stage.plan) || null;
// stage 5: in the open city the plan entry is the region's ('w_region'); the story director (85c) says
// which land lives in the active region (G.STORY_LAND) and which rest is served in this chaikhana (G.STORY_REST)
const curLand = () => { if (G.STORY_LAND) { const p = curPlan(); if (p && p.world) { const id = G.STORY_LAND(); return id ? LANDS[id] : null; } } const p = curPlan(); return p && LANDS[p.id]; };
const curRest = () => { const p = curPlan(); if (p && p.world && G.STORY_REST) { const id = G.STORY_REST(); return id ? RESTS[id] : null; } return p && RESTS[p.id]; };
// keys of one-time scenes: by the land / rest / boss id (they used to be plan indices)
const sceneKey = (what, id) => what + ':' + id;

/* ---------- names on the card and the map ---------- */
function applyNames() {
  const B = G.Biomes && G.Biomes.defs;
  for (const id in LANDS) {
    const L = LANDS[id];
    if (!L.biome || !B || !B[L.biome]) continue;
  }
  for (const id in BOSSES) {
    const b = BOSSES[id], E = G.Enemies && G.Enemies.defs && G.Enemies.defs[b.engineId || id];
    if (E) { if (b.name) E.name = N(b.name); if (b.title) E.title = N(b.title); }
    if (S.bosses) S.bosses[b.engineId || id] = Object.assign({}, S.bosses[b.engineId || id] || {}, { name: b.name && N(b.name), title: b.title && N(b.title), quote: b.quote && N(b.quote) });
  }
}
// the card shows the land's own name, not the biome's
ON_STAGE.push(plan => {
  const L = LANDS[plan.id], card = G.UI._debug().card;
  if (card) {
    const name = L ? L.name : plan.type === 'rest' ? (RESTS[plan.id] && RESTS[plan.id].name) : plan.type === 'boss' ? (BOSSES[plan.boss] && BOSSES[plan.boss].lair) : null;
    const sub = L ? L.sub : plan.type === 'rest' ? (RESTS[plan.id] && RESTS[plan.id].sub) : plan.type === 'boss' ? (BOSSES[plan.boss] && BOSSES[plan.boss].lairSub) : null;
    if (name) card.title = N(name);
    if (sub) card.sub = N(sub);
    card.label = G.STAGE_LABEL(plan);
  }
  if (G.Game.stage && G.Game.stage.biome && name0(plan)) G.Game.stage.landName = N(name0(plan));
});
const name0 = plan => { const L = LANDS[plan.id]; return L ? L.name : plan.type === 'rest' ? RESTS[plan.id] && RESTS[plan.id].name : BOSSES[plan.boss] && BOSSES[plan.boss].lair; };

/* ---------- people before the gate ---------- */
function findDoor() {
  const w = G.world;
  return w && w.interactables && w.interactables.find(o => o.art === 'door');
}
function spawnPeople(L) {
  const door = findDoor();
  if (!door || !L.people || !L.people.length) return;
  spawnPeopleAt(L, { x: door.x - 70, y: door.y });
}
// the group stands left of pos (o.side -1: to the right); walking up to them plays L.exit once (key exit:<land>).
// o.when(): an extra gate (the milestone warning); o.after(): runs after their scene (the world marks the chapter done)
function spawnPeopleAt(L, pos, o) {
  o = o || {};
  const group = [];
  const side = o.side || 1;
  L.people.forEach((p, i) => {
    const x = pos.x - side * (p.x != null ? p.x : i * 15);
    const it = new G.Interactable(x, pos.y, { art: 'person', w: 14, h: 30, look: p.look, phase: i * 37, face: p.face, lamp: p.lamp });
    it.interact = false; it.layer = -1;
    G.world.add(it);
    group.push(it);
  });
  const near = group[group.length - 1];
  const key = sceneKey('exit', L.id);
  let hold = 0;
  TICK_STAGE.push(() => {
    if (R().at[key] || busy || hold-- > 0) return;
    const pl = G.world && G.world.player;
    if (!pl || !quiet()) return;
    if ((Math.abs(pl.x - (near.x - side * 30)) < 40 || (o.any && group.some(g => Math.abs(pl.x - g.x) < 34))) && Math.abs(pl.y - near.y) < 60) {
      if (o.when && !o.when(() => { hold = 0; }, () => { hold = 240; })) { hold = 99999; return; }
      R().at[key] = 1; save();
      for (const g of group) g.talking = true;
      scene(done => L.exit(() => { for (const g of group) g.talking = false; done(); }), () => { if (o.after) o.after(group); });
    }
  });
  if (L.peopleAfter) L.peopleAfter(group);
  return group;
}
const TICK_STAGE = [];
TICK.push(() => { for (const f of TICK_STAGE) f(); });
ON_STAGE.unshift(() => { TICK_STAGE.length = 0; });

/* ---------- lost memories ---------- */
G.ObjArt.lostMemory = (ctx, o) => {
  const k = Math.sin((G.time || 0) * 2.4) * 2;
  const x = Math.round(o.x), y = Math.round(o.y - 14 + k);
  ctx.fillStyle = '#ffe2a8';
  for (let i = 0; i < 6; i++) ctx.fillRect(x - 5 + i, y - 4 + i, 11 - 2 * i, 1);
  ctx.fillStyle = '#fff8e8'; ctx.fillRect(x, y - 2, 1, 1);
};
G.ObjArt.lostMemoryFx = (ctx, o) => { try { G.Light.add(o.x, o.y - 14, 46, '#ffd890', 0.55); G.Glow.add(o.x, o.y - 14, 18, '#ffe2a8', 0.5); } catch (e) { /* ignore */ } };
function placeMemory(L, level, at) {
  const m = L.memory;
  if (!m || R().mem[m.id]) return;
  // a quiet floor spot about two thirds into the land (or the region's own memory spot)
  const spots = (level.spots && level.spots.floor) || [];
  let best = at || null;
  const want = level.pw * 0.62;
  if (!best) for (const s of spots) {
    const x = (s.x != null ? s.x : s.tx * G.TS), y = (s.y != null ? s.y : s.ty * G.TS);
    if (!best || Math.abs(x - want) < Math.abs(best.x - want)) best = { x, y };
  }
  if (!best) return;
  const o = new G.Interactable(best.x, best.y, {
    art: 'lostMemory', w: 14, h: 22,
    prompt: t(`Touch the tumar|Коснуться тумара|Tumarga tegish`),
    onUse: (pl, obj) => {
      if (obj.usedUp || busy) return true;
      obj.usedUp = true; obj.dead = true; wisp.target = null;
      R().mem[m.id] = 1; saga.mem[m.id] = 1; R().clues = (R().clues || 0) + 1; save();
      sfx('scroll');
      scene(done => play(m.lines, () => { addVoid(-6, `a memory returns|память вернулась|xotira qaytdi`); if (G.PROG) G.PROG.onMemory(m.id); if (m.after) m.after(); done(); }));
      return true;
    }
  });
  G.world.add(o);
  let told = false;
  TICK_STAGE.push(() => {
    if (o.dead) return;
    const pl = G.world && G.world.player;
    if (!pl) return;
    const d = Math.abs(pl.x - o.x) + Math.abs(pl.y - o.y) * 0.5;
    if (d < 260) { wisp.target = o; if (!told && sadoAwake()) { told = true; bark('memoryNear'); } } else if (wisp.target === o) wisp.target = null;
  });
}

/* ---------- memory stones ---------- */
G.Game.showLore = function (lvl, obj) {
  const L = curLand();
  let list = L && L.stones, id = L && L.id;
  // a region with no chapter of its own keeps its own stones (85a)
  if ((!list || !list.length) && G.STORY_STONES) { const rs = G.STORY_STONES(); if (rs) { list = rs.list; id = rs.id; } }
  if (!list || !list.length) return ORIG.showLore.apply(this, arguments);
  let entry = obj && obj._yod;
  if (!entry) {
    const i = saga.lore[id] || 0;
    entry = list[i % list.length];
    saga.lore[id] = i + 1; save();
    if (obj) obj._yod = entry;
  }
  let e = typeof entry === 'function' ? entry() : entry;
  if (typeof e === 'string') e = { text: e };
  if (obj && !obj.read && G.run && Array.isArray(G.run.lore)) { obj.read = true; G.run.lore.push(t(e.text)); }
  scene(done => play([[e.who || 'stone', e.text]].concat(e.then || []), done));
};

/* ---------- land start, middle ---------- */
ON_STAGE.push((plan, biome, level) => {
  if (plan.type === 'level') {
    const L = LANDS[plan.id];
    if (!L) return;
    try { spawnPeople(L); } catch (e) { console.error('[yodgor]', e); }
    try { placeMemory(L, level); } catch (e) { console.error('[yodgor]', e); }
    const door = findDoor();
    landScenes(L, door ? door.x * 0.5 : level.pw * 0.5);
  }
});
// the land's start scene, its barks, and the scene half way (midX in px); used by the linear prologue and the world
function landScenes(L, midX) {
  {
    if (L.start && !R().at[sceneKey('start', L.id)]) queue(() => stageT() > 90, () => {
      if (R().at[sceneKey('start', L.id)]) return;
      R().at[sceneKey('start', L.id)] = 1; save();
      if (typeof L.start === 'function') scene(L.start); else scene(done => play(L.start, done));
    });
    queue(() => stageT() > 260, () => bark(L.id + ':start'));
    if (midX != null) queue(() => { const pl = G.world.player; return pl && pl.x > midX; }, () => {
      bark(L.id + ':mid');
      if (L.mid && !R().at[sceneKey('mid', L.id)]) { R().at[sceneKey('mid', L.id)] = 1; save(); if (typeof L.mid === 'function') scene(L.mid); else scene(done => play(L.mid, done)); }
    });
  }
}

/* ---------- rests: Rustam, the bakhshi, Farrukh ---------- */
G.UI.story = function (next, npc) {
  if (busy || R().ended) return;
  const Rs = curRest();
  if (Rs && Rs.rustam) scene(Rs.rustam); else scene(done => play([['rustam', `…|…|…`]], done));
};
G.Game.offerPerk = function (obj) {
  const self = this, args = arguments;
  if (R().ended) return;
  const Rs = curRest();
  if (!obj || obj.usedUp || obj._yod || busy || !Rs || !Rs.turab || (Rs.turabIf && !Rs.turabIf())) return ORIG.offerPerk.apply(this, args);
  obj._yod = 1;
  scene(done => Rs.turab(done), () => ORIG.offerPerk.apply(self, args));
};
ON_STAGE.push(plan => {
  if (plan.type !== 'rest') return;
  const Rs = curRest();
  if (!Rs) return;
  const w = G.world;
  const m = w.interactables.find(o => o.art === 'merchant');
  if (m && Rs.farrukh) {
    m.interact = true;
    m.prompt = t(`Talk to Farrukh|Говорить с Фаррухом|Farrux bilan gaplashish`);
    m.onUse = () => { if (!busy && !R().ended) scene(Rs.farrukh); return true; };
  }
  const ak = w.interactables.find(o => o.art === 'aksakal');
  if (ak) ak.prompt = t(Rs.rustamPrompt || `Sit with Rustam-aka|Сесть рядом с Рустамом-ака|Rustam aka yoniga o'tirish`);
  const ka = sceneKey('arrive', Rs.id), kl = sceneKey('lullaby', Rs.id);
  if (Rs.arrive && !R().at[ka]) queue(() => stageT() > 80, () => { if (R().at[ka]) return; R().at[ka] = 1; save(); scene(Rs.arrive, () => { if (G.STORY_RESTED) G.STORY_RESTED(Rs.id); }); });
  else if (!Rs.arrive && G.STORY_RESTED) G.STORY_RESTED(Rs.id);
  if (Rs.lullaby) queue(() => stageT() > 700, () => {
    if (R().at[kl] || !sadoAwake()) return;
    R().at[kl] = 1; save();
    scene(Rs.lullaby);
  });
  queue(() => stageT() > 200, () => bark(Rs.id + ':start'));
  if (Rs.people) {
    const sp = level => null;
    Rs.people.forEach((p, i) => {
      const o = new G.Interactable(p.x, p.y || (G.world.player.y), { art: 'person', w: 14, h: 30, look: p.look, phase: i * 41, face: p.face, prompt: p.prompt ? t(p.prompt) : '' });
      o.interact = !!p.talk;
      if (p.talk) o.onUse = () => { if (!busy) scene(p.talk); return true; };
      G.world.add(o);
    });
  }
});

/* ---------- bosses ---------- */
G.Events.on('bossStart', boss => {
  const id = boss && boss.def && boss.def.id;
  const B = Object.values(BOSSES).find(b => (b.engineId || b.id) === id);
  if (!B || !B.pre) return;
  const first = !saga.boss['pre_' + B.id];
  saga.boss['pre_' + B.id] = 1; save();
  const lines = first ? B.pre : (B.again ? [[B.who || 'boss', pick(B.again)]] : null);
  if (!lines) return;
  CAST.boss = { name: B.name, portrait: B.portrait || null };
  play(lines, () => { if (G.UI.bossIntro && !boss.dead) G.UI.bossIntro(boss); });
});
G.Events.on('bossDefeated', boss => {
  const id = boss && boss.def && boss.def.id;
  const B = Object.values(BOSSES).find(b => (b.engineId || b.id) === id);
  const pi = PI(), key = sceneKey('post', B ? B.id : id);
  if (!B || !B.post || R().at[key] || R().ended) return;
  const at = stageT() + 110;
  queue(() => stageT() > at, () => {
    if (R().at[key]) return;
    R().at[key] = 1; save();
    // safe to leave the game now: the next stage (in the world: the way out of the lair) is saved
    scene(B.post, () => { if (G.STORY_BOSS_DONE && G.STORY_BOSS_DONE(B.id)) return; checkpoint(pi + 1); });
  });
});

/* ---------- endings ----------
   ENDING(id, { title, scene() -> lines, epilogue() -> [three-language slides] })
   finish(id) shows the epilogue screen; endGame(id) plays the ending scene first. */
const ENDINGS = {};
const ENDING = (id, def) => { ENDINGS[id] = def; };
const DEFAULT_EPILOGUE = [`This dream broke off mid-word. The Sleeper will see it again.|Этот сон оборвался на полуслове. Спящий увидит его снова.|Bu tush yarim so'zda uzildi. Uxlovchi uni yana ko'radi.`];
let epilogueSrc = DEFAULT_EPILOGUE;
const epilogueTags = new Map(); // three-language source -> { k: subject, v: variant, e: ending } (the slide painter reads S.epilogueKeys)
const refreshEpilogue = () => { S.epilogue = epilogueSrc.map(x => t(x)); S.epilogueKeys = epilogueSrc.map(x => epilogueTags.get(x) || null); };
refreshEpilogue();
const victoryIndex = () => { const i = (G.PLAN || []).findIndex(p => p.type === 'victory'); return i >= 0 ? i : G.PLAN.length; };
let endTitle = null;
function finish(id) {
  const E = ENDINGS[id] || {};
  try {
    const raw = (E.epilogue ? E.epilogue() : DEFAULT_EPILOGUE).filter(x => x && (typeof x === 'string' || x.text));
    epilogueTags.clear();
    epilogueSrc = raw.map(x => { if (typeof x === 'string') return x; epilogueTags.set(x.text, { k: x.k || '', v: x.v || id, e: x.e || id }); return x.text; });
  } catch (e) { console.error(e); epilogueSrc = DEFAULT_EPILOGUE; }
  refreshEpilogue();
  endTitle = E.title || null;
  G.ENDING_TITLE = endTitle ? t(endTitle) : null;
  saga.endings[id] = (saga.endings[id] || 0) + 1;
  R().ended = id; save();
  busy = false; Q.length = 0;
  G.Game.fadeTo(() => G.Game.deferLoad(victoryIndex()), 0.03);
}
function endGame(id) {
  R().ended = id; save();
  const E = ENDINGS[id] || {};
  busy = true;
  play(E.scene ? E.scene() : [], () => finish(id));
}
ON_NEWRUN.push(() => { epilogueSrc = DEFAULT_EPILOGUE; refreshEpilogue(); endTitle = null; });
LANG.onChange(() => { refreshEpilogue(); if (endTitle) G.ENDING_TITLE = t(endTitle); });
