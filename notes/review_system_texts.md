# Yodgor — text pass outside the acts: review sheet (w4)

Files: 20_modes, 30_hud, 60_world, 62_balance, 64_progress, 65_boss_seven, 66_character, 67_items, 68_inventory_ui, 95–99, src/i18n.js. 40_sado.js, 10_portraits.js and 61–63 art files have no player-facing strings (Sado's barks live in 70_act1.js).

What changed across the board:
- **One address form.** RU item/skill texts mixed «вы» (Раскрутите, Держите) and «ты»; now «ты» everywhere, like the story. UZ mixed «-ing/-siz» (oting, ushlab turing) and «sen»; now «sen» everywhere.
- **Story terms.** UZ **tumor → tumar** (about 70 places; the acts use only *tumar*). UZ stun is **gangitadi / gangigan** (was a mix with *esankiratadi*). **Xonaqoh** for the Cloister (was *Ibodatxona*). **Sokin xor** for the Silent Choir (60 had *Jim xor*). **Oltin It / Золотой Пёс** for Bahodir (60 and the epilogue had *Zarhal It / Позолоченный Пёс*). **Korizlar onasi / Мать кяризов**, **Ялмогиз-кампир**, **Год Песка**, **Yag'rindagi qadamjo**, **Uxlovchining dahshatli tushi**, **Tungi Dum**: all now match the act files. RU **Перезарядка** for cooldown (was a mix with «Откат»). Craft verb: EN **Taste** (was *Drink*), RU **испить / Проба**, UZ **totish** (was *ichish*).
- **No engine leaks.** Set bonuses printed flag names to the player: «(флаг divanPeace)», «(проверка «lockpick»)», «(flags sadoBright, allaTwice)». Removed in all three languages.
- **Spoiler rule.** The perk *Apricot stones* said "A child hid them under a loose board" — that is clue 12, the House reveal, available from any bakhshi in Act I. Rewritten to a neutral line (below). The `mask` protection in 64_progress.js is untouched.
- **Duplicates fixed.** RU «Тумар ученика» was both a weapon and a charm (now «Тумар подмастерья» / «Тумар школяра»; UZ *Shogird tumari* / *Tolib tumari*). UZ tabs *Charms* and *Tumars* were both «Tumorlar».
- **i18n.js.** The UI table now takes an optional third entry, a corrected Russian engine literal. Used for «Войти в врата» → «Войти во врата», «Силы восстановлены. Фляги наполнены водой.» → «Силы вернулись. Фляги полны воды.», «Ты пал... [J] заново» → «Ты пал… [J] — встать», «Прокачка» → «Развитие». Engine keys are unchanged.

## 25 before → after

| # | where | before | after |
|---|---|---|---|
| 1 | perk *Apricot stones* (60) | EN A child hid them under a loose board. / RU Ребёнок прятал их под расшатанной доской. / UZ Bola ularni qimirlaydigan taxta ostiga yashirgan. | EN Dry apricot stones that rattle in a pocket, kept for luck. / RU **Сухие абрикосовые косточки гремят в кармане — на счастье.** / UZ **Cho'ntakda shaqillaydigan quruq o'rik danaklari — omad uchun.** (spoiler, clue 12) |
| 2 | mode Pilgrim (20) RU | После гибели — снова в начале земли. Песня забирает воспоминание. | **Умер — начинаешь землю сначала. Песня забирает одно воспоминание.** |
| 3 | mode Pilgrim (20) UZ | O'lsang — yer boshiga qaytasan. | **O'lsang, shu yerning boshiga qaytasan. Qo'shiq bitta xotirangni oladi.** |
| 4 | mode tag (20) | Выбери тяжесть / Og'irlikni tanla | **Тяжесть — на выбор / Og'irligini o'zing tanla** |
| 5 | difficulty (20) UZ | O'rtacha — mo'ljallangandek (calque) | **O'rtacha — asl og'irlikda** |
| 6 | Oath (20) RU | Смерть возвращает в ту же землю, какой она была. | **После смерти земля встречает тебя такой же, какой была.** |
| 7 | set bonus Divan (67) | +20% равновесия; стражи Дивана не нападают (флаг divanPeace) | **+20% к равновесию; стража Дивана тебя не трогает** / UZ **Devon soqchilari senga tegmaydi** |
| 8 | set bonus Smuggler (67) | Взлом +2 (проверка «lockpick»); нырки дольше (флаг longDive) | **Взлом замков +2; под водой дольше задерживаешь дыхание** / UZ **Qulf ochish +2; suv ostida nafasingni uzoqroq ushlaysan** |
| 9 | respec button (68) | Испить выучку заново / Mashqni qaytadan ichish ("drink your training") | **Переучиться / Qayta o'rganish** (EN *Unlearn*) |
| 10 | shield (60) RU | Держите, чтобы блокировать; поднимите в миг удара — парирование… | **Держи — блок; подними в миг удара — парирование: оглушает, отражает снаряды и бьёт волной.** |
| 11 | shield (60) UZ | Gardishiga onaning tumari tikilgan… Ushlab turing — to'sadi; zarba payti ko'taring… | **O'rtasiga onaning tumari tikilgan dumaloq qalqon. Ushlab tursang — to'sadi; zarba payti ko'tarsang — qaytaradi…** (*gardish* is the rim, the tumar is on the boss) |
| 12 | Karez axe (60/67) | EN Cut the tunnels, now cuts men. / RU Рубил тоннели, теперь рубит людей. | EN It dug the tunnels; now it cuts men. / RU **Им рыли кяризы, теперь им рубят людей.** / UZ **U bilan koriz qazishgan, endi odam chopishadi.** |
| 13 | Cloister doira (67) | EN Played only at the great tithe. / RU …в великую десятину / UZ Faqat katta ushrda… | EN Played only on the Night of Payment. / RU **На ней играют только в Ночь Уплаты. От её звона забывает даже воздух.** / UZ **Faqat To'lov kechasida chalinadi. Jarangidan havo ham unutadi.** (the Great Tithe has not happened yet in the story) |
| 14 | material Salt (67) UZ | …sho'rva va tumorlar uchun (*sho'rva* is soup) | **…sho'rob va tumarlar uchun** |
| 15 | belt of picks (67) UZ | Shaqildoqli kamar (*shaqildoq* is a rattle) | **Ochqichlar kamari** |
| 16 | Habit of the round (64) UZ | Aylanish odati ("habit of spinning") | **Yo'l odati** / RU **Привычка обхода** |
| 17 | Sleeper's backbone (64) UZ | Uxlovchining umurtqasi (anatomy, see STYLE) | **Uxlovchidek bardosh** |
| 18 | skill *Someone else's memory* (64) RU | Испить со свежего трупа: … Откат 30 с. | **Испиваешь то, что осталось в свежем мертвеце: 30 с носишь его свойство (…). Пустота +1. Перезарядка 30 с.** |
| 19 | Sado on learning a node (64) | Это… будто знакомо. / Bu… tanishdek. · Voy! Men buni qila olamanmi? | **Как будто… знакомо. / Qandaydir… tanish.** · **Voy! Men shunaqa qila olarkanmanmi?** |
| 20 | Sado saves you (64) UZ | Hali emas! Tur! · Ushlab turibman. Nafas ol. | **Hali erta! Tur!** · **Ushlab oldim. Nafas ol.** |
| 21 | drunk-memory toast (67) RU | Тебя наполняет чужая {k} (3 мин). — breaks with «лёгкий шаг» (m.) | **В тебе чужое: {k} (3 мин).** / UZ **Birovning {k}i endi sende (3 daq.)** |
| 22 | Bahodir in epilogue (99) / 60 | Баходир, Позолоченный Пёс / Bahodir, Zarhal It | **Баходир, Золотой Пёс / Bahodir, Oltin It** (as in Act I) |
| 23 | Choir hall (60) UZ | Jim xor zali | **Sokin xor zali** (as in Act I) |
| 24 | weapon class weak/strong (68) RU | Сильна: … / Слаба: … (fem. for neuter «оружие») | **Сильные стороны: … / Слабые стороны: …** / UZ **Kuchli tomoni / Zaif tomoni** |
| 25 | Hollowness scale (68) | Мир теряет цвет; люди замечают. · Голос Садо трещит. · Пока ещё ты сам. | **Мир теряет цвета; люди это замечают. · Голос Садо прерывается. · Ты пока ещё ты.** / UZ **Dunyo rangsizlanadi; odamlar buni sezadi. · Sadoning ovozi uzilib-uzilib chiqyapti.** |

