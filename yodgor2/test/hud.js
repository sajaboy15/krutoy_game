const L = require('./lib');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '');
  await L.tick(p, 80);
  await L.press(p, 'Enter'); await L.tick(p, 30);
  await L.shot(p, 'modes');
  await L.press(p, 'Enter'); await L.tick(p, 30);
  await L.shot(p, 'diff');
  await p.evaluate(() => { G.UI._debug().modal.sel = 2; }); await L.press(p, 'Enter');
  await L.tick(p, 120);
  for (let i = 0; i < 8 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.tick(p, 40); }
  await L.tick(p, 200);
  const R = await p.evaluate(() => ({ mode: G.run.mode, diff: G.run.diffLevel, hpMul: G.diff.hpMul }));
  await p.evaluate(() => { G.YODGOR.set({ f: { sado: 1 } }); G.YODGOR.addVoid(62); G.SADO.subtitle('Is it dark? Please don\'t let it be dark.|Темно? Пожалуйста, только не темно.|Qorong\'imi? Iltimos, qorong\'i bo\'lmasin.'); });
  await L.tick(p, 60);
  await L.shot(p, 'hud');
  await p.evaluate(() => G.YODGOR.addVoid(20)); await L.tick(p, 60); await L.shot(p, 'hud80');
  R.errs = p._errs; console.log(JSON.stringify(R));
  await b.close();
})();
