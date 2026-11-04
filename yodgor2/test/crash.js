const L = require('./lib');
(async () => { const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=1&god');
  p.on('crash', () => console.log('PAGE CRASH'));
  let t0 = Date.now();
  for (let i = 0; i < 60; i++) { try { await L.tick(p, 8); } catch (e) { console.log('fail at', i, e.message.slice(0, 80)); break; }
    if (i % 10 == 0) console.log(i, Date.now() - t0, await p.evaluate(() => (performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1e6) : 0) + 'MB ' + G.Game.state)); }
  console.log(p._errs.slice(0, 5)); await b.close(); })();
