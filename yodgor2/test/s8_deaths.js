// Stage 8a: deaths per boss for an "average" player, estimated from the avg-bot run (s8_fight.js <pi> avg).
// Model: boss hits arrive as a Poisson process at the measured rate; each hit costs a damage drawn from the measured hits;
// the hero has max hp plus 3 flasks of 35% (drunk when low, each costs a little exposure: +0.25 hit);
// an attempt lasts the bot's time-to-kill. P(win) by Monte Carlo; deaths = 1/P(win) - 1.
//   node test/s8_deaths.js [pi,...]
const fs = require('fs'), path = require('path');
const LOGS = process.env.S8_LOGS || path.join(__dirname, '..', '..', 's8', 'logs');
const PIS = (process.argv[2] || '1,5,9,12,16,23,31').split(',');
for (const pi of PIS) {
  const f = path.join(LOGS, `fight_${pi}_avg_sabre.json`);
  if (!fs.existsSync(f)) { console.log(pi, 'no avg run'); continue; }
  const R = JSON.parse(fs.readFileSync(f, 'utf8'));
  const dmgs = (R.hitList || []).map(h => h[5]).filter(x => x > 0);
  const rate = R.hitsTaken / R.secs, mean = R.dmgTaken / Math.max(1, R.hitsTaken);
  const ttk = R.killed ? R.secs : R.secs / Math.max(.05, 1 - R.hpLeft);
  const HP = R.heroHp, pool = HP * (1 + 3 * .35);
  let win = 0; const N = 20000;
  for (let i = 0; i < N; i++) {
    let t = 0, dmg = 0;
    for (;;) { t += -Math.log(1 - Math.random()) / rate; if (t > ttk) break; dmg += dmgs.length ? dmgs[Math.floor(Math.random() * dmgs.length)] : mean; if (dmg >= pool) break; }
    if (dmg < pool) win++;
  }
  const p = win / N;
  console.log(JSON.stringify({ pi: +pi, heroHp: HP, hitsPerMin: +(rate * 60).toFixed(2), meanHit: Math.round(mean), bigHitsToDie: +(HP / (Math.max(...dmgs, mean))).toFixed(1), ttkMin: +(ttk / 60).toFixed(1), pWin: +p.toFixed(3), deaths: p > 0 ? +(1 / p - 1).toFixed(1) : '>100' }));
}
