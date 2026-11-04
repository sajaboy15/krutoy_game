/* 79n_side_cameo.js — a cameo of the game's two makers, Sherzod and Azamat: "The Blue Wolf" (Ko'k bo'ri), a light comedy.
   Two friends want to show a shadow play on the Bazaar tonight. Sherzod writes (three endings, no decision); Azamat builds
   (a lamp that goes dark exactly when it gets interesting) and counts the money. They need:
     · a licence — the Divan's young clerk Qobil-mirza: pay, press him as a yodchi, or promise him a part in the play;
     · light — buy good oil, taste the lamp (somebody planted a theatre-hater's memory in its brass), or let Sado shine;
   then at night the premiere, and you pick the ending they show: the wolf wakes and everyone dances / the wolf sleeps on
   and the hero goes home / the audience shouts the ending. Each costs and pays someone (standing, tilla, a clerk's pride,
   the companions' taste) and they come back: Qobil, the two at the Tail chaikhana, a slide in the epilogue.
   Quest id 'cameo' (journal: side story). Flags SIDE.flag('cam_*'). */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, cat3 = FAC.cat3;
  CAST.sherzod = { name: `Sherzod|Шерзод|Sherzod`, portrait: null };
  CAST.azamat = { name: `Azamat|Азамат|Azamat`, portrait: null };
  CAST.qobil = { name: `Qobil-mirza, a Divan clerk|Кабиль-мирза, писарь Дивана|Devon mirzasi Qobil`, portrait: null };
  const LK = {
    sherzod: { robe: '#2a3a5a', trim: '#e8d8a8', skin: '#c89a74', head: 'doppi', headC: '#1c1a1e', headC2: '#e8e0cc', pat: 'ikat', sash: '#a8323a' },
    azamat: { robe: '#5a4430', trim: '#8a6a4a', skin: '#b88a64', head: 'doppi', headC: '#2a2a2a', headC2: '#c8b890', beard: 'short', outer: '#3a2a1c', sash: '#2a2a2a' },
    qobil: { robe: '#e8d8a8', trim: '#c8902a', skin: '#d8b08a', head: 'turban', headC: '#f4ead0', pat: 'stripes' }
  };
  const C = k => SIDE.flag('cam_' + k);
  const setC = (k, v) => SIDE.flag('cam_' + k, v === undefined ? 1 : v);
  const sado = () => (typeof sadoAwake === 'function' && sadoAwake());

  SIDE.quest('cameo', { n: 1, title: `The Blue Wolf|Синий волк|Ko'k bo'ri`, where: ['bazaar', 'shadow'], offer: () => SIDE.moon() <= 1 });

  /* ---------------------------------------------------------------- where they are */
  FAC.spot('bazaar', 'shadow', 0.64);
  FAC.spot('bazaar', 'stamp', 0.71);
  const ready = () => act('cameo') && C('licence') && C('light');
  FAC.npc('sherzod', { name: CAST.sherzod.name, look: LK.sherzod, dx: -10, prompt: `Talk to Sherzod|Поговорить с Шерзодом|Sherzod bilan gaplashish`, idle: `Sherzod is crossing out a whole page with great satisfaction.|Шерзод с большим удовольствием вычёркивает целую страницу.|Sherzod butun bir sahifani katta zavq bilan o'chirib tashlayapti.` },
    () => {
      if (done('cameo')) return [{ from: 18, to: 23, region: 'tail', spot: 'chai:tail_plane:in' }, { from: 9, to: 18, region: 'bazaar', spot: 'shadow' }];
      return SIDE.moon() <= 1 ? [{ from: 9, to: 2, region: 'bazaar', spot: 'shadow' }] : [];
    });
  FAC.npc('azamat', { name: CAST.azamat.name, look: LK.azamat, dx: 26, prompt: `Talk to Azamat|Поговорить с Азаматом|Azamat bilan gaplashish`, idle: `Azamat is counting the same coins for the third time. They are still not enough.|Азамат в третий раз пересчитывает одни и те же монеты. Их всё ещё мало.|Azamat o'sha tangalarni uchinchi marta sanayapti. Baribir yetmaydi.` },
    () => {
      if (done('cameo')) return [{ from: 18, to: 23, region: 'tail', spot: 'chai:tail_plane:in' }, { from: 9, to: 18, region: 'bazaar', spot: 'shadow' }];
      return SIDE.moon() <= 1 ? [{ from: 9, to: 2, region: 'bazaar', spot: 'shadow' }] : [];
    });
  FAC.npc('qobil', { name: CAST.qobil.name, look: LK.qobil, dx: 0, prompt: `Talk to the clerk|Поговорить с писарем|Mirza bilan gaplashish`, idle: `The clerk stamps something, looks at the stamp, and stamps it again to be sure.|Писарь ставит печать, смотрит на неё и ставит ещё раз — для верности.|Mirza muhr bosadi, unga qaraydi va ishonch uchun yana bir marta bosadi.` },
    () => [{ from: 8, to: 19, region: 'bazaar', spot: 'stamp' }]);

  /* ---------------------------------------------------------------- the offer */
  const offer = d => play([
    ['', `Two young men are arguing over a white sheet stretched between two poles. One holds a stack of paper; the other, a lamp with a smoking wick.|Двое парней спорят у белой простыни, натянутой между двумя шестами. У одного — стопка бумаги, у другого — лампа с чадящим фитилём.|Ikki yigit ikki xoda orasiga tortilgan oq choyshab oldida bahslashyapti. Birining qo'lida bir dasta qog'oz, ikkinchisida tutayotgan chiroq.`],
    ['sherzod', `...because a hero with no past is a stool, Azamat. A stool with a sword.|...потому что герой без прошлого — это табуретка, Азамат. Табуретка с саблей.|...chunki o'tmishi yo'q qahramon — bu kursi, Azamat. Qilichli kursi.`],
    ['azamat', `A stool doesn't need lamp oil. Your hero does. We have none.|Табуретке масло для лампы не нужно. А твоему герою нужно. А его нет.|Kursiga chiroq moyi kerak emas. Qahramoningga esa kerak. Moy esa yo'q.`],
    ['sherzod', `A yodchi! A real one! Azamat, look at his face. That's the face of a second act.|Ёдчи! Настоящий! Азамат, глянь на его лицо. Это же лицо второго акта.|Yodchi! Haqiqiysi! Azamat, yuziga qara. Bu ikkinchi parda yuzi-ku.`],
    ['azamat', `That's the face of a man about to walk away. Aka, we're showing a shadow play. Tonight. Probably.|Это лицо человека, который сейчас уйдёт. Ака, мы показываем театр теней. Сегодня. Наверное.|Bu ketib qolmoqchi bo'lgan odamning yuzi. Aka, biz soya teatri ko'rsatyapmiz. Bugun. Ehtimol.`]
  ], () => hub(`Sherzod and Azamat|Шерзод и Азамат|Sherzod va Azamat`, [
    { label: `— What's the play about?|— О чём пьеса?|— Tomosha nima haqida?`, lines: [
      ['sherzod', `A city on the back of a sleeping blue wolf. Whatever the wolf dreams of comes true. So everyone tries to get into his dreams.|Город на спине спящего синего волка. Что волку приснится, то и сбудется. Вот все и лезут к нему в сны.|Uxlayotgan ko'k bo'rining ustidagi shahar. Bo'ri tushida nimani ko'rsa, o'sha ro'yobga chiqadi. Shuning uchun hamma uning tushiga kirishga urinadi.`],
      ['azamat', `He's been writing it for three years. I've been building the lamp for three days. Guess which one works.|Он пишет её три года. Я собираю лампу три дня. Угадай, что из этого работает.|U buni uch yildan beri yozyapti. Men chiroqni uch kundan beri yasayapman. Qaysi biri ishlashini top-chi.`],
      () => (sado() ? ['sado', `A city on a sleeping animal. Who would believe that.|Город на спящем звере. Кто ж в такое поверит.|Uxlayotgan jonivor ustidagi shahar. Bunga kim ham ishonardi.`] : null)
    ] },
    { label: `— Why "probably"?|— Почему «наверное»?|— Nega «ehtimol»?`, lines: [
      ['azamat', `Two reasons. The Divan says a play is a public gathering and wants a licence. And the lamp goes dark every time it gets interesting.|Две причины. Диван говорит, что спектакль — это сборище, и хочет лицензию. А лампа гаснет каждый раз, когда становится интересно.|Ikki sabab bor. Devon tomoshani yig'in deb hisoblaydi va litsenziya so'rayapti. Chiroq esa har safar qiziq joyiga kelganda o'chib qoladi.`],
      ['sherzod', `I hit it twice and it comes back. Mostly.|Я по ней два раза стукну — и она оживает. Обычно.|Ikki marta ursam, yonib ketadi. Ko'pincha.`]
    ] },
    { label: `— Who are you two?|— А вы кто такие?|— O'zlaring kimsizlar?`, lines: [
      ['sherzod', `Sherzod. I write things.|Шерзод. Я пишу.|Sherzod. Men yozaman.`],
      ['azamat', `Azamat. I make what he writes actually stand up. Somebody has to.|Азамат. Я делаю так, чтобы написанное им хоть как-то стояло. Кто-то же должен.|Azamat. Men uning yozganini oyoqqa turg'izaman. Kimdir qilishi kerak-ku.`],
      ['sherzod', `We've been friends since we were six. He still hasn't forgiven me for the camel.|Мы дружим с шести лет. Он мне до сих пор верблюда не простил.|Olti yoshimizdan beri do'stmiz. U hali ham tuya uchun meni kechirmagan.`],
      ['azamat', `Don't.|Не надо.|Kerak emas.`]
    ] }
  ], [
    { id: 'yes', label: `"I'll help. I want to see how it ends."|«Помогу. Хочу посмотреть, чем кончится.»|«Yordam beraman. Oxiri nima bo'lishini ko'rgim keladi.»` },
    { id: 'no', label: `"Not my business."|«Это не моё дело.»|«Bu mening ishim emas.»` }
  ], o => {
    if (o.id === 'yes') {
      FAC.begin('cameo', `Sherzod and Azamat want to show their shadow play on the Bazaar tonight. They need the Divan's licence (the clerk Qobil-mirza) and a lamp that stays lit.|Шерзод и Азамат хотят сегодня показать на Базаре театр теней. Нужна лицензия Дивана (писарь Кабиль-мирза) и лампа, которая не гаснет.|Sherzod va Azamat bugun Bozorda soya teatrini ko'rsatmoqchi. Devon litsenziyasi (mirza Qobil) va o'chmaydigan chiroq kerak.`, ['bazaar', 'stamp']);
      play([['azamat', `The clerk is by the weights. Don't let him read you the regulations. He enjoys it.|Писарь стоит у весов. Не давай ему читать тебе правила. Ему это нравится.|Mirza tarozi yonida turibdi. Senga qoidalarni o'qib berishiga yo'l qo'yma. Bundan zavq oladi.`]], d);
    } else play([['sherzod', `He'll be back. They always come back in the second act.|Вернётся. Во втором акте все возвращаются.|Qaytadi. Ikkinchi pardada hamma qaytadi.`]], d);
  }));

  /* ---------------------------------------------------------------- the licence */
  const licence = d => play([
    ['qobil', `A shadow play. On the Bazaar. With an audience.|Театр теней. На Базаре. При зрителях.|Soya teatri. Bozorda. Tomoshabinlar bilan.`],
    ['qobil', `Article nine: any gathering of more than seven persons looking in the same direction requires a licence. Forty tilla.|Статья девятая: всякое собрание более семи лиц, смотрящих в одну сторону, требует лицензии. Сорок тилла.|To'qqizinchi modda: bir tomonga qarab turgan yetti kishidan ortiq har qanday yig'in litsenziya talab qiladi. Qirq tilla.`],
    () => (sado() ? ['sado', `Seven people looking the same way. He has a rule for everything.|Семь человек смотрят в одну сторону. У него на всё есть правило.|Yetti kishi bir tomonga qarab turibdi. Unda har narsaga qoida bor.`] : null)
  ], () => ask(`The clerk waits, his stamp already inked.|Писарь ждёт, печать у него уже в чернилах.|Mirza kutib turibdi, muhri allaqachon siyohga botirilgan.`, [
    { id: 'pay', price: 40, label: `Count out forty tilla.|Отсчитать сорок тилла.|Qirq tilla sanab berish.` },
    FAC.chk('collection', 2, `"I'm a yodchi, mirza. I know what forty tilla buys at the Divan. Sign it."|«Я ёдчи, мирза. Я знаю, что в Диване покупают за сорок тилла. Подписывай.»|«Men yodchiman, mirza. Devonda qirq tillaga nima sotib olinishini bilaman. Imzola.»`, { id: 'press' }, `Pressure|Давление|Bosim`),
    { id: 'part', label: `"What if the play had a clerk in it? A wise one. Handsome, even."|«А что, если в пьесе будет писарь? Мудрый. Даже красивый.»|«Agar tomoshada mirza bo'lsa-chi? Dono. Hatto kelishgan.»` }
  ], o => {
    if (o.id === 'pay') {
      if ((G.run.gold || 0) < 40) { play([['qobil', `Thirty-one is not forty. I checked.|Тридцать один — это не сорок. Я проверил.|O'ttiz bir qirq emas. Tekshirdim.`]], d); return; }
      gold(-40); setC('licence', 'paid');
      play([['', `The stamp comes down with real joy. It is the happiest you have seen anyone on the Bazaar.|Печать опускается с настоящей радостью. Счастливее человека ты на Базаре ещё не видел.|Muhr chinakam quvonch bilan tushadi. Bozorda bundan baxtliroq odamni hali ko'rmagansan.`]], after(d));
    } else if (o.id === 'press') {
      if (!o.ok) { play([['qobil', `Yodchi or not, article nine has no exceptions. I wrote that part myself.|Ёдчи не ёдчи, а в статье девятой исключений нет. Эту часть я сам писал.|Yodchi bo'lsang ham, to'qqizinchi moddada istisno yo'q. O'sha qismini o'zim yozganman.`]], d); return; }
      setC('licence', 'pressed'); FAC.susp && FAC.susp('divan', 1);
      play([
        ['qobil', `...Signed. Under protest. I'm writing "under protest" in the margin. Small, but it's there.|...Подписано. Под давлением. Я пишу на полях: «под давлением». Мелко, но пишу.|...Imzolandi. Majburan. Hoshiyaga «majburan» deb yozib qo'yaman. Mayda qilib, lekin yozaman.`],
        () => (FAC.inParty('nargiza') ? ['nargiza', `You frightened a clerk. Very brave, yodchi.|Напугал писаря. Очень храбро, ёдчи.|Mirzani qo'rqitding. Juda jasur ekansan, yodchi.`] : null)
      ], after(d));
    } else {
      setC('licence', 'part');
      play([
        ['qobil', `A wise clerk... with a good voice? Who saves the day with a well-placed regulation?|Мудрый писарь... с хорошим голосом? Который спасает всех вовремя приведённым правилом?|Dono mirza... ovozi ham yaxshi? Vaqtida keltirilgan qoida bilan hammani qutqaradigan?`],
        ['qobil', `I'll need to see the script. And I'll want to approve my lines. Licence granted, provisionally.|Мне нужно будет посмотреть сценарий. И свои реплики я утверждаю сам. Лицензия выдана, условно.|Ssenariyni ko'rishim kerak. O'z gaplarimni ham o'zim tasdiqlayman. Litsenziya berildi, shartli ravishda.`]
      ], after(d));
    }
  }));
  const after = d => () => {
    FAC.stepTo('cameo', C('light') ? `The licence and the light are sorted. The premiere is tonight on the Bazaar, after dark.|Лицензия и свет улажены. Премьера сегодня на Базаре, когда стемнеет.|Litsenziya ham, chiroq ham hal bo'ldi. Premyera bugun Bozorda, qorong'i tushgach.` : `The licence is sorted. Now the lamp: Azamat says it goes dark exactly when it gets interesting.|С лицензией улажено. Теперь лампа: Азамат говорит, что она гаснет ровно тогда, когда становится интересно.|Litsenziya hal bo'ldi. Endi chiroq: Azamatning aytishicha, u aynan qiziq joyida o'chadi.`, ['bazaar', 'shadow']);
    d();
  };

  /* ---------------------------------------------------------------- the light */
  const light = d => play([
    ['azamat', `Watch. I light it, it burns, I tell it something exciting —|Смотри. Зажигаю, горит, рассказываю ей что-нибудь захватывающее —|Qara. Yoqaman, yonyapti, unga qiziq bir narsa aytaman —`],
    ['', `"— and then the wolf opened his eyes!" says Sherzod. The lamp goes out with a small, contemptuous puff.|«— и тут волк открыл глаза!» — говорит Шерзод. Лампа гаснет с маленьким презрительным пыхом.|«— va shu payt bo'ri ko'zini ochdi!» — deydi Sherzod. Chiroq kichkina, mensimagan pufak bilan o'chadi.`],
    ['azamat', `Every time. Bought it cheap from a Divan storeroom. Now I know why.|Каждый раз. Купил дёшево на складе Дивана. Теперь понятно почему.|Har safar. Devon omboridan arzonga olgandim. Endi nimaga ekanini tushundim.`]
  ], () => ask(`The lamp sits there, smug and brass.|Лампа стоит себе — латунная и самодовольная.|Chiroq turibdi — jez va o'zidan mamnun.`, [
    { id: 'oil', price: 25, label: `"Buy proper oil from the Copper Row. Cheap oil sulks." (25 tilla)|«Купи нормального масла в Медном ряду. Дешёвое капризничает.» (25 тилла)|«Mis rastasidan yaxshi moy ol. Arzon moy injiqlik qiladi.» (25 tilla)` },
    FAC.craft('taste', `the lamp's brass|латунь лампы|chiroqning jezi`, { id: 'taste' }),
    sado() ? { id: 'sado', label: `"Sado. Could you…?"|«Садо. Можешь…?»|«Sado. Qila olasanmi…?»` } : null
  ].filter(Boolean), o => {
    if (o.id === 'oil') {
      if ((G.run.gold || 0) < 25) { play([['azamat', `With what? Your face? We tried that, it doesn't burn.|На что? На лицо твоё? Мы пробовали, оно не горит.|Nimaga? Yuzinggami? Sinab ko'rganmiz, yonmaydi.`]], d); return; }
      gold(-25); setC('light', 'oil');
      play([['', `The good oil burns clean and steady. Sherzod tells it the most exciting thing he knows. The lamp doesn't care. That's what you want from a lamp.|Хорошее масло горит ровно и чисто. Шерзод рассказывает ей самое захватывающее, что знает. Лампе всё равно. Именно это и нужно от лампы.|Yaxshi moy tekis va toza yonadi. Sherzod unga bilgan eng qiziq narsasini aytib beradi. Chiroqqa farqi yo'q. Chiroqdan aynan shu kerak.`]], afterLight(d));
    } else if (o.id === 'taste') {
      FAC.taste([
        ['memory', `A long room at the Divan. A man in a grey coat watching a puppet show for a prince's birthday, eyes closed, counting the minutes.|Длинная зала в Диване. Человек в сером кафтане смотрит кукольное представление на дне рождения царевича — глаза закрыты, считает минуты.|Devondagi uzun xona. Kulrang to'nli odam shahzodaning tug'ilgan kunidagi qo'g'irchoq tomoshasini ko'rib o'tiribdi — ko'zlari yumuq, daqiqalarni sanaydi.`],
        ['memory', `"Whenever it gets good," he tells a lamp-maker, "make it go out. People must learn to go home."|«Как только станет интересно, — говорит он мастеру ламп, — пусть гаснет. Людей надо приучать расходиться по домам».|«Qiziq bo'lgan zahoti, — deydi u chiroqsozga, — o'chsin. Odamlarni uy-uyiga tarqalishga o'rgatish kerak».`]
      ], () => ask(`A theatre-hater's memory, sealed into the brass.|Память человека, ненавидевшего театр, запаянная в латунь.|Teatrni yomon ko'rgan odamning xotirasi, jezga kavsharlab qo'yilgan.`, [
        FAC.craft('burn', `the memory out of the brass|память из латуни|xotirani jezdan`, { id: 'burn' }),
        FAC.craft('take', `it, and keep it for yourself|её — и оставить себе|uni — va o'zingga olib qo'yish`, { id: 'take' })
      ], o2 => {
        if (o2.id === 'burn') { setC('light', 'burned'); play([['', `A smell of hot dust and boredom. The lamp flares and settles. Sherzod reads it his best page; it keeps burning.|Пахнет горячей пылью и скукой. Лампа вспыхивает и успокаивается. Шерзод читает ей лучшую страницу — горит.|Issiq chang va zerikish hidi keladi. Chiroq lov etib yonadi-yu, tinchlanadi. Sherzod unga eng yaxshi sahifasini o'qiydi — yonib turibdi.`]], afterLight(d)); }
        else {
          setC('light', 'took'); FAC.takeMem(`a theatre-hater's boredom|скука человека, ненавидевшего театр|teatrni yomon ko'rgan odamning zerikishi`);
          play([
            ['', `You draw the memory out and keep it. For a moment you can't think of a single thing worth watching. Then it passes. Mostly.|Ты вытягиваешь память и оставляешь себе. На миг тебе кажется, что смотреть вообще не на что. Потом проходит. Почти.|Xotirani tortib olib, o'zingda qoldirasan. Bir lahza dunyoda tomosha qilishga arziydigan hech narsa yo'qdek tuyuladi. Keyin o'tib ketadi. Deyarli.`],
            () => (sado() ? ['sado', `You look like you're about to go home and count the minutes.|У тебя такое лицо, будто ты сейчас пойдёшь домой считать минуты.|Yuzingdan hozir uyga ketib, daqiqalarni sanaydigandeksan.`] : null)
          ], afterLight(d));
        }
      }), { intro: `You lay your palm on the warm brass. Somebody's old evening rises through it.|Кладёшь ладонь на тёплую латунь. Сквозь неё поднимается чей-то давний вечер.|Kaftingni iliq jezga qo'yasan. Undan kimningdir qadimgi oqshomi ko'tariladi.` });
    } else {
      setC('light', 'sado');
      play([
        ['sado', `Me? I'm not a lamp. ...Fine. Only because the wolf deserves it.|Я? Я не лампа. ...Ладно. Только потому, что волк этого заслуживает.|Menmi? Men chiroq emasman. ...Mayli. Faqat bo'ri bunga loyiq bo'lgani uchun.`],
        ['', `The sheet fills with a light that comes from nowhere in particular. Azamat looks behind it twice.|Простыня наполняется светом, который идёт неизвестно откуда. Азамат дважды заглядывает за неё.|Choyshab qayerdan kelayotgani noma'lum yorug'likka to'ladi. Azamat uning orqasiga ikki marta qarab chiqadi.`],
        ['azamat', `I don't understand it and I'm not going to ask.|Я этого не понимаю и спрашивать не буду.|Men buni tushunmayapman va so'ramayman ham.`]
      ], afterLight(d));
    }
  }));
  const afterLight = d => () => {
    FAC.stepTo('cameo', C('licence') ? `The licence and the light are sorted. The premiere is tonight on the Bazaar, after dark.|Лицензия и свет улажены. Премьера сегодня на Базаре, когда стемнеет.|Litsenziya ham, chiroq ham hal bo'ldi. Premyera bugun Bozorda, qorong'i tushgach.` : `The lamp is sorted. Now the licence: the clerk Qobil-mirza stands by the weights.|С лампой улажено. Теперь лицензия: писарь Кабиль-мирза стоит у весов.|Chiroq hal bo'ldi. Endi litsenziya: mirza Qobil tarozi yonida turibdi.`, ['bazaar', C('licence') ? 'shadow' : 'stamp']);
    d();
  };

  /* ---------------------------------------------------------------- the premiere */
  const premiere = d => {
    const comps = FAC.anyComp();
    play([
      ['', `Night on the Bazaar. Thirty people on rugs and upturned crates, children at the front, a porter still holding his load. The lamp is lit. The sheet glows.|Ночь на Базаре. Человек тридцать на коврах и перевёрнутых ящиках, дети впереди, носильщик так и сидит с поклажей. Лампа горит. Простыня светится.|Bozorda tun. O'ttizga yaqin odam gilamlar va to'nkarilgan qutilar ustida, bolalar oldinda, hammol yukini ham qo'ymay o'tiribdi. Chiroq yonyapti. Choyshab nur sochyapti.`],
      ['', `A wolf made of two hands and a stick lies down across the sheet. Tiny houses climb its back. The children go quiet.|Волк из двух ладоней и палочки ложится поперёк простыни. По его спине карабкаются крошечные домики. Дети затихают.|Ikki kaft va bir tayoqchadan yasalgan bo'ri choyshab bo'ylab cho'zilib yotadi. Uning ustiga mitti uychalar tirmashadi. Bolalar jim bo'lib qolishadi.`],
      () => (C('licence') === 'part' ? ['', `Halfway through, Qobil-mirza walks into the light in a paper hat and reads a regulation at the wolf. The crowd laughs so hard the lamp flickers.|На середине в свет выходит Кабиль-мирза в бумажной шапке и зачитывает волку правило. Публика хохочет так, что мигает лампа.|O'rtasida yorug'likka qog'oz qalpoqli Qobil mirza chiqib, bo'riga qoida o'qib beradi. Tomoshabinlar shunday kulishadiki, chiroq lipillab ketadi.`] : null),
      () => (C('licence') === 'pressed' ? ['', `Two Divan guards stand at the back with their arms folded. Every few minutes one of them reads the licence again.|Сзади стоят два стражника Дивана, руки скрещены. Каждые несколько минут один из них заново перечитывает лицензию.|Orqada qo'llarini ko'ksiga qovushtirgan ikki Devon soqchisi turibdi. Bir necha daqiqada biri litsenziyani qayta o'qiydi.`] : null),
      ['', `The hero's shadow reaches the wolf's head. Then nothing happens. Behind the sheet, a furious whisper.|Тень героя добирается до головы волка. И ничего не происходит. За простынёй — яростный шёпот.|Qahramonning soyasi bo'rining boshiga yetadi. Va hech narsa bo'lmaydi. Choyshab ortida — g'azabli shivir.`],
      ['azamat', `...you said you'd decided!|...ты же сказал, что решил!|...o'zing hal qildim degan eding-ku!`],
      ['sherzod', `I decided on three! Yodchi — psst — yodchi. Which one?|Я решил три! Ёдчи — пс-ст — ёдчи. Какую?|Men uchtasini hal qildim! Yodchi — pss — yodchi. Qaysi biri?`]
    ], () => ask(`Thirty people are looking at the sheet. Sherzod is looking at you.|Тридцать человек смотрят на простыню. Шерзод смотрит на тебя.|O'ttiz kishi choyshabga qarab turibdi. Sherzod esa senga qarab turibdi.`, [
      { id: 'dance', label: `"The wolf wakes up and everybody dances."|«Волк просыпается, и все пляшут.»|«Bo'ri uyg'onadi va hamma raqsga tushadi.»` },
      { id: 'home', label: `"The wolf keeps sleeping. The hero pays what he owes and goes home."|«Волк спит дальше. Герой платит, что должен, и идёт домой.»|«Bo'ri uxlashda davom etadi. Qahramon qarzini to'laydi va uyiga ketadi.»` },
      { id: 'crowd', label: `"Ask them."|«Спроси у них.»|«Ulardan so'ra.»` }
    ], o => {
      setC('ending', o.id);
      const fin = (lines, text, deltas) => {
        FAC.react(deltas, 'cameo');
        play(lines.concat([
          () => (comps.includes('alp') ? ['alp', { dance: `...Alp liked the wolf. Alp would like to see it dance again.|...Алпу понравился волк. Алп хочет ещё раз посмотреть, как он пляшет.|...Alpga bo'ri yoqdi. Alp uning yana raqsga tushganini ko'rgisi keladi.`, home: `It was sad. It was true. Alp does not know which is worse.|Было грустно. Было правдиво. Алп не знает, что хуже.|G'amgin edi. Rost edi. Alp qaysi biri yomonroq ekanini bilmaydi.`, crowd: `Alp held a man up so he could see the fight. Is that allowed?|Алп поднял одного человека, чтобы ему было видно драку. Так можно?|Alp bir odamni janjalni ko'rsin deb ko'tarib turdi. Shunday qilsa bo'ladimi?` }[o.id]] : null),
          () => (comps.includes('nargiza') ? ['nargiza', { dance: `Everyone dancing on a wolf's back. Nice. Nobody asked the wolf.|Все пляшут на спине у волка. Мило. Волка никто не спросил.|Hamma bo'rining ustida raqs tushyapti. Yoqimli. Bo'ridan hech kim so'ramadi.`, home: `I'm humming that ending all the way home, and you can't stop me.|Я этот конец всю дорогу домой буду напевать, и ты меня не остановишь.|Shu oxirini uygacha xirgoyi qilib boraman, to'xtatolmaysan.`, crowd: `That was the most honest thing I've seen in this city. Ugly, loud, honest.|Ничего честнее я в этом городе не видела. Некрасиво, громко, честно.|Bu shaharda bundan halolroq narsani ko'rmaganman. Xunuk, shovqinli, halol.` }[o.id]] : null),
          () => (comps.includes('surayyo') ? ['surayyo', { dance: `In the Tail we'd have danced on the actual roofs. But this was sweet.|У нас в Хвосте плясали бы прямо на крышах. Но это было мило.|Bizning Dumda to'g'ri tomlarda o'ynashardi. Lekin bu ham yoqimli bo'ldi.`, home: `He paid and went home. That's the bravest ending there is, and nobody claps for it.|Он заплатил и ушёл домой. Это самый смелый конец, и за него никто не хлопает.|U to'ladi va uyiga ketdi. Eng jasur oxir shu, unga esa hech kim qarsak chalmaydi.`, crowd: `Somebody stole my shoe in the fight. I took two back. We're even.|В драке у меня украли башмак. Я забрала два. Мы квиты.|Janjalda kimdir kovushimni o'g'irladi. Men ikkitasini oldim. Endi tengmiz.` }[o.id]] : null)
        ]), () => {
          FAC.finish('cameo', o.id, text);
          d();
        });
      };
      if (o.id === 'dance') {
        rep('tail', 1); rep('singers', -1); gold(60);
        fin([
          ['', `Two hands become a wolf that rolls over, yawns and kicks its legs. The children scream with delight. The porter drops his load and dances with it.|Две ладони становятся волком, который переворачивается, зевает и дрыгает лапами. Дети визжат от восторга. Носильщик бросает поклажу и пляшет вместе с ней.|Ikki kaft ag'darilib, esnab, oyoqlarini silkitayotgan bo'riga aylanadi. Bolalar xursandchilikdan chinqirishadi. Hammol yukini tashlab, u bilan birga raqs tushadi.`],
          ['', `At the back, two novices in white get up and leave without a word. A wolf that wakes up isn't funny in the Cloister.|Сзади двое послушников в белом молча встают и уходят. Волк, который просыпается, в Обители не смешит.|Orqada oq kiyimli ikki shogird indamay turib, chiqib ketishadi. Uyg'ongan bo'ri xonaqohda kulgili emas.`],
          ['azamat', `Sixty tilla in the hat. Your share. Don't argue, I already counted it twice.|Шестьдесят тилла в шапке. Твоя доля. Не спорь, я уже дважды пересчитал.|Qalpoqda oltmish tilla. Sening ulushing. Bahslashma, ikki marta sanab bo'ldim.`],
          ['sherzod', `Cheap. It worked. I hate that it worked.|Дёшево. И сработало. Ненавижу, что сработало.|Arzon. Va ishladi. Ishlagani alam qiladi.`]
        ], `They showed the wolf waking and everyone dancing. The Bazaar loved it; the Cloister walked out.|Показали, как волк просыпается и все пляшут. Базар был в восторге, Обитель ушла.|Bo'rining uyg'onib, hammaning raqs tushganini ko'rsatishdi. Bozor xursand bo'ldi, xonaqoh chiqib ketdi.`, { alp: 10, nargiza: -5, surayyo: 5 });
      } else if (o.id === 'home') {
        rep('tail', 2); addVoid(-2);
        fin([
          ['', `The wolf sleeps on. The hero's shadow sets down a small bundle at its paw and walks home along the edge of the sheet. Nobody laughs. An old man in the front row wipes his face with his sleeve.|Волк спит дальше. Тень героя кладёт у его лапы маленький узелок и уходит домой вдоль края простыни. Никто не смеётся. Старик в первом ряду вытирает лицо рукавом.|Bo'ri uxlashda davom etadi. Qahramonning soyasi uning panjasi yoniga kichkina tugun qo'yadi va choyshab chetidan uyiga qaytadi. Hech kim kulmaydi. Oldingi qatordagi chol yengi bilan yuzini artadi.`],
          ['', `Then he starts to clap, slowly. The rest follow. It goes on a long time.|Потом он начинает медленно хлопать. За ним остальные. Хлопают долго.|Keyin u sekin qarsak chala boshlaydi. Qolganlar ham qo'shiladi. Uzoq chalishadi.`],
          ['sherzod', `Here. The first page, the one with the wolf. Keep it. I'll write another.|Вот. Первая страница, та, где волк. Возьми. Я напишу другую.|Ma. Birinchi sahifa, bo'ri tushgan. Olib qo'y. Boshqasini yozaman.`],
          ['azamat', `Eleven tilla in the hat. People who cry don't pay. Worth it, though.|Одиннадцать тилла в шапке. Кто плачет, тот не платит. Но оно того стоило.|Qalpoqda o'n bir tilla. Yig'laganlar pul to'lamaydi. Lekin arziydi.`]
        ], `They showed the wolf sleeping on and the hero going home. Nobody laughed; everybody stayed.|Показали, как волк спит дальше, а герой идёт домой. Никто не смеялся, и никто не ушёл.|Bo'rining uxlashda davom etib, qahramonning uyiga ketganini ko'rsatishdi. Hech kim kulmadi, hech kim ketmadi.`, { nargiza: 10, surayyo: 10, alp: 5 });
        SIDE.flag('cam_page', 1);
      } else {
        rep('tail', 1); gold(100); if (C('licence') === 'pressed') { rep('divan', -1); setC('closed', 1); }
        fin([
          ['sherzod', `Friends! The wolf — does he wake or not?|Друзья! Волк — просыпается или нет?|Do'stlar! Bo'ri — uyg'onadimi yo yo'qmi?`],
          ['', `Half the Bazaar shouts yes, half shouts no, and a fishmonger shouts that the wolf should marry. A porter and a Divan guard come to blows over the wolf's name. Azamat walks through it all selling tea.|Пол-Базара кричит «да», пол-Базара — «нет», а торговка рыбой кричит, что волку пора жениться. Носильщик и стражник Дивана дерутся из-за того, как зовут волка. Азамат проходит сквозь всё это и продаёт чай.|Bozorning yarmi «ha», yarmi «yo'q» deydi, baliqfurush ayol esa bo'ri uylansin deb qichqiradi. Hammol bilan Devon soqchisi bo'rining ismi uchun mushtlashib ketadi. Azamat bularning orasidan choy sotib o'tadi.`],
          () => (C('closed') ? ['', `The guards with the licence decide it was signed under protest after all, and close the show. Nobody notices; the fight is better.|Стражники с лицензией решают, что подписана она всё-таки под давлением, и закрывают представление. Никто не замечает: драка интереснее.|Litsenziyali soqchilar u baribir majburan imzolangan degan qarorga kelib, tomoshani yopishadi. Hech kim sezmaydi: janjal qiziqroq.`] : null),
          ['azamat', `A hundred tilla. In tea. Sherzod, write more endings nobody decides.|Сто тилла. На чае. Шерзод, пиши побольше концов, которые никто не решил.|Yuz tilla. Choydan. Sherzod, hech kim hal qilmagan oxirlarni ko'proq yoz.`],
          ['sherzod', `This was the plan all along.|Так и было задумано.|Aslida shunday rejalashtirilgan edi.`]
        ], `They let the crowd shout the ending. It became a brawl, and the best night the Bazaar has had in years.|Конец они отдали публике. Вышла драка — и лучшая ночь Базара за много лет.|Oxirini tomoshabinlarga berishdi. Janjal chiqdi — va Bozorning ko'p yillardagi eng yaxshi kechasi bo'ldi.`, { surayyo: 10, nargiza: 5, alp: -5 });
      }
    }));
  };

  /* ---------------------------------------------------------------- who says what */
  const AFTER = {
    dance: `"Every Friday now. The wolf dances better than either of us." Azamat doesn't look up from his coins. "Better than you, anyway."|«Теперь каждую пятницу. Волк пляшет лучше нас обоих». Азамат не отрывается от монет: «Лучше тебя, во всяком случае».|«Endi har juma. Bo'ri ikkalamizdan ham yaxshiroq raqs tushadi». Azamat tangalaridan ko'z uzmaydi: «Har holda sendan yaxshiroq».`,
    home: `"People come back to cry at the same place every week," Sherzod says. "I'm not sure that's a success. Azamat says it is."|«Люди приходят плакать на одном и том же месте каждую неделю, — говорит Шерзод. — Не знаю, успех ли это. Азамат говорит, что успех».|«Odamlar har hafta bir joyga kelib yig'lashadi, — deydi Sherzod. — Bu muvaffaqiyatmi, bilmayman. Azamat muvaffaqiyat deydi».`,
    crowd: `"Every show ends in an argument now. We sell tea at the argument." Sherzod grins. "Art."|«Теперь каждое представление кончается спором. На споре мы продаём чай». Шерзод ухмыляется: «Искусство».|«Endi har bir tomosha bahs bilan tugaydi. Bahsda biz choy sotamiz». Sherzod iljayadi: «San'at».`
  };
  FAC.talk.sherzod = d => {
    if (done('cameo')) { play([['', AFTER[FAC.br('cameo')] || AFTER.dance]], d); return; }
    if (q('cameo').st === 'none') { if (FAC.Q.cameo.offer()) offer(d); else play([['', `Sherzod is too deep in a page to notice you.|Шерзод так погружён в страницу, что тебя не замечает.|Sherzod sahifaga shunchalik berilib ketganki, seni sezmaydi.`]], d); return; }
    if (ready()) {
      if (!SIDE.night()) { play([['sherzod', `After dark. Shadows need dark. That part I did decide.|Когда стемнеет. Теням нужна темнота. Вот это я как раз решил.|Qorong'i tushgach. Soyaga qorong'ilik kerak. Shunisini aniq hal qilganman.`]], d); return; }
      premiere(d); return;
    }
    play([['sherzod', `The licence, the lamp. Then the wolf. Then glory.|Лицензия, лампа. Потом волк. Потом слава.|Litsenziya, chiroq. Keyin bo'ri. Keyin shon-shuhrat.`]], d);
  };
  FAC.talk.azamat = d => {
    if (done('cameo')) { play([['', AFTER[FAC.br('cameo')] || AFTER.dance]], d); return; }
    if (q('cameo').st === 'none') { FAC.talk.sherzod(d); return; }
    if (!C('light')) { light(d); return; }
    if (ready()) { FAC.talk.sherzod(d); return; }
    play([['azamat', `Lamp's fine. Now we wait for the clerk to stop enjoying himself.|С лампой порядок. Теперь ждём, когда писарь перестанет получать удовольствие.|Chiroq joyida. Endi mirza zavqlanishdan to'xtashini kutamiz.`]], d);
  };
  FAC.talk.qobil = d => {
    if (act('cameo') && !C('licence')) { licence(d); return; }
    const L = {
      part: `"They say I was the best thing in it." He has had that sentence embroidered on a handkerchief.|«Говорят, я был лучшим в спектакле». Эту фразу он велел вышить на платке.|«Aytishlaricha, tomoshada eng zo'ri men bo'lgan ekanman». Shu gapni ro'molchasiga kashta qildirib olgan.`,
      pressed: `"Under protest," he says, by way of hello, and stamps something harder than it needs.|«Под давлением», — говорит он вместо приветствия и бьёт печатью сильнее, чем нужно.|«Majburan», — deydi u salom o'rniga va muhrni keragidan qattiqroq bosadi.`,
      paid: `"Article nine, fully satisfied." He sounds almost tender about it.|«Статья девятая соблюдена полностью». В его голосе почти нежность.|«To'qqizinchi modda to'liq bajarildi». Ovozida mehr ham bor.`
    };
    play([['', L[C('licence')] || `Qobil-mirza is reading a regulation to a pigeon.|Кабиль-мирза зачитывает правило голубю.|Qobil mirza kaptarga qoida o'qib beryapti.`]], d);
  };
  // the lamp itself, on the stage spot, while the light is the problem
  FAC.prop('bazaar', 'shadow', { id: 'camlamp', art: 'f6fire', dx: 8, prompt: `Look at the lamp|Посмотреть на лампу|Chiroqqa qarash`, when: () => act('cameo') && !C('light'), use: d => light(d) });

  /* ---------------------------------------------------------------- the epilogue */
  SIDE.epi('cameo', e => {
    if (!done('cameo')) return null;
    return {
      dance: `Sherzod and Azamat played "The Blue Wolf" every Friday on the Bazaar until the wolf learned to dance better than the actors. Azamat bought a second lamp. It also went dark at the good parts.|Шерзод и Азамат каждую пятницу показывали на Базаре «Синего волка», пока волк не научился плясать лучше актёров. Азамат купил вторую лампу. Она тоже гасла на самом интересном.|Sherzod va Azamat har juma Bozorda «Ko'k bo'ri»ni ko'rsatishdi, toki bo'ri aktyorlardan yaxshiroq raqs tushishni o'rganmaguncha. Azamat ikkinchi chiroq sotib oldi. U ham eng qiziq joyida o'chardi.`,
      home: `Sherzod rewrote the sad ending eleven times and never changed a word. Azamat built a lamp that never went out. People came to cry and went home lighter.|Шерзод одиннадцать раз переписывал грустный конец и не поменял ни слова. Азамат собрал лампу, которая никогда не гасла. Люди приходили поплакать и уходили домой полегче.|Sherzod g'amgin oxirni o'n bir marta qayta yozdi va bitta so'zini ham o'zgartirmadi. Azamat hech qachon o'chmaydigan chiroq yasadi. Odamlar yig'lagani kelishar, uyga yengil tortib ketishardi.`,
      crowd: `The audience's ending became a city custom: every show ends in an argument, and Azamat sells tea at it. Sherzod still says it was the plan all along.|Конец от публики стал городским обычаем: каждое представление кончается спором, а Азамат продаёт на нём чай. Шерзод до сих пор говорит, что так и было задумано.|Tomoshabinlar oxiri shahar odatiga aylandi: har bir tomosha bahs bilan tugaydi, Azamat esa unda choy sotadi. Sherzod hali ham shunday rejalashtirilgan edi, deydi.`
    }[FAC.br('cameo')] || null;
  }, 'tail:stories');
}
