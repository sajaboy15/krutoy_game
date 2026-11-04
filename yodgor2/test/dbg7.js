const L = require('./lib');
(async () => { const b = await L.chromium.launch();
  const p = await L.open(b, '');
  await L.tick(p, 60);
  await p.evaluate(() => { G.Game.startRun({ mode: 'souls' }); G.godMode = true; });
  await L.tick(p, 60);
  const st = () => p.evaluate(() => ({ s: G.Game.state, pi: G.run.planIndex, m: G.UI._debug().modal && (G.UI._debug().modal.type + ':' + (G.UI._debug().modal.title||G.UI._debug().modal.speaker||'')), load: G.Game.loading }));
  // jump to 7 using the game's own checkpoint path
  await p.evaluate(() => { G.run.planIndex = 6; G.Game.exitStage(); });
  for (let i = 0; i < 30; i++) { await L.tick(p, 20); const s = await st(); if (s.m) await L.press(p, 'Enter'); if (i % 5 == 0) console.log('a', JSON.stringify(s)); }
  await p.evaluate(() => { const pl = G.world.player; G.run.gold = 77; pl.x += 200; pl.hp = 0; pl.die({}); });
  for (let i = 0; i < 60; i++) { await L.tick(p, 10); if (await p.evaluate(() => G.Game.state === 'dead')) break; }
  console.log('dead', JSON.stringify(await st()));
  await p.evaluate(() => G.Game.fadeTo(() => G.Game.retryStage(), 0.05));
  for (let i = 0; i < 40; i++) { const t0 = Date.now(); await L.tick(p, 20); const s = await st(); console.log('b', i, Date.now() - t0, JSON.stringify(s)); if (s.m) { await L.press(p, 'Enter'); } }
  console.log(p._errs);
  await b.close(); })();
