const { chromium } = require('playwright');
(async () => {
  for (const sr of [48000, 96000]) {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage();
  const logs = [];
  p.on('console', m => logs.push(m.type() + ': ' + m.text()));
  p.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await p.addInitScript(sr => { const A = window.AudioContext; window.AudioContext = window.webkitAudioContext = class extends A { constructor(o) { super(Object.assign({}, o || {}, { sampleRate: sr })); } }; }, sr);
  await p.goto('http://127.0.0.1:47820/');
  await p.waitForTimeout(1500);
  await p.click('#gate');
  await p.waitForTimeout(3000);
  const after = await p.evaluate(() => { const K = G.AudioKit; const c = K && K.ctx && K.ctx(); return { ready: G.Audio.ready, cur: G.Audio.current, ctx: c && c.state, sr: c && c.sampleRate }; });
  // peak level on master via analyser
  const level = await p.evaluate(async () => { const K = G.AudioKit, c = K.ctx(), g = K.graph(); const an = c.createAnalyser(); an.fftSize = 2048; const node = g && (g.limiter || g.master || g.comp); if (!node) return 'no node:' + Object.keys(g || {}); node.connect(an); await new Promise(r => setTimeout(r, 1500)); const d = new Float32Array(2048); an.getFloatTimeDomainData(d); return Math.max(...d.map(Math.abs)); });
  console.log(JSON.stringify({ sr, after, level, logs: logs.filter(l => !/TUNNEL/.test(l)).slice(0, 10) }, null, 1));
  await b.close(); }
})();
