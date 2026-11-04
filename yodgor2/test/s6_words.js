// Stage 6 — Oydin's fight ended with words in phase 3 (a Memory check), Sado stepping in at high trust.
const T = require('./s6_lib');
const W = (p, f, a) => p.evaluate(f, a);
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'dream', lang: 'uz' });
  const log = [], R = {};
  await W(p, () => { G.WORLD2.S().moon = 2; G.YODGOR.run.trust = 5; G.YODGOR.run.f.sado = 1; G.CH.S().attr.mem = 9; G.CH.dirty(); G.FAC.S().q.r6 = { st: 'active' }; G.FAC.flag('fight6', 'remember'); G.WORLD2.go('f_oydin', 'start', { force: true }); });
  await T.tick(p, 6); await T.settle(p, 300); await T.drain(p, log);
  await W(p, () => { const pl = G.world.player; for (let i = 0; i < 200 && !G.Game.stage.bossStarted; i++) { pl.x += 8; G.debugTick(2); } });
  await T.drain(p, log); await T.tick(p, 150); await T.drain(p, log);
  await W(p, () => { const bz = G.Game.boss; bz.hp = bz.maxHp * .55; G.BM.log.length = 0; });
  for (let i = 0; i < 30; i++) { await T.tick(p, 30); await W(p, () => { G.world.player.hp = G.world.player.maxHp; }); if (await W(p, () => G.BM.log.some(e => e.mv === 'sado'))) break; }
  R.sado = await W(p, () => G.BM.log.some(e => e.mv === 'sado'));
  await T.drain(p, log);
  await W(p, () => { const bz = G.Game.boss; bz.hp = bz.maxHp * .25; });
  for (let i = 0; i < 60; i++) {
    await T.tick(p, 20); await W(p, () => { G.world.player.hp = G.world.player.maxHp; });
    const m = await T.modal(p); if (m && m.type === 'choice') break;
  }
  await T.shot(p, 's6_oydin_words');
  await T.drainPick(p, log, [/Xotira 7|Xotira 5|Память|Memory/, /Olish|Take|Взять/]);
  await T.tick(p, 300); await T.drain(p, log); await T.tick(p, 60); await T.drain(p, log);
  R.flag = await W(p, () => G.FAC.flag('oydinWords')); R.q = await W(p, () => G.FAC.S().q.r6); R.cradle = await W(p, () => !!G.CH.S().legends.cradle);
  R.errs = p._errs.slice(0, 6); R.untr = await T.untranslated(p); R.log = log.slice(-14);
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
