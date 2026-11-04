const L = require('./lib');
(async () => { const b = await L.chromium.launch();
  const p = await L.open(b, '');
  const url = await p.evaluate(() => { const c = document.createElement('canvas'); c.width = 200; c.height = 60; const x = c.getContext('2d'); x.fillStyle = '#222'; x.fillRect(0, 0, 200, 60);
    x.font = '8px "Press Start 2P", monospace'; x.textBaseline = 'top'; x.fillStyle = '#fff'; x.fillText('Двор Пса 1:15 Hound', 2, 2);
    G.Art.ptext(x, 'Двор Пса 1:15 Hound', 2, 20, { color: '#fff', outline: '#000' }); x.font = '6px "Press Start 2P", monospace'; x.fillText('Small 1:15', 2, 40);
    return c.toDataURL(); });
  require('fs').writeFileSync('out/pf3.png', Buffer.from(url.split(',')[1], 'base64'));
  await b.close(); })();
