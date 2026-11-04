const L = require('./lib');
(async () => { const b = await L.chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  const p = await L.open(b, '?stage=3&god'); await p.setViewportSize({ width: 1280, height: 720 });
  await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => ({ ok: G.GFX.ok, preset: G.GFX.S.preset, fx: (document.getElementById('fx') || {}).style && document.getElementById('fx').style.display, op: G.display.style.opacity }));
  console.log('start', JSON.stringify(await st()));
  // sabotage: the post pass draws black from now on
  await p.evaluate(() => { const c = document.getElementById('fx'); const gl = c.getContext('webgl'); const d = gl.drawArrays.bind(gl); gl.drawArrays = (...a) => { d(...a); gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT); }; });
  await p.waitForTimeout(6000);
  console.log('after sabotage', JSON.stringify(await st()), JSON.stringify(await p.evaluate(() => G.GFX.watch)));
  // F9 reset and bad saved settings on reload
  await p.evaluate(() => { localStorage.setItem('yodgor2_gfx2', JSON.stringify({ preset: 'zzz', fps: 7, bright: 9, scaling: 'x' })); });
  await p.reload(); await p.waitForTimeout(1500);
  console.log('reload bad settings', JSON.stringify(await p.evaluate(() => G.GFX.S)));
  await p.keyboard.press('F9'); await p.waitForTimeout(300);
  console.log('F9', JSON.stringify(await p.evaluate(() => G.GFX.S)));
  const p2 = await L.open(b, '?resetgfx'); console.log('resetgfx', JSON.stringify(await p2.evaluate(() => G.GFX.S)));
  console.log(p._errs, p2._errs); await b.close(); })();
