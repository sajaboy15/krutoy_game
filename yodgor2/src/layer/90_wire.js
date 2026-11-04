/* =====================================================================
   Wiring: journeys, saving, death, the stage card, the queue.
   Story files register their handlers in the tables below.
   ===================================================================== */
let continuing = false;

/* ---------- checkpoint at the start of every land ---------- */
const CP_KEY = 'yodgor2_checkpoint_v1';
const readCP = () => {
  try {
    const c = JSON.parse(localStorage.getItem(CP_KEY) || 'null');
    return c && c.v === 2 && c.run && typeof c.run.planIndex === 'number' && c.rpg ? c : null;
  } catch (e) { return null; }
};
const clearCP = () => { try { localStorage.removeItem(CP_KEY); } catch (e) { /* ignore */ } updateMenu(); };
function checkpoint(next) {
  const r = G.run;
  if (!r || !G.Game.stage || R().ended) return;
  const pl = G.world && G.world.player;
  let land = G.Game.stage.landName || (G.Game.stage.biome && G.Game.stage.biome.name) || '';
  if (next != null) { const np = G.PLAN[next]; const nm = np && name0(np); land = nm ? N(nm) : land; }
  const cp = {
    v: 2, at: Date.now(), land,
    run: {
      planIndex: next != null ? next : r.planIndex, mode: r.mode, diffLevel: r.diffLevel, seed: r.seed,
      gold: r.gold || 0, goldEarned: r.goldEarned || 0, kills: r.kills || 0, time: r.time || 0,
      deaths: r.deaths || 0, damageTaken: r.damageTaken || 0,
      stats: Object.assign({ red: 0, purple: 0, green: 0 }, r.stats),
      flasks: r.flasks, maxFlasks: r.maxFlasks, perks: (r.perks || []).slice(),
      hp: pl && pl.hp > 0 ? pl.hp : r.hp, scrolls: r.scrolls || 0,
      bossesKilled: (r.bossesKilled || []).slice(), lore: (r.lore || []).slice(), cheatUsed: !!r.cheatUsed,
      slots: Object.fromEntries(Object.entries(r.slots || {}).map(([k, it]) => [k, it ? { id: it.id, tier: it.tier || 0 } : null]))
    },
    rpg: JSON.parse(JSON.stringify(saga.run))
  };
  try { localStorage.setItem(CP_KEY, JSON.stringify(cp)); } catch (e) { /* ignore */ }
}
function updateMenu() {
  const M = G.MAIN_MENU;
  if (!Array.isArray(M)) return;
  const cp = readCP();
  const i = M.findIndex(x => x && x.act === 'continue');
  if (cp) {
    const label = t(`Continue|Продолжить|Davom etish`) + (cp.land ? ': ' + LANG.T(cp.land) : '');
    if (i < 0) M.unshift({ label, act: 'continue' }); else M[i].label = label;
  } else if (i >= 0) M.splice(i, 1);
}
function continueRun(given) {
  const cp = given || readCP();
  if (!cp) { updateMenu(); return false; }
  const c = cp.run;
  continuing = true;
  try { G.newRun({ mode: c.mode || 'wanderer' }); } finally { continuing = false; }
  const r = G.run;
  Object.assign(r, {
    seed: c.seed, diffLevel: c.diffLevel || 'normal', gold: c.gold, goldEarned: c.goldEarned, kills: c.kills, time: c.time, deaths: c.deaths,
    damageTaken: c.damageTaken, stats: Object.assign({ red: 0, purple: 0, green: 0 }, c.stats),
    flasks: c.flasks, maxFlasks: c.maxFlasks, perks: (c.perks || []).slice(), hp: c.hp, scrolls: c.scrolls,
    bossesKilled: (c.bossesKilled || []).slice(), lore: (c.lore || []).slice(), cheatUsed: !!c.cheatUsed
  });
  for (const k in c.slots || {}) {
    const it = c.slots[k];
    try { r.slots[k] = it && G.Items.defs[it.id] ? G.Items.create(it.id, it.tier || 0) : null; } catch (e) { r.slots[k] = null; }
  }
  saga.run = cp.rpg; fixRun(); save();
  if (G.YODGOR.intro) S.intro = G.YODGOR.intro();
  G.ENDING_TITLE = null; busy = false; Q.length = 0;
  G.Game.loadStage(c.planIndex);
  return true;
}

/* ---------- stage card label ---------- */
const ACT_LABEL = [`PROLOGUE|ПРОЛОГ|MUQADDIMA`, `ACT I|АКТ I|I QISM`, `ACT II|АКТ II|II QISM`, `ACT III|АКТ III|III QISM`];
G.STAGE_LABEL = plan => {
  if (!plan) return '';
  if (plan.type === 'rest') return N(`REST|ПРИВАЛ|DAM OLISH`);
  if (plan.type === 'boss') return N(`LAIR|ЛОГОВО|UYA`);
  return N(ACT_LABEL[plan.act || 0] || ACT_LABEL[0]);
};
G.PAUSE_STAT = () => [t(`Hollowness|Пустота|Bo'shliq`), R().void + '/' + VOID_MAX];

/* ---------- engine hooks ---------- */
const orig = { exitStage: G.Game.exitStage, setState: G.Game.setState, showLore: G.Game.showLore, offerPerk: G.Game.offerPerk };

