const L = require('./lib');
(async () => { const b = await L.chromium.launch(); const p = await L.open(b, '?stage=3&god'); await L.tick(p, 20);
 console.log(await p.evaluate(() => { const g = document.getElementById('game'), h = document.getElementById('hud'); return { game: [g.width, g.height, g.style.width, g.style.height, getComputedStyle(g).imageRendering], hud: [h.width, h.height, h.style.width], ctxType: !!g.getContext, keys: Object.keys(G).filter(k => /canvas|ctx|disp|scale|bloom/i.test(k)) }; }));
 await b.close(); })();
