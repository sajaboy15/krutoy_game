// Stage 5 screenshots at 1920x1080: every new region at two spots, the map with many regions revealed,
// a key gate of each kind (Singers', Divan, singing door, dive, updraft, light crack), a lair gate.
//   node test/s5_shots.js [regions|gates|map|all]
const T = require('./s5_lib');
const what = process.argv[2] || 'all';
const NEW = [['rabat', [0.3, 0.75]], ['tower', [0.35, 0.6]], ['ark', [0.3, 0.6]], ['cloister', [0.3, 0.55]], ['mines', [0.25, 0.65]], ['streets', [0.25, 0.7]],
  ['cistern', [0.3, 0.7]], ['old', [0.3, 0.7]], ['spine', [0.3, 0.8]], ['withers', [0.25, 0.7]], ['well', [0.3, 0.7]], ['heart', [0.3, 0.75]],
  ['dream', [0.3, 0.7]], ['wedding', [0.3, 0.7]], ['sand', [0.3, 0.7]], ['house', [0.3, 0.7]]];
(async () => {
  const b = await T.chromium.launch();
  const p = await T.openWorld(b, '?stage=25&god', { viewport: { width: 1920, height: 1080 } });
  const W = (f, a) => p.evaluate(f, a);
  await T.settle(p, 200); await T.drain(p);
  await W(() => { const s = G.WORLD2.S(); for (const k of ['light', 'hook', 'water', 'breath']) s.keys[k] = 1; G.WORLD2.setHour && G.WORLD2.setHour(10); });
  const card = () => W(() => { const c = G.UI._debug().card; if (c) c.t = 9999; });
  const go = async (r, e) => { await W(([r, e]) => G.WORLD2.go(r, e || 'start', { now: true, force: true }), [r, e]); await T.settle(p, 200); await T.drain(p); await T.tick(p, 30); await card(); await T.tick(p, 20); };
  const spotAt = async (x, dy) => {
    await W(([x, dy]) => {
      const L = G.level, pl = G.world.player;
      pl.x = Math.max(80, Math.min(L.pw - 80, x));
      // under a roof (karez-like open levels: streets, mines, the Well) search down from the hero's height, not from the sky
      const d = G.WORLD2.regions[G.WORLD2.active], y0 = d && d.outdoor === false ? Math.max(16, L.spawn.y - 8 * 16) : (dy || 0) * 16 + 16;
      pl.y = L.groundBelow(pl.x, y0, 4000) || L.spawn.y; pl.vx = pl.vy = 0;
      for (const e of G.world.enemies) if (Math.abs(e.x - pl.x) < 90) e.x += 160;
      G.cam.snap(pl.x, pl.y - 40);
    }, [x, dy]);
    await T.tick(p, 50); await T.drain(p);
  };
  if (what === 'all' || what === 'regions') {
    for (const [r, fr] of NEW) {
      await go(r);
      const pw = await W(() => G.level.pw), open = await W(() => !!G.level.isOpen);
      for (const f of fr) { await spotAt(pw * f, open ? 0 : 30); await T.shot(p, `s5hd_${r}_${Math.round(f * 100)}`); }
    }
  }
  if (what === 'all' || what === 'gates') {
    const at = async (r, kind, dx) => {
      await go(r);
      const o = await W(kind => { const o = G.level.w2.objs.find(o => o.type === kind || (o.type === 'exit' && o.ex.kind === kind)); if (!o) return null; const d = o.doors && o.doors.find(d => d.kind !== 'open'); return { x: o.x, y: o.y, door: d ? { x: d.x, y: d.y, side: d.side } : null }; }, kind);
      if (!o) return console.error('no', kind, 'in', r);
      if (o.door) {
        // a door in a house wall: stand outside it, on its floor (not on the roof)
        await W(d => { const pl = G.world.player; pl.x = d.x + (d.side === 'w' ? -44 : 44); pl.y = d.y - 1; pl.vx = pl.vy = 0; pl.facing = d.side === 'w' ? 1 : -1; for (const e of G.world.enemies) if (Math.abs(e.x - pl.x) < 120) e.x += 220; G.cam.snap(pl.x, pl.y - 40); }, o.door);
        await T.tick(p, 50); await T.drain(p);
      } else if (kind === 'dive' && o.y) {
        await W(([x, y]) => { const pl = G.world.player; pl.x = x; pl.y = y - 1; pl.vx = pl.vy = 0; for (const e of G.world.enemies) if (Math.abs(e.x - pl.x) < 120) e.x += 220; G.cam.snap(pl.x, pl.y - 40); }, [o.x + (dx || -60), o.y]);
        await T.tick(p, 50); await T.drain(p);
      } else await spotAt(o.x + (dx || -60));
      await T.shot(p, `s5hd_gate_${kind}_${r}`);
    };
    await at('cloister', 'singersdoor'); await at('ark', 'divandoor'); await at('streets', 'songdoor');
    await at('old', 'dive', 50); await at('spine', 'updraft', -70); await at('ark', 'house', -40);
    await go('tower'); { const x = await W(() => { const o = G.level.w2.objs.find(o => o.type === 'exit' && o.ex.id === 'top'); return o.x; }); await spotAt(x - 60); await T.shot(p, 's5hd_gate_lair_tower'); }
    await go('karez'); { const x = await W(() => { const o = G.level.w2.objs.find(o => o.type === 'exit' && o.ex.id === 'archive'); return o ? o.x : null; }); if (x) { await spotAt(x - 50, 0); await T.shot(p, 's5hd_gate_lightcrack_karez'); } }
  }
  if (what === 'all' || what === 'map') {
    // many regions revealed: every region of the waking city visited, a few marks
    await W(() => { const s = G.WORLD2.S(); for (const id in G.WORLD2.regions) { const r = G.WORLD2.regions[id]; if (!r.arena && r.tier !== 'dream') s.visited[id] = s.visited[id] || Date.now(); } G.WORLD2.story.progress(); });
    await go('bazaar');
    await p.keyboard.press('KeyM'); await T.tick(p, 30); await T.shot(p, 's5hd_map_world');
    await p.keyboard.press('Escape'); await T.tick(p, 10);
    await T.shot(p, 's5hd_hud_objective');
  }
  console.log(JSON.stringify({ errs: p._errs.slice(0, 8) }));
  await b.close();
})();
