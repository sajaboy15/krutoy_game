// Stage 7 (companions) test helpers: patient open, HD viewport, scene draining.
const L = require('./s3_lib');
const path = require('path');
const out = process.env.YODGOR_SHOTS || path.join(__dirname, 'out');
async function open(b, q, opts = {}) { return L.open(b, q, Object.assign({ viewport: opts.hd ? { width: 1920, height: 1080 } : { width: 960, height: 540 } }, opts)); }
async function drain(p, n = 200) {
  for (let i = 0; i < n; i++) {
    await L.tick(p, 8);
    const m = await L.modal(p);
    if (!m) { await L.tick(p, 10); if (!(await L.modal(p))) return; continue; }
    if (m.type === 'choice') { await L.tick(p, 14); await p.evaluate(() => { G.UI._debug().modal.sel = 0; }); }
    await L.press(p, 'Enter'); await L.press(p, 'Enter');
  }
}
const shot = (p, name) => p.screenshot({ path: path.join(out, name + '.png') });
module.exports = Object.assign({}, L, { open, drain, shot, out });
