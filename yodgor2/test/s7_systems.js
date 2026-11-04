// Stage 7: companion systems — join/leave/approval thresholds, stances, commanded skills,
// downed / revive / out until rest / restAll, roles (taunt, heal < 50%, hook-pull, water + song),
// enemy scaling counts and targeting share, save → load. Zero page errors.
//   node test/s7_systems.js
const L = require('./s7_lib');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const b = await L.chromium.launch();
  // ---- enemy scaling: the same land without and with three companions
  let p = await L.open(b, '?stage=3&god');
  await L.tick(p, 30); await L.drain(p);
  const n0 = await p.evaluate(() => G.world.enemies.filter(e => !e.dead).length);
  await p.close();
  p = await L.open(b, '?stage=3&god&party=alp,nargiza,surayyo');
  await L.tick(p, 30); await L.drain(p);
  const sc = await p.evaluate(async () => {
    let base = 0, extra = 0; const sp = G.Enemies.spawn;
    G.Enemies.spawn = function () { const e = sp.apply(this, arguments); return e; };
    G.Game.loadStage(G.run.planIndex); await new Promise(r => setTimeout(r, 300));
    G.Enemies.spawn = sp;
    for (const e of G.world.enemies) { if (e._partyExtra) extra++; else if (!e.isBoss) base++; }
    return { base, extra };
  });
  const n1 = sc.base + sc.extra;
  await L.tick(p, 20); await L.drain(p);
  ok(Math.abs(n1 / sc.base - 1.6) < 0.06, `enemy count +60% with 3 companions: the land's own ${sc.base} (solo page: ${n0} alive after the intro), with the party ${n1} (×${(n1 / sc.base).toFixed(2)})`);
  const r0 = await p.evaluate(() => ({ act: G.PARTY.active(), n: G.PARTY._px.actors().length, agg: G.PARTY._px.agg }));
  ok(r0.act.length === 3 && r0.n === 3, 'URL ?party joins three companions, three actors in the world');
  ok(Math.abs(r0.agg - 0.3) < 1e-6, 'aggression +30% with three companions (attack cooldowns tick 1.3× faster)');

  // ---- targeting: about a third of the enemies in a fight go for a companion
  const tg = await p.evaluate(() => {
    let toC = 0, all = 0;
    for (let rep = 0; rep < 4; rep++) {
      for (const e of G.world.enemies) e.dead = true; G.debugTick(2);
      const pl = G.world.player, list = G.Enemies.list(G.level.biome.enemyBiome || G.level.biome.id).filter(d => !d.fly && !d.boss);
      for (let i = 0; i < 15; i++) { G.PARTY._px.noScale = true; const e = G.Enemies.spawn(list[i % list.length].id, pl.x + (i % 2 ? 1 : -1) * (60 + i * 6), pl.y - 2, {}); G.PARTY._px.noScale = false; e.aggro = true; }
      G.debugTick(41);
      for (const e of G.world.enemies) if (!e.dead && e.aggro) { all++; if (e._tgt) toC++; }
    }
    for (const e of G.world.enemies) e.dead = true;
    return { toC, all, share: +(toC / all).toFixed(2) };
  });
  ok(tg.share >= 0.22 && tg.share <= 0.45, 'about a third of the enemies go for companions (' + JSON.stringify(tg) + ')');
  // ---- approval thresholds and events
  const ap = await p.evaluate(() => {
    const ev = []; const P = G.PARTY;
    P.on('threshold', (id, kind, up) => ev.push(id + ':' + kind + ':' + (up ? 'up' : 'down')));
    P.on('approval', (id, v) => ev.push(id + '=' + v));
    P.approval('nargiza', 45, 'test'); const talks = P.talks('nargiza');
    P.approval('nargiza', 30); const best = P.best('nargiza');
    P.approval('nargiza', -20);
    let hooked = null; P.hooks.leave = (id, why, done) => { hooked = id + ':' + why; done(); };
    P.approval('surayyo', -60);
    return { ev, talks, best, val: P.approval('nargiza'), mood: P.mood('nargiza'), hookedNow: hooked, surStill: P.has('surayyo') };
  });
  ok(ap.talks && ap.best && ap.val === 55, 'approval: +40 opens talks, +70 the best outcome, value hidden but readable (' + ap.val + ', mood ' + ap.mood + ')');
  ok(ap.ev.includes('nargiza:talks:up') && ap.ev.includes('nargiza:best:up') && ap.ev.includes('nargiza:best:down') && ap.ev.includes('surayyo:leave:up'), 'threshold events: ' + ap.ev.filter(x => x.includes(':')).join(', '));
  await L.tick(p, 30); await L.drain(p);
  const left = await p.evaluate(() => ({ has: G.PARTY.has('surayyo'), m: G.PARTY.member('surayyo').left, actor: !!G.PARTY.actor('surayyo') }));
  ok(!left.has && left.m === 'approval' && !left.actor, 'approval ≤ −50: the leave hook runs as a scene, then Surayyo leaves (' + JSON.stringify(left) + ')');
  await p.evaluate(() => { G.PARTY.hooks.leave = null; G.PARTY.member('surayyo').approval = 0; G.PARTY.join('surayyo'); });
  ok(await p.evaluate(() => G.PARTY.has('surayyo') && !!G.PARTY.actor('surayyo')), 'join() brings her back into the world');
  const lv = await p.evaluate(() => { const r = G.PARTY.leave('alp', 'story'); const a = G.PARTY.active(); G.PARTY.join('alp', { quiet: true }); return { r, a, back: G.PARTY.active() }; });
  ok(lv.r && !lv.a.includes('alp') && lv.back.length === 3, 'leave(id, reason) / join again');

  // ---- stances
  await p.evaluate(() => { for (const e of G.world.enemies) e.dead = true; });
  await L.tick(p, 10);
  const spawnNear = (k, dx) => p.evaluate(([k, dx]) => {
    const pl = G.world.player, list = G.Enemies.list(G.level.biome.enemyBiome || G.level.biome.id).filter(d => !d.fly && !d.boss);
    const out = [];
    for (let i = 0; i < k; i++) { G.PARTY._px.noScale = true; const e = G.Enemies.spawn(list[i % list.length].id, pl.x + dx + i * 14, pl.y, {}); G.PARTY._px.noScale = false; e.aggro = true; out.push(e.def.id); }
    return out;
  }, [k, dx]);
  await p.evaluate(() => { G.PARTY.stance('silent'); G.PARTY.resetStats(); });
  await spawnNear(3, 70);
  await L.tick(p, 300);
  const sil = await p.evaluate(() => ({ dealt: Object.values(G.PARTY.stats.dealt).reduce((a, b) => a + b, 0), untarget: G.PARTY._px.actors().every(c => c.untargetable), taken: Object.keys(G.PARTY.stats.taken).filter(k => k !== 'hero').length }));
  ok(sil.dealt === 0 && sil.untarget && sil.taken === 0, 'Silent: no blows dealt, enemies ignore them ' + JSON.stringify(sil));
  await p.evaluate(() => { G.PARTY.stance('defend'); });
  const dd = [];
  for (let i = 0; i < 8; i++) { await L.tick(p, 30); dd.push(await p.evaluate(() => Math.max(...G.PARTY._px.actors().map(c => Math.abs(c.x - G.world.player.x))))); }
  ok(Math.max(...dd) < 140, 'Defend: they stay close to the hero (max distance ' + Math.round(Math.max(...dd)) + ' px)');
  await p.evaluate(() => { for (const e of G.world.enemies) e.dead = true; G.PARTY.stance('attack'); G.PARTY.resetStats(); });
  await spawnNear(3, 70);
  await L.tick(p, 300);
  const att = await p.evaluate(() => G.PARTY.stats.dealt);
  ok(Object.keys(att).length >= 2, 'Attack: they fight ' + JSON.stringify(Object.fromEntries(Object.entries(att).map(([k, v]) => [k, Math.round(v)]))));
  // stance key: tap G cycles
  const st0 = await p.evaluate(() => G.PARTY.stance());
  await p.evaluate(() => G.input.keys.add('KeyV')); await L.tick(p, 3); await p.evaluate(() => G.input.keys.delete('KeyV')); await L.tick(p, 3);
  const st1 = await p.evaluate(() => G.PARTY.stance());
  ok(st0 === 'attack' && st1 === 'defend', 'tap V: next stance (' + st0 + ' → ' + st1 + ')');
  await p.evaluate(() => G.input.keys.add('KeyV')); await L.tick(p, 24);
  const rad = await p.evaluate(() => G.PARTY._px.radial.open);
  await p.evaluate(() => G.input.keys.add('KeyS')); await L.tick(p, 3); await p.evaluate(() => { G.input.keys.delete('KeyS'); G.input.keys.delete('KeyV'); }); await L.tick(p, 3);
  const st2 = await p.evaluate(() => G.PARTY.stance());
  ok(rad && st2 === 'range', 'hold V: the wheel opens, down picks Keep distance (' + st2 + ')');
  await p.evaluate(() => G.PARTY.stance('attack'));

  // ---- roles: heal under 50%, taunt, hook-pull, water + song
  await p.evaluate(() => { for (const e of G.world.enemies) e.dead = true; G.PARTY.resetStats(); const pl = G.world.player; G.godMode = false; pl.hp = Math.round(pl.maxHp * 0.4); });
  await L.tick(p, 240);
  const heal = await p.evaluate(() => ({ heals: G.PARTY.stats.heals, hp: G.world.player.hp / G.world.player.maxHp }));
  ok(heal.heals > 0 && heal.hp > 0.5, 'Nargiza heals the group when the hero is under 50% (' + JSON.stringify(heal) + ')');
  await p.evaluate(() => { G.godMode = true; G.world.player.hp = G.world.player.maxHp; });
  const taunt = await p.evaluate(async () => {
    const pl = G.world.player, list = G.Enemies.list(G.level.biome.enemyBiome || G.level.biome.id).filter(d => !d.fly && !d.boss);
    G.PARTY._px.noScale = true; const e = G.Enemies.spawn(list[0].id, pl.x + 60, pl.y, { elite: true }); G.PARTY._px.noScale = false;
    e.aggro = true; e._tgt = null; e._tgtUntil = G.frame + 9999;
    const t0 = G.PARTY._px.taunts || 0;
    for (let i = 0; i < 40; i++) { G.debugTick(10); if ((G.PARTY._px.taunts || 0) > t0) break; }
    return { taunts: (G.PARTY._px.taunts || 0) - t0, tgt: e._tgt ? e._tgt.id : 'hero', elite: e.elite };
  });
  ok(taunt.taunts > 0 && taunt.tgt === 'alp', 'Alp taunts a heavy enemy off the hero (' + JSON.stringify(taunt) + ')');
  const hook = await p.evaluate(async () => {
    for (const e of G.world.enemies) e.dead = true;
    const pl = G.world.player, list = G.Enemies.list(G.level.biome.enemyBiome || G.level.biome.id).filter(d => !d.fly && !d.boss);
    G.debugTick(2);
    const s = G.PARTY.actor('surayyo'); s.cds.a = 0;
    G.PARTY._px.noScale = true; const e = G.Enemies.spawn(list[1 % list.length].id, s.x + 110, s.y, {}); G.PARTY._px.noScale = false;
    e.aggro = true; e._ranged = true; const x0 = e.x;
    const h0 = G.PARTY._px.hooks || 0;
    for (let i = 0; i < 40; i++) { G.debugTick(6); if ((G.PARTY._px.hooks || 0) > h0) break; }
    G.debugTick(20);
    return { hooks: (G.PARTY._px.hooks || 0) - h0, moved: Math.round(x0 - e.x), towards: Math.round(Math.abs(x0 - s.x) - Math.abs(e.x - s.x)) };
  });
  ok(hook.hooks > 0 && hook.towards > 20, 'Surayyo hooks a ranged enemy in (' + JSON.stringify(hook) + ')');
  const combo = await p.evaluate(async () => {
    for (const e of G.world.enemies) e.dead = true;
    G.debugTick(2);
    const pl = G.world.player, list = G.Enemies.list(G.level.biome.enemyBiome || G.level.biome.id).filter(d => !d.fly && !d.boss);
    const s = G.PARTY.actor('surayyo'), n = G.PARTY.actor('nargiza');
    const es = [];
    G.PARTY._px.noScale = true; for (let i = 0; i < 3; i++) { const e = G.Enemies.spawn(list[0].id, pl.x + 50 + i * 12, pl.y, {}); e.aggro = true; e.maxHp = e.hp = 9999; es.push(e); } G.PARTY._px.noScale = false;
    G.PARTY.resetStats(); const c0 = G.PARTY._px.combo || 0;
    for (let i = 0; i < 120; i++) { G.debugTick(5); if ((G.PARTY._px.combo || 0) > c0) break; }
    return { combo: (G.PARTY._px.combo || 0) - c0, puddles: G.world.ents.filter(e => e instanceof G.PARTY._px.Puddle).length, dealt: Math.round(G.PARTY.stats.dealt.nargiza || 0) };
  });
  ok(combo.combo > 0 && combo.puddles > 0, 'Surayyo pours water and Nargiza\'s song runs through it (' + JSON.stringify(combo) + ')');

  // ---- Surayyo puts out fire: her sluice washes the burning off the group (and a burning ally steps in her puddle)
  const fire = await p.evaluate(() => {
    const pl = G.world.player, s = G.PARTY.actor('surayyo'), a = G.PARTY.actor('alp');
    pl.addStatus('burn', { t: 600 }); a.addStatus('burn', { t: 600 });
    const before = !!pl.st.burn && !!a.st.burn;
    s.skillCD = 0; s.setState('follow'); G.PARTY.command('surayyo'); G.debugTick(40);
    const r = { before, hero: !!pl.st.burn, alp: !!a.st.burn };
    // a puddle on its own: a burning companion standing in it stops burning
    const n = G.PARTY.actor('nargiza'); n.addStatus('burn', { t: 600 });
    G.PARTY._px.pour(s, n.x, 64, 120); G.debugTick(20);
    r.puddleDoused = !n.st.burn; s.skillCD = 0;
    return r;
  });
  ok(fire.before && !fire.hero && !fire.alp && fire.puddleDoused, 'Surayyo puts out fire: the sluice and her puddles (' + JSON.stringify(fire) + ')');

  // ---- boss-kit danger: a pool under Alp, he steps out of it
  const dg = await p.evaluate(() => {
    for (const e of G.world.enemies) e.dead = true; G.debugTick(2);
    const a = G.PARTY.actor('alp'), BK = G.BossKit, d0 = G.PARTY._px.dodges || 0;
    const h = new BK.Hazard(a.x, a.y, 48, 12, { dmg: 1, life: 240 }); G.world.add(h);
    let f = 0; for (; f < 120 && Math.abs(a.x - h.x) < 24 + a.w / 2; f++) G.debugTick(1);
    h.dead = true;
    return { frames: f, out: Math.abs(a.x - h.x) >= 24 + a.w / 2, dodges: (G.PARTY._px.dodges || 0) - d0 };
  });
  ok(dg.out && dg.frames < 60, 'companions step out of a hazard on the floor (' + JSON.stringify(dg) + ')');

  // ---- commanded skills
  const cmd = await p.evaluate(() => {
    const out = {};
    for (const [id, key] of [['alp', 'Digit1'], ['nargiza', 'Digit2'], ['surayyo', 'Digit3']]) {
      const c = G.PARTY.actor(id); c.skillCD = 0; c.setState('follow');
      G.input.keys.add(key); G.debugTick(2); G.input.keys.delete(key); G.debugTick(40);
      out[id] = Math.round(c.skillCD / 60);
    }
    const again = G.PARTY.command('alp');
    return { out, again };
  });
  ok(cmd.out.alp >= 28 && cmd.out.nargiza >= 23 && cmd.out.surayyo >= 20 && !cmd.again, 'keys 1/2/3 fire the orders, cooldowns 20–40 s (' + JSON.stringify(cmd) + ')');

  // ---- downed, revive (hold F 2 s), out after 30 s, restAll
  await p.evaluate(() => { for (const e of G.world.enemies) e.dead = true; });
  const dn = await p.evaluate(() => {
    const ev = []; G.PARTY.on('downed', id => ev.push('down:' + id)); G.PARTY.on('revived', (id, by) => ev.push('up:' + id + ':' + by)); G.PARTY.on('out', id => ev.push('out:' + id)); G.PARTY.on('rest', () => ev.push('rest'));
    window.__ev = ev;
    const a = G.PARTY.actor('alp'); a.takeHit({ dmg: 99999, raw: true });
    const pl = G.world.player; pl.x = a.x + 6; pl.y = a.y; pl.vx = 0;
    G.input.keys.add('KeyF'); let f = 0; for (; f < 200 && a.downed; f++) G.debugTick(1);
    G.input.keys.delete('KeyF');
    return { f, downed: a.downed, hp: a.hp, max: a.maxHp, ev: ev.slice() };
  });
  ok(!dn.downed && dn.f >= 118 && dn.f <= 130, 'downed at 0 HP, revived by holding F for 2 s (' + dn.f + ' frames, hp ' + dn.hp + '/' + dn.max + ')');
  const out = await p.evaluate(() => {
    const n = G.PARTY.actor('nargiza'); n.takeHit({ dmg: 99999, raw: true });
    const pl = G.world.player; pl.x = n.x + 200;
    for (let i = 0; i < 1810 / 30; i++) G.debugTick(30);
    const r = { out: G.PARTY.member('nargiza').out, actor: !!G.PARTY.actor('nargiza'), active: G.PARTY.active().includes('nargiza') };
    G.PARTY.restAll();
    return Object.assign(r, { afterRest: !!G.PARTY.actor('nargiza'), hp: G.PARTY.actor('nargiza') && G.PARTY.actor('nargiza').hp, ev: window.__ev.slice() });
  });
  ok(out.out && !out.actor && out.active && out.afterRest && out.hp > 0, 'not revived in 30 s: out until rest; restAll() brings her back (' + JSON.stringify(out) + ')');

  // ---- nodes, flags, gear
  const nd = await p.evaluate(() => {
    const P = G.PARTY; const s = G.CH.S(); while (s.lvl < 8) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp);
    const pts = P.points('alp');
    const a = P.learn('alp', 'cover'), b0 = P.whyNot('alp', 'stand'), c = P.learn('alp', 'provoke'), d = P.learn('alp', 'stand');
    const k0 = P.whyNot('alp', 'k_wall'); P.flag('alp', 'key_wall', 1); const k1 = P.whyNot('alp', 'k_wall'); const k2 = P.learn('alp', 'k_wall');
    const w = G.YITEMS.list().find(e => G.PARTY._px.fits('alp', 'weapon', e)) || G.CH.give(G.YITEMS.W.find(id => G.Items.defs[id].yd.cat === 'staff'), { quiet: true });
    const eq = P.equip('alp', 'weapon', w.u);
    return { pts, a, b0, c, d, k0, k1, k2, left: P.points('alp'), eq, gear: G.PARTY._px.gearMods('alp') };
  });
  ok(nd.pts === 7 && nd.a && nd.b0 === 'order' && nd.c && nd.d && nd.k0 === 'story' && nd.k1 === null && nd.k2 && nd.left === 3, 'one point per hero level, branch order, key node gated by flag(id, name) (' + JSON.stringify(nd).slice(0, 160) + ')');
  ok(nd.eq && nd.gear.dmg > 0.79, 'companion weapon slot (inventory) changes damage ×' + nd.gear.dmg.toFixed(2));

  // ---- save → load
  const saved = await p.evaluate(async () => {
    G.PARTY.approval('alp', 12); G.PARTY.flag('nargiza', 'believed', true); G.PARTY.stance('alp', 'defend');
    G.Game.loadStage(G.run.planIndex); await new Promise(r => setTimeout(r, 300));
    return JSON.stringify(G.YODGOR.checkpoint);
  });
  await L.drain(p);
  const errs1 = p._errs.slice(); p._errs.length = 0;
  await p.reload(); await p.waitForTimeout(900);
  await p.evaluate(() => { const g = document.getElementById('gate'); if (g) g.hidden = true; });
  await L.tick(p, 20);
  const loaded = await p.evaluate(async (saved) => {
    const cp = JSON.parse(saved); if (!cp) return { err: 'no checkpoint' };
    G.YODGOR.continueRun(cp); await new Promise(r => setTimeout(r, 600));
    for (let i = 0; i < 10; i++) G.debugTick(6);
    const P = G.PARTY;
    return { act: P.active(), actors: P._px.actors().map(c => c.id), ap: P.approval('alp'), flag: P.flag('nargiza', 'believed'), stance: P.stance('alp'), nodes: Object.keys(P.member('alp').nodes), w: !!P.gearOf('alp', 'weapon') };
  }, saved);
  await L.drain(p);
  ok(loaded.act && loaded.act.length === 3 && loaded.actors.length === 3 && loaded.ap === 12 && loaded.flag === true && loaded.stance === 'defend' && loaded.nodes.length === 4 && loaded.w, 'save → load keeps the party (' + JSON.stringify(loaded) + ')');
  const errs = errs1.concat(p._errs);
  ok(errs.length === 0, 'zero page errors ' + JSON.stringify(errs.slice(0, 5)));
  void saved;
  await b.close();
})();
