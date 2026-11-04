// stage 4 probe: start the open world in a region, dump what was built, screenshot
const L = require('./s4_lib');
const region = process.argv[2] || 'tail', name = process.argv[3] || region;
(async () => {
  const b = await L.chromium.launch();
  const p = await L.openWorld(b, '?world=' + region + '&god');
  await L.settle(p);
  const R = await p.evaluate(() => {
    const L = G.level, W2 = G.WORLD2;
    return {
      dbg: W2.debug(), state: G.Game.state, pi: G.run && G.run.planIndex, biome: L.biome.id, size: [L.w, L.h], load: W2.stats.lastLoadMs,
      objs: (L.w2 && L.w2.objs || []).map(o => o.type + ':' + (o.ex ? o.ex.id : o.od && o.od.id) + '@' + Math.round(o.x / 16) + ',' + Math.round(o.y / 16)),
      entries: Object.keys(L.w2 && L.w2.entries || {}), missing: L.w2 && L.w2.missing, player: [Math.round(G.world.player.x / 16), Math.round(G.world.player.y / 16)],
      inter: G.world.interactables.filter(o => o._w2).map(o => o.art).join(','), enemies: G.world.enemies.length, rooms: (L.rooms || []).length
    };
  });
  console.log(JSON.stringify(R));
  await L.shot(p, 's4_probe_' + name);
  console.log('errs', p._errs.slice(0, 6), 'warns', p._warns);
  await b.close();
})();
