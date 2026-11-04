/* 89b_world_folk.js — people and small finds along the regions that were empty (with 89_world_dress.js).
   One local in each (a W2.npc on a new spot, all day) and two traces: something seen up close that tells a bit of the
   place (relic objects: lines, sometimes a few coins). No story flags, no Hollowness; nothing touches Sado (spoiler rule). */
{
(function worldFolk() {
  if (!W2 || !W2.regions) { console.error('[folk] no world'); return; }
  const OA = G.ObjArt;
  // a trace on the ground: a small glint, so the eye finds it
  if (OA) {
    OA.w2trace = (ctx, o) => { const x = Math.round(o.x), y = Math.round(o.y), k = (G.time || 0) * 3 + x; ctx.fillStyle = '#e8dcc0'; ctx.fillRect(x - 3, y - 2, 7, 2); ctx.fillStyle = '#fff4d0'; if (Math.sin(k) > .6) ctx.fillRect(x, y - 5, 1, 3); };
    OA.w2traceFx = (ctx, o) => G.Glow.add(o.x, o.y - 3, 9, '#ffe7a6', .25 + .2 * Math.sin((G.time || 0) * 3 + o.x));
  }
  const LOOK = `Look closer|Присмотреться|Yaqinroq qarash`;
  const trace = (id, frac, lines, gold) => ({ kind: 'relic', id, at: { frac }, art: 'w2trace', prompt: LOOK, lines, gold });
  const add = (region, ...objs) => { const r = W2.regions[region]; if (!r || !r.objects) { console.warn('[folk] no region', region); return; } r.objects.push(...objs); };
  // a local: the first talk is a short exchange, later only the last word
  function local(id, region, frac, def, first, again) {
    add(region, { kind: 'spot', id: 'folk_' + id, at: { frac } });
    W2.npc('folk_' + id, {
      name: def.name, look: def.look, prompt: def.prompt,
      talk(done) {
        const k = 'folk:' + id, R0 = R();
        if (!(R0.at && R0.at[k])) { R0.at = R0.at || {}; R0.at[k] = 1; play(first, done); }
        else play([['', again]], done);
      }
    });
    W2.schedule('folk_' + id, [{ from: 0, to: 24, region, spot: 'folk_' + id }]);
  }

  /* ---------------------------------------------------------------- the Swallowed Streets */
  local('broom', 'streets', 0.25, { name: `Old Zulfiya|Старая Зульфия|Zulfiya momo`, look: 'tailwoman', prompt: `Talk to the old woman|Поговорить со старушкой|Kampir bilan gaplashish` }, [
    ['', `"Mind the step, it's swept. I sweep it every morning. Twenty years now. The house is under the earth, but the step is mine."|«Осторожно, порог подметён. Я каждое утро мету. Двадцать лет уже. Дом под землёй, а порог-то мой».|«Ehtiyot bo'l, ostona supurilgan. Har tong supuraman. Yigirma yildan beri. Uy yer ostida qoldi, ostona baribir meniki».`],
    ['hero', `Who do you sweep it for?|Для кого метёшь?|Kim uchun supurasan?`],
    ['', `"For the neighbours. They'll come back one day and say: Zulfiya kept the street. Let them say it."|«Для соседей. Вернутся когда-нибудь и скажут: Зульфия улицу сберегла. Пусть скажут».|«Qo'shnilar uchun. Bir kun qaytib kelishadi-yu, «Zulfiya ko'chani asrab qoldi» deyishadi. Aytishsin».`]
  ], `"Wipe your feet. Everyone's welcome, but wipe your feet."|«Ноги вытри. Всем рады, но ноги вытри».|«Oyog'ingni art. Hammaga eshik ochiq, faqat oyog'ingni art».`);
  add('streets',
    trace('slate', 0.5, [
      ['', `A school slate in a doorway, the chalk still on it: a sum, half done. Seven and six. The answer was never written.|В дверном проёме — грифельная доска, мел ещё держится: пример, решённый наполовину. Семь и шесть. Ответ так и не дописали.|Eshik o'rnida maktab taxtachasi, bo'r izlari hali turibdi: yarim yechilgan misol. Yetti qo'shuv olti. Javobi yozilmay qolgan.`],
      ['hero', `Thirteen.|Тринадцать.|O'n uch.`]
    ]),
    trace('pot', 0.92, [
      ['', `A copper pot sealed with wax, hidden in a tandir. Inside: coins, and a note: "For whoever digs us out. Drink to the Copper Row."|В тандыре спрятан медный котелок, залитый воском. Внутри монеты и записка: «Тому, кто нас откопает. Выпей за Медный ряд».|Tandirga mum bilan berkitilgan mis qozoncha yashirilgan. Ichida tangalar va xat: «Bizni qazib olgan kishiga. Mis rastasi uchun bir piyola ich».`]
    ], 45));

  /* ---------------------------------------------------------------- the Salt Mines */
  local('tally', 'mines', 0.45, { name: `A debtor with a tally stick|Должник с биркой|Birkali qarzdor`, look: 'tailman', prompt: `Talk to the debtor|Поговорить с должником|Qarzdor bilan gaplashish` }, [
    ['', `"Three hundred and twelve days. Forty-one to go. A notch for every one — the overseer's count and mine never agree."|«Триста двенадцать дней. Осталось сорок один. Каждый день — зарубка. У надсмотрщика счёт свой, у меня свой, и они не сходятся».|«Uch yuz o'n ikki kun. Qirq bir kun qoldi. Har kuniga bitta chiziq. Nazoratchining hisobi boshqa, meniki boshqa — hech to'g'ri kelmaydi».`],
    ['hero', `Whose count wins?|И чей счёт верный?|Qaysi biri to'g'ri?`],
    ['', `"His. Mine is so I don't forget I'm counting."|«Его, конечно. А мой — чтобы не забыть, что я считаю».|«Albatta, uniki. Meniki esa — sanayotganimni unutmaslik uchun».`]
  ], `"Three hundred and twelve. No — thirteen. See? That's why I cut them."|«Триста двенадцать. Нет, тринадцать. Видишь? Поэтому и режу».|«Uch yuz o'n ikki. Yo'q, o'n uch. Ko'rdingmi? Shuning uchun chizaman».`);
  add('mines',
    trace('boots', 0.15, [
      ['', `Worn boots nailed to a timber, white with salt. Carved underneath: "Bakhtiyor paid his last day. Walked out barefoot. Said the boots belong to the mine."|Стоптанные сапоги прибиты к крепи, белые от соли. Под ними вырезано: «Бахтиёр отработал последний день. Ушёл босиком. Сказал, сапоги пусть шахте остаются».|Yirtiq etik ustunga mixlab qo'yilgan, tuzdan oppoq. Tagiga o'yib yozilgan: «Baxtiyor oxirgi kunini ishlab berdi. Yalangoyoq chiqib ketdi. Etik konda qolsin, dedi».`]
    ]),
    trace('stash', 0.78, [
      ['', `A hollow in the salt, plugged with a rag. Somebody's savings: coins wrapped in a page of a debt book, the name scraped off.|Ниша в соли, заткнутая тряпкой. Чья-то заначка: монеты, завёрнутые в лист долговой книги, имя соскоблено.|Tuzdagi kovak, latta bilan tiqib qo'yilgan. Kimningdir jamg'armasi: qarz daftarining varag'iga o'ralgan tangalar, ismi qirib tashlangan.`],
      ['hero', `Scraped off. Smart.|Соскоблено. Умно.|Qirib tashlangan. Aqlli ish.`]
    ], 50));

  /* ---------------------------------------------------------------- the Tower of Silence */
  local('keeper', 'tower', 0.62, { name: `The keeper of the empty|Смотритель пустых|Bo'shlar qorovuli`, look: 'elder', prompt: `Talk to the keeper|Поговорить со смотрителем|Qorovul bilan gaplashish` }, [
    ['', `"They bring them here when they're empty. Not the people — the tumars. People we bury down the hill, like anyone."|«Сюда несут, когда опустеют. Не людей — тумары. Людей хороним под холмом, как всех».|«Bo'shab qolganda shu yerga olib kelishadi. Odamlarni emas — tumarlarni. Odamlarni tepalik ostiga ko'mamiz, hammanikidek».`],
    ['hero', `And the crows?|А вороны?|Qarg'alar-chi?`],
    ['', `"They peck the wax. Hoping something's left. Nothing ever is — but I don't chase them. Hope is a hard habit to lose."|«Клюют воск. Надеются, вдруг что осталось. Никогда не остаётся — но я их не гоняю. От надежды трудно отвыкнуть».|«Mumni cho'qishadi. Balki biror narsa qolgandir, deb umid qilishadi. Hech qachon qolmaydi — lekin men ularni haydamayman. Umiddan voz kechish qiyin».`]
  ], `"Mind the heaps. Each one was somebody's wedding once."|«Под ноги смотри. Каждая куча когда-то была чьей-то свадьбой».|«Oyog'ingga qara. Har bir uyum qachonlardir kimningdir to'yi bo'lgan».`);
  add('tower',
    trace('stamp', 0.25, [
      ['', `One tumar in the heap is still sealed. The wax carries the Divan's stamp and a date: last spring. Empty like the rest — but it was sold as full.|В куче один тумар ещё запечатан. На воске — клеймо Дивана и дата: прошлая весна. Пустой, как все, — но продан был как полный.|Uyumda bitta tumar hali muhrlangan. Mumida Devon tamg'asi va sana: o'tgan bahor. Boshqalari kabi bo'm-bo'sh — lekin to'la deb sotilgan.`],
      ['hero', `Sold as full. Someone got rich on that.|Продан как полный. Кто-то на этом нажился.|To'la deb sotilgan. Kimdir bundan boyib ketgan.`]
    ]),
    trace('coins', 0.86, [
      ['', `Under a stele, coins left for the dead: a custom older than the Singers. Nobody takes them. Almost nobody.|Под стелой — монеты, оставленные мёртвым: обычай старше Певцов. Их никто не берёт. Почти никто.|Tosh ostida o'liklarga qoldirilgan tangalar: xonandalardan ham eski odat. Ularni hech kim olmaydi. Deyarli hech kim.`]
    ], 35));

  /* ---------------------------------------------------------------- the Rabat */
  local('salt', 'rabat', 0.4, { name: `A salt seller|Торговка солью|Tuz sotuvchi ayol`, look: 'caravan', prompt: `Talk to the salt seller|Поговорить с торговкой|Tuzchi ayol bilan gaplashish` }, [
    ['', `"Salt from the flats, ten coins a block. In the city they sell it for forty and call it the Sleeper's tears. It's salt. I dig it."|«Соль с солончака, десять монет за брус. В городе её продают за сорок и зовут слезами Спящего. Это соль. Я её копаю».|«Sho'rxokdan tuz, bir g'ishti o'n tanga. Shaharda qirqqa sotib, «Uxlovchining ko'z yoshi» deyishadi. Bu tuz. Uni men qazib olaman».`],
    ['hero', `And nobody takes the tithe from you out here?|А с тебя здесь десятину не берут?|Bu yerda sendan ushr olishmaydimi?`],
    ['', `"Forty days you're a guest. After that you're a debtor or a road. I leave on the thirty-ninth and come back on the first."|«Сорок дней ты гость. Потом — или должник, или дорога. Я ухожу на тридцать девятый и возвращаюсь в первый».|«Qirq kun mehmonsan. Keyin — yo qarzdor, yo yo'l. Men o'ttiz to'qqizinchi kuni ketaman, birinchi kuni qaytaman».`]
  ], `"Ten coins a block. Tell them in the city — ten."|«Десять монет за брус. Так и передай в городе — десять».|«Bir g'ishti o'n tanga. Shaharda ham shunday ayt — o'n».`);
  add('rabat',
    trace('names', 0.33, [
      ['', `Scratched into the caravanserai wall, row after row: names and the day each one left. Some have a second line: "came back".|На стене караван-сарая нацарапано, ряд за рядом: имена и день, когда каждый ушёл. У некоторых есть вторая строчка: «вернулся».|Karvonsaroy devoriga qator-qator tirnab yozilgan: ismlar va har biri ketgan kun. Ba'zilarining tagida yana bir satr: «qaytdi».`],
      ['hero', `Not many second lines.|Вторых строчек немного.|Ikkinchi satrlar kam.`]
    ]),
    trace('bell', 0.86, [
      ['', `A camel bell with a coin hammered inside to keep it quiet. A smuggler's trick. Whoever left it never came back for it.|Верблюжий колокольчик, внутрь вбита монета, чтобы молчал. Уловка контрабандистов. Хозяин за ним так и не вернулся.|Ichiga tanga qoqilgan tuya qo'ng'irog'i — jiringlamasin deb. Kontrabandachilarning hiylasi. Egasi uni olgani qaytmagan.`]
    ], 30));

  /* ---------------------------------------------------------------- the Withers */
  local('silence', 'withers', 0.35, { name: `A trader from beyond the edge|Торговец из-за края|Chet eldan kelgan savdogar`, look: 'caravan', prompt: `Talk to the trader|Поговорить с торговцем|Savdogar bilan gaplashish` }, [
    ['', `"Where I come from, people forget on their own, for free — old age sees to it. You've made it a tax. I've never seen anything so clever, or so sad."|«У нас люди забывают сами и даром — старость справляется. А вы сделали из этого налог. Ничего умнее и печальнее я не видел».|«Bizda odamlar o'zi, tekinga unutadi — qarilik o'z ishini qiladi. Sizlar esa buni soliqqa aylantirdingiz. Bundan aqlliroq va g'amginroq narsani ko'rmaganman».`],
    ['hero', `And what do you sell?|А сам чем торгуешь?|O'zing nima sotasan?`],
    ['', `"Silence. Bells that don't ring, for people who want to sleep. The wind never stops up here, so business is good."|«Тишиной. Колокольчики, которые не звенят, — для тех, кто хочет выспаться. Здесь, наверху, ветер не стихает, так что дела идут».|«Sukunat. Jiringlamaydigan qo'ng'iroqchalar — uxlamoqchi bo'lganlar uchun. Bu yerda, tepada, shamol tinmaydi, shuning uchun ishim yurishib turibdi».`]
  ], `"Silence, going cheap. Well — not that cheap."|«Тишина, недорого. Ну как недорого…»|«Sukunat, arzon. Arzon deysanmi… unchalik emas».`);
  add('withers',
    trace('flag', 0.15, [
      ['', `A prayer flag torn off by the wind, caught on a stone. Someone embroidered a whole town on it, house by house, so small you have to squint.|Сорванный ветром флажок зацепился за камень. Кто-то вышил на нём целый город, дом за домом, так мелко, что приходится щуриться.|Shamol uzib ketgan bayroqcha toshga ilinib qolgan. Kimdir unga butun bir shaharni uyma-uy, shunchalik mayda tikibdiki, ko'zni qisib qarash kerak.`],
      ['hero', `Somebody's home. They took it with them the only way they could.|Чей-то дом. Забрали с собой — как смогли.|Kimningdir uyi. O'zi bilan olib ketibdi — qo'lidan kelgancha.`]
    ]),
    trace('purse', 0.62, [
      ['', `A purse frozen into the snow under the caravanserai wall. Coins from three countries, none of them from here.|Кошель, вмёрзший в снег под стеной караван-сарая. Монеты трёх стран, ни одной здешней.|Karvonsaroy devori tagida qorga muzlab qolgan hamyon. Uch mamlakatning tangalari, birortasi bu yerniki emas.`]
    ], 40));

  /* ---------------------------------------------------------------- the Spine */
  local('bells', 'spine', 0.45, { name: `The bell-hanger|Звонарь|Qo'ng'iroqchi chol`, look: 'elder', prompt: `Talk to the old man|Поговорить со стариком|Chol bilan gaplashish` }, [
    ['', `"I hang a bell on every bone. In a blizzard you walk from ring to ring. Lose the sound and you've lost the road."|«На каждую кость вешаю колокольчик. В буран идёшь от звона к звону. Потерял звук — потерял дорогу».|«Har bir suyakka qo'ng'iroqcha osaman. Bo'ronda jiringdan jiringga qarab yurasan. Ovozni yo'qotdingmi — yo'lni ham yo'qotding».`],
    ['hero', `And the white leopard? The ringing doesn't wake him?|А белый барс? Звон его не будит?|Oq qoplon-chi? Jiringdan uyg'onib ketmaydimi?`],
    ['', `"He doesn't sleep. He listens. When the bells all go quiet at once, he's on the path. Then you stand still and hope he's eaten."|«Он не спит. Он слушает. Если колокольчики разом смолкли — значит, он на тропе. Тогда стой и надейся, что он сыт».|«U uxlamaydi. Quloq soladi. Qo'ng'iroqchalar birdan jim bo'lib qolsa — u yo'lda. Shunda qimirlamay tur-u, qorni to'q bo'lsin deb umid qil».`]
  ], `"Listen for the bells. Not for me — I'm old, I'll go quiet soon enough."|«Слушай колокольчики. Не меня — я старый, я и так скоро замолчу».|«Qo'ng'iroqchalarga quloq sol. Menga emas — men qariman, baribir tez orada jim bo'laman».`);
  add('spine',
    trace('wool', 0.22, [
      ['', `A bell on a vertebra, its tongue wrapped in wool. Someone wanted to pass here unheard.|Колокольчик на позвонке, язычок обмотан шерстью. Кто-то хотел пройти здесь неслышно.|Umurtqa suyagidagi qo'ng'iroqcha, tilchasi jun bilan o'ralgan. Kimdir bu yerdan sezdirmay o'tmoqchi bo'lgan.`],
      ['hero', `Unheard by whom, I wonder.|Интересно, от кого прятался.|Kimdan yashirinmoqchi bo'lgan ekan.`]
    ]),
    trace('bundle', 0.7, [
      ['', `A frozen bundle in a crack in the bone: dried apricots, a flint, a few coins. A traveller's last stop or a traveller's luck — no way to tell now.|В трещине кости — замёрзший узелок: курага, кремень, несколько монет. Последний привал путника или его удача — уже не узнать.|Suyak yorig'ida muzlagan tugun: turshak, chaqmoqtosh, bir necha tanga. Yo'lovchining so'nggi bekati edimi yo omadimi — endi bilib bo'lmaydi.`]
    ], 35));
})();
}
