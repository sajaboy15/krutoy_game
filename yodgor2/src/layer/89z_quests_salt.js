/* 89z_quests_salt.js — two investigations of the salt country (GDD ch. 20: a riddle, a turn, no clean way out, people return).
     qr1 The Same Caravan (Rabat → Tail → the fog on the flats → Rabat)
         Every autumn on the same night Yo'ldosh-bashi's caravan comes to the Rabat, and nobody in it gets older. Thirty
         years ago the real caravan walked into the fog on the salt flats; the tumars came back out of it on the salt.
         Rajab, the drovers' boy who became a Singer and was thrown out, sings the six dead drovers into six Hollow men
         from the Tail for one week a year, so that Tojiniso-xola of the caravanserai can be a wife. Last year Holmat walked
         into the fog wearing a dead man's homecoming. The memories are worn through: this is the last year.
         Endings: 'last' (one last week, then take them out at the fog's edge and burn them) / 'stay' (leave the dead in
         the Hollow for good) / 'wax' (take them out today and give the tumars to Tojiniso) / 'sell' (sell them to the Rabat
         customs; the money goes to the widow and the Hollow families).
     qm1 The Seventh Drift (Salt Mines → Bazaar → Tail → Salt Mines)
         The pink salt of the Seventh Drift counts three for one, and takes from the hewer what it gives: Eshmat paid nine
         years in eleven months and lost his daughter's wedding. Nasim sells it on the Bazaar as "salt of Old Yodgor",
         twenty tilla a pinch; it is Eshmat's own memory. His daughter Munisa begged him to go in: her mother has a year.
         Endings: 'go' (go home light) / 'buy' (buy back the rest of the block and let him eat it) / 'seal' (bring the
         drift down: eight more years) / 'share' (make the overseer write a tenth of every pinch to the hewer).
   The two touch: in qm1 Nasim sells the caravan if qr1 ended 'sell'; Durdona notices the pink salt is gone if qm1 ended 'seal'.
   Flags: SIDE.flag('qr1_*'), SIDE.flag('qm1_*'). Epilogue slides borrow 'davron:led' and 'tail:dig'. Test: node test/s9_qsalt.js */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, br = FAC.br, sf = SIDE.flag, cl = FAC.cl, cat3 = FAC.cat3;
  const sado = () => (typeof sadoAwake === 'function' && sadoAwake());
  const sd = text => () => (sado() ? ['sado', text] : null);
  const day = () => { try { return (G.WORLD2.S() && G.WORLD2.S().day) || 1; } catch (e) { return 1; } };
  const since = id => (q(id).day ? day() - q(id).day : 0);

  /* ================================================================================================ qr1 · THE SAME CARAVAN */
  CAST.qr_durdona = { name: `Durdona, a salt-raker's girl|Дурдона, дочь сборщика соли|Tuz yig'uvchining qizi Durdona`, portrait: null };
  CAST.qr_yoldosh = { name: `Yo'ldosh, caravan-bashi|Караван-баши Юлдаш|Karvonboshi Yo'ldosh`, portrait: null };
  CAST.qr_ilyos = { name: `Ilyos|Ильяс|Ilyos`, portrait: null };
  CAST.qr_bashorat = { name: `Bashorat|Башорат|Bashorat`, portrait: null };
  CAST.qr_rajab = { name: `Rajab, a Singer thrown out of the Cloister|Раджаб, изгнанный из Обители певец|Xonaqohdan haydalgan xonanda Rajab`, portrait: null };
  CAST.qr_tojiniso = { name: `Tojiniso-xola, keeper of the caravanserai|Тожинисо-хола, хозяйка караван-сарая|Karvonsaroy bekasi Tojiniso xola`, portrait: null };
  const LKR = {
    durdona: { body: 'woman', robe: '#c8b89a', trim: '#e8e0d0', skin: '#c09070', head: 'scarf', headC: '#e8e4dc', scale: 0.72 },
    yoldosh: { body: 'man', robe: '#8a5a32', trim: '#3a5a8a', skin: '#b08060', head: 'turban', headC: '#e0d4b8', beard: 'full', sash: '#3a5a8a' },
    ilyos: { body: 'man', robe: '#6a6a66', trim: '#8a8a84', skin: '#a8988a', head: 'doppi', headC: '#3a3a38' },
    bashorat: { body: 'woman', robe: '#5a6a7a', trim: '#a8b0b8', skin: '#b88a6a', head: 'scarf', headC: '#c8c0b0' },
    rajab: { body: 'man', robe: '#d8d4c8', trim: '#9a9488', skin: '#c8a888', head: 'none', beard: 'thin' },
    tojiniso: { body: 'woman', robe: '#7a3a32', trim: '#e2b452', skin: '#b88a64', head: 'scarf', headC: '#f0e8d8', pat: 'ikat' }
  };
  SIDE.quest('qr1', { n: 24, title: `The Same Caravan|Тот же караван|O'sha karvon`, where: ['rabat', 'qr1_well'] });
  FAC.spot('rabat', 'qr1_fog', 0.05);
  FAC.spot('rabat', 'qr1_chai', 0.22);
  FAC.spot('rabat', 'qr1_well', 0.47);
  FAC.spot('rabat', 'qr1_back', 0.58);
  FAC.spot('rabat', 'qr1_camp', 0.77);
  FAC.spot('tail', 'qr1_bath', 0.42);
  const A = k => sf('qr1_' + k);
  const setA = (k, v) => sf('qr1_' + k, v === undefined ? 1 : v);
  const rAll = () => A('bashi') && A('sister') && A('fog') && A('rajab');
  const rWhere = () => (!A('bashi') ? ['rabat', 'qr1_camp'] : !A('sister') ? ['tail', 'qr1_bath'] : !A('rajab') ? ['rabat', 'qr1_back'] : !A('fog') ? ['rabat', 'qr1_fog'] : ['rabat', 'qr1_chai']);
  const rStep = text => FAC.stepTo('qr1', rAll() ? cat3(text, ' ', `Now go to Tojiniso-xola at the chaikhana.|Теперь к Тожинисо-холе, в чайхану.|Endi choyxonaga, Tojiniso xolaning oldiga.`) : text, rWhere());

  /* ---------------------------------------------------------------- where they are */
  FAC.npc('qr_durdona', { name: CAST.qr_durdona.name, look: LKR.durdona, dx: 8, prompt: `Talk to the girl|Поговорить с девочкой|Qizcha bilan gaplashish`, idle: `A girl with salt-white hands counts camels on her fingers and frowns.|Девочка с белыми от соли руками считает верблюдов на пальцах и хмурится.|Qo'llari tuzdan oppoq qizcha barmoqlarida tuya sanab, qovog'ini soladi.` },
    () => [{ from: 6, to: 20, region: 'rabat', spot: 'qr1_well' }]);
  FAC.npc('qr_yoldosh', { name: CAST.qr_yoldosh.name, look: LKR.yoldosh, dx: -6, prompt: `Talk to the caravan-bashi|Поговорить с караван-баши|Karvonboshi bilan gaplashish`, idle: `The caravan-bashi laughs at something. A beat later five drovers laugh too, together.|Караван-баши над чем-то смеётся. Через миг смеются и пятеро погонщиков, разом.|Karvonboshi nimagadir kuladi. Bir lahzadan keyin beshta tuyakash ham birdaniga kuladi.` },
    () => (act('qr1') || (done('qr1') && br('qr1') === 'stay') ? [{ from: 6, to: 23, region: 'rabat', spot: 'qr1_camp' }] : []));
  FAC.npc('qr_ilyos', { name: CAST.qr_ilyos.name, look: LKR.ilyos, dx: 14, prompt: `Look at the Hollow man|Посмотреть на Пустого|Bo'sh odamga qarash`, idle: `A Hollow man sits on the bathhouse step. Now and then his lips move, as if he were counting camels.|Пустой сидит на ступеньке бани. Иногда шевелит губами, будто считает верблюдов.|Bo'sh odam hammom zinasida o'tiribdi. Ba'zan lablari qimirlaydi — go'yo tuya sanayotgandek.` },
    () => (done('qr1') && br('qr1') !== 'stay' && since('qr1') >= 1 ? [{ from: 6, to: 21, region: 'tail', spot: 'qr1_bath' }] : []));
  FAC.npc('qr_bashorat', { name: CAST.qr_bashorat.name, look: LKR.bashorat, dx: -6, prompt: `Talk to the woman with the broom|Поговорить с женщиной с метлой|Supurgili ayol bilan gaplashish`, idle: `A woman sweeps the same three bathhouse steps, again and again.|Женщина метёт одни и те же три ступени бани, раз за разом.|Bir ayol hammomning o'sha uchta zinasini qayta-qayta supuryapti.` },
    () => (act('qr1') || done('qr1') ? [{ from: 6, to: 21, region: 'tail', spot: 'qr1_bath' }] : []));
  FAC.npc('qr_rajab', { name: CAST.qr_rajab.name, look: LKR.rajab, dx: 0, prompt: `Talk to the thin man|Поговорить с худым человеком|Ozg'in odam bilan gaplashish`, idle: `A thin man in a Singer's robe with the hem cut off drinks alone and hums, off key, on purpose.|Худой человек в халате певца со споротой каймой пьёт один и напевает — нарочно мимо нот.|Etagi so'kib olingan xonanda chakmonidagi ozg'in odam yolg'iz ichib, ataylab noto'g'ri xirgoyi qilyapti.` },
    () => ((act('qr1') && (A('sister') || A('fog'))) || done('qr1') ? [{ from: 8, to: 23, region: 'rabat', spot: 'qr1_back' }] : []));
  FAC.npc('qr_tojiniso', { name: CAST.qr_tojiniso.name, look: LKR.tojiniso, dx: 4, prompt: `Talk to the keeper of the caravanserai|Поговорить с хозяйкой караван-сарая|Karvonsaroy bekasi bilan gaplashish`, idle: `The keeper of the caravanserai plucks a chicken and sings under her breath, a girl's song.|Хозяйка караван-сарая ощипывает курицу и напевает себе под нос девичью песню.|Karvonsaroy bekasi tovuq yulib, ohista qizlar qo'shig'ini xirgoyi qilyapti.` },
    () => {
      const b = br('qr1');
      if (done('qr1') && ((b === 'last' && since('qr1') >= 1) || (b === 'wax' && since('qr1') >= 2))) return [{ from: 6, to: 22, region: 'rabat', spot: 'qr1_fog' }];
      return [{ from: 6, to: 22, region: 'rabat', spot: 'qr1_chai' }];
    });

  /* ---------------------------------------------------------------- 1 · the girl at the well */
  const qrOffer = d => play([
    ['', `A girl of ten or eleven sits on the rim of the well with a rake across her knees. Her hands are white to the wrist from the flats.|На краю колодца сидит девочка лет десяти-одиннадцати, поперёк колен грабли. Руки до запястий белые от солончака.|Quduq labida o'n-o'n bir yoshlardagi qizcha o'tiribdi, tizzasida tirma. Qo'llari bilagigacha sho'rxokdan oppoq.`],
    ['qr_durdona', `The caravan came last night. Yo'ldosh-bashi's. It comes every autumn on the same night, and the whole Rabat cooks for a week.|Вчера ночью пришёл караван. Юлдаш-баши. Он приходит каждую осень в одну и ту же ночь, и весь Рабат неделю стряпает.|Kecha kechasi karvon keldi. Yo'ldosh karvonboshiniki. Har kuzda bir xil kechada keladi, butun Rabot bir hafta qozon osadi.`],
    ['qr_durdona', `Grown-ups say he brings luck. He never gets older. Neither do his drovers. Mother says it's the good water on the road.|Взрослые говорят, он приносит удачу. Он не стареет. И погонщики его не стареют. Мама говорит, это от хорошей воды в дороге.|Kattalar u omad olib keladi, deydi. U qarimaydi. Tuyakashlari ham qarimaydi. Oyim buni yo'ldagi yaxshi suvdan deydi.`],
    ['qr_durdona', `But Qo'chqor the drover had a black beard last year, and this year it's red. And he told me the same joke about the three-legged camel. Word for word. And laughed like he'd just made it up.|Только у погонщика Кучкара в прошлом году борода была чёрная, а в этом рыжая. И он рассказал мне ту же байку про трёхногого верблюда. Слово в слово. И засмеялся, будто сам только что придумал.|Lekin tuyakash Qo'chqorning soqoli o'tgan yili qora edi, bu yil malla. Uch oyoqli tuya haqidagi o'sha latifani aytdi. So'zma-so'z. Xuddi hozir o'ylab topgandek kuldi.`],
    sd(`A beard can change colour. A joke doesn't stay that fresh for a year.|Борода может поменять цвет. А шутка год свежей не пролежит.|Soqolning rangi o'zgarishi mumkin. Lekin hazil bir yil yangiligicha turmaydi.`)
  ], () => hub(`Durdona|Дурдона|Durdona`, [
    { label: `— Who is Yo'ldosh-bashi?|— Кто такой Юлдаш-баши?|— Yo'ldosh karvonboshi kim o'zi?`, lines: [
      ['qr_durdona', `Tojiniso-xola's husband. She keeps the caravanserai. All year she grumbles, and the week he's here she sings.|Муж Тожинисо-холы. Она держит караван-сарай. Весь год ворчит, а неделю, пока он здесь, поёт.|Tojiniso xolaning eri. Xola karvonsaroyni yuritadi. Yil bo'yi to'ng'illaydi, u kelgan haftasi esa qo'shiq aytadi.`]
    ] },
    { label: `— Why tell a yodchi?|— А почему ты говоришь это ёдчи?|— Nega buni yodchiga aytyapsan?`, lines: [
      ['qr_durdona', `Because you count people. Mother says yodchis count everybody twice. So count them.|Потому что ты считаешь людей. Мама говорит, ёдчи всех по два раза пересчитывают. Вот и посчитай их.|Chunki sen odam sanaysan. Oyim aytadi, yodchilar hammani ikki marta sanaydi. Mana, ularni sana.`]
    ] }
  ], [
    { id: 'yes', label: `"Where are they camped?"|«Где они встали?»|«Qayerga qo'nishgan?»` },
    { id: 'no', label: `"Some people tell the same joke all their lives."|«Некоторые всю жизнь одну байку рассказывают.»|«Ba'zilar umr bo'yi bitta latifani aytadi.»` }
  ], o => {
    if (o.id !== 'yes') { play([['qr_durdona', `Grandfather did. He's dead now. His beard never went red.|Дедушка вот рассказывал. Он умер. А борода у него рыжей так и не стала.|Bobom ham aytardi. U o'lgan. Soqoli hech qachon malla bo'lmagan.`]], d); return; }
    FAC.begin('qr1', `Durdona, a salt-raker's girl, says Yo'ldosh-bashi's caravan comes to the Rabat every autumn on the same night, and nobody in it gets older. The camp is past the minaret.|Дурдона, дочь сборщика соли, говорит: караван Юлдаш-баши приходит в Рабат каждую осень в одну и ту же ночь, и никто в нём не стареет. Лагерь за минаретом.|Tuz yig'uvchining qizi Durdona aytadi: Yo'ldosh karvonboshining karvoni har kuzda bir xil kechada Rabotga keladi, unda hech kim qarimaydi. Qo'nalg'a minoradan narida.`, ['rabat', 'qr1_camp']);
    play([['qr_durdona', `Past the minaret. Six camels. Don't eat the lamb, it makes you sleepy.|За минаретом. Шесть верблюдов. Баранину не ешь, от неё в сон клонит.|Minoradan narida. Oltita tuya. Go'shtidan yema, uyqu bosadi.`]], d);
  }));

  /* ---------------------------------------------------------------- 2 · the camp */
  const qrCamp = d => play([
    ['', `Six camels kneel in a ring. Six drovers sit round a fire bigger than it needs to be, laughing. Every pack is sewn shut with the same blue thread.|Шесть верблюдов лежат кругом. Шесть погонщиков сидят у костра, который мог бы быть и поменьше, и смеются. Все тюки зашиты одной и той же синей ниткой.|Oltita tuya doira bo'lib cho'kkan. Oltita tuyakash keragidan katta gulxan atrofida kulib o'tiribdi. Hamma yuklar bir xil ko'k ip bilan tikilgan.`],
    ['qr_yoldosh', `A yodchi! Sit, sit. We paid our forty days at the gate, every copper. Eat with us? Tojiniso's lamb. Nobody makes it like her.|Ёдчи! Садись, садись. Свои сорок дней мы у ворот уплатили, до медяка. Поешь с нами? Баранина Тожинисо. Так, как она, никто не готовит.|Yodchi! O'tir, o'tir. Qirq kunimizni darvozada to'laganmiz, bir chaqasigacha. Biz bilan ovqatlanasanmi? Tojinisoning go'shti. Uningdek hech kim pishirolmaydi.`]
  ], () => hub(`Yo'ldosh-bashi|Юлдаш-баши|Yo'ldosh karvonboshi`, [
    { label: `— Where have you come from?|— Откуда идёте?|— Qayerdan kelyapsizlar?`, lines: [
      ['qr_yoldosh', `From Merv, by the Salt Road, past the white flats. Thirty-one days. Water's always good on our road.|Из Мерва, Соляной дорогой, мимо белых солончаков. Тридцать один день. Вода на нашей дороге всегда хорошая.|Marvdan, Tuz yo'li bilan, oq sho'rxoklar yonidan. O'ttiz bir kun. Bizning yo'lda suv doim yaxshi.`]
    ] },
    { label: `— How long have you been married?|— Давно ты женат?|— Uylanganingga ko'p bo'ldimi?`, lines: [
      ['qr_yoldosh', `To Tojiniso? Six years this spring. She was twenty when I took her. Twenty-six now, and prettier every autumn.|На Тожинисо? Весной шесть лет. Взял её двадцатилетней. Теперь ей двадцать шесть, и что ни осень, то краше.|Tojinisogami? Bahorda olti yil bo'ladi. Yigirma yoshida olganman. Hozir yigirma oltida, har kuz chiroyliroq.`],
      ['hero', `Tojiniso-xola is past fifty.|Тожинисо-холе за пятьдесят.|Tojiniso xola ellikdan oshgan.`],
      ['', `He smiles at you as if you'd said something kind.|Он улыбается тебе так, будто ты сказал что-то доброе.|U senga go'yo yaxshi gap aytgandek jilmayadi.`]
    ] },
    { label: `— When do you leave?|— Когда уходите?|— Qachon jo'naysizlar?`, lines: [
      ['qr_yoldosh', `On the seventh night. West, into the white, before dawn. We always go that way. It's the shortest.|На седьмую ночь. На запад, в белое, до рассвета. Мы всегда этим путём ходим. Он самый короткий.|Yettinchi kechasi. G'arbga, oqlikka, tong otmasdan. Doim shu yo'ldan yuramiz. Eng qisqasi shu.`]
    ] }
  ], [
    { id: 'go', label: `"Thanks for the lamb."|«Спасибо за баранину.»|«Go'sht uchun rahmat.»` }
  ], () => qrCampAsk(d, {})));
  const qrCampAsk = (d, tried) => ask(`He laughs, and the other five laugh a beat later, all together.|Он смеётся, и остальные пятеро смеются на миг позже, все разом.|U kuladi, qolgan beshovi bir lahza keyin, birdaniga kulishadi.`, [
    FAC.craft('taste', `the salt on the packs|соль на тюках|yuklardagi tuzni`, { id: 'salt' }),
    FAC.craft('taste', `Yo'ldosh himself|самого Юлдаша|Yo'ldoshning o'zini`, { id: 'him' }),
    tried.again ? null : FAC.chk('mem', 4, `"Tell me about the road once more. From the first well."|«Расскажи про дорогу ещё раз. С первого колодца.»|«Yo'lni yana bir bor gapirib ber. Birinchi quduqdan boshlab.»`, { id: 'again' }, `Listen|Вслушаться|Quloq solish`),
    tried.cord ? null : FAC.chk('collection', 2, `Look at the cord round his neck.|Присмотреться к шнурку у него на шее.|Bo'ynidagi ipga razm solish.`, { id: 'cord' }, `Yodchi's eye|Глаз ёдчи|Yodchi ko'zi`)
  ], o => {
    const after = () => {
      setA('bashi');
      play([
        A('cord') ? null : ['', `When he bends to the fire, a clay token on a cord swings out of his collar: the Tail's water mark, Bathhouse Lane.|Когда он наклоняется к огню, из-за ворота выскальзывает глиняная бирка на шнурке: водяная метка Хвоста, Банный переулок.|U olovga engashganda yoqasidan ipga osilgan sopol belgi chiqib qoladi: Dumning suv belgisi, Hammom ko'chasi.`],
        cl('surayyo', `That's my token. I hand them out myself. Turn eleven is Bashorat's house. Her brother Ilyos is Hollow. He couldn't tell a camel from a donkey.|Это моя бирка. Сама раздаю. Одиннадцатая очередь — дом Башорат. Её брат Ильяс Пустой. Он верблюда от осла не отличит.|Bu mening belgim. O'zim tarqataman. O'n birinchi navbat — Bashoratning uyi. Ukasi Ilyos Bo'sh. U tuyani eshakdan ajratolmaydi.`),
        cl('alp', `Alp knows that laugh. A man laughs like that when he's been told he is happy.|Алп знает этот смех. Так смеётся человек, которому сказали, что он счастлив.|Alp bu kulgini taniydi. Senga baxtlisan deb aytilgan odam shunday kuladi.`)
      ], () => { rStep(`Yo'ldosh-bashi tells his road word for word, as if reading it, and wears the Tail's water token from Bathhouse Lane, turn eleven. Someone in the Tail must know him by another name.|Юлдаш-баши рассказывает свою дорогу слово в слово, как по писаному, а на шее у него водяная бирка Хвоста: Банный переулок, очередь одиннадцатая. Кто-то в Хвосте должен знать его под другим именем.|Yo'ldosh karvonboshi o'z yo'lini yozilgandek so'zma-so'z aytadi, bo'ynida esa Dumning suv belgisi: Hammom ko'chasi, o'n birinchi navbat. Dumda kimdir uni boshqa ism bilan bilishi kerak.`); d(); });
    };
    if (o.id === 'salt') {
      FAC.taste([
        ['memory', `This camp, thirty autumns ago. The same six camels, the same blue thread. A young woman with a ladle laughs at a black-bearded man: "Seven nights, Yo'ldosh, and then you leave me again."|Этот лагерь, тридцать осеней назад. Те же шесть верблюдов, та же синяя нитка. Молодая женщина с половником смеётся над чернобородым: «Семь ночей, Юлдаш, а потом ты опять меня бросишь».|Shu qo'nalg'a, o'ttiz kuz oldin. O'sha oltita tuya, o'sha ko'k ip. Cho'mich ushlagan yosh ayol qora soqolli erkakka kuladi: «Yetti kecha, Yo'ldosh, keyin yana tashlab ketasan».`],
        ['memory', `The seventh night. Fog on the flats, thick as milk. The caravan walks into it singing. A boy runs after them and comes back alone, white with salt to the eyebrows.|Седьмая ночь. На солончаках туман, густой, как молоко. Караван уходит в него с песней. Следом бежит мальчишка и возвращается один, белый от соли до бровей.|Yettinchi kecha. Sho'rxokda sutdek quyuq tuman. Karvon unga qo'shiq aytib kirib ketadi. Ortidan bir bola yuguradi va yolg'iz qaytadi — qoshigacha tuzga belangan.`],
        sd(`Thirty years. And he says six.|Тридцать лет. А он говорит — шесть.|O'ttiz yil. U esa olti deydi.`)
      ], () => { setA('old'); after(); }, { intro: `You lick a finger and touch the crust on a pack. The salt remembers the road better than the drovers do.|Облизываешь палец и касаешься соляной корки на тюке. Соль помнит дорогу лучше погонщиков.|Barmog'ingni yalab, yukdagi tuz qatlamiga tegizasan. Tuz yo'lni tuyakashlardan yaxshiroq eslaydi.` });
      return;
    }
    if (o.id === 'him') {
      FAC.taste([
        ['memory', `Yo'ldosh sits in him badly, like a coat cut for broader shoulders. The memories are thin as old muslin: you can see light through them.|Юлдаш сидит в нём плохо, как кафтан с чужого, более широкого плеча. Память тонкая, как старая кисея: сквозь неё видно свет.|Yo'ldosh unga yomon o'tirgan — birovning kengroq yelkasiga bichilgan to'ndek. Xotira eski dokadek yupqa: ichidan yorug'lik ko'rinadi.`],
        ['memory', `And under the muslin there's nothing. Not darkness. Nothing at all, the way only the Hollow are empty.|А под кисеёй ничего. Не темнота. Совсем ничего — так пусты только Пустые.|Dokaning tagida esa hech narsa yo'q. Qorong'ilik ham emas. Umuman hech narsa — faqat Bo'shlar shunday bo'm-bo'sh bo'ladi.`]
      ], () => { setA('hollow'); after(); }, { person: true, intro: `You touch his temple as if brushing off salt. He goes on smiling.|Касаешься его виска, будто стряхиваешь соль. Он продолжает улыбаться.|Tuz qoqayotgandek uning chakkasiga tegasan. U jilmayishda davom etadi.` });
      return;
    }
    if (o.id === 'again' && o.ok) {
      setA('hollow');
      play([
        ['qr_yoldosh', `"...From Merv, past the white flats, thirty-one days, water's always good on our road."|«…Из Мерва, мимо белых солончаков, тридцать один день, вода на нашей дороге всегда хорошая».|«…Marvdan, oq sho'rxoklar yonidan, o'ttiz bir kun, bizning yo'lda suv doim yaxshi».`],
        ['', `Word for word. Even the little pause before "always".|Слово в слово. Даже та же заминка перед «всегда».|So'zma-so'z. «Doim» oldidagi to'xtash ham o'sha-o'sha.`],
        ['hero', `Nobody tells a road the same way twice. Unless it isn't his road.|Никто не рассказывает дорогу дважды одинаково. Если только дорога не чужая.|Hech kim yo'lni ikki marta bir xil gapirmaydi. Agar yo'l birovniki bo'lmasa.`]
      ], after);
      return;
    }
    if (o.id === 'cord' && o.ok) {
      setA('cord');
      play([['hero', `A clay water token. Not a caravan's: the Tail's. The mirab's stamp, Bathhouse Lane, turn eleven. Men from Merv don't queue for the Tail's water.|Глиняная водяная бирка. Не караванная — хвостовская. Печать мираба, Банный переулок, очередь одиннадцатая. Люди из Мерва в Хвосте за водой не стоят.|Sopol suv belgisi. Karvonniki emas — Dumniki. Mirob muhri, Hammom ko'chasi, o'n birinchi navbat. Marvliklar Dumda suv navbatiga turmaydi.`]], after);
      return;
    }
    play([['qr_yoldosh', `More tea? You look tired, yodchi. Roads are long, but ours is the shortest.|Ещё чаю? Устал ты, ёдчи. Дороги длинные, а наша самая короткая.|Yana choy? Charchagan ko'rinasan, yodchi. Yo'llar uzun, bizniki eng qisqasi.`]], () => {
      const t2 = Object.assign({}, tried); t2[o.id] = 1;
      if (t2.again && t2.cord) after(); else qrCampAsk(d, t2);
    });
  });

  /* ---------------------------------------------------------------- 3 · the sister on Bathhouse Lane */
  const qrSister = d => play([
    ['', `A woman sweeps the bathhouse steps, the same three steps, over and over. Beside her leans a second broom, a man's. Nobody uses it.|Женщина метёт ступени бани, одни и те же три ступени, раз за разом. Рядом прислонена вторая метла, мужская. Ею никто не метёт.|Bir ayol hammom zinasini supuryapti, o'sha uchta zinani qayta-qayta. Yonida ikkinchi, erkaklar supurgisi suyab qo'yilgan. Uni hech kim ishlatmaydi.`],
    ['qr_bashorat', `Ilyos? He's working. A woman from the Rabat hires him every autumn. Twenty tilla for a week. Twenty! I sweep a whole year for that.|Ильяс? На заработках. Каждую осень его нанимает женщина из Рабата. Двадцать тилла за неделю. Двадцать! Я за такие деньги год мету.|Ilyosmi? Ishda. Har kuzda Rabotdan bir ayol uni yollaydi. Bir haftaga yigirma tilla. Yigirma! Men bunga bir yil supuraman.`]
  ], () => hub(`Bashorat|Башорат|Bashorat`, [
    { label: `— What's he like when he comes back?|— Каким он возвращается?|— Qanday bo'lib qaytadi?`, lines: [
      ['qr_bashorat', `The same. Hollow. He sits where I put him and eats what I give him.|Таким же. Пустым. Сидит, куда посажу, ест, что дам.|O'sha-o'sha. Bo'sh. Qayerga o'tqazsam o'tiradi, nima bersam yeydi.`],
      ['qr_bashorat', `Only for two or three days he hums. A drovers' song, for camels. And once he called me Tojiniso. Then it passes.|Только два-три дня напевает. Песню погонщиков, верблюжью. А однажды назвал меня Тожинисо. Потом проходит.|Faqat ikki-uch kun xirgoyi qiladi. Tuyakashlar qo'shig'ini. Bir marta meni Tojiniso deb chaqirdi. Keyin o'tib ketadi.`]
    ] },
    { label: `— Who takes him away?|— Кто его уводит?|— Uni kim olib ketadi?`, lines: [
      ['qr_bashorat', `Tojiniso-xola comes with a Singer. A thin one, voice like a cracked pot. He puts a hand on their heads and they follow him like lambs. Six of them, from our lane and the next.|Тожинисо-хола приходит с певцом. Худой такой, голос как треснутый горшок. Кладёт им руку на голову, и они идут за ним, как ягнята. Шестерых, с нашего переулка и с соседнего.|Tojiniso xola bir xonanda bilan keladi. Ozg'in, ovozi darz ketgan xumdek. Boshlariga qo'lini qo'yadi, ular qo'zichoqdek ergashib ketishadi. Oltitasini, bizning ko'cha bilan qo'shnisidan.`]
    ] },
    { label: `— Do they all come back?|— Все возвращаются?|— Hammasi qaytadimi?`, lines: [
      ['qr_bashorat', `...Holmat didn't. Last autumn. His wife got forty tilla and a story about a fever on the road. She bought a goat. Don't look at me like that. It was forty tilla.|…Холмат не вернулся. Прошлой осенью. Жене дали сорок тилла и сказали: лихорадка в дороге. Она козу купила. Не смотри так. Сорок тилла всё-таки.|…Holmat qaytmadi. O'tgan kuzda. Xotiniga qirq tilla berib, yo'lda bezgak tutdi, deyishdi. U echki oldi. Bunday qarama. Qirq tilla-ya, axir.`]
    ] }
  ], [
    { id: 'promise', label: `"I'll bring Ilyos home. As he is."|«Я верну Ильяса домой. Каким есть.»|«Ilyosni uyga qaytaraman. Qanday bo'lsa, shunday.»` },
    { id: 'look', label: `"I'm not promising anything. I want to see who sings them."|«Ничего не обещаю. Хочу посмотреть, кто их поёт.»|«Hech narsa va'da qilmayman. Ularni kim kuylashini ko'rmoqchiman.»` }
  ], o => {
    setA('sister'); setA('promise', o.id === 'promise' ? 1 : 0);
    play([
      o.id === 'promise'
        ? ['qr_bashorat', `As he is. Yes. ...And the twenty tilla? Who'll give me the twenty tilla?|Каким есть. Да. …А двадцать тилла? Кто мне отдаст двадцать тилла?|Qanday bo'lsa. Ha. …Yigirma tilla-chi? Yigirma tillani kim beradi?`]
        : ['qr_bashorat', `Look all you like. Just don't break the work. Winter's coming.|Смотри сколько хочешь. Только работу не сломай. Зима на носу.|Xohlaganingcha qara. Faqat ishni buzma. Qish yaqin.`],
      cl('surayyo', `Bashorat-opa. ...She never told me. Twenty tilla a year, and not a word to the mirab.|Башорат-опа. …Мне она не говорила. Двадцать тилла в год — и мирабу ни слова.|Bashorat opa. …Menga aytmagan. Yiliga yigirma tilla — mirobga bir og'iz ham.`)
    ], () => { rStep(`Yo'ldosh-bashi is Ilyos, a Hollow man from Bathhouse Lane. Every autumn Tojiniso-xola hires six Hollow from the Tail, and a Singer with a cracked voice leads them off. Last year Holmat didn't come back.|Юлдаш-баши — это Ильяс, Пустой с Банного переулка. Каждую осень Тожинисо-хола нанимает в Хвосте шестерых Пустых, а певец с треснутым голосом их уводит. В прошлом году не вернулся Холмат.|Yo'ldosh karvonboshi aslida Hammom ko'chasidagi Bo'sh Ilyos. Har kuzda Tojiniso xola Dumdan oltita Bo'shni yollaydi, darz ovozli bir xonanda ularni olib ketadi. O'tgan yili Holmat qaytmadi.`); d(); });
  }));

  /* ---------------------------------------------------------------- 4 · the edge of the fog */
  const qrFog = d => play([
    ['', `Past the last cairn the flats go white, and then the air does. The fog lies on the salt like milk on a plate and doesn't stir in the wind.|За последним каменным столбиком солончак белеет, а за ним белеет и воздух. Туман лежит на соли, как молоко на тарелке, и ветер его не шевелит.|Oxirgi tosh uyumidan narida sho'rxok oqaradi, undan keyin havo ham. Tuman tuz ustida likopchadagi sutdek yotibdi, shamol uni qimirlatmaydi.`],
    ['', `At the very edge, a drover's sandal in a crust of salt, as if its owner had stepped out of it and kept walking.|У самого края — чарык погонщика в соляной корке. Будто хозяин выступил из него и пошёл дальше.|Eng chetida tuz qotgan tuyakash chorig'i. Go'yo egasi undan chiqib, yo'lida davom etgandek.`],
    sd(`It's warm. Fog shouldn't be warm.|Он тёплый. Туман не должен быть тёплым.|U iliq. Tuman iliq bo'lmasligi kerak.`)
  ], () => qrFogAsk(d, {}));
  const qrFogAsk = (d, tried) => ask(`The fog breathes out, slowly, like someone asleep.|Туман медленно выдыхает, как спящий.|Tuman uxlayotgan odamdek sekin nafas chiqaradi.`, [
    FAC.craft('taste', `the sandal|чарык|chorig'ni`, { id: 'taste' }),
    tried.agi ? null : FAC.chk('agi', 5, `Walk in along the cairns, ten steps and back.|Пройти вдоль столбиков в туман — десять шагов и обратно.|Tosh uyumlari bo'ylab tumanga kirish — o'n qadam va orqaga.`, { id: 'agi' }),
    { id: 'rope', price: 10, label: `Buy a rope from a salt-raker, tie it to the last cairn and go in on it.|Купить у сборщика соли верёвку, привязать к последнему столбику и идти по ней.|Tuz yig'uvchidan arqon olib, oxirgi uyumga bog'lab, u bilan kirish.` }
  ], o => {
    const found = () => {
      setA('fog');
      play([
        cl('alp', `Alp sent men into places like this. Alp told them there was a house on the other side.|Алп отправлял людей в такие места. Алп говорил им, что на той стороне дом.|Alp odamlarni shunaqa joylarga yuborgan. Alp ularga narigi tomonda uy bor, degan.`),
        cl('nargiza', `It hums. Can't you hear it? Low, like the Well before a feeding. ...Let's not stand here.|Он гудит. Слышишь? Низко, как Колодец перед кормлением. …Давай тут не стоять.|U g'uvillayapti. Eshityapsanmi? Pastdan, xuddi oziqlantirish oldidagi Quduqdek. …Bu yerda turmaylik.`)
      ], () => { rStep(`At the edge of the fog last autumn, a Hollow drover called Holmat walked into the white believing he was going home to Tojiniso. Someone with a cracked voice tried to stop him, too late.|Прошлой осенью на краю тумана Пустой погонщик Холмат ушёл в белое: думал, что идёт домой, к Тожинисо. Кто-то с треснутым голосом пытался его остановить — слишком поздно.|O'tgan kuzda tuman chetida Bo'sh tuyakash Holmat Tojinisoning oldiga, uyga ketyapman deb oqlikka kirib ketdi. Darz ovozli kimdir uni to'xtatmoqchi bo'ldi — juda kech.`); d(); });
    };
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `Last autumn. A drover walks into the white, smiling; the sandal stays behind. "Tojiniso, put the kettle on, I'm nearly home."|Прошлая осень. Погонщик идёт в белое и улыбается, чарык остался позади. «Тожинисо, ставь чайник, я почти дома».|O'tgan kuz. Tuyakash jilmayib oqlikka kirib boryapti, chorig'i ortda qoldi. «Tojiniso, choyni qo'y, uyga yetay deb qoldim».`],
        ['memory', `Behind him a cracked voice, too late: "Holmat! Not you, Holmat, stop! That isn't your house!"|Позади треснутый голос, слишком поздно: «Холмат! Не тебе, Холмат, стой! Это не твой дом!»|Ortidan darz ketgan ovoz, juda kech: «Holmat! Senga emas, Holmat, to'xta! Bu sening uying emas!»`]
      ], found, { intro: `You crouch and lay your palm on the crust of the sandal. The salt keeps footsteps the way wax keeps voices.|Присаживаешься и кладёшь ладонь на соляную корку чарыка. Соль хранит шаги, как воск — голоса.|Cho'kkalab, kaftingni chorig'dagi tuz qatlamiga qo'yasan. Tuz qadamlarni mum ovozni saqlagandek saqlaydi.` });
      return;
    }
    if (o.id === 'agi' && !o.ok) {
      play([['', `Three steps in, the white closes over your head and you can't tell up from down. You get out on your knees, feeling for the cold of the cairn.|Через три шага белое смыкается над головой, и непонятно, где верх, где низ. Выбираешься на коленях, на ощупь — по холоду каменного столбика.|Uch qadamdan keyin oqlik boshing uzra yopiladi, qayer tepa, qayer past — bilib bo'lmaydi. Tizzalab, tosh uyumining sovug'ini paypaslab chiqasan.`]], () => qrFogAsk(d, { agi: 1 }));
      return;
    }
    play([
      ['', `Ten steps in, the salt underfoot turns warm and soft. Something in you wants to keep walking: there's a lit window ahead, and someone calling you in to supper. You count your steps back. Eleven. You went in ten.|Через десять шагов соль под ногами становится тёплой и мягкой. Что-то в тебе хочет идти дальше: впереди светится окно и кто-то зовёт ужинать. Считаешь шаги обратно. Одиннадцать. Входил ты на десять.|O'n qadamdan keyin oyoq ostidagi tuz iliq va yumshoq bo'lib qoladi. Ichingdagi nimadir oldinga intiladi: oldinda chiroqli deraza, kimdir ovqatga chaqiryapti. Orqaga sanaysan. O'n bir qadam. Kirganingda o'nta edi.`],
      ['', `At your feet lies a clay token on a cord: Bathhouse Lane, turn nine. And a waterskin, half full. Whoever he was, he wasn't thirsty.|У ног лежит глиняная бирка на шнурке: Банный переулок, очередь девятая. И бурдюк, полный наполовину. Кто бы это ни был, пить ему не хотелось.|Oyog'ing ostida ipli sopol belgi yotibdi: Hammom ko'chasi, to'qqizinchi navbat. Yana yarmigacha to'la mesh. Kim bo'lmasin, u chanqamagan.`]
    ], found);
  });
  FAC.prop('rabat', 'qr1_fog', { id: 'qr1fog', art: 'f6glint', dx: -10, prompt: `Go to the edge of the fog|Подойти к краю тумана|Tuman chetiga borish`, when: () => act('qr1') && A('bashi') && !A('fog'), use: d => qrFog(d) });

  /* ---------------------------------------------------------------- 5 · the Singer in the back room */
  const qrRajab = d => play([
    ['', `A back room of the caravanserai. A thin man in a Singer's robe with the indigo hem cut off sits over a bowl of wine. Six empty tumars hang on a nail, waiting.|Задняя комната караван-сарая. Худой человек в халате певца со споротой синей каймой сидит над чашей вина. На гвозде висят шесть пустых тумаров — ждут.|Karvonsaroyning orqa xonasi. Ko'k hoshiyasi so'kib olingan xonanda chakmonidagi ozg'in odam bir kosa sharob ustida o'tiribdi. Mixda oltita bo'sh tumar osig'liq — kutyapti.`],
    ['qr_rajab', `A yodchi. They sent a yodchi for me, not the Singers. That's almost flattering.|Ёдчи. За мной прислали ёдчи, а не Певцов. Почти лестно.|Yodchi. Mening ortimdan Xonandalarni emas, yodchini yuborishibdi. Xushomadga o'xshaydi.`]
  ], () => ask(`He looks at you over the bowl and says nothing.|Он смотрит на тебя поверх чаши и молчит.|U kosa ustidan senga qaraydi va indamaydi.`, [
    A('fog') ? { id: 'holmat', label: `"Holmat. At the edge of the fog. I heard you shouting after him."|«Холмат. На краю тумана. Я слышал, как ты кричал ему вслед.»|«Holmat. Tuman chetida. Ortidan qichqirganingni eshitdim.»` } : null,
    FAC.chk('backbone', 4, `"A Singer thrown out of the Cloister, planting memories for money. The Cloister would love your name. Talk to me instead."|«Изгнанный певец впевает память за деньги. Обитель будет рада узнать твоё имя. Лучше поговори со мной.»|«Xonaqohdan haydalgan xonanda pulga xotira joylayapti. Xonaqoh isming bilan juda qiziqadi. Yaxshisi men bilan gaplash.»`, { id: 'press' }),
    FAC.chk('song', 3, `Hum the first line of a planting song, wrong, and wait for him to correct it.|Напеть первую строку песни вселения — с ошибкой — и ждать, когда он поправит.|Joylash qo'shig'ining birinchi satrini xato xirgoyi qilib, uning to'g'rilashini kutish.`, { id: 'song' }),
    { id: 'pay', price: 15, label: `Pour him another bowl and pay for the jug.|Налить ему ещё чашу и заплатить за кувшин.|Unga yana bir kosa quyib, ko'zaning pulini to'lash.` }
  ], o => {
    const ok = o.id === 'holmat' || o.id === 'pay' || o.ok;
    if (ok && o.id !== 'pay') setA('ally');
    const open = {
      holmat: ['qr_rajab', `...You were there. Then you've heard the worst of me already. Sit. I'll tell you the rest, it's lighter.|…Ты там был. Значит, худшее обо мне ты уже слышал. Садись. Остальное расскажу, оно полегче.|…Sen u yerda bo'lding. Demak, men haqimdagi eng yomonini eshitding. O'tir. Qolganini aytaman, u yengilroq.`],
      press: ['qr_rajab', `The Cloister. Yes, they'd love it. ...You'd do it, too. You have the face. Ask.|Обитель. Да, они будут рады. …И ты ведь сделаешь. Лицо у тебя такое. Спрашивай.|Xonaqoh. Ha, ular xursand bo'ladi. …Sen buni qilasan ham. Yuzing shunaqa. So'ra.`],
      song: ['qr_rajab', `No, no. "Into the empty house, the water comes first." Water first, then the name. ...Who taught you that? Never mind. Ask.|Нет, нет. «В пустой дом сперва входит вода». Сперва вода, потом имя. …Кто тебя учил? Неважно. Спрашивай.|Yo'q, yo'q. «Bo'sh uyga avval suv kiradi». Avval suv, keyin ism. …Seni kim o'rgatgan? Mayli. So'ra.`],
      pay: ['qr_rajab', `A whole jug. You're a generous yodchi, or a cunning one. Doesn't matter. Ask.|Целый кувшин. Щедрый ты ёдчи или хитрый. Неважно. Спрашивай.|Butun bir ko'za. Saxiy yodchisan yo ayyor. Farqi yo'q. So'ra.`]
    };
    const first = ok ? open[o.id] : ['qr_rajab', `Threaten me with the Cloister? They threw me out for singing a dying man what he asked for. ...Ask, then. I'm tired of being the only one who knows.|Пугаешь меня Обителью? Меня оттуда выгнали за то, что спел умирающему то, о чём он просил. …Спрашивай уж. Надоело знать одному.|Meni Xonaqoh bilan qo'rqityapsanmi? Meni u yerdan o'layotgan odamga u so'ragan narsani kuylaganim uchun haydashgan. …So'rayver. Bir o'zim bilib yurishdan charchadim.`];
    play([first], () => hub(`Rajab|Раджаб|Rajab`, [
      { label: `— What do you do to them?|— Что ты с ними делаешь?|— Ularga nima qilasan?`, lines: [
        ['qr_rajab', `I sing six dead men into six empty ones. One week a year. They eat, they laugh, they sleep on a full belly. On the seventh night, at the fog's edge, I take the dead men out again.|Впеваю шестерых мёртвых в шестерых пустых. Неделя в году. Едят, смеются, спят на сытый живот. А на седьмую ночь, у края тумана, снова вынимаю мёртвых.|Oltita o'likni oltita bo'shga kuylab joylayman. Yilda bir hafta. Yeydi, kuladi, qorni to'q uxlaydi. Yettinchi kechasi esa, tuman chetida, o'liklarni yana chiqarib olaman.`]
      ] },
      { label: `— Where do the dead men's memories come from?|— Откуда у тебя память мёртвых?|— O'liklarning xotirasi senda qayerdan?`, lines: [
        ['qr_rajab', `The fog gave their tumars back the next spring. They lay on the salt in a row, like a debt paid. I was the boy who ran after the caravan. I picked them up.|Их тумары туман вернул следующей весной: лежали на соли рядком, как уплаченный долг. Я был тем мальчишкой, что бежал за караваном. Я их и подобрал.|Ularning tumarlarini tuman keyingi bahorda qaytardi: tuz ustida qator terilib yotardi, to'langan qarzdek. Karvon ortidan yugurgan bola men edim. Men terib oldim.`]
      ] },
      { label: `— Why do they walk into the fog?|— Почему они идут в туман?|— Nega ular tumanga kirib ketadi?`, lines: [
        ['qr_rajab', `Because the last thing those six remember is walking into it. A memory wants to reach its end.|Потому что последнее, что помнят те шестеро, — как они в него входят. Память хочет дойти до конца.|Chunki o'sha oltitaning eslaydigan oxirgi narsasi — unga kirib ketishi. Xotira oxiriga yetgisi keladi.`],
        ['qr_rajab', `And this is the last year. They're worn thin as muslin. After this week there'll be nothing left to sing but the names.|И это последний год. Они протёрлись до кисеи. После этой недели петь будет нечего, одни имена.|Bu oxirgi yil ham. Ular dokadek titilib ketgan. Bu haftadan keyin kuylashga hech narsa qolmaydi, faqat ismlar.`]
      ] },
      { label: `— And Holmat?|— А Холмат?|— Holmat-chi?`, lines: [
        ['qr_rajab', `I was slow. One bowl too many, and he was already smiling. You can't take a memory out of a smiling man, it holds on. ...I paid his wife. Out of my own share.|Я замешкался. Выпил лишнюю чашу, а он уже улыбался. Из улыбающегося память не вынешь — держится. …Жене его я заплатил. Из своей доли.|Kechikdim. Bir kosa ortiqcha ichgandim, u esa allaqachon jilmayib turardi. Jilmayayotgan odamdan xotirani chiqarib bo'lmaydi — yopishib oladi. …Xotiniga to'ladim. O'z ulushimdan.`]
      ] }
    ], [
      { id: 'go', label: `"Tojiniso-xola decides this, then."|«Значит, решать Тожинисо-холе.»|«Demak, qaror Tojiniso xolada.»` }
    ], () => {
      setA('rajab');
      play([
        ['qr_rajab', `Her and you, it seems. Whatever the two of you say, I'll sing. I'm good for nothing else.|Ей и тебе, как я погляжу. Что вы двое скажете, то и спою. Больше я ни на что не годен.|Unga va senga, shekilli. Ikkovingiz nima desangiz, shuni kuylayman. Boshqa narsaga yaramayman.`],
        cl('nargiza', `"Into the empty house, the water comes first." They taught us that in the first year. For the Well. Not for this.|«В пустой дом сперва входит вода». Нас этому учили в первый год. Для Колодца. Не для такого.|«Bo'sh uyga avval suv kiradi». Bizga buni birinchi yili o'rgatishgan. Quduq uchun. Bunaqasi uchun emas.`)
      ], () => { rStep(`Rajab, a Singer thrown out of the Cloister, once the boy who ran after the lost caravan, sings six drovers lost in the fog thirty years ago into six Hollow men, one week a year. The memories are worn through.|Раджаб, изгнанный из Обители певец, а когда-то мальчишка, бежавший за пропавшим караваном, раз в год на неделю впевает шестерых погонщиков, сгинувших в тумане тридцать лет назад, в шестерых Пустых. Память протёрлась.|Xonaqohdan haydalgan xonanda Rajab — bir paytlar yo'qolgan karvon ortidan yugurgan bola — o'ttiz yil oldin tumanda yo'qolgan oltita tuyakashni yilda bir hafta oltita Bo'shga kuylab joylaydi. Xotira titilib bo'lgan.`); d(); });
    }));
  }));

  /* ---------------------------------------------------------------- 6 · Tojiniso-xola */
  const qrEnd = d => play([
    ['', `Tojiniso-xola is plucking a chicken behind the chaikhana and singing under her breath. She is fifty-six, and the song is a young girl's.|Тожинисо-хола ощипывает курицу за чайханой и напевает себе под нос. Ей пятьдесят шесть, а песня девичья.|Tojiniso xola choyxona ortida tovuq yulib, ohista xirgoyi qilyapti. Ellik oltida, qo'shig'i esa qizlarniki.`],
    ['qr_tojiniso', `You've been to the camp. And to the fog, by your boots. And to Rajab, by your face. Sit. I'll say it before you do.|Ты был в лагере. И у тумана — по сапогам видно. И у Раджаба — по лицу. Садись. Я скажу раньше тебя.|Qo'nalg'ada bo'lding. Tuman yonida ham — etigingdan bilinib turibdi. Rajabnikida ham — yuzingdan. O'tir. Sendan oldin o'zim aytaman.`],
    ['qr_tojiniso', `Thirty years I waited for a caravan that went into the white. Then Rajab came back from the Cloister with six tumars and a sin to sell. One week a year, I'm a wife.|Тридцать лет я ждала караван, который ушёл в белое. Потом Раджаб вернулся из Обители с шестью тумарами и грехом на продажу. Одну неделю в году я жена.|O'ttiz yil oqlikka kirib ketgan karvonni kutdim. Keyin Rajab Xonaqohdan oltita tumar va sotiladigan gunoh bilan qaytdi. Yilda bir hafta men xotinman.`],
    ['qr_tojiniso', `Six empty men eat lamb, wash, laugh, sleep under a blanket. Their families get twenty tilla each. The Rabat gets a feast and calls it luck. Tell me who loses.|Шестеро пустых едят баранину, моются, смеются, спят под одеялом. Их семьи получают по двадцать тилла. Рабат получает праздник и зовёт его удачей. Скажи мне, кто в проигрыше.|Oltita bo'sh odam go'sht yeydi, yuvinadi, kuladi, ko'rpa ostida uxlaydi. Oilalari yigirma tilladan oladi. Rabot bayram qiladi va buni omad deydi. Ayt-chi, kim yutqazyapti.`]
  ], () => hub(`Tojiniso-xola|Тожинисо-хола|Tojiniso xola`, [
    { label: `— Holmat lost.|— Холмат проиграл.|— Holmat yutqazdi.`, lines: [
      ['qr_tojiniso', `Holmat. Yes. I paid his widow. And every evening I go to the edge and tell the fog his name, so it knows it took the wrong man. That's all I can do. That, and not stop.|Холмат. Да. Вдове я заплатила. А к краю хожу каждый вечер и говорю туману его имя — пусть знает, что взял не того. Больше ничего не могу. Разве что не останавливаться.|Holmat. Ha. Bevasiga to'ladim. Har kech tuman chetiga borib, unga uning ismini aytaman — bilsin, noto'g'ri odamni olganini. Qo'limdan boshqa hech narsa kelmaydi. To'xtamaslikdan boshqa.`]
    ] },
    { label: `— Rajab says this is the last year.|— Раджаб говорит, это последний год.|— Rajab bu oxirgi yil, deydi.`, lines: [
      ['qr_tojiniso', `I know. This year he called me Bashorat. Twice. Next year he'd call me nothing at all.|Знаю. В этом году он назвал меня Башорат. Дважды. А на следующий вообще никак не назовёт.|Bilaman. Bu yil meni Bashorat deb chaqirdi. Ikki marta. Kelasi yil umuman chaqirmaydi.`],
      ['qr_tojiniso', `So it's this week, yodchi. It's all I have left of him, and I'm asking you not to take it in the middle.|Так что всё решается на этой неделе, ёдчи. Больше у меня от него ничего нет, и я прошу не отнимать это на середине.|Demak, hammasi shu hafta, yodchi. Undan menda boshqa hech narsa qolmadi. O'rtasida tortib olma, deb so'rayman.`]
    ] },
    { label: `— You waved a ladle at him thirty years ago.|— Тридцать лет назад ты махала ему половником.|— O'ttiz yil oldin unga cho'mich silkitgansan.`, if: () => !!A('old'), lines: [
      ['qr_tojiniso', `I was twenty. I told him: seven nights, and then you leave me again. He laughed. He always laughed at that.|Мне было двадцать. Я сказала: семь ночей, а потом ты опять меня бросишь. Он засмеялся. Он всегда над этим смеялся.|Yigirma yoshda edim. Unga: yetti kecha, keyin yana tashlab ketasan, dedim. U kuldi. Doim shunga kulardi.`]
    ] }
  ], [
    { id: 'decide', label: `"Listen to me now."|«Теперь послушай меня.»|«Endi meni eshit.»` }
  ], () => play([
    cl('alp', `Alp would take a dead man's name, if someone offered. It's better than no name. ...Alp is not sure that is a good thing to say.|Алп взял бы имя мёртвого, если бы дали. Лучше, чем никакого. …Алп не уверен, что так можно говорить.|Alpga o'likning ismini berishsa, olardi. Hech qanday ismdan yaxshi. …Alp buni aytish mumkinmi, bilmaydi.`),
    cl('nargiza', `Singing a man into an empty body: the Order calls it a sin and does it every Night of Payment. I hate that I understand her.|Впевать человека в пустое тело — Орден называет это грехом и сам делает каждую Ночь Уплаты. Ненавижу, что я её понимаю.|Bo'sh tanaga odam kuylab joylash — Orden buni gunoh deydi-yu, o'zi har To'lov kechasi qiladi. Uni tushunayotganimdan nafratlanaman.`),
    cl('surayyo', `Those are my people. Hollow or not. They have sisters who sweep the steps for them. Remember that when you choose.|Это мои люди. Пустые или нет. У них есть сёстры, которые метут за них ступени. Помни об этом, когда будешь решать.|Ular mening odamlarim. Bo'shmi, yo'qmi. Ularning o'rniga zina supuradigan opa-singillari bor. Tanlayotganingda shuni esla.`),
    sd(`She sings while he's here. Durdona said so. I keep thinking about that.|Пока он здесь, она поёт. Дурдона так сказала. Всё думаю об этом.|U kelganda xola qo'shiq aytarkan. Durdona shunday dedi. Shu haqda o'ylayveraman.`)
  ], () => ask(`Behind the chaikhana the drovers laugh, all six, a beat apart.|За чайханой смеются погонщики — все шестеро, вразнобой на полмига.|Choyxona ortida tuyakashlar kulishyapti — oltovi ham, bir lahza farq bilan.`, [
    { id: 'last', label: `"Have your week. On the seventh night I'll stand at the fog with Rajab, take them out myself, and burn what's left."|«Догуляй свою неделю. На седьмую ночь я встану у тумана рядом с Раджабом, сам выну их и сожгу, что останется.»|«Haftangni o'tkazib ol. Yettinchi kechasi Rajab bilan tuman yonida turaman, ularni o'zim chiqarib olaman va qolganini yoqaman.»` },
    { id: 'stay', label: `"Then don't take them out. Let them stay Yo'ldosh and the others. Six men with names, for as long as the names hold."|«Тогда не вынимайте. Пусть остаются Юлдашем и остальными. Шесть человек с именами — пока имена держатся.»|«Unda chiqarib olmanglar. Yo'ldosh va boshqalar bo'lib qolaversin. Ismli olti kishi — ismlar ushlab turguncha.»` },
    FAC.craft('take', `the six out of them today, into wax, and give her the tumars|шестерых из них сегодня же, в воск, и отдать ей тумары|oltitasini bugunoq ulardan mumga olib, tumarlarni unga berish`, { id: 'wax' }),
    { id: 'sell', label: `"The customs pays for old roads. I'll sell the six; the money goes to Holmat's widow and the Hollow. Nothing for you, and nothing for the fog."|«Таможня платит за старые дороги. Продам шестерых, деньги — вдове Холмата и Пустым. Тебе ничего, но и туману ничего.»|«Bojxona eski yo'llar uchun pul to'laydi. Oltitasini sotaman, puli — Holmatning bevasiga va Bo'shlarga. Senga hech narsa, tumanga ham hech narsa.»` }
  ], o => {
    const fin = (lines, text) => play(lines, () => { FAC.finish('qr1', o.id, text); d(); });
    if (o.id === 'last') {
      const ally = !!A('ally');
      if (!ally) addVoid(3, `six worn lives, burned|шесть стёртых жизней, сожжённых|yoqilgan oltita titilgan umr`);
      rep('rabat', 1); rep('tail', 1); FAC.react({ nargiza: 5, surayyo: 5, alp: -5 }, 'qr1');
      fin([
        ['qr_tojiniso', `Seven nights. This time I'll be the one who says "and then you leave me". I've had thirty years to practise.|Семь ночей. В этот раз «а потом ты меня бросишь» скажу я. У меня было тридцать лет потренироваться.|Yetti kecha. Bu safar «keyin tashlab ketasan» deb men aytaman. Mashq qilishga o'ttiz yilim bor edi.`],
        ['', `The seventh night. At the fog's edge six men smile and walk forward; one by one they stop, blink, and are nobody again. What comes out of them is thin as breath. It burns with almost no light.|Седьмая ночь. У края тумана шестеро улыбаются и идут вперёд; один за другим останавливаются, моргают — и снова никто. То, что из них выходит, тонкое, как дыхание. Горит почти без света.|Yettinchi kecha. Tuman chetida olti kishi jilmayib oldinga yuradi; birin-ketin to'xtaydi, ko'zini pirpiratadi — va yana hech kim. Ulardan chiqqan narsa nafasdek yupqa. Deyarli yorug'liksiz yonadi.`],
        ally ? ['', `It's Rajab who sings them out, and when the last one goes, his cracked voice goes with it. He opens his mouth and only breath comes.|Выпевает их Раджаб, и вместе с последним уходит его треснутый голос. Он открывает рот, а выходит одно дыхание.|Ularni Rajab kuylab chiqaradi, oxirgisi bilan uning darz ovozi ham ketadi. Og'zini ochadi — faqat nafas chiqadi.`] : null,
        sd(`Six men came, and nobody went into the fog. That's something, isn't it?|Пришли шестеро, и в туман никто не ушёл. Это ведь уже что-то?|Olti kishi keldi, tumanga hech kim kirib ketmadi. Bu ham nimadir, a?`)
      ], `You gave Tojiniso-xola her last week, then took the six drovers out at the fog's edge and burned them. The Hollow went home to the Tail, empty, with twenty tilla each. There'll be no caravan next autumn.|Ты дал Тожинисо-холе её последнюю неделю, а потом у края тумана вынул шестерых погонщиков и сжёг. Пустые вернулись в Хвост — пустыми, с двадцатью тилла каждый. Следующей осенью каравана не будет.|Tojiniso xolaga oxirgi haftasini berding, keyin tuman chetida oltita tuyakashni chiqarib olib, yoqding. Bo'shlar Dumga bo'm-bo'sh, har biri yigirma tilla bilan qaytdi. Kelasi kuz karvon kelmaydi.`);
    } else if (o.id === 'stay') {
      rep('rabat', 2); rep('tail', -2); FAC.react({ alp: 10, surayyo: -15, nargiza: -5 }, 'qr1');
      fin([
        ['qr_tojiniso', `...Thank you. Don't say anything else. Just that: thank you.|…Спасибо. Больше ничего не говори. Просто: спасибо.|…Rahmat. Boshqa hech narsa dema. Shunchaki: rahmat.`],
        ['', `Rajab sings a long low line into each of the six, like a knot at the end of a thread. The drovers laugh a beat apart, then all together.|Раджаб пропевает в каждого из шестерых долгую низкую строку — как узелок на конце нитки. Погонщики смеются вразнобой, а потом разом.|Rajab oltitasining har biriga uzun, past satr kuylaydi — ip uchiga tugilgan tugundek. Tuyakashlar avval bir lahza farq bilan, keyin birdaniga kulishadi.`],
        cl('surayyo', `Bashorat will hear this from me, not from the street. That's the least I owe her.|Башорат услышит это от меня, а не от улицы. Это меньшее, что я ей должна.|Bashorat buni ko'chadan emas, mendan eshitadi. Unga qarzim shu, eng kamida.`)
      ], `You let the six dead drovers stay in the six Hollow men for good. Tojiniso-xola has a husband again, for as long as the worn memories hold. Ilyos won't be coming home to Bathhouse Lane.|Ты оставил шестерых мёртвых погонщиков в шестерых Пустых насовсем. У Тожинисо-холы снова есть муж — пока держится стёртая память. Ильяс на Банный переулок не вернётся.|Oltita o'lik tuyakashni oltita Bo'shda butunlay qoldirding. Tojiniso xolaning yana eri bor — titilgan xotira ushlab turguncha. Ilyos Hammom ko'chasiga qaytmaydi.`);
    } else if (o.id === 'wax') {
      addVoid(4, `six dead men, taken in daylight|шесть мертвецов, вынутых днём|kunduzi olingan olti o'lik`); rep('tail', 2); rep('rabat', -1); FAC.react({ surayyo: 10, nargiza: -5, alp: -10 }, 'qr1');
      fin([
        ['', `You take them out one by one in the yard, in daylight, with the whole Rabat watching. Six tumars, light as dry leaves. Six men sit down where they stood and look at their hands.|Ты вынимаешь их одного за другим во дворе, днём, на глазах у всего Рабата. Шесть тумаров, лёгких, как сухие листья. Шестеро садятся, где стояли, и смотрят на свои руки.|Ularni hovlida, kunduzi, butun Rabotning ko'z o'ngida birma-bir chiqarib olasan. Quruq barglardek yengil oltita tumar. Olti kishi turgan joyida o'tirib qoladi va qo'llariga qaraydi.`],
        ['qr_tojiniso', `Give them here. ...All six. I'll keep them myself. I'll taste him once a night and not a minute more. I'll be careful.|Давай сюда. …Все шесть. Сама буду хранить. Буду пить его раз в ночь, и ни минутой дольше. Я осторожно.|Ber bu yoqqa. …Oltitasini ham. O'zim saqlayman. Uni kechasiga bir marta totaman, bir daqiqa ham ortiq emas. Ehtiyot bo'laman.`],
        sd(`Once a night. That's how it starts for everyone at the Bazaar.|Раз в ночь. На Базаре у всех так начинается.|Kechasiga bir marta. Bozorda hammada shunday boshlanadi.`)
      ], `You took the six drovers out of the Hollow in daylight and gave the tumars to Tojiniso-xola. The Hollow went home. She'll taste her husband alone, until there's nothing left to taste.|Ты днём вынул шестерых погонщиков из Пустых и отдал тумары Тожинисо-холе. Пустые ушли домой. Мужа она будет пить одна, пока пить будет нечего.|Oltita tuyakashni kunduzi Bo'shlardan chiqarib olib, tumarlarni Tojiniso xolaga berding. Bo'shlar uyga ketdi. Erini endi u yolg'iz totadi — totishga hech narsa qolmaguncha.`);
    } else {
      addVoid(4, `six dead men, sold by weight|шесть мертвецов, проданных на вес|tarozida sotilgan olti o'lik`); gold(30); rep('divan', 1); rep('rabat', -2); rep('tail', 1); FAC.react({ surayyo: 5, nargiza: -10, alp: -5 }, 'qr1');
      fin([
        ['', `The customs clerk at the Rabat gate weighs the six tumars on a jeweller's scale and pays without haggling. "Old roads sell," he says. "Worn ones best of all. They don't frighten anybody."|Таможенный писарь у ворот Рабата взвешивает шесть тумаров на ювелирных весах и платит не торгуясь. «Старые дороги хорошо идут, — говорит он. — Стёртые лучше всего: никого не пугают».|Rabot darvozasidagi bojxona mirzasi oltita tumarni zargar tarozisida tortadi va savdolashmay to'laydi. «Eski yo'llar yaxshi o'tadi, — deydi u. — Titilganlari ayniqsa: hech kimni qo'rqitmaydi».`],
        ['', `Holmat's widow gets forty. Each Hollow family gets twenty. Rajab gets nothing and asks for nothing. Thirty is left in your hand.|Вдове Холмата сорок. Каждой семье Пустых по двадцать. Раджаб ничего не получает и ничего не просит. У тебя в руке остаётся тридцать.|Holmatning bevasiga qirq. Har bir Bo'shning oilasiga yigirmatadan. Rajab hech narsa olmaydi, hech narsa so'ramaydi. Qo'lingda o'ttiztasi qoladi.`],
        ['qr_tojiniso', `Sold. My husband, by weight. ...Get out of my yard, yodchi. Come back when you've buried someone yourself.|Продал. Моего мужа — на вес. …Уходи с моего двора, ёдчи. Придёшь, когда сам кого-нибудь похоронишь.|Sotding. Erimni — tarozida. …Hovlimdan chiq, yodchi. O'zing birovni ko'mganingda kelasan.`]
      ], `You took the six drovers out of the Hollow and sold the tumars to the Rabat customs. The money went to Holmat's widow and the Hollow families; thirty tilla stayed with you. Tojiniso-xola has nothing.|Ты вынул шестерых погонщиков из Пустых и продал тумары таможне Рабата. Деньги ушли вдове Холмата и семьям Пустых; тридцать тилла осталось у тебя. У Тожинисо-холы — ничего.|Oltita tuyakashni Bo'shlardan chiqarib, tumarlarni Rabot bojxonasiga sotding. Pul Holmatning bevasiga va Bo'shlarning oilalariga ketdi; o'ttiz tilla o'zingda qoldi. Tojiniso xolada esa hech narsa yo'q.`);
    }
  }))));

  /* ---------------------------------------------------------------- who says what, and later */
  FAC.talk.qr_durdona = d => {
    if (q('qr1').st === 'none') { qrOffer(d); return; }
    if (act('qr1')) { play([['qr_durdona', `Did you count them? Qo'chqor told me the camel joke again this morning. Same words.|Посчитал? Кучкар сегодня утром опять рассказал про верблюда. Теми же словами.|Sanadingmi? Qo'chqor bugun ertalab yana tuya haqidagi latifani aytdi. O'sha so'zlar bilan.`]], d); return; }
    const pink = done('qm1') && br('qm1') === 'seal';
    const L = {
      last: `"No caravan next year, Mother says. The Rabat's luck is gone." She doesn't look sorry. "Qo'chqor told me the camel joke one last time. I laughed for him."|«Мама говорит, на следующий год каравана не будет. Удача ушла из Рабата». Непохоже, чтобы она жалела. «Кучкар в последний раз рассказал про верблюда. Я за него посмеялась».|«Oyim aytadi, kelasi yil karvon kelmaydi. Rabotdan omad ketdi». Afsuslanayotganga o'xshamaydi. «Qo'chqor tuya haqidagi latifani oxirgi marta aytdi. Uning o'rniga men kuldim».`,
      stay: `"Qo'chqor's beard is going grey. The grown-ups say it's the water." She rolls her eyes.|«У Кучкара седеет борода. Взрослые говорят, от воды». Она закатывает глаза.|«Qo'chqorning soqoli oqaryapti. Kattalar suvdan deyishyapti». U ko'zlarini olaytiradi.`,
      wax: `"Tojiniso-xola talks to herself in a man's voice. Mother says don't go near her."|«Тожинисо-хола разговаривает сама с собой мужским голосом. Мама говорит, не подходи к ней».|«Tojiniso xola o'zi bilan erkak ovozida gaplashadi. Oyim yaqiniga borma, deydi».`,
      sell: `"The grown-ups say a yodchi sold the caravan. I said yodchis count, they don't sell. Was I wrong?"|«Взрослые говорят, караван продал ёдчи. Я сказала: ёдчи считают, а не продают. Я ошиблась?»|«Kattalar karvonni yodchi sotdi, deyishyapti. Men: yodchilar sanaydi, sotmaydi, dedim. Adashdimmi?»`
    }[br('qr1')];
    play([['', L || FAC.NPC.qr_durdona.def.idle], pink ? ['qr_durdona', `And the salt carts from the mines don't bring the pink salt any more. Only grey. Grey's boring.|А с шахт больше не возят розовую соль. Только серую. Серая скучная.|Konlardan endi pushti tuz olib kelishmayapti. Faqat kulrang. Kulrangi zerikarli.`] : null], d);
  };
  FAC.talk.qr_yoldosh = d => {
    if (act('qr1') && !A('bashi')) { qrCamp(d); return; }
    if (act('qr1')) { play([['qr_yoldosh', `"Seventh night, west, into the white. The shortest road." He hands you a bowl of tea you didn't ask for.|«На седьмую ночь, на запад, в белое. Самая короткая дорога». Он протягивает тебе пиалу чая, о которой ты не просил.|«Yettinchi kechasi, g'arbga, oqlikka. Eng qisqa yo'l». U so'ramasang ham senga bir piyola choy uzatadi.`]], d); return; }
    play([since('qr1') >= 2
      ? ['qr_yoldosh', `Yodchi! ...You were here last year, weren't you? Feels like every year. Sit. The lamb's Tojiniso's.|Ёдчи! …Ты ведь и в прошлом году был? Кажется, каждый год. Садись. Баранина от Тожинисо.|Yodchi! …O'tgan yili ham kelgandingmi? Har yili kelgandeksan. O'tir. Go'shtni Tojiniso pishirgan.`]
      : ['', `Yo'ldosh-bashi is teaching a camel its own name. The camel isn't learning, and neither, quite, is he.|Юлдаш-баши учит верблюда его собственному имени. Верблюд не запоминает. Да и сам он — не очень.|Yo'ldosh karvonboshi tuyaga o'z ismini o'rgatyapti. Tuya eslab qololmayapti. O'zi ham unchalik emas.`],
    since('qr1') >= 2 ? ['', `His temples have gone grey. They weren't a week ago.|Виски у него поседели. Неделю назад этого не было.|Chakkalari oqarib qolibdi. Bir hafta oldin bunday emasdi.`] : null], d);
  };
  FAC.talk.qr_ilyos = d => play([['', FAC.NPC.qr_ilyos.def.idle], br('qr1') === 'last' && A('ally') ? null : ['', `For a moment he hums three notes of a drovers' song. Then he forgets the fourth.|На миг он напевает три ноты погонщицкой песни. Четвёртую забывает.|Bir lahza tuyakashlar qo'shig'idan uchta nota xirgoyi qiladi. To'rtinchisini unutadi.`]], d);
  FAC.talk.qr_bashorat = d => {
    if (act('qr1') && A('bashi') && !A('sister')) { qrSister(d); return; }
    if (act('qr1') && A('sister')) { play([['qr_bashorat', A('promise') ? `You said you'd bring him home. I've cleared his corner.|Ты сказал, что вернёшь его. Я уже освободила его угол.|Uni qaytaraman, deding. Burchagini bo'shatib qo'ydim.` : `Did you find the Singer? Don't break the work, yodchi.|Нашёл певца? Работу не сломай, ёдчи.|Xonandani topdingmi? Ishni buzma, yodchi.`]], d); return; }
    if (!done('qr1')) { play([['', FAC.NPC.qr_bashorat.def.idle]], d); return; }
    const L = {
      last: `"He came home. He sits where I put him. He hummed for three days, now he doesn't. ...I'd got used to the humming, that's the trouble."|«Вернулся. Сидит, куда посажу. Три дня напевал, теперь перестал. …Привыкла я к этому напеву, вот беда».|«Qaytdi. Qayerga o'tqazsam o'tiradi. Uch kun xirgoyi qildi, endi qilmayapti. …O'sha xirgoyiga o'rganib qolibman, gap shunda».`,
      stay: A('promise') ? `"You said you'd bring him home. As he is." She says nothing else and goes on sweeping.|«Ты говорил, что вернёшь его домой. Каким есть». Больше она ничего не говорит и метёт дальше.|«Uni uyga qaytaraman, qanday bo'lsa shunday, degansan». Boshqa hech narsa demaydi va supurishda davom etadi.` : `"Tojiniso-xola sends twenty tilla every month now. Every month! ...I went to the Rabat once. He looked at me and said 'Good day, opa', the way drovers say it to every woman."|«Тожинисо-хола теперь каждый месяц шлёт двадцать тилла. Каждый месяц! …Я раз ходила в Рабат. Он посмотрел и сказал: "Здравствуй, хозяюшка" — так погонщики всем женщинам говорят».|«Tojiniso xola endi har oy yigirma tilla yuboradi. Har oy! …Bir marta Rabotga bordim. U menga qarab: "Assalomu alaykum, opa", dedi — tuyakashlar hamma ayolga shunday deydi».`,
      wax: `"He's home. The Rabat doesn't pay any more. Winter's coming." She looks at the second broom. "He can hold a broom. I'm teaching him."|«Дома. Рабат больше не платит. Зима на носу». Она смотрит на вторую метлу. «Метлу он держать может. Учу».|«Uyda. Rabot endi pul to'lamaydi. Qish yaqin». U ikkinchi supurgiga qaraydi. «Supurgi ushlay oladi. O'rgatyapman».`,
      sell: `"Twenty tilla from a yodchi's hand, and a story that it's from the customs. ...Holmat's wife bought a second goat. We're a rich lane now."|«Двадцать тилла из рук ёдчи и сказка, что это от таможни. …Жена Холмата купила вторую козу. Богатый у нас теперь переулок».|«Yodchining qo'lidan yigirma tilla va bu bojxonadan degan ertak. …Holmatning xotini ikkinchi echkini oldi. Ko'chamiz endi boy».`
    }[br('qr1')];
    play([['', L || FAC.NPC.qr_bashorat.def.idle]], d);
  };
  FAC.talk.qr_rajab = d => {
    if (act('qr1') && !A('rajab')) { qrRajab(d); return; }
    if (act('qr1')) { play([['qr_rajab', `Go to Tojiniso. I've said all I have. The rest is hers.|Иди к Тожинисо. Я всё сказал. Дальше — её дело.|Tojinisoning oldiga bor. Aytadiganimni aytdim. Qolgani — uning ishi.`]], d); return; }
    if (!done('qr1')) { play([['', FAC.NPC.qr_rajab.def.idle]], d); return; }
    const b = br('qr1');
    if (b === 'last' && A('ally')) { play([['', `Rajab nods to you over his bowl. He moves his lips; no sound comes. He raises the bowl to the west and drinks.|Раджаб кивает тебе поверх чаши. Шевелит губами — звука нет. Поднимает чашу в сторону запада и пьёт.|Rajab kosa ustidan senga bosh irg'aydi. Lablarini qimirlatadi — ovoz chiqmaydi. Kosani g'arb tomonga ko'tarib, ichadi.`]], d); return; }
    const L = {
      last: `Thirty years I owed them a proper end. You paid it. I'll drink to that. Once.|Тридцать лет я был должен им нормальный конец. Ты за меня заплатил. Выпью за это. Один раз.|O'ttiz yil ularga munosib oxir qarzdor edim. Sen men uchun to'lading. Shuning uchun ichaman. Bir marta.`,
      stay: `I sing a knot into each of them every new moon now, so they hold. I'm their Singer now. For good, it seems.|Теперь каждое новолуние я впеваю в каждого по узелку, чтобы держались. Я теперь их певец. Похоже, навсегда.|Endi har yangi oyda har biriga bittadan tugun kuylayman — ushlab tursin deb. Endi men ularning xonandasiman. Umrbod, shekilli.`,
      wax: `She asks me how long a tumar lasts if you taste it every night. I lie to her. Badly.|Она спрашивает, сколько протянет тумар, если пить его каждую ночь. Я ей вру. Плохо.|Har kecha totsang, tumar qancha chidaydi, deb so'raydi. Unga yolg'on gapiraman. Yomon.`,
      sell: `The customs sold the six to a Bazaar man the next morning. Somebody's son in the Ark will dream of Merv tonight.|Таможня наутро перепродала всех шестерых какому-то базарному. Сегодня ночью чей-нибудь сынок в Арке увидит во сне Мерв.|Bojxona ertasiga oltitasini Bozordagi bir odamga sotib yubordi. Bu kecha Arkda kimningdir o'g'li tushida Marvni ko'radi.`
    }[b];
    play([['qr_rajab', L || `…|…|…`]], d);
  };
  FAC.talk.qr_tojiniso = d => {
    if (act('qr1') && rAll()) { qrEnd(d); return; }
    if (act('qr1')) { play([['qr_tojiniso', `The lamb's on, the rice is washed, my husband's home. Don't spoil my week, yodchi. I've waited a year for it.|Баранина стоит, рис промыт, муж дома. Не порти мне неделю, ёдчи. Я её год ждала.|Go'sht qozonda, guruch yuvilgan, erim uyda. Haftamni buzma, yodchi. Uni bir yil kutganman.`]], d); return; }
    if (!done('qr1')) { play([['qr_tojiniso', `Forty rooms and a well, yodchi, and the tea's hot. In autumn there's lamb. Come in autumn.|Сорок комнат и колодец, ёдчи, и чай горячий. Осенью будет баранина. Приходи осенью.|Qirq xona va quduq, yodchi, choy issiq. Kuzda go'sht bo'ladi. Kuzda kel.`]], d); return; }
    const n = since('qr1');
    const L = {
      last: n >= 1 ? `At dusk Tojiniso-xola stands at the fog's edge with a lamp. "I tell it six names now. And Holmat. Seven nights, seven names. Then I go and cook for the next caravan. A real one."|В сумерках Тожинисо-хола стоит у края тумана с лампой. «Теперь говорю ему шесть имён. И Холмата. Семь ночей — семь имён. Потом пойду стряпать для следующего каравана. Настоящего».|Kech kirganda Tojiniso xola chiroq ushlab tuman chetida turibdi. «Endi unga oltita ism aytaman. Holmatni ham. Yetti kecha — yetti ism. Keyin navbatdagi karvonga ovqat qilgani ketaman. Haqiqiysiga».` : `Tojiniso-xola is singing as she cooks. Six nights to go.|Тожинисо-хола стряпает и поёт. Осталось шесть ночей.|Tojiniso xola ovqat qilib, qo'shiq aytyapti. Olti kecha qoldi.`,
      stay: `"He forgot the camels' names this morning. I told him. He thanked me like a stranger, then laughed like himself." She goes on kneading.|«Сегодня утром он забыл, как зовут верблюдов. Я подсказала. Поблагодарил, как чужой, а засмеялся, как свой». Она месит тесто дальше.|«Bugun ertalab tuyalarning ismini unutib qo'ydi. Aytib berdim. Begonadek rahmat aytdi, keyin o'zidek kuldi». U xamir qorishda davom etadi.`,
      wax: n >= 2 ? `Tojiniso-xola is thinner. She talks with someone else's pauses. "Seven nights, Tojiniso, and then I leave you." She laughs at it. Alone.|Тожинисо-хола похудела. Говорит с чужими паузами. «Семь ночей, Тожинисо, а потом я тебя брошу». И смеётся над этим. Одна.|Tojiniso xola ozib ketibdi. Birovning to'xtashlari bilan gapiradi. «Yetti kecha, Tojiniso, keyin seni tashlab ketaman». Bunga o'zi kuladi. Yolg'iz.` : `Tojiniso-xola holds a tumar to her lips and doesn't notice you.|Тожинисо-хола прижимает тумар к губам и тебя не замечает.|Tojiniso xola tumarni labiga bosib turibdi, seni sezmaydi.`,
      sell: `Tojiniso-xola turns her back as you pass and goes on sweeping the yard where the camels used to kneel.|Тожинисо-хола, завидев тебя, поворачивается спиной и метёт двор, где раньше лежали верблюды.|Tojiniso xola seni ko'rib, orqasini o'giradi va tuyalar cho'kadigan hovlini supurishda davom etadi.`
    }[br('qr1')];
    play([['', L || FAC.NPC.qr_tojiniso.def.idle]], d);
  };

  // the Rabat, a day or more later
  COMP.beat('qr1_back', () => done('qr1') && COMP.region() === 'rabat' && !COMP.inside() && since('qr1') >= 1, dn => {
    const T = {
      last: `The east rooms of the caravanserai stand open and aired. Nobody is cooking for a week. A real caravan from Kashgar is unloading at the well, all strangers, all older than last year.|Восточные комнаты караван-сарая открыты и проветрены. Неделю никто не стряпает. У колодца разгружается настоящий караван из Кашгара: все чужие, и все старше, чем в прошлом году.|Karvonsaroyning sharqiy xonalari ochiq, shamollatilgan. Bir hafta hech kim qozon osmayapti. Quduq yonida Qashg'ardan kelgan haqiqiy karvon yuk tushiryapti: hammasi begona, hammasi o'tgan yildagidan qariroq.`,
      stay: `The Rabat is still feasting. Somebody has hung a garland over the camp. One of the drovers sits apart, staring west, until Yo'ldosh-bashi calls him back to the fire.|Рабат всё ещё гуляет. Над лагерем повесили гирлянду. Один из погонщиков сидит в стороне и смотрит на запад, пока Юлдаш-баши не зовёт его обратно к огню.|Rabot hamon bayram qilyapti. Qo'nalg'a ustiga gulchambar osishibdi. Tuyakashlardan biri chetda o'tirib g'arbga tikilib qolgan, Yo'ldosh karvonboshi uni gulxanga chaqirmaguncha.`,
      wax: `The camp past the minaret is empty, the fire pit cold. Six camels have been sold to the customs. Through the caravanserai's window a woman laughs, alone, in a man's voice.|Лагерь за минаретом пуст, кострище остыло. Шесть верблюдов продали таможне. Из окна караван-сарая доносится женский смех — одинокий, на мужской лад.|Minoradan naridagi qo'nalg'a bo'm-bo'sh, gulxan o'rni sovigan. Oltita tuya bojxonaga sotilibdi. Karvonsaroy derazasidan yolg'iz ayolning erkakcha kulgisi eshitiladi.`,
      sell: `At the customs post a clerk is labelling six small parcels in a neat hand: "A road to Merv. Worn. Fragrant."|На таможенном посту писарь аккуратным почерком подписывает шесть маленьких свёртков: «Дорога до Мерва. Стёртая. Душистая».|Bojxona postida mirza chiroyli husnixat bilan oltita kichik tugunchaga yozuv yozyapti: «Marvgacha yo'l. Titilgan. Xushbo'y».`
    };
    play([['', T[br('qr1')] || T.last]], dn);
  });

  SIDE.epi('qr1', () => (!done('qr1') ? null : {
    last: `No autumn caravan ever came to the Rabat again. Tojiniso-xola kept the caravanserai another twenty years and said seven names to the fog every evening. Six men in the Tail sometimes hummed a drovers' song.|Осеннего каравана в Рабате больше не ждали. Тожинисо-хола держала караван-сарай ещё двадцать лет и каждый вечер говорила туману семь имён. Шестеро в Хвосте иногда напевали погонщицкую песню.|Rabotga boshqa hech qachon kuzgi karvon kelmadi. Tojiniso xola yana yigirma yil karvonsaroyni yuritdi va har kech tumanga yettita ism aytdi. Dumdagi olti kishi ba'zan tuyakashlar qo'shig'ini xirgoyi qilardi.`,
    stay: `Six drovers worked the Salt Road out of the Rabat for three more years, forgetting a little more each season. One by one they walked west into the white, smiling. Tojiniso-xola buried nobody and mourned six times.|Ещё три года шестеро погонщиков ходили из Рабата Соляной дорогой и с каждым сезоном забывали чуть больше. Один за другим они ушли на запад, в белое, улыбаясь. Тожинисо-хола никого не хоронила и шесть раз овдовела.|Olti tuyakash yana uch yil Rabotdan Tuz yo'li bilan qatnadi, har mavsum sal ko'proq unutib. Birin-ketin jilmayib g'arbga, oqlikka kirib ketishdi. Tojiniso xola hech kimni ko'mmadi-yu, olti marta beva qoldi.`,
    wax: `Tojiniso-xola tasted her husband every night until the six tumars were blank wax. The next autumn, on the seventh night, she walked into the fog smiling, with a ladle in her hand.|Тожинисо-хола пила мужа каждую ночь, пока шесть тумаров не стали чистым воском. На следующую осень, на седьмую ночь, она ушла в туман, улыбаясь, с половником в руке.|Tojiniso xola oltita tumar bo'm-bo'sh mumga aylanguncha har kecha erini totdi. Kelasi kuz, yettinchi kechasi, u qo'lida cho'mich bilan jilmayib tumanga kirib ketdi.`,
    sell: `The Rabat's caravan was sold by weight and dreamed in the Ark as "a road to Merv". Holmat's widow kept goats. Tojiniso-xola lived a long time and never let a yodchi through her gate.|Караван Рабата продали на вес, и в Арке его видели во сне как «дорогу до Мерва». Вдова Холмата держала коз. Тожинисо-хола прожила долго и ни разу не пустила за ворота ёдчи.|Rabot karvoni tarozida sotildi, Arkda uni «Marvgacha yo'l» deb tushida ko'rishdi. Holmatning bevasi echki boqdi. Tojiniso xola uzoq yashadi va darvozasidan biror yodchini kiritmadi.`
  }[br('qr1')] || null), 'davron:led');

  /* ================================================================================================ qm1 · THE SEVENTH DRIFT */
  CAST.qm_eshmat = { name: `Eshmat, a hewer|Забойщик Эшмат|Kesuvchi Eshmat`, portrait: null };
  CAST.qm_ochil = { name: `Ochil-boshi, overseer of the lower drifts|Очил-боши, надсмотрщик нижних штреков|Pastki lahmlar nazoratchisi Ochil boshi`, portrait: null };
  CAST.qm_nasim = { name: `Nasim the salt-seller|Насим, торговец солью|Tuzfurush Nasim`, portrait: null };
  CAST.qm_munisa = { name: `Munisa|Муниса|Munisa`, portrait: null };
  const LKM = {
    eshmat: { body: 'man', robe: '#6a625a', trim: '#c8a8a0', skin: '#a88068', head: 'doppi', headC: '#3a3430', beard: 'short', pat: 'patch' },
    ochil: { body: 'guard', robe: '#4a5a6a', trim: '#a8323a', skin: '#b08868', head: 'turban', headC: '#c8d0d8', beard: 'short', sash: '#a8323a' },
    nasim: { body: 'man', robe: '#e8c8c8', trim: '#c8a84a', skin: '#c8a080', head: 'turban', headC: '#f0e0e0', beard: 'long', sash: '#c8a84a', pat: 'stripes' },
    munisa: { body: 'woman', robe: '#8a3a4a', trim: '#e2b452', skin: '#c09070', head: 'scarf', headC: '#e8d8c8', pat: 'atlas' }
  };
  SIDE.quest('qm1', { n: 25, title: `The Seventh Drift|Седьмой штрек|Yettinchi lahm`, where: ['mines', 'qm1_drift'] });
  FAC.spot('mines', 'qm1_post', 0.26);
  FAC.spot('mines', 'qm1_drift', 0.9);
  FAC.spot('bazaar', 'qm1_stall', 0.48);
  FAC.spot('tail', 'qm1_house', 0.64);
  const M = k => sf('qm1_' + k);
  const setM = (k, v) => sf('qm1_' + k, v === undefined ? 1 : v);
  const mAll = () => M('wall') && M('tally') && M('stall') && M('munisa');
  const mWhere = () => (!M('wall') ? ['mines', 'qm1_drift'] : !M('tally') ? ['mines', 'qm1_post'] : !M('stall') ? ['bazaar', 'qm1_stall'] : !M('munisa') ? ['tail', 'qm1_house'] : ['mines', 'qm1_drift']);
  const mStep = text => FAC.stepTo('qm1', mAll() ? cat3(text, ' ', `Now go back to Eshmat at the Seventh Drift.|Теперь вернуться к Эшмату, к Седьмому штреку.|Endi Yettinchi lahmga, Eshmatning oldiga qaytish kerak.`) : text, mWhere());

  /* ---------------------------------------------------------------- where they are */
  FAC.npc('qm_eshmat', { name: CAST.qm_eshmat.name, look: LKM.eshmat, dx: -12, prompt: `Talk to the hewer|Поговорить с забойщиком|Kesuvchi bilan gaplashish`, idle: `A hewer sits at the mouth of a new drift with a tally stick across his knees, not cutting.|У входа в новый штрек сидит забойщик с биркой-зарубкой на коленях и не рубит.|Yangi lahm og'zida tizzasiga cho'p-belgi qo'ygan kesuvchi o'tiribdi, ishlamayapti.` },
    () => (done('qm1') && br('qm1') !== 'seal' && since('qm1') >= 1 ? [{ from: 6, to: 21, region: 'tail', spot: 'qm1_house' }] : [{ from: 5, to: 23, region: 'mines', spot: 'qm1_drift' }]));
  FAC.npc('qm_ochil', { name: CAST.qm_ochil.name, look: LKM.ochil, dx: -8, prompt: `Talk to the overseer|Поговорить с надсмотрщиком|Nazoratchi bilan gaplashish`, idle: `The overseer writes with his left hand and keeps his right in his sash. He has the calm face of a man who sleeps well.|Надсмотрщик пишет левой рукой, правую держит за кушаком. Лицо спокойное, как у человека, который хорошо спит.|Nazoratchi chap qo'li bilan yozadi, o'ngini belbog'iga tiqib olgan. Yuzi yaxshi uxlaydigan odamnikidek xotirjam.` },
    () => [{ from: 5, to: 22, region: 'mines', spot: 'qm1_post' }]);
  FAC.npc('qm_nasim', { name: CAST.qm_nasim.name, look: LKM.nasim, dx: 0, prompt: `Talk to the salt-seller|Поговорить с торговцем солью|Tuzfurush bilan gaplashish`, idle: `A salt-seller weighs pink salt into silk bags with a brass spoon, one pinch at a time.|Торговец медной ложечкой развешивает розовую соль по шёлковым мешочкам, по щепотке.|Tuzfurush mis qoshiqcha bilan pushti tuzni shoyi xaltachalarga chimdimlab tortyapti.` },
    () => [{ from: 7, to: 20, region: 'bazaar', spot: 'qm1_stall' }]);
  FAC.npc('qm_munisa', { name: CAST.qm_munisa.name, look: LKM.munisa, dx: 10, prompt: `Talk to the young woman|Поговорить с молодой женщиной|Yosh ayol bilan gaplashish`, idle: `A young woman with a mole by her lip hangs washing over a cradle in the shade.|Молодая женщина с родинкой у губы развешивает бельё над люлькой в тени.|Lab yonida xoli bor yosh ayol soyadagi beshik ustiga kir yoyyapti.` },
    () => {
      if (done('qm1') && br('qm1') === 'seal' && since('qm1') >= 2) return [{ from: 8, to: 18, region: 'mines', spot: 'qm1_post' }];
      return act('qm1') || done('qm1') ? [{ from: 6, to: 21, region: 'tail', spot: 'qm1_house' }] : [];
    });

  /* ---------------------------------------------------------------- 1 · the hewer */
  const qmOffer = d => play([
    ['', `At the end of the lowest gallery a new drift runs into the salt. The salt here is pink, veined like meat. A hewer sits at its mouth with a tally stick across his knees, not cutting.|В конце нижней галереи в соль уходит новый штрек. Соль здесь розовая, с прожилками, как мясо. У входа сидит забойщик с биркой-зарубкой на коленях и не рубит.|Eng pastki yo'lak oxirida tuz ichiga yangi lahm kirib ketgan. Bu yerda tuz pushti, go'shtdek tomirli. Lahm og'zida tizzasiga cho'p-belgi qo'ygan bir kesuvchi o'tiribdi, ishlamayapti.`],
    ['qm_eshmat', `Yodchi. You can read a debt. Read this. The overseer says it's paid. I had nine years. I've been eleven months in the Seventh Drift.|Ёдчи. Ты долги читать умеешь. Прочти. Надсмотрщик говорит: уплачено. У меня было девять лет. Одиннадцать месяцев я в Седьмом штреке.|Yodchi. Sen qarz o'qishni bilasan. O'qib ber. Nazoratchi: to'landi, deydi. Menda to'qqiz yil bor edi. O'n bir oydan beri Yettinchi lahmdaman.`],
    ['qm_eshmat', `I go up at the new moon. Home, to my daughter Munisa. She married five years ago. They let me up for a day, in chains.|На новолуние меня поднимают. Домой, к дочке, Мунисе. Её пять лет назад выдали замуж. Меня на день выпустили наверх, в цепях.|Yangi oyda meni yuqoriga chiqarishadi. Uyga, qizim Munisaning oldiga. Uni besh yil oldin uzatishgan. Meni bir kunga zanjirda yuqoriga chiqarishgan.`],
    ['qm_eshmat', `I remember the chains. I remember the guard ate two plates of pilaf. I don't remember her face under the veil. I had it a year ago. I'd swear I had it.|Цепи помню. Помню, стражник съел две тарелки плова. А её лица под свадебным покрывалом не помню. Год назад было. Поклясться могу, было.|Zanjirni eslayman. Soqchi ikki tovoq osh yeganini eslayman. Kelinlik pardasi ostidagi yuzini eslamayman. Bir yil oldin bor edi. Qasam ichaman, bor edi.`],
    sd(`He's holding that stick like it might bite him.|Он держит эту бирку так, будто она его укусит.|U bu cho'pni xuddi tishlab oladigandek ushlab turibdi.`)
  ], () => hub(`Eshmat|Эшмат|Eshmat`, [
    { label: `— What is the Seventh Drift?|— Что такое Седьмой штрек?|— Yettinchi lahm nima o'zi?`, lines: [
      ['qm_eshmat', `New. Pink salt. Every block counts for three. Volunteers only. Everybody volunteers.|Новый. Розовая соль. Каждый блок идёт за три. Только по желанию. Желают все.|Yangi. Pushti tuz. Har bir bo'lak uchtaga sanaladi. Faqat xohlaganlar. Hamma xohlaydi.`],
      ['qm_eshmat', `The men who come out of it are lighter, the others say. Lighter. As if that were a good word.|Кто из него выходит, те, говорят, полегче. Полегче. Будто это хорошее слово.|Undan chiqqanlar yengilroq bo'ladi, deyishadi. Yengilroq. Go'yo bu yaxshi so'zdek.`]
    ] },
    { label: `— Why not just go home?|— Почему бы просто не пойти домой?|— Nega shunchaki uyga ketmaysan?`, lines: [
      ['qm_eshmat', `I will. ...But I won't go to her with a hole where her wedding should be. Find out what the salt took. If it can be got back, get it back.|Пойду. …Только не пойду я к ней с дырой на месте её свадьбы. Узнай, что взяла соль. Если можно вернуть — верни.|Boraman. …Faqat uning to'yi turishi kerak bo'lgan joyda teshik bilan bormayman. Tuz nimani olganini bil. Qaytarsa bo'lsa — qaytar.`]
    ] }
  ], [
    { id: 'yes', label: `"Show me where you cut."|«Покажи, где ты рубишь.»|«Qayerda kesishingni ko'rsat.»` },
    { id: 'no', label: `"Go home. She'll tell you about it herself."|«Иди домой. Она сама тебе всё расскажет.»|«Uyga bor. O'zi senga hammasini aytib beradi.»` }
  ], o => {
    if (o.id !== 'yes') { play([['qm_eshmat', `She'll tell me, and I'll nod like a guest. No.|Расскажет, а я буду кивать, как гость. Нет.|Aytib beradi, men esa mehmondek bosh irg'ab o'tiraman. Yo'q.`]], d); return; }
    FAC.begin('qm1', `Eshmat, a hewer in the Salt Mines, paid off nine years in eleven months in the Seventh Drift and lost his daughter Munisa's wedding on the way. Find out what the pink salt takes.|Эшмат, забойщик Соляных шахт, за одиннадцать месяцев в Седьмом штреке отработал девять лет — и где-то по дороге потерял свадьбу дочери, Мунисы. Выяснить, что берёт розовая соль.|Tuz konlaridagi kesuvchi Eshmat Yettinchi lahmda o'n bir oyda to'qqiz yillik qarzini uzdi — va yo'l-yo'lakay qizi Munisaning to'yini yo'qotdi. Pushti tuz nimani olishini bilish kerak.`, ['mines', 'qm1_drift']);
    play([['qm_eshmat', `There. The wall at the end. Take the lamp. Don't look into it too long.|Вон. Стена в конце. Возьми лампу. Долго в неё не смотри.|Ana. Oxiridagi devor. Chiroqni ol. Unga uzoq tikilma.`]], d);
  }));

  /* ---------------------------------------------------------------- 2 · the pink wall */
  const qmWall = d => play([
    ['', `Lamplight goes into the pink salt and doesn't come back. Deep inside, things drift like leaves under ice: a hand, a kite, the hem of a red dress.|Свет лампы уходит в розовую соль и не возвращается. В глубине плывут, как листья подо льдом: рука, воздушный змей, край красного платья.|Chiroq nuri pushti tuzga kirib, qaytib chiqmaydi. Uning tubida muz ostidagi barglardek narsalar suzib yuribdi: qo'l, varrak, qizil ko'ylakning etagi.`],
    cl('nargiza', `It's singing. Very quietly, all of it at once, like a crowd behind a wall. ...Those are people. A lot of people.|Она поёт. Очень тихо, вся сразу, как толпа за стеной. …Это люди. Очень много людей.|U kuylayapti. Juda sekin, hammasi birdaniga, devor ortidagi olomondek. …Bular odamlar. Juda ko'p odamlar.`)
  ], () => qmWallAsk(d, {}));
  const qmWallAsk = (d, tried) => ask(`The salt is cool and slightly damp, like skin.|Соль прохладная и чуть влажная, как кожа.|Tuz salqin va biroz nam, xuddi teridek.`, [
    FAC.craft('taste', `the wall|стену|devorni`, { id: 'taste' }),
    tried.str ? null : FAC.chk('str', 5, `Take Eshmat's pick and cut a block yourself.|Взять кирку Эшмата и вырубить блок самому.|Eshmatning cho'kichini olib, bir bo'lakni o'zing kesish.`, { id: 'str' }),
    { id: 'pay', price: 5, label: `Give an old hewer five tilla for his story.|Дать старому забойщику пять тилла за его рассказ.|Keksa kesuvchiga hikoyasi uchun besh tilla berish.` }
  ], o => {
    const found = () => {
      setM('wall');
      mStep(`The pink salt of the Seventh Drift takes memories from whoever cuts it; Eshmat's daughter's wedding is somewhere in its blocks. The overseer, Ochil-boshi, keeps the count at the upper post.|Розовая соль Седьмого штрека забирает память у того, кто её рубит; свадьба дочери Эшмата где-то в её блоках. Надсмотрщик Очил-боши ведёт счёт на верхнем посту.|Yettinchi lahmning pushti tuzi uni kesgan odamning xotirasini oladi; Eshmat qizining to'yi uning bo'laklaridan birida. Nazoratchi Ochil boshi hisobni yuqori postda yuritadi.`);
      d();
    };
    if (o.id === 'taste') {
      FAC.taste([
        ['memory', `A man's rough hand on a girl's hennaed one. A voice breaking: "Don't cry, Munisa, your mother's watching, she'll cry too." A guard's chain clinks against a dish of pilaf.|Грубая мужская рука на девичьей, в хне. Срывающийся голос: «Не плачь, Муниса, мать смотрит, тоже заплачет». Цепь стражника звякает о блюдо с пловом.|Qo'pol erkak qo'li xinali qiz qo'li ustida. Uzilib ketayotgan ovoz: «Yig'lama, Munisa, onang qarab turibdi, u ham yig'laydi». Soqchining zanjiri osh tovog'iga tegib jaranglaydi.`],
        ['memory', `Then other people's: a kite over the Tail; a woman kneading dough; a boy's first knife. All of it cut out of men who came down here to cut salt.|Потом чужое: змей над Хвостом; женщина месит тесто; первый мальчишеский нож. И всё это вырублено из людей, которые спустились сюда рубить соль.|Keyin boshqalarniki: Dum uzra varrak; xamir qorayotgan ayol; bolaning birinchi pichog'i. Hammasi bu yerga tuz kesgani tushgan odamlardan kesib olingan.`]
      ], found, { intro: `You press your palm flat to the pink salt. It's like touching a crowd through a curtain.|Прижимаешь ладонь к розовой соли. Будто трогаешь толпу через занавес.|Kaftingni pushti tuzga bosasan. Go'yo parda orqali olomonga tegayotgandek.` });
      return;
    }
    if (o.id === 'str' && !o.ok) {
      play([['', `The pick bounces off. Pink salt is harder than it looks, and it doesn't want you. Eshmat takes the pick back gently.|Кирка отскакивает. Розовая соль твёрже, чем кажется, и ты ей не нужен. Эшмат осторожно забирает кирку.|Cho'kich sakrab ketadi. Pushti tuz ko'ringanidan qattiqroq, sen unga kerak emassan. Eshmat cho'kichni ohista qaytarib oladi.`]], () => qmWallAsk(d, { str: 1 }));
      return;
    }
    if (o.id === 'str') {
      addVoid(2, `the salt's change|сдача соли|tuzning qaytimi`);
      play([
        ['', `The block comes away clean. In the same moment you lose something small: the taste of the first tea you ever paid for with your own money. You know you had it. You know it's in the block now.|Блок отходит чисто. В тот же миг ты теряешь что-то маленькое: вкус первого чая, купленного на свои деньги. Знаешь, что он был. Знаешь, что теперь он в блоке.|Bo'lak toza ko'chadi. Shu lahzada nimadir kichkina narsani yo'qotasan: o'z puling bilan olgan birinchi choyning ta'mini. Bo'lganini bilasan. Endi bo'lak ichida ekanini ham bilasan.`],
        ['qm_eshmat', `Now you know why it counts three.|Теперь знаешь, почему за три.|Endi bilasan, nega uchtaga sanaladi.`]
      ], found);
      return;
    }
    play([['', `"Salt's fair," the old man says. "It gives you three blocks for one and takes the difference out of your head. I came down with a wife. I'll go up with my debt paid."|«Соль честная, — говорит старик. — Даёт три блока за один, а разницу берёт из головы. Я спустился сюда с женой. Поднимусь с уплаченным долгом».|«Tuz halol, — deydi chol. — Bittaga uchta bo'lak beradi, farqini boshingdan oladi. Pastga xotinim bilan tushganman. Tepaga qarzim uzilib chiqaman».`]], found);
  });
  FAC.prop('mines', 'qm1_drift', { id: 'qm1wall', art: 'f6glint', dx: 22, prompt: `Look at the pink wall|Осмотреть розовую стену|Pushti devorni ko'zdan kechirish`, when: () => act('qm1') && !M('wall'), use: d => qmWall(d) });

  /* ---------------------------------------------------------------- 3 · the overseer */
  const qmOchil = d => play([
    ['', `A post of salt bricks with a ledger chained to it. The overseer writes with his left hand and keeps the right one in his sash.|Пост из соляных кирпичей, к нему цепью прикована книга. Надсмотрщик пишет левой рукой, правую держит за кушаком.|Tuz g'ishtlaridan qurilgan post, unga zanjir bilan daftar bog'langan. Nazoratchi chap qo'li bilan yozadi, o'ngini belbog'iga tiqib olgan.`],
    ['qm_ochil', `Eshmat's count is correct, yodchi. Three for one in the Seventh. I wrote it, and I'll swear to it.|Счёт Эшмата верный, ёдчи. В Седьмом три за один. Я писал, я и поклянусь.|Eshmatning hisobi to'g'ri, yodchi. Yettinchida bittaga uch. O'zim yozganman, o'zim qasam ichaman.`]
  ], () => hub(`Ochil-boshi|Очил-боши|Ochil boshi`, [
    { label: `— Why three for one?|— Почему три за один?|— Nega bittaga uch?`, lines: [
      ['qm_ochil', `Because it costs three. You've seen the wall. Salt is honest: it takes what it gives. The Divan only writes it down.|Потому что стоит втрое. Стену ты видел. Соль честная: сколько даёт, столько берёт. Диван только записывает.|Chunki uch baravar qimmat. Devorni ko'rding. Tuz halol: qancha bersa, shuncha oladi. Devon faqat yozib qo'yadi.`]
    ] },
    { label: `— Where does the pink salt go?|— Куда уходит розовая соль?|— Pushti tuz qayerga ketadi?`, lines: [
      ['qm_ochil', `Up. To a dealer on the Bazaar's salt row, Nasim. The Ark eats it on bread and dreams of old feasts. Ask him what he charges. I don't.|Наверх. Торговцу в соляном ряду Базара, Насиму. Арк ест её с хлебом и видит во сне старинные пиры. Спроси у него, почём. Я не спрашиваю.|Yuqoriga. Bozorning tuz rastasidagi Nasimga. Ark uni nonga sepib yeydi va tushida qadimgi ziyofatlarni ko'radi. Necha pulligini undan so'ra. Men so'ramayman.`]
    ] },
    { label: `— Did you cut there yourself?|— Сам там рубил?|— O'zing u yerda kesganmisan?`, lines: [
      ['qm_ochil', `Seven years ago. A year in the Seventh, and my whole sentence was paid. I don't remember what I was sentenced for. I sleep very well.|Семь лет назад. Год в Седьмом — и весь срок уплачен. За что меня осудили, не помню. Сплю я очень хорошо.|Yetti yil oldin. Yettinchida bir yil — va butun muddatim to'landi. Nima uchun hukm qilinganimni eslamayman. Juda yaxshi uxlayman.`]
    ] },
    { label: `— How many die in nine years down here?|— Сколько здесь умирает за девять лет?|— Bu yerda to'qqiz yilda qanchasi o'ladi?`, lines: [
      ['qm_ochil', `Half. In the Seventh, nobody. They walk out in a year, alive, on their own legs. Lighter. Tell me which is worse, and I'll write that down too.|Половина. В Седьмом — никто. Через год выходят живыми, на своих ногах. Полегче. Скажи, что хуже, — я и это запишу.|Yarmi. Yettinchida — hech kim. Bir yildan keyin tirik, o'z oyog'i bilan chiqib ketadi. Yengilroq bo'lib. Qaysi biri yomonroq — ayt, uni ham yozib qo'yaman.`],
      cl('alp', `Alp has stood at this post. Alp counted chains here. ...Alp doesn't remember the faces. Maybe the salt has them.|Алп стоял у этого поста. Алп считал здесь цепи. …Лиц Алп не помнит. Может, они у соли.|Alp shu post yonida turgan. Alp bu yerda zanjir sanagan. …Alp yuzlarni eslamaydi. Balki ular tuzdadir.`)
    ] }
  ], [
    FAC.chk('collection', 3, `"A memory written down as goods is a yodchi's business. Show me the shipping page."|«Память, записанная как товар, — дело ёдчи. Покажи страницу отгрузок.»|«Mol deb yozilgan xotira — yodchining ishi. Jo'natmalar sahifasini ko'rsat.»`, { id: 'law' }, `Law|Закон|Qonun`),
    FAC.chk('backbone', 4, `Lay your palm flat on the ledger and wait.|Положить ладонь на книгу и ждать.|Kaftingni daftar ustiga qo'yib, kutish.`, { id: 'wait' }),
    { id: 'pay', price: 25, label: `"Twenty-five tilla says you turn to the last page."|«Двадцать пять тилла за то, что ты откроешь последнюю страницу.»|«Oxirgi sahifani ochishing uchun yigirma besh tilla.»` },
    { id: 'leave', label: `"Keep your book. I'll ask Nasim."|«Оставь книгу себе. Спрошу у Насима.»|«Kitobing o'zingda qolsin. Nasimdan so'rayman.»` }
  ], o => {
    setM('tally');
    const next = () => { mStep(`Ochil-boshi counts the Seventh Drift three for one and swears it's fair. The pink salt goes to Nasim on the Bazaar's salt row; the Ark eats it on bread and dreams.|Очил-боши считает Седьмой штрек три за один и клянётся, что это честно. Розовая соль идёт Насиму, в соляной ряд Базара; Арк ест её с хлебом и видит сны.|Ochil boshi Yettinchi lahmni bittaga uch deb hisoblaydi va bu adolatli deb qasam ichadi. Pushti tuz Bozorning tuz rastasidagi Nasimga ketadi; Ark uni nonga sepib yeydi va tush ko'radi.`); d(); };
    if (o.id === 'pay' || ((o.id === 'law' || o.id === 'wait') && o.ok)) {
      setM('ledger');
      if (o.id === 'law') FAC.susp('divan', 1);
      play([
        ['', `The last page: "Seventh Drift, autumn: forty blocks to Nasim, salt row. Paid to the Divan: four hundred tilla." In the margin, small: "To the hewers: three for one."|Последняя страница: «Седьмой штрек, осень: сорок блоков Насиму, соляной ряд. Уплачено Дивану: четыреста тилла». На полях мелко: «Забойщикам — три за один».|Oxirgi sahifa: «Yettinchi lahm, kuz: qirq bo'lak Nasimga, tuz rastasi. Devonga to'langan: to'rt yuz tilla». Hoshiyasida mayda qilib: «Kesuvchilarga — bittaga uch».`],
        ['qm_ochil', `Four hundred to the Divan, freedom to the men. Nobody's cheated. Everyone's lighter.|Четыреста Дивану, свобода людям. Никто не обманут. Всем полегче.|To'rt yuz Devonga, ozodlik odamlarga. Hech kim aldanmagan. Hammaga yengil.`]
      ], next);
      return;
    }
    play([['', o.id === 'leave' ? `Ochil-boshi nods, as if you'd chosen well. "Nasim. Salt row. He talks more than I do."|Очил-боши кивает, будто ты правильно выбрал. «Насим. Соляной ряд. Он болтливее меня».|Ochil boshi go'yo to'g'ri tanlaganingdek bosh irg'aydi. «Nasim. Tuz rastasi. U mendan ko'ra ko'proq gapiradi».` : `Ochil-boshi closes the ledger on your fingers, not hard. "Nasim. Salt row. He talks more than I do."|Очил-боши закрывает книгу тебе на пальцы, несильно. «Насим. Соляной ряд. Он болтливее меня».|Ochil boshi daftarni barmoqlaring ustiga yopadi, qattiq emas. «Nasim. Tuz rastasi. U mendan ko'ra ko'proq gapiradi».`]], next);
  }));

  /* ---------------------------------------------------------------- 4 · the salt row */
  const qmNasim = d => play([
    ['', `A clean stall on the salt row. Pink salt in little silk bags, a brass spoon, a painted sign: SALT OF OLD YODGOR. DREAM THE FEASTS OF THE FOUNDERS.|Чистый прилавок в соляном ряду. Розовая соль в шёлковых мешочках, медная ложечка, расписная вывеска: «СОЛЬ СТАРОГО ЁДГОРА. ПИРЫ ОСНОВАТЕЛЕЙ — ВО СНЕ».|Tuz rastasida toza do'kon. Shoyi xaltachalarda pushti tuz, mis qoshiqcha, bo'yalgan peshlavha: «ESKI YODGOR TUZI. ASOSCHILAR ZIYOFATI — TUSHINGIZDA».`],
    ['qm_nasim', `A pinch on hot bread, and tonight you're a guest at a wedding three hundred years old. Twenty tilla. The Ark's families buy it for the wedding pilaf.|Щепотку на горячую лепёшку — и этой ночью ты гость на свадьбе трёхсотлетней давности. Двадцать тилла. Семьи Арка берут к свадебному плову.|Issiq nonga bir chimdim — va bu kecha uch yuz yillik to'yda mehmonsan. Yigirma tilla. Ark oilalari to'y oshiga oladi.`],
    () => (done('qr1') && br('qr1') === 'sell' ? ['qm_nasim', `I've a whole caravan this week as well: six roads to Merv, from the Rabat customs. Worn, but fragrant.|А на этой неделе у меня ещё и целый караван: шесть дорог до Мерва, с таможни Рабата. Стёртые, но душистые.|Bu hafta menda butun bir karvon ham bor: Marvgacha oltita yo'l, Rabot bojxonasidan. Titilgan, lekin xushbo'y.`] : null)
  ], () => hub(`Nasim|Насим|Nasim`, [
    { label: `— Three hundred years old?|— Трёхсотлетней давности?|— Uch yuz yillik?`, lines: [
      ['qm_nasim', `The Seventh Drift runs under the oldest streets. Old salt, old dreams. That's what the overseer says, and he's a serious man.|Седьмой штрек идёт под самыми старыми улицами. Старая соль — старые сны. Так говорит надсмотрщик, а он человек серьёзный.|Yettinchi lahm eng eski ko'chalar ostidan o'tadi. Eski tuz — eski tushlar. Nazoratchi shunday deydi, u jiddiy odam.`]
    ] },
    { label: `— Who buys it?|— Кто покупает?|— Kim oladi?`, lines: [
      ['qm_nasim', `Wedding cooks, mostly. Dream of an old feast and the new one feels blessed. And widows. Widows love weddings.|Свадебные повара, в основном. Увидишь во сне старый пир — и новый кажется благословенным. И вдовы. Вдовы любят свадьбы.|Asosan to'y oshpazlari. Tushingda eski ziyofatni ko'rsang, yangisi barakali tuyuladi. Bevalar ham. Bevalar to'yni yaxshi ko'radi.`]
    ] }
  ], [
    { id: 'go', label: `"Let me try it."|«Дай попробовать.»|«Tatib ko'ray-chi.»` }
  ], () => qmNasimAsk(d, {})));
  const qmNasimAsk = (d, tried) => ask(`The biggest block on the counter is already a third gone.|Самый большой блок на прилавке уже на треть съеден.|Peshtaxtadagi eng katta bo'lakning uchdan biri allaqachon yeyilgan.`, [
    FAC.craft('taste', `a pinch from the biggest block|щепотку от самого большого блока|eng katta bo'lakdan bir chimdim`, { id: 'taste' }),
    { id: 'buy', price: 20, label: `Buy a bag and eat it on bread, the way the Ark does.|Купить мешочек и съесть с лепёшкой, как в Арке.|Bir xaltacha olib, Arkdagidek non bilan yeyish.` },
    tried.mem ? null : FAC.chk('mem', 4, `Smell the block and listen for what doesn't belong.|Понюхать блок и уловить, что в нём лишнее.|Bo'lakni hidlab, nima ortiqchaligini ilg'ash.`, { id: 'mem' }, `Listen|Вслушаться|Quloq solish`)
  ], o => {
    if (o.id === 'mem' && !o.ok) {
      play([['qm_nasim', `Smells of salt, yodchi. It's salt. Buy, or taste, or let the next man through.|Пахнет солью, ёдчи. Это соль. Покупай, пробуй или пропусти следующего.|Tuz hidi keladi, yodchi. Bu tuz. Yo ol, yo tatib ko'r, yo navbatdagiga yo'l ber.`]], () => qmNasimAsk(d, { mem: 1 }));
      return;
    }
    const wed = [
      ['memory', `A wedding in a courtyard in the Tail, five autumns ago at most: the bride's dress is dyed the Bazaar's new crimson. A man in chains weeps through the whole feast. A guard is finishing his second plate of pilaf.|Свадьба во дворе в Хвосте, лет пять назад, не больше: платье невесты крашено новым базарным багрянцем. Человек в цепях плачет весь пир. Стражник доедает вторую тарелку плова.|Dumdagi bir hovlida to'y, ko'pi bilan besh kuz oldin: kelinning ko'ylagi Bozorning yangi to'q qizil bo'yog'ida. Zanjirdagi odam butun to'y bo'yi yig'laydi. Soqchi ikkinchi tovoq oshni tugatyapti.`],
      ['memory', `The bride lifts her veil for one moment, for him alone. A round face, a mole by the lip. "Ota, don't. You'll make me cry too."|Невеста на миг приподнимает покрывало — только для него. Круглое лицо, родинка у губы. «Ота, не надо. Я тоже заплачу».|Kelin bir lahzaga pardani ko'taradi — faqat u uchun. Dumaloq yuz, lab yonida xol. «Ota, qo'ying. Men ham yig'lab yuboraman».`]
    ];
    const after = () => {
      setM('stall');
      play([
        ['hero', `Three hundred years. That crimson came to the Bazaar five years ago.|Триста лет. Этот багрянец появился на Базаре пять лет назад.|Uch yuz yil. Bu to'q qizil bo'yoq Bozorga besh yil oldin kelgan.`],
        ['qm_nasim', `Old, new. The buyer dreams a wedding and cries in the morning. All weddings are old, yodchi. I don't sell dates.|Старое, новое. Покупатель видит свадьбу и утром плачет. Все свадьбы старые, ёдчи. Я не числа продаю.|Eski, yangi. Xaridor to'y ko'radi, ertalab yig'laydi. Hamma to'ylar eski, yodchi. Men sana sotmayman.`],
        ['qm_nasim', `There's a third of that block left. Somebody's wedding, a lot of tears, sells very well. Sixty tilla for the lot, if you want it before the Ark does.|От этого блока осталась треть. Чья-то свадьба, много слёз, очень хорошо берут. Шестьдесят тилла за всё — если хочешь успеть раньше Арка.|Bu bo'lakdan uchdan biri qoldi. Kimningdir to'yi, ko'z yoshi ko'p, juda yaxshi o'tadi. Hammasi oltmish tilla — Arkdan oldin ulgurmoqchi bo'lsang.`],
        cl('surayyo', `That's Munisa's wedding. I gave the water for that pilaf. She lives by the lower cistern.|Это свадьба Мунисы. Я давала воду на тот плов. Она живёт у нижнего хауза.|Bu Munisaning to'yi. O'sha osh uchun suvni men berganman. U pastki hovuz yonida yashaydi.`),
        sd(`People pay to cry over someone else's father. And then they have breakfast.|Люди платят, чтобы поплакать над чужим отцом. А потом завтракают.|Odamlar birovning otasi uchun yig'lashga pul to'laydi. Keyin nonushta qilishadi.`)
      ], () => { mStep(`Nasim sells Eshmat's own memory of Munisa's wedding on the Bazaar as "salt of Old Yodgor", twenty tilla a pinch. A third of the block is left: sixty tilla the lot. Munisa lives in the Tail.|Насим продаёт на Базаре память самого Эшмата о свадьбе Мунисы как «соль Старого Ёдгора», по двадцать тилла за щепотку. Осталась треть блока: шестьдесят тилла за всё. Муниса живёт в Хвосте.|Nasim Bozorda Eshmatning Munisa to'yi haqidagi o'z xotirasini «Eski Yodgor tuzi» deb chimdimi yigirma tilladan sotyapti. Bo'lakning uchdan biri qoldi: hammasi oltmish tilla. Munisa Dumda yashaydi.`); d(); });
    };
    if (o.id === 'mem') {
      play([['', `Under the salt, faintly: lamb fat, cumin, and a sharp new dye that wasn't sold in Yodgor ten years ago. Then, when you close your eyes, the rest.|Под солью, еле слышно: бараний жир, зира и резкая новая краска, которой в Ёдгоре ещё десять лет назад не продавали. А когда закрываешь глаза — остальное.|Tuz tagida, zo'rg'a: qo'y yog'i, zira va o'n yil oldin Yodgorda sotilmagan o'tkir yangi bo'yoq. Ko'zingni yumganingda — qolgani.`]].concat(wed), after);
      return;
    }
    FAC.taste(wed, after, { intro: o.id === 'buy' ? `Hot bread, a pinch of pink. You chew, and the stall goes quiet around you.|Горячая лепёшка, щепотка розового. Жуёшь — и прилавок вокруг затихает.|Issiq non, bir chimdim pushti. Chaynaysan — atrofingdagi do'kon jimib qoladi.` : `Nasim lets you; a yodchi's taste is good for trade. The salt melts on your tongue.|Насим позволяет: проба ёдчи торговле на пользу. Соль тает на языке.|Nasim ruxsat beradi: yodchining tatib ko'rishi savdoga foyda. Tuz tilingda eriydi.` });
  });

  /* ---------------------------------------------------------------- 5 · the daughter */
  const qmMunisa = d => play([
    ['', `A small courtyard, a cradle in the shade, a woman with a round face and a mole by her lip hanging out washing. She sees your coat and goes still.|Маленький двор, в тени люлька, женщина с круглым лицом и родинкой у губы развешивает бельё. Видит твой кафтан и замирает.|Kichkina hovli, soyada beshik, dumaloq yuzli, lab yonida xoli bor ayol kir yoyyapti. To'ningni ko'rib, qotib qoladi.`],
    ['qm_munisa', `Ota? Is it Ota? ...He isn't dead. Tell me he isn't dead, and then tell me anything you like.|Что с отцом? …Он не умер. Скажи, что не умер, а потом говори что хочешь.|Otammi? Otamga nima bo'ldi? …U o'lmagan. O'lmagan de, keyin nima desang, deyaver.`],
    ['hero', `He's alive. He comes home at the new moon.|Жив. На новолуние вернётся домой.|Tirik. Yangi oyda uyga qaytadi.`],
    ['qm_munisa', `The new moon. ...Then it worked. I wrote to him. I begged him to go into the Seventh. Mother has a year, maybe less. She wants to see him in this yard without chains.|На новолуние. …Значит, получилось. Я ему писала. Умоляла пойти в Седьмой. Маме осталось год, может, меньше. Она хочет увидеть его в этом дворе без цепей.|Yangi oyda. …Demak, bo'ldi. Unga xat yozgandim. Yettinchiga tush deb yalingandim. Onamning bir yil umri qolgan, balki undan ham kam. Uni shu hovlida zanjirsiz ko'rgisi keladi.`]
  ], () => hub(`Munisa|Муниса|Munisa`, [
    { label: `— Do you know what the Seventh takes?|— Ты знаешь, что берёт Седьмой?|— Yettinchi nimani olishini bilasanmi?`, lines: [
      ['qm_munisa', `They come back lighter. Everybody knows. I knew when I wrote. ...What did it take from him?|Оттуда возвращаются полегче. Все знают. Я знала, когда писала. …Что оно у него забрало?|U yerdan yengilroq bo'lib qaytishadi. Hamma biladi. Yozayotganimda bilardim. …Undan nimani oldi?`],
      ['hero', `Your wedding. It's on the Bazaar, by the pinch.|Твою свадьбу. Она на Базаре, по щепотке.|Sening to'yingni. U Bozorda, chimdimlab sotilyapti.`],
      ['qm_munisa', `...People are eating my wedding. ...Let them. He'll be home. I'll tell him about it myself. I'll tell it better than salt.|…Люди едят мою свадьбу. …Пусть едят. Он будет дома. Я сама ему расскажу. Я расскажу лучше, чем соль.|…Odamlar mening to'yimni yeyishyapti. …Yeyishaversin. U uyda bo'ladi. O'zim aytib beraman. Tuzdan yaxshiroq aytib beraman.`]
    ] },
    { label: `— Who's in the cradle?|— Кто в люльке?|— Beshikda kim?`, lines: [
      ['qm_munisa', `Eshmat. Named for his grandfather. His grandfather has never seen him. That's the other reason.|Эшмат. В честь деда. Дед его ни разу не видел. Это вторая причина.|Eshmat. Bobosining ismini qo'ydik. Bobosi uni hali ko'rmagan. Ikkinchi sababi shu.`]
    ] }
  ], [
    { id: 'go', label: `"I'll be seeing him."|«Я с ним увижусь.»|«U bilan ko'rishaman.»` }
  ], () => {
    setM('munisa');
    play([
      ['qm_munisa', `Tell him the yard is swept and the pilaf's on. Don't tell him what I said about Mother. Let him see for himself.|Скажи, что двор подметён и плов стоит. Про маму не говори. Пусть сам увидит.|Hovli supurilgan, osh damlangan, de. Onam haqida aytganimni aytma. O'zi ko'rsin.`],
      cl('surayyo', `Her mother takes water from me twice a day now. Twice. She used to manage on once.|Её мать берёт у меня воду теперь два раза в день. Два. Раньше хватало раза.|Uning onasi endi mendan kuniga ikki marta suv oladi. Ikki marta. Ilgari bir marta yetardi.`)
    ], () => { mStep(`Munisa begged her father to go into the Seventh Drift: her mother has a year at most. She'd rather tell him about her wedding herself than wait nine years.|Муниса сама умоляла отца пойти в Седьмой штрек: матери остался год, не больше. Она лучше сама расскажет ему о свадьбе, чем будет ждать девять лет.|Munisaning o'zi otasini Yettinchi lahmga tushishga yalingan: onasining ko'pi bilan bir yil umri qolgan. To'qqiz yil kutgandan ko'ra to'yini unga o'zi aytib bergani yaxshi, deydi.`); d(); });
  }));

  /* ---------------------------------------------------------------- 6 · what to do with the drift */
  const qmEnd = d => play([
    ['', `Eshmat has washed. His chain has been struck off and lies coiled by the drift like a sleeping dog. A little way off, Ochil-boshi stands with the ledger.|Эшмат умылся. Цепь с него сбили, она лежит кольцом у штрека, как спящая собака. Чуть поодаль стоит Очил-боши с книгой.|Eshmat yuvinibdi. Zanjiri olib tashlangan, lahm yonida uxlayotgan itdek halqa bo'lib yotibdi. Sal narida daftar ko'targan Ochil boshi turibdi.`],
    ['qm_eshmat', `Well? What did it take?|Ну? Что оно взяло?|Xo'sh? Nimani oldi?`],
    ['hero', `Munisa's wedding. Nasim sells it on the Bazaar as a feast of the founders; a third is left. And it was Munisa who asked you to go in. Her mother hasn't long.|Свадьбу Мунисы. Насим продаёт её на Базаре как пир основателей; осталась треть. И это Муниса просила тебя пойти. Матери недолго осталось.|Munisaning to'yini. Nasim uni Bozorda asoschilar ziyofati deb sotyapti; uchdan biri qoldi. Seni tushishga Munisaning o'zi yalingan. Onasining umri oz qolgan.`],
    ['qm_eshmat', `...She asked. Of course she did. In our house she always did the sums.|…Она просила. Ну конечно. В нашем доме она всегда всё считала.|…U so'ragan. Albatta-da. Uyimizda hisob-kitobni doim u qilardi.`],
    ['qm_ochil', `He goes up at the new moon, yodchi. Whatever you mean to do down here, do it before then. My book closes at dawn.|На новолуние он поднимается, ёдчи. Что бы ты тут ни затеял, успей до того. Книга у меня закрывается на рассвете.|Yangi oyda u chiqib ketadi, yodchi. Bu yerda nima qilmoqchi bo'lsang, ungacha ulgur. Daftarim tongda yopiladi.`],
    cl('alp', `Alp sent men down here. Alp would bring the drift down on that salt and let the Divan count that.|Алп отправлял сюда людей. Алп обрушил бы штрек на эту соль, и пусть Диван посчитает это.|Alp bu yerga odam jo'natgan. Alp lahmni shu tuz ustiga qulatib, Devonga buni ham hisoblatardi.`),
    cl('nargiza', `It's still singing. Every block. Leave it open and it'll sing louder every year.|Она всё поёт. Каждый блок. Оставишь штрек — с каждым годом будет громче.|U hali ham kuylayapti. Har bir bo'lak. Lahmni qoldirsang, har yili balandroq kuylaydi.`),
    cl('surayyo', `A father home this winter, light or not, is worth more in the Tail than any wedding in salt. I'm sorry. That's the Tail.|Отец дома этой зимой, лёгкий или нет, в Хвосте дороже любой свадьбы в соли. Прости. Такой у нас Хвост.|Bu qish uyda bo'lgan ota — yengilmi, yo'qmi — Dumda tuzdagi har qanday to'ydan qimmat. Kechir. Dum shunaqa.`),
    sd(`He's looking at the salt the way you look at a person.|Он смотрит на соль, как на человека.|U tuzga odamga qaragandek qarayapti.`)
  ], () => qmEndAsk(d, {}));
  const qmEndAsk = (d, tried) => ask(`The pink salt hums in the lamplight. Eshmat waits for you to say it.|Розовая соль гудит в свете лампы. Эшмат ждёт, что ты скажешь.|Pushti tuz chiroq yorug'ida g'uvillaydi. Eshmat nima deyishingni kutyapti.`, [
    { id: 'go', label: `"Go home. Munisa will tell you about the wedding. She says she'll tell it better than salt."|«Иди домой. Муниса сама расскажет тебе о свадьбе. Говорит, расскажет лучше, чем соль.»|«Uyga bor. To'y haqida Munisa o'zi aytib beradi. Tuzdan yaxshiroq aytib beraman, deydi.»` },
    { id: 'buy', price: 60, label: `Buy the rest of the block from Nasim and bring it down. "Eat it, Eshmat. It's yours."|Выкупить у Насима остаток блока и принести вниз. «Ешь, Эшмат. Это твоё.»|Nasimdan bo'lakning qolganini sotib olib, pastga olib tushish. «Ye, Eshmat. Bu seniki.»` },
    tried.seal ? null : FAC.chk('str', 6, `Knock out the props at the mouth of the drift and bring the roof down on the pink salt.|Выбить крепь у входа в штрек и обрушить кровлю на розовую соль.|Lahm og'zidagi tirgaklarni urib chiqarib, shiftni pushti tuz ustiga qulatish.`, { id: 'seal' }),
    FAC.craft('burn', `one of your own memories to bring the roof down|одно из своих воспоминаний, чтобы обрушить кровлю|shiftni qulatish uchun o'z xotiralaringdan birini`, { id: 'sealb' }),
    tried.share ? null : (M('ledger')
      ? { id: 'share', label: `"Ochil. Four hundred to the Divan, it says on your last page. A tenth of every pinch goes to the man who cut it, written in your book."|«Очил. На твоей последней странице — четыреста Дивану. Десятая часть с каждой щепотки — тому, кто её вырубил, и чтобы в твоей книге.»|«Ochil. Oxirgi sahifangda — to'rt yuz Devonga. Har bir chimdimning o'ndan biri — uni kesgan odamga, daftaringga yozilsin.»` }
      : FAC.chk('collection', 4, `"Ochil. A tenth of every pinch goes to the man who cut it, written in your book. Or I write your book into mine."|«Очил. Десятая часть с каждой щепотки — тому, кто её вырубил, и чтобы в твоей книге. Иначе перепишу твою книгу в свою.»|«Ochil. Har bir chimdimning o'ndan biri — uni kesgan odamga, daftaringga yozilsin. Bo'lmasa, daftaringni o'zimnikiga ko'chiraman.»`, { id: 'share' }, `Law|Закон|Qonun`))
  ], o => {
    if (o.id === 'seal' && !o.ok) {
      play([['', `The first prop groans and holds. Ochil-boshi doesn't even look up. "Salt props, yodchi. They hold better than men."|Первая стойка стонет и держит. Очил-боши даже не поднимает глаз. «Соляная крепь, ёдчи. Держит лучше людей».|Birinchi tirgak g'ichirlaydi-yu, bardosh beradi. Ochil boshi boshini ham ko'tarmaydi. «Tuz tirgak, yodchi. Odamlardan yaxshiroq ushlaydi».`]], () => qmEndAsk(d, Object.assign({}, tried, { seal: 1 })));
      return;
    }
    if (o.id === 'share' && o.ok === false) {
      play([['qm_ochil', `Your book? You have a book? ...No. The Divan writes what the Divan writes. Choose something else, yodchi.|Твою книгу? У тебя есть книга? …Нет. Диван пишет то, что Диван пишет. Выбери что-нибудь другое, ёдчи.|Daftaringgami? Sening daftaring bormi? …Yo'q. Devon nima yozsa, shu yoziladi. Boshqa narsa tanla, yodchi.`]], () => qmEndAsk(d, Object.assign({}, tried, { share: 1 })));
      return;
    }
    const b = o.id === 'sealb' ? 'seal' : o.id;
    const fin = (lines, text) => play(lines, () => { FAC.finish('qm1', b, text); d(); });
    if (b === 'go') {
      rep('divan', 1); rep('tail', 1); FAC.react({ surayyo: 10, alp: -5, nargiza: -5 }, 'qm1');
      fin([
        ['qm_eshmat', `Better than salt. ...Yes. She would.|Лучше, чем соль. …Да. Она сможет.|Tuzdan yaxshiroq. …Ha. U uddalaydi.`],
        ['', `At dawn Ochil-boshi closes the book. Eshmat climbs the shaft without looking back. Behind him, at the mouth of the Seventh, a new hewer already sits with a tally stick across his knees.|На рассвете Очил-боши закрывает книгу. Эшмат поднимается по стволу, не оглядываясь. Позади, у входа в Седьмой, уже сидит новый забойщик, бирка поперёк колен.|Tongda Ochil boshi daftarni yopadi. Eshmat ortiga qaramay shaxtadan ko'tariladi. Orqada, Yettinchi og'zida, tizzasiga cho'p qo'ygan yangi kesuvchi allaqachon o'tiribdi.`]
      ], `Eshmat went home at the new moon, light, to a daughter who will tell him about her wedding herself. The Seventh Drift works on, and Nasim sells the rest of the wedding by the pinch.|Эшмат вернулся домой на новолуние, полегче, к дочери, которая сама расскажет ему о свадьбе. Седьмой штрек работает дальше, а Насим продаёт остаток свадьбы по щепотке.|Eshmat yangi oyda yengil bo'lib uyga, to'yini o'zi aytib beradigan qizining oldiga qaytdi. Yettinchi lahm ishlashda davom etadi, Nasim esa to'yning qolganini chimdimlab sotyapti.`);
    } else if (b === 'buy') {
      rep('tail', 1); FAC.react({ surayyo: 5, nargiza: 5, alp: 5 }, 'qm1');
      fin([
        ['', `Eshmat eats the pink salt off his palm, pinch after pinch, slowly, the way a man eats his own bread.|Эшмат ест розовую соль с ладони, щепотку за щепоткой, медленно, как свой хлеб.|Eshmat pushti tuzni kaftidan chimdimlab, sekin, o'z nonini yegandek yeydi.`],
        ['qm_eshmat', `...There. The veil. The mole. "Ota, don't." ...And the pilaf. Too salty. Why do I remember the pilaf being too salty? I didn't eat.|…Вот. Покрывало. Родинка. «Ота, не надо». …И плов. Пересоленный. Почему я помню, что плов пересолен? Я же не ел.|…Mana. Parda. Xol. «Ota, qo'ying». …Osh ham. Sho'r. Nega osh sho'r bo'lganini eslayapman? Axir men yemaganman-ku.`],
        ['hero', `Twenty strangers ate it before you. A little of each of them is in it now.|До тебя её ели двадцать чужих людей. Теперь в ней понемногу от каждого.|Sendan oldin uni yigirmata begona yegan. Endi uning ichida har biridan ozgina bor.`]
      ], `You bought the rest of the wedding from Nasim, and Eshmat ate it before he went up. He remembers his daughter's face now, and a pilaf he never tasted, the way guests remember it.|Ты выкупил у Насима остаток свадьбы, и Эшмат съел его перед подъёмом. Теперь он помнит лицо дочери — и плов, которого не пробовал, так, как его помнят гости.|Nasimdan to'yning qolganini sotib olding, Eshmat uni tepaga chiqishdan oldin yedi. Endi u qizining yuzini eslaydi — va o'zi tatimagan oshni, mehmonlar eslaganidek.`);
    } else if (b === 'seal') {
      if (o.id === 'sealb') addVoid(6, `a memory burned to bring a roof down|воспоминание, сожжённое ради обвала|shiftni qulatish uchun yoqilgan xotira`);
      rep('divan', -2); rep('tail', -1); FAC.react({ alp: 10, nargiza: 10, surayyo: -10 }, 'qm1');
      fin([
        o.id === 'sealb' ? ['', `You give the flame something of yours, you won't know what until you miss it, and push. The props crack.|Ты отдаёшь огню что-то своё — что именно, узнаешь, когда хватишься, — и толкаешь. Крепь трещит.|Olovga o'zingdan nimadir berasan — nimaligini yo'qotganingni sezganingda bilasan — va itarasan. Tirgaklar qarsillaydi.`] : null,
        ['', `One prop, then two, and the drift folds in on itself with a long sigh of salt. The humming stops. The dust settles pink on everyone.|Одна стойка, вторая — и штрек складывается в себя с долгим соляным вздохом. Гул смолкает. Пыль оседает на всех розовым.|Bir tirgak, ikkinchisi — va lahm uzun tuz xo'rsinig'i bilan o'z ichiga qulab tushadi. G'uvillash tinadi. Chang hammaning ustiga pushti bo'lib qo'nadi.`],
        ['qm_ochil', `No Seventh, no three for one. Eshmat: eight years, two months. I'll write it in ink. Get out of my gallery, yodchi.|Нет Седьмого — нет и трёх за один. Эшмат: восемь лет и два месяца. Запишу чернилами. Убирайся из моей галереи, ёдчи.|Yettinchi yo'q — bittaga uch ham yo'q. Eshmat: sakkiz yil-u ikki oy. Siyoh bilan yozaman. Yo'lagimdan chiqib ket, yodchi.`],
        ['qm_eshmat', `Eight years. ...Who'll tell Munisa? Not you. I'll write. I write badly, she'll understand.|Восемь лет. …Кто скажет Мунисе? Не ты. Сам напишу. Пишу я плохо — она поймёт.|Sakkiz yil. …Munisaga kim aytadi? Sen emas. O'zim yozaman. Yomon yozaman — u tushunadi.`]
      ], `You brought the Seventh Drift down. Nobody will come out of the salt lighter now, and nobody will come out in a year. Eshmat has eight years left, and Munisa's mother has one.|Ты обрушил Седьмой штрек. Никто больше не выйдет из соли полегче — и никто не выйдет за год. Эшмату осталось восемь лет, матери Мунисы — год.|Yettinchi lahmni qulatding. Endi hech kim tuzdan yengil bo'lib chiqmaydi — bir yilda ham hech kim chiqmaydi. Eshmatga sakkiz yil qoldi, Munisaning onasiga — bir yil.`);
    } else {
      rep('divan', -1); rep('tail', 2); FAC.susp('divan', 1); FAC.react({ surayyo: 10, alp: -10, nargiza: -15 }, 'qm1');
      fin([
        ['qm_ochil', `A tenth. ...Nasim will howl. The Divan won't notice. Fine. Written.|Десятую. …Насим взвоет. Диван и не заметит. Ладно. Записано.|O'ndan bir. …Nasim dod soladi. Devon sezmaydi ham. Mayli. Yozildi.`],
        ['', `By evening the word has gone down every gallery: the Seventh pays. A queue forms at the mouth of the drift, longer than the drift.|К вечеру весть расходится по всем галереям: Седьмой платит. У входа в штрек выстраивается очередь — длиннее самого штрека.|Kechgacha xabar barcha yo'laklarga tarqaladi: Yettinchi pul to'laydi. Lahm og'zida navbat paydo bo'ladi — lahmning o'zidan uzunroq.`],
        ['qm_eshmat', `Forty tilla for my girl's wedding. Medicine for her mother till spring. ...I sold it, didn't I. I just didn't know the price till now.|Сорок тилла за свадьбу дочери. Лекарства матери до весны. …Я ведь её продал. Просто цену до сих пор не знал.|Qizimning to'yi uchun qirq tilla. Onasiga bahorgacha dori. …Axir uni sotibman-ku. Faqat narxini hozirgacha bilmagan ekanman.`]
      ], `You made Ochil-boshi write a tenth of every pinch to the hewer who cut it. Eshmat went home with forty tilla for medicine. The queue for the Seventh Drift is longer than the drift.|Ты заставил Очил-боши записывать забойщику десятую часть с каждой щепотки. Эшмат ушёл домой с сорока тилла на лекарства. Очередь в Седьмой штрек длиннее самого штрека.|Ochil boshiga har bir chimdimning o'ndan birini uni kesgan odamga yozdirding. Eshmat dori uchun qirq tilla bilan uyga ketdi. Yettinchi lahmga navbat lahmning o'zidan uzun.`);
    }
  });

  /* ---------------------------------------------------------------- who says what, and later */
  FAC.talk.qm_eshmat = d => {
    if (q('qm1').st === 'none') { qmOffer(d); return; }
    if (act('qm1')) {
      if (mAll()) { qmEnd(d); return; }
      play([['qm_eshmat', `Did you find it? I keep trying to picture her veil. I get the guard's plate every time.|Нашёл? Всё пытаюсь представить её покрывало. А всякий раз вижу тарелку стражника.|Topdingmi? Uning pardasini ko'z oldimga keltirmoqchi bo'laman. Har safar soqchining tovog'i chiqadi.`]], d);
      return;
    }
    const L = {
      go: `Eshmat sits in Munisa's yard with the baby on his knee. "She tells me the wedding every evening, a little different each time. I like it better each time."|Эшмат сидит во дворе у Мунисы с малышом на коленях. «Она каждый вечер рассказывает мне свадьбу, и каждый раз немного по-другому. И каждый раз мне больше нравится».|Eshmat Munisaning hovlisida nevarasini tizzasiga olib o'tiribdi. «Har kech to'yni aytib beradi, har safar sal boshqacha. Har safar ko'proq yoqadi».`,
      buy: `"I tell Munisa about her own wedding. She says I tell it like a guest from the Ark. She laughs. Then she goes indoors for a while."|«Я рассказываю Мунисе про её же свадьбу. Она говорит, я рассказываю, как гость из Арка. Смеётся. Потом ненадолго уходит в дом».|«Munisaga o'zining to'yini gapirib beraman. Arkdan kelgan mehmondek gapirasiz, deydi. Kuladi. Keyin bir oz uyga kirib ketadi».`,
      seal: `Eshmat cuts grey salt in the old gallery, steadily, without hurrying. "A letter came. Munisa says Mother asks after me every day. That's something. That's a lot."|Эшмат рубит серую соль в старой галерее, ровно, без спешки. «Письмо пришло. Муниса пишет, мама каждый день про меня спрашивает. Это ведь что-то. Это много».|Eshmat eski yo'lakda kulrang tuzni bir maromda, shoshmay kesyapti. «Xat keldi. Munisa yozibdi, onam har kuni sizni so'raydi. Bu ham nimadir. Bu ko'p».`,
      share: `"The neighbour's boy went down yesterday. Volunteered. He asked me how much they pay for a first love." Eshmat looks at his hands.|«Соседский парень вчера спустился. Сам вызвался. Спрашивал у меня, сколько платят за первую любовь». Эшмат смотрит на свои руки.|«Qo'shnining o'g'li kecha pastga tushdi. O'zi xohlab. Mendan birinchi muhabbat uchun qancha to'lashadi, deb so'radi». Eshmat qo'llariga qaraydi.`
    }[br('qm1')];
    play([['', since('qm1') >= 1 || br('qm1') === 'seal' ? (L || FAC.NPC.qm_eshmat.def.idle) : `Eshmat is packing: a bowl, a spoon, the tally stick. He looks at the stick a long time and packs it too.|Эшмат собирается: миска, ложка, бирка. Долго смотрит на бирку и тоже кладёт в узел.|Eshmat yig'inyapti: kosa, qoshiq, cho'p-belgi. Cho'pga uzoq qarab turadi va uni ham tugunga soladi.`]], d);
  };
  FAC.talk.qm_ochil = d => {
    if (act('qm1') && !M('tally')) { qmOchil(d); return; }
    if (!done('qm1')) { play([['qm_ochil', act('qm1') ? `Nasim. Salt row. I've said what I'll say.|Насим. Соляной ряд. Что хотел, я сказал.|Nasim. Tuz rastasi. Aytadiganimni aytdim.` : `Debtors down, salt up, yodchi. Everything in this book is honest.|Должники вниз, соль наверх, ёдчи. В этой книге всё честно.|Qarzdorlar pastga, tuz tepaga, yodchi. Bu daftarda hammasi halol.`]], d); return; }
    const L = {
      seal: `There's talk of an Eighth. The Divan likes three for one. ...I don't sleep so well now. I don't know why.|Поговаривают про Восьмой. Дивану три за один нравится. …Я теперь хуже сплю. Не знаю почему.|Sakkizinchi haqida gap yuribdi. Devonga bittaga uch yoqadi. …Endi yomonroq uxlayapman. Nimagaligini bilmayman.`,
      share: `A tenth of every pinch, in my hand. Volunteers to the end of the gallery. The Divan calls me a genius.|Десятая с каждой щепотки, моей рукой. Желающих — до конца галереи. Диван зовёт меня гением.|Har bir chimdimdan o'ndan bir, o'z qo'lim bilan. Xohlovchilar yo'lak oxirigacha. Devon meni daho deyapti.`
    }[br('qm1')];
    play([['qm_ochil', L || `Eshmat's page is closed. Next.|Страница Эшмата закрыта. Следующий.|Eshmatning sahifasi yopildi. Navbatdagisi.`]], d);
  };
  FAC.talk.qm_nasim = d => {
    if (act('qm1') && M('tally') && !M('stall')) { qmNasim(d); return; }
    if (!done('qm1')) { play([['qm_nasim', `Salt of Old Yodgor! A pinch on bread, a feast in your sleep. Twenty tilla.|Соль Старого Ёдгора! Щепотка на хлеб — пир во сне. Двадцать тилла.|Eski Yodgor tuzi! Nonga bir chimdim — tushda ziyofat. Yigirma tilla.`]], d); return; }
    const L = {
      go: `The rest of the wedding sold in a day. A widow in the Ark bought it all. She cried for a week, she says. Best week of her year.|Остаток свадьбы ушёл за день. Вдова из Арка скупила всё. Неделю плакала, говорит. Лучшая неделя за год.|To'yning qolgani bir kunda sotildi. Arkdagi bir beva hammasini oldi. Bir hafta yig'ladim, deydi. Yilning eng yaxshi haftasi.`,
      buy: `A fresh wedding came up yesterday. A Potters' Quarter one. Want a taste?|Вчера пришла свежая свадьба. С Гончарного квартала. Попробуешь?|Kecha yangi to'y keldi. Kulollar mahallasidan. Tatib ko'rasanmi?`,
      seal: `Grey salt. Honest salt. Nobody buys honest salt, yodchi. I'm thinking of going into dried apricots.|Серая соль. Честная соль. Честную соль никто не берёт, ёдчи. Думаю перейти на курагу.|Kulrang tuz. Halol tuz. Halol tuzni hech kim olmaydi, yodchi. Turshak sotsammikan, deb o'ylayapman.`,
      share: `Thirty tilla a pinch now, thanks to you. The Ark pays more for what costs more. You've made me rich and the hewers proud. Congratulations.|Теперь тридцать тилла за щепотку, спасибо тебе. Арк платит больше за то, что дороже стоит. Ты сделал меня богатым, а забойщиков гордыми. Поздравляю.|Endi chimdimi o'ttiz tilla, senga rahmat. Ark qimmatroq narsaga ko'proq to'laydi. Meni boy, kesuvchilarni g'ururli qilding. Tabriklayman.`
    }[br('qm1')];
    play([['qm_nasim', L || `…|…|…`]], d);
  };
  FAC.talk.qm_munisa = d => {
    if (act('qm1') && M('stall') && !M('munisa')) { qmMunisa(d); return; }
    if (act('qm1') && M('munisa')) { play([['qm_munisa', `Is he coming? The pilaf won't wait for ever. ...Neither will Mother.|Он придёт? Плов вечно ждать не будет. …И мама тоже.|U keladimi? Osh abadiy kutmaydi. …Onam ham.`]], d); return; }
    if (!done('qm1')) { play([['', FAC.NPC.qm_munisa.def.idle]], d); return; }
    const b = br('qm1');
    if (b === 'seal' && since('qm1') >= 2) { play([['', `Munisa sits by the overseer's post with a bundle of bread on her knees. "They let me down once a month. Mother sent this. She can still bake. ...For now."|Муниса сидит у поста надсмотрщика, на коленях узелок с лепёшками. «Пускают раз в месяц. Мама передала. Печь ещё может. …Пока».|Munisa nazoratchi posti yonida tizzasida non tugunchasi bilan o'tiribdi. «Oyiga bir marta tushirishadi. Onam berib yubordi. Hali non yopa oladi. …Hozircha».`]], d); return; }
    const L = {
      go: `"He asks the same questions about the wedding. I answer them. It's like teaching the baby to talk."|«Он задаёт про свадьбу одни и те же вопросы. Я отвечаю. Как будто малыша говорить учу».|«To'y haqida bir xil savollarni beradi. Javob beraman. Go'yo chaqaloqni gapirishga o'rgatayotgandekman».`,
      buy: `"He remembers my face. He also remembers that the pilaf was too salty. Our pilaf was perfect. I've stopped arguing."|«Моё лицо он помнит. А ещё помнит, что плов был пересолен. Плов у нас был отличный. Я уже не спорю».|«Yuzimni eslaydi. Yana osh sho'r bo'lganini ham eslaydi. Oshimiz zo'r edi. Endi bahslashmayman».`,
      seal: `"A letter from him. Three lines, two of them crossed out. Mother keeps it under her pillow."|«Письмо от него. Три строчки, две зачёркнуты. Мама держит его под подушкой».|«Undan xat keldi. Uch qator, ikkitasi o'chirilgan. Onam uni yostig'i ostida saqlaydi».`,
      share: `"Forty tilla. Mother has her medicine. Half the lane is asking how to get into the Seventh. I don't know what to tell them."|«Сорок тилла. У мамы есть лекарства. Полпереулка спрашивает, как попасть в Седьмой. Не знаю, что им отвечать».|«Qirq tilla. Onamning dorisi bor. Ko'chaning yarmi Yettinchiga qanday tushish mumkin, deb so'rayapti. Ularga nima deyishni bilmayman».`
    }[b];
    play([['', L || FAC.NPC.qm_munisa.def.idle]], d);
  };

  // the mines, a day or more later
  COMP.beat('qm1_back', () => done('qm1') && COMP.region() === 'mines' && !COMP.inside() && since('qm1') >= 1, dn => {
    const T = {
      go: `At the mouth of the Seventh Drift the queue is quiet and orderly. Every man in it holds a tally stick and doesn't look at the wall.|У входа в Седьмой штрек тихая, чинная очередь. У каждого в руке бирка, и никто не смотрит на стену.|Yettinchi lahm og'zida jim, tartibli navbat. Har birining qo'lida cho'p-belgi, hech kim devorga qaramaydi.`,
      buy: `At the mouth of the Seventh Drift the queue is quiet and orderly. Somebody whistles a wedding song, gets the tune wrong, and stops.|У входа в Седьмой штрек тихая, чинная очередь. Кто-то насвистывает свадебную песню, сбивается и замолкает.|Yettinchi lahm og'zida jim, tartibli navbat. Kimdir to'y qo'shig'ini hushtak chalib boshlaydi, adashib, to'xtaydi.`,
      seal: `Where the Seventh Drift was, there's a slope of pink rubble. Somebody has scratched a tally on it, in rows of seven, and stopped halfway.|Там, где был Седьмой штрек, теперь осыпь розового щебня. Кто-то нацарапал на ней зарубки, рядами по семь, и бросил на середине.|Yettinchi lahm o'rnida endi pushti tosh uyumi. Kimdir unga yettitadan qator-qator chiziq tortibdi-yu, yarmida to'xtatibdi.`,
      share: `The queue for the Seventh Drift reaches the Debtors' Kettle. A boy of sixteen asks you, very politely, what a first love fetches these days.|Очередь в Седьмой штрек тянется до самого Котла должников. Парень лет шестнадцати очень вежливо спрашивает у тебя, почём нынче первая любовь.|Yettinchi lahmga navbat Qarzdorlar qozonigacha cho'zilgan. O'n olti yoshlardagi yigit sendan juda odob bilan so'raydi: birinchi muhabbat hozir necha pul?`
    };
    play([['', T[br('qm1')] || T.go]], dn);
  });

  SIDE.epi('qm1', () => (!done('qm1') ? null : {
    go: `Eshmat came home light and lived three more years in Munisa's yard, learning his daughter's wedding from her one evening at a time. The Seventh Drift ran for as long as the Divan stood.|Эшмат вернулся домой полегче и прожил ещё три года во дворе у Мунисы, выучивая свадьбу дочери с её слов, вечер за вечером. Седьмой штрек работал, пока стоял Диван.|Eshmat uyga yengil bo'lib qaytdi va Munisaning hovlisida yana uch yil yashadi, qizining to'yini uning og'zidan kechma-kech o'rganib. Yettinchi lahm Devon turguncha ishladi.`,
    buy: `Eshmat remembered his daughter's wedding to the end of his days: too salty, the way a guest remembers. Nasim found other weddings. The Seventh Drift ran for as long as the Divan stood.|Эшмат до конца дней помнил свадьбу дочери — пересоленную, как помнят гости. Насим нашёл другие свадьбы. Седьмой штрек работал, пока стоял Диван.|Eshmat umrining oxirigacha qizining to'yini esladi — sho'r, mehmonlar eslaganidek. Nasim boshqa to'ylarni topdi. Yettinchi lahm Devon turguncha ishladi.`,
    seal: `The Seventh Drift stayed fallen. Eight years later Eshmat came up heavy with everything he had. Munisa met him at the shaft with her son. Her mother was not with her.|Седьмой штрек так и остался заваленным. Через восемь лет Эшмат поднялся наверх тяжёлым — со всем, что у него было. Муниса встретила его у ствола с сыном. Матери с ней не было.|Yettinchi lahm qulaganicha qoldi. Sakkiz yildan keyin Eshmat bor-budi bilan og'ir bo'lib yuqoriga chiqdi. Munisa uni o'g'li bilan shaxta oldida kutib oldi. Onasi u bilan emasdi.`,
    share: `The Seventh Drift paid a tenth to the men who cut it, and a whole lane of the Tail went down to sell itself by the block. They came up with money and very little else. People called it the fair drift.|Седьмой штрек платил забойщикам десятую часть, и целый переулок Хвоста спустился продавать себя поблочно. Наверх они поднимались с деньгами и почти ни с чем больше. Штрек прозвали честным.|Yettinchi lahm kesuvchilarga o'ndan bir to'ladi, Dumning butun bir ko'chasi o'zini bo'laklab sotgani pastga tushdi. Yuqoriga pul bilan, boshqa deyarli hech narsasiz chiqishdi. Lahmni halol lahm deb atashdi.`
  }[br('qm1')] || null), 'tail:dig');
}
