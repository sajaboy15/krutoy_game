const L = require('./lib');
(async () => { const b = await L.chromium.launch();
 for (const q of ['?stage=1&god','?stage=5&god']) {
 const p = await L.open(b, q); await L.tick(p, 40);
 console.log(q, await p.evaluate(() => ({ inter: G.world.interactables.map(o=>o.art), ents: (G.world.ents||[]).filter(o=>o.art).map(o=>o.art), objs: G.level.objects.map(o=>o.kind), exit: G.level.exit, arena: G.level.isArena })));
 await p.close(); }
 await b.close(); })();
