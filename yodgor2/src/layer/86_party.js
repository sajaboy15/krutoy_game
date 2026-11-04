/* =====================================================================
   Companions (GDD ch. 7, 12, 18) — stage 7a: the systems.
   Alp (the Shield), Nargiza (the Voice), Surayyo (the Mirab).
   This file: data (roles, three branches × 5 nodes + a key node, the
   commanded skill), the party state in R().party, the API for writers
   (G.PARTY), approval with its hidden thresholds, gear, and how the
   world answers a party: more enemies, more aggression, a third of them
   turning on the companions, companions dealing 25–35% of the hero's
   damage each. The actors live in 87_party_ai.js, the HUD, the stance
   wheel and the companion pages in 88_party_ui.js.
   Nothing here places a companion in the story: writers call
   G.PARTY.join(id). Test hook: ?party=alp,nargiza,surayyo
   ===================================================================== */
{
  const PX = {};                       // shared between 86–88
  const IDS = ['alp', 'nargiza', 'surayyo'];
  const MAX_ACTIVE = 3;                // + Ravshan = a party of four
  const fr = () => G.frame || 0;
  const pl = () => (G.world && G.world.player) || null;

  /* ================================================================ who they are */
  const STANCES = ['attack', 'defend', 'range', 'silent'];
  const STANCE_NAME = { attack: `Attack|Атака|Hujum`, defend: `Defend|Защита|Himoya`, range: `Keep distance|Держать дистанцию|Masofa saqlash`, silent: `Silent|Тишина|Jimlik` };
  const STANCE_DESC = {
    attack: `Fight freely.|Бьются в полную силу.|Bor kuchi bilan urishadi.`,
    defend: `Stay close and cover you.|Держатся рядом и прикрывают.|Yoningda turib, seni himoya qilishadi.`,
    range: `Keep away from blows; skills and songs only.|Не лезут под удары: только приёмы и песни.|Zarba ostiga kirmaydi: faqat usullar va qo'shiqlar.`,
    silent: `Do not fight. Enemies do not notice them.|Не вступают в бой. Враги их не замечают.|Jangga kirmaydi. Dushmanlar ularni sezmaydi.`
  };
  const DEF = {
    alp: {
      name: `Alp|Алп|Alp`, g: 'm', look: 'alp', portrait: 'alp', col: '#d8cfc0', key: 'Digit1', keyN: '1',
      role: `Shield · holds the front|Щит · держит фронт|Qalqon · oldingi saf`,
      w: 13, h: 27, speed: 1.45, hpK: 1.55, share: 0.29, eff: 1.08, period: 66, armor: 0.3, poise: 0.75, jump: 1.0,
      cats: ['shield', 'staff'], weaponName: `cudgel|дубина|to'qmoq`,
      skill: { id: 'call', name: `Over here!|Ко мне!|Menga!`, cd: 30, desc: `Slams the ground: enemies nearby are stunned and turn on him.|Бьёт оземь: враги рядом оглушены и бросаются на него.|Yerga uradi: yaqindagi dushmanlar gangib, unga tashlanadi.` },
      branches: [
        { id: 'wall', name: `Wall|Стена|Devor`, col: '#c9b48a', nodes: [
          ['cover', `Cover|Заслон|To'siq`, `Takes a quarter of the blows aimed at you while he stands close.|Принимает на себя четверть ударов по тебе, пока стоит рядом.|Yaqin tursa, senga qaratilgan zarbalarning choragini o'ziga oladi.`],
          ['provoke', `Provocation|Провокация|Ig'vo`, `Calls enemies to himself more often and from farther away.|Чаще и издалека зовёт врагов на себя.|Dushmanlarni tez-tez va uzoqdan o'ziga chaqiradi.`],
          ['stand', `Standing firm|Стойка|Mustahkam turish`, `Takes 20% less damage while he holds his ground or blocks.|Получает на 20% меньше урона, пока стоит на месте или держит блок.|Joyida turganda yoki to'sganda 20% kam zarar oladi.`],
          ['rise', `Getting up|Подъём|O'rnidan turish`, `Once per land, gets back on his feet by himself.|Раз за землю встаёт сам.|Har bir yerda bir marta o'zi turib ketadi.`],
          ['shelter', `Shelter for the children|Укрытие для детей|Bolalar panohi`, `Allies behind his back take 15% less damage.|Те, кто за его спиной, получают на 15% меньше урона.|Uning orqasidagilar 15% kam zarar oladi.`],
          ['k_wall', `You shall not pass|Не пройдёшь|O'tolmaysan`, `His order also raises a wall: for 4 s nothing gets past him.|Его приказ ещё и ставит стену: 4 с мимо него никто не пройдёт.|Buyrug'i devor ham bo'ladi: 4 soniya undan hech kim o'tolmaydi.`, 'key_wall']
        ] },
        { id: 'fury', name: `Fury|Ярость|G'azab`, col: '#e07a5a', nodes: [
          ['ram', `Ram|Таран|Taran`, `Charges into a crowd and knocks enemies back.|Врезается в толпу и отбрасывает врагов.|To'daga yorib kirib, dushmanlarni uloqtiradi.`],
          ['crush', `Crushing blow|Сокрушение|Ezib urish`, `His slam stuns 50% longer and hits 20% harder.|Его удар оземь оглушает на 50% дольше и бьёт на 20% сильнее.|Yerga urishi 50% uzoqroq gangitadi va 20% kuchliroq.`],
          ['toss', `Toss|Подбросить|Otib yuborish`, `Heavy blows throw light enemies into the air.|Тяжёлые удары подбрасывают лёгких врагов.|Og'ir zarbalar yengil dushmanlarni havoga otadi.`],
          ['rage', `Rage of wounds|Ярость от ран|Yara g'azabi`, `The more he bleeds, the harder he hits: up to +40%.|Чем больше ран, тем сильнее бьёт: до +40%.|Qancha ko'p yaralansa, shuncha qattiq uradi: +40% gacha.`],
          ['boulder', `Boulder|Бросок валуна|Xarsang otish`, `Throws a stone at archers and singers he cannot reach.|Бросает камень в лучников и певцов, до которых не дотянуться.|Yetib bo'lmaydigan kamonchi va xonandalarga tosh otadi.`],
          ['k_captain', `The Captain|Капитан|Kapitan`, `His order becomes the five-blow series he once used to break caravans.|Приказ превращается в серию из пяти ударов, которой он когда-то ломал караваны.|Buyrug'i u bir vaqtlar karvonlarni yanchgan besh zarbalik seriyaga aylanadi.`, 'key_captain']
        ] },
        { id: 'nameless', name: `The Nameless|Безымянный|Ismsiz`, col: '#a8a49a', nodes: [
          ['forget', `Strength of forgetting|Сила забвения|Unutish kuchi`, `While his memory is not back, he hits 15% harder.|Пока память не вернулась, бьёт на 15% сильнее.|Xotirasi qaytmaguncha 15% kuchliroq uradi.`],
          ['immune', `Untouched by oblivion|Неуязвимость к забвению|Unutishga daxlsiz`, `Stuns and slowing do not hold him.|Оглушение и замедление его не берут.|Gangitish ham, sekinlatish ham unga ta'sir qilmaydi.`],
          ['dread', `Dread|Страх врагов|Dahshat`, `His slam makes weak enemies flee for a moment.|Его удар оземь ненадолго обращает слабых врагов в бегство.|Yerga urishi kuchsiz dushmanlarni bir zum qochiradi.`],
          ['gaze', `Empty gaze|Пустой взгляд|Bo'sh nigoh`, `His blows sometimes leave an enemy dazed and lost.|Его удары иногда сбивают врага с толку.|Zarbalari ba'zan dushmanni esankiratib qo'yadi.`],
          ['pain', `Another's pain|Чужая боль|Birovning og'rig'i`, `When an ally is hurt nearby, his next blow is 50% stronger.|Когда рядом ранят своего, его следующий удар на 50% сильнее.|Yonida o'zinikini yaralashsa, keyingi zarbasi 50% kuchliroq.`],
          ['k_hollow', `Hollow giant|Пустой великан|Bo'sh pahlavon`, `+30% health, 15% less damage taken. Only if he stays Hollow.|+30% здоровья, на 15% меньше урона. Только если он останется Пустым.|+30% sog'liq, 15% kam zarar. Faqat u Bo'sh bo'lib qolsa.`, 'outcome_hollow']
        ] }
      ]
    },
    nargiza: {
      name: `Nargiza|Наргиза|Nargiza`, g: 'f', look: 'nargiza', portrait: 'nargiza', col: '#8ff6ef', key: 'Digit2', keyN: '2',
      role: `Voice · heals and stuns|Голос · лечит и оглушает|Ovoz · davolaydi, gangitadi`,
      w: 10, h: 24, speed: 1.9, hpK: 0.78, share: 0.27, eff: 1.05, period: 100, armor: 0.05, poise: 0.1, jump: 1.05,
      cats: ['dutar'], weaponName: `dutar|дутар|dutor`,
      skill: { id: 'waves', name: `Song of waves|Песня волн|To'lqinlar qo'shig'i`, cd: 25, desc: `A ring of sound: hurts, stuns and blinds; through water it hits harder.|Кольцо звука: ранит, оглушает и ослепляет; по воде бьёт сильнее.|Tovush halqasi: yaralaydi, gangitadi, ko'r qiladi; suv orqali kuchliroq uradi.` },
      branches: [
        { id: 'lullaby', name: `Lullaby|Колыбельная|Beshik qo'shig'i`, col: '#9cf0c0', nodes: [
          ['heal', `Healing song|Лечащая песня|Shifo qo'shig'i`, `Her healing song mends 40% more.|Её лечащая песня лечит на 40% сильнее.|Shifo qo'shig'i 40% ko'proq davolaydi.`],
          ['vshield', `Shield of the voice|Щит голоса|Ovoz qalqoni`, `Those she heals get a ward that soaks up a blow.|Тех, кого она лечит, ненадолго закрывает щит: он гасит удар.|U davolaganlarni bir zarbani yutadigan qalqon to'sadi.`],
          ['sleep', `Sleep|Сон|Uyqu`, `Her stunning song puts weak enemies to sleep for 3 s.|Её оглушающая песня усыпляет слабых врагов на 3 с.|Gangituvchi qo'shig'i kuchsiz dushmanlarni 3 soniya uxlatadi.`],
          ['cleanse', `Cleansing|Очищение|Poklash`, `The healing song also washes off burning, poison and bleeding.|Лечащая песня снимает горение, яд и кровотечение.|Shifo qo'shig'i kuyish, zahar va qon ketishini ham ketkazadi.`],
          ['farraise', `Calling back|Подъём издалека|Uzoqdan turg'izish`, `She can raise a fallen friend with a song from afar.|Может поднять павшего песней издалека.|Yiqilgan do'stni uzoqdan qo'shiq bilan turg'iza oladi.`],
          ['k_alla', `Alla|Алла|Alla`, `Once per land the group lives through a deadly blow.|Раз за землю группа переживает смертельный удар.|Har bir yerda guruh bir marta o'limli zarbadan omon qoladi.`, 'key_alla']
        ] },
        { id: 'cry', name: `Cry|Крик|Hayqiriq`, col: '#8ff6ef', nodes: [
          ['wave', `Sound wave|Звуковая волна|Tovush to'lqini`, `Her waves hit 25% harder.|Её волны бьют на 25% сильнее.|To'lqinlari 25% kuchliroq uradi.`],
          ['burst', `Rupture|Разрыв|Yorilish`, `A wave bursts on impact and hurts everyone close.|Волна разрывается при попадании и задевает всех рядом.|To'lqin tekkanda yorilib, yaqindagilarning hammasiga tegadi.`],
          ['interrupt', `Break the cast|Сбить каст|Afsunni buzish`, `Her wave breaks an enemy's wind-up.|Её волна сбивает врагу замах.|To'lqini dushmanning siltanishini buzadi.`],
          ['echo', `Echo|Эхо|Aks-sado`, `Each wave sounds a second time, half as strong.|Каждая волна звучит ещё раз, вполсилы.|Har bir to'lqin yana bir bor, yarim kuch bilan yangraydi.`],
          ['reson', `Resonance with water|Резонанс с водой|Suv bilan hamohang`, `Song through water hits twice as hard, not half again.|Песня по воде бьёт вдвое, а не в полтора раза сильнее.|Suv orqali qo'shiq bir yarim emas, ikki baravar kuchli uradi.`],
          ['k_ustoz', `Voice of the Ustoz|Голос Устоз|Ustoz ovozi`, `What Shirin taught her, turned on the enemy: her order blinds everyone around.|То, чему учила Ширин, обращено против врагов: её приказ ослепляет всех вокруг.|Shirin o'rgatgani endi dushmanga qarshi: buyrug'i atrofdagilarning hammasini ko'r qiladi.`, 'key_ustoz']
        ] },
        { id: 'hearing', name: `The Sleeper's hearing|Слух Спящего|Uxlovchining eshitishi`, col: '#c9b4ff', nodes: [
          ['warn', `Warning|Предупреждение|Ogohlantirish`, `She hears a boss's blow before the swing and calls out.|Слышит удар босса до замаха и подаёт голос.|Boss zarbasini siltanishdan oldin eshitib, ovoz beradi.`],
          ['hidden', `Sees the hidden|Видит скрытое|Yashiringanni ko'radi`, `Hidden caches and lost memories glow when she is near.|Тайники и потерянные воспоминания светятся, когда она рядом.|U yaqin bo'lsa, yashirin joylar va yo'qolgan xotiralar yaltiraydi.`],
          ['weak', `Weak points|Слабые места|Zaif joylar`, `Enemies her song touches take 10% more damage for 4 s.|Враги, которых коснулась её песня, 4 с получают на 10% больше урона.|Qo'shig'i tekkan dushmanlar 4 soniya 10% ko'proq zarar oladi.`],
          ['hints', `Hints|Подсказки|Ishoralar`, `In investigations she points to what you missed.|В расследованиях подсказывает, что ты упустил.|Tergovlarda sen e'tibordan chetda qoldirganni ko'rsatadi.`],
          ['whisper', `Sado's whisper|Шёпот Садо|Sado shivirlashi`, `She almost hears Sado. Sometimes she answers her.|Она почти слышит Садо. Иногда отвечает ей.|U Sadoni deyarli eshitadi. Ba'zan unga javob beradi.`],
          ['k_voice', `The Sleeper's voice|Голос Спящего|Uxlovchining ovozi`, `While she sings, bosses wind up 20% longer. Only if she believed the voice.|Пока она поёт, боссы замахиваются на 20% дольше. Только если она поверила голосу.|U kuylayotganda bosslar 20% uzoqroq siltanadi. Faqat u ovozga ishongan bo'lsa.`, 'believed']
        ] }
      ]
    },
    surayyo: {
      name: `Surayyo|Сурайё|Surayyo`, g: 'f', look: 'surayyo', portrait: 'surayyo', col: '#8fd0ff', key: 'Digit3', keyN: '3',
      role: `Mirab · hook and water|Мираб · крюк и вода|Mirob · ilgak va suv`,
      w: 10, h: 24, speed: 2.0, hpK: 1.0, share: 0.31, eff: 1.2, period: 56, armor: 0.12, poise: 0.3, jump: 1.1,
      cats: ['staff'], weaponName: `hook-staff|крюк мираба|mirob ilgagi`,
      skill: { id: 'sluice', name: `Open the sluice|Открыть шлюз|Shlyuzni ochish`, cd: 22, desc: `A wave of water both ways: knocks enemies back, slows them and puts out fire.|Волна воды в обе стороны: отбрасывает и замедляет врагов, тушит огонь.|Ikki tomonga suv to'lqini: dushmanlarni uloqtiradi, sekinlatadi, olovni o'chiradi.` },
      branches: [
        { id: 'hook', name: `Hook|Крюк|Ilgak`, col: '#b8c4d0', nodes: [
          ['trip', `Trip|Подсечка|Chalish`, `Her sweep keeps enemies down longer, even elites.|Её подсечка валит надолго, даже элиту.|Chalishi uzoqroq yiqitadi, saralarni ham.`],
          ['pull', `Pull|Притянуть|Tortish`, `The hook reaches 40% farther and is ready sooner.|Крюк летит на 40% дальше и готов быстрее.|Ilgak 40% uzoqqa yetadi va tezroq tayyor bo'ladi.`],
          ['drop', `Drop from a height|Сбросить с высоты|Balanddan tashlash`, `Enemies she pulls down land hard.|Стянутые ею враги тяжело падают.|U tortib tushirgan dushmanlar qattiq yiqiladi.`],
          ['spin', `Staff spin|Вращение древка|Dastani aylantirish`, `When surrounded, she spins the staff and hits everyone close.|Когда её окружают, раскручивает древко и бьёт всех рядом.|Qurshab olishsa, dastani aylantirib, yaqindagilarning hammasini uradi.`],
          ['strike', `Sluice strike|Удар по шлюзу|Shlyuzga zarba`, `Her order also brings water crashing down on the enemies.|Её приказ ещё и обрушивает воду на врагов.|Buyrug'i dushmanlar ustiga suv ham to'kadi.`],
          ['k_sluices', `Open all the sluices|Открыть все шлюзы|Hamma shlyuzlarni ochish`, `Her order becomes a flood: the weak are washed away, the strong knocked down.|Приказ становится потопом: слабых смывает, сильных сбивает с ног.|Buyrug'i toshqinga aylanadi: kuchsizlarni oqizib ketadi, kuchlilarni yiqitadi.`, 'key_sluices']
        ] },
        { id: 'water', name: `Water|Вода|Suv`, col: '#8fd0ff', nodes: [
          ['puddle', `Puddle|Лужа|Ko'lmak`, `Her puddles are wider and slow for longer.|Её лужи шире и дольше замедляют.|Ko'lmaklari kengroq va uzoqroq sekinlatadi.`],
          ['wwall', `Wall of water|Водяная стена|Suv devori`, `When arrows fly at you, she raises water that stops them.|Когда в тебя летят стрелы, она поднимает воду, и та их гасит.|Senga o'q uchsa, suv ko'tarib, ularni to'xtatadi.`],
          ['douse', `Put it out|Потушить|O'chirish`, `Every time she pours, the group stops burning.|Каждый раз, когда она льёт воду, группа перестаёт гореть.|Har gal suv quyganda guruhdagi olov o'chadi.`],
          ['current', `Current|Течение|Oqim`, `Her puddles push enemies away from you.|Её лужи сносят врагов прочь от тебя.|Ko'lmaklari dushmanlarni sendan nariga suradi.`],
          ['conduct', `Carrier of song|Проводник песни|Qo'shiq o'tkazgichi`, `Nargiza's song through her water hits 50% harder still.|Песня Наргизы по её воде бьёт ещё на 50% сильнее.|Nargizaning qo'shig'i uning suvi orqali yana 50% kuchliroq uradi.`],
          ['k_life', `Water of life|Вода жизни|Obi hayot`, `Her order also brings a healing rain over the group. Only if she knows the name Obi-Hayot.|Её приказ проливает над группой ещё и целебный дождь. Только если она знает имя Оби-Хаёт.|Buyrug'i guruh ustiga shifobaxsh yomg'ir ham yog'diradi. Faqat u Obi-Hayot ismini bilsa.`, 'knows_obi']
        ] },
        { id: 'mahalla', name: `Mahalla|Махалля|Mahalla`, col: '#e8c070', nodes: [
          ['feed', `Feeding everyone|Накормить|Hammani to'ydirish`, `Your flasks heal 20% more.|Твои отвары лечат на 20% сильнее.|Damlamalaring 20% ko'proq davolaydi.`],
          ['ours', `Our people|Свои люди|O'zimizniki`, `In the Tail, neighbours throw stones at your enemies.|В Хвосте соседи кидают в твоих врагов камни.|Dumda qo'shnilar dushmanlaringga tosh otadi.`],
          ['shoulder', `A shoulder|Плечо|Yelka`, `With her near, the fallen get up faster and stronger.|Когда она рядом, павшие встают быстрее и крепче.|U yaqin bo'lsa, yiqilganlar tezroq va baquvvatroq turadi.`],
          ['laugh', `Laughter|Смех|Kulgi`, `Her laugh shakes stuns and slowing off the group.|Её смех стряхивает с группы оглушение и замедление.|Kulgisi guruhdan gangish va sekinlikni silkitib tashlaydi.`],
          ['stubborn', `Stubbornness|Упрямство|O'jarlik`, `The first deadly blow in a land does not bring her down.|Первый смертельный удар за землю её не валит.|Har bir yerdagi birinchi o'limli zarba uni yiqitmaydi.`],
          ['k_tail', `For the Tail|За Хвост|Dum uchun`, `While she stands, the group takes 20% less damage.|Пока она на ногах, группа получает на 20% меньше урона.|U oyoqda ekan, guruh 20% kam zarar oladi.`, 'key_tail']
        ] }
      ]
    }
  };
  // flat node index: 'alp.cover' -> { comp, br, i, key, flag }
  const NODE = {};
  for (const id of IDS) DEF[id].branches.forEach((b, bi) => b.nodes.forEach((n, i) => { NODE[id + '.' + n[0]] = { comp: id, br: bi, i, id: n[0], name: n[1], desc: n[2], key: i === 5, flag: n[3] || null }; }));
  const KEY_NEED = 3;          // points spent in the branch before its key node (plus the story flag)
  const KEY_LOCK = {
    alp: `Opens with his story.|Откроется по ходу его истории.|Uning hikoyasi bilan ochiladi.`,
    nargiza: `Opens with her story.|Откроется по ходу её истории.|Uning hikoyasi bilan ochiladi.`,
    surayyo: `Opens with her story.|Откроется по ходу её истории.|Uning hikoyasi bilan ochiladi.`
  };

  /* ================================================================ state (inside the journey: saved with checkpoints and slots) */
  const blankMember = () => ({ joined: false, active: true, left: null, approval: 0, th: {}, flags: {}, stance: 'attack', nodes: {}, bonus: 0, gear: {}, hpF: 1, out: false, cd: 0, joinedAt: 0 });
  function P() {
    const r = R();
    if (!r.party || r.party.v !== 1) r.party = { v: 1, m: {}, order: [], url: false };
    for (const id of IDS) if (!r.party.m[id]) r.party.m[id] = blankMember();
    return r.party;
  }
  const M = id => (IDS.includes(id) ? P().m[id] : null);

  /* ================================================================ events for writers */
  const LIS = {};
  const emit = (ev, ...a) => {
    for (const f of LIS[ev] || []) { try { f(...a); } catch (e) { console.error('[party] ' + ev, e); } }
    try { G.Events.emit('party:' + ev, ...a); } catch (e) { /* ignore */ }
  };
  const nameOf = id => t(DEF[id].name);
  const gen = (id, m, f) => (DEF[id].g === 'f' ? f : m);

  /* ================================================================ the API */
  const PARTY = G.PARTY = {
    IDS, DEF, NODE, STANCES, STANCE_NAME, STANCE_DESC, MAX_ACTIVE, KEY_NEED,
    on(ev, fn) { (LIS[ev] || (LIS[ev] = [])).push(fn); return fn; },
    off(ev, fn) { const L = LIS[ev]; if (L) { const i = L.indexOf(fn); if (i >= 0) L.splice(i, 1); } },
    // writer hooks: hooks.leave = (id, reason, done) => { scene...; done(); } runs before an approval walk-out
    hooks: { leave: null },
    has: id => { const m = M(id); return !!(m && m.joined && !m.left); },
    member: id => M(id),
    // active companions (joined, walking with you), in join order
    active: () => P().order.filter(id => PARTY.has(id) && M(id).active),
    // those standing in the world right now (not downed, not out until rest)
    fighting: () => PX.actors().filter(c => !c.downed && !c.dead).map(c => c.id),
    actor: id => PX.actors().find(c => c.id === id) || null,
    join(id, o) {
      const m = M(id); if (!m) return false;
      if (m.joined && !m.left) return true;
      o = o || {};
      m.joined = true; m.left = null; m.out = false; m.hpF = 1; m.joinedAt = PI();
      const p = P(); if (!p.order.includes(id)) p.order.push(id);
      m.active = PARTY.active().filter(x => x !== id).length < MAX_ACTIVE;
      save();
      if (!o.quiet) { toast(tf(`{who} walks with you now.|{who} теперь идёт с тобой.|{who} endi sen bilan.`, { who: nameOf(id) }), DEF[id].col); sfx('ready'); }
      PX.spawn && PX.spawn(id);
      emit('join', id);
      return true;
    },
    leave(id, reason) {
      const m = M(id); if (!m || !m.joined || m.left) return false;
      m.left = reason || 'left'; m.active = false;
      const p = P(); p.order = p.order.filter(x => x !== id);
      save();
      PX.despawn && PX.despawn(id, 'leave');
      toast(tf(gen(id, `{who} has left.|{who} ушёл.|{who} ketdi.`, `{who} has left.|{who} ушла.|{who} ketdi.`), { who: nameOf(id) }), '#d9a0a0');
      emit('leave', id, m.left);
      return true;
    },
    // bench/unbench: joined but not walking with you (camp, cold truce)
    setActive(id, on) {
      const m = M(id); if (!m || !PARTY.has(id)) return false;
      if (on && !m.active && PARTY.active().length >= MAX_ACTIVE) return false;
      m.active = !!on; save();
      if (on) PX.spawn && PX.spawn(id); else PX.despawn && PX.despawn(id, 'bench');
      return true;
    },
    // approval: hidden −100…+100. approval(id) reads, approval(id, delta, reason) changes it.
    approval(id, delta, reason) {
      const m = M(id); if (!m) return 0;
      if (delta == null) return m.approval;
      const before = m.approval;
      m.approval = clamp(Math.round(before + delta), -100, 100);
      save();
      // the line "Alp will remember this" only on a strong reaction
      if (Math.abs(delta) >= 10 && PARTY.has(id)) toast(tf(`{who} will remember this.|{who} это запомнит.|{who} buni unutmaydi.`, { who: nameOf(id) }), delta > 0 ? C.trustUp : C.trustDown);
      emit('approval', id, m.approval, delta, reason || null);
      const cross = (kind, lim, up) => {
        const was = up ? before >= lim : before <= lim, now = up ? m.approval >= lim : m.approval <= lim;
        if (now && !was) { m.th[kind] = 1; save(); emit('threshold', id, kind, true, m.approval); return 1; }
        if (!now && was && kind !== 'leave') { m.th[kind] = 0; save(); emit('threshold', id, kind, false, m.approval); }
        return 0;
      };
      cross('talks', 40, true); cross('best', 70, true);
      if (cross('leave', -50, false) && PARTY.has(id)) {
        const go = () => PARTY.leave(id, 'approval');
        if (PARTY.hooks.leave) queue(() => true, () => scene(done => { try { PARTY.hooks.leave(id, 'approval', () => { go(); done(); }); } catch (e) { console.error(e); go(); done(); } }), 'party_leave_' + id);
        else go();
      }
      return m.approval;
    },
    // thresholds as booleans (personal talks and combo moves at +40, the best arc outcome at +70)
    talks: id => (M(id) ? M(id).approval >= 40 : false),
    best: id => (M(id) ? M(id).approval >= 70 : false),
    mood(id) {
      const a = M(id) ? M(id).approval : 0;
      return a >= 70 ? 'devoted' : a >= 40 ? 'warm' : a >= 10 ? 'friendly' : a > -20 ? 'guarded' : a > -50 ? 'cold' : 'leaving';
    },
    MOOD_NAME: { devoted: `Devoted|Всей душой с тобой|Sadoqatli`, warm: `Warm|Тепло к тебе|Iliq`, friendly: `Friendly|Дружелюбно|Do'stona`, guarded: `Guarded|Настороженно|Ehtiyotkor`, cold: `Cold|Холодно|Sovuq`, leaving: `About to leave|Вот-вот уйдёт|Ketish arafasida` },
    // story flags per companion; key nodes read them (see the report): flag(id, name) reads, flag(id, name, value) sets
    flag(id, name, value) {
      const m = M(id); if (!m) return undefined;
      if (value === undefined) return m.flags[name];
      m.flags[name] = value; save(); emit('flag', id, name, value);
      return value;
    },
    stance(id, value) {
      if (id && !IDS.includes(id)) { value = id; id = null; }
      if (value === undefined) return id ? M(id).stance : (PARTY.active()[0] ? M(PARTY.active()[0]).stance : 'attack');
      if (!STANCES.includes(value)) return null;
      for (const k of id ? [id] : IDS) M(k).stance = value;
      save(); emit('stance', id, value);
      return value;
    },
    // nodes
    rank: (id, node) => (M(id) && M(id).nodes[node] ? 1 : 0),
    node: (id, node) => PARTY.has(id) && PARTY.rank(id, node) > 0,
    points(id) { const m = M(id); if (!m) return 0; const lvl = G.CH && G.CH.ready && G.run ? G.CH.level() : 1; return Math.max(0, (lvl - 1) + (m.bonus || 0) - Object.keys(m.nodes).filter(k => m.nodes[k]).length); },
    givePoints(id, n) { const m = M(id); if (m) { m.bonus = (m.bonus || 0) + (n || 1); save(); } },
    branchPoints(id, bi) { const m = M(id); if (!m) return 0; return DEF[id].branches[bi].nodes.filter((n, i) => i < 5 && m.nodes[n[0]]).length; },
    whyNot(id, node) {
      const N2 = NODE[id + '.' + node]; if (!N2) return 'no node';
      const m = M(id);
      if (m.nodes[node]) return 'learned';
      if (PARTY.points(id) <= 0) return 'points';
      const have = PARTY.branchPoints(id, N2.br);
      if (N2.key) { if (have < KEY_NEED) return 'branch'; if (!m.flags[N2.flag]) return 'story'; return null; }
      if (have < N2.i) return 'order';
      return null;
    },
    learn(id, node) {
      if (PARTY.whyNot(id, node)) return false;
      M(id).nodes[node] = 1; save(); emit('learn', id, node);
      PX.refresh && PX.refresh(id);
      return true;
    },
    respec(id) { const m = M(id); if (m) { m.nodes = {}; save(); PX.refresh && PX.refresh(id); } },
    // the commanded skill (keys 1/2/3)
    command: id => (PX.command ? PX.command(id) : false),
    cooldown: id => { const c = PARTY.actor(id); return c ? Math.max(0, c.skillCD / 60) : 0; },
    // chaikhanas and rest stops call this: the fallen come back, everyone heals
    restAll() {
      const p = P();
      for (const id of IDS) { const m = p.m[id]; if (!m.joined || m.left) continue; m.out = false; m.hpF = 1; m.cd = 0; }
      save();
      PX.restActors && PX.restActors();
      emit('rest');
    },
    // gear: weapon (their category), armour (a body piece), one charm — entries of the hero's inventory by uid
    equip: (id, slot, u) => (PX.equip ? PX.equip(id, slot, u) : false),
    unequip: (id, slot) => (PX.equip ? PX.equip(id, slot, null) : false),
    gearOf: (id, slot) => (PX.gearEntry ? PX.gearEntry(id, slot) : null),
    // balance numbers (tests): damage dealt and taken since reset()
    stats: { hero: 0, taken: {}, dealt: {}, t0: 0 },
    resetStats() { PARTY.stats = { hero: 0, taken: {}, dealt: {}, t0: G.run ? G.run.time : 0, heals: 0, targets: {} }; },
    _px: PX
  };
  PARTY.resetStats();
  // onJoin(fn), onLeave, onApproval, onThreshold, onDowned, onRevived, onOut, onRest, onSkill, onLearn, onFlag, onStance
  for (const ev of ['join', 'leave', 'approval', 'threshold', 'downed', 'revived', 'out', 'rest', 'skill', 'learn', 'flag', 'stance', 'heal']) PARTY['on' + ev[0].toUpperCase() + ev.slice(1)] = fn => PARTY.on(ev, fn);
  Object.assign(PX, { IDS, DEF, NODE, P, M, emit, nameOf, gen, fr, pl, STANCES });

  /* ================================================================ who counts: companions in the field */
  PX.list = [];                                           // the actors in the current world (87)
  PX.actors = () => PX.list.filter(c => c.world === G.world && !c.gone);
  // companions that make the world answer (ch. 12): in the party, walking with you, not out until rest
  PX.K = () => (G.run && R().party ? PARTY.active().filter(id => !M(id).out).length : 0);
  PX.Kfield = () => PX.actors().filter(c => !c.downed).length;

  /* ================================================================ damage the hero would deal (ch. 18) */
  let dpsAt = -999, dpsV = 10;
  PX.heroDps = () => {
    if (fr() - dpsAt < 60) return dpsV;
    dpsAt = fr();
    let v = 10;
    try {
      const it = G.run && G.run.slots && G.run.slots.attack;
      if (it && it.def) {
        const d = it.def, c = d.combo;
        if (c && c.length) {
          let dm = 0, f = 0;
          for (const s of c) { dm += s.dmg || 10; f += (s.windup || 6) + (s.active || 4) + (s.recover || 12); }
          v = G.Combat.playerDmg(it, dm / c.length) / Math.max(8, f / c.length) * 60;
        } else v = G.Combat.playerDmg(it, d.boltDmg || d.dmg || 15) * 1.1;
      }
    } catch (e) { /* ignore */ }
    dpsV = Math.max(4, v);
    return dpsV;
  };
  // def.eff: each companion spends part of a fight moving, flanking, singing heals, hooking; eff makes up for that
  // time so the damage they actually deal lands at 25–35% of the hero's (measured: test/s7_balance.js share)
  PX.CAL = 1.0;

  /* ================================================================ how the world answers a party (ch. 12) */
  // +20% enemies per companion (an accumulator per land, so 1 companion = every fifth group member doubled)
  let acc = 0; PX.noScale = false; PX.extra = 0;
  const sp0 = G.Enemies.spawn;
  G.Enemies.spawn = function (id, x, y, o) {
    const e = sp0.apply(this, arguments);
    try {
      const K = PX.K();
      if (e && K > 0 && !PX.noScale && !e.isBoss && !(o && o.boss) && !e.bossOwner && G.run) {
        acc += 0.2 * K;
        while (acc >= 1) {
          acc -= 1;
          PX.noScale = true;
          try { const e2 = sp0.call(this, id, x + (Math.random() < 0.5 ? -1 : 1) * (10 + Math.random() * 14), y, Object.assign({}, o || {}, { elite: false })); if (e2) { e2._partyExtra = true; PX.extra++; } } finally { PX.noScale = false; }
        }
      }
    } catch (err) { console.error('[party] spawn', err); }
    return e;
  };
  if (G.Boss) {
    const mn0 = G.Boss.prototype.minion;
    G.Boss.prototype.minion = function () { const was = PX.noScale; PX.noScale = true; try { return mn0.apply(this, arguments); } finally { PX.noScale = was; } };
    // +10% aggression per companion: bosses rest less between attacks
    const rest0 = G.Boss.prototype.rest;
    G.Boss.prototype.rest = function () { const r = rest0.apply(this, arguments); const K = PX.K(); if (K > 0) this.atkCD = Math.round(this.atkCD / (1 + 0.1 * K)); return r; };
    // Nargiza's key node: bosses wind up longer while she sings
    const tele0 = G.Boss.prototype.tele;
    G.Boss.prototype.tele = function (n) {
      if (PARTY.node('nargiza', 'k_voice') && PX.up('nargiza')) n = Math.round(n * 1.2);
      const r = tele0.call(this, n);
      try { if (PARTY.node('nargiza', 'warn') && PX.up('nargiza')) PX.warn && PX.warn(this); } catch (e) { /* ignore */ }
      return r;
    };
  }
  // +10% aggression per companion: ordinary enemies' attack cooldowns run faster
  {
    const eu0 = G.Enemy.prototype.update;
    G.Enemy.prototype.update = function () {
      if (PX.agg > 0 && this.atkCD > 0 && !this.isBoss) this.atkCD = Math.max(0, this.atkCD - PX.agg);
      return eu0.apply(this, arguments);
    };
  }
  PX.agg = 0;
  // targeting: enemies may hunt a companion; Enemy#player is what every AI chases and hits
  {
    const desc = Object.getOwnPropertyDescriptor(G.Enemy.prototype, 'player');
    const get0 = desc && desc.get;
    Object.defineProperty(G.Enemy.prototype, 'player', {
      configurable: true,
      get() {
        const c = this._tgt;
        if (c && !c.dead && !c.downed && !c.gone && !c.untargetable && c.world === G.world) return c;
        return get0 ? get0.call(this) : G.world.player;
      }
    });
  }
  // enemy projectiles and blows meant for the hero's area also find companions
  {
    const pu0 = G.Projectile.prototype.update;
    G.Projectile.prototype.update = function () {
      const r = pu0.apply(this, arguments);
      if (!this.dead && this.faction === 'enemy' && PX.list.length) {
        const b = this.box();
        for (const c of PX.actors()) {
          if (c.downed || c.untargetable || this.hit.has(c) || !G.U.overlap(b, c.box())) continue;
          this.hit.add(c);
          c.takeHit(Object.assign({ dmg: this.dmg, kbx: this.kbx, kby: this.kby, dir: G.U.sign(this.vx) || 1, type: 'ranged', status: this.status, src: this.owner || this }, this.info || {}));
          if (this.onHit) { try { this.onHit(this, c); } catch (e) { /* ignore */ } }
          if (this.pierce-- <= 0) { this.die(); break; }
        }
      }
      return r;
    };
    const ar0 = G.Combat.area;
    G.Combat.area = function (src, box, opts, set) {
      const n = ar0.apply(this, arguments);
      try {
        if (src && src.faction === 'enemy' && PX.list.length) {
          for (const c of PX.actors()) {
            if (c.downed || c.untargetable || (set && set.has(c)) || !G.U.overlap(box, c.box())) continue;
            const o = typeof opts === 'function' ? opts(c) : Object.assign({}, opts);
            c.takeHit(Object.assign({ dir: G.U.sign(c.x - src.x) || 1 }, o, { src }));
            if (set) set.add(c);
          }
        }
      } catch (e) { console.error('[party] area', e); }
      return n;
    };
    const HZ = G.BossKit && G.BossKit.Hazard;
    if (HZ && HZ.prototype.hitBox) {
      const hb0 = HZ.prototype.hitBox;
      HZ.prototype.hitBox = function (box, o) {
        const r = hb0.apply(this, arguments);
        try {
          if (PX.list.length) {
            const hcd = this._pcd || (this._pcd = new Map());
            for (const c of PX.actors()) {
              if (c.downed || c.untargetable || (hcd.get(c) || 0) > fr() || !G.U.overlap(box, c.box())) continue;
              if (c.takeHit(Object.assign({ dmg: this.dmg, kbx: 3, kby: -3, dir: G.U.sign(c.x - this.x) || 1, type: 'trap', src: this }, o || {}))) hcd.set(c, fr() + (this.rehit || 9999));
            }
          }
        } catch (e) { /* ignore */ }
        return r;
      };
    }
  }

  /* ================================================================ the hero's damage (tests) and the hero's protections */
  {
    const hit0 = G.Combat.hit;
    G.Combat.hit = function (a, o, s) {
      const p = pl();
      if (p && a === p && o && o.kind === 'enemy') {
        const before = o.hp;
        // the combo of the commanded skill (approval ≥ +40): enemies it opened take +25% from the hero
        if (o._openT > fr() && s && s.dmg) s.dmg *= 1.25;
        if (o._weakT > fr() && s && s.dmg) s.dmg *= 1.1;
        const r = hit0.apply(this, arguments);
        if (r) { const d = Math.max(0, before - Math.max(0, o.hp)); PARTY.stats.hero += d; if (o.isBoss) { const B = PARTY.stats.boss || (PARTY.stats.boss = {}); B.hero = (B.hero || 0) + d; } }
        return r;
      }
      return hit0.apply(this, arguments);
    };
    // hero damage taken (tests)
    G.Events.on('playerHurt', (e, a) => { PARTY.stats.taken.hero = (PARTY.stats.taken.hero || 0) + (a || 0); PX.heroHurtF = fr(); });
  }
  PX.up = id => { const c = PARTY.actor(id); return !!(c && !c.downed); };
  // absorbs (66_character finalIn): For the Tail, shelter behind Alp, Alp's cover, the voice's ward
  G.CH.absorbs.push((dmg, info) => {
    if (!PX.list.length || !(dmg > 0)) return dmg;
    const p = pl(); if (!p) return dmg;
    if (PARTY.node('surayyo', 'k_tail') && PX.up('surayyo')) dmg *= 0.8;
    const alp = PARTY.actor('alp');
    if (alp && !alp.downed) {
      const src = info && info.src, near = Math.abs(alp.x - p.x) < 44 && Math.abs(alp.y - p.y) < 30;
      if (PARTY.node('alp', 'shelter') && src && near && G.U.sign(src.x - alp.x) === G.U.sign(alp.x - p.x)) dmg *= 0.85;
      if (PARTY.node('alp', 'cover') && near) { const part = dmg * 0.25; dmg -= part; alp.takeHit({ dmg: part, noFlinch: true, kbx: 0, kby: 0, type: 'cover', src: src || null, raw: true }); }
    }
    if (p._ward > 0) { const a = Math.min(p._ward, dmg); p._ward -= a; dmg -= a; if (a > 0) G.FX.ring(p.x, p.cy, 6, 18, '#8ff6ef', 12, { width: 1 }); }
    return dmg;
  });
  // Alla: once per land the group lives through a deadly blow
  G.CH.lethalSaves.push((dmg, info, p) => {
    if (!PARTY.node('nargiza', 'k_alla') || !PX.up('nargiza') || PX.land.alla) return null;
    PX.land.alla = 1;
    G.FX.text(p.x, p.top - 16, t(`Alla…|Алла…|Alla…`), '#8ff6ef', { size: 8 });
    G.FX.ring(p.x, p.cy, 6, 40, '#8ff6ef', 24, { width: 2 });
    return Math.max(0, p.hp - 1) / info.dmg;
  });
  // Surayyo's "Feeding everyone": the hero's flasks heal more
  {
    const mod0 = G.Perks.mod;
    G.Perks.mod = function (name, base) {
      let v = mod0.apply(this, arguments);
      if (name === 'heal' && PX.list.length && PARTY.node('surayyo', 'feed') && PX.up('surayyo')) v *= 1.2;
      return v;
    };
  }
  PX.land = {};

  /* ================================================================ gear (weapon of their category, a body armour piece, one charm) */
  const YI = () => G.YITEMS;
  const ID = () => G.Items.defs;
  PX.gearEntry = (id, slot) => {
    const m = M(id); if (!m || !m.gear[slot] || !YI()) return null;
    const e = YI().get(m.gear[slot]);
    if (!e) { m.gear[slot] = null; return null; }
    return e;
  };
  PX.fits = (id, slot, e) => {
    const d = e && ID()[e.id]; if (!d || !YI()) return false;
    const ty = YI().typeOf(e.id);
    if (slot === 'weapon') return ty === 'weapon' && !!(d.yd && DEF[id].cats.includes(d.yd.cat));
    if (slot === 'armour') return ty === 'armour' && d.yd && d.yd.slot === 'body';
    if (slot === 'charm') return ty === 'charm';
    return false;
  };
  PX.held = u => { for (const id of IDS) { const g = M(id).gear; for (const k in g) if (g[k] === u) return id; } return null; };
  PX.equip = (id, slot, u) => {
    const m = M(id); if (!m || !['weapon', 'armour', 'charm'].includes(slot)) return false;
    if (u == null) { m.gear[slot] = null; save(); PX.refresh && PX.refresh(id); return true; }
    const e = YI() && YI().get(u); if (!e || !PX.fits(id, slot, e)) return false;
    // one item, one owner: take it from the hero or another companion
    const hs = YI().equippedIn(u); if (hs) YI().unequip(hs);
    for (const k of IDS) { const g = M(k).gear; for (const s in g) if (g[s] === u) g[s] = null; }
    m.gear[slot] = u; save();
    PX.refresh && PX.refresh(id);
    sfx('pickup');
    return true;
  };
  // the hero putting on something a companion holds takes it back
  {
    const eq0 = G.YITEMS && G.YITEMS.equip;
    if (eq0) G.YITEMS.equip = function (u) { try { if (G.run && R().party) { const who = PX.held(u); if (who) for (const s in M(who).gear) if (M(who).gear[s] === u) { M(who).gear[s] = null; PX.refresh && PX.refresh(who); } } } catch (e) { /* ignore */ } return eq0.apply(this, arguments); };
  }
  // what the gear gives: damage ×(0.85…1.25), damage reduction, health
  const QK = [1, 1.08, 1.16, 1.25];
  PX.gearMods = id => {
    const out = { dmg: 0.88, armor: 0, hp: 1, res: {} };
    const w = PX.gearEntry(id, 'weapon');
    if (w) {
      const y = ID()[w.id].yd || {};
      // against the best model the hero could buy at this point of the journey
      const st = G.run ? G.run.stage : 0, exp = 1 + 0.35 * clamp(Math.floor(st / 2.1), 0, 4);
      out.dmg = clamp((y.power || 1) * QK[w.q || 0] * (1 + 0.08 * (w.up || 0)) / exp, 0.8, 1.3);
    }
    const a = PX.gearEntry(id, 'armour');
    if (a) { const y = ID()[a.id].yd || {}; const v = (y.armor || 0) * (1 + 0.1 * (a.q || 0)); out.armor = Math.min(0.45, v / (v + 100)); for (const k in y.res || {}) out.res[k] = y.res[k]; if (y.flat && y.flat.hp) out.hp += y.flat.hp / 200; }
    const ch = PX.gearEntry(id, 'charm');
    if (ch) { const y = ID()[ch.id].yd || {}; out.hp += 0.08; for (const k in y.res || {}) out.res[k] = Math.max(out.res[k] || 0, y.res[k]); if (y.flat && y.flat.hp) out.hp += y.flat.hp / 200; }
    return out;
  };

  /* ================================================================ land / rest / test hook */
  ON_STAGE.push((plan, biome, level) => {
    PX.land = {};
    acc = 0;
    if (!G.run || R().ended) return;
    // ?party=alp,nargiza,surayyo — join at load (testing in any stage; never the story)
    try {
      const q = new URLSearchParams(location.search).get('party');
      if (q && !P().url) { P().url = true; for (const id of q.split(',')) if (IDS.includes(id)) PARTY.join(id.trim(), { quiet: true }); }
    } catch (e) { /* ignore */ }
    if ((plan && plan.type === 'rest') || (level && level.isRest)) PARTY.restAll();
    PX.spawnAll && PX.spawnAll();
  });
  ON_NEWRUN.push(() => { PX.list.length = 0; });
  // the open world's chaikhanas (82_world_places W2.rest) rest the party too
  try { const W2 = G.WORLD2; if (W2 && W2.hooks && Array.isArray(W2.hooks.rest)) W2.hooks.rest.push(() => PARTY.restAll()); } catch (e) { /* ignore */ }
  PX.KEY_LOCK = KEY_LOCK;
}
