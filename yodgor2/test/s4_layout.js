// stage 4: a picture of a region's tiles with our objects marked (layout check)
const L = require('./s4_lib');
const fs = require('fs'), path = require('path');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.openWorld(b, '?world=' + (process.argv[2] || 'tail') + '&god');
  await L.settle(p);
  for (const region of (process.argv[3] || process.argv[2] || 'tail').split(',')) {
    if (region !== await p.evaluate(() => G.WORLD2.active)) { await p.evaluate(r => G.WORLD2.go(r, 'start', { now: true }), region); await L.settle(p); }
    const url = await p.evaluate(() => {
      const L = G.level, k = 3, cv = document.createElement('canvas'); cv.width = L.w * k; cv.height = L.h * k;
      const c = cv.getContext('2d');
      for (let y = 0; y < L.h; y++) for (let x = 0; x < L.w; x++) {
        const t = L.get(x, y), s = L.sid ? L.sid[y * L.w + x] : -1;
        c.fillStyle = t === 1 ? (s >= 0 ? '#8a6a4a' : '#5a5048') : t === 2 ? '#c8a060' : L.back[y * L.w + x] ? '#2a2630' : '#9ab8d8';
        c.fillRect(x * k, y * k, k, k);
      }
      const col = { exit: '#00ff66', chai: '#ffd000', house: '#ff4040', hooktower: '#ff00ff', lightfloor: '#00ffff', lightwall: '#00ffff', grate: '#ff8000', miniboss: '#ff0000', sealed: '#ffffff', stall: '#ffff80', cache: '#ffa0ff', spot: '#8080ff', chest: '#ffa0ff' };
      for (const o of L.w2.objs) { c.fillStyle = col[o.type] || '#000'; c.fillRect(o.x / 16 * k - 3, o.y / 16 * k - 9, 6, 9); }
      for (const e of G.world.enemies) { c.fillStyle = '#ff2020'; c.fillRect(e.x / 16 * k - 1, e.y / 16 * k - 3, 2, 3); }
      c.fillStyle = '#000'; c.fillRect(G.world.player.x / 16 * k - 2, G.world.player.y / 16 * k - 6, 4, 6);
      return cv.toDataURL();
    });
    fs.writeFileSync(path.join(L.out, 's4_layout_' + region + '.png'), Buffer.from(url.split(',')[1], 'base64'));
    console.log(region, await p.evaluate(() => JSON.stringify({ missing: G.level.w2.missing, objs: G.level.w2.objs.map(o => o.type + ':' + (o.ex ? o.ex.id : o.od && o.od.id) + '@' + Math.round(o.x / 16) + ',' + Math.round(o.y / 16)) })));
  }
  console.log('errs', p._errs.slice(0, 5));
  await b.close();
})();
