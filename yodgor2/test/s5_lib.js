// Stage 5 test helpers: the story in the open city. Built on s4_lib (world) and lib (dialogs).
const L = require('./s4_lib');
const W = (p, f, a) => p.evaluate(f, a);

// watch every text that goes through the text hook: untranslated strings per language
async function watchText(p) {
  await W(p, () => {
    const T = window.__T, bad = window.__BAD = new Map();
    const ok = /^(SPACE|ENTER|ESC|TAB|SHIFT|V1\.0|J \/ LMB|K \/ RMB|LMB|RMB|SEL|START|\[J\].*|[A-Z]?\d.*)$/;
    window.__T = s => { const r = T(s); try { if (typeof r === 'string' && r.length > 1) {
      const lg = G.LANG.lang;
      if (lg !== 'ru' && /[А-Яа-яЁё]/.test(r)) bad.set(r, (bad.get(r) || 0) + 1);
      if (lg === 'ru' && /[A-Za-z]{4,}/.test(r) && !/[А-Яа-яЁё]/.test(r) && !ok.test(r)) bad.set(r, (bad.get(r) || 0) + 1);
    } } catch (e) {} return r; };
  });
}
const untranslated = p => W(p, () => [...(window.__BAD || new Map()).keys()].slice(0, 60));

// play out dialogs; choices by strategy ('first' | 'last' | 'mix'), or by a picker(options, title) -> index|null
async function drain(p, log, o) {
  o = o || {};
  const seen = {};
  for (let i = 0; i < (o.max || 500); i++) {
    await L.tick(p, 8);
    const m = await L.modal(p);
    if (!m) { await L.tick(p, 10); if (!(await L.modal(p))) return; continue; }
    if (m.type === 'choice') {
      await L.tick(p, 14);
      const cols = await W(p, () => G.UI._debug().modal.options.map(o => o.color));
      const okIdx = m.options.map((_, k) => k).filter(k => cols[k] !== '#7a7080');
      let sel = o.pick ? o.pick(m.options, m.title || '', okIdx) : null;
      if (sel == null) { const st = o.strat || 'first'; sel = st === 'first' ? okIdx[0] : st === 'last' ? okIdx[okIdx.length - 1] : okIdx[(i * 7 + 3) % okIdx.length]; }
      // a shop or a box that would sell forever: after two rounds take the way out (the last option)
      const key = (m.title || '') + '|' + m.options.length;
      seen[key] = (seen[key] || 0) + 1;
      if (seen[key] > 2 && o.pick && o.pick(m.options, m.title || '', okIdx) != null) seen[key] = 0;
      else if (seen[key] > 2) sel = okIdx[okIdx.length - 1];
      if (log) log.push('? ' + (m.title || '').slice(0, 60) + ' -> ' + m.options[sel]);
      await W(p, s => { G.UI._debug().modal.sel = s; }, sel);
      await L.press(p, 'Enter'); await L.tick(p, 20);
      continue;
    }
    if (log && m.type === 'dialog' && m.page === 0 && m.src) { const tag = (m.speaker || '-') + ': ' + String(m.src[0] || '').slice(0, 70); if (log[log.length - 1] !== tag) log.push(tag); }
    await L.press(p, 'Enter'); await L.press(p, 'Enter');
  }
}
const story = p => W(p, () => G.WORLD2.story.debug());

