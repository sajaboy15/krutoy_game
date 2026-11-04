/* 89j_hunts.js — the hunt (GDD ch. 20 "Охота"): ten contracts on elite creatures, posted on the board in the big
   chaikhanas. Take one, go to its region: find the tracks and taste them (you learn its weak spot: it comes at you a
   quarter weaker), then find it and kill it — or, for three of them, find out the "monster" is a Hollow defending his
   home, and decide. Rewards: tilla, an alchik or a charm, standing.
   State: R().hunt = { taken: {id:1}, done: {id: 'killed'|'spared'}, tasted: {id:1} }. Quests 'h_*' (journal: Hunt). */
const HUNT = G.HUNT = {};
{
  REP_NAME.hunt = `Hunt|Охота|Ov`;
  const S = HUNT.S = () => { const r = R(); if (!r.hunt || typeof r.hunt !== 'object') r.hunt = {}; const h = r.hunt; for (const k of ['taken', 'done', 'tasted']) if (!h[k]) h[k] = {}; return h; };
  // id: region, enemy, name, where (tracks, lair), reward, twist (a Hollow defending his home), what the tracks show
  const H = HUNT.LIST = [
    { id: 'jackal', region: 'rabat', enemy: 'yd_scavenger', reward: 70, tracks: .3, lair: .83,
      name: `The Salt Jackal|Солёный шакал|Tuz chiyabo'ri`, post: `Something takes goats from the caravans at night and leaves the bones salted. Seventy tilla.|Что-то по ночам таскает коз из караванов и оставляет кости посоленными. Семьдесят тилла.|Nimadir kechalari karvonlardan echki o'g'irlab, suyaklarini tuzlab qoldiradi. Yetmish tilla.`,
      taste: `A scavenger, bigger than they come, with a burn scar on its left side. It always turns right when it runs.|Падальщик, крупнее обычного, с ожогом на левом боку. Убегая, всегда сворачивает вправо.|Odatdagidan katta o'laksaxo'r, chap biqinida kuyik izi. Qochganda doim o'ngga buriladi.` },
    { id: 'kiln', region: 'potters', enemy: 'yd_hollow', reward: 60, tracks: .2, lair: .66, twist: true,
      name: `The Kiln Ghoul|Печной гуль|Xumdon g'uli`, post: `A thing in the old kilns throws hot clay at anyone who comes near. Sixty tilla, from the guild.|Тварь в старых печах швыряет горячей глиной в каждого, кто подойдёт. Шестьдесят тилла, от цеха.|Eski xumdonlardagi maxluq yaqinlashgan har kimga issiq loy otadi. Oltmish tilla, sexdan.`,
      taste: `Not a beast. A man, Hollow, who fires bowls in a dead kiln every night and lines them up by a doorway, as if waiting for someone to come home and eat.|Не зверь. Человек, Пустой, который каждую ночь обжигает чаши в мёртвой печи и расставляет их у порога — будто ждёт, что кто-то вернётся домой поесть.|Hayvon emas. Bo'sh odam, u har kecha o'lik xumdonda kosa pishirib, ularni ostona yoniga terib qo'yadi — go'yo kimdir ovqatlangani uyga qaytishini kutayotgandek.`,
      meet: `The "ghoul" stands in the kiln's doorway with a hot bowl in each hand. Behind him, a row of clean bowls and a child's cot, empty and dusted.|«Гуль» стоит в дверях печи с горячей чашей в каждой руке. За ним — ряд чистых чаш и детская кроватка, пустая и протёртая от пыли.|«G'ul» xumdon eshigida har bir qo'lida issiq kosa bilan turibdi. Ortida — toza kosalar qatori va bo'sh, changi artilgan bolalar beshigi.` },
    { id: 'roofjinn', region: 'bazaar', enemy: 'jinn', reward: 90, tracks: .45, lair: .78,
      name: `The Roof Jinn|Крышный джинн|Tom jini`, post: `A jinn walks the Bazaar roofs at night and steals lanterns. The Copper Row pays ninety.|Джинн гуляет ночью по крышам Базара и ворует фонари. Медный ряд платит девяносто.|Jin kechalari Bozor tomlarida yurib, chiroqlarni o'g'irlaydi. Mis rastasi to'qson to'laydi.`,
      taste: `It hoards the lanterns in the minaret, all lit. It's afraid of the dark. It hits hard from above and badly from below.|Фонари он копит в минарете, все зажжённые. Он боится темноты. Сверху бьёт сильно, снизу — плохо.|Chiroqlarni minorada yig'adi, hammasi yonib turibdi. U qorong'idan qo'rqadi. Tepadan qattiq uradi, pastdan — yomon.` },
    { id: 'crows', region: 'tower', enemy: 'kempir_crow', reward: 50, tracks: .2, lair: .9,
      name: `The Mother of Crows|Мать ворон|Qarg'alar onasi`, post: `A crow the size of a dog leads the flocks at the Tower. It took a mourner's eye. Fifty tilla, from the keeper.|Ворона размером с собаку водит стаи у Башни. Выклевала глаз скорбящему. Пятьдесят тилла, от смотрителя.|Minora oldida it kattaligidagi qarg'a galalarni boshqaradi. Bir motamsaroning ko'zini cho'qib olgan. Ellik tilla, qorovuldan.`,
      taste: `She nests in the heaps of empty tumars and pecks the wax for leftovers. She's old, and her left wing drags.|Гнездится в кучах пустых тумаров и клюёт воск — ищет остатки. Она старая, левое крыло волочится.|U bo'sh tumarlar uyumida in qurgan, mumni cho'qib, qoldiq qidiradi. U qari, chap qanoti sudraladi.` },
    { id: 'leech', region: 'cistern', enemy: 'yd_leech', reward: 80, tracks: .25, lair: .7,
      name: `The Leech Queen|Пиявочная царица|Zuluk malikasi`, post: `Something in the cistern drinks the boatmen. The ferry guild pays eighty.|Что-то в цистерне выпивает лодочников. Цех перевозчиков платит восемьдесят.|Sardobadagi nimadir qayiqchilarni so'rib oladi. Qayiqchilar sexi sakson to'laydi.`,
      taste: `Fat with memory, slow on dry stone. Drag it out of the water and it's half as dangerous.|Раздутая от памяти, медленная на сухом камне. Вытащи её из воды — и она вдвое менее опасна.|Xotiradan semirgan, quruq toshda sekin. Uni suvdan chiqarsang — xavfi ikki baravar kamayadi.` },
    { id: 'street', region: 'streets', enemy: 'yd_walker', reward: 70, tracks: .25, lair: .55, twist: true,
      name: `The Thing in the Swallowed House|Тварь в проглоченном доме|Yutilgan uydagi maxluq`, post: `Something in a buried house mauls scavengers who go in. The salvagers pay seventy.|Что-то в засыпанном доме калечит падальщиков, которые туда суются. Старьёвщики платят семьдесят.|Ko'milgan uydagi nimadir kirgan o'laksaxo'rlarni majruh qiladi. Eskifurushlar yetmish to'laydi.`,
      taste: `A Hollow man who still lives in the house the earth swallowed. He sweeps it. He sets the table. He fights whoever comes to take the plates.|Пустой, который так и живёт в доме, проглоченном землёй. Подметает. Накрывает на стол. Дерётся с каждым, кто приходит за тарелками.|Yer yutib yuborgan uyda hamon yashayotgan Bo'sh odam. Supuradi. Dasturxon yozadi. Likopchalarga kelganlar bilan urishadi.`,
      meet: `In the swallowed house the table is set for four. The "thing" stands between you and the plates, shaking, a broom raised like a sword.|В проглоченном доме стол накрыт на четверых. «Тварь» стоит между тобой и тарелками, трясётся, метла поднята, как сабля.|Yutilgan uyda to'rt kishilik dasturxon yozilgan. «Maxluq» sen bilan likopchalar orasida titrab turibdi, supurgisini qilichdek ko'targan.` },
    { id: 'brute', region: 'mines', enemy: 'jailer', reward: 100, tracks: .35, lair: .9, twist: true,
      name: `The Salt Brute|Соляной громила|Tuz bahaybati`, post: `A giant convict broke his chains and kills overseers in the lower gallery. The Divan pays a hundred.|Каторжник-великан порвал цепи и убивает надсмотрщиков в нижней галерее. Диван платит сто.|Bahaybat mahkum zanjirini uzib, pastki yo'lakda nazoratchilarni o'ldiryapti. Devon yuz to'laydi.`,
      taste: `Hollow, nearly. He guards a crack in the salt. Behind it someone small breathes.|Почти Пустой. Сторожит трещину в соли. За ней кто-то маленький дышит.|Deyarli Bo'sh. Tuzdagi yoriqni qo'riqlaydi. Uning ortida kimdir kichkina nafas oladi.`,
      meet: `The brute stands in front of a crack in the salt wall. Two children peer out from behind his legs. He doesn't attack. He waits.|Громила стоит перед трещиной в соляной стене. Из-за его ног выглядывают двое детей. Он не нападает. Ждёт.|Bahaybat tuz devoridagi yoriq oldida turibdi. Oyoqlari orqasidan ikki bola mo'ralayapti. U hujum qilmaydi. Kutyapti.` },
    { id: 'karez', region: 'karez', enemy: 'yd_albasty_kin', reward: 90, tracks: .35, lair: .65,
      name: `The Drowner|Утопительница|Cho'ktiruvchi`, post: `Something pulls water-carriers into the deep channels. The mirabs pay ninety.|Что-то утаскивает водоносов в глубокие каналы. Мирабы платят девяносто.|Nimadir mesqobchilarni chuqur kanallarga tortib ketadi. Miroblar to'qson to'laydi.`,
      taste: `Albasty's kin. Her hair is the danger, not her hands. Cut the hair and she's only a drowned woman.|Родня Албасты. Опасны волосы, а не руки. Отсеки волосы — и она просто утопленница.|Albasti zoti. Xavfli — sochi, qo'li emas. Sochini kessang — shunchaki cho'kkan ayol.` },
    { id: 'spine', region: 'spine', enemy: 'ibex_spirit', reward: 110, tracks: .2, lair: .7,
      name: `The White Ibex|Белый козерог|Oq tog' echkisi`, post: `A ghost-ibex knocks travellers off the vertebrae. The bell-hanger pays a hundred and ten.|Призрачный козерог сбрасывает путников с позвонков. Звонарь платит сто десять.|Arvoh tog' echkisi yo'lovchilarni umurtqalardan uloqtiradi. Qo'ng'iroqchi bir yuz o'n to'laydi.`,
      taste: `It charges at bells. Silence your step and it loses you.|Бросается на звон. Приглуши шаг — и он тебя теряет.|Jiringga tashlanadi. Qadamingni ovozsiz qil — seni yo'qotadi.` },
    { id: 'old', region: 'old', enemy: 'yd_founder_guard', reward: 130, tracks: .3, lair: .8,
      name: `The Founders' Last Guard|Последний страж основателей|Asoschilarning so'nggi qo'riqchisi`, post: `A guard in founders' armour still patrols Old Yodgor and kills anyone without the old password. Those Who Remember pay a hundred and thirty.|Страж в доспехе основателей до сих пор обходит Старый Ёдгор и убивает всякого без старого пароля. Помнящие платят сто тридцать.|Asoschilar sovutidagi qo'riqchi hamon Eski Yodgorni aylanib, eski parolni bilmagan har kimni o'ldiradi. Eslaydiganlar bir yuz o'ttiz to'laydi.`,
      taste: `He patrols the same circle every hour. His left knee was broken long ago and never healed.|Каждый час он обходит один и тот же круг. Левое колено у него давно сломано и так и не срослось.|U har soat bir xil aylanani aylanadi. Chap tizzasi qachonlardir singan va bitmagan.` }
  ];
  for (const h of H) {
    FAC.quest('h_' + h.id, { fac: 'hunt', title: h.name });
    FAC.spot(h.region, 'ht_' + h.id, h.tracks);
    FAC.spot(h.region, 'hl_' + h.id, h.lair);
    // the tracks: taste them to learn the weak spot
    FAC.prop(h.region, 'ht_' + h.id, { id: 'ht_' + h.id, art: 'f6glint', prompt: `Taste the tracks|Испить следы|Izlarni totib ko'rish`, when: () => S().taken[h.id] && !S().done[h.id] && !S().tasted[h.id], use: d => FAC.taste([['memory', h.taste]], () => {
      S().tasted[h.id] = 1; save();
      FAC.stepTo('h_' + h.id, h.taste);
      d();
    }, { intro: `You crouch over the tracks and press two fingers into them, then to your lips.|Ты присаживаешься над следами, касаешься их двумя пальцами, потом губ.|Izlar ustiga cho'kkalab, ularga ikki barmog'ingni tekkizasan, keyin labingga.` }) });
  }
  const byId = id => H.find(h => h.id === id);

  // the target: spawned at its lair when you come into the region with the contract taken
  HUNT.live = [];
  G.WORLD2.onEnter('*', (def, info) => {
    HUNT.live.length = 0;
    const s = S();
    for (const h of H) {
      if (h.region !== def.id || !s.taken[h.id] || s.done[h.id]) continue;
      const at = info.level.w2 && info.level.w2.spots && info.level.w2.spots['hl_' + h.id]; if (!at) continue;
      let e = null;
      try { e = G.Enemies.spawn(h.enemy, at.x, at.y - 6, { elite: true }); } catch (x) { console.error('[hunt]', x); }
      if (!e) continue;
      e._hunt = h.id; e.aggro = false; HUNT.live.push(e);
      if (s.tasted[h.id]) { e.maxHp = Math.round(e.maxHp * .75); e.hp = e.maxHp; }
    }
  });
  // the turn (three of them) and the end of a contract
  let tk = 0;
  G.WORLD2.ticks.push(() => {
    if (++tk % 20 || !G.world) return;
    const s = S(), p = G.world.player; if (!p) return;
    for (const e of HUNT.live.slice()) {
      const h = byId(e._hunt);
      if (s.done[h.id]) { HUNT.live.splice(HUNT.live.indexOf(e), 1); continue; }
      if (e.dead || e.hp <= 0) { HUNT.live.splice(HUNT.live.indexOf(e), 1); finish(h, 'killed'); continue; }
      if (h.twist && !e._met && !e.dead && Math.abs(e.x - p.x) < 110 && Math.abs(e.y - p.y) < 80 && quiet()) { e._met = true; meet(h, e); }
    }
  });
  function finish(h, how) {
    const s = S(); s.done[h.id] = how; save();
    if (how === 'killed') { gold(h.reward); }
    FAC.finish('h_' + h.id, how, how === 'killed' ? tf(`Contract closed: {n}. {r} tilla.|Заказ закрыт: {n}. {r} тилла.|Buyurtma yopildi: {n}. {r} tilla.`, { n: t(h.name), r: h.reward }) : `You let it live. No reward.|Ты оставил его в живых. Без награды.|Uni tirik qoldirding. Mukofotsiz.`);
    if (G.ACH && G.ACH.check) G.ACH.check();
  }
  function meet(h, e) {
    const keep = { hp: e.hp }; e.aggro = false; e.vx = 0;
    scene(done => play([['', h.meet]], () => ask(`The contract says "monster".|В заказе написано «чудовище».|Buyurtmada «maxluq» deb yozilgan.`, [
      { id: 'kill', label: `Do the job.|Сделать работу.|Ishni bajarish.` },
      { id: 'spare', label: `Walk away. Tell the board it's gone.|Уйти. Сказать доске заказов, что тварь ушла.|Ketish. Buyurtmalar taxtasiga maxluq ketdi, deyish.` }
    ], o => {
      if (o.id === 'spare') { e.dead = true; rep('tail', 2); FAC.react({ alp: 10, nargiza: 10, surayyo: 10 }, 'hunt'); finish(h, 'spared'); done(); return; }
      e.aggro = true; e.hp = keep.hp; FAC.react({ nargiza: -10, alp: -5 }, 'hunt'); done();
    })));
  }

  // the board, in the chaikhana's menu
  G.WORLD2.restOpts.push(() => {
    const s = S(), open = H.filter(h => !s.taken[h.id] && !s.done[h.id]);
    if (!open.length && !H.some(h => s.taken[h.id] && !s.done[h.id])) return null;
    return { label: t(`The hunt board|Доска заказов на охоту|Ov buyurtmalari taxtasi`), run: () => board() };
  });
  function board() {
    const s = S(), list = H.filter(h => !s.done[h.id]);
    ask(t(`The hunt board. Paper nailed over paper.|Доска заказов. Бумага прибита поверх бумаги.|Ov buyurtmalari taxtasi. Qog'oz ustiga qog'oz mixlangan.`), list.map(h => ({ id: h.id, label: t(h.name) + (s.taken[h.id] ? ' ◆' : '') + ' — ' + t(G.WORLD2.regions[h.region].name) + ' · ' + h.reward })).concat([{ id: null, label: t(`Leave the board|Отойти от доски|Taxtadan uzoqlashish`) }]), o => {
      if (!o.id) return;
      const h = byId(o.id);
      if (s.taken[h.id]) { play([['', h.post]], () => board()); return; }
      play([['', h.post]], () => ask(t(h.name), [{ id: 'take', label: t(`Take the contract.|Взять заказ.|Buyurtmani olish.`) }, { id: 'no', label: t(`Leave it.|Оставить.|Qoldirish.`) }], c => {
        if (c.id === 'take') { s.taken[h.id] = 1; save(); FAC.begin('h_' + h.id, h.post, [h.region, 'ht_' + h.id]); }
      }));
    });
  }
}
