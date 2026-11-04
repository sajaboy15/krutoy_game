// stage 4 test helpers (open world): built on test/lib.js
const L = require('./lib');
const OUT = process.env.YODGOR_OUT;
async function openWorld(b, q, opts) {
  opts = opts || {};
  const p = opts.viewport ? await (async () => { const pg = await L.open(b, q, opts); await pg.setViewportSize(opts.viewport); return pg; })() : await L.open(b, q, opts);
  p._warns = [];
  p.on('console', m => { if (m.type() === 'warning' && /world|map/.test(m.text())) p._warns.push(m.text()); });
  if (opts.liveRaf === false) await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
  return p;
}
// wait until the world finished loading a region (fade, deferLoad)
async function settle(p, n) {
  for (let i = 0; i < (n || 60); i++) {
    await L.tick(p, 10);
    const s = await p.evaluate(() => ({ st: G.Game.state, l: !!G.Game.loading, f: !!G.Game.fadeCb, busy: G.WORLD2.busy }));
    if (s.st === 'play' && !s.l && !s.f && !s.busy) { await L.tick(p, 4); return true; }
    await p.waitForTimeout(30);
  }
  return false;
}
const info = p => p.evaluate(() => { const W2 = G.WORLD2, pl = G.world && G.world.player; return { region: W2.active, inside: W2.inside, pi: G.run && G.run.planIndex, x: pl && Math.round(pl.x / 16), y: pl && Math.round(pl.y / 16), clock: W2.S() && Math.round(W2.S().clock), state: G.Game.state }; });
// go through an exit object (by exit id) like the player would: stand at it and use it
async function useExit(p, id) {
  const r = await p.evaluate(id => {
    const L = G.level, o = L.w2.objs.find(o => o.type === 'exit' && o.ex.id === id);
    let it = o && G.world.interactables.find(i => Math.abs(i.x - o.x) < 4 && Math.abs(i.y - o.y) < 4);
    if (!it) { // exits held by houses/towers/hatches: find the interactable by its prompt target
      const ex = G.WORLD2.regions[G.WORLD2.active].exits[id];
      it = G.world.interactables.find(i => i._w2 && /w2(well|rope|gate|drain|arch)/.test(i.art) && i.onUse && i.prompt && ex && (i.prompt.indexOf(G.LANG.t(ex.prompt || ex.label || '___')) >= 0));
    }
    if (!it) return 'no exit ' + id;
    const pl = G.world.player; pl.x = it.x; pl.y = it.y; pl.vx = pl.vy = 0;
    it.use(pl);
    return 'ok';
  }, id);
  return r;
}
module.exports = Object.assign({}, L, { openWorld, settle, info, useExit });
