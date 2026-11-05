// The yodchi's book [L] (89l): kills fill the bestiary, a note is read, the page draws in every section. node test/s9_codex.js
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang: process.env.LANG2 || 'ru' });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const res = await W(() => {
    const D = G.Enemies.defs;
    for (let i = 0; i < 3; i++) G.Events.emit('kill', { def: D.yd_hollow, x: 0, y: 0 });
    G.Events.emit('kill', { def: D.jailer, x: 0, y: 0 });
    G.Events.emit('kill', { def: D.glutton, x: 0, y: 0, isBoss: true });
    const C = G.CODEX, B = C.BOOKS[0]; if (B) C.S().b[B.id] = 1;
    return { books: C.BOOKS.length, known: C.known('yd_hollow'), met: C.met('jailer'), boss: !!C.S().bs.glutton, mem: C.memList().length };
  });
  // a note in the Tail: read it; its cache appears on the next visit and teaches a recipe
  res.inWorld = await W(() => G.world.interactables.filter(o => o.art === 'w2book' || o.art === 'w2herb').map(o => o.art).join(','));
  await W(() => { const o = G.world.interactables.find(o => o.art === 'w2herb'); if (o) o.onUse(G.world.player, o); });
  await W(() => { const o = G.world.interactables.find(o => o.art === 'w2book'); if (o) o.onUse(G.world.player, o); });
  await T.drain(p, []);
  res.read = await W(() => Object.keys(G.CODEX.S().b));
  await W(() => { G.CODEX.S().b.tail_children = 1; G.WORLD2.go('tail', 'start', { now: true, force: true }); }); await T.settle(p, 80); await T.drain(p, []);
  res.cache = await W(() => { const o = G.world.interactables.find(o => o.art === 'w2cache'); if (!o) return 'none'; o.onUse(G.world.player, o); return 'ok'; });
  await T.drain(p, []);
  res.craft = await W(() => {
    const C = G.CRAFT, Y = G.YITEMS;
    Y.add('mat_sage', { n: 2 }); Y.add('mat_salt', { n: 2 }); Y.add('mat_food', { n: 3 });
    const a = C.make('r_water'), b = C.make('r_plov'), c = C.make('t_fire');
    const u = Y.list().find(e => e.id === 'al_water'); const used = u ? Y.use(u.u) : false;
    return { water: a, plov: b, fireLocked: c, used, isiriq: Y.count('mat_isiriq'), known: C.known(), antidote: C.isKnown('r_antidote') };
  });
  const shots = [];
  await W(() => { const r = G.YODGOR.run; r.met = { zebo: { r: 'tail', d: 2 }, maruf: { r: 'potters', d: 3 } }; G.FAC.S().jr.push({ id: 'sd12', t: 'Tea for three|Чай на троих|Uch kishilik choy', d: 2 }); });
  for (let s = 0; s < 7; s++) {
    await W(s => { G.CHUI.openPage('book'); G.CODEX.page.sec = s; G.CODEX.page.sel = s === 2 ? 1 : 0; }, s);
    await W(() => G.debugTick(0)); await W(() => G.debugTick(0));
    const f = process.env.SHOT_DIR ? require('path').join(process.env.SHOT_DIR, 'codex' + s + '.png') : null;
    if (f) { await p.screenshot({ path: f }); shots.push(f); }
  }
  console.log(JSON.stringify(res), shots.length, p._errs.slice(0, 4), (await T.untranslated(p)).filter(s => !/^Level|^Talk/.test(s)).slice(0, 6));
  await b.close();
})();
