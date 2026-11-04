// Act III (72_act3.js): every land, the dream chaikhana, every Sado fate, the finale and every ending,
// in all three languages. Checks: victory screen, ending title, epilogue, no page errors,
// dialog pages ≤ 220 characters, all three parts of every Act III string present.
// Run: YODGOR_OUT=/tmp/w_act3 node test/act3.js
const L = require('./lib');
const fs = require('fs');
const path = require('path');

const SRC = fs.readFileSync(path.join(__dirname, '..', 'src', 'layer', '72_act3.js'), 'utf8');
const TITLES = {
  tithe: ['THE NEW TITHE', 'НОВАЯ ДЕСЯТИНА', 'YANGI USHR'],
  chain: ["THE DIVAN'S CHAIN", 'ЦЕПЬ ДИВАНА', 'DEVON ZANJIRI'],
  awake: ['THE AWAKENING', 'ПРОБУЖДЕНИЕ', "UYG'ONISH"],
  tale: ['THE TALE', 'СКАЗАНИЕ', 'DOSTON'],
  hollow: ['HOLLOW', 'ПУСТОЙ', "BO'SH"]
};
const LI = { en: 0, ru: 1, uz: 2 };
// option labels to pick, by language (first words are enough)
const OPT = {
  close: ['[Mercy] Close the book', '[Пощадить] Закрыть книгу', '[Rahm] Kitobni yopish'],
  collect: ['Collect, like always', 'Собирать, как всегда', "Har doimgidek yig'ish"],
  pass: ['Walk past them', 'Пройти мимо', "Yonidan o'tib"],
  carried: ['Take him in a tumar', 'Взять его в тумар', 'Uni tumarga olib'],
  waits: ['[Lie]', '[Солгать]', "[Yolg'on]"],
  told: ['[Truth]', '[Правда]', '[Haqiqat]'],
  end: ['[Help] Take her hand', '[Помочь] Взять её за руку', "[Yordam] Qo'lidan tutish"],
  leave: ['Let them go on dancing', 'Пусть танцуют дальше', 'Raqsda davom'],
  seal: ['Seal the wedding', 'Запечатать свадьбу', "To'yni tumarga"],
  vow: ['[Promise]', '[Пообещать]', "[Va'da]"],
  song: ['[Listen]', '[Слушать]', '[Tinglash]'],
  walk: ['[Leave] Walk on', '[Уйти] Идти дальше', '[Ketish] Davom etish'],
  forgiven: ['[Forgive]', '[Простить]', '[Kechirish]'],
  unforgiven: ['[Refuse]', '[Не прощать]', '[Kechirmaslik]'],
  tea: ['[Stay silent]', '[Промолчать]', '[Jim turish]'],
  open: ['[Open]', '[Открыть]', '[Ochish]'],
  f_remember: ['[Remember her]', '[Вспомнить]', '[Eslash]'],
  f_keep: ['[Keep her]', '[Оставить]', '[Saqlash]'],
  f_oydin: ['[Give her]', '[Отдать]', '[Berish]'],
  f_tale: ['[Tale]', '[Сказание]', '[Doston]'],
  e_tithe: ['[Feed him]', '[Накормить]', '[Boqish]'],
  e_chain: ['[Chain him]', '[Сковать]', '[Zanjirlash]'],
  e_awake: ['[Wake him]', '[Разбудить]', "[Uyg'otish]"],
  e_tale: ['[Tell a tale]', '[Рассказать]', '[Doston]'],
  q_singers: ['What does the Well want', 'Чего хочет Колодец', 'Quduq nima'],
  q_divan: ['And the Divan', 'А Диван', 'Devon-chi'],
  q_remember: ['And Oydin', 'А Ойдин', 'Oydin-chi'],
  q_other: ['another way', 'другой путь', "Boshqa yo'l"],
  q_leave: ['enough', 'Хватит', 'Yetadi']
};
const o = (k, lang) => OPT[k][LI[lang]];

const report = [], fails = [];
const fail = (sc, msg) => { fails.push(sc + ': ' + msg); console.log('  FAIL ' + msg); };

