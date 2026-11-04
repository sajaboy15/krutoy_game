const L = require('./lib');
(async () => { const b = await L.chromium.launch(); const p = await L.open(b, ''); await L.tick(p, 30); console.log(p._errs, await p.evaluate(()=>!!G.YODGOR)); await b.close(); })();
