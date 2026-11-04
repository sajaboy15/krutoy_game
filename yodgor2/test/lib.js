// Общие помощники для прогонов «Ёдгора» в безголовом браузере.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const pageUrl = 'file://' + path.join(process.env.YODGOR_OUT || path.join(root, 'dist'), 'standalone.html');
const out = process.env.YODGOR_SHOTS || path.join(root, 'test', 'out');
fs.mkdirSync(out, { recursive: true });

async function open(b, q = '', opts = {}) {
  const p = await b.newPage({ viewport: { width: 960, height: 540 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  await p.route('**/*', r => { const u = r.request().url(); return /^(file|data|blob):/.test(u) ? r.continue() : r.abort(); });
  if (opts.fresh !== false) await p.addInitScript(() => { try { if (!sessionStorage.getItem('__kept')) { localStorage.removeItem('yodgor2_saga_v1'); localStorage.removeItem('yodgor2_checkpoint_v1'); sessionStorage.setItem('__kept', '1'); } } catch (e) {} });
  await p.goto(pageUrl + q);
  await p.waitForTimeout(900);
  await p.evaluate(() => { const g = document.getElementById('gate'); if (g) g.hidden = true; });
  p._errs = errs;
  return p;
}
const shot = (p, name) => p.screenshot({ path: path.join(out, name + '.png') });
const tick = (p, n) => p.evaluate(n => G.debugTick(n), n);
const modal = p => p.evaluate(() => {
  const m = G.UI._debug().modal;
  if (!m) return null;
  return { type: m.type, speaker: m.speaker, src: m.src, page: m.page, title: m.title, options: (m.options || []).map(o => o.label) };
});
const press = async (p, key = 'Enter', n = 1) => {
  for (let i = 0; i < n; i++) { await p.keyboard.down(key); await tick(p, 2); await p.keyboard.up(key); await tick(p, 3); }
};
// Пролистать реплики до выбора (или до конца сцены). Возвращает список «кто: первая строка».
async function advance(p, max = 60, log = []) {
  for (let i = 0; i < max; i++) {
    await tick(p, 12);
    const m = await modal(p);
    if (!m) { await tick(p, 6); const m2 = await modal(p); if (!m2) return log; continue; }
    if (m.type === 'choice') return log;
    if (m.type === 'dialog' && m.page === 0) {
      const tag = (m.speaker || '—') + ': ' + (m.src || [])[0];
      if (log[log.length - 1] !== tag) log.push(tag);
    }
    await press(p, 'Enter'); // дописать строку
    await press(p, 'Enter'); // следующая страница
  }
  return log;
}
// Выбрать вариант по части подписи.
async function choose(p, part) {
  const m = await modal(p);
  if (!m || m.type !== 'choice') throw new Error('no choice open, want ' + part + ' got ' + JSON.stringify(m));
  const i = m.options.findIndex(l => l.includes(part));
  if (i < 0) throw new Error('option not found: ' + part + ' in ' + JSON.stringify(m.options));
  await tick(p, 14);
  await p.evaluate(i => { G.UI._debug().modal.sel = i; }, i);
  await press(p, 'Enter');
  await tick(p, 24);
  return m;
}
const use = (p, art) => p.evaluate(art => {
  const o = G.world.interactables.find(o => o.art === art);
  if (!o) return 'none:' + G.world.interactables.map(o => o.art).join(',');
  o.use(G.world.player);
  return 'ok';
}, art);
const setRun = (p, o) => p.evaluate(o => G.YODGOR.set(o), o);
const run = p => p.evaluate(() => JSON.parse(JSON.stringify(G.YODGOR.run)));

module.exports = { chromium, open, shot, tick, modal, press, advance, choose, use, setRun, run, out };
