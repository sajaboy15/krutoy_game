// Stage 8a: 1920x1080 pictures of each boss's signature moves and phase changes.
//   node test/s8_shots.js [pi,...]      -> $YODGOR_SHOTS (default test/out) s8_<boss>_<name>.png
const L = require('./s8_lib');
const PLAN = {
  1: [['ram', 1, 40, -70], ['inhale', 1, 70, -110], ['lash', 1, 30, -90], ['@phase', 2, 40], ['burst', 2, 50, -60], ['crack', 2, 44, -120]],
  5: [['bite2', 1, 34, -90], ['@phase', 2, 46], ['chorus', 2, 50, -90], ['curse', 2, 60, -60], ['@phase', 3, 50], ['dark', 3, 80, -90]],
  9: [['thrust', 1, 26, -100], ['dash', 1, 34, -200], ['@phase', 2, 40], ['guard', 2, 30, -60], ['grab', 2, 30, -60], ['@phase', 3, 40], ['blaze', 3, 76, -90]],
  12: [['wave', 1, 50, -160], ['rings', 1, 50, -120], ['@phase', 2, 40], ['note', 2, 70, -100], ['glyphs', 2, 60, -40], ['@phase', 3, 40], ['ink', 3, 40, -100]],
  16: [['lunge', 1, 70, -80], ['hair', 1, 32, -120], ['@phase', 2, 50], ['drag', 2, 50, -70], ['@phase', 3, 40], ['crawl', 3, 30, -150]],
  23: [['pounce', 1, 40, -120], ['roar', 1, 60, -90], ['@phase', 2, 40], ['blizzard', 2, 120, -100], ['breath', 2, 44, -70], ['@phase', 3, 40], ['strain', 3, 120, -80]],
  31: [['breath', 1, 140, -200], ['sweep', 1, 120, -200], ['@phase', 2, 50], ['dive', 2, 110, -120], ['@phase', 3, 50], ['eclipse', 3, 90, -120], ['float', 3, 60, -100]]
};
const PIS = (process.argv[2] || Object.keys(PLAN).join(',')).split(',').map(Number);
(async () => {
  const b = await L.chromium.launch();
  for (const pi of PIS) {
    const p = await L.lair(b, pi, { hd: true });
    await p.evaluate(() => { window.requestAnimationFrame = () => 0; });
    const id = L.IDS[pi];
    for (const [mv, ph, n, dx] of PLAN[pi]) {
      const info = await p.evaluate(([mv, ph, n, dx]) => {
        const bz = G.Game.boss, pl = G.world.player, A = G.BossKit.arena(), d = bz.data;
        if (G.UI._debug().modal) G.UI._debug().modal = null;
        if (mv === '@phase') {
          bz.hp = bz.maxHp * bz.phaseAt[ph - 2] - 1; G.debugTick(1);
          for (let i = 0; i < n; i++) G.debugTick(1);
          return 'phase ' + bz.phase + ' ' + bz.mode;
        }
        // wait for the boss to be free, then run the move
        for (let i = 0; i < 400 && bz.mode !== 'fight'; i++) G.debugTick(1);
        for (const e of G.world.ents) if (e._boss === bz || e.bossOwner === bz) e.dead = true;
        d.mv = null; d.rec = 0; d.hold = null; bz.atkCD = 9999; bz.alpha = 1; bz.untargetable = false;
        if (G.BM.dark) G.BM.dark(bz, 0);
        const bx = (bz.hx !== undefined ? bz.hx : bz.x);
        pl.x = Math.max(A.x0 + 30, Math.min(A.x1 - 30, bx + dx * (bx > A.cx ? 1 : -1) * -1 * (dx < 0 ? 1 : 1)));
        pl.x = Math.max(A.x0 + 30, Math.min(A.x1 - 30, bx > A.cx ? bx + dx : bx - dx));
        pl.y = A.floor; pl.vx = 0; pl.hp = pl.maxHp;
        G.debugTick(2);
        G.BM.start(bz, mv);
        for (let i = 0; i < n; i++) { G.debugTick(1); pl.hp = pl.maxHp; }
        return bz.def.id + ' ' + mv + ' st=' + bz.state + ' ph=' + bz.phase;
      }, [mv, ph, n, dx]);
      await p.evaluate(() => G.debugTick(0));
      await L.shot(p, `s8_${id}_${mv === '@phase' ? 'phase' + ph : mv}`);
      console.log(pi, info);
    }
    if (p._errs.length) console.log('errs', p._errs.slice(0, 4));
    await p.close();
  }
  await b.close();
})();
