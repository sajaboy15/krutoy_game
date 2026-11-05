// The two Memory Bazaar investigations (89w): qb1 "A Voice by the Minute" and qb2 "The Clerks Forget".
// Four short runs, each in a fresh journey, play both quests to different endings and visit the people who come back.
//   node test/s9_qbazaar.js
const T = require('./s6_lib');
const R3 = (en, ru, uz) => new RegExp(en + '|' + ru + '|' + uz);
const P = {
  accept1: R3('listen to the voice', 'Послушаю', 'ovozni eshitaman'),
  pay: R3('Pay for a minute', 'Заплатить за минуту', "to'lab, o'tirish"),
  seal: R3('seal on that tumar', 'печать на тумаре', 'muhrni'),
  cloth: R3('Through the cloth', 'Сквозь ткань', 'Mato orqali'),
  rung: R3('third rung', 'третью ступень', 'uchinchi zinapoyani'),
  whyLeft: R3('Why did you leave', 'Почему ты ушла', 'Nega ketib'),
  eight: R3('eight tilla', 'восемь тилла', 'sakkiz tilla'),
  bringVoice: R3('bring your voice', 'верну тебе голос', 'qaytarib olib kelaman'),
  back: R3("I'll be back", 'ещё вернусь', 'Yana kelaman'),
  ninety: R3('Ninety tilla', 'Девяносто', "To'qson tilla"),
  alive: R3("She's alive", 'Она жива', 'U tirik'),
  accept2: R3('A hundred and fifty', 'Сто пятьдесят', 'Bir yuz ellik'),
  tasteHole: R3('edge of the hole', 'край дыры', "bo'shliq chetini"),
  askHole: R3('small questions', 'мелкие вопросы', 'mayda savollar'),
  whoElse: R3('Who else', 'Кто ещё', 'yana kim'),
  why: R3('— Why\\?', '— Зачем\\?', '— Nega\\?'),
  hand: R3('I have your name', 'Есть тебе имя', 'Ism topildi'),
  take: R3('Close your eyes', 'Закрой глаза', "Ko'zingni yum"),
  keep: R3('satchel', 'сумку', 'xaltaga'),
  burn: R3('Burn', 'Сжечь', 'Yoqish'),
  deal: R3('Swear to the book', 'Поклянись под книгой', 'qasam ich\\. Mansurni'),
  law: R3('Arithmetic', 'Арифметика', 'Hisob'),
  sell: R3('Put the tumar on his desk', 'Положить тумар', "stoliga qo'yish")
};
// [lang, checksPass, steps]; a step: ['go', region, hour] | ['talk', npc, [picks]] | ['prop', id, [picks]]
const RUNS = [
  ['ru', false, [
    ['talk', 'qb_kamola', [P.accept1]], ['talk', 'qb_ismat', [P.pay]], ['talk', 'qb_ilhom', []], ['go', 'bazaar', 12], ['prop', 'qb1drain', [P.rung]],
    ['go', 'karez', 12], ['talk', 'qb_mahbuba', [P.whyLeft, P.eight]], ['go', 'bazaar', 12], ['talk', 'qb_kamola', []],
    ['talk', 'qb_mansur', [P.accept2]], ['talk', 'qb_qodir', [P.tasteHole]], ['go', 'cloister', 12], ['prop', 'qb2reg', []], ['prop', 'qb2stair', []],
    ['go', 'bazaar', 12], ['talk', 'qb_dilafruz', [P.why, P.hand]], ['go', 'mines', 12], ['talk', 'qb_dilafruz', []]
  ]],
  ['en', true, [
    ['talk', 'qb_kamola', [P.accept1]], ['talk', 'qb_ismat', [P.seal]], ['go', 'bazaar', 12], ['prop', 'qb1drain', [P.rung]],
    ['go', 'karez', 12], ['talk', 'qb_mahbuba', [P.bringVoice]], ['go', 'bazaar', 12], ['talk', 'qb_ismat', [P.ninety]],
    ['go', 'karez', 12], ['talk', 'qb_mahbuba', []], ['go', 'rabat', 12], ['talk', 'qb_mahbuba', []],
    ['go', 'bazaar', 12], ['talk', 'qb_ismat', []], ['talk', 'qb_ilhom', []],
    ['talk', 'qb_mansur', [P.accept2]], ['talk', 'qb_qodir', [P.askHole]], ['go', 'cloister', 12], ['prop', 'qb2reg', []],
    ['go', 'bazaar', 12], ['talk', 'qb_dilafruz', [P.whoElse, P.take, P.keep]], ['talk', 'qb_mansur', [P.sell]], ['talk', 'qb_ismat', []],
    ['go', 'cloister', 18], ['talk', 'qb_dilafruz', []]
  ]],
  ['uz', true, [
    ['talk', 'qb_kamola', [P.accept1]], ['talk', 'qb_ismat', [P.cloth]], ['go', 'bazaar', 12], ['prop', 'qb1drain', [P.rung]],
    ['go', 'karez', 12], ['talk', 'qb_mahbuba', [P.back]], ['go', 'bazaar', 12], ['talk', 'qb_ismat', [P.alive]], ['talk', 'qb_ismat', []], ['talk', 'qb_kamola', []],
    ['talk', 'qb_mansur', [P.accept2]], ['talk', 'qb_qodir', [P.tasteHole]], ['go', 'cloister', 12], ['prop', 'qb2reg', []],
    ['go', 'bazaar', 12], ['talk', 'qb_dilafruz', [P.deal, P.law]], ['talk', 'qb_dilafruz', []], ['talk', 'qb_mansur', []]
  ]],
  ['ru', true, [
    ['talk', 'qb_kamola', [P.accept1]], ['go', 'bazaar', 12], ['prop', 'qb1drain', [P.rung]],
    ['go', 'karez', 12], ['talk', 'qb_mahbuba', [P.back]], ['go', 'bazaar', 12], ['talk', 'qb_kamola', [P.alive]],
    ['talk', 'qb_ismat', []], ['go', 'tail', 12], ['talk', 'qb_mahbuba', []], ['talk', 'qb_kamola', []],
    ['go', 'bazaar', 12], ['talk', 'qb_mansur', [P.accept2]], ['talk', 'qb_qodir', [P.tasteHole]], ['go', 'cloister', 12], ['prop', 'qb2reg', []],
    ['go', 'bazaar', 12], ['talk', 'qb_dilafruz', [P.take, P.burn]], ['talk', 'qb_mansur', []]
  ]]
];
(async () => {
  const b = await T.chromium.launch();
  for (const [lang, pass, steps] of RUNS) {
    const p = await T.start(b, { region: 'bazaar', lang });
    const W = (f, a) => p.evaluate(f, a);
    await W(pass => {
      G.run.gold = 2000;
      if (pass) { const c0 = G.CH.check; G.CH.check = (k, n, x) => ({ ok: true, have: n, need: n }); G.CH._c0 = c0; }
      else G.CH.check = () => ({ ok: false, have: 0, need: 9 });
    }, pass);
    await T.go(p, 'bazaar', 12);
    const log = [];
    for (const s of steps) {
      if (s[0] === 'go') await T.go(p, s[1], s[2], log);
      else if (s[0] === 'talk') await T.talk(p, s[1], log, s[2]);
      else await T.useProp(p, s[1], log, s[2]);
    }
    const r = await W(() => ({ qb1: G.FAC.q('qb1'), qb2: G.FAC.q('qb2'), flags: Object.fromEntries(Object.entries(G.FAC.S().n).filter(([k]) => /^side:qb/.test(k))), gold: G.run.gold, epi: ['qb1', 'qb2'].map(k => { const f = G.FAC.EPI[k]; const e = f && f(1); return e ? G.LANG.t(e.text).slice(0, 60) : null; }) }));
    console.log(JSON.stringify({ lang, qb1: r.qb1.st + '/' + r.qb1.br, qb2: r.qb2.st + '/' + r.qb2.br, flags: r.flags, gold: r.gold, epi: r.epi, miss: log.filter(l => /^!!/.test(l)), picks: log.filter(l => /^\?/.test(l)).length, errs: p._errs.slice(0, 4), untranslated: (await T.untranslated(p)).filter(s => !/^Level|^Уровень/.test(s)) }));
    if (process.env.LOG) console.log(log.join('\n'));
    await p.close();
  }
  await b.close();
})();
