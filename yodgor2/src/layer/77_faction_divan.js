/* =====================================================================
   Stage 6 — the Divan: "Gold that never sleeps" (GDD ch. 6).
     d1 The Runaway Debtor      Bazaar → Rabat (night)   Nodira; Hamid and his sick daughter
     d2 The Stranger's Wedding  the Ark                   the follow-up of Gulnora's wedding (F().gulnora)
     d3 Salt and Chains         the Salt Mines            the convicts' revolt; Qahramon
     d4 The Cellar of a Thousand Childhoods  the Ark      Tilla-bek; the double-play check
     d5 The Heirs               the Ark                   the Divan descends from the Seven
     d6 The Chain Song          the Dream                 sing for Tilla-bek, or fight Humo
   ===================================================================== */
{
  const cat3 = FAC.cat3, cl = FAC.cl, moon = () => (G.WORLD2 ? G.WORLD2.moonPhase() : 0);
  const q = FAC.q, done = FAC.isDone, act = FAC.isActive;
  const open = () => !FAC.arcClosed('divan');
  CAST.nodira = { name: `Nodira, Intendant of the Divan|Нодира, интендант Дивана|Devon ta'minotchisi Nodira`, portrait: 'divan' };
  CAST.hamid = { name: `Hamid the dyer|Красильщик Хамид|Bo'yoqchi Hamid`, portrait: null };
  CAST.saidakbar = { name: `Saidakbar, silk merchant|Шелкоторговец Саидакбар|Ipak savdogari Saidakbar`, portrait: 'auctioneer' };
  CAST.qahramon = { name: `Qahramon|Кахрамон|Qahramon`, portrait: null };
  CAST.convict = { name: `A convict|Каторжник|Mahkum`, portrait: null };
  const LK = {
    nodira: { robe: '#7a5a22', trim: '#e2b452', skin: '#c8a080', head: 'scarf', headC: '#a8323a' },
    hamid: { robe: '#3a4a7a', trim: '#8a3a8a', skin: '#a07858', head: 'doppi', headC: '#2a1a3a', beard: 'short' },
    saidakbar: { robe: '#8a6a9a', trim: '#e2b452', skin: '#c89a78', head: 'turban', headC: '#f0e8d8', beard: 'short', scale: 1.06 },
    qahramon: { robe: '#5a5a60', trim: '#c8d0d8', skin: '#a08068', head: 'bare', beard: 'long', scale: 1.08 },
    tillabek: 'tillabek'
  };
  FAC.quest('d1', { fac: 'divan', n: 1, title: `The Runaway Debtor|Беглый должник|Qochoq qarzdor`, where: ['bazaar', 'auction'], offer: () => open() && moon() <= 1 && FAC.atLeast('divan', 'stranger') });
  FAC.quest('d2', { fac: 'divan', n: 2, title: `The Stranger's Wedding|Чужая свадьба|Begona to'y`, where: ['ark', 'gate'], offer: () => open() && done('d1') && moon() <= 1 && FAC.atLeast('divan', 'own') && !!F().gulnora });
  FAC.quest('d3', { fac: 'divan', n: 3, title: `Salt and Chains|Соль и цепи|Tuz va zanjirlar`, where: ['mines', 'face'], offer: () => open() && done('d2') && moon() === 1 && FAC.atLeast('divan', 'own') });
  FAC.quest('d4', { fac: 'divan', n: 4, title: `The Cellar of a Thousand Childhoods|Погреб тысячи детств|Ming bolalik yerto'lasi`, where: ['ark', 'f_cellar'], offer: () => open() && done('d3') && moon() === 1 && FAC.atLeast('divan', 'own') });
  FAC.quest('d5', { fac: 'divan', n: 5, title: `The Heirs|Наследники|Merosxo'rlar`, where: ['ark', 'f_cellar'], offer: () => open() && done('d4') && moon() === 1 && FAC.atLeast('divan', 'own') && (!!F().truth || G.WORLD2.story.done('b_seven')) });
  FAC.quest('d6', { fac: 'divan', n: 6, title: `The Chain Song|Песнь цепи|Zanjir qo'shig'i`, where: ['dream', 'f_final'], offer: () => open() && FAC.br('d5') === 'partner' && moon() >= 2 && FAC.atLeast('divan', 'trusted') });

  FAC.spot('ark', 'f_cellar', 0.4);
  FAC.spot('rabat', 'f_hamid', 0.84);
  FAC.npc('nodira', { name: CAST.nodira.name, look: LK.nodira, dx: 50, idle: `Nodira writes in a ledger with a gold pen and counts under her breath.|Нодира пишет в книге золотым пером и считает себе под нос.|Nodira oltin qalam bilan daftarga yozadi va pichirlab sanaydi.` },
    () => moon() >= 2 ? [] : [{ from: 8, to: 14, region: 'bazaar', spot: 'auction' }, { from: 14, to: 20, region: 'ark', spot: 'gate' }]);
  FAC.npc('hamid', { name: CAST.hamid.name, look: LK.hamid, dx: 0, idle: `Hamid holds a finger to his lips and nods at the curtain.|Хамид прикладывает палец к губам и кивает на занавеску.|Hamid barmog'ini labiga qo'yib, pardaga ishora qiladi.` },
    () => act('d1') && moon() <= 1 ? [{ from: 19, to: 6, region: 'rabat', spot: 'f_hamid' }] : []);
  FAC.npc('saidakbar', { name: CAST.saidakbar.name, look: LK.saidakbar, dx: 80, idle: `The silk merchant smooths his sleeve and pretends not to see you.|Шелкоторговец разглаживает рукав и делает вид, что тебя не видит.|Ipak savdogari yengini tekislab, seni ko'rmaganga oladi.` },
    () => act('d2') && moon() <= 1 ? [{ from: 8, to: 20, region: 'ark', spot: 'roses' }] : []);
  FAC.npc('qahramon', { name: CAST.qahramon.name, look: LK.qahramon, dx: 50, idle: `Qahramon sharpens a salt-pick on a salt wall. It takes a long time.|Кахрамон точит соляное кайло о соляную стену. Это долго.|Qahramon tuz cho'qmorini tuz devorga qayraydi. Bu uzoq davom etadi.` },
    () => act('d3') ? [{ from: 0, to: 24, region: 'mines', spot: 'face' }] : []);
  FAC.npc('tillabek6', { name: CAST.tillabek.name, look: 'tillabek', dx: 20, idle: `Tilla-bek is choosing a tumar the way other men choose a melon.|Тилла-бек выбирает тумар, как другие выбирают дыню.|Tilla-bek tumarni boshqalar qovun tanlagandek tanlayapti.` },
    () => {
      if (done('d3') && !done('d5') && open() && moon() === 1) return [{ from: 9, to: 22, region: 'ark', spot: 'f_cellar' }];
      if (FAC.br('d5') === 'partner' && !done('d6') && moon() >= 2) return [{ from: 0, to: 24, region: 'dream', spot: 'f_final' }];
      return [];
    });
  // in the dream the three leaders stand apart
  s6init(() => { G.WORLD2.npcs.tillabek6.dx = 20; });

  /* ================================================================ d1 · The Runaway Debtor */
  const d1Offer = d => play([
    ['nodira', `The Divan lends, yodchi. The Divan also finds. A silk-dyer named Hamid borrowed against his daughter's dowry and walked out of the city with it.|Диван даёт в долг, ёдчи. Диван и находит. Красильщик Хамид занял под приданое дочери и ушёл с деньгами из города.|Devon qarz beradi, yodchi. Devon topadi ham. Bo'yoqchi Hamid qizining sepi hisobidan qarz oldi-da, pulni olib shahardan chiqib ketdi.`],
    ['nodira', `He's been seen at the Rabat after dark. Bring him back to his debt. Ninety tilla in the ledger, ten of them yours.|Его видели в Рабате после заката. Верни его к его долгу. Девяносто тилла в книге, десять из них — твои.|Uni kun botgandan keyin Rabotda ko'rishgan. Uni qarziga qaytar. Daftarda to'qson tilla, o'ntasi seniki.`]
  ], () => hub('', [
    { label: `— What happens to him?|— А что с ним будет?|— Unga nima bo'ladi?`, lines: [['nodira', `He works it off in the Salt Mines. It's honest work, as work goes. Fewer people come back from honest work than you'd think.|Отработает в Соляных шахтах. Честный труд, насколько труд бывает честным. С честного труда возвращаются реже, чем кажется.|Tuz konlarida ishlab uzadi. Halol mehnat — mehnat qanchalik halol bo'lsa. Halol mehnatdan qaytuvchilar o'ylagandan kamroq.`]] },
    { label: `— Why send a yodchi?|— Почему ёдчи, а не стража?|— Nega soqchi emas, yodchi?`, lines: [['nodira', `A yodchi knocks and people open. A guard knocks and they go out of the window.|Ёдчи стучит — и ему открывают. Стражник стучит — и вылезают в окно.|Yodchi taqillatsa, eshik ochiladi. Soqchi taqillatsa, derazadan chiqib ketishadi.`]] }
  ], [{ id: 'yes', label: `"I'll find him."|«Найду.»|«Topaman.»` }, { id: 'no', label: `"Not my kind of debt."|«Это не мой долг.»|«Bu mening qarzim emas.»` }], o => {
    if (o.id === 'yes') FAC.begin('d1', `Nodira wants the dyer Hamid brought back to his debt. He hides at the Rabat after dark.|Нодира хочет, чтобы красильщика Хамида вернули к долгу. Он прячется в Рабате после заката.|Nodira bo'yoqchi Hamidni qarziga qaytarishni istaydi. U kun botgach Rabotda yashirinadi.`, ['rabat', 'f_hamid']);
    d();
  }));
  const d1Hamid = d => play([
    ['hamid', `Don't shout. She's asleep. Finally.|Не шуми. Она спит. Наконец-то.|Baqirma. U uxlayapti. Nihoyat.`],
    ['', `Behind a curtain a girl breathes the way the Tail breathes in a dust storm: short and wet.|За занавеской дышит девочка — так дышит Хвост в пыльную бурю: коротко и сыро.|Parda ortida bir qiz nafas olyapti — chang bo'ronida Dum shunday nafas oladi: qisqa va nam.`],
    ['hamid', `The dowry paid for a healer from Samarkand. He comes with the next caravan. If I go down the mines, she waits for him alone.|Приданое ушло на лекаря из Самарканда. Он приедет со следующим караваном. Если меня загонят в шахты, она будет ждать его одна.|Sep Samarqanddan keladigan tabibga ketdi. U keyingi karvon bilan keladi. Meni konga haydashsa, qizim uni yolg'iz kutadi.`],
    cl('surayyo', `That cough. Bitter water does that to children. Half the Tail coughs like that.|Этот кашель. От горькой воды у детей такой. Пол-Хвоста так кашляет.|Bu yo'tal. Achchiq suvdan bolalarda shunday bo'ladi. Dumning yarmi shunday yo'taladi.`)
  ], () => ask(`Ninety tilla is written in Nodira's ledger, in gold ink.|Девяносто тилла записаны в книге у Нодиры, золотыми чернилами.|To'qson tilla Nodiraning daftarida oltin siyoh bilan yozilgan.`, [
    { id: 'returned', label: `"The debt doesn't care who's coughing. Come."|«Долгу всё равно, кто кашляет. Пошли.»|«Qarzga kim yo'talayotgani baribir. Yur.»` },
    FAC.chk('mem', 4, `"Go with the caravan. I'll tell Nodira I found your grave."|«Уходи с караваном. Нодире скажу, что нашёл твою могилу.»|«Karvon bilan ket. Nodiraga qabringni topdim, deyman.»`, { id: 'dead' }, `A good lie|Ложь|Yolg'on`),
    { id: 'paid', price: 90, label: `"I'll carry your debt. Pay me back when she's well."|«Твой долг возьму на себя. Отдашь, когда она поправится.»|«Qarzingni o'z bo'ynimga olaman. U tuzalgach qaytarasan.»` },
    FAC.chk('collection', 3, `"Give me what you have left, now. The rest by spring. I'll make Nodira take it."|«Отдай что осталось — сейчас. Остальное к весне. Нодиру я уговорю.»|«Qolganini hozir ber. Qolganini bahorgacha. Nodirani men ko'ndiraman.»`, { id: 'terms' }, `Pressure|Давление|Bosim`)
  ], o => {
    const end = (br, text, more) => { FAC.finish('d1', br, text); play(more || [], d); };
    if (o.id === 'returned') {
      FAC.add('divan', 12); FAC.add('rabat', -8); gold(10); FAC.react({ alp: -10, surayyo: -10 }, 'returned a debtor'); FAC.flag('hamid', 'mines');
      end('returned', `You brought Hamid back. He went down to the Salt Mines; his daughter stays with the caravan women.|Ты привёл Хамида обратно. Он ушёл в Соляные шахты; дочь осталась с женщинами из каравана.|Hamidni qaytarib olib kelding. U Tuz konlariga tushdi; qizi karvondagi ayollar qo'lida qoldi.`, [['hamid', `Tell her the healer's coming. Tell her I'm buying salt. She likes salt.|Скажи ей, что лекарь едет. Скажи, что я соль покупаю. Она любит соль.|Unga tabib kelyapti, de. Men tuz sotib olyapman, de. U tuzni yaxshi ko'radi.`], ['nodira', `Ten tilla. The Divan is pleased. The Divan is always pleased when a sum closes.|Десять тилла. Диван доволен. Диван всегда доволен, когда сумма сходится.|O'n tilla. Devon mamnun. Hisob yopilganda Devon doim mamnun bo'ladi.`]]);
    } else if (o.id === 'dead') {
      if (o.ok) { FAC.add('rabat', 10); FAC.flag('hamid', 'free'); end('dead', `Nodira believes Hamid is dead. He left with the caravan and his daughter.|Нодира верит, что Хамид мёртв. Он ушёл с караваном вместе с дочерью.|Nodira Hamidni o'ldi deb ishonadi. U qizi bilan karvonga qo'shilib ketdi.`, [['nodira', `Dead. In the dunes. How economical of him. I'll write off the sum. The Divan writes off quite a lot, quietly.|Умер. В барханах. Как экономно с его стороны. Спишу сумму. Диван многое списывает — тихо.|O'libdi. Barxanlarda. Qanday tejamkor. Summani hisobdan chiqaraman. Devon ko'p narsani jimgina hisobdan chiqaradi.`]]); }
      else { FAC.add('divan', -10); FAC.add('rabat', 6); FAC.flag('hamid', 'free'); end('dead', `Nodira didn't believe Hamid was dead. She wrote your name in the margin instead.|Нодира не поверила, что Хамид умер. Вместо этого вписала на поля твоё имя.|Nodira Hamid o'ldi, degan gapga ishonmadi. Uning o'rniga hoshiyaga sening isming yozildi.`, [['nodira', `You lie like a man who's never been paid to. Fine. I'll write it off. And I'll write you down.|Ты врёшь, как человек, которому за это ни разу не платили. Ладно. Спишу. А тебя — запишу.|Bunga hech qachon pul olmagan odamdek yolg'on gapirasan. Mayli. Hisobdan chiqaraman. Seni esa yozib qo'yaman.`]]); }
    } else if (o.id === 'paid') {
      FAC.add('divan', 6); FAC.add('rabat', 10); trust(1); FAC.react({ alp: 10, surayyo: 10 }, 'paid a debt'); FAC.flag('hamid', 'free');
      end('paid', `You paid Hamid's ninety tilla yourself. The Divan's sum closed; the girl waits for her healer.|Ты сам заплатил девяносто тилла за Хамида. Сумма Дивана сошлась, девочка ждёт своего лекаря.|Hamidning to'qson tillasini o'zing to'lading. Devon hisobi yopildi, qiz tabibini kutyapti.`, [['hamid', `When she's well I'll dye you a coat. Indigo. It'll be the only good thing anyone in the Divan's ledger ever made you.|Когда поправится, я покрашу тебе халат. Индиго. Единственное хорошее, что тебе принесёт книга Дивана.|U tuzalganda senga to'n bo'yab beraman. Nil rangida. Devon daftari senga keltirgan yagona yaxshi narsa shu bo'ladi.`]]);
    } else {
      if (o.ok) { FAC.add('divan', 6); FAC.add('rabat', 4); gold(10); FAC.flag('hamid', 'free'); end('terms', `Hamid pays what he has and the rest by spring. Nodira accepted the terms, with a face.|Хамид отдаёт что есть, остальное — к весне. Нодира согласилась на условия — с лицом.|Hamid borini beradi, qolganini bahorgacha. Nodira shartlarga rozi bo'ldi — yuzini burishtirib.`, [['nodira', `Instalments. How bourgeois. Very well, yodchi: you'll be the one to knock in spring.|Рассрочка. Как мещански. Хорошо, ёдчи: по весне стучаться будешь ты.|Bo'lib to'lash. Qanday mayda gap. Mayli, yodchi: bahorda eshik taqillatadigan sen bo'lasan.`]]); }
      else { FAC.add('divan', 8); FAC.add('rabat', -6); FAC.flag('hamid', 'mines'); end('returned', `Hamid wouldn't bargain, and neither would Nodira. He went down to the mines.|Хамид торговаться не стал, Нодира тоже. Он ушёл в шахты.|Hamid savdolashmadi, Nodira ham. U konga tushdi.`, [['hamid', `Spring? She may not have a spring. Take me, then. Just take me quickly.|К весне? У неё весны может и не быть. Веди тогда. Только быстро.|Bahorgachami? Uning bahori bo'lmasligi ham mumkin. Unda olib ket. Faqat tezroq.`]]); }
    }
  }));
  FAC.talk.hamid = d => { if (act('d1')) d1Hamid(d); else play([['', FAC.NPC.hamid.def.idle]], d); };

  /* ================================================================ d2 · The Stranger's Wedding (after the Ark) */
  const d2Offer = d => {
    const g = F().gulnora;
    const pre = {
      returned: `The silk merchant Saidakbar paid the Divan for a love for his daughter, and you pulled it out of her at her own wedding. He wants another. The Divan has one in stock.|Шелкоторговец Саидакбар заплатил Дивану за любовь для дочери, а ты вытащил её прямо на свадьбе. Он хочет другую. На складе у Дивана есть.|Ipak savdogari Saidakbar qiziga muhabbat uchun Devonga pul to'lagan, sen esa uni to'yning o'zida sug'urib olding. U boshqasini xohlaydi. Devonning omborida bor.`,
      left: `Saidakbar's daughter loves her husband with a Tail girl's love, and he wants a receipt: the girl's thumbprint renouncing it, for ever.|Дочь Саидакбара любит мужа любовью девушки из Хвоста, и он хочет расписку: отпечаток пальца той девушки, что она отказывается от неё навсегда.|Saidakbarning qizi eriga Dumlik qizning muhabbati bilan qaraydi, u esa tilxat istaydi: o'sha qizning bosh barmoq izi — undan butunlay voz kechgani haqida.`,
      blackmail: `You took Saidakbar's money for your silence on a Divan contract. The Divan wants its share of what you earned on its goods.|Ты взял деньги Саидакбара за молчание по договору Дивана. Диван хочет свою долю того, что ты заработал на его товаре.|Devon shartnomasi bo'yicha sukuting uchun Saidakbardan pul olding. Devon o'z moli hisobidan topganingdan ulushini istaydi.`
    }[F().gulnora] || null;
    if (!pre) { play([['nodira', `Later, yodchi.|Позже, ёдчи.|Keyinroq, yodchi.`]], d); return; }
    play([['nodira', `You were at the wedding in the Ark. The Divan settles its accounts after weddings, the way other people sweep up.|Ты был на свадьбе в Арке. После свадеб Диван сводит счета — как другие подметают.|Arkdagi to'yda bo'lding. To'ydan keyin Devon hisob-kitob qiladi — boshqalar supurgandek.`], ['nodira', pre]], () => {
      FAC.begin('d2', `Nodira wants the business of Gulnora's love settled with the silk merchant Saidakbar, in the Ark gardens.|Нодира хочет, чтобы дело о любви Гульноры было улажено с шелкоторговцем Саидакбаром в садах Арка.|Nodira Gulnoraning muhabbati ishini ipak savdogari Saidakbar bilan Ark bog'larida hal qilishni istaydi.`, ['ark', 'roses']);
      if (g === 'blackmail') { d2Blackmail(d); return; }
      d();
    });
  };
  const d2Blackmail = d => ask(`Nodira's gold pen waits over the ledger.|Золотое перо Нодиры ждёт над книгой.|Nodiraning oltin qalami daftar ustida kutib turibdi.`, [
    { id: 'share', price: 40, label: `Pay the Divan its share.|Отдать Дивану его долю.|Devonga ulushini berish.` },
    FAC.chk('collection', 4, `"It was my risk, not the Divan's. The Divan wasn't in the room."|«Рисковал я, а не Диван. Дивана в той комнате не было.»|«Xavfni men o'z bo'ynimga olganman, Devon emas. Devon u xonada yo'q edi.»`, { id: 'argue' }, `Pressure|Давление|Bosim`),
    { id: 'refuse', label: `"No."|«Нет.»|«Yo'q.»` }
  ], o => {
    if (o.id === 'share') { FAC.add('divan', 8); FAC.finish('d2', 'share', `You paid the Divan forty tilla of the silk merchant's money.|Ты отдал Дивану сорок тилла из денег шелкоторговца.|Ipak savdogarining pulidan Devonga qirq tilla berding.`); play([['nodira', `See? Partners. It's so much simpler than enemies.|Видишь? Партнёры. Насколько это проще, чем враги.|Ko'rdingmi? Sheriklar. Dushmanlikdan qanchalik oson.`]], d); return; }
    if (o.id === 'argue' && o.ok) { FAC.add('divan', 4); FAC.finish('d2', 'argued', `You talked Nodira out of the Divan's share. She liked you better for it.|Ты отговорил Нодиру от доли Дивана. Она стала относиться к тебе лучше.|Nodirani Devon ulushidan qaytarding. Bundan keyin u senga yaxshiroq munosabatda bo'ldi.`); play([['nodira', `"The Divan wasn't in the room." I'll use that myself one day. Keep your tilla.|«Дивана в комнате не было». Как-нибудь сама так скажу. Оставь свою тиллу себе.|«Devon xonada yo'q edi». Bir kun o'zim ham shunday deyman. Tillangni o'zingga qoldir.`]], d); return; }
    FAC.add('divan', -12); FAC.finish('d2', 'refused', `You refused the Divan its share. Nodira wrote it down.|Ты отказал Дивану в его доле. Нодира это записала.|Devonga ulushini bermading. Nodira buni yozib qo'ydi.`); play([['nodira', `Then the Divan will take it some other way. It always does, yodchi. Usually with interest.|Тогда Диван возьмёт иначе. Он всегда берёт, ёдчи. Обычно с процентами.|Unda Devon boshqa yo'l bilan oladi. U doim oladi, yodchi. Odatda foizi bilan.`]], d);
  });
  const d2Merchant = d => {
    const g = F().gulnora;
    if (g === 'returned') play([
      ['saidakbar', `My daughter stood at her own wedding and asked who the groom was. In front of the whole Ark. Do you know what that costs a silk house?|Моя дочь стояла на собственной свадьбе и спрашивала, кто жених. При всём Арке. Знаешь, сколько это стоит шёлковому дому?|Qizim o'z to'yida turib, kuyov kim, deb so'radi. Butun Arkning ko'z o'ngida. Ipak xonadoniga bu qanchaga tushishini bilasanmi?`],
      ['saidakbar', `The Divan has another love for her. A potter's girl sold it last winter. Sing it into her and we'll call the whole thing a fainting fit.|У Дивана для неё есть другая любовь. Какая-то девчонка гончаров продала её прошлой зимой. Вселишь её дочери — и всё назовём обмороком.|Devonda uning uchun boshqa muhabbat bor. Kulollardan bir qiz o'tgan qish sotgan. Qizimga joylab qo'ysang, hammasini hushdan ketish deb ataymiz.`],
      () => (sadoAwake() ? ['sado', `Another girl's love. Again. It's like pouring water from one cracked bowl into another.|Опять чужая любовь. Как переливать воду из одной треснутой пиалы в другую.|Yana birovning muhabbati. Bir yorilgan piyoladan boshqasiga suv quygandek.`] : null)
    ], () => ask('', [
      FAC.craft('plant', `Sing the potter girl's love into the bride.|Вселить невесте любовь девушки гончаров.|Kelinga kulol qizning muhabbatini joylash.`, { id: 'planted' }),
      FAC.chk('collection', 3, `"Your daughter can learn to love the man herself. People used to."|«Пусть дочь сама научится любить мужа. Раньше люди умели.»|«Qizingiz erini o'zi sevishni o'rgansin. Ilgari odamlar uddalardi.»`, { id: 'talked' }, `Pressure|Давление|Bosim`),
      { id: 'asked', label: `Ask the bride what she wants.|Спросить невесту, чего хочет она.|Kelindan o'zi nima xohlashini so'rash.` }
    ], o => {
      if (o.id === 'planted') { FAC.plant(); FAC.add('divan', 12); FAC.add('tail', -6); FAC.finish('d2', 'planted', `You sang a potter girl's love into Saidakbar's daughter. The silk house is saved from gossip.|Ты вселил дочери Саидакбара любовь девушки гончаров. Шёлковый дом спасён от сплетен.|Saidakbarning qiziga kulol qizning muhabbatini joylading. Ipak xonadoni g'iybatdan qutuldi.`); play([['', `She blinks and looks at her husband, and her face softens like wax by a lamp. Somewhere in the Potters' Quarter a girl doesn't know what she has lost.|Она моргает, смотрит на мужа — и лицо её смягчается, как воск у лампы. Где-то в Квартале гончаров девушка не знает, чего лишилась.|U ko'zini pirpiratib, eriga qaraydi — yuzi chiroq yonidagi mumdek yumshaydi. Kulollar mahallasida bir qiz nimadan ayrilganini bilmaydi.`]], d); return; }
      if (o.id === 'talked' && o.ok) { FAC.add('divan', 4); trust(1); FAC.finish('d2', 'talked', `You talked Saidakbar out of buying another love. His daughter will have to manage with her own.|Ты отговорил Саидакбара покупать новую любовь. Дочери придётся обойтись своей.|Saidakbarni yangi muhabbat sotib olishdan qaytarding. Qizi o'zinikiga qanoat qilishiga to'g'ri keladi.`); play([['saidakbar', `People used to. People used to die of the plague, too. ...Fine. Fine. She'll learn. God help him.|Раньше умели. Раньше и от чумы умирали. ...Ладно. Ладно. Научится. Помоги ему бог.|Ilgari uddalashardi. Ilgari o'latdan ham o'lishardi. ...Mayli. Mayli. O'rganadi. Xudo unga yordam bersin.`]], d); return; }
      if (o.id === 'talked') { FAC.add('divan', -8); FAC.finish('d2', 'failed', `Saidakbar would not listen and complained to the Divan about you.|Саидакбар не стал слушать и пожаловался на тебя в Диван.|Saidakbar quloq solmadi va sen ustingdan Devonga shikoyat qildi.`); play([['saidakbar', `Lessons in love from a yodchi. I'll tell Nodira what the Divan's people are like these days.|Уроки любви от ёдчи. Расскажу Нодире, каких людей нынче держит Диван.|Yodchidan muhabbat darsi. Nodiraga Devon hozir qanaqa odamlarni ushlab turganini aytaman.`]], d); return; }
      FAC.add('divan', -4); trust(1); FAC.flag('bride', 'chose'); FAC.finish('d2', 'asked', `You asked the bride. She chose to stay married, and empty, and to see what grows.|Ты спросил невесту. Она решила остаться замужем — пустой — и посмотреть, что вырастет.|Kelindan so'rading. U turmushda — bo'm-bo'sh holda — qolishni va nima unib chiqishini ko'rishni tanladi.`);
      play([['bride', `Was it mine? What I felt? ...No? Then don't give me another one. I'd like to find out what I feel. Even if it's nothing.|То, что я чувствовала, было моим? ...Нет? Тогда не давайте мне другого. Хочу узнать, что я чувствую сама. Даже если ничего.|Men his qilgan narsa meniki edimi? ...Yo'qmi? Unda menga boshqasini bermang. O'zim nima his qilishimni bilmoqchiman. Hech narsa bo'lsa ham.`]], d);
    }));
    else play([
      ['saidakbar', `My daughter is happy. Remarkably happy. I'd like it to stay that way. On paper.|Моя дочь счастлива. На удивление счастлива. Хочу, чтобы так и осталось. На бумаге.|Qizim baxtli. Hayratlanarli darajada baxtli. Shunday qolishini istayman. Qog'ozda.`],
      ['saidakbar', `The Tail girl's thumbprint renouncing the love. For ever. Thirty tilla to her family; her mother's medicine, I hear.|Отпечаток пальца той девицы из Хвоста — что отказывается от любви. Навсегда. Тридцать тилла её семье: на лекарство матери, я слышал.|Dumdagi qizning bosh barmoq izi — muhabbatdan voz kechgani haqida. Butunlay. Uning oilasiga o'ttiz tilla: onasining dorisiga, eshitishimcha.`]
    ], () => ask('', [
      { id: 'thumb', label: `Take the paper to Gulnora. Let her decide what thirty tilla is worth.|Отнести бумагу Гульноре. Пусть решит, чего стоят тридцать тилла.|Qog'ozni Gulnoraga olib borish. O'ttiz tilla qanchaga arzishini o'zi hal qilsin.` },
      FAC.chk('agi', 4, `Press a thumbprint onto it yourself, from a cup she drank from. She'll never know.|Самому поставить отпечаток — снять с пиалы, из которой она пила. Она никогда не узнает.|O'zing barmoq izini qo'yish — u ichgan piyoladan olib. U hech qachon bilmaydi.`, { id: 'forged' }, `Sleight of hand|Ловкость рук|Qo'l chaqqonligi`),
      FAC.chk('collection', 3, `"Love doesn't keep receipts, Saidakbar. Go home."|«Любовь расписок не даёт, Саидакбар. Иди домой.»|«Muhabbat tilxat bermaydi, Saidakbar. Uyingga bor.»`, { id: 'refused' }, `Pressure|Давление|Bosim`)
    ], o => {
      if (o.id === 'thumb') { FAC.add('divan', 12); FAC.add('tail', -6); FAC.finish('d2', 'thumb', `Gulnora signed away her first love for thirty tilla and her mother's medicine.|Гульнора за тридцать тилла и лекарство для матери отказалась от первой любви.|Gulnora o'ttiz tilla va onasining dorisi uchun birinchi muhabbatidan voz kechdi.`); play([['gulnora', `I sold it once. Signing is easier than selling. It doesn't hurt at all. That's what frightens me.|Один раз я её уже продала. Подписать легче, чем продать. Совсем не больно. Вот это и пугает.|Bir marta sotganman. Imzolash sotishdan oson. Umuman og'rimaydi. Qo'rqitadigani ham shu.`]], d); return; }
      if (o.id === 'forged') {
        if (o.ok) { FAC.add('divan', 10); FAC.flag('gulnoraForged', 1); FAC.finish('d2', 'forged', `You forged Gulnora's thumbprint. The merchant has his receipt; she never knew it was asked for.|Ты подделал отпечаток Гульноры. У купца есть расписка; она так и не узнала, что её просили.|Gulnoraning barmoq izini qalbakilashtirding. Savdogarning tilxati bor; u esa bu so'ralganini hech qachon bilmadi.`); play([['saidakbar', `Splendid. A clean print, a clean conscience. Nodira will hear how useful you are.|Превосходно. Чистый отпечаток, чистая совесть. Нодира узнает, как ты полезен.|Ajoyib. Toza iz, toza vijdon. Nodira qanchalik foydali ekaningni eshitadi.`]], d); }
        else { FAC.add('divan', -10); FAC.finish('d2', 'failed', `The forged print smudged. Saidakbar called it an insult and complained to the Divan.|Поддельный отпечаток размазался. Саидакбар назвал это оскорблением и пожаловался в Диван.|Qalbaki iz surkalib ketdi. Saidakbar buni haqorat deb, Devonga shikoyat qildi.`); play([['saidakbar', `A smear. You bring me a smear. Is that how the Divan's people sign things now?|Пятно. Ты принёс мне пятно. Так нынче подписывают люди Дивана?|Dog'. Menga dog' olib kelding. Devon odamlari hozir shunday imzo qo'yishadimi?`]], d); }
        return;
      }
      if (o.ok) { FAC.add('divan', 4); FAC.add('tail', 4); FAC.finish('d2', 'refused', `You sent Saidakbar home without his receipt. He went quietly; love doesn't keep receipts.|Ты отправил Саидакбара домой без расписки. Он ушёл молча: любовь расписок не даёт.|Saidakbarni tilxatsiz uyiga jo'natding. U indamay ketdi: muhabbat tilxat bermaydi.`); play([['saidakbar', `...No. It doesn't, does it. My wife never gave me one either.|...Нет. Не даёт, верно. Моя жена мне тоже никогда не давала.|...Yo'q. Bermaydi, to'g'ri. Xotinim ham menga hech qachon bermagan.`]], d); }
      else { FAC.add('divan', -6); FAC.finish('d2', 'failed', `Saidakbar took your refusal badly and the Divan heard of it.|Саидакбар плохо принял твой отказ, и Диван об этом узнал.|Saidakbar raddingni yomon qabul qildi va Devon bundan xabar topdi.`); play([['saidakbar', `I'll have it written some other way. The Divan employs many hands.|Найду, кто напишет иначе. У Дивана много рук.|Boshqacha yozadigan odam topaman. Devonning qo'li ko'p.`]], d); }
    }));
  };
  FAC.talk.saidakbar = d => { if (act('d2') && F().gulnora !== 'blackmail') d2Merchant(d); else play([['', FAC.NPC.saidakbar.def.idle]], d); };

  /* ================================================================ d3 · Salt and Chains */
  const d3Offer = d => play([
    ['nodira', `The convicts in the Salt Mines have taken the lower galleries. No salt has come up in four days. The Divan would like salt.|Каторжники в Соляных шахтах захватили нижние галереи. Четыре дня соли нет. Диван хотел бы соли.|Tuz konlaridagi mahkumlar pastki yo'laklarni egallab olishdi. To'rt kundan beri tuz chiqmayapti. Devon tuz istaydi.`],
    ['nodira', `Go down. Make it stop. How is yours to choose, within reason. The Divan has a generous idea of reason.|Спустись. Прекрати это. Как — решай сам, в разумных пределах. У Дивана щедрые представления о разумном.|Pastga tush. Buni to'xtat. Qanday qilib — o'zing hal qil, aql doirasida. Devonning aql haqidagi tasavvuri keng.`]
  ], () => { FAC.begin('d3', `The convicts have taken the lower galleries of the Salt Mines. Nodira wants it stopped.|Каторжники захватили нижние галереи Соляных шахт. Нодира хочет, чтобы это прекратилось.|Mahkumlar Tuz konlarining pastki yo'laklarini egallab olishdi. Nodira buni to'xtatishni istaydi.`, ['mines', 'face']); d(); });
  const d3Rebels = d => play([
    ['', `The lower gallery is lit by salt lamps. Forty men in chains sit with their picks across their knees, like a council.|Нижняя галерея освещена соляными лампами. Сорок человек в цепях сидят с кайлами поперёк колен, будто совет старейшин.|Pastki yo'lak tuz chiroqlari bilan yoritilgan. Zanjirdagi qirq kishi cho'qmorlarini tizzalariga ko'ndalang qo'yib, kengashdagidek o'tirishibdi.`],
    ['qahramon', `We dig salt out of the Sleeper's body until our hands bleed white. The debt never shrinks. They charge us for the salt we eat.|Мы рубим соль из тела Спящего, пока руки не начнут кровить белым. Долг не уменьшается. С нас берут за соль, которую мы едим.|Biz Uxlovchining tanasidan tuz qazaymiz, qo'llarimizdan oq qon oqquncha. Qarz kamaymaydi. Yeydigan tuzimiz uchun ham haq olishadi.`],
    ['convict', `He's right, yodchi. Only ask him what happened to the old overseer. Ask him whose chain it was.|Он прав, ёдчи. Только спроси его, что стало со старым надсмотрщиком. Спроси, чья это была цепь.|U haq, yodchi. Faqat undan eski nazoratchiga nima bo'lganini so'ra. Bu kimning zanjiri bo'lganini so'ra.`],
    ['qahramon', `Mine. I strangled him with it. He'd whipped a boy to death for sitting down. I'd do it again, and I'll do it to the next one.|Моя. Я его ею задушил. Он засёк мальчишку до смерти за то, что тот присел. Сделал бы снова. И со следующим сделаю.|Meniki. Uni shu bilan bo'g'ib o'ldirdim. U bir bolani o'tirgani uchun qamchilab o'ldirgan edi. Yana qilardim. Keyingisiga ham qilaman.`],
    () => (FAC.flag('hamid') === 'mines' ? ['hamid', `You brought me here, yodchi. I'm not angry. I'm just telling you where I am.|Это ты меня сюда привёл, ёдчи. Я не злюсь. Просто говорю, где я.|Meni bu yerga sen olib kelding, yodchi. Jahlim chiqmayapti. Qayerdaligimni aytyapman, xolos.`] : null),
    cl('alp', `...That one. The convict by the wall. He looks at Alp like he knows Alp. Alp does not know him.|...Вон тот. Каторжник у стены. Смотрит на Алпа, будто знает Алпа. Алп его не знает.|...Anavi. Devor yonidagi mahkum. Alpga Alpni taniydigandek qarayapti. Alp uni tanimaydi.`)
  ], () => ask(`The Divan wants salt. The convicts want daylight. Qahramon wants the next overseer.|Дивану нужна соль. Каторжникам — дневной свет. Кахрамону — следующий надсмотрщик.|Devonga tuz kerak. Mahkumlarga — kunduzgi yorug'lik. Qahramonga — keyingi nazoratchi.`, [
    FAC.chk('str', 6, `"Back to the face, all of you, or the guards come down instead of me."|«Все к забою, или вместо меня спустится стража.»|«Hamma ish joyiga, bo'lmasa mening o'rnimga soqchilar tushadi.»`, { id: 'crushed' }, `Threat|Угроза|Tahdid`),
    { id: 'led', label: `"Then let's go up. All of you. I know the karez."|«Тогда пошли наверх. Все. Я знаю кяризы.»|«Unda yuqoriga chiqamiz. Hammamiz. Korizlarni bilaman.»` },
    FAC.chk('collection', 4, `"Give me Qahramon, and I'll get the rest of you a lighter tally in writing."|«Отдайте мне Кахрамона — а остальным я добуду послабление в счёте. Письменно.»|«Menga Qahramonni beringlar — qolganlaringga hisobda yengillikni yozma ravishda olib beraman.»`, { id: 'deal' }, `Pressure|Давление|Bosim`),
    { id: 'killed', label: `Wait until he sleeps. Use the same chain.|Дождаться, пока он заснёт. Той же цепью.|U uxlaguncha kutish. O'sha zanjir bilan.` }
  ], o => {
    const end = (br, text, more) => { FAC.finish('d3', br, text); play(more || [], d); };
    if (o.id === 'crushed') {
      if (o.ok) { FAC.add('divan', 15); FAC.add('tail', -10); FAC.react({ alp: -15, nargiza: -10 }, 'crushed the revolt'); end('crushed', `You drove the convicts back to the salt face without a drop of blood. The salt goes up again.|Ты загнал каторжников обратно к забою без капли крови. Соль снова идёт наверх.|Mahkumlarni bir tomchi qon to'kmasdan ish joyiga qaytarding. Tuz yana yuqoriga chiqyapti.`, [['qahramon', `Strong arms on a yodchi. ...We'll remember who kept us down here.|Сильные руки у ёдчи. ...Мы запомним, кто нас тут удержал.|Yodchining qo'li kuchli ekan. ...Bizni bu yerda kim ushlab qolganini eslab qolamiz.`]]); }
      else { FAC.add('divan', 10); FAC.add('tail', -15); FAC.react({ alp: -20, nargiza: -20 }, 'blood in the mines'); FAC.flag('minesBlood', 1); end('crushed', `They didn't believe your threat. The guards came down instead. Salt goes up again; so did eleven bodies.|Угрозе не поверили. Вместо тебя спустилась стража. Соль снова идёт наверх — а с ней подняли одиннадцать тел.|Tahdidingga ishonishmadi. Sening o'rningga soqchilar tushdi. Tuz yana yuqoriga chiqyapti — u bilan birga o'n bitta jasad ham.`, [['', `The salt lamps are kicked over. In the dark the chains sound like rain on a tin roof, and then they stop.|Соляные лампы опрокинуты. В темноте цепи звенят, как дождь по жестяной крыше, — а потом перестают.|Tuz chiroqlari ag'darilgan. Qorong'ida zanjirlar tunuka tomdagi yomg'irdek jaranglaydi — keyin to'xtaydi.`]]); }
    } else if (o.id === 'led') {
      FAC.add('divan', -30); FAC.add('tail', 15); FAC.add('remember', 8); FAC.add('rabat', 5); FAC.closeArc('divan', 'led the revolt'); FAC.react({ alp: 15, surayyo: 10 }, 'led them out');
      end('led', `You led the convicts out through the karez. The Divan will not forgive it.|Ты вывел каторжников через кяризы. Диван этого не простит.|Mahkumlarni korizlar orqali olib chiqding. Devon buni kechirmaydi.`, [['', `Forty men, chains wrapped in rags so they don't ring, walk behind you in the dark. At the top, one of them laughs at the sky as if it owed him money.|Сорок человек, цепи обмотаны тряпками, чтобы не звенели, идут за тобой в темноте. Наверху один из них смеётся над небом, будто оно ему должно.|Qirq kishi, zanjirlari jaranglamasin deb latta bilan o'ralgan, qorong'ida orqangdan keladi. Tepada ulardan biri osmonga qarab kuladi — go'yo u unga qarzdordek.`], ['qahramon', `I owe you. I'll pay it the only way I know.|Я тебе должен. Отдам, как умею.|Senga qarzdorman. Qo'limdan kelganicha uzaman.`]]);
    } else if (o.id === 'deal') {
      if (o.ok) { FAC.add('divan', 8); FAC.add('tail', 6); FAC.flag('qahramon', 'handed'); end('deal', `The convicts handed over Qahramon. The Divan put a lighter tally in writing. Nobody asked what happened to him.|Каторжники выдали Кахрамона. Диван письменно облегчил им счёт. Что стало с Кахрамоном, никто не спрашивал.|Mahkumlar Qahramonni topshirdi. Devon ularning hisobini yozma ravishda yengillashtirdi. Qahramonga nima bo'lganini hech kim so'ramadi.`, [['qahramon', `Fair. I'd have sold me too. Write it neatly, yodchi.|Справедливо. Я бы себя тоже продал. Пиши аккуратно, ёдчи.|Adolatli. Men ham o'zimni sotardim. Chiroyli yoz, yodchi.`]]); }
      else { FAC.add('divan', 6); FAC.add('tail', -12); FAC.react({ nargiza: -15, alp: -10 }, 'the deal broke'); FAC.flag('minesBlood', 1); end('crushed', `Your offer broke on Qahramon's laugh. The guards ended the talking.|Твоё предложение разбилось о смех Кахрамона. Разговоры закончила стража.|Taklifing Qahramonning kulgisiga urilib sindi. Gaplarni soqchilar tugatdi.`, [['qahramon', `A tally. In writing. Ha! Go up and tell them we said no, in writing.|Счёт. Письменно. Ха! Поднимись и передай им наше «нет». Письменно.|Hisob. Yozma ravishda. Ha! Tepaga chiqib, ularga «yo'q» deganimizni ayt. Yozma ravishda.`]]); }
    } else {
      FAC.add('divan', 10); FAC.add('tail', -5); addVoid(3, `a man killed in his sleep|человек, убитый во сне|uyqusida o'ldirilgan odam`); trust(-1); FAC.react({ nargiza: -20, alp: -10 }, 'killed in his sleep'); FAC.flag('qahramon', 'killed');
      end('killed', `You killed Qahramon in his sleep with his own chain. Without him the revolt went out like a lamp.|Ты убил Кахрамона во сне его же цепью. Без него бунт погас, как лампа.|Qahramonni uyqusida o'z zanjiri bilan o'ldirding. Usiz qo'zg'olon chiroqdek o'chdi.`, [['', `In the morning the convicts find him and say nothing. By noon they're back at the face. Nobody looks at you, which is a way of looking.|Утром его находят и молчат. К полудню все снова у забоя. На тебя никто не смотрит — и это тоже способ смотреть.|Ertalab uni topishadi va indamaydilar. Tushga borib hamma yana ish joyida. Hech kim senga qaramaydi — bu ham qarashning bir turi.`], () => (sadoAwake() ? ['sado', `He killed a man who killed a boy. And you killed him. Where does it stop, Ravshan? Does it stop?|Он убил того, кто убил мальчишку. А ты — его. Где это кончается, Равшан? Оно вообще кончается?|U bolani o'ldirgan odamni o'ldirdi. Sen esa uni. Bu qayerda tugaydi, Ravshan? Umuman tugaydimi?`] : null)]);
    }
  }));
  FAC.talk.qahramon = d => { if (act('d3')) d3Rebels(d); else play([['', FAC.NPC.qahramon.def.idle]], d); };

  /* ================================================================ d4 · The Cellar of a Thousand Childhoods (the double-play check) */
  const d4 = d => FAC.suspicionCheck('divan', 'tillabek', out => play([
    ['tillabek', `Come down. Mind the third step: it remembers my grandfather falling on it.|Спускайся. Осторожно, третья ступенька: она помнит, как с неё упал мой дед.|Pastga tush. Uchinchi zinaga ehtiyot bo'l: bobomning undan yiqilganini eslaydi.`],
    ['', `Shelves to the vaulted ceiling. On each, tumars in rows, each with a paper tag: "Bukhara. A boy. Apricot season." "Khiva. A girl. First snow." "The Tail. Twins. A kite."|Полки до сводчатого потолка. На каждой — ряды тумаров, у каждого бумажная бирка: «Бухара. Мальчик. Пора абрикосов». «Хива. Девочка. Первый снег». «Хвост. Близнецы. Воздушный змей».|Gumbaz shiftigacha tokchalar. Har birida qator-qator tumarlar, har birida qog'oz yorliq: «Buxoro. O'g'il bola. O'rik pishig'i». «Xiva. Qiz bola. Birinchi qor». «Dum. Egizaklar. Varrak».`],
    ['tillabek', `Choose one. Any. A childhood is the only thing in this city I won't sell. I give them.|Выбирай. Любое. Детство — единственное, чего я в этом городе не продаю. Я его дарю.|Tanla. Istaganingni. Bolalik — bu shaharda men sotmaydigan yagona narsa. Men uni hadya qilaman.`]
  ], () => hub(`A thousand childhoods breathe on the shelves, very quietly.|Тысяча детств дышит на полках, очень тихо.|Tokchalarda ming bolalik juda sekin nafas olyapti.`, [
    { label: `— Whose are they?|— Чьи они?|— Bular kimniki?`, lines: [['tillabek', `Debtors'. Parents sell what they think the child won't miss. They're always wrong, and they're always poor.|Должников. Родители продают то, чего ребёнку, как им кажется, не хватится. Они всегда ошибаются. И всегда бедны.|Qarzdorlarniki. Ota-onalar bolasi sezmaydi, deb o'ylagan narsani sotishadi. Ular doim adashadi. Va doim kambag'al bo'lishadi.`]] },
    { label: `— Why give one to me?|— Почему мне?|— Nega menga?`, lines: [['tillabek', `Because a man with a borrowed childhood is grateful in a way that lasts. I'm buying your gratitude, yodchi, and paying in advance.|Потому что человек с одолженным детством благодарен надолго. Я покупаю твою благодарность, ёдчи, и плачу вперёд.|Chunki qarzga olingan bolaligi bor odam uzoq vaqt minnatdor bo'ladi. Men sening minnatdorchiligingni sotib olyapman, yodchi, va oldindan to'layapman.`]] }
  ], [
    FAC.craft('taste', `Choose "Bukhara, a boy, apricot season", and drink it.|Выбрать «Бухара, мальчик, пора абрикосов» — и испить.|«Buxoro, o'g'il bola, o'rik pishig'i»ni tanlab, ichish.`, { id: 'drank' }),
    FAC.chk('agi', 6, `Thank him, and slip "The Tail. Twins. A kite." into your sleeve on the way out. It goes home.|Поблагодарить — и на выходе сунуть в рукав «Хвост. Близнецы. Воздушный змей». Пусть вернётся домой.|Rahmat aytish — chiqishda esa «Dum. Egizaklar. Varrak»ni yengga solish. Uyiga qaytsin.`, { id: 'stole' }, `Sleight of hand|Ловкость рук|Qo'l chaqqonligi`),
    { id: 'refused', label: `"I have one of my own. More or less."|«У меня своё есть. Более-менее.»|«Meniki o'zimda bor. Ozmi-ko'pmi.»` }
  ], o => {
    if (o.id === 'drank') {
      addVoid(8, `a stranger's childhood|чужое детство|birovning bolaligi`); try { G.CH.addAttr('mem', 1); } catch (e) { /* ignore */ }
      FAC.add('divan', 10); FAC.flag('d4', 'drank');
      FAC.finish('d4', 'drank', `You drank a stranger's childhood from Tilla-bek's cellar. Your memory is sharper; something in you is borrowed.|Ты испил чужое детство из погреба Тилла-бека. Память стала острее; что-то в тебе теперь взято взаймы.|Tilla-bek yerto'lasidan birovning bolaligini totding. Xotirang o'tkirlashdi; ichingdagi nimadir endi qarzga olingan.`);
      play([['', `Apricots. A ladder. A grandmother who shouts from the yard, and you are seven and immortal, and none of it was ever yours.|Абрикосы. Лестница. Бабушка кричит со двора, а тебе семь лет, и ты бессмертный, и ничего этого у тебя никогда не было.|O'rik. Narvon. Buvi hovlidan baqiradi, sen esa yetti yoshdasan, o'lmassan, va bularning hech biri hech qachon seniki bo'lmagan.`], ['tillabek', `There. Now you owe me a childhood. It's the nicest debt in the city. I'll never call it in.|Ну вот. Теперь ты должен мне детство. Самый приятный долг в городе. Я никогда его не взыщу.|Mana. Endi menga bir bolalik qarzdorsan. Shahardagi eng yoqimli qarz. Uni hech qachon undirmayman.`]], d);
    } else if (o.id === 'stole') {
      if (o.ok) { FAC.add('tail', 10); FAC.flag('d4', 'stole'); FAC.react({ alp: 10 }, 'a childhood stolen back'); FAC.finish('d4', 'stole', `You stole a pair of twins' childhood from Tilla-bek's shelves and carried it back to the Tail. He hasn't noticed — yet.|Ты украл с полок Тилла-бека детство двух близнецов и отнёс в Хвост. Он пока не заметил.|Tilla-bek tokchalaridan egizaklarning bolaligini o'g'irlab, Dumga olib bording. U hali sezmadi.`); play([['tillabek', `Leaving empty-handed? How principled. Come back when principle gets heavy.|Уходишь с пустыми руками? Какая принципиальность. Приходи, когда принципы станут тяжелы.|Quruq qo'l bilan ketyapsanmi? Qanday tamoyilli. Tamoyillar og'irlik qilganda kel.`], ['', `In a Tail courtyard two grown men stand very still, holding a tumar between them, and then both start talking at once about a kite.|Во дворе в Хвосте двое взрослых мужчин стоят очень тихо, держа тумар вдвоём, — а потом оба разом начинают говорить про воздушного змея.|Dumdagi bir hovlida ikki katta yoshli erkak tumarni ikkalasi ushlagancha jim turishadi — keyin ikkalasi birdan varrak haqida gapira boshlaydi.`]], d); }
      else { FAC.add('divan', -20); FAC.crime && FAC.crime('theft', { fac: 'divan', seen: true, quiet: true }); FAC.finish('d4', 'caught', `Tilla-bek caught your hand on his shelf. He laughed, and called the guards anyway.|Тилла-бек поймал твою руку у полки. Посмеялся — и всё равно позвал стражу.|Tilla-bek qo'lingni tokcha yonida ushlab oldi. Kuldi — baribir soqchilarni chaqirdi.`); play([['tillabek', `A thief in my cellar of gifts. That's almost poetry. Guards! ...Gently. He's a poet.|Вор в моём погребе подарков. Почти поэзия. Стража! ...Бережно. Он поэт.|Hadyalar yerto'lamda o'g'ri. Deyarli she'r. Soqchilar! ...Ehtiyot bo'linglar. U shoir.`]], d); }
    } else {
      FAC.add('divan', -6); trust(1); FAC.flag('d4', 'refused');
      FAC.finish('d4', 'refused', `You refused Tilla-bek's gift. He found that amusing, and remembered it.|Ты отказался от подарка Тилла-бека. Ему это показалось забавным — и он это запомнил.|Tilla-bekning hadyasini rad etding. Unga bu qiziq tuyuldi — va u buni eslab qoldi.`);
      play([['tillabek', `More or less. That's the most honest thing anyone has said in this cellar. You may go up first.|Более-менее. Самое честное, что тут, в погребе, когда-либо говорили. Можешь подниматься первым.|Ozmi-ko'pmi. Bu yerto'lada aytilgan eng halol gap. Birinchi bo'lib chiqishing mumkin.`]], d);
    }
  })));

  /* ================================================================ d5 · The Heirs */
  const d5 = d => FAC.paidBack('divan', () => play([
    ['', `Tilla-bek's study smells of cedar and ink. On the wall hangs a chain, gilded link by link, like a relic.|Кабинет Тилла-бека пахнет кедром и чернилами. На стене висит цепь, позолоченная звено за звеном, как реликвия.|Tilla-bekning xonasidan sadr va siyoh hidi keladi. Devorda zanjir osig'liq, har bir halqasi zarhallangan, xuddi muqaddas buyumdek.`],
    ['tillabek', `You've tasted the founders. So you know. My great-great-grandfather chained a god and called it a treaty with the Singers.|Ты пробовал основателей. Значит, знаешь. Мой прапрадед посадил бога на цепь и назвал это договором с Певцами.|Asoschilarni totib ko'rgansan. Demak, bilasan. Katta bobomning bobosi xudoni zanjirband qilib, buni xonandalar bilan shartnoma deb atagan.`],
    ['tillabek', `I don't deny it. The city is built on a chain. I propose that the chain at least pay.|Я не отрицаю. Город построен на цепи. Я предлагаю, чтобы цепь хотя бы платила.|Inkor etmayman. Shahar zanjir ustiga qurilgan. Men taklif qilyapman: zanjir hech bo'lmasa to'lasin.`]
  ], () => hub(`The gilded chain catches the lamp and throws it back.|Позолоченная цепь ловит свет лампы и отбрасывает его обратно.|Zarhal zanjir chiroq nurini tutib, qaytarib otadi.`, [
    { label: `— Pay whom?|— Платила кому?|— Kimga to'lasin?`, lines: [['tillabek', `Everyone. No more tithe, from anyone. The Sleeper raises water when we ask, and caravans pay to carry memory to every bazaar from here to the sea. The Tail would dig wells and be paid in water.|Всем. Никакой десятины, ни с кого. Спящий поднимает воду, когда попросим, а караваны платят, чтобы везти память на все базары отсюда до моря. Хвост копал бы колодцы и получал бы водой.|Hammaga. Hech kimdan ushr yo'q. Uxlovchi so'raganimizda suv chiqaradi, karvonlar esa xotirani bu yerdan dengizgacha hamma bozorlarga olib borish uchun pul to'laydi. Dum quduq qazib, haqini suv bilan olardi.`]] },
    FAC.chk('mem', 6, `— Let me hold your signet.|— Дайте подержать ваш перстень.|— Muhr uzugingizni ushlab ko'ray.`, { lines: done2 => !FAC.check('mem', 6).ok ? play([['', `The ring is cold and says nothing to you. Tilla-bek takes it back with two fingers.|Перстень холодный и ничего тебе не говорит. Тилла-бек забирает его двумя пальцами.|Uzuk sovuq, senga hech narsa demaydi. Tilla-bek uni ikki barmog'i bilan qaytarib oladi.`], ['tillabek', `Some things only open for family.|Кое-что открывается только своим.|Ba'zi narsalar faqat o'z odamiga ochiladi.`]], done2) : FAC.taste([
      ['memory', `A tent. Seven men around a ledger by lamplight. One writes: "Item: one spirit, sleeping. Item: four hundred captives, their memories. Item: a song."|Шатёр. Семеро вокруг книги при лампе. Один пишет: «Статья: один дух, спящий. Статья: четыреста пленников, их память. Статья: песня».|Chodir. Chiroq yorug'ida daftar atrofida yetti kishi. Biri yozadi: «Band: bitta ruh, uxlayotgan. Band: to'rt yuz asir, ularning xotirasi. Band: qo'shiq».`],
      ['memory', `"And the Singers?" "Give them the Well and a story. Singers like stories."|«А Певцы?» — «Дайте им Колодец и сказку. Певцы любят сказки».|«Xonandalar-chi?» — «Ularga Quduq va bir ertak bering. Xonandalar ertakni yaxshi ko'radi».`]
    ], () => { FAC.flag('d5signet', 1); done2(); }) }, `Taste|Испить|Totish`)
  ], [
    { id: 'partner', label: `"Then let it pay me too."|«Тогда пусть платит и мне.»|«Unda menga ham to'lasin.»` },
    { id: 'leave', label: `"A chain that pays is still a chain."|«Цепь, которая платит, — всё равно цепь.»|«To'laydigan zanjir baribir zanjir.»` }
  ], o => {
    if (o.id === 'partner') {
      FAC.add('divan', 15); FAC.react({ alp: -15, nargiza: -10 }, 'partnered the Divan');
      FAC.finish('d5', 'partner', `You took Tilla-bek's hand. When the chain song is sung, he wants it in your voice.|Ты принял руку Тилла-бека. Когда запоют песнь цепи, он хочет услышать её твоим голосом.|Tilla-bekning qo'lini olding. Zanjir qo'shig'i kuylanganda, u uni sening ovozingda eshitmoqchi.`);
      play([['tillabek', `Partners. You'll find I'm a very good partner. I only ever cheat strangers.|Партнёры. Вот увидишь, партнёр я отличный. Обманываю я только чужих.|Sheriklar. Ko'rasan, men juda yaxshi sherikman. Faqat begonalarni aldayman.`]], d);
    } else {
      FAC.add('divan', -20); FAC.closeArc('divan', 'left'); FAC.react({ alp: 10 }, 'left the Divan');
      FAC.finish('d5', 'leave', `You turned down Tilla-bek's partnership. The Divan's doors will open more slowly now.|Ты отказался от партнёрства с Тилла-беком. Двери Дивана теперь будут открываться медленнее.|Tilla-bek bilan sheriklikni rad etding. Devon eshiklari endi sekinroq ochiladi.`);
      play([['tillabek', `Still a chain. Yes. And you'll still drink water it raised. Good evening, yodchi.|Всё равно цепь. Да. А воду, которую она поднимет, ты всё равно будешь пить. Доброго вечера, ёдчи.|Baribir zanjir. Ha. U chiqargan suvni esa baribir ichasan. Xayrli kech, yodchi.`]], d);
    }
  })));

  /* ================================================================ d6 · The Chain Song (Act III, the Dream) */
  const d6 = d => play([
    ['', `Gold light spills across the dream street. The shadow of wide wings falls on the paving, and Tilla-bek walks on the shadow as if it were a carpet.|По улице сна разливается золотой свет. На мостовую ложится тень широких крыльев, и Тилла-бек идёт по этой тени, как по ковру.|Tush ko'chasiga oltin nur yoyiladi. Toshyo'lga keng qanotlar soyasi tushadi, Tilla-bek esa bu soya ustidan gilam ustidan yurgandek yuradi.`],
    ['tillabek', `The Humo's shadow fell on me, yodchi. I'm only sharing it. Sing the founders' song with me and hold the chain, and you'll never knock on a door again.|На меня пала тень Хумо, ёдчи. Я лишь делюсь ею. Спой со мной песню основателей, держи цепь — и тебе больше никогда не придётся стучать в чужие двери.|Menga Humo soyasi tushdi, yodchi. Men faqat uni baham ko'ryapman. Men bilan asoschilar qo'shig'ini kuyla, zanjirni ushla — boshqa hech qachon birovning eshigini taqillatmaysan.`],
    ['', `Above him, Humo turns slowly in the gold: a bird built of coins, and inside the coins, a thousand children laughing very far away.|Над ним в золоте медленно кружит Хумо: птица из монет, а внутри монет — тысяча детей, смеющихся где-то очень далеко.|Uning tepasida, oltin ichida Humo sekin aylanadi: tangalardan yasalgan qush, tangalar ichida esa juda uzoqda ming bola kulyapti.`],
    cl('alp', `...Alp knows that shadow. Alp stood in it a long time. It is warm. That is the bad part.|...Алп знает эту тень. Алп долго в ней стоял. Она тёплая. В этом и беда.|...Alp bu soyani taniydi. Alp uning ichida uzoq turgan. U iliq. Yomoni ham shunda.`)
  ], () => ask(`The song waits in your throat like a swallowed coin.|Песня ждёт в горле, как проглоченная монета.|Qo'shiq tomog'ingda yutib yuborilgan tangadek kutib turibdi.`, [
    { id: 'help', label: `Sing it with him.|Спеть вместе с ним.|U bilan birga kuylash.`, lock: FAC.flag('helped6') ? `You already gave your voice to someone tonight.|Сегодня ты уже отдал свой голос другому.|Bugun ovozingni boshqaga berib bo'lding.` : null },
    { id: 'fight', label: `"No more selling." Break the bird.|«Хватит торговать». Разбить птицу.|«Savdo bas». Qushni sindirish.` },
    { id: 'away', label: `Walk out of the gold light and leave him to it.|Выйти из золотого света и оставить его с этим.|Oltin nurdan chiqib, uni bu ish bilan yolg'iz qoldirish.` }
  ], o => {
    if (o.id === 'help') {
      FAC.flag('helped6', 'divan'); F().faction = 'divan'; F().chainSong = 1; save();
      FAC.add('divan', 20); FAC.add('tail', -10); FAC.react({ alp: -40, surayyo: -20, nargiza: -20 }, 'the chain song');
      try { G.CH.grantLegend('humo'); } catch (e) { /* ignore */ }
      FAC.finish('d6', 'help', `You sang the chain song with Tilla-bek. The Divan's plan is the one under way, and the song is in you now.|Ты спел песнь цепи с Тилла-беком. В ход пошёл план Дивана, и песня теперь в тебе.|Tilla-bek bilan zanjir qo'shig'ini kuylading. Devonning rejasi amalga oshmoqda, qo'shiq esa endi senda.`, { xp: 'arc' });
      play([['', `The song is simple, like a knot. When it's done, Humo folds its wings and settles on Tilla-bek's arm as a shield.|Песня простая, как узел. Когда она кончается, Хумо складывает крылья и садится Тилла-беку на руку щитом.|Qo'shiq tugundek oddiy. Tugagach, Humo qanotlarini yig'ib, Tilla-bekning qo'liga qalqon bo'lib qo'nadi.`], ['tillabek', `Take it. My shield. A partner should be harder to hit than a stranger.|Возьми. Мой щит. Партнёра должно быть труднее ударить, чем чужака.|Ol. Mening qalqonim. Sherikka zarba berish begonaga qaraganda qiyinroq bo'lishi kerak.`]], d);
    } else if (o.id === 'fight') {
      FAC.flag('fight6', 'divan');
      play([['tillabek', `Pity. You'd have been magnificent at it. Humo — show the yodchi what a thousand childhoods weigh.|Жаль. У тебя вышло бы великолепно. Хумо — покажи ёдчи, сколько весит тысяча детств.|Attang. Sen buni ajoyib uddalarding. Humo — yodchiga ming bolalik qancha tortishini ko'rsat.`]], () => { d(); FAC.goLair('f_humo'); });
    } else {
      FAC.add('divan', -10); FAC.finish('d6', 'away', `You walked out of Tilla-bek's gold light. He sang alone.|Ты вышел из золотого света Тилла-бека. Он пел один.|Tilla-bekning oltin nuridan chiqib ketding. U yolg'iz kuyladi.`, { noXp: true });
      play([['tillabek', `Then I'll sing it badly, alone. The chain doesn't care about the voice.|Тогда спою плохо, один. Цепи всё равно, чей голос.|Unda yolg'iz, yomon kuylayman. Zanjirga kimning ovozi baribir.`]], d);
    }
  }));

  /* ---------------------------------------------------------------- menus */
  FAC.talk.nodira = d => {
    const o = [];
    if (FAC.Q.d1.offer() && q('d1').st === 'none') o.push({ label: `— Work for the Divan?|— Есть работа от Дивана?|— Devondan ish bormi?`, go: d1Offer });
    if (FAC.Q.d2.offer() && q('d2').st === 'none') o.push({ label: `— You wanted me, Nodira?|— Вы меня искали, Нодира?|— Meni qidirgan ekansiz, Nodira?`, go: d2Offer });
    if (FAC.Q.d3.offer() && q('d3').st === 'none') o.push({ label: `— What's the Divan short of today?|— Чего сегодня не хватает Дивану?|— Bugun Devonga nima yetishmayapti?`, go: d3Offer });
    FAC.menu('nodira', `Nodira|Нодира|Nodira`, o, d);
  };
  FAC.talk.tillabek6 = d => {
    const W = G.WORLD2.active;
    if (W === 'ark') {
      if (FAC.Q.d4.offer() && q('d4').st === 'none') { d4(d); return; }
      if (FAC.Q.d5.offer() && q('d5').st === 'none') { d5(d); return; }
      play([['tillabek', done('d4') ? `Patience, yodchi. Taste the founders first, then come and tell me what you think of my family.|Терпение, ёдчи. Сначала испей основателей, потом приходи и скажи, что думаешь о моей семье.|Sabr, yodchi. Avval asoschilarni totib ko'r, keyin kelib oilam haqida nima o'ylashingni ayt.` : `The cellar is closed today. Even generosity needs a day off.|Сегодня погреб закрыт. Даже щедрости нужен выходной.|Bugun yerto'la yopiq. Saxovatga ham dam olish kuni kerak.`]], d); return;
    }
    if (W === 'dream' && q('d6').st === 'none') {
      if (FAC.Q.d6.offer()) { d6(d); return; }
      if (FAC.flag('fight6') === 'divan' && !FAC.flag('fought_divan')) { play([['tillabek', `Back for another look at my bird?|Вернулся ещё раз взглянуть на мою птицу?|Qushimga yana bir qarab qo'ygani qaytdingmi?`]], () => { d(); FAC.goLair('f_humo'); }); return; }
      play([['tillabek', `The song needs a partner, yodchi, not an acquaintance.|Песне нужен партнёр, ёдчи, а не знакомый.|Qo'shiqqa tanish emas, sherik kerak, yodchi.`]], d); return;
    }
    play([['', FAC.NPC.tillabek6.def.idle]], d);
  };

  /* ================================================================ Humo, the Divan's golden bird — the boss's story (moveset in 65t) */
  BOSS('f_humo', {
    name: `Humo, the Divan's golden bird|Хумо, золотая птица Дивана|Humo, Devonning oltin qushi`,
    title: `A thousand childhoods, gilded|Тысяча детств, позолоченных|Zarhallangan ming bolalik`,
    quote: `"Everything has a price"|«У всего есть цена»|«Hamma narsaning narxi bor»`,
    lair: `The gold court in the dream|Золотой двор во сне|Tushdagi oltin hovli`, lairSub: `Tilla-bek watches from the balcony|Тилла-бек смотрит с балкона|Tilla-bek ayvondan kuzatib turibdi`,
    portrait: 'tillabek',
    pre: [
      ['', `A court of gold under a dream sky. On a balcony above it, Tilla-bek leans on the rail with a cup of tea, like a man at the races.|Двор из золота под небом сна. На балконе над ним Тилла-бек облокотился на перила с пиалой чая — как на скачках.|Tush osmoni ostida oltin hovli. Uning tepasidagi ayvonda Tilla-bek qo'lida piyola bilan panjaraga suyanib turibdi — xuddi poygadagidek.`],
      ['tillabek', `Mind the children, yodchi. They aren't real, but you'll feel terrible anyway.|Осторожнее с детьми, ёдчи. Они ненастоящие, но тебе всё равно будет ужасно.|Bolalarga ehtiyot bo'l, yodchi. Ular haqiqiy emas, lekin baribir o'zingni yomon his qilasan.`]
    ],
    again: [`Again? The house always wins, yodchi. It's in the founding charter.|Снова? Заведение всегда в выигрыше, ёдчи. Так записано в уставе.|Yana? Uy doim yutadi, yodchi. Bu nizomda yozilgan.`, `Humo doesn't tire. Gold never does.|Хумо не устаёт. Золото не устаёт никогда.|Humo charchamaydi. Oltin hech qachon charchamaydi.`],
    post: d => {
      FAC.flag('fought_divan', 1); FAC.add('divan', -60); FAC.add('tail', 15); FAC.add('remember', 10); FAC.retarget('divan');
      try { G.CH.grantLegend('humo'); } catch (e) { /* ignore */ }
      FAC.react({ alp: 20 }, 'broke Humo');
      FAC.finish('d6', 'fought', `You broke Humo. A thousand childhoods spilled out of the gold and went looking for their owners.|Ты разбил Хумо. Тысяча детств высыпалась из золота и пошла искать своих хозяев.|Humoni sindirding. Ming bolalik oltindan to'kilib, egalarini izlab ketdi.`, { xp: 'arc' });
      play([
        ['', `Humo comes apart in a rain of coins. Each coin cracks as it lands, and a small light rises out of it and drifts off, towards the city.|Хумо рассыпается дождём монет. Каждая монета трескается, ударившись о камень, и из неё поднимается маленький огонёк и уплывает в сторону города.|Humo tangalar yomg'iri bo'lib sochiladi. Har bir tanga yerga tegib yoriladi, undan kichkina nur ko'tarilib, shahar tomon suzib ketadi.`],
        ['tillabek', `...My grandfather's chain, and my father's cellar, and my bird. You've made me poor in one evening, yodchi. Nobody has ever been so rude to me.|...Цепь моего деда, погреб моего отца и моя птица. Ты за один вечер сделал меня бедным, ёдчи. Никто ещё не был со мной так груб.|...Bobomning zanjiri, otamning yerto'lasi va mening qushim. Bir kechada meni kambag'al qilding, yodchi. Hech kim men bilan bunchalik qo'pol bo'lmagan.`],
        ['', `Among the cracked coins lies his shield with the bird of fortune, dented, still warm.|Среди треснувших монет лежит его щит с птицей счастья — помятый, ещё тёплый.|Yorilgan tangalar orasida uning baxt qushi tasvirlangan qalqoni yotibdi — ezilgan, hali iliq.`]
      ], d);
    }
  });
  FAC.lair('f_humo', 'f_humo', 'yd_court');
  FAC.EPI.divan = e => FAC.flag('fought_divan') ? { k: 'tillabek', v: 'broken', e, text: `After the dream Tilla-bek's cellar stood empty. He kept the gilded chain on his wall and, people say, talked to it in the evenings, like a man to a dog that had left.|После сна погреб Тилла-бека опустел. Позолоченную цепь он оставил на стене и, говорят, по вечерам разговаривал с ней — как с ушедшей собакой.|Tushdan keyin Tilla-bekning yerto'lasi bo'shab qoldi. Zarhal zanjirni devorda qoldirdi va, aytishlaricha, kechqurunlari u bilan ketib qolgan itga gapirgandek gaplashardi.` } : null;
}
