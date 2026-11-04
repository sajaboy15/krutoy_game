// Every boss: real kill -> stage cleared -> walk to the door -> press F -> out of the lair.
// Stage 5: ?stage=N for a boss enters its lair in the open city; the door leads back to the region that
// holds the lair's gate (the Vault, still linear, leads into the world: the Tail's chaikhana).
const L = require('./lib');
async function drain(p) {
  for (let i = 0; i < 300; i++) {
    await L.tick(p, 8);
    const m = await L.modal(p);
    if (!m) { await L.tick(p, 10); if (!(await L.modal(p))) return; continue; }
    if (m.type === 'choice') { await L.tick(p, 14); await p.evaluate(() => { G.UI._debug().modal.sel = 0; }); }
    await L.press(p, 'Enter'); await L.press(p, 'Enter');
  }
}
(async () => {
  const b = await L.chromium.launch();
  const out = {};
  const idx = [1, 5, 9, 12, 16, 20, 23, 31];
  for (const pi of idx) {
    const p = await L.open(b, '?stage=' + pi + '&god'); p.on('crash', () => console.log('CRASH', pi));
    await L.tick(p, 40); await drain(p);
    const r = out[pi] = {};
    r.lair = await p.evaluate(() => G.WORLD2.active || G.Game.stage.plan.id);
    for (let i = 0; i < 120; i++) { if (await p.evaluate(() => !!G.Game.stage.bossStarted)) break; await p.evaluate(() => { G.world.player.x += 8; }); await L.tick(p, 2); }
    await L.tick(p, 20); await drain(p); await L.tick(p, 260);
    for (let k = 0; k < 40; k++) {
      const done = await p.evaluate(() => { const bz = G.Game.boss; if (!bz || bz.dead || bz.hp <= 0) return true; if (bz.mode === 'fight') G.Combat.hit(G.world.player, bz, { dmg: 400, type: 'test' }); return false; });
      if (done) break;
      await L.tick(p, 30); await drain(p);
    }
    await L.tick(p, 420); await drain(p); await L.tick(p, 60); await drain(p);
    r.cleared = await p.evaluate(() => G.Game.stage.cleared);
    r.door = await p.evaluate(() => { const d = G.world.interactables.find(o => o.art === 'door'); return d ? { x: Math.round(d.x), y: Math.round(d.y), hidden: !!d.hidden, canUse: d.canUse ? d.canUse() : null } : null; });
    if (r.door) {
      await p.evaluate(() => { const d = G.world.interactables.find(o => o.art === 'door'); const pl = G.world.player; pl.x = d.x; pl.y = d.y - 1; pl.vx = 0; });
      await L.tick(p, 10);
      r.nearby = await p.evaluate(() => { const n = G.world.player.nearby; return n ? n.art + ':' + n.prompt : null; });
      await L.press(p, 'KeyF');
      await L.tick(p, 30); await drain(p); await L.tick(p, 120); await drain(p);
      await p.waitForTimeout(200); await L.tick(p, 60);
    }
    r.lair = r.lair || null;
    r.after = await p.evaluate(() => G.run.planIndex + ':' + G.Game.state + ':' + (G.WORLD2.active || '-') + (G.WORLD2.inside ? '/' + G.WORLD2.inside : ''));
    r.expect = await p.evaluate(pi => { const b = G.WORLD2.story.BEATS[pi]; if (!b || !b.arena) return pi === 1 ? 'tail/tail_plane' : null; return G.WORLD2.regions[b.arena].out[0]; }, pi);
    r.ok = pi === 31 ? /victory/.test(r.after) : (!!r.expect && r.after.split(':')[2] === r.expect && r.cleared);   // the nest ends in the finale
    r.recorded = await p.evaluate(() => Object.keys((G.WORLD2.S() || {}).bosses || {}));
    r.errs = p._errs;
    await L.shot(p, 'bossexit_' + pi);
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})();
