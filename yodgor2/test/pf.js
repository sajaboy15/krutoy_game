const L = require('./lib');
(async () => { const b = await L.chromium.launch();
 for (const lang of ['en','ru']) {
  const p = await L.open(b, '?stage=' + process.argv[2] + '&god');
  await p.setViewportSize({ width: 1920, height: 1080 });
  await p.evaluate(l => G.LANG.set(l), lang);
  await L.tick(p, 400);
  for (let i = 0; i < 12; i++) await p.evaluate(() => { if (G.UI.isOpen()) { const m = G.UI._debug().modal; if (m) { m.closing = true; m.closeT = 99; } } G.debugTick(30); });
  await L.tick(p, 60); await L.shot(p, 'pf_' + lang);
  console.log(lang, p._errs);
  await p.close(); }
 await b.close(); })();
