// Every menu/screen in each language, collecting text that was not translated.
const L = require('./lib');
(async () => {
  const b = await L.chromium.launch(); const out = {};
  for (const lang of ['en', 'uz', 'ru']) {
    const p = await L.open(b, '?stage=2&god');
    await p.evaluate(l => G.LANG.set(l), lang);
    await p.evaluate(() => {
      const T = window.__T, bad = window.__BAD = new Set();
      const ok = /^(SPACE|ENTER|ESC|TAB|SHIFT|V1\.0|J \/ LMB|K \/ RMB|LMB|RMB|SEL|START|STICK|YODGOR)$/;
      window.__T = s => { const r = T(s); try { if (typeof r === 'string' && r.length > 1) { const L = G.LANG.lang;
        if (L !== 'ru' && /[А-Яа-яЁё]/.test(r)) bad.add(r);
        if (L === 'ru' && /[A-Za-z]{4,}/.test(r) && !/[А-Яа-яЁё]/.test(r) && !ok.test(r)) bad.add(r); } } catch (e) {} return r; };
    });
    const sh = async n => { await L.tick(p, 30); await L.shot(p, 'scr_' + lang + '_' + n); };
    await L.tick(p, 60);
    for (let i = 0; i < 10 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.tick(p, 30); }
    // shop rugs, bakhshi song (perk cards), scroll
    await p.evaluate(() => { const r = G.world.interactables.find(o => o.art === 'shopRug'); if (r) { G.world.player.x = r.x; } });
    await sh('shop');
    await p.evaluate(() => { G.run.gold = 9999; const r = G.world.interactables.find(o => o.art === 'shopRug' && o.item); if (r) r.use(G.world.player); });
    await L.tick(p, 30);
    await p.evaluate(() => { const d = G.world.interactables.find(o => o.item && o.art !== 'shopRug'); if (d) { G.world.player.x = d.x; G.world.player.y = d.y; } });
    await sh('drop');
    await p.evaluate(() => { const it = G.world.interactables.find(o => o.item && o.art !== 'shopRug'); if (it) it.use(G.world.player); });
    await sh('swap'); for (let i = 0; i < 4 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.tick(p, 20); }
    await p.evaluate(() => G.Perks && G.Game.offerPerk({})); await L.tick(p, 40);
    for (let i = 0; i < 30; i++) { const m = await L.modal(p); if (!m) break; if (m.type === 'choice') { await sh('perks'); await L.press(p, 'Enter'); await L.tick(p, 30); break; } await L.press(p, 'Enter'); await L.press(p, 'Enter'); }
    await p.evaluate(() => G.Game.offerScroll && G.Game.offerScroll(G.world.player, { dead: false })); await L.tick(p, 30); await sh('scroll');
    for (let i = 0; i < 4 && (await L.modal(p)); i++) { await L.press(p, 'Enter'); await L.tick(p, 20); }
    // pause, controls, settings, confirm
    for (let i = 0; i < 60 && (await L.modal(p)); i++) { const m = await L.modal(p); if (m.type === 'choice') { await p.evaluate(() => { const md = G.UI._debug().modal; md.sel = md.options.length - 1; }); } await L.press(p, 'Enter'); await L.press(p, 'Enter'); await L.tick(p, 10); }
    await L.press(p, 'Escape'); await sh('pause');
    await p.evaluate(() => { G.UI._debug().modal.sel = 1; }); await L.press(p, 'Enter'); await sh('controls'); await L.press(p, 'Escape');
    await p.evaluate(() => { G.UI._debug().modal.sel = 2; }); await L.press(p, 'Enter'); await sh('settings'); await L.press(p, 'Escape'); await L.tick(p, 10);
    await p.evaluate(() => { G.UI._debug().modal.sel = 4; }); await L.press(p, 'Enter'); await sh('leave'); await L.press(p, 'Escape'); await L.press(p, 'Escape');
    // death screen
    await p.evaluate(() => { const pl = G.world.player; pl.die({}); }); for (let i = 0; i < 30; i++) { await L.tick(p, 10); if (await p.evaluate(() => G.Game.state === 'dead')) break; }
    await L.tick(p, 120); await sh('death');
    // title screens
    await p.evaluate(() => { G.Game.setState('title'); G.UI.openTitle(); }); await L.tick(p, 80); await sh('title');
    await p.evaluate(() => { G.UI._debug().TT.screen = 'about'; }); await sh('about');
    await p.evaluate(() => { G.UI._debug().TT.screen = 'controls'; }); await sh('tcontrols');
    await p.evaluate(() => { G.UI._debug().TT.screen = 'mode'; }); await sh('modes');
    await p.evaluate(() => { G.UI._debug().TT.screen = 'main'; G.LOAD_MENU(); }); await sh('load');
    out[lang] = { bad: await p.evaluate(() => [...window.__BAD]), errs: p._errs };
    await p.close();
  }
  console.log(JSON.stringify(out, null, 1)); await b.close();
})();