async function boot(b, lang, stage, setup) {
  const p = await L.open(b, '');
  await p.evaluate(({ lang, stage, setup }) => {
    window.__log = []; window.__choices = [];
    const d = G.UI.dialog, c = G.UI.choice;
    G.UI.dialog = x => { window.__log.push({ s: x.speaker, pages: x.pages.slice() }); return d.call(G.UI, x); };
    G.UI.choice = x => { window.__choices.push({ t: x.title, o: x.options.map(q => q.label) }); return c.call(G.UI, x); };
    G.LANG.set(lang);
    G.godMode = true;
    G.Game.startRun({ mode: 'wanderer' });
    G.YODGOR.set(setup);
    if (G.run) G.run.gold = 999;
    G.Game.loadStage(stage);
  }, { lang, stage, setup });
  await L.tick(p, 10);
  return p;
}
const modalOpen = p => p.evaluate(() => !!G.UI._debug().modal);
async function waitModal(p, n = 300) {
  for (let i = 0; i < n; i += 10) { if (await modalOpen(p)) return true; await L.tick(p, 10); }
  return false;
}
// play dialogs until a choice; returns the choice (or null when the scene ended)
async function play(p) { await L.advance(p, 120); return L.modal(p); }
async function pick(p, sc, label) {
  const m = await play(p);
  if (!m || m.type !== 'choice') { fail(sc, 'expected a choice for "' + label + '", got ' + JSON.stringify(m && { t: m.type, s: m.speaker })); return false; }
  await L.choose(p, label);
  return true;
}
const tp = (p, where) => p.evaluate(where => {
  const pl = G.world.player, door = G.world.interactables.find(q => q.art === 'door');
  if (where === 'mid') { pl.x = door.x * 0.6; return; }
  const ppl = G.world.ents.filter(q => q.art === 'person');
  const near = ppl.reduce((a, q) => (!a || q.x < a.x ? q : a), null);
  pl.x = near.x - 30; pl.y = near.y; pl.vx = 0; pl.vy = 0;
}, where);

async function land(p, sc, lang, picks) {
  if (!(await waitModal(p))) fail(sc, 'no start scene');
  await play(p);
  for (let i = 0; i < 3; i++) { await p.evaluate(() => G.Game.showLore(G.level, {})); await play(p); }
  await tp(p, 'mid'); await L.tick(p, 20);
  if (await waitModal(p, 120)) await play(p);
  const mem = await L.use(p, 'lostMemory');
  if (mem !== 'ok') fail(sc, 'no lost memory: ' + mem);
  await play(p);
  await tp(p, 'exit'); await L.tick(p, 10);
  if (!(await waitModal(p, 200))) fail(sc, 'exit scene did not start');
  for (const k of picks) await pick(p, sc, o(k, lang));
  await play(p);
  await L.tick(p, 30);
}

async function rest(p, sc, lang, rustamPick) {
  if (!(await waitModal(p))) fail(sc, 'no arrival');
  await play(p);
  await p.evaluate(() => G.UI.story());
  await pick(p, sc, o(rustamPick, lang)); await play(p);
  await p.evaluate(() => { const s = G.world.interactables.find(q => q.art === 'shaman'); G.Game.offerPerk(s); });
  await play(p);
  for (let i = 0; i < 6 && (await modalOpen(p)); i++) { await L.press(p, 'Escape'); await L.tick(p, 20); await L.press(p, 'Enter'); await L.tick(p, 20); }
  await L.use(p, 'merchant');
  for (const q of ['q_singers', 'q_divan', 'q_remember', 'q_other', 'q_leave']) await pick(p, sc, o(q, lang));
  await play(p);
  await p.evaluate(() => G.debugTick(720));
  if (!(await waitModal(p, 200))) fail(sc, 'no lullaby');
  await play(p);
}

async function boss(p, sc, lang, ending) {
  await p.evaluate(() => { G.world.player.x = 11 * G.TS; });
  await L.tick(p, 20);
  if (await waitModal(p, 120)) await play(p);       // Ajdaho's pre lines
  for (let i = 0; i < 4 && (await modalOpen(p)); i++) { await L.press(p, 'Enter'); await L.tick(p, 10); }
  const ok = await p.evaluate(() => { const bo = G.Game.boss; if (!bo) return false; bo.hp = 0; bo.dead = true; return true; });
  if (!ok) fail(sc, 'boss did not spawn');
  await L.tick(p, 200);
  if (!(await waitModal(p, 400))) fail(sc, 'no finale');
  const m = await play(p);
  if (!m || m.type !== 'choice') { fail(sc, 'no final choice'); return; }
  const tale = m.options.find(x => x.includes(o('e_tale', lang)));
  report.push(sc + ' tale option: ' + (tale || '?'));
  await L.choose(p, o('e_' + ending, lang));
  await play(p);
}

