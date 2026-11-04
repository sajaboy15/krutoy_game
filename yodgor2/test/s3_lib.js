// Stage 3 tests: lib.js with patient timeouts (the test machine is shared and often loaded).
const L = require('./lib');
const path = require('path');
const pageUrl = 'file://' + path.join(process.env.YODGOR_OUT || path.join(__dirname, '..', 'dist'), 'standalone.html');
async function open(b, q = '', opts = {}) {
  const p = await b.newPage({ viewport: opts.viewport || { width: 960, height: 540 } });
  p.setDefaultTimeout(600000); p.setDefaultNavigationTimeout(600000);
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
module.exports = Object.assign({}, L, { open });
