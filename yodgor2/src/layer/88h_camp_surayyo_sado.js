/* 88h_camp_surayyo_sado.js — talks by the fire: Surayyo (15), the romance (6, only if COMP.f('rom') === 'yes'), and Sado
   with the companions (10). Sado's talks never hint at what she is before the reveal; the last two need F().sadoFate. */
{
  const T = COMP.talk, f = COMP.f, arc = COMP.arc, app = COMP.app, story = COMP.story, has = COMP.has;
  const sado = () => sadoAwake();
  const rom = () => f('rom') === 'yes';

  /* ================================================================ SURAYYO */
  T({ id: 'sur_bread', who: 'surayyo', when: () => arc('surayyo') >= 1, lines: [
    ['surayyo', `Eat. No — eat. You're a yodchi, not a ghost. Ghosts don't need bread; you do. I can see your ribs through your coat.|Ешь. Нет — ешь. Ты ёдчи, а не призрак. Призракам хлеб не нужен, а тебе нужен. У тебя через кафтан рёбра видно.|Ye. Yo'q — ye. Sen yodchisan, arvoh emas. Arvohga non kerak emas, senga esa kerak. To'ning ustidan qovurg'alaring ko'rinib turibdi.`],
    ['hero', `That's the coat.|Это кафтан такой.|Bu to'nim shunaqa.`],
    ['surayyo', `That's what they all say. Eat.|Все так говорят. Ешь.|Hamma shunday deydi. Ye.`]
  ] });
  T({ id: 'sur_names', who: 'surayyo', when: () => arc('surayyo') >= 1 && story('a1_bazaar'), lines: [
    ['surayyo', `Every sluice has a name. The Old Man creaks. The Bride sticks on Fridays. The Donkey only turns if you swear at it. The Widow — never mind the Widow.|У каждого шлюза есть имя. Старик скрипит. Невеста по пятницам заедает. Ишак поворачивается, только если на него ругаться. Вдова — про Вдову не надо.|Har bir shlyuzning ismi bor. Chol g'ichirlaydi. Kelin jumada qisilib qoladi. Eshak faqat so'kinsang buriladi. Beva — Beva haqida gapirmaylik.`],
    ['hero', `What's wrong with the Widow?|А что с Вдовой?|Bevaga nima bo'lgan?`],
    ['surayyo', `She drowned two mirabs. Very calm, very clean water. I bring her flowers.|Утопила двух мирабов. Очень спокойная, очень чистая вода. Я ей цветы ношу.|Ikki mirobni cho'ktirgan. Juda sokin, juda toza suv. Unga gul olib boraman.`]
  ] });
  T({ id: 'sur_rabat', who: 'surayyo', when: () => story('a1_rabat') && arc('surayyo') >= 1, lines: [
    ['surayyo', `Did you taste the Rabat's wells? Everyone says it's salt out there. It isn't salt. It's the same bitter as ours, only further from the city. It's spreading.|Пробовал колодцы в Рабате? Все говорят: там соль. Это не соль. Та же горечь, что у нас, только дальше от города. Расползается.|Rabotning quduqlarini totib ko'rdingmi? Hamma u yerda tuz deydi. Tuz emas. Bizdagi achchiqlikning o'zi, faqat shahardan uzoqroqda. Yoyilyapti.`]
  ], after: () => app('surayyo', 2) });
  T({ id: 'sur_onions', who: 'surayyo', when: () => arc('surayyo') >= 2, lines: [
    ['surayyo', `I don't remember my mother's face. But her hands smelled of onions. I remember that. Funny, what the Singers leave you. They don't want the onions.|Лица матери я не помню. А руки у неё пахли луком. Вот это помню. Смешно, что Певцы оставляют. Лук им не нужен.|Onamning yuzini eslamayman. Qo'llaridan esa piyoz hidi kelardi. Shunisi esimda. Xonandalar nimani qoldirishi qiziq. Piyoz ularga kerak emas.`],
    ['hero', `I'll remember the onions for you too. In case.|Я тоже запомню про лук. На всякий случай.|Piyozni men ham eslab qolaman. Har ehtimolga qarshi.`],
    ['surayyo', `...Don't do that. Don't be kind on purpose. I'll cry into the soup.|...Не надо. Не будь добрым нарочно. Я заплачу прямо в суп.|...Kerak emas. Ataylab mehribon bo'lma. Sho'rvaga yig'lab yuboraman.`]
  ], after: () => app('surayyo', 3) });
  T({ id: 'sur_oydin', who: 'surayyo', when: () => story('a2_old') || story('a2_karez'), lines: [
    ['surayyo', `A woman in a grey mask used my water tunnels to hide people. Families on the tithe list. I never asked her name. She paid in dried apricots.|Женщина в серой маске прятала людей в моих водных туннелях. Семьи из списков десятины. Я ни разу не спросила, как её зовут. Платила она курагой.|Kulrang niqobli bir ayol mening suv tunnellarimda odamlarni yashirardi. Ushr ro'yxatidagi oilalarni. Ismini hech so'ramaganman. U turshak bilan to'lardi.`],
    ['surayyo', `Good apricots. I'd like to thank her. I'd like to ask her what she's planning, too. In that order.|Хорошая курага. Хочу сказать ей спасибо. И спросить, что она задумала. В таком порядке.|Yaxshi turshak. Unga rahmat aytgim keladi. Nima rejalashtirayotganini ham so'ragim keladi. Shu tartibda.`]
  ] });
  T({ id: 'sur_fountains', who: 'surayyo', when: () => story('a1_ark') || story('b_court'), lines: [
    ['surayyo', `The Ark's gardens drink sweet water while the Tail drinks bitter. Every summer I go up and look at their fountains for an hour.|Сады Арка пьют сладкую воду, а Хвост — горькую. Каждое лето я поднимаюсь и час смотрю на их фонтаны.|Ark bog'lari shirin suv ichadi, Dum esa achchiq. Har yozi tepaga chiqib, bir soat ularning favvoralariga qarab turaman.`],
    ['hero', `Why?|Зачем?|Nega?`],
    ['surayyo', `To stay angry. Anger keeps better than water.|Чтобы не перестать злиться. Злость хранится лучше воды.|Jahlim chiqib tursin, deb. Jahl suvdan yaxshiroq saqlanadi.`]
  ] });
  T({ id: 'sur_hook', who: 'surayyo', when: () => arc('surayyo') >= 1 && story('b_tower'), lines: [
    ['surayyo', `This hook belonged to the mirab before me, and the one before her. Seven mirabs. All of them argued with this exact piece of iron.|Этот крюк был у мираба до меня и у того, кто был до неё. Семь мирабов. Все спорили именно с этой железкой.|Bu ilgak mendan oldingi mirobniki, undan oldingisiniki edi. Yetti mirob. Hammasi aynan shu temir bilan bahslashgan.`],
    () => (sado() ? ['sado', `Seven! Like her stars. Everything about her comes in sevens.|Семь! Как её звёзды. У неё всё по семь.|Yetti! Xuddi yulduzlaridek. Unda hamma narsa yettitadan.`] : null)
  ] });
  T({ id: 'sur_swear', who: 'surayyo', when: () => arc('surayyo') >= 1 && story('a1_rabat'), lines: [
    ['surayyo', `You swear like a clerk. "Curse it." That's not swearing. Listen: ...no, children might hear. Later. I'll teach you properly.|Ты ругаешься, как писарь. «Чтоб тебя». Это не ругань. Слушай: ...нет, дети услышат. Потом. Научу как следует.|Mirzadek so'kinasan. «La'nat». Bu so'kinish emas. Eshit: ...yo'q, bolalar eshitadi. Keyin. Yaxshilab o'rgataman.`]
  ] });
  T({ id: 'sur_fight', who: 'surayyo', when: () => story('b_cistern'), lines: [
    ['surayyo', `You fight like you're paying for something. Every blow, a coin. Who are you paying, Ravshan?|Ты дерёшься так, будто за что-то платишь. Каждый удар — монета. Кому ты платишь, Равшан?|Nimagadir to'layotgandek urishasan. Har bir zarba — bir tanga. Kimga to'layapsan, Ravshan?`],
    ['hero', `The book.|Книге.|Daftarga.`],
    ['surayyo', `The book's not here. Fight for yourself sometimes. It's allowed.|Книги тут нет. Хоть иногда дерись за себя. Это можно.|Daftar bu yerda yo'q. Ba'zan o'zing uchun urish. Bu mumkin.`]
  ], after: () => app('surayyo', 3) });
  T({ id: 'sur_oysha', who: 'surayyo', when: () => arc('surayyo') >= 1 && story('a1_tail'), lines: [
    ['surayyo', `Grandma Oysha on the third row counts my visits in onions. One onion each time I fix her pipe. She owes me forty-two onions. She'll never pay. I'll never ask.|Бабушка Ойша с третьего ряда считает мои приходы луковицами. Луковица за каждый раз, когда я чиню ей трубу. Она должна мне сорок две луковицы. Никогда не отдаст. Я никогда не попрошу.|Uchinchi qatordagi Oysha buvi kelishlarimni piyoz bilan sanaydi. Quvurini tuzatganimda har safar bitta piyoz. Menga qirq ikkita piyoz qarzdor. Hech qachon bermaydi. Men hech qachon so'ramayman.`],
    ['surayyo', `That's how the Tail stays standing. Debts nobody collects.|Так Хвост и держится. На долгах, которые никто не взыскивает.|Dum shunday turibdi. Hech kim undirmaydigan qarzlar bilan.`]
  ] });
  T({ id: 'sur_pity', who: 'surayyo', when: () => app('surayyo') >= 20 && arc('surayyo') >= 2, lines: [
    ['surayyo', `You looked at me with pity today. When the novice read the ledger. Don't. If you pity me, I'll start pitying myself, and then who fixes the Donkey?|Ты сегодня смотрел на меня с жалостью. Когда послушница читала книгу. Не надо. Начнёшь жалеть ты — начну и я, а кто тогда будет чинить Ишака?|Bugun menga achinib qarading. Shogird daftarni o'qiganda. Kerak emas. Sen achinsang, men ham o'zimga achina boshlayman, unda Eshakni kim tuzatadi?`]
  ] });
  T({ id: 'sur_best', who: 'surayyo', pri: 5, when: () => app('surayyo') >= 70, lines: [
    ['surayyo', `When all this is over, I want one ordinary day. Fix a pipe, burn the rice, fight with Oysha about onions. That's all. I've forgotten what ordinary feels like.|Когда всё кончится, хочу один обычный день. Починить трубу, сжечь рис, поругаться с Ойшей из-за лука. Всё. Я забыла, каково это — обычный день.|Hammasi tugagach, bitta oddiy kun xohlayman. Quvur tuzatish, guruchni kuydirish, Oysha bilan piyoz uchun janjallashish. Shu. Oddiy kun qanday bo'lishini unutib qo'yganman.`]
  ] });
  T({ id: 'sur_dream', who: 'surayyo', when: () => story('a3_dream'), lines: [
    ['surayyo', `In the dream the water's sweet. I keep drinking. I'm not even thirsty. I just want to know what it tasted like.|Во сне вода сладкая. Я всё пью. Мне даже не хочется. Просто хочу знать, какой она была.|Tushda suv shirin. To'xtamay ichyapman. Chanqamagan ham emasman. Shunchaki qanday ta'mi bo'lganini bilgim keladi.`]
  ] });
  T({ id: 'sur_divan_water', who: 'surayyo', when: () => story('a2_heart'), lines: [
    ['surayyo', `If the Divan offers me the city's water, I'll want to say yes. For the Tail. I'm telling you now so you know it's in me. Don't let me pretend it isn't.|Если Диван предложит мне воду всего города, мне захочется согласиться. Ради Хвоста. Говорю сейчас, чтобы ты знал: это во мне есть. Не давай мне делать вид, что нет.|Agar Devon menga butun shaharning suvini taklif qilsa, rozi bo'lgim keladi. Dum uchun. Hozir aytyapman, bilib qo'y: bu menda bor. Yo'q deb o'zimni aldashimga yo'l qo'yma.`]
  ] });
  T({ id: 'sur_tumar', who: 'surayyo', when: () => f('surTumar'), lines: () => [
    ['surayyo', { mine: `You learn me fast, for a stranger. Yesterday you knew I like the tea strong. Who told you?|Для незнакомца ты меня быстро учишь. Вчера уже знал, что я люблю крепкий чай. Кто тебе сказал?|Notanish odam uchun meni tez o'rganyapsan. Kecha kuchli choy yoqishini bilarding. Kim aytdi?`, quit: `I went to the sluices this morning out of habit. Somebody else was there. I stood behind a wall like a thief and watched him swear at the Donkey wrong.|Утром по привычке пошла к шлюзам. Там был кто-то другой. Я стояла за стенкой, как воровка, и смотрела, как он неправильно ругает Ишака.|Ertalab odat bo'yicha shlyuzlarga bordim. U yerda boshqa odam bor ekan. O'g'ridek devor ortida turib, uning Eshakni noto'g'ri so'kayotganini kuzatdim.`, third: `My mother had a gap in her teeth. I keep telling people. Oysha says I've told her eleven times. I'll tell her twelve.|У мамы была щербинка. Я всем рассказываю. Ойша говорит, я ей говорила уже одиннадцать раз. Скажу двенадцатый.|Onamning tishida tirqish bor edi. Hammaga aytib yuribman. Oysha o'n bir marta aytganman deydi. O'n ikkinchi marta aytaman.`, failed: `It's all right. You tried. That old song is older than both of us. It doesn't like being sung by tired people.|Ничего. Ты пытался. Этот напев старше нас обоих. Не любит, когда его поют уставшие.|Hechqisi yo'q. Harakat qilding. U kuy ikkalamizdan ham qari. Charchagan odamlar kuylashini yoqtirmaydi.`, none: `I still have today. Today I remember you, and the onions, and the Widow. That's a good day. Let's not waste it on my head.|У меня ещё есть сегодня. Сегодня я помню тебя, и лук, и Вдову. Это хороший день. Давай не тратить его на мою голову.|Menda hali bugun bor. Bugun seni ham, piyozni ham, Bevani ham eslayman. Bu yaxshi kun. Uni mening boshimga sarflamaylik.` }[f('surTumar')] || `...|...|...`]
  ] });

  /* ================================================================ THE ROMANCE (after the roof, 88e) */
  T({ id: 'rom_hands', who: 'surayyo', pri: 20, when: () => rom() && arc('surayyo') >= 3, lines: [
    ['surayyo', `Your hands are cold. Do all yodchis have cold hands? ...Give them here. No, both. I'm not doing this halfway.|У тебя руки холодные. У всех ёдчи такие? ...Давай сюда. Нет, обе. Я наполовину не делаю.|Qo'llaring muzdek. Hamma yodchilarniki shunaqami? ...Bu yoqqa ber. Yo'q, ikkalasini. Men yarimta qilmayman.`]
  ], after: () => app('surayyo', 3) });
  T({ id: 'rom_tea', who: 'surayyo', pri: 19, when: () => rom() && story('a2_old'), lines: [
    ['surayyo', `Tea on the roof is our thing now. I've decided. You don't get a vote. You can bring the cups.|Чай на крыше — теперь наше. Я решила. Твой голос не считается. Можешь принести пиалы.|Tomda choy ichish endi biznikida. Men hal qildim. Sening ovozing hisobga olinmaydi. Piyolalarni olib kelishing mumkin.`],
    () => (sado() ? ['sado', `I'm coming too. I'll be very quiet. ...I'll count the stars quietly.|Я тоже приду. Буду очень тихо. ...Звёзды буду считать тихо.|Men ham boraman. Juda jim bo'laman. ...Yulduzlarni jimgina sanayman.`] : null)
  ] });
  T({ id: 'rom_swear', who: 'surayyo', pri: 18, when: () => rom() && f('rom') && app('surayyo') >= 50, lines: [
    ['surayyo', `All right. Lesson one. The Donkey. Repeat after me: ...no, louder. Louder! The neighbours have heard worse. From me.|Ладно. Урок первый. Ишак. Повторяй за мной: ...нет, громче. Громче! Соседи слышали и похуже. От меня.|Mayli. Birinchi dars. Eshak. Mendan keyin takrorla: ...yo'q, balandroq. Balandroq! Qo'shnilar bundan battarini eshitgan. Mendan.`],
    ['', `You say it. It's terrible. She laughs so hard she has to sit down on the roof, and you laugh too, for the first time in a long time, at nothing at all.|Ты повторяешь. Выходит ужасно. Она хохочет так, что приходится сесть прямо на крышу, и ты смеёшься тоже — впервые за долгое время, просто так.|Takrorlaysan. Dahshatli chiqadi. U shunchalik kuladiki, tomga o'tirib qolishiga to'g'ri keladi, sen ham kulasan — uzoq vaqtdan beri birinchi marta, shunchaki.`]
  ], after: () => app('surayyo', 4) });
  T({ id: 'rom_sleep', who: 'surayyo', pri: 17, when: () => rom() && story('b_seven'), lines: [
    ['', `Surayyo falls asleep by the fire mid-sentence, with her head on your shoulder and her hook still in her hand.|Сурайё засыпает у огня посреди фразы — голова у тебя на плече, крюк всё ещё в руке.|Surayyo gap o'rtasida olov yonida uxlab qoladi — boshi yelkangda, ilgagi hamon qo'lida.`],
    () => (sado() ? ['sado', `Don't move. I'll keep watch. ...I can't keep watch. You keep watch. I'll keep watch on you keeping watch.|Не двигайся. Я посторожу. ...Я не могу сторожить. Ты сторожи. А я посторожу, как ты сторожишь.|Qimirlama. Men qo'riqlayman. ...Qo'riqlay olmayman. Sen qo'riqla. Men esa qo'riqlayotganingni qo'riqlayman.`] : ['', `You don't move until the fire goes out.|Ты не двигаешься, пока не прогорит огонь.|Olov o'chguncha qimirlamaysan.`])
  ] });
  T({ id: 'rom_name', who: 'surayyo', pri: 16, when: () => rom() && arc('surayyo') >= 4, lines: [
    ['surayyo', `Say my name. Just say it.|Скажи моё имя. Просто скажи.|Ismimni ayt. Shunchaki ayt.`],
    ['hero', `Surayyo.|Сурайё.|Surayyo.`],
    ['surayyo', `Again.|Ещё раз.|Yana bir marta.`],
    ['hero', `Surayyo.|Сурайё.|Surayyo.`],
    ['surayyo', `Good. I'm keeping that one. They can have the rest.|Хорошо. Это я себе оставлю. Остальное пусть забирают.|Yaxshi. Buni o'zimga olib qolaman. Qolganini olishsin.`]
  ], after: () => app('surayyo', 3) });
  T({ id: 'rom_last', who: 'surayyo', pri: 30, when: () => rom() && story('a3_house'), lines: [
    ['surayyo', `Whatever happens down there: you counted the Pleiades with me. Nobody can take that out of me. I checked. I looked for it with both hands. It's in there.|Что бы там внизу ни случилось — ты считал со мной Плеяды. Этого из меня никто не вынет. Я проверила. Обеими руками искала. Оно там.|U yerda pastda nima bo'lsa ham — sen men bilan Hulkarni sanagansan. Buni mendan hech kim chiqarib ololmaydi. Tekshirdim. Ikki qo'lim bilan qidirdim. U o'sha yerda.`]
  ] });

  /* ================================================================ SADO with the companions */
  T({ id: 'sado_rain', who: 'surayyo', when: () => sado() && arc('surayyo') >= 1, lines: [
    ['sado', `Tell her she smells like rain. Go on. Tell her.|Скажи ей, что она пахнет дождём. Ну. Скажи.|Unga undan yomg'ir hidi keladi, deb ayt. Qani. Ayt.`],
    ['hero', `...Someone says you smell like rain.|...Тут кое-кто говорит, что ты пахнешь дождём.|...Bu yerda kimdir sendan yomg'ir hidi keladi deyapti.`],
    ['surayyo', `Someone has good taste. Tell someone thank you.|У кого-то хороший вкус. Передай кому-то спасибо.|Kimningdir didi yaxshi ekan. Kimgadir rahmat ayt.`],
    ['sado', `She said thank you. To me. Nobody ever says anything to me.|Она сказала спасибо. Мне. Мне никто никогда ничего не говорит.|U rahmat dedi. Menga. Menga hech kim hech qachon hech narsa demaydi.`]
  ] });
  T({ id: 'sado_quiet', who: 'alp', when: () => sado() && arc('alp') >= 1, lines: [
    ['sado', `He's so quiet. When he's near, I go quiet too. Like in a very big room.|Он такой тихий. Когда он рядом, я тоже затихаю. Как в очень большой комнате.|U juda jim. U yonida bo'lsa, men ham jim bo'lib qolaman. Xuddi juda katta xonadagidek.`],
    ['hero', `You're afraid of him.|Ты его боишься.|Undan qo'rqasan.`],
    ['sado', `A little. He's big, and he doesn't know what he did. I don't like not knowing either.|Немножко. Он большой и не знает, что натворил. Я тоже не люблю не знать.|Ozgina. U katta va nima qilganini bilmaydi. Men ham bilmaslikni yoqtirmayman.`]
  ] });
  T({ id: 'sado_note', who: 'nargiza', when: () => sado() && arc('nargiza') >= 2, lines: [
    ['sado', `I'm going to hum. Just one note. Watch her.|Я сейчас напою. Одну ноту. Смотри на неё.|Hozir xirgoyi qilaman. Bitta nota. Unga qara.`],
    ['', `Nargiza, half asleep, hums a single low note. Then she frowns, and hums it again, as if answering someone.|Наргиза в полусне тянет одну низкую ноту. Потом хмурится и тянет её снова — будто кому-то отвечает.|Yarim uyqudagi Nargiza bitta past notani cho'zadi. Keyin qovog'ini solib, uni yana cho'zadi — go'yo kimgadir javob qaytarayotgandek.`],
    ['sado', `...Same note. Same note, Ravshan.|...Та же нота. Та же нота, Равшан.|...O'sha nota. O'sha nota, Ravshan.`]
  ] });
  T({ id: 'sado_jealous', who: 'surayyo', when: () => sado() && rom() && arc('surayyo') >= 3, lines: [
    ['sado', `You smile differently now. Lower down. ...I'm not jealous. I'm counting. It's different.|Ты теперь иначе улыбаешься. Ниже как-то. ...Я не ревную. Я считаю. Это другое.|Endi boshqacha jilmayasan. Pastroqdan. ...Rashk qilmayapman. Sanayapman. Bu boshqa narsa.`],
    ['hero', `Counting what?|Что считаешь?|Nimani sanayapsan?`],
    ['sado', `How many times you looked at her today. Forty-one. I lost count at forty-one. Happy?|Сколько раз ты сегодня на неё посмотрел. Сорок один. На сорок первом сбилась. Доволен?|Bugun unga necha marta qaraganingni. Qirq bir. Qirq birinchida adashib ketdim. Xursandmisan?`]
  ] });
  T({ id: 'sado_four', who: 'all', when: () => sado() && ['alp', 'nargiza', 'surayyo'].filter(has).length >= 2, lines: () => [
    ['sado', ['alp', 'nargiza', 'surayyo'].filter(has).length >= 3
      ? `Let me count us. You, the big one, the singing one, the loud one. Four. And me. Five. I'm counting me. Nobody else does.|Дай я нас посчитаю. Ты, большой, поющая, громкая. Четверо. И я. Пятеро. Я считаю себя. Больше никто не считает.|Keling, bizni sanab chiqay. Sen, kattasi, kuylaydigani, shovqinlisi. To'rtta. Va men. Beshta. O'zimni sanayman. Boshqa hech kim sanamaydi.`
      : `Let me count us. You and them. And me. I'm counting me. Nobody else does.|Дай я нас посчитаю. Ты и они. И я. Я себя считаю. Больше никто не считает.|Keling, bizni sanab chiqay. Sen va ular. Va men. O'zimni sanayman. Boshqa hech kim sanamaydi.`]
  ] });
  T({ id: 'sado_alp2', who: 'alp', when: () => sado() && app('alp') >= 40, lines: [
    ['sado', `He scares me less now. He fixed a sandal for an hour today. Nobody scary fixes a sandal for an hour.|Он меня теперь меньше пугает. Он сегодня час чинил сандалию. Страшные люди не чинят сандалии по часу.|U endi meni kamroq qo'rqitadi. Bugun bir soat kovush tuzatdi. Qo'rqinchli odamlar bir soat kovush tuzatishmaydi.`]
  ] });
  T({ id: 'sado_mother', who: 'surayyo', when: () => sado() && arc('surayyo') >= 2, lines: [
    ['sado', `Ask her what her mother sang. Not what she looked like. What she sang. That sometimes stays when faces go.|Спроси, что пела её мама. Не как выглядела. Что пела. Это иногда остаётся, когда лица уходят.|Undan onasi nima kuylaganini so'ra. Qanday ko'rinishini emas. Nima kuylaganini. Yuzlar ketganda ba'zan shu qoladi.`],
    ['hero', `Surayyo. What did your mother sing?|Сурайё. А что пела твоя мама?|Surayyo. Onang nima kuylardi?`],
    ['surayyo', `...A counting song. Water-wheels. "One for the garden, two for the goat." I didn't know I still had that. Thank you. Whoever thought of asking.|...Считалку. Про водяные колёса. «Раз — для сада, два — для козы». Не знала, что это у меня ещё есть. Спасибо. Тому, кто догадался спросить.|...Sanamachoq. Suv g'ildiraklari haqida. «Bir — bog' uchun, ikki — echki uchun». Bu hali menda borligini bilmagandim. Rahmat. So'rashni o'ylab topgan kishiga.`]
  ], after: () => app('surayyo', 4) });
  T({ id: 'sado_stars', who: 'all', when: () => sado() && story('a2_spine'), lines: [
    ['sado', `Up here the stars are so close. If I had hands I'd take one and put it in your pocket. You'd only count it, though.|Здесь звёзды так близко. Будь у меня руки, я бы взяла одну и положила тебе в карман. Ты бы её только пересчитал.|Bu yerda yulduzlar juda yaqin. Qo'llarim bo'lganida, bittasini olib cho'ntagingga solib qo'yardim. Sen esa uni faqat sanab qo'yarding.`]
  ] });
  // after the reveal (F().sadoFate): two warm scenes
  T({ id: 'sado_after_s', who: 'surayyo', pri: 40, when: () => !!F().sadoFate && arc('surayyo') >= 1, lines: [
    ['surayyo', `So she's yours. A piece of you, and of your sister. ...Goodnight, little one. I'll keep saying it. You can't stop me.|Значит, она — твоя. Кусочек тебя и твоей сестры. ...Спокойной ночи, маленькая. Я буду это говорить. Ты меня не остановишь.|Demak, u seniki. Sening va singlingning bir parchasi. ...Xayrli tun, jajji. Buni aytaveraman. To'xtatolmaysan.`],
    () => (sado() ? ['sado', `...She said goodnight. Ravshan. She said goodnight to me.|...Она сказала «спокойной ночи». Равшан. Мне она сказала.|...U xayrli tun dedi. Ravshan. Menga aytdi.`] : null)
  ] });
  T({ id: 'sado_after_n', who: 'nargiza', pri: 40, when: () => !!F().sadoFate && arc('nargiza') >= 1, lines: [
    ['nargiza', `I always heard her, you know. A girl humming the wrong half of "Alla". I thought I was going mad. I'm glad it was only her.|Я её всегда слышала, знаешь. Девочка напевает не ту половину «Аллы». Я думала, схожу с ума. Рада, что это была всего лишь она.|Uni doim eshitardim, bilasanmi. Bir qiz «Alla»ning noto'g'ri yarmini xirgoyi qiladi. Aqldan ozyapman deb o'ylardim. Faqat u bo'lganidan xursandman.`]
  ] });
}
