// Stage 6 — the three faction arcs, each to a final branch, with or without the double play being caught.
//   node test/s6_arcs.js <arc: singers|divan|remember> <final: help|fight|words> <caught: 0|1> [lang]
// Preconditions the story would give (the moon, chapters done, standing) are set directly between quests.
const T = require('./s6_lib');
const arc = process.argv[2] || 'singers', fin = process.argv[3] || 'help', caught = process.argv[4] === '1', lang = process.argv[5] || 'ru';
const R = { arc, fin, caught, lang, steps: [], fail: [] };
const W = (p, f, a) => p.evaluate(f, a);
const setRep = (p, k, v) => W(p, ([k, v]) => { G.YODGOR.run.rep[k] = v / 6; }, [k, v]);
const setMoon = (p, m) => W(p, m => { G.WORLD2.S().moon = m; }, m);
const done = (p, id) => W(p, id => { G.YODGOR.run.at['done:' + id] = 1; }, id);
const q = (p, id) => W(p, id => (G.FAC.S().q[id] || { st: 'none' }), id);
const CONF = /It's true\. I worked|Правда\. Я работал|To'g'ri\. Ularga ham/, PAY = /count tilla into the watcher|отсчитываешь тилла в ладонь|tilla sanab berasan/;
async function step(p, label, id, fn) {
  const before = await q(p, id);
  try { await fn(); } catch (e) { R.fail.push(label + ': ' + e.message); }
  const after = await q(p, id);
  R.steps.push(label + ': ' + before.st + ' -> ' + after.st + (after.br ? ' [' + after.br + ']' : ''));
}
async function lair(p, log) {
  await T.tick(p, 30); await T.settle(p, 300); await T.drain(p, log);
  const reg = (await T.info(p)).region;
  R.lair = reg;
  if (!/^f_/.test(reg)) { R.fail.push('not in a faction lair: ' + reg); return; }
  R.boss = await T.fightBoss(p, log, {});
  await T.drain(p, log); await T.leaveLair(p, log); await T.drain(p, log);
  R.backIn = (await T.info(p)).region;
}
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'tail', lang });
  const log = [];
  if (caught) await W(p, () => { G.FAC.S().susp = { singers: 5, divan: 5, remember: 5 }; });
  if (arc === 'singers') {
    await step(p, 's1 offer', 's1', async () => { await T.go(p, 'potters', 9, log); await T.talk(p, 'habiba', log, [/looking for|кого-то ищете|qidiryapsizmi/, /look into|Разберусь|Surishtirib/]); });
    await step(p, 's1 crate+umid', 's1', async () => { await T.go(p, 'potters', 9, log); await T.useProp(p, 's1crate', log); await T.talk(p, 'umid', log, [/Keep selling|Продолжай им носить|tashishda davom/]); });
    await setRep(p, 'singers', 30);
    await step(p, 's2 offer', 's2', async () => { await T.go(p, 'potters', 9, log); await T.talk(p, 'habiba', log, [/sent for me|меня звали|chaqirtirgan/]); });
    R.sign = await W(p, () => G.WORLD2.hasKey('well_sign'));
    await step(p, 's2 books', 's2', async () => { await T.go(p, 'cloister', 14, log); await T.useProp(p, 's2books', log, [/Touch your lips|Коснуться губами|lab tekkizish/, /Put the pages back|Положить страницы|joyiga qo'yish/]); });
    await step(p, 's3 offer', 's3', async () => { await T.go(p, 'cloister', 14, log); await T.talk(p, 'habiba', log, [/wrong in the Cloister|что-то стряслось|biror gap/]); });
    await step(p, 's3 malika', 's3', async () => { await T.go(p, 'cloister', 14, log); await T.talk(p, 'malika', log, [/bitter water, like|горькая вода, как|achchiq suv, Ustoz/]); });
    await setRep(p, 'singers', 40);
    await step(p, 's4 offer', 's4', async () => { await T.go(p, 'cloister', 10, log); await T.talk(p, 'shirin6', log, [CONF]); });
    await step(p, 's4 ergash', 's4', async () => { await T.go(p, 'tail', 10, log); await T.talk(p, 'ergash', log, [/Keep it\. The Well can have|Оставь себе\. Колодцу|O'zingda qolsin\. Quduqqa/]); });
    await setMoon(p, 1); await done(p, 'a2_well');
    await step(p, 's5 well', 's5', async () => { await T.go(p, 'well', 12, log); await T.talk(p, 'shirin6', log, [/stand with you|я с вами|siz bilanman/]); });
    await setRep(p, 'singers', 70); await setMoon(p, 2);
    await step(p, 's6 dream', 's6', async () => { await T.go(p, 'dream', 12, log); await T.talk(p, 'shirin6', log, [fin === 'help' ? /Read the names\. Every|Читать имена\. Все|Ismlarni o'qish\. Hammasini/ : /Read the names wrong|Читать имена неправильно|noto'g'ri o'qish/]); if (fin !== 'help') await lair(p, log); });
  } else if (arc === 'divan') {
    await step(p, 'd1 offer', 'd1', async () => { await T.go(p, 'bazaar', 10, log); await T.talk(p, 'nodira', log, [/Work for the Divan|работа от Дивана|Devondan ish/, /find him|Найду|Topaman/]); });
    await step(p, 'd1 hamid', 'd1', async () => { await T.go(p, 'rabat', 22, log); await T.talk(p, 'hamid', log, [/carry your debt|долг возьму на себя|o'z bo'ynimga olaman/]); });
    await setRep(p, 'divan', 30); await W(p, () => { G.YODGOR.run.f.gulnora = 'left'; G.WORLD2.giveKey('divan_seal', true); });
    await step(p, 'd2 offer', 'd2', async () => { await T.go(p, 'bazaar', 10, log); await T.talk(p, 'nodira', log, [/You wanted me|меня искали|qidirgan ekansiz/]); });
    await step(p, 'd2 merchant', 'd2', async () => { await T.go(p, 'ark', 12, log); await T.talk(p, 'saidakbar', log, [/Take the paper to Gulnora|Отнести бумагу Гульноре|Gulnoraga olib borish/]); });
    await setMoon(p, 1);
    await step(p, 'd3 offer', 'd3', async () => { await T.go(p, 'bazaar', 10, log); await T.talk(p, 'nodira', log, [/short of today|не хватает Дивану|nima yetishmayapti/]); });
    await step(p, 'd3 mines', 'd3', async () => { await T.go(p, 'mines', 12, log); await T.talk(p, 'qahramon', log, [/Give me Qahramon|Отдайте мне Кахрамона|Menga Qahramonni/]); });
    await setRep(p, 'divan', 40);
    await step(p, 'd4 cellar', 'd4', async () => { await T.go(p, 'ark', 12, log); await T.talk(p, 'tillabek6', log, [PAY, /I have one of my own|У меня своё есть|Meniki o'zimda/]); });
    await W(p, () => { G.YODGOR.run.f.truth = 1; });
    await step(p, 'd5 heirs', 'd5', async () => { await T.go(p, 'ark', 12, log); await T.talk(p, 'tillabek6', log, [/Then let it pay me too|пусть платит и мне|menga ham to'lasin/]); });
    await setRep(p, 'divan', 70); await setMoon(p, 2);
    await step(p, 'd6 dream', 'd6', async () => { await T.go(p, 'dream', 12, log); await T.talk(p, 'tillabek6', log, [fin === 'help' ? /Sing it with him|Спеть вместе с ним|U bilan birga kuylash/ : /No more selling|Хватит торговать|Savdo bas/]); if (fin !== 'help') await lair(p, log); });
    R.chainSong = await W(p, () => G.YODGOR.run.f.chainSong || 0);
  } else {
    await step(p, 'r1 offer', 'r1', async () => { await T.go(p, 'bazaar', 23, log); await T.talk(p, 'zulfiya', log, [/What are you selling|Чем торгуешь|Nima sotyapsan/, /Take the tumar|Взять тумар|Tumarni olish/]); });
    await step(p, 'r1 tursun', 'r1', async () => { await T.go(p, 'tail', 18, log); await T.talk(p, 'tursun', log, [/Taste the wedding|Испить свадьбу|To'yni totib/]); });
    await step(p, 'r1 dilnoza', 'r1', async () => { await T.go(p, 'tail', 12, log); await T.talk(p, 'dilnoza', log, [/Give it to Dilnoza|Отдать Дильнозе|Dilnozaga berish/]); });
    await setRep(p, 'remember', 30);
    await step(p, 'r2 offer', 'r2', async () => { await T.go(p, 'bazaar', 23, log); await T.talk(p, 'zulfiya', log, [/Anything else that wants|Ещё что-нибудь вернуть|Yana qaytaradigan/]); });
    await step(p, 'r2 store', 'r2', async () => { await T.go(p, 'karez', 12, log); R.guards = await W(p, () => G.world.ents.filter(e => e._f6guard === 'r2').length); await T.talk(p, 'rahim', log, [/sister's water for a month|воду твоей сестре|singlingning bir oylik/]); await T.useProp(p, 'r2door', log); });
    await step(p, 'r3 offer', 'r3', async () => { await T.go(p, 'karez', 12, log); await T.talk(p, 'lola', log, [/What's next|Что дальше|Keyin nima/]); });
    await step(p, 'r3 fugitives', 'r3', async () => { await T.go(p, 'cloister', 22, log); await T.talk(p, 'olim', log, [/Hayot's last week|неделю Хаёта|Hayotning so'nggi/, /Hayot stays|Хаёт остаётся|Hayot qoladi/]); });
    await setRep(p, 'remember', 40);
    await step(p, 'r4 offer', 'r4', async () => { await T.go(p, 'karez', 12, log); await T.talk(p, 'lola', log, [PAY, /look like someone with a plan|вид человека с планом|Rejasi bor/, /wake the families|разбудить семьи|oilalarni uyg'otish/]); });
    await step(p, 'r4 warn', 'r4', async () => { await T.go(p, 'bazaar', 21, log); await T.useProp(p, 'r4warn', log); });
    await setMoon(p, 1); await done(p, 'a2_old'); await W(p, () => { G.YODGOR.run.f.oydin = 'joined'; });
    await step(p, 'r5 mask', 'r5', async () => { await T.go(p, 'old', 12, log); await T.talk(p, 'lola', log, [/You knew|Ты знала|bilarding/]); });
    await setRep(p, 'remember', 70); await setMoon(p, 2); await W(p, () => { G.YODGOR.run.trust = 5; G.YODGOR.run.f.sado = 1; });
    await step(p, 'r6 dream', 'r6', async () => { await T.go(p, 'dream', 12, log); await T.talk(p, 'oydin6', log, [fin === 'help' ? /Together, then|Тогда вместе|Unda birga/ : /reach for the cord|Потянуться к шнуру|Ipga qo'l/]); if (fin !== 'help') await lair(p, log); });
    R.cradle = await W(p, () => !!G.CH.S().legends.cradle);
  }
  R.final = await T.fac(p);
  R.faction = await W(p, () => G.YODGOR.run.f.faction || null);
  R.keys = await W(p, () => Object.keys(G.WORLD2.S().keys));
  R.legends = await W(p, () => Object.keys(G.CH.S().legends));
  R.gold = await W(p, () => G.run.gold);
  await T.shot(p, 's6_arc_' + arc + '_' + fin + (caught ? '_caught' : ''));
  R.errs = p._errs.slice(0, 12); R.untranslated = (await T.untranslated(p)).filter(s => !/^Level \d/.test(s) && !/^Уровень/.test(s));
  console.log(JSON.stringify(R, null, 1));
  require('fs').writeFileSync(T.OUT + '/s6_arc_' + arc + '_' + fin + (caught ? '_c' : '') + '.log', log.join('\n'));
  await b.close();
})();
