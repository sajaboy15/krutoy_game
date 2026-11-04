const L = require('./lib');
(async () => { const b = await L.chromium.launch(); const p = await L.open(b, '?stage=3&god'); await L.tick(p, 20);
 const rows = await p.evaluate(() => { const out = [];
  for (const id in G.Items.defs) { const d = G.Items.defs[id]; let dps = null, note = '';
   if (d.combo) { let dm = 0, fr = 0; for (const s of d.combo) { dm += (s.dmg || 0); fr += (s.windup || 0) + (s.active || 0) + (s.recover || 0); } dps = dm / fr * 60; note = 'combo ' + d.combo.length; }
   else if (d.kind === 'bow') { dps = (d.dmg || 0) * (d.count || 1) / ((d.drawT || 20) + (d.recover || 10)) * 60; note = 'bow'; }
   else if (d.kind === 'gun') { dps = 44 / ((d.aimT || 30) + (d.recover || 30)) * 60; note = 'gun aim ' + d.aimT; }
   else if (d.cooldown) { dps = (d.dmg || 0) / d.cooldown * 60; note = 'skill cd ' + d.cooldown; }
   out.push([id, d.kind, Math.round(dps * 10) / 10, note, G.LANG.T(d.name)]); }
  return out.sort((a, b) => (b[2] || 0) - (a[2] || 0)); });
 for (const r of rows) console.log(r.join('\t')); await b.close(); })();
