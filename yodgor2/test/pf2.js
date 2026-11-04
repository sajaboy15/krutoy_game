const L = require('./lib');
(async () => { const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=9&god');
  await p.evaluate(() => { const P = CanvasRenderingContext2D.prototype, f = P.fillText, d = P.drawImage; window.__F = []; P.fillText = function (s) { if (/Court|Hound|1:/.test(s) && window.__F.length < 20) window.__F.push(this.font + ' :: ' + s + ' :: ' + this.canvas.width + 'x' + this.canvas.height + ' T=' + JSON.stringify(this.getTransform().a)); return f.apply(this, arguments); }; });
  await p.evaluate(() => { G.Art && G.Art.ptext; });
  await p.waitForTimeout(3000);
  console.log((await p.evaluate(() => window.__F)).join('\n'));
  await b.close(); })();
