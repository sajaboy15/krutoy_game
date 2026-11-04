const L = require('./lib');
(async () => {
  const b = await L.chromium.launch(); const R = {};
  for (const lang of ['ru', 'uz', 'en']) {
  const p = await L.open(b, '?stage=3&god'); await p.evaluate(l => G.LANG.set(l), lang);
  await L.tick(p, 40);
  for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.press(p, 'Enter'); await L.tick(p, 10); }
  await p.evaluate(() => { G.YODGOR.set({ f: { sado: 1, masked: 1 }, trust: 4 }); G.YODGOR.run.mem.m_snow = 1; G.PROG.addXp(150); });
  await L.tick(p, 10);
  R[lang] = { pts: await p.evaluate(() => G.PROG.pts()) };
  await L.press(p, 'KeyT'); await L.tick(p, 10);
  R[lang].open = await p.evaluate(() => G.PROG.ui.open && G.CHUI.page === 'skills');
  await L.shot(p, 'tree_' + lang + '_y');
  await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.press(p, 'ArrowDown'); await L.press(p, 'Enter'); await L.press(p, 'ArrowDown'); await L.press(p, 'Enter');
  await L.tick(p, 5); await L.shot(p, 'tree_' + lang + '_y2');
  await L.press(p, 'KeyE'); await L.press(p, 'Enter'); await L.press(p, 'ArrowDown'); await L.press(p, 'ArrowDown'); await L.press(p, 'Enter');
  await L.tick(p, 5); await L.shot(p, 'tree_' + lang + '_s');
  R[lang].tree = await p.evaluate(() => JSON.stringify({ yodchi: G.CH.S().sk, sado: G.YODGOR.run.tree && G.YODGOR.run.tree.s }));
  R[lang].dmg = await p.evaluate(() => G.Perks.mod('dmgOut', 100, {}, {}));
  await L.press(p, 'Escape'); await L.tick(p, 30);
  R[lang].closed = await p.evaluate(() => { const m = G.UI._debug().modal; return !G.PROG.ui.open && !m ? true : JSON.stringify(m && { t: m.type, title: m.title, sp: m.speaker }); });
  // the world runs again; pause menu entry opens the tree too
  await L.press(p, 'Escape'); await L.tick(p, 20);
  await p.evaluate(() => { G.UI._debug().modal.sel = 3; }); await L.press(p, 'Enter'); await L.tick(p, 40); await p.waitForTimeout(300); await L.tick(p, 10);
  R[lang].fromPause = await p.evaluate(() => G.PROG.ui.open);
  await L.press(p, 'Escape'); await L.tick(p, 20);
  R[lang].errs = p._errs; await p.close(); }
  console.log(JSON.stringify(R, null, 1)); await b.close();
})();
