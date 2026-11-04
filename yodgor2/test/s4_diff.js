// Stage 4 — the linear campaign is untouched: plan length, victory index, difficulty of every entry.
// Run against two builds (with and without the world layer) and compare the output.
const L = require('./lib');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '');
  await L.tick(p, 30);
  const r = await p.evaluate(() => {
    const lin = G.PLAN.slice(0, G.PLAN.findIndex(e => e.type === 'victory') + 1);
    return {
      planIds: lin.map(e => e.id).join(','), victory: G.PLAN.findIndex(e => e.type === 'victory'),
      combat: G.PLAN.filter(e => e.type === 'level' || e.type === 'boss').length,
      stage: lin.map((e, i) => +G.stageOf(i).toFixed(3)).join(','),
      menu: G.MAIN_MENU.map(m => m.act || m.label).join(','), world: !!G.WORLD2
    };
  });
  console.log(JSON.stringify(r), p._errs);
  await b.close();
})();
