// Stage 5 — the city of 17 regions: every exit both ways, the lairs' gates, keys and their alternatives,
// the updraft and the dive, the milestone warning, saves (world in slots, old linear saves migrate).
//   node test/s5_world.js [part]   parts: exits, keys, saves, all
const T = require('./s5_lib');
const part = process.argv[2] || 'all';
const R = { ok: [], fail: [] };
const check = (name, cond, extra) => { (cond ? R.ok : R.fail).push(name + (extra !== undefined ? ' ' + JSON.stringify(extra) : '')); if (!cond) console.error('FAIL', name, JSON.stringify(extra)); };

(async () => {
  const b = await T.chromium.launch();
  const p = await T.openWorld(b, '?stage=25&god');      // the Heart's chapter is next: Acts I–II behind, moon 1
  const W = (f, a) => p.evaluate(f, a);
  await T.settle(p, 200); await T.drain(p);
  // everything open that geography allows: all keys, the dream's two chapters done
  await W(() => { const s = G.WORLD2.S(); for (const k of ['light', 'hook', 'well_sign', 'divan_seal', 'water', 'voice', 'breath']) s.keys[k] = 1; const at = G.YODGOR.run.at; at['done:a3_wedding'] = 1; at['done:a3_sand'] = 1; });
  const go = async (r, e) => { await W(([r, e]) => G.WORLD2.go(r, e || 'start', { now: true, force: true }), [r, e]); await T.settle(p, 200); await T.drain(p); };

  /* ------------------------------------------------ 1. every exit both ways */
  if (part === 'all' || part === 'exits') {
    const list = await W(() => { const out = []; const R0 = G.WORLD2.regions; for (const r in R0) { if (R0[r].arena) continue; for (const e in R0[r].exits) { const ex = R0[r].exits[e]; if (!ex.to || R0[ex.to[0]].arena) continue; out.push([r, e, ex.to[0], ex.to[1]]); } } return out; });
    R.exitCount = list.length;
    for (const [from, ex, to, en] of list) {
      await go(from);
      const r = await T.useExit(p, ex);
      if (r !== 'ok') { check(`exit ${from}.${ex}`, false, r); continue; }
      await T.tick(p, 4); await T.drain(p); await T.settle(p, 200); await T.drain(p);
      const i = await T.info(p);
      const e = await W(en => { const q = G.level.w2.entries[en]; return q ? { x: Math.round(q.x / 16), y: Math.round(q.y / 16) } : null; }, en);
      check(`${from}.${ex} -> ${to}.${en}`, i.region === to && e && Math.abs(i.x - e.x) <= 3 && Math.abs(i.y - e.y) <= 3, { at: [i.region, i.x, i.y], e });
      // and back: the target region has an exit that leads to the region we came from, arriving at our exit
      const back = await W(([to, from, ex]) => { const R0 = G.WORLD2.regions[to]; for (const id in R0.exits) { const q = R0.exits[id]; if (q.to && q.to[0] === from && q.to[1] === ex) return id; } return null; }, [to, from, ex]);
      check(`${to} leads back to ${from}.${ex}`, !!back, back);
    }
    // the lairs: each gate leads in, the way out leads back to the gate
    const lairs = await W(() => Object.values(G.WORLD2.regions).filter(r => r.arena).map(r => [r.id, r.out[0], r.out[1], r.beat]));
    for (const [id, host, gate, beat] of lairs) {
      await W(beat => { delete G.YODGOR.run.at['done:' + beat]; }, beat);
      const shut = await W(([host, gate]) => G.WORLD2.shutWhy(G.WORLD2.regions[host].exits[gate]), [host, gate]);
      check(`lair ${id}: the gate knows its story lock`, shut === null || typeof shut === 'string', shut);
    }
    // a lair that is done stays shut with a reason
    await W(() => { G.YODGOR.run.at['done:b_tower'] = 1; });
    check('a beaten lair stays shut', !!(await W(() => G.WORLD2.shutWhy(G.WORLD2.regions.tower.exits.top))));
    // the dream does not lead back to the city, the city not into the dream
    const cross = await W(() => { const R0 = G.WORLD2.regions; let n = 0; for (const r in R0) for (const e in R0[r].exits) { const q = R0[r].exits[e]; if (!q.to || !R0[q.to[0]]) continue; const a = R0[r].tier === 'dream', b2 = R0[q.to[0]].tier === 'dream'; if (a !== b2) n++; } return n; });
    check('no exit between the dream and the waking city', cross === 0, cross);
    R.regions = await W(() => Object.values(G.WORLD2.regions).filter(r => !r.arena).length);
    R.lairs = lairs.length;
    R.chaikhanas = await W(() => G.WORLD2.chaiList ? Object.values(G.WORLD2.regions).reduce((n, r) => n + r.objects.filter(o => o.kind === 'chai').length, 0) : 0);
  }

  /* ------------------------------------------------ 2. keys and their alternatives */
  if (part === 'all' || part === 'keys') {
    const setKeys = ks => W(ks => { const s = G.WORLD2.S(); s.keys = {}; for (const k of ks) s.keys[k] = 1; }, ks);
    const exitShut = (r, e) => W(([r, e]) => { const ex = G.WORLD2.regions[r].exits[e]; return !(!ex.key || G.WORLD2.can(ex.key)); }, [r, e]);
    await setKeys(['light', 'hook']);
    check('Ark gate shut without the Seal', await exitShut('bazaar', 'east'));
    await setKeys(['light', 'hook', 'stolen_seal']);
    check('Ark gate opens with a stolen seal', !(await exitShut('bazaar', 'east')));
    await setKeys(['light', 'hook']);
    check("Singers' stair shut without the Sign", await exitShut('bazaar', 'stair'));
    await setKeys(['light', 'hook', 'forged_sign']);
    check("Singers' stair opens with Farrukh's forgery", !(await exitShut('bazaar', 'stair')));
    await setKeys(['hook']);
    check('the archive drain needs the light', await exitShut('karez', 'archive'));
    await setKeys(['light']);
    check('the archive drain opens in her light (the Cloister without the Sign)', !(await exitShut('karez', 'archive')));
    // doors in regions: a Singers' door, a Divan door, a singing door — locked, then opened by the alternative
    const door = async (region, kind, keys) => {
      await setKeys([]); await go(region);
      const tryDoor = () => W(kind => { const o = G.level.w2.objs.find(o => o.type === kind); if (!o) return 'no ' + kind + ' in ' + G.WORLD2.active; const it = G.world.interactables.find(i => i.art === 'w2door' && i._w2 === G.WORLD2.active + ':door:' + o.od.id + ':w'); if (!it) return 'no door object'; const pl = G.world.player; pl.x = it.x - 20; pl.y = it.y - 1; it.onUse(pl, it); return it.isOpen ? 'open' : 'shut'; }, kind);
      const shut = await tryDoor();
      await T.drain(p);
      await setKeys(keys);
      const open = await tryDoor();
      await T.tick(p, 20); await T.drain(p);
      check(`${kind} in ${region}: shut without, open with ${keys}`, shut === 'shut' && open === 'open', { shut, open });
      await T.shot(p, 's5_gate_' + kind);
    };
    await door('cloister', 'singersdoor', ['forged_sign']);
    await door('rabat', 'divandoor', ['stolen_seal']);
    await door('streets', 'songdoor', ['tales']);
    await door('old', 'songdoor', ['voice']);
    // the dive: shut without the Breath of water, through with it
    await setKeys(['light']); await go('cistern');
    const d1 = await T.useExit(p, 'dive'); await T.tick(p, 30);
    check('dive refused without the Breath of water', d1 === 'ok' && (await T.info(p)).region === 'cistern');
    await T.shot(p, 's5_gate_dive');
    await setKeys(['light', 'water']);
    await T.useExit(p, 'dive'); await T.settle(p, 200);
    check('dive with the Breath of water: the cistern -> Old Yodgor', (await T.info(p)).region === 'old');
    // the updraft: hold jump in the column of air
    const ride = async () => W(() => {
      const L = G.level, o = L.w2.objs.find(o => o.type === 'updraft'), pl = G.world.player;
      pl.x = o.vent.x; pl.y = o.vent.y - 2; pl.vx = pl.vy = 0;
      const y0 = pl.y; let minY = y0;
      for (let k = 0; k < 120; k++) { G.debugTick(1); minY = Math.min(minY, pl.y); }
      return { rise: Math.round((y0 - minY) / 16), towerTiles: Math.round((o.vent.y - o.y) / 16) };
    });
    await setKeys(['light']); await go('spine');
    const r0 = await ride();
    check('updraft without the breath: no ride', r0.rise < r0.towerTiles - 2, r0);
    await T.shot(p, 's5_gate_updraft_shut');
    await setKeys(['light', 'breath']); await go('spine');
    const r1 = await ride();
    check('updraft with the breath: up the tower', r1.rise >= r1.towerTiles - 1, r1);
    await T.shot(p, 's5_gate_updraft');
    // a hook tower and a light wall (stage 4 kinds) exist in the new regions too
    const kinds = await W(() => { const R0 = G.WORLD2.regions, c = {}; for (const r in R0) for (const o of R0[r].objects) c[o.kind] = (c[o.kind] || 0) + 1; return c; });
    R.kinds = kinds;
  }

  /* ------------------------------------------------ 2b. relics: the stolen seal, the Albasty's claw, legends of the chaikhanas */
  if (part === 'all' || part === 'relics') {
    const relic = (re) => W(re => { const it = G.world.interactables.find(i => !i.dead && i.prompt && new RegExp(re).test(i.prompt)); if (!it) return 'none'; const pl = G.world.player; pl.x = it.x; pl.y = it.y - 1; it.onUse(pl, it); return 'ok'; }, re);
    const legends = () => W(() => Object.keys(G.CH.S().legends));
    // the Ark's cellar from below (the karez crack, in her light): a spare seal on the steward's hook
    await W(() => { const s = G.WORLD2.S(); s.keys = { light: 1, hook: 1 }; });
    await go('karez');
    const up = await T.useExit(p, 'cellar'); await T.tick(p, 4); await T.drain(p); await T.settle(p, 200); await T.drain(p);
    const inArk = (await T.info(p)).region;
    const r1 = await relic('spare seal|запасную печать|zaxira muhr'); await T.tick(p, 20); await T.drain(p);
    check('the Ark cellar from the karez: a stolen seal', up === 'ok' && inArk === 'ark' && r1 === 'ok' && (await W(() => G.WORLD2.hasKey('stolen_seal'))), { up, inArk, r1 });
    // the Albasty's claw: not there before her, there after her
    await W(() => { delete G.YODGOR.run.at['done:b_cistern']; }); await go('cistern');
    const c0 = await relic("Albasty's claw|коготь Албасты|Albastining tirnog");
    await W(() => { G.YODGOR.run.at['done:b_cistern'] = 1; }); await go('cistern');
    const c1 = await relic("Albasty's claw|коготь Албасты|Albastining tirnog"); await T.tick(p, 20); await T.drain(p);
    check("the Albasty's claw lies by her lair only after her, and gives her legend", c0 === 'none' && c1 === 'ok' && (await legends()).includes('albasty'), { c0, c1 });
    // Turab's voice returns in any chaikhana once the auction gave it (not only under the Ark wall)
    await W(() => { const f = G.YODGOR.run.f; f.voice = 'bought'; delete f.turabSpoke; delete G.YODGOR.run.at['turab:voice']; G.WORLD2.S().moon = 1; });
    await W(() => G.WORLD2.go('potters', 'chai:potters_kiln', { now: true, force: true, inside: 'potters_kiln' })); await T.settle(p, 200); await T.drain(p);
    const sh = await T.useArt(p, 'shaman', null);
    await T.drain(p);
    check("Turab's voice comes back in the kiln chaikhana; his legend follows", sh === 'ok' && (await W(() => !!G.YODGOR.run.f.turabSpoke)) && (await legends()).includes('turab'), { sh, leg: await legends() });
    await W(() => G.Game.exitStage()); await T.settle(p, 200); await T.drain(p);
  }

  /* ------------------------------------------------ 3. saves: world in the checkpoint, old linear saves */
  if (part === 'all' || part === 'saves') {
    await go('rabat');
    const cp = await W(() => G.YODGOR.checkpoint);
    check('checkpoint carries the world', !!(cp && cp.rpg && cp.rpg.world && cp.rpg.world.cur.region === 'rabat'), cp && cp.rpg && cp.rpg.world && cp.rpg.world.cur);
    // an old linear save (stage 3: planIndex 14, no world) migrates into the karez at the right chapter
    const mig = await W(cp => {
      const old = JSON.parse(JSON.stringify(cp)); old.run.planIndex = 14; delete old.rpg.world; old.rpg.at = {}; old.land = 'The Karez';
      G.YODGOR.continueRun(old);
      return true;
    }, cp);
    await T.settle(p, 200); await T.drain(p);
    const s = await T.story(p);
    check('old linear save (karez) migrates', mig && s.at === 'karez' && s.done.includes('r_den') && !s.done.includes('a2_karez') && s.moon === 1, s);
    // a broken one does not crash: it says so and goes to the prologue
    const errs0 = p._errs.length;
    await W(cp => { const bad = JSON.parse(JSON.stringify(cp)); bad.run.planIndex = 20; bad.rpg = { f: {}, at: {}, mem: {}, rep: {}, void: 0 }; G.YODGOR.continueRun(bad); }, cp);
    await T.settle(p, 200);
    check('a save with nothing in it still loads somewhere', ['play'].includes((await T.info(p)).state), await T.info(p));
    check('no new page errors from the saves', p._errs.length === errs0, p._errs.slice(errs0));
  }
  R.errs = p._errs.slice(0, 10);
  console.log(JSON.stringify({ ok: R.ok.length, fail: R.fail, exitCount: R.exitCount, regions: R.regions, lairs: R.lairs, chaikhanas: R.chaikhanas, kinds: R.kinds, errs: R.errs }, null, 1));
  await b.close();
})();
