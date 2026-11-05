// Stage 10 (01_settings, 89q): key remapping, achievements, New Game+. node test/s10_meta.js
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang: 'uz' });
  await T.watchText(p);
  const W = (f, a) => p.evaluate(f, a);
  const res = {};
  res.ach = await W(() => G.ACH.LIST.length);
  res.kb = await W(() => { G.SETTINGS.bind('kb', 'attack', 'KeyX'); return [G.KEYMAP_KB.attack.join(), G.SETTINGS.keyOf('attack')]; });
  await W(() => G.SETTINGS.bind('lk', 'book', 'KeyZ'));
  await p.keyboard.press('KeyZ'); await W(() => { G.debugTick(0); });
  res.bookByZ = await W(() => G.CHUI.open && G.CHUI.page);
  await W(() => G.CHUI.close && G.CHUI.close());
  await p.keyboard.press('KeyY'); await W(() => { G.debugTick(0); });
  res.yStillOpens = await W(() => !!G.CHUI.open);
  await W(() => { G.CHUI.close && G.CHUI.close(); localStorage.removeItem('yd_settings'); G.SETTINGS.S.kb = {}; G.SETTINGS.S.lk = {}; G.SETTINGS.applyEngine(); });
  res.unlock = await W(() => { G.ACH.unlock('oshiq_champion'); return G.ACH.count(); });
  res.ng = await W(() => { const s = G.YODGOR.run; return 1; });
  res.ngcarry = await W(() => {
    const lvl0 = G.CH.level();
    G.NGPLUS.carry && 0;
    // what an ending leaves for New Game+, then the carry itself
    G.Events.emit('state', 'victory');
    G.NGPLUS.carry();
    return { lvl0, lvl: G.CH.level(), ng: G.YODGOR.run.ng, runNg: G.run.ngPlus };
  });
  res.diff = await W(() => { const d = { hpMul: 1, dmgMul: 1 }; G.ADJUST_DIFF(d, G.run); return [Math.round(d.hpMul * 100) / 100, Math.round(d.dmgMul * 100) / 100]; });
  res.time = await W(() => G.ACH.time());
  console.log(JSON.stringify(res), p._errs.slice(0, 5), (await T.untranslated(p)).filter(s => !/^Level|^Talk/.test(s)).slice(0, 6));
  await b.close();
})();
