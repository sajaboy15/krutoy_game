// Stage 6 screenshots at 1920×1080: a quest scene, a merchant, the journal, the double-play check, the three bosses.
const T = require('./s6_lib');
const lang = process.argv[2] || 'ru';
const W = (p, f, a) => p.evaluate(f, a);
async function untilModal(p, type, n) { for (let i = 0; i < (n || 40); i++) { const m = await T.modal(p); if (m && (!type || m.type === type)) return m; await T.tick(p, 6); } return null; }
async function open(p, id) { await W(p, id => { G.WORLD2.syncPeople(); const it = G.world.ents.find(e => e._w2npc === id && !e.dead); const pl = G.world.player; pl.x = it.x - 14; pl.y = it.y - 1; it.onUse(pl, it); }, id); await T.tick(p, 10); }
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'potters', lang, viewport: { width: 1920, height: 1080 } });
  await T.go(p, 'potters', 9, []);
  await open(p, 'habiba'); await untilModal(p, 'choice'); await W(p, () => { G.UI._debug().modal.sel = 0; }); await T.press(p, 'Enter'); await T.tick(p, 30);
  await untilModal(p, 'dialog'); await T.tick(p, 40); await T.shot(p, 's6_quest_habiba_' + lang);
  await T.drain(p, []);
  await T.go(p, 'bazaar', 10, []);
  await open(p, 'shavkat'); await T.press(p, 'Enter'); await T.tick(p, 20); await untilModal(p, 'choice'); await W(p, () => { G.UI._debug().modal.sel = 0; }); await T.press(p, 'Enter'); await T.tick(p, 30); await untilModal(p, 'choice'); await T.tick(p, 30);
  await T.shot(p, 's6_merchant_' + lang); await T.drain(p, []);
  await W(p, () => { G.FAC.S().susp.divan = 5; G.YODGOR.run.rep.divan = 5; G.FAC.S().q.d1 = { st: 'done', br: 'x' }; });
  await W(p, () => { G.FAC.suspicionCheck('divan', 'tillabek', () => {}); }); await T.tick(p, 20); await T.press(p, 'Enter'); await T.tick(p, 20);
  await untilModal(p, 'dialog'); await T.tick(p, 30); await T.shot(p, 's6_spy_' + lang); await T.drain(p, []);
  await W(p, () => G.FAC.openJournal()); await T.tick(p, 30); await T.shot(p, 's6_journal_' + lang); await W(p, () => G.FAC.closeJournal()); await T.tick(p, 10);
  for (const lair of ['f_voice', 'f_humo', 'f_oydin']) {
    await W(p, l => { G.WORLD2.S().moon = 2; G.WORLD2.go(l, 'start', { force: true }); }, lair);
    await T.tick(p, 6); await T.settle(p, 300); await T.drain(p, []);
    await W(p, () => { const pl = G.world.player; for (let i = 0; i < 200 && !G.Game.stage.bossStarted; i++) { pl.x += 8; G.debugTick(2); } });
    await T.drain(p, []); await T.tick(p, 160); await T.drain(p, []);
    await W(p, () => { const bz = G.Game.boss; if (bz) { bz.hp = bz.maxHp * .5; } });
    for (let k = 0; k < 6; k++) { await T.tick(p, 50); await T.drain(p, []); }
    await T.shot(p, 's6_boss_' + lair + '_' + lang);
    await W(p, () => { const bz = G.Game.boss; if (bz) { bz.hp = 0; bz.dead = true; } }); await T.tick(p, 300); await T.drain(p, []); await T.tick(p, 60); await T.drain(p, []);
    await W(p, () => { G.YODGOR.run.ended = null; }); await T.leaveLair(p, [], {});
  }
  console.log(JSON.stringify({ errs: p._errs.slice(0, 8), untr: await T.untranslated(p) }));
  await b.close();
})();
