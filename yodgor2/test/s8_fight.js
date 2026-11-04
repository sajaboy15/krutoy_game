// Stage 8a: a boss fight played by a bot that reacts to the bosses' telegraphs (G.BM.threats are registered when a
// telegraph begins; the bot only "sees" a threat after its reaction delay).
//   node test/s8_fight.js <pi> <mode> [cat] [limitSec] [party]
//   mode: perfect — reacts in 100 ms, always picks the right answer; must take 0 damage from boss moves
//         avg     — reacts in 200–300 ms, gets 70% of the dodges right (30%: too early / not at all)
//         god     — no dodging at all, the hero cannot be hurt (time-to-kill floor)
// The hero is kept alive (hp refilled) so one run covers the whole fight; damage is counted, not suffered.
// Writes JSON to $S8_LOGS (default ../s8/logs) as fight_<pi>_<mode>_<cat>[_party].json
const L = require('./s8_lib');
const fs = require('fs'), path = require('path');
const [pi, mode = 'perfect', cat = 'sabre', limit = '480', party = ''] = process.argv.slice(2);
const LOGS = process.env.S8_LOGS || path.join(__dirname, '..', '..', 's8', 'logs');
fs.mkdirSync(LOGS, { recursive: true });
(async () => {
  const b = await L.chromium.launch();
  const p = await L.lair(b, +pi, { cat, party: party || '', god: mode === 'god' });
  if (process.env.S8_FORCE || process.env.S8_PH) await p.evaluate(([mv, ph]) => {
    const bz = G.Game.boss, S = G.BM.specs[bz.def.id];
    if (ph > 1) { bz.hp = bz.maxHp * bz.phaseAt[ph - 2] - 1; for (let i = 0; i < 400 && bz.mode !== 'fight' || i < 3; i++) G.debugTick(1); }
    if (mv) for (const k in S.moves) if (k !== mv) S.moves[k].ok = () => false; else { S.moves[k].cd = 0; S.moves[k].range = null; S.moves[k].ok = null; S.moves[k].ph = 1; S.moves[k].until = 0; }
    bz.def.phaseAt = [0.0001, 0.00005]; bz.phaseAt = [-1, -1];
  }, [process.env.S8_FORCE || '', +(process.env.S8_PH || 1)]);
  await p.evaluate(([mode, cat]) => {
    const pl = G.world.player, BM = G.BM, bz = G.Game.boss;
    const R = window.__R = { mode, t0: G.world.t, hits0: BM.hits.length, log0: BM.log.length, rolls: 0, jumps: 0, fails: 0, flasks: 0, heroDmg: 0, attacks: 0, heroHp: pl.maxHp, bossHp: Math.round(bz.maxHp), bossDmg: +bz.dmg.toFixed(1) };
    const P = mode === 'perfect' ? { react: [6, 6], ok: 1 } : mode === 'avg' ? { react: [12, 18], ok: 0.7 } : { react: [999, 999], ok: 0 };
    const dist = { ranged: 70, focus: 70, dutar: 30 }[cat] || 22;
    const seen = new Map();
    const inp = G.input;
    const press = k => { inp.lastPress[k] = G.frame; };
    const boxOf = th => typeof th.box === 'function' ? th.box() : th.box;
    const ov = (a, q, m) => a.x - m < q.x + q.w && a.x + a.w + m > q.x && a.y - m < q.y + q.h && a.y + a.h + m > q.y;
    let plan = null, B = { n: 0, hold: 0 };
    const up0 = R.up0 = G.Player.prototype.update;
    const target = () => { const L2 = G.world.enemies.filter(x => x && !x.dead && !x.untargetable && (x.isBoss || x.isBossPart) && x.alpha !== 0); const pref = L2.find(x => x.preferred); if (pref) return pref; const bz = L2.find(x => x.isBoss); if (bz && Math.abs(bz.cy - pl.cy) < 60) return bz; let best = null, bd = 1e9; for (const x of L2) { const d = Math.abs(x.x - pl.x) + Math.abs(x.cy - pl.cy) * 0.5; if (d < bd) { bd = d; best = x; } } return best; };
    G.Player.prototype.update = function () {
      if (this !== pl || this.dead) return up0.apply(this, arguments);
      const now = G.world.t, A = G.BossKit.arena();
      inp.down.left = inp.down.right = false;
      if (G.PARTY && G.PARTY._px) for (const c of G.PARTY._px.actors()) { if (c.downed && !c._wd) { const bz0 = G.Game.boss; (R.downs = R.downs || []).push([c.id, bz0 && (bz0.data.mv || bz0.data.recMv), Math.round((now - R.t0) / 60)]); } c._wd = !!c.downed; }
      if (R.jh > 0) { inp.down.jump = true; inp.keys.add('Space'); if (--R.jh === 0) inp.keys.delete('Space'); }
      if (mode !== 'god') pl.hp = pl.maxHp;
      // threats the bot has noticed
      let urgent = null, soon = 1e9; const U = [];
      for (const th of BM.live()) {
        let s = seen.get(th);
        if (!s) { s = { at: th.seen + P.react[0] + Math.random() * (P.react[1] - P.react[0]), ok: Math.random() < P.ok * (th.feint && mode === 'avg' ? 0.8 : 1), done: false }; seen.set(th, s); }
        if (now < s.at || s.done) continue;
        const bx = boxOf(th); if (!bx) continue;
        const pb = pl.box();
        let hit = ov(pb, bx, 8);
        if (!hit && th.wave) { const wx = th.wave.x0 + th.wave.dir * th.wave.spd * Math.max(0, now - th.wave.t0); hit = (pl.x - wx) * th.wave.dir > -6 && (pl.x - wx) * th.wave.dir < 70; }
        if (!hit) continue;
        let left = th.at - now;
        if (th.wave) { const dd = (pl.x - th.wave.x0) * th.wave.dir; left = th.wave.t0 + Math.round((dd - 14) / th.wave.spd) - now; if (dd < -8) continue; }
        if (th.dyn) { left = th.dyn(pl); if (left === null || left === undefined) continue; }
        U.push({ th, s, bx, left });
        if (left < soon) { soon = left; urgent = U[U.length - 1]; }
      }
      // an ordinary enemy (a summoned minion) winding up close by: roll away from it
      if (!urgent && mode !== 'god') for (const e of G.world.enemies) {
        if (!e || e.dead || e.isBoss || e.isBossPart || !(e.teleT > 0) || Math.abs(e.x - pl.x) > 56 || Math.abs(e.y - pl.y) > 40) continue;
        const th = e.__th || (e.__th = {}); if (th.f === e.teleMax + ':' + Math.floor(G.world.t / 200)) continue;
        let s = seen.get(e); if (!s || s.used) { s = { at: now + P.react[0], ok: Math.random() < P.ok, used: false }; seen.set(e, s); }
        if (now >= s.at && e.teleT <= 3) { s.used = true; th.f = e.teleMax + ':' + Math.floor(G.world.t / 200); if (s.ok && pl.state !== 'roll') { const dir = Math.sign(pl.x - e.x) || 1; if (dir > 0) inp.down.right = true; else inp.down.left = true; press('roll'); R.rolls++; } }
      }
      if (U.length && mode !== 'god') {
        // where is the nearest spot outside every "out" box? (both ways, walls respected)
        const outs = U.filter(u => u.s.ok && (u.th.how === 'out' || (u.th.how === 'roll' && u.bx.w <= 130 && !u.th.noWalk)));
        const inside = x => outs.some(u => x + pl.w / 2 + 4 > u.bx.x && x - pl.w / 2 - 4 < u.bx.x + u.bx.w);
        const free = d => { for (let k = 0; k <= 240; k += 4) { const x = pl.x + d * k; if (x < A.x0 + 10 || x > A.x1 - 10) return 1e9; if (!inside(x)) return k; } return 1e9; };
        const dl = free(-1), dr = free(1), esc = dl < dr ? -1 : 1, escD = Math.min(dl, dr);
        let rolled = false;
        for (const u of U.sort((p, q) => p.left - q.left)) {
          const { th, s, bx, left } = u;
          if (!s.ok) { if (!s.done && left < 26 && Math.random() < .5 && mode === 'avg') { press('roll'); R.fails++; s.done = true; } if (left <= 0) s.done = true; continue; }
          if (th.how === 'jump' || (th.how === 'any' && bx.y + bx.h > A.floor - 4 && bx.h <= 22)) {
            if (left <= 8 && pl.onGround && pl.state !== 'roll') { press('jump'); R.jumps++; R.jh = 18; inp.down.jump = true; inp.keys.add('Space'); s.done = true; }
          } else if (th.how === 'out') {
            if (escD < 1e9) { if (esc > 0) inp.down.right = true; else inp.down.left = true; }
            if (!rolled && escD / 2.0 > left - 1 && left <= 3 && pl.rollCD <= 0 && pl.state !== 'roll') { if (esc > 0) { inp.down.right = true; inp.down.left = false; } else { inp.down.left = true; inp.down.right = false; } press('roll'); R.rolls++; rolled = true; if (th.dur <= 10) s.done = true; }
            if (left <= 0 && th.dur <= 10) s.done = true;
          } else if (!th.noWalk && bx.w <= 72 && escD < 1e9 && (escD / 2.0 <= left + 2 || pl.rollCD > 0)) {
            // a small target (a head's bite, a claw): just step out of it
            if (esc > 0) inp.down.right = true; else inp.down.left = true;
            if (left <= 0) s.done = true;
          } else {
            if (!rolled && left <= 2 && pl.state !== 'roll') { const d = th.rollTo ? (Math.sign(th.rollTo() - pl.x) || 1) : escD < 1e9 ? esc : (Math.sign(pl.x - (bx.x + bx.w / 2)) || 1); inp.down.left = d < 0; inp.down.right = d > 0; press('roll'); R.rolls++; rolled = true; s.done = true; }
          }
        }
      }
      // fighting: close in and attack when nothing is coming soon
      let tg = target();
      // minions in the way are cut down first
      for (const e of G.world.enemies) if (e && !e.dead && !e.isBoss && !e.isBossPart && e.bossOwner && Math.abs(e.x - pl.x) < 60 && Math.abs(e.y - pl.y) < 40) { tg = e; break; }
      // the perfect bot attacks in the boss's windows (or while nothing is being prepared); the others are greedier
      const bzz = G.Game.boss, safe = mode !== 'perfect' || !bzz || (tg && !tg.isBoss && !tg.isBossPart) || (bzz.data && (bzz.data.rec > 14 || (!bzz.data.mv && !bzz.data.hold && bzz.atkCD > 22)));
      if (tg && soon > 34 && safe) {
        const side = Math.sign(pl.x - tg.x) || -1, want = tg.x + side * dist;
        if (Math.abs(want - pl.x) > 6 && !inp.down.left && !inp.down.right) { if (want > pl.x) inp.down.right = true; else inp.down.left = true; }
        if (!pl.act && Math.abs(want - pl.x) < 16) pl.facing = Math.sign(tg.x - pl.x) || 1;
        const stam = G.CH && G.CH.st ? G.CH.st.v : 100;
        if (mode === 'god') G.CH.st.v = Math.max(stam, 30);
        if (B.hold > 0) { inp.keys.add('KeyJ'); B.hold--; }
        else { inp.keys.delete('KeyJ'); if (!pl.act && Math.abs(want - pl.x) < 30 && Math.abs(tg.cy - pl.cy) < 70 && (mode === 'god' || stam > 45) && G.frame % 3 === 0) { B.n++; B.hold = 2; R.attacks++; } }
      } else { inp.keys.delete('KeyJ'); B.hold = 0; }
      return up0.apply(this, arguments);
    };
    const T0 = R.T0 = G.Boss.prototype.takeHit;
    G.Boss.prototype.takeHit = function (h) { const before = this.hp; const ok = T0.apply(this, arguments); if (ok && h && h.src === pl) R.heroDmg += before - this.hp; return ok; };
  }, [mode, cat]);
  let res = null;
  const LIM = +limit;
  for (let round = 0; round < 400 && !res; round++) {
    res = await p.evaluate(LIM => {
      const R = window.__R, bz = G.Game.boss, pl = G.world.player;
      for (let k = 0; k < 600; k++) {
        G.debugTick(6);
        if (!bz || bz.dead || bz.mode === 'dying' || G.Game.stage.cleared) break;
        if (G.UI._debug().modal) return null;
        if ((G.world.t - R.t0) / 60 > LIM) break;
      }
      if (!(!bz || bz.dead || bz.mode === 'dying' || G.Game.stage.cleared) && (G.world.t - R.t0) / 60 <= LIM) return 'more';
      G.Player.prototype.update = R.up0; G.Boss.prototype.takeHit = R.T0; G.input.keys.delete('KeyJ');
      const BM = G.BM, hits = BM.hits.slice(R.hits0), log = BM.log.slice(R.log0).filter(e => e.id === bz.def.id);
      const per = {}; for (const h of hits) { const k = (h.minion ? 'minion:' : '') + h.mv; per[k] = per[k] || { n: 0, dmg: 0 }; per[k].n++; per[k].dmg += Math.round(h.dmg); }
      const moves = {}, gaps = {};
      for (let i = 0; i < log.length; i++) {
        const e = log[i];
        if (e.ev === 'start') moves[e.mv] = (moves[e.mv] || 0) + 1;
        if (e.ev === 'end') { const nx = log.slice(i + 1).find(q => q.ev === 'start' || q.ev === 'phase' || q.ev === 'death'); if (nx && nx.ev === 'start') { const g = nx.t - e.t; const G2 = gaps[e.mv] || (gaps[e.mv] = { min: 1e9, sum: 0, n: 0 }); G2.min = Math.min(G2.min, g); G2.sum += g; G2.n++; } }
      }
      for (const k in gaps) gaps[k] = { min: gaps[k].min, avg: Math.round(gaps[k].sum / gaps[k].n) };
      const phases = log.filter(e => e.ev === 'phase').map(e => e.mv + '@' + ((e.t - R.t0) / 60).toFixed(0) + 's');
      const party = G.PARTY && G.PARTY._px ? G.PARTY._px.actors().map(c => ({ id: c.id, hp: Math.round(c.hp), downed: !!c.downed })) : [];
      const stats = G.PARTY && G.PARTY.stats ? { boss: G.PARTY.stats.boss, taken: G.PARTY.stats.taken } : null;
      return { killed: !!(bz.dead || bz.mode === 'dying' || G.Game.stage.cleared), secs: +((G.world.t - R.t0) / 60).toFixed(1), hpLeft: +(Math.max(0, bz.hp) / bz.maxHp).toFixed(3), phase: bz.phase,
        bossHp: R.bossHp, bossDmg: R.bossDmg, heroHp: R.heroHp, hitsTaken: hits.filter(h => !h.minion).length, dmgTaken: Math.round(hits.filter(h => !h.minion).reduce((s, h) => s + h.dmg, 0)), minionHits: hits.filter(h => h.minion).length,
        perMove: per, hitList: hits.filter(h => !h.minion).slice(0, 30).map(h => [h.mv, h.ph, h.dx, h.py, h.st, Math.round(h.dmg)]), moves, gaps, phases, rolls: R.rolls, jumps: R.jumps, fails: R.fails, attacks: R.attacks, heroDmg: Math.round(R.heroDmg), boxLog: bz.data.log, party, partyStats: stats, downs: R.downs || [] };
    }, LIM);
    if (res === 'more') { res = null; continue; }
    if (!res) await L.drain(p);
  }
  res = Object.assign({ pi: +pi, mode, cat, party, arm: p._arm, errs: p._errs.slice(0, 5) }, res || { err: 'stuck' });
  const f = path.join(LOGS, `fight_${pi}_${mode}_${cat}${party ? '_party' : ''}${process.env.S8_FORCE ? '_' + process.env.S8_FORCE : ''}.json`);
  fs.writeFileSync(f, JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await p.close(); await b.close();
})();
