// Stage 7 balance (GDD ch. 12, 18):
//   node test/s7_balance.js share [pi,...]   companions' damage vs the hero's in ordinary fights (25–35% each)
//   node test/s7_balance.js boss [pi,...]    boss fights solo vs the full party: kill time, hero damage taken
// A scripted hero (sabre, the level and gear a player would have there, see s3_bosses.js) attacks the nearest enemy.
const L = require('./s7_lib');
const MODE = process.argv[2] || 'share';
const PIS = (process.argv[3] || (MODE === 'boss' ? '1,9,16,23' : '3,14,26')).split(',').map(Number);
const LVL = { 1: 3, 3: 4, 5: 7, 9: 9, 12: 11, 14: 12, 16: 14, 20: 16, 23: 17, 26: 19, 31: 24 };
async function setup(p, pi, party) {
  await p.evaluate(async ([pi, lvl, party]) => {
    G.Game.startRun({ mode: 'wanderer' }); G.run.diffLevel = 'normal'; await new Promise(r => setTimeout(r, 60));
    G.Game.loadStage(pi); await new Promise(r => setTimeout(r, 300));
    const stage = G.run.stage, s = G.CH.S();
    while (s.lvl < lvl) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp);
    const P = s.free; for (let i = 0; i < P; i++) G.CH.addPoint(i % 3 === 2 ? 'end' : i % 3 === 1 ? 'str' : 'agi');
    const W = G.YITEMS.W.map(id => G.Items.defs[id]).filter(d => d.yd.cat === 'sabre' && !d.noDrop && (d.minStage || 0) <= stage + 0.01).sort((x, y) => y.yd.tier - x.yd.tier || y.yd.power - x.yd.power);
    const up = Math.min(5, Math.floor(stage / 1.8 + 0.4)), q = stage < 3 ? 0 : stage < 6 ? 1 : 2;
    const at = G.CH.attrs(), m0 = W.find(d => !d.yd.req || Object.keys(d.yd.req).every(k => (at[k] || 0) >= d.yd.req[k])) || W[W.length - 1];
    const e = G.CH.give(m0.id, { q, up, quiet: true }); G.YITEMS.equip(e.u, 'attack');
    G.CH.dirty(); G.world.player.syncStats(false); G.world.player.hp = G.world.player.maxHp;
    if (party) {
      for (const id of ['alp', 'nargiza', 'surayyo']) G.PARTY.join(id, { quiet: true });
      // companions get a weapon of their category from the same shop shelf (a fair party)
      for (const id of ['alp', 'nargiza', 'surayyo']) {
        const cats = G.PARTY.DEF[id].cats, Wd = G.YITEMS.W.map(x => G.Items.defs[x]).filter(d => cats.includes(d.yd.cat) && d.yd.sub !== 'shield' && !d.noDrop && (d.minStage || 0) <= stage + 0.01).sort((x, y) => y.yd.tier - x.yd.tier || y.yd.power - x.yd.power)[0];
        if (Wd) { const e2 = G.CH.give(Wd.id, { q, up, quiet: true }); G.PARTY.equip(id, 'weapon', e2.u); }
      }
      G.Game.loadStage(pi); await new Promise(r => setTimeout(r, 300));   // the land answers the party
      G.world.player.hp = G.world.player.maxHp;
    }
  }, [pi, LVL[pi] || 10, party]);
}
function bot(p, bossOnly, godMode) {
  return p.evaluate(([bossOnly, godMode]) => {
    const pl = G.world.player;
    G.godMode = godMode;
    const B = window.__B = { t: 0, hold: 0, n: 0, t0: G.run.time, refills: 0 };
    const up0 = B.up0 = G.Player.prototype.update;
    const target = () => { let best = null, bd = 1e9; for (const x of G.world.enemies) { if (!x || x.dead || x.untargetable || x.isBossPart) continue; if (bossOnly && !x.isBoss) continue; const d = Math.abs(x.x - pl.x) + Math.abs(x.cy - pl.cy) * 0.8; if (d < bd) { bd = d; best = x; } } return best; };
    G.Player.prototype.update = function () {
      if (this === pl && !this.dead) {
        // in a boss fight the player helps a fallen companion up when the boss is not on top of them
        const dn = bossOnly && G.PARTY._px.actors().find(c => c.downed), bz = G.Game.boss;
        if (dn && pl.hp > pl.maxHp * 0.45 && (!bz || Math.abs(bz.x - dn.x) > 60)) {
          G.input.keys.delete('KeyJ');
          if (!pl.act) pl.x += Math.max(-3, Math.min(3, dn.x + 6 - pl.x));
          if (Math.abs(dn.x - pl.x) < 22) { G.input.keys.add('KeyF'); if (!B.revF) B.revF = 1; } else G.input.keys.delete('KeyF');
          if (pl.hp < pl.maxHp * 0.35) { pl.hp = pl.maxHp; B.refills++; }
          return up0.apply(this, arguments);
        } else if (B.revF) { G.input.keys.delete('KeyF'); B.revF = 0; }
        const tg = target();
        if (tg) {
          const side = Math.sign(pl.x - tg.x) || -1, want = tg.x + side * 18;
          if (!pl.act) pl.x += Math.max(-4, Math.min(4, want - pl.x));
          pl.facing = Math.sign(tg.x - pl.x) || 1;
          if (tg.cy < pl.y - 50) { pl.y = Math.min(pl.y, tg.cy + 24); pl.vy = Math.min(pl.vy, -0.3); }
          G.CH.st.v = Math.max(G.CH.st.v, 30);
          B.t++;
          if (B.hold > 0) { G.input.keys.add('KeyJ'); B.hold--; }
          else { G.input.keys.delete('KeyJ'); if (!pl.act && B.t % 3 === 0) { B.n++; B.hold = B.n % 4 === 0 ? 30 : 2; } }
        } else G.input.keys.delete('KeyJ');
        if (pl.hp < pl.maxHp * 0.35) { pl.hp = pl.maxHp; B.refills++; }
      }
      return up0.apply(this, arguments);
    };
    G.PARTY.resetStats();
    // where the companions' time goes (state histogram per companion)
    const C = G.PARTY._px.Comp.prototype; B.cu0 = C.update; B.st = {};
    B.th0 = C.takeHit; B.hits = {};
    C.takeHit = function (e) { const h0 = this.hp; const r = B.th0.apply(this, arguments); if (r) { const src = e && e.src, k = (e && e.type || '?') + ':' + (!src ? '-' : src.isBoss ? 'boss' : src.def && src.def.id ? (src._support ? 'support' : 'enemy') : (src.constructor && src.constructor.name) || 'obj'); B.hits[k] = (B.hits[k] || 0) + Math.max(0, h0 - Math.max(0, this.hp)); } return r; };
    C.update = function () { const r = B.cu0.apply(this, arguments); const h = B.st[this.id] || (B.st[this.id] = {}); const k = this.downed ? 'downed' : this.busy() ? this.state : this.inCombat ? 'engage' : 'follow'; h[k] = (h[k] || 0) + 1; return r; };
  }, [bossOnly, godMode]);
}
const stop = p => p.evaluate(() => { const B = window.__B; if (B) { G.Player.prototype.update = B.up0; if (B.cu0) G.PARTY._px.Comp.prototype.update = B.cu0; if (B.th0) G.PARTY._px.Comp.prototype.takeHit = B.th0; } G.input.keys.delete('KeyJ'); });
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '');
  await L.tick(p, 30);
  for (const pi of PIS) {
    if (MODE === 'share') {
      await setup(p, pi, true); await L.drain(p);
      await bot(p, false, true);
      let res = null;
      for (let r = 0; r < 40 && !res; r++) {
        res = await p.evaluate(() => {
          let k = 0; for (; k < 2500; k++) {
            G.debugTick(30);
            if (G.UI._debug().modal) return null;
            if (G.run.time - window.__B.t0 > 100) break;
            // a fight in place: the land's own enemies are gone; packs of four come at the party, one after another
            const pl = G.world.player, W = window.__B;
            if (!W.packs) { W.packs = 0; for (const e of G.world.enemies) if (!e._pack) e.dead = true; }
            const alive = G.world.enemies.filter(e => !e.dead && e._pack);
            if (!alive.length) {
              for (const c of G.PARTY._px.actors()) if (c.downed) { c.revive('hero'); W.revives = (W.revives || 0) + 1; }   // the player helps them up between packs
              const list = G.Enemies.list(G.level.biome.enemyBiome || G.level.biome.id).filter(d => !d.fly && !d.boss);
              const side = Math.abs(pl.x - G.level.pw / 2) > 200 ? Math.sign(G.level.pw / 2 - pl.x) : W.packs % 2 ? -1 : 1; W.packs++;   // never towards the land's edge (a region door)
              for (let i = 0; i < 4; i++) { const d = list[(W.packs + i) % list.length]; G.PARTY._px.noScale = true; const e = G.Enemies.spawn(d.id, pl.x + side * (70 + i * 14), pl.y - 2, {}); G.PARTY._px.noScale = false; if (e) { e._pack = true; e.aggro = true; } }
            }
          }
          const S = G.PARTY.stats, h = S.hero || 1;
          const share = {}; for (const id of ['alp', 'nargiza', 'surayyo']) share[id] = +((S.dealt[id] || 0) / h * 100).toFixed(1);
          return { gs: G.Game.state, k, secs: Math.round(G.run.time - window.__B.t0), packs: window.__B.packs, hero: Math.round(S.hero), share, potential: Math.round(G.PARTY._px.heroDps() * (G.run.time - window.__B.t0)), ofPotential: Object.fromEntries(Object.entries(S.dealt).map(([k, v]) => [k, +(v / (G.PARTY._px.heroDps() * (G.run.time - window.__B.t0)) * 100).toFixed(1)])), total: +(Object.values(S.dealt).reduce((a, b) => a + b, 0) / h * 100).toFixed(1), heals: Math.round(S.heals || 0), takenC: Object.fromEntries(Object.entries(S.taken).map(([k, v]) => [k, Math.round(v)])), downed: G.PARTY._px.actors().filter(c => c.downed).length, targets: S.targets, revives: window.__B.revives || 0, extra: G.PARTY._px.extra, states: Object.fromEntries(Object.entries(window.__B.st).map(([id, h]) => { const n = Object.values(h).reduce((a, b) => a + b, 0); return [id, Object.fromEntries(Object.entries(h).map(([k, v]) => [k, Math.round(v / n * 100)]))]; })) };
        });
        if (!res) await L.drain(p, 20);
      }
      await stop(p);
      console.log(JSON.stringify(Object.assign({ pi, land: await p.evaluate(() => G.PLAN[G.run.planIndex].id) }, res || { err: 'stuck' })));
    } else {
      const out = { pi, boss: await p.evaluate(pi => G.PLAN[pi].boss, pi) };
      for (const party of [false, true]) {
        await setup(p, pi, party); await L.drain(p);
        await p.evaluate(() => { const pl = G.world.player; for (let i = 0; i < 200 && !G.Game.stage.bossStarted; i++) { pl.x += 8; G.debugTick(2); } });
        await L.drain(p);
        await bot(p, true, false);
        let res = null;
        for (let r = 0; r < 60 && !res; r++) {
          res = await p.evaluate(() => {
            const bz = G.Game.boss;
            for (let k = 0; k < 2000; k++) {
              G.debugTick(30);
              if (!bz || bz.dead || G.Game.stage.cleared) break;
              if (G.UI._debug().modal) return null;
              if (G.run.time - window.__B.t0 > 480) break;
            }
            const S = G.PARTY.stats, secs = G.run.time - window.__B.t0;
            return { killed: !!(!bz || bz.dead || G.Game.stage.cleared), ttk: Math.round(secs), heroTaken: Math.round(S.taken.hero || 0), takenPerMin: Math.round((S.taken.hero || 0) / secs * 60), refills: window.__B.refills, heroDmg: Math.round(S.hero), onBoss: Object.fromEntries(Object.entries(S.boss || {}).map(([k, v]) => [k, Math.round(v)])), comp: Object.fromEntries(Object.entries(S.dealt).map(([k, v]) => [k, Math.round(v)])), downs: G.PARTY._px.downs || 0, outs: G.PARTY._px.actors().filter(c => c.downed).length + ['alp', 'nargiza', 'surayyo'].filter(id => G.PARTY.member(id).out).length, supports: G.PARTY._px.supports || 0, hitsC: Object.fromEntries(Object.entries(window.__B.hits).map(([k, v]) => [k, Math.round(v)])) };
          });
          if (!res) await L.drain(p, 20);
        }
        await stop(p);
        out[party ? 'party' : 'solo'] = res || { err: 'stuck' };
        await p.evaluate(() => { for (const id of ['alp', 'nargiza', 'surayyo']) if (G.PARTY.has(id)) G.PARTY.leave(id, 'test'); G.PARTY._px.supports = 0; G.PARTY._px.downs = 0; });
      }
      if (out.solo.ttk && out.party.ttk) out.ttkRatio = +(out.party.ttk / out.solo.ttk).toFixed(2), out.takenRatio = +(out.party.takenPerMin / Math.max(1, out.solo.takenPerMin)).toFixed(2);
      console.log(JSON.stringify(out));
    }
  }
  console.log('errors', JSON.stringify(p._errs.slice(0, 5)));
  await b.close();
})();
