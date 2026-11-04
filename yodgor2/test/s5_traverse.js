// Stage 5 — how long each region takes: a bot runs from one end to the other with the fights left on
// (it swings at whatever stands in its way; god mode only keeps it alive), the room labyrinths get a
// breadth-first walk. Reports: width, enemies at arrival, crossing seconds, kills, and an estimate of the
// first visit (two crossings for exits and secrets, the fights, the story's pages at ~5 s each).
//   node test/s5_traverse.js [region,...] [results.jsonl]
// Restartable: one fresh browser per region; each result is appended to the jsonl file (default
// $YODGOR_SHOTS/s5_traverse.jsonl) and regions already there are skipped.
const T = require('./s5_lib');
const fs = require('fs');
const only = (process.argv[2] || '').split(',').filter(Boolean);
const FILE = process.argv[3] || (T.out + '/s5_traverse.jsonl');
const have = new Set(fs.existsSync(FILE) ? fs.readFileSync(FILE, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l).region) : []);
const ALL = ['tail', 'potters', 'bazaar', 'karez', 'rabat', 'tower', 'ark', 'cloister', 'mines', 'streets', 'cistern', 'old', 'spine', 'withers', 'well', 'heart', 'dream', 'wedding', 'sand', 'house'];
(async () => {
  const out = {};
  for (const r of ALL) {
    if (only.length && !only.includes(r)) continue;
    if (have.has(r)) continue;
    const b = await T.chromium.launch();
    const p = await T.openWorld(b, '?stage=25&god', { liveRaf: false });
    const W = (f, a) => p.evaluate(f, a);
    await T.settle(p, 200); await T.drain(p);
    await W(() => { const s = G.WORLD2.S(); for (const k of ['light', 'hook', 'well_sign', 'divan_seal', 'water', 'voice', 'breath']) s.keys[k] = 1; });
    await W(r => G.WORLD2.go(r, 'start', { now: true, force: true }), r); await T.settle(p, 200);
    if (r === 'dream' || r === 'wedding' || r === 'sand' || r === 'house') { /* dream tier */ }
    await W(() => { const q = G.UI._debug().modal; if (q) G.UI.close && G.UI.close(); });
    // the hero of that act (stage-3 expectations): level by act, points in strength/endurance, the best melee weapon of the stage
    await W(r => {
      const act = G.WORLD2.regions[r].act || 1, lvl = { 1: 8, 2: 15, 3: 23 }[act] || 8, s = G.CH.S();
      while (s.lvl < lvl) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp);
      let k = 0; while (s.free > 0 && k++ < 80) G.CH.addPoint(k % 3 ? 'str' : 'end');
      try {
        const st = G.run.stage || 1;
        const d = G.YITEMS.W.map(id => G.Items.defs[id]).filter(d => d && d.yd && !d.noDrop && d.kind === 'ydm' && (d.minStage || 0) <= st + 0.01).sort((a, b) => b.yd.tier - a.yd.tier || b.yd.power - a.yd.power)[0];
        if (d) { const e = G.CH.give(d.id, { q: st < 3 ? 0 : st < 6 ? 1 : 2, up: Math.min(5, Math.floor(st / 1.8 + 0.4)), quiet: true }); G.YITEMS.equip(e.u, 'attack'); }
      } catch (e) { /* keep the weapon he has */ }
    }, r);
    const res = await W(() => {
      const L = G.level, pl = G.world.player, E = L.w2.entries;
      const enemies = G.world.enemies.filter(e => !e.dead).length;
      if (!L.isOpen && L.rooms && L.rooms.length) return { rooms: L.rooms.length, w: L.w, h: L.h, enemies, open: false };
      // from the leftmost entry to the rightmost
      const ents = Object.values(E).filter(e => e && e.x != null).sort((a, b) => a.x - b.x);
      const a = ents[0], z = ents[ents.length - 1];
      pl.x = a.x; pl.y = a.y - 1; pl.vx = pl.vy = 0;
      const k0 = G.run.kills || 0;
      let f = 0, lastX = pl.x, stuck = 0, jumps = 0, swings = 0; const skip = new Set(), hits = new Map(); let unreach = 0;
      G.input.keys.add('KeyD');
      for (; f < 60 * 150; f += 10) {
        const foe = G.world.enemies.find(e => !e.dead && !skip.has(e) && Math.abs(e.x - pl.x) < 46 && Math.abs(e.y - pl.y) < 40);
        // a foe that does not lose health in ~6 s of swinging is out of reach (behind a ledge): a player would walk on
        if (foe) { const h = hits.get(foe) || { hp: foe.hp, n: 0 }; if (foe.hp < h.hp) { h.hp = foe.hp; h.n = 0; } else if (++h.n > 36) { skip.add(foe); unreach++; } hits.set(foe, h); }
        if (foe) { pl.facing = Math.sign(foe.x - pl.x) || 1; G.input.keys.add('KeyJ'); G.debugTick(4); G.input.keys.delete('KeyJ'); G.debugTick(6); swings++; }
        else if (stuck > 1) { G.input.keys.add('Space'); jumps++; G.debugTick(10); G.input.keys.delete('Space'); G.debugTick(2); G.input.keys.add('Space'); G.debugTick(10); G.input.keys.delete('Space'); f += 12; }
        else G.debugTick(10);
        if (G.UI._debug().modal) { G.UI._debug().modal.picked = true; }
        if (Math.abs(pl.x - lastX) < 6 && !foe) stuck++; else stuck = 0;
        if (stuck > 30) { pl.x += 48; pl.y -= 48; stuck = 0; }      // a wall it cannot climb: hop it (counted)
        lastX = pl.x;
        if (pl.x >= z.x - 12 || G.WORLD2.busy) break;
      }
      G.input.keys.delete('KeyD'); G.input.keys.delete('Space'); G.input.keys.delete('KeyJ');
      return { open: true, unreach, unstuck: G.WORLD2.stats.unstuck || 0, w: L.w, h: L.h, enemies, secs: +(f / 60).toFixed(1), kills: (G.run.kills || 0) - k0, jumps, swings, reached: pl.x >= z.x - 40 || G.WORLD2.busy };
    });
    if (!res.open) {
      // labyrinth: shortest walk over standable cells between the two farthest entries (as stage 4)
      Object.assign(res, await W(() => {
        const L = G.level, Tt = G.T, S = (x, y) => L.get(x, y) === Tt.SOLID;
        const stand = (x, y) => !S(x, y) && !S(x, y - 1) && (S(x, y + 1) || L.get(x, y + 1) === Tt.PLAT);
        const ents = Object.values(L.w2.entries).filter(e => e && e.x != null).sort((a, b) => a.x - b.x);
        const a = ents[0], z = ents[ents.length - 1];
        const sx = Math.floor(a.x / 16), sy = Math.floor(a.y / 16) - 1, tx = Math.floor(z.x / 16), ty = Math.floor(z.y / 16) - 1;
        const dist = new Map(), q = [[sx, sy]]; dist.set(sx + ',' + sy, 0);
        while (q.length) {
          const [x, y] = q.shift(), d = dist.get(x + ',' + y);
          if (Math.abs(x - tx) <= 1 && Math.abs(y - ty) < 2) return { steps: d, secs: +(d * 0.13).toFixed(1) };
          const nx = [];
          for (let up = 1; up <= 7; up++) { if (S(x, y - up)) break; if (stand(x, y - up)) { nx.push([x, y - up]); break; } }
          for (const dx of [-3, -2, -1, 1, 2, 3]) { for (let up = 0; up <= 6; up++) { if (S(x, y - up - 1)) break; if (stand(x + dx, y - up)) { nx.push([x + dx, y - up]); break; } } let yy = y; while (yy < L.h - 1 && !S(x + dx, yy + 1) && L.get(x + dx, yy + 1) !== Tt.PLAT && !S(x + dx, yy)) yy++; if (stand(x + dx, yy)) nx.push([x + dx, yy]); }
          if (L.get(x, y + 1) === Tt.PLAT) { let yy = y + 1; while (yy < L.h - 1 && !S(x, yy + 1)) yy++; if (stand(x, yy)) nx.push([x, yy]); }
          for (const [a2, b2] of nx) { const k = a2 + ',' + b2; if (!dist.has(k)) { dist.set(k, d + 1); q.push([a2, b2]); } }
        }
        return { unreachable: true };
      }));
    }
    // the first visit, estimated: two crossings + ~9 s per enemy + the chapter's dialogue pages (~5 s each) + secrets (~40 s each)
    const extra = await W(r => {
      const d = G.WORLD2.regions[r], S = G.WORLD2.story;
      const sec = d.objects.filter(o => /cache|sealed|hooktower|lightwall|lightfloor|songdoor|singersdoor|divandoor|divepool|updraft|chest|relic/.test(o.kind)).length;
      // the chapter's dialogue pages (start, middle, the people's scene ~ 20 pages, the memory) and the region's own memory and stones
      const id = S.LAND_AT[r];
      const lines = x => (Array.isArray(x) ? x.length : typeof x === 'function' ? 8 : 0);
      const LD = (S.LANDS || {})[id] || null;
      const pages = LD ? lines(LD.start) + lines(LD.mid) + (LD.exit ? 20 : 0) + ((LD.memory && LD.memory.lines) ? LD.memory.lines.length : 0) : ((d.memory ? d.memory.lines.length : 0));
      const npcs = Object.values(G.WORLD2.npcs).filter(n => (n.sched || []).some(q => q.region === r)).length;
      return { npcs, secrets: sec, chai: d.objects.filter(o => o.kind === 'chai').length, exits: Object.keys(d.exits).length, miniboss: d.objects.filter(o => o.kind === 'miniboss').length, pages, stones: (d.stones || []).length };
    }, r);
    Object.assign(res, extra);
    // first-visit estimate (minutes): the bot's crossing x3 (a player explores both halves at a walking pace and comes back),
    // 40 s per secret, 5 s per dialogue page, 60 s per miniboss, 45 s per chaikhana visit
    const cross = res.secs || 0, fightS = res.open ? 0 : (res.enemies || 0) * 9;
    res.minutes = +((3 * cross + fightS + 40 * res.secrets + 5 * res.pages + 60 * res.miniboss + 45 * res.chai) / 60).toFixed(1);
    res.region = r; res.errs = p._errs.slice(0, 4);
    out[r] = res;
    fs.appendFileSync(FILE, JSON.stringify(res) + '\n');
    console.error(r, JSON.stringify(res));
    await b.close();
  }
  console.log(JSON.stringify({ regions: out }, null, 1));
})();
