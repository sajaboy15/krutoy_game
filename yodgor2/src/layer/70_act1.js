/* =====================================================================
   Yodgor v2 — Prologue and Act I (plan entries 0–12).
   Also here: the intro, About and credits, generic Sado barks (combat,
   low health, after a death, idle, Hollowness 50/75, flasks, enemy
   kinds) and the pool of death lines.
   Everything is inside one block so names stay private to this file.
   Dialogue follows design/STYLE.md v3: each language written from the
   meaning; no moral or intent tags on choices (an option is a line the
   hero says or a plain action); hub questions start with an em dash.
   ===================================================================== */
{
/* ---------- small helpers ---------- */
const NUMB = `You can't remember why this mattered.|Уже не вспомнить, почему это было важно.|Bu nega muhim bo'lganini endi eslolmaysan.`;
const numb = () => (R().void >= 50 ? NUMB : null);
const TASTE_WHY = `a tasted memory|испитое воспоминание|totilgan xotira`;
const CRUEL = `something in you went cold|что-то в тебе остыло|ichingda nimadir sovidi`;
const OWN_WHY = `a memory of your own|своё же воспоминание|o'zingning xotirang`;
const LEAVE = `"That's all for now."|«Ладно, пока всё.»|«Mayli, hozircha shu.»`;
const shake = k => { try { if (G.shake) G.shake(k); } catch (e) { /* ignore */ } };
const taste = (n, why) => { R().tastes = (R().tastes || 0) + 1; save(); addVoid(n, why || TASTE_WHY); };
const setF = (k, v) => { F()[k] = v; save(); };
const sadoIf = (cond, text) => () => (cond() ? ['sado', text] : null);
const player = () => (G.world && G.world.player) || null;
function healFull() {
  const pl = player();
  try { if (pl && pl.heal) pl.heal(pl.maxHp); } catch (e) { /* ignore */ }
  sfx('heal');
}
function strengthUp() {
  if (!G.run) return;
  G.run.stats = G.run.stats || { red: 0, purple: 0, green: 0 };
  G.run.stats.red = (G.run.stats.red || 0) + 1;
  const pl = player();
  try { if (pl && pl.syncStats) pl.syncStats(false); } catch (e) { /* ignore */ }
  sfx('scroll');
}

/* =====================================================================
   Intro, About, credits
   ===================================================================== */
const INTRO_FIRST = [
  { text: `Yodgor is a city on the back of a sleeping spirit the size of a mountain range. Warm salt water seeps from the cracks in his skin.|Ёдгор стоит на спине спящего духа, огромного, как горный хребет. Из трещин в его коже сочится тёплая солёная вода.|Yodgor — uxlab yotgan ulkan ruhning orqasidagi shahar. Ruh tog' tizmasidek katta. Terisining yoriqlaridan iliq, sho'r suv sizib turadi.` },
  { text: `To keep him asleep, every adult pays the Singers a tithe once a year: one strong memory, sung out of the head into a triangular amulet, a tumar.|Чтобы он не проснулся, раз в год каждый взрослый отдаёт Певцам десятину — одно сильное воспоминание. Его выпевают из головы в треугольный амулет, тумар.|Uyg'onib ketmasin deb, har yili har bir katta odam Xonandalarga ushr beradi — bitta kuchli xotira. Xonandalar uni boshdan kuylab olib, uchburchak tumarga soladi.` },
  { text: `The rich pay with memories they buy. The poor sell their own, until nothing is left but a body that works. The city calls them Hollow.|Богатые платят купленной памятью. Бедные продают свою, пока от человека не останется только тело, которое работает. Таких в городе зовут Пустыми.|Boylar sotib olingan xotira bilan to'laydi. Kambag'al o'zinikini sotadi, sota-sota odamdan faqat ishlaydigan tana qoladi. Shahar ularni Bo'shlar deydi.` },
  { text: `You are Ravshan, a yodchi: you collect the tithe. Twenty years of other people's lives in your satchel. You're good at it. You try not to think.|Ты — Равшан, ёдчи, сборщик десятины. Двадцать лет носишь в сумке чужие жизни. Дело своё знаешь. Стараешься не думать.|Sen — Ravshan, yodchisan, ya'ni ushr yig'asan. Yigirma yildirki, xaltangda o'zgalarning umrini ko'tarib yurasan. Ishingni bilasan. Ko'p o'ylamaslikka harakat qilasan.` },
  { text: `At twelve you sold the most precious thing you had to pay your family's debt. You don't know what it was. That's how selling works.|В двенадцать лет ты продал самое дорогое, что у тебя было, чтобы закрыть долг семьи. Что именно — не знаешь. Так продажа и устроена.|O'n ikki yoshingda oila qarzini uzish uchun eng qimmatli narsangni sotgansan. Nima ekanini bilmaysan. Sotish degani shu.` },
  { speaker: `Rustam-aka|Рустам-ака|Rustam aka`, portrait: 'aksakal', text: `Last round tonight, Ravshan. Take the Tail, I've business at the vault. Count twice, write once, and don't look them in the eye.|Сегодня последний обход, Равшан. Хвост на тебе, у меня дела в хранилище. Считай дважды, пиши один раз. И в глаза им не смотри.|Bugun oxirgi aylanish, Ravshan. Dum senga, mening xazinada ishim bor. Ikki marta sana, bir marta yoz. Ko'zlariga qarama.` }
];
const INTRO_AGAIN = n => [
  { text: `The Sleeper dreams this night again. He knows it by heart, like everything he was ever fed.|Спящему снова снится эта ночь. Он знает её наизусть, как всё, чем его кормили.|Uxlovchi bu kechani yana tushida ko'ryapti. Unga yedirilgan hamma narsa kabi, bu kechani ham yoddan biladi.` },
  n > 0 ? { text: `Endings seen: {n} of 5. In his dream nothing ends for good.|Финалов пройдено: {n} из 5. В его сне ничто не кончается насовсем.|Ko'rilgan yakunlar: 5 tadan {n} ta. Uning tushida hech narsa butkul tugamaydi.`, n } : null,
  { text: `The Night of Payment. A lamp in every window of the Tail. Rustam-aka's satchel, heavy with other people's lives.|Ночь Уплаты. В каждом окне Хвоста горит лампа. Сумка Рустама-ака тяжела от чужих жизней.|To'lov kechasi. Dumning har bir derazasida chiroq yonib turibdi. Rustam akaning xaltasi o'zgalar umridan og'ir.` },
  { text: `Somewhere under your ribs, something that isn't a voice yet turns over in its sleep.|Где-то под рёбрами ворочается во сне то, что ещё не стало голосом.|Qovurg'alaring ostida hali ovozga aylanmagan nimadir uyqusida to'lg'anadi.` },
  { speaker: `Rustam-aka|Рустам-ака|Rustam aka`, portrait: 'aksakal', text: `Last round tonight, Ravshan. Take the Tail. ...Why do you look at me like you've seen this night before? Count twice. Write once.|Сегодня последний обход, Равшан. Хвост на тебе. …Что ты так смотришь, будто эту ночь уже видел? Считай дважды. Пиши один раз.|Bugun oxirgi aylanish, Ravshan. Dum senga. ...Nega bu kechani avval ko'rgandek qarayapsan? Ikki marta sana. Bir marta yoz.` }
].filter(Boolean);
function introPages() {
  const n = Object.keys(saga.endings || {}).length;
  const src = n > 0 || saga.runs > 1 ? INTRO_AGAIN(n) : INTRO_FIRST;
  return src.map(p => {
    const o = { text: p.n != null ? tf(p.text, { n: p.n }) : t(p.text) };
    if (p.speaker) { o.speaker = t(p.speaker); o.portrait = p.portrait; }
    return o;
  });
}
const ABOUT = [
  `Yodgor means "keepsake". It's a city built on the back of a sleeping water spirit, and it pays him in memories.|«Ёдгор» значит «память» — то, что оставляют на память. Это город на спине спящего духа воды, и платит он ему воспоминаниями.|«Yodgor» — esdalik degani. Bu uxlab yotgan suv ruhining orqasiga qurilgan shahar. U ruhga xotira bilan haq to'laydi.`,
  `You are a tithe collector with a song set on you. Find the founders' seven stolen tumars before the new moon, or it will sing you empty.|Ты — сборщик десятины, на которого наложили песню. Найди семь украденных тумаров основателей до новолуния, иначе песня выпоет тебя до дна.|Sen ushr yig'uvchisan, senga qo'shiq solib qo'yishgan. Yangi oygacha asoschilarning o'g'irlangan yettita tumarini top, bo'lmasa qo'shiq seni butunlay bo'shatadi.`,
  `Your choices change the city, its people and the voice in your head. Five endings, one of them hidden. None of them is free.|От твоих решений меняются город, его люди и голос у тебя в голове. Пять финалов, один спрятан. Ни один не достаётся даром.|Qarorlaring shaharni, odamlarni va boshingdagi ovozni o'zgartiradi. Beshta yakun, bittasi yashirin. Hech biri tekinga kelmaydi.`,
  `Combat and art from Kyok Bori. Every image and every sound is made by code.|Бой и графика — из «Кёк Бёри». Каждая картинка и каждый звук сделаны кодом.|Jang va grafika «Ko'k Bo'ri»dan olingan. Har bir rasm va har bir tovush kod bilan yasalgan.`
];
const CREDITS = [
  [`Story and world|История и мир|Hikoya va olam`, `The Yodgor team|Команда «Ёдгора»|«Yodgor» jamoasi`],
  [`Engine and art|Движок и графика|Dvigatel va grafika`, `after Kyok Bori|по мотивам «Кёк Бёри»|«Ko'k Bo'ri» asosida`],
  [`Languages|Языки|Tillar`, `English, Russian, Uzbek|английский, русский, узбекский|ingliz, rus, o'zbek`],
  [`Thanks|Спасибо|Rahmat`, `to the bakhshi, and to everyone who keeps memory|бахши и всем, кто бережёт память|baxshilarga va xotirani asrayotgan har bir kishiga`]
];
function refreshPages() {
  S.about = ABOUT.map(x => t(x));
  S.credits = CREDITS.map(([a, b]) => [t(a), t(b)]);
  if (G.Game.state === 'title' || G.Game.state === 'boot' || !G.run) S.intro = introPages();
}
refreshPages();
LANG.onChange(refreshPages);
ON_NEWRUN.push(() => { if (G.YODGOR) G.YODGOR.intro = introPages; });
Promise.resolve().then(() => { if (G.YODGOR) G.YODGOR.intro = introPages; try { S.intro = introPages(); } catch (e) { /* ignore */ } });

/* =====================================================================
   Death: Sado pulls him back out of the dark; the Pledge Song takes a memory.
   ===================================================================== */
// DEATH_LINES lives in 90_wire.js (later in the scope): fill it once the layer has loaded
const DEATHS = [
  `Dark. Then a small hand finds yours and pulls. On the way up, the song takes its fee.|Темнота. Потом маленькая ладонь находит твою и тянет. По пути наверх песня берёт своё.|Qorong'ilik. Keyin kichkina qo'l qo'lingni topib, tortadi. Yuqoriga chiqquningcha qo'shiq o'z haqini olib qoladi.`,
  `The smell of your mother's bread. Gone. You'll never know you had it.|Запах маминого хлеба. Больше его нет. Ты даже не узнаешь, что он был.|Onang yopgan nonning hidi. Endi yo'q. U bo'lganini hech qachon bilmaysan ham.`,
  `"Not yet," says a voice in the dark. "You don't get to leave me here."|«Рано, — говорит голос в темноте. — Даже не думай бросить меня тут».|«Hali erta, — deydi qorong'ilikdagi ovoz. — Meni bu yerda tashlab ketishni xayolingga ham keltirma».`,
  `The name of the first debtor you ever pitied burns up like a moth. You come back lighter. And colder.|Сгорает, как мотылёк, имя первого должника, которого ты пожалел. Ты возвращаешься легче. И холоднее.|Birinchi bor rahming kelgan qarzdorning ismi parvonadek yonib ketadi. Yengilroq bo'lib qaytasan. Sovuqroq ham.`,
  `Water closes over you. Warm, salty. Then someone counts, very fast: one, two, three, breathe!|Над тобой смыкается вода, тёплая и солёная. Потом кто-то считает, быстро-быстро: раз, два, три — дыши!|Suv ustingdan yopiladi — iliq, sho'r. Keyin kimdir shosha-pisha sanaydi: bir, ikki, uch — nafas ol!`,
  `The Pledge Song gets a little louder. Somewhere a summer afternoon goes out like a lamp.|Песня залога звучит чуть громче. Где-то гаснет летний день, как задутая лампа.|Garov qo'shig'i sal balandroq eshitiladi. Qayerdadir bir yoz kuni puflangan chiroqdek o'chadi.`,
  `You lose the taste of the year's first apricot. Someone in the dark cries for you, since you can't.|Ты теряешь вкус первого абрикоса в году. Кто-то в темноте плачет вместо тебя — сам ты не умеешь.|Yilning birinchi o'rigi ta'mi yo'qoladi. Qorong'ilikda kimdir sen uchun yig'laydi — o'zing yig'lay olmaysan-ku.`,
  `"Up. Up. I've got you." The hand is very small. You don't ask whose.|«Вставай. Вставай, я держу». Ладошка совсем маленькая. Чья — ты не спрашиваешь.|«Tur. Tur, ushlab turibman». Qo'li juda kichkina. Kimniki ekanini so'ramaysan.`,
  `Rustam-aka's laugh on your first payday. The song takes it. It was worth more than the tilla.|Смех Рустама-ака в день твоей первой получки. Песня забирает его. Он стоил дороже любых денег.|Birinchi haq olgan kuning Rustam akaning kulgisi. Qo'shiq uni oladi. U har qanday tilladan qimmat edi.`,
  `The dark isn't empty. It's full of other people's evenings. You're pulled out before you become one of them.|Темнота не пустая. Она набита чужими вечерами. Тебя вытягивают прежде, чем ты станешь одним из них.|Qorong'ilik bo'sh emas. U begonalarning oqshomlariga liq to'la. Ulardan biriga aylanmasingdan oldin seni tortib olishadi.`,
  `You forget which boot pinches. A small price. The next one won't be.|Ты забываешь, какой сапог жмёт. Пустяк. В следующий раз будет не пустяк.|Qaysi etiging qisishini unutasan. Arzimas narsa. Keyingisi arzimas bo'lmaydi.`,
  `The sound of rain on a clay roof. Gone. You'll walk in the rain again and not know what's missing.|Стук дождя по глиняной крыше. Пропал. Ты снова пойдёшь под дождём и не поймёшь, чего не хватает.|Loy tomdagi yomg'ir shitirlashi. Yo'qoldi. Yana yomg'irda yurasan-u, nima yetishmayotganini tushunmaysan.`,
  `A frightened voice: "Don't go where I can't follow. Please. It's dark there."|Испуганный голос: «Не уходи туда, куда мне за тобой нельзя. Пожалуйста. Там темно».|Qo'rqib ketgan ovoz: «Men orqangdan borolmaydigan joyga ketma. Iltimos. U yer qorong'i».`,
  `The Sleeper turns over, and you roll out of his dream like a coin out of a pocket.|Спящий переворачивается, и ты выкатываешься из его сна, как монета из кармана.|Uxlovchi ag'nab tushadi va sen uning tushidan cho'ntakdan tushgan tangadek dumalab chiqasan.`,
  `Your first winter as a yodchi: cold fingers, and pride. The song eats it slowly, savouring.|Первая зима, когда ты стал ёдчи: окоченевшие пальцы и гордость. Песня ест её медленно, смакуя.|Yodchilikdagi birinchi qishing: muzlagan barmoqlar va g'urur. Qo'shiq uni sekin, mazza qilib yeydi.`,
  `Somewhere a child laughs, hit by a snowball. Then the snow is clean again, as if no one stood there.|Где-то смеётся ребёнок, в которого попали снежком. Потом снег снова чистый, будто там никто не стоял.|Qayerdadir qor to'pi tekkan bola kuladi. Keyin qor yana top-toza, go'yo u yerda hech kim turmagandek.`,
  `"Count with me," she says. "One. Two. You're back. Don't do that again."|«Считай со мной, — говорит она. — Раз. Два. Вернулся. Больше так не делай».|«Men bilan sana, — deydi u. — Bir. Ikki. Qaytding. Boshqa bunaqa qilma».`,
  `You come back with a hole where a song used to be. You try to hum it. Nothing comes.|Ты возвращаешься с дырой на месте какой-то песни. Пробуешь напеть — ничего.|Bir qo'shiqning o'rnida teshik bilan qaytasan. Xirgoyi qilib ko'rasan — hech narsa chiqmaydi.`,
  `The song takes the face of a man who once bought you tea. Tomorrow you'll be rude to him and never know why.|Песня забирает лицо человека, который когда-то угостил тебя чаем. Завтра ты ему нагрубишь и не поймёшь за что.|Qo'shiq bir paytlar senga choy quyib bergan odamning yuzini oladi. Ertaga unga qo'pollik qilasan-u, nega ekanini bilmaysan.`,
  `In Yodgor, death isn't the end. It's a tithe paid in small coin.|В Ёдгоре смерть — не конец. Это десятина, уплаченная мелочью.|Yodgorda o'lim — oxiri emas. Bu mayda chaqa bilan to'langan ushr.`
];
Promise.resolve().then(() => { DEATH_LINES.push(...DEATHS); });

/* =====================================================================
   Generic barks: Sado's subtitles while he plays.
   ===================================================================== */
Object.assign(BARKS, {
  combat: [
    `Three of them. No, four. Count them, you like counting.|Трое. Нет, четверо. Считай, ты же любишь считать.|Uchta. Yo'q, to'rtta. Sana, sanashni yaxshi ko'rasan-ku.`,
    `They're hungry. Not for you. For what's in your satchel.|Они голодные. Только не по тебе, а по тому, что у тебя в сумке.|Ular och. Senga emas — xaltangdagi narsaga.`,
    `Left! ...No, right. I keep mixing them up. I don't have hands.|Слева! …Ой, справа. Вечно путаю, у меня ведь рук нет.|Chapdan! ...Voy, o'ngdan. Doim adashtiraman, qo'lim yo'q-da.`,
    `Roll when they swing. Rustam taught you that. I can hear him in you.|Замахнулся — уходи перекатом. Это тебя Рустам научил, я его в тебе слышу.|Siltashsa, dumala. Buni senga Rustam o'rgatgan, uni ichingda eshitib turibman.`,
    `Don't let them get behind you. I can't see back there either.|Не пускай их за спину. Я туда тоже не вижу.|Orqangga o'tkazma. U yoqni men ham ko'rmayman.`,
    `Here they come. Breathe. You forget to breathe when you fight.|Идут. Дыши. Ты в драке забываешь дышать.|Kelishyapti. Nafas ol. Urishganda nafas olishni unutasan.`
  ],
  lowHp: [
    `You're bleeding. Drink something. Please.|Ты весь в крови. Выпей. Пожалуйста.|Qoning oqyapti. Biror narsa ich. Iltimos.`,
    `Ravshan, the flask! Drink! Now!|Равшан, фляга! Пей! Сейчас же!|Ravshan, suvingni ich! Hoziroq!`,
    `Not like this. I only just woke up.|Нет, не так. Я ведь только проснулась.|Bunaqasi bo'lmasin. Men endigina uyg'ondim-ku.`,
    `Get away from them. Run first, fight later. Running isn't shameful.|Отойди от них. Сначала беги, драться потом. Бегать не стыдно.|Ulardan uzoqlash. Avval qoch, keyin urishasan. Qochish uyat emas.`
  ],
  death: [
    `I pulled you out. Something stayed down there. I couldn't carry both.|Я тебя вытащила. А что-то осталось там, внизу. Двоих мне было не унести.|Seni tortib chiqardim. Lekin nimadir pastda qoldi. Ikkalasini ko'tarolmadim.`,
    `You were gone a long time. It was dark. I hate the dark.|Тебя долго не было. Было темно. Ненавижу темноту.|Uzoq yo'q bo'lib ketding. Qorong'i edi. Qorong'ilikni yomon ko'raman.`,
    `Do you still remember what colour the river is? Good. Just checking.|Ты ещё помнишь, какого цвета река? Хорошо. Я просто проверяю.|Daryo qanaqa rangda, hali eslaysanmi? Yaxshi. Shunchaki tekshirdim.`,
    `Every time you fall, the song takes a bite. Please stop feeding it.|Каждый раз, как ты падаешь, песня откусывает кусок. Хватит её кормить.|Har yiqilganingda qo'shiq bir tishlam uzib oladi. Uni boqishni bas qil.`,
    `Welcome back. You're a little lighter. I don't like it.|С возвращением. Ты стал чуть легче. Мне это не нравится.|Qaytding. Sal yengillashib qolibsan. Bu menga yoqmayapti.`
  ],
  idle: [
    `Are we waiting for something?|Мы чего-то ждём?|Nimanidir kutyapmizmi?`,
    `I'm counting the cracks in the sky. There are no stars here, so cracks will do.|Считаю трещины на небе. Звёзд тут нет, сойдут и трещины.|Osmondagi yoriqlarni sanayapman. Bu yerda yulduz yo'q, yoriq ham bo'laveradi.`,
    `If you stand still long enough, the Div forgets you're here. Don't.|Если долго стоять на месте, Дэв забудет, что ты здесь. Не надо.|Uzoq qimirlamay tursang, Dev bu yerdaligingni unutadi. Kerakmas.`,
    `Seven tumars before the new moon, Ravshan. Standing here won't find them.|Семь тумаров до новолуния, Равшан. Стоя на месте, их не найти.|Yangi oygacha yettita tumar, Ravshan. Turgan joyda ularni topib bo'lmaydi.`
  ],
  void50: [
    `Your thoughts have holes in them now. I keep falling through.|У тебя в мыслях теперь дыры. Я в них всё время проваливаюсь.|Fikrlaringda endi teshik ko'p. Ularga tushib ketaveraman.`,
    `I can't hear you as well as before. Are you still there?|Я тебя хуже слышу. Ты ещё тут?|Seni avvalgidek eshitolmayapman. Hali shu yerdamisan?`,
    `Some doors in you are shut now. I knock and nobody answers.|Какие-то двери в тебе теперь заперты. Стучу — никто не открывает.|Ichingdagi ba'zi eshiklar endi yopiq. Taqillataman — hech kim ochmaydi.`
  ],
  void75: [
    `The colours are going, Ravshan. Don't let them take the colours.|Цвета уходят, Равшан. Не отдавай им цвета.|Ranglar ketyapti, Ravshan. Ranglarni olib ketishlariga yo'l qo'yma.`,
    `People step aside for you, the way they do for the Hollow. You're not Hollow. Not yet.|Люди уступают тебе дорогу, как Пустым. Ты не Пустой. Пока нет.|Odamlar senga Bo'shlarga yo'l bergandek yo'l beryapti. Sen Bo'sh emassan. Hozircha.`,
    `If you go empty, where do I go?|Если ты опустеешь, куда я денусь?|Sen bo'shab qolsang, men qayoqqa boraman?`
  ],
  flask: [
    `Water from the Div's own skin. Warm. Tastes like someone's tears. Drink it anyway.|Вода с кожи самого Дэва. Тёплая, на вкус как чьи-то слёзы. Всё равно пей.|Devning o'z terisidan chiqqan suv. Iliq, ta'mi kimningdir ko'z yoshiga o'xshaydi. Baribir ich.`
  ],
  memoryNear: [
    `There. Something of yours. I can feel it, like a warm pebble in a pocket.|Вон там. Что-то твоё. Я его чувствую, как тёплый камешек в кармане.|Ana u yerda. Seniki bo'lgan nimadir. Cho'ntakdagi iliq toshchadek sezib turibman.`,
    `That light is yours. One of your lost memories. Go to it.|Этот огонёк — твой. Одно из твоих потерянных воспоминаний. Иди к нему.|Anavi nur seniki. Yo'qolgan xotiralaringdan biri. Unga bor.`,
    `Something here remembers you. Before you remember it.|Здесь что-то тебя помнит. Раньше, чем ты вспомнишь его.|Bu yerda nimadir seni eslaydi. Sen uni eslashingdan oldin.`,
    `Warm. Warmer. Like that game where someone hides a thing and says "warmer".|Тепло. Теплее. Как в той игре, где что-то прячут и подсказывают: «Теплее».|Issiq. Issiqroq. Xuddi «issiq-sovuq» o'yinidagidek.`
  ],
  lostTumar: [
    `Your tilla, right where you fell. Death is very honest about money.|Твоя тилла — ровно там, где ты упал. Смерть в денежных делах честная.|Tillang — aynan yiqilgan joyingda. O'lim pul masalasida juda halol.`,
    `Got it back. Don't make me watch that again.|Вернул. Только не заставляй меня смотреть на это ещё раз.|Qaytarib olding. Faqat buni menga yana ko'rsatma.`
  ],
  'enemy:hollow': [
    `Hollow. Don't hate them. They don't even know they're hungry.|Пустые. Не надо их ненавидеть. Они даже не знают, что голодны.|Bo'shlar. Ulardan nafratlanma. Och ekanini o'zlari ham bilishmaydi.`,
    `They follow the smell of your satchel, like kids after bread.|Идут на запах твоей сумки, как дети за хлебом.|Xaltangning hidiga ergashib kelishyapti, bolalar non ortidan yurgandek.`
  ],
  'enemy:singer': [
    `Wardens of the Well. They hum the Pledge Song under their breath. It makes my skin itch, and I don't have skin.|Стражи Колодца. Мурлычут под нос Песню залога. У меня от неё всё чешется, а ведь у меня даже кожи нет.|Quduq qo'riqchilari. Garov qo'shig'ini ming'irlab yurishadi. Undan badanim qichiydi, vaholanki badanim ham yo'q.`,
    `White hats. They know your face, Ravshan.|Белые шапки. Они тебя знают в лицо, Равшан.|Oq qalpoqlar. Ular seni yuzingdan taniydi, Ravshan.`
  ],
  'enemy:divan': [
    `Divan sellswords. Paid by the day, and it's a long day.|Наёмники Дивана. Им платят подённо, а день длинный.|Devon yollanmalari. Kunbayiga pul olishadi, kun esa uzun.`,
    `Humo feathers. Tilla-bek's people. They fight like they're bored.|Перья Хумо. Люди Тилла-бека. Дерутся, будто им скучно.|Humo patlari. Tillabekning odamlari. Zerikib urishishadi.`
  ],
  'enemy:crow': [
    `Crows. They eat what the Kampir leaves. Don't let them finish you.|Вороны. Доедают за Кампир. Не дай им доесть тебя.|Qarg'alar. Kampirdan qolganini yeyishadi. Seni yeb bitirishlariga yo'l qo'yma.`,
    `Birds. Kill them fast, they keep staring at me.|Птицы. Убей их скорее, они на меня пялятся.|Qushlar. Tezroq o'ldir, menga tikilib qolishdi.`
  ],
  'enemy:rat': [
    `Rats. Even the rats here look like they've paid the tithe.|Крысы. Даже крысы тут такие облезлые, будто платили десятину.|Kalamushlar. Bu yerda hatto kalamushlar ham ushr to'lagandek ko'rinadi.`,
    `They come up from the karez when the water turns bitter.|Они вылезают из кяриза, когда вода начинает горчить.|Suv achchiqlasa, korizdan chiqib kelishadi.`
  ],
  'enemy:dog': [
    `Jackals from the sand. They come when the Sleeper shakes.|Шакалы из песков. Приходят, когда Спящего трясёт.|Qumdan chiqqan chiyabo'rilar. Uxlovchi silkinsa, kelishadi.`,
    `They hunt in a circle. Keep your back to a wall.|Они обходят по кругу. Встань спиной к стене.|Ular aylanib ov qiladi. Orqangni devorga ber.`
  ],
  'enemy:archer': [
    `Archer! Keep moving, don't let him aim.|Лучник! Не стой, не давай ему прицелиться.|Kamonchi! To'xtama, mo'ljal olishiga qo'yma.`,
    `Arrows. Roll through them. Or just don't be where they're going.|Стрелы. Уходи перекатом. Или просто не стой там, куда они летят.|O'qlar. Dumalab o't. Yo bo'lmasa, ular uchayotgan joyda turma.`
  ],
  'enemy:spirit': [
    `That's not a person. It's a memory that got loose.|Это не человек. Это воспоминание, которое сорвалось с привязи.|Bu odam emas. Bu arqonini uzib qochgan xotira.`,
    `It's made of someone's bad night. Don't let it touch you.|Оно из чьей-то дурной ночи. Не дай ему тебя тронуть.|U kimningdir yomon kechasidan yasalgan. Senga tegmasin.`
  ],
  'enemy:beast': [
    `Things from the sand. The desert keeps its own debts.|Твари из песков. У пустыни свои долги.|Qumdan chiqqan maxluqlar. Sahroning o'z qarzlari bor.`,
    `Watch its tail. Everything here has a tail, even the city.|Следи за хвостом. Тут у всего есть хвост, даже у города.|Dumiga qara. Bu yerda hamma narsaning dumi bor, hatto shaharning ham.`
  ],
  'enemy:fly': [
    `Something above us. Look up!|Что-то над нами. Смотри наверх!|Tepamizda nimadir bor. Tepaga qara!`
  ],
  'enemy:elite': [
    `That one's brighter. It ate more than the others.|Этот ярче. Он съел больше остальных.|Bunisi yorqinroq. Boshqalardan ko'proq yegan.`,
    `Careful. That one glows like a full tumar.|Осторожно. Этот светится, как полный тумар.|Ehtiyot bo'l. Bunisi to'la tumardek yaltirayapti.`
  ],
  'enemy:new': [
    `What is that? I've never seen one. Have you?|Это ещё что? Я таких не видела. А ты?|Bu nima? Bunaqasini ko'rmaganman. Sen-chi?`,
    `Something new. Watch how it moves first.|Что-то новое. Сначала посмотри, как оно двигается.|Yangi narsa. Avval qanday harakatlanishini kuzat.`
  ]
});

/* ---------- when to say them ---------- */
const ENEMY_KIND = {
  zindan_prisoner: 'hollow', ghul: 'hollow', mummy_warrior: 'hollow', dummy: 'hollow',
  jailer: 'singer', torch_zealot: 'singer', frost_shaman: 'singer',
  guard: 'divan', assassin: 'divan', div_spearman: 'divan',
  kempir_crow: 'crow', berkut_wraith: 'crow', rat_div: 'rat', bori: 'dog', sher: 'dog', ghost_archer: 'archer',
  jinn: 'spirit', peri: 'spirit', albasty: 'spirit', ice_div: 'spirit', ibex_spirit: 'spirit', balbal_golem: 'spirit', tile_golem: 'spirit',
  snake: 'beast', snake_charmer: 'beast', scorpion: 'beast', sand_worm: 'beast'
};
function enemyKind(def) {
  if (!def) return 'new';
  if (ENEMY_KIND[def.id]) return ENEMY_KIND[def.id];
  const n = String(def.name || '') + ' ' + String(def.id || '');
  if (/hollow|empty|husk/i.test(n)) return 'hollow';
  if (/singer|warden|well|choir|cantor/i.test(n)) return 'singer';
  if (/divan|mercenar|sellsword|guard|humo|soldier/i.test(n)) return 'divan';
  if (/crow|raven|bird|kite/i.test(n)) return 'crow';
  if (/rat|vermin/i.test(n)) return 'rat';
  if (/dog|wolf|jackal|hound/i.test(n)) return 'dog';
  if (/archer|bow|sling/i.test(n)) return 'archer';
  if (/spirit|ghost|shade|peri|jinn|div|dream|memory|echo/i.test(n)) return 'spirit';
  if (/scorpion|snake|worm|lizard|beetle/i.test(n)) return 'beast';
  if (def.fly) return 'fly';
  return 'new';
}
const H = { combatCD: 0, lowCD: 0, still: 0, lastX: 0, flasks: null, idleDone: false, inCombat: false, seen: new WeakSet(), kinds: {} };
ON_STAGE.push(plan => {
  H.combatCD = 600; H.lowCD = 0; H.still = 0; H.lastX = 0; H.idleDone = false; H.inCombat = false; H.kinds = {};
  H.flasks = G.run ? G.run.flasks : null;
  const d = R().deathsThisRun || 0;
  if (d > (R().at.deathSeen || 0)) {
    R().at.deathSeen = d; save();
    queue(() => stageT() > 150, () => bark('death', { repeat: true }));
  }
  if (plan.type === 'level' || plan.type === 'boss') {
    if (R().void >= 75) queue(() => stageT() > 520, () => bark('void75', { repeat: Math.random() < 0.5 }));
    else if (R().void >= 50) queue(() => stageT() > 520, () => bark('void50', { repeat: Math.random() < 0.5 }));
  }
});
const VOID50_SCENE = [
  ['sado', `Ravshan? You sound farther away. Like we're shouting across a river. I can still hear you. Mostly.|Равшан? Ты как будто дальше стал. Будто мы перекрикиваемся через реку. Я тебя ещё слышу. Почти всегда.|Ravshan? Uzoqlashib qolgandeksan. Go'yo daryoning ikki betidan baqirib gaplashyapmiz. Hali eshityapman. Ko'pincha.`],
  ['hero', `I'm here.|Я тут.|Shu yerdaman.`],
  ['sado', `Half of you is empty now. Some of your thoughts have gone quiet, like a house after the tithe.|Ты уже наполовину пустой. Какие-то мысли затихли, как дом после десятины.|Yarming bo'shab qoldi. Ba'zi fikrlaring jimib qoldi — ushrdan keyingi uydek.`],
  ['sado', `If it gets worse, there'll be things you can't say anymore. I'll say them for you.|Если станет хуже, что-то ты уже не сможешь сказать. Тогда скажу я.|Battar bo'lsa, ba'zi gaplarni endi aytolmay qolasan. Unda men aytaman.`]
];
const VOID75_SCENE = [
  ['', `The colour drains out of the world. People step aside as you pass, the way they do for the Hollow.|Из мира уходит цвет. Люди расступаются перед тобой, как перед Пустыми.|Dunyodan rang oqib ketyapti. Odamlar Bo'shlarga yo'l bergandek senga ham yo'l bo'shatishadi.`],
  ['sado', `Don't go. If you go, where do I go? There's nowhere else. There's only you.|Не уходи. Уйдёшь ты — куда мне деваться? Больше некуда. Есть только ты.|Ketma. Sen ketsang, men qayoqqa boraman? Boshqa joy yo'q. Faqat sen borsan.`],
  ['hero', `Then talk. Keep talking. I'll follow your voice.|Тогда говори. Не замолкай. Я пойду на голос.|Unda gapir. Jim bo'lma. Ovozingga ergashaman.`]
];
TICK.push(() => {
  if (!sadoAwake() || R().ended) return;
  const w = G.world, pl = w && w.player;
  if (!pl) return;
  const r = R();
  if (r.void >= 50 && !r.warned.v50) { r.warned.v50 = 1; save(); queue(() => true, () => scene(done => play(VOID50_SCENE, done)), 'v50'); }
  if (r.void >= 75 && !r.warned.v75) { r.warned.v75 = 1; save(); queue(() => true, () => scene(done => play(VOID75_SCENE, done)), 'v75'); }
  if (H.combatCD > 0) H.combatCD--;
  if (H.lowCD > 0) H.lowCD--;
  // enemies: first sight of a kind, the start of a fight
  let near = 0, said = false;
  for (const e of w.enemies || []) {
    if (!e || e.dead || e === pl || !e.def || e.def.boss) continue;
    if (e.aggro && Math.abs(e.x - pl.x) < 300) near++;
    if (!e.aggro || H.seen.has(e)) continue;
    H.seen.add(e);
    const k = e.elite ? 'elite' : enemyKind(e.def);
    if (H.kinds[k]) continue;
    H.kinds[k] = 1;
    if (!said) said = bark('enemy:' + k);
  }
  if (near > 0 && !H.inCombat) {
    H.inCombat = true;
    if (!said && H.combatCD <= 0 && Math.random() < 0.45) { bark('combat', { repeat: true }); H.combatCD = 3000; }
  } else if (near === 0) H.inCombat = false;
  // low health
  if (pl.hp > 0 && pl.maxHp && pl.hp < pl.maxHp * 0.25 && H.lowCD <= 0) { bark('lowHp', { repeat: true, now: true, pri: 1 }); H.lowCD = 3600; }
  // the first flask of the journey
  if (G.run && typeof G.run.flasks === 'number') {
    if (H.flasks != null && G.run.flasks < H.flasks && once('flask1')) bark('flask');
    H.flasks = G.run.flasks;
  }
  // standing still
  if (Math.abs(pl.x - H.lastX) < 0.5) H.still++; else H.still = 0;
  H.lastX = pl.x;
  if (H.still > 1800 && !H.idleDone && quiet()) { H.idleDone = true; bark('idle', { repeat: true }); }
});

/* =====================================================================
   Rest stops: Hollow Rustam, the mute bakhshi, Farrukh, Sado's lullaby
   ===================================================================== */
const RUSTAM_HABIT = [
  `Sugar? No. The boy doesn't take sugar. The boy takes nothing.|Сахар? Нет. Мальчик сахар не берёт. Мальчик ничего не берёт.|Qand? Yo'q. Bola qand olmaydi. Bola hech narsa olmaydi.`,
  `Row nine. Counted. Counted. Write it once.|Девятый ряд. Посчитано. Посчитано. Записать один раз.|To'qqizinchi qator. Sanaldi. Sanaldi. Bir marta yoziladi.`,
  `Roll when they swing, son. While you're moving, there's no one there to hit.|Замахнулись — катись, сынок. Пока ты в движении, бить некого.|Siltashsa, dumala, o'g'lim. Qimirlab tursang, urishga odam topilmaydi.`,
  `The samovar will fill your flasks. A collector eats. A debtor goes hungry.|Самовар нальёт тебе фляги. Сборщик должен быть сыт. Должник — голоден.|Samovar idishlaringni to'ldiradi. Yig'uvchi to'q yuradi. Qarzdor — och.`,
  `Scrolls of strength: red for the blade, purple for the bow and cunning, green to stay alive. Write it down.|Свитки силы: красный — для клинка, лиловый — для лука и хитрости, зелёный — чтоб выжить. Запиши.|Kuch bitiklari: qizili — qilichga, binafshasi — kamon bilan makrga, yashili — tirik qolishga. Yozib qo'y.`,
  `Don't look them in the eye. Then it's only numbers.|Не смотри им в глаза. Тогда это просто цифры.|Ko'zlariga qarama. Shunda hammasi shunchaki raqam bo'lib qoladi.`
];
const RUSTAM_MEM = {
  1: {
    lines: [
      ['', `You take his dry hand and hum the Taste. His memory lifts like the lid of a pot.|Берёшь его сухую руку и напеваешь Пробу. Память приоткрывается, как крышка на казане.|Uning quruq qo'lini ushlab, Totish kuyini xirgoyi qilasan. Xotirasi qozon qopqog'idek ko'tariladi.`],
      ['memory', `Twenty years ago, a week after the Small Awakening. A house in the Tail, a lamp. Rustam is young, his beard still black.|Двадцать лет назад, через неделю после Малого Пробуждения. Дом в Хвосте, лампа. Рустам молодой, борода ещё чёрная.|Yigirma yil oldin, Kichik Uyg'onishdan bir hafta keyin. Dumdagi bir uy, chiroq. Rustam yosh, soqoli hali qop-qora.`],
      ['memory', `He writes in the debt book: "Row nine. The potter's house. One tithe." Then, slowly, he writes the same line again underneath.|Он пишет в долговой книге: «Девятый ряд. Дом гончара. Одна десятина». Потом медленно выводит под ней ту же строку ещё раз.|U qarz daftariga yozadi: «To'qqizinchi qator. Kulolning uyi. Bitta ushr». Keyin shoshilmay, tagiga o'sha satrni yana yozadi.`],
      ['memory', `A Singer in the doorway: "Good. Twice. The Well is hungry this year."|Певец в дверях: «Хорошо. Дважды. Колодец в этом году голодный».|Ostonada Xonanda: «Yaxshi. Ikki marta. Bu yil Quduq och».`],
      ['memory', `Behind a curtain, someone small is watching. Rustam doesn't look that way. Neither does the memory.|За занавеской кто-то маленький подглядывает. Рустам туда не смотрит. И память не смотрит.|Parda ortidan kichkina kimdir mo'ralayapti. Rustam u tomonga qaramaydi. Xotira ham qaramaydi.`],
      ['', `The memory closes. Rustam-aka drops sugar into your tea.|Память закрывается. Рустам-ака кладёт тебе в чай сахар.|Xotira yopiladi. Rustam aka choyingga qand tashlaydi.`],
      ['hero', `He wrote one house down twice. Two tithes from one family. Nobody can pay that.|Он записал один дом дважды. Две десятины с одной семьи. Такое никто не выплатит.|Bitta uyni ikki marta yozgan. Bir oiladan ikkita ushr. Buni hech kim to'lay olmaydi.`],
      ['hero', `Row nine... I grew up on row nine.|Девятый ряд… Я вырос на девятом ряду.|To'qqizinchi qator... Men to'qqizinchi qatorda o'sganman.`],
      ['sado', `...|…|...`],
      ['sado', `She was so scared she couldn't even cry.|Ей было так страшно, что она даже плакать не могла.|U shunchalik qo'rqqan ediki, hatto yig'lay olmasdi.`],
      ['hero', `Who?|Кому?|Kim?`],
      ['sado', `The girl behind the curtain. Didn't you see her?|Девочке за занавеской. Ты её не видел?|Parda ortidagi qizcha. Ko'rmadingmi?`],
      ['hero', `There was only a curtain.|Там была одна занавеска.|U yerda faqat parda bor edi.`],
      ['sado', `...Then I don't know how I saw her.|…Тогда я не знаю, как я её разглядела.|...Unda uni qanday ko'rganimni bilmayman.`]
    ],
    know: `Twenty years ago Rustam charged a house on row nine a double tithe.|Двадцать лет назад Рустам записал на дом с девятого ряда двойную десятину.|Yigirma yil oldin Rustam to'qqizinchi qatordagi bir uyga ikki hissa ushr yozgan.`
  },
  2: {
    lines: [
      ['', `His memory is thinner today. It opens on the second try.|Сегодня память у него тоньше. Открывается только со второго раза.|Bugun xotirasi yupqaroq. Faqat ikkinchi urinishda ochiladi.`],
      ['memory', `A cellar under the Cloister. Wet clay, lamp oil. Rustam's hand on a small shoulder, steering her forward.|Подвал под Обителью. Сырая глина, ламповое масло. Рука Рустама лежит на маленьком плече и подталкивает вперёд.|Xonaqoh tagidagi yerto'la. Nam loy, chiroq moyi. Rustamning qo'li kichkina yelkada — oldinga yo'naltiradi.`],
      ['memory', `A Singer at a table with a book: "Debtor. Name?"|Певец за столом, перед ним книга: «Должница. Имя?»|Stol ortida daftar ochib o'tirgan Xonanda: «Qarzdor. Ismi?»`],
      ['memory', `She won't speak, so Rustam answers for her: "Oydin. Eight years old. Row nine."|Она молчит, и Рустам отвечает за неё: «Ойдин. Восемь лет. Девятый ряд».|Qizcha indamaydi, Rustam uning o'rniga javob beradi: «Oydin. Sakkiz yoshda. To'qqizinchi qator».`],
      ['memory', `Two braids. She doesn't cry. She holds Rustam's sleeve until the Singer unhooks her fingers, one by one.|Две косички. Она не плачет. Держится за рукав Рустама, пока Певец не разжимает ей пальцы — по одному.|Ikki o'rim soch. Yig'lamaydi. Xonanda barmoqlarini birma-bir ochmaguncha Rustamning yengini qo'yib yubormaydi.`],
      ['memory', `Rustam climbs the stairs and doesn't look back. The memory is proud of that. And ashamed.|Рустам поднимается по лестнице и не оглядывается. Память этим гордится. И стыдится.|Rustam zinadan chiqib ketadi, orqasiga qaramaydi. Xotira bundan faxrlanadi. Va uyaladi.`],
      ['hero', `He handed a child to the Singers. For a debt. And then he taught me to count.|Он отдал Певцам ребёнка. За долг. А потом учил меня считать.|Xonandalarga bolani topshirgan. Qarz uchun. Keyin esa meni sanashga o'rgatgan.`],
      ['hero', `Oydin. ...It means moonlight.|Ойдин. …Значит «лунный свет».|Oydin... Oyning yorug'i.`],
      ['sado', `Oydin.|Ойдин.|Oydin.`],
      ['hero', `You know that name?|Ты знаешь это имя?|Bu ismni bilasanmi?`],
      ['sado', `No. I just wanted to say it. It's a good name to say out loud.|Нет. Просто захотелось его сказать. Его приятно говорить вслух.|Yo'q. Shunchaki aytgim keldi. Uni ovoz chiqarib aytish yoqimli.`]
    ],
    know: `Rustam handed the Singers an eight-year-old girl named Oydin as a debtor.|Рустам отдал Певцам за долг восьмилетнюю девочку. Её звали Ойдин.|Rustam Xonandalarga Oydin ismli sakkiz yoshli qizchani qarz evaziga topshirgan.`,
    after: () => setF('oydinName', 1)
  },
  3: {
    lines: [
      ['', `There's very little left in him. You have to go deep. It feels like robbing a sleeping man.|В нём почти ничего не осталось. Приходится лезть глубоко. Как будто обираешь спящего.|Unda deyarli hech narsa qolmagan. Chuqur kirishga to'g'ri keladi. Uxlab yotgan odamning cho'ntagini kavlayotgandeksan.`],
      ['memory', `A hall in the Cloister. Ustoz Shirin, a few years younger. Elders of the Divan along the walls.|Зал в Обители. Устоз Ширин, на несколько лет моложе. Вдоль стен — старейшины Дивана.|Xonaqohdagi zal. Ustoz Shirin, bir necha yil yoshroq. Devor bo'ylab Devon oqsoqollari.`],
      ['memory', `Shirin: "Worn tumars feed him nothing. One night, one song, the whole Tail. Enough to keep him asleep a hundred years."|Ширин: «Потёртые тумары его не кормят. Одна ночь, одна песня — весь Хвост. И он проспит сто лет».|Shirin: «Eskirgan tumarlar uni to'ydirmaydi. Bir kecha, bir qo'shiq — butun Dum. Shunda u yuz yil uxlaydi».`],
      ['memory', `A merchant laughs: "And who'll carry our water then?" Shirin: "The Hollow carry water very well."|Купец смеётся: «А воду нам кто потом носить будет?» Ширин: «Пустые прекрасно носят воду».|Bir savdogar kuladi: «Keyin suvimizni kim tashiydi?» Shirin: «Bo'shlar suvni juda yaxshi tashiydi».`],
      ['memory', `Rustam says nothing. Under the table he counts on his fingers. Houses. Rows. The whole Tail.|Рустам молчит. Под столом считает на пальцах. Дома. Ряды. Весь Хвост.|Rustam jim. Stol tagida barmoq bukib sanaydi. Uylar. Qatorlar. Butun Dum.`],
      ['memory', `Shirin, softly, just to him: "On the night of the new moon, Rustam. You'll bring me the book."|Ширин тихо, ему одному: «В ночь новолуния, Рустам. Принесёшь мне книгу».|Shirin sekin, faqat unga: «Yangi oy kechasi, Rustam. Daftarni menga olib kelasan».`],
      ['hero', `The Great Tithe. She'll sing the whole Tail empty in one night. On the new moon. The same night my time runs out.|Великая десятина. Она выпоет весь Хвост за одну ночь. В новолуние — в ту самую ночь, когда истекает мой срок.|Buyuk ushr. Butun Dumni bir kechada kuylab bo'shatadi. Yangi oyda — mening muddatim tugaydigan kechada.`],
      ['sado', `So it's not only you. It's the widow. The children. Everyone who ever waved at us.|Значит, дело не только в тебе. Вдова. Дети. Все, кто нам хоть раз махнул рукой.|Demak, gap faqat senda emas. Beva. Bolalar. Bizga bir marta bo'lsa ham qo'l silkitgan hamma.`]
    ],
    know: `The Great Tithe: on the new moon Shirin will sing the whole Tail empty.|Великая десятина: в новолуние Ширин выпоет весь Хвост.|Buyuk ushr: yangi oyda Shirin butun Dumni kuylab bo'shatadi.`
  }
};
// Hollow Rustam at the rest; cap = the furthest memory this rest can reach
function rustamAt(cap) {
  return done => {
    const next = (F().rustamMem || 0) + 1;
    const key = 'taste' + SK();
    const can = next <= cap && !R().at[key];
    play([['rustam', pick(RUSTAM_HABIT)]], () => {
      if (!can) {
        play([
          () => (next > 3 ? ['sado', `There's nothing more we can reach in him here. Only habits.|Здесь из него больше ничего не достать. Одни привычки.|Bu yerda undan boshqa hech narsa ololmaymiz. Faqat odatlari qolgan.`] : null),
          () => (next <= 3 ? ['sado', `Not again today. His memory is too thin. Pull any harder and it'll tear.|Сегодня хватит. Память у него совсем тонкая — дёрнешь сильнее, и порвётся.|Bugun bo'ldi. Xotirasi juda yupqa — qattiqroq tortsang, yirtilib ketadi.`] : null)
        ], done);
        return;
      }
      hub(`Rustam-aka, Hollow|Рустам-ака, Пустой|Bo'sh Rustam aka`, [
        { label: `— Sado, is he still in there?|— Садо, он ещё там, внутри?|— Sado, u hali ichidami?`, lines: [
          ['sado', `I was going to ask you. Is he? Somewhere?|Я сама хотела тебя спросить. Он там? Хоть где-нибудь?|O'zim sendan so'ramoqchi edim. Ichidami? Qayerdadir?`],
          ['hero', `The Hollow keep their habits. Routes, little phrases, the way they pour tea. Everything else was sung out of them.|Пустым остаются привычки: маршрут, словечки, как разливать чай. Всё остальное из них выпели.|Bo'shlarda odatlar qoladi: yo'li, gap-so'zlari, choy quyishi. Qolganini kuylab olib bo'lishgan.`],
          ['sado', `So he walked here on his own? Like a donkey that knows the way home.|Значит, он сам сюда пришёл? Как ослик, который знает дорогу домой.|Demak, bu yerga o'zi kelganmi? Uyga yo'lni biladigan eshakchadek.`],
          ['hero', `Yes. And he'll keep walking his route until he forgets how to stand up.|Да. И будет ходить своим маршрутом, пока не забудет, как вставать.|Ha. O'rnidan turishni unutmaguncha o'z yo'lidan yuraveradi.`]
        ] },
        { label: `— Sado, you should know what the Taste costs.|— Садо, тебе надо знать, чем платят за Пробу.|— Sado, Totishning narxini bilib qo'yishing kerak.`, if: () => next === 1, lines: [
          ['hero', `It's called the Taste. I hum, and for a few minutes I live what he lived. As if it were mine.|Это называется Проба. Я напеваю — и несколько минут живу тем, что прожил он. Как своим.|Buni Totish deyishadi. Xirgoyi qilaman-u, bir necha daqiqa u kechirganni o'zimnikidek yashayman.`],
          ['sado', `And what does it cost?|А платить чем?|Haqini nima bilan to'laysan?`],
          ['hero', `Each taste wears his memory thinner. And it takes a little of me. The song is doing that anyway. Tasting helps it along.|Каждая проба стирает его память. И забирает немного меня. Песня и так этим занята, а Проба ей помогает.|Har totishda uning xotirasi yupqalashadi. Mendan ham ozgina ketadi. Qo'shiq shundoq ham shu ish bilan band, Totish unga yordam beradi.`],
          ['sado', `Then why do it?|Тогда зачем?|Unda nima keragi bor?`],
          ['hero', `He had the vault keys. Whoever took the tumars got past him. If he saw anything, it's in there.|Ключи от хранилища были у него. Кто бы ни взял тумары, мимо Рустама он пройти не мог. Если Рустам что-то видел, это в нём.|Xazina kalitlari unda edi. Tumarlarni kim olgan bo'lsa, Rustamni chetlab o'tolmagan. Biror narsa ko'rgan bo'lsa, o'sha yerda.`]
        ] },
        { label: `— What do you think we'll find this time?|— Как думаешь, что мы найдём на этот раз?|— Nima deb o'ylaysan, bu safar nima topamiz?`, if: () => next > 1, lines: [
          () => (next === 2
            ? ['sado', `The rest of that night. The girl behind the curtain. He's carried her all this time, I can tell. Like a stone in a boot.|Конец той ночи. Девочку за занавеской. Он всё это время носил её в себе, я чувствую. Как камешек в сапоге.|O'sha kechaning davomini. Parda ortidagi qizchani. U shuncha yil uni ichida olib yurgan, sezib turibman. Etikka kirgan toshchadek.`]
            : ['sado', `Something about the new moon. He keeps counting under the table. I can feel his fingers moving.|Что-то про новолуние. Он всё считает под столом. Я чувствую, как шевелятся его пальцы.|Yangi oy haqida nimadir. Stol tagida sanayveradi. Barmoqlari qimirlayotganini sezyapman.`]),
          ['sado', `It'll cost you again. I'm not saying don't. I'm saying I'm counting too.|Тебе это опять дорого обойдётся. Я не говорю «не надо». Я говорю, что тоже считаю.|Bu yana senga qimmatga tushadi. «Kerakmas» demayapman. Men ham sanab boryapman, demoqchiman.`]
        ] },
        { label: `— Rustam-aka. Are you in there?|— Рустам-ака. Вы ещё здесь?|— Rustam aka. Ichingizda o'zingiz bormisiz?`, lock: numb(), lines: back => play([
          ['hero', `Rustam-aka. It's me. Ravshan. Are you in there at all?|Рустам-ака, это я, Равшан. От вас там хоть что-нибудь осталось?|Rustam aka. Bu men. Ravshan. Ichingizda ozgina bo'lsa ham o'zingiz bormisiz?`],
          ['', `For a breath something rises behind his clean eyes, like a fish under ice.|На миг за его чистыми глазами что-то всплывает, как рыба подо льдом.|Bir lahza uning toza ko'zlari ortida muz ostidagi baliqdek nimadir suzib o'tadi.`],
          ['rustam', `...Tea's gone cold.|…Чай остыл.|...Choy sovib qolibdi.`],
          ['sado', `He heard you. Somewhere in there, he heard you.|Он тебя услышал. Где-то там, внутри, услышал.|U seni eshitdi. Ichkarida, qayerdadir — eshitdi.`]
        ], () => { trust(1); back(); }) }
      ], [
        { k: 'taste', label: `Take his hand and hum the Taste. The song will take its share of you too.|Взять его за руку и напеть Пробу. Песня возьмёт свою долю и с тебя.|Qo'lini ushlab, Totishni xirgoyi qilish. Qo'shiq o'z ulushini sendan ham oladi.`, cost: 8 },
        { k: 'sit', label: `Just sit with him and drink your tea.|Просто посидеть с ним и выпить чаю.|U bilan shunchaki o'tirib, choy ichish.` },
        { k: 'go', label: LEAVE }
      ], o => {
        if (o.k === 'taste') {
          R().at[key] = 1; save();
          const m = RUSTAM_MEM[next];
          taste(8);
          setF('rustamMem', next);
          play(m.lines, () => { know(m.know); if (m.after) m.after(); done(); });
        } else if (o.k === 'sit') {
          play([
            ['', `He pours your tea first. For a moment it's any morning of the last twenty years.|Он сначала наливает тебе. На минуту всё как в любое утро последних двадцати лет.|U avval senga quyadi. Bir daqiqaga bu so'nggi yigirma yilning oddiy bir tongiga aylanadi.`],
            ['sado', `He's so careful with the cup. Whatever he did, his hands still remember being kind.|Как бережно он держит пиалу. Что бы он ни натворил, руки ещё помнят доброту.|Piyolani qanday avaylab ushlaydi. Nima qilgan bo'lmasin, qo'llari hali mehrni eslaydi.`]
          ], done);
        } else done();
      });
    });
  };
}

// Farrukh: dry humour, stolen joys for health or strength, information
const FARRUKH_HELLO = [
  `Back so soon? Joy is habit-forming. Believe me, I know.|Уже вернулся? Радость затягивает. Уж я-то знаю.|Tez qaytding-ku? Shodlikka tez o'rganib qolasan. Men bilaman.`,
  `Ravshan. Still yourself? Mostly? Good. "Mostly" is my best customer.|Равшан. Ты ещё ты? В основном? Чудно. «В основном» — мой лучший покупатель.|Ravshan. Hali o'zingmisan? Asosan? Zo'r. «Asosan» — eng yaxshi xaridorim.`,
  `Come closer. Not that close. Yodchi smell of other people.|Подойди. Не так близко. От ёдчи пахнет чужими людьми.|Yaqinroq kel. Bunchalik emas. Yodchidan begona odamlarning hidi keladi.`
];
const JOY_HEAL = [
  `A stranger's wedding morning: new boots, cold water, someone laughing in the next room. For a while your wounds forget to hurt.|Утро чужой свадьбы: новые сапоги, холодная вода, за стеной кто-то смеётся. Раны на время забывают, что им положено болеть.|Birovning to'y tongi: yangi etik, sovuq suv, qo'shni xonada kimdir kulyapti. Yaralaring bir muddat og'rishni unutadi.`,
  `A good harvest in a good year. Melons so heavy the cart creaks. Your body believes it, and heals.|Богатый урожай в хороший год. Дыни такие тяжёлые, что арба скрипит. Тело верит — и заживает.|Yaxshi yilning mo'l hosili. Qovunlar shunaqa og'irki, arava g'ijirlaydi. Tanang ishonadi va tuzala boshlaydi.`,
  `A child's first ride on a donkey. Terror, then glory. Your hands stop shaking.|Ребёнок первый раз сел на ослика. Сначала ужас, потом восторг. У тебя перестают дрожать руки.|Bola birinchi marta eshakka mindi. Avval vahima, keyin zavq. Qo'llaringning titrog'i bosiladi.`
];
const JOY_STR = [
  `A caravan guard on the Salt Road, nineteen and afraid of nothing. Your arm remembers being his.|Охранник каравана на Соляной дороге: девятнадцать лет, никого не боится. Твоя рука помнит, что была его рукой.|Tuz yo'lidagi karvon qo'riqchisi: o'n to'qqiz yoshda, hech kimdan qo'rqmaydi. Qo'ling uning qo'li bo'lganini eslaydi.`,
  `A wrestler's best day at the spring games: the crowd, the dust, the other man flat on his back.|Лучший день борца на весенних играх: толпа, пыль, соперник на лопатках.|Bahor sayilida kurashchining eng zo'r kuni: olomon, chang, raqib kuragi bilan yerda.`
];
const JOY_AFTER = [
  `Don't make a habit of it. Habits are my department.|Только не привыкай. Привычки — это по моей части.|Faqat o'rganib qolma. Odat — mening ishim.`,
  `Lovely, isn't it? Somebody had that once. Now you've had it a little too.|Прелесть, правда? У кого-то это было. Теперь чуть-чуть было и у тебя.|Ajoyib-a? Bu bir vaqtlar kimdadir bo'lgan. Endi ozgina senda ham bo'ldi.`,
  `It wears thinner every time. Like everything good.|С каждым разом всё тоньше. Как всё хорошее.|Har safar yupqalashib boradi. Hamma yaxshi narsa kabi.`
];
const FARRUKH_HOW = { label: `— How do your joys work?|— Как действуют твои радости?|— Shodliklaring qanday ishlaydi?`, lines: [
  ['farrukh', `Somebody sold a happy day. You live it in a minute. Your body believes it was happy and mends itself. Simple.|Кто-то продал счастливый день. Ты проживаешь его за минуту. Тело верит, что было счастливо, и чинит себя само. Всё просто.|Kimdir baxtli bir kunini sotgan. Sen uni bir daqiqada yashaysan. Tanang baxtli bo'lganiga ishonib, o'zini o'zi tuzatadi. Oddiy.`],
  ['farrukh', `The catch: to fit a stranger in, you push out a little of yourself. Nothing's free, yodchi. You of all people know that.|Подвох в том, что чужое влезает, только если подвинуть немного своего. Даром ничего не бывает, ёдчи. Тебе ли не знать.|Gap shundaki, begonani sig'dirish uchun o'zingdan ozgina chiqarib tashlaysan. Tekin narsa yo'q, yodchi. Buni sendan yaxshi kim biladi.`],
  ['sado', `So it heals you, and the song gets a bigger bite. Good to know.|Значит, раны лечит, а песне достаётся кусок побольше. Буду знать.|Demak, yarani bitkazadi, qo'shiq esa kattaroq tishlam oladi. Bilib qo'yamiz.`]
] };
function farrukhAt(id, o) {
  return done => {
    const first = once('farrukh:' + id);
    const intro = first && o.first ? o.first : [['farrukh', pick(FARRUKH_HELLO)]];
    const asked = new Set();
    const qs = [FARRUKH_HOW].concat(o.questions || []);
    play(intro, loop);
    function loop() {
      ask(`Farrukh's box|Шкатулка Фарруха|Farruxning qutisi`, qs.map((q, i) => ({ k: 'q', qi: i, label: q.label, hide: asked.has(i) || (q.if && !q.if()) })).concat([
        { k: 'heal', label: `Taste a stranger's happy day. It heals, and costs you a crumb of yourself.|Испить чужой счастливый день. Раны затянутся, а от тебя убудет самая малость.|Begonaning baxtli kunini totish. Yara bitadi, o'zingdan esa bir chimdim kamayadi.`, cost: 4, price: 15 },
        { k: 'str', label: `Taste a stranger's courage. You'll hit harder, and lose a little more of yourself.|Испить чужую храбрость. Рука станет тяжелее, а тебя — ещё чуть меньше.|Begonaning jasoratini totish. Zarbang og'irlashadi, o'zingdan esa yana ozgina ketadi.`, cost: 8, price: 40, hide: !!R().at['fstr' + id] },
        o.info ? { k: 'info', label: o.info.label, price: 25, hide: !!R().at['finfo' + id] } : null,
        o.founders ? { k: 'founders', label: `Taste the founder's tumar. Three hundred years old, and it will take its share of you.|Испить тумар основателя. Ему триста лет, и свою долю он с тебя возьмёт.|Asoschining tumarini totish. Unga uch yuz yil, o'z ulushini sendan oladi.`, cost: 8, price: 60, hide: !!F().truth } : null,
        { k: 'go', label: LEAVE }
      ]), c => {
        if (c.k === 'q') {
          asked.add(c.qi);
          const q = qs[c.qi];
          if (typeof q.lines === 'function') q.lines(loop); else play(q.lines, loop);
        } else if (c.k === 'heal') {
          taste(4);
          play([['memory', pick(JOY_HEAL)], ['farrukh', pick(JOY_AFTER)]], () => { healFull(); loop(); });
        } else if (c.k === 'str') {
          R().at['fstr' + id] = 1; save();
          taste(8);
          play([['memory', pick(JOY_STR)], ['farrukh', pick(JOY_AFTER)]], () => { strengthUp(); loop(); });
        } else if (c.k === 'info') {
          R().at['finfo' + id] = 1; save();
          play(o.info.lines, () => { if (o.info.know) know(o.info.know); loop(); });
        } else if (c.k === 'founders') {
          taste(8);
          play(FOUNDERS_TASTE, () => { setF('truth', 1); know(`There was no treaty. The founders chained the Sleeper with a song.|Никакого договора не было. Основатели сковали Спящего песней.|Hech qanday ahdnoma bo'lmagan. Asoschilar Uxlovchini qo'shiq bilan kishanlagan.`); loop(); });
        } else {
          play([['farrukh', pick([
            `Off you go. Try not to die. Dead men are terrible customers.|Ну, иди. Постарайся не умереть. Покойники — ужасные покупатели.|Bor endi. O'lmaslikka harakat qil. O'liklar — juda yomon xaridor.`,
            `Mind the Hollow on your way out. They like you. That should worry you.|На выходе поосторожнее с Пустыми. Ты им нравишься. Это должно тебя тревожить.|Chiqishda Bo'shlardan ehtiyot bo'l. Ular seni yaxshi ko'rishadi. Bu seni o'ylantirishi kerak.`
          ])]], done);
        }
      });
    }
  };
}
const FOUNDERS_TASTE = [
  ['memory', `Three hundred years ago. You are a caravan-bashi, one of seven. The desert here is green, and a river talks to itself.|Триста лет назад. Ты — караван-баши, один из семерых. Пустыня здесь зелёная, а река разговаривает сама с собой.|Uch yuz yil oldin. Sen yetti karvonboshidan birisan. Bu yerda sahro yam-yashil, daryo esa o'zicha gapirib oqadi.`],
  ['memory', `Something huge lies in the river, listening. Bakhshi sit on the bank and tell it tales. Wherever they tell, water rises.|В реке лежит что-то огромное и слушает. Бахши сидят на берегу и рассказывают ему сказки. Где рассказывают, там поднимается вода.|Daryoda ulkan bir narsa yotib, quloq solib turibdi. Baxshilar qirg'oqda o'tirib, unga ertak aytadi. Qayerda aytishsa, o'sha yerda suv chiqadi.`],
  ['memory', `One of the seven says: "A tale costs us a whole night. A captive's memory costs a coin. Let's see which it likes better."|Один из семерых говорит: «Сказка нам стоит целой ночи. Память пленника — одной монеты. Посмотрим, что ему больше понравится».|Yettovdan biri aytadi: «Ertak bizga butun bir tunga tushadi. Asirning xotirasi — bir tangaga. Qani, ko'raylik, qaysi biri ko'proq yoqarkin».`],
  ['memory', `They chain it with a song. They pour captives' lives into it: weddings, mothers, first snows. Until it falls asleep.|Они сковывают его песней. И вливают в него жизни пленников: свадьбы, матерей, первый снег. Пока оно не засыпает.|Uni qo'shiq bilan kishanlashadi. Ichiga asirlarning umrini quyishadi: to'ylar, onalar, birinchi qor. Toki u uxlab qolguncha.`],
  ['memory', `No treaty. No great spirit kneeling. Just seven men, wiping their hands.|Никакого договора. Никакой великий дух ни перед кем не склоняется. Только семеро мужчин вытирают руки.|Hech qanday ahdnoma yo'q. Hech qanday buyuk ruh tiz cho'kmaydi. Faqat yetti kishi qo'lini artyapti.`],
  ['hero', `The Treaty of the Seven. Every child in Yodgor learns it by heart. ...There never was one.|Договор Семерых. Каждый ребёнок в Ёдгоре учит его наизусть. …А его никогда не было.|Yettilar ahdnomasi. Yodgorda har bir bola uni yod oladi. ...Aslida u hech qachon bo'lmagan.`],
  ['sado', `They fed him people. That's what this city is. A dinner, with houses on top.|Они кормили его людьми. Вот что такое этот город. Ужин, а сверху дома.|Uni odam bilan boqishgan. Bu shahar shu ekan. Ustiga uy qurilgan dasturxon.`],
  ['farrukh', `Charming, isn't it? My great-great-something was one of the seven. I always knew I came from a good family.|Мило, правда? Мой прапра-кто-то-там был одним из семерых. Я всегда знал, что я из приличной семьи.|Yoqimli-a? Katta-katta-allaqaysi bobom o'sha yettovdan biri bo'lgan. Asl xonadondan ekanimni doim bilardim.`]
];

// Sado's lullaby: once per rest; lowers Hollowness if she trusts him
function lullabyAt(words) {
  return done => {
    if ((R().trust || 0) >= 2) {
      play([
        ['sado', `Can I hum something? I don't know where it comes from. It just comes.|Можно, я кое-что напою? Не знаю, откуда оно. Само приходит.|Bir narsa xirgoyi qilsam maylimi? Qayerdan kelishini bilmayman. O'zi kelaveradi.`],
        ['sado', words],
        ['', `Something in you that was fraying lies down and stops pulling.|Что-то в тебе, что расползалось по швам, затихает и больше не тянет.|Ichingda titilib borayotgan nimadir tinchlanib, tortqilashdan to'xtaydi.`]
      ], () => { addVoid(-4, `Sado's lullaby|колыбельная Садо|Sadoning allasi`); done(); });
    } else {
      play([
        ['sado', `I wanted to hum you something. But I don't know you well enough yet. Or you don't know me.|Я хотела тебе кое-что напеть. Но я тебя пока мало знаю. А может, ты меня.|Senga bir narsa xirgoyi qilib bermoqchi edim. Lekin seni hali yaxshi bilmayman. Balki sen meni bilmassan.`]
      ], done);
    }
  };
}
const ALLA_1 = `Alla, alla, the water sleeps. The lamp is low, the gate is shut. Alla...|Алла, алла, спит вода. Лампа гаснет, заперты ворота. Алла…|Alla-yo alla, suv uxladi. Chiroq pasaydi, darvoza yopildi. Alla...`;
const ALLA_2 = `Alla, alla, the moon's in the well. Don't look down, my little one. Alla...|Алла, алла, луна в колодце. Не гляди вниз, маленький мой. Алла…|Alla-yo alla, oy quduqda. Pastga qarama, jonim bolam. Alla...`;
const ALLA_3 = `Alla, alla, the big one sleeps. We tell him tales, he gives us rain. Alla...|Алла, алла, спит большой. Мы ему — сказку, он нам — дождь. Алла…|Alla-yo alla, kattakon uxladi. Biz unga ertak, u bizga yomg'ir. Alla...`;

/* =====================================================================
   PROLOGUE — the Night of Payment
   ===================================================================== */
LAND('p_tail', {
  name: `The Tail at Night|Хвост ночью|Tungi Dum`,
  sub: `The Night of Payment|Ночь Уплаты|To'lov kechasi`,
  start: [
    ['', `The Night of Payment. A lamp in every window. Nobody in the Tail sleeps tonight: they wait at their doors with what they owe.|Ночь Уплаты. В каждом окне лампа. В Хвосте сегодня никто не спит: все ждут у дверей с тем, что должны.|To'lov kechasi. Har derazada chiroq. Bu kecha Dumda hech kim uxlamaydi: hamma qarzini qo'lida tutib, eshigi oldida kutadi.`],
    ['hero', `Six houses. Then the widow Mehri. Then home.|Шесть домов. Потом вдова Мехри. Потом домой.|Oltita uy. Keyin beva Mehri. Keyin uyga.`],
    ['', `Shuffling behind you. The Hollow smell the full tumars in your satchel the way dogs smell bread.|Сзади шаркают шаги. Пустые чуют полные тумары у тебя в сумке, как собаки чуют хлеб.|Orqangda oyoq sudralib kelyapti. Bo'shlar xaltangdagi to'la tumarlarni it nonni sezgandek sezadi.`],
    ['hero', `Not tonight. Go home. ...You don't have homes. Go anyway.|Не сегодня. Ступайте по домам. …Нет у вас домов. Всё равно ступайте.|Bugun emas. Uy-uyingizga boring. ...Uyingiz yo'q-ku. Baribir boring.`]
  ],
  mid: [
    ['', `High on the spine the Cloister bells ring the second watch. Rustam-aka should be at the vault by now.|Высоко на хребте колокола Обители отбивают вторую стражу. Рустам-ака уже должен быть у хранилища.|Tizmaning tepasida Xonaqoh qo'ng'iroqlari tunning ikkinchi pahrini chalyapti. Rustam aka hozir xazinada bo'lishi kerak.`],
    ['hero', `"Business," he said. He never has business. He has routes.|«Дела у меня», — сказал. Не бывает у него дел. У него маршруты.|«Ishim bor», dedi. Uning hech qachon ishi bo'lmaydi. Yo'li bo'ladi, xolos.`]
  ],
  stones: [
    `Twenty years ago the Sleeper turned in his sleep, and half the Tail slid into the sand. The Singers called it the Small Awakening and doubled the Tail's tithe.|Двадцать лет назад Спящий повернулся во сне, и половина Хвоста съехала в песок. Певцы назвали это Малым Пробуждением и удвоили Хвосту десятину.|Yigirma yil oldin Uxlovchi uyqusida ag'darildi va Dumning yarmi qumga sirg'alib tushdi. Xonandalar buni Kichik Uyg'onish deb atadi va Dumning ushrini ikki barobar qildi.`,
    `Carved by a mother: "My son Hamid. He laughed like a door banging in the wind." Underneath, in another hand: "Paid."|Вырезано матерью: «Мой сын Хамид. Смеялся, как дверь хлопает на ветру». Ниже чужой рукой: «Уплачено».|Bir ona o'yib yozgan: «O'g'lim Hamid. Shamolda taraqlagan eshikdek kulardi». Tagida boshqa qo'l bilan: «To'landi».`,
    `The tithe is one strong memory a year. Not the oldest, not the sweetest: the strongest. The Singers tell by the weight.|Десятина — одно сильное воспоминание в год. Не самое давнее и не самое сладкое, а самое сильное. Певцы отличают его на вес.|Ushr — yiliga bitta kuchli xotira. Eng eskisi ham, eng shirini ham emas — eng kuchlisi. Xonandalar uni vaznidan ajratadi.`,
    `"A stranger may stay forty days without paying the tithe. On the forty-first, he pays or leaves." Someone has added: "Or stays, and forgets he was ever a stranger."|«Сорок дней чужак живёт без десятины. На сорок первый платит или уходит». Кто-то приписал: «Или остаётся и забывает, что был чужим».|«Musofir qirq kun ushrsiz yashaydi. Qirq birinchi kuni yo to'laydi, yo ketadi». Kimdir qo'shib yozibdi: «Yo qoladi-yu, musofir bo'lganini unutadi».`
  ],
  memory: {
    id: 'm_snow',
    lines: [
      ['memory', `First snow in the Tail. It never lasts. You're seven, and you're catching it on your tongue.|Первый снег в Хвосте. Он тут никогда долго не лежит. Тебе семь, ты ловишь его языком.|Dumda birinchi qor. U bu yerda hech qachon uzoq turmaydi. Yetti yoshdasan, qorni tiling bilan tutyapsan.`],
      ['memory', `Your mother at the door: "Toychoq! Boots!" You throw a snowball at someone small, and they shriek with laughter.|Мать в дверях: «Тойчок! Сапоги!» Ты кидаешь снежок в кого-то маленького, и тот визжит от смеха.|Onang eshikda: «Toychoq! Etigingni kiy!» Kichkina kimgadir qor otasan, u qiqir-qiqir kulib chinqiradi.`],
      ['memory', `You try to see who it was. Where they stood there's only snow. Clean, as if no one had ever been there.|Пытаешься разглядеть, кто это был. Там, где он стоял, один снег. Чистый, будто там никого и не было.|Kim ekanini ko'rmoqchi bo'lasan. U turgan joyda faqat qor. Top-toza, go'yo u yerda hech kim bo'lmagandek.`],
      ['hero', `Toychoq. Little foal. Nobody's called me that in twenty years.|Тойчок. Жеребёнок. Меня так двадцать лет никто не звал.|Toychoq... Yigirma yildan beri meni hech kim bunday chaqirmagan.`]
    ]
  },
  people: [{ look: 'widow', lamp: true }, { look: 'child', x: 16 }, { look: 'tailwoman', x: 32, lamp: true }, { look: 'hollow', x: 60 }],
  exit(done) {
    play([
      ['', `The widow Mehri waits at her door with a lamp. Her granddaughter hides behind her skirt.|Вдова Мехри ждёт у двери с лампой. За подолом прячется внучка.|Beva Mehri qo'lida chiroq, eshigi oldida kutib turibdi. Etagi ortida nevarasi yashiringan.`],
      ['mehri', `Yodchi. I have it ready. I wrapped it in a clean cloth, like bread.|Ёдчи. У меня всё готово. Завернула в чистую тряпицу, как хлеб.|Yodchi. Tayyorlab qo'yganman. Toza lattaga o'radim, nonni o'ragandek.`],
      ['hero', `Mehri-opa. One strong memory, the book says. Let's see it.|Мехри-опа. По книге с вас одно сильное воспоминание. Показывайте.|Mehri opa. Daftarda — bitta kuchli xotira. Qani, ko'raylik.`],
      ['', `Her fingers tighten on the cloth. She doesn't hold it out.|Пальцы сжимают тряпицу. Протягивать её она не спешит.|Barmoqlari lattani g'ijimlaydi. Uzatishga shoshilmaydi.`],
      ['child', `Grandma, is that the man who takes things away?|Бабушка, это тот дядя, который забирает?|Buvi, narsalarni olib ketadigan amaki shumi?`]
    ], () => hub(`The widow Mehri's tithe|Десятина вдовы Мехри|Beva Mehrining ushri`, [
      { label: `— What's in the cloth?|— Что у вас в тряпице?|— Lattada nima bor?`, lines: [
        ['mehri', `A tumar from the bazaar. Somebody's wedding. It's thin, it's been tasted, but it's a tumar. Please.|Тумар с базара. Чья-то свадьба. Тонкий, его уже пробовали, но это тумар. Прошу вас.|Bozordan olgan tumarim. Kimningdir to'yi. Yupqa, totilgan, lekin baribir tumar-ku. Iltimos.`],
        ['', `The wedding is worn through, like a coin rubbed blank. Someone has tasted it a hundred times.|Свадьба стёрта, как монета, на которой уже не разобрать чекан. Её пробовали раз сто.|To'y yeyilib ketgan, xuddi naqshi ko'rinmay qolgan tangadek. Uni yuz martalab totishgan.`],
        ['hero', `A fake, near enough. The Singers won't notice. They never do. Half the tithe looks like this now.|Считай, подделка. Певцы не заметят. Они никогда не замечают. Половина десятины теперь такая.|Qalbakining o'zi. Xonandalar sezmaydi. Hech qachon sezishmaydi. Ushrning yarmi hozir shunaqa.`],
        ['hero', `And the Well gets hungrier every year. Maybe this is why. Not my business. The book only counts tumars.|А Колодец с каждым годом всё голоднее. Может, как раз поэтому. Не моё дело. Книга считает только тумары.|Quduq esa yildan-yilga ochroq. Balki shuning uchundir. Mening ishim emas. Daftar faqat tumar sanaydi.`]
      ] },
      { label: `— What's your strongest memory?|— А самое сильное у вас что?|— Eng kuchli xotirangiz qaysi?`, lines: [
        ['mehri', `My son. Anvar. The day he learned to swim in the karez. It's the only strong thing I have left. The rest of me is thin.|Сын. Анвар. День, когда он научился плавать в кяризе. Больше ничего сильного у меня не осталось. Остальное всё тонкое.|O'g'lim. Anvar. Korizda suzishni o'rgangan kuni. Menda qolgan kuchli narsa shu. Qolgani yupqa.`],
        ['mehri', `A year later he drowned in that same karez. Take the day he swam, and I'll only have the day he didn't.|Через год он утонул в том же кяризе. Заберёте день, когда он поплыл, — останется только день, когда не выплыл.|Bir yildan keyin o'sha korizda cho'kib ketdi. Suzgan kunini olsangiz, menda faqat suzolmagan kuni qoladi.`]
      ] },
      { label: `— And if I just write "paid" and take nothing?|— А если я просто напишу «уплачено» и ничего не возьму?|— Shunchaki «to'landi» deb yozib, hech narsa olmasam-chi?`, lines: [
        ['mehri', `If they find out, they'll take more than a memory from you, son. And from me.|Если прознают, у вас заберут не одно воспоминание, сынок. И у меня тоже.|Bilib qolishsa, bitta xotira bilan qutulolmaysiz, bolam. Men ham.`],
        ['hero', `And the Well goes one tithe short.|И Колодец недосчитается одной десятины.|Quduq esa bitta ushrga kam oladi.`]
      ] }
    ], [
      { k: 'force', label: `Hum the Take and sing her son out of her. The book is the book.|Напеть Взятие и забрать у неё сына. Книга есть книга.|Olish kuyini aytib, o'g'lining xotirasini sug'urib olish. Daftar — daftar.` },
      { k: 'fake', label: `Take the worn wedding. Nobody checks.|Взять стёртую свадьбу. Всё равно никто не проверяет.|Yeyilgan to'yni olish. Baribir hech kim tekshirmaydi.` },
      { k: 'paid', label: `Pay her tithe with one of your own memories.|Заплатить за неё своим воспоминанием.|Uning ushrini o'z xotirang bilan to'lash.`, cost: 15 },
      { k: 'written', label: `Write "paid" in the book and take nothing.|Написать в книге «уплачено» и ничего не брать.|Daftarga «to'landi» deb yozib, hech narsa olmaslik.` }
    ], o => {
      setF('widow', o.k);
      let lines;
      if (o.k === 'force') {
        rep('tail', -2); rep('singers', 1, true); trust(-1); addVoid(3, CRUEL);
        lines = [
          ['', `You hum the Take. The memory comes out of her like a splinter, into the tumar, and lies warm in your palm.|Ты напеваешь Взятие. Память выходит из неё, как заноза, переходит в тумар и тёплой ложится тебе в ладонь.|Olish kuyini xirgoyi qilasan. Xotira undan zirapchadek chiqib, tumarga o'tadi va kaftingda iliq bo'lib yotadi.`],
          ['mehri', `...Did I have a son? Child, did I have a son?|…У меня был сын? Детка, у меня был сын?|...Mening o'g'lim bormidi? Bolam, o'g'lim bormidi?`],
          ['', `The girl doesn't know what to say. Neither do you. You write: "Paid."|Девочка не знает, что ответить. Ты тоже. Ты пишешь: «Уплачено».|Qizcha nima deyishini bilmaydi. Sen ham. Yozasan: «To'landi».`],
          ['', `Full weight. For once the Well gets a real tithe from row four.|Полный вес. Впервые за долгое время Колодец получит с четвёртого ряда настоящую десятину.|To'liq vazn. Ko'pdan beri birinchi marta Quduq to'rtinchi qatordan chin ushr oladi.`]
        ];
      } else if (o.k === 'fake') {
        rep('tail', 1); trust(1);
        lines = [
          ['', `You take the worn wedding and drop it in your satchel. It weighs almost nothing.|Ты берёшь стёртую свадьбу и бросаешь в сумку. Она почти ничего не весит.|Yeyilgan to'yni olib, xaltangga tashlaysan. Og'irligi deyarli yo'q.`],
          ['mehri', `God keep you, yodchi. Anvar says thank you. He's in here. He says thank you.|Храни вас Бог, ёдчи. Анвар говорит спасибо. Он вот тут, во мне. Говорит спасибо.|Xudo yorlaqasin, yodchi. Anvar rahmat deyapti. U shu yerda, ichimda. Rahmat deyapti.`],
          ['', `Somewhere under the street, something will chew on it tonight and stay hungry.|Где-то под мостовой этой ночью кто-то будет жевать её — и останется голодным.|Ko'cha tagida qayerdadir bu kecha kimdir uni chaynaydi — va och qolaveradi.`]
        ];
      } else if (o.k === 'paid') {
        rep('tail', 2); trust(2); addVoid(15, OWN_WHY);
        lines = [
          ['hero', `Keep your son. The book wants one strong memory. It doesn't say whose.|Оставьте сына себе. Книге нужно одно сильное воспоминание. Чьё — там не сказано.|O'g'lingiz o'zingizda qolsin. Daftarga bitta kuchli xotira kerak. Kimniki ekani yozilmagan.`],
          ['', `You sing your first payday into the tumar: Rustam-aka buying you plov and calling you a man. It goes out like a lamp.|Ты поёшь в тумар день первой получки: Рустам-ака угощает тебя пловом и называет мужчиной. Воспоминание гаснет, как лампа.|Tumarga birinchi haq olgan kuningni kuylaysan: Rustam aka senga palov olib berib, «Yigit bo'lib qolibsan» deydi. Xotira chiroqdek o'chadi.`],
          ['mehri', `Why would you... You don't even know us.|Зачем вы… Вы же нас даже не знаете.|Nega endi siz... Bizni tanimaysiz ham-ku.`],
          ['hero', `I know the book.|Я знаю книгу.|Daftarni bilaman.`]
        ];
      } else {
        rep('tail', 1); rep('singers', -1, true); trust(1);
        lines = [
          ['', `You write: "Mehri, row four. Paid." Same ink as always.|Ты пишешь: «Мехри, четвёртый ряд. Уплачено». Чернила те же, что всегда.|Yozasan: «Mehri, to'rtinchi qator. To'landi». Siyoh o'sha-o'sha.`],
          ['hero', `Count twice, write once, Rustam says. A tithe can be counted twice. It can also be counted never.|«Считай дважды, пиши один раз», — говорит Рустам. Десятину можно посчитать дважды. А можно ни разу.|«Ikki marta sana, bir marta yoz», deydi Rustam. Ushrni ikki marta sanasa bo'ladi. Bir marta ham sanamasa bo'ladi.`],
          ['mehri', `I won't forget this, son. Whatever they do to you.|Я этого не забуду, сынок. Что бы с вами ни сделали.|Buni unutmayman, bolam. Sizni nima qilishsa ham.`]
        ];
      }
      play(lines.concat([
        ['', `The ground lurches. Every lamp in the Tail swings at once, and somewhere a wall sighs and lies down.|Земля вздрагивает. Все лампы Хвоста разом качаются, и где-то стена со вздохом ложится на землю.|Yer silkinadi. Dumdagi hamma chiroqlar birdan chayqaladi, qayerdadir bir devor uh tortib yotib qoladi.`, () => { shake(0.7); sfx('stomp'); }],
        ['crowd', `The Sleeper! He's turning over!|Спящий! Ворочается!|Uxlovchi! Ag'darilyapti!`],
        ['', `Then bells. Not the watch: the alarm. It's coming from the Cloister. From the vault.|Потом колокола. Не стража — набат. Звон идёт от Обители. От хранилища.|Keyin qo'ng'iroqlar. Pahr emas — xatar qo'ng'irog'i. Ovoz Xonaqoh tomondan kelyapti. Xazinadan.`],
        ['hero', `The vault. Rustam-aka went to the vault.|Хранилище. Рустам-ака пошёл в хранилище.|Xazina. Rustam aka xazinaga ketgan edi.`]
      ]), done);
    }));
  }
});

BOSS('glutton', {
  name: `The Glutton|Обжора|Ochko'z`,
  title: `What the Hollow became at the vault|Во что Пустые превратились у хранилища|Xazina oldida Bo'shlar nimaga aylandi`,
  quote: `"Mine. Mine. Whose?"|«Моё. Моё. Чьё?»|«Meniki. Meniki. Kimniki?»`,
  lair: `The Singers' Vault|Хранилище Певцов|Xonandalar xazinasi`,
  lairSub: `The door stands open|Дверь нараспашку|Eshik lang ochiq`,
  pre: [
    ['', `The vault door hangs open. Tumars everywhere, cracked, leaking light like broken eggs.|Дверь хранилища распахнута. Повсюду треснувшие тумары, и из них, как из битых яиц, течёт свет.|Xazina eshigi lang ochiq. Hamma yoqda yorilgan tumarlar, ulardan singan tuxumdek nur oqyapti.`],
    ['', `The Hollow came for them and ate. Now there aren't several of them. There's one.|Пустые пришли на этот свет и наелись. Теперь их не несколько. Теперь он один.|Bo'shlar shu nurga kelib, to'yib yeyishdi. Endi ular bir nechta emas. Endi u bitta.`],
    ['boss', `I married her in spring. I married her in spring. I married... whose wedding was it?|Я женился на ней весной. Я женился на ней весной. Я женился… а чья это была свадьба?|Men unga bahorda uylandim. Bahorda uylandim. Men... bu kimning to'yi edi o'zi?`],
    ['hero', `Not yours. Not any of yours.|Не твоя. Ни у кого из вас её не было.|Sizniki emas. Hech biringizniki emas.`]
  ],
  again: [
    `Mine. Mine. Give it back, it's mine.|Моё. Моё. Отдай, это моё.|Meniki. Meniki. Qaytar, u meniki.`,
    `I remember the sea. I've never seen the sea.|Я помню море. Я никогда не видел моря.|Men dengizni eslayman. Men hech qachon dengiz ko'rmaganman.`,
    `So many weddings. So many funerals. I'm so full. Why am I hungry?|Столько свадеб. Столько похорон. Я так наелся. Почему я голоден?|Shuncha to'y. Shuncha janoza. Qornim to'q. Nega ochman?`
  ],
  post(done) {
    play([
      ['', `The thing comes apart into people. Some of them are breathing. None of them look up.|Тварь распадается на людей. Некоторые дышат. Никто не поднимает головы.|Maxluq odamlarga bo'linib ketadi. Ba'zilari nafas olyapti. Hech biri bosh ko'tarmaydi.`],
      ['', `At the vault door sits Rustam-aka, back to the wall, polishing the buckle of his satchel.|У двери хранилища сидит Рустам-ака, привалившись к стене, и начищает пряжку на сумке.|Xazina eshigi oldida Rustam aka devorga suyanib o'tirib, xaltasining to'qasini artyapti.`],
      ['hero', `Rustam-aka! Get up. What happened here?|Рустам-ака! Вставайте. Что здесь было?|Rustam aka! Turing. Bu yerda nima bo'ldi?`],
      ['rustam', `Tail, row nine. Counted. Counted twice. Write it once.|Хвост, девятый ряд. Посчитано. Посчитано дважды. Записать один раз.|Dum, to'qqizinchi qator. Sanaldi. Ikki marta sanaldi. Bir marta yoziladi.`],
      ['', `His eyes are clean as washed bowls. He's Hollow. In one night someone sang everything out of him.|Глаза у него чистые, как вымытые пиалы. Он Пустой. Кто-то за одну ночь выпел из него всё.|Ko'zlari yuvilgan piyoladek top-toza. U Bo'sh. Kimdir bir kechada uning ichidagi hamma narsani kuylab olgan.`],
      ['hero', `Who did this to you?|Кто это с вами сделал?|Sizni kim bu ahvolga soldi?`],
      ['rustam', `Tea's getting cold. The boy should eat.|Чай стынет. Мальчику надо поесть.|Choy sovuyapti. Bola ovqatlansin.`],
      ['', `Lamps. White hats. The Singers of the Well come down the steps, and with them the woman whose voice you've heard from the Cloister all your life.|Лампы. Белые шапки. По ступеням спускаются Певцы Колодца, а с ними женщина, чей голос ты всю жизнь слышал из Обители.|Chiroqlar. Oq qalpoqlar. Zinadan Quduq Xonandalari tushib kelyapti, ular bilan umr bo'yi Xonaqohdan ovozini eshitib kelgan ayol.`],
      ['shirin', `The founders' tumars are gone. All seven. Three hundred years in this vault, and gone in one night.|Тумаров основателей нет. Всех семи. Триста лет пролежали в этом хранилище — и за одну ночь пропали.|Asoschilarning tumarlari yo'q. Yettalasi ham. Uch yuz yil shu xazinada yotdi — bir kechada g'oyib bo'ldi.`],
      ['shirin', `The keys were Rustam's. Rustam was yours, yodchi. Or you were his. It comes to the same thing.|Ключи были у Рустама. Рустам был твой, ёдчи. Или ты его. Какая разница.|Kalitlar Rustamda edi. Rustam sening odaming edi, yodchi. Yoki sen uning odami. Farqi yo'q.`],
      () => (F().widow ? ['hero', `I was in the Tail all night, collecting. Ask the widow Mehri.|Я всю ночь был в Хвосте, собирал десятину. Спросите вдову Мехри.|Men tun bo'yi Dumda ushr yig'dim. Beva Mehridan so'rang.`] : null),
      ['shirin', `I won't ask her anything. The Sleeper turned tonight. Do you know what happens if he wakes up hungry?|Никого я спрашивать не стану. Спящий сегодня повернулся. Ты знаешь, что будет, если он проснётся голодным?|Hech kimdan hech narsa so'ramayman. Bu kecha Uxlovchi ag'darildi. Och uyg'onsa nima bo'lishini bilasanmi?`],
      ['shirin', `Twenty years ago he only rolled over. The sand took my daughter. And half the Tail with her.|Двадцать лет назад он всего лишь перевернулся. Песок забрал мою дочь. И с ней пол-Хвоста.|Yigirma yil oldin u bor-yo'g'i ag'darilgan edi. Qum qizimni yutdi. U bilan birga Dumning yarmini ham.`]
    ], () => hub(`Ustoz Shirin is waiting|Устоз Ширин ждёт|Ustoz Shirin kutyapti`, [
      { label: `— What exactly are the founders' tumars?|— А что это за тумары основателей?|— Asoschilarning tumarlari o'zi nima?`, lines: [
        ['shirin', `The memories of the Seven who founded Yodgor. Their oath is in them: the song that keeps the Sleeper asleep.|Память Семерых, что основали Ёдгор. В ней их клятва — песня, на которой держится сон Спящего.|Yodgorni qurgan Yettovning xotirasi. Ularda qasamlari bor — Uxlovchini uxlatib turgan qo'shiq.`],
        ['shirin', `Whoever holds them holds the city. In the wrong hands they can wake him. Or sell him.|У кого они, у того и город. В дурных руках ими можно его разбудить. Или продать.|Ular kimda bo'lsa, shahar o'shaning qo'lida. Yomon qo'lda ular bilan uni uyg'otish mumkin. Yoki sotish.`]
      ] },
      { label: `— What happened to Rustam?|— Что с Рустамом?|— Rustamga nima bo'ldi?`, lines: [
        ['shirin', `Someone sang him empty in a single night. That takes skill, and time. He let them get very close.|Кто-то выпел его досуха за одну ночь. Для этого нужно умение. И время. Он подпустил этого человека очень близко.|Kimdir uni bir kechada kuylab bo'shatgan. Buning uchun mahorat kerak. Vaqt ham. U o'sha odamni juda yaqin qo'ygan.`],
        ['hero', `He'd never hand over the keys.|Ключи он бы никому не отдал.|U kalitlarni hech kimga bermasdi.`],
        ['shirin', `Then he handed them over without knowing. Or knowing very well. Either way, you'll find out which.|Значит, отдал, сам того не зная. Или прекрасно зная. Как оно было — выяснишь ты.|Demak, o'zi bilmay berib qo'ygan. Yoki juda yaxshi bilib turib. Qanday bo'lganini sen aniqlaysan.`]
      ] },
      { label: `— Why me?|— Почему я?|— Nega men?`, lines: [
        ['shirin', `Because you know his routes, his friends, his debts. Whoever he opened the door to, you'll find them faster than my Singers.|Потому что ты знаешь его маршруты, его друзей, его долги. Кому бы он ни открыл дверь, ты найдёшь их быстрее моих Певцов.|Chunki sen uning yo'lini, oshnalarini, qarzlarini bilasan. U eshikni kimga ochgan bo'lsa ham, ularni mening Xonandalarimdan tezroq topasan.`]
      ] }
    ], [
      { k: 'find', label: `"I'll find them. Let me go."|«Я их найду. Отпустите меня.»|«Ularni topaman. Meni qo'yib yuboring.»` },
      { k: 'look', label: `"Look at him. Who'd do this to an old man?"|«Посмотрите на него. Кто мог такое сделать со стариком?»|«Unga qarang. Qaysi odam cholni bu ahvolga soladi?»` },
      { k: 'count', label: `Say nothing. Count the Singers.|Промолчать. Пересчитать Певцов.|Indamaslik. Xonandalarni sanab chiqish.` }
    ], o => {
      let first;
      if (o.k === 'find') { rep('singers', 1); first = [['shirin', `Yes. You will.|Да. Найдёшь.|Ha. Topasan.`]]; }
      else if (o.k === 'look') first = [['shirin', `Someone he trusted. It usually is.|Тот, кому он доверял. Обычно так и бывает.|U ishongan kimdir. Odatda shunaqa bo'ladi.`]];
      else first = [['hero', `Eleven. Two with knives under their robes. One with a cold.|Одиннадцать. У двоих под халатами ножи. Один простужен.|O'n bitta. Ikkitasining to'ni tagida pichoq. Bittasi shamollagan.`]];
      play(first.concat([
        ['shirin', `You'll find them. Not because you're honest. Because I'll make it the only way you stay yourself.|Ты их найдёшь. Не потому, что честный. А потому, что я не оставлю тебе другого способа остаться собой.|Ularni topasan. Halolliging uchun emas. O'zing bo'lib qolishning boshqa yo'lini qoldirmaganim uchun.`],
        ['shirin', `This is the Pledge Song. Every night until the new moon it will take a little of you: one memory, then another.|Это Песня залога. Каждую ночь до новолуния она будет брать у тебя понемногу: одно воспоминание, потом другое.|Bu — Garov qo'shig'i. Yangi oygacha har kecha u sendan ozdan-ozdan oladi: bitta xotira, keyin yana bittasi.`],
        ['shirin', `You have twenty-nine nights. Bring me all seven tumars and I'll stop it. Fail, and you'll sit by a door next to your teacher, polishing a buckle.|У тебя двадцать девять ночей. Принесёшь мне все семь тумаров — я её остановлю. Не принесёшь — будешь сидеть у двери рядом с учителем и чистить пряжку.|Senda yigirma to'qqiz kecha bor. Yettala tumarni olib kelsang, uni to'xtataman. Olib kelmasang, ustozing yonida eshik tagida o'tirib, to'qa artasan.`],
        ['', `She sings. Her voice is beautiful. It goes in through your ears and keeps going, down, to the place where you keep yourself.|Она поёт. Голос у неё прекрасный. Он входит в уши и уходит всё глубже — туда, где ты хранишь себя.|U kuylaydi. Ovozi go'zal. Quloqlaringdan kirib, chuqurroq — o'zingni saqlaydigan joygacha boradi.`],
        ['', `Something in there tears like old cloth. Then darkness.|Там что-то рвётся, как ветхая ткань. Потом темнота.|U yerda nimadir eski bo'zdek yirtiladi. Keyin qorong'ilik.`],
        ['voice', `Is it dark? Please don't let it be dark.|Темно? Пожалуйста, только не темно.|Qorong'imi? Iltimos, qorong'i bo'lmasin.`, () => { setF('sado', 1); }],
        ['hero', `Who's there?|Кто здесь?|Kim bor?`],
        ['voice', `I don't know. I was asleep. Somebody was singing, and it hurt, and now I'm here. Where is "here"?|Не знаю. Я спала. Кто-то пел, было больно, и вот я здесь. А «здесь» — это где?|Bilmayman. Uxlab yotgandim. Kimdir kuyladi, og'ridi, endi shu yerdaman. «Shu yer» o'zi qayer?`],
        ['hero', `In my head, it seems.|Похоже, у меня в голове.|Boshimning ichida, shekilli.`],
        ['voice', `Oh. It's very messy in here.|Ой. Ну у тебя тут и беспорядок.|Voy. Bu yer rosa betartib ekan-ku.`],
        ['voice', `Please, is there a light? I don't like it when there's no light.|Пожалуйста, тут есть свет? Я не люблю, когда нет света.|Iltimos, chiroq bormi? Yorug' bo'lmasa, yoqtirmayman.`]
      ]), () => ask(`The voice in the dark|Голос в темноте|Qorong'ilikdagi ovoz`, [
        { k: 'kind', label: `"It's all right. Open your eyes. Mine, I mean."|«Тихо, тихо. Открой глаза. Мои, в смысле.»|«Qo'rqma. Ko'zingni och. Ya'ni meniki.»` },
        { k: 'name', label: `"Who are you? What's your name?"|«Ты кто? Как тебя зовут?»|«Sen kimsan? Isming nima?»` },
        { k: 'cold', label: `"Get out of my head."|«Убирайся из моей головы.»|«Boshimdan chiqib ket.»` }
      ], v => {
        let reply;
        if (v.k === 'kind') {
          trust(2);
          reply = [
            ['', `You open your eyes. Lamps, white hats, the vault. Light.|Ты открываешь глаза. Лампы, белые шапки, хранилище. Свет.|Ko'zingni ochasan. Chiroqlar, oq qalpoqlar, xazina. Yorug'.`],
            ['voice', `...Oh. Lamps. Thank you. Thank you.|…Ой. Лампы. Спасибо. Спасибо тебе.|...Voy. Chiroqlar. Rahmat. Rahmat senga.`],
            ['voice', `I don't know my name. Isn't that strange? I know the word for apricot, but not my own name.|Я не знаю, как меня зовут. Странно, да? Слово «абрикос» знаю, а своё имя — нет.|Ismimni bilmayman. G'alati-a? «O'rik» degan so'zni bilaman-u, o'z ismimni bilmayman.`]
          ];
        } else if (v.k === 'name') {
          trust(1);
          reply = [
            ['voice', `I... don't know. Isn't that strange? I know the word for apricot, but not my own name.|Я… не знаю. Странно, да? Слово «абрикос» знаю, а своё имя — нет.|Men... bilmayman. G'alati-a? «O'rik» degan so'zni bilaman-u, o'z ismimni bilmayman.`]
          ];
        } else {
          trust(-1);
          reply = [
            ['voice', `I would, if I knew the way. I don't. It's dark, and you're the only door.|Ушла бы, если б знала куда. А я не знаю. Тут темно, и ты — единственная дверь.|Yo'lini bilsam, ketardim. Bilmayman. Qorong'i, sen esa yagona eshiksan.`],
            ['voice', `I don't even know my name. Only the word for apricot. You can't get far on that.|Я даже имени своего не знаю. Только слово «абрикос». С этим далеко не уйдёшь.|Hatto ismimni ham bilmayman. Faqat «o'rik» degan so'zni. U bilan uzoqqa borib bo'lmaydi.`]
          ];
        }
        play(reply.concat([
          ['hero', `Then I'll call you Sado. An echo. What answers when you shout into a well.|Тогда буду звать тебя Садо. Эхо. То, что отвечает, когда кричишь в колодец.|Unda seni Sado deb chaqiraman. Aks-sado. Quduqqa qichqirsang, javob qaytaradigan narsa.`],
          ['sado', `Sado. ...Yes. I'll be Sado until I find out who I am.|Садо. …Да. Буду Садо, пока не узнаю, кто я.|Sado. ...Mayli. Kimligimni bilgunimcha Sado bo'lib turaman.`],
          ['sado', `Ravshan? What did that woman do to you? Your heart is so loud.|Равшан? Что эта женщина с тобой сделала? У тебя сердце так колотится.|Ravshan? U ayol senga nima qildi? Yuraging gursillab uryapti.`],
          ['hero', `She put a song in me. Every night it'll eat a piece of me. By the new moon there'll be nothing left. I'll be like Rustam.|Она вложила в меня песню. Каждую ночь песня будет отъедать от меня по куску. К новолунию ничего не останется. Стану как Рустам.|U ichimga qo'shiq solib qo'ydi. Qo'shiq har kecha mendan bir burda uzib yeydi. Yangi oyga borib hech narsam qolmaydi. Rustamdek bo'lib qolaman.`],
          ['sado', `Unless you find seven tumars. I heard her. Do you know where they are?|Если только не найдёшь семь тумаров. Я слышала. Ты знаешь, где они?|Yettita tumarni topmasang. Eshitdim. Qayerdaligini bilasanmi?`],
          ['hero', `No. But the thief had Rustam's keys, so the thief knew Rustam. We start with him.|Нет. Но у вора были ключи Рустама — значит, вор знал Рустама. С него и начнём.|Yo'q. Lekin o'g'rida Rustamning kalitlari bo'lgan — demak, o'g'ri Rustamni tanigan. Undan boshlaymiz.`],
          ['sado', `Twenty-nine nights. Seven tumars. All right. I can count too.|Двадцать девять ночей. Семь тумаров. Ладно. Я тоже умею считать.|Yigirma to'qqiz kecha. Yettita tumar. Mayli. Men ham sanashni bilaman.`]
        ]), done);
      }));
    }));
  }
});

/* =====================================================================
   ACT I — the City
   ===================================================================== */
REST('r_plane', {
  name: `Chaikhana of the Two Plane Trees|Чайхана у двух чинар|Ikki chinor choyxonasi`,
  sub: `Dawn after the Night of Payment|Рассвет после Ночи Уплаты|To'lov kechasidan keyingi tong`,
  arrive(done) {
    play([
      ['', `Dawn. Two plane trees older than the Divan, and under them the chaikhana where every yodchi drinks tea after his round.|Рассвет. Две чинары, которые старше Дивана, а под ними чайхана, где всякий ёдчи пьёт чай после обхода.|Tong. Devondan ham qari ikki chinor, tagida esa har bir yodchi aylanishdan keyin choy ichadigan choyxona.`],
      ['sado', `Trees! Two of them! Are they always this big, or am I just small?|Деревья! Целых два! Они всегда такие огромные, или это я маленькая?|Daraxtlar! Ikkita! Ular doim shunaqa kattami yo men kichkinamanmi?`],
      ['hero', `They're always this big.|Всегда такие.|Doim shunaqa.`],
      ['', `In the corner, on his usual cushion, sits Rustam-aka. He walked here on his own. The Hollow keep their habits.|В углу, на своей обычной курпаче, сидит Рустам-ака. Пришёл сам. Пустые не бросают привычек.|Burchakda, odatdagi ko'rpachasida Rustam aka o'tiribdi. O'zi kelgan. Bo'shlar odatini tashlamaydi.`],
      ['sado', `The old man from the door. He's pouring tea for someone who isn't there.|Старик, который сидел у двери. Наливает чай тому, кого здесь нет.|Eshik oldidagi chol-ku. Yo'q odamga choy quyyapti.`],
      ['hero', `For me. He always poured mine first.|Мне. Он всегда наливал мне первому.|Menga. U doim avval menga quyardi.`],
      ['sado', `So where do we start? You said with him.|Ну и с чего начнём? Ты сказал — с него.|Xo'sh, nimadan boshlaymiz? Undan, degan eding.`],
      ['hero', `He's Hollow, but his memories are still in him, deep down. With the Taste I can see what he saw.|Он Пустой, но память в нём ещё есть, глубоко. Пробой я могу увидеть то, что видел он.|U Bo'sh, lekin xotirasi hali ichida, chuqurda. Totish bilan u ko'rganni ko'ra olaman.`],
      ['hero', `And there's Farrukh by the samovar. Sells stolen joys, buys gossip. Someone must have seen the thief.|А у самовара Фаррух. Продаёт краденые радости, скупает сплетни. Кто-то же видел вора.|Samovar yonida esa Farrux. O'g'irlangan shodlik sotadi, mish-mish sotib oladi. O'g'rini kimdir ko'rgan bo'lishi kerak.`],
      ['sado', `And when you fell back there, in the vault, something went missing. I felt it. The song bites every time you fall.|А когда ты упал там, в хранилище, что-то пропало. Я почувствовала. Песня кусает каждый раз, как ты падаешь.|Xazinada yiqilganingda nimadir yo'qoldi. Sezdim. Har yiqilganingda qo'shiq tishlab oladi.`],
      ['hero', `Then I'd better not fall.|Значит, не надо падать.|Unda yiqilmaganim ma'qul.`]
    ], done);
  },
  rustam: rustamAt(1),
  turab(done) {
    if (!once('turab:r_plane')) { play([['mute', `(He nods to you and goes on tuning his dutar.)|(Он кивает тебе и снова берётся настраивать дутар.)|(U senga bosh irg'aydi-da, dutorini sozlashda davom etadi.)`]], done); return; }
    play([
      ['', `The old bakhshi by the samovar has a dutar and no voice. A white scar runs across his throat like a seam.|У старого бахши у самовара есть дутар, а голоса нет. Поперёк горла белый шрам, как шов.|Samovar yonidagi keksa baxshining dutori bor, ovozi yo'q. Tomog'ida chokdek oq chandiq.`],
      ['', `He dips a finger in spilled tea and draws: a long curled body, asleep. Beside it, a tiny man with his mouth open.|Он макает палец в пролитый чай и рисует: длинное тело свернулось и спит. Рядом крошечный человечек с открытым ртом.|U barmog'ini to'kilgan choyga botirib chizadi: uzun, buralib uxlayotgan tana. Yonida og'zi ochiq mitti odamcha.`]
    ], () => hub(`Turab the bakhshi|Тураб-бахши|Turob baxshi`, [
      { label: `— Sado, what's he drawing?|— Садо, что он рисует?|— Sado, u nima chizyapti?`, lines: [
        ['sado', `The long thing is the Sleeper. The tiny man is singing to him. Now he's pointing at the tiny man... and at himself.|Длинное — это Спящий. Человечек ему поёт. А теперь он показывает на человечка… и на себя.|Uzuni — Uxlovchi. Mitti odamcha unga kuylayapti. Endi u odamchani... keyin o'zini ko'rsatyapti.`],
        ['', `He draws one finger across his throat.|Он проводит пальцем поперёк горла.|U barmog'ini tomog'idan ko'ndalang tortadi.`],
        ['sado', `He used to sing to the Sleeper. And somebody cut the song out of him.|Он пел Спящему. А кто-то вырезал из него песню.|U Uxlovchiga kuylardi. Kimdir esa qo'shiqni uning ichidan kesib olgan.`]
      ] },
      { label: `— Turab-aka. I know him.|— Тураб-ака. Я его знаю.|— Turob aka. Men uni taniyman.`, lines: [
        ['sado', `You know him? Who is he?|Знаешь? А кто он?|Taniysanmi? U kim?`],
        ['hero', `Turab. A bakhshi, a teller of the old dastans. The Singers ordered him to sing the tithe. He refused, so they took his voice.|Тураб. Бахши, сказитель старых дастанов. Певцы велели ему петь десятину. Он отказался — и у него забрали голос.|Turob. Baxshi, eski dostonlarni aytadi. Xonandalar unga ushr kuylashni buyurdi. U ko'nmadi — ovozini olib qo'yishdi.`],
        ['sado', `Took it where?|Куда забрали?|Qayerga olib qo'yishdi?`],
        ['hero', `Into a tumar. Somebody owns it now. Everyone knows. Nobody says.|В тумар. Теперь он у кого-то лежит. Все знают. Все молчат.|Tumarga. Endi u kimningdir qo'lida. Hamma biladi. Hamma jim.`]
      ] }
    ], [
      { k: 'listen', label: `Nod. Let him play.|Кивнуть: пусть играет.|Bosh irg'ash: chalaversin.` }
    ], () => play([
      ['', `Turab nods and lifts his dutar. He can still play. He plays like a man explaining something to a child.|Тураб кивает и берёт дутар. Играть он ещё может. Играет так, будто что-то объясняет ребёнку.|Turob bosh irg'ab, dutorni qo'liga oladi. Chalishga hali qurbi yetadi. Bolaga nimanidir tushuntirayotgandek chaladi.`]
    ], done)));
  },
  farrukh: farrukhAt('r_plane', {
    first: [
      ['farrukh', `Ravshan the yodchi, having tea with his Hollow teacher at dawn. Either you're very loyal or very suspected.|Ёдчи Равшан на рассвете пьёт чай со своим Пустым учителем. Ты либо очень верный, либо очень подозреваемый.|Yodchi Ravshan tong saharda Bo'sh ustozi bilan choy ichib o'tiribdi. Yo juda sodiqsan, yo sendan juda shubha qilishyapti.`],
      ['hero', `Both. Hello, Farrukh.|И то и другое. Здравствуй, Фаррух.|Ikkalasi ham. Salom, Farrux.`],
      ['farrukh', `Disowned son of the House of Saffron, dealer in small joys. Somebody's first kiss, barely worn? A sunny day from a better year?|Изгнанный сын дома Шафрана, торговец мелкими радостями. Чей-то первый поцелуй, почти не ношенный? Солнечный денёк из года получше?|Za'faron xonadonining quvilgan o'g'li, mayda shodliklar savdogari. Kimningdir birinchi o'pichi, deyarli ishlatilmagan? Yaxshiroq yildan bir quyoshli kun?`],
      ['', `He opens a lacquered box. Tumars in rows, each sealed with yellow wax.|Он открывает лаковую шкатулку. Тумары рядами, каждый запечатан жёлтым воском.|U laklangan qutini ochadi. Qator-qator tumarlar, har biri sariq mum bilan muhrlangan.`],
      ['sado', `Ugh. That smell. Wax. I hate it. Close it, close it!|Фу. Этот запах. Воск. Ненавижу. Закрой, закрой!|Fu. Bu hid. Mum. Yomon ko'raman. Yop, yop!`],
      ['hero', `What's wrong with wax?|Чем тебе воск не угодил?|Mumning nimasi yomon?`],
      ['sado', `I don't know. It smells like a door closing.|Не знаю. Так пахнет, когда закрывается дверь.|Bilmayman. Undan yopilayotgan eshikning hidi keladi.`]
    ],
    info: {
      label: `Slide him a few tilla: "Who went into the vault last night?"|Подвинуть ему пару тилл: «Кто ночью ходил в хранилище?»|Unga bir necha tilla surib qo'yish: «Kecha xazinaga kim kirdi?»`,
      lines: [
        ['farrukh', `A woman with a lamp, before the bells. Hood up. She was humming as she walked.|Женщина с лампой, ещё до колоколов. В капюшоне. Шла и что-то напевала.|Qo'ng'iroqdan oldin chiroqli bir ayol. Boshida yopinchiq. Yo'l-yo'lakay xirgoyi qilib borardi.`],
        ['farrukh', `People who hum on a job are either mad or very sure of themselves. The door wasn't forced. She had a key. That's all I know, and I wish I didn't.|Кто на деле напевает, тот либо безумен, либо очень в себе уверен. Дверь не ломали. У неё был ключ. Больше я ничего не знаю — и этого знать не хотел бы.|Ish ustida xirgoyi qiladigan odam yo telba, yo o'ziga juda ishongan bo'ladi. Eshik buzilmagan. Unda kalit bor edi. Bilganim shu, shuni ham bilmasam yaxshi edi.`],
        ['sado', `A woman with Rustam's key. So he gave it to her. Or she took it from him.|Женщина с ключом Рустама. Значит, он сам его отдал. Или она забрала.|Rustamning kaliti bilan bir ayol. Demak, kalitni o'zi bergan. Yoki ayol tortib olgan.`]
      ],
      know: `A hooded woman went into the vault before the bells. She had a key.|До колоколов в хранилище вошла женщина в капюшоне. У неё был ключ.|Qo'ng'iroqdan oldin xazinaga yopinchiqli ayol kirgan. Unda kalit bo'lgan.`
    }
  }),
  lullaby: lullabyAt(ALLA_1)
});
BARKS['r_plane:start'] = [
  `The tea smells of smoke and mint. I can smell through you. I hope you don't mind.|Чай пахнет дымом и мятой. Я чувствую запахи через тебя. Ты ведь не против?|Choydan tutun va yalpiz hidi kelyapti. Hidni sen orqali sezaman. Qarshi emassan-a?`
];

LAND('a1_tail', {
  name: `The Tail, the Morning After|Хвост наутро|Dum, ertasi tong`,
  sub: `Where the tremor struck hardest|Там, где тряхнуло сильнее всего|Silkinish eng qattiq bo'lgan joy`,
  start: [
    ['', `Morning in the Tail. Last night's tremor has tilted whole streets toward the sand.|Утро в Хвосте. Ночной толчок накренил целые улицы к пескам.|Dumda tong. Kechagi silkinish butun-butun ko'chalarni qum tomonga qiyshaytirib qo'ygan.`],
    ['sado', `So this is where you work? Everything's crooked. All the houses lean the same way, like they're listening.|Так вот где ты работаешь? Тут всё кривое. Все дома наклонились в одну сторону, будто прислушиваются.|Shu yerda ishlaysanmi? Hammasi qiyshiq. Hamma uylar bir tomonga engashgan, go'yo quloq solayotgandek.`],
    ['hero', `They lean toward the sand. Twenty years ago half of this went under.|К пескам клонятся. Двадцать лет назад половина всего этого ушла вниз.|Qum tomonga engashgan. Yigirma yil oldin buning yarmi qumga ketgan.`],
    ['sado', `But why are we here? The tumars aren't in the Tail.|А мы-то зачем здесь? Тумаров в Хвосте нет.|Lekin nega bu yerdamiz? Tumarlar Dumda emas-ku.`],
    ['hero', `Rustam's route. Day one, the Tail. Day two, the Rabat. If the thief knew him, the thief knew his route. Somebody saw something.|Маршрут Рустама. Первый день — Хвост, второй — Рабат. Если вор знал его, знал и маршрут. Кто-нибудь да видел.|Rustamning yo'li. Birinchi kun — Dum, ikkinchi kun — Rabot. O'g'ri uni tanigan bo'lsa, yo'lini ham bilgan. Kimdir nimadir ko'rgan bo'ladi.`],
    ['sado', `...There was a blue gate. On that corner. It fell in. It had a hinge that sang.|…А вон на том углу были синие ворота. Они провалились. У них петля пела.|...Anavi muyulishda ko'k darvoza bor edi. Qulab tushgan. Oshiq-moshig'i g'ichirlab kuylardi.`],
    ['hero', `How do you know that?|Откуда ты знаешь?|Qayerdan bilasan?`],
    ['sado', `...I don't. Is it true?|…Не знаю. Это правда?|...Bilmayman. Rostmi?`],
    ['hero', `There were lots of blue gates. Every mother on the row used the same blue. It doesn't mean anything.|Синих ворот тут было полно. Все матери на ряду красили одной синькой. Это ничего не значит.|Ko'k darvoza ko'p edi. Qatordagi hamma onalar bir xil ko'k bo'yoq surardi. Bu hech narsani anglatmaydi.`]
  ],
  mid: [
    ['', `A woman tips dirty water into the gutter, sees your satchel, and shuts her door without a word.|Женщина выплёскивает помои в канаву, замечает твою сумку и молча закрывает дверь.|Bir ayol iflos suvni ariqqa to'kadi, xaltangni ko'radi-yu, indamay eshigini yopadi.`],
    ['sado', `They hate you.|Они тебя ненавидят.|Ular sendan nafratlanadi.`],
    ['hero', `They hate the satchel. I just carry it.|Они ненавидят сумку. Я её просто ношу.|Ular xaltadan nafratlanadi. Men uni shunchaki ko'tarib yuraman.`],
    ['sado', `Is there a difference?|А есть разница?|Farqi bormi?`]
  ],
  stones: [
    `"The Sleeper drinks from below, we drink from above. Never dig a well deeper than your grandfather did." A Tail saying.|«Спящий пьёт снизу, мы сверху. Не копай колодец глубже, чем копал дед». Поговорка Хвоста.|«Uxlovchi pastdan ichadi, biz — tepadan. Bobong qazigandan chuqur quduq qazima». Dum maqoli.`,
    `On the night of the Small Awakening the Singers counted the dead by the tithes no one owed anymore. They called it a light year.|В ночь Малого Пробуждения Певцы считали мёртвых по десятинам, которые больше некому было платить. Год назвали лёгким.|Kichik Uyg'onish kechasi Xonandalar o'liklarni endi to'laydigan egasi qolmagan ushrlarga qarab sanadi. O'sha yilni yengil yil deb atashdi.`,
    { text: `A child's scratching: a long curled animal with a city on its back, and tiny people pouring something into its mouth.|Детский рисунок, нацарапанный на камне: длинный свернувшийся зверь с городом на спине, и крошечные люди что-то льют ему в пасть.|Bola toshga tirnab chizgan: orqasida shahar ko'targan, buralib yotgan uzun jonivor, mitti odamlar uning og'ziga nimadir quyishyapti.`,
      then: [sadoIf(() => true, `Is that us? We're very small.|Это мы? Какие мы маленькие.|Bu bizmi? Juda kichkina ekanmiz-a.`)] },
    `"The Hollow aren't dead. They're tidy. They sweep, they carry, they answer. They just don't want anything anymore."|«Пустые не мёртвые. Они опрятные. Метут, носят, отвечают. Просто ничего больше не хотят».|«Bo'shlar o'lik emas. Ular saranjom. Supuradi, tashiydi, javob beradi. Faqat endi hech narsa xohlamaydi».`
  ],
  memory: {
    id: 'm_hinge',
    lines: [
      ['memory', `The gate of your house. Blue paint over older blue. Every time it opens, the hinge sings one falling note.|Ворота твоего дома. Синяя краска поверх старой синей. Каждый раз, когда их открывают, петля поёт — одну ноту, сверху вниз.|Uyingizning darvozasi. Eski ko'k bo'yoq ustidan yangi ko'k. Har ochilganda oshiq-moshig'i pastlab tushadigan bitta nota bilan kuylaydi.`],
      ['memory', `You ride the gate as it swings, and someone smaller pushes. Higher! Higher! The hinge sings and sings.|Ты катаешься на створке, а кто-то поменьше толкает. Выше! Выше! Петля поёт и поёт.|Sen darvoza tabaqasiga osilib uchasan, sendan kichikroq kimdir itaradi. Balandroq! Balandroq! Oshiq-moshiq kuylayveradi.`],
      ['memory', `Who was pushing? There's a soft hole in the memory there, like a thumbprint in bread.|Кто толкал? В этом месте в памяти мягкая ямка, как след пальца в хлебе.|Kim itarardi? Xotiraning o'sha joyida nonga botgan barmoq izidek yumshoq chuqurcha bor.`],
      ['sado', `It was blue. I told you it was blue.|Синие. Я же говорила, что синие.|Ko'k edi. Ko'k degandim-ku.`],
      ['hero', `Everyone's gate was blue.|У всех ворота были синие.|Hammaning darvozasi ko'k edi.`]
    ]
  },
  people: [{ look: 'tailwoman' }, { look: 'child', x: 14 }, { look: 'tailman', x: 28 }, { look: 'alp', x: 48 }],
  exit(done) {
    play([
      ['', `A house has folded in on itself. Neighbours dig with their bare hands. A huge man lifts beams that two men couldn't.|Дом сложился внутрь. Соседи разгребают завал голыми руками. Огромный мужчина поднимает балки, которые и вдвоём не поднять.|Bir uy ichiga qulab tushgan. Qo'shnilar vayronani yalang qo'l bilan titishyapti. Ulkan bir odam ikki kishi ko'tarolmaydigan to'sinlarni ko'taryapti.`],
      ['neighbour', `The yodchi. Of course. Even the rubble owes.|Ёдчи. Ну конечно. Даже развалины в долгу.|Yodchi. Albatta-da. Vayrona ham qarzdor.`],
      ['alp', `There's a boy under there. Little. He was singing before. Then he stopped.|Там мальчик. Внизу. Маленький. Пел. Потом перестал.|Tagida bola bor. Kichkina. Ashula aytayotgan edi. Keyin to'xtadi.`],
      ['sado', `Someone's alive down there. I can hear him breathing through the stones. Or I can hear you hearing him.|Там внизу кто-то живой. Я слышу, как он дышит сквозь камни. Или слышу, как его слышишь ты.|Pastda kimdir tirik. Toshlar orasidan nafas olayotganini eshityapman. Yo sen eshitayotganingni eshityapman.`]
    ], () => hub(`The fallen house|Рухнувший дом|Qulagan uy`, [
      { label: `— Who are you?|— Ты кто такой?|— Sen kimsan?`, lines: [
        ['alp', `They call me Alp. I don't remember what I was called before. Doesn't matter.|Зовут Алп. Как звали раньше — не помню. Неважно.|Meni Alp deyishadi. Avval nima deyishardi — esimda yo'q. Farqi yo'q.`],
        ['neighbour', `He's Hollow. Used to guard caravans, they say. Now he looks after the orphans on our row. Lifts what nobody else can.|Он Пустой. Говорят, раньше караваны охранял. Теперь смотрит за сиротами с нашего ряда. Поднимает то, что никому не поднять.|U Bo'sh. Aytishlaricha, oldin karvon qo'riqlagan. Endi qatorimizdagi yetimlarga qaraydi. Hech kim ko'tarolmaganini ko'taradi.`],
        ['alp', `Help or go.|Помогай или уходи.|Yo yordam ber, yo ket.`]
      ] },
      { label: `— What does this house owe?|— Сколько должен этот дом?|— Bu uyning qancha qarzi bor?`, lines: [
        ['neighbour', `Last night's tithe. The father didn't get to pay. He went under with it still in his head. He's not breathing.|Вчерашнюю десятину. Отец не успел заплатить. Так и ушёл под завал, с памятью в голове. Он уже не дышит.|Kechagi ushr. Otasi to'lashga ulgurmadi. Xotirasi boshida qolgancha vayrona tagida qoldi. Nafas olmayapti.`],
        ['neighbour', `So what now? You'll take it from a dead man too?|И что теперь? С мёртвого тоже возьмёте?|Endi nima? O'likdan ham olasizmi?`],
        ['hero', `An unpaid tithe doesn't vanish. It falls on the row. Next year every house here pays a piece of his.|Неуплаченная десятина никуда не девается. Она ложится на ряд. На будущий год каждый дом здесь заплатит кусок его долга.|To'lanmagan ushr yo'qolib ketmaydi. U qatorga tushadi. Kelasi yil bu yerdagi har bir uy uning ulushidan bir parchasini to'laydi.`]
      ] },
      { label: `— What if I take the father's tithe?|— А если взять десятину с отца?|— Otaning ushrini olsam-chi?`, lines: [
        ['sado', `Wait. If you take his father's memory now, the debt is closed. But the boy will never know what his papa was like. Is that really how it works?|Подожди. Если ты сейчас заберёшь память отца, долг закрыт. Но мальчик никогда не узнает, какой у него был папа. Правда так всё устроено?|To'xta. Hozir otasining xotirasini olsang, qarz yopiladi. Lekin bola dadasi qanaqa odam bo'lganini hech qachon bilmaydi. Rostdan shunaqami?`],
        ['hero', `That's how it works. A dead man's memory comes out easy. And a closed debt pays the collector his cut.|Так и устроено. Из мёртвого память выходит легко. А за закрытый долг сборщику полагается доля.|Shunaqa. O'likdan xotira oson chiqadi. Yopilgan qarz uchun esa yig'uvchiga ulush tegadi.`],
        ['sado', `And while you're doing that, nobody's digging.|А пока ты этим занят, никто не копает.|Sen shu bilan ovora bo'lsang, hech kim kovlamaydi.`]
      ] }
    ], [
      { k: 'helped', label: `Put down the satchel and dig.|Поставить сумку и разбирать завал.|Xaltani yerga qo'yib, vayronani titish.` },
      { k: 'paid', label: `Leave them water and tilla, and keep walking.|Оставить им воды и тиллы — и идти дальше.|Ularga suv bilan tilla qoldirib, yo'lda davom etish.`, price: 30 },
      { k: 'collected', label: `Hum the Take over the dead father and close the debt.|Напеть Взятие над мёртвым отцом и закрыть долг.|O'lgan ota ustida Olish kuyini aytib, qarzni yopish.` }
    ], o => {
      setF('alp', o.k);
      if (o.k === 'helped') {
        rep('tail', 2); trust(2);
        play([
          ['', `You dig until your fingers bleed. Alp lifts the last beam, and a boy, grey with dust, coughs. Alive. His father isn't.|Вы копаете, пока пальцы не начинают кровить. Алп поднимает последнюю балку — и мальчишка, серый от пыли, кашляет. Живой. Отец — нет.|Barmoqlaring qonaguncha kovlaysizlar. Alp oxirgi to'sinni ko'taradi — changdan kulrang bo'lib ketgan bola yo'taladi. Tirik. Otasi esa yo'q.`],
          ['alp', `Thank you, yodchi. I'm bad at remembering. You, I'll try to remember.|Спасибо, ёдчи. Я плохо запоминаю. Тебя — постараюсь.|Rahmat, yodchi. Eslab qolishga no'noqman. Seni eslab qolishga harakat qilaman.`],
          ['neighbour', `And the father's tithe falls on the row now. ...We'll manage. We always manage.|А десятина отца теперь ляжет на ряд. …Справимся. Всегда справлялись.|Otasining ushri endi qatorga tushadi. ...Eplaymiz. Doim eplaganmiz.`],
          ['sado', `You put the satchel down. You know... I liked that.|Ты поставил сумку. Знаешь… мне это понравилось.|Xaltani yerga qo'yding. Bilasanmi... bu menga yoqdi.`]
        ], done);
      } else if (o.k === 'paid') {
        rep('tail', 1);
        play([
          ['alp', `Water's good. Hands would be better.|Вода — хорошо. Руки были бы лучше.|Suv yaxshi. Qo'l bo'lsa, yaxshiroq edi.`],
          ['sado', `You could have stayed.|Ты мог бы остаться.|Qolsang bo'lardi.`],
          ['hero', `Twenty-eight nights, Sado.|Двадцать восемь ночей, Садо.|Yigirma sakkiz kecha, Sado.`],
          ['sado', `I can count too.|Я тоже умею считать.|Men ham sanashni bilaman.`]
        ], done);
      } else {
        rep('tail', -3); trust(-2); addVoid(4, CRUEL); gold(50);
        play([
          ['', `You find the father's head between two stones. Still warm. You hum the Take. His last strong memory comes out easily. The dead don't hold on.|Ты нащупываешь голову отца между двух камней. Ещё тёплая. Напеваешь Взятие. Последнее сильное воспоминание выходит легко: мёртвые не держатся.|Otaning boshini ikki tosh orasidan paypaslab topasan. Hali iliq. Olish kuyini xirgoyi qilasan. Oxirgi kuchli xotirasi oson chiqadi: o'liklar mahkam ushlamaydi.`],
          ['', `Nobody digs while you work. Under the stones, the singing doesn't start again.|Пока ты работаешь, никто не копает. Под камнями больше никто не поёт.|Sen ishlayotganingda hech kim kovlamaydi. Toshlar tagida ashula qaytib eshitilmaydi.`],
          ['hero', `The debt's closed. The row owes nothing for this house.|Долг закрыт. За этот дом ряд больше ничего не должен.|Qarz yopildi. Bu uy uchun qatorning endi hech qanday qarzi yo'q.`],
          ['alp', `I'll remember your face. That much I can remember.|Твоё лицо я запомню. Уж это я запомнить смогу.|Yuzingni eslab qolaman. Shuni eplayman.`],
          ['sado', `I wish I had my own eyes. So I could close them.|Жаль, у меня нет своих глаз. Я бы их закрыла.|Afsus, o'z ko'zim yo'q. Yumib olardim.`]
        ], done);
      }
    }));
  }
});
BARKS['a1_tail:start'] = [
  `The water in the gutters is salty. I can taste it through you. Sorry.|Вода в канавах солёная. Я чувствую её вкус через тебя. Извини.|Ariqdagi suv sho'r. Ta'mini sen orqali sezyapman. Kechirasan.`,
  `Children are following us. Roof to roof. Like sparrows.|За нами ходят дети. По крышам. Как воробьи.|Bolalar ortimizdan kelyapti. Tomdan-tomga. Chumchuqlardek.`,
  `Seven tumars. Twenty-eight nights. And we're walking an old man's route. I hope you know what you're doing.|Семь тумаров. Двадцать восемь ночей. А мы ходим по маршруту старика. Надеюсь, ты знаешь, что делаешь.|Yettita tumar. Yigirma sakkiz kecha. Biz esa cholning yo'lidan yuribmiz. Nima qilayotganingni bilasan, deb umid qilaman.`
];
BARKS['a1_tail:mid'] = [
  `That house has a tumar nailed over the door. Somebody's grandmother, keeping watch.|Над дверью вон того дома прибит тумар. Чья-то бабушка стережёт.|Anavi uyning eshigi tepasiga tumar qoqib qo'yilgan. Kimningdir buvisi qorovullik qilyapti.`,
  `The ground is warm, Ravshan. Is he dreaming?|Земля тёплая, Равшан. Ему что-то снится?|Yer iliq, Ravshan. U tush ko'ryaptimi?`
];

LAND('a1_rabat', {
  name: `The Rabat and the Salt Road|Рабат и Соляная дорога|Rabot va Tuz yo'li`,
  sub: `Outside the walls, where the forty days are counted|За стенами, где считают сорок дней|Devor ortida, qirq kun sanaladigan joy`,
  start: [
    ['', `Outside the walls the wind smells of camels and salt. The Rabat: forty rooms around a well, forty days for every stranger.|За стенами ветер пахнет верблюдами и солью. Рабат: сорок комнат вокруг колодца, сорок дней на каждого чужака.|Devor ortida shamoldan tuya va tuz hidi keladi. Rabot: quduq atrofida qirqta hujra, har musofirga qirq kun.`],
    ['sado', `So much sky! Is it always this wide? Ravshan, look up. Look up!|Сколько неба! Оно всегда такое широкое? Равшан, посмотри наверх. Наверх же!|Qancha osmon! Doim shunaqa kengmi? Ravshan, tepaga qara. Tepaga!`],
    ['hero', `Rustam's route comes through here on day two. If anyone saw the thief leave the city, it's a caravan-bashi.|По маршруту Рустама сюда приходят на второй день. Если кто и видел, как вор выходил из города, так это караван-баши.|Rustamning yo'li ikkinchi kuni shu yerdan o'tadi. O'g'rining shahardan chiqqanini kimdir ko'rgan bo'lsa, bu karvonboshi.`],
    ['sado', `You're not looking up. You're counting camels.|Ты не смотришь наверх. Ты считаешь верблюдов.|Tepaga qaramayapsan. Tuyalarni sanayapsan.`],
    ['hero', `Thirty-one.|Тридцать один.|O'ttiz bitta.`]
  ],
  mid: [
    ['', `A Singers' inspector rides down the Salt Road toward the Rabat, his white hat bobbing over the dunes. He checks the forty days.|По Соляной дороге к Рабату едет смотритель Певцов; белая шапка мелькает над барханами. Он проверяет сорок дней.|Tuz yo'lidan Rabotga Xonandalarning noziri kelyapti, oq qalpog'i barxanlar osha lipillaydi. U qirq kunni tekshiradi.`],
    ['sado', `Forty days?|Сорок дней?|Qirq kun?`],
    ['hero', `A stranger can stay forty days without the tithe. After that, he pays, leaves, or goes to the Well.|Чужак может прожить сорок дней без десятины. Потом он платит, уходит или отправляется в Колодец.|Musofir qirq kun ushrsiz yashashi mumkin. Keyin yo to'laydi, yo ketadi, yo Quduqqa tushadi.`]
  ],
  stones: [
    `"For forty days a stranger may drink our water free. Then he pays the tithe, or the sand takes him back." Carved over the Rabat well.|«Сорок дней чужак пьёт нашу воду даром. Потом платит десятину — или песок забирает его обратно». Вырезано над колодцем Рабата.|«Musofir qirq kun suvimizni tekin ichadi. Keyin ushr to'laydi — yo uni qum qaytarib oladi». Rabot qudug'i tepasiga o'yib yozilgan.`,
    `The Salt Road is older than Yodgor. The caravans came for the water. The water came from him. Nobody puts it that way.|Соляная дорога старше Ёдгора. Караваны шли за водой. А вода шла от него. Только вслух так никто не говорит.|Tuz yo'li Yodgordan qari. Karvonlar suv izlab kelardi. Suv esa undan chiqardi. Faqat buni hech kim ochiq aytmaydi.`,
    `A caravan-bashi's mark of seven knots: "Seven came here with seven caravans, and only the river was waiting."|Знак караван-баши — семь узлов: «Семеро пришли сюда с семью караванами, и ждала их одна река».|Karvonboshining yetti tugunli belgisi: «Yetti kishi yetti karvon bilan keldi, ularni faqat daryo kutib turgandi».`,
    `Scratched by a child: "Mama says we go when the inspector leaves. Mama says be very quiet in the dark."|Нацарапано детской рукой: «Мама говорит, уйдём, когда уедет смотритель. Мама говорит, в темноте надо сидеть тихо-тихо».|Bola qo'li bilan tirnab yozilgan: «Oyim nozir ketgandan keyin ketamiz deydi. Oyim qorong'ida jim-jim o'tir deydi».`
  ],
  memory: {
    id: 'm_road',
    lines: [
      ['memory', `Your father, home from the Salt Road, smelling of camel and rope. He has candy, the hard kind, wrapped in paper.|Отец вернулся с Соляной дороги, пахнет верблюдом и верёвкой. У него леденцы — твёрдые, в бумажках.|Otang Tuz yo'lidan qaytdi, undan tuya va arqon hidi keladi. Qog'ozga o'ralgan qattiq navvot olib kelibdi.`],
      ['memory', `He gives you one. He holds the other out to someone beside you, lower down, and laughs.|Один отдаёт тебе. Второй протягивает кому-то рядом, пониже тебя, и смеётся.|Bittasini senga beradi. Ikkinchisini yoningdagi, sendan pastroq kimgadir uzatib, kuladi.`],
      ['memory', `Then there's only one candy, and your father's hand, open, holding nothing.|А потом леденец только один, и отцовская ладонь раскрыта и пуста.|Keyin faqat bitta navvot qoladi, otangning kafti esa ochiq va bo'm-bo'sh.`],
      ['sado', `Did you eat both?|Ты съел оба?|Ikkalasini ham o'zing yeb qo'ydingmi?`],
      ['hero', `I must have.|Наверное.|Shekilli.`],
      ['sado', `That's not fair to the other one.|Так нечестно. А второму?|Bu insofdan emas. Ikkinchisi-chi?`],
      ['hero', `There was no other one.|Никакого второго не было.|Ikkinchisi bo'lmagan.`]
    ]
  },
  people: [{ look: 'caravan' }, { look: { robe: '#5a4a2a', trim: '#a07a3a', skin: '#b8865c', head: 'turban', headC: '#c8b890', beard: 'short' }, x: 16 }, { look: 'inspector', x: 40 }, { look: 'caravan', x: 58 }],
  exit(done) {
    play([
      ['davron', `Yodchi. Rustam's boy. Bad timing. I've got nothing for your satchel.|Ёдчи. Парень Рустама. Не вовремя ты. Для твоей сумки у меня ничего нет.|Yodchi. Rustamning yigiti. Yomon paytda kelding. Xaltang uchun menda hech vaqo yo'q.`],
      ['hero', `I'm not collecting. On the Night of Payment someone stole the founders' tumars. Seven amulets. Did anyone carry them out through the Rabat?|Я не за десятиной. В Ночь Уплаты украли тумары основателей. Семь амулетов. Никто не выносил их через Рабат?|Ushr yig'gani kelmadim. To'lov kechasi asoschilarning tumarlarini o'g'irlashdi. Yettita tumar. Ularni Rabot orqali hech kim olib o'tmadimi?`],
      ['davron', `A woman in a hood went out that night, toward the old karez mouths. That's all I saw. I wasn't looking hard.|В ту ночь вышла женщина в капюшоне, пошла к старым устьям кяриза. Больше ничего не видел. Да я и не присматривался.|O'sha kechasi yopinchiqli bir ayol eski koriz og'izlari tomonga chiqib ketdi. Ko'rganim shu. Unchalik qaramadim ham.`],
      () => (R().at['finfor_plane'] ? ['sado', `A woman in a hood. Farrukh said the same. It's her, Ravshan. The thief went down into the karez.|Женщина в капюшоне. Фаррух говорил то же самое. Это она, Равшан. Воровка ушла в кяриз.|Yopinchiqli ayol. Farrux ham shuni aytgandi. O'sha, Ravshan. O'g'ri korizga tushib ketgan.`] : null),
      ['', `One of his waterskins moves. Then another. A third gives a small, wet hiccup.|Один из его бурдюков шевелится. Потом другой. Третий тихонько, мокро икает.|Meshlaridan biri qimirlaydi. Keyin yana biri. Uchinchisi sekingina hiq etib qo'yadi.`],
      ['sado', `Ravshan. The waterskins are breathing.|Равшан. Бурдюки дышат.|Ravshan. Meshlar nafas olyapti.`],
      ['davron', `...Three. My sister's children. Their forty days ran out. Next comes the Well, then they go Hollow. They're seven, nine and five.|…Трое. Дети моей сестры. Их сорок дней вышли. Дальше Колодец, а потом они станут Пустыми. Им семь, девять и пять.|...Uchta. Singlimning bolalari. Qirq kunlari tugadi. Endi Quduq, keyin Bo'sh bo'lib qolishadi. Yetti, to'qqiz va besh yoshda.`],
      ['davron', `The inspector checks every caravan. If the little one cries, they're done. And so am I.|Смотритель проверяет каждый караван. Если младшая заплачет, им конец. И мне тоже.|Nozir har bir karvonni tekshiradi. Kenjasi yig'lab yuborsa, ularning ishi tamom. Meniki ham.`],
      ['child', `(from the smallest skin, a muffled sob)|(из самого маленького бурдюка доносится приглушённый всхлип)|(eng kichik meshdan bo'g'iq yig'i eshitiladi)`],
      ['sado', `She's scared. Sing to her. I know one. "Alla". I'll give you the words.|Ей страшно. Спой ей. Я знаю одну. «Аллу». Я подскажу слова.|U qo'rqyapti. Unga alla ayt. Men bittasini bilaman. So'zlarini aytib turaman.`],
      ['hero', `I don't sing.|Я не пою.|Men ashula aytmayman.`],
      ['sado', `You do now. "Alla, alla, the water sleeps. The lamp is low, the gate is shut..."|Теперь поёшь. «Алла, алла, спит вода. Лампа гаснет, заперты ворота…»|Endi aytasan. «Alla-yo alla, suv uxladi. Chiroq pasaydi, darvoza yopildi...»`],
      ['', `You hum it into the leather. It comes out of you as if it had always lived there. The skin stops shaking.|Ты напеваешь в кожу бурдюка. Мотив выходит из тебя так, будто всегда в тебе жил. Бурдюк перестаёт дрожать.|Meshga qarab xirgoyi qilasan. Kuy go'yo azaldan ichingda yashagandek oqib chiqadi. Mesh titrashdan to'xtaydi.`],
      ['davron', `That's a Tail lullaby. Old Tail. Where does a yodchi learn that?|Это колыбельная Хвоста. Старого Хвоста. Где ёдчи такому учатся?|Bu Dumning allasi. Eski Dumniki. Yodchi buni qayerdan o'rganadi?`],
      ['hero', `...I don't know.|…Не знаю.|...Bilmayman.`],
      ['sado', `From me. Everyone knows "Alla".|От меня. «Аллу» все знают.|Mendan. «Alla»ni hamma biladi.`],
      ['inspector', `Caravan-bashi! The forty days. Open your skins.|Караван-баши! Сорок дней. Развязывай бурдюки.|Karvonboshi! Qirq kun. Meshlaringni yech.`]
    ], () => hub(`The inspector of the Well|Смотритель Колодца|Quduq noziri`, [
      { label: `— What happens to them if they're found?|— Что с ними будет, если найдут?|— Topib olishsa, ularga nima bo'ladi?`, lines: [
        ['davron', `The Well. Strangers who can't pay go to the Singers. They sing a little out of them every year. By twenty they're Hollow.|Колодец. Чужаков, которым нечем платить, отдают Певцам. Каждый год из них понемногу выпевают. К двадцати они Пустые.|Quduq. To'lay olmaydigan musofirni Xonandalarga berishadi. Har yili undan ozgina kuylab olishadi. Yigirmaga yetganda — Bo'sh.`],
        ['sado', `They're seven, nine and five, Ravshan.|Им семь, девять и пять, Равшан.|Ular yetti, to'qqiz va besh yoshda, Ravshan.`]
      ] },
      { label: `— Is there a way past him?|— Как их провести мимо него?|— Ularni uning yonidan qanday olib o'tsa bo'ladi?`, lines: [
        ['davron', `Two ways. The old karez mouths behind the dunes. You carry them out on your back while I bore him with the weather.|Два пути. Старые устья кяриза за барханами. Ты выносишь их на спине, а я тем временем заговариваю ему зубы погодой.|Ikki yo'l bor. Barxanlar ortidagi eski koriz og'izlari. Men unga ob-havodan gapirib boshini qotirib turaman, sen ularni yelkangda olib chiqasan.`],
        ['davron', `Or your seal. A yodchi's seal is the Well's seal. Tell him the skins are yours, and he might believe it. He might not.|Или твоя печать. Печать ёдчи — та же печать Колодца. Скажи, что бурдюки твои, — может, поверит. А может, и нет.|Yoki muhring. Yodchining muhri — Quduqning muhri. Meshlar meniki desang, balki ishonar. Balki ishonmas.`],
        ['hero', `The karez mouths are where the woman in the hood went. I'd see her road.|А к устьям кяриза ушла та женщина в капюшоне. Заодно посмотрю на её дорогу.|Yopinchiqli ayol ham koriz og'izlari tomon ketgan. Uning yo'lini ham ko'rib olaman.`]
      ] },
      { label: `— And if I look the other way?|— А если я просто отвернусь?|— Men teskari qarab tursam-chi?`, lines: [
        ['davron', `Then there's seventy tilla in it for you. It's everything I have.|Тогда семьдесят тилл твои. Это всё, что у меня есть.|Unda yetmish tilla seniki. Bor-budim shu.`],
        ['davron', `It was for their road. ...They'll manage without. Better poor than Hollow.|Это им было на дорогу. …Ничего, обойдутся. Лучше нищие, чем Пустые.|Bu ularning yo'l puli edi. ...Mayli, bir amallab ketishadi. Bo'sh bo'lgandan ko'ra kambag'al bo'lgan yaxshi.`],
        ['inspector', `And the Well pays forty to whoever finds a runaway. Just so you know, yodchi.|А Колодец платит сорок тому, кто найдёт беглеца. Просто чтоб ты знал, ёдчи.|Quduq esa qochoqni topganga qirq tilla to'laydi. Bilib qo'y, yodchi.`],
        ['inspector', `And the Ustoz remembers who helps the Well. A man with her song in his throat should want her to remember him kindly.|И Устоз помнит, кто помогает Колодцу. Тому, у кого в горле её песня, стоит быть у неё на хорошем счету.|Ustoz esa Quduqqa kim yordam berganini eslab qoladi. Tomog'ingda uning qo'shig'i bor, yodchi. Ustozning ko'ziga yaxshi ko'rinib tursang, o'zingga foyda.`]
      ] }
    ], [
      { k: 'led', label: `Carry the children out through the old karez while Davron talks.|Вынести детей через старые устья кяриза, пока Даврон заговаривает смотрителю зубы.|Davron gapga solib turganda, bolalarni eski koriz og'izlaridan olib chiqish.` },
      { k: 'bluff', label: `"These skins are water for the Well. Under my seal."|«Это вода для Колодца. Под моей печатью.»|«Bu Quduqning suvi. Mening muhrim ostida.»`, lock: R().void >= 50 ? `You can't remember how lying feels.|Ты уже не помнишь, как это — врать.|Yolg'on gapirish qanaqa bo'lishini endi eslolmaysan.` : null },
      { k: 'bribe', label: `Take Davron's purse and study the dunes.|Взять кошель Даврона и разглядывать барханы.|Davronning hamyonini olib, barxanlarni tomosha qilish.` },
      { k: 'reported', label: `Call the inspector over: "Check the small skin."|Подозвать смотрителя: «Проверь маленький бурдюк».|Nozirni chaqirish: «Kichkina meshni tekshir».` }
    ], o => {
      setF('davron', o.k);
      if (o.k === 'led') {
        rep('rabat', 3); rep('singers', -1, true); trust(2);
        play([
          ['', `You hoist the skins onto your back and carry them out through the old karez mouths while Davron talks to the inspector about the weather.|Ты взваливаешь бурдюки на спину и уносишь их через старые устья кяриза. Даврон тем временем толкует смотрителю о погоде.|Meshlarni yelkangga ortib, eski koriz og'izlaridan olib chiqasan. Davron esa bu orada nozirga ob-havodan gapirib turadi.`],
          ['', `In the shade of a dune you untie them. Three faces, sticky with tears. The smallest is asleep.|В тени бархана ты развязываешь их. Три лица, липкие от слёз. Младшая спит.|Barxan soyasida ularni yechasan. Ko'z yoshidan yopishqoq uchta yuz. Kenjasi uxlab qolibdi.`],
          ['davron', `I owe you, Rustam's boy. The Rabat owes you. We don't forget. We can't afford to.|Я твой должник, парень Рустама. Весь Рабат твой должник. Мы не забываем. Нам это не по карману.|Men senga qarzdorman, Rustamning yigiti. Butun Rabot senga qarzdor. Biz unutmaymiz. Unutishga qurbimiz yetmaydi.`],
          ['sado', `Three. You carried three people out of the world. Count that one.|Трое. Ты вынес из этого мира троих. Вот это посчитай.|Uchta. Bu dunyodan uch kishini olib chiqding. Mana buni sanab qo'y.`]
        ], done);
      } else if (o.k === 'bluff') {
        rep('rabat', 2); rep('singers', -1, true); trust(1);
        play([
          ['hero', `These skins are water for the Well, under my seal. I'm Rustam-aka's apprentice. Want to break a yodchi's seal?|Эти бурдюки — вода для Колодца, под моей печатью. Я ученик Рустама-ака. Хочешь сорвать печать ёдчи?|Bu meshlar — Quduq suvi, muhrim ostida. Men Rustam akaning shogirdiman. Yodchining muhrini buzmoqchimisan?`],
          ['inspector', `Rustam's gone Hollow, I hear. Strange name to boast of.|Говорят, Рустам опустел. Странное имя, чтобы им козырять.|Eshitishimcha, Rustam bo'shab qolibdi. Maqtanishga g'alati nom tanlading.`],
          ['', `He stares at the skins for a long time. Then he rides on, writing something small.|Он долго смотрит на бурдюки. Потом едет дальше, что-то мелко записывая.|U meshlarga uzoq tikilib turadi. Keyin nimanidir mayda qilib yozgancha yo'lida davom etadi.`],
          ['sado', `You lie beautifully. That's a little scary.|Ты красиво врёшь. Даже страшновато.|Juda chiroyli yolg'on gapirasan. Biroz qo'rqinchli.`]
        ], done);
      } else if (o.k === 'bribe') {
        rep('rabat', 0, true); trust(-1); gold(70);
        play([
          ['davron', `Rustam took money too. Said it kept him honest: he always knew his own price.|Рустам тоже брал. Говорил, так честнее: всегда знаешь себе цену.|Rustam ham olardi. Shu bilan halol qolaman, derdi: o'z narxini doim bilardi.`],
          ['', `You watch the dunes until the inspector is gone. The skins ride away on a camel, quiet.|Ты разглядываешь барханы, пока смотритель не уедет. Бурдюки тихо уезжают на верблюде.|Nozir ketguncha barxanlarni tomosha qilasan. Meshlar tuyaga ortilib, jimgina ketadi.`],
          ['sado', `They're safe. And you're richer. I don't know what to feel.|Они спасены. А ты разбогател. Не знаю, что и чувствовать.|Ular omon. Sen esa boyib qolding. Nima his qilishni bilmayman.`]
        ], done);
      } else {
        rep('singers', 2); rep('rabat', -3); trust(-3); addVoid(5, CRUEL); gold(40);
        play([
          ['inspector', `The Well thanks you, yodchi. Forty tilla, the usual finder's share.|Колодец благодарит тебя, ёдчи. Сорок тилл, обычная доля нашедшего.|Quduq senga minnatdor, yodchi. Qirq tilla, topganning odatdagi ulushi.`],
          ['', `They cut the skins open. Three children blink at the sun. The smallest doesn't cry. She's past crying.|Бурдюки вспарывают. Трое детей щурятся на солнце. Младшая не плачет. Ей уже не до слёз.|Meshlarni yorib ochishadi. Uch bola quyoshga ko'zini qisadi. Kenjasi yig'lamaydi. Yig'lashga ham holi qolmagan.`],
          ['inspector', `I'll tell the Ustoz who helped. She'll remember.|Я скажу Устоз, кто помог. Она запомнит.|Kim yordam berganini Ustozga aytaman. U eslab qoladi.`],
          ['davron', `I hope you live long, yodchi. Long enough to remember this every night.|Живи долго, ёдчи. Так долго, чтобы вспоминать это каждую ночь.|Umring uzoq bo'lsin, yodchi. Buni har kecha eslaydigan darajada uzoq.`],
          ['sado', `I taught you that song for her.|Я научила тебя этой песне ради неё.|Bu allani senga u uchun o'rgatgandim.`]
        ], done);
      }
    }));
  }
});
BARKS['a1_rabat:start'] = [
  `Somebody here is singing in a language I don't know. It sounds like walking.|Кто-то тут поёт на незнакомом мне языке. Похоже на шаги.|Bu yerda kimdir men bilmagan tilda ashula aytyapti. Qadam tovushiga o'xshaydi.`,
  `The salt crunches. Like walking on sugar.|Соль хрустит. Как будто по сахару идёшь.|Tuz g'archillaydi. Qand ustidan yurgandek.`
];
BARKS['a1_rabat:mid'] = [
  `The inspector's coming. Everyone's moving faster. Did you notice?|Едет смотритель. Все сразу засуетились. Заметил?|Nozir kelyapti. Hamma shoshib qoldi. Sezdingmi?`
];

BOSS('kempir', {
  name: `Yalmog'iz Kampir|Ялмогиз-кампир|Yalmog'iz Kampir`,
  title: `Mistress of the Tower of Silence|Хозяйка Башни молчания|Sukunat minorasining bekasi`,
  quote: `"Seven mouths, and every one is hungry"|«Семь ртов, и все голодные»|«Yetti og'iz, hammasi och»`,
  lair: `Tower of Silence|Башня молчания|Sukunat minorasi`,
  lairSub: `Where the Hollow are carried when they stop|Куда относят Пустых, когда они останавливаются|To'xtab qolgan Bo'shlar olib kelinadigan joy`,
  pre: [
    ['', `The Tower of Silence. When the Hollow finally stop walking, the city carries them here. The crows know the way.|Башня молчания. Когда Пустые наконец перестают ходить, город несёт их сюда. Вороны знают дорогу.|Sukunat minorasi. Bo'shlar oxiri yurishdan to'xtaganda, shahar ularni shu yerga olib keladi. Qarg'alar yo'lni biladi.`],
    ['sado', `It smells of wax in here. So much wax. Ravshan, I don't like this place.|Тут пахнет воском. Столько воска. Равшан, мне тут не нравится.|Bu yerdan mum hidi kelyapti. Shuncha mum. Ravshan, bu joy menga yoqmayapti.`],
    ['', `Among the bones, an old woman is eating. Not meat. The last thin memories still caught in the dead, like hair in a comb.|Среди костей ест старуха. Не мясо — последние тонкие воспоминания, застрявшие в мёртвых, как волосы в гребне.|Suyaklar orasida bir kampir ovqatlanyapti. Go'sht emas — o'liklarda taroqqa ilingan sochdek qolib ketgan so'nggi yupqa xotiralarni.`],
    ['boss', `A yodchi! Full satchel, full head. And something else in there. Something small and sweet, curled up.|Ёдчи! Сумка полная, голова полная. А там ещё что-то есть. Маленькое, сладенькое, свернулось клубочком.|Yodchi! Xaltasi to'la, boshi to'la. Ichida yana nimadir bor. Kichkinagina, shirin, g'ujanak bo'lib yotibdi.`],
    ['sado', `She means me. She can smell me.|Это она про меня. Она меня чует.|Meni aytyapti. Hidimni sezyapti.`],
    ['boss', `Come here, child. Granny's hungry.|Иди сюда, деточка. Бабушка проголодалась.|Bu yoqqa kel, bolajonim. Buving och qoldi.`]
  ],
  again: [
    `Back again? The little one in your head smells sweeter every time.|Опять пришёл? Малышка у тебя в голове пахнет всё слаще.|Yana keldingmi? Boshingdagi kichkintoyning hidi har gal shirinroq.`,
    `Seven mouths, yodchi. One for each of your teacher's sins.|Семь ртов, ёдчи. По одному на каждый грех твоего учителя.|Yetti og'iz, yodchi. Ustozingning har bir gunohiga bittadan.`,
    `They bring me the empty ones. You're not empty yet. Let Granny help.|Мне носят пустых. А ты ещё не пустой. Дай-ка бабушка поможет.|Menga bo'shlarni olib kelishadi. Sen hali bo'sh emassan. Qani, buving yordam bersin.`
  ],
  post(done) {
    play([
      ['', `The Kampir sinks into a heap of rags and crow feathers. The Tower goes very quiet.|Кампир оседает грудой тряпья и вороньих перьев. В Башне становится очень тихо.|Kampir latta-putta va qarg'a patlaridan iborat uyumga aylanib cho'kadi. Minora jimjit bo'lib qoladi.`],
      ['sado', `Toychoq! Toychoq, get up! Please!|Тойчок! Тойчок, вставай! Пожалуйста!|Toychoq! Toychoq, tur! Iltimos!`],
      ['hero', `...I'm up. What did you call me?|…Встаю. Как ты меня назвала?|...Turdim. Meni nima deb chaqirding?`],
      ['sado', `What? I said get up.|Что? Я сказала: вставай.|Nima? Tur, dedim-ku.`],
      ['hero', `You called me Toychoq. Only my mother called me that. No one's said it in twenty years.|Ты назвала меня Тойчоком. Так меня звала только мать. Двадцать лет никто так не говорил.|Meni Toychoq deding. Meni faqat onam shunday chaqirardi. Yigirma yildan beri hech kim aytmagan.`],
      ['sado', `I didn't... I mean... I'm in your head. I suppose I found it lying around.|Я не… То есть… Я же у тебя в голове. Наверное, где-то тут подобрала, валялось.|Men... Ya'ni... Men sening boshingdaman-ku. Bir chetda yotgan ekan, olib qo'ydim shekilli.`],
      ['hero', `Suppose so.|Наверное.|Shundaydir.`],
      ['', `At the top of the Tower a man is chained to the wall. Alive. Hollow. On the iron, a seal of white wax: the mark of the Well.|На вершине Башни к стене прикован человек. Живой. Пустой. На железе печать из белого воска — знак Колодца.|Minora tepasida devorga bir odam zanjirband qilingan. Tirik. Bo'sh. Temirda oq mumdan muhr — Quduq belgisi.`],
      ['sado', `They chained him here alive. For her. They were feeding him to her.|Его приковали тут живым. Для неё. Им её кормили.|Uni bu yerga tiriklayin kishanlashgan. Kampir uchun. Uni kampirga yem qilishgan.`]
    ], () => hub(`The chained man|Человек на цепи|Zanjirband odam`, [
      { label: `— Who is he?|— Кто он?|— U kim?`, lines: [
        ['', `He's thin as a stick. His lips move. He's reciting the tithe list of row four, house by house.|Он худой как щепка. Губы шевелятся: он перечисляет десятинный список четвёртого ряда, дом за домом.|U cho'pdek ozg'in. Lablari qimirlaydi: to'rtinchi qatorning ushr ro'yxatini uyma-uy sanayapti.`],
        ['hero', `A clerk's habit. He kept somebody's books once. Now he's food.|Привычка писаря. Когда-то он вёл чьи-то книги. Теперь он корм.|Mirzalik odati. Bir paytlar kimningdir daftarini yuritgan. Endi esa yem.`]
      ] },
      { label: `— Look at the seal.|— Посмотри на печать.|— Muhrga qara.`, lines: [
        ['hero', `White wax is the Well's seal. Only the Singers use it. And the Singers swear they don't feed the Kampir.|Белый воск — печать Колодца. Им пользуются только Певцы. А Певцы клянутся, что Кампир не кормят.|Oq mum — Quduq muhri. Uni faqat Xonandalar ishlatadi. Xonandalar esa Kampirni boqmaymiz, deb qasam ichishadi.`],
        ['sado', `But this one's fresh. The wax is still soft.|А печать свежая. Воск ещё мягкий.|Lekin bu muhr yangi. Mumi hali yumshoq.`],
        ['hero', `So someone in the Cloister is bringing her living people. Recently.|Значит, кто-то из Обители носит ей живых людей. И недавно.|Demak, Xonaqohdan kimdir unga tirik odam olib kelyapti. Yaqinda ham olib kelgan.`]
      ] },
      { label: `— Can I save him and keep the proof?|— Можно и его спасти, и улику сохранить?|— Uni qutqarib, dalilni ham saqlab qolsa bo'ladimi?`, lines: [
        ['hero', `The seal's on the chain. A sealed chain with a man in it is proof. A broken chain is a story nobody believes.|Печать на цепи. Опечатанная цепь с человеком — улика. Сбитая цепь — байка, которой никто не поверит.|Muhr zanjirda. Ichida odami bor muhrlangan zanjir — dalil. Sindirilgan zanjir — hech kim ishonmaydigan cho'pchak.`],
        ['sado', `So it's him or the proof.|Значит, или он, или улика.|Demak, yo u, yo dalil.`],
        ['hero', `With the seal, Shirin can never say she didn't know.|С этой печатью Ширин уже не скажет, что не знала.|Bu muhr bo'lsa, Shirin «bilmagandim» deya olmaydi.`],
        ['hero', `And if I touch nothing, whoever feeds her never learns I was here.|А если ничего не трогать, тот, кто её кормит, так и не узнает, что я тут был.|Hech narsaga tegmasam, uni boqib yurgan odam bu yerga kelganimni bilmaydi ham.`]
      ] }
    ], [
      { k: 'carried', label: `Break the chain and carry him down to the Tail.|Сбить цепь и отнести его в Хвост.|Zanjirni sindirib, uni Dumga olib tushish.` },
      { k: 'seal', label: `Pry off the seal and take it. Leave him chained.|Отковырять печать и забрать. Его оставить на цепи.|Muhrni ko'chirib olish. Uni zanjirda qoldirish.` },
      { k: 'silent', label: `Touch nothing. Go down and tell no one.|Ничего не трогать. Спуститься и никому не говорить.|Hech narsaga tegmaslik. Pastga tushib, hech kimga aytmaslik.` }
    ], o => {
      setF('chain', o.k);
      if (o.k === 'carried') {
        rep('tail', 2); rep('singers', -1, true); trust(2);
        play([
          ['', `He weighs nothing. All the way down he recites row four. At the Tail gate a woman screams a name and runs to him.|Он почти ничего не весит. Всю дорогу вниз перечисляет четвёртый ряд. У ворот Хвоста какая-то женщина выкрикивает имя и бежит к нему.|U pardek yengil. Pastga tushguncha to'rtinchi qatorni sanab boradi. Dum darvozasida bir ayol qandaydir ismni aytib qichqiradi-yu, unga qarab yuguradi.`],
          ['sado', `She knows him. He doesn't know her. But she knows him. That has to count for something.|Она его знает. Он её — нет. Но она-то его знает. Это ведь чего-то стоит.|Ayol uni taniydi. U ayolni tanimaydi. Lekin ayol uni taniydi-ku. Bu ham bir narsa-ku.`],
          ['', `You left the seal on the broken chain. Let the Singers find it there and wonder who.|Печать осталась на сбитой цепи. Пусть Певцы найдут её там и гадают, чьих это рук дело.|Muhr singan zanjirda qoldi. Xonandalar uni o'sha yerda topib, kimning ishi ekan, deb bosh qotirsin.`]
        ], done);
      } else if (o.k === 'seal') {
        trust(-1);
        play([
          ['', `You pry the seal off. White wax, the Well's mark, still soft. Proof weighs more than one man, you tell yourself.|Ты отковыриваешь печать. Белый воск, знак Колодца, ещё мягкий. Улика весит больше одного человека, — говоришь ты себе.|Muhrni ko'chirib olasan. Oq mum, Quduq belgisi, hali yumshoq. Dalil bitta odamdan og'ir, deysan o'zingga.`],
          ['', `He goes on reciting row four as you leave.|Ты уходишь, а он всё перечисляет четвёртый ряд.|Sen ketyapsan, u esa to'rtinchi qatorni sanashda davom etadi.`],
          ['sado', `Proof of what? That we left him here?|Улика чего? Что мы его тут бросили?|Nimaning dalili? Uni shu yerda tashlab ketganimiznimi?`],
          ['hero', `That someone chained him here. With this, Shirin can't say she didn't know.|Того, что его здесь кто-то приковал. С ней Ширин не скажет, что не знала.|Kimdir uni shu yerga kishanlaganining. Shu bilan Shirin «bilmagandim» deya olmaydi.`]
        ], () => { know(`You keep the Well's seal: proof that the Singers feed the Kampir.|Печать Колодца у тебя: это улика, что Певцы кормят Кампир.|Quduq muhri senda: Xonandalar Kampirni boqayotganining dalili.`); done(); });
      } else {
        rep('singers', 1, true); trust(-2); addVoid(3, CRUEL);
        play([
          ['', `You go down the stairs. Behind you, row four: the potter, the widow, the man with the bad leg. House by house.|Ты спускаешься по лестнице. За спиной — четвёртый ряд: гончар, вдова, хромой. Дом за домом.|Zinadan tushasan. Orqangda to'rtinchi qator: kulol, beva, cho'loq. Uyma-uy.`],
          ['', `No one saw you come, no one sees you go. Whoever feeds the Tower still thinks it keeps its secrets.|Никто не видел, как ты пришёл, никто не видит, как уходишь. Тот, кто кормит Башню, по-прежнему уверен, что она умеет молчать.|Kelganingni hech kim ko'rmadi, ketayotganingni ham hech kim ko'rmaydi. Minorani boqayotgan odam hamon uni sir saqlaydi, deb o'ylaydi.`],
          ['sado', `...|…|...`],
          ['', `Sado doesn't speak for a long time.|Садо долго молчит.|Sado uzoq vaqt gapirmaydi.`]
        ], done);
      }
    }));
  }
});

REST('r_salt', {
  name: `Chaikhana by the Salt Well|Чайхана у солёного колодца|Sho'r quduq choyxonasi`,
  sub: `The water here is bitter at the bottom|Вода здесь горчит на дне|Bu yerda suvning tagi achchiq`,
  arrive(done) {
    play([
      ['', `A chaikhana by a well so old the rope has worn a groove a hand deep. The water tastes of salt and copper.|Чайхана у колодца, такого старого, что верёвка протёрла в камне желоб в ладонь глубиной. Вода отдаёт солью и медью.|Shunchalik qadimiy quduq yonidagi choyxonaki, arqon toshni bir kaft chuqurlikda yeb qo'ygan. Suvdan tuz va mis ta'mi keladi.`],
      ['sado', `He's here again. Rustam. How did he get here before us?|Он опять здесь. Рустам. Как он нас обогнал?|U yana shu yerda. Rustam. Bizdan qanday o'zib ketdi?`],
      ['hero', `He's walking his route. Day three: the salt well. He hasn't missed it in thirty years.|Он идёт своим маршрутом. Третий день — солёный колодец. За тридцать лет ни разу не пропустил.|U o'z yo'lidan yuryapti. Uchinchi kun — sho'r quduq. O'ttiz yilda bir marta ham qoldirmagan.`],
      ['sado', `Does he know we're following him? Or that he's leading us?|Он знает, что мы идём за ним? Или что это он нас ведёт?|Uning ortidan yurganimizni biladimi? Yo bizni o'zi boshlab ketayotganini?`],
      ['sado', `So. What do we actually know so far?|Так. А что мы, собственно, уже знаем?|Xo'sh. Aslida hozircha nimani bilamiz?`],
      ['hero', `A woman in a hood had Rustam's key. She went out past the Rabat, toward the old karez.|У женщины в капюшоне был ключ Рустама. Она ушла мимо Рабата, к старому кяризу.|Yopinchiqli ayolda Rustamning kaliti bo'lgan. U Rabot yonidan eski koriz tomonga ketgan.`],
      () => ((F().rustamMem || 0) >= 1 ? ['hero', `And twenty years ago Rustam wrote a house on my row down twice. I don't know yet why that matters.|А ещё двадцать лет назад Рустам записал дом на моём ряду дважды. Пока не понимаю, при чём тут это.|Yana yigirma yil oldin Rustam mening qatorimdagi bir uyni ikki marta yozgan. Buning nima aloqasi borligini hali tushunmayapman.`] : null),
      ['sado', `And the song keeps eating. Every fall, every taste. So let's not waste nights.|А песня всё ест. Каждое падение, каждая проба. Так что не будем терять ночи.|Qo'shiq esa yeyishda davom etyapti. Har yiqilish, har totish. Shuning uchun kechalarni bekorga o'tkazmaylik.`]
    ], done);
  },
  rustam: rustamAt(2),
  turab(done) {
    if (!once('turab:r_salt')) { play([['mute', `(He taps the table three times, then points toward the bazaar.)|(Он трижды стучит по столу и показывает в сторону базара.)|(U stolni uch marta chertadi-da, bozor tomonni ko'rsatadi.)`]], done); return; }
    play([
      ['', `Turab is waiting for you. He taps the table: once, twice, three times. Then he brings his palm down like a gavel.|Тураб тебя ждёт. Стучит по столу: раз, два, три. Потом опускает ладонь, как молоток аукциониста.|Turob seni kutib o'tiribdi. Stolni chertadi: bir, ikki, uch. Keyin kaftini dallolning bolg'asidek tushiradi.`]
    ], () => hub(`Turab the bakhshi|Тураб-бахши|Turob baxshi`, [
      { label: `— Sado, what is he showing us?|— Садо, что он показывает?|— Sado, u nimani ko'rsatyapti?`, lines: [
        ['sado', `An auction. He's showing you an auction. And now he's touching his throat.|Торги. Он показывает торги. А теперь трогает горло.|Kimoshdi savdosini ko'rsatyapti. Endi tomog'iga tegyapti.`],
        ['hero', `They're selling his voice. At the Memory Bazaar.|Его голос продают. На Базаре памяти.|Uning ovozini sotishyapti. Xotira bozorida.`],
        ['', `He holds up one finger: tomorrow.|Он поднимает один палец: завтра.|U bitta barmog'ini ko'taradi: ertaga.`]
      ] },
      { label: `— What would he do with it, if he got it back?|— А что он будет делать с голосом, если вернёт?|— Ovozi qaytsa, nima qiladi?`, lines: [
        ['sado', `Sing, silly. Tell the old tales. The ones about the Sleeper that the Singers painted over.|Петь, глупый. Рассказывать старые сказания. Про Спящего, те, что Певцы закрасили.|Kuylaydi-da, tentakvoy. Eski ertaklarni aytadi. Xonandalar bo'yab tashlagan Uxlovchi haqidagi ertaklarni.`],
        ['', `Turab nods, hard, twice.|Тураб дважды резко кивает.|Turob ikki marta qattiq bosh irg'aydi.`],
        ['sado', `He knows something about the Sleeper. Something nobody else remembers.|Он что-то знает о Спящем. Что-то, чего больше никто не помнит.|U Uxlovchi haqida nimadir biladi. Boshqa hech kim eslamaydigan nimanidir.`]
      ] }
    ], [
      { k: 'nod', label: `"I'll see what I can do."|«Посмотрю, что можно сделать.»|«Qo'limdan kelganini qilaman.»` }
    ], () => play([
      ['', `He looks away, as if asking were the hardest part.|Он отводит глаза, будто просить — самое трудное.|U ko'zini olib qochadi, go'yo so'rash eng og'ir ish bo'lgandek.`],
      ['sado', `We could buy it, couldn't we? If we have enough tilla?|Мы ведь можем его выкупить? Если тиллы хватит?|Sotib olsak bo'ladi-ku, a? Tillamiz yetsa?`]
    ], done)));
  },
  farrukh: farrukhAt('r_salt', {
    first: [
      ['farrukh', `You found the salt well. Good. Nobody comes here unless they're lost or hiding. Which are you?|Нашёл солёный колодец? Молодец. Сюда приходят, только если заблудились или прячутся. Ты из каких?|Sho'r quduqni topibsan. Yaxshi. Bu yerga faqat adashganlar yo yashiringanlar keladi. Sen qaysi birisan?`],
      ['hero', `Following a Hollow man.|Иду за Пустым.|Bir Bo'shning izidan yuribman.`],
      ['farrukh', `Ah. Lost, then.|А. Значит, заблудился.|A. Demak, adashgansan.`],
      ['', `Before opening his box, he tastes one of his own tumars. His eyes go soft for a moment, then sharp again.|Прежде чем открыть шкатулку, он сам пробует один из своих тумаров. Взгляд на миг теплеет, потом снова становится колючим.|Qutini ochishdan oldin o'z tumarlaridan birini totib ko'radi. Nigohi bir lahza yumshaydi, keyin yana o'tkirlashadi.`],
      ['farrukh', `A boy flying a kite on the Ark wall. Not mine. I was never that happy. It's medicinal.|Мальчишка запускает змея со стены Арка. Не моё. Я никогда не был так счастлив. Это я для здоровья.|Ark devorida varrak uchirayotgan bola. Meniki emas. Hech qachon bunchalik baxtli bo'lmaganman. Bu davolanish uchun.`]
    ],
    questions: [
      { label: `— Why do you live on other people's joy?|— Почему ты живёшь чужой радостью?|— Nega o'zgalarning shodligi bilan yashaysan?`, lines: [
        ['farrukh', `The House of Saffron is very rich and very sad. Plenty of memories in the family. Not a single happy one.|Дом Шафрана очень богат и очень несчастен. Воспоминаний в семье хоть отбавляй. Ни одного счастливого.|Za'faron xonadoni juda boy va juda baxtsiz. Oilada xotira mo'l. Bittasi ham baxtli emas.`],
        ['farrukh', `I sold my grandfather's least favourite wedding to buy a stranger's picnic. They threw me out. Best deal I ever made.|Я продал самую нелюбимую дедову свадьбу, чтобы купить чужой день за городом. Меня выгнали. Лучшая сделка в моей жизни.|Bobomning eng yoqtirmagan to'yini sotib, evaziga birovning sayilini oldim. Uydan haydashdi. Umrimdagi eng yaxshi savdo.`],
        ['sado', `He's joking. His hands aren't.|Он шутит. А руки у него — нет.|U hazillashyapti. Qo'llari esa hazillashmayapti.`]
      ] }
    ],
    info: {
      label: `Slide him some tilla: "Who wants Turab's voice?"|Подвинуть ему тиллу: «Кому нужен голос Тураба?»|Unga tilla surib qo'yish: «Turobning ovozi kimga kerak?»`,
      lines: [
        ['farrukh', `The House of the Humo. Tilla-bek collects rare voices the way other men collect horses. He'll outbid anyone honest.|Дому Хумо. Тилла-бек собирает редкие голоса, как другие — породистых коней. Любого честного покупателя он перебьёт.|Humo xonadoniga. Tillabek noyob ovozlarni boshqalar zotli ot yig'gandek yig'adi. Har qanday halol xaridordan oshirib beradi.`],
        ['farrukh', `Luckily you're not honest, you're a yodchi. A yodchi's hands know a tumar by its weight. A swap takes one breath.|К счастью, ты не честный, ты ёдчи. Руки ёдчи узнают тумар по весу. Подменить — дело одного вдоха.|Baxtingga, sen halol emas, yodchisan. Yodchining qo'li tumarni vaznidan taniydi. Almashtirish — bir nafaslik ish.`]
      ],
      know: `Tilla-bek's man will bid for Turab's voice. The tumar could be swapped.|Человек Тилла-бека будет торговаться за голос Тураба. Тумар можно подменить.|Tillabekning odami Turobning ovoziga narx qo'yadi. Tumarni almashtirib qo'ysa bo'ladi.`
    }
  }),
  lullaby: lullabyAt(ALLA_2)
});
BARKS['r_salt:start'] = [
  `The well is singing. Very low. Can you hear it? No? Just me, then.|Колодец поёт. Совсем тихо. Слышишь? Нет? Значит, только я.|Quduq kuylayapti. Juda past. Eshityapsanmi? Yo'qmi? Demak, faqat men.`
];

LAND('a1_bazaar', {
  name: `The Memory Bazaar|Базар памяти|Xotira bozori`,
  sub: `Here they sell what can't be bought back|Здесь продают то, чего потом не выкупишь|Bu yerda qaytarib olib bo'lmaydigan narsa sotiladi`,
  start: [
    ['', `The Memory Bazaar runs along the Sleeper's spine. Lanterns, carpets, and on every carpet, tumars in rows like dates.|Базар памяти тянется вдоль хребта Спящего. Фонари, ковры, и на каждом ковре рядами, как финики, лежат тумары.|Xotira bozori Uxlovchining tizmasi bo'ylab cho'zilgan. Fonuslar, gilamlar, har gilamda xurmodek qator-qator tumarlar.`],
    ['crowd', `First love, barely tasted! Grandma's hands, warm, warm! A win at the archery games, fresh this week!|Первая любовь, почти не пробованная! Бабушкины руки, тёплые-тёплые! Победа на стрельбах, свежая, этой недели!|Birinchi muhabbat, deyarli totilmagan! Buvining qo'llari, iliq-iliq! Kamon bellashuvidagi g'alaba, shu haftaniki, yangi!`],
    ['sado', `They're selling people. In little triangles. And everyone haggles like it's onions.|Тут продают людей. В маленьких треугольничках. И все торгуются, как за лук.|Odam sotishyapti. Kichkina uchburchaklarda. Hamma esa piyoz olayotgandek savdolashyapti.`],
    ['hero', `To them it is onions. Mind your purse.|Для них это и есть лук. Держи кошелёк.|Ular uchun bu piyozning o'zi. Hamyoningni ehtiyot qil.`],
    ['sado', `I don't have a purse. I don't have hands.|У меня нет кошелька. У меня даже рук нет.|Hamyonim yo'q. Qo'lim ham yo'q.`],
    ['hero', `Turab's voice goes up at the end of the market today. And everything stolen in this city passes through here sooner or later.|Голос Тураба сегодня выставят в конце рядов. А всё краденое в этом городе рано или поздно проходит здесь.|Turobning ovozi bugun bozor oxirida savdoga chiqadi. Bu shahardagi har qanday o'g'irlangan narsa ertami-kechmi shu yerdan o'tadi.`]
  ],
  mid: [
    ['', `A girl with two braids runs between the stalls with a clay jug, laughing at someone behind her.|Девочка с двумя косичками бежит между прилавками с глиняным кувшином и смеётся, оглядываясь на кого-то.|Ikki o'rim sochli qizcha loy ko'za ko'tarib rastalar orasidan yuguradi va orqasidagi kimgadir qarab kuladi.`],
    ['sado', `...|…|...`],
    ['hero', `Sado?|Садо?|Sado?`],
    ['sado', `Wait. Just wait. Let her go by.|Подожди. Просто подожди. Пусть пройдёт.|Shoshma. Shunchaki shoshma. O'tib ketsin.`],
    ['', `The girl turns a corner. The braids flick once and are gone.|Девочка сворачивает за угол. Косички мелькают — и всё.|Qizcha muyulishdan buriladi. O'rimlar bir yalt etadi-yu, g'oyib bo'ladi.`],
    ['hero', `What was that?|Что это было?|Bu nima edi?`],
    ['sado', `Nothing. I thought... nothing. I don't know what I thought. Can we keep walking?|Ничего. Мне показалось… ничего. Сама не знаю, что мне показалось. Пойдём дальше?|Hech narsa. Menga... hech narsa. Nima tuyulganini o'zim ham bilmayman. Ketaveramizmi?`]
  ],
  stones: [
    `"Tasting wears a memory the way a thumb wears a coin. Sold twice, it's thin. Sold ten times, it's only a shape." A dealer's warning.|«Проба стирает память, как палец стирает монету. Дважды проданная — тонкая. Десять раз проданная — одни очертания». Предупреждение торговца.|«Totish xotirani barmoq tangani yeygandek yeydi. Ikki marta sotilgani — yupqa. O'n marta sotilgani — faqat shakli qoladi». Savdogarning ogohlantirishi.`,
    `Market law: what is sung out may be sold. What is planted may not be returned. The Divan takes one coin in ten.|Закон рынка: что выпето, то можно продать. Что посажено, того не вернуть. Диван берёт одну монету из десяти.|Bozor qonuni: kuylab olingan narsani sotish mumkin. Ekilgan narsa qaytarilmaydi. Devon har o'n tangadan bittasini oladi.`,
    `The House of Tumars buys worn memories by weight, cheap, and sells them to the Singers as tithe. Everybody profits. Almost everybody.|Дом тумаров скупает стёртые воспоминания на вес, по дешёвке, и продаёт Певцам как десятину. Все в выигрыше. Почти все.|Tumarlar uyi yeyilgan xotiralarni vazniga qarab arzonga oladi va Xonandalarga ushr qilib sotadi. Hamma foydada. Deyarli hamma.`,
    `A board of names: voices for sale. Some are crossed out. One line reads: Turab, bakhshi of the Tail. Starting price, four hundred tilla.|Доска с именами: голоса на продажу. Некоторые вычеркнуты. На одной строке: «Тураб, бахши Хвоста. Начальная цена — четыреста тилл».|Ismlar taxtasi: sotuvdagi ovozlar. Ba'zilari o'chirilgan. Bir qatorda: «Turob, Dum baxshisi. Boshlang'ich narx — to'rt yuz tilla».`
  ],
  memory: {
    id: 'm_wax',
    lines: [
      ['memory', `You're twelve. A Singer's room, a lamp, the smell of warm wax. Your mother waits outside. You can hear her not crying.|Тебе двенадцать. Комната Певца, лампа, запах тёплого воска. Мать ждёт за дверью. Ты слышишь, как она не плачет.|O'n ikki yoshdasan. Xonandaning xonasi, chiroq, iliq mum hidi. Onang eshik ortida kutyapti. Uning yig'lamay turganini eshitasan.`],
      ['memory', `The Singer says: "Think of the most precious thing you have. Hold on to it. Now let go."|Певец говорит: «Подумай о самом дорогом, что у тебя есть. Держи его. А теперь отпусти».|Xonanda aytadi: «Eng aziz narsangni o'yla. Uni mahkam ushla. Endi qo'yib yubor».`],
      ['memory', `You hold it. It's warm and huge, and it doesn't fit. It doesn't fit into the little triangle.|Ты держишь. Оно тёплое и огромное, и оно не помещается. Не влезает в маленький треугольник.|Ushlab turasan. U iliq va ulkan, sig'maydi. Kichkina uchburchakka sig'maydi.`],
      ['memory', `Then the debt is closed. You walk home lighter, and you don't understand why your mother keeps touching your face.|Потом долг закрыт. Ты идёшь домой налегке и не понимаешь, почему мама всё время трогает твоё лицо.|Keyin qarz yopiladi. Uyga yengil tortib qaytasan va onang nega yuzingni silayverishini tushunmaysan.`],
      ['sado', `That smell again. Wax.|Опять этот запах. Воск.|Yana o'sha hid. Mum.`],
      ['sado', `Ravshan, it didn't fit. Did you feel it? Not all of it fit.|Равшан, оно не поместилось. Ты почувствовал? Влезло не всё.|Ravshan, u sig'madi. Sezdingmi? Hammasi sig'madi.`],
      ['hero', `It's an old memory. Worn. Old memories say strange things.|Старое воспоминание. Стёртое. Старые воспоминания и не такое болтают.|Bu eski xotira. Yeyilib ketgan. Eski xotiralar har xil g'alati gap aytadi.`]
    ]
  },
  people: [
    { look: 'auctioneer' }, { look: 'divan', x: 16 },
    { look: { robe: '#3a4a4a', trim: '#7a8a7a', skin: '#b98a63', head: 'turban', headC: '#d8d0c0', beard: 'long', beardC: '#c8c4bc', staff: 1 }, x: 32 },
    { look: 'gulnora', x: 50 }, { look: 'tailman', x: 64 }
  ],
  exit(done) {
    play([
      ['auctioneer', `Lot forty! The voice of Turab the bakhshi, sung out whole in the year of the dry spring. It still knows every old dastan!|Лот сороковой! Голос Тураба-бахши, выпетый целиком в год сухой весны. Помнит все старые дастаны до единого!|Qirqinchi lot! Turob baxshining ovozi, quruq bahor yili butunligicha kuylab olingan. Eski dostonlarning hammasini biladi!`],
      ['auctioneer', `It won't sing the tithe, which is how he lost it, ha! But for a wedding? A funeral? Unforgettable!|Десятину им не споёшь — за то он его и лишился, ха! Но на свадьбу? На поминки? Незабываемо!|U bilan ushr kuylab bo'lmaydi — shuning uchun undan ayrilgan-da, ha! Lekin to'yga? Ma'rakaga? Unutilmas!`],
      ['envoy', `The House of the Humo bids four hundred.|Дом Хумо даёт четыреста.|Humo xonadoni to'rt yuz beradi.`],
      ['', `At the edge of the crowd Turab stands with his dutar, listening to the price of his own throat.|С краю толпы стоит Тураб с дутаром и слушает, во что оценили его горло.|Olomon chetida Turob dutori bilan turibdi va o'z tomog'iga qo'yilgan narxni tinglayapti.`]
    ], () => hub(`Lot forty: Turab's voice|Лот сороковой: голос Тураба|Qirqinchi lot: Turobning ovozi`, [
      { label: `— Who's bidding for the Humo?|— Кто торгуется от Хумо?|— Humo nomidan kim savdolashyapti?`, lines: [
        ['sado', `Tilla-bek's man. He'll lock it in a cellar with a thousand other voices and never open the door.|Человек Тилла-бека. Он запрёт голос в подвале с тысячей других и никогда не откроет дверь.|Tillabekning odami. U ovozni yana ming ovoz bilan yerto'laga qamab qo'yadi, eshigini hech qachon ochmaydi.`],
        ['hero', `Tilla-bek. Head of the Divan, the council of rich houses. He collects rare memories like other men collect horses.|Тилла-бек. Глава Дивана, совета богатых домов. Собирает редкие воспоминания, как другие — коней.|Tillabek. Devonning, ya'ni boy xonadonlar kengashining boshlig'i. Noyob xotiralarni boshqalar ot yig'gandek yig'adi.`],
        ['hero', `And his garden is where I'm going next. Crossing his man today isn't clever.|А мне следующим делом идти к нему в сад. Переходить дорогу его человеку сегодня — не самое умное.|Keyin esa uning bog'iga boraman. Bugun uning odamining yo'lini to'sish aqldan emas.`]
      ] },
      { label: `— Four hundred. Can we beat that?|— Четыреста. Мы сможем перебить?|— To'rt yuz. Undan oshira olamizmi?`, lines: [
        ['sado', `Can we even afford it?|Нам это вообще по карману?|Bunga pulimiz yetadimi o'zi?`],
        ['hero', `If I show the Well's mark, I'm bidding for the Singers' archive. The Humo won't pick a fight with the Well over a voice. A hundred and fifty should do.|Если показать знак Колодца, я торгуюсь от архива Певцов. Хумо не станут ссориться с Колодцем из-за одного голоса. Ста пятидесяти хватит.|Quduq belgisini ko'rsatsam, Xonandalar arxivi nomidan savdolashgan bo'laman. Humo bitta ovoz uchun Quduq bilan urishmaydi. Yuz ellik yetadi.`]
      ] },
      { label: `— Or I could just swap it.|— Или можно просто подменить.|— Yoki shunchaki almashtirib qo'ysam bo'ladi.`, lines: [
        ['hero', `Pick up the lot to "check the wax", put down a worn one. A yodchi's hands know tumars by weight.|Взять лот «проверить воск» и положить на место стёртый. Руки ёдчи узнают тумары по весу.|Lotni «mumini tekshirish» uchun qo'lga olib, o'rniga yeyilganini qo'yish. Yodchining qo'li tumarni vaznidan taniydi.`],
        ['sado', `And if they catch you?|А если поймают?|Ushlab olishsa-chi?`],
        ['hero', `Then the Divan remembers my face. It will either way.|Тогда Диван запомнит моё лицо. Он его так и так запомнит.|Unda Devon yuzimni eslab qoladi. Baribir eslab qoladi.`]
      ] }
    ], [
      { k: 'bought', label: `Raise the Well's mark: "For the Singers' archive."|Поднять знак Колодца: «Для архива Певцов».|Quduq belgisini ko'tarish: «Xonandalar arxivi uchun».`, price: 150 },
      { k: 'stolen', label: `Ask to "check the wax" and swap the lot for a worn tumar.|Попросить «проверить воск» и подменить лот стёртым тумаром.|«Mumini tekshirib ko'ray» deb, lotni yeyilgan tumarga almashtirish.` },
      { k: 'left', label: `"An old man's voice isn't my debt."|«Голос старика — не мой долг.»|«Cholning ovozi mening qarzim emas.»` }
    ], o => {
      setF('voice', o.k);
      let lines;
      if (o.k === 'bought') {
        trust(1); rep('divan', -1, true); rep('tail', 1);
        lines = [
          ['hero', `The Well's yodchi bids one hundred and fifty. For the Singers' archive.|Ёдчи Колодца даёт сто пятьдесят. Для архива Певцов.|Quduq yodchisi yuz ellik beradi. Xonandalar arxivi uchun.`],
          ['envoy', `...My lord buys voices, not quarrels with the Well. Take it, yodchi. He'll remember your face.|…Мой господин покупает голоса, а не ссоры с Колодцем. Забирай, ёдчи. Он запомнит твоё лицо.|...Xo'jayinim ovoz sotib oladi, Quduq bilan janjal emas. Ol, yodchi. U yuzingni eslab qoladi.`],
          ['', `The tumar is warm. It hums in your palm, very faintly, like a man clearing his throat.|Тумар тёплый. Он еле слышно гудит в ладони, как человек, который откашливается.|Tumar iliq. Kaftingda zo'rg'a eshitilib g'uvillaydi — tomoq qirayotgan odamdek.`],
          ['sado', `Give it back to him at the next chaikhana. I want to hear what he sounds like.|Отдай ему голос в следующей чайхане. Хочу услышать, как он звучит.|Keyingi choyxonada unga qaytarib ber. Ovozi qanaqa ekanini eshitgim keladi.`]
        ];
      } else if (o.k === 'stolen') {
        trust(1); rep('divan', -2);
        lines = [
          ['', `You lift lot forty to "check the wax". Your hands know tumars by weight. You put down someone's worn-out wedding.|Ты берёшь сороковой лот — «проверить воск». Руки знают тумары по весу. На место ложится чья-то стёртая свадьба.|Qirqinchi lotni «mumini tekshirish» uchun olasan. Qo'llaring tumarni vaznidan taniydi. O'rniga kimningdir yeyilgan to'yi qoladi.`],
          ['auctioneer', `Sold to the House of the Humo, four hundred!|Продано дому Хумо за четыреста!|To'rt yuzga Humo xonadoniga sotildi!`],
          ['sado', `Ravshan! You're a thief! ...Do it again.|Равшан! Да ты вор! …Сделай так ещё раз.|Ravshan! Sen o'g'ri ekansan-ku! ...Yana bir marta qil.`],
          ['', `Across the crowd Turab's eyes find yours. He doesn't smile. He bows, very slightly, the way a bakhshi bows to a good line.|Через толпу Тураб встречается с тобой глазами. Не улыбается. Чуть заметно кланяется — так бахши кланяются удачной строке.|Olomon osha Turobning ko'zi seniki bilan to'qnashadi. U jilmaymaydi. Baxshilar yaxshi misraga ta'zim qilgandek, sezilar-sezilmas bosh egadi.`]
        ];
      } else {
        trust(-1);
        lines = [
          ['auctioneer', `Sold to the House of the Humo, four hundred!|Продано дому Хумо за четыреста!|To'rt yuzga Humo xonadoniga sotildi!`],
          ['', `Turab turns and walks off through the crowd. He doesn't look back. He's had practice.|Тураб поворачивается и уходит сквозь толпу. Не оглядывается. Ему не впервой.|Turob o'girilib, olomon orasidan ketadi. Orqasiga qaramaydi. Bunga o'rganib qolgan.`],
          ['sado', `He was standing right there.|Он же стоял прямо тут.|U shundoqqina yonimizda turgandi-ku.`],
          ['hero', `And the Humo never looked at me twice. Good.|Зато Хумо на меня даже не взглянули. Это хорошо.|Humodagilar menga qayrilib ham qarashmadi. Yaxshi.`]
        ];
      }
      play(lines.concat([
        ['gulnora', `Yodchi! Please. You're allowed into the Ark. We're not.|Ёдчи! Пожалуйста. Вас пускают в Арк. Нас — нет.|Yodchi aka! Iltimos. Sizni Arkka kiritishadi. Bizni kiritishmaydi.`],
        ['gulnora', `Two winters ago I sold the memory of my first love to buy my mother's medicine. I knew what I was selling.|Две зимы назад я продала память о первой любви — на лекарство для мамы. Я знала, что продаю.|Ikki qish oldin onamning dorisiga deb birinchi muhabbatimning xotirasini sotdim. Nimani sotayotganimni bilardim.`],
        ['gulnora', `I didn't know where it would go. They planted it in a merchant's daughter in the Ark. She's getting married today. With my love inside her.|Я не знала, куда она попадёт. Её посадили в купеческую дочку из Арка. Сегодня у неё свадьба. С моей любовью внутри.|Qayerga ketishini bilmasdim. Uni Arkdagi bir savdogarning qiziga ekishibdi. Bugun uning to'yi. Ichida mening muhabbatim bilan.`]
      ]), () => hub(`Gulnora's request|Просьба Гульноры|Gulnoraning iltimosi`, [
        { label: `— Planted?|— Посадили?|— Ekishgan?`, lines: [
          ['hero', `A memory that's been sung out can be sung into someone else. They believe it's theirs. They never find out.|Выпетое воспоминание можно вложить песней в другого. Тот поверит, что оно его. И никогда не узнает.|Kuylab olingan xotirani boshqa odamga kuylab solsa bo'ladi. U uni o'zimniki deb biladi. Hech qachon bilmaydi ham.`],
          ['sado', `So the bride loves someone she's never met?|Значит, невеста любит того, кого в глаза не видела?|Demak, kelin hech ko'rmagan odamini sevadimi?`],
          ['gulnora', `She loves the way I loved. She just doesn't know who.|Она любит так, как любила я. Только не знает кого.|U men sevgandek sevadi. Faqat kimni sevayotganini bilmaydi.`]
        ] },
        { label: `— What do you want me to do?|— Чего ты от меня хочешь?|— Mendan nima istaysan?`, lines: [
          ['gulnora', `I don't want it back. I don't know what I want. I want to see it. I want somebody to know it was mine.|Мне не нужно её обратно. Сама не знаю, чего хочу. Хочу увидеть. Хочу, чтобы хоть кто-то знал: это было моё.|Uni qaytarib olishni xohlamayman. Nima xohlashimni o'zim ham bilmayman. Ko'rgim keladi. Hech bo'lmasa bitta odam u meniki bo'lganini bilsin.`]
        ] }
      ], [
        { k: 'ark', label: `"I'll be in the Ark today."|«Я сегодня буду в Арке.»|«Bugun Arkda bo'laman.»` }
      ], () => play([
        ['hero', `Find me at the wedding.|Найди меня на свадьбе.|Meni to'yda topasan.`],
        ['sado', `We'll be there.|Мы придём.|Biz boramiz.`]
      ], () => { setF('gulnoraAsk', 1); done(); })));
    }));
  }
});
BARKS['a1_bazaar:start'] = [
  `That man's selling a tumar labelled "The Sea". Nobody here has ever seen the sea.|Вон тот продаёт тумар с надписью «Море». Тут никто никогда не видел моря.|Anavi odam «Dengiz» deb yozilgan tumar sotyapti. Bu yerda hech kim dengiz ko'rmagan.`,
  `Someone's crying behind that carpet. Selling, I think. Not buying.|За тем ковром кто-то плачет. Продаёт, наверное. Не покупает.|Anavi gilam ortida kimdir yig'layapti. Sotyapti, shekilli. Olmayapti.`
];
BARKS['a1_bazaar:mid'] = [
  `All the lanterns are the same yellow as tumar wax. I hate this place.|Все фонари жёлтые, как воск на тумарах. Ненавижу это место.|Hamma fonuslar tumar mumidek sap-sariq. Bu joyni yomon ko'raman.`,
  `See those people with the too-happy faces? Farrukh's customers, I bet.|Видишь тех, с чересчур счастливыми лицами? Покупатели Фарруха, спорим?|Anavi haddan tashqari baxtli yuzlilarni ko'ryapsanmi? Farruxning xaridorlari, garov o'ynaymiz?`
];

LAND('a1_ark', {
  name: `The Ark: Gardens of the Divan|Арк: сады Дивана|Ark: Devon bog'lari`,
  sub: `On the Sleeper's shoulders, where the water is sweet|На плечах Спящего, где вода сладкая|Uxlovchining yelkasida, suvi shirin joyda`,
  start: [
    ['', `The Ark sits on the Sleeper's shoulders. Here the water from his skin is sweet, and they run it through marble channels to the roses.|Арк стоит на плечах Спящего. Здесь вода с его кожи сладкая, и её пускают по мраморным арыкам к розам.|Ark Uxlovchining yelkasida turibdi. Bu yerda uning terisidan chiqqan suv shirin, uni marmar ariqlardan atirgullarga oqizishadi.`],
    ['sado', `Apricots! A whole wall of apricot trees! Can you smell them? Can you smell anything except tilla?|Абрикосы! Целая стена абрикосовых деревьев! Чуешь? Ты вообще что-нибудь чуешь, кроме тиллы?|O'riklar! Bir devor to'la o'rik daraxti! Hidini sezyapsanmi? Umuman tilladan boshqa narsaning hidini bilasanmi?`],
    ['hero', `I can smell them.|Чую.|Sezyapman.`],
    ['sado', `The neighbour's were always sweeter. The ones hanging over the wall. Stolen ones always are.|У соседей всегда были слаще. Те, что свешивались через стену. Краденые всегда слаще.|Qo'shnining o'rigi doim shirinroq edi. Devor oshib osilib turganlari. O'g'irlangani doim shirin bo'ladi.`],
    ['hero', `What neighbour?|У каких соседей?|Qaysi qo'shni?`],
    ['sado', `...Anyone's neighbour. Everyone steals apricots over a wall once. Don't they?|…У чьих угодно. Все хоть раз таскали абрикосы через забор. Разве нет?|...Har kimning qo'shnisi-da. Hamma bir marta devor osha o'rik o'g'irlagan. Shunaqa emasmi?`],
    ['hero', `We're here for the wedding Gulnora told us about. And for the Divan. They want the founders' tumars as badly as Shirin. If anyone has heard where they went, it's someone here.|Мы тут ради той свадьбы, про которую говорила Гульнора. И ради Дивана: тумары основателей им нужны не меньше, чем Ширин. Если кто и слышал, куда они делись, то здесь.|Biz Gulnora aytgan to'y uchun keldik. Devon uchun ham: asoschilar tumarlari ularga ham Shirinchalik kerak. Qayoqqa ketganini kimdir eshitgan bo'lsa, shu yerda.`]
  ],
  mid: [
    ['', `Guards in red and gold, a Humo feather on every helmet. Behind a fountain, music. A wedding is starting.|Стражники в красном с золотом, на каждом шлеме перо Хумо. За фонтаном играет музыка. Начинается свадьба.|Qizil-oltin kiyimli soqchilar, har dubulg'ada Humo pati. Favvora ortida soz chalinyapti. To'y boshlanyapti.`],
    ['sado', `The Humo is a bird. Whoever its shadow falls on becomes a king, they say. Tilla-bek thinks it fell on him.|Хумо — это птица. Говорят, на кого упадёт её тень, тот станет царём. Тилла-бек думает, что упала на него.|Humo — qush. Aytishlaricha, soyasi kimga tushsa, o'sha podsho bo'ladi. Tillabek soya menga tushgan, deb o'ylaydi.`]
  ],
  stones: [
    `"The Humo's shadow falls on whom it chooses, and that one shall rule." Under the carving someone has scratched: "It chose a cellar."|«Тень Хумо падает на того, кого она изберёт, и тот будет править». Под резьбой кто-то нацарапал: «Она избрала подвал».|«Humoning soyasi kimni tanlasa, o'shaga tushadi va u hukmdor bo'ladi». O'ymakor yozuv tagida kimdir tirnab yozibdi: «U yerto'lani tanladi».`,
    `The Seven built the Ark on his shoulders because the water is sweetest there. The houses of the Divan still carry the founders' names.|Семеро построили Арк у него на плечах, потому что там самая сладкая вода. Дома Дивана до сих пор носят имена основателей.|Yettov Arkni uning yelkasiga qurgan, chunki suvning eng shirini o'sha yerda. Devon xonadonlari hamon asoschilarning ismini olib yuradi.`,
    `"Rare memories bought: childhoods, first snows, mothers' faces. Discretion assured." The House of the Humo.|«Покупаем редкие воспоминания: детство, первый снег, лица матерей. Тайна гарантирована». Дом Хумо.|«Noyob xotiralar sotib olinadi: bolalik, birinchi qor, onalarning yuzi. Sir saqlanadi». Humo xonadoni.`,
    `The Ark pays its tithe on silver trays, with memories bought in the Tail. No one here has paid with their own in a hundred years.|Арк платит десятину на серебряных подносах — воспоминаниями, купленными в Хвосте. Своими здесь никто не платил уже сто лет.|Ark ushrini kumush laganlarda, Dumdan sotib olingan xotiralar bilan to'laydi. Bu yerda yuz yildan beri hech kim o'zinikini bermagan.`
  ],
  memory: {
    id: 'm_apricot',
    lines: [
      ['memory', `Summer. The neighbour's apricot tree hangs over your wall: heavy, golden, forbidden.|Лето. Соседский абрикос свешивается через вашу стену — тяжёлый, золотой, запретный.|Yoz. Qo'shnining o'rigi devoringiz osha osilib turibdi — og'ir, tillarang, taqiqlangan.`],
      ['memory', `You make a step with your hands. Someone light climbs up, laughing, and throws apricots down to you. One, two, three.|Ты складываешь ладони ступенькой. Кто-то лёгкий, смеясь, забирается наверх и кидает тебе абрикосы. Один, два, три.|Kaftlaringni zinapoya qilasan. Kimdir yengilgina, kula-kula tepaga chiqadi va senga o'rik otadi. Bir, ikki, uch.`],
      ['memory', `You eat them on the roof and spit the stones over the edge. Someone keeps theirs. Someone always keeps theirs.|Вы едите их на крыше и плюёте косточки вниз. Кто-то свои оставляет. Кто-то всегда оставляет свои.|Ularni tomda yeysizlar, danagini pastga tupurasizlar. Kimdir o'zinikini saqlab qoladi. Kimdir doim o'zinikini saqlab qoladi.`],
      ['sado', `To plant them. You keep the stones to plant them. Everybody knows that.|Чтобы посадить. Косточки оставляют, чтобы посадить. Это все знают.|Ekish uchun. Danakni ekish uchun saqlashadi. Buni hamma biladi.`],
      ['hero', `Who is "someone"? Every memory I find has a hole the same shape.|Кто этот «кто-то»? В каждом воспоминании, что я нахожу, дыра одной и той же формы.|Bu «kimdir» kim o'zi? Topgan har bir xotiramda bir xil shakldagi teshik bor.`],
      ['sado', `Maybe that's just your shape.|Может, это просто твоя форма.|Balki bu shunchaki sening shaklingdir.`]
    ]
  },
  people: [{ look: 'guard' }, { look: 'divan', x: 14 }, { look: 'tillabek', x: 30 }, { look: 'bride', x: 52 }, { look: 'gulnora', x: 70 }],
  exit(done) {
    play([
      ['tillabek', `Ravshan the yodchi. Shirin's hound on a leash. Sit, sit. Have an apricot. From my grandfather's tree. Stolen, originally.|Ёдчи Равшан. Пёс Ширин на поводке. Садись, садись. Угощайся абрикосом. С дедушкиного дерева. Изначально краденого.|Yodchi Ravshan. Shirinning bog'ichdagi iti. O'tir, o'tir. O'rikdan ol. Bobomning daraxtidan. Aslida o'g'irlab ekilgan.`],
      ['tillabek', `You're hunting the founders' tumars. So am I. Let's not pretend otherwise. I have an offer.|Ты охотишься за тумарами основателей. Я тоже. Не будем делать вид, что это не так. У меня к тебе предложение.|Sen asoschilar tumarlarini qidiryapsan. Men ham. Boshqacha qilib ko'rsatib o'tirmaylik. Senga taklifim bor.`]
    ], () => hub(`Tilla-bek's offer|Предложение Тилла-бека|Tillabekning taklifi`, [
      { label: `— Who are you, exactly?|— Кто вы, собственно, такой?|— Siz o'zi kimsiz?`, lines: [
        ['tillabek', `Akhror Tilla-bek. Head of the House of the Humo and, this year, of the Divan: the council of the old houses, heirs of the Seven.|Ахрор Тилла-бек. Глава дома Хумо, а в этом году и Дивана — совета старых домов, наследников Семерых.|Axror Tillabek. Humo xonadonining boshlig'i, bu yil esa Devonning ham. Devon — Yettovning merosxo'rlari, eski xonadonlar kengashi.`],
        ['tillabek', `We own the water. Everyone else rents it.|Вода принадлежит нам. Остальные её арендуют.|Suv bizniki. Qolganlar uni ijaraga oladi.`]
      ] },
      { label: `— What do you want the tumars for?|— Зачем вам тумары?|— Tumarlar sizga nimaga kerak?`, lines: [
        ['tillabek', `Shirin wants to feed the Sleeper forever. I want to chain him properly, with the founders' own song, and sell memory from here to Kashgar.|Ширин хочет кормить Спящего вечно. А я хочу заковать его как следует — песней самих основателей — и торговать памятью отсюда до Кашгара.|Shirin Uxlovchini abadiy boqmoqchi. Men esa uni asoschilarning o'z qo'shig'i bilan mahkam kishanlab, bu yerdan Qashqargacha xotira sotmoqchiman.`],
        ['tillabek', `No more of Shirin's great payments. No more of the Tail sung empty to buy a quiet year. A chain is cheaper than children.|Хватит с города великих плат Ширин. Никакого Хвоста, выпетого досуха ради одного спокойного года. Цепь обходится дешевле детей.|Shirinning katta to'lovlariga chek qo'yiladi. Bir yillik tinchlik uchun Dumni kuylab bo'shatish bo'lmaydi. Kishan bolalardan arzonga tushadi.`],
        ['sado', `He wants to sell the whole city. Politely.|Он хочет продать весь город. Очень вежливо.|U butun shaharni sotmoqchi. Odob bilan.`]
      ] },
      { label: `— And what's in it for me?|— А мне с этого что?|— Menga buning nima foydasi bor?`, lines: [
        ['tillabek', `Shirin will thank you by stopping a song. I'd thank you with a life. Bring the tumars to me.|Ширин отблагодарит тебя тем, что остановит песню. Я — целой жизнью. Принеси тумары мне.|Shirin rahmatini qo'shiqni to'xtatish bilan aytadi. Men esa butun bir umr bilan. Tumarlarni menga olib kel.`],
        ['tillabek', `I have a Singer of my own who can unpick the Pledge Song. Quietly. Painlessly. Mostly.|У меня есть свой Певец, он распустит Песню залога. Тихо. Безболезненно. Почти.|O'zimning Xonandam bor, Garov qo'shig'ini so'kib tashlaydi. Jimgina. Og'riqsiz. Deyarli.`],
        ['sado', `He's lying about "painlessly". Probably not about the rest.|Насчёт «безболезненно» он врёт. А насчёт остального, похоже, нет.|«Og'riqsiz» degani yolg'on. Qolgani, shekilli, rost.`]
      ] },
      { label: `— And if I say no?|— А если я откажусь?|— Rad etsam-chi?`, lines: [
        ['sado', `He smiles too much. Say no, and somebody in this garden will remember your face.|Он слишком много улыбается. Откажешь — и кто-нибудь в этом саду запомнит твоё лицо.|U juda ko'p jilmayadi. Rad etsang, bu bog'da kimdir yuzingni eslab qoladi.`],
        ['hero', `And if I say yes, Shirin will.|А соглашусь — запомнит Ширин.|Rozi bo'lsam — Shirin eslab qoladi.`]
      ] }
    ], [
      { k: 'accepted', label: `"When I find them, you'll be the first to know."|«Когда найду, вы узнаете первым.»|«Topsam, birinchi bo'lib siz bilasiz.»` },
      { k: 'refused', label: `"I've had enough masters for one week."|«С меня на эту неделю хватит хозяев.»|«Shu haftaga xo'jayinlar yetib ortdi.»` }
    ], o => {
      setF('tillabek', o.k);
      let a;
      if (o.k === 'accepted') {
        rep('divan', 3); rep('singers', -1, true); gold(60);
        a = [
          ['tillabek', `Splendid. Sixty tilla, on account. A man who can be bought is a man who can be trusted.|Превосходно. Шестьдесят тилл — задаток. Кого можно купить, тому можно доверять.|Ajoyib. Oltmish tilla — oldindan. Sotib olsa bo'ladigan odamga ishonsa ham bo'ladi.`],
          ['sado', `You'd sell him the Sleeper?|Ты продашь ему Спящего?|Uxlovchini unga sotasanmi?`],
          ['hero', `I sold him a promise. It's cheaper.|Я продал ему обещание. Оно дешевле.|Men unga va'da sotdim. Va'da arzonroq.`]
        ];
      } else {
        rep('divan', -2); trust(1);
        a = [
          ['tillabek', `Pity. Bahodir will see you out. He's very good at seeing people out.|Жаль. Баходир тебя проводит. Он прекрасно провожает гостей.|Afsus. Bahodir seni kuzatib qo'yadi. U mehmon kuzatishga juda usta.`],
          ['sado', `I liked that. "Enough masters." Say it to Shirin too.|Мне понравилось. «Хватит хозяев». Скажи это и Ширин.|Bu menga yoqdi. «Xo'jayinlar yetib ortdi». Shirinning o'ziga ham ayt.`]
        ];
      }
      play(a.concat([
        ['', `In the garden, a bride in red and white sings to her groom. Her eyes are wet with love. The groom looks frightened of it.|В саду невеста в красном и белом поёт жениху. Глаза у неё влажные от любви. Жених, кажется, этой любви побаивается.|Bog'da qizil-oq libosli kelin kuyoviga qo'shiq aytyapti. Ko'zlari muhabbatdan nam. Kuyov esa bu muhabbatdan cho'chiyotganga o'xshaydi.`],
        ['gulnora', `That's it. ...Not the groom. The way she looks at him. That's how I looked at Bakhtiyor, by the karez, when I was sixteen.|Вот она. …Не жених. То, как она на него смотрит. Так я смотрела на Бахтияра у кяриза, когда мне было шестнадцать.|Mana u. ...Kuyov emas. Unga qanday qarayotgani. O'n olti yoshimda koriz bo'yida Baxtiyorga xuddi shunday qarardim.`],
        ['gulnora', `He drowned that autumn. She's looking at a merchant's son with my drowned boy's love.|Той осенью он утонул. А она смотрит на купеческого сынка с любовью к моему утонувшему мальчику.|O'sha kuzi u cho'kib ketdi. U esa savdogarning o'g'liga mening cho'kib ketgan yigitimga bo'lgan muhabbat bilan qarayapti.`],
        ['bride', `Why is everyone staring? I love him. I've always loved him. Ever since the karez. ...There's no karez in the Ark. Why did I say karez?|Почему все смотрят? Я его люблю. Всегда любила. С самого кяриза. …В Арке нет кяризов. Почему я сказала «кяриз»?|Nega hamma tikilib qoldi? Men uni sevaman. Doim sevganman. Koriz bo'yidan beri. ...Arkda koriz yo'q-ku. Nega «koriz» dedim?`]
      ]), () => hub(`The Stranger's Wedding|Чужая свадьба|Begona to'y`, [
        { label: `— What happens if I pull the seam?|— Что будет, если вытянуть шов?|— Chokni tortsam, nima bo'ladi?`, lines: [
          ['hero', `A planted memory always has a seam. I find it and pull, and the love comes out into a tumar. Gulnora gets it back.|У посаженного воспоминания всегда есть шов. Нащупать, потянуть — и любовь выйдет в тумар. Гульнора получит её назад.|Ekilgan xotiraning doim choki bo'ladi. Topib tortsam, muhabbat tumarga chiqadi. Gulnora uni qaytarib oladi.`],
          ['sado', `And the bride?|А невеста?|Kelin-chi?`],
          ['hero', `She stops loving him. Here, at her own wedding, in front of everyone. She never loved him in the first place.|Разлюбит его. Прямо здесь, на своей свадьбе, при всех. Она ведь его никогда и не любила.|Uni sevmay qo'yadi. Shu yerning o'zida, o'z to'yida, hammaning ko'zi oldida. Aslida u uni hech qachon sevmagan.`]
        ] },
        { label: `— Gulnora, what do you want?|— Гульнора, а ты чего хочешь?|— Gulnora, o'zing nima istaysan?`, lines: [
          ['gulnora', `I don't know. If you take it out of her, I'll have it again. And she'll have nothing.|Не знаю. Если вы её вынете, она снова будет моя. А у той не останется ничего.|Bilmayman. Undan olsangiz, yana meniki bo'ladi. Unda esa hech narsa qolmaydi.`],
          ['gulnora', `And it's Bakhtiyor's love. He's dead. I'd be loving a dead boy again, every day.|И ведь это любовь к Бахтияру. Его нет. Я опять буду каждый день любить мёртвого.|Bu Baxtiyorga bo'lgan muhabbat-ku. U yo'q. Yana har kuni o'lgan yigitni sevib yuraman.`],
          ['gulnora', `If you leave it, at least somebody is happy with it.|А если оставите — хоть кто-то будет с ней счастлив.|Qoldirsangiz, hech bo'lmasa kimdir u bilan baxtli bo'ladi.`]
        ] },
        { label: `— Who'd pay to keep this quiet?|— Кто заплатит, чтобы это не всплыло?|— Buni sir tutish uchun kim pul to'laydi?`, lines: [
          ['sado', `Her father, I bet. A merchant's daughter with a bought love. The whole Ark would laugh at them.|Её отец, спорим? Купеческая дочка с купленной любовью — весь Арк будет над ними смеяться.|Otasi, garov o'ynaymiz. Sotib olingan muhabbatli savdogar qizi — butun Ark ulardan kuladi.`],
          ['hero', `A secret like that is worth a lot to the right man. And if he pays, nobody pulls anything. The bride keeps her wedding.|Нужному человеку такая тайна стоит дорого. А заплатит — никто ничего тянуть не станет. Свадьба останется свадьбой.|Bunday sir kerakli odamga qimmat turadi. To'lasa, hech kim hech narsani tortmaydi. Kelinning to'yi buzilmaydi.`],
          ['sado', `...You're not going to. Are you?|…Ты ведь не станешь. Правда?|...Bunday qilmaysan-a? To'g'rimi?`]
        ] }
      ], [
        { k: 'returned', label: `Take the bride's hand, find the seam, and pull.|Взять невесту за руку, нащупать шов и потянуть.|Kelinning qo'lini olib, chokni topib, tortish.` },
        { k: 'left', label: `Leave the bride her borrowed love.|Оставить невесте её чужую любовь.|Kelinga begona muhabbatini qoldirish.` },
        { k: 'blackmail', label: `Take her father aside and name a price for silence.|Отвести её отца в сторону и назвать цену молчания.|Otasini chetga tortib, sukut narxini aytish.` }
      ], w => {
        setF('gulnora', w.k);
        if (w.k === 'returned') {
          rep('tail', 2); rep('divan', -2); trust(1);
          play([
            ['', `You take the bride's hand as if to bless her, find the seam with your thumb, and pull.|Ты берёшь невесту за руку, будто благословляешь, нащупываешь шов большим пальцем — и тянешь.|Duo qilayotgandek kelinning qo'lini olasan, bosh barmog'ing bilan chokni topasan-u, tortasan.`],
            ['bride', `...Who are you? Who is that man? Why am I in this dress?|…Вы кто? Кто этот человек? Почему я в этом платье?|...Siz kimsiz? Anavi odam kim? Nega egnimda shu ko'ylak?`],
            ['', `Her father shouts for the guards. In the noise, Gulnora presses the tumar to her chest and doesn't open it.|Её отец кричит стражу. В суматохе Гульнора прижимает тумар к груди и не открывает.|Otasi soqchilarni chaqirib baqiradi. To'polonda Gulnora tumarni ko'ksiga bosadi va ochmaydi.`],
            ['gulnora', `Thank you. I'll taste it once a year, on the day he drowned. That's enough.|Спасибо. Буду пробовать её раз в год, в тот день, когда он утонул. Мне хватит.|Rahmat. Yiliga bir marta, u cho'kkan kuni totaman. Shu yetadi.`],
            ['sado', `The bride will cry tonight. But they'll be her own tears.|Невеста сегодня будет плакать. Но слёзы будут её собственные.|Kelin bu kecha yig'laydi. Lekin ko'z yoshlari o'zining bo'ladi.`]
          ], done);
        } else if (w.k === 'left') {
          play([
            ['gulnora', `...She looks happy. I was happy like that once. Somebody should be.|…Она счастливая. Я когда-то тоже была такой. Хоть кто-то должен быть.|...U baxtli ko'rinyapti. Men ham bir paytlar shunday baxtli edim. Kimdir baxtli bo'lishi kerak-ku.`],
            ['sado', `Maybe that was kind. I can't tell anymore what's kind in this city.|Может, это и было по-доброму. Я уже не понимаю, что в этом городе доброе.|Balki bu yaxshilik bo'lgandir. Bu shaharda nima yaxshilik ekanini endi ajratolmayman.`]
          ], done);
        } else {
          rep('divan', -1); rep('tail', -1); trust(-2); addVoid(3, CRUEL); gold(120);
          play([
            ['', `The bride's father pays fast, the way rich men pay for things they don't want named. One hundred and twenty.|Отец невесты платит быстро — так богачи платят за то, что не должно прозвучать вслух. Сто двадцать.|Kelinning otasi tez to'laydi — boylar tilga olinmasligi kerak bo'lgan narsa uchun shunday to'laydi. Yuz yigirma.`],
            ['gulnora', `You sold it again. My love. You sold it again.|Вы снова её продали. Мою любовь. Снова продали.|Uni yana sotdingiz. Mening muhabbatimni. Yana sotdingiz.`],
            ['sado', `...|…|...`]
          ], done);
        }
      }));
    }));
  }
});
BARKS['a1_ark:start'] = [
  `The roses here get more water than the whole Tail.|Розам тут достаётся больше воды, чем всему Хвосту.|Bu yerdagi atirgullarga butun Dumdan ko'ra ko'proq suv tegadi.`,
  `Everyone in the Ark smiles only with their mouths. Is that the fashion?|В Арке все улыбаются одним ртом. Мода такая?|Arkda hamma faqat og'zi bilan jilmayadi. Shunaqa rasm bormi?`
];
BARKS['a1_ark:mid'] = [
  `That music is a wedding. The one Gulnora told us about.|Эта музыка — свадьба. Та самая, про которую говорила Гульнора.|Bu soz — to'yniki. Gulnora aytgan o'sha to'y.`,
  `A guard's watching us. Walk like you belong here. Like a rich man. Slower.|Стражник смотрит. Иди так, будто ты тут свой. Как богач. Медленнее.|Soqchi bizga qarab turibdi. Shu yerlikdek yur. Boydek. Sekinroq.`
];

BOSS('hound', {
  name: `Bahodir, the Gilded Hound|Баходир, Золотой Пёс|Bahodir, Oltin It`,
  title: `Champion of the House of the Humo|Боец дома Хумо|Humo xonadonining pahlavoni`,
  quote: `"My lord's will is my memory"|«Воля господина — моя память»|«Xo'jamning amri — mening xotiram»`,
  lair: `The Hound's Court|Двор Пса|Itning hovlisi`,
  lairSub: `Gold sand, swept every morning|Золотой песок, его метут каждое утро|Har tong supuriladigan oltin qum`,
  pre: [
    ['', `A court of gold sand between the Ark and the Cloister. In the middle stands a man in gilded armour, perfectly still, like a dog waiting for a command.|Двор, засыпанный золотым песком, между Арком и Обителью. Посредине неподвижно стоит человек в позолоченных доспехах, как пёс в ожидании команды.|Ark bilan Xonaqoh orasida oltin qum to'shalgan hovli. O'rtada zarhal sovut kiygan bir kishi buyruq kutayotgan itdek qimir etmay turibdi.`],
    () => (F().tillabek === 'accepted'
      ? ['boss', `My lord says you're his now. My lord also says a wise man tests what he buys.|Господин говорит, что теперь ты его. А ещё господин говорит, что мудрый проверяет покупку.|Xo'jam endi sen uniki ekaningni aytdi. Yana xo'jam aytadiki, dono odam sotib olganini sinab ko'radi.`]
      : ['boss', `My lord says you refused him. Nobody refuses him. I was there when he was named heir. I remember it.|Господин говорит, ты ему отказал. Ему никто не отказывает. Я был там, когда его назвали наследником. Я помню.|Xo'jam sen uni rad etding, deydi. Uni hech kim rad etmaydi. Uni merosxo'r deb e'lon qilishganda men o'sha yerda edim. Eslayman.`]),
    ['sado', `He remembers being there? He's thirty at most. Tilla-bek is fifty.|Он помнит, что был там? Ему от силы тридцать. А Тилла-беку пятьдесят.|O'sha yerda bo'lganini eslarmish? Unga ko'pi bilan o'ttiz. Tillabek esa ellikda.`],
    ['boss', `I've served the House of the Humo since I was a boy. I'll serve it after I'm dead. Draw.|Я служу дому Хумо с мальчишества. Буду служить и после смерти. Доставай оружие.|Bolaligimdan Humo xonadoniga xizmat qilaman. O'lganimdan keyin ham qilaman. Qurolingni ol.`]
  ],
  again: [
    `I remember serving. I remember nothing else. That's enough.|Я помню, что служу. Больше ничего не помню. Мне хватает.|Xizmat qilganimni eslayman. Boshqa hech narsani eslamayman. Shu yetadi.`,
    `My lord's will is my memory. Draw.|Воля господина — моя память. Доставай оружие.|Xo'jamning amri — mening xotiram. Qurolingni ol.`,
    `Again? I was taught patience as a boy. In the Humo's kennels. I think.|Опять? Меня с детства учили терпению. На псарне Хумо. Кажется.|Yana? Bolaligimda menga sabrni o'rgatishgan. Humoning itxonasida. Shekilli.`
  ],
  post(done) {
    play([
      ['', `Bahodir drops to one knee. The gilded helmet rolls away across the sand. Under it is a young, bewildered face.|Баходир падает на одно колено. Позолоченный шлем катится по песку. Под ним молодое растерянное лицо.|Bahodir bir tizzasiga cho'kadi. Zarhal dubulg'a qum ustida dumalab ketadi. Tagidan yosh, gangib qolgan yuz chiqadi.`],
      ['bahodir', `I've served him since I was a boy. In the kennels. He gave me bread with his own hand. I remember the bread.|Я служу ему с детства. На псарне. Он кормил меня хлебом из своих рук. Я помню этот хлеб.|Bolaligimdan unga xizmat qilaman. Itxonada. U menga o'z qo'li bilan non berardi. O'sha nonni eslayman.`],
      ['sado', `Ravshan, look at his temple. The skin there. It's like a seam on a sleeve.|Равшан, посмотри на его висок. Кожа там — как шов на рукаве.|Ravshan, chakkasiga qara. U yerdagi teri yengdagi chokka o'xshaydi.`],
      ['hero', `Planted. Someone sang his loyalty into him. A boy from the Tail, bought, emptied, and filled with a kennel.|Посажено. Кто-то вложил в него верность песней. Мальчишку из Хвоста купили, опустошили и набили псарней.|Ekilgan. Kimdir unga sadoqatni kuylab solgan. Dumlik bir bolani sotib olib, ichini bo'shatib, itxona bilan to'ldirishgan.`],
      ['bahodir', `...What are you looking at? What do you see?|…Куда ты смотришь? Что ты видишь?|...Nimaga qarayapsan? Nima ko'ryapsan?`]
    ], () => hub(`The Gilded Hound|Золотой Пёс|Oltin It`, [
      { label: `— Who were you before the kennels?|— Кем ты был до псарни?|— Itxonadan oldin kim eding?`, lines: [
        ['bahodir', `Before? There is no before. There's the kennel, my lord's hand, and bread.|До? Никакого «до» нет. Есть псарня, рука господина и хлеб.|Oldinmi? «Oldin» degan narsa yo'q. Itxona, xo'jamning qo'li va non bor.`],
        ['sado', `Everyone has a before. His was cut out.|У всех есть «до». У него его вырезали.|Hammaning «oldin»i bor. Unikini kesib olishgan.`]
      ] },
      { label: `— What if I show him the seam?|— А если показать ему шов?|— Unga chokni ko'rsatsam-chi?`, lines: [
        ['sado', `He'll find out his whole life is a song somebody sang into him. He might thank you. He might break.|Он узнает, что вся его жизнь — чужая песня. Может, спасибо скажет. А может, сломается.|U butun umri kimningdir qo'shig'i ekanini bilib oladi. Balki rahmat aytar. Balki sinib qolar.`],
        ['hero', `Either way, he stops guarding Tilla-bek. And starts hunting him. A hound that learns who leashed it doesn't go home quietly.|Так или иначе, Тилла-бека он сторожить перестанет. И начнёт на него охоту. Пёс, который узнал, кто посадил его на цепь, тихо домой не вернётся.|Har holda, Tillabekni qo'riqlashni bas qiladi. Uni ov qila boshlaydi. Kim bog'laganini bilib olgan it uyiga jimgina qaytmaydi.`]
      ] },
      { label: `— And if I just let him go?|— А если просто его отпустить?|— Shunchaki qo'yib yuborsam-chi?`, lines: [
        ['hero', `He'll go back to his master. Loyal as ever.|Вернётся к хозяину. Верный, как прежде.|Xo'jasiga qaytadi. Avvalgidek sodiq.`],
        ['sado', `And next time, he'll be waiting for us.|И в следующий раз он будет нас поджидать.|Keyingi safar bizni poylab turadi.`]
      ] }
    ], [
      { k: 'shown', label: `Press his fingers to the seam and let him feel it.|Прижать его пальцы к шву: пусть сам почувствует.|Barmoqlarini chokka bosib qo'yish: o'zi sezsin.` },
      { k: 'spared', label: `Lower your weapon and walk past him.|Опустить оружие и пройти мимо.|Qurolni tushirib, yonidan o'tib ketish.` },
      { k: 'killed', label: `Finish him. He'd only come back for you.|Добить. Иначе он вернётся за тобой.|Uni tugatish. Bo'lmasa, sening ortingdan qaytib keladi.` }
    ], o => {
      setF('hound', o.k);
      if (o.k === 'shown') {
        rep('divan', -2); trust(2);
        play([
          ['', `You press his fingers to the seam and hum the Taste, just a thread of it. Under the kennel there's something else.|Ты прижимаешь его пальцы к шву и напеваешь Пробу — совсем чуть-чуть. Под псарней есть что-то ещё.|Barmoqlarini chokka bosib, Totishni ozgina xirgoyi qilasan. Itxonaning tagida yana nimadir bor.`],
          ['bahodir', `A kitchen. A woman with flour on her hands. She calls me... she calls me something. Not "hound".|Кухня. Женщина, руки в муке. Она зовёт меня… как-то зовёт. Не «пёс».|Oshxona. Qo'llari unga belangan bir ayol. U meni... nimadir deb chaqiradi. «It» emas.`],
          ['', `He takes off his gauntlets, one, then the other, and looks at his hands as if they were borrowed.|Он снимает латные рукавицы — одну, потом другую — и смотрит на свои руки, будто их дали ему на время.|U temir qo'lqoplarini birin-ketin yechadi va qo'llariga go'yo omonatga olingandek qaraydi.`],
          ['bahodir', `If you're lying, I'll find you. If you're not, I'll find him.|Если ты врёшь, я найду тебя. Если нет — его.|Yolg'on gapirgan bo'lsang, seni topaman. Rost bo'lsa — uni.`],
          ['sado', `You gave him back a kitchen. That's a good day's work, yodchi.|Ты вернул ему кухню. Неплохо для одного дня, ёдчи.|Unga oshxonani qaytarib berding. Bir kunga yomon ish emas, yodchi.`]
        ], done);
      } else if (o.k === 'spared') {
        trust(1);
        play([
          ['bahodir', `You'll regret this. I'm told I'm very loyal.|Ты пожалеешь. Мне говорили, что я очень верный.|Afsuslanasan. Menga juda sodiq ekanimni aytishgan.`],
          ['sado', `He doesn't know whose life he's guarding. Maybe one day he'll ask.|Он не знает, чью жизнь сторожит. Может, когда-нибудь спросит.|U kimning umrini qo'riqlayotganini bilmaydi. Balki bir kun so'rab qolar.`]
        ], done);
      } else {
        rep('divan', -1); trust(-2); addVoid(4, CRUEL);
        play([
          ['', `It's quick. The gold sand drinks what it's given, like everything in this city.|Всё быстро. Золотой песок пьёт то, что ему дают, как и всё в этом городе.|Hammasi tez bitadi. Oltin qum unga berilganini ichadi — bu shahardagi hamma narsa kabi.`],
          ['hero', `He won't be waiting at the next gate.|У следующих ворот он нас ждать не будет.|Keyingi darvozada u bizni poylab turmaydi.`],
          ['sado', `He didn't even know whose life he was dying for.|Он даже не знал, за чью жизнь умирает.|U kimning umri uchun o'layotganini ham bilmasdi.`]
        ], done);
      }
    }));
  }
});

REST('r_ark', {
  name: `Chaikhana under the Ark Wall|Чайхана под стеной Арка|Ark devori tagidagi choyxona`,
  sub: `Shade from the rich, tea for the poor|Тень от богатых, чай для бедных|Boylarning soyasi, kambag'allarning choyi`,
  arrive(done) {
    play([
      ['', `A chaikhana pressed against the Ark wall like a beggar against a gate. Up there, music. Down here, flies and good tea.|Чайхана прижалась к стене Арка, как нищий к воротам. Наверху музыка. Внизу мухи и хороший чай.|Choyxona Ark devoriga darvozaga suyangan gadoydek yopishib turibdi. Tepada soz. Pastda pashsha va yaxshi choy.`],
      ['sado', `Rustam's here. Of course. He sits a little lower today. Is he getting... smaller?|Рустам здесь. Ну конечно. Сегодня он сидит чуть ниже. Он что… уменьшается?|Rustam shu yerda. Albatta. Bugun sal pastroq o'tiribdi. U... kichrayib boryaptimi?`],
      ['hero', `The Hollow fade. They forget to eat. Then they forget to stand up.|Пустые угасают. Забывают есть. Потом забывают вставать.|Bo'shlar so'nib boradi. Avval ovqat yeyishni unutadi. Keyin o'rnidan turishni.`],
      ['sado', `Then we should hurry.|Тогда надо спешить.|Unda shoshilishimiz kerak.`],
      ['hero', `Farrukh sent a boy with a message: "Come. Bring tilla. Don't bring the Singers." He's found something.|Фаррух прислал мальчишку с запиской: «Приходи. Захвати тиллу. Певцов не захватывай». Он что-то нашёл.|Farrux bir bola orqali xat jo'natibdi: «Kel. Tilla olib kel. Xonandalarni olib kelma». Nimadir topibdi.`]
    ], done);
  },
  rustam: rustamAt(3),
  turab(done) {
    const v = F().voice;
    if (v === 'bought' || v === 'stolen') {
      if (!once('turab:voice')) {
        play([['turab', pick([
          `The dastan of Ravshan has forty-one songs. You're somewhere around the twentieth. The middle is always the worst.|В дастане о Равшане сорок одна песня. Ты где-то на двадцатой. Середина всегда самая тяжёлая.|«Ravshan» dostonida qirq bitta qo'shiq bor. Sen yigirmanchisi atrofidasan. O'rtasi doim eng og'iri.`,
          `Sing, yodchi. Badly, if you must. A city that stops singing starts selling.|Пой, ёдчи. Хоть плохо, но пой. Город, который перестал петь, начинает торговать.|Kuyla, yodchi. Yomon bo'lsa ham kuyla. Kuylashdan to'xtagan shahar savdoga o'tadi.`
        ])]], done);
        return;
      }
      setF('turabSpoke', 1);
      play([
        ['', `You open the tumar with his voice and hold it to his scar. He breathes in, like a man coming up out of water.|Ты раскрываешь тумар с его голосом и подносишь к шраму. Он делает вдох, как человек, вынырнувший из воды.|Ovozi solingan tumarni ochib, chandig'iga tutasan. U suvdan bosh chiqargan odamdek chuqur nafas oladi.`],
        ['turab', `...Ravshan. Like the dastan. That Ravshan rode across the steppe to save a bride.|…Равшан. Как в дастане. Тот Равшан скакал через степь, чтобы спасти невесту.|...Ravshan. Dostondagidek. U Ravshan qallig'ini qutqarish uchun dasht osha ot choptirgan.`],
        ['turab', `You walk across the Tail to collect a debt. The old tellers would laugh. I almost can.|А ты ходишь через Хвост, чтобы собрать долг. Старые сказители посмеялись бы. Я почти могу.|Sen esa qarz undirgani Dum bo'ylab yurasan. Keksa baxshilar kulgan bo'lardi. Men ham kulishimga oz qoldi.`],
        () => (v === 'stolen' ? ['turab', `Stolen, I hear. Good. What was stolen can be stolen back. It's the only justice this city has left.|Краденый, говорят. Хорошо. Украденное можно украсть обратно. Другой справедливости в этом городе не осталось.|O'g'irlangan, deyishyapti. Yaxshi. O'g'irlangan narsani qaytarib o'g'irlasa bo'ladi. Bu shaharda boshqa adolat qolmagan.`] : null)
      ], () => hub(`Turab the bakhshi|Тураб-бахши|Turob baxshi`, [
        { label: `— Who was the Sleeper, before?|— Кем был Спящий раньше?|— Uxlovchi avval kim bo'lgan?`, lines: [
          ['turab', `He wasn't always a Div. Before the Singers there were tellers. We told him tales, and he gave us water.|Он не всегда был Дэвом. До Певцов были сказители. Мы рассказывали ему сказки, а он давал нам воду.|U doim ham Dev bo'lmagan. Xonandalardan oldin baxshilar bo'lgan. Biz unga ertak aytardik, u bizga suv berardi.`],
          ['turab', `He had a name. Names get tithed too. Mine nearly was. Find his name, and I'll sing you what we used to sing.|У него было имя. Имена тоже уходят в десятину. Моё чуть не ушло. Найди его имя — и я спою тебе то, что пели мы.|Uning ismi bor edi. Ismlar ham ushrga ketadi. Meniki ham ketishiga oz qoldi. Uning ismini top — senga biz aytgan qo'shiqni aytib beraman.`]
        ] },
        { label: `— Why did they take your voice?|— За что у вас забрали голос?|— Ovozingizni nega olishdi?`, lines: [
          ['turab', `The Singers told me to sing the tithe: to sing a boy's best day out of him. I sang him a tale instead. In front of everyone.|Певцы велели мне петь десятину — выпеть из мальчишки его лучший день. А я спел ему сказку. При всех.|Xonandalar menga ushr kuylashni buyurdi — bir boladan eng yaxshi kunini kuylab olishni. Men esa unga ertak aytib berdim. Hammaning ko'zi oldida.`],
          ['turab', `A tithe is a song that takes. A tale is a song that gives. The Singers can't tell the difference anymore.|Десятина — песня, которая забирает. Сказка — песня, которая дарит. Певцы больше не видят разницы.|Ushr — oladigan qo'shiq. Ertak — beradigan qo'shiq. Xonandalar endi farqini bilmaydi.`]
        ] },
        { label: `— Turab-aka... do you hear anyone else here?|— Тураб-ака… вы слышите здесь кого-нибудь ещё?|— Turob aka... bu yerda yana kimnidir eshityapsizmi?`, lines: [
          ['', `Turab looks past your shoulder, at the empty air, for a long moment.|Тураб долго смотрит мимо твоего плеча, в пустоту.|Turob uzoq vaqt yelkang osha bo'shliqqa tikilib turadi.`],
          ['turab', `You breathe like two people, yodchi. Look after the lighter one.|Дышишь ты, ёдчи, будто вас двое. Береги того, кто полегче.|Sen ikki kishidek nafas olasan, yodchi. Yengilrog'ini asra.`],
          ['sado', `...He knows. Somehow he knows.|…Он знает. Откуда-то знает.|...U biladi. Qayerdandir biladi.`]
        ] }
      ], [
        { k: 'thanks', label: `"Thank you, Turab-aka."|«Спасибо, Тураб-ака.»|«Rahmat, Turob aka.»` }
      ], () => play([
        ['sado', `His voice is lovely. Cracked down the middle, like a good bowl.|У него чудесный голос. С трещинкой посередине, как у хорошей пиалы.|Ovozi ajoyib ekan. Yaxshi piyoladek o'rtasidan darz ketgan.`]
      ], () => { trust(1); rep('tail', 1); done(); })));
      return;
    }
    if (!once('turab:r_ark')) { play([['mute', `(He plays a few notes and stops, as if he's forgotten the rest.)|(Он играет несколько нот и замолкает, будто забыл, что дальше.)|(U bir necha nota chaladi-da, qolganini unutgandek to'xtaydi.)`]], done); return; }
    play([
      ['', `Turab draws nothing today. He tunes his dutar for a long time, then plays something with no words in it.|Сегодня Тураб ничего не рисует. Долго настраивает дутар и играет что-то без слов.|Bugun Turob hech narsa chizmaydi. Dutorini uzoq sozlaydi, keyin so'zsiz bir kuy chaladi.`],
      ['sado', `Somebody bought his voice. I hope they never use it. I hope it sits in that cellar and refuses.|Кто-то купил его голос. Надеюсь, им никогда не воспользуются. Пусть сидит в подвале и упрямится.|Kimdir uning ovozini sotib oldi. Hech qachon ishlatishmasin. Yerto'lada o'tirib, qaysarlik qilsin.`]
    ], done);
  },
  farrukh: farrukhAt('r_ark', {
    first: [
      ['farrukh', `Ravshan. I hear you've been busy in the Ark. Weddings, hounds. People are telling stories about you. That's dangerous here.|Равшан. Слышал, ты в Арке развернулся. Свадьбы, псы. О тебе уже рассказывают. Здесь это опасно.|Ravshan. Arkda rosa ish qilibsan, deb eshitdim. To'ylar, itlar. Sen haqingda gap yurib qoldi. Bu yerda bu xatarli.`],
      ['farrukh', `Now. I have something I shouldn't. One of the seven. It fell out of someone's bag in the upper karez, and I happened to be standing underneath.|Так вот. У меня есть кое-что, чего быть не должно. Один из семи. Выпал из чьей-то сумки в верхнем кяризе, а я случайно стоял внизу.|Xo'sh. Menda bo'lmasligi kerak bo'lgan bir narsa bor. Yettovdan biri. Yuqori korizda kimningdir xaltasidan tushib ketdi, men tasodifan tagida turgan ekanman.`],
      ['farrukh', `I can't sell it. The Divan would skin me, the Singers would sing me. But I can let you taste it. Once.|Продать его я не могу. Диван с меня шкуру спустит, Певцы меня выпоют. Но попробовать дам. Один раз.|Uni sotolmayman. Devon terimni shiladi, Xonandalar meni kuylab bo'shatadi. Lekin bir marta totib ko'rishga beraman.`],
      ['sado', `A founder's tumar! Ravshan, the woman with the lamp dropped it. She's real. She's down there, in the karez.|Тумар основателя! Равшан, его обронила та женщина с лампой. Она настоящая. Она там, внизу, в кяризе.|Asoschi tumari! Ravshan, uni o'sha chiroqli ayol tushirib qoldirgan. U bor. U pastda, korizda.`]
    ],
    founders: true,
    questions: [
      { label: `— Why not just give it to me?|— А почему просто не отдать его мне?|— Nega uni menga shunchaki bermaysan?`, lines: [
        ['farrukh', `One tumar won't stop your song. Shirin wants all seven. And if anyone learns it passed through my hands, I'm done.|Один тумар твою песню не остановит, Ширин нужны все семь. А если кто узнает, что он прошёл через мои руки, мне конец.|Bitta tumar qo'shig'ingni to'xtatmaydi, Shiringa yettalasi kerak. Mening qo'limdan o'tganini birov bilib qolsa, ishim tamom.`],
        ['sado', `But if we taste it, we'll know what's in the founders' song. The thing everyone's fighting over.|Но если его испить, мы узнаем, что в песне основателей. То, из-за чего все дерутся.|Lekin uni totsak, asoschilar qo'shig'ida nima borligini bilamiz. Hamma talashayotgan narsani.`]
      ] }
    ],
    info: {
      label: `Slide him some tilla: "How do I get down into the Well?"|Подвинуть ему тиллу: «Как спуститься в Колодец?»|Unga tilla surib qo'yish: «Quduqqa qanday tushiladi?»`,
      lines: [
        ['farrukh', `Through the Cloister, through the hall of the Choir. The Choir doesn't sing out loud. That's the problem.|Через Обитель, через зал Хора. Хор не поёт вслух. В этом-то и беда.|Xonaqoh orqali, Xor zali orqali. Xor ovoz chiqarib kuylamaydi. Butun balo shunda.`],
        ['farrukh', `Every note they don't sing pulls something out of you. Don't let them touch you. And don't count on the rope reaching the water.|Каждая нота, которую они не поют, что-то из тебя вытягивает. Не давай им до себя дотронуться. И не надейся, что верёвки хватит до воды.|Ular aytmagan har bir nota sendan nimanidir sug'urib oladi. Senga tegishlariga yo'l qo'yma. Arqon suvgacha yetadi, deb ham umid qilma.`]
      ],
      know: `The Silent Choir guards the Well. Their touch drains memory.|Безмолвный хор стережёт Колодец. От их прикосновения уходит память.|Sokin xor Quduqni qo'riqlaydi. Ular tegsa, xotira so'riladi.`
    }
  }),
  lullaby: lullabyAt(ALLA_3)
});
BARKS['r_ark:start'] = [
  `Music up there, flies down here. I like it better down here.|Наверху музыка, внизу мухи. Мне внизу больше нравится.|Tepada soz, pastda pashsha. Menga pasti ko'proq yoqadi.`
];

LAND('a1_cloister', {
  name: `The Cloister of the Singers|Обитель Певцов|Xonandalar xonaqohi`,
  sub: `Where the Well is kept, and the song that keeps him|Где хранят Колодец и песню, что держит Спящего|Quduq va Uxlovchini ushlab turgan qo'shiq saqlanadigan joy`,
  start: [
    ['', `The Cloister of the Singers climbs the spine: white walls, blue domes, and somewhere beneath them, the mouth of the Well.|Обитель Певцов взбирается по хребту: белые стены, синие купола, а где-то под ними — устье Колодца.|Xonandalar xonaqohi tizma bo'ylab yuqoriga o'rlaydi: oq devorlar, ko'k gumbazlar, ularning tagida qayerdadir Quduqning og'zi.`],
    ['sado', `I can hear singing. Very far down. Like someone humming with their mouth shut.|Я слышу пение. Очень глубоко. Будто кто-то мычит, не раскрывая рта.|Qo'shiq eshityapman. Juda chuqurda. Kimdir og'zini ochmay ming'illayotgandek.`],
    ['hero', `The Singers feed him every watch. That's what you hear.|Певцы кормят его каждую стражу. Это ты и слышишь.|Xonandalar uni har pahrda boqadi. Eshitayotganing shu.`],
    ['sado', `No. The Singers are up here. This is coming from underneath.|Нет. Певцы здесь, наверху. А это идёт снизу.|Yo'q. Xonandalar shu yerda, tepada. Bu esa pastdan kelyapti.`],
    ['hero', `The thief went down into the karez. The way down is the Well, and the Well is in here. So we go through.|Воровка ушла вниз, в кяриз. Путь вниз — через Колодец, а Колодец здесь. Значит, идём насквозь.|O'g'ri pastga, korizga tushib ketgan. Pastga yo'l — Quduq orqali, Quduq esa shu yerda. Demak, ichidan o'tamiz.`]
  ],
  mid: [
    ['', `A line of apprentices passes with tumars on silver trays. The seals are yellow and cracked. Many have been opened before.|Мимо проходит вереница учеников с тумарами на серебряных подносах. Печати жёлтые, потрескавшиеся. Многие уже вскрывали.|Kumush laganlarda tumar ko'targan shogirdlar qatori o'tadi. Muhrlar sarg'aygan, darz ketgan. Ko'plari ilgari ochilgan.`],
    ['sado', `Worn. They're feeding him worn ones. Like giving a starving man a plate somebody already licked.|Стёртые. Его кормят стёртыми. Всё равно что дать голодному тарелку, которую уже кто-то вылизал.|Yeyilgan. Uni yeyilganlari bilan boqishyapti. Och odamga birov yalab qo'ygan likopchani bergandek.`]
  ],
  stones: [
    `"The Singers keep the Sleeper's peace, as the founders swore in the Treaty of the Seven." The word "Treaty" is newer than the rest of the stone.|«Певцы хранят покой Спящего, как поклялись основатели в Договоре Семерых». Слово «Договор» высечено позже остального.|«Xonandalar Uxlovchining tinchligini asraydi, asoschilar Yettilar ahdnomasida qasam ichganidek». «Ahdnoma» so'zi qolganidan keyinroq o'yilgan.`,
    `A list of banned songs, painted over and written again: "The Water Tale". "The Teller and the River". "Alla for the Big One".|Список запрещённых песен, закрашенный и написанный заново: «Сказ о воде». «Сказитель и река». «Алла для Большого».|Taqiqlangan qo'shiqlar ro'yxati, bo'yab tashlanib, qaytadan yozilgan: «Suv ertagi». «Baxshi va daryo». «Kattakonga alla».`,
    `"Before the Singers there were tellers." Someone has chiselled away the rest of the line.|«До Певцов были сказители». Остаток строки кто-то сбил зубилом.|«Xonandalardan oldin baxshilar bo'lgan». Satrning qolganini kimdir iskana bilan o'chirib tashlagan.`,
    `An apprentice's prayer: "Let me not hear him. Let me only sing. Hearing is a sickness. The Ustoz will cure it."|Молитва ученика: «Дай мне не слышать его. Дай мне только петь. Слышать — болезнь. Устоз её вылечит».|Shogirdning iltijosi: «Uni eshitmayin. Faqat kuylayin. Eshitish — kasallik. Ustoz uni davolaydi».`
  ],
  memory: {
    id: 'm_alla',
    lines: [
      ['memory', `Night. Your mother sits between two sleeping mats and sings "Alla", so softly it's almost breathing.|Ночь. Мама сидит между двумя постелями и поёт «Аллу» — так тихо, что это почти дыхание.|Tun. Onang ikki o'rin orasida o'tirib, «Alla» aytyapti — shunchalik sekinki, nafasdan farqi yo'q.`],
      ['memory', `"Alla, alla, the water sleeps..." You pretend to be asleep. On the other mat, someone else is pretending too. You can hear them pretending.|«Алла, алла, спит вода…» Ты притворяешься, что спишь. На другой постели кто-то тоже притворяется. Ты это слышишь.|«Alla-yo alla, suv uxladi...» Uxlagan bo'lib yotibsan. Narigi o'rinda ham kimdir uxlagan bo'lib yotibdi. Buni eshitib turibsan.`],
      ['memory', `Your mother's hand rests on you, then on the other mat. On nothing. On a blanket folded flat.|Мамина рука лежит на тебе, потом на другой постели. На пустоте. На плоско сложенном одеяле.|Onangning qo'li ustingda turadi, keyin narigi o'ringa o'tadi. Bo'shliqqa. Tekis taxlangan ko'rpaga.`],
      ['sado', `"...the lamp is low, the gate is shut, alla, my little foal..."|«…лампа гаснет, заперты ворота, алла, жеребёночек мой…»|«...chiroq pasaydi, darvoza yopildi, alla, toychog'im...»`],
      ['hero', `She called me that. Little foal. Toychoq.|Она меня так звала. Жеребёнок. Тойчок.|Onam meni shunday derdi. Toychoq.`],
      ['sado', `I know. It fits the tune.|Знаю. Ложится на мотив.|Bilaman. Kuyga tushadi.`]
    ]
  },
  people: [{ look: 'elder' }, { look: 'elder', x: 14 }, { look: 'shirin', x: 32 }, { look: 'singer', x: 48 }, { look: 'nargiza', x: 66 }],
  exit(done) {
    play([
      ['', `In the courtyard, Ustoz Shirin is speaking to the elders of the Tail. They stand with their caps in their hands.|Во дворе Устоз Ширин говорит со старейшинами Хвоста. Те стоят, держа шапки в руках.|Hovlida Ustoz Shirin Dum oqsoqollari bilan gaplashyapti. Ular do'ppilarini qo'llariga olib turishibdi.`],
      ['shirin', `Elders of the Tail. You felt him turn. Your walls leaned. Your water went bitter at the bottom of the jug.|Старейшины Хвоста. Вы чувствовали, как он повернулся. Ваши стены накренились. Вода на дне кувшина у вас горчит.|Dum oqsoqollari. Uning ag'darilganini sezdingiz. Devorlaringiz qiyshaydi. Ko'za tagidagi suvingiz achchiq tortdi.`],
      ['shirin', `Someone stole the founders' tumars, and the Sleeper feels it. He's hungry. A hungry Sleeper is a Sleeper who wakes.|Кто-то украл тумары основателей, и Спящий это чувствует. Он голоден. А голодный Спящий — это Спящий, который просыпается.|Kimdir asoschilar tumarlarini o'g'irladi, Uxlovchi buni sezyapti. U och. Och Uxlovchi esa — uyg'onadigan Uxlovchi.`],
      ['shirin', `So the Well will ask more of you. Not forever. Once. One great payment, and a hundred years of quiet for your grandchildren.|Поэтому Колодец попросит у вас больше. Не навсегда. Один раз. Одна великая плата — и сто лет покоя вашим внукам.|Shuning uchun Quduq sizdan ko'proq so'raydi. Abadiy emas. Bir marta. Bitta katta to'lov — nevaralaringizga esa yuz yil tinchlik.`],
      ['crowd', `More? We already pay with our children!|Больше? Мы и так платим детьми!|Yana ko'proqmi? Biz shundoq ham bolalarimiz bilan to'layapmiz!`],
      ['shirin', `And I paid with my daughter. The sand didn't ask whether I could spare her. I'm asking you. That's the difference between me and him.|А я заплатила дочерью. Песок не спрашивал, могу ли я её отдать. Я — спрашиваю. Вот и вся разница между мной и им.|Men esa qizim bilan to'ladim. Qum mendan uni bera olasanmi, deb so'ramadi. Men so'rayapman. Men bilan uning farqi shu.`]
    ], () => hub(`Shirin's sermon|Проповедь Ширин|Shirinning va'zi`, [
      { label: `— Sado, what is she really asking for?|— Садо, о чём она на самом деле просит?|— Sado, u aslida nima so'rayapti?`, lines: [
        () => ((F().rustamMem || 0) >= 3
          ? ['sado', `The Great Tithe. She's asking them to agree to their own emptying. And they'll say yes, because she's so sad.|Великую десятину. Она просит их самих согласиться, чтобы их выпели досуха. И они согласятся — ей ведь так горько.|Buyuk ushrni. O'zlarini bo'shatishlariga rozi bo'lishni so'rayapti. Ular rozi ham bo'ladi — chunki uning dardi shunchalik og'ir.`]
          : ['sado', `"One great payment." She never says what it is. Have you noticed? She never says what.|«Одна великая плата». А какая — не говорит. Заметил? Ни разу не сказала, какая.|«Bitta katta to'lov». Nima ekanini aytmaydi. Sezdingmi? Bir marta ham aniq aytmadi.`]),
        () => ((F().rustamMem || 0) >= 3 ? null : ['hero', `Rustam knew. He was counting under the table. If I'd seen more of his memories, I could tell them.|Рустам знал. Он считал под столом. Знай я больше из его памяти — сказал бы им.|Rustam bilardi. Stol tagida sanardi. Uning xotiralaridan ko'proq ko'rganimda, ularga aytib bera olardim.`])
      ] },
      { label: `— And if they refuse her?|— А если они ей откажут?|— Ular rad etsa-chi?`, lines: [
        ['sado', `Then nothing changes. The water stays bitter, and he keeps turning over.|Тогда ничего не изменится. Вода так и будет горчить, а он — ворочаться.|Unda hech narsa o'zgarmaydi. Suv achchiqligicha qoladi, u esa ag'darilishda davom etadi.`],
        ['hero', `Twenty years ago he only turned over, and half the Tail went into the sand. She isn't lying about that part.|Двадцать лет назад он всего лишь повернулся — и пол-Хвоста ушло в песок. Тут она не врёт.|Yigirma yil oldin u bor-yo'g'i ag'darilgan edi — Dumning yarmi qumga ketdi. Bu borada u yolg'on gapirmayapti.`]
      ] },
      { label: `— Who's the girl in the gallery?|— Кто эта девушка на галерее?|— Ayvondagi qiz kim?`, lines: [
        ['', `In the gallery, a girl in turquoise with two braids under her doppi is watching you, not the Ustoz.|На галерее девушка в бирюзовом, из-под тюбетейки две косы. Смотрит не на Устоз, а на тебя.|Ayvonda firuza libosli, do'ppisi tagidan ikki o'rim sochi tushgan bir qiz Ustozga emas, senga qarab turibdi.`],
        ['hero', `An apprentice. She's not looking at the Ustoz. She's looking at me.|Ученица. Она смотрит не на Устоз. Она смотрит на меня.|Shogird qiz. Ustozga emas. Menga qarayapti.`],
        ['sado', `At us.|На нас.|Bizga.`]
      ] },
      { label: `— What happens if I speak up?|— Что будет, если я заговорю?|— Gapirsam, nima bo'ladi?`, lines: [
        ['sado', `The Tail will know. And Shirin will know that you know. She'll never forgive you for that.|Хвост узнает. А Ширин узнает, что знаешь ты. Этого она тебе никогда не простит.|Dum bilib oladi. Shirin esa sen bilishingni bilib oladi. Buni senga hech qachon kechirmaydi.`],
        ['hero', `She already holds my life on a string.|Она и так держит мою жизнь на ниточке.|Jonim shundoq ham qil ustida turibdi — uning qo'lida.`]
      ] }
    ], [
      { k: 'spoke', label: `"Tell them what 'one great payment' means, Ustoz."|«Скажите им, Устоз, что значит „одна великая плата“.»|«Ustoz, ularga "bitta katta to'lov" nima ekanini ayting.»`, lock: (F().rustamMem || 0) < 3 ? `You don't know what it means yet. The answer is somewhere in Rustam's memories.|Ты пока не знаешь, что это значит. Ответ где-то в памяти Рустама.|Buning nimaligini hali bilmaysan. Javobi Rustamning xotirasida.` : null },
      { k: 'backed', label: `"The Well keeps us all alive. She's right."|«Колодец всех нас держит на этом свете. Она права.»|«Quduq hammamizni tirik saqlab turibdi. U haq.»` },
      { k: 'silent', label: `Say nothing. Watch the girl in the gallery.|Промолчать. Смотреть на девушку на галерее.|Indamaslik. Ayvondagi qizni kuzatish.` }
    ], o => {
      setF('sermon', o.k);
      let a;
      if (o.k === 'spoke') {
        rep('singers', -3); rep('tail', 3); trust(1);
        a = [
          ['hero', `One night. One song. The whole Tail sung empty, so the Ark can keep its roses. Ask her who carries the water after.|Одна ночь. Одна песня. Весь Хвост выпоют досуха, чтобы в Арке не завяли розы. Спросите её, кто потом будет носить воду.|Bir kecha. Bir qo'shiq. Arkning atirgullari so'lmasin deb, butun Dumni kuylab bo'shatishadi. Undan so'rang: keyin suvni kim tashiydi?`],
          ['crowd', `Is it true? Ustoz, is it true?|Это правда? Устоз, это правда?|Rostmi? Ustoz, shu gap rostmi?`],
          ['shirin', `...Rustam taught you to count. A pity he never taught you when to stop.|…Рустам научил тебя считать. Жаль, не научил вовремя останавливаться.|...Rustam seni sanashga o'rgatgan. Afsus, qachon to'xtashni o'rgatmagan.`],
          ['shirin', `When he wakes and the sand takes their grandchildren, count those too.|А когда он проснётся и песок заберёт их внуков — посчитай и их.|U uyg'onib, qum ularning nevaralarini yutganda, ularni ham sanab qo'y.`]
        ];
      } else if (o.k === 'backed') {
        rep('singers', 2); rep('tail', -2); trust(-1);
        a = [
          ['shirin', `Thank you, yodchi. You see? Even Rustam's boy understands.|Спасибо, ёдчи. Видите? Даже ученик Рустама понимает.|Rahmat, yodchi. Ko'rdingizmi? Hatto Rustamning shogirdi tushunadi.`],
          ['sado', `Do you believe that?|Ты в это веришь?|Bunga ishonasanmi?`],
          ['hero', `I believed it yesterday.|Вчера верил.|Kecha ishonardim.`]
        ];
      } else {
        a = [
          ['', `The elders bow and file out. Nobody looks at anybody. The girl in turquoise has been watching you the whole time.|Старейшины кланяются и по одному выходят. Никто ни на кого не смотрит. Девушка в бирюзовом всё это время смотрела на тебя.|Oqsoqollar ta'zim qilib, birin-ketin chiqib ketishadi. Hech kim hech kimga qaramaydi. Firuza libosli qiz esa shu payt bo'yi senga qarab turgan ekan.`]
        ];
      }
      play(a.concat([
        ['', `When the elders are gone, the girl in turquoise comes down from the gallery. An apprentice of the Singers.|Когда старейшины уходят, девушка в бирюзовом спускается с галереи. Ученица Певцов.|Oqsoqollar ketgach, firuza libosli qiz ayvondan tushib keladi. Xonandalarning shogirdi.`],
        ['nargiza', `You're Rustam-aka's yodchi. The one with the Pledge Song in him. I can hear it. It's very loud.|Ты ёдчи Рустама-ака. Тот, в ком Песня залога. Я её слышу. Она очень громкая.|Sen Rustam akaning yodchisisan. Ichida Garov qo'shig'i bor odam. Uni eshityapman. Juda baland.`],
        ['nargiza', `I'm Nargiza. I hear other things too. Under the floor. The Ustoz says it's a sickness. She'll cure me after the new moon.|Я Наргиза. Я и другое слышу. Под полом. Устоз говорит, это болезнь. После новолуния она меня вылечит.|Men Nargizaman. Boshqa narsalarni ham eshitaman. Oyoq ostida. Ustoz buni kasallik deydi. Yangi oydan keyin meni davolaydi.`]
      ]), () => hub(`Nargiza|Наргиза|Nargiza`, [
        { label: `— What do you hear under the floor?|— Что ты слышишь под полом?|— Oyoq ostida nimani eshitasan?`, lines: [
          ['nargiza', `Him. The Sleeper. He isn't singing. He's asking for something. The same word, over and over.|Его. Спящего. Он не поёт. Он что-то просит. Одно и то же слово, снова и снова.|Uni. Uxlovchini. U kuylamayapti. Nimanidir so'rayapti. Bitta so'zni, qayta-qayta.`],
          ['nargiza', `Do you hear him?|А ты его слышишь?|Sen uni eshitasanmi?`],
          ['hero', `I hear the song in my throat. That's all.|Я слышу песню у себя в горле. И всё.|Tomog'imdagi qo'shiqni eshitaman. Boshqa hech narsa.`],
          ['nargiza', `You're very loud, you know. Both of you.|Знаешь, вы очень громкие. Оба.|Bilasanmi, juda baland ekansizlar. Ikkalangiz ham.`],
          ['hero', `Both?|Оба?|Ikkalamiz?`],
          ['nargiza', `You and the song.|Ты и песня.|Sen va qo'shiq.`]
        ] },
        { label: `— How do I get down to the Well?|— Как мне попасть к Колодцу?|— Quduqqa qanday tushaman?`, lines: [
          ['nargiza', `Through the hall of the Choir. They don't sing out loud anymore. They gave their voices to the Well.|Через зал Хора. Они больше не поют вслух. Они отдали голоса Колодцу.|Xor zali orqali. Ular endi ovoz chiqarib kuylamaydi. Ovozlarini Quduqqa berishgan.`],
          ['nargiza', `If you go down, get past them fast. And don't let them touch you.|Если пойдёшь вниз, проходи мимо них быстро. И не давай им себя коснуться.|Pastga tushsang, yonlaridan tez o't. Senga tegishlariga yo'l qo'yma.`]
        ] }
      ], [
        { k: 'go', label: `"Thank you, Nargiza. I have to go down."|«Спасибо, Наргиза. Мне надо вниз.»|«Rahmat, Nargiza. Pastga tushishim kerak.»` }
      ], () => play([
        ['sado', `She heard me. Ravshan, I think she heard me.|Она меня услышала. Равшан, по-моему, она меня слышала.|U meni eshitdi. Ravshan, menimcha, u meni eshitdi.`]
      ], () => { setF('metNargiza', 1); done(); })));
    }));
  }
});
BARKS['a1_cloister:start'] = [
  `Everyone here walks so softly, as if he might hear.|Тут все ходят так тихо, будто он может услышать.|Bu yerda hamma oyoq uchida yuradi, go'yo u eshitib qoladigandek.`,
  `Wax everywhere. I'd be sick, if I had a stomach.|Кругом воск. Меня бы стошнило, будь у меня желудок.|Hamma yoq mum. Oshqozonim bo'lganida, ko'nglim aynirdi.`
];
BARKS['a1_cloister:mid'] = [
  `The floor is trembling. Just a little. Like breathing.|Пол дрожит. Совсем чуть-чуть. Как дыхание.|Yer titrayapti. Ozgina. Nafas olgandek.`,
  `Somebody's watching us from the gallery. A girl. She isn't afraid of us.|С галереи за нами кто-то смотрит. Девушка. Она нас не боится.|Ayvondan kimdir bizni kuzatyapti. Bir qiz. U bizdan qo'rqmaydi.`
];

BOSS('choir', {
  name: `The Silent Choir|Безмолвный хор|Sokin xor`,
  title: `Seven who sing without a sound|Семеро, что поют без звука|Tovushsiz kuylaydigan yettov`,
  quote: `"Hush"|«Тише»|«Jim»`,
  lair: `The Hall of the Silent Choir|Зал Безмолвного хора|Sokin xor zali`,
  lairSub: `Above the mouth of the Well|Над устьем Колодца|Quduq og'zi tepasida`,
  pre: [
    ['', `Seven Singers stand in a ring around the mouth of the Well. Their mouths open and close. There's no sound. You feel it in your teeth.|Семь Певцов стоят кольцом вокруг устья Колодца. Рты открываются и закрываются. Звука нет. Ты чувствуешь его зубами.|Yetti Xonanda Quduq og'zi atrofida halqa bo'lib turibdi. Og'izlari ochilib-yopiladi. Tovush yo'q. Uni tishlaring bilan sezasan.`],
    ['sado', `They're singing at you. Without voices. Ravshan, it's pulling, it's pulling things out of you...|Они поют прямо в тебя. Без голоса. Равшан, тянет, оно из тебя вытягивает…|Ular senga qarab kuylayapti. Ovozsiz. Ravshan, tortyapti, ichingdan nimalarnidir sug'uryapti...`],
    ['', `Long ago they gave their voices to the Well, so that nothing would ever get past. Every note they don't sing takes a little of you.|Давным-давно они отдали голоса Колодцу, чтобы мимо никто не прошёл. Каждая неспетая нота забирает частичку тебя.|Ancha oldin ular ovozlarini Quduqqa berishgan, toki hech kim o'tolmasin. Aytilmagan har bir nota sendan ozgina oladi.`],
    ['sado', `Don't let them touch you. Every hit, you'll forget something. I can feel the edges crumbling.|Не давай им себя коснуться. С каждым ударом ты что-то забываешь. Я чувствую, как осыпаются края.|Senga tegishlariga yo'l qo'yma. Har zarbada nimanidir unutasan. Chetlari to'kilayotganini sezyapman.`]
  ],
  again: [
    `(Seven mouths open on a silence with your name in it.)|(Семь ртов открываются в тишину, и в этой тишине твоё имя.)|(Yetti og'iz sukunatga ochiladi, u sukunatda sening isming bor.)`,
    `(The silence is louder than before.)|(Тишина громче, чем в прошлый раз.)|(Sukunat avvalgidan balandroq.)`,
    `(They remember you. You're starting not to.)|(Они тебя помнят. А ты себя — уже не очень.)|(Ular seni eslaydi. Sen esa o'zingni unuta boshlading.)`
  ],
  post(done) {
    play([
      ['', `The last of the Choir sits down on the stones and closes its mouth. The silence drains out of the hall like water from a jug.|Последний из Хора садится на камни и закрывает рот. Тишина вытекает из зала, как вода из кувшина.|Xorning oxirgisi toshga o'tirib, og'zini yumadi. Sukunat zaldan ko'zadagi suvdek oqib chiqib ketadi.`],
      ['', `Then the Well opens. Not a lid: the Well itself, a throat in the rock, breathing up warm, wet air.|Потом открывается Колодец. Не крышка — сам Колодец, глотка в скале, из которой поднимается тёплый влажный воздух.|Keyin Quduq ochiladi. Qopqog'i emas — Quduqning o'zi: qoyadagi tomoq, undan iliq, nam havo ko'tariladi.`, () => { shake(0.5); sfx('stomp'); }],
      ['', `You touch the water at the rim. It's bitter. Not salty: bitter, like the mouth of someone who hasn't eaten in days.|Ты касаешься воды у края. Она горькая. Не солёная, а горькая, как во рту у того, кто много дней не ел.|Chetidagi suvga tegasan. Achchiq. Sho'r emas — bir necha kun tuz totmagan odamning og'zidek achchiq.`],
      ['sado', `He's starving. Ravshan, he's starving, and they've been feeding him plates someone already licked.|Он голодает. Равшан, он умирает с голоду, а его кормили вылизанными тарелками.|U och. Ravshan, u ochlikdan o'lyapti, uni esa yalab qo'yilgan likopchalar bilan boqishgan.`],
      ['hero', `The tumars went down there. The woman in the hood, the old karez mouths. Everything goes down. So do we.|Тумары ушли туда, вниз. Женщина в капюшоне, старые устья кяриза. Всё уходит вниз. И мы туда же.|Tumarlar pastga ketgan. Yopinchiqli ayol, eski koriz og'izlari. Hammasi pastga ketadi. Biz ham.`],
      ['', `Running footsteps. The girl in turquoise, out of breath, a lamp in each hand.|Бегущие шаги. Девушка в бирюзовом, запыхавшаяся, в каждой руке по лампе.|Yugurgan oyoq tovushi. Firuza libosli qiz, hansiragan, har qo'lida bittadan chiroq.`],
      ['nargiza', `You did it. The Choir... I've never seen the Well open. Can you hear it? It's the same word.|У тебя получилось. Хор… Я никогда не видела Колодец открытым. Слышишь? То же самое слово.|Uddalading. Xor... Quduqni hech qachon ochiq ko'rmaganman. Eshityapsanmi? O'sha so'z.`],
      ['nargiza', `Take me with you. Down there.|Возьми меня с собой. Вниз.|Meni ham olib ket. Pastga.`]
    ], () => hub(`Nargiza's request|Просьба Наргизы|Nargizaning iltimosi`, [
      { label: `— Why do you want to come?|— Зачем тебе туда?|— Nega biz bilan bormoqchisan?`, lines: [
        ['nargiza', `If I stay, the Ustoz will cure me, and I'll never hear him again. I'd rather hear him and drown.|Если я останусь, Устоз меня вылечит, и я больше никогда его не услышу. Лучше слышать его и утонуть.|Qolsam, Ustoz meni davolaydi, men uni boshqa hech qachon eshitmayman. Uni eshitib cho'kib ketganim yaxshi.`]
      ] },
      { label: `— What will Shirin do if you leave?|— Что сделает Ширин, если ты уйдёшь?|— Ketsang, Shirin nima qiladi?`, lines: [
        ['nargiza', `Cry. Then send the wardens. I'm her favourite. That's worse than being her enemy.|Поплачет. Потом пошлёт стражу. Я её любимица. Это хуже, чем быть её врагом.|Yig'laydi. Keyin qo'riqchilarni yuboradi. Men uning eng sevimli shogirdiman. Bu dushmani bo'lishdan ham yomon.`],
        ['sado', `So if she comes with us, the Singers come after us harder.|Значит, если она пойдёт с нами, Певцы возьмутся за нас всерьёз.|Demak, u biz bilan borsa, Xonandalar bizni jiddiyroq quvadi.`]
      ] },
      { label: `— Sado, what do you think?|— Садо, что думаешь?|— Sado, sen nima deysan?`, lines: [
        ['sado', `She hears him. Nobody else does. Down there, someone who can hear might matter more than a lamp.|Она его слышит. Больше никто. Там, внизу, тот, кто слышит, может оказаться нужнее лампы.|U uni eshitadi. Boshqa hech kim eshitmaydi. Pastda eshita oladigan odam chiroqdan ham kerakliroq bo'lishi mumkin.`],
        ['sado', `But it's dark down there. And she's never fought anything in her life.|Но там темно. А она в жизни ни с кем не дралась.|Lekin u yer qorong'i. U esa umrida hech kim bilan olishmagan.`]
      ] }
    ], [
      { k: 'down', label: `"Come. Bring the lamps."|«Идём. Бери лампы.»|«Yur. Chiroqlarni ol.»` },
      { k: 'stayed', label: `"Stay. Someone up here has to hear him too."|«Останься. Кто-то и наверху должен его слышать.»|«Qol. Tepada ham kimdir uni eshitib turishi kerak.»` }
    ], o => {
      setF('nargiza', o.k);
      let a;
      if (o.k === 'down') {
        rep('singers', -2); trust(1);
        a = [
          ['nargiza', `I brought two. One for you, one for... for the dark. You don't like the dark, do you?|Я взяла две. Одну тебе, а другую… для темноты. Ты ведь не любишь темноту?|Ikkita oldim. Bittasi senga, bittasi... qorong'ilik uchun. Sen qorong'ini yoqtirmaysan-a?`],
          ['hero', `I don't mind it.|Мне всё равно.|Menga farqi yo'q.`],
          ['sado', `...How did she know that?|…Откуда она знает?|...U buni qayerdan biladi?`]
        ];
      } else {
        rep('singers', 1, true);
        a = [
          ['nargiza', `...Then I'll listen for you. If he ever says your name, I'll tell you.|…Тогда я буду слушать за тебя. Если он когда-нибудь назовёт твоё имя, я тебе передам.|...Unda sen uchun tinglab turaman. Agar u bir kun ismingni aytsa, senga yetkazaman.`],
          ['', `She puts one of her lamps in your hand anyway, and closes your fingers around it.|Одну лампу она всё равно вкладывает тебе в руку и сжимает на ней твои пальцы.|Baribir chiroqlaridan birini qo'lingga tutqazadi va barmoqlaringni ustidan qisib qo'yadi.`],
          ['sado', `Keep it lit. Please. Whatever happens down there, keep it lit.|Пусть горит. Пожалуйста. Что бы там внизу ни было — пусть горит.|U o'chmasin. Iltimos. Pastda nima bo'lsa ham — o'chmasin.`]
        ];
      }
      play(a.concat([
        ['', `You climb over the rim and start down. The rope ends long before the water does.|Ты перелезаешь через край и начинаешь спуск. Верёвка кончается задолго до воды.|Chetidan oshib, pastga tusha boshlaysan. Arqon suvga yetmay turib tugaydi.`],
        ['sado', `It's going to be dark down there, isn't it?|Там внизу будет темно, да?|Pastda qorong'i bo'ladi, a?`],
        ['hero', `Yes.|Да.|Ha.`],
        ['sado', `Then talk to me. The whole way. Count something. You like counting.|Тогда говори со мной. Всю дорогу. Считай что-нибудь. Ты же любишь считать.|Unda men bilan gaplashib bor. Yo'l bo'yi. Nimanidir sana. Sanashni yaxshi ko'rasan-ku.`],
        ['hero', `One. Two. Three...|Раз. Два. Три…|Bir. Ikki. Uch...`],
        ['', `The Well swallows the light, and then you.|Колодец проглатывает свет, а потом и тебя.|Quduq avval yorug'likni, keyin seni yutadi.`]
      ]), done);
    }));
  }
});

/* ---------- a handle for tests and other files ---------- */
G.__act1 = { LANDS, RESTS, BOSSES, BARKS, DEATH_LINES: DEATHS, introPages, ids: ['p_tail', 'b_vault', 'r_plane', 'a1_tail', 'a1_rabat', 'b_tower', 'r_salt', 'a1_bazaar', 'a1_ark', 'b_court', 'r_ark', 'a1_cloister', 'b_choir'] };
}
