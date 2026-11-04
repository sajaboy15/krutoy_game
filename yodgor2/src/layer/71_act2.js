/* =====================================================================
   Yodgor v2 — ACT II «Under the Skin» (plan entries 13–25).
   r_den, a2_karez, a2_streets, b_cistern (albasty), r_lamp, a2_old,
   a2_well, b_seven (seven), r_rib, a2_spine, b_shrine (barys),
   r_spine, a2_heart.
   Dialogue v3 (STYLE.md v3): each language written from the meaning; no
   moral/intent tags on choices; hub questions start with an em dash;
   Hollowness costs readable from the words only. Mechanics unchanged.
   Reads Act I flags (widow, alp, davron, chain, voice, gulnora, tillabek,
   hound, truth, nargiza, rustamMem, oydinName) and sets the Act II flags of
   the CONTRACT, plus a few extra ones listed in EXTRA FLAGS below.
   EXTRA FLAGS (for 72_act3): rustamKey 1 · maskedAns honest|threat|give|face ·
   nest tail|feed|sell (Albasty's nest of children's tumars; tail = the
   drowned boy's memory goes to Mehri) · farrukh kept|home|sold|drunk ·
   oydinAns truth|lie|silent · oydinDoubt 1 (shown) · relics oydin|ravshan ·
   wellLine lead|burn|seal|let · sevenEnd rest|remember|verse · verse 1 ·
   chainSong 1 · rustamWord forgave|condemned|silent · heartStance with|against|speak ·
   dreamBy nargiza|oydin|water · shirinEye 1 · divanPromise 1
   ===================================================================== */
{
const f2 = (k, v) => { F()[k] = v; save(); };
const thin = () => R().void >= 50;
const hollowEyes = () => R().void >= 75;
const FORGOT = `You can't remember why this mattered.|Уже не помнишь, почему это было важно.|Bu nega muhim bo'lganini endi eslay olmaysan.`;
const lock50 = () => (thin() ? FORGOT : null);
const hasVoice = () => F().voice === 'bought' || F().voice === 'stolen' || !!F().turabSpoke;
const nargizaDown = () => F().nargiza === 'down';
const tookRelics = () => F().oydin === 'took';
const sub2 = text => { if (G.SADO && G.SADO.awake) G.SADO.subtitle(text, { now: true }); };
const taste = why => { R().tastes = (R().tastes || 0) + 1; addVoid(8, why || `a taste|проба памяти|xotira totildi`); };
// one first scene, then short repeats
const firstThen = (key, first, again) => done => {
  if (once(key)) first(done);
  else play([typeof again === 'function' ? again() : pick(again)], done);
};

// minor voices of this act
CAST.keeper = { name: `The lamp-keeper|Хозяйка лампы|Chiroqchi xola`, portrait: 'widow' };
CAST.smuggler = { name: `A smuggler|Контрабандист|Kontrabandachi`, portrait: null };
CAST.albasty = { name: `Albasty|Албасты|Albasti`, portrait: null };
CAST.seven = { name: `The Seven|Семеро|Yettilar`, portrait: null };
CAST.akbars = { name: `Ak Bars|Ак Барс|Oq Bars`, portrait: null };

const MASKED = { robe: '#17121a', trim: '#2a2030', skin: '#c08a62', head: 'hood', headC: '#2a2030', mask: '#e8e0d0', glow: '#7fe8dc' };
// people near the rest's first table, in a row
const nearStart = i => ({
  get x() {
    const pl = G.world && G.world.player;
    return (pl ? pl.x : 120) + 64 + i * 26;
  }
});

/* =====================================================================
   13 · r_den — Smugglers' den, upper Karez
   ===================================================================== */
const RUSTAM_HABIT = [
  ['rustam', `…smugglers pay in salt… salt is honest… salt doesn't remember…|…контрабандисты платят солью… соль честная… соль ничего не помнит…|…kontrabandachilar tuz bilan to'laydi… tuz halol… tuz hech narsani eslamaydi…`],
  ['rustam', `…forty steps to the vault door… forty… and from the start…|…до двери хранилища сорок шагов… сорок… и сначала…|…xazina eshigigacha qirq qadam… qirq… yana boshidan…`],
  ['rustam', `…write neatly, boy. A blot in the book is a blot on someone's life…|…пиши ровно, сынок. Клякса в книге — клякса на чьей-то жизни…|…chiroyli yoz, bolam. Daftarga tushgan dog' birovning umriga tushadi…`],
  ['', `Rustam-aka holds out his palm for a coin that isn't coming. He waits. Then he closes his fingers, satisfied, as if he'd been paid.|Рустам-ака протягивает ладонь за монетой, которой не будет. Ждёт. Потом сжимает пальцы — довольный, будто ему заплатили.|Rustam aka kelmaydigan tanga uchun kaftini tutadi. Kutadi. Keyin pul olgandek mamnun bo'lib, barmoqlarini yumadi.`]
];

REST('r_den', {
  name: `The Smugglers' Den|Логово контрабандистов|Kontrabandachilar ini`,
  sub: `The upper Karez. Lamp oil, wet rope, bitter water|Верхний кяриз. Масло для ламп, мокрые верёвки, горькая вода|Yuqori koriz. Chiroq moyi, ho'l arqon, achchiq suv`,
  arrive: done => play([
    ['', `The ladder from the Well ends in a cave that smells of lamp oil and wet rope. Smugglers count crates by a single wick. Nobody looks up.|Лестница из Колодца упирается в пещеру. Пахнет ламповым маслом и мокрой верёвкой. Контрабандисты при одном фитиле пересчитывают ящики и голов не поднимают.|Quduqdan tushgan narvon g'orga tiraladi. Chiroq moyi bilan ho'l arqon hidi. Kontrabandachilar bitta pilik yorug'ida quti sanashyapti, hech kim bosh ko'tarmaydi.`],
    ['sado', `So this is the Karez. The water tunnels. We're inside him now, aren't we? Inside the Sleeper.|Так это и есть кяриз? Водяные ходы… Мы ведь теперь у него внутри, да? Внутри Спящего.|Koriz degani shumi? Suv yo'llari… Endi uning ichidamiz-a? Uxlovchining ichida.`],
    ['hero', `Under his skin. Yes.|Под кожей. Да.|Terisining tagida. Ha.`],
    ['sado', `Let me get this straight. Shirin's song bites a piece off you every day. It only stops when you bring her all seven founders' tumars. And the thief went down here.|Так, давай по порядку. Песня Ширин каждый день откусывает от тебя кусочек. Отстанет, только когда ты принесёшь ей все семь тумаров основателей. А вор ушёл сюда, вниз.|Xo'p, bir boshdan olaylik. Shirinning qo'shig'i har kuni sendan bir tishlam uzib oladi. Yettala asoschilar tumarini olib bormaguningcha qo'ymaydi. O'g'ri esa shu yoqqa, pastga tushgan.`],
    ['hero', `And I have until the new moon.|И срок — до новолуния.|Muddatim — yangi oygacha.`],
    ['sado', `Right. …It's very dark past that lamp. Don't go past it yet, all right?|Ага. …За той лампой совсем темно. Ты пока туда не ходи, ладно?|Ha. …Anavi chiroqdan narisi zim-ziyo. Hozircha u yoqqa o'tma, xo'pmi?`],
    () => F().chain === 'carried' && ['smuggler', `Since you hauled that chain up to the Tail, they've been burning tithe-houses up there, yodchi. Good for business. Sit anywhere.|С тех пор как ты притащил ту цепь в Хвост, там жгут дома десятины, ёдчи. Нам только на руку. Садись куда хочешь.|O'sha zanjirni Dumga ko'tarib chiqqaningdan beri u yoqda ushr uylariga o't qo'yishyapti, yodchi. Bizning ishga foyda. Qayerga xohlasang, o'tir.`],
    () => F().davron === 'led' && ['smuggler', `Davron the caravan-bashi came through with three waterskins that giggled. Left this for "the yodchi who can't count children".|Тут проходил караван-баши Даврон. С тремя бурдюками, которые хихикали. Оставил вот это — «ёдчи, который не умеет считать детей».|Bu yerdan karvonboshi Davron o'tdi. Uchta meshi bor ekan — ichidan kikir-kikir kulgi eshitiladi. Mana buni «bolalarni sanashni bilmaydigan yodchi»ga qoldirdi.`, () => gold(30)],
    () => F().davron === 'reported' && ['smuggler', `Davron came down alone. Drank. Asked if anyone knew a yodchi with a dead man's satchel. I said no. Don't thank me.|Даврон спускался один. Пил. Спрашивал, не знает ли кто ёдчи с сумкой мертвеца. Я сказал — не знаю. Не благодари.|Davron yolg'iz tushdi. Ichdi. O'likning xaltasini ko'tarib yurgan yodchini taniysizlarmi, deb so'radi. Tanimayman dedim. Rahmat aytishing shart emas.`],
    () => (F().davron === 'bribe' || F().davron === 'bluff') && ['smuggler', `A Singers' inspector came asking about Davron's caravan. Sour man. Paid in copper. We told him the honest truth: we don't remember.|Заходил смотритель от Певцов, всё про караван Даврона выспрашивал. Кислый такой. Платил медью. Мы сказали ему чистую правду: не помним.|Xonandalarning noziri kelib, Davronning karvonini surishtirdi. Basharasi nordon. Mis chaqa bilan to'ladi. Unga rostini aytdik: eslamaymiz.`],
    () => hollowEyes() && ['smuggler', `You've got the Hollow look, yodchi. Sit by the lamp a while before you go into the water.|Глаза у тебя как у Пустого, ёдчи. Посиди у лампы, прежде чем лезть в воду.|Ko'zlaring Bo'shlarnikiga o'xshab qolibdi, yodchi. Suvga tushishdan oldin chiroq yonida bir oz o'tir.`],
    ['', `Three people wait by the water barrels, each pretending the others aren't there: a Singer in grey, a man with a Humo feather, and a hooded girl with a white mask on her belt.|У бочек с водой ждут трое, и каждый делает вид, что остальных тут нет: Певец в сером, человек с пером Хумо и девчонка в капюшоне с белой маской на поясе.|Suv bochkalari yonida uch kishi kutib turibdi, har biri qolganlarini ko'rmaganga oladi: kulrang kiyimli Xonanda, Humo pati taqqan odam va beliga oq niqob osgan qalpoqli qizcha.`],
    ['sado', `The Singers, the Divan, and… someone in a mask. All three came for you. Let's hear each of them out. At least we'll know who wants what.|Певцы, Диван и… кто-то в маске. Все трое — по твою душу. Давай выслушаем каждого. Хоть поймём, кому что надо.|Xonandalar, Devon va… niqobli kimdir. Uchalasi ham seni deb kelgan. Har birini eshitaylik. Hech bo'lmasa kimga nima kerakligini bilamiz.`]
  ], done),

  rustam: firstThen('a2:den:rustam', done => {
    const f = F();
    play([
      ['', `Rustam-aka sits on the crate he always used when he came down to collect from the smugglers. His fingers count coins that aren't there.|Рустам-ака сидит на том же ящике, где всегда сидел, когда спускался собирать с контрабандистов. Пальцы пересчитывают монеты, которых нет.|Rustam aka kontrabandachilardan yig'im olgani tushganda doim o'tiradigan qutisida o'tiribdi. Barmoqlari yo'q tangalarni sanaydi.`],
      ['rustam', `…ten… eleven… the tithe was counted twice… twice…|…десять… одиннадцать… десятину посчитали дважды… дважды…|…o'n… o'n bir… ushr ikki marta sanaldi… ikki marta…`],
      ['sado', `There's one more memory left in him. Wrapped tight and pushed down deep. As if he was hiding it from himself.|В нём осталось ещё одно воспоминание. Туго свёрнутое, засунутое на самое дно. Будто он прятал его от себя.|Unda yana bitta xotira qolibdi. Mahkam o'ralgan, eng tubiga tiqib qo'yilgan. Go'yo uni o'zidan yashirgandek.`],
      () => (f.rustamMem || 0) < 3 && ['sado', `The others are old and worn. This one is whole. Nobody's ever touched it.|Остальные старые, затёртые. А это целое. Его никто ни разу не трогал.|Qolganlari eski, titilib ketgan. Bunisi butun. Unga hali hech kim tegmagan.`],
      ['sado', `If you taste it, we'll see what he hid. But it'll take a piece of you too, and it'll wear his memory thin. Your call.|Попробуешь — увидим, что он прятал. Но и от тебя оно отщипнёт кусочек, а его память сотрётся. Решай сам.|Totib ko'rsang, nimani yashirganini bilamiz. Lekin bu sendan ham bir parcha oladi, uning xotirasi ham yeyiladi. O'zing bil.`]
    ], () => ask(`Rustam-aka|Рустам-ака|Rustam aka`, [
      { label: `Taste the memory he hid.|Попробовать то, что он спрятал.|U yashirgan xotirani totib ko'rish.`, cost: 8, id: 'taste' },
      { label: `"Keep it, Rustam-aka. It's yours."|«Оставьте себе, Рустам-ака. Это ваше.»|«O'zingizda qolsin, Rustam aka. Bu sizniki.»`, id: 'leave' }
    ], o => {
      if (o.id === 'leave') {
        trust(1);
        play([['sado', `…Thank you. I don't know why that matters to me. But it does.|…Спасибо. Не знаю, почему мне это важно. Но важно.|…Rahmat. Bu menga nega muhimligini bilmayman. Lekin muhim.`]], done);
        return;
      }
      taste(`Rustam's memory|память Рустама|Rustamning xotirasi`);
      f2('rustamMem', 4); f2('rustamKey', 1);
      play([
        ['memory', `The Night of Payment. The vault door. Rustam's hands, not yet old, holding the big iron key. He has been waiting a long time.|Ночь Уплаты. Дверь хранилища. Руки Рустама, ещё не старые, держат большой железный ключ. Он ждёт уже давно.|To'lov kechasi. Xazina eshigi. Rustamning hali qarimagan qo'llarida katta temir kalit. U ancha vaqtdan beri kutyapti.`],
        ['memory', `A woman steps out of the dark. A white scar on her cheek, a glow under her collarbone. She came to fight. He holds out the key.|Из темноты выходит женщина. Белый шрам на щеке, под ключицей что-то светится. Она пришла драться. А он протягивает ей ключ.|Qorong'idan bir ayol chiqadi. Yonog'ida oq chandiq, o'mrovi ostida nimadir yonib turibdi. U urushgani kelgan. Rustam esa unga kalitni uzatadi.`],
        ['rustam', `Take it, Oydinoy. Take all of it. And take it out of me too. I'm the one who wrote you into the book. I won't carry that into my grave.|Бери, Ойдиной. Всё бери. И из меня тоже забери. Это я вписал тебя в книгу. Не хочу тащить это с собой в могилу.|Ol, Oydinoy. Hammasini ol. Mendan ham sug'urib ol. Seni daftarga men yozganman. Buni go'rga olib ketolmayman.`],
        ['memory', `She doesn't take it at once. "Does he still count steps when he's scared?"|Она не сразу берёт ключ. «Он всё ещё считает шаги, когда ему страшно?»|U kalitni darrov olmaydi. «U hali ham qo'rqsa, qadam sanaydimi?»`],
        ['rustam', `Up to forty. Then he starts again.|До сорока. Потом по новой.|Qirqqacha. Keyin yana boshidan.`],
        ['memory', `She takes the key and sings. He lets her. The last thing he feels is relief, heavy and sweet, like a rotten tooth coming out.|Она берёт ключ и начинает петь. Он не противится. Последнее, что он чувствует, — облегчение, тяжёлое и сладкое, как когда выдернули гнилой зуб.|U kalitni olib, kuylay boshlaydi. Rustam qarshilik qilmaydi. Oxirgi sezgani — yengillik. Og'ir va shirin, xuddi chirigan tish sug'urilgandek.`],
        ['sado', `He asked her. He asked her to empty him.|Он сам её попросил. Сам попросил, чтобы она его опустошила.|O'zi so'radi. O'zini bo'shatib olishni o'zi so'radi.`],
        () => f.oydinName && ['sado', `Oydin. The girl in the cellar, from his other memory. She grew up. And she came back for him.|Ойдин. Девочка из подвала, из другого его воспоминания. Выросла. И вернулась за ним.|Oydin. Uning boshqa xotirasidagi, yerto'ladagi qizcha. Katta bo'libdi. Va uning oldiga qaytib kelibdi.`],
        ['sado', `…Ravshan. Do you count steps when you're scared?|…Равшан. А ты считаешь шаги, когда страшно?|…Ravshan. Sen qo'rqqanda qadam sanaysanmi?`],
        ['hero', `No.|Нет.|Yo'q.`],
        ['', `You notice you've been counting the drips from the ceiling. Thirty-one. Thirty-two. You stop.|И тут ты замечаешь, что считаешь капли с потолка. Тридцать одна. Тридцать две. Бросаешь.|Shunda shiftdan tomayotgan tomchilarni sanayotganingni sezib qolasan. O'ttiz bir. O'ttiz ikki. To'xtaysan.`]
      ], done);
    }));
  }, RUSTAM_HABIT),

  turab: done => play(hasVoice() ? [
    ['turab', `The deep Karez wasn't dug for water, yodchi. Bakhshi dug it, singing as they worked, so their voices would reach him. The water came on its own, because he was listening.|Глубокий кяриз копали не ради воды, ёдчи. Его рыли бахши и пели за работой, чтобы их голоса доходили до него. А вода пришла сама — потому что он слушал.|Chuqur korizni suv uchun qazishmagan, yodchi. Uni baxshilar kuylab-kuylab qazishgan, ovozlari unga yetsin deb. Suv o'zi chiqib keldi — chunki u tinglab turardi.`],
    ['turab', `Mind the dark down there. It isn't empty. It's waiting for someone to tell it something.|Осторожнее там, в темноте. Она не пустая. Она ждёт, чтобы ей что-нибудь рассказали.|Pastdagi qorong'ilikdan ehtiyot bo'l. U bo'sh emas. Kimdir unga biror narsa aytib berishini kutib yotibdi.`]
  ] : [
    ['', `Turab cups his hands like a bowl, lowers them to the floor and pretends to sing into them. Then he puts a finger to his lips and points down.|Тураб складывает ладони чашей, опускает к самому полу и будто поёт в них. Потом прикладывает палец к губам и показывает вниз.|Turob kaftlarini kosadek qilib, yerga tushiradi va go'yo ularning ichiga kuylaydi. Keyin barmog'ini labiga bosib, pastni ko'rsatadi.`],
    ['sado', `Singing into the ground. To someone below. …He means the Sleeper, doesn't he?|Поёт в землю. Кому-то там, внизу. …Это он про Спящего, да?|Yerga kuylayapti. Pastdagi kimgadir. …Uxlovchini aytyapti, a?`]
  ], done),

  farrukh: firstThen('a2:den:farrukh', done => play([
    ['farrukh', `Welcome to my den. Technically it's the smugglers' den, but the best crate is mine, so.|Добро пожаловать в моё логово. Формально оно, конечно, контрабандистов, но лучший ящик — мой. Так что сам понимаешь.|Inimga xush kelibsan. Rasman bu kontrabandachilarniki, lekin eng yaxshi quti meniki. Demak, o'zing tushunasan.`],
    () => F().gulnora === 'left' && ['farrukh', `The bride from that Ark wedding came down last week. Wanted to buy a forgetting. Says she dreams of a boy she's never met. I sold her nothing. Don't look at me like that.|Невеста с той свадьбы в Арке спускалась на прошлой неделе. Хотела купить забвение. Говорит, ей снится парень, которого она в глаза не видела. Ничего я ей не продал. Не смотри так.|Arkdagi o'sha to'yning kelini o'tgan hafta tushib keldi. Unutish sotib olmoqchi ekan. Tushiga umrida ko'rmagan bir yigit kirarmish. Hech narsa sotmadim. Bunaqa qarama.`],
    () => F().gulnora === 'blackmail' && ['farrukh', `A merchant from the Ark paid me to forget I'd ever heard of you. Funny, I'd forgotten already. People are talking about your little blackmail, yodchi.|Один купец из Арка заплатил мне, чтобы я забыл, что о тебе слышал. Смешно — я и так забыл. А про твой шантажик уже болтают, ёдчи.|Arklik bir savdogar sen haqingda eshitganimni unutishim uchun pul berdi. Kulgili — men allaqachon unutgandim. Shantajing haqida esa odamlar gapiryapti, yodchi.`],
    () => F().truth && ['farrukh', `That founders' tumar I sold you? A hooded woman dropped it out of her bag, right here by the barrels. Dropped it. Her kind don't drop things.|Помнишь тумар основателей, что я тебе продал? Его выронила из сумки женщина в капюшоне. Прямо здесь, у бочек. Выронила. Такие ничего не роняют просто так.|Senga sotgan asoschilar tumarini eslaysanmi? Uni qalpoqli bir ayol xaltasidan tushirib qoldirgan. Shu yerda, bochkalar yonida. Tushirib qoldirgan. Bunaqalar hech narsani bexosdan tushirmaydi.`],
    ['farrukh', `Going deeper? I can sell you what I know about the deep Karez. Information is the only thing I sell that doesn't wear out when you taste it.|Лезешь глубже? Могу продать, что знаю про нижний кяриз. Сведения — единственный мой товар, который не стирается, сколько его ни пробуй.|Chuqurroqqa tushyapsanmi? Pastki koriz haqida bilganlarimni sotishim mumkin. Ma'lumot — totganing bilan yeyilmaydigan yagona molim.`]
  ], () => hub(`Farrukh|Фаррух|Farrux`, [
    { label: `— Why are you going down too?|— А тебе-то самому зачем вниз?|— O'zing nega pastga tushyapsan?`, lines: [
      ['farrukh', `The Divan put a price on my head. Down here heads come cheaper and nobody looks at them. Also, the best stolen mornings wash down with the water.|Диван назначил цену за мою голову. Здесь головы дешевле, и никто на них не смотрит. К тому же лучшие краденые утра стекают сюда вместе с водой.|Devon boshimga narx qo'ydi. Bu yerda bosh arzonroq, hech kim qaramaydi ham. Qolaversa, eng yaxshi o'g'irlangan tonglar suv bilan shu yoqqa oqib tushadi.`]
    ] }
  ], [
    { label: `Pay for what he knows.|Заплатить за его сведения.|Bilganlari uchun pul to'lash.`, price: 30, id: 'buy' },
    { label: `"Keep it. I'll find out for myself."|«Оставь себе. Сам разберусь.»|«O'zingda qolsin. O'zim bilib olaman.»`, id: 'no' }
  ], o => {
    if (o.id === 'buy') play([
      ['farrukh', `Under the old streets there's a cistern. Something lives there the smugglers call the Albasty. The Mother. She collects children's memories. She'll go for anything small in you.|Под старыми улицами есть цистерна. Там живёт тварь, контрабандисты зовут её Албасты. Мать. Она собирает детскую память. И потянется ко всему маленькому, что в тебе есть.|Eski ko'chalar tagida sardoba bor. U yerda kontrabandachilar Albasti deydigan bir maxluq yashaydi. Ona. U bolalar xotirasini yig'adi. Sendagi har qanday kichik narsaga qo'l cho'zadi.`],
      ['farrukh', `And the masked ones, Those Who Remember. Their leader hums when she's nervous. None of her people know the tune. Make of that what you like.|И ещё эти, в масках. Те, кто помнит. Их главная, когда нервничает, напевает. И никто из её людей этого мотива не знает. Думай что хочешь.|Yana niqoblilar bor — Eslaganlar. Boshliqlari asabiylashsa, xirgoyi qiladi. Odamlaridan birortasi ham bu kuyni bilmaydi. Xohlaganingcha tushun.`]
    ], () => { know(`The Albasty waits under the old streets|Под старыми улицами ждёт Албасты|Eski ko'chalar tagida Albasti kutib turibdi`); done(); });
    else play([['farrukh', `Wise. My crate, my rules.|Мудро. Ящик мой — и правила мои.|Oqilona. Quti meniki, qoida ham meniki.`]], done);
  })), [
    ['farrukh', `Still here? Waiting won't make the dark any lighter. I've checked.|Всё ещё тут? Сколько ни жди, светлее не станет. Я проверял.|Hali shu yerdamisan? Kutganing bilan qorong'i yorishmaydi. Tekshirib ko'rganman.`],
    ['farrukh', `Find anything sweet down there, I'll buy it. Anything bitter, I'll buy that too. Cheaper.|Найдёшь внизу что-то сладкое — куплю. Горькое тоже куплю. Подешевле.|Pastdan shirin narsa topsang — olaman. Achchiq topsang ham olaman. Arzonroqqa.`]
  ]),

  lullaby: done => lullaby(done, `Alla, little one, alla. The water sleeps beneath the stone. Sleep, and the stone will hold you. Alla.|Алла, маленький, алла. Под камнем спит вода. Спи — камень тебя удержит. Алла.|Alla, bolajonim, alla. Tosh tagida suv uxlar. Uxla, tosh seni tutib turar. Alla.`,
    `The smugglers' wick flickers and steadies. One of them hums along under his breath, then looks round, embarrassed, as if he'd heard it from nowhere.|Фитиль вздрагивает и выравнивается. Один из контрабандистов начинает тихонько подпевать — и смущённо оглядывается, будто это пришло к нему ниоткуда.|Pilik lip etadi-yu, yana tekis yonadi. Kontrabandachilardan biri ohista jo'r bo'ladi, keyin go'yo qayoqdandir eshitgandek, xijolat bo'lib atrofga qaraydi.`),

  people: [
    Object.assign(nearStart(0), {
      look: 'singer', prompt: `Talk to the Singer|Поговорить с Певцом|Xonanda bilan gaplashish`,
      talk: firstThen('a2:den:singer', done => play([
        ['singer', `Ustoz Shirin asks after her relics, yodchi. Nine nights to the new moon. She says you'll feel it before you see it.|Устоз Ширин спрашивает о своих реликвиях, ёдчи. До новолуния девять ночей. Она говорит, ты почувствуешь его раньше, чем увидишь.|Ustoz Shirin tabarruklarini so'rayapti, yodchi. Yangi oygacha to'qqiz tun qoldi. Uni ko'rishingdan oldin sezasan, deydi.`],
        () => F().chain === 'seal' && ['singer', `She knows you kept her seal from the Tower. She asks you to recall what it has bought you so far. Nothing.|Она знает, что печать из Башни ты оставил себе. И просит припомнить, много ли она тебе принесла. Ничего.|Minoradagi muhrini o'zingda olib qolganingni biladi. Shu paytgacha u senga nima bergani haqida o'ylab ko'r, deydi. Hech narsa.`],
        () => F().chain === 'carried' && ['singer', `The Tail is burning tithe-houses. Ustoz says that's on you. She said it without anger. That was worse.|Хвост жжёт дома десятины. Устоз говорит, это на тебе. Сказала спокойно, без злости. От этого только хуже.|Dum ushr uylariga o't qo'yyapti. Ustoz buni sening bo'yningda deydi. Jahlsiz aytdi. Shunisi yomon.`],
        () => nargizaDown() && ['singer', `And Nargiza. If she's with you, tell her the Cloister is cold without her. Ustoz won't say it. So I'm saying it.|И ещё Наргиза. Если она с тобой, передай ей: без неё в Обители холодно. Устоз этого не скажет. Поэтому говорю я.|Yana Nargiza. Agar sen bilan bo'lsa, ayt: usiz Xonaqoh sovuq. Ustoz buni aytmaydi. Shuning uchun men aytyapman.`],
        ['singer', `She sends this. Water from the Well, sung over. It will quiet the song in you, a little.|Она передаёт тебе вот это. Вода из Колодца, над ней пели. Песня в тебе от неё немного стихнет.|U buni berib yubordi. Quduq suvi, ustida kuylangan. Ichingdagi qo'shiqni biroz bosadi.`]
      ], () => hub(`The Singer's flask|Фляга Певца|Xonandaning ko'zachasi`, [
        { label: `— What does Shirin want?|— Чего хочет Ширин?|— Shirin nima istaydi?`, lines: [
          ['singer', `What she always wants: for the Sleeper to sleep. Her relics, the founders' tumars, hold the song that keeps him asleep. Without them the song is wearing thin.|Того же, чего всегда: чтобы Спящий спал. В её реликвиях, тумарах основателей, — песня, на которой держится его сон. Без них песня истончается.|Doimgidek: Uxlovchi uxlab yotsin. Uning tabarruklarida — asoschilar tumarlarida — uyqusini ushlab turgan qo'shiq bor. Ularsiz qo'shiq yupqalashib boryapti.`]
        ] },
        { label: `— And at the new moon?|— А что будет в новолуние?|— Yangi oyda nima bo'ladi?`, lines: [
          ['singer', `At the new moon the Pledge Song in you finishes, and you'll be Hollow. Unless Ustoz has her relics first. She takes no pleasure in it.|В новолуние Песня залога в тебе допоётся до конца, и ты станешь Пустым. Если только реликвии не вернутся к Устоз раньше. Ей это радости не доставляет, поверь.|Yangi oyda ichingdagi Garov qo'shig'i oxiriga yetadi va sen Bo'sh bo'lib qolasan. Agar undan oldin tabarruklar Ustozga qaytmasa. Bundan u xursand emas, ishon.`]
        ] },
        { label: `— Who has the relics, do you think?|— Как думаешь, у кого реликвии?|— Sencha, tabarruklar kimda?`, lines: [
          ['singer', `Ustoz suspects the masked ones. Those Who Remember. Thieves who steal Hollow out of the city. But suspecting isn't knowing.|Устоз подозревает тех, что в масках. Тех, кто помнит. Воров, которые уводят Пустых из города. Но подозревать — ещё не знать.|Ustoz niqoblilardan gumon qilyapti. Eslaganlardan. Bo'shlarni shahardan o'g'irlab ketadigan o'g'rilardan. Lekin gumon qilish — bilish degani emas.`],
          ['sado', `The girl over there has a mask on her belt. Just saying. I'm not saying anything.|А у той девчонки маска на поясе. Я так, к слову. Я ничего не говорю.|Anavi qizchaning belida niqob bor. Shunchaki aytdim. Hech narsa demayapman.`]
        ] }
      ], [
        { label: `Drink the Well water.|Выпить воду из Колодца.|Quduq suvini ichish.`, cost: -3, id: 'drink' },
        { label: `Pour it back into the Karez.|Вылить её обратно в кяриз.|Suvni korizga to'kib tashlash.`, id: 'pour' },
        { label: `"Tell Ustoz the masked ones have them."|«Передай Устоз: реликвии у тех, кто в масках.»|«Ustozga ayt: tabarruklar niqoblilarda.»`, id: 'tell' }
      ], o => {
        if (o.id === 'drink') {
          addVoid(-3, `Well water|вода Колодца|Quduq suvi`); rep('singers', 1, true); f2('shirinEye', 1);
          play([
            ['', `The water is bitter and cold. The song in your chest settles like a fed dog. And somewhere far above, you're sure of it, Shirin now knows exactly where you are.|Вода горькая и холодная. Песня в груди затихает, как накормленная собака. И ты почему-то уверен: где-то далеко наверху Ширин теперь точно знает, где ты.|Suv achchiq va muzdek. Ko'ksingdagi qo'shiq qorni to'ygan itdek tinchiydi. Negadir aminsan: qayerdadir, ancha tepada, Shirin endi qayerdaligingni aniq biladi.`],
            ['sado', `Tastes like a leash.|На вкус как поводок.|Ta'mi bo'yinga solingan arqondek.`]
          ], done);
        } else if (o.id === 'pour') {
          trust(1);
          play([['singer', `…I'll tell her you were grateful. She won't believe me. But she'll like that I tried.|…Скажу ей, что ты был благодарен. Она не поверит. Но ей понравится, что я пытался.|…Unga minnatdor bo'ldi, deyman. Ishonmaydi. Lekin urinib ko'rganim unga yoqadi.`]], done);
        } else {
          rep('singers', 2); rep('remember', -2, true); trust(-1);
          play([
            ['singer', `Those Who Remember. Ustoz thought so. Now she'll know. Thank you, yodchi. She won't forget it.|Те, кто помнит. Устоз так и думала. Теперь будет знать наверняка. Спасибо, ёдчи. Она этого не забудет.|Eslaganlar. Ustoz shunday deb o'ylagandi. Endi aniq biladi. Rahmat, yodchi. U buni unutmaydi.`],
            ['sado', `You gave them away. You don't even know them. …Neither do I. So why does it feel like you gave me away?|Ты их сдал. Ты их даже не знаешь. …И я не знаю. Тогда почему мне кажется, что ты сдал меня?|Ularni tutib berding. Ularni tanimaysan ham. …Men ham tanimayman. Unda nega meni tutib bergandek tuyulyapti?`]
          ], done);
        }
      })), [['singer', `Nine nights, yodchi. Eight, by morning.|Девять ночей, ёдчи. К утру — восемь.|To'qqiz tun, yodchi. Tongga sakkizta qoladi.`]])
    }),
    Object.assign(nearStart(1), {
      look: 'divan', prompt: `Talk to the envoy|Поговорить с посланником|Elchi bilan gaplashish`,
      talk: firstThen('a2:den:envoy', done => play([
        () => F().tillabek === 'accepted' && ['envoy', `Tilla-bek remembers your answer in the garden with pleasure. Pleasure is the rarest thing in his collection.|Тилла-бек с удовольствием вспоминает ваш ответ в саду. А удовольствие — самая редкая вещь в его коллекции.|Tillabek bog'dagi javobingizni zavq bilan eslaydi. Zavq esa uning to'plamidagi eng noyob narsa.`],
        () => F().tillabek === 'refused' && ['envoy', `Tilla-bek remembers your refusal. He keeps it in a little labelled box. He wonders if you'd care to give it a pair.|Тилла-бек помнит ваш отказ. Хранит его в шкатулочке с ярлычком. И интересуется, не желаете ли вы подобрать ему пару.|Tillabek rad javobingizni eslaydi. Uni yorliq yopishtirilgan qutichada saqlaydi. Unga juft topib bermaysizmi, deb so'rayapti.`],
        () => F().hound === 'killed' && ['envoy', `The Hound was buried with honours. Tilla-bek hired a mourner who remembers him fondly. For appearances.|Пса похоронили с почестями. Тилла-бек нанял плакальщицу, которая вспоминает его с нежностью. Приличия есть приличия.|Oltin Itni izzat-ikrom bilan dafn qilishdi. Tillabek uni mehr bilan eslaydigan yig'ichi xotin yolladi. El ko'zi uchun.`],
        () => F().hound === 'spared' && ['envoy', `Bahodir lives. He asks about you. He doesn't know why. Neither do I.|Баходир жив. Спрашивает о вас. Сам не знает зачем. Я тоже.|Bahodir tirik. Siz haqingizda so'rab yuribdi. Nega — o'zi ham bilmaydi. Men ham.`],
        () => F().hound === 'shown' && ['envoy', `Bahodir has left the Ark. Tilla-bek takes it personally. Loyalty is expensive to plant.|Баходир ушёл из Арка. Тилла-бек принял это на свой счёт. Верность, знаете ли, дорого сажать.|Bahodir Arkdan ketdi. Tillabek bundan qattiq ranjidi. Sadoqatni ekish qimmatga tushadi-da.`],
        ['envoy', `Whoever holds the founders' tumars holds the city. Tilla-bek will pay three hundred tilla for a name and a place. Here are fifty, just for listening.|У кого тумары основателей, у того и город. Тилла-бек заплатит триста тилла за имя и место. А это пятьдесят — просто за то, что выслушали.|Asoschilar tumarlari kimda bo'lsa, shahar o'shaning qo'lida. Tillabek ism va joy uchun uch yuz tilla to'laydi. Mana ellik tilla — shunchaki tinglaganingiz uchun.`]
      ], () => hub(`The envoy's purse|Кошелёк посланника|Elchining hamyoni`, [
        { label: `— Who is Tilla-bek, exactly?|— А кто он вообще такой, этот Тилла-бек?|— Tillabek o'zi kim?`, lines: [
          ['envoy', `Akhror Tilla-bek, head of the House of the Humo and of the Divan. The Divan is the families who rule the Ark. Tilla-bek rules the Divan.|Ахрор Тилла-бек, глава Дома Хумо и Дивана. Диван — это семьи, которые правят Арком. А Диваном правит Тилла-бек.|Ahror Tillabek — Humo xonadoni va Devonning boshlig'i. Devon — Arkni boshqaradigan oilalar. Devonni esa Tillabek boshqaradi.`]
        ] },
        { label: `— What does he want the tumars for?|— Зачем ему тумары?|— Tumarlar unga nimaga kerak?`, lines: [
          ['envoy', `They hold the founders' song. With it the Sleeper can be kept on a chain, and memory sold along the whole Silk Road. Tilla-bek thinks big.|В них песня основателей. С ней Спящего можно держать на цепи, а памятью торговать по всему Шёлковому пути. Тилла-бек мыслит широко.|Ularda asoschilar qo'shig'i bor. U bilan Uxlovchini zanjirda tutib, butun Ipak yo'li bo'ylab xotira sotsa bo'ladi. Tillabek keng o'ylaydi.`]
        ] },
        { label: `— "A name and a place"?|— «Имя и место» — это как?|— «Ism va joy» deganingiz nima?`, lines: [
          ['envoy', `The name of whoever has the tumars, and where to find them. You'll get there before us. The song in you leads to them like a hound on a scent.|Имя того, у кого тумары, и где его искать. Вы доберётесь туда раньше нас. Песня приведёт вас к ним, как гончую по следу.|Tumarlar kimda ekani va uni qayerdan topish mumkinligi. Siz u yerga bizdan oldin yetasiz. Ichingizdagi qo'shiq sizni ularga iz olgan tazidek boshlab boradi.`],
          ['sado', `He wants you to hand over the thief. Whoever it is. Even if you end up liking them.|Он хочет, чтобы ты сдал ему вора. Кто бы это ни был. Даже если он тебе понравится.|U o'g'rini tutib berishingni istayapti. Kim bo'lsa ham. Hatto u senga yoqib qolsa ham.`]
        ] }
      ], [
        { label: `Take the fifty. Promise nothing.|Взять пятьдесят и ничего не обещать.|Ellik tillani olib, hech narsa va'da qilmaslik.`, id: 'take' },
        { label: `"You'll have the name when I have it."|«Как узнаю имя — оно ваше.»|«Ismni bilsam, sizga aytaman.»`, id: 'promise' },
        { label: `"Keep your money. Tell him no."|«Оставьте деньги себе. Передайте ему: нет.»|«Pulingiz o'zingizga buyursin. Unga ayting: yo'q.»`, id: 'no' }
      ], o => {
        if (o.id === 'take') { gold(50); rep('divan', 1, true); play([['envoy', `A pleasure. Tilla-bek likes a man who listens. In a city of singers, that's rarer than you'd think.|Приятно иметь с вами дело. Тилла-бек ценит тех, кто умеет слушать. В городе певцов это большая редкость.|Siz bilan ish qilish yoqimli. Tillabek tinglay oladigan odamni qadrlaydi. Xonandalar shahrida bunaqalar kam.`]], done); }
        else if (o.id === 'promise') {
          gold(50); rep('divan', 2); rep('remember', -1, true); trust(-1); f2('divanPromise', 1);
          play([
            ['envoy', `Then we're partners. Tilla-bek writes his partners down. In ink.|Значит, мы партнёры. Тилла-бек своих партнёров записывает. Чернилами.|Demak, sherikmiz. Tillabek sheriklarini yozib qo'yadi. Siyoh bilan.`],
            ['sado', `You don't even know who they are, and you've already sold them. For a promise.|Ты даже не знаешь, кто они, а уже продал. За обещание.|Ular kimligini ham bilmaysan, lekin sotib bo'lding. Bir va'da evaziga.`]
          ], done);
        } else { trust(1); rep('divan', -1, true); play([['envoy', `As you wish. Tilla-bek will be sorry. He so rarely is. It's good for him.|Как угодно. Тилла-бек огорчится. С ним это так редко случается — ему даже полезно.|Ixtiyoringiz. Tillabek xafa bo'ladi. U kamdan-kam xafa bo'ladi — unga foydali.`]], done); }
      })), [['envoy', `The offer stands, yodchi. Tilla-bek's offers are like his cellars. Deep.|Предложение в силе, ёдчи. Предложения у Тилла-бека как его подвалы — глубокие.|Taklif o'z kuchida, yodchi. Tillabekning takliflari yerto'lalaridek — chuqur.`]])
    }),
    Object.assign(nearStart(2), {
      look: 'rebel', prompt: `Talk to the masked girl|Поговорить с девочкой в маске|Niqobli qizcha bilan gaplashish`,
      talk: firstThen('a2:den:remember', done => play([
        ['child', `She Who Remembers says: turn back. The deep Karez is not for people with a song on them.|Та, что помнит, велела передать: поворачивай. Нижний кяриз не для тех, на ком песня.|Eslovchi opa aytdi: orqaga qayt. Pastki koriz ustida qo'shig'i bor odamlar uchun emas.`],
        () => F().gulnora === 'returned' && ['child', `And Gulnora says thank you. She's with us now. She said you'd want to know her wedding is hers again.|И ещё Гульнора говорит спасибо. Она теперь с нами. Сказала, тебе будет приятно знать: её свадьба снова её.|Gulnora opa ham rahmat dedi. U endi biz bilan. To'yi yana o'ziniki bo'lganini bilsang, xursand bo'lasan, dedi.`],
        ['child', `She told me to give you this, too. She said you'd know what to do with it.|А ещё она велела отдать тебе вот это. Сказала, ты сам поймёшь, что с этим делать.|Yana buni senga berib qo'y, dedi. Nima qilishni o'zing bilasan, dedi.`],
        ['', `A dried apricot, dark and leathery, in a twist of paper.|Урюк в бумажном кульке — тёмный, сморщенный.|Qog'ozga o'ralgan bitta turshak — qoramtir, burishgan.`],
        ['sado', `It's an apricot. Ravshan, it's a dried apricot! I can smell it from in here.|Это урюк. Равшан, это же урюк! Я его отсюда чую.|Bu o'rik! Ravshan, bu turshak-ku! Hidi shu yergacha kelyapti.`],
        ['hero', `You can't smell.|Ты не чуешь запахов.|Sen hid sezmaysan.`],
        ['sado', `Then I'm remembering the smell. Same thing.|Значит, я помню запах. Какая разница.|Unda hidini eslayapman. Farqi nima.`]
      ], () => hub(`The apricot|Урюк|Turshak`, [
        { label: `— Who is "She Who Remembers"?|— Кто это — «Та, что помнит»?|— «Eslovchi opa» kim?`, lines: [
          ['child', `Our eldest. She leads the Hollow out of the city and hides them down here. And she remembers for the ones who forgot.|Наша старшая. Она уводит Пустых из города и прячет здесь, внизу. И помнит за тех, кто забыл.|Bizning kattamiz. U Bo'shlarni shahardan olib chiqib, shu yerda, pastda yashiradi. Unutganlar o'rniga u eslaydi.`]
        ] },
        { label: `— And who are you people?|— А вы вообще кто такие?|— O'zi sizlar kimsizlar?`, lines: [
          ['child', `Those Who Remember. We take the Hollow before the Singers feed them to the Well. Up there they call us thieves. We don't argue.|Те, кто помнит. Мы забираем Пустых, пока Певцы не скормили их Колодцу. Наверху нас зовут ворами. Мы не спорим.|Eslaganlar. Xonandalar Bo'shlarni Quduqqa yedirib yubormasidan oldin olib ketamiz. Tepada bizni o'g'ri deyishadi. Biz tortishmaymiz.`]
        ] },
        { label: `— Why can't I go down?|— Почему мне нельзя вниз?|— Nega menga pastga tushish mumkin emas?`, lines: [
          ['child', `Shirin's song is on you. Wherever you go, it goes. She Who Remembers doesn't want Shirin learning the way.|На тебе песня Ширин. Куда ты, туда и она. А Та, что помнит, не хочет, чтобы Ширин узнала дорогу.|Ustingda Shirinning qo'shig'i bor. Qayerga borsang, u ham boradi. Eslovchi opa Shirin yo'lni bilib olishini istamaydi.`],
          ['sado', `…That's fair, actually. I wouldn't want Shirin following me around either.|…Вообще-то честно. Я бы тоже не хотела, чтобы за мной ходила Ширин.|…Aslida to'g'ri-da. Men ham Shirin ortimdan izg'ib yurishini istamasdim.`]
        ] }
      ], [
        { label: `Eat the apricot.|Съесть урюк.|Turshakni yeyish.`, id: 'eat' },
        { label: `Give it to the smugglers' boy.|Отдать мальчишке контрабандистов.|Kontrabandachilarning bolasiga berish.`, id: 'boy' },
        { label: `Send it back: "Tell her I'm coming anyway."|Вернуть: «Передай ей, что я всё равно иду».|Qaytarib berish: «Unga ayt, baribir boraman».`, id: 'back' }
      ], o => {
        if (o.id === 'eat') {
          trust(1);
          play([
            ['', `It tastes of summer on a flat roof. Sado is quiet for a long time.|На вкус — лето на плоской крыше. Садо долго молчит.|Ta'mi — tomdagi yoz. Sado uzoq jim qoladi.`],
            ['sado', `…Thank you. Next time, crack the stone. There's a kernel inside. Bitter and sweet at once.|…Спасибо. В следующий раз расколи косточку. Там ядрышко. Горькое и сладкое сразу.|…Rahmat. Keyingi safar danagini chaq. Ichida mag'zi bor. Ham achchiq, ham shirin.`]
          ], done);
        } else if (o.id === 'boy') {
          rep('tail', 1, true);
          play([['sado', `…Fine. He needed it more. I'm not sulking. I'm just thinking about apricots, that's all.|…Ну и ладно. Ему нужнее. Я не дуюсь. Я просто думаю про урюк. И всё.|…Mayli. Unga ko'proq kerak. Arazlaganim yo'q. Shunchaki o'rikni o'ylayapman, xolos.`]], done);
        } else {
          rep('remember', 1);
          play([['child', `She'll laugh. She doesn't laugh much. I'll tell her.|Она засмеётся. Она редко смеётся. Передам.|U kuladi. U kam kuladi. Aytib qo'yaman.`]], done);
        }
      })), [['child', `Turn back, she says. She says it like she knows you won't.|«Поворачивай», — говорит она. А говорит так, будто знает, что не повернёшь.|«Orqaga qayt», deydi u. Qaytmasligingni bilgandek aytadi.`]])
    })
  ]
});

BARKS['r_den:start'] = [
  `Three messengers, and each one wants something. Everybody down here wants something from you, Ravshan. It's almost flattering.|Три посланника, и каждому что-то надо. Тут все от тебя чего-то хотят, Равшан. Даже лестно.|Uchta elchi, har biriga nimadir kerak. Bu yerda hamma sendan nimadir istaydi, Ravshan. Kishi g'ururlanib ketadi.`
];

/* ---------- Sado's lullaby at a rest ---------- */
function lullaby(done, verse, after) {
  if ((R().trust || 0) < 2) {
    play([['sado', pick([
      `I wanted to sing for you. I can't tonight. It won't come out. I'm not punishing you, honestly. It just won't come.|Я хотела тебе спеть. Сегодня не могу. Не выходит. Я тебя не наказываю, правда. Просто не выходит.|Senga kuylab bermoqchi edim. Bugun bo'lmayapti. Chiqmayapti. Seni jazolayotganim yo'q, rostdan. Shunchaki chiqmayapti.`,
      `There's a song in me somewhere. It doesn't trust you yet. Neither do I, quite.|Где-то во мне есть песня. Она тебе пока не доверяет. Да и я, честно говоря, не очень.|Ichimda qayerdadir qo'shiq bor. U senga hali ishonmaydi. Rostini aytsam, men ham unchalik emas.`
    ])]], done);
    return;
  }
  play([
    ['sado', `Close your eyes. I'll keep the light on. I promise I'll keep it on.|Закрой глаза. Я не погашу свет. Честно-честно, не погашу.|Ko'zingni yum. Nurni o'chirmayman. Va'da beraman, o'chirmayman.`],
    ['sado', verse],
    () => thin() && ['', `Her voice keeps breaking, like a string about to snap. She sings anyway.|Голос у неё то и дело срывается, как струна, которая вот-вот лопнет. Она всё равно поёт.|Ovozi uzilay deb turgan tordek tez-tez uzilib qoladi. Baribir kuylayveradi.`],
    ['', after]
  ], () => { addVoid(-4, `Sado's lullaby|колыбельная Садо|Sadoning allasi`); done(); });
}

/* =====================================================================
   14 · a2_karez — The Karez (dark)
   ===================================================================== */
LAND('a2_karez', {
  name: `The Karez|Кяриз|Koriz`,
  sub: `Tunnels in the Sleeper's body. No light but hers|Ходы в теле Спящего. Свет — только её|Uxlovchining tanasidagi yo'laklar. Uning nuridan boshqa yorug'lik yo'q`,
  start: [
    ['', `Past the last lamp the dark is total. Somewhere under your feet water runs, warm, like breath through teeth.|За последней лампой — кромешная тьма. Где-то под ногами бежит вода, тёплая, как дыхание сквозь зубы.|So'nggi chiroqdan keyin zim-ziyo. Oyog'ing tagida qayerdadir suv oqyapti — tish orasidan chiqqan nafasdek iliq.`],
    ['sado', `Ravshan. Ravshan, it's dark.|Равшан. Равшан, тут темно.|Ravshan. Ravshan, qorong'i-ku.`],
    ['hero', `You're the light. Look.|Свет — это ты. Смотри.|Nur — o'zingsan. Qara.`],
    ['', `The little wisp at your shoulder brightens. Walls of wet clay come out of the black: finger marks, old ones, thousands of them.|Огонёк у твоего плеча разгорается. Из черноты выступают стены из мокрой глины, и на них следы пальцев — старые, тысячи.|Yelkang yonidagi kichkina nur yorishadi. Qorong'ilikdan ho'l loy devorlar chiqib keladi. Ularda barmoq izlari — eski, minglab.`],
    ['sado', `Oh. I am, aren't I. …Don't walk faster than my light. If you do, I'll be left back here alone.|Ой. И правда я. …Только не иди быстрее моего света. А то я тут одна останусь.|Voy. Rostdan ham men ekanman. …Faqat nurimdan tez yurma. Bo'lmasa shu yerda yolg'iz qolib ketaman.`],
    ['sado', `I was afraid of the dark when I was little.|Я в детстве боялась темноты.|Kichkinaligimda qorong'idan qo'rqardim.`],
    ['hero', `When were you little?|А когда ты была маленькой?|Qachon kichkina bo'lgansan?`],
    ['sado', `…I don't know.|…Не знаю.|…Bilmayman.`],
    ['', `The water keeps breathing. For a while neither of you says anything.|Вода всё дышит. Какое-то время вы оба молчите.|Suv nafas olishda davom etadi. Bir muddat ikkalangiz ham jim.`]
  ],
  stones: [
    `Carved by a bakhshi: "We dig toward his heart, not his water. The water comes by itself when he is listening."|Вырезано бахши: «Мы роем к его сердцу, а не к воде. Вода придёт сама, когда он слушает».|Baxshi o'yib yozgan: «Biz suviga emas, yuragiga qarab qaziymiz. U tinglab tursa, suv o'zi keladi».`,
    `A child's drawing in the clay: a horse, a sun, a giant lying down and smiling. Underneath: "He likes the one about the foal."|Детский рисунок на глине: лошадка, солнце и великан — лежит и улыбается. Подпись: «Ему нравится сказка про жеребёнка».|Loyga bolalarcha chizilgan: ot, quyosh va jilmayib yotgan dev. Tagida: «Unga toychoq haqidagi ertak yoqadi».`,
    `Scratched in haste, the Year of Sand: "The tales stopped. The caravan-bashi brought him captives instead. The water was sweet for a year. Then it ran red."|Нацарапано наспех, Год Песка: «Сказок больше нет. Вместо них караван-баши водят к нему пленников. Год вода была сладкой. Потом потекла красная».|Shoshib tirnalgan, Qum yili: «Ertaklar to'xtadi. O'rniga karvonboshilar unga asirlarni olib kela boshladi. Bir yil suv shirin bo'ldi. Keyin qizil oqdi».`,
    `"Whoever goes down without light doesn't come back. Carry a lamp. Carry a voice. The dark here listens for the one who is alone."|«Кто спустится без света, тот не вернётся. Неси лампу. Неси голос. Здешняя тьма караулит тех, кто один».|«Kim nursiz tushsa, qaytmaydi. Chiroq olib yur. Ovoz olib yur. Bu yerning qorong'isi yolg'iz kelganni poylaydi».`
  ],
  memory: {
    id: 'm2_dark',
    lines: [
      ['memory', `Night. One blanket over two heads. A small hand grips your sleeve so hard the seam tears.|Ночь. Одно одеяло на две головы. Маленькая рука вцепилась тебе в рукав так, что трещит шов.|Tun. Ikki bosh ustida bitta ko'rpa. Kichkina qo'l yengingga shunday yopishganki, choki so'kilib ketyapti.`],
      ['memory', `"Tell the one about the foal." So you do. A foal walks into the dark — and it turns out to be only the inside of his mother's coat.|«Расскажи про жеребёнка». И ты рассказываешь. Жеребёнок шагнул в темноту, а темнота оказалась изнанкой маминого халата.|«Toychoq haqidagisini aytib ber». Aytasan. Toychoq qorong'iga kiradi — qarasa, bu onasining to'nining ichi ekan.`],
      ['memory', `The hand lets go. Whoever it was is asleep. You can't see the face. Only a warm spot on your sleeve where the hand was.|Рука разжимается. Кто бы это ни был, он уснул. Лица не видно. Только тёплое пятно на рукаве, где лежала рука.|Qo'l bo'shashadi. Kim bo'lsa ham, uxlab qoldi. Yuzi ko'rinmaydi. Faqat yengingda, qo'l turgan joyda iliq iz qoldi.`]
    ],
    after: () => sub2(`…The inside of his mother's coat. That's a good ending. I think I knew that ending.|…Изнанка маминого халата. Хороший конец. Кажется, я его знала.|…Onasining to'nining ichi. Yaxshi yakun. Bu yakunni bilganga o'xshayman.`)
  },
  people: [{ look: 'hollow' }, { look: 'rebel', x: 16 }, { look: 'rebel', x: 30 }, { look: MASKED, x: 46, lamp: true }],
  peopleAfter: group => { if (F().gulnora === 'returned' && group[2]) group[2].look = 'gulnora'; },
  exit: done => {
    const f = F();
    f2('masked', 1);
    play([
      ['', `Hooded figures block the tunnel. White masks, no faces. Behind them stand the Hollow they lead, holding hands like children crossing a street.|Тоннель перегораживают люди в капюшонах. Белые маски вместо лиц. За ними — Пустые, которых они ведут: держатся за руки, как дети, когда переходят улицу.|Yo'lakni qalpoqli odamlar to'sib turibdi. Yuz o'rnida oq niqoblar. Ortlarida ular boshlab yurgan Bo'shlar — ko'cha kesib o'tayotgan bolalardek qo'l ushlashib olgan.`],
      ['masked', `Yodchi. You're a long way from your tithe-route.|Ёдчи. Далеко же ты забрёл от своего маршрута.|Yodchi. Ushr yo'lingdan ancha olislab ketibsan.`],
      ['hero', `It's the song's route. Not mine.|Это маршрут песни. Не мой.|Bu qo'shiqning yo'li. Meniki emas.`],
      ['masked', `Then tell the song to turn back. You can't go any further. What's down there isn't for Shirin. And it isn't for you.|Тогда передай песне: пусть поворачивает. Дальше тебе нельзя. То, что внизу, — не для Ширин. И не для тебя.|Unda qo'shig'ingga ayt: orqaga qaytsin. Bundan nariga o'tolmaysan. Pastdagi narsa Shirin uchun emas. Sen uchun ham emas.`],
      ['sado', `There's a light under her collar. A tumar, sewn under the skin. It's warm. I can feel it from here, like a stove through a wall.|У неё под воротом свет. Тумар, зашитый под кожу. Тёплый. Я чувствую его даже отсюда — как печку через стену.|Uning yoqasi ostida nur bor. Teri ostiga tikilgan tumar. Iliq. Devor ortidagi tandirdek, shu yerdan ham sezib turibman.`],
      () => f.gulnora === 'returned' && ['gulnora', `Let him through. He gave me back my wedding.|Пропусти его. Он вернул мне мою свадьбу.|Uni o'tkazib yuboring. U menga to'yimni qaytarib bergan.`],
      () => f.gulnora === 'returned' && ['masked', `Nobody goes through, Gulnora. That's the kindness.|Никто не пройдёт, Гульнора. В этом и доброта.|Hech kim o'tmaydi, Gulnora. Mehribonlik ham shunda.`],
      () => f.chain === 'carried' && ['masked', `You carried the Well's chain up to the Tail. That was well done. Don't spoil it by finishing Shirin's work down here.|Ты отнёс цепь Колодца в Хвост. Хорошее было дело. Не порти его, доделывая здесь работу Ширин.|Quduq zanjirini Dumga olib chiqding. Yaxshi ish qilding. Endi bu yerda Shirinning ishini bitirib, uni buzib qo'yma.`],
      () => hollowEyes() && ['masked', `…You're more than half gone. I know that look. I wore it for twenty years. Go back up, yodchi, while there's still something of you to carry.|…Ты уже больше чем наполовину пуст. Я знаю этот взгляд. Сама с ним двадцать лет ходила. Поднимайся, ёдчи, пока ещё есть что уносить.|…Yarmingdan ko'pi ketib bo'libdi. Bu nigohni bilaman. O'zim yigirma yil shunday yurganman. Tepaga chiq, yodchi, olib chiqadigan narsang borida.`],
      ['sado', `She won't fight unless you make her. Talk to her. Please, not the hook.|Она не станет драться, если ты сам не начнёшь. Поговори с ней. Только не крюк, пожалуйста.|O'zing boshlamasang, u urushmaydi. U bilan gaplash. Faqat ilmoqni ko'tarma, iltimos.`]
    ], () => hub(`The masked woman|Женщина в маске|Niqobli ayol`, [
      { label: `— Who are you?|— Ты кто такая?|— Sen kimsan?`, lines: [
        ['masked', `My people call me She Who Remembers. I had another name once. Down here nobody needs it.|Мои люди зовут меня Та, что помнит. Когда-то у меня было другое имя. Здесь оно никому не нужно.|Odamlarim meni Eslovchi deyishadi. Bir paytlar boshqa ismim bor edi. Bu yerda u hech kimga kerak emas.`]
      ] },
      { label: `— Who are the people behind you?|— А кто это у тебя за спиной?|— Ortingdagilar kim?`, lines: [
        ['masked', `Hollow. Sold for debts, then sung down to nothing. The Singers feed people like them to the Well. I take them first.|Пустые. Их продали за долги, а потом выпели до дна. Таких Певцы скармливают Колодцу. Я забираю их раньше.|Bo'shlar. Qarz uchun sotilgan, keyin tagigacha kuylab bo'shatilgan. Xonandalar bunaqalarni Quduqqa yediradi. Men ulardan oldin olib ketaman.`]
      ] },
      { label: `— What's down there?|— Что там, внизу?|— Pastda nima bor?`, lines: [
        ['masked', `Old Yodgor. The city that stood here before this one. And the thing I came for. Shirin wants it. So do you, because she told you to.|Старый Ёдгор. Город, который стоял тут до нынешнего. И то, за чем я пришла. Ширин этого хочет. И ты хочешь — потому что она велела.|Eski Yodgor. Hozirgisidan oldin shu yerda turgan shahar. Va men izlab kelgan narsa. Shirin uni istaydi. Sen ham istaysan — chunki u buyurgan.`]
      ] },
      { label: `— Do you have Shirin's relics?|— Реликвии Ширин у тебя?|— Shirinning tumarlari sendami?`, lines: [
        ['masked', `If I did, would I tell a man Shirin keeps on a leash?|Даже если у меня — стала бы я говорить человеку, которого Ширин держит на поводке?|Menda bo'lsa ham, Shirin arqonda yetaklab yurgan odamga aytarmidim?`],
        ['sado', `That's a yes. That's a yes, isn't it?|Это значит «да». Это ведь «да», правда?|Demak, «ha». Bu «ha» degani-ku, a?`]
      ] }
    ], [
      { label: `"I can't turn back. Let me through."|«Я не могу повернуть. Пропусти.»|«Ortga qayta olmayman. O'tkazib yubor.»`, id: 'honest' },
      { label: `Raise the yodchi's hook.|Поднять крюк ёдчи.|Yodchi ilmog'ini ko'tarish.`, id: 'threat' },
      { label: `Pass your water and tilla down the line of her Hollow.|Пустить по ряду её Пустых свою воду и тиллу.|Uning Bo'shlariga suvingni va tillangni ulashish.`, price: 40, id: 'give' },
      { label: `"Take off the mask. Who are you hiding from?"|«Сними маску. От кого ты прячешься?»|«Niqobingni yech. Kimdan yashirinyapsan?»`, id: 'face', lock: lock50() }
    ], o => {
      f2('maskedAns', o.id);
      const lines = {
        honest: [
          ['masked', `Honest. That's rare in a yodchi.|Честно. Редкость для ёдчи.|Rostini aytding. Yodchida bu kam uchraydi.`],
          ['masked', `Go on, then. The dark will turn you back for me.|Тогда иди. Тьма развернёт тебя и без меня.|Unda boraver. Qorong'ilik seni mensiz ham ortga qaytaradi.`]
        ],
        threat: [
          ['masked', `The Well itself has threatened me every Night of Payment since I was eight. You're a very small hook.|Меня с восьми лет каждую Ночь Уплаты пугал сам Колодец. А ты — очень маленький крючок.|Sakkiz yoshimdan beri har To'lov kechasi meni Quduqning o'zi qo'rqitgan. Sen esa juda kichkina ilmoqsan.`],
          ['masked', `Want to know where I'm going? Under the blue domes, where the old city lies buried. Bring your hook. See what it's worth down there.|Хочешь знать, куда я иду? Под синие купола, где лежит погребённый город. Приходи со своим крюком. Посмотрим, чего он там стоит.|Qayerga ketayotganimni bilmoqchimisan? Ko'k gumbazlar tagiga, ko'milgan eski shaharga. Ilmog'ing bilan kel. U yerda nimaga arzishini ko'ramiz.`],
          ['sado', `Don't. Don't ever do that again. Not to her.|Не надо. Никогда больше так не делай. Только не с ней.|Qo'y. Boshqa hech qachon bunday qilma. Ayniqsa unga.`],
          ['hero', `You don't know her.|Ты её даже не знаешь.|Sen uni tanimaysan ham.`],
          ['sado', `…No. I don't. Don't do it anyway.|…Не знаю. Всё равно не делай.|…Tanimayman. Baribir qilma.`]
        ],
        give: [
          ['', `You pass your waterskin down the line of Hollow, then the coins. They drink in turns, carefully, the way they must once have shared bread.|Ты пускаешь бурдюк по ряду Пустых, следом монеты. Они пьют по очереди, бережно — наверное, так же когда-то делили хлеб.|Meshingni Bo'shlar qatoriga uzatasan, ortidan tangalarni. Ular navbat bilan, avaylab ichishadi — bir paytlar nonni ham shunday bo'lishgan bo'lsa kerak.`],
          ['masked', `…They'll remember that. Not your face. The water.|…Они это запомнят. Не лицо. Воду.|…Ular buni eslab qoladi. Yuzingni emas. Suvni.`]
        ],
        face: [
          ['masked', `So the Singers can't see what twenty Nights of Payment did to it.|Чтобы Певцы не видели, что с ним сделали двадцать Ночей Уплаты.|Xonandalar yigirma To'lov kechasi unga nima qilganini ko'rmasin deb.`],
          ['masked', `And because someone who once knew it might see it. And I'm not ready.|И потому что его может увидеть тот, кто когда-то его знал. А я ещё не готова.|Yana bir paytlar uni tanigan odam ko'rib qolishi mumkin. Men esa hali tayyor emasman.`]
        ]
      }[o.id];
      if (o.id === 'honest') { trust(1); rep('remember', 1, true); }
      if (o.id === 'threat') { trust(-1); rep('remember', -1); }
      if (o.id === 'give') { trust(1); rep('remember', 2); rep('tail', 1, true); }
      if (o.id === 'face') rep('remember', 1, true);
      play(lines.concat([
        ['', `She turns away. As her people file into the dark, she hums under her breath. Four notes, falling. Then four more.|Она отворачивается. Пока люди в масках уходят в темноту, она напевает себе под нос. Четыре ноты вниз. Потом ещё четыре.|U o'girilib ketadi. Niqoblilar qorong'iga kirib borarkan, u ohista xirgoyi qiladi. To'rt nota pastlab tushadi. Keyin yana to'rttasi.`],
        ['sado', `…That's Alla. That's my lullaby. The one I taught you for the children.|…Это «Алла». Моя колыбельная. Та, которой я научила тебя для детей.|…Bu «Alla»-ku. Mening allam. Bolalar uchun senga o'rgatganim.`],
        ['hero', `Everyone knows Alla. Every mother in the Tail sings it.|«Аллу» все знают. Её поёт каждая мать в Хвосте.|«Alla»ni hamma biladi. Dumdagi har bir ona aytadi.`],
        ['sado', `Not like that. She sings the third line wrong. And I sing it wrong exactly the same way.|Не так. Она неправильно поёт третью строчку. И я пою её неправильно. Точно так же.|Bunaqa emas. U uchinchi qatorini noto'g'ri aytadi. Men ham noto'g'ri aytaman. Xuddi shunday.`],
        ['sado', `Why do I sing it wrong, Ravshan?|Почему я пою её неправильно, Равшан?|Nega men uni noto'g'ri aytaman, Ravshan?`]
      ]), done);
    }));
  }
});
BARKS['a2_karez:start'] = [
  `Stay close. The dark here is heavy. It leans on me.|Держись ближе. Тьма тут тяжёлая. Давит на меня.|Yaqinroq yur. Bu yerning qorong'isi og'ir. Menga bosib turibdi.`,
  `Those finger marks… people dug this with their hands. Singing, I think. You can feel the rhythm in them.|Эти следы пальцев… Люди рыли это руками. И пели, по-моему. В них слышен ритм.|Bu barmoq izlari… Odamlar buni qo'l bilan qazishgan. Kuylab qazishgan, shekilli. Ularda marom bor.`
];
BARKS['a2_karez:mid'] = [
  `Something's breathing, and it isn't the water. On the left. No. Everywhere.|Что-то дышит, и это не вода. Слева. Нет. Отовсюду.|Nimadir nafas olyapti, bu suv emas. Chapda. Yo'q. Hamma yoqda.`,
  `If my light goes out, say something. Anything. Count, if you like. You're good at counting.|Если мой свет погаснет — говори что-нибудь. Что угодно. Хоть считай. Считать ты умеешь.|Nurim o'chib qolsa, gapirib tur. Nima bo'lsa ham. Sanab tursang ham bo'ladi. Sanashni bilasan-ku.`
];

/* =====================================================================
   15 · a2_streets — The Swallowed Streets
   ===================================================================== */
LAND('a2_streets', {
  name: `The Swallowed Streets|Проглоченные улицы|Yutilgan ko'chalar`,
  sub: `Half of the Tail, slid into the sand twenty years ago|Половина Хвоста, что двадцать лет назад ушла в песок|Yigirma yil oldin qumga sirg'alib ketgan Dumning yarmi`,
  start: [
    ['', `The tunnel opens onto a street. A real one, with roofs and doorways, lying on its side and packed with sand like a mouth full of bread.|Тоннель выходит на улицу. Настоящую, с крышами и дверями. Она лежит на боку и забита песком, как рот хлебом.|Yo'lak ko'chaga chiqadi. Haqiqiy ko'chaga — tomlari, eshiklari bilan. U yonboshlab yotibdi, og'izga tiqilgan nondek qum bilan to'lib ketgan.`],
    ['sado', `This is the Tail. The part that fell twenty years ago, in the Small Awakening. The same year as the blue gate.|Это Хвост. Та часть, что провалилась двадцать лет назад, в Малое Пробуждение. В тот же год, что и синие ворота.|Bu Dum. Yigirma yil oldin, Kichik Uyg'onishda qulab tushgan qismi. Ko'k darvoza qulagan yili.`],
    () => F().alp === 'helped' && ['sado', `The house you dug out with Alp was one of the lucky ones. Nobody dug these out.|Дому, который вы откопали с Алпом, ещё повезло. Эти никто не откапывал.|Alp bilan qazib olgan uyingizning omadi bor ekan. Bularni hech kim qazimagan.`],
    ['', `Hollow from above stand in the doorways. They came down for the tumars in the walls: memories of the drowned, still sealed in wax.|В дверях стоят Пустые, спустившиеся сверху. Их приманили тумары в стенах — память утонувших, до сих пор запечатанная в воск.|Eshiklarda tepadan tushgan Bo'shlar turibdi. Ularni devorlardagi tumarlar tortib kelgan: cho'kkanlarning hali ham mumga muhrlangan xotirasi.`]
  ],
  mid: [
    ['sado', `Left at the bakery. There's a… there was a bakery here. With a blue… never mind. Left.|Налево у пекарни. Тут есть… тут была пекарня. С синей… неважно. Налево.|Novvoyxonadan chapga. Bu yerda… bu yerda novvoyxona bor edi. Ko'k… mayli. Chapga.`],
    ['hero', `How do you know that?|Откуда ты знаешь?|Qayerdan bilasan?`],
    ['sado', `I don't. My feet do. I haven't got feet. Left, Ravshan.|Я не знаю. Ноги знают. У меня нет ног. Налево, Равшан.|Bilmayman. Oyoqlarim biladi. Menda oyoq yo'q-ku. Chapga, Ravshan.`]
  ],
  stones: [
    `"The Small Awakening: he turned over like a man with a stone under his back. Half the Tail went with him. The Singers called it mercy: fewer mouths."|«Малое Пробуждение: он перевернулся, как человек, которому под спину попал камень. Половина Хвоста ушла вместе с ним. Певцы назвали это милостью: ртов меньше».|«Kichik Uyg'onish: u beli tagiga tosh tushgan odamdek ag'darildi. Dumning yarmi u bilan ketdi. Xonandalar buni rahm deb atashdi: og'iz kamaydi».`,
    `A doorpost notched with children's heights, year by year. All the marks stop at once, twenty years ago. Nine children.|Дверной косяк с зарубками детского роста, год за годом. Все зарубки обрываются разом — двадцать лет назад. Девять детей.|Eshik kesakisida bolalarning bo'yi yilma-yil chizib borilgan. Hamma chiziqlar birdaniga to'xtagan — yigirma yil oldin. To'qqiz bola.`,
    `"The first bakhshi didn't sing to him for water. They sang because he asked. A spirit gets lonely. The water was his thanks."|«Первые бахши пели ему не ради воды. Они пели, потому что он просил. Духу тоже бывает одиноко. А вода была его благодарностью».|«Ilk baxshilar unga suv uchun kuylamagan. U so'ragani uchun kuylashgan. Ruh ham yolg'izlanadi. Suv esa uning minnatdorligi edi».`,
    `A page from a Divan ledger, nailed to a beam: "Lot 14. Tail. Six adults, two children. Extraction complete. Captain: A." The ink is still bright.|К балке прибит лист из книги Дивана: «Лот 14. Хвост. Шестеро взрослых, двое детей. Извлечение завершено. Капитан: А.» Чернила ещё яркие.|To'singa Devon daftaridan bir varaq mixlangan: «14-lot. Dum. Olti katta, ikki bola. Chiqarib olindi. Kapitan: A.» Siyohi hali ham yorqin.`
  ],
  memory: {
    id: 'm2_apricot',
    lines: [
      ['memory', `A clay wall, hot from the sun. The neighbour's apricot tree leans over it, heavy and gold.|Глиняная стена, горячая от солнца. Над ней свешивается соседский абрикос — тяжёлый, золотой.|Quyoshda qizigan paxsa devor. Uning ustidan qo'shnining o'rigi egilib turibdi — og'ir, tillarang.`],
      ['memory', `Someone small on your shoulders, heels in your chest. "Higher. The sunny side. Those are the sweet ones."|Кто-то маленький сидит у тебя на плечах, упираясь пятками в грудь. «Выше. С солнечной стороны. Там сладкие».|Yelkangda kimdir kichkina o'tiribdi, tovonlarini ko'ksingga tirab. «Balandroq. Kungay tomondagisini. O'shalari shirin».`],
      ['memory', `The neighbour shouts. You run. Behind the woodpile she gives you the ripest one and keeps the stone to crack later. You never see her face. Only her hands, sticky and gold.|Сосед кричит. Вы удираете. За поленницей она отдаёт тебе самый спелый, а косточку оставляет себе — расколоть потом. Лица не видно. Только руки, липкие и золотые.|Qo'shni baqiradi. Qochasizlar. O'tin uyumi ortida u eng pishganini senga beradi, danagini keyin chaqish uchun o'zida qoldiradi. Yuzi ko'rinmaydi. Faqat qo'llari — yopishqoq, tillarang.`]
    ],
    after: () => sub2(`You crack the stone and eat the kernel. Bitter and sweet at once. …Everybody knows that. Don't they?|Колешь косточку и ешь ядрышко. Горько и сладко сразу. …Это же все знают. Правда?|Danakni chaqib, mag'zini yeysan. Ham achchiq, ham shirin. …Buni hamma biladi-ku. To'g'rimi?`)
  },
  people: [{ look: 'guard', face: -1 }, { look: 'alp', x: 22 }],
  exit: done => {
    const f = F();
    const greet = {
      helped: `Yodchi. You dug with me once. Help me dig again. These… smell like me. These ones. They smell like me.|Ёдчи. Ты однажды копал со мной. Помоги ещё раз. Вот эти… пахнут мной. Вот эти. Они пахнут мной.|Yodchi. Bir marta men bilan qazigansan. Yana yordam ber. Mana bulardan… mening hidim keladi. Mana shulardan. Mening hidim.`,
      paid: `Yodchi. Your tilla fed the children for a month. I came down for these. They smell like me.|Ёдчи. На твою тиллу дети ели целый месяц. А я спустился за этими. Они пахнут мной.|Yodchi. Tillang bolalarni bir oy boqdi. Men bular uchun tushdim. Ulardan mening hidim keladi.`,
      collected: `You. The one who took the debt while we were digging. …Doesn't matter. I can't hate. I don't remember how. These smell like me.|Ты. Тот, кто взыскал долг, пока мы копали. …Неважно. Ненавидеть я не умею. Не помню как. Вот эти пахнут мной.|Sen. Biz qaziyotganimizda qarz undirgan odam. …Farqi yo'q. Nafratlanishni bilmayman. Qanday qilinishini eslamayman. Bulardan mening hidim keladi.`
    }[f.alp] || `Yodchi. I followed the smell all the way down. These smell like me.|Ёдчи. Я шёл на запах до самого низа. Вот эти пахнут мной.|Yodchi. Hidga ergashib shu yergacha tushdim. Bulardan mening hidim keladi.`;
    play([
      ['', `Behind a door sealed with a Humo feather: a hidden store. Crates of tumars tied with red thread. And Alp on his knees, breaking the crates open with his bare hands.|За дверью с печатью в виде пера Хумо — тайник. Ящики с тумарами, перевязанными красной нитью. И Алп на коленях: ломает ящики голыми руками.|Humo pati muhri bosilgan eshik ortida yashirin ombor. Qizil ip bilan bog'langan tumar qutilari. Alp esa tiz cho'kib, qutilarni yalang qo'li bilan sindiryapti.`],
      ['alp', greet],
      ['sado', `He's right. Seven tumars marked with an "A". The Divan kept them like receipts.|Он прав. Семь тумаров с буквой «А». Диван хранил их, как расписки.|U haq. «A» harfi bilan belgilangan yettita tumar. Devon ularni tilxatdek saqlagan.`],
      ['', `Each label, in a Divan clerk's hand: "Captain Alp. Service to the House of the Humo." Under them, a ledger: lot after lot from the Tail, each signed with the same "A".|На каждом ярлыке писарским почерком Дивана: «Капитан Алп. Служба Дому Хумо». Под ними книга: лот за лотом из Хвоста, и под каждым та же «А».|Har bir yorliqda Devon mirzasining xati: «Kapitan Alp. Humo xonadoniga xizmat». Tagida daftar: Dumdan lot ketidan lot, har birining tagida o'sha «A».`],
      ['sado', `Lot fourteen, on the beam outside. "Captain: A." It's him. He sold those people. He sold the Tail.|Лот четырнадцать, на балке снаружи. «Капитан: А». Это он. Он продавал этих людей. Он продавал Хвост.|Tashqaridagi to'sinda — o'n to'rtinchi lot. «Kapitan: A». Bu u. U o'sha odamlarni sotgan. U Dumni sotgan.`],
      ['alp', `What does it say? I can't read. I never could. Or I could… and I forgot.|Что там написано? Я не умею читать. Никогда не умел. Или умел… и забыл.|Nima deb yozilgan? Men o'qishni bilmayman. Hech qachon bilmaganman. Yoki bilganman… unutganman.`],
      () => hollowEyes() && ['alp', `…You smell like me too, yodchi. Like a house with the door left open.|…Ты тоже пахнешь, как я, ёдчи. Как дом с распахнутой дверью.|…Sendan ham mening hidim keladi, yodchi. Eshigi lang ochiq qolgan uydek.`],
      ['sado', `These are his own memories, Ravshan. Give them back and he'll remember who he was. Burn them and he stays the kind giant who feeds orphans.|Это его собственная память, Равшан. Вернёшь — он вспомнит, кем был. Сожжёшь — так и останется добрым великаном, который кормит сирот.|Bular uning o'z xotiralari, Ravshan. Qaytarsang — kim bo'lganini eslaydi. Yoqsang — yetimlarni boqadigan mehribon dev bo'lib qolaveradi.`],
      ['sado', `But then you're deciding for him. Or tell him the truth and let him decide himself. That's the heaviest thing you could give him.|Только тогда решаешь за него ты. Или скажи ему правду — и пусть решает сам. Тяжелее ноши ему не придумать.|Faqat unda uning o'rniga sen hal qilasan. Yoki haqiqatni ayt — o'zi hal qilsin. Unga bundan og'ir yuk yo'q.`]
    ], () => hub(`Alp's tumars|Тумары Алпа|Alpning tumarlari`, [
      { label: `— Alp, what do you remember?|— Алп, что ты помнишь?|— Alp, nimani eslaysan?`, lines: [
        ['alp', `Sand. The children. How to hold up a beam. Nothing else. As if I wasn't there before.|Песок. Детей. Как держать балку. Больше ничего. Будто раньше меня не было.|Qum. Bolalar. To'sinni qanday tutib turish. Boshqa hech narsa. Go'yo undan oldin men bo'lmaganman.`]
      ] },
      { label: `— What's in the ledger?|— Что в этой книге?|— Daftarda nima yozilgan?`, lines: [
        ['sado', `Families from the Tail, sold for "extraction". Their memories were pumped out and sold in the Ark. Every lot signed "A". Years of it.|Семьи из Хвоста, проданные «на извлечение». Из них выкачивали память и продавали в Арке. Под каждым лотом — «А». И так годами.|«Chiqarib olish»ga sotilgan Dum oilalari. Ularning xotirasini so'rib olib, Arkda sotishgan. Har bir lot tagida — «A». Yillar davomida.`]
      ] },
      { label: `— Why would the Divan keep these?|— Зачем Диван это хранил?|— Devon bularni nega saqlagan?`, lines: [
        ['sado', `As a hold over him, I think. If the captain ever remembered too much, the Divan could remind him exactly who he is.|Чтобы держать его на крючке, по-моему. Если капитан вдруг вспомнит лишнее, Диван ему напомнит, кто он такой.|Uni qo'lda tutib turish uchun, shekilli. Kapitan ortiqcha narsani eslab qolsa, Devon unga kimligini eslatib qo'yadi.`]
      ] }
    ], [
      { label: `Put the tumars in his hands.|Вложить тумары ему в руки.|Tumarlarni uning qo'liga berish.`, id: 'returned' },
      { label: `Burn them yourself. Let him stay the man the orphans know.|Сжечь их самому. Пусть останется тем, кого знают сироты.|Ularni o'zing yoqib yuborish. Yetimlar taniydigan odamligicha qolsin.`, cost: 3, id: 'destroyed' },
      { label: `"You were Tilla-bek's captain." Tell him all of it, and let him choose.|«Ты был капитаном у Тилла-бека». Рассказать всё — и пусть выбирает сам.|«Sen Tillabekning kapitani bo'lgansan». Hammasini aytib, tanlovni unga qoldirish.`, id: 'choice' }
    ], o => {
      f2('alpTumars', o.id);
      const end = [['', `There's Divan tilla in the cache too, wrapped in a ledger page. You take it. Nobody else down here can spend it.|В тайнике есть и тилла Дивана, завёрнутая в лист из книги. Ты берёшь её. Тут её всё равно больше некому тратить.|Omborda daftar varag'iga o'ralgan Devon tillasi ham bor. Uni olasan. Bu yerda baribir uni sarflaydigan boshqa odam yo'q.`, () => gold(40)]];
      if (o.id === 'returned') {
        trust(1); rep('divan', -1, true);
        play([
          ['', `You put the tumars in his hands. He presses them to his chest, and the song in them sinks into him like water into sand.|Ты вкладываешь тумары ему в руки. Он прижимает их к груди, и песня из них уходит в него, как вода в песок.|Tumarlarni uning qo'liga tutqazasan. U ularni ko'ksiga bosadi va ulardagi qo'shiq qumga singgan suvdek unga singib ketadi.`],
          ['alp', `…Lot fourteen. The potter's family. He laughed like a donkey braying. I sold his laugh to a man in the Ark. That man never laughed.|…Лот четырнадцать. Семья гончара. Он хохотал, как осёл ревёт. Я продал его смех одному человеку в Арке. Тот никогда не смеялся.|…O'n to'rtinchi lot. Kulolning oilasi. U eshakdek hangrab kulardi. Kulgisini Arkdagi bir odamga sotdim. U hech qachon kulmasdi.`],
          ['alp', `The children I feed. Their fathers. I sold their fathers. Put the coins in my boot. The boot was warm.|Дети, которых я кормлю. Их отцы. Я продал их отцов. Монеты сложил в сапог. Сапог был тёплый.|Men boqayotgan bolalar. Otalari. Ularning otalarini men sotganman. Tangalarni etigimga solardim. Etik iliq edi.`],
          ['alp', `I know my name now. I'd give it back if I could. I'm going up. Tilla-bek remembers me too. He'll want to see me. Not as much as I want to see him.|Теперь я знаю своё имя. Отдал бы обратно, если б мог. Иду наверх. Тилла-бек тоже меня помнит. Захочет повидаться. Но не так, как я — с ним.|Endi ismimni bilaman. Qo'limdan kelsa, qaytarib berardim. Tepaga chiqaman. Tillabek ham meni eslaydi. Ko'rishni xohlaydi. Lekin men uni ko'rishni xohlaganchalik emas.`]
        ].concat(end), done);
      } else if (o.id === 'destroyed') {
        addVoid(3, `a memory burned|память сожжена|xotira yoqildi`); trust(-1); rep('tail', 1, true);
        play([
          ['', `You burn them. The wax smokes black. For a moment the cache is full of faces: men and women bargaining, weeping, counting coins. Then nothing.|Ты сжигаешь их. Воск чадит чёрным. На миг тайник полон лиц: мужчины и женщины торгуются, плачут, считают монеты. Потом — ничего.|Ularni yoqasan. Mum qop-qora tutaydi. Bir lahza ombor yuzlarga to'lib ketadi: savdolashayotgan, yig'layotgan, tanga sanayotgan erkagu ayollar. Keyin — hech narsa.`],
          ['alp', `…They don't smell like me any more. Good. Thank you, I think. What was in them?|…Они больше не пахнут мной. Хорошо. Спасибо, наверное. А что в них было?|…Endi ulardan mening hidim kelmayapti. Yaxshi. Rahmat, shekilli. Ularda nima bor edi?`],
          ['hero', `Nothing worth keeping.|Ничего такого, что стоило бы хранить.|Saqlashga arzigulik hech narsa.`],
          ['sado', `That wasn't yours to decide. …Though I'd probably have done the same. I don't know.|Не тебе было решать. …Хотя я бы, наверное, сделала так же. Не знаю.|Buni sen hal qilishing kerak emasdi. …Garchi men ham shunday qilardim, shekilli. Bilmadim.`],
          ['alp', `The children will be hungry. I should go back up.|Дети проголодаются. Мне пора наверх.|Bolalar och qoladi. Tepaga qaytishim kerak.`]
        ].concat(end), done);
      } else {
        trust(2); rep('tail', 1, true);
        play([
          ['hero', `You were Tilla-bek's captain. You sold people from the Tail. These are the years you did it.|Ты был капитаном у Тилла-бека. Продавал людей из Хвоста. Здесь — те самые годы.|Sen Tillabekning kapitani bo'lgansan. Dumdan odam sotgansan. Bularning ichida — o'sha yillar.`],
          ['', `Alp listens without blinking. When you finish, he looks at his hands for a long time, as if they were someone else's tools.|Алп слушает не моргая. Когда ты замолкаешь, он долго смотрит на свои руки, будто это чужие инструменты.|Alp ko'zini qirpmay tinglaydi. Gapingni tugatganingda, qo'llariga uzoq tikiladi — go'yo ular birovning asbobidek.`],
          ['alp', `If I take them, I'll know. If I burn them, I'll still have done it. I just won't know.|Если возьму — буду знать. Если сожгу — всё равно это сделал я. Просто знать не буду.|Olsam — bilaman. Yoqsam — baribir men qilgan bo'laman. Faqat bilmayman.`],
          ['alp', `The children shouldn't be raised by a man who doesn't know what he did. Or by the man who did it.|Детей не должен растить тот, кто не знает, что натворил. И тот, кто натворил, — тоже.|Bolalarni nima qilganini bilmaydigan odam boqmasligi kerak. Buni qilgan odam ham.`],
          ['', `He threads the tumars on a cord, unopened, and hangs them round his neck, under his shirt, against the skin.|Он нанизывает тумары на шнурок, не вскрывая, и вешает на шею — под рубаху, к самой коже.|U tumarlarni ochmay ipga tizadi va bo'yniga osadi — ko'ylagi tagiga, badaniga tegizib.`],
          ['alp', `I'll wear them closed. When the children are grown, they can ask me to open them. A debt should be worn where people can see it.|Буду носить закрытыми. Вырастут дети — попросят, и открою. Долг надо носить так, чтобы его видели.|Yopiq holda taqib yuraman. Bolalar katta bo'lib, so'rashsa — ochaman. Qarzni odamlar ko'radigan joyda taqib yurish kerak.`],
          ['alp', `…I won't sleep much now. That's fair.|…Спать теперь буду плохо. Это справедливо.|…Endi uyqum qochadi. Bu adolatdan.`]
        ].concat(end), done);
      }
    }));
  }
});
BARKS['a2_streets:start'] = [
  `Mind the roofs. They're floors now.|Осторожно, крыши. Теперь это пол.|Tomlardan ehtiyot bo'l. Endi ular pol.`,
  `Tumars in the walls, still sealed. The people are under the sand. Their memories didn't drown.|В стенах тумары, ещё запечатанные. Люди под песком, а память их не утонула.|Devorlarda tumarlar, hali muhrlangan. Odamlar qum tagida, xotiralari esa cho'kmagan.`
];
BARKS['a2_streets:mid'] = [
  `A Divan mark on that door: the feather. Someone's been storing things down here.|На той двери знак Дивана — перо. Кто-то устроил тут склад.|Anavi eshikda Devon belgisi — pat. Kimdir bu yerni omborga aylantirgan.`,
  `I don't like it here. It's not the dark. It's that I almost like it.|Мне здесь не нравится. И дело не в темноте. Дело в том, что мне здесь почти нравится.|Bu yer menga yoqmayapti. Gap qorong'ilikda emas. Gap shundaki, deyarli yoqyapti.`
];

/* =====================================================================
   16 · b_cistern — Albasty, Mother of the Karez
   ===================================================================== */
BOSS('albasty', {
  name: `Albasty|Албасты|Albasti`,
  title: `Mother of the Karez|Мать кяризов|Korizlar onasi`,
  quote: `"Hush. The dark is safe. I keep them all in the dark."|«Тише. В темноте не страшно. Я храню их всех в темноте.»|«Jim. Qorong'ida qo'rqinchli emas. Hammasini qorong'ida asrayman.»`,
  lair: `The Great Cistern|Большая цистерна|Katta sardoba`,
  lairSub: `Where the memories of drowned children gather|Здесь собирается память утонувших детей|Cho'kkan bolalarning xotirasi shu yerga yig'iladi`,
  who: 'albasty',
  pre: [
    ['', `A dome of wet brick, black water up to the walls. Something sits in the middle, long hair floating round it like weed. It is singing Alla in many voices at once.|Купол из мокрого кирпича, чёрная вода до самых стен. Посередине кто-то сидит, вокруг, как тина, плавают длинные волосы. Оно поёт «Аллу» — множеством голосов сразу.|Ho'l g'ishtdan gumbaz, devorlargacha qora suv. O'rtada kimdir o'tiribdi, atrofida uzun sochlari suv o'tidek suzib yuribdi. U birdaniga ko'p ovozda «Alla» aytyapti.`],
    ['albasty', `Hush. Hush now. Who walks in my water with a light? Lights wake the little ones.|Тише. Тише. Кто это ходит по моей воде со светом? Свет будит маленьких.|Jim. Jim-jim. Suvimda chiroq ko'tarib kim yuribdi? Yorug' kichkintoylarni uyg'otadi.`],
    ['albasty', `…Oh. You carry one. A little one. I can hear her breathing behind your eyes.|…О. Да ты носишь одну. Маленькую. Я слышу, как она дышит у тебя за глазами.|…Oh. Sen bittasini ko'tarib yuribsan-ku. Kichkinasini. Ko'zlaring ortida nafas olayotganini eshityapman.`],
    ['sado', `She can see me. Ravshan, she can see me!|Она меня видит. Равшан, она меня видит!|U meni ko'ryapti. Ravshan, u meni ko'ryapti!`],
    ['albasty', `Give her to me. The mothers up above sell their children to the tithe. I keep them. In the dark nobody sings them away.|Отдай её мне. Матери наверху продают детей в десятину. А я их берегу. В темноте их никто не выпоет.|Uni menga ber. Tepadagi onalar bolalarini ushrga sotadi. Men esa asrayman. Qorong'ida ularni hech kim kuylab olib ketmaydi.`],
    ['sado', `Toychoq, don't give me to her… …Why did I call you that?|Тойчок, не отдавай меня… …Почему я тебя так назвала?|Toychoq, meni berma… …Nega seni shunday dedim?`]
  ],
  again: [
    `Give me the little one, yodchi.|Отдай мне маленькую, ёдчи.|Kichkintoyni menga ber, yodchi.`,
    `Hush. Your light hurts them.|Тише. Твой свет делает им больно.|Jim. Nuring ularga ozor beryapti.`,
    `I was a mother once. I was every mother once.|Когда-то я была матерью. Когда-то я была всеми матерями.|Bir paytlar ona edim. Bir paytlar hamma onalar men edim.`
  ],
  post: done => {
    const f = F();
    play([
      ['', `The Albasty sinks without a sound. Her hair stays on the surface a long time. Then it sinks too.|Албасты беззвучно уходит под воду. Волосы ещё долго лежат на поверхности. Потом тонут и они.|Albasti tovushsiz cho'kadi. Sochlari uzoq vaqt suv yuzida qoladi. Keyin ular ham cho'kadi.`],
      ['', `On the ledge where she sat: a nest of small tumars, hundreds, wrapped in rags like swaddled babies. Children's memories. Debtors sung away. The drowned.|На уступе, где она сидела, — гнездо из маленьких тумаров. Сотни, и каждый завёрнут в тряпицу, как младенец в пелёнку. Детская память. Выпетые должники. Утонувшие.|U o'tirgan tokchada kichkina tumarlardan uya. Yuzlab, har biri chaqaloqdek lattaga yo'rgaklangan. Bolalar xotirasi. Kuylab olingan qarzdorlar. Cho'kkanlar.`],
      () => f.davron === 'reported' && ['', `Three are tied with Rabat camel wool. Davron's children. You reported them. The Singers sang them empty, and the Albasty gathered what fell.|Три перевязаны верблюжьей шерстью с Рабата. Дети Даврона. Ты на них донёс. Певцы выпели их до дна, а Албасты подобрала то, что упало.|Uchtasi Rabot tuyasining juni bilan bog'langan. Davronning bolalari. Ularni sen chaqqansan. Xonandalar ularni tagigacha bo'shatdi, Albasti esa tushib qolganini terib olgan.`],
      () => f.widow && ['', `One is warm. A boy calling across a karez for his mother. You know the door he's calling toward. A widow's door in the Tail. Mehri's.|Один тёплый. Мальчик зовёт маму с другого берега кяриза. Ты знаешь дверь, к которой он зовёт. Вдовья дверь в Хвосте. Дверь Мехри.|Bittasi iliq. Bir bola koriz ortidan onasini chaqiryapti. Qaysi eshikka qarab chaqirayotganini bilasan. Dumdagi bir bevaning eshigi. Mehrining eshigi.`],
      () => f.widow === 'force' && ['', `On the Night of Payment you took her memory of him by force. And here is his memory of her.|В Ночь Уплаты ты силой отнял у неё память о нём. А вот его память о ней.|To'lov kechasi undan o'g'li haqidagi xotirasini zo'rlab tortib olgansan. Mana bu esa o'g'lining onasi haqidagi xotirasi.`],
      ['sado', `They're so small. They're all so small.|Они такие маленькие. Все такие маленькие.|Shunaqa kichkina. Hammasi shunaqa kichkina.`],
      ['sado', `…I'm not afraid of her any more. I'm afraid of how well I understood her.|…Я её больше не боюсь. Я боюсь того, как хорошо её поняла.|…Endi undan qo'rqmayman. Uni qanchalik yaxshi tushunganimdan qo'rqaman.`],
      ['sado', `If we carry them up, maybe someone will know their own. If we give them to the water, the Sleeper eats and calms down a little. And the ground up there is shaking hard.|Отнесём наверх — может, кто-то узнает своих. Отдадим воде — Спящий поест и чуть успокоится. А наверху трясёт сильно.|Tepaga olib chiqsak — balki kimdir o'zinikini tanib olar. Suvga bersak — Uxlovchi to'yib, biroz tinchiydi. Tepada esa yer qattiq silkinyapti.`],
      ['sado', `And Farrukh would pay a lot for them. …I said that out loud. I'm ashamed.|А Фаррух дал бы за них хорошие деньги. …Я это вслух сказала. Стыдно.|Farrux esa bular uchun yaxshi pul berardi. …Buni ovoz chiqarib aytdim-a. Uyat.`]
    ], () => ask(`The nest|Гнездо|Uya`, [
      { label: f.widow ? `Carry them up to the Tail. The boy's goes to Mehri.|Отнести их наверх, в Хвост. Мальчика — к Мехри.|Ularni tepaga, Dumga olib chiqish. Bolanikini — Mehriga.` : `Carry them up to the Tail.|Отнести их наверх, в Хвост.|Ularni tepaga, Dumga olib chiqish.`, id: 'tail' },
      { label: `Give them to the water. Let the Sleeper eat.|Отдать их воде. Пусть Спящий поест.|Ularni suvga berish. Uxlovchi to'ysin.`, id: 'feed' },
      { label: `Sell them to Farrukh.|Продать их Фарруху.|Ularni Farruxga sotish.`, cost: 4, id: 'sell' }
    ], o => {
      f2('nest', o.id);
      if (o.id === 'tail') {
        rep('tail', 2); trust(1);
        play([
          ['', `You wrap them in your coat. They weigh nothing. Your back aches anyway.|Ты заворачиваешь их в халат. Они ничего не весят. А спина всё равно ноет.|Ularni to'ningga o'raysan. Hech narsa tortmaydi. Baribir beling zirqiraydi.`],
          ['', `Most of them nobody will ever claim. And every Hollow between here and the Tail will smell them on you.|Большинство из них никто никогда не заберёт. А каждый Пустой отсюда до самого Хвоста будет чуять их на тебе.|Ularning ko'pini hech kim izlab kelmaydi. Bu yerdan Dumgacha har bir Bo'sh esa ularning hidini sendan sezib turadi.`],
          ['sado', `Someone will be waiting for them. Someone always is. Even if they don't know who they're waiting for.|Их кто-нибудь да ждёт. Всегда кто-нибудь ждёт. Даже если сам не знает кого.|Ularni kimdir kutyapti. Doim kimdir kutadi. Kimni kutayotganini o'zi bilmasa ham.`]
        ], done);
      } else if (o.id === 'feed') {
        rep('singers', 1);
        play([
          ['', `The water takes them one by one, like a mouth. For the first time since the Well opened, the water in the Karez tastes sweet.|Вода принимает их один за другим, как рот. Впервые с тех пор, как открылся Колодец, вода в кяризе сладкая.|Suv ularni birma-bir, og'izdek yutadi. Quduq ochilgandan beri birinchi marta korizdagi suv shirin.`],
          ['sado', `He was hungry. I know. I know he was hungry.|Он был голоден. Я знаю. Знаю, что был голоден.|U och edi. Bilaman. Och edi, bilaman.`]
        ], done);
      } else {
        addVoid(4, `a cruel bargain|жестокая сделка|shafqatsiz savdo`); trust(-2);
        play([
          ['', `Farrukh pays well for children's mornings. They're the sweetest thing the Ark buys.|Фаррух хорошо платит за детские утра. Слаще в Арке ничего не покупают.|Farrux bolalar tongi uchun yaxshi to'laydi. Ark sotib oladigan narsalarning eng shirini shu.`, () => gold(90)],
          ['sado', `Don't talk to me for a while.|Не разговаривай со мной пока.|Bir oz men bilan gaplashma.`]
        ], done);
      }
    }));
  }
});

/* =====================================================================
   17 · r_lamp — The Last Lamp (underground chaikhana)
   ===================================================================== */
REST('r_lamp', {
  name: `The Last Lamp|Последняя лампа|So'nggi chiroq`,
  sub: `An underground chaikhana. One wick has burned here for twenty years|Подземная чайхана. Один фитиль горит здесь двадцать лет|Yer osti choyxonasi. Bu yerda yigirma yildan beri bitta pilik yonib turibdi`,
  arrive: done => play([
    ['', `A chaikhana carved into the Sleeper's flesh. The walls are warm and faintly ribbed. A single clay lamp burns in a niche. Under it a sign: "Don't let it go out."|Чайхана, вырезанная прямо в плоти Спящего. Стены тёплые, чуть ребристые. В нише горит глиняная лампа. Под ней надпись: «Не дайте ей погаснуть».|Uxlovchining etiga o'yib qilingan choyxona. Devorlari iliq, sal qovurg'asimon. Tokchada loy chiroq yonib turibdi. Tagida yozuv: «O'chirmang».`],
    ['', `The keeper is an old woman with lamp-black under her nails. She pours you tea without asking. It tastes of salt and smoke.|Хозяйка — старуха с копотью под ногтями. Наливает тебе чай, ни о чём не спрашивая. Чай отдаёт солью и дымом.|Choyxona egasi — tirnoqlari tagiga qurum qotgan kampir. Hech narsa so'ramay choy quyib beradi. Choydan tuz va tutun ta'mi keladi.`],
    ['keeper', `My husband lit it the night the Tail fell. He went to look for our girls. Said, keep it burning so I can find my way back.|Муж зажёг её в ту ночь, когда рухнул Хвост. Пошёл искать наших девочек. Сказал: пусть горит, чтобы я нашёл дорогу назад.|Cholim uni Dum qulagan kechasi yoqqan. Qizlarimizni izlab ketdi. Yonib tursin, qaytishda yo'lni topay, dedi.`],
    ['keeper', `Twenty years. I've never let it go out. He'll want to find the way.|Двадцать лет. Ни разу не дала погаснуть. Ему ведь надо найти дорогу.|Yigirma yil. Bir marta ham o'chirmadim. Axir u yo'lni topishi kerak.`],
    () => hollowEyes() && ['keeper', `You look like the ones who come down here to stop. Drink. Stopping can wait.|Ты похож на тех, кто спускается сюда, чтобы остановиться насовсем. Пей. Остановиться успеешь.|Bu yerga butunlay to'xtagani keladiganlarga o'xshaysan. Ich. To'xtashga ulgurasan.`],
    ['sado', `I like it here. I like her lamp. Can we stay till morning?|Мне тут нравится. И лампа её нравится. Давай побудем до утра?|Bu yer menga yoqdi. Chirog'i ham yoqdi. Tonggacha qolaylikmi?`],
    ['hero', `There's no morning down here.|Тут не бывает утра.|Bu yerda tong otmaydi.`],
    ['sado', `Then till the tea's gone. Drink slowly.|Тогда пока чай не кончится. Пей медленно.|Unda choy tugaguncha. Sekin ich.`]
  ], done),

  rustam: firstThen('a2:lamp:rustam', done => play([
    ['', `Rustam-aka has found the keeper's second cup and holds it out to be filled, again and again. She fills it. She doesn't ask who he is.|Рустам-ака нашёл вторую пиалу хозяйки и протягивает её снова и снова. Она наливает. И не спрашивает, кто он.|Rustam aka choyxona egasining ikkinchi piyolasini topib olib, qayta-qayta uzatadi. U quyib beradi. Kimligini so'ramaydi.`],
    () => F().rustamKey && ['sado', `He gave her the key. He asked to be emptied. And now he sits here holding out a cup.|Он отдал ей ключ. Сам попросил его опустошить. А теперь сидит тут и протягивает пиалу.|U kalitni o'zi bergan. O'zini bo'shatishni o'zi so'ragan. Endi esa shu yerda piyola tutib o'tiribdi.`],
    () => F().rustamKey && ['sado', `Do you hate him? You're allowed to. I'm only asking.|Ты его ненавидишь? Тебе можно. Я просто спрашиваю.|Undan nafratlanasanmi? Haqqing bor. Shunchaki so'rayapman.`],
    () => F().rustamKey && ['hero', `I don't know what I'd hate him with.|Не знаю, чем мне его ненавидеть.|Undan nima bilan nafratlanishni bilmayman.`],
    ['rustam', `…the Karez route… the lamp-woman pays in tea… tea is a fair tithe…|…маршрут по кяризу… хозяйка лампы платит чаем… чай — честная десятина…|…koriz yo'li… chiroqchi xola choy bilan to'laydi… choy — halol ushr…`]
  ], done), RUSTAM_HABIT),

  turab: done => play(hasVoice() ? [
    ['turab', `In the tales the first bakhshi has no name. They call him the Teller. For sixty years he told the spirit a story every night, and for each one the oasis grew by a garden.|В сказаниях у первого бахши нет имени. Его зовут просто Сказитель. Шестьдесят лет он каждую ночь рассказывал духу историю, и за каждую оазис прирастал садом.|Dostonlarda ilk baxshining ismi yo'q. Uni shunchaki Hikoyachi deyishadi. Oltmish yil u har kecha ruhga bitta hikoya aytib bergan, har bir hikoya uchun vohaga bitta bog' qo'shilgan.`],
    ['turab', `When the Teller died, the spirit wept for a week and the oasis flooded. That's why bakhshi are buried facing the Well. So he can still hear us.|Когда Сказитель умер, дух неделю плакал, и оазис затопило. Поэтому бахши и хоронят лицом к Колодцу. Чтобы он нас слышал.|Hikoyachi o'lganda ruh bir hafta yig'ladi, vohani suv bosdi. Shuning uchun baxshilarni Quduqqa qaratib ko'mishadi. U bizni eshitib tursin deb.`]
  ] : [
    ['', `Turab sets his bowl on the table, taps a slow rhythm on it and moves his lips. He's telling a story. He watches to see if you understand. You don't. He keeps telling it anyway.|Тураб ставит пиалу на стол, медленно отстукивает по ней ритм и шевелит губами. Он что-то рассказывает. Смотрит, понимаешь ли ты. Ты не понимаешь. Он всё равно рассказывает.|Turob piyolasini stolga qo'yib, unga sekin chertib turadi va lablarini qimirlatadi. Nimadir hikoya qilyapti. Tushunyapsanmi deb qaraydi. Tushunmaysan. U baribir aytaveradi.`]
  ], done),

  farrukh: firstThen('a2:lamp:farrukh', done => play([
    ['', `Farrukh sits in the corner among empty tumars cracked open like pistachio shells. His eyes are bright. Wrongly bright.|Фаррух сидит в углу среди пустых тумаров, расколотых, как фисташковая скорлупа. Глаза блестят. Нехорошо блестят.|Farrux burchakda pista po'chog'idek chaqilgan bo'sh tumarlar orasida o'tiribdi. Ko'zlari yaltiraydi. Yomon yaltiraydi.`],
    ['farrukh', `Yodchi! Sit. I've had a wonderful morning. Three, in fact. A wedding in Bukhara, a first kiss in a pomegranate orchard, somebody's grandfather teaching him to swim.|Ёдчи! Садись. У меня было чудесное утро. Даже три. Свадьба в Бухаре, первый поцелуй в гранатовом саду и чей-то дед, который учит внука плавать.|Yodchi! O'tir. Ajoyib tongim bo'ldi. Aslida uchta. Buxorodagi to'y, anorzordagi birinchi o'pich va kimningdir bobosi uni suzishga o'rgatyapti.`],
    ['farrukh', `None of them mine, obviously. Mine ran out years ago. I've lived on other people's mornings so long I don't remember what my own tasted like.|Ни одно не моё, разумеется. Мои кончились давным-давно. Я так долго живу чужими утрами, что забыл вкус своих.|Birortasi ham meniki emas, albatta. Meniklari allaqachon tugagan. Birovlarning tonglari bilan shunchalik uzoq yashadimki, o'zimnikining ta'mini unutdim.`],
    ['sado', `He reeks of tumar wax. He's soaked in it. Ravshan, he's emptying himself from the inside, one sweet thing at a time.|От него разит тумарным воском. Он весь им пропитан. Равшан, он сам себя выедает изнутри — по одной сладости за раз.|Undan tumar mumining hidi gupillab turibdi. Butunlay singib ketgan. Ravshan, u o'zini ichidan yeb bitiryapti — har gal bitta shirinlik bilan.`],
    ['farrukh', `I've got one left. My own. My mother in the saffron fields, purple to the edge of the world. I keep it here.|У меня осталось одно. Своё. Мама в шафрановых полях, лиловых до самого края земли. Я держу его вот тут.|Bittasi qoldi. O'zimniki. Za'faron dalasida onam, dunyoning chetigacha binafsha. Uni mana shu yerda saqlayman.`],
    ['farrukh', `Every night I want to taste it. Once more won't wear it through, I tell myself. Every night. Take it, will you? Keep it where I can't reach.|Каждую ночь хочу его попробовать. «Один раз не сотрёт», — говорю я себе. Каждую ночь. Забери его, а? Спрячь, чтобы я не дотянулся.|Har kecha uni totgim keladi. «Bir martada yeyilib ketmaydi», deyman o'zimga. Har kecha. Olib qo'y, xo'pmi? Qo'lim yetmaydigan joyga yashir.`],
    () => hollowEyes() && ['farrukh', `…Though look at you. Maybe you're not the safest pocket in the Karez.|…Хотя посмотри на себя. Может, твой карман в кяризе не самый надёжный.|…Lekin o'zingga bir qara. Balki korizdagi eng ishonchli cho'ntak sen emasdirsan.`]
  ], () => hub(`Farrukh's last memory|Последняя память Фарруха|Farruxning so'nggi xotirasi`, [
    { label: `— What if you taste it again?|— А если ты попробуешь его ещё раз?|— Yana bir marta totsang-chi?`, lines: [
      ['farrukh', `It wears. Every taste rubs a little off. It's thin as paper now. One more time and it might just… go.|Оно стирается. Каждый раз понемножку. Оно уже тонкое, как бумага. Ещё раз — и, может, просто… исчезнет.|U yeyiladi. Har totganda ozgina. Hozir qog'ozdek yupqa bo'lib qolgan. Yana bir marta — va u shunchaki… yo'qolishi mumkin.`]
    ] },
    { label: `— Why not go home to the Saffron?|— Почему бы тебе не вернуться в Дом Шафрана?|— Nega Za'faron xonadoniga qaytmaysan?`, lines: [
      ['farrukh', `They disowned me. For stealing. Fair enough, I did steal. Mostly from them. It's been eight years. I don't know if anyone there remembers my face.|Меня выгнали. За воровство. Справедливо, я воровал. В основном у них. Восемь лет прошло. Не знаю, помнит ли там хоть кто-то моё лицо.|Meni haydab yuborishgan. O'g'irlik uchun. To'g'ri qilishgan, o'g'irlaganman. Asosan ulardan. Sakkiz yil o'tdi. U yerda yuzimni kimdir eslaydimi-yo'qmi, bilmayman.`]
    ] }
  ], [
    { label: `"Give it here. I'll keep it for you."|«Давай сюда. Сберегу для тебя.»|«Ber buyoqqa. Sen uchun asrab qo'yaman.»`, id: 'kept' },
    { label: `"Go home to the House of Saffron."|«Возвращайся домой, в Дом Шафрана.»|«Uyingga, Za'faron xonadoniga qayt.»`, id: 'home' },
    { label: `Buy it off him. Saffron mornings fetch a price in the Ark.|Выкупить у него. В Арке шафрановые утра в цене.|Undan sotib olish. Arkda za'faron tonglari qimmat turadi.`, price: 30, id: 'sold' },
    { label: `"Taste it, then. One last time."|«Ну так попробуй. В последний раз.»|«Unda tot. Oxirgi marta.»`, id: 'drunk' }
  ], o => {
    f2('farrukh', o.id);
    if (o.id === 'kept') {
      trust(1);
      play([
        ['', `He puts it in your palm: a small tumar that smells, very faintly, of saffron.|Он кладёт тебе на ладонь маленький тумар. От него едва уловимо пахнет шафраном.|U kaftingga kichkina tumar qo'yadi. Undan zo'rg'a seziladigan za'faron hidi keladi.`],
        ['farrukh', `Don't you dare taste it.|Только попробуй его попробовать.|Totib ko'rishga jur'at qilma.`],
        ['hero', `I won't.|Не буду.|Totmayman.`],
        ['farrukh', `I would. …Thank you.|А я бы попробовал. …Спасибо.|Men totardim. …Rahmat.`],
        ['', `He laughs, and it's almost his own laugh.|Он смеётся, и это почти его собственный смех.|U kuladi — bu deyarli o'zining kulgisi.`]
      ], done);
    } else if (o.id === 'home') {
      trust(1);
      play([
        ['farrukh', `Home. They'd pour me tea and count the spoons after I'd gone. …But they'd pour it.|Домой. Нальют мне чаю, а как уйду — пересчитают ложки. …Но ведь нальют.|Uyga. Menga choy quyib berishadi, ketganimdan keyin qoshiqlarni sanashadi. …Lekin quyib berishadi-ku.`],
        ['farrukh', `When this is over. If there is an over. I'll stand at the gate and see if anyone remembers my face.|Когда всё это кончится. Если кончится. Встану у ворот и посмотрю, вспомнит ли кто моё лицо.|Hammasi tugagach. Agar tugasa. Darvoza oldida turib ko'raman, kimdir yuzimni eslarmikan.`]
      ], done);
    } else if (o.id === 'sold') {
      trust(-2);
      play([['', `He takes your tilla the way a man takes medicine. Before you've left the table he's bought a stranger's afternoon from the smuggler at the door.|Он берёт твою тиллу, как берут лекарство. Ты ещё не встал из-за стола, а он уже купил у контрабандиста в дверях чужой полдень.|U tillangni dori olgandek oladi. Sen hali stoldan turmasingdan, eshik oldidagi kontrabandachidan birovning bir kunduzini sotib oladi.`]], done);
    } else {
      play([
        ['', `He tastes it. His face goes soft and young. "Purple," he says. "All the way to the…" He frowns. "To the what?" The tumar in his hand is grey wax. Empty.|Он пробует. Лицо становится мягким и молодым. «Лиловое, — говорит он. — До самого…» Хмурится. «До самого чего?» Тумар в руке — серый воск. Пустой.|U totadi. Yuzi yumshab, yosharib ketadi. «Binafsha, — deydi. — To…» Qovog'ini soladi. «To qayergacha?» Qo'lidagi tumar kulrang mum. Bo'm-bo'sh.`],
        ['farrukh', `…Ah. Well. It was a very good morning, I'm told.|…А. Ну что ж. Говорят, утро было очень хорошее.|…Ha. Mayli. Aytishlaricha, juda yaxshi tong bo'lgan ekan.`]
      ], done);
    }
  })), () => ({
    kept: ['farrukh', `Still got it? Don't show me. Just nod. …Good.|Ещё у тебя? Не показывай. Просто кивни. …Вот и хорошо.|Hali sendami? Ko'rsatma. Shunchaki bosh irg'a. …Yaxshi.`],
    home: ['farrukh', `I'm practising what I'll say at the gate. "Hello, Mother, I'm a smuggler." Needs work.|Репетирую, что скажу у ворот. «Здравствуй, мама, я контрабандист». Надо доработать.|Darvoza oldida nima deyishni mashq qilyapman. «Assalomu alaykum, ona, men kontrabandachiman». Hali pishitish kerak.`],
    sold: ['farrukh', `Yodchi! Have we met? I've had the loveliest afternoon. I think it was mine.|Ёдчи! Мы знакомы? У меня был чудесный полдень. Кажется, мой собственный.|Yodchi! Tanishmidik? Ajoyib kunim bo'ldi. Shekilli, o'zimniki.`],
    drunk: ['farrukh', `Purple. That's all I have left of it. The word. I say it sometimes, to see if anything comes.|Лиловое. Вот и всё, что осталось. Слово. Иногда повторяю — вдруг что-то вернётся.|Binafsha. Undan qolgani shu. Bitta so'z. Ba'zan takrorlab ko'raman — balki nimadir qaytar.`]
  }[F().farrukh] || ['farrukh', `Sit. The tea's terrible. The company's worse. Best place in the Karez.|Садись. Чай ужасный. Компания ещё хуже. Лучшее место в кяризе.|O'tir. Choyi rasvo. Suhbatdoshlar undan battar. Korizdagi eng zo'r joy.`])),

  lullaby: done => lullaby(done, `Alla, alla, the lamp is lit. Someone keeps it lit for you. Don't count the dark. Count the light. Alla.|Алла, алла, лампа горит. Кто-то бережёт её для тебя. Не считай темноту. Считай свет. Алла.|Alla, alla, chiroq yonar. Kimdir uni sen deb asrar. Qorong'ini sanama. Nurni sana. Alla.`,
    `The keeper turns her head toward you, as if she heard something. She can't have. She trims the wick anyway, and the lamp burns a little higher.|Хозяйка поворачивает к тебе голову, будто что-то услышала. Не могла она ничего слышать. Но фитиль всё-таки поправляет, и лампа горит чуть ярче.|Chiroqchi xola go'yo nimadir eshitgandek senga o'giriladi. Eshitishi mumkin emas. Baribir pilikni to'g'rilaydi, chiroq sal yorqinroq yonadi.`)
});
BARKS['r_lamp:start'] = [
  `One lamp for twenty years. That's the bravest thing I've seen in this whole city.|Одна лампа — двадцать лет. Ничего смелее я в этом городе не видела.|Bitta chiroq — yigirma yil. Butun shaharda bundan jasurroq narsani ko'rmadim.`
];

/* =====================================================================
   18 · a2_old — Old Yodgor. The sister.
   ===================================================================== */
LAND('a2_old', {
  name: `Old Yodgor|Старый Ёдгор|Eski Yodgor`,
  sub: `The city before the Year of Sand, buried in the Sleeper's skin|Город до Года Песка, погребённый в коже Спящего|Qum yilidan oldingi shahar, Uxlovchining terisiga ko'milgan`,
  start: [
    ['', `The tunnel opens onto a city. Blue-tiled domes under a sky of wet rock. Market stalls with their awnings still up. Nobody has walked here for three hundred years.|Тоннель выводит к городу. Купола в синей плитке под небом из мокрого камня. Рыночные лавки, навесы до сих пор подняты. Здесь триста лет никто не ходил.|Yo'lak shaharga olib chiqadi. Ho'l tosh osmon ostida ko'k koshinli gumbazlar. Bozor rastalari, soyabonlari hali ham tortilgan. Bu yerda uch yuz yildan beri hech kim yurmagan.`],
    ['', `Everything is coated in fine white salt, as if the city wept and dried like that.|Всё покрыто тонкой белой солью, будто город плакал — да так и высох.|Hamma narsa yupqa oq tuz bilan qoplangan, go'yo shahar yig'lagan-u, shu holicha qurib qolgan.`],
    ['sado', `It's beautiful. So why does it scare me more than the dark did?|Как красиво. Тогда почему мне страшнее, чем в темноте?|Qanday chiroyli. Unda nega qorong'idan ham qo'rqinchliroq?`],
    ['hero', `The dark was empty. This place is full.|Темнота была пустой. А тут всё полно.|Qorong'i bo'm-bo'sh edi. Bu yer esa liq to'la.`]
  ],
  stones: [
    `"On the night of the Year of Sand the sky was clear. Then the ground stood up, and the stars fell into the sand."|«В ночь Года Песка небо было ясное. Потом земля встала дыбом, и звёзды упали в песок».|«Qum yili kechasi osmon tiniq edi. Keyin yer tikka turdi va yulduzlar qumga to'kildi».`,
    `"The Seven were not in the city that night. They had gone to the Rabat 'to count the caravans'. Their families were here. They did not come back for them."|«Семерых в ту ночь в городе не было. Они уехали на Рабат — "считать караваны". Их семьи остались здесь. За семьями они не вернулись».|«U kecha Yettilar shaharda yo'q edi. Ular "karvonlarni sanash" uchun Rabotga ketishgandi. Oilalari shu yerda qoldi. Ular oilalarining ortidan qaytishmadi».`,
    `A wedding feast carved in relief. The bride's and groom's faces have been chiselled off. Later, by careful hands, as if someone wanted them forgotten.|Резьба — свадебный пир. У жениха и невесты сбиты лица — позже и очень аккуратно, будто их хотели стереть из памяти.|O'ymakor naqsh — to'y ziyofati. Kelin-kuyovning yuzlari keyinroq, juda ehtiyotlab o'yib tashlangan — go'yo ularni unuttirmoqchi bo'lishgan.`,
    `"I am the last bakhshi of the old house. His name is forbidden. I hide it here in pieces: OBI on this stone, and the rest…" The stone is broken off.|«Я последний бахши старого дома. Его имя запрещено. Я прячу его здесь по частям: ОБИ на этом камне, а остальное…» Дальше камень отколот.|«Men eski xonadonning so'nggi baxshisiman. Uning ismi taqiqlangan. Uni shu yerda bo'laklab yashiryapman: bu toshda OBI, qolgani esa…» Toshning davomi sinib tushgan.`
  ],
  memory: {
    id: 'm2_book',
    lines: [
      ['memory', `Your mother's kitchen. The debt book lies open on the table like a wound. Rustam-aka in the doorway, cap in his hands.|Мамина кухня. На столе раскрыта долговая книга, как рана. В дверях Рустам-ака мнёт в руках шапку.|Onangning oshxonasi. Stol ustida qarz daftari yaradek ochiq yotibdi. Eshik oldida Rustam aka do'ppisini g'ijimlab turibdi.`],
      ['memory', `Your mother's finger on a line. "Not her. You can't write her down. She's eight."|Мамин палец на строчке. «Только не её. Её нельзя вписывать. Ей восемь».|Onangning barmog'i bir qatorda. «Uni emas. Uni yozib bo'lmaydi. U sakkiz yoshda».`],
      ['memory', `Rustam says something you can't hear. Then the memory folds in on itself, like a page torn out and glued back crooked.|Рустам что-то говорит, но слов не слышно. Потом воспоминание сминается, как вырванная и криво вклеенная страница.|Rustam nimadir deydi, lekin eshitilmaydi. Keyin xotira yirtib olinib, qiyshiq yopishtirilgan varaqdek g'ijimlanib ketadi.`]
    ],
    after: () => sub2(`"Not her." Who's "her"? …Don't answer. I don't want you to answer yet.|«Только не её». Кого — её? …Не отвечай. Я пока не хочу, чтобы ты отвечал.|«Uni emas». Kimni? …Javob berma. Hozircha javob berishingni istamayman.`)
  },
  people: [{ look: 'rebel' }, { look: 'hollow', x: 16 }, { look: 'hollow', x: 28 }, { look: MASKED, x: 46, lamp: true }],
  exit: done => oydinScene(done)
});
BARKS['a2_old:start'] = [
  `Salt on everything. It crunches. I'm sorry, I know it's a grave. But it crunches.|Всё в соли. Хрустит. Прости, я знаю, это могила. Но хрустит же.|Hamma yoq tuz. G'irchillaydi. Kechir, bu qabr ekanini bilaman. Lekin g'irchillaydi-da.`,
  `These awnings are the same blue as the gate. The one that fell. Everything blue here hurts to look at.|Эти навесы того же синего цвета, что ворота. Те, что упали. На всё синее здесь больно смотреть.|Bu soyabonlar o'sha darvozadek ko'k. Qulagan darvozadek. Bu yerdagi har bir ko'k narsaga qarash og'ir.`
];
BARKS['a2_old:mid'] = [
  `Someone's up ahead. Lots of someones. Standing still, like Hollow. And one who isn't.|Впереди кто-то есть. Много кого. Стоят неподвижно, как Пустые. И одна — нет.|Oldinda kimdir bor. Ko'p kishi. Bo'shlardek qimirlamay turishibdi. Bittasi esa unaqa emas.`,
  `My light is shaking. It's not me doing it. Something here is pulling at it.|Мой свет дрожит. Это не я. Что-то здесь его тянет.|Nurim titrayapti. Bu men emas. Bu yerda nimadir uni tortyapti.`
];

function oydinScene(done) {
  const f = F();
  const intro = [
    ['', `In the old city's square, under a blue dome, the masked woman is waiting. Alone this time, apart from her Hollow.|На площади старого города, под синим куполом, ждёт женщина в маске. На этот раз одна — если не считать её Пустых.|Eski shahar maydonida, ko'k gumbaz tagida niqobli ayol kutib turibdi. Bu safar yolg'iz — Bo'shlarini hisobga olmasa.`],
    ['masked', `You didn't turn back.|Всё-таки не повернул.|Baribir qaytmading.`],
    ['hero', `The song wouldn't let me.|Песня не пустила.|Qo'shiq qo'ymadi.`],
    ['masked', `I know. That song doesn't let anyone go. They sang it at me every year, from the time I was eight.|Знаю. Эта песня никого не отпускает. Мне её пели каждый год. С восьми лет.|Bilaman. Bu qo'shiq hech kimni qo'yib yubormaydi. Uni menga har yili kuylashardi. Sakkiz yoshimdan.`],
    () => f.maskedAns === 'threat' && ['masked', `You raised a hook to me in the dark. You didn't know. I forgave you before you'd lowered it.|В темноте ты поднял на меня крюк. Ты не знал. Я простила тебя раньше, чем ты его опустил.|Qorong'ida menga ilmoq ko'tarding. Bilmasding. Uni tushirmasingdan oldin kechirib bo'lgandim.`],
    () => f.maskedAns === 'give' && ['masked', `You gave my Hollow your water. You didn't know it was me. That's how I knew it was still you.|Ты отдал моим Пустым свою воду. Ты не знал, что это я. Так я и поняла, что ты — всё ещё ты.|Bo'shlarimga suvingni berding. Men ekanimni bilmasding. Shundan bildimki, sen hamon o'shasan.`],
    ['', `She unties the mask. A woman of nearly thirty. A white scar from cheekbone to jaw. And your mother's eyes. You don't know where that thought came from. But they are your mother's eyes.|Она развязывает маску. Женщина под тридцать. Белый шрам от скулы до подбородка. И мамины глаза. Ты не знаешь, откуда эта мысль. Но глаза — мамины.|U niqobini yechadi. O'ttizlarga borib qolgan ayol. Yonog'idan iyagigacha oq chandiq. Va onangning ko'zlari. Bu fikr qayerdan kelganini bilmaysan. Lekin ko'zlar — onangniki.`],
    ['oydin', `Hello, Toychoq.|Здравствуй, Тойчок.|Salom, Toychoq.`],
    ['', `Toychoq. "Little foal." Only your family ever called you that. Mother, Father. Nobody, since you were twelve.|Тойчок. «Жеребёночек». Так тебя звали только дома. Мама, отец. И никто — с тех пор, как тебе было двенадцать.|Toychoq. Seni faqat uyda shunday chaqirishardi. Onang, otang. O'n ikki yoshingdan beri esa hech kim.`],
    ['hero', `How do you know that name?|Откуда ты знаешь это имя?|Bu ismni qayerdan bilasan?`],
    ['oydin', `You really don't remember. I knew you wouldn't. I hoped anyway.|Ты правда не помнишь. Я знала, что не вспомнишь. А всё равно надеялась.|Rostdan eslamaysan. Eslamasligingni bilardim. Baribir umid qilgandim.`],
    ['oydin', `I'm Oydin. Your little sister.|Я Ойдин. Твоя младшая сестра.|Men Oydinman. Singlingman.`],
    ['', `Silence. Somewhere water drips. You try to count the drops and can't get to three.|Тишина. Где-то капает вода. Ты пытаешься считать капли — и не можешь досчитать до трёх.|Jimlik. Qayerdadir suv tomchilaydi. Tomchilarni sanamoqchi bo'lasan — uchgacha ham sanay olmaysan.`],
    ['hero', `I don't have a sister.|У меня нет сестры.|Mening singlim yo'q.`],
    ['oydin', `You do. You put me on your shoulders to steal the neighbour's apricots. When I was scared of the dark, you told me the one about the foal.|Есть. Ты сажал меня на плечи, чтобы воровать соседские абрикосы. А когда я боялась темноты, рассказывал про жеребёнка.|Bor. Qo'shnining o'rigini o'g'irlash uchun meni yelkangga mindirarding. Qorong'idan qo'rqsam, toychoq haqidagi ertakni aytib berarding.`],
    () => R().mem.m2_apricot && ['', `Small hands, sticky and gold. Behind the woodpile.|Маленькие руки, липкие и золотые. За поленницей.|Kichkina qo'llar, yopishqoq va tillarang. O'tin ortida.`],
    () => R().mem.m2_dark && ['', `A small hand tearing the seam of your sleeve.|Маленькая рука, от которой трещит шов на рукаве.|Yengingning chokini so'kib yuborgan kichkina qo'l.`],
    ['oydin', `You were twelve. The family was drowning in tithe debt. Mother sat crying over the debt book.|Тебе было двенадцать. Семья тонула в долгах за десятину. Мама сидела над долговой книгой и плакала.|O'n ikki yoshda eding. Oilamiz ushr qarziga botib ketgandi. Onam qarz daftari ustida yig'lab o'tirardi.`],
    ['oydin', `So you went to the Singers and sold the most precious thing you had, to close the debt.|И ты пошёл к Певцам и продал самое дорогое, что у тебя было. Чтобы закрыть долг.|Shunda sen Xonandalarga borib, eng aziz narsangni sotding. Qarzni yopish uchun.`],
    ['oydin', `The most precious thing was me. Your memory of me. They sang it into a tumar, and you forgot me. All of me.|Самым дорогим была я. Твоя память обо мне. Её выпели в тумар, и ты меня забыл. Целиком.|Eng azizi men edim. Men haqimdagi xotirang. Uni tumarga kuylab olishdi va sen meni unutding. Butunlay.`],
    ['sado', `…Ravshan. The thing you sold at twelve. The most precious thing. It was her.|…Равшан. То, что ты продал в двенадцать. Самое дорогое. Это была она.|…Ravshan. O'n ikki yoshingda sotgan narsang. Eng azizi. Bu u ekan.`],
    ['oydin', `And the debt didn't close. Rustam-aka wrote me into the book anyway. The tithe was counted twice. You paid with a memory. I paid with myself.|А долг не закрылся. Рустам-ака всё равно вписал меня в книгу. Десятину посчитали дважды. Ты заплатил памятью. А я — собой.|Qarz esa yopilmadi. Rustam aka baribir meni daftarga yozdi. Ushr ikki marta sanaldi. Sen xotira bilan to'lading. Men esa o'zim bilan.`],
    ['oydin', `They took me to the Well at eight. For twenty years, every Night of Payment, the Singers sang memories out of me. Last winter I escaped.|В восемь лет меня забрали в Колодец. Двадцать лет каждую Ночь Уплаты Певцы выпевали из меня память. Прошлой зимой я сбежала.|Sakkiz yoshimda meni Quduqqa olib ketishdi. Yigirma yil har To'lov kechasi Xonandalar mendan xotira kuylab olishdi. O'tgan qish qochib chiqdim.`],
    () => R().mem.m2_book && ['', `"Not her. She's eight." Your mother's finger on the line.|«Только не её. Ей восемь». Мамин палец на строчке.|«Uni emas. U sakkiz yoshda». Onangning barmog'i qatorda.`],
    () => f.rustamMem >= 4 && ['', `"I wrote you into the book." You heard those words in the den, in Rustam's memory. You didn't understand who they were about.|«Это я вписал тебя в книгу». Ты слышал эти слова в логове, в памяти Рустама. И не понял, о ком они.|«Seni daftarga men yozganman». Bu so'zlarni kontrabandachilar inida, Rustamning xotirasida eshitgansan. Kim haqida ekanini tushunmagansan.`],
    () => f.oydinName && ['', `The girl in the cellar, in Rustam's memory. You saw her through his eyes, and you didn't know her.|Девочка в подвале из памяти Рустама. Ты видел её его глазами — и не узнал.|Rustamning xotirasidagi yerto'ladagi qizcha. Uni uning ko'zlari bilan ko'rding — va tanimading.`],
    ['hero', `…I didn't know.|…Я не знал.|…Bilmasdim.`],
    ['oydin', `Of course you didn't. You couldn't. That's what I hate most of all.|Конечно, не знал. И не мог знать. Это я и ненавижу больше всего.|Albatta, bilmasding. Bilolmasding ham. Eng yomon ko'rganim ham shu.`],
    ['oydin', `…Wait.|…Подожди.|…Shoshma.`],
    ['', `She steps closer. She looks at you, but not at your face. Behind it. The light at your shoulder goes very still.|Она подходит ближе. Смотрит на тебя, но не в лицо. Сквозь него. Огонёк у твоего плеча замирает.|U yaqinroq keladi. Senga qaraydi, lekin yuzingga emas. Uning ortiga. Yelkang yonidagi nur qotib qoladi.`],
    ['oydin', `You're not alone in there. Who is looking at me?|Ты там не один. Кто на меня смотрит?|Ichingda yolg'iz emassan. Menga kim qarayapti?`],
    ['sado', `Don't. Don't let her look. Ravshan, she's looking at me. Nobody looks at me. Nobody can.|Не надо. Не давай ей смотреть. Равшан, она смотрит на меня. На меня никто не смотрит. Никто не может.|Qo'yma. Qarashiga yo'l qo'yma. Ravshan, u menga qarayapti. Menga hech kim qaramaydi. Hech kim qarolmaydi.`],
    ['oydin', `Someone small. Frightened of me. …I know that kind of frightened.|Кто-то маленький. Боится меня. …Я знаю такой страх.|Kimdir kichkina. Mendan qo'rqyapti. …Bunaqa qo'rquvni bilaman.`]
  ];
  play(intro, () => ask(`"Who is looking at me?"|«Кто на меня смотрит?»|«Menga kim qarayapti?»`, [
    { label: `"A voice. She helps me. She doesn't know who she is."|«Голос. Она мне помогает. Сама не знает, кто она.»|«Bir ovoz. Menga yordam beradi. Kimligini o'zi ham bilmaydi.»`, id: 'truth' },
    { label: `"Nobody. It's the song."|«Никто. Это песня.»|«Hech kim. Bu qo'shiq.»`, id: 'lie' },
    { label: `Say nothing.|Промолчать.|Indamaslik.`, id: 'silent' }
  ], a => {
    f2('oydinAns', a.id);
    const answer = {
      truth: [
        ['oydin', `I didn't know who I was either, for years. Be kind to her, Toychoq. Someone should be kind to the ones who don't know.|Я тоже годами не знала, кто я. Будь с ней ласков, Тойчок. Хоть кто-то должен быть ласков с теми, кто не знает.|Men ham yillab kimligimni bilmay yurganman. Unga mehribon bo'l, Toychoq. Bilmaydiganlarga hech bo'lmasa bir kishi mehribon bo'lsin.`],
        ['sado', `…She said "kind". She said it to me. Like she meant me.|…Она сказала «ласков». Сказала мне. Будто это про меня.|…U «mehribon» dedi. Menga aytdi. Go'yo men haqimda.`]
      ],
      lie: [
        ['oydin', `Liar. You always pulled your ear when you lied.|Врёшь. Ты всегда дёргал себя за ухо, когда врал.|Yolg'on. Yolg'on gapirsang, doim qulog'ingni tortarding.`],
        ['', `Your hand is at your ear. You lower it.|Твоя рука уже у уха. Ты её опускаешь.|Qo'ling qulog'ingda. Uni tushirasan.`],
        ['sado', `…You do. You really do pull your ear.|…А ведь правда. Ты дёргаешь себя за ухо.|…Rost-a. Rostdan ham qulog'ingni tortasan.`]
      ],
      silent: [
        ['oydin', `All right. Keep her. You were always good at keeping secrets. Mostly mine.|Ладно. Оставь её при себе. Ты всегда умел хранить секреты. В основном мои.|Mayli. O'zingda saqla. Sen doim sir saqlashni bilarding. Asosan meniklarini.`]
      ]
    }[a.id];
    if (a.id === 'truth') trust(1);
    if (a.id === 'lie') trust(-1);
    play(answer.concat([
      ['sado', `When she said "Toychoq", I turned round. Inside you. As if someone had called my name. It isn't my name. Is it?|Когда она сказала «Тойчок», я обернулась. Там, внутри тебя. Будто позвали меня. Но это же не моё имя. Правда?|U «Toychoq» deganda, men o'girildim. Ichingda. Go'yo meni chaqirishgandek. Lekin bu mening ismim emas-ku. A?`],
      ['oydin', `I have the founders' tumars. I took them from the Singers' vault on the Night of Payment. The song that chains the Sleeper is in them.|Тумары основателей у меня. Я забрала их из хранилища Певцов в Ночь Уплаты. В них песня, которой скован Спящий.|Asoschilar tumarlari menda. Ularni To'lov kechasi Xonandalar xazinasidan oldim. Uxlovchini kishanlagan qo'shiq ularda.`],
      ['sado', `That's what Shirin's song wants from you. The relics. She has them.|Вот чего требует от тебя песня Ширин. Реликвии. Они у неё.|Shirinning qo'shig'i sendan shuni talab qilyapti. O'sha tumarlarni. Ular unda.`],
      ['oydin', `I'll break them at the Heart. The Sleeper will wake, and everything he swallowed goes back to its owners. Every memory. Every child sung empty.|Я разобью их у Сердца. Спящий проснётся, и всё, что он проглотил, вернётся к хозяевам. Каждое воспоминание. Каждый выпетый ребёнок.|Ularni Yurakda sindiraman. Uxlovchi uyg'onadi va u yutgan hamma narsa egasiga qaytadi. Har bir xotira. Kuylab bo'shatilgan har bir bola.`],
      ['oydin', `And your memory of me, Toychoq. You'll have me back.|И твоя память обо мне, Тойчок. Я к тебе вернусь.|Men haqimdagi xotirang ham, Toychoq. Senga qaytaman.`],
      ['hero', `And the city?|А город?|Shahar-chi?`],
      ['oydin', `The city stands on a stolen sleep. When he wakes, it falls into the water. The Tail goes first. It's the lowest.|Город стоит на краденом сне. Когда он проснётся, город уйдёт под воду. Хвост — первым. Он ниже всех.|Shahar o'g'irlangan uyqu ustida turibdi. U uyg'onganda shahar suvga cho'kadi. Avval Dum. U hammadan pastda.`],
      ['oydin', `I know. I've thought about it for twenty years. I've decided.|Я знаю. Я двадцать лет об этом думала. Я решила.|Bilaman. Yigirma yil shu haqda o'yladim. Qaror qildim.`],
      () => hollowEyes() && ['oydin', `Look at you. Three quarters gone. Shirin's song is eating you the way the Well ate me. Come with me and it stops. When he wakes, every song breaks.|Посмотри на себя. Пуст на три четверти. Песня Ширин ест тебя, как Колодец ел меня. Пойдём со мной — и это кончится. Когда он проснётся, все песни оборвутся.|O'zingga qara. To'rtdan uching ketib bo'libdi. Shirinning qo'shig'i seni Quduq meni yegandek yeyapti. Men bilan yur — bu tugaydi. U uyg'onganda hamma qo'shiqlar uziladi.`],
      ['sado', `Ravshan, listen. If you go with her, she wakes the Sleeper and the city drowns. The Tail with it.|Равшан, послушай. Пойдёшь с ней — она разбудит Спящего, и город утонет. И Хвост вместе с ним.|Ravshan, quloq sol. U bilan ketsang — Uxlovchini uyg'otadi va shahar cho'kadi. Dum ham birga.`],
      ['sado', `If you take the tumars, Shirin's song in you goes quiet, and she's left with nothing. Or just let her go. …I don't know what's right. I really don't.|Заберёшь тумары — песня Ширин в тебе утихнет, а она останется ни с чем. Или просто отпусти её. …Я не знаю, как правильно. Правда не знаю.|Tumarlarni olsang — ichingdagi Shirinning qo'shig'i tinchiydi, u esa quruq qoladi. Yoki shunchaki qo'yib yubor. …Qaysi biri to'g'ri, bilmayman. Rostdan bilmayman.`]
    ]), () => oydinChoice(done));
  }));
}

function oydinChoice(done) {
  const f = F();
  hub(`Oydin|Ойдин|Oydin`, [
    { label: `— Why didn't you come for me sooner?|— Почему ты раньше не пришла?|— Nega oldinroq kelmading?`, lines: [
      ['oydin', `I did. Last winter, right after I escaped. I stood outside your door. You came out, nodded at me like a stranger, and went off to collect the tithe.|Приходила. Прошлой зимой, сразу как сбежала. Стояла у твоей двери. Ты вышел, кивнул мне, как чужой, и пошёл собирать десятину.|Kelganman. O'tgan qish, qochganimdanoq. Eshiging oldida turdim. Sen chiqding, menga begonadek bosh irg'ading-u, ushr yig'gani ketding.`],
      ['oydin', `After that I didn't come again. I put on the mask.|После этого я больше не приходила. Надела маску.|Shundan keyin boshqa kelmadim. Niqob taqdim.`]
    ] },
    { label: `— Rustam-aka. Did you empty him?|— Рустам-ака… это ты его опустошила?|— Rustam akani sen bo'shatdingmi?`, lines: [
      ['oydin', `Yes. On the Night of Payment, at the vault door. He wrote me into the book. So I took everything he had. And the founders' tumars with it.|Я. В Ночь Уплаты, у двери хранилища. Он вписал меня в книгу. Вот я и забрала у него всё. А заодно и тумары основателей.|Men. To'lov kechasi, xazina eshigi oldida. U meni daftarga yozgan. Shuning uchun undan hamma narsani oldim. Bir yo'la asoschilar tumarlarini ham.`],
      () => f.rustamMem >= 4 && ['sado', `Ravshan… you saw that memory. It didn't happen like that. He gave her the key himself. She doesn't know.|Равшан… ты же видел это воспоминание. Всё было не так. Он сам отдал ей ключ. А она не знает.|Ravshan… o'sha xotirani ko'rding-ku. Bunaqa bo'lmagan. Kalitni unga o'zi bergan. U esa bilmaydi.`]
    ] },
    { label: `— What's the tumar under your collarbone?|— Что за тумар у тебя под ключицей?|— O'mroving ostidagi tumar nima?`, lines: [
      ['oydin', `The one thing I have left of you. You carrying me on your back across the whole Tail. I taste it once a year. Each time it's a little paler.|Единственное, что у меня от тебя осталось. Ты несёшь меня на спине через весь Хвост. Я пробую его раз в год. И каждый раз оно чуть бледнее.|Sendan menga qolgan yagona narsa. Sen meni orqangda butun Dum bo'ylab ko'tarib ketyapsan. Uni yilda bir marta totaman. Har safar u sal xiraroq.`]
    ] },
    { label: `— Isn't there another way?|— Неужели нет другого пути?|— Boshqa yo'l yo'qmi?`, lines: [
      ['oydin', `Shirin wants to sing the whole Tail empty in one night so he sleeps another hundred years. Tilla-bek wants a new chain and a market for memory.|Ширин хочет за одну ночь выпеть весь Хвост, чтобы он проспал ещё сто лет. Тилла-бек хочет новую цепь и рынок памяти.|Shirin u yana yuz yil uxlasin deb butun Dumni bir kechada kuylab bo'shatmoqchi. Tillabek yangi zanjir va xotira bozorini istaydi.`],
      ['oydin', `You tell me which of those is better than a drowned city.|Вот и скажи, что из этого лучше утопленного города.|Qani, ayt-chi, bulardan qaysi biri cho'kkan shahardan yaxshi.`]
    ] }
  ], [
    { label: `"I'll come with you to the Heart."|«Я пойду с тобой к Сердцу.»|«Sen bilan Yurakka boraman.»`, id: 'joined' },
    { label: `"Give me the tumars. The song is eating me alive."|«Отдай тумары. Песня меня заживо ест.»|«Tumarlarni ber. Qo'shiq meni tiriklayin yeyapti.»`, id: 'took' },
    { label: `"Go. Your own way."|«Иди. Своей дорогой.»|«Bor. O'z yo'lingdan.»`, id: 'let' },
    { label: `Hold out your hand: let her taste Rustam's last memory.|Протянуть руку: пусть попробует последнюю память Рустама.|Qo'lni cho'zish: Rustamning so'nggi xotirasini totib ko'rsin.`, id: 'shown',
      lock: f.rustamMem >= 4 ? lock50() : `You never tasted that memory.|Ты не пробовал этой памяти.|Bu xotirani totmagansan.` },
    { label: `Touch the tumar under her collarbone. Taste what she kept of you.|Коснуться тумара у неё под ключицей. Попробовать то, что она сохранила о тебе.|O'mrovi ostidagi tumarga tegish. U sendan nima asraganini totib ko'rish.`, cost: 8, id: 'tasted' }
  ], o => {
    f2('oydin', o.id);
    f2('relics', o.id === 'took' ? 'ravshan' : 'oydin');
    const leave = [
      ['', `She ties the mask back on and walks off into the salt-white streets, humming Alla. Sado doesn't hum along. You can feel her not humming.|Она снова завязывает маску и уходит в белые от соли улицы, напевая «Аллу». Садо не подпевает. Ты чувствуешь, как она не подпевает.|U niqobini qayta bog'lab, «Alla»ni xirgoyi qilgancha tuzdan oqargan ko'chalarga kirib ketadi. Sado jo'r bo'lmaydi. Uning jo'r bo'lmayotganini sezib turasan.`]
    ];
    const coda = [
      ['sado', `Ravshan. You had a sister. You have a sister. …I'm glad. I think I'm glad. I'm going to be quiet for a bit.|Равшан. У тебя была сестра. Есть сестра. …Я рада. Кажется, рада. Я немножко помолчу.|Ravshan. Singling bor edi. Singling bor. …Xursandman. Shekilli, xursandman. Bir oz jim turaman.`]
    ];
    if (o.id === 'joined') {
      rep('remember', 3); rep('singers', -2, true);
      play([
        ['hero', `I'll come.|Я пойду с тобой.|Sen bilan boraman.`],
        ['oydin', `…Just like that? You were always like that. You'd climb any wall after me if I said there were apricots on the other side.|…Вот так сразу? Ты всегда был такой. Полез бы за мной на любую стену, скажи я только, что за ней абрикосы.|…Shunchaki-ya? Doim shunaqa eding. Narigi tomonda o'rik bor desam, ortimdan har qanday devorga tirmashib chiqarding.`],
        ['oydin', `Then we go down to the Heart together. When he wakes, you'll remember me. And I can stop remembering for both of us.|Тогда идём к Сердцу вместе. Когда он проснётся, ты меня вспомнишь. А я наконец перестану помнить за двоих.|Unda Yurakka birga tushamiz. U uyg'onganda meni eslaysan. Men esa nihoyat ikkimiz uchun eslashni bas qilaman.`],
        ['sado', `Ravshan. When he wakes, the city drowns. The Tail drowns first.|Равшан. Когда он проснётся, город утонет. Хвост — первым.|Ravshan. U uyg'onganda shahar cho'kadi. Birinchi bo'lib Dum.`],
        ['sado', `…I'm not saying no. I'm saying you know. Tell me you know.|…Я не говорю «нет». Я говорю: ты знаешь. Скажи, что знаешь.|…«Yo'q» demayapman. Bilasan, deyapman. Bilaman, de.`],
        ['hero', `I know.|Знаю.|Bilaman.`]
      ].concat(coda), done);
    } else if (o.id === 'took') {
      rep('remember', -2); rep('singers', 1, true);
      play([
        ['hero', `Give me the founders' tumars.|Отдай мне тумары основателей.|Asoschilar tumarlarini menga ber.`],
        ['oydin', `Or what, Toychoq? You'll hook me? Sing me empty? I've had worse from better.|А иначе что, Тойчок? Подцепишь крюком? Выпоешь меня? Мне и похуже доставалось — и от людей посерьёзнее.|Bo'lmasa nima, Toychoq? Ilmoqqa ilasanmi? Kuylab bo'shatasanmi? Bundan battarini sendan zo'rlardan ko'rganman.`],
        ['hero', `Or nothing. I'm asking. Shirin's song eats me until I find them. You know what it does.|Ничего. Я прошу. Песня Ширин будет жрать меня, пока я их не найду. Ты знаешь, как это бывает.|Hech narsa. So'rayapman. Ularni topmagunimcha Shirinning qo'shig'i meni yeyaveradi. U nima qilishini bilasan.`],
        ['', `She looks at you a long time. At you, and behind you.|Она долго смотрит на тебя. На тебя — и сквозь тебя.|U senga uzoq tikiladi. Senga — va ortingga.`],
        ['oydin', `…For her. Not for you. The one in there is frightened, and she's frightened of me. Take them.|…Ради неё. Не ради тебя. Та, что внутри, боится. Меня боится. Бери.|…Uning uchun. Sen uchun emas. Ichingdagi qo'rqyapti. Mendan qo'rqyapti. Ol.`],
        ['', `Seven tumars bundled in black cloth. Far heavier than wax should be. They hum against your ribs like a hive.|Семь тумаров, завёрнутых в чёрную ткань. Куда тяжелее, чем бывает воск. Гудят у рёбер, как улей.|Qora lattaga o'ralgan yettita tumar. Mumdan ancha og'ir. Qovurg'alaringga tegib, ari uyasidek g'uvillaydi.`],
        ['', `The song in your chest goes quiet, the way a dog goes quiet when its master comes home.|Песня в груди стихает — так стихает собака, когда хозяин возвращается домой.|Ko'ksingdagi qo'shiq tinchiydi — egasi uyga qaytganda it shunday tinchiydi.`, () => { addVoid(-5, `the Pledge Song eases|Песня залога стихает|Garov qo'shig'i tinchidi`); know(`You carry the founders' tumars|Тумары основателей у тебя|Asoschilar tumarlari senda`); }],
        ['oydin', `He'll wake anyway. They only slow him down. And you'll come to me in the end, Toychoq. Because you'll want to remember.|Он всё равно проснётся. Они его только задерживают. А ты в конце концов придёшь ко мне, Тойчок. Потому что захочешь вспомнить.|U baribir uyg'onadi. Ular faqat sekinlashtiradi. Sen esa oxiri baribir menga kelasan, Toychoq. Chunki eslashni xohlaysan.`]
      ].concat(leave, coda), done);
    } else if (o.id === 'let') {
      rep('remember', 1); trust(1);
      play([
        ['hero', `Go.|Иди.|Bor.`],
        ['oydin', `You let me go without remembering me. So something in you remembers anyway.|Ты отпускаешь меня, хотя не помнишь. Значит, что-то в тебе всё-таки помнит.|Meni eslamay turib qo'yib yuboryapsan. Demak, ichingda nimadir baribir eslaydi.`],
        ['oydin', `See you at the Heart, Toychoq. Or in the dream. Whichever comes first.|Увидимся у Сердца, Тойчок. Или во сне. Как выйдет.|Yurakda ko'rishamiz, Toychoq. Yoki tushda. Qaysi biri oldin bo'lsa.`]
      ].concat(leave, coda), done);
    } else if (o.id === 'shown') {
      trust(2); rep('remember', 1, true); f2('oydinDoubt', 1);
      play([
        ['', `You hold out your hand, and the taste of Rustam's memory rises in you: the vault, the key, an old man's relief.|Ты протягиваешь руку, и в тебе поднимается вкус памяти Рустама: хранилище, ключ, облегчение старика.|Qo'lingni cho'zasan va ichingda Rustam xotirasining ta'mi ko'tariladi: xazina, kalit, cholning yengil tortgani.`],
        ['', `She takes your wrist. You let her. She tastes it through your skin, the way only the best Singers can.|Она берёт тебя за запястье. Ты не мешаешь. Она пробует память прямо через кожу — так умеют только лучшие Певцы.|U bilagingdan ushlaydi. Qarshilik qilmaysan. U xotirani teri orqali totadi — buni faqat eng zo'r Xonandalar eplaydi.`],
        ['oydin', `He gave it to me. I thought I stole it. For a whole year I've thought I beat him.|Он сам мне его отдал. А я думала, что украла. Целый год думала, что одолела его.|Uni menga o'zi bergan ekan. Men esa o'g'irladim deb yurgandim. Butun bir yil uni yengdim deb o'yladim.`],
        ['oydin', `"Take it out of me too." He didn't want to remember me. Or he couldn't bear to. …That's not the same thing, is it.|«И из меня тоже забери». Он не хотел меня помнить. Или не мог вынести. …А это ведь не одно и то же.|«Mendan ham olib ket». U meni eslashni istamagan. Yoki bunga chiday olmagan. …Bu bir xil narsa emas-ku, a?`],
        ['oydin', `I emptied him for revenge, and it was a mercy. For twenty years I was sure of everything. Not now. Thank you, Toychoq. I think I hate you for it.|Я опустошила его из мести, а вышла милость. Двадцать лет я была уверена во всём. А теперь — нет. Спасибо, Тойчок. Кажется, я тебя за это ненавижу.|Uni o'ch olish uchun bo'shatdim, rahm bo'lib chiqdi. Yigirma yil hamma narsaga ishonchim komil edi. Endi unday emas. Rahmat, Toychoq. Shekilli, shuning uchun sendan nafratlanaman.`],
        ['oydin', `I'll keep the tumars. But I won't break them yet. Not until I've looked at what I'm about to drown.|Тумары я оставлю себе. Но разбивать пока не стану. Сначала посмотрю на то, что собираюсь утопить.|Tumarlar menda qoladi. Lekin hozircha sindirmayman. Avval cho'ktirmoqchi bo'lgan narsamga bir qarab olay.`]
      ].concat(leave, coda), done);
    } else {
      taste(`her memory|её память|uning xotirasi`); rep('remember', 1, true);
      play([
        ['oydin', `You want to taste it? Me, from the inside? …It wears every time. I taste it once a year. I've been saving it.|Хочешь попробовать? Меня изнутри? …Оно стирается с каждым разом. Я пробую раз в год. Берегу.|Totmoqchimisan? Meni ichimdan? …U har gal yeyiladi. Men yilda bir marta totaman. Asrab yuraman.`],
        ['oydin', `Go on. You've a right. It's as much yours as mine. It'll cost you as much as it costs me.|Давай. Ты имеешь право. Оно столько же твоё, сколько моё. И обойдётся тебе так же, как мне.|Qani. Haqqing bor. U menikidek seniki ham. Senga ham menga tushgandek qimmatga tushadi.`],
        ['', `She opens her collar. The tumar is sewn under the skin, a raised triangle of light. You touch it.|Она расстёгивает ворот. Тумар зашит под кожу — выпуклый треугольник света. Ты касаешься его.|U yoqasini ochadi. Tumar teri ostiga tikilgan — bo'rtib turgan nurli uchburchak. Unga qo'l tekkizasan.`],
        ['memory', `You're eight. Your brother is carrying you across the whole Tail on his back because you twisted your ankle. You laugh into the back of his neck. He grumbles, but he doesn't put you down.|Тебе восемь. Ты подвернула ногу, и брат тащит тебя на спине через весь Хвост. Ты смеёшься ему в затылок. Он ворчит, но на землю не спускает.|Sakkiz yoshdasan. Oyog'ing qayrilgan, akang seni orqalab butun Dum bo'ylab ko'tarib ketyapti. Uning ensasiga kulasan. U to'ng'illaydi, lekin yerga tushirmaydi.`],
        ['memory', `He's twelve. He smells of bread and dust. He says: "Forty steps to home. Count with me." You count. It's the best thing you have.|Ему двенадцать. Он пахнет хлебом и пылью. «До дома сорок шагов. Считай со мной». Ты считаешь. Лучше этого у тебя ничего нет.|U o'n ikki yoshda. Undan non va chang hidi keladi. «Uygacha qirq qadam. Men bilan sana», deydi. Sanaysan. Senda bundan yaxshi narsa yo'q.`],
        ['sado', `…thirty-nine. Forty.|…тридцать девять. Сорок.|…o'ttiz to'qqiz. Qirq.`],
        ['sado', `…Why was I counting with you? I wasn't there. But I was counting.|…Почему я считала вместе с тобой? Меня там не было. А я считала.|…Nega sen bilan birga sanadim? Men u yerda yo'q edim-ku. Lekin sanadim.`],
        ['oydin', `Now you've worn it too. Good. It was lonely, being the only one.|Теперь и ты его чуть-чуть стёр. Хорошо. Одной было одиноко.|Endi u sen totganingdan ham bir oz xiralashdi. Yaxshi. Shu paytgacha bir o'zim edim. Yolg'izlik og'ir ekan.`]
      ].concat(leave, coda), done);
    }
  });
}

/* =====================================================================
   19 · a2_well — The Founders' Well
   ===================================================================== */
LAND('a2_well', {
  name: `The Founders' Well|Колодец основателей|Asoschilar qudug'i`,
  sub: `Where the first memories were poured into him|Здесь в него влили первую память|Unga ilk xotiralar shu yerda quyilgan`,
  start: [
    ['', `A shaft wider than the Ark drops into black water that doesn't move. A stair spirals down the walls. On every step, a name, scratched out.|Шахта шире Арка уходит вниз, к чёрной неподвижной воде. По стенам вьётся лестница. На каждой ступени — соскобленное имя.|Arkdan ham keng quduq qimir etmaydigan qora suvga tushib ketgan. Devorlari bo'ylab zinapoya aylanib tushadi. Har bir pog'onada qirib tashlangan bir ism.`],
    ['sado', `The water's so still. Like a mirror nobody's allowed to look into.|Вода такая неподвижная. Как зеркало, в которое никому нельзя смотреть.|Suv shunaqa jim. Hech kimga qarash mumkin bo'lmagan oynadek.`]
  ],
  mid: done => play([
    ['', `At a landing the stair dips to the water. You look down. Your face looks back: tired, older than you thought.|На площадке лестница спускается к самой воде. Ты смотришь вниз. Оттуда смотрит твоё лицо — усталое, старше, чем ты думал.|Bir maydonchada zinapoya suvgacha tushadi. Pastga qaraysan. U yerdan yuzing qaraydi — charchagan, o'ylaganingdan qariroq.`],
    ['', `And beside it, close, as if leaning on your shoulder: a girl's face. Eight, maybe. Two braids. She's watching you, not the water.|А рядом, совсем близко, будто прислонилась к твоему плечу, — лицо девочки. Лет восьми. Две косички. Она смотрит не в воду, а на тебя.|Yonida esa, juda yaqin, go'yo yelkangga bosh qo'ygandek, bir qizchaning yuzi. Sakkiz yoshlar chamasi. Ikki o'rim soch. U suvga emas, senga qarab turibdi.`],
    ['', `You turn round. Nobody. When you look again there's only your face and the wisp of light at your shoulder.|Ты оборачиваешься. Никого. Смотришь снова — только твоё лицо и огонёк у плеча.|O'girilasan. Hech kim yo'q. Qayta qaraysan — faqat yuzing va yelkang yonidagi nur.`],
    ['sado', `Did you see something? You went cold. I felt you go cold.|Ты что-то увидел? Ты похолодел. Я почувствовала.|Biror narsa ko'rdingmi? Sovib ketding. Sezdim.`]
  ], () => ask(`The black water|Чёрная вода|Qora suv`, [
    { label: `"A girl. Right next to me."|«Девочку. Прямо рядом со мной.»|«Bir qizchani. Shundoq yonimda.»`, id: 'tell' },
    { label: `"Nothing."|«Ничего.»|«Hech narsa.»`, id: 'no' }
  ], o => {
    if (o.id === 'tell') {
      trust(1);
      play([
        ['sado', `Next to you? …There's nobody next to you. Only me. And I'm nobody.|Рядом с тобой? …Рядом с тобой никого нет. Только я. А я — никто.|Yoningdami? …Yoningda hech kim yo'q. Faqat men. Men esa hech kimman.`],
        ['sado', `Two braids, you said? …You didn't say. I don't know why I said that.|С двумя косичками, говоришь? …Ты этого не говорил. Не знаю, почему я так сказала.|Ikki o'rim soch dedingmi? …Sen buni demading. Nega shunday deganimni bilmayman.`]
      ], done);
    } else play([['sado', `You're pulling your ear, Ravshan.|Ты дёргаешь себя за ухо, Равшан.|Qulog'ingni tortyapsan, Ravshan.`]], done);
  })),
  stones: [
    `"We were seven caravan-bashi, and thirsty. The spirit was kind. Kindness is a door left open." Signed with seven marks.|«Нас было семеро караван-баши, и нас мучила жажда. Дух был добр. А доброта — это незапертая дверь». Подписано семью знаками.|«Biz yetti karvonboshi edik, chanqab qolgandik. Ruh mehribon edi. Mehribonlik — ochiq qolgan eshik». Yetti belgi bilan imzolangan.`,
    `"Captives are cheaper than tales. A tale must be made. A captive need only be sung." Scratched out, but cut deep enough to read.|«Пленники дешевле сказаний. Сказание надо сложить. Пленника достаточно выпеть». Соскоблено, но вырезано так глубоко, что читается.|«Asir dostondan arzon. Dostonni to'qish kerak. Asirni esa kuylab olsang bas». Qirib tashlangan, lekin shunchalik chuqur o'yilganki, o'qisa bo'ladi.`,
    `"The song that holds him: each of us keeps a seventh of it in his own memory, so none can sell the others." Below, another hand: "They sold each other anyway."|«Песню, что его держит, каждый из нас хранит в своей памяти по седьмой доле — чтобы никто не продал остальных». Ниже, другой рукой: «Всё равно продали».|«Uni tutib turgan qo'shiqning yettidan birini har birimiz o'z xotiramizda saqlaymiz — hech kim boshqalarni sotolmasin deb». Tagida boshqa xat bilan: «Baribir bir-birini sotishdi».`,
    `"Heirs of the Seven: the Humo, the Saffron, the Salt, the Indigo, the Copper, the Silk, the Bone." The Saffron is scratched deeper than the rest.|«Наследники Семерых: Хумо, Шафран, Соль, Индиго, Медь, Шёлк, Кость». Шафран процарапан глубже остальных.|«Yettilarning vorislari: Humo, Za'faron, Tuz, Nil, Mis, Ipak, Suyak». Za'faron boshqalaridan chuqurroq tirnalgan.`
  ],
  memory: {
    id: 'm2_dutar',
    lines: [
      ['memory', `Your father's dutar. Two strings, one always a little flat. He plays Alla fast, like a dance, to make someone laugh.|Отцовский дутар. Две струны, одна всегда чуть ниже. Он играет «Аллу» быстро, как плясовую, — чтобы кого-то рассмешить.|Otangning dutori. Ikki tor, biri doim sal past. U kimnidir kuldirish uchun «Alla»ni tez, o'yinbop qilib chaladi.`],
      ['memory', `Someone small spins on the rug until she falls over, dizzy and shrieking. Your father plays slower. Slower. She's asleep on the rug.|Кто-то маленький кружится на ковре, пока не падает с визгом — голова кругом. Отец играет медленнее. Ещё медленнее. Она уже спит на ковре.|Kimdir kichkina gilamda pirillab aylanadi-yu, boshi aylanib, chinqirgancha yiqiladi. Otang sekinroq chaladi. Yana sekinroq. U gilamda uxlab qolgan.`],
      ['memory', `You carry her to bed. You mind her braids. She hates it when they catch.|Ты относишь её в постель. Бережёшь косички — она терпеть не может, когда они за что-то цепляются.|Uni o'rniga ko'tarib borasan. Sochini ehtiyot qilasan — o'rimlari ilinib qolsa, yomon ko'radi.`]
    ],
    after: () => sub2(`A flat string. I love the dutar. Especially out of tune. …That's a strange thing to love.|Расстроенная струна. Я люблю дутар. Особенно расстроенный. …Странно такое любить.|Past tor. Dutorni yaxshi ko'raman. Ayniqsa, sozi buzilganini. …G'alati narsani yaxshi ko'rar ekanman.`)
  },
  people: [{ look: 'hollow' }, { look: 'hollow', x: 12 }, { look: 'hollow', x: 24 }, { look: 'hollow', x: 36 }, { look: 'inspector', x: 54 }],
  exit: done => {
    const f = F();
    play([
      ['', `At the last landing a line of Hollow waits at the water's edge, very patiently, like a queue for bread. A Singer in a tall hat counts them with his staff.|На последней площадке, у самой воды, стоит очередь Пустых — терпеливая, как за хлебом. Певец в высокой шапке пересчитывает их посохом.|Oxirgi maydonchada, suv bo'yida Bo'shlar navbat kutib turibdi — non navbatidagidek sabr bilan. Baland qalpoqli Xonanda ularni hassasi bilan sanayapti.`],
      ['inspector', `Stand aside, yodchi. These belong to the Well. The water's bitter: he's hungry. A Hollow body still holds a little. The Well takes what's left.|Отойди, ёдчи. Эти принадлежат Колодцу. Вода горькая — значит, он голоден. В Пустом ещё кое-что осталось. Колодец заберёт остаток.|Chetga tur, yodchi. Bular Quduqniki. Suv achchiq — demak, u och. Bo'sh tanada hali ozgina narsa qolgan. Qolganini Quduq oladi.`],
      ['sado', `He's feeding them to it. Whole. They're just going to walk into the water.|Он скармливает их Колодцу. Целиком. Они просто войдут в воду.|U ularni Quduqqa yediryapti. Butunligicha. Ular shunchaki suvga kirib ketishadi.`],
      () => f.chain === 'carried' && ['', `Chain scars on their wrists. You carried those chains to the Tail, and the Tail rose up. The Singers took these people back anyway, more quietly.|На запястьях следы цепей. Ты отнёс те цепи в Хвост, и Хвост поднялся. А Певцы всё равно забрали этих людей — только тише.|Bilaklarida zanjir izlari. O'sha zanjirlarni Dumga sen olib chiqding va Dum qo'zg'aldi. Xonandalar esa bu odamlarni baribir olib ketishdi — faqat jimgina.`],
      () => f.chain === 'seal' && ['', `Chain scars on their wrists. You know the seal that locked those chains. It's in your belt.|На запястьях следы цепей. Ты знаешь печать, которой их запирали. Она у тебя за поясом.|Bilaklarida zanjir izlari. Ularni qulflagan muhrni bilasan. U belingda turibdi.`],
      () => f.chain === 'silent' && ['', `Chain scars on their wrists. The Tower of Silence. You said nothing then.|На запястьях следы цепей. Башня Молчания. Тогда ты промолчал.|Bilaklarida zanjir izlari. Sukunat minorasi. O'shanda indamagansan.`],
      () => hollowEyes() && ['inspector', `…You'd fit right into this line, yodchi, you know that? Another month of that song and I'll be counting you.|…А ты бы неплохо смотрелся в этой очереди, ёдчи. Знаешь? Ещё месяц с такой песней — и я буду считать тебя.|…Sen ham shu navbatda bemalol turarding, yodchi, bilasanmi? Shu qo'shiq bilan yana bir oy — seni ham sanayman.`]
    ], () => hub(`The Well's line|Очередь к Колодцу|Quduq navbati`, [
      { label: `— What happens to them in the water?|— Что с ними будет в воде?|— Suvda ularga nima bo'ladi?`, lines: [
        ['inspector', `Nothing. There just won't be any more of them. And the city holds out another week. A fair trade.|Ничего. Их просто больше не будет. А город продержится ещё неделю. Честный обмен.|Hech narsa. Shunchaki ular boshqa bo'lmaydi. Shahar esa yana bir hafta chidaydi. Halol savdo.`]
      ] },
      { label: `— Who were they?|— Кем они были?|— Ular kim bo'lgan?`, lines: [
        ['inspector', `Debtors. Hollow off the streets. Who can tell now? They can't.|Должники. Пустые с улиц. Кто теперь разберёт? Уж точно не они.|Qarzdorlar. Ko'chadagi Bo'shlar. Endi kim ajratadi? Ular o'zlari ham bilmaydi.`]
      ] },
      { label: `— Sado, what can we do?|— Садо, что мы можем сделать?|— Sado, nima qila olamiz?`, lines: [
        ['sado', `They follow tumars. Walk off and some will follow your satchel, but not for long. Burn one of your own memories and they'll all follow the light. But it'll cost you.|Они идут на тумары. Уйдёшь — часть потянется за твоей сумкой, но ненадолго. Сожжёшь своё воспоминание — за светом пойдут все. Только это тебе дорого обойдётся.|Ular tumarga ergashadi. Ketsang — bir qismi xaltang ortidan boradi, lekin uzoqqa emas. O'z xotirangdan birini yoqsang — nurga hammasi ergashadi. Faqat bu senga qimmatga tushadi.`],
          () => f.chain === 'seal' && ['sado', `Or… you've got Shirin's seal. A Singer won't argue with that.|Или… у тебя же печать Ширин. С ней Певец спорить не станет.|Yoki… senda Shirinning muhri bor-ku. Xonanda u bilan tortishmaydi.`]
      ] }
    ], [
      { label: `Lead the Hollow away after your satchel.|Увести Пустых за своей сумкой.|Bo'shlarni xaltang ortidan ergashtirib ketish.`, id: 'lead' },
      { label: `Burn one of your own memories to light their way up.|Сжечь одно из своих воспоминаний, чтобы осветить им путь наверх.|O'z xotirangdan birini yoqib, ularga tepaga yo'l yoritish.`, cost: 6, id: 'burn' },
      f.chain === 'seal' && { label: `Show the Inspector Shirin's seal.|Показать смотрителю печать Ширин.|Nozirga Shirinning muhrini ko'rsatish.`, id: 'seal' },
      { label: `Step aside. Let the Well have them.|Отойти. Пусть Колодец их забирает.|Chetga turish. Quduq olaversin.`, cost: 3, id: 'let' }
    ], o => {
      f2('wellLine', o.id);
      if (o.id === 'lead') {
        rep('tail', 1, true); rep('singers', -1, true); trust(1);
        play([
          ['inspector', `They'll follow you only as long as your satchel smells of tumars. Then they'll come back. They always come back.|Они пойдут за тобой, пока сумка пахнет тумарами. Потом вернутся. Они всегда возвращаются.|Xaltangdan tumar hidi kelib tursa, ortingdan yurishadi. Keyin qaytishadi. Ular doim qaytadi.`],
          ['', `Half of them drift back to the water before you reach the stairs. Half is not nothing.|Половина бредёт обратно к воде, прежде чем вы доходите до лестницы. Но половина — это не ноль.|Zinapoyaga yetmasingizdanoq yarmi suvga qaytib ketadi. Lekin yarmi ham kam emas.`]
        ], done);
      } else if (o.id === 'burn') {
        addVoid(6, `a memory burned|память сожжена|xotira yoqildi`); rep('tail', 2); rep('singers', -2, true); trust(2);
        play([
          ['', `You burn a memory. It flares up warm and gold, and the Hollow turn toward it like sunflowers. They follow the light up the stairs. Every one of them.|Ты сжигаешь воспоминание. Оно вспыхивает тёплым золотом, и Пустые поворачиваются к нему, как подсолнухи. И идут за светом вверх по лестнице. Все до одного.|Bir xotirangni yoqasan. U iliq oltindek yarqiraydi va Bo'shlar kungaboqardek unga o'giriladi. Nurga ergashib zinapoyadan chiqib ketishadi. Hammasi.`],
          ['', `You don't remember what you burned. Only that it was warm.|Ты не помнишь, что сжёг. Помнишь только, что оно было тёплым.|Nimani yoqqaningni eslamaysan. Faqat iliq bo'lganini eslaysan.`],
          ['sado', `It was a summer evening on a roof. I watched it go. …I'll remember it for you. I think I can do that.|Это был летний вечер на крыше. Я видела, как он сгорел. …Я буду помнить его за тебя. Кажется, я так умею.|Bu tomdagi yoz oqshomi edi. Yonib ketganini ko'rdim. …Uni sen uchun eslab qolaman. Shekilli, buni uddalayman.`]
        ], done);
      } else if (o.id === 'seal') {
        rep('tail', 1, true); rep('singers', -1, true); trust(1);
        play([
          ['', `You hold up the seal from the Tower. The Inspector goes the colour of the salt on the walls.|Ты поднимаешь печать из Башни. Смотритель белеет, как соль на стенах.|Minoradagi muhrni ko'tarasan. Nozir devordagi tuzdek oqarib ketadi.`],
          ['inspector', `Where did you… Take them. Take them, and get that out of my sight.|Откуда у тебя… Забирай их. Забирай и убери это с глаз моих.|Buni qayerdan… Ol ularni. Ol-u, buni ko'zimdan yo'qot.`]
        ], done);
      } else {
        addVoid(3, `a cruel choice|жестокий выбор|shafqatsiz tanlov`); rep('singers', 2); trust(-2);
        play([
          ['', `They walk into the water one by one, without a sound. The black surface closes over each head like a lid. Far below, something swallows.|Они входят в воду один за другим, без звука. Чёрная гладь смыкается над каждой головой, как крышка. Далеко внизу что-то глотает.|Ular birin-ketin, tovushsiz suvga kirib ketishadi. Qora sath har bir bosh ustida qopqoqdek yopiladi. Olisda, pastda nimadir yutinadi.`],
          ['', `A moment later the water at your feet has lost some of its bitterness. The city above will hold a little longer.|Через миг вода у твоих ног становится не такой горькой. Город наверху продержится ещё немного.|Bir zumdan keyin oyog'ing ostidagi suv sal chuchukroq tortadi. Tepadagi shahar yana ozgina chidaydi.`],
          ['sado', `I'm going to remember that you let them. I don't want to. But I will.|Я запомню, что ты это позволил. Не хочу. Но запомню.|Bunga yo'l qo'yganingni eslab qolaman. Istamayman. Lekin eslab qolaman.`]
        ], done);
      }
    }));
  }
});
BARKS['a2_well:start'] = [
  `So many scratched-out names. Somebody wanted the founders forgotten. Or the people they poured in.|Сколько соскобленных имён. Кто-то хотел, чтобы забыли основателей. Или тех, кого они в него влили.|Qancha qirib tashlangan ism. Kimdir asoschilarni unutishsin degan. Yoki ular quygan odamlarni.`,
  `Don't look at the water too long. It looks back.|Не смотри на воду долго. Она смотрит в ответ.|Suvga uzoq qarama. U ham senga qaraydi.`
];
BARKS['a2_well:mid'] = [
  `Halfway down. The air tastes of old wax. I hate that smell. I've always hated it.|Полпути вниз. Воздух отдаёт старым воском. Ненавижу этот запах. Всегда ненавидела.|Yarim yo'l. Havodan eski mum hidi keladi. Bu hidni yomon ko'raman. Doim yomon ko'rganman.`
];

/* =====================================================================
   20 · b_seven — The Seven, shades of the founders
   ===================================================================== */
BOSS('seven', {
  name: `The Seven|Семеро|Yettilar`,
  title: `Shades of the Founders|Тени основателей|Asoschilar soyalari`,
  quote: `"There was a treaty. We wrote it ourselves."|«Договор был. Мы сами его написали.»|«Shartnoma bor edi. Uni o'zimiz yozganmiz.»`,
  lair: `The Bottom of the Well|Дно Колодца|Quduq tubi`,
  lairSub: `Seven seats around a drain of black water|Семь сидений вокруг стока чёрной воды|Qora suv oqib ketadigan tuynuk atrofida yetti o'rindiq`,
  who: 'seven',
  pre: [
    ['', `At the bottom of the Well, around a hole where the water drains into the Sleeper, stand seven seats of carved bone. Seven shades in caravan coats sit in them, counting on their fingers.|На дне Колодца, вокруг дыры, через которую вода уходит в Спящего, стоят семь сидений из резной кости. На них — семь теней в караванных халатах. Считают на пальцах.|Quduq tubida, suv Uxlovchiga oqib ketadigan tuynuk atrofida o'yma suyakdan yetti o'rindiq turibdi. Ularda karvon to'nlaridagi yetti soya barmoq bukib sanab o'tiribdi.`],
    ['seven', `A yodchi. Good. A man who collects for others. You understand us better than you'd like.|Ёдчи. Хорошо. Человек, который собирает для других. Ты понимаешь нас лучше, чем тебе хотелось бы.|Yodchi. Yaxshi. Boshqalar uchun yig'adigan odam. Bizni o'zing istaganingdan yaxshiroq tushunasan.`],
    () => F().truth ? ['hero', `There was no treaty.|Никакого договора не было.|Hech qanday shartnoma bo'lmagan.`] : ['seven', `Every Night of Payment the city tells our story: the treaty, the gift, the Sleeper's consent. Do you believe it?|Каждую Ночь Уплаты город рассказывает нашу историю: договор, дар, согласие Спящего. Ты в неё веришь?|Har To'lov kechasi shahar bizning hikoyamizni aytadi: shartnoma, hadya, Uxlovchining roziligi. Bunga ishonasanmi?`],
    () => F().truth && ['seven', `There was. We signed it. He didn't need to.|Был. Мы его подписали. Ему подписывать было необязательно.|Bor edi. Biz imzoladik. Uning imzosi shart emasdi.`],
    ['seven', `We were thirsty. He was kind. We did the sums. Seven of us, a city of thousands. And he was only one.|Нас мучила жажда. Он был добр. Мы посчитали. Нас семеро, в городе тысячи. А он — всего один.|Chanqagan edik. U mehribon edi. Hisob-kitob qildik. Biz yettitamiz, shaharda minglab odam. U esa bitta.`],
    ['sado', `They sound like Tilla-bek. They sound like you, when you're tired.|Они говорят, как Тилла-бек. И как ты, когда устаёшь.|Ular Tillabekka o'xshab gapiradi. Sen charchaganingda ham shunday gapirasan.`]
  ],
  again: [
    `One spirit, a thousand mouths. Do the sum, yodchi.|Один дух, тысяча ртов. Посчитай, ёдчи.|Bitta ruh, ming og'iz. Hisobla, yodchi.`,
    `We dug the Well. You drink from it.|Колодец выкопали мы. А пьёшь из него ты.|Quduqni biz qazidik. Undan esa sen ichasan.`,
    `Sit down. There's an eighth seat. There always was.|Садись. Есть восьмое место. Оно всегда было.|O'tir. Sakkizinchi o'rindiq ham bor. Doim bo'lgan.`
  ],
  post: done => {
    f2('seven', 1);
    play([
      ['', `The shades come apart like smoke in rain. But they don't leave. They hang over their seats, and for the first time they remember instead of count.|Тени расползаются, как дым под дождём. Но не уходят. Висят над сиденьями и впервые не считают, а вспоминают.|Soyalar yomg'irdagi tutundek to'zg'iydi. Lekin ketmaydi. O'rindiqlari ustida muallaq turadi va ilk bor sanash o'rniga eslaydi.`],
      ['seven', `…The first captive was a girl from a caravan out of Merv. She sang while we poured her in. She thought it was a wedding.|…Первой пленницей была девушка из каравана из Мерва. Она пела, пока мы её вливали. Думала, это свадьба.|…Birinchi asir Marvdan kelgan karvondagi bir qiz edi. Uni quyayotganimizda kuyladi. To'y deb o'ylagandi.`],
      ['seven', `He woke screaming in the Year of Sand. We were at the Rabat. We heard our children go under the sand. And we did the sums again.|В Год Песка он проснулся с криком. Мы были на Рабате. Мы слышали, как наши дети уходят под песок. И снова посчитали.|Qum yili u qichqirib uyg'ondi. Biz Rabotda edik. Bolalarimiz qum tagiga ketayotganini eshitdik. Va yana hisob-kitob qildik.`],
      ['seven', `There was no treaty. We chained him with a song and fed him people. We called the people a tithe. We called the song holy.|Договора не было. Мы сковали его песней и кормили людьми. Людей назвали десятиной. Песню — святой.|Shartnoma bo'lmagan. Uni qo'shiq bilan kishanlab, odam bilan boqdik. Odamlarni ushr deb atadik. Qo'shiqni — muqaddas.`],
      () => F().truth && ['sado', `Farrukh's tumar showed you that already. But hearing them say it is different. They sound relieved.|Тумар Фарруха тебе это уже показал. Но слышать от них самих — другое дело. Им будто легче.|Farruxning tumari buni senga ko'rsatgan edi. Lekin ularning o'z og'zidan eshitish boshqa. Go'yo yengil tortishgandek.`],
      ['seven', `Our song is in our tumars. Whoever holds them holds him. We are tired, yodchi. What will you do with us?|Наша песня — в наших тумарах. У кого они, у того и он. Мы устали, ёдчи. Что ты с нами сделаешь?|Qo'shig'imiz tumarlarimizda. Ular kimda bo'lsa, u ham o'shaning qo'lida. Charchadik, yodchi. Biz bilan nima qilasan?`]
    ], () => hub(`The Seven|Семеро|Yettilar`, [
      { label: `— Who were the captives?|— Кто были эти пленники?|— Asirlar kimlar edi?`, lines: [
        ['seven', `Caravan folk. Debtors. Anyone nobody would miss. Later, anyone at all.|Люди с караванов. Должники. Те, кого никто не хватится. Потом — кто угодно.|Karvon ahli. Qarzdorlar. Hech kim izlamaydiganlar. Keyinroq — kim bo'lsa ham.`]
      ] },
      { label: `— What will happen to you?|— Что с вами будет?|— Sizlarga nima bo'ladi?`, lines: [
        ['seven', `If you let us go, we sleep. For the first time in three hundred years, without counting.|Отпустишь — уснём. Впервые за триста лет — не считая.|Qo'yib yuborsang — uxlaymiz. Uch yuz yilda birinchi marta — sanamasdan.`],
        ['seven', `If you hold us, we stay and look at what we did. That would be fair. We know.|Удержишь — останемся смотреть на то, что натворили. Это было бы справедливо. Мы знаем.|Ushlab qolsang — qilgan ishimizga tikilib qolaveramiz. Bu adolatli bo'lardi. Bilamiz.`]
      ] },
      { label: `— Can you teach me the song?|— Вы можете научить меня песне?|— Menga qo'shiqni o'rgata olasizlarmi?`, lines: [
        ['seven', `The youngest of us still remembers his verse. Four lines. With them you can tighten a chain. Any chain. Even his.|Младший из нас ещё помнит свой куплет. Четыре строки. Ими можно затянуть цепь. Любую. Даже его.|Eng kichigimiz hali o'z bandini eslaydi. To'rt qator. Ular bilan zanjirni tortsa bo'ladi. Har qanday zanjirni. Hatto unikini ham.`],
        ['sado', `That's what the Divan wants. A way to tighten chains. …I'm just saying.|Ровно это и нужно Дивану. Чем затягивать цепи. …Я просто говорю.|Devonga aynan shu kerak. Zanjir tortadigan narsa. …Shunchaki aytyapman.`]
      ] }
    ], [
      { label: `Let go of them. Let them sleep.|Отпустить их. Пусть спят.|Ularni qo'yib yuborish. Uxlashsin.`, id: 'rest' },
      { label: `Hold them here. Make them look at every captive.|Удержать их здесь. Пусть смотрят на каждого пленника.|Ularni shu yerda tutib qolish. Har bir asirga qarab tursinlar.`, id: 'remember' },
      { label: `"You, the youngest. Sing me your verse." Carry it off under your tongue.|«Ты, младший. Спой мне свой куплет». Унести его под языком.|«Sen, eng kichigi. Bandingni menga kuylab ber». Uni til ostida olib ketish.`, cost: 4, id: 'verse' }
    ], o => {
      f2('sevenEnd', o.id);
      const end = [['sado', `There was no treaty. Only a song and a sum.|Никакого договора не было. Только песня и подсчёт.|Hech qanday shartnoma bo'lmagan. Faqat qo'shiq va hisob-kitob.`]];
      if (o.id === 'rest') {
        trust(1);
        play([['', `You say nothing. You simply stop holding them. They go out like lamps at dawn, one by one, the youngest last.|Ты ничего не говоришь. Просто перестаёшь их держать. Они гаснут, как лампы на рассвете, один за другим. Младший — последним.|Hech narsa demaysan. Shunchaki ularni tutib turishni bas qilasan. Ular tongdagi chiroqlardek birin-ketin o'chadi. Eng kichigi — oxirida.`]].concat(end), done);
      } else if (o.id === 'remember') {
        rep('tail', 1, true);
        play([
          ['', `You hold them here. One by one the captives' faces rise in the water around them: hundreds, then thousands. The Seven can't look away. You leave them looking.|Ты удерживаешь их. Одно за другим в воде вокруг всплывают лица пленников — сотни, потом тысячи. Семеро не могут отвести глаз. Ты оставляешь их смотреть.|Ularni tutib qolasan. Atrofdagi suvda birin-ketin asirlarning yuzlari qalqib chiqadi — yuzlab, keyin minglab. Yettilar ko'z uzolmaydi. Sen ularni tikilib qolgancha tashlab ketasan.`],
          ['sado', `Good. …No. I don't know. Good.|Так им и надо. …Нет. Не знаю. Так им и надо.|To'g'ri. …Yo'q. Bilmadim. To'g'ri.`]
        ].concat(end), done);
      } else {
        addVoid(4, `a verse under the tongue|куплет под языком|til ostidagi band`); f2('verse', 1); rep('divan', 1, true);
        play([['', `The youngest of the Seven leans close and sings four lines into your ear. They lodge under your tongue like a stone. Now you know how to tighten a chain.|Младший из Семерых наклоняется и поёт тебе на ухо четыре строки. Они застревают под языком, как камешек. Теперь ты знаешь, как затянуть цепь.|Yettilarning eng kichigi engashib, qulog'ingga to'rt qator kuylaydi. Ular til ostingda toshdek qadalib qoladi. Endi zanjirni qanday tortishni bilasan.`]].concat(end), done);
      }
    }));
  }
});

/* =====================================================================
   21 · r_rib — Chaikhana in the ribs
   ===================================================================== */
REST('r_rib', {
  name: `Chaikhana in the Ribs|Чайхана в рёбрах|Qovurg'alar orasidagi choyxona`,
  sub: `Smugglers' tea between two bones as tall as minarets|Чай контрабандистов между двух костей высотой с минарет|Minoradek baland ikki suyak orasida kontrabandachilar choyi`,
  arrive: done => play([
    ['', `Someone has strung carpets between two ribs, each as tall as a minaret, and laid out cushions. The bone is warm. It rises slowly, then falls. The Sleeper is breathing.|Кто-то натянул ковры между двумя рёбрами — каждое высотой с минарет — и разложил подушки. Кость тёплая. Медленно поднимается, потом опускается. Спящий дышит.|Kimdir minoradek baland ikki qovurg'a orasiga gilam tortib, ko'rpachalar to'shagan. Suyak iliq. Sekin ko'tariladi, keyin tushadi. Uxlovchi nafas olyapti.`],
    ['sado', `We're inside his chest. Ravshan, we're sitting inside someone's chest drinking tea.|Мы у него в груди. Равшан, мы сидим у кого-то в груди и пьём чай.|Biz uning ko'ksidamiz. Ravshan, kimningdir ko'ksida choy ichib o'tiribmiz.`],
    ['hero', `Better than outside it.|Лучше, чем снаружи.|Tashqarisidan yaxshiroq.`],
    () => F().oydin === 'joined' && ['', `Two of Oydin's people sit by the door, masks on their knees, watching you the way people watch a borrowed horse.|Двое людей Ойдин сидят у входа, маски на коленях, и смотрят на тебя, как на лошадь, взятую взаймы.|Oydinning ikki odami eshik yonida, niqoblarini tizzasiga qo'yib o'tiribdi. Senga omonat otga qaragandek qarashadi.`],
    () => tookRelics() && ['', `The founders' tumars hum in your satchel. Without knowing why, the smugglers move their cushions further away.|Тумары основателей гудят в сумке. Контрабандисты, сами не зная почему, отодвигают подушки подальше.|Asoschilar tumarlari xaltangda g'uvillaydi. Kontrabandachilar nega ekanini o'zlari ham bilmay, ko'rpachalarini nariroq surishadi.`],
    () => hollowEyes() && ['smuggler', `Tea, yodchi? …You're looking straight through the cup. Like the ones upstairs. Drink it anyway.|Чаю, ёдчи? …Ты смотришь сквозь пиалу. Как те, наверху. Всё равно пей.|Choy, yodchi? …Piyoladan o'tkazib qarayapsan. Tepadagilardek. Baribir ich.`]
  ], done),

  rustam: firstThen('a2:rib:rustam', done => play([
    ['', `Rustam-aka sits with his back to a rib, rising and falling with it like a man in a boat. He mumbles the tithe-count under his breath.|Рустам-ака сидит, прислонившись к ребру, и качается вместе с ним, как в лодке. Бормочет под нос счёт десятины.|Rustam aka qovurg'aga suyanib o'tiribdi, qayiqdagidek u bilan birga ko'tarilib-tushadi. Ohista ushr sanog'ini g'o'ldiraydi.`],
    ['sado', `You know now. What he wrote. Whose name.|Теперь ты знаешь. Что он вписал. Чьё имя.|Endi bilasan. U nima yozganini. Kimning ismini.`],
    ['sado', `He won't hear you, you know. Whatever you say to him now, you're saying it for yourself.|Он тебя не услышит, ты же понимаешь. Что бы ты ему ни сказал, ты говоришь это для себя.|U seni eshitmaydi, bilasan-ku. Unga nima desang ham, o'zing uchun aytasan.`]
  ], () => ask(`Rustam-aka|Рустам-ака|Rustam aka`, [
    { label: `"I forgive you, Rustam-aka."|«Я вас прощаю, Рустам-ака.»|«Sizni kechirdim, Rustam aka.»`, id: 'forgave', lock: lock50() },
    { label: `"You took her twice."|«Вы отняли её дважды.»|«Siz uni ikki marta tortib oldingiz.»`, id: 'condemned' },
    { label: `Sit with him and say nothing.|Сесть рядом и ничего не говорить.|Yoniga o'tirib, indamaslik.`, id: 'silent' }
  ], o => {
    f2('rustamWord', o.id);
    if (o.id === 'forgave') {
      trust(1);
      play([['', `He doesn't hear it. He holds out his palm for a coin you don't have. You put your hand in his instead. His fingers close, out of habit. They're warm.|Он не слышит. Протягивает ладонь за монетой, которой у тебя нет. Ты кладёшь в неё свою руку. Пальцы смыкаются по привычке. Тёплые.|U eshitmaydi. Senda yo'q tanga uchun kaftini tutadi. O'rniga qo'lingni uning kaftiga qo'yasan. Barmoqlari odatiga ko'ra yumiladi. Iliq.`]], done);
    } else if (o.id === 'condemned') {
      play([
        ['rustam', `…counted twice… counted twice…|…посчитали дважды… дважды…|…ikki marta sanaldi… ikki marta…`],
        ['', `He doesn't know you said it. You do.|Он не знает, что ты это сказал. А ты знаешь.|U buni aytganingni bilmaydi. Sen esa bilasan.`]
      ], done);
    } else {
      trust(1);
      play([['', `You sit. The rib rises and falls. After a while his mumbling changes. It isn't the tithe-count any more. It's Alla, sung very badly.|Ты садишься рядом. Ребро поднимается и опускается. Через какое-то время бормотание меняется. Это уже не счёт десятины. Это «Алла» — очень фальшиво.|Yoniga o'tirasan. Qovurg'a ko'tarilib-tushadi. Bir ozdan keyin uning g'o'ldirashi o'zgaradi. Bu endi ushr sanog'i emas. Bu «Alla» — juda noto'g'ri, sozsiz aytilgan.`]], done);
    }
  })), RUSTAM_HABIT),

  turab: done => play(hasVoice() ? [
    ['turab', `In the old tales the Sleeper had a name, and the name is the first word of every tale. Without it they won't start. I've tried. They sit in my mouth like stones.|В старых сказаниях у Спящего было имя, и каждое сказание с него начинается. Без имени они не идут. Я пробовал. Сидят во рту, как камни.|Eski dostonlarda Uxlovchining ismi bo'lgan, har bir doston shu ism bilan boshlanadi. Usiz chiqmaydi. Urinib ko'rdim. Og'zimda toshdek qotib qoladi.`],
    () => F().name && ['turab', `…You have it. I can see it on you. Wait until the Spine. The tales want to be told up high, where he can hear.|…Оно у тебя есть. Вижу его на тебе. Подожди до хребта. Сказания хотят звучать высоко, где он услышит.|…U senda bor. Ustingda ko'rib turibman. Umurtqaga chiqquningcha kut. Dostonlar baland joyda, u eshitadigan yerda aytilishni istaydi.`]
  ] : [
    ['', `Turab draws a long shape in spilled tea: a sleeping giant. Then a mouth. He taps his own lips and shakes his head. A name. The giant had a name.|Тураб рисует пальцем в пролитом чае длинную фигуру — спящего великана. Потом рот. Стучит себя по губам и качает головой. Имя. У великана было имя.|Turob to'kilgan choyga barmog'i bilan uzun shakl chizadi — uxlayotgan dev. Keyin og'iz. O'z labiga chertib, bosh chayqaydi. Ism. Devning ismi bo'lgan.`]
  ], done),

  farrukh: firstThen('a2:rib:farrukh', done => play([
    ({
      kept: ['farrukh', `Still got it? Don't show me. Just nod. …Good. I dreamed of saffron last night. A real dream. My own.|Ещё у тебя? Не показывай. Просто кивни. …Вот и хорошо. Мне ночью снился шафран. Настоящий сон. Мой собственный.|Hali sendami? Ko'rsatma. Bosh irg'a, bas. …Yaxshi. Kecha tushimga za'faron kirdi. Haqiqiy tush. O'zimniki.`],
      home: ['farrukh', `I've been practising what I'll say at the gate. "Hello, Mother. I'm a smuggler." Needs work.|Репетирую, что скажу у ворот. «Здравствуй, мама. Я контрабандист». Надо доработать.|Darvoza oldida nima deyishni mashq qilyapman. «Assalomu alaykum, ona. Men kontrabandachiman». Hali pishitish kerak.`],
      sold: ['farrukh', `Yodchi! Have we met? I've had the loveliest morning. I think it was mine.|Ёдчи! Мы знакомы? У меня было чудесное утро. Кажется, моё.|Yodchi! Tanishmidik? Ajoyib tongim bo'ldi. Shekilli, o'zimniki.`],
      drunk: ['farrukh', `Purple. That's all I have of it now. The word. I say it sometimes, to see if anything comes.|Лиловое. Вот и всё, что от него осталось. Слово. Иногда повторяю — вдруг что-то придёт.|Binafsha. Undan endi faqat shu qoldi. Bitta so'z. Ba'zan takrorlayman — balki nimadir kelar.`]
    }[F().farrukh]) || ['farrukh', `Ribs. Lovely acoustics. Terrible for business.|Рёбра. Прекрасная акустика. Для торговли — ужас.|Qovurg'alar. Ovoz zo'r yangraydi. Savdo uchun esa — dahshat.`],
    () => F().farrukh === 'sold' && ['sado', `He's going. Like Rustam. Only nobody asked him to. He's doing it to himself.|Он уходит. Как Рустам. Только его никто не просил. Он сам с собой это делает.|U ketyapti. Rustamdek. Faqat undan hech kim so'ramagan. Buni o'zi o'ziga qilyapti.`],
    () => F().seven && ['farrukh', `The Seven, you say? And the Saffron was one of them? …Of course it was. That explains the spoons.|Семеро, говоришь? И Шафран среди них? …Ну конечно. Тогда понятно, почему у нас считают ложки.|Yettilar deysanmi? Za'faron ham ular orasida bo'lganmi? …Albatta-da. Unda bizda qoshiq sanashlari tushunarli.`]
  ], done), [
    ['farrukh', `Breathe with the bone. In, out. It's restful, once you stop thinking about whose bone it is.|Дыши вместе с костью. Вдох, выдох. Успокаивает, если не думать, чья это кость.|Suyak bilan birga nafas ol. Ichga, tashqariga. Kimning suyagi ekanini o'ylamasang, tinchlantiradi.`]
  ]),

  lullaby: done => lullaby(done, `Alla, the giant breathes, and we ride his breath like a boat. Up, and down. Up, and down. Alla.|Алла, великан дышит, и мы плывём на его дыхании, как в лодке. Вверх и вниз. Вверх и вниз. Алла.|Alla, dev nafas olar, biz uning nafasida qayiqdek suzarmiz. Tepaga, pastga. Tepaga, pastga. Alla.`,
    `For a moment the rib's slow rise matches her song exactly, as if the Sleeper were breathing in time. Then it doesn't.|На миг медленный подъём ребра точно совпадает с её песней, будто Спящий дышит в такт. Потом — уже нет.|Bir lahza qovurg'aning sekin ko'tarilishi uning qo'shig'iga aynan mos tushadi, go'yo Uxlovchi maromiga qarab nafas olayotgandek. Keyin yana mos kelmay qoladi.`)
});
BARKS['r_rib:start'] = [
  `Listen. In. Out. If he starts breathing faster, we run. Deal?|Слушай. Вдох. Выдох. Если он задышит чаще — бежим. Договорились?|Eshit. Ichga. Tashqariga. Agar tezroq nafas ola boshlasa — qochamiz. Kelishdikmi?`
];

/* =====================================================================
   22 · a2_spine — The Spine of the Sleeper
   ===================================================================== */
LAND('a2_spine', {
  name: `The Spine of the Sleeper|Хребет Спящего|Uxlovchining umurtqasi`,
  sub: `Up his back toward the withers and the white guardian|Вверх по спине, к холке и белому стражу|Orqasi bo'ylab yuqoriga — yag'ringa, oq qo'riqchi tomon`,
  start: [
    ['', `The tunnels climb. The walls are bone now: vertebrae like the arches of a bazaar, each one a little colder. Snow drifts down through cracks overhead.|Ходы идут вверх. Теперь стены из кости: позвонки, как арки базара, и каждый чуть холоднее предыдущего. Сквозь трещины наверху сыплется снег.|Yo'laklar tepaga ko'tariladi. Endi devorlar suyakdan: bozor ravoqlaridek umurtqalar, har biri oldingisidan sal sovuqroq. Tepadagi yoriqlardan qor uchib tushyapti.`],
    ['sado', `Snow! Ravshan, real snow. Look, it's falling right into him.|Снег! Равшан, настоящий снег. Смотри, он падает прямо в него.|Qor! Ravshan, haqiqiy qor. Qara, to'g'ri uning ichiga tushyapti.`],
    ['sado', `I remember snow. Someone catching it on their tongue… no, that's yours. Is that yours? We're getting mixed up, you and me.|Я помню снег. Кто-то ловит его языком… нет, это твоё. Это ведь твоё? Мы с тобой начинаем путаться.|Qorni eslayman. Kimdir uni tili bilan tutyapti… yo'q, bu seniki. Bu senikimi? Ikkovimiz aralashib ketyapmiz.`]
  ],
  stones: [
    `"Ak Bars, the white one, guarded the spring before the founders came. People brought it milk and tales. It purred when the tales were good."|«Ак Барс, белый, стерёг родник ещё до прихода основателей. Люди носили ему молоко и сказки. Когда сказка была хорошей, он мурлыкал».|«Oq Bars, oq qo'riqchi, asoschilar kelmasdan oldin buloqni qo'riqlagan. Odamlar unga sut va ertak olib kelishardi. Ertak yaxshi bo'lsa, xurillardi».`,
    `"The Seven could not chain the spirit while the white one watched. So they chained it first, with the same song, one verse shorter."|«Пока белый смотрел, Семеро не могли сковать духа. Поэтому сначала сковали его — той же песней, только на куплет короче».|«Oq qo'riqchi qarab turganda Yettilar ruhni kishanlay olmadi. Shuning uchun avval uni kishanlashdi — o'sha qo'shiq bilan, faqat bir band qisqaroq».`,
    `Scratched by a child: "The leopard cried all night. Father says leopards don't cry. Then what was it?"|Нацарапано детской рукой: «Барс всю ночь плакал. Папа говорит, барсы не плачут. А что же тогда это было?»|Bola qo'li bilan tirnalgan: «Bars tun bo'yi yig'ladi. Dadam barslar yig'lamaydi deydi. Unda bu nima edi?»`,
    `"His name is the first word of every tale. Whoever sings it to him, he listens. Forbidden by order of the Divan and the Well." The name itself is chiselled away.|«Его имя — первое слово каждого сказания. Кто споёт ему это имя, того он услышит. Запрещено указом Дивана и Колодца». Само имя сбито.|«Uning ismi har bir dostonning birinchi so'zi. Kim uni unga kuylasa, o'shani tinglaydi. Devon va Quduq farmoni bilan man etilgan». Ismning o'zi o'yib tashlangan.`
  ],
  memory: {
    id: 'm2_foal',
    lines: [
      ['memory', `Your mother calling across the yard, quietly, so the neighbours won't hear: "Toychoq! Bread!"|Мама зовёт через двор — тихонько, чтобы соседи не слышали: «Тойчок! Хлеб!»|Onang hovlining u boshidan chaqiradi — qo'shnilar eshitmasin deb sekingina: «Toychoq! Non!»`],
      ['memory', `And a smaller voice copying her, lisping, louder, so the whole street hears: "TOY-CHOQ! BREAD!" Your mother laughs despite herself.|А тоненький голосок передразнивает её — шепеляво и во всё горло, чтобы слышала вся улица: «ТОЙ-ЧОК! ХЛЕБ!» Мама не выдерживает и смеётся.|Ingichka bir ovozcha esa unga taqlid qiladi — chuchuk tilda, butun ko'cha eshitsin deb baqirib: «TOY-CHOQ! NON!» Onang chiday olmay kulib yuboradi.`],
      ['memory', `You were furious. You'd give anything now to be that furious again.|Ты тогда разозлился. Сейчас отдал бы что угодно, чтобы снова так разозлиться.|O'shanda jahling chiqqandi. Hozir yana shunday jahling chiqishi uchun hamma narsani berarding.`]
    ],
    after: () => sub2(`"Toy-choq." …I said it like that once. In the cistern. I don't know where it came from.|«Той-чок». …Я однажды так сказала. В цистерне. Не знаю, откуда это взялось.|«Toy-choq». …Bir marta shunday degandim. Sardobada. Qayerdan kelganini bilmayman.`)
  },
  people: [{ look: 'guard' }, { look: 'hound', x: 16 }, { look: 'divan', x: 32 }],
  peopleAfter: group => { if (F().hound === 'killed' && group[1]) group[1].look = 'guard'; },
  exit: done => {
    const f = F();
    play([
      ['', `Where the spine narrows toward the withers, three men in red and gold are waiting: a Divan envoy and two guards whose Humo feathers have frozen stiff.|Там, где хребет сужается к холке, ждут трое в красном с золотом: посланник Дивана и двое стражников. Перья Хумо у них на шапках замёрзли колом.|Umurtqa yag'ringa qarab torayadigan joyda qizil-tillarang kiyimli uch kishi kutib turibdi: Devon elchisi va Humo patlari sovuqda qotib qolgan ikki soqchi.`],
      () => f.hound === 'spared' && ['', `One of the guards is Bahodir, the Gilded Hound. He watches you with a dog's patience and a man's confusion.|Один из стражников — Баходир, Золотой Пёс. Смотрит на тебя с собачьим терпением и человеческой растерянностью.|Soqchilardan biri — Bahodir, Oltin It. U senga itning sabri va odamning sarosimasi bilan qaraydi.`],
      () => f.hound === 'spared' && ['bahodir', `You spared me. I keep wondering why. I keep coming back to it, like a tongue to a missing tooth.|Ты меня пощадил. Я всё думаю — зачем. Всё время к этому возвращаюсь, как язык к выбитому зубу.|Meni ayading. Nega ekanini o'ylayveraman. Tushgan tish o'rniga til qaytaveradi-ku — men ham shunday.`],
      () => f.hound === 'shown' && ['', `Behind the envoy, keeping his distance, stands Bahodir. No gold on him now. He came on his own.|За посланником, поодаль, стоит Баходир. Золота на нём больше нет. Он пришёл сам по себе.|Elchining ortida, nariroqda Bahodir turibdi. Ustida endi oltin yo'q. U o'z ixtiyori bilan kelgan.`],
      () => f.hound === 'shown' && ['bahodir', `You showed me what they planted in me. I'm not here for him. I'm here to see you get to the top.|Ты показал мне, что в меня вселили. Я здесь не ради него. Я здесь, чтобы ты дошёл до вершины.|Ichimga nima ekishganini menga ko'rsatding. Bu yerda u uchun emasman. Cho'qqiga yetib olishingni ko'rish uchun keldim.`],
      () => f.hound === 'killed' && ['envoy', `You killed the Hound. Tilla-bek bears no grudge. He keeps a ledger, which is better.|Вы убили Пса. Тилла-бек зла не держит. Он ведёт учёт — это надёжнее.|Oltin Itni o'ldirdingiz. Tillabek gina saqlamaydi. U hisob yuritadi — bu ishonchliroq.`],
      ['envoy', `Up there is the white guardian, Ak Bars. Three hundred years on a chain of song. The chain is wearing thin. When it breaks, the beast will go for the first throat it sees.|Наверху — белый страж, Ак Барс. Триста лет на цепи из песни. Цепь истончилась. Когда она лопнет, зверь вцепится в первое горло, какое увидит.|Tepada oq qo'riqchi — Oq Bars. Uch yuz yildan beri qo'shiq zanjirida. Zanjir yupqalashib qolgan. Uzilsa, yirtqich ko'ziga birinchi ko'ringan bo'g'izga tashlanadi.`],
      ['envoy', `Tilla-bek offers this.|Тилла-бек предлагает вам вот это.|Tillabek sizga buni taklif qiladi.`],
      ['', `A tumar on a gold cord: four lines of song sealed in wax. The chain verse.|Тумар на золотом шнурке: четыре строки песни, запечатанные в воск. Куплет цепи.|Tilla ipdagi tumar: mumga muhrlangan to'rt qator qo'shiq. Zanjir bandi.`],
      ['envoy', `Hold it up to the beast and the chain tightens. Do that, and the House of the Humo pays two hundred tilla. Or kill it. Also acceptable, if wasteful.|Поднесите его к зверю — и цепь затянется. Сделаете — Дом Хумо заплатит двести тилла. Или убейте его. Тоже годится, хоть и расточительно.|Uni yirtqichga tutsangiz, zanjir tortiladi. Shuni qilsangiz, Humo xonadoni ikki yuz tilla to'laydi. Yoki o'ldiring. Bu ham bo'ladi, isrofgarchilik bo'lsa ham.`],
      () => f.verse && ['sado', `You don't need his tumar. You've got the youngest founder's verse under your tongue. I can hear it humming there.|Тебе не нужен его тумар. У тебя под языком куплет младшего основателя. Я слышу, как он там гудит.|Senga uning tumari kerak emas. Til ostingda eng kichik asoschining bandi bor. U yerda g'uvillayotganini eshityapman.`],
      () => f.tillabek === 'accepted' && ['envoy', `You accepted his offer in the garden. He hopes this will be the first of many small courtesies.|Вы приняли его предложение в саду. Он надеется, что это первая из многих маленьких любезностей.|Bog'da uning taklifini qabul qilgansiz. U bu ko'p kichik iltifotlarning birinchisi bo'ladi, deb umid qiladi.`],
      () => f.divanPromise && ['envoy', `And you still owe him a name. He hasn't forgotten. He never does. He pays others to forget for him.|И вы всё ещё должны ему имя. Он не забыл. Он вообще не забывает — за него забывают другие, за деньги.|Yana siz unga hali ham bir ism qarzdorsiz. U unutgani yo'q. U hech qachon unutmaydi — uning o'rniga boshqalar pulga unutadi.`],
      () => hollowEyes() && ['envoy', `…Forgive me. You look like something Tilla-bek would keep in his cellar.|…Простите. Вы похожи на вещь, которую Тилла-бек держал бы у себя в подвале.|…Kechirasiz. Siz Tillabek yerto'lasida saqlaydigan narsaga o'xshab qolibsiz.`]
    ], () => hub(`The chain verse|Куплет цепи|Zanjir bandi`, [
      { label: `— Why does Tilla-bek care about a leopard?|— Тилла-беку-то какое дело до барса?|— Tillabekka bars nimaga kerak?`, lines: [
        ['envoy', `The white one is the Sleeper's guardian. While it's chained, the Sleeper can be chained too. Loose, it would defend its master. From us.|Белый — сторож Спящего. Пока он на цепи, на цепи можно держать и Спящего. Сорвётся — бросится защищать хозяина. От нас.|Oq qo'riqchi — Uxlovchining qo'riqchisi. U zanjirda ekan, Uxlovchini ham zanjirda ushlasa bo'ladi. Bo'shalsa — egasini himoya qiladi. Bizdan.`],
        ['sado', `So it's not about throats. It's about keeping the Sleeper on a leash.|Значит, дело не в горле. Дело в том, чтобы держать Спящего на привязи.|Demak, gap bo'g'izda emas. Gap Uxlovchini bog'lab qo'yishda.`]
      ] },
      { label: `— Sado, what do you think?|— Садо, а ты что думаешь?|— Sado, sen nima deysan?`, lines: [
        ['sado', `If you take it, you can tighten the chain up there and get paid. If you don't, you'll have to deal with the leopard some other way. Kill it. Or set it free.|Возьмёшь — сможешь наверху затянуть цепь и получить деньги. Не возьмёшь — придётся решать с барсом по-другому. Убить. Или отпустить.|Olsang — tepada zanjirni tortib, pulini olasan. Olmasang — bars bilan boshqacha hal qilishga to'g'ri keladi. O'ldirish. Yoki ozod qilish.`],
        ['sado', `I'd like it to be free. But I'm not the one who has to fight it.|Мне бы хотелось, чтобы он был свободен. Но драться-то с ним не мне.|Uning ozod bo'lishini istardim. Lekin u bilan olishadigan men emasman.`]
      ] }
    ], [
      { label: `Take the tumar.|Взять тумар.|Tumarni olish.`, id: 'take' },
      { label: `"Keep it."|«Оставьте себе.»|«O'zingizda qolsin.»`, id: 'refuse' },
      { label: `Take it and crush it in front of him.|Взять — и раздавить у него на глазах.|Olib, uning ko'z oldida ezib tashlash.`, id: 'break' }
    ], o => {
      if (o.id === 'take') {
        f2('chainSong', 1); rep('divan', 1);
        play([['envoy', `An advance, then. The rest when the chain sings.|Тогда вот задаток. Остальное — когда цепь запоёт.|Unda mana bu — oldindan to'lov. Qolgani — zanjir kuylaganda.`, () => gold(40)]], done);
      } else if (o.id === 'refuse') {
        trust(1); rep('divan', -1, true);
        play([['envoy', `As you wish. Ak Bars will form its own opinion of you shortly.|Как угодно. Скоро у Ак Барса сложится о вас собственное мнение.|Ixtiyoringiz. Tez orada Oq Barsning siz haqingizda o'z fikri paydo bo'ladi.`]], done);
      } else {
        trust(1); rep('divan', -2);
        play([
          ['', `The wax cracks between your fingers. Four lines of song slip out as a thin, cold breath and vanish into the snow.|Воск трескается у тебя в пальцах. Четыре строки песни выходят тонким холодным выдохом и тают в снегу.|Mum barmoqlaring orasida yoriladi. To'rt qator qo'shiq ingichka, sovuq nafas bo'lib chiqadi va qorga singib ketadi.`],
          ['', `The envoy's smile doesn't move. Only his eyes do, to make a note.|Улыбка посланника не меняется. Двигаются только глаза — запоминают.|Elchining tabassumi o'zgarmaydi. Faqat ko'zlari qimirlaydi — eslab qolish uchun.`],
          () => (f.hound === 'spared' || f.hound === 'shown') && ['', `Behind him Bahodir grins, briefly, like a man remembering how.|За его спиной Баходир коротко ухмыляется — как человек, который вспомнил, как это делается.|Uning ortida Bahodir bir zum iljayadi — qanday qilinishini eslab qolgan odamdek.`]
        ], done);
      }
    }));
  }
});
BARKS['a2_spine:start'] = [
  `Every bone a little colder. My light likes the cold. It's clearer. I'm clearer.|Каждая кость чуть холоднее. Мой свет любит холод. Он чище. И я чище.|Har bir suyak sal sovuqroq. Nurim sovuqni yaxshi ko'radi. U tiniqlashadi. Men ham.`,
  `Hear that? High and thin, like a finger round the rim of a glass. It's coming from the top.|Слышишь? Высоко и тонко, как палец по краю стакана. Это сверху.|Eshityapsanmi? Baland va ingichka, stakan labida barmoq aylantirgandek. Tepadan kelyapti.`
];
BARKS['a2_spine:mid'] = [
  `Paw prints in the snow. Big. Old. They go round and round in one place.|Следы лап на снегу. Большие. Старые. Кружат на одном месте.|Qorda panja izlari. Katta. Eski. Bir joyda aylanib yurgan.`,
  `The singing up there never stops. Not for a breath. I'd go mad. I think something has.|Пение наверху не смолкает. Ни на вдох. Я бы с ума сошла. Кажется, кто-то и сошёл.|Tepadagi kuy to'xtamaydi. Bir nafasga ham. Men aqldan ozardim. Kimdir ozgan, shekilli.`
];

/* =====================================================================
   23 · b_shrine — Ak Bars, the white guardian · Nargiza's question
   ===================================================================== */
BOSS('barys', {
  name: `Ak Bars|Ак Барс|Oq Bars`,
  title: `The White Guardian|Белый страж|Oq qo'riqchi`,
  quote: `"Snow remembers every step."|«Снег помнит каждый шаг.»|«Qor har bir qadamni eslab qoladi.»`,
  lair: `The Shrine on the Withers|Святилище на холке|Yag'rindagi qadamjo`,
  lairSub: `A snow leopard on a chain of song|Барс на цепи из песни|Qo'shiq zanjiridagi qor barsi`,
  who: 'akbars',
  pre: [
    ['', `The shrine is open to the sky. Snow lies over old offerings: bowls of milk frozen white, scraps of paper with tales written on them, wax gone grey.|Святилище открыто небу. Снег лежит на старых подношениях: миски с молоком, замёрзшим добела, клочки бумаги со сказками, посеревший воск.|Qadamjoning tepasi ochiq, osmonga qarab turibdi. Eski nazrlar ustida qor yotibdi: oppoq muzlagan sut kosalari, ertak yozilgan qog'oz parchalari, kulrang tortgan mum.`],
    ['', `In the middle lies a snow leopard the size of a horse. Round its neck is a chain that isn't metal. It's a sound: high, thin, endless, like a finger round the rim of a glass.|Посередине лежит снежный барс размером с коня. На шее у него цепь, но не железная. Это звук: высокий, тонкий, нескончаемый, как палец по краю стакана.|O'rtada ot kattaligidagi qor barsi yotibdi. Bo'ynida zanjir bor, lekin temirdan emas. Bu — tovush: baland, ingichka, tinimsiz, stakan labida aylanayotgan barmoqdek.`],
    ['akbars', `Another one with a song on him. You all stink of the Well. Come closer, little singer. I'll make it quick.|Ещё один с песней на шее. Все вы воняете Колодцем. Подойди ближе, певчик. Я быстро.|Yana bittasi, bo'ynida qo'shiq. Hammangizdan Quduq hidi kelib turibdi. Yaqinroq kel, xonandacha. Tez bitiraman.`],
    ['sado', `It isn't angry. It's in pain. The chain sings into it every second. Ravshan, it's been listening to that for three hundred years.|Он не злой. Ему больно. Цепь поёт в него каждую секунду. Равшан, он слушает это триста лет.|U jahldor emas. Unga og'riyapti. Zanjir har lahza uning ichiga kuylaydi. Ravshan, u buni uch yuz yildan beri eshityapti.`]
  ],
  again: [
    `Snow remembers every step you take, singer.|Снег помнит каждый твой шаг, певчик.|Qor har bir qadamingni eslab qoladi, xonandacha.`,
    `Again? Your song is louder than mine. Not for long.|Опять ты? Твоя песня громче моей. Это ненадолго.|Yana senmi? Qo'shig'ing menikidan baland. Bu uzoqqa bormaydi.`,
    `Come. Let one of us be finished.|Иди сюда. Пусть хоть один из нас отмучается.|Kel. Hech bo'lmasa birimiz qutulaylik.`
  ],
  post: done => {
    const f = F();
    play([
      ['', `The leopard lies in the snow, breathing clouds. The song-chain still rings round its neck, thin as a cracked bowl.|Барс лежит на снегу и выдыхает облака пара. Цепь из песни всё ещё звенит у него на шее — тонко, как треснувшая пиала.|Bars qorda bug' chiqarib yotibdi. Qo'shiq zanjiri hamon bo'ynida darz ketgan piyoladek ingichka jaranglaydi.`],
      ['akbars', `Finish me, or finish the chain. I don't care which. Just stop the singing.|Кончай со мной или с цепью. Мне всё равно. Только прекрати это пение.|Yo meni bitir, yo zanjirni. Menga farqi yo'q. Faqat shu kuyni to'xtat.`]
    ], () => hub(`Ak Bars|Ак Барс|Oq Bars`, [
      { label: `— Who put the chain on you?|— Кто посадил тебя на цепь?|— Seni kim zanjirband qilgan?`, lines: [
        ['akbars', `The Seven. With the same song they used on him, one verse shorter. So I couldn't stop them.|Семеро. Той же песней, что и его, только на куплет короче. Чтобы я им не помешал.|Yettilar. Uni bog'lagan qo'shiq bilan, faqat bir band qisqaroq. Ularga xalal bermayin deb.`]
      ] },
      { label: `— What will you do if you're free?|— Что ты будешь делать на свободе?|— Ozod bo'lsang, nima qilasan?`, lines: [
        ['akbars', `Lie in the snow and listen to the quiet. Then go back to him. I'm his guardian. I always was.|Лягу в снег и буду слушать тишину. Потом вернусь к нему. Я его сторож. Всегда им был.|Qorga yotib, sukunatni tinglayman. Keyin uning oldiga qaytaman. Men uning qo'riqchisiman. Doim shunday bo'lganman.`]
      ] },
      { label: `— Sado, what happens if…?|— Садо, а что будет, если…?|— Sado, agar… nima bo'ladi?`, lines: [
        ['sado', `Break the chain and it goes free. The Divan won't like it. Tighten it and it's their guard dog again, and Tilla-bek pays.|Порвёшь цепь — он свободен. Дивану это не понравится. Затянешь — снова станет их сторожевым псом, и Тилла-бек заплатит.|Zanjirni uzsang — u ozod. Devonga yoqmaydi. Tortsang — yana ularning qo'riqchi iti bo'ladi, Tillabek esa pul to'laydi.`],
        ['sado', `Or kill it. Then nobody guards the Sleeper, but nobody can ever chain the leopard again either. …I don't want that. I know it's not my choice.|Или убьёшь. Тогда Спящего никто не будет сторожить, зато барса уже никто не посадит на цепь. …Я этого не хочу. Знаю, решать не мне.|Yoki o'ldirasan. Unda Uxlovchini hech kim qo'riqlamaydi, barsni esa endi hech kim zanjirga sololmaydi. …Men buni istamayman. Hal qilish menda emas, bilaman.`]
      ] }
    ], [
      { label: `Put your hand on the chain and break it.|Положить руку на цепь — и порвать её.|Qo'lni zanjirga qo'yib, uni uzish.`, id: 'freed' },
      { label: `Sing the chain verse. Tighten it for the Divan.|Спеть куплет цепи. Затянуть её для Дивана.|Zanjir bandini kuylash. Uni Devon uchun tortish.`, id: 'chained',
        lock: (f.chainSong || f.verse) ? null : `You don't know the chain verse.|Ты не знаешь куплета цепи.|Zanjir bandini bilmaysan.` },
      { label: `Finish it.|Добить его.|Uni o'ldirish.`, cost: 3, id: 'killed' }
    ].filter(c => !(G.BM && G.BM.barysFreed) || c.id === 'freed')   // stage 8a: the chain was broken in the fight
     .map(c => G.BM && G.BM.barysFreed ? Object.assign({}, c, { label: `The chain already lies broken. Let him go.|Цепь уже порвана. Отпустить его.|Zanjir allaqachon uzilgan. Uni qo'yib yuborish.` }) : c), o => {
      f2('barys', o.id);
      const next = () => nargizaQuestion(done);
      if (o.id === 'freed') {
        trust(1); rep('divan', -1, true);
        f2('name', 1); // Ak Bars tells the Sleeper's true name: Obi-Hayot
        play([
          ['', `You put your hand on the chain. It burns with cold. You sing the only thing you know that's louder than a chain: Alla, badly. Sado sings with you, wrong in the third line. The chain stops.|Ты кладёшь руку на цепь. Она жжёт холодом. Ты поёшь единственное, что знаешь громче цепи: «Аллу», фальшиво. Садо поёт с тобой — и ошибается в третьей строчке. Цепь смолкает.|Qo'lingni zanjirga qo'yasan. U muzdek kuydiradi. Bilganlaring ichida zanjirdan baland yagona narsani kuylaysan: «Alla»ni, sozsiz. Sado sen bilan kuylaydi — uchinchi qatorda adashadi. Zanjir jim bo'ladi.`],
          ['akbars', `…Quiet. Oh. Quiet. I had forgotten what quiet was.|…Тишина. О. Тишина. Я забыл, что такое тишина.|…Sukunat. Oh. Sukunat. Sukunat nimaligini unutib qo'ygan ekanman.`],
          ['akbars', `Listen, singer. You call him the Div. The Sleeper. That isn't his name. His name is Obi-Hayot. Water of Life.|Слушай, певчик. Вы зовёте его Дэвом. Спящим. Это не имя. Его зовут Оби-Хаёт. Вода жизни.|Eshit, xonandacha. Sizlar uni Dev deysizlar. Uxlovchi deysizlar. Bu ism emas. Uning ismi — Obi Hayot. Hayot suvi.`, () => { f2('name', 1); know(`Learned: his name is Obi-Hayot|Узнано: его имя — Оби-Хаёт|Bilib olding: uning ismi Obi Hayot`); }],
          ['akbars', `People told him tales, and he raised water from the sand. Then seven men taught him to sleep on other people's lives. Wake him gently, or not at all.|Люди рассказывали ему сказки, и он поднимал воду из песка. Потом семеро научили его спать на чужих жизнях. Буди его бережно. Или не буди вовсе.|Odamlar unga ertak aytib berishardi, u esa qumdan suv chiqarardi. Keyin yetti kishi uni birovlarning umri ustida uxlashga o'rgatdi. Uni avaylab uyg'ot. Yo umuman uyg'otma.`],
          ['', `The leopard rises, shakes the snow off its back and is gone up the mountain in three bounds.|Барс поднимается, стряхивает снег со спины и в три прыжка уходит в горы.|Bars o'rnidan turib, yelkasidagi qorni silkitadi va uch sakrashda tog'ga g'oyib bo'ladi.`]
        ], next);
      } else if (o.id === 'chained') {
        trust(-2); rep('divan', 2);
        play([
          ['', `You sing the four lines. The chain shrieks tight. The leopard's eyes go flat, then patient, then empty. It lies down with its chin on its paws, like a dog by a door.|Ты поёшь четыре строки. Цепь с визгом затягивается. Глаза барса тускнеют, потом становятся терпеливыми, потом пустыми. Он ложится, уложив морду на лапы, как пёс у двери.|To'rt qatorni kuylaysan. Zanjir chiyillab tortiladi. Barsning ko'zlari xiralashadi, keyin sabrli, keyin bo'm-bo'sh bo'lib qoladi. U iyagini panjalariga qo'yib, eshik oldidagi itdek yotib oladi.`],
          ['', `Far below, under the snow, under the bone, something sighs, as if a verse of its own chain had just been sung again.|Далеко внизу, под снегом, под костью, что-то вздыхает — будто только что заново пропели куплет его собственной цепи.|Olisda, pastda, qor tagida, suyak tagida nimadir xo'rsinadi — go'yo uning o'z zanjirining bandi qaytadan kuylangandek.`, () => { if (f.chainSong) gold(160); }]
        ], next);
      } else {
        addVoid(3, `a guardian killed|страж убит|qo'riqchi o'ldirildi`); trust(-1);
        play([
          ['', `You finish it. The blood on the snow is red for a moment. Then it's only water, running downhill into the cracks.|Ты добиваешь его. Кровь на снегу какой-то миг красная. Потом это просто вода — она стекает вниз, в трещины.|Uni o'ldirasan. Qordagi qon bir lahza qizil turadi. Keyin u shunchaki suvga aylanib, pastga, yoriqlarga oqib ketadi.`],
          ['akbars', `…Obi… tell him… I…|…Оби… скажи ему… я…|…Obi… unga ayt… men…`],
          ['', `It doesn't finish. Far below, something turns over in its sleep.|Он не договаривает. Далеко внизу что-то ворочается во сне.|U gapini tugatolmaydi. Olisda, pastda nimadir uyqusida ag'darilib oladi.`],
          ['', `The chain dies with it. Whatever the Divan wanted from that song, nobody will ever sing it on him again.|Цепь умирает вместе с ним. Чего бы ни хотел Диван от этой песни — больше никто не споёт её над ним.|Zanjir u bilan birga o'ladi. Devon bu qo'shiqdan nima kutgan bo'lsa ham, endi uni hech kim uning ustida kuylay olmaydi.`]
        ], next);
      }
    }));
  }
});

function nargizaQuestion(done) {
  const f = F();
  const arrive = nargizaDown() ? [
    ['', `Nargiza comes up the last steps, out of breath, snow in her braids. She has followed you all the way up through the bone.|По последним ступеням поднимается Наргиза — запыхавшаяся, со снегом в косах. Она шла за тобой через весь хребет.|So'nggi pog'onalardan Nargiza chiqib keladi — hansirab, sochlarida qor. U butun umurtqa bo'ylab ortingdan kelgan.`]
  ] : [
    ['', `The snow in the offering bowls starts to shiver. The meltwater ripples, and a voice rises out of it, small and far away, as if from the bottom of the Well.|Снег в мисках для подношений начинает дрожать. Талая вода идёт рябью, и из неё поднимается голос — тихий, далёкий, будто со дна Колодца.|Nazr kosalaridagi qor titray boshlaydi. Erigan suv jimirlaydi va undan bir ovoz ko'tariladi — ingichka, olis, go'yo Quduq tubidan.`],
    ['nargiza', `Yodchi? Can you hear me? I'm in the Cloister, talking into the Well. He's carrying my voice to you. I didn't know he could do that.|Ёдчи? Ты меня слышишь? Я в Обители, говорю в Колодец. А он несёт мой голос к тебе. Я и не знала, что он так умеет.|Yodchi? Eshityapsanmi? Men Xonaqohdaman, Quduqqa gapiryapman. U ovozimni senga yetkazyapti. Buni qila olishini bilmagan ekanman.`]
  ];
  const heard = {
    freed: ['nargiza', `He keeps saying one word, over and over, since the chain stopped. I thought it was the sickness. It isn't. It's his name. He's remembering his name.|С тех пор как цепь смолкла, он твердит одно слово. Снова и снова. Я думала, это болезнь. Нет. Это его имя. Он вспоминает своё имя.|Zanjir tingandan beri u bir so'zni qayta-qayta takrorlayapti. Kasallik deb o'ylagandim. Yo'q. Bu uning ismi. U o'z ismini eslayapti.`],
    chained: ['nargiza', `Did you hear that? Not the leopard. The one below. He cried out, as if something had been taken from him again.|Ты слышал? Не барс. Тот, кто внизу. Он закричал, будто у него опять что-то отняли.|Eshitdingmi? Bars emas. Pastdagisi. Go'yo undan yana nimadir tortib olingandek qichqirdi.`],
    killed: ['nargiza', `He's grieving. I can hear him grieving for the white one, like for an old dog. He keeps starting a word and not finishing it. Obi… Obi…|Он горюет. Слышу, как он горюет по белому, как по старому псу. Всё начинает какое-то слово и не договаривает. Оби… Оби…|U qayg'uryapti. Oq qo'riqchi uchun xuddi keksa iti o'lgandek qayg'urayotganini eshityapman. Bir so'zni boshlaydi-yu, tugatmaydi. Obi… Obi…`]
  }[f.barys];
  play(arrive.concat([
    heard,
    ['nargiza', `Ustoz says what I hear is a sickness and she'll sing it out of me. But he's asking me for tales. Not tumars. Tales. What should I believe, yodchi?|Устоз говорит, что я слышу болезнь и что она её из меня выпоет. А он просит у меня сказок. Не тумаров — сказок. Чему мне верить, ёдчи?|Ustoz men eshitayotgan narsa kasallik, uni kuylab sug'urib olaman deydi. U esa mendan ertak so'rayapti. Tumar emas — ertak. Nimaga ishonay, yodchi?`],
    () => hollowEyes() && ['nargiza', `…You sound so far away. Even up close. Like you're at the bottom of something.|…Твой голос такой далёкий. Даже вблизи. Будто ты на дне чего-то.|…Ovozing juda olisdan kelyapti. Yaqin bo'lsang ham. Go'yo nimaningdir tubidasan.`]
  ]), () => hub(`Nargiza|Наргиза|Nargiza`, [
    { label: `— What exactly do you hear?|— Что именно ты слышишь?|— Aniq nimani eshityapsan?`, lines: [
      ['nargiza', `A voice. Very old and very tired. He doesn't want tumars. He wants someone to tell him something. Like a child before sleep.|Голос. Очень старый и очень усталый. Тумары ему не нужны. Он хочет, чтобы ему что-нибудь рассказали. Как ребёнок перед сном.|Ovoz. Juda keksa, juda charchagan. Unga tumar kerak emas. Kimdir unga biror narsa aytib berishini istaydi. Uxlash oldidan bolalardek.`]
    ] },
    { label: `— What will Shirin do to you?|— А что тебе за это будет от Ширин?|— Shirin senga buning uchun nima qiladi?`, lines: [
      ['nargiza', `Sing the hearing out of me. Ustoz says it won't hurt. She says that about everything.|Выпоет из меня этот слух. Устоз говорит, что не больно. Она про всё так говорит.|Bu eshitishni mendan kuylab olib tashlaydi. Ustoz og'rimaydi deydi. U hamma narsaga shunday deydi.`]
    ] },
    { label: `— Sado, what hangs on this?|— Садо, а что от этого зависит?|— Sado, bunga nima bog'liq?`, lines: [
      ['sado', `If she believes him, he finally has someone to talk to, and Shirin loses her best voice and won't forgive her. If she goes back, she's safe, and Shirin has that voice for the Great Tithe.|Поверит ему — у него наконец будет с кем говорить. А Ширин потеряет свой лучший голос и этого ей не простит. Вернётся — будет цела, а Ширин получит этот голос для Великой десятины.|Unga ishonsa — nihoyat uning gaplashadigan odami bo'ladi. Shirin esa eng zo'r ovozidan ayriladi va buni kechirmaydi. Qaytsa — omon qoladi, Shirin esa o'sha ovozni Buyuk ushrga ishlatadi.`],
      ['sado', `And if you burn the gift out of her yourself, she never hears him again, and nobody can use her: not Shirin, not him. It'll cost you something too.|А если сам выжжешь из неё этот дар — она его больше никогда не услышит, и её уже никто не сможет использовать: ни Ширин, ни он. Только и тебе это чего-то будет стоить.|Agar bu qobiliyatni o'zing kuydirib tashlasang — u uni boshqa hech qachon eshitmaydi, undan hech kim foydalana olmaydi: na Shirin, na u. Faqat bu senga ham arzonga tushmaydi.`]
    ] }
  ], [
    { label: `"Believe his voice."|«Верь его голосу.»|«Uning ovoziga ishon.»`, id: 'believes' },
    { label: `"Go back to Ustoz. You'll be safe there."|«Возвращайся к Устоз. Там ты будешь цела.»|«Ustozingga qayt. U yerda omon bo'lasan.»`, id: 'returned' },
    { label: `Burn the hearing out of her yourself.|Самому выжечь из неё этот слух.|Uning bu eshitish qobiliyatini o'zing kuydirib tashlash.`, cost: 3, id: 'silenced' }
  ], o => {
    f2('nargizaQ', o.id);
    if (o.id === 'believes') {
      trust(1);
      const heardName = !!f.name; // her line names him only if nobody has yet
      f2('name', 1); // she hears his true name: Obi-Hayot
      play([
        ['nargiza', `Then I'll listen. Even if Ustoz sings me empty for it. …Especially then.|Тогда я буду слушать. Даже если Устоз за это выпоет меня до дна. …Особенно тогда.|Unda tinglayman. Ustoz buning uchun meni tagigacha bo'shatsa ham. …Ayniqsa o'shanda.`],
        () => !heardName && ['nargiza', `Wait. He's saying it again, clearer. Obi-Hayot. That's his name. Water of Life.|Подожди. Он опять говорит, теперь отчётливей. Оби-Хаёт. Это его имя. Вода жизни.|Shoshma. U yana aytyapti, endi aniqroq. Obi Hayot. Bu uning ismi. Hayot suvi.`, () => { f2('name', 1); know(`Learned: his name is Obi-Hayot|Узнано: его имя — Оби-Хаёт|Bilib olding: uning ismi Obi Hayot`); }]
      ], done);
    } else if (o.id === 'returned') {
      rep('singers', 2);
      play([['nargiza', `…You're right. I'll go back. I'll tell her everything I heard. Forgive me, yodchi.|…Ты прав. Я вернусь. Расскажу ей всё, что слышала. Прости меня, ёдчи.|…Haqsan. Qaytaman. Eshitganlarimning hammasini unga aytaman. Kechir meni, yodchi.`]], done);
    } else {
      addVoid(3, `a gift burned|дар выжжен|qobiliyat kuydirildi`); trust(-1);
      play([
        ['', `You follow the thread of her voice to her gift, the way a yodchi finds a memory, and you burn it. For a moment your light is as warm as bathwater.|Ты идёшь по ниточке её голоса к её дару — так ёдчи находит воспоминание — и сжигаешь его. На миг твой свет становится тёплым, как вода в бане.|Ovozining ipidan ushlab uning qobiliyatini topasan — yodchi xotirani shunday topadi — va kuydirib tashlaysan. Bir lahza nuring hammom suvidek iliq bo'ladi.`],
        ['nargiza', `…Quiet. It's so quiet. Thank you. I think.|…Тихо. Как тихо. Спасибо. Наверное.|…Jimjit. Shunaqa jimjit. Rahmat. Shekilli.`],
        ['sado', `It's quiet for her. Not for him. He's still down there, asking. Now nobody hears him.|Ей тихо. А ему — нет. Он всё ещё там, внизу, просит. Только теперь его никто не слышит.|Unga jimjit. Unga esa yo'q. U hali ham pastda, so'rayapti. Faqat endi uni hech kim eshitmaydi.`]
      ], done);
    }
  }));
}

/* =====================================================================
   24 · r_spine — Chaikhana on the Spine · Turab's tales
   ===================================================================== */
REST('r_spine', {
  name: `Chaikhana on the Spine|Чайхана на хребте|Umurtqadagi choyxona`,
  sub: `The last tea before the Heart|Последний чай перед Сердцем|Yurakdan oldingi so'nggi choy`,
  arrive: done => play([
    ['', `A hut of felt and bone wedged between two vertebrae. Its smoke rises straight up through a crack in the Sleeper's back. Inside, someone is tuning a dutar.|Хижина из войлока и кости, втиснутая между двумя позвонками. Дым поднимается прямо вверх, в трещину на спине Спящего. Внутри кто-то настраивает дутар.|Ikki umurtqa orasiga qisilgan kigiz va suyakdan kulba. Tutuni to'ppa-to'g'ri tepaga, Uxlovchining orqasidagi yoriqqa ko'tariladi. Ichkarida kimdir dutor sozlayapti.`],
    ['sado', `A dutar. …One string is flat. Leave it. Don't let them fix it.|Дутар. …Одна струна ниже. Пусть так. Не давай её подтягивать.|Dutor. …Bitta tori past. Qo'yaver. Sozlashlariga yo'l qo'yma.`],
    () => F().barys === 'freed' && ['', `On the roof, two green eyes watch you go in. Then they're gone.|С крыши на тебя смотрят два зелёных глаза. Потом исчезают.|Tomdan ikki yashil ko'z senga qarab turadi. Keyin g'oyib bo'ladi.`],
    ['', `The ground shudders. Tea slops out of the bowls. Far above, very faint, comes a sound like a whole city's worth of dishes falling.|Земля вздрагивает. Чай выплёскивается из пиал. Далеко наверху, еле слышно, — звук, будто бьётся посуда целого города.|Yer silkinadi. Piyolalardan choy chayqalib to'kiladi. Olis tepadan, zo'rg'a eshitilib, butun bir shaharning idish-tovog'i sinayotgandek ovoz keladi.`],
    () => hollowEyes() && ['smuggler', `Sit by the fire, yodchi. You look like you've already gone the rest of the way.|Садись ближе к огню, ёдчи. У тебя такой вид, будто ты уже дошёл до конца.|Olovga yaqinroq o'tir, yodchi. Ko'rinishing xuddi oxirigacha borib kelgandek.`]
  ], done),

  rustam: firstThen('a2:spine:rustam', done => play([
    ['', `Rustam-aka sits close to the fire with his hands held out. When the ground shakes, he doesn't flinch. He only counts.|Рустам-ака сидит у огня, протянув к нему руки. Когда земля трясётся, он не вздрагивает. Только считает.|Rustam aka qo'llarini olovga tutib o'tiribdi. Yer silkinganda cho'chimaydi. Faqat sanaydi.`],
    () => F().rustamWord === 'silent' && ['rustam', `…alla… alla…|…алла… алла…|…alla… alla…`],
    () => F().rustamWord === 'forgave' && ['', `When you sit down, his hand finds yours on the felt, the way it did in the ribs. Habit. Only habit.|Когда ты садишься, его рука находит твою на войлоке — как тогда, в рёбрах. Привычка. Просто привычка.|O'tirganingda uning qo'li kigiz ustida qo'lingni topadi — qovurg'alardagidek. Odat. Shunchaki odat.`],
    ['rustam', `…the last house on the route… then home… forty steps…|…последний дом на маршруте… потом домой… сорок шагов…|…yo'ldagi oxirgi uy… keyin uyga… qirq qadam…`]
  ], done), RUSTAM_HABIT),

  turab: done => {
    const f = F();
    if (hasVoice() && f.name) {
      f2('tales', 1);
      play([
        ['turab', `You have it. His name. I can see it on you, like snow on a coat.|Оно у тебя. Его имя. Я вижу его на тебе, как снег на халате.|U senda. Uning ismi. Ustingda to'ndagi qordek ko'rinib turibdi.`],
        ['turab', `Sit. This isn't a song. Songs are taken. A tale is given, and then you both have it.|Садись. Это не песня. Песню отнимают. А сказку дарят — и тогда она есть у обоих.|O'tir. Bu qo'shiq emas. Qo'shiqni tortib olishadi. Ertakni esa hadya qilishadi — keyin u ikkalangizda ham bo'ladi.`],
        ['turab', `Obi-Hayot. Once there was a spirit who lived under the sand and was lonely, because sand forgets everything that walks on it.|Оби-Хаёт. Жил-был под песком дух, и было ему одиноко, потому что песок забывает всех, кто по нему ходит.|Obi Hayot. Bor ekan-u yo'q ekan, qum tagida bir ruh yashar ekan. U yolg'iz ekan, chunki qum ustidan o'tganlarning hammasini unutib yuboradi.`],
        ['turab', `A boy came to him with nothing to give but a story about a foal who was afraid of the dark. The spirit liked it so much he wept, and his tears were the first spring.|Пришёл к нему мальчик, и не было у него ничего, кроме сказки про жеребёнка, который боялся темноты. Духу она так понравилась, что он заплакал. Его слёзы стали первым родником.|Uning oldiga bir bola kelibdi. Qorong'idan qo'rqqan toychoq haqidagi ertakdan boshqa hech narsasi yo'q ekan. Ertak ruhga shunchalik yoqibdiki, u yig'lab yuboribdi. Ko'z yoshlari ilk buloq bo'libdi.`],
        ['turab', `That's the first. There are a hundred and one. I'll give them to whoever will tell them to him. A tale needs a voice he trusts.|Это первая. Всего их сто одна. Я отдам их тому, кто будет рассказывать их ему. Сказке нужен голос, которому он верит.|Bu birinchisi. Hammasi bir yuz bitta. Ularni unga aytib beradigan odamga beraman. Ertakka u ishonadigan ovoz kerak.`],
        () => f.nargizaQ === 'believes' && ['turab', `The Singers' girl, Nargiza. She hears him. He hears her. She could carry them to him.|Девушка из Певцов, Наргиза. Она слышит его. Он слышит её. Она могла бы донести их до него.|Xonandalarning qizi — Nargiza. U Obi Hayotni eshitadi, Obi Hayot ham uni eshitadi. Ertaklarni unga o'sha yetkaza oladi.`],
        ['sado', `The foal in the dark. That's your story. You told it to… someone. …Did the spirit hear it first? Or did you?|Жеребёнок в темноте. Это же твоя сказка. Ты рассказывал её… кому-то. …Кто услышал её первым — дух? Или ты?|Qorong'idagi toychoq. Bu sening ertaging-ku. Uni… kimgadir aytib berarding. …Uni birinchi kim eshitgan — ruhmi? Yo senmi?`]
      ], () => { know(`Learned: Turab's tales for Obi-Hayot|Узнано: сказания Тураба для Оби-Хаёта|Bilib olding: Turobning Obi Hayotga atalgan ertaklari`); done(); });
    } else if (hasVoice()) {
      play([
        ['turab', `The tales start with his name. Without it I open my mouth and nothing comes. Find his name, yodchi, and I'll give you a hundred and one tales.|Сказания начинаются с его имени. Без него я открываю рот — и ничего. Найди его имя, ёдчи, и я отдам тебе сто одну сказку.|Ertaklar uning ismi bilan boshlanadi. Usiz og'zimni ochaman-u, hech narsa chiqmaydi. Uning ismini top, yodchi, senga bir yuz bitta ertak beraman.`]
      ], done);
    } else {
      play([
        ['', `Turab opens his mouth. Nothing. He touches his throat where his voice should be, then, very carefully, mimes a hammer falling. His voice is on a shelf somewhere in the Ark.|Тураб открывает рот. Ничего. Касается горла, где должен быть голос, а потом очень бережно показывает, как падает аукционный молоток. Его голос стоит где-то в Арке, на полке.|Turob og'zini ochadi. Hech narsa. Ovozi bo'lishi kerak bo'lgan tomog'iga tegadi, keyin juda ehtiyotlab kimoshdi bolg'asi urilganini imo qiladi. Uning ovozi Arkda, qaysidir tokchada turibdi.`],
        () => F().voice === 'left' && ['sado', `The tales are locked up inside him. We should have bought his voice back. …I'm not blaming you. I'm blaming you a little.|Сказки заперты у него внутри. Надо было выкупить его голос. …Я тебя не виню. Ну, чуть-чуть виню.|Ertaklar uning ichida qamalib qolgan. Ovozini sotib olishimiz kerak edi. …Seni ayblamayapman. Ozgina ayblayapman, xolos.`]
      ], done);
    }
  },

  farrukh: firstThen('a2:spine:farrukh', done => play([
    ['farrukh', `So. The Heart. I've smuggled a lot of things, yodchi, but never myself into a god's chest. There's a first time for everything.|Ну вот. Сердце. Я много чего провозил, ёдчи, но себя в грудь бога — ни разу. Всё когда-то бывает впервые.|Xo'sh. Yurak. Ko'p narsani yashirincha olib o'tganman, yodchi, lekin o'zimni devning ko'ksiga — hech qachon. Har ishning bir boshlanishi bor.`],
    () => tookRelics() && ['farrukh', `The Saffron would pay a fortune for what's in your satchel. I won't tell them. I'm only saying so you know what you're carrying.|Шафран отдал бы целое состояние за то, что у тебя в сумке. Я им не скажу. Просто говорю, чтобы ты понимал, что несёшь.|Za'faron xonadoni xaltangdagi narsa uchun bor boyligini berardi. Ularga aytmayman. Nima ko'tarib yurganingni bilib qo'y, deyapman, xolos.`],
    () => F().farrukh === 'kept' && ['farrukh', `Keep it a little longer. If I come out the other side, I'll want it. If I don't, give it to my mother. She'll know the fields.|Подержи его у себя ещё немного. Выберусь — он мне понадобится. Не выберусь — отдай маме. Она узнает эти поля.|Uni yana biroz o'zingda saqlab tur. Tirik chiqsam, kerak bo'ladi. Chiqmasam — onamga ber. U dalalarni taniydi.`],
    () => F().farrukh === 'home' && ['farrukh', `After this, the gate of the Saffron. I've decided. Don't let me un-decide.|После этого — к воротам Шафрана. Я решил. Не дай мне передумать.|Bundan keyin — Za'faron darvozasiga. Qaror qildim. Fikrimdan qaytishimga yo'l qo'yma.`],
    () => F().farrukh === 'sold' && ['sado', `He doesn't know us any more. He's being polite to strangers. That's all that's left of him: manners.|Он нас больше не узнаёт. Вежлив, как с незнакомыми. Вот и всё, что от него осталось, — манеры.|U bizni endi tanimaydi. Notanishlarga qilgandek xushmuomala. Undan qolgani shu — odob.`]
  ], done), [
    ['farrukh', `Drink. Whatever's down there, it won't have tea.|Пей. Что бы там ни было внизу, чаем там не угостят.|Ich. Pastda nima bo'lsa ham, choy berishmaydi.`]
  ]),

  lullaby: done => lullaby(done, `Alla, little foal, alla. Snow on the roof and bread in the oven. Whoever forgets you, I won't. Alla.|Алла, жеребёночек, алла. Снег на крыше, хлеб в печи. Пусть все тебя забудут — я не забуду. Алла.|Alla, toychog'im, alla. Tomda qor, tandirda non. Hamma unutsa ham — men unutmayman. Alla.`,
    `She stops. "…Why did I sing 'foal'? That's not in the song. It isn't, is it?" You say nothing. In your mother's version, it was.|Она замолкает. «…Почему я спела "жеребёночек"? Этого же нет в песне. Ведь нет?» Ты молчишь. У мамы — было.|U to'xtaydi. «…Nega "toychoq" deb kuyladim? Qo'shiqda bu yo'q-ku. Yo'q, a?» Indamaysan. Onang aytganida bor edi.`)
});
BARKS['r_spine:start'] = [
  `Last tea. I don't like the word "last". Say "next". Next tea.|Последний чай. Не люблю слово «последний». Скажи «следующий». Следующий чай.|So'nggi choy. «So'nggi» degan so'zni yoqtirmayman. «Navbatdagi» de. Navbatdagi choy.`
];

/* =====================================================================
   25 · a2_heart — The Heart. The strongest plan begins; into the dream.
   ===================================================================== */
const whose = () => {
  const f = F(), r = R().rep || {};
  if (f.oydin === 'joined') return 'remember';
  let best = 'singers';
  for (const k of ['divan', 'remember']) if ((r[k] || 0) > (r[best] || 0)) best = k;
  return best;
};
const HEART_LOOKS = { singers: ['singer', 'singer', 'shirin'], divan: ['guard', 'divan', 'tillabek'], remember: ['rebel', 'rebel', 'oydin'] };

LAND('a2_heart', {
  name: `The Heart|Сердце|Yurak`,
  sub: `Where the Sleeper's blood is water, and the water is waking|Где кровь Спящего — вода, и эта вода просыпается|Uxlovchining qoni suv bo'lgan joy. Suv esa uyg'onyapti`,
  start: [
    ['', `The tunnel ends in a chamber as big as the Cloister, and it is pulsing. The walls are red-black and wet. Every beat shakes salt from the ceiling.|Тоннель упирается в зал размером с Обитель. И зал пульсирует. Стены красно-чёрные, мокрые. С каждым ударом с потолка сыплется соль.|Yo'lak Xonaqohdek keladigan zalga borib taqaladi. Zal tepib turibdi. Devorlari qizil-qora, ho'l. Har zarbda shiftdan tuz to'kiladi.`],
    ['sado', `It's beating. Ravshan, it's beating faster. He's waking up.|Оно бьётся. Равшан, оно бьётся всё чаще. Он просыпается.|U uryapti. Ravshan, tobora tez uryapti. U uyg'onyapti.`],
    ['', `Far above you, through a mile of flesh and stone, you hear it: bells. Every bell in Yodgor, ringing with no hands on the ropes.|Высоко над тобой, сквозь версту плоти и камня, ты слышишь колокола. Все колокола Ёдгора звонят сами, без звонарей.|Olis tepada, bir chaqirim et va tosh ortidan qo'ng'iroqlarni eshitasan. Yodgorning barcha qo'ng'iroqlari hech kim tortmasa ham o'z-o'zidan chalinyapti.`]
  ],
  stones: [
    `Not a stone: a clot of old memories fused together. Inside, a thousand voices say one word: "mine".|Не камень — сгусток старых воспоминаний, спёкшихся в одно. Внутри тысяча голосов твердит одно слово: «моё».|Tosh emas — bir-biriga qorishib ketgan eski xotiralar laxtasi. Ichida ming ovoz bitta so'zni takrorlaydi: «meniki».`,
    `"The last tale told to him before the chaining was the dastan of Ravshan. He never heard the end. The Seven stopped it at the wedding."|«Последним сказанием, что ему рассказали перед цепью, был дастан о Равшане. Конца он так и не услышал. Семеро оборвали его на свадьбе».|«Kishanlashdan oldin unga aytilgan so'nggi doston "Ravshan" edi. U oxirini eshitmadi. Yettilar uni to'y joyida uzib qo'yishdi».`,
    `A Singer's scratch, recent: "Ustoz says the Great Tithe will hold him a hundred years. She has said such things before. She was always right. Until now."|Свежая царапина, рука Певца: «Устоз говорит, Великая десятина удержит его сто лет. Она и раньше такое говорила. И всегда была права. До сих пор».|Yaqinda Xonanda tirnagan: «Ustoz Buyuk ushr uni yuz yil ushlab turadi deydi. Avval ham shunaqa degan. Va doim haq chiqqan. Hozirgacha».`,
    `A Divan seal on a closed valve: "Property of the House of the Humo. Do not open until the song is ours."|Печать Дивана на закрытом вентиле: «Собственность Дома Хумо. Не открывать, пока песня не станет нашей».|Yopiq jo'mrakda Devon muhri: «Humo xonadoni mulki. Qo'shiq bizniki bo'lmaguncha ochilmasin».`
  ],
  memory: {
    id: 'm2_sale',
    lines: [
      ['memory', `A white room in the Cloister. You're twelve. A Singer holds out an empty tumar, warm as a hand.|Белая комната в Обители. Тебе двенадцать. Певица протягивает пустой тумар, тёплый, как ладонь.|Xonaqohdagi oq xona. O'n ikki yoshdasan. Bir xonanda ayol kaftdek iliq bo'sh tumarni uzatadi.`],
      ['memory', `"Think of the most precious thing you have." You do. She sings. It hurts like pulling out a splinter that goes all the way to your heart.|«Подумай о самом дорогом, что у тебя есть». Ты думаешь. Она поёт. Больно — будто тянут занозу, которая уходит до самого сердца.|«Eng aziz narsangni o'yla». O'ylaysan. U kuylaydi. Yuragingacha kirib borgan zirapchani sug'urib olishayotgandek og'riydi.`],
      ['memory', `"Hold still," she says. "It's bigger than the tumar." She squeezes. "Whatever doesn't fit burns off. Usually."|«Не шевелись, — говорит она. — Оно больше тумара». Сжимает. «Что не влезет, то сгорит. Обычно».|«Qimirlama, — deydi u. — Bu tumardan katta». Siqadi. «Sig'magani kuyib ketadi. Odatda».`]
    ],
    after: () => sub2(`"Usually."|«Обычно».|«Odatda».`)
  },
  people: [{ look: 'singer' }, { look: 'singer', x: 18 }, { look: 'shirin', x: 36 }],
  peopleAfter: group => { const L = HEART_LOOKS[whose()]; group.forEach((o, i) => { if (L[i]) o.look = L[i]; }); },
  exit: done => {
    const f = F();
    const fac = whose();
    f2('faction', fac);
    const relics = tookRelics();
    const opening = {
      singers: [
        ['', `Singers in grey stand in a ring round the Heart, mouths open, Ustoz Shirin at the centre. They're already singing. The Great Tithe has begun.|Певцы в сером стоят кольцом вокруг Сердца, рты открыты. В середине — Устоз Ширин. Они уже поют. Великая десятина началась.|Kulrang kiyimli Xonandalar og'izlarini ochib, Yurak atrofida halqa bo'lib turishibdi. O'rtada — Ustoz Shirin. Ular allaqachon kuylayapti. Buyuk ushr boshlandi.`],
        ['shirin', `Yodchi. You came the long way. Up there, right now, my Singers are standing in every street of the Tail.|Ёдчи. Долгой же дорогой ты пришёл. Наверху, в эту самую минуту, мои Певцы стоят на каждой улице Хвоста.|Yodchi. Uzoq yo'ldan kelding. Tepada aynan shu daqiqada Xonandalarim Dumning har bir ko'chasida turibdi.`],
        ['shirin', `When we finish, the Tail will be empty and the Sleeper full for a hundred years. No more Small Awakenings. No more daughters under the sand.|Когда мы закончим, Хвост опустеет, а Спящий будет сыт сто лет. Больше никаких Малых Пробуждений. Больше ничьих дочерей под песком.|Tugatganimizda Dum bo'shaydi, Uxlovchi esa yuz yil to'q bo'ladi. Boshqa Kichik Uyg'onishlar bo'lmaydi. Qum tagida hech kimning qizi qolmaydi.`],
        () => relics && ['shirin', `Give me the founders' tumars. With them I need only half the Tail. You could save half the Tail, Ravshan. Think of it as a discount.|Отдай мне тумары основателей. С ними мне хватит половины Хвоста. Ты можешь спасти половину Хвоста, Равшан. Считай это скидкой.|Asoschilar tumarlarini menga ber. Ular bilan menga Dumning yarmi yetadi. Dumning yarmini qutqarishing mumkin, Ravshan. Buni chegirma deb bil.`],
        () => f.nargizaQ === 'returned' && ['nargiza', `I came back, yodchi. I'm singing with them. I'm sorry. He's screaming, and I'm singing over him.|Я вернулась, ёдчи. Пою с ними. Прости. Он кричит, а я пою поверх его крика.|Qaytdim, yodchi. Ular bilan kuylayapman. Kechir. U qichqiryapti, men esa uning qichqirig'i ustidan kuylayapman.`],
        () => f.nargizaQ === 'believes' && ['', `In the ring one mouth is closed. Nargiza's. She looks at you and shakes her head.|В кольце один рот закрыт. Это Наргиза. Она смотрит на тебя и качает головой.|Halqada bitta og'iz yopiq. Bu — Nargiza. U senga qarab bosh chayqaydi.`],
        () => hollowEyes() && ['shirin', `My song has nearly finished you. I'm sorry about that. You were a good yodchi.|Моя песня почти тебя доела. Мне жаль. Ты был хорошим ёдчи.|Qo'shig'im seni deyarli yeb bitirdi. Afsus. Sen yaxshi yodchi eding.`],
        ['sado', `If you join the ring, the Tail goes empty and he sleeps a hundred years. If you break it, he wakes up angry. And if you sing with them, the song takes a piece of you too.|Встанешь в кольцо — Хвост опустеет, а он уснёт на сто лет. Разорвёшь кольцо — он проснётся злым. А если запоёшь с ними, песня откусит кусок и от тебя.|Halqaga qo'shilsang — Dum bo'shaydi, u esa yuz yil uxlaydi. Halqani buzsang — u g'azab bilan uyg'onadi. Ular bilan kuylasang, qo'shiq sendan ham bir parcha uzib oladi.`]
      ],
      divan: [
        ['', `Divan mercenaries hold the chamber. Brass pipes run from the Heart up into the dark. At the valves, men in red and gold turn wheels. Akhror Tilla-bek watches from a carpet laid on the wet floor.|Зал держат наёмники Дивана. От Сердца вверх, во тьму, тянутся медные трубы. У вентилей люди в красном с золотом крутят колёса. Ахрор Тилла-бек наблюдает с ковра, постеленного прямо на мокрый пол.|Zalni Devon yollanmalari egallagan. Yurakdan tepaga, qorong'ilikka mis quvurlar ketgan. Jo'mraklar yonida qizil-tillarang kiyimlilar g'ildirak buramoqda. Ahror Tillabek ho'l polga to'shalgan gilamdan kuzatib turibdi.`],
        ['tillabek', `Ravshan. Welcome to the heart of the matter. Forgive me, I've waited a long time to say that.|Равшан. Добро пожаловать в самое сердце дела. Простите, я давно ждал случая это сказать.|Ravshan. Ishning naq yuragiga xush kelibsiz. Kechirasiz, buni aytish uchun ancha kutdim.`],
        ['tillabek', `The founders' chain is worn out. I'm singing a new one. Pipes to every city on the Silk Road, memory running through them like silk. He'll sleep, and the world will buy his dreams.|Цепь основателей износилась. Я пою новую. Трубы — в каждый город Шёлкового пути, и по ним, как шёлк, бежит память. Он будет спать, а мир — покупать его сны.|Asoschilar zanjiri eskirdi. Men yangisini kuylayapman. Ipak yo'lining har bir shahriga quvur, ulardan ipakdek xotira oqadi. U uxlaydi, dunyo esa uning tushlarini sotib oladi.`],
        () => relics && ['tillabek', `You carry the founders' tumars. Name your price. Truly, any price. I have a thousand childhoods in my cellar. I could find yours.|У вас тумары основателей. Назовите цену. Правда, любую. У меня в подвале тысяча детств. Я мог бы отыскать и ваше.|Asoschilar tumarlari sizda. Narxini ayting. Rostdan, istalgan narxni. Yerto'lamda ming bolalik bor. Siznikini ham topib berardim.`],
        () => f.barys === 'chained' && ['tillabek', `And the white leopard is back on its chain, thanks to you. I've had a bowl of milk sent up. I'm not a monster.|И белый барс снова на цепи — благодаря вам. Я распорядился отнести ему миску молока. Я же не чудовище.|Oq bars ham siz tufayli yana zanjirda. Unga bir kosa sut yubordim. Axir men yirtqich emasman.`],
        () => f.alpTumars === 'returned' && ['', `By the door, in chains, Alp is on his knees. He came up to settle his account with Tilla-bek and got as far as the guards.|У двери, в цепях, на коленях стоит Алп. Он шёл свести счёты с Тилла-беком — и дошёл только до стражи.|Eshik oldida Alp zanjirband holda tiz cho'kib turibdi. U Tillabek bilan hisob-kitob qilgani kelgan — faqat soqchilargacha yetibdi.`],
        () => hollowEyes() && ['tillabek', `Ah. You're nearly empty. A pity. Empty things are so hard to sell.|А. Вы почти пусты. Жаль. Пустое так трудно продать.|Oh. Siz deyarli bo'shsiz. Attang. Bo'sh narsani sotish juda qiyin-da.`],
        ['sado', `If you turn that wheel, he chains the Sleeper and sells memory to the whole world. If you smash the valves, the chain never closes, and he wakes. Hungry.|Повернёшь колесо — он посадит Спящего на цепь и будет продавать память всему миру. Разобьёшь вентили — цепь не сомкнётся, и он проснётся. Голодным.|G'ildirakni bursang — u Uxlovchini zanjirga solib, butun dunyoga xotira sotadi. Jo'mraklarni sindirsang — zanjir tutashmaydi va u uyg'onadi. Och holda.`]
      ],
      remember: [
        ['', `Those Who Remember stand round the Heart, masks off. Hundreds of them. Behind them, holding hands, the Hollow they've led down. Oydin stands at the Heart with a bowl.|Те, кто помнит, стоят вокруг Сердца без масок. Сотни. За ними, взявшись за руки, — Пустые, которых они привели. Ойдин стоит у Сердца с чашей в руках.|Eslaganlar niqobsiz Yurak atrofida turishibdi. Yuzlab. Ortlarida ular boshlab kelgan Bo'shlar qo'l ushlashib turibdi. Oydin qo'lida kosa bilan Yurak yonida turibdi.`],
        relics
          ? ['oydin', `You have them, Toychoq. Break them, or give them to me and I'll break them. Either way he wakes. He's waking already.|Они у тебя, Тойчок. Разбей их — или отдай мне, я разобью. Так или иначе он проснётся. Он уже просыпается.|Ular senda, Toychoq. Sindir — yo menga ber, o'zim sindiraman. Baribir u uyg'onadi. Allaqachon uyg'onyapti.`]
          : ['oydin', `Seven tumars. Seven men who chained a god for water. I'm going to break them, Toychoq. He'll wake, and everyone will remember everything.|Семь тумаров. Семь человек, которые заковали бога ради воды. Я их разобью, Тойчок. Он проснётся, и все вспомнят всё.|Yettita tumar. Suv deb bir ruhni kishanlagan yetti kishi. Ularni sindiraman, Toychoq. U uyg'onadi va hamma hamma narsani eslaydi.`],
        () => f.oydinDoubt && ['oydin', `I looked, like I said I would. At the city. At the Tail. …I'm still doing it. But I looked.|Я посмотрела, как обещала. На город. На Хвост. …И всё равно делаю это. Но я посмотрела.|Va'da berganimdek, qaradim. Shaharga. Dumga. …Baribir qilaman. Lekin qaradim.`],
        () => f.oydin === 'joined' && ['oydin', `Stand with me. Like under the neighbour's tree. You lifted me up to the branches. Lift me up now.|Встань рядом. Как тогда, под соседским деревом. Ты поднимал меня к веткам. Подними и сейчас.|Yonimda tur. O'shanda qo'shnining daraxti tagidagidek. Meni shoxlarga ko'targan eding. Hozir ham ko'tar.`],
        () => hollowEyes() && ['oydin', `You're almost gone, Toychoq. Hold on. When he wakes, it all comes back. Even you.|Тебя почти не осталось, Тойчок. Держись. Когда он проснётся, всё вернётся. Даже ты.|Sendan deyarli hech narsa qolmabdi, Toychoq. Chida. U uyg'onganda hammasi qaytadi. Hatto sen ham.`],
        ['sado', `If you lift her up, she breaks the tumars, he wakes, and the city drowns. If you stop her, maybe it's slower. Maybe it just hurts more.|Поднимешь её — она разобьёт тумары, он проснётся, и город утонет. Помешаешь — может, всё будет медленнее. А может, просто больнее.|Uni ko'tarsang — tumarlarni sindiradi, u uyg'onadi va shahar cho'kadi. Xalal bersang — balki sekinroq bo'lar. Balki shunchaki og'riqliroq.`]
      ]
    }[fac];
    const nameLine = () => f.name && ['sado', `Or… you know his name. Obi-Hayot. Nobody else here does. Maybe you could just talk to him.|Или… ты же знаешь его имя. Оби-Хаёт. Здесь его больше никто не знает. Может, просто поговорить с ним?|Yoki… sen uning ismini bilasan-ku. Obi Hayot. Bu yerda uni boshqa hech kim bilmaydi. Balki u bilan shunchaki gaplashib ko'rarsan?`];
    const QUESTIONS = {
      singers: [
        { label: `— What happens to the people of the Tail?|— Что станет с людьми Хвоста?|— Dum odamlariga nima bo'ladi?`, lines: [
          ['shirin', `They'll live. They'll walk, work, answer when spoken to. They just won't remember. It's not so bad. Ask Rustam.|Они будут жить. Ходить, работать, отвечать, когда спросят. Просто не будут помнить. Это не так уж страшно. Спроси Рустама.|Ular yashaydi. Yuradi, ishlaydi, so'rasang javob beradi. Faqat eslamaydi. Bu unchalik qo'rqinchli emas. Rustamdan so'ra.`]
        ] },
        { label: `— And if I stop you?|— А если я вам помешаю?|— Agar sizga xalal bersam-chi?`, lines: [
          ['shirin', `Then he wakes hungry, and the Year of Sand comes again. I was there for the Small Awakening, Ravshan. I dug for my daughter for three days.|Тогда он проснётся голодным, и Год Песка повторится. Я видела Малое Пробуждение, Равшан. Я три дня откапывала свою дочь.|Unda u och uyg'onadi va Qum yili qaytadi. Men Kichik Uyg'onishni ko'rganman, Ravshan. Qizimni uch kun qazib izladim.`]
        ] }
      ],
      divan: [
        { label: `— Whose memories go down those pipes?|— Чья память течёт по этим трубам?|— Bu quvurlardan kimning xotirasi oqadi?`, lines: [
          ['tillabek', `Everyone's, eventually. The poor sell, the rich buy, and he sleeps on the difference. It's what this city has always done. I'm only being honest about it.|Со временем — всех. Бедные продают, богатые покупают, а он спит на разнице. Город всегда так жил. Я просто говорю об этом честно.|Vaqti kelib — hammaning. Kambag'al sotadi, boy sotib oladi, u esa farqi ustida uxlaydi. Shahar doim shunday yashagan. Men buni ochiq aytyapman, xolos.`]
        ] },
        { label: `— And if I refuse?|— А если я откажусь?|— Agar rad etsam-chi?`, lines: [
          ['tillabek', `Then my men turn the wheels without you, and I remember that you refused. I have an excellent memory. Several, in fact.|Тогда мои люди повернут колёса без вас, а я запомню, что вы отказались. Память у меня отличная. Даже не одна.|Unda odamlarim g'ildiraklarni sizsiz buraydi, men esa rad etganingizni eslab qolaman. Xotiram a'lo. Aslida, bittagina ham emas.`]
        ] }
      ],
      remember: [
        { label: `— What happens to the Tail?|— Что будет с Хвостом?|— Dumga nima bo'ladi?`, lines: [
          ['oydin', `It drowns first. My people went up last night to lead out everyone they could. Not everyone will go. I know.|Он утонет первым. Мои люди ещё ночью поднялись наверх — вывести всех, кого смогут. Уйдут не все. Я знаю.|U birinchi cho'kadi. Odamlarim kecha tunda imkoni boricha hammani olib chiqish uchun tepaga chiqishgan. Hamma ham ketmaydi. Bilaman.`]
        ] },
        { label: `— Is remembering worth a city?|— Память стоит целого города?|— Xotira butun bir shaharga arziydimi?`, lines: [
          ['oydin', `This city is made of people who were made to forget. Ask me that again when you remember me.|Этот город сложен из людей, которых заставили забыть. Спроси меня ещё раз, когда вспомнишь меня.|Bu shahar unutishga majbur qilingan odamlardan qurilgan. Meni eslaganingda shu savolni yana ber.`]
        ] }
      ]
    }[fac];
    const WITH = {
      singers: `Step into the ring and sing with them. The song will take its share of you too.|Встать в кольцо и петь с ними. Песня возьмёт свою долю и с тебя.|Halqaga turib, ular bilan kuylash. Qo'shiq sendan ham o'z ulushini oladi.`,
      divan: `Put your shoulder to the valve wheel for Tilla-bek.|Налечь на колесо вентиля — для Тилла-бека.|Tillabek uchun jo'mrak g'ildiragiga yelka tirash.`,
      remember: `Lift Oydin up to the Heart.|Поднять Ойдин к Сердцу.|Oydinni Yurakka ko'tarish.`
    }[fac];
    const AGAINST = {
      singers: `Break the ring.|Разорвать кольцо.|Halqani buzish.`,
      divan: `Smash the valves.|Разбить вентили.|Jo'mraklarni sindirish.`,
      remember: `Knock the bowl from her hands.|Выбить чашу у неё из рук.|Kosani qo'lidan urib tushirish.`
    }[fac];
    play(opening.concat([nameLine]), () => hub(`The Heart|Сердце|Yurak`, QUESTIONS, [
      { label: WITH, id: 'with', cost: fac === 'singers' ? 5 : 0 },
      { label: AGAINST, id: 'against' },
      { label: `Lay your palm on the Heart and call him by his name.|Положить ладонь на Сердце и назвать его по имени.|Kaftni Yurakka qo'yib, uni ismi bilan chaqirish.`, id: 'speak',
        lock: f.name ? null : `You don't know his name.|Ты не знаешь его имени.|Uning ismini bilmaysan.` }
    ], o => {
      f2('heartStance', o.id);
      let lines;
      if (o.id === 'with') {
        rep(fac, 2);
        lines = {
          singers: [['', `You step into the ring and open your mouth. Your voice joins theirs, and the song takes a little from you too, the way a river takes the bank it runs along.|Ты встаёшь в кольцо и открываешь рот. Твой голос сливается с остальными, и песня забирает немного и у тебя — как река подмывает берег, вдоль которого течёт.|Halqaga turib, og'iz ochasan. Ovozing boshqalarnikiga qo'shiladi va qo'shiq sendan ham ozgina oladi — daryo yonidan oqib o'tgan qirg'og'ini yuvgandek.`, () => addVoid(5, `the Great Tithe|Великая десятина|Buyuk ushr`)]],
          divan: [['', `You put your shoulder to a wheel. It turns with a scream of brass. Memory begins to flow up the pipes, gold and thick, like honey drawn from a hive.|Ты наваливаешься плечом на колесо. Оно поворачивается с медным визгом. По трубам вверх идёт память — золотая и густая, как мёд из улья.|G'ildirakka yelka tirab bosasan. U mis chiyillashi bilan buriladi. Quvurlardan xotira ko'tarila boshlaydi — uyadan olingan asaldek tillarang va quyuq.`]],
          remember: [['', `You lift her the way you lifted her under the apricot tree. She smashes the first tumar against the Heart. Then the second. The Heart skips a beat.|Ты поднимаешь её, как когда-то под абрикосом. Она разбивает о Сердце первый тумар. Потом второй. Сердце пропускает удар.|Uni bir paytlar o'rik tagida ko'targaningdek ko'tarasan. U birinchi tumarni Yurakka urib sindiradi. Keyin ikkinchisini. Yurak bir zarbni o'tkazib yuboradi.`]]
        }[fac];
      } else if (o.id === 'against') {
        rep(fac, -2); trust(1);
        lines = {
          singers: [['', `You go through the ring like a stone through a window. The song breaks into seven pieces, then into seventy.|Ты проходишь сквозь кольцо, как камень сквозь окно. Песня разлетается на семь осколков, потом на семьдесят.|Halqani derazaga otilgan toshdek yorib o'tasan. Qo'shiq yetti bo'lakka, keyin yetmish bo'lakka sochilib ketadi.`], ['shirin', `You don't know what you've done. You don't know what's coming up out of him.|Ты не понимаешь, что натворил. Ты не знаешь, что сейчас из него поднимется.|Nima qilganingni bilmaysan. Hozir undan nima ko'tarilishini bilmaysan.`]],
          divan: [['', `You smash the first valve, then the next. Gold memory sprays over the mercenaries, and they freeze, weeping at strangers' weddings.|Ты разбиваешь один вентиль, потом другой. Золотая память брызжет на наёмников, и они застывают — рыдают на чужих свадьбах.|Birinchi jo'mrakni, keyin ikkinchisini sindirasan. Tillarang xotira yollanmalarga sachraydi va ular birovlarning to'yida yig'lagancha qotib qolishadi.`], ['tillabek', `That was very expensive, Ravshan. Everything you will ever own won't cover it.|Это было очень дорого, Равшан. Всего, что у вас когда-нибудь будет, не хватит, чтобы это покрыть.|Bu juda qimmatga tushdi, Ravshan. Umr bo'yi topadigan hamma narsangiz ham buni qoplamaydi.`]],
          remember: [['', `You knock the bowl from her hands. The tumars scatter across the wet floor. Three crack open on their own, singing, and the Heart lurches.|Ты выбиваешь чашу у неё из рук. Тумары рассыпаются по мокрому полу. Три раскалываются сами, с пением, и Сердце дёргается.|Kosani qo'lidan urib tushirasan. Tumarlar ho'l polga sochilib ketadi. Uchtasi o'z-o'zidan kuylab yoriladi va Yurak silkinib ketadi.`], ['oydin', `Toychoq. …It's too late. Three is enough to wake him. All you did was make it hurt.|Тойчок. …Поздно. Трёх хватит, чтобы его разбудить. Ты только сделал ему больнее.|Toychoq. …Kech. Uni uyg'otishga uchtasi ham yetadi. Sen faqat og'riqliroq qilding.`]]
        }[fac];
      } else {
        trust(1);
        lines = [
          ['', `You lay your palm on the wet wall of the Heart. It is warm and enormous and frightened. You say the only thing you have.|Ты кладёшь ладонь на мокрую стенку Сердца. Оно тёплое, огромное и испуганное. Ты говоришь единственное, что у тебя есть.|Kaftingni Yurakning ho'l devoriga qo'yasan. U iliq, ulkan va qo'rqib turibdi. Senda bor yagona narsani aytasan.`],
          ['hero', `Obi-Hayot.|Оби-Хаёт.|Obi Hayot.`],
          ['', `The Heart skips a beat. Everyone in the chamber feels it. For one breath, three hundred years of other people's lives stop screaming and listen.|Сердце пропускает удар. Это чувствуют все в зале. На один вдох триста лет чужих жизней перестают кричать и прислушиваются.|Yurak bir zarbni o'tkazib yuboradi. Zaldagi hamma buni sezadi. Bir nafasga birovlarning uch yuz yillik umri qichqirishdan to'xtab, quloq soladi.`]
        ];
      }
      const by = f.nargizaQ === 'believes' ? 'nargiza' : (f.oydin && f.oydin !== 'took') ? 'oydin' : 'water';
      f2('dreamBy', by);
      play(lines.concat([
        ['', `The Heart stops.|Сердце останавливается.|Yurak to'xtaydi.`],
        ['', `For one breath there is no sound anywhere: no water, no bells, no song. Then the Sleeper moves.|На один вдох всё стихает: ни воды, ни колоколов, ни песни. Потом Спящий шевелится.|Bir nafasga hamma narsa jim bo'ladi: na suv, na qo'ng'iroq, na qo'shiq. Keyin Uxlovchi qimirlaydi.`],
        ['', `Above you, Yodgor cracks. You feel it in your teeth: domes splitting, the Bazaar sliding, the Tail's roofs folding like paper.|Над тобой трескается Ёдгор. Ты чувствуешь это зубами: раскалываются купола, съезжает Базар, крыши Хвоста складываются, как бумага.|Tepangda Yodgor yoriladi. Buni tishlaring bilan sezasan: gumbazlar darz ketadi, Bozor siljiydi, Dum tomlari qog'ozdek buklanadi.`],
        ['sado', `Ravshan! Hold on to me. Hold on to my light. He's pulling…|Равшан! Держись за меня. Держись за мой свет. Он тянет…|Ravshan! Menga yopish. Nurimga yopishib ol. U tortyapti…`],
        {
          nargiza: ['nargiza', `I've got you, yodchi. I'm singing. Not a tithe: a road. Follow my voice. We're going into his dream.|Я держу тебя, ёдчи. Я пою — не десятину, а дорогу. Иди на мой голос. Мы уходим в его сон.|Seni ushlab turibman, yodchi. Kuylayapman — ushr emas, yo'l. Ovozimga ergash. Uning tushiga ketyapmiz.`],
          oydin: ['oydin', `Take my hand, Toychoq. I know the way in. I've been dreaming his dreams for twenty years.|Возьми меня за руку, Тойчок. Я знаю, как туда войти. Двадцать лет мне снятся его сны.|Qo'limdan ushla, Toychoq. Ichkariga yo'lni bilaman. Yigirma yildan beri uning tushlarini ko'raman.`],
          water: ['', `No one takes your hand. The water does. It closes over you, warm and salty, like the inside of a mother's coat.|Никто не берёт тебя за руку. Это делает вода. Она смыкается над тобой, тёплая и солёная, как изнанка маминого халата.|Hech kim qo'lingdan ushlamaydi. Buni suv qiladi. U iliq va sho'r bo'lib ustingda yopiladi — xuddi onaning to'nining ichidek.`]
        }[by],
        ['', `The water closes over your head. It's warm. It tastes of salt and apricots. You sink into the Sleeper's dream.|Вода смыкается над головой. Тёплая. На вкус — соль и абрикосы. Ты погружаешься в сон Спящего.|Suv boshing ustida yopiladi. Iliq. Ta'mi — tuz va o'rik. Uxlovchining tushiga cho'kib ketasan.`]
      ]), done);
    }));
  }
});
BARKS['a2_heart:start'] = [
  `Every beat, the floor jumps. And my light jumps with it. I can't hold it steady.|С каждым ударом пол подпрыгивает. И мой свет вместе с ним. Не могу удержать его ровно.|Har zarbda pol sakraydi. Nurim ham u bilan sakraydi. Uni tekis tutib turolmayapman.`,
  `Can you hear it under the beat? Voices. Thousands. All saying "mine".|Слышишь, под ударами? Голоса. Тысячи. И все твердят «моё».|Zarblar ostida eshityapsanmi? Ovozlar. Minglab. Hammasi «meniki» deyapti.`
];
BARKS['a2_heart:mid'] = [
  `Ravshan… if something happens down here. If I go out. Count to forty. I'll be there, at forty.|Равшан… если здесь что-то случится. Если я погасну. Считай до сорока. Я буду там, на сорока.|Ravshan… agar bu yerda biror narsa bo'lsa. Agar o'chib qolsam. Qirqqacha sana. Men qirqda bo'laman.`,
  `Faster. It's beating faster. Whatever is waiting at the gate, it has already started.|Чаще. Бьётся всё чаще. Что бы ни ждало у ворот, оно уже началось.|Tezroq. Tobora tez uryapti. Darvoza oldida nima kutayotgan bo'lsa ham, u allaqachon boshlandi.`
];

// test handle (read-only use)
G.ACT2 = { LANDS, RESTS, BOSSES, BARKS, ids: ['r_den', 'a2_karez', 'a2_streets', 'b_cistern', 'r_lamp', 'a2_old', 'a2_well', 'b_seven', 'r_rib', 'a2_spine', 'b_shrine', 'r_spine', 'a2_heart'], whose };
}
