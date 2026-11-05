// The Ark and Cloister investigations (89y): qa1 "Someone Else's Conscience" and qc1 "The Light Tithe".
// Four short runs, each in a fresh journey: each quest to two different endings, then a later visit to the people who come back.
//   node test/s9_qark.js        (LOG=1 prints the dialogue log; FROM=i TO=j runs only RUNS[i..j))
const T = require('./s6_lib');
const R3 = (en, ru, uz) => new RegExp(en + '|' + ru + '|' + uz);
const P = {
  taste: R3('\\[Taste\\]', '\\[Испить\\]', "\\[Totib ko'rish\\]"),
  brand: R3('Give me your wrist', 'Дай руку', "Qo'lingni ber"),
  rope: R3('for a rope', 'за верёвку', 'arqon'),
  tell: R3("didn't go with any caravan", 'ни с каким караваном', 'hech qanday karvon'),
  hide: R3("I'm looking for the man", 'Я ищу человека', 'odamni qidiryapman'),
  pay: R3('forty tilla on the desk', 'сорок тилла', 'qirq tilla qo'),
  num: R3('one hundred and fourteen', 'сто четырнадцать', "o'n to'rtinchi"),
  ret: R3('\\[Plant\\]', '\\[Вселить\\]', '\\[Joylash\\]'),
  keep: R3('It stays where it is', 'Пусть остаётся', 'Joyida qolsin'),
  ink: R3('Look at the ink', 'Смотреть на чернила', 'siyohga qarash'),
  gate: R3('Sit by the gate', 'Сесть у ворот', "darvoza yonida o'tirib"),
  follow: R3('Wait in the shadows', 'Ждать в тени', 'Soyada kutib'),
  habiba: R3('Keeper Habiba will hear', 'хранительница Хабиба', 'saqlovchi Habiba eshitadi'),
  deal: R3("Keep it\\. But", 'Оставьте её', "O'zingizda qolsin")
};
// [lang, checksPass, start region, steps]; a step: ['go', region, hour] | ['talk', npc, [picks]] | ['prop', id, [picks]] | ['days', n]
const RUNS = [
  ['ru', false, 'ark', [
    ['talk', 'qa_qodir', [P.taste]], ['go', 'rabat', 12], ['prop', 'qa1cist', [P.taste]], ['go', 'tail', 12], ['talk', 'qa_robiya', [P.tell]],
    ['go', 'ark', 12], ['talk', 'qa_anvar', [P.pay]], ['talk', 'qa_jahon', []], ['talk', 'qa_qodir', [P.ret]],
    ['days', 1], ['go', 'tail', 12], ['talk', 'qa_jahon', []], ['talk', 'qa_robiya', []]
  ]],
  ['uz', true, 'ark', [
    ['talk', 'qa_qodir', [P.brand]], ['go', 'ark', 12], ['talk', 'qa_anvar', [P.num]], ['talk', 'qa_jahon', []],
    ['go', 'rabat', 12], ['prop', 'qa1cist', [P.rope]], ['go', 'tail', 12], ['talk', 'qa_robiya', [P.hide]],
    ['go', 'ark', 12], ['talk', 'qa_qodir', [P.keep]], ['talk', 'qa_jahon', []],
    ['days', 2], ['go', 'rabat', 12], ['talk', 'qa_qodir', []]
  ]],
  ['en', false, 'cloister', [
    ['talk', 'qc_lola', []], ['go', 'bazaar', 12], ['talk', 'qc_ismat', [P.taste]], ['go', 'cloister', 12], ['prop', 'qc1niche', [P.gate]],
    ['go', 'tower', 12], ['prop', 'qc1shelf', []], ['go', 'cloister', 12], ['talk', 'qc_mavlon', [P.habiba]], ['talk', 'qc_lola', []],
    ['days', 2], ['go', 'bazaar', 12], ['talk', 'qc_ismat', []]
  ]],
  ['ru', true, 'cloister', [
    ['talk', 'qc_lola', []], ['go', 'bazaar', 12], ['talk', 'qc_ismat', [P.ink]], ['go', 'cloister', 12], ['prop', 'qc1niche', [P.follow]],
    ['go', 'tower', 12], ['prop', 'qc1shelf', []], ['go', 'cloister', 12], ['talk', 'qc_mavlon', [P.deal]],
    ['days', 2], ['go', 'cloister', 12], ['talk', 'qc_mavlon', []], ['talk', 'qc_lola', []]
  ]]
];
(async () => {
  const b = await T.chromium.launch();
  for (const [lang, pass, region, steps] of RUNS.slice(+(process.env.FROM||0), +(process.env.TO||9))) {
    const p = await T.start(b, { region, lang });
    const W = (f, a) => p.evaluate(f, a);
    await W(pass => {
      G.run.gold = 2000;
      G.CH.check = pass ? (k, n) => ({ ok: true, have: n, need: n }) : () => ({ ok: false, have: 0, need: 9 });
    }, pass);
    await T.go(p, region, 12);
    const log = [];
    for (const s of steps) {
      if (s[0] === 'go') await T.go(p, s[1], s[2], log);
      else if (s[0] === 'talk') await T.talk(p, s[1], log, s[2]);
      else if (s[0] === 'days') await W(n => { G.WORLD2.S().day = (G.WORLD2.S().day || 1) + n; }, s[1]);
      else await T.useProp(p, s[1], log, s[2]);
    }
    const r = await W(() => ({ qa1: G.FAC.q('qa1'), qc1: G.FAC.q('qc1'), flags: Object.fromEntries(Object.entries(G.FAC.S().n).filter(([k]) => /^side:q[ac]1/.test(k))), gold: G.run.gold, epi: ['qa1', 'qc1'].map(k => { const f = G.FAC.EPI[k]; const e = f && f(1); return e ? G.LANG.t(e.text).slice(0, 60) : null; }) }));
    const said = log.filter(l => !/^[?!]/.test(l)).slice(-3);
    console.log(JSON.stringify({ lang, qa1: r.qa1.st + '/' + r.qa1.br, qc1: r.qc1.st + '/' + r.qc1.br, flags: r.flags, gold: r.gold, epi: r.epi, last: said, miss: log.filter(l => /^!!/.test(l)), picks: log.filter(l => /^\?/.test(l)).length, errs: p._errs.slice(0, 4), untranslated: (await T.untranslated(p)).filter(s => !/^Level|^Уровень/.test(s)) }));
    if (process.env.LOG) console.log(log.join('\n'));
    await p.close();
  }
  await b.close();
})();
