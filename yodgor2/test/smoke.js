// Smoke: title in each language, mode cards, no errors.
const L = require('./lib');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '');
  await L.tick(p, 80);
  await L.shot(p, 'title_en');
  const R = { lang: await p.evaluate(() => G.LANG.lang), menu: await p.evaluate(() => G.MAIN_MENU.map(m => m.label)) };
  await p.evaluate(() => G.LANG.set('uz')); await L.tick(p, 10); await L.shot(p, 'title_uz');
  await p.evaluate(() => G.LANG.set('ru')); await L.tick(p, 10); await L.shot(p, 'title_ru');
  await p.evaluate(() => G.LANG.set('en'));
  R.errs = p._errs;
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
