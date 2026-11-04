/* =====================================================================
   Yodgor v2 — base: state, saving, text, scenes.
   All story text is written as `English|Русский|O'zbekcha` and resolved
   when it is shown, so the language can change at any time.
   ===================================================================== */
const S = G.STORY;
const LANG = G.LANG;
const t = LANG.t, tf = LANG.tf, N = LANG.N;
const VERSION = '2.0';

/* ---------- saga (between journeys) and the current journey ---------- */
const KEY = 'yodgor2_saga_v1';
const VOID_MAX = 100;
const blankRun = () => ({
  void: 0, trust: 0, f: {}, at: {}, warned: {}, mem: {}, tastes: 0, burns: 0,
  rep: { singers: 0, divan: 0, remember: 0, tail: 0, rabat: 0 },
  ended: null, hollow: false, diff: 'normal', clues: 0
});
const blank = () => ({ runs: 0, deaths: 0, endings: {}, seen: {}, lore: {}, boss: {}, mem: {}, run: blankRun() });
let saga = blank();
try {
  const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
  if (raw && typeof raw === 'object') saga = Object.assign(blank(), raw);
} catch (e) { /* no memory — still playable */ }
for (const k of ['endings', 'seen', 'lore', 'boss', 'mem']) if (!saga[k] || typeof saga[k] !== 'object') saga[k] = {};
function fixRun() {
  const b = blankRun();
  saga.run = Object.assign(b, saga.run && typeof saga.run === 'object' ? saga.run : {});
  for (const k of ['f', 'at', 'warned', 'mem', 'rep']) if (!saga.run[k] || typeof saga.run[k] !== 'object') saga.run[k] = blankRun()[k];
}
fixRun();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(saga)); } catch (e) { /* ignore */ } };
const R = () => saga.run;
const F = () => saga.run.f;
const PI = () => (G.run ? G.run.planIndex : -1);
// where the story stands, as a key: a plan index in the linear prologue, the chapter / rest / region id in the open city (85c)
const SK = () => (G.STORY_KEY ? G.STORY_KEY() : PI());
const PLAN = () => (G.Game.stage && G.Game.stage.plan) || {};
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const once = key => { const at = R().at; if (at[key]) return false; at[key] = 1; save(); return true; };
const seenEver = key => { if (saga.seen[key]) return true; saga.seen[key] = 1; save(); return false; };

/* ---------- colours ---------- */
const C = {
  void: '#c9b4ff', back: '#7dffd8', rep: '#f2d27a', know: '#6fe3d1', coin: '#ffd77a', danger: '#ff8a7a',
  sado: '#9ff3e6', trustUp: '#bff7c6', trustDown: '#d9a0a0', mem: '#ffe2a8'
};
const toast = (text, col) => { try { G.UI.toast && G.UI.toast(text, col); } catch (e) { /* ignore */ } };
const sfx = (name, o) => { try { if (G.Audio) G.Audio.sfx(name, o); } catch (e) { /* ignore */ } };

/* ---------- people ---------- */
// name: three-language string; portrait: key of an engine or layer portrait
const CAST = {
  '': { name: '', portrait: null },
  hero: { name: 'Ravshan|Равшан|Ravshan', portrait: 'hero' },
  sado: { name: 'Sado|Садо|Sado', portrait: 'sado' },
  voice: { name: 'A voice|Голос|Ovoz', portrait: 'sado' },
  rustam: { name: 'Rustam-aka|Рустам-ака|Rustam aka', portrait: 'aksakal' },
  turab: { name: 'Turab the bakhshi|Тураб-бахши|Turob baxshi', portrait: 'shaman' },
  mute: { name: 'The mute bakhshi|Немой бахши|Soqov baxshi', portrait: 'shaman' },
  shirin: { name: 'Ustoz Shirin|Устоз Ширин|Ustoz Shirin', portrait: 'shirin' },
  nargiza: { name: 'Nargiza|Наргиза|Nargiza', portrait: 'nargiza' },
  masked: { name: 'The masked woman|Женщина в маске|Niqobli ayol', portrait: 'oydinMask' },
  oydin: { name: 'Oydin|Ойдин|Oydin', portrait: 'oydin' },
  farrukh: { name: 'Farrukh|Фаррух|Farrux', portrait: 'farrukh' },
  mehri: { name: 'Mehri|Мехри|Mehri', portrait: 'widow' },
  tillabek: { name: 'Tilla-bek|Тилла-бек|Tillabek', portrait: 'tillabek' },
  envoy: { name: 'Envoy of the Divan|Посланник Дивана|Devon elchisi', portrait: 'divan' },
  alp: { name: 'Alp|Алп|Alp', portrait: 'alp' },
  davron: { name: 'Davron the caravan-bashi|Караван-баши Даврон|Karvonboshi Davron', portrait: 'davron' },
  inspector: { name: 'Inspector of the Well|Смотритель Колодца|Quduq noziri', portrait: 'inspector' },
  gulnora: { name: 'Gulnora|Гульнора|Gulnora', portrait: 'gulnora' },
  bride: { name: 'The bride|Невеста|Kelin', portrait: 'bride' },
  bahodir: { name: 'Bahodir|Баходир|Bahodir', portrait: 'bahodir' },
  auctioneer: { name: 'The auctioneer|Аукционист|Kimoshdi dalloli', portrait: 'auctioneer' },
  child: { name: 'A child|Ребёнок|Bola', portrait: null },
  boy: { name: 'A boy|Мальчик|O\'g\'il bola', portrait: null },
  crowd: { name: 'Voices|Голоса|Ovozlar', portrait: null },
  neighbour: { name: 'A neighbour|Сосед|Qo\'shni', portrait: null },
  singer: { name: 'A Singer|Певец|Xonanda', portrait: 'singer' },
  obi: { name: 'Obi-Hayot|Оби-Хаёт|Obi Hayot', portrait: 'obi' },
  sleeper: { name: 'The Sleeper|Спящий|Uxlovchi', portrait: 'obi' },
  stone: { name: 'Memory stone|Камень памяти|Xotira toshi', portrait: 'stone' },
  memory: { name: 'A memory|Воспоминание|Xotira', portrait: null },
  boss: { name: '', portrait: null }
};
const who = k => CAST[k] || { name: k, portrait: null };

