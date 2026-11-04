/* 89e_side_under.js — side stories below and beyond (GDD ch. 20):
      5 Children in the Wall    (Swallowed Streets)  children's voices in a wall: memories the founders bricked in
     10 The Salt Bride          (Salt Mines)         a convict marries a girl who doesn't remember him; the love was planted
     13 The Runaway Yodchi      (the karez)          a colleague fled with a debt book; a page about the Tail is torn out
     11 The Twelfth Step        (Tower of Silence)   the vultures won't touch one body: a Singer who ran with an archive */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, br = FAC.br, sf = SIDE.flag;
  const sado = () => sadoAwake();

  /* ================================================================ 5 · CHILDREN IN THE WALL */
  SIDE.quest('sd5', { n: 5, title: `Children in the Wall|Дети в стене|Devordagi bolalar`, where: ['streets', 'sd5wall'] });
  FAC.spot('streets', 'sd5wall', 0.33);
  FAC.prop('streets', 'sd5wall', { id: 'sd5', art: 'f6glint', prompt: `Listen at the wall|Прислушаться к стене|Devorga quloq solish`, when: () => !done('sd5'), use: d => {
    if (q('sd5').st === 'none') {
      play([
        ['', `From inside the wall, very faint: children. Counting, giggling, one of them crying and being shushed. The bricks are old, older than the street.|Из стены, еле слышно: дети. Считают, хихикают, один плачет, и его утешают. Кирпич старый, старше самой улицы.|Devor ichidan, zo'rg'a eshitiladi: bolalar. Sanashyapti, kikirlashyapti, biri yig'layapti, uni ovutishyapti. G'isht eski, ko'chaning o'zidan ham eski.`],
        () => (sado() ? ['sado', `They're playing. In there. Ravshan, they're playing hide-and-seek and nobody's coming to find them.|Они играют. Там, внутри. Равшан, они играют в прятки, и никто не идёт их искать.|Ular o'ynashyapti. U yerda, ichkarida. Ravshan, ular bekinmachoq o'ynashyapti, hech kim ularni izlab kelmayapti.`] : null)
      ], () => { FAC.begin('sd5', `Children's voices come from an old wall in the Swallowed Streets.|Из старой стены в Проглоченных улицах слышны детские голоса.|Yutilgan ko'chalardagi eski devordan bolalar ovozi keladi.`, ['streets', 'sd5wall']); d(); });
      return;
    }
    if (!sf('sd5_tasted')) {
      FAC.taste([
        ['memory', `The founders' city, new, bright. A rite at dusk: children brought one by one to the masons. Not the children. What they remember — their best day, sung into a brick.|Город основателей, новый, светлый. Обряд на закате: детей по одному подводят к каменщикам. Не самих детей. То, что они помнят, — их лучший день, вплетённый песней в кирпич.|Asoschilar shahri, yangi, yorug'. Kun botishda marosim: bolalarni birma-bir g'ishtchilar oldiga olib kelishadi. Bolalarning o'zini emas. Ular eslagan narsani — eng yaxshi kunlarini, qo'shiq bilan g'ishtga to'qishadi.`],
        ['memory', `"So the city will always remember it was young," the elder says. The children go home and grow up a little sadder, without knowing why.|«Чтобы город всегда помнил, что был молодым», — говорит старейшина. Дети уходят домой и вырастают чуть печальнее, сами не зная почему.|«Shahar doim yosh bo'lganini eslab tursin», — deydi oqsoqol. Bolalar uyga qaytib, sababini bilmay, biroz g'amginroq bo'lib ulg'ayishadi.`]
      ], () => { sf('sd5_tasted', 1); FAC.stepTo('sd5', `The founders sang children's best days into the bricks of this wall, so the city would remember being young. Let them out and the wall comes down on the street.|Основатели вплели в кирпичи этой стены лучшие дни детей, чтобы город помнил, что был молодым. Выпустишь их — стена рухнет на улицу.|Asoschilar bolalarning eng yaxshi kunlarini bu devor g'ishtlariga to'qishgan — shahar yosh bo'lganini eslasin, deb. Ularni chiqarsang — devor ko'chaga qulaydi.`); d(); });
      return;
    }
    play([
      ['', `The wall holds up the house beside it: the house whose step old Zulfiya sweeps every morning.|Стена держит соседний дом — тот, чей порог старая Зульфия подметает каждое утро.|Devor yonidagi uyni ushlab turibdi — keksa Zulfiya har tong ostonasini supuradigan uyni.`]
    ], () => ask(`The children are counting again. They've reached a hundred and started over.|Дети снова считают. Дошли до ста и начали заново.|Bolalar yana sanashyapti. Yuzgacha yetib, qaytadan boshlashdi.`, [
      { id: 'free', label: sado() ? `"Sado. Sing them out."|«Садо. Выпой их».|«Sado. Ularni kuylab chiqar».` : `Hum the Release over the bricks.|Напеть Отпускание над кирпичами.|G'ishtlar ustida Qo'yib yuborish kuyini aytish.` },
      { id: 'leave', label: `Leave them. The house stays up.|Оставить. Дом устоит.|Qoldirish. Uy turib qoladi.` },
      FAC.craft('take', `one child's day into a tumar, for Those Who Remember|день одного ребёнка в тумар — для Помнящих|bitta bolaning kunini tumarga — Eslaydiganlar uchun`, { id: 'one' })
    ], o => {
      if (o.id === 'free') {
        addVoid(2, `a wall of children's days|стена детских дней|bolalar kunlari devori`); trust(1); rep('tail', -1); sf('sd5_zulfiya', 1);
        play([
          ['', `The voices go out of the bricks like birds out of a broken cage: past you, up, gone. The wall sighs and folds. Zulfiya's house comes down with it, slowly, in a long cloud of old dust.|Голоса вылетают из кирпичей, как птицы из сломанной клетки: мимо тебя, вверх, и нет их. Стена вздыхает и складывается. Вместе с ней медленно, в длинном облаке старой пыли, оседает дом Зульфии.|Ovozlar g'ishtlardan singan qafasdagi qushlardek uchib chiqadi: yoningdan, tepaga, va yo'q bo'ladi. Devor xo'rsinib, buklanadi. U bilan birga, uzun qadimiy chang buluti ichida Zulfiyaning uyi sekin qulaydi.`],
          ['', `Nobody was inside. Zulfiya stands in the dust with her broom and looks at the place where her step was.|Внутри никого не было. Зульфия стоит в пыли с метлой и смотрит туда, где был её порог.|Ichkarida hech kim yo'q edi. Zulfiya chang ichida supurgisi bilan turib, ostonasi bo'lgan joyga qaraydi.`]
        ], () => { FAC.finish('sd5', 'free', `You let the children's days out of the wall. It fell, and took old Zulfiya's house with it.|Ты выпустил детские дни из стены. Она рухнула и забрала с собой дом старой Зульфии.|Bolalarning kunlarini devordan chiqarib yubording. U qulab, keksa Zulfiyaning uyini ham olib ketdi.`); d(); });
      } else if (o.id === 'one') {
        FAC.takeMem(`one child's best day|лучший день одного ребёнка|bitta bolaning eng yaxshi kuni`); rep('remember', 2);
        play([['', `You take one voice. The others go on counting, one short. They don't notice. Or they do, and keep counting anyway.|Ты забираешь один голос. Остальные продолжают считать — на одного меньше. Не замечают. Или замечают и всё равно считают.|Bitta ovozni olasan. Qolganlari bittasi kam bo'lib sanashda davom etishadi. Sezishmaydi. Yoki sezishadi-yu, baribir sanashaveradi.`]], () => { FAC.finish('sd5', 'one', `You took one child's day out of the wall for Those Who Remember.|Ты забрал из стены день одного ребёнка — для Помнящих.|Devordan Eslaydiganlar uchun bitta bolaning kunini olding.`); d(); });
      } else {
        play([() => (sado() ? ['sado', `...I'll come back and count with them. Sometimes. You don't have to.|...Я буду иногда возвращаться и считать с ними. Тебе не обязательно.|...Ba'zan qaytib kelib, ular bilan sanayman. Senga shart emas.`] : ['', `You leave them counting.|Ты оставляешь их считать.|Ularni sanayotgan holda qoldirasan.`])], () => { FAC.finish('sd5', 'leave', `You left the children in the wall. Zulfiya's house stands.|Ты оставил детей в стене. Дом Зульфии стоит.|Bolalarni devorda qoldirding. Zulfiyaning uyi turibdi.`); d(); });
      }
    }));
  } });
  // Zulfiya (89b) remembers what happened to her step
  s6init(() => { const n = G.WORLD2.npcs.folk_broom; if (!n) return; const t0 = n.talk; n.talk = function (done) { if (sf('sd5_zulfiya')) { play([['', `"The step went with the house. I sweep where it was. The dust doesn't know the difference."|«Порог ушёл вместе с домом. Я мету там, где он был. Пыль разницы не знает».|«Ostona uy bilan ketdi. U bo'lgan joyni supuraman. Chang farqini bilmaydi».`]], done); return; } return t0.apply(this, arguments); }; });

  /* ================================================================ 10 · THE SALT BRIDE */
  CAST.bobur = { name: `Bobur, a convict|Каторжник Бобур|Mahkum Bobur`, portrait: null };
  CAST.shahnoza = { name: `Shahnoza|Шахноза|Shahnoza`, portrait: null };
  SIDE.quest('sd10', { n: 10, title: `The Salt Bride|Солёная невеста|Tuz kelin`, where: ['mines', 'sd10'] });
  FAC.spot('mines', 'sd10', 0.56);
  FAC.spot('mines', 'sd10book', 0.3);
  FAC.npc('bobur', { name: CAST.bobur.name, look: 'tailman', dx: -16, prompt: `Talk to the groom|Поговорить с женихом|Kuyov bilan gaplashish`, idle: `A convict is braiding salt-white threads into a wedding cord.|Каторжник плетёт свадебный шнур из белых от соли ниток.|Mahkum tuzdan oqargan iplardan to'y ipini to'qiyapti.` },
    () => (!done('sd10') ? [{ from: 6, to: 22, region: 'mines', spot: 'sd10' }] : []));
  FAC.npc('shahnoza', { name: CAST.shahnoza.name, look: 'tailwoman', dx: 18, prompt: `Talk to the bride|Поговорить с невестой|Kelin bilan gaplashish`, idle: `The bride smiles at the groom with great care, like someone carrying a full bowl.|Невеста улыбается жениху очень бережно — как человек, который несёт полную пиалу.|Kelin kuyovga juda ehtiyotkorlik bilan — to'la piyola ko'tarib ketayotgan odamdek jilmayadi.` },
    () => (!done('sd10') || br('sd10') === 'silent' ? [{ from: 6, to: 22, region: 'mines', spot: 'sd10' }] : []));
  FAC.talk.bobur = d => {
    if (q('sd10').st === 'none') {
      play([
        ['bobur', `Yodchi! Witness for us. We marry tonight. Shahnoza came down here of her own will, to be with me. Who does that? Nobody does that.|Ёдчи! Будь нашим свидетелем. Сегодня у нас свадьба. Шахноза сама спустилась сюда, ко мне. Кто так делает? Никто так не делает.|Yodchi! Bizga guvoh bo'l. Bugun to'yimiz. Shahnoza o'z xohishi bilan bu yerga, mening oldimga tushdi. Kim shunday qiladi? Hech kim.`],
        ['shahnoza', `I've loved him for years. I just can't remember where we met. Isn't that funny? I remember everything else.|Я люблю его много лет. Только не помню, где мы познакомились. Смешно, правда? Всё остальное помню.|Uni yillardan beri sevaman. Faqat qayerda tanishganimizni eslolmayman. Kulgili-a? Qolgan hamma narsani eslayman.`],
        () => (sado() ? ['sado', `Her love has a seam. Like a sleeve sewn on later.|У её любви есть шов. Как у рукава, пришитого потом.|Uning sevgisida chok bor. Keyin tikilgan yengdagidek.`] : null)
      ], () => { FAC.begin('sd10', `A convict in the Salt Mines is marrying a girl who came down to him of her own will, and can't remember where they met. The overseer's ledger is kept by the shaft.|Каторжник в Соляных шахтах женится на девушке, которая сама спустилась к нему и не помнит, где они познакомились. Книга надсмотрщика лежит у ствола.|Tuz konlaridagi mahkum o'z xohishi bilan uning oldiga tushgan va qayerda tanishganini eslamaydigan qizga uylanmoqchi. Nazoratchining daftari shaxta yonida.`, ['mines', 'sd10book']); d(); });
      return;
    }
    if (!sf('sd10_book')) { play([['bobur', `Tonight! Bring a smile, yodchi, it's the only gift down here.|Сегодня вечером! Приходи с улыбкой, ёдчи, другого подарка тут нет.|Bugun kechqurun! Tabassum bilan kel, yodchi, bu yerda boshqa sovg'a yo'q.`]], d); return; }
    ask(`The ledger says: "Planted: affection, one unit, for B. — so the girl goes down willingly. Paid by the Divan." Bobur is braiding the wedding cord.|В книге: «Вселено: привязанность, одна единица, к Б. — чтобы девушка спустилась добровольно. Оплачено Диваном». Бобур плетёт свадебный шнур.|Daftarda: «Joylandi: mehr, bir birlik, B.ga — qiz o'z xohishi bilan tushishi uchun. Devon to'ladi». Bobur to'y ipini to'qiyapti.`, [
      { id: 'her', label: `Tell Shahnoza the truth.|Сказать Шахнозе правду.|Shahnozaga rostini aytish.` },
      { id: 'him', label: `Tell Bobur, and let him decide what she's told.|Сказать Бобуру — пусть он решает, что ей говорить.|Boburga aytish — unga nima deyishni o'zi hal qilsin.` },
      { id: 'silent', label: `Say nothing. Witness the wedding.|Промолчать. Быть свидетелем на свадьбе.|Indamaslik. To'yda guvoh bo'lish.` }
    ], o => {
      const T = {
        her: [['shahnoza', `...Planted. Like a tree. ...Then none of it's mine. Not the years. Not the stairs I walked down to him.|...Вселили. Как дерево посадили. ...Значит, ничего из этого не моё. Ни годы. Ни ступени, по которым я к нему спускалась.|...Joylashgan. Daraxt ekkandek. ...Demak, bularning hech biri meniki emas. Yillar ham. Uning oldiga tushgan zinalarim ham.`], ['', `She climbs back up the shaft that night, alone, towards the Salt Road. Bobur doesn't stop her. He sits with the cord in his hands until morning.|Той же ночью она одна поднимается по стволу — к Соляному тракту. Бобур её не останавливает. До утра он сидит со шнуром в руках.|O'sha kechasi u yolg'iz shaxtadan yuqoriga — Tuz yo'liga chiqib ketadi. Bobur uni to'xtatmaydi. Tonggacha ip qo'lida o'tiradi.`]],
        him: [['bobur', `...I knew something was wrong. Nobody loves a convict. ...Don't tell her. Or tell her. No — don't. Let me be the one who carries it. I'm used to carrying.|...Я знал, что что-то не так. Каторжников не любят. ...Не говори ей. Или скажи. Нет — не говори. Пусть это несу я. Я привык носить.|...Nimadir noto'g'ri ekanini bilardim. Mahkumni hech kim sevmaydi. ...Unga aytma. Yoki ayt. Yo'q — aytma. Buni men ko'taray. Ko'tarishga o'rganganman.`]],
        silent: [['', `You stand witness. The salt-cutters sing badly and loudly. Shahnoza laughs at every joke, a little late, like someone translating.|Ты стоишь свидетелем. Солерубы поют плохо и громко. Шахноза смеётся каждой шутке — чуть запаздывая, как человек, который переводит.|Guvoh bo'lib turasan. Tuz qazuvchilar yomon va baland kuylashadi. Shahnoza har bir hazilga — tarjima qilayotgan odamdek biroz kechikib — kuladi.`]]
      }[o.id];
      if (o.id === 'her') { rep('divan', -1); sf('sd10_road', 1); }
      if (o.id === 'him') { trust(1); }
      if (o.id === 'silent') { gold(10); }
      play(T, () => { FAC.finish('sd10', o.id, { her: `You told Shahnoza her love was planted. She left the mines alone, up the Salt Road.|Ты сказал Шахнозе, что её любовь вселена. Она одна ушла из шахт по Соляному тракту.|Shahnozaga sevgisi joylangan ekanini aytding. U shaxtalardan yolg'iz Tuz yo'li bilan ketdi.`, him: `You told Bobur. He chose to carry it and say nothing to her.|Ты сказал Бобуру. Он решил нести это сам и ничего ей не говорить.|Boburga aytding. U buni o'zi ko'tarib, unga hech narsa demaslikni tanladi.`, silent: `You said nothing and stood witness at the wedding.|Ты промолчал и был свидетелем на свадьбе.|Indamading va to'yda guvoh bo'lding.` }[o.id]); d(); });
    });
  };
  FAC.talk.shahnoza = d => play([['shahnoza', done('sd10') ? `We're saving for a window. Down here. Don't laugh. A painted one.|Копим на окно. Здесь, внизу. Не смейся. На нарисованное.|Deraza uchun pul yig'yapmiz. Shu yerda, pastda. Kulma. Chizilganiga.` : `Will you stay for the wedding? There'll be salt bread. There's always salt bread.|Останешься на свадьбу? Будет солёный хлеб. Тут всегда солёный хлеб.|To'yga qolasanmi? Tuzli non bo'ladi. Bu yerda doim tuzli non bo'ladi.`]], d);
  FAC.prop('mines', 'sd10book', { id: 'sd10book', art: 'f6books', prompt: `Read the overseer's ledger|Прочитать книгу надсмотрщика|Nazoratchining daftarini o'qish`, when: () => act('sd10') && !sf('sd10_book'), use: d => play([
    ['', `Rows of debts, rows of days. And a recent line in a clerk's hand: "Planted: affection, one unit, towards B. — so the girl comes down willingly. Paid by the Divan. Another pair of hands."|Ряды долгов, ряды дней. И свежая строчка рукой писаря: «Вселено: привязанность, одна единица, к Б. — чтобы девушка спустилась добровольно. Оплачено Диваном. Ещё одна пара рук».|Qator-qator qarzlar, qator-qator kunlar. Va mirza qo'li bilan yangi satr: «Joylandi: mehr, bir birlik, B.ga — qiz o'z xohishi bilan tushishi uchun. Devon to'ladi. Yana bir juft qo'l».`]
  ], () => { sf('sd10_book', 1); FAC.stepTo('sd10', `The ledger says the Divan paid to plant Shahnoza's love for Bobur, so she'd come down to the mines as another pair of hands.|По книге выходит: Диван заплатил, чтобы Шахнозе вселили любовь к Бобуру — и она спустилась в шахты ещё одной парой рук.|Daftarga ko'ra, Devon Shahnozaga Boburga nisbatan sevgi joylash uchun pul to'lagan — u shaxtaga yana bir juft qo'l bo'lib tushsin, deb.`, ['mines', 'sd10']); d(); }) });
  SIDE.epi('sd10', () => ({ her: `Shahnoza was found on the Salt Road in spring, a day from the city. She had walked the whole winter towards somewhere she remembered. Bobur still braids cords. He sells them to brides.|Шахнозу нашли весной на Соляном тракте, в дне пути от города. Всю зиму она шла туда, что помнила. Бобур до сих пор плетёт шнуры. Продаёт их невестам.|Shahnozani bahorda Tuz yo'lida, shahardan bir kunlik masofada topishdi. U butun qish eslagan joyi tomon yurgan. Bobur hali ham ip to'qiydi. Ularni kelinlarga sotadi.`, him: `Bobur and Shahnoza paid off his debt in seven years and came up into the light. She still can't remember where they met. He tells her a different story every time. She likes them all.|Бобур и Шахноза выплатили его долг за семь лет и поднялись к свету. Она так и не помнит, где они познакомились. Он каждый раз рассказывает ей новую историю. Ей нравятся все.|Bobur bilan Shahnoza qarzni yetti yilda uzib, yorug'likka chiqishdi. U hali ham qayerda tanishganlarini eslamaydi. Bobur har safar unga yangi hikoya aytib beradi. Hammasi unga yoqadi.`, silent: null }[br('sd10')] || null), 'tail:dig');

  /* ================================================================ 13 · THE RUNAWAY YODCHI */
  CAST.sardor = { name: `Sardor, a yodchi|Ёдчи Сардор|Yodchi Sardor`, portrait: null };
  SIDE.quest('sd13', { n: 13, title: `The Runaway Yodchi|Беглый ёдчи|Qochoq yodchi`, where: ['karez', 'sd13'] });
  FAC.spot('karez', 'sd13', 0.58);
  FAC.npc('sardor', { name: CAST.sardor.name, look: { robe: '#3a3a4a', trim: '#8a6a3a', skin: '#b08868', head: 'doppi', headC: '#1c1a1e', beard: 'short' }, dx: 0, prompt: `Talk to the man with the book|Поговорить с человеком с книгой|Kitobli odam bilan gaplashish`, idle: `A man in a yodchi's coat sits with a debt book in his lap like a sleeping child.|Человек в кафтане ёдчи сидит с долговой книгой на коленях, как со спящим ребёнком.|Yodchi to'nidagi odam qarz daftarini uxlayotgan boladek tizzasida ushlab o'tiribdi.` },
    () => (!done('sd13') && SIDE.moon() >= 1 ? [{ from: 0, to: 24, region: 'karez', spot: 'sd13' }] : []));
  FAC.talk.sardor = d => {
    if (q('sd13').st === 'none') FAC.begin('sd13', `Sardor, a yodchi from your own guild, ran into the karez with a debt book of the Tail.|Сардор, ёдчи из твоего же цеха, сбежал в кяризы с долговой книгой Хвоста.|Sardor, o'z sexingdagi yodchi, Dumning qarz daftari bilan korizlarga qochib ketgan.`, ['karez', 'sd13']);
    play([
      ['sardor', `Ravshan. Of course it's you. They'd send the best counter. ...Sit. I won't run. My knees have done enough running.|Равшан. Конечно, ты. Лучшего счётчика и пошлют. ...Садись. Не побегу. Мои колени набегались.|Ravshan. Albatta, sen. Eng yaxshi hisobchini yuborishadi-da. ...O'tir. Qochmayman. Tizzalarim yetarlicha yugurdi.`],
      ['sardor', `The Tail's book. Twenty years of it. Every debt the Singers say the Tail owes. I took it because I started reading it. Half of it is invented, Ravshan. Counted twice. Thrice.|Книга Хвоста. Двадцать лет. Все долги, которые, по словам Певцов, на Хвосте. Я взял её, потому что начал читать. Половина выдумана, Равшан. Посчитано дважды. Трижды.|Dumning daftari. Yigirma yillik. Xonandalar Dumniki deydigan hamma qarzlar. Uni o'qiy boshlaganim uchun oldim. Yarmi to'qilgan, Ravshan. Ikki marta sanalgan. Uch marta.`],
      ['sardor', `And one page is torn out. Your row, your year. I didn't tear it. It was gone when I took the book.|И одна страница вырвана. Твой ряд, твой год. Я её не вырывал. Её не было, когда я взял книгу.|Va bitta sahifa yirtib olingan. Sening qatoring, sening yiling. Men yirtmaganman. Kitobni olganimda yo'q edi.`],
      () => (sado() ? ['sado', `Your year. ...Why would anyone tear out your year?|Твой год. ...Зачем кому-то вырывать твой год?|Sening yiling. ...Nega kimdir sening yilingni yirtib oladi?`] : null)
    ], () => ask(`Sardor holds the book out to you.|Сардор протягивает тебе книгу.|Sardor kitobni senga uzatadi.`, [
      { id: 'return', label: `"It goes back to the Cloister. So do you."|«Она вернётся в Обитель. И ты тоже».|«U xonaqohga qaytadi. Sen ham».` },
      FAC.craft('burn', `the book. Every invented debt of the Tail with it.|книгу. А с ней — каждый выдуманный долг Хвоста.|kitobni. U bilan birga Dumning har bir to'qilgan qarzini.`, { id: 'burn' }),
      { id: 'keep', label: `"I'll keep it. Some people will pay a lot to have it found, and more to have it lost."|«Оставлю себе. Кто-то много заплатит, чтобы её нашли, а кто-то — ещё больше, чтобы потеряли».|«O'zimda qoldiraman. Kimdir uni topish uchun ko'p, kimdir yo'qotish uchun yana ko'p to'laydi».` }
    ], o => {
      const T = {
        return: [['sardor', `...Yes. That's what I'd have done. That's why I ran from it. Walk me up slowly, I want to see the sun once more without a book in my hands.|...Да. Я бы так и сделал. Поэтому и бежал от этого. Веди меня наверх медленно, хочу ещё раз увидеть солнце без книги в руках.|...Ha. Men ham shunday qilardim. Shuning uchun undan qochdim. Meni tepaga sekin olib chiq, qo'limda kitobsiz quyoshni yana bir ko'rmoqchiman.`]],
        burn: [['', `The pages curl one by one. Twenty years of the Tail's debts, real and invented, go up the karez shaft as grey flakes. Sardor laughs and cries at the same time.|Страницы скручиваются одна за другой. Двадцать лет долгов Хвоста, настоящих и выдуманных, уходят вверх по стволу кяриза серыми хлопьями. Сардор смеётся и плачет одновременно.|Sahifalar birin-ketin buralib ketadi. Dumning yigirma yillik qarzlari, haqiqiysi ham, to'qilgani ham, koriz shaxtasidan kulrang parchalar bo'lib uchib ketadi. Sardor bir vaqtda kuladi ham, yig'laydi ham.`]],
        keep: [['sardor', `You've learned something since Rustam-aka. I'm not sure it's good. Keep it, then. I'll go somewhere without books.|Ты кое-чему научился после Рустама-ака. Не уверен, что хорошему. Держи. А я уйду туда, где нет книг.|Rustam akadan keyin nimanidir o'rganibsan. Yaxshi narsami, bilmayman. Ol unda. Men kitob yo'q joyga ketaman.`]]
      }[o.id];
      if (o.id === 'return') { rep('singers', 2); rep('tail', -1); gold(60); }
      if (o.id === 'burn') { rep('tail', 3); rep('singers', -3); addVoid(2, `a book of debts|книга долгов|qarzlar daftari`); }
      if (o.id === 'keep') { gold(120); rep('singers', -1); rep('divan', 1); }
      play(T, () => { FAC.finish('sd13', o.id, { return: `You brought Sardor and the Tail's book back to the Cloister.|Ты вернул Сардора и книгу Хвоста в Обитель.|Sardorni va Dumning daftarini xonaqohga qaytarding.`, burn: `You burned the Tail's debt book, invented debts and real ones together.|Ты сжёг долговую книгу Хвоста — выдуманные долги вместе с настоящими.|Dumning qarz daftarini yoqding — to'qilgan qarzlarni ham, haqiqiylarini ham.`, keep: `You kept the Tail's debt book. It's worth a great deal to someone.|Ты оставил книгу долгов Хвоста себе. Кому-то она очень дорого стоит.|Dumning qarz daftarini o'zingda qoldirding. U kimgadir juda qimmatga tushadi.` }[o.id]); d(); });
    }));
  };
  SIDE.epi('sd13', () => (br('sd13') === 'burn' ? `For a year after the debt book burned, nobody in the Tail owed anything. The Singers counted again from scratch. They counted honestly, for once; they had no time to invent.|Год после того, как сгорела книга долгов, в Хвосте никто никому не был должен. Певцы считали заново. На этот раз честно: выдумывать было некогда.|Qarz daftari yonib ketgandan keyin bir yil Dumda hech kim hech kimga qarzdor bo'lmadi. Xonandalar qaytadan sanashdi. Bu safar halol: to'qishga vaqt yo'q edi.` : null), 'tail:give');

  /* ================================================================ 11 · THE TWELFTH STEP */
  SIDE.quest('sd11', { n: 11, title: `The Twelfth Step|Двенадцатая ступень|O'n ikkinchi pog'ona`, where: ['tower', 'sd11'] });
  FAC.spot('tower', 'sd11', 0.74);
  FAC.prop('tower', 'sd11', { id: 'sd11', art: 'f6books', prompt: `The body on the twelfth step|Тело на двенадцатой ступени|O'n ikkinchi pog'onadagi jasad`, when: () => !done('sd11') && COMP.story('b_tower'), use: d => {
    if (q('sd11').st === 'none') FAC.begin('sd11', `On the Tower's stair the vultures circle one body and won't touch it.|На лестнице Башни грифы кружат над одним телом и не трогают его.|Minora zinasida qushlar bitta jasad tepasida aylanib, unga tegishmaydi.`, ['tower', 'sd11']);
    play([
      ['', `On the twelfth step lies a Singer in white, a month dead and untouched. The vultures land, look, and lift off again. Under her arms she's holding a bundle of ledgers bound in blue thread.|На двенадцатой ступени лежит Певица в белом, месяц как мёртвая, и никто её не тронул. Грифы садятся, смотрят и снова взлетают. Под руками она держит связку книг, перевязанную синей нитью.|O'n ikkinchi pog'onada oq kiyimli xonanda ayol yotibdi, bir oydan beri o'lik, unga hech kim tegmagan. Qushlar qo'nadi, qaraydi, uchib ketadi. Qo'lida ko'k ipli daftarlar dastasi.`],
      ['', `The Well's sign is sewn inside the cover: the archive of the Great Tithe. Every row of the Tail, ordered by the night it is to be sung empty.|Внутри обложки вышит знак Колодца: архив Великой десятины. Каждый ряд Хвоста, по порядку — в какую ночь его выпоют досуха.|Muqova ichiga Quduq belgisi tikilgan: Buyuk ushr arxivi. Dumning har bir qatori tartib bilan — qaysi kechasi kuylab bo'shatilishi.`],
      () => (sado() ? ['sado', `She ran with it. She ran all the way here and the vultures won't eat her. Even they know.|Она бежала с этим. Добежала досюда, и грифы её не едят. Даже они понимают.|U buni olib qochgan. Shu yergacha yugurgan, qushlar uni yemayapti. Hatto ular ham tushunadi.`] : null)
    ], () => ask(`The archive weighs about as much as a child.|Архив весит примерно как ребёнок.|Arxiv taxminan bola og'irligida.`, [
      { id: 'singers', label: `Carry it back to the Cloister.|Отнести обратно в Обитель.|Xonaqohga qaytarib olib borish.` },
      { id: 'remember', label: `Carry it to Those Who Remember.|Отнести Помнящим.|Eslaydiganlarga olib borish.` },
      { id: 'divan', label: `Sell it to the Divan.|Продать Дивану.|Devonga sotish.` }
    ], o => {
      if (o.id === 'singers') { rep('singers', 3); rep('tail', -1); }
      if (o.id === 'remember') { rep('remember', 3); rep('singers', -2); }
      if (o.id === 'divan') { rep('divan', 2); rep('singers', -1); gold(140); }
      if (o.id !== 'singers') FAC.flag && FAC.flag('archive_out', o.id);
      play([['', { singers: `Habiba takes the archive without a word and lays her hand on it like on a forehead. "She was my best copyist," is all she says.|Хабиба молча принимает архив и кладёт на него руку, как на лоб. «Она была моей лучшей переписчицей», — только и говорит она.|Habiba arxivni indamay oladi va qo'lini unga peshonaga qo'ygandek qo'yadi. «U mening eng yaxshi kotibam edi», — deydi xolos.`, remember: `In the Bazaar's cellar a masked woman turns the pages slowly. "Now we know the order," she says. "Now we know which row to empty first."|В подвале Базара женщина в маске медленно листает страницы. «Теперь мы знаем порядок, — говорит она. — Теперь знаем, какой ряд выводить первым».|Bozor yerto'lasida niqobli ayol sahifalarni sekin varaqlaydi. «Endi tartibni bilamiz, — deydi u. — Qaysi qatorni birinchi bo'shatishni bilamiz».`, divan: `A steward weighs the archive on a merchant's scale before paying. Tilla-bek, they tell you, laughed out loud.|Распорядитель, прежде чем заплатить, взвешивает архив на купеческих весах. Тилла-бек, говорят, рассмеялся вслух.|Xizmatchi pul to'lashdan oldin arxivni savdogar tarozisida tortib ko'radi. Aytishlaricha, Tilla-bek ovoz chiqarib kulgan.` }[o.id]]], () => { FAC.finish('sd11', o.id, { singers: `You returned the Great Tithe archive to the Cloister.|Ты вернул архив Великой десятины в Обитель.|Buyuk ushr arxivini xonaqohga qaytarding.`, remember: `You gave the Great Tithe archive to Those Who Remember.|Ты отдал архив Великой десятины Помнящим.|Buyuk ushr arxivini Eslaydiganlarga berding.`, divan: `You sold the Great Tithe archive to the Divan.|Ты продал архив Великой десятины Дивану.|Buyuk ushr arxivini Devonga sotding.` }[o.id]); d(); });
    }));
  } });
}
