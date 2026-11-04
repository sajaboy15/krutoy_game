// World events (89k): force each event, drain it, check it is marked done. node test/s9_events.js
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang: 'uz' });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const ids = await W(() => G.EVENTS.list.map(e => [e.id, e.region]));
  const done = [];
  for (const [id, reg] of ids) {
    await W(r => G.WORLD2.go(r, 'start', { now: true, force: true }), reg); await T.settle(p, 60); await T.drain(p, []);
    for (const h of [12, 18, 23]) { if (await W(id => !!G.EVENTS.S().done[id], id)) break;
    await W(([id, h]) => { G.WORLD2.setHour(h); G.EVENTS.force(id); for (let i = 0; i < 40; i++) { G.debugTick(1); for (const f of G.WORLD2.ticks) f(G.WORLD2.S()); } }, [id, h]);
    await T.drain(p, []); }
    if (await W(id => !!G.EVENTS.S().done[id], id)) done.push(id);
  }
  console.log(JSON.stringify({ n: ids.length, done: done.length, miss: ids.map(x => x[0]).filter(x => !done.includes(x)) }), p._errs.slice(0, 4), (await T.untranslated(p)).filter(s => !/^Level|^Talk/.test(s)).slice(0, 5));
  await b.close();
})();
