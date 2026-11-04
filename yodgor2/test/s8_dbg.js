const L = require('./s8_lib');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.lair(b, 1, {});
  const r = await p.evaluate(() => {
    G.godMode = false;
    const bz = G.Game.boss, pl = G.world.player, out = [];
    bz.hp = bz.maxHp * .45; bz.atkCD = 999; G.debugTick(200);   // phase 2
    bz.atkCD = 999; bz.data.rec = 0; bz.data.mv = null;
    bz.x = G.BossKit.arena().cx; pl.x = bz.x - 120; pl.y = G.BossKit.arena().floor; pl.vx = 0; G.debugTick(10);
    G.BM.start(bz, 'crack'); const W0 = G.world.t; let jh = 0, jumped = false;
    const up0 = G.Player.prototype.update;
    G.Player.prototype.update = function () {
      if (this === pl) {
        if (jh > 0) { G.input.down.jump = true; G.input.keys.add('Space'); if (--jh === 0) G.input.keys.delete('Space'); }
        const th = G.BM.live().find(q => q.wave && q.wave.dir < 0);
        if (th && !jumped) { const dd = (pl.x - th.wave.x0) * th.wave.dir; const left = th.wave.t0 + Math.round((dd - 14) / th.wave.spd) - G.world.t; if (left <= 8) { G.input.lastPress.jump = G.frame; jh = 18; G.input.down.jump = true; G.input.keys.add('Space'); jumped = true; out.push('press@' + (G.world.t - W0) + ' left' + left); } }
      }
      return up0.apply(this, arguments);
    };
    for (let i = 0; i < 80; i++) {
      pl.hp = pl.maxHp;
      G.debugTick(1);
      const sw = G.world.ents.filter(e => e instanceof G.BossKit.Shockwave && e.dir < 0)[0];
      out.push((G.world.t - W0) + ':' + Math.round(pl.y) + ':' + Math.round(pl.x) + ':' + (sw ? Math.round(sw.x) : '-') + (G.BM.hits.length ? ' H' + G.BM.hits.length : ''));
    }
    return out.join(' | ');
  });
  console.log(r);
  await b.close();
})();
