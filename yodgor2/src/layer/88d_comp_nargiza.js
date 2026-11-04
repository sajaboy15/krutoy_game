/* 88d_comp_nargiza.js — Nargiza's arc "Bekzod" (GDD ch. 7).
     1 The Voice in the Well   (the karez / the Well)    she asks you down with her; she hears that his word is a name
     2 The Debt Book           (the Cloister archive)    her brother Bekzod, taken ten years ago for a water debt; signed "A."
     3 The Brother's Tumar     (the Tower of Silence)    his memory, sold and thrown on the heaps: taste it — you see the captain
     4 The Question            (the Spine)               71_act2.js: F().nargizaQ = believes | returned | silenced
     5 The Song                (the finale)              72_act3.js: if she believes, she can sing the tale
   Key nodes: key_alla (step 3 — she sings the lullaby to her brother's tumar), believed (step 4 believes), key_ustoz
   (step 4 returned). If you burn her gift out (silenced) she leaves you. Step 3 is where the knot (88f) begins: you see
   Alp's face before she does. */
{
  CAST.bekzod = { name: `Bekzod|Бекзод|Bekzod`, portrait: null };
  const has = COMP.has, w = COMP.with, arc = COMP.arc, f = COMP.f;
  const N = n => COMP.app('nargiza', n, 'arc');

  /* ---------------------------------------------------------------- 1 · The Voice in the Well */
  COMP.beat('nar1', () => w('nargiza') && arc('nargiza') >= 1 && ['karez', 'well', 'cistern'].includes(COMP.region()), done => play([
    ['', `Nargiza stops at the water's edge and takes off her shoes, as if entering a house. She puts her palm flat on the wet stone.|Наргиза останавливается у воды и снимает обувь, как на пороге дома. Кладёт ладонь на мокрый камень.|Nargiza suv bo'yida to'xtab, uyga kirayotgandek oyoq kiyimini yechadi. Kaftini ho'l toshga qo'yadi.`],
    ['nargiza', `There. Hear it? No, you don't. ...It isn't a word. It's a name. His. It starts like water running over a step.|Вот. Слышишь? Нет, не слышишь. ...Это не слово. Это имя. Его. Начинается, как вода, что бежит через ступеньку.|Mana. Eshityapsanmi? Yo'q, eshitmayapsan. ...Bu so'z emas. Bu ism. Uning ismi. Zinadan oqayotgan suvdek boshlanadi.`],
    ['nargiza', `The Ustoz says he has no name. That a name is a handle, and you don't give a sleeping thing a handle.|Устоз говорит, что имени у него нет. Что имя — это ручка, а спящему ручку не дают.|Ustoz uning ismi yo'q, deydi. Ism — dasta, uxlayotgan narsaga dasta berilmaydi, deydi.`],
    () => (sadoAwake() ? ['sado', `A handle. So you can pick him up. ...Or so he can pick himself up.|Ручка. Чтобы его можно было поднять. ...Или чтобы он сам поднялся.|Dasta. Uni ko'tarish uchun. ...Yoki o'zi turishi uchun.`] : null)
  ], () => ask(`Nargiza is still listening.|Наргиза всё ещё слушает.|Nargiza hamon quloq solyapti.`, [
    { id: 'push', label: `"Then find out the rest of it."|«Тогда узнай остальное.»|«Unda qolganini bilib ol.»` },
    { id: 'careful', label: `"A name is a handle for whoever holds it. Be careful who hears you."|«Имя — ручка для того, кто её держит. Смотри, кто тебя слышит.»|«Ism — kim ushlasa, o'shaning dastasi. Kim eshitayotganiga ehtiyot bo'l.»` }
  ], o => {
    N(o.id === 'push' ? 10 : 5); arc('nargiza', 2); f('nar1', o.id);
    play([['nargiza', o.id === 'push' ? `I will. It'll take me a while. He talks slower than Alp.|Узнаю. Не сразу. Он говорит медленнее Алпа.|Bilib olaman. Darrov emas. U Alpdan ham sekin gapiradi.` : `You sound like her. ...But you're right. I'll whisper.|Говоришь, как она. ...Но ты прав. Буду шептать.|Xuddi unga o'xshab gapirasan. ...Lekin haqsan. Shivirlab aytaman.`]], () => {
      COMP.note('nargiza', `Down by the water Nargiza heard that the Sleeper's word is a name. In the Cloister archive there are debt books; she wants to look for something there.|Внизу, у воды, Наргиза услышала: слово Спящего — это имя. В архиве Обители лежат долговые книги, она хочет кое-что там найти.|Pastda, suv bo'yida, Nargiza Uxlovchining so'zi ism ekanini eshitdi. Xonaqoh arxivida qarz daftarlari bor, u yerda nimanidir topmoqchi.`, ['cloister', 'books']);
      done();
    });
  })));

  /* ---------------------------------------------------------------- 2 · The Debt Book (the Cloister archive) */
  COMP.beat('nar2', () => w('nargiza') && arc('nargiza') >= 2 && COMP.near('cloister', 'books', 120), done => play([
    ['', `Nargiza pulls a ledger from the bottom shelf, the one no novice is allowed to reach, and runs her finger down the years.|Наргиза вытаскивает книгу с нижней полки, до которой послушницам тянуться не положено, и ведёт пальцем по годам.|Nargiza shogirdlarga qo'l cho'zish man etilgan pastki tokchadan daftarni tortib oladi va barmog'ini yillar bo'ylab yurgizadi.`],
    ['nargiza', `Here. "Bekzod, son of a water-carrier, seventeen. Taken for the family's water debt. Delivered to the Divan by the captain's men." And a letter. "A."|Вот. «Бекзод, сын водоноса, семнадцать лет. Взят за долг семьи за воду. Доставлен в Диван людьми капитана». И буква. «А».|Mana. «Bekzod, mesqobchining o'g'li, o'n yetti yosh. Oilaning suv qarzi uchun olingan. Kapitanning odamlari tomonidan Devonga topshirilgan». Va bitta harf. «A».`],
    ['nargiza', `My brother. I came to the Singers to find this page. Ten years of singing, and it was on the bottom shelf.|Мой брат. Я пришла к Певцам, чтобы найти эту страницу. Десять лет пения — а она лежала на нижней полке.|Akam. Xonandalarga shu sahifani topish uchun kelganman. O'n yil kuyladim — u esa pastki tokchada yotgan ekan.`],
    () => (F().alpTumars ? ['', `"A." You have seen that letter before: at the foot of every lot in a Divan ledger in the Swallowed Streets.|«А». Ты уже видел эту букву: внизу каждого лота в книге Дивана, в Проглоченных улицах.|«A». Bu harfni avval ko'rgansan: Yutilgan ko'chalardagi Devon daftaridagi har bir lot tagida.`] : null)
  ], () => {
    arc('nargiza', 3); N(5);
    if (F().alpTumars) f('knotKnown', 'book');
    COMP.note('nargiza', `Cloister archive: "Bekzod, son of a water-carrier, seventeen. Taken for the family's water debt. Delivered to the Divan by the captain's men. A." Unsold memories go to the Tower's heaps.|В архиве Обители: «Бекзод, сын водоноса, семнадцать лет. Взят за долг семьи за воду. Доставлен в Диван людьми капитана. А.» Проданные Диваном памяти кончают на кучах у Башни молчания.|Xonaqoh arxivida: «Bekzod, mesqobchining o'g'li, o'n yetti yosh. Oilaning suv qarzi uchun olingan. Kapitanning odamlari tomonidan Devonga topshirilgan. A.» Devon sotgan xotiralar Sukunat minorasidagi uyumlarga tushadi.`, ['tower', 'nar_heap']);
    play([['nargiza', `The Divan sells what it takes, and what nobody buys goes to the Tower, to the heaps. If any of him is left, it's there.|Диван продаёт то, что забирает, а что никто не купил, уходит в Башню, на кучи. Если от него что-то осталось, то там.|Devon olganini sotadi, hech kim olmaganini esa Minoraga, uyumlarga tashlaydi. Undan biror narsa qolgan bo'lsa, o'sha yerda.`]], done);
  }));

  /* ---------------------------------------------------------------- 3 · The Brother's Tumar (the Tower of Silence) */
  FAC.spot('tower', 'nar_heap', 0.34);
  FAC.prop('tower', 'nar_heap', {
    id: 'bekzod', art: 'f6glint', prompt: `A tumar with a boy's name on the cord|Тумар с мальчишеским именем на шнурке|Ipiga bola ismi yozilgan tumar`,
    when: () => arc('nargiza') >= 3 && has('nargiza') && !f('bekzod'),
    use: d => FAC.taste([
      ['memory', `The Rabat road at dawn. A rope runs from wrist to wrist along a line of young men. The last one is seventeen and whistling to keep from crying.|Рабатская дорога на рассвете. Верёвка тянется от запястья к запястью вдоль цепочки парней. Последнему семнадцать, он свистит, чтобы не заплакать.|Tongda Rabot yo'li. Arqon yigitlar qatori bo'ylab bilakdan bilakka tortilgan. Oxirgisi o'n yetti yoshda, yig'lab yubormaslik uchun hushtak chalyapti.`],
      ['memory', `A rider comes back along the line, huge, in captain's red. He looks at the boy's whistle as if it were a coin, and then at the boy. His eyes are full. All the way full.|Вдоль цепочки едет обратно всадник — огромный, в красном капитанском. Смотрит на свисток мальчишки, как на монету, потом на самого мальчишку. Глаза у него полные. До краёв.|Qator bo'ylab ulkan, qizil kapitan kiyimidagi otliq qaytib keladi. Bolaning hushtagiga tangaga qaragandek, keyin bolaning o'ziga qaraydi. Ko'zlari to'la. Limmo-lim.`],
      ['memory', `"Lot sixty," the captain says. "Note it." It is Alp's voice. Younger, and without the pauses.|«Лот шестьдесят, — говорит капитан. — Запиши». Это голос Алпа. Моложе — и без пауз.|«Oltmishinchi lot, — deydi kapitan. — Yozib qo'y». Bu Alpning ovozi. Yoshroq — va to'xtalishlarsiz.`]
    ], () => {
      f('knotKnown', 'tumar'); arc('nargiza', 3);
      ask(`Bekzod's tumar is warm in your hand. Nargiza is coming up the path.|Тумар Бекзода тёплый в руке. По тропе поднимается Наргиза.|Bekzodning tumari qo'lingda iliq. So'qmoqdan Nargiza chiqib kelyapti.`, [
        { id: 'give', label: `Give it to her whole, the captain's face and all.|Отдать целиком — вместе с лицом капитана.|Butunligicha berish — kapitanning yuzi bilan birga.` },
        FAC.craft('take', `the captain's face out of it before you give it to her|из него лицо капитана, прежде чем отдать|undan kapitanning yuzini, berishdan oldin`, { id: 'cut' }),
        { id: 'keep', label: `Put it away. Tell her the heaps were empty.|Спрятать. Сказать ей, что в кучах пусто.|Yashirib qo'yish. Unga uyumlar bo'sh edi, deyish.` }
      ], o => {
        f('bekzod', o.id);
        const fin = () => { COMP.note('nargiza', o.id === 'keep' ? `You found Bekzod's tumar on the heaps and told Nargiza there was nothing there. It's in your satchel.|Ты нашёл тумар Бекзода на кучах и сказал Наргизе, что там ничего нет. Он у тебя в сумке.|Bekzodning tumarini uyumlardan topding va Nargizaga u yerda hech narsa yo'q deding. U xaltangda.` : `Nargiza has her brother's tumar.|У Наргизы теперь тумар её брата.|Nargizada endi akasining tumari bor.`); d(); };
        if (o.id === 'keep') { N(-5); play([['nargiza', `Nothing? ...Of course. Ten years. Why would anything wait ten years.|Ничего? ...Ну конечно. Десять лет. С чего бы чему-то ждать десять лет.|Hech narsa? ...Albatta-da. O'n yil. Nega biror narsa o'n yil kutib tursin.`], () => (sadoAwake() ? ['sado', `She knows when people lie. She's just tired.|Она чувствует, когда врут. Она просто устала.|U yolg'onni sezadi. Shunchaki charchagan.`] : null)], fin); return; }
        if (o.id === 'cut') FAC.takeMem(`a captain's face|лицо капитана|kapitanning yuzi`);
        COMP.flag('nargiza', 'key_alla', 1); N(o.id === 'give' ? 15 : 10);
        play([
          ['', `Nargiza holds the tumar to her ear for a long time. Then she sings to it, very quietly: "Alla". The lullaby every mother in the Tail knows.|Наргиза долго держит тумар у уха. Потом тихо-тихо поёт ему: «Алла». Колыбельную, которую знает каждая мать в Хвосте.|Nargiza tumarni uzoq vaqt qulog'iga tutib turadi. Keyin unga juda sekin kuylaydi: «Alla». Dumdagi har bir ona biladigan alla.`],
          ['nargiza', o.id === 'give' ? `He whistled. He always whistled when he was scared. ...There's a man on a horse. I can't see his face, the light's behind him. Not yet.|Он свистел. Он всегда свистел, когда боялся. ...Там человек на коне. Лица не видно, свет за спиной. Пока.|U hushtak chalardi. Qo'rqqanda doim hushtak chalardi. ...U yerda otliq odam bor. Yuzi ko'rinmayapti, yorug'lik orqasida. Hozircha.` : `He whistled. He always whistled when he was scared. ...There's a man on a horse, but where his face should be there's nothing. Like a coin rubbed flat.|Он свистел. Он всегда свистел, когда боялся. ...Там человек на коне, а там, где должно быть лицо, — пусто. Как стёртая монета.|U hushtak chalardi. Qo'rqqanda doim hushtak chalardi. ...U yerda otliq odam bor, yuzi bo'lishi kerak joyda esa — hech narsa. Silliqlanib ketgan tangadek.`]
        ], fin);
      });
    }, { intro: `The cord says BEKZOD in a scribe's neat hand. You press the wax to your lips.|На шнурке аккуратным почерком писаря: БЕКЗОД. Прижимаешь воск к губам.|Ipga mirzaning chiroyli xatida BEKZOD deb yozilgan. Mumni labingga bosasan.` })
  });

  /* ---------------------------------------------------------------- 4 · after the Question (71): what it means for her */
  COMP.beat('nar4', () => F().nargizaQ && has('nargiza'), done => {
    arc('nargiza', 4);
    const q = F().nargizaQ;
    if (q === 'believes') { COMP.flag('nargiza', 'believed', 1); COMP.note('nargiza', `On the Spine Nargiza chose to believe the Sleeper's voice. She knows his name now: Obi-Hayot.|На Хребте Наргиза решила поверить голосу Спящего. Теперь она знает его имя: Оби-Хаёт.|Umurtqada Nargiza Uxlovchining ovoziga ishonishni tanladi. Endi uning ismini biladi: Obi-Hayot.`); done(); return; }
    if (q === 'returned') { COMP.flag('nargiza', 'key_ustoz', 1); COMP.note('nargiza', `On the Spine Nargiza went back to her Ustoz. She still walks with you, for now.|На Хребте Наргиза вернулась к Устоз. Пока что она всё ещё ходит с тобой.|Umurtqada Nargiza ustoziga qaytdi. Hozircha hali sen bilan yuribdi.`); done(); return; }
    // silenced: you burned the gift out of her; she goes
    f('nargizaEnd', 'left');
    play([
      ['nargiza', `It's so quiet. I used to pray for this. ...I can't stand to look at you, yodchi. Not because you're cruel. Because you were sure.|Так тихо. Я когда-то молилась об этом. ...Не могу на тебя смотреть, ёдчи. Не потому что ты жестокий. Потому что ты был уверен.|Juda jimjit. Qachonlardir shuni so'rab duo qilardim. ...Senga qarolmayman, yodchi. Shafqatsiz bo'lganing uchun emas. Ishonch bilan qilganing uchun.`]
    ], () => { G.PARTY.leave('nargiza', 'silenced'); COMP.end('nargiza', 'left', `You burned the hearing out of Nargiza. She went back to the Cloister without a word.|Ты выжег из Наргизы её слух. Она молча вернулась в Обитель.|Nargizaning eshitish qobiliyatini kuydirib tashlading. U indamay xonaqohga qaytdi.`); done(); });
  });

  /* ---------------------------------------------------------------- 5 · The Song (72 plays it; the arc closes when the story ends) */
  COMP.beat('nar5', () => has('nargiza') && COMP.story('a3_house') && !f('nargizaEnd'), done => {
    arc('nargiza', 5);
    const q = F().nargizaQ;
    play([['nargiza', q === 'believes'
      ? `If it comes to it, I'll sing him the tale. I've been practising on the water. It answers, a little. ...Don't make that face. I'm scared too. I'll hum.|Если дойдёт до этого — я спою ему сказание. Я тренировалась на воде. Она немножко отвечает. ...Не делай такое лицо. Мне тоже страшно. Я буду напевать.|Gap shunga borsa, unga dostonni kuylab beraman. Suvda mashq qildim. U ozgina javob beradi. ...Bunaqa yuz qilma. Men ham qo'rqyapman. Xirgoyi qilaman.`
      : `Whatever you decide down there, decide it out loud. I've had enough of people deciding things for me in whispers.|Что бы ты там внизу ни решил, решай вслух. Хватит с меня того, что за меня решают шёпотом.|U yerda pastda nima hal qilsang ham, ovoz chiqarib hal qil. Men uchun shivirlab qaror qilishlari jonimga tegdi.`]], () => {
      f('nargizaEnd', q === 'believes' ? 'believes' : q || 'none');
      COMP.end('nargiza', f('nargizaEnd'), `Nargiza goes with you to the end.|Наргиза идёт с тобой до конца.|Nargiza sen bilan oxirigacha boradi.`);
      done();
    });
  });
}
