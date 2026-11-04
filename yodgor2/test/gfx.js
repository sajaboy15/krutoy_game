const L = require('./lib');
(async () => { const b = await L.chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] }); const R = {};
 const p = await L.open(b, '?stage=3&god'); await L.tick(p, 60);
 for (let i = 0; i < 20 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.press(p, 'Enter'); await L.tick(p, 10); }
 await L.tick(p, 120);
 R.gfx = await p.evaluate(() => ({ ok: G.GFX.ok, q: G.GFX.q, fx: !!document.getElementById('fx') }));
 for (const q of ['ultra', 'high', 'classic']) { await p.evaluate(q => G.GFX.set(q), q); await L.tick(p, 3); await L.shot(p, 'gfx_' + q); }
 await p.evaluate(() => G.GFX.set('ultra'));
 await p.evaluate(() => { G.Game.setState('title'); G.UI.openTitle(); }); await L.tick(p, 90);
 R.menu = await p.evaluate(() => G.MAIN_MENU.map(m => m.label)); await L.shot(p, 'gfx_title');
 await p.evaluate(() => G.MENU_ACT('options')); await L.tick(p, 30); R.opts = (await L.modal(p)).options; await L.shot(p, 'gfx_options');
 R.errs = p._errs; console.log(JSON.stringify(R, null, 1)); await b.close(); })();
