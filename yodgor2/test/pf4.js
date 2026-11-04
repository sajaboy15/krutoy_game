const L = require('./lib');
(async () => { const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=9&god');
  await p.evaluate(() => G.LANG.set('ru'));
  await p.waitForTimeout(2500);
  const url = await p.evaluate(() => { const c = G.uiPx.canvas || G.uiPx; return c.toDataURL(); });
  require('fs').writeFileSync('out/uipx.png', Buffer.from(url.split(',')[1], 'base64'));
  await b.close(); })();
