// The underground investigations (89zb): qk1 "The Quiet Water" (karez) and qs1 "The Day Before the Festival" (Swallowed Streets / Old Yodgor).
// Four short runs, each in a fresh journey: each quest to two different endings, then a later visit to the people who come back.
//   node test/s9_qunder.js        (LOG=1 prints the dialogue log; FROM=i TO=j runs only RUNS[i..j))
const T = require('./s6_lib');
const R3 = (en, ru, uz) => new RegExp(en + '|' + ru + '|' + uz);
const P = {
  taste: R3('\\[Taste\\]', '\\[Испить\\]', "\\[Totib ko'rish\\]"),
  pay: R3('Pay the fare', 'Заплатить за перевоз', "Yo'l haqini"),
  law: R3("doesn't pay to look", 'не платит за то', "pul to'lamaydi"),
  touch: R3('Touch the grey crust', 'Потрогать серую корку', 'ushlab ko'),
  count: R3('Count the sacks', 'Пересчитать мешки', 'Qoplarni sanab'),
  read: R3('Read the tags', 'Читать бирки', "Yorliqlarni qarz"),
  askch: R3('Who took your water', 'Кто забрал у вас воду', 'Suvingizni kim'),
  cap: R3('wear on his head', 'носил на голове', 'boshiga nima'),
  dam: R3('Break the dam', 'Ломаем запруду', "To'g'onni buzamiz"),
  keep: R3('Keep the lamps lit', 'Пусть лампы горят', 'Chiroqlar yonaversin'),
  look: R3('Look round the house', 'осмотреть дом', "uyni ko'zdan"),
  shelf: R3('else is on the shelf', 'ещё есть на полке', 'yana nima borligini'),
  dig: R3('Clear the rubble', 'Разобрать завал', 'vayronani tozalash'),
  warn: R3("singing won't hold", 'песня не удержит', 'ushlab turolmaydi'),
  promise: R3("won't tell her anything", 'Ничего ей не скажу', 'hech narsa demayman'),
  show: R3('Show me the door', 'Покажи мне дверь', "Eshikni ko'rsat"),
  verse: R3('doubled-tithe verse', 'удвоенной десятины', 'ikki hissa ushr'),
  ozoda: R3('Let Ozoda open', 'Пусть откроет Озода', 'Ozoda ochsin'),
  self: R3('Let go of your own name', 'отпустить собственное имя', "ismingni qo'yib"),
  truth: R3('\\[Plant\\]', '\\[Вселить\\]', '\\[Joylash\\]'),
  burn: R3('\\[Burn\\]', '\\[Сжечь\\]', '\\[Yoqish\\]')
};
// [lang, checksPass, start region, steps]; a step: ['go', region, hour] | ['talk', npc, [picks]] | ['prop', id, [picks]] | ['days', n]
const RUNS = [
  ['ru', false, 'tail', [
    ['talk', 'qk_gulchehra', []], ['go', 'karez', 12], ['talk', 'qk_qudrat', [P.pay]], ['prop', 'qk1pool', [P.touch]], ['prop', 'qk1dam', [P.count]],
    ['go', 'tail', 12], ['prop', 'qk1chan', [P.askch]], ['go', 'karez', 12], ['talk', 'qk_qudrat', [P.dam]],
    ['days', 1], ['go', 'tail', 12], ['talk', 'qk_qudrat', []], ['talk', 'qk_gulchehra', []], ['talk', 'qk_husan', []]
  ]],
  ['uz', true, 'tail', [
    ['talk', 'qk_gulchehra', []], ['talk', 'qk_husan', [P.cap]], ['go', 'karez', 12], ['talk', 'qk_qudrat', [P.law]], ['prop', 'qk1pool', [P.taste]],
    ['prop', 'qk1dam', [P.read]], ['go', 'tail', 12], ['prop', 'qk1chan', [P.taste]], ['go', 'karez', 12], ['talk', 'qk_qudrat', [P.keep]],
    ['days', 2], ['go', 'karez', 22], ['talk', 'qk_husan', []], ['talk', 'qk_gulchehra', []], ['talk', 'qk_qudrat', []]
  ]],
  ['en', false, 'streets', [
    ['talk', 'qs_qumri', [P.look]], ['prop', 'qs1room', [P.shelf]], ['go', 'tail', 12], ['talk', 'qs_elyor', [P.warn]],
    ['go', 'old', 12], ['talk', 'qs_ozoda', [P.show]], ['prop', 'qs1door', [P.ozoda]], ['go', 'streets', 12], ['talk', 'qs_qumri', [P.truth]],
    ['days', 2], ['go', 'tail', 12], ['talk', 'qs_qumri', []], ['talk', 'qs_elyor', []], ['go', 'streets', 12], ['talk', 'qs_ozoda', []]
  ]],
  ['ru', true, 'streets', [
    ['talk', 'qs_qumri', [P.taste]], ['prop', 'qs1room', [P.dig]], ['go', 'streets', 22], ['talk', 'qs_elyor', [P.promise]],
    ['go', 'old', 12], ['talk', 'qs_ozoda', [P.verse]], ['prop', 'qs1door', [P.self]], ['go', 'streets', 12], ['talk', 'qs_qumri', [P.burn]],
    ['days', 2], ['go', 'streets', 12], ['talk', 'qs_qumri', []], ['go', 'tail', 12], ['talk', 'qs_elyor', []], ['go', 'old', 12], ['talk', 'qs_ozoda', []]
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
      else {
        // a prop whose moment comes while the hero is already in its region appears on the next world tick (once a second,
        // in the real frame loop, which debugTick does not drive): walk back into the region to let it be placed
        if (!(await W(id => G.world.ents.some(e => e._f6 === id && !e.dead), s[1]))) await T.go(p, await W(() => G.WORLD2.active), null, log);
        await T.useProp(p, s[1], log, s[2]);
      }
    }
    const r = await W(() => ({ qk1: G.FAC.q('qk1'), qs1: G.FAC.q('qs1'), flags: Object.fromEntries(Object.entries(G.FAC.S().n).filter(([k]) => /^side:q[ks]1/.test(k))), gold: G.run.gold, epi: ['qk1', 'qs1'].map(k => { const f = G.FAC.EPI[k]; const e = f && f(1); return e ? G.LANG.t(e.text).slice(0, 60) : null; }) }));
    const said = log.filter(l => !/^[?!]/.test(l)).slice(-3);
    console.log(JSON.stringify({ lang, qk1: r.qk1.st + '/' + r.qk1.br, qs1: r.qs1.st + '/' + r.qs1.br, flags: r.flags, gold: r.gold, epi: r.epi, last: said, miss: log.filter(l => /^!!/.test(l)), picks: log.filter(l => /^\?/.test(l)).length, errs: p._errs.slice(0, 4), untranslated: (await T.untranslated(p)).filter(s => !/^Level|^Уровень/.test(s)) }));
    if (process.env.LOG) console.log(log.join('\n'));
    await p.close();
  }
  await b.close();
})();
