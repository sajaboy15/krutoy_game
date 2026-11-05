/* 89zb_quests_under.js — two investigations underground (GDD ch. 20: a riddle, a turn, no clean way out, people return).
     qk1 The Quiet Water (Tail → upper karez → Tail)
         Husan, a karez-digger, pays the raft-man Qudrat five tilla a night to see his drowned twin Hasan in a still pool.
         The pool draws mourners' memories of their dead out of them and its waxy walls drink them; Qudrat scrapes the wax
         into sacks tagged with thirty-one families of the lower rows, who pay the Singers' tithe with strangers' grief and
         keep their own memories. The water is still because Qudrat dammed a third of the lower channel (he asked the rows).
         Endings: 'dam' (break it: water back, the families pay with their own) / 'wax' (take what's left of Hasan out of
         Husan into wax for his wife) / 'singers' (tell the Cloister: the Well owns the pool, Qudrat to the Tower) /
         'keep' (stay silent, take the fare share).
     qs1 The Day Before the Festival (Swallowed Streets → Tail → Old Yodgor → Swallowed Streets)
         Qumri-xola lives in a half-swallowed house on the eve of the Water Festival of twenty years ago. Her son Elyor,
         a baker's porter she takes for "the neighbours' boy", has Ozoda, a Singer that was, sing the eve back into her each
         new moon. Ozoda took Qumri's grief as the doubled tithe after the Small Awakening and never fed it to the Well: it
         lies behind a founders' door in Old Yodgor that opens only for someone who has forgotten their own name.
         Endings: 'truth' (plant the night back) / 'eve' (give it back to Ozoda) / 'burn' / 'elyor' (give it to her son).
   The two touch: Elyor buys Qudrat's oil; a broken dam floods Qumri's lowest step; the Singers' book walks the streets.
   Flags SIDE.flag('qk1_*' | 'qs1_*'). Epilogue slides borrow 'mehri:carried' and 'tail:dig'. */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, br = FAC.br, sf = SIDE.flag, cl = FAC.cl, cat3 = FAC.cat3;
  const sado = () => (typeof sadoAwake === 'function' && sadoAwake());
  const day = () => { try { return (G.WORLD2.S() && G.WORLD2.S().day) || 1; } catch (e) { return 1; } };
  const since = id => (q(id).day ? day() - q(id).day : 0);

  /* ================================================================================================ qk1 · THE QUIET WATER */
  CAST.qk_gulchehra = { name: `Gulchehra|Гульчехра|Gulchehra`, portrait: null };
  CAST.qk_husan = { name: `Husan, a karez-digger|Хусан, кяризчи|Korezchi Husan`, portrait: null };
  CAST.qk_qudrat = { name: `Qudrat the raft-man|Плотовщик Кудрат|Solchi Qudrat`, portrait: null };
  const LKK = {
    gulchehra: { body: 'woman', robe: '#5a4a3a', trim: '#a88a5a', skin: '#c08a64', head: 'scarf', headC: '#7a5a3a', headC2: '#a88a5a', pat: 'plain' },
    husan: { body: 'man', robe: '#4a4a3e', trim: '#7a7a5a', skin: '#a87a58', head: 'doppi', headC: '#1a1a1a', headC2: '#e8e0cc', beard: 'short', sash: '#2a2a22' },
    qudrat: { body: 'old', robe: '#2a3a3a', trim: '#5a7a7a', skin: '#9a7458', head: 'hood', headC: '#1a2a2a', beard: 'long' }
  };
  SIDE.quest('qk1', { n: 24, title: `The Quiet Water|Тихая вода|Sokin suv`, where: ['tail', 'qk1_home'] });
  FAC.spot('tail', 'qk1_home', 0.42);
  FAC.spot('tail', 'qk1_chan', 0.66);
  FAC.spot('karez', 'qk1_raft', 0.24);
  FAC.spot('karez', 'qk1_pool', 0.62);
  FAC.spot('karez', 'qk1_dam', 0.64);
  FAC.spot('bazaar', 'qk1_baz', 0.46);
  FAC.spot('tower', 'qk1_tower', 0.2);
  const K = k => sf('qk1_' + k);
  const setK = (k, v) => sf('qk1_' + k, v === undefined ? 1 : v);
  const qkAll = () => K('raft') && K('pool') && K('dam') && K('chan');
  const qkWhere = () => (!K('raft') ? ['karez', 'qk1_raft'] : !K('pool') ? ['karez', 'qk1_pool'] : !K('dam') ? ['karez', 'qk1_dam'] : !K('chan') ? ['tail', 'qk1_chan'] : ['karez', 'qk1_raft']);
  const qkStep = text => FAC.stepTo('qk1', qkAll() ? cat3(text, ' ', `Now go back to Qudrat.|Теперь вернуться к Кудрату.|Endi Qudratga qaytish kerak.`) : text, qkWhere());

  /* ---------------------------------------------------------------- where they are */
  FAC.npc('qk_gulchehra', { name: CAST.qk_gulchehra.name, look: LKK.gulchehra, dx: -10, prompt: `Talk to the woman by the chest|Поговорить с женщиной у сундука|Sandiq yonidagi ayol bilan gaplashish`, idle: `A woman sits on her doorstep beside an open, empty chest, as if waiting for it to fill by itself.|Женщина сидит на пороге рядом с открытым пустым сундуком, будто ждёт, что он наполнится сам.|Ayol ostonada ochiq, bo'm-bo'sh sandiq yonida o'tiribdi — go'yo u o'zi to'lib qolishini kutayotgandek.` },
    () => (done('qk1') && br('qk1') === 'keep' && since('qk1') >= 2 ? [{ from: 6, to: 20, region: 'tail', spot: 'qk1_home' }, { from: 20, to: 24, region: 'karez', spot: 'qk1_raft' }] : [{ from: 6, to: 21, region: 'tail', spot: 'qk1_home' }]));
  FAC.npc('qk_husan', { name: CAST.qk_husan.name, look: LKK.husan, dx: 12, prompt: `Talk to the digger|Поговорить с кяризчи|Korezchi bilan gaplashish`, idle: `A broad man sleeps sitting up against the wall, a coil of wet rope in his lap.|Широкоплечий мужчина спит сидя, привалившись к стене, с мотком мокрой верёвки на коленях.|Keng yelkali erkak devorga suyanib, o'tirgan holda uxlayapti, tizzasida ho'l arqon o'rami.` },
    () => {
      const b = done('qk1') ? br('qk1') : null;
      if (b === 'dam') return [{ from: 6, to: 22, region: 'tail', spot: 'qk1_home' }];
      if (b === 'wax') return since('qk1') >= 1 ? [{ from: 8, to: 19, region: 'bazaar', spot: 'qk1_baz' }] : [{ from: 6, to: 22, region: 'tail', spot: 'qk1_home' }];
      return [{ from: 7, to: 19, region: 'tail', spot: 'qk1_home' }, { from: 20, to: 5, region: 'karez', spot: 'qk1_pool' }];
    });
  FAC.npc('qk_qudrat', { name: CAST.qk_qudrat.name, look: LKK.qudrat, dx: 0, prompt: `Talk to the raft-man|Поговорить с плотовщиком|Solchi bilan gaplashish`, idle: `An old man in wet sleeves sits on a raft of lashed waterskins, trimming the wick of a lamp on a pole.|Старик с мокрыми рукавами сидит на плоту из связанных бурдюков и подрезает фитиль лампы на шесте.|Yenglari ho'l chol bog'langan meshlardan yasalgan sol ustida o'tirib, xoda uchidagi chiroqning pilikini kesyapti.` },
    () => {
      const b = done('qk1') ? br('qk1') : null, n = since('qk1');
      if (b === 'dam' && n >= 1) return [{ from: 6, to: 20, region: 'tail', spot: 'qk1_chan' }];
      if (b === 'singers' && n >= 1) return [{ from: 0, to: 24, region: 'tower', spot: 'qk1_tower' }];
      return [{ from: 0, to: 24, region: 'karez', spot: 'qk1_raft' }];
    });

  /* ---------------------------------------------------------------- 1 · the wife */
  const qkOffer = d => play([
    ['', `A doorstep on the lower rows. Beside the woman a painted chest stands open and empty. The neighbours' children have stopped asking what used to be in it.|Порог в нижних рядах. Рядом с женщиной стоит расписной сундук — открытый и пустой. Соседские дети уже перестали спрашивать, что в нём было.|Pastki qatorlardagi ostona. Ayolning yonida naqshli sandiq ochiq turibdi — bo'm-bo'sh. Qo'shni bolalar unda nima bo'lganini so'rashni allaqachon bas qilishgan.`],
    ['qk_gulchehra', `My husband goes down into the karez every night. To see his twin. Hasan drowned in the spring, cleaning a shaft.|Муж каждую ночь спускается в кяриз. К брату-близнецу. Хасан утонул весной, когда чистил колодец.|Erim har kecha korezga tushadi. Egizagining oldiga. Hasan bahorda quduq tozalayotib cho'kib ketgan.`],
    ['qk_gulchehra', `There's a raft-man down there, Qudrat. Five tilla a night, and you see whoever you've lost. Husan sold the pot. Then my earrings. Then everything in the chest.|Там внизу плотовщик, Кудрат. Пять тилла за ночь — и видишь того, кого потерял. Хусан продал казан. Потом мои серьги. Потом всё, что было в сундуке.|Pastda Qudrat degan solchi bor. Bir kechaga besh tilla — yo'qotgan odamingni ko'rasan. Husan qozonni sotdi. Keyin sirg'alarimni. Keyin sandiqdagi hamma narsani.`],
    ['qk_gulchehra', `He comes back at dawn smelling of wax, and he laughs. Up here he never laughs. Yesterday he asked me which of them was born first.|Возвращается на рассвете, пахнет воском — и смеётся. Здесь, наверху, он не смеётся никогда. А вчера спросил меня, кто из них родился первым.|Tongda mum hidi anqib qaytadi va kuladi. Bu yerda, tepada, hech qachon kulmaydi. Kecha mendan qaysi biri oldin tug'ilgan, deb so'radi.`],
    () => (sado() ? ['sado', `He asked which twin was born first? You don't forget that. Not unless something takes it.|Спросил, кто из близнецов старше? Такое не забывают. Если только что-то не забирает.|Egizaklardan qaysi biri katta, deb so'radimi? Bunaqa narsa esdan chiqmaydi. Agar biror narsa olib qo'ymasa.`] : null),
    cl('surayyo', `Gulchehra-opa's row is at the dry end of my channel. Since spring they've been buying water from the upper rows.|Ряд Гульчехры-опы — на сухом конце моего арыка. С весны они покупают воду у верхних рядов.|Gulchehra opaning qatori arig'imning quruq uchida. Bahordan beri ular suvni yuqori qatorlardan sotib olishyapti.`)
  ], () => hub(`Gulchehra|Гульчехра|Gulchehra`, [
    { label: `— How did Hasan drown?|— Как утонул Хасан?|— Hasan qanday cho'kdi?`, lines: [
      ['qk_gulchehra', `The two of them clean the shafts together. In spring the karez breathed and the water came up all at once. Husan was on the rope. Hasan was below.|Они вдвоём чистят колодцы. Весной кяриз вздохнул, и вода поднялась разом. Хусан был на верёвке. Хасан — внизу.|Ikkalasi birga quduq tozalaydi. Bahorda korez nafas oldi-yu, suv birdan ko'tarildi. Husan arqonda edi. Hasan pastda.`],
      ['qk_gulchehra', `Husan pulled up an empty rope. He hasn't let go of it since. I'm not joking: he sleeps with it.|Хусан вытянул пустую верёвку. С тех пор её не выпускает. Я не шучу: спит с ней.|Husan bo'sh arqonni tortib chiqardi. O'shandan beri uni qo'ldan qo'ymaydi. Hazil emas: u bilan uxlaydi.`]
    ] },
    { label: `— What does he say he sees?|— А что он, говорит, там видит?|— U yerda nimani ko'rarkan?`, lines: [
      ['qk_gulchehra', `Hasan. In the water, like a mirror, only the face isn't his own. They talk like before. About nothing. About whose turn it is on the rope.|Хасана. В воде, как в зеркале, только лицо не своё. Говорят, как раньше. Ни о чём. О том, чья очередь на верёвке.|Hasanni. Suvda, ko'zgudagidek, faqat yuz o'ziniki emas. Avvalgidek gaplashisharkan. Hech nima haqida. Arqonda kimning navbati haqida.`]
    ] }
  ], [
    { id: 'yes', label: `"I'll go down and take a look at this water."|«Спущусь и посмотрю на эту воду.»|«Tushib, o'sha suvni bir ko'ray.»` },
    { id: 'no', label: `"Grief finds its own road. Let him walk it."|«У горя своя дорога. Пусть пройдёт её сам.»|«Qayg'uning o'z yo'li bor. O'zi bosib o'tsin.»` }
  ], o => {
    if (o.id !== 'yes') { play([['qk_gulchehra', `It's not grief's road. It's a raft, and it costs five tilla.|Это не дорога горя. Это плот, и стоит он пять тилла.|Bu qayg'uning yo'li emas. Bu sol, narxi besh tilla.`]], d); return; }
    FAC.begin('qk1', `Every night Husan, a karez-digger, pays a raft-man named Qudrat five tilla to see his drowned twin in the upper karez. He comes back poorer, remembering his brother less. Find the raft-man.|Каждую ночь кяризчи Хусан платит плотовщику Кудрату пять тилла, чтобы увидеть в верхних кяризах утонувшего близнеца. Возвращается беднее и помнит брата всё хуже. Найти плотовщика.|Korezchi Husan har kecha solchi Qudratga besh tilla to'lab, yuqori korezlarda cho'kkan egizagini ko'rgani tushadi. Kambag'allashib, akasini tobora kam eslab qaytadi. Solchini topish kerak.`, ['karez', 'qk1_raft']);
    play([['qk_gulchehra', `The raft's below the Tail, off Mehri's well. Follow the smell of lamp oil.|Плот под Хвостом, если спуститься колодцем Мехри. Иди на запах лампового масла.|Sol Dumning tagida, Mehrining qudug'idan tushiladi. Chiroq moyi hidiga qarab bor.`]], d);
  }));

  /* ---------------------------------------------------------------- the husband (optional) */
  const qkHusan = d => play([
    ['qk_husan', `Gulchehra sent you. She thinks it's a sickness. It's the only place where I'm not sick.|Тебя Гульчехра прислала. Думает, это болезнь. А это единственное место, где мне не плохо.|Seni Gulchehra yubordi. Kasallik deb o'ylaydi. Holbuki, faqat o'sha yerda o'zimni yomon his qilmayman.`],
    ['qk_husan', `Go and see for yourself, yodchi. Five tilla. The best money anyone spends in the Tail.|Сходи сам, ёдчи. Пять тилла. Лучшие деньги, какие можно потратить в Хвосте.|O'zing borib ko'r, yodchi. Besh tilla. Dumda sarflanadigan eng yaxshi pul.`]
  ], () => ask(`He winds the rope round his wrist as he talks.|Говоря, он наматывает верёвку на запястье.|Gapirayotib, arqonni bilagiga o'raydi.`, [
    { id: 'cap', label: `— What did Hasan wear on his head?|— Что Хасан носил на голове?|— Hasan boshiga nima kiyardi?` },
    { id: 'go', label: `"I'll see for myself."|«Сам посмотрю.»|«O'zim ko'raman.»` }
  ], o => {
    if (o.id !== 'cap') { d(); return; }
    setK('husan');
    play([
      ['qk_husan', `A doppi. Black, with white peppers. Or green... We had the same one, both of us. Why can't I see it?|Тюбетейку. Чёрную, с белыми перчиками. Или зелёную... У нас были одинаковые. Почему я её не вижу?|Do'ppi. Qora, oq qalampir naqshli. Yo yashilmidi... Ikkalamizniki bir xil edi. Nega ko'z oldimga kelmayapti?`],
      ['', `He stares at the rope as if it might tell him.|Он смотрит на верёвку, будто она может подсказать.|U arqonga xuddi u aytib beradigandek tikilib qoladi.`]
    ], d);
  }));

  /* ---------------------------------------------------------------- 2 · the raft-man */
  const qkRaft = d => play([
    ['', `A side tunnel, black and quiet. At its mouth a raft of lashed waterskins rocks on the water; a lamp on a pole; a clay jar half full of copper and a little gold.|Боковой тоннель, чёрный и тихий. У входа покачивается плот из связанных бурдюков; лампа на шесте; глиняный кувшин, наполовину полный меди и немного золота.|Qorong'i, jimjit yon tunnel. Og'zida bog'langan meshlardan yasalgan sol chayqaladi; xoda uchida chiroq; yarmigacha mis va ozgina tilla to'la sopol ko'za.`],
    ['qk_qudrat', `Five tilla, yodchi, and you'll see whoever you've lost. Not a ghost, not a song. Them. The way they were on their best day.|Пять тилла, ёдчи, — и увидишь того, кого потерял. Не призрака, не песню. Его самого. Каким он был в свой лучший день.|Besh tilla, yodchi, — yo'qotgan odamingni ko'rasan. Arvoh emas, qo'shiq emas. O'zini. Eng yaxshi kunidagidek.`],
    ['qk_qudrat', `Don't look at me like a debt book. I drag nobody onto the raft. They come by themselves, and they come back.|Не смотри на меня, как на долговую книгу. Я никого на плот не тащу. Сами приходят — и снова приходят.|Menga qarz daftariga qaragandek qarama. Hech kimni solga sudramayman. O'zlari keladi — yana qaytib keladi.`]
  ], () => hub(`Qudrat|Кудрат|Qudrat`, [
    { label: `— Who did you lose?|— А ты кого потерял?|— O'zing kimni yo'qotgansan?`, lines: [
      ['qk_qudrat', `My wife. Eleven years ago, in the dry year. I found this water first, alone, with a lamp. I'm the only one who doesn't pay.|Жену. Одиннадцать лет назад, в сухой год. Я первым нашёл эту воду — один, с лампой. Я единственный, кто не платит.|Xotinimni. O'n bir yil oldin, qurg'oqchilik yili. Bu suvni birinchi bo'lib men topganman — yolg'iz, chiroq bilan. To'lamaydigan yagona odam menman.`],
      ['qk_qudrat', `I don't go any more. I can't remember what she was laughing at, the last time. I'd rather not find out what goes next.|Больше не хожу. Уже не помню, над чем она смеялась в последний раз. Не хочу узнать, что уйдёт следующим.|Endi bormayman. Oxirgi marta u nimaga kulganini eslay olmayman. Navbatda nima ketishini bilgim kelmaydi.`]
    ] },
    { label: `— Where does the money go?|— Куда идут деньги?|— Pullar qayerga ketadi?`, lines: [
      ['qk_qudrat', `Oil. Rope. Patches for the skins. The tithe.|Масло. Верёвки. Заплатки на бурдюки. Десятина.|Moy. Arqon. Meshlarga yamoq. Ushr.`],
      ['', `He says the last word and shuts his mouth, as if he'd counted out one coin too many.|Последнее слово он произносит — и закрывает рот, будто отсчитал лишнюю монету.|Oxirgi so'zni aytadi-yu, og'zini yumadi — go'yo bitta tangani ortiqcha sanab yuborgandek.`]
    ] },
    { label: `— Who else buys from you?|— Кто ещё у тебя покупает?|— Sendan yana kim xarid qiladi?`, if: () => act('qs1') || done('qs1'), lines: [
      ['qk_qudrat', `A baker's porter. Never once got on the raft. Every week he takes a jar of oil for some house in the Swallowed Streets. Pays in bread.|Носильщик из пекарни. Ни разу на плот не сел. Каждую неделю берёт кувшин масла для какого-то дома в Проглоченных улицах. Платит хлебом.|Novvoyxonadagi hammol. Solga bir marta ham chiqmagan. Har hafta Yutilgan ko'chalardagi qandaydir uy uchun bir ko'za moy oladi. Non bilan to'laydi.`]
    ] }
  ], qkRaftOpts({}), o => qkRaftPick(d, o)));
  const qkRaftOpts = tried => [
    { id: 'pay', price: 5, label: `Pay the fare.|Заплатить за перевоз.|Yo'l haqini to'lash.` },
    tried.law ? null : FAC.chk('collection', 3, `"A yodchi doesn't pay to look at what's in the karez. Push off."|«Ёдчи не платит за то, чтобы посмотреть, что в кяризе. Отчаливай.»|«Yodchi korezda nima borligini ko'rish uchun pul to'lamaydi. Qani, sur solingni.»`, { id: 'law' }, `Yodchi's right|Право ёдчи|Yodchi haqqi`),
    tried.wade ? null : FAC.chk('agi', 4, `Wade along the wall without the raft.|Пройти вброд вдоль стены, без плота.|Solsiz, devor yoqalab suvdan kechib o'tish.`, { id: 'wade' }),
    tried.taste ? null : FAC.craft('taste', `the raft-man's pole|шест плотовщика|solchining xodasini`, { id: 'taste' })
  ];
  const qkRaftAsk = (d, tried) => ask(`The lamp on the pole leans towards the side tunnel.|Лампа на шесте клонится к боковому тоннелю.|Xodadagi chiroq yon tunnel tomonga egiladi.`, qkRaftOpts(tried), o => qkRaftPick(d, o, tried));
  const qkRaftPick = (d, o, tried) => {
    tried = tried || {};
    const after = lines => play(lines, () => {
      setK('raft');
      qkStep(`Qudrat ferries mourners to the "Quiet Water" in a side tunnel of the upper karez. Look at the water yourself.|Кудрат возит скорбящих к «Тихой воде» в боковом тоннеле верхних кяризов. Посмотреть на эту воду самому.|Qudrat motamdorlarni yuqori korezlarning yon tunnelidagi «Sokin suv»ga olib boradi. O'sha suvni o'zing ko'rishing kerak.`);
      d();
    });
    if (o.id === 'law' && !o.ok) { play([['qk_qudrat', `Rights are for up top, yodchi. Down here it's five tilla.|Права — это наверху, ёдчи. Здесь — пять тилла.|Haq-huquq tepada qolgan, yodchi. Bu yerda — besh tilla.`]], () => qkRaftAsk(d, Object.assign({}, tried, { law: 1 }))); return; }
    if (o.id === 'wade' && !o.ok) { play([['', `Two steps, and the bottom goes out from under you. Qudrat fishes you out with the pole without a word.|Два шага — и дно уходит из-под ног. Кудрат молча выуживает тебя шестом.|Ikki qadam — oyog'ing ostidan tag qochadi. Qudrat indamay seni xoda bilan tortib oladi.`]], () => qkRaftAsk(d, Object.assign({}, tried, { wade: 1 }))); return; }
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `Hundreds of hands on the pole, one after another, all gripping too hard. Widows' hands, fathers' hands. A child's, on tiptoe.|Сотни рук на шесте, одна за другой, и все сжимают слишком крепко. Руки вдов, руки отцов. Детская — на цыпочках.|Xodada yuzlab qo'l, birin-ketin, hammasi haddan tashqari qattiq siqadi. Bevalarning qo'llari, otalarning qo'llari. Bitta bolaniki — oyoq uchida turib.`],
        ['memory', `Then one pair of hands, old and patient, scraping something grey off a wall with a knife into a sack. Night after night. The sack fills.|Потом одни руки, старые и терпеливые, ножом соскребают со стены что-то серое в мешок. Ночь за ночью. Мешок наполняется.|Keyin bir juft qo'l, keksa va sabrli, devordan allaqanday kulrang narsani pichoq bilan qopga qirib tushiradi. Kechadan-kechaga. Qop to'ladi.`]
      ], () => { setK('scrape'); after([['qk_qudrat', `You've had a look at my hands. Fine. Get on. Whoever's paid with his eyes, I don't take money from.|Посмотрел на мои руки. Ладно. Садись. Кто заплатил глазами, с того денег не беру.|Qo'llarimga qarab bo'lding. Mayli. O'tir. Ko'zi bilan to'lagandan pul olmayman.`]]); }, { intro: `You close your hand over the wet pole. Wood remembers every grip.|Сжимаешь мокрый шест. Дерево помнит каждую ладонь.|Ho'l xodani qisasan. Yog'och har bir kaftni eslaydi.` });
      return;
    }
    if (o.id === 'law') { after([['qk_qudrat', `...A yodchi. Right. The rows will hear you rode for free. Get on.|...Ёдчи. Ну да. Ряды услышат, что ты катался даром. Садись.|...Yodchi. Ha-ya. Qatorlar seni tekinga minganingni eshitadi. O'tir.`]]); return; }
    if (o.id === 'wade') { after([['', `You go along the wall, waist-deep, holding the stones. The raft drifts beside you. Qudrat watches and says nothing.|Идёшь вдоль стены по пояс в воде, держась за камни. Плот плывёт рядом. Кудрат смотрит и молчит.|Belingacha suvda, toshlarni ushlab, devor yoqalab ketasan. Sol yoningda suzadi. Qudrat qarab turadi, indamaydi.`]]); return; }
    after([['qk_qudrat', `He drops your five tilla into the jar without looking. "Hold the edge. Don't talk on the way. They don't like it."|Он, не глядя, бросает твои пять тилла в кувшин. «Держись за край. По дороге не разговаривай. Они не любят».|U qaramay besh tillangni ko'zaga tashlaydi. «Chetidan ushla. Yo'lda gapirma. Ular yoqtirmaydi».`]]);
  };

  /* ---------------------------------------------------------------- 3 · the still pool */
  const qkPool = d => play([
    ['', `A round chamber. The karez runs all around it, but the water here doesn't move; it lies like black glass. Lamps on the ledges. On the walls, a grey crust, thick as candle drippings.|Круглая камера. Кругом бежит кяриз, а вода здесь не движется: лежит, как чёрное стекло. На уступах лампы. Стены покрыты серой коркой, толстой, как оплывший воск.|Dumaloq xona. Atrofda korez oqib turibdi, bu yerdagi suv esa qimirlamaydi: qora shishadek yotibdi. Tokchalarda chiroqlar. Devorlarda shamdan oqqan mumdek qalin kulrang qatlam.`],
    () => (SIDE.night() ? ['', `At the edge kneels a broad man with a rope round his wrist, talking quietly to the water and laughing.|У края на коленях стоит широкоплечий мужчина с верёвкой на запястье — тихо говорит с водой и смеётся.|Chetida bilagiga arqon o'ralgan keng yelkali erkak tiz cho'kib, suv bilan sekin gaplashyapti va kulyapti.`] : null),
    cl('surayyo', `Water stands still in a karez only when someone has stopped it. Somebody has.|В кяризе вода стоит, только если её кто-то остановил. Кто-то остановил.|Korezda suv faqat kimdir to'xtatgan bo'lsa turadi. Kimdir to'xtatibdi.`)
  ], () => qkPoolAsk(d, {}));
  const qkPoolAsk = (d, tried) => ask(`You kneel at the edge. Your own face looks up at you, and behind it something else is getting ready to.|Ты опускаешься на колени у края. Из воды на тебя смотрит твоё лицо, а за ним готовится проступить что-то ещё.|Chetiga tiz cho'kasan. Suvdan o'z yuzing qaraydi, uning ortida esa yana nimadir paydo bo'lishga shaylanyapti.`, [
    FAC.craft('taste', `the water, the way the mourners do|воду — так, как это делают скорбящие|suvni — motamdorlar qilganidek`, { id: 'taste' }),
    tried.watch ? null : FAC.chk('mem', 5, `Watch the next mourner, not the water.|Смотреть не на воду, а на следующего скорбящего.|Suvga emas, keyingi motamdorga qarash.`, { id: 'watch' }, `Attention|Внимание|Diqqat`),
    tried.hum ? null : FAC.chk('song', 4, `Hum low over the water and listen to what hums back.|Тихо напеть над водой и послушать, что отзовётся.|Suv ustida past ovozda xirgoyi qilib, nima javob qaytarishini tinglash.`, { id: 'hum' }),
    { id: 'touch', label: `Touch the grey crust on the wall.|Потрогать серую корку на стене.|Devordagi kulrang qatlamni ushlab ko'rish.` }
  ], o => {
    const fin = lines => play((lines || []).concat([
      ['hero', `The water doesn't show the dead. It draws your memory of them out of you, and the walls drink it. Every visit, a little less. And it works only because the water is still.|Вода не показывает мёртвых. Она вытягивает из тебя память о них, а стены её пьют. Каждый раз — чуть меньше. И работает это лишь потому, что вода стоит.|Suv o'liklarni ko'rsatmaydi. U sendan ular haqidagi xotirani sug'urib oladi, devorlar esa uni ichadi. Har safar — sal kamroq. Bu esa faqat suv turgani uchun ishlaydi.`]
    ]), () => {
      setK('pool');
      qkStep(`The Quiet Water draws mourners' memories of their dead out of them, and the waxy walls drink them. Find what keeps the water still, and where the Tail's lower channel lost its water.|«Тихая вода» вытягивает из скорбящих память об их мёртвых, а восковые стены её пьют. Найти, что держит воду, и куда ушла вода нижнего арыка Хвоста.|«Sokin suv» motamdorlardan o'liklari haqidagi xotirani sug'urib oladi, mumli devorlar uni ichadi. Suvni nima to'xtatib turganini va Dumning pastki arig'i suvi qayerga ketganini bilish kerak.`);
      d();
    });
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `Rustam-aka, as he was ten years ago, comes up through the water, laughing at something you said on the tithe route. You'd forgotten he could laugh like that.|Из воды поднимается Рустам-ака, каким он был десять лет назад, — смеётся над чем-то, что ты сказал на обходе. Ты и забыл, что он умел так смеяться.|Suvdan o'n yil oldingi Rustam aka ko'tariladi — yig'im yo'lida sen aytgan nimagadir kulyapti. Uning bunaqa kulishini unutib yuborgan ekansan.`],
        ['memory', `Then the laugh peels off him like a wet label and drifts to the wall. The crust takes it in. It's a little thicker now, and you can't quite hear the laugh any more.|А потом смех отслаивается от него, как мокрая бирка, и уплывает к стене. Корка его впитывает. Она стала чуть толще, а смех ты уже толком не слышишь.|Keyin kulgi undan ho'l yorliqdek ko'chib, devorga suzib ketadi. Qatlam uni shimib oladi. U biroz qalinlashdi, kulgini esa endi aniq eshitmaysan.`],
        () => (sado() ? ['sado', `That was yours. The wall ate it. ...Please don't do that again.|Это было твоё. Стена это съела. ...Пожалуйста, не делай так больше.|Bu seniki edi. Devor uni yeb qo'ydi. ...Iltimos, boshqa bunday qilma.`] : null)
      ], () => fin([]), { person: true, intro: `You touch your lips to the still water. It's warm, and a little salty.|Касаешься губами стоячей воды. Она тёплая и чуть солёная.|Lablaringni sokin suvga tekkizasan. Iliq, biroz sho'r.` });
      return;
    }
    if (o.id === 'watch' && o.ok) {
      setK('watch');
      fin([
        ['', `A woman from the Tail kneels and talks to her son in the water. As she talks, the crust beside her grows a skin as thin as a fingernail.|Женщина из Хвоста становится на колени и говорит с сыном в воде. Пока она говорит, корка рядом с ней нарастает плёнкой тонкой, как ноготь.|Dumlik bir ayol tiz cho'kib, suvdagi o'g'li bilan gaplashadi. U gapirgan sari yonidagi qatlam tirnoqdek yupqa parda bilan qalinlashadi.`],
        ['', `On her way out she asks Qudrat what her boy used to call her. He doesn't know. She pays for tomorrow.|На выходе она спрашивает Кудрата, как её мальчик её называл. Он не знает. Она платит за завтра.|Chiqishda u Qudratdan o'g'li uni nima deb chaqirardi, deb so'raydi. Qudrat bilmaydi. Ayol ertangi kun uchun to'laydi.`]
      ]);
      return;
    }
    if (o.id === 'hum' && o.ok) {
      fin([['', `The walls hum back in a hundred voices, and every voice is saying a name. The crust isn't stone. It's wax, tumar wax, and it's full.|Стены отзываются сотней голосов, и каждый называет имя. Корка — не камень. Это воск, тумарный воск, и он полон.|Devorlar yuzlab ovoz bilan javob qaytaradi, har bir ovoz kimningdir ismini aytadi. Qatlam tosh emas. Bu mum, tumar mumi, va u to'la.`]]);
      return;
    }
    if (o.id === 'watch' || o.id === 'hum') {
      play([['', o.id === 'watch' ? `A mourner kneels, talks, pays, leaves. You see a woman crying and nothing else.|Скорбящая встаёт на колени, говорит, платит, уходит. Ты видишь плачущую женщину — и больше ничего.|Bir motamdor tiz cho'kadi, gapiradi, to'laydi, ketadi. Yig'layotgan ayolni ko'rasan — boshqa hech narsani.` : `Your humming goes out over the water and doesn't come back. The chamber swallows it.|Твой напев уходит над водой и не возвращается. Камера его проглатывает.|Xirgoying suv ustidan ketadi-yu, qaytmaydi. Xona uni yutib yuboradi.`]], () => qkPoolAsk(d, Object.assign({}, tried, { [o.id]: 1 })));
      return;
    }
    fin([['', `Warm, and a little soft, like tumar wax in a Singer's hand. Something in it flinches from your fingers.|Тёплая и чуть мягкая — как тумарный воск в руке Певца. Что-то в ней отдёргивается от твоих пальцев.|Iliq va biroz yumshoq — xonanda qo'lidagi tumar mumidek. Ichida nimadir barmoqlaringdan seskanib tortiladi.`]]);
  });
  FAC.prop('karez', 'qk1_pool', { id: 'qk1pool', art: 'f6glint', dx: 10, prompt: `The still water|Стоячая вода|Sokin suv`, when: () => act('qk1') && K('raft') && !K('pool'), use: d => qkPool(d) });

  /* ---------------------------------------------------------------- 4 · the dam and the sacks */
  const qkDam = d => play([
    ['', `Behind the chamber a side channel is walled shut with clay and planks: fresh work, careful. On the far side you can hear water pushing to get through. On this side, sacks.|За камерой боковой канал наглухо заложен глиной и досками — работа свежая и аккуратная. С той стороны слышно, как вода давит, рвётся пройти. С этой — мешки.|Xona ortida yon kanal loy va taxtalar bilan mahkam berkitilgan — yangi, puxta ish. Narigi tomonda suv o'tishga urinib bosayotgani eshitiladi. Bu tomonda — qoplar.`],
    ['', `Thirty-one sacks of grey wax scrapings, each with a tag on a string, the way the Singers tag the tithe.|Тридцать один мешок серых восковых соскобов, на каждом бирка на верёвочке — так Певцы метят десятину.|O'ttiz bitta qop kulrang mum qirindisi, har birida ipga bog'langan yorliq — xonandalar ushrni shunday belgilaydi.`]
  ], () => ask(`The tags are written in a careful, unpractised hand.|Бирки подписаны старательно, но неумелой рукой.|Yorliqlar tirishib, ammo g'o'r qo'l bilan yozilgan.`, [
    FAC.craft('taste', `the wax in the sacks|воск из мешков|qoplardagi mumni`, { id: 'taste' }),
    FAC.chk('collection', 2, `Read the tags like a debt book.|Читать бирки, как долговую книгу.|Yorliqlarni qarz daftaridek o'qish.`, { id: 'read' }, `Yodchi's eye|Глаз ёдчи|Yodchi ko'zi`),
    { id: 'count', label: `Count the sacks and read the names aloud.|Пересчитать мешки и прочесть имена вслух.|Qoplarni sanab, ismlarni ovoz chiqarib o'qish.` }
  ], o => {
    const fin = lines => play((lines || []).concat([
      ['', `One tag is newer than the rest: "Husan and Gulchehra, the dry end of the lower channel."|Одна бирка новее остальных: «Хусан и Гульчехра, сухой конец нижнего арыка».|Bitta yorliq qolganlaridan yangiroq: «Husan va Gulchehra, pastki ariqning quruq uchi».`],
      () => (sado() ? ['sado', `He's paying his tithe with his brother. And he doesn't even know.|Он платит десятину своим братом. И даже не знает об этом.|U ushrini egizagi bilan to'layapti. Buni bilmaydi ham.`] : null)
    ]), () => {
      setK('dam');
      qkStep(`Behind a clay dam that stills the water, Qudrat keeps thirty-one sacks of the walls' wax tagged with Tail families: on the Night of Payment they pay the Singers with it, not with their own memories. One is Husan's.|За глиняной запрудой, которая держит воду, Кудрат хранит тридцать один мешок воска со стен с именами семей Хвоста. В Ночь Уплаты они сдают его Певцам вместо своей памяти. Один мешок — Хусана.|Suvni to'xtatgan loy to'g'on ortida Qudrat devordan qirilgan mumni o'ttiz bitta qopda saqlaydi, har birida dumlik oila ismi. To'lov kechasi ular o'z xotirasi o'rniga shuni beradi. Bittasi — Husanniki.`);
      d();
    });
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `Last year's Night of Payment. Qudrat carries sacks along the lower rows. In every yard a family presses the grey wax into tumars with their thumbs.|Прошлая Ночь Уплаты. Кудрат разносит мешки по нижним рядам. В каждом дворе семья большими пальцами вминает серый воск в тумары.|O'tgan yilgi To'lov kechasi. Qudrat pastki qatorlar bo'ylab qop tashiydi. Har bir hovlida oila kulrang mumni bosh barmoqlari bilan tumarlarga bosadi.`],
        ['memory', `At the Cloister a weigher lifts one, frowns, then smiles. "Strong. Grief always weighs well." The family walks home with everything they came with.|В Обители весовщик поднимает такой тумар, хмурится, потом улыбается. «Сильный. Горе всегда хорошо весит». Семья уходит домой со всем, с чем пришла.|Xonaqohda tarozibon shunday tumarni ko'tarib, qovog'ini soladi, keyin jilmayadi. «Kuchli. Qayg'u doim yaxshi tortadi». Oila nima bilan kelgan bo'lsa, hammasi bilan uyiga qaytadi.`]
      ], () => fin([]), { intro: `You push your hand into the nearest sack. The scrapings are warm, like bread.|Запускаешь руку в ближний мешок. Соскобы тёплые, как хлеб.|Qo'lingni eng yaqin qopga tiqasan. Qirindilar nondek iliq.` });
      return;
    }
    if (o.id === 'read' && o.ok) {
      fin([['hero', `Thirty-one families of the lower rows, and "Night of Payment" on every tag. Not one of these names was sung down last year. I'd remember. I walked those rows myself.|Тридцать одна семья нижних рядов, и на каждой бирке — «Ночь Уплаты». Ни одно из этих имён в прошлом году не выпели досуха. Я бы помнил: сам обходил эти ряды.|Pastki qatorlardan o'ttiz bitta oila, har bir yorliqda — «To'lov kechasi». O'tgan yili bu ismlarning birortasi ham kuylab bo'shatilmagan. Eslardim: o'sha qatorlarni o'zim aylanganman.`]]);
      return;
    }
    fin([['', `You count thirty-one. You read the names aloud, and the dam answers each one with a small push of water.|Насчитываешь тридцать один. Читаешь имена вслух, и на каждое запруда отвечает лёгким толчком воды.|O'ttiz bittagacha sanaysan. Ismlarni ovoz chiqarib o'qiysan, to'g'on har biriga suvning yengil turtkisi bilan javob beradi.`]]);
  }));
  FAC.prop('karez', 'qk1_dam', { id: 'qk1dam', art: 'f6crate', dx: 24, prompt: `A side channel walled up with clay|Боковой канал, заложенный глиной|Loy bilan berkitilgan yon kanal`, when: () => act('qk1') && K('pool') && !K('dam'), use: d => qkDam(d) });

  /* ---------------------------------------------------------------- 5 · the dry end of the channel */
  const qkChan = d => play([
    ['', `The lower channel ends in cracked mud. A mirab's gauge stone stands in it, notched every hand's breadth; the water mark is three notches below last year's.|Нижний арык кончается растрескавшейся грязью. В нём стоит мерный камень мираба с зарубками через ладонь; след воды на три зарубки ниже прошлогоднего.|Pastki ariq yorilgan loy bilan tugaydi. Unda mirobning o'lchov toshi turibdi, har kaft balandlikda kertik; suv izi o'tgan yilgidan uch kertik pastda.`],
    ['', `Children carry buckets down from the upper rows. Two coppers a bucket.|Дети носят вёдра из верхних рядов. По два медяка за ведро.|Bolalar yuqori qatorlardan chelak tashiydi. Chelagi ikki mis tanga.`]
  ], () => ask(`A third of the lower rows' water has gone somewhere.|Треть воды нижних рядов куда-то делась.|Pastki qatorlar suvining uchdan biri qayergadir ketib qolgan.`, [
    FAC.craft('taste', `the gauge stone|мерный камень|o'lchov toshini`, { id: 'taste' }),
    { id: 'ask', label: `— Who took your water?|— Кто забрал у вас воду?|— Suvingizni kim oldi?` }
  ], o => {
    const fin = lines => play((lines || []).concat([
      cl('surayyo', `He asked them. Not me — them. And they agreed to buy water from their neighbours so that... what? I don't know yet. I don't like not knowing about my own water.|Он спросил их. Не меня — их. И они согласились покупать воду у соседей, чтобы... что? Пока не знаю. Не люблю не знать про свою же воду.|U ulardan so'ragan. Mendan emas — ulardan. Ular esa qo'shnilardan suv sotib olishga rozi bo'lishgan, toki... nima? Hali bilmayman. O'z suvim haqida bilmaslikni yoqtirmayman.`)
    ]), () => {
      setK('chan');
      qkStep(`The lower rows lost a third of their water in spring. Qudrat went to every door first and asked, and most said yes.|Нижние ряды весной лишились трети воды. Кудрат сначала обошёл все двери и спросил, и большинство согласилось.|Pastki qatorlar bahorda suvining uchdan biridan ayrildi. Qudrat avval hamma eshikni aylanib so'ragan, ko'pchilik rozi bo'lgan.`);
      d();
    });
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `Spring. Overnight the water drops a notch, then another. At dawn an old man in wet sleeves stands at the channel's end, looks at the stone for a long time, then goes to every door in the row.|Весна. За ночь вода опускается на зарубку, потом ещё на одну. На рассвете у конца арыка стоит старик с мокрыми рукавами, долго смотрит на камень, а потом обходит все двери ряда.|Bahor. Bir kechada suv bir kertik pasayadi, keyin yana bittaga. Tongda ariq uchida yenglari ho'l chol turibdi, toshga uzoq qaraydi-da, qatordagi hamma eshiklarni aylanib chiqadi.`]
      ], () => fin([]), { intro: `You lay your palm on the gauge stone. It remembers every level the water ever reached.|Кладёшь ладонь на мерный камень. Он помнит каждый уровень, до которого доходила вода.|Kaftingni o'lchov toshiga qo'yasan. U suv yetgan har bir sathni eslaydi.` });
      return;
    }
    fin([['', `"Nobody took it. Grandpa Qudrat asked, and Dad said yes." The girl with the bucket thinks. "Mum said no. Then she said yes too."|«Никто не забирал. Дедушка Кудрат спросил, а папа сказал "да"». Девочка с ведром задумывается. «Мама сказала "нет". А потом тоже "да"».|«Hech kim olmagan. Qudrat buva so'radi, dadam "ha" dedi». Chelakli qizcha o'ylanib qoladi. «Oyim "yo'q" dedi. Keyin u ham "ha" dedi».`]]);
  }));
  FAC.prop('tail', 'qk1_chan', { id: 'qk1chan', art: 'f6glint', dx: 8, prompt: `The dry end of the lower channel|Сухой конец нижнего арыка|Pastki ariqning quruq uchi`, when: () => act('qk1') && K('pool') && !K('chan'), use: d => qkChan(d) });

  /* ---------------------------------------------------------------- 6 · what to do with the Quiet Water */
  const qkEnd = d => play([
    ['', `Qudrat isn't trimming the wick. He's waiting, the way debtors wait when they already know the sum.|Кудрат не подрезает фитиль. Он ждёт — так ждут должники, которые уже знают сумму.|Qudrat pilik kesmayapti. Kutyapti — summani allaqachon biladigan qarzdorlar shunday kutadi.`],
    ['hero', `Thirty-one sacks, thirty-one families, a third of the lower channel. And their dead, scraped off a wall.|Тридцать один мешок, тридцать одна семья, треть нижнего арыка. И их мёртвые, соскобленные со стены.|O'ttiz bitta qop, o'ttiz bitta oila, pastki ariqning uchdan biri. Va devordan qirib olingan o'liklari.`],
    ['qk_qudrat', `Not theirs. Other people's dead — the mourners'. The rows pay with strangers' grief and keep their own heads. Their children's first words. Their weddings.|Не их — чужих. Мёртвых тех, кто приходит горевать. Ряды платят чужим горем и сохраняют свои головы. Первые слова детей. Свадьбы.|O'zlariniki emas — begonalarniki. Motamga keladiganlarning o'liklari. Qatorlar begonaning qayg'usi bilan to'laydi, o'z boshini saqlab qoladi. Bolalarining ilk so'zlarini. To'ylarini.`],
    ['qk_qudrat', `Last Night of Payment not one of those thirty-one was sung down. Count it, yodchi. You lot count everything.|В прошлую Ночь Уплаты ни одного из этих тридцати одного не выпели досуха. Посчитай, ёдчи. Вы же всё считаете.|O'tgan To'lov kechasi o'sha o'ttiz bittadan birortasi ham kuylab bo'shatilmadi. Sanab ko'r, yodchi. Sizlar axir hamma narsani sanaysizlar.`],
    ['qk_qudrat', `And Husan? Better to pay with his brother than with his wedding. He doesn't know he's choosing. Most people don't.|А Хусан? Лучше уж платить братом, чем свадьбой. Он не знает, что выбирает. Мало кто знает.|Husan-chi? To'yi bilan to'lagandan ko'ra egizagi bilan to'lagani yaxshi. U tanlayotganini bilmaydi. Ko'pchilik bilmaydi.`],
    () => (K('husan') ? ['hero', `He can't remember his brother's doppi. They wore the same one.|Он не может вспомнить тюбетейку брата. А носили они одинаковые.|U egizagining do'ppisini eslay olmaydi. Ikkovi bir xil kiyardi-ku.`] : null),
    cl('surayyo', `That channel is mine to keep. Break the dam, and I'll answer to all thirty-one doors myself. Better me than Qudrat.|Этот арык — моя забота. Сломай запруду, а перед тридцатью одной дверью я отвечу сама. Лучше я, чем Кудрат.|Bu ariq — mening zimmamda. To'g'onni buz, o'ttiz bitta eshik oldida o'zim javob beraman. Qudrat emas, men javob berganim yaxshi.`),
    cl('alp', `Alp would pay five tilla. Alp would look in the water. ...Alp has no one to see there. That is its own kind of luck.|Алп заплатил бы пять тилла. Алп посмотрел бы в воду. ...Алпу там некого увидеть. Это тоже своего рода удача.|Alp besh tilla to'lardi. Alp suvga qarardi. ...Alpning u yerda ko'radigan odami yo'q. Bu ham o'ziga xos omad.`),
    cl('nargiza', `The Well loves grief; it goes down like honey. The weighers will smell this sooner or later. I'm not saying what to do. I'm saying who'll come.|Колодец любит горе — оно идёт, как мёд. Весовщики рано или поздно учуют. Я не говорю, что делать. Я говорю, кто придёт.|Quduq qayg'uni yaxshi ko'radi — asaldek ketadi. Tarozibonlar ertami-kechmi hidini olishadi. Nima qilishni aytmayapman. Kim kelishini aytyapman.`),
    () => (sado() ? ['sado', `Everyone here is paying with someone. I can't find the one who isn't.|Здесь все платят кем-то. Я не могу найти того, кто не платит.|Bu yerda hamma kimdir bilan to'layapti. To'lamayotganini topa olmayapman.`] : null)
  ], () => ask(`The water behind the dam pushes at the clay.|Вода за запрудой давит на глину.|To'g'on ortidagi suv loyni bosyapti.`, [
    { id: 'dam', label: `"Break the dam. The water goes back to the lower rows."|«Ломаем запруду. Вода вернётся в нижние ряды.»|«To'g'onni buzamiz. Suv pastki qatorlarga qaytadi.»` },
    FAC.craft('take', `what Husan still has of his brother into wax, before the wall takes the rest|то, что у Хусана ещё осталось от брата, в воск — пока стена не забрала остальное|Husanda egizagidan qolgan narsani mumga — devor qolganini olib ketmasidan`, { id: 'wax' }),
    { id: 'singers', label: `"The Cloister's weighers will want to know what the Tail pays them with."|«Весовщикам Обители будет любопытно, чем им платит Хвост.»|«Xonaqoh tarozibonlari Dum ularga nima bilan to'layotganini bilmoqchi bo'ladi.»` },
    { id: 'keep', label: `"Keep the lamps lit, Qudrat. I was never here."|«Пусть лампы горят, Кудрат. Меня здесь не было.»|«Chiroqlar yonaversin, Qudrat. Men bu yerda bo'lmadim.»` }
  ], o => {
    const fin = (lines, text) => play(lines, () => { FAC.finish('qk1', o.id, text); d(); });
    if (o.id === 'dam') {
      rep('tail', 1); FAC.react({ surayyo: 15, alp: -5, nargiza: 5 }, 'qk1');
      fin([
        ['', `The clay gives at the third blow. The channel coughs, then runs. In the chamber behind you the black glass shivers into ripples, and the lamps' reflections break apart.|Глина поддаётся с третьего удара. Арык кашляет — и бежит. В камере за спиной чёрное стекло идёт рябью, отражения ламп рассыпаются.|Loy uchinchi zarbada bo'shashadi. Ariq yo'taladi — keyin oqadi. Orqangdagi xonada qora shisha jimirlab ketadi, chiroqlarning aksi parchalanadi.`],
        ['qk_qudrat', `Thirty-one doors. I'll go round them myself before the Night of Payment. They should hear it from the one who asked.|Тридцать одна дверь. Обойду их сам до Ночи Уплаты. Пусть услышат от того, кто спрашивал.|O'ttiz bitta eshik. To'lov kechasigacha o'zim aylanib chiqaman. So'ragan odamdan eshitishsin.`],
        () => (sado() ? ['sado', `Tonight Husan will come down and find a tunnel. Just a tunnel.|Сегодня ночью Хусан спустится и найдёт тоннель. Просто тоннель.|Bugun kechasi Husan tushadi-yu, tunnelni topadi. Oddiy tunnelni.`] : null)
      ], `You broke Qudrat's dam. The lower rows have their water back; the Quiet Water is just water now. Thirty-one families will pay the next tithe with their own memories.|Ты сломал запруду Кудрата. К нижним рядам вернулась вода; «Тихая вода» теперь просто вода. Тридцать одна семья заплатит следующую десятину своей памятью.|Qudratning to'g'onini buzding. Pastki qatorlarga suv qaytdi; «Sokin suv» endi shunchaki suv. O'ttiz bitta oila keyingi ushrni o'z xotirasi bilan to'laydi.`);
    } else if (o.id === 'wax') {
      FAC.takeMem(`a brother, in wax|брат, в воске|egizak, mumda`); rep('tail', 1); FAC.react({ surayyo: -5, alp: -10 }, 'qk1');
      fin([
        ['', `You find Husan on the raft at dawn. He lets you; he thinks you're the water. What's left of Hasan comes out of him small and light: a rope, one doppi for two, a laugh on a ladder.|Хусана ты находишь на рассвете на плоту. Он не сопротивляется — думает, что ты вода. Остаток Хасана выходит из него маленьким и лёгким: верёвка, одна тюбетейка на двоих, смех на лестнице.|Husanni tongda sol ustida topasan. Qarshilik qilmaydi — seni suv deb o'ylaydi. Hasandan qolgan narsa undan kichkina va yengil bo'lib chiqadi: arqon, ikkoviga bitta do'ppi, narvondagi kulgi.`],
        ['qk_husan', `...Why am I on a raft? Who paid for this?|...Почему я на плоту? Кто за это заплатил?|...Nega sol ustidaman? Buning haqini kim to'ladi?`],
        ['', `Gulchehra takes the tumar without a word and puts it on the shelf where the pot used to stand.|Гульчехра молча берёт тумар и ставит на полку, где раньше стоял казан.|Gulchehra tumarni indamay oladi va avval qozon turgan tokchaga qo'yadi.`]
      ], `You took Hasan out of his twin into wax and gave him to Gulchehra. Husan no longer goes down. The dam and the sacks stay, and so does the lower rows' thirst.|Ты вынул Хасана из близнеца в воск и отдал Гульчехре. Хусан больше не спускается. Запруда и мешки остались, а с ними и жажда нижних рядов.|Hasanni egizagidan mumga olib, Gulchehraga berding. Husan endi pastga tushmaydi. To'g'on ham, qoplar ham joyida, pastki qatorlarning chanqog'i ham.`);
    } else if (o.id === 'singers') {
      rep('singers', 2); rep('tail', -2); gold(60); FAC.react({ surayyo: -15, nargiza: -5, alp: -5 }, 'qk1');
      fin([
        ['', `Two days later the weighers come down with lamps and a scribe. They study the walls the way jewellers study a vein of gold.|Через два дня спускаются весовщики с лампами и писцом. Разглядывают стены так, как ювелиры разглядывают золотую жилу.|Ikki kundan keyin tarozibonlar chiroq va mirza bilan tushib kelishadi. Devorlarga zargarlar tilla tomiriga qaragandek tikilishadi.`],
        ['', `The dam stays: the Singers need the water still. The pool is the Well's now, ten tilla a visit. Qudrat goes up to the Tower of Silence in chains. The thirty-one families are fined double.|Запруда остаётся: Певцам нужна стоячая вода. Водоём теперь принадлежит Колодцу, десять тилла за раз. Кудрата в цепях уводят к Башне молчания. Тридцать одну семью штрафуют вдвойне.|To'g'on qoladi: xonandalarga suv turishi kerak. Hovuz endi Quduqniki, har kirishga o'n tilla. Qudratni zanjirband qilib Sukunat minorasiga olib ketishadi. O'ttiz bitta oila ikki baravar jarimaga tortiladi.`],
        ['qk_qudrat', `You counted right, yodchi. You just counted for them.|Ты правильно посчитал, ёдчи. Только посчитал для них.|To'g'ri sanading, yodchi. Faqat ular uchun sanading.`]
      ], `You told the Cloister. The Quiet Water belongs to the Well now, at ten tilla a visit. The dam stands, Qudrat went to the Tower in chains, and the thirty-one families pay double.|Ты сообщил Обители. «Тихая вода» теперь принадлежит Колодцу, десять тилла за раз. Запруда стоит, Кудрата в цепях увели к Башне, а тридцать одна семья платит вдвойне.|Xonaqohga xabar berding. «Sokin suv» endi Quduqniki, har kirish o'n tilla. To'g'on turibdi, Qudratni zanjirda Minoraga olib ketishdi, o'ttiz bitta oila esa ikki baravar to'laydi.`);
    } else {
      gold(40); rep('tail', 1); FAC.react({ surayyo: -15, alp: 5, nargiza: -5 }, 'qk1');
      fin([
        ['', `He pushes a handful of coins into your palm without counting.|Он, не считая, суёт тебе в ладонь горсть монет.|U sanamay kaftingga bir hovuch tanga tutqazadi.`],
        ['qk_qudrat', `Eight people's fares. Don't argue. That's how the karez says thank you.|Плата за восьмерых. Не спорь. Так кяриз говорит спасибо.|Sakkiz kishining haqi. Talashma. Korez rahmatni shunday aytadi.`],
        () => (sado() ? ['sado', `Husan will come down again tonight.|Хусан опять спустится сегодня ночью.|Husan bugun kechasi yana tushadi.`] : null)
      ], `You kept Qudrat's secret. Thirty-one families keep their own memories, the lower rows buy their water, and every night Husan goes down to a brother he remembers less each time.|Ты сохранил тайну Кудрата. Тридцать одна семья сохраняет свою память, нижние ряды покупают воду, а Хусан каждую ночь спускается к брату, которого помнит всё меньше.|Qudratning sirini saqlading. O'ttiz bitta oila o'z xotirasini saqlaydi, pastki qatorlar suv sotib oladi, Husan esa har kecha tobora kam eslaydigan egizagi oldiga tushadi.`);
    }
  }));

  /* ---------------------------------------------------------------- who says what, and later */
  FAC.talk.qk_gulchehra = d => {
    if (q('qk1').st === 'none') { qkOffer(d); return; }
    if (act('qk1')) { play([['qk_gulchehra', K('dam') ? `You've been down. You smell of it. ...Don't tell me yet. Tell me when you know what to do.|Ты был внизу. От тебя пахнет. ...Не говори пока. Скажешь, когда будешь знать, что делать.|Pastda bo'lding. Hidingdan bilinyapti. ...Hozircha aytma. Nima qilishni bilganingda aytasan.` : `He went down again last night. He came back and kissed me and called me by my sister's name.|Он опять спускался ночью. Вернулся, поцеловал меня и назвал именем моей сестры.|Kecha yana tushdi. Qaytib, meni o'pdi-yu, singlimning ismi bilan chaqirdi.`]], d); return; }
    const b = br('qk1'), n = since('qk1');
    const L = {
      dam: `He shouts at me now. He broke two bowls and the rope is in the canal. ...It's better than the laughing down there. I think it is.|Теперь он на меня кричит. Разбил две пиалы, верёвку выкинул в арык. ...Это лучше, чем тот смех внизу. Мне кажется, лучше.|Endi menga baqiradi. Ikkita kosani sindirdi, arqonni ariqqa uloqtirdi. ...Pastdagi o'sha kulgidan yaxshiroq. Menimcha, yaxshiroq.`,
      wax: `Hasan is on my shelf, in a tumar. Husan asked whose it is. I said mine. ...It is mine now, isn't it?|Хасан у меня на полке, в тумаре. Хусан спросил, чей он. Я сказала — мой. ...Он ведь теперь мой, да?|Hasan tokchamda, tumarda. Husan kimniki, deb so'radi. Meniki, dedim. ...Endi u meniki-ku, to'g'rimi?`,
      singers: `The Singers came down our row with a book. We pay double now. Husan sold the door to pay it. We hang a curtain.|По нашему ряду прошли Певцы с книгой. Теперь мы платим вдвойне. Чтобы заплатить, Хусан продал дверь. Вешаем занавеску.|Qatorimizdan xonandalar kitob bilan o'tishdi. Endi ikki baravar to'laymiz. To'lash uchun Husan eshikni sotdi. Parda osib qo'yganmiz.`,
      keep: n >= 2 ? `Gulchehra sits on the raft beside her husband's empty place. "I go down with him now. I hold his hand while he talks to a stranger with his face."|Гульчехра сидит на плоту рядом с пустым местом мужа. «Теперь я спускаюсь с ним. Держу его за руку, пока он говорит с незнакомцем с его лицом».|Gulchehra sol ustida erining bo'sh joyi yonida o'tiribdi. «Endi u bilan birga tushaman. U o'z yuzli begona bilan gaplashganda qo'lini ushlab turaman».` : `He went down again. I'll sell the chest itself next.|Он опять спустился. Следующим продам сам сундук.|Yana tushib ketdi. Endi sandiqning o'zini sotaman.`
    };
    play([[b === 'keep' && n >= 2 ? '' : 'qk_gulchehra', L[b] || `…|…|…`]], d);
  };
  FAC.talk.qk_husan = d => {
    if (act('qk1') && !K('husan')) { qkHusan(d); return; }
    if (!done('qk1')) { play([['qk_husan', `Five tilla, yodchi. Tell Qudrat I'll be late tonight. Hasan won't mind; he was always the one who waited.|Пять тилла, ёдчи. Скажи Кудрату, что я сегодня припоздаю. Хасан не обидится, он всегда ждал.|Besh tilla, yodchi. Qudratga ayt, bugun kechikaman. Hasan xafa bo'lmaydi, doim kutadigan o'sha edi.`]], d); return; }
    const b = br('qk1'), n = since('qk1');
    const L = {
      dam: [['qk_husan', `You let the water out. I went down. It's a tunnel. I can't remember which of us was born first, and now nobody will ever tell me.|Ты выпустил воду. Я спустился. Там тоннель. Я не помню, кто из нас родился первым, и теперь мне этого никто не скажет.|Suvni chiqarib yubording. Tushdim. U yerda tunnel. Qaysi birimiz oldin tug'ilganimizni eslay olmayman, endi buni menga hech kim aytmaydi.`]],
      wax: n >= 1 ? [['', `Husan is selling karez tools on a mat at the Bazaar, cheerful, sunburnt.|Хусан торгует инструментом кяризчи с подстилки на Базаре — весёлый, загорелый.|Husan Bozorda bo'yra ustida korezchi asboblarini sotyapti — quvnoq, oftobda qoraygan.`], ['qk_husan', `Strange thing: I had two of everything. Two hoes, two lamps, two ropes. Need a second hoe, yodchi? Cheap.|Странное дело: у меня всего было по два. Два кетменя, две лампы, две верёвки. Тебе второй кетмень не нужен, ёдчи? Дёшево отдам.|Qiziq: menda hamma narsadan ikkitadan bor ekan. Ikkita ketmon, ikkita chiroq, ikkita arqon. Ikkinchi ketmon kerak emasmi, yodchi? Arzon beraman.`]] : [['qk_husan', `Gulchehra keeps looking at me as if I'd lost something. I haven't lost anything. Have I?|Гульчехра всё смотрит на меня так, будто я что-то потерял. Ничего я не терял. Или терял?|Gulchehra menga xuddi nimadir yo'qotgandek qarab-qarab qo'yadi. Hech narsa yo'qotmadim. Yo yo'qotdimmi?`]],
      singers: [['qk_husan', `Ten tilla now, to the Order. A Singer stands behind me and listens while I talk to him. I talk less.|Теперь десять тилла, в казну Певцов. Певец стоит у меня за спиной и слушает, пока я с ним говорю. Я стал меньше говорить.|Endi o'n tilla, xonandalar xazinasiga. Men u bilan gaplashganimda orqamda xonanda turib tinglaydi. Kamroq gapiradigan bo'ldim.`]],
      keep: n >= 2 ? [['qk_husan', `I come here to see someone. He laughs when I come. I don't know his name. He looks like me.|Я прихожу сюда к одному человеку. Он смеётся, когда я прихожу. Я не знаю, как его зовут. Он похож на меня.|Bu yerga bir odamni ko'rgani kelaman. Kelganimda u kuladi. Ismini bilmayman. U menga o'xshaydi.`]] : [['qk_husan', `Five tilla. Best money in the Tail. I told you.|Пять тилла. Лучшие деньги в Хвосте. Я же говорил.|Besh tilla. Dumdagi eng yaxshi pul. Aytgandim-ku.`]]
    }[b];
    play(L || [], d);
  };
  FAC.talk.qk_qudrat = d => {
    const s = q('qk1').st;
    if (s === 'none') { play([['qk_qudrat', `Five tilla, and you'll see whoever you've lost. No? Then don't block the light.|Пять тилла — и увидишь того, кого потерял. Нет? Тогда не загораживай свет.|Besh tilla — yo'qotgan odamingni ko'rasan. Yo'qmi? Unda yorug'ni to'sma.`]], d); return; }
    if (act('qk1')) {
      if (!K('raft')) { qkRaft(d); return; }
      if (qkAll()) { qkEnd(d); return; }
      play([['qk_qudrat', `You've seen it. Now you're counting. I can hear you counting from here.|Ты видел. Теперь считаешь. Я отсюда слышу, как ты считаешь.|Ko'rding. Endi sanayapsan. Sanayotganingni shu yerdan eshitib turibman.`]], d);
      return;
    }
    const b = br('qk1'), n = since('qk1');
    const L = {
      dam: n >= 1 ? [['', `Qudrat walks the lower channel with two full waterskins on his back, filling the jars at every door.|Кудрат идёт вдоль нижнего арыка с двумя полными бурдюками за спиной и наполняет кувшины у каждой двери.|Qudrat orqasida ikkita to'la mesh bilan pastki ariq bo'ylab yurib, har bir eshik oldidagi ko'zalarni to'ldiryapti.`], ['qk_qudrat', `They don't thank me. They look at me like I owe each of them a memory. I do. Thirty-one.|Спасибо не говорят. Смотрят так, будто я каждому должен по воспоминанию. Так и есть. Тридцать одно.|Rahmat deyishmaydi. Har biriga bittadan xotira qarzdordek qarashadi. Shunday ham. O'ttiz bitta.`]] : [['qk_qudrat', `The water's moving. I'd forgotten the sound.|Вода пошла. Я и забыл, как она звучит.|Suv yurdi. Uning ovozini unutib qo'ygan ekanman.`]],
      wax: [['qk_qudrat', `Husan stopped coming. His sack's half empty. His family will have to make up the rest on the Night of Payment, or I'll scrape it off the walls for them.|Хусан ходить перестал. Его мешок наполовину пуст. Остальное его семья доплатит в Ночь Уплаты — или я соскребу им со стен.|Husan kelmay qo'ydi. Uning qopi yarim bo'sh. Qolganini oilasi To'lov kechasi to'laydi — yoki men ularga devordan qirib beraman.`]],
      singers: n >= 1 ? [['', `In the shade of the Tower of Silence, chained among the Hollow, sits the raft-man. His sleeves are dry for the first time.|В тени Башни молчания, на цепи среди Пустых, сидит плотовщик. Рукава у него впервые сухие.|Sukunat minorasining soyasida, Bo'shlar orasida zanjirband bo'lib, solchi o'tiribdi. Yenglari ilk bor quruq.`], ['qk_qudrat', `They say I stole from the Well. I gave the Well more than the Tail ever gave it. That's the theft.|Говорят, я обокрал Колодец. Я дал Колодцу больше, чем Хвост дал ему за всю жизнь. В этом и кража.|Quduqni o'g'irladi, deyishyapti. Men Quduqqa Dum umr bo'yi bergandan ko'proq berdim. O'g'rilik shunda.`]] : [['qk_qudrat', `They'll come for me in a day or two. I've trimmed every wick. Somebody should have light.|Через день-другой за мной придут. Я подрезал все фитили. Пусть хоть у кого-то будет свет.|Bir-ikki kunda meni olib ketishgani kelishadi. Hamma piliklarni kesib qo'ydim. Hech bo'lmasa kimdadir yorug' bo'lsin.`]],
      keep: [['qk_qudrat', n >= 2 ? `Husan didn't know whom to look for last night. I gave him his five tilla back. He paid them again.|Хусан вчера не знал, кого ищет. Я вернул ему пять тилла. Он заплатил их снова.|Husan kecha kimni qidirayotganini bilmadi. Besh tillasini qaytarib berdim. U yana to'ladi.` : `The fare's six tilla now. Lamp oil went up.|Теперь перевоз стоит шесть тилла. Масло подорожало.|Endi yo'l haqi olti tilla. Moy qimmatlashdi.`]]
    }[b];
    play(L || [], d);
  };

  // the karez a day or more later
  COMP.beat('qk1_back', () => done('qk1') && COMP.region() === 'karez' && !COMP.inside() && since('qk1') >= 1, dn => {
    const T = {
      dam: `Down in the side tunnel the water runs again; you can hear it from the main gallery. The grey crust on the walls is going soft and sliding into the stream in long strips.|В боковом тоннеле снова бежит вода — слышно даже из главной галереи. Серая корка на стенах размякает и длинными полосами сползает в поток.|Yon tunnelda suv yana oqyapti — asosiy yo'lakdan ham eshitiladi. Devorlardagi kulrang qatlam yumshab, uzun-uzun bo'lib oqimga sirg'alib tushyapti.`,
      wax: `The raft rocks by the side tunnel. Fewer lamps on the ledges tonight. Qudrat is scraping the walls more often.|Плот покачивается у бокового тоннеля. Ламп на уступах сегодня меньше. Кудрат скребёт стены чаще.|Sol yon tunnel yonida chayqaladi. Bugun tokchalarda chiroq kamroq. Qudrat devorlarni tez-tez qiryapti.`,
      singers: `A Singer with a ledger sits where the raft-man used to sit. The queue of mourners is longer than before, and quieter.|Там, где сидел плотовщик, теперь сидит Певец с книгой. Очередь скорбящих длиннее прежнего и тише.|Solchi o'tirgan joyda endi daftarli xonanda o'tiribdi. Motamdorlar navbati avvalgidan uzunroq va jimroq.`,
      keep: `The lamps in the side tunnel burn as before. Someone has carved a new name into the ledge: HASAN. Below it, more faintly, a question mark.|Лампы в боковом тоннеле горят, как прежде. На уступе кто-то вырезал новое имя: ХАСАН. Под ним, слабее, — вопросительный знак.|Yon tunneldagi chiroqlar avvalgidek yonyapti. Tokchaga kimdir yangi ism o'yibdi: HASAN. Tagida, xiraroq — so'roq belgisi.`
    };
    play([['', T[br('qk1')] || T.keep]], dn);
  });

  SIDE.epi('qk1', () => (!done('qk1') ? null : {
    dam: `The lower rows of the Tail had their water back. The next Night of Payment thirty-one families paid with their own memories; Qudrat stood at the Cloister gate and said each name aloud as they went in.|Нижние ряды Хвоста снова получили воду. В следующую Ночь Уплаты тридцать одна семья платила своей памятью; Кудрат стоял у ворот Обители и вслух называл каждое имя.|Dumning pastki qatorlariga suv qaytdi. Keyingi To'lov kechasi o'ttiz bitta oila o'z xotirasi bilan to'ladi; Qudrat xonaqoh darvozasida turib, har birining ismini ovoz chiqarib aytdi.`,
    wax: `A tumar stood on Gulchehra's shelf where the pot used to be. Husan dug shafts alone and never asked whose it was. The Quiet Water went on taking the Tail's dead, a little at a time.|На полке у Гульчехры, где раньше стоял казан, стоял тумар. Хусан чистил колодцы один и ни разу не спросил, чей он. «Тихая вода» понемногу забирала мёртвых Хвоста.|Gulchehraning tokchasida, avval qozon turgan joyda, tumar turardi. Husan quduqlarni yolg'iz tozaladi, u kimniki ekanini so'ramadi. «Sokin suv» Dumning o'liklarini asta-sekin olaverdi.`,
    singers: `The Well's Chamber of the Quiet Water took ten tilla a visit and became the Singers' richest shrine. Qudrat died in the Tower of Silence. The lower channel never ran full again.|Палата Тихой воды при Колодце брала по десять тилла и стала самым богатым святилищем Певцов. Кудрат умер в Башне молчания. Нижний арык так и не наполнился.|Quduqning Sokin suv xonasi har kirishga o'n tilla oldi va xonandalarning eng boy ziyoratgohiga aylandi. Qudrat Sukunat minorasida o'ldi. Pastki ariq boshqa to'lmadi.`,
    keep: `Thirty-one families of the Tail were never sung empty. Husan went down to the Quiet Water until he saw only a stranger with his face, and kept going, because the stranger laughed.|Тридцать одну семью Хвоста так и не выпели досуха. Хусан ходил к «Тихой воде», пока не стал видеть там незнакомца со своим лицом, — и ходил дальше, потому что незнакомец смеялся.|Dumning o'ttiz bitta oilasi hech qachon kuylab bo'shatilmadi. Husan «Sokin suv»da o'z yuzli begonani ko'radigan bo'lguncha bordi — keyin ham boraverdi, chunki begona kulardi.`
  }[br('qk1')] || null), 'mehri:carried');

  /* ================================================================================================ qs1 · THE DAY BEFORE THE FESTIVAL */
  CAST.qs_qumri = { name: `Qumri-xola|Кумри-хола|Qumri xola`, portrait: null };
  CAST.qs_elyor = { name: `Elyor, a baker's porter|Эльёр, носильщик из пекарни|Novvoyxona hammoli Elyor`, portrait: null };
  CAST.qs_ozoda = { name: `Ozoda, who used to be a Singer|Озода, бывшая Певица|Sobiq xonanda Ozoda`, portrait: null };
  const LKS = {
    qumri: { body: 'woman', robe: '#6a3a4a', trim: '#e2b452', skin: '#c09070', head: 'scarf', headC: '#c8a040', headC2: '#a8323a', pat: 'atlas', patA: '#8a4a5a', patB: '#d8b060' },
    qumriDark: { body: 'woman', robe: '#2e2a30', trim: '#5a5058', skin: '#c09070', head: 'scarf', headC: '#1e1a20', headC2: '#4a4248', pat: 'plain' },
    elyor: { body: 'man', robe: '#d8d0bc', trim: '#a89878', skin: '#b88a64', head: 'doppi', headC: '#2a2420', headC2: '#e8e0cc', beard: 'short', sash: '#8a7a5a' },
    ozoda: { body: 'woman', robe: '#b8b4b0', trim: '#7a8aa0', skin: '#b89070', head: 'scarf', headC: '#a8a4a0', pat: 'plain' }
  };
  SIDE.quest('qs1', { n: 25, title: `The Day Before the Festival|Накануне праздника|Bayram arafasi`, where: ['streets', 'qs1_house'] });
  FAC.spot('streets', 'qs1_house', 0.22);
  FAC.spot('streets', 'qs1_room', 0.27);
  FAC.spot('tail', 'qs1_bake', 0.14);
  FAC.spot('old', 'qs1_ozoda', 0.9);
  FAC.spot('old', 'qs1_door', 0.64);
  const S = k => sf('qs1_' + k);
  const setS = (k, v) => sf('qs1_' + k, v === undefined ? 1 : v);

  FAC.npc('qs_qumri', { name: CAST.qs_qumri.name, look: LKS.qumri, dx: -6, prompt: `Talk to the woman in the lit house|Поговорить с женщиной в освещённом доме|Chiroq yongan uydagi ayol bilan gaplashish`, idle: `A woman in a festival scarf sets a fourth bowl on the table, then straightens it.|Женщина в праздничном платке ставит на стол четвёртую пиалу, потом поправляет её.|Bayram ro'molini o'ragan ayol dasturxonga to'rtinchi kosani qo'yadi, keyin uni to'g'rilab qo'yadi.` },
    () => (done('qs1') && br('qs1') === 'truth' && since('qs1') >= 1 ? [{ from: 7, to: 19, region: 'tail', spot: 'qs1_bake' }] : [{ from: 0, to: 24, region: 'streets', spot: 'qs1_house' }]));
  FAC.npc('qs_elyor', { name: CAST.qs_elyor.name, look: LKS.elyor, dx: 14, prompt: `Talk to the porter|Поговорить с носильщиком|Hammol bilan gaplashish`, idle: `A broad man in a floury apron carries a tray of bread on his head, his eyes on the ground.|Широкий мужчина в мучном фартуке несёт на голове поднос с лепёшками, глаза в землю.|Unga belangan fartukli barzangi erkak boshida non to'la patnis ko'tarib ketyapti, ko'zi yerda.` },
    () => (done('qs1') && br('qs1') === 'truth' ? [{ from: 6, to: 22, region: 'tail', spot: 'qs1_bake' }] : [{ from: 6, to: 19, region: 'tail', spot: 'qs1_bake' }, { from: 19, to: 6, region: 'streets', spot: 'qs1_house' }]));
  FAC.npc('qs_ozoda', { name: CAST.qs_ozoda.name, look: LKS.ozoda, dx: 0, prompt: `Talk to the woman in grey-white|Поговорить с женщиной в сером-белом|Oqish-kulrang kiyimli ayol bilan gaplashish`, idle: `A woman in a Singer's white, gone grey with wear, sits apart from the masked ones and sews up a tear that isn't there.|Женщина в белом одеянии Певцов, посеревшем от носки, сидит поодаль от людей в масках и зашивает дыру, которой нет.|Kiyilaverib kulrang tortgan xonanda oqini kiygan ayol niqoblilardan chetroqda o'tirib, yo'q yirtiqni tikyapti.` },
    () => (done('qs1') && br('qs1') === 'truth' && since('qs1') >= 2 ? [{ from: 0, to: 24, region: 'streets', spot: 'qs1_house' }] : [{ from: 0, to: 24, region: 'old', spot: 'qs1_ozoda' }]));
  // after the truth Qumri wears a plain dark scarf
  s6init(() => { try { const n = G.WORLD2.npcs.qs_qumri; if (n) Object.defineProperty(n, 'look', { configurable: true, get() { return done('qs1') && br('qs1') === 'truth' ? LKS.qumriDark : LKS.qumri; }, set() { } }); } catch (e) { /* ignore */ } });

  /* ---------------------------------------------------------------- 1 · the woman in the lit house */
  const qsOffer = d => play([
    ['', `Half a house, swallowed by the wall up to the windowsills. Under the stone sky the yard still has air, a lamp in the window, a table laid for four. A pot of shavla is steaming.|Полдома, проглоченного стеной по самые подоконники. Под каменным небом во дворе ещё есть воздух, в окне лампа, стол накрыт на четверых. Над казаном с шавлой поднимается пар.|Devor deraza tokchasigacha yutib yuborgan yarim uy. Tosh osmon ostida hovlida hali havo bor, derazada chiroq, dasturxon to'rt kishiga yozilgan. Qozondagi shavladan bug' ko'tarilyapti.`],
    () => (done('qk1') && br('qk1') === 'dam' ? ['', `Water stands on the lowest step. She sweeps it out of the door with a broom and laughs: the cistern's high this year.|На нижней ступеньке стоит вода. Она выметает её за порог веником и смеётся: в этом году цистерна полная.|Eng pastki zinada suv turibdi. Ayol uni supurgi bilan ostonadan supurib chiqaradi va kuladi: bu yil sardoba to'la.`] : null),
    ['qs_qumri', `A yodchi! You're new. Where's Rustam-aka? He always comes the day before the Festival, drinks his tea and forgets what we owe.|Ёдчи! Новенький? А где Рустам-ака? Он всегда приходит накануне праздника, пьёт чай и забывает, сколько мы должны.|Yodchi! Yangimisan? Rustam aka qani? U doim bayram arafasida keladi, choyini ichadi-yu, qarzimizni unutib qo'yadi.`],
    ['qs_qumri', `Sit, the shavla's ready. Nosir's at the kilns. And Mohinur ran off to the cistern to watch them paint the boats. She ought to be back by now.|Садись, шавла готова. Носир на печах. А Мохинур убежала к цистерне смотреть, как красят лодочки. Пора бы ей уже вернуться.|O'tir, shavla tayyor. Nosir xumdonda. Mohinur esa qayiqchalarni bo'yashayotganini ko'rgani sardobaga yugurib ketdi. Allaqachon qaytishi kerak edi.`],
    () => (sado() ? ['sado', `The Water Festival. They stopped holding it... a long time ago, didn't they?|Праздник воды. Его ведь перестали устраивать... давно, да?|Suv bayrami. Uni o'tkazmay qo'yishgan-ku... ancha oldin, a?`] : null)
  ], () => hub(`Qumri-xola|Кумри-хола|Qumri xola`, [
    { label: `— What year is it, xola?|— Какой сейчас год, хола?|— Hozir qaysi yil, xola?`, lines: [
      ['qs_qumri', `What a question. The year after the dry one. Have you been drinking with Rustam-aka? ...Why are you looking at me like that?|Ну и вопрос. Год после засухи. Ты что, с Рустамом-ака выпил? ...Чего ты так на меня смотришь?|Qiziq savol-ku. Qurg'oqchilikdan keyingi yil. Rustam aka bilan ichdingmi? ...Nega menga bunaqa qarayapsan?`]
    ] },
    { label: `— Who brings your bread?|— Кто тебе носит хлеб?|— Noningizni kim olib keladi?`, lines: [
      ['qs_qumri', `The neighbours' boy. A big kind fellow, always tired, flour up to his elbows. I tell him to bring his wife round to show me. He only smiles.|Соседский парень. Здоровый, добрый, вечно уставший, в муке по локоть. Говорю ему: приведи уже жену показать. А он только улыбается.|Qo'shnining o'g'li. Barzangi, mehribon, doim charchagan, tirsagigacha un. Unga aytaman: xotiningni bir olib kel, ko'raylik. U faqat jilmayadi.`],
      ['qs_qumri', `My Elyor is twelve. He's at his uncle's in Kitob till autumn. He'll be so cross to miss the boats.|Моему Эльёру двенадцать. Он до осени у дяди в Китабе. Вот расстроится, что лодочки пропустит.|Mening Elyorim o'n ikki yoshda. Kuzgacha Kitobda, tog'asinikida. Qayiqchalarni ko'rmay qolsa, xafa bo'ladi-da.`]
    ] }
  ], [
    { id: 'yes', label: `"I'll go and look for Mohinur, xola."|«Пойду поищу Мохинур, хола.»|«Borib Mohinurni qidiray, xola.»` },
    { id: 'tea', label: `"I'll have the tea. Rustam-aka would."|«Чаю выпью. Рустам-ака бы выпил.»|«Choy ichaman. Rustam aka ham ichardi.»` }
  ], o => {
    setS('tea', o.id === 'tea' ? 1 : 0);
    FAC.begin('qs1', `In a house half-swallowed by the wall, Qumri-xola lives on the eve of the Water Festival of twenty years ago. Her daughter Mohinur is "late". Look around.|В доме, наполовину проглоченном стеной, Кумри-хола живёт в канун Праздника воды двадцатилетней давности. Её дочь Мохинур «задерживается». Осмотреться.|Devor yarmigacha yutgan uyda Qumri xola yigirma yil oldingi Suv bayrami arafasida yashayapti. Qizi Mohinur «kechikyapti». Atrofni ko'zdan kechirish kerak.`, ['streets', 'qs1_house']);
    qsLook(d, {});
  }));
  const qsLook = (d, tried) => ask(`She hums as she ladles the shavla. The fourth bowl, the small one, she fills first.|Раскладывая шавлу, она напевает. Четвёртую, маленькую пиалу наполняет первой.|Shavlani suzayotib xirgoyi qiladi. To'rtinchi, kichkina kosani birinchi to'ldiradi.`, [
    FAC.craft('taste', `her "yesterday", through her|её «вчера» — через неё|uning «kecha»sini — u orqali`, { id: 'taste' }),
    tried.song ? null : FAC.chk('song', 4, `Listen to how she says "tomorrow".|Вслушаться, как она говорит «завтра».|Uning «ertaga» deyishiga quloq solish.`, { id: 'song' }),
    { id: 'look', label: `Look round the house while she ladles.|Пока она разливает, осмотреть дом.|U suzayotganda uyni ko'zdan kechirish.` }
  ], o => {
    const fin = lines => play((lines || []), () => {
      setS('qumri');
      FAC.stepTo('qs1', `Qumri-xola lives on the eve of the Water Festival of twenty years ago, and someone keeps her there. Her daughter Mohinur is "late". Look at the girl's room under the wall.|Кумри-хола живёт в канун Праздника воды двадцатилетней давности, и кто-то её там держит. Её дочь Мохинур «задерживается». Осмотреть комнату девочки под стеной.|Qumri xola yigirma yil oldingi Suv bayrami arafasida yashayapti, kimdir uni o'sha yerda ushlab turibdi. Qizi Mohinur «kechikyapti». Devor ostidagi qizning xonasini ko'rish kerak.`, ['streets', 'qs1_room']);
      d();
    });
    if (o.id === 'taste') {
      setS('seam');
      FAC.taste([
        ['memory', `The eve of the Festival. Shavla, Nosir's clay-grey hands, Mohinur's paint-blue ones. Bright and clean. Too clean: no smell of the next evening, no edges, like a coin struck yesterday.|Канун праздника. Шавла, серые от глины руки Носира, синие от краски руки Мохинур. Всё ярко и чисто. Слишком чисто: ни запаха следующего вечера, ни краёв, как монета вчерашней чеканки.|Bayram arafasi. Shavla, Nosirning loydan kulrang qo'llari, Mohinurning bo'yoqdan ko'k qo'llari. Yorqin va toza. Haddan tashqari toza: ertasi oqshomning hidi yo'q, cheti yo'q, kecha zarb qilingan tangadek.`],
        ['memory', `And under it, sewn on with a Singer's stitch, a place where something was torn out. The seam is fresh. Someone re-sews it often.|А под ним, пришитое певческим стежком, — место, откуда что-то вырвали. Шов свежий. Кто-то часто его перешивает.|Uning tagida esa, xonandacha chok bilan tikilgan — nimadir yirtib olingan joy. Chok yangi. Kimdir uni tez-tez qayta tikadi.`]
      ], () => fin([]), { person: true, intro: `You take her hand to stop the ladle. She lets you, the way you'd let a guest.|Ты берёшь её за руку, чтобы остановить половник. Она позволяет — как позволяют гостю.|Cho'michni to'xtatish uchun uning qo'lidan ushlaysan. U mehmonga ruxsat bergandek qarshilik qilmaydi.` });
      return;
    }
    if (o.id === 'song' && o.ok) {
      setS('seam');
      fin([['hero', `She says it the way the Singers teach novices to hold one note: no breath before, none after. Somebody sang that word into her.|Она произносит его так, как Певцы учат послушников тянуть одну ноту: без вдоха до и после. Это слово в неё кто-то впел.|U bu so'zni xonandalar shogirdlarga bitta notani cho'zishni o'rgatgandek aytadi: oldin ham, keyin ham nafas yo'q. Bu so'zni unga kimdir kuylab joylagan.`]]);
      return;
    }
    if (o.id === 'song') { play([['', `"Tomorrow," she says, and it sounds like any woman saying tomorrow.|«Завтра», — говорит она, и это звучит, как у любой женщины.|«Ertaga», deydi u, xuddi har qanday ayol aytgandek.`]], () => qsLook(d, { song: 1 })); return; }
    setS('tally');
    fin([
      ['', `On the door post, scratches in rows of twelve. You count them. Two hundred and forty. Twenty years of new moons.|На дверном косяке царапины, рядами по двенадцать. Ты считаешь. Двести сорок. Двадцать лет новолуний.|Eshik kesakisida o'n ikkitadan qator-qator tirnalgan chiziqlar. Sanaysan. Ikki yuz qirq. Yigirma yillik yangi oy.`],
      ['', `Three of the bowls are grey with dust under the shavla. Only hers is clean.|Под шавлой три пиалы серые от пыли. Чистая только её.|Shavla ostida uchta kosa changdan kulrang. Faqat unikisi toza.`]
    ]);
  });

  /* ---------------------------------------------------------------- 2 · the girl's room */
  const qsRoom = d => play([
    ['', `The back of the house is the wall itself: rough stone that came through the room one night and stayed. A child's bed, half under it. On the shelf a little wooden boat with a lamp in it, painted blue, never finished.|Задняя часть дома — это сама стена: грубый камень, который однажды ночью вошёл в комнату и остался. Детская кровать, наполовину под ним. На полке деревянная лодочка с лампой, синяя, недокрашенная.|Uyning orqa qismi — devorning o'zi: bir kecha xonaga kirib, shu yerda qolib ketgan qo'pol tosh. Bolalar karavotining yarmi uning ostida. Tokchada ichida chirog'i bor yog'och qayiqcha — ko'kka bo'yalgan, oxiriga yetmagan.`]
  ], () => qsRoomAsk(d, {}));
  const qsRoomAsk = (d, tried) => ask(`The paint on the boat is still tacky after twenty years. Somebody touches it up.|Краска на лодочке за двадцать лет так и не высохла. Кто-то её подновляет.|Qayiqchadagi bo'yoq yigirma yilda ham qurimagan. Kimdir uni yangilab turadi.`, [
    FAC.craft('taste', `the boat|лодочку|qayiqchani`, { id: 'taste' }),
    tried.dig ? null : FAC.chk('end', 3, `Clear the rubble by the bed.|Разобрать завал у кровати.|Karavot yonidagi vayronani tozalash.`, { id: 'dig' }),
    { id: 'shelf', label: `See what else is on the shelf.|Посмотреть, что ещё есть на полке.|Tokchada yana nima borligini ko'rish.` }
  ], o => {
    const fin = lines => play((lines || []).concat([
      cl('alp', `Somebody dug here and put it back. Alp knows that kind of digging. You do it when you can't leave and can't stay.|Тут кто-то копал и сложил обратно. Алп знает такие раскопки. Так копают, когда не можешь уйти и не можешь остаться.|Bu yerni kimdir qazib, qayta ko'mgan. Alp bunaqa qazishni biladi. Ketolmaganda ham, qololmaganda ham shunday qaziysan.`)
    ]), () => {
      setS('room');
      FAC.stepTo('qs1', `Nosir and Mohinur died when the wall came through the house; someone buried them under the girl's bed. The "neighbours' boy" brings Qumri bread and oil; by day he works at a bakery in the Tail.|Носир и Мохинур погибли, когда стена прошла через дом; кто-то похоронил их под кроватью девочки. Хлеб и масло Кумри носит «соседский парень»: днём он работает в пекарне в Хвосте.|Devor uydan o'tganda Nosir bilan Mohinur halok bo'lgan; kimdir ularni qizning karavoti ostiga ko'mgan. Qumriga non va moyni «qo'shnining o'g'li» olib keladi: kunduzi u Dumdagi novvoyxonada ishlaydi.`, ['tail', 'qs1_bake']);
      d();
    });
    if (o.id === 'taste') {
      setS('night');
      FAC.taste([
        ['memory', `Evening. A girl paints the side of the boat and sings off key. Her father comes in, grey with clay. The floor breathes in. The wall comes through the room like a slow wave.|Вечер. Девочка красит борт лодочки и фальшиво поёт. Входит отец, серый от глины. Пол делает вдох. Стена проходит через комнату, как медленная волна.|Oqshom. Qizcha qayiqchaning bortini bo'yab, noto'g'ri ohangda qo'shiq aytadi. Loydan kulrang otasi kiradi. Pol nafas oladi. Devor xonadan sekin to'lqindek o'tadi.`],
        ['memory', `Later: a boy of twelve, back early from Kitob, holding his mother's hand while she screams.|Потом: мальчик лет двенадцати, раньше срока вернувшийся из Китаба, держит мать за руку, а она кричит.|Keyin: Kitobdan muddatidan oldin qaytgan o'n ikki yoshli bola qichqirayotgan onasining qo'lini ushlab turibdi.`],
        ['memory', `A woman in white kneels beside her and sings. The screaming stops. His mother asks what to cook for the Festival.|Рядом опускается на колени женщина в белом и поёт. Крик обрывается. Мать спрашивает, что приготовить к празднику.|Yoniga oq kiyimli ayol tiz cho'kib kuylaydi. Qichqiriq tinadi. Ona bayramga nima pishiray, deb so'raydi.`]
      ], () => fin([]), { intro: `You lift the boat. It's lighter than it looks, and still sticky with blue.|Берёшь лодочку. Она легче, чем кажется, и всё ещё липкая от синей краски.|Qayiqchani olasan. Ko'ringanidan yengilroq, hali ham ko'k bo'yoqdan yopishqoq.` });
      return;
    }
    if (o.id === 'dig' && o.ok) {
      setS('grave');
      fin([['', `The rubble here was moved once already, carefully, and put back. Underneath, two clay tablets are pressed into the floor, a potter's work: NOSIR. MOHINUR.|Завал здесь уже разбирали — бережно — и сложили обратно. Под ним в пол вдавлены две глиняные таблички, работа гончара: НОСИР. МОХИНУР.|Bu yerdagi vayronani bir marta — ehtiyotlab — olib, qayta joyiga qo'yishgan. Tagida polga ikkita sopol lavha bosilgan, kulol ishi: NOSIR. MOHINUR.`]]);
      return;
    }
    if (o.id === 'dig') { play([['', `The stones are wedged tight. Whoever set them back meant them to stay.|Камни засели намертво. Тот, кто их укладывал, хотел, чтобы они лежали.|Toshlar mahkam tiqilib qolgan. Ularni joyiga qo'ygan odam qimirlamasin degan.`]], () => qsRoomAsk(d, { dig: 1 })); return; }
    fin([['', `Behind the boat: a baker's tally stick notched by the week, and a jar of lamp oil with a karez smuggler's knot on the stopper. Somebody keeps this house in bread and light.|За лодочкой — пекарская бирка с недельными зарубками и кувшин лампового масла с узлом кяризных контрабандистов на пробке. Кто-то снабжает этот дом хлебом и светом.|Qayiqcha ortida haftalik kertikli novvoy cho'pi va tiqinida korez kontrabandachilarining tuguni bor lampa moyi ko'zasi. Kimdir bu uyni non va yorug'lik bilan ta'minlab turibdi.`]]);
  });
  FAC.prop('streets', 'qs1_room', { id: 'qs1room', art: 'f6glint', dx: 6, prompt: `The girl's room under the wall|Комната девочки под стеной|Devor ostidagi qizning xonasi`, when: () => act('qs1') && S('qumri') && !S('room'), use: d => qsRoom(d) });

  /* ---------------------------------------------------------------- 3 · the son */
  const qsElyor = d => play([
    ['qs_elyor', `You've been to the house. You smell of the shavla. ...Sit down. Not here. ...All right, here.|Ты был в том доме. От тебя пахнет шавлой. ...Сядь. Не здесь. ...Ладно, здесь.|O'sha uyga borgansan. Sendan shavla hidi kelyapti. ...O'tir. Bu yerda emas. ...Mayli, shu yerda.`],
    ['qs_elyor', `She's my mother. To her I'm the neighbours' boy. Her Elyor is twelve and at his uncle's in Kitob. I've been at my uncle's for twenty years.|Она моя мать. Для неё я соседский парень. Её Эльёру двенадцать, он у дяди в Китабе. Я у дяди уже двадцать лет.|U mening onam. Uning uchun men qo'shnining o'g'liman. Uning Elyori o'n ikki yoshda, Kitobda, tog'asinikida. Men tog'amnikida yigirma yildan beri yuribman.`],
    ['qs_elyor', `She's happy. Twenty years. Name me one person in the Tail who's been happy for twenty years.|Она счастлива. Двадцать лет. Назови мне хоть одного человека в Хвосте, кто двадцать лет счастлив.|U baxtli. Yigirma yildan beri. Dumda yigirma yil baxtli yashagan bitta odamni ayt-chi.`]
  ], () => hub(`Elyor|Эльёр|Elyor`, [
    { label: `— Why not tell her?|— Почему ты ей не скажешь?|— Nega unga aytmaysan?`, lines: [
      ['qs_elyor', `I did. The fourth year. She screamed for three days. On the third night she went at the wall after them with her bare hands.|Сказал. На четвёртый год. Она три дня кричала. На третью ночь полезла в стену за ними голыми руками.|Aytganman. To'rtinchi yili. Uch kun qichqirdi. Uchinchi kechasi ularning ortidan devorni yalang qo'li bilan tirnay boshladi.`],
      ['qs_elyor', `Ozoda came that night and sang. In the morning Mother asked me whose boy I was.|В ту ночь пришла Озода и спела. Утром мама спросила, чей я сын.|O'sha kechasi Ozoda kelib kuyladi. Ertalab onam mendan kimning o'g'lisan, deb so'radi.`]
    ] },
    { label: `— Who is Ozoda?|— Кто такая Озода?|— Ozoda kim?`, lines: [
      ['qs_elyor', `She used to be a Singer. She doesn't remember her own name; Those Who Remember call her Ozoda. She lives in Old Yodgor and comes up to us every new moon.|Бывшая Певица. Своего имени не помнит; Озодой её зовут Помнящие. Живёт в Старом Ёдгоре и поднимается к нам каждое новолуние.|Sobiq xonanda. O'z ismini eslamaydi; Ozoda deb uni Eslaganlar atashadi. Eski Yodgorda yashaydi, har yangi oyda biznikiga chiqadi.`],
      ['qs_elyor', `She won't take money. I bring her bread. She says she owes more than bread, and won't say to whom.|Денег не берёт. Я ношу ей хлеб. Говорит, сама должна больше, чем хлеб, а кому — не говорит.|Pul olmaydi. Unga non olib boraman. O'zim nondan ko'proq qarzdorman, deydi, kimga — aytmaydi.`]
    ] },
    { label: `— Have the Singers been down your way?|— Певцы к вам не заглядывали?|— Xonandalar siz tomonlarga tushishmadimi?`, if: () => done('qk1') && br('qk1') === 'singers', lines: [
      ['qs_elyor', `Since they took the raft-man's water they walk the streets with a book. They asked whose lamp burns in the swallowed house. I said a madwoman's.|С тех пор как они забрали воду у плотовщика, ходят по улицам с книгой. Спрашивали, чья лампа горит в проглоченном доме. Я сказал: сумасшедшей.|Solchining suvini olishganidan beri ko'chalarda kitob bilan yurishadi. Yutilgan uyda kimning chirog'i yonayapti, deb so'rashdi. Bir telbaniki, dedim.`]
    ] }
  ], [
    { id: 'promise', label: `"I won't tell her anything. Not today."|«Ничего ей не скажу. Сегодня — нет.»|«Unga hech narsa demayman. Bugun — yo'q.»` },
    { id: 'warn', label: `"One day the singing won't hold. You know that."|«Однажды песня не удержит. Ты это знаешь.»|«Bir kun qo'shiq ushlab turolmaydi. Buni bilasan.»` }
  ], o => {
    setS('elyor'); setS('warned', o.id === 'warn' ? 1 : 0);
    play(o.id === 'warn' ? [
      ['qs_elyor', `I know. Every time Ozoda sings, Mother forgets a little more. Last year it was Father's face. She still sets his bowl, because her hands remember.|Знаю. Каждый раз, как Озода поёт, мама забывает ещё чуть-чуть. В прошлом году — лицо отца. Пиалу ему по-прежнему ставит: руки помнят.|Bilaman. Ozoda har kuylaganda onam yana ozgina unutadi. O'tgan yili — otamning yuzini. Kosasini hamon qo'yadi: qo'llari eslaydi.`]
    ] : [
      ['qs_elyor', `Not today. Everyone says not today. Twenty years of not today.|Сегодня — нет. Все так говорят: сегодня нет. Двадцать лет «сегодня нет».|Bugun — yo'q. Hamma shunday deydi: bugun yo'q. Yigirma yil «bugun yo'q».`]
    ], () => {
      FAC.stepTo('qs1', `Qumri's son Elyor keeps her on the eve of the Festival: every new moon Ozoda, who used to be a Singer, sings the eve back into her, and each time Qumri loses a little more. Find Ozoda in Old Yodgor.|Сын Кумри, Эльёр, держит мать в канун праздника: каждое новолуние бывшая Певица Озода заново впевает ей канун, и каждый раз Кумри теряет ещё немного. Найти Озоду в Старом Ёдгоре.|Qumrining o'g'li Elyor onasini bayram arafasida ushlab turibdi: har yangi oyda sobiq xonanda Ozoda unga arafani qayta kuylab joylaydi, har safar Qumri yana ozgina yo'qotadi. Ozodani Eski Yodgordan topish kerak.`, ['old', 'qs1_ozoda']);
      d();
    });
  }));

  /* ---------------------------------------------------------------- 4 · the Singer that was */
  const qsOzoda = d => play([
    ['', `She looks up before you speak, the way Singers do: they hear a person's breathing change.|Она поднимает глаза раньше, чем ты заговоришь, — как умеют Певцы: они слышат, как у человека меняется дыхание.|Sen gapirmasingdan oldin u boshini ko'taradi — xonandalar shunday qila oladi: ular odamning nafasi o'zgarganini eshitadi.`],
    ['qs_ozoda', `Qumri. You smell of her shavla. Did Elyor send you, or did you come by yourself? It doesn't matter. Sit.|Кумри. От тебя пахнет её шавлой. Эльёр прислал или сам пришёл? Неважно. Садись.|Qumri. Sendan uning shavlasining hidi kelyapti. Elyor yubordimi yoki o'zing keldingmi? Farqi yo'q. O'tir.`],
    ['qs_ozoda', `The year of the Small Awakening the Singers doubled the Tail's tithe and sent us down the rows to collect from whoever was left. I collected from Qumri. Her grief. Grief weighs well.|В год Малого Пробуждения Певцы удвоили десятину Хвоста и послали нас по рядам — собирать с тех, кто остался. Я собирала с Кумри. Её горе. Горе хорошо весит.|Kichik Uyg'onish yili xonandalar Dumning ushrini ikki baravar qilib, bizni omon qolganlardan yig'ish uchun qatorlarga yuborishdi. Men Qumridan yig'dim. Qayg'usini. Qayg'u yaxshi tortadi.`],
    ['qs_ozoda', `A hole where grief was fills with whatever's nearest. Hers was filling with the wall. So I sang her the day before, and the day before held. It still holds.|Дыра на месте горя заполняется тем, что ближе. Её дыру заполняла стена. Тогда я спела ей канун, и канун удержал. Держит до сих пор.|Qayg'u o'rnidagi teshik eng yaqindagi narsa bilan to'ladi. Unikini devor to'ldirayotgan edi. Shunda men unga arafani kuylab berdim, arafa ushlab qoldi. Hali ham ushlab turibdi.`],
    ['qs_ozoda', `Only every new moon it takes a little more of her to hold it.|Только каждое новолуние на это уходит ещё немного её самой.|Faqat har yangi oyda bunga uning o'zidan yana ozgina ketadi.`]
  ], () => hub(`Ozoda|Озода|Ozoda`, [
    { label: `— Where's her grief now?|— Где теперь её горе?|— Uning qayg'usi hozir qayerda?`, lines: [
      ['qs_ozoda', `Not in the Well. I couldn't. For twenty years I've kept it here, behind a founders' door. With the others I took that winter.|Не в Колодце. Не смогла. Двадцать лет держу его здесь, за дверью основателей. Вместе с остальными, что взяла той зимой.|Quduqda emas. Qo'lim bormadi. Yigirma yildan beri uni shu yerda, asoschilar eshigi ortida saqlayman. O'sha qishda olganlarimning qolgani bilan birga.`],
      ['qs_ozoda', `That door opens only for someone who has forgotten their own name. I sold mine the next year to pay my own tithe. It's the only door in this city that likes me.|Эта дверь открывается только тому, кто забыл своё имя. Своё я продала на следующий год — заплатить собственную десятину. Единственная дверь в городе, которой я по душе.|Bu eshik faqat o'z ismini unutgan odamga ochiladi. Men o'zimnikini keyingi yili o'z ushrimni to'lash uchun sotganman. Bu shaharda meni yoqtiradigan yagona eshik shu.`]
    ] },
    { label: `— Do Those Who Remember know?|— Помнящие знают?|— Eslaganlar biladimi?`, lines: [
      ['qs_ozoda', `They think I sing lullabies to the Hollow. If they knew, they'd break that house open and make her remember. They make everyone remember. It's all they know how to do.|Думают, я пою колыбельные Пустым. Если б знали — вскрыли бы тот дом и заставили её вспомнить. Они всех заставляют вспомнить. Больше ничего не умеют.|Ular meni Bo'shlarga alla aytib yuradi, deb o'ylashadi. Bilishsa, o'sha uyni buzib kirib, uni eslashga majbur qilishardi. Ular hammani eslashga majbur qiladi. Boshqasini bilishmaydi.`]
    ] },
    { label: `— Why do you keep singing it?|— Зачем ты продолжаешь петь?|— Nega kuylashda davom etyapsan?`, lines: [
      ['qs_ozoda', `Because I took it. If I stop, I'm only the woman who took it.|Потому что я это взяла. Если перестану, я буду просто той, что взяла.|Chunki uni men olganman. To'xtasam, shunchaki olgan ayol bo'lib qolaman.`],
      cl('nargiza', `She starts without a first note. Ustoz Shirin used to say only the best can do that. ...She also said the best are the most dangerous.|Она начинает без первой ноты. Устоз Ширин говорила, так умеют только лучшие. ...И ещё говорила, что лучшие опаснее всех.|U birinchi notasiz boshlaydi. Ustoz Shirin buni faqat eng zo'rlar uddalaydi, derdi. ...Eng zo'rlar eng xavflisi, deb ham aytardi.`)
    ] }
  ], [
    { id: 'show', label: `"Show me the door."|«Покажи мне дверь.»|«Eshikni ko'rsat.»` },
    FAC.chk('song', 5, `Hum the first line of the doubled-tithe verse.|Напеть первую строку стиха удвоенной десятины.|Ikki hissa ushr qo'shig'ining birinchi satrini xirgoyi qilish.`, { id: 'verse' })
  ], o => {
    const L = o.id === 'verse' && o.ok ? [
      ['', `Her needle stops. She finishes the line under her breath, then the next one, as if she couldn't help it.|Её игла замирает. Она допевает строку себе под нос, потом следующую, будто не может удержаться.|Ignasi to'xtaydi. U satrni pichirlab oxiriga yetkazadi, keyin keyingisini ham — go'yo o'zini to'xtatolmayotgandek.`],
      ['qs_ozoda', `You know that verse. Then you know what I was. Come and see what I did with it.|Ты знаешь этот стих. Значит, знаешь, кем я была. Пойдём, посмотришь, что я с ним сделала.|Bu qo'shiqni bilarkansan. Demak, kim bo'lganimni bilasan. Yur, u bilan nima qilganimni ko'rasan.`]
    ] : [
      ['qs_ozoda', `Hiding it from you isn't my right. It's hers. Come.|Скрывать это от тебя — не моё право. Это её. Пойдём.|Buni sendan yashirishga haqqim yo'q. Bu uniki. Yur.`]
    ];
    if (o.id === 'verse' && o.ok) setS('verse');
    setS('ozoda');
    play(L, () => {
      FAC.stepTo('qs1', `Twenty years ago Ozoda took Qumri's grief as tithe and never fed it to the Well. She keeps it in Old Yodgor behind a founders' door that opens only for someone who has forgotten their own name.|Двадцать лет назад Озода взяла горе Кумри в десятину и не отдала Колодцу. Она хранит его в Старом Ёдгоре за дверью основателей, которая открывается лишь тому, кто забыл своё имя.|Yigirma yil oldin Ozoda Qumrining qayg'usini ushr qilib olgan-u, Quduqqa bermagan. Uni Eski Yodgorda faqat o'z ismini unutganga ochiladigan asoschilar eshigi ortida saqlaydi.`, ['old', 'qs1_door']);
      d();
    });
  }));

  /* ---------------------------------------------------------------- 5 · the door of the nameless */
  const qsDoor = d => play([
    ['', `A door of red stone in the founders' wall, carved with the knots of the Seven. No handle, no keyhole. Across the lintel, in the old script: SAY WHO YOU ARE.|Дверь из красного камня в стене основателей, покрытая узлами Семерых. Ни ручки, ни скважины. Над притолокой старым письмом: СКАЖИ, КТО ТЫ.|Asoschilar devoridagi qizil tosh eshik, Yettilikning tugunlari o'yilgan. Tutqich ham, qulf teshigi ham yo'q. Kesakiga eski yozuvda: KIMLIGINGNI AYT.`],
    () => (sado() ? ['sado', `It wants a name, and it only opens for people who can't give one. That's a mean door.|Она хочет имя, а открывается только тем, кто не может его назвать. Вредная дверь.|U ism so'raydi, ochilsa esa faqat ism ayta olmaydiganlarga ochiladi. Yomon eshik ekan.`] : null)
  ], () => qsDoorAsk(d, {}));
  const qsDoorAsk = (d, tried) => ask(`The stone is cool, and it is listening.|Камень прохладный, и он слушает.|Tosh salqin, u tinglayapti.`, [
    { id: 'ozoda', label: `Let Ozoda open it.|Пусть откроет Озода.|Ozoda ochsin.` },
    SIDE.party('alp') ? { id: 'alp', label: `"Alp. Put your hand on it."|«Алп. Положи на неё руку.»|«Alp. Qo'lingni qo'y.»` } : null,
    tried.self ? null : FAC.chk('mem', 6, `Let go of your own name for the length of one breath. Not all of it may come back.|На один вдох отпустить собственное имя. Вернуться может не всё.|Bir nafas davomida o'z ismingni qo'yib yuborish. Hammasi qaytmasligi mumkin.`, { id: 'self' }, `Let go|Отпустить|Qo'yib yuborish`)
  ], o => {
    if (o.id === 'self' && !o.ok) { play([['', `Your name holds on to you like a debt to a debtor. The door stays shut.|Имя держится за тебя, как долг за должника. Дверь не открывается.|Isming senga qarz qarzdorga yopishgandek yopishib turibdi. Eshik ochilmaydi.`]], () => qsDoorAsk(d, { self: 1 })); return; }
    const open = {
      ozoda: [['', `Ozoda lays her palm flat on the stone. Nobody says anything. The door swings inward as if it had been waiting for her all day.|Озода кладёт ладонь на камень. Никто ничего не говорит. Дверь открывается внутрь, будто весь день её ждала.|Ozoda kaftini toshga qo'yadi. Hech kim hech narsa demaydi. Eshik xuddi kun bo'yi uni kutgandek ichkariga ochiladi.`]],
      alp: [['alp', `Alp does not know his name. ...The door knows. It is warm.|Алп не знает своего имени. ...Дверь это знает. Она тёплая.|Alp ismini bilmaydi. ...Eshik buni biladi. U iliq.`]],
      self: [['', `For one breath you are nobody: a coat, a pair of hands. The door opens. Your name comes back, slower than it left.|На один вдох ты никто: кафтан, пара рук. Дверь открывается. Имя возвращается — медленнее, чем ушло.|Bir nafas sen hech kimsan: to'n, bir juft qo'l. Eshik ochiladi. Isming qaytadi — ketganidan sekinroq.`]]
    }[o.id];
    if (o.id === 'self') addVoid(2, `your own name, for a breath|своё имя, на один вдох|o'z isming, bir nafasga`);
    if (o.id === 'alp') FAC.react({ alp: 5 }, 'qs1door');
    setS('opener', o.id);
    play(open.concat([
      ['', `A narrow room of shelves. Dozens of tumars, each tagged in a Singer's hand: a Tail name and "doubled tithe, the year of the Awakening". On the lowest shelf, one with no tag at all. Ozoda doesn't look at it.|Узкая комната с полками. Десятки тумаров, на каждом бирка певческой рукой: имя из Хвоста и «удвоенная десятина, год Пробуждения». На нижней полке — один без бирки. Озода на него не смотрит.|Javonli tor xona. O'nlab tumar, har birida xonanda qo'li bilan yorliq: dumlik ism va «ikki hissa ushr, Uyg'onish yili». Eng pastki javonda — yorliqsiz bitta tumar. Ozoda unga qaramaydi.`],
      ['', `Qumri's is the largest. The wax has gone dark, like honey left too long in the jar.|Тумар Кумри самый большой. Воск потемнел, как мёд, слишком долго простоявший в банке.|Qumrining tumari eng kattasi. Mumi qorayib ketgan — bankada uzoq turib qolgan asaldek.`],
      cl('surayyo', `Twenty years she's hidden these from the Well. For one shelf of this the Singers would sing her empty.|Двадцать лет она прятала это от Колодца. За одну такую полку Певцы выпели бы её досуха.|Yigirma yil bularni Quduqdan yashirib kelgan. Bitta shunaqa javon uchun xonandalar uni kuylab bo'shatib yuborishardi.`),
      ['qs_ozoda', `Take it to her house. Whatever you do with it, do it there, in front of the bowls. I'll come. I always come.|Отнеси в её дом. Что бы ты с ним ни сделал, делай там, перед пиалами. Я приду. Я всегда прихожу.|Uni uning uyiga olib bor. Nima qilsang ham, o'sha yerda, kosalar oldida qil. Men kelaman. Doim kelaman.`]
    ]), () => {
      setS('door');
      FAC.stepTo('qs1', `You carry Qumri's grief, kept twenty years behind the founders' door. Ozoda says: whatever you do with it, do it in Qumri's house.|Ты несёшь горе Кумри, двадцать лет пролежавшее за дверью основателей. Озода сказала: что бы ты с ним ни сделал, делай в доме Кумри.|Asoschilar eshigi ortida yigirma yil yotgan Qumrining qayg'usini olib ketyapsan. Ozoda aytdi: u bilan nima qilsang ham, Qumrining uyida qil.`, ['streets', 'qs1_house']);
      d();
    });
  });
  FAC.prop('old', 'qs1_door', { id: 'qs1door', art: 'f6glint', dx: 0, prompt: `A founders' door without a handle|Дверь основателей без ручки|Tutqichsiz asoschilar eshigi`, when: () => act('qs1') && S('ozoda') && !S('door'), use: d => qsDoor(d) });

  /* ---------------------------------------------------------------- 6 · in front of the bowls */
  const qsEnd = d => play([
    ['', `Elyor is here, still floury, his back to the wall so he can see both doors. Ozoda sits on the step and doesn't come in. Qumri ladles shavla into four bowls.|Эльёр здесь, всё ещё в муке, стоит спиной к стене, чтобы видеть обе двери. Озода сидит на ступеньке и не входит. Кумри раскладывает шавлу по четырём пиалам.|Elyor shu yerda, hali ham unga belangan, ikkala eshikni ko'rish uchun devorga suyanib turibdi. Ozoda zinada o'tiribdi, ichkariga kirmaydi. Qumri shavlani to'rtta kosaga suzyapti.`],
    ['qs_qumri', `The neighbours' boy, a yodchi and a Singer, all on the eve of the Festival. Mohinur will have so much to tell.|Соседский парень, ёдчи и Певица — и всё накануне праздника. Мохинур будет что порассказать.|Qo'shnining o'g'li, yodchi va xonanda — hammasi bayram arafasida. Mohinurning aytib beradigan gapi ko'p bo'ladi.`],
    ['qs_elyor', `Whatever you're going to do, yodchi, do it while she's smiling. I want to remember I saw her smile today.|Что бы ты ни собрался делать, ёдчи, делай, пока она улыбается. Хочу запомнить, что сегодня видел её улыбку.|Nima qilmoqchi bo'lsang ham, yodchi, u jilmayib turganda qil. Bugun uning jilmayganini ko'rganimni eslab qolmoqchiman.`],
    cl('alp', `She sets a bowl for a man whose face she doesn't have. Alp eats at tables like that every day. ...Give it back to her.|Она ставит пиалу человеку, чьего лица у неё нет. Алп каждый день ест за такими столами. ...Верни ей это.|U yuzi yodida yo'q odamga kosa qo'yyapti. Alp har kuni shunaqa dasturxonda ovqatlanadi. ...Buni unga qaytar.`),
    cl('nargiza', `Leave it, and Ozoda sings her smaller every moon. Give it back, and you pour twenty years into her in one night. I can't tell you which is crueller.|Оставишь — Озода будет каждый месяц выпевать её всё меньше. Вернёшь — вольёшь в неё двадцать лет за одну ночь. Не знаю, что из этого жёстче.|Qoldirsang — Ozoda har oy uni kuylab tobora kichraytiradi. Qaytarsang — bir kechada unga yigirma yilni quyasan. Qaysi biri shafqatsizroq, bilmayman.`),
    cl('surayyo', `Elyor is the one who's paid for twenty years. Whatever happens, he should be the one holding it.|Двадцать лет платил Эльёр. Что бы ни было, держать это должен он.|Yigirma yil Elyor to'lagan. Nima bo'lsa ham, buni u ushlab turishi kerak.`),
    () => (sado() ? ['sado', `She keeps looking at the door. For her daughter.|Она всё смотрит на дверь. Ждёт дочь.|U eshikka qarab-qarab qo'yadi. Qizini kutyapti.`] : null)
  ], () => ask(`The tumar is warm in your hand. The fourth bowl is getting cold.|Тумар тёплый у тебя в руке. Четвёртая пиала остывает.|Tumar qo'lingda iliq. To'rtinchi kosa sovib qolyapti.`, [
    FAC.craft('plant', `the night back into Qumri|ту ночь обратно в Кумри|o'sha tunni Qumriga qaytarib`, { id: 'truth' }),
    { id: 'eve', label: `Give the tumar back to Ozoda. "The Festival's tomorrow, xola."|Вернуть тумар Озоде. «Праздник завтра, хола.»|Tumarni Ozodaga qaytarish. «Bayram ertaga, xola.»` },
    FAC.craft('burn', `the night, so nobody can ever sing it into her|ту ночь, чтобы её никто и никогда в неё не впел|o'sha tunni, toki uni hech kim hech qachon unga kuylab joylay olmasin`, { id: 'burn' }),
    { id: 'elyor', label: `Put the tumar in Elyor's hand. "It's her night. And yours."|Вложить тумар Эльёру в руку. «Это её ночь. И твоя.»|Tumarni Elyorning qo'liga tutqazish. «Bu uning tuni. Seniki ham.»` }
  ], o => {
    const fin = (lines, text) => play(lines, () => { FAC.finish('qs1', o.id, text); d(); });
    if (o.id === 'truth') {
      FAC.plant(`a night given back|возвращённая ночь|qaytarilgan tun`); rep('remember', 1); FAC.react({ alp: 10, nargiza: 5, surayyo: -5 }, 'qs1');
      fin([
        ['', `You sing it in low, the way Ozoda must have sung it out. Qumri puts down the ladle in the middle of a word.|Ты впеваешь её тихо — так, как, наверное, Озода её выпевала. Кумри кладёт половник на полуслове.|Uni past ovozda kuylab joylaysan — Ozoda uni qanday kuylab olgan bo'lsa, shunday. Qumri gapining o'rtasida cho'michni qo'yadi.`],
        ['', `She looks at the three dusty bowls. Then at the wall. Then, for a long time, at the floury man by the door.|Она смотрит на три пыльные пиалы. Потом на стену. Потом — долго — на мужчину в муке у двери.|U uchta changli kosaga qaraydi. Keyin devorga. Keyin — uzoq — eshik oldidagi unga belangan erkakka.`],
        ['qs_qumri', `...Elyor. You've got your father's hands. ...Twenty years you let me cook for them.|...Эльёр. У тебя руки отца. ...Двадцать лет ты давал мне готовить для них.|...Elyor. Qo'llaring otangnikiga o'xshaydi. ...Yigirma yil menga ular uchun ovqat pishirishga qo'yib berding.`],
        ['qs_elyor', `Mother...|Мама...|Oyi...`],
        () => (sado() ? ['sado', `She isn't screaming. She's just very quiet. I think that's worse. I think it's better.|Она не кричит. Просто очень тихая. По-моему, это хуже. И, по-моему, лучше.|U qichqirmayapti. Shunchaki juda jim. Menimcha, bu yomonroq. Menimcha, yaxshiroq ham.`] : null)
      ], `You sang Qumri's night back into her. She knows that twenty years have passed, that her husband and daughter lie under the floor, and that the neighbours' boy is her son.|Ты вернул Кумри её ночь. Теперь она знает, что прошло двадцать лет, что муж и дочь лежат под полом, а соседский парень — её сын.|Qumriga o'sha tunni qaytarding. Endi u yigirma yil o'tganini, eri bilan qizi pol ostida yotganini, qo'shnining o'g'li esa o'z o'g'li ekanini biladi.`);
    } else if (o.id === 'eve') {
      FAC.react({ nargiza: -10, surayyo: 5, alp: -5 }, 'qs1');
      fin([
        ['', `Ozoda takes the tumar without a word and tucks it into her grey-white sleeve.|Озода молча берёт тумар и прячет в серо-белый рукав.|Ozoda indamay tumarni oladi va oqish-kulrang yengiga yashiradi.`],
        ['qs_qumri', `Tomorrow! Oh, and you'll come, yodchi? Mohinur painted a boat for each of us. ...One for you too, I'm sure.|Завтра! Ой, а ты придёшь, ёдчи? Мохинур каждому из нас покрасила лодочку. ...И тебе, наверняка, тоже.|Ertaga! Voy, sen ham kelasanmi, yodchi? Mohinur har birimizga qayiqcha bo'yagan. ...Senga ham, albatta.`],
        ['qs_elyor', `Thank you. ...Don't come down for the Festival. There isn't one.|Спасибо. ...На праздник не приходи. Его не будет.|Rahmat. ...Bayramga kelma. U bo'lmaydi.`]
      ], `You gave the night back to Ozoda. Qumri stays on the eve of the Festival; every new moon Ozoda sings it again, and every time it costs Qumri a little more.|Ты вернул ночь Озоде. Кумри остаётся в канун праздника; каждое новолуние Озода поёт его заново, и каждый раз это стоит Кумри ещё немного.|Tunni Ozodaga qaytarding. Qumri bayram arafasida qoladi; har yangi oyda Ozoda uni qayta kuylaydi, har safar bu Qumriga yana ozgina qimmatga tushadi.`);
    } else if (o.id === 'burn') {
      addVoid(3, `a night nobody will have|ночь, которой ни у кого не будет|hech kimda bo'lmaydigan tun`); rep('remember', -1); FAC.react({ alp: -10, nargiza: 5 }, 'qs1');
      fin([
        ['', `The night flares in your palm: the floor breathing in, the slow wave of stone, a boy holding a hand. Then it's gone, from the wax and from the world.|Ночь вспыхивает у тебя на ладони: вздохнувший пол, медленная каменная волна, мальчик, держащий руку. Потом её нет — ни в воске, ни на свете.|Tun kaftingda lov etib yonadi: nafas olgan pol, sekin tosh to'lqin, qo'l ushlab turgan bola. Keyin u yo'q — na mumda, na dunyoda.`],
        ['qs_ozoda', `Then there's nothing left for the wall to fill. The eve will wear off by itself in a moon or two. She'll wake into today without knowing why.|Значит, стене больше нечего заполнять. Канун сам сотрётся за месяц-другой. Она проснётся в сегодня — и не будет знать почему.|Demak, devorga to'ldiradigan narsa qolmadi. Arafa bir-ikki oyda o'zi o'chib ketadi. U bugunga uyg'onadi — sababini bilmasdan.`],
        ['qs_elyor', `She'll wake up and not know why her daughter isn't here. ...And I'll be there to tell her who I am. Every morning, if I have to.|Она проснётся и не будет знать, почему дочери нет. ...А я буду рядом и скажу ей, кто я. Каждое утро, если надо.|U uyg'onadi-yu, qizi nega yo'qligini bilmaydi. ...Men esa yonida bo'laman va kimligimni aytaman. Kerak bo'lsa, har tong.`]
      ], `You burned Qumri's night. Nobody will sing her grief into her now, and nobody will need to sing the eve; she will wake into the present without knowing what she lost.|Ты сжёг ночь Кумри. Её горе теперь никто в неё не впоёт, и канун петь тоже не придётся; она проснётся в настоящем, не зная, что потеряла.|Qumrining tunini yoqding. Endi uning qayg'usini hech kim unga kuylab joylamaydi, arafani ham kuylash shart emas; u nima yo'qotganini bilmay, bugunga uyg'onadi.`);
    } else {
      rep('tail', 1); FAC.react({ surayyo: 10, alp: 5 }, 'qs1');
      fin([
        ['', `Elyor closes his fist on the tumar the way you'd hold a bird: too hard, then too loose.|Эльёр сжимает тумар в кулаке, как держат птицу: сперва слишком крепко, потом слишком слабо.|Elyor tumarni qushni ushlagandek mushtiga oladi: avval juda qattiq, keyin juda bo'sh.`],
        ['qs_elyor', `When she's ready. ...When I'm ready. One of us will be.|Когда она будет готова. ...Когда я буду готов. Кто-нибудь из нас будет.|U tayyor bo'lganda. ...Men tayyor bo'lganda. Birimiz tayyor bo'lamiz-ku.`],
        ['qs_ozoda', `Then I'll sing at the new moon, until you tell me not to.|Тогда в новолуние я опять спою — пока ты не скажешь «не надо».|Unda yangi oyda yana kuylayman — sen «kerak emas» demaguningcha.`]
      ], `You gave Qumri's night to her son. Elyor carries it in his fist; until he decides, Ozoda goes on singing the eve.|Ты отдал ночь Кумри её сыну. Эльёр носит её в кулаке; пока он не решит, Озода продолжает петь канун.|Qumrining tunini o'g'liga berding. Elyor uni mushtida olib yuribdi; u qaror qilmaguncha, Ozoda arafani kuylashda davom etadi.`);
    }
  }));

  /* ---------------------------------------------------------------- who says what, and later */
  FAC.talk.qs_qumri = d => {
    const s = q('qs1').st;
    if (s === 'none') { qsOffer(d); return; }
    if (act('qs1')) {
      if (!S('qumri')) { qsLook(d, {}); return; }
      if (S('door')) { qsEnd(d); return; }
      play([['qs_qumri', S('tea') ? `More tea, yodchi? Mohinur's still not home. The boats must be beautiful this year.|Ещё чаю, ёдчи? Мохинур всё нет. Наверное, лодочки в этом году красивые.|Yana choy quyaymi, yodchi? Mohinur hali ham yo'q. Bu yil qayiqchalar chiroyli bo'lsa kerak.` : `Back already? Mohinur's still not home. The boats must be beautiful this year.|Уже вернулся? Мохинур всё нет. Наверное, лодочки в этом году красивые.|Qaytdingmi? Mohinur hali ham yo'q. Bu yil qayiqchalar chiroyli bo'lsa kerak.`]], d);
      return;
    }
    const b = br('qs1'), n = since('qs1');
    if (b === 'truth') {
      play(n >= 1 ? [
        ['', `Qumri sits by the canal in a plain dark scarf.|Кумри сидит у арыка в простом тёмном платке.|Qumri ariq bo'yida oddiy qora ro'molda o'tiribdi.`],
        ['qs_qumri', `The Tail has new roofs. I keep looking for my street. Elyor says it's under my feet. He's very patient. Nosir was too.|В Хвосте новые крыши. Я всё ищу свою улицу. Эльёр говорит, она у меня под ногами. Он очень терпеливый. Носир тоже был.|Dumda tomlar yangi. Ko'chamni qidiraveraman. Elyor u oyog'ing ostida, deydi. Juda sabrli. Nosir ham shunaqa edi.`]
      ] : [
        ['', `Qumri has put three bowls away. She sits with her hands in her lap.|Кумри убрала три пиалы. Сидит, сложив руки на коленях.|Qumri uchta kosani olib qo'yibdi. Qo'llarini tizzasiga qo'yib o'tiribdi.`],
        ['qs_qumri', `Go, yodchi. I don't have a thank-you for you yet. Maybe later.|Иди, ёдчи. Спасибо для тебя у меня пока нет. Может, потом.|Bor, yodchi. Senga aytadigan rahmatim hozircha yo'q. Balki keyin.`]
      ], d);
      return;
    }
    if (b === 'burn') {
      play(n >= 1 ? [
        ['', `Qumri stands in the doorway with a broom, frowning at the stone wall as if it had just arrived.|Кумри стоит в дверях с веником и хмуро смотрит на каменную стену, будто та только что появилась.|Qumri qo'lida supurgi bilan ostonada turib, tosh devorga xuddi hozirgina paydo bo'lgandek qovoq solib qaraydi.`],
        ['qs_qumri', `I woke up and the house was old. That big fellow says he's my son. I believe him. He has Nosir's hands.|Проснулась — а дом старый. Этот здоровяк говорит, что он мой сын. Я верю. У него руки Носира.|Uyg'onsam, uy eskirib qolibdi. Anavi barzangi o'g'lingman, deydi. Ishonaman. Qo'llari Nosirnikiga o'xshaydi.`],
        ['', `She doesn't ask who Nosir is.|Кто такой Носир, она не спрашивает.|Nosir kimligini so'ramaydi.`]
      ] : [['qs_qumri', `Tomorrow's the Festival. ...Isn't it? It feels like it ought to be.|Завтра праздник. ...Ведь так? Кажется, должен быть.|Ertaga bayram. ...To'g'rimi? Bo'lishi kerakdek tuyuladi.`]], d);
      return;
    }
    // eve, elyor: still on the eve
    if (b === 'elyor' && n >= 1) { play([['qs_qumri', `The neighbours' boy cried today, at my table, into his shavla. I gave him halva. Boys that size still need halva.|Соседский парень сегодня плакал у меня за столом, прямо в шавлу. Я дала ему халвы. Таким здоровым тоже нужна халва.|Qo'shnining o'g'li bugun dasturxonimda, shavlasiga qarab yig'ladi. Unga holva berdim. Shunaqa kattalarga ham holva kerak.`]], d); return; }
    play(n >= 2 ? [
      ['qs_qumri', `A yodchi! You're new. Where's Rustam-aka?|Ёдчи! Новенький? А где Рустам-ака?|Yodchi! Yangimisan? Rustam aka qani?`],
      ['', `She doesn't remember you.|Тебя она не помнит.|U seni eslamaydi.`],
      ['qs_qumri', `And the neighbours' boy, if you see him, tell him not to bring bread. I don't know him. Who is he?|И соседскому парню, если увидишь, скажи — пусть хлеб не носит. Я его не знаю. Кто он?|Qo'shnining o'g'liga ham ayt — non olib kelmasin. Men uni tanimayman. Kim o'zi u?`]
    ] : [['qs_qumri', `Back already? Mohinur's still not home. The boats must be beautiful this year.|Уже вернулся? Мохинур всё нет. Наверное, лодочки в этом году красивые.|Qaytdingmi? Mohinur hali ham yo'q. Bu yil qayiqchalar chiroyli bo'lsa kerak.`]], d);
  };
  FAC.talk.qs_elyor = d => {
    if (act('qs1') && S('room') && !S('elyor')) { qsElyor(d); return; }
    if (act('qs1') && S('elyor')) { play([['qs_elyor', S('door') ? `You've got it. I can tell by how you walk. ...Come at night. I'll be there.|Оно у тебя. По походке видно. ...Приходи вечером. Я буду там.|U sendami. Yurishingdan bilinyapti. ...Kechqurun kel. O'sha yerda bo'laman.` : `Ozoda lives past the masked ones, by the far wall. Take bread. She won't eat it, but take it.|Озода живёт за людьми в масках, у дальней стены. Возьми хлеба. Она есть не станет, но возьми.|Ozoda niqoblilarning narigi yog'ida, uzoq devor yonida yashaydi. Non olib bor. U yemaydi, baribir olib bor.`]], d); return; }
    if (!done('qs1')) { play([['', FAC.NPC.qs_elyor.def.idle]], d); return; }
    const b = br('qs1'), n = since('qs1');
    const L = {
      truth: `She called me by name. Then she asked me to go away for a while. So I'm away for a while. ...I leave her bread at the door and go.|Она назвала меня по имени. Потом попросила уйти на время. Вот я и ушёл на время. ...Хлеб оставляю у двери и ухожу.|U meni ismim bilan chaqirdi. Keyin bir muddat ketib tur, dedi. Mana, ketib turibman. ...Nonni eshik oldiga qo'yib ketaman.`,
      eve: `She asked me today whose boy I was. Again. I said the neighbours'. Again. It's getting easier, and I hate that it's getting easier.|Сегодня она опять спросила, чей я. Я опять сказал: соседский. Это всё легче, и я ненавижу, что это всё легче.|Bugun yana kimning o'g'lisan, deb so'radi. Yana qo'shniniki, dedim. Bu tobora osonlashyapti, osonlashayotganidan nafratlanaman.`,
      burn: `Every morning I tell her who I am. Every morning she believes me. That's more than I had.|Каждое утро я говорю ей, кто я. И каждое утро она мне верит. Это больше, чем у меня было.|Har tong unga kimligimni aytaman. Har tong u menga ishonadi. Bu menda bor bo'lganidan ko'p.`,
      elyor: n >= 2 ? `I tasted it. Once. Just to see Father. ...Twice. It's thinner now. I'll give it to her. Next moon.|Я его испил. Один раз. Просто увидеть отца. ...Два раза. Он стал тоньше. Я отдам его ей. В следующее новолуние.|Uni totib ko'rdim. Bir marta. Otamni ko'rish uchun. ...Ikki marta. Yupqalashib qoldi. Unga beraman. Keyingi yangi oyda.` : `It's in my apron pocket, with the flour. I check it a hundred times a day.|Он у меня в кармане фартука, с мукой. Проверяю его по сто раз на дню.|U fartugimning cho'ntagida, un bilan birga. Kuniga yuz marta tekshiraman.`
    };
    play([['qs_elyor', L[b] || `…|…|…`]], d);
  };
  FAC.talk.qs_ozoda = d => {
    if (act('qs1') && S('elyor') && !S('ozoda')) { qsOzoda(d); return; }
    if (act('qs1') && S('ozoda')) { play([['qs_ozoda', S('door') ? `Go to her house. I'll be on the step.|Иди в её дом. Я буду на ступеньке.|Uning uyiga bor. Men zinada bo'laman.` : `The door's by the broken arch. It won't open for you. Call me when you're there.|Дверь у сломанной арки. Тебе она не откроется. Позови меня, когда будешь там.|Eshik singan ravoq yonida. Senga ochilmaydi. U yerga borganingda meni chaqir.`]], d); return; }
    if (!done('qs1')) { play([['', FAC.NPC.qs_ozoda.def.idle]], d); return; }
    const b = br('qs1'), n = since('qs1');
    if (b === 'truth' && n >= 2) {
      play([['', `Ozoda is in Qumri's empty house, laying the table for four. She doesn't look up.|Озода в опустевшем доме Кумри накрывает стол на четверых. Глаз не поднимает.|Ozoda Qumrining huvillab qolgan uyida to'rt kishilik dasturxon yozyapti. Boshini ko'tarmaydi.`], ['qs_ozoda', `Somebody should. The house is used to it.|Кто-то же должен. Дом привык.|Kimdir qilishi kerak-ku. Uy o'rganib qolgan.`]], d);
      return;
    }
    const L = {
      truth: `Then I can stop. ...What do I do on new-moon nights now?|Значит, можно остановиться. ...А что мне теперь делать в новолуние?|Demak, to'xtasam bo'ladi. ...Endi yangi oy kechalari nima qilaman?`,
      eve: `I'll sing her the eve again at the new moon. It takes more each time. One day it will take her, and the eve will still be there, laid for four.|В новолуние я снова спою ей канун. С каждым разом это берёт больше. Однажды возьмёт её всю, а канун останется — стол на четверых.|Yangi oyda unga yana arafani kuylayman. Har safar bu ko'proq oladi. Bir kun uni butunlay oladi, arafa esa qoladi — to'rt kishilik dasturxon.`,
      burn: `No more singing. Elyor says her hole will close by itself. Holes don't close. People just stop looking at them.|Петь больше не нужно. Эльёр говорит, её дыра затянется сама. Дыры не затягиваются. На них просто перестают смотреть.|Endi kuylash shart emas. Elyor teshik o'zi bitib ketadi, deydi. Teshiklar bitmaydi. Ularga shunchaki qarashmay qo'yishadi.`,
      elyor: `Elyor came and asked me how to sing it in. I didn't teach him. I'm not sure that was kind.|Эльёр приходил и спрашивал, как это впеть. Я не стала учить. Не уверена, что это было по-доброму.|Elyor kelib, uni qanday kuylab joylashni so'radi. O'rgatmadim. Bu mehribonlik bo'ldimi-yo'qmi, bilmayman.`
    };
    play([['qs_ozoda', L[b] || `…|…|…`]], d);
  };

  // the Swallowed Streets a day or more later
  COMP.beat('qs1_back', () => done('qs1') && COMP.region() === 'streets' && !COMP.inside() && since('qs1') >= 1, dn => {
    const T = {
      truth: `The lamp in the swallowed house is out for the first time in twenty years. Someone has taken down the scratches on the door post with a knife, one row at a time.|Лампа в проглоченном доме впервые за двадцать лет погашена. Кто-то ножом стёсывает царапины с косяка — ряд за рядом.|Yutilgan uydagi chiroq yigirma yilda birinchi marta o'chiq. Kimdir eshik kesakisidagi chiziqlarni pichoq bilan qator-qator qirib tashlayapti.`,
      eve: `The lamp burns in the swallowed house. Through the window you can see four bowls, and a woman straightening the fourth.|В проглоченном доме горит лампа. В окне видны четыре пиалы и женщина, поправляющая четвёртую.|Yutilgan uyda chiroq yonyapti. Derazadan to'rtta kosa va to'rtinchisini to'g'rilayotgan ayol ko'rinadi.`,
      burn: `In the swallowed house the table is laid for two now. Nobody can tell you who decided that.|В проглоченном доме стол теперь накрыт на двоих. Никто не может сказать, кто так решил.|Yutilgan uyda dasturxon endi ikki kishiga yozilgan. Buni kim hal qilganini hech kim ayta olmaydi.`,
      elyor: `The lamp burns in the swallowed house. On the step outside, a floury man sits with his fist closed, as he does every night now.|В проглоченном доме горит лампа. На ступеньке снаружи сидит мужчина в муке со сжатым кулаком — теперь он сидит так каждую ночь.|Yutilgan uyda chiroq yonyapti. Tashqaridagi zinada mushtini qisgan, unga belangan erkak o'tiribdi — endi u har kecha shunday o'tiradi.`
    };
    play([['', T[br('qs1')] || T.eve]], dn);
  });

  SIDE.epi('qs1', () => (!done('qs1') ? null : {
    truth: `Qumri lived out her years in the Tail in a plain dark scarf. Each year on the eve of the Water Festival, which nobody held any more, she cooked shavla for four and carried three bowls down to the Swallowed Streets.|Кумри дожила свой век в Хвосте, в простом тёмном платке. Каждый год в канун Праздника воды, которого больше никто не устраивал, она варила шавлу на четверых и уносила три пиалы в Проглоченные улицы.|Qumri umrini Dumda, oddiy qora ro'molda o'tkazdi. Har yili endi hech kim o'tkazmaydigan Suv bayrami arafasida to'rt kishilik shavla pishirib, uchta kosani Yutilgan ko'chalarga olib tushardi.`,
    eve: `The lamp in the swallowed house burned for years more. Qumri waited for the Festival until she forgot what she was waiting for. Ozoda sang the eve to the end, then sat by the door and kept the lamp lit.|Лампа в проглоченном доме горела ещё много лет. Кумри ждала праздника, пока не забыла, чего ждёт. Озода пела канун до конца, а потом сидела у двери и следила, чтобы лампа не гасла.|Yutilgan uydagi chiroq yana ko'p yil yondi. Qumri bayramni nimani kutayotganini unutguncha kutdi. Ozoda arafani oxirigacha kuyladi, keyin eshik oldida o'tirib, chiroqni o'chirmay turdi.`,
    burn: `Qumri came up into the Tail without knowing what she had lost. She called Elyor "son" because he told her to, and in time because she meant it. She never cooked shavla again, and couldn't say why.|Кумри поднялась в Хвост, не зная, что потеряла. Звала Эльёра сыном — сперва потому что он так сказал, потом потому что так и было. Шавлу больше не варила и не могла сказать почему.|Qumri nima yo'qotganini bilmay Dumga chiqdi. Elyorni o'g'lim derdi — avval u shunday degani uchun, keyin chindan shunday bo'lgani uchun. Boshqa shavla pishirmadi, nimagaligini o'zi ham bilmadi.`,
    elyor: `Elyor carried his mother's night in his apron pocket for the rest of his life and tasted it now and then, to see his father. By the time he was ready to give it back, there was almost nothing left to give.|Эльёр до конца жизни носил ночь матери в кармане фартука и изредка пил её — увидеть отца. Когда он решился её отдать, отдавать было уже почти нечего.|Elyor onasining tunini umrining oxirigacha fartugi cho'ntagida olib yurdi, ba'zan otasini ko'rish uchun totib turdi. Qaytarishga jur'at qilganida, berishga deyarli hech narsa qolmagan edi.`
  }[br('qs1')] || null), 'tail:dig');
}
