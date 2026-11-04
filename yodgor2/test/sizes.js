const L = require('./lib');
(async () => { const b = await L.chromium.launch(); const rows = [];
 const n = 32;
 for (let i = 0; i < n; i++) { const p = await L.open(b, '?stage=' + i + '&god'); await L.tick(p, 20);
  rows.push(await p.evaluate(i => { const pl = G.Game.stage.plan; return [i, pl.id, pl.type, Math.round(G.level.pw / 16), G.world.enemies.length, (G.level.objects || []).filter(o => o.kind === 'lore').length]; }, i)); await p.close(); }
 console.log(rows.map(r => r.join('\t')).join('\n')); await b.close(); })();
