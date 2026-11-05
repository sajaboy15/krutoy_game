/* 89y_quests_ark_cloister.js — two investigations (GDD ch. 20: a riddle, a turn, no clean way out, people return).
     qa1 Someone Else's Conscience (Ark → Rabat → Tail)
         Nurali, a groom of the House of Lochin, dreams every night that he shoots a boy on the Rabat road. The memory is
         his master's son's: the Divan keeps "bearers" who carry what their lords can't afford to remember before the
         Singers' court. The boy's mother still sews him shirts; the heir, without that evening, is the kindest voice in
         the Divan and is petitioning to cut the Tail's water tithe. Endings: sing it back into the heir / give it to the
         mother in wax / leave it in the groom / burn it.
     qc1 The Light Tithe (Cloister → Bazaar → Tower of Silence)
         A novice's father is blackmailed with the shame she gave as her "light tithe". The old Keeper Mavlon never fed
         the light tithe to the Well: for twenty years he has kept the sharp shames on a shelf under the Tower of Silence
         and used them to hold judges back from the Tail (and the blackmail money feeds the widow the father cheated).
         Endings: tell the Order / give the shelf to Those Who Remember / burn it / leave it and pay with your own shame.
   The two touch: the register in qa1 names Mavlon; Mavlon in qc1 knows the Lochin case; each reads the other's flags.
   Flags: SIDE.flag('qa1_*'), SIDE.flag('qc1_*'). Epilogue slides borrow 'city:chain' and 'shirin:tithe'. */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, br = FAC.br, sf = SIDE.flag, cl = FAC.cl, cat3 = FAC.cat3;
  const sado = () => (typeof sadoAwake === 'function' && sadoAwake());
  const day = () => { try { return (G.WORLD2.S() && G.WORLD2.S().day) || 1; } catch (e) { return 1; } };
  const since = id => (q(id).day ? day() - q(id).day : 0);

  /* ================================================================================================ qa1 · SOMEONE ELSE'S CONSCIENCE */
  CAST.qa_qodir = { name: `Nurali, a groom of the House of Lochin|Нурали, конюх дома Лочин|Lochin xonadonining otboqari Nurali`, portrait: null };
  CAST.qa_jahon = { name: `Jahongir-bek of the House of Lochin|Жахонгир-бек из дома Лочин|Lochin xonadonidan Jahongirbek`, portrait: null };
  CAST.qa_robiya = { name: `Robiya the laundress|Прачка Робия|Kir yuvuvchi Robiya`, portrait: null };
  CAST.qa_anvar = { name: `Anvar-mirza, keeper of the registers|Анвар-мирза, хранитель реестров|Daftarlar mirzasi Anvar`, portrait: null };
  const LKA = {
    qodir: { body: 'man', robe: '#4a4038', trim: '#8a7a5a', skin: '#b08868', head: 'doppi', headC: '#2a2420', beard: 'short', sash: '#6a5a3a' },
    jahon: { body: 'noble', robe: '#2a4a6a', trim: '#e2b452', skin: '#d0a880', head: 'turban', headC: '#f0e8d8', sash: '#e2b452' },
    robiya: { body: 'woman', robe: '#6a5a6a', trim: '#a89a8a', skin: '#b08868', head: 'scarf', headC: '#d8d0c0' },
    anvar: { body: 'man', robe: '#d8ccb0', trim: '#7a8aa0', skin: '#d0a882', head: 'turban', headC: '#e8e0cc', pat: 'stripes' }
  };
  SIDE.quest('qa1', { n: 22, title: `Someone Else's Conscience|Чужая совесть|Birovning vijdoni`, where: ['ark', 'qa1_stable'] });
  FAC.spot('ark', 'qa1_stable', 0.6);
  FAC.spot('ark', 'qa1_garden', 0.69);
  FAC.spot('ark', 'qa1_reg', 0.92);
  FAC.spot('rabat', 'qa1_cist', 0.4);
  FAC.spot('tail', 'qa1_wash', 0.35);
  const A = k => sf('qa1_' + k);
  const setA = (k, v) => sf('qa1_' + k, v === undefined ? 1 : v);
  const qaAll = () => A('name') && A('mother') && A('page') && A('jahon');
  const qaWhere = () => (!A('name') ? ['rabat', 'qa1_cist'] : !A('page') ? ['ark', 'qa1_reg'] : !A('mother') ? ['tail', 'qa1_wash'] : !A('jahon') ? ['ark', 'qa1_garden'] : ['ark', 'qa1_stable']);
  const qaStep = text => FAC.stepTo('qa1', qaAll() ? cat3(text, ' ', `Now go back to Nurali.|Теперь вернуться к Нурали.|Endi Nuraliga qaytish kerak.`) : text, qaWhere());

  /* ---------------------------------------------------------------- where they are */
  FAC.npc('qa_qodir', { name: CAST.qa_qodir.name, look: LKA.qodir, dx: -6, prompt: `Talk to the groom|Поговорить с конюхом|Otboqar bilan gaplashish`, idle: `The groom rubs his thumb and two fingers together, as if a bowstring had just cut them.|Конюх трёт большой и два пальца, будто их только что резанула тетива.|Otboqar bosh va ikki barmog'ini ishqalaydi — go'yo ularni hozirgina kamon ipi kesgandek.` },
    () => (done('qa1') && br('qa1') === 'keep' && since('qa1') >= 2 ? [{ from: 7, to: 21, region: 'rabat', spot: 'qa1_cist' }] : [{ from: 6, to: 23, region: 'ark', spot: 'qa1_stable' }]));
  FAC.npc('qa_jahon', { name: CAST.qa_jahon.name, look: LKA.jahon, dx: 10, prompt: `Talk to the young bek|Поговорить с молодым беком|Yosh bek bilan gaplashish`, idle: `A young bek reads a petition aloud to a fountain and crosses out words.|Молодой бек читает петицию вслух фонтану и вычёркивает слова.|Yosh bek arizani favvoraga ovoz chiqarib o'qiydi va so'zlarni o'chiradi.` },
    () => (done('qa1') && br('qa1') === 'return' ? [{ from: 6, to: 20, region: 'tail', spot: 'qa1_wash' }] : [{ from: 8, to: 21, region: 'ark', spot: 'qa1_garden' }]));
  FAC.npc('qa_robiya', { name: CAST.qa_robiya.name, look: LKA.robiya, dx: -22, prompt: `Talk to the laundress|Поговорить с прачкой|Kir yuvuvchi bilan gaplashish`, idle: `A laundress beats a rug over the canal and doesn't look up.|Прачка выбивает ковёр над арыком и не поднимает головы.|Kir yuvuvchi ayol ariq ustida gilam qoqyapti, boshini ko'tarmaydi.` },
    () => {
      if (done('qa1') && br('qa1') === 'mother' && since('qa1') >= 1) return [{ from: 8, to: 20, region: 'ark', spot: 'qa1_garden' }];
      return act('qa1') || done('qa1') ? [{ from: 6, to: 21, region: 'tail', spot: 'qa1_wash' }] : [];
    });
  FAC.npc('qa_anvar', { name: CAST.qa_anvar.name, look: LKA.anvar, dx: 0, prompt: `Talk to the keeper of the registers|Поговорить с хранителем реестров|Daftarlar mirzasi bilan gaplashish`, idle: `The keeper of the registers dusts a ledger nobody is allowed to read.|Хранитель реестров стирает пыль с книги, которую никому нельзя читать.|Daftarlar mirzasi hech kimga o'qish mumkin bo'lmagan kitobning changini artyapti.` },
    () => [{ from: 8, to: 19, region: 'ark', spot: 'qa1_reg' }]);

  /* ---------------------------------------------------------------- 1 · the groom */
  const qaOffer = d => play([
    ['', `A groom sits on an upturned bucket by the Divan's stables, rubbing his right thumb and two fingers together, as if a bowstring had cut them.|У конюшен Дивана на перевёрнутом ведре сидит конюх и трёт большой и два пальца правой руки, будто их только что резанула тетива.|Devon otxonasi yonida ag'darilgan chelakda otboqar o'tiribdi. O'ng qo'lining bosh va ikki barmog'ini ishqalaydi, go'yo ularni kamon ipi kesgandek.`],
    ['qa_qodir', `Yodchi. I know the coat. ...I've never held a bow in my life. So why do my fingers ache from one every morning?|Ёдчи. Кафтан твой я знаю. ...Я в жизни лука в руках не держал. Так почему у меня каждое утро пальцы от тетивы ноют?|Yodchi. To'ningni taniyman. ...Umrimda qo'limga kamon olmaganman. Unda nega har tong barmoqlarim kamon ipidan zirqiraydi?`],
    ['qa_qodir', `Every night it's the same. Dusk, a road, a mulberry. A boy with a waterskin on his back. Laughter behind me. I let go of the string.|Каждую ночь одно и то же. Сумерки, дорога, тутовник. Мальчишка с бурдюком за спиной. Сзади хохочут. Я отпускаю тетиву.|Har kecha bir xil. G'ira-shira, yo'l, tut daraxti. Orqasida meshi bor bola. Orqamda kimlardir xaxolab kulyapti. Men ipni qo'yib yuboraman.`],
    ['qa_qodir', `My wife left in spring. Said she couldn't sleep next to a man who kills a child every night. I told her it isn't mine. It isn't. Is it?|Жена весной ушла. Сказала, не может спать рядом с человеком, который каждую ночь убивает ребёнка. Я ей говорю: это не моё. Ведь не моё же?|Xotinim bahorda ketib qoldi. Har kecha bola o'ldiradigan odam bilan bir yostiqqa bosh qo'yolmayman, dedi. Men aytaman: bu meniki emas. Meniki emas-ku, a?`],
    () => (sado() ? ['sado', `His hands shake the way yours do when you start counting.|У него руки дрожат, как у тебя, когда ты начинаешь считать.|Uning qo'llari sen sanay boshlaganingdagidek qaltirayapti.`] : null)
  ], () => hub(`Nurali|Нурали|Nurali`, [
    { label: `— Who put it in you?|— Кто тебе это вселил?|— Buni senga kim joylagan?`, lines: [
      ['qa_qodir', `Don't know. Three years ago the steward called me in, poured me wine and gave me a paper to thumb. I woke up in the hay with a split head and a raise.|Не знаю. Три года назад управляющий позвал меня, налил вина и дал бумагу — приложить палец. Проснулся в сене: голова трещит, жалованье прибавили.|Bilmayman. Uch yil oldin boshqaruvchi chaqirib, sharob quyib berdi, qog'ozga barmoq bostirdi. Pichan ustida uyg'ondim: boshim yorilay deydi, maoshim oshibdi.`]
    ] },
    { label: `— Why come to a yodchi?|— Почему ко мне, к ёдчи?|— Nega aynan yodchiga kelding?`, lines: [
      ['qa_qodir', `You take memories out of people for a living. Take this one. I'll pay what I've got. Not much: the raise went on wine.|Ты на жизнь зарабатываешь тем, что вынимаешь из людей память. Вынь эту. Заплачу, сколько есть. Немного: прибавка ушла на вино.|Sen odamlardan xotira sug'urib olib kun ko'rasan. Shunisini olib ber. Borini beraman. Ko'p emas: oshgan maosh sharobga ketdi.`],
      ['hero', `A taken memory has to go somewhere. Into wax, or into someone. First I want to know whose it is.|Вынутая память должна куда-то деться. В воск или в человека. Сначала хочу знать, чья она.|Olingan xotira bir joyga ketishi kerak. Mumgami, odamgami. Avval kimniki ekanini bilmoqchiman.`]
    ] }
  ], [
    { id: 'yes', label: `"Tell me about that road. I'll find out whose it is."|«Расскажи про ту дорогу. Я выясню, чья она.»|«O'sha yo'lni gapirib ber. Kimniki ekanini aniqlayman.»` },
    { id: 'no', label: `"Drink less. It helps with dreams."|«Пей поменьше. От снов помогает.»|«Kamroq ich. Tushlarga yordam beradi.»` }
  ], o => {
    if (o.id !== 'yes') { play([['qa_qodir', `It helped for a year.|Год помогало.|Bir yil yordam berdi.`]], d); return; }
    FAC.begin('qa1', `Nurali, a groom of the House of Lochin, dreams every night that he shoots a boy on a road by a mulberry. The memory isn't his. Find out whose it is.|Нурали, конюху дома Лочин, каждую ночь снится, что он стреляет в мальчишку на дороге у тутовника. Память не его. Выяснить, чья.|Lochin xonadonining otboqari Nurali har kecha tut yonidagi yo'lda bolaga o'q uzayotganini tushida ko'radi. Xotira uniki emas. Kimniki ekanini bilish kerak.`, ['ark', 'qa1_stable']);
    play([['', `He pulls back his sleeve. On the inside of his wrist, a small brand: the Divan's seal and a number. 114.|Он отворачивает рукав. На внутренней стороне запястья маленькое клеймо: печать Дивана и число. 114.|U yengini qaytaradi. Bilagining ichki tomonida kichkina tamg'a: Devon muhri va raqam. 114.`]], () => qaDream(d));
  }));
  const qaDream = d => ask(`The memory sits in him like a splinter under a nail.|Память сидит в нём, как заноза под ногтем.|Xotira unda tirnoq ostidagi zirapchadek o'tiribdi.`, [
    FAC.craft('taste', `the dream, through him|этот сон — через него|bu tushni — u orqali`, { id: 'taste' }),
    FAC.chk('mem', 5, `"Tell it again. Slowly. What you see, not what you feel."|«Расскажи ещё раз. Медленно. Что видишь, а не что чувствуешь.»|«Yana bir bor aytib ber. Sekin. Nimani his qilishingni emas, nimani ko'rishingni.»`, { id: 'listen' }, `Listen|Вслушаться|Quloq solish`),
    FAC.chk('collection', 2, `"Give me your wrist. A brand like that has its own page somewhere."|«Дай руку. У такого клейма где-то есть своя страница.»|«Qo'lingni ber. Bunaqa tamg'aning bir joyda o'z sahifasi bo'ladi.»`, { id: 'brand' }, `Yodchi's eye|Глаз ёдчи|Yodchi ko'zi`)
  ], o => {
    const after = () => { setA('road'); qaStep(`Nurali's dream: dusk on the Rabat road, a dry cistern under a mulberry, a boy with a waterskin. His wrist bears a Divan brand, number 114; the Divan keeps its registers in the Ark.|Сон Нурали: сумерки на Рабатской дороге, сухой хауз под тутовником, мальчишка с бурдюком. На запястье клеймо Дивана, номер 114; реестры Диван хранит в Арке.|Nuralining tushi: Rabot yo'lida g'ira-shira, tut ostidagi quruq hovuz, meshli bola. Bilagida Devon tamg'asi, 114-raqam; Devon daftarlarini Arkda saqlaydi.`); d(); };
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `Dusk on the Rabat road. A young voice, drunk and happy: "A tilla says I hit the skin on his back and leave him his shirt!" Friends laugh. The bow is beautiful, blue and gold.|Сумерки на Рабатской дороге. Молодой голос, пьяный и весёлый: «Ставлю тиллу — попаду в бурдюк, а рубаху не задену!» Друзья хохочут. Лук красивый, синий с золотом.|Rabot yo'lida g'ira-shira. Yosh, mast va quvnoq ovoz: «Bir tilla tikaman — meshiga tegizaman, ko'ylagiga tegmayman!» Do'stlari xaxolaydi. Kamon chiroyli, ko'k va tilla rang.`],
        ['memory', `The boy turns at the wrong moment. Then a dry cistern under the mulberry, and hands pushing something into the dark. Then the city gate, and a sudden cold sobriety.|Мальчишка оборачивается не вовремя. Потом сухой хауз под тутовником и руки, которые что-то спихивают в темноту. Потом городские ворота и внезапная холодная трезвость.|Bola noto'g'ri paytda o'girilib qoladi. Keyin tut ostidagi quruq hovuz va qorong'ilikka nimanidir itarayotgan qo'llar. Keyin shahar darvozasi va birdan kelgan sovuq hushyorlik.`],
        ['memory', `On the rider's sleeve, in gold thread, a falcon. The hands are young and soft. Not a groom's hands.|На рукаве всадника золотой нитью вышит сокол. Руки молодые и мягкие. Не конюха руки.|Chavandozning yengida tilla ip bilan lochin tikilgan. Qo'llar yosh va yumshoq. Otboqarning qo'llari emas.`],
        () => (sado() ? ['sado', `A falcon. The House of Lochin has a falcon on its gate. "Lochin" means falcon, doesn't it?|Сокол. У дома Лочин сокол на воротах. «Лочин» ведь и значит «сокол»?|Lochin. Lochin xonadonining darvozasida ham lochin bor. Tasodifmikan?`] : null)
      ], () => { setA('falcon'); after(); }, { person: true, intro: `You lay two fingers on his temple. He doesn't flinch. He's been waiting for someone to look.|Кладёшь два пальца ему на висок. Он не вздрагивает. Он давно ждал, чтобы кто-нибудь заглянул.|Ikki barmog'ingni uning chakkasiga qo'yasan. U seskanmaydi. Kimdir ichkariga qarashini ancha kutgan.` });
    } else if (o.id === 'listen' && o.ok) {
      setA('falcon');
      play([
        ['qa_qodir', `...There's laughing. Three of them. And rings: I feel rings on the hand that pulls the string. Heavy. And something gold on my sleeve, a bird.|...Хохочут. Трое. И перстни: на руке, что тянет тетиву, я чувствую перстни. Тяжёлые. И на рукаве что-то золотое, птица.|...Kulishyapti. Uchtasi. Uzuklar ham bor: ipni tortayotgan qo'limda uzuklarni sezaman. Og'ir. Yengimda esa allaqanday tilla narsa, qush.`],
        ['hero', `Grooms don't wear rings, and they don't hunt with three friends.|Конюхи перстней не носят и на охоту втроём не ездят.|Otboqarlar uzuk taqmaydi, ovga uchtadan do'st bilan chiqmaydi.`]
      ], after);
    } else if (o.id === 'brand' && o.ok) {
      setA('brand');
      play([['hero', `The Divan brands its "bearers": servants who carry what their lords can't afford to remember. Number 114 means a page in the Register of Bearers. I only need the number.|Диван клеймит своих «носильщиков» — слуг, которые носят то, что господам помнить не по карману. Номер 114 — это страница в Реестре носильщиков. Мне хватит номера.|Devon o'z «yukchilari»ga tamg'a bosadi — xo'jayinlari eslab yurolmaydigan narsani ko'tarib yuradigan xizmatkorlar. 114-raqam Yukchilar daftaridagi sahifa demak. Menga raqami yetadi.`]], after);
    } else {
      play([['qa_qodir', `I don't know! A road, a mulberry, a dry cistern. That's all I get. Then I wake up with my fingers bleeding.|Не знаю я! Дорога, тутовник, сухой хауз. Больше ничего. Потом просыпаюсь, а пальцы в крови.|Bilmayman! Yo'l, tut, quruq hovuz. Boshqa hech narsa. Keyin uyg'onaman, barmoqlarim qonga belangan.`]], after);
    }
  });

  /* ---------------------------------------------------------------- 2 · the cistern on the Rabat road */
  const qaCist = d => play([
    ['', `A dead mulberry over a dry cistern by the road. Someone has piled stones on the cistern's lid with care, the way you'd cover a well that children play near.|Над сухим хаузом у дороги стоит засохший тутовник. Кто-то старательно заложил крышку хауза камнями — так закрывают колодец, у которого играют дети.|Yo'l bo'yidagi quruq hovuz ustida qurigan tut. Kimdir hovuz qopqog'ini toshlar bilan ehtiyotlab bosib qo'yibdi — bolalar o'ynaydigan quduqni shunday yopishadi.`],
    () => (sado() ? ['sado', `Somebody covered it so nobody else would fall in. Or so nobody would look.|Кто-то закрыл его, чтобы больше никто не упал. Или чтобы никто не заглядывал.|Kimdir uni boshqa hech kim tushib ketmasin deb yopgan. Yoki hech kim qaramasin deb.`] : null)
  ], () => qaCistAsk(d, {}));
  const qaCistAsk = (d, tried) => ask(`The stones are heavy. The dark under them is cool.|Камни тяжёлые. Под ними прохладная темнота.|Toshlar og'ir. Ularning tagida salqin qorong'ilik.`, [
    FAC.craft('taste', `the stones of the cistern|камни хауза|hovuz toshlarini`, { id: 'taste' }),
    tried.climb ? null : FAC.chk('str', 5, `Shift the stones and climb down.|Сдвинуть камни и спуститься.|Toshlarni surib, pastga tushish.`, { id: 'climb' }),
    { id: 'rope', price: 15, label: `Pay a caravan boy for a rope and a lamp, and go down without hurrying.|Заплатить мальчишке-погонщику за верёвку и лампу и спуститься не спеша.|Karvon bolasiga arqon bilan chiroq uchun pul berib, shoshmasdan tushish.` }
  ], o => {
    const found = () => {
      setA('name');
      play([
        cl('alp', `Alp has put things in holes like this. Alp does not remember what. Alp would like to.|Алп тоже сбрасывал что-то в такие ямы. Алп не помнит что. Алп хотел бы помнить.|Alp ham shunaqa chuqurlarga nimadir tashlagan. Alp nimaligini eslamaydi. Eslashni xohlardi.`)
      ], () => { qaStep(`The boy was Shuhrat, son of Robiya, a laundress in the Tail. Three years ago he never came home from the Rabat road. His mother lives by the canal on Washers' Row.|Мальчика звали Шухрат, сын Робии, прачки из Хвоста. Три года назад он не вернулся с Рабатской дороги. Мать живёт у арыка, в ряду Прачек.|Bolaning ismi Shuhrat, Dumdagi kir yuvuvchi Robiyaning o'g'li. Uch yil oldin Rabot yo'lidan qaytmagan. Onasi Kirchilar qatorida, ariq bo'yida yashaydi.`); d(); });
    };
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `A woman's hands stitch a name onto a new waterskin, in red thread: BEKZOD. "So it comes back to me if you lose it. Robiya's boy, Washers' Row."|Женские руки вышивают на новом бурдюке имя красной ниткой: БЕКЗОД. «Чтобы вернулся ко мне, если потеряешь. Сын Робии, ряд Прачек».|Ayol qo'llari yangi meshga qizil ip bilan ism tikyapti: BEKZOD. «Yo'qotsang, menga qaytib kelsin. Robiyaning o'g'li, Kirchilar qatori».`],
        ['memory', `A boy filling skins at this cistern for the caravans, a copper a skin, singing badly. Hooves on the road. He turns to see what's funny.|Мальчишка наполняет у этого хауза бурдюки для караванов, по медяку за бурдюк, и фальшиво поёт. На дороге копыта. Он оборачивается посмотреть, что смешного.|Bola shu hovuzda karvonlar uchun mesh to'ldiryapti, meshiga bir mis tanga, noto'g'ri ohangda qo'shiq aytadi. Yo'lda tuyoqlar. Nima kulgili ekan deb o'giriladi.`]
      ], found, { intro: `You press your palm to the warm stones. They remember a boy who sat on them every day.|Прижимаешь ладонь к тёплым камням. Они помнят мальчишку, который сидел на них каждый день.|Kaftingni iliq toshlarga bosasan. Ular har kuni ustida o'tirgan bolani eslaydi.` });
      return;
    }
    if (o.id === 'climb' && !o.ok) {
      play([['', `The stones don't budge. Whoever piled them was stronger than you, or there were more of them.|Камни не поддаются. Тот, кто их наваливал, был сильнее тебя — или их было несколько.|Toshlar qimirlamaydi. Ularni uyib qo'ygan odam sendan kuchliroq bo'lgan — yoki ular bir necha kishi bo'lgan.`]], () => qaCistAsk(d, { climb: 1 }));
      return;
    }
    setA('arrow');
    play([
      ['', `At the bottom, in the dust: a small skeleton in a rotted shirt, and a waterskin with a name stitched in red thread. BEKZOD. "Robiya's boy, Washers' Row."|На дне, в пыли, маленький скелет в истлевшей рубахе и бурдюк с именем, вышитым красной ниткой. БЕКЗОД. «Сын Робии, ряд Прачек».|Tubida, chang ichida chirigan ko'ylakdagi kichkina skelet va qizil ip bilan ism tikilgan mesh. BEKZOD. «Robiyaning o'g'li, Kirchilar qatori».`],
      ['', `Between the ribs, an arrow. The fletching is blue and gold.|Между рёбер — стрела. Оперение синее с золотым.|Qovurg'alar orasida o'q. Pati ko'k va tilla rang.`]
    ], found);
  });
  FAC.prop('rabat', 'qa1_cist', { id: 'qa1cist', art: 'f6glint', dx: 18, prompt: `Look at the dry cistern|Осмотреть сухой хауз|Quruq hovuzni ko'zdan kechirish`, when: () => act('qa1') && A('road') && !A('name'), use: d => qaCist(d) });

  /* ---------------------------------------------------------------- 3 · the mother */
  const qaMother = d => play([
    ['', `Robiya wrings out a shirt that would be too small for anyone in the house. Beside the washing hangs a waterskin, new, never used.|Робия выжимает рубашку, которая мала любому в доме. Рядом с бельём висит бурдюк — новый, ни разу не надёванный.|Robiya uydagi hech kimga to'g'ri kelmaydigan kichkina ko'ylakni siqyapti. Kir yonida yangi, hali ishlatilmagan mesh osig'liq.`],
    ['qa_robiya', `Shuhrat? He's with a caravan. Kashgar, or past it. A man brought his wages, thirty tilla at once. A good caravan-bashi pays ahead.|Шухрат? Он с караваном. В Кашгар или дальше. Человек принёс его жалованье — тридцать тилла разом. Хороший караван-баши платит вперёд.|Shuhratmi? Karvon bilan ketgan. Qashg'argami, undan narigami. Bir odam uning haqini olib keldi — o'ttiz tilla, bir yo'la. Yaxshi karvonboshi oldindan to'laydi.`],
    ['qa_robiya', `He'd be sixteen now. Every spring I sew him a shirt, a size bigger. Why does a yodchi ask? He owes nothing. He was thirteen.|Ему сейчас шестнадцать. Каждую весну шью ему рубашку, на размер больше. А зачем ёдчи спрашивает? Он ничего не должен. Ему было тринадцать.|Hozir o'n oltiga kirgan. Har bahor unga bir o'lcham kattaroq ko'ylak tikaman. Yodchi nega so'rayapti? U hech kimdan qarz emas. O'n uch yoshda edi-ku.`],
    cl('surayyo', `She takes water from my channel every morning for that shirt. Every morning, three years. I never asked why.|Она каждое утро берёт воду из моего арыка ради этой рубашки. Каждое утро, три года. Я ни разу не спросила зачем.|U har tong o'sha ko'ylak uchun arig'imdan suv oladi. Har tong, uch yil. Bir marta ham nega deb so'ramadim.`)
  ], () => hub(`Robiya|Робия|Robiya`, [
    { label: `— Who brought the money?|— Кто принёс деньги?|— Pulni kim olib keldi?`, lines: [
      ['qa_robiya', `A man in a grey coat, a servant from up there. Clean boots. A little silver bird on his collar. He didn't even sit down.|Мужчина в сером кафтане, слуга из тех, что наверху. Сапоги чистые. На вороте серебряная птичка. Даже не присел.|Kulrang to'nli bir erkak, yuqoridagilarning xizmatkori. Etiklari toza. Yoqasida kumush qushcha. O'tirmadi ham.`]
    ] },
    { label: `— Has he ever sent word?|— Он хоть раз давал о себе знать?|— Biror marta xabar yubordimi?`, lines: [
      ['qa_robiya', `He can't write. I'd know his voice from the far end of the Bazaar. Every time a caravan comes in, I listen.|Писать он не умеет. Я его голос с другого конца Базара узнаю. Каждый раз, как приходит караван, слушаю.|U yozishni bilmaydi. Ovozini Bozorning narigi chetidan ham taniyman. Har safar karvon kelganda quloq solaman.`]
    ] }
  ], [
    { id: 'tell', label: `"Robiya-opa, he didn't go with any caravan."|«Робия-опа, ни с каким караваном он не ушёл.»|«Robiya opa, u hech qanday karvon bilan ketmagan.»` },
    { id: 'hide', label: `"I'm looking for the man who brought the money. That's all for now."|«Я ищу человека, который принёс деньги. Пока всё.»|«Pulni olib kelgan odamni qidiryapman. Hozircha shu.»` }
  ], o => {
    setA('mother'); setA('told', o.id === 'tell' ? 1 : 0);
    const L = o.id === 'tell' ? [
      ['', `She hears you out. Then she folds the small shirt very neatly and lays it on the pile with the others.|Она выслушивает тебя до конца. Потом очень аккуратно складывает маленькую рубашку и кладёт к остальным.|U seni oxirigacha eshitadi. Keyin kichkina ko'ylakni juda ehtiyotlab taxlab, boshqalarining ustiga qo'yadi.`],
      ['qa_robiya', `Who? ...When you know who, you come back and tell me who.|Кто? ...Узнаешь кто — придёшь и скажешь мне, кто.|Kim? ...Kimligini bilsang, kelib menga aytasan, kim.`]
    ] : [
      ['qa_robiya', `Then find him. And ask him why my son left without saying goodbye.|Тогда найди его. И спроси, почему сын со мной не попрощался.|Unda uni top. So'ra-chi, o'g'lim nega men bilan xayrlashmay ketdi.`]
    ];
    play(L, () => { qaStep(`Robiya still waits for Shuhrat's caravan. Three years ago a servant with a silver bird on his collar brought her thirty tilla, "his wages".|Робия всё ещё ждёт караван Шухрата. Три года назад слуга с серебряной птичкой на вороте принёс ей тридцать тилла — «его жалованье».|Robiya hali ham Shuhratning karvonini kutyapti. Uch yil oldin yoqasida kumush qushchasi bor bir xizmatkor unga o'ttiz tilla — «o'g'lining haqini» olib kelgan.`); d(); });
  }));

  /* ---------------------------------------------------------------- 4 · the Register of Bearers */
  const qaPage = d => {
    setA('page');
    play([
      ['', `Entry 114, in a careful hand: "Nurali, son of Rahim, groom. Carries one evening of Jahongir, son of Lochin-bek: the autumn hunt, the Rabat road."|Запись 114, аккуратным почерком: «Нурали, сын Рахима, конюх. Носит один вечер Жахонгира, сына Лочин-бека: осенняя охота, Рабатская дорога».|114-yozuv, chiroyli husnixat bilan: «Rahim o'g'li Nurali, otboqar. Lochinbek o'g'li Jahongirning bir oqshomini ko'taradi: kuzgi ov, Rabot yo'li».`],
      ['', `"Sung out by Mavlon, Keeper of the Cloister. Alms to the Cloister: six hundred tilla. To the bearer: two more a month."|«Выпел Мавлон, хранитель Обители. Пожертвование Обители: шестьсот тилла. Носильщику: на два больше в месяц».|«Xonaqoh saqlovchisi Mavlon kuylab chiqargan. Xonaqohga nazr: olti yuz tilla. Yukchiga: oyiga ikki tilla ustama».`],
      ['qa_anvar', `Jahongir-bek. The kind one. The only lord who says good morning to me.|Жахонгир-бек. Добрый. Единственный из беков, кто со мной здоровается.|Jahongirbek. O'sha mehribon. Beklardan menga salom beradigan yagona odam.`],
      () => (done('qc1') && br('qc1') === 'habiba' ? ['qa_anvar', `They say Mavlon-ota is Hollow now. Someone ought to strike his name out. Nobody will.|Говорят, Мавлон-ота теперь Пустой. Надо бы вычеркнуть его имя. Никто не вычеркнет.|Aytishlaricha, Mavlon ota endi Bo'sh. Ismini o'chirib qo'yish kerak edi. Hech kim o'chirmaydi.`] : null)
    ], () => { qaStep(`The register says it plainly: Nurali carries one evening of Jahongir-bek, heir of the House of Lochin. Mavlon, a Keeper of the Cloister, sang it out of him for six hundred tilla.|Реестр говорит прямо: Нурали носит один вечер Жахонгир-бека, наследника дома Лочин. Мавлон, хранитель Обители, выпел его за шестьсот тилла.|Daftar ochiq aytadi: Nurali Lochin xonadoni vorisi Jahongirbekning bir oqshomini ko'tarib yuribdi. Xonaqoh saqlovchisi Mavlon uni olti yuz tillaga kuylab chiqargan.`); d(); });
  };
  const qaRegister = d => play([
    ['', `A long cool room behind the treasury. Shelves of registers bound in falcon-grey, lion-red, humo-gold. Their keeper looks up with polite dread.|Длинная прохладная комната за казначейством. Полки с реестрами в переплётах цвета сокола, льва, золотого хумо. Хранитель поднимает глаза — вежливо и с ужасом.|G'aznaxona ortidagi uzun, salqin xona. Lochin kulrangi, sher qizili, humo tillasi rangidagi muqovali daftarlar. Ularning mirzasi boshini ko'taradi — xushmuomala, ammo qo'rquv bilan.`],
    ['qa_anvar', `The Register of Bearers is not a public document, yodchi. It's barely a document. Officially it doesn't exist, and I keep it.|Реестр носильщиков — не публичный документ, ёдчи. Он вообще едва ли документ. Официально его нет, а храню его я.|Yukchilar daftari ommaviy hujjat emas, yodchi. Uni hujjat deyish ham qiyin. Rasman u yo'q, uni esa men saqlayman.`]
  ], () => hub(`The Register of Bearers|Реестр носильщиков|Yukchilar daftari`, [
    { label: `— What's a bearer?|— Кто такие носильщики?|— Yukchi degani kim?`, lines: [
      ['qa_anvar', `A servant who carries what his master can't afford to remember. A lord swears before the Singers' court on a clean memory. So the memory goes for a little walk.|Слуга, который носит то, что хозяину помнить не по карману. Перед судом Певцов бек клянётся чистой памятью. Вот память и уходит немного погулять.|Xo'jayini eslab yurolmaydigan narsani ko'tarib yuradigan xizmatkor. Xonandalar sudida bek toza xotira bilan qasam ichadi. Shuning uchun xotira bir oz sayrga chiqib turadi.`],
      ['qa_anvar', `It's very old and perfectly legal. The first page is in the hand of one of the Seven.|Обычай очень старый и вполне законный. Первая страница написана рукой одного из Семи.|Bu juda eski va mutlaqo qonuniy odat. Birinchi sahifa Yettilikdan birining qo'li bilan yozilgan.`],
      cl('alp', `Alp had a man like that once. Or Alp was a man like that. ...Alp would like to see that book.|У Алпа был такой человек. Или Алп сам был таким. ...Алп хотел бы посмотреть эту книгу.|Alpning ham shunaqa odami bo'lgan. Yo Alpning o'zi shunaqa bo'lgan. ...Alp o'sha kitobni ko'rgisi keladi.`)
    ] },
    { label: `— Who reads it?|— Кто его читает?|— Uni kim o'qiydi?`, lines: [
      ['qa_anvar', `Nobody. That's the whole point. I dust it.|Никто. В этом весь смысл. Я с него пыль стираю.|Hech kim. Butun ma'nosi shunda. Men changini artaman.`]
    ] }
  ], qaRegOpts({}), o => qaRegPick(d, o)));
  const qaRegAsk = (d, tried) => ask(`The keeper's hand rests on the grey register.|Рука хранителя лежит на сером реестре.|Mirzaning qo'li kulrang daftar ustida turibdi.`, qaRegOpts(tried), o => qaRegPick(d, o));
  const qaRegOpts = tried => [
    { id: 'pay', price: 40, label: `Put forty tilla on the desk. "For the dust."|Положить на стол сорок тилла. «За пыль.»|Stolga qirq tilla qo'yish. «Chang uchun.»` },
    tried.law ? null : FAC.chk('collection', 3, `"The tithe law lets a yodchi read any book where a memory is written down as property. This is one. Open it."|«По закону о десятине ёдчи может читать любую книгу, где память записана как имущество. Это она. Открывай.»|«Ushr qonuniga ko'ra, yodchi xotira mulk deb yozilgan har qanday kitobni o'qiy oladi. Mana shu o'sha. Och.»`, { id: 'law' }, `Law|Закон|Qonun`),
    A('brand') ? { id: 'num', label: `"Entry one hundred and fourteen. One line, and I already know the number."|«Запись сто четырнадцать. Одна строчка, и номер я уже знаю.»|«Bir yuz o'n to'rtinchi yozuv. Bitta qator, raqamini esa bilaman.»` } : null,
    FAC.craft('taste', `the ink on the newest pages|чернила на последних страницах|oxirgi sahifalardagi siyohni`, { id: 'taste' })
  ];
  const qaRegPick = (d, o) => {
    if (o.id === 'law' && !o.ok) {
      play([['qa_anvar', `Article four says "book". This is a register. I'm sorry. I truly am. I'd love someone to read it.|В статье четвёртой сказано «книга». А это реестр. Простите. Правда простите. Я бы и сам рад, чтобы его кто-нибудь прочёл.|To'rtinchi moddada «kitob» deyilgan. Bu esa daftar. Kechirasiz. Chin dildan. O'zim ham kimdir o'qishini juda xohlardim.`]], () => qaRegAsk(d, { law: 1 }));
      return;
    }
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `This room, three autumns ago. A steward with a silver falcon on his collar dictates; the keeper writes. "Two more a month for the groom. He'll drink it, they always do."|Эта комната, три осени назад. Управляющий с серебряным соколом на вороте диктует, хранитель пишет. «Конюху два сверху в месяц. Пропьёт — они все пропивают».|Shu xona, uch kuz oldin. Yoqasida kumush lochini bor boshqaruvchi aytib turadi, mirza yozadi. «Otboqarga oyiga ikki tilla ustama. Ichib yuboradi — hammasi ichib yuboradi».`]
      ], () => play([['qa_anvar', `...You tasted my ink. Well. Then you've read it already, and I didn't show you anything. Here. Entry 114.|...Вы испили мои чернила. Что ж. Значит, вы уже прочли, а я ничего не показывал. Вот. Запись 114.|...Siyohimni totib ko'rdingiz. Mayli. Demak, allaqachon o'qidingiz, men hech narsa ko'rsatmadim. Mana. 114-yozuv.`]], () => qaPage(d)), { intro: `You touch the wet edge of the last page. Ink remembers the hand better than paper does.|Касаешься ещё влажного края последней страницы. Чернила помнят руку лучше бумаги.|Oxirgi sahifaning hali nam chetiga tegasan. Siyoh qo'lni qog'ozdan yaxshiroq eslaydi.` });
      return;
    }
    const L = { pay: `For the dust. Yes. It's very dusty. Entry 114, you said? I didn't say anything.|За пыль. Да. Пыли тут много. Запись 114, говорите? Я ничего не говорил.|Chang uchun. Ha. Chang ko'p bu yerda. 114-yozuv dedingizmi? Men hech narsa demadim.`, law: `...Property. Yes. Technically, that's exactly what it is. Nobody has ever said it out loud. Here.|...Имущество. Да. Строго говоря, так оно и есть. Только вслух этого никто не говорил. Вот.|...Mulk. Ha. Aslida xuddi shunday. Faqat buni hech kim ovoz chiqarib aytmagan. Mana.`, num: `If you already know the number, I'm not really showing you anything. I'm confirming. Confirming is allowed.|Раз номер вы уже знаете, я вам ничего не показываю. Я подтверждаю. Подтверждать можно.|Raqamni bilsangiz, men sizga hech narsa ko'rsatmayapman. Tasdiqlayapman, xolos. Tasdiqlash mumkin.` }[o.id];
    if (o.id === 'law') FAC.susp('divan', 1);
    play([['qa_anvar', L]], () => qaPage(d));
  };

  /* ---------------------------------------------------------------- 5 · the kind bek */
  const qaJahon = d => play([
    ['qa_jahon', `A yodchi in the Ark gardens. Here for someone's memory, or for the shade? Stay for the shade. The memories here aren't worth it.|Ёдчи в садах Арка. Ты за чьей-то памятью или в тень? Оставайся в тени. Здешняя память того не стоит.|Ark bog'larida yodchi. Birovning xotirasi uchun keldingmi yoki soyaga? Soyada o'tir. Bu yerning xotiralari bunga arzimaydi.`],
    ['qa_jahon', `I'm writing to the Divan. The Tail gives a third of its water in tithe. A third! I want it a fifth. They'll laugh, and then, I hope, they'll count.|Пишу в Диван. Хвост отдаёт в десятину треть своей воды. Треть! Хочу, чтобы была пятая часть. Посмеются, а потом, надеюсь, посчитают.|Devonga yozyapman. Dum o'z suvining uchdan birini ushrga beradi. Uchdan birini! Beshdan bir bo'lsin deyman. Kulishadi, keyin, umid qilamanki, hisoblab ko'rishadi.`]
  ], () => hub(`Jahongir-bek|Жахонгир-бек|Jahongirbek`, [
    { label: `— Do you hunt, bek?|— Охотишься, бек?|— Ovga chiqasizmi, bek?`, lines: [
      ['qa_jahon', `No. Horses frighten me. Stupid, isn't it? They say I used to ride. Something happened. A fall, probably. I don't remember.|Нет. Боюсь лошадей — глупо, правда? Говорят, раньше ездил. Что-то случилось. Упал, наверное. Не помню.|Yo'q. Otlardan qo'rqaman — kulgili-a? Aytishlaricha, ilgari minardim. Nimadir bo'lgan. Yiqilganman shekilli. Eslamayman.`],
      ['qa_jahon', `And I can't stand mulberries. The smell turns my stomach. Father says it's a lordly sort of fussiness.|И тутовник не выношу. От запаха мутит. Отец говорит, это барская привередливость.|Tutni ham ko'rgani ko'zim yo'q. Hididan ko'nglim ayniydi. Otam buni beklarcha injiqlik deydi.`],
      () => (sado() ? ['sado', `He smiles like someone apologising for something he can't name.|Он улыбается, как человек, который за что-то извиняется и не знает за что.|U nimadir uchun kechirim so'rayotgan-u, nima uchunligini bilmaydigan odamdek jilmayadi.`] : null)
    ] },
    { label: `— Why do you care about the Tail?|— Тебе-то что до Хвоста?|— Sizga Dumning nima keragi bor?`, lines: [
      ['qa_jahon', `I don't know. I go down there with bread and I feel... as if I owe something. Father says that's youth and it'll pass.|Сам не знаю. Спускаюсь туда с хлебом и чувствую... будто что-то должен. Отец говорит, это молодость, пройдёт.|O'zim ham bilmayman. U yerga non olib tushaman-u... nimadir qarzdordek bo'laman. Otam buni yoshlik deydi, o'tib ketadi deydi.`]
    ] },
    { label: `— Do you know a groom called Nurali?|— Знаешь конюха по имени Нурали?|— Nurali degan otboqarni bilasizmi?`, lines: [
      ['qa_jahon', `Nurali? The one who drinks? Father keeps him on out of pity. I've asked him to go easier on the man.|Нурали? Того, что пьёт? Отец держит его из жалости. Я просил отца быть с ним помягче.|Nuralimi? Ichadigan o'shami? Otam uni rahm qilib ushlab turibdi. Unga yumshoqroq bo'lishni otamdan so'raganman.`]
    ] }
  ], [
    { id: 'go', label: `"Good luck with the petition, bek."|«Удачи с петицией, бек.»|«Arizangizga omad, bek.»` }
  ], () => {
    setA('jahon');
    play([
      cl('alp', `Alp knows that face. Alp sees it in the water. A man who does good because something in him is hungry for it.|Алп знает это лицо. Видит его в воде. Человек делает добро, потому что что-то в нём по добру голодает.|Alp bu yuzni taniydi. Uni suvda ko'radi. Ichidagi nimadir yaxshilikka och bo'lgani uchun yaxshilik qiladigan odam.`),
      cl('nargiza', `He's nice. That's the worst part, isn't it? He's actually nice.|Он хороший. Это ведь самое паршивое, да? Он правда хороший.|U yaxshi odam. Eng yomoni shu-da, to'g'rimi? U rostdan ham yaxshi.`)
    ], () => { qaStep(`Jahongir-bek doesn't remember the hunt. He's afraid of horses, can't stand mulberries, and is petitioning the Divan to cut the Tail's water tithe.|Жахонгир-бек не помнит той охоты. Боится лошадей, не выносит тутовника и добивается, чтобы Диван снизил водную десятину Хвоста.|Jahongirbek o'sha ovni eslamaydi. Otdan qo'rqadi, tutni yoqtirmaydi va Devondan Dumning suv ushrini kamaytirishni so'rayapti.`); d(); });
  }));

  /* ---------------------------------------------------------------- 6 · what to do with the evening */
  const qaEnd = d => play([
    ['', `Nurali has sobered up for you. He's even shaved. It makes him look older.|Ради тебя Нурали протрезвел. Даже побрился. От этого он выглядит старше.|Nurali sen uchun hushyor bo'lib turibdi. Hatto soqolini olibdi. Shundan qariroq ko'rinadi.`],
    ['qa_qodir', `So. Whose is it?|Ну. Чья она?|Xo'sh. Kimniki ekan?`],
    ['hero', `Jahongir-bek's. A bet, three years ago. The boy's name was Shuhrat. His mother still sews him shirts.|Жахонгир-бека. Спор, три года назад. Мальчика звали Шухрат. Мать до сих пор шьёт ему рубашки.|Jahongirbekniki. Uch yil oldingi garov. Bolaning ismi Shuhrat edi. Onasi hali ham unga ko'ylak tikadi.`],
    ['qa_qodir', `The kind bek. ...Of course. Who else could afford to fold that into a groom.|Добрый бек. ...Ну конечно. Кому ещё по карману сложить такое в конюха.|Mehribon bek. ...Albatta-da. Buni otboqarga joylashga yana kimning puli yetardi.`],
    ['qa_qodir', `Take it out of me, yodchi. Where it goes after is yours to carry. I've carried it three years.|Вынь её из меня, ёдчи. Куда она потом — это уже тебе нести. Я три года нёс.|Uni mendan chiqarib ol, yodchi. Keyin qayerga ketishi — endi senga yuk. Men uch yil ko'tardim.`],
    cl('alp', `Give it back to the bek. A man should carry his own. Alp would want his own back. ...Alp thinks.|Верни беку. Человек должен нести своё. Алп хотел бы своё назад. ...Алп так думает.|Bekka qaytar. Odam o'z yukini o'zi ko'tarishi kerak. Alp o'zinikini qaytarib olishni xohlardi. ...Alp shunday o'ylaydi.`),
    cl('nargiza', `Sing it back into him and the petition dies with his good nature. A third of the Tail's water for one boy's truth. I'm not saying don't. I'm saying count.|Впоёшь это обратно — и петиция умрёт вместе с его добротой. Треть воды Хвоста за правду об одном мальчишке. Я не говорю «не надо». Я говорю: посчитай.|Buni unga qaytarib kuylasang, ariza uning mehribonligi bilan birga o'ladi. Dum suvining uchdan biri — bitta bola haqidagi haqiqat uchun. «Kerak emas» demayapman. «Hisobla» deyapman.`),
    cl('surayyo', `The mother has a right to know who. That's all I know. I'll fight for the water myself.|Мать вправе знать, кто. Больше я ничего не знаю. За воду я и сама повоюю.|Ona kimligini bilishga haqli. Bilganim shu. Suv uchun o'zim kurashaman.`)
  ], () => ask(`Three years of someone else's evening, waiting in a groom's head.|Три года чужого вечера ждут в голове у конюха.|Birovning uch yillik oqshomi otboqarning boshida kutib turibdi.`, [
    FAC.craft('plant', `the evening back into Jahongir-bek|тот вечер обратно в Жахонгир-бека|o'sha oqshomni Jahongirbekka qaytarib`, { id: 'return' }),
    FAC.craft('take', `it into wax and bring it to Robiya|его в воск и отнести Робии|uni mumga olib, Robiyaga eltish`, { id: 'mother' }),
    { id: 'keep', label: `"It stays where it is, Nurali. I'll see the House doubles your wages. The petition needs the bek the way he is."|«Пусть остаётся, где есть, Нурали. Я добьюсь, чтобы дом удвоил тебе жалованье. Петиции бек нужен таким, какой он сейчас.»|«Joyida qolsin, Nurali. Xonadon maoshingni ikki baravar qilishiga erishaman. Arizaga bek hozirgidek kerak.»` },
    FAC.craft('burn', `the evening, so nobody carries it any more|тот вечер, чтобы его больше никто не носил|o'sha oqshomni, toki uni boshqa hech kim ko'tarmasin`, { id: 'burn' })
  ], o => {
    const fin = (lines, text) => play(lines, () => { FAC.finish('qa1', o.id, text); d(); });
    if (o.id === 'return') {
      FAC.plant(`an evening given back|возвращённый вечер|qaytarilgan oqshom`); rep('divan', -2); rep('tail', 1); FAC.react({ alp: 15, nargiza: -5, surayyo: 10 }, 'qa1');
      fin([
        ['', `You bring Nurali to the fountain. You sing the evening out of one man and into the other. It goes easily, like water finding its old channel.|Ты приводишь Нурали к фонтану. Выпеваешь вечер из одного и вливаешь в другого. Идёт легко, как вода по старому арыку.|Nuralini favvora yoniga olib kelasan. Oqshomni biridan kuylab chiqarib, ikkinchisiga quyasan. Oson ketadi — eski arig'iga qaytgan suvdek.`],
        ['qa_jahon', `...The cistern. I put him in the cistern. Ibrohim held the lamp. I— I used to say good morning to his mother. I gave her bread.|...Хауз. Я сбросил его в хауз. Иброхим светил лампой. Я… я здоровался с его матерью. Я давал ей хлеб.|...Hovuz. Uni hovuzga tashladim. Ibrohim chiroq tutib turdi. Men… men uning onasiga salom berardim. Unga non berardim.`],
        ['', `Nurali falls asleep on the grass by the fountain in the middle of the day, like a child.|Нурали засыпает на траве у фонтана посреди дня, как ребёнок.|Nurali kunning qoq o'rtasida favvora yonidagi maysada boladek uxlab qoladi.`],
        () => (sado() ? ['sado', `He's crying the way people cry when they know nobody's going to forgive them.|Он плачет так, как плачут, когда знают, что прощения не будет.|U kechirim bo'lmasligini bilgan odamlar qanday yig'lasa, shunday yig'layapti.`] : null)
      ], `You sang Jahongir-bek's evening back into him. Nurali sleeps at night now. The kind bek remembers what he did.|Ты вернул Жахонгир-беку его вечер. Нурали теперь спит по ночам. Добрый бек помнит, что сделал.|Jahongirbekka oqshomini qaytarding. Nurali endi kechalari uxlaydi. Mehribon bek nima qilganini eslaydi.`);
    } else if (o.id === 'mother') {
      FAC.takeMem(`a lord's evening, in wax|вечер бека, в воске|bekning oqshomi, mumda`); rep('divan', -1); rep('tail', 1); FAC.react({ surayyo: 10, nargiza: 5, alp: -5 }, 'qa1');
      fin([
        ['', `The wax holds it badly: it's warm and it trembles. Robiya takes the tumar in both hands, like bread, and presses it to her lips before you can say a word.|Воск держит плохо: он тёплый и дрожит. Робия берёт тумар обеими руками, как хлеб, и прижимает к губам раньше, чем ты успеваешь что-то сказать.|Mum yomon ushlaydi: iliq va titraydi. Robiya tumarni non olgandek ikki qo'llab oladi va sen bir so'z aytishga ulgurmasingdan labiga bosadi.`],
        ['qa_robiya', `...He turned round. He heard them laughing and turned round to see what was funny.|...Он обернулся. Услышал, что смеются, и обернулся посмотреть, что смешного.|...U o'girildi. Kulishayotganini eshitib, nima kulgili ekan deb o'girildi.`],
        ['qa_robiya', `Go now, yodchi. What I do with it is my business. It's the only thing of his I have that isn't a shirt.|Иди, ёдчи. Что я с этим сделаю — моё дело. Кроме рубашек, у меня от него больше ничего нет.|Endi bor, yodchi. Buni nima qilishim — o'z ishim. Ko'ylaklardan boshqa undan menda hech narsa yo'q.`]
      ], `You took Jahongir-bek's evening out of Nurali and gave it to Robiya in wax. What a mother does with a tumar like that is her business.|Ты вынул вечер Жахонгир-бека из Нурали и отдал Робии в воске. Что мать сделает с таким тумаром — её дело.|Jahongirbekning oqshomini Nuralidan olib, Robiyaga mumda berding. Ona bunday tumar bilan nima qilishi — o'z ishi.`);
    } else if (o.id === 'keep') {
      rep('divan', 2); rep('tail', 1); FAC.react({ alp: -10, surayyo: -5, nargiza: 5 }, 'qa1');
      fin([
        ['qa_qodir', `Double wages. Two nightmares a night, I suppose.|Двойное жалованье. За два кошмара за ночь, видимо.|Ikki baravar maosh. Bir kechada ikkita dahshatli tush uchun bo'lsa kerak.`],
        ['qa_qodir', `...No. I heard you. The water. The Tail. Fine. Somebody has to carry it. Let it be somebody it can't break any further.|...Нет. Я слышал. Вода. Хвост. Ладно. Кто-то должен нести. Пусть несёт тот, кого дальше уже не сломать.|...Yo'q. Eshitdim. Suv. Dum. Mayli. Kimdir ko'tarishi kerak. Battar sindirib bo'lmaydigan odam ko'tarsin.`],
        ['', `That week the Divan reads the kind bek's petition. Somebody laughs. Then, slowly, they start to count.|На той неделе Диван читает петицию доброго бека. Кто-то смеётся. Потом, не спеша, начинают считать.|O'sha hafta Devon mehribon bekning arizasini o'qiydi. Kimdir kuladi. Keyin, sekin-asta, hisoblay boshlashadi.`]
      ], `You left the evening in Nurali. Jahongir-bek's petition went to the Divan, and the Tail may give less water. Nurali pays for it at night.|Ты оставил вечер в Нурали. Петиция Жахонгир-бека ушла в Диван, и Хвост, может быть, будет отдавать меньше воды. Нурали платит за это по ночам.|Oqshomni Nuralida qoldirding. Jahongirbekning arizasi Devonga ketdi, Dum kamroq suv berishi mumkin. Buning haqini Nurali kechalari to'laydi.`);
    } else {
      addVoid(3, `an evening nobody will carry|вечер, который никто не понесёт|hech kim ko'tarmaydigan oqshom`); FAC.react({ nargiza: -10, alp: -5, surayyo: -10 }, 'qa1');
      fin([
        ['', `The evening flares up in your hands: the road, the laughter, the bowstring, the turning head. Then it's gone. Now only you know how Shuhrat died, and you only know it second-hand.|Вечер вспыхивает у тебя в руках: дорога, хохот, тетива, обернувшаяся голова. Потом его нет. Теперь только ты знаешь, как умер Шухрат, — и знаешь с чужих слов.|Oqshom qo'lingda lov etib yonadi: yo'l, qahqaha, kamon ipi, o'girilgan bosh. Keyin u yo'q. Endi Shuhrat qanday o'lganini faqat sen bilasan — u ham eshitganingcha.`],
        ['qa_qodir', `It's quiet. ...Was I married? There's a woman's shawl in my room and I don't know whose it is.|Тихо. ...Я был женат? У меня в каморке женский платок, и я не знаю чей.|Jimjit. ...Uylanganmidim? Hujramda ayol ro'moli bor, kimniki ekanini bilmayman.`],
        () => (sado() ? ['sado', `Nobody carries it now. Not the bek, not the groom. Just you, and you only heard it.|Теперь его никто не носит. Ни бек, ни конюх. Только ты, да и то понаслышке.|Endi uni hech kim ko'tarmaydi. Na bek, na otboqar. Faqat sen, u ham bo'lsa eshitganingcha.`] : null)
      ], `You burned the evening. Nurali is free of it, the bek stays kind, and Robiya keeps waiting for a caravan.|Ты сжёг тот вечер. Нурали от него свободен, бек остаётся добрым, а Робия ждёт караван.|O'sha oqshomni yoqib yubording. Nurali undan qutuldi, bek mehribonligicha qoldi, Robiya esa karvonni kutyapti.`);
    }
  }));

  /* ---------------------------------------------------------------- who says what, and later */
  FAC.talk.qa_qodir = d => {
    const s = q('qa1').st;
    if (s === 'none') { qaOffer(d); return; }
    if (act('qa1')) {
      if (!A('road')) { qaDream(d); return; }
      if (qaAll()) { qaEnd(d); return; }
      play([['qa_qodir', `Did you find the road? I dreamed it again. The boy hums when he fills the skins. I never noticed that before.|Нашёл дорогу? Мне опять снилось. Мальчишка напевает, когда наполняет бурдюки. Раньше я этого не замечал.|Yo'lni topdingmi? Yana tushimga kirdi. Bola meshlarni to'ldirayotganda xirgoyi qiladi. Ilgari buni sezmagan ekanman.`]], d);
      return;
    }
    const b = br('qa1'), n = since('qa1');
    const L = {
      return: `"I sleep. I dream about horses. Just horses." He seems almost embarrassed by it.|«Сплю. Снятся лошади. Просто лошади». Кажется, ему за это почти неловко.|«Uxlayapman. Tushimga otlar kiradi. Shunchaki otlar». Bundan biroz xijolat bo'layotganga o'xshaydi.`,
      mother: `"Robiya came to the stables. Looked at me a long time. Then she said: not you." He doesn't know what to do with his hands.|«Робия приходила к конюшням. Долго на меня смотрела. Потом сказала: не ты». Он не знает, куда деть руки.|«Robiya otxonaga keldi. Menga uzoq qaradi. Keyin: sen emas, dedi». U qo'llarini qayerga qo'yishni bilmaydi.`,
      keep: n >= 2 ? `Nurali sits by the dry cistern on the Rabat road with a lit lamp, at noon. "I'm keeping him company. Somebody should. He's thirteen."|Нурали сидит у сухого хауза на Рабатской дороге с зажжённой лампой, посреди дня. «Составляю ему компанию. Кто-то же должен. Ему тринадцать».|Nurali peshin payti Rabot yo'lidagi quruq hovuz yonida yoqilgan chiroq bilan o'tiribdi. «Unga hamroh bo'lib turibman. Kimdir bo'lishi kerak-ku. U o'n uch yoshda».` : `"The double wages came. I bought a lamp, so I don't wake up in the dark."|«Двойное жалованье пришло. Купил лампу, чтобы не просыпаться в темноте».|«Ikki baravar maosh keldi. Qorong'ida uyg'onmay deb chiroq sotib oldim».`,
      burn: `"There's a shawl in my room. I asked around. Nobody knows. I keep it folded, just in case."|«У меня в каморке платок. Я спрашивал. Никто не знает. Держу его сложенным — на всякий случай».|«Hujramda ro'mol bor. So'rab chiqdim. Hech kim bilmaydi. Har ehtimolga qarshi taxlab qo'yganman».`
    }[b];
    play([['', L || `…|…|…`]], d);
  };
  FAC.talk.qa_jahon = d => {
    if (act('qa1') && A('page') && !A('jahon')) { qaJahon(d); return; }
    if (!done('qa1')) { play([['qa_jahon', `A third of the water, yodchi. Who decided a third? Nobody remembers. That's the trouble with this city.|Треть воды, ёдчи. Кто решил, что треть? Никто не помнит. Вот беда этого города.|Suvning uchdan biri, yodchi. Kim uchdan bir deb hal qilgan? Hech kim eslamaydi. Bu shaharning dardi shu.`]], d); return; }
    const L = {
      return: [['', `Jahongir-bek carries two buckets from the canal to Robiya's door, as he does every morning. She has never thanked him, and he has never asked her to.|Жахонгир-бек несёт от арыка к двери Робии два ведра — как каждое утро. Она ни разу его не поблагодарила, и он ни разу этого не попросил.|Jahongirbek har tongdagidek ariqdan Robiyaning eshigigacha ikki chelak suv tashiydi. U bir marta ham rahmat demagan, bek ham bir marta ham so'ramagan.`], ['qa_jahon', `The Divan struck out my name. Father did too, in his way. The petition went with me. The Tail still pays a third. That's mine as well.|Диван вычеркнул моё имя. Отец тоже, по-своему. Петиция ушла вместе со мной. Хвост по-прежнему платит треть. Это тоже на мне.|Devon ismimni o'chirib tashladi. Otam ham, o'zicha. Ariza ham men bilan ketdi. Dum hamon uchdan birini to'laydi. Bu ham mening bo'ynimda.`]],
      mother: [['qa_jahon', `A woman from the Tail stood outside our gate all day yesterday. Father had her sent off. She looked at me as if... no. I don't know her.|Вчера у наших ворот весь день стояла женщина из Хвоста. Отец велел её прогнать. Она смотрела на меня так, будто… нет. Я её не знаю.|Kecha darvozamiz oldida kun bo'yi Dumdan kelgan bir ayol turdi. Otam haydab yuborishni buyurdi. U menga xuddi… yo'q. Men uni tanimayman.`]],
      keep: [['qa_jahon', `They counted! A quarter, not a fifth, but they counted. From the new moon the Tail gives a quarter.|Посчитали! Не пятую часть, а четверть, но посчитали. С новолуния Хвост отдаёт четверть.|Hisoblashdi! Beshdan bir emas, to'rtdan bir, lekin hisoblashdi. Yangi oydan Dum to'rtdan birini beradi.`], ['', `He's radiant.|Он сияет.|U yashnab ketgan.`]],
      burn: [['qa_jahon', `Strange: mulberries don't turn my stomach any more. I even ate some yesterday. Sweet.|Странно: от тутовника больше не мутит. Вчера даже поел. Сладкий.|Qiziq: tut endi ko'nglimni aynitmaydi. Kecha hatto yedim. Shirin ekan.`]]
    }[br('qa1')];
    play(L || [], d);
  };
  FAC.talk.qa_robiya = d => {
    if (act('qa1') && A('name') && !A('mother')) { qaMother(d); return; }
    if (act('qa1') && A('mother')) { play([['qa_robiya', A('told') ? `Who, yodchi? You said you'd come back and tell me who.|Кто, ёдчи? Ты обещал прийти и сказать мне, кто.|Kim, yodchi? Kelib kimligini aytaman, degan eding.` : `Did you find the man with the bird on his collar?|Нашёл того, с птичкой на вороте?|Yoqasida qushchasi bor o'sha odamni topdingmi?`]], d); return; }
    if (!done('qa1')) { play([['', FAC.NPC.qa_robiya.def.idle]], d); return; }
    const b = br('qa1');
    if (b === 'mother') {
      play([['', since('qa1') >= 1 ? `Robiya, in a good dress, in the Ark gardens. "The House of Lochin bought it back. A house with a garden, and the bek's father on his knees. I tasted it once more first." She doesn't look sorry. She doesn't look happy.|Робия в хорошем платье, в садах Арка. «Дом Лочин выкупил его. Дом с садом — и отец бека на коленях. Перед этим я испила его ещё раз». Ей не жаль. И она не рада.|Robiya chiroyli ko'ylakda, Ark bog'larida. «Lochin xonadoni uni sotib oldi. Bog'li uy — va bekning otasi tiz cho'kib. Undan oldin yana bir marta totib ko'rdim». Afsuslanmayapti. Xursand ham emas.` : `Robiya holds the tumar against her chest and says nothing at all.|Робия прижимает тумар к груди и не говорит ни слова.|Robiya tumarni ko'ksiga bosib turibdi, bir og'iz ham gapirmaydi.`]], d);
      return;
    }
    play([['', b === 'return' ? `"He brings water. I let him. I don't drink it."|«Он носит воду. Я не мешаю. Но не пью».|«U suv tashiydi. Qo'yib beraman. Lekin ichmayman».` : `Robiya hangs a new shirt out to dry, one size bigger.|Робия вешает сушиться новую рубашку — на размер больше.|Robiya yangi ko'ylakni quritishga osadi — bir o'lcham kattaroq.`]], d);
  };
  FAC.talk.qa_anvar = d => {
    if (act('qa1') && !A('page')) { qaRegister(d); return; }
    if (done('qa1') && br('qa1') === 'keep') { play([['qa_anvar', `Entry 114: "wages to the bearer doubled". In my hand. Nobody asked me why, and I didn't ask either.|Запись 114: «носильщику жалованье удвоено». Моей рукой. Никто не спросил почему, и я не спрашивал.|114-yozuv: «yukchining maoshi ikki baravar oshirildi». O'z qo'lim bilan. Hech kim nega deb so'ramadi, men ham so'ramadim.`]], d); return; }
    play([['qa_anvar', done('qa1') ? `Entry 114 has a line through it now. In my hand. I don't know what came over me.|Запись 114 теперь перечёркнута. Моей рукой. Не знаю, что на меня нашло.|114-yozuv endi o'chirilgan. O'z qo'lim bilan. Menga nima bo'lganini bilmayman.` : `Officially, you were never here. Unofficially, please don't come back.|Официально вас здесь не было. Неофициально — пожалуйста, не приходите больше.|Rasman siz bu yerda bo'lmagansiz. Norasmiy — iltimos, boshqa kelmang.`]], d);
  };

  SIDE.epi('qa1', () => (!done('qa1') ? null : {
    return: `Jahongir of the House of Lochin carried water to a laundress in the Tail for the rest of his life. The petition was never sent again. Nobody in the Tail calls him kind any more; some call him honest.|Жахонгир из дома Лочин до конца жизни носил воду прачке в Хвосте. Петицию больше никто не подавал. Добрым его в Хвосте больше не зовут; кое-кто зовёт честным.|Lochin xonadonidan Jahongir umrining oxirigacha Dumdagi kir yuvuvchi ayolga suv tashidi. Arizani boshqa hech kim bermadi. Dumda uni endi mehribon demaydi; ba'zilar halol deydi.`,
    mother: `Robiya lived out her days in a house with a garden in the lower Ark, bought with a tumar. She planted no mulberries. Every spring she still sewed a shirt, a size bigger, and gave it to some boy from the Tail.|Робия дожила свой век в доме с садом в нижнем Арке, купленном за тумар. Тутовника она не сажала. Каждую весну по-прежнему шила рубашку на размер больше и отдавала какому-нибудь мальчишке из Хвоста.|Robiya umrini tumar evaziga olingan, pastki Arkdagi bog'li uyda o'tkazdi. Tut ekmadi. Har bahor baribir bir o'lcham kattaroq ko'ylak tikib, Dumdagi biror bolaga berardi.`,
    keep: `Thanks to the kind bek, the Tail gave a quarter of its water instead of a third. Nurali the groom carried the bek's evening until he died, by a dry cistern on the Rabat road, holding a lamp.|Благодаря доброму беку Хвост отдавал не треть воды, а четверть. Конюх Нурали носил вечер бека до самой смерти — у сухого хауза на Рабатской дороге, с лампой в руках.|Mehribon bek tufayli Dum suvining uchdan birini emas, to'rtdan birini berdi. Otboqar Nurali bekning oqshomini o'limigacha ko'tarib yurdi — Rabot yo'lidagi quruq hovuz yonida, qo'lida chiroq bilan.`,
    burn: `Nobody ever learned how Shuhrat died. Jahongir-bek grew old, kind and fond of mulberries. Robiya waited for the caravans until she could no longer hear them.|Как умер Шухрат, так никто и не узнал. Жахонгир-бек состарился добрым и полюбил тутовник. Робия ждала караваны, пока не перестала их слышать.|Shuhrat qanday o'lganini hech kim bilmadi. Jahongirbek mehribonligicha qaridi va tutni yaxshi ko'rib qoldi. Robiya karvonlarni ovozini eshitmay qolguncha kutdi.`
  }[br('qa1')] || null), 'city:chain');

  /* ================================================================================================ qc1 · THE LIGHT TITHE */
  CAST.qc_lola = { name: `Lola, a novice|Послушница Лола|Shogird qiz Lola`, portrait: null };
  CAST.qc_ismat = { name: `Sattor the weigher|Весовщик Саттор|Tarozibon Sattor`, portrait: null };
  CAST.qc_mavlon = { name: `Mavlon-ota, Keeper of the light tithe|Мавлон-ота, хранитель лёгкой десятины|Yengil ushr saqlovchisi Mavlon ota`, portrait: null };
  const LKC = {
    lola: { body: 'woman', robe: '#e8e8f0', trim: '#8aa8d8', skin: '#c8a080', head: 'scarf', headC: '#dcdce8', scale: 0.92 },
    lolaPlain: { body: 'woman', robe: '#8a6a5a', trim: '#c8a890', skin: '#c8a080', head: 'scarf', headC: '#a8323a', scale: 0.92 },
    ismat: { body: 'man', robe: '#6a5a3a', trim: '#c8a84a', skin: '#b88a64', head: 'turban', headC: '#d8ccb0', beard: 'short', sash: '#3a2a1a' },
    mavlon: { body: 'old', robe: '#d8d8e4', trim: '#3a6ab0', skin: '#b89070', head: 'turban', headC: '#e8e8f0', beard: 'long' }
  };
  SIDE.quest('qc1', { n: 23, title: `The Light Tithe|Лёгкая десятина|Yengil ushr`, where: ['cloister', 'qc1_cell'] });
  FAC.spot('cloister', 'qc1_niche', 0.32);
  FAC.spot('cloister', 'qc1_cell', 0.72);
  FAC.spot('cloister', 'qc1_keep', 0.9);
  FAC.spot('bazaar', 'qc1_scales', 0.57);
  FAC.spot('tower', 'qc1_shelf', 0.55);
  const C = k => sf('qc1_' + k);
  const setC = (k, v) => sf('qc1_' + k, v === undefined ? 1 : v);

  FAC.npc('qc_lola', { name: CAST.qc_lola.name, look: LKC.lola, dx: -8, prompt: `Talk to the novice|Поговорить с послушницей|Shogird qiz bilan gaplashish`, idle: `A novice scrubs the same step of the stair for the third time. Her knuckles are raw.|Послушница в третий раз оттирает одну и ту же ступеньку. Костяшки содраны.|Shogird qiz bitta pog'onani uchinchi marta ishqalayapti. Bo'g'imlari shilingan.` },
    () => (done('qc1') && br('qc1') === 'remember' ? [{ from: 8, to: 19, region: 'bazaar', spot: 'qc1_scales' }] : [{ from: 6, to: 22, region: 'cloister', spot: 'qc1_cell' }]));
  FAC.npc('qc_ismat', { name: CAST.qc_ismat.name, look: LKC.ismat, dx: 14, prompt: `Talk to the weigher|Поговорить с весовщиком|Tarozibon bilan gaplashish`, idle: `The weigher balances a tumar against two lead fish, very carefully.|Весовщик очень осторожно уравновешивает тумар двумя свинцовыми рыбками.|Tarozibon tumarni ikki qo'rg'oshin baliqcha bilan juda ehtiyotlab tenglashtiryapti.` },
    () => [{ from: 7, to: 20, region: 'bazaar', spot: 'qc1_scales' }]);
  FAC.npc('qc_mavlon', { name: CAST.qc_mavlon.name, look: LKC.mavlon, dx: 0, prompt: `Talk to the old Keeper|Поговорить со старым хранителем|Keksa saqlovchi bilan gaplashish`, idle: `An old Keeper mends a basket with white thread, humming something that isn't in any hymnal.|Старый хранитель штопает корзину белой ниткой и напевает что-то, чего нет ни в одном песеннике.|Keksa saqlovchi oq ip bilan savat yamayapti va hech qaysi qo'shiq kitobida yo'q nimanidir xirgoyi qilyapti.` },
    () => (done('qc1') && br('qc1') === 'remember' ? [] : [{ from: 6, to: 23, region: 'cloister', spot: 'qc1_keep' }]));
  // after "remember" the novice is a novice no more
  s6init(() => { try { const n = G.WORLD2.npcs.qc_lola; if (n) Object.defineProperty(n, 'look', { configurable: true, get() { return done('qc1') && br('qc1') === 'remember' ? LKC.lolaPlain : LKC.lola; }, set() { } }); } catch (e) { /* ignore */ } });

  /* ---------------------------------------------------------------- 1 · the novice */
  const qcOffer = d => play([
    ['', `A novice is scrubbing the same step of the Cloister's stair for the third time. Her knuckles are raw. She stops when she sees your coat.|Послушница в третий раз оттирает одну и ту же ступеньку на лестнице Обители. Костяшки содраны. Увидев твой кафтан, она замирает.|Shogird qiz xonaqoh zinasining bitta pog'onasini uchinchi marta ishqalayapti. Bo'g'imlari shilingan. To'ningni ko'rib, qotib qoladi.`],
    ['qc_lola', `You're a yodchi. Not one of ours. Good. I need somebody who isn't one of ours.|Ты ёдчи. Не из наших. Хорошо. Мне нужен кто-то не из наших.|Sen yodchisan. Bizdan emassan. Yaxshi. Menga bizdan bo'lmagan odam kerak.`],
    ['qc_lola', `Before I took the white I gave the light tithe. Everyone does. You give the Cloister one thing you're ashamed of, it goes to the Well, you forget it. It counts toward your tithe.|Прежде чем надеть белое, я отдала лёгкую десятину. Так все делают. Отдаёшь Обители одно, чего стыдишься, оно уходит в Колодец, ты забываешь. И это засчитывают в десятину.|Oq kiyishdan oldin yengil ushrni berganman. Hamma shunday qiladi. Xonaqohga uyaladigan bitta narsangni berasan, u Quduqqa ketadi, sen unutasan. Ushringga hisoblanadi.`],
    ['qc_lola', `I don't know what I gave. That's how it's meant to be. But last week somebody sent my father a note, and the note knows.|Я не знаю, что отдала. Так и должно быть. Но на прошлой неделе отцу пришла записка, и записка это знает.|Nima berganimni bilmayman. Shunday bo'lishi kerak. Lekin o'tgan hafta otamga xat keldi, xat esa buni biladi.`],
    cl('nargiza', `The light tithe goes straight down. I carried the basket myself. ...Once. Then they said I wasn't needed.|Лёгкая десятина идёт прямо вниз. Я сама носила корзину. ...Один раз. Потом сказали, что я не нужна.|Yengil ushr to'g'ri pastga ketadi. Savatni o'zim ko'targanman. ...Bir marta. Keyin kerak emassan, deyishdi.`)
  ], () => hub(`Lola|Лола|Lola`, [
    { label: `— What does the note say?|— Что в записке?|— Xatda nima deyilgan?`, lines: [
      ['qc_lola', `I didn't see it. Father came up to the gate white as a wall and asked who else knew. Knew what, I said. He went away.|Я её не видела. Отец пришёл к воротам белый как стена и спросил, кто ещё знал. Знал что, говорю. Он ушёл.|Ko'rmadim. Otam darvozaga devordek oqarib keldi va yana kim bilardi, deb so'radi. Nimani, deyman. U ketib qoldi.`]
    ] },
    { label: `— Why not tell the Keepers?|— Почему не сказать хранителям?|— Nega saqlovchilarga aytmaysan?`, lines: [
      ['qc_lola', `Because only the Keepers touch the light tithe. Either the Well gave it back, or one of them never gave it to the Well.|Потому что к лёгкой десятине прикасаются только хранители. Либо Колодец её вернул, либо кто-то из них Колодцу её не отдал.|Chunki yengil ushrga faqat saqlovchilar tegadi. Yo Quduq uni qaytarib bergan, yo ulardan biri uni Quduqqa bermagan.`]
    ] },
    { label: `— Who's your father?|— Кто твой отец?|— Otang kim?`, lines: [
      ['qc_lola', `Sattor. He weighs memories on the Bazaar for the Divan's buyers. An honest man. Everybody says so.|Саттор. Взвешивает память на Базаре для скупщиков Дивана. Честный человек. Все так говорят.|Sattor. Bozorda Devon xaridorlari uchun xotira tortadi. Halol odam. Hamma shunday deydi.`]
    ] }
  ], [
    { id: 'yes', label: `"I'll talk to your father."|«Поговорю с твоим отцом.»|«Otang bilan gaplashaman.»` },
    { id: 'no', label: `"Whatever you gave, it's better off where it is."|«Что бы ты ни отдала, там ему и место.»|«Nima bergan bo'lsang ham, o'sha joyida qolgani yaxshi.»` }
  ], o => {
    if (o.id !== 'yes') { play([['qc_lola', `Maybe. Then why is it at my father's door?|Может быть. Тогда почему оно у двери моего отца?|Balki. Unda nega u otamning eshigi oldida turibdi?`]], d); return; }
    FAC.begin('qc1', `Lola, a novice, gave the "light tithe": one shameful memory, meant for the Well. Now a note sent to her father knows what it was. Find Sattor the weigher at the Bazaar.|Послушница Лола отдала «лёгкую десятину» — одно постыдное воспоминание, которое должно уйти в Колодец. Теперь записка её отцу знает, что это было. Найти весовщика Саттора на Базаре.|Shogird qiz Lola «yengil ushr» — Quduqqa ketishi kerak bo'lgan bitta uyatli xotirani bergan. Endi otasiga kelgan xat buning nimaligini biladi. Bozordan tarozibon Sattorni topish kerak.`, ['bazaar', 'qc1_scales']);
    d();
  }));

  /* ---------------------------------------------------------------- 2 · the weigher */
  const qcSattor = d => play([
    ['', `Brass scales on a velvet cloth: tumars in one pan, little lead fish in the other. Sattor's hands are very steady. His eyes are not.|Медные весы на бархатной скатерти: в одной чаше тумары, в другой свинцовые рыбки. Руки у Саттора очень твёрдые. Глаза — нет.|Baxmal dasturxonda mis tarozi: bir pallada tumarlar, ikkinchisida qo'rg'oshin baliqchalar. Sattorning qo'llari juda qat'iy. Ko'zlari esa unday emas.`],
    ['qc_ismat', `Lola sent you. Of course she did. She always did think a stranger would mend things better than her father.|Тебя Лола прислала. Ну конечно. Она всегда думала, что чужой всё исправит лучше отца.|Seni Lola yubordi. Albatta-da. U doim begona odam otasidan yaxshiroq tuzatadi deb o'ylagan.`]
  ], () => hub(`Sattor|Саттор|Sattor`, [
    { label: `— Show me the note.|— Покажи записку.|— Xatni ko'rsat.`, lines: [
      ['', `Cheap paper, blue ink. "The scales remember the widow Hosiyat. Forty tilla in the Cloister's alms box every new moon, or the Divan's weights office learns how you weigh grief."|Дешёвая бумага, синие чернила. «Весы помнят вдову Хосият. Сорок тилла в ящик для подаяний Обители каждое новолуние — или палата мер Дивана узнает, как ты взвешиваешь горе».|Arzon qog'oz, ko'k siyoh. «Tarozi beva Hosiyatni eslaydi. Har yangi oyda xonaqoh nazr qutisiga qirq tilla — bo'lmasa, Devonning o'lchov mahkamasi qayg'uni qanday tortishingni biladi».`]
    ] },
    { label: `— What happened with the widow?|— Что было со вдовой?|— Beva bilan nima bo'lgan?`, lines: [
      ['qc_ismat', `Grief weighs heavy. Heavy pays well. Her husband's death weighed four fish. I wrote down three. Lola was eleven, under the table. She saw my thumb.|Горе тяжёлое. Тяжёлое хорошо платится. Смерть её мужа потянула на четыре рыбки. Я записал три. Лоле было одиннадцать, сидела под столом. Видела мой палец.|Qayg'u og'ir bo'ladi. Og'ir narsa yaxshi to'lanadi. Erining o'limi to'rtta baliqcha tortdi. Men uchta deb yozdim. Lola o'n bir yoshda edi, stol tagida o'tirgandi. Barmog'imni ko'rdi.`],
      ['qc_ismat', `The difference paid for her place in the Cloister. Don't look at me like that. A girl from the Bazaar doesn't get the white for nothing.|На разницу я купил ей место в Обители. Не смотри так. Девочке с Базара белое даром не дают.|Farqiga unga xonaqohdan joy olib berdim. Bunday qarama. Bozorlik qizga oq kiyimni tekinga berishmaydi.`],
      cl('surayyo', `Hosiyat from Copper Lane? She scrubs pots for half the Tail now. Four fish, three fish. Lovely.|Хосият с Медного переулка? Она теперь котлы драит половине Хвоста. Четыре рыбки, три рыбки. Красота.|Mis ko'chadagi Hosiyatmi? U hozir Dumning yarmiga qozon yuvadi. To'rtta baliqcha, uchta baliqcha. Juda chiroyli.`)
    ] }
  ], qcNoteOpts({}), o => qcNotePick(d, o)));
  const qcNote = (d, tried) => ask(`The note lies on the velvet between the scales.|Записка лежит на бархате между чашами.|Xat baxmal ustida, pallalar orasida yotibdi.`, qcNoteOpts(tried || {}), o => qcNotePick(d, o));
  const qcNoteOpts = tried => [
      FAC.craft('taste', `the ink on the note|чернила записки|xatdagi siyohni`, { id: 'taste' }),
      tried.ink ? null : FAC.chk('mem', 4, `Look at the ink, not the words.|Смотреть на чернила, а не на слова.|So'zlarga emas, siyohga qarash.`, { id: 'ink' }, `Notice|Заметить|Payqash`),
      { id: 'box', label: `"Who empties the alms box?"|«Кто вынимает деньги из ящика для подаяний?»|«Nazr qutisini kim bo'shatadi?»` }
  ];
  const qcNotePick = (d, o) => {
      if (o.id === 'ink' && !o.ok) { play([['', `Blue ink. Paper. Words. Nothing more you can see.|Синие чернила. Бумага. Слова. Больше ничего не разглядеть.|Ko'k siyoh. Qog'oz. So'zlar. Boshqa hech narsa ko'rinmaydi.`]], () => qcNote(d, { ink: 1 })); return; }
      const after = () => {
        setC('note');
        play([['qc_ismat', `If you find him, make him forget me. I'll pay. ...I'd pay more to make Lola forget, but she already has.|Найдёшь его — сделай так, чтобы он меня забыл. Заплачу. ...Я бы больше заплатил, чтобы Лола забыла, да она уже забыла.|Uni topsang, meni unuttirib qo'y. To'layman. ...Lola unutsin deb ko'proq to'lardim, lekin u allaqachon unutgan.`]], () => {
          FAC.stepTo('qc1', `Sattor cheated a widow on the memory scales; Lola saw it as a child and gave that memory as her light tithe. The note came from the Cloister. Find out where the light tithe basket really goes.|Саттор обвесил вдову на весах памяти; Лола ребёнком это видела и отдала это воспоминание в лёгкую десятину. Записка пришла из Обители. Узнать, куда на самом деле уносят корзину лёгкой десятины.|Sattor xotira tarozisida bevani aldagan; Lola buni bolaligida ko'rib, o'sha xotirani yengil ushrga bergan. Xat xonaqohdan kelgan. Yengil ushr savati aslida qayerga ketishini bilish kerak.`, ['cloister', 'qc1_niche']);
          d();
        });
      };
      if (o.id === 'taste') {
        FAC.taste([
          ['memory', `An old hand writing by a candle. Behind it, shelves of tumars in a stone cell, a little tag on each. Outside, wind, and the dry flapping of big wings.|Старая рука пишет при свече. За ней полки с тумарами в каменной келье, на каждом бирочка. Снаружи ветер и сухое хлопанье больших крыльев.|Qari qo'l sham yorug'ida yozyapti. Orqasida tosh hujrada tumarlar terilgan tokchalar, har birida yorliqcha. Tashqarida shamol va katta qanotlarning quruq shapillashi.`]
        ], () => { setC('wings'); after(); }, { intro: `You lift the note to your lips. Paper keeps little; ink keeps the hand.|Подносишь записку к губам. Бумага хранит мало, чернила хранят руку.|Xatni labingga yaqinlashtirasan. Qog'oz kam narsa saqlaydi, siyoh esa qo'lni saqlaydi.` });
      } else if (o.id === 'ink') {
        setC('ink');
        play([['hero', `Lapis blue. The Cloister mixes ink like this for one thing only: the tags on the tumars it keeps.|Лазурит. Обитель мешает такие чернила только для одного — для бирок на тумарах, которые хранит.|Lojuvard. Xonaqoh bunday siyohni faqat bitta narsa uchun qoradi — o'zi saqlaydigan tumarlarning yorliqlari uchun.`]], after);
      } else {
        play([['qc_ismat', `An old Keeper. Mavlon-ota. Every evening, together with the light tithe basket, regular as a bell.|Старый хранитель. Мавлон-ота. Каждый вечер, вместе с корзиной лёгкой десятины, как по колоколу.|Keksa saqlovchi. Mavlon ota. Har kech yengil ushr savati bilan birga, qo'ng'iroqdek aniq.`]], after);
      }
  };

  /* ---------------------------------------------------------------- 3 · the niche by the gate */
  const qcNiche = (d, tried) => {
    tried = tried || {};
    const first = !tried.seen;
    play(first ? [
      ['', `A niche by the Cloister's gate: a basket lined with white cloth, a dozen fresh tumars still warm from the people who gave them. Beside it, an alms box with a lead seal.|Ниша у ворот Обители: корзина, выстланная белым полотном, в ней дюжина свежих тумаров, ещё тёплых от тех, кто их отдал. Рядом ящик для подаяний со свинцовой печатью.|Xonaqoh darvozasi yonidagi tokcha: oq mato to'shalgan savat, unda o'nlab yangi tumarlar — bergan odamlarning issig'i hali ketmagan. Yonida qo'rg'oshin muhrli nazr qutisi.`]
    ] : [], () => ask(`At dusk someone will come for the basket.|В сумерках за корзиной кто-нибудь придёт.|G'ira-shirada savatni olgani kimdir keladi.`, [
      tried.follow ? null : FAC.chk('agi', 5, `Wait in the shadows and follow whoever takes it.|Ждать в тени и пойти за тем, кто её заберёт.|Soyada kutib, uni olib ketgan odamning ortidan borish.`, { id: 'follow' }, `Unseen|Незаметно|Sezdirmay`),
      tried.hum ? null : FAC.chk('song', 2, `Listen to the tumars. The ones that have been near the Well sound lower.|Вслушаться в тумары. Те, что побывали у Колодца, звучат ниже.|Tumarlarga quloq solish. Quduq yonida bo'lganlari pastroq ovoz chiqaradi.`, { id: 'hum' }, `Listen|Вслушаться|Quloq solish`),
      FAC.inParty('nargiza') ? { id: 'nar', label: `"Nargiza. Where does the basket go?"|«Наргиза. Куда уносят корзину?»|«Nargiza. Savatni qayerga olib ketishadi?»` } : null,
      { id: 'gate', label: `Sit by the gate like a tired yodchi and watch which road the basket takes.|Сесть у ворот усталым ёдчи и посмотреть, по какой дороге унесут корзину.|Charchagan yodchidek darvoza yonida o'tirib, savatni qaysi yo'ldan olib ketishlarini kuzatish.` }
    ], o => {
      const found = lines => play(lines, () => {
        setC('path');
        FAC.stepTo('qc1', `The light tithe never reaches the Well. An old Keeper, Mavlon-ota, carries the basket out of the back gate to the Tower of Silence. Find what he keeps there.|Лёгкая десятина до Колодца не доходит. Старый хранитель Мавлон-ота уносит корзину через задние ворота к Башне молчания. Узнать, что он там хранит.|Yengil ushr Quduqqa yetib bormaydi. Keksa saqlovchi Mavlon ota savatni orqa darvozadan Sukunat minorasiga olib ketadi. U yerda nima saqlashini bilish kerak.`, ['tower', 'qc1_shelf']);
        d();
      });
      if (o.id === 'follow' && !o.ok) {
        play([['', `A pebble cracks under your boot. The old Keeper stops, stares into the dark for a long time, and carries the basket back inside. Another way, then.|Под сапогом хрустит камешек. Старый хранитель останавливается, долго смотрит в темноту и уносит корзину обратно. Значит, по-другому.|Etik ostida mayda tosh g'ichirlaydi. Keksa saqlovchi to'xtab, qorong'ilikka uzoq tikiladi va savatni ichkariga olib kirib ketadi. Demak, boshqa yo'l bilan.`]], () => qcNiche(d, Object.assign({}, tried, { seen: 1, follow: 1 })));
        return;
      }
      if (o.id === 'hum' && !o.ok) {
        play([['', `They all hum alike to you: warm, anxious, new. You'd need a better ear.|Для тебя они гудят одинаково: тепло, тревожно, ново. Тут нужен слух потоньше.|Ular senga bir xil g'uvillaydi: iliq, xavotirli, yangi. Bunga nozikroq quloq kerak.`]], () => qcNiche(d, Object.assign({}, tried, { seen: 1, hum: 1 })));
        return;
      }
      if (o.id === 'follow') found([['', `At dusk an old Keeper lifts the basket and goes not down the Well stair but out of the back gate, onto the dusty road west. You follow him all the way to the Tower of Silence.|В сумерках старый хранитель поднимает корзину и идёт не вниз, к Колодцу, а в задние ворота, на пыльную дорогу на запад. Ты идёшь за ним до самой Башни молчания.|G'ira-shirada keksa saqlovchi savatni ko'tarib, Quduq zinasidan pastga emas, orqa darvozadan g'arbga ketgan changli yo'lga chiqadi. Uning ortidan Sukunat minorasigacha borasan.`]]);
      else if (o.id === 'hum') found([['', `Among the fresh tumars are three old ones that have never been near the Well: they still sound like their owners. Their wax is dusted with white grit from the Tower of Silence.|Среди свежих тумаров три старых, которые ни разу не были у Колодца: они до сих пор звучат как их хозяева. Воск припорошен белой крошкой с Башни молчания.|Yangi tumarlar orasida hech qachon Quduq yonida bo'lmagan uchta eskisi bor: ular hali ham egalaridek ovoz chiqaradi. Mumiga Sukunat minorasining oq ushog'i qo'ngan.`]]);
      else if (o.id === 'nar') found([
        ['nargiza', `Down, to the Well. That's what they... wait. When I carried it, Mavlon-ota met me at the stair and took it himself. Said my knees were too young. So where did he take it?|Вниз, к Колодцу. Нам так... постой. Когда я несла, Мавлон-ота встретил меня у лестницы и забрал сам. Сказал, колени у меня слишком молодые. Тогда куда он её понёс?|Pastga, Quduqqa. Bizga shunday... to'xta. Men ko'targanimda, Mavlon ota zinada kutib olib, o'zi olib ketdi. Tizzalaring hali yosh, dedi. Unda qayerga olib ketdi?`],
        ['nargiza', `The back gate goes to one place. The Tower of Silence. Come on.|Задние ворота ведут в одно место. К Башне молчания. Пошли.|Orqa darvoza bitta joyga olib boradi. Sukunat minorasiga. Ketdik.`]
      ]);
      else {
        try { const h = SIDE.hour(); if (h >= 6 && h < 19) G.WORLD2.setHour(19); } catch (e) { /* ignore */ }
        found([['', `You sit by the gate until the lamps are lit. An old Keeper carries the basket out of the back gate, west, toward the Tower of Silence. Not down. Not to the Well.|Сидишь у ворот, пока не зажгут лампы. Старый хранитель уносит корзину через задние ворота на запад, к Башне молчания. Не вниз. Не к Колодцу.|Chiroqlar yoqilguncha darvoza yonida o'tirasan. Keksa saqlovchi savatni orqa darvozadan g'arbga, Sukunat minorasi tomon olib ketadi. Pastga emas. Quduqqa emas.`]]);
      }
    }));
  };
  FAC.prop('cloister', 'qc1_niche', { id: 'qc1niche', art: 'f6crate', dx: 6, prompt: `Look at the light tithe basket|Осмотреть корзину лёгкой десятины|Yengil ushr savatini ko'zdan kechirish`, when: () => act('qc1') && C('note') && !C('path'), use: d => qcNiche(d) });

  /* ---------------------------------------------------------------- 4 · the shelf under the Tower of Silence */
  const qcShelf = d => play([
    ['', `Under the platform of the dead, behind a door that smells of wax and vultures, a cell. Shelves to the ceiling. Hundreds of tumars, each with a tag written in lapis ink.|Под площадкой для мёртвых, за дверью, что пахнет воском и грифами, — келья. Полки до потолка. Сотни тумаров, к каждому привязана бирка, подписанная лазуритом.|O'liklar supasi ostida, mum va tasqara hidi kelib turgan eshik ortida hujra. Shiftgacha tokchalar. Yuzlab tumarlar, har biriga lojuvard siyohda yozilgan yorliq bog'langan.`]
  ], () => hub(`The shelf of the light tithe|Полка лёгкой десятины|Yengil ushr tokchasi`, [
    { label: `— Read the book on the table.|— Прочитать книгу на столе.|— Stol ustidagi daftarni o'qish.`, lines: [
      ['', `Not debts. Deeds. "Judge Karimbek: a bribe for sending a Tail boy to the salt mines. Held. The Tail's bridge toll stayed at one copper."|Не долги. Дела. «Судья Каримбек: взятка за мальчишку из Хвоста, отправленного на соляные копи. Придержано. Мостовой сбор в Хвосте остался в один медяк».|Qarzlar emas. Ishlar. «Qozi Karimbek: Dumdan bir bolani tuz konlariga jo'natgani uchun pora. Ushlab turilibdi. Dumdagi ko'prik boji bir mis tangaligicha qoldi».`],
      ['', `"The Divan's tax-farmer: his mother's pawned jewels. Held. The Tail's double tithe after the Small Awakening, halved." Twenty years of entries, all in one hand.|«Откупщик Дивана: заложенные материнские украшения. Придержано. Двойная десятина Хвоста после Малого пробуждения — урезана вдвое». Двадцать лет записей, и всё одной рукой.|«Devon soliqchisi: onasining garovga qo'yilgan taqinchoqlari. Ushlab turilibdi. Kichik uyg'onishdan keyingi Dumning ikki karra ushri — ikki baravar kamaytirildi». Yigirma yillik yozuv, hammasi bir qo'lda.`],
      cl('nargiza', `He's been... using them. Ustoz says the light tithe is the purest food the Well gets. And he keeps the purest food to frighten judges with.|Он их… использует. Устоз говорит, лёгкая десятина — самая чистая пища для Колодца. А он держит самую чистую пищу, чтобы пугать судей.|U ulardan… foydalanib kelgan. Ustoz yengil ushr Quduq uchun eng toza ozuqa deydi. U esa eng toza ozuqani qozilarni qo'rqitish uchun saqlab yuribdi.`)
    ] },
    { label: `— Find Lola's tag.|— Найти бирку Лолы.|— Lolaning yorlig'ini topish.`, lines: [
      ['', `"Lola, daughter of Sattor the weigher. Given in spring. Used once: the widow Hosiyat, forty a moon." Underneath, in the same hand: "to Hosiyat".|«Лола, дочь весовщика Саттора. Отдано весной. Использовано однажды: вдова Хосият, сорок в луну». Ниже той же рукой: «Хосият».|«Tarozibon Sattorning qizi Lola. Bahorda berilgan. Bir marta ishlatilgan: beva Hosiyat, oyiga qirq». Ostida o'sha qo'l bilan: «Hosiyatga».`]
    ] },
    { label: `— Look for the House of Lochin.|— Поискать дом Лочин.|— Lochin xonadonini qidirish.`, if: () => q('qa1').st !== 'none', lines: [
      ['', `"Lochin-bek, his son's evening: not kept here, sung into a groom by order. Six hundred to the alms box. Spent: Tail roofs, after the spring rains."|«Лочин-бек, вечер сына: здесь не хранится, по приказу вселён в конюха. Шестьсот в ящик подаяний. Потрачено: крыши Хвоста после весенних дождей».|«Lochinbek, o'g'lining oqshomi: bu yerda saqlanmaydi, buyruq bilan otboqarga joylangan. Nazr qutisiga olti yuz. Sarflandi: bahorgi yomg'irlardan keyin Dum tomlariga».`],
      () => (sado() ? ['sado', `In this city everything is paid for with something else. Even the roofs.|В этом городе за всё платят чем-то другим. Даже за крыши.|Bu shaharda hamma narsa uchun boshqa narsa bilan to'lanadi. Hatto tomlar uchun ham.`] : null)
    ] }
  ], [
    { id: 'go', label: `Go back to the Cloister and find Mavlon-ota.|Вернуться в Обитель и найти Мавлона-ота.|Xonaqohga qaytib, Mavlon otani topish.` }
  ], () => {
    setC('shelf');
    FAC.stepTo('qc1', `Under the Tower of Silence Mavlon-ota keeps twenty years of the light tithe and uses it to hold judges and tax-farmers back from the Tail. Talk to him in the Cloister.|Под Башней молчания Мавлон-ота хранит двадцать лет лёгкой десятины и с её помощью удерживает судей и откупщиков от Хвоста. Поговорить с ним в Обители.|Mavlon ota Sukunat minorasi ostida yigirma yillik yengil ushrni saqlaydi va u bilan qozi va soliqchilarni Dumdan tiyib turadi. U bilan xonaqohda gaplashish kerak.`, ['cloister', 'qc1_keep']);
    d();
  }));
  FAC.prop('tower', 'qc1_shelf', { id: 'qc1shelf', art: 'f6books', dx: 0, prompt: `Open the door under the platform|Открыть дверь под площадкой|Supa ostidagi eshikni ochish`, when: () => act('qc1') && C('path') && !C('shelf'), use: d => qcShelf(d) });

  /* ---------------------------------------------------------------- 5 · the keeper */
  const qcEnd = d => play([
    ['qc_mavlon', `You've been in my cell. There's vulture dust on your boots, yodchi. Sit. My knees won't let me stand through an argument.|Ты был в моей келье. У тебя на сапогах пыль с площадки грифов, ёдчи. Садись. Колени не дают мне спорить стоя.|Hujramga kirgansan. Etiklaringda tasqaralar supasining changi bor, yodchi. O'tir. Tizzalarim tik turib bahslashishga qo'ymaydi.`],
    ['qc_mavlon', `Twenty years ago the Sleeper turned over and half the Tail slid into the sand. Next morning the Order doubled the Tail's tithe. I sang that decree. Then I started keeping things back.|Двадцать лет назад Спящий повернулся, и пол-Хвоста съехало в песок. Наутро Орден удвоил Хвосту десятину. Этот указ пел я. Тогда я и начал кое-что придерживать.|Yigirma yil oldin Uxlovchi ag'darildi va Dumning yarmi qumga sirg'alib ketdi. Ertasiga Orden Dumning ushrini ikki baravar oshirdi. O'sha farmonni men kuylaganman. Shundan keyin ba'zi narsalarni ushlab qola boshladim.`],
    ['qc_mavlon', `The Well gets the dull shames: a lie to a neighbour, a stolen melon. The sharp ones I keep. A judge who gets a note from me doesn't raise the bridge toll.|Колодцу достаётся тупой стыд: соврал соседу, украл дыню. Острый я оставляю. Судья, которому пришла от меня записка, мостовой сбор не поднимает.|Quduqqa o'tmas uyatlar tushadi: qo'shniga yolg'on gapirgan, qovun o'g'irlagan. O'tkirlarini o'zimda qoldiraman. Mendan xat olgan qozi ko'prik bojini oshirmaydi.`]
  ], () => hub(`Mavlon-ota|Мавлон-ота|Mavlon ota`, [
    { label: `— And Sattor?|— А Саттор?|— Sattor-chi?`, lines: [
      ['qc_mavlon', `Sattor weighed a widow's grief light for three years. The forty he pays now goes to Hosiyat, every copper. She thinks it's the Cloister's charity.|Саттор три года обвешивал вдову на её горе. Сорок, что он теперь платит, идут Хосият до медяка. Она думает, что это милостыня Обители.|Sattor uch yil bevaning qayg'usini kam tortib keldi. Hozir to'layotgan qirq tillasi tiyinigacha Hosiyatga boradi. U buni xonaqohning xayr-ehsoni deb o'ylaydi.`]
    ] },
    { label: `— And Lola? She trusted you with it.|— А Лола? Она доверила это вам.|— Lola-chi? U buni sizga ishonib bergan.`, lines: [
      ['qc_mavlon', `She trusted the Well. The Well would have eaten it and given her nothing. I fed a widow with it. You tell me which of us betrayed her.|Она доверилась Колодцу. Колодец съел бы это и ничего ей не дал. А я на это кормлю вдову. Ты мне скажи, кто из нас её предал.|U Quduqqa ishongan. Quduq buni yeb, unga hech narsa bermasdi. Men esa shu bilan bir bevani boqyapman. O'zing ayt-chi, qaysi birimiz uni sotdik.`]
    ] },
    { label: `— You sang the Lochin heir's evening into a groom.|— Это вы выпели вечер наследника Лочин в конюха.|— Lochin vorisining oqshomini otboqarga siz joylagansiz.`, if: () => !!A('page'), lines: [
      ['qc_mavlon', `I did. Six hundred tilla. Forty roofs in the Tail after the spring rains. The boy in the cistern was already dead, yodchi. The roofs weren't up yet.|Я. Шестьсот тилла. Сорок крыш в Хвосте после весенних дождей. Мальчик в хаузе был уже мёртв, ёдчи. А крыш ещё не было.|Men. Olti yuz tilla. Bahorgi yomg'irlardan keyin Dumda qirqta tom. Hovuzdagi bola allaqachon o'lgan edi, yodchi. Tomlar esa hali yo'q edi.`],
      () => (done('qa1') && br('qa1') === 'return' ? ['qc_mavlon', `And you put it back into the boy. Lochin-bek came to me afterwards and asked me to take it out again. I said no. Prices have gone up.|А ты вернул это мальчишке. Лочин-бек потом приходил ко мне, просил вынуть опять. Я отказал. Цены выросли.|Sen esa buni bolaning o'ziga qaytarding. Keyin Lochinbek kelib, yana chiqarib ber, dedi. Rad etdim. Narxlar oshgan.`] : null)
    ] },
    { label: `— What happens to the shelf when you die?|— А что будет с полкой, когда вы умрёте?|— O'lsangiz, tokcha nima bo'ladi?`, lines: [
      ['qc_mavlon', `I'm seventy-one. I've asked myself that every morning for a year. I hoped someone like you would turn up with an answer.|Мне семьдесят один. Я год каждое утро себя об этом спрашиваю. Надеялся, что придёт кто-нибудь вроде тебя и ответит.|Yetmish birga kirdim. Bir yildan beri har tong o'zimdan shuni so'rayman. Senga o'xshagan kimdir kelib javob berar, deb umid qilgandim.`]
    ] }
  ], [
    { id: 'habiba', label: `"Keeper Habiba will hear about this tonight. Let the Order decide what you are."|«Сегодня же об этом узнает хранительница Хабиба. Пусть Орден решает, кто вы такой.»|«Bugunoq bu haqda saqlovchi Habiba eshitadi. Kim ekaningizni Orden hal qilsin.»` },
    { id: 'remember', label: `"Those Who Remember will take the shelf. Everything goes back to whoever it belongs to."|«Полку заберут Те, кто помнит. Всё вернётся к тем, чьё оно.»|«Tokchani Eslaganlar olib ketadi. Hammasi egasiga qaytadi.»` },
    FAC.craft('burn', `the whole shelf: every tag, every tumar|всю полку: каждую бирку, каждый тумар|butun tokchani: har bir yorliqni, har bir tumarni`, { id: 'burn' }),
    { id: 'deal', label: `"Keep it. But Sattor's page comes off, and to be sure I keep quiet you'll want something of mine on the shelf."|«Оставьте её. Но страницу Саттора снимите, а чтобы я молчал, вам понадобится на полке что-то моё.»|«O'zingizda qolsin. Lekin Sattorning sahifasini oling, jim turishimga ishonch uchun esa tokchada mendan ham bir narsa bo'lsin.»` }
  ], o => {
    const fin = (lines, text) => play([
      cl('nargiza', `He lied to everyone who ever knelt at that niche. Me too. ...And the Tail has roofs. I hate this. I hate that I can't just hate him.|Он лгал всем, кто хоть раз вставал на колени у той ниши. И мне. ...А у Хвоста есть крыши. Ненавижу это. Ненавижу, что не могу просто ненавидеть его.|U o'sha tokcha oldida tiz cho'kkan hammani aldagan. Meni ham. ...Dumning esa tomlari bor. Buni yomon ko'raman. Uni shunchaki yomon ko'ra olmasligimni yomon ko'raman.`)
    ].concat(lines), () => { FAC.finish('qc1', o.id, text); d(); });
    if (o.id === 'habiba') {
      rep('singers', 3); rep('tail', -1); FAC.react({ nargiza: 5, surayyo: -10, alp: -5 }, 'qc1');
      fin([
        ['', `That night two Keepers come for Mavlon-ota. He goes without his stick. In the morning novices carry the shelf down to the Well's crypt, tag by tag, and nobody tells them what it is.|Ночью за Мавлоном-ота приходят два хранителя. Он уходит без палки. Утром послушницы по бирке сносят полку в крипту Колодца, и никто не говорит им, что они несут.|Kechasi Mavlon otani ikki saqlovchi olib ketadi. U hassasiz ketadi. Ertalab shogirdlar tokchani yorliqma-yorliq Quduq yerto'lasiga olib tushishadi, nima ko'tarayotganlarini hech kim aytmaydi.`],
        ['', `Lola is among them. Keeper Habiba has praised her honesty and given her the lapis ink to look after.|Лола среди них. Хранительница Хабиба похвалила её честность и доверила ей лазуритовые чернила.|Lola ham ular orasida. Saqlovchi Habiba uning halolligini maqtab, lojuvard siyohni unga ishonib topshirgan.`],
        cl('nargiza', `Ustoz will have all of it now. All of it. ...I wanted this. I know I did.|Теперь всё это будет у Устоз. Всё. ...Я сама этого хотела. Знаю.|Endi bularning hammasi Ustozda bo'ladi. Hammasi. ...O'zim shuni xohlagandim. Bilaman.`)
      ], `You told the Order. Mavlon-ota was taken to the Well; his shelf went with him, into hands that know better how to use it.|Ты рассказал Ордену. Мавлона-ота увели к Колодцу; полка ушла вместе с ним — в руки, которые лучше знают, как ею пользоваться.|Ordenga aytding. Mavlon otani Quduqqa olib ketishdi; tokcha ham u bilan birga — undan qanday foydalanishni yaxshiroq biladigan qo'llarga ketdi.`);
    } else if (o.id === 'remember') {
      rep('remember', 2); rep('singers', -3); rep('tail', -1); FAC.react({ surayyo: 5, nargiza: -5, alp: 5 }, 'qc1');
      fin([
        ['', `Two days later the shelf is empty. Those Who Remember work fast: a tumar in a judge's tea, a tag pinned to a door. All over the city people remember what they paid to forget.|Через два дня полка пуста. Те, кто помнит, работают быстро: тумар в пиалу судьи, бирка на дверь. По всему городу люди вспоминают то, за что платили, чтобы забыть.|Ikki kundan keyin tokcha bo'm-bo'sh. Eslaganlar tez ishlaydi: qozining choyiga tumar, eshikka yorliq. Butun shahar bo'ylab odamlar unutish uchun pul to'lagan narsalarini eslab qolishadi.`],
        ['', `Lola gets hers back wrapped in a plain cloth. She stands in front of her father's scales for a long time. Then she takes off the white.|Лоле её память возвращают в простой тряпице. Она долго стоит перед отцовскими весами. Потом снимает белое.|Lolaga xotirasini oddiy lattaga o'rab qaytarishadi. U otasining tarozisi oldida uzoq turadi. Keyin oq kiyimini yechadi.`],
        ['qc_mavlon', `Judge Karimbek remembers now too. And nobody is holding the bridge toll. You'll see, yodchi. It takes about a month.|Судья Каримбек теперь тоже помнит. А мостовой сбор больше никто не держит. Увидишь, ёдчи. Месяца не пройдёт.|Qozi Karimbek ham endi eslaydi. Ko'prik bojini esa endi hech kim ushlab turmaydi. Ko'rasan, yodchi. Bir oy ham o'tmaydi.`]
      ], `You gave the shelf to Those Who Remember. Every shame went home, and with it the judges' freedom to squeeze the Tail.|Ты отдал полку Тем, кто помнит. Каждый стыд вернулся к хозяину, а с ним к судьям вернулась свобода давить на Хвост.|Tokchani Eslaganlarga berding. Har bir uyat egasiga qaytdi, u bilan birga qozilarga Dumni siqish erkinligi ham qaytdi.`);
    } else if (o.id === 'burn') {
      addVoid(3, `a shelf of other people's shame|полка чужого стыда|birovlarning uyati to'la tokcha`); rep('singers', -1); rep('tail', -1); FAC.react({ nargiza: 10, surayyo: -5 }, 'qc1');
      fin([
        ['', `Hundreds of tumars go up at once. For one breath the cell is full of voices: a stolen melon, a slapped child, a bribe, a betrayal. Then the vultures on the platform above lift off together.|Сотни тумаров вспыхивают разом. На один вдох келья полна голосов: украденная дыня, ударенный ребёнок, взятка, предательство. Потом грифы на площадке над головой разом взлетают.|Yuzlab tumarlar birdaniga yonib ketadi. Bir nafasga hujra ovozlarga to'ladi: o'g'irlangan qovun, urilgan bola, pora, xiyonat. Keyin tepadagi supada tasqaralar birdaniga uchib ketadi.`],
        ['qc_mavlon', `Now nobody will ever remember any of it. Not the judges, not the widows. Not me. ...Hosiyat's forty stops this month.|Теперь никто этого никогда не вспомнит. Ни судьи, ни вдовы. Ни я. ...С этого месяца Хосият своих сорока не получит.|Endi buni hech kim hech qachon eslamaydi. Na qozilar, na bevalar. Na men. ...Shu oydan Hosiyat qirq tillasini olmaydi.`]
      ], `You burned the shelf of the light tithe. No one can be squeezed with it again, and no one can be held back with it either.|Ты сжёг полку лёгкой десятины. Ею больше никого не прижмут — но и никого не удержат.|Yengil ushr tokchasini yoqib yubording. Endi u bilan hech kimni qisib bo'lmaydi — hech kimni tiyib ham bo'lmaydi.`);
    } else {
      addVoid(6, `one of your own shames, on his shelf|один из твоих стыдов — на его полке|uyatlaringdan biri — uning tokchasida`); rep('tail', 1); FAC.react({ nargiza: -15, surayyo: 5, alp: -5 }, 'qc1');
      fin([
        ['qc_mavlon', `Clever. Then give me one thing. Something you'd rather nobody knew about you, yourself included.|Умно. Тогда дай мне одно. То, чего ты предпочёл бы не знать о себе и сам.|Aqlli. Unda menga bitta narsa ber. O'zing ham o'zing haqingda bilmaslikni afzal ko'radigan narsani.`],
        ['', `He sings low. Something leaves you; you can tell only by the space where it was. He ties a tag to it, writes on it in lapis, and doesn't let you read it.|Он поёт низко. Из тебя что-то уходит — понять это можно только по пустому месту. Он привязывает бирку, пишет на ней лазуритом и прочесть не даёт.|U past ovozda kuylaydi. Sendan nimadir chiqib ketadi — buni faqat bo'shab qolgan joyidan bilsa bo'ladi. U yorliq bog'lab, lojuvard bilan nimadir yozadi va o'qishga bermaydi.`],
        () => (sado() ? ['sado', `Whatever it was, I didn't get a look at it. He's quick.|Что бы это ни было, я не успела разглядеть. Он быстрый.|Nima bo'lganini ko'rishga ulgurmadim. U chaqqon ekan.`] : null),
        ['qc_mavlon', `Sattor's page is off the shelf. The widow keeps her forty; I'll find it elsewhere. Go, yodchi. Your tag is on the third shelf. I haven't read it. Yet.|Страница Саттора снята. Вдова свои сорок получит — найду в другом месте. Иди, ёдчи. Твоя бирка на третьей полке. Я её не читал. Пока.|Sattorning sahifasi olindi. Beva qirq tillasini oladi — boshqa joydan topaman. Bor, yodchi. Sening yorlig'ing uchinchi tokchada. Hali o'qimadim. Hozircha.`],
        cl('nargiza', `You put yourself on his shelf so the shelf could stay. I don't even know what to call that.|Ты положил себя к нему на полку, чтобы полка осталась. Я даже не знаю, как это назвать.|Tokcha qolsin deb o'zingni uning tokchasiga qo'yding. Buni nima deb atashni ham bilmayman.`)
      ], `You left Mavlon-ota his shelf and freed Sattor, and paid with a memory of your own. It lies under the Tower of Silence now, with a lapis tag.|Ты оставил Мавлону-ота его полку и освободил Саттора, а заплатил своей памятью. Теперь она лежит под Башней молчания, с лазуритовой биркой.|Mavlon otaga tokchasini qoldirib, Sattorni ozod qilding, buning uchun o'z xotirang bilan to'lading. U endi Sukunat minorasi ostida, lojuvard yorliq bilan yotibdi.`);
    }
  }));

  /* ---------------------------------------------------------------- who says what, and later */
  const TOLL = `"They raised the bridge toll in the Tail. Three coppers. People say nobody holds Judge Karimbek's leash any more."|«В Хвосте подняли мостовой сбор. Три медяка. Говорят, Каримбека теперь никто не держит на поводке».|«Dumda ko'prik bojini oshirishdi. Uch mis tanga. Aytishlaricha, endi qozi Karimbekning jilovini hech kim ushlamayapti».`;
  FAC.talk.qc_lola = d => {
    if (q('qc1').st === 'none') { qcOffer(d); return; }
    if (act('qc1')) { play([['qc_lola', C('shelf') ? `You've been to the Tower. I can smell it on you. ...Don't tell me yet. Tell Mavlon-ota first. He's been kind to me.|Ты был у Башни. От тебя пахнет. ...Не говори мне пока. Сначала скажи Мавлону-ота. Он был ко мне добр.|Minoraga borib kelibsan. Hidi kelyapti. ...Hozircha menga aytma. Avval Mavlon otaga ayt. U menga mehribon bo'lgan.` : `Did you see my father? Is he eating? He doesn't eat when he's frightened.|Ты видел отца? Он ест? Когда ему страшно, он не ест.|Otamni ko'rdingmi? Ovqat yeyaptimi? Qo'rqsa, ovqat yemaydi.`]], d); return; }
    const L = {
      habiba: `Lola wears lapis-stained gloves now. "Keeper Habiba says I have the hands for it." She doesn't ask what "it" is.|Лола теперь носит перчатки в пятнах лазурита. «Хранительница Хабиба говорит, у меня для этого руки». Для чего — она не спрашивает.|Lola endi lojuvard dog'li qo'lqop kiyadi. «Saqlovchi Habiba buning uchun qo'lim bor, deydi». Nima uchunligini u so'ramaydi.`,
      remember: `Lola sits beside her father's scales in a plain dress and watches his thumb, every weighing. He has never been so honest in his life.|Лола в простом платье сидит рядом с отцовскими весами и смотрит на его палец, при каждом взвешивании. Он в жизни не был таким честным.|Lola oddiy ko'ylakda otasining tarozisi yonida o'tirib, har tortishda uning barmog'iga qaraydi. U umrida bunchalik halol bo'lmagan.`,
      burn: `"The notes stopped. Father's well. He doesn't know why and doesn't ask. Neither do I. I've decided I'm good at not asking."|«Записки прекратились. У отца всё хорошо. Он не знает почему и не спрашивает. Я тоже. Решила, что не спрашивать у меня получается».|«Xatlar to'xtadi. Otam yaxshi. Nega ekanini bilmaydi va so'ramaydi. Men ham. So'ramaslik qo'limdan keladi, degan qarorga keldim».`,
      deal: `"The notes stopped. Thank you. ...You look tired, yodchi. More than before."|«Записки прекратились. Спасибо. ...Ты выглядишь усталым, ёдчи. Сильнее, чем раньше».|«Xatlar to'xtadi. Rahmat. ...Charchagan ko'rinasan, yodchi. Avvalgidan ham ko'proq».`
    }[br('qc1')];
    play([['', L || `…|…|…`]], d);
  };
  FAC.talk.qc_ismat = d => {
    if (act('qc1') && !C('note')) { qcSattor(d); return; }
    if (q('qc1').st === 'none') { play([['', FAC.NPC.qc_ismat.def.idle]], d); return; }
    if (act('qc1')) { play([['qc_ismat', `Well? Who is it? Forty tilla a moon, yodchi. I count every one of them twice.|Ну? Кто это? Сорок тилла в луну, ёдчи. Я каждую дважды пересчитываю.|Xo'sh? Kim ekan? Oyiga qirq tilla, yodchi. Har birini ikki marta sanayman.`]], d); return; }
    const b = br('qc1'), late = since('qc1') >= 2;
    const L = {
      habiba: [`"Another note came. Different hand. Sixty now, and it goes to the Well's stewards. At least the old man's ink was pretty."|«Пришла новая записка. Другой почерк. Теперь шестьдесят, и деньги идут казначеям Колодца. У старика хоть чернила были красивые».|«Yangi xat keldi. Boshqa qo'l. Endi oltmish, pul Quduq xazinachilariga ketadi. Cholning hech bo'lmasa siyohi chiroyli edi».`],
      remember: [`"Lola watches my hands. I weigh honestly now. I make half what I did. I've never slept so badly."|«Лола смотрит мне на руки. Я теперь вешаю честно. Зарабатываю вдвое меньше. В жизни так плохо не спал».|«Lola qo'llarimga qarab turadi. Endi halol tortaman. Ilgarigidan yarim kam topaman. Umrimda bunchalik yomon uxlamaganman».`].concat(late ? [TOLL] : []),
      burn: [`"Free! And Hosiyat came by, asking whether the Cloister had forgotten her. I gave her ten tilla. I don't know why I did that."|«Свободен! А Хосият заходила, спрашивала, не забыла ли её Обитель. Я дал ей десять тилла. Сам не знаю зачем».|«Ozodman! Hosiyat kelib, xonaqoh meni unutdimi, deb so'radi. Unga o'n tilla berdim. Nega berganimni o'zim ham bilmayman».`].concat(late ? [TOLL] : []),
      deal: [`"No more notes. Whatever you did, yodchi, I owe you." Out of habit he weighs your purse in his palm, and frowns at the result.|«Записок больше нет. Что бы ты ни сделал, ёдчи, я твой должник». По привычке он взвешивает на ладони твой кошелёк и хмурится.|«Boshqa xat yo'q. Nima qilgan bo'lsang ham, yodchi, senga qarzdorman». Odatiga ko'ra hamyoningni kaftida tortib ko'radi va qovog'ini soladi.`]
    }[b] || [`…|…|…`];
    play(L.map(x => ['', x]), d);
  };
  FAC.talk.qc_mavlon = d => {
    if (act('qc1') && C('shelf')) { qcEnd(d); return; }
    if (!done('qc1')) { play([['', FAC.NPC.qc_mavlon.def.idle]], d); return; }
    const b = br('qc1');
    if (b === 'habiba') { play([['', `Mavlon-ota sweeps the Cloister yard with great care, the same square again and again. He greets you with a polite line from a hymn. He doesn't know you.|Мавлон-ота очень старательно метёт двор Обители — один и тот же квадрат, снова и снова. Приветствует тебя вежливой строчкой из гимна. Он тебя не знает.|Mavlon ota xonaqoh hovlisini juda tirishib supuryapti — bir xil joyni qayta-qayta. Seni madhiyadagi xushmuomala bir satr bilan qarshilaydi. U seni tanimaydi.`]], d); return; }
    if (b === 'burn') { play([['qc_mavlon', `I've nothing left to keep. I sleep till noon. It's terrible.|Мне теперь нечего хранить. Сплю до полудня. Ужас.|Endi saqlaydigan hech narsam yo'q. Peshingacha uxlayman. Dahshat.`], ['', `He almost smiles.|Он почти улыбается.|U deyarli jilmayadi.`]], d); return; }
    if (b === 'deal') {
      if (since('qc1') >= 2 && !C('rent')) {
        setC('rent');
        play([['qc_mavlon', `Judge Karimbek wanted a toll on the Tail's well last week. He changed his mind. The alms box had a good month. Take forty. Call it rent for the third shelf.|Судья Каримбек на прошлой неделе хотел поставить сбор на колодец Хвоста. Передумал. У ящика для подаяний хороший месяц. Возьми сорок. Считай, это плата за третью полку.|Qozi Karimbek o'tgan hafta Dum qudug'iga boj qo'ymoqchi bo'ldi. Fikridan qaytdi. Nazr qutisining oyi yaxshi keldi. Qirq tilla ol. Uchinchi tokcha uchun ijara deb bil.`]], () => { gold(40); d(); });
        return;
      }
      play([['qc_mavlon', `Third shelf, yodchi. Still haven't looked.|Третья полка, ёдчи. Всё ещё не смотрел.|Uchinchi tokcha, yodchi. Hali ham qaramadim.`]], d);
      return;
    }
    play([['', FAC.NPC.qc_mavlon.def.idle]], d);
  };

  SIDE.epi('qc1', () => (!done('qc1') ? null : {
    habiba: `The light tithe never went back to the Well. It went to Ustoz Shirin's stewards, who kept it in better order than old Mavlon ever had. Lola, in lapis-stained gloves, became the youngest Keeper in a hundred years.|Лёгкая десятина в Колодец так и не вернулась. Она ушла к казначеям Устоз Ширин, у которых порядок был лучше, чем у старого Мавлона. Лола в перчатках в пятнах лазурита стала самой молодой хранительницей за сто лет.|Yengil ushr Quduqqa qaytmadi. U Ustoz Shirinning xazinachilariga o'tdi, ularda tartib keksa Mavlonnikidan yaxshiroq edi. Lojuvard dog'li qo'lqopli Lola yuz yildagi eng yosh saqlovchi bo'ldi.`,
    remember: `Every shame in the city went home. Two judges left Yodgor; a Tail elder was beaten by his own mahalla. The bridge toll rose to three coppers. Lola weighed memories beside her father, and he never cheated again.|Каждый стыд в городе вернулся к хозяину. Двое судей уехали из Ёдгора; старейшину Хвоста избила его же махалля. Мостовой сбор вырос до трёх медяков. Лола взвешивала память рядом с отцом, и он больше ни разу не обвесил.|Shahardagi har bir uyat egasiga qaytdi. Ikki qozi Yodgordan ketdi; Dumdagi bir oqsoqolni o'z mahallasi do'pposladi. Ko'prik boji uch mis tangaga chiqdi. Lola otasi yonida xotira tortdi, u esa boshqa hech qachon aldamadi.`,
    burn: `Nobody in Yodgor ever learned what lay on the shelf under the Tower of Silence. The vultures came back the next day; the judges raised the bridge toll the next month. Mavlon-ota slept till noon for the rest of his life.|В Ёдгоре так никто и не узнал, что лежало на полке под Башней молчания. Грифы вернулись на следующий день, судьи подняли мостовой сбор в следующем месяце. Мавлон-ота до конца жизни спал до полудня.|Sukunat minorasi ostidagi tokchada nima yotganini Yodgorda hech kim bilmadi. Tasqaralar ertasiga qaytdi, qozilar keyingi oy ko'prik bojini oshirdi. Mavlon ota umrining oxirigacha peshingacha uxladi.`,
    deal: `Mavlon-ota kept his shelf until he died and left it to no one. Clearing his cell, the novices found a tag on the third shelf that nobody could read. They gave it to the Well. It seemed the honest thing to do.|Мавлон-ота хранил свою полку до самой смерти и никому её не оставил. Разбирая его келью, послушницы нашли на третьей полке бирку, которую никто не смог прочесть. Её отдали Колодцу. Так казалось честнее.|Mavlon ota tokchasini o'limigacha saqladi va hech kimga qoldirmadi. Hujrasini yig'ishtirayotgan shogirdlar uchinchi tokchada hech kim o'qiy olmagan yorliqni topishdi. Uni Quduqqa berishdi. Shunisi halolroqdek tuyuldi.`
  }[br('qc1')] || null), 'shirin:tithe');
}
