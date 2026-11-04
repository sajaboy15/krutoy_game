const L = require('./lib');
(async () => { const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=31&god');
  await p.evaluate(() => G.LANG.set('ru'));
  await L.tick(p, 60);
  const r = await p.evaluate(() => {
    const A3 = G.A3 || (G.YODGOR && G.YODGOR.A3);
    const f = G.YODGOR.run.f;
    const out = {};
    Object.assign(f, { nargizaQ: 'believes', truth: 1, tales: 1, sadoFate: 'remember' }); delete f.name;
    out.noName = A3 && A3.taleMissing(false);
    f.name = 1; out.withName = A3 && A3.taleMissing(false);
    out.keys = Object.keys(G.YODGOR.run.f);
    return out; });
  console.log(JSON.stringify(r)); await b.close(); })();
