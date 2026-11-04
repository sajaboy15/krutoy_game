/* 88g_camp_alp_nargiza.js — talks by the fire (GDD ch. 7 "Лагерь-чайхана"): Alp (15) and Nargiza (16).
   Each opens by its conditions (approval, arc step, story, decisions) and is told once; one comes by itself after a
   rest, more with "Sit by the fire" (88b). No talk hints at what Sado is before the reveal (spoiler rule). */
{
  const T = COMP.talk, f = COMP.f, arc = COMP.arc, app = COMP.app, story = COMP.story, has = COMP.has;
  const sado = () => sadoAwake();
  const knotOpen = () => ['forgive', 'truce', 'break', 'revenge'].includes(f('knot'));

  /* ================================================================ ALP */
  T({ id: 'alp_bread', who: 'alp', when: () => arc('alp') >= 1, lines: [
    ['', `Alp breaks a flatbread into pieces and counts them under his breath.|Алп разламывает лепёшку на куски и пересчитывает их себе под нос.|Alp nonni bo'laklarga bo'lib, dimog'ida sanayapti.`],
    ['alp', `Seven pieces. Seven children. ...And me. Eight. I always forget me.|Семь кусков. Семь детей. ...И я. Восемь. Я всегда себя забываю.|Yetti bo'lak. Yetti bola. ...Va men. Sakkiz. Doim o'zimni unutaman.`],
    ['hero', `Eat yours now. They're not here.|Съешь свой сейчас. Их тут нет.|O'zingnikini hozir ye. Ular bu yerda yo'q.`],
    ['alp', `If I eat it now, I'll forget I ate. Then I'll take another one tomorrow. Better to wait.|Если съем сейчас, забуду, что ел. Завтра возьму ещё. Лучше подождать.|Hozir yesam, yeganimni unutaman. Ertaga yana bittasini olaman. Kutgan yaxshi.`]
  ] });
  T({ id: 'alp_count', who: 'alp', when: () => story('a1_rabat') || story('a1_bazaar'), lines: [
    ['hero', `Why do you count to three before you answer?|Почему ты считаешь до трёх, прежде чем ответить?|Javob berishdan oldin nega uchgacha sanaysan?`],
    ['alp', `A man told me: count to three, and you'll say fewer stupid things. I don't remember the man. The counting stayed.|Один человек сказал: считай до трёх — и скажешь меньше глупостей. Человека я не помню. Счёт остался.|Bir odam aytgandi: uchgacha sana — kamroq ahmoqona gap aytasan. Odamni eslamayman. Sanash qolib ketdi.`],
    ['alp', `...It doesn't always work.|...Не всегда помогает.|...Har doim ham ish bermaydi.`]
  ] });
  T({ id: 'alp_joke', who: 'alp', when: () => story('a1_bazaar') && app('alp') >= 0, lines: () => [
    ['alp', `Yodchi. What do a yodchi and a Hollow have in common?|Ёдчи. Что общего у ёдчи и Пустого?|Yodchi. Yodchi bilan Bo'shning nimasi o'xshash?`],
    ['hero', `What?|Что?|Nima?`],
    ['alp', has('surayyo') ? `We both forget to eat. Surayyo says so. She's right. That's the joke.|Оба забываем поесть. Так Сурайё говорит. Она права. Вот и вся шутка.|Ikkalamiz ham ovqatlanishni unutamiz. Surayyo shunday deydi. U haq. Hazil shu.` : `We both carry other people's memories. Mine fell out. ...That was a joke. I made one.|Оба носим чужую память. Моя выпала. ...Это была шутка. Я пошутил.|Ikkalamiz ham birovning xotirasini ko'tarib yuramiz. Meniki tushib qolgan. ...Bu hazil edi. Hazillashdim.`],
    () => (sado() ? ['sado', `He made a joke. Ravshan, he made a joke! Laugh, quickly!|Он пошутил. Равшан, он пошутил! Смейся, быстро!|U hazillashdi. Ravshan, u hazillashdi! Kul, tez!`] : null)
  ], after: () => app('alp', 3) });
  T({ id: 'alp_mehri', who: 'alp', when: () => story('a1_tail') && arc('alp') >= 1, lines: [
    ['alp', `Mehri gave me the name. Alp. I lifted her cart out of the mud. Alp means hero. I said I'm not a hero.|Имя мне дала Мехри. Алп. Я вытащил её тележку из грязи. Алп — значит богатырь. Я сказал, что я не богатырь.|Ismni menga Mehri qo'ygan. Alp. Uning aravasini loydan chiqarib qo'ygandim. Alp — pahlavon degani. Men pahlavon emasman, dedim.`],
    ['alp', `She said: "Then lift quietly." ...I do.|Она сказала: «Тогда поднимай тихо». ...Я так и делаю.|U aytdi: «Unda jimgina ko'tar». ...Shunday qilaman.`]
  ] });
  T({ id: 'alp_hands', who: 'alp', when: () => f('alpScars'), lines: [
    ['alp', `This morning I tied my sandal like you tie a rope from wrist to wrist. Without thinking. My hands knew it.|Сегодня утром я завязал сандалию так, как вяжут верёвку от запястья к запястью. Не думая. Руки знали.|Bugun ertalab kovushimni arqonni bilakdan bilakka bog'lagandek bog'ladim. O'ylamasdan. Qo'llarim bilardi.`],
    ['alp', `I undid it. I tied it again the normal way. It took a long time.|Я развязал. Завязал заново, по-обычному. Долго возился.|Yechib tashladim. Qaytadan, oddiy qilib bog'ladim. Uzoq ovora bo'ldim.`]
  ], after: () => app('alp', 2) });
  T({ id: 'alp_children', who: 'alp', when: () => app('alp') >= 20, lines: [
    ['', `There are smudges of charcoal on Alp's forearm. Names.|На предплечье у Алпа следы угля. Имена.|Alpning bilagida ko'mir izlari. Ismlar.`],
    ['alp', `Dilnoza. Kamol. Little Sanjar, who sings. Rano. Two Akmals, big and small. Zarina, who bites. I write them down. In case.|Дильноза. Камол. Маленький Санжар, который поёт. Рано. Два Акмаля, большой и маленький. Зарина, которая кусается. Я записываю. На всякий случай.|Dilnoza. Kamol. Kuylaydigan kichkina Sanjar. Ra'no. Ikki Akmal, kattasi va kichigi. Tishlaydigan Zarina. Yozib qo'yaman. Har ehtimolga qarshi.`],
    ['hero', `In case of what?|На какой случай?|Qanday ehtimolga?`],
    ['alp', `In case I wake up empty again.|На случай, если снова проснусь пустым.|Yana bo'm-bo'sh uyg'onib qolsam, degan ehtimolga.`]
  ], after: () => app('alp', 3) });
  T({ id: 'alp_lots', who: 'alp', when: () => ['returned', 'choice'].includes(F().alpTumars) && f('alpPath') !== 'captain', lines: () => [
    ['alp', F().alpTumars === 'choice' ? `I haven't opened them. But I count them every night through my shirt. Twelve. They're warm.|Я их не вскрывал. Но каждую ночь пересчитываю через рубаху. Двенадцать. Тёплые.|Ularni ochmaganman. Lekin har kecha ko'ylak ustidan sanayman. O'n ikkita. Iliq.` : `Lot fourteen laughed like a donkey. Lot twenty-two married twice. I'm learning them. Like the children's names.|Лот четырнадцать смеялся, как осёл. Лот двадцать два женился дважды. Я их учу. Как имена детей.|O'n to'rtinchi lot eshakdek kulardi. Yigirma ikkinchi lot ikki marta uylangan. Ularni yodlayapman. Bolalarning ismlarini yodlagandek.`],
    ['hero', `Why learn them?|Зачем их учить?|Ularni nega yodlaysan?`],
    ['alp', `So that somebody knows them who isn't selling them.|Чтобы их знал кто-то, кто их не продаёт.|Ularni sotmaydigan biror kishi bilib tursin, deb.`]
  ] });
  T({ id: 'alp_burned', who: 'alp', when: () => F().alpTumars === 'destroyed', lines: [
    ['alp', `I don't sleep well. Something is missing. Like a tooth. My tongue keeps going to where it was.|Сплю плохо. Чего-то не хватает. Как зуба. Язык всё тянется туда, где он был.|Yaxshi uxlolmayapman. Nimadir yetishmayapti. Tishdek. Tilim doim u bo'lgan joyga boradi.`],
    ['hero', `It's nothing. Try to sleep.|Ерунда. Попробуй уснуть.|Hech narsa emas. Uxlashga harakat qil.`],
    ['alp', `...You said "nothing" fast. You count before you lie, yodchi. You didn't count.|...Ты быстро сказал «ерунда». Ты считаешь, прежде чем соврать, ёдчи. Сейчас не считал.|...«Hech narsa»ni tez aytding. Yolg'on gapirishdan oldin sanaysan, yodchi. Hozir sanamading.`]
  ] });
  T({ id: 'alp_tilla', who: 'alp', when: () => story('b_court'), lines: [
    ['alp', `Tilla-bek smiles with his eyes closed. I know that smile. Not my head. My back. It wants to stand straighter.|Тилла-бек улыбается с закрытыми глазами. Я знаю эту улыбку. Не головой. Спиной. Ей хочется выпрямиться.|Tilla-bek ko'zini yumib jilmayadi. Bu jilmayishni bilaman. Boshim bilan emas. Belim bilan. U tikroq turgisi keladi.`],
    ['alp', `I don't like my back much.|Спина у меня не очень.|Belim menga uncha yoqmaydi.`]
  ] });
  T({ id: 'alp_surayyo', who: ['alp', 'surayyo'], when: () => arc('surayyo') >= 1, lines: [
    ['alp', `I guarded her sluices for four summers. She brought me bread. She saw the scars on my wrists. She never asked.|Четыре лета я сторожил её шлюзы. Она приносила мне хлеб. Видела шрамы на запястьях. Ни разу не спросила.|To'rt yoz uning shlyuzlarini qo'riqladim. U menga non olib kelardi. Bilagimdagi izlarni ko'rgan. Bir marta ham so'ramagan.`],
    ['surayyo', `Some questions are like sluices. You open them, you can't close them again. ...Eat your bread, big man.|Некоторые вопросы — как шлюзы. Откроешь — не закроешь. ...Ешь свой хлеб, большой.|Ba'zi savollar shlyuzga o'xshaydi. Ochsang — yopolmaysan. ...Noningni ye, katta odam.`]
  ] });
  T({ id: 'alp_nargiza', who: ['alp', 'nargiza'], when: () => !knotOpen() && arc('nargiza') >= 1, lines: [
    ['alp', `The singing girl hums when she's scared. I count. We're both very loud inside.|Поющая девочка напевает, когда боится. Я считаю. Внутри мы оба очень громкие.|Kuylaydigan qiz qo'rqqanda xirgoyi qiladi. Men sanayman. Ichimizda ikkalamiz ham juda shovqinlimiz.`],
    ['nargiza', `You breathe in time, you know. When I hum. Like a drum. I've been leaning on it for days.|А ты дышишь в такт, знаешь. Когда я напеваю. Как барабан. Я уже который день на это опираюсь.|Bilasanmi, sen ritm bilan nafas olasan. Men xirgoyi qilganda. Nog'oradek. Necha kundan beri shunga tayanaman.`]
  ] });
  T({ id: 'alp_gate', who: 'alp', when: () => f('alpEnd4') === 'stay', lines: [
    ['alp', `Arslon. It's a good name for a lion. Lions eat other animals. I'll keep Alp. Alp lifts.|Арслон. Хорошее имя для льва. Львы едят других зверей. Я оставлю Алпа. Алп поднимает.|Arslon. Sherga yaxshi ism. Sherlar boshqa hayvonlarni yeydi. Men Alpni qoldiraman. Alp ko'taradi.`]
  ], after: () => app('alp', 3) });
  T({ id: 'alp_roof', who: 'alp', pri: 5, when: () => app('alp') >= 70, lines: [
    ['alp', `Yodchi. When this is over, come to the Tail. Help me fix the roof over the children.|Ёдчи. Когда всё кончится, приходи в Хвост. Помоги мне починить крышу над детьми.|Yodchi. Hammasi tugagach, Dumga kel. Bolalarning tepasidagi tomni tuzatishga yordam ber.`],
    ['hero', `That's all?|И всё?|Shumi?`],
    ['alp', `That's all. For once I wanted to ask for something small.|И всё. Хоть раз захотелось попросить что-то маленькое.|Shu. Hech bo'lmasa bir marta kichkina narsa so'ragim keldi.`]
  ] });
  T({ id: 'alp_dream', who: 'alp', when: () => story('a3_dream'), lines: [
    ['alp', `In the dream I have a horse. I don't like the horse. I keep getting off and walking beside it.|Во сне у меня есть конь. Конь мне не нравится. Я всё слезаю и иду рядом.|Tushimda otim bor. Ot menga yoqmaydi. Doim tushib, yonida yurib ketaman.`],
    () => (sado() ? ['sado', `That's the nicest thing anyone's said in this whole dream.|Это самое хорошее, что кто-то сказал за весь этот сон.|Bu butun tushda kimdir aytgan eng yaxshi gap.`] : null)
  ] });
  T({ id: 'alp_sado', who: 'alp', when: () => sado() && arc('alp') >= 2, lines: [
    ['alp', `When you go quiet and look at the air, yodchi, is it the voice?|Когда ты замолкаешь и смотришь в пустоту, ёдчи, — это голос?|Jim bo'lib havoga qaraganingda, yodchi, bu o'sha ovozmi?`],
    ['hero', `...Sometimes.|...Иногда.|...Ba'zan.`],
    ['alp', `Tell the voice Alp says hello. Quietly. I think I'm loud for her.|Передай голосу, что Алп здоровается. Тихо. По-моему, я для неё громкий.|Ovozga Alp salom aytdi, de. Sekin. Menimcha, men unga baland eshitilaman.`],
    ['sado', `...Hello, Alp. He can't hear me. Tell him I said hello anyway.|...Здравствуй, Алп. Он не слышит. Всё равно скажи, что я поздоровалась.|...Salom, Alp. U eshitmaydi. Baribir salom aytdi, deb ayt.`]
  ] });

  /* ================================================================ NARGIZA */
  T({ id: 'nar_hum', who: 'nargiza', when: () => arc('nargiza') >= 1, lines: [
    ['nargiza', `That's the third mode. The Ustoz says it calms the Well. It doesn't calm me. I keep doing it anyway.|Это третий лад. Устоз говорит, он успокаивает Колодец. Меня не успокаивает. А я всё равно пою.|Bu uchinchi maqom. Ustoz u Quduqni tinchlantiradi, deydi. Meni tinchlantirmaydi. Baribir kuylayveraman.`],
    ['hero', `Then why?|Тогда зачем?|Unda nega?`],
    ['nargiza', `Because if I stop, I hear everything else.|Потому что если перестану, услышу всё остальное.|Chunki to'xtasam, qolgan hamma narsani eshitaman.`]
  ] });
  T({ id: 'nar_ustoz', who: 'nargiza', when: () => arc('nargiza') >= 1 && story('a1_cloister'), lines: [
    ['nargiza', `When I had fevers, the Ustoz sat up with me all night. She also wrote "sick" beside my name in the book. Both. The same hands.|Когда у меня был жар, Устоз сидела со мной всю ночь. И она же написала в книге рядом с моим именем «больна». И то и другое. Одни и те же руки.|Isitmam chiqqanda Ustoz tuni bilan yonimda o'tirardi. Daftarga ismim yoniga «kasal» deb ham o'sha yozgan. Ikkalasi ham. O'sha qo'llar.`],
    ['nargiza', `I don't know how to hate someone who wipes your forehead.|Я не умею ненавидеть того, кто вытирал тебе лоб.|Peshonangni artgan odamni qanday yomon ko'rishni bilmayman.`]
  ] });
  T({ id: 'nar_book', who: 'nargiza', when: () => story('a1_bazaar') && arc('nargiza') >= 1, lines: [
    ['nargiza', `When you hum the Take — where do you think the memory goes?|Когда ты напеваешь Взятие — куда, по-твоему, уходит память?|Olishni kuylaganingda — xotira qayerga ketadi deb o'ylaysan?`],
    ['hero', `Into the book.|В книгу.|Daftarga.`],
    ['nargiza', `Into the book! Ravshan. A book doesn't eat. Somebody eats. And he's been hungry for a very long time.|В книгу! Равшан. Книга не ест. Ест кто-то. И он давно голоден.|Daftarga! Ravshan. Daftar ovqat yemaydi. Kimdir yeydi. U esa ancha vaqtdan beri och.`]
  ], after: () => app('nargiza', 2) });
  T({ id: 'nar_whistle', who: 'nargiza', when: () => arc('nargiza') >= 3, lines: [
    ['nargiza', `Bekzod tried to teach me to whistle. I never got it. I hummed instead. That's how all this started, you know. A girl who couldn't whistle.|Бекзод пытался научить меня свистеть. Так и не вышло. Я напевала вместо этого. С этого всё и началось, знаешь. С девчонки, которая не умела свистеть.|Bekzod menga hushtak chalishni o'rgatmoqchi bo'lgan. Uddalay olmadim. O'rniga xirgoyi qilardim. Bilasanmi, hammasi shundan boshlangan. Hushtak chalolmaydigan qizdan.`]
  ] });
  T({ id: 'nar_alla', who: 'nargiza', when: () => ['give', 'cut'].includes(f('bekzod')), lines: [
    ['nargiza', `I sang "Alla" to a tumar. My mother would laugh. My mother would cry. Both, probably, the same minute.|Я пела «Аллу» тумару. Мама бы засмеялась. Мама бы заплакала. Скорее всего, то и другое в одну минуту.|Tumarga «Alla» aytdim. Onam kulardi. Onam yig'lardi. Ehtimol, ikkalasini bir daqiqada.`],
    ['nargiza', `Thank you for finding him. Whatever's in there.|Спасибо, что нашёл его. Что бы там ни было.|Uni topganing uchun rahmat. U yerda nima bo'lsa ham.`]
  ], after: () => app('nargiza', 4) });
  T({ id: 'nar_breath', who: 'nargiza', when: () => sado() && arc('nargiza') >= 2, lines: [
    ['nargiza', `Is there... somebody with you? Sometimes when you breathe there's a second breath. Smaller. Out of time.|С тобой... кто-то есть? Иногда, когда ты дышишь, слышится второе дыхание. Меньше. Не в такт.|Sen bilan... kimdir bormi? Ba'zan nafas olganingda ikkinchi nafas eshitiladi. Kichikroq. Ritmdan tashqari.`],
    ['sado', `She heard me. She heard me! Ravshan, did she hear me?|Она меня услышала. Услышала! Равшан, она меня слышит?|U meni eshitdi. Eshitdi! Ravshan, u meni eshityaptimi?`],
    ['hero', `...Just me, Nargiza. I breathe badly.|...Только я, Наргиза. Дышу плохо.|...Faqat men, Nargiza. Yomon nafas olaman.`],
    ['nargiza', `Mm. Then you breathe badly in two voices.|Мм. Значит, плохо дышишь на два голоса.|Mm. Demak, ikki ovozda yomon nafas olasan.`]
  ] });
  T({ id: 'nar_surayyo', who: ['nargiza', 'surayyo'], when: () => arc('surayyo') >= 1 && arc('nargiza') >= 1, lines: [
    ['nargiza', `She pays my Order with her own head and still brings us bread. I don't know whether to hug her or shake her.|Она платит моему Ордену собственной головой — и ещё носит нам хлеб. Не знаю, обнять её или потрясти.|U mening ordenimga o'z boshi bilan to'laydi — yana bizga non ham olib keladi. Uni quchoqlashni ham, silkitishni ham bilmayman.`],
    ['surayyo', `Do both. In that order. And then help me carry the bread.|Сделай и то и другое. В таком порядке. А потом помоги донести хлеб.|Ikkalasini ham qil. Shu tartibda. Keyin nonni tashishga yordam ber.`]
  ] });
  T({ id: 'nar_well', who: 'nargiza', when: () => story('a2_well') || story('b_seven'), lines: [
    ['nargiza', `I'm afraid of the Well. Not of falling. Of answering.|Я боюсь Колодца. Не упасть. Ответить.|Quduqdan qo'rqaman. Yiqilishdan emas. Javob berishdan.`],
    ['hero', `Answering what?|Ответить на что?|Nimaga javob berishdan?`],
    ['nargiza', `If I knew that, I wouldn't be afraid.|Если бы я знала, я бы не боялась.|Bilganimda, qo'rqmasdim.`]
  ] });
  T({ id: 'nar_obi', who: 'nargiza', when: () => F().nargizaQ === 'believes', lines: [
    ['nargiza', `Obi-Hayot. I say it at night like a boy's name. It feels rude. He likes it.|Оби-Хаёт. Я говорю это по ночам, как имя мальчишки. Как-то невежливо. Ему нравится.|Obi-Hayot. Kechalari buni bolaning ismidek aytaman. Odobsizlikdek tuyuladi. Unga yoqadi.`]
  ], after: () => app('nargiza', 3) });
  T({ id: 'nar_back', who: 'nargiza', when: () => F().nargizaQ === 'returned', lines: [
    ['nargiza', `I went back. I sing over him now, with the others. ...Don't look at me like that. I can feel you looking.|Я вернулась. Теперь пою поверх него, со всеми. ...Не смотри так. Я чувствую, как ты смотришь.|Qaytdim. Endi boshqalar bilan birga uning ustidan kuylayman. ...Bunaqa qarama. Qarayotganingni sezyapman.`],
    ['nargiza', `It's safe. You said it would be safe. It is.|Безопасно. Ты сказал, будет безопасно. Так и есть.|Xavfsiz. Xavfsiz bo'ladi deganding. Shunday.`]
  ] });
  T({ id: 'nar_alp', who: ['nargiza', 'alp'], when: () => f('knot') === 'forgive', lines: [
    ['nargiza', `He fixed my sandal. I didn't ask. He didn't say anything. I hate that it helped.|Он починил мне сандалию. Я не просила. Он ничего не сказал. Ненавижу, что это помогло.|U kovushimni tuzatib qo'ydi. Men so'ramadim. U hech narsa demadi. Bu yordam bergani alam qiladi.`],
    ['alp', `...The left one. The right one is also bad. Tomorrow.|...Левую. Правая тоже плохая. Завтра.|...Chapini. O'ngi ham yomon. Ertaga.`]
  ] });
  T({ id: 'nar_whistle_rule', who: 'nargiza', when: () => story('a1_bazaar'), lines: [
    ['nargiza', `Did you know Singers aren't allowed to whistle? It "invites the wind". I whistle in the latrine. That's my whole rebellion.|Знаешь, что Певцам нельзя свистеть? Это «призывает ветер». Я свищу в отхожем месте. Вот и весь мой бунт.|Bilasanmi, xonandalarga hushtak chalish mumkin emas? Bu «shamolni chaqiradi». Men hojatxonada hushtak chalaman. Butun isyonim shu.`],
    ['hero', `You said you can't whistle.|Ты говорила, что не умеешь свистеть.|Hushtak chalolmayman degan eding-ku.`],
    ['nargiza', `I said it's a rebellion, not that it works.|Я сказала, что это бунт, а не что он удаётся.|Isyon dedim, ish beradi demadim.`]
  ] });
  T({ id: 'nar_doubt', who: 'nargiza', when: () => story('a2_old'), lines: [
    ['nargiza', `Those Who Remember say: burn the chain. The Ustoz says: hold it. Tilla-bek says: sell it. Nobody says: ask him.|Те, кто помнит, говорят: сжечь цепь. Устоз говорит: держать. Тилла-бек говорит: продать. Никто не говорит: спросить его.|Eslaydiganlar zanjirni yoqish kerak deydi. Ustoz ushlab turish kerak deydi. Tilla-bek sotish kerak deydi. Hech kim undan so'rash kerak demaydi.`]
  ], after: () => app('nargiza', 2) });
  T({ id: 'nar_wedding', who: 'nargiza', pri: 5, when: () => app('nargiza') >= 70, lines: [
    ['nargiza', `When it's over, I want to sing somewhere nobody's listening for a sickness. A wedding. A bad one, with drunk uncles and a broken dutar.|Когда всё кончится, хочу петь там, где никто не слушает, не больна ли я. На свадьбе. На плохой, с пьяными дядьками и сломанным дутаром.|Hammasi tugagach, hech kim kasalligimni tinglamaydigan joyda kuylagim keladi. To'yda. Yomon to'yda, mast tog'alar va singan dutor bilan.`],
    ['hero', `I'll find you a bad wedding.|Найду тебе плохую свадьбу.|Senga yomon to'y topib beraman.`],
    ['nargiza', `Promise. The worst one in the city.|Обещай. Самую худшую в городе.|Va'da ber. Shahardagi eng yomonini.`]
  ] });
  T({ id: 'nar_dream', who: 'nargiza', when: () => story('a3_dream'), lines: [
    ['nargiza', `Even the walls hum here. For once I'm the quiet one.|Здесь даже стены напевают. Хоть раз тихая — я.|Bu yerda hatto devorlar ham xirgoyi qiladi. Bir marta bo'lsa ham jim turgan — men.`]
  ] });
  T({ id: 'nar_novices', who: 'nargiza', when: () => story('b_choir'), lines: [
    ['nargiza', `The novices practise at night now, the little ones. They sing the Tail's streets, one by one, in order. I know what it's for. They don't.|Послушницы теперь занимаются по ночам, маленькие. Поют улицы Хвоста, одну за другой, по порядку. Я знаю, для чего это. Они — нет.|Shogirdlar endi kechalari mashq qilishadi, kichkinalari. Dumning ko'chalarini birma-bir, tartib bilan kuylashadi. Nimaga ekanini bilaman. Ular bilishmaydi.`]
  ] });
}
