// Stage 7 screenshots at 1920×1080: the party in combat in three acts, each companion's order,
// the HUD chips, the downed state, the companion pages.   node test/s7_shots.js [what,...]
const L = require('./s7_lib');
const WHAT = (process.argv[2] || 'act1,act2,act3,skills,downed,pages').split(',');
const spawnPack = (p, n, dx, elite) => p.evaluate(([n, dx, elite]) => {
  const pl = G.world.player, list = G.Enemies.list(G.level.biome.enemyBiome || G.level.biome.id).filter(d => !d.fly && !d.boss);
  for (let i = 0; i < n; i++) { G.PARTY._px.noScale = true; const e = G.Enemies.spawn(list[i % list.length].id, pl.x + dx + i * 16, pl.y - 4, { elite: elite && i === 0 }); G.PARTY._px.noScale = false; if (e) { e.aggro = true; e.maxHp = e.hp = e.hp * 4; } }
}, [n, dx, elite]);
const clearEnemies = p => p.evaluate(() => { for (const e of G.world.enemies) if (!e.isBoss) e.dead = true; });
async function land(b, pi) {
  const p = await L.open(b, '?stage=' + pi + '&god&party=alp,nargiza,surayyo', { hd: true });
  await L.tick(p, 30); await L.drain(p);
  await p.evaluate(() => { window.requestAnimationFrame = () => 0; const s = G.CH.S(), t0 = G.UI.toast; G.UI.toast = () => {}; while (s.lvl < 9) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp); G.UI.toast = t0; });
  await L.tick(p, 4); await L.drain(p); await L.tick(p, 400); await L.drain(p);
  await L.tick(p, 480); await L.drain(p);   // let the land's title card fade
  return p;
}
(async () => {
  const b = await L.chromium.launch();
  for (const [what, pi] of [['act1', 3], ['act2', 14], ['act3', 26]]) {
    if (!WHAT.includes(what)) continue;
    const p = await land(b, pi);
    await clearEnemies(p);
    // walk a little so they line up, then a pack ahead
    await p.evaluate(() => G.input.keys.add('KeyD')); await L.tick(p, 50); await p.evaluate(() => G.input.keys.delete('KeyD')); await L.tick(p, 30);
    await spawnPack(p, 6, 110, true);
    await L.tick(p, 90);
    await p.evaluate(() => { const s = G.PARTY.actor('surayyo'); if (s) s.cds.b = 0; });
    await L.tick(p, 40);
    await L.shot(p, 's7_' + what + '_combat');
    await L.tick(p, 45);
    await L.shot(p, 's7_' + what + '_combat2');
    console.log(what, p._errs.slice(0, 3));
    await p.close();
  }
  if (WHAT.includes('skills') || WHAT.includes('downed') || WHAT.includes('pages')) {
    const p = await land(b, 3);
    await clearEnemies(p);
    await p.evaluate(() => G.input.keys.add('KeyD')); await L.tick(p, 40); await p.evaluate(() => G.input.keys.delete('KeyD')); await L.tick(p, 40);
    if (WHAT.includes('skills')) {
      for (const [id, key, w] of [['alp', 'Digit1', 22], ['nargiza', 'Digit2', 26], ['surayyo', 'Digit3', 18]]) {
        await clearEnemies(p); await L.tick(p, 30);
        await spawnPack(p, 3, 60, false);
        await L.tick(p, 40);
        await p.evaluate(([id, key]) => { const c = G.PARTY.actor(id); c.skillCD = 0; c.setState('follow'); G.input.keys.add(key); }, [id, key]);
        await L.tick(p, 2); await p.evaluate(key => G.input.keys.delete(key), key);
        await L.tick(p, w + 7);
        await L.shot(p, 's7_skill_' + id);
      }
    }
    if (WHAT.includes('downed')) {
      await clearEnemies(p); await L.tick(p, 30);
      await spawnPack(p, 2, 120, false);
      await p.evaluate(() => { const a = G.PARTY.actor('alp'); a.takeHit({ dmg: 99999, raw: true }); const pl = G.world.player; pl.x = a.x + 14; pl.facing = -1; G.input.keys.add('KeyF'); });
      await L.tick(p, 70);
      await L.shot(p, 's7_downed');
      await p.evaluate(() => G.input.keys.delete('KeyF'));
      await L.tick(p, 2);
      // hold V: the stance wheel
      await p.evaluate(() => { G.PARTY.actor('alp').revive('test'); G.input.keys.add('KeyV'); });
      await L.tick(p, 24);
      await p.evaluate(() => G.input.keys.add('KeyD')); await L.tick(p, 2);
      await L.shot(p, 's7_stance_wheel');
      await p.evaluate(() => { G.input.keys.delete('KeyD'); G.input.keys.delete('KeyV'); }); await L.tick(p, 4);
      await p.screenshot({ path: L.out + '/s7_hud_chips.png', clip: { x: 0, y: 0, width: 760, height: 520 } });
    }
    if (WHAT.includes('pages')) {
      await clearEnemies(p); await L.tick(p, 10);
      await p.evaluate(() => {
        const P = G.PARTY;
        for (const n of ['cover', 'provoke', 'stand', 'ram']) P.learn('alp', n);
        P.flag('alp', 'key_wall', 1); P.learn('alp', 'k_wall');
        for (const n of ['heal', 'vshield', 'wave']) P.learn('nargiza', n);
        for (const n of ['trip', 'puddle', 'wwall', 'feed']) P.learn('surayyo', n);
        P.member('nargiza').approval = 45; P.member('surayyo').approval = 20;   // quietly (no toasts over the pages)
        const w = G.CH.give(G.YITEMS.W.find(id => G.Items.defs[id].yd.cat === 'staff'), { quiet: true }); P.equip('surayyo', 'weapon', w.u);
      });
      await p.keyboard.press('KeyO'); await L.tick(p, 20); await p.waitForTimeout(900);
      for (let i = 0; i < 3; i++) {
        if (i === 0) { await p.keyboard.press('ArrowRight'); await L.tick(p, 4); await p.keyboard.press('ArrowRight'); }
        await L.tick(p, 16); await p.waitForTimeout(500);
        await L.shot(p, 's7_page_' + ['alp', 'nargiza', 'surayyo'][i]);
        await p.keyboard.press('KeyE'); await L.tick(p, 6);
      }
      console.log('page', await p.evaluate(() => [G.CHUI.open, G.CHUI.page]));
      await p.keyboard.press('KeyI'); await L.tick(p, 16); await L.shot(p, 's7_page_inventory_compare');
    }
    console.log('errs', p._errs.slice(0, 4));
    await p.close();
  }
  await b.close();
})();
