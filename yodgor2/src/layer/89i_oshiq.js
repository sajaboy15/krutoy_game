/* 89i_oshiq.js — Ошиқ (knucklebones), GDD ch. 21: "our gwent" — a short game of skill and risk.
   Rules (simplified, as the author decided):
     · each player throws five alchiks; every bone lands on one of four sides:
         Chikka 3 points (rare) · Olchi 2 · Tava 1 · Pukka 0 ("empty")
     · combinations of the same non-empty side: a pair +2, three +5, four +10, five +20; all four sides at once +6
     · after the throw you may pick bones to rethrow, once. Risk: if three or more bones end on Pukka after a rethrow,
       the round scores nothing
     · three rounds; the higher total wins
   Special alchiks (30, a collection): Turquoise never lands empty, Golden doubles its points, weighted bones prefer a
   side, a Wild bone counts as any side for combinations, a Lucky one doesn't count towards the bust…
   Opponents: 12 across the city, each with a style and lines; the Bazaar tournament in act II. Stakes: tilla, items,
   sometimes a memory (side story 19, 89d).
   API: OSHIQ.play({ opp, stake, onEnd(result: 'win'|'lose', score) }) — an overlay over the game, like the journal.
   State: R().oshiq = { bag: [ids up to 5], coll: {id:1}, wins: {opp: n}, champion }. */
