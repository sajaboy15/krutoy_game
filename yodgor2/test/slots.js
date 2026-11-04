// Save slots: save from pause, load from main menu; autosave after a boss.
const L = require('./lib');
async function drain(p) {
  for (let i = 0; i < 200; i++) {
    await L.tick(p, 8); const m = await L.modal(p);
    if (!m) { await L.tick(p, 10); if (!(await L.modal(p))) return; continue; }
    if (m.type === 'choice') { await L.tick(p, 14); await p.evaluate(() => { G.UI._debug().modal.sel = 0; }); }
    await L.press(p, 'Enter'); await L.press(p, 'Enter');
  }
}
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '');
  const R = {};
  await L.tick(p, 60);
  await p.evaluate(() => G.Game.startRun({ mode: 'wanderer' }));
  await L.tick(p, 60); await drain(p);
  await p.evaluate(() => { G.Game.exitStage(); }); await L.tick(p, 40); await drain(p); await p.waitForTimeout(300); await L.tick(p, 60); await drain(p);
  R.stage = await p.evaluate(() => G.run.planIndex);
  // pause -> Save (6th item: after Skills and Equipment) -> slot 2
  await L.press(p, 'Escape'); await L.tick(p, 20);
  await L.shot(p, 'slots_pause');
  await p.evaluate(() => { G.UI._debug().modal.sel = 5; }); await L.press(p, 'Enter'); await L.tick(p, 30);
  R.saveModal = await L.modal(p);
  await L.shot(p, 'slots_save');
  await p.evaluate(() => { G.UI._debug().modal.sel = 1; }); await L.press(p, 'Enter'); await L.tick(p, 30);
  R.slot2 = await p.evaluate(() => { const c = JSON.parse(localStorage.getItem('yodgor2_slot_2')); return c && c.run.planIndex; });
  // to title, load
  await p.evaluate(() => { G.Game.setState('title'); G.UI.openTitle(); }); await L.tick(p, 80);
  R.menu = await p.evaluate(() => G.MAIN_MENU.map(m => m.label));
  await p.evaluate(() => G.LOAD_MENU()); await L.tick(p, 30);
  R.loadModal = await L.modal(p);
  await L.shot(p, 'slots_load');
  await L.press(p, 'Enter'); await L.tick(p, 80); await p.waitForTimeout(300); await L.tick(p, 60);
  R.loaded = await p.evaluate(() => G.Game.state + ':' + (G.run && G.run.planIndex));
  // boss autosave: load boss stage, real kill, after post scene checkpoint points to next stage
  await p.evaluate(() => G.Game.loadStage(1)); await L.tick(p, 40); await drain(p);
  for (let i = 0; i < 120; i++) { if (await p.evaluate(() => !!G.Game.stage.bossStarted)) break; await p.evaluate(() => { G.world.player.x += 8; }); await L.tick(p, 2); }
  await L.tick(p, 20); await drain(p); await L.tick(p, 260);
  for (let k = 0; k < 40; k++) { const d = await p.evaluate(() => { G.world.player.hp = G.world.player.maxHp; const bz = G.Game.boss; if (!bz || bz.dead) return true; if (bz.mode === 'fight') G.Combat.hit(G.world.player, bz, { dmg: 400 }); return false; }); if (d) break; await L.tick(p, 30); await drain(p); }
  await L.tick(p, 420); await drain(p); await L.tick(p, 100); await drain(p);
  R.cpAfterBoss = await p.evaluate(() => G.YODGOR.checkpoint && G.YODGOR.checkpoint.run.planIndex);
  R.errs = p._errs;
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