G.Events.on('newRun', () => {
  if (G.run) G.run.diffLevel = pendingDiff || 'normal';
  if (continuing) return;
  saga.runs++;
  saga.run = blankRun();
  saga.run.diff = G.run ? G.run.diffLevel : 'normal';
  G.ENDING_TITLE = null; busy = false; Q.length = 0; lostTumar = null;
  for (const f of ON_NEWRUN) { try { f(); } catch (e) { console.error('[yodgor]', e); } }
  if (G.YODGOR.intro) S.intro = G.YODGOR.intro();
  save();
});

G.Events.on('stageStart', (plan, biome, level) => {
  Q.length = 0; busy = false;
  sub.list.length = 0; sub.cur = null;
  if (!plan || R().ended) return;
  checkpoint();
  try { wispAttach(); } catch (e) { console.error('[yodgor]', e); }
  try { placeLostTumar(); } catch (e) { console.error('[yodgor]', e); }
  // The engine's boss arenas have no way out: add the gate (hidden until the boss falls).
  try {
    if (plan.type === 'boss' && level && level.exit && !G.world.interactables.some(o => o.art === 'door'))
      G.Game.spawnObject({ kind: 'door', x: level.exit.x, y: level.exit.y }, G.run.stage, level);
  } catch (e) { console.error('[yodgor]', e); }
  for (const f of ON_STAGE) { try { f(plan, biome, level); } catch (e) { console.error('[yodgor]', e); } }
});

G.Game.exitStage = function () {
  const self = this, args = arguments;
  if (R().ended && G.Game.state === 'play') return;
  try {
    const st = this.stage, plan = st && st.plan, r = R(), pi = PI();
    if (plan && !r.ended && !busy) {
      const ex = plan.type === 'level' && (EXIT[plan.id] || (LANDS[plan.id] && LANDS[plan.id].exit));
      if (ex && !r.at[sceneKey('exit', plan.id)]) {
        r.at[sceneKey('exit', plan.id)] = 1; save();
        scene(ex, () => orig.exitStage.apply(self, args));
        return;
      }
      const post = plan.type === 'boss' && (POST[plan.boss] || (BOSSES[plan.boss] && BOSSES[plan.boss].post));
      const pk = sceneKey('post', BOSSES[plan.boss] ? BOSSES[plan.boss].id : plan.boss);
      if (post && !r.at[pk]) {
        r.at[pk] = 1; save();
        Q.length = 0;
        scene(post, () => { if (!(G.STORY_BOSS_DONE && G.STORY_BOSS_DONE(BOSSES[plan.boss] ? BOSSES[plan.boss].id : plan.boss))) checkpoint(pi + 1); orig.exitStage.apply(self, args); });
        return;
      }
    }
  } catch (e) { console.error('[yodgor]', e); }
  if (busy) return;
  return orig.exitStage.apply(this, args);
};


G.Game.setState = function (st) {
  if (st === 'dead' && G.Game.state !== 'dead') {
    try {
      saga.deaths++;
      const mode = G.run && G.run.mode;
      if (mode === 'classic') clearCP();
      else {
        dropLostTumar();
        const d = mode === 'souls' ? DIFF.oath : diffOf(G.run);
        R().void = clamp(R().void + d.voidDeath, 0, VOID_MAX);
        if (R().void >= VOID_MAX) R().hollow = true;
        R().deathsThisRun = (R().deathsThisRun || 0) + 1;
      }
      save();
      S.death = DEATH_LINES.length ? [t(pick(DEATH_LINES))] : [t(`You fell.|Ты пал.|Yiqilding.`)];
    } catch (e) { console.error('[yodgor]', e); }
  }
  return orig.setState.apply(this, arguments);
};

G.Events.on('victory', () => { clearCP(); busy = false; Q.length = 0; });
G.Events.on('state', st => { if (st === 'title') { busy = false; Q.length = 0; updateMenu(); } });
LANG.onChange(updateMenu);
updateMenu();

/* ---------- the queue and per-frame checks ---------- */
(function tick() {
  try {
    subUpdate();
    if (G.Game.state === 'play') for (const f of TICK) f();
    if (Q.length && quiet()) {
      const i = Q.findIndex(q => q.when());
      if (i >= 0) { const q = Q.splice(i, 1)[0]; q.show(); }
    }
  } catch (e) { console.error('[yodgor]', e); Q.length = 0; busy = false; }
  requestAnimationFrame(tick);
})();

G.YODGOR = {
  version: VERSION, continueRun, VOID_MAX,
  get checkpoint() { return readCP(); },
  get saga() { return saga; }, get run() { return saga.run; }, get busy() { return busy; },
  set(o) {
    const r = R();
    if (o.f) Object.assign(r.f, o.f);
    if (o.rep) Object.assign(r.rep, o.rep);
    for (const k of ['void', 'trust', 'tastes']) if (o[k] != null) r[k] = o[k];
    save();
  },
  reset() { saga = blank(); save(); },
  addVoid, bark, subtitle, scene, play, say, ask
};
G.YODGOR.hollowEnd = () => endGame('hollow');
G.YODGOR.finish = finish;
G.YODGOR.endGame = endGame;
try { applyNames(); } catch (e) { console.error('[yodgor]', e); }