## Suggested fixes in files I must not touch

**00_base.js** (not in my list, not locked)
- `{who} will remember this.|{who}: это не забудут.|…` → RU **«{who} это запомнят.»** (the colon form reads like a log line).

**82_world_places.js / 84_world_regions.js / 80_world_core.js** (open world, in flux)
- `Search the cache|Осмотреть тайник|Yashirinni ko'rish` → UZ **Yashirin joyni tintish** (same string fixed in 66).
- `The auction, or a quest|Аукцион или квест|…` → RU **Торги — или поручение**; UZ **Kimoshdi savdosi yoki topshiriq** (already fine).
- `The Spine, act II|Хребет, акт II|Umurtqa, II qism` → RU **Хребет, второй акт**.
- `The Open City (preview)|Открытый город (превью)|Ochiq shahar (sinov)` → RU **(пробная версия)**.
- `The Surface|Поверхность|Sirt` → UZ **Yer yuzi**; `The Heights|Высоты|Yuksakliklar` → UZ **Tepalar**; `The Depths|Глубина|Tub` → UZ **Tublar** or **Chuqurlik**.
- `Bought at the night market|Куплена на тайном рынке|…` and `The secret market opens after dark|…тайный рынок` → use one name: RU **Ночной рынок** (67 now says *Night market / Ночной рынок / Tungi bozor*).
- `The Buried Streets|Погребённые улицы|Ko'milgan ko'chalar` and `The sluice to the Buried Streets|…` → the acts call them **The Swallowed Streets / Проглоченные улицы / Yutilgan ko'chalar**.
- `The Tower of Silence|Башня Молчания|…` → RU **Башня молчания** (lower-case м, as in the acts).
- `The Rabat and the Salt Road|Рабат и Соляной тракт|…` → RU **Соляная дорога** (acts and 60).
- `Chaikhana by the Salt Well|Чайхана у соляного колодца|Tuz qudug'i yonidagi choyxona` → as in Act I: **Чайхана у солёного колодца / Sho'r quduq choyxonasi**.
- `The Smugglers' Den|…|Kontrabandachilar inisi` → UZ **Kontrabandachilar ini** (Act II).
- `Lanterns over the roofs of the poor|Фонари над крышами бедняков|…uzra chiroqlar` → match 60: **Фонари над крышами бедноты / Kambag'allar tomlari ustida chiroqlar**.
- `Strength restored, the flask is full. The journey is saved.|…|Kuch qaytdi, meshing to'la…` → UZ **Kuching qaytdi, idishing to'la. Safar saqlandi.** (the rest of the UI calls the flask *idish*).
- `Travel: no other chaikhana found yet|Перейти: другие чайханы ещё не найдены|Yo'l: …` → RU **Перейти некуда: других чайхан ты ещё не нашёл.**