// the way through the region graph to `goal` as things stand (keys, story locks); exits only, no teleports
async function pathTo(p, goal) {
  return W(p, goal => {
    const W2 = G.WORLD2, from = W2.active, prev = { [from]: null }, q = [from];
    const ok = ex => ex.to && W2.regions[ex.to[0]] && !W2.regions[ex.to[0]].arena && !W2.shutWhy(ex) && (!ex.key || W2.can(ex.key));
    while (q.length) {
      const r = q.shift(); if (r === goal) break;
      for (const id in W2.regions[r].exits) { const ex = W2.regions[r].exits[id]; if (!ok(ex)) continue; const to = ex.to[0]; if (prev[to] === undefined) { prev[to] = [r, id]; q.push(to); } }
    }
    if (prev[goal] === undefined) return null;
    const hops = []; let c = goal; while (prev[c]) { hops.unshift(prev[c]); c = prev[c][0]; }
    return hops;
  }, goal);
}
// use an exit object of the active region the way the player would (stand on it, use it)
async function useExit(p, id) {
  return W(p, id => {
    const W2 = G.WORLD2, Lv = G.level, def = W2.regions[W2.active], ex = def.exits[id];
    if (!ex) return 'no exit ' + id;
    const o = Lv.w2.objs.find(o => o.type === 'exit' && o.ex.id === id);
    const lbl = G.LANG.t(ex.label || ex.prompt || '___'), pr = ex.prompt ? G.LANG.t(ex.prompt) : null;
    let it = o && G.world.interactables.find(i => Math.abs(i.x - o.x) < 5 && Math.abs(i.y - o.y) < 5 && i.onUse);
    if (!it) it = G.world.interactables.find(i => i._w2 && i.onUse && i.prompt && (i.prompt === lbl || (pr && i.prompt === pr) || i.prompt.indexOf(lbl) >= 0));
    if (!it) return 'no object for ' + id;
    const pl = G.world.player; pl.x = it.x; pl.y = it.y - 1; pl.vx = pl.vy = 0;
    it.onUse(pl, it);
    return 'ok';
  }, id);
}
async function travel(p, goal, log) {
  for (let guard = 0; guard < 14; guard++) {
    const i = await L.info(p);
    if (i.region === goal && !i.inside) return true;
    if (i.inside) { await W(p, () => G.Game.exitStage()); await L.settle(p, 120); await drain(p, log); continue; }
    const hops = await pathTo(p, goal);
    if (!hops || !hops.length) { if (log) log.push('!! no path ' + i.region + ' -> ' + goal); return false; }
    const r = await useExit(p, hops[0][1]);
    if (r !== 'ok') { if (log) log.push('!! ' + r); return false; }
    await L.tick(p, 4); await drain(p, log); await L.settle(p, 120); await drain(p, log);
  }
  return false;
}
// a chapter's people: stand among them, let their scene play
async function meetPeople(p, log, o) {
  await drain(p, log, o);
  for (let k = 0; k < 6; k++) {
    const r = await W(p, () => {
      const g = G.world.ents.filter(i => i.art === 'person' && !i.dead && !i.interact);   // the chapter's people (not in the interactables list)
      if (!g.length) return 0;
      const last = g[g.length - 1], pl = G.world.player; pl.x = last.x; pl.y = last.y - 1; pl.vx = pl.vy = 0; return g.length;
    });
    await L.tick(p, 30); await drain(p, log, o);
    const id = await W(p, () => G.WORLD2.story.LAND_AT[G.WORLD2.active]);
    if (!id || (await W(p, id => G.WORLD2.story.done(id), id))) return true;
    if (!r) await L.tick(p, 60);
  }
  return false;
}
async function enterChai(p, chai, log) {
  const r = await W(p, chai => { const d = G.world.interactables.find(i => i.art === 'w2chaiDoor' && i.prompt && i.prompt.indexOf(G.LANG.t(G.WORLD2.chaiDef(chai).name)) >= 0); if (!d) return 'no door'; const pl = G.world.player; pl.x = d.x; pl.y = d.y - 1; d.onUse(pl, d); return 'ok'; }, chai);
  if (r !== 'ok') return r;
  await L.tick(p, 4); await drain(p, log); await L.settle(p, 120); await L.tick(p, 140); await drain(p, log);
  return 'ok';
}
async function useArt(p, art, log, o) {
  const r = await W(p, art => { const it = G.world.interactables.find(i => i.art === art && i.interact !== false && i.onUse); if (!it) return 'none'; const pl = G.world.player; pl.x = it.x - 10; it.use ? it.use(pl) : it.onUse(pl, it); return 'ok'; }, art);
  await L.tick(p, 10); await drain(p, log, o);
  return r;
}
// a lair: walk in until the boss wakes, let it speak, end it, let its last scene play, walk out
async function fightBoss(p, log, o) {
  await drain(p, log, o);
  for (let i = 0; i < 120; i++) { if (await W(p, () => !!G.Game.stage.bossStarted)) break; await W(p, () => { G.world.player.x += 8; }); await L.tick(p, 2); }
  await L.tick(p, 30); await drain(p, log, o); await L.tick(p, 200);
  const name = await W(p, () => { const bz = G.Game.boss; if (!bz) return null; bz.hp = 0; bz.dead = true; return bz.def && bz.def.id; });
  await L.tick(p, 300); await drain(p, log, o); await L.tick(p, 60); await drain(p, log, o);
  return name;
}
async function leaveLair(p, log, o) {
  if (await W(p, () => G.YODGOR.run.ended)) return;
  await W(p, () => G.Game.exitStage()); await L.tick(p, 10); await drain(p, log, o); await L.settle(p, 160); await drain(p, log, o);
}
module.exports = Object.assign({}, L, { W, watchText, untranslated, drain, story, pathTo, useExit, travel, meetPeople, enterChai, useArt, fightBoss, leaveLair });
