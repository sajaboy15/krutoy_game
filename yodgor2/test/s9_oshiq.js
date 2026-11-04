// Oshiq (89i): a whole game against a Bazaar opponent by keys; the result pays the stake; a screenshot of the board.
//   node test/s9_oshiq.js [lang=ru]
const T = require('./s6_lib');
const lang = process.argv[2] || 'ru';
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'bazaar', lang, viewport: { width: 1920, height: 1080 } });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const res = [];
  for (let g = 0; g < 3; g++) {
    await W(() => { G.run.gold = 200; G.WORLD2.setHour(12); G.WORLD2.syncPeople(); const o = G.world.ents.find(e => e._w2npc === 'osh_kamol' && !e.dead); const pl = G.world.player; pl.x = o.x - 16; pl.y = o.y; o.onUse(pl, o); });
    await T.drain(p, [], { pick: (opts) => { const i = opts.findIndex(o => /ковёр|carpet|gilam/.test(o)); return i >= 0 ? i : null; }, max: 6 });
    let shot = false;
    for (let k = 0; k < 40; k++) {
      const st = await W(() => G.OSHIQ.G.open ? G.OSHIQ.G.phase : 'closed');
      if (st === 'closed') break;
      if (st === 'choose') { await p.keyboard.press('Space'); await T.tick(p, 2); if (!shot && g === 0) { await p.screenshot({ path: (process.env.YODGOR_SHOTS || '/tmp/shots') + '/oshiq.png' }); shot = true; } }
      await p.keyboard.press('Enter'); await T.tick(p, 4);
    }
    await T.drain(p, []);
    res.push(await W(() => ({ gold: G.run.gold, wins: JSON.stringify(G.OSHIQ.S().wins), coll: Object.keys(G.OSHIQ.S().coll).length })));
  }
  console.log(JSON.stringify(res), p._errs.slice(0, 4), (await T.untranslated(p)).slice(0, 5));
  await b.close();
})();