/* ---------- scenes ---------- */
// say: one speaker, several pages. Text may be three-language strings or functions returning them.
const resolve = x => (typeof x === 'function' ? x() : x);
function say(k, pages, then) {
  const c = who(k);
  const list = [].concat(pages).map(resolve).filter(Boolean).map(s => t(s));
  if (!list.length) { if (then) then(); return; }
  G.UI.dialog({
    speaker: c.name ? t(c.name) : '', portrait: c.portrait, pages: list,
    onClose: () => { try { if (then) then(); } catch (e) { console.error('[yodgor]', e); } }
  });
}
// play: [[who, text], [who, text, onShow?] ...]; neighbours by the same speaker go on one card.
// A line may be a function returning a line or null (conditional line).
function play(lines, then) {
  const groups = [];
  for (let l of lines || []) {
    if (typeof l === 'function') l = l();
    if (!l || !Array.isArray(l)) continue;
    if (Array.isArray(l[0])) { for (const x of l) if (x) push(x); continue; }
    push(l);
  }
  function push(l) {
    if (typeof l[1] !== 'string' && typeof l[1] !== 'function') return;
    const g = groups[groups.length - 1];
    if (g && g.who === l[0] && !l[2]) g.pages.push(l[1]); else groups.push({ who: l[0], pages: [l[1]], fx: l[2] });
  }
  let i = 0;
  const next = () => {
    if (i >= groups.length) { if (then) then(); return; }
    const g = groups[i++];
    if (typeof g.fx === 'function') { try { g.fx(); } catch (e) { console.error('[yodgor]', e); } }
    say(g.who, g.pages, next);
  };
  next();
}
// options: { label, cost (Hollowness), price (tilla), trust (hidden), lock: reason|null, ...data }
function optLabel(o) {
  let s = t(o.label);
  // the Hollowness cost of a choice is hidden (author's decision): the player reads it from the meaning
  if (o.price) s += tf(` · {n} tilla| · {n} тилла| · {n} tilla`, { n: o.price });
  return s;
}
const optColor = o => (o.lock ? '#7a7080' : o.color); // no colour hints about cost or morality
function ask(title, opts, then) {
  const purse = (G.run && G.run.gold) || 0;
  // an option you cannot afford is shown greyed out with its price, not as a live choice that silently fails
  const list = (opts || []).filter(Boolean).filter(o => !o.hide).map(o => (o.price && !o.lock && purse < o.price ? Object.assign({}, o, { lock: tf(`needs {n} tilla|нужно {n} тилла|{n} tilla kerak`, { n: o.price }) }) : o));
  if (list.length && list.every(o => o.lock)) list[list.length - 1] = Object.assign({}, list[list.length - 1], { lock: null }); // never a dead end
  G.UI.choice({
    title: title ? t(resolve(title)) : '', cancel: false,
    options: list.map((o, i) => ({ label: o.lock ? t(o.label) + ' · ' + t(o.lock) : optLabel(o), value: i, color: optColor(o) })),
    onPick: v => {
      let o = list[v] || list[0];
      if (o.lock) { // locked options cannot be taken: say why, ask again
        toast(t(o.lock), '#b0a0c0');
        ask(title, opts, then);
        return;
      }
      if (o.price && G.run && (G.run.gold || 0) < o.price) { toast(t(`Not enough tilla|Не хватает тилла|Tilla yetmaydi`), C.danger); ask(title, opts, then); return; }
      if (o.price) gold(-o.price);
      try { then(o); } catch (e) { console.error('[yodgor]', e); }
    }
  });
}

