// Stage 4 — the open world frame: every exit both ways, persistence across regions / rest / save-load,
// shortcuts, the light gate and the hook gate, chaikhanas and fast travel, day/night and rest skips, the map.
//   YODGOR_OUT=... YODGOR_SHOTS=... node test/s4_world.js [part]
const L = require('./s4_lib');
const part = process.argv[2] || 'all';
const R = { ok: [], fail: [] };
const check = (name, cond, extra) => { (cond ? R.ok : R.fail).push(name + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); if (!cond) console.log('FAIL', name, JSON.stringify(extra)); };
const near = (a, b, d) => a && b && Math.abs(a.x - b.x) <= (d || 3) && Math.abs(a.y - b.y) <= (d || 3);

async function entryOf(p, id) { return p.evaluate(id => { const e = G.level.w2.entries[id]; return e ? { x: Math.round(e.x / 16), y: Math.round(e.y / 16) } : null; }, id); }
async function through(p, exitId, wantRegion, wantEntry) {
  const r = await L.useExit(p, exitId);
  if (r !== 'ok') { check('exit ' + exitId, false, r); return false; }
  await L.settle(p);
  const i = await L.info(p), e = await entryOf(p, wantEntry);
  check(`${exitId} -> ${wantRegion}.${wantEntry}`, i.region === wantRegion && near(i, e), { i, e });
  return i.region === wantRegion;
}
const W = (p, f, a) => p.evaluate(f, a);

