// Stage 4 — how long a region takes to cross: a running bot in god mode (open regions), and a
// shortest walkable path for the room labyrinth (karez). Pure movement, no fights, no reading.
const L = require('./s4_lib');
const W = (p, f, a) => p.evaluate(f, a);
(async () => {
  const b = await L.chromium.launch();
  const p = await L.openWorld(b, '?world=tail&god', { liveRaf: false });
  await L.settle(p);
  const out = {};
  for (const [r, from, to] of [['tail', 'west', 'east'], ['potters', 'east', 'west'], ['bazaar', 'west', 'east']]) {
    await W(p, ([r, from]) => G.WORLD2.go(r, from, { now: true }), [r, from]); await L.settle(p);
    const res = await W(p, (to) => {
      const L = G.level, pl = G.world.player, tgt = L.w2.entries[to], dir = Math.sign(tgt.x - pl.x);
      for (const e of G.world.enemies) e.dead = true;            // a clean run: movement only
      const key = dir > 0 ? 'KeyD' : 'KeyA';
      G.input.keys.add(key);
      let f = 0, lastX = pl.x, stuck = 0, jumps = 0;
      for (; f < 60 * 120; f += 30) {
        if (stuck > 0) { G.input.keys.add('Space'); jumps++; G.debugTick(12); G.input.keys.delete('Space'); G.debugTick(2); G.input.keys.add('Space'); G.debugTick(16); G.input.keys.delete('Space'); }
        else G.debugTick(30);
        if (Math.abs(pl.x - lastX) < 12) stuck++; else stuck = 0;
        lastX = pl.x;
        if (G.WORLD2.busy || (dir > 0 ? pl.x >= tgt.x - 8 : pl.x <= tgt.x + 8)) break;
      }
      G.input.keys.delete(key); G.input.keys.delete('Space');
      return { secs: +(f / 60).toFixed(1), widthTiles: L.w, at: [Math.round(pl.x / 16), Math.round(pl.y / 16)], st: pl.state, jumps, reached: G.WORLD2.busy || Math.abs(pl.x - tgt.x) < 40 };
    }, to);
    out[r] = res; console.error(r, JSON.stringify(res));
    await L.settle(p);
  }
  // the karez: a breadth-first walk over standable cells (walk, step up to 4 tiles, fall), from the Tail's well to the Bazaar's drain
  await W(p, () => G.WORLD2.go('karez', 'tail_well', { now: true })); await L.settle(p);
  const bfs = () => W(p, () => {
    const L = G.level, T = G.T, S = (x, y) => L.get(x, y) === T.SOLID;
    const stand = (x, y) => !S(x, y) && !S(x, y - 1) && (S(x, y + 1) || L.get(x, y + 1) === T.PLAT);
    const a = L.w2.entries.tail_well, z = L.w2.entries.bazaar_drain;
    const sx = Math.floor(a.x / 16), sy = Math.floor(a.y / 16) - 1, tx = Math.floor(z.x / 16), ty = Math.floor(z.y / 16) - 1;
    const dist = new Map(), prev = new Map(), q = [[sx, sy]]; dist.set(sx + ',' + sy, 0);
    const grateOpen = G.WORLD2.isOpen('karez:grate:mid');
    while (q.length) {
      const [x, y] = q.shift(), d = dist.get(x + ',' + y);
      if (x === tx && Math.abs(y - ty) < 2) { const path = []; let k = x + ',' + y; while (k) { path.push(k); k = prev.get(k); } return { steps: d, grateOpen, from: [sx, sy], to: [tx, ty], path: path.reverse().filter((_, i) => i % 4 === 0).join(' ') }; }
      const next = [];
      // the hero: jump + double jump reach about 7 tiles up; up through one-way planks; drop through them (down+jump)
      for (let up = 1; up <= 7; up++) { if (S(x, y - up)) break; if (stand(x, y - up)) { next.push([x, y - up]); break; } }
      if (L.get(x, y + 1) === T.PLAT) { let yy = y + 1; while (yy < L.h - 1 && !S(x, yy + 1) && L.get(x, yy + 1) !== T.PLAT) yy++; if (stand(x, yy)) next.push([x, yy]); }
      for (const dx of [-4, -3, -2, -1, 1, 2, 3, 4]) {
        let blocked = false;   // a wide jump needs the columns in between open (at the take-off height or above)
        for (let i = 1; i < Math.abs(dx) && !blocked; i++) { const cx = x + i * Math.sign(dx); let open = false; for (let yy = y; yy >= y - 7 && !open; yy--) { if (S(x, yy - 1)) break; if (!S(cx, yy) && !S(cx, yy - 1)) open = true; } if (!open) blocked = true; }
        if (blocked) continue;
        for (let up = 0; up <= 7; up++) { if (S(x, y - up - 1)) break; if (stand(x + dx, y - up)) { next.push([x + dx, y - up]); break; } }
        let yy = y; while (yy < L.h - 1 && !S(x + dx, yy + 1) && L.get(x + dx, yy + 1) !== T.PLAT && !S(x + dx, yy)) yy++;
        if (stand(x + dx, yy)) next.push([x + dx, yy]);
      }
      for (const [nx, ny] of next) { const k = nx + ',' + ny; if (!dist.has(k)) { dist.set(k, d + 1); prev.set(k, x + ',' + y); q.push([nx, ny]); } }
    }
    return { unreachable: true, grateOpen };
  });
  out.karezGrateShut = await bfs();      // the grate must cut the labyrinth in two
  await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'grate'); G.WORLD2.setOpen(o.gid); G.WORLD2.openTiles(G.level, o.tiles); });
  out.karez = await bfs();
  out.errs = p._errs.slice(0, 4);
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