/* ---------- meters ---------- */
const REP_NAME = {
  singers: 'The Singers|Певцы|Xonandalar', divan: 'The Divan|Диван|Devon', remember: 'Those Who Remember|Те, кто помнит|Eslaganlar',
  tail: 'The Tail|Хвост|Dum', rabat: 'The Rabat|Рабат|Rabot'
};
function rep(k, n, quiet) {
  R().rep[k] = (R().rep[k] || 0) + n; save();
  if (!quiet && REP_NAME[k]) toast(tf(`{who} will remember this.|{who} это запомнят.|{who} buni unutmaydi.`, { who: t(REP_NAME[k]) }), C.rep);
}
function trust(n) {
  const r = R(); r.trust = clamp((r.trust || 0) + n, -10, 10); save();
  if (G.SADO && G.SADO.feel) G.SADO.feel(n);
}
function gold(n) {
  if (!G.run || !n) return;
  G.run.gold = Math.max(0, (G.run.gold || 0) + n);
  if (n > 0) G.run.goldEarned = (G.run.goldEarned || 0) + n;
  toast((n > 0 ? '+' : '−') + Math.abs(n) + ' ' + t(`tilla|тилла|tilla`), C.coin);
  sfx(n > 0 ? 'coin' : 'buy');
}
const know = text => toast(t(text), C.know);
const VOID_LISTENERS = [];
function addVoid(n, why) {
  const r = R(), before = r.void;
  r.void = clamp(Math.round(r.void + n), 0, VOID_MAX);
  if (r.void >= VOID_MAX) r.hollow = true;
  save();
  const d = r.void - before;
  if (d > 0) toast(tf(`Hollowness +{n}|Пустота +{n}|Bo'shliq +{n}`, { n: d }) + (why ? ' · ' + t(why) : ''), C.void);
  else if (d < 0) toast(tf(`Hollowness −{n}|Пустота −{n}|Bo'shliq −{n}`, { n: -d }) + (why ? ' · ' + t(why) : ''), C.back);
  for (const f of VOID_LISTENERS) { try { f(r.void, before); } catch (e) { console.error('[yodgor]', e); } }
}

/* ---------- scene runner: one scene at a time, warnings after ---------- */
let busy = false;
const AFTER_SCENE = []; // functions(then) run after each scene (warnings, hollow check)
function scene(fn, after) {
  busy = true;
  const done = () => {
    busy = false;
    if (R().hollow && !R().ended && G.YODGOR && G.YODGOR.hollowEnd) { G.YODGOR.hollowEnd(); return; }
    let i = 0;
    const next = () => { if (i >= AFTER_SCENE.length) { if (after) after(); return; } AFTER_SCENE[i++](next); };
    next();
  };
  try { fn(done); } catch (e) { console.error('[yodgor]', e); busy = false; if (after) after(); }
}

/* ---------- scenes waiting for a quiet moment ---------- */
const Q = [];
const queue = (when, show, tag) => { if (tag && Q.some(q => q.tag === tag)) return; Q.push({ when, show, tag }); };
const stageT = () => (G.Game.stage ? G.Game.stage.t : 0);
const quiet = () => !busy && G.Game.state === 'play' && !G.Game.fadeCb && !G.Game.loading && !(G.UI.isOpen && G.UI.isOpen());

/* ---------- tables filled by later files ---------- */
const ON_STAGE = [];   // (plan, biome, level) after a stage is ready
const ON_NEWRUN = [];  // () fresh journey
const EXIT = {};       // plan.id -> scene(done) before leaving a land
const POST = {};       // boss id -> scene(done) after a boss falls
const PRE = {};        // boss id -> lines before the fight
const TICK = [];       // per-frame checks while playing
const DEATH_LINES = [];  // death screen lines (three-language)

/* ---------- question hub (Larian/Owlcat style) ----------
   hub(title, questions, actions, then)
   questions: [{ label, lines: [[who,text],...] | fn(done), if?: () => bool }] — each can be asked once, then the hub returns
   actions:   ask() options that end the hub; then(option) gets the chosen one. */
function hub(title, qs, acts, then) {
  const asked = new Set();
  const loop = () => ask(title,
    qs.map((q, i) => Object.assign({}, q, { hide: q.hide || asked.has(i) || (q.if && !q.if()), _q: i })).concat(acts),
    o => {
      if (o._q != null) {
        asked.add(o._q);
        if (typeof o.lines === 'function') o.lines(loop); else play(o.lines, loop);
      } else then(o);
    });
  loop();
}