**Acts (70–72), UZ only** — *Xumo* appears in some Uzbek lines (e.g. Bahodir's title «Xumo xonadonining pahlavoni»); the standard Uzbek spelling is **Humo** (Ҳумо), which the acts also use elsewhere. Choose one.

## Words for the author to check
- RU **тилла with numbers** stays indeclinable in UI («нужно {n} тилла», «Продать за {n} тилла»), like a currency unit, because {n} can be any number. Outside numbers it is declined («Половина тиллы пропадает», «Тиллы находишь на 50% больше»), as in the acts.
- RU **исрык** for *isiriq* (wild rue): «Дым исрыка». The alternative is «исирик» or «адраспан».
- RU **Мечник-наёмник Дивана** (Divan sell-sword) and **Вожак** (skill *Commander*).
- RU **Переучиться** for the respec button; **вставка** for a socketed stone/wax mod («Вставка на месте»).
- UZ **qadama** for a socketed stone/wax (inlay). If it sounds too craft-specific, *ko'z* is the alternative.
- UZ **idish** for the water flask everywhere (the open-world files use *mesh* once).
- UZ **Tolib tumari** (Pupil's tumar) next to **Shogird tumari** (Apprentice's tumar).
- UZ **Ko'zmunchoqlar** in "For tumars and charms" → «Tumarlar va ko'zmunchoqlar uchun».
- UZ **Oq qalpoqlilar qalqoni** (White-cap shield): «white caps» as a nickname for the Singers' guards.
- UZ **Tomdan-tomga** (perk *Roof-runner*) and **Tom chopar kavushi** (Roof-runner's shoes).
- UZ the Act label in Sado's tree: **Ikkinchi qismda ochiladi** (the chapter cards in 90_wire.js say *II QISM*).
