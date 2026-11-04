// Stage 4 screenshots at 1920x1080: every region at several spots, day and night, the map, gates, a shortcut,
// the chaikhana travel menu.   node test/s4_shots.js [regions|night|ui|all]
const L = require('./s4_lib');
const what = process.argv[2] || 'all';
const W = (p, f, a) => p.evaluate(f, a);
async function spot(p, frac, dy) {
  await W(p, ([f, dy]) => {
    const L = G.level, pl = G.world.player;
    pl.x = Math.max(80, Math.min(L.pw - 80, L.pw * f));
    pl.y = (L.groundBelow(pl.x, (dy || 0) * 16 + 16, 4000) || L.spawn.y);
    pl.vx = pl.vy = 0;
    for (const e of G.world.enemies) if (Math.abs(e.x - pl.x) < 90) e.x += 160; // keep the frame readable
    G.cam.snap(pl.x, pl.y - 40);
  }, [frac, dy]);
  await L.tick(p, 50);
}
const card = p => W(p, () => { const c = G.UI._debug().card; if (c) { c.t = 9999; } });
(async () => {
  const b = await L.chromium.launch();
  const p = await L.openWorld(b, '?world=tail&god', { viewport: { width: 1920, height: 1080 } });
  await L.settle(p);
  await W(p, () => { G.WORLD2.S().keys.hook = 1; });
  const go = async (r, e, o) => { await W(p, ([r, e, o]) => G.WORLD2.go(r, e, Object.assign({ now: true }, o || {})), [r, e, o]); await L.settle(p); await L.tick(p, 30); await card(p); await L.tick(p, 30); };
  if (what === 'all' || what === 'regions') {
    for (const [r, fr] of [['tail', [0.06, 0.3, 0.55, 0.8]], ['potters', [0.1, 0.4, 0.66, 0.9]], ['bazaar', [0.08, 0.35, 0.58, 0.8]], ['karez', [0.05, 0.3, 0.55, 0.8]]]) {
      await W(p, () => G.WORLD2.setHour(9));
      await go(r, 'start');
      for (const f of fr) { await spot(p, f, r === 'karez' ? 30 : 0); await L.shot(p, `s4hd_${r}_${Math.round(f * 100)}`); }
    }
  }
  if (what === 'all' || what === 'night') {
    for (const [r, f] of [['tail', 0.3], ['potters', 0.4], ['bazaar', 0.35]]) {
      await W(p, () => G.WORLD2.setHour(23));
      await go(r, 'start');
      await spot(p, f); await L.shot(p, `s4hd_${r}_night`);
      await W(p, () => G.WORLD2.setHour(20.4)); await L.tick(p, 4); await spot(p, f); await L.shot(p, `s4hd_${r}_dusk_onday`);
    }
    await W(p, () => G.WORLD2.setHour(9));
  }
  if (what === 'all' || what === 'ui') {
    await go('tail', 'west');
    // shortcut: Mehri's gate, barred, and from the yard
    const d = await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'house'); return o.doors[0].x / G.level.pw; });
    await spot(p, d - 0.012); await L.shot(p, 's4hd_shortcut_barred');
    await go('tail', 'well'); await W(p, () => { const d = G.world.interactables.find(o => o.art === 'w2door'); const pl = G.world.player; pl.x = d.x + 20; d.use(pl); }); await L.tick(p, 40);
    await L.shot(p, 's4hd_shortcut_open');
    // the hook ring above the dovecote
    const h = await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'hooktower'); return (o.ring.x - 60) / G.level.pw; });
    await spot(p, h, 30); await L.tick(p, 10); await p.waitForTimeout(100); await L.tick(p, 2); await L.shot(p, 's4hd_hook_ring');
    await W(p, () => G.WORLD2.useHook()); await L.tick(p, 14); await L.shot(p, 's4hd_hook_flight'); await L.tick(p, 60); await L.shot(p, 's4hd_hook_roof');
    // Sado's light: the kiln hatch
    await go('potters', 'east');
    const k = await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'lightfloor'); return (o.x - 70) / G.level.pw; });
    await spot(p, k); await L.shot(p, 's4hd_light_glyphs');
    await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'lightfloor'); const pl = G.world.player; pl.x = o.x; pl.y = o.y - 4; }); await L.tick(p, 90);
    await L.shot(p, 's4hd_light_open');
    // the karez grate and the den
    await go('karez', 'bazaar_drain');
    await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'grate'); const pl = G.world.player; pl.x = o.x + 40; pl.y = o.y; G.cam.snap(pl.x, pl.y - 40); }); await L.tick(p, 40);
    await L.shot(p, 's4hd_grate');
    // chaikhana: outside, inside, the dastarkhan and the travel menu
    await go('bazaar', 'chai:bazaar_salt'); await L.shot(p, 's4hd_chai_outside');
    await go('bazaar', 'chai:bazaar_salt', { inside: 'bazaar_salt' }); await L.shot(p, 's4hd_chai_inside');
    await go('tail', 'chai:tail_plane', { inside: 'tail_plane' });
    await L.use(p, 'samovar'); await L.tick(p, 30); await L.shot(p, 's4hd_chai_menu');
    await L.choose(p, await W(p, () => G.LANG.t(`Travel to another chaikhana…|Перейти в другую чайхану…|Boshqa choyxonaga o'tish…`))); await L.tick(p, 30);
    await L.shot(p, 's4hd_chai_travel');
    await L.press(p, 'Escape'); await L.tick(p, 20); await p.waitForTimeout(200); await L.tick(p, 10);
    for (let i = 0; i < 5 && await L.modal(p); i++) { await L.press(p, 'Escape'); await L.tick(p, 20); await p.waitForTimeout(150); }
    // the map
    await go('bazaar', 'west');
    for (let i = 0; i < 40; i++) { await W(p, () => { G.world.player.x += 140; }); await L.tick(p, 8); await p.waitForTimeout(20); }
    await W(p, () => { G.WORLD2.mark('auction', 'bazaar', 'auction', 'quest', `The auction|Аукцион|Kimoshdi savdosi`); G.WORLD2.objective(`Find out who sells Turab's voice|Узнай, кто продаёт голос Тураба|Turobning ovozini kim sotayotganini bil`); });
    await p.keyboard.press('KeyM'); await L.tick(p, 20); await L.shot(p, 's4hd_map_world');
    await p.keyboard.press('Enter'); await L.tick(p, 20); await L.shot(p, 's4hd_map_bazaar');
    await p.keyboard.press('Escape'); await L.tick(p, 5); await p.keyboard.press('Escape'); await L.tick(p, 20);
    await L.shot(p, 's4hd_hud_objective');
  }
  console.log('errs', p._errs.slice(0, 5));
  await b.close();
})();
