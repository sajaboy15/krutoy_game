/* 89x_quests_tail.js — two investigations in the Tail and the Potters' Quarter (GDD ch. 20: a riddle, a turn,
   several ways through, no clean ending, people come back).
     qt1 One Night for the Whole Street (Tail → karez → Potters → Tail)
         Every house on Dry Mulberry Lane paid its tithe with the same night. Farhod, home after eleven years, wants to
         know where his father went. The lane drowned Bahrom in the karez for selling three of its children to the
         tithe book to strike his own son's name out; then they all forgot together. Endings: tell Farhod everything
         (the Divan takes the elder) / tell him half (the lane buries a "saint") / plant the night back into his mother
         and let her tell him / burn what you found and say there was nothing.
     qt2 Two Widows and a Bowl (Tail → Potters → karez → Potters)
         The bowl-maker Ulmas grinds the dead's tumars into glaze. Zaynab's bowl of her husband Tohir shows a blue door,
         another woman and a boy. Tohir left two tumars, one for each door; Ulmas glazed both into the bowl that was
         paid for. The mirab gave Tohir a weekly hour of the Tail's water for the other house. Endings: split the bowl /
         tell Zaynab / give it to the blue door and take the blame / burn Tohir out of the glaze.
   Flags SIDE.flag('qt1_*' | 'qt2_*'). Later beats via COMP.beat; people move by branch; two epilogue slides. */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, br = FAC.br, sf = SIDE.flag, cl = FAC.cl;
  const sado = () => sadoAwake();
  const day = () => { try { return (G.WORLD2.S() && G.WORLD2.S().day) || 1; } catch (e) { return 1; } };
  const since = id => day() - (q(id).day || day());
  const set = (k, v) => sf(k, v === undefined ? 1 : v);

  CAST.farhod = { name: `Farhod|Фарход|Farhod`, portrait: null };
  CAST.hilola = { name: `Hilola-opa|Хилола-опа|Hilola opa`, portrait: null };
  CAST.nabi = { name: `Nabi-aka, the lane's elder|Наби-ака, старейшина переулка|Nabi aka, ko'cha oqsoqoli`, portrait: null };
  CAST.mohira = { name: `Mohira|Мохира|Mohira`, portrait: null };
  CAST.zaynab = { name: `Zaynab|Зайнаб|Zaynab`, portrait: null };
  CAST.olmas = { name: `Usta Ulmas, the bowl-maker|Уста Улмас, мастер чаш|Kosagar usta O'lmas`, portrait: null };
  CAST.sabohat = { name: `Sabohat|Сабохат|Sabohat`, portrait: null };
  const LK = {
    farhod: { body: 'man', robe: '#6a5a3a', trim: '#c8a060', skin: '#c89a70', head: 'doppi', headC: '#1c1a1e', headC2: '#e8e0cc', pat: 'stripes', stripes: '#4a3e28', sash: '#3a5a6a' },
    hilola: { body: 'woman', robe: '#4a3a46', trim: '#8a6a7a', skin: '#c08a64', head: 'scarf', headC: '#d8cfc0', headC2: '#a89880', pat: 'atlas', patA: '#6a4a5a', patB: '#a8805a', outer: '#2e2428' },
    nabi: { body: 'old', robe: '#3a4a5a', trim: '#c9b48a', skin: '#b88660', head: 'turban', headC: '#e8e0cc', beard: 'long', beardC: '#d8d4cc', staff: 1, pat: 'stripes', stripes: '#2e3a48', sash: '#c9b48a' },
    mohira: { body: 'woman', robe: '#8a6a4a', trim: '#a88a6a', skin: '#b8906a', head: 'scarf', headC: '#a08060', headC2: '#7a5a3a', pat: 'plain', outer: '#6a4a32' },
    zaynab: { body: 'woman', robe: '#2e2a30', trim: '#6a5a5a', skin: '#c08a64', head: 'scarf', headC: '#1e1a20', headC2: '#5a4e56', pat: 'plain', outer: '#221c22' },
    olmas: { body: 'man', robe: '#8a5a3a', trim: '#d8b890', skin: '#b07a54', head: 'doppi', headC: '#2a2220', headC2: '#c8a878', beard: 'short', beardC: '#5a4a3a', pat: 'patch', sash: '#5a3a22', outer: '#6a4228' },
    sabohat: { body: 'woman', robe: '#3a5a7a', trim: '#a8c0d8', skin: '#c8946a', head: 'scarf', headC: '#2a4a6a', headC2: '#8aa8c8', pat: 'atlas', patA: '#5a7a9a', patB: '#d8c8a0', outer: '#2a3a52' }
  };

  /* ================================================================ qt1 · ONE NIGHT FOR THE WHOLE STREET */
  SIDE.quest('qt1', { n: 22, title: `One Night for the Whole Street|Одна ночь на всю улицу|Butun ko'chaga bitta tun`, where: ['tail', 'qt1lane'] });
  FAC.spot('tail', 'qt1lane', 0.55);
  FAC.spot('karez', 'qt1drown', 0.4);
  FAC.spot('potters', 'qt1clay', 0.36);
  FAC.spot('bazaar', 'qt1desk', 0.24);
  FAC.spot('mines', 'qt1mine', 0.44);

  FAC.npc('farhod', { name: CAST.farhod.name, look: LK.farhod, dx: 0, prompt: `Talk to the young man|Поговорить с парнем|Yigit bilan gaplashish`, idle: `Farhod is looking up at the one empty lamp hook as if it owed him money.|Фарход смотрит на единственный пустой крюк для лампы так, будто тот ему задолжал.|Farhod yagona bo'sh chiroq ilmog'iga xuddi u qarzdordek tikilib turibdi.` },
    () => {
      const b = br('qt1');
      if (b === 'truth') return [{ from: 9, to: 18, region: 'bazaar', spot: 'qt1desk' }];
      if (b === 'none') return [];
      return [{ from: 7, to: 22, region: 'tail', spot: 'qt1lane' }];
    });
  FAC.npc('hilola', { name: CAST.hilola.name, look: LK.hilola, dx: 24, prompt: `Talk to Hilola-opa|Поговорить с Хилолой-опой|Hilola opa bilan gaplashish`, idle: `Hilola-opa sifts flour on her doorstep. The sieve goes round and round.|Хилола-опа просеивает муку на пороге. Сито ходит по кругу.|Hilola opa ostonada un elayapti. Elak aylanib turibdi.` },
    () => [{ from: 7, to: 21, region: 'tail', spot: 'qt1lane' }]);
  FAC.npc('nabi', { name: CAST.nabi.name, look: LK.nabi, dx: -26, prompt: `Talk to the elder|Поговорить со старейшиной|Oqsoqol bilan gaplashish`, idle: `Nabi-aka polishes his walnut door with his sleeve.|Наби-ака полирует рукавом свою ореховую дверь.|Nabi aka yong'oq eshigini yengi bilan artyapti.` },
    () => (br('qt1') === 'truth' ? [{ from: 0, to: 24, region: 'mines', spot: 'qt1mine' }] : [{ from: 8, to: 20, region: 'tail', spot: 'qt1lane' }]));
  FAC.npc('mohira', { name: CAST.mohira.name, look: LK.mohira, dx: -36, prompt: `Talk to the clay-treader|Поговорить с той, что месит глину|Loy pishitayotgan ayol bilan gaplashish`, idle: `A young woman treads clay in a pit, the same step over and over.|Молодая женщина месит ногами глину в яме, одним и тем же шагом.|Yosh ayol chuqurda bir xil qadam bilan loy pishityapti.` },
    () => [{ from: 7, to: 19, region: 'potters', spot: 'qt1clay' }]);

  /* ---------------------------------------------------------------- the offer */
  const q1offer = d => play([
    ['', `Eleven doors on Dry Mulberry Lane, and over each an iron hook for a lamp. Ten hooks hold lamps. Under the eleventh stands a young man with a caravan bundle.|В Переулке сухой шелковицы одиннадцать дверей, над каждой — железный крюк для лампы. На десяти висят лампы. Под одиннадцатым стоит парень с караванным узлом.|Quruq tut ko'chasida o'n bitta eshik, har birining tepasida chiroq uchun temir ilmoq. O'ntasida chiroq osig'liq. O'n birinchisining tagida karvon tugunli yigit turibdi.`],
    ['farhod', `You're the yodchi. Mother said not to bother you. That's why I'm bothering you.|Ты — ёдчи. Мать сказала тебя не трогать. Поэтому и трогаю.|Sen yodchisan. Onam seni bezovta qilma dedi. Shuning uchun bezovta qilyapman.`],
    ['farhod', `Eleven years ago my father went "to the Rabat for work". Next morning my mother put me on a caravan to my uncle. I was eight. I've lived at the Rabat since. Nobody there ever saw him.|Одиннадцать лет назад отец ушёл «на Рабат, на заработки». Наутро мать посадила меня на караван к дяде. Мне было восемь. С тех пор я жил на Рабате. Отца там никто не видел.|O'n bir yil oldin otam «Rabotga, ishga» ketgan. Ertasiga onam meni karvonga o'tqazib, amakimnikiga jo'natdi. Sakkiz yoshda edim. O'shandan beri Rabotdaman. U yerda otamni hech kim ko'rmagan.`]
  ], () => hub(`Farhod|Фарход|Farhod`, [
    { label: `— What do you remember of that night?|— Что ты помнишь о той ночи?|— O'sha kechadan nimani eslaysan?`, lines: [
      ['farhod', `Lamps. A lot of lamps going down the lane past my window, and nobody talking. In the morning Mother's hem was wet to the knee. It hadn't rained.|Лампы. Много ламп — шли по переулку мимо моего окна, и никто не говорил. А утром у матери подол был мокрый по колено. Хотя дождя не было.|Chiroqlar. Ko'p chiroq derazam yonidan ko'cha bo'ylab o'tib borardi, hech kim gapirmasdi. Ertalab onamning etagi tizzasigacha ho'l edi. Yomg'ir yog'magandi.`]
    ] },
    { label: `— Why come to a yodchi?|— А ёдчи тут при чём?|— Yodchining bunga nima aloqasi bor?`, lines: [
      ['farhod', `I asked around. That year every house on this lane paid its tithe in the same week. Every one. You people write down who paid with what. So you can read it.|Я поспрашивал. В тот год все дома в переулке сдали десятину за одну неделю. Все до одного. Вы же записываете, кто чем заплатил. Значит, сможешь прочесть.|Surishtirdim. O'sha yili bu ko'chadagi hamma uy ushrini bir haftada topshirgan. Bittasi ham qolmay. Sizlar kim nima bilan to'laganini yozasizlar-ku. Demak, o'qiy olasan.`]
    ] },
    { label: `— What does your mother say?|— А мать что говорит?|— Onang nima deydi?`, lines: [
      ['farhod', `"Your father went to the Rabat for work." The whole lane says it. The same words, like a prayer. Ask anyone.|«Твой отец ушёл на Рабат на заработки». Так говорит весь переулок. Одними и теми же словами, как молитву. Спроси кого хочешь.|«Otang Rabotga ishga ketgan». Butun ko'cha shunday deydi. Bir xil so'zlar bilan, duo o'qigandek. Xohlagan odamdan so'ra.`],
      () => (sado() ? ['sado', `Everyone in the same words? People don't remember like that. People remember crooked.|Все одними словами? Так не помнят. Люди помнят криво.|Hamma bir xil so'z bilanmi? Odamlar unaqa eslamaydi. Odamlar qiyshiq eslaydi.`] : null)
    ] }
  ], [
    { id: 'yes', label: `"I'll ask around. I'm not promising you'll like it."|«Поспрашиваю. Не обещаю, что тебе понравится.»|«Surishtiraman. Yoqishini va'da qilmayman.»` },
    { id: 'no', label: `"Some nights are better left where they lie."|«Некоторые ночи лучше оставить там, где лежат.»|«Ba'zi kechalarni yotgan joyida qoldirgan yaxshi.»` }
  ], o => {
    if (o.id !== 'yes') { play([['farhod', `Everyone here says that. You'd fit right in.|Тут все так говорят. Ты бы здесь прижился.|Bu yerda hamma shunday deydi. Sen ham shu yerga moslashib ketarding.`]], d); return; }
    FAC.begin('qt1', `Farhod is home on Dry Mulberry Lane after eleven years. His father vanished the night before he was sent away, and the whole lane tells the same story. Talk to his mother Hilola and to the elder, Nabi-aka.|Фарход вернулся в Переулок сухой шелковицы через одиннадцать лет. Его отец пропал в ночь перед отъездом сына, и весь переулок твердит одно и то же. Поговори с матерью, Хилолой, и старейшиной Наби-акой.|Farhod o'n bir yildan keyin Quruq tut ko'chasiga qaytdi. Otasi o'g'li jo'natilishidan oldingi kechasi g'oyib bo'lgan, butun ko'cha bir gapni takrorlaydi. Onasi Hilola va oqsoqol Nabi aka bilan gaplash.`, ['tail', 'qt1lane']);
    play([['farhod', `Mother's in the third house. Nabi-aka is the one with the good door. He paid for it himself; he'll tell you.|Мать — в третьем доме. Наби-ака — тот, у кого хорошая дверь. Сам за неё платил, он расскажет.|Onam uchinchi uyda. Nabi aka — eshigi chiroylisi. Pulini o'zi to'lagan, o'zi aytib beradi.`]], d);
  }));

  const q1both = () => {
    if (!sf('qt1_hilola') || !sf('qt1_nabi') || sf('qt1_s2')) return null;
    set('qt1_s2');
    FAC.stepTo('qt1', `Hilola and Nabi-aka say the same sentence, and the lane gave the Singers the same night. Look at the lamp hooks over the doors: iron remembers what was hung on it.|Хилола и Наби-ака повторяют одну и ту же фразу, а весь переулок отдал Певцам одну ночь. Посмотри на крюки для ламп над дверями: железо помнит, что на нём висело.|Hilola ham, Nabi aka ham bir gapni takrorlaydi, butun ko'cha Xonandalarga bitta kechani bergan. Eshiklar ustidagi chiroq ilmoqlariga qara: temir unga nima osilganini eslaydi.`, ['tail', 'qt1lane']);
    return ['', `Ten lamps. One rusted hook. Iron keeps a memory longer than people do, if nobody pays it to forget.|Десять ламп. Один ржавый крюк. Железо помнит дольше людей — если ему не заплатить за забвение.|O'nta chiroq. Bitta zanglagan ilmoq. Temir odamlardan uzoqroq eslaydi — agar unga unutish uchun pul to'lanmasa.`];
  };

  /* ---------------------------------------------------------------- the mother */
  const q1hilola = d => play([
    ['', `Hilola-opa is sifting flour on her doorstep. She looks at you the way the Tail looks at a yodchi: politely, and at your hands.|Хилола-опа просеивает муку на пороге. Смотрит на тебя так, как в Хвосте смотрят на ёдчи: вежливо и на руки.|Hilola opa ostonada un elayapti. Senga Dumda yodchiga qanday qarashsa, shunday qaraydi: odob bilan, qo'lingga.`],
    ['hilola', `Farhod sent you. He's a good boy. He was always asking things.|Тебя Фарход прислал. Он хороший мальчик. Всегда всё спрашивал.|Seni Farhod yubordi. U yaxshi bola. Doim savol berardi.`]
  ], () => hub(`Hilola-opa|Хилола-опа|Hilola opa`, [
    { label: `— Where is your husband?|— Где ваш муж?|— Eringiz qayerda?`, lines: [
      ['hilola', `Bahrom went to the Rabat for work.|Бахром ушёл на Рабат на заработки.|Bahrom Rabotga ishga ketgan.`],
      ['', `She says it the way people say their own name. Then she goes back to her flour.|Она говорит это так, как называют своё имя. И снова берётся за муку.|U buni o'z ismini aytgandek aytadi. Keyin yana uniga qaytadi.`]
    ] },
    { label: `— Why did you send Farhod away?|— Почему вы отправили Фархода?|— Farhodni nega jo'natib yubordingiz?`, lines: [
      ['hilola', `My brother needed a boy at the Rabat. ...Did he? I think he did. It was a hard year.|Брату на Рабате нужен был помощник. ...Ведь нужен был? Кажется, нужен. Тяжёлый был год.|Akamga Rabotda yordamchi kerak edi. ...Kerak edi-ku? Shekilli, kerak edi. Og'ir yil edi.`]
    ] },
    { label: `— Whose is the empty hook?|— Чей это пустой крюк?|— Bu bo'sh ilmoq kimniki?`, lines: [
      ['hilola', `Ours. The lamp broke. I keep meaning to buy a new one.|Наш. Лампа разбилась. Всё собираюсь купить новую.|Bizniki. Chiroq sinib qolgan. Yangisini olay deb yuribman.`],
      ['', `The hook has rusted shut. Nothing has hung on it for years.|Крюк заржавел намертво. На нём годами ничего не висело.|Ilmoq zanglab qotib qolgan. Unga yillardan beri hech narsa osilmagan.`]
    ] }
  ], [
    FAC.craft('taste', `that week, from her, if she'll let you|ту неделю — у неё, если позволит|o'sha haftani — undan, agar ruxsat bersa`, { id: 'taste' }),
    { id: 'bye', label: `"Thank you, opa."|«Спасибо, опа.»|«Rahmat, opa.»` }
  ], o => {
    const fin = extra => { if (!sf('qt1_hilola')) set('qt1_hilola', extra || 'talked'); play([q1both()], d); };
    if (o.id !== 'taste') { fin(); return; }
    play([['hilola', `Taste? ...Go on. I'd like to know what's in there myself. Some mornings I wake up with my hands cold.|Испить? ...Давай. Мне и самой интересно, что там. Иногда просыпаюсь, а руки ледяные.|Totib ko'rasanmi? ...Mayli. U yerda nima borligini o'zim ham bilgim keladi. Ba'zan uyg'onsam, qo'llarim muzdek bo'ladi.`]], () => FAC.taste([
      ['memory', `A hole. Not torn: cut, with clean edges, by someone who does this for a living. A Singer's work.|Дыра. Не рваная — вырезанная, с ровными краями, рукой того, кто этим зарабатывает. Работа Певца.|Teshik. Yirtilgan emas — kesilgan, chetlari tekis, buni kasb qilgan odamning qo'li bilan. Xonandaning ishi.`],
      ['memory', `At the edges, scraps the Singer missed: a lamp handle warm in her palm. Cold water to the knee. Someone saying, "Hold it higher, Hilola."|По краям — то, что Певец не дорезал: тёплая ручка лампы в ладони. Холодная вода по колено. Кто-то говорит: «Выше держи, Хилола».|Chetlarida Xonanda kesib ulgurmagan parchalar: kaftida iliq chiroq dastasi. Tizzagacha sovuq suv. Kimdir: «Balandroq ko'tar, Hilola», deyapti.`],
      ['hilola', `Well? What did you find?|Ну? Что нашёл?|Xo'sh? Nima topding?`],
      ['hero', `A lamp. Cold water. Not much.|Лампу. Холодную воду. Немного.|Chiroq. Sovuq suv. Ko'p emas.`],
      ['hilola', `A lamp. ...We don't have a lamp.|Лампу. ...У нас нет лампы.|Chiroq. ...Bizda chiroq yo'q-ku.`]
    ], () => fin('tasted'), { person: true, intro: `She holds out her wrist like a woman at the healer's. You touch it and look for that week.|Она протягивает запястье, как у лекаря. Ты касаешься его и ищешь ту неделю.|U tabibga ko'rsatgandek bilagini uzatadi. Unga tegib, o'sha haftani qidirasan.` }));
  }));

  /* ---------------------------------------------------------------- the elder */
  const q1nabi = d => play([
    ['', `Nabi-aka's door is carved walnut, the only good door on the lane. He opens it himself before you knock.|Дверь у Наби-аки — резной орех, единственная хорошая дверь в переулке. Он открывает сам, прежде чем ты постучал.|Nabi akaning eshigi o'ymakor yong'oqdan — ko'chadagi yagona chiroyli eshik. Taqillatmasingdan o'zi ochadi.`],
    ['nabi', `Yodchi. The lane has paid this year. The lane pays every year, on time. Ask anyone.|Ёдчи. Переулок в этом году заплатил. Переулок платит каждый год, вовремя. Спроси кого хочешь.|Yodchi. Ko'cha bu yil to'ladi. Ko'cha har yili vaqtida to'laydi. Xohlagan odamdan so'ra.`]
  ], () => {
    const tried = {};
    const loop = () => hub(`Nabi-aka|Наби-ака|Nabi aka`, [
      { label: `— Where is Bahrom?|— Где Бахром?|— Bahrom qayerda?`, lines: [
        ['nabi', `Bahrom went to the Rabat for work. A good man. Hard-working. He'll come back when the work is done.|Бахром ушёл на Рабат на заработки. Хороший человек. Работящий. Закончит работу — вернётся.|Bahrom Rabotga ishga ketgan. Yaxshi odam. Mehnatkash. Ishini tugatsa, qaytadi.`],
        ['', `Eleven years of work at the Rabat. You know the Rabat. It isn't that big.|Одиннадцать лет работы на Рабате. Ты знаешь Рабат. Он не такой уж большой.|Rabotda o'n bir yillik ish. Rabotni bilasan. U unchalik katta emas.`]
      ] },
      { label: `— Farhod wants to know what happened.|— Фарход хочет знать, что случилось.|— Farhod nima bo'lganini bilmoqchi.`, lines: [
        ['nabi', `Farhod is a good boy. Let him find a wife and a trade. A boy who walks looking backwards walks into walls.|Фарход — хороший парень. Пусть найдёт жену и ремесло. Кто ходит, оглядываясь, тот врезается в стены.|Farhod yaxshi yigit. Xotin topsin, hunar topsin. Orqaga qarab yurgan odam devorga urilib ketadi.`]
      ] }
    ], [
      tried.receipts ? null : FAC.chk('collection', 3, `"Show me the lane's tithe receipts for that year, aka. All eleven. I'm asking as a yodchi."|«Покажите квитанции переулка за тот год, ака. Все одиннадцать. Я спрашиваю как ёдчи.»|«O'sha yilgi ko'chaning ushr tilxatlarini ko'rsating, aka. O'n bittasini ham. Yodchi sifatida so'rayapman.»`, { id: 'receipts' }),
      tried.words ? null : FAC.chk('mem', 5, `"The whole lane says it in the same words, aka. Who taught them?"|«Весь переулок говорит это одними словами, ака. Кто их научил?»|«Butun ko'cha buni bir xil so'z bilan aytadi, aka. Kim o'rgatgan?»`, { id: 'words' }),
      { id: 'bye', label: `"I'll come back if I need you."|«Понадобитесь — зайду.»|«Kerak bo'lsangiz, kelaman.»` }
    ].filter(Boolean), o => {
      if (o.id === 'bye') { if (!sf('qt1_nabi')) set('qt1_nabi', 'talked'); play([q1both()], d); return; }
      tried[o.id] = 1; set('qt1_nabi', sf('qt1_nabi') || 'talked');
      if (o.id === 'receipts') {
        if (!o.ok) { play([['nabi', `Receipts are the Singers' business and mine. Not a yodchi's who walks about without his master. Where is Rustam-aka these days?|Квитанции — дело Певцов и моё. А не ёдчи, который ходит без своего наставника. Где нынче Рустам-ака?|Tilxatlar Xonandalar bilan mening ishim. Ustozisiz yurgan yodchining ishi emas. Rustam aka hozir qayerda?`]], loop); return; }
        set('qt1_receipts');
        play([
          ['nabi', `...As you like.|...Как хочешь.|...Xohlaganingdek.`],
          ['', `Eleven receipts in a cedar box. Eleven households, one week, one Singer's seal. Under "paid in memory", in eleven different hands: "a night".|Одиннадцать квитанций в кедровой шкатулке. Одиннадцать домов, одна неделя, одна печать Певца. В графе «уплачено памятью» одиннадцатью почерками: «одна ночь».|Kedr qutichada o'n bitta tilxat. O'n bitta xonadon, bitta hafta, bitta Xonanda muhri. «Xotira bilan to'landi» degan joyda o'n bitta xatda: «bir kecha».`],
          ['hero', `The same night. All eleven of you.|Одна и та же ночь. У всех одиннадцати.|Bir xil kecha. O'n bittangizda ham.`],
          ['nabi', `It was a bad night. Wind. A bad night is cheap to give away. We're poor people, yodchi. We pay with what we can spare.|Плохая была ночь. Ветер. Плохую ночь отдать не жалко. Мы люди бедные, ёдчи. Платим тем, без чего можно обойтись.|Yomon kecha edi. Shamol. Yomon kechani berishga achinmaysan. Biz kambag'al odamlarmiz, yodchi. Nima ortiqcha bo'lsa, o'shani to'laymiz.`]
        ], loop);
      } else {
        if (!o.ok) { play([['nabi', `People say the same thing because it is the truth. Good day, yodchi.|Люди говорят одно и то же, потому что это правда. Всего доброго, ёдчи.|Odamlar bir gapni aytadi, chunki bu rost. Xayr, yodchi.`]], loop); return; }
        set('qt1_words');
        play([
          ['', `For a moment the old man's face goes empty, as if he had reached for a shelf and found no shelf there.|На миг лицо старика пустеет, будто он потянулся к полке, а полки нет.|Bir lahza cholning yuzi bo'shab qoladi, go'yo javonga qo'l cho'zgan-u, javon yo'q.`],
          ['nabi', `Nobody taught anybody. That's how it was, so that's what people say. Good day, yodchi.|Никто никого не учил. Так было, вот так и говорят. Всего доброго, ёдчи.|Hech kim hech kimni o'rgatmagan. Shunday bo'lgan, shuning uchun shunday deyishadi. Xayr, yodchi.`]
        ], loop);
      }
    });
    loop();
  });

  /* ---------------------------------------------------------------- the hook */
  const q1hooks = d => FAC.taste([
    ['memory', `Night. Eleven lamps come off eleven hooks. Nobody speaks. Bahrom stands in the middle of the lane, his wrists tied with a lamp cord.|Ночь. Одиннадцать ламп снимают с одиннадцати крюков. Никто не говорит. Посреди переулка стоит Бахром, запястья связаны шнуром от лампы.|Tun. O'n bitta ilmoqdan o'n bitta chiroq olinadi. Hech kim gapirmaydi. Ko'cha o'rtasida bilaklari chiroq ipi bilan bog'langan Bahrom turibdi.`],
    ['memory', `They walk him to the end of the lane, to the old drain cover, and lift it. The lamps go down into the karez one by one, like water into sand.|Его ведут в конец переулка, к старой крышке стока, и поднимают её. Лампы одна за другой уходят вниз, в кяриз, как вода в песок.|Uni ko'cha oxiriga, eski ariq qopqog'i oldiga olib borib, qopqoqni ko'tarishadi. Chiroqlar birin-ketin korezga tushib ketadi, qumga singgan suvdek.`],
    ['memory', `Ten lamps come back up before dawn. The eleventh hook has been empty ever since.|До рассвета наверх возвращаются десять ламп. Одиннадцатый крюк с тех пор пустой.|Tong otmasdan yuqoriga o'nta chiroq qaytib chiqadi. O'n birinchi ilmoq o'shandan beri bo'sh.`],
    () => (sado() ? ['sado', `Ravshan. They all went down together. Even the old man with the nice door.|Равшан. Они спустились все вместе. Даже старик с красивой дверью.|Ravshan. Hammasi birga tushishdi. Hatto chiroyli eshikli chol ham.`] : null)
  ], () => {
    set('qt1_hooks');
    FAC.stepTo('qt1', `That night the whole lane led Bahrom down into the karez by lamplight. Ten lamps came back. Find where they left him in the upper karez.|В ту ночь весь переулок с лампами отвёл Бахрома в кяриз. Вернулись десять ламп. Найди в верхних кяризах, где его оставили.|O'sha kecha butun ko'cha chiroqlar bilan Bahromni korezga olib tushgan. O'nta chiroq qaytgan. Yuqori korezlarda uni qayerda qoldirishganini top.`, ['karez', 'qt1drown']);
    d();
  }, { intro: `You lay two fingers on the cold iron. It has been waiting a long time for somebody to ask.|Кладёшь два пальца на холодное железо. Оно давно ждало, чтобы кто-нибудь спросил.|Ikki barmog'ingni sovuq temirga qo'yasan. U kimdir so'rashini uzoq kutgan.` });
  FAC.prop('tail', 'qt1lane', { id: 'qt1hooks', art: 'f6glint', dx: 46, prompt: `Touch the rusted lamp hook|Коснуться ржавого крюка для лампы|Zanglagan chiroq ilmog'iga tegish`, when: () => act('qt1') && !!sf('qt1_s2') && !sf('qt1_hooks'), use: d => q1hooks(d) });

  /* ---------------------------------------------------------------- the karez */
  const q1found = d => play([
    ['', `Bones, sitting against the wall as if the man had only got tired. A lamp cord still around the wrists, and on it a brass tube of the kind the Divan keeps receipts in.|Кости — сидят у стены, будто человек просто устал. На запястьях всё ещё шнур от лампы, а на шнуре — латунная трубка, в каких Диван хранит квитанции.|Suyaklar devorga suyanib o'tiribdi, go'yo odam shunchaki charchagan. Bilaklarida hali ham chiroq ipi, ipda esa Devon tilxat saqlaydigan jez naycha.`],
    ['', `Inside, damp but legible: "Entered in the tithe book: Mohira, nine; Jamshid, seven; Lobar, eight. In return struck out: Farhod, son of Bahrom, eight." A Divan seal.|Внутри, сырая, но читается: «Внесены в долговую книгу: Мохира, девяти лет; Джамшид, семи; Лобар, восьми. Взамен вычеркнут Фарход, сын Бахрома, восьми лет». Печать Дивана.|Ichida, nam, lekin o'qiladi: «Qarz daftariga kiritildi: Mohira, to'qqiz yosh; Jamshid, yetti; Lobar, sakkiz. Evaziga o'chirildi: Bahrom o'g'li Farhod, sakkiz yosh». Devon muhri.`]
  ], () => ask(`The water laps at the bones.|Вода плещется у костей.|Suv suyaklarga urilib turibdi.`, [
    FAC.craft('taste', `the last minute in the bones|последнюю минуту в костях|suyaklardagi so'nggi daqiqani`, { id: 'taste' }),
    { id: 'read', label: `Take the tube and go. What you've read is enough.|Забрать трубку и уйти. Прочитанного хватит.|Naychani olib ketish. O'qiganing yetarli.` }
  ], o => {
    const next = () => {
      set('qt1_bones', o.id === 'taste' ? 'tasted' : 'read');
      FAC.stepTo('qt1', `Bahrom gave three children of the lane to the tithe book to save his son, and the lane drowned him for it. One of the three, Mohira, may be treading clay in the Potters' Quarter.|Бахром отдал в долговую книгу троих детей переулка, чтобы спасти сына, и за это переулок его утопил. Одна из троих, Мохира, может месить глину в Квартале гончаров.|Bahrom o'g'lini qutqarish uchun ko'chaning uchta bolasini qarz daftariga bergan, ko'cha buning uchun uni cho'ktirgan. Uchtadan biri, Mohira, Kulollar mahallasida loy pishitayotgan bo'lishi mumkin.`, ['potters', 'qt1clay']);
      play([['hero', `Debtor children who come back half-sung end up at the kilns. Nobody else will hire them.|Детей-должников, которых вернули полупустыми, берут только к печам. Больше никто.|Yarim kuylanib qaytgan qarzdor bolalarni faqat xumdonlarga olishadi. Boshqa hech kim olmaydi.`]], d);
    };
    if (o.id !== 'taste') { next(); return; }
    FAC.taste([
      ['memory', `Lamps above, in a ring. Faces he has known all his life. Water rising past his knees.|Наверху лампы — кольцом. Лица, которые он знал всю жизнь. Вода поднимается выше колен.|Tepada chiroqlar halqa bo'lib turibdi. Butun umr taniydigan yuzlar. Suv tizzadan yuqoriga ko'tarilyapti.`],
      ['memory', `"They had Farhod's name at the top of the page. At the top, Nabi! I gave them three to strike out one. Hilola, you'd have done it too."|«У них имя Фархода стояло первым. Первым, Наби! Я отдал троих, чтобы вычеркнули одного. Хилола, ты бы тоже так сделала».|«Ularda Farhodning ismi birinchi turgan edi. Birinchi, Nabi! Bittasini o'chirishsin deb uchtasini berdim. Hilola, sen ham shunday qilarding».`],
      ['memory', `Hilola holds a lamp. Her hand doesn't shake. "I know," she says. "That's why I'm holding it."|Хилола держит лампу. Рука у неё не дрожит. «Знаю, — говорит она. — Поэтому и держу».|Hilola chiroq ushlab turibdi. Qo'li qaltiramaydi. «Bilaman, — deydi u. — Shuning uchun ushlab turibman».`],
      () => (sado() ? ['sado', `...I don't want to taste anything else today. Can we not, for a while?|...Я сегодня больше ничего пробовать не хочу. Можно пока не надо?|...Bugun boshqa hech narsani totib ko'rgim kelmayapti. Bir oz to'xtab tursak bo'ladimi?`] : null)
    ], next);
  }));
  const q1grate = d => play([
    ['', `A side channel closed off with a grate that nobody meant to open again. Behind it, under a hand's depth of bitter water, something pale.|Боковой канал, перекрытый решёткой, которую больше не собирались открывать. За ней, под ладонью горькой воды, — что-то бледное.|Yon kanal, boshqa ochilmasin deb panjara bilan to'silgan. Uning ortida, bir kaft achchiq suv ostida nimadir oqarib ko'rinadi.`]
  ], () => ask(`The grate has rusted into the brick.|Решётка вросла ржавчиной в кирпич.|Panjara zanglab, g'ishtga yopishib qolgan.`, [
    FAC.chk('str', 6, `Tear the grate out of the wall.|Вырвать решётку из стены.|Panjarani devordan sug'urib olish.`, { id: 'str' }),
    FAC.chk('agi', 5, `Squeeze through the gap at the top.|Протиснуться в щель над решёткой.|Tepadagi tirqishdan siqilib o'tish.`, { id: 'agi' }),
    FAC.inParty('surayyo') ? { id: 'sur', label: `"Surayyo. Is there another way in?"|«Сурайё. Сюда можно попасть иначе?»|«Surayyo. Bu yerga boshqa yo'l bormi?»` } : null,
    { id: 'long', label: `Go round through the flooded channel.|Обойти по затопленному каналу.|Suv bosgan kanal orqali aylanib o'tish.` }
  ], o => {
    const LONG = ['', `Bitter water to the chest, in the dark, for a long time. When you come out on the other side, your teeth are chattering in an even rhythm, as if counting.|Горькая вода по грудь, в темноте, долго. Когда выходишь с той стороны, зубы стучат ровно, будто считают.|Ko'kragingacha achchiq suv, qorong'ida, uzoq. U tomonga chiqqaningda tishlaring xuddi sanayotgandek bir maromda taqillaydi.`];
    let lines;
    if (o.id === 'str') lines = o.ok ? [['', `The grate comes away with a shriek that runs the length of the karez.|Решётка выходит из кладки с визгом, который разносится по всему кяризу.|Panjara butun korez bo'ylab yangragan chiyillash bilan devordan chiqadi.`]] : [['', `The grate holds. Your shoulder very nearly doesn't.|Решётка держится. Плечо — едва-едва.|Panjara joyida qoladi. Yelkang esa zo'rg'a chidaydi.`], LONG];
    else if (o.id === 'agi') lines = o.ok ? [['', `You get through, leaving a strip of your coat on the iron.|Ты пролезаешь, оставив на железе полосу от кафтана.|To'ningdan bir parchasini temirda qoldirib, o'tib olasan.`]] : [['', `The gap is a hand too narrow. Of course it is.|Щель на ладонь уже, чем надо. Ну конечно.|Tirqish bir kaft tor. Albatta-da.`], LONG];
    else if (o.id === 'sur') lines = [['surayyo', `This is the old Bitter Channel. Closed before my time. ...There's a sluice wheel two bends up. Hold my pole and don't argue.|Это старый Горький канал. Его закрыли ещё до меня. ...Через два поворота есть шлюзовое колесо. Держи мой шест и не спорь.|Bu eski Achchiq kanal. Mendan oldin yopishgan. ...Ikki burilishdan keyin shlyuz g'ildiragi bor. Xodamni ushla, bahslashma.`], ['', `The water drops with a long sigh, and the grate stands in mud.|Вода уходит с долгим вздохом, и решётка остаётся стоять в иле.|Suv uzoq xo'rsinib ketadi, panjara loyda qoladi.`]];
    else lines = [LONG];
    play(lines, () => q1found(d));
  }));
  FAC.prop('karez', 'qt1drown', { id: 'qt1bones', art: 'f6glint', prompt: `A side channel behind a rusted grate|Боковой канал за ржавой решёткой|Zanglagan panjara ortidagi yon kanal`, when: () => act('qt1') && !!sf('qt1_hooks') && !sf('qt1_bones'), use: d => q1grate(d) });

  /* ---------------------------------------------------------------- one of the three */
  const q1mohira = d => play([
    ['', `A young woman treads clay knee-deep in a pit, slowly, the same step over and over. Her eyes follow you a moment late, like a lamp carried behind someone.|Молодая женщина месит глину в яме, по колено, медленно, одним и тем же шагом. Глаза следуют за тобой с опозданием, как лампа, которую несут позади человека.|Yosh ayol chuqurda tizzagacha loy pishityapti, sekin, bir xil qadam bilan. Ko'zlari senga bir lahza kech ergashadi, odamning ortidan olib kelinayotgan chiroqdek.`],
    ['mohira', `Yodchi. I've paid. They sang me for eight years. I've paid for everyone in my family who's left. There's nobody left.|Ёдчи. Я своё заплатила. Меня восемь лет пели. Я заплатила за всех своих, кто остался. Никого не осталось.|Yodchi. Men to'laganman. Meni sakkiz yil kuylashdi. Qolgan hamma yaqinlarim uchun to'ladim. Hech kim qolmadi.`]
  ], () => hub(`Mohira|Мохира|Mohira`, [
    { label: `— Do you remember the night they took you?|— Помнишь ночь, когда тебя забрали?|— Seni olib ketishgan kechani eslaysanmi?`, lines: [
      ['mohira', `I remember the cart. Lobar crying, Jamshid not. And a man from our lane walking beside it. He gave me a piece of sugar and didn't look at me.|Помню арбу. Лобар плачет, Джамшид — нет. И рядом идёт мужчина с нашего переулка. Дал мне кусочек сахара и не смотрел на меня.|Aravani eslayman. Lobar yig'layapti, Jamshid yo'q. Yonida bizning ko'chadan bir erkak ketyapti. Menga bir parcha navvot berdi-yu, qaramadi.`]
    ] },
    { label: `— What became of the other two?|— Что стало с двумя другими?|— Qolgan ikkovi nima bo'ldi?`, lines: [
      ['mohira', `Jamshid is Hollow. He sweeps the Cloister steps. Lobar didn't come back. They say the Sleeper drank her whole.|Джамшид — Пустой. Метёт ступени Обители. Лобар не вернулась. Говорят, Спящий выпил её целиком.|Jamshid Bo'sh bo'lib qolgan. Xonaqoh zinalarini supuradi. Lobar qaytmadi. Aytishlaricha, Uxlovchi uni butunlay ichib yuborgan.`]
    ] },
    { label: `— Do you know who gave your name?|— Знаешь, кто назвал твоё имя?|— Ismingni kim berganini bilasanmi?`, lines: [
      ['mohira', `No. I used to think about it every night. Then they sang that out of me too. Now I tread clay.|Нет. Раньше думала об этом каждую ночь. Потом и это из меня выпели. Теперь мешу глину.|Yo'q. Avval har kecha shu haqda o'ylardim. Keyin buni ham kuylab olishdi. Endi loy pishitaman.`]
    ] }
  ], [
    { id: 'told', label: `"It was Bahrom, from your lane. He traded the three of you for his son. The lane drowned him for it, and then they all forgot."|«Это был Бахром с вашего переулка. Он обменял вас троих на своего сына. Переулок его за это утопил — а потом все забыли.»|«Bu sizning ko'changizdan Bahrom edi. Uchalaringizni o'g'liga almashgan. Ko'cha buning uchun uni cho'ktirgan, keyin hammasi unutgan.»` },
    { id: 'spared', label: `"I was only asking. Go back to your clay."|«Я просто спрашивал. Возвращайся к своей глине.»|«Shunchaki so'radim. Loyingga qayt.»` }
  ], o => {
    set('qt1_mohira', o.id);
    const lines = o.id === 'told' ? [
      ['mohira', `...Bahrom-aka. The sugar.|...Бахром-ака. Сахар.|...Bahrom aka. Navvot.`],
      ['', `She stands still in the pit. The clay begins to close over her feet.|Она замирает в яме. Глина начинает затягивать ей ступни.|U chuqurda qotib qoladi. Loy oyoqlarini yuta boshlaydi.`],
      ['mohira', `They drowned him for us. And then they forgot us too, didn't they. You can't forget the night and keep what it was for.|Утопили его за нас. А потом и нас забыли, да? Нельзя забыть ночь и помнить, ради чего она была.|Uni biz uchun cho'ktirishgan. Keyin bizni ham unutishgan, shundaymi? Kechani unutib, u nima uchun bo'lganini eslab qolib bo'lmaydi.`],
      ['mohira', `I don't know if I'm glad. Come and tell me what you do with it. I'd like to know what I'm worth now.|Не знаю, рада ли я. Приходи потом, скажи, что ты с этим сделал. Хочу знать, сколько я теперь стою.|Xursandmanmi, bilmayman. Keyin kelib, bu bilan nima qilganingni aytarsan. Endi qanchaga arzishimni bilgim keladi.`],
      cl('alp', `Alp would have given three for one, once. Alp is not proud that he knows this.|Алп когда-то тоже отдал бы троих за одного. Алп не гордится тем, что это знает.|Alp ham bir paytlar bittasi uchun uchtasini berardi. Alp buni bilishidan faxrlanmaydi.`),
      cl('surayyo', `Eleven years I've kept that lane's water, and not one of them ever said Bahrom's name to me. Not one.|Одиннадцать лет я веду воду этого переулка, и ни один из них ни разу не назвал при мне Бахрома. Ни один.|O'n bir yildan beri o'sha ko'chaning suvini boshqaraman, birortasi oldimda Bahromning ismini tilga olmagan. Birortasi ham.`)
    ] : [
      ['mohira', `Clay doesn't ask questions. That's why I like it.|Глина вопросов не задаёт. За это я её и люблю.|Loy savol bermaydi. Shuning uchun uni yaxshi ko'raman.`]
    ];
    play(lines, () => {
      FAC.stepTo('qt1', `You know what the lane forgot. Go back to Dry Mulberry Lane: Farhod is waiting, and so is his mother.|Ты знаешь, что забыл переулок. Возвращайся в Переулок сухой шелковицы: там ждёт Фарход — и его мать.|Ko'cha nimani unutganini bilasan. Quruq tut ko'chasiga qayt: u yerda Farhod kutyapti, onasi ham.`, ['tail', 'qt1lane']);
      d();
    });
  }));

  /* ---------------------------------------------------------------- the lane decides nothing; you do */
  const q1final = d => play([
    ['', `Farhod is waiting under the empty hook. His mother stands in the doorway behind him with flour on her hands. Nabi-aka's walnut door is open a crack.|Фарход ждёт под пустым крюком. За ним в дверях стоит мать, руки в муке. Ореховая дверь Наби-аки приоткрыта.|Farhod bo'sh ilmoq tagida kutyapti. Orqasida, eshik oldida qo'llari unga botgan onasi turibdi. Nabi akaning yong'oq eshigi qiya ochiq.`],
    ['farhod', `Well? You've been in the karez. You smell of it.|Ну? Ты был в кяризе. От тебя им пахнет.|Xo'sh? Korezda bo'lding. Sendan uning hidi kelyapti.`]
  ], () => hub(`Dry Mulberry Lane|Переулок сухой шелковицы|Quruq tut ko'chasi`, [
    { label: `— Ask Nabi-aka about the receipts, in front of everyone.|— Спросить Наби-аку о квитанциях — при всех.|— Nabi akadan tilxatlar haqida hammaning oldida so'rash.`, if: () => !!sf('qt1_receipts'), lines: [
      ['nabi', `A night is a night, yodchi. We paid with what we had.|Ночь есть ночь, ёдчи. Мы заплатили тем, что было.|Kecha — kecha-da, yodchi. Nima bor bo'lsa, o'shani to'ladik.`],
      ['', `He says it to you, but he's looking at Hilola.|Говорит он тебе, а смотрит на Хилолу.|U senga gapiryapti, lekin Hilolaga qarab turibdi.`]
    ] },
    { label: `— Ask Hilola whether she still dreams of cold water.|— Спросить Хилолу, снится ли ей ещё холодная вода.|— Hiloladan hali ham tushiga sovuq suv kiradimi, deb so'rash.`, lines: [
      ['hilola', `Every night. How did you know?|Каждую ночь. Откуда ты знаешь?|Har kecha. Qayerdan bilding?`]
    ] }
  ], [
    { id: 'truth', label: `"Your father gave three children to the tithe book to get your name struck out. The lane drowned him in the karez. Your mother held a lamp."|«Твой отец отдал троих детей в долговую книгу, чтобы вычеркнули тебя. Переулок утопил его в кяризе. Твоя мать держала лампу.»|«Otang seni o'chirtirish uchun uchta bolani qarz daftariga bergan. Ko'cha uni korezda cho'ktirgan. Onang chiroq ushlab turgan.»` },
    { id: 'half', label: `"Your father drowned in the karez. He'd made a deal to keep you out of the tithe book. That's what I found."|«Твой отец утонул в кяризе. Он заключил сделку, чтобы тебя не внесли в долговую книгу. Вот что я нашёл.»|«Otang korezda cho'kib o'lgan. Seni qarz daftariga tushirmaslik uchun kelishuv qilgan edi. Topganim shu.»` },
    FAC.craft('plant', `the night you tasted back into Hilola, and let her tell him herself|ту ночь, что ты испил, обратно в Хилолу — пусть сама расскажет сыну|totib ko'rgan kechangni Hilolaga qaytarish — o'g'liga o'zi aytsin`, { id: 'plant' }),
    FAC.craft('burn', `what you found, and tell him there was nothing|всё, что нашёл, — и сказать, что ничего не было|topganingni — va hech narsa yo'q edi deyish`, { id: 'none' })
  ], o => {
    const told = sf('qt1_mohira') === 'told';
    const fin = (lines, text, deltas) => {
      FAC.react(deltas, 'qt1');
      play(lines, () => { FAC.finish('qt1', o.id, text); d(); });
    };
    if (o.id === 'truth') {
      rep('tail', -2); rep('divan', 1); gold(20);
      fin([
        ['', `Nobody on the lane moves. Farhod reads the brass tube twice. Then he looks at his mother, and she looks back, and neither looks away.|В переулке никто не шевелится. Фарход дважды перечитывает латунную трубку. Потом смотрит на мать, она — на него, и никто не отводит глаз.|Ko'chada hech kim qimirlamaydi. Farhod jez naychani ikki marta o'qiydi. Keyin onasiga qaraydi, u ham unga qaraydi, hech biri ko'zini olib qochmaydi.`],
        ['hilola', `I don't remember it. But I believe you. That's worse, yodchi. Do you understand? That's worse.|Я этого не помню. Но я тебе верю. Это хуже, ёдчи. Понимаешь? Это хуже.|Men buni eslamayman. Lekin senga ishonaman. Bu yomonroq, yodchi. Tushunyapsanmi? Bu yomonroq.`],
        ['farhod', `There's a Divan seal on this. The Divan pays for names, and it doesn't like its people drowned. ...My father taught me that, it turns out.|Тут печать Дивана. Диван платит за имена и не любит, когда его людей топят. ...Этому, выходит, меня научил отец.|Bunda Devon muhri bor. Devon ism uchun pul to'laydi va odamlarini cho'ktirishsa, yoqtirmaydi. ...Buni menga otam o'rgatgan ekan.`],
        ['nabi', `Farhod. Son. Take that to the Ark and they'll take the lane. All of it. Your mother too.|Фарход. Сынок. Понесёшь это в Арк — заберут весь переулок. Весь. И мать твою тоже.|Farhod. O'g'lim. Buni Arkka olib borsang, butun ko'chani olib ketishadi. Hammasini. Onangni ham.`],
        ['farhod', `Not my mother. I'll see to that. You, though, aka...|Не мать. Об этом я позабочусь. А вот вас, ака...|Onamni emas. Buni o'zim hal qilaman. Sizni esa, aka...`],
        ['', `Two days later the Divan's men take Nabi-aka to the Salt Mines and fine the lane a year of water. Farhod gets a clerk's stool on the Bazaar and sends you twenty tilla.|Через два дня люди Дивана уводят Наби-аку в Соляные шахты и штрафуют переулок на год воды. Фарход получает табурет писаря на Базаре и присылает тебе двадцать тилла.|Ikki kundan keyin Devon odamlari Nabi akani Tuz konlariga olib ketishadi, ko'chaga bir yillik suv jarimasi solishadi. Farhod Bozorda mirzalik kursisini olib, senga yigirma tilla jo'natadi.`],
        cl('surayyo', `A year without water, for a lane that has nothing else. You'll forgive me if I don't thank you.|Год без воды — переулку, у которого больше ничего нет. Уж прости, благодарить не стану.|Boshqa hech narsasi yo'q ko'chaga bir yil suvsiz. Kechirasan, rahmat aytmayman.`),
        cl('nargiza', `It's ugly. But it's what happened, and now somebody remembers it. That's more than this city usually manages.|Это мерзко. Но так было, и теперь хоть кто-то это помнит. Для этого города и это немало.|Bu jirkanch. Lekin shunday bo'lgan, endi hech bo'lmasa kimdir buni eslaydi. Bu shahar uchun shu ham kam emas.`)
      ], `You told Farhod everything. He took the Divan seal to the Ark: Nabi-aka went to the Salt Mines, the lane lost a year of water, and Farhod got a clerk's stool.|Ты рассказал Фарходу всё. Он отнёс печать Дивана в Арк: Наби-аку увели в Соляные шахты, переулок лишился воды на год, а Фарход получил табурет писаря.|Farhodga hammasini aytding. U Devon muhrini Arkka olib bordi: Nabi akani Tuz konlariga olib ketishdi, ko'cha bir yilga suvsiz qoldi, Farhod esa mirzalik kursisini oldi.`, { nargiza: 10, surayyo: -10, alp: -5 });
    } else if (o.id === 'half') {
      rep('tail', 2); gold(40);
      fin([
        ['', `Farhod shuts his eyes. Behind him Hilola lets out a breath she seems to have held for eleven years. Nabi-aka's door swings all the way open.|Фарход закрывает глаза. За его спиной Хилола выдыхает — будто не дышала одиннадцать лет. Ореховая дверь Наби-аки распахивается настежь.|Farhod ko'zlarini yumadi. Orqasida Hilola xuddi o'n bir yildan beri nafas olmagandek uh tortadi. Nabi akaning yong'oq eshigi lang ochiladi.`],
        ['farhod', `He drowned to keep me out of the book. ...I'll bring him up. He should be buried like a man, not left sitting in the water.|Он утонул, чтобы меня не внесли в книгу. ...Я его подниму. Похороню по-людски, нечего ему сидеть в воде.|U meni daftarga tushirmaslik uchun cho'kkan. ...Uni olib chiqaman. Odamday dafn qilaman, suvda o'tirib qolmasin.`],
        ['nabi', `The lane will carry him. All of us. It's the least... It's right.|Переулок его понесёт. Все мы. Это меньшее, что... Так правильно.|Ko'cha uni ko'tarib boradi. Hammamiz. Bu eng kamida... Shunday bo'lishi kerak.`],
        ['', `At the funeral eleven households weep for Bahrom, and none could say why they weep so hard. At the gate Nabi-aka presses a purse into your hand and doesn't say what for.|На похоронах одиннадцать домов плачут по Бахрому, и никто не сказал бы, отчего так горько. У ворот Наби-ака суёт тебе кошель и не говорит, за что.|Janozada o'n bitta xonadon Bahromga yig'laydi, hech biri nega bunchalik achchiq yig'layotganini ayta olmasdi. Darvozada Nabi aka qo'lingga hamyon tutqazadi, nima uchunligini aytmaydi.`],
        () => (told ? ['', `Mohira stands at the end of the lane in clay-stiff boots, watching them bury the man who sold her. Nobody recognises her.|Мохира стоит в конце переулка в задубевших от глины сапогах и смотрит, как хоронят человека, который её продал. Её никто не узнаёт.|Mohira loydan qotgan etikda ko'cha oxirida turib, uni sotgan odamni dafn qilishayotganini kuzatadi. Uni hech kim tanimaydi.`] : null),
        cl('nargiza', `You gave the boy a father he can be proud of. You made him up. I hope he never finds the receipt.|Ты дал парню отца, которым можно гордиться. Ты его выдумал. Надеюсь, он никогда не найдёт ту квитанцию.|Yigitga faxrlansa bo'ladigan ota berding. O'zing to'qib chiqarding. Umid qilamanki, u o'sha tilxatni hech qachon topmaydi.`),
        cl('surayyo', `The lane will hate itself quietly instead of out loud. In the Tail that counts as peace.|Переулок будет ненавидеть себя тихо, а не вслух. В Хвосте это и называют миром.|Ko'cha o'zini ovoz chiqarib emas, ichida yomon ko'radi. Dumda buni tinchlik deyishadi.`)
      ], `You told Farhod half: that his father drowned to keep him out of the tithe book. The lane buried Bahrom with honour, and never learned why it wept.|Ты сказал Фарходу половину: что отец утонул, чтобы его не внесли в книгу. Переулок похоронил Бахрома с почестями — и так и не понял, отчего плакал.|Farhodga yarmini aytding: otasi uni daftarga tushirmaslik uchun cho'kkanini. Ko'cha Bahromni izzat bilan dafn qildi va nega yig'laganini bilmay qoldi.`, { surayyo: 5, alp: 5, nargiza: -10 });
    } else if (o.id === 'plant') {
      FAC.plant(`a night given back|возвращённая ночь|qaytarilgan kecha`); rep('tail', -1);
      fin([
        ['', `You take Hilola's wrist again and hum the night back into her: the lamp, the water, the words. It goes in like water into a dry pot, too fast.|Ты снова берёшь Хилолу за запястье и напеваешь ей ту ночь обратно: лампу, воду, слова. Ночь уходит в неё, как вода в сухой горшок, — слишком быстро.|Hilolaning bilagidan yana ushlab, o'sha kechani unga qaytarib xirgoyi qilasan: chiroqni, suvni, so'zlarni. U quruq ko'zaga quyilgan suvdek ichkariga kirib ketadi — juda tez.`],
        ['hilola', `...Farhod. Come inside. No. Here. Let them hear. I'll say it once.|...Фарход. Зайди в дом. Нет. Здесь. Пусть слышат. Я скажу один раз.|...Farhod. Uyga kir. Yo'q. Shu yerda. Eshitishsin. Bir marta aytaman.`],
        ['', `She tells it in the lane, in a flat voice, all of it: the names, the drain cover, who held which lamp. Doors close one by one as she talks. The walnut door closes last.|Она рассказывает прямо в переулке, ровным голосом, всё: имена, крышку стока, кто какую лампу держал. Пока она говорит, двери закрываются одна за другой. Ореховая — последней.|U hammasini ko'chaning o'zida, bir tekis ovozda aytadi: ismlarni, ariq qopqog'ini, kim qaysi chiroqni ushlaganini. U gapirgan sari eshiklar birin-ketin yopiladi. Yong'oq eshik — eng oxirida.`],
        ['farhod', `I'm staying. Somebody on this lane has to look her in the face, and it won't be them.|Я остаюсь. Кто-то в этом переулке должен смотреть ей в лицо, и это будут не они.|Men qolaman. Bu ko'chada kimdir uning yuziga qarashi kerak, ular esa qaramaydi.`],
        cl('surayyo', `You put a drowning back into a woman's head. ...And she stood there and said it out loud. I don't know whether to hit you or her.|Ты вернул женщине в голову утопленника. ...А она встала и сказала это вслух. Не знаю, кого из вас стукнуть.|Ayolning boshiga cho'kkan odamni qaytarib solding. ...U esa turib, buni ovoz chiqarib aytdi. Qaysi biringni urishni bilmayman.`),
        cl('alp', `She carried it once, for everyone. Now she carries it alone. Alp knows that weight.|Она уже несла это — за всех. Теперь несёт одна. Алп знает этот вес.|U buni bir marta hamma uchun ko'targan. Endi yolg'iz ko'taryapti. Alp bu og'irlikni biladi.`)
      ], `You planted the night back into Hilola. She told it to the whole lane herself. Doors closed on her; her son stayed.|Ты вернул ту ночь Хилолы. Она сама рассказала всё переулку. Перед ней закрылись двери, а сын остался.|O'sha kechani Hilolaga qaytarding. U hammasini ko'chaga o'zi aytdi. Eshiklar uning oldida yopildi, o'g'li esa qoldi.`, { surayyo: 5, alp: 5 });
    } else {
      addVoid(3, `a burned memory|сожжённая память|yoqilgan xotira`);
      fin([
        ['', `You let what you found flare and go out inside you: the hooks, the water, the words in the brass tube. For a moment you are warmer. Then you can't think why you came to this lane.|Ты даёшь найденному вспыхнуть и погаснуть внутри: крюки, вода, слова из латунной трубки. На миг становится теплее. Потом ты уже не помнишь, зачем пришёл в этот переулок.|Topganingni ichingda lov etib yonib, o'chishiga qo'yasan: ilmoqlarni, suvni, jez naychadagi so'zlarni. Bir lahza iliqroq bo'ladi. Keyin bu ko'chaga nega kelganingni eslolmay qolasan.`],
        ['hero', `I found nothing. I'm sorry.|Я ничего не нашёл. Прости.|Hech narsa topmadim. Kechir.`],
        ['farhod', `...Nothing. Like everyone here. Fine. The Rabat has work. My father isn't there either, but at least nobody says so in the same words.|...Ничего. Как и все тут. Ладно. На Рабате есть работа. Отца там тоже нет, но там хоть никто не говорит об этом одними словами.|...Hech narsa. Bu yerdagilarning hammasidek. Mayli. Rabotda ish bor. Otam u yerda ham yo'q, lekin hech bo'lmasa hech kim buni bir xil so'z bilan aytmaydi.`],
        cl('nargiza', `You burned it. Not hid it: burned it. There's nobody left anywhere who knows. Do you understand what you just did?|Ты это сжёг. Не спрятал — сжёг. Теперь нигде нет никого, кто знает. Ты понимаешь, что сделал?|Sen buni yoqding. Yashirmading — yoqding. Endi buni biladigan hech kim qolmadi. Nima qilganingni tushunyapsanmi?`),
        () => (sado() ? ['sado', `Ravshan? Why are we standing here? ...You don't know either. All right.|Равшан? А почему мы тут стоим? ...Ты тоже не знаешь. Ладно.|Ravshan? Nega shu yerda turibmiz? ...Sen ham bilmaysan. Mayli.`] : null)
      ], `You burned what you found and told Farhod there was nothing. He went back to the Rabat. The lane still says the same sentence.|Ты сжёг найденное и сказал Фарходу, что ничего не было. Он вернулся на Рабат. Переулок всё так же повторяет одну фразу.|Topganingni yoqib, Farhodga hech narsa yo'q edi deding. U Rabotga qaytdi. Ko'cha hamon bir gapni takrorlaydi.`, { nargiza: -15, surayyo: -5 });
    }
  }));

  /* ---------------------------------------------------------------- who says what, during and after */
  const L1 = {
    farhod: {
      truth: `"Names, aka. The Divan pays for names." Farhod dips his pen. "You'd know. You write them down too."|«Имена, ака. Диван платит за имена». Фарход макает перо. «Тебе ли не знать. Ты их тоже записываешь».|«Ismlar, aka. Devon ism uchun pul to'laydi». Farhod qalamini siyohga botiradi. «Sen bilasan-ku. Sen ham ularni yozasan».`,
      half: `"I lit his lamp again last night." Farhod doesn't look at the hook. "Everyone says he was a good man. In the same words. I've stopped noticing."|«Вчера опять зажёг его лампу». Фарход не смотрит на крюк. «Все говорят, что он был хорошим человеком. Одними словами. Я уже не замечаю».|«Kecha uning chirog'ini yana yoqdim». Farhod ilmoqqa qaramaydi. «Hamma uni yaxshi odam edi deydi. Bir xil so'zlar bilan. Endi sezmay qo'ydim».`,
      plant: `"She sleeps now. First time in years." Farhod is mending the walnut door, which someone has kicked in. "Not everyone on the lane is sleeping."|«Она теперь спит. Впервые за годы». Фарход чинит ореховую дверь, которую кто-то выбил. «Не все в переулке теперь спят».|«U endi uxlaydi. Yillardan beri birinchi marta». Farhod kimdir tepib sindirgan yong'oq eshikni tuzatyapti. «Ko'chada hamma ham uxlamayapti».`
    },
    hilola: {
      truth: `Hilola carries water from the next street alone. Nobody on the lane helps with the bucket. "He writes for the Divan now," she says. "He sends money. He doesn't come."|Хилола одна носит воду с соседней улицы. С ведром ей никто в переулке не помогает. «Он теперь пишет для Дивана, — говорит она. — Деньги шлёт. Сам не приходит».|Hilola qo'shni ko'chadan yolg'iz suv tashiydi. Ko'chada hech kim chelagini ko'tarishmaydi. «Endi Devonga yozadi, — deydi u. — Pul yuboradi. O'zi kelmaydi».`,
      half: `"A good man," Hilola says, sifting. "Everyone says so." Her hands are cold again. She doesn't know why.|«Хороший был человек, — говорит Хилола над ситом. — Все так говорят». Руки у неё опять ледяные. Она не знает почему.|«Yaxshi odam edi, — deydi Hilola, un elab. — Hamma shunday deydi». Qo'llari yana muzdek. Nimaga — bilmaydi.`,
      plant: `Hilola sits under the empty hook with a lit lamp in her lap. "I hold it every night now," she says. "Higher. Like they told me."|Хилола сидит под пустым крюком с зажжённой лампой на коленях. «Теперь держу её каждую ночь, — говорит она. — Выше. Как мне тогда велели».|Hilola bo'sh ilmoq tagida tizzasida yonib turgan chiroq bilan o'tiribdi. «Endi har kecha ushlab o'tiraman, — deydi u. — Balandroq. O'shanda aytishgandek».`,
      none: `Hilola nods to you politely, at your hands, as to any yodchi. "Farhod went back to the Rabat," she says. "It was a hard year."|Хилола вежливо кивает тебе — на руки, как любому ёдчи. «Фарход вернулся на Рабат, — говорит она. — Тяжёлый был год».|Hilola senga har qanday yodchiga qilgandek odob bilan, qo'lingga qarab bosh irg'aydi. «Farhod Rabotga qaytib ketdi, — deydi u. — Og'ir yil edi».`
    },
    nabi: {
      truth: `Nabi-aka swings a pick at the salt with a convict's chain on his ankle. "A night is a night," he says to the wall. "We paid with what we had."|Наби-ака бьёт кайлом соль, на щиколотке — каторжная цепь. «Ночь есть ночь, — говорит он стене. — Мы заплатили тем, что было».|Nabi aka oyog'ida mahkum kishani bilan tuzga ketmon uryapti. «Kecha — kecha-da, — deydi u devorga. — Nima bor bo'lsa, o'shani to'ladik».`,
      half: `"Bahrom was a good man," Nabi-aka tells you, polishing his door. "The whole lane says so."|«Бахром был хорошим человеком, — говорит Наби-ака, натирая дверь. — Весь переулок так говорит».|«Bahrom yaxshi odam edi, — deydi Nabi aka, eshigini artib. — Butun ko'cha shunday deydi».`,
      plant: `Nabi-aka's walnut door has been kicked in and nailed back. He doesn't open it for you any more.|Ореховую дверь Наби-аки кто-то выбил, и её прибили обратно. Тебе он больше не открывает.|Nabi akaning yong'oq eshigini kimdir tepib sindirgan, qayta mixlab qo'yishgan. Endi senga eshik ochmaydi.`,
      none: `"Bahrom went to the Rabat for work," Nabi-aka says before you can ask anything. He smiles. He means it.|«Бахром ушёл на Рабат на заработки», — говорит Наби-ака, прежде чем ты успел что-то спросить. Улыбается. Он в это верит.|«Bahrom Rabotga ishga ketgan», — deydi Nabi aka sen biror narsa so'rashga ulgurmasingdan. Jilmayadi. Chin dildan.`
    },
    mohira: {
      truth: `"They fined the lane a year of water." Mohira treads the clay a little faster. "I've had worse years. They can have one."|«Переулок оштрафовали на год воды». Мохира месит глину чуть быстрее. «У меня бывали годы и похуже. Пусть и у них будет один».|«Ko'chaga bir yillik suv jarimasi solishibdi». Mohira loyni sal tezroq pishitadi. «Mening bundan battar yillarim bo'lgan. Ularda ham bitta bo'lsin».`,
      half: `"They buried him like a saint. I went. Eleven lamps." Mohira doesn't stop treading. "So that's what I'm worth. Eleven lamps."|«Его похоронили как святого. Я ходила. Одиннадцать ламп». Мохира не перестаёт месить. «Вот, значит, сколько я стою. Одиннадцать ламп».|«Uni avliyodek dafn qilishdi. Bordim. O'n bitta chiroq». Mohira loy pishitishdan to'xtamaydi. «Demak, men shunchaga arziyman. O'n bitta chiroq».`,
      plant: `"Hilola came here. She stood at the pit and said my name, and then nothing, for an hour." Mohira wipes her face with a clay hand. "Most anyone's said to me in years."|«Хилола приходила. Стояла у ямы, назвала меня по имени и потом час молчала». Мохира утирает лицо глиняной рукой. «Мне столько годами никто не говорил».|«Hilola kelgandi. Chuqur yonida turib, ismimni aytdi, keyin bir soat jim turdi». Mohira loyli qo'li bilan yuzini artadi. «Yillardan beri menga hech kim bunchalik ko'p gapirmagan».`
    }
  };
  const after1 = (who, d) => {
    const b = br('qt1'), m = L1[who] || {};
    let line = m[b];
    if (who === 'mohira' && b === 'half' && sf('qt1_mohira') !== 'told') line = `Mohira treads clay. She doesn't know there was a funeral. She doesn't know there was anything.|Мохира месит глину. Она не знает, что были похороны. Она не знает, что вообще что-то было.|Mohira loy pishityapti. Dafn bo'lganini bilmaydi. Umuman biror narsa bo'lganini bilmaydi.`;
    play([['', line || FAC.NPC[who].def.idle]], d);
  };
  FAC.talk.farhod = d => {
    if (done('qt1')) { after1('farhod', d); return; }
    if (q('qt1').st === 'none') { q1offer(d); return; }
    if (sf('qt1_mohira')) { q1final(d); return; }
    const hint = !sf('qt1_s2') ? `Mother's in the third house. Nabi-aka has the good door. Both will tell you the same thing. Listen to how.|Мать — в третьем доме. У Наби-аки хорошая дверь. Оба скажут тебе одно и то же. Слушай, как скажут.|Onam uchinchi uyda. Nabi akaning eshigi chiroyli. Ikkalasi ham bir xil gapni aytadi. Qanday aytishiga quloq sol.`
      : !sf('qt1_bones') ? `You keep looking at the hooks. I do too. Every night since I got back.|Ты всё смотришь на крюки. Я тоже. Каждую ночь, как вернулся.|Sen ilmoqlarga qarayverasan. Men ham. Qaytganimdan beri har kecha.`
        : `You've found something. I can see it. Don't tell me yet. Finish first.|Ты что-то нашёл. Я вижу. Пока не говори. Сначала доведи до конца.|Nimadir topding. Ko'rib turibman. Hozircha aytma. Avval oxiriga yetkaz.`;
    play([['farhod', hint]], d);
  };
  FAC.talk.hilola = d => {
    if (done('qt1')) { after1('hilola', d); return; }
    if (act('qt1') && !sf('qt1_hilola')) { q1hilola(d); return; }
    play([['hilola', `Bahrom went to the Rabat for work.|Бахром ушёл на Рабат на заработки.|Bahrom Rabotga ishga ketgan.`]], d);
  };
  FAC.talk.nabi = d => {
    if (done('qt1')) { after1('nabi', d); return; }
    if (act('qt1') && !sf('qt1_nabi')) { q1nabi(d); return; }
    play([['nabi', `The lane pays on time, yodchi. Every year.|Переулок платит вовремя, ёдчи. Каждый год.|Ko'cha vaqtida to'laydi, yodchi. Har yili.`]], d);
  };
  FAC.talk.mohira = d => {
    if (done('qt1')) { after1('mohira', d); return; }
    if (act('qt1') && sf('qt1_bones') && !sf('qt1_mohira')) { q1mohira(d); return; }
    play([['', FAC.NPC.mohira.def.idle]], d);
  };

  // the lane, a day or more later
  COMP.beat('qt1_back', () => done('qt1') && COMP.region() === 'tail' && !COMP.inside() && since('qt1') >= 1, dn => {
    const b = br('qt1');
    const T = {
      truth: `Dry Mulberry Lane is dry in earnest now: the Divan's fine. The walnut door stands open on an empty room. Somebody has already taken the hinges.|Переулок сухой шелковицы теперь и правда сухой: штраф Дивана. Ореховая дверь распахнута в пустую комнату. Петли кто-то уже снял.|Quruq tut ko'chasi endi chindan quruq: Devon jarimasi. Yong'oq eshik bo'm-bo'sh xonaga lang ochiq. Oshiq-moshiqlarini kimdir allaqachon yechib olgan.`,
      half: `Eleven lamps burn on Dry Mulberry Lane tonight: a new one hangs on the rusted hook. The lane lights it for Bahrom every evening. Everyone says he was a good man, in the same words.|Сегодня в Переулке сухой шелковицы горят одиннадцать ламп: на ржавом крюке висит новая. Переулок каждый вечер зажигает её для Бахрома. Все говорят, что он был хорошим человеком, — одними словами.|Bugun Quruq tut ko'chasida o'n bitta chiroq yonyapti: zanglagan ilmoqda yangisi osig'liq. Ko'cha uni har oqshom Bahrom uchun yoqadi. Hamma uni yaxshi odam edi deydi — bir xil so'zlar bilan.`,
      plant: `Half the doors on Dry Mulberry Lane are boarded up. Two families have moved to the Potters' Quarter. Under the empty hook Hilola sits with a lit lamp in her lap.|Половина дверей в Переулке сухой шелковицы заколочена. Две семьи перебрались в Квартал гончаров. Под пустым крюком сидит Хилола с зажжённой лампой на коленях.|Quruq tut ko'chasidagi eshiklarning yarmi taxta bilan qoqib tashlangan. Ikki oila Kulollar mahallasiga ko'chib ketgan. Bo'sh ilmoq tagida tizzasida yonib turgan chiroq bilan Hilola o'tiribdi.`,
      none: `On Dry Mulberry Lane ten lamps burn and one hook stays empty. Somebody's talking about a man who went to the Rabat for work. You don't know who they mean.|В Переулке сухой шелковицы горят десять ламп, один крюк пустой. Кто-то говорит о человеке, который ушёл на Рабат на заработки. Ты не знаешь, о ком речь.|Quruq tut ko'chasida o'nta chiroq yonyapti, bitta ilmoq bo'sh. Kimdir Rabotga ishga ketgan odam haqida gapiryapti. Kim haqida ekanini bilmaysan.`
    };
    play([['', T[b] || T.half]], dn);
  });

  SIDE.epi('qt1', e => {
    if (!done('qt1')) return null;
    const told = sf('qt1_mohira') === 'told';
    return {
      truth: `Nabi-aka died in the Salt Mines in his second winter. Farhod became the best clerk on the Bazaar; he never forgot a name. His mother lived alone on Dry Mulberry Lane, and he sent her money, never himself.|Наби-ака умер в Соляных шахтах на вторую зиму. Фарход стал лучшим писарем Базара: он не забывал ни одного имени. Мать жила одна в Переулке сухой шелковицы; он слал ей деньги, но не приходил.|Nabi aka ikkinchi qishda Tuz konlarida vafot etdi. Farhod Bozorning eng yaxshi mirzasi bo'ldi: birorta ismni unutmasdi. Onasi Quruq tut ko'chasida yolg'iz yashadi; u pul yuborardi, o'zi kelmasdi.`,
      half: told ? `Dry Mulberry Lane lit a lamp for Bahrom every evening for as long as the lane stood. Everyone said he had been a good man. Mohira, at the kilns, said only: eleven lamps.|Переулок сухой шелковицы каждый вечер зажигал лампу для Бахрома, пока стоял сам переулок. Все говорили, что он был хорошим человеком. Мохира у печей говорила только: одиннадцать ламп.|Quruq tut ko'chasi o'zi turguncha har oqshom Bahrom uchun chiroq yoqdi. Hamma uni yaxshi odam edi derdi. Xumdonlar yonidagi Mohira esa faqat: o'n bitta chiroq, derdi.`
        : `Dry Mulberry Lane lit a lamp for Bahrom every evening for as long as the lane stood. Everyone said he had been a good man, and nobody could say why they wept.|Переулок сухой шелковицы каждый вечер зажигал лампу для Бахрома, пока стоял сам переулок. Все говорили, что он был хорошим человеком, и никто не мог сказать, отчего плачет.|Quruq tut ko'chasi o'zi turguncha har oqshom Bahrom uchun chiroq yoqdi. Hamma uni yaxshi odam edi derdi, hech kim nega yig'layotganini ayta olmasdi.`,
      plant: `Hilola remembered that night until she died and told it to anyone who asked. Few asked. Farhod stayed on the lane, married late, and named no son after his father.|Хилола помнила ту ночь до самой смерти и рассказывала всякому, кто спросит. Спрашивали немногие. Фарход остался в переулке, поздно женился и сына в честь отца не назвал.|Hilola o'sha kechani o'limigacha esladi va so'ragan har kimga aytib berdi. Kam odam so'radi. Farhod ko'chada qoldi, kech uylandi va o'g'liga otasining ismini qo'ymadi.`,
      none: `Farhod never came back from the Rabat. On Dry Mulberry Lane eleven households went on saying the same sentence, and the empty hook rusted through.|Фарход так и не вернулся с Рабата. В Переулке сухой шелковицы одиннадцать домов так и повторяли одну фразу, а пустой крюк проржавел насквозь.|Farhod Rabotdan qaytmadi. Quruq tut ko'chasidagi o'n bitta xonadon bir gapni takrorlashda davom etdi, bo'sh ilmoq esa zanglab, teshilib ketdi.`
    }[br('qt1')] || null;
  }, 'tail:doorstep');

  /* ================================================================ qt2 · TWO WIDOWS AND A BOWL */
  SIDE.quest('qt2', { n: 23, title: `Two Widows and a Bowl|Две вдовы и одна чаша|Ikki beva, bitta kosa`, where: ['tail', 'qt2home'] });
  FAC.spot('tail', 'qt2home', 0.78);
  FAC.spot('potters', 'qt2wheel', 0.74);
  FAC.spot('karez', 'qt2fall', 0.08);

  FAC.npc('zaynab', { name: CAST.zaynab.name, look: LK.zaynab, dx: 0, prompt: `Talk to the woman with the bowl|Поговорить с женщиной с чашей|Kosali ayol bilan gaplashish`, idle: `Zaynab sits on her doorstep. The bowl in her lap is empty and very beautiful.|Зайнаб сидит на пороге. Чаша у неё на коленях пустая и очень красивая.|Zaynab ostonasida o'tiribdi. Tizzasidagi kosa bo'sh va juda chiroyli.` },
    () => {
      if (br('qt2') === 'truth' && since('qt2') >= 1) return [{ from: 10, to: 16, region: 'potters', spot: 'qt1clay' }, { from: 16, to: 21, region: 'tail', spot: 'qt2home' }];
      return [{ from: 7, to: 21, region: 'tail', spot: 'qt2home' }];
    });
  FAC.npc('olmas', { name: CAST.olmas.name, look: LK.olmas, dx: 0, prompt: `Talk to the bowl-maker|Поговорить с мастером чаш|Kosagar bilan gaplashish`, idle: `Usta Ulmas's wheel turns under his foot without stopping. Rows of bowls dry in the sun, each with a name inside.|Круг под ногой уста Улмаса крутится без остановки. На солнце рядами сохнут чаши, в каждой — имя.|Usta O'lmasning oyog'i ostida charx to'xtovsiz aylanyapti. Quyoshda qator-qator kosalar quriyapti, har birining ichida ism.` },
    () => (br('qt2') === 'sab' ? [{ from: 7, to: 18, region: 'potters', spot: 'qt2wheel' }, { from: 18, to: 23, region: 'tail', spot: 'chai:tail_plane:in' }] : [{ from: 7, to: 20, region: 'potters', spot: 'qt2wheel' }]));
  FAC.npc('sabohat', { name: CAST.sabohat.name, look: LK.sabohat, dx: 72, prompt: `Knock on the blue door|Постучать в синюю дверь|Ko'k eshikni taqillatish`, idle: `A woman in a blue scarf scrubs a blue door that doesn't need scrubbing. A clay lion's head stares out from the middle of it.|Женщина в синем платке трёт синюю дверь, которую незачем тереть. С середины двери смотрит глиняная львиная голова.|Ko'k ro'molli ayol artishga hojat yo'q ko'k eshikni artyapti. Eshik o'rtasidan loydan yasalgan sher boshi qarab turibdi.` },
    () => [{ from: 7, to: 20, region: 'potters', spot: 'qt2wheel' }]);

  /* ---------------------------------------------------------------- the offer and the bowl */
  const Q1REF = {
    truth: `Since the Divan took Nabi-aka from the next lane, everyone round here complains to yodchis. So I'm complaining.|С тех пор как Диван забрал Наби-аку с соседнего переулка, тут все жалуются ёдчи. Вот и я жалуюсь.|Devon qo'shni ko'chadan Nabi akani olib ketgandan beri bu yerda hamma yodchiga shikoyat qiladi. Men ham shikoyat qilyapman.`,
    half: `The next lane buried a man last week and wept as if he were a saint. I can't even get my own dead to taste right.|На соседнем переулке на днях хоронили человека и плакали, как по святому. А у меня даже свой покойник не тем отдаёт.|Qo'shni ko'chada yaqinda bir odamni dafn qilishdi, avliyoga yig'lagandek yig'lashdi. Menda esa o'z marhumimning ta'mi ham boshqa.`
  };
  const q2offer = d => play([
    ['', `A woman in a dark scarf sits on her doorstep with a glazed bowl in her lap: deep green, a white rim, a name painted inside. She isn't eating from it.|На пороге сидит женщина в тёмном платке, на коленях — глазурованная чаша: густо-зелёная, белый край, внутри выписано имя. Есть из неё она не ест.|Ostonada qora ro'molli ayol o'tiribdi, tizzasida sirlangan kosa: to'q yashil, oq gardishli, ichiga ism yozilgan. U undan ovqat yemayapti.`],
    () => (done('qt1') && Q1REF[br('qt1')] ? ['zaynab', Q1REF[br('qt1')]] : null),
    ['zaynab', `Yodchi. You know tumars. Then tell me what's in this one, because it isn't my husband.|Ёдчи. Ты разбираешься в тумарах. Тогда скажи, что в этой, потому что это не мой муж.|Yodchi. Sen tumarlarni bilasan. Unda ayt-chi, bunda nima bor, chunki bu mening erim emas.`]
  ], () => hub(`Zaynab|Зайнаб|Zaynab`, [
    { label: `— What is the bowl?|— Что это за чаша?|— Bu qanaqa kosa?`, lines: [
      ['zaynab', `Usta Ulmas in the Potters' Quarter makes them. He grinds the dead's tumars into the glaze. Tohir left his with him, he says.|Их делает уста Улмас в Квартале гончаров. Растирает тумары покойников в глазурь. Тахир, говорит, сам оставил ему свои.|Ularni Kulollar mahallasida usta O'lmas yasaydi. Marhumlarning tumarlarini maydalab, sirga qo'shadi. Aytishicha, Tohir o'z tumarlarini unga o'zi qoldirgan.`],
      ['zaynab', `You eat from it, and a minute of him comes up with the steam. A month of suppers, maybe two. Then it's just a bowl.|Ешь из неё — и с паром поднимается минута того человека. На месяц ужинов хватит, может, на два. Потом это просто чаша.|Undan ovqat yeysan — bug' bilan birga o'sha odamdan bir daqiqa ko'tariladi. Bir oylik kechki ovqatga yetadi, balki ikki oyga. Keyin oddiy kosa bo'lib qoladi.`]
    ] },
    { label: `— Who was your husband?|— Кем был ваш муж?|— Eringiz kim edi?`, lines: [
      ['zaynab', `Tohir. A water-carrier: twenty years hauling the Tail's skins through the karez. He fell in the karez a month ago, carrying water at night for somebody. He never said for whom.|Тахир. Водонос: двадцать лет таскал бурдюки Хвоста по кяризам. Месяц назад сорвался там — нёс ночью кому-то воду. Кому — никогда не говорил.|Tohir. Meshkob edi: yigirma yil Dumning meshlarini korezlarda tashidi. Bir oy oldin o'sha yerda yiqildi — kechasi kimgadir suv olib ketayotgan edi. Kimga — hech qachon aytmasdi.`],
      cl('surayyo', `Tohir-aka. He carried for me when my arms gave out. ...I'm sorry, Zaynab-opa.|Тахир-ака. Он носил за меня, когда у меня руки отказывали. ...Соболезную, Зайнаб-опа.|Tohir aka. Qo'llarim ishlamay qolganda men uchun tashirdi. ...Boshingiz omon bo'lsin, Zaynab opa.`)
    ] },
    { label: `— What do you taste?|— А что вы видите, когда едите?|— Yeganingizda nimani ko'rasiz?`, lines: [
      ['zaynab', `A blue door. A woman laughing with her mouth full. A child shouting "Dada!" We never had children. I don't own a blue door.|Синюю дверь. Женщину, которая смеётся с полным ртом. Ребёнка, который кричит: «Дада!» У нас не было детей. И синей двери у меня нет.|Ko'k eshik. Og'zi to'la kulayotgan ayol. «Dada!» deb qichqirayotgan bola. Bizning bolamiz bo'lmagan. Menda ko'k eshik ham yo'q.`],
      () => (sado() ? ['sado', `Maybe the potter mixed up two dead men. ...Can you mix up dead men?|Может, гончар перепутал двух покойников? ...А покойников можно перепутать?|Balki kulol ikki marhumni adashtirgandir? ...Marhumlarni adashtirib bo'ladimi?`] : null)
    ] }
  ], [
    { id: 'yes', label: `"Give me the bowl. I'll find out whose minute it is."|«Дайте чашу. Узнаю, чья это минута.»|«Kosani bering. Bu kimning daqiqasi ekanini bilib kelaman.»` },
    { id: 'no', label: `"A bowl is a bowl, opa. Eat."|«Чаша есть чаша, опа. Ешьте.»|«Kosa — kosa-da, opa. Yeyavering.»` }
  ], o => {
    if (o.id !== 'yes') { play([['zaynab', `That's what everyone says. Eat. As if it were soup.|Все так говорят. Ешьте. Как будто это суп.|Hamma shunday deydi. Yeyavering. Go'yo bu sho'rva.`]], d); return; }
    FAC.begin('qt2', `Zaynab's memorial bowl, glazed with her late husband Tohir's tumars, shows her a blue door, another woman and a child. Taste it, then find Usta Ulmas in the Potters' Quarter.|Поминальная чаша Зайнаб с глазурью из тумаров её покойного мужа Тахира показывает синюю дверь, чужую женщину и ребёнка. Испей её, потом найди уста Улмаса в Квартале гончаров.|Zaynabning marhum eri Tohirning tumarlaridan sirlangan xotira kosasi ko'k eshikni, begona ayolni va bolani ko'rsatadi. Uni totib ko'r, keyin Kulollar mahallasida usta O'lmasni top.`, ['tail', 'qt2home']);
    play([['zaynab', `Take it. Taste it first, here, if you like. Then take it to Ulmas and break it over his head.|Бери. Сначала попробуй, прямо тут, если хочешь. Потом отнеси Улмасу и разбей о его голову.|Ol. Xohlasang, avval shu yerda totib ko'r. Keyin O'lmasga olib borib, boshiga urib sindir.`]], () => q2bowl(d));
  }));
  const q2bowl = d => ask(`The bowl is cold and heavier than it looks.|Чаша холодная и тяжелее, чем кажется.|Kosa sovuq va ko'rinishidan og'irroq.`, [
    FAC.craft('taste', `the bowl, here and now|чашу — прямо здесь|kosani — shu yerning o'zida`, { id: 'taste' }),
    { id: 'later', label: `"Later. Not on your doorstep."|«Потом. Не на вашем пороге.»|«Keyin. Ostonangizda emas.»` }
  ], o => {
    if (o.id !== 'taste') { d(); return; }
    FAC.taste([
      ['memory', `A blue door with a clay lion's head for a knocker. Quince on the step. The smell of kilns.|Синяя дверь, вместо колотушки — глиняная львиная голова. На пороге айва. Пахнет печами.|Ko'k eshik, taqillatgich o'rniga loydan sher boshi. Ostonada behi. Xumdon hidi keladi.`],
      ['memory', `A woman laughing with her mouth full, waving a spoon. A boy of five on a water-carrier's shoulders, shouting "Dada, faster!"|Женщина смеётся с полным ртом и машет ложкой. Мальчишка лет пяти на плечах у водоноса кричит: «Дада, быстрее!»|Og'zi to'la ayol qoshiq silkitib kulyapti. Meshkobning yelkasidagi besh yashar bola: «Dada, tezroq!» deb qichqiryapti.`],
      ['memory', `Under it, faint as a second coat of glaze: a roof at night, a young Zaynab, a wedding cap. It's there. It's only thinner.|Под этим, слабо, как второй слой глазури: крыша ночью, молодая Зайнаб, свадебная тюбетейка. Это там есть. Просто тоньше.|Uning tagida, ikkinchi qavat sirdek xira: tunda tom, yosh Zaynab, to'y do'ppisi. Bu ham bor. Faqat yupqaroq.`],
      ['', `It's the same man in both. One of the two memories is simply louder.|Мужчина в обоих — один и тот же. Просто одно воспоминание громче другого.|Ikkalasida ham o'sha bir erkak. Shunchaki xotiralardan biri balandroq.`],
      ['zaynab', `Well? Did the potter cheat me?|Ну? Гончар меня обманул?|Xo'sh? Kulol meni aldadimi?`],
      ['hero', `I'll ask him.|Спрошу у него.|Undan so'rayman.`]
    ], () => q2tasted(d), { intro: `You lift the cold bowl to your face. Under the glaze something warm turns over.|Подносишь холодную чашу к лицу. Под глазурью ворочается что-то тёплое.|Sovuq kosani yuzingga yaqinlashtirasan. Sir ostida nimadir iliq aylanadi.` });
  });
  const q2tasted = d => {
    set('qt2_tasted');
    FAC.stepTo('qt2', `The bowl holds Tohir, but more of a blue door with a clay lion, a woman and a boy than of Zaynab. Ask Usta Ulmas in the Potters' Quarter where the tumars came from.|В чаше Тахир, но синей двери с глиняным львом, женщины и мальчика в ней больше, чем Зайнаб. Спроси уста Улмаса в Квартале гончаров, откуда тумары.|Kosada Tohir bor, lekin unda Zaynabdan ko'ra loy sherli ko'k eshik, ayol va bola ko'proq. Kulollar mahallasidagi usta O'lmasdan tumarlar qayerdan kelganini so'ra.`, ['potters', 'qt2wheel']);
    d();
  };

  /* ---------------------------------------------------------------- the bowl-maker */
  const q2two = (d, how) => {
    set('qt2_two', how);
    play([
      ['olmas', `Where the blue door is, I don't know. I make bowls, not doors. Somewhere in this quarter: that memory smells of our kilns.|Где эта синяя дверь, не знаю. Я делаю чаши, а не двери. Где-то в нашем квартале: та память пахнет нашими печами.|Ko'k eshik qayerdaligini bilmayman. Men kosa yasayman, eshik emas. Shu mahallada bir joyda: u xotiradan bizning xumdonlarimiz hidi keladi.`]
    ], () => {
      FAC.stepTo('qt2', `Tohir left Ulmas two tumars: one for his wife, one "for the blue door". Ulmas glazed both into the bowl Zaynab paid for. Find the blue door with a clay lion in the Potters' Quarter.|Тахир оставил Улмасу два тумара: один — жене, другой — «для синей двери». Улмас вплавил оба в чашу, за которую заплатила Зайнаб. Найди в Квартале гончаров синюю дверь с глиняным львом.|Tohir O'lmasga ikkita tumar qoldirgan: biri xotiniga, biri «ko'k eshik uchun». O'lmas ikkalasini Zaynab pul to'lagan kosaga qo'shib yuborgan. Kulollar mahallasidan loy sherli ko'k eshikni top.`, ['potters', 'qt2wheel']);
      d();
    });
  };
  const q2vat = d => FAC.taste([
    ['memory', `Ulmas's hands, two tumars in them. He weighs them, one in each palm, like a man choosing between two melons.|Руки Улмаса, в них два тумара. Он взвешивает их, по одному на ладони, как человек, выбирающий из двух дынь.|O'lmasning qo'llari, ularda ikkita tumar. Har kaftida bittadan tortib ko'radi, ikki qovun orasidan tanlayotgan odamdek.`],
    ['memory', `"The blue door never came," he says to nobody. "The widow pays." Both tumars go into the mortar.|«От синей двери никто не пришёл, — говорит он в пустоту. — Вдова платит». Оба тумара летят в ступку.|«Ko'k eshikdan hech kim kelmadi, — deydi u hech kimga qaratmay. — Beva to'laydi». Ikkala tumar ham hovonchaga tushadi.`],
    ['olmas', `...So you've tasted my vat. Yes. Two. One for his wife, one for the blue door. Don't look at me like that. I'm a potter, not a postman.|...Значит, испил мой чан. Да. Два. Один жене, другой синей двери. Не смотри так. Я гончар, а не почтальон.|...Demak, xumimni totib ko'rding. Ha. Ikkita. Biri xotiniga, biri ko'k eshikka. Bunday qarama. Men kulolman, chopar emasman.`]
  ], () => q2two(d, 'vat'), { intro: `The vat is crusted green to the brim. You lay your palm flat on the crust.|Чан до краёв зарос зелёной коркой. Кладёшь ладонь на корку.|Xum chetigacha yashil qasmoq bilan qoplangan. Kaftingni qasmoqqa qo'yasan.` });
  const q2olmas = d => play([
    ['', `Usta Ulmas's yard is full of bowls drying in rows, each with a name painted inside. The wheel keeps turning under his foot even when he looks up.|Двор уста Улмаса заставлен рядами сохнущих чаш, в каждой выписано имя. Круг под его ногой не останавливается, даже когда он поднимает голову.|Usta O'lmasning hovlisi qator-qator qurib turgan kosalarga to'la, har birining ichiga ism yozilgan. U boshini ko'targanda ham oyog'i ostidagi charx aylanaveradi.`],
    ['olmas', `Tohir's bowl. Good glaze, that. The widow's unhappy? They're all unhappy. They want the dead as they remember them. I can only give them what the dead remembered.|Чаша Тахира. Хорошая глазурь. Вдова недовольна? Они все недовольны. Им нужен покойник таким, каким они его помнят. А я могу дать только то, что помнил он сам.|Tohirning kosasi. Yaxshi sir. Beva norozimi? Hammasi norozi. Ularga marhum o'zlari eslagandek kerak. Men esa faqat marhumning o'zi nimani eslaganini bera olaman.`]
  ], () => {
    const tried = {};
    const loop = () => hub(`Usta Ulmas|Уста Улмас|Usta O'lmas`, [
      { label: `— Where did Tohir's tumars come from?|— Откуда у вас тумары Тахира?|— Tohirning tumarlari sizga qayerdan kelgan?`, lines: [
        ['olmas', `He left them with me himself, a year ago. A careful man; he knew the karez. The widow paid for the bowl. All honest.|Сам оставил, год назад. Осторожный был человек, кяризы знал. Вдова заплатила за чашу. Всё честно.|O'zi qoldirgan, bir yil oldin. Ehtiyotkor odam edi, korezni bilardi. Beva kosaning pulini to'ladi. Hammasi halol.`]
      ] },
      { label: `— Who eats from these bowls?|— Кто ест из этих чаш?|— Bu kosalardan kim yeydi?`, lines: [
        ['olmas', `Widows, mostly. Mothers. One old man eats from his dog. Don't laugh; it was a good dog.|Вдовы в основном. Матери. Один старик ест из своей собаки. Не смейся, собака была хорошая.|Asosan bevalar. Onalar. Bir chol itining kosasidan yeydi. Kulma, yaxshi it edi.`]
      ] }
    ], [
      tried.press ? null : FAC.chk('collection', 3, `"Usta, I count tumars for a living. That glaze is two of them, not one. Who was the second for?"|«Уста, я тумары считаю по работе. В этой глазури их два, а не один. Для кого был второй?»|«Usta, tumar sanash mening kasbim. Bu sirda bitta emas, ikkita tumar bor. Ikkinchisi kim uchun edi?»`, { id: 'press' }),
      tried.eye ? null : FAC.chk('mem', 5, `"The glaze is two greens, one over the other. You mixed it from two."|«Глазурь — два зелёных, один поверх другого. Вы мешали её из двух.»|«Sir ikki xil yashil, biri ikkinchisining ustida. Uni ikkitasidan qorgansiz.»`, { id: 'eye' }),
      FAC.craft('taste', `the glaze vat Tohir's colour was mixed in|чан, в котором мешали цвет Тахира|Tohirning rangi qorilgan sir xumini`, { id: 'vat' }),
      { id: 'bye', label: `"I'll be back."|«Я ещё вернусь.»|«Hali qaytaman.»` }
    ].filter(Boolean), o => {
      if (o.id === 'bye') { d(); return; }
      if (o.id === 'vat') { q2vat(d); return; }
      tried[o.id] = 1;
      if (!o.ok) {
        play([['olmas', o.id === 'press' ? `Count your own tumars, yodchi. Mine are paid for.|Свои тумары считай, ёдчи. Мои оплачены.|O'z tumarlaringni sana, yodchi. Menikilar to'langan.` : `Green is green. You're not a potter. Go and taste something.|Зелёный есть зелёный. Ты не гончар. Иди испей что-нибудь.|Yashil — yashil-da. Sen kulol emassan. Bor, biror narsani totib ko'r.`]], loop);
        return;
      }
      play([
        ['olmas', `...Two. He brought two. "This one for my wife, that one for the blue door." Nobody from the blue door came to pay. The widow did. A bowl takes what you put in it, yodchi.|...Два. Он принёс два. «Этот — жене, тот — для синей двери». От синей двери никто платить не пришёл. Вдова пришла. Чаша берёт то, что в неё положили, ёдчи.|...Ikkita. Ikkitasini olib kelgan. «Bunisi xotinimga, unisi ko'k eshikka». Ko'k eshikdan hech kim pul to'lagani kelmadi. Beva keldi. Kosa nima solsang, o'shani oladi, yodchi.`]
      ], () => q2two(d, o.id));
    });
    loop();
  });
  FAC.prop('potters', 'qt2wheel', { id: 'qt2vat', art: 'f6crate', dx: 34, prompt: `Look into the glaze vat|Заглянуть в чан с глазурью|Sir xumiga qarash`, when: () => act('qt2') && !!sf('qt2_tasted') && !sf('qt2_two'), use: d => ask(`A vat crusted green to the brim.|Чан, до краёв заросший зелёной коркой.|Chetigacha yashil qasmoq bosgan xum.`, [
    FAC.craft('taste', `the glaze vat|чан с глазурью|sir xumini`, { id: 'vat' }),
    { id: 'no', label: `Leave it.|Не трогать.|Tegmaslik.` }
  ], o => (o.id === 'vat' ? q2vat(d) : d())) });

  /* ---------------------------------------------------------------- the blue door */
  const q2blue = d => play([
    ['', `A blue door with a clay lion's head. Quince on the step. A boy of five is drawing water-carriers in the dust with a stick, all of them with enormous shoulders.|Синяя дверь с глиняной львиной головой. Айва на пороге. Мальчик лет пяти рисует палкой в пыли водоносов — у всех огромные плечи.|Loydan sher boshli ko'k eshik. Ostonada behi. Besh yashar bola changga tayoqcha bilan meshkoblar chizyapti — hammasining yelkasi juda katta.`],
    ['sabohat', `Doniyor, inside. ...You're the yodchi from the Tail. If he owed money, he owed it to me too. Get in the queue.|Дониёр, в дом. ...Ты ёдчи из Хвоста. Если он кому-то задолжал, то и мне тоже. Становись в очередь.|Doniyor, uyga kir. ...Sen Dumdan kelgan yodchisan. Agar u kimgadir qarzdor bo'lsa, menga ham qarzdor. Navbatga tur.`]
  ], () => hub(`Sabohat|Сабохат|Sabohat`, [
    { label: `— How did you know Tohir?|— Откуда вы знали Тахира?|— Tohirni qayerdan tanirdingiz?`, lines: [
      ['sabohat', `Six years ago our well went bitter and he carried for this street. He kept carrying after it came clear again. That's how.|Шесть лет назад у нас загорчил колодец, и он носил воду на нашу улицу. И продолжал носить, когда вода снова стала чистой. Вот так.|Olti yil oldin qudug'imiz achchiq bo'lib qoldi, u ko'chamizga suv tashidi. Suv yana tozalangandan keyin ham tashishda davom etdi. Shunday.`]
    ] },
    { label: `— Did you know he had a wife?|— Вы знали, что у него есть жена?|— Uning xotini borligini bilarmidingiz?`, lines: [
      ['sabohat', `From the first day. He never lied to me. He just never told her. I've hated her for six years and never met her. Is she pretty?|С первого дня. Мне он никогда не врал. Просто ей не говорил. Я её шесть лет ненавижу и ни разу не видела. Она красивая?|Birinchi kundan. Menga hech qachon yolg'on gapirmagan. Faqat unga aytmagan. Olti yildan beri uni yomon ko'raman, bir marta ham ko'rmaganman. Chiroylimi?`]
    ] },
    { label: `— How did he die?|— Как он погиб?|— U qanday halok bo'ldi?`, lines: [
      ['sabohat', `Bringing us water. At night, through the karez under the kilns, from the Tail's turn. Somebody gave him an hour of the Tail's water every week. He fell on the way back.|Нёс нам воду. Ночью, кяризом под печами, из очереди Хвоста. Кто-то каждую неделю отдавал ему час воды Хвоста. Сорвался на обратном пути.|Bizga suv olib kelayotgan edi. Kechasi, xumdonlar ostidagi korez orqali, Dumning navbatidan. Kimdir unga har hafta Dumning bir soatlik suvini berardi. Qaytishda yiqildi.`],
      () => (FAC.inParty('surayyo') ? ['', `Surayyo looks at the ground and says nothing, which is not like her.|Сурайё смотрит в землю и молчит, а это на неё не похоже.|Surayyo yerga qarab jim turibdi, bu esa unga o'xshamaydi.`] : null)
    ] }
  ], [
    { id: 'told', label: `"He left you something. A memory, in a tumar. It's in another woman's bowl now."|«Он вам кое-что оставил. Память, в тумаре. Сейчас она в чаше у другой женщины.»|«U sizga bir narsa qoldirgan. Tumardagi xotira. Hozir u boshqa ayolning kosasida.»` },
    { id: 'kept', label: `"I was only asking about the water. I'm sorry for your loss."|«Я только про воду спрашивал. Соболезную.»|«Shunchaki suv haqida so'radim. Boshingiz omon bo'lsin.»` }
  ], o => {
    set('qt2_sab', o.id);
    play(o.id === 'told' ? [
      ['sabohat', `...He left us something. And she's eating it. With a spoon.|...Он нам что-то оставил. А она это ест. Ложкой.|...U bizga nimadir qoldirgan. U esa buni yeyapti. Qoshiq bilan.`],
      ['sabohat', `Doniyor has nothing of him but his ears. I don't want money, yodchi. I want what's ours.|У Дониёра от него ничего, кроме ушей. Мне не нужны деньги, ёдчи. Мне нужно наше.|Doniyorda undan quloqlaridan boshqa hech narsa yo'q. Menga pul kerak emas, yodchi. Menga biznikini bering.`]
    ] : [
      ['sabohat', `If you're sorry, carry a bucket here some time. Nobody does now.|Если соболезнуешь — принеси как-нибудь ведро воды. Теперь никто не носит.|Rahming kelsa, bir kun bir chelak suv olib kel. Endi hech kim olib kelmaydi.`]
    ], () => {
      FAC.stepTo('qt2', `Behind the blue door: Sabohat and Doniyor, Tohir's other family. He died in the karez under the kilns, carrying them the Tail's water. The place he fell may remember the rest.|За синей дверью — Сабохат и Дониёр, другая семья Тахира. Он погиб в кяризе под печами, когда нёс им воду Хвоста. Место, где он сорвался, может помнить остальное.|Ko'k eshik ortida — Sabohat va Doniyor, Tohirning boshqa oilasi. U ularga Dumning suvini olib ketayotib, xumdonlar ostidagi korezda halok bo'lgan. U yiqilgan joy qolganini eslashi mumkin.`, ['karez', 'qt2fall']);
      d();
    });
  }));

  /* ---------------------------------------------------------------- the ledge */
  const q2ledge = d => FAC.taste([
    ['memory', `A woman's hoarse voice from the sluice wheel above: "One hour, Tohir. Same as always. And if anyone asks, I never saw you."|Сверху, от шлюзового колеса, хриплый женский голос: «Час, Тахир. Как всегда. И если кто спросит — я тебя не видела».|Tepadan, shlyuz g'ildiragi tomondan, ayolning xirillagan ovozi: «Bir soat, Tohir. Har doimgidek. Kim so'rasa — men seni ko'rmadim».`],
    ['memory', `Two full skins on his back. He talks to himself to keep his footing: "Ulmas has them both. One for each door."|На спине два полных бурдюка. Он говорит сам с собой, чтобы не оступиться: «Оба у Улмаса. По одному на каждую дверь».|Orqasida ikkita to'la mesh. Oyog'i toyilmasin deb o'zi bilan gaplashadi: «Ikkalasi O'lmasda. Har eshikka bittadan».`],
    ['memory', `"Zaynab will be angry for a year. Then she'll understand. Or she won't. Either way she'll have—" The ledge is wet. The rest is water.|«Зайнаб год будет злиться. Потом поймёт. Или не поймёт. Так или иначе, у неё будет…» Уступ мокрый. Дальше — вода.|«Zaynab bir yil jahl qiladi. Keyin tushunadi. Yoki tushunmaydi. Har holda unda bo'ladi…» Tokcha ho'l. Keyingisi — suv.`],
    () => (FAC.inParty('surayyo') ? [
      ['surayyo', `That was my voice. Yes. I gave him the hour every week. Their boy had a fever and their well was bitter.|Это был мой голос. Да. Я отдавала ему этот час каждую неделю. У мальчика был жар, а колодец у них горчил.|Bu mening ovozim edi. Ha. Har hafta o'sha bir soatni unga berardim. Bolasi isitmalagan, quduqlari achchiq edi.`],
      ['surayyo', `I'd do it again. The Tail could spare an hour. ...I took the hour from Zaynab's street.|Я бы и сейчас так сделала. Хвост мог обойтись без часа. ...Этот час я брала с улицы Зайнаб.|Yana shunday qilardim. Dum bir soatsiz ham yashardi. ...O'sha soatni Zaynabning ko'chasidan olardim.`]
    ] : ['', `The voice at the wheel was a mirab's. The Tail has only one mirab left.|Голос у колеса был голосом мираба. В Хвосте остался только один мираб.|G'ildirak yonidagi ovoz mirobniki edi. Dumda bitta mirob qolgan.`])
  ], () => {
    set('qt2_fall');
    FAC.stepTo('qt2', `Tohir meant one tumar for each door and told Ulmas so. Go back to Usta Ulmas and decide what becomes of the bowl.|Тахир предназначал по тумару каждой двери и сказал об этом Улмасу. Вернись к уста Улмасу и реши, что будет с чашей.|Tohir har eshikka bittadan tumar atagan va buni O'lmasga aytgan. Usta O'lmasning oldiga qayt va kosa nima bo'lishini hal qil.`, ['potters', 'qt2wheel']);
    d();
  }, { intro: `A narrow ledge over fast black water. Someone has scratched a water-carrier's tally into the stone. You touch it.|Узкий уступ над быстрой чёрной водой. На камне нацарапан счёт водоноса. Ты касаешься его.|Tez oqayotgan qora suv ustida tor tokcha. Toshga meshkobning hisobi tirnab yozilgan. Unga tegasan.` });
  FAC.prop('karez', 'qt2fall', { id: 'qt2ledge', art: 'f6glint', prompt: `Taste the ledge where Tohir fell|Испить уступ, где сорвался Тахир|Tohir yiqilgan tokchani totib ko'rish`, when: () => act('qt2') && !!sf('qt2_sab') && !sf('qt2_fall'), use: d => q2ledge(d) });

  /* ---------------------------------------------------------------- the bowl decides nothing; you do */
  const q2decide = d => play([
    ['olmas', `Back again, with the bowl. You've been in the karez; I can see it. Everyone comes back from there with the same face.|Опять ты, с чашей. Был в кяризе — по лицу вижу. Оттуда все возвращаются с одинаковым лицом.|Yana sen, kosa bilan. Korezda bo'libsan — yuzingdan ko'rinib turibdi. U yerdan hamma bir xil yuz bilan qaytadi.`],
    ['olmas', `Well, yodchi? I can grind a bowl down, but only once. Clay forgives one mistake.|Ну, ёдчи? Чашу я могу перемолоть, но только один раз. Глина прощает одну ошибку.|Xo'sh, yodchi? Kosani maydalay olaman, lekin faqat bir marta. Loy bitta xatoni kechiradi.`]
  ], () => hub(`The bowl|Чаша|Kosa`, [
    { label: `— What happens if you split it?|— Что будет, если её разделить?|— Uni bo'lsangiz nima bo'ladi?`, lines: [
      ['olmas', `Two bowls, half a man in each. Half a man wears out twice as fast. And the widow's half is the thin one; you've tasted it.|Две чаши, в каждой по полчеловека. Полчеловека стирается вдвое быстрее. И вдовья половина — тонкая, ты пробовал.|Ikkita kosa, har birida yarimta odam. Yarimta odam ikki baravar tez yeyiladi. Bevaning yarmi esa yupqa, totib ko'rgansan.`]
    ] },
    { label: `— Why did you put both in one bowl?|— Зачем вы положили оба в одну чашу?|— Nega ikkalasini bitta kosaga soldingiz?`, lines: [
      ['olmas', `One woman paid and the other never came. And a bowl with one thin tumar tastes of water; they come back and shout. I'm not proud of it. I'm a potter with rent.|Одна заплатила, другая не пришла. А чаша с одним тонким тумаром отдаёт водой, и потом приходят и кричат. Я этим не горжусь. Я гончар, у меня аренда.|Biri to'ladi, ikkinchisi kelmadi. Bitta yupqa tumarli kosa esa suv ta'mini beradi, keyin kelib baqirishadi. Bundan faxrlanmayman. Men ijarada o'tirgan kulolman.`]
    ] }
  ], [
    { id: 'split', price: 40, label: `"Grind it down. Two bowls, one for each door, the way he asked. I'll pay for the clay."|«Перемелите. Две чаши, по одной на каждую дверь, как он просил. За глину плачу я.»|«Maydalang. Ikkita kosa, har eshikka bittadan, u so'raganidek. Loyning pulini men to'layman.»` },
    { id: 'truth', label: `"Nothing. I'm taking it back to Zaynab, and I'm telling her whose bowl it is."|«Ничего. Я отнесу её Зайнаб и скажу, чья это чаша.»|«Hech narsa. Uni Zaynabga qaytaraman va bu kimning kosasi ekanini aytaman.»` },
    { id: 'sab', price: 30, label: `"The whole bowl goes to the blue door. I'll pay the widow back myself and tell her I dropped it."|«Вся чаша — синей двери. Вдове я сам верну деньги и скажу, что уронил её.»|«Butun kosa ko'k eshikka. Bevaga pulini o'zim qaytaraman va tushirib yubordim deyman.»` },
    FAC.craft('burn', `Tohir out of the glaze. Nobody eats from him.|Тахира из глазури. Пусть никто из него не ест.|Tohirni sirdan. Undan hech kim ovqat yemasin.`, { id: 'burn' })
  ], o => {
    const told = sf('qt2_sab') === 'told';
    const fin = (lines, text, deltas) => {
      FAC.react(deltas, 'qt2');
      play(lines, () => { FAC.finish('qt2', o.id, text); d(); });
    };
    if (o.id === 'split') {
      gold(-40); rep('tail', 1);
      fin([
        ['', `Ulmas breaks the green bowl in a cloth, grinds it, and spends the whole afternoon sorting the powder with a wet thumb, grain by grain.|Улмас разбивает зелёную чашу в тряпице, растирает её и до вечера разбирает порошок мокрым пальцем, крупинку за крупинкой.|O'lmas yashil kosani latta ichida sindirib, maydalaydi va kun bo'yi kukunni ho'l barmog'i bilan donama-don ajratadi.`],
        ['', `Two bowls come out of the kiln at dusk: one deep green, one so pale it's nearly white.|К сумеркам из печи выходят две чаши: одна густо-зелёная, другая такая бледная, что почти белая.|Shom paytida xumdondan ikkita kosa chiqadi: biri to'q yashil, ikkinchisi shunchalik oqishki, deyarli oq.`],
        ['sabohat', `Doniyor. Come here. Eat. ...No, slowly. Slowly. Do you see him?|Дониёр. Иди сюда. Ешь. ...Нет, медленно. Медленно. Видишь его?|Doniyor. Bu yoqqa kel. Ye. ...Yo'q, sekin. Sekin. Ko'ryapsanmi uni?`],
        ['zaynab', `It's paler. It tastes of water. ...But it's me in it. Only me. He loved me this little? Or the potter's cheating me again.|Она бледнее. Отдаёт водой. ...Но там я. Только я. Он так мало меня любил? Или гончар опять меня дурит.|Bu oqroq. Suv ta'mi bor. ...Lekin unda men. Faqat men. Meni shunchalik oz sevganmi? Yoki kulol yana aldayapti.`],
        ['', `You say nothing. Zaynab eats slowly, as if counting the spoonfuls she has left.|Ты молчишь. Зайнаб ест медленно, будто считает, сколько ложек ей осталось.|Sen jim turasan. Zaynab qolgan qoshiqlarini sanayotgandek sekin yeydi.`],
        cl('surayyo', `Half a man to each door. That's how the water's shared in the Tail too. Nobody's ever happy with it, and it's still the fairest way we have.|По полчеловека на каждую дверь. В Хвосте и воду так делят. Никто никогда не доволен, а честнее всё равно ничего нет.|Har eshikka yarimta odam. Dumda suvni ham shunday bo'lishadi. Hech kim hech qachon rozi emas, lekin bundan adolatlirog'i yo'q.`),
        cl('nargiza', `She'll spend the rest of her life wondering why he tasted of water. You could have told her. You chose not to.|Она всю жизнь будет гадать, почему он отдавал водой. Ты мог ей сказать. Ты решил не говорить.|U butun umr nega undan suv ta'mi kelganini o'ylab yuradi. Unga aytishing mumkin edi. Aytmaslikni tanlading.`)
      ], `Ulmas split the bowl as Tohir had asked: the blue door got the strong half, Zaynab the thin one. Nobody told her why hers tastes of water.|Улмас разделил чашу, как просил Тахир: синей двери досталась сильная половина, Зайнаб — тонкая. Почему её чаша отдаёт водой, ей никто не сказал.|O'lmas kosani Tohir so'raganidek bo'ldi: ko'k eshikka kuchli yarmi, Zaynabga yupqasi tegdi. Nega kosasidan suv ta'mi kelishini unga hech kim aytmadi.`, { surayyo: 10, alp: 5, nargiza: -5 });
    } else if (o.id === 'truth') {
      fin([
        ['', `Zaynab listens on her doorstep with the bowl in her lap. When you finish, she turns it slowly, reading her husband's name inside.|Зайнаб слушает на пороге, чаша у неё на коленях. Когда ты договариваешь, она медленно поворачивает её, читая имя мужа на дне.|Zaynab ostonada, kosa tizzasida, tinglaydi. Gapingni tugatganingda, uni sekin aylantirib, ichidagi erining ismini o'qiydi.`],
        ['zaynab', `Six years. Every evening he came home tired, from the karez, I thought. ...A boy. Of course a boy.|Шесть лет. Каждый вечер приходил усталый — я думала, от кяризов. ...Мальчик. Ну конечно, мальчик.|Olti yil. Har oqshom charchab kelardi — korezdan deb o'ylardim. ...O'g'il bola. Albatta-da, o'g'il bola.`],
        ['', `She stands and drops the bowl on the step. It breaks in three. Whatever was in the glaze goes out of it like steam from a cooling pot, and is gone.|Она встаёт и роняет чашу на ступеньку. Та раскалывается на три куска. То, что было в глазури, выходит, как пар из остывающего котла, и пропадает.|U o'rnidan turib, kosani zinaga tashlab yuboradi. Kosa uch bo'lakka bo'linadi. Sirdagi narsa sovib borayotgan qozondan chiqqan bug'dek chiqib, yo'qoladi.`],
        ['zaynab', `Now he's nobody's. That's fair, at least. ...Where is the blue door? No. Don't tell me. Tell me. I'll decide later.|Теперь он ничей. Хоть это честно. ...Где эта синяя дверь? Нет. Не говори. Говори. Потом решу.|Endi u hech kimniki emas. Hech bo'lmasa, bu adolatli. ...Ko'k eshik qayerda? Yo'q. Aytma. Ayt. Keyin hal qilaman.`],
        () => (told ? ['', `In the Potters' Quarter, Sabohat waits by the blue door for a bowl that isn't coming.|В Квартале гончаров у синей двери Сабохат ждёт чашу, которая не придёт.|Kulollar mahallasida Sabohat ko'k eshik oldida endi kelmaydigan kosani kutyapti.`] : null),
        cl('nargiza', `She knows. It hurts, and it's hers. That's the only kind of pain in this city nobody can sell.|Она знает. Это больно — и это её. Только такую боль в этом городе никто не может продать.|U biladi. Bu og'riqli — va bu uniki. Bu shaharda faqat shunday og'riqni hech kim sota olmaydi.`),
        cl('alp', `The boy got nothing. Alp keeps thinking about the boy.|Мальчику ничего не досталось. Алп всё думает о мальчике.|Bolaga hech narsa tegmadi. Alp bola haqida o'ylayveradi.`)
      ], `You told Zaynab everything. She broke the bowl on her step: now Tohir is nobody's. She asked where the blue door is.|Ты рассказал Зайнаб всё. Она разбила чашу о ступеньку: теперь Тахир ничей. Она спросила, где синяя дверь.|Zaynabga hammasini aytding. U kosani zinada sindirdi: endi Tohir hech kimniki emas. U ko'k eshik qayerdaligini so'radi.`, { nargiza: 10, surayyo: -5, alp: -5 });
    } else if (o.id === 'sab') {
      gold(-30); rep('tail', -1);
      fin([
        ['', `Ulmas wraps the green bowl in a clean cloth and hands it over without a word. At the blue door Sabohat takes it in both hands, the way you take bread.|Улмас молча заворачивает зелёную чашу в чистую тряпицу и отдаёт тебе. У синей двери Сабохат берёт её двумя руками, как берут хлеб.|O'lmas yashil kosani toza latta bilan o'rab, indamay senga beradi. Ko'k eshik oldida Sabohat uni non olgandek ikki qo'llab oladi.`],
        ['sabohat', `Doniyor. This is your father. Eat slowly; he has to last.|Дониёр. Это папа. Ешь медленно, его должно хватить надолго.|Doniyor. Bu — dadang. Sekin ye, uzoqqa yetishi kerak.`],
        ['', `Then the Tail. You count thirty tilla into Zaynab's hand and tell her you dropped the bowl on the way.|Потом Хвост. Ты отсчитываешь Зайнаб тридцать тилла и говоришь, что уронил чашу по дороге.|Keyin Dum. Zaynabning qo'liga o'ttiz tilla sanab berasan va kosani yo'lda tushirib yubordim deysan.`],
        ['zaynab', `You dropped him. Twenty years, and some yodchi dropped him on the way to the potter's. ...Get away from my door.|Ты его уронил. Двадцать лет — и какой-то ёдчи уронил его по дороге к гончару. ...Уйди от моей двери.|Uni tushirib yubording. Yigirma yil — va qandaydir yodchi uni kulolga olib borayotib tushirib yubordi. ...Eshigimdan nari ket.`],
        cl('alp', `The boy eats. Alp would drop a hundred bowls for that.|Мальчик ест. Ради этого Алп уронил бы сто чаш.|Bola ovqat yeyapti. Alp buning uchun yuzta kosani tushirib yuborardi.`),
        cl('nargiza', `You stole a widow's grief and told her it was your clumsiness. Kind. And a lie she'll live in.|Ты украл у вдовы её горе и сказал, что это твоя неуклюжесть. Добро. И ложь, в которой ей теперь жить.|Bevaning qayg'usini o'g'irlab, buni o'z qo'li qiyshiqligim deding. Yaxshilik. Va endi u yashaydigan yolg'on.`)
      ], `You gave the whole bowl to the blue door and told Zaynab you dropped it. Doniyor eats from his father; Zaynab won't let you near her door.|Ты отдал всю чашу синей двери и сказал Зайнаб, что уронил её. Дониёр ест из отца, а Зайнаб тебя к своей двери не подпускает.|Butun kosani ko'k eshikka berib, Zaynabga tushirib yubordim deding. Doniyor otasidan yeyapti, Zaynab esa seni eshigiga yaqinlashtirmaydi.`, { alp: 10, surayyo: 5, nargiza: -5 });
    } else {
      addVoid(3, `a burned memory|сожжённая память|yoqilgan xotira`);
      fin([
        ['', `You lay both hands on the glaze and let Tohir burn. For a moment you could carry two full skins up a wet ledge without effort.|Кладёшь обе ладони на глазурь и даёшь Тахиру сгореть. На миг тебе по силам без труда пронести по мокрому уступу два полных бурдюка.|Ikkala kaftingni sirga qo'yib, Tohirning yonishiga yo'l qo'yasan. Bir lahza ikki to'la meshni ho'l tokchadan qiynalmay olib o'tadigandek bo'lasan.`],
        ['', `Then the bowl is only a bowl: deep green, a white rim, a name nobody will taste again.|Потом чаша — просто чаша: густо-зелёная, белый край, имя, которое уже никто не почувствует.|Keyin kosa shunchaki kosa: to'q yashil, oq gardish, endi hech kim ta'mini sezmaydigan ism.`],
        ['olmas', `Well. That's one way to stop two women fighting. It wouldn't have occurred to me. I sell bowls.|Что ж. Это тоже способ, чтобы две женщины не дрались. Мне бы в голову не пришло. Я чаши продаю.|Xo'sh. Ikki ayol urushmasin desang, bu ham bir yo'l. Mening xayolimga kelmasdi. Men kosa sotaman.`],
        ['', `Zaynab gets her bowl back and is told it wore out early, as they sometimes do. Nobody tells the blue door anything.|Зайнаб получает свою чашу обратно и слышит, что та выдохлась раньше времени, — так бывает. Синей двери никто ничего не говорит.|Zaynab kosasini qaytarib oladi va u vaqtidan oldin yeyilib ketdi, degan gapni eshitadi — shunday bo'lib turadi. Ko'k eshikka hech kim hech narsa demaydi.`],
        cl('surayyo', `You burned a man so you wouldn't have to have a conversation. ...I'm not saying it was wrong. I'm saying I saw it.|Ты сжёг человека, чтобы не пришлось ни с кем говорить. ...Я не говорю, что это неправильно. Я говорю, что я это видела.|Gaplashmaslik uchun odamni yoqib yubording. ...Noto'g'ri demayapman. Ko'rdim, demoqchiman.`),
        cl('nargiza', `He was the last thing either of them had. And now he's a warm feeling in your arms for one minute.|Он был последним, что у них обеих оставалось. А теперь он — минута тепла у тебя в руках.|U ikkalasida qolgan oxirgi narsa edi. Endi esa u qo'llaringdagi bir daqiqalik iliqlik.`)
      ], `You burned Tohir out of the glaze. Zaynab was told the bowl wore out; the blue door was told nothing. Nobody eats from him now.|Ты выжег Тахира из глазури. Зайнаб сказали, что чаша выдохлась, синей двери не сказали ничего. Из него больше никто не ест.|Tohirni sirdan yoqib yubording. Zaynabga kosa yeyilib ketdi deyishdi, ko'k eshikka hech narsa deyishmadi. Endi undan hech kim yemaydi.`, { nargiza: -15, surayyo: -10 });
    }
  }));

  /* ---------------------------------------------------------------- who says what, during and after */
  const L2 = {
    zaynab: {
      split: `Zaynab is eating from the pale bowl, slowly. "It's nearly gone," she says. "He's nearly gone. Was he always this quiet?"|Зайнаб медленно ест из бледной чаши. «Почти кончилась, — говорит она. — Он почти кончился. Он всегда был такой тихий?»|Zaynab oqish kosadan sekin yeyapti. «Deyarli tugadi, — deydi u. — U deyarli tugadi. Doim shunaqa jim bo'lganmidi?»`,
      truth: `Zaynab stands across the lane from the blue door with a loaf under her arm. She has been standing there a long time. She hasn't knocked.|Зайнаб стоит через улицу от синей двери с лепёшкой под мышкой. Стоит уже давно. Не постучала.|Zaynab qo'ltig'ida non bilan ko'k eshikning ro'parasida turibdi. Ancha vaqtdan beri turibdi. Taqillatmagan.`,
      sab: `Zaynab turns her back as soon as she sees you.|Увидев тебя, Зайнаб сразу отворачивается.|Seni ko'rishi bilan Zaynab orqasini o'girib oladi.`,
      burn: `The green bowl stands on Zaynab's shelf, empty. "They wear out," she says. "Everyone says so."|Зелёная чаша стоит у Зайнаб на полке, пустая. «Они выдыхаются, — говорит она. — Все так говорят».|Yashil kosa Zaynabning tokchasida bo'sh turibdi. «Ular yeyilib ketadi, — deydi u. — Hamma shunday deydi».`
    },
    olmas: {
      split: `"Two bowls from one man. I've started asking who else they loved before I fire anything." Ulmas spits on the clay. "Bad for business."|«Две чаши из одного человека. Теперь, прежде чем обжигать, спрашиваю, кого ещё покойник любил». Улмас плюёт на глину. «Для дела плохо».|«Bir odamdan ikkita kosa. Endi pishirishdan oldin marhum yana kimni sevganini so'rayman». O'lmas loyga tupuradi. «Ish uchun yomon».`,
      truth: `"Three pieces on her step, I heard." Ulmas doesn't stop the wheel. "That's the first of mine anyone's broken on purpose."|«Говорят, три куска у неё на ступеньке». Улмас не останавливает круг. «Мою чашу впервые разбили нарочно».|«Eshitishimcha, zinasida uch bo'lak bo'libdi». O'lmas charxni to'xtatmaydi. «Kosamni birinchi marta ataylab sindirishdi».`,
      sab: `Ulmas drinks his tea at the chaikhana in the evenings now. "Your clumsy hands," he says, "cost me nothing and you thirty. Good business. For me."|Улмас теперь вечерами пьёт чай в чайхане. «Твои неуклюжие руки, — говорит он, — стоили мне ничего, а тебе тридцать. Хорошее дело. Для меня».|O'lmas endi kechqurunlari choyxonada choy ichadi. «Qiyshiq qo'llaring, — deydi u, — menga hech narsaga, senga o'ttiz tillaga tushdi. Yaxshi savdo. Men uchun».`,
      burn: `"She keeps the empty one on the shelf. Women keep the empty ones." Ulmas shrugs. "I've never understood it. I just make them."|«Пустую она держит на полке. Женщины держат пустые». Улмас пожимает плечами. «Никогда не понимал. Я их только делаю».|«Bo'shini tokchada saqlaydi. Ayollar bo'shlarini saqlaydi». O'lmas yelka qisadi. «Hech tushunmaganman. Men faqat yasayman».`
    },
    sabohat: {
      split: `Doniyor sits on the step of the blue door with a green bowl in both hands, laughing at nothing, the way his father laughed.|Дониёр сидит на ступеньке у синей двери с зелёной чашей в обеих руках и смеётся просто так — как смеялся его отец.|Doniyor ko'k eshik zinasida yashil kosani ikki qo'llab ushlab, otasi kulgandek, shunchaki kulib o'tiribdi.`,
      truth: `"Somebody leaves bread on our step every Friday," Sabohat says. "I know who. I don't open the door. I take the bread."|«Кто-то каждую пятницу оставляет у нас на пороге хлеб, — говорит Сабохат. — Я знаю кто. Дверь не открываю. Хлеб беру».|«Kimdir har juma ostonamizga non qo'yib ketadi, — deydi Sabohat. — Kimligini bilaman. Eshikni ochmayman. Nonni olaman».`,
      sab: `"He eats from it once a week, on Fridays. To make it last." Sabohat watches Doniyor. "He's started carrying a little bucket everywhere."|«Он ест из неё раз в неделю, по пятницам. Чтобы надольше хватило». Сабохат смотрит на Дониёра. «Он теперь везде таскает с собой ведёрко».|«Undan haftada bir marta, jumada yeydi. Uzoqroqqa yetsin deb». Sabohat Doniyorga qaraydi. «Endi hamma joyga kichkina chelak ko'tarib yuradi».`,
      burn: `Sabohat scrubs the blue door that doesn't need scrubbing. Nobody has told her anything, and she has stopped asking.|Сабохат трёт синюю дверь, которую незачем тереть. Ей никто ничего не сказал, и она перестала спрашивать.|Sabohat artishga hojat yo'q ko'k eshikni artyapti. Unga hech kim hech narsa demadi, u so'rashni ham bas qildi.`
    }
  };
  const after2 = (who, d) => play([['', (L2[who] || {})[br('qt2')] || FAC.NPC[who].def.idle]], d);
  FAC.talk.zaynab = d => {
    if (done('qt2')) { after2('zaynab', d); return; }
    if (q('qt2').st === 'none') { q2offer(d); return; }
    if (!sf('qt2_tasted')) { play([['zaynab', `Taste it here if you want. I'll look away.|Попробуй здесь, если хочешь. Я отвернусь.|Xohlasang, shu yerda totib ko'r. Men teskari qarab turaman.`]], () => q2bowl(d)); return; }
    play([['zaynab', `Well? Has Ulmas confessed yet? He will. They always do, potters, once you've broken something.|Ну? Улмас уже сознался? Сознается. Гончары всегда сознаются, стоит что-нибудь разбить.|Xo'sh? O'lmas tan oldimi? Tan oladi. Kulollar biror narsa sinsa, doim tan olishadi.`]], d);
  };
  FAC.talk.olmas = d => {
    if (done('qt2')) { after2('olmas', d); return; }
    if (act('qt2') && sf('qt2_fall')) { q2decide(d); return; }
    if (act('qt2') && sf('qt2_tasted') && !sf('qt2_two')) { q2olmas(d); return; }
    if (act('qt2') && sf('qt2_two')) { play([['olmas', `Found your blue door yet? It's a small quarter. Follow the quince.|Нашёл свою синюю дверь? Квартал маленький. Иди на запах айвы.|Ko'k eshigingni topdingmi? Mahalla kichkina. Behi hidiga ergash.`]], d); return; }
    play([['olmas', `A bowl for your dead? Bring me their tumars and a week. Not before.|Чашу для своего покойника? Неси тумары и жди неделю. Не раньше.|Marhumingga kosa kerakmi? Tumarlarini olib kel, bir hafta kut. Undan oldin emas.`]], d);
  };
  FAC.talk.sabohat = d => {
    if (done('qt2')) { after2('sabohat', d); return; }
    if (act('qt2') && sf('qt2_two') && !sf('qt2_sab')) { q2blue(d); return; }
    play([['', FAC.NPC.sabohat.def.idle]], d);
  };

  // later: the Potters' Quarter remembers; Surayyo has something to say if she was the voice at the wheel
  COMP.beat('qt2_back', () => done('qt2') && COMP.region() === 'potters' && !COMP.inside() && since('qt2') >= 1, dn => {
    const T = {
      split: `Two bowls of the same green stand in two windows of the Potters' Quarter. One is nearly white now.|В двух окнах Квартала гончаров стоят две чаши одного зелёного. Одна уже почти белая.|Kulollar mahallasining ikki derazasida bir xil yashil rangli ikkita kosa turibdi. Biri allaqachon deyarli oq.`,
      truth: `Across the lane from the blue door, a loaf of bread sits on a step, wrapped in a dark scarf. Nobody picks it up while anyone is watching.|Через улицу от синей двери на ступеньке лежит лепёшка, завёрнутая в тёмный платок. Пока кто-то смотрит, её никто не берёт.|Ko'k eshikning ro'parasidagi zinada qora ro'molga o'ralgan non turibdi. Kimdir qarab turganda uni hech kim olmaydi.`,
      sab: `A small boy with a toy bucket runs past you toward the kilns, shouting at nobody to hurry up.|Мимо тебя к печам бежит маленький мальчик с игрушечным ведёрком и кричит кому-то невидимому, чтобы поторапливался.|Yoningdan o'yinchoq chelakli kichkina bola xumdonlar tomon yugurib o'tadi va kimgadir: tezroq, deb qichqiradi.`,
      burn: `Usta Ulmas's yard has fewer bowls drying in it than before. People say the dead in them have started tasting thin.|Во дворе уста Улмаса сохнет меньше чаш, чем прежде. Говорят, покойники в них стали отдавать слабо.|Usta O'lmasning hovlisida avvalgidan kamroq kosa quriyapti. Aytishlaricha, ulardagi marhumlarning ta'mi suyuq bo'lib qolgan.`
    };
    play([['', T[br('qt2')] || T.split]], dn);
  });
  COMP.beat('qt2_sur', () => done('qt2') && FAC.inParty('surayyo') && since('qt2') >= 1 && !COMP.inside(), dn => play(br('qt2') === 'truth' ? [
    ['surayyo', `Zaynab came to the sluice yesterday and asked for her street's hour. The one I'd been giving away.|Вчера Зайнаб пришла к шлюзу и попросила час своей улицы. Тот, что я отдавала.|Kecha Zaynab shlyuzga kelib, ko'chasining soatini so'radi. Men boshqaga berib yurgan soatni.`],
    ['surayyo', `I gave it back. Then I carried a bucket to the blue door myself. Don't look at me like that. Water doesn't take sides.|Я вернула. А потом сама отнесла ведро к синей двери. Не смотри так. У воды нет стороны.|Qaytarib berdim. Keyin o'zim ko'k eshikka bir chelak olib bordim. Bunday qarama. Suvning tarafi yo'q.`]
  ] : [
    ['surayyo', `I've stopped giving the Tail's hour away. There's nobody to carry it now anyway. ...The well by the blue door is still bitter.|Я больше не отдаю час Хвоста. Его всё равно теперь некому носить. ...А колодец у синей двери всё ещё горчит.|Dumning soatini endi hech kimga bermayman. Baribir uni tashiydigan odam yo'q. ...Ko'k eshik yonidagi quduq hali ham achchiq.`]
  ], dn));

  SIDE.epi('qt2', e => {
    if (!done('qt2')) return null;
    return {
      split: `Each of Tohir's two bowls outlasted him by a couple of months. The pale one ran out first. Zaynab kept it on her shelf; the blue door gave theirs to Doniyor when he married.|Каждая из двух чаш Тахира пережила его на пару месяцев. Бледная кончилась первой. Зайнаб держала её на полке; синяя дверь отдала свою Дониёру, когда тот женился.|Tohirning ikki kosasining har biri undan bir-ikki oy ko'proq yashadi. Oqishi birinchi tugadi. Zaynab uni tokchada saqladi; ko'k eshik o'zinikini Doniyor uylanganda unga berdi.`,
      truth: `Zaynab never knocked on the blue door. But every Friday a loaf of bread appeared on its step, and nobody in the Potters' Quarter asked who brought it.|Зайнаб так и не постучала в синюю дверь. Но каждую пятницу у её порога появлялась лепёшка, и никто в Квартале гончаров не спрашивал, кто её приносит.|Zaynab ko'k eshikni hech qachon taqillatmadi. Lekin har juma uning ostonasida non paydo bo'lardi, Kulollar mahallasida hech kim uni kim olib kelishini so'ramasdi.`,
      sab: `Doniyor grew up with a water-carrier's laugh and no idea where it came from. Zaynab told everyone that a yodchi had dropped her husband on the road, and the Tail believed her.|Дониёр вырос со смехом водоноса и понятия не имел, откуда он у него. Зайнаб всем рассказывала, что какой-то ёдчи уронил её мужа по дороге, и Хвост ей верил.|Doniyor meshkobning kulgisi bilan katta bo'ldi, u qayerdan kelganini bilmasdi. Zaynab hammaga bir yodchi erimni yo'lda tushirib yubordi, derdi, Dum esa ishonardi.`,
      burn: `Usta Ulmas's bowls went out of fashion that winter; people said the dead in them tasted thin. Zaynab's bowl stood empty on her shelf, the name inside still bright.|Той зимой чаши уста Улмаса вышли из моды: говорили, что покойники в них отдают слабо. Чаша Зайнаб стояла пустой на полке, имя на дне по-прежнему яркое.|O'sha qishda usta O'lmasning kosalari urfdan qoldi: ulardagi marhumlarning ta'mi suyuq, deyishdi. Zaynabning kosasi tokchada bo'sh turdi, ichidagi ism hamon yorqin.`
    }[br('qt2')] || null;
  }, 'tail:give');
}
