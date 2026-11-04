# Act III and endings rewrite: review sheet (25 before → after)

Source: `src/layer/72_act3.js`. BEFORE is the v2 file (backup `scratchpad/72_act3.v2.js`), AFTER is v3. Each item shows RU and UZ; EN appears where its wording or meaning changed. Menus show every option in order. Option order, ids, costs, locks, flags and effects are unchanged. A token-level diff of the code outside the strings shows only added dialogue lines.

## 1. Menu · The fate of Yodgor (finale)

- EN before: [Feed him] Give the founders' tumars to the Singers. / [Chain him] Sing the founders' song. Hold the chain. / [Wake him] Break the founders' tumars. / [Tell a tale] Give Nargiza your story to sing.
- EN after: **Give the founders' tumars to the Singers. Let him sleep, fed. / Sing the founders' song. Hold the chain yourself. / Break the founders' tumars. Let him wake. / Give Nargiza your story to sing. All of it.**
- RU before: [Накормить] Отдать тумары основателей Певцам. / [Сковать] Спеть песню основателей и держать цепь. / [Разбудить] Разбить тумары основателей. / [Рассказать] Отдать Наргизе свою историю.
- RU after: **Отдать тумары основателей Певцам. Пусть спит сытым. / Спеть песню основателей. Держать цепь самому. / Разбить тумары основателей. Пусть просыпается. / Отдать Наргизе свою историю. Всю, как есть.**
- UZ before: [Boqish] Asoschilar tumarlarini Xonandalarga berish. / [Zanjirlash] Asoschilar qo'shig'i bilan zanjirni tutish. / [Uyg'otish] Asoschilar tumarlarini sindirish. / [Doston] Nargizaga hikoyangni kuylash uchun berish.
- UZ after: **Asoschilar tumarlarini Xonandalarga berish. To'q uxlasin. / Asoschilar qo'shig'ini kuylab, zanjirni o'zing tutish. / Asoschilar tumarlarini sindirish. Uyg'onsin. / Nargizaga hikoyangni berish. Boricha, hammasini.**
- Faction variants (after): Singers: **«Доводите Великую десятину до конца, Устоз». Отдать ей тумары основателей. / «Buyuk ushrni oxiriga yetkazing, Ustoz». Unga asoschilar tumarlarini berish.** Divan: **Спеть песню основателей. Посадить его на цепь Дивана. / Asoschilar qo'shig'ini kuylab, uni Devon zanjiriga solish.** Those Who Remember: **«Вместе, Ойдин». Разбить тумары основателей. / «Birga, Oydin». Asoschilar tumarlarini sindirish.** (I wrote "together" so the label stays true whoever smashes the tumars in the ending scene.)

## 2. Finale hub · what "the tale" costs (new lines; it was the only option with no cost)

- RU after: **Только сказание — не цепь. Если он однажды перестанет слушать, его ничто не удержит. А Наргизе придётся петь ему каждую ночь до конца своих дней.** / **И твоя история перестанет быть только твоей. Весь город услышит, что ты продал в двенадцать лет. И кого.**
- UZ after: **Lekin doston kishan emas. U bir kun tinglashdan to'xtasa, uni hech narsa ushlab turolmaydi. Nargiza esa umrining oxirigacha har kecha unga kuylashi kerak bo'ladi.** / **Hikoyang ham endi faqat seniki bo'lmaydi. Butun shahar o'n ikki yoshingda nimani sotganingni eshitadi. Kimni sotganingni ham.**
- The other three answers also gained their missing half. Feeding now names what it gains: "For a hundred years nobody's house slides into the sand", and Sado adds "...And no little girl hides under a table when the floor lifts. I hate that that's a real answer too." The chain answer now says that nobody pays a tithe, rich or poor. Tilla-bek gets a convincing line of his own: "They'll pay with work, like honest people. Those Who Remember wanted that much, didn't they? Minus the drowning."

## 3. Finale hub questions

- RU before: [Спросить] Что будет, если его накормить? / [Спросить] А если его сковать? / [Спросить] А если его разбудить? / [Спросить] А если рассказать ему сказание?
- RU after: **— А если его снова накормить? / — А если посадить его на цепь? / — А если его разбудить? / — А если рассказать ему сказание?**
- UZ before: [So'rash] Uni yana boqsam, nima bo'ladi? / [So'rash] Uni zanjirlasam-chi? / [So'rash] Uni uyg'otsam-chi? / [So'rash] Unga doston aytib bersam-chi?
- UZ after: **— Uni yana to'ydirsam-chi? / — Uni kishanlasam-chi? / — Uni uyg'otsam-chi? / — Unga doston aytib bersam-chi?**

## 4. Menu · What becomes of Sado (Your House)

- RU before: [Вспомнить] Вернуть Ойдин в свою память. / [Оставить] Пусть Садо останется голосом. / [Отдать] Отнести Садо взрослой Ойдин. / [Сказание] Пусть Садо станет сказанием.
- RU after: **«Возвращайся домой, Ойдин». Вспомнить её — всю. / «Останься со мной. Такой, какая есть.» / «Ты должна быть у неё. Я отнесу тебя к ней.» / «Давай сделаем из тебя сказание. Такое, чтобы он услышал.»**
- UZ before: [Eslash] Oydinni xotirangga qaytarish. / [Saqlash] Sado ovoz bo'lib qolsin. / [Berish] Sadoni katta Oydinga topshirish. / [Doston] Sado dostonga aylansin.
- UZ after: **«Uyga qayt, Oydin». Uni butunligicha eslash. / «Men bilan qol. Shundayligingcha.» / «Sen unda bo'lishing kerak. Seni uning oldiga olib boraman.» / «Seni dostonga aylantiramiz. U eshitadigan dostonga.»**

## 5. Sado choice · each fate gets its cost (new hub lines)

- Remember (it was the clearly "good" option at −30 Hollowness). RU: **А у настоящей Ойдин так и будет не хватать кусочка. Он будет в тебе, а не в ней.** UZ: **Haqiqiy Oydinda esa bir parcha yetishmay qolaveradi. U parcha unda emas, senda bo'ladi.**
- Keep (it now says plainly that she cannot stop the Hollowness). RU: **И песня будет есть тебя дальше. Перекричать её я могу. Остановить — нет.** UZ: **Qo'shiq ham seni yeyishda davom etadi. Men uni bosib gapira olaman. To'xtata olmayman.**
- Tale (it now carries a cost, and sets up her "don't make me braver" line). RU: **А сказку каждый пересказывает по-своему. Лет через сто я буду храбрее, чем была. Или глупее.** UZ: **Ertakni esa har kim o'zicha aytadi. Yuz yildan keyin men bo'lganimdan jasurroq bo'laman. Yo ahmoqroq.**

## 6. Line · the reveal: the splinter

- RU before: Но ты любил её слишком сильно. Всё не влезло. То, что не влезло, — она в восемь лет, её голос, её любовь к тебе — осталось в тебе, как заноза. Это я.
- RU after: **Только ты слишком её любил. Всё не влезло. То, что не влезло, — она в восемь лет, её голос, как она тебя любила, — застряло в тебе занозой. Это я.**
- UZ before: Lekin sen uni juda qattiq yaxshi ko'rarding. Hammasi sig'madi. Sig'magani: sakkiz yoshli u, ovozi, seni qanchalik yaxshi ko'rgani, ichingda zirapchadek qoldi. Bu men.
- UZ after: **Lekin sen uni juda yaxshi ko'rarding. Hammasi sig'madi. Sig'magani — sakkiz yoshli u, uning ovozi, seni qanchalik yaxshi ko'rgani — ichingda zirapchadek qolib ketdi. U — men.**

## 7. Line · the reveal: the quote (it now agrees with Act I)

- RU before: «Что не помещается, то сгорает. Обычно». Так она сказала. А я не сгорела.
- RU after: **«Что не влезет, то сгорит. Обычно». Так она сказала. А я не сгорела.** (word for word as the Singer says it in m2_sale)
- UZ before: «Sig'magani kuyib ketadi. Odatda». U shunday degan. Men esa kuymadim.
- UZ after: **«Sig'magani kuyib ketadi. Odatda». U shunday degandi. Men esa kuymadim.**

## 8. Line · m_quake: a continuity fix (in Act I Sado says this line, not Rustam)

- EN before: "She was so scared she couldn't cry." That's what Rustam said. Ravshan... word for word.
- EN after: **"She was so scared she couldn't even cry." I said that. In Rustam's memory, about the girl behind the curtain. ...How did I know, Ravshan?**
- RU before: «Она так боялась, что не могла плакать». Так сказал Рустам. Равшан... слово в слово.
- RU after: **«Ей было так страшно, что она даже плакать не могла». Это я сказала. Тогда, в памяти Рустама, про девочку за занавеской. ...Откуда я знала, Равшан?**
- UZ before: «U shunchalik qo'rqqan ediki, yig'lay olmasdi». Rustam shunday degan. Ravshan... so'zma-so'z.
- UZ after: **«U shunchalik qo'rqqan ediki, hatto yig'lay olmasdi». Buni men aytgandim. Rustamning xotirasida, parda ortidagi qizcha haqida. ...Qayerdan bilgandim, Ravshan?**

## 9. Menu · Rustam-aka in the dream chaikhana

- RU before: [Простить] «Я тебя прощаю, ака». / [Не прощать] «Я не могу тебя простить». / [Промолчать] Налить ему чаю и ничего не сказать.
- RU after: **«Я вас прощаю, ака.» / «Не могу я вас простить.» / Налить ему чаю и ничего не говорить.** (he addresses his master with «вы», as in Act II)
- UZ before: [Kechirish] «Seni kechiraman, aka». / [Kechirmaslik] «Seni kechira olmayman». / [Jim turish] Unga choy quyib, indamaslik.
- UZ after: **«Sizni kechiraman, aka.» / «Sizni kechira olmayman.» / Unga choy quyib, indamay o'tirish.**

## 10. Line · Rustam's last words

- RU before: Потом он снова смотрит в огонь, в никуда, — как в каждой чайхане там, наверху. / Тойчок. Жеребёнок. Так я зову тебя, когда мне страшно…
- RU after: **И вот он снова смотрит в огонь, в никуда, — как в любой чайхане там, наверху, наяву.** / **Тойчок. Жеребёночек. Так я тебя зову, когда мне страшно. Откуда он это знает? И откуда — я?**
- UZ before: Toychoq. Kichkina toy. Qo'rqqanimda seni shunday chaqiraman. U buni qayerdan biladi? Men-chi?
- UZ after: **Toychoq. Qo'rqqanimda seni shunday chaqiraman. U buni qayerdan biladi? Men-chi?** (the gloss "kichkina toy" is redundant in Uzbek)

## 11. Menu · The queue of the Night of Payment

- RU before: [Пощадить] Закрыть книгу. Всех — в уплатившие. / [Забрать память] Собирать, как всегда. / [Уйти] Пройти мимо.
- RU after: **Написать напротив каждого имени «уплачено» и закрыть книгу. / Достать воск и собирать, как каждый год. / «Наверху за них никто не заплатил. И здесь я им врать не буду». Пройти мимо.**
- UZ before: [Rahm] Kitobni yopish. Hammani to'lagan deb yozish. / [Xotirani olish] Har doimgidek yig'ish. / [Ketish] Yonidan o'tib ketish.
- UZ after: **Har bir ismning qarshisiga «to'landi» deb yozib, daftarni yopish. / Mumni olib, har yilgidek yig'ish. / «Tepada hech kim to'lamagan. Bu yerda ham ularga yolg'on gapirmayman». Yonidan o'tib ketish.**
- Stakes: closing the book now has a cost. Sado says: "Only it's a lie, you know. A kind one." Walking past now has its own reason (honesty). The Hollowness cost of collecting reads from "...And yourself too."

## 12. Menu · The bride

- RU before: [Помочь] Взять её за руку. Пусть сделает шаг. / [Уйти] Пусть танцуют дальше. / [Забрать память] Запечатать свадьбу в тумар.
- RU after: **«Я пройду с вами». Взять её за руку. / «Танцуйте. Это ваша свадьба». Оставить всё как есть. / Достать тумар и запечатать в нём всю свадьбу.**
- UZ before: [Yordam] Qo'lidan tutish. To'rtinchi qadamni bossin. / [Ketish] Raqsda davom etishsin. / [Xotirani olish] To'yni tumarga muhrlash.
- UZ after: **«Siz bilan birga bosaman». Qo'lidan tutish. / «Raqsingizni tushavering. Bu sizning to'yingiz». Ularni o'z holiga qo'yish. / Tumar olib, butun to'yni unga muhrlash.**
- New cost for ending the wedding. RU: **И наверху тоже кончится. Все потёртые тумары с этой свадьбой на базаре опустеют. А у многих девчонок из Хвоста другой свадьбы и не было.** UZ: **Tepada ham tugaydi. Bozordagi bu to'yning hamma eskirgan tumarlari bo'shab qoladi. Dumdagi ko'p qizlarning boshqa to'yi bo'lmagan-ku.**

## 13. Menu · Mehri's son

- RU before: [Помочь] Взять его в тумар и вернуть Мехри. / [Солгать] «Мама ждёт тебя. Посиди у воды». / [Правда] «Она тебя не помнит. Это я тебя забрал».
- RU after: **Протянуть ему пустой тумар. Отнести его домой, к Мехри. / «Мама тебя ждёт. Иди посиди у воды.» / «Она тебя не помнит. Это я тебя забрал.»**
- UZ before: [Yordam] Uni tumarga olib, Mehriga qaytarish. / [Yolg'on] «Onang kutyapti. Suv bo'yida o'tir». / [Haqiqat] «U seni eslamaydi. Seni men olganman».
- UZ after: **Unga bo'sh tumar uzatish. Uni uyiga, Mehrining yoniga olib borish. / «Oying seni kutyapti. Borib suv bo'yida o'tir.» / «U seni eslamaydi. Seni men olganman.»**
- New cost for carrying him home. RU: **А ещё она снова вспомнит кяриз. Воду. Как разжалась рука. Всё вернётся вместе с ним.** UZ: **Korizni ham yana eslaydi. Suvni. Qo'li qanday bo'shalib ketganini. Hammasi u bilan birga qaytadi.** The lie now has a gain: **...Зато он больше не плачет. Уже что-то. / ...Ammo endi yig'lamayapti. Shuning o'zi ham bir gap.**

## 14. Menu · The last morning of Old Yodgor

- RU before: [Пообещать] «Я запомню. Назовите имена». / [Слушать] Выучить песню цепи наизусть. / [Уйти] Идти дальше. Опоздали на триста лет.
- RU after: **«Я запомню. Назовите имена.» / Встать за спинами Семерых и дослушать песню до конца. / «Мы опоздали на триста лет». Идти дальше.**
- UZ before: [Va'da] «Eslab qolaman. Ismlaringizni ayting». / [Tinglash] Zanjir qo'shig'ini yod olish. / [Ketish] Davom etish. Uch yuz yilga kechikdik.
- UZ after: **«Eslab qolaman. Ismlaringizni ayting.» / Yettovning orqasida turib, qo'shiqni oxirigacha tinglash. / «Uch yuz yilga kechikdik». Yo'lda davom etish.**
- The hidden Hollowness cost now shows in the meaning. RU: **А такие песни тихо не сидят. Чтобы ей поместиться, что-то твоё придётся выселить.** UZ: **Bunaqa qo'shiq jim yotmaydi. U sig'ishi uchun seniki bo'lgan nimadir chiqib ketishi kerak.**

## 15. Line · Hollow ending (it had the calque STYLE.md uses as its example)

- RU before: Ты стоишь, где стоял, и не помнишь, куда шёл. Кто-то протягивает тебе пиалу. Ты берёшь и кланяешься. Так делают все.
- RU after: **Стоишь посреди улицы и не помнишь, куда шёл. Кто-то протягивает тебе пиалу. Ты берёшь и кланяешься. Так делают все.**
- UZ before: Turgan joyingda turibsan, qayoqqa ketayotganingni eslamaysan…
- UZ after: **Ko'cha o'rtasida turibsan, qayoqqa ketayotganingni eslamaysan. Kimdir senga bir kosa choy uzatadi. Olasan va ta'zim qilasan. Hamma shunday qiladi.**

## 16. Line · Tale ending: "you feel told"

- RU before: …Пустее ты себя не чувствуешь. Ты чувствуешь, что тебя рассказали.
- RU after: **Её голос выходит из тебя, как пар изо рта холодным утром, и уходит в песню. Пустее ты не стал. Тебя просто рассказали.**
- UZ before: …O'zingni bo'shroq his qilmaysan. O'zingni aytib berilgandek his qilasan.
- UZ after: **Uning ovozi sovuq tongdagi nafasdek sendan chiqib, qo'shiqqa qo'shiladi. O'zingni bo'shab qolgandek his qilmaysan. Seni shunchaki aytib berishdi.**

## 17. Line · Tale ending: "you lose nothing" (kept true now that the hub names the cost)

- EN after: **Nothing is taken from you. The tale stays with you, and with him, and with her, and with everyone who heard it.**
- RU before: Ты ничего не теряешь. Сказание остаётся и у тебя, и у него, и у неё. Так было до основателей.
- RU after: **У тебя ничего не забрали. Сказание осталось и у тебя, и у него, и у неё — и у всех, кто его слышал. Так было до основателей.**
- UZ before: Hech narsa yo'qotmaysan. Doston senda ham, Obi Hayotda ham, Nargizada ham qoladi…
- UZ after: **Sendan hech narsa olinmadi. Doston senda ham, unda ham, Nargizada ham — eshitgan hammada qoldi. Asoschilardan oldin shunday bo'lgan.**

## 18. Epilogue · Oydin (New Tithe, Sado given to her)

- RU before: Ойдин выпели первой. Забрали всё, кроме того, что дал ей ты: маленький голос, который всё ещё считает звёзды. Теперь он считает за двоих.
- RU after: **(unchanged; it already read naturally)**
- UZ before: Oydinni birinchi bo'lib kuylab bo'shatishdi. Sen bergan narsadan boshqa hammasini olishdi: hali ham yulduz sanaydigan kichkina ovozni. Endi u ikkovi uchun sanaydi.
- UZ after: **Oydinni birinchi bo'lib kuylab bo'shatishdi. Hammasini olishdi, faqat sen bergan narsa qoldi: hali ham yulduz sanaydigan kichkina ovoz. Endi u ikkovi uchun sanaydi.**

## 19. Epilogue · the Tail (Awakening)

- RU before: Хвост, свернувшийся ниже всех, первым пришёл в движение. Его люди умели терять всё…
- RU after: **Хвост лежал ниже всех и почуял первым. Его люди умели терять всё. Они выбрались первыми — и вытащили за собой Арк.**
- UZ before: Uning orqasida eng pastda yotgan Dum birinchi qimirladi. Uning odamlari hamma narsani yo'qotishni bilardi…
- UZ after: **Dum eng pastda yotardi va birinchi sezdi. Uning odamlari hamma narsadan ayrilishni bilardi. Ular birinchi chiqishdi — Arkni ham ortidan tortib chiqarishdi.**

## 20. Epilogue · Bahodir (killed)

- RU before: Баходир лежит в Арке под золотым камнем. Его верность была посажена, а могила — куплена.
- RU after: **Баходир лежит в Арке под золотым камнем. Верность ему посадили, могилу купили.**
- UZ before: Bahodir Arkda oltin tosh ostida yotibdi. Sadoqati ekilgan edi. Qabri esa sotib olingan.
- UZ after: **Bahodir Arkda oltin tosh ostida yotibdi. Sadoqatini ekishgan, qabrini sotib olishgan.**

## 21. Epilogue · Farrukh (New Tithe)

- RU before: Фаррух отлично нажился на Новой десятине. Он пьёт за тебя в Арке и говорит это искренне. Это в нём хуже всего.
- RU after: **Фаррух отлично нажился на Новой десятине. Он пьёт за тебя в Арке и говорит это от души. Хуже в нём ничего нет.**
- UZ before: Farrux Yangi ushrdan yaxshigina boyidi. U Arkda sen uchun qadah ko'taradi va chin dildan aytadi. Undagi eng yomon narsa shu.
- UZ after: **Farrux Yangi ushrdan yaxshigina foyda ko'rdi. Arkda sen uchun qadah ko'taradi va buni chin dildan qiladi. Undagi eng yomon narsa shu.**

## 22. Epilogue · Ravshan (Hollow)

- RU before: Ты стал одним из тех, кого сам опустошал. Ты ходишь старым маршрутом десятины с пустым тумаром…
- RU after: **Ты стал одним из тех, кого сам опустошал. Ходишь старой дорогой десятины с пустым тумаром и стучишь в двери, где больше нечего взять.**
- UZ before: …Eski ushr yo'lidan bo'sh tumar bilan yurasan…
- UZ after: **Sen o'zing bo'shatgan odamlardan biriga aylanding. Eski ushr yo'lidan bo'sh tumar ko'tarib yurasan va olinadigan hech narsa qolmagan eshiklarni taqillatasan.**

## 23. Epilogue · the Great Tithe term (every slide that names it)

- UZ before: Katta ushr (14 places in v2)
- UZ after: **Buyuk ushr** (the Act I and II term for the Great Tithe). Likewise **Kichik Uyg'onish**, **Yettov** (in dialogue), **Bilib olding:** (journal prefix) and **daftar** for the debt book, all as in Acts I and II. RU: **Малое Пробуждение** (capital П, as in Acts I and II), **Год Песка**, **Башня молчания**.

## 24. Line · Farrukh on the Divan's chain and the Well (new lines that argue the other side)

- RU after: **С другой стороны, Хвосту больше никогда не платить десятину. Платить будет он — водой. Не худшее предложение в городе.**
- UZ after: **Boshqa tomondan, Dum endi hech qachon ushr to'lamaydi. Endi suv bilan Uxlovchining o'zi to'laydi. Shahardagi eng yomon taklif emas bu.**
- And for the Well. RU: **Хотя сто лет без толчков — это сто лет, когда ничей дом не съезжает в песок. Ширин всё посчитала. И у неё сходится. Вот что страшно.** UZ: **Lekin yuz yil zilzilasiz — demak, yuz yil hech kimning uyi qumga sirg'alib ketmaydi. Shirin hammasini hisoblab chiqqan. Hisobi to'g'ri chiqadi. Qo'rqinchlisi ham shu.**

## 25. Lock reasons (taleMissing): no numbers

- EN before: Too little of you is left to tell anything (Hollowness 60+).
- EN after: **There's too little of you left to tell anything.**
- RU before: От тебя осталось слишком мало, чтобы что-то рассказать (Пустота 60+).
- RU after: **От тебя осталось слишком мало — рассказывать уже некому.**
- UZ before: Biror narsa aytish uchun sendan juda oz narsa qoldi (Bo'shliq 60+).
- UZ after: **Sendan juda oz narsa qoldi — aytib beradigan odamning o'zi yo'q.**
- Also: RU **«Тебе нечего рассказать ему от себя. Ты так и не дал себе вспомнить Ойдин.»** / UZ **«Unga o'zingdan aytadigan hikoyang yo'q. Oydinni eslashdan o'zing qochding.»** (before: «…eslashga o'zingga yo'l qo'ymading», a calque).

---

## Uzbek choices to check
- **Buyuk ushr** for the Great Tithe everywhere (v2 Act III had *Katta ushr*). It now matches Acts I and II.
- **kishan / kishanlamoq** for "chain" as a verb or state ("Uni kishanlasam-chi?", "kishansiz") and **zanjir** for the chain as an object and in the title *DEVON ZANJIRI*. This is the same split Act II used.
- **doston** for the Tale (ending, Sado's fate, Turab's old tales) and **ertak** where it means "a tale is given, a story you tell kids" (Turab's no-tales line, Sado's "Ertakni esa har kim o'zicha aytadi"). Please confirm that the mix sounds natural.
- **oshiq-moshig'i hamon g'ichirlab kuylaydi** (the singing hinge of the blue gate, clue 3 paid off in the House). It uses the Act I word.
- **«Uyga qayt, Oydin»** as Ravshan's line for "remember her". An alternative is «Qaytib kel, Oydin».
- **nonning chekkasi** for the crust Oydin liked (m_bread and Ravshan's line to Oydin in the finale). v2 had *qirrasi*.
- **Rostakamiga**, **Shalabbo**, **Bo'm-bo'sh** are colloquial on purpose (Sado and narration).
- Ravshan uses **siz** with Rustam aka and with the bride. Rustam, Mehri and Oydin use **sen** with him.

## Russian choices to check
- Full-line choice labels end with the period inside the quotes («…воды.»). Mixed labels (a quote and then an action) put the period outside («Я пройду с вами». Взять её за руку.). This follows the Act II convention.
- **Жеребёночек** (Act II) for Toychoq in Sado's line after Rustam's last word.
- **песня основателей** replaces v2's «песня цепи» throughout (as in Act II). The addVoid reason reads «песня основателей».
- **тилла** declined as feminine («настоящей тиллой»), as in Acts I and II.
- Ravshan addresses Rustam as **вы** («Я вас прощаю, ака»). In v2 he used «ты».