async function victory(p, sc, lang, id) {
  for (let i = 0; i < 60; i++) { if (await p.evaluate(() => G.Game.state === 'victory')) break; await L.tick(p, 10); }
  const r = await p.evaluate(() => ({ state: G.Game.state, title: G.ENDING_TITLE, ep: G.STORY.epilogue, ended: G.YODGOR.run.ended, f: G.YODGOR.run.f, v: G.YODGOR.run.void }));
  if (r.state !== 'victory') fail(sc, 'state ' + r.state);
  if (r.title !== TITLES[id][LI[lang]]) fail(sc, 'title ' + r.title);
  if (!r.ep || !r.ep.length || r.ep.some(s => !s || s.length > 220 || /undefined|\|/.test(s))) fail(sc, 'bad epilogue ' + JSON.stringify(r.ep));
  return r;
}

async function check(p, sc) {
  const r = await p.evaluate(() => ({ log: window.__log, ch: window.__choices }));
  let pages = 0;
  for (const d of r.log) for (const pg of d.pages) { pages++; if (!pg || pg.length > 220 || /undefined|\|/.test(pg)) fail(sc, 'bad page (' + (pg || '').length + '): ' + pg); }
  for (const c of r.ch) for (const l of c.o) if (!l || /undefined|\|/.test(l)) fail(sc, 'bad option ' + l);
  if (p._errs.length) fail(sc, 'errors ' + JSON.stringify(p._errs.slice(0, 5)));
  return { pages, choices: r.ch.length };
}

const QUICK = !!process.env.YODGOR_QUICK;
const TALE_FLAGS = { sado: 1, truth: 1, name: 1, tales: 1, nargizaQ: 'believes', nargiza: 'down' };

