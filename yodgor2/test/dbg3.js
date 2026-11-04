const L = require('./lib');
(async () => { const b = await L.chromium.launch(); const p = await L.open(b, '?stage=10&god'); await L.tick(p, 40);
 await p.evaluate(() => { G.YODGOR.set({ f: { sado: 1, widow: 'force' } }); G.YODGOR.run.worn = ['t_mehri_son']; });
 console.log(await p.evaluate(() => G.PROG.worn()));
 await p.evaluate(() => G.Game.loadStage(11)); await L.tick(p, 30);
 console.log(await p.evaluate(() => ({ void: G.YODGOR.run.void, worn: G.PROG.worn(), plan: G.Game.stage.plan.type, f: G.YODGOR.run.f.widow })));
 for (let k = 0; k < 8; k++) { await L.tick(p, 60); for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.tick(p, 10); } }
 console.log(await p.evaluate(() => ({ void: G.YODGOR.run.void, t: G.Game.stage.t, busy: G.YODGOR.busy })), p._errs); await b.close(); })();
