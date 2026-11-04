// Stage 6 test helpers: faction arcs, merchants, crime. Built on s5_lib (world + dialogs).
const T = require('./s5_lib');
const W = (p, f, a) => p.evaluate(f, a);
const OUT = process.env.YODGOR_SHOTS || T.out;
// a fresh open-world journey at a region, god mode, a language; returns the page
async function start(b, o) {
  o = o || {};
  const p = await T.open(b, '?world=' + (o.region || 'tail') + '&god' + (o.party ? '&party=' + o.party : ''), o.viewport ? { viewport: o.viewport } : {});
  if (o.viewport) await p.setViewportSize(o.viewport);
  await W(p, l => G.LANG.set(l), o.lang || 'ru');
  await T.watchText(p);
  await T.settle(p, 200); await T.tick(p, 60); await T.drain(p, []);
  await W(p, () => { G.godMode = true; if (G.run) G.run.gold = 2000; });
  return p;
}
// move to a region (story jump) at an hour
async function go(p, region, hour, log) {
  if (hour != null) await W(p, h => G.WORLD2.setHour(h), hour);
  await W(p, r => G.WORLD2.go(r, 'start', { force: true }), region);
  await T.tick(p, 4); await T.settle(p, 200); await T.tick(p, 30); await T.drain(p, log || []);
  if (hour != null) { await W(p, h => G.WORLD2.setHour(h), hour); await W(p, () => G.WORLD2.syncPeople()); await T.tick(p, 4); }
}
// talk to a W2 person (by npc id) the way the player would; options picked by regex list (in order), else 'first'
async function talk(p, id, log, picks) {
  const r = await W(p, id => { G.WORLD2.syncPeople(); const it = G.world.ents.find(e => e._w2npc === id && !e.dead); if (!it) return 'absent'; const pl = G.world.player; pl.x = it.x - 12; pl.y = it.y - 1; it.onUse(pl, it); return 'ok'; }, id);
  if (r !== 'ok') { log && log.push('!! ' + id + ' ' + r); return r; }
  await T.tick(p, 6); await drainPick(p, log, picks);
  return 'ok';
}
async function useProp(p, fid, log, picks) {
  const r = await W(p, fid => { const it = G.world.ents.find(e => e._f6 === fid && !e.dead); if (!it) return 'absent'; const pl = G.world.player; pl.x = it.x - 8; pl.y = it.y - 1; it.onUse(pl, it); return 'ok'; }, fid);
  if (r !== 'ok') { log && log.push('!! prop ' + fid + ' ' + r); return r; }
  await T.tick(p, 6); await drainPick(p, log, picks);
  return 'ok';
}
// drain dialogs; at each choice take the first regex in picks that matches an option (a pick is used once), else the first live option
// like s5_lib.drain, but one Enter per dialog page (two can fall through into a choice that opens right after)
async function drain1(p, log, o) {
  for (let i = 0; i < 500; i++) {
    await T.tick(p, 8);
    const m = await T.modal(p);
    if (!m) { await T.tick(p, 10); if (!(await T.modal(p))) return; continue; }
    if (m.type === 'choice') {
      await T.tick(p, 14);
      const cols = await W(p, () => G.UI._debug().modal.options.map(o => o.color));
      const okIdx = m.options.map((_, k) => k).filter(k => cols[k] !== '#7a7080');
      let sel = o.pick ? o.pick(m.options, m.title || '', okIdx) : null;
      if (sel == null) sel = okIdx[0];
      if (log) log.push('? ' + (m.title || '').slice(0, 60) + ' -> ' + m.options[sel]);
      await W(p, s => { G.UI._debug().modal.sel = s; }, sel);
      await T.press(p, 'Enter'); await T.tick(p, 20);
      continue;
    }
    if (log && m.type === 'dialog' && m.page === 0 && m.src) { const tag = (m.speaker || '-') + ': ' + String(m.src[0] || '').slice(0, 70); if (log[log.length - 1] !== tag) log.push(tag); }
    await T.press(p, 'Enter'); await T.tick(p, 6);
  }
}
async function drainPick(p, log, picks) {
  const left = (picks || []).slice();
  await drain1(p, log, { pick: (opts) => {
    for (let k = 0; k < left.length; k++) { const re = left[k]; const i = opts.findIndex(o => re.test(o)); if (i >= 0) { left.splice(k, 1); return i; } }
    const bye = opts.findIndex(o => /Another time|В другой раз|Boshqa safar|That's all|Это всё|Shu, xolos/.test(o));
    return bye >= 0 ? bye : null;
  } });
}
const fac = p => W(p, () => G.FAC.debug());
const shot = (p, name) => p.screenshot({ path: require('path').join(OUT, name + '.png') });
module.exports = Object.assign({}, T, { W, start, go, talk, useProp, drainPick, fac, shot, OUT });
