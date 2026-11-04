/* =====================================================================
   Stage 6 — the Singers of the Well: "The voice that holds the city" (GDD ch. 6).
     s1 The Missing Wax       Potters' Quarter   Habiba; the apprentice Umid
     s2 Counted Twice         the Cloister       the debt books; the real Sign of the Well
     s3 The Choir That Won't Sing  the Cloister  the mute novice Malika (Nargiza's secret)
     s4 A Test of Loyalty     Cloister → Tail    Shirin; Ergash the smith; the double-play check
     s5 The Well Is Empty     the Founders' Well Shirin explains
     s6 The Great Tithe       the Dream          help her, or fight "Shirin, Voice of the Well"
   ===================================================================== */
{
  const cat3 = FAC.cat3, cl = FAC.cl, moon = () => (G.WORLD2 ? G.WORLD2.moonPhase() : 0);
  const q = FAC.q, done = FAC.isDone, act = FAC.isActive;
  const open = () => !FAC.arcClosed('singers');
  CAST.habiba = { name: `Habiba, Keeper of the Cloister|Хабиба, хранительница Обители|Xonaqoh saqlovchisi Habiba`, portrait: 'singer' };
  CAST.umid = { name: `Umid|Умид|Umid`, portrait: null };
  CAST.malika = { name: `Malika, a novice|Послушница Малика|Shogird qiz Malika`, portrait: null };
  CAST.ergash = { name: `Ergash-usta|Эргаш-уста|Ergash usta`, portrait: 'davron' };
  const LK = {
    habiba: { robe: '#e8e8f0', trim: '#3a6ab0', skin: '#c8a080', head: 'scarf', headC: '#e8e8f0' },
    umid: { robe: '#8a6a4a', trim: '#f2ead0', skin: '#b08868', head: 'doppi', headC: '#3a2a1a', scale: 0.86 },
    malika: { robe: '#e8e8f0', trim: '#8aa8d8', skin: '#c8a080', head: 'scarf', headC: '#dcdce8', scale: 0.9 },
    ergash: { robe: '#4a3a2a', trim: '#8a6a3a', skin: '#a07858', head: 'doppi', headC: '#1a1a1a', beard: 'long' }
  };

  FAC.quest('s1', { fac: 'singers', n: 1, title: `The Missing Wax|Пропавший воск|Yo'qolgan mum`, where: ['potters', 'wax'], offer: () => open() && moon() <= 1 && FAC.atLeast('singers', 'stranger') });
  FAC.quest('s2', { fac: 'singers', n: 2, title: `Counted Twice|Двойной счёт|Ikki karra hisob`, where: ['cloister', 'books'], offer: () => open() && done('s1') && moon() <= 1 && FAC.atLeast('singers', 'own') });
  FAC.quest('s3', { fac: 'singers', n: 3, title: `The Choir That Won't Sing|Хор, который не поёт|Kuylamaydigan xor`, where: ['cloister', 'books'], offer: () => open() && done('s2') && moon() <= 1 && FAC.atLeast('singers', 'own') });
  FAC.quest('s4', { fac: 'singers', n: 4, title: `A Test of Loyalty|Проверка верности|Sadoqat sinovi`, where: ['cloister', 'story'], offer: () => open() && done('s3') && moon() <= 1 && FAC.atLeast('singers', 'own') });
  FAC.quest('s5', { fac: 'singers', n: 5, title: `The Well Is Empty|Колодец пуст|Quduq bo'sh`, where: ['well', 'candles'], offer: () => open() && done('s4') && moon() === 1 && FAC.atLeast('singers', 'own') && G.WORLD2.story.done('a2_well') });
  FAC.quest('s6', { fac: 'singers', n: 6, title: `The Great Tithe|Великая десятина|Buyuk ushr`, where: ['dream', 'f_final'], offer: () => open() && FAC.br('s5') === 'stay' && moon() >= 2 && FAC.atLeast('singers', 'trusted') });

  /* ---------------------------------------------------------------- people and their hours */
  FAC.npc('habiba', { name: CAST.habiba.name, look: LK.habiba, dx: 34, idle: `Habiba checks a seal against the light and doesn't look up.|Хабиба смотрит печать на свет и не поднимает глаз.|Habiba muhrni yorug'likka tutib ko'radi va boshini ko'tarmaydi.` },
    () => moon() >= 2 ? [] : moon() === 0 ? [{ from: 7, to: 12, region: 'potters', spot: 'wax' }, { from: 12, to: 20, region: 'cloister', spot: 'books' }] : [{ from: 8, to: 20, region: 'cloister', spot: 'books' }]);
  FAC.npc('umid', { name: CAST.umid.name, look: LK.umid, dx: -30, idle: `The apprentice keeps his eyes on the wax and his hands very busy.|Подмастерье не поднимает глаз от воска, а руки у него очень заняты.|Shogird ko'zini mumdan uzmaydi, qo'llari esa juda band.` },
    () => (moon() <= 1 && FAC.br('s1') !== 'handed') ? [{ from: 7, to: 19, region: 'potters', spot: 'kilnyard' }] : []);
  FAC.npc('malika', { name: CAST.malika.name, look: LK.malika, dx: 40, idle: `She smiles, and says nothing. She can't.|Она улыбается и ничего не говорит. Не может.|U jilmayadi, hech narsa demaydi. Gapira olmaydi.` },
    () => (act('s3') || done('s3')) && moon() <= 1 ? [{ from: 8, to: 19, region: 'cloister', spot: 'gate' }] : []);
  FAC.npc('ergash', { name: CAST.ergash.name, look: LK.ergash, dx: 46, idle: `Ergash works the bellows. He nods to you the way he nods to the weather.|Эргаш качает мехи. Кивает тебе так же, как кивает погоде.|Ergash dam bosyapti. Senga ham ob-havoga bosh irg'agandek bosh irg'aydi.` },
    () => (act('s4') || done('s4')) && moon() <= 1 ? [{ from: 7, to: 20, region: 'tail', spot: 'square' }] : []);
  FAC.npc('shirin6', { name: CAST.shirin.name, look: 'shirin', dx: -64, idle: `Shirin is listening to something below the floor.|Ширин прислушивается к чему-то под полом.|Shirin pol ostidagi nimanidir tinglayapti.` },
    () => {
      if (done('s3') && !done('s4') && open() && moon() <= 1) return [{ from: 9, to: 19, region: 'cloister', spot: 'story' }];
      if (done('s4') && !done('s5') && open() && moon() === 1) return [{ from: 0, to: 24, region: 'well', spot: 'candles' }];
      if (FAC.br('s5') === 'stay' && !done('s6') && moon() >= 2) return [{ from: 0, to: 24, region: 'dream', spot: 'f_final' }];
      return [];
    });
  FAC.spot('dream', 'f_final', 0.5);

  /* ================================================================ s1 · The Missing Wax */
  const s1Offer = d => play([
    ['', `A woman in white stands among the kilns with a wax-stained ledger. The Well's blue sign is stitched on her sleeve.|Среди печей стоит женщина в белом, с книгой в восковых пятнах. На рукаве вышит синий знак Колодца.|Xumdonlar orasida oq kiyimli ayol turibdi, qo'lida mum dog'li daftar. Yengiga Quduqning ko'k belgisi tikilgan.`],
    ['habiba', `Yodchi. Good. I need someone who knows how people lie about small things.|Ёдчи. Хорошо. Мне нужен человек, который знает, как люди врут о мелочах.|Yodchi. Yaxshi. Menga odamlar mayda narsalar haqida qanday yolg'on gapirishini biladigan kishi kerak.`],
    ['habiba', `Consecrated wax goes missing from this workshop. White wax, for the tithe tumars. A crate a week, and nobody saw anything.|Из этой мастерской пропадает освящённый воск. Белый, для тумаров десятины. По ящику в неделю, и никто ничего не видел.|Bu ustaxonadan muqaddas mum yo'qolyapti. Oq mum — ushr tumarlari uchun. Haftasiga bir quti, hech kim hech narsa ko'rmagan.`]
  ], () => hub(``, [
    { label: `— Why does a little wax matter?|— Подумаешь, воск. Что за беда?|— Ozgina mum-da. Nima bo'pti?`, lines: [['habiba', `Without white wax a tumar leaks. A leaking tumar feeds the Well half a memory. The Sleeper notices halves.|Без белого воска тумар течёт. Текущий тумар кормит Колодец половиной воспоминания. Спящий половинки замечает.|Oq mumsiz tumar oqadi. Oqadigan tumar Quduqqa xotiraning yarmini beradi. Uxlovchi yarimtalarni sezadi.`]] },
    { label: `— Why not send your wardens?|— А почему не стражу?|— Nega soqchilarni yubormaysiz?`, lines: [['habiba', `Wardens frighten people into silence. You frighten them into talking. It's a gift. Not a pleasant one.|Стражи пугают людей до немоты. А ты пугаешь так, что люди начинают говорить. Это дар. Не самый приятный.|Soqchilar odamlarni qo'rqitib, tilini tutiltiradi. Sen esa shunday qo'rqitasanki, odamlar gapira boshlaydi. Bu iste'dod. Unchalik yoqimli emas.`]] },
    { label: `— What's in it for me?|— А мне что с этого?|— Menga bundan nima?`, lines: [['habiba', `The Order remembers who helps it. And forty tilla, which the Order will also remember, with some regret.|Орден помнит тех, кто ему помог. И ещё сорок тилла — их Орден тоже запомнит, не без сожаления.|Orden yordam berganlarni eslab qoladi. Yana qirq tilla — Orden ularni ham eslab qoladi, biroz afsus bilan.`]] }
  ], [
    { id: 'yes', label: `"I'll look into it."|«Разберусь.»|«Surishtirib ko'raman.»` },
    { id: 'no', label: `"Find someone else."|«Найдите кого-нибудь другого.»|«Boshqa odam toping.»` }
  ], o => {
    if (o.id === 'yes') FAC.begin('s1', `Habiba wants to know who takes the consecrated wax from the potters. The empty crate stands in the kiln yard.|Хабиба хочет знать, кто таскает у гончаров освящённый воск. Пустой ящик стоит во дворе у печей.|Habiba kulollardan muqaddas mumni kim olib ketayotganini bilmoqchi. Bo'sh quti xumdon hovlisida turibdi.`, ['potters', 'kilnyard']);
    d();
  }));
  FAC.prop('potters', 'kilnyard', {
    id: 's1crate', art: 'f6crate', dx: 24, prompt: `Taste the empty wax crate|Испить пустой ящик из-под воска|Bo'sh mum qutisini totib ko'rish`,
    when: () => act('s1') && !FAC.flag('s1tasted'),
    use: d => FAC.taste([
      ['memory', `Night. Small hands lift a block of white wax, the way you lift a sleeping cat.|Ночь. Маленькие руки поднимают брусок белого воска — так поднимают спящую кошку.|Tun. Kichkina qo'llar oq mum bo'lagini ko'taradi — uxlayotgan mushukni ko'targandek.`],
      ['memory', `Behind a curtain someone coughs, wet and patient. "Go to bed, Umid." "Soon, oyi."|За занавеской кто-то кашляет — сыро, терпеливо. «Ложись, Умид». «Сейчас, ойи».|Parda ortida kimdir yo'taladi — ho'l, sabr bilan. «Yot, Umid». «Hozir, oyi».`],
      ['memory', `A man in a grey mask counts coins into the small hands. "Tell your mother Those Who Remember don't haggle."|Человек в серой маске отсчитывает монеты в маленькие ладони. «Скажи матери: Те, кто помнит, не торгуются».|Kulrang niqobli odam kichkina kaftlarga tanga sanaydi. «Onangga ayt: Eslaganlar savdolashmaydi».`],
      () => (sadoAwake() ? ['sado', `Umid. The boy by the kilns is Umid. He's the one who never looks up.|Умид. Мальчишка у печей — Умид. Тот, что никогда не поднимает глаз.|Umid. Xumdon yonidagi bola — Umid. Hech qachon boshini ko'tarmaydigani.`] : null)
    ], () => { FAC.flag('s1tasted', 1); FAC.stepTo('s1', `The wax went in a boy's hands, to a buyer in a grey mask. The apprentice Umid works at the kilns.|Воск унесли детские руки, покупатель — в серой маске. У печей работает подмастерье Умид.|Mumni bolaning qo'llari olib ketgan, xaridor kulrang niqobda. Xumdon yonida shogird Umid ishlaydi.`, ['potters', 'kilnyard']); d(); })
  });
  const s1Umid = d => play([
    ['umid', `I'm working, yodchi. Can't you see I'm working?|Я работаю, ёдчи. Не видишь — работаю?|Ishlayapman, yodchi. Ko'rmayapsanmi, ishlayapman.`],
    ['hero', `Your hands smell of white wax. White wax smells of the Cloister.|От твоих рук пахнет белым воском. А белый воск пахнет Обителью.|Qo'llaringdan oq mum hidi keladi. Oq mumdan esa xonaqoh hidi keladi.`],
    ['umid', `...My mother's in the debt book. Twice. On the Night of Payment they'll take what she has left, and she has nearly nothing.|...Мать в долговой книге. Два раза. В Ночь Уплаты у неё заберут то, что осталось, а осталось почти ничего.|...Onam qarz daftarida. Ikki marta. To'lov kechasi qolganini olishadi, qolgani esa deyarli yo'q.`],
    ['umid', `The masked people pay real tilla. Eighty more and I can buy her line out of the book. Then I stop. I swear on her.|Люди в масках платят настоящей тиллой. Ещё восемьдесят — и я выкуплю её строчку из книги. И брошу. Матерью клянусь.|Niqoblilar haqiqiy tilla to'laydi. Yana sakson bo'lsa, onamning satrini daftardan sotib olaman. Keyin bas qilaman. Onam haqi qasam.`],
    () => (sadoAwake() ? ['sado', `He's counting on his fingers under the table. Like you do.|Он под столом считает на пальцах. Как ты.|U stol ostida barmoqlarini bukib sanayapti. Senga o'xshab.`] : null),
    cl('alp', `...Boy. Alp has seen worse men than this boy. Most of them were in charge.|...Мальчишка. Алп видел людей хуже этого мальчишки. Почти все они были главными.|...Bola. Alp bu boladan yomonroq odamlarni ko'rgan. Ularning deyarli hammasi boshliq edi.`)
  ], () => ask(`Umid waits. His hands have stopped.|Умид ждёт. Руки у него остановились.|Umid kutyapti. Qo'llari to'xtab qoldi.`, [
    { id: 'handed', label: `"Habiba will hear your name. I'm sorry, boy."|«Хабиба услышит твоё имя. Прости, парень.»|«Habiba ismingni eshitadi. Kechir, bolam.»` },
    { id: 'informant', label: `"Keep selling to them. And everything you hear down there comes to me first."|«Продолжай им носить. Только всё, что услышишь внизу, сначала несёшь мне.»|«Ularga tashishda davom et. Faqat pastda nima eshitsang, avval menga keltirasan.»` },
    { id: 'paid', price: 80, label: `"I'll buy your mother's line out myself. You stop tonight."|«Строчку твоей матери я выкуплю сам. А ты бросаешь сегодня же.»|«Onangning satrini o'zim sotib olaman. Sen esa bugunoq bas qilasan.»` },
    FAC.chk('collection', 2, `Tell Habiba a Hollow wandered in and took it. Make her believe it.|Сказать Хабибе, что воск унёс забредший Пустой. И чтобы поверила.|Habibaga mumni adashib kirgan Bo'sh olib ketgan, deb aytish. Ishonadigan qilib.`, { id: 'covered' }, `Pressure|Давление|Bosim`)
  ], o => {
    const fin = (br, text, more) => { FAC.finish('s1', br, text); play(more || [], d); };
    if (o.id === 'handed') {
      FAC.add('singers', 12); FAC.add('remember', -6); FAC.add('tail', -6); gold(40);
      FAC.react({ alp: -10, surayyo: -5 }, 'handed a boy over');
      fin('handed', `Umid was handed to the Singers. Habiba paid forty tilla.|Умида отдали Певцам. Хабиба заплатила сорок тилла.|Umid xonandalarga topshirildi. Habiba qirq tilla to'ladi.`, [
        ['habiba', `The Order will sing him a lesson. Not much. A week of his life, perhaps. Enough that his hands forget the way to the wax.|Орден споёт ему урок. Немного. Неделю его жизни, может быть. Чтобы руки забыли дорогу к воску.|Orden unga saboq kuylaydi. Ko'p emas. Hayotining bir haftasini, balki. Qo'llari mumga yo'lni unutadigan darajada.`],
        ['umid', `Oyi... who'll go to the market for oyi?|Ойи... а кто будет ходить за ойи на базар?|Oyim... oyim uchun bozorga kim boradi?`]
      ]);
    } else if (o.id === 'informant') {
      FAC.add('singers', 8); gold(40); FAC.flag('umid', 'informant');
      fin('informant', `Umid keeps selling to Those Who Remember, and tells you what he hears. Habiba was told the leak is closed.|Умид продолжает носить воск Помнящим и пересказывает тебе, что слышит. Хабибе сказано, что течь закрыта.|Umid Eslaganlarga mum tashishda davom etadi va eshitganini senga aytadi. Habibaga teshik yopildi, deyilgan.`, [
        ['umid', `A spy for a yodchi. Oyi would laugh. ...Oyi won't know.|Шпион у ёдчи. Ойи бы посмеялась. ...Ойи не узнает.|Yodchining josusi. Oyim kulardi. ...Oyim bilmaydi.`],
        ['habiba', `The wax stopped walking? Good. I won't ask how. Forty tilla, and the Order's thanks.|Воск больше не ходит? Хорошо. Не спрашиваю как. Сорок тилла и благодарность Ордена.|Mum endi yurmayaptimi? Yaxshi. Qanday qilib, deb so'ramayman. Qirq tilla va Ordenning minnatdorchiligi.`]
      ]);
    } else if (o.id === 'paid') {
      FAC.add('singers', 4); FAC.add('tail', 8); FAC.add('remember', -4); trust(1);
      FAC.react({ alp: 10, surayyo: 8 }, 'paid a debt');
      fin('paid', `You paid Umid's mother's line out of the book. The wax stopped going missing.|Ты выкупил строчку матери Умида. Воск пропадать перестал.|Umidning onasi satrini daftardan sotib olding. Mum yo'qolishi to'xtadi.`, [
        ['umid', `Eighty. You just... Oyi will want to feed you. Don't refuse. She cooks badly, but she means it.|Восемьдесят. Ты просто... Ойи захочет тебя накормить. Не отказывайся. Готовит она плохо, зато от души.|Sakson. Sen shunchaki... Oyim seni mehmon qilmoqchi bo'ladi. Rad etma. Ovqatni yomon pishiradi, lekin chin dildan.`],
        ['habiba', `The wax is back on the shelves and you won't tell me who. Keep your secret. The Order keeps worse.|Воск снова на полках, а кто брал — не скажешь. Храни свою тайну. Орден хранит и похуже.|Mum yana tokchada, kim olganini esa aytmaysan. Siringni saqla. Orden bundan yomonlarini ham saqlaydi.`]
      ]);
    } else {
      if (o.ok) {
        FAC.add('remember', 4); FAC.add('tail', 4);
        fin('covered', `You told Habiba a Hollow took the wax. She believed you, or chose to.|Ты сказал Хабибе, что воск унёс Пустой. Она поверила — или решила поверить.|Habibaga mumni Bo'sh olib ketgan deding. U ishondi — yoki ishonishni afzal ko'rdi.`, [['habiba', `A Hollow. Following the smell of full tumars, I suppose. Fine. I'll have the crates locked.|Пустой. Шёл на запах полных тумаров, надо думать. Ладно. Ящики велю запирать.|Bo'sh. To'la tumarlar hidiga ergashgan bo'lsa kerak. Mayli. Qutilarni qulflashni buyuraman.`]]);
      } else {
        FAC.add('singers', -6); FAC.add('remember', 4); FAC.add('tail', 4);
        fin('covered', `You told Habiba a Hollow took the wax. She didn't believe a word.|Ты сказал Хабибе, что воск унёс Пустой. Она не поверила ни слову.|Habibaga mumni Bo'sh olib ketgan deding. U bir so'zingga ham ishonmadi.`, [['habiba', `A Hollow who chooses only the white wax, and only on Tuesdays. Keep your thief, yodchi. I'll keep a note.|Пустой, который берёт только белый воск и только по вторникам. Оставь себе своего вора, ёдчи. А я оставлю себе заметку.|Faqat oq mumni, faqat seshanba kunlari oladigan Bo'sh. O'g'ringni o'zingga qoldir, yodchi. Men esa o'zimga eslatma qoldiraman.`]]);
      }
    }
  }));
  FAC.talk.umid = d => {
    if (act('s1') && FAC.flag('s1tasted')) { s1Umid(d); return; }
    if (FAC.br('s1') === 'informant') { play([['umid', pick([`They talk about a fire, down there. Not yet. When the moon's thinner.|Внизу говорят про пожар. Не сейчас. Когда луна похудеет.|Pastda yong'in haqida gapirishyapti. Hozir emas. Oy ozganda.`, `The grey mask asked if I've seen a yodchi. I said yodchi all look alike.|Серая маска спрашивала, не видел ли я ёдчи. Я сказал, что все ёдчи на одно лицо.|Kulrang niqob yodchini ko'rmadingmi, deb so'radi. Hamma yodchilar bir xil, dedim.`])]], d); return; }
    if (FAC.br('s1') === 'paid') { play([['umid', `Oyi says thank you. Every day. I'm tired of passing it on. Thank you.|Ойи говорит спасибо. Каждый день. Мне уже надоело передавать. Спасибо.|Oyim rahmat deydi. Har kuni. Yetkazaverib charchadim. Rahmat.`]], d); return; }
    play([['', FAC.NPC.umid.def.idle]], d);
  };

  /* ================================================================ s2 · Counted Twice */
  const s2Offer = d => play([
    ['habiba', `You found my wax. Now find my numbers.|Воск мой ты нашёл. Теперь найди мои числа.|Mumimni topding. Endi raqamlarimni top.`],
    ['habiba', `The debt books in the archive don't agree with the Well's tally. Someone writes Tail names in twice. A family pays two tithes and dies of the second.|Долговые книги в архиве не сходятся со счётом Колодца. Кто-то вписывает имена из Хвоста дважды. Семья платит две десятины и умирает от второй.|Arxivdagi qarz daftarlari Quduq hisobiga to'g'ri kelmayapti. Kimdir Dumdagi ismlarni ikki marta yozyapti. Oila ikki ushr to'laydi va ikkinchisidan o'ladi.`],
    ['', `She puts a small disc of blue glass and silver in your palm. The Sign of the Well. It's warm from her hand.|Она кладёт тебе на ладонь маленький диск из синего стекла и серебра. Знак Колодца. Тёплый от её руки.|U kaftingga ko'k shisha va kumushdan kichkina doira qo'yadi. Quduq belgisi. Qo'lining issig'idan iliq.`],
    ['habiba', `A real one. Don't let Farrukh copy it. He always gets the blue wrong.|Настоящий. Фарруху копировать не давай. Он вечно ошибается с синим.|Haqiqiysi. Farruxga nusxa ko'chirtirma. U doim ko'k rangda adashadi.`]
  ], () => { G.WORLD2.giveKey('well_sign'); FAC.begin('s2', `Habiba gave you the real Sign of the Well. Read the Tail's debt books by the archive in the Cloister; taste the ink if the pages won't talk.|Хабиба дала тебе настоящий Знак Колодца. Прочти долговые книги Хвоста у архива в Обители; если страницы молчат — испей чернила.|Habiba senga haqiqiy Quduq belgisini berdi. Xonaqohdagi arxiv yonida Dumning qarz daftarlarini o'qi; sahifalar jim tursa, siyohni totib ko'r.`, ['cloister', 'books']); d(); });
  FAC.prop('cloister', 'books', {
    id: 's2books', art: 'f6books', dx: -36, prompt: `The Tail's debt books|Долговые книги Хвоста|Dumning qarz daftarlari`,
    when: () => act('s2'),
    use: d => {
      const resolve = () => play([
        ['', `Two hands wrote these pages. The second always follows the first, a line below, the same names in a neater script.|Эти страницы писали две руки. Вторая всегда идёт за первой, строкой ниже, те же имена — почерком поаккуратней.|Bu sahifalarni ikki qo'l yozgan. Ikkinchisi doim birinchisidan keyin keladi, bir qator pastda, o'sha ismlar, chiroyliroq xatda.`],
        cl('surayyo', `Look at the names. Half of them owe for water. I know every one of them. The second line is how they drown.|Посмотри на имена. Половина из них должна за воду. Я их всех знаю. Вот эта вторая строчка их и топит.|Ismlarga qara. Yarmi suv uchun qarzdor. Hammasini taniyman. Mana shu ikkinchi satr ularni cho'ktiryapti.`)
      ], () => ask(`The pages are in your hands. Habiba is waiting; so is the Tail, without knowing it.|Страницы у тебя в руках. Хабиба ждёт; ждёт и Хвост, сам того не зная.|Sahifalar qo'lingda. Habiba kutyapti; Dum ham kutyapti, buni bilmagan holda.`, [
        { id: 'hidden', label: `Put the pages back where they were. Tell Habiba it's an old clerk's mistake, long dead.|Положить страницы на место. Сказать Хабибе, что это ошибка старого писца, давно покойного.|Sahifalarni joyiga qo'yish. Habibaga bu allaqachon o'lgan eski mirzaning xatosi, deyish.` },
        { id: 'divan', label: `Take the pages to the Divan. Their scribes count everything; they'll know what to do with this.|Отнести страницы в Диван. Их писцы считают всё; уж они найдут, что с этим делать.|Sahifalarni Devonga olib borish. Ularning mirzalari hamma narsani sanaydi; bu bilan nima qilishni ular biladi.` },
        { id: 'burned', label: `Burn the second lines, every one. Let the Tail owe once.|Сжечь все вторые строки. Пусть Хвост будет должен один раз.|Barcha ikkinchi satrlarni yoqib yuborish. Dum bir marta qarzdor bo'lsin.` },
        FAC.chk('mem', 5, `Copy the worst page by heart, then put everything back. Keep it for a day you'll need it.|Запомнить худшую страницу слово в слово и всё вернуть. Приберечь на тот день, когда понадобится.|Eng yomon sahifani so'zma-so'z yodlab, hammasini joyiga qo'yish. Kerak bo'ladigan kunga asrab qo'yish.`, { id: 'copied' })
      ], o => {
        if (o.id === 'hidden') { FAC.add('singers', 12); FAC.add('tail', -8); FAC.react({ surayyo: -10, alp: -5 }, 'hid the double count'); FAC.finish('s2', 'hidden', `You hid the double count for the Order. Habiba said nothing and looked grateful.|Ты скрыл двойной счёт ради Ордена. Хабиба ничего не сказала, но смотрела с благодарностью.|Ikki karra hisobni Orden uchun yashirding. Habiba indamadi, lekin minnatdor qaradi.`); play([['habiba', `An old clerk. Yes. They do die, old clerks. Thank you, yodchi. You've done the Order a kindness it won't put in writing.|Старый писец. Да. Старые писцы умирают. Спасибо, ёдчи. Ты сделал Ордену добро, которое он не запишет.|Eski mirza. Ha. Eski mirzalar o'ladi. Rahmat, yodchi. Ordenga yaxshilik qilding, buni Orden yozib qo'ymaydi.`]], d); return; }
        if (o.id === 'divan') { FAC.add('divan', 12); FAC.add('singers', -15); FAC.susp('singers', 2); FAC.flag('s2pages', 'divan'); FAC.finish('s2', 'divan', `You carried the Singers' pages to the Divan. The Divan now holds a knife at the Cloister's throat.|Ты отнёс страницы Певцов в Диван. Теперь у Дивана нож у горла Обители.|Xonandalar sahifalarini Devonga olib bording. Endi Devonning pichog'i xonaqohning bo'g'zida.`); play([['', `At the Ark a steward reads the pages twice, smiles once, and locks them in a cedar box. "The Divan thanks you. The Divan will raise the price of white wax."|В Арке распорядитель дважды читает страницы, один раз улыбается и запирает их в кедровый ларец. «Диван благодарит. Диван поднимет цену на белый воск».|Arkda xizmatchi sahifalarni ikki marta o'qiydi, bir marta jilmayadi va sadr qutichaga qulflab qo'yadi. «Devon minnatdor. Devon oq mum narxini oshiradi».`]], d); return; }
        if (o.id === 'burned') { FAC.add('tail', 10); FAC.add('singers', -8); FAC.flag('s2burned', 1); FAC.react({ surayyo: 15, alp: 5 }, 'burned the double count'); FAC.finish('s2', 'burned', `You burned the second lines. A hundred Tail families owe one tithe instead of two. The Well will be hungrier.|Ты сжёг вторые строки. Сотня семей Хвоста должна одну десятину вместо двух. Колодец будет голоднее.|Ikkinchi satrlarni yoqding. Dumdagi yuzta oila ikki emas, bitta ushr qarzdor. Quduq ochroq bo'ladi.`); play([['', `The pages curl and go black at the edges first, the way the Tail goes black in a dry year.|Страницы скручиваются и чернеют сначала с краёв — так в сухой год чернеет Хвост.|Sahifalar buralib, avval chetidan qorayadi — qurg'oqchil yilda Dum shunday qorayadi.`], ['habiba', `Burned. In my archive. ...The Well will want those names back from somewhere, yodchi. It always does.|Сожжено. В моём архиве. ...Колодец захочет вернуть эти имена откуда-нибудь ещё, ёдчи. Он всегда хочет.|Yondirilgan. Mening arxivimda. ...Quduq bu ismlarni boshqa joydan qaytarib olmoqchi bo'ladi, yodchi. U doim shunday qiladi.`]], d); return; }
        if (o.ok) { FAC.add('singers', 6); FAC.flag('s2copy', 1); FAC.finish('s2', 'copied', `You know the worst page by heart, and the archive looks untouched. Someday it will be worth something.|Худшую страницу ты помнишь наизусть, а архив выглядит нетронутым. Когда-нибудь это чего-то будет стоить.|Eng yomon sahifani yoddan bilasan, arxiv esa tegilmaganga o'xshaydi. Qachondir bu nimagadir arziydi.`); play([['', `"Year of the dry spring. By order: count the Tail twice. The Well forgives arithmetic." You fold the words into the place where you keep things.|«Год сухой весны. По распоряжению: считать Хвост дважды. Колодец прощает арифметику». Ты складываешь эти слова туда, где хранишь важное.|«Quruq bahor yili. Buyruq bo'yicha: Dumni ikki karra hisoblash. Quduq arifmetikani kechiradi». Bu so'zlarni muhim narsalarni saqlaydigan joyingga taxlab qo'yasan.`]], d); return; }
        FAC.add('singers', -4); FAC.finish('s2', 'hidden', `You tried to learn the page and lost it halfway. You put everything back. Habiba saw your lips moving.|Ты пытался запомнить страницу и сбился на середине. Всё вернул на место. Хабиба видела, как шевелятся твои губы.|Sahifani yodlamoqchi bo'lding, yarmida adashding. Hammasini joyiga qo'yding. Habiba lablaring qimirlayotganini ko'rdi.`);
        play([['habiba', `Reading to yourself, yodchi? In the archive we read with our eyes. Only with our eyes.|Читаешь вслух, ёдчи? В архиве читают глазами. Только глазами.|Ovoz chiqarib o'qiyapsanmi, yodchi? Arxivda ko'z bilan o'qiladi. Faqat ko'z bilan.`]], d);
      }));
      if (!FAC.flag('s2tasted')) ask(`The pages say little. The ink might say more.|Страницы говорят мало. Чернила могут сказать больше.|Sahifalar kam gapiradi. Siyoh ko'proq aytishi mumkin.`, [
        FAC.craft('taste', `Touch your lips to the ink of the second line.|Коснуться губами чернил второй строки.|Ikkinchi satr siyohiga lab tekkizish.`, { id: 'taste' }),
        { id: 'read', label: `Just read.|Просто читать.|Shunchaki o'qish.` }
      ], o => {
        if (o.id !== 'taste') { resolve(); return; }
        FAC.flag('s2tasted', 1);
        FAC.taste([
          ['memory', `An old Singer writes a Tail name, stops, and writes it again below. His hand shakes on the second.|Старый Певец пишет имя из Хвоста, останавливается и пишет его снова, строкой ниже. На втором разе рука дрожит.|Keksa xonanda Dumdagi ismni yozadi, to'xtaydi va pastroqqa yana yozadi. Ikkinchisida qo'li titraydi.`],
          ['memory', `Behind him a woman's calm voice: "In a hungry year, count the Tail twice. The Well forgives arithmetic. I'll answer for it."|За его спиной спокойный женский голос: «В голодный год считайте Хвост дважды. Колодец прощает арифметику. Отвечать буду я».|Uning orqasida ayolning xotirjam ovozi: «Och yilda Dumni ikki karra hisoblang. Quduq arifmetikani kechiradi. Javobini men beraman».`],
          () => (sadoAwake() ? ['sado', `That voice. It's the one from the Vault. The one who sang the song into you.|Этот голос. Это тот, из Хранилища. Та, что спела в тебя песню.|Bu ovoz. Xazinadagi ovoz. Senga qo'shiqni kuylagan ayol.`] : null)
        ], () => { FAC.stepTo('s2', `The double count is no thief's trick: the Order does it on purpose, by Shirin's word.|Двойной счёт — не воровская уловка: Орден делает это нарочно, по слову Ширин.|Ikki karra hisob — o'g'rining hiylasi emas: Orden buni ataylab, Shirinning so'zi bilan qiladi.`); resolve(); });
      }); else resolve();
    }
  });

  /* ================================================================ s3 · The Choir That Won't Sing */
  const s3Offer = d => play([
    ['habiba', `Our novices are going quiet. One a week. They open their mouths for the evening song and nothing comes out.|Наши послушники замолкают. По одному в неделю. Открывают рот на вечернюю песню — и ничего.|Shogirdlarimiz jim bo'lib qolyapti. Haftasiga bittadan. Kechki qo'shiqqa og'iz ochishadi — hech narsa chiqmaydi.`],
    ['habiba', `The physicians say the throat is healthy. The Ustoz says it's the bitter water. I say someone is teaching them silence.|Лекари говорят, горло здорово. Устоз говорит, это горькая вода. А я говорю — их кто-то учит молчать.|Tabiblar tomoq sog' deydi. Ustoz achchiq suvdan deydi. Men esa kimdir ularni jim turishga o'rgatyapti, deyman.`],
    ['habiba', `Malika went quiet three days ago. She's by the gate. She still writes.|Малика замолчала три дня назад. Она у ворот. Писать ещё может.|Malika uch kun oldin jim bo'lib qoldi. U darvoza yonida. Yozishi hali mumkin.`]
  ], () => { FAC.begin('s3', `Novices of the Cloister are going mute one by one. Malika, by the gate, can still write.|Послушники Обители немеют один за другим. Малика у ворот ещё может писать.|Xonaqoh shogirdlari birin-ketin soqov bo'lib qolyapti. Darvoza yonidagi Malika hali yoza oladi.`, ['cloister', 'gate']); d(); });
  const s3Malika = d => play([
    ['', `Malika has a slate on a string round her neck. She writes fast, wipes it with her sleeve, writes again.|У Малики на шее на верёвочке грифельная дощечка. Она пишет быстро, стирает рукавом, пишет снова.|Malikaning bo'ynida ipga osilgan grifel taxtacha. U tez yozadi, yengi bilan o'chiradi, yana yozadi.`],
    ['malika', `"WHEN WE SING, HE SCREAMS. UNDER THE FLOOR. YOU CAN'T HEAR IT? WE CAN."|«КОГДА МЫ ПОЁМ, ОН КРИЧИТ. ПОД ПОЛОМ. ТЫ НЕ СЛЫШИШЬ? А МЫ СЛЫШИМ».|«BIZ KUYLAGANDA U QICHQIRADI. POL OSTIDA. SEN ESHITMAYAPSANMI? BIZ ESHITAMIZ».`],
    ['malika', `"SHE SAID: WHEN IT HURTS HIM, STOP. SO WE STOPPED."|«ОНА СКАЗАЛА: КОГДА ЕМУ БОЛЬНО, ПЕРЕСТАНЬ. МЫ И ПЕРЕСТАЛИ».|«U AYTDI: UNGA OG'RIGANDA TO'XTA. BIZ TO'XTADIK».`],
    ['hero', `Who said it?|Кто сказал?|Kim aytdi?`],
    ['', `She looks over your shoulder at the Cloister's upper windows, and wipes the slate clean.|Она смотрит поверх твоего плеча на верхние окна Обители и стирает дощечку.|U yelkang osha xonaqohning yuqori derazalariga qaraydi va taxtachani o'chiradi.`],
    FAC.inParty('nargiza') ? ['nargiza', `...Me. I told them. He screams when we sing, yodchi. I hear it every night. I thought if a few of us stopped, he'd sleep easier.|...Я. Я им сказала. Он кричит, когда мы поём, ёдчи. Я слышу это каждую ночь. Думала, если несколько из нас замолчат, ему будет легче спать.|...Men. Men aytdim. Biz kuylaganda u qichqiradi, yodchi. Har kecha eshitaman. O'ylabmanki, bir nechtamiz jim bo'lsak, uning uyqusi yengillashadi.`]
      : ['', `Under the slate's frame, scratched small: "When it hurts him, stop. — N."|Под рамкой дощечки нацарапано мелко: «Когда ему больно — перестань. Н.»|Taxtacha ramkasi ostida mayda qilib tirnalgan: «Unga og'riganda — to'xta. N.»`],
    () => (sadoAwake() ? ['sado', `N. Nargiza. The girl who hears him. So she's not the only one.|Н. Наргиза. Девушка, которая его слышит. Значит, она не одна такая.|N. Nargiza. Uni eshitadigan qiz. Demak, u yolg'iz emas.`] : null)
  ], () => ask(`Habiba wants an answer. The novices want to be left alone. The thing under the floor wants something too.|Хабибе нужен ответ. Послушникам — чтобы их оставили в покое. Тому, что под полом, тоже чего-то нужно.|Habibaga javob kerak. Shogirdlarga — ularni tinch qo'yishlari. Pol ostidagiga ham nimadir kerak.`, [
    { id: 'cured', label: `Tell Habiba it's an illness. Ask for the bitter tea that dulls the ear, so they can sing again.|Сказать Хабибе, что это болезнь. Попросить горький отвар, что глушит слух, — пусть снова поют.|Habibaga bu kasallik, deyish. Eshitishni so'ndiradigan achchiq damlamani so'rash — yana kuylashsin.` },
    { id: 'told', label: `Tell Habiba the truth: they hear the Sleeper, and the song hurts him.|Сказать Хабибе правду: они слышат Спящего, и песня ему больно делает.|Habibaga rostini aytish: ular Uxlovchini eshitishadi, qo'shiq esa unga og'riq beradi.` },
    { id: 'covered', label: `"It's the bitter water, like the Ustoz says. Give them a month."|«Это горькая вода, как и говорит Устоз. Дайте им месяц.»|«Bu achchiq suv, Ustoz aytganidek. Ularga bir oy bering.»` },
    FAC.craft('plant', `Sing into each of them a morning when singing felt like joy. They'll believe it's theirs.|Вселить каждому утро, когда петь было радостью. Они поверят, что это их собственное.|Har biriga qo'shiq quvonch bo'lgan bir tongni joylash. Bu o'zlariniki, deb ishonishadi.`, { id: 'planted' })
  ], o => {
    if (o.id === 'cured') { FAC.add('singers', 12); FAC.react({ nargiza: -20 }, 'dulled the novices'); FAC.finish('s3', 'cured', `The novices drink the bitter tea and sing again. They no longer hear anything under the floor.|Послушники пьют горький отвар и снова поют. Под полом они больше ничего не слышат.|Shogirdlar achchiq damlamani ichib, yana kuylashyapti. Pol ostida endi hech narsa eshitishmaydi.`); play([['', `That evening the choir is full again. Malika sings in the second row, clear and a little too loud, like someone singing over a noise.|В тот вечер хор снова полон. Малика поёт во втором ряду, чисто и чуть слишком громко — как поют, перекрывая шум.|O'sha kechqurun xor yana to'la. Malika ikkinchi qatorda kuylayapti, toza va sal baland — shovqinni bosib kuylaganday.`], cl('nargiza', `You stopped their ears. You know that? They'll sing over him until he wakes.|Ты заткнул им уши. Понимаешь? Они будут перепевать его, пока он не проснётся.|Ularning qulog'ini tiqib qo'yding. Tushunyapsanmi? U uyg'onguncha ular uning ustidan kuylashadi.`)], d); return; }
        if (o.id === 'told') { FAC.add('singers', 4); FAC.flag('s3told', 1); FAC.react({ nargiza: 5 }, 'told the truth'); FAC.finish('s3', 'told', `You told Habiba the novices hear the Sleeper. She took them to the Well "to be cleansed".|Ты сказал Хабибе, что послушники слышат Спящего. Она увела их к Колодцу «на очищение».|Habibaga shogirdlar Uxlovchini eshitishini aytding. U ularni «poklanish» uchun Quduqqa olib ketdi.`); play([['habiba', `Hear him. Yes. The Ustoz calls it a sickness of the Well. We have a cure for it. It's slow, and it's thorough.|Слышат его. Да. Устоз зовёт это болезнью Колодца. У нас есть от неё лекарство. Медленное. И основательное.|Uni eshitishadi. Ha. Ustoz buni Quduq kasalligi deydi. Unga davomiz bor. Sekin. Va puxta.`]], d); return; }
        if (o.id === 'covered') { FAC.add('singers', -4); FAC.flag('s3covered', 1); FAC.react({ nargiza: 15 }, 'covered the novices'); FAC.finish('s3', 'covered', `You bought the mute novices a month. They go on listening under the floor.|Ты выиграл немым послушникам месяц. Они продолжают слушать то, что под полом.|Soqov shogirdlarga bir oy vaqt yutib berding. Ular pol ostidagini tinglashda davom etishyapti.`); play([['habiba', `A month. You're asking me to wait while the choir dies, yodchi. ...A month. Not a day more.|Месяц. Ты просишь меня ждать, пока хор умирает, ёдчи. ...Месяц. Ни днём больше.|Bir oy. Xor o'layotganda kutib turishimni so'rayapsan, yodchi. ...Bir oy. Bir kun ham ortiq emas.`], ['malika', `"THANK YOU." She draws a small sun under it, the way children do.|«СПАСИБО». Ниже она рисует маленькое солнышко, как рисуют дети.|«RAHMAT». Ostiga bolalardek kichkina quyosh chizadi.`]], d); return; }
        FAC.plant(`joy planted in strangers|вселённая чужим радость|begonalarga joylangan quvonch`); FAC.add('singers', 10); FAC.flag('s3planted', 1); FAC.react({ nargiza: -15 }, 'planted joy');
        FAC.finish('s3', 'planted', `You sang a borrowed joy into the novices. They sing again, gladly, and think the gladness is their own.|Ты вселил послушникам чужую радость. Они снова поют — охотно — и думают, что радость их собственная.|Shogirdlarga birovning quvonchini joylading. Ular yana kuylashyapti — mamnun — va bu quvonchni o'zlariniki deb o'ylashyapti.`);
        play([['', `Malika sings with her eyes closed and smiles at a morning she never had.|Малика поёт с закрытыми глазами и улыбается утру, которого у неё не было.|Malika ko'zlarini yumib kuylaydi va o'zida bo'lmagan tongga jilmayadi.`], () => (sadoAwake() ? ['sado', `She looks happy. She looks so happy. Why do I want to cry?|Она выглядит счастливой. Такой счастливой. Почему мне хочется плакать?|U baxtli ko'rinadi. Shunchalik baxtli. Nega yig'lagim kelyapti?`] : null)], d);
  }));
  FAC.talk.malika = d => { if (act('s3')) { s3Malika(d); return; } play([['', FAC.br('s3') === 'covered' ? `Malika taps her slate where a small sun is still drawn.|Малика стучит пальцем по дощечке, где всё ещё нарисовано солнышко.|Malika hamon kichkina quyosh chizilgan taxtachani barmog'i bilan chertadi.` : FAC.NPC.malika.def.idle]], d); };

  /* ================================================================ s4 · A Test of Loyalty (the double-play check) */
  const s4Offer = d => play([
    ['', `Ustoz Shirin sits in the Cloister yard with a bowl of water on her knees, as if listening to it.|Устоз Ширин сидит во дворе Обители с чашей воды на коленях — будто прислушивается к ней.|Ustoz Shirin xonaqoh hovlisida tizzasida bir kosa suv bilan o'tiribdi — go'yo uni tinglayotgandek.`],
    ['shirin', `Habiba speaks well of you. That's rare. She speaks well of no one, including me.|Хабиба хорошо о тебе отзывается. Это редкость. Она ни о ком хорошо не отзывается, даже обо мне.|Habiba sen haqingda yaxshi gapiradi. Bu kamdan-kam bo'ladi. U hech kim haqida yaxshi gapirmaydi, men haqimda ham.`]
  ], () => FAC.suspicionCheck('singers', 'shirin', out => {
    FAC.flag('s4check', out);
    play([
      ['shirin', `Ergash the smith owes the Well a strong memory this year. Every year he finds a reason not to pay. This year you'll collect it.|Кузнец Эргаш должен Колодцу в этом году сильное воспоминание. Каждый год у него находится причина не платить. В этом году его соберёшь ты.|Temirchi Ergash bu yil Quduqqa kuchli bir xotira qarzdor. Har yili to'lamaslikka bahona topadi. Bu yil uni sen yig'asan.`],
      ['hero', `...Ergash dug me out of the sand. Twenty years ago, when the Tail slid.|...Эргаш вытащил меня из песка. Двадцать лет назад, когда Хвост съехал.|...Ergash meni qumdan qazib olgan. Yigirma yil oldin, Dum surilib ketganda.`],
      ['shirin', `I know. That's why it's you.|Я знаю. Поэтому и ты.|Bilaman. Shuning uchun ham sen.`]
    ], () => { FAC.begin('s4', `Shirin wants Ergash's tithe collected — the smith who dug you out of the sand. He's in the Tail square.|Ширин велит собрать десятину с Эргаша — кузнеца, который откопал тебя из песка. Он на площади Хвоста.|Shirin seni qumdan qazib olgan temirchi Ergashdan ushr yig'ishni buyurdi. U Dum maydonida.`, ['tail', 'square']); d(); });
  }));
  const s4Ergash = d => play([
    ['ergash', `So they sent you. Of course they did. Sit. The tea's cold, like everything in this house since Saodat died.|Значит, прислали тебя. Ну конечно. Садись. Чай холодный — как всё в этом доме с тех пор, как умерла Саодат.|Demak, seni yuborishibdi. Albatta-da. O'tir. Choy sovuq — Saodat o'lgandan beri bu uydagi hamma narsa kabi.`],
    ['ergash', `I've one strong memory left: the day I married her. Her mother cried, the drum split, and she laughed so hard she got hiccups. Everything else I've already given.|У меня осталось одно сильное воспоминание: день, когда я на ней женился. Её мать плакала, бубен лопнул, а она смеялась так, что начала икать. Всё остальное я уже отдал.|Menda bitta kuchli xotira qoldi: unga uylangan kunim. Onasi yig'ladi, doira yorildi, u esa shunchalik kuldiki, hiqichoq tutdi. Qolganini allaqachon berganman.`],
    ['ergash', `I dug you out by the hair, you know. You bit me. Go on, then. If you're taking, take.|Я тебя за волосы вытаскивал, знаешь. Ты меня укусил. Ну давай. Если берёшь — бери.|Seni sochingdan tortib olganman, bilasanmi. Meni tishlagansan. Qani, ol. Olsang — ol.`],
    cl('surayyo', `If you take that from him, he'll sit here every evening not knowing why the tea is cold.|Если ты это у него заберёшь, он будет сидеть здесь каждый вечер и не знать, почему чай холодный.|Agar buni undan olsang, u har kechqurun shu yerda o'tirib, choy nega sovuqligini bilmaydi.`)
  ], () => ask(`The empty tumar is in your hand. Ergash holds out his wrist the way people do for a pulse.|Пустой тумар у тебя в руке. Эргаш протягивает запястье — так протягивают лекарю.|Bo'sh tumar qo'lingda. Ergash bilagini tabibga cho'zgandek cho'zadi.`, [
    { id: 'took', label: `Take his wedding day. It's the tithe, and it's owed.|Взять его свадьбу. Это десятина, и она положена.|Uning to'y kunini olish. Bu ushr, u to'lanishi kerak.` },
    FAC.chk('agi', 6, `Swap the tumar in your sleeve for a counterfeit. Shirin gets wax and a stranger's wedding.|Подменить тумар в рукаве подделкой. Ширин получит воск и чужую свадьбу.|Yengdagi tumarni qalbakisiga almashtirish. Shirin mum va birovning to'yini oladi.`, { id: 'forged' }, `Sleight of hand|Ловкость рук|Qo'l chaqqonligi`),
    { id: 'mine', label: `"Keep it. The Well can have one of mine instead."|«Оставь себе. Колодцу пойдёт одно из моих.»|«O'zingda qolsin. Quduqqa meniklaridan biri ketadi.»` },
    { id: 'refused', label: `"Not him. Tell the Ustoz the yodchi refused."|«Только не его. Передай Устоз: ёдчи отказался.»|«Faqat u emas. Ustozga ayting: yodchi rad etdi.»` }
  ], o => {
    if (o.id === 'took') {
      FAC.add('singers', 15); FAC.add('tail', -10); trust(-1); FAC.react({ alp: -15, surayyo: -15 }, 'collected from Ergash'); gold(60);
      FAC.finish('s4', 'took', `You collected Ergash's wedding day for the Well. Shirin paid sixty tilla.|Ты собрал для Колодца свадьбу Эргаша. Ширин заплатила шестьдесят тилла.|Ergashning to'y kunini Quduq uchun yig'ding. Shirin oltmish tilla to'ladi.`);
      play([['', `The song is short. The wax warms. Ergash blinks, looks at the cold tea, and pours you some, politely, like a stranger.|Песня короткая. Воск теплеет. Эргаш моргает, смотрит на холодный чай и вежливо, как чужому, наливает тебе.|Qo'shiq qisqa. Mum iliydi. Ergash ko'zini pirpiratadi, sovuq choyga qaraydi va senga, begonaga quygandek, xushmuomalalik bilan quyadi.`], ['ergash', `Drink, yodchi. ...Have we met?|Пей, ёдчи. ...Мы знакомы?|Ich, yodchi. ...Tanishmidik?`]], d);
    } else if (o.id === 'forged') {
      if (o.ok) { FAC.add('singers', 10); FAC.flag('s4forged', 1); FAC.finish('s4', 'forged', `Shirin got a counterfeit tumar. Ergash kept his wedding. The Well hasn't tasted it yet.|Ширин получила поддельный тумар. Эргаш сохранил свою свадьбу. Колодец её ещё не пробовал.|Shirin qalbaki tumar oldi. Ergash to'yini saqlab qoldi. Quduq uni hali totib ko'rmagan.`); play([['', `Your hand does it before you think. Ergash's wedding stays in his chest; a stranger's goes into your bag, still smelling of Farrukh's kitchen.|Рука делает всё раньше, чем ты успеваешь подумать. Свадьба Эргаша остаётся при нём; в сумку ложится чужая, ещё пахнущая кухней Фарруха.|Qo'ling o'ylab ulgurmasingdan ishni bajaradi. Ergashning to'yi o'zida qoladi; xaltangga esa Farruxning oshxonasi hidi kelib turgan birovning to'yi tushadi.`], ['ergash', `...Done? I don't feel anything. Is that how it is?|...Всё? Я ничего не чувствую. Так и должно быть?|...Bo'ldimi? Hech narsa sezmayapman. Shunday bo'lishi kerakmi?`], ['hero', `That's how it is.|Так и должно быть.|Shunday bo'lishi kerak.`]], d); }
      else { FAC.add('singers', -12); FAC.add('tail', 6); FAC.closeArc('singers', 'caught forging'); FAC.finish('s4', 'caught', `You fumbled the swap in front of Shirin's novice. The Singers closed their doors to you.|Ты сплоховал с подменой на глазах у послушницы Ширин. Певцы закрыли перед тобой двери.|Shirinning shogirdi ko'z o'ngida almashtirishda adashding. Xonandalar eshiklarini senga yopdi.`, { failed: true }); play([['', `The counterfeit slips from your sleeve and rolls under the bench. A novice in white, waiting at the door, watches it roll.|Подделка выскальзывает из рукава и катится под скамью. Послушница в белом, ждавшая у двери, смотрит, как она катится.|Qalbaki tumar yengingdan sirg'alib, kursi tagiga dumalaydi. Eshik oldida kutib turgan oq kiyimli shogird qiz uning dumalashini kuzatadi.`]], d); }
    } else if (o.id === 'mine') {
      addVoid(15, `your own memory, for the Well|своя память — Колодцу|o'z xotirang — Quduqqa`); FAC.add('singers', 10); FAC.add('tail', 6); trust(1); FAC.react({ alp: 10, surayyo: 10 }, 'paid with his own');
      FAC.finish('s4', 'mine', `You paid Ergash's tithe with one of your own memories. Shirin accepted it without a word.|Ты заплатил десятину Эргаша своим воспоминанием. Ширин приняла её молча.|Ergashning ushrini o'z xotirang bilan to'lading. Shirin uni indamay qabul qildi.`);
      play([['', `You don't choose which one. The song chooses. Afterwards there's a gap in you shaped like a summer, and you don't know which summer.|Ты не выбираешь, какое. Выбирает песня. Потом в тебе остаётся пустота размером с лето, и ты не знаешь, с какое.|Qaysi birini — sen tanlamaysan. Qo'shiq tanlaydi. Keyin ichingda bir yoz kattaligida bo'shliq qoladi, qaysi yozligini esa bilmaysan.`], ['ergash', `You bit me then, too. Stubborn. Go on, drink your tea.|Ты и тогда кусался. Упрямый. Пей чай, давай.|O'shanda ham tishlagansan. O'jar. Choyingni ich, qani.`]], d);
    } else {
      FAC.add('singers', -20); FAC.add('tail', 10); trust(1); FAC.react({ alp: 10, surayyo: 10 }, 'refused'); FAC.closeArc('singers', 'refused');
      FAC.finish('s4', 'refused', `You refused to collect from Ergash. Shirin will not ask you for anything again.|Ты отказался собирать с Эргаша. Ширин тебя больше ни о чём не попросит.|Ergashdan yig'ishni rad etding. Shirin endi senga hech narsa buyurmaydi.`, { failed: true });
      play([['ergash', `Refused. You'll pay for that, boy. ...Thank you. Now get out before I get sentimental.|Отказался. Тебе за это достанется, парень. ...Спасибо. А теперь иди, пока я не размяк.|Rad etding. Buning uchun boshing balodan chiqmaydi, bolam. ...Rahmat. Endi ket, yumshab qolmasimdan.`]], d);
    }
  }));
  FAC.talk.ergash = d => {
    if (act('s4')) { s4Ergash(d); return; }
    const L = { took: `Ergash pours tea for you as for any guest. He doesn't remember why he keeps two bowls.|Эргаш наливает тебе чай, как любому гостю. Он не помнит, почему держит две пиалы.|Ergash senga har qanday mehmonga quygandek choy quyadi. Nega ikkita piyola saqlashini eslamaydi.`, mine: `"Saodat had hiccups, you know. At our wedding. Did I tell you? I'll tell you again."|«У Саодат на нашей свадьбе икота была, знаешь? Я рассказывал? Ещё раз расскажу».|«To'yimizda Saodatni hiqichoq tutgan, bilasanmi? Aytib bermaganmidim? Yana aytib beraman».`, forged: `"Saodat had hiccups, you know. At our wedding." He smiles. He still has it.|«У Саодат на свадьбе икота была, знаешь?» Он улыбается. Это у него ещё есть.|«To'yimizda Saodatni hiqichoq tutgan, bilasanmi?» U jilmayadi. Bu hali unda bor.`, refused: `"Still alive, then. Good. Me too, for spite."|«Живой ещё. Хорошо. Я тоже — назло».|«Hali tirikmisan. Yaxshi. Men ham tirikman — o'chakishib».` }[FAC.br('s4')];
    play([['', L || FAC.NPC.ergash.def.idle]], d);
  };

  /* ================================================================ s5 · The Well Is Empty */
  const s5 = d => FAC.paidBack('singers', () => play([
    ['', `Candles float on the black water in paper boats. Among them drift tumars, dozens, grey at the seams, like bread soaked too often.|Свечи плывут по чёрной воде в бумажных лодочках. Между ними — тумары, десятки, серые по швам, как хлеб, который размачивали слишком часто.|Shamlar qora suvda qog'oz qayiqchalarda suzib yuribdi. Ular orasida o'nlab tumarlar — choklari kulrang, ko'p marta ho'llangan nondek.`],
    ['shirin', `Pick one up. Taste it. Go on, yodchi, you know how.|Подними любой. Испей. Давай, ёдчи, ты же умеешь.|Istaganini ol. Totib ko'r. Qani, yodchi, axir bilasan-ku.`],
    ['', `A wedding. Thin as tea brewed for the twentieth time. Someone tasted this before you, and before them, and before them.|Свадьба. Жидкая, как чай, заваренный в двадцатый раз. Кто-то пил это до тебя, и до него, и до того.|To'y. Yigirmanchi marta damlangan choydek suyuq. Buni sendan oldin kimdir totgan, undan oldin yana kimdir, undan oldin yana.`],
    ['shirin', `We feed him worn tumars. For years. I've known since I took the white. The fresh ones go up to the Divan's cellars, and the Divan pays for our candles.|Мы кормим его стёртыми тумарами. Годами. Я знаю это с тех пор, как надела белое. Свежие уходят наверх, в погреба Дивана, а Диван платит за наши свечи.|Biz uni yeyilgan tumarlar bilan boqamiz. Yillar davomida. Oq kiyganimdan beri bilaman. Yangilari yuqoriga, Devon yerto'lalariga ketadi, Devon esa shamlarimiz uchun to'laydi.`],
    ['shirin', `If I stop, the Divan stops paying, and the Order starves. If I tell, the Tail burns the Cloister. If I do nothing, he wakes. So I'll do one honest thing, once. The Great Tithe. Fresh memories, all at once.|Остановлюсь — Диван перестанет платить, и Орден умрёт с голоду. Расскажу — Хвост сожжёт Обитель. Ничего не сделаю — он проснётся. Поэтому я сделаю одну честную вещь, один раз. Великую десятину. Свежую память — разом.|To'xtasam — Devon to'lamaydi, Orden ochdan o'ladi. Aytsam — Dum xonaqohni yoqadi. Hech narsa qilmasam — u uyg'onadi. Shuning uchun bir marta halol ish qilaman. Buyuk ushr. Yangi xotira — birdaniga.`],
    () => (FAC.flag('s4forged') ? ['shirin', `Your smith's wedding, by the way, tasted of Farrukh's kitchen. I'm not angry. I'm counting.|Свадьба твоего кузнеца, кстати, отдавала кухней Фарруха. Я не сержусь. Я считаю.|Aytgancha, temirchingning to'yidan Farruxning oshxonasi hidi kelardi. Jahlim chiqmayapti. Sanayapman.`] : null)
  ], () => hub(`Shirin waits for an answer as if she already knows it.|Ширин ждёт ответа так, будто уже его знает.|Shirin javobni go'yo allaqachon bilgandek kutyapti.`, [
    { label: `— How many is "all at once"?|— «Разом» — это сколько?|— «Birdaniga» — bu qancha?`, lines: [['shirin', `The Tail. All of it, in one night. A hundred years of quiet for the rest of the city. I've done the sum a thousand times. It always comes out the same.|Хвост. Весь, за одну ночь. Сто лет тишины для остального города. Я тысячу раз пересчитывала. Всегда выходит одно и то же.|Dum. Butunlay, bir kechada. Shaharning qolgan qismiga yuz yillik tinchlik. Ming marta hisobladim. Doim bir xil chiqadi.`]] },
    { label: `— You counted the Tail twice for years. "The Well forgives arithmetic."|— Вы годами считали Хвост дважды. «Колодец прощает арифметику».|— Yillar davomida Dumni ikki karra hisobladingiz. «Quduq arifmetikani kechiradi».`, if: () => !!FAC.flag('s2copy') || FAC.flag('s2tasted'), lines: [['shirin', `Yes. And I'd do it again. Every name I wrote twice is a house that didn't slide into the sand that year. You think I don't know their names? I know them better than their mothers.|Да. И сделала бы снова. Каждое имя, вписанное дважды, — это дом, который в тот год не съехал в песок. Думаешь, я их имён не знаю? Я знаю их лучше их матерей.|Ha. Yana qilardim. Ikki marta yozilgan har bir ism — o'sha yili qumga surilmagan bir uy. Ularning ismlarini bilmaydi, deb o'ylaysanmi? Onalaridan ham yaxshiroq bilaman.`]] },
    { label: `— Your daughter.|— Ваша дочь.|— Qizingiz.`, lines: [['shirin', `Was nine. Was under the table when the floor lifted. I sing every night so no one else's daughter is. That's the whole of my theology, yodchi.|Ей было девять. Она была под столом, когда пол поднялся. Я пою каждую ночь, чтобы ничья больше дочь там не оказалась. Вот и всё моё богословие, ёдчи.|U to'qqiz yoshda edi. Pol ko'tarilganda stol tagida edi. Hech kimning qizi u yerda qolmasin deb har kecha kuylayman. Mening bor ilohiyotim shu, yodchi.`]] }
  ], [
    { id: 'stay', label: `"Then I'll stand with you. Someone has to hold the book."|«Тогда я с вами. Кто-то должен держать книгу.»|«Unda men siz bilanman. Kimdir daftarni ushlab turishi kerak.»` },
    { id: 'leave', label: `"Then you're no better than the Divan."|«Тогда вы ничем не лучше Дивана.»|«Unda siz Devondan hech qancha yaxshi emassiz.»` }
  ], o => {
    if (o.id === 'stay') {
      FAC.add('singers', 15); FAC.react({ nargiza: -10, surayyo: -10 }, 'stayed with Shirin');
      if (FAC.flag('s4forged') && !FAC.check('mem', 6).ok) FAC.add('singers', -10);
      FAC.finish('s5', 'stay', `You stayed with Shirin. When the Great Tithe begins, she will want your voice.|Ты остался с Ширин. Когда начнётся Великая десятина, ей понадобится твой голос.|Shirin bilan qolding. Buyuk ushr boshlanganda unga sening ovozing kerak bo'ladi.`);
      play([['shirin', `Thank you. I won't pretend it's a kindness to you. It isn't.|Спасибо. Не буду делать вид, будто это тебе на благо. Это не так.|Rahmat. Bu senga yaxshilik, deb ko'rsatmayman. Unday emas.`]], d);
    } else {
      FAC.add('singers', -25); FAC.closeArc('singers', 'left'); FAC.react({ nargiza: 10, surayyo: 10 }, 'left Shirin');
      FAC.finish('s5', 'leave', `You walked away from Shirin at the Well. The Singers' arc ends here, for you.|Ты ушёл от Ширин у Колодца. Для тебя арка Певцов на этом закончилась.|Quduq yonida Shirindan ketding. Sen uchun Xonandalar yo'li shu yerda tugadi.`);
      play([['shirin', `No. I'm worse. I know exactly what I'm doing. Go on, then. Go and be right somewhere.|Нет. Я хуже. Я точно знаю, что делаю. Ступай. Иди и будь где-нибудь прав.|Yo'q. Men yomonroqman. Nima qilayotganimni aniq bilaman. Bor. Borib, biror joyda haq bo'l.`]], d);
    }
  })));

  /* ================================================================ s6 · The Great Tithe (Act III, the Dream) */
  const s6 = d => play([
    ['', `In the dream the Tail walks into the Well in a long, quiet line. Each person carries a lamp and puts it out at the water's edge.|Во сне Хвост длинной тихой вереницей входит в Колодец. У каждого в руках лампа, и у кромки воды каждый её гасит.|Tushda Dum uzun, jimjit qator bo'lib Quduqqa kirib boryapti. Har kimning qo'lida chiroq, suv bo'yida har kim uni o'chiradi.`],
    ['shirin', `Here you are. Take the book. Your voice knows every door in the Tail. Read me their names, and I'll sing them home.|Вот и ты. Возьми книгу. Твой голос знает каждую дверь Хвоста. Читай мне их имена, а я спою их домой.|Mana kelding. Daftarni ol. Ovozing Dumdagi har bir eshikni biladi. Menga ismlarini o'qib ber, men ularni uyga kuylab yuboraman.`],
    () => (sadoAwake() ? ['sado', `Mehri's in the line. Ergash. The laundress with the knots. ...I'm not telling you what to do. I'm just counting them.|Мехри в веренице. Эргаш. Прачка со своими узлами. ...Я не говорю тебе, что делать. Я просто их считаю.|Qatorda Mehri bor. Ergash. Tugunlari bilan kir yuvuvchi ayol. ...Senga nima qilishni aytmayapman. Shunchaki ularni sanayapman.`] : null),
    cl('nargiza', `If you read, I'm gone, yodchi. I won't sing over them. I won't.|Если будешь читать — меня с тобой больше нет, ёдчи. Перепевать их я не стану. Не стану.|O'qisang — men ketaman, yodchi. Ularning ustidan kuylamayman. Kuylamayman.`)
  ], () => ask(`The book is open. The line is moving.|Книга раскрыта. Вереница движется.|Daftar ochiq. Qator yurib boryapti.`, [
    { id: 'help', label: `Read the names. Every one.|Читать имена. Все до одного.|Ismlarni o'qish. Hammasini, bittasini ham qoldirmay.`, lock: FAC.flag('helped6') ? `You already gave your voice to someone tonight.|Сегодня ты уже отдал свой голос другому.|Bugun ovozingni boshqaga berib bo'lding.` : null },
    { id: 'fight', label: `Read the names wrong — and keep reading, louder, until the song breaks.|Читать имена неправильно — и громче, громче, пока песня не сломается.|Ismlarni noto'g'ri o'qish — va baland, yana baland, qo'shiq sinmaguncha.` },
    { id: 'away', label: `Put the book down and walk away. Not with her. Not against her.|Положить книгу и уйти. Не с ней. Но и не против неё.|Daftarni qo'yib, ketib qolish. U bilan emas. Lekin unga qarshi ham emas.` }
  ], o => {
    if (o.id === 'help') {
      FAC.flag('helped6', 'singers'); F().faction = 'singers'; save();
      FAC.add('singers', 20); FAC.add('tail', -40); addVoid(5, `a whole street of names|целая улица имён|butun bir ko'chaning ismlari`);
      FAC.react({ surayyo: -40, alp: -20 }, 'the Great Tithe');
      try { if (G.PARTY && G.PARTY.has('nargiza')) G.PARTY.leave('nargiza', 'tithe'); } catch (e) { /* ignore */ }
      try { G.CH.grantLegend('first_wax'); } catch (e) { /* ignore */ }
      FAC.finish('s6', 'help', `You read the Tail's names for the Great Tithe. Shirin's plan is the one under way.|Ты прочёл имена Хвоста для Великой десятины. В ход пошёл план Ширин.|Buyuk ushr uchun Dumning ismlarini o'qib berding. Shirinning rejasi amalga oshmoqda.`, { xp: 'arc' });
      play([['', `You read. Your voice is steady; you've done this for twenty years. Shirin sings each name after you, and each lamp goes out.|Ты читаешь. Голос ровный — ты двадцать лет этим занимаешься. Ширин поёт каждое имя за тобой, и каждая лампа гаснет.|O'qiysan. Ovozing bir tekis — yigirma yildan beri shu ish bilan shug'ullanasan. Shirin har bir ismni sendan keyin kuylaydi va har bir chiroq o'chadi.`], ['shirin', `Take this. The knife that sealed the first tumar. It should be in hands that don't shake.|Возьми. Нож, которым запечатали первый тумар. Он должен быть в руках, которые не дрожат.|Ol. Birinchi tumarni muhrlagan pichoq. U titramaydigan qo'llarda bo'lishi kerak.`]], d);
    } else if (o.id === 'fight') {
      FAC.flag('fight6', 'singers');
      play([['', `"Ergash, son of—" you say, and give him the wrong father. The next name you give a wrong street. Shirin's song stumbles like a foot on a missing step.|«Эргаш, сын...» — говоришь ты и называешь чужого отца. Следующему — чужую улицу. Песня Ширин спотыкается, как нога о пропавшую ступеньку.|«Ergash, o'g'li...» deysan va boshqa otani aytasan. Keyingisiga boshqa ko'chani. Shirinning qo'shig'i yo'q zinapoyaga qoqilgan oyoqdek qoqiladi.`], ['shirin', `...You. Of all of them, you. Very well. If the Well won't have the Tail, it will have its yodchi.|...Ты. Из всех — ты. Хорошо. Если Колодцу не достанется Хвост, ему достанется его ёдчи.|...Sen. Hammadan ham — sen. Mayli. Quduqqa Dum nasib qilmasa, uning yodchisi nasib qiladi.`]], () => { d(); FAC.goLair('f_voice'); });
    } else {
      FAC.add('singers', -10); FAC.finish('s6', 'away', `You put down the book and left the Great Tithe to Shirin and the Well.|Ты положил книгу и оставил Великую десятину Ширин и Колодцу.|Daftarni qo'yib, Buyuk ushrni Shirin va Quduqqa qoldirding.`, { noXp: true });
      play([['shirin', `Then I'll read them myself. It'll take longer. I have the night.|Тогда прочту сама. Выйдет дольше. Ночь у меня есть.|Unda o'zim o'qiyman. Uzoqroq cho'ziladi. Tun mening ixtiyorimda.`]], d);
    }
  }));

  /* ---------------------------------------------------------------- who says what, by the state of the arc */
  FAC.talk.habiba = d => {
    const o = [];
    if (FAC.Q.s1.offer() && q('s1').st === 'none') o.push({ label: `— You were looking for someone?|— Вы кого-то ищете?|— Kimnidir qidiryapsizmi?`, go: s1Offer });
    if (FAC.Q.s2.offer() && q('s2').st === 'none') o.push({ label: `— Habiba. You sent for me.|— Хабиба. Вы меня звали.|— Habiba. Meni chaqirtirgan ekansiz.`, go: s2Offer });
    if (FAC.Q.s3.offer() && q('s3').st === 'none') o.push({ label: `— Is something wrong in the Cloister?|— В Обители что-то стряслось?|— Xonaqohda biror gap bo'ldimi?`, go: s3Offer });
    FAC.menu('habiba', `Habiba|Хабиба|Habiba`, o, d, FAC.br('s1') === 'covered' ? `"A Hollow who takes only white wax," Habiba says, not to you, to the air.|«Пустой, который берёт только белый воск», — говорит Хабиба, не тебе, в воздух.|«Faqat oq mum oladigan Bo'sh», deydi Habiba, senga emas, havoga.` : null);
  };
  FAC.talk.shirin6 = d => {
    const W = G.WORLD2.active;
    if (W === 'cloister' && FAC.Q.s4.offer() && q('s4').st === 'none') { s4Offer(d); return; }
    if (W === 'well' && FAC.Q.s5.offer() && q('s5').st === 'none') { s5(d); return; }
    if (W === 'dream' && q('s6').st === 'none') {
      if (FAC.Q.s6.offer()) { s6(d); return; }
      if (FAC.flag('fight6') === 'singers' && !FAC.flag('fought_singers')) { play([['shirin', `Still here, yodchi? The Well is patient. So am I.|Ещё здесь, ёдчи? Колодец терпелив. И я тоже.|Hali shu yerdamisan, yodchi? Quduq sabrli. Men ham.`]], () => { d(); FAC.goLair('f_voice'); }); return; }
      play([['shirin', `Not yet. The Well doesn't know you well enough to hear you read.|Рано. Колодец ещё недостаточно тебя знает, чтобы слушать, как ты читаешь.|Hali erta. Quduq o'qishingni tinglash uchun seni hali yetarlicha tanimaydi.`]], d); return;
    }
    play([['', FAC.NPC.shirin6.def.idle]], d);
  };
  // s6 in the dream: once fought, the fight can be taken up again from her spot
  FAC.Q.s6.again = () => FAC.flag('fight6') === 'singers' && !FAC.flag('fought_singers');

  /* ================================================================ Shirin, Voice of the Well — the boss's story (the moveset is in 65s) */
  BOSS('f_shirin', {
    name: `Shirin, Voice of the Well|Ширин, Голос Колодца|Shirin, Quduq ovozi`,
    title: `The song that holds the city|Песня, что держит город|Shaharni ushlab turgan qo'shiq`,
    quote: `"Hush now"|«Тише, тише»|«Jim, jim»`,
    lair: `The Well in the dream|Колодец во сне|Tushdagi Quduq`, lairSub: `Where the Great Tithe is sung|Где поют Великую десятину|Buyuk ushr kuylanadigan joy`,
    portrait: 'shirin',
    pre: [
      ['', `The Well's rim is a stage of white stone. The water below hums the Pledge Song back at you, the one she sang into you in the Vault.|Край Колодца — сцена из белого камня. Вода внизу напевает тебе в ответ Песню Залога — ту самую, что она спела в тебя в Хранилище.|Quduq labi — oq toshdan sahna. Pastdagi suv senga Garov qo'shig'ini qaytarib xirgoyi qiladi — Xazinada u senga kuylagan qo'shiqni.`],
      ['boss', `I bound you once to save the city. I'll bind you again to save it from you.|Однажды я связала тебя, чтобы спасти город. Свяжу и снова — чтобы спасти его от тебя.|Bir marta seni shaharni qutqarish uchun bog'lagandim. Yana bog'layman — shaharni sendan qutqarish uchun.`]
    ],
    again: [`Again, yodchi. A song is only finished when it's sung through.|Снова, ёдчи. Песня закончена, только когда её допели.|Yana, yodchi. Qo'shiq oxirigacha kuylangandagina tugaydi.`, `The water remembers every time you fall.|Вода помнит каждый раз, когда ты падаешь.|Suv har safar yiqilganingni eslab qoladi.`],
    post: d => {
      FAC.flag('fought_singers', 1); FAC.add('singers', -60); FAC.add('tail', 25); FAC.retarget('singers');
      FAC.react({ surayyo: 15, nargiza: 10 }, 'stopped the Great Tithe');
      FAC.finish('s6', 'fought', `You broke the Great Tithe from inside and Shirin's voice with it. The line of lamps walked back up into the Tail.|Ты сорвал Великую десятину изнутри — и вместе с ней голос Ширин. Вереница ламп пошла обратно, в Хвост.|Buyuk ushrni ichkaridan buzding — u bilan birga Shirinning ovozini ham. Chiroqlar qatori Dumga qaytib ketdi.`, { xp: 'arc' });
      play([
        ['', `Shirin kneels on the white stone. She opens her mouth and only breath comes out, the way it came out of her novices.|Ширин стоит на коленях на белом камне. Открывает рот — и выходит только дыхание, как у её послушников.|Shirin oq tosh ustida tiz cho'kib turibdi. Og'zini ochadi — faqat nafas chiqadi, shogirdlaridagidek.`],
        ['', `Behind you the lamps relight, one by one, and the line turns and walks back up towards the Tail.|За твоей спиной лампы загораются снова, одна за другой, и вереница разворачивается и идёт обратно, к Хвосту.|Orqangda chiroqlar birin-ketin yana yonadi, qator ortiga burilib, Dumga qaytib ketadi.`],
        () => (sadoAwake() ? ['sado', `She can't sing. Ravshan, she can't sing any more. ...Is that what we wanted?|Она не может петь. Равшан, она больше не может петь. ...Мы этого хотели?|U kuylay olmaydi. Ravshan, u endi kuylay olmaydi. ...Biz shuni xohlaganmidik?`] : null)
      ], d);
    }
  });
  FAC.lair('f_voice', 'f_shirin', 'yd_choir_hall');
  FAC.EPI.singers = e => FAC.flag('fought_singers') ? { k: 'shirin', v: 'voiceless', e, text: `Shirin never sang again after the dream. She teaches novices to hold a note she can no longer reach, and listens to the Well with her hand on the stone.|После сна Ширин больше не пела. Она учит послушников держать ноту, до которой сама уже не дотягивается, и слушает Колодец, положив ладонь на камень.|Tushdan keyin Shirin boshqa kuylamadi. Shogirdlarga o'zi endi yetolmaydigan notani ushlab turishni o'rgatadi va kaftini toshga qo'yib, Quduqni tinglaydi.` } : null;
}
