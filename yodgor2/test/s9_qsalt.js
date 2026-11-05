// The salt investigations (89z): qr1 "The Same Caravan" (Rabat) and qm1 "The Seventh Drift" (Salt Mines).
// Four short runs, each in a fresh journey: each quest to two different endings, then a later visit to the people who come back.
//   node test/s9_qsalt.js        (LOG=1 prints the dialogue log; FROM=i TO=j runs only RUNS[i..j))
const T = require('./s6_lib');
const R3 = (en, ru, uz) => new RegExp(en + '|' + ru + '|' + uz);
const P = {
  taste: R3('\\[Taste\\]', '\\[Испить\\]', "\\[Totib ko'rish\\]"),
  cord: R3('cord round his neck', 'шнурку', 'ipga razm'),
  promise: R3("I'll bring Ilyos home", 'Я верну Ильяса', 'Ilyosni uyga qaytaraman'),
  look: R3("I'm not promising", 'Ничего не обещаю', "Hech narsa va'da"),
  rope: R3('Buy a rope', 'Купить у сборщика', 'arqon olib'),
  agi: R3('ten steps and back', 'десять шагов и обратно', "o'n qadam va orqaga"),
  pay: R3('Pour him another', 'Налить ему', 'yana bir kosa'),
  press: R3('planting memories for money', 'впевает память за деньги', 'pulga xotira joylayapti'),
  last: R3('Have your week', 'Догуляй', "Haftangni o'tkazib"),
  stay: R3("Then don't take them out", 'Тогда не вынимайте', 'Unda chiqarib olmanglar'),
  str: R3("Take Eshmat's pick", 'Взять кирку', "cho'kichini olib"),
  leave: R3('Keep your book', 'Оставь книгу', "Kitobing o'zingda"),
  law: R3('shipping page', 'страницу отгрузок', "Jo'natmalar"),
  mem: R3('Smell the block', 'Понюхать блок', "Bo'lakni hidlab"),
  burn: R3('\\[Burn\\]', '\\[Сжечь\\]', '\\[Yoqish\\]'),
  share: R3('A tenth of every pinch', 'Десятая часть', "o'ndan biri")
};
// [lang, checksPass, start region, steps]; a step: ['go', region, hour] | ['talk', npc, [picks]] | ['prop', id, [picks]] | ['days', n]
const RUNS = [
  ['ru', false, 'rabat', [
    ['talk', 'qr_durdona', []], ['talk', 'qr_yoldosh', [P.taste]], ['go', 'tail', 12], ['talk', 'qr_bashorat', [P.promise]],
    ['go', 'rabat', 12], ['prop', 'qr1fog', [P.rope]], ['talk', 'qr_rajab', [P.pay]], ['talk', 'qr_tojiniso', [P.last]],
    ['days', 1], ['go', 'rabat', 12], ['talk', 'qr_tojiniso', []], ['talk', 'qr_durdona', []], ['talk', 'qr_rajab', []],
    ['go', 'tail', 12], ['talk', 'qr_bashorat', []], ['talk', 'qr_ilyos', []]
  ]],
  ['uz', true, 'rabat', [
    ['talk', 'qr_durdona', []], ['talk', 'qr_yoldosh', [P.cord]], ['go', 'tail', 12], ['talk', 'qr_bashorat', [P.look]],
    ['go', 'rabat', 12], ['talk', 'qr_rajab', [P.press]], ['prop', 'qr1fog', [P.agi]], ['talk', 'qr_tojiniso', [P.stay]],
    ['days', 2], ['go', 'rabat', 12], ['talk', 'qr_yoldosh', []], ['talk', 'qr_tojiniso', []], ['go', 'tail', 12], ['talk', 'qr_bashorat', []]
  ]],
  ['en', false, 'mines', [
    ['talk', 'qm_eshmat', []], ['go', 'mines', 12], ['prop', 'qm1wall', [P.taste]], ['talk', 'qm_ochil', [P.leave]], ['go', 'bazaar', 12], ['talk', 'qm_nasim', [P.taste]],
    ['go', 'tail', 12], ['talk', 'qm_munisa', []], ['go', 'mines', 12], ['talk', 'qm_eshmat', [P.burn]],
    ['days', 2], ['go', 'mines', 12], ['talk', 'qm_eshmat', []], ['talk', 'qm_ochil', []], ['talk', 'qm_munisa', []], ['go', 'bazaar', 12], ['talk', 'qm_nasim', []]
  ]],
  ['ru', true, 'mines', [
    ['talk', 'qm_eshmat', []], ['go', 'mines', 12], ['prop', 'qm1wall', [P.str]], ['talk', 'qm_ochil', [P.law]], ['go', 'bazaar', 12], ['talk', 'qm_nasim', [P.mem]],
    ['go', 'tail', 12], ['talk', 'qm_munisa', []], ['go', 'mines', 12], ['talk', 'qm_eshmat', [P.share]],
    ['days', 1], ['go', 'tail', 12], ['talk', 'qm_eshmat', []], ['talk', 'qm_munisa', []], ['go', 'bazaar', 12], ['talk', 'qm_nasim', []]
  ]]
];
(async () => {
  const b = await T.chromium.launch();
  for (const [lang, pass, region, steps] of RUNS.slice(+(process.env.FROM || 0), +(process.env.TO || 9))) {
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
    const r = await W(() => ({ qr1: G.FAC.q('qr1'), qm1: G.FAC.q('qm1'), flags: Object.fromEntries(Object.entries(G.FAC.S().n).filter(([k]) => /^side:q[rm]1/.test(k))), gold: G.run.gold, epi: ['qr1', 'qm1'].map(k => { const f = G.FAC.EPI[k]; const e = f && f(1); return e ? G.LANG.t(e.text).slice(0, 60) : null; }) }));
    const said = log.filter(l => !/^[?!]/.test(l)).slice(-3);
    console.log(JSON.stringify({ lang, qr1: r.qr1.st + '/' + r.qr1.br, qm1: r.qm1.st + '/' + r.qm1.br, flags: r.flags, gold: r.gold, epi: r.epi, last: said, miss: log.filter(l => /^!!/.test(l)), picks: log.filter(l => /^\?/.test(l)).length, errs: p._errs.slice(0, 4), untranslated: (await T.untranslated(p)).filter(s => !/^Level|^Уровень/.test(s)) }));
    if (process.env.LOG) console.log(log.join('\n'));
    await p.close();
  }
  await b.close();
})();
