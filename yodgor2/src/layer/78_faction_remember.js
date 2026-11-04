/* =====================================================================
   Stage 6 — Those Who Remember: "Truth at any price" (GDD ch. 6).
     r1 The Return               Bazaar (night) → Tail   Zulfiya; Tursun-bobo; the wrong tumar
     r2 The Karez Storehouse     the upper karez         Lola; Tail men guarding the Divan's tumars (stealth)
     r3 The Fugitives            the Cloister at night   three debtors, one of them a Singers' spy
     r4 The Price of Truth       karez → Bazaar          the fire in the cloth row; the double-play check
     r5 The Mask                 Old Yodgor              the story's unmasking (F().oydin) makes the arc personal
     r6 The Awakening            the Dream               break the tumars with Oydin, or fight her
   Spoiler rule (STYLE §8): before Old Yodgor the leader is only "the masked woman".
   ===================================================================== */
{
  const cat3 = FAC.cat3, cl = FAC.cl, moon = () => (G.WORLD2 ? G.WORLD2.moonPhase() : 0);
  const q = FAC.q, done = FAC.isDone, act = FAC.isActive;
  const open = () => !FAC.arcClosed('remember');
  const unmasked = () => !!F().oydin;
  const lead = () => (unmasked() ? 'oydin' : 'masked');
  CAST.zulfiya = { name: `Zulfiya, the night trader|Зульфия, ночная торговка|Tungi savdogar Zulfiya`, portrait: 'gulnora' };
  CAST.tursun = { name: `Tursun-bobo|Турсун-бобо|Tursun bobo`, portrait: null };
  CAST.dilnoza = { name: `Dilnoza|Дильноза|Dilnoza`, portrait: null };
  CAST.lola = { name: `Lola|Лола|Lola`, portrait: null };
  CAST.rahim = { name: `Rahim, a Tail man in Divan red|Рахим, парень из Хвоста в красном Дивана|Devon qizilidagi dumlik Rahim`, portrait: null };
  CAST.olim = { name: `Olim, a debtor|Должник Олим|Qarzdor Olim`, portrait: null };
  CAST.nasiba = { name: `Nasiba, a debtor|Должница Насиба|Qarzdor Nasiba`, portrait: null };
  CAST.hayot = { name: `Hayot, a debtor|Должник Хаёт|Qarzdor Hayot`, portrait: null };
  const LK = {
    zulfiya: { robe: '#2a1a2a', trim: '#8a2a3a', skin: '#c8a080', head: 'scarf', headC: '#1a0e14' },
    tursun: { robe: '#6a5a4a', trim: '#a89a7a', skin: '#a07858', head: 'doppi', headC: '#2a2a2a', beard: 'long', scale: 0.96 },
    dilnoza: { robe: '#5a7a8a', trim: '#e8d8c0', skin: '#c8a080', head: 'scarf', headC: '#d8c8a8' },
    lola: { robe: '#3a2420', trim: '#c84a2a', skin: '#b08868', head: 'hood', headC: '#2a1814' },
    rahim: { robe: '#6a1a1a', trim: '#e2b452', skin: '#a07858', head: 'doppi', headC: '#3a1a1a' },
    olim: { robe: '#5a5a60', trim: '#8a8a90', skin: '#a08068', head: 'doppi', headC: '#2a2a2a', beard: 'short' },
    nasiba: { robe: '#6a4a5a', trim: '#a88a9a', skin: '#c8a080', head: 'scarf', headC: '#4a3a4a' },
    hayot: { robe: '#4a5a4a', trim: '#8a9a8a', skin: '#b09070', head: 'doppi', headC: '#1a2a1a' }
  };
  FAC.quest('r1', { fac: 'remember', n: 1, title: `The Return|Возврат|Qaytarish`, where: ['bazaar', 'cloth'], offer: () => open() && moon() <= 1 && FAC.atLeast('remember', 'stranger') });
  FAC.quest('r2', { fac: 'remember', n: 2, title: `The Karez Storehouse|Склад в кяризах|Korizdagi ombor`, where: ['karez', 'f_store'], offer: () => open() && done('r1') && moon() <= 1 && FAC.atLeast('remember', 'own') });
  FAC.quest('r3', { fac: 'remember', n: 3, title: `The Fugitives|Беглецы|Qochoqlar`, where: ['cloister', 'books'], offer: () => open() && done('r2') && moon() <= 1 && FAC.atLeast('remember', 'own') });
  FAC.quest('r4', { fac: 'remember', n: 4, title: `The Price of Truth|Цена правды|Haqiqat narxi`, where: ['karez', 'den'], offer: () => open() && done('r3') && moon() <= 1 && FAC.atLeast('remember', 'own') });
  FAC.quest('r5', { fac: 'remember', n: 5, title: `The Mask|Маска|Niqob`, where: ['old', 'dome'], offer: () => open() && done('r4') && G.WORLD2.story.done('a2_old') && moon() <= 1 });
  FAC.quest('r6', { fac: 'remember', n: 6, title: `The Awakening|Пробуждение|Uyg'onish`, where: ['dream', 'f_final'], offer: () => open() && done('r5') && FAC.br('r5') !== 'took' && moon() >= 2 && FAC.atLeast('remember', 'trusted') });

  FAC.spot('karez', 'f_store', 0.84);
  FAC.npc('zulfiya', { name: CAST.zulfiya.name, look: LK.zulfiya, dx: 46, idle: `Zulfiya rearranges forbidden things on a black cloth and doesn't look at you.|Зульфия перекладывает запретные вещицы на чёрном платке и на тебя не смотрит.|Zulfiya qora ro'mol ustidagi taqiqlangan buyumlarni taxlaydi va senga qaramaydi.` },
    () => (moon() <= 1 ? [{ from: 22, to: 4, region: 'bazaar', spot: 'cloth' }] : []));
  FAC.npc('tursun', { name: CAST.tursun.name, look: LK.tursun, dx: 40, idle: `Tursun-bobo talks to the washing on the line. It doesn't answer, which suits him.|Турсун-бобо разговаривает с бельём на верёвке. Оно не отвечает, его это устраивает.|Tursun bobo arqondagi kirlar bilan gaplashyapti. Ular javob bermaydi, bu unga ma'qul.` },
    () => (moon() <= 1 ? [{ from: 15, to: 23, region: 'tail', spot: 'ropes' }] : []));
  FAC.npc('dilnoza', { name: CAST.dilnoza.name, look: LK.dilnoza, dx: 44, idle: `Dilnoza beats a rug as if it owed her money.|Дильноза выбивает ковёр так, будто он ей должен.|Dilnoza gilamni xuddi unga qarzdordek qoqyapti.` },
    () => ((act('r1') && FAC.flag('r1tasted')) || FAC.br('r1') === 'owner') && moon() <= 1 ? [{ from: 7, to: 20, region: 'tail', spot: 'yard_gate' }] : []);
  FAC.npc('lola', { name: CAST.lola.name, look: LK.lola, dx: 60, idle: `Lola is cleaning a lamp. Very thoroughly. You get the feeling it's not about the lamp.|Лола чистит лампу. Очень тщательно. Кажется, дело не в лампе.|Lola chiroqni tozalayapti. Juda sinchiklab. Gap chiroqda emasga o'xshaydi.` },
    () => (!done('r1') || moon() >= 2) ? [] : (moon() === 1 && G.WORLD2.story.done('a2_old')) ? [{ from: 0, to: 24, region: 'old', spot: 'dome' }] : [{ from: 0, to: 24, region: 'karez', spot: 'den' }]);
  FAC.npc('rahim', { name: CAST.rahim.name, look: LK.rahim, dx: -70, idle: `Rahim leans on his spear and yawns.|Рахим опирается на копьё и зевает.|Rahim nayzasiga suyanib esnaydi.` },
    () => (act('r2') && !FAC.flag('r2gone') ? [{ from: 0, to: 24, region: 'karez', spot: 'f_store' }] : []));
  for (const [id, dx] of [['olim', -44], ['nasiba', 0], ['hayot', 44]]) FAC.npc(id, { name: CAST[id].name, look: LK[id], dx, idle: `They keep their eyes on the ground and their bundles close.|Смотрят в землю и прижимают узелки к себе.|Yerga qarab, tugunlarini bag'riga bosib turishibdi.` },
    () => (act('r3') ? [{ from: 20, to: 5, region: 'cloister', spot: 'books' }] : []));
  FAC.npc('oydin6', { name: CAST.oydin.name, look: 'oydin', dx: 70, idle: `Oydin hums under her breath, and stops when she sees you looking.|Ойдин что-то напевает себе под нос и умолкает, заметив твой взгляд.|Oydin xirgoyi qilyapti, qarayotganingni ko'rib, jim bo'lib qoladi.` },
    () => (done('r5') && FAC.br('r5') !== 'took' && !done('r6') && moon() >= 2 ? [{ from: 0, to: 24, region: 'dream', spot: 'f_final' }] : []));

  /* ================================================================ r1 · The Return */
  const r1Offer = d => play([
    ['', `A black cloth on the ground, and on it: wax that isn't white, charms with no maker's mark, a lockpick laid out like a pen.|На земле чёрный платок, на нём: воск не того цвета, обереги без клейма мастера, отмычка, уложенная, как перо.|Yerda qora ro'mol, ustida: oq bo'lmagan mum, ustaning tamg'asi yo'q tumorlar, qalamdek qo'yilgan shaqildoq.`],
    ['zulfiya', `A yodchi at my cloth. You collect memories for a living. Try giving one back for once. Quietly.|Ёдчи у моего платка. Ты собираешь память на жизнь. Попробуй хоть раз её вернуть. Тихо.|Ro'molim yonida yodchi. Sen xotira yig'ib kun ko'rasan. Bir marta bo'lsa ham qaytarib ko'r. Jimgina.`],
    ['zulfiya', `Tursun-bobo, in the Tail. Forty years ago he sold his wedding day to pay for his son's fever. The son's long dead. Put the wedding back in his hand. He won't notice how; he talks to the washing.|Турсун-бобо, в Хвосте. Сорок лет назад продал день своей свадьбы, чтобы оплатить лечение сына от горячки. Сына давно нет. Верни ему свадьбу в руку. Как — он не заметит: он с бельём разговаривает.|Dumdagi Tursun bobo. Qirq yil oldin o'g'lining isitmasini davolash uchun to'y kunini sotgan. O'g'li allaqachon yo'q. To'yini qo'liga qaytar. Qanday qilib — sezmaydi: u kirlar bilan gaplashadi.`]
  ], () => hub('', [
    { label: `— Who are you people?|— Кто вы такие?|— Sizlar kimsizlar?`, lines: [['zulfiya', `People who think what's taken should go home. Tonight that's all you need to know. Tomorrow, maybe a little more.|Люди, которые считают, что взятое должно вернуться домой. Сегодня тебе этого хватит. Завтра, может, узнаешь чуть больше.|Olingan narsa uyiga qaytishi kerak, deb hisoblaydigan odamlar. Bugun senga shu yetarli. Ertaga, balki, sal ko'proq bilarsan.`]] },
    { label: `— Where did you get his tumar?|— Откуда у вас его тумар?|— Uning tumari sizda qayerdan?`, lines: [['zulfiya', `From a Divan shelf that won't miss it. Don't ask the next question. I won't like it and neither will you.|С полки Дивана, которая по нему не заскучает. Следующего вопроса не задавай. Он не понравится ни мне, ни тебе.|Devonning uni sog'inmaydigan tokchasidan. Keyingi savolni berma. U menga ham, senga ham yoqmaydi.`]] }
  ], [{ id: 'yes', label: `Take the tumar.|Взять тумар.|Tumarni olish.` }, { id: 'no', label: `"Find another errand boy."|«Найдите другого мальчика на побегушках.»|«Boshqa chopar toping.»` }], o => {
    if (o.id === 'yes') FAC.begin('r1', `Zulfiya gave you Tursun-bobo's wedding day to return. He sits by the washing lines in the Tail, evenings.|Зульфия дала тебе день свадьбы Турсуна-бобо, чтобы вернуть. По вечерам он сидит у бельевых верёвок в Хвосте.|Zulfiya Tursun boboga qaytarish uchun uning to'y kunini berdi. U kechqurunlari Dumdagi kir arqonlari yonida o'tiradi.`, ['tail', 'ropes']);
    d();
  }));
  const r1Tursun = d => play([
    ['tursun', `Hm? A yodchi? I've paid. I always pay. What's left of me isn't worth the wax.|А? Ёдчи? Я заплатил. Я всегда плачу. То, что от меня осталось, воска не стоит.|Ha? Yodchimi? To'laganman. Doim to'layman. Mendan qolgani mumga ham arzimaydi.`],
    ['hero', `I've brought you something back. Your wedding day.|Я тебе кое-что принёс. День твоей свадьбы.|Senga bir narsa olib keldim. To'y kuningni.`],
    ['tursun', `Wedding? Son, I never married. The boy with the fever was my brother's. I raised him. I sold my first harvest for him, a field of melons.|Свадьбу? Сынок, я никогда не был женат. Мальчик с горячкой был братов. Я его растил. Я продал за него свой первый урожай — поле дынь.|To'ymi? O'g'lim, men hech qachon uylanmaganman. Isitmali bola akamniki edi. Men boqib katta qildim. U uchun birinchi hosilimni sotganman — bir dala qovun.`],
    () => (sadoAwake() ? ['sado', `Then whose wedding is in your pocket?|Тогда чья свадьба у тебя в кармане?|Unda cho'ntagingdagi kimning to'yi?`] : null)
  ], () => {
    FAC.stepTo('r1', `The tumar isn't Tursun-bobo's. Someone mixed up the tags. Decide what to do with a stranger's wedding.|Тумар не Турсуна-бобо. Кто-то перепутал бирки. Реши, что делать с чужой свадьбой.|Tumar Tursun boboniki emas. Kimdir yorliqlarni chalkashtirgan. Begona to'y bilan nima qilishni hal qil.`, ['tail', 'ropes']);
    ask(`The tumar is warm, and it isn't his.|Тумар тёплый, и он не его.|Tumar iliq, va u uniki emas.`, [
      { id: 'truth', label: `"It isn't yours. I'm sorry, bobo."|«Это не твоё. Прости, бобо.»|«Bu seniki emas. Kechir, bobo.»` },
      FAC.craft('plant', `Let him believe it's his. Sing it into him with the tag he expects.|Пусть поверит, что это его. Вселить с той биркой, какую он ждёт.|U buni o'ziniki deb ishonsin. U kutgan yorliq bilan joylash.`, { id: 'planted' }),
      FAC.craft('taste', `Taste the wedding and find whose it is.|Испить свадьбу и узнать, чья она.|To'yni totib ko'rib, kimniki ekanini bilish.`, { id: 'taste', hide: !!FAC.flag('r1tasted') }),
      { id: 'sold', label: `Sell it at the Bazaar. A wedding fetches forty tilla.|Продать на Базаре. Свадьба стоит сорок тилла.|Bozorda sotish. To'y qirq tilla turadi.` }
    ], o => {
      if (o.id === 'truth') { FAC.add('remember', 8); FAC.add('tail', 2); trust(1); FAC.finish('r1', 'truth', `You told Tursun-bobo the truth: the tumar isn't his. He was left with nothing, and thanked you.|Ты сказал Турсуну-бобо правду: тумар не его. Ему не осталось ничего, и он поблагодарил.|Tursun boboga rostini aytding: tumar uniki emas. Unga hech narsa qolmadi, u esa rahmat aytdi.`); play([['tursun', `Then I've got nothing. Thank you for the honesty, son. It's cheaper than wax, and it keeps.|Значит, у меня ничего нет. Спасибо за честность, сынок. Она дешевле воска и не портится.|Demak, menda hech narsa yo'q. Halolliging uchun rahmat, o'g'lim. U mumdan arzon va buzilmaydi.`]], d); return; }
      if (o.id === 'planted') { FAC.plant(); FAC.add('remember', -4); FAC.add('tail', 6); FAC.flag('r1', 'planted'); FAC.finish('r1', 'planted', `You sang a stranger's wedding into Tursun-bobo. He weeps over a bride he never had.|Ты вселил Турсуну-бобо чужую свадьбу. Он плачет над невестой, которой у него не было.|Tursun boboga birovning to'yini joylading. U o'zida bo'lmagan kelin uchun yig'layapti.`); play([['tursun', `Her hands. Oh, her hands were cold, and she laughed at me for being shy. How did I forget? How did I ever forget?|Её руки. Ох, руки у неё были холодные, а она смеялась, что я стесняюсь. Как я мог забыть? Как я вообще мог забыть?|Uning qo'llari. Voy, qo'llari sovuq edi, u esa uyalganimga kulardi. Qanday unutdim? Umuman qanday unutishim mumkin edi?`], ['zulfiya', `We return memories, yodchi. We don't counterfeit them. Word gets around below.|Мы возвращаем память, ёдчи. Мы её не подделываем. Внизу об этом узнают.|Biz xotirani qaytaramiz, yodchi. Uni qalbakilashtirmaymiz. Pastdagilar bundan xabar topadi.`]], d); return; }
      if (o.id === 'sold') { gold(40); FAC.add('remember', -10); FAC.finish('r1', 'sold', `You sold the stranger's wedding at the Bazaar for forty tilla.|Ты продал чужую свадьбу на Базаре за сорок тилла.|Begona to'yni Bozorda qirq tillaga sotding.`); play([['', `The buyer holds it up to the light like a melon. "Nice and fresh. Somebody's wedding. Lucky somebody."|Покупатель смотрит его на свет, как дыню. «Свеженькая. Чья-то свадьба. Повезло кому-то».|Xaridor uni qovundek yorug'likka tutib qaraydi. «Yangigina. Kimningdir to'yi. Kimningdir omadi kelgan».`]], d); return; }
      FAC.flag('r1tasted', 1);
      FAC.taste([
        ['memory', `A courtyard under a vine. A bride with cold hands. A drum that splits on the third song, and everyone laughs.|Двор под виноградом. Невеста с холодными руками. Бубен лопается на третьей песне, и все смеются.|Tok ostidagi hovli. Qo'llari sovuq kelin. Uchinchi qo'shiqda doira yoriladi va hamma kuladi.`],
        ['memory', `"Saida," says the groom. Later, a girl of six runs between the guests with a bowl of plov too big for her. "Dilnoza! Not on the carpet!"|«Саида», — говорит жених. Потом между гостями бегает девочка лет шести с огромной для неё миской плова. «Дильноза! Только не на ковёр!»|«Saida», deydi kuyov. Keyin mehmonlar orasida olti yoshli qiz o'ziga katta kosada osh ko'tarib yuguradi. «Dilnoza! Gilamga emas!»`]
      ], () => { FAC.stepTo('r1', `The wedding belonged to Saida, who died last winter. Her daughter Dilnoza lives by the yard gate in the Tail.|Свадьба принадлежала Саиде, умершей прошлой зимой. Её дочь Дильноза живёт у дворовых ворот в Хвосте.|To'y o'tgan qish vafot etgan Saidaniki ekan. Uning qizi Dilnoza Dumda hovli darvozasi yonida yashaydi.`, ['tail', 'yard_gate']); d(); });
    });
  });
  const r1Dilnoza = d => play([
    ['dilnoza', `Mother's wedding? She sold it the year of the bad melons. She told me about it every evening after, so I'd remember for both of us.|Мамина свадьба? Она продала её в год плохих дынь. Потом каждый вечер мне о ней рассказывала, чтобы я помнила за двоих.|Onamning to'yimi? U uni qovun yomon bo'lgan yili sotgan. Keyin har oqshom menga gapirib berardi — ikkalamiz uchun eslab qolishim uchun.`],
    ['dilnoza', `The drum split, didn't it. On the third song. ...Give it here. Please.|Бубен ведь лопнул, да? На третьей песне. ...Дай сюда. Пожалуйста.|Doira yorilgan edi-a? Uchinchi qo'shiqda. ...Bu yoqqa ber. Iltimos.`]
  ], () => ask('', [
    { id: 'owner', label: `Give it to Dilnoza.|Отдать Дильнозе.|Dilnozaga berish.` },
    { id: 'tursun', label: `"Tursun-bobo has nothing at all. You have the stories."|«У Турсуна-бобо нет совсем ничего. А у тебя есть рассказы.»|«Tursun boboda umuman hech narsa yo'q. Senda esa hikoyalar bor.»` }
  ], o => {
    if (o.id === 'owner') { FAC.add('remember', 10); FAC.add('tail', 4); FAC.finish('r1', 'owner', `You found the wedding's owner: Saida's daughter Dilnoza. Tursun-bobo got nothing back.|Ты нашёл хозяйку свадьбы — дочь Саиды, Дильнозу. Турсун-бобо не получил ничего.|To'yning egasini topding — Saidaning qizi Dilnozani. Tursun bobo hech narsa olmadi.`); play([['', `Dilnoza holds the tumar to her cheek, not her lips. She won't taste it. She only wants to know it's in the house.|Дильноза прижимает тумар к щеке, не к губам. Пробовать не станет. Ей нужно лишь знать, что он в доме.|Dilnoza tumarni labiga emas, yuziga bosadi. Totib ko'rmaydi. Unga faqat uning uyda ekanini bilish kerak.`], ['zulfiya', `The right house. Good. That's harder than it sounds, and rarer.|В правильный дом. Хорошо. Это труднее, чем кажется. И реже.|To'g'ri uyga. Yaxshi. Bu o'ylagandan qiyinroq. Va kamroq uchraydi.`]], d); return; }
    FAC.plant(); FAC.add('remember', -2); FAC.add('tail', 6); FAC.finish('r1', 'planted', `You talked Dilnoza out of her mother's wedding and sang it into Tursun-bobo.|Ты уговорил Дильнозу отказаться от маминой свадьбы и вселил её Турсуну-бобо.|Dilnozani onasining to'yidan voz kechishga ko'ndirib, uni Tursun boboga joylading.`);
    play([['dilnoza', `...He's lonely. I know. Mother would have fed him. Fine. Take it to him. I'll keep the stories.|...Ему одиноко. Знаю. Мама бы его накормила. Ладно. Неси ему. Рассказы я оставлю себе.|...U yolg'iz. Bilaman. Onam uni mehmon qilardi. Mayli. Unga olib bor. Hikoyalar menda qoladi.`]], d);
  }));
  FAC.talk.tursun = d => { if (act('r1') && !FAC.flag('r1met')) { FAC.flag('r1met', 1); r1Tursun(d); return; } if (act('r1') && !FAC.flag('r1tasted')) { r1Tursun(d); return; } const b = FAC.br('r1'); play([['tursun', b === 'planted' ? `She had cold hands, my bride. Did I tell you? Sit, I'll tell you.|Руки у неё были холодные, у моей невесты. Я рассказывал? Садись, расскажу.|Kelinimning qo'llari sovuq edi. Aytib bermaganmidim? O'tir, aytib beraman.` : `The washing's dry. Nobody else noticed.|Бельё высохло. Никто, кроме меня, не заметил.|Kirlar qurib qoldi. Mendan boshqa hech kim sezmadi.`]], d); };
  FAC.talk.dilnoza = d => { if (act('r1') && FAC.flag('r1tasted')) { r1Dilnoza(d); return; } play([['', FAC.br('r1') === 'owner' ? `Dilnoza nods at you over the rug. There's a tumar on a nail above her door.|Дильноза кивает тебе через ковёр. Над её дверью на гвозде висит тумар.|Dilnoza gilam osha senga bosh irg'aydi. Eshigi tepasidagi mixda tumar osig'liq.` : FAC.NPC.dilnoza.def.idle]], d); };

  /* ================================================================ r2 · The Karez Storehouse */
  const r2Offer = d => play([
    ['zulfiya', `You return things well. Now take some. The Divan keeps fresh tumars in an old cistern room under the Bazaar before they go up to the cellars.|Возвращаешь ты хорошо. Теперь забери кое-что. Свежие тумары Диван держит в старой цистерне под Базаром, прежде чем поднять их в погреба.|Qaytarishni yaxshi uddalaysan. Endi bir narsa olib kel. Devon yangi tumarlarni yerto'lalarga ko'tarishdan oldin Bozor ostidagi eski sardobada saqlaydi.`],
    ['zulfiya', `Lola will meet you below. One thing: the guards are Tail boys in Divan red. They took the job because the Divan pays in water.|Внизу тебя встретит Лола. Одно учти: стерегут там парни из Хвоста в красном Дивана. Пошли на службу, потому что Диван платит водой.|Pastda seni Lola kutib oladi. Bir narsani unutma: u yerni Devon qizilidagi dumlik yigitlar qo'riqlaydi. Devon suv bilan to'lagani uchun xizmatga kirishgan.`]
  ], () => { FAC.begin('r2', `Empty the Divan's tumar store in the karez, under the Bazaar. The guards are Tail men.|Опустошить склад тумаров Дивана в кяризах, под Базаром. Охрана — парни из Хвоста.|Korizda, Bozor ostidagi Devonning tumar omborini bo'shatish. Qo'riqchilar — dumlik yigitlar.`, ['karez', 'f_store']); d(); });
  // the guards: two Tail men in Divan red, unaware until they see or hear him (79's stealth)
  s6init(() => {
    G.WORLD2.onEnter('karez', (def, info) => {
      if (!act('r2') || FAC.flag('r2gone') || FAC.flag('r2looted')) return;
      const at = info.level.w2.spots && info.level.w2.spots.f_store; if (!at) return;
      for (const dx of [-90, 70]) {
        const e = G.Enemies.spawn('guard', at.x + dx, at.y - 4);
        if (e) { e._f6tail = 1; e._f6guard = 'r2'; e._s6aware = 0; e.facing = dx < 0 ? -1 : 1; e._w2id = 'f6g' + dx; }
      }
    });
  });
  const r2Guards = () => (G.world ? G.world.ents.filter(e => e && e._f6guard === 'r2') : []);
  FAC.prop('karez', 'f_store', {
    id: 'r2door', art: 'f6chest', dx: 10, prompt: `The Divan's storehouse|Склад Дивана|Devon ombori`,
    when: () => act('r2') && !FAC.flag('r2looted'),
    use: d => {
      const gs = r2Guards(), alive = gs.filter(e => !e.dead && e.hp > 0), dead = gs.length - alive.length;
      const seen = alive.some(e => (e._s6aware || 0) >= 1);
      if (alive.length && seen && !FAC.flag('r2gone')) { play([['', `A guard is looking straight at you. Not now.|Охранник смотрит прямо на тебя. Не сейчас.|Qo'riqchi to'ppa-to'g'ri senga qarab turibdi. Hozir emas.`]], d); return; }
      FAC.flag('r2looted', 1);
      const how = FAC.flag('r2gone') || (dead ? 'force' : 'quiet');
      if (dead) { FAC.crime && FAC.crime('murder', { fac: 'tail', quiet: true, n: dead, why: 'guards' }); FAC.react({ alp: -20, nargiza: -20, surayyo: -15 }, 'killed Tail guards'); }
      const R0 = { quiet: [12, -8, 0], force: [8, -12, -12], bribe: [10, -8, 0], plant: [10, -8, 0] }[how] || [10, -8, 0];
      FAC.add('remember', R0[0]); FAC.add('divan', R0[1]); if (R0[2]) FAC.add('tail', R0[2]);
      play([
        ['', `Three crates of fresh tumars, each tagged with a Tail street. Some of the tags are in a hand you know: your own, from tithe nights.|Три ящика свежих тумаров, на каждом бирка с улицей Хвоста. Часть бирок написана знакомым почерком — твоим, с ночей сбора.|Uchta quti yangi tumar, har birida Dum ko'chasi yozilgan yorliq. Yorliqlarning bir qismi tanish xatda — o'zingning, ushr yig'ish kechalaridagi xating.`],
        how === 'force' ? ['', `The guards lie where they fell. One of them still has the Tail's red thread on his wrist, for luck.|Охранники лежат там, где упали. У одного на запястье ещё красная нитка — в Хвосте её вяжут на удачу.|Qo'riqchilar yiqilgan joyida yotibdi. Birining bilagida hali qizil ip bor — Dumda uni omad uchun bog'lashadi.`] : null,
        ['lola', `All of it goes to the ones who remember. Every tumar finds its street. Even the ones in your handwriting.|Всё уходит к тем, кто помнит. Каждый тумар найдёт свою улицу. Даже те, что подписаны твоей рукой.|Hammasi eslaydiganlarga ketadi. Har bir tumar o'z ko'chasini topadi. Sening qo'ling bilan yozilganlari ham.`]
      ], () => { FAC.finish('r2', how, how === 'force' ? `You emptied the Divan's store by force. Tail men died guarding it.|Ты опустошил склад Дивана силой. Парни из Хвоста погибли на посту.|Devon omborini kuch bilan bo'shatding. Dumlik yigitlar posida halok bo'ldi.` : `You emptied the Divan's store without a fight. The tumars went back to the Tail's streets.|Ты опустошил склад Дивана без драки. Тумары вернулись на улицы Хвоста.|Devon omborini jangsiz bo'shatding. Tumarlar Dum ko'chalariga qaytdi.`); d(); });
    }
  });
  FAC.talk.rahim = d => {
    if (!act('r2') || FAC.flag('r2gone')) { play([['', FAC.NPC.rahim.def.idle]], d); return; }
    play([['rahim', `Yodchi? Here? ...If you've come for the crates, don't. I've a sister who drinks the Divan's water.|Ёдчи? Здесь? ...Если ты за ящиками — не надо. У меня сестра пьёт воду Дивана.|Yodchi? Bu yerda? ...Qutilar uchun kelgan bo'lsang — kerak emas. Singlim Devonning suvini ichadi.`]], () => ask('', [
      { id: 'bribe', price: 40, label: `"Here's your sister's water for a month. Go and drink it with her."|«Вот вода твоей сестре на месяц. Иди, выпей с ней.»|«Mana singlingning bir oylik suvi. Bor, u bilan birga ich.»` },
      FAC.chk('mem', 5, `Sing into them the memory of a shift change. They'll go home sure they were relieved.|Вселить им память о смене караула. Уйдут домой в уверенности, что их сменили.|Ularga qorovul almashgani haqida xotira joylash. Almashtirildik, deb ishonib uyga ketishadi.`, { id: 'plant' }, `Plant|Вселить|Joylash`),
      { id: 'no', label: `"Just passing."|«Мимо иду.»|«O'tib ketyapman.»` }
    ], o => {
      if (o.id === 'bribe') { FAC.flag('r2gone', 'bribe'); for (const e of r2Guards()) e.dead = true; play([['rahim', `...A month. Fine. We were never here. You were never here. Nobody is ever anywhere, down here.|...Месяц. Ладно. Нас тут не было. Тебя тут не было. Тут, внизу, вообще никто никогда не бывает.|...Bir oy. Mayli. Biz bu yerda bo'lmaganmiz. Sen ham bo'lmagansan. Bu yerda, pastda, umuman hech kim hech qachon bo'lmaydi.`]], d); return; }
      if (o.id === 'plant') {
        if (o.ok) { FAC.plant(); FAC.flag('r2gone', 'plant'); for (const e of r2Guards()) e.dead = true; play([['', `Rahim yawns, stretches, and says, "Well, that's us relieved." The other one nods. They walk off towards the Tail, sure of something that never happened.|Рахим зевает, потягивается: «Ну всё, сменили нас». Второй кивает. Уходят в сторону Хвоста, уверенные в том, чего не было.|Rahim esnab, kerishadi: «Bo'ldi, bizni almashtirishdi». Ikkinchisi bosh irg'aydi. Bo'lmagan narsaga ishonib, Dum tomonga ketishadi.`]], d); }
        else play([['rahim', `Stop humming at me, yodchi. It's making my teeth itch.|Перестань мне тут мычать, ёдчи. У меня от этого зубы чешутся.|Menga g'ingshishni bas qil, yodchi. Tishlarim qichiyapti.`]], d);
        return;
      }
      d();
    }));
  };

  /* ================================================================ r3 · The Fugitives */
  const r3Offer = d => play([
    ['lola', `Three debtors wait in the Cloister's cells for the Night of Payment. Tonight they come down the archive drain. You'll walk them.|Трое должников ждут в кельях Обители Ночи Уплаты. Сегодня ночью они спустятся по стоку архива. Поведёшь их ты.|Uch qarzdor xonaqoh hujralarida To'lov kechasini kutyapti. Bu kecha ular arxiv ariqchasidan pastga tushadi. Ularni sen boshlab borasan.`],
    ['lola', `And one of them is a Singers' ear. We know that much and no more. Bring two and leave the ear, or bring all three and pray.|И один из них — уши Певцов. Это мы знаем, больше — нет. Приведи двоих и оставь уши — или веди всех троих и молись.|Ulardan biri — xonandalarning qulog'i. Shuni bilamiz, boshqasini yo'q. Ikkitasini olib kel, qulog'ini qoldir — yoki uchalasini olib kelib, duo qil.`]
  ], () => { FAC.begin('r3', `Lead three debtors out of the Cloister at night. One of them reports to the Singers.|Вывести ночью трёх должников из Обители. Один из них доносит Певцам.|Kechasi uch qarzdorni xonaqohdan olib chiqish. Ulardan biri xonandalarga chaqimchilik qiladi.`, ['cloister', 'books']); d(); });
  const r3 = d => {
    const tasted = FAC.flag('r3tasted') || {};
    const TQ = { olim: `Taste Olim's last week.|Испить последнюю неделю Олима.|Olimning so'nggi haftasini totib ko'rish.`, nasiba: `Taste Nasiba's last week.|Испить последнюю неделю Насибы.|Nasibaning so'nggi haftasini totib ko'rish.`, hayot: `Taste Hayot's last week.|Испить последнюю неделю Хаёта.|Hayotning so'nggi haftasini totib ko'rish.` };
    const tq = (id, lines) => FAC.craft('taste', TQ[id], { lines: done2 => FAC.taste(lines, () => { tasted[id] = 1; FAC.flag('r3tasted', tasted); done2(); }, { person: true }) });
    play([
      ['', `Three people by the archive drain, bundles in their arms. Nobody speaks. A bell in the Cloister counts the hour.|Трое у стока архива, узлы в руках. Никто не говорит. Колокол Обители отбивает час.|Arxiv ariqchasi yonida uch kishi, qo'llarida tugun. Hech kim gapirmaydi. Xonaqoh qo'ng'irog'i soatni uradi.`],
      ['olim', `I owe for my father's tithe. He died owing. The debt didn't.|Я должен за десятину отца. Он умер должником. Долг — не умер.|Otamning ushri uchun qarzdorman. U qarzdor holda o'ldi. Qarz o'lmadi.`],
      ['nasiba', `They'll take my children's faces from me. I'd rather drown in the karez with them in my head.|У меня заберут лица моих детей. Лучше утону в кяризе — но с ними в голове.|Bolalarimning yuzlarini mendan olishadi. Ular boshimda bo'lsa, korizda cho'kib o'lganim afzal.`],
      ['hayot', `Me, I'm just tired. Tired of being written down. Let's go, yodchi, before the bell finishes.|А я просто устал. Устал, что меня всё время записывают. Пошли, ёдчи, пока колокол не досчитал.|Men shunchaki charchadim. Doim yozib qo'yilishimdan charchadim. Yur, yodchi, qo'ng'iroq sanab bo'lguncha.`]
    ], () => hub(`The bell is still counting.|Колокол ещё считает.|Qo'ng'iroq hali sanayapti.`, [
      tq('olim', [['memory', `Olim at his father's grave, scraping the debt number off the stone with a nail. He cries the way men cry who have never practised.|Олим у могилы отца соскабливает гвоздём номер долга с камня. Плачет так, как плачут мужчины, которые этому не учились.|Olim otasining qabri yonida mix bilan toshdagi qarz raqamini qirib tashlayapti. Bunga o'rganmagan erkaklardek yig'laydi.`]]),
      tq('nasiba', [['memory', `Nasiba at night, saying her children's names over and over in the dark of a cell, so the song can't find a gap.|Насиба ночью в темноте кельи повторяет и повторяет имена детей — чтобы песне не нашлось щели.|Nasiba kechasi hujra qorong'isida bolalarining ismlarini qayta-qayta takrorlaydi — qo'shiq tirqish topa olmasin deb.`]]),
      tq('hayot', [['memory', `Hayot in a white corridor, talking low to a woman with a ledger. "Tonight. The drain. I'll whistle twice." She pays him in copper.|Хаёт в белом коридоре тихо говорит с женщиной с книгой. «Сегодня ночью. Сток. Свистну дважды». Она платит ему медью.|Hayot oq yo'lakda daftar ko'targan ayol bilan past ovozda gaplashyapti. «Bu kecha. Ariqcha. Ikki marta hushtak chalaman». Ayol unga mis tanga to'laydi.`]])
    ], [
      { id: 'all', label: `"All three. Walk."|«Все трое. Пошли.»|«Uchalang ham. Yuringlar.»` },
      { id: 'olim', label: `"Olim stays."|«Олим остаётся.»|«Olim qoladi.»` },
      { id: 'nasiba', label: `"Nasiba stays."|«Насиба остаётся.»|«Nasiba qoladi.»` },
      { id: 'hayot', label: `"Hayot stays."|«Хаёт остаётся.»|«Hayot qoladi.»` }
    ], o => {
      if (o.id === 'hayot') { FAC.add('remember', 12); FAC.finish('r3', 'spy', `You left Hayot behind. He was the Singers' ear. Two debtors reached the karez.|Ты оставил Хаёта. Он и был ушами Певцов. Двое должников добрались до кяризов.|Hayotni qoldirding. Xonandalarning qulog'i aynan u edi. Ikki qarzdor korizgacha yetib bordi.`); play([['hayot', `...How did you know? Never mind. They'll pay me anyway. They always pay the ones who stay.|...Как ты узнал? Неважно. Мне всё равно заплатят. Тем, кто остаётся, всегда платят.|...Qanday bilding? Farqi yo'q. Baribir menga to'lashadi. Qolganlarga doim to'lashadi.`], ['lola', `Two out, the ear left behind. Clean. You have a gift for people, yodchi. It's not a compliment.|Двое вышли, уши остались. Чисто. У тебя дар на людей, ёдчи. Это не комплимент.|Ikkitasi chiqdi, quloq qoldi. Toza. Odamlarni bilishda iste'doding bor, yodchi. Bu maqtov emas.`]], d); return; }
      if (o.id === 'all') { FAC.add('remember', 8); FAC.flag('r3spy', 1); FAC.finish('r3', 'all', `All three reached the karez, the Singers' ear among them. Somewhere a ledger is being written.|Все трое добрались до кяризов — и уши Певцов вместе с ними. Где-то сейчас пишут в книгу.|Uchalasi ham korizgacha yetib bordi — xonandalarning qulog'i ham ular bilan. Qayerdadir hozir daftarga yozilyapti.`); play([['', `Halfway down the drain someone whistles twice. Nobody else seems to hear it.|На полпути вниз по стоку кто-то дважды свистит. Похоже, никто больше этого не слышит.|Ariqchadan tushishning yarmida kimdir ikki marta hushtak chaladi. Boshqa hech kim eshitmaganga o'xshaydi.`]], d); return; }
      FAC.add('remember', 4); trust(-1); FAC.react({ nargiza: -10, surayyo: -10 }, 'left an innocent'); FAC.flag('r3spy', 1); FAC.flag('r3left', o.id);
      FAC.finish('r3', 'innocent', `You left an innocent debtor behind for the Night of Payment, and the Singers' ear walked out with you.|Ты оставил невиновного должника на Ночь Уплаты, а уши Певцов ушли вместе с тобой.|Begunoh qarzdorni To'lov kechasiga qoldirding, xonandalarning qulog'i esa sen bilan birga chiqib ketdi.`);
      play([[o.id, o.id === 'olim' ? `Me? ...My father would laugh. He always said I was the one who gets left.|Я? ...Отец бы посмеялся. Он всегда говорил, что я из тех, кого оставляют.|Menmi? ...Otam kulardi. U doim meni qoldiriladiganlardan, derdi.` : `Then sing my children's names for me, yodchi. Somebody has to.|Тогда пропой за меня имена моих детей, ёдчи. Кто-то должен.|Unda bolalarimning ismlarini men uchun kuylab qo'y, yodchi. Kimdir kuylashi kerak.`]], d);
    }));
  };

  /* ================================================================ r4 · The Price of Truth (the double-play check) */
  const r4Offer = d => FAC.suspicionCheck('remember', lead(), out => play([
    ['lola', `Before the Night of Payment we burn the cloth row at the Bazaar. Every guard in the city runs to the fire, and for an hour the Well stands open.|Перед Ночью Уплаты мы подожжём суконный ряд на Базаре. Вся стража города побежит на пожар, и на час Колодец останется открытым.|To'lov kechasidan oldin Bozordagi movut rastasiga o't qo'yamiz. Shahardagi barcha soqchilar yong'inga yuguradi va bir soat Quduq ochiq qoladi.`],
    () => (FAC.flag('umid') === 'informant' ? ['', `Umid told you about the fire weeks ago. You know the night, and the hour, and which stall goes first.|Умид рассказал тебе про пожар ещё несколько недель назад. Ты знаешь ночь, час и какая лавка вспыхнет первой.|Umid senga yong'in haqida bir necha hafta oldin aytgan edi. Kechani, soatni va qaysi do'kon birinchi alanga olishini bilasan.`] : null)
  ], () => hub(`Lola holds out a jar of lamp oil, the way you'd hold out bread.|Лола протягивает кувшин лампового масла — так протягивают хлеб.|Lola bir ko'za chiroq moyini non uzatgandek uzatadi.`, [
    { label: `— Families live above the cloth row.|— Над суконным рядом живут семьи.|— Movut rastasi tepasida oilalar yashaydi.`, lines: [['lola', `They'll wake up. Most of them. The Night of Payment takes more of them every year than any fire.|Проснутся. Почти все. Ночь Уплаты каждый год забирает их больше, чем любой пожар.|Uyg'onishadi. Deyarli hammasi. To'lov kechasi har yili har qanday yong'indan ko'proq odamni olib ketadi.`]] },
    { label: `— And when the Well stands open?|— А когда Колодец будет открыт?|— Quduq ochiq qolganda-chi?`, lines: [['lola', `We go down and take back what's ours. What we do with it after is her business.|Спустимся и заберём своё. Что с ним делать дальше — её дело.|Pastga tushib, o'zimiznikini qaytarib olamiz. Keyin u bilan nima qilish — uning ishi.`]] }
  ], [
    { id: 'help', label: `"Give me the oil."|«Давай масло.»|«Moyni ber.»` },
    { id: 'warn', label: `Help them — and, before the fire, wake the families above the cloth row.|Помочь им — но до пожара разбудить семьи над суконным рядом.|Ularga yordam berish — lekin yong'indan oldin movut rastasi tepasidagi oilalarni uyg'otish.` },
    { id: 'stop', label: `"Not like this. Not with the Bazaar."|«Не так. Не через Базар.»|«Bunday emas. Bozor orqali emas.»` },
    { id: 'tip', label: `Say nothing to Lola, and tell the Divan which night.|Ничего не сказать Лоле — и сообщить Дивану, какой ночью.|Lolaga hech narsa demay, Devonga qaysi kecha ekanini aytish.` }
  ], o => {
    if (o.id === 'help') {
      FAC.add('remember', 15); FAC.add('divan', -15); FAC.add('tail', -5); FAC.flag('bazaarFire', 1); FAC.react({ nargiza: -25, alp: -10 }, 'burned the Bazaar');
      FAC.finish('r4', 'fire', `You carried oil for the fire in the cloth row. The guards ran; the Well stood open for an hour. People died above the stalls. Prices at the Bazaar rose.|Ты носил масло для пожара в суконном ряду. Стража сбежалась; Колодец час стоял открытым. Над лавками погибли люди. Цены на Базаре выросли.|Movut rastasidagi yong'in uchun moy tashiding. Soqchilar yugurib keldi; Quduq bir soat ochiq turdi. Do'konlar tepasida odamlar halok bo'ldi. Bozorda narxlar oshdi.`);
      play([['', `The cloth goes up like dry grass. From the roofs come shouts, then quieter sounds. By morning the row is black, and silk costs a quarter more.|Сукно вспыхивает, как сухая трава. С крыш кричат, потом звуки становятся тише. К утру ряд чёрный, а шёлк подорожал на четверть.|Movut quruq o'tdek lov etib yonadi. Tomlardan qichqiriqlar, keyin tovushlar pasayadi. Tongga borib rasta qop-qora, ipak esa chorak qimmatlagan.`], () => (sadoAwake() ? ['sado', `I counted the windows before. I'm not counting them now.|Я считала окна до этого. Сейчас не считаю.|Oldin derazalarni sanagandim. Hozir sanamayapman.`] : null)], d);
    } else if (o.id === 'warn') {
      FAC.stepTo('r4', `The fire is set for tonight. Wake the families above the cloth row at the Bazaar before it starts, without Lola seeing.|Пожар назначен на эту ночь. Разбуди семьи над суконным рядом на Базаре, пока не началось, — и чтобы Лола не видела.|Yong'in bu kechaga belgilangan. Boshlanmasidan oldin Bozordagi movut rastasi tepasidagi oilalarni uyg'ot — Lola ko'rmasin.`, ['bazaar', 'cloth']); FAC.flag('r4warn', 1); d();
    } else if (o.id === 'stop') {
      FAC.add('remember', -20); FAC.add('divan', 10); FAC.closeArc('remember', 'stopped the fire'); FAC.react({ nargiza: 10 }, 'stopped the fire');
      FAC.finish('r4', 'stopped', `You stopped the fire. Those Who Remember won't send for you again.|Ты остановил пожар. Помнящие больше за тобой не пришлют.|Yong'inni to'xtatding. Eslaganlar endi seni chaqirmaydi.`, { failed: true });
      play([['lola', `Then go back up to the people who sleep well. We'll remember you were here.|Тогда возвращайся наверх, к тем, кто хорошо спит. А мы запомним, что ты тут был.|Unda tepaga, tinch uxlaydiganlar oldiga qayt. Biz esa bu yerda bo'lganingni eslab qolamiz.`]], d);
    } else {
      FAC.add('divan', 12); FAC.add('remember', -30); FAC.closeArc('remember', 'betrayed the fire'); FAC.susp('remember', 0); FAC.react({ alp: -10 }, 'sold them to the Divan');
      FAC.finish('r4', 'tipped', `You told the Divan which night. The cloth row was full of guards; Lola's people walked into them.|Ты сказал Дивану, в какую ночь. Суконный ряд был полон стражи; люди Лолы вышли прямо на неё.|Devonga qaysi kecha ekanini aytding. Movut rastasi soqchilarga to'la edi; Lolaning odamlari to'g'ri ularning ustiga chiqdi.`);
      play([['', `Nobody dies in the cloth row that night. Some die in the lane behind it. You don't go to look.|В ту ночь в суконном ряду никто не погибает. Кое-кто погибает в переулке за ним. Ты не идёшь смотреть.|O'sha kecha movut rastasida hech kim halok bo'lmaydi. Uning ortidagi tor ko'chada ba'zilar halok bo'ladi. Borib qaramaysan.`]], d);
    }
  })));
  FAC.prop('bazaar', 'cloth', {
    id: 'r4warn', art: 'f6fire', dx: -30, prompt: `Doors above the cloth row|Двери над суконным рядом|Movut rastasi tepasidagi eshiklar`,
    when: () => act('r4') && FAC.flag('r4warn') === 1,
    use: d => ask(`Twelve doors, one stair, and Lola's people already in the row below.|Двенадцать дверей, одна лестница — а внизу, в ряду, уже люди Лолы.|O'n ikki eshik, bitta zina — pastdagi rastada esa allaqachon Lolaning odamlari.`, [
      FAC.chk('agi', 5, `Go along the roofs, knocking softly, door by door.|Пройти по крышам, тихо стучась в каждую дверь.|Tomlar bo'ylab yurib, har bir eshikni sekin taqillatish.`, { id: 'roofs' }),
      FAC.chk('collection', 3, `Knock like a yodchi at the first door, and make the whole stair come down for "a tithe check".|Постучать в первую дверь по-ёдчиному и согнать всю лестницу вниз — «на проверку десятины».|Birinchi eshikni yodchilarcha taqillatib, butun zinadagilarni «ushr tekshiruvi»ga pastga tushirish.`, { id: 'tithe' }, `Pressure|Давление|Bosim`)
    ], o => {
      FAC.flag('r4warn', 2); FAC.flag('bazaarFire', 1);
      if (o.ok) { FAC.add('remember', 8); FAC.add('tail', 6); FAC.finish('r4', 'warned', `You woke the families before the fire. The cloth row burned empty; Lola never knew who emptied it.|Ты разбудил семьи до пожара. Суконный ряд сгорел пустым; Лола так и не узнала, кто его опустошил.|Yong'indan oldin oilalarni uyg'otding. Movut rastasi bo'm-bo'sh yondi; uni kim bo'shatganini Lola hech qachon bilmadi.`); play([['', `By the time the oil catches, forty people stand in the next street in their nightclothes, cursing the tithe and the yodchi, alive.|Когда масло вспыхивает, сорок человек стоят на соседней улице в ночных рубахах и клянут десятину и ёдчи. Живые.|Moy alanga olganda, qirq kishi qo'shni ko'chada tungi ko'ylakda turib, ushr va yodchini so'kishyapti. Tirik.`]], d); }
      else { FAC.add('remember', -8); FAC.add('tail', 6); FAC.finish('r4', 'warned', `You woke the families, but Lola saw you do it. They live; she won't forget it.|Ты разбудил семьи, но Лола это видела. Они живы; она этого не забудет.|Oilalarni uyg'otding, lekin Lola buni ko'rdi. Ular tirik; u buni unutmaydi.`); play([['lola', `You warned them. ...They're alive. I'm glad. I'm also never telling you anything true again.|Ты их предупредил. ...Они живы. Я рада. И больше никогда не скажу тебе ничего правдивого.|Ularni ogohlantirding. ...Ular tirik. Xursandman. Va boshqa hech qachon senga rost gap aytmayman.`]], d); }
    })
  });

  /* ================================================================ r5 · The Mask (after Old Yodgor) */
  const r5 = d => FAC.paidBack('remember', () => {
    const o = F().oydin;
    if (FAC.flag('r3spy') && !FAC.flag('r3raid')) FAC.flag('r3raid', 1);
    const lines = [
      ['lola', `She told you, then. Whose brother you are.|Значит, она тебе сказала. Чей ты брат.|Demak, u senga aytdi. Kimning akasi ekaningni.`],
      FAC.flag('r3raid') ? ['lola', `And the Singers' ear you walked out of the Cloister? He whistled. They came for our cellar under the dome. Three of ours didn't come back up.|А уши Певцов, которых ты вывел из Обители? Он свистнул. За нашим погребом под куполом пришли. Трое наших наверх не вернулись.|Xonaqohdan olib chiqqan xonandalar qulog'ichi? U hushtak chaldi. Gumbaz ostidagi yerto'lamizga kelishdi. Bizdan uch kishi tepaga qaytmadi.`] : null
    ];
    let br = 'other';
    if (o === 'joined') { FAC.add('remember', 20); br = 'joined'; lines.push(['lola', `And you stayed with her. Then you're ours, all the way down.|И ты остался с ней. Значит, ты наш — до самого дна.|Va u bilan qolding. Demak, sen bizniksan — tubigacha.`]); }
    else if (o === 'took') { FAC.add('remember', -25); FAC.closeArc('remember', 'took the tumars'); br = 'took'; lines.push(['lola', `And you took the founders' tumars out of her hands. Don't come down here again, yodchi. Not for a long time.|И ты вырвал у неё из рук тумары основателей. Не спускайся сюда больше, ёдчи. Долго не спускайся.|Va asoschilar tumarlarini uning qo'lidan tortib olding. Bu yerga boshqa tushma, yodchi. Uzoq vaqt tushma.`]); }
    else { FAC.add('remember', 6); lines.push(['lola', `You didn't stay, and you didn't fight her. She says that's the most you ever did for her, and that it's a lot.|Ты не остался — но и не стал с ней драться. Она говорит, это больше, чем ты когда-либо для неё делал. И что это немало.|Qolmading — lekin u bilan urishmading ham. U buni sen u uchun qilgan eng katta ish, deydi. Va bu oz emas, deydi.`]); }
    if (FAC.flag('r3raid')) FAC.add('remember', -10);
    FAC.finish('r5', br, br === 'took' ? `The mask is off and the arc is personal; you took the tumars from your sister. Those Who Remember closed their doors.|Маска снята, арка стала личной: ты отнял тумары у сестры. Помнящие закрыли перед тобой двери.|Niqob yechildi, yo'l shaxsiy bo'lib qoldi: tumarlarni singlingdan tortib olding. Eslaganlar eshiklarini senga yopdi.` : `The mask is off. Their leader is your sister, Oydin. The arc is personal now.|Маска снята. Их предводительница — твоя сестра Ойдин. Теперь это личное.|Niqob yechildi. Ularning boshlig'i — singling Oydin. Endi bu shaxsiy ish.`, { failed: br === 'took' });
    play(lines, d);
  });

  /* ================================================================ r6 · The Awakening (Act III, the Dream) */
  const r6 = d => play([
    ['', `Oydin sits on a dream doorstep with the founders' tumars on one cord across her knees. They hum their song to themselves, like old men.|Ойдин сидит на пороге во сне, на коленях у неё — тумары основателей на одном шнуре. Они напевают себе свою песню, как старики.|Oydin tushdagi ostonada o'tiribdi, tizzasida bir ipga tizilgan asoschilar tumarlari. Ular qariyalardek o'z qo'shig'ini xirgoyi qilishyapti.`],
    ['oydin', `Break them with me, Toychoq. One each, then one together. Every stolen night goes home. Every girl in every cellar.|Разбей их со мной, Тойчок. По одному каждый, а последний — вместе. Каждая украденная ночь вернётся домой. Каждая девочка из каждого погреба.|Ularni men bilan sindir, Toychoq. Har birimiz bittadan, oxirgisini — birga. Har bir o'g'irlangan kecha uyiga qaytadi. Har bir yerto'ladagi har bir qizcha.`],
    ['oydin', `The city will sink. I know. It sank me first.|Город утонет. Знаю. Меня он утопил первой.|Shahar cho'kadi. Bilaman. Meni u birinchi bo'lib cho'ktirgan.`],
    () => (sadoAwake() ? ['sado', `She's so tired, Toychoq. She's been angry for twenty years. That's a long time to hold your breath.|Она так устала, Тойчок. Она злится двадцать лет. Это очень долго — не дышать.|U juda charchagan, Toychoq. Yigirma yildan beri jahli chiqib yuribdi. Nafas olmay turish uchun bu juda uzoq.`] : null)
  ], () => ask(`The cord is in her fist. Her other hand is open, waiting for yours.|Шнур у неё в кулаке. Другая рука раскрыта и ждёт твою.|Ip uning mushtida. Ikkinchi qo'li ochiq, senikini kutyapti.`, [
    { id: 'help', label: `"Together, then." Take her hand.|«Тогда вместе». Взять её за руку.|«Unda birga». Uning qo'lidan tutish.`, lock: FAC.flag('helped6') ? `You already gave your voice to someone tonight.|Сегодня ты уже отдал свой голос другому.|Bugun ovozingni boshqaga berib bo'lding.` : null },
    { id: 'fight', label: `"I can't let you drown them." Reach for the cord.|«Я не дам тебе их утопить». Потянуться к шнуру.|«Ularni cho'ktirishingga yo'l qo'ymayman». Ipga qo'l cho'zish.` },
    { id: 'away', label: `"I won't help you, and I won't stop you." Step back.|«Помогать не стану. Мешать — тоже». Отступить.|«Yordam bermayman. To'sqinlik ham qilmayman». Orqaga chekinish.` }
  ], o => {
    if (o.id === 'help') {
      FAC.flag('helped6', 'remember'); F().faction = 'remember'; save();
      FAC.add('remember', 20); FAC.react({ nargiza: 5, surayyo: -15, alp: 5 }, 'the awakening'); trust(1);
      try { G.CH.grantLegend('cradle'); } catch (e) { /* ignore */ }
      FAC.finish('r6', 'help', `You took Oydin's hand. Her plan is the one under way: the founders' tumars will be broken.|Ты взял Ойдин за руку. В ход пошёл её план: тумары основателей будут разбиты.|Oydinning qo'lidan tutding. Uning rejasi amalga oshmoqda: asoschilar tumarlari sindiriladi.`, { xp: 'arc' });
      play([['', `She unpicks two stitches under her collarbone and puts a small warm tumar into your palm.|Она распарывает два стежка под ключицей и кладёт тебе в ладонь маленький тёплый тумар.|U o'mrov suyagi ostidagi ikki chokni so'kib, kaftingga kichkina iliq tumar qo'yadi.`], ['oydin', `I tasted you once a year. I won't need to now. Keep it. It knows a lullaby.|Я пробовала тебя раз в год. Теперь не нужно. Оставь себе. Он знает колыбельную.|Seni yiliga bir marta totardim. Endi kerak emas. O'zingda qolsin. U bir alla biladi.`]], d);
    } else if (o.id === 'fight') {
      FAC.flag('fight6', 'remember');
      play([['oydin', `...Of course. They wrote you down too, Toychoq. Long before me. Come on, then. Let's see what you remember.|...Ну конечно. Тебя ведь тоже записали, Тойчок. Задолго до меня. Ну давай. Посмотрим, что ты помнишь.|...Albatta-da. Seni ham yozib qo'yishgan, Toychoq. Mendan ancha oldin. Qani, kel. Ko'raylik-chi, nimani eslarkansan.`]], () => { d(); FAC.goLair('f_oydin'); });
    } else {
      FAC.add('remember', -10); FAC.finish('r6', 'away', `You stepped back from your sister's plan, neither with her nor against her.|Ты отступил от замысла сестры — ни с ней, ни против неё.|Singlingning rejasidan chekinding — u bilan ham emas, unga qarshi ham emas.`, { noXp: true });
      play([['oydin', `You always did stand in doorways. Fine. I'll break them myself. It'll take one more breath.|Ты всегда стоял в дверях. Ладно. Разобью сама. Это займёт на один вдох больше.|Doim eshik oldida turarding. Mayli. O'zim sindiraman. Bu bir nafas ko'proq vaqt oladi.`]], d);
    }
  }));

  /* ---------------------------------------------------------------- menus */
  FAC.talk.zulfiya = d => {
    const o = [];
    if (FAC.Q.r1.offer() && q('r1').st === 'none') o.push({ label: `— What are you selling?|— Чем торгуешь?|— Nima sotyapsan?`, go: r1Offer });
    if (FAC.Q.r2.offer() && q('r2').st === 'none') o.push({ label: `— Zulfiya. Anything else that wants returning?|— Зульфия. Ещё что-нибудь вернуть?|— Zulfiya. Yana qaytaradigan narsa bormi?`, go: r2Offer });
    FAC.menu('zulfiya', `Zulfiya|Зульфия|Zulfiya`, o, d);
  };
  FAC.talk.lola = d => {
    const o = [];
    if (FAC.Q.r3.offer() && q('r3').st === 'none') o.push({ label: `— Lola. What's next?|— Лола. Что дальше?|— Lola. Keyin nima?`, go: r3Offer });
    if (FAC.Q.r4.offer() && q('r4').st === 'none') o.push({ label: `— You look like someone with a plan.|— У тебя вид человека с планом.|— Rejasi bor odamga o'xshaysan.`, go: r4Offer });
    if (FAC.Q.r5.offer() && q('r5').st === 'none') o.push({ label: `— Lola. You knew.|— Лола. Ты знала.|— Lola. Sen bilarding.`, go: r5 });
    FAC.menu('lola', `Lola|Лола|Lola`, o, d);
  };
  FAC.talk.olim = FAC.talk.nasiba = FAC.talk.hayot = d => { if (act('r3')) r3(d); else play([['', FAC.NPC.olim.def.idle]], d); };
  FAC.talk.oydin6 = d => {
    if (q('r6').st !== 'none') { play([['', FAC.NPC.oydin6.def.idle]], d); return; }
    if (FAC.Q.r6.offer()) { r6(d); return; }
    if (FAC.flag('fight6') === 'remember' && !FAC.flag('fought_remember')) { play([['oydin', `Back again, Toychoq? You always did come back to finish a quarrel.|Опять ты, Тойчок? Ты всегда возвращался, чтобы доругаться.|Yana keldingmi, Toychoq? Janjalni oxiriga yetkazish uchun doim qaytib kelarding.`]], () => { d(); FAC.goLair('f_oydin'); }); return; }
    play([['oydin', `Not yet, Toychoq. Not until my people trust you as much as I do. Which isn't much.|Рано, Тойчок. Пока мои люди не будут доверять тебе так же, как я. А это немного.|Hali erta, Toychoq. Odamlarim senga men kabi ishonmaguncha. Bu esa unchalik ko'p emas.`]], d);
  };

  /* ================================================================ Oydin, She Who Remembers — the boss's story (moveset in 65u) */
  BOSS('f_oydin', {
    name: `Oydin, She Who Remembers|Ойдин, Та, что помнит|Oydin, Eslaydigan`,
    title: `Every blow a memory she burns|Каждый удар — сожжённое воспоминание|Har bir zarba — yondirilgan xotira`,
    quote: `"Do you remember?"|«Помнишь?»|«Eslaysanmi?»`,
    lair: `The house in the dream|Дом во сне|Tushdagi uy`, lairSub: `Where she hid under the table|Где она пряталась под столом|U stol tagiga yashiringan joy`,
    portrait: 'oydin',
    pre: [
      ['', `A dream room the size of a square: the house that smells of bread, every wall a door, every door burning at the edges.|Комната сна величиной с площадь: дом, пахнущий хлебом, каждая стена — дверь, каждая дверь горит по краям.|Maydondek keladigan tush xonasi: non hidi keladigan uy, har bir devor — eshik, har bir eshik chetidan yonyapti.`],
      ['boss', `Every one of these I'll burn on you, Toychoq. Every one. I kept them for twenty years for exactly this.|Каждое из них я сожгу об тебя, Тойчок. Каждое. Я двадцать лет их берегла как раз для этого.|Ularning har birini senga qarshi yondiraman, Toychoq. Har birini. Yigirma yil aynan shu uchun asradim.`]
    ],
    again: [`Again? You always were stubborn.|Опять? Ты всегда был упрямым.|Yana? Doim o'jar eding.`, `I have more memories than you have patience, Toychoq.|У меня воспоминаний больше, чем у тебя терпения, Тойчок.|Mening xotiralarim sening sabringdan ko'p, Toychoq.`],
    post: d => {
      FAC.flag('fought_remember', 1); FAC.add('remember', -50); FAC.retarget('remember');
      const words = FAC.flag('oydinWords');
      FAC.finish('r6', words ? 'words' : 'fought', words ? `You ended the fight with Oydin with words. She lowered the knives and let the tumars stay whole, for tonight.|Ты закончил бой с Ойдин словами. Она опустила ножи и оставила тумары целыми — на эту ночь.|Oydin bilan jangni so'z bilan tugatding. U pichoqlarini tushirdi va tumarlarni butun qoldirdi — shu kechaga.` : `You stopped Oydin by force. The founders' tumars are whole; she is spent.|Ты остановил Ойдин силой. Тумары основателей целы; она обессилела.|Oydinni kuch bilan to'xtatding. Asoschilar tumarlari butun; u holdan toydi.`, { xp: 'arc' });
      play([
        words ? ['oydin', `...Under the table. You came back for me. You were twelve and you came back, and then you sold it. ...I'm so tired, Toychoq.|...Под столом. Ты вернулся за мной. Тебе было двенадцать, и ты вернулся, а потом продал это. ...Я так устала, Тойчок.|...Stol tagida. Sen men uchun qaytib kelding. O'n ikki yoshda eding, qaytib kelding, keyin buni sotding. ...Juda charchadim, Toychoq.`]
          : ['', `Oydin sits down on the burning floor, the knives in her lap, and the doors around you go out one by one, like lamps at dawn.|Ойдин садится на горящий пол, ножи у неё на коленях, и двери вокруг гаснут одна за другой, как лампы на рассвете.|Oydin yonayotgan polga o'tiradi, pichoqlar tizzasida, atrofdagi eshiklar esa tongdagi chiroqlardek birin-ketin o'chadi.`],
        ['oydin', `Take it, then. You won anyway.|Бери тогда. Ты всё равно выиграл.|Unda ol. Baribir yutding.`]
      ], () => ask(`She holds out a small warm tumar from under her collarbone.|Она протягивает маленький тёплый тумар из-под ключицы.|U o'mrov suyagi ostidan kichkina iliq tumar uzatadi.`, [
        { id: 'take', label: `Take it.|Взять.|Olish.` },
        { id: 'leave', label: `Close her hand around it. "Keep it. It's yours."|Сжать её ладонь вокруг него. «Оставь. Он твой.»|Uning kaftini u bilan birga yumib qo'yish. «O'zingda qolsin. U seniki.»` }
      ], o => {
        if (o.id === 'take') { try { G.CH.grantLegend('cradle'); } catch (e) { /* ignore */ } FAC.flag('cradle', 'taken'); }
        else { trust(1); FAC.flag('cradle', 'left'); FAC.add('remember', 10); }
        d();
      }));
    }
  });
  FAC.lair('f_oydin', 'f_oydin', 'yd_well_bottom');
  FAC.EPI.remember = e => FAC.flag('fought_remember') && e !== 'awake' ? { k: 'oydin', v: FAC.flag('oydinWords') ? 'words' : 'stopped', e, text: FAC.flag('oydinWords') ? `In the dream you stopped Oydin with a memory instead of a blade. She still doesn't forgive you. She comes to dinner anyway, and brings bread, and complains about it.|Во сне ты остановил Ойдин воспоминанием, а не клинком. Она тебя всё ещё не простила. Но приходит ужинать, приносит хлеб и ворчит.|Tushda Oydinni tig' bilan emas, xotira bilan to'xtatding. U seni hali ham kechirmagan. Lekin kechki ovqatga keladi, non olib keladi va to'ng'illaydi.` : `In the dream you beat your sister. She left the city before the new moon and never wrote. Sometimes a traveller hums Alla at the gate, and you don't go out.|Во сне ты одолел сестру. Она ушла из города до новолуния и так и не написала. Иногда у ворот кто-то из путников напевает «Аллу», и ты не выходишь.|Tushda singlingni yengding. U yangi oydan oldin shahardan ketdi va hech qachon xat yozmadi. Ba'zan darvoza oldida bir yo'lovchi «Alla»ni xirgoyi qiladi, sen esa chiqmaysan.` } : null;
}
