// The Tail investigations (89x): qt1 "One Night for the Whole Street" and qt2 "Two Widows and a Bowl",
// each played from the offer to an ending, a different ending per plan; then a day later the return beats and slides.
//   node test/s9_qtail.js [lang=ru] [plans=all|0,1,..]
const T = require('./s6_lib');
const lang = process.argv[2] || 'ru';
// [checks pass?, hilola, mohira, qt1 ending, qt2 ending]
const PLANS = [
  [true, 'taste', 'told', 'truth', 'split'],
  [false, 'bye', 'spared', 'half', 'truth'],
  [true, 'taste', 'told', 'plant', 'sab'],
  [false, 'bye', 'told', 'none', 'burn']
];
const want = process.argv[3] && process.argv[3] !== 'all' ? process.argv[3].split(',').map(Number) : PLANS.map((_, i) => i);
const R1 = {
  yes: /Поспрашиваю|I'll ask around|Surishtiraman/, taste: /Испить|\[Taste\]|Totib/, bye: /Спасибо, опа|Thank you, opa|Rahmat, opa/,
  receipts: /квитанции переулка|tithe receipts|ushr tilxat/, words: /одними словами, ака|same words, aka|bir xil so'z bilan aytadi/, nabiBye: /Понадобитесь|come back if I need|Kerak bo'lsangiz/,
  str: /Вырвать решётку|Tear the grate|sug'urib/, long: /Обойти по|Go round|aylanib o'tish/, read: /Забрать трубку|Take the tube|Naychani olib/,
  told: /Это был Бахром|It was Bahrom|Bahrom edi/, spared: /просто спрашивал|only asking|Shunchaki so'radim/,
  truth: /отдал троих детей|gave three children|uchta bolani qarz/, half: /утонул в кяризе|drowned in the karez|cho'kib o'lgan/, plant: /\[Вселить\]|\[Plant\]|\[Joylash\]/, none: /\[Сжечь\]|\[Burn\]|\[Yoqish\]/
};
const R2 = {
  yes: /Дайте чашу|Give me the bowl|Kosani bering/, taste: /Испить|\[Taste\]|Totib/,
  press: /считаю по работе|count tumars|tumar sanash/, eye: /два зелёных|two greens|ikki xil yashil/,
  told: /кое-что оставил|left you something|bir narsa qoldirgan/,
  split: /Перемелите|Grind it down|Maydalang/, truth: /отнесу её Зайнаб|back to Zaynab|Zaynabga qaytaraman/, sab: /Вся чаша|whole bowl goes|Butun kosa/, burn: /\[Сжечь\]|\[Burn\]|\[Yoqish\]/
};
(async () => {
  const b = await T.chromium.launch();
  for (const i of want) {
    const [pass, hil, moh, end1, end2] = PLANS[i];
    const p = await T.start(b, { region: 'tail', lang });
    const W = (f, a) => p.evaluate(f, a);
    await W(ok => { G.run.gold = 500; try { G.EVENTS.list.forEach(e => { G.EVENTS.S().done[e.id] = 'test'; }); } catch (e) { /* no events */ } const c0 = G.CH.check; G.CH.check = (k, n, x) => (['collection', 'mem', 'str', 'agi'].includes(k) ? { ok, have: ok ? n : 0, need: n } : c0(k, n, x)); }, pass);
    const L = [], st = [];
    const step = async tag => { const r = await W(() => ({ q1: G.FAC.q('qt1').st, q2: G.FAC.q('qt2').st })); st.push(tag + ':' + r.q1 + '/' + r.q2); };
    // qt1
    await T.go(p, 'tail', 12, L);
    await T.talk(p, 'farhod', L, [R1.yes]); await step('offer');
    await T.talk(p, 'hilola', L, [R1[hil]]);
    await T.talk(p, 'nabi', L, [R1.receipts, R1.words, R1.nabiBye]); await step('lane');
    await T.tick(p, 70); await T.drain(p, L); await T.useProp(p, 'qt1hooks', L, []); await step('hooks');
    await T.go(p, 'karez', 12, L); await T.tick(p, 70); await T.drain(p, L);
    await T.useProp(p, 'qt1bones', L, pass ? [R1.str, R1.taste] : [R1.long, R1.read]); await step('bones');
    await T.go(p, 'potters', 12, L);
    await T.talk(p, 'mohira', L, [R1[moh]]); await step('mohira');
    await T.go(p, 'tail', 12, L);
    await T.talk(p, 'farhod', L, [R1[end1]]); await step('qt1end');
    // qt2
    await T.talk(p, 'zaynab', L, [R2.yes, R2.taste]); await step('bowl');
    await T.go(p, 'potters', 12, L);
    await T.talk(p, 'olmas', L, [R2.press, R2.eye, R2.taste]); await step('olmas');
    await T.talk(p, 'sabohat', L, [R2.told]); await step('blue');
    await T.go(p, 'karez', 12, L); await T.tick(p, 70); await T.drain(p, L);
    await T.useProp(p, 'qt2ledge', L, []); await step('ledge');
    await T.go(p, 'potters', 12, L);
    await T.talk(p, 'olmas', L, [R2[end2]]); await step('qt2end');
    // a day later: the return beats, the people's after-lines, the slides
    await W(() => { G.WORLD2.S().day = (G.WORLD2.S().day || 1) + 2; });
    const waitBeat = async k => { for (let n = 0; n < 6 && !(await W(k => G.COMP.seen(k), k)); n++) { await T.tick(p, 40); await T.drain(p, L); } };
    await T.go(p, 'potters', 12, L); await waitBeat('qt2_back');
    await T.go(p, 'tail', 12, L); await waitBeat('qt1_back');
    await T.talk(p, 'hilola', L, []); await T.talk(p, 'zaynab', L, []);
    const r = await W(() => ({
      q1: G.FAC.q('qt1'), q2: G.FAC.q('qt2'), seen: ['qt1_back', 'qt2_back'].filter(k => G.COMP.seen(k)),
      epi: ['qt1', 'qt2'].map(k => { const s = G.FAC.EPI[k] && G.FAC.EPI[k]('tithe'); return s ? String(s.text).slice(0, 40) : null; }),
      gold: G.run.gold
    }));
    const out = { plan: PLANS[i], q1: r.q1.st + ':' + r.q1.br, q2: r.q2.st + ':' + r.q2.br, steps: st, seen: r.seen, epi: r.epi, gold: r.gold, lines: L.length, missing: L.filter(x => /^!!/.test(x)), errs: p._errs.slice(0, 5), untranslated: (await T.untranslated(p)).filter(s => !/^Level|^Уровень/.test(s)) };
    console.log(JSON.stringify(out));
    if (process.env.QT_LOG) console.log(L.join('\n'));
    await p.close();
  }
  await b.close();
})();
