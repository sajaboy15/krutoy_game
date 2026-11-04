/* 89l_codex.js — the yodchi's book [L] (GDD ch. 20 "Коллекции", "Книги и записки"; ch. 16 families).
   One page of the character screen with four sections:
     Notes     — the texts found in the world (89m_books.js fills CODEX.BOOKS); read again any time;
     Memories  — Ravshan's lost memories (the tumars of 50_story_api: R().mem), titled here;
     Bestiary  — every enemy type by family and every boss: a line once met (first kill), the weak spot after three
                 kills or one "Someone else's memory" taste; a known weak spot gives +10% damage against that type;
     Collected — alchiks, legendaries, armour sets, recipes, books, memories: counters.
   The bestiary and the notes live in the global save (saga.codex), so they carry into New Game+ (GDD ch. 21). */
{
  const SG = () => { if (!saga.codex || typeof saga.codex !== 'object') saga.codex = {}; const c = saga.codex; c.k = c.k || {}; c.ts = c.ts || {}; c.b = c.b || {}; c.bs = c.bs || {}; return c; };
  const CODEX = G.CODEX = { S: SG, BOOKS: [], BOOK: {} };

  /* ================================================================ the bestiary: nine families (GDD ch. 16) */
  const FAM = [
    ['hollow', `The Hollow|Пустые|Bo'shlar`],
    ['singers', `Guard of the Singers|Стража Певцов|Xonandalar qo'riqchilari`],
    ['divan', `Divan sell-swords|Наёмники Дивана|Devon yollanmalari`],
    ['thieves', `Smugglers and thieves|Контрабандисты и воры|Kontrabandachilar va o'g'rilar`],
    ['karez', `Things of the karez|Твари кяризов|Korez maxluqlari`],
    ['salt', `Salt and sand|Соль и песок|Tuz va qum`],
    ['old', `Old Yodgor|Старый Ёдгор|Eski Yodgor`],
    ['spine', `Creatures of the Spine|Существа Хребта|Tizma jonzotlari`],
    ['dream', `The dream|Сон|Tush`],
    ['boss', `Those who stood in the way|Те, кто встал на пути|Yo'lni to'sganlar`]
  ];
  CODEX.FAM = FAM;
  // [id, family, what you learn on first meeting, the weak spot]
  const BEAST = [
    ['zindan_prisoner', 'hollow', `A debtor sung empty. It walks the old rounds of its life and strikes at whatever smells of wax: your satchel.|Должник, выпетый до дна. Ходит старыми кругами своей жизни и бьёт всё, что пахнет воском, — то есть твою сумку.|Tubigacha kuylab bo'shatilgan qarzdor. Hayotining eski yo'llarida aylanadi va mum hidi kelgan narsaga — sening xaltangga — tashlanadi.`, `Slow to turn. Step past its swing and strike from behind; it forgets you were there.|Медленно разворачивается. Шагни мимо замаха и бей со спины — он забывает, что ты был рядом.|Sekin buriladi. Zarbasidan o'tib, orqadan ur — sen yonida bo'lganingni unutadi.`],
    ['yd_hollow', 'hollow', `A Hollow who has drifted far from home. It follows the warmth of full tumars like a moth.|Пустой, ушедший далеко от дома. Тянется к теплу полных тумаров, как мотылёк к огню.|Uyidan uzoqqa ketib qolgan bo'sh. Kapalak olovga intilgandek, to'la tumarlarning iliqligiga intiladi.`, `It lunges where you were a moment ago. Let it lunge; hit it while it stares at the empty air.|Бросается туда, где ты был миг назад. Дай ему броситься и бей, пока он смотрит в пустоту.|Bir lahza oldin turgan joyingga tashlanadi. Tashlansin; u bo'shliqqa tikilib turganda ur.`],
    ['dummy', 'hollow', `A Hollow debtor, still wearing the face it had when it paid. It doesn't fight well. It doesn't stop either.|Пустой должник, всё ещё с тем лицом, с каким платил. Дерётся плохо. Но и не останавливается.|Bo'sh qarzdor, yuzi hamon to'lagan paytidagidek. Yomon urishadi. Lekin to'xtamaydi ham.`, `No guard at all. Two quick cuts and move on; don't let three of them corner you.|Защиты никакой. Два быстрых удара и дальше; не дай троим зажать тебя в угол.|Hech qanday himoyasi yo'q. Ikki tez zarba va oldinga; uchtasiga seni burchakka qisishga yo'l qo'yma.`],
    ['yd_scavenger', 'hollow', `Not Hollow yet: a scavenger who sells what the Hollow drop. Quick hands, quick knife, no loyalty to anyone.|Ещё не Пустой: падальщик, что продаёт обронённое Пустыми. Быстрые руки, быстрый нож, верности никому.|Hali bo'sh emas: bo'shlar tushirganini sotadigan o'laksaxo'r. Qo'li tez, pichog'i tez, hech kimga sodiq emas.`, `Runs when hurt and comes back with friends. Finish it before it reaches the corner.|Раненый убегает и возвращается с дружками. Добей его, пока он не добежал до угла.|Yaralansa qochadi va sheriklari bilan qaytadi. Burchakka yetguncha tugat.`],
    ['jailer', 'singers', `A Warden of the Well. They are chosen deaf, so the songs they guard can't touch them.|Страж Колодца. Их выбирают глухими, чтобы песни, которые они стерегут, их не трогали.|Quduq qo'riqchisi. Ularni kar bo'lganlardan tanlashadi, toki qo'riqlayotgan qo'shiqlari ularga ta'sir qilmasin.`, `Deaf, so blind on the side you come from. Get behind it and it has to turn its whole body.|Глухой, а значит, слеп с той стороны, откуда ты пришёл. Зайди за спину — ему придётся разворачиваться всем телом.|Kar, demak, sen kelgan tomondan ko'r. Orqasiga o't — butun gavdasi bilan burilishiga to'g'ri keladi.`],
    ['torch_zealot', 'singers', `A tithe torchbearer. They light the way for the yodchi on the Night of Payment, and burn what the yodchi leaves.|Факельщик десятины. В Ночь Уплаты освещает ёдчи дорогу и сжигает то, что ёдчи оставил.|Ushr mash'alachisi. To'lov kechasi yodchiga yo'l yoritadi va yodchi qoldirganini yoqib yuboradi.`, `The torch swing leaves fire on the ground. Jump the swing, not the flame, and hit it on the way down.|После взмаха факелом на земле остаётся огонь. Прыгай через взмах, а не через пламя, и бей на снижении.|Mash'ala silkinganidan keyin yerda olov qoladi. Olovdan emas, zarbadan sakra va tushayotganda ur.`],
    ['yd_warden', 'singers', `A Warden of the Singers in a white cap, with a shield older than he is. He keeps the Order's doors shut.|Страж Певцов в белой шапке, со щитом старше его самого. Держит двери Ордена закрытыми.|Oq qalpoqli Xonandalar qo'riqchisi, qalqoni o'zidan ham qari. Orden eshiklarini yopiq tutadi.`, `The shield faces front. Roll through and strike its back, or break its guard with heavy blows.|Щит смотрит вперёд. Перекатись за спину и бей туда, или ломай защиту тяжёлыми ударами.|Qalqon oldinga qaragan. Orqasiga dumalab o'tib ur yoki og'ir zarbalar bilan himoyasini sindir.`],
    ['yd_acolyte', 'singers', `An acolyte of the Well, learning to hang wax on the living. Its little songs make the air sticky.|Послушник Колодца, который учится вешать воск на живых. От его песенок воздух становится вязким.|Tiriklarga mum osishni o'rganayotgan Quduq shogirdi. Uning qo'shiqchalaridan havo yopishqoq bo'lib qoladi.`, `It must stand still to sing. Close the distance during the first note.|Чтобы петь, ему нужно стоять на месте. Сокращай дистанцию на первой же ноте.|Kuylash uchun joyida turishi kerak. Birinchi notadayoq masofani qisqartir.`],
    ['frost_shaman', 'singers', `A Dead Singer. The Order buries its voices in the cold, and some of them go on singing.|Мёртвый Певец. Орден хоронит свои голоса в холоде, и некоторые продолжают петь.|O'lik xonanda. Orden o'z ovozlarini sovuqqa ko'madi, ba'zilari esa kuylashda davom etadi.`, `Its song slows you, not it. Strike between verses, when its mouth closes.|Его песня замедляет тебя, а не его. Бей между куплетами, когда у него закрывается рот.|Uning qo'shig'i uni emas, seni sekinlashtiradi. Bandlar orasida, og'zi yopilganda ur.`],
    ['guard', 'divan', `A Divan mercenary. Paid by the month, so he fights like a man who wants to see the end of it.|Наёмник Дивана. Платят помесячно, поэтому дерётся как тот, кто хочет дожить до конца месяца.|Devon yollanmasi. Oylik oladi, shuning uchun oy oxirini ko'rmoqchi bo'lgan odamdek urishadi.`, `He blocks high. Low cuts and backsteps; he hates being made to chase.|Он закрывается сверху. Низкие удары и шаг назад — он терпеть не может догонять.|U tepadan himoyalanadi. Pastdan zarba va orqaga qadam — quvishni yomon ko'radi.`],
    ['yd_divan_archer', 'divan', `A Divan archer on the Ark walls. They count their arrows and are fined for each one they lose.|Лучник Дивана на стенах Арка. Стрелы считают, за каждую потерянную — штраф.|Ark devoridagi Devon kamonchisi. O'qlarini sanashadi, yo'qotilgan har biri uchun jarima.`, `Useless up close. Rush it after a shot, before the next arrow is on the string.|Вблизи бесполезен. Рвись к нему сразу после выстрела, пока новая стрела не на тетиве.|Yaqindan foydasiz. O'q otganidan keyin, yangi o'q kamonga qo'yilguncha unga tashlan.`],
    ['yd_gilded', 'divan', `A gilded spearman of the Ark guard. The gold is paint. The spear is not.|Позолоченный копейщик гвардии Арка. Золото — краска. Копьё — нет.|Ark gvardiyasining zarhal nayzachisi. Oltin — bo'yoq. Nayza esa yo'q.`, `Long reach, slow recovery. Make it thrust, step aside, and hit the shaft-hand.|Длинный выпад, долгий возврат. Вызови укол, шагни в сторону и бей по руке на древке.|Zarbasi uzun, qaytishi sekin. Sanchishga majbur qil, chetga chiq va dastadagi qo'lga ur.`],
    ['yd_divan_merc', 'divan', `A Divan sell-sword, heavier than the rest, sent where the Divan wants things to stay quiet.|Наёмник Дивана, тяжелее прочих: его посылают туда, где Дивану нужна тишина.|Boshqalardan og'irroq Devon yollanmasi: Devonga jimlik kerak bo'lgan joyga yuboriladi.`, `Its big swing can't be stopped, only avoided. Dodge the third blow; the opening comes after it.|Его большой замах не остановить, только уйти. Уклонись от третьего удара — окно будет после него.|Katta zarbasini to'xtatib bo'lmaydi, faqat chetlanish mumkin. Uchinchi zarbadan qoch — imkon undan keyin.`],
    ['sher', 'divan', `A palace tiger. The Divan keeps them hungry and lets them out at night, when the Ark is closed.|Дворцовый тигр. Диван держит их голодными и выпускает ночью, когда Арк закрыт.|Saroy yo'lbarsi. Devon ularni och tutadi va kechasi, Ark yopilganda qo'yib yuboradi.`, `The pounce is long and straight. Roll under it and it lands with its back to you.|Прыжок длинный и прямой. Перекатись под ним — он приземлится к тебе спиной.|Sakrashi uzun va to'g'ri. Uning ostidan dumalab o't — senga orqasi bilan tushadi.`],
    ['assassin', 'thieves', `A tumar thief. They work the Bazaar crowds and the dark lanes, and they always cut the cord first.|Вор тумаров. Работает в толпе Базара и в тёмных переулках и всегда сперва режет шнурок.|Tumar o'g'risi. Bozor olomoni va qorong'i tor ko'chalarda ishlaydi va doim avval ipni kesadi.`, `It vanishes and comes from behind. Turn when you hear the step, not when you see the knife.|Исчезает и заходит со спины. Разворачивайся на звук шага, а не когда увидишь нож.|G'oyib bo'lib, orqadan keladi. Pichoqni ko'rganda emas, qadam tovushini eshitganda burilib ol.`],
    ['snake_charmer', 'thieves', `A memory hawker. Sells you a stranger's happiness by the thimble, and its snakes guard the stall.|Торговец памятью. Продаёт чужое счастье напёрстками, а лоток стерегут его змеи.|Xotira sotuvchisi. Birovning baxtini angishvona bilan sotadi, rastasini ilonlari qo'riqlaydi.`, `Kill the charmer and the snakes lose heart. Go through them, not around.|Убей заклинателя — и змеи теряют пыл. Иди сквозь них, а не в обход.|Afsungarni o'ldir — ilonlar shashtidan tushadi. Ularni aylanib emas, orasidan o'tib bor.`],
    ['snake', 'thieves', `A Bazaar cobra, bred for guarding stalls. Small, fast, and it doesn't let go.|Базарная кобра, выведенная стеречь лотки. Маленькая, быстрая и не отпускает.|Rasta qo'riqlash uchun boqilgan bozor kobrasi. Kichkina, tez va qo'yib yubormaydi.`, `Low to the ground: downward strikes and jump-attacks reach it best.|Низко у земли: лучше всего достают удары сверху вниз и в прыжке.|Yerga yaqin: yuqoridan pastga va sakrab urilgan zarbalar yaxshi yetadi.`],
    ['jinn', 'thieves', `A bottled dream, sold in the night Bazaar and let out when the buyer wouldn't pay.|Сон в бутылке: продают на ночном Базаре и выпускают, когда покупатель не платит.|Shishadagi tush: tungi Bozorda sotiladi va xaridor pul to'lamasa, qo'yib yuboriladi.`, `It flickers before it strikes. Strike the flicker; it is solid for that moment only.|Перед ударом он мерцает. Бей в мерцание: только в этот миг он плотный.|Urishdan oldin miltillaydi. Miltillashga ur: faqat shu lahzada u qattiq.`],
    ['yd_eel', 'karez', `A blind eel of the karez. It hunts by the ripple you make, not by sight.|Слепой угорь кяризов. Охотится по ряби, которую ты поднимаешь, а не глазами.|Korezning ko'r ilonbaliqi. Ko'z bilan emas, sen qo'zg'atgan to'lqin bo'yicha ov qiladi.`, `Stand still at the water's edge and let it come up; it's open for a breath before it dives.|Встань у края воды и дай ему всплыть: перед нырком он открыт на один вдох.|Suv chetida qimirlamay tur, u chiqsin: sho'ng'ishdan oldin bir nafas ochiq qoladi.`],
    ['yd_leech', 'karez', `A karez leech, as long as an arm. It drinks blood first and memories after.|Пиявка кяризов длиной в руку. Сначала пьёт кровь, потом память.|Qo'ldek uzun korez zulugi. Avval qon, keyin xotira so'radi.`, `Slow and soft. Never let it latch on; one cut while it rears up is enough.|Медленная и мягкая. Не давай ей присосаться: хватит одного удара, пока она поднимается.|Sekin va yumshoq. Yopishishiga yo'l qo'yma: ko'tarilayotganda bitta zarba yetadi.`],
    ['yd_drowned', 'karez', `The Drowned: those who went into the karez after a lost memory and stayed. They still look for it.|Утопленники: те, кто спустился в кяризы за потерянной памятью и остался там. Они всё ещё ищут.|Cho'kkanlar: yo'qolgan xotira ortidan korezga tushib, o'sha yerda qolganlar. Hali ham qidirishyapti.`, `Heavy with water: they turn slowly. Strike, step around, strike again.|Тяжёлые от воды и медленно разворачиваются. Удар, шаг в обход, снова удар.|Suvdan og'ir, sekin buriladi. Zarba, aylanib qadam, yana zarba.`],
    ['rat_div', 'karez', `A gutter rat the size of a dog, fat on spilled wax. Where there is one, there are nine.|Сточная крыса размером с собаку, разжиревшая на пролитом воске. Где одна, там девять.|To'kilgan mumdan semirgan, itdek keladigan ariq kalamushi. Bittasi bor joyda to'qqiztasi bor.`, `Weak alone. Fight with a wall at your back so they can't come from both sides.|Поодиночке слабы. Дерись спиной к стене, чтобы не обошли с двух сторон.|Yolg'iz bo'lsa kuchsiz. Ikki tomondan kelmasliklari uchun devorga orqa berib urish.`],
    ['yd_albasty_kin', 'karez', `A daughter of Albasty: hair like wet weed, laughter from the wrong direction.|Дочь Албасты: волосы как мокрые водоросли, смех не с той стороны.|Albastining qizi: sochi ho'l suvo'tdek, kulgisi noto'g'ri tomondan.`, `It dives from above in a straight line. Step back, let it miss, and hit it on the ground.|Пикирует сверху по прямой. Отступи, дай ей промахнуться и бей, пока она на земле.|Tepadan to'g'ri chiziq bo'ylab sho'ng'iydi. Orqaga chekin, xato qilsin va yerdaligida ur.`],
    ['bori', 'salt', `A salt jackal of the Salt Road. They follow caravans for days, waiting for someone to fall behind.|Соляной шакал Соляной дороги. Днями идут за караваном, ждут, кто отстанет.|Tuz yo'lining tuz chiyabo'risi. Kunlab karvon ortidan yurib, kim orqada qolishini kutadi.`, `It bites and jumps back. Don't chase it: hold your ground and strike when it comes in.|Кусает и отскакивает. Не гоняйся: стой на месте и бей, когда он подходит.|Tishlab, orqaga sakraydi. Quvma: joyingda tur va yaqinlashganda ur.`],
    ['ghost_archer', 'salt', `A shade of the Salt Road: a caravan guard who never stopped watching for raiders.|Тень Соляной дороги: охранник каравана, который так и не перестал высматривать разбойников.|Tuz yo'li soyasi: qaroqchilarni kuzatishdan hech to'xtamagan karvon qo'riqchisi.`, `Its arrows are slow. Walk into them sideways and close in; it can't shoot what's already beside it.|Её стрелы медленные. Иди навстречу боком и сближайся: того, кто уже рядом, она не подстрелит.|O'qlari sekin. Ularga yonlama yur va yaqinlash: yonida turganni ota olmaydi.`],
    ['balbal_golem', 'salt', `A salt idol, one of the old stone watchers of the steppe, woken by the Sleeper's turning.|Соляной идол, один из старых каменных сторожей степи, разбуженный тем, что Спящий ворочается.|Tuz butu, dashtning eski tosh qo'riqchilaridan biri, Uxlovchining ag'darilishidan uyg'ongan.`, `Its slam shakes the ground but leaves it stuck. Strike its back while it pulls its fist out.|Его удар трясёт землю, но и сам он застревает. Бей в спину, пока он вытаскивает кулак.|Zarbasi yerni silkitadi, lekin o'zi qotib qoladi. Mushtini sug'urayotganda orqasiga ur.`],
    ['yd_salt_scorpion', 'salt', `A salt scorpion of the mines. Its venom tastes of nothing, then of everything at once.|Соляной скорпион шахт. Его яд сначала безвкусен, потом — на вкус как всё сразу.|Konlarning tuz chayoni. Zahri avval ta'msiz, keyin hamma narsaning ta'mi birdan.`, `The tail strikes after a pause. Wait out the pause, dodge, then hit the claws.|Хвост бьёт после паузы. Переждать паузу, увернуться, потом бить по клешням.|Dumi to'xtalishdan keyin uradi. To'xtalishni kut, chetlan, keyin qisqichlariga ur.`],
    ['scorpion', 'salt', `An ash scorpion: a desert thing that moved into the ruins when the people moved out.|Пепельный скорпион: пустынная тварь, что заселилась в руины, когда из них ушли люди.|Kul chayoni: odamlar ketgach, xarobalarga ko'chib kelgan cho'l maxluqi.`, `Armoured in front. Jump over it; its back is soft.|Спереди в броне. Перепрыгни его — со спины он мягкий.|Old tomoni zirhli. Ustidan sakrab o't — orqasi yumshoq.`],
    ['sand_worm', 'salt', `A sand worm. It hears your steps through the ground and comes up under them.|Песчаный червь. Слышит шаги сквозь землю и выныривает прямо под ними.|Qum chuvalchangi. Qadamlaringni yer orqali eshitadi va aynan ularning ostidan chiqadi.`, `Watch the sand bulge, then move. When it rises it is blind for a moment.|Смотри, где вздувается песок, и уходи. Когда он поднимается, он на миг слеп.|Qum qayerda ko'pchishini kuzat va ket. Ko'tarilganda bir lahza ko'r bo'ladi.`],
    ['yd_sand_ghul', 'salt', `A sand ghoul from the Year of Sand: a body the dunes gave back without its name.|Песчаный гуль из Года Песка: тело, которое барханы вернули без имени.|Qum yilining qum g'uli: barxanlar ismsiz qaytargan tana.`, `It burrows and resurfaces close. When it sinks, step away from where it went down.|Зарывается и выныривает рядом. Когда он уходит в песок, отойди от того места.|Ko'milib, yaqindan chiqadi. Qumga botganda, o'sha joydan uzoqlash.`],
    ['kempir_crow', 'salt', `A raven of the Tower of Silence. They clean the dakhma, and they've learned that yodchi carry food.|Ворон Башни Молчания. Они чистят дахму и уже знают, что ёдчи носят с собой еду.|Sukunat minorasining qarg'asi. Daxmani tozalashadi va yodchilar ovqat olib yurishini bilib olishgan.`, `It dives after a croak. Swing upward on the croak.|Пикирует после карканья. На карканье бей вверх.|Qag'illagandan keyin sho'ng'iydi. Qag'illaganda yuqoriga ur.`],
    ['mummy_warrior', 'old', `A buried guardsman of Old Yodgor. Wrapped for the grave, it got up to keep its post.|Погребённый стражник Старого Ёдгора. Обмотанный для могилы, он встал, чтобы держать пост.|Eski Yodgorning ko'milgan soqchisi. Qabr uchun o'ralgan, posti uchun o'rnidan turgan.`, `Strong but stiff: it can't attack twice in a row. Strike after each blow it throws.|Сильный, но скованный: не может ударить дважды подряд. Бей после каждого его удара.|Kuchli, lekin qotgan: ketma-ket ikki marta ura olmaydi. Har bir zarbasidan keyin ur.`],
    ['ghul', 'old', `A ghoul of Old Yodgor. It lives on what the founders left: bones, wax, and the dregs of their memories.|Гуль Старого Ёдгора. Живёт тем, что оставили основатели: костями, воском и остатками их памяти.|Eski Yodgor g'uli. Asoschilar qoldirgan narsalar: suyak, mum va xotiralarining sarqiti bilan yashaydi.`, `It charges in a straight line and can't stop. Sidestep and let it hit the wall.|Бросается по прямой и не может остановиться. Шагни в сторону, пусть врежется в стену.|To'g'ri chiziq bo'ylab tashlanadi va to'xtay olmaydi. Chetga chiq, devorga urilsin.`],
    ['yd_founder_guard', 'old', `A guard of the Seven, still watching the founders' doors for masters who will never come back.|Страж Семерых: всё ещё стережёт двери основателей для хозяев, которые не вернутся.|Yettilikning soqchisi: hech qachon qaytmaydigan xo'jayinlar uchun asoschilar eshigini hamon qo'riqlaydi.`, `Its guard breaks under heavy blows. Charged strikes, then step back.|Его защита ломается от тяжёлых ударов. Заряженный удар, потом шаг назад.|Himoyasi og'ir zarbalardan sinadi. Kuchaytirilgan zarba, keyin orqaga qadam.`],
    ['yd_shade', 'old', `The shade of a founder: a memory too old to have a face, still angry about something no one recalls.|Тень основателя: воспоминание настолько старое, что у него нет лица, но оно всё ещё злится на то, чего никто не помнит.|Asoschining soyasi: yuzi qolmagan darajada eski xotira, hech kim eslamaydigan narsadan hamon g'azablangan.`, `Light hurts it. It slows near lamps and fire; lure it there.|Свет ему вредит. У ламп и огня она замедляется — заманивай туда.|Yorug'lik unga zarar. Chiroq va olov yonida sekinlashadi — o'sha yoqqa chorla.`],
    ['ice_div', 'spine', `A frost div of the Spine, asleep in the ice for a hundred winters and very hungry for the hundred-and-first.|Ледяной див Хребта: проспал во льду сто зим и очень голоден к сто первой.|Tizmaning muz devi: yuz qish muzda uxlagan va yuz birinchisiga juda och.`, `Fire softens it. Without fire, hit and step back; its breath reaches only so far.|Огонь его размягчает. Без огня — бей и отходи: дыхание бьёт недалеко.|Olov uni yumshatadi. Olovsiz — ur va chekin: nafasi uzoqqa yetmaydi.`],
    ['ibex_spirit', 'spine', `The spirit of an ibex, from the time when the Spine still had herds. It defends a herd that isn't there.|Дух горного козла из тех времён, когда на Хребте ещё были стада. Защищает стадо, которого нет.|Tizmada hali podalar bo'lgan zamonlardagi tog' echkisining ruhi. Yo'q podani himoya qiladi.`, `It lowers its horns before the charge. That's the moment to jump.|Перед броском он опускает рога. В этот миг и прыгай.|Tashlanishdan oldin shoxlarini egadi. Aynan shu payt sakra.`],
    ['berkut_wraith', 'spine', `An eagle wraith: a hunting bird that outlived its hunter and still brings back what it kills.|Призрак беркута: ловчая птица, пережившая охотника, всё ещё приносит добычу домой.|Burgut sharpasi: ovchisidan ko'p yashagan ov qushi, hamon o'ljasini uyga olib keladi.`, `It circles, then stoops. Count the circles: it always stoops on the third.|Кружит, потом падает. Считай круги: он всегда бросается на третьем.|Aylanadi, keyin tashlanadi. Aylanishlarni sana: doim uchinchisida tashlanadi.`],
    ['peri', 'dream', `A fallen peri: something beautiful that a dreamer put down and forgot to pick up.|Падшая пери: что-то прекрасное, что спящий положил и забыл поднять.|Tushgan pari: tush ko'ruvchi qo'yib, olishni unutgan go'zal narsa.`, `Its light flares before each attack. Look away from the flare and strike right after.|Перед каждой атакой её свет вспыхивает. Отведи глаза от вспышки и бей сразу после.|Har hujumdan oldin nuri chaqnaydi. Chaqnashdan ko'z olib qoch va darhol ur.`],
    ['div_spearman', 'dream', `A div spearman out of an old tale, told so often it came to life in the dream.|Див-копейщик из старой сказки: её рассказывали так часто, что во сне он ожил.|Eski ertakdagi nayzador dev: shuncha ko'p aytilganki, tushda jonlanib qolgan.`, `Like in the tale, it always strikes three times. After the third, it's yours.|Как в сказке, бьёт всегда трижды. После третьего — твой.|Ertakdagidek, doim uch marta uradi. Uchinchisidan keyin — seniki.`],
    ['tile_golem', 'dream', `A wall that remembers: tilework that heard so many prayers it got up to answer one.|Стена, которая помнит: изразцы, услышавшие столько молитв, что поднялись ответить на одну.|Eslaydigan devor: shuncha duoni eshitgan koshinlarki, bittasiga javob berish uchun o'rnidan turgan.`, `Slow and armoured. Find the cracked tiles: strikes there go deep.|Медленная и в броне. Ищи треснувшие изразцы — удары туда проходят глубоко.|Sekin va zirhli. Yorilgan koshinlarni top — u yerga zarbalar chuqur kiradi.`],
    ['yd_walker', 'dream', `A walking memory: a whole afternoon of someone's life, got up on two legs and looking for its owner.|Ходячее воспоминание: целый день чьей-то жизни, вставший на ноги и ищущий хозяина.|Yuruvchi xotira: kimningdir hayotidagi butun bir kun, oyoqqa turib egasini qidiryapti.`, `It copies your last move. Change your rhythm: what you did a moment ago is what it does now.|Повторяет твой последний приём. Меняй ритм: что ты делал миг назад, то он делает сейчас.|Oxirgi usulingni takrorlaydi. Ritmni o'zgartir: bir lahza oldin nima qilgan bo'lsang, u hozir shuni qiladi.`],
    ['yd_guest', 'dream', `A drowned wedding guest, still dressed for the feast, still waiting for the bride to come in.|Утопленный свадебный гость: всё ещё в праздничном, всё ещё ждёт, когда войдёт невеста.|Cho'kkan to'y mehmoni: hamon bayram kiyimida, hamon kelin kirishini kutyapti.`, `It is heavy and slow, but it reaches far. Get in close and stay close.|Тяжёлый и медленный, но достаёт далеко. Подойди вплотную и не отходи.|Og'ir va sekin, lekin uzoqqa yetadi. Yaqin bor va uzoqlashma.`],
    ['yd_nightmare', 'dream', `A nightmare spawn: the bad dream of a whole quarter, grown fat in the dark.|Отродье кошмара: дурной сон целого квартала, разжиревший в темноте.|Dahshat zoti: butun bir mahallaning yomon tushi, qorong'ida semirgan.`, `It grows stronger in shadow. Fight it in the light; Sado's glow is enough.|В тени крепнет. Дерись с ним на свету — хватит и сияния Садо.|Soyada kuchayadi. U bilan yorug'da urish — Sadoning nuri ham yetadi.`],
    ['yd_dream_tiger', 'dream', `The tiger from a child's dream: bigger than any real one, striped in the colours of a nursery blanket.|Тигр из детского сна: больше настоящего, полосатый, как детское одеяло.|Bolaning tushidagi yo'lbars: haqiqiysidan katta, bolalar ko'rpasidek yo'l-yo'l.`, `Its leap is a child's idea of a leap: huge and slow. Roll beneath it.|Его прыжок — детское представление о прыжке: огромный и медленный. Перекатись под ним.|Sakrashi — bolaning sakrash haqidagi tasavvuri: ulkan va sekin. Uning ostidan dumalab o't.`],
    ['yd_ember', 'dream', `An ember of the Heart: a spark of the Sleeper's warmth, floating off to see the world.|Уголь Сердца: искра тепла Спящего, улетевшая посмотреть мир.|Yurak cho'g'i: Uxlovchining iliqligidan uchqun, dunyoni ko'rgani uchib ketgan.`, `It bursts when it dies. Hit it and step back at once.|Взрывается, когда умирает. Ударь и сразу отступи.|O'layotganda portlaydi. Ur va darhol chekin.`]
  ];
  CODEX.BEAST = BEAST;
  const BOSSES = [
    ['glutton', `A heap of the Hollow grown together around spilled tumars in the Singers' storehouse. It ate what it could not remember.|Груда Пустых, сросшихся вокруг рассыпанных тумаров в хранилище Певцов. Пожирала то, чего не могла вспомнить.|Xonandalar omboridagi to'kilgan tumarlar atrofida bir-biriga yopishib o'sgan bo'shlar uyumi. Eslay olmaganini yeb qo'yardi.`],
    ['kempir', `Yalmog'iz Kampir of the Tower of Silence: seven heads, seven grudges, and a broom she never puts down.|Ялмагыз Кампир из Башни Молчания: семь голов, семь обид и метла, которую она не выпускает.|Sukunat minorasidagi Yalmog'iz Kampir: yetti bosh, yetti gina va qo'lidan qo'ymaydigan supurgi.`],
    ['hound', `Bahodir, the Gilded Hound, the Divan's champion. He never lost a duel he was paid to win.|Баходир, Позолоченный Пёс, чемпион Дивана. Не проиграл ни одного поединка, за победу в котором ему платили.|Bahodir, Zarhal It, Devon pahlavoni. Yutish uchun pul olgan birorta ham olishuvni yutqazmagan.`],
    ['choir', `The Silent Choir of the Cloister: seven Singers whose song took every voice that heard it, their own first.|Безмолвный Хор Обители: семь Певцов, чья песня забрала каждый голос, что её слышал, и первыми — их собственные.|Ibodatxonaning Sokin xori: yetti xonanda, qo'shig'i uni eshitgan har bir ovozni, avvalo o'zlarinikini olgan.`],
    ['albasty', `Albasty of the karez: an old water fear that the city kept feeding with its drowned.|Албасты кяризов: старый водный страх, которого город продолжал кормить своими утопленниками.|Korezlar Albastisi: shahar o'z cho'kkanlari bilan boqib kelgan eski suv qo'rquvi.`],
    ['barys', `Ak Bars of the Spine: the white leopard that guards the vertebra where the caravans used to pray.|Ак Барс Хребта: белый барс, стерегущий позвонок, где когда-то молились караваны.|Tizmaning Oq Barsi: karvonlar bir paytlar ibodat qilgan umurtqani qo'riqlaydigan oq qoplon.`],
    ['aidahar', `Ajdaho: the dragon of the old tales, risen out of the Sleeper's dream. Its fire burns the past.|Аждахо: дракон старых сказаний, поднявшийся из сна Спящего. Его огонь жжёт прошлое.|Ajdaho: eski dostonlardagi ajdar, Uxlovchining tushidan ko'tarilgan. Uning olovi o'tmishni yoqadi.`],
    ['seven', `The Seven: the founders of Yodgor, who chained the Sleeper with a song, still arguing about the price.|Семеро: основатели Ёдгора, сковавшие Спящего песней, и до сих пор спорящие о цене.|Yettilik: Uxlovchini qo'shiq bilan kishanlagan, hanuz narxi haqida bahslashayotgan Yodgor asoschilari.`],
    ['f_shirin', `Ustoz Shirin, the voice of the Well. She sang to keep the city asleep, and never once sang for herself.|Устоз Ширин, голос Колодца. Пела, чтобы город спал, и ни разу не спела для себя.|Ustoz Shirin, Quduq ovozi. Shahar uxlasin deb kuyladi va bir marta ham o'zi uchun kuylamadi.`],
    ['f_humo', `Humo, the Divan's golden bird: the ledger with wings. Everything she touches turns into a debt.|Хумо, золотая птица Дивана: долговая книга с крыльями. Всё, чего она касается, становится долгом.|Humo, Devonning oltin qushi: qanotli qarz daftari. Tekkan hamma narsasi qarzga aylanadi.`],
    ['f_oydin', `Oydin, She Who Remembers. She keeps every memory she ever took, and wants the whole city to do the same.|Ойдин, Помнящая. Хранит каждое воспоминание, которое когда-либо забрала, и хочет, чтобы так делал весь город.|Oydin, Eslovchi. Olgan har bir xotirasini saqlaydi va butun shahar ham shunday qilishini istaydi.`]
  ];
  CODEX.BOSSES = BOSSES;
  const BEAST_ID = {}; BEAST.forEach(b => { BEAST_ID[b[0]] = b; });
  const BOSS_ID = {}; BOSSES.forEach(b => { BOSS_ID[b[0]] = b; });
  // a copy (EK.clone, 8b) counts as the type it was cloned from when it names one
  const baseOf = d => { if (!d) return null; let id = d.id; if (BEAST_ID[id] || BOSS_ID[id]) return id; if (d.codexAs && (BEAST_ID[d.codexAs] || BOSS_ID[d.codexAs])) return d.codexAs; return null; };
  CODEX.baseOf = baseOf;
  CODEX.known = id => { const c = SG(); return (c.k[id] || 0) >= 3 || !!c.ts[id]; };
  CODEX.met = id => (SG().k[id] || 0) > 0 || !!SG().ts[id];
  let lastKill = null;
  G.Events.on('kill', e => {
    try {
      if (!e || !e.def) return;
      const id = baseOf(e.def); if (!id) return;
      const c = SG(), first = !c.k[id];
      c.k[id] = (c.k[id] || 0) + 1;
      if (BOSS_ID[id]) c.bs[id] = 1;
      lastKill = { id, t: performance.now() };
      if (BEAST_ID[id] && (first || c.k[id] === 3)) {
        toast(c.k[id] === 3 && !c.ts[id] ? tf(`Yodchi's book: the weak spot of "{n}" (L)|Книга ёдчи: слабое место — «{n}» (L)|Yodchi kitobi: «{n}»ning zaif joyi (L)`, { n: nameOf(id) }) : tf(`Yodchi's book: {n} (L)|Книга ёдчи: {n} (L)|Yodchi kitobi: {n} (L)`, { n: nameOf(id) }), '#c9b48a');
      }
      save();
    } catch (x) { console.error('[codex]', x); }
  });
  G.Events.on('bossDefeated', b => { try { const id = baseOf(b && b.def); if (id && BOSS_ID[id]) { SG().bs[id] = 1; save(); } } catch (x) { /* ignore */ } });
  // "Someone else's memory": tasting a fresh corpse opens its weak spot at once
  s6init(() => {
    const d = G.Items.defs.ys_drink; if (!d || d._codex) return;
    const u0 = d.use; d._codex = true;
    d.use = function () {
      try { if (lastKill && performance.now() - lastKill.t < 7000 && BEAST_ID[lastKill.id] && !SG().ts[lastKill.id]) { SG().ts[lastKill.id] = 1; save(); toast(tf(`Yodchi's book: the weak spot of "{n}" (L)|Книга ёдчи: слабое место — «{n}» (L)|Yodchi kitobi: «{n}»ning zaif joyi (L)`, { n: nameOf(lastKill.id) }), '#c9b4ff'); } } catch (x) { /* ignore */ }
      return u0.apply(this, arguments);
    };
  });
  // a weak spot you know: +10% damage against that type (never against bosses: their cap is 8% a hit)
  {
    const mod0 = G.Perks.mod;
    G.Perks.mod = function (name, base, a, b) {
      let v = mod0.apply(this, arguments);
      if (name === 'dmgOut' && b && !b.isBoss && !b.isBossPart && b.def && !b.def.boss) { const id = baseOf(b.def); if (id && BEAST_ID[id] && CODEX.known(id)) v *= 1.1; }
      return v;
    };
  }
  function nameOf(id) { const d = G.Enemies.defs[id]; const n = d && d.name; if (!n) return id; const s = String(n); return s.indexOf('|') >= 0 ? t(s) : (window.__T ? window.__T(s) : s); }
  CODEX.nameOf = nameOf;

  /* ================================================================ Ravshan's lost memories: titles */
  const MEM = {
    m_snow: `First snow|Первый снег|Birinchi qor`, m_hinge: `The singing hinge|Поющая петля|Qo'shiq aytadigan oshiq-moshiq`,
    m_road: `Father home from the Salt Road|Отец вернулся с Соляной дороги|Otam Tuz yo'lidan qaytdi`, m_wax: `The smell of warm wax|Запах тёплого воска|Iliq mum hidi`,
    m_apricot: `Apricots over the wall|Абрикосы через стену|Devor osha o'riklar`, m_alla: `Alla between two mats|«Алла» между двумя подстилками|Ikki to'shak orasida «Alla»`,
    m2_dark: `One blanket over two heads|Одно одеяло на две головы|Ikki boshga bitta ko'rpa`, m2_apricot: `The hot clay wall|Горячая глиняная стена|Issiq loy devor`,
    m2_book: `The debt book on the table|Долговая книга на столе|Stol ustidagi qarz daftari`, m2_dutar: `Father's dutar|Отцовский дутар|Otamning dutori`,
    m2_foal: `"Toychoq! Bread!"|«Тойчок! Хлеб!»|«Toychoq! Non!»`, m2_sale: `The white room|Белая комната|Oq xona`,
    m_bread: `Bread torn in three|Лепёшка на три части|Uchga bo'lingan non`, m_navvot: `A neighbour's wedding|Свадьба у соседей|Qo'shnining to'yi`,
    m_quake: `Under the table|Под столом|Stol ostida`, m_pillow: `The second pillow|Вторая подушка|Ikkinchi yostiq`,
    m_w_tower: `Three turns, one knot|Три оборота, один узел|Uch aylana, bitta tugun`, m_w_mines: `The first round|Первый обход|Birinchi aylanish`,
    m_w_cistern: `The Water Festival|Праздник воды|Suv bayrami`, m_w_withers: `"One day I'll take you"|«Когда-нибудь возьму тебя»|«Bir kun seni olib boraman»`
  };
  CODEX.MEM = MEM;
  // every memory the game defines, in story order, with its lines (LANDS of the acts, and the regions of 85a)
  function memList() {
    const out = [], seen = {};
    const push = m => { if (m && m.id && !seen[m.id]) { seen[m.id] = 1; out.push(m); } };
    for (const k in LANDS) push(LANDS[k].memory);
    try { for (const k in G.WORLD2.regions) push(G.WORLD2.regions[k].memory); } catch (e) { /* ignore */ }
    return out;
  }
  CODEX.memList = memList;

  /* ================================================================ notes and books (texts in 89m_books.js) */
  // CODEX.book({id, region, frac, kind, title, text:[...], cache?:{region, frac, gold, mats, lines}})
  const BK_ART = { diary: '#c9a46a', debt: '#8a5a3a', letter: '#e8dcc0', sermon: '#e8eef8', tale: '#c9b4ff', remember: '#9ad0c8', note: '#d8c8a8' };
  CODEX.KIND = {
    diary: `A yodchi's diary|Дневник ёдчи|Yodchi kundaligi`, debt: `A debt book|Долговая книга|Qarz daftari`, letter: `A letter|Письмо|Maktub`,
    sermon: `A sermon of the Singers|Проповедь Певцов|Xonandalar va'zi`, tale: `A bakhshi's tale|Сказание бахши|Baxshi dostoni`, remember: `A note of Those Who Remember|Записка Помнящих|Eslovchilar xati`, note: `A note|Записка|Xat`
  };
  if (G.ObjArt) {
    G.ObjArt.w2book = (ctx, o) => {
      const x = Math.round(o.x), y = Math.round(o.y), col = BK_ART[o.bk] || '#d8c8a8';
      ctx.fillStyle = '#1a1014'; ctx.fillRect(x - 5, y - 4, 11, 4);
      ctx.fillStyle = col; ctx.fillRect(x - 4, y - 4, 4, 3); ctx.fillRect(x + 1, y - 4, 4, 3);
      ctx.fillStyle = '#3a2418'; ctx.fillRect(x, y - 4, 1, 4);
      if (Math.sin((G.time || 0) * 2.6 + x) > .7) { ctx.fillStyle = '#fff4d0'; ctx.fillRect(x + 3, y - 8, 1, 2); }
    };
    G.ObjArt.w2bookFx = (ctx, o) => { try { G.Glow.add(o.x, o.y - 3, 10, '#ffe7a6', .22 + .15 * Math.sin((G.time || 0) * 2.6 + o.x)); } catch (e) { /* ignore */ } };
    G.ObjArt.w2cache = (ctx, o) => {
      const x = Math.round(o.x), y = Math.round(o.y);
      ctx.fillStyle = '#2a1c14'; ctx.fillRect(x - 6, y - 7, 12, 7); ctx.fillStyle = '#5a3a24'; ctx.fillRect(x - 5, y - 6, 10, 2); ctx.fillStyle = '#c9a046'; ctx.fillRect(x - 1, y - 5, 2, 2);
    };
    G.ObjArt.w2cacheFx = (ctx, o) => { try { G.Glow.add(o.x, o.y - 4, 8, '#ffd77a', .18); } catch (e) { /* ignore */ } };
  }
  const READ = `Read|Прочесть|O'qish`;
  CODEX.read = id => !!SG().b[id];
  CODEX.book = def => {
    CODEX.BOOKS.push(def); CODEX.BOOK[def.id] = def;
    const reg = G.WORLD2 && G.WORLD2.regions && G.WORLD2.regions[def.region];
    if (!reg || !reg.objects) { console.warn('[codex] no region', def.region, def.id); return; }
    const lines = [() => { const c = SG(), first = !c.b[def.id]; c.b[def.id] = 1; save(); if (first) setTimeout(() => toast(tf(`In the yodchi's book: {n} (L)|В книге ёдчи: {n} (L)|Yodchi kitobida: {n} (L)`, { n: t(def.title) }), '#e8d8a8'), 30); return ['', t(CODEX.KIND[def.kind] || CODEX.KIND.note) + ' · ' + t(def.title)]; }]
      .concat(def.text.map(s => ['', s]));
    reg.objects.push({ kind: 'relic', id: 'bk_' + def.id, at: { frac: def.frac }, art: 'w2book', bk: def.kind, prompt: READ, lines });
    // a cache the note points to: it appears only once the note has been read
    if (def.cache) {
      const C = def.cache, creg = G.WORLD2.regions[C.region];
      if (creg && creg.objects) creg.objects.push({ kind: 'relic', id: 'ca_' + def.id, at: { frac: C.frac }, art: 'w2cache', prompt: `Search|Обыскать|Qidirish`, gold: C.gold || 0, when: () => !!SG().b[def.id],
        lines: [() => { try { if (C.mats && G.CRAFT) for (const k in C.mats) G.CRAFT.give(k, C.mats[k]); if (C.item && G.YITEMS) G.YITEMS.add(C.item); if (C.recipe && G.CRAFT) G.CRAFT.learn(C.recipe); } catch (x) { console.error('[codex] cache', x); } return ['', C.line || `Right where the note said. Someone meant to come back for this.|Ровно там, где сказано в записке. Кто-то собирался за этим вернуться.|Xatda aytilgan joyning o'zida. Kimdir buning ortidan qaytmoqchi bo'lgan.`]; }] });
    }
  };
  // a relic is taken once per run (W2.take); a book read in an earlier run is still in the book
  CODEX.readBooks = () => CODEX.BOOKS.filter(b => SG().b[b.id]);

  /* ================================================================ the page [L] */
  const CU = G.CHUI;
  if (CU && CU.EXT) {
    const UI = CU, D0 = () => UI._dbg;
    UI.PAGES.push('book'); UI.PAGE_NAME.book = `Yodchi's book|Книга ёдчи|Yodchi kitobi`; UI.PAGE_KEY.book = 'L'; UI.EXT_KEY.KeyL = 'book';
    const SEC = [`Notes|Записки|Xatlar`, `Memories|Воспоминания|Xotiralar`, `Bestiary|Бестиарий|Maxluqnoma`, `Collected|Собрано|To'plangan`];
    const PS = CODEX.page = { sec: 0, sel: 0, scroll: 0 };
    const COL = { gold: '#e2b452', goldL: '#ffe7a6', dim: '#9a8c9e', cream: '#f2e6c8', bad: '#ff8a7a', good: '#9cf0a0', lav: '#c9b4ff' };
    // the rows of a section: {label, sub, col, body:[strings], head}
    function rows() {
      const c = SG();
      if (PS.sec === 0) {
        const L = CODEX.BOOKS.filter(b => c.b[b.id]);
        return L.map(b => ({ label: t(b.title), sub: t(CODEX.KIND[b.kind] || CODEX.KIND.note), body: b.text.map(s => t(s)), col: BK_ART[b.kind] }));
      }
      if (PS.sec === 1) {
        return memList().map(m => {
          const got = !!(R().mem && R().mem[m.id]);
          return got ? { label: t(MEM[m.id] || `A memory|Воспоминание|Xotira`), body: (m.lines || []).filter(l => Array.isArray(l) && l[0] === 'memory').map(l => t(l[1])), col: '#ffe2a8' }
            : { label: '· · ·', sub: t(`still lost somewhere in the city|ещё потеряно где-то в городе|hali shaharning qayeridadir yo'qolgan`), body: [], col: '#5a4c60' };
        });
      }
      if (PS.sec === 2) {
        const out = [];
        for (const [fid, fname] of FAM) {
          const list = fid === 'boss' ? BOSSES : BEAST.filter(b => b[1] === fid);
          const any = list.some(b => fid === 'boss' ? c.bs[b[0]] : CODEX.met(b[0]));
          out.push({ head: true, label: t(fname).toUpperCase(), sub: fid === 'boss' ? '' : list.filter(b => CODEX.met(b[0])).length + '/' + list.length, dim: !any });
          for (const b of list) {
            const id = b[0];
            if (fid === 'boss') {
              if (!c.bs[id]) { out.push({ label: '· · ·', col: '#5a4c60', body: [] }); continue; }
              out.push({ label: nameOf(id), col: '#ffb070', body: [t(b[1])] });
              continue;
            }
            if (!CODEX.met(id)) { out.push({ label: '· · ·', col: '#5a4c60', body: [] }); continue; }
            const kn = CODEX.known(id), n = c.k[id] || 0;
            out.push({ label: nameOf(id), sub: tf(`killed: {n}|убито: {n}|o'ldirilgan: {n}`, { n }), col: kn ? COL.goldL : COL.cream,
              body: [t(b[2]), kn ? t(`Weak spot: |Слабое место: |Zaif joyi: `) + t(b[3]) : t(`Weak spot: kill three, or taste one.|Слабое место: убей троих или испей одного.|Zaif joyi: uchtasini o'ldir yoki bittasidan tot.`)],
              foot: kn ? t(`You know where to hit: +10% damage against it.|Знаешь, куда бить: +10% урона по нему.|Qayerga urishni bilasan: unga zarar +10%.`) : '' });
          }
        }
        return out;
      }
      // collected
      const out = [];
      const add = (label, have, all, note) => out.push({ label, sub: have + (all ? ' / ' + all : ''), col: all && have >= all ? COL.good : COL.cream, body: note ? [note] : [] });
      add(t(`Notes and books|Записки и книги|Xatlar va kitoblar`), CODEX.BOOKS.filter(b => c.b[b.id]).length, CODEX.BOOKS.length, t(`Diaries, debt books, letters, sermons, tales. Some of them say where something was hidden.|Дневники, долговые книги, письма, проповеди, сказания. Некоторые подсказывают, где что-то спрятано.|Kundaliklar, qarz daftarlari, maktublar, va'zlar, dostonlar. Ba'zilari nima qayerga yashiringanini aytadi.`));
      const ML = memList(); add(t(`Ravshan's lost memories|Потерянные воспоминания Равшана|Ravshanning yo'qolgan xotiralari`), ML.filter(m => R().mem && R().mem[m.id]).length, ML.length);
      add(t(`Bestiary|Бестиарий|Maxluqnoma`), BEAST.filter(b => CODEX.met(b[0])).length, BEAST.length, tf(`Weak spots known: {n}|Известно слабых мест: {n}|Ma'lum zaif joylar: {n}`, { n: BEAST.filter(b => CODEX.known(b[0])).length }));
      add(t(`Bosses|Боссы|Boslar`), BOSSES.filter(b => c.bs[b[0]]).length, BOSSES.length);
      try { if (G.OSHIQ && G.OSHIQ.count) add(t(`Alchiks|Альчики|Oshiqlar`), G.OSHIQ.count(), G.OSHIQ.BONES.length); } catch (e) { /* ignore */ }
      try { const LG = (G.CH && G.CH.S && G.CH.S().legends) || {}; const all = Object.keys((G.YITEMS && G.YITEMS.LEGENDS) || {}).length || 10; add(t(`Legendary weapons|Легендарное оружие|Afsonaviy qurollar`), Object.keys(LG).filter(k => LG[k] && !/_gift$/.test(k)).length, all); } catch (e) { /* ignore */ }
      try { if (G.CRAFT && G.CRAFT.known) { const K = G.CRAFT.known(); add(t(`Recipes|Рецепты|Retseptlar`), K.have, K.all); } } catch (e) { /* ignore */ }
      try {
        const YI = G.YITEMS, SETS = (YI && YI.SETS) || {}, own = {};
        for (const e of (YI.list() || [])) { const d = G.Items.defs[e.id], st = d && d.yd && d.yd.set; if (st) { own[st] = own[st] || {}; own[st][e.id] = 1; } }
        const keys = Object.keys(SETS);
        add(t(`Armour sets|Наборы брони|Sovut to'plamlari`), keys.filter(k => Object.keys(own[k] || {}).length >= (SETS[k].n || 4)).length, keys.length);
      } catch (e) { /* ignore */ }
      return out;
    }
    function pick(L, d) {
      if (!L.length) return;
      let i = PS.sel;
      for (let k = 0; k < L.length; k++) { i = (i + d + L.length) % L.length; if (!L[i].head) break; }
      PS.sel = i; sfx('ui_move');
    }
    UI.EXT.book = {
      help: pad => (pad ? t(`Move · LB/RB section · B back|Выбор · LB/RB — раздел · B — назад|Tanlash · LB/RB — bo'lim · B — orqaga`)
        : t(`Up/down choose · Q/E or left/right section · Tab pages · Esc close|Вверх/вниз — выбор · Q/E или влево/вправо — раздел · Tab — страницы · Esc — закрыть|Yuqori/past — tanlash · Q/E yoki chap/o'ng — bo'lim · Tab — sahifalar · Esc — yopish`)),
      key(c) {
        const L = rows();
        if (c === 'tab-' || c === 'tab+' || c === 'left' || c === 'right') { PS.sec = (PS.sec + (c === 'tab+' || c === 'right' ? 1 : -1) + SEC.length) % SEC.length; PS.sel = 0; PS.scroll = 0; const L2 = rows(); if (L2[0] && L2[0].head) PS.sel = 1; sfx('ui_move'); return; }
        if (c === 'up') pick(L, -1); else if (c === 'down') pick(L, 1);
      },
      draw(ctx, HIT) {
        const { panel, txt, inset, plate, para } = D0();
        SEC.forEach((s, i) => {
          const w = 84, x = 22 + i * (w + 4), on = i === PS.sec;
          plate(ctx, x, 36, w, on ? '#3a2a14' : '#1d1626', on);
          txt(ctx, t(s).toUpperCase(), x + w / 2, 38.6, { size: 5, align: 'center', color: on ? COL.goldL : COL.dim, weight: 700, serif: true });
          HIT.push({ x, y: 34, w, h: 15, click: () => { PS.sec = i; PS.sel = 0; PS.scroll = 0; sfx('ui_move'); } });
        });
        const L = rows();
        panel(ctx, 16, 54, 168, 190, { tone: 'dark' });
        panel(ctx, 192, 54, 272, 190, { tone: 'warm' });
        if (!L.length) {
          txt(ctx, t(PS.sec === 0 ? `Nothing yet. Look closer at what lies on the ground: people leave words behind.|Пока пусто. Присматривайся к тому, что лежит на земле: люди оставляют слова.|Hozircha bo'sh. Yerda yotgan narsalarga razm sol: odamlar so'z qoldirib ketadi.` : `Nothing yet.|Пока пусто.|Hozircha bo'sh.`), 28, 64, { size: 4.4, color: COL.dim, style: 'italic' });
          return;
        }
        if (L[PS.sel] && L[PS.sel].head) PS.sel = Math.min(L.length - 1, PS.sel + 1);
        PS.sel = Math.max(0, Math.min(PS.sel, L.length - 1));
        const vis = 17, RH = 10.6;
        if (PS.sel < PS.scroll) PS.scroll = PS.sel; if (PS.sel >= PS.scroll + vis) PS.scroll = PS.sel - vis + 1;
        L.slice(PS.scroll, PS.scroll + vis).forEach((r, i) => {
          const idx = PS.scroll + i, y = 60 + i * RH, on = idx === PS.sel;
          if (r.head) { txt(ctx, r.label, 24, y + 2, { size: 4.2, color: r.dim ? '#5a4c60' : COL.gold, weight: 700, serif: true }); if (r.sub) txt(ctx, r.sub, 176, y + 2, { size: 3.8, align: 'right', color: COL.dim }); return; }
          if (on) inset(ctx, 21, y - 0.5, 158, RH - 0.8, { fill: 'rgba(90,58,20,0.55)', stroke: COL.goldL });
          txt(ctx, r.label, 26, y + 1.4, { size: 4.6, color: on ? COL.goldL : (r.col || COL.cream), weight: on ? 700 : 500, serif: true });
          if (r.sub && PS.sec === 3) txt(ctx, r.sub, 176, y + 1.6, { size: 4.2, align: 'right', color: r.col || COL.cream, weight: 600 });
          HIT.push({ x: 21, y, w: 158, h: RH - 1, hover: () => { PS.sel = idx; }, click: () => { PS.sel = idx; } });
        });
        if (L.length > vis) txt(ctx, (PS.scroll + 1) + '–' + Math.min(L.length, PS.scroll + vis) + ' / ' + L.length, 176, 236, { size: 3.6, align: 'right', color: COL.dim });
        const r = L[PS.sel];
        if (!r || r.head) return;
        txt(ctx, r.label, 204, 62, { size: 7, color: r.col && r.col !== '#5a4c60' ? COL.goldL : COL.dim, weight: 700, serif: true });
        if (r.sub && PS.sec !== 3) txt(ctx, r.sub, 204, 72.5, { size: 4, color: COL.dim, style: 'italic' });
        let y = 82;
        for (const s of r.body || []) { y += para(ctx, s, 204, y, 248, { size: 4.6, color: COL.cream, lh: 6.1, serif: PS.sec < 2 }) + 4; if (y > 226) break; }
        if (r.foot) txt(ctx, r.foot, 204, Math.min(232, y + 2), { size: 4, color: COL.good });
      }
    };
  }
}
