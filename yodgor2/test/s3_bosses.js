// Stage 3: every weapon category kills each of the 8 bosses (plan indices 1, 5, 9, 12, 16, 20, 23, 31) with a
// scripted attacker in god mode, at the level, attributes and gear a player would have there; no single hit
// takes more than 8% of a boss's health.
//   node test/s3_bosses.js [category,...] [pi,...]       e.g. node test/s3_bosses.js sabre,focus 1,16
const L = require('./s3_lib');
const CATS = (process.argv[2] || 'sabre,staff,knife,shield,ranged,dutar,focus').split(',');
const PIS = (process.argv[3] || '1,5,9,12,16,20,23,31').split(',').map(Number);
const LIMIT = 420; // seconds of game time for a god-mode bot
// expected level at each lair (simulated XP curve, see the report) and the main attributes per category
const LVL = { 1: 3, 5: 7, 9: 9, 12: 11, 16: 14, 20: 16, 23: 17, 31: 24 };
const MAIN = { sabre: ['agi', 'str'], staff: ['str', 'end'], knife: ['agi', 'str'], shield: ['str', 'end'], ranged: ['agi', 'str'], dutar: ['mem', 'agi'], focus: ['mem', 'agi'] };
(async () => {
  const b = await L.chromium.launch();
  const rows = [];
  for (const pi of PIS) {
    const p = await L.open(b, '');
    await L.tick(p, 30);
    for (const cat of CATS) {
      const drain = async () => {
        for (let i = 0; i < 200; i++) {
          await L.tick(p, 8);
          const m = await L.modal(p);
          if (!m) { await L.tick(p, 10); if (!(await L.modal(p))) return; continue; }
          if (m.type === 'choice') { await L.tick(p, 14); await p.evaluate(() => { G.UI._debug().modal.sel = 0; }); }
          await L.press(p, 'Enter'); await L.press(p, 'Enter');
        }
      };
      await p.evaluate(async pi => { G.Game.startRun({ mode: 'wanderer' }); G.run.diffLevel = 'normal'; G.godMode = true; await new Promise(r => setTimeout(r, 60)); G.Game.loadStage(pi); await new Promise(r => setTimeout(r, 250)); }, pi);
      await drain();
      const info = await p.evaluate(([pi, cat, lvl, main]) => {
        const stage = G.run.stage, s = G.CH.S();
        while (s.lvl < lvl) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp);
        const P = s.free; const a1 = Math.min(17, Math.round(P * 0.6)), a2 = Math.min(17, Math.round(P * 0.15)), a3 = P - a1 - a2;
        for (let i = 0; i < a1; i++) G.CH.addPoint(main[0]); for (let i = 0; i < a2; i++) G.CH.addPoint(main[1]); for (let i = 0; i < a3; i++) G.CH.addPoint(main.includes('end') ? 'agi' : 'end');
        const W = G.YITEMS.W.map(id => G.Items.defs[id]).filter(d => d.yd.cat === cat && !d.noDrop && (d.minStage || 0) <= stage + 0.01);
        const at0 = G.CH.attrs(), meets = d => !d.yd.req || Object.keys(d.yd.req).every(k => (at0[k] || 0) >= d.yd.req[k]);
        const pick = sub => W.filter(d => (sub ? d.yd.sub === sub : d.yd.sub !== 'shield') && meets(d)).sort((x, y) => y.yd.tier - x.yd.tier || y.yd.power - x.yd.power)[0];
        const m0 = cat === 'shield' ? pick('mace') : cat === 'ranged' ? (pick('crossbow') && pick('bow') && pick('crossbow').yd.tier > pick('bow').yd.tier ? pick('crossbow') : pick('bow') || pick(null)) : pick(null);
        const up = Math.min(5, Math.floor(stage / 1.8 + 0.4)), q = stage < 3 ? 0 : stage < 6 ? 1 : 2;
        const e = G.CH.give(m0.id, { q, up, quiet: true }); G.YITEMS.equip(e.u, 'attack');
        if (cat === 'shield') { const sh = pick('shield'); const e2 = G.CH.give(sh.id, { q, up, quiet: true }); G.YITEMS.equip(e2.u, 'secondary'); }
        G.CH.dirty(); const pl = G.world.player; pl.syncStats(false);
        for (let i = 0; i < 200 && !G.Game.stage.bossStarted; i++) { pl.x += 8; G.debugTick(2); }
        return { pi, cat, boss: G.PLAN[pi].boss, lvl: s.lvl, attrs: Object.values(G.CH.attrs()).join('/'), weapon: m0.id + ' q' + q + ' +' + up, hp: pl.maxHp, dmg: Math.round(G.Combat.playerDmg(G.run.slots.attack, (G.run.slots.attack.def.combo || [{ dmg: G.run.slots.attack.def.boltDmg || G.run.slots.attack.def.dmg || 15 }])[0].dmg)) };
      }, [pi, cat, LVL[pi], MAIN[cat]]);
      await drain();
      // the fight, in chunks; scenes in between are drained
      await p.evaluate(([cat]) => {
        const pl = G.world.player, bz = G.Game.boss; if (!bz) return;
        const S3 = window.__F = { shots: 0, t0: G.run.time, maxFrac: 0, hits: 0, legend: 0, dmg: 0, bossHp: Math.round(bz.maxHp) };
        const wa0 = G.world.add; G.world.add = function (e) { if (e instanceof G.Projectile && e.owner === pl) { S3.shots++; S3.lastY = Math.round(e.y - (G.Game.boss ? G.Game.boss.cy : 0)); } return wa0.apply(this, arguments); };
        const T0 = S3.T0 = G.Boss.prototype.takeHit;
        G.Boss.prototype.takeHit = function (h) { const before = this.hp; const ok = T0.apply(this, arguments); if (ok && h && h.src === pl) { const d = before - this.hp; if (h.legend) S3.legend++; else S3.maxFrac = Math.max(S3.maxFrac, d / this.maxHp); S3.hits++; S3.dmg += d; } return ok; };
        const dist = { ranged: 60, focus: 60, dutar: 26 }[cat] || 18;
        const B = { t: 0, hold: 0, n: 0 };
        const up0 = S3.up0 = G.Player.prototype.update;
        const target = () => { const L2 = G.world.enemies.filter(x => x && !x.dead && !x.untargetable && (x.isBoss || x.isBossPart)); let best = null, bd = 1e9; for (const x of L2) { const d = Math.abs(x.x - pl.x) + Math.abs(x.cy - pl.cy) * 0.5; if (d < bd) { bd = d; best = x; } } return best; };
        G.Player.prototype.update = function () {
          if (this === pl && !this.dead) {
            const tg = target();
            if (tg) {
              const side = Math.sign(pl.x - tg.x) || -1, want = tg.x + side * dist;
              if (!pl.act || pl.act.kind === G.ItemKinds.ydcast) pl.x += Math.max(-5, Math.min(5, want - pl.x));
              pl.facing = Math.sign(tg.x - pl.x) || 1;
              if (cat !== 'ranged' && cat !== 'focus' && tg.cy < pl.y - 50) { pl.y = Math.min(pl.y, tg.cy + 24); pl.vy = Math.min(pl.vy, -0.3); }
              G.CH.st.v = Math.max(G.CH.st.v, 30);
              B.t++;
              if (B.hold > 0) { G.input.keys.add('KeyJ'); B.hold--; }
              else { G.input.keys.delete('KeyJ'); if (!pl.act && B.t % 3 === 0) { B.n++; B.hold = B.n % 4 === 0 ? 30 : 2; } }
            }
          }
          return up0.apply(this, arguments);
        };
      }, [cat]);
      let res = null;
      for (let round = 0; round < 40 && !res; round++) {
        res = await p.evaluate(LIMIT => {
          const F = window.__F, bz = G.Game.boss, pl = G.world.player;
          if (!F || !bz) return { err: 'no boss' };
          for (let k = 0; k < 2000; k++) {
            G.debugTick(30); pl.hp = pl.maxHp;
            if (bz.dead || G.Game.stage.cleared) break;
            if (G.UI._debug().modal) return null;            // a scene: let the runner drain it
            if (G.run.time - F.t0 > LIMIT) break;
          }
          G.Player.prototype.update = F.up0; G.Boss.prototype.takeHit = F.T0; G.input.keys.delete('KeyJ');
          return { shots: F.shots, dy: F.lastY, killed: !!(bz.dead || G.Game.stage.cleared), ttk: +(G.run.time - F.t0).toFixed(1), hits: F.hits, maxHitPct: +(F.maxFrac * 100).toFixed(2), legendHits: F.legend, avgHitPct: F.hits ? +(F.dmg / F.hits / bz.maxHp * 100).toFixed(2) : 0, bossHp: F.bossHp };
        }, LIMIT);
        if (!res) await drain();
      }
      const r = Object.assign(info, res || { err: 'stuck' });
      rows.push(r);
      console.log(JSON.stringify(r));
    }
    if (p._errs.length) console.log('errs', p._errs.slice(0, 5));
    await p.close();
  }
  const fails = rows.filter(r => !r.killed || r.maxHitPct > 8.0001 || r.err);
  console.log(fails.length ? 'FAILED: ' + fails.map(r => r.cat + '@' + r.pi + (r.err ? ' ' + r.err : r.killed ? ' hit ' + r.maxHitPct + '%' : ' not killed in ' + r.ttk + 's')).join('; ') : 'ALL CATEGORIES KILL ALL BOSSES; NO HIT ABOVE 8%');
  await b.close();
})();
