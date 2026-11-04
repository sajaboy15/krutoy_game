const L = require('./lib_stock');
(async () => { const b = await L.chromium.launch();
 const p = await L.open(b, '?stage=4&god'); await L.tick(p, 40);
 console.log(await p.evaluate(() => ({ inter: G.world.interactables.map(o=>o.art), objs: G.level.objects.map(o=>o.kind), plan: G.Game.stage.plan })));
 await b.close(); })();
