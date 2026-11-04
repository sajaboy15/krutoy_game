/* =====================================================================
   Yodgor v2 — Act III «The Dream»: plan entries 26–31, the finale with
   Obi-Hayot after Ajdaho, and every ending with its epilogue.
   Owner: 72_act3.js. Reads the flags of 70/71 (see design/CONTRACT.md).
   Sets: sadoFate (remember|keep|oydin|tale) and its own a3 flags:
     mehriSon (carried|waits|told), wedding (ended|left|sealed),
     sandVow 1, sandSong 1, rustam (forgiven|unforgiven|tea), a3queue (close|collect|pass).
   Act II flags paid off here: relics, dreamBy, nest, farrukh, rustamWord, chainSong, alpTumars+faction.
   Style v3 (design/STYLE.md): question hubs before every real decision, choices are lines the
   hero says or plain actions (no tags), costs readable from the meaning.
   Everything is wrapped in a block so the helpers stay private.
   ===================================================================== */
{
/* ---------- helpers ---------- */
const A3 = {};
// glue three-language strings part by part: join3('a|b|c', 'd|e|f') -> 'a d|b e|c f'
const join3 = (...xs) => {
  const ps = xs.filter(Boolean).map(x => String(x).split('|'));
  return [0, 1, 2].map(i => ps.map(p => p[i] || '').filter(Boolean).join(' ')).join('|');
};
const obiWho = () => (F().name ? 'obi' : 'sleeper');
const oydinKnown = () => { const f = F(); return !!(f.oydin || f.oydinName || f.masked); };
const oydinHere = () => !!F().oydin;                 // she met him as his sister in Old Yodgor
const tookTumars = () => (F().relics ? F().relics === 'ravshan' : F().oydin === 'took');
const fate = () => F().sadoFate || null;
const sadoTalks = () => !!F().sado;                  // Sado is still a voice in his head
const topRep = () => {
  const rp = R().rep || {};
  return [['singers', rp.singers || 0], ['divan', rp.divan || 0], ['remember', rp.remember || 0]].sort((a, b) => b[1] - a[1])[0][0];
};
const faction = () => F().faction || (F().oydin === 'joined' ? 'remember' : topRep());
const ifSado = line => () => (sadoTalks() ? ['sado', line] : null);

// why the Tale is out of reach (null when it is possible). forFate: asked while choosing Sado's fate.
function taleMissing(forFate) {
  const f = F();
  if (f.nargizaQ !== 'believes') return `It needs a voice he can hear. Nargiza won't sing it, or can't any more.|Нужен голос, который он слышит. Наргиза петь не станет — или уже не сможет.|Buning uchun u eshitadigan ovoz kerak. Nargiza kuylamaydi — yoki endi kuylay olmaydi.`;
  if (!f.truth || !f.name) return `You don't know his real name, or what the Seven really did.|Ты не знаешь ни его настоящего имени, ни того, что на самом деле сделали Семеро.|Sen uning asl ismini ham, Yettov aslida nima qilganini ham bilmaysan.`;
  if (!f.tales) return `Turab never gave you the old tales.|Тураб так и не отдал тебе старые сказания.|Turob eski ertaklarini senga aytib bermagan.`;
  if (!forFate && f.sadoFate !== 'tale' && f.sadoFate !== 'remember') return `You have no story of your own to tell him. You never let yourself remember Oydin.|Тебе нечего рассказать ему от себя. Ты так и не дал себе вспомнить Ойдин.|Unga o'zingdan aytadigan hikoyang yo'q. Oydinni eslashdan o'zing qochding.`;
  if ((R().void || 0) >= 60) return `There's too little of you left to tell anything.|От тебя осталось слишком мало — рассказывать уже некому.|Sendan juda oz narsa qoldi — aytib beradigan odamning o'zi yo'q.`;
  return null;
}
const canTale = () => !taleMissing(false);

/* =====================================================================
   26 · a3_dream — The Dream of the City
   ===================================================================== */
BARKS['a3_dream:start'] = [
  `The houses here are built out of mornings. Look, that wall is somebody's wedding.|Тут дома из утр сложены. Смотри, вон та стена — чья-то свадьба.|Bu yerda uylar tonglardan qurilgan. Qara, anavi devor — kimningdir to'yi.`,
  `Every lamp is somebody's last evening. There are far too many lamps.|Каждая лампа — чей-то последний вечер. Что-то слишком много тут ламп.|Har bir chiroq — kimningdir so'nggi oqshomi. Chiroq juda ko'p-ku bu yerda.`
];
BARKS['a3_dream:mid'] = [
  `The streets keep shifting. I think he's tossing in his sleep.|Улицы всё время ползут. По-моему, он ворочается во сне.|Ko'chalar qimirlab turibdi. Menimcha, u uyqusida u yoqdan bu yoqqa ag'darilyapti.`,
  `I smell bread. Somewhere ahead. It makes me want to run. Towards it or away, I don't know.|Хлебом пахнет. Где-то впереди. И мне почему-то хочется бежать. Туда или оттуда — не знаю.|Non hidi kelyapti. Oldinda bir joyda. Negadir yugurgim kelyapti. Unga qarabmi, undan qochibmi — bilmayman.`
];

LAND('a3_dream', {
  name: `The Dream of the City|Сон о городе|Shahar tushi`,
  sub: `Three hundred years of memories laid out as streets|Улицы из трёхсот лет чужой памяти|Ko'chaga aylangan uch yuz yillik xotira`,
  start: done => {
    const f = F();
    play([
      ['', `You come to on your feet. The street is paved with doorsteps, hundreds of them, each worn down by different feet.|Приходишь в себя — стоя. Улица вымощена порогами. Их сотни, и каждый стёрт чужими ногами.|O'zingga kelsang, oyoqda turibsan. Ko'cha ostonalardan terilgan. Yuzlab ostona, har biri boshqa-boshqa oyoqlardan yeyilgan.`],
      (f.dreamBy ? f.dreamBy === 'nargiza' : f.nargizaQ === 'believes')
        ? ['nargiza', `I've got the song, yodchi. It'll hold till dawn, maybe less. So walk. And don't stop for anything that turns to look at you.|Песню я держу, ёдчи. До рассвета продержу — а может, и нет. Так что иди. И не останавливайся, если что-то на тебя оглянется.|Qo'shiqni ushlab turibman, yodchi. Tonggacha chidayman, balki undan ham kam. Shuning uchun yuraver. Senga o'girilib qaragan narsa oldida to'xtama.`]
        : (f.dreamBy ? f.dreamBy === 'oydin' : (faction() === 'remember' || f.oydin === 'joined'))
          ? ['oydin', `You're in, Toychoq. I'm somewhere behind you, in the old streets. Walk where the water gets warmer. That's him.|Ты внутри, Тойчок. Я где-то позади, в старых улицах. Иди туда, где вода теплее. Там он.|Ichkaridasan, Toychoq. Men orqangdaman, eski ko'chalarda. Suv iliqroq tomonga yur. O'sha yoqda u.`]
          : f.dreamBy === 'water'
            ? ['', `At the Heart the water closed over your head, warm as a bathhouse. Nobody sent you. He swallowed you, the way he swallows everything.|У Сердца вода сомкнулась над головой, тёплая, как в бане. Никто тебя сюда не посылал. Он просто тебя проглотил. Как глотает всё.|Yurak yonida suv boshing uzra yopildi — hammomdagidek iliq. Seni bu yerga hech kim yubormagan. U seni shunchaki yutib yubordi. Hamma narsani yutgani kabi.`]
            : ['', `Far above, someone is still singing the song that pushed you down here. The words fall on you like rain.|Где-то далеко наверху ещё поют ту песню, что столкнула тебя сюда. Слова сыплются сверху, как дождь.|Allaqayerda, juda tepada, seni bu yerga itarib tushirgan qo'shiqni hamon aytishyapti. So'zlar yomg'irdek yog'ilyapti.`],
      ['sado', `It isn't dark. It's... crowded. Everyone's remembering at once.|Тут не темно. Тут... людно. Все вспоминают разом.|Qorong'i emas. Faqat... tiqilinch. Hamma birdan eslayapti.`],
      ['hero', `Where are we?|Где это мы?|Bu qayer?`],
      ['sado', `In his dream. The Sleeper's. He dreams of everyone he ever swallowed. Three hundred years of people. This is their city.|У него во сне. У Спящего. Ему снятся все, кого он проглотил. Триста лет людей. Это их город.|Uning tushida. Uxlovchining. U yutgan hamma odamlarni tushida ko'radi. Uch yuz yillik odamlarni. Bu — ularning shahri.`],
      ['sado', `So we look for him. The real him, somewhere at the very bottom. And Ravshan, don't step on the faces in the cobbles. They mind.|Значит, ищем его самого. Где-то на самом дне. И, Равшан, не наступай на лица в мостовой. Они обижаются.|Demak, uning o'zini qidiramiz. Allaqayerda, eng tubida. Ravshan, yo'lkadagi yuzlarni bosma. Xafa bo'lishadi.`]
    ], done);
  },
  // people from the earlier acts, as somebody remembers them
  mid: done => {
    const f = F(), seen = [];
    const alp = {
      helped: `On a corner, Tail folk dig out a fallen house. In this memory they always make it in time. Alp lifts the boy out, again and again, and never tires.|На углу люди из Хвоста разбирают рухнувший дом. В этом воспоминании они всегда успевают. Алп вытаскивает мальчишку — раз за разом, и не устаёт.|Muyulishda Dum odamlari qulagan uyni titishyapti. Bu xotirada ular doim ulguradi. Alp bolani qayta-qayta tortib chiqaradi va sira charchamaydi.`,
      paid: `Neighbours dig out a fallen house. At the edge a yodchi counts coins into the dust and leaves. That's you, the way they remember you: generous, and already gone.|Соседи разбирают рухнувший дом. С краю ёдчи отсчитывает в пыль монеты и уходит. Это ты, каким тебя запомнили: щедрый — и уже за углом.|Qo'shnilar qulagan uyni titishyapti. Chetda bir yodchi changga tanga sanab tashlaydi-yu, jo'nab qoladi. Bu sen. Seni shunday eslashadi: saxiy, lekin allaqachon ketib bo'lgan.`,
      collected: `Neighbours dig out a fallen house. A yodchi stands over the hole with the debt book open. That's you, the way they remember you.|Соседи разбирают рухнувший дом. Над ямой стоит ёдчи с раскрытой долговой книгой. Это ты. Таким тебя и запомнили.|Qo'shnilar qulagan uyni titishyapti. Chuqur tepasida qarz daftarini ochib, bir yodchi turibdi. Bu sen. Seni shunday eslab qolishgan.`
    }[f.alp];
    if (alp) seen.push(alp);
    const davron = {
      led: `Three kids run past with waterskins on their backs, laughing. They remember the night you led them out as a game.|Мимо с хохотом пробегают трое детей, на спинах бурдюки. Ту ночь, когда ты вывел их из города, они запомнили как игру.|Uchta bola orqasida mesh bilan qiqirlab yugurib o'tadi. Ularni shahardan olib chiqqan tuningni ular o'yin deb eslashadi.`,
      reported: `Three waterskins hang on a hook, dripping. Nobody here will say what's inside.|На крюке висят три бурдюка, с них капает. Что внутри — тут никто не скажет.|Ilgakda uchta mesh osig'liq, tomchilab turibdi. Ichida nima borligini bu yerda hech kim aytmaydi.`,
      bribe: `A caravan-bashi counts coins under a lamp. Every coin has a child's face on it.|Караван-баши пересчитывает под лампой монеты. На каждой — детское лицо.|Karvonboshi chiroq tagida tanga sanayapti. Har bir tangada bir bolaning yuzi.`,
      bluff: `An inspector of the Well walks in circles, sure he's forgotten something. He has. You saw to that.|Смотритель Колодца ходит кругами — уверен, что что-то забыл. Так и есть. Ты об этом позаботился.|Quduq noziri nimadir esidan chiqqanini sezib, aylanib yuribdi. Rostdan ham chiqqan. Buni sen uddalagansan.`
    }[f.davron];
    if (davron) seen.push(davron);
    const hound = {
      shown: `A man in gilded armour kneels in a garden, digging up what he once buried. It's Bahodir, learning whose loyalty he wore.|Человек в позолоченных доспехах стоит на коленях в саду и выкапывает то, что когда-то сам зарыл. Это Баходир. Он узнаёт, чью верность носил.|Zarhal sovutli odam bog'da tiz cho'kib, bir paytlar o'zi ko'mgan narsani kovlayapti. Bu Bahodir. Kimning sadoqatini kiyib yurganini bilyapti.`,
      killed: `A golden Bahodir stands in a garden, loyal for ever. That's how Tilla-bek remembers him. Nobody else remembers him at all.|В саду стоит золотой Баходир, верный навеки. Так его помнит Тилла-бек. Больше его не помнит никто.|Bog'da Bahodirning oltin haykali turibdi — abadiy sodiq. Tillabek uni shunday eslaydi. Boshqa hech kim uni eslamaydi.`,
      spared: `Bahodir wanders among the sleepers without his armour. Someone remembers him as kind. Maybe it's him.|Баходир бродит среди спящих без доспехов. Кто-то помнит его добрым. Может быть, он сам.|Bahodir uxlayotganlar orasida sovutsiz kezib yuribdi. Kimdir uni mehribon deb eslaydi. Balki o'zidir.`
    }[f.hound];
    if (hound && seen.length < 3) seen.push(hound);
    const gul = {
      returned: `A Tail girl walks arm in arm with a boy made of evening light. It's Gulnora. Her first love is hers again, and she isn't afraid any more.|Девушка из Хвоста идёт под руку с парнем из вечернего света. Это Гульнора. Её первая любовь снова при ней, и ей больше не страшно.|Dumlik bir qiz kechki shu'ladan yasalgan yigit bilan qo'ltiqlashib ketyapti. Bu Gulnora. Ilk muhabbati yana o'zida, endi u qo'rqmaydi.`,
      left: `In the Ark, a merchant's daughter dances with a boy she never met. In the Tail, Gulnora doesn't know what she lost. The dream knows.|В Арке купеческая дочка танцует с парнем, которого в глаза не видела. В Хвосте Гульнора не знает, что потеряла. Сон знает.|Arkda savdogarning qizi umrida ko'rmagan yigit bilan raqsga tushyapti. Dumda Gulnora nimani yo'qotganini bilmaydi. Tush biladi.`,
      blackmail: `An empty wedding dress runs down every street at once, looking for the man who sold it twice.|Пустое свадебное платье бежит по всем улицам сразу. Ищет того, кто продал его дважды.|Bo'm-bo'sh kelinlik ko'ylagi hamma ko'chadan birdaniga yugurib o'tadi. Uni ikki marta sotgan odamni qidiryapti.`
    }[f.gulnora];
    if (gul && seen.length < 3) seen.push(gul);
    const lines = [['', `People from the city above drift past. Not as they are: as someone remembers them.|Мимо плывут люди из города наверху. Не такие, как есть, — такие, какими их кто-то запомнил.|Yonginangdan tepadagi shahar odamlari suzib o'tadi. O'zlari qanday bo'lsa, unday emas — kimdir qanday eslab qolgan bo'lsa, shunday.`]];
    for (const s of seen) lines.push(['', s]);
    if (!seen.length) lines.push(['', `A yodchi in a grey coat knocks three times, opens his book, knocks again. Someone remembers you very clearly.|Ёдчи в сером халате стучит три раза, раскрывает книгу и стучит снова. Кто-то запомнил тебя очень отчётливо.|Kulrang to'nli yodchi uch marta taqillatadi, daftarini ochadi, yana taqillatadi. Kimdir seni juda aniq eslab qolgan.`]);
    lines.push(['sado', `They remember you everywhere, Ravshan. On some streets you're the kind one. On others you're why people bolt their doors.|Тебя тут везде помнят, Равшан. На одних улицах ты добрый. На других из-за тебя запирают двери на засов.|Bu yerda seni hamma joyda eslashadi, Ravshan. Ba'zi ko'chalarda sen mehribonsan. Ba'zilarida esa sen tufayli eshikka zulfin solishadi.`]);
    lines.push(['hero', `Both are true.|Правда и то, и другое.|Ikkalasi ham rost.`]);
    play(lines, done);
  },
  stones: [
    { who: 'memory', text: `A potter's last morning: he opens the kiln, and for once not one bowl has cracked. He sold this to pay for his daughter's wedding. She doesn't know.|Последнее утро гончара. Он открывает печь — и впервые ни одна пиала не треснула. Он продал это утро, чтобы справить дочери свадьбу. Она не знает.|Kulolning so'nggi tongi. Xumdonni ochadi — bu safar birorta ham kosa yorilmagan. U bu tongni qizining to'yi uchun sotgan. Qizi bilmaydi.` },
    { who: 'memory', text: `A caravan girl sees Yodgor for the first time: green roofs steaming after rain, the smell of wet clay. The next spring she was sold with the rest of the caravan.|Девочка из каравана впервые видит Ёдгор: после дождя парят зелёные крыши, пахнет мокрой глиной. Следующей весной её продали вместе со всем караваном.|Karvondagi qizcha Yodgorni ilk bor ko'ryapti: yomg'irdan keyin yashil tomlar bug'lanyapti, ho'l loy hidi. Keyingi bahor uni butun karvon bilan qo'shib sotib yuborishdi.` },
    { who: 'memory', text: `An old Singer tastes the same tumar for the four-hundredth time. It's thinner each time. He grieves for it like a favourite robe worn through at the elbows.|Старый Певец в четырёхсотый раз пробует один и тот же тумар. С каждым разом тот всё тоньше. Старик жалеет его, как любимый халат, протёртый на локтях.|Keksa Xonanda bitta tumarni to'rt yuzinchi marta totib ko'ryapti. Har safar u yupqalashadi. Chol uni tirsagi titilgan sevimli to'nidek ayaydi.` }
  ],
  memory: {
    id: 'm_bread',
    lines: [
      ['memory', `Dawn. Mother slaps dough onto the tandir wall. The first flatbread is always torn in three: the big piece for Father, then yours, then a small one for someone shorter than you.|Рассвет. Мама шлёпает тесто на стенку тандыра. Первую лепёшку всегда рвут на три: большой кусок — отцу, потом тебе, а маленький — кому-то, кто ниже тебя ростом.|Tong. Onang xamirni tandirga yopadi. Birinchi non doim uchga bo'linadi: kattasi — otangga, keyin senga, eng kichigi — sendan pastroq kimgadir.`],
      ['memory', `A small hand takes it. Flour on the knuckles. You can't see the face.|Его берёт маленькая рука. На костяшках мука. Лица не видно.|Uni kichkina bir qo'l oladi. Barmoqlari unga belangan. Yuzi ko'rinmaydi.`],
      ['sado', `...She always got the crust. She liked the crust best.|...Ей всегда доставалась корочка. Она корочку больше всего любила.|...Unga doim nonning chekkasi tegardi. Chekkasini yaxshi ko'rardi.`],
      ['hero', `How do you know that?|А ты откуда знаешь?|Sen qayerdan bilasan?`],
      ['sado', `I don't. I just... do.|Не знаю. Просто... знаю.|Bilmayman. Shunchaki... bilaman.`]
    ]
  },
  people: [{ look: 'hollow', x: 0 }, { look: 'child', x: 14 }, { look: 'tailwoman', x: 26 }, { look: 'tailman', x: 40 }, { look: 'widow', x: 56 }],
  exit: done => {
    const f = F();
    const mehri = {
      force: ['mehri', `You again. Go on, take him. Take my boy. You were so quick the first time, I still think I dreamed it.|Опять ты. Ну, бери. Бери моего мальчика. В тот раз ты так быстро управился, что мне до сих пор кажется — приснилось.|Yana sen. Qani, ol. O'g'limni ol. U safar shunaqa tez qildingki, hali ham tush ko'rgandirman, deyman.`],
      fake: ['mehri', `The tumar's a fake, yodchi. You know it, I know it. Down here we keep passing it round, like bread nobody eats.|Тумар-то поддельный, ёдчи. Ты знаешь, я знаю. А мы тут всё передаём его из рук в руки, как хлеб, который никто не ест.|Tumar soxta, yodchi. Sen ham bilasan, men ham. Bu yerda uni qo'ldan-qo'lga uzataveramiz, hech kim yemaydigan nondek.`],
      paid: ['mehri', `You paid for me with your own memory. Down here I keep trying to give it back. My hands go right through yours.|Ты за меня своей памятью заплатил. Я тут всё пытаюсь её вернуть. А руки сквозь твои проходят.|Men uchun o'z xotirang bilan to'lading. Bu yerda uni qaytarib bermoqchi bo'laman. Qo'llarim qo'lingdan o'tib ketadi.`],
      written: ['mehri', `You wrote me down as paid and walked on. Down here you do it a thousand times a night. Kind, every single time.|Записал меня в уплатившие и пошёл дальше. Тут ты это тысячу раз за ночь делаешь. И каждый раз — по-доброму.|Meni «to'ladi» deb yozib qo'yib, yo'lingda ketaverding. Bu yerda buni har kecha ming marta qilasan. Har safar yaxshilik qilib.`]
    }[f.widow] || ['neighbour', `Yodchi. The book, yodchi. Where do we make our mark?|Ёдчи. Книга, ёдчи. Где нам расписаться?|Yodchi. Daftar, yodchi. Qayerga qo'l qo'yamiz?`];
    play([
      ['', `Before the gate stands a queue. You know this queue. For twenty years you stood at its head every Night of Payment, with the book and the wax.|У ворот — очередь. Ты эту очередь знаешь. Двадцать лет каждую Ночь Уплаты ты стоял в её голове — с книгой и воском.|Darvoza oldida navbat. Bu navbatni taniysan. Yigirma yil har To'lov kechasi sen uning boshida daftar va mum bilan turgansan.`],
      ['', `Here it never ends. Everyone you ever took a memory from is paying again, for ever, because that's how they remember that night.|Здесь она не кончается. Все, у кого ты когда-нибудь забирал память, платят снова и снова — потому что так они запомнили ту ночь.|Bu yerda u hech qachon tugamaydi. Sen kimdan xotira olgan bo'lsang, hammasi qayta-qayta to'layapti. O'sha tunni ular shunday eslab qolishgan.`],
      mehri,
      ['sado', `They're holding out their hands. To you. Ravshan, what do you even do with a debt in a dream?|Они протягивают руки. Тебе. Равшан, а что вообще делают с долгом во сне?|Ular qo'l cho'zishyapti. Senga. Ravshan, tushdagi qarz bilan nima qilinadi o'zi?`]
    ], () => hub(`The queue of the Night of Payment|Очередь Ночи Уплаты|To'lov kechasi navbati`, [
      { label: `— How many of them are there?|— Сколько их тут?|— Bular qancha o'zi?`, lines: [
        ['hero', `Everyone I ever collected from. Twenty years of Nights of Payment.|Все, с кого я брал. Двадцать лет Ночей Уплаты.|Kimdan olgan bo'lsam, hammasi. Yigirma yillik To'lov kechalari.`],
        ['sado', `There are so many. Ravshan, there are so many of them.|Их так много. Равшан, их так много.|Ular juda ko'p. Ravshan, ular juda ko'p-ku.`],
        ['hero', `I stopped counting in the third year.|Я бросил считать на третий год.|Uchinchi yili sanashni tashlaganman.`]
      ] },
      { label: `— Sado, what if I close the book?|— Садо, а если я закрою книгу?|— Sado, daftarni yopsam-chi?`, lines: [
        ['sado', `Up there? Nothing changes. Nobody gets anything back.|Наверху? Ничего не изменится. Никому ничего не вернут.|Tepadami? Hech narsa o'zgarmaydi. Hech kimga hech narsa qaytmaydi.`],
        ['sado', `But here they'd stop waiting. It's his dream. Maybe he'll remember them differently. Maybe they will too.|Но здесь они перестанут ждать. Это же его сон. Может, он запомнит их по-другому. И они сами себя — тоже.|Lekin bu yerda kutishdan to'xtashadi. Bu uning tushi-ku. Balki u ularni boshqacha eslar. Ular ham o'zlarini.`],
        ['sado', `Only it's a lie, you know. A kind one. You'd be telling them the debt is gone, and up there it isn't.|Только это враньё, понимаешь? Доброе. Ты скажешь им, что долга нет, а наверху он никуда не делся.|Faqat bu yolg'on-ku. Yaxshi yolg'on. Ularga qarz yo'q deysan, tepada esa u joyida turibdi.`]
      ] },
      { label: `— And if I collect?|— А если собрать?|— Yig'ib olsam-chi?`, lines: [
        ['sado', `The dream pays in real tilla. I can feel it. Heavy and cold.|Сон платит настоящей тиллой. Я чувствую. Тяжёлой и холодной.|Tush haqiqiy tilla bilan to'laydi. Sezyapman. Og'ir, sovuq.`],
        ['sado', `And they'll get straight back in line. You'll only remind them who you are. ...And yourself too.|А они тут же встанут обратно в очередь. Ты им просто напомнишь, кто ты такой. ...И себе тоже.|Ular esa darhol yana navbatga turishadi. Sen ularga kimligingni eslatib qo'yasan, xolos. ...O'zingga ham.`]
      ] }
    ], [
      { id: 'close', label: `Write "paid" by every name and close the book.|Написать напротив каждого имени «уплачено» и закрыть книгу.|Har bir ismning qarshisiga «to'landi» deb yozib, daftarni yopish.` },
      { id: 'collect', label: `Take out the wax and collect, like every year.|Достать воск и собирать, как каждый год.|Mumni olib, har yilgidek yig'ish.`, cost: 3 },
      { id: 'pass', label: `"Nobody up there is paid. I won't lie to them down here." Walk past.|«Наверху за них никто не заплатил. И здесь я им врать не буду». Пройти мимо.|«Tepada hech kim to'lamagan. Bu yerda ham ularga yolg'on gapirmayman». Yonidan o'tib ketish.` }
    ], o => {
      F().a3queue = o.id; save();
      if (o.id === 'close') play([
        ['', `You open the book on your knee and write the same word down the page until the ink runs out. Then you go on with the wax.|Ты раскрываешь книгу на колене и пишешь одно и то же слово, строку за строкой, пока не кончатся чернила. Потом пишешь воском.|Daftarni tizzangga qo'yib, siyoh tugaguncha bitta so'zni qator-qator yozasan. Keyin mum bilan yozaverasan.`],
        ['', `One by one they lower their hands. Some sit down on the doorsteps, like people who've been standing a very long time.|Один за другим они опускают руки. Кто-то садится прямо на порог — как человек, который очень долго простоял.|Birin-ketin qo'llarini tushirishadi. Ba'zilari juda uzoq tik turib qolgan odamdek ostonaga cho'kadi.`],
        ['sado', `"Paid." Every line says "paid". ...You know, I liked that. Even if it isn't true.|Уплачено. Везде написано: уплачено. ...Знаешь, мне понравилось. Хоть это и неправда.|To'landi. Hamma qatorda «to'landi». ...Bilasanmi, menga yoqdi. Rost bo'lmasa ham.`],
        ['hero', `It's his dream. Maybe he'll remember it this way.|Это его сон. Может, он так и запомнит.|Bu uning tushi. Balki shunday eslab qolar.`]
      ], () => { trust(1); rep('tail', 2); done(); });
      else if (o.id === 'collect') play([
        ['', `You collect. The tumars are warm and weigh nothing. The dream pays you in real tilla, heavy and cold. At the back of the queue the first ones are already lining up again.|Ты собираешь. Тумары тёплые и ничего не весят. Сон расплачивается настоящей тиллой — тяжёлой, холодной. А в хвосте очереди первые уже встают заново.|Yig'asan. Tumarlar iliq, vaznsiz. Tush haqiqiy tilla bilan to'laydi — og'ir, sovuq. Navbat oxirida birinchilari allaqachon yana turib olishgan.`],
        ['sado', `You didn't even look at them.|Ты даже не посмотрел на них.|Ularga qaramading ham.`]
      ], () => { gold(90); trust(-1); addVoid(3, `old habits|старая привычка|eski odat`); done(); });
      else play([
        ['', `You walk past. No one calls after you. In this dream you aren't the worst thing that ever happened to them. Just the most familiar.|Ты проходишь мимо. Никто не окликает. В этом сне ты не самое страшное, что с ними случалось. Просто самое привычное.|Yonidan o'tib ketasan. Hech kim ortingdan chaqirmaydi. Bu tushda sen ular boshiga tushgan eng yomon narsa emassan. Shunchaki eng ko'nikib qolgani.`],
        ['sado', `They don't even blame you. Somehow that's worse.|Они тебя даже не винят. И от этого почему-то хуже.|Seni ayblashmaydi ham. Negadir shunisi yomonroq.`]
      ], done);
    }));
  }
});

/* =====================================================================
   27 · a3_wedding — The Drowned Wedding
   ===================================================================== */
BARKS['a3_wedding:start'] = [
  `Since we got here the musicians have played the same eight bars four times. I counted. You're a bad influence.|Пока мы тут, музыканты четыре раза сыграли одни и те же восемь тактов. Я считала. Это ты меня испортил.|Kelganimizdan beri sozandalar o'sha sakkiz taktni to'rt marta chalishdi. Sanadim. Sendan yuqdi bu.`,
  `The bride keeps lifting her veil and dropping it. Like she's forgotten what she wanted to see.|Невеста то поднимет фату, то опустит. Будто забыла, что хотела увидеть.|Kelin yuzidagi pardani ko'taradi-yu, yana tushiradi. Nimani ko'rmoqchi bo'lganini unutgandek.`
];
BARKS['a3_wedding:mid'] = [
  () => (F().widow === 'force' && F().nest !== 'tail'
    ? `Someone in the crowd is calling for his mum. A boy's voice.|В толпе кто-то зовёт маму. Голос мальчишеский.|Olomon ichida kimdir onasini chaqiryapti. Bolakayning ovozi.`
    : `The water gets warmer the further in we go. Like walking into a fever.|Чем дальше, тем теплее вода. Будто идём прямо в жар.|Ichkarilagan sari suv iliqlashyapti. Xuddi isitmaning ichiga kirib borayotgandekmiz.`)
];

LAND('a3_wedding', {
  name: `The Drowned Wedding|Утонувшая свадьба|Cho'kkan to'y`,
  sub: `The same eight bars for two hundred years|Двести лет одни и те же восемь тактов|Ikki yuz yildan beri o'sha sakkiz takt`,
  start: [
    ['', `Knee-deep water, warm as a bathhouse. Lanterns float on it, still lit. Ahead a doira beats a wedding rhythm, but the song never reaches its end.|Вода по колено, тёплая, как в бане. По ней плывут фонари — и всё ещё горят. Впереди дойра бьёт свадебный ритм, но песня никак не дойдёт до конца.|Suv tizzagacha, hammomdagidek iliq. Ustida fonuslar suzib yuribdi, hali ham yonib turibdi. Oldinda doira to'y usulini chalyapti, lekin qo'shiq hech oxiriga yetmaydi.`],
    ['sado', `A wedding! Can we go— oh. Oh. They're all soaking wet.|Свадьба! А можно нам... ой. Ой. Они же все мокрые насквозь.|To'y! Boraylik-chi... voy. Voy. Hammasi shalabbo-ku.`],
    ['hero', `The karez flood, two hundred years ago. A whole wedding went under. The Divan sold the memory of it for a century. Happy, and cheap.|Потоп в кяризах, двести лет назад. Целая свадьба ушла под воду. Диван потом сто лет торговал памятью о ней. Весёлой и дешёвой.|Ikki yuz yil oldin korizni suv bosgan. Butun boshli to'y suv ostida qolgan. Devon keyin yuz yil uning xotirasini sotgan. Quvnoq, arzon xotira.`],
    ['sado', `They sold it so many times it got stuck. Like a tune you can't get out of your head.|Её столько раз продавали, что она застряла. Как мотив, который не выходит из головы.|Uni shuncha ko'p sotishganki, tiqilib qolgan. Boshdan chiqmay qolgan kuydek.`]
  ],
  mid: [
    ['', `A guest in soaked silk pushes a bowl into your hands. "To the bride and groom!" The bowl is full of karez water. He drinks his, chokes a little, laughs, and pours again.|Гость в мокром шёлке суёт тебе пиалу: «За молодых!» В пиале — вода из кяриза. Он пьёт свою, захлёбывается, смеётся и наливает снова.|Ho'l ipak kiygan mehmon qo'lingga kosa tutqazadi: «Kelin-kuyovga!» Kosada koriz suvi. U o'zinikini ichadi, yo'talib qoladi, kuladi-da, yana quyadi.`],
    ['sado', `Don't drink it. Please. Just hold it till he looks away.|Не пей. Пожалуйста. Просто подержи, пока он не отвернётся.|Ichma. Iltimos. U boshqa yoqqa qaraguncha ushlab turaver.`]
  ],
  stones: [
    { who: 'memory', text: `The groom's mother, an hour before the water. She tastes the plov and thinks nothing bad can ever happen again.|Мать жениха за час до воды. Пробует плов и думает: ну теперь-то уж ничего плохого не случится.|Kuyovning onasi, suv kelishidan bir soat oldin. Palovni tatib ko'radi-da, endi hech qachon yomon narsa bo'lmaydi, deb o'ylaydi.` },
    { who: 'memory', text: `A musician's memory, worn thin by tasting. Only his fingers are left, the doira skin, the beat. His face was the first thing they sold.|Память музыканта, протёртая чужими пробами. Остались только пальцы, кожа дойры и ритм. Лицо продали первым.|Sozandaning totilaverib yupqalashgan xotirasi. Barmoqlari, doiraning terisi va usul qolgan, xolos. Yuzini birinchi bo'lib sotishgan.` },
    { who: 'memory', text: `A guest who left early with a headache. He lived to ninety. The last thing he ever sold was this: the night he didn't drown.|Гость, который ушёл пораньше: разболелась голова. Дожил до девяноста. Последним он продал вот это — ночь, когда он не утонул.|Boshi og'rib, to'ydan erta ketgan mehmon. To'qsonga kirdi. Eng oxirida mana shuni sotdi: cho'kmay qolgan tunini.` }
  ],
  memory: {
    id: 'm_navvot',
    lines: [
      ['memory', `A neighbour's wedding, the summer before the Small Awakening. You stand someone small on a stool so she can see the bride. Passing, the bride presses a piece of navvot into her fist.|Свадьба у соседей, лето перед Малым Пробуждением. Ты ставишь кого-то маленького на табуретку, чтобы ей было видно невесту. Невеста, проходя, вкладывает ей в кулачок кусочек навата.|Qo'shnining to'yi, Kichik Uyg'onishdan oldingi yoz. Kelinni ko'rsin deb, kimnidir — kichkinagina — kursiga chiqarib qo'yasan. Kelin o'tib ketayotib uning mushtchasiga bir bo'lak navvot qistiradi.`],
      ['memory', `She saves it for you all evening. It melts in her hand through the music and the plov. At midnight she gives it to you anyway: warm, sticky, shaped like her fingers.|Весь вечер она бережёт его для тебя. Он тает у неё в руке — под музыку, под плов. В полночь она всё равно отдаёт его тебе: тёплый, липкий, по форме её пальцев.|Butun oqshom uni sen uchun asraydi. Musiqa, palov — navvot qo'lida eriydi. Yarim tunda baribir senga beradi: iliq, yopishqoq, barmoqlarining izi tushgan.`],
      ['sado', `You ate it. You said it was the best thing you'd ever eaten. ...How do I know what you said?|Ты его съел. Сказал, что вкуснее в жизни ничего не ел. ...А откуда я знаю, что ты сказал?|Sen uni yeding. Umrimda bundan mazasini yemaganman, deding. ...Nima deganingni men qayerdan bilaman?`]
    ]
  },
  people: [{ look: 'caravan', x: 0 }, { look: 'child', x: 18 }, { look: 'tailwoman', x: 30 }, { look: 'bride', x: 48 }],
  peopleAfter: group => { if ((F().widow !== 'force' || F().nest === 'tail') && group[1]) group[1].alpha = 0; },
  exit: done => {
    const force = F().widow === 'force' && F().nest !== 'tail';
    const bride = () => play([
      ['', `At the gate the bride stands alone in the water. Veil up, veil down. The groom is three steps away. For two hundred years she hasn't taken the fourth.|У ворот в воде одна стоит невеста. Фата вверх, фата вниз. Жених в трёх шагах. Четвёртый шаг она не может сделать уже двести лет.|Darvoza oldida kelin suvda yolg'iz turibdi. Parda tepaga, parda pastga. Kuyov uch qadam narida. Ikki yuz yildan beri u to'rtinchi qadamni bosolmaydi.`],
      ['bride', `The water comes on the fourth step. Everybody knows that. If I don't take it, the music goes on. That's kind of me, isn't it?|На четвёртом шаге приходит вода. Это все знают. Не шагну — музыка будет играть. Это ведь по-доброму, правда?|To'rtinchi qadamda suv keladi. Buni hamma biladi. Bosmasam, musiqa chalinaveradi. Bu yaxshilik-ku, to'g'rimi?`],
      ['bride', `But I'm so tired, yodchi. My feet have been wet for two hundred years.|Только я так устала, ёдчи. У меня двести лет мокрые ноги.|Lekin juda charchadim, yodchi. Ikki yuz yildan beri oyog'im ho'l.`]
    ], () => hub(`The bride|Невеста|Kelin`, [
      { label: `— What happens if you take the step?|— А что будет, если вы шагнёте?|— Qadam bossangiz, nima bo'ladi?`, lines: [
        ['bride', `The water comes, like that night. The music stops. And then... I don't know. Nobody here has ever found out.|Придёт вода, как в ту ночь. Музыка кончится. А дальше... не знаю. Здесь этого ещё никто не узнал.|O'sha tundagidek suv keladi. Musiqa to'xtaydi. Keyin esa... bilmayman. Bu yerda hali hech kim buni bilmagan.`],
        ['sado', `I think it means they'd finally rest. All of them. The memory would end, the way real things end.|По-моему, это значит — они наконец отдохнут. Все. Воспоминание кончится, как кончается всё настоящее.|Menimcha, ular nihoyat tinchib qoladi. Hammasi. Xotira tugaydi — haqiqiy narsalar qanday tugasa, shunday.`],
        ['sado', `And it ends up there too. Every worn tumar of this wedding in the Bazaar goes blank. For a lot of Tail girls it's the only wedding they ever had.|И наверху тоже кончится. Все потёртые тумары с этой свадьбой на базаре опустеют. А у многих девчонок из Хвоста другой свадьбы и не было.|Tepada ham tugaydi. Bozordagi bu to'yning hamma eskirgan tumarlari bo'shab qoladi. Dumdagi ko'p qizlarning boshqa to'yi bo'lmagan-ku.`]
      ] },
      { label: `— Why haven't you taken it?|— Почему вы до сих пор не шагнули?|— Nega shu paytgacha qadam bosmadingiz?`, lines: [
        ['bride', `Look at them. They're dancing. My mother-in-law finally likes me. Who am I to end that?|Посмотрите на них. Танцуют. Свекровь меня наконец-то полюбила. Кто я такая, чтобы всё это оборвать?|Ularga qarang. Raqs tushishyapti. Qaynonam nihoyat meni yaxshi ko'rib qoldi. Men kim bo'libman, buni uzib tashlaydigan?`]
      ] },
      { label: `— Sado, what's a wedding like this worth?|— Садо, сколько стоит такая свадьба?|— Sado, bunaqa to'y qancha turadi?`, lines: [
        ['sado', `Sealed in one tumar? A fortune. The Bazaar would fight over it. Two hundred guests, all happy at once.|Если запечатать в один тумар? Целое состояние. На базаре за неё передерутся. Двести гостей — и все счастливы разом.|Bitta tumarga muhrlansami? Butun boshli boylik. Bozorda uni talashib, mushtlashishadi. Ikki yuz mehmon — hammasi birdan baxtli.`],
        ['sado', `And they'd be gone. Not resting: sold again. ...You'd feel it too, Ravshan. Sealing two hundred people isn't like taking one.|А их не станет. Не отдохнут — их опять продадут. ...И ты это почувствуешь, Равшан. Запечатать двести человек — не то что одного.|Ular esa yo'qoladi. Tinchimaydi — yana sotiladi. ...Buni o'zing ham sezasan, Ravshan. Ikki yuz kishini muhrlash bittasini olishdek emas.`]
      ] }
    ], [
      { id: 'end', label: `"I'll walk with you." Take her hand.|«Я пройду с вами». Взять её за руку.|«Siz bilan birga bosaman». Qo'lidan tutish.` },
      { id: 'leave', label: `"Dance, then. It's your wedding." Leave them be.|«Танцуйте. Это ваша свадьба». Оставить всё как есть.|«Raqsingizni tushavering. Bu sizning to'yingiz». Ularni o'z holiga qo'yish.` },
      { id: 'seal', label: `Take out a tumar and seal the whole wedding in it.|Достать тумар и запечатать в нём всю свадьбу.|Tumar olib, butun to'yni unga muhrlash.`, cost: 5 }
    ], o => {
      F().wedding = o.id === 'end' ? 'ended' : o.id === 'leave' ? 'left' : 'sealed'; save();
      if (o.id === 'end') play([
        ['', `You take her hand. Under the warm water it's cold. She takes the fourth step.|Ты берёшь её за руку. Под тёплой водой рука ледяная. Она делает четвёртый шаг.|Qo'lidan tutasan. Iliq suv ostida qo'li muzdek. U to'rtinchi qadamni bosadi.`],
        ['', `The water comes, as it always did. But this time the song ends. The lanterns go out one by one. The silence after is the first new thing on this street in two hundred years.|Вода приходит, как приходила всегда. Но на этот раз песня кончается. Фонари гаснут один за другим. Тишина — первое новое на этой улице за двести лет.|Suv har doimgidek keladi. Lekin bu safar qo'shiq tugaydi. Fonuslar birin-ketin o'chadi. Shundan keyingi sukunat — bu ko'chada ikki yuz yilda birinchi yangilik.`],
        ['sado', `She smiled. Right at the end. Did you see?|Она улыбнулась. В самом конце. Ты видел?|U jilmaydi. Eng oxirida. Ko'rdingmi?`]
      ], () => { trust(1); rep('remember', 1, true); done(); });
      else if (o.id === 'leave') play([
        ['', `You leave it as it is. Behind you the doira finds the start of the song again, almost with relief.|Ты оставляешь всё как есть. За спиной дойра снова находит начало песни — почти с облегчением.|Hammasini o'z holiga qo'yasan. Orqangda doira qo'shiqning boshini yana topadi — xuddi yengil tortgandek.`],
        ['sado', `Maybe being stuck in a happy moment is still happiness. Maybe.|Может, застрять в счастье — это всё равно счастье. Может быть.|Balki baxtda tiqilib qolish ham baribir baxtdir. Balki.`]
      ], done);
      else play([
        ['', `Old craft. You sing low, and the wedding soaks into the felt like water into sand. As she fades, the bride looks at you over her veil. Then there's only a tumar, heavy and warm.|Старое ремесло. Ты поёшь вполголоса, и свадьба уходит в войлок, как вода в песок. Исчезая, невеста смотрит на тебя поверх фаты. Потом остаётся только тумар — тяжёлый, тёплый.|Eski hunar. Past ovozda kuylaysan, to'y esa qumga singgan suvdek kigizga singib ketadi. Kelin so'nib borarkan, parda ustidan senga qaraydi. Keyin faqat tumar qoladi — og'ir, iliq.`],
        ['sado', `You're still a yodchi. I keep forgetting that.|Ты всё ещё ёдчи. А я всё забываю.|Sen hali ham yodchisan. Men buni unutaveraman.`]
      ], () => { gold(140); trust(-2); addVoid(5, `a sealed wedding|запечатанная свадьба|muhrlangan to'y`); done(); });
    }));
    const boy = then => {
      if (!force) return then();
      play([
        ['', `Among the guests a boy of about ten, river weed in his hair, tugs at sleeves. Nobody sees him. He isn't from this wedding. He was poured in here later.|Среди гостей мальчик лет десяти, в волосах речная тина. Дёргает всех за рукава. Его никто не видит. Он не с этой свадьбы — его влили сюда позже.|Mehmonlar orasida sochiga suv o'ti ilashgan o'n yoshlar chamasidagi bola hammaning yengidan tortyapti. Uni hech kim ko'rmaydi. U bu to'ydan emas. Uni bu yerga keyin quyishgan.`],
        ['boy', `Have you seen my mum? Mehri. She's got a blue scarf and she sings out of tune. She was holding me, and then she wasn't.|Вы маму мою не видели? Мехри. У неё синий платок, и она поёт мимо нот. Она меня держала, а потом — раз, и нет.|Oyimni ko'rmadingizmi? Mehri. Ko'k ro'moli bor, qo'shiqni noto'g'ri aytadi. Meni ushlab turgandi, keyin birdan... yo'q.`],
        ['sado', `Ravshan. That's the widow's son. The memory you took from her by force on the Night of Payment. This is where it ended up.|Равшан. Это сын вдовы. Та память, которую ты силой забрал у неё в Ночь Уплаты. Вот куда она попала.|Ravshan. Bu bevaning o'g'li. To'lov kechasi undan zo'rlab olgan xotirang. Mana qayerga tushib qolgan ekan.`]
      ], () => hub(`Mehri's son|Сын Мехри|Mehrining o'g'li`, [
        { label: `— Sado, can I give him back to her?|— Садо, его можно ей вернуть?|— Sado, uni onasiga qaytarsa bo'ladimi?`, lines: [
          ['sado', `You can sing him into a tumar and carry him out. Mehri would remember her son again.|Можно выпеть его в тумар и вынести отсюда. Мехри снова вспомнит сына.|Uni tumarga kuylab olib, bu yerdan olib chiqsa bo'ladi. Mehri o'g'lini yana eslaydi.`],
          ['sado', `But a drowned boy is heavy to carry. You'll feel it, inside. And she'll know who took him the first time.|Но нести утонувшего мальчика тяжело. Ты это почувствуешь — изнутри. И она узнает, кто забрал его в первый раз.|Lekin cho'kkan bolani ko'tarib yurish og'ir. Buni ichingda sezasan. Uni birinchi marta kim olganini ham Mehri bilib oladi.`],
          ['sado', `And she'll remember the karez too. The water. The hand letting go. All of it comes back with him.|А ещё она снова вспомнит кяриз. Воду. Как разжалась рука. Всё вернётся вместе с ним.|Korizni ham yana eslaydi. Suvni. Qo'li qanday bo'shalib ketganini. Hammasi u bilan birga qaytadi.`]
        ] },
        { label: `— And if I leave him here?|— А если оставить его здесь?|— Shu yerda qoldirsam-chi?`, lines: [
          ['sado', `Then he stays in the dream, looking for her. For ever. Unless you tell him something that lets him stop.|Тогда он останется во сне и будет её искать. Всегда. Если только ты не скажешь ему что-нибудь, от чего он перестанет.|Unda u tushda qolib, onasini qidiraveradi. Abadiy. Agar sen unga to'xtatadigan biror gap aytmasang.`]
        ] }
      ], [
        { id: 'carried', label: `Hold out an empty tumar. Take him home to Mehri.|Протянуть ему пустой тумар. Отнести его домой, к Мехри.|Unga bo'sh tumar uzatish. Uni uyiga, Mehrining yoniga olib borish.`, cost: 4 },
        { id: 'waits', label: `"Your mum's waiting for you. Go and sit by the water."|«Мама тебя ждёт. Иди посиди у воды.»|«Oying seni kutyapti. Borib suv bo'yida o'tir.»` },
        { id: 'told', label: `"She doesn't remember you. I'm the one who took you."|«Она тебя не помнит. Это я тебя забрал.»|«U seni eslamaydi. Seni men olganman.»` }
      ], o => {
        F().mehriSon = o.id; save();
        if (o.id === 'carried') play([
          ['', `You hold out an empty tumar. He looks at it, then at you, the way children look at a healer.|Ты протягиваешь пустой тумар. Мальчик смотрит на него, потом на тебя — так дети смотрят на лекаря.|Bo'sh tumarni uzatasan. Bola avval unga, keyin senga qaraydi — bolalar tabibga shunday qaraydi.`],
          ['boy', `Will it be dark in there?|А там темно будет?|U yerda qorong'i bo'ladimi?`],
          ['sado', `Only a little. I'll talk to you the whole way. I'm good at talking.|Чуть-чуть. Я буду с тобой всю дорогу болтать. Это я умею.|Ozgina. Butun yo'l sen bilan gaplashib boraman. Gapirishga ustaman.`],
          ['', `The tumar on your chest turns warm, and a little damp.|Тумар на груди становится тёплым и чуть влажным.|Ko'kragingdagi tumar iliq tortib, sal namlanadi.`]
        ], () => { trust(2); addVoid(4, `a drowned boy's weight|тяжесть утонувшего мальчика|cho'kkan bolaning og'irligi`); then(); });
        else if (o.id === 'waits') play([
          ['hero', `She's waiting for you. Upstream. Go and sit by the water. She'll come.|Она тебя ждёт. Выше по течению. Иди посиди у воды — она придёт.|Oying seni kutyapti. Yuqoriroqda. Borib suv bo'yida o'tir, o'zi keladi.`],
          ['', `He sits down by the water, very straight, the way children sit when they've been promised something. He'll wait as long as the Sleeper dreams.|Он садится у воды — очень прямо, как сидят дети, которым что-то пообещали. Он будет ждать, пока Спящему снятся сны.|U suv bo'yiga qaddini tik tutib o'tiradi — biror narsa va'da qilingan bolalar shunday o'tiradi. Uxlovchi tush ko'rar ekan, u kutaveradi.`],
          ['sado', `He believed you. Of course he did. You're a grown-up.|Он тебе поверил. Ещё бы. Ты же взрослый.|U senga ishondi. Albatta-da. Sen kattasan-ku.`],
          ['sado', `...He's stopped crying, though. That's something.|...Зато он больше не плачет. Уже что-то.|...Ammo endi yig'lamayapti. Shuning o'zi ham bir gap.`]
        ], then);
        else play([
          ['hero', `She doesn't remember you. I took you from her. I'm sorry.|Она тебя не помнит. Это я забрал тебя у неё. Прости.|U seni eslamaydi. Seni undan men olganman. Kechir.`],
          ['boy', `...Then who's going to remember me?|...А кто тогда будет меня помнить?|...Unda meni kim eslaydi?`],
          ['hero', `I will.|Я.|Men.`]
        ], () => { trust(1); then(); });
      }));
    };
    boy(bride);
  }
});

/* =====================================================================
   28 · a3_sand — The Year of Sand
   ===================================================================== */
BARKS['a3_sand:start'] = [
  `Don't breathe too deep. The sand here is made of houses.|Глубоко не дыши. Этот песок — из домов.|Chuqur nafas olma. Bu qum — uylardan.`,
  `I can hear a market. Under us. They're still shouting prices.|Я слышу базар. Под нами. Там до сих пор цены выкрикивают.|Bozor shovqinini eshityapman. Ostimizda. Hali ham narx aytib baqirishyapti.`
];
BARKS['a3_sand:mid'] = [
  `The sand's coming faster. He's waking up inside the memory. This is the part where he goes mad.|Песок сыплется всё быстрее. Он просыпается внутри воспоминания. Сейчас будет то место, где он сходит с ума.|Qum tezroq yog'yapti. U xotiraning ichida uyg'onyapti. Hozir aqldan ozadigan joyi keladi.`,
  () => (F().truth
    ? `Farrukh's tumar was right. There never was a treaty. Just a song and a chain.|Тумар Фарруха не соврал. Никакого договора не было. Только песня и цепь.|Farruxning tumari rost aytgan ekan. Hech qanday ahdnoma bo'lmagan. Faqat qo'shiq va kishan.`
    : `The city was told there was a treaty. Look, Ravshan. Does this look like a treaty to you?|Городу говорили, что был договор. Посмотри, Равшан. Это, по-твоему, договор?|Shaharga ahdnoma bo'lgan, deyishgan. Qara, Ravshan. Shu ahdnomaga o'xshaydimi?`)
];

const sevenLook = { robe: '#3a2a1e', trim: '#c08a3a', skin: '#b8865c', head: 'turban', headC: '#d8ccb0', beard: 'long', beardC: '#2a1a10', stripes: '#5a4026' };
LAND('a3_sand', {
  name: `The Year of Sand|Год Песка|Qum yili`,
  sub: `The night Old Yodgor died, over and over|Ночь гибели Старого Ёдгора — снова и снова|Eski Yodgor halok bo'lgan tun — qayta-qayta`,
  start: [
    ['', `The sky is the colour of an old copper pot. The wind throws grit that stings like sparks. In the square of a city that no longer exists, seven men in good boots are singing to the ground.|Небо цвета старого медного котла. Ветер швыряет песок, и тот жалит, как искры. На площади города, которого больше нет, семеро мужчин в добротных сапогах поют земле.|Osmon eski mis qozonning rangida. Shamol uchqundek chaqadigan qum sochadi. Endi yo'q shaharning maydonida yaxshi etik kiygan yetti kishi yerga qo'shiq aytyapti.`],
    ['sado', `The Year of Sand. The night Old Yodgor died. He's watching it again. He watches it every night, doesn't he?|Год Песка. Ночь, когда погиб Старый Ёдгор. Он опять это смотрит. Каждую ночь, да?|Qum yili. Eski Yodgor halok bo'lgan tun. U buni yana ko'ryapti. Har kecha ko'radi, a?`],
    ['hero', `The Seven. The founders.|Семеро. Основатели.|Yettov. Asoschilar.`],
    () => (F().seven ? ['sado', `We fought their shades at the bottom of the Well. Here they look smaller. What they did looks bigger.|Мы дрались с их тенями на дне Колодца. Здесь они кажутся меньше. А то, что они сделали, — больше.|Quduq tubida ularning soyalari bilan olishgandik. Bu yerda ular kichikroq ko'rinadi. Qilgan ishlari esa kattaroq.`] : null)
  ],
  mid: [
    ['', `A line of captives, roped at the neck, shuffles toward a crack in the ground. Each one wears a tumar. At the crack a Singer taps each tumar once, like a man testing a melon, and pours it in.|Вереница пленных, связанных за шеи, бредёт к трещине в земле. На каждом тумар. У трещины Певец стукает по каждому тумару, как по дыне, и выливает вниз.|Bo'ynidan bog'langan asirlar qatori yerdagi yoriq tomon sudralib boryapti. Har birida tumar. Yoriq oldida Xonanda har bir tumarni qovun chertgandek bir chertib, pastga quyadi.`],
    ['', `Afterwards they walk on. They've forgotten where, and why. That was all it took to make the first Hollow.|Потом они идут дальше. Куда и зачем — уже забыли. Вот и всё, что понадобилось для первых Пустых.|Keyin yo'lida davom etishadi. Qayerga, nima uchun — unutishgan. Birinchi Bo'shlar uchun shuning o'zi kifoya qilgan.`],
    ['sado', `The ground just swallowed. I felt it. Like a throat.|Земля сейчас сглотнула. Я почувствовала. Как горло.|Yer hozir yutindi. Sezdim. Xuddi tomoqdek.`]
  ],
  stones: [
    { who: 'memory', text: `A water-seller in the last hour of Old Yodgor shouts that the water's sweet today, sweeter than ever. It was. The spirit had just been fed a hundred lives.|Водонос в последний час Старого Ёдгора кричит, что вода сегодня сладкая — слаще не бывало. Так и есть: духа только что накормили сотней жизней.|Eski Yodgorning so'nggi soatida suvchi: «Bugun suv shirin, hech qachon bunaqa bo'lmagan!» deb baqiradi. Rost: ruhni hozirgina yuzta hayot bilan to'ydirishgan.` },
    { who: 'memory', text: `The youngest of the Seven, the night before. He can't sleep, so he counts his camels. Two hundred and twelve. He's the one who wrote the song down.|Младший из Семерых, накануне. Не спится — считает верблюдов. Двести двенадцать. Это он записал песню.|Yettovning eng kichigi, bir kun oldin. Uyqusi kelmay, tuyalarini sanaydi. Ikki yuz o'n ikkita. Qo'shiqni yozib olgan o'sha.` },
    { who: 'memory', text: `An old bakhshi tells the water a tale on the last morning. Halfway through, the Seven's men take his dutar. The water waits for the ending. It's still waiting.|Старый бахши в последнее утро рассказывает воде сказание. На середине люди Семерых отбирают у него дутар. Вода ждёт конца. До сих пор ждёт.|Keksa baxshi so'nggi tongda suvga doston aytyapti. Yarmida Yettovning odamlari dutorini tortib olishadi. Suv dostonning oxirini kutadi. Hamon kutyapti.` }
  ],
  memory: {
    id: 'm_quake',
    lines: [
      ['memory', `Twenty years ago. The floor lifts like a breath. Plates walk off the shelf. You're under the table, holding a hand so tight your fingers ache for days.|Двадцать лет назад. Пол приподнимается, будто вдыхает. Тарелки сами съезжают с полки. Ты под столом и так стискиваешь чью-то руку, что потом пальцы ноют несколько дней.|Yigirma yil oldin. Pol nafas olgandek ko'tariladi. Tovoqlar tokchadan o'zi yurib tushadi. Sen stol tagidasan, kimningdir qo'lini shunday qisasanki, keyin barmoqlaring bir necha kun zirqiraydi.`],
      ['memory', `The other hand is small. Its owner doesn't make a sound. She doesn't cry. She doesn't let go.|Та рука маленькая. Её хозяйка не издаёт ни звука. Не плачет. Не отпускает.|U qo'l kichkina. Egasi churq etmaydi. Yig'lamaydi. Qo'yib yubormaydi.`],
      ['sado', `"She was so scared she couldn't even cry." I said that. In Rustam's memory, about the girl behind the curtain. ...How did I know, Ravshan?|«Ей было так страшно, что она даже плакать не могла». Это я сказала. Тогда, в памяти Рустама, про девочку за занавеской. ...Откуда я знала, Равшан?|«U shunchalik qo'rqqan ediki, hatto yig'lay olmasdi». Buni men aytgandim. Rustamning xotirasida, parda ortidagi qizcha haqida. ...Qayerdan bilgandim, Ravshan?`]
    ]
  },
  people: [{ look: sevenLook, x: 0 }, { look: sevenLook, x: 14 }, { look: sevenLook, x: 28 }, { look: 'hollow', x: 50 }, { look: 'elder', x: 64 }],
  exit: done => play([
    ['', `At the gate the sand is already waist-high. An old bakhshi kneels by the crack with empty hands, still telling his tale without the dutar.|У ворот песок уже по пояс. Старый бахши стоит на коленях у трещины. Руки пустые, а он всё рассказывает — без дутара.|Darvoza oldida qum allaqachon belga chiqqan. Keksa baxshi yoriq yonida tiz cho'kkan. Qo'li bo'm-bo'sh, lekin dostonini dutorsiz aytib o'tiribdi.`],
    ['', `Behind him the Seven sing the founders' song. Now you can hear every word: how it binds, and how it could bind again.|За его спиной Семеро поют песню основателей. Теперь ты слышишь каждое слово: как она вяжет — и как могла бы связать снова.|Uning ortida Yettov asoschilar qo'shig'ini kuylayapti. Endi har bir so'zini eshitasan: qanday bog'lashini va qanday qaytadan bog'lay olishini.`],
    ['memory', `You're the first in three hundred years to look at me. Will you remember us? Not what they did. Us.|Ты первый за триста лет, кто на меня посмотрел. Запомнишь нас? Не то, что они сделали. Нас.|Uch yuz yilda menga qaragan birinchi odamsan. Bizni eslab qolasanmi? Ular qilgan ishni emas. Bizni.`]
  ], () => hub(`The last morning of Old Yodgor|Последнее утро Старого Ёдгора|Eski Yodgorning so'nggi tongi`, [
    { label: `— Who are you?|— Кто вы?|— Siz kimsiz?`, lines: [
      ['memory', `The last bakhshi of Old Yodgor. We told him tales, and he gave us water. Then they came, with a better meal for him.|Последний бахши Старого Ёдгора. Мы рассказывали ему сказания, а он давал нам воду. Потом пришли они — и принесли ему еду посытнее.|Eski Yodgorning so'nggi baxshisi. Biz unga doston aytardik, u bizga suv berardi. Keyin ular kelishdi — unga to'yimliroq ovqat olib.`],
      ['sado', `"A better meal." He means people. Their memories.|«Еда посытнее». Это он про людей. Про их память.|«To'yimliroq ovqat». Odamlarni aytyapti. Ularning xotirasini.`]
    ] },
    { label: `— Sado, what are they singing?|— Садо, что это они поют?|— Sado, ular nima kuylashyapti?`, lines: [
      ['sado', `The founders' song. The one that holds him down. It's what's hidden in their tumars.|Песню основателей. Ту, что держит его на цепи. Это она спрятана в их тумарах.|Asoschilar qo'shig'ini. Uni zanjirda ushlab turgan qo'shiqni. Tumarlariga aynan shu yashirilgan.`],
      ['sado', `Listen to the end and you'll know it by heart. You'd never need the tumars to chain him. ...I don't like that you're asking.|Дослушаешь до конца — запомнишь наизусть. И тумары тебе уже не понадобятся, чтобы его сковать. ...Мне не нравится, что ты об этом спрашиваешь.|Oxirigacha tinglasang, yod bo'lib qoladi. Unda uni kishanlash uchun tumarlar ham kerak bo'lmaydi. ...So'rayotganing menga yoqmayapti.`],
      ['sado', `And a song like that doesn't sit quietly. To make room for it, something of yours will have to move out.|А такие песни тихо не сидят. Чтобы ей поместиться, что-то твоё придётся выселить.|Bunaqa qo'shiq jim yotmaydi. U sig'ishi uchun seniki bo'lgan nimadir chiqib ketishi kerak.`]
    ] }
  ], [
    { id: 'vow', label: `"I'll remember. Tell me your names."|«Я запомню. Назовите имена.»|«Eslab qolaman. Ismlaringizni ayting.»` },
    { id: 'song', label: `Stand behind the Seven and hear the song to the end.|Встать за спинами Семерых и дослушать песню до конца.|Yettovning orqasida turib, qo'shiqni oxirigacha tinglash.`, cost: 5 },
    { id: 'walk', label: `"We're three hundred years too late." Walk on.|«Мы опоздали на триста лет». Идти дальше.|«Uch yuz yilga kechikdik». Yo'lda davom etish.` }
  ], o => {
    if (o.id === 'vow') play([
      ['hero', `I'll remember. Your names, if you'll tell me.|Я запомню. Ваши имена — если назовёте.|Eslab qolaman. Ismlaringizni — agar aytsangiz.`],
      ['', `He tells you. It takes a long time. The sand rises while he talks, and you don't interrupt him once.|Он называет. Долго. Пока он говорит, песок поднимается, а ты ни разу его не перебиваешь.|U birma-bir aytadi. Uzoq. U gapirgan sari qum ko'tariladi, sen esa bir marta ham gapini bo'lmaysan.`],
      ['sado', `Forty-one names. I counted. I'll keep half, you keep half.|Сорок одно имя. Я считала. Половину запомню я, половину — ты.|Qirq bitta ism. Sanadim. Yarmini men eslab qolaman, yarmini — sen.`]
    ], () => { F().sandVow = 1; save(); trust(1); rep('remember', 1); done(); });
    else if (o.id === 'song') play([
      ['', `You stand behind the Seven and listen. Heard whole, the song is simple. Simple as a knot. Now you'll never forget it.|Ты встаёшь за спинами Семерых и слушаешь. Целиком песня простая. Простая, как узел. Теперь тебе её не забыть.|Yettovning ortida turib tinglaysan. Butunligicha eshitilganda qo'shiq oddiy. Tugundek oddiy. Endi uni hech qachon unutmaysan.`],
      ['sado', `Why would you want that? ...No. Don't tell me. I know why.|Зачем тебе это? ...Нет. Не говори. Я знаю зачем.|Bu senga nimaga kerak? ...Yo'q. Aytma. Bilaman.`]
    ], () => { F().sandSong = 1; save(); rep('divan', 1, true); trust(-1); addVoid(5, `the chaining song|песня основателей|asoschilar qo'shig'i`); done(); });
    else play([
      ['', `You walk on. The old man doesn't call after you. He's still telling the water how the tale ends.|Ты идёшь дальше. Старик тебя не окликает. Он всё рассказывает воде, чем кончается сказание.|Yo'lingda davom etasan. Chol ortingdan chaqirmaydi. U hamon suvga doston qanday tugashini aytyapti.`],
      ['sado', `It's too late for them. Is it too late for him?|Для них уже поздно. А для него?|Ularga kech. Unga-chi?`]
    ], done);
  }))
});

/* =====================================================================
   29 · r_dream — The dream chaikhana
   ===================================================================== */
BARKS['r_dream:start'] = [
  `Everyone's here. Even people who aren't anywhere any more.|Тут все. Даже те, кого больше нигде нет.|Bu yerda hamma bor. Endi hech qayerda yo'qlar ham.`
];
REST('r_dream', {
  name: `The Dream Chaikhana|Чайхана во сне|Tushdagi choyxona`,
  sub: `Everyone as they're remembered|Все такие, какими их запомнили|Hamma — qanday eslab qolingan bo'lsa, shunday`,
  rustamPrompt: `Sit down with Rustam-aka. He's looking at you|Подсесть к Рустаму-ака. Он смотрит на тебя|Rustam akaning yoniga o'tirish. U senga qarab turibdi`,
  arrive: done => play([
    ['', `A chaikhana where every chaikhana you ever sat in is one room. The two plane trees grow through the floor. The salt well is under the carpet. The lamp from the Karez hangs on a branch.|Чайхана, где все чайханы, в которых ты когда-нибудь сидел, слились в одну комнату. Две чинары растут прямо сквозь пол. Соляной колодец — под ковром. Лампа из кяриза висит на ветке.|Bu choyxonada sen umringda o'tirgan hamma choyxonalar bitta xonaga jamlangan. Ikki chinor to'ppa-to'g'ri poldan o'sib chiqqan. Sho'r quduq gilam tagida. Korizdagi chiroq shoxga osig'liq.`],
    ['', `Everyone here looks the way somebody remembers them. So nobody is quite the right size.|Все здесь такие, какими их кто-то запомнил. Поэтому никто не совсем своего роста.|Bu yerda hamma kimdir eslab qolgan qiyofada. Shuning uchun hech kim o'z bo'yida emas.`],
    ['sado', `Rustam-aka's by the fire. Ravshan... he's looking at you. Really looking. Like he knows you.|Рустам-ака у огня. Равшан... он на тебя смотрит. По-настоящему. Как будто узнаёт.|Rustam aka o'choq yonida. Ravshan... u senga qarayapti. Rostakamiga. Taniyotgandek.`]
  ], done),
  rustam: done => {
    if (!once('a3_rustam')) return play([['', `Rustam-aka looks into the fire. His tea has gone cold. He doesn't notice.|Рустам-ака смотрит в огонь. Чай у него остыл. Он не замечает.|Rustam aka olovga tikilib o'tiribdi. Choyi sovib qolgan. Sezmaydi ham.`]], done);
    const f = F();
    play([
      ['', `Rustam-aka sits up straight, the way he used to. His eyes follow you. There's someone behind them again.|Рустам-ака сидит прямо, как прежде. Глаза следят за тобой. За ними снова кто-то есть.|Rustam aka avvalgidek qaddini tik tutib o'tiribdi. Ko'zlari seni kuzatadi. Ularning ortida yana kimdir bor.`],
      ['rustam', `Sit down, boy. Everything Oydin sang out of me ended up down here. So here I'm all there. Funny. I had to be eaten to be whole.|Садись, сынок. Всё, что Ойдин из меня выпела, оказалось здесь. Так что тут я весь, целиком. Смешно: чтобы стать целым, надо было, чтобы тебя съели.|O'tir, bolam. Oydin mendan kuylab olgan hamma narsa shu yerga tushgan. Shuning uchun bu yerda butunman. Kulgili-ya: butun bo'lish uchun seni yeyishlari kerak ekan.`],
      (f.rustamMem || 0) >= 4
        ? ['rustam', `You tasted the key. You know I gave it to her myself. You don't know the rest.|Ключ ты уже попробовал. Знаешь, что я сам отдал его ей. А остального не знаешь.|Kalitni totib ko'rding. Uni unga o'zim berganimni bilasan. Qolganini bilmaysan.`]
        : ['rustam', `You never tasted all my memories. Just as well. I'll tell you myself, with my own mouth, while I still have one.|Ты так и не попробовал всю мою память. Оно и к лучшему. Скажу сам, своим ртом, пока он у меня есть.|Hamma xotiralarimni totib ko'rmading. Shunisi yaxshi. O'zim aytaman, o'z og'zim bilan, og'zim borida.`],
      ['rustam', `Twenty years ago you sold a tumar to pay off your family's debt. It did pay it. But that year half the Tail slid into the sand, and the Singers wanted more. So the debt was counted twice.|Двадцать лет назад ты продал тумар, чтобы закрыть долг семьи. И закрыл. Но в тот год половина Хвоста ушла в песок, и Певцам было мало. И долг посчитали дважды.|Yigirma yil oldin oilangning qarzini uzish uchun tumar sotding. Uzding ham. Lekin o'sha yili Dumning yarmi qumga botdi, Xonandalarga kamlik qildi. Shunda qarzni ikki marta sanashdi.`],
      ['rustam', `I held the pen. I wrote her name under yours. "Oydin, eight years old. Debtor." They took her that same morning.|Перо держал я. Я вписал её имя под твоим: «Ойдин, восемь лет. Должница». Её забрали в то же утро.|Qalam mening qo'limda edi. Uning ismini sening isming tagiga yozdim: «Oydin, sakkiz yosh. Qarzdor». O'sha tongning o'zida uni olib ketishdi.`],
      ['rustam', `Then I took you as my apprentice, so I'd have to look you in the eye every day. I called it my punishment. It was a comfort.|Потом я взял тебя в ученики, чтобы каждый день смотреть тебе в глаза. Называл это своим наказанием. А это было утешение.|Keyin seni shogird qilib oldim — har kuni ko'zingga qarab yurishim uchun. Buni o'zimga jazo derdim. Aslida tasalli edi.`],
      ({
        forgave: ['rustam', `Under the ground you said you forgave me. I heard it with half a head. Say it again to the whole one. Or don't.|Там, под землёй, ты сказал, что прощаешь. Я слышал это половиной головы. Скажи ещё раз — целой. Или не говори.|Yer tagida meni kechirganingni aytding. Men buni yarimta boshim bilan eshitdim. Endi butun boshimga yana bir ayt. Yoki aytma.`],
        condemned: ['rustam', `Under the ground you told me what I am. You were right. I'd like to hear whether you still think so, now that I can answer.|Там, под землёй, ты сказал мне, кто я такой. И был прав. Хочу услышать, думаешь ли ты так же теперь, когда я могу ответить.|Yer tagida menga kimligimni aytding. Haq eding. Endi javob bera oladigan bo'lganimda ham shunday o'ylaysanmi — eshitgim keladi.`],
        silent: ['rustam', `Under the ground you said nothing. Fair enough. Here I can hear silence properly. Try again.|Там, под землёй, ты промолчал. Имел право. Здесь я и тишину хорошо слышу. Попробуй ещё раз.|Yer tagida indamading. Haqqing bor edi. Bu yerda jimlikni ham yaxshi eshitaman. Yana bir urinib ko'r.`]
      })[f.rustamWord] || null,
      ['sado', `He's asking if you forgive him. You don't have to say what he wants to hear. Say what's true.|Он спрашивает, прощаешь ли ты его. Не обязательно говорить то, что он хочет услышать. Скажи как есть.|U kechirasanmi, deb so'rayapti. U eshitmoqchi bo'lgan gapni aytishing shart emas. Borini ayt.`]
    ], () => ask(`Rustam-aka|Рустам-ака|Rustam aka`, [
      { id: 'forgiven', label: `"I forgive you, aka."|«Я вас прощаю, ака.»|«Sizni kechiraman, aka.»` },
      { id: 'unforgiven', label: `"I can't forgive you."|«Не могу я вас простить.»|«Sizni kechira olmayman.»` },
      { id: 'tea', label: `Pour him tea and say nothing.|Налить ему чаю и ничего не говорить.|Unga choy quyib, indamay o'tirish.` }
    ], o => {
      F().rustam = o.id; save();
      const reply = {
        forgiven: ['rustam', `Don't. Not yet. Forgive me when you've remembered her. Then you'll know how much you're forgiving.|Не надо. Не сейчас. Прости, когда вспомнишь её. Тогда будешь знать, сколько прощаешь.|Shoshma. Hozir emas. Uni eslaganingda kechirasan. Shunda nimani kechirayotganingni bilasan.`],
        unforgiven: ['rustam', `Good. You never lied to me, not even as a boy. Don't start now to comfort an old man.|Правильно. Ты мне никогда не врал, даже мальчишкой. Не начинай теперь, старика утешать.|To'g'ri. Sen menga hech qachon yolg'on gapirmagansan, bolaligingda ham. Endi cholni yupatay deb boshlama.`],
        tea: ['', `You pour. He holds the bowl in both hands, the way he taught you to hold it in a stranger's house.|Ты наливаешь. Он берёт пиалу обеими руками — как сам учил тебя держать её в чужом доме.|Choy quyasan. U kosani ikki qo'llab oladi — begona uyda kosani shunday tutishni senga o'zi o'rgatgan.`]
      }[o.id];
      if (o.id !== 'tea') trust(1);
      play([
        reply,
        ['rustam', `Go home, boy. You've walked my route long enough.|Иди домой, сынок. Хватит тебе ходить моими улицами.|Uyingga bor, bolam. Mening yo'limdan yetarlicha yurding.`],
        ['', `He reaches out as if to straighten your collar. His hand stops halfway. Something in his face goes out, slowly, like a lamp running out of oil.|Он тянется, будто хочет поправить тебе ворот. Рука замирает на полпути. Что-то в его лице гаснет — медленно, как лампа, в которой кончается масло.|U yoqangni to'g'rilamoqchi bo'lgandek qo'l uzatadi. Qo'li yarim yo'lda to'xtaydi. Yuzidagi nimadir sekin so'nadi — moyi tugayotgan chiroqdek.`],
        ['rustam', `Toychoq…|Тойчок…|Toychoq…`],
        ['', `Then he's looking into the fire again, at nothing, the way he does in every chaikhana up in the waking city.|И вот он снова смотрит в огонь, в никуда, — как в любой чайхане там, наверху, наяву.|Keyin u yana olovga, hech narsaga tikilib qoladi — tepadagi, o'ngdagi har bir choyxonada qaraganidek.`],
        ['sado', `Toychoq. Little foal. That's what I call you when I'm scared. How does he know it? How do I?|Тойчок. Жеребёночек. Так я тебя зову, когда мне страшно. Откуда он это знает? И откуда — я?|Toychoq. Qo'rqqanimda seni shunday chaqiraman. U buni qayerdan biladi? Men-chi?`]
      ], done);
    }));
  },
  turab: done => {
    const f = F(), first = once('a3_turab');
    if (!first) return play([['turab', `Listen once more, then go. The water is waiting for the ending.|Послушай ещё раз — и иди. Вода ждёт конца.|Yana bir bor tingla-yu, yo'lingga ket. Suv oxirini kutyapti.`]], done);
    const lines = [
      ['', `The bakhshi sits under the plane tree with his dutar. In the dream he has his own voice.|Бахши сидит под чинарой с дутаром. Во сне голос у него свой.|Baxshi chinor tagida dutorini quchoqlab o'tiribdi. Tushda ovozi o'ziniki.`],
      (f.voice !== 'bought' && f.voice !== 'stolen')
        ? ['', `Up in the waking city his voice was sold to a stranger. Here he spends it carefully, like a man spending his last coins.|Наверху его голос продали чужому человеку. Здесь Тураб тратит его бережно, как последние монеты.|Tepada uning ovozini begona odamga sotib yuborishgan. Bu yerda Turob uni so'nggi chaqalaridek avaylab sarflaydi.`]
        : null,
      ['turab', `Yodchi. Every tale for him ends the same way: the water listens, and in the morning there's a spring where there was sand. That's the whole secret. They forgot it on purpose.|Ёдчи. Все сказания для него кончаются одинаково: вода слушает, а наутро там, где был песок, бьёт родник. Вот и весь секрет. Его забыли нарочно.|Yodchi. Unga aytiladigan har bir doston bir xil tugaydi: suv tinglaydi, ertalab qum bo'lgan joyda buloq qaynab chiqadi. Butun sir shu. Uni ataylab unutishgan.`],
      f.tales
        ? ['turab', `You heard the old tales from me on the Spine. You know how to start one. Now learn how they end: you give it away, and you still have it.|На Хребте ты слышал от меня старые сказания. Начинать ты умеешь. Теперь узнай, как их заканчивать: отдаёшь — а оно всё равно при тебе.|Umurtqada mendan eski dostonlarni eshitding. Boshlashni bilasan. Endi tugatishni o'rgan: berib yuborasan — baribir o'zingda qoladi.`]
        : ['turab', `I never got to teach you the tales. Pity. Remember this much: a memory taken is gone. A story told lives in two places at once.|Сказаниям я тебя так и не научил. Жаль. Запомни хоть это: отнятая память пропадает. А рассказанная история живёт сразу в двух местах.|Senga dostonlarni o'rgatib ulgurmadim. Attang. Hech bo'lmasa shuni esla: tortib olingan xotira yo'qoladi. Aytib berilgan ertak esa birdaniga ikki joyda yashaydi.`]
    ];
    if (!f.name) lines.push(['turab', `His name is Obi-Hayot. Water of Life. Up there I couldn't tell you. Down here nobody can shut me up.|Его зовут Оби-Хаёт. Вода жизни. Наверху я не мог тебе сказать. А здесь мне никто рта не заткнёт.|Uning ismi — Obi Hayot. Hayot suvi. Tepada senga ayta olmasdim. Bu yerda og'zimni hech kim yopolmaydi.`, () => { F().name = 1; save(); know(`Learned: his name is Obi-Hayot|Узнано: его зовут Оби-Хаёт|Bilib olding: uning ismi Obi Hayot`); }]);
    lines.push(['turab', `Now, a song for the road. The last one I have.|А теперь — песня в дорогу. Последняя, что у меня осталась.|Endi yo'lga bir qo'shiq. Menda qolgan oxirgisi.`]);
    play(lines, done);
  },
  farrukh: done => {
    if (!once('a3_farrukh')) return play([['farrukh', `Still here? The dream doesn't charge for sitting. I might start.|Всё ещё тут? Сон за посиделки денег не берёт. А я, может, начну.|Hali shu yerdamisan? Tush o'tirgan uchun pul olmaydi. Men olishni boshlasammikan.`]], done);
    const ans = text => [['farrukh', text]];
    play([
      ['farrukh', `Don't look so surprised. I've been sold in this city a hundred times: my first kiss, my first horse, the day my father said he was proud of me. I'm very popular down here.|Не делай такое лицо. Меня в этом городе продавали раз сто: первый поцелуй, первого коня, тот день, когда отец сказал, что гордится мной. Я тут нарасхват.|Bunchalik hayron bo'lma. Meni bu shaharda yuz marta sotishgan: birinchi o'pichimni, birinchi otimni, otam «faxrlanaman» degan kunni. Bu yerda men juda xaridorgirman.`],
      ['farrukh', `Since we're both here, some advice. Free. Mark the day. Ask me what everyone's after, and I'll tell you what it costs.|Раз уж мы оба тут — совет. Бесплатный. Запиши этот день. Спроси, кто чего хочет, а я скажу почём.|Ikkalamiz ham shu yerda ekanmiz, maslahat beray. Tekinga. Bu kunni yozib qo'y. Kim nima istashini so'ra, men narxini aytaman.`]
    ], () => hub(`Farrukh|Фаррух|Farrux`, [
      { label: `— What does the Well want?|— Чего хочет Колодец?|— Quduq nima istaydi?`, lines: [
        ['farrukh', `Shirin wants the founders' tumars and one long night: the Great Tithe. The whole Tail sung empty, and the Sleeper full for a hundred years. Sweet water. Ask the Tail how it tastes.|Ширин нужны тумары основателей и одна долгая ночь — Великая десятина. Весь Хвост выпеть досуха, и Спящий сыт на сто лет. Сладкая вода. Спроси у Хвоста, какова она на вкус.|Shiringa asoschilar tumarlari va bitta uzun tun kerak: Buyuk ushr. Butun Dumni kuylab bo'shatadi, Uxlovchi esa yuz yilga to'yadi. Shirin suv. Ta'mini Dumdan so'ra.`],
        ['farrukh', `Mind you, a hundred years without a quake is a hundred years nobody's house slides into the sand. Shirin has done the sums. They add up. That's the frightening part.|Хотя сто лет без толчков — это сто лет, когда ничей дом не съезжает в песок. Ширин всё посчитала. И у неё сходится. Вот что страшно.|Lekin yuz yil zilzilasiz — demak, yuz yil hech kimning uyi qumga sirg'alib ketmaydi. Shirin hammasini hisoblab chiqqan. Hisobi to'g'ri chiqadi. Qo'rqinchlisi ham shu.`]
      ] },
      { label: `— And the Divan?|— А Диван?|— Devon-chi?`, lines: [
        ['farrukh', `Tilla-bek doesn't want him asleep. He wants him chained: a god who raises water on command, and memory sold by the caravan from here to Kashgar. My father would weep with joy. That's how you know.|Тилла-беку сон ни к чему. Ему нужна цепь: бог, который поднимает воду по приказу, и память караванами отсюда до Кашгара. Мой отец прослезился бы от счастья. По этому и суди.|Tillabekka uyqu kerakmas. Unga kishan kerak: buyruq bilan suv chiqaradigan xudo, bu yerdan Qashqargacha karvon-karvon xotira. Otam xursandligidan yig'lab yuborardi. Shundan bilaver.`],
        ['farrukh', `Then again, the Tail would never pay a tithe again. He'd be the one paying, in water. It isn't the worst offer in town.|С другой стороны, Хвосту больше никогда не платить десятину. Платить будет он — водой. Не худшее предложение в городе.|Boshqa tomondan, Dum endi hech qachon ushr to'lamaydi. Endi suv bilan Uxlovchining o'zi to'laydi. Shahardagi eng yomon taklif emas bu.`]
      ] },
      { label: `— And Oydin?|— А Ойдин?|— Oydin-chi?`, lines: ans(`Your sister wants him awake, and every stolen memory going home. The city slides into the sand, but everyone remembers everything. Honest. Also very wet.|Твоя сестра хочет его разбудить — и чтобы вся краденая память вернулась по домам. Город уйдёт в песок, зато все вспомнят всё. Честно. И очень мокро.|Singling uni uyg'otmoqchi: o'g'irlangan har bir xotira uyiga qaytsin, deydi. Shahar qumga botadi, lekin hamma hammasini eslaydi. Halol. Faqat juda ho'l.`) },
      { label: `— Is there another way?|— А другой путь есть?|— Boshqa yo'l bormi?`, lines: ans(`If there is, it isn't for sale. That's how you'll know it. Everything I ever touched had a price. Find the thing that doesn't.|Если и есть, он не продаётся. По этому его и узнаешь. У всего, к чему я прикасался, была цена. Найди то, у чего её нет.|Bo'lsa ham, u sotilmaydi. Shundan tanib olasan. Men qo'l tekkizgan hamma narsaning narxi bor edi. Narxi yo'q narsani top.`) }
    ], [
      { id: 'leave', label: `"That'll do. Thanks, Farrukh."|«Хватит. Спасибо, Фаррух.»|«Bo'ldi. Rahmat, Farrux.»` }
    ], () => play([['farrukh', `Go on, then. And yodchi, if you get out of this, I'd like my first horse back. His name was Saffron. Obviously.|Ну, иди. И, ёдчи, если выберешься — верни мне первого коня. Его звали Шафран. Само собой.|Qani, bor. Yodchi, agar chiqib ketsang, birinchi otimni qaytarib ber. Oti Za'faron edi. Tabiiyki.`]], done)));
  },
  lullaby: done => {
    const warm = (R().trust || 0) >= 2;
    play([
      ['', `Someone starts singing Alla. Not Sado. The voice comes up from below: through the floor, through the tea, through the roots of the plane trees.|Кто-то заводит «Аллу». Не Садо. Голос поднимается снизу — сквозь пол, сквозь чай, сквозь корни чинар.|Kimdir «Alla»ni boshlaydi. Sado emas. Ovoz pastdan ko'tariladi: poldan, choydan, chinor ildizlaridan.`],
      ['', `It isn't one voice. It's every mother he ever swallowed, singing to children who aren't there. Each sings it a little wrong, her own way.|Это не один голос. Это все матери, которых он проглотил, поют детям, которых здесь нет. Каждая чуть-чуть неправильно — по-своему.|Bu bitta ovoz emas. U yutgan hamma onalar bu yerda yo'q bolalariga alla aytyapti. Har biri sal boshqacharoq — o'zicha aytadi.`],
      ['sado', `That one. Listen. The one who drops the third line low, like she's tired. I know her.|Вон та. Слышишь? Которая третью строчку опускает вниз, будто устала. Я её знаю.|Anavi. Eshityapsanmi? Uchinchi satrni charchagandek pastlatib aytadigani. Uni taniyman.`],
      warm
        ? ['', `Sado sings along, softly, a beat behind, the way a child sings a song she only half knows. Something in your chest comes untied.|Садо тихонько подпевает, чуть отставая, как ребёнок подпевает песне, которую знает наполовину. Что-то у тебя в груди развязывается.|Sado ohista, bir zarb kechikib qo'shiladi — yarim biladigan qo'shiqqa qo'shilgan boladek. Ko'kragingdagi qandaydir tugun yechiladi.`]
        : ['', `Sado listens with you, but she doesn't sing. Not to you. Not yet.|Садо слушает вместе с тобой, но не поёт. Тебе — нет. Пока нет.|Sado sen bilan birga tinglaydi, lekin qo'shilmaydi. Senga emas. Hozircha.`]
    ], () => { if (warm) addVoid(-4, `Alla|«Алла»|«Alla»`); done(); });
  }
});

/* =====================================================================
   30 · a3_house — Your House. Clue 12, the reveal, the choice about Sado.
   ===================================================================== */
BARKS['a3_house:start'] = [
  `The roof's that way. You can see the whole Tail from up there. And the stars. I used to— somebody used to count them up there.|Крыша — там. С неё весь Хвост видно. И звёзды. Я раньше... кто-то раньше их там считал.|Tom anavi tomonda. Tomdan butun Dum ko'rinadi. Yulduzlar ham. Men oldin... kimdir oldin u yerda ularni sanardi.`,
  `There's a dent in the doorpost at the height of my— of a child's hand. Like someone held on very hard.|На косяке вмятина — на высоте моей... детской руки. Будто кто-то очень крепко держался.|Eshik kesakisida mening... bolaning qo'li barobarida chuqurcha bor. Go'yo kimdir juda mahkam yopishib olgandek.`
];
BARKS['a3_house:mid'] = [
  `It gets quieter the further in we go. Like the house is holding its breath.|Чем дальше, тем тише. Будто дом затаил дыхание.|Ichkarilagan sari jimlik cho'kadi. Go'yo uy nafasini ichiga yutgandek.`
];

// the four fates: a question hub first (what each one does to her), then the choice.
function sadoChoice(done) {
  const f = F();
  const oydinLock = !f.oydin
    ? `You've never met Oydin grown up. There's no one to give her to.|Взрослую Ойдин ты не встречал. Отдавать некому.|Katta Oydinni uchratmagansan. Beradigan odam yo'q.`
    : f.oydin === 'took'
      ? `You took the founders' tumars from Oydin by force. She won't take anything from your hands.|Ты силой отнял у Ойдин тумары основателей. Из твоих рук она ничего не возьмёт.|Sen Oydindan asoschilar tumarlarini zo'rlab tortib olgansan. U endi qo'lingdan hech narsa olmaydi.`
      : null;
  const taleLock = taleMissing(true);
  hub(`What becomes of Sado?|Что будет с Садо?|Sadoga nima bo'ladi?`, [
    { label: `— What happens if I remember you?|— Что будет, если я тебя вспомню?|— Seni eslasam, nima bo'ladi?`, lines: [
      ['sado', `I go back inside you, as a memory. You'll remember Oydin, all of her, not just the piece in the tumar: her face, her voice, the morning they took her.|Я вернусь в тебя — воспоминанием. Ты вспомнишь Ойдин всю, а не кусочек из тумара: лицо, голос, то утро, когда её забрали.|Ichingga xotira bo'lib qaytaman. Oydinni butunligicha eslaysan, tumardagi parchasini emas: yuzini, ovozini, uni olib ketishgan tongni.`],
      ['sado', `It'll hurt. But there'll be much less empty space in you. The song won't have so much room to roam.|Будет больно. Зато пустоты в тебе станет гораздо меньше. Песне негде будет разгуляться.|Og'riydi. Lekin ichingdagi bo'shliq ancha kamayadi. Qo'shiqqa yayrashga joy qolmaydi.`],
      ['sado', `And I won't be a voice any more. I won't answer you, or tease you, or count with you. You'll just remember me. That's all. And that's a lot.|А голосом я больше не буду. Не отвечу, не поддразню, не посчитаю с тобой. Ты будешь меня просто помнить. Только и всего. А это очень много.|Lekin endi ovoz bo'lmayman. Senga javob bermayman, hazillashmayman, sen bilan sanamayman. Meni shunchaki eslaysan. Shu, xolos. Bu esa juda ko'p.`],
      () => (oydinKnown() ? ['sado', `And the real Oydin stays missing a piece. It would be in you, not in her.|А у настоящей Ойдин так и будет не хватать кусочка. Он будет в тебе, а не в ней.|Haqiqiy Oydinda esa bir parcha yetishmay qolaveradi. U parcha unda emas, senda bo'ladi.`] : null)
    ] },
    { label: `— And if I keep you as you are?|— А если оставить тебя такой, как есть?|— Seni shundayligingcha qoldirsam-chi?`, lines: [
      ['sado', `Then I stay. Your voice in the dark. Your friend. Honestly? I'd like that.|Тогда я останусь. Голос у тебя в темноте. Твой друг. Честно? Мне бы понравилось.|Unda qolaman. Qorong'ida senga hamroh ovoz. Do'sting. Rostini aytsammi? Menga yoqardi.`],
      ['sado', `But I'll be eight for ever, in a box with no windows. And you'll never really remember your sister. You'll only hear a piece of her.|Только мне навсегда будет восемь — в коробке без окон. А сестру ты так по-настоящему и не вспомнишь. Будешь слышать только кусочек.|Faqat men abadiy sakkiz yoshda qolaman — derazasiz qutida. Singlingni esa hech qachon chindan eslamaysan. Faqat bir parchasini eshitib yurasan.`],
      ['sado', `And the song keeps eating you. I can talk over it. I can't stop it.|И песня будет есть тебя дальше. Перекричать её я могу. Остановить — нет.|Qo'shiq ham seni yeyishda davom etadi. Men uni bosib gapira olaman. To'xtata olmayman.`]
    ] },
    { label: `— And if I give you to Oydin?|— А если отдать тебя Ойдин?|— Seni Oydinga bersam-chi?`, if: oydinKnown, lines: done2 => play([
      ['sado', `To the real her? ...She has only one memory of you, in a tumar under her collarbone. The Singers took the rest of her childhood, year after year.|Настоящей? ...У неё о тебе одно-единственное воспоминание — в тумаре под ключицей. Остальное детство у неё год за годом выпевали Певцы.|Haqiqiysigami? ...Unda sen haqingda bitta-yu bitta xotira bor — o'mrovi tagidagi tumarda. Bolaligining qolganini Xonandalar yildan-yilga kuylab olishgan.`],
      ['sado', `I'm her, at eight. Give me back and she gets a piece of herself back: the girl who loved you. You'd lose me. And you still wouldn't remember her.|А я — она в восемь лет. Отдашь меня — и она получит назад кусочек себя: ту девочку, что тебя любила. Ты меня потеряешь. И её всё равно не вспомнишь.|Men esa — sakkiz yoshli o'sha. Meni bersang, u o'zining bir parchasini qaytarib oladi: seni yaxshi ko'rgan qizchani. Sen meni yo'qotasan. Uni baribir eslamaysan.`],
      oydinLock ? ['sado', `But we can't. Not now.|Только так нельзя. Не сейчас.|Lekin hozir bunday qilolmaymiz.`] : null,
      oydinLock ? ['', oydinLock] : null
    ], done2) },
    { label: `— What does it mean, "become a tale"?|— Что значит «стать сказанием»?|— «Dostonga aylanish» nima degani?`, lines: done2 => play([
      ['sado', `Turab says he never needed memories. Before the founders, people just told him stories. And stories don't wear out.|Тураб говорит, ему никогда не нужна была память. До основателей ему просто рассказывали истории. А истории не изнашиваются.|Turobning aytishicha, unga hech qachon xotira kerak bo'lmagan. Asoschilardan oldin unga shunchaki hikoya aytib berishgan. Hikoya esa yeyilmaydi.`],
      ['sado', `So I'd stop being anyone's memory. I'd be a story. Ours. Nargiza sings it to him, kids tell it in the Tail. Nobody owns me, everybody keeps me.|Значит, я перестану быть чьей-то памятью. Стану историей. Нашей. Наргиза споёт её ему, дети будут пересказывать в Хвосте. Я ничья — и я у всех.|Demak, men endi hech kimning xotirasi bo'lmayman. Hikoyaga aylanaman. Bizning hikoyamizga. Nargiza uni unga kuylab beradi, Dumda bolalar bir-biriga aytib yurishadi. Hech kimniki emasman — hammanikiman.`],
      ['sado', `It might be the one way to end this without feeding him anyone. But you'd lose the voice. I'd be told. I wouldn't talk.|Может, это единственный способ всё закончить и никого ему не скормить. Но голоса у тебя не станет. Меня будут рассказывать — а сама я говорить не буду.|Balki bu unga hech kimni yedirmay, hammasini tugatishning yagona yo'lidir. Lekin ovozim yo'qoladi. Meni aytib berishadi — o'zim gapirmayman.`],
      ['sado', `And everyone tells a tale their own way. Give it a hundred years and I'll be braver than I was. Or sillier.|А сказку каждый пересказывает по-своему. Лет через сто я буду храбрее, чем была. Или глупее.|Ertakni esa har kim o'zicha aytadi. Yuz yildan keyin men bo'lganimdan jasurroq bo'laman. Yo ahmoqroq.`],
      taleLock ? ['sado', `But we can't. Not yet.|Только пока мы этого не можем.|Lekin hozircha qo'limizdan kelmaydi.`] : null,
      taleLock ? ['', taleLock] : null
    ], done2) },
    { label: `— What do you want?|— А ты сама чего хочешь?|— O'zing nima istaysan?`, lines: [
      ['sado', `Me? ...I want to stay. I'm eight, of course I want to stay. And I want to go to her. And I want you to remember. I can't have all of it.|Я? ...Я хочу остаться. Мне восемь — конечно, хочу. И хочу к ней. И хочу, чтобы ты вспомнил. Всё сразу не бывает.|Menmi? ...Qolgim keladi. Sakkiz yoshdaman, albatta qolgim keladi. Uning oldiga ham borgim keladi. Sen eslashingni ham istayman. Hammasi birdan bo'lmaydi.`],
      ['sado', `So you choose. You're the big brother. That was always your job.|Так что выбирай ты. Ты старший брат. Это всегда была твоя работа.|Shuning uchun sen tanla. Akam sensan. Bu doim sening vazifang edi.`]
    ] }
  ], [
    { id: 'remember', label: `"Come home, Oydin." Remember her, all of her.|«Возвращайся домой, Ойдин». Вспомнить её — всю.|«Uyga qayt, Oydin». Uni butunligicha eslash.`, cost: -30 },
    { id: 'keep', label: `"Stay with me. As you are."|«Останься со мной. Такой, какая есть.»|«Men bilan qol. Shundayligingcha.»` },
    { id: 'oydin', label: `"She should have you. I'll take you to her."|«Ты должна быть у неё. Я отнесу тебя к ней.»|«Sen unda bo'lishing kerak. Seni uning oldiga olib boraman.»`, lock: oydinLock },
    { id: 'tale', label: `"Let's make you a tale. One he can hear."|«Давай сделаем из тебя сказание. Такое, чтобы он услышал.»|«Seni dostonga aylantiramiz. U eshitadigan dostonga.»`, lock: taleLock }
  ], o => {
    F().sadoFate = o.id; save();
    if (o.id === 'remember') play([
      ['sado', `Will it hurt?|Больно будет?|Og'riydimi?`],
      ['hero', `Yes.|Да.|Ha.`],
      ['sado', `Good. Then it's real. Count with me, Toychoq. Then I won't be scared.|Хорошо. Значит, по-настоящему. Считай со мной, Тойчок. Тогда мне не будет страшно.|Yaxshi. Demak, rostakam. Men bilan sana, Toychoq. Shunda qo'rqmayman.`],
      ['', `You count. She counts with you. At eleven her voice is right beside yours. At twelve there's only your voice, and it isn't alone.|Ты считаешь. Она считает вместе с тобой. На одиннадцати её голос совсем рядом с твоим. На двенадцати остаётся только твой — и он не один.|Sanaysan. U sen bilan birga sanaydi. O'n birda uning ovozi seniki bilan yonma-yon. O'n ikkida faqat sening ovozing qoladi — va u yolg'iz emas.`],
      ['', `And you remember. Not a tumar's worth: all of it. Her braids. Her stubborn chin. The stones under the board. The morning the men with the book came, and she held the doorpost with both hands.|И ты вспоминаешь. Не на тумар — всё. Её косички. Упрямый подбородок. Косточки под доской. Утро, когда пришли люди с книгой, а она вцепилась в косяк обеими руками.|Va eslaysan. Bir tumarlik emas — hammasini. O'rimlarini. Qaysar iyagini. Taxta tagidagi danaklarni. Daftarli odamlar kelgan tongni — u eshik kesakisiga ikki qo'llab yopishib olgandi.`, () => addVoid(-30, `your sister|твоя сестра|singling`)],
      ['', `The little light by your shoulder goes out. The dark is just dark now. She used to be afraid of it for both of you.|Огонёк у плеча гаснет. Темнота теперь просто темнота. Раньше она боялась её за вас обоих.|Yelkang yonidagi nurcha o'chadi. Qorong'ilik endi shunchaki qorong'ilik. Oldin u ikkalangiz uchun undan qo'rqardi.`],
      ['hero', `Oydin.|Ойдин.|Oydin.`]
    ], () => { F().sado = 0; save(); trust(2); done(); });
    else if (o.id === 'keep') play([
      ['hero', `Stay.|Останься.|Qol.`],
      ['sado', `As what?|Кем?|Kim bo'lib?`],
      ['hero', `As you are. I gave you up once, for a debt. I won't do it again. Not even for a cure.|Собой. Я уже отдал тебя однажды — за долг. Второй раз не отдам. Даже ради лекарства.|O'zing bo'lib. Seni bir marta qarz uchun berib yuborganman. Ikkinchi marta bermayman. Davo uchun ham.`],
      ['sado', `That's the most words you've ever said in a row. ...You know you're keeping your sister in your head like a bird in a box.|Столько слов подряд я от тебя ещё не слышала. ...Ты ведь понимаешь, что держишь сестру в голове, как птичку в коробке.|Sendan bunchalik uzun gapni hali eshitmagandim. ...Singlingni boshingda qutidagi qushchadek saqlayotganingni bilasan-a?`],
      ['sado', `But it's warm in here. All right. For now.|Но тут тепло. Ладно. Пока что.|Lekin bu yer iliq. Mayli. Hozircha.`]
    ], () => { trust(1); done(); });
    else if (o.id === 'oydin') play([
      ['hero', `For twenty years she's carried one memory of me in a tumar under her collarbone. She should have you.|Двадцать лет она носит под ключицей тумар с одним-единственным воспоминанием обо мне. Ты должна быть у неё.|Yigirma yildan beri u o'mrovi tagidagi tumarda men haqimda bitta xotirani olib yuribdi. Sen unda bo'lishing kerak.`],
      ['sado', `Give me back. To her. ...Will she even want me? I'm eight. She's twenty-eight and angry.|Вернуть меня. Ей. ...А я ей вообще нужна? Мне восемь. А ей двадцать восемь, и она злая.|Meni qaytarish. Unga. ...Men unga kerakmanmi o'zi? Men sakkiz yoshdaman. U esa yigirma sakkizda, yana jahldor.`],
      ['hero', `She hums your song.|Она напевает твою песню.|U sening qo'shig'ingni xirgoyi qiladi.`],
      ['sado', `Our song. ...All right. When we see her. Not before. I want to beat one more monster with you first.|Нашу песню. ...Ладно. Когда её увидим. Не раньше. Сначала я хочу победить с тобой ещё одно чудище.|Bizning qo'shig'imizni. ...Mayli. Uni ko'rganimizda. Undan oldin emas. Avval sen bilan yana bitta maxluqni yengaylik.`]
    ], () => { trust(1); done(); });
    else play([
      ['hero', `Nargiza hears him. Turab gave me the tales. He doesn't want memories. He wants to be told.|Наргиза его слышит. Тураб отдал мне сказания. Ему не нужна память. Ему нужно, чтобы ему рассказывали.|Nargiza uni eshitadi. Turob menga dostonlarini berdi. Unga xotira kerak emas. Unga hikoya aytib berishlari kerak.`],
      ['sado', `So I'll be a story. Not yours, not hers. Everyone's. ...Will I still be me?|Значит, я буду историей. Не твоей, не её. Общей. ...А я останусь собой?|Demak, men hikoya bo'laman. Seniki ham emas, uniki ham emas. Hammaniki. ...O'zim bo'lib qolamanmi?`],
      ['hero', `Tales don't wear thin. You'll be told to him every night. And to every kid in the Tail.|Сказания не изнашиваются. Тебя будут рассказывать ему каждую ночь. И каждому ребёнку в Хвосте.|Doston yeyilmaydi. Seni unga har kecha aytib berishadi. Dumdagi har bir bolaga ham.`],
      ['sado', `Then tell it well. Just don't make me braver than I was.|Тогда расскажи хорошо. Только не делай меня храбрее, чем я была.|Unda yaxshilab aytib ber. Faqat meni bo'lganimdan jasurroq qilib ko'rsatma.`]
    ], () => { trust(1); done(); });
  });
}

LAND('a3_house', {
  name: `Your House|Твой дом|Sening uying`,
  sub: `It smells of bread and grief|Здесь пахнет хлебом и горем|Bu yerda non va g'am hidi`,
  start: [
    ['', `A door in a blue gate. The paint has peeled into the shape of a map, and the hinge still sings. This is the gate that fell twenty years ago. Here it's still standing.|Калитка в синих воротах. Краска облупилась — вышла карта, а петля всё так же поёт. Это те самые ворота, что рухнули двадцать лет назад. Здесь они ещё стоят.|Ko'k darvozadagi kichik eshik. Bo'yog'i ko'chib, xaritaga o'xshab qolgan, oshiq-moshig'i hamon g'ichirlab kuylaydi. Bu yigirma yil oldin qulagan o'sha darvoza. Bu yerda u hali ham turibdi.`],
    ['', `Inside, the tandir is still warm, and bread lies under a cloth. Under the smell of bread there's another: like a room where someone has cried for a long time.|Внутри тандыр ещё тёплый, хлеб накрыт полотенцем. Под запахом хлеба — другой: так пахнет комната, где кто-то долго плакал.|Ichkarida tandir hali iliq, non dasturxonga o'ralgan. Non hidining tagida boshqa hid bor: kimdir uzoq yig'lagan xonaning hidi.`],
    ['hero', `This is my house.|Это мой дом.|Bu mening uyim.`],
    ['sado', `Eleven boards from the door to the tandir. The fourth one creaks. Step over it, or Mum will wake up.|От двери до тандыра одиннадцать досок. Четвёртая скрипит. Перешагни, а то мама проснётся.|Eshikdan tandirgacha o'n bitta taxta. To'rtinchisi g'ichirlaydi. Hatlab o't, bo'lmasa oyim uyg'onib ketadi.`],
    ['hero', `How do you know that?|Откуда ты знаешь?|Buni qayerdan bilasan?`],
    ['sado', `My feet know. So do yours. Look, you just stepped over it.|Ноги знают. И твои тоже. Смотри — ты её только что перешагнул.|Oyoqlarim biladi. Seniki ham. Qara, hozirgina hatlab o'tding.`]
  ],
  mid: [
    ['sado', `Wait. Stop. That board, by the wall. It's loose. Lift it.|Стой. Погоди. Вон та доска, у стены. Она шатается. Подними.|To'xta. Shoshma. Devor tagidagi anavi taxta. Qimirlaydi. Ko'tar.`],
    ['', `Under the board, wrapped in a scrap of red cloth: apricot stones. Thirteen, washed and dried, each with a tiny scratch on it, like a tally.|Под доской, в красном лоскутке, — абрикосовые косточки. Тринадцать штук, вымытые, высушенные. На каждой крохотная царапинка, как зарубка.|Taxta tagida, qizil latta parchasiga o'ralgan o'rik danaklari. O'n uchta, yuvib quritilgan. Har birida sanoq belgisidek mitti chiziqcha.`],
    ['sado', `From the neighbour's tree, over the wall. I was going to plant them, so we'd have our own tree and you wouldn't have to climb over and get a hiding for it.|С соседского дерева, через забор. Я хотела их посадить — чтобы у нас было своё дерево и тебе не надо было лазить через забор и получать за это.|Qo'shnining daraxtidan, devor oshib. Ularni ekmoqchi edim: o'zimizning daraxtimiz bo'lsin, sen devordan oshib kaltak yemagin deb.`],
    ['sado', `...I. Why did I say "I"?|...Я. Почему я сказала «я»?|...Men. Nega «men» dedim?`],
    ['hero', `…|…|…`]
  ],
  stones: [
    { who: 'memory', text: `Your mother's memory. For a year afterwards she bakes for four, out of habit. Then for three. She never once says why.|Память твоей матери. Ещё год после того она печёт на четверых — по привычке. Потом на троих. Ни разу не говорит почему.|Onangning xotirasi. Shundan keyin yana bir yil odat bo'yicha to'rt kishiga non yopadi. Keyin uch kishiga. Nega — bir marta ham aytmaydi.` },
    { who: 'memory', text: `The neighbour's memory. Two kids in his apricot tree: the boy keeps watch, the girl eats. He sees them and goes back inside. Years later he sold this cheap. It was the best thing he had.|Память соседа. На его урючине двое детей: мальчик на стрёме, девочка ест. Он их видит — и уходит в дом. Через много лет он продал это за бесценок. Лучше у него ничего не было.|Qo'shnining xotirasi. O'rigining shoxida ikki bola: o'g'il poylab turibdi, qiz yeyapti. U ularni ko'radi-yu, indamay uyga kirib ketadi. Yillar o'tib buni arzimagan pulga sotdi. Undan yaxshirog'i yo'q edi.` },
    { who: 'memory', text: `Your father's memory. He signs the debt book with his thumb; he can't write. A young clerk holds the ink for him and won't meet his eyes. The clerk is Rustam.|Память отца. Он подписывает долговую книгу пальцем: писать не умеет. Молодой писарь держит ему чернильницу и прячет глаза. Писарь — Рустам.|Otangning xotirasi. Qarz daftariga barmog'ini bosib qo'l qo'yadi: savodi yo'q. Yosh mirza unga siyohdon tutib turibdi, ko'zini olib qochadi. Mirza — Rustam.` }
  ],
  memory: {
    id: 'm_pillow',
    lines: [
      ['memory', `The morning after you sold the tumar. You wake early. On the mat next to yours lies a second pillow, small, with a dent in it and one long black hair.|Утро после того, как ты продал тумар. Ты просыпаешься рано. На подстилке рядом с твоей — вторая подушка. Маленькая, со вмятиной и одним длинным чёрным волосом.|Tumarni sotganingning ertasi. Erta uyg'onasan. Yoningdagi ko'rpachada ikkinchi yostiq yotibdi. Kichkina, botiq, ustida bitta uzun qora soch tolasi.`],
      ['memory', `"Whose is this?" you ask. Your mother is at the tandir. She doesn't turn round. Her shoulders shake once. Then she slaps the next round of dough onto the wall, very hard.|«Это чья?» — спрашиваешь ты. Мама у тандыра. Она не оборачивается. Плечи вздрагивают — один раз. Потом она изо всех сил шлёпает следующую лепёшку о стенку.|«Bu kimniki?» deb so'raysan. Onang tandir yonida. O'girilmaydi. Yelkalari bir marta silkinadi. Keyin navbatdagi zuvalani tandir devoriga zarb bilan uradi.`],
      ['memory', `You fold the pillow and put it on the shelf, because it's in the way. You remember doing that. You remember nothing else about it at all.|Ты сворачиваешь подушку и кладёшь на полку — мешает. Это ты помнишь. Больше о ней не помнишь ничего.|Yostiqni buklab tokchaga qo'yasan — xalaqit berayotgandi. Buni eslaysan. U haqda boshqa hech narsani eslamaysan.`]
    ]
  },
  people: [{ look: 'mother', x: 0 }, { look: 'girl', x: 34 }],
  exit: done => {
    const lowTrust = (R().trust || 0) <= -3;
    play([
      ['', `By the door to the roof stands a girl with two braids, her back to you. Your mother kneads dough at the tandir and doesn't look up. This is how the house remembers them.|У двери на крышу стоит девочка с двумя косичками, спиной к тебе. Мама месит тесто у тандыра и не поднимает глаз. Так их помнит дом.|Tomga chiqadigan eshik oldida ikki o'rim sochli qizcha senga orqa qilib turibdi. Onang tandir yonida xamir qoryapti, boshini ko'tarmaydi. Uy ularni shunday eslaydi.`],
      ['', `On the shelf, where the bread cloth should be, lies a tumar. Grey felt, a triangle smaller than your palm. There's a thumbprint in the wax seal. A child's.|На полке, где должно лежать хлебное полотенце, — тумар. Серый войлок, треугольник меньше ладони. На восковой печати отпечаток пальца. Детского.|Tokchada, non dasturxoni turadigan joyda, tumar yotibdi. Kulrang kigiz, kaftdan kichik uchburchak. Mum muhrida barmoq izi. Bolaning barmog'i.`],
      ['sado', `I hate that smell. The wax.|Ненавижу этот запах. Воск.|Shu hidni yomon ko'raman. Mumni.`],
      ['hero', `That's mine. The tumar I sold when I was twelve. For the debt.|Это мой. Тумар, который я продал в двенадцать лет. За долг.|Bu meniki. O'n ikki yoshimda qarz uchun sotgan tumarim.`],
      ['', `The seal is cracked from corner to corner. One corner of the triangle is missing, as if something pushed its way out.|Печать треснула из угла в угол. Одного уголка у треугольника нет, будто что-то изнутри выломилось наружу.|Muhr burchakdan burchakka yorilgan. Uchburchakning bir uchi yo'q, go'yo ichidan nimadir yorib chiqqandek.`],
      ['sado', `Ravshan... I'm scared of it. Open it anyway. I think I have to know.|Равшан... мне страшно. Всё равно открой. По-моему, я должна знать.|Ravshan... qo'rqyapman. Baribir och. Bilishim kerakka o'xshaydi.`]
    ], () => ask(`The cracked tumar|Треснувший тумар|Yorilgan tumar`, [
      { id: 'open', label: `Break the wax and open it.|Сломать воск и открыть.|Mumni sindirib, tumarni ochish.` }
    ], () => play([
      ['memory', `A summer night on this roof. A girl of eight lies on her back beside you: two braids, dusty feet, a bowl of stolen apricots between you. She's counting stars out loud.|Летняя ночь на этой крыше. Рядом с тобой на спине лежит девочка лет восьми: две косички, пыльные пятки, между вами миска краденого урюка. Она считает звёзды вслух.|Shu tomda, yozgi tun. Yoningda sakkiz yoshli qizcha chalqancha yotibdi: ikki o'rim soch, oyoqlari chang, o'rtangizda bir kosa o'g'irlangan o'rik. U yulduzlarni ovoz chiqarib sanayapti.`],
      ['memory', `It's all here. Her chipped tooth. The way she licks her finger before she points. But where her voice should be, there's nothing. Her lips move, and there's no sound.|Тут всё есть. Щербинка в зубах. Как она облизывает палец, прежде чем показать. Только там, где должен быть голос, — пусто. Губы шевелятся, а звука нет.|Hammasi shu yerda. Kemtik tishi. Ko'rsatishdan oldin barmog'ini yalab olishi. Faqat ovozi turishi kerak joy bo'm-bo'sh. Lablari qimirlaydi — tovush yo'q.`],
      ['memory', `She points. Her lips shape a number. Eleven. Then she stops, the way she always stopped. After eleven she always got muddled.|Она показывает пальцем. Губы складывают число. Одиннадцать. И она замолкает — как всегда. После одиннадцати она вечно сбивалась.|U barmog'i bilan ko'rsatadi. Lablari son aytadi. O'n bir. Keyin to'xtaydi — har doimgidek. O'n birdan keyin u doim adashib ketardi.`],
      ['sado', `Twelve. Thirteen. Fourteen.|Двенадцать. Тринадцать. Четырнадцать.|O'n ikki. O'n uch. O'n to'rt.`],
      ['', `The girl's lips move with Sado's words. Exactly with them. As if they had never been apart.|Губы девочки шевелятся в такт словам Садо. Точь-в-точь. Будто они никогда и не расставались.|Qizchaning lablari Sadoning so'zlariga qo'shilib qimirlaydi. Aynan bir xil. Go'yo ular hech qachon ajralmagandek.`],
      ['sado', `Oh.|Ой.|Voy.`],
      ['sado', `That's my voice. That's the piece she's missing. It's me.|Это мой голос. Вот чего ей не хватает. Это я.|Bu mening ovozim. Unda yetishmayotgani shu. Bu — men.`],
      ['sado', `I didn't fit. Did I? You were twelve, and the tumar was small, and the Singer pushed and pushed, and I didn't fit.|Я не поместилась. Да? Тебе было двенадцать, тумар был маленький, Певица давила, давила, а я не поместилась.|Men sig'madim. Shundaymi? Sen o'n ikki yoshda eding, tumar kichkina edi, Xonanda bosaverdi, bosaverdi, men esa sig'madim.`],
      () => (R().mem.m2_sale ? ['sado', `"Whatever doesn't fit burns off. Usually." That's what she said. I didn't burn.|«Что не влезет, то сгорит. Обычно». Так она сказала. А я не сгорела.|«Sig'magani kuyib ketadi. Odatda». U shunday degandi. Men esa kuymadim.`] : null),
      ['sado', `So I stayed behind. In the crack. In you. That's why I'm scared of the dark, and hate the wax, and remembered the gate. That's why I knew where the board was.|И я осталась. В трещине. В тебе. Поэтому я боюсь темноты, ненавижу воск и помнила ворота. Поэтому знала, где доска.|Shunday qilib, qolib ketdim. Yoriqda. Sening ichingda. Shuning uchun qorong'idan qo'rqaman, mumni yomon ko'raman, darvozani eslab qolganman. Shuning uchun taxta qayerdaligini bilardim.`],
      ['hero', `Eleven boards to the tandir. Four steps to the roof. Thirteen stones.|Одиннадцать досок до тандыра. Четыре ступеньки на крышу. Тринадцать косточек.|Tandirgacha o'n bitta taxta. Tomga to'rtta zina. O'n uchta danak.`],
      ['sado', `You're counting.|Ты считаешь.|Sanayapsan.`],
      ['hero', `Oydin.|Ойдин.|Oydin.`],
      () => (oydinKnown()
        ? ['sado', `Me? ...I thought that was her name. The woman with my song. ...It's ours, isn't it? Somebody chose it on a bright night. Oydin. Moonlit.|Я? ...Я думала, это её имя. Той женщины с моей песней. ...Оно наше, да? Его выбрали лунной ночью. Ойдин. Лунная.|Menmi? ...Bu o'sha ayolning ismi deb o'ylabman. Qo'shig'imni aytadigan ayolning. ...Bu bizniki, a? Uni oydin kechada qo'yishgan. Oydin.`]
        : ['sado', `Me? ...Oydin. It sounds like moonlight. Somebody chose it on a bright night.|Я? ...Ойдин. Как лунный свет. Его выбрали лунной ночью.|Menmi? ...Oydin. Oy yorug'idek eshitiladi. Uni oydin kechada qo'yishgan.`]),
      ['sado', `So that's what I am. Let me say it properly, so we both understand.|Так вот что я такое. Дай скажу по порядку, чтобы мы оба поняли.|Demak, men shunaqa ekanman. Kel, bir boshdan aytay, ikkalamiz ham tushunib olaylik.`],
      ['sado', `You had a little sister. Oydin. When you were twelve your family was in debt, and you sold your memory of her to pay it. That's what was in the tumar.|У тебя была младшая сестра. Ойдин. Когда тебе было двенадцать, семья задолжала, и ты продал свою память о ней, чтобы расплатиться. Вот что было в тумаре.|Sening singling bor edi. Oydin. O'n ikki yoshingda oilang qarzga botgan edi, sen qarzni uzish uchun u haqdagi xotirangni sotding. Tumarda shu edi.`],
      ['sado', `But you loved her too much. It didn't all fit. The part that didn't, her at eight, her voice, how much she loved you, stayed in you like a splinter. That's me.|Только ты слишком её любил. Всё не влезло. То, что не влезло, — она в восемь лет, её голос, как она тебя любила, — застряло в тебе занозой. Это я.|Lekin sen uni juda yaxshi ko'rarding. Hammasi sig'madi. Sig'magani — sakkiz yoshli u, uning ovozi, seni qanchalik yaxshi ko'rgani — ichingda zirapchadek qolib ketdi. U — men.`],
      ['sado', `When Shirin sang the Pledge Song into you, it woke me. I'm not a ghost, Ravshan. I'm a piece of your sister you kept without knowing.|Когда Ширин вложила в тебя Песню залога, я проснулась. Я не призрак, Равшан. Я кусочек твоей сестры, который ты сберёг, сам того не зная.|Shirin senga Garov qo'shig'ini kuylaganda, men uyg'onib ketdim. Men arvoh emasman, Ravshan. Men singlingning bir parchasiman. Sen uni bilmay asrab yurgansan.`],
      () => (oydinKnown()
        ? ['sado', `And she's alive. The real Oydin. She grew up: she's twenty-eight, and angry, and she hums my song. I'm what's left of her at eight.|А она жива. Настоящая Ойдин. Выросла: ей двадцать восемь, она злая и напевает мою песню. А я — то, что осталось от неё восьмилетней.|U esa tirik. Haqiqiy Oydin. U katta bo'ldi: yigirma sakkizda, jahldor, mening qo'shig'imni xirgoyi qiladi. Men esa — undan sakkiz yoshida qolgan parcha.`]
        : null),
      ['hero', `They took her anyway. I paid with her, and they took her anyway.|А её всё равно забрали. Я расплатился ею — и её всё равно забрали.|Baribir uni olib ketishdi. Men u bilan to'ladim — baribir olib ketishdi.`],
      () => (F().rustam ? ['sado', `Rustam wrote her into the book that same year. You heard him.|Рустам в тот же год вписал её в книгу. Ты сам слышал.|Rustam aka o'sha yili uni daftarga yozgan. O'zing eshitding.`] : null),
      ['sado', `Don't. Not now. Don't decide anything because I'm crying.|Не надо. Не сейчас. Не решай ничего из-за того, что я плачу.|Kerakmas. Hozir emas. Yig'layapti deb hech narsani hal qilma.`],
      ['sado', `I'm not crying, of course. I can't. She was so scared she couldn't even cry. Remember?|Я, конечно, не плачу. Не могу. Ей было так страшно, что она даже плакать не могла. Помнишь?|Albatta, yig'lamayapman. Qo'limdan kelmaydi. U shunchalik qo'rqqan ediki, hatto yig'lay olmasdi. Esingdami?`],
      ['', `The girl at the roof door turns around. She has your mother's chin. She's waiting to see what you'll do with her.|Девочка у двери на крышу оборачивается. Подбородок у неё мамин. Она ждёт, что ты с ней сделаешь.|Tom eshigi oldidagi qizcha o'giriladi. Iyagi xuddi onangniki. U bilan nima qilishingni kutyapti.`],
      ['sado', `Now that we know, you have to decide what happens to me. Ask me anything first. I'll tell you the truth.|Теперь, когда мы знаем, тебе решать, что со мной будет. Сначала спрашивай, что хочешь. Я скажу правду.|Endi bildik. Menga nima bo'lishini sen hal qilasan. Avval nimani xohlasang, so'ra. Rostini aytaman.`],
      lowTrust ? ['sado', `You haven't always been kind to me, Ravshan. Choose like a brother anyway.|Ты не всегда был ко мне добр, Равшан. Всё равно выбирай как брат.|Sen menga doim ham yaxshi bo'lmading, Ravshan. Baribir aka bo'lib tanla.`] : null
    ], () => sadoChoice(done))));
  }
});

/* =====================================================================
   31 · b_nightmare — Ajdaho, the Nightmare of the Sleeper; then Obi-Hayot
   ===================================================================== */
const sadoPre = () => ({
  remember: ['hero', `She used to be afraid of the dark for both of us. My turn.|Она боялась темноты за нас обоих. Теперь моя очередь.|U ikkalamiz uchun qorong'idan qo'rqardi. Endi navbat menda.`],
  keep: ['sado', `It's very dark in there, Toychoq. Go anyway. I'll talk loudly.|Там очень темно, Тойчок. Всё равно иди. Я буду громко болтать.|U yer juda qorong'i, Toychoq. Baribir kir. Men baland ovozda gapirib turaman.`],
  oydin: ['sado', `Last fight together. Then I go to her. Don't you dare die before that.|Последний бой вместе. Потом я ухожу к ней. Только попробуй умереть раньше.|Birga oxirgi jang. Keyin uning oldiga ketaman. Undan oldin o'lishni xayolingga ham keltirma.`],
  tale: ['sado', `Every tale has a dragon. I always wondered who had to fight it. Turns out it's you.|В каждом сказании есть дракон. Я всё думала, кому же с ним драться. Оказывается, тебе.|Har bir dostonda ajdaho bo'ladi. U bilan kim olishar ekan, deb doim o'ylardim. Sen ekansan.`]
}[fate()] || null);

BOSS('aidahar', {
  name: `Ajdaho|Аждахо|Ajdaho`,
  title: `The Nightmare of the Sleeper|Кошмар Спящего|Uxlovchining dahshatli tushi`,
  quote: `Every fear you fed him has teeth.|У каждого страха, которым вы его кормили, есть зубы.|Unga yedirgan har bir qo'rquvingizning tishi bor.`,
  lair: `The Nightmare's Nest|Гнездо Кошмара|Dahshat uyasi`,
  lairSub: `Everything he was ever afraid of, coiled up|Всё, чего он когда-либо боялся, свилось в кольца|U qo'rqqan hamma narsa — halqa bo'lib o'ralgan`,
  // pre: defined below as a getter (it depends on Sado's fate)
  again: [
    `AGAIN, YODCHI? I HAVE THREE HUNDRED YEARS OF PATIENCE.|СНОВА, ЁДЧИ? У МЕНЯ ТРИСТА ЛЕТ ТЕРПЕНИЯ.|YANA, YODCHI? MENDA UCH YUZ YILLIK SABR BOR.`,
    `YOU TASTE OF WAX AND APRICOTS.|НА ВКУС ТЫ — ВОСК И УРЮК.|SENDAN MUM VA O'RIK TA'MI KELADI.`,
    `EVERY TIME YOU FALL, I DREAM IT AGAIN.|ВСЯКИЙ РАЗ, КОГДА ТЫ ПАДАЕШЬ, МНЕ СНИТСЯ ЭТО СНОВА.|HAR SAFAR YIQILGANINGDA, BUNI YANA TUSHIMDA KO'RAMAN.`
  ],
  post: done => finale(done)
});

// the founders' tumars, the faction whose plan is under way, Sado, Nargiza — then a hub that explains the four endings.
function finale(done) {
  const f = F(), fac = faction(), ob = obiWho(), here = oydinHere(), sf = fate();
  const lines = [
    ['', `Ajdaho breaks into scales, and the scales melt like ice in a tea bowl. Where it lay, the water stands up: tall, clear, with two small lights for eyes.|Аждахо рассыпается чешуёй, и чешуя тает, как лёд в пиале. Там, где он лежал, встаёт вода — высокая, прозрачная, с двумя огоньками вместо глаз.|Ajdaho tangachalarga sochilib ketadi, tangachalar kosadagi muzdek eriydi. U yotgan joyda suv tik turadi: baland, tiniq, ko'z o'rnida ikkita mitti nur.`],
    ifSado(`That's him. Not the nightmare. Him.|Это он. Не кошмар — он сам.|Bu u. Dahshat emas — uning o'zi.`),
    [ob, `Hush... Who's there? I was water once. People told me stories, and I rose out of the sand to hear them better.|Тише... Кто здесь? Когда-то я был водой. Мне рассказывали истории, и я поднимался из песка, чтобы лучше слышать.|Jim... Kim bor? Bir vaqtlar men suv edim. Menga hikoya aytishardi, yaxshiroq eshitay deb qumdan ko'tarilardim.`],
    [ob, `Then they gave me lives instead. So many lives. Weddings, debts, first snows. Tell me, little one: which of them is mine?|Потом вместо историй мне стали давать жизни. Столько жизней. Свадьбы, долги, первый снег. Скажи мне, малыш: которая из них моя?|Keyin hikoya o'rniga menga hayotlar bera boshlashdi. Shuncha ko'p hayot. To'ylar, qarzlar, birinchi qorlar. Ayt-chi, bolakay: qaysi biri meniki?`]
  ];
  if (f.name) lines.push(
    ['hero', `None of them, Obi-Hayot.|Ни одна, Оби-Хаёт.|Hech biri, Obi Hayot.`],
    ['obi', `...That. Say that again. That one is mine. My name.|...Вот. Скажи ещё раз. Вот это — моё. Моё имя.|...Mana shu. Yana ayt. Mana shu meniki. Mening ismim.`]
  );
  else lines.push(['hero', `None of them.|Ни одна.|Hech biri.`]);

  // where the founders' tumars are
  if (tookTumars()) lines.push(
    ['', `The founders' tumars drag at your belt, all seven, warm as stones in the sun. They're humming their song to themselves.|Тумары основателей оттягивают пояс — все семь, тёплые, как камни на солнце. Они вполголоса напевают свою песню.|Asoschilar tumarlari belingni tortib turibdi — yettalasi ham, quyoshdagi toshdek iliq. Ular o'z qo'shig'ini ohista xirgoyi qilyapti.`],
    ['', `Oydin steps out of the water behind you, as if she'd always been there.|За твоей спиной из воды выходит Ойдин — будто всегда там стояла.|Orqangdagi suvdan Oydin chiqadi — go'yo doim o'sha yerda turgandek.`],
    ['oydin', `You took them from me, Toychoq. Now let's see what you do with them.|Ты отнял их у меня, Тойчок. Ну, посмотрим, что ты с ними сделаешь.|Ularni mendan tortib olding, Toychoq. Qani, ko'raylik-chi, nima qilarkansan.`]
  );
  else if (here || fac === 'remember') lines.push(
    ['', `Oydin steps out of the water behind you, as if she'd always been there. The founders' tumars hang from her fist on one cord, all seven, humming.|За твоей спиной из воды выходит Ойдин — будто всегда там стояла. Тумары основателей висят у неё в кулаке на одном шнурке, все семь, и гудят.|Orqangdagi suvdan Oydin chiqadi — go'yo doim o'sha yerda turgandek. Asoschilar tumarlari uning mushtida bitta ipga tizilgan, yettalasi ham g'uvillaydi.`]
  );
  else lines.push(
    ['', `The founders' tumars lie at the water's edge, where Ajdaho guarded them. All seven, humming their song.|Тумары основателей лежат у кромки воды, там, где их стерёг Аждахо. Все семь, и напевают свою песню.|Asoschilar tumarlari Ajdaho qo'riqlagan suv chetida yotibdi. Yettalasi ham o'z qo'shig'ini xirgoyi qilyapti.`]
  );

  // the plan already under way
  if (fac === 'singers') lines.push(
    ['', `Shirin rises out of the black water. In the dream the Ustoz is younger, and more frightening.|Из чёрной воды поднимается Ширин. Во сне Устоз моложе — и страшнее.|Qora suvdan Shirin ko'tariladi. Tushda Ustoz yoshroq — va qo'rqinchliroq.`],
    f.nargizaQ === 'returned' ? ['', `She holds Nargiza by the wrist.|Она держит Наргизу за запястье.|U Nargizaning bilagidan ushlab turibdi.`] : null,
    ['shirin', `The Great Tithe has begun, yodchi. Up there, the Tail is being sung empty. Give the Well the founders' tumars and it's over in one night, and he sleeps for a hundred years.|Великая десятина началась, ёдчи. Наверху уже выпевают Хвост. Отдай Колодцу тумары основателей — и всё кончится за одну ночь. А он проспит сто лет.|Buyuk ushr boshlandi, yodchi. Tepada Dumni kuylab bo'shatishyapti. Asoschilar tumarlarini Quduqqa ber — hammasi bir kechada tugaydi. U esa yuz yil uxlaydi.`],
    ['shirin', `I lost my daughter when he turned in his sleep. I will not lose a whole city.|Я потеряла дочь, когда он повернулся во сне. Целый город я не потеряю.|U uyqusida ag'darilganda qizimdan ayrildim. Butun shahardan ayrilmayman.`]
  );
  else if (fac === 'divan') lines.push(
    ['', `Gold light spills over the water, and the shadow of wide wings falls across it. Tilla-bek walks on the shadow as if it were a carpet.|По воде разливается золотой свет, и на неё ложится тень широких крыльев. Тилла-бек идёт по тени, как по ковру.|Suv ustiga oltin nur yoyiladi, keng qanotlarning soyasi tushadi. Tillabek soya ustidan gilam ustida yurgandek keladi.`],
    ['tillabek', `The Humo's shadow fell on me, yodchi. I'm only sharing it. Sing the founders' song and hold the chain. You'll never collect a tithe again. People will owe it to you.|На меня пала тень Хумо, ёдчи. Я лишь делюсь ею. Спой песню основателей и держи цепь. Собирать десятину тебе больше не придётся — это тебе будут должны.|Menga Humo soyasi tushdi, yodchi. Men uni ulashyapman, xolos. Asoschilar qo'shig'ini kuyla, zanjirni tut. Endi ushr yig'ib yurmaysan — sendan qarzdor bo'lib yurishadi.`],
    ['tillabek', `And no one in the Tail will ever pay with a memory again. They'll pay with work, like honest people. Those Who Remember wanted that much, didn't they? Minus the drowning.|И никто в Хвосте больше не заплатит памятью. Будут платить трудом, как честные люди. Те, кто помнит, ведь этого и хотели? Только без потопа.|Dumda esa endi hech kim xotira bilan to'lamaydi. Halol odamlardek mehnat bilan to'laydi. Eslaganlar ham shuni xohlashgan-ku? Faqat toshqinsiz.`]
  );
  else lines.push(
    ['oydin', `Break them, Toychoq. Let everything go home. Every stolen night, every sold wedding, every girl in every cellar. Let them all remember.|Разбей их, Тойчок. Пусть всё вернётся домой. Каждая краденая ночь, каждая проданная свадьба, каждая девочка из каждого подвала. Пусть вспомнят все.|Sindir ularni, Toychoq. Hammasi uyiga qaytsin. Har bir o'g'irlangan tun, har bir sotilgan to'y, har bir yerto'ladagi har bir qizcha. Hamma eslasin.`],
    ['oydin', `The city will sink. I know. It sank me first, when I was eight.|Город утонет. Знаю. Меня он утопил первой — в восемь лет.|Shahar cho'kadi. Bilaman. Meni u birinchi bo'lib cho'ktirgan — sakkiz yoshimda.`]
  );
  if (here && fac !== 'remember' && !tookTumars()) lines.push(
    ['oydin', `Whatever they're promising you, Toychoq, they promised me too. When I was eight.|Что бы они тебе ни сулили, Тойчок, мне сулили то же самое. В восемь лет.|Ular senga nima va'da qilishmasin, Toychoq, menga ham shuni va'da qilishgan. Sakkiz yoshimda.`]
  );

  // Sado, according to her fate
  let gaveSado = false;
  if (sf === 'remember') {
    lines.push(['', `Nobody in your head says anything. But you know exactly what she'd say. You remember her.|В голове никто ничего не говорит. Но ты точно знаешь, что бы она сказала. Ты её помнишь.|Boshingda hech kim hech narsa demaydi. Lekin u nima degan bo'lardi — aniq bilasan. Uni eslaysan.`]);
    if (here || fac === 'remember') lines.push(
      ['oydin', `...You're looking at me differently. You remember. You remember me.|...Ты смотришь по-другому. Ты вспомнил. Ты меня вспомнил.|...Menga boshqacha qarayapsan. Eslading. Meni eslading.`],
      ['hero', `You always got the crust.|Тебе всегда доставалась корочка.|Senga doim nonning chekkasi tegardi.`]
    );
  } else if (sf === 'keep') {
    lines.push(['sado', `I'm here. Whatever you choose, I'm here. That's what you wanted.|Я здесь. Что бы ты ни выбрал, я рядом. Ты сам так захотел.|Men shu yerdaman. Nimani tanlasang ham, yoningdaman. O'zing shuni xohlading.`]);
    if (here) lines.push(['oydin', `There's still someone behind your eyes, Toychoq. She's looking at me.|У тебя за глазами всё ещё кто-то есть, Тойчок. Она на меня смотрит.|Ko'zlaring ortida hali ham kimdir bor, Toychoq. U menga qarayapti.`]);
  } else if (sf === 'oydin') {
    if (here || fac === 'remember') {
      gaveSado = true;
      lines.push(
        ['sado', `It's time. Hold her hand, Toychoq. It's easier if you hold her hand.|Пора. Возьми её за руку, Тойчок. За руку легче.|Vaqt bo'ldi. Qo'lidan tut, Toychoq. Qo'ldan tutsang, osonroq.`],
        ['', `You take Oydin's hand. It's rough and very cold. Something passes down your arm like warmth through a cup, and the little light by your shoulder is gone.|Ты берёшь Ойдин за руку. Рука шершавая и очень холодная. По твоей руке что-то проходит, как тепло сквозь пиалу, — и огонька у плеча больше нет.|Oydinning qo'lidan tutasan. Qo'li dag'al, muzdek. Qo'lingdan nimadir o'tadi — kosadan o'tgan iliqlikdek — va yelkang yonidagi nurcha yo'qoladi.`],
        ['oydin', `...Oh. Oh, she's so small. I forgot I was ever that small.|...Ой. Какая же она маленькая. Я и забыла, что была такой маленькой.|...Voy. Shunchalik kichkina-ya. Bir paytlar shunaqa kichkina bo'lganimni unutib qo'yibman.`],
        ['oydin', `She's counting. Past eleven. I never could get past eleven.|Она считает. Дальше одиннадцати. А я дальше одиннадцати никогда не могла.|U sanayapti. O'n birdan ham o'tib. Men hech qachon o'n birdan o'tolmasdim.`]
      );
    } else lines.push(['sado', `She isn't here. I'll wait for her. Turns out I'm good at waiting.|Её здесь нет. Я её подожду. Оказывается, я умею ждать.|U bu yerda yo'q. Uni kutaman. Kutishni bilar ekanman.`]);
  } else if (sf === 'tale') {
    lines.push(['sado', `When you're ready, tell him about me. I'll be the story. I always wanted to be in one.|Когда будешь готов, расскажи ему обо мне. Я буду историей. Я всегда хотела попасть в сказку.|Tayyor bo'lganingda, unga men haqimda aytib ber. Men hikoya bo'laman. Doim ertakka tushgim kelardi.`]);
  }

  // Nargiza's voice
  const miss = taleMissing(false);
  if (f.nargizaQ === 'believes') {
    lines.push(['', `High above, faint as rain on a roof, Nargiza is still singing. Her voice reaches down into the water.|Высоко наверху, тихо, как дождь по крыше, всё ещё поёт Наргиза. Её голос доходит до самой воды.|Juda tepada, tomni chertgan yomg'irdek ohista, Nargiza hamon kuylayapti. Uning ovozi suvgacha yetib keladi.`]);
    if (miss) lines.push(
      ['nargiza', `He wants to be told, yodchi, not fed. But I can't sing it. Not like this.|Ему надо, чтобы рассказывали, ёдчи, а не кормили. Но я не могу это спеть. Не так.|Unga yedirish emas, aytib berish kerak, yodchi. Lekin men buni kuylay olmayman. Bunday emas.`],
      ['', miss]
    );
    else lines.push(['nargiza', `Yodchi, I can hear him clearly now. He doesn't want memories. He wants to be told. Give me your story and I'll sing it to him.|Ёдчи, теперь я слышу его ясно. Ему не нужна память. Ему нужно, чтобы ему рассказывали. Дай мне свою историю — и я её ему спою.|Yodchi, endi uni aniq eshityapman. Unga xotira kerak emas. Unga hikoya aytib berish kerak. Menga hikoyangni ber, men uni unga kuylab beraman.`]);
  }
  lines.push([ob, `Which one is mine, little one? Choose for me. I'm so tired of choosing among the dead.|Которая из них моя, малыш? Выбери за меня. Я так устал выбирать среди мёртвых.|Qaysi biri meniki, bolakay? Men uchun tanla. O'liklar orasidan tanlayverib juda charchadim.`]);
  lines.push(['', `It's up to you now. There are four ways to end this, and each decides what becomes of the city.|Теперь решать тебе. Закончить всё можно четырьмя способами, и от каждого зависит, что станет с городом.|Endi qaror senda. Buni to'rt yo'l bilan tugatish mumkin, shaharning taqdiri har biriga bog'liq.`]);

  play(lines, () => {
    if (gaveSado) { F().sado = 0; save(); }
    hub(`The fate of Yodgor|Судьба Ёдгора|Yodgor taqdiri`, [
      { label: `— What if he's fed again?|— А если его снова накормить?|— Uni yana to'ydirsam-chi?`, lines: [
        ['', `If the Singers get the founders' tumars, Shirin sings the Great Tithe. In one night the whole Tail is sung empty, and he sleeps, full, for a hundred years.|Если тумары основателей достанутся Певцам, Ширин споёт Великую десятину. За одну ночь весь Хвост выпоют досуха, и он, сытый, проспит сто лет.|Asoschilar tumarlari Xonandalarga tegsa, Shirin Buyuk ushrni kuylaydi. Bir kechada butun Dumni kuylab bo'shatishadi, u esa to'q holda yuz yil uxlaydi.`],
        ['', `The tremors stop and the water turns sweet. For a hundred years nobody's house slides into the sand. The Tail pays for it: all of it, in one night.|Толчки прекратятся, вода станет сладкой. Сто лет ничей дом не съедет в песок. Платит за это Хвост — весь, за одну ночь.|Silkinishlar to'xtaydi, suv shirin bo'ladi. Yuz yil hech kimning uyi qumga sirg'alib ketmaydi. Buning haqini Dum to'laydi — butunlay, bir kechada.`],
        ifSado(`A hundred quiet years. Paid for by people like Mehri. Like Alp.|Сто лет тишины. А платят люди вроде Мехри. Вроде Алпа.|Yuz yillik tinchlik. Mehriga, Alpga o'xshaganlar evaziga.`),
        ifSado(`...And no little girl hides under a table when the floor lifts. I hate that that's a real answer too.|...И ни одна девочка больше не будет сидеть под столом, когда пол поднимается. Ненавижу, что это тоже ответ.|...Pol ko'tarilganda birorta ham qizcha stol tagida qaltirab o'tirmaydi. Bu ham javob ekani alam qiladi.`)
      ] },
      { label: `— What if I chain him?|— А если посадить его на цепь?|— Uni kishanlasam-chi?`, lines: [
        ['', `Sing the founders' song yourself and he's chained: awake, but obedient. He raises water when the Divan says so, and lowers it when the Divan says so.|Если самому спеть песню основателей, он окажется на цепи: не спит, но слушается. Поднимает воду, когда велит Диван, и опускает, когда велит Диван.|Asoschilar qo'shig'ini o'zing kuylasang, u kishanlanadi: uyg'oq, lekin itoatkor. Devon buyursa suv ko'taradi, Devon buyursa tushiradi.`],
        ['', `Nobody pays a tithe again, rich or poor. Instead Tilla-bek sells memory along the whole Silk Road, and the city grows rich on a slave. Whoever holds the chain holds the water.|Десятину больше не платит никто — ни богатый, ни бедный. Зато Тилла-бек торгует памятью по всему Шёлковому пути, и город богатеет на рабе. У кого цепь — у того и вода.|Endi boy ham, kambag'al ham ushr to'lamaydi. Buning o'rniga Tillabek butun Ipak yo'li bo'ylab xotira sotadi, shahar esa qul hisobiga boyiydi. Zanjir kimda bo'lsa, suv ham o'shanda.`],
        ifSado(`He'd be awake and in chains. Like Ak Bars was. For ever.|Он будет не спать, а сидеть на цепи. Как Ак Барс. Навсегда.|U uyg'oq bo'ladi — va kishanda. Oq Bars kabi. Abadiy.`)
      ] },
      { label: `— What if I wake him?|— А если его разбудить?|— Uni uyg'otsam-chi?`, lines: [
        ['', `Break the founders' tumars and the chain is gone. Three hundred years of stolen memories go home to their owners, and he wakes.|Если разбить тумары основателей, цепи не станет. Триста лет краденой памяти вернутся к хозяевам, и он проснётся.|Asoschilar tumarlarini sindirsang, kishan yo'qoladi. Uch yuz yillik o'g'irlangan xotira egalariga qaytadi va u uyg'onadi.`],
        ['', `When he wakes, Yodgor slides off his back into the sand. Everyone remembers everything. Many won't get out of the water.|Проснувшись, он стряхнёт Ёдгор со спины в песок. Все вспомнят всё. Многие не выберутся из воды.|U uyg'onganda Yodgor uning orqasidan qumga sirg'alib tushadi. Hamma hammasini eslaydi. Ko'pchilik suvdan chiqolmaydi.`],
        ifSado(`It's the most honest way. And the most people die. Both are true.|Это самый честный путь. И в нём погибнет больше всех. Правда и то, и другое.|Bu eng halol yo'l. Eng ko'p odam ham shunda halok bo'ladi. Ikkalasi ham rost.`)
      ] },
      { label: `— And if I tell him a tale?|— А если рассказать ему сказание?|— Unga doston aytib bersam-chi?`, lines: done2 => play([
        ['', `Before the founders, people didn't feed him lives. They told him stories, and stories don't get used up. That's what Turab was trying to tell you.|До основателей ему не скармливали жизни. Ему рассказывали истории, а истории не кончаются. Вот что пытался сказать тебе Тураб.|Asoschilardan oldin unga hayot yedirishmagan. Unga hikoya aytib berishgan, hikoya esa tugamaydi. Turob senga shuni aytmoqchi bo'lgan.`],
        ['', `If Nargiza sings him your true story, he may go back to sleeping on tales. No tithe, no chain, no flood.|Если Наргиза споёт ему твою правдивую историю, он, может быть, снова уснёт на сказаниях. Без десятины, без цепи, без потопа.|Nargiza unga sening rost hikoyangni kuylasa, u balki yana dostonlar ostida uxlab qolar. Ushrsiz, kishansiz, toshqinsiz.`],
        ['', `But a tale is not a chain. If he ever stops listening, nothing holds him. And Nargiza will have to sing to him every night for the rest of her life.|Только сказание — не цепь. Если он однажды перестанет слушать, его ничто не удержит. А Наргизе придётся петь ему каждую ночь до конца своих дней.|Lekin doston kishan emas. U bir kun tinglashdan to'xtasa, uni hech narsa ushlab turolmaydi. Nargiza esa umrining oxirigacha har kecha unga kuylashi kerak bo'ladi.`],
        ['', `And your story stops being yours. The whole city will hear what you sold at twelve, and who.|И твоя история перестанет быть только твоей. Весь город услышит, что ты продал в двенадцать лет. И кого.|Hikoyang ham endi faqat seniki bo'lmaydi. Butun shahar o'n ikki yoshingda nimani sotganingni eshitadi. Kimni sotganingni ham.`],
        miss ? ['', `But it can't be done now.|Но сейчас это невозможно.|Lekin hozir buning iloji yo'q.`] : null,
        miss ? ['', miss] : null
      ], done2) }
    ], [
      { id: 'tithe', label: fac === 'singers' ? `"Finish the Great Tithe, Ustoz." Give her the founders' tumars.|«Доводите Великую десятину до конца, Устоз». Отдать ей тумары основателей.|«Buyuk ushrni oxiriga yetkazing, Ustoz». Unga asoschilar tumarlarini berish.` : `Give the founders' tumars to the Singers. Let him sleep, fed.|Отдать тумары основателей Певцам. Пусть спит сытым.|Asoschilar tumarlarini Xonandalarga berish. To'q uxlasin.` },
      { id: 'chain', label: fac === 'divan' ? `Sing the founders' song. Put him on the Divan's chain.|Спеть песню основателей. Посадить его на цепь Дивана.|Asoschilar qo'shig'ini kuylab, uni Devon zanjiriga solish.` : `Sing the founders' song. Hold the chain yourself.|Спеть песню основателей. Держать цепь самому.|Asoschilar qo'shig'ini kuylab, zanjirni o'zing tutish.` },
      { id: 'awake', label: fac === 'remember' ? `"Together, Oydin." Break the founders' tumars.|«Вместе, Ойдин». Разбить тумары основателей.|«Birga, Oydin». Asoschilar tumarlarini sindirish.` : `Break the founders' tumars. Let him wake.|Разбить тумары основателей. Пусть просыпается.|Asoschilar tumarlarini sindirish. Uyg'onsin.` },
      { id: 'tale', label: `Give Nargiza your story to sing. All of it.|Отдать Наргизе свою историю. Всю, как есть.|Nargizaga hikoyangni berish. Boricha, hammasini.`, lock: miss }
    ], o => endGame(o.id));
  });
}

/* =====================================================================
   Endings. Each epilogue is assembled from flags: one slide per person
   whose fate the flags decide, then Sado, then Ravshan. One idea per slide.
   ===================================================================== */
const EP = {
  city: e => ({
    tithe: `The Sleeper sleeps, well fed. The tremors stopped, the caravans came back, and prices at the Memory Bazaar doubled.|Спящий спит сытым. Толчки прекратились, караваны вернулись, а цены на Базаре памяти выросли вдвое.|Uxlovchi to'q uxlaydi. Silkinishlar to'xtadi, karvonlar qaytdi, Xotira bozoridagi narxlar esa ikki baravar oshdi.`,
    chain: `Yodgor became the capital of the memory trade. The chained spirit raises the water when the Divan says so, and lowers it when the Divan says so.|Ёдгор стал столицей торговли памятью. Дух на цепи поднимает воду, когда велит Диван, и опускает, когда велит Диван.|Yodgor xotira savdosining poytaxtiga aylandi. Zanjirdagi ruh Devon buyursa suv ko'taradi, Devon buyursa tushiradi.`,
    awake: `Yodgor sank into the sand in a single night. Not everyone got out of the water. Those who did remembered everything, and some of them couldn't live with it.|Ёдгор ушёл в песок за одну ночь. Из воды выбрались не все. Выжившие вспомнили всё, и некоторые не смогли с этим жить.|Yodgor bir kechada qumga botdi. Suvdan hamma ham chiqolmadi. Chiqqanlar hammasini esladi, ba'zilari bu bilan yashay olmadi.`,
    tale: `Obi-Hayot sleeps on tales again, as he did before the city. The tithe is gone. Stolen memories drift home slowly, in dreams, a drop at a time.|Оби-Хаёт снова спит на сказаниях, как до города. Десятины больше нет. Краденая память возвращается к людям медленно — во снах, по капле.|Obi Hayot yana shahar qurilmasdan oldingidek dostonlar ostida uxlaydi. Ushr yo'q. O'g'irlangan xotiralar egalariga sekin — tushlarda, tomchilab qaytyapti.`
  }[e]),
  tail: e => {
    const f = F(), strong = f.chain === 'carried' || f.alp === 'helped' || ((R().rep || {}).tail || 0) >= 3;
    if (e === 'tithe') return f.chain === 'carried'
      ? { v: 'fight', text: `The Tail met the Singers with knives and lamps: every hearth knew about the Tower of Silence. The Great Tithe cost the Order half its bakhshi, and took half the Tail.|Хвост встретил Певцов ножами и лампами: про Башню молчания знали у каждого очага. Великая десятина стоила ордену половины бахши — и забрала половину Хвоста.|Dum Xonandalarni pichoq va chiroq bilan kutib oldi: Sukunat minorasini har bir o'choq boshida bilishardi. Buyuk ushr ordenga baxshilarining yarmiga tushdi va Dumning yarmini oldi.` }
      : strong
        ? { v: 'hide', text: `The Tail barred its doors and hid its children in the karez. Half of it was sung empty anyway. Half is more than nothing.|Хвост заколотил двери и спрятал детей в кяризах. Половину всё равно выпели. Но половина — больше, чем ничего.|Dum eshiklarini mixlab, bolalarini korizlarga yashirdi. Yarmini baribir kuylab bo'shatishdi. Lekin yarmi — hech narsadan ko'p.` }
        : { v: 'give', text: `The Tail didn't fight back. For twenty years it had been taught to give.|Хвост не сопротивлялся. Его двадцать лет учили отдавать.|Dum qarshilik qilmadi. Uni yigirma yil berishga o'rgatishgan.` };
    if (e === 'chain') return strong
      ? { v: 'refuse', text: `The Tail refused to dig the Divan's new wells. So the Divan lowered the water under it until it changed its mind.|Хвост отказался копать новые колодцы Дивана. Тогда Диван опустил под ним воду — пока тот не передумал.|Dum Devonning yangi quduqlarini qazishdan bosh tortdi. Shunda Devon u ko'nmaguncha tagidagi suvni pasaytirib qo'ydi.` }
      : { v: 'dig', text: `The Tail digs the Divan's wells and is paid in water. It has never been so clean, or so quiet.|Хвост копает колодцы Дивана, и ему платят водой. Никогда ещё он не был таким чистым — и таким тихим.|Dum Devon quduqlarini qazadi, haqini suv bilan olishadi. U hech qachon bunchalik toza — va bunchalik jim bo'lmagan.` };
    if (e === 'awake') return `The Tail, lowest on his back, felt it first. Its people knew how to lose everything. They climbed out first, and pulled the Ark out after them.|Хвост лежал ниже всех и почуял первым. Его люди умели терять всё. Они выбрались первыми — и вытащили за собой Арк.|Dum eng pastda yotardi va birinchi sezdi. Uning odamlari hamma narsadan ayrilishni bilardi. Ular birinchi chiqishdi — Arkni ham ortidan tortib chiqarishdi.`;
    return strong
      ? { v: 'stories', text: `Every evening the Tail brings its stories to the Well, taking turns. It turns out the poor have the most of them.|Каждый вечер Хвост по очереди несёт к Колодцу свои истории. Оказалось, у бедных их больше всех.|Dum har oqshom navbat bilan Quduqqa hikoyalarini olib keladi. Ma'lum bo'lishicha, kambag'allarda hikoya hammadan ko'p ekan.` }
      : { v: 'doorstep', text: `The Tail was slow to believe the tithe was over. For a year, on the Night of Payment, people still left a tumar on the doorstep. No one came for them.|Хвост долго не верил, что десятине конец. Ещё год в Ночь Уплаты люди оставляли на пороге тумар. За ними никто не пришёл.|Dum ushr tugaganiga uzoq ishonmadi. Yana bir yil To'lov kechasi odamlar ostonaga tumar qo'yib qo'yishdi. Olgani hech kim kelmadi.` };
  },
  shirin: e => ({
    tithe: F().nargizaQ === 'returned'
      ? { v: 'withNargiza', text: `Shirin sings over the Well every night, with Nargiza beside her. She kept the city asleep. She no longer dreams of her daughter. She gave that too.|Ширин каждую ночь поёт над Колодцем, Наргиза рядом. Она сохранила городу сон. Дочь ей больше не снится. Это она тоже отдала.|Shirin har kecha Quduq ustida kuylaydi, yonida Nargiza. U shaharning uyqusini asrab qoldi. Qizi endi tushiga kirmaydi. Buni ham berib yubordi.` }
      : `Shirin sings over the Well every night. She kept the city asleep. She no longer dreams of her daughter. She gave that too, on the night of the Great Tithe.|Ширин каждую ночь поёт над Колодцем. Она сохранила городу сон. Дочь ей больше не снится. Это она тоже отдала — в ночь Великой десятины.|Shirin har kecha Quduq ustida kuylaydi. U shaharning uyqusini asrab qoldi. Qizi endi tushiga kirmaydi. Buni ham Buyuk ushr kechasi berib yubordi.`,
    chain: `The Divan bought the Order of the Singers outright. Shirin refused to sign. She walked into the Well singing, and the water closed over her voice.|Диван купил орден Певцов целиком. Ширин отказалась ставить подпись. Она вошла в Колодец с песней, и вода сомкнулась над её голосом.|Devon Xonandalar ordenini butunlay sotib oldi. Shirin imzo chekmadi. U kuylagancha Quduqqa kirdi va suv uning ovozi ustidan yopildi.`,
    awake: `When the memories went home, Shirin's daughter came back to her whole: her laugh, her weight in her arms, the sound of her running. Shirin walked into the water after her.|Когда память вернулась домой, к Ширин целиком вернулась дочь: её смех, её тяжесть на руках, топот её ног. Ширин ушла за ней в воду.|Xotiralar uyiga qaytganda Shirinning qizi unga butunligicha qaytdi: kulgisi, qo'lidagi og'irligi, yugurgandagi oyoq tovushi. Shirin uning ortidan suvga kirib ketdi.`,
    tale: `Shirin came to hear Nargiza sing and stood at the back, like a pilgrim. On the third night she told the Sleeper about her daughter, and cried for the first time in twenty years.|Ширин пришла послушать Наргизу и встала позади, как паломница. На третью ночь она рассказала Спящему о дочери — и впервые за двадцать лет заплакала.|Shirin Nargizani tinglagani keldi va ziyoratchidek orqaroqda turdi. Uchinchi kechasi Uxlovchiga qizi haqida gapirib berdi va yigirma yilda birinchi marta yig'ladi.`
  }[e]),
  tillabek: e => ({
    tithe: `The Divan lost the founders' song, but not its cellars. Tilla-bek still buys the best memories in Yodgor. The Singers are his best customers.|Диван лишился песни основателей, но не своих подвалов. Тилла-бек по-прежнему скупает лучшую память Ёдгора. Певцы — его лучшие покупатели.|Devon asoschilar qo'shig'idan ayrildi, yerto'lalaridan emas. Tillabek hamon Yodgordagi eng yaxshi xotiralarni sotib oladi. Eng yaxshi xaridorlari — Xonandalar.`,
    chain: F().tillabek === 'accepted'
      ? { v: 'accepted', text: `Tilla-bek kept his word: a house in the Ark, a seat in the Divan, the key to his cellar of a thousand childhoods. You hold the chain. He tells you when to pull.|Тилла-бек сдержал слово: дом в Арке, место в Диване, ключ от подвала с тысячей детств. Цепь держишь ты. Когда тянуть — говорит он.|Tillabek so'zida turdi: Arkda uy, Devonda o'rin, ming bolalik saqlanadigan yerto'lasining kaliti. Zanjir sening qo'lingda. Qachon tortishni u aytadi.` }
      : { v: 'refused', text: `You turned Tilla-bek down once, and then sang his song anyway. He never lets you forget either. The Humo's shadow is on him. He calls it destiny.|Однажды ты отказал Тилла-беку — а потом всё равно спел его песню. Он не даёт забыть ни того, ни другого. На нём тень Хумо. Он зовёт это судьбой.|Bir marta Tillabekka yo'q deding, keyin baribir uning qo'shig'ini kuylading. U senga ikkalasini ham unutishga qo'ymaydi. Ustida Humo soyasi. U buni taqdir deydi.` },
    awake: `The thousand childhoods in Tilla-bek's cellar went home in one night. At dawn they found him among the empty tumars. He remembered nothing that was his own.|Тысяча детств из подвала Тилла-бека за одну ночь ушла по домам. На рассвете его нашли среди пустых тумаров. Своего он не помнил ничего.|Tillabek yerto'lasidagi ming bolalik bir kechada uylariga qaytdi. Tongda uni bo'sh tumarlar orasidan topishdi. O'ziniki bo'lgan hech narsani eslamasdi.`,
    tale: `Tilla-bek tried to buy a tale. No one would sell him one. A tale can only be given, and nobody wanted to give him anything.|Тилла-бек пытался купить сказание. Никто не продал. Сказание можно только подарить, а дарить ему никто ничего не хотел.|Tillabek doston sotib olmoqchi bo'ldi. Hech kim sotmadi. Dostonni faqat hadya qilish mumkin, unga esa hech kim hech narsa hadya qilgisi kelmadi.`
  }[e]),
  oydin: e => {
    const sf = fate();
    if (!oydinKnown()) return null;
    if (e === 'tithe') {
      if (tookTumars()) return { v: 'fled', text: `Oydin fled into the desert with Those Who Remember. Every Night of Payment someone hums Alla under your window. It stops before you reach the door.|Ойдин ушла в пески с Теми, кто помнит. Каждую Ночь Уплаты под твоим окном кто-то напевает «Аллу». Песня смолкает, прежде чем ты дойдёшь до двери.|Oydin Eslaganlar bilan qumlarga ketdi. Har To'lov kechasi derazang tagida kimdir «Alla»ni xirgoyi qiladi. Eshikka yetguningcha qo'shiq tinadi.` };
      if (sf === 'oydin') return { v: 'voice', text: `The Singers sang Oydin empty first. They took everything but what you gave her: a small voice that still counts stars. Now it counts for both of them.|Ойдин выпели первой. Забрали всё, кроме того, что дал ей ты: маленький голос, который всё ещё считает звёзды. Теперь он считает за двоих.|Oydinni birinchi bo'lib kuylab bo'shatishdi. Hammasini olishdi, faqat sen bergan narsa qoldi: hali ham yulduz sanaydigan kichkina ovoz. Endi u ikkovi uchun sanaydi.` };
      return sf === 'remember'
        ? { v: 'sung', text: `The Singers sang Oydin empty first, gently and slowly. Now she smiles at everyone who passes the Well. You remember her. She doesn't remember you.|Ойдин выпели первой — бережно, не торопясь. Теперь она улыбается всем, кто проходит мимо Колодца. Ты её помнишь. Она тебя — нет.|Oydinni birinchi bo'lib, ohista, shoshilmay kuylab bo'shatishdi. Endi u Quduq yonidan o'tgan hammaga jilmayadi. Sen uni eslaysan. U seni — yo'q.` }
        : { v: 'sung', text: `The Singers sang Oydin empty first, gently and slowly. Now she smiles at everyone who passes the Well. At you, too.|Ойдин выпели первой — бережно, не торопясь. Теперь она улыбается всем, кто проходит мимо Колодца. Тебе тоже.|Oydinni birinchi bo'lib, ohista, shoshilmay kuylab bo'shatishdi. Endi u Quduq yonidan o'tgan hammaga jilmayadi. Senga ham.` };
    }
    if (e === 'chain') return sf === 'oydin'
      ? { v: 'fire', text: `Oydin went into the desert with Those Who Remember. At night, by the fire, she talks to someone no one else can see. She laughs more than she used to.|Ойдин ушла в пески с Теми, кто помнит. Ночами у костра она говорит с кем-то, кого никто не видит. И смеётся теперь чаще.|Oydin Eslaganlar bilan qumlarga ketdi. Kechalari gulxan yonida hech kim ko'rmaydigan kimdir bilan gaplashadi. Endi ko'proq kuladi.` }
      : { v: 'army', text: `Oydin went into the desert with Those Who Remember. They say she is raising an army of the Hollow, and that it is patient.|Ойдин ушла в пески с Теми, кто помнит. Говорят, она собирает войско из Пустых. И это войско умеет ждать.|Oydin Eslaganlar bilan qumlarga ketdi. Aytishlaricha, u Bo'shlardan qo'shin to'playapti. Bu qo'shin kutishni biladi.` };
    if (e === 'awake') {
      if (sf === 'oydin') return { v: 'girl', text: `Oydin got everything she wanted, and one thing she never asked for: a girl of eight who can count past eleven now. They live by the new river.|Ойдин получила всё, чего хотела, и то, чего не просила: восьмилетнюю девочку, которая теперь считает дальше одиннадцати. Они живут у новой реки.|Oydin istagan hamma narsasini oldi, so'ramaganini ham: endi o'n birdan nariga sanaydigan sakkiz yoshli qizchani. Ular yangi daryo bo'yida yashaydi.` };
      if (sf === 'remember') return { v: 'hand', text: `Oydin stood waist-deep in the water, laughing. You remembered her before the city did, and you held her hand while it went under.|Ойдин стояла по пояс в воде и смеялась. Ты вспомнил её раньше, чем город, и держал её за руку, пока он уходил под воду.|Oydin belgacha suvda turib kulardi. Sen uni shahardan oldin eslading va shahar suvga botayotganda uning qo'lini qo'yib yubormading.` };
      return { v: 'got', text: `Oydin got everything she wanted: her brother remembered her, and so did the city. Other people's lives paid for it, and she doesn't pretend otherwise.|Ойдин получила всё, чего хотела: её вспомнил брат, её вспомнил город. Заплачено за это чужими жизнями, и она не делает вид, что это не так.|Oydin istaganiga erishdi: uni akasi ham, shahar ham esladi. Buning haqini begona hayotlar to'ladi, u buni yashirmaydi.` };
    }
    return { v: 'apricots', text: `Oydin came back to the Tail. In the mornings she brings you apricots, stolen, just like when you were kids, and eats them for both of you.|Ойдин вернулась в Хвост. По утрам она приносит тебе урюк — краденый, как в детстве, — и съедает его за вас обоих.|Oydin Dumga qaytdi. Ertalablari senga o'rik olib keladi — bolalikdagidek o'g'irlangan — va ikkalangiz uchun o'zi yeydi.` };
  },
  sado: e => {
    const sf = fate();
    if (sf === 'remember') return { v: 'sister', text: `Sado is gone. In her place there's a sister: whole, eight years old, with a chipped tooth and an opinion about everything. Remembering her is heavier than hearing a voice. And better.|Садо больше нет. На её месте — сестра: целая, восьмилетняя, со щербинкой и своим мнением обо всём. Помнить её тяжелее, чем слышать голос. И лучше.|Sado yo'q. Uning o'rnida singil bor: butun, sakkiz yoshli, kemtik tishli, har narsa haqida o'z fikri bor. Uni eslash ovozni eshitishdan og'irroq. Va yaxshiroq.` };
    if (sf === 'keep') return {
      tithe: { v: 'keep', text: `Sado stayed. She talks less every year, the way a growing girl goes quiet, and she never asks you to take her to the Tail.|Садо осталась. С каждым годом она говорит всё меньше — так притихает взрослеющая девочка — и никогда не просит сводить её в Хвост.|Sado qoldi. Ulg'ayayotgan qizdek yildan-yilga kamgap bo'lib boryapti va uni Dumga olib borishingni hech qachon so'ramaydi.` },
      chain: { v: 'keep', text: `Sado stayed. She won't talk about the chain. On clear nights she makes you climb onto the roof and count stars, past eleven.|Садо осталась. О цепи она говорить не хочет. В ясные ночи она гонит тебя на крышу считать звёзды — дальше одиннадцати.|Sado qoldi. Zanjir haqida gapirgisi kelmaydi. Ochiq kechalarda seni tomga chiqarib, yulduz sanatadi — o'n birdan nariga ham.` },
      awake: { v: 'keep', text: `Sado stayed, even when everything else went home. "I am home," she says when you ask.|Садо осталась, даже когда всё остальное ушло по домам. «Я и так дома», — отвечает она, когда ты спрашиваешь.|Hamma narsa uyiga qaytganda ham Sado qoldi. So'rasang, «Men uydaman-ku», deydi.` },
      tale: { v: 'keep', text: `Sado stayed. She listens to the tales with you, and corrects the tellers.|Садо осталась. Она слушает сказания вместе с тобой и поправляет рассказчиков.|Sado qoldi. Dostonlarni sen bilan birga tinglaydi va aytuvchilarni tuzatib turadi.` }
    }[e];
    if (sf === 'oydin') return { v: 'oydin', text: `Sado went to Oydin. Sometimes, when Oydin laughs, you can hear a younger laugh underneath.|Садо ушла к Ойдин. Иногда, когда Ойдин смеётся, под её смехом слышен другой — младше.|Sado Oydinga o'tdi. Ba'zan Oydin kulganda, kulgisi tagidan yoshroq bir kulgi eshitiladi.` };
    if (sf === 'tale') return e === 'tale'
      ? { v: 'tale', text: `Sado became a tale. Kids in the Tail tell it to each other: the girl who was afraid of the dark and too big for a tumar. They always make her braver than she was. She'd like that.|Садо стала сказанием. Дети в Хвосте рассказывают его друг другу: про девочку, которая боялась темноты и не влезла в тумар. Её всегда делают храбрее, чем она была. Ей бы понравилось.|Sado dostonga aylandi. Dumdagi bolalar uni bir-biriga aytib berishadi: qorong'idan qo'rqqan va tumarga sig'magan qizcha haqida. Uni doim bo'lganidan jasurroq qilishadi. Unga yoqardi.` }
      : { v: 'unsung', text: `Sado was meant to become a tale. No one sang it. She stays with you, a story waiting for a teller, and grows quieter every year.|Садо должна была стать сказанием. Его никто не спел. Она осталась с тобой — история, которая ждёт рассказчика, — и с каждым годом звучит всё тише.|Sado dostonga aylanishi kerak edi. Uni hech kim kuylamadi. U sen bilan qoldi — aytuvchisini kutayotgan hikoya bo'lib — va yildan-yilga jimroq bo'lib boryapti.` };
    return null;
  },
  nargiza: e => {
    const q = F().nargizaQ;
    if (!q && !F().nargiza) return null;
    if (e === 'tale') return `Nargiza stayed in the dream as Obi-Hayot's voice. Every night she sings him a new tale, and the city takes turns bringing her stories.|Наргиза осталась во сне голосом Оби-Хаёта. Каждую ночь она поёт ему новое сказание, а город по очереди приносит ей истории.|Nargiza tushda Obi Hayotning ovozi bo'lib qoldi. Har kecha unga yangi doston kuylaydi, shahar esa navbat bilan unga hikoya olib keladi.`;
    const T = {
      tithe: {
        believes: { v: 'believes', text: `Nargiza was declared sick, and the Order sang the gift out of her. Sometimes she stops in the middle of the street and listens to the silence.|Наргизу признали больной, и орден выпел из неё дар. Иногда она замирает посреди улицы и слушает тишину.|Nargizani kasal deb topishdi va orden undan iqtidorini kuylab oldi. Ba'zan u ko'cha o'rtasida to'xtab, sukunatga quloq tutadi.` },
        returned: { v: 'returned', text: `Nargiza became Shirin's best pupil. She no longer hears the Sleeper. She hears only the Ustoz.|Наргиза стала лучшей ученицей Ширин. Спящего она больше не слышит. Только Устоз.|Nargiza Shirinning eng yaxshi shogirdi bo'ldi. Uxlovchini endi eshitmaydi. Faqat Ustozni eshitadi.` },
        silenced: { v: 'silenced', text: `Nargiza never found out what he was asking of her. She's at peace. It looks a lot like sleep.|Наргиза так и не узнала, о чём он её просил. Ей спокойно. Это очень похоже на сон.|Nargiza u nima so'raganini hech qachon bilmadi. Ko'ngli tinch. Bu uyquga juda o'xshaydi.` },
        none: { v: 'none', text: `Nargiza left the Cloister on the night of the Great Tithe. No one has seen her since.|Наргиза ушла из Обители в ночь Великой десятины. Больше её никто не видел.|Nargiza Buyuk ushr kechasi xonaqohdan ketdi. Shundan beri uni hech kim ko'rmadi.` }
      },
      chain: {
        believes: { v: 'believes', text: `Nargiza still hears him, in chains now. She stopped singing. She says it would be like singing to a man in a cage.|Наргиза всё ещё его слышит — теперь в цепях. Петь она перестала. Говорит, это как петь человеку в клетке.|Nargiza uni hamon eshitadi — endi kishanda. Kuylashni tashladi. Bu qafasdagi odamga qo'shiq aytishdek, deydi.` },
        returned: { v: 'returned', text: `The Divan gave Nargiza a place in the new Order. She sings the founders' song at dawn, beautifully.|Диван дал Наргизе место в новом ордене. На рассвете она поёт песню основателей. Прекрасно поёт.|Devon Nargizaga yangi ordendan o'rin berdi. U tongda asoschilar qo'shig'ini kuylaydi. Juda chiroyli kuylaydi.` },
        silenced: { v: 'silenced', text: `Nargiza sings for the Divan's guests. She has the most beautiful voice in Yodgor, and nothing behind it.|Наргиза поёт для гостей Дивана. У неё самый красивый голос в Ёдгоре — и ничего за ним.|Nargiza Devon mehmonlariga kuylab beradi. Ovozi Yodgordagi eng go'zal ovoz — ortida esa hech narsa yo'q.` },
        none: { v: 'none', text: `Nargiza left Yodgor with a caravan the week the chain was sung. She didn't say goodbye.|Наргиза ушла из Ёдгора с караваном в ту же неделю, когда спели цепь. Не попрощалась.|Nargiza zanjir kuylangan haftada karvonga qo'shilib Yodgordan ketdi. Xayrlashmadi ham.` }
      },
      awake: {
        believes: { v: 'believes', text: `Nargiza followed the water out of the city. They say she sings to him in the new riverbed, and he answers.|Наргиза ушла вслед за водой. Говорят, она поёт ему в новом русле, и он отвечает.|Nargiza suvning ortidan shahardan chiqib ketdi. Aytishlaricha, u yangi o'zanda unga kuylaydi, u esa javob qaytaradi.` },
        returned: { v: 'returned', text: `Nargiza drowned with the Cloister, holding Shirin's hand.|Наргиза утонула вместе с Обителью, держа Ширин за руку.|Nargiza Shirinning qo'lini qo'yib yubormay, xonaqoh bilan birga cho'kdi.` },
        silenced: { v: 'silenced', text: `Nargiza survived. She never found out what he was shouting as he woke.|Наргиза выжила. Она так и не узнала, что он кричал, просыпаясь.|Nargiza omon qoldi. U uyg'onayotib nima deb baqirganini hech qachon bilmadi.` },
        none: { v: 'none', text: `Nargiza was never found. In the Tail, the new river has a girl's name.|Наргизу так и не нашли. В Хвосте новую реку зовут девичьим именем.|Nargizani topisholmadi. Dumda yangi daryoni bir qizning ismi bilan atashadi.` }
      }
    };
    return T[e][q] || T[e].none;
  },
  alp: e => {
    const f = F();
    if (!f.alpTumars && !f.alp) return null;
    if (f.alpTumars === 'returned' && f.faction === 'divan' && e !== 'awake') return e === 'chain'
      ? { v: 'chained', text: `Alp is still chained at the Heart, beside the spirit: a captain guarding the last thing Tilla-bek owns. He knows exactly who he was. That is the chain.|Алп так и сидит на цепи у Сердца, рядом с духом, — капитан, стерегущий последнее, чем владеет Тилла-бек. Он точно знает, кем был. Это и есть его цепь.|Alp Yurak yonida, ruh bilan birga zanjirda qoldi: Tillabekning so'nggi mulkini qo'riqlayotgan kapitan. U kim bo'lganini aniq biladi. Uning zanjiri shu.` }
      : { v: 'unchained', text: `Once the Divan lost the song, they unchained Alp from the Heart. He walked back to the Tail and asked the orphans to call him by his old name. They refused.|Когда Диван лишился песни, Алпа сняли с цепи у Сердца. Он вернулся в Хвост и попросил сирот звать его прежним именем. Они отказались.|Devon qo'shiqdan ayrilgach, Alpni Yurak yonidagi zanjirdan yechishdi. U Dumga qaytib, yetimlardan uni eski ismi bilan chaqirishni so'radi. Ular ko'nmadi.` };
    if (e === 'awake') return { v: 'carry', text: `When the Sleeper woke, Alp remembered his name, and every person he had sold for the Divan. He carried the orphans out of the sand anyway, two at a time.|Когда Спящий проснулся, Алп вспомнил своё имя — и каждого, кого продал для Дивана. И всё равно выносил сирот из песка, по двое.|Uxlovchi uyg'onganda Alp o'z ismini va Devon uchun sotgan har bir odamni esladi. Baribir yetimlarni qumdan ikkitadan ko'tarib chiqdi.` };
    return {
      returned: { v: 'returned', text: `Alp knows who he was: Tilla-bek's captain, a seller of people. He still guards the orphans of the Tail. Now he knows what from.|Алп знает, кем был: капитаном Тилла-бека, торговцем людьми. Он по-прежнему стережёт сирот Хвоста. Теперь он знает — от кого.|Alp kim bo'lganini biladi: Tillabekning kapitani, odam sotuvchi. Hamon Dum yetimlarini qo'riqlaydi. Endi kimdan qo'riqlashini biladi.` },
      destroyed: { v: 'destroyed', text: `Alp never found out who he had been. The orphans call him Uncle. It's the only name he answers to.|Алп так и не узнал, кем был. Сироты зовут его дядей. Только на это имя он и откликается.|Alp kim bo'lganini hech qachon bilmadi. Yetimlar uni amaki deyishadi. U faqat shu nomga javob beradi.` },
      choice: { v: 'choice', text: `Alp held his own past in his hands and chose to put it down. At night he stands at the Tail's gate. Nobody asks him why.|Алп подержал своё прошлое в руках — и отложил его. По ночам он стоит у ворот Хвоста. Никто не спрашивает почему.|Alp o'tmishini qo'lida ushlab ko'rdi — va uni bir chetga qo'ydi. Kechalari Dum darvozasi oldida turadi. Hech kim nega, deb so'ramaydi.` }
    }[f.alpTumars] || { v: 'guard', text: `Alp still guards the orphans of the Tail, with no name and no past.|Алп по-прежнему стережёт сирот Хвоста — без имени и без прошлого.|Alp hamon Dum yetimlarini qo'riqlaydi — ismsiz, o'tmishsiz.` };
  },
  farrukh: e => [{
    tithe: `Farrukh did very well out of the New Tithe. He drinks to you in the Ark and means it. That's the worst thing about him.|Фаррух отлично нажился на Новой десятине. Он пьёт за тебя в Арке и говорит это от души. Хуже в нём ничего нет.|Farrux Yangi ushrdan yaxshigina foyda ko'rdi. Arkda sen uchun qadah ko'taradi va buni chin dildan qiladi. Undagi eng yomon narsa shu.`,
    chain: `Farrukh's father bought him back into the House of Saffron. He sells memory along the whole Silk Road now, and sends you the best ones. You don't open them.|Отец выкупил Фарруха обратно в Дом Шафрана. Теперь он торгует памятью по всему Шёлковому пути и шлёт тебе лучшее. Ты не открываешь.|Otasi Farruxni Za'faron xonadoniga qaytarib oldi. Endi u butun Ipak yo'li bo'ylab xotira sotadi va eng yaxshilarini senga yuboradi. Sen ochib ham ko'rmaysan.`,
    awake: `Farrukh remembered every happy day he had ever stolen, all at once. He sat in the sand and laughed until he cried, and then he went to find the owners.|Фаррух разом вспомнил все счастливые дни, которые когда-либо украл. Сел в песок и смеялся до слёз. А потом пошёл искать хозяев.|Farrux o'g'irlagan barcha baxtli kunlarini birdaniga esladi. Qumga o'tirib, ko'zidan yosh chiqquncha kuldi. Keyin ularning egalarini qidirib ketdi.`,
    tale: F().truth
      ? `Farrukh opened a chaikhana in the Tail. Nothing stolen is served there. He tells everyone he once sold you the truth, at a loss.|Фаррух открыл чайхану в Хвосте. Краденого там не подают. Всем рассказывает, как однажды продал тебе правду — себе в убыток.|Farrux Dumda choyxona ochdi. U yerda o'g'irlangan narsa tortilmaydi. Hammaga bir paytlar senga haqiqatni zarariga sotganini aytib yuradi.`
      : `Farrukh opened a chaikhana in the Tail. Nothing stolen is served there.|Фаррух открыл чайхану в Хвосте. Краденого там не подают.|Farrux Dumda choyxona ochdi. U yerda o'g'irlangan narsa tortilmaydi.`
  }[e], {
    kept: { v: 'kept', text: `You still have his saffron fields in a tumar. He has never asked for them back.|Его шафрановые поля до сих пор лежат у тебя в тумаре. Он ни разу не попросил их назад.|Uning za'faron dalalari hamon senda, tumarda. U ularni bir marta ham qaytarib so'ramadi.` },
    home: { v: 'home', text: `He went home once, to the saffron fields. He was back the same week. "They were smaller," he says.|Однажды он съездил домой, к шафрановым полям. Вернулся в ту же неделю. «Они были меньше», — говорит он.|Bir marta uyiga, za'faron dalalariga borib keldi. O'sha haftaning o'zida qaytdi. «Kichkinaroq ekan», deydi.` },
    sold: { v: 'sold', text: `In the end he sold the saffron fields. He won't say who to.|В конце концов он продал шафрановые поля. Кому — не говорит.|Oxiri za'faron dalalarini sotib yubordi. Kimga — aytmaydi.` },
    drunk: { v: 'drunk', text: `He tasted his saffron fields so often that nothing is left of them but the colour.|Он так часто пробовал свои шафрановые поля, что от них остался только цвет.|U za'faron dalalarini shunchalik ko'p totib ko'rdiki, ulardan faqat rangi qoldi.` }
  }[F().farrukh] || null],
  turab: e => {
    const v = F().voice;
    if (!v) return null;
    if (v === 'left') return {
      awake: { v: 'voiceHome', text: `Turab's voice came home to him when the Sleeper woke. The first thing he said with it was a name: Obi-Hayot.|Голос вернулся к Турабу, когда проснулся Спящий. Первым, что он им сказал, было имя: Оби-Хаёт.|Uxlovchi uyg'onganda Turobga ovozi qaytdi. U bilan aytgan birinchi so'zi ism bo'ldi: Obi Hayot.` },
      tale: { v: 'hands', text: `No one ever bought Turab's voice back. He teaches the Tail's children with his hands, and they sing for him.|Голос Тураба так никто и не выкупил. Он учит детей Хвоста руками, а они поют за него.|Turobning ovozini hech kim qaytarib sotib olmadi. U Dum bolalarini qo'llari bilan o'rgatadi, ular esa uning o'rniga kuylaydi.` }
    }[e] || { v: 'voiceSold', text: `Turab's voice sings at feasts in a rich house in the Ark. Turab sits outside the gate and listens.|Голос Тураба поёт на пирах в богатом доме в Арке. Тураб сидит за воротами и слушает.|Turobning ovozi Arkdagi bir boy xonadonda ziyofatlarda kuylaydi. Turob darvoza tashqarisida o'tirib tinglaydi.` };
    return {
      tithe: `Turab refused to sing the Great Tithe, and was sung empty for it, again. This time they took everything but the tales. He had already given those away.|Тураб отказался петь Великую десятину, и его за это выпели снова. На этот раз забрали всё, кроме сказаний: их он успел раздать.|Turob Buyuk ushrni kuylashdan bosh tortdi va buning uchun uni yana kuylab bo'shatishdi. Bu safar dostonlardan boshqa hammasini olishdi: ularni u ulashib ulgurgan edi.`,
      chain: `Turab left Yodgor with the first caravan. In every city on the road he tells the tale of the chained spirit, so that someone, somewhere, remembers.|Тураб ушёл из Ёдгора с первым караваном. В каждом городе на пути он рассказывает сказание о духе на цепи — чтобы хоть кто-то где-то помнил.|Turob birinchi karvon bilan Yodgordan ketdi. Yo'ldagi har bir shaharda zanjirdagi ruh haqida doston aytadi — kimdir, qayerdadir eslab qolsin deb.`,
      awake: `Turab sang on the bank of the new river while the city went under. Some say the water slowed down to listen.|Тураб пел на берегу новой реки, пока город уходил под воду. Говорят, вода замедлилась, чтобы послушать.|Shahar suvga botayotganda Turob yangi daryo qirg'og'ida kuyladi. Aytishlaricha, suv tinglash uchun oqimini sekinlatgan.`,
      tale: `Turab teaches the Tail's children to sing. Not to take. To tell.|Тураб учит детей Хвоста петь. Не забирать — рассказывать.|Turob Dum bolalarini kuylashga o'rgatadi. Olishga emas — aytib berishga.`
    }[e];
  },
  mehri: e => {
    const f = F(), w = f.widow;
    if (!w) return null;
    if (w === 'force') {
      if (e === 'tithe') return { v: 'forgot', text: `Mehri doesn't remember she ever had a son. The Great Tithe took the rest. It's easier for her. It isn't easier for you.|Мехри не помнит, что у неё был сын. Остальное забрала Великая десятина. Ей так легче. Тебе — нет.|Mehri o'g'li bo'lganini eslamaydi. Qolganini Buyuk ushr oldi. Unga shunisi osonroq. Senga emas.` };
      if (f.nest === 'tail') return e === 'awake'
        ? { v: 'carried', text: `Mehri had her son back before the city fell: you sent him home from Albasty's nest. When the water rose she carried his memory out above her head, like a child.|Сын вернулся к Мехри ещё до гибели города: ты отправил его домой из гнезда Албасты. Когда поднялась вода, она вынесла его память над головой, как ребёнка.|O'g'li Mehriga shahar halok bo'lishidan oldin qaytgan edi: sen uni Albasti uyasidan jo'natgansan. Suv ko'tarilganda Mehri uning xotirasini boladek boshi uzra ko'tarib chiqdi.` }
        : { v: 'sings', text: `You sent Mehri's son home from Albasty's nest. She remembers him again, and now she sings out of tune on purpose, because he used to laugh at it.|Ты отправил сына Мехри домой из гнезда Албасты. Она снова его помнит — и теперь нарочно поёт мимо нот: он над этим смеялся.|Mehrining o'g'lini Albasti uyasidan uyiga jo'natding. U o'g'lini yana eslaydi va endi ataylab noto'g'ri kuylaydi: o'g'li bunga kulardi.` };
      if (f.mehriSon === 'carried') return { v: 'tumar', text: `You brought Mehri's son out of the dream in a tumar. She held it for a week before she opened it. Then she wept, and thanked you, and never forgave you.|Ты вынес сына Мехри из сна в тумаре. Она неделю держала его в руках, прежде чем открыть. Потом плакала, благодарила — и так и не простила.|Mehrining o'g'lini tushdan tumarda olib chiqding. U ochishdan oldin bir hafta qo'lida ushlab yurdi. Keyin yig'ladi, rahmat aytdi — va hech qachon kechirmadi.` };
      if (e === 'awake') return { v: 'angry', text: `When the memories went home, Mehri's son came back to her, and so did the face of the man who took him. She came looking for you.|Когда память вернулась домой, к Мехри вернулся сын — и лицо того, кто его забрал. Она пришла тебя искать.|Xotiralar uyiga qaytganda Mehriga o'g'li qaytdi — uni olib ketgan odamning yuzi ham. U seni qidirib keldi.` };
      return { v: 'forgot', text: `Mehri doesn't remember she ever had a son. She sings out of tune while she works, and doesn't know who for.|Мехри не помнит, что у неё был сын. За работой она поёт мимо нот и не знает, для кого.|Mehri o'g'li bo'lganini eslamaydi. Ish qilayotib noto'g'ri kuylaydi va kim uchunligini bilmaydi.` };
    }
    if (w === 'fake') return e === 'tithe'
      ? { v: 'sung', text: `Mehri's fake tumar was found out on the night of the Great Tithe. She was sung empty with everyone else.|Подделку Мехри нашли в ночь Великой десятины. Её выпели вместе со всеми.|Mehrining soxta tumarini Buyuk ushr kechasi topib olishdi. Uni ham hamma qatori kuylab bo'shatishdi.` }
      : { v: 'kept', text: `Mehri kept her son. Her fake tumar still lies in the Singers' vault, tasted by people who think it's real.|Мехри сохранила сына. Её фальшивый тумар до сих пор лежит в хранилище Певцов, и его пробуют те, кто думает, что он настоящий.|Mehri o'g'lini saqlab qoldi. Soxta tumari hamon Xonandalar xazinasida yotibdi, uni haqiqiy deb o'ylaganlar totib ko'rishadi.` };
    if (w === 'paid') return e === 'tithe'
      ? { v: 'cellar', text: `During the Great Tithe, Mehri hid two Tail children in her own cellar. There was no room for more.|В Великую десятину Мехри спрятала у себя в подвале двоих детей из Хвоста. Больше не поместилось.|Buyuk ushr kechasi Mehri Dumdagi ikki bolani o'z yerto'lasiga yashirdi. Ko'prog'iga joy yo'q edi.` }
      : { v: 'bread', text: `Mehri kept her son, and brings you bread on the Night of Payment. She has never asked what you paid for her with.|Мехри сохранила сына и в Ночь Уплаты приносит тебе хлеб. Она ни разу не спросила, чем ты за неё заплатил.|Mehri o'g'lini saqlab qoldi, To'lov kechasi senga non olib keladi. «Men uchun nima bilan to'lading?» deb bir marta ham so'ramagan.` };
    return e === 'tithe'
      ? { v: 'sung', text: `Mehri was written down as paid. The Great Tithe didn't look at the books.|Мехри записали уплатившей. Но Великая десятина в книги не смотрела.|Mehri to'lagan deb yozilgandi. Lekin Buyuk ushr daftarga qaramadi.` }
      : { v: 'books', text: `Mehri was written down as paid. No one ever checked. Some debts stay closed simply because no one looks.|Мехри записали уплатившей. Никто так и не проверил. Некоторые долги остаются закрытыми просто потому, что никто не смотрит.|Mehri to'lagan deb yozilgandi. Hech kim tekshirmadi. Ba'zi qarzlar shunchaki hech kim qaramagani uchun yopiq qoladi.` };
  },
  davron: e => ({
    led: e === 'awake'
      ? { v: 'water', text: `Davron's three children met the survivors beyond the sand and shared their water with them.|Трое детей Даврона встретили выживших за песками и поделились с ними водой.|Davronning uch bolasi qumlar ortida omon qolganlarni kutib oldi va ular bilan suvini bo'lishdi.` }
      : { v: 'led', text: `Davron's three children grew up on the Salt Road. They know your name. They'll never sell it.|Трое детей Даврона выросли на Соляной дороге. Они знают твоё имя. И никогда его не продадут.|Davronning uch bolasi Tuz yo'lida voyaga yetdi. Ular ismingni bilishadi. Uni hech qachon sotishmaydi.` },
    reported: { v: 'reported', text: `The Singers sang empty the three children you reported. Davron still drives his caravan. He doesn't stop at Yodgor any more.|Троих детей, на которых ты донёс, выпели Певцы. Даврон по-прежнему водит караван. В Ёдгоре он больше не останавливается.|Sen chaqqan uch bolani Xonandalar kuylab bo'shatishdi. Davron hamon karvon boshlaydi. Yodgorda endi to'xtamaydi.` },
    bribe: { v: 'bribe', text: `Davron got the children out. He tells them how much he paid for them, and who to.|Даврон вывез детей. Он рассказывает им, сколько за них заплатил. И кому.|Davron bolalarni olib chiqdi. Ularga ular uchun qancha to'laganini aytib beradi. Kimga to'laganini ham.` },
    bluff: { v: 'bluff', text: `Davron's children call you Uncle Yodchi behind your back, and think you don't know.|Дети Даврона за глаза зовут тебя дядей Ёдчи и думают, что ты не знаешь.|Davronning bolalari orqangdan seni «Yodchi amaki» deyishadi va sen bilmaysan deb o'ylashadi.` }
  }[F().davron] || null),
  bahodir: e => {
    const h = F().hound;
    if (!h) return null;
    if (e === 'awake' && h !== 'killed') return { v: 'gone', text: `When the memories went home, Bahodir's planted loyalty fell out of him like a stone from a boot. He went looking for the man he used to be.|Когда память вернулась домой, посаженная верность выпала из Баходира, как камешек из сапога. Он пошёл искать того, кем был раньше.|Xotiralar uyiga qaytganda, ekilgan sadoqat Bahodirdan etikka kirgan toshdek tushib qoldi. U oldin kim bo'lganini qidirib ketdi.` };
    return {
      shown: { v: 'shown', text: `Bahodir knows his loyalty was planted. He still serves Tilla-bek, but now he chooses to every morning. Some mornings he doesn't.|Баходир знает, что его верность посажена. Он всё ещё служит Тилла-беку, но теперь выбирает это каждое утро. Иногда — не выбирает.|Bahodir sadoqati ekib qo'yilganini biladi. Hamon Tillabekka xizmat qiladi, lekin endi buni har tong o'zi tanlaydi. Ba'zi tonglar tanlamaydi.` },
      killed: { v: 'killed', text: `Bahodir lies in the Ark under a golden stone. His loyalty was planted. His grave was bought.|Баходир лежит в Арке под золотым камнем. Верность ему посадили, могилу купили.|Bahodir Arkda oltin tosh ostida yotibdi. Sadoqatini ekishgan, qabrini sotib olishgan.` },
      spared: { v: 'spared', text: `Bahodir left the Ark and his armour behind. He clears the karez with the Tail's diggers, and is very bad at taking orders.|Баходир оставил Арк и доспехи. Он чистит кяризы с землекопами Хвоста и очень плохо слушается приказов.|Bahodir Ark va sovutini tashlab ketdi. Dum qazuvchilari bilan korizlarni tozalaydi va buyruqqa juda yomon bo'ysunadi.` }
    }[h];
  },
  ravshan: e => ({
    tithe: `You collect the tithe again. The book is lighter now. Every night on the way home you count the doors, and the number never changes.|Ты снова собираешь десятину. Книга стала легче. Каждую ночь по дороге домой ты считаешь двери, и число не меняется.|Yana ushr yig'asan. Daftar yengillashdi. Har kecha uyga qaytayotib eshiklarni sanaysan, son o'zgarmaydi.`,
    chain: `You hold the chain. Some nights you can feel him dreaming through it. He dreams that someone is telling him a story. You don't know a single one.|Ты держишь цепь. Иногда по ночам ты чувствуешь сквозь неё, как он видит сон. Ему снится, что ему рассказывают историю. А ты не знаешь ни одной.|Zanjir sening qo'lingda. Ba'zi kechalar u orqali uning tush ko'rayotganini sezasan. Tushida unga kimdir hikoya aytib beradi. Sen esa birorta ham hikoya bilmaysan.`,
    awake: `You climbed out with sand in your mouth and your whole life in your head. Every year, on the night the city fell, you sit on the bank and count the lights in the water.|Ты выбрался с песком во рту и всей своей жизнью в голове. Каждый год, в ночь гибели города, ты сидишь на берегу и считаешь огни в воде.|Og'zingda qum, boshingda butun umring bilan chiqib olding. Har yili shahar halok bo'lgan kechada qirg'oqda o'tirib, suvdagi chiroqlarni sanaysan.`,
    tale: `You never collected another tithe. On the Night of Payment you sit by the Well and tell him a story instead. Yours is the one the children ask for.|Десятину ты больше не собирал никогда. В Ночь Уплаты ты сидишь у Колодца и рассказываешь ему историю. Дети просят именно твою.|Boshqa hech qachon ushr yig'mading. To'lov kechasi Quduq yonida o'tirib, unga hikoya aytib berasan. Bolalar aynan senikini so'rashadi.`
  }[e])
};
const ORDER = ['city', 'tail', 'shirin', 'tillabek', 'oydin', 'nargiza', 'alp', 'farrukh', 'turab', 'mehri', 'davron', 'bahodir', 'sado', 'ravshan'];
// each slide: { k: subject, v: variant (the picture), e: ending, text: three-language string }; a plain string means v = e
const epilogueFor = e => [].concat(...ORDER.map(k => { try { return [].concat(EP[k](e)).filter(x => x && (typeof x === 'string' || x.text)).map(x => (typeof x === 'string' ? { k, v: e, e, text: x } : Object.assign({ k, e }, x))); } catch (x) { console.error('[yodgor] epilogue', k, x); return null; } })).filter(Boolean);

// a few words from Sado (or her absence) inside each ending scene
const sadoEnd = e => {
  const sf = fate();
  if (sf === 'keep') return ['sado', {
    tithe: `The water's sweet. I wish it wasn't.|Вода сладкая. Лучше бы горчила.|Suv shirin. Koshki achchiq bo'lsa.`,
    chain: `He's so quiet now. I don't like it when big things go quiet.|Он теперь такой тихий. Не люблю, когда большое молчит.|U endi juda jim. Katta narsalar jim qolsa, yoqtirmayman.`,
    awake: `Everyone's remembering. It's so loud, Toychoq. It's so loud.|Все вспоминают. Как громко, Тойчок. Как громко.|Hamma eslayapti. Shunaqa shovqin, Toychoq. Shunaqa shovqin.`
  }[e]];
  if (sf === 'tale' && e !== 'tale') return ['sado', `You didn't tell him about me. ...It's all right. I'll wait. Stories know how to wait.|Ты не рассказал ему обо мне. ...Ничего. Я подожду. Истории умеют ждать.|Unga men haqimda aytmading. ...Mayli. Kutaman. Hikoyalar kutishni biladi.`];
  if (sf === 'remember') return ['', {
    tithe: `You remember your sister's face. You'll remember it every morning, walking past the Tail.|Ты помнишь лицо сестры. И будешь помнить его каждое утро, проходя мимо Хвоста.|Singlingning yuzini eslaysan. Har tong Dum yonidan o'tayotganingda ham eslaysan.`,
    chain: `You remember a girl who wouldn't let go of a doorpost. You sing anyway.|Ты помнишь девочку, которая не отпускала дверной косяк. И всё равно поёшь.|Eshik kesakisini qo'yib yubormagan qizchani eslaysan. Baribir kuylaysan.`,
    awake: `Oydin stands waist-deep in the water, laughing. You hold her hand. For once, you remembered her first.|Ойдин стоит по пояс в воде и смеётся. Ты держишь её за руку. Хоть раз ты вспомнил её первым.|Oydin belgacha suvda turib kuladi. Sen uning qo'lidan tutib turibsan. Bir marta bo'lsa ham, uni birinchi bo'lib sen eslading.`,
    tale: null
  }[e]];
  if (sf === 'oydin') return ['', {
    tithe: `Somewhere a woman hums Alla in two voices. One of them is very young.|Где-то женщина напевает «Аллу» в два голоса. Один совсем детский.|Allaqayerda bir ayol «Alla»ni ikki ovozda xirgoyi qiladi. Biri juda yosh.`,
    chain: `Oydin turns away. As she goes, she hums Alla in two voices. One of them is very young.|Ойдин отворачивается. Уходя, она напевает «Аллу» в два голоса. Один совсем детский.|Oydin o'girilib ketadi. Ketarkan, «Alla»ni ikki ovozda xirgoyi qiladi. Biri juda yosh.`,
    awake: `Oydin laughs in the rising water, and under her laugh there's a younger one, counting past eleven.|Ойдин смеётся в прибывающей воде, а под её смехом — другой, младше: он считает дальше одиннадцати.|Oydin ko'tarilayotgan suvda kuladi, kulgisi ostida yana bir — yoshroq kulgi bor: u o'n birdan nariga sanaydi.`
  }[e]];
  return null;
};
const fix = l => (l && l[1] ? l : null);

ENDING('tithe', {
  title: `THE NEW TITHE|НОВАЯ ДЕСЯТИНА|YANGI USHR`,
  scene: () => [
    tookTumars()
      ? ['', `You hold out the tumars. A Singer takes them from your hand with a small bow, the way one accepts a tithe.|Ты протягиваешь тумары. Певец принимает их с лёгким поклоном — так принимают десятину.|Tumarlarni uzatasan. Xonanda ularni yengil ta'zim bilan oladi — ushr shunday qabul qilinadi.`]
      : oydinHere()
        ? ['', `You take the cord from Oydin's fist. She doesn't fight. She watches you hand it to the Singers, the way she watched the men with the book when she was eight.|Ты вынимаешь шнурок из кулака Ойдин. Она не сопротивляется. Только смотрит, как ты отдаёшь его Певцам, — так же, как в восемь лет смотрела на людей с книгой.|Oydinning mushtidan ipni olasan. U qarshilik qilmaydi. Faqat uni Xonandalarga berayotganingni kuzatadi — sakkiz yoshida daftarli odamlarga ham xuddi shunday qaragan.`]
        : ['', `You give the founders' tumars to the Singers. They take them with a small bow, the way one accepts a tithe.|Ты отдаёшь тумары основателей Певцам. Их принимают с лёгким поклоном — так принимают десятину.|Asoschilar tumarlarini Xonandalarga berasan. Ularni yengil ta'zim bilan olishadi — ushr shunday qabul qilinadi.`],
    ['', `Shirin sings. Her voice is as clear as a girl's. That night the Singers walk into the Tail, and the Great Tithe goes on until dawn.|Ширин поёт. Голос у неё чистый, как у девочки. В ту ночь Певцы входят в Хвост, и Великая десятина длится до рассвета.|Shirin kuylaydi. Ovozi qizchanikidek tiniq. O'sha kecha Xonandalar Dumga kirib kelishadi va Buyuk ushr tonggacha davom etadi.`],
    ['', `In the morning nobody in the Tail remembers their own name. The Sleeper sighs and settles. The water is sweet again.|Утром в Хвосте никто не помнит собственного имени. Спящий вздыхает и затихает. Вода снова сладкая.|Ertalab Dumda hech kim o'z ismini eslamaydi. Uxlovchi xo'rsinadi-da, tinchiydi. Suv yana shirin.`],
    fix(sadoEnd('tithe'))
  ],
  epilogue: () => epilogueFor('tithe')
});

ENDING('chain', {
  title: `THE DIVAN'S CHAIN|ЦЕПЬ ДИВАНА|DEVON ZANJIRI`,
  scene: () => [
    (F().sandSong || F().chainSong)
      ? ['', `You don't need the tumars. You learned the song by heart long before tonight. You open your mouth, and it's already there.|Тумары тебе не нужны. Песню ты выучил задолго до этой ночи. Открываешь рот — а она уже там.|Senga tumarlar kerak emas. Qo'shiqni bu kechadan ancha oldin yod olgansan. Og'zingni ochasan — u allaqachon o'sha yerda.`]
      : ['', `You hold the seven tumars, and the song rises out of them into your throat, simple as a knot.|Ты держишь семь тумаров, и песня поднимается из них тебе в горло — простая, как узел.|Yettala tumarni ushlab turasan, qo'shiq ulardan tomog'ingga ko'tariladi — tugundek oddiy.`],
    fix(sadoEnd('chain')),
    ['', `The water around you goes still and heavy, like a chain pulled tight. The Sleeper doesn't wake. He obeys.|Вода вокруг замирает и тяжелеет, как натянутая цепь. Спящий не просыпается. Он подчиняется.|Atrofingdagi suv qotib, og'irlashadi — tortilgan zanjirdek. Uxlovchi uyg'onmaydi. U bo'ysunadi.`],
    [obiWho(), `...Yes. Yes. What shall I lift? Tell me where. I'll lift it.|...Да. Да. Что поднять? Скажи, куда. Я подниму.|...Xo'p. Xo'p. Nimani ko'taray? Qayerga — ayt. Ko'taraman.`],
    ['', `Far above, in the Ark, Akhror Tilla-bek lifts his face to the ceiling, as if a great bird had just flown over the roof.|Высоко наверху, в Арке, Ахрор Тилла-бек поднимает лицо к потолку, будто над крышей пролетела большая птица.|Juda tepada, Arkda, Axror Tillabek yuzini shiftga ko'taradi — go'yo tom ustidan katta qush uchib o'tgandek.`],
    oydinHere() ? ['oydin', `You made him a slave, Toychoq. The way they made me one.|Ты сделал его рабом, Тойчок. Как когда-то меня.|Uni qul qilding, Toychoq. Bir paytlar meni qilishganidek.`] : null
  ],
  epilogue: () => epilogueFor('chain')
});

ENDING('awake', {
  title: `THE AWAKENING|ПРОБУЖДЕНИЕ|UYG'ONISH`,
  scene: () => [
    (tookTumars() || !(oydinHere() || faction() === 'remember'))
      ? ['', `You smash the founders' tumars on a stone, one by one. Seven cracks, like knuckles.|Ты бьёшь тумары основателей о камень, один за другим. Семь щелчков, как хруст костяшек.|Asoschilar tumarlarini birma-bir toshga urib sindirasan. Yetti qarsillash — barmoq bo'g'imlaridek.`]
      : ['', `You nod. Oydin smashes the founders' tumars on a stone, one by one, and at the seventh she laughs out loud.|Ты киваешь. Ойдин бьёт тумары основателей о камень, один за другим, а на седьмом смеётся в голос.|Bosh irg'aysan. Oydin asoschilar tumarlarini birma-bir toshga urib sindiradi, yettinchisida ovoz chiqarib kuladi.`],
    ['', `Three hundred years of other people's lives rise out of the water like steam from a pot, and go home.|Триста лет чужих жизней поднимаются из воды, как пар из котла, и уходят домой.|Uch yuz yillik begona hayotlar qozondan chiqqan bug'dek suvdan ko'tarilib, uylariga ketadi.`],
    [obiWho(), `I remember. I remember the sand before the city. I remember being told stories. Oh, what did you do to me? What did you do?|Я помню. Помню песок до города. Помню, как мне рассказывали. Что вы со мной сделали? Что вы сделали?|Eslayman. Shahardan oldingi qumni eslayman. Menga hikoya aytishganini eslayman. Menga nima qildingiz? Nima qildingiz-a?`],
    ['', `He opens his eyes. Yodgor shudders and starts to slide into the sand, house by house. And the whole city remembers at once: everything it sold, everything it bought, everything it did.|Он открывает глаза. Ёдгор вздрагивает и начинает сползать в песок, дом за домом. И весь город разом вспоминает: всё, что продал, всё, что купил, всё, что сделал.|U ko'zini ochadi. Yodgor titraydi va uyma-uy qumga sirg'ala boshlaydi. Butun shahar birdaniga eslaydi: nimani sotganini, nimani sotib olganini, nima qilganini.`],
    fix(sadoEnd('awake'))
  ],
  epilogue: () => epilogueFor('awake')
});

ENDING('tale', {
  title: `THE TALE|СКАЗАНИЕ|DOSTON`,
  scene: () => [
    ['', `You don't give Nargiza a memory. You give her a story: a girl who was afraid of the dark, a boy who sold her to survive, and how he found her again in the crack.|Ты отдаёшь Наргизе не память, а историю: про девочку, которая боялась темноты, про мальчика, который продал её, чтобы выжить, и про то, как он нашёл её снова — в трещине.|Nargizaga xotira emas, hikoya berasan: qorong'idan qo'rqqan qizcha, omon qolish uchun uni sotgan bola va u singlisini yoriqdan qanday qayta topgani haqida.`],
    fate() === 'tale' ? ['sado', `Don't make me braver than I was. ...All right. A little braver.|Не делай меня храбрее, чем я была. ...Ладно. Чуть-чуть храбрее.|Meni bo'lganimdan jasurroq qilma. ...Mayli. Ozgina jasurroq.`] : null,
    fate() === 'tale' ? ['', `Her voice leaves you like breath on a cold morning and goes into the song. You don't feel emptier. You feel told.|Её голос выходит из тебя, как пар изо рта холодным утром, и уходит в песню. Пустее ты не стал. Тебя просто рассказали.|Uning ovozi sovuq tongdagi nafasdek sendan chiqib, qo'shiqqa qo'shiladi. O'zingni bo'shab qolgandek his qilmaysan. Seni shunchaki aytib berishdi.`] : null,
    ['', `Nargiza sings. Not the tithe song: one of Turab's tales, as old as water. Obi-Hayot listens, and the water around you grows warm.|Наргиза поёт. Не песню десятины — сказание Тураба, старое, как вода. Оби-Хаёт слушает, и вода вокруг теплеет.|Nargiza kuylaydi. Ushr qo'shig'ini emas — Turobning suvdek qadimiy dostonini. Obi Hayot tinglaydi, atrofingdagi suv iliqlashadi.`],
    ['obi', `I remember. They told me stories. I never needed to eat you.|Я помню. Мне рассказывали истории. Мне никогда не нужно было вас есть.|Eslayman. Menga hikoya aytishardi. Sizlarni yeyishim hech qachon kerak bo'lmagan.`],
    ['', `Nothing is taken from you. The tale stays with you, and with him, and with her, and with everyone who heard it. That's how it was before the founders.|У тебя ничего не забрали. Сказание осталось и у тебя, и у него, и у неё — и у всех, кто его слышал. Так было до основателей.|Sendan hech narsa olinmadi. Doston senda ham, unda ham, Nargizada ham — eshitgan hammada qoldi. Asoschilardan oldin shunday bo'lgan.`],
    oydinHere() ? ['oydin', `...Toychoq. Will you tell it to me too? I want to hear how you remember me.|...Тойчок. А мне расскажешь? Хочу услышать, какой ты меня помнишь.|...Toychoq. Menga ham aytib berasanmi? Meni qanday eslashingni eshitgim keladi.`] : null
  ],
  epilogue: () => epilogueFor('tale')
});

// Hollowness 100: may happen anywhere, in any act — no assumptions about where he stands
ENDING('hollow', {
  title: `HOLLOW|ПУСТОЙ|BO'SH`,
  scene: () => [
    ['', `Something in you goes quiet, and stays quiet. Not peace. The quiet of a house after the last lamp goes out.|Что-то в тебе затихает — и больше не просыпается. Это не покой. Это тишина дома, где погасла последняя лампа.|Ichingdagi nimadir jim bo'ladi — va boshqa tovush chiqarmaydi. Bu xotirjamlik emas. So'nggi chiroq o'chgan uyning sukunati.`],
    F().sado ? ['sado', `Toychoq? Toychoq, count with me. One. Two. Th—|Тойчок? Тойчок, считай со мной. Раз. Два. Тр...|Toychoq? Toychoq, men bilan sana. Bir. Ikki. Uc...`] : null,
    ['', `You stand in the street and don't remember where you were going. Someone hands you a bowl of tea. You take it and bow. Everyone does.|Стоишь посреди улицы и не помнишь, куда шёл. Кто-то протягивает тебе пиалу. Ты берёшь и кланяешься. Так делают все.|Ko'cha o'rtasida turibsan, qayoqqa ketayotganingni eslamaysan. Kimdir senga bir kosa choy uzatadi. Olasan va ta'zim qilasan. Hamma shunday qiladi.`],
    ['', `Your hands still know the yodchi's work: the knock, the book, the wax. They'll go on doing it for a long time.|Руки ещё помнят работу ёдчи: стук, книга, воск. Они будут делать её ещё долго.|Qo'llaring hali yodchi ishini eslaydi: taqillatish, daftar, mum. Ular buni yana uzoq qilaveradi.`]
  ],
  epilogue: () => {
    const f = F(), fac = f.faction || topRep();
    return [
      { k: 'ravshan', v: 'hollow', e: 'hollow', text: `You became one of the people you used to empty. You walk the old tithe route with an empty tumar and knock on doors where there's nothing left to take.|Ты стал одним из тех, кого сам опустошал. Ходишь старой дорогой десятины с пустым тумаром и стучишь в двери, где больше нечего взять.|Sen o'zing bo'shatgan odamlardan biriga aylanding. Eski ushr yo'lidan bo'sh tumar ko'tarib yurasan va olinadigan hech narsa qolmagan eshiklarni taqillatasan.` },
      {
        singers: { k: 'city', v: 'hollowSingers', e: 'hollow', text: `Others found the founders' tumars. Shirin sang the Great Tithe. There is no Tail any more, only people living where it used to be.|Тумары основателей нашли другие. Ширин спела Великую десятину. Хвоста больше нет — только люди, которые живут там, где он был.|Asoschilar tumarlarini boshqalar topdi. Shirin Buyuk ushrni kuyladi. Dum endi yo'q — faqat u bo'lgan joyda yashaydigan odamlar bor.` },
        divan: { k: 'city', v: 'hollowDivan', e: 'hollow', text: `Tilla-bek bought the founders' tumars. The Sleeper serves the Divan, and memory leaves Yodgor by the caravan.|Тумары основателей купил Тилла-бек. Спящий служит Дивану, а память уходит из Ёдгора караванами.|Asoschilar tumarlarini Tillabek sotib oldi. Uxlovchi Devonga xizmat qiladi, xotira esa Yodgordan karvon-karvon chiqib ketadi.` },
        remember: oydinKnown()
          ? { k: 'city', v: 'hollowAwake', e: 'hollow', text: `Oydin woke the Sleeper without you. The city sank remembering everything. You remembered nothing, and walked out unharmed.|Ойдин разбудила Спящего без тебя. Город утонул, помня всё. Ты не помнил ничего — и вышел невредимым.|Oydin Uxlovchini sensiz uyg'otdi. Shahar hammasini eslab cho'kdi. Sen hech narsani eslamasding — va omon-eson chiqib kelding.` }
          : { k: 'city', v: 'hollowAwake', e: 'hollow', text: `The woman who remembers woke the Sleeper without you. The city sank remembering everything. You remembered nothing, and walked out unharmed.|Та, что помнит, разбудила Спящего без тебя. Город утонул, помня всё. Ты не помнил ничего — и вышел невредимым.|Eslaydigan ayol Uxlovchini sensiz uyg'otdi. Shahar hammasini eslab cho'kdi. Sen hech narsani eslamasding — va omon-eson chiqib kelding.` }
      }[fac] || { k: 'city', v: 'hollowNone', e: 'hollow', text: `The founders' tumars were never found. The Sleeper tosses in his sleep, and the city keeps paying.|Тумары основателей так и не нашли. Спящий ворочается во сне, а город продолжает платить.|Asoschilar tumarlari topilmadi. Uxlovchi uyqusida ag'darilib yotadi, shahar esa to'lashda davom etadi.` },
      oydinKnown()
        ? { k: 'oydin', v: 'hollow', e: 'hollow', text: `Afterwards Oydin found you and called you Toychoq. You waited politely for her to finish.|Потом тебя нашла Ойдин и назвала Тойчоком. Ты вежливо ждал, когда она договорит.|Keyin seni Oydin topdi va Toychoq deb chaqirdi. Sen uning gapi tugashini odob bilan kutding.` }
        : { k: 'oydin', v: 'hollowStranger', e: 'hollow', text: `Afterwards a woman in black found you and called you by a child's name. You waited politely for her to leave.|Потом тебя нашла женщина в чёрном и назвала детским именем. Ты вежливо ждал, когда она уйдёт.|Keyin seni qora kiyimli bir ayol topdi va bolalikdagi isming bilan chaqirdi. Sen uning ketishini odob bilan kutding.` },
      f.widow === 'paid' ? { k: 'mehri', v: 'hollow', e: 'hollow', text: `Mehri brings you bread on the Night of Payment. You don't know why. She doesn't explain.|Мехри приносит тебе хлеб в Ночь Уплаты. Ты не знаешь почему. Она не объясняет.|To'lov kechasi Mehri senga non olib keladi. Nimaga — bilmaysan. U tushuntirmaydi.` } : null,
      { k: 'rustam', v: 'hollow', e: 'hollow', text: `You and Rustam-aka sit in the same chaikhana now. Both of you are poured tea. It's the custom.|Теперь вы с Рустамом-ака сидите в одной чайхане. Вам обоим наливают чай. Так принято.|Endi Rustam aka bilan bitta choyxonada o'tirasizlar. Ikkalangizga ham choy quyishadi. Odat shunaqa.` },
      f.sadoFate === 'remember'
        ? { k: 'sado', v: 'hollowSister', e: 'hollow', text: `Once, you had remembered your sister. That was the last thing to go.|Однажды ты вспомнил сестру. Это ушло последним.|Bir paytlar singlingni eslagan eding. Bu eng oxirida ketdi.` }
        : (f.sado || f.sadoFate)
          ? { k: 'sado', v: 'hollowVoice', e: 'hollow', text: `The voice in your head was the last thing to go quiet. For a while, at night, something in you still counted stars, and stopped at eleven.|Голос в голове умолк последним. Ещё какое-то время по ночам что-то в тебе считало звёзды и сбивалось на одиннадцати.|Boshingdagi ovoz eng oxirida jim bo'ldi. Yana bir muddat kechalari ichingdagi nimadir yulduz sanardi va o'n birda adashib qolardi.` }
          : null
    ].filter(Boolean);
  }
});

/* ---------- safety: if the gate is reached without meeting the people, play their scene anyway ---------- */
for (const id of ['a3_dream', 'a3_wedding', 'a3_sand', 'a3_house']) if (LANDS[id] && LANDS[id].exit && !EXIT[id]) EXIT[id] = LANDS[id].exit;
// pre lines depend on Sado's fate, so read them when the fight begins
if (BOSSES.aidahar) Object.defineProperty(BOSSES.aidahar, 'pre', {
  configurable: true, enumerable: true,
  get() {
    return [
      ['', `The nest is a ring of black water. Something lies coiled in it, made of every fear he was ever fed: drowning, the dark, the knock at the door on the Night of Payment.|Гнездо — кольцо чёрной воды. В нём свернулось что-то, слепленное из всех страхов, которыми его кормили: утонуть, темнота, стук в дверь в Ночь Уплаты.|Uya — qora suvdan halqa. Unda unga yedirilgan barcha qo'rquvlardan yasalgan nimadir o'ralib yotibdi: cho'kish, qorong'ilik, To'lov kechasi eshikning taqillashi.`],
      F().sado ? ['sado', `That's Ajdaho, his nightmare. It's guarding him. The real Sleeper is behind it. We have to get past.|Это Аждахо, его кошмар. Он его стережёт. Настоящий Спящий — за ним. Надо прорваться.|Bu Ajdaho — uning dahshatli tushi. U Uxlovchini qo'riqlayapti. Haqiqiysi uning ortida. O'tib olishimiz kerak.`] : null,
      ['boss', `YODCHI. I KNOW YOUR KNOCK. THREE TIMES, THEN THE BOOK.|ЁДЧИ. Я ЗНАЮ ТВОЙ СТУК. ТРИ РАЗА, ПОТОМ КНИГА.|YODCHI. TAQILLATISHINGNI TANIYMAN. UCH MARTA, KEYIN DAFTAR.`],
      ['boss', `I AM WHAT HE DREAMS WHEN YOU FEED HIM. COME AND BE DREAMED.|Я — ТО, ЧТО ЕМУ СНИТСЯ, КОГДА ВЫ ЕГО КОРМИТЕ. ИДИ СЮДА. ПРИСНИСЬ И ТЫ.|SIZLAR UNI BOQQANINGIZDA U KO'RADIGAN TUSH — MENMAN. KEL, SEN HAM TUSHGA KIR.`],
      sadoPre()
    ].filter(Boolean);
  }
});

// test hooks (read-only views; used by test/act3.js)
A3.epilogueFor = epilogueFor; A3.taleMissing = taleMissing; A3.finale = finale; A3.sadoChoice = sadoChoice;
G.YODGOR_ACT3 = A3;
}
