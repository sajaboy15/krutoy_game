const L = require('./lib');
(async () => { const b = await L.chromium.launch(); const p = await L.open(b, '?stage=3&god'); await L.tick(p, 40);
 for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.press(p, 'Enter'); await L.tick(p, 10); }
 await L.press(p, 'KeyT'); await L.tick(p, 10);
 const s = () => p.evaluate(() => { const m = G.UI._debug().modal; return { open: G.PROG.ui.open, m: m && { type: m.type, title: m.title, picked: m.picked, pickT: m.pickT, n: m.options && m.options.length } }; });
 console.log('after T', await s());
 await L.press(p, 'Escape'); console.log('after esc', await s()); await L.tick(p, 30); console.log('after ticks', await s());
 await b.close(); })();