(async () => {
  // ---- static: every three-part string of Act III ----
  let nstr = 0;
  for (const m of SRC.matchAll(/`([^`]*)`/g)) {
    const x = m[1]; if (!x.includes('|')) continue; nstr++;
    const ps = x.split('|');
    if (ps.length !== 3 || ps.some(q => !q.trim())) fails.push('static parts: ' + x.slice(0, 60));
    ps.forEach((q, i) => { if (q.length > 220) fails.push('static len ' + i + ': ' + q.slice(0, 60)); });
    if (/[Ѐ-ӿ]/.test(ps[2] || '') || /[Ѐ-ӿ]/.test(ps[0] || '')) fails.push('static script: ' + x.slice(0, 60));
  }
  report.push('static strings checked: ' + nstr);

  const b = await L.chromium.launch();
  const scen = async (name, fn) => {
    console.log('▶ ' + name);
    const t0 = Date.now();
    try { await fn(); } catch (e) { fail(name, 'exception ' + e.message.split('\n')[0]); }
    console.log('  ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  };

  // ---- three full Act III playthroughs, one per language ----
  const FULL = [
    { lang: 'en', fate: 'remember', end: 'tale', picks: { dream: ['close'], wedding: ['carried', 'end'], sand: ['vow'], rustam: 'forgiven' },
      setup: { void: 20, trust: 3, f: Object.assign({}, TALE_FLAGS, { widow: 'force', alp: 'helped', davron: 'led', hound: 'shown', gulnora: 'returned', voice: 'bought', rustamMem: 4, oydinName: 1, masked: 1, alpTumars: 'returned', oydin: 'joined', seven: 1, barys: 'freed', faction: 'remember', tillabek: 'refused', chain: 'carried', dreamBy: 'nargiza', rustamWord: 'forgave', relics: 'oydin', farrukh: 'home' }) } },
    { lang: 'ru', fate: 'keep', end: 'tithe', picks: { dream: ['collect'], wedding: ['seal'], sand: ['song'], rustam: 'unforgiven' },
      setup: { void: 30, trust: 0, f: { sado: 1, widow: 'fake', alp: 'collected', davron: 'reported', hound: 'killed', voice: 'left', nargiza: 'stayed', rustamMem: 2, oydinName: 1, oydin: 'took', nargizaQ: 'returned', faction: 'singers', tillabek: 'accepted', chain: 'silent', alpTumars: 'destroyed', relics: 'ravshan', dreamBy: 'water', farrukh: 'kept', rustamWord: 'condemned' } } },
    { lang: 'uz', fate: 'oydin', end: 'awake', picks: { dream: ['pass'], wedding: ['leave'], sand: ['walk'], rustam: 'tea' },
      setup: { void: 40, trust: 2, f: { sado: 1, widow: 'force', nest: 'tail', dreamBy: 'oydin', rustamWord: 'silent', farrukh: 'drunk', alp: 'paid', davron: 'bribe', hound: 'spared', voice: 'stolen', truth: 1, nargiza: 'down', oydin: 'let', nargizaQ: 'silenced', faction: 'divan', name: 1, gulnora: 'blackmail', alpTumars: 'choice' } } }
  ];
  for (const F of FULL) await scen(`full ${F.lang}: fate ${F.fate} → ${F.end}`, async () => {
    const sc = 'full-' + F.lang;
    const p = await boot(b, F.lang, 26, F.setup);
    await land(p, sc + '/dream', F.lang, F.picks.dream);
    await p.evaluate(() => G.Game.loadStage(27)); await L.tick(p, 10);
    await land(p, sc + '/wedding', F.lang, F.picks.wedding);
    await p.evaluate(() => G.Game.loadStage(28)); await L.tick(p, 10);
    await land(p, sc + '/sand', F.lang, F.picks.sand);
    await p.evaluate(() => G.Game.loadStage(29)); await L.tick(p, 10);
    await rest(p, sc + '/rest', F.lang, F.picks.rustam);
    await p.evaluate(() => G.Game.loadStage(30)); await L.tick(p, 10);
    await p.evaluate(() => G.YODGOR.set({ void: 55 }));
    const before = 55;
    await land(p, sc + '/house', F.lang, ['open', 'f_' + F.fate]);
    const mid = await L.run(p);
    if (mid.f.sadoFate !== F.fate) fail(sc, 'sadoFate ' + mid.f.sadoFate);
    if (F.fate === 'remember' && !(mid.void <= before - 30)) fail(sc, 'remember did not lower Hollowness: ' + before + ' → ' + mid.void);
    await p.evaluate(() => G.Game.loadStage(31)); await L.tick(p, 10);
    await boss(p, sc + '/boss', F.lang, F.end);
    const r = await victory(p, sc, F.lang, F.end);
    const c = await check(p, sc);
    report.push(`${sc}: ${r.title} · fate ${r.f.sadoFate} · flags ${['a3queue', 'mehriSon', 'wedding', 'sandVow', 'sandSong', 'rustam'].map(k => k + '=' + r.f[k]).join(' ')} · void ${r.v} · ${c.pages} pages, ${c.choices} choices, ${r.ep.length} slides`);
    await p.close();
  });

  // ---- the fourth Sado fate (tale) and the locked options, in each language ----
  for (const lang of (QUICK ? ['ru'] : ['en', 'ru', 'uz'])) await scen(`house ${lang}: fate tale`, async () => {
    const sc = 'house-tale-' + lang;
    const p = await boot(b, lang, 30, { void: 30, trust: 1, f: Object.assign({}, TALE_FLAGS, { oydin: 'took' }) });
    if (!(await waitModal(p))) fail(sc, 'no start'); await play(p);
    await tp(p, 'exit'); await L.tick(p, 10); await waitModal(p, 200);
    await pick(p, sc, o('open', lang));
    const m = await play(p);
    const lockedOydin = m && m.options.find(x => x.includes(o('f_oydin', lang)));
    if (!lockedOydin || !/·/.test(lockedOydin)) fail(sc, 'oydin option not locked: ' + lockedOydin);
    await L.choose(p, o('f_tale', lang)); await play(p);
    const r = await L.run(p);
    if (r.f.sadoFate !== 'tale') fail(sc, 'fate ' + r.f.sadoFate);
    await check(p, sc);
    report.push(`${sc}: fate=${r.f.sadoFate}; oydin option shown as "${lockedOydin}"`);
    await p.close();
  });

  // ---- every ending in every language, straight from the Nightmare's nest ----
  const MATRIX = [
    ['tithe', 'tale', {}], ['chain', 'tale', { chainSong: 1, alpTumars: 'returned', farrukh: 'sold', oydin: 'shown', faction: 'divan', tillabek: 'accepted', hound: 'spared', davron: 'bluff' }],
    ['awake', 'remember', { oydin: 'tasted', faction: 'remember', widow: 'force', mehriSon: 'carried', voice: 'left', hound: 'shown', alp: 'helped' }],
    ['tale', 'tale', { oydin: 'joined', faction: 'singers', voice: 'bought', widow: 'written', alpTumars: 'returned' }]
  ];
  for (const lang of ['en', 'ru', 'uz']) for (const [end, fate, extra] of MATRIX) if (!QUICK || ({ en: 'awake', ru: 'chain', uz: 'tithe' })[lang] === end || (lang === 'uz' && end === 'tale')) await scen(`ending ${lang}: ${end} (fate ${fate})`, async () => {
    const sc = `end-${lang}-${end}`;
    const f = Object.assign({}, TALE_FLAGS, { sadoFate: fate, sado: fate === 'remember' ? 0 : 1, faction: 'singers', oydinName: 1 }, extra);
    const p = await boot(b, lang, 31, { void: 20, trust: 2, f });
    await boss(p, sc, lang, end);
    const r = await victory(p, sc, lang, end);
    const c = await check(p, sc);
    report.push(`${sc}: ${r.title} · ${r.ep.length} slides · ${c.pages} pages`);
    if (lang === 'en') report.push('   epilogue: ' + r.ep.map(s => s.slice(0, 48)).join(' / '));
    await p.close();
  });

  // ---- the Tale is locked when its conditions fail (shows the reason) ----
  await scen('tale locked (void 70)', async () => {
    const sc = 'tale-locked';
    const p = await boot(b, 'en', 31, { void: 70, trust: 2, f: Object.assign({}, TALE_FLAGS, { sadoFate: 'keep', oydin: 'let', faction: 'divan' }) });
    await boss(p, sc, 'en', 'chain');
    await victory(p, sc, 'en', 'chain');
    await check(p, sc);
    const last = report[report.length - 1];
    if (!/·/.test(last)) fail(sc, 'tale not locked: ' + last);
    await p.close();
  });

  // ---- Hollow: in the dream, and out of context in earlier acts ----
  await scen('hollow en: in the dream (collect at 98)', async () => {
    const sc = 'hollow-en';
    const p = await boot(b, 'en', 26, { void: 98, trust: 0, f: { sado: 1, widow: 'paid', faction: 'remember', oydinName: 1 } });
    if (!(await waitModal(p))) fail(sc, 'no start'); await play(p);
    await tp(p, 'exit'); await L.tick(p, 10); await waitModal(p, 200);
    await pick(p, sc, o('collect', 'en')); await play(p);
    const r = await victory(p, sc, 'en', 'hollow');
    await check(p, sc);
    report.push(`${sc}: ${r.title} · ${r.ep.length} slides: ${r.ep.map(s => s.slice(0, 40)).join(' / ')}`);
    await p.close();
  });
  for (const [lang, stage] of (QUICK ? [['ru', 3]] : [['ru', 3], ['uz', 14]])) await scen(`hollow ${lang}: out of context at stage ${stage}`, async () => {
    const sc = `hollow-${lang}-${stage}`;
    const p = await boot(b, lang, stage, { void: 100, trust: 0, f: stage > 3 ? { sado: 1, faction: 'singers' } : {} });
    await L.tick(p, 20);
    for (let i = 0; i < 10 && (await modalOpen(p)); i++) await play(p);   // whatever the land itself shows
    await p.evaluate(() => { G.YODGOR.run.hollow = true; G.YODGOR.scene(done => done()); });
    await play(p);
    const r = await victory(p, sc, lang, 'hollow');
    await check(p, sc);
    report.push(`${sc}: ${r.title} · ${r.ep.length} slides`);
    await p.close();
  });

  await b.close();
  console.log('\n' + report.join('\n'));
  console.log(fails.length ? '\nFAILURES (' + fails.length + '):\n' + fails.join('\n') : '\nALL PASSED');
  process.exit(fails.length ? 1 : 0);
})();
