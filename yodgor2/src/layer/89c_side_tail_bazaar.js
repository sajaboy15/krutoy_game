/* 89c_side_tail_bazaar.js — side stories of the Tail and the Bazaar (GDD ch. 20):
     12 Tea for Three              (Tail)    three old men argue every night about which of them is dead
     18 A Lullaby for the Hollow   (Tail)    a mother sings to her grown Hollow son; Sado can carry the song and wake him
      7 Farrukh's Happiness        (Bazaar)  the memory-dealer lives on stolen joys; his real family is looking for him
      9 The Blind Cartographer     (Bazaar)  he draws the city as it was before the Small Awakening; his map leads to a Singers' cache
     19 Oshiq for Everything       (Bazaar)  the champion stakes his best memory
   Rules: a turn, two or more ways, no clean good ending, the people come back (epilogue, later lines). */
{
  const q = FAC.q, act = FAC.isActive, done = FAC.isDone, br = FAC.br, sf = SIDE.flag;
  const sado = () => sadoAwake();

  /* ================================================================ 12 · TEA FOR THREE */
  CAST.hakim = { name: `Old Hakim|Старый Хаким|Keksa Hakim`, portrait: null };
  CAST.ulugbek = { name: `Old Ulugbek|Старый Улугбек|Keksa Ulug'bek`, portrait: null };
  CAST.toshmat = { name: `Old Toshmat|Старый Тошмат|Keksa Toshmat`, portrait: null };
  SIDE.quest('sd12', { n: 12, title: `Tea for Three|Чай на троих|Uch kishilik choy`, where: ['tail', 'tea3'] });
  FAC.spot('tail', 'tea3', 0.72);
  const oldLook = c => ({ robe: c, trim: '#c8b890', skin: '#a07858', head: 'doppi', headC: '#1c1a1e', headC2: '#e8e0cc', beard: 'long' });
  const nightOrEve = () => { const h = SIDE.hour(); return h >= 17 || h < 2; };
  FAC.npc('hakim', { name: CAST.hakim.name, look: oldLook('#4a3a2a'), dx: -18, prompt: `Sit down with the old men|Подсесть к старикам|Cholllar yoniga o'tirish`, idle: `"Toshmat, pour." "I poured last time." "You're dead, Toshmat. The dead pour."|«Тошмат, наливай». «Я в прошлый раз наливал». «Ты мёртв, Тошмат. Мёртвые наливают».|«Toshmat, quy». «O'tgan safar men quyganman». «Sen o'lgansan, Toshmat. O'liklar quyadi».` },
    () => (br('sd12') === 'release' ? [] : [{ from: 17, to: 2, region: 'tail', spot: 'tea3' }]));
  FAC.talk.hakim = d => {
    if (done('sd12')) { play([['', { keep: `The three old men are still arguing. Toshmat's tea is still cold. Nobody minds.|Трое стариков всё ещё спорят. Чай Тошмата всё ещё холодный. Никто не против.|Uch chol hamon bahslashyapti. Toshmatning choyi hamon sovuq. Hech kim qarshi emas.`, take: `Two old men drink tea. A third cup stands between them. Neither knows why they keep pouring it.|Двое стариков пьют чай. Между ними стоит третья пиала. Ни один не знает, зачем они её наливают.|Ikki chol choy ichyapti. Ular orasida uchinchi piyola turibdi. Nega uni quyib qo'yishlarini hech biri bilmaydi.` }[br('sd12')] || `…|…|…`]], d); return; }
    if (q('sd12').st === 'none') {
      play([
        ['', `Three old men on a felt mat, three bowls, one teapot. They have clearly been arguing for years.|Трое стариков на кошме, три пиалы, один чайник. Спорят они явно уже не первый год.|Kigiz ustida uch chol, uchta piyola, bitta choynak. Yillardan beri bahslashayotgani shundoq ko'rinib turibdi.`],
        ['hakim', `Yodchi! You count things for a living. Tell this fool he's dead. Toshmat. The one in the green.|Ёдчи! Ты же по счёту работаешь. Скажи этому дураку, что он мёртв. Тошмату. Тому, что в зелёном.|Yodchi! Sen hisob bilan ishlaysan. Anavi ahmoqqa o'lganini ayt. Toshmatga. Yashil kiyimdagisiga.`],
        ['toshmat', `I'm not dead. Ulugbek is dead. I was at his funeral. I carried the left corner.|Я не мёртв. Улугбек мёртв. Я был на его похоронах. Нёс левый угол.|Men o'lmaganman. Ulug'bek o'lgan. Uning janozasida bo'lganman. Chap burchagini ko'targanman.`],
        ['ulugbek', `I'm sitting right here, you donkey. Hakim's the dead one. He just hasn't noticed. He never noticed anything.|Я тут сижу, ишак. Мёртвый — Хаким. Он просто не заметил. Он вообще ничего никогда не замечал.|Men shu yerda o'tiribman, eshak. O'lgan — Hakim. Shunchaki sezmagan. U umuman hech narsani sezmagan.`],
        () => (sado() ? ['sado', `Ravshan. One of them really is. I can tell. One of them is... thinner. Like a drawing of a man.|Равшан. Один из них правда мёртв. Я чувствую. Один из них какой-то... тоньше. Как рисунок человека.|Ravshan. Ulardan biri chindan o'lgan. Sezyapman. Biri qandaydir... yupqaroq. Odamning rasmidek.`] : null)
      ], () => { FAC.begin('sd12', `Three old men at the Tail drink tea every night and argue which of them is dead. One of them really is. Their cups might tell.|Трое стариков в Хвосте каждую ночь пьют чай и спорят, кто из них умер. Один действительно мёртв. Их пиалы могут подсказать.|Dumdagi uch chol har kecha choy ichib, qaysi biri o'lganini bahslashadi. Ulardan biri chindan o'lgan. Piyolalari biror narsa aytishi mumkin.`, ['tail', 'tea3']); d(); });
      return;
    }
    if (!sf('sd12_tasted')) { play([['hakim', `Well? Taste the tea if you don't believe us. The dead man's tea is always cold.|Ну? Попробуй чай, раз не веришь. У мёртвого чай всегда холодный.|Xo'sh? Ishonmasang, choyni totib ko'r. O'likning choyi doim sovuq.`]], d); return; }
    play([['', `The three old men fall silent when you sit down, as if they know what you've tasted.|Когда ты подсаживаешься, старики замолкают, будто знают, что ты попробовал.|Yoniga o'tirganingda chollar jim bo'lib qolishadi, go'yo nima totib ko'rganingni bilishadi.`]], () => ask(`Toshmat's bowl is cold. It has been cold for twenty years.|Пиала Тошмата холодная. Холодная уже двадцать лет.|Toshmatning piyolasi sovuq. Yigirma yildan beri sovuq.`, [
      { id: 'release', label: `"Toshmat-ota. You died in the year the Tail slid. They've kept you here by remembering. It's time."|«Тошмат-ота. Вы умерли в тот год, когда сполз Хвост. Они держат вас здесь памятью. Пора».|«Toshmat ota. Siz Dum siljigan yili vafot etgansiz. Ular sizni xotira bilan shu yerda ushlab turishibdi. Vaqt bo'ldi».` },
      { id: 'keep', label: `"Nobody here is dead. Pour the tea."|«Никто тут не мёртв. Наливайте чай».|«Bu yerda hech kim o'lmagan. Choy quyinglar».` },
      FAC.craft('take', `Toshmat out of their memory, into a tumar for his granddaughter|Тошмата из их памяти — в тумар, для его внучки|Toshmatni ularning xotirasidan — nevarasi uchun tumarga`, { id: 'take' })
    ], o => {
      const fin = (lines, text) => play(lines, () => { FAC.finish('sd12', o.id, text); d(); });
      if (o.id === 'release') {
        rep('tail', 1);
        fin([
          ['toshmat', `...Twenty years. Then I owe them twenty years of pouring. ...Hakim. Ulugbek. Pour your own tea from now on. You were always bad at it.|...Двадцать лет. Значит, я им должен двадцать лет разливания. ...Хаким. Улугбек. Наливайте теперь сами. У вас всегда плохо получалось.|...Yigirma yil. Demak, ularga yigirma yillik choy quyish qarzim bor. ...Hakim. Ulug'bek. Endi o'zlaringiz quyinglar. Doim yomon quyardinglar.`],
          ['', `He isn't there any more. His bowl is. The two old men cry like boys, loudly and without shame, and then, for the first time in years, they go home to sleep.|Его больше нет. Пиала осталась. Двое стариков плачут, как мальчишки, — громко и без стыда, — а потом впервые за много лет идут домой спать.|U endi yo'q. Piyolasi qoldi. Ikki chol bolalardek — baland ovozda, uyalmay — yig'lashadi, keyin ko'p yillardan beri birinchi marta uyga uxlagani ketishadi.`]
        ], `You told Toshmat he was dead. He left; the two others went home to sleep for the first time in years.|Ты сказал Тошмату, что он мёртв. Он ушёл, а двое других впервые за годы пошли домой спать.|Toshmatga o'lganini aytding. U ketdi, qolgan ikkovi yillardan beri birinchi marta uyga uxlagani ketishdi.`);
      } else if (o.id === 'keep') {
        fin([
          ['ulugbek', `Hear that? Nobody's dead. Pour, Toshmat.|Слышал? Никто не мёртв. Наливай, Тошмат.|Eshitdingmi? Hech kim o'lmagan. Quy, Toshmat.`],
          ['', `Up close you can see what it costs them: their own faces are going thin at the edges, like the cold one's. Remembering a man that hard takes something.|Вблизи видно, чего им это стоит: их собственные лица по краям истончаются, как у холодного. Так сильно помнить человека — это чего-то стоит.|Yaqindan bunga qanchaga tushayotgani ko'rinadi: o'z yuzlari ham chetlaridan yupqalashib boryapti, sovuq piyolalinikidek. Odamni bunchalik kuchli eslash nimanidir talab qiladi.`]
        ], `You let them keep their friend. They pour for him every night, and grow thin themselves.|Ты оставил им друга. Они каждый вечер наливают ему — и сами становятся тоньше.|Ularga do'stini qoldirding. Har kecha unga choy quyishadi — o'zlari esa yupqalashib boradi.`);
      } else {
        FAC.takeMem(`an old man the others kept alive|старик, которого держали живым другие|boshqalar tirik saqlagan chol`); gold(20);
        fin([
          ['', `You hum, and Toshmat folds up like a letter and goes into the wax. Hakim and Ulugbek stop mid-word, look at the third bowl, and can't think why it's there.|Ты напеваешь — и Тошмат складывается, как письмо, и уходит в воск. Хаким и Улугбек замолкают на полуслове, смотрят на третью пиалу и не могут понять, откуда она.|Xirgoyi qilasan — Toshmat xatdek buklanib, mumga kirib ketadi. Hakim bilan Ulug'bek gap orasida jim bo'lib, uchinchi piyolaga qarashadi va u nega turganini tushunisholmaydi.`],
          ['', `His granddaughter, a weaver on the third row, holds the tumar to her chest and pays you in coins she's been saving for a dowry.|Его внучка, ткачиха с третьего ряда, прижимает тумар к груди и платит тебе монетами, которые копила на приданое.|Uning nevarasi, uchinchi qatordagi to'quvchi qiz, tumarni ko'ksiga bosib, sepi uchun yiqqan tangalarini senga to'laydi.`]
        ], `You took Toshmat into a tumar for his granddaughter. His two friends no longer remember him.|Ты забрал Тошмата в тумар для его внучки. Двое друзей больше его не помнят.|Toshmatni nevarasi uchun tumarga olding. Ikki do'sti endi uni eslamaydi.`);
      }
    }));
  };
  FAC.prop('tail', 'tea3', { id: 'sd12cup', art: 'f6glint', dx: 14, prompt: `Taste the three bowls|Испить три пиалы|Uchta piyolani totib ko'rish`, when: () => act('sd12') && !sf('sd12_tasted'), use: d => FAC.taste([
    ['memory', `Hakim's bowl: a funeral in the year the Tail slid. Toshmat's green coat on the bier. Hakim carries the left corner.|Пиала Хакима: похороны в тот год, когда сполз Хвост. На носилках зелёный халат Тошмата. Хаким несёт левый угол.|Hakimning piyolasi: Dum siljigan yilgi janoza. Tobutda Toshmatning yashil to'ni. Hakim chap burchakni ko'tarib boryapti.`],
    ['memory', `Ulugbek's bowl: last night. Toshmat lends him three tilla and grumbles. Ulugbek remembers it so hard it hurts. It's almost real.|Пиала Улугбека: вчерашний вечер. Тошмат одалживает ему три тиллы и ворчит. Улугбек помнит это так сильно, что больно. Почти по-настоящему.|Ulug'bekning piyolasi: kechagi oqshom. Toshmat unga uch tilla qarz berib, to'ng'illaydi. Ulug'bek buni shunchalik kuchli eslaydiki, og'riydi. Deyarli haqiqiydek.`],
    ['memory', `Toshmat's bowl: nothing. Cold tea, twenty years cold.|Пиала Тошмата: ничего. Холодный чай, двадцать лет холодный.|Toshmatning piyolasi: hech narsa. Sovuq choy, yigirma yillik sovuq.`]
  ], () => { sf('sd12_tasted', 1); FAC.stepTo('sd12', `Toshmat is the dead one: he died the year the Tail slid. His friends remember him so hard he still sits with them.|Мёртв Тошмат: он умер в тот год, когда сполз Хвост. Друзья помнят его так сильно, что он до сих пор сидит с ними.|O'lgani — Toshmat: u Dum siljigan yili vafot etgan. Do'stlari uni shunchalik kuchli eslashadiki, u hamon ular bilan o'tiribdi.`); d(); }) });
  SIDE.epi('sd12', () => ({ release: `The Tail's teahouse keeps a cold bowl on the mat for Toshmat. Hakim and Ulugbek still argue, about other things now. They sleep at night.|В чайхане Хвоста на кошме держат холодную пиалу для Тошмата. Хаким и Улугбек всё ещё спорят — теперь о другом. По ночам они спят.|Dum choyxonasida kigiz ustida Toshmat uchun sovuq piyola turadi. Hakim bilan Ulug'bek hamon bahslashadi — endi boshqa narsalar haqida. Kechalari uxlashadi.`, keep: `Three old men still drink tea on the third row every night. People say there are only two. People say a lot of things.|Трое стариков по-прежнему пьют чай на третьем ряду каждый вечер. Говорят, их там всего двое. Мало ли что говорят.|Uch chol hamon har kecha uchinchi qatorda choy ichishadi. Aytishlaricha, u yerda faqat ikkitasi bor. Nimalar demaydi deysan.`, take: null }[br('sd12')] || null), 'tail:stories');

  /* ================================================================ 18 · A LULLABY FOR THE HOLLOW */
  CAST.zuhra = { name: `Zuhra|Зухра|Zuhra`, portrait: null };
  CAST.jahongir = { name: `Jahongir|Джахонгир|Jahongir`, portrait: null };
  SIDE.quest('sd18', { n: 18, title: `A Lullaby for the Hollow|Колыбельная для Пустого|Bo'sh uchun alla`, where: ['tail', 'zuhra'] });
  FAC.spot('tail', 'zuhra', 0.88);
  FAC.spot('potters', 'jah_kiln', 0.5);
  FAC.npc('zuhra', { name: CAST.zuhra.name, look: 'widow', dx: -14, prompt: `Listen to the woman singing|Послушать, как поёт женщина|Kuylayotgan ayolni tinglash`, idle: `Zuhra sings very quietly to a grown man who sits beside her, looking at nothing.|Зухра очень тихо поёт взрослому мужчине, который сидит рядом и смотрит в никуда.|Zuhra yonida hech narsaga qaramay o'tirgan katta yoshli erkakka juda sekin kuylayapti.` },
    () => [{ from: 18, to: 24, region: 'tail', spot: 'zuhra' }]);
  FAC.talk.zuhra = d => {
    if (done('sd18')) { play([['', { woke: `Zuhra no longer sings at night. She sits by her son and tells him what the stars are doing.|Зухра больше не поёт по ночам. Она сидит рядом с сыном и рассказывает ему, что делают звёзды.|Zuhra endi kechalari kuylamaydi. O'g'lining yonida o'tirib, unga yulduzlar nima qilayotganini aytib beradi.`, asked: `Zuhra nods to you, politely, the way you nod to a man who borrowed something and never brought it back.|Зухра вежливо кивает тебе — так кивают тому, кто что-то одолжил и не вернул.|Zuhra senga xushmuomala bosh irg'aydi — biror narsani qarzga olib, qaytarmagan odamga shunday bosh irg'ashadi.`, let: `Zuhra still sings every night. Her son still looks at nothing. Some nights, the song is a little louder.|Зухра всё ещё поёт по ночам. Её сын всё ещё смотрит в никуда. В иные ночи песня чуть громче.|Zuhra hamon har kecha kuylaydi. O'g'li hamon hech narsaga qaramaydi. Ba'zi kechalari qo'shiq biroz balandroq.` }[br('sd18')] || `…|…|…`]], d); return; }
    if (q('sd18').st === 'none') {
      play([
        ['', `A woman sings a cradle-song to a man of thirty with empty eyes. He sits very straight, as if he'd been told to.|Женщина поёт колыбельную мужчине лет тридцати с пустыми глазами. Он сидит очень прямо, будто ему так велели.|Bir ayol bo'm-bo'sh ko'zli o'ttiz yoshlardagi erkakka alla aytyapti. U go'yo shunday buyurilgandek juda tik o'tiribdi.`],
        ['zuhra', `Jahongir. My son. He sold himself out a little at a time, for something. He never told me what. Now he can't.|Джахонгир. Мой сын. Он продавал себя по кусочку — ради чего-то. Так и не сказал мне ради чего. Теперь уже не может.|Jahongir. O'g'lim. O'zini bo'lak-bo'lak qilib sotgan — nimadir uchun. Nima uchun ekanini menga aytmagan. Endi aytolmaydi.`],
        ['zuhra', `I sing what I sang when he was small. Every night. He's never once looked at me.|Я пою то, что пела, когда он был маленьким. Каждый вечер. Он ни разу на меня не посмотрел.|U kichkinaligida aytgan allamni aytaman. Har kecha. U bir marta ham menga qaramagan.`],
        () => (sado() ? ['sado', `I know that song. Don't ask me how. ...I could carry it. Into him. For a minute. If you let me.|Я знаю эту песню. Не спрашивай откуда. ...Я могу её донести. В него. На минуту. Если позволишь.|Bu qo'shiqni bilaman. Qayerdan ekanini so'rama. ...Uni olib bora olaman. Uning ichiga. Bir daqiqaga. Ruxsat bersang.`] : null)
      ], () => { FAC.begin('sd18', `Zuhra sings every night to her Hollow son Jahongir, who sold himself for something he never told her. Sado could wake him for a minute. He worked at the Potters' kilns.|Зухра каждый вечер поёт Пустому сыну, Джахонгиру: он продал себя ради чего-то, о чём так и не сказал. Садо может разбудить его на минуту. Он работал у печей в Квартале гончаров.|Zuhra har kecha Bo'sh o'g'li Jahongirga kuylaydi: u nima uchundir o'zini sotgan va buni aytmagan. Sado uni bir daqiqaga uyg'ota oladi. U Kulollar mahallasidagi xumdonlarda ishlagan.`, ['potters', 'jah_kiln']); d(); });
      return;
    }
    if (!sado()) { play([['zuhra', `He's warm. That's something. Sit, if you like.|Он тёплый. Уже что-то. Посиди, если хочешь.|U iliq. Bu ham bir narsa. Xohlasang, o'tir.`]], d); return; }
    play([['sado', `Ready? I'll be very careful. Hold on to him, Ravshan. Hold on to me.|Готов? Я буду очень осторожна. Держи его, Равшан. Держи меня.|Tayyormisan? Juda ehtiyot bo'laman. Uni ushlab tur, Ravshan. Meni ushlab tur.`]], () => ask(`Zuhra is still singing. Sado is waiting.|Зухра всё ещё поёт. Садо ждёт.|Zuhra hamon kuylayapti. Sado kutyapti.`, [
      { id: 'woke', label: `"Carry it, Sado."|«Неси, Садо.»|«Olib bor, Sado.»` },
      { id: 'asked', label: `"Carry it. And when he wakes, I'll ask him something I need to know."|«Неси. А когда он очнётся, я спрошу у него то, что мне нужно знать.»|«Olib bor. U uyg'onganda, menga kerak bo'lgan narsani so'rayman.»` },
      { id: 'let', label: `"No. Let her sing. A minute isn't enough to lose him twice."|«Нет. Пусть поёт. Минуты мало, чтобы потерять его дважды.»|«Yo'q. Kuylasin. Uni ikki marta yo'qotish uchun bir daqiqa kam.»` }
    ], o => {
      const knew = sf('sd18_clue');
      if (o.id === 'let') { play([['sado', `...All right. I'll hum along from here. She won't hear. That's all right too.|...Ладно. Я буду подпевать отсюда. Она не услышит. И это тоже ничего.|...Mayli. Shu yerdan jo'r bo'laman. U eshitmaydi. Bu ham hechqisi yo'q.`]], () => { FAC.finish('sd18', 'let', `You didn't wake Jahongir. Zuhra sings on.|Ты не стал будить Джахонгира. Зухра поёт дальше.|Jahongirni uyg'otmading. Zuhra kuylashda davom etyapti.`); d(); }); return; }
      addVoid(2, `a song carried into the empty|песня, донесённая в пустоту|bo'shliqqa olib borilgan qo'shiq`); trust(1);
      const lines = [
        ['', `The song changes key, a half-step, as if a second voice had joined. Jahongir blinks. Then he turns his head and looks at his mother.|Песня меняет лад на полтона, будто вступил второй голос. Джахонгир моргает. Потом поворачивает голову и смотрит на мать.|Qo'shiq yarim ohangga o'zgaradi, go'yo ikkinchi ovoz qo'shilgandek. Jahongir ko'zini pirpiratadi. Keyin boshini burib, onasiga qaraydi.`],
        ['jahongir', knew ? `Oyi. Can you see the stars tonight? ...Good. That's good. That was the price, oyi. I paid it at the kilns. Your eyes for my head. Fair.|Ойи. Ты видишь звёзды сегодня? ...Хорошо. Это хорошо. Такая была цена, ойи. Я заплатил у печей. Твои глаза за мою голову. Честно.|Oyi. Bugun yulduzlarni ko'ryapsanmi? ...Yaxshi. Bu yaxshi. Bahosi shu edi, oyi. Xumdonlarda to'ladim. Sening ko'zlaring — mening boshim evaziga. Adolatli.` : `Oyi. ...I'm sorry. I don't know what for. I know I'm sorry.|Ойи. ...Прости. Не знаю за что. Знаю, что прости.|Oyi. ...Kechir. Nima uchunligini bilmayman. Kechir, shuni bilaman.`]
      ];
      if (o.id === 'asked') lines.push(['hero', `Jahongir. Who bought your memories at the kilns?|Джахонгир. Кто покупал твою память у печей?|Jahongir. Xumdonlarda xotirangni kim sotib olgan?`], ['jahongir', `A man in a grey coat. From the Divan. He said "wax" and paid in medicine. ...Oyi? Oyi, where are you going?|Человек в сером кафтане. Из Дивана. Говорил «воск» и платил лекарствами. ...Ойи? Ойи, ты куда?|Kulrang to'nli odam. Devondan. «Mum» der edi, dori bilan to'lardi. ...Oyi? Oyi, qayoqqa ketyapsan?`], ['', `The minute is over. His eyes go empty in the middle of a word. Zuhra didn't get to say anything to him. You used the minute.|Минута прошла. Глаза у него пустеют посреди слова. Зухра не успела ему ничего сказать. Минуту потратил ты.|Daqiqa tugadi. Ko'zlari so'z o'rtasida bo'shab qoladi. Zuhra unga hech narsa aytishga ulgurmadi. Daqiqani sen sarflading.`]);
      else lines.push(['zuhra', `...Jahongir. My boy. My boy.|...Джахонгир. Сыночек. Сыночек мой.|...Jahongir. Bolam. Bolajonim.`], ['', `It lasts a minute. Then his eyes go quiet again, but his hand stays in hers.|Это длится минуту. Потом его глаза снова затихают, но рука остаётся в её руке.|Bu bir daqiqa davom etadi. Keyin ko'zlari yana tinchiydi, lekin qo'li onasining qo'lida qoladi.`]);
      lines.push(() => (sado() ? ['sado', `I did it. I did it, and it hurt, and I'd do it again. ...Not tonight.|Получилось. Получилось, и было больно, и я бы сделала ещё раз. ...Не сегодня.|Uddaladim. Uddaladim, og'riq bo'ldi, yana qilardim. ...Bugun emas.`] : null));
      play(lines, () => { if (o.id === 'asked') rep('tail', -1); else rep('tail', 1); FAC.finish('sd18', o.id, o.id === 'asked' ? `Sado woke Jahongir for a minute. You spent it asking about the Divan's buyer.|Садо разбудила Джахонгира на минуту. Ты потратил её на вопрос о покупателе из Дивана.|Sado Jahongirni bir daqiqaga uyg'otdi. Sen uni Devon xaridori haqida so'rashga sarflading.` : `Sado woke Jahongir for a minute. He looked at his mother.|Садо разбудила Джахонгира на минуту. Он посмотрел на мать.|Sado Jahongirni bir daqiqaga uyg'otdi. U onasiga qaradi.`); d(); });
    }));
  };
  FAC.prop('potters', 'jah_kiln', { id: 'sd18kiln', art: 'f6glint', prompt: `Taste the cold kiln Jahongir worked at|Испить остывшую печь, у которой работал Джахонгир|Jahongir ishlagan sovuq xumdonni totib ko'rish`, when: () => act('sd18') && !sf('sd18_clue'), use: d => FAC.taste([
    ['memory', `A young man at the kiln mouth, sweating, cheerful. A man in a grey coat counts out little clay pots of medicine. "For the eyes," the young man says. "Hers, not mine."|Молодой парень у устья печи, потный и весёлый. Человек в сером кафтане отсчитывает глиняные горшочки с лекарством. «Для глаз, — говорит парень. — Её, не моих».|Xumdon og'zida terlagan, quvnoq yigit. Kulrang to'nli odam dori solingan sopol idishchalarni sanab beradi. «Ko'z uchun, — deydi yigit. — Uniki, meniki emas».`],
    ['memory', `"One more," says the grey coat. "One more and she'll see the stars." The young man laughs. "Take two."|«Ещё одно, — говорит серый кафтан. — Ещё одно, и она увидит звёзды». Парень смеётся: «Бери два».|«Yana bitta, — deydi kulrang to'n. — Yana bitta, va u yulduzlarni ko'radi». Yigit kuladi: «Ikkitasini ol».`]
  ], () => { sf('sd18_clue', 1); FAC.stepTo('sd18', `Jahongir sold his memories at the kilns, a piece at a time, to a Divan buyer, for medicine for his mother's eyes.|Джахонгир продавал память у печей, по кусочку, покупателю из Дивана — за лекарство для глаз матери.|Jahongir xotirasini xumdonlarda bo'lak-bo'lak qilib Devon xaridoriga sotgan — onasining ko'zlari uchun dori evaziga.`, ['tail', 'zuhra']); d(); }) });

  /* ================================================================ 7 · FARRUKH'S HAPPINESS */
  CAST.dilbar = { name: `Dilbar|Дильбар|Dilbar`, portrait: null };
  SIDE.quest('sd7', { n: 7, title: `Farrukh's Happiness|Счастье Фарруха|Farruxning baxti`, where: ['potters', 'dilbar'] });
  FAC.spot('potters', 'dilbar', 0.28);
  FAC.spot('bazaar', 'farrukh_n', 0.4);
  FAC.npc('dilbar', { name: CAST.dilbar.name, look: 'tailwoman', dx: 10, prompt: `Talk to the woman at the well|Поговорить с женщиной у колодца|Quduq yonidagi ayol bilan gaplashish`, idle: `A woman with a little girl on her hip asks every passer-by the same question.|Женщина с девочкой на руках задаёт каждому прохожему один и тот же вопрос.|Qo'lida qizchasi bor ayol har bir o'tkinchiga bir xil savol beradi.` },
    () => (br('sd7') === 'home' ? [] : [{ from: 8, to: 18, region: 'potters', spot: 'dilbar' }]));
  FAC.npc('farrukh_n', { name: `Farrukh|Фаррух|Farrux`, look: { robe: '#6a2a4a', trim: '#e2b452', skin: '#c89a78', head: 'turban', headC: '#3a1a2a' }, dx: 0, prompt: `Talk to Farrukh|Поговорить с Фаррухом|Farrux bilan gaplashish`, idle: `Farrukh is laughing at something only he can see.|Фаррух смеётся над чем-то, что видит только он.|Farrux faqat o'zi ko'radigan nimagadir kulyapti.` },
    () => (act('sd7') && sf('sd7_found') !== 1 ? [{ from: 19, to: 24, region: 'bazaar', spot: 'farrukh_n' }] : []));
  FAC.talk.dilbar = d => {
    if (done('sd7')) { play([['dilbar', { stay: `If you ever see him... no. Don't tell me. I'd rather think he's laughing somewhere.|Если когда-нибудь его увидишь... нет. Не говори. Лучше буду думать, что он где-то смеётся.|Agar uni ko'rib qolsang... yo'q. Aytma. Qayerdadir kulib yuribdi deb o'ylaganim yaxshi.`, divan: `They gave us a hundred tilla for him. Like for a lost cow. I bought the girl shoes.|Нам дали за него сто тилла. Как за потерянную корову. Я купила девочке башмаки.|U uchun bizga yuz tilla berishdi. Yo'qolgan sigir uchundek. Qizchaga kovush oldim.` }[br('sd7')] || `…|…|…`]], d); return; }
    if (q('sd7').st === 'none') {
      play([
        ['dilbar', `Yodchi. You walk everywhere. A man, forty, a scar through his eyebrow, laughs with his whole face. Six years ago he went to the Bazaar for thread and didn't come back.|Ёдчи. Ты везде ходишь. Мужчина, сорок лет, шрам через бровь, смеётся всем лицом. Шесть лет назад пошёл на Базар за нитками и не вернулся.|Yodchi. Sen hamma yerga borasan. Bir erkak, qirq yoshda, qoshida chandiq bor, butun yuzi bilan kuladi. Olti yil oldin Bozorga ip olgani ketib, qaytmagan.`],
        ['dilbar', `His name was Farrukh. It still is, I suppose. This is his daughter. She's never heard him laugh.|Его звали Фаррух. Наверное, и сейчас зовут. Это его дочь. Она ни разу не слышала, как он смеётся.|Ismi Farrux edi. Hozir ham shundaydir. Bu uning qizi. U otasining kulganini bir marta ham eshitmagan.`],
        () => (sado() ? ['sado', `Farrukh? Our Farrukh? The one who sells happy days by the cup?|Фаррух? Наш Фаррух? Тот, что продаёт счастливые дни на разлив?|Farrux? Bizning Farruxmi? Baxtli kunlarni piyolalab sotadiganimi?`] : null)
      ], () => { FAC.begin('sd7', `Dilbar at the Potters' Quarter is looking for her husband Farrukh, who left six years ago. The memory-dealer Farrukh sits on the Bazaar at night.|Дильбар из Квартала гончаров ищет мужа, Фарруха, который ушёл шесть лет назад. Торговец памятью Фаррух по ночам сидит на Базаре.|Kulollar mahallasidagi Dilbar olti yil oldin ketgan eri Farruxni qidiryapti. Xotira savdogari Farrux kechalari Bozorda o'tiradi.`, ['bazaar', 'farrukh_n']); d(); });
      return;
    }
    play([['dilbar', `Did you find him? Don't tell me he's dead. Tell me anything else.|Нашёл? Только не говори, что он умер. Скажи что угодно другое.|Topdingmi? Faqat o'lgan dema. Boshqa har narsani ayt.`]], d);
  };
  FAC.talk.farrukh_n = d => play([
    ['farrukh', `Yodchi! Sit. Tonight I've got a summer afternoon from the Ark, a first kiss from the Rabat, and a wedding where nobody fought. Pick one. They're all mine; I'm sharing.|Ёдчи! Садись. Сегодня у меня летний полдень из Арка, первый поцелуй из Рабата и свадьба, где никто не подрался. Выбирай. Все мои, я делюсь.|Yodchi! O'tir. Bugun menda Arkdan yozgi tush, Rabotdan birinchi o'pich va hech kim urishmagan to'y bor. Tanla. Hammasi meniki, bo'lishyapman.`],
    ['hero', `Dilbar is looking for you. Your daughter is six.|Тебя ищет Дильбар. Твоей дочери шесть.|Seni Dilbar qidiryapti. Qizing olti yoshda.`],
    ['', `For a moment the laugh stays on his face with nothing behind it, like a lamp after the flame's gone.|На миг смех остаётся у него на лице, а за ним — ничего, как лампа без огня.|Bir lahza kulgi yuzida qoladi, ortida esa hech narsa yo'q, xuddi olovsiz chiroqdek.`],
    ['farrukh', `I know. I know, yodchi. I've got eleven happy afternoons a night and none of them is mine. If I go home I go home empty. Without them I'm a man who left for thread.|Знаю. Знаю, ёдчи. У меня одиннадцать счастливых вечеров за ночь, и ни один не мой. Если вернусь, вернусь пустым. Без них я — человек, который ушёл за нитками.|Bilaman. Bilaman, yodchi. Menda bir kechada o'n bitta baxtli oqshom bor, birortasi meniki emas. Uyga qaytsam, bo'm-bo'sh qaytaman. Ularsiz men ip olgani ketgan odamman.`]
  ], () => ask(`Farrukh is holding a bowl of someone else's summer.|Фаррух держит пиалу чужого лета.|Farrux qo'lida birovning yozi to'la piyolani tutib turibdi.`, [
    { id: 'home', label: `"Go home. Be empty there. They'll fill you up slower, but it'll be yours."|«Иди домой. Будь пустым там. Они будут заполнять тебя медленнее, зато своим».|«Uyga bor. O'sha yerda bo'sh bo'l. Ular seni sekinroq to'ldirishadi, lekin o'zingniki bilan».` },
    { id: 'stay', label: `"Stay. I'll tell her you're laughing somewhere."|«Оставайся. Скажу ей, что ты где-то смеёшься».|«Qol. Unga qayerdadir kulib yuribdi, deyman».` },
    { id: 'divan', label: `"The Divan pays for men who trade in stolen memories. A hundred tilla. To her."|«Диван платит за тех, кто торгует краденой памятью. Сто тилла. Ей».|«Devon o'g'irlangan xotira savdogarlari uchun pul to'laydi. Yuz tilla. Unga».` }
  ], o => {
    sf('sd7_found', 1);
    const lines = {
      home: [['', `He walks home with you, slower and slower, as the borrowed joys leave him. At Dilbar's gate he can barely stand. He doesn't laugh. His daughter looks at him for a long time and then gives him her doll.|Он идёт с тобой домой, всё медленнее, по мере того как чужие радости его оставляют. У ворот Дильбар он еле стоит. Он не смеётся. Дочка долго смотрит на него, а потом отдаёт ему свою куклу.|U sen bilan uyga boradi, olingan quvonchlar uni tark etgani sari sekinlashib. Dilbarning darvozasi oldida zo'rg'a turadi. Kulmaydi. Qizchasi unga uzoq qarab turadi, keyin qo'g'irchog'ini beradi.`]],
      stay: [['farrukh', `Thank you. Here — a sunset, from the Withers. On the house. Don't drink it all at once.|Спасибо. Вот, закат с Холки. За счёт заведения. Не пей всё сразу.|Rahmat. Mana — Qo'ng'irdan quyosh botishi. Mendan sovg'a. Hammasini birdan ichma.`]],
      divan: [['', `Two Divan guards take Farrukh off the Bazaar the next morning. He's laughing when they take him, because the bowl in his hand is still full. Dilbar gets a hundred tilla and a stamped paper.|Наутро двое стражников Дивана уводят Фарруха с Базара. Его уводят смеющимся: пиала в руке ещё полна. Дильбар получает сто тилла и бумагу с печатью.|Ertasi kuni ertalab ikki Devon soqchisi Farruxni Bozordan olib ketadi. Uni kulib turgan holda olib ketishadi: qo'lidagi piyola hali to'la. Dilbar yuz tilla va muhrli qog'oz oladi.`]]
    }[o.id];
    if (o.id === 'home') { rep('tail', 1); }
    if (o.id === 'stay') { gold(25); }
    if (o.id === 'divan') { rep('divan', 2); rep('tail', -1); }
    play(lines, () => { FAC.finish('sd7', o.id, { home: `Farrukh went home to Dilbar, empty. His daughter gave him her doll.|Фаррух вернулся домой к Дильбар — пустым. Дочка отдала ему куклу.|Farrux Dilbarning oldiga bo'm-bo'sh qaytdi. Qizchasi unga qo'g'irchog'ini berdi.`, stay: `Farrukh stayed on the Bazaar with his borrowed joys. Dilbar was told nothing true.|Фаррух остался на Базаре со своими чужими радостями. Дильбар ничего правдивого не сказали.|Farrux olingan quvonchlari bilan Bozorda qoldi. Dilbarga rost hech narsa aytilmadi.`, divan: `You handed Farrukh to the Divan. Dilbar got a hundred tilla.|Ты сдал Фарруха Дивану. Дильбар получила сто тилла.|Farruxni Devonga topshirding. Dilbar yuz tilla oldi.` }[o.id]); d(); });
  }));
  SIDE.epi('sd7', () => ({ home: `Farrukh learned to laugh again, badly, at his daughter's jokes. It took four years. She says it was worth the wait. He doesn't remember a single borrowed afternoon.|Фаррух снова научился смеяться — плохо, над шутками дочки. Ушло четыре года. Она говорит, оно того стоило. Ни одного чужого вечера он не помнит.|Farrux yana kulishni o'rgandi — yomon, qizining hazillariga. To'rt yil ketdi. Qizi bunga arziydi deydi. U birorta olingan oqshomni eslamaydi.`, divan: `Farrukh is in the Divan's cellars, they say, laughing. Dilbar keeps the stamped paper in a box with his thread.|Говорят, Фаррух в подвалах Дивана — и смеётся. Дильбар держит бумагу с печатью в коробке с его нитками.|Aytishlaricha, Farrux Devon yerto'lalarida — kulib o'tiribdi. Dilbar muhrli qog'ozni uning iplari bilan birga qutida saqlaydi.`, stay: null }[br('sd7')] || null), 'tail:doorstep');

  /* ================================================================ 9 · THE BLIND CARTOGRAPHER */
  SIDE.quest('sd9', { n: 9, title: `The Blind Cartographer|Слепой картограф|Ko'r xaritachi`, where: ['bazaar', 'carto'] });
  FAC.spot('karez', 'sd9cache', 0.18);
  const carto = () => G.WORLD2.npcs.cartographer;
  s6init(() => {
    const n = carto(); if (!n) return;
    const talk0 = n.talk;
    n.talk = function (done) {
      if (q('sd9').st === 'none' && Object.keys((G.WORLD2.S() || {}).charts || {}).length >= 1) {
        play([
          ['', `As he hands you a map, his fingers find the edge of your hand and read it, like a page. His eyes are white.|Протягивая карту, он пальцами находит край твоей ладони и читает её, как страницу. Глаза у него белые.|Xaritani uzatayotib, barmoqlari bilan kaftingning chetini topib, uni sahifadek o'qiydi. Ko'zlari oppoq.`],
          ['', `"I draw the city as it was before the Small Awakening. The streets haven't moved as much as people think. ...There's one map I don't sell. It goes to a place the Singers filled with something and sealed."|«Я рисую город таким, каким он был до Малого пробуждения. Улицы сдвинулись меньше, чем думают. ...Одну карту я не продаю. Она ведёт туда, где Певцы что-то спрятали и запечатали».|«Shaharni Kichik uyg'onishgacha qanday bo'lsa, shunday chizaman. Ko'chalar odamlar o'ylaganchalik siljimagan. ...Bitta xaritani sotmayman. U xonandalar nimanidir yashirib, muhrlab qo'ygan joyga olib boradi».`],
          ['', `"They know I remember it. Twice now a novice has come asking after my health."|«Они знают, что я это помню. Уже дважды заходила послушница, спрашивала о моём здоровье».|«Ular buni eslashimni bilishadi. Ikki marta shogird qiz kelib, sog'ligimni so'radi».`]
        ], () => ask(`The old man waits with his blind face turned to you.|Старик ждёт, повернув к тебе слепое лицо.|Chol ko'r yuzini senga burib kutib turibdi.`, [
          { id: 'buy', price: 120, label: `"Sell it to me. A hundred and twenty."|«Продай мне её. Сто двадцать».|«Uni menga sot. Bir yuz yigirma».` },
          FAC.craft('take', `the map out of his head while he talks|карту у него из головы, пока он говорит|xaritani u gapirayotganda boshidan`, { id: 'take' }),
          { id: 'protect', label: `"The next novice who asks after your health will deal with me. Pack a bag; the Rabat is quiet."|«Следующая послушница, что спросит о твоём здоровье, будет иметь дело со мной. Собирай мешок: в Рабате тихо».|«Sog'lig'ingni so'ragan keyingi shogird men bilan gaplashadi. Xaltangni yig': Rabotda tinch».` },
          { id: 'later', label: `"Not now."|«Не сейчас».|«Hozir emas».` }
        ], o => {
          if (o.id === 'later') { done(); return; }
          if (o.id === 'buy' && (G.run.gold || 0) < 120) { play([['', `"A hundred and twenty is a hundred and twenty," he says gently.|«Сто двадцать — это сто двадцать», — мягко говорит он.|«Bir yuz yigirma — bu bir yuz yigirma», — deydi u muloyim.`]], done); return; }
          if (o.id === 'buy') gold(-120);
          if (o.id === 'take') FAC.takeMem(`a blind man's old city|старый город слепого|ko'r odamning eski shahri`);
          if (o.id === 'protect') { rep('singers', -2); rep('rabat', 1); }
          sf('sd9way', o.id);
          FAC.begin('sd9', { buy: `You bought the cartographer's last map. It leads to a sealed Singers' place in the upper karez.|Ты купил у картографа последнюю карту. Она ведёт в запечатанное место Певцов в верхних кяризах.|Xaritachidan oxirgi xaritani sotib olding. U yuqori korizlardagi xonandalarning muhrlangan joyiga olib boradi.`, take: `You took the cartographer's old city out of his head. The way to the Singers' sealed place is yours; he no longer knows the streets he drew.|Ты забрал из головы картографа его старый город. Путь к запечатанному месту Певцов — твой; улиц, которые он рисовал, он больше не знает.|Xaritachining boshidan eski shaharni olding. Xonandalarning muhrlangan joyiga yo'l endi seniki; u chizgan ko'chalarini endi bilmaydi.`, protect: `You sent the cartographer to the Rabat, away from the Singers. He drew you the map on the way, by touch.|Ты отправил картографа в Рабат, подальше от Певцов. По дороге он на ощупь нарисовал тебе карту.|Xaritachini xonandalardan uzoqqa, Rabotga jo'natding. Yo'lda u senga xaritani paypaslab chizib berdi.` }[o.id], ['karez', 'sd9cache']);
          play([['', { buy: `He folds the map once, carefully, like a letter to someone he loved.|Он аккуратно складывает карту один раз — как письмо тому, кого любил.|U xaritani bir marta, ehtiyotkorlik bilan — sevgan odamiga yozgan xatdek buklaydi.`, take: `He stops in the middle of a sentence about a street that no longer exists, and smiles, puzzled, at the empty paper in front of him.|Он замолкает посреди фразы об улице, которой больше нет, и озадаченно улыбается чистому листу перед собой.|U endi yo'q ko'cha haqidagi gap o'rtasida to'xtab, oldidagi bo'sh qog'ozga hayron jilmayadi.`, protect: `"The Rabat. I've never been. I'll draw it badly and sell it dear."|«Рабат. Никогда там не был. Нарисую плохо и продам дорого».|«Rabot. U yerda hech bo'lmaganman. Yomon chizib, qimmatga sotaman».` }[o.id]]], done);
        }));
        return;
      }
      if (sf('sd9way') === 'protect' && G.WORLD2.active === 'bazaar') { done(); return; }
      return talk0.apply(this, arguments);
    };
  });
  FAC.prop('karez', 'sd9cache', { id: 'sd9cache', art: 'f6chest', prompt: `The Singers' sealed niche|Запечатанная ниша Певцов|Xonandalarning muhrlangan tokchasi`, when: () => act('sd9'), use: d => play([
    ['', `Behind the Singers' seal: shelves of tumars, every one labelled in a novice's hand with a street that no longer exists. The city before the Small Awakening, kept on wax.|За печатью Певцов — полки тумаров, на каждом рукой послушницы подписана улица, которой больше нет. Город до Малого пробуждения, сохранённый на воске.|Xonandalar muhri ortida — tumarlar to'la tokchalar, har biriga shogird qo'li bilan endi yo'q ko'chaning nomi yozilgan. Kichik uyg'onishgacha bo'lgan shahar, mumda saqlangan.`],
    () => (sado() ? ['sado', `They kept the old city, and told everyone it was lost. Why keep it, unless you want it back?|Они сохранили старый город, а всем сказали, что он потерян. Зачем хранить, если не хочешь вернуть?|Ular eski shaharni saqlab qolishgan-u, hammaga yo'qolgan deyishgan. Qaytarib olmoqchi bo'lmasang, nega saqlaysan?`] : null)
  ], () => ask(`A whole city on the shelves.|Целый город на полках.|Tokchalarda butun bir shahar.`, [
    { id: 'sell', label: `Take what you can carry to Farrukh's buyers.|Унести сколько сможешь для покупателей Фарруха.|Farruxning xaridorlari uchun ko'tara olganingcha olish.` },
    { id: 'remember', label: `Take them to Those Who Remember.|Отнести Помнящим.|Eslaydiganlarga olib borish.` },
    { id: 'leave', label: `Leave them sealed. Tell nobody.|Оставить запечатанными. Никому не говорить.|Muhrlangan holda qoldirish. Hech kimga aytmaslik.` }
  ], o => {
    if (o.id === 'sell') { gold(150); rep('singers', -1); }
    if (o.id === 'remember') { rep('remember', 2); rep('singers', -2); }
    FAC.finish('sd9', o.id, { sell: `You sold the Singers' old-city tumars on the quiet. A hundred and fifty tilla.|Ты тихо продал тумары старого города. Сто пятьдесят тилла.|Eski shahar tumarlarini jimgina sotding. Bir yuz ellik tilla.`, remember: `You carried the old city to Those Who Remember.|Ты отнёс старый город Помнящим.|Eski shaharni Eslaydiganlarga olib bording.`, leave: `You left the old city sealed in the karez.|Ты оставил старый город запечатанным в кяризе.|Eski shaharni korizda muhrlangan holda qoldirding.` }[o.id]);
    d();
  })) });

  /* ================================================================ 19 · OSHIQ FOR EVERYTHING */
  SIDE.quest('sd19', { n: 19, title: `Oshiq for Everything|Ошиқ на всё|Hamma narsaga Oshiq`, where: ['bazaar', 'osh_sanjar'] });
  s6init(() => {
    const talk0 = FAC.talk.osh_sanjar;
    FAC.talk.osh_sanjar = d => {
      const s = OSHIQ.S();
      if (!s.champion || done('sd19')) return talk0(d);
      play([
        ['op_sanjar', `You beat me for tilla. Tilla is boring. Play me for the only thing I've got left: the day I first won. I was nine. My father carried me on his shoulders round the whole Bazaar.|Ты обыграл меня на тиллу. Тилла — скука. Сыграй со мной на единственное, что у меня осталось: день, когда я впервые выиграл. Мне было девять. Отец нёс меня на плечах через весь Базар.|Meni tillaga yutding. Tilla zerikarli. Menda qolgan yagona narsaga o'yna: birinchi yutgan kunimga. To'qqiz yoshda edim. Otam meni yelkasida butun Bozor bo'ylab olib yurgan.`],
        ['op_sanjar', `If you win, you take it. If I win, I keep it, and you owe me a story. Deal?|Выиграешь — забираешь. Выиграю я — оставляю себе, а ты мне должен историю. По рукам?|Yutsang — olasan. Men yutsam — o'zimda qoladi, sen menga bitta hikoya qarzdor bo'lasan. Kelishdikmi?`]
      ], () => ask(`Sanjar is already shaking the bones.|Санжар уже трясёт альчики.|Sanjar allaqachon oshiqlarni silkitayapti.`, [
        { id: 'mem', label: `"Deal. Your best day against a story."|«По рукам. Твой лучший день против истории».|«Kelishdik. Sening eng yaxshi kuning — hikoyaga qarshi».` },
        { id: 'money', label: `"Play me for tilla. Keep your day."|«Сыграем на тиллу. День оставь себе».|«Tillaga o'ynaymiz. Kuningni o'zingda qoldir».` },
        { id: 'lose', label: `"Deal." And lose on purpose.|«По рукам». И нарочно проиграть.|«Kelishdik». Va ataylab yutqazish.` },
        { id: 'cheat', label: `"Deal." And plan to cheat.|«По рукам». И задумать жульничество.|«Kelishdik». Va aldashni rejalash.` }
      ], o => {
        if (o.id === 'lose') { FAC.finish('sd19', 'lose', `You lost to Sanjar on purpose. He kept his best day and knew exactly what you'd done.|Ты нарочно проиграл Санжару. Он сохранил свой лучший день — и прекрасно понял, что ты сделал.|Sanjarga ataylab yutqazding. U eng yaxshi kunini saqlab qoldi — va nima qilganingni juda yaxshi tushundi.`); rep('tail', 1); play([['op_sanjar', `...You threw that. Badly, on purpose. ...Thank you. Now tell me a story. A short one; I'm old.|...Ты слил. Нарочно, неуклюже. ...Спасибо. Теперь расскажи историю. Короткую, я старый.|...Ataylab yutqazding. Qo'pol qilib. ...Rahmat. Endi hikoya aytib ber. Qisqasini, men qariman.`]], d); return; }
        OSHIQ.play({ opp: 'sanjar', stake: o.id === 'money' ? 60 : 0, cheat: o.id === 'cheat', onEnd: res => {
          const G0 = OSHIQ.G;
          if (o.id === 'money') { if (res === 'win') gold(60); else gold(-Math.min(60, G.run.gold || 0)); FAC.finish('sd19', 'money', `You played Sanjar for tilla and left him his best day.|Ты играл с Санжаром на тиллу и оставил ему его лучший день.|Sanjar bilan tillaga o'ynading va eng yaxshi kunini unga qoldirding.`); d(); return; }
          if (G0.caught) { rep('tail', -2); FAC.finish('sd19', 'caught', `You were caught cheating Sanjar for his best day. The whole Bazaar saw.|Тебя поймали на жульничестве в игре на лучший день Санжара. Весь Базар видел.|Sanjarning eng yaxshi kuniga o'ynab, aldayotganingda qo'lga tushding. Butun Bozor ko'rdi.`); play([['op_sanjar', `Out. And tell the yodchis: the Bazaar remembers a cheat longer than a debt.|Вон. И передай ёдчи: Базар помнит жулика дольше, чем должника.|Chiq. Yodchilarga ayt: Bozor aldoqchini qarzdordan ham uzoqroq eslaydi.`]], d); return; }
          if (res === 'win') {
            FAC.takeMem(`a boy on his father's shoulders|мальчишка на плечах у отца|otasining yelkasidagi bola`);
            FAC.finish('sd19', 'took', `You won Sanjar's best day: a boy of nine on his father's shoulders. It's yours now. He has one less reason to play.|Ты выиграл лучший день Санжара: девятилетний мальчишка на плечах у отца. Теперь он твой. У Санжара на одну причину играть меньше.|Sanjarning eng yaxshi kunini yutib olding: otasining yelkasidagi to'qqiz yoshli bola. Endi u seniki. Sanjarda o'ynash uchun bitta sabab kamaydi.`);
            play([['', `You hum the Take over the carpet. Sanjar smiles politely at you, the way you smile at a stranger, and starts to put the bones away as if he couldn't remember why he'd ever liked them.|Ты напеваешь Взятие над ковром. Санжар вежливо улыбается тебе, как незнакомцу, и начинает убирать альчики, будто не может вспомнить, чем они ему когда-то нравились.|Gilam ustida Olish kuyini xirgoyi qilasan. Sanjar senga notanishga jilmaygandek xushmuomala jilmayadi va oshiqlarni yig'ishtira boshlaydi, go'yo ular qachonlardir nega yoqqanini eslay olmayotgandek.`]], d);
          } else { FAC.finish('sd19', 'lost', `Sanjar won and kept his best day. You owe him a story.|Санжар выиграл и сохранил свой лучший день. Ты должен ему историю.|Sanjar yutdi va eng yaxshi kunini saqlab qoldi. Sen unga bitta hikoya qarzdorsan.`); play([['op_sanjar', `Pay up. A story. A true one, about a yodchi who loses.|Плати. Историю. Правдивую — про ёдчи, который проигрывает.|To'la. Hikoya. Rost bo'lsin — yutqazgan yodchi haqida.`]], d); }
        } });
      }));
    };
  });
}
