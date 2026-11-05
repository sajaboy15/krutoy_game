// Stage 8b (89o, 89p): new enemy types spawn and act, elite modifiers, the eight minibosses' mechanics. node test/s8b_mb.js
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'rabat', lang: 'ru' });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const tick = n => W(n => { for (let i = 0; i < n; i++) { G.debugTick(1); const pl = G.world.player; pl.hp = pl.maxHp; } }, n);
  const res = {};
  // every new type: spawn near, let it fight for a while
  res.types = await W(() => {
    const ids = Object.keys(G.Enemies.defs).filter(k => /^yd_(porter|mob|chorister|mentor|shieldman|netman|captain|oilthrower|fence|claycrawler|fireflies|saltsnake|convict|vulture|mask|burner|cub|vertguard|sandshade|nightflame)$/.test(k));
    return ids.length;
  });
  const ids = await W(() => Object.keys(G.Enemies.defs).filter(k => /^yd_(porter|mob|chorister|mentor|shieldman|netman|captain|oilthrower|fence|claycrawler|fireflies|saltsnake|convict|vulture|mask|burner|cub|vertguard|sandshade|nightflame)$/.test(k)));
  for (const id of ids) {
    await W(id => { for (const e of G.world.enemies) e.dead = true; const p = G.world.player; G.Enemies.spawn(id, p.x + 80, p.y); }, id);
    await tick(40);
  }
  // elites with modifiers
  res.elites = await W(() => { for (const e of G.world.enemies) e.dead = true; const p = G.world.player; const out = []; for (let i = 0; i < 6; i++) { const e = G.Enemies.spawn('guard', p.x + 60 + i * 20, p.y, { elite: true }); out.push(e._mods.join('+')); } return out; });
  await tick(80);
  // minibosses
  const mbs = ['tandirchi', 'auctioneer', 'plume', 'vultures', 'claygolem', 'overseer', 'banner', 'bride'];
  res.mb = {};
  for (const id of mbs) {
    res.mb[id] = await W(async id => {
      for (const e of G.world.enemies) e.dead = true;
      const p = G.world.player; const e = G.Enemies.spawn('mb_' + id, p.x + 70, p.y, { elite: true });
      if (!e) return 'no spawn';
      e.aggro = true;
      const hp0 = e.hp, out = { mods: (e._mods || []).length };
      for (let i = 0; i < 200; i++) { G.debugTick(1); p.hp = p.maxHp; }
      out.alive = !e.dead;
      // a frontal light blow
      p.x = e.x - 30; p.facing = 1; e.facing = -1; e.teleT = 0;
      const h = G.Combat.hit(p, e, { dmg: 10, type: 'melee', dir: 1 });
      out.frontHit = h;
      if (id === 'banner') { const bn = G.world.enemies.find(o => o.def.id === 'yd_banner' && !o.dead); out.banner = !!bn; if (bn) { bn.hp = 1; G.Combat.hit(p, bn, { dmg: 10, type: 'melee', dir: 1 }); } out.afterBanner = G.Combat.hit(p, e, { dmg: 10, type: 'melee', dir: 1 }); }
      if (id === 'overseer') out.hostages = G.world.enemies.filter(o => o._of === e && !o.dead).length;
      if (id === 'claygolem') { G.Combat.hit(p, e, { dmg: 99999, type: 'melee', dir: 1, heavy: true }); out.crumb = e._crumb > 0 && !e.dead; const o = e._pour; G.run.flasks = 2; if (o) o.onUse(p, o); out.washed = e.dead; }
      if (id === 'auctioneer') { out.cd = ['skill1', 'skill2'].map(k => G.run.slots[k] ? G.run.slots[k].cd : null); }
      if (id === 'vultures') out.adds = G.world.enemies.filter(o => !o.dead && o.def.id === 'yd_vulture').length;
      e.hp = 1; e.invulnT = 0; e._crumb = 0; e._reform = 0; e._open = 99; e._banner && (e._banner.dead = true);
      for (const o of G.world.enemies) if (o._of === e) o.dead = true;
      G.Combat.hit(p, e, { dmg: 50, type: 'magic', dir: 1, heavy: true });
      out.killed = e.dead;
      return out;
    }, id);
  }
  console.log(JSON.stringify(res), p._errs.slice(0, 6), (await T.untranslated(p)).filter(s => !/^Level|^Talk/.test(s)).slice(0, 8));
  await b.close();
})();
