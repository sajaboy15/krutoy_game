// Stage 6 — the faction finals and the finale: whose plan is under way after a fight (retarget), the epilogue slide of a
// leader you fought, and all four city endings still finishing (each via finish(), the epilogue screen).
const T = require('./s6_lib');
const W = (p, f, a) => p.evaluate(f, a);
(async () => {
  const b = await T.chromium.launch();
  const R = { rows: [] };
  for (const [e, setup] of [['tithe', 'fought_singers'], ['chain', 'fought_divan'], ['awake', 'helped'], ['tale', 'fought_remember']]) {
    const p = await T.start(b, { region: 'tail', lang: 'ru' });
    const r = await W(p, ([e, setup]) => {
      const f = G.YODGOR.run.f, rep = G.YODGOR.run.rep;
      Object.assign(rep, { singers: 8, divan: 5, remember: 3 });
      f.faction = setup === 'fought_singers' ? 'singers' : setup === 'fought_divan' ? 'divan' : 'remember';
      f.oydin = 'joined';
      if (setup.startsWith('fought_')) { const k = setup.slice(7); G.FAC.flag(setup, 1); G.FAC.retarget(k); }
      if (setup === 'fought_remember') G.FAC.flag('oydinWords', 1);
      const fac = f.faction;
      G.YODGOR.finish(e);
      return { fac, ended: G.YODGOR.run.ended, slides: G.STORY.epilogue.length, keys: (G.STORY.epilogueKeys || []).filter(Boolean).map(k => k.k + ':' + k.v) };
    }, [e, setup]);
    await T.tick(p, 200); for (let i = 0; i < 20; i++) { await T.tick(p, 30); await T.drain(p, []); if (await W(p, () => G.Game.state === 'victory')) break; }
    r.state = await W(p, () => G.Game.state); r.e = e; r.setup = setup; r.errs = p._errs.slice(0, 5);
    R.rows.push(r); await p.close();
  }
  R.ok = R.rows.every(r => r.ended === r.e && r.slides > 3 && !r.errs.length)
    && R.rows[0].fac !== 'singers' && R.rows[0].keys.includes('shirin:voiceless')
    && R.rows[1].fac !== 'divan' && R.rows[1].keys.includes('tillabek:broken')
    && R.rows[3].keys.includes('oydin:words');
  console.log(JSON.stringify(R, null, 1));
  await b.close();
})();
