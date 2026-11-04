// Stage 7: companions follow the hero across a whole land of each act (plan 3, 14, 26), no fights
// (enemies removed), a running/jumping bot for the hero. Measures distance to the hero over time and
// how often a companion had to catch up by teleport (and why).
//   node test/s7_follow.js [pi,...]
const L = require('./s7_lib');
const PIS = (process.argv[2] || '3,14,26').split(',').map(Number);
(async () => {
  const b = await L.chromium.launch();
  const rows = [];
  for (const pi of PIS) {
    const p = await L.open(b, '?stage=' + pi + '&god&party=alp,nargiza,surayyo');
    await L.tick(p, 30); await L.drain(p);
    let res = null;
    for (let round = 0; round < 30 && !res; round++) {
      res = await p.evaluate((FSECS) => {
        const S = window.__S || (window.__S = { f: 0, samples: [], heroCheat: 0, lastX: G.world.player.x, still: 0, door: G.world.player.x < G.level.pw / 2 ? G.level.pw - 60 : 60, x0: G.world.player.x, jumpT: 0 });
        const pl = G.world.player, PX = G.PARTY._px;
        // a room labyrinth (karez): the hero walks the shortest standable path to the farthest entry
        // (BFS over cells as test/s5_traverse.js), moved along it at a running pace; jumps are straight lines
        if (S.path === undefined) {
          S.path = null;
          const Lv = G.level, Tt = G.T;
          if (!Lv.isOpen && Lv.rooms && Lv.rooms.length && Lv.w2) {
            const SO = (x, y) => Lv.get(x, y) === Tt.SOLID, stand = (x, y) => !SO(x, y) && !SO(x, y - 1) && (SO(x, y + 1) || Lv.get(x, y + 1) === Tt.PLAT);
            const sx = Math.floor(pl.x / 16), sy = Math.floor((pl.y - 1) / 16);
            const ents = Object.values(Lv.w2.entries).filter(e => e && e.x != null).sort((u, v) => Math.hypot(v.x - pl.x, v.y - pl.y) - Math.hypot(u.x - pl.x, u.y - pl.y));
            const z = ents[0], tx = Math.floor(z.x / 16), ty = Math.floor(z.y / 16) - 1;
            const prev = new Map(), q = [[sx, sy]]; prev.set(sx + ',' + sy, null); let end = null;
            while (q.length) {
              const [x, y] = q.shift();
              if (Math.abs(x - tx) <= 1 && Math.abs(y - ty) < 2) { end = [x, y]; break; }
              const nx = [];
              for (let up = 1; up <= 5; up++) { if (SO(x, y - up)) break; if (stand(x, y - up)) { nx.push([x, y - up]); break; } }
              for (const dx of [-2, -1, 1, 2]) {
                for (let up = 0; up <= 4; up++) { if (SO(x, y - up - 1) || SO(x + dx, y - up - 1)) break; if (stand(x + dx, y - up)) { nx.push([x + dx, y - up]); break; } }
                if (Math.abs(dx) === 1 && !SO(x + dx, y) && !SO(x + dx, y - 1)) { let yy = y; while (yy < Lv.h - 1 && !SO(x + dx, yy + 1) && Lv.get(x + dx, yy + 1) !== Tt.PLAT) yy++; if (yy > y && stand(x + dx, yy)) nx.push([x + dx, yy]); }
              }
              if (Lv.get(x, y + 1) === Tt.PLAT) { let yy = y + 1; while (yy < Lv.h - 1 && !SO(x, yy + 1)) yy++; if (stand(x, yy)) nx.push([x, yy]); }
              for (const [a2, b2] of nx) { const k = a2 + ',' + b2; if (!prev.has(k)) { prev.set(k, [x, y]); q.push([a2, b2]); } }
            }
            if (end) { const P = []; for (let c = end; c; c = prev.get(c[0] + ',' + c[1])) P.unshift({ x: c[0] * 16 + 8, y: (c[1] + 1) * 16 }); S.path = P; S.pi = 0; S.door = z.x; S.labyrinth = P.length; }
          }
        }
        if (!S.tp0) S.tp0 = Object.assign({}, PX.tpWhy || {});
        for (let k = 0; k < 30 * 20; k++) {
          for (const e of G.world.enemies) if (!e.isBoss) { e.dead = true; }
          if (S.path) {
            // glide along the path (2 px a frame), feet on each standable cell; physics settles the landing
            for (let j = 0; j < 2; j++) {
              const w = S.path[Math.min(S.pi, S.path.length - 1)], dx = w.x - pl.x, dy = w.y - pl.y, d = Math.hypot(dx, dy);
              if (d < 3 && S.pi < S.path.length - 1) { S.pi++; S.wf = 0; }
              if (++S.wf > 90) { pl.x = w.x; pl.y = w.y; S.heroCheat++; S.wf = 0; }   // a corner the straight line cannot pass (counted)
              const st = Math.min(d, 2.2); pl.x += d ? dx / d * st : 0; pl.y += d ? dy / d * st : 0; pl.vx = 0; pl.vy = 0; pl.facing = Math.sign(dx) || pl.facing;
              G.debugTick(1); S.f++;
            }
            if (G.UI._debug().modal) return null;
            if (S.f % 30 < 2) S.samples.push(PX.actors().map(c => Math.round(Math.hypot(c.x - pl.x, c.y - pl.y))));
            if (S.pi >= S.path.length - 1 || S.f > 60 * FSECS) {
              const per = {}; const ids = PX.actors().map(c => c.id);
              ids.forEach((id, i) => { const d = S.samples.map(s => s[i]).filter(v => v != null).sort((a, b) => a - b); per[id] = { mean: Math.round(d.reduce((a, b) => a + b, 0) / d.length), p90: d[Math.floor(d.length * 0.9)], max: d[d.length - 1], within150: Math.round(100 * d.filter(v => v <= 150).length / d.length) + '%' }; });
              const tp = {}; for (const k in PX.tpWhy || {}) tp[k] = (PX.tpWhy[k] || 0) - (S.tp0[k] || 0);
              return { labyrinth: S.labyrinth, heroLifts: S.heroCheat, secs: Math.round(S.f / 60), reached: S.pi >= S.path.length - 1, teleports: tp, per };
            }
            continue;
          }
          const dir = Math.sign(S.door - pl.x) || 1;
          G.input.keys.add(dir > 0 ? 'KeyD' : 'KeyA'); G.input.keys.delete(dir > 0 ? 'KeyA' : 'KeyD');
          if (S.jumpT > 0) { S.jumpT--; if (S.jumpT === 9) G.input.keys.delete('Space'); if (S.jumpT === 6) G.input.keys.add('Space'); if (S.jumpT === 0) G.input.keys.delete('Space'); }
          G.debugTick(2); S.f += 2;
          if (G.UI._debug().modal) return null;
          if (S.f % 16 === 0) {
            if (Math.abs(pl.x - S.lastX) < 3) S.still++; else S.still = 0;
            S.lastX = pl.x;
            if (S.still >= 2 && S.jumpT === 0) { G.input.keys.add('Space'); S.jumpT = 14; }
            if (S.still >= 10) {               // the bot cannot find the way: lift the hero over (counted)
              pl.y -= 64; pl.x += dir * 24; pl.vy = 0; S.heroCheat++; S.still = 0;
            }
          }
          if (S.f % 30 === 0) { S.far = S.far || []; for (const c of PX.actors()) { if (Math.hypot(c.x - pl.x, c.y - pl.y) > 250 && S.far.length < 12 && S.f % 300 === 0) S.far.push([c.id, Math.round(c.x / 16), Math.round(c.y / 16), c.state, c.onGround, +c.vx.toFixed(1), Math.round(pl.x / 16), Math.round(pl.y / 16), c.stuckT, c.offT]); } }
          if (S.f % 30 === 0) S.samples.push(PX.actors().map(c => Math.round(Math.hypot(c.x - pl.x, c.y - pl.y))));
          if (Math.abs(pl.x - S.door) < 24 || S.f > 60 * FSECS) {
            G.input.keys.delete('KeyD'); G.input.keys.delete('KeyA'); G.input.keys.delete('Space');
            const per = {}; const ids = PX.actors().map(c => c.id);
            ids.forEach((id, i) => { const d = S.samples.map(s => s[i]).filter(v => v != null).sort((a, b) => a - b); per[id] = { mean: Math.round(d.reduce((a, b) => a + b, 0) / d.length), p90: d[Math.floor(d.length * 0.9)], max: d[d.length - 1], within150: Math.round(100 * d.filter(v => v <= 150).length / d.length) + '%' }; });
            const tp = {}; for (const k in PX.tpWhy || {}) tp[k] = (PX.tpWhy[k] || 0) - (S.tp0[k] || 0);
            return { secs: Math.round(S.f / 60), covered: Math.round(Math.abs(pl.x - S.x0)), reached: Math.abs(pl.x - S.door) < 24, widthPx: Math.round(Math.abs(S.door - S.x0)), heroLifts: S.heroCheat, teleports: tp, per, far: S.far };
          }
        }
        return null;
      }, +process.env.FSECS || 120);
      if (!res) await L.drain(p, 20);
    }
    const r = Object.assign({ pi, land: await p.evaluate(() => (G.Game.stage.plan.region || G.Game.stage.plan.id) + ' ' + G.level.w + 'x' + G.level.h) }, res || { err: 'no result' }, { errs: p._errs.slice(0, 3) });
    rows.push(r); console.log(JSON.stringify(r));
    await L.shot(p, 's7_follow_' + pi);
    await p.close();
  }
  await b.close();
})();
