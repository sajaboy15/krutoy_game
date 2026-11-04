const { chromium } = require('playwright');
(async () => {
  for (const flags of [['--autoplay-policy=no-user-gesture-required'], []]) {
    const b = await chromium.launch({ args: flags });
    const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
    const logs = [];
    p.on('console', m => logs.push(m.type() + ': ' + m.text()));
    p.on('pageerror', e => logs.push('pageerror: ' + e.message));
    await p.goto('http://127.0.0.1:47820/');
    await p.waitForTimeout(1500);
    const before = await p.evaluate(() => ({ ready: G.Audio.ready, cur: G.Audio.current, gate: !document.getElementById('gate').hidden }));
    await p.click('#gate').catch(e => logs.push('click fail ' + e.message));
    await p.waitForTimeout(2500);
    const after = await p.evaluate(() => { const K = G.AudioKit; const c = K && K.ctx && K.ctx(); return { ready: G.Audio.ready, cur: G.Audio.current, ctx: c && c.state, sr: c && c.sampleRate, muted: G.Audio.muted, vol: G.Audio.volume }; });
    console.log(JSON.stringify({ flags, before, after, logs: logs.slice(0, 15) }, null, 1));
    await b.close();
  }
})();
