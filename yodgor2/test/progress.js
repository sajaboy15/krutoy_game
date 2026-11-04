const L = require('./lib');
(async () => {
  const b = await L.chromium.launch(); const R = {};
  const p = await L.open(b, '?stage=10&god'); await p.evaluate(() => G.LANG.set('ru'));
  await L.tick(p, 40);
  for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.tick(p, 10); }
  await p.evaluate(() => G.YODGOR.set({ f: { sado: 1, widow: 'force', davron: 'led', hound: 'shown', truth: 1 }, trust: 6 }));
  R.shelf = await p.evaluate(() => !!G.world.interactables.find(o => o.art === 'tumarShelf'));
  R.owned = await p.evaluate(() => G.PROG.owned().map(x => x.id));
  const base = await p.evaluate(() => ({ dmg: G.Perks.mod('dmgOut', 100, {}, {}), spd: G.Perks.mod('speed', 1), heal: G.Perks.mod('heal', 1), hp: G.Perks.mod('maxHp', 1) }));
  await p.evaluate(() => { const o = G.world.interactables.find(o => o.art === 'tumarShelf'); o.use(G.world.player); });
  await L.tick(p, 30); await L.shot(p, 'prog_shelf');
  // choose "wear"
  await p.evaluate(() => { const m = G.UI._debug().modal; m.sel = m.options.findIndex(o => /Надеть/.test(o.label)); }); await L.press(p, 'Enter'); await L.tick(p, 30);
  await L.shot(p, 'prog_wear');
  R.wearOpts = (await L.modal(p)).options;
  await p.evaluate(() => { const m = G.UI._debug().modal; m.sel = 0; }); await L.press(p, 'Enter'); await L.tick(p, 30);
  for (let i = 0; i < 6; i++) { const m = await L.modal(p); if (!m) break; if (m.type === 'dialog') { await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.tick(p, 10); } else break; }
  await p.evaluate(() => { const m = G.UI._debug().modal; m.sel = 1; }); await L.press(p, 'Enter'); await L.tick(p, 30);
  for (let i = 0; i < 6; i++) { const m = await L.modal(p); if (!m) break; if (m.type === 'dialog') { await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.tick(p, 10); } else break; }
  R.worn = await p.evaluate(() => G.PROG.worn());
  await p.evaluate(() => { G.YODGOR.run.mem.m_snow = 1; G.YODGOR.run.mem.m2_sale = 1; });
  R.after = await p.evaluate(() => ({ dmg: G.Perks.mod('dmgOut', 100, {}, {}), spd: G.Perks.mod('speed', 1), heal: G.Perks.mod('heal', 1), hp: G.Perks.mod('maxHp', 1), dmgIn: G.Perks.mod('dmgIn', 100, {}) }));
  R.base = base;
  // close menus, go to next land: heavy tumar adds Hollowness
  for (let i = 0; i < 20 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.tick(p, 10); }
  const v0 = await p.evaluate(() => G.YODGOR.run.void);
  await p.evaluate(() => G.Game.loadStage(11)); await L.tick(p, 300);
  for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.tick(p, 10); }
  for (let k = 0; k < 6; k++) { await L.tick(p, 100); for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.tick(p, 10); } }
  R.voidDelta = (await p.evaluate(() => G.YODGOR.run.void)) - v0;
  // bond: trust 6 -> pulled back from a killing blow once
  R.save1 = await p.evaluate(() => { const pl = G.world.player; pl.hp = 10; const v = G.Perks.mod('dmgIn', 50, {}); return v; });
  R.save2 = await p.evaluate(() => G.Perks.mod('dmgIn', 50, {}));
  R.errs = p._errs; console.log(JSON.stringify(R, null, 1)); await b.close();
})();
