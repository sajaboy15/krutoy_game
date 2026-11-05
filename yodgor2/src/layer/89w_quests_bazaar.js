/* 89w_quests_bazaar.js — two investigations of the Memory Bazaar (GDD ch. 20 rules: a riddle and a turn, several ways
   through, no clean ending, people come back).
     qb1 A Voice by the Minute  (Bazaar → great drain → Karez; after: Rabat / Tail / Mansur's desk)
         The cloth-seller Ismat sells his "drowned" wife Mahbuba's voice at three tilla a minute. Her mother Kamola-xola
         thinks he killed her. The wax says Mahbuba sold her voice herself and left him the first year of it as a present;
         the drain says she went down alive. She is in the upper Karez, voiceless, eight tilla short of the smugglers' way out.
         Endings: 'way' (pay her way; the voice stays on sale) / 'voice' (get the tumar from Ismat and sing it back into her;
         Ismat ruined, lands in Mansur's book) / 'mother' (tell Kamola; Mahbuba is brought home against her will; the voice
         goes to the Ark) / 'ismat' (sell Ismat the way to her; he pays her way out and keeps selling the voice).
     qb2 The Clerks Forget      (Bazaar → Cloister; after: salt mines / Cloister stair)
         Mansur-bay, a Divan tax-farmer, bought the Tail's old debt books for a tenth. A debt stands only while the clerk who
         wrote it can swear to it; someone is singing his clerks empty, and old Hamdam fell from the Singers' stair. It is
         his last clerk, Dilafruz, a Cloister novice sent away at fourteen: page forty-one is her mother.
         Endings: 'take' (sing the book out of her yourself; burn it or keep the tumar — Mansur will offer to buy it) /
         'hand' (give her to Mansur: salt mines, the Tail pays in full) / 'deal' (she swears; Mansur collects three in ten,
         she copies for him five years unpaid; Hamdam stays nobody's).
     qb1 → qb2: if Ismat lost his booth ('voice'), he is on page fifty-three of Mansur's book; 'take' wipes his page too.
   Flags: SIDE.flag('qb1_*'), SIDE.flag('qb2_*'). Test: node test/s9_qbazaar.js */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, br = FAC.br, sf = SIDE.flag;
  const sado = () => (typeof sadoAwake === 'function' && sadoAwake());
  const B1 = k => sf('qb1_' + k), S1 = (k, v) => sf('qb1_' + k, v === undefined ? 1 : v);
  const B2 = k => sf('qb2_' + k), S2 = (k, v) => sf('qb2_' + k, v === undefined ? 1 : v);
  const BYE = { id: 'later', label: `"Another time."|«В другой раз.»|«Boshqa safar.»` };

  CAST.qb_ismat = { name: `Ismat the cloth-seller|Исмат, торговец бязью|Bo'zfurush Ismat`, portrait: null };
  CAST.qb_kamola = { name: `Kamola-xola|Камола-хола|Kamola xola`, portrait: null };
  CAST.qb_mahbuba = { name: `Mahbuba|Махбуба|Mahbuba`, portrait: null };
  CAST.qb_voice = { name: `The voice in the wax|Голос из воска|Mumdagi ovoz`, portrait: null };
  CAST.qb_ilhom = { name: `Ilhom, a boy|Ильхом, мальчишка|Ilhom, bola`, portrait: null };
  CAST.qb_mansur = { name: `Mansur-bay, tax-farmer to the Divan|Мансур-бай, откупщик Дивана|Devonning soliq ijarachisi Mansurboy`, portrait: null };
  CAST.qb_dilafruz = { name: `Dilafruz, a clerk|Дилафруз, писарша|Kotiba Dilafruz`, portrait: null };
  CAST.qb_qodir = { name: `Qodir-mirza|Кадыр-мирза|Qodir mirza`, portrait: null };
  const LK = {
    ismat: { body: 'man', robe: '#6a5a3a', trim: '#c8b890', skin: '#b88a64', head: 'turban', headC: '#e8dcc0', beard: 'short', sash: '#4a3a2a' },
    kamola: { body: 'woman', robe: '#2a3a6a', trim: '#5a7ab0', skin: '#b08060', head: 'scarf', headC: '#1e2a5a', headC2: '#4a6aa0', bent: 1, pat: 'plain', outer: '#22284a' },
    mahbuba: { body: 'woman', robe: '#4a4440', trim: '#6a625a', skin: '#b48a66', head: 'scarf', headC: '#1e2a4a', pat: 'plain' },
    mansur: { body: 'man', robe: '#3a2a4a', trim: '#e2b452', skin: '#c89a78', head: 'turban', headC: '#f0e8d8', beard: 'long', scale: 1.05, pat: 'stripes' },
    dilafruz: { body: 'woman', robe: '#e8d8a8', trim: '#7a5a2a', skin: '#c8a080', head: 'scarf', headC: '#5a3a2a', pat: 'plain' },
    qodir: { body: 'man', robe: '#d8c8a0', trim: '#8a7a5a', skin: '#c8a080', head: 'doppi', headC: '#1c1a1e', headC2: '#e8e0cc' }
  };

  /* ================================================================ places */
  FAC.spot('bazaar', 'qb1booth', 0.22);
  FAC.spot('bazaar', 'qb1dye', 0.29);
  FAC.spot('bazaar', 'qb1drain', 0.1);
  FAC.spot('karez', 'qb1wash', 0.66);
  FAC.spot('rabat', 'qb1gate', 0.3);
  FAC.spot('tail', 'qb1vats', 0.5);
  FAC.spot('bazaar', 'qb2desk', 0.82);
  FAC.spot('bazaar', 'qb2qodir', 0.9);
  FAC.spot('cloister', 'qb2reg', 0.62);
  FAC.spot('cloister', 'qb2stair', 0.2);
  FAC.spot('mines', 'qb2mine', 0.7);

  /* ================================================================ qb1 · A VOICE BY THE MINUTE */
  SIDE.quest('qb1', { n: 22, title: `A Voice by the Minute|Голос поминутно|Daqiqalab ovoz`, where: ['bazaar', 'qb1dye'], offer: () => SIDE.moon() <= 2 });

  FAC.npc('qb_ismat', { name: CAST.qb_ismat.name, look: LK.ismat, dx: 0, prompt: `Talk to the cloth-seller|Поговорить с торговцем бязью|Bo'zfurush bilan gaplashish`, idle: `"Mahbuba speaks! A minute, three tilla!" Ismat calls it like a man selling melons.|«Говорит Махбуба! Минута — три тилла!» Исмат зазывает, как будто дыни продаёт.|«Mahbuba gapiradi! Bir daqiqasi — uch tilla!» Ismat qovun sotayotgandek chaqiradi.` },
    () => (br('qb1') === 'voice' ? [{ from: 8, to: 19, region: 'bazaar', spot: 'qb2desk' }] : [{ from: 8, to: 22, region: 'bazaar', spot: 'qb1booth' }]));
  FAC.npc('qb_kamola', { name: CAST.qb_kamola.name, look: LK.kamola, dx: 0, prompt: `Talk to the woman with blue hands|Поговорить с женщиной с синими руками|Qo'llari ko'k ayol bilan gaplashish`, idle: `A woman with arms dyed blue to the elbow stares at the curtained booth as if it owed her money.|Женщина с руками, синими по локоть, смотрит на занавешенную будку так, будто та ей должна.|Tirsagigacha ko'k bo'yoqqa botgan ayol pardali do'konga qarzdoriga qaragandek tikilib turibdi.` },
    () => (br('qb1') === 'mother' ? [{ from: 7, to: 19, region: 'tail', spot: 'qb1vats' }] : [{ from: 7, to: 19, region: 'bazaar', spot: 'qb1dye' }]));
  FAC.npc('qb_mahbuba', { name: CAST.qb_mahbuba.name, look: LK.mahbuba, dx: 0, prompt: `Talk to the washerwoman|Подойти к прачке|Kir yuvayotgan ayolga yaqinlashish`, idle: `A woman beats lamp rags against a stone. She doesn't look up.|Женщина колотит о камень тряпки от ламп. Головы не поднимает.|Bir ayol chiroq lattalarini toshga urib yuvyapti. Boshini ko'tarmaydi.` },
    () => {
      const b = br('qb1');
      if (!b) return [{ from: 0, to: 24, region: 'karez', spot: 'qb1wash' }];
      if (b === 'voice') return [{ from: 6, to: 20, region: 'rabat', spot: 'qb1gate' }];
      if (b === 'mother') return [{ from: 7, to: 19, region: 'tail', spot: 'qb1vats' }];
      return [];
    });
  FAC.npc('qb_ilhom', { name: CAST.qb_ilhom.name, look: 'child', dx: 26, prompt: `Talk to the boy|Поговорить с мальчишкой|Bola bilan gaplashish`, idle: `A boy of nine counts four coppers over and over, so as not to lose one.|Мальчишка лет девяти пересчитывает четыре медяка, чтобы ни один не потерялся.|To'qqiz yashar bola to'rtta mis tangasini qayta-qayta sanayapti, birontasi yo'qolmasin deb.` },
    () => [{ from: 10, to: 20, region: 'bazaar', spot: 'qb1booth' }]);

  /* ---------------------------------------------------------------- the offer: Kamola-xola */
  const offer1 = d => play([
    ['', `Over a curtained booth hangs a painted board: "MAHBUBA SPEAKS. One minute, three tilla." Across the row, a woman with blue arms watches it.|Над занавешенной будкой — расписная доска: «ГОВОРИТ МАХБУБА. Минута — три тилла». Напротив, через ряд, на неё смотрит женщина с синими руками.|Pardali do'kon ustida bo'yalgan taxta: «MAHBUBA GAPIRADI. Bir daqiqasi — uch tilla». Rastaning narigi tomonida qo'llari ko'k ayol unga tikilib turibdi.`],
    ['qb_kamola', `Yodchi. You pull memories out of people for a living. So you can tell a dead woman's voice from a living one.|Ёдчи. Ты из людей память вынимаешь — значит, голос покойницы от живого отличишь.|Yodchi. Odamlardan xotira sug'urib olish — sening kasbing. Demak, o'likning ovozini tiriknikidan ajrata olasan.`],
    ['qb_kamola', `That's my daughter behind that curtain. Her husband says she drowned in the great drain in spring. No body. No grave. And he sells her by the minute.|За той занавеской — моя дочь. Муж говорит, весной она утонула в большом стоке. Тела нет. Могилы нет. А он продаёт её поминутно.|Anavi parda ortida — qizim. Eri bahorda katta ariqqa cho'kib ketdi, deydi. Jasad yo'q. Qabr yo'q. O'zi esa qizimni daqiqalab sotyapti.`]
  ], () => hub(`Kamola-xola wipes her blue hands on her apron. They stay blue.|Камола-хола вытирает синие руки о передник. Синими они и остаются.|Kamola xola ko'k qo'llarini fartugiga artadi. Qo'llari baribir ko'kligicha qoladi.`, [
    { label: `— What do you think happened?|— А ты что думаешь?|— O'zingiz nima deb o'ylaysiz?`, lines: [
      ['qb_kamola', `I think he did it. He has the face of a man who's buried someone. A drowned body comes out in the Karez in three days. Nobody found her.|Думаю, это он. У него лицо человека, который кого-то закопал. Утопленника через три дня выносит в кяризы. Её никто не нашёл.|Menimcha, bu uning ishi. Yuzida birovni ko'mgan odamning ifodasi bor. Cho'kkanni uch kunda korezga oqizib chiqaradi. Uni hech kim topmadi.`]
    ] },
    { label: `— Who is he?|— Кто он такой?|— U kim o'zi?`, lines: [
      ['qb_kamola', `Ismat. Sells calico, the cheap kind. Talks for two. Twelve years she lived with him, and I never once heard her finish a sentence in his house.|Исмат. Торгует бязью, дешёвой. Говорит за двоих. Двенадцать лет она с ним прожила, и я ни разу не слышала, чтобы она у него дома договорила до конца.|Ismat. Bo'z sotadi, arzonidan. Ikki kishilik gapiradi. O'n ikki yil u bilan yashadi, uning uyida qizimning bir gapini oxirigacha aytganini eshitmadim.`],
      () => (sado() ? ['sado', `"Mahbuba speaks." Three tilla. I've never been paid for talking. I'm in the wrong trade.|«Говорит Махбуба». Три тилла. Мне за разговоры ни разу не платили. Не тем я занимаюсь.|«Mahbuba gapiradi». Uch tilla. Menga gapirganim uchun hech kim pul to'lamagan. Noto'g'ri kasbni tanlabman.`] : null)
    ] },
    { label: `— Why come to me?|— Почему ко мне?|— Nega menga?`, lines: [
      ['qb_kamola', `The Divan's watch laughed at me. The Singers said grief is a debt like any other. You're the only man in this city who's paid to find what's gone missing.|Стража Дивана посмеялась. Певцы сказали: горе — такой же долг, как любой. А ты в этом городе единственный, кому платят за то, чтобы находить пропавшее.|Devon soqchilari kulishdi. Xonandalar g'am ham boshqa qarzlardek bir qarz, deyishdi. Bu shaharda yo'qolganni topgani pul oladigan yolg'iz odam — sensan.`]
    ] }
  ], [
    { id: 'yes', label: `"I'll listen to the voice. Then we'll see."|«Послушаю этот голос. А там посмотрим.»|«Avval ovozni eshitaman. Keyin ko'ramiz.»` },
    { id: 'no', label: `"Grief isn't my trade, xola."|«Горе не по моей части, хола.»|«G'am mening ishim emas, xola.»` }
  ], o => {
    if (o.id !== 'yes') { play([['qb_kamola', `No. It's nobody's. That's the trouble with it.|Нет. Оно ничьё. В том-то и беда.|Yo'q. U hech kimning ishi emas. Gap ham shunda.`]], d); return; }
    FAC.begin('qb1', `Kamola-xola says the cloth-seller Ismat killed her daughter Mahbuba and sells her voice by the minute. He says she drowned in the great drain. Listen to the voice; look at the drain.|Камола-хола уверена: торговец бязью Исмат убил её дочь Махбубу и продаёт её голос поминутно. Он говорит, она утонула в большом стоке. Послушать голос, осмотреть сток.|Kamola xolaning aytishicha, bo'zfurush Ismat qizi Mahbubani o'ldirgan va ovozini daqiqalab sotyapti. Ismat esa u katta ariqqa cho'kdi, deydi. Ovozni eshitish, ariqni ko'rish.`, ['bazaar', 'qb1booth']);
    play([['qb_kamola', `The drain's at the end of the row, under the grate. I've stood over it every week since spring. It doesn't talk to me.|Сток в конце ряда, под решёткой. Я с весны каждую неделю над ним стою. Мне он ничего не говорит.|Ariq rastaning oxirida, panjara ostida. Bahordan beri har hafta tepasida turaman. Menga hech narsa demaydi.`]], d);
  }));

  /* ---------------------------------------------------------------- clues: the voice and the drain */
  const where1 = () => (B1('drain') ? ['karez', 'qb1wash'] : ['bazaar', B1('heard') ? 'qb1drain' : 'qb1booth']);
  const clueStep = () => {
    let text;
    if (B1('heard') && B1('drain')) text = `Mahbuba sold her own voice and left the first year of it to Ismat as a present. Then she went down the great drain alive. The smugglers in the upper Karez take people out for forty tilla.|Махбуба сама продала голос и оставила Исмату в подарок его первый год. Потом спустилась в большой сток живой. Контрабандисты в верхних кяризах выводят людей за сорок тилла.|Mahbuba ovozini o'zi sotib, birinchi yilgisini Ismatga sovg'a qilib qoldirgan. Keyin katta ariqqa tirik tushgan. Yuqori korezdagi kontrabandachilar odamni qirq tillaga olib chiqadi.`;
    else if (B1('drain')) text = `Someone went down the great drain in spring alive, with a lamp and a bundle. The smugglers in the upper Karez take people out of the city for forty tilla; she was eight short.|Весной кто-то спустился в большой сток живым — с лампой и узлом. Контрабандисты в верхних кяризах выводят из города за сорок тилла; ей не хватало восьми.|Bahorda kimdir katta ariqqa tirik tushgan — chiroq va tugun bilan. Yuqori korezdagi kontrabandachilar shahardan qirq tillaga olib chiqadi; unga sakkiz tilla yetmagan.`;
    else text = `The voice in Ismat's booth: Mahbuba sold her voice herself, for thirty-two tilla, and left its first year to her husband as a present. Now the drain.|Голос в будке Исмата: Махбуба сама продала свой голос за тридцать два тилла, а его первый год оставила мужу в подарок. Теперь сток.|Ismatning do'konidagi ovoz: Mahbuba ovozini o'zi o'ttiz ikki tillaga sotgan, birinchi yilgisini esa eriga sovg'a qilib qoldirgan. Endi ariq.`;
    FAC.stepTo('qb1', text, where1());
  };
  const tasteVoice = d => FAC.taste([
    ['memory', `A wax-singer's room off the Copper Row. A woman of forty in a plain scarf. "All of it. The voice I have now, sell to whoever you like."|Каморка певца-восковщика у Медного ряда. Женщина лет сорока в простом платке. «Берите весь. Нынешний голос продайте кому хотите».|Mis rastasi yonidagi mumchi xonandaning hujrasi. Oddiy ro'molli, qirq yoshlardagi ayol. «Hammasini oling. Hozirgi ovozimni kimga xohlasangiz soting».`],
    ['memory', `"The one from our first year, wrap that separately. It's for my husband. He liked that one." The singer counts thirty-two tilla onto the table.|«А тот, что был в первый год, заверните отдельно. Это мужу. Ему тот нравился». Певец отсчитывает на стол тридцать два тилла.|«Birinchi yilimizdagisini esa alohida o'rang. Bu erimga. Unga o'shanisi yoqardi». Xonanda stolga o'ttiz ikki tilla sanab qo'yadi.`],
    ['', `She sold it herself. Women who wrap a present for their husband don't usually drown the same week.|Она продала его сама. Женщины, которые заворачивают мужу подарок, обычно не тонут на той же неделе.|Ovozini o'zi sotgan. Eriga sovg'a o'ratgan ayol odatda o'sha haftaning o'zida cho'kib ketmaydi.`]
  ], () => { S1('heard'); clueStep(); d(); }, { intro: `You lay two fingers on the tumar. Under the voice, older than it, a room rises.|Кладёшь два пальца на тумар. Под голосом, глубже его, проступает комната.|Ikki barmog'ingni tumarga qo'yasan. Ovoz ostidan, undan ham chuqurroqdan, bir xona ko'tariladi.` });

  const listen = d => play([
    ['', `Behind the curtain: a stool, a lamp, and a tumar on a nail at the height of a seated man's ear.|За занавеской — табурет, лампа и тумар на гвозде, на высоте уха сидящего человека.|Parda ortida — kursi, chiroq va o'tirgan odamning qulog'i barobarida mixga osilgan tumar.`],
    ['qb_ismat', `A minute, aka? Three tilla. She asks how you are, tells you to take your shoes off. People cry. It's good for them.|Минутку, ака? Три тилла. Спросит, как ты, велит разуться. Люди плачут. Им полезно.|Bir daqiqami, aka? Uch tilla. Ahvolingni so'raydi, kovushingni yech, deydi. Odamlar yig'laydi. Ularga foydali.`]
  ], () => ask(`Ismat holds the curtain half open.|Исмат держит занавеску наполовину открытой.|Ismat pardani yarim ochib turibdi.`, [
    { id: 'pay', price: 3, label: `Pay for a minute and sit down.|Заплатить за минуту и сесть.|Bir daqiqa uchun to'lab, o'tirish.` },
    FAC.chk('collection', 2, `"Yodchi's business. Show me the seal on that tumar: whose it was, who sang it."|«Дело ёдчи. Покажи печать на тумаре: чей был, кто пел.»|«Yodchining ishi. Tumardagi muhrni ko'rsat: kimniki edi, kim kuylagan.»`, { id: 'press' }, `Pressure|Давление|Bosim`),
    FAC.chk('mem', 5, `Stand by the curtain and taste the wax through the cloth, the way you smell bread through a door.|Встать у занавески и испить воск сквозь ткань — как чуют хлеб через дверь.|Parda yonida turib, mumni mato orqali totib ko'rish — eshik ortidan non hidini sezgandek.`, { id: 'mem' }, `Through the cloth|Сквозь ткань|Mato orqali`),
    BYE
  ], o => {
    if (o.id === 'later') { d(); return; }
    if (o.id === 'pay') {
      play([
        ['', `You sit. Ismat drops the curtain. The wax warms, and a woman's voice fills the booth, close, as if she'd knelt beside you.|Ты садишься. Исмат опускает занавеску. Воск теплеет, и будку наполняет женский голос — близко, будто она присела рядом.|O'tirasan. Ismat pardani tushiradi. Mum iliydi va do'konni ayol ovozi to'ldiradi — yaqindan, go'yo yoningga cho'kkalagandek.`],
        ['qb_voice', `You're back. Did you eat? There's soup on the stove, still warm.|Пришёл. Ты ел? На плите суп, ещё тёплый.|Keldingmi. Ovqatlandingmi? O'choqda sho'rva bor, hali iliq.`],
        ['qb_voice', `Shoes off, I've just washed the floor. ...Now sit. Tell me how your day went. No, all of it. I'm listening.|Разувайся, я только полы помыла. ...Теперь садись. Рассказывай, как день прошёл. Нет, всё рассказывай. Я слушаю.|Kovushingni yech, hozirgina pol yuvdim. ...Endi o'tir. Kuning qanday o'tdi, gapir. Yo'q, hammasini gapir. Eshityapman.`],
        () => (sado() ? ['sado', `She asked if you ate. Did you? Today, I mean.|Она спросила, ел ли ты. А ты ел? Сегодня, я имею в виду.|U ovqatlandingmi, deb so'radi. Sen-chi, yedingmi? Bugun, demoqchiman.`] : null)
      ], () => tasteVoice(d));
      return;
    }
    if (o.id === 'press') {
      if (!o.ok) { play([['qb_ismat', `The seal's in order, yodchi. Pay like everyone else or step aside. There's a queue.|Печать в порядке, ёдчи. Плати, как все, или отойди. Тут очередь.|Muhr joyida, yodchi. Hamma qatori to'la yoki chetga chiq. Navbat bor.`]], d); return; }
      play([['qb_ismat', `...Here. Look all you like. It's a gift, it says so on the wrapping. Her mark.|...На. Смотри сколько хочешь. Это подарок, на обёртке так и написано. Её знак.|...Ma. Xohlagancha qara. Bu sovg'a, o'ramida shunday yozilgan. Uning tamg'asi.`]], () => tasteVoice(d));
      return;
    }
    if (!o.ok) { play([['', `The cloth is thick and the wax is old. You get lamp oil and other people's breath, nothing more.|Ткань плотная, воск старый. Тебе достаётся только запах лампового масла и чужого дыхания.|Mato qalin, mum eski. Faqat chiroq moyi va birovlarning nafasi hidi keladi, boshqa hech narsa.`]], d); return; }
    tasteVoice(d);
  }));

  FAC.prop('bazaar', 'qb1drain', { id: 'qb1drain', art: 'f6glint', prompt: `Look at the drain grating|Осмотреть решётку стока|Ariq panjarasini ko'zdan kechirish`, when: () => act('qb1') && !B1('drain'), use: d => play([
    ['', `An iron grate over the great drain. The rungs below are worn bright. On the third, under the rust, a thread of dark-blue wool.|Железная решётка над большим стоком. Ступени под ней стёрты до блеска. На третьей, под ржавчиной, — нитка тёмно-синей шерсти.|Katta ariq ustidagi temir panjara. Pastdagi zinapoyalar yaltirab ketgan. Uchinchisida, zang ostida, to'q ko'k jun ip.`]
  ], () => ask(`The drain breathes up warm and salty.|Из стока тянет тёплым и солёным.|Ariqdan iliq, sho'r havo ko'tariladi.`, [
    FAC.craft('taste', `the third rung|третью ступень|uchinchi zinapoyani`, { id: 'taste' }),
    BYE
  ], o => {
    if (o.id !== 'taste') { d(); return; }
    FAC.taste([
      ['memory', `A spring night. A woman in a dark-blue scarf lifts the grate, lowers a bundle, then a lamp. She doesn't jump. She climbs down carefully, counting the rungs.|Весенняя ночь. Женщина в тёмно-синем платке поднимает решётку, спускает узел, потом лампу. Не прыгает. Спускается осторожно, считая ступени.|Bahor kechasi. To'q ko'k ro'molli ayol panjarani ko'tarib, avval tugunni, keyin chiroqni tushiradi. Sakramaydi. Zinapoyalarni sanab, ehtiyot bo'lib tushadi.`],
      ['memory', `From below, a bored man's voice: "Forty, opa. That's the way out. You've got thirty-two. Wash for us till you've got the rest."|Снизу скучающий мужской голос: «Сорок, опа. Столько стоит выход. У тебя тридцать два. Постираешь на нас, пока не наберёшь».|Pastdan zerikkan erkak ovozi: «Qirq, opa. Chiqib ketish shuncha turadi. Senda o'ttiz ikki. Qolganini yig'guningcha bizga kir yuvasan».`],
      ['', `She nods. She has no voice to answer with.|Она кивает. Ответить ей нечем.|U bosh irg'aydi. Javob berishga ovozi yo'q.`]
    ], () => { S1('drain'); clueStep(); d(); }, { intro: `You crouch and press your palm to the cold iron.|Присаживаешься и прижимаешь ладонь к холодному железу.|Cho'kkalab, kaftingni sovuq temirga bosasan.` });
  })) });

  /* ---------------------------------------------------------------- Ilhom: the witness who pays in copper */
  FAC.talk.qb_ilhom = d => {
    const b = br('qb1');
    if (b) {
      play([['qb_ilhom', {
        way: `She asked if I ate today. I said yes. I lied. It's all right, she doesn't check.|Она спросила, ел ли я сегодня. Я сказал «да». Соврал. Ничего, она не проверяет.|U bugun ovqatlandingmi, deb so'radi. «Ha», dedim. Yolg'on gapirdim. Hechqisi yo'q, u tekshirmaydi.`,
        ismat: `She asked if I ate today. I said yes. I lied. It's all right, she doesn't check.|Она спросила, ел ли я сегодня. Я сказал «да». Соврал. Ничего, она не проверяет.|U bugun ovqatlandingmi, deb so'radi. «Ha», dedim. Yolg'on gapirdim. Hechqisi yo'q, u tekshirmaydi.`,
        voice: `The booth's shut. ...Did you eat? Somebody has to ask. I'm asking.|Будка закрыта. ...А ты ел? Кто-то же должен спрашивать. Вот я спрашиваю.|Do'kon yopiq. ...Sen ovqatlandingmi? Kimdir so'rashi kerak-ku. Mana, men so'rayapman.`,
        mother: `They took her to the Ark. I asked a guard if she still asks people if they ate. He said nobody eats soup in the Ark.|Её увезли в Арк. Я спросил у стражника, спрашивает ли она там, ел ли кто. Он сказал, в Арке супа не едят.|Uni Arkka olib ketishdi. Soqchidan so'radim, u yerda ham ovqatlandingmi deb so'raydimi. Arkda sho'rva ichishmaydi, dedi.`
      }[b] || `…|…|…`]], d);
      return;
    }
    const lines = [
      ['qb_ilhom', `I've got four coppers. Ismat-aka gives me a minute for four. Grown-ups pay three tilla.|У меня четыре медяка. Исмат-ака даёт мне минуту за четыре. Взрослым — за три тилла.|Menda to'rtta mis tanga bor. Ismat aka menga bir daqiqani to'rttaga beradi. Kattalarga — uch tilla.`],
      ['qb_ilhom', `She asks if I ate. Nobody else asks. My mum used to.|Она спрашивает, ел ли я. Больше никто не спрашивает. Мама раньше спрашивала.|U ovqatlandingmi, deb so'raydi. Boshqa hech kim so'ramaydi. Oyim so'rardi.`]
    ];
    if (act('qb1') && !B1('boy')) lines.push(
      ['hero', `Ilhom. Do other people come to listen? At odd hours?|Ильхом. А ещё кто-нибудь приходит слушать? В неурочное время?|Ilhom. Boshqa birov ham eshitgani keladimi? Bevaqt?`],
      ['qb_ilhom', `There's a lady. At night, after he shuts. She puts her ear to the curtain and cries, but quiet, no sound at all. Then she goes off to the drain.|Тётенька одна. Ночью, когда он закрывается. Прикладывает ухо к занавеске и плачет, только тихо, совсем без звука. Потом уходит к стоку.|Bir xola bor. Kechasi, u yopgandan keyin. Qulog'ini pardaga qo'yib yig'laydi, lekin jim, umuman ovozsiz. Keyin ariq tomonga ketadi.`],
      ['qb_ilhom', `Her scarf's dark blue. Don't tell Ismat-aka. He'd stop giving me minutes for coppers.|Платок у неё тёмно-синий. Исмат-аке не говори. Он перестанет давать мне минуты за медяки.|Ro'moli to'q ko'k. Ismat akaga aytma. Mis tangaga daqiqa bermay qo'yadi.`]
    );
    play(lines, () => { if (act('qb1') && !B1('boy')) { S1('boy'); know(`A woman in a dark-blue scarf comes at night to listen to the voice, then goes to the drain.|Женщина в тёмно-синем платке приходит ночью слушать голос и уходит к стоку.|To'q ko'k ro'molli ayol kechasi ovozni eshitgani keladi va ariq tomonga ketadi.`); } d(); });
  };

  /* ---------------------------------------------------------------- Ismat: the defence, the tumar, the sale of a secret */
  const confront = d => hub(`Ismat folds a bolt of calico that doesn't need folding.|Исмат складывает отрез бязи, который складывать незачем.|Ismat taxlash shart bo'lmagan bo'z to'pini taxlayapti.`, [
    { label: `— She didn't drown.|— Она не утонула.|— U cho'kmagan.`, lines: [
      ['qb_ismat', `...No. She left. And you want me to say that on the Bazaar? Neighbours bring bread to a man whose wife drowned. A man whose wife walked out, the tea boys laugh at.|...Нет. Ушла. И ты хочешь, чтобы я это на Базаре сказал? Тому, у кого жена утонула, соседи несут хлеб. А над тем, от кого ушла, смеются даже мальчишки-чайщики.|...Yo'q. Ketib qoldi. Buni Bozorda aytishimni xohlaysanmi? Xotini cho'kkan odamga qo'shnilar non olib keladi. Xotini tashlab ketganning ustidan choychi bolalar ham kuladi.`]
    ] },
    { label: `— Why sell it?|— Зачем ты его продаёшь?|— Nega uni sotyapsan?`, lines: [
      ['qb_ismat', `Debts, yodchi. I owe the Divan for the calico. And people need it. The boy eats because a voice asks him if he ate. Is that so bad?|Долги, ёдчи. За бязь я должен Дивану. И людям это нужно. Мальчишка ест, потому что голос спрашивает, ел ли он. Разве это плохо?|Qarz, yodchi. Bo'z uchun Devondan qarzdorman. Odamlarga ham kerak. Bola ovqat yeydi, chunki bir ovoz undan yedingmi, deb so'raydi. Shu yomonmi?`],
      ['qb_ismat', `And after I shut, the last minute is mine. Every night. I don't charge myself.|А когда закрываюсь, последняя минута — моя. Каждый вечер. С себя денег не беру.|Yopgandan keyin oxirgi daqiqa — meniki. Har kecha. O'zimdan pul olmayman.`]
    ] },
    { label: `— Did you ever listen to her? Before?|— А раньше ты её слушал?|— Oldin uni eshitarmiding?`, lines: [
      ['qb_ismat', `...She talked about small things. Soup. The neighbour's goat. I had the Divan on my neck and calico rotting in the damp. I said "later".|...Она говорила о мелочах. Суп. Соседская коза. А у меня Диван на шее, бязь в сырости гниёт. Я говорил: «Потом».|...U mayda narsalar haqida gapirardi. Sho'rva. Qo'shnining echkisi. Mening bo'ynimda Devon, bo'z namda chiriyapti. «Keyin», derdim.`],
      ['qb_ismat', `For twelve years I said "later". Now it's later. Three tilla a minute.|Двенадцать лет говорил: «Потом». Вот оно и потом. Три тилла минута.|O'n ikki yil «keyin» dedim. Mana, keyini keldi. Daqiqasi uch tilla.`]
    ] }
  ], [
    B1('found') && !B1('plan') ? { id: 'tell', label: `"She's alive. I know where she is."|«Она жива. Я знаю, где она.»|«U tirik. Qayerdaligini bilaman.»` } : null,
    BYE
  ].filter(Boolean), o => {
    if (o.id !== 'tell') { d(); return; }
    endIsmat(d);
  });

  const getTumar = d => play([
    ['qb_ismat', `You found her. ...And she wants it back. Of course. The only thing of hers I had left that was kind to me.|Нашёл. ...И она хочет его назад. Конечно. Единственное, что осталось у меня от неё доброго.|Topibsan. ...U esa qaytarib olmoqchi. Albatta. Undan menga qolgan yagona mehribon narsa shu edi.`]
  ], () => ask(`The tumar hangs on its nail. Ismat stands between you and it.|Тумар висит на гвозде. Исмат стоит между тобой и им.|Tumar mixda osilib turibdi. Ismat sen bilan uning orasida turibdi.`, [
    { id: 'buy', price: 90, label: `"Ninety tilla. That's a month of your minutes. Take it."|«Девяносто тилла. Это месяц твоих минут. Бери.»|«To'qson tilla. Bu bir oylik daqiqalaring. Ol.»` },
    FAC.chk('collection', 3, `"A living woman's voice, sold without her leave. The Divan calls that theft, Ismat. And I can call the Divan."|«Голос живой женщины, проданный без её согласия. Диван называет это кражей, Исмат. А Диван я позвать могу.»|«Tirik ayolning ovozi, uning roziligisiz sotilgan. Devon buni o'g'irlik deydi, Ismat. Devonni esa men chaqira olaman.»`, { id: 'press' }, `Law|Закон|Qonun`),
    FAC.chk('str', 6, `Reach past him and pull the tumar off its nail.|Протянуть руку мимо него и сорвать тумар с гвоздя.|Uning yonidan qo'l cho'zib, tumarni mixdan yulib olish.`, { id: 'force' }, `Grab|Схватить|Tortib olish`),
    BYE
  ], o => {
    if (o.id === 'later') { d(); return; }
    if (o.id === 'press' && !o.ok) { play([['qb_ismat', `Call them. Her mark is on the wrapping, yodchi. She gave it to me. A gift isn't theft, not even at the Divan.|Зови. Её знак на обёртке, ёдчи. Она сама мне его отдала. Подарок — не кража, даже в Диване.|Chaqiraver. Uning tamg'asi o'ramida, yodchi. O'zi menga bergan. Sovg'a o'g'irlik emas, hatto Devonda ham.`]], d); return; }
    if (o.id === 'force' && !o.ok) {
      FAC.add('divan', -3);
      play([['', `He's heavier than he looks. He wraps both arms round the nail, the curtain tears, and the whole row turns to watch. A Divan guard starts over. You let go.|Он тяжелее, чем кажется. Обхватывает гвоздь обеими руками, занавеска рвётся, весь ряд оборачивается. К вам идёт стражник Дивана. Ты отпускаешь.|U ko'ringanidan og'irroq. Mixni ikki qo'llab quchoqlab oladi, parda yirtiladi, butun rasta o'girilib qaraydi. Devon soqchisi yaqinlashyapti. Qo'yib yuborasan.`]], d);
      return;
    }
    S1('tumar');
    FAC.stepTo('qb1', `You have the first year of Mahbuba's voice. Take it down to her in the upper Karez.|У тебя голос первого года Махбубы. Отнеси его ей в верхние кяризы.|Mahbubaning birinchi yilgi ovozi sende. Uni yuqori korezga, uning oldiga olib bor.`, ['karez', 'qb1wash']);
    play([
      ['qb_ismat', o.id === 'buy' ? `Ninety. Good. That's the Divan off my neck for a month.|Девяносто. Хорошо. Месяц Диван не будет висеть на шее.|To'qson. Yaxshi. Bir oy Devon bo'ynimdan tushadi.` : `...Take it, then. Take it.|...Тогда бери. Бери.|...Unda ol. Olaver.`],
      ['', `He sits down on the stool, facing the empty nail, and doesn't call the next customer.|Он садится на табурет, лицом к пустому гвоздю, и не зовёт следующего.|U kursiga, bo'sh mixga qarab o'tiradi va keyingi xaridorni chaqirmaydi.`]
    ], d);
  }));

  FAC.talk.qb_ismat = d => {
    if (done('qb1')) {
      const L = {
        way: `"Still three tilla. Fewer people cry now; the voice is wearing thin. I'll sell it till there's nothing left."|«По-прежнему три тилла. Плачут теперь меньше: голос истирается. Буду продавать, пока не кончится».|«Hamon uch tilla. Endi kamroq yig'lashadi: ovoz yeyilib boryapti. Tugaguncha sotaveraman».`,
        ismat: `"I'm still selling it. The Divan doesn't care who wrote 'thank you' on what wall."|«Продаю дальше. Дивану всё равно, кто на какой стене написал "спасибо"».|«Sotishda davom etyapman. Kim qaysi devorga "rahmat" deb yozgani Devonga baribir».`,
        mother: `"The auction gave me sixty. A collector from the Ark bought her. He'll play her at dinners." He says it with no expression at all.|«На торгах дали шестьдесят. Купил собиратель из Арка. Будет ставить её на ужинах». Он говорит это без всякого выражения.|«Kimoshdida oltmish berishdi. Arkdagi bir to'plovchi oldi. Ziyofatlarda qo'yib eshittiradi». Buni hech qanday ifodasiz aytadi.`,
        voice: B2('wiped') ? `"My page went blank. Mansur says I owe nothing now. I'll open the booth again. Calico this time. Just calico."|«Моя страница опустела. Мансур говорит, я теперь ничего не должен. Открою будку снова. Бязь. Просто бязь».|«Sahifam bo'shab qoldi. Mansur endi hech narsa qarz emassan, deydi. Do'konni yana ochaman. Bo'z sotaman. Faqat bo'z».` : `Ismat stands in the debtors' queue at Mansur-bay's desk, a bolt of calico under his arm instead of money. He doesn't look at you.|Исмат стоит в очереди должников у стола Мансур-бая, под мышкой у него вместо денег — отрез бязи. На тебя он не смотрит.|Ismat Mansurboyning stoli oldidagi qarzdorlar navbatida turibdi, qo'ltig'ida pul o'rniga bir to'p bo'z. Senga qaramaydi.`
      };
      play([['', L[br('qb1')] || `…|…|…`]], d);
      return;
    }
    if (!act('qb1')) { play([['qb_ismat', `Mahbuba speaks, aka. A minute, three tilla. She'll ask after you better than your own mother.|Говорит Махбуба, ака. Минута — три тилла. Спросит о тебе лучше родной матери.|Mahbuba gapiradi, aka. Bir daqiqasi — uch tilla. Ahvolingni o'z onangdan yaxshiroq so'raydi.`]], d); return; }
    if (B1('plan') === 'voice' && !B1('tumar')) { getTumar(d); return; }
    if (!B1('heard')) { listen(d); return; }
    confront(d);
  };

  /* ---------------------------------------------------------------- Mahbuba in the Karez */
  const meet = d => play([
    ['', `A woman at the cistern beats lamp rags on a stone. Her scarf is dark blue. When you say her name she goes still, but doesn't turn.|Женщина у водоёма колотит о камень тряпки от ламп. Платок тёмно-синий. Когда ты называешь её имя, она замирает, но не оборачивается.|Hovuz bo'yida bir ayol chiroq lattalarini toshga urib yuvyapti. Ro'moli to'q ko'k. Ismini aytganingda qotib qoladi, lekin o'girilmaydi.`],
    ['', `Then she wets a finger and writes on the sooty wall in big, careful letters: WHO SENT YOU.|Потом мочит палец и пишет на закопчённой стене, крупно и старательно: КТО ТЕБЯ ПОСЛАЛ.|Keyin barmog'ini ho'llab, qurum bosgan devorga katta-katta, tirishib yozadi: SENI KIM YUBORDI.`],
    () => (sado() ? ['sado', `She writes like someone who learned late. Every letter is a decision.|Она пишет, как человек, который поздно научился. Каждая буква — решение.|U kech o'rgangan odamdek yozadi. Har bir harf — bir qaror.`] : null)
  ], () => { S1('found'); FAC.stepTo('qb1', `Mahbuba is alive, in the upper Karez, without a voice. She is eight tilla short of the smugglers' way out. Nobody knows: not her mother, not Ismat.|Махбуба жива — в верхних кяризах, без голоса. Ей не хватает восьми тилла на выход через контрабандистов. Никто не знает: ни мать, ни Исмат.|Mahbuba tirik — yuqori korezda, ovozsiz. Kontrabandachilar yo'li uchun sakkiz tilla yetmayapti. Hech kim bilmaydi: na onasi, na Ismat.`, ['karez', 'qb1wash']); mahbubaHub(d); });

  const mahbubaHub = d => hub(`Mahbuba waits, her finger on the wall.|Махбуба ждёт, палец у стены.|Mahbuba barmog'ini devorga tirab kutyapti.`, [
    { label: `— Why did you leave?|— Почему ты ушла?|— Nega ketib qolding?`, lines: [
      ['', `She writes: TWELVE YEARS HE TALKED. I LISTENED.|Она пишет: ДВЕНАДЦАТЬ ЛЕТ ОН ГОВОРИЛ. Я СЛУШАЛА.|U yozadi: O'N IKKI YIL U GAPIRDI. MEN ESHITDIM.`],
      ['', `She rubs it out with her palm and writes again: THE VOICE IN THE WAX IS OUR FIRST YEAR. THE ONLY YEAR HE LISTENED BACK.|Стирает ладонью и пишет снова: В ВОСКЕ НАШ ПЕРВЫЙ ГОД. ЕДИНСТВЕННЫЙ ГОД, КОГДА ОН СЛУШАЛ В ОТВЕТ.|Kafti bilan o'chirib, yana yozadi: MUMDA BIRINCHI YILIMIZ. U MENI HAM ESHITGAN YAGONA YIL.`]
    ] },
    { label: `— He sells it. Three tilla a minute.|— Он его продаёт. Три тилла минута.|— U uni sotyapti. Daqiqasi uch tilla.`, lines: [
      ['', `She laughs with her whole body and no sound at all. Writes: GOOD. LET HIM EARN ON ME ONCE.|Она смеётся всем телом и совсем беззвучно. Пишет: ХОРОШО. ПУСТЬ ХОТЬ РАЗ НА МНЕ ЗАРАБОТАЕТ.|U butun vujudi bilan, umuman ovozsiz kuladi. Yozadi: YAXSHI. HECH BO'LMASA BIR MARTA MENDAN PUL TOPSIN.`]
    ] },
    { label: `— Your mother thinks Ismat killed you.|— Твоя мать думает, что Исмат тебя убил.|— Onang seni Ismat o'ldirgan deb o'ylayapti.`, lines: [
      ['', `She shuts her eyes. Writes: SHE WILL TAKE ME HOME. HOME IS TWO STREETS FROM HIM.|Она закрывает глаза. Пишет: ОНА ЗАБЕРЁТ МЕНЯ ДОМОЙ. ДОМ В ДВУХ УЛИЦАХ ОТ НЕГО.|Ko'zlarini yumadi. Yozadi: U MENI UYGA OLIB KETADI. UY UNDAN IKKI KO'CHA NARIDA.`],
      ['', `Smaller, underneath: SHE WILL SAY: HE NEVER BEAT YOU. HE DIDN'T.|Ниже, мельче: ОНА СКАЖЕТ: ОН ЖЕ ТЕБЯ НЕ БИЛ. НЕ БИЛ.|Pastroqda, maydaroq: U AYTADI: AXIR SENI URMAGAN-KU. URMAGAN.`]
    ] },
    { label: `— Why the drain? Why not the gate?|— Почему сток? Почему не ворота?|— Nega ariqdan? Nega darvozadan emas?`, lines: [
      ['', `WITHOUT A VOICE YOU CAN'T SWEAR AT THE GATE. NO OATH, NO ROAD.|БЕЗ ГОЛОСА НА ВОРОТАХ НЕ ПОКЛЯНЁШЬСЯ. НЕТ КЛЯТВЫ — НЕТ ДОРОГИ.|OVOZSIZ DARVOZADA QASAM ICHOLMAYSAN. QASAM YO'Q — YO'L YO'Q.`],
      ['', `FORTY FOR THE DRAIN. I HAVE THIRTY-TWO. I WASH.|СОРОК ЗА СТОК. У МЕНЯ ТРИДЦАТЬ ДВА. Я СТИРАЮ.|ARIQDAN CHIQISH QIRQ. MENDA O'TTIZ IKKI. KIR YUVAMAN.`]
    ] }
  ], [
    { id: 'way', price: 8, label: `Put eight tilla on the stone beside her.|Положить рядом с ней на камень восемь тилла.|Yoniga, tosh ustiga sakkiz tilla qo'yish.` },
    { id: 'voice', label: `"I'll bring your voice back. Then you leave by the gate, with an oath, like anyone."|«Я верну тебе голос. Тогда уйдёшь через ворота, с клятвой, как все.»|«Ovozingni qaytarib olib kelaman. Keyin hamma qatori qasam ichib, darvozadan chiqib ketasan.»` },
    { id: 'mother', label: `"Your mother has stood across from that booth since spring. I'm telling her."|«Твоя мать с весны стоит напротив той будки. Я ей скажу.»|«Onang bahordan beri o'sha do'kon ro'parasida turibdi. Unga aytaman.»` },
    { id: 'later', label: `"I'll be back."|«Я ещё вернусь.»|«Yana kelaman.»` }
  ], o => {
    if (o.id === 'later') { d(); return; }
    if (o.id === 'way') { endWay(d); return; }
    if (o.id === 'voice') {
      S1('plan', 'voice');
      FAC.stepTo('qb1', `Mahbuba agreed to take her voice back, the first-year one from Ismat's booth. Get the tumar from Ismat.|Махбуба согласна вернуть себе голос — тот, первого года, из будки Исмата. Забрать тумар у Исмата.|Mahbuba ovozini — Ismatning do'konidagi birinchi yilgisini — qaytarib olishga rozi. Tumarni Ismatdan olish kerak.`, ['bazaar', 'qb1booth']);
      play([
        ['', `She writes: IT WON'T FIT. IT'S TWELVE YEARS YOUNGER THAN ME.|Она пишет: НЕ ПОДОЙДЁТ. ОН НА ДВЕНАДЦАТЬ ЛЕТ МОЛОЖЕ МЕНЯ.|U yozadi: TO'G'RI KELMAYDI. U MENDAN O'N IKKI YOSH KICHIK.`],
        ['', `A long pause. Then: ...BRING IT.|Долгая пауза. Потом: ...НЕСИ.|Uzoq jimlik. Keyin: ...OLIB KEL.`]
      ], d);
      return;
    }
    S1('plan', 'mother');
    FAC.stepTo('qb1', `You told Mahbuba you'd tell her mother. She wrote DON'T. Kamola-xola is on the Bazaar.|Ты сказал Махбубе, что расскажешь матери. Она написала: НЕ НАДО. Камола-хола на Базаре.|Mahbubaga onangga aytaman, deding. U «KERAK EMAS» deb yozdi. Kamola xola Bozorda.`, ['bazaar', 'qb1dye']);
    play([['', `She writes DON'T, and underlines it twice, and turns back to her rags.|Она пишет НЕ НАДО, подчёркивает дважды и отворачивается к своим тряпкам.|U «KERAK EMAS» deb yozadi, ikki marta tagiga chizadi va lattalariga o'giriladi.`]], d);
  });

  FAC.talk.qb_mahbuba = d => {
    const b = br('qb1');
    if (b === 'voice') { play([['qb_mahbuba', `The caravan leaves at the new moon. I say one sentence a day. I'm saving it.|Караван уходит в новолуние. Я говорю одну фразу в день. Берегу.|Karvon yangi oyda jo'naydi. Kuniga bitta gap gapiraman. Asrayapman.`], ['', `Her voice is hoarse and too young for her, like a borrowed coat.|Голос у неё хриплый и слишком молодой — как чужой халат с плеча.|Ovozi xirillagan va unga juda yosh — birovning yelkasidan olingan to'ndek.`]], d); return; }
    if (b === 'mother') { play([['', `At the vats she writes on a board in blue dye: I'M FED. I'M WARM. I'M HOME. Smaller: TELL NOBODY I WROTE THIS.|У чанов она пишет синей краской на доске: Я СЫТА. МНЕ ТЕПЛО. Я ДОМА. Мельче: НИКОМУ НЕ ГОВОРИ, ЧТО Я ЭТО НАПИСАЛА.|Xumlar yonida taxtaga ko'k bo'yoq bilan yozadi: TO'QMAN. ISSIQ. UYDAMAN. Maydaroq: BUNI YOZGANIMNI HECH KIMGA AYTMA.`]], d); return; }
    if (b) { play([['', `…|…|…`]], d); return; }
    if (!act('qb1') || !B1('drain')) { play([['', `A woman beats lamp rags against a stone. She doesn't look up.|Женщина колотит о камень тряпки от ламп. Головы не поднимает.|Bir ayol chiroq lattalarini toshga urib yuvyapti. Boshini ko'tarmaydi.`]], d); return; }
    if (B1('tumar')) { endVoice(d); return; }
    if (B1('plan') === 'voice') { play([['', `She points at the wall, where it still says BRING IT.|Она показывает на стену, где по-прежнему написано: НЕСИ.|U devorni ko'rsatadi, u yerda hamon «OLIB KEL» deb yozilgan.`]], d); return; }
    if (B1('plan') === 'mother') { play([['', `She keeps her back to you. The word on the wall has been gone over again, darker.|Она стоит к тебе спиной. Слово на стене обведено заново, темнее.|U senga orqasini o'girib turibdi. Devordagi so'z qaytadan, qoraroq qilib chizilgan.`]], d); return; }
    if (!B1('found')) { meet(d); return; }
    mahbubaHub(d);
  };

  /* ---------------------------------------------------------------- Kamola-xola */
  FAC.talk.qb_kamola = d => {
    const b = br('qb1');
    if (b) {
      if (b === 'way' && !B1('told')) {
        S1('told');
        play([
          ['hero', `She's alive, xola. She left the city through the Karez. She didn't want to be found.|Она жива, хола. Ушла из города через кяризы. Не хотела, чтобы её нашли.|U tirik, xola. Shahardan korez orqali chiqib ketdi. Topilishni istamadi.`],
          ['qb_kamola', `Alive. ...And gone. Down a drain, like a thief. She couldn't walk two streets up to tell me?|Жива. ...И ушла. Через сток, как воровка. Не могла подняться на две улицы и сказать мне?|Tirik. ...Va ketib qoldi. Ariqdan, o'g'ridek. Ikki ko'cha yuqoriga chiqib, menga aytolmadimi?`],
          ['qb_kamola', `No. Of course not. She knew I'd never let go of her till she stayed.|Нет. Конечно, нет. Знала: я бы не отпустила, пока не осталась бы.|Yo'q, albatta. Bilardi: qolmaguncha qo'yib yubormasdim.`]
        ], d);
        return;
      }
      const L = {
        way: `Kamola dyes. Her hands are blue to the shoulder now. She doesn't stand across from the booth any more.|Камола красит. Руки у неё теперь синие до плеч. Напротив будки она больше не стоит.|Kamola bo'yoq qiladi. Qo'llari endi yelkasigacha ko'k. Do'kon ro'parasida endi turmaydi.`,
        voice: `"She said goodbye. In that voice, the old one, from when she was happy." Kamola looks at her blue hands. "I'd rather she'd written it."|«Попрощалась. Тем голосом, старым, из тех лет, когда была счастлива». Камола смотрит на свои синие руки. «Лучше бы написала».|«Xayrlashdi. O'sha ovoz bilan, eskisi bilan, baxtli paytlaridagisi bilan». Kamola ko'k qo'llariga qaraydi. «Yozib qo'ya qolsa bo'lardi».`,
        mother: `"She eats. She sleeps. She dyes better than I ever did." Kamola doesn't look up from the vat. "She'll thank me. Some day."|«Ест. Спит. Красит лучше, чем я когда-либо». Камола не поднимает глаз от чана. «Ещё спасибо скажет. Когда-нибудь».|«Ovqat yeydi. Uxlaydi. Mendan ham yaxshi bo'yaydi». Kamola xumdan ko'z uzmaydi. «Hali rahmat aytadi. Qachondir».`,
        ismat: `Kamola-xola still stands across from the booth. Nobody has told her anything. When she looks at Ismat, he lowers his eyes.|Камола-хола всё стоит напротив будки. Ей так никто ничего и не сказал. Когда она смотрит на Исмата, тот опускает глаза.|Kamola xola hamon do'kon ro'parasida turibdi. Unga hech kim hech narsa aytmadi. U Ismatga qaraganda, Ismat ko'zini olib qochadi.`
      };
      play([['', L[b] || `…|…|…`]], d);
      return;
    }
    if (q('qb1').st === 'none') { offer1(d); return; }
    if (B1('plan') === 'mother') { endMother(d); return; }
    if (B1('found') && !B1('plan')) {
      play([['qb_kamola', `You've been down there. I can smell the Karez on you. Well?|Ты был внизу. От тебя кяризами пахнет. Ну?|Pastda bo'lding. Sendan korez hidi kelyapti. Xo'sh?`]], () => ask(`Kamola-xola waits, blue hands clenched.|Камола-хола ждёт, сжав синие руки.|Kamola xola ko'k qo'llarini musht qilib kutyapti.`, [
        { id: 'tell', label: `"She's alive. In the Karez, washing for smugglers."|«Она жива. В кяризах, стирает на контрабандистов.»|«U tirik. Korezda, kontrabandachilarga kir yuvyapti.»` },
        { id: 'not', label: `"Nothing yet."|«Пока ничего.»|«Hozircha hech narsa.»` }
      ], o => { if (o.id === 'tell') endMother(d); else d(); }));
      return;
    }
    play([['qb_kamola', B1('heard') ? `You listened to her? She sounds happy, doesn't she. She never sounded like that at home.|Послушал? Счастливый голос, правда? Дома она так никогда не звучала.|Eshitdingmi? Baxtli ovoz, to'g'rimi? Uyda hech qachon bunday gapirmagan.` : `Go and listen to her first. Then look me in the eye and tell me she drowned.|Сначала пойди послушай её. Потом посмотри мне в глаза и скажи, что она утонула.|Avval borib uni eshit. Keyin ko'zimga qarab, u cho'kdi, deb ayt.`]], d);
  };

  /* ---------------------------------------------------------------- the endings */
  const fin1 = (b, lines, text, deltas, d) => {
    FAC.react(deltas, 'qb1');
    play(lines.concat([
      FAC.cl('alp', { way: `She paid for the road with her own wash. Alp respects that. Alp does not like the drain.|Она заплатила за дорогу своей стиркой. Алп это уважает. Алпу не нравится сток.|U yo'l uchun o'z kir yuvishi bilan to'ladi. Alp buni hurmat qiladi. Alpga ariq yoqmaydi.`, voice: `A voice goes back where it came from. Alp would like that to happen more.|Голос вернулся туда, откуда взялся. Алп хотел бы, чтобы так было чаще.|Ovoz qayerdan kelgan bo'lsa, o'sha yerga qaytdi. Alp shunday tez-tez bo'lishini istardi.`, mother: `Her mother came. Alp has no mother who would come. ...That is all Alp will say.|Мать пришла. У Алпа нет матери, которая бы пришла. ...Больше Алп ничего не скажет.|Onasi keldi. Alpning keladigan onasi yo'q. ...Alp boshqa hech narsa demaydi.`, ismat: `You sold where she was. Alp heard the coins.|Ты продал, где она. Алп слышал, как звенели монеты.|U qayerdaligini sotding. Alp tangalar jiringlaganini eshitdi.` }[b]),
      FAC.cl('nargiza', { way: `She'll find someone to talk to out there. Or she won't, and that's hers too.|Там она найдёт, с кем говорить. Или не найдёт — и это тоже её дело.|U yerda gaplashadigan odam topadi. Yoki topmaydi — bu ham o'zining ishi.`, voice: `Twelve years too young. She'll grow into it. People grow into worse.|На двенадцать лет моложе. Дорастёт. Люди и до худшего дорастают.|O'n ikki yosh kichik. Ulg'ayib, moslashadi. Odamlar bundan battariga ham moslashadi.`, mother: `She wrote DON'T. Twice. I counted.|Она написала НЕ НАДО. Дважды. Я считала.|U «KERAK EMAS» deb yozdi. Ikki marta. Sanadim.`, ismat: `He paid her way. I don't know what to do with that, so I'm going to hum.|Он заплатил за её дорогу. Не знаю, что с этим делать, так что буду напевать.|U uning yo'liga pul to'ladi. Buni nima qilishni bilmayman, shuning uchun xirgoyi qilaman.` }[b]),
      FAC.cl('surayyo', { way: `Eight tilla. In the Tail that's a roof patched. Cheapest freedom I've seen this year.|Восемь тилла. В Хвосте за это крышу латают. Самая дешёвая свобода за год.|Sakkiz tilla. Dumda bunga tom yamashadi. Shu yil ko'rgan eng arzon ozodlik.`, voice: `And the boy with the coppers? Who asks him if he ate now?|А мальчишка с медяками? Кто теперь спросит его, ел ли он?|Mis tangali bola-chi? Endi undan ovqatlandingmi, deb kim so'raydi?`, mother: `Fed, warm, home. In the Tail we'd call that luck. I wouldn't call it hers.|Сыта, в тепле, дома. В Хвосте это называют удачей. Я бы не назвала это её удачей.|To'q, issiq, uyda. Dumda buni omad deyishadi. Men buni uning omadi demasdim.`, ismat: `You sold a woman's hiding place for sixty tilla, and it came out kind. Don't make a habit of it.|Ты продал, где прячется женщина, за шестьдесят тилла, и вышло по-доброму. Не привыкай.|Ayolning yashiringan joyini oltmish tillaga sotding, yaxshilikka chiqdi. Odat qilma.` }[b])
    ]), () => { FAC.finish('qb1', b, text); d(); });
  };

  const endWay = d => fin1('way', [
    ['', `She looks at the coins for a long time. Then she writes one word, rubs it out before you can read it, and picks them up.|Она долго смотрит на монеты. Потом пишет одно слово, стирает прежде, чем ты успеваешь прочесть, и забирает их.|U tangalarga uzoq qaraydi. Keyin bitta so'z yozadi, sen o'qishga ulgurmasingdan o'chirib tashlaydi va tangalarni oladi.`],
    ['', `By evening a boatman's lamp goes down the black channel with two people in the boat. Only one of them talks.|К вечеру фонарь лодочника уходит вниз по чёрному протоку. В лодке двое. Говорит только один.|Kechga yaqin qayiqchining chirog'i qora oqim bo'ylab pastga ketadi. Qayiqda ikki kishi. Faqat bittasi gapiradi.`],
    () => (sado() ? ['sado', `Up on the Bazaar, her voice is still asking people if they ate. She's down here, gone. That's a strange way to be in two places.|Наверху, на Базаре, её голос всё ещё спрашивает, кто ел. А она здесь — и её уже нет. Странно так быть в двух местах.|Tepada, Bozorda, uning ovozi hamon odamlardan ovqatlandingmi, deb so'rayapti. O'zi esa shu yerda — va endi yo'q. Ikki joyda bo'lish g'alati.`] : null)
  ], `You paid the last eight tilla of Mahbuba's way out. She left the city through the Karez, without a voice. Her voice stays in Ismat's booth.|Ты доплатил последние восемь тилла за выход Махбубы. Она ушла из города через кяризы, без голоса. Её голос остался в будке Исмата.|Mahbubaning chiqib ketishi uchun oxirgi sakkiz tillani to'lading. U shahardan korez orqali, ovozsiz ketdi. Ovozi Ismatning do'konida qoldi.`, { surayyo: 5, nargiza: 5, alp: -5 }, d);

  const endVoice = d => {
    addVoid(2, `a voice sung back|возвращённый голос|qaytarilgan ovoz`);
    rep('tail', 1); S1('debt');
    fin1('voice', [
      ['', `You warm the tumar in your palm and hum the giving-back, low, the way Rustam taught you for the rare days a debt was cancelled. Mahbuba holds her throat.|Ты греешь тумар в ладони и тихо напеваешь возвратную — Рустам учил ей на редкие дни, когда долг списывали. Махбуба держится за горло.|Tumarni kaftingda isitib, qaytarish qo'shig'ini past ovozda aytasan — Rustam uni qarz kechiladigan kamdan-kam kunlar uchun o'rgatgan. Mahbuba tomog'ini ushlaydi.`],
      ['qb_mahbuba', `Did... you eat.|Ты... ел.|Yeding... mi.`],
      ['', `It is the voice from the booth, worn thin as an old coin. Hundreds of strangers have heard it ask if they ate. It sits on her a size too young.|Это голос из будки, стёртый, как старая монета. Сотни чужих людей слышали, как он спрашивает, ели ли они. Он ей на размер моложе.|Bu do'kondagi ovoz, eski tangadek yeyilib ketgan. Yuzlab begonalar undan «ovqatlandingmi» degan savolni eshitgan. U Mahbubaga bir o'lcham yosh.`],
      ['qb_mahbuba', `It doesn't fit. ...It'll do. At the gate I only need one sentence.|Не по мне. ...Сойдёт. На воротах мне нужна одна фраза.|Menga to'g'ri kelmaydi. ...Bo'laveradi. Darvozada menga bitta gap kerak, xolos.`],
      ['qb_mahbuba', `I'll go to my mother first. I want her to hear me say goodbye. With my own mouth, at least.|Сначала зайду к матери. Пусть услышит, как я прощаюсь. Хоть ртом своим.|Avval onamning oldiga boraman. Xayrlashganimni eshitsin. Hech bo'lmasa o'z og'zim bilan.`]
    ], `You sang the first year of Mahbuba's voice back into her. She will leave by the Rabat gate, with an oath. Ismat's booth is shut, and his debt is still open.|Ты вернул Махбубе голос её первого года. Она уйдёт через ворота Рабата, с клятвой. Будка Исмата закрыта, а долг его — открыт.|Mahbubaga birinchi yilgi ovozini qaytarding. U Rabot darvozasidan qasam ichib chiqib ketadi. Ismatning do'koni yopiq, qarzi esa ochiq.`, { nargiza: 10, alp: 5, surayyo: -5 }, d);
  };

  const endMother = d => {
    rep('tail', 1);
    fin1('mother', [
      ['qb_kamola', `Alive? ...Alive. Where? Don't tell me, take me. Now. I've got my shoes on.|Жива? ...Жива. Где? Не говори, веди. Сейчас. Я уже обута.|Tirikmi? ...Tirik. Qayerda? Aytma, olib bor. Hozir. Kovushimni kiyib turibman.`],
      ['', `In the Karez Kamola says nothing for a long time. Then she slaps her daughter across the face, holds her, and scolds her into her hair for an hour.|В кяризах Камола долго молчит. Потом бьёт дочь по щеке, обнимает её и целый час ругает, уткнувшись ей в волосы.|Korezda Kamola uzoq jim turadi. Keyin qizining yuziga bir shapaloq tushiradi, quchoqlaydi va bir soat sochiga yuzini bosib koyiydi.`],
      ['', `Mahbuba lets herself be led up the rungs. On the wall behind her, where nobody will read it now, the soot still says DON'T.|Махбуба даёт вывести себя наверх по ступеням. На стене за ней, где никто уже не прочтёт, сажа всё ещё говорит: НЕ НАДО.|Mahbuba o'zini zinapoyalardan yuqoriga olib chiqishlariga qo'yib beradi. Ortidagi devorda, endi hech kim o'qimaydigan joyda, qurum hamon «KERAK EMAS» deb turibdi.`],
      ['', `That afternoon Kamola tears the painted board off Ismat's booth and tells the whole row. The row laughs. Nobody pays three tilla to hear a wife who walked out.|В тот же день Камола срывает с будки Исмата расписную доску и рассказывает всё всему ряду. Ряд смеётся. Никто не платит три тилла, чтобы послушать жену, которая ушла.|O'sha kuni Kamola Ismatning do'konidan bo'yalgan taxtani yulib oladi va butun rastaga hammasini aytib beradi. Rasta kuladi. Tashlab ketgan xotinni eshitishga hech kim uch tilla to'lamaydi.`]
    ], `You told Kamola. She brought Mahbuba home to the Tail, against her will. Ismat's lie is all over the Bazaar; he sold the voice at auction to the Ark.|Ты рассказал Камоле. Она увела Махбубу домой, в Хвост, против её воли. Ложь Исмата знает весь Базар; голос он продал с торгов в Арк.|Kamolaga aytding. U Mahbubani istagiga qarshi Dumga, uyiga olib ketdi. Ismatning yolg'onini butun Bozor biladi; ovozni kimoshdida Arkka sotdi.`, { alp: 10, nargiza: -10, surayyo: 5 }, d);
  };

  const endIsmat = d => {
    gold(60);
    fin1('ismat', [
      ['qb_ismat', `Forty, you said? For the way out? ...She's short. Of course she's short. Twelve years she never asked me for a coin.|Сорок, говоришь? За выход? ...Ей не хватает. Конечно, не хватает. Двенадцать лет ни монеты у меня не попросила.|Qirq deysanmi? Chiqib ketishga? ...Yetmayapti. Albatta yetmaydi. O'n ikki yil mendan bir tanga ham so'ramadi.`],
      ['', `He shoves a purse into your hand without counting it, pulls the shutter down and goes off toward the drain at a half-run: a heavy man who's forgotten how to run.|Он суёт тебе кошель не считая, опускает ставень и почти бегом идёт к стоку — грузный человек, отвыкший бегать.|U sanamay qo'lingga hamyon tutqazadi, darchani tushiradi va ariq tomonga yarim yugurib ketadi — yugurishni unutgan og'ir odam.`],
      ['', `Next day the booth is open again. Ismat's eyes are red.|Наутро будка снова открыта. Глаза у Исмата красные.|Ertasi kuni do'kon yana ochiq. Ismatning ko'zlari qizargan.`],
      ['qb_ismat', `I paid the boatman her eight. She wrote on the wall: THANK YOU. Twelve years, and she never once said it to me in that voice.|Я заплатил лодочнику её восемь. Она написала на стене: СПАСИБО. Двенадцать лет — и ни разу не сказала мне этого тем голосом.|Qayiqchiga uning sakkiz tillasini to'ladim. Devorga yozdi: RAHMAT. O'n ikki yil — o'sha ovoz bilan menga bir marta ham aytmagan.`],
      ['qb_ismat', `I'm still selling it. Debts don't care.|Продаю дальше. Долгам всё равно.|Sotishda davom etaman. Qarzga baribir.`]
    ], `You sold Ismat the way to his wife. He paid her way out of the city and went back to selling her voice. Kamola was never told.|Ты продал Исмату дорогу к жене. Он заплатил за её выход из города и вернулся к торговле её голосом. Камоле никто ничего не сказал.|Ismatga xotinining yo'lini sotding. U xotinining shahardan chiqishiga pul to'ladi va yana ovozini sotishga qaytdi. Kamolaga hech kim aytmadi.`, { surayyo: -5, nargiza: -10, alp: -5 }, d);
  };

  SIDE.epi('qb1', () => ({
    way: `Ismat sold his wife's voice until it wore through. At the end it said only "Did you..." and stopped. Somewhere past the Salt Road, a woman who never speaks runs a laundry.|Исмат продавал голос жены, пока тот не протёрся. Под конец он говорил только «Ты...» — и замолкал. Где-то за Соляной дорогой прачечную держит женщина, которая никогда не говорит.|Ismat xotinining ovozini yeyilib tugaguncha sotdi. Oxirida u faqat «Sen...» der va jim bo'lardi. Tuz yo'lining narigi tomonida hech qachon gapirmaydigan bir ayol kir yuvish do'konini tutadi.`,
    voice: `Mahbuba left with the autumn caravan, in a voice twelve years too young. On the road she sang, badly, for the first time in her life.|Махбуба ушла с осенним караваном, голосом на двенадцать лет моложе себя. В дороге она пела — плохо — впервые в жизни.|Mahbuba kuzgi karvon bilan, o'zidan o'n ikki yosh kichik ovoz bilan ketdi. Yo'lda umrida birinchi marta qo'shiq aytdi — yomon aytdi.`,
    mother: `Mahbuba never left the Tail. She dyes at her mother's vats and writes on the boards in blue. In the Ark her voice is played at dinners; the guests say it sounds so warm.|Махбуба так и не ушла из Хвоста. Красит у материнских чанов и пишет синим на досках. В Арке её голос ставят на ужинах; гости говорят, какой он тёплый.|Mahbuba Dumdan hech qachon ketmadi. Onasining xumlari yonida bo'yoq qiladi va taxtalarga ko'k bilan yozadi. Arkda ziyofatlarda uning ovozini qo'yishadi; mehmonlar qanday iliq ovoz, deyishadi.`,
    ismat: `Ismat kept the booth and shut it one minute early every night. That minute he listened to alone, with the shutter down.|Исмат не закрыл будку, но каждый вечер запирал её на минуту раньше. Эту минуту он слушал один, за опущенным ставнем.|Ismat do'konni yopmadi, lekin har kecha bir daqiqa erta yopardi. O'sha daqiqani darcha tushirilgan holda, yolg'iz tinglardi.`
  }[br('qb1')] || null), 'mehri:sings');

  /* ================================================================ qb2 · THE CLERKS FORGET */
  SIDE.quest('qb2', { n: 23, title: `The Clerks Forget|Писари забывают|Mirzalar unutyapti`, where: ['bazaar', 'qb2desk'], offer: () => SIDE.moon() <= 2 });

  FAC.npc('qb_mansur', { name: CAST.qb_mansur.name, look: LK.mansur, dx: -16, prompt: `Talk to the tax-farmer|Поговорить с откупщиком|Soliq ijarachisi bilan gaplashish`, idle: `Mansur-bay reads a page of sums the way other men read poetry.|Мансур-бай читает страницу цифр так, как другие читают стихи.|Mansurboy raqamli sahifani boshqalar she'r o'qigandek o'qiyapti.` },
    () => [{ from: 8, to: 19, region: 'bazaar', spot: 'qb2desk' }]);
  FAC.npc('qb_dilafruz', { name: CAST.qb_dilafruz.name, look: LK.dilafruz, dx: 20, prompt: `Talk to the clerk|Поговорить с писаршей|Kotiba bilan gaplashish`, idle: `A young clerk copies figures without looking up. Her pen never stops.|Молодая писарша переписывает цифры, не поднимая глаз. Перо не останавливается.|Yosh kotiba boshini ko'tarmay raqamlarni ko'chiryapti. Qalami to'xtamaydi.` },
    () => {
      const b = br('qb2');
      if (b === 'hand') return [{ from: 0, to: 24, region: 'mines', spot: 'qb2mine' }];
      if (b === 'take') return [{ from: 8, to: 21, region: 'cloister', spot: 'qb2stair' }];
      return [{ from: 8, to: 19, region: 'bazaar', spot: 'qb2desk' }];
    });
  FAC.npc('qb_qodir', { name: CAST.qb_qodir.name, look: LK.qodir, dx: -12, prompt: `Talk to the clerk on the steps|Поговорить с писарем на ступенях|Zinadagi mirza bilan gaplashish`, idle: `"Peace be upon you. A letter to write? A clean hand, a clean hand."|«Мир вам. Письмо написать? Почерк чистый, чистый».|«Assalomu alaykum. Xat yozish kerakmi? Xatim toza, toza».` },
    () => [{ from: 7, to: 21, region: 'bazaar', spot: 'qb2qodir' }]);

  const offer2 = d => play([
    ['', `A broad desk under an awning; three empty stools behind it and one taken, by a young woman copying figures. In front, a man in a striped robe is very calm, the way busy men are calm.|Широкий стол под навесом; за ним три пустых табурета и один занятый — молодая женщина переписывает цифры. Перед столом человек в полосатом халате: очень спокоен, как бывают спокойны занятые люди.|Soyabon ostida keng stol; orqasida uchta bo'sh kursi, bittasida yosh ayol raqam ko'chiryapti. Stol oldida yo'l-yo'l to'nli odam — band odamlar qanday xotirjam bo'lsa, shunday xotirjam.`],
    ['qb_mansur', `Yodchi. Mansur, tax-farmer to the Divan. I'll be brief: brevity is the one thing I still have that's cheap.|Ёдчи. Мансур, откупщик Дивана. Буду краток: краткость — единственное, что у меня ещё дёшево.|Yodchi. Mansur, Devonning soliq ijarachisi. Qisqa gapiraman: qisqalik — menda qolgan yagona arzon narsa.`],
    ['qb_mansur', `I bought the Tail's old debt books from the Singers. Someone is singing my clerks empty. Two forgot their books. The third, old Hamdam, fell from the Singers' stair.|Я выкупил у Певцов старые долговые книги Хвоста. Кто-то выпевает моих писарей. Двое забыли свои книги. Третий, старик Хамдам, упал с лестницы Певцов.|Xonandalardan Dumning eski qarz daftarlarini sotib oldim. Kimdir mirzalarimni kuylab bo'shatyapti. Ikkitasi daftarini unutdi. Uchinchisi, keksa Hamdam, Xonandalar zinasidan yiqildi.`]
  ], () => hub(`Mansur-bay waits, his thumb marking a place in the ledger.|Мансур-бай ждёт, заложив пальцем страницу в книге.|Mansurboy barmog'ini daftar sahifasiga qistirib kutib turibdi.`, [
    { label: `— You have the paper. Why does a clerk matter?|— Бумага у тебя есть. Зачем тебе писари?|— Qog'oz sizda bor. Mirza nimaga kerak?`, lines: [
      ['qb_mansur', `Paper doesn't swear, yodchi. Before the qazi a debt stands only while the clerk who wrote it can taste his own entry and swear to it. The clerk is the seal.|Бумага не клянётся, ёдчи. У казия долг стоит, пока писарь, записавший его, может испить свою запись и поклясться. Писарь и есть печать.|Qog'oz qasam ichmaydi, yodchi. Qozi oldida qarz uni yozgan mirza o'z yozuvini totib, qasam icha olsagina kuchda. Muhr — mirzaning o'zi.`],
      ['qb_mansur', `Empty the clerk, and the page is only paper. Three hundred households' worth of paper.|Опустоши писаря — и страница станет просто бумагой. Бумагой на триста дворов.|Mirzani bo'shatsang, sahifa shunchaki qog'ozga aylanadi. Uch yuz xonadonlik qog'oz.`]
    ] },
    { label: `— Who'd want that?|— Кому это нужно?|— Bu kimga kerak?`, lines: [
      ['qb_mansur', `Those Who Remember, who else. They hate books. They burn the Singers' wax; why not my clerks? Find me a mask and I'll find the rest myself.|Тем, кто помнит, кому ж ещё. Они ненавидят книги. Жгут воск Певцов — почему бы не моих писарей? Найди мне маску, остальное я найду сам.|Eslaganlarga-da, yana kimga. Ular daftarni yomon ko'radi. Xonandalarning mumini yoqishadi — mening mirzalarimni nega emas? Menga niqobni top, qolganini o'zim topaman.`]
    ] },
    { label: `— What did the books cost you?|— Во что тебе обошлись книги?|— Daftarlar sizga qanchaga tushdi?`, lines: [
      ['qb_mansur', `My house. I pledged it to the Divan. My daughters' dowries are in those pages, yodchi. Other people's too, I know. That's what a debt is.|В дом. Заложил его Дивану. В этих страницах приданое моих дочерей, ёдчи. И не только их, знаю. Долг — это всегда чьё-то.|Uyimga. Uni Devonga garovga qo'ydim. Bu sahifalarda qizlarimning sepi bor, yodchi. Faqat ularniki emas, bilaman. Qarz degani shu-da.`],
      ['qb_mansur', `The Singers sold them cheap. Debts nobody can collect come cheap. I can collect.|Певцы продали их дёшево. Долги, которые никто не может взыскать, дёшевы. А я могу.|Xonandalar ularni arzonga sotdi. Hech kim undira olmaydigan qarz arzon bo'ladi. Men esa undira olaman.`]
    ] },
    { label: `— Who's left?|— Кто остался?|— Kim qoldi?`, lines: [
      ['qb_mansur', `Dilafruz. The last, and the best hand I ever paid for. She copied the Tail's book. I don't let her walk home alone any more.|Дилафруз. Последняя, и лучший почерк, за какой я когда-либо платил. Это она переписала книгу Хвоста. Домой одну я её больше не отпускаю.|Dilafruz. Oxirgisi, men pul to'lagan eng chiroyli xat. Dumning daftarini o'sha ko'chirgan. Endi uni uyiga yolg'iz qo'ymayman.`],
      () => (sado() ? ['sado', `He says "the best hand" the way people say "my best camel".|Он говорит «лучший почерк» так, как говорят «мой лучший верблюд».|U «eng chiroyli xat»ni «eng yaxshi tuyam» degandek aytyapti.`] : null)
    ] }
  ], [
    { id: 'yes', label: `"A hundred and fifty, and I find you a name. Not a mask. A name."|«Сто пятьдесят — и я найду тебе имя. Не маску. Имя.»|«Bir yuz ellik — va sizga ism topib beraman. Niqob emas. Ism.»` },
    { id: 'no', label: `"Your books, your trouble."|«Твои книги — твоя забота.»|«Daftar sizniki — tashvish ham sizniki.»` }
  ], o => {
    if (o.id !== 'yes') { play([['qb_mansur', `Mine, and the Tail's. Mostly the Tail's, if I go under. Remember that when they ask you who let it happen.|Моя. И Хвоста. Если я пойду ко дну — в основном Хвоста. Вспомни об этом, когда спросят, кто допустил.|Meniki. Va Dumniki. Men cho'ksam — asosan Dumniki. Kim yo'l qo'ydi, deb so'rashsa, buni esla.`]], d); return; }
    FAC.begin('qb2', `Mansur-bay, a Divan tax-farmer, bought the Tail's old debt books. Someone is singing his clerks empty; old Hamdam fell from the Singers' stair. Start with Qodir-mirza, who forgot.|Мансур-бай, откупщик Дивана, выкупил старые долговые книги Хвоста. Кто-то выпевает его писарей; старик Хамдам упал с лестницы Певцов. Начать с Кадыр-мирзы, который забыл.|Devon soliq ijarachisi Mansurboy Dumning eski qarz daftarlarini sotib olgan. Kimdir mirzalarini kuylab bo'shatyapti; keksa Hamdam zinadan yiqildi. Unutgan Qodir mirzadan boshlash.`, ['bazaar', 'qb2qodir']);
    play([['qb_mansur', `Qodir sits on the counting-row steps all day, offering to write letters. Two years with me, and he thinks he's looking for work.|Кадыр целыми днями сидит на ступенях счётного ряда и предлагает написать письмо. Два года у меня проработал, а думает, что ищет работу.|Qodir kun bo'yi hisob rastasining zinasida o'tirib, xat yozib berishni taklif qiladi. Ikki yil menda ishladi, endi esa ish qidiryapman deb o'ylaydi.`]], d);
  }));

  /* ---------------------------------------------------------------- Qodir: the hole the size of a year */
  const qodirClue = d => {
    S2('qodir');
    FAC.stepTo('qb2', `Qodir's singer: a woman with ink on her fingers who brought sugared almonds and hummed the Cloister's practice scale. The Cloister keeps a register of the novices it sent away.|Певица Кадыра — женщина с чернилами на пальцах: приносила засахаренный миндаль и напевала учебный лад Обители. В Обители хранят список отчисленных.|Qodirni kuylagan — barmoqlari siyohli ayol: qandlangan bodom olib kelgan, xonaqohning mashq ohangini xirgoyi qilgan. Xonaqohda chiqarilgan shogirdlar ro'yxati bor.`, ['cloister', 'qb2reg']);
    d();
  };
  FAC.talk.qb_qodir = d => {
    if (!act('qb2') || B2('qodir')) {
      play([['qb_qodir', done('qb2') ? `A letter? I write a clean hand. People say I used to work for someone. A clean hand, a clean hand.|Письмо? Почерк у меня чистый. Говорят, я раньше на кого-то работал. Чистый почерк, чистый.|Xatmi? Xatim toza. Aytishlaricha, oldin kimgadir ishlaganman. Toza xat, toza.` : `Peace be upon you. A letter to write? I write a clean hand. A clean hand, a clean hand.|Мир вам. Письмо написать? Почерк у меня чистый. Чистый, чистый.|Assalomu alaykum. Xat yozish kerakmi? Xatim toza. Toza, toza.`]], d);
      return;
    }
    play([
      ['', `A clerk with ink-stained fingers sits on the counting-row steps, a reed pen behind his ear, waiting for work he thinks nobody's given him yet.|Писарь с пальцами в чернилах сидит на ступенях счётного ряда, калам за ухом, и ждёт работы, которую, как ему кажется, ему ещё не дали.|Barmoqlari siyohga bo'yalgan mirza hisob rastasining zinasida o'tiribdi, qulog'ida qalam, hali berilmagan deb o'ylagan ishini kutyapti.`],
      ['hero', `Qodir. The Tail's book. Who did you copy it for?|Кадыр. Книга Хвоста. Для кого ты её переписывал?|Qodir. Dumning daftari. Uni kim uchun ko'chirgansan?`],
      ['qb_qodir', `A book? ...There's a year missing, aka. Like a tooth. My tongue keeps going there. Have you a letter to write?|Книга? ...У меня год пропал, ака. Как зуб. Язык всё туда лезет. Письмо написать не нужно?|Daftar? ...Bir yilim yo'qolgan, aka. Tishdek. Tilim o'sha joyga boraveradi. Xat yozish kerakmi?`]
    ], () => ask(`There's a hole in him the size of a year.|В нём дыра размером с год.|Uning ichida bir yillik bo'shliq bor.`, [
      FAC.craft('taste', `the edge of the hole, where the song cut|край дыры, там, где резала песня|bo'shliq chetini, qo'shiq kesgan joyni`, { id: 'taste' }),
      FAC.chk('mem', 5, `Ask him small questions around the hole until its edges show.|Задавать ему мелкие вопросы вокруг дыры, пока не проступят края.|Bo'shliq atrofida mayda savollar berib, chetlarini ko'rinadigan qilish.`, { id: 'ask' }, `Questions|Вопросы|Savollar`),
      BYE
    ], o => {
      if (o.id === 'later') { d(); return; }
      if (o.id === 'ask') {
        if (!o.ok) { play([['', `He answers every question with "a clean hand". The hole doesn't show its edges to strangers.|На каждый вопрос он отвечает: «Чистый почерк». Края дыры чужим не показываются.|Har bir savolga «toza xat» deb javob beradi. Bo'shliq chetlarini begonalarga ko'rsatmaydi.`]], d); return; }
        play([
          ['hero', `Who brought the almonds, Qodir?|Кто приносил миндаль, Кадыр?|Bodomni kim olib kelardi, Qodir?`],
          ['qb_qodir', `A colleague. Always almonds. Sugared.|Коллега. Всегда миндаль. Засахаренный.|Hamkasb. Doim bodom. Qandlangan.`],
          ['hero', `Did she sing?|Она пела?|U kuylarmidi?`],
          ['qb_qodir', `She hummed. Like the novices, before dawn. Up in sevens.|Мурлыкала. Как послушники до рассвета. Вверх, по семь.|Xirgoyi qilardi. Shogirdlardek, tong otmasdan. Yettilab yuqoriga.`],
          ['', `His hand goes to his wrist and stays there, as if someone were still holding it.|Его рука тянется к запястью и остаётся там, будто кто-то всё ещё его держит.|Qo'li bilagiga boradi va o'sha yerda qoladi, go'yo kimdir hali ham ushlab turgandek.`]
        ], () => qodirClue(d));
        return;
      }
      FAC.taste([
        ['memory', `Evening, the counting row empty. Tea for two, sugared almonds in a paper twist. A woman's hand on his wrist, ink on her fingers, like his.|Вечер, счётный ряд пуст. Чай на двоих, засахаренный миндаль в бумажном кульке. Женская рука у него на запястье, на пальцах чернила — как у него.|Kechqurun, hisob rastasi bo'm-bo'sh. Ikki kishilik choy, qog'oz xaltachada qandlangan bodom. Bilagida ayol qo'li, barmoqlarida siyoh — xuddi unikidek.`],
        ['memory', `She hums low, a scale climbing in sevens: the Cloister's practice scale, the one novices sing before dawn. He feels sleepy, and safe.|Она тихо напевает лад, который поднимается семёрками: учебный лад Обители, его поют послушники до рассвета. Ему сонно и спокойно.|U past ovozda yettilab ko'tariladigan ohangni xirgoyi qiladi: xonaqohning mashq ohangi, shogirdlar uni tong otmasdan kuylaydi. Uning uyqusi keladi, ko'ngli tinch.`],
        ['', `Then nothing. The year ends there, cut clean, the way a good singer cuts.|Дальше — ничего. Год обрывается там, срезан чисто, как режет хороший певец.|Keyin — hech narsa. Yil o'sha yerda uziladi, yaxshi xonanda kesgandek toza kesilgan.`]
      ], () => qodirClue(d), { person: true, intro: `You take his inky wrist, where the other hand used to rest, and listen past him.|Берёшь его запачканное чернилами запястье, там, где лежала чужая рука, и слушаешь сквозь него.|Uning siyohli bilagidan, boshqa qo'l turgan joydan ushlab, uning ortiga quloq solasan.` });
    }));
  };

  /* ---------------------------------------------------------------- the Cloister: the register and the stair */
  FAC.prop('cloister', 'qb2reg', { id: 'qb2reg', art: 'f6books', prompt: `Read the register of the sent-away|Прочесть список отчисленных|Chiqarilganlar ro'yxatini o'qish`, when: () => act('qb2') && B2('qodir') && !B2('reg'), use: d => play([
    ['', `A tall book chained to a lectern. "Sent away from the Choir": names, years, one line each. Most say "voice too small for the Well".|Высокая книга на цепи у аналоя. «Отчислены из хора»: имена, годы, по строке на каждого. У большинства: «голос мал для Колодца».|Lavhga zanjirlangan baland kitob. «Xordan chiqarilganlar»: ismlar, yillar, har biriga bir qator. Ko'pchiligida: «ovozi Quduq uchun kichik».`],
    ['', `Eleven years back: "Dilafruz, of the Tail, the Dyers' lane. Fourteen. Voice too small for the Well. Good hand. Sent to the Divan as a copyist."|Одиннадцать лет назад: «Дилафруз, из Хвоста, Красильный переулок. Четырнадцать лет. Голос мал для Колодца. Хороший почерк. Отдана в Диван переписчицей».|O'n bir yil oldin: «Dilafruz, Dumdan, Bo'yoqchilar tor ko'chasi. O'n to'rt yosh. Ovozi Quduq uchun kichik. Xati yaxshi. Devonga kotiba qilib berildi».`],
    () => (sado() ? ['sado', `Too small for the Well. Big enough for three clerks.|Мал для Колодца. А на трёх писарей хватило.|Quduq uchun kichik. Uchta mirzaga esa yetibdi.`] : null)
  ], () => {
    S2('reg');
    FAC.stepTo('qb2', `Dilafruz, Mansur's last clerk, was a Cloister novice sent away at fourteen. She is from the Tail, the Dyers' lane.|Дилафруз, последняя писарша Мансура, была послушницей Обители; её отчислили в четырнадцать. Она из Хвоста, из Красильного переулка.|Mansurning oxirgi kotibasi Dilafruz xonaqohda shogird bo'lgan, o'n to'rtida chiqarilgan. U Dumdan, Bo'yoqchilar tor ko'chasidan.`, ['bazaar', 'qb2desk']);
    d();
  }) });
  FAC.prop('cloister', 'qb2stair', { id: 'qb2stair', art: 'f6glint', dx: 10, prompt: `Taste the step where Hamdam fell|Испить ступень, где упал Хамдам|Hamdam yiqilgan pog'onani totib ko'rish`, when: () => act('qb2') && !B2('stair'), use: d => FAC.taste([
    ['memory', `Night. An old clerk climbs the Singers' stair counting the steps aloud, wrong every time. At the gate he asks a Singer: "Someone took a year of mine. Can you sing it back?"|Ночь. Старый писарь поднимается по лестнице Певцов и вслух считает ступени — каждый раз сбивается. У ворот спрашивает Певца: «У меня кто-то год забрал. Споёте обратно?»|Tun. Keksa mirza Xonandalar zinasidan pog'onalarni ovoz chiqarib sanab chiqadi — har safar adashadi. Darvozada xonandadan so'raydi: «Kimdir bir yilimni olib qo'ydi. Qaytarib kuylab berasizmi?»`],
    ['memory', `"We don't sing back, grandfather." He turns, counts the steps again, gets it wrong again, and steps into nothing.|«Обратно мы не поём, отец». Он поворачивается, снова считает ступени, снова сбивается — и шагает в пустоту.|«Biz orqaga kuylamaymiz, ota». U o'girilib, pog'onalarni yana sanaydi, yana adashadi — va bo'shliqqa qadam qo'yadi.`],
    ['', `Nobody pushed him. Someone took the year he climbed these steps every day to copy the Singers' books.|Его никто не толкал. Кто-то забрал год, в который он каждый день поднимался сюда переписывать книги Певцов.|Uni hech kim itarmagan. Kimdir u har kuni Xonandalar daftarlarini ko'chirgani shu zinadan chiqqan yilni olib qo'ygan.`]
  ], () => { S2('stair'); know(`Hamdam wasn't pushed: he fell looking for the year that was taken from him.|Хамдама никто не толкал: он упал, разыскивая отнятый у него год.|Hamdamni hech kim itarmagan: u o'zidan olingan yilni qidirib yiqilgan.`); d(); }, { intro: `You kneel on the worn step. The stone is cold and remembers feet.|Опускаешься на колено на стёртую ступень. Камень холодный и помнит ноги.|Yeyilgan pog'onaga tiz cho'kasan. Tosh sovuq va oyoqlarni eslaydi.` }) });

  /* ---------------------------------------------------------------- Dilafruz */
  const ismatInBook = () => br('qb1') === 'voice';
  const confront2 = d => play([
    ['hero', `Dilafruz. The Dyers' lane. The Cloister sent you away at fourteen.|Дилафруз. Красильный переулок. Обитель отчислила тебя в четырнадцать.|Dilafruz. Bo'yoqchilar tor ko'chasi. Xonaqoh seni o'n to'rtingda chiqarib yuborgan.`],
    ['qb_dilafruz', `..."Voice too small for the Well." They wrote it on me like a price tag. It's big enough for a clerk, after two bowls of tea.|...«Голос мал для Колодца». Написали на мне, как ценник. А на писаря после двух пиал чая — хватает.|...«Ovozi Quduq uchun kichik». Buni ustimga narx yozgandek yozib qo'yishgan. Ikki piyola choydan keyin mirzaga esa yetadi.`],
    ['qb_dilafruz', `Speak quietly. Mansur-bay's man is by the scales.|Говори тише. Человек Мансур-бая у весов.|Sekinroq gapir. Mansurboyning odami tarozi yonida.`]
  ], () => hub(`Dilafruz keeps writing, so the man by the scales sees a clerk at work.|Дилафруз продолжает писать, чтобы человек у весов видел: писарша работает.|Dilafruz yozishda davom etadi — tarozi yonidagi odam kotiba ishlayapti, deb ko'rsin.`, [
    { label: `— Why?|— Зачем?|— Nega?`, lines: [
      ['qb_dilafruz', `I copied the Tail's book. Three hundred and twelve households. I swore to every page. Page forty-one is my mother.|Я переписала книгу Хвоста. Триста двенадцать дворов. Под каждой страницей клялась. Сорок первая — моя мать.|Dumning daftarini men ko'chirganman. Uch yuz o'n ikki xonadon. Har bir sahifasiga qasam ichganman. Qirq birinchisi — onam.`],
      ['qb_dilafruz', `Her debt is twenty years old. The Singers wrote it the year the Tail slid. Mansur bought it for a tenth and collects it in full.|Её долгу двадцать лет. Певцы записали его в тот год, когда сполз Хвост. Мансур купил его за десятую часть, а взыскивает целиком.|Uning qarzi yigirma yillik. Xonandalar uni Dum siljigan yili yozishgan. Mansur uni o'ndan biriga sotib olib, to'liq undiryapti.`]
    ] },
    { label: `— Hamdam is dead.|— Хамдам мёртв.|— Hamdam o'ldi.`, lines: [
      ['qb_dilafruz', `I know. He was old. Old memories come out loose, like old teeth. I meant to take a year of books. The whole year came. With the stair in it.|Знаю. Он был старый. У стариков память выходит легко, как старые зубы. Я хотела взять год книг. Вышел весь год. Вместе с лестницей.|Bilaman. U qari edi. Qarilarning xotirasi eski tishdek oson chiqadi. Bir yillik daftarni olmoqchi edim. Butun yil chiqib keldi. Zinasi bilan birga.`],
      ['qb_dilafruz', `I go and sit on that step every evening. It doesn't help. I didn't think it would.|Каждый вечер хожу и сижу на той ступеньке. Не помогает. Я и не думала, что поможет.|Har kecha borib o'sha pog'onada o'tiraman. Foydasi yo'q. Bo'ladi deb o'ylamagandim ham.`]
    ] },
    { label: `— You're the last one who can swear. Why not empty yourself?|— Поклясться можешь только ты. Почему не опустошить себя?|— Qasam icha oladigan yolg'iz o'zing qolding. O'zingni nega bo'shatmading?`, lines: [
      ['qb_dilafruz', `You can't sing yourself empty. The song stops the moment you forget why you're singing. I need someone else's mouth. A yodchi's.|Себя не выпоёшь. Песня обрывается, как только забываешь, зачем поёшь. Нужен чужой рот. Рот ёдчи.|O'zingni kuylab bo'shatolmaysan. Nega kuylayotganingni unutgan zahoting qo'shiq uziladi. Boshqaning og'zi kerak. Yodchining og'zi.`],
      () => (sado() ? ['sado', `She means you. She's been waiting for you the way the boy waits for his minute.|Она про тебя. Она ждала тебя, как мальчишка ждёт свою минуту.|U seni nazarda tutyapti. Seni xuddi bola o'z daqiqasini kutgandek kutgan.`] : null)
    ] },
    { label: `— Who else is in that book?|— Кто ещё в этой книге?|— Bu daftarda yana kim bor?`, if: ismatInBook, lines: [
      ['qb_dilafruz', `Since last week? Ismat the cloth-seller, page fifty-three. His booth shut. Mansur bought his calico debt off the Divan for nothing.|С прошлой недели? Исмат, торговец бязью, страница пятьдесят третья. Будку его закрыли. Мансур выкупил его долг за бязь у Дивана за бесценок.|O'tgan haftadan beri? Bo'zfurush Ismat, ellik uchinchi sahifa. Do'koni yopildi. Mansur uning bo'z qarzini Devondan tekinga sotib oldi.`]
    ] }
  ], [
    { id: 'take', label: `"Close your eyes. Think of page one."|«Закрой глаза. Думай о первой странице.»|«Ko'zingni yum. Birinchi sahifani o'yla.»` },
    { id: 'hand', label: `"Mansur-bay! I have your name."|«Мансур-бай! Есть тебе имя.»|«Mansurboy! Ism topildi.»` },
    { id: 'deal', label: `"Swear to the book. I'll make Mansur take only what it's worth."|«Поклянись под книгой. А я заставлю Мансура взять только то, чего она стоит.»|«Daftarga qasam ich. Mansurni faqat uning haqiqiy bahosini olishga majbur qilaman.»` },
    BYE
  ], o => {
    if (o.id === 'later') { d(); return; }
    if (o.id === 'take') endTake(d);
    else if (o.id === 'hand') endHand(d);
    else dealAsk(d);
  }));

  const fin2 = (b, lines, text, deltas, d) => {
    FAC.react(deltas, 'qb2');
    play(lines.concat([
      FAC.cl('alp', { take: `An old man fell. Nobody will answer for it now. Alp does not like books. Alp does not like this either.|Старик упал. Теперь за это никто не ответит. Алп не любит книги. Это Алпу тоже не нравится.|Bir chol yiqildi. Endi buning uchun hech kim javob bermaydi. Alp daftarni yoqtirmaydi. Bu ham Alpga yoqmaydi.`, hand: `She took a year from an old man and he fell. Now she carries salt. Alp has carried salt. It is heavy.|Она забрала у старика год, и он упал. Теперь она носит соль. Алп носил соль. Она тяжёлая.|U choldan bir yilni oldi, chol yiqildi. Endi u tuz tashiydi. Alp ham tuz tashigan. Og'ir.`, deal: `Everybody pays a little. That is how Alp's caravans used to settle a fight.|Каждый платит понемногу. Так караваны Алпа раньше мирили драку.|Har kim ozgina to'laydi. Alpning karvonlari janjalni shunday yarashtirardi.` }[b]),
      FAC.cl('nargiza', { take: `You sang a whole book out of her. And she asked you to. I don't know which part makes me sicker.|Ты выпел из неё целую книгу. И она сама попросила. Не знаю, от чего мне хуже.|Undan butun bir daftarni kuylab olding. O'zi so'radi ham. Qaysi biridan ko'nglim ko'proq ayniyapti, bilmayman.`, hand: `She was in the Choir once. Too small a voice. We'd have sung together, maybe. ...Salt mines.|Она когда-то была в хоре. Голос мал. Может, мы бы с ней вместе пели. ...Соляные копи.|U bir paytlar xorda bo'lgan. Ovozi kichik. Balki birga kuylagan bo'lardik. ...Tuz konlari.`, deal: `Nobody won. That might be the fairest thing I've seen on this Bazaar.|Никто не выиграл. Может, это самое честное, что я видела на этом Базаре.|Hech kim yutmadi. Balki bu Bozorda ko'rgan eng adolatli narsam shudir.` }[b]),
      FAC.cl('surayyo', { take: `Three hundred and twelve roofs in the Tail just stopped owing. I'll carry that news myself. Running.|Триста двенадцать крыш в Хвосте только что перестали быть должны. Эту новость я понесу сама. Бегом.|Dumdagi uch yuz o'n ikki tom hozirgina qarzdan qutuldi. Bu xabarni o'zim olib boraman. Yugurib.`, hand: `Page forty-one will sell her loom to pay. I know that loom. I know that woman.|Сорок первая страница продаст станок, чтобы заплатить. Я знаю этот станок. Я знаю эту женщину.|Qirq birinchi sahifa to'lash uchun dastgohini sotadi. O'sha dastgohni bilaman. O'sha ayolni bilaman.`, deal: `Three in ten. The Tail will moan for a year and pay. Better than ten in ten.|Три десятых. Хвост год поноет и заплатит. Лучше, чем десять из десяти.|O'ndan uch. Dum bir yil nolib, to'laydi. O'ndan o'ndan yaxshi.` }[b])
    ]), () => { FAC.finish('qb2', b, text); d(); });
  };

  const endTake = d => {
    FAC.takeMem(`a clerk's book of debts|долговая книга писарши|kotibaning qarz daftari`);
    rep('tail', 2); rep('divan', -2); S2('wiped');
    play([
      ['', `She shuts her eyes. You sing low, the way you've sung in a hundred Tail doorways, and the book comes out of her page by page: names, sums, her mother's hand on page forty-one.|Она закрывает глаза. Ты поёшь тихо, как пел в сотне дверей Хвоста, и книга выходит из неё страница за страницей: имена, суммы, рука матери на сорок первой.|U ko'zini yumadi. Dumning yuzlab eshigi oldida kuylaganingdek past kuylaysan, daftar undan sahifama-sahifa chiqadi: ismlar, summalar, qirq birinchi sahifada onasining qo'li.`],
      ['', `The tumar in your palm is heavy and warm. Three hundred and twelve debts, and nobody alive who can swear to them.|Тумар на ладони тяжёлый и тёплый. Триста двенадцать долгов — и ни одного живого, кто может за них поклясться.|Kaftingdagi tumar og'ir va iliq. Uch yuz o'n ikki qarz — va ularga qasam icha oladigan bitta ham tirik odam yo'q.`]
    ], () => ask(`What's left of the Tail's book weighs about as much as a plum.|То, что осталось от книги Хвоста, весит примерно со сливу.|Dum daftaridan qolgan narsa bir olxo'richalik keladi.`, [
      FAC.craft('burn', `the book, here, on your palm|книгу — здесь, на ладони|daftarni — shu yerda, kaftingda`, { id: 'burn' }),
      { id: 'keep', label: `Put the tumar in your satchel.|Убрать тумар в сумку.|Tumarni xaltaga solib qo'yish.` }
    ], o2 => {
      if (o2.id === 'burn') { addVoid(3, `a burned book|сожжённая книга|yoqilgan daftar`); S2('burned'); }
      else S2('tumar');
      fin2('take', [
        o2.id === 'burn' ? ['', `The wax flares white. For a moment you know every name in the Tail and what each of them owes. Then you don't, and your hand smells of hot ink.|Воск вспыхивает белым. На миг ты знаешь каждое имя в Хвосте и сколько кто должен. Потом — нет, а рука пахнет горячими чернилами.|Mum oppoq lov etadi. Bir lahza Dumdagi har bir ismni va kim qancha qarzligini bilasan. Keyin — yo'q, qo'lingdan esa issiq siyoh hidi keladi.`] : ['', `You put it away. It sits in your satchel like a stone you'll have to decide about later.|Ты убираешь его. Он лежит в сумке, как камень, о котором придётся решать потом.|Uni olib qo'yasan. U xaltangda keyinroq hal qilishing kerak bo'lgan toshdek yotibdi.`],
        ['qb_mansur', `Dilafruz? The Tail's book, page one. ...Dilafruz?|Дилафруз? Книга Хвоста, страница первая. ...Дилафруз?|Dilafruz? Dum daftari, birinchi sahifa. ...Dilafruz?`],
        ['qb_dilafruz', `What book, Mansur-bay?|Какая книга, Мансур-бай?|Qaysi daftar, Mansurboy?`],
        ['', `Mansur goes grey, slowly, from the beard up. He doesn't shout. He sits down on one of the empty stools.|Мансур сереет — медленно, от бороды вверх. Он не кричит. Садится на один из пустых табуретов.|Mansur sekin, soqolidan yuqoriga qarab oqarib ketadi. Baqirmaydi. Bo'sh kursilardan biriga o'tiradi.`],
        ['qb_mansur', `You were paid to find a name, yodchi. You found a way to make me pay for one. I hope the Tail remembers you longer than it remembered its debts.|Тебе платили, чтобы ты нашёл имя, ёдчи. А ты нашёл, как заставить меня заплатить. Надеюсь, Хвост будет помнить тебя дольше, чем помнил свои долги.|Senga ism topishing uchun pul to'lashgandi, yodchi. Sen esa meni to'lashga majbur qilish yo'lini topding. Umid qilamanki, Dum seni qarzlaridan ko'ra uzoqroq eslaydi.`],
        () => (ismatInBook() ? ['', `Somewhere in Mansur's desk, page fifty-three, Ismat's calico debt is now just ink.|Где-то в столе Мансура, на пятьдесят третьей странице, долг Исмата за бязь стал просто чернилами.|Mansurning stolida, ellik uchinchi sahifada, Ismatning bo'z qarzi endi shunchaki siyoh.`] : null)
      ], `You sang the Tail's book out of Dilafruz. Nobody can swear to it now: three hundred households owe nothing. Mansur is ruined, and Hamdam's fall goes unanswered.|Ты выпел из Дилафруз книгу Хвоста. Теперь за неё никто не поклянётся: триста дворов никому ничего не должны. Мансур разорён, а за падение Хамдама никто не ответил.|Dilafruzdan Dum daftarini kuylab olding. Endi unga hech kim qasam icholmaydi: uch yuz xonadon hech kimga qarz emas. Mansur xonavayron, Hamdamning o'limi uchun hech kim javob bermadi.`, { surayyo: 15, alp: -5 }, d);
    }));
  };

  const endHand = d => {
    gold(150); rep('divan', 2); rep('tail', -2);
    fin2('hand', [
      ['qb_mansur', `Dilafruz. ...You? You, with your almonds?|Дилафруз. ...Ты? Ты, со своим миндалём?|Dilafruz. ...Senmi? Sen, bodomlaring bilan?`],
      ['qb_dilafruz', `Page forty-one, Mansur-bay. You never once read the names. Only the sums.|Сорок первая страница, Мансур-бай. Вы ни разу не читали имён. Только суммы.|Qirq birinchi sahifa, Mansurboy. Siz bir marta ham ismlarni o'qimadingiz. Faqat summalarni.`],
      ['', `The Divan's watch takes her by the elbows, politely, the way they take clerks. Before the salt mines she will swear to every page, so the book stands.|Стража Дивана берёт её под локти — вежливо, как берут писарей. Перед соляными копями она поклянётся под каждой страницей, чтобы книга устояла.|Devon soqchilari uni tirsagidan ushlashadi — mirzalarni qanday ushlashsa, shunday odob bilan. Tuz konidan oldin u har bir sahifaga qasam ichadi, toki daftar kuchda qolsin.`],
      ['qb_mansur', `A hundred and fifty, as agreed. I'll send something to Hamdam's widow. Not much. Something.|Сто пятьдесят, как договаривались. Вдове Хамдама что-нибудь пошлю. Немного. Но пошлю.|Kelishilganidek, bir yuz ellik. Hamdamning bevasiga ham biror narsa yuboraman. Ko'p emas. Lekin yuboraman.`]
    ], `You gave Dilafruz to Mansur. She swore to the book and went to the salt mines. The Tail pays in full.|Ты выдал Дилафруз Мансуру. Она поклялась под книгой и ушла на соляные копи. Хвост платит сполна.|Dilafruzni Mansurga tutib berding. U daftarga qasam ichib, tuz koniga ketdi. Dum to'liq to'laydi.`, { surayyo: -15, alp: 5, nargiza: -5 }, d);
  };

  const dealAsk = d => play([
    ['', `You call Mansur over. Dilafruz keeps writing; her pen shakes.|Ты подзываешь Мансура. Дилафруз продолжает писать, перо у неё дрожит.|Mansurni chaqirasan. Dilafruz yozishda davom etadi, qalami titraydi.`],
    ['hero', `I've found your singer, Mansur-bay. You can have her or your book. Not both.|Я нашёл твою певицу, Мансур-бай. Можешь получить её или книгу. Не то и другое.|Qo'shiqchingizni topdim, Mansurboy. Yo uni olasiz, yo daftarni. Ikkalasini emas.`]
  ], () => ask(`Mansur listens, arms folded. He hasn't decided yet whether to be angry.|Мансур слушает, сложив руки. Он ещё не решил, злиться ли.|Mansur qo'llarini qovushtirib tinglayapti. Hali jahl qilish-qilmaslikni hal qilmagan.`, [
    FAC.chk('collection', 3, `"The Singers sold you these debts for a tenth. Take three in ten and she swears to every page. Or take nothing."|«Певцы продали тебе эти долги за десятую часть. Возьми три десятых — и она поклянётся под каждой страницей. Или не возьмёшь ничего.»|«Xonandalar bu qarzlarni sizga o'ndan biriga sotgan. O'ndan uchini oling — u har bir sahifaga qasam ichadi. Bo'lmasa, hech narsa ololmaysiz.»`, { id: 'law' }, `Arithmetic|Арифметика|Hisob`),
    FAC.chk('mem', 6, `Taste the purchase out of him, aloud, for the whole row to hear: the Singers' price, and how he laughed.|Испить из него сделку — вслух, чтобы слышал весь ряд: цену Певцов и то, как он смеялся.|Bitimni undan totib olish — ovoz chiqarib, butun rasta eshitsin: Xonandalarning narxi va uning qanday kulgani.`, { id: 'shame' }, `Taste|Испить|Totib ko'rish`),
    { id: 'pay', price: 100, label: `"A hundred tilla for Hamdam's widow, from me. You don't need a culprit. You need the book to stand."|«Сто тилла вдове Хамдама — от меня. Тебе не виновный нужен. Тебе нужно, чтобы книга устояла.»|«Hamdamning bevasiga yuz tilla — mendan. Sizga aybdor kerak emas. Sizga daftar kuchda qolishi kerak.»` },
    BYE
  ], o => {
    if (o.id === 'later') { d(); return; }
    if ((o.id === 'law' || o.id === 'shame') && !o.ok) {
      play([['qb_mansur', o.id === 'law' ? `Arithmetic is my trade, yodchi, not yours. Come back when you can count.|Арифметика — моё ремесло, ёдчи, не твоё. Приходи, когда научишься считать.|Hisob — mening kasbim, yodchi, seniki emas. Sanashni o'rgangach kel.` : `You reach for me like a Singer at a debtor. In front of the whole row. No, yodchi.|Ты лезешь ко мне, как Певец к должнику. При всём ряде. Нет, ёдчи.|Menga xonanda qarzdorga qo'l cho'zgandek cho'zilyapsan. Butun rastaning oldida. Yo'q, yodchi.`]], d);
      return;
    }
    if (o.id === 'shame') addVoid(3, `someone else's memory|чужая память|birovning xotirasi`);
    rep('tail', 1); rep('divan', -1); gold(50);
    fin2('deal', [
      o.id === 'shame' ? ['', `You say it out loud: the Singers' scribe, a purse a tenth the size, Mansur laughing on the steps. The row goes quiet. Somebody spits.|Ты говоришь это вслух: писарь Певцов, кошель в десять раз меньше, Мансур смеётся на ступенях. Ряд замолкает. Кто-то сплёвывает.|Buni ovoz chiqarib aytasan: Xonandalar mirzasi, o'n barobar kichik hamyon, zinada kulayotgan Mansur. Rasta jim bo'lib qoladi. Kimdir tupuradi.`] : null,
      ['qb_mansur', `Three in ten. Not a grain less. And she copies for me five years without pay. Hamdam deserves at least that much.|Три десятых. Ни зерна меньше. И она пять лет переписывает на меня без жалованья. Хамдам хоть этого заслуживает.|O'ndan uch. Bir dona ham kam emas. Va u besh yil menga tekin ko'chiradi. Hamdam hech bo'lmasa shunga loyiq.`],
      ['qb_mansur', `Fifty for you. You found a name and then hid it behind a sum. I pay for names.|Тебе пятьдесят. Ты нашёл имя, а потом спрятал его за цифрой. Я плачу за имена.|Senga ellik. Ismni topding-u, keyin uni raqam orqasiga yashirding. Men ism uchun to'layman.`],
      ['qb_dilafruz', `My mother will pay three in ten. She'll still have to sell something. ...Thank you. I don't know yet if I mean it.|Мать заплатит три десятых. Ей всё равно придётся что-то продать. ...Спасибо. Пока не знаю, всерьёз ли.|Onam o'ndan uchini to'laydi. Baribir nimanidir sotishiga to'g'ri keladi. ...Rahmat. Chin dildanmi, hali bilmayman.`]
    ], `Dilafruz swore to the book. Mansur collects three in ten from the Tail, and she copies for him five years unpaid. Hamdam's fall stays nobody's.|Дилафруз поклялась под книгой. Мансур берёт с Хвоста три десятых, а она пять лет переписывает на него без жалованья. Падение Хамдама так и осталось ничьим.|Dilafruz daftarga qasam ichdi. Mansur Dumdan o'ndan uchini oladi, u esa besh yil unga tekin ko'chiradi. Hamdamning o'limi hech kimning bo'yniga tushmadi.`, { surayyo: 5, alp: 5, nargiza: 5 }, d);
  }));

  FAC.talk.qb_dilafruz = d => {
    const b = br('qb2');
    if (b) {
      play([['qb_dilafruz', {
        hand: `Salt gets in the ink. I write the overseers' tallies. Page forty-one: my mother paid. She sold the loom.|Соль лезет в чернила. Пишу надсмотрщикам счёт. Сорок первая страница: мать заплатила. Продала станок.|Tuz siyohga kiradi. Nazoratchilarga hisob yozaman. Qirq birinchi sahifa: onam to'ladi. Dastgohini sotdi.`,
        take: `An old man fell on these steps because of me. That I remember. What I did it for, I don't. Every evening I come and try.|Из-за меня на этих ступенях упал старик. Это я помню. Ради чего — не помню. Каждый вечер прихожу и пытаюсь вспомнить.|Mening dastimdan shu zinada bir chol yiqildi. Buni eslayman. Nima uchun qilganimni eslamayman. Har kecha kelib, eslashga urinaman.`,
        deal: `Year one of five. He pays me in tea now. Sugared almonds, too, sometimes. I can't eat them.|Первый год из пяти. Платит мне теперь чаем. Иногда ещё засахаренным миндалём. Я его есть не могу.|Beshdan birinchi yil. Endi menga choy bilan to'laydi. Ba'zan qandlangan bodom ham. Uni yeyolmayman.`
      }[b] || `…|…|…`]], d);
      return;
    }
    if (act('qb2') && B2('reg')) { confront2(d); return; }
    play([['qb_dilafruz', `Mansur-bay's orders: I talk to nobody while the ink is wet. It's always wet.|Приказ Мансур-бая: пока чернила не высохли, я ни с кем не говорю. Они никогда не высыхают.|Mansurboyning buyrug'i: siyoh qurimaguncha hech kim bilan gaplashmayman. U hech qachon qurimaydi.`]], d);
  };

  FAC.talk.qb_mansur = d => {
    const b = br('qb2');
    if (b === 'take' && B2('tumar') && !B2('sold')) {
      play([
        ['qb_mansur', `I hear you kept something, yodchi. A tumar the weight of a plum. Plant it into a new clerk and he swears to every page as if he'd copied it himself.|Слышал, ты кое-что оставил себе, ёдчи. Тумар весом со сливу. Вселить его в нового писаря — и он поклянётся под каждой страницей, будто сам переписывал.|Eshitishimcha, nimanidir o'zingda qoldiribsan, yodchi. Olxo'richalik tumar. Uni yangi mirzaga joylasang, har bir sahifaga xuddi o'zi ko'chirgandek qasam ichadi.`],
        ['qb_mansur', `Two hundred. More than I paid you for anything. I'll even forgive you the first time.|Двести. Больше, чем я тебе платил за что бы то ни было. Даже первый раз прощу.|Ikki yuz. Senga biror narsa uchun to'laganimdan ko'p. Hatto birinchi safarini ham kechiraman.`]
      ], () => ask(`The tumar is warm in your satchel.|Тумар тёплый у тебя в сумке.|Tumar xaltangda iliq.`, [
        { id: 'sell', label: `Put the tumar on his desk.|Положить тумар ему на стол.|Tumarni uning stoliga qo'yish.` },
        { id: 'no', label: `"It stays with me."|«Он останется у меня.»|«U menda qoladi.»` }
      ], o => {
        if (o.id !== 'sell') { play([['qb_mansur', `Then carry it, yodchi. Three hundred and twelve households in your bag. I hope it's heavy.|Тогда носи, ёдчи. Триста двенадцать дворов у тебя в сумке. Надеюсь, тяжело.|Unda ko'tarib yur, yodchi. Xaltangda uch yuz o'n ikki xonadon. Og'ir bo'lsin.`]], d); return; }
        S2('sold'); gold(200); rep('tail', -3); rep('divan', 2);
        FAC.react({ surayyo: -25, nargiza: -10 }, 'qb2');
        play([
          ['', `He weighs it on his palm like a coin he doesn't trust, and smiles for the first time since you met him.|Он взвешивает его на ладони, как монету, которой не доверяет, и улыбается — впервые с тех пор, как вы знакомы.|U uni ishonmagan tangasidek kaftida tortib ko'radi va tanishganingizdan beri birinchi marta jilmayadi.`],
          FAC.cl('surayyo', `You took it out of her to free the Tail and sold it back to him. Don't talk to me today.|Ты вынул это из неё, чтобы освободить Хвост, и продал ему обратно. Не говори со мной сегодня.|Buni Dumni ozod qilish uchun undan olding va unga qaytarib sotding. Bugun men bilan gaplashma.`)
        ], d);
      }));
      return;
    }
    if (b) {
      play([['', {
        take: B2('sold') ? `Mansur-bay has a new clerk, a boy who swears to every page and doesn't know why his hands shake.|У Мансур-бая новый писарь — мальчишка, который клянётся под каждой страницей и не знает, почему у него трясутся руки.|Mansurboyning yangi mirzasi bor — har bir sahifaga qasam ichadigan va qo'llari nega titrashini bilmaydigan bola.` : `Mansur-bay is selling his desk. Then the stools. When you pass again he is sitting on the ground, selling the awning.|Мансур-бай продаёт стол. Потом табуреты. Когда ты проходишь снова, он сидит на земле и продаёт навес.|Mansurboy stolini sotyapti. Keyin kursilarni. Yana o'tganingda u yerda o'tirib, soyabonni sotyapti.`,
        hand: `"The Tail pays. Slowly, with curses, but it pays." Mansur-bay doesn't look at the empty stool at the end of his desk.|«Хвост платит. Медленно, с проклятиями, но платит». На пустой табурет в конце стола Мансур-бай не смотрит.|«Dum to'layapti. Sekin, la'nat o'qib, lekin to'layapti». Mansurboy stol chetidagi bo'sh kursiga qaramaydi.`,
        deal: `"Three in ten," Mansur-bay says instead of hello. "My daughters will marry poorer men. Healthy ones, I hope."|«Три десятых», — говорит Мансур-бай вместо приветствия. «Дочери выйдут за людей победнее. Надеюсь, хоть за здоровых».|«O'ndan uch», — deydi Mansurboy salom o'rniga. «Qizlarim kambag'alroq odamlarga turmushga chiqadi. Hech bo'lmasa sog'lomlariga, deb umid qilaman».`
      }[b] || `…|…|…`]], d);
      return;
    }
    if (q('qb2').st === 'none') { offer2(d); return; }
    play([['qb_mansur', B2('reg') ? `You've the look of a man who knows something. Then say it to me, not to my clerk.|У тебя вид человека, который что-то знает. Так скажи мне, а не моей писарше.|Biror narsani biladigan odamning qiyofasi bor senda. Unda menga ayt, kotibamga emas.` : `A name, yodchi. Not a mask. You promised me a name.|Имя, ёдчи. Не маску. Ты обещал мне имя.|Ism, yodchi. Niqob emas. Menga ism va'da qilgansan.`]], d);
  };

  SIDE.epi('qb2', () => {
    const b = br('qb2');
    if (b === 'take') return B2('sold')
      ? `Mansur planted the Tail's book into a new clerk, a boy who swore to every page and never learned why his hands shook. The Tail paid.|Мансур вселил книгу Хвоста в нового писаря — мальчишку, который клялся под каждой страницей и так и не узнал, почему у него трясутся руки. Хвост заплатил.|Mansur Dum daftarini yangi mirzaga joyladi — har bir sahifaga qasam ichgan va qo'llari nega titrashini hech qachon bilmagan bolaga. Dum to'ladi.`
      : `The Tail's old book stayed paper. Three hundred households owed nothing and believed it slowly. Dilafruz sat on the Singers' stair every evening until someone sat down beside her.|Старая книга Хвоста так и осталась бумагой. Триста дворов ничего не были должны и верили в это медленно. Дилафруз каждый вечер сидела на лестнице Певцов, пока рядом кто-то не сел.|Dumning eski daftari qog'ozligicha qoldi. Uch yuz xonadon hech kimga qarz emas edi va bunga sekin-asta ishonishdi. Dilafruz har kecha Xonandalar zinasida o'tirdi, toki yoniga kimdir kelib o'tirmaguncha.`;
    return {
      hand: `Dilafruz kept the salt overseers' tallies for nine years. Her mother paid page forty-one by selling her loom. Mansur's daughters married well.|Дилафруз девять лет вела счёт надсмотрщикам соляных копей. Мать оплатила сорок первую страницу, продав станок. Дочери Мансура удачно вышли замуж.|Dilafruz to'qqiz yil tuz koni nazoratchilarining hisobini yuritdi. Onasi qirq birinchi sahifani dastgohini sotib to'ladi. Mansurning qizlari yaxshi joyga turmushga chiqdi.`,
      deal: `The Tail paid three in ten and grumbled for a generation. Dilafruz copied for Mansur five years unpaid, and the sixth for double. Nobody ever answered for Hamdam.|Хвост заплатил три десятых и ворчал целое поколение. Дилафруз пять лет переписывала на Мансура бесплатно, а шестой — за двойную плату. За Хамдама так никто и не ответил.|Dum o'ndan uchini to'ladi va bir avlod davomida to'ng'illadi. Dilafruz besh yil Mansurga tekin ko'chirdi, oltinchisida ikki barobar haq oldi. Hamdam uchun hech kim javob bermadi.`
    }[b] || null;
  }, 'mehri:books');
}
