// Stage 7b: the companions in the story. Joins (Alp after the fallen house, Surayyo at the dry aryk, Nargiza after the
// sermon), arc beats by region, every talk by the fire told once; page errors and untranslated text.
//   node test/s7b_comp.js [lang=ru]
const T = require('./s6_lib');
const lang = process.argv[2] || 'ru';
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const out = { steps: [] };
  const pick = (re) => (opts) => { const i = opts.findIndex(o => re.test(o)); return i >= 0 ? i : null; };
  const go = async r => { await W(r => G.WORLD2.go(r, 'start', { now: true, force: true }), r); await T.settle(p, 200); await T.drain(p, []); };
  const wait = async (n, o) => { const log = []; for (let i = 0; i < n; i++) { await T.tick(p, 30); await T.drain(p, log, o); } return log; };
  await W(() => { const r = G.YODGOR.run; r.at['done:a1_tail'] = 1; r.f.alp = 'helped'; G.run.gold = 500; });
  let log = await wait(6);
  out.steps.push({ alp: await W(() => G.PARTY.has('alp')), lines: log.length });
  // Surayyo: the dry aryk (pick "put your shoulder"), kill the Hollow, then she joins
  log = await wait(6, { pick: pick(/колесо|wheel|g'ildirak/) });
  await W(() => { for (const e of G.world.enemies) if (e._sur) { e.hp = 0; e.dead = true; } });
  log = log.concat(await wait(8));
  out.steps.push({ surayyo: await W(() => G.PARTY.has('surayyo')), lines: log.length });
  // Nargiza after the sermon, at the Cloister
  await W(() => { G.YODGOR.run.at['done:a1_cloister'] = 1; });
  await go('cloister'); log = await wait(6, { pick: pick(/Пошли|Come|Yur/) });
  out.steps.push({ nargiza: await W(() => G.PARTY.has('nargiza')), lines: log.length });
  // arc beats: karez (Nargiza 1), cloister books (Nargiza 2, Surayyo 2), mines (Alp 2)
  await go('karez'); log = await wait(6); out.steps.push({ karez: log.length });
  await go('cloister'); await W(() => { const q = G.level.w2.spots.books; if (q) { const pl = G.world.player; pl.x = q.x; pl.y = q.y; } }); log = await wait(10); out.steps.push({ books: log.length });
  await go('mines'); log = await wait(6); out.steps.push({ mines: log.length });
  out.arcs = await W(() => JSON.parse(JSON.stringify(G.COMP.S().arc)));
  // every talk by the fire, conditions aside
  const ids = await W(() => G.COMP.talks.map(d => d.id));
  let told = 0;
  for (const id of ids) {
    await W(id => { const d = G.COMP.talks.find(x => x.id === id); delete G.COMP.S().seen['t:' + id]; G.YODGOR.scene(done => G.COMP.runTalk(d, done)); }, id);
    const l = []; await T.drain(p, l, { pick: () => 0 }); if (l.length) told++;
  }
  out.talks = ids.length; out.told = told;
  out.errs = p._errs.slice(0, 6);
  out.untranslated = (await T.untranslated(p)).filter(s => !/^Level|^Уровень|^Talk to|walks with you/.test(s)).slice(0, 8);
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
