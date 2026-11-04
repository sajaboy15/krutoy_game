const L = require('./lib');
(async () => { const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=9&god');
  await p.setViewportSize({ width: 1920, height: 1080 });
  await p.waitForTimeout(1500);
  console.log(await p.evaluate(() => { const r = {}; for (const c of document.querySelectorAll('canvas')) r[c.id || c.className || 'x' + Math.random()] = [c.width, c.height, c.style.width, c.style.height, getComputedStyle(c).imageRendering, c.style.display]; r.disp = G.display && [G.display.width, G.display.height]; r.dctx = G.dctx && [G.dctx.canvas.width, G.dctx.canvas.height]; r.gfx = G.GFX && JSON.stringify(G.GFX.S); return JSON.stringify(r, null, 1); }));
  await b.close(); })();
