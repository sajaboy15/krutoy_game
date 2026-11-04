/* Yodgor v2 — languages: English (source), Russian, Uzbek (Latin).
   - Engine text is drawn through window.__T (build-time hooks in the text functions).
     Engine literals are Russian; they are translated by the UI table below.
   - Game-layer text is written as one string with three parts: t(`English|Русский|O'zbekcha`).
     N(`...`) registers such a string as engine content (item, enemy, land names) and returns
     the English part; the draw hook then shows it in the current language. */
(function () {
  'use strict';
  const G = window.G = window.G || {};
  const LKEY = 'yodgor2_lang';
  const LANGS = ['en', 'ru', 'uz'];
  const NAMES = { en: 'English', ru: 'Русский', uz: "O'zbekcha" };
  let lang = 'en';
  try { const v = localStorage.getItem(LKEY); if (LANGS.includes(v)) lang = v; } catch (e) { /* default */ }

  /* ---------- engine interface: Russian literal → [English, Uzbek, corrected Russian?] ---------- */
  const UI = {
    'Лепёшка': ['Flatbread', 'Non'], 'Самса': ['Samsa', 'Somsa'], 'Плов': ['Plov', 'Palov'],
    'Здоровье полное': ['Health is full', "Sog'lig'ing to'liq"],
    'Батыр': ['Batyr', 'Botir'], 'Мерген': ['Mergen', 'Mergan'], 'Тулпар': ['Tulpar', 'Tulpor'],
    'Основное': ['Main', 'Asosiy'], 'Второе': ['Second', 'Ikkinchi'],
    'Навык 1': ['Skill 1', 'Mahorat 1'], 'Навык 2': ['Skill 2', 'Mahorat 2'],
    'Отмена': ['Cancel', 'Bekor qilish'], 'Перезарядка': ['Cooldown', 'Tiklanish'],
    'Ещё не время!': ['Not yet!', 'Hali emas!'],
    'Воды не осталось': ['No water left', 'Suv qolmadi'],
    'Дальше': ['Onward', 'Oldinga'], 'Войти в врата': ['Enter the gate', 'Darvozadan kirish', 'Войти во врата'],
    'Открыть сундук': ['Open the chest', 'Sandiqni ochish'], 'Свиток силы': ['Scroll of Power', 'Kuch bitigi'],
    'Коснуться памяти': ['Touch the memory', 'Xotiraga tegish'],
    'Выпить чаю (вода и здоровье)': ['Drink tea (water and health)', "Choy ichish (suv va sog'liq)"],
    'Силы восстановлены. Фляги наполнены водой.': ['Your strength is back. Your flasks are full.', "Kuching tiklandi, idishlaring suvga to'ldi.", 'Силы вернулись. Фляги полны воды.'],
    'Песня бахши': ["The bakhshi's song", "Baxshi qo'shig'i"],
    'Говорить с Рустамом-ака': ['Talk to Rustam-aka', 'Rustam aka bilan gaplashish'],
    'Не хватает тилла': ['Not enough tilla', 'Tilla yetmaydi'],
    'Камень молчит.': ['The stone is silent.', 'Tosh jim.'],
    'Камень памяти': ['Memory stone', 'Xotira toshi'],
    'Дорога ведёт дальше…': ['The road goes on…', "Yo'l davom etadi…"],
    'пробит!': ['broken!', 'sindi!'], 'ЯРОСТЬ': ['FURY', "G'AZAB"],
    'Скрытый удар!': ['Hidden strike!', 'Yashirin zarba!'], 'Ярость!': ['Fury!', "G'azab!"],
    'Сила рук и ярость сердца.': ['Strength of arm, fury of heart.', "Bilak kuchi, yurak g'azabi."],
    '+6% урона красного оружия': ['+6% red weapon damage', 'Qizil qurollar zarari +6%'],
    '+10 к максимальному здоровью': ['+10 max health', "Sog'liq chegarasi +10"],
    'Меткий глаз степного охотника.': ['The sharp eye of a steppe hunter.', "Dasht ovchisining o'tkir ko'zi."],
    '+6% урона фиолетового оружия': ['+6% purple weapon damage', 'Binafsha qurollar zarari +6%'],
    'Выносливость крылатого коня.': ['The stamina of a winged horse.', 'Qanotli otning chidami.'],
    '+6% урона зелёного оружия': ['+6% green weapon damage', 'Yashil qurollar zarari +6%'],
    '+22 к максимальному здоровью': ['+22 max health', "Sog'liq chegarasi +22"],
    'Движение': ['Move', 'Harakat'], 'Стик': ['Stick', 'Stik'],
    'Прыжок, двойной прыжок': ['Jump, double jump', "Sakrash, qo'sh sakrash"],
    'Основное оружие': ['Main weapon', 'Asosiy qurol'], 'J / ЛКМ': ['J / LMB', 'J / LMB'],
    'Второе оружие, щит': ['Second weapon, shield', 'Ikkinchi qurol, qalqon'], 'K / ПКМ': ['K / RMB', 'K / RMB'],
    'Перекат': ['Roll', 'Dumalash'], 'Навыки': ['Skills', 'Mahoratlar'],
    'Выпить воды': ['Drink water', 'Suv ichish'], 'Взаимодействие': ['Interact', 'Amal'],
    'Удар о землю': ['Ground slam', 'Yerga zarba'], '↓ + ПРОБЕЛ': ['↓ + SPACE', '↓ + SPACE'],
    'Спрыгнуть вниз': ['Drop down', 'Pastga tushish'], 'Карта': ['Map', 'Xarita'], 'Пауза': ['Pause', 'Pauza'],
    'Инвентарь': ['Inventory', 'Inventar'], 'Персонаж, атрибуты': ['Character, attributes', 'Qahramon, xususiyatlar'], 'Навыки ёдчи': ['Yodchi skills', 'Yodchi mahoratlari'],
    'Спутники': ['Companions', 'Hamrohlar'], 'Журнал': ['Journal', 'Kundalik'], 'Стойка спутников': ["Companions' stance", 'Hamrohlar holati'],
    'Приказ Алпу, Наргизе, Сурайё': ['Order Alp, Nargiza, Surayyo', 'Alp, Nargiza, Surayyoga buyruq'], 'Крюк': ['Hook', 'Ilgak'],
    'Садо приглушает свет': ['Sado dims her light', 'Sado nurini pasaytiradi'], 'Сбросить графику': ['Reset graphics', 'Grafikani tiklash'],
    'Во весь экран': ['Full screen', "To'liq ekran"], 'Стр. 1/2  ← →': ['Page 1/2  ← →', '1/2-bet  ← →'], 'Стр. 2/2  ← →': ['Page 2/2  ← →', '2/2-bet  ← →'],
    'Управление': ['Controls', 'Boshqaruv'], 'Клавиатура': ['Keyboard', 'Klaviatura'], 'Геймпад': ['Gamepad', 'Geympad'],
    'Назад': ['Back', 'Orqaga'], 'Выкл': ['Off', "O'chiq"], 'Слабая': ['Low', 'Kuchsiz'], 'Полная': ['Full', "To'liq"],
    'Музыка': ['Music', 'Musiqa'], 'Звуки': ['Sounds', 'Tovushlar'], 'Тряска экрана': ['Screen shake', 'Ekran silkinishi'],
    'Вспышки': ['Flashes', 'Chaqnashlar'], 'Мини-карта': ['Minimap', 'Mini-xarita'], 'Настройки': ['Settings', 'Sozlamalar'],
    'Вкл': ['On', 'Yoqiq'], 'Изменить': ['Change', "O'zgartirish"],
    'Новый поход': ['New journey', 'Yangi safar'], 'Об игре': ['About', "O'yin haqida"],
    'Ближний бой': ['Melee', 'Yaqin jang'], 'Лук': ['Bow', 'Kamon'], 'Щит': ['Shield', 'Qalqon'],
    'Навык': ['Skill', 'Mahorat'], 'Метательное': ['Thrown', 'Otiladigan'],
    'Урон': ['Damage', 'Zarar'], 'Блок': ['Block', "To'sish"], 'Контрудар': ['Riposte', 'Qarshi zarba'],
    'с': ['s', 's'], 'Оружие': ['Weapon', 'Qurol'], 'Взять': ['Take', 'Olish'],
    'Продолжить': ['Continue', 'Davom etish'], 'Покинуть поход': ['Leave the journey', 'Safarni tark etish'],
    'В главное меню': ['Main menu', 'Bosh menyu'],
    'ЁДГОР': ['YODGOR', 'YODGOR'], 'ГОРОД НА СПЯЩЕМ ДЭВЕ': ['THE CITY ON A SLEEPING DIV', 'UXLAYOTGAN DEV USTIDAGI SHAHAR'],
    'Выбор': ['Choose', 'Tanlash'], 'Подтвердить': ['Confirm', 'Tasdiqlash'], 'Выбери путь': ['Choose your road', "Yo'lingni tanla"],
    'В путь': ['Set out', "Yo'lga"], 'Босс': ['Boss', 'Boss'], 'Купить': ['Buy', 'Sotib olish'], 'Закрыть': ['Close', 'Yopish'],
    'ТЫ ПАЛ': ['YOU FELL', 'YIQILDING'],
    'Время': ['Time', 'Vaqt'], 'Убито': ['Slain', "O'ldirilgan"], 'Тилла': ['Tilla', 'Tilla'], 'Место': ['Place', 'Joy'],
    'Итоги похода': ['Journey summary', 'Safar yakuni'], 'Смертей': ['Deaths', "O'limlar"], 'Режим': ['Mode', 'Rejim'],
    'Спасибо, что прошли путь ёдчи до конца.': ["Thank you for walking the yodchi's road to the end.", "Yodchi yo'lini oxirigacha bosib o'tganingiz uchun rahmat."],
    'Пропустить': ['Skip', "O'tkazib yuborish"], 'Уровень': ['Level', 'Daraja'],
    'Лечит 15% здоровья': ['Heals 15% health', "Sog'liqni 15% tiklaydi"], 'Усилит:': ['Boosts:', 'Kuchaytiradi:'],
    'Новый предмет': ['New item', 'Yangi buyum'], 'Заменить:': ['Replace:', 'Almashtirish:'], 'Принять': ['Accept', 'Qabul qilish'],
    'Привал': ['Rest', 'Dam olish'], 'Свитки': ['Scrolls', 'Bitiklar'], 'Песни': ['Songs', "Qo'shiqlar"],
    'Пока нет. Найди бахши в чайхане.': ['None yet. Find the bakhshi in a chaikhana.', "Hali yo'q. Choyxonada baxshini top."],
    'Вернуться': ['Return', 'Qaytish'], 'Покинуть поход?': ['Leave the journey?', 'Safarni tark etasanmi?'],
    'Продолжить можно будет с начала этой земли.': ['You can continue from the start of this land.', "Shu yerning boshidan davom ettirish mumkin bo'ladi."],
    'Остаться': ['Stay', 'Qolish'], 'Покинуть': ['Leave', 'Tark etish'], 'Далее': ['Next', 'Keyingi'],
    'Ты пал.': ['You fell.', 'Yiqilding.'], 'Встать снова': ['Rise again', 'Yana turish'],
    'ПРИВАЛ': ['REST', 'DAM OLISH'], 'ЛОГОВО': ['LAIR', 'UYA'],
    'Ты пал... [J] заново': ['You fell… [J] to rise', 'Yiqilding… [J] — yana turish', 'Ты пал… [J] — встать'],
    'Пустота': ['Hollowness', "Bo'shliq"], 'Сохранить': ['Save', 'Saqlash'], 'Прокачка': ['Skill trees', 'Rivojlanish', 'Развитие'], 'СОН ОКОНЧЕН': ['THE DREAM IS OVER', 'TUSH TUGADI'], 'Пленник': ['Captive', 'Asir']
  };

  /* ---------- engine strings built from parts: prefix + name ---------- */
  const PAT = [
    [/^Съесть: (.+)$/, ['Eat: $1', 'Съесть: $1', 'Yeyish: $1']],
    [/^Взять: (.+)$/, ['Take: $1', 'Взять: $1', 'Olish: $1']],
    [/^Получено: (.+)$/, ['Received: $1', 'Получено: $1', 'Olindi: $1']],
    [/^Заменить на «(.+)»$/, ['Swap for "$1"', 'Заменить на «$1»', '«$1» bilan almashtirish']],
    [/^вместо «(.+)»$/, ['instead of "$1"', 'вместо «$1»', "«$1» o'rniga"]],
    [/^Купить «(.+)» — (\d+) тилла$/, ['Buy "$1" — $2 tilla', 'Купить «$1» — $2 тилла', '«$1» sotib olish — $2 tilla']],
    [/^Купить плов — (\d+) тилла$/, ['Buy plov — $1 tilla', 'Купить плов — $1 тилла', 'Palov sotib olish — $1 tilla']],
    [/^(\d+(?:\.\d+)?) с$/, ['$1 s', '$1 с', '$1 s']],
    [/^Заменить на «(.+)»\?$/, ['Swap for "$1"?', 'Заменить на «$1»?', '«$1» bilan almashtirilsinmi?']],
    [/^(.+?) ([+−-]\d+)$/, ['$1 $2', '$1 $2', '$1 $2']],
    [/^(\D+?) (\d+)$/, ['$1 $2', '$1 $2', '$1 $2']]
  ];

  // Content registered by the game layer: English → [Russian, Uzbek]
  const CONTENT = Object.create(null);
  const LI = { en: 0, ru: 1, uz: 2 };

  let memo = new Map(); // per-language cache of results, also for misses
  const MEMO_MAX = 6000;

  function raw(s) {
    if (lang === 'en') { const u = UI[s]; return u ? u[0] : undefined; }
    if (lang === 'uz') { const u = UI[s]; if (u) return u[1]; const c = CONTENT[s]; return c ? c[1] : undefined; }
    const f = UI[s]; if (f && f[2]) return f[2]; // ru: a corrected engine literal
    const c = CONTENT[s]; return c ? c[0] : undefined; // ru: engine literals are already Russian
  }
  // upper-case titles (boss cards, stage labels) are drawn from upper-cased names
  let upper = null, upperLang = null;
  function upperKey(s) {
    if (upperLang !== lang || !upper) {
      upper = new Map(); upperLang = lang;
      const src = lang === 'en' ? Object.keys(UI) : lang === 'ru' ? Object.keys(CONTENT) : Object.keys(UI).concat(Object.keys(CONTENT));
      for (const k of src) upper.set(k.toUpperCase(), k);
    }
    return upper.get(s);
  }
  function tr(s, depth) {
    const r = raw(s);
    if (r !== undefined) return r;
    if (s.length > 2 && s === s.toUpperCase() && s !== s.toLowerCase()) {
      const k = upperKey(s);
      if (k !== undefined) { const v = raw(k); if (v !== undefined) return v.toUpperCase(); }
    }
    if (depth > 2 || s.length < 3) return s;
    if (s.indexOf('  ·  ') > 0) return s.split('  ·  ').map(x => tr(x, depth + 1)).join('  ·  ');
    for (const [re, out] of PAT) {
      const m = re.exec(s);
      if (m) return out[LI[lang]].replace(/\$(\d)/g, (_, i) => tr(m[+i], depth + 1));
    }
    return s;
  }
  function T(s) {
    if (typeof s !== 'string' || !s) return s;
    let r = memo.get(s);
    if (r !== undefined) return r;
    r = tr(s, 0);
    if (memo.size > MEMO_MAX) memo = new Map();
    memo.set(s, r);
    return r;
  }
  window.__T = T;

  /* ---------- three-language strings ---------- */
  const split = new Map();
  function parts(s) {
    let p = split.get(s);
    if (!p) {
      p = String(s).split('|');
      if (p.length === 1) p = [p[0], p[0], p[0]]; // already resolved text
      else if (p.length !== 3) { console.warn('[i18n] need 3 parts:', s); while (p.length < 3) p.push(p[0]); }
      split.set(s, p);
    }
    return p;
  }
  const t = s => (s == null ? s : parts(s)[LI[lang]]);
  function N(s) {
    const p = parts(s);
    if (!(p[0] in CONTENT)) { CONTENT[p[0]] = [p[1], p[2]]; upper = null; }
    else if (CONTENT[p[0]][0] !== p[1] || CONTENT[p[0]][1] !== p[2]) { CONTENT[p[0]] = [p[1], p[2]]; memo = new Map(); }
    return p[0];
  }
  // t with simple {name} substitution
  const tf = (s, vars) => t(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? String(vars[k]) : m));

  const listeners = [];
  function set(l) {
    if (!LANGS.includes(l) || l === lang) return;
    lang = l;
    memo = new Map();
    try { localStorage.setItem(LKEY, l); } catch (e) { /* ignore */ }
    try { document.documentElement.lang = l; } catch (e) { /* ignore */ }
    for (const f of listeners) { try { f(l); } catch (e) { console.error('[i18n]', e); } }
  }
  const cycle = () => set(LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length]);
  try { document.documentElement.lang = lang; } catch (e) { /* ignore */ }

  G.LANG = {
    get lang() { return lang; }, LANGS, NAMES, set, cycle, t, tf, N, T,
    onChange(f) { listeners.push(f); },
    _ui: UI, _content: CONTENT
  };
})();
