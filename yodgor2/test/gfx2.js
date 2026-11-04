const L = require('./lib');
(async () => { const b = await L.chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
 for (const [w, h] of [[1366, 768], [1920, 1080]]) {
 const p = await b.newPage({ viewport: { width: w, height: h } }); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text()); });
 await p.goto('file://' + require('path').resolve(__dirname, '../dist/standalone.html')); await p.waitForTimeout(900);
 await p.evaluate(() => { document.getElementById('gate').hidden = true; }); await p.evaluate(() => G.debugTick(120));
 for (const pre of ['ultra', 'low']) { await p.evaluate(pre => G.GFX.set('preset', pre), pre); await p.evaluate(() => G.debugTick(2)); await p.screenshot({ path: `out/g2_title_${w}_${pre}.png` }); }
 await p.evaluate(() => { G.GFX.set('preset', 'ultra'); G.Game.startRun({ mode: 'wanderer' }); }); await p.evaluate(() => G.debugTick(200));
 for (let i = 0; i < 10; i++) await p.evaluate(() => { if (G.UI.isOpen()) { const m = G.UI._debug().modal; if (m) { m.closing = true; m.closeT = 99; } } G.debugTick(20); });
 await p.evaluate(() => G.debugTick(60)); await p.screenshot({ path: `out/g2_play_${w}.png` });
 await p.evaluate(() => G.GFX.set('scaling', 'integer')); await p.evaluate(() => G.debugTick(2)); await p.screenshot({ path: `out/g2_play_${w}_int.png` });
 await p.evaluate(() => { G.Game.setState('title'); G.UI.openTitle(); G.debugTick(60); G.MENU_ACT('options'); G.debugTick(20); }); 
 await p.evaluate(() => { const m = G.UI._debug().modal; m.sel = 1; }); await p.keyboard.press('Enter'); await p.evaluate(() => G.debugTick(40));
 await p.screenshot({ path: `out/g2_menu_${w}.png` });
 console.log(w, JSON.stringify({ ok: await p.evaluate(() => G.GFX.ok), errs })); await p.evaluate(() => G.GFX.set('scaling', 'fit')); await p.close(); }
 await b.close(); })();
