const L = require('./lib');
(async () => { const b = await L.chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await L.open(b, '?stage=9&god');
  await p.setViewportSize({ width: 1920, height: 1080 });
  await p.evaluate(() => G.LANG.set('ru'));
  for (const pre of ['low', 'medium', 'high']) { await p.evaluate(x => G.GFX.set('preset', x), pre); await p.waitForTimeout(800);
    await p.screenshot({ path: 'out/pp_' + pre + '.png', clip: { x: 1700, y: 20, width: 210, height: 80 } }); }
  await b.close(); })();
