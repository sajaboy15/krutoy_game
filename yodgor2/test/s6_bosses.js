// Stage 6 — the three faction bosses: every category kills each one with a god-mode bot at level 24 (the s3_bosses
// approach), no single hit above 8% of its health, and each boss uses its moves (G.BM log).
//   node test/s6_bosses.js [cats] [bosses]
const T = require('./s6_lib');
const CATS = (process.argv[2] || 'sabre,staff,knife,shield,ranged,dutar,focus').split(',');
const BOSSES = (process.argv[3] || 'f_voice,f_humo,f_oydin').split(',');
const MAIN = { sabre: ['agi', 'str'], staff: ['str', 'end'], knife: ['agi', 'str'], shield: ['str', 'end'], ranged: ['agi', 'str'], dutar: ['mem', 'agi'], focus: ['mem', 'agi'] };
const LIMIT = 420;
(async () => {
  const b = await T.chromium.launch();
  const rows = [];
  for (const lairId of BOSSES) {
    const p = await T.start(b, { region: 'tail', lang: 'en' });
    for (const cat of CATS) {
      await T.W(p, l => { G.WORLD2.S().moon = 2; G.WORLD2.go(l, 'start', { force: true }); }, lairId);
      await T.tick(p, 6); await T.settle(p, 300); await T.drain(p, []);
      const info = await T.W(p, ([cat, main]) => {
        const s = G.CH.S(); while (s.lvl < 24) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp);
        const P = s.free; const a1 = Math.min(17, Math.round(P * .6)), a2 = Math.min(17, Math.round(P * .15)), a3 = P - a1 - a2;
        for (let i = 0; i < a1; i++) G.CH.addPoint(main[0]); for (let i = 0; i < a2; i++) G.CH.addPoint(main[1]); for (let i = 0; i < a3; i++) G.CH.addPoint(main.includes('end') ? 'agi' : 'end');
        const stage = G.run.stage;
        const Wp = G.YITEMS.W.map(id => G.Items.defs[id]).filter(d => d.yd.cat === cat && !d.noDrop && (d.minStage || 0) <= stage + .01);
        const at0 = G.CH.attrs(), meets = d => !d.yd.req || Object.keys(d.yd.req).every(k => (at0[k] || 0) >= d.yd.req[k]);
        const pick = sub => Wp.filter(d => (sub ? d.yd.sub === sub : d.yd.sub !== 'shield') && meets(d)).sort((x, y) => y.yd.tier - x.yd.tier || y.yd.power - x.yd.power)[0];
        const m0 = cat === 'shield' ? pick('mace') : pick(null);
        const up = Math.min(5, Math.floor(stage / 1.8 + .4));
        const e = G.CH.give(m0.id, { q: 2, up, quiet: true }); G.YITEMS.equip(e.u, 'attack');
        if (cat === 'shield') { const sh = pick('shield'); if (sh) { const e2 = G.CH.give(sh.id, { q: 2, up, quiet: true }); G.YITEMS.equip(e2.u, 'secondary'); } }
        G.CH.dirty(); const pl = G.world.player; pl.syncStats(false);
        for (let i = 0; i < 200 && !G.Game.stage.bossStarted; i++) { pl.x += 8; G.debugTick(2); }
        return { region: G.WORLD2.active, stage: +stage.toFixed(2), weapon: m0.id + ' +' + up, boss: G.Game.boss && G.Game.boss.def.id };
      }, [cat, MAIN[cat]]);
      await T.drain(p, []);
      await T.W(p, cat => {
        const pl = G.world.player, bz = G.Game.boss; if (!bz) return;
        G.BM.log.length = 0;
        const S3 = window.__F = { t0: G.run.time, maxFrac: 0, hits: 0, dmg: 0, bossHp: Math.round(bz.maxHp) };
        const T0 = S3.T0 = G.Boss.prototype.takeHit;
        G.Boss.prototype.takeHit = function (h) { const before = this.hp; const ok = T0.apply(this, arguments); if (ok && h && h.src === pl && !h.words) { const d = before - this.hp; if (!h.legend) S3.maxFrac = Math.max(S3.maxFrac, d / this.maxHp); S3.hits++; S3.dmg += d; } return ok; };
        const dist = { ranged: 60, focus: 60, dutar: 26 }[cat] || 18, B = { t: 0, hold: 0, n: 0 };
        const up0 = S3.up0 = G.Player.prototype.update;
        G.Player.prototype.update = function () {
          if (this === pl && !this.dead) {
            const tg = G.world.enemies.filter(x => x && !x.dead && !x.untargetable && x.isBoss)[0];
            if (tg) {
              const side = Math.sign(pl.x - tg.x) || -1, want = tg.x + side * dist;
              if (!pl.act || pl.act.kind === G.ItemKinds.ydcast) pl.x += Math.max(-5, Math.min(5, want - pl.x));
              pl.facing = Math.sign(tg.x - pl.x) || 1;
              if (cat !== 'ranged' && cat !== 'focus' && tg.cy < pl.y - 50) { pl.y = Math.min(pl.y, tg.cy + 24); pl.vy = Math.min(pl.vy, -.3); }
              G.CH.st.v = Math.max(G.CH.st.v, 30); B.t++;
              if (B.hold > 0) { G.input.keys.add('KeyJ'); B.hold--; } else { G.input.keys.delete('KeyJ'); if (!pl.act && B.t % 3 === 0) { B.n++; B.hold = B.n % 4 === 0 ? 30 : 2; } }
            }
          }
          return up0.apply(this, arguments);
        };
      }, cat);
      let res = null;
      for (let round = 0; round < 40 && !res; round++) {
        res = await T.W(p, LIMIT => {
          const F = window.__F, bz = G.Game.boss, pl = G.world.player;
          if (!F || !bz) return { err: 'no boss' };
          for (let k = 0; k < 2000; k++) {
            G.debugTick(30); pl.hp = pl.maxHp;
            if (bz.dead || G.Game.stage.cleared) break;
            if (G.UI._debug().modal) return null;
            if (G.run.time - F.t0 > LIMIT) break;
          }
          G.Player.prototype.update = F.up0; G.Boss.prototype.takeHit = F.T0; G.input.keys.delete('KeyJ');
          const moves = {}; for (const e of G.BM.log) if (e.ev === 'start' && e.id === bz.def.id) moves[e.mv] = (moves[e.mv] || 0) + 1;
          return { killed: !!(bz.dead || G.Game.stage.cleared), ttk: +(G.run.time - F.t0).toFixed(1), hits: F.hits, maxHitPct: +(F.maxFrac * 100).toFixed(2), bossHp: F.bossHp, moves };
        }, LIMIT);
        if (!res) await T.drain(p, []);
      }
      const r = Object.assign({ lair: lairId, cat }, info, res || { err: 'stuck' });
      rows.push(r); console.log(JSON.stringify(r));
      await T.drain(p, []); await T.tick(p, 200); await T.drain(p, []);
      await T.W(p, () => { G.YODGOR.run.ended = null; });
      await T.leaveLair(p, [], {}); await T.drain(p, []);
    }
    if (p._errs.length) console.log('errs', JSON.stringify(p._errs.slice(0, 6)));
    await p.close();
  }
  const fails = rows.filter(r => !r.killed || r.maxHitPct > 8.0001 || r.err);
  console.log(fails.length ? 'FAILED: ' + fails.map(r => r.cat + '@' + r.lair + (r.err ? ' ' + r.err : r.killed ? ' hit ' + r.maxHitPct : ' not killed ' + r.ttk)).join('; ') : 'ALL CATEGORIES KILL ALL THREE; NO HIT ABOVE 8%');
  await b.close();
})();