const OSHIQ = G.OSHIQ = {};
{
  const SIDES = ['chikka', 'olchi', 'tava', 'pukka'];
  const PTS = { chikka: 3, olchi: 2, tava: 1, pukka: 0 };
  const SIDE_NAME = { chikka: `Chikka|Чикка|Chikka`, olchi: `Olchi|Олчи|Olchi`, tava: `Tava|Тава|Tava`, pukka: `Pukka|Пукка|Pukka` };
  const BASEP = { chikka: .15, olchi: .25, tava: .3, pukka: .3 };
  // the thirty special alchiks: id, name, effect, colour; effects: noEmpty, double, weight (side, k), wild, lucky, plus
  const B = (id, name, fx, col) => ({ id, name, fx, col });
  const BONES = [
    B('plain', `Plain bone|Простой альчик|Oddiy oshiq`, {}, '#e8dcc0'),
    B('turquoise', `Turquoise|Бирюза|Feruza`, { noEmpty: 1 }, '#5fd0c8'),
    B('golden', `Golden|Золотой|Oltin`, { double: 1 }, '#ffd04a'),
    B('lead', `Lead-filled|Свинчатка|Qo'rg'oshinli`, { weight: ['tava', 2] }, '#8a8c90'),
    B('camel', `Camel's knee|Верблюжий|Tuya oshig'i`, { weight: ['chikka', 1.8] }, '#c8a070'),
    B('wolf', `Wolf's|Волчий|Bo'ri oshig'i`, { weight: ['olchi', 1.8] }, '#9aa0a8'),
    B('twin', `Twin|Близнец|Egizak`, { wild: 1 }, '#f0e8ff'),
    B('lucky', `Grandmother's|Бабушкин|Buvining`, { lucky: 1 }, '#e8c8a0'),
    B('salt', `Salt-white|Соляной|Tuzli`, { plus: 1 }, '#ffffff'),
    B('wax', `Waxed|Вощёный|Mumlangan`, { noEmpty: 1, weight: ['tava', 1.5] }, '#f4e8b0'),
    B('bride', `Bride's|Невестин|Kelin oshig'i`, { weight: ['chikka', 1.4], lucky: 1 }, '#ff9aa0'),
    B('divan', `Divan-stamped|С печатью Дивана|Devon tamg'ali`, { double: 1, weight: ['pukka', 1.4] }, '#c8323a'),
    B('singer', `Singer's white|Белый певческий|Xonandaning oqi`, { noEmpty: 1, weight: ['olchi', 1.3] }, '#e8eef8'),
    B('remember', `Masked|В маске|Niqobli`, { wild: 1, weight: ['pukka', 1.3] }, '#5a5a6a'),
    B('karez', `Karez-wet|Из кяриза|Koriz oshig'i`, { weight: ['tava', 1.4], plus: 1 }, '#3aa0a0'),
    B('ember', `Ember|Уголёк|Cho'g'`, { double: 1, weight: ['chikka', .7] }, '#ff7a3a'),
    B('ice', `Ice|Ледяной|Muz`, { lucky: 1, weight: ['olchi', 1.3] }, '#bfe8ff'),
    B('sand', `Sand-worn|Стёртый песком|Qum yeygan`, { wild: 1, noEmpty: 1 }, '#d8c090'),
    B('heart', `Heart-red|Алый|Qip-qizil`, { plus: 2, weight: ['pukka', 1.5] }, '#a8203a'),
    B('moon', `New-moon|Новолунный|Yangi oy`, { lucky: 1, noEmpty: 1 }, '#46528e'),
    B('copper', `Copper Row|Медный ряд|Mis rasta`, { plus: 1, weight: ['olchi', 1.2] }, '#c87a3a'),
    B('pomegranate', `Pomegranate|Гранатовый|Anor`, { double: 1, lucky: 1, weight: ['pukka', 1.6] }, '#d02a4a'),
    B('silk', `Silk-wrapped|В шёлке|Ipakka o'ralgan`, { weight: ['chikka', 1.5], weight2: ['pukka', .7] }, '#e0a0e0'),
    B('crow', `Crow's|Вороний|Qarg'a oshig'i`, { wild: 1, plus: 1, weight: ['pukka', 1.3] }, '#2a2430'),
    B('apricot', `Apricot-stone|Урюковый|O'rik danagi`, { noEmpty: 1, plus: 1, weight: ['tava', 1.6] }, '#f0a040'),
    B('dutar', `Bakhshi's|Бахши|Baxshi oshig'i`, { lucky: 1, weight: ['chikka', 1.3] }, '#a07a50'),
    B('leopard', `Snow leopard|Снежного барса|Qoplon oshig'i`, { weight: ['chikka', 2.1], weight2: ['pukka', 1.4] }, '#f8fbff'),
    B('dragon', `Dragon-scale|Драконий|Ajdar oshig'i`, { double: 1, noEmpty: 1, weight: ['tava', 1.6] }, '#ff5a2a'),
    B('star', `Pleiades|Плеяды|Hulkar`, { wild: 1, lucky: 1 }, '#ffe7ff'),
    B('king', `The Champion's|Чемпионский|Chempion oshig'i`, { double: 1, noEmpty: 1, lucky: 1 }, '#ffe060')
  ];
  const BONE = {}; for (const b of BONES) BONE[b.id] = b;
  OSHIQ.BONES = BONES; OSHIQ.BONE = BONE;
  const S = OSHIQ.S = () => { const r = R(); if (!r.oshiq || typeof r.oshiq !== 'object') r.oshiq = {}; const o = r.oshiq; if (!Array.isArray(o.bag)) o.bag = []; if (!o.coll) o.coll = { plain: 1 }; if (!o.wins) o.wins = {}; return o; };
  OSHIQ.give = id => { const s = S(); if (!BONE[id] || s.coll[id]) return false; s.coll[id] = 1; if (s.bag.length < 5) s.bag.push(id); save(); toast(tf(`A new alchik: {n}|Новый альчик: {n}|Yangi oshiq: {n}`, { n: t(BONE[id].name) }), '#ffe7a6'); sfx('coin'); return true; };
  OSHIQ.count = () => Object.keys(S().coll).length;
  const bagOf = list => { const l = (list || []).filter(id => BONE[id]).slice(0, 5); while (l.length < 5) l.push('plain'); return l; };

  /* ---------------------------------------------------------------- the dice */
  function roll(id) {
    const fx = BONE[id].fx, p = Object.assign({}, BASEP);
    if (fx.weight) p[fx.weight[0]] *= fx.weight[1];
    if (fx.weight2) p[fx.weight2[0]] *= fx.weight2[1];
    if (fx.noEmpty) p.pukka = 0;
    const tot = SIDES.reduce((a, s) => a + p[s], 0);
    let r = Math.random() * tot;
    for (const s of SIDES) { if ((r -= p[s]) <= 0) return s; }
    return 'tava';
  }
  // score of a hand: [{id, side}]
  function score(hand) {
    let pts = 0;
    for (const h of hand) { const fx = BONE[h.id].fx; let v = PTS[h.side]; if (fx.double) v *= 2; if (h.side !== 'pukka' && fx.plus) v += fx.plus; pts += v; }
    const cnt = { chikka: 0, olchi: 0, tava: 0, pukka: 0 }; let wild = 0;
    for (const h of hand) { if (BONE[h.id].fx.wild && h.side !== 'pukka') wild++; else cnt[h.side]++; }
    // wild bones join the largest non-empty group
    let best = 'olchi'; for (const s of ['chikka', 'olchi', 'tava']) if (cnt[s] > cnt[best]) best = s;
    const groups = Object.assign({}, cnt); groups[best] += wild;
    let combo = 0;
    for (const s of ['chikka', 'olchi', 'tava']) combo += ({ 2: 2, 3: 5, 4: 10, 5: 20 })[groups[s]] || 0;
    if (SIDES.every(s => cnt[s] > 0 || (s !== 'pukka' && wild > 0))) combo += 6;
    return { pts, combo, total: pts + combo };
  }
  const bust = hand => hand.filter(h => h.side === 'pukka' && !(h.re && BONE[h.id].fx.lucky)).length >= 3 && hand.some(h => h.re);
  OSHIQ.score = score;

  /* ---------------------------------------------------------------- the opponents (12) */
  // style: careful (rethrows only empties) · greedy (rethrows everything below Olchi) · bold (chases combos) · sly (cheats once)
  const OPP = OSHIQ.OPP = {
    oysha: { name: `Grandma Oysha|Бабушка Ойша|Oysha buvi`, region: 'tail', frac: .52, style: 'careful', bag: ['lucky', 'plain', 'plain', 'apricot', 'plain'], prize: 'lucky', look: 'widow', stake: 10,
      hi: `Sit, sit. I'll take your tilla slowly, so you can watch.|Садись, садись. Я буду забирать твою тиллу медленно, чтобы ты успел насмотреться.|O'tir, o'tir. Tillangni sekin olaman, toyib ko'rib olasan.`, win: `My husband lost to me for forty years. You're in good company.|Мой муж проигрывал мне сорок лет. Ты в хорошей компании.|Erim menga qirq yil yutqazgan. Yaxshi davradasan.`, lose: `Well, well. Take it. Don't tell my grandsons.|Ну-ну. Забирай. Внукам не говори.|Ha-ha. Ol. Nevaralarimga aytma.` },
    kamol: { name: `Kamol the porter|Носильщик Камол|Hammol Kamol`, region: 'bazaar', frac: .3, style: 'greedy', bag: ['plain', 'copper', 'plain', 'plain', 'lead'], prize: 'copper', look: 'tailman', stake: 15,
      hi: `One game. Then I carry your bags for free. Or you carry mine.|Одна партия. Потом я таскаю твои мешки задаром. Или ты мои.|Bitta o'yin. Keyin xaltalaringni tekin tashiyman. Yoki sen menikini.`, win: `I've carried heavier losses. Never with a smile.|Я таскал проигрыши и потяжелее. Но ни разу с улыбкой.|Bundan og'irroq yutqazishlarni ham ko'targanman. Lekin hech qachon jilmayib emas.`, lose: `Ha! The bags are yours. Kidding. Your purse is mine.|Ха! Мешки твои. Шучу. Кошелёк твой — мой.|Ha! Xaltalar seniki. Hazil. Hamyoning meniki.` },
    zebo: { name: `Zebo the herbalist|Травница Зебо|Giyohfurush Zebo`, region: 'bazaar', frac: .55, style: 'careful', bag: ['plain', 'apricot', 'salt', 'plain', 'turquoise'], prize: 'turquoise', look: 'tailwoman', stake: 20,
      hi: `I play like I brew: slowly, and nobody likes the result.|Играю, как варю отвары: медленно, и результат никому не нравится.|Damlama qaynatgandek o'ynayman: sekin, natijasi esa hech kimga yoqmaydi.`, win: `Bitter. Good for the blood.|Горько. Для крови полезно.|Achchiq. Qonga foydali.`, lose: `Hm. Luck is a weed. It grows where it likes.|Хм. Удача — сорняк. Растёт где хочет.|Hm. Omad — begona o't. Xohlagan joyida o'sadi.` },
    davron: { name: `Davron the caravan-bashi|Караван-баши Даврон|Karvonboshi Davron`, region: 'rabat', frac: .66, style: 'bold', bag: ['camel', 'plain', 'camel', 'salt', 'plain'], prize: 'camel', look: 'caravan', stake: 25,
      hi: `On the road we play for water. Here, for tilla. Same rules: don't cry.|В дороге мы играем на воду. Здесь — на тиллу. Правила те же: не плакать.|Yo'lda suvga o'ynaymiz. Bu yerda — tillaga. Qoidasi o'sha: yig'lama.`, win: `The camels will hear about this.|Верблюды об этом услышат.|Tuyalar bundan xabar topadi.`, lose: `Forty days I've been lucky. Forty-one.|Сорок дней мне везло. Сорок один.|Qirq kun omadim keldi. Qirq bir.` },
    nodir: { name: `Nodir the gravedigger|Могильщик Нодир|Go'rkov Nodir`, region: 'tower', frac: .58, style: 'careful', bag: ['crow', 'plain', 'plain', 'lead', 'plain'], prize: 'crow', look: 'elder', stake: 15,
      hi: `The dead don't play. I'm glad of the company.|Мёртвые не играют. Рад компании.|O'liklar o'ynamaydi. Hamroh bo'lganingdan xursandman.`, win: `You'll make a fine customer one day. Not soon.|Однажды из тебя выйдет отличный клиент. Не скоро.|Bir kun zo'r mijoz bo'lasan. Tez emas.`, lose: `The crows were watching. They saw nothing.|Вороны смотрели. Ничего не видели.|Qarg'alar qarab turishdi. Hech narsa ko'rishmadi.` },
    gulnora: { name: `Gulnora|Гулнора|Gulnora`, region: 'ark', frac: .35, style: 'bold', bag: ['bride', 'silk', 'plain', 'plain', 'golden'], prize: 'bride', look: 'gulnora', stake: 30,
      hi: `In the Ark we play with gold bones. Don't worry, I'll lend you a plain one.|В Арке играют золотыми альчиками. Не волнуйся, дам тебе простой.|Arkda oltin oshiqlar bilan o'ynashadi. Xavotir olma, senga oddiysini beraman.`, win: `How rude. Again, tomorrow.|Как невежливо. Ещё раз, завтра.|Qanday odobsizlik. Ertaga yana.`, lose: `Gold always wins. That's the whole Ark in one sentence.|Золото всегда выигрывает. Вот и весь Арк в одной фразе.|Oltin doim yutadi. Butun Ark bitta gapda.` },
    malik: { name: `Malik, a novice|Послушник Малик|Shogird Malik`, region: 'cloister', frac: .4, style: 'careful', bag: ['singer', 'plain', 'plain', 'plain', 'plain'], prize: 'singer', look: 'singer', stake: 10,
      hi: `It's forbidden. That's why it's fun. Quickly, before the bell.|Это запрещено. Потому и весело. Быстро, пока не ударил колокол.|Bu taqiqlangan. Shuning uchun qiziq. Tez, qo'ng'iroq chalinmasidan.`, win: `I'll pray it was a sin. I'll enjoy it first.|Помолюсь, что это был грех. Но сначала порадуюсь.|Gunoh bo'lgan, deb duo qilaman. Lekin avval xursand bo'lay.`, lose: `It's a sign. Of what, I'll decide later.|Это знак. Чего — решу потом.|Bu alomat. Nimaning alomati ekanini keyin hal qilaman.` },
    tolib: { name: `Tolib, a smuggler|Контрабандист Толиб|Kontrabandachi Tolib`, region: 'karez', frac: .45, style: 'sly', bag: ['karez', 'plain', 'remember', 'plain', 'lead'], prize: 'karez', look: { robe: '#2a2a30', trim: '#5a4a3a', skin: '#a07a5a', head: 'hood', headC: '#1a1a20' }, stake: 25,
      hi: `In the dark nobody sees what lands. Good for business.|В темноте никто не видит, как падает. Хорошо для дела.|Qorong'ida qanday tushganini hech kim ko'rmaydi. Ish uchun yaxshi.`, win: `Light's bad down here. I'll blame the light.|Тут плохой свет. Свалю на свет.|Bu yerda yorug'lik yomon. Yorug'likka ag'daraman.`, lose: `Saw it land Olchi. Didn't you? Course you did.|Видел, Олчи легла. А ты нет? Конечно, видел.|Olchi tushganini ko'rdim. Sen-chi? Albatta ko'rding.` },
    mavluda: { name: `Mavluda, a salt-cutter|Солерубка Мавлюда|Tuz qazuvchi Mavluda`, region: 'mines', frac: .35, style: 'greedy', bag: ['salt', 'salt', 'plain', 'heart', 'plain'], prize: 'salt', look: 'tailwoman', stake: 15,
      hi: `Three hundred days left. A game makes one of them shorter.|Осталось триста дней. Партия сделает один из них короче.|Uch yuz kun qoldi. Bitta o'yin ulardan birini qisqartiradi.`, win: `You play like the overseer. Fast and without joy.|Ты играешь как надсмотрщик. Быстро и без радости.|Nazoratchidek o'ynaysan. Tez va quvonchsiz.`, lose: `There. Two hundred and ninety-nine.|Вот. Двести девяносто девять.|Mana. Ikki yuz to'qson to'qqiz.` },
    yoqub: { name: `Old Yoqub, the bell-hanger's brother|Старый Якуб, брат звонаря|Keksa Yoqub, qo'ng'iroqchining akasi`, region: 'spine', frac: .62, style: 'bold', bag: ['ice', 'leopard', 'plain', 'plain', 'wolf'], prize: 'leopard', look: 'elder', stake: 30,
      hi: `Up here the bones bounce off the ice. You'll lose them and your dignity.|Здесь альчики отскакивают ото льда. Потеряешь их — и достоинство.|Bu yerda oshiqlar muzdan sakraydi. Ularni ham, obro'ingni ham yo'qotasan.`, win: `My brother will laugh. He hangs bells. He laughs at everything.|Брат посмеётся. Он вешает колокольчики. Он над всем смеётся.|Ukam kuladi. U qo'ng'iroq osadi. Hamma narsaga kuladi.`, lose: `The leopard bone never lies. It just exaggerates.|Барсовый альчик не врёт. Он только преувеличивает.|Qoplon oshig'i yolg'on gapirmaydi. Faqat oshirib yuboradi.` },
    tura: { name: `Tura of the sky caravans|Тура с небесных караванов|Osmon karvonlarining Turasi`, region: 'withers', frac: .48, style: 'sly', bag: ['star', 'silk', 'plain', 'plain', 'pomegranate'], prize: 'star', look: 'caravan', stake: 40,
      hi: `Where I'm from, we play this with stars. Little ones. Same rules.|Там, откуда я, в это играют звёздами. Маленькими. Правила те же.|Men kelgan joyda buni yulduzlar bilan o'ynashadi. Kichkinalari bilan. Qoidasi o'sha.`, win: `The clouds saw. They'll tell everyone, slowly.|Облака видели. Расскажут всем, не спеша.|Bulutlar ko'rdi. Hammaga sekin-asta aytib berishadi.`, lose: `Your bones are heavy. Earth bones.|Тяжёлые у тебя альчики. Земные.|Oshiqlaring og'ir. Yerniki.` },
    sanjar: { name: `Sanjar the champion|Чемпион Санжар|Chempion Sanjar`, region: 'bazaar', frac: .62, style: 'bold', bag: ['golden', 'dragon', 'wolf', 'camel', 'turquoise'], prize: 'king', look: 'auctioneer', stake: 60,
      hi: `Nobody's beaten me since the Small Awakening. Since then I've stopped counting how much I win.|С Малого пробуждения меня никто не обыгрывал. С тех пор я перестал считать выигрыши.|Kichik uyg'onishdan beri meni hech kim yutmagan. O'shandan beri yutuqlarimni sanashni bas qilganman.`, win: `...Count it for me, yodchi. I've forgotten how.|...Посчитай за меня, ёдчи. Я разучился.|...Men uchun sanab ber, yodchi. Esimdan chiqibdi.`, lose: `Next.|Следующий.|Navbatdagi.` }
  };
  for (const k in OPP) CAST['op_' + k] = { name: OPP[k].name, portrait: null };

  /* ---------------------------------------------------------------- the game (an overlay) */
  const G0 = OSHIQ.G = { open: false };
  function aiRethrow(hand, style, round) {
    const sel = [];
    hand.forEach((h, i) => {
      const fx = BONE[h.id].fx;
      if (style === 'careful') { if (h.side === 'pukka') sel.push(i); }
      else if (style === 'greedy') { if (PTS[h.side] < 2 && !fx.wild) sel.push(i); }
      else { const sc = score(hand); if (h.side === 'pukka' || (h.side === 'tava' && sc.combo < 5)) sel.push(i); }
    });
    // never rethrow into an obvious bust: at most two bones that can land empty
    return sel.filter(i => !BONE[hand[i].id].fx.noEmpty).length > 3 ? sel.slice(0, 2) : sel;
  }
  OSHIQ.play = o => {
    if (G0.open) return;
    const opp = OPP[o.opp] || OPP.oysha;
    Object.assign(G0, { open: true, t: 0, opp: o.opp, oppD: opp, stake: o.stake || 0, onEnd: o.onEnd, round: 1, turn: 'me', phase: 'throw', sel: 0, mark: [], me: [], op: [], tot: { me: 0, op: 0 }, log: [], cheat: o.cheat || null, cheated: false, msg: t(opp.hi), msgT: 0 });
    G0.myBag = bagOf(S().bag); G0.opBag = bagOf(opp.bag);
    G.UI.choice({ title: '', cancel: false, options: [{ label: ' ', value: null }], kind: 'scroll', onPick: () => { } });
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    sfx('scroll');
  };
  const close = () => {
    G0.open = false;
    const m = G.UI._debug().modal; if (m && m.type === 'choice') { m.picked = true; m.pickT = 0; m.pickVal = null; }
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
  };
  const throwAll = (bag) => bag.map(id => ({ id, side: roll(id), re: false }));
  function myThrow() { G0.me = throwAll(G0.myBag); G0.mark = []; G0.phase = 'choose'; G0.sel = 0; sfx('roll'); }
  function myRethrow() {
    if (G0.mark.length) { for (const i of G0.mark) { G0.me[i] = { id: G0.me[i].id, side: roll(G0.me[i].id), re: true }; } sfx('roll'); }
    endMine();
  }
  function endMine() {
    const sc = score(G0.me), b = bust(G0.me);
    const got = b ? 0 : sc.total; G0.tot.me += got;
    G0.log.push({ who: 'me', got, bust: b });
    G0.msg = b ? t(`Three empties. The round scores nothing.|Три пустых. Раунд пропал.|Uchta bo'sh. Raund bekorga ketdi.`) : tf(`You score {n}.|У тебя {n}.|Senda {n}.`, { n: got });
    G0.phase = 'opp'; G0.t2 = 0;
  }
  function oppTurn() {
    const opp = G0.oppD;
    let hand = throwAll(G0.opBag);
    const rs = aiRethrow(hand, opp.style, G0.round);
    for (const i of rs) hand[i] = { id: hand[i].id, side: roll(hand[i].id), re: true };
    // the sly ones nudge one bone once a game
    if (opp.style === 'sly' && !G0.cheated && Math.random() < .5) { const i = hand.findIndex(h => h.side === 'pukka' || h.side === 'tava'); if (i >= 0) { hand[i].side = 'olchi'; G0.cheated = true; G0.sawCheat = Math.random() < .5 + (FAC.check('agi', 6).ok ? .3 : 0); } }
    G0.op = hand;
    const sc = score(hand), b = bust(hand), got = b ? 0 : sc.total;
    G0.tot.op += got; G0.log.push({ who: 'op', got, bust: b });
    G0.msg = (b ? t(`They bust.|Перебор у соперника.|Raqib kuyib qoldi.`) : tf(`They score {n}.|У соперника {n}.|Raqibda {n}.`, { n: got })) + (G0.sawCheat && G0.cheated && !G0.sawShown ? ' ' + t(`(You saw a bone turn over under a finger.)|(Ты заметил, как альчик перевернули пальцем.)|(Oshiqni barmoq bilan ag'darishganini sezding.)`) : '');
    if (G0.sawCheat) G0.sawShown = true;
    sfx('roll');
    G0.phase = 'next';
  }
  function next() {
    if (G0.round >= 3) {
      const res = G0.tot.me > G0.tot.op ? 'win' : 'lose';
      G0.phase = 'end'; G0.res = res;
      const opp = G0.oppD;
      G0.msg = t(res === 'win' ? opp.win : opp.lose);
      sfx(res === 'win' ? 'victory' : 'denied');
      return;
    }
    G0.round++; G0.phase = 'throw'; G0.me = []; G0.op = []; G0.msg = tf(`Round {n}.|Раунд {n}.|{n}-raund.`, { n: G0.round });
  }
  function finish() {
    const res = G0.res, cb = G0.onEnd, s = S(), tot = G0.tot;
    if (res === 'win') s.wins[G0.opp] = (s.wins[G0.opp] || 0) + 1;
    save(); close();
    if (cb) setTimeout(() => cb(res, tot), 60);
  }
  OSHIQ.debugWin = () => { if (!G0.open) return; G0.tot.me = 99; G0.round = 3; G0.phase = 'next'; next(); };
  // the player's own cheat (side story 19): turn one bone over, an Agility check; caught = you lose at once
  function myCheat() {
    if (G0.cheatUsed || G0.phase !== 'choose') return;
    G0.cheatUsed = true;
    const ok = FAC.check('agi', 7).ok;
    if (!ok) { G0.tot.me = -99; G0.msg = t(`Caught. The bone is still under your finger when everyone looks.|Попался. Палец ещё лежит на альчике, когда все оборачиваются.|Qo'lga tushding. Hamma o'girilganda barmog'ing hali oshiq ustida.`); G0.round = 3; G0.phase = 'next'; G0.caught = true; next(); return; }
    const i = G0.me.findIndex(h => h.side === 'pukka' || h.side === 'tava'); if (i >= 0) G0.me[i].side = 'chikka';
    G0.msg = t(`A flick of the finger. Nobody saw. You think.|Щелчок пальцем. Никто не видел. Вроде бы.|Barmoq bilan bir chertish. Hech kim ko'rmadi. Shekilli.`);
  }
  window.addEventListener('keydown', e => {
    if (!G0.open) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (e.repeat) return;
    const c = e.code;
    if (G0.phase === 'throw') { if (c === 'Enter' || c === 'Space' || c === 'KeyJ') myThrow(); return; }
    if (G0.phase === 'choose') {
      if (c === 'ArrowLeft' || c === 'KeyA') { G0.sel = (G0.sel + 4) % 5; sfx('ui_move'); }
      if (c === 'ArrowRight' || c === 'KeyD') { G0.sel = (G0.sel + 1) % 5; sfx('ui_move'); }
      if (c === 'Space' || c === 'ArrowUp' || c === 'ArrowDown' || c === 'KeyW' || c === 'KeyS') { const i = G0.mark.indexOf(G0.sel); if (i >= 0) G0.mark.splice(i, 1); else G0.mark.push(G0.sel); sfx('ui_select'); }
      if (c === 'Enter' || c === 'KeyJ') { myRethrow(); }
      if (c === 'Escape' || c === 'KeyK') { G0.mark = []; endMine(); }
      if (c === 'KeyC' && G0.cheat) myCheat();
      return;
    }
    if (G0.phase === 'opp') { if (c === 'Enter' || c === 'Space' || c === 'KeyJ') oppTurn(); return; }
    if (G0.phase === 'next') { if (c === 'Enter' || c === 'Space' || c === 'KeyJ') next(); return; }
    if (G0.phase === 'end') { if (c === 'Enter' || c === 'Space' || c === 'KeyJ' || c === 'Escape') finish(); }
  }, true);
  window.addEventListener('keyup', e => { if (G0.open) e.stopImmediatePropagation(); }, true);

  /* ---------------------------------------------------------------- drawing */
  const font = (sz, w, serif) => `${w || 400} ${sz}px ${serif ? 'Georgia, serif' : 'system-ui, sans-serif'}`;
  const text = (ctx, s, x, y, o) => { o = o || {}; ctx.font = font(o.size || 6, o.weight, o.serif); ctx.textBaseline = 'top'; ctx.textAlign = o.align || 'left'; ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillText(s, x + .5, y + .5); ctx.fillStyle = o.color || '#f2e6c8'; ctx.fillText(s, x, y); };
  function bone(ctx, x, y, h, on, marked) {
    const b = BONE[h.id], col = b.col;
    ctx.save(); ctx.translate(x, y);
    // the knucklebone: a waisted block, the landed side marked
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-11, 12, 24, 3);
    ctx.fillStyle = col; ctx.fillRect(-10, -12, 20, 24); ctx.fillRect(-12, -8, 24, 16);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(-10, 2, 20, 10);
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-9, -11, 8, 3);
    ctx.fillStyle = '#3a2418';
    if (h.side === 'chikka') { ctx.fillRect(-2, -6, 4, 12); ctx.fillRect(-6, -2, 12, 4); }
    else if (h.side === 'olchi') { ctx.fillRect(-6, -5, 12, 3); ctx.fillRect(-6, 2, 12, 3); }
    else if (h.side === 'tava') { ctx.fillRect(-5, -2, 10, 4); }
    else { ctx.strokeStyle = '#3a2418'; ctx.lineWidth = 1; ctx.strokeRect(-5, -5, 10, 10); }
    if (marked) { ctx.strokeStyle = '#ff9a5a'; ctx.lineWidth = 1.2; ctx.strokeRect(-14, -15, 28, 30); }
    if (on) { ctx.fillStyle = '#ffe7a6'; ctx.fillRect(-2, -22, 4, 4); }
    ctx.restore();
  }
  function draw(ctx) {
    if (!G0.open) return;
    G0.t++;
    const W = G.W, H = G.H;
    ctx.save();
    ctx.globalAlpha = Math.min(1, G0.t / 8);
    ctx.fillStyle = '#0a0608'; ctx.fillRect(0, 0, W, H);
    // the felt: a carpet on the ground
    const X = 40, Y = 30, Wd = W - 80, Hd = H - 60;
    ctx.fillStyle = '#5a1a22'; ctx.fillRect(X, Y, Wd, Hd);
    ctx.fillStyle = '#7a2a2a'; ctx.fillRect(X + 4, Y + 4, Wd - 8, Hd - 8);
    ctx.strokeStyle = '#e2b452'; ctx.lineWidth = 1; ctx.strokeRect(X + 8, Y + 8, Wd - 16, Hd - 16);
    for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? '#1e2a5a' : '#e8c070'; ctx.fillRect(X + 12 + i * (Wd - 24) / 12, Y + 12, 4, 2); ctx.fillRect(X + 12 + i * (Wd - 24) / 12, Y + Hd - 14, 4, 2); }
    text(ctx, t(`Oshiq|Ошиқ|Oshiq`), W / 2, Y - 18, { size: 10, align: 'center', serif: true, color: '#ffe7a6', weight: 700 });
    text(ctx, t(G0.oppD.name), X + 16, Y + 18, { size: 6, color: '#e8d8b8' });
    text(ctx, tf(`Round {r}/3 · you {a} — {b}|Раунд {r}/3 · ты {a} — {b}|Raund {r}/3 · sen {a} — {b}`, { r: G0.round, a: G0.tot.me < -50 ? '—' : G0.tot.me, b: G0.tot.op }), X + Wd - 16, Y + 18, { size: 6, align: 'right', color: '#ffe7a6' });
    if (G0.stake) text(ctx, tf(`Stake: {n} tilla|Ставка: {n} тилла|Tikilgan: {n} tilla`, { n: G0.stake }), W / 2, Y + 18, { size: 5.5, align: 'center', color: '#c8b8a0' });
    // the opponent's bones (top), yours (bottom)
    const cx = W / 2;
    G0.op.forEach((h, i) => bone(ctx, cx + (i - 2) * 34, Y + 62, h, false, false));
    G0.me.forEach((h, i) => bone(ctx, cx + (i - 2) * 34, Y + Hd - 62, h, G0.phase === 'choose' && i === G0.sel, G0.mark.includes(i)));
    if (G0.me.length) { const sc = score(G0.me); text(ctx, tf(`{p} + combinations {c} = {t}|{p} + сочетания {c} = {t}|{p} + kombinatsiya {c} = {t}`, { p: sc.pts, c: sc.combo, t: sc.total }), cx, Y + Hd - 38, { size: 5.5, align: 'center', color: '#f2e6c8' }); }
    if (G0.phase === 'choose') { const h = G0.me[G0.sel]; text(ctx, t(BONE[h.id].name) + ' · ' + t(SIDE_NAME[h.side]), cx, Y + Hd - 94, { size: 5.5, align: 'center', color: '#ffe7a6' }); }
    // the message and the hint
    text(ctx, G0.msg || '', cx, H / 2 - 6, { size: 6.5, align: 'center', serif: true, color: '#ffe7a6' });
    const hint = {
      throw: `Enter: throw|Enter: бросить|Enter: tashlash`,
      choose: G0.cheat && !G0.cheatUsed ? `← →: bone · Space: mark to rethrow · Enter: rethrow · Esc: keep · C: cheat|← →: альчик · Пробел: отметить · Enter: перебросить · Esc: оставить · C: сжульничать|← →: oshiq · Bo'shliq: belgilash · Enter: qayta tashlash · Esc: qoldirish · C: aldash` : `← →: bone · Space: mark to rethrow · Enter: rethrow · Esc: keep|← →: альчик · Пробел: отметить · Enter: перебросить · Esc: оставить|← →: oshiq · Bo'shliq: belgilash · Enter: qayta tashlash · Esc: qoldirish`,
      opp: `Enter: their throw|Enter: бросок соперника|Enter: raqibning tashlashi`, next: `Enter: next|Enter: дальше|Enter: davom`, end: `Enter: get up from the carpet|Enter: встать с ковра|Enter: gilamdan turish`
    }[G0.phase];
    text(ctx, t(hint), cx, Y + Hd + 6, { size: 5, align: 'center', color: '#9a8a78' });
    text(ctx, t(`Chikka 3 · Olchi 2 · Tava 1 · Pukka 0 · pair +2, three +5, four +10, five +20, all four sides +6 · 3 empties after a rethrow = 0|Чикка 3 · Олчи 2 · Тава 1 · Пукка 0 · пара +2, три +5, четыре +10, пять +20, все четыре стороны +6 · 3 пустых после переброса = 0|Chikka 3 · Olchi 2 · Tava 1 · Pukka 0 · juft +2, uchta +5, to'rtta +10, beshta +20, to'rt tomon +6 · qayta tashlashdan keyin 3 bo'sh = 0`), cx, Y + 26, { size: 4.2, align: 'center', color: '#c8b8a0' });
    ctx.restore();
  }
  G.Events.on('boot', () => { SMOOTH_DRAW.push(ctx => { try { draw(ctx); } catch (e) { console.error('[oshiq]', e); } }); });

  /* ---------------------------------------------------------------- the opponents in the world */
  const BEAT_ALL = ['oysha', 'kamol', 'zebo', 'davron', 'nodir', 'gulnora', 'malik', 'tolib', 'mavluda', 'yoqub', 'tura'];
  for (const k in OPP) {
    if (k === 'sanjar') continue;
    const o = OPP[k];
    FAC.spot(o.region, 'osh_' + k, o.frac);
    FAC.npc('osh_' + k, { name: o.name, look: o.look, dx: 0, prompt: `Play Oshiq|Сыграть в Ошиқ|Oshiq o'ynash`, idle: o.hi }, () => [{ from: 8, to: 22, region: o.region, spot: 'osh_' + k }]);
    FAC.talk['osh_' + k] = d => {
      const stake = o.stake;
      play([['op_' + k, o.hi]], () => ask(tf(`Stake {n} tilla?|Ставка — {n} тилла?|{n} tilla tikasanmi?`, { n: stake }), [
        { id: 'play', label: t(`Sit down on the carpet.|Сесть на ковёр.|Gilamga o'tirish.`) },
        { id: 'no', label: t(`Not now.|Не сейчас.|Hozir emas.`) }
      ], c => {
        if (c.id !== 'play') { d(); return; }
        if ((G.run.gold || 0) < stake) { play([['op_' + k, `Come back with tilla. I don't play for promises.|Приходи с тиллой. На обещания я не играю.|Tilla bilan kel. Va'daga o'ynamayman.`]], d); return; }
        OSHIQ.play({ opp: k, stake, onEnd: res => {
          if (res === 'win') { gold(stake); if (o.prize) OSHIQ.give(o.prize); } else gold(-stake);
          d();
        } });
      }));
    };
  }
  // the tournament (act II, the Bazaar): beat four of the city's players in a row, then Sanjar
  FAC.spot('bazaar', 'osh_sanjar', OPP.sanjar.frac);
  FAC.npc('osh_sanjar', { name: OPP.sanjar.name, look: OPP.sanjar.look, dx: 0, prompt: `The Oshiq tournament|Турнир по Ошиқ|Oshiq musobaqasi`, idle: OPP.sanjar.hi }, () => (G.WORLD2 && G.WORLD2.moonPhase() >= 1 ? [{ from: 16, to: 23, region: 'bazaar', spot: 'osh_sanjar' }] : []));
  FAC.talk.osh_sanjar = d => {
    const s = S(), beaten = BEAT_ALL.filter(k => s.wins[k]).length;
    if (s.champion) { play([['op_sanjar', `Champion. People keep asking me what you're like. I tell them: like a bad week.|Чемпион. Меня все спрашивают, какой ты. Говорю: как плохая неделя.|Chempion. Hamma mendan qanaqaligingni so'raydi. Aytaman: yomon haftadek.`]], d); return; }
    if (beaten < 4) { play([['op_sanjar', tf(`Beat four of the city's players first. You've beaten {n}. I'll wait. I'm good at waiting; I always win at the end.|Сначала обыграй четверых в городе. Ты обыграл {n}. Я подожду. Ждать я умею: в конце всегда выигрываю.|Avval shahardagi to'rtta o'yinchini yut. Sen {n} tasini yutding. Kutaman. Kutishni bilaman: oxirida doim yutaman.`, { n: beaten })]], d); return; }
    play([['op_sanjar', OPP.sanjar.hi]], () => OSHIQ.play({ opp: 'sanjar', stake: 60, onEnd: res => {
      if (res === 'win') { s.champion = 1; save(); gold(60); OSHIQ.give('king'); G.ACH && G.ACH.unlock && G.ACH.unlock('oshiq_champion'); }
      else gold(-Math.min(60, G.run.gold || 0));
      d();
    } }));
  };
  // alchiks found in the world (five of the thirty): a glint where someone dropped one
  const FOUND = [['tail', .82, 'moon'], ['streets', .62, 'sand'], ['cistern', .4, 'ember'], ['old', .55, 'pomegranate'], ['dream', .6, 'dragon']];
  const FOUND2 = [['potters', .4, 'wolf'], ['ark', .66, 'golden'], ['cloister', .25, 'wax'], ['heart', .5, 'heart'], ['karez', .7, 'remember'], ['spine', .8, 'ice'], ['rabat', .2, 'silk'], ['withers', .3, 'apricot'], ['tower', .45, 'lead'], ['well', .5, 'twin'], ['wedding', .5, 'divan'], ['sand', .5, 'dutar']];
  for (const [r, fr, id] of FOUND.concat(FOUND2)) {
    FAC.spot(r, 'oshf_' + id, fr);
    FAC.prop(r, 'oshf_' + id, { id: 'oshf_' + id, art: 'f6glint', prompt: `An alchik in the dust|Альчик в пыли|Changdagi oshiq`, when: () => !S().coll[id], use: d => { OSHIQ.give(id); d(); } });
  }
  // the bag: which five you play with (asked at any chaikhana: "Choose your alchiks")
  G.WORLD2.restOpts.push(() => (OSHIQ.count() > 1 ? { label: t(`Choose your five alchiks|Выбрать пять альчиков|Beshta oshiqni tanlash`), run: () => choose(0) } : null));
  function choose(slot) {
    const s = S();
    if (slot >= 5) { save(); return; }
    const own = Object.keys(s.coll).filter(id => BONE[id]);
    ask(tf(`Alchik {n} of 5|Альчик {n} из 5|Oshiq {n}/5`, { n: slot + 1 }), own.map(id => ({ id, label: t(BONE[id].name) + (s.bag[slot] === id ? ' ◆' : '') })).concat([{ id: '_done', label: t(`Done|Готово|Tayyor`) }]), o => {
      if (o.id === '_done') { save(); return; }
      s.bag[slot] = o.id; choose(slot + 1);
    });
  }
}