(async () => {
  const b = await L.chromium.launch();
  const p = await L.openWorld(b, '?world=tail&god');
  await L.settle(p);
  const t0 = Date.now();

  /* ------------------------------------------------ 1. every exit both ways */
  if (part === 'all' || part === 'exits') {
    const pairs = [
      ['tail', 'east', 'bazaar', 'west'], ['bazaar', 'west', 'tail', 'east'],
      ['tail', 'west', 'potters', 'east'], ['potters', 'east', 'tail', 'west'],
      ['tail', 'well', 'karez', 'tail_well'], ['karez', 'tail_well', 'tail', 'well'],
      ['karez', 'bazaar_drain', 'bazaar', 'drain'], ['bazaar', 'drain', 'karez', 'bazaar_drain'],
      ['karez', 'potters_drain', 'potters', 'kiln'], ['potters', 'kiln', 'karez', 'potters_drain']
    ];
    for (const [from, ex, to, en] of pairs) {
      if ((await L.info(p)).region !== from) { await W(p, r => G.WORLD2.go(r, 'start', { now: true }), from); await L.settle(p); }
      await through(p, ex, to, en);
    }
    // closed exits say why and stay closed
    await W(p, () => G.WORLD2.go('tail', 'start', { now: true })); await L.settle(p);
    const r1 = await L.useExit(p, 'rabat'); await L.tick(p, 20);
    const said = await L.modal(p);
    await L.advance(p, 10);
    check('rabat road closed, he says why', r1 === 'ok' && (await L.info(p)).region === 'tail' && said && said.type === 'dialog', said);
    // a real walk: from the Tail's west entry, hold A until the arch takes us to the Potters
    await W(p, () => G.WORLD2.go('tail', 'west', { now: true })); await L.settle(p);
    await p.keyboard.down('KeyA'); for (let i = 0; i < 20; i++) { await L.tick(p, 10); if ((await W(p, () => !!G.Game.fadeCb || G.WORLD2.busy))) break; } await p.keyboard.up('KeyA');
    await L.settle(p);
    check('walk west through the arch', (await L.info(p)).region === 'potters', await L.info(p));
  }

  /* ------------------------------------------------ 2. persistence: chest, cache, kills, miniboss */
  if (part === 'all' || part === 'persist') {
    await W(p, () => G.WORLD2.go('tail', 'west', { now: true })); await L.settle(p);
    const before = await W(p, () => {
      const ch = G.world.interactables.find(o => o.art === 'chest' && !o.open);
      const ca = G.world.interactables.find(o => o.art === 'ydCache' && o._w2 && !o.dead);
      const pl = G.world.player;
      if (ch) { pl.x = ch.x; pl.y = ch.y; ch.use(pl); }
      if (ca) { pl.x = ca.x; pl.y = ca.y; ca.use(pl); }
      // kill three ordinary enemies and the miniboss
      const es = G.world.enemies.filter(e => !e.dead && !e._w2mb && e._w2id).slice(0, 3);
      for (const e of es) e.die ? e.die({}) : (e.hp = 0);
      const mb = G.world.enemies.find(e => e._w2mb);
      if (mb) mb.die ? mb.die({}) : (mb.hp = 0);
      return { chest: ch && ch._w2, cache: ca && ca._w2, killed: es.map(e => e._w2id), mb: mb && mb._w2mb, n: G.world.enemies.filter(e => !e.dead).length };
    });
    await L.tick(p, 30);
    const s1 = await W(p, () => { const s = G.WORLD2.S(); return { open: Object.keys(s.open), taken: Object.keys(s.taken), killed: s.killed.tail || [], mb: Object.keys(s.mb) }; });
    check('chest recorded', before.chest && s1.open.includes(before.chest), { before, s1 });
    check('cache recorded', before.cache && s1.taken.includes(before.cache));
    check('kills recorded', before.killed.every(k => s1.killed.includes(k)), s1.killed);
    check('miniboss recorded', before.mb && s1.mb.includes(before.mb));
    await L.useExit(p, 'east'); await L.settle(p);
    await L.useExit(p, 'west'); await L.settle(p);
    const after = await W(p, ids => {
      const ch = G.world.interactables.find(o => o._w2 === ids.chest);
      const ca = G.world.interactables.find(o => o._w2 === ids.cache && !o.dead);
      const alive = G.world.enemies.filter(e => !e.dead).map(e => e._w2id);
      return { chestOpen: !!(ch && ch.open), cacheGone: !ca, killedBack: ids.killed.filter(k => alive.includes(k)), mbBack: alive.includes(ids.mb), n: alive.length };
    }, before);
    check('chest stays open after leaving', after.chestOpen, after);
    check('cache stays taken', after.cacheGone);
    check('killed enemies stay dead until rest', after.killedBack.length === 0, after);
    check('miniboss stays dead', !after.mbBack);
    R.persist = { before, after };
  }

  /* ------------------------------------------------ 3. shortcuts: Mehri's gate (from the yard), the karez grate (from the Bazaar side) */
  if (part === 'all' || part === 'shortcut') {
    await W(p, () => G.WORLD2.go('tail', 'west', { now: true })); await L.settle(p);
    const outside = await W(p, () => {
      const d = G.world.interactables.find(o => o.art === 'w2door'); const pl = G.world.player;
      pl.x = d.x - 20; pl.y = d.y; d.use(pl);
      return { open: d.isOpen, solid: G.level.solidPx(d.x - 8, d.y - 20) || G.level.solidPx(d.x + 8, d.y - 20) };
    });
    check('Mehri gate stays shut from the street', !outside.open && outside.solid, outside);
    await W(p, () => G.WORLD2.go('tail', 'well', { now: true })); await L.settle(p);
    const inside = await W(p, () => {
      const d = G.world.interactables.find(o => o.art === 'w2door'); const pl = G.world.player;
      const fromYard = pl.x > d.x;
      pl.x = d.x + 20; d.use(pl);
      return { fromYard, open: d.isOpen, solid: G.level.solidPx(d.x - 8, d.y - 20) || G.level.solidPx(d.x + 8, d.y - 20) };
    });
    check('arrive from the well inside the yard', inside.fromYard, inside);
    check('Mehri gate opens from the yard', inside.open && !inside.solid, inside);
    await L.shot(p, 's4_shortcut_open');
    await L.useExit(p, 'east'); await L.settle(p); await L.useExit(p, 'west'); await L.settle(p);
    const again = await W(p, () => { const d = G.world.interactables.find(o => o.art === 'w2door'); return { open: d.isOpen, solid: G.level.solidPx(d.x - 8, d.y - 20) || G.level.solidPx(d.x + 8, d.y - 20) }; });
    check('Mehri gate stays open', again.open && !again.solid, again);
    // the grate: from the Tail side (west) it will not move; from the Bazaar side it rises
    await W(p, () => G.WORLD2.go('karez', 'tail_well', { now: true })); await L.settle(p);
    const g1 = await W(p, () => { const g = G.world.interactables.find(o => o.art === 'w2grate'); const pl = G.world.player; pl.x = g.x - 24; pl.y = g.y; g.use(pl); return { open: g.isOpen }; });
    check('grate shut from the west', !g1.open, g1);
    const g2 = await W(p, () => { const g = G.world.interactables.find(o => o.art === 'w2grate'); const pl = G.world.player; pl.x = g.x + 24; pl.y = g.y; g.use(pl); return { open: g.isOpen }; });
    await L.tick(p, 80);
    const g3 = await W(p, () => { const g = G.world.interactables.find(o => o.art === 'w2grate'); return { open: g.isOpen, passable: !G.level.solidPx(g.x - 8, g.y - 24) && !G.level.solidPx(g.x + 8, g.y - 24) }; });
    check('grate opens from the east and becomes passable', g2.open && g3.passable, { g2, g3 });
    await L.shot(p, 's4_grate_open');
    await L.useExit(p, 'bazaar_drain'); await L.settle(p); await L.useExit(p, 'drain'); await L.settle(p);
    const g4 = await W(p, () => { const g = G.world.interactables.find(o => o.art === 'w2grate'); return { open: g.isOpen, passable: !G.level.solidPx(g.x - 8, g.y - 24) }; });
    check('grate stays open after leaving', g4.open && g4.passable, g4);
  }

  /* ------------------------------------------------ 4. ability gates: Sado's light, the hook */
  if (part === 'all' || part === 'gates') {
    // without light the hatch stays a floor
    await W(p, () => { delete G.WORLD2.S().keys.light; G.WORLD2.go('potters', 'east', { now: true }); }); await L.settle(p);
    const l0 = await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'lightfloor'); const pl = G.world.player; pl.x = o.x; pl.y = o.y - 2; return { gid: o.gid, x: o.x, y: o.y }; });
    await L.tick(p, 30);
    const l1 = await W(p, o => ({ open: G.WORLD2.isOpen(o.gid), solid: G.level.solidPx(o.x, o.y + 4) }), l0);
    check('hatch closed without the light', !l1.open && l1.solid, l1);
    await W(p, () => { G.WORLD2.S().keys.light = 1; });
    await W(p, o => { const pl = G.world.player; pl.x = o.x - 60; pl.y = o.y; }, l0); await L.tick(p, 10);
    await L.shot(p, 's4_light_glyphs');
    await W(p, o => { const pl = G.world.player; pl.x = o.x; pl.y = o.y - 2; }, l0); await L.tick(p, 40);
    const l2 = await W(p, o => ({ open: G.WORLD2.isOpen(o.gid), solid: G.level.solidPx(o.x, o.y + 4), y: Math.round(G.world.player.y / 16) }), l0);
    check('hatch opens in Sado light', l2.open && !l2.solid, l2);
    await L.tick(p, 60);
    await L.shot(p, 's4_light_open');
    await L.useExit(p, 'east'); await L.settle(p); await L.useExit(p, 'west'); await L.settle(p);
    const l3 = await W(p, o => ({ open: G.WORLD2.isOpen(o.gid), solid: G.level.solidPx(o.x, o.y + 4) }), l0);
    check('hatch stays open', l3.open && !l3.solid, l3);
    // the karez wall that only her light shows
    await W(p, () => G.WORLD2.go('karez', 'tail_well', { now: true })); await L.settle(p);
    const w1 = await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'lightwall'); const pl = G.world.player; pl.x = o.x - o.dir * 20; pl.y = o.y; return { gid: o.gid, x: o.x, y: o.y, dir: o.dir }; });
    await L.tick(p, 40);
    const w2 = await W(p, o => ({ open: G.WORLD2.isOpen(o.gid), passable: !G.level.solidPx(o.x, o.y - 8) }), w1);
    check('karez light wall opens', w2.open && w2.passable, w2);
    // the hook: from Rustam in the Tail chaikhana
    await W(p, () => G.WORLD2.go('tail', 'chai:tail_plane', { inside: 'tail_plane', now: true })); await L.settle(p);
    check('inside the chaikhana', (await L.info(p)).inside === 'tail_plane' && (await L.info(p)).pi === await W(p, () => G.WORLD2.WRI));
    // stage 5: the Tail's chaikhana serves the first rest of the story (r_plane) — its arrival, then Rustam's
    // memory (choices), then the hook from his bag
    const S5 = require('./s5_lib');
    await L.tick(p, 120); await S5.drain(p); await L.use(p, 'aksakal'); await S5.drain(p);
    check('Rustam gives the hook', await W(p, () => G.WORLD2.hasKey('hook')));
    // the story would now open the Tail's morning chapter; its scenes are not what this test looks at
    await W(p, () => { const at = G.YODGOR.run.at; at['start:a1_tail'] = 1; at['mid:a1_tail'] = 1; at['exit:a1_tail'] = 1; });
    await W(p, () => G.Game.exitStage()); await L.settle(p);
    check('out of the chaikhana at its door', (await L.info(p)).region === 'tail' && near(await L.info(p), await entryOf(p, 'chai:tail_plane')), await L.info(p));
    const h0 = await W(p, () => { const o = G.level.w2.objs.find(o => o.type === 'hooktower'); const pl = G.world.player; pl.x = o.ring.x - 70; pl.y = (o.roof.y + 10) * 16 + 16 * 0; pl.facing = 1; return { ring: o.ring, roof: o.roof, top: { x: o.x, y: o.y } }; });
    await W(p, h => { const pl = G.world.player; pl.y = G.level.groundBelow(pl.x, h.ring.y + 40, 600) || pl.y; }, h0);
    await L.tick(p, 10); await p.waitForTimeout(300); await L.tick(p, 2);
    const reach = await W(p, () => !!G.WORLD2.ringInReach());
    await L.shot(p, 's4_hook_ring');
    const used = await W(p, () => G.WORLD2.useHook());
    for (let i = 0; i < 12; i++) await L.tick(p, 6);
    await L.shot(p, 's4_hook_flight');
    await L.tick(p, 60);
    const h1 = await W(p, h => { const pl = G.world.player; return { x: Math.round(pl.x), y: Math.round(pl.y), onRoof: Math.abs(pl.y - h.top.y) < 4 && pl.onGround }; }, h0);
    check('hook ring in reach', reach);
    check('hook pulls him onto the roof', used && h1.onRoof, { h0, h1 });
    await L.shot(p, 's4_hook_roof');
    // pulling a light enemy
    const pull = await W(p, () => {
      const pl = G.world.player; pl.x = 200 * 16; pl.y = G.level.groundBelow(pl.x, 10, 2000); pl.facing = 1;
      const e = G.Enemies.spawn('rat_div', pl.x + 100, pl.y); const x0 = e.x;
      G.WORLD2.useHook();
      for (let i = 0; i < 10; i++) G.debugTick(1);
      return { moved: Math.round(x0 - e.x) };
    });
    check('hook pulls a light enemy', pull.moved > 20, pull);
  }

  /* ------------------------------------------------ 5. chaikhanas: rest, enemies return, bench, travel */
  if (part === 'all' || part === 'chai') {
    await W(p, () => G.WORLD2.go('bazaar', 'chai:bazaar_salt', { inside: 'bazaar_salt', now: true })); await L.settle(p);
    check('bazaar chaikhana discovered', await W(p, () => !!G.WORLD2.S().chai.bazaar_salt));
    await W(p, () => G.WORLD2.go('tail', 'chai:tail_plane', { inside: 'tail_plane', now: true })); await L.settle(p);
    const rugs = () => W(p, () => G.world.interactables.filter(o => o.art === 'shopRug').sort((a, b) => a.x - b.x).map(o => (o.item ? o.item.id + ':' + (o.item.q || 0) : 'food') + '@' + o.price));
    const st0 = await rugs();
    await W(p, () => G.Game.exitStage()); await L.settle(p);
    await W(p, () => G.WORLD2.go('tail', 'chai:tail_plane', { inside: 'tail_plane', now: true })); await L.settle(p);
    const st1 = await rugs();
    check('the rugs keep their goods for the day', st0.length > 0 && JSON.stringify(st0) === JSON.stringify(st1), { st0, st1 });
    const k0 = await W(p, () => Object.values(G.WORLD2.S().killed).reduce((a, b) => a + b.length, 0));
    await W(p, () => { G.world.player.hp = 10; G.run.flasks = 0; });
    await L.use(p, 'samovar'); await L.tick(p, 20);
    const menu = await L.modal(p);
    await L.shot(p, 's4_chai_menu');
    check('dastarkhan menu', menu && menu.type === 'choice' && menu.options.length >= 5, menu);
    await L.choose(p, (await W(p, () => G.LANG.t(`Sleep until morning|Спать до утра|Tonggacha uxlash`))));
    await L.tick(p, 30);
    const st = await W(p, () => { const s = G.WORLD2.S(), cp = G.YODGOR.checkpoint; return { clock: Math.round(s.clock), day: s.day, bench: s.bench, killed: Object.values(s.killed).reduce((a, b) => a + b.length, 0), hp: G.world.player.hp, max: G.world.player.maxHp, flasks: G.run.flasks, cpPi: cp && cp.run.planIndex, cpInside: cp && cp.rpg.world.cur.inside }; });
    check('rest to morning', st.clock < 5 && st.day >= 2, st);
    check('rest heals and refills', st.hp === st.max && st.flasks > 0, st);
    check('rest brings the enemies back', st.killed === 0 && k0 >= 0, { k0, st });
    check('rest sets the bench and saves', st.bench && st.bench.chai === 'tail_plane' && st.cpPi === await W(p, () => G.WORLD2.WRI) && st.cpInside === 'tail_plane', st);
    // travel from here to the bazaar's chaikhana (stage 5: after a rest Sado's lullaby comes in the first quiet moment)
    await L.tick(p, 30); await require('./s5_lib').drain(p);
    await L.use(p, 'samovar'); await L.tick(p, 20);
    await L.choose(p, await W(p, () => G.LANG.t(`Travel to another chaikhana…|Перейти в другую чайхану…|Boshqa choyxonaga o'tish…`)));
    await L.tick(p, 20);
    await L.shot(p, 's4_chai_travel');
    await L.choose(p, await W(p, () => G.LANG.t(G.WORLD2.chaiDef('bazaar_salt').name)   /* stage 5: the bazaar's chaikhana is the Copper Row now */));
    await L.settle(p);
    const tr = await L.info(p);
    check('fast travel lands in the other chaikhana', tr.region === 'bazaar' && tr.inside === 'bazaar_salt', tr);
    const nt = await W(p, () => G.WORLD2.travel('tail_plane'));
    await L.settle(p);
    check('travel from the dastarkhan api', nt && (await L.info(p)).inside === 'tail_plane');
    // not from the street
    await W(p, () => G.Game.exitStage()); await L.settle(p);
    check('no travel from the street', !(await W(p, () => G.WORLD2.travel('bazaar_salt'))));
    // death returns to the bench
    await W(p, () => { G.godMode = false; const pl = G.world.player; G.WORLD2.go('bazaar', 'west', { now: true }); });
    await L.settle(p);
    await W(p, () => { const pl = G.world.player; pl.hp = 0; pl.die({}); });
    for (let i = 0; i < 40; i++) { await L.tick(p, 10); if (await W(p, () => G.Game.state === 'dead')) break; }
    await W(p, () => { G.godMode = true; G.Game.retryStage(); });
    await L.settle(p, 80);
    const dd = await L.info(p);
    check('death returns to the last chaikhana', dd.region === 'tail' && near(dd, await entryOf(p, 'chai:tail_plane'), 4), dd);
  }

  /* ------------------------------------------------ 6. day and night */
  if (part === 'all' || part === 'time') {
    await W(p, () => { G.WORLD2.setHour(19.6); G.WORLD2.go('tail', 'west', { now: true }); }); await L.settle(p);
    const d0 = await W(p, () => ({ ph: G.WORLD2.phase(), k: G.WORLD2.nightK(), biome: G.level.biome.id, tint: G.WORLD2.tint() }));
    await W(p, () => { G.WORLD2.timeScale = 30; });
    for (let i = 0; i < 20; i++) await L.tick(p, 30);
    await W(p, () => { G.WORLD2.timeScale = 1; });
    const d1 = await W(p, () => ({ ph: G.WORLD2.phase(), k: G.WORLD2.nightK(), tint: G.WORLD2.tint(), h: G.WORLD2.clockText() }));
    check('the clock runs into the evening/night', d1.k > d0.k, { d0, d1 });
    check('the light darkens', !!d1.tint, d1);
    await L.shot(p, 's4_tail_dusk');
    const nDay = await W(p, () => G.world.enemies.filter(e => !e.dead).length);
    await W(p, () => { G.WORLD2.setHour(23); G.WORLD2.go('tail', 'west', { now: true }); }); await L.settle(p);
    const d2 = await W(p, () => ({ biome: G.level.biome.id, night: G.world.enemies.filter(e => e._w2night).length, n: G.world.enemies.filter(e => !e.dead).length }));
    check('night look and night spawns', d2.biome === 'w_tail_night' && d2.night > 0, { d2, nDay });
    await L.shot(p, 's4_tail_night');
    // shops: the bazaar's cloth row by night is the secret market
    await W(p, () => G.WORLD2.go('bazaar', 'west', { now: true })); await L.settle(p);
    const sm = await W(p, () => ({ secret: G.WORLD2.shopOpen('secret'), day: G.WORLD2.shopOpen('bazaar'), lamp: !!G.world.interactables.find(o => o.art === 'w2bag'), shut: !!G.world.interactables.find(o => o.art === 'w2shut') }));
    check('secret market at night, the day rows shut', sm.secret && !sm.day && sm.lamp && sm.shut, sm);
    await L.shot(p, 's4_bazaar_night');
    // schedules
    const sch = await W(p, () => { const W2 = G.WORLD2; W2.setHour(10); const a = W2.where('mehri'); W2.setHour(20); const b2 = W2.where('mehri'); W2.setHour(2); const c = W2.where('mehri'); return { a, b2, c }; });
    check('schedule: Mehri by day at her gate, evening in the chaikhana, night nowhere', sch.a && sch.a.spot === 'yard_gate' && sch.b2 && /chai:tail_plane/.test(sch.b2.spot) && !sch.c, sch);
    // rest to night
    await W(p, () => { G.WORLD2.setHour(9); G.WORLD2.go('tail', 'chai:tail_plane', { inside: 'tail_plane', now: true }); }); await L.settle(p);
    await W(p, () => G.WORLD2.rest('night'));
    check('rest until night', await W(p, () => G.WORLD2.phase() === 'night' || G.WORLD2.hour() >= 22), await W(p, () => G.WORLD2.clockText()));
    await W(p, () => G.WORLD2.rest('morning'));
  }

  /* ------------------------------------------------ 7. the map */
  if (part === 'all' || part === 'map') {
    await W(p, () => G.WORLD2.go('tail', 'west', { now: true })); await L.settle(p);
    for (let i = 0; i < 30; i++) { await W(p, () => { G.world.player.x += 120; }); await L.tick(p, 12); }
    await W(p, () => G.WORLD2.flushSeen());
    const seen = await W(p, () => ({ tail: G.WORLD2.seenCount('tail'), bazaar: G.WORLD2.seenCount('bazaar') }));
    check('map cells revealed as seen', seen.tail > 10, seen);
    await p.keyboard.press('KeyM'); await L.tick(p, 20);
    check('map opens with M', await W(p, () => G.WORLD2.mapOpen));
    await L.shot(p, 's4_map_world');
    await p.keyboard.press('Enter'); await L.tick(p, 20);
    await L.shot(p, 's4_map_tail');
    await p.keyboard.press('Escape'); await L.tick(p, 5); await p.keyboard.press('ArrowRight'); await L.tick(p, 5); await p.keyboard.press('Enter'); await L.tick(p, 20);
    await L.shot(p, 's4_map_region2');
    await p.keyboard.press('Escape'); await L.tick(p, 5); await p.keyboard.press('Escape'); await L.tick(p, 20);
    check('map closes', !(await W(p, () => G.WORLD2.mapOpen)));
    // a quest mark and the objective line
    await W(p, () => { G.WORLD2.mark('test', 'tail', 'yard_gate', 'quest', `Mehri's gate|Ворота Мехри|Mehrining darvozasi`); G.WORLD2.objective(`Talk to Mehri at her gate|Поговори с Мехри у её ворот|Mehri bilan darvozasi oldida gaplash`); });
    await p.keyboard.press('KeyM'); await L.tick(p, 10); await p.keyboard.press('Enter'); await L.tick(p, 20);
    await L.shot(p, 's4_map_mark');
    await p.keyboard.press('Escape'); await L.tick(p, 5); await p.keyboard.press('Escape'); await L.tick(p, 20);
    // from the pause menu
    await p.keyboard.press('Escape'); await L.tick(p, 20);
    await L.shot(p, 's4_pause_map_hint');
    await p.keyboard.press('KeyM'); for (let i = 0; i < 20; i++) { await L.tick(p, 4); await p.waitForTimeout(60); if (await W(p, () => G.WORLD2.mapOpen)) break; }
    check('map from the pause menu', await W(p, () => G.WORLD2.mapOpen));
    await p.keyboard.press('Escape'); await L.tick(p, 20);
    // map travel from a chaikhana (the bazaar's must be known first)
    await W(p, () => G.WORLD2.go('bazaar', 'chai:bazaar_salt', { inside: 'bazaar_salt', now: true })); await L.settle(p);
    await W(p, () => G.WORLD2.go('tail', 'chai:tail_plane', { inside: 'tail_plane', now: true })); await L.settle(p);
    await p.keyboard.press('KeyM'); await L.tick(p, 10);
    await W(p, () => { G.WORLD2.map.sel = 'bazaar'; }); await p.keyboard.press('KeyT'); await L.tick(p, 10);
    await L.settle(p);
    check('travel from the map in a chaikhana', (await L.info(p)).inside === 'bazaar_salt', await L.info(p));
  }

  /* ------------------------------------------------ 8. save -> load (slot and autosave) */
  if (part === 'all' || part === 'save') {
    await W(p, () => G.WORLD2.go('tail', 'west', { now: true })); await L.settle(p);
    const snap = await W(p, () => { const s = G.WORLD2.S(); return { open: Object.keys(s.open).sort(), taken: Object.keys(s.taken).sort(), keys: Object.keys(s.keys).sort(), chai: Object.keys(s.chai).sort(), mb: Object.keys(s.mb).sort(), visited: Object.keys(s.visited).sort(), day: s.day }; });
    await L.press(p, 'Escape'); await L.tick(p, 20);
    await W(p, () => { G.UI._debug().modal.sel = 5; }); await L.press(p, 'Enter'); await L.tick(p, 30);
    await W(p, () => { G.UI._debug().modal.sel = 0; }); await L.press(p, 'Enter'); await L.tick(p, 30);
    const slot = await W(p, () => { const c = JSON.parse(localStorage.getItem('yodgor2_slot_1')); return c && { pi: c.run.planIndex, region: c.rpg.world && c.rpg.world.cur.region, land: c.land }; });
    check('saved into slot 1', slot && slot.pi === await W(p, () => G.WORLD2.WPI) && slot.region === 'tail', slot);
    // change things after the save, then load the slot: the slot wins
    await W(p, () => { G.WORLD2.S().open['test:after'] = 1; G.WORLD2.go('bazaar', 'west', { now: true }); }); await L.settle(p);
    await W(p, () => { G.Game.setState('title'); G.UI.openTitle(); }); await L.tick(p, 60);
    const menu = await W(p, () => G.MAIN_MENU.map(m => m.label));
    // stage 5: "New journey" is the open city now; the preview entry is gone
    check('main menu: no preview entry, continue is there', !menu.some(l => /Open City|Открытый город|Ochiq shahar/.test(l)) && menu.some(l => /Continue|Продолжить/.test(l)), menu);
    await W(p, () => G.LOAD_MENU()); await L.tick(p, 20);
    await W(p, () => { const m = G.UI._debug().modal; m.sel = m.options.findIndex(o => /Slot 1|Ячейка 1|Katak 1/.test(o.label)); }); await L.press(p, 'Enter'); await L.tick(p, 40);
    await L.settle(p, 80);
    const loaded = await W(p, () => { const s = G.WORLD2.S(); return { region: G.WORLD2.active, pi: G.run.planIndex, open: Object.keys(s.open).sort(), taken: Object.keys(s.taken).sort(), keys: Object.keys(s.keys).sort(), chai: Object.keys(s.chai).sort(), mb: Object.keys(s.mb).sort(), visited: Object.keys(s.visited).sort(), day: s.day }; });
    check('slot load: back in the Tail', loaded.region === 'tail', loaded);
    check('slot load: world state as saved', JSON.stringify(loaded.open) === JSON.stringify(snap.open) && JSON.stringify(loaded.taken) === JSON.stringify(snap.taken) && JSON.stringify(loaded.keys) === JSON.stringify(snap.keys) && JSON.stringify(loaded.chai) === JSON.stringify(snap.chai) && JSON.stringify(loaded.mb) === JSON.stringify(snap.mb), { snap, loaded });
    if (snap.open.includes('tail:door:mehri:w')) {
      const persistDoor = await W(p, () => { const d = G.world.interactables.find(o => o.art === 'w2door'); return { open: d && d.isOpen, solid: d && (G.level.solidPx(d.x - 8, d.y - 20) || G.level.solidPx(d.x + 8, d.y - 20)) }; });
      check('slot load: the opened shortcut is open', persistDoor.open && !persistDoor.solid, persistDoor);
    }
    // autosave: continue from the main menu
    await W(p, () => G.WORLD2.go('potters', 'east', { now: true })); await L.settle(p);
    await W(p, () => { G.Game.setState('title'); G.UI.openTitle(); }); await L.tick(p, 40);
    await W(p, () => G.YODGOR.continueRun()); await L.settle(p, 80);
    check('continue: the autosave brings him back to the Potters', (await L.info(p)).region === 'potters', await L.info(p));
  }

  /* ------------------------------------------------ 9. frame time: world region vs a linear land */
  if (part === 'all' || part === 'perf') {
    await W(p, () => G.WORLD2.go('tail', 'west', { now: true })); await L.settle(p);
    const meas = async () => W(p, () => { const pl = G.world.player; const ts = []; for (let i = 0; i < 90; i++) { pl.x += 4; const t0 = performance.now(); G.debugTick(1); ts.push(performance.now() - t0); } ts.sort((a, b) => a - b); return { med: +ts[45].toFixed(2), p90: +ts[81].toFixed(2) }; });
    R.perfWorldDay = await meas();
    await W(p, () => { G.WORLD2.setHour(23); G.WORLD2.go('tail', 'west', { now: true }); }); await L.settle(p);
    R.perfWorldNight = await meas();
    await W(p, () => { G.WORLD2.setHour(8); G.WORLD2.go('karez', 'tail_well', { now: true }); }); await L.settle(p);
    R.perfKarez = await meas();
    R.loadMs = await W(p, () => G.WORLD2.stats.lastLoadMs);
    // the same measurement on the linear campaign's Tail (plan entry 3) for comparison
    await W(p, () => { const t0 = performance.now(); G.Game.loadStage(3); window.__lin = performance.now() - t0; }); await L.settle(p);
    await p.evaluate(() => { while (G.UI.isOpen && G.UI.isOpen()) { const m = G.UI._debug().modal; if (!m) break; m.picked = true; break; } });
    R.perfLinear = await meas();
    R.loadLinearMs = Math.round(await W(p, () => window.__lin));
  }
  R.errs = p._errs; R.warns = p._warns; R.secs = Math.round((Date.now() - t0) / 1000);
  console.log(JSON.stringify({ ok: R.ok.length, fail: R.fail, errs: R.errs.slice(0, 8), perf: { worldDay: R.perfWorldDay, worldNight: R.perfWorldNight, karez: R.perfKarez, linearTail: R.perfLinear, loadKarezMs: R.loadMs, loadLinearMs: R.loadLinearMs }, secs: R.secs }, null, 1));
  await b.close();
})();
