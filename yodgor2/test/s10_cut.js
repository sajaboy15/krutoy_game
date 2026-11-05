// Cutscenes (99b): each act's slides paint and advance; the moon hook queues them once. node test/s10_cut.js
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang: process.env.LANG2 || 'ru' });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const out = [];
  for (const act of [1, 2, 3]) {
    await W(a => { G.CUTSCENE.play(G.CUTSCENE.list[a], () => { window._cutDone = (window._cutDone || 0) + 1; }); }, act);
    for (let s = 0; s < 3; s++) {
      await W(() => { for (let i = 0; i < 90; i++) G.debugTick(0); });
      if (process.env.SHOT_DIR) await p.screenshot({ path: require('path').join(process.env.SHOT_DIR, 'cut' + act + s + '.png') });
      await p.keyboard.press('Enter');
    }
    await W(() => { for (let i = 0; i < 10; i++) G.debugTick(0); });
    out.push(await W(() => G.CUTSCENE.on));
  }
  await W(() => new Promise(r => setTimeout(r, 400)));
  const done = await W(() => window._cutDone);
  console.log(JSON.stringify({ stillOn: out, done }), p._errs.slice(0, 4), (await T.untranslated(p)).filter(s => !/^Level|^Talk/.test(s)).slice(0, 6));
  await b.close();
})();
