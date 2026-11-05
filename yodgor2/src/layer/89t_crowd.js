/* 89t_crowd.js — the city's people (the author: "more people per square metre where it makes sense: guards, buyers…").
   Each region gets a crowd by its own logic and by the hour: hawkers at the stalls, buyers walking the rows, Divan guards
   in pairs, porters, children who run, beggars, musicians, Singers collecting, scribes; at night watchmen, smugglers,
   drunks and lamp-lighters. Roles have their own looks (varied per person), behaviour (stand, talk in a group, pace,
   walk, run) and lines: a passer-by says something when you walk close (a bubble over the head), and many can be
   talked to — rumours that point to real things in the world (hunts, notes, caches, minibosses, side stories).
   Purely ambient: no quest state, no Hollowness, nothing about Sado. People avoid fights: they leave when enemies are
   near and come back. */
{
  const W2 = G.WORLD2, U = G.U;
  if (!W2) { console.warn('[crowd] no world'); }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = c => Math.max(0, Math.min(255, Math.round(c * k))); return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); };
  const SKIN = ['#c8946a', '#b98a63', '#a87a54', '#d0a07a', '#b0805a', '#c08a62'];

  /* ================================================================ roles: look, how they move, what they say */
  // look(): a varied look object for people.js; b: behaviour; say: barks (said as you pass); talk: lines when spoken to
  const R0 = (o) => o;
  const ROLE = {
    hawker: R0({ name: `Hawker|Зазывала|Jarchi`, b: 'stand', look: () => ({ body: pick(['man', 'man', 'woman']), robe: pick(['#8a3a2a', '#6a4a2a', '#2a5a6a', '#7a2a4a']), trim: pick(['#e2b452', '#c8a060', '#e8d8a8']), skin: pick(SKIN), head: pick(['turban', 'doppi', 'scarf']), headC: pick(['#e8dcc0', '#1c1a1e', '#c8302a']), beard: pick(['short', 'long', null]), pat: pick(['ikat', 'atlas', 'stripes', 'plain']) }),
      say: [`Pomegranates! Sweet as a first memory!|Гранаты! Сладкие, как первое воспоминание!|Anorlar! Birinchi xotiradek shirin!`, `Silk from beyond the Spine, touch it, it's free to touch!|Шёлк из-за Хребта, трогай, трогать бесплатно!|Tizma ortidan shoyi, ushlab ko'r, ushlash tekin!`, `Copper pots! They'll outlive your grandchildren!|Медные котлы! Переживут твоих внуков!|Mis qozonlar! Nevaralaringdan ham uzoq yashaydi!`, `Yodchi! For you, a price that hurts me.|Ёдчи! Тебе — цена, от которой мне больно.|Yodchi! Senga — o'zimga og'ir botadigan narx.`],
      talk: [`Business is good when people forget what they paid yesterday. So business is very good.|Торговля идёт, когда люди забывают, сколько заплатили вчера. Так что торговля идёт отлично.|Odamlar kecha qancha to'laganini unutsa, savdo yaxshi bo'ladi. Demak, savdo juda yaxshi.`, `The man at the copper stall buys back what the Hollow drop. Don't sell him anything with a name on it.|Тот, что у медного лотка, скупает то, что роняют Пустые. Не продавай ему ничего с именем.|Mis rastasidagi odam bo'shlar tushirganini sotib oladi. Unga ismi bor narsani sotma.`] }),
    shopper: R0({ name: `Shopper|Покупатель|Xaridor`, b: 'walk', look: () => ({ body: pick(['man', 'woman', 'woman', 'old']), robe: pick(['#5a4636', '#4a3a46', '#3a4a5a', '#6a5a3a', '#5a2a3a']), trim: pick(['#8a6a4a', '#a8805a', '#c9b48a']), skin: pick(SKIN), head: pick(['doppi', 'scarf', 'scarf', 'turban']), headC: pick(['#1c1a1e', '#6a4a3a', '#2a3a5a', '#e8dcc0']), pat: pick(['atlas', 'plain', 'patch', 'ikat']), basket: 1 }),
      say: [`Too much. Everything is too much this year.|Дорого. В этом году всё дорого.|Qimmat. Bu yil hamma narsa qimmat.`, `Did I buy the onions? I'm sure I bought the onions.|Я купила лук? Я же точно купила лук.|Piyoz oldimmi? Aniq olgandim-ku.`, `Don't look at the yodchi. Just walk.|Не смотри на ёдчи. Просто иди.|Yodchiga qarama. Shunchaki yur.`, `My son says the Ark pays well now. My son says a lot.|Сын говорит, в Арке теперь хорошо платят. Сын много чего говорит.|O'g'lim aytadi, Arkda endi yaxshi to'lashadi. O'g'lim ko'p narsa aytadi.`] }),
    guard: R0({ name: `Divan guard|Стражник Дивана|Devon soqchisi`, b: 'pace', look: () => ({ body: 'guard', robe: pick(['#6a1a22', '#7a2a1a', '#5a1a2a']), trim: '#c8a040', skin: pick(SKIN), head: 'helmet', headC: pick(['#a89870', '#8a8a90']), beard: pick(['short', null]), spear: 1 }),
      say: [`Move along.|Проходи.|O'tib ket.`, `Keep your hands where I can see them, yodchi.|Руки держи на виду, ёдчи.|Qo'llaring ko'rinib tursin, yodchi.`, `Third shift without bread. The Divan counts tilla, not men.|Третья смена без хлеба. Диван считает тилла, а не людей.|Uchinchi smena nonsiz. Devon odamni emas, tillani sanaydi.`, `Quiet tonight. I hate quiet.|Сегодня тихо. Ненавижу, когда тихо.|Bugun tinch. Tinchlikni yomon ko'raman.`],
      talk: [`Salt idols walk the Rabat at night. The captain says it's wind. The captain stays inside at night.|По ночам в Рабате ходят соляные идолы. Капитан говорит — ветер. Капитан по ночам из дома не выходит.|Kechalari Rabotda tuz butlari yuradi. Sardor shamol deydi. Sardor kechasi uydan chiqmaydi.`, `There's a board in the big chaikhanas. Contracts on beasts. Pays better than standing here.|В больших чайханах висит доска. Контракты на тварей. Платят лучше, чем мне за стояние.|Katta choyxonalarda taxta osig'liq. Maxluqlarga shartnoma. Bu yerda turganimdan yaxshiroq to'lashadi.`] }),
    porter: R0({ name: `Porter|Носильщик|Hammol`, b: 'walk', speed: 0.45, look: () => ({ body: 'man', robe: pick(['#5a4a3a', '#4a3a2a', '#6a5a4a']), trim: '#8a6a4a', skin: pick(SKIN), head: pick(['bare', 'doppi']), hair: '#2a2018', headC: '#1c1a1e', beard: 'short', pat: 'patch', load: 1 }),
      say: [`Mind your back! Mind your back!|Поберегись! Поберегись!|Ehtiyot bo'l! Ehtiyot bo'l!`, `Forty steps to the Ark, forty back, forty years.|Сорок шагов до Арка, сорок обратно, сорок лет.|Arkkacha qirq qadam, qirq qaytish, qirq yil.`] }),
    kid: R0({ name: `Child|Ребёнок|Bola`, b: 'run', look: () => ({ body: pick(['child', 'girl']), robe: pick(['#8a5a3a', '#4a6a8a', '#8a3a4a', '#5a7a3a']), trim: '#c8a878', skin: pick(SKIN), head: pick(['doppi', 'bare', 'scarf']), hair: '#1a1210', headC: pick(['#1c1a1e', '#c8302a', '#e8dcc0']) }),
      say: [`Yodchi, yodchi, take my memory! Haha! I don't have any!|Ёдчи, ёдчи, возьми мою память! Ха-ха! А у меня нет!|Yodchi, yodchi, xotiramni ol! Ha-ha! Menda yo'q!`, `Bet you can't catch me!|Спорим, не догонишь!|Tutolmaysan, garov o'ynaymiz!`, `Mama says don't talk to you.|Мама сказала с тобой не разговаривать.|Oyim sen bilan gaplashma dedi.`],
      talk: [`There's a man with a lamp in the karez who sells shortcuts. He sold me one. It was a door. I can't open it.|В кяризах дядька с лампой продаёт короткие пути. Мне продал один. Это была дверь. Я её не открою.|Korezda chiroqli bir amaki qisqa yo'l sotadi. Menga ham sotdi. U eshik ekan. Ocholmayman.`, `If you climb the towers with the rings on top, there's stuff up there. I saw a bird take a coin up.|Если залезть на башни с кольцами наверху, там лежит всякое. Я видел, как птица унесла туда монету.|Tepasida halqasi bor minoralarga chiqsang, u yerda narsalar bor. Qushning tanga olib chiqqanini ko'rganman.`] }),
    beggar: R0({ name: `Beggar|Нищий|Gado`, b: 'stand', look: () => ({ body: pick(['old', 'man']), robe: pick(['#4e4a44', '#5a5048']), trim: '#6a645a', skin: pick(SKIN), head: pick(['bare', 'scarf']), hair: '#8a8478', headC: '#4a4038', beard: 'long', bent: 1, pat: 'patch' }),
      say: [`A coin, for the memory of my mother. I've still got her. Just.|Монетку — в память о матери. Она у меня ещё есть. Пока.|Bir tanga — onam xotirasi uchun. U hali menda bor. Hozircha.`, `I had a trade once. Ask me which. I don't know either.|Было у меня ремесло. Спроси какое. Я тоже не знаю.|Bir paytlar hunarim bor edi. Qanaqa deb so'ra. Men ham bilmayman.`],
      talk: [`I sleep under the Singers' stair. At night someone carries jars of black wax up the bell tower. Nobody brings them down.|Я сплю под лестницей Певцов. По ночам кто-то носит банки чёрного воска на колокольню. Обратно не носит никто.|Xonandalar zinasi ostida uxlayman. Kechalari kimdir qo'ng'iroqxonaga qora mum xumlarini olib chiqadi. Hech kim qaytarib tushirmaydi.`] }),
    musician: R0({ name: `Musician|Музыкант|Sozanda`, b: 'group', look: () => ({ body: 'man', robe: pick(['#2a4a6a', '#6a2a3a', '#3a5a3a']), trim: '#e2b452', skin: pick(SKIN), head: pick(['doppi', 'turban']), headC: pick(['#1c1a1e', '#e8dcc0']), beard: pick(['short', 'long']), pat: 'ikat', instr: 1 }),
      say: [`*a doira keeps time, a dutar runs ahead of it*|*дойра держит ритм, дутар убегает вперёд*|*doira usul tutib turibdi, dutor oldinga yuguradi*`, `Request, yodchi? We know everything except the Pledge Song.|Заказывай, ёдчи. Знаем всё, кроме Песни Залога.|Buyurtma ber, yodchi. Garov qo'shig'idan boshqa hammasini bilamiz.`, `They pay us not to play near the Cloister. We play near the Cloister.|Нам платят, чтобы мы не играли у Обители. Мы играем у Обители.|Ibodatxona yonida chalmasligimiz uchun pul berishadi. Biz Ibodatxona yonida chalamiz.`] }),
    singer: R0({ name: `Singer of the Well|Певец Колодца|Quduq xonandasi`, b: 'walk', speed: 0.35, look: () => ({ body: pick(['man', 'woman']), robe: '#e8e4dc', trim: '#c9b4ff', skin: pick(SKIN), head: pick(['scarf', 'turban']), headC: '#f2ead8', pat: 'plain' }),
      say: [`The Well remembers so you don't have to.|Колодец помнит, чтобы тебе не пришлось.|Quduq eslaydi, sen eslamasang ham bo'ladi.`, `Your tithe-month is close, sister. Be ready.|Твой месяц десятины близко, сестра. Будь готова.|Ushr oying yaqin, singlim. Tayyor tur.`, `Peace to this house. And to what sleeps under it.|Мир этому дому. И тому, что спит под ним.|Bu uyga tinchlik. Uning ostida uxlayotganga ham.`] }),
    scribe: R0({ name: `Scribe|Писарь|Mirza`, b: 'stand', look: () => ({ body: 'man', robe: pick(['#3a3a5a', '#4a3a2a']), trim: '#c9b48a', skin: pick(SKIN), head: 'turban', headC: '#e8dcc0', beard: 'long', pat: 'plain' }),
      say: [`Letters written, debts counted, names spelled right. Five coins.|Пишу письма, считаю долги, имена без ошибок. Пять монет.|Xat yozaman, qarz sanayman, ismlarni xatosiz. Besh tanga.`, `A yodchi who can read? Rare. Most just count.|Ёдчи, который умеет читать? Редкость. Обычно только считают.|O'qiy oladigan yodchi? Kamyob. Ko'pi faqat sanaydi.`],
      talk: [`People leave notes everywhere in this city: in walls, under steps, in drums. Read them. Half of them say where something is buried.|В этом городе всюду оставляют записки: в стенах, под ступенями, в барабанах. Читай их. Половина говорит, где что-то зарыто.|Bu shaharda hamma joyda xat qoldirishadi: devorlarda, zinalar ostida, nog'oralarda. O'qi. Yarmi nima qayerga ko'milganini aytadi.`] }),
    elder: R0({ name: `Old man|Старик|Chol`, b: 'group', look: () => ({ body: 'old', robe: pick(['#4a5a3a', '#5a4a3a', '#3a4a5a']), trim: '#c9b48a', skin: pick(SKIN), head: 'turban', headC: '#e8e0cc', beard: 'long', beardC: '#d8d0c0' }),
      say: [`In my day the tithe was a song a year. One song.|В моё время десятина была — песня в год. Одна песня.|Bizning zamonda ushr yiliga bitta qo'shiq edi. Bitta.`, `Sit, yodchi. Nobody's going to take your feet.|Садись, ёдчи. Ноги у тебя никто не отнимет.|O'tir, yodchi. Oyog'ingni hech kim olib qo'ymaydi.`, `Rustam's boy. I knew your father. Didn't I?|Рустамов ученик. Я знал твоего отца. Или нет?|Rustamning shogirdi. Otangni tanirdim. Yoki yo'qmi?`],
      talk: [`They play oshiq in every chaikhana. Win enough bones and the Bazaar lets you into the tournament.|В каждой чайхане играют в ошиқ. Выиграешь достаточно косточек — Базар пустит тебя на турнир.|Har choyxonada oshiq o'ynashadi. Yetarlicha suyak yutsang, Bozor seni turnirga qo'yadi.`] }),
    woman: R0({ name: `Woman at the well|Женщина у колодца|Quduq boshidagi ayol`, b: 'group', look: () => ({ body: 'woman', robe: pick(['#4a3a46', '#5a2a3a', '#3a4a5a', '#6a4a2a']), trim: pick(['#7a5a6a', '#a8805a']), skin: pick(SKIN), head: 'scarf', headC: pick(['#6a4a3a', '#2a3a5a', '#8a2a2a', '#e8dcc0']), pat: pick(['atlas', 'ikat']), outer: '#3a2c30' }),
      say: [`The water came late again. Surayyo says the sluice. Surayyo always says the sluice.|Вода опять пришла поздно. Сурайё говорит — шлюз. Сурайё всегда говорит — шлюз.|Suv yana kech keldi. Surayyo shlyuz deydi. Surayyo doim shlyuz deydi.`, `Did you hear about the dyer's boy? No? Good. Neither did he.|Слыхала про сына красильщика? Нет? Вот и он не слыхал.|Bo'yoqchining o'g'lini eshitdingmi? Yo'qmi? U ham eshitmagan.`, `Yodchi on our street. Hide the good bowls.|Ёдчи на нашей улице. Прячь хорошие чашки.|Ko'chamizda yodchi. Yaxshi kosalarni yashir.`] }),
    watchman: R0({ name: `Night watchman|Ночной сторож|Tungi qorovul`, b: 'pace', night: true, look: () => ({ body: 'man', robe: '#3a3430', trim: '#6a5a4a', skin: pick(SKIN), head: 'doppi', headC: '#1c1a1e', beard: 'long', lamp: 1 }),
      say: [`Midnight and all's quiet! Mostly!|Полночь, всё спокойно! Почти!|Yarim tun, hammasi tinch! Deyarli!`, `Go home, yodchi. Nothing good is awake now.|Иди домой, ёдчи. Сейчас не спит ничего хорошего.|Uyingga bor, yodchi. Hozir yaxshi narsa uyg'oq emas.`] }),
    smuggler: R0({ name: `Smuggler|Контрабандист|Kontrabandachi`, b: 'group', night: true, look: () => ({ body: 'rebel', robe: '#22202a', trim: '#4a4656', skin: pick(SKIN), head: 'hood', headC: pick(['#2a2030', '#1a1a22']), mask: Math.random() < .5 ? '#3a3440' : null }),
      say: [`Not here. Not now. Not you.|Не здесь. Не сейчас. Не ты.|Bu yerda emas. Hozir emas. Sen emas.`, `If the Divan asks, we're cousins.|Если Диван спросит — мы двоюродные.|Devon so'rasa, biz amakivachchamiz.`],
      talk: [`The drain under the auction hall goes down to the karez. The bar's on the inside. Someone has to go round.|Сток под аукционным залом ведёт в кяризы. Засов изнутри. Кому-то придётся обойти.|Kim oshdi zali ostidagi ariq korezga tushadi. Zulfin ichkarida. Kimdir aylanib o'tishi kerak.`] }),
    drunk: R0({ name: `Drunk|Пьяный|Mast`, b: 'stand', night: true, look: () => ({ body: 'man', robe: pick(['#5a3a2a', '#3a3a4a']), trim: '#8a6a4a', skin: '#c88a6a', head: 'doppi', headC: '#1c1a1e', beard: 'short', bent: 1 }),
      say: [`I sold my wedding for this wine! ...Was it good? The wedding?|Я продал свадьбу за это вино! ...А хорошая была? Свадьба?|Shu sharob uchun to'yimni sotdim! ...Yaxshimidi? To'y?`, `Yodchi! Take the headache! Take it! It's yours!|Ёдчи! Забери похмелье! Забери! Дарю!|Yodchi! Bosh og'rig'imni ol! Ol! Senga sovg'a!`] }),
    clerk: R0({ name: `Divan clerk|Писарь Дивана|Devon mirzasi`, b: 'walk', speed: 0.5, look: () => ({ body: 'man', robe: pick(['#8a1e2a', '#6a2a3a']), trim: '#e8b850', skin: pick(SKIN), head: 'turban', headC: '#f2ead8', beard: pick(['short', null]), pat: 'brocade' }),
      say: [`Seventeen debts, nine payments, one headache.|Семнадцать долгов, девять платежей, одна головная боль.|O'n yetti qarz, to'qqiz to'lov, bitta bosh og'rig'i.`, `Make way, the ledger is late.|Дорогу, книга опаздывает.|Yo'l bering, daftar kechikyapti.`] }),
    noble: R0({ name: `Noble|Знатный|Zodagon`, b: 'walk', speed: 0.3, look: () => ({ body: 'noble', robe: pick(['#7a1424', '#2a3a6a', '#5a2a6a']), trim: '#f0c040', skin: pick(SKIN), head: 'turban', headC: pick(['#fff4dc', '#e8d8a8']), beard: 'long' }),
      say: [`One cannot get a decent memory at the Bazaar anymore. Everything's second-hand.|Приличного воспоминания на Базаре уже не достать. Всё с чужого плеча.|Bozordan endi durustroq xotira topib bo'lmaydi. Hammasi birovniki.`, `Is that a yodchi? In the gardens? Who let it in?|Это ёдчи? В садах? Кто его пустил?|Bu yodchimi? Bog'da? Kim kiritdi?`] }),
    servant: R0({ name: `Servant|Слуга|Xizmatkor`, b: 'walk', speed: 0.6, look: () => ({ body: pick(['man', 'woman']), robe: '#5a4a3a', trim: '#a8905a', skin: pick(SKIN), head: pick(['doppi', 'scarf']), headC: '#3a2a1a', load: Math.random() < .5 ? 1 : 0 }),
      say: [`Sorry. Sorry. Sorry.|Простите. Простите. Простите.|Kechirasiz. Kechirasiz. Kechirasiz.`, `If the master asks, you didn't see me.|Если хозяин спросит — ты меня не видел.|Xo'jayin so'rasa, meni ko'rmagansan.`],
      talk: [`The archive's back door is barred from inside. The clerks use it to slip out to the Bazaar. Nobody's supposed to know.|Задняя дверь архива заперта изнутри. Писари через неё бегают на Базар. Никто не должен знать.|Arxivning orqa eshigi ichkaridan zulfinlangan. Mirzalar u orqali Bozorga qochib turishadi. Hech kim bilmasligi kerak.`] }),
    petitioner: R0({ name: `Petitioner|Проситель|Arzchi`, b: 'group', look: () => ({ body: pick(['man', 'woman', 'old']), robe: pick(['#5a4636', '#4a3a46', '#4e4a44']), trim: '#8a6a4a', skin: pick(SKIN), head: pick(['doppi', 'scarf', 'bare']), headC: '#1c1a1e', hair: '#3a3634', pat: 'patch' }),
      say: [`Third day in this line. My debt grows while I wait to pay it.|Третий день в очереди. Пока жду, чтобы заплатить, долг растёт.|Uchinchi kun navbatdaman. To'lashni kutayotganimda qarz o'syapti.`, `They say the Divan forgives debts on the new moon. They say a lot.|Говорят, Диван прощает долги в новолуние. Много чего говорят.|Devon yangi oyda qarzlarni kechiradi deyishadi. Ko'p narsa deyishadi.`] }),
    gardener: R0({ name: `Gardener|Садовник|Bog'bon`, b: 'stand', look: () => ({ body: pick(['man', 'old']), robe: '#4a5a3a', trim: '#8aa860', skin: pick(SKIN), head: 'doppi', headC: '#3a5a2a', beard: 'short' }),
      say: [`Roses don't care whose garden it is.|Розам всё равно, чей это сад.|Atirgullarga bog' kimniki ekani farqi yo'q.`, `Water the roots, not the flowers. Same with people.|Поливай корни, а не цветы. С людьми так же.|Gulni emas, ildizni sug'or. Odamlar bilan ham shunday.`] }),
    potter: R0({ name: `Potter|Гончар|Kulol`, b: 'stand', look: () => ({ body: 'man', robe: pick(['#8a5434', '#6a4428', '#7a5a3a']), trim: '#c8875a', skin: pick(SKIN), head: pick(['doppi', 'bare']), headC: '#3a2a1a', hair: '#2a1810', beard: 'short', pat: 'patch' }),
      say: [`Mind the kiln, it bites.|Осторожно с печью, кусается.|Xumdondan ehtiyot bo'l, tishlaydi.`, `Clay remembers the hand. That's why we don't sell to the Singers.|Глина помнит руку. Потому мы и не продаём Певцам.|Loy qo'lni eslaydi. Shuning uchun Xonandalarga sotmaymiz.`],
      talk: [`Ma'ruf at the big forge has a wax table at the back. Bring wax, thread and a stone, he'll let you sew a tumar.|У Маъруфа в большой кузнице сзади восковой стол. Принеси воск, нить и камень — даст сшить тумар.|Ma'rufning katta temirxonasi orqasida mum stoli bor. Mum, ip va tosh olib kel — tumar tikishga ruxsat beradi.`] }),
    pilgrim: R0({ name: `Pilgrim|Паломник|Ziyoratchi`, b: 'walk', speed: 0.35, look: () => ({ body: pick(['man', 'old', 'woman']), robe: pick(['#c8b890', '#a89878', '#e8dcc0']), trim: '#8a7a5a', skin: pick(SKIN), head: pick(['turban', 'scarf']), headC: '#f2ead8', beard: pick(['long', null]), staff: 1 }),
      say: [`Forty days on the road to forget one thing. Thirty-nine to go.|Сорок дней в пути, чтобы забыть одно. Осталось тридцать девять.|Bitta narsani unutish uchun qirq kun yo'l. Yana o'ttiz to'qqiz qoldi.`, `Is this the Cloister? It's smaller than the song.|Это Обитель? Она меньше, чем в песне.|Ibodatxona shumi? Qo'shiqdagidan kichikroq ekan.`] }),
    caravaneer: R0({ name: `Caravaneer|Караванщик|Karvonchi`, b: 'group', look: () => ({ body: 'man', robe: pick(['#6a4a2a', '#5a3a1a']), trim: '#c08a3a', skin: '#b8865c', head: 'turban', headC: pick(['#e8dcc0', '#c8302a']), beard: 'long', sash: '#2f8f96' }),
      say: [`Salt in, silk out, nobody asks what's in the third bundle.|Соль сюда, шёлк отсюда, а что в третьем тюке — никто не спрашивает.|Tuz kiradi, shoyi chiqadi, uchinchi bog'lamda nima borligini hech kim so'ramaydi.`, `The fog on the flats took two men last month. They walked off smiling.|Туман на солончаках прошлой луной забрал двоих. Ушли улыбаясь.|O'tgan oy sho'rxokdagi tuman ikki kishini olib ketdi. Jilmayib ketishdi.`] }),
    hollowf: R0({ name: `A Hollow|Пустой|Bo'sh`, b: 'stand', look: () => ({ body: 'man', robe: '#4e4a44', trim: '#6a645a', skin: pick(SKIN), head: 'bare', hair: '#3a3634', hollow: 1, pat: 'patch' }),
      say: [`...bread... second row... always the second row...|...хлеб... второй ряд... всегда второй ряд...|...non... ikkinchi qator... doim ikkinchi qator...`, `...was I going somewhere?|...я куда-то шёл?|...qayergadir ketayotgandimmi?`] }),
    lamplighter: R0({ name: `Lamp-lighter|Фонарщик|Chiroqchi`, b: 'walk', night: true, speed: 0.4, look: () => ({ body: 'old', robe: '#3a3a4a', trim: '#c8a060', skin: pick(SKIN), head: 'doppi', headC: '#1c1a1e', beard: 'long', lamp: 1 }),
      say: [`One lamp, then the next. The dark is patient, so am I.|Один фонарь, потом следующий. Темнота терпелива, и я тоже.|Bitta chiroq, keyin keyingisi. Qorong'i sabrli, men ham.`] })
  };
  for (const k in ROLE) CAST['crowd_' + k] = { name: ROLE[k].name, portrait: null };

  /* ================================================================ who stands where, by region and hour */
  // [role, count, from, to (fractions of the region), when: 'day'|'night'|'all']
  const SPEC = {
    bazaar: [['hawker', 9, .1, .9, 'day'], ['shopper', 12, .05, .95, 'day'], ['guard', 5, .05, .97, 'all'], ['porter', 4, .1, .9, 'day'], ['kid', 4, .2, .8, 'day'], ['beggar', 3, .25, .75, 'all'], ['musician', 3, .28, .34, 'day'],
      ['scribe', 2, .45, .55, 'day'], ['singer', 2, .7, .8, 'day'], ['elder', 3, .55, .6, 'day'], ['smuggler', 3, .6, .7, 'night'], ['drunk', 2, .3, .5, 'night'], ['watchman', 2, .1, .9, 'night'], ['lamplighter', 1, .05, .95, 'night'], ['shopper', 4, .3, .7, 'night'], ['musician', 2, .55, .58, 'night']],
    tail: [['woman', 5, .52, .58, 'day'], ['elder', 4, .2, .25, 'all'], ['kid', 6, .1, .9, 'day'], ['shopper', 6, .05, .95, 'day'], ['porter', 3, .1, .9, 'day'], ['beggar', 2, .3, .7, 'all'], ['singer', 2, .4, .7, 'day'], ['guard', 2, .9, .97, 'all'],
      ['hollowf', 3, .1, .9, 'all'], ['musician', 2, .78, .82, 'night'], ['watchman', 2, .1, .9, 'night'], ['lamplighter', 1, .05, .95, 'night'], ['drunk', 2, .6, .8, 'night'], ['smuggler', 2, .82, .9, 'night']],
    ark: [['guard', 12, .02, .98, 'all'], ['clerk', 6, .1, .9, 'day'], ['noble', 5, .2, .8, 'day'], ['servant', 6, .1, .9, 'all'], ['gardener', 4, .2, .3, 'day'], ['petitioner', 6, .46, .54, 'day'], ['scribe', 2, .7, .75, 'day'], ['musician', 3, .25, .3, 'night'], ['watchman', 2, .1, .9, 'night']],
    potters: [['potter', 6, .1, .9, 'day'], ['shopper', 4, .1, .9, 'day'], ['kid', 3, .2, .8, 'day'], ['porter', 3, .1, .9, 'day'], ['elder', 2, .6, .65, 'all'], ['watchman', 1, .1, .9, 'night'], ['hollowf', 2, .2, .8, 'night']],
    cloister: [['singer', 7, .1, .9, 'all'], ['pilgrim', 6, .05, .95, 'day'], ['petitioner', 3, .45, .5, 'day'], ['guard', 2, .02, .1, 'all'], ['beggar', 2, .05, .2, 'all']],
    rabat: [['caravaneer', 6, .3, .4, 'all'], ['hawker', 3, .4, .5, 'day'], ['porter', 4, .2, .7, 'day'], ['guard', 2, .1, .9, 'all'], ['pilgrim', 2, .05, .95, 'day'], ['watchman', 1, .2, .6, 'night']],
    tower: [['pilgrim', 2, .1, .5, 'day'], ['hollowf', 3, .2, .9, 'all']],
    mines: [['porter', 4, .1, .9, 'all'], ['guard', 2, .1, .9, 'all'], ['hollowf', 2, .2, .8, 'all']],
    withers: [['caravaneer', 4, .4, .55, 'all'], ['hawker', 2, .45, .55, 'day'], ['pilgrim', 2, .1, .9, 'day']],
    spine: [['pilgrim', 4, .05, .95, 'day']],
    streets: [['hollowf', 4, .1, .9, 'all'], ['smuggler', 2, .4, .6, 'all']],
    karez: [['smuggler', 3, .2, .8, 'all'], ['porter', 2, .1, .9, 'all']],
    old: [['smuggler', 2, .3, .7, 'all'], ['pilgrim', 1, .2, .8, 'all']]
  };
  G.CROWD = { ROLE, SPEC, live: [] };
  const isNight = () => (W2.isNight ? W2.isNight() : false);

  /* ================================================================ placing people on the ground */
  function runs(L) {
    const H = W2.H;
    try { return H.runs(L, 6, 3).filter(r => (!L.isOpen || (H.isGround(L, r.x0, r.ty) && H.isGround(L, r.x1, r.ty))) && !H.inStruct(L, r.x0 + 1, r.ty)); } catch (e) { return []; }
  }
  function nearestRun(R, L, frac) {
    const want = L.w * frac; let best = null, bd = 1e9;
    for (const r of R) { const d = want < r.x0 ? r.x0 - want : want > r.x1 ? want - r.x1 : 0; if (d < bd) { bd = d; best = r; } }
    return best;
  }
  let enterT = 0;
  W2.onEnter('*', (def, info) => {
    G.CROWD.live.length = 0;
    const spec = SPEC[def.id]; const L = info && info.level;
    if (!spec || !L || !L.pw) return;
    const TS = G.TS, R = runs(L);
    if (!R.length) return;
    const night = isNight();
    for (const [rid, n0, a, b, when] of spec) {
      if (when === 'day' && night) continue;
      if (when === 'night' && !night) continue;
      const role = ROLE[rid]; if (!role) continue;
      const n = Math.max(1, Math.round(n0 * (night && when === 'all' ? .5 : 1)));
      // a group stands together; the rest spread over the span
      const gfrac = rnd(a, b);
      for (let i = 0; i < n; i++) {
        const frac = role.b === 'group' ? gfrac + (i - n / 2) * 0.004 : a + (b - a) * (i + rnd(.15, .85)) / n;
        const r = nearestRun(R, L, frac); if (!r) continue;
        let tx = Math.round(L.w * frac); tx = Math.max(r.x0 + 1, Math.min(r.x1 - 1, tx));
        // four looks per role, shared: varied enough to read as a crowd, few enough for the frame cache
        const pool = role._pool || (role._pool = [0, 1, 2, 3].map(() => role.look()));
        const look = pool[Math.floor(Math.random() * pool.length)];
        const o = new G.Interactable(tx * TS + 8, r.y, { art: 'person', w: 14, h: 30, look, phase: Math.floor(Math.random() * 999), face: Math.random() < .5 ? -1 : 1, prompt: role.talk ? tf(`Talk: {n}|Поговорить: {n}|Gaplashish: {n}`, { n: t(role.name) }) : '' });
        o.interact = !!role.talk; o.layer = -1; o._crowd = rid;
        o._run = { x0: (r.x0 + 1) * TS, x1: r.x1 * TS }; o._home = o.x; o._vx = 0;
        o._spd = (role.speed || 0.4) * rnd(.8, 1.25);
        if (role.b === 'group' || role.b === 'stand') o.talking = role.b === 'group';
        if (look.lamp) o.lamp = true;
        if (role.talk) o.onUse = () => { if (busy) return true; const line = pick(role.talk); scene(done => play([['crowd_' + rid, line]], done)); return true; };
        G.world.add(o);
        G.CROWD.live.push(o);
      }
    }
    enterT = 0;
  });

  /* ================================================================ moving and talking */
  const bubbles = [];
  let tk = 0;
  W2.ticks.push(() => {
    if (!G.world || !G.CROWD.live.length) return;
    tk++;
    const p = G.world.player; if (!p) return;
    // fights clear the street
    let danger = false;
    if (tk % 20 === 0) for (const e of G.world.enemies) if (!e.dead && e.aggro && Math.abs(e.x - p.x) < 260) { danger = true; break; }
    for (const o of G.CROWD.live) {
      if (o.dead) continue;
      const role = ROLE[o._crowd];
      if (tk % 20 === 0) o._fear = danger && Math.abs(o.x - p.x) < 300 ? 90 : Math.max(0, (o._fear || 0) - 20);
      const b = o._fear > 0 ? 'flee' : role.b;
      if (b === 'walk' || b === 'pace' || b === 'run' || b === 'flee') {
        const sp = b === 'run' ? o._spd * 2.6 : b === 'flee' ? 1.6 : b === 'pace' ? o._spd * 0.6 : o._spd;
        if (!o._dir) o._dir = Math.random() < .5 ? -1 : 1;
        if (b === 'flee') o._dir = Math.sign(o.x - p.x) || 1;
        // pacing guards keep near their post; walkers use the whole street
        const lo = b === 'pace' ? Math.max(o._run.x0, o._home - 80) : o._run.x0, hi = b === 'pace' ? Math.min(o._run.x1, o._home + 80) : o._run.x1;
        if (o._wait > 0) { o._wait--; continue; }
        o.x += o._dir * sp;
        if (o.x <= lo) { o.x = lo; o._dir = 1; o._wait = b === 'flee' ? 0 : 30 + Math.random() * 90; }
        if (o.x >= hi) { o.x = hi; o._dir = -1; o._wait = b === 'flee' ? 0 : 30 + Math.random() * 90; }
        if (b !== 'flee' && Math.random() < 0.002) o._wait = 40 + Math.random() * 120;
        o.face = o._dir;
        o.phase = (o.phase || 0) + (Math.floor(tk / 8) % 2 ? 1 : 0);
      } else if (tk % 240 === 0 && Math.random() < .3) o.face = -(o.face || 1);
      // a line as you pass (not too often, not all at once)
      if (role.say && !o._sayCD && Math.abs(o.x - p.x) < 46 && Math.abs(o.y - p.y) < 40 && quiet() && bubbles.length < 2 && Math.random() < 0.03) {
        bubbles.push({ o, text: pick(role.say), t: 0 }); o._sayCD = 900 + Math.floor(Math.random() * 600);
      }
      if (o._sayCD) o._sayCD--;
    }
    for (let i = bubbles.length - 1; i >= 0; i--) if (++bubbles[i].t > 200 || bubbles[i].o.dead) bubbles.splice(i, 1);
  });
  // the bubbles: drawn over the world in screen space
  const cam = () => G.cam || { rx: 0, ry: 0 };
  SMOOTH_DRAW.push((ctx, st) => {
    if (st !== 'play' || !bubbles.length || (G.UI.isOpen && G.UI.isOpen())) return;
    const c = cam(), cx = c.rx != null ? c.rx : c.x, cy = c.ry != null ? c.ry : c.y;
    for (const b of bubbles) {
      const a = Math.min(1, b.t / 10, (200 - b.t) / 20);
      const x = b.o.x - cx, y = b.o.y - cy - 60;
      if (x < -60 || x > G.W + 60) continue;
      ctx.save(); ctx.globalAlpha = a;
      ctx.font = '500 5.4px ' + (G.FONT_UI || 'sans-serif');
      const words = t(b.text).split(' '), L = []; let line = '';
      for (const w of words) { const tr = line ? line + ' ' + w : w; if (ctx.measureText(tr).width > 120 && line) { L.push(line); line = w; } else line = tr; }
      L.push(line);
      const w = Math.max(...L.map(l => ctx.measureText(l).width)) + 8, h = L.length * 7 + 5;
      const bx = Math.round(Math.max(4, Math.min(G.W - w - 4, x - w / 2))), by = Math.round(y - h);
      ctx.fillStyle = 'rgba(12,8,16,.82)'; ctx.fillRect(bx, by, w, h);
      ctx.strokeStyle = 'rgba(226,180,82,.5)'; ctx.lineWidth = .5; ctx.strokeRect(bx + .25, by + .25, w - .5, h - .5);
      ctx.beginPath(); ctx.moveTo(x - 2, by + h); ctx.lineTo(x + 2, by + h); ctx.lineTo(x, by + h + 3); ctx.closePath(); ctx.fillStyle = 'rgba(12,8,16,.82)'; ctx.fill();
      ctx.fillStyle = '#f2e6c8'; ctx.textBaseline = 'top'; ctx.textAlign = 'left';
      L.forEach((l, i) => ctx.fillText(l, bx + 4, by + 3 + i * 7));
      ctx.restore();
    }
  });
}
