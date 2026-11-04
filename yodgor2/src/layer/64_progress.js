/* =====================================================================
   Two skill trees.
   THE YODCHI (GDD ch. 10) — three branches of twelve nodes in four tiers
   (a tier opens with 0 / 3 / 6 / 9 points spent in its branch):
     Collection · Взыскание · Hisob-kitob   — the fight
     Backbone   · Хребет    · Bardosh       — survival and tactics
     Forbidden Song · Запретная песнь · Yashirin navo — memory magic
   One point per level (G.CH). Active nodes give techniques for the skill
   slots (Q / E); the rest change numbers or behaviour through G.Perks.
   SADO — what the voice in his head can do. Her points come from the
   story; masked nodes never spoil her secret. Unchanged from before.
   The screens live in 68_inventory_ui.js; open with T.
   ===================================================================== */
const PROG = {};
{
  const pl = () => G.world && G.world.player;
  const now = () => G.time || 0;
  const crit = (v, info, p) => { if (info && !info.crit && Math.random() < p) info.crit = true; return v; };
  const T = () => (R().tree || (R().tree = { y: {}, s: {} }));
  const CHs = () => G.CH.S();
  const rkY = id => (G.run ? CHs().sk[id] || 0 : 0);
  const rkS = id => (T().s[id] || 0);
  const isBossT = tg => !!(tg && (tg.isBoss || tg.isBossPart || (tg.def && tg.def.boss)));
  const tmp = { breathUsed: false, fortyUsed: false, fortyUntil: -1, pullUsed: false };
  const X = G.ItemsExt;
  // what is the current swing? (melee hits happen inside the player's act)
  const swingOf = info => {
    const p = pl();
    if (!p || !p.act || !info || !info.item || p.act.item !== info.item) return null;
    return p.act.ws;
  };
  const isLight = info => { const ws = swingOf(info); return !!(ws && info.type === 'melee' && !ws.heavyMode); };
  const catOf = info => (info && info.item && info.item.def && info.item.def.yd ? info.item.def.yd.cat : null);
  const isMagic = info => !!(info && (info.magic || info.type === 'magic' || catOf(info) === 'focus' || catOf(info) === 'dutar'));
  const RANGED = new Set(['ranged']);

  /* ================================================================ the branches */
  const BRANCHES = [
    { key: 'collection', name: `Collection|Взыскание|Hisob-kitob`, sub: `weapons, damage, rhythm, finishing blows|оружие, урон, ритм, добивание|qurol, zarar, marom, so'nggi zarba`, col: '#f2c14a', dark: '#5a4220' },
    { key: 'backbone', name: `Backbone|Хребет|Bardosh`, sub: `health, stamina, the roll, survival|здоровье, выносливость, перекат, выживание|sog'liq, chidam, dumalash, omon qolish`, col: '#8fe0a0', dark: '#1f4a2c' },
    { key: 'song', name: `Forbidden Song|Запретная песнь|Yashirin navo`, sub: `burning memories, the dutar, tumars|сожжение воспоминаний, дутар, тумары|xotira yondirish, dutor, tumarlar`, col: '#c9b4ff', dark: '#3a2a5a' }
  ];
  const NEED = [0, 3, 6, 9];

  // node fields: id, br, tier, max, name, desc(rank), active (skill item id), mods, on
  const Y = [
    /* ---------------- Collection ---------------- */
    { id: 'c_hand', br: 0, tier: 0, max: 2, icon: 'hand', name: `Collector's hand|Рука взыскателя|Undiruvchi qo'li`,
      desc: `Light attacks deal +8% damage per rank.|Лёгкие удары: +8% урона за ранг.|Yengil zarbalar: har darajaga +8% zarar.`,
      mods: { dmgOut: (v, i, tg, r) => (isLight(i) ? v * (1 + 0.08 * r) : v) } },
    { id: 'c_knock', br: 0, tier: 0, max: 2, icon: 'knock', name: `Heavy knock|Тяжёлый стук|Qattiq taqillatish`,
      desc: `A charged blow (hold the attack) stuns ordinary enemies (0.8 s, +0.5 s per rank) and hits a boss's balance 25% harder per rank.|Заряженный удар (удерживай атаку) оглушает обычных врагов (0,8 с, +0,5 с за ранг), а по равновесию босса бьёт на 25% сильнее за ранг.|Zaryadlangan zarba (hujumni bosib tur) oddiy dushmanlarni gangitadi (0,8 s, har darajaga +0,5 s), boss muvozanatiga esa har darajaga 25% kuchliroq uradi.`,
      mods: { poiseOut: (v, i, tg, r) => (i && i.charged ? v * (1 + 0.25 * r) : v) } },
    { id: 'c_eye', br: 0, tier: 0, max: 2, icon: 'eye', name: `Steady eye|Меткий глаз|Mergan ko'z`,
      desc: `Slings, bows and crossbows: +10% damage and 15% faster draw per rank.|Праща, лук и самострел: +10% урона и натяжение на 15% быстрее за ранг.|Sopqon, kamon va arbalet: har darajaga +10% zarar va 15% tezroq tortish.`,
      mods: { dmgOut: (v, i, tg, r) => (RANGED.has(catOf(i)) ? v * (1 + 0.1 * r) : v), rangedSpeed: (v, a, b, r) => v * (1 + 0.15 * r) } },
    { id: 'c_count', br: 0, tier: 1, max: 1, icon: 'count', name: `Counting blows|Счёт ударов|Zarbalarni sanash`,
      desc: `Every fourth swing of a series deals +50% damage. A collector counts everything.|Каждый четвёртый удар серии наносит +50% урона. Сборщик считает всё.|Seriyadagi har to'rtinchi zarba +50% zarar beradi. Yig'uvchi hamma narsani sanaydi.`,
      mods: { dmgOut: (v, i) => { const ws = swingOf(i); return ws && ws.swings > 0 && ws.swings % 4 === 0 ? v * 1.5 : v; } } },
    { id: 'c_blood', br: 0, tier: 1, max: 2, icon: 'blood', name: `Blood for the debt|Кровь за долг|Qarz uchun qon`,
      desc: `Bleeding lasts 50% longer and builds up 25% faster per rank.|Кровотечение длится на 50% дольше и копится на 25% быстрее за ранг.|Qon ketishi har darajaga 50% uzoqroq davom etadi va 25% tezroq to'planadi.`,
      mods: { bleedDur: (v, a, b, r) => v * (1 + 0.5 * r), bleedBuild: (v, a, b, r) => v * (1 + 0.25 * r) } },
    { id: 'c_intercept', br: 0, tier: 1, max: 1, icon: 'parry', name: `Interception|Перехват|Ushlab qolish`,
      desc: `A parry opens the attacker: an ordinary enemy reels for 2.5 s, ready for a finishing blow; a boss loses its balance.|Парирование раскрывает врага: обычный шатается 2,5 с — бери его добиванием; босс теряет равновесие.|Qaytarish dushmanni ochib qo'yadi: oddiy dushman 2,5 s gandiraklab turadi — so'nggi zarbaga tayyor; boss muvozanatini yo'qotadi.`,
      on: { onParry: (r, info) => { const s = info && info.src; if (!s || s.dead || !s.isActor) return; if (isBossT(s)) BAL.breakBoss(s.isBossPart ? s.boss : s); else s.addStatus('stun', { t: 150 }); } } },
    { id: 'c_execute', br: 0, tier: 2, max: 1, icon: 'execute', name: `Finishing blow|Добивание|So'nggi zarba`,
      desc: `Strikes on a stunned, frozen or reeling enemy are executions: ×2.2 damage (×1.5 on an open boss) and 30 stamina back.|Удар по оглушённому, замёрзшему или шатающемуся врагу — казнь: урон ×2,2 (×1,5 по раскрытому боссу) и 30 выносливости назад.|Gangigan, muzlagan yoki gandiraklagan dushmanga zarba — qatl: zarar ×2,2 (ochilgan bossga ×1,5) va 30 chidam qaytadi.`,
      mods: { dmgOut: (v, i, tg) => {
        if (!tg || !i || i.type !== 'melee') return v;
        if (isBossT(tg)) { const b = tg.isBossPart ? tg.boss : tg; return b._open > 0 ? v * 1.5 : v; }
        if (tg.st && (tg.st.stun || tg.st.freeze)) { i.execute = true; G.CH.st.v = Math.min(G.CH.maxStam(), G.CH.st.v + 30); return v * 2.2; }
        return v;
      } } },
    { id: 'c_twin', br: 0, tier: 2, max: 1, icon: 'twin', name: `Two knives|Два ножа|Ikki pichoq`,
      desc: `With a knife in both weapon slots you strike with both hands: knives swing 25% faster and every cut builds bleeding.|С ножами в обоих слотах бьёшь обеими руками: ножи на 25% быстрее, каждый удар копит кровотечение.|Ikkala qurol uyasida pichoq bo'lsa, ikki qo'llab urasan: pichoqlar 25% tezroq, har zarba qon ketishini to'playdi.`,
      mods: { swingSpeed: (v, item) => (G.YITEMS && G.YITEMS.twinKnives() && item && item.def.yd && item.def.yd.cat === 'knife' ? v * 1.25 : v),
        bleedBuild: (v, info) => (G.YITEMS && G.YITEMS.twinKnives() && catOf(info) === 'knife' ? v + 12 : v) } },
    { id: 'c_volley', br: 0, tier: 2, max: 1, icon: 'volley', name: `Volley|Залп|Yoppasiga otish`,
      desc: `The sling throws three stones in a fan.|Праща мечет три камня веером.|Sopqon uchta toshni yelpig'ichdek otadi.`, mods: { slingVolley: v => v + 1 } },
    { id: 'c_debt', br: 0, tier: 3, max: 1, icon: 'debt', name: `The collector|Взыскатель|Undiruvchi`,
      desc: `Your first blow marks an enemy with a debt for 10 s. Marked enemies take +20% damage from everything.|Первый удар вешает на врага долг на 10 с. Должник получает +20% урона от всего.|Birinchi zarba dushmanga 10 s ga qarz belgisini qo'yadi. Qarzdor hamma narsadan +20% ko'proq zarar oladi.`,
      mods: { dmgOut: (v, i, tg) => { if (!tg || tg.dead) return v; const b = tg.isBossPart ? tg.boss : tg; if ((b._debt || 0) > now()) return v * 1.2; b._debt = now() + 10; return v; } } },
    { id: 'c_nothing', br: 0, tier: 3, max: 1, icon: 'nothing', name: `Nothing left owing|Без остатка|Qarz qolmadi`,
      desc: `A kill resets the cooldown of the technique that waits longest.|Убийство обнуляет перезарядку приёма, который ждёт дольше всех.|O'ldirish eng uzoq kutayotgan usulning tiklanishini nolga tushiradi.`,
      on: { onKill: () => { const s = G.run && G.run.slots; if (!s) return; let best = null; for (const k of ['skill1', 'skill2']) if (s[k] && s[k].cd > 0 && (!best || s[k].cd > best.cd)) best = s[k]; if (best) { best.cd = 0; sfx('ready'); } } } },
    { id: 'c_last', br: 0, tier: 3, max: 1, key: true, icon: 'last', active: 'ys_lastknock', name: `KEY: The last knock|КЛЮЧ: «Последний стук»|KALIT: «So'nggi taqillatish»`,
      desc: `Technique. Five blows that nothing can interrupt; the last one breaks any guard, stuns and knocks a boss off balance. Cooldown 18 s.|Приём. Пять ударов, которые ничто не прервёт; последний пробивает любую защиту, оглушает и сбивает босса с равновесия. Перезарядка 18 с.|Usul. Hech narsa to'xtatolmaydigan besh zarba; oxirgisi har qanday himoyani yorib o'tadi, gangitadi va bossni muvozanatdan chiqaradi. Tiklanish 18 s.` },

    /* ---------------- Backbone ---------------- */
    { id: 'b_route', br: 1, tier: 0, max: 2, icon: 'route', name: `Habit of the round|Привычка обхода|Yo'l odati`,
      desc: `+10% stamina per rank.|+10% выносливости за ранг.|Har darajaga +10% chidam.`, mods: { stamMax: (v, a, b, r) => v * (1 + 0.1 * r) } },
    { id: 'b_roll', br: 1, tier: 0, max: 2, icon: 'roll', name: `Yodchi's roll|Перекат ёдчи|Yodchi dumalashi`,
      desc: `The invulnerable part of the roll is 20% longer per rank.|Неуязвимость при перекате длится на 20% дольше за ранг.|Dumalashdagi daxlsizlik har darajaga 20% uzoqroq davom etadi.`, mods: { rollI: (v, a, b, r) => v * (1 + 0.2 * r) } },
    { id: 'b_chapan', br: 1, tier: 0, max: 2, icon: 'chapan', name: `Thick chapan|Плотный чапан|Qalin to'n`,
      desc: `Damage taken −8% per rank.|Получаемый урон −8% за ранг.|Olinadigan zarar har darajaga −8%.`, mods: { dmgIn: (v, a, b, r) => v * (1 - 0.08 * r) } },
    { id: 'b_breath', br: 1, tier: 1, max: 1, icon: 'breath', name: `Second wind|Второе дыхание|Ikkinchi nafas`,
      desc: `Once per fight (land or lair), falling below 25% health restores 15%.|Раз за бой (в земле или логове): упав ниже 25% здоровья, восстанавливаешь 15%.|Har jangda bir marta (yerda yoki uyada): sog'lig'ing 25% dan tushsa, 15% tiklanadi.`,
      on: { onHurt: () => { const p = pl(); if (!p || p.dead || tmp.breathUsed || p.hp > p.maxHp * 0.25 || p.hp <= 0) return; tmp.breathUsed = true; p.heal(Math.round(p.maxHp * 0.15)); G.FX.ring(p.x, p.cy, 4, 36, '#8fe0a0', 18); toast(t(`Second wind|Второе дыхание|Ikkinchi nafas`), '#8fe0a0'); } } },
    { id: 'b_block', br: 1, tier: 1, max: 1, icon: 'block', name: `Block and answer|Блок и ответ|To'sib, qaytar`,
      desc: `A shield parry costs no stamina, gives 25 back and your counter-blow hits 50% harder. Blocks cost 30% less stamina.|Парирование щитом не тратит выносливость и возвращает 25, а контрудар бьёт на 50% сильнее. Блок тратит на 30% меньше выносливости.|Qalqon bilan qaytarish chidam yemaydi, 25 chidam qaytaradi, qarshi zarba esa 50% kuchliroq. To'sish 30% kam chidam oladi.`,
      mods: { blockCost: v => v * 0.7, parryDmg: v => v * 1.5 }, on: { onParry: () => { G.CH.st.v = Math.min(G.CH.maxStam(), G.CH.st.v + 25); } } },
    { id: 'b_salt', br: 1, tier: 1, max: 1, icon: 'salt', name: `Salt underfoot|Соль под ногами|Oyoq ostidagi tuz`,
      desc: `You cannot be slowed; cold takes half as long to wear off.|Тебя не замедлить; холод проходит вдвое быстрее.|Seni sekinlatib bo'lmaydi; sovuq ikki baravar tez o'tadi.`, mods: { noSlow: v => v + 1, res_frost: v => v + 0.3 } },
    { id: 'b_streets', br: 1, tier: 2, max: 1, icon: 'streets', name: `Knowing the streets|Знание улиц|Ko'chalarni bilish`,
      desc: `In the lands above, at night and in the dark, enemies see you 30% worse.|Наверху, ночью и в темноте враги замечают тебя на 30% хуже.|Yer ustida, tunda va qorong'ida dushmanlar seni 30% yomonroq ko'radi.`, mods: { sightMul: v => v * 0.7 } },
    { id: 'b_herbs', br: 1, tier: 2, max: 1, icon: 'herbs', name: `The herbalist's brews|Отвары травницы|Tabibning damlamalari`,
      desc: `+1 flask of water, and flasks heal 20% more.|+1 фляга воды, а вода из фляг лечит на 20% больше.|+1 idish suv, idishdagi suv esa 20% ko'proq davolaydi.`, mods: { heal: v => v * 1.2, flasks: v => v + 1 } },
    { id: 'b_traps', br: 1, tier: 2, max: 1, icon: 'traps', active: 'ys_traps', name: `Snares|Капканы|Qopqonlar`,
      desc: `Technique. Set a steel snare and spill lamp oil around it: the oil slows, and fire turns it into a burning pool. Cooldown 10 s.|Приём. Ставишь стальной капкан и разливаешь вокруг ламповое масло: масло замедляет, а от огня превращается в горящую лужу. Перезарядка 10 с.|Usul. Po'lat qopqon qo'yib, atrofiga chiroq moyi to'kasan: moy sekinlatadi, olov tegsa — yonayotgan ko'lmakka aylanadi. Tiklanish 10 s.` },
    { id: 'b_spine', br: 1, tier: 3, max: 1, icon: 'spine', name: `The Sleeper's backbone|Хребет Спящего|Uxlovchidek bardosh`,
      desc: `While your stamina is above half, no blow can knock you off your feet.|Пока выносливости больше половины, никакой удар не сбивает тебя с ног.|Chidaming yarmidan ko'p ekan, hech qanday zarba seni yiqitolmaydi.`, mods: { spineGuard: v => v + 1 } },
    { id: 'b_command', br: 1, tier: 3, max: 1, icon: 'command', name: `Commander|Вожак|Sarkarda`,
      desc: `Allies at your side — companions, the falcon, the dream dog — deal +15% damage, and while one fights with you, you take 15% less.|Союзники рядом — спутники, сокол, пёс из сна — наносят +15% урона, а пока кто-то бьётся рядом, ты получаешь на 15% меньше.|Yoningdagi ittifoqchilar — hamrohlar, lochin, tushdagi it — +15% zarar beradi; kimdir yoningda jang qilsa, o'zing 15% kam zarar olasan.`,
      mods: { dmgOut: (v, i) => (i && i.src && i.src !== pl() && i.src.faction === 'player' ? v * 1.15 : v),
        dmgIn: v => (allyNear() ? v * 0.85 : v) } },
    { id: 'b_forty', br: 1, tier: 3, max: 1, key: true, icon: 'forty', name: `KEY: Forty steps|КЛЮЧ: «Сорок шагов»|KALIT: «Qirq qadam»`,
      desc: `Once per land: a killing blow leaves you on 1 health and untouchable for 4 s. Kill an enemy in those seconds and you mend 30%. Rustam counted his steps.|Раз за землю смертельный удар оставляет тебе 1 здоровья и 4 с неуязвимости. Убьёшь врага за эти секунды — восстановишь 30%. Рустам считал шаги.|Har yerda bir marta: o'ldiruvchi zarbadan so'ng 1 sog'liq bilan 4 s daxlsiz qolasan. Shu soniyalarda dushmanni o'ldirsang — 30% tiklanadi. Rustam qadamlarini sanardi.`,
      on: { onKill: () => { if (tmp.fortyUntil > now()) { const p = pl(); if (p) { p.heal(Math.round(p.maxHp * 0.3)); tmp.fortyUntil = -1; toast(t(`Forty steps — counted.|Сорок шагов — сосчитано.|Qirq qadam — sanaldi.`), '#8fe0a0'); } } } } },

    /* ---------------- Forbidden Song ---------------- */
    { id: 's_spark', br: 2, tier: 0, max: 2, icon: 'spark', active: 'ys_spark', name: `Spark|Искра|Uchqun`,
      desc: `Technique. Burn a small memory: a lash of white fire ahead sets enemies alight. Rank 2: +35% damage. Hollowness +1. Cooldown 6 s.|Приём. Сжигаешь малое воспоминание: хлыст белого огня впереди поджигает врагов. Ранг 2: +35% урона. Пустота +1. Перезарядка 6 с.|Usul. Kichik bir xotirani yondirasan: oldingdagi oq olov qamchisi dushmanlarni yondiradi. 2-daraja: +35% zarar. Bo'shliq +1. Tiklanish 6 s.` },
    { id: 's_whisper', br: 2, tier: 0, max: 1, icon: 'whisper', active: 'ys_whisper', name: `Whisper|Шёпот|Shivir`,
      desc: `Technique. Plant fear: ordinary enemies around you flee for 3 s. Cooldown 14 s.|Приём. Вселяешь страх: обычные враги вокруг бегут 3 с. Перезарядка 14 с.|Usul. Qo'rquv solasan: atrofdagi oddiy dushmanlar 3 s qochadi. Tiklanish 14 s.` },
    { id: 's_wax', br: 2, tier: 0, max: 2, icon: 'wax', active: 'ys_waxshield', name: `Wax ward|Восковой щит|Mum qalqon`,
      desc: `Technique. Set wax hardens over you and swallows 40 damage (+20 per rank, more with Memory) for 10 s. Cooldown 20 s.|Приём. Тебя покрывает застывший воск и 10 с поглощает 40 урона (+20 за ранг, больше с Памятью). Перезарядка 20 с.|Usul. Seni qotgan mum qoplaydi va 10 s davomida 40 zararni yutadi (har darajaga +20, Xotira bilan ko'proq). Tiklanish 20 s.` },
    { id: 's_forget', br: 2, tier: 1, max: 1, icon: 'forget', active: 'ys_oblivion', name: `Oblivion|Забвение|Unutish`,
      desc: `Technique. The enemy in front of you forgets its target for 4 s and strikes at air (a boss: 1.5 s). Hollowness +1. Cooldown 12 s.|Приём. Враг перед тобой на 4 с забывает цель и бьёт мимо (босс — на 1,5 с). Пустота +1. Перезарядка 12 с.|Usul. Oldingdagi dushman 4 s nishonini unutib, havoga uradi (boss — 1,5 s). Bo'shliq +1. Tiklanish 12 s.` },
    { id: 's_dutar', br: 2, tier: 1, max: 2, icon: 'dutarN', name: `The dutar's song|Песня дутара|Dutor qo'shig'i`,
      desc: `Dutars and drums: +10% damage per rank, and every strike sends out a ring of sound that hurts everyone around (35% of the blow, 55% at rank 2).|Дутары и бубны: +10% урона за ранг, и каждый удар пускает кольцо звука, ранящее всех вокруг (35% от удара, 55% на ранге 2).|Dutor va doiralar: har darajaga +10% zarar; har zarbadan atrofdagilarni yaralovchi tovush halqasi tarqaladi (zarbaning 35%, 2-darajada 55%).`,
      mods: { dmgOut: (v, i, tg, r) => (catOf(i) === 'dutar' ? v * (1 + 0.1 * r) : v), soundRing: (v, a, b, r) => Math.max(v, r) } },
    { id: 's_alien', br: 2, tier: 1, max: 1, icon: 'alien', active: 'ys_drink', name: `Someone else's memory|Чужая память|Begona xotira`,
      desc: `Technique. Taste what is left in a fresh corpse: for 30 s you carry one of its traits (fire, poison, speed, flight or fury). Hollowness +1. Cooldown 30 s.|Приём. Испиваешь то, что осталось в свежем мертвеце: 30 с носишь его свойство (огонь, яд, скорость, полёт или ярость). Пустота +1. Перезарядка 30 с.|Usul. Yangi jasaddan qolgan xotirani totasan: 30 s uning bir xususiyati sende (olov, zahar, tezlik, parvoz yoki g'azab). Bo'shliq +1. Tiklanish 30 s.` },
    { id: 's_cheap', br: 2, tier: 2, max: 1, icon: 'cheap', name: `A smaller price|Цена поменьше|Arzonroq narx`,
      desc: `Hollowness from spells −25%.|Пустота от заклинаний −25%.|Afsunlardan keladigan Bo'shliq −25%.`, mods: { voidMagic: v => v * 0.75 } },
    { id: 's_fire', br: 2, tier: 2, max: 1, icon: 'tfire', active: 'ys_tumarfire', name: `Memory fire|Огонь памяти|Xotira olovi`,
      desc: `Technique. Burn a tumar from your satchel: a blast whose power is the tumar's quality. Hollowness +2. Cooldown 10 s.|Приём. Сжигаешь тумар из сумки: чем лучше тумар, тем сильнее взрыв. Пустота +2. Перезарядка 10 с.|Usul. Sumkadagi tumarni yondirasan: tumar qancha sifatli bo'lsa, portlash shuncha kuchli. Bo'shliq +2. Tiklanish 10 s.` },
    { id: 's_echo', br: 2, tier: 2, max: 1, icon: 'echo', name: `Echo|Эхо|Aks-sado`,
      desc: `A spell has a 25% chance to sound again at once, for free.|Заклинание с шансом 25% тут же звучит ещё раз — даром.|Afsun 25% ehtimol bilan darhol yana bir bor, tekinga yangraydi.`, mods: { echo: v => v + 0.25 } },
    { id: 's_well', br: 2, tier: 3, max: 1, icon: 'well', active: 'ys_wellvoice', name: `Voice of the Well|Голос Колодца|Quduq ovozi`,
      desc: `Technique. The song drags the enemies around you into one point before you and stuns them. Hollowness +2. Cooldown 16 s.|Приём. Песня стягивает врагов вокруг в одну точку перед тобой и оглушает. Пустота +2. Перезарядка 16 с.|Usul. Qo'shiq atrofdagi dushmanlarni oldingdagi bir nuqtaga tortib, gangitadi. Bo'shliq +2. Tiklanish 16 s.` },
    { id: 's_reson', br: 2, tier: 3, max: 1, icon: 'reson', name: `Hollow resonance|Отзвук Пустоты|Bo'shliq aks-sadosi`,
      desc: `Magic deals +1% damage for every point of Hollowness above 30.|Магия наносит +1% урона за каждое очко Пустоты сверх 30.|Sehr 30 dan ortiq har bir Bo'shliq ochkosi uchun +1% zarar beradi.`,
      mods: { dmgOut: (v, i) => (isMagic(i) ? v * (1 + Math.max(0, R().void - 30) / 100) : v) } },
    { id: 's_song', br: 2, tier: 3, max: 1, key: true, icon: 'song', active: 'ys_forbidden', name: `KEY: The Forbidden Song|КЛЮЧ: «Запретная песнь»|KALIT: «Yashirin navo»`,
      desc: `Technique. Burn a strong memory: a wave that erases weak enemies and knocks a boss off balance. Hollowness +12. Cooldown 60 s.|Приём. Сжигаешь сильное воспоминание: волна стирает слабых врагов и сбивает босса с равновесия. Пустота +12. Перезарядка 60 с.|Usul. Kuchli xotirani yondirasan: to'lqin zaif dushmanlarni o'chirib yuboradi, bossni muvozanatdan chiqaradi. Bo'shliq +12. Tiklanish 60 s.` }
  ];
  const BY = {}; for (const n of Y) BY[n.id] = n;
  function allyNear() {
    const p = pl(); if (!p || !G.world) return false;
    for (const e of G.world.ents || []) if (e !== p && !e.dead && e.faction === 'player' && e.isActor && Math.abs(e.x - p.x) < 200) return true;
    return false;
  }

  /* ================================================================ lethal saves (Forty steps, Sado's pull) */
  G.CH.lethalSaves.push((dmg, info, p) => {
    if (rkY('b_forty') && !tmp.fortyUsed) {
      tmp.fortyUsed = true; tmp.fortyUntil = now() + 4;
      p.invulnT = Math.max(p.invulnT || 0, 240);
      G.FX.flash('#8fe0a0', 0.4); G.FX.ring(p.x, p.cy, 4, 50, '#8fe0a0', 24, { width: 2 });
      G.FX.text(p.x, p.top - 14, t(`Forty steps!|Сорок шагов!|Qirq qadam!`), '#bff7c6', { size: 8 });
      return Math.max(0, p.hp - 1) / info.dmg;
    }
    if (rkS('pull') && !tmp.pullUsed) {
      tmp.pullUsed = true;
      p.invulnT = Math.max(p.invulnT || 0, 90);
      try { G.FX.flash('#9ff3e6', 0.5); } catch (e) { /* ignore */ }
      subtitle(pick([`Not yet! Get up!|Рано! Вставай!|Hali erta! Tur!`, `I've got you. Breathe.|Держу. Дыши.|Ushlab oldim. Nafas ol.`]), { now: true, pri: 5 });
      return Math.max(0, p.hp - 1) / info.dmg;
    }
    return null;
  });
  // the Forty-steps window: untouchable for 4 s even through new blows
  G.CH.absorbs.push(dmg => (tmp.fortyUntil > now() ? 0 : dmg));

  /* ================================================================ the Sado tree (unchanged) */
  const revealed = () => !!F().sadoFate;
  const nm = n => t(n.mask && !revealed() && n.mask.name ? n.mask.name : n.name);
  const ds = n => t(n.mask && !revealed() && n.mask.desc ? n.mask.desc : n.desc);
  const SADO = [
    { id: 'eyes', col: 0, max: 2, name: `Her eyes|Её глаза|Uning ko'zlari`, desc: `She sees the gap in a guard. +5% critical chance per rank.|Она видит брешь в защите. +5% к шансу крита за ранг.|U himoyadagi tirqishni ko'radi. Har darajaga kritik ehtimoli +5%.`, mods: { dmgOut: (v, i, tg, r) => crit(v, i, 0.05 * r) } },
    { id: 'voice', col: 0, max: 2, name: `"Behind you!"|«Сзади!»|«Orqangda!»`, desc: `She warns you. Damage taken from lair bosses −7% per rank.|Она предупреждает. Урон от боссов −7% за ранг.|U oldindan ogohlantiradi. Bosslardan keladigan zarar har darajaga −7%.`, mods: { dmgIn: (v, a, b, r) => (G.Game.boss && G.Game.stage && G.Game.stage.bossStarted && !G.Game.boss.dead ? v * (1 - 0.07 * r) : v) } },
    { id: 'pull', col: 0, max: 1, need: () => (R().trustPeak || 0) >= 3, needText: `Sado must trust you (trust 3)|Нужно, чтобы Садо тебе доверяла (доверие 3)|Sado senga ishonishi kerak (ishonch 3)`, name: `She pulls you back|Она вытаскивает тебя|U seni tortib qoladi`, desc: `Once per land, a killing blow leaves you standing with 1 health.|Раз за землю смертельный удар оставляет тебя на ногах с 1 здоровья.|Har yerda bir marta o'ldiruvchi zarbadan so'ng 1 sog'liq bilan oyoqda qolasan.` },
    { id: 'hearts', col: 0, max: 1, need: () => !!F().masked, needText: `Opens in Act II|Откроется во втором акте|Ikkinchi qismda ochiladi`, mask: { name: `Steady breath|Ровное дыхание|Bir tekis nafas` }, name: `Two hearts|Два сердца|Ikki yurak`, desc: `Above half health: +12% damage and +8% speed.|Пока здоровья больше половины: +12% урона и +8% скорости.|Sog'lig'ing yarmidan ko'p bo'lsa: +12% zarar va +8% tezlik.`, mods: { dmgOut: v => { const p = pl(); return p && p.hp > p.maxHp * 0.5 ? v * 1.12 : v; }, speed: v => { const p = pl(); return p && p.hp > p.maxHp * 0.5 ? v * 1.08 : v; } } },
    { id: 'light', col: 1, max: 2, name: `Her light|Её свет|Uning nuri`, desc: `At the start of each land you mend 8% health per rank.|В начале каждой земли восстанавливает 8% здоровья за ранг.|Har bir yer boshida har darajaga 8% sog'liq tiklaydi.`, on: { onStageStart: (r, plan) => { const p = pl(); if (p && plan && plan.type !== 'rest') p.heal(Math.round(p.maxHp * 0.08 * r)); } } },
    { id: 'alla', col: 1, max: 2, name: `Alla|Алла|Alla`, desc: `She hums when it's quiet. Hollowness −1 per rank at the start of each land.|Она напевает, когда тихо. В начале каждой земли Пустота −1 за ранг.|Jimjit paytda u xirgoyi qiladi. Har bir yer boshida har darajaga Bo'shliq −1.`, on: { onStageStart: (r, plan) => { if (plan && plan.type === 'level' && R().void > 0) { R().void = Math.max(0, R().void - r); save(); } } } },
    { id: 'toychoq', col: 1, max: 1, need: () => !!(F().oydinName || F().oydin), needText: `Opens later in Act II|Откроется позже, во втором акте|Ikkinchi qismda, keyinroq ochiladi`, mask: { name: `"Hold on!"|«Держись!»|«Chida!»`, desc: `She shouts at you to hold on. Below 25% health: damage taken −30%.|Она кричит тебе: держись. Ниже 25% здоровья получаешь на 30% меньше урона.|U senga «chida» deb qichqiradi. Sog'liq 25% dan past bo'lsa, zarar 30% kam.` }, name: `"Toychoq!"|«Тойчок!»|«Toychoq!»`, desc: `She screams your childhood name. Below 25% health: damage taken −30%.|Она выкрикивает твоё детское имя. Ниже 25% здоровья получаешь на 30% меньше урона.|U bolalikdagi ismingni aytib qichqiradi. Sog'liq 25% dan past bo'lsa, zarar 30% kam.`, mods: { dmgIn: v => { const p = pl(); return p && p.hp < p.maxHp * 0.25 ? v * 0.7 : v; } } },
    { id: 'sister', col: 1, max: 1, need: () => !!F().sadoFate, needText: `Opens near the end of the story|Откроется ближе к концу истории|Hikoya oxiriga yaqin ochiladi`, mask: { name: `A sealed memory|Запечатанное воспоминание|Muhrlangan xotira`, desc: `???|???|???` }, name: `Sister|Сестра|Singil`, desc: `You know now. +15% damage and +15% max health.|Теперь ты знаешь. +15% урона и +15% здоровья.|Endi bilasan. +15% zarar va +15% sog'liq.`, mods: { dmgOut: v => v * 1.15, maxHp: v => v * 1.15 }, sync: true }
  ];
  const SCOL = [`What she sees|Что она видит|U nimani ko'radi`, `What she gives|Что она даёт|U nima beradi`];
  const earnedS = () => {
    const r = R(), f = r.f || {};
    let n = Math.floor(Object.keys(r.mem || {}).length / 2);
    const tp = r.trustPeak || 0;
    n += (tp >= 3) + (tp >= 6) + (tp >= 9);
    if (f.sado) n += 1;
    if (f.oydin) n += 1;
    if (f.sadoFate) n += 2;
    return n;
  };
  const spentS = () => SADO.reduce((s, n) => s + rkS(n.id), 0);
  const ptsS = () => earnedS() - spentS();
  TICK.push(() => {
    const r = R();
    if ((r.trust || 0) > (r.trustPeak || 0)) {
      const before = earnedS(); r.trustPeak = r.trust; save();
      if (earnedS() > before && sadoAwake()) toast(t(`Sado trusts you more. A point for her tree (T)|Садо доверяет тебе чуть больше. Очко в её дерево (T)|Sado senga ko'proq ishonyapti. Uning daraxtiga ochko (T)`), C.sado);
    }
  });

  /* ================================================================ tree logic */
  const branchPoints = b => Y.filter(n => n.br === b).reduce((s, n) => s + rkY(n.id), 0);
  function whyNotY(n) {
    if (rkY(n.id) >= n.max) return t(`Maxed|Максимум|Eng yuqori`);
    if (branchPoints(n.br) < NEED[n.tier]) return tf(`Needs {n} points in this branch|Нужно {n} очков в этой ветви|Bu shoxda {n} ochko kerak`, { n: NEED[n.tier] });
    if (G.CH.skillPoints() <= 0) return t(`No points — gain a level|Нет очков — получи уровень|Ochko yo'q — keyingi darajaga chiq`);
    return null;
  }
  function whyNotS(n) {
    if (rkS(n.id) >= n.max) return t(`Maxed|Максимум|Eng yuqori`);
    if (n.need && !n.need()) return t(n.needText);
    if (ptsS() <= 0) return t(`No points — find memories, earn her trust|Нет очков: ищи воспоминания, заслужи её доверие|Ochko yo'q — xotiralarni top, ishonchini qozon`);
    return null;
  }
  function buyY(id, free) {
    const n = BY[id]; if (!n) return false;
    if (!free && whyNotY(n)) return false;
    const s = CHs();
    s.sk[id] = (s.sk[id] || 0) + 1;
    if (n.active && s.sk[id] === 1 && G.YITEMS) G.YITEMS.learnTechnique(n.active);
    G.CH.dirty(); G.CH.syncHp(); applyFlasks(); save();
    return true;
  }
  function buyS(id) {
    const n = SADO.find(x => x.id === id); if (!n || whyNotS(n)) return false;
    const tr = T().s; tr[id] = (tr[id] || 0) + 1;
    G.CH.dirty(); if (n.sync) G.CH.syncHp(); save();
    if (sadoAwake()) subtitle(pick([`Oh! I can do that?|Ого! Я так умею?|Voy! Men shunaqa qila olarkanmanmi?`, `I'll try. For you.|Попробую. Ради тебя.|Urinib ko'raman. Sen uchun.`, `Feels… familiar.|Как будто… знакомо.|Qandaydir… tanish.`]), { now: true });
    return true;
  }
  function resetYodchi() {
    const s = CHs();
    for (const id in s.sk) { const n = BY[id]; if (n && n.active && G.YITEMS) G.YITEMS.forgetTechnique(n.active); }
    s.sk = {};
    G.CH.dirty(); applyFlasks();
  }
  // extra flasks from nodes and gear: tracked so they are never added twice
  function applyFlasks() {
    if (!G.run) return;
    const s = CHs(), want = Math.round(G.Perks.mod('flasks', 0)) + BAL.FLASKS_BASE - 2 + Math.min(3, s.flaskUp || 0), had = s.flaskBonus || 0;   // the engine starts with 2; the herbalist adds up to 3
    if (want !== had) {
      G.run.maxFlasks = Math.max(1, (G.run.maxFlasks || 2) + want - had);
      if (want > had) G.run.flasks = Math.min(G.run.maxFlasks, (G.run.flasks || 0) + (want - had));
      G.run.flasks = Math.min(G.run.flasks || 0, G.run.maxFlasks);
      s.flaskBonus = want; save();
    }
  }
  PROG.applyFlasks = applyFlasks;
  // the herbalist's flask upgrades (GDD: 3 → 6 by the finale): G.CH.upgradeFlask()
  G.CH.upgradeFlask = () => { const s = CHs(); if ((s.flaskUp || 0) >= 3) return false; s.flaskUp = (s.flaskUp || 0) + 1; applyFlasks(); if (G.run) G.run.flasks = G.run.maxFlasks; save(); return true; };
  function activeNodes() {
    const out = [];
    if (!G.run) return out;
    const sk = CHs().sk;
    for (const id in sk) if (sk[id] > 0 && BY[id]) out.push([BY[id], sk[id]]);
    for (const n of SADO) { const r = rkS(n.id); if (r) out.push([n, r]); }
    return out;
  }

  /* ================================================================ techniques (skill items) */
  const D = G.Items.defs;
  const icon = draw => X.perkIcon(draw);
  const pmag = (p, item, base) => G.Combat.playerDmg(item, base);
  const front = (p, w, h, dy) => ({ x: p.facing > 0 ? p.x : p.x - w, y: p.y - (dy || h), w, h });
  const hitArea = (p, box, fn) => G.Combat.area(p, box, fn, new Set());
  const magic = (item, base, extra) => tg => Object.assign({ dmg: base, type: 'magic', magic: true, skill: true, item, dir: Math.sign(tg.x - pl().x) || pl().facing }, extra || {});
  const songVoid = (n, item) => { G.CH.magicVoid(n, `a memory burned|сгорело воспоминание|bir xotira yonib ketdi`); void item; };
  const nearEnemies = (p, r) => (G.world ? G.world.enemies.filter(e => e && !e.dead && !e.untargetable && Math.abs(e.x - p.x) < r && Math.abs(e.cy - p.cy) < 70) : []);
  function echo(item, again) {
    if (Math.random() < G.Perks.mod('echo', 0)) {
      setTimeout(() => { try { if (G.Game.state === 'play' && pl()) { again(); G.FX.text(pl().x, pl().top - 18, t(`Echo|Эхо|Aks-sado`), '#c9b4ff', { size: 7 }); } } catch (e) { /* ignore */ } }, 330);
    }
  }
  const SKILL = (id, o) => {
    const d = G.Items.register(Object.assign({
      id, kind: 'skill', noDrop: true, weight: 0, castT: 8, dur: 18, yd: Object.assign({ cat: 'technique', skill: true, power: 1, scal: { mem: 'A' } }, o.yd || {}),
      showHeld: false
    }, o));
    return d;
  };
  // Spark
  SKILL('ys_spark', {
    name: N(`Spark|Искра|Uchqun`), desc: N(`Burn a small memory: a lash of white fire ahead. Hollowness +1.|Сжигаешь малое воспоминание: хлыст белого огня впереди. Пустота +1.|Kichik xotirani yondirasan: oldingda oq olov qamchisi. Bo'shliq +1.`),
    cooldown: 360, dmg: 26, yd: { scal: { mem: 'S' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.fillStyle = '#fff4d0'; c.beginPath(); c.moveTo(-6, 5); c.lineTo(1, -7); c.lineTo(0, -1); c.lineTo(6, -3); c.lineTo(-1, 7); c.lineTo(0, 1); c.closePath(); c.fill(); c.fillStyle = '#ff9a3a'; c.fillRect(-1, -1, 2, 2); }),
    use(p, item) {
      const go = () => {
        const r = rkY('s_spark'), dmg = pmag(p, item, 26) * (r >= 2 ? 1.35 : 1);
        hitArea(p, front(p, 92, 26, 30), magic(item, dmg, { status: { burn: { t: 180, dps: 4 + 0.8 * G.CH.level() } }, kbx: 2, fxPal: 'fire' }));
        for (let k = 0; k < 10; k++) G.FX.spawn({ x: p.x + p.facing * (10 + k * 9), y: p.y - 18 + G.U.rand(-3, 3), vx: p.facing * G.U.rand(0.5, 1.5), vy: -G.U.rand(0.2, 0.8), life: 18 + k, size: 2, size1: 0, color: '#fff4d0', color2: '#ff7a2a', glow: true });
        G.FX.ring(p.x + p.facing * 40, p.y - 18, 4, 30, '#ffd8a0', 12);
        sfx('magic', { x: p.x, pitch: 1.3 });
      };
      go(); songVoid(1, item); echo(item, go);
    }
  });
  // Whisper (fear)
  SKILL('ys_whisper', {
    name: N(`Whisper|Шёпот|Shivir`), desc: N(`Plant fear: ordinary enemies around you flee for 3 s.|Вселяешь страх: обычные враги вокруг бегут 3 с.|Qo'rquv solasan: atrofdagi oddiy dushmanlar 3 s qochadi.`),
    cooldown: 840, dmg: 0, yd: { scal: { mem: 'C' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.fillStyle = '#c9b4ff'; c.beginPath(); c.ellipse(0, 0, 6, 4, 0, 0, 7); c.fill(); c.fillStyle = '#2a1a40'; c.fillRect(-3, -1, 2, 2); c.fillRect(1, -1, 2, 2); c.fillStyle = '#ffffff'; c.fillRect(-6, 4, 12, 1); }),
    use(p, item) {
      const go = () => {
        let n = 0;
        for (const e of nearEnemies(p, 130)) { if (isBossT(e)) continue; e._fearT = 180; n++; }
        G.FX.ring(p.x, p.cy, 6, 120, '#c9b4ff', 22, { width: 2 });
        sfx('magic', { x: p.x, pitch: 0.7 });
        if (!n) G.FX.text(p.x, p.top - 12, t(`No one to frighten|Пугать некого|Qo'rqitadigan hech kim yo'q`), '#b0a0c0', { size: 7 });
      };
      go(); songVoid(0.5, item); echo(item, go);
    }
  });
  // Wax ward (absorb)
  const ward = { left: 0, until: -1 };
  G.CH.absorbs.push(dmg => {
    if (ward.left <= 0 || ward.until < now()) return dmg;
    const a = Math.min(ward.left, dmg); ward.left -= a;
    const p = pl(); if (p) { G.FX.text(p.x, p.top - 8, '-' + Math.round(a), '#f2ead0', { size: 7 }); if (ward.left <= 0) G.FX.burst(p.x, p.cy, 12, { speed: 2, life: 20, size: 2, color: '#f2ead0' }); }
    return dmg - a;
  });
  SKILL('ys_waxshield', {
    name: N(`Wax ward|Восковой щит|Mum qalqon`), desc: N(`Set wax swallows damage for 10 s.|Застывший воск 10 с поглощает урон.|Qotgan mum 10 s zararni yutadi.`),
    cooldown: 1200, dmg: 0, yd: { scal: { mem: 'B' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.fillStyle = '#f2ead0'; c.beginPath(); c.moveTo(0, -7); c.lineTo(6, -3); c.lineTo(5, 4); c.lineTo(0, 7); c.lineTo(-5, 4); c.lineTo(-6, -3); c.closePath(); c.fill(); c.fillStyle = '#c8b890'; c.fillRect(-1, -4, 2, 8); }),
    use(p, item) {
      const r = Math.max(1, rkY('s_wax'));
      ward.left = Math.round((40 + 20 * (r - 1)) * (0.8 + 0.04 * BAL.eff(G.CH.attrs().mem)) * (1 + 0.04 * (G.CH.level() - 1)));
      ward.until = now() + 10;
      G.Buffs.add('ys_wax', 10, { drawFx(ctx, pp) { if (ward.left > 0) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#f2ead0'; ctx.fillRect(Math.round(pp.x) - 7, Math.round(pp.y) - 25, 14, 25); ctx.globalAlpha = 1; } } });
      G.FX.ring(p.x, p.cy, 4, 24, '#f2ead0', 16); sfx('shield_up', { x: p.x });
      songVoid(0.5, item);
    }
  });
  PROG.ward = ward;
  // Oblivion
  SKILL('ys_oblivion', {
    name: N(`Oblivion|Забвение|Unutish`), desc: N(`The enemy in front of you forgets its target.|Враг перед тобой забывает цель.|Oldingdagi dushman nishonini unutadi.`),
    cooldown: 720, dmg: 0, yd: { scal: { mem: 'B' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.strokeStyle = '#9fd8ff'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 0, 5.5, 0.5, 5.6); c.stroke(); c.fillStyle = '#e0f4ff'; c.fillRect(-1, -1, 2, 2); }),
    canUse(p) { return nearEnemies(p, 140).some(e => Math.sign(e.x - p.x) === p.facing || Math.abs(e.x - p.x) < 20) ? true : t(`No target|Нет цели|Nishon yo'q`); },
    use(p, item) {
      const go = () => {
        const L = nearEnemies(p, 140).filter(e => Math.sign(e.x - p.x) === p.facing || Math.abs(e.x - p.x) < 20).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
        const e = L[0]; if (!e) return;
        const b = e.isBossPart ? e.boss : e;
        b._forgetT = isBossT(b) ? 90 : 240;
        G.FX.ring(b.x, b.cy, 4, 30, '#9fd8ff', 20); G.FX.text(b.x, b.top - 12, t(`forgot|забыл|unutdi`), '#9fd8ff', { size: 7 });
        sfx('magic', { x: b.x, pitch: 1.6 });
      };
      go(); songVoid(1, item); echo(item, go);
    }
  });
  // Someone else's memory
  let lastCorpse = null;
  G.Events.on('kill', e => { if (e && !e.isBoss) lastCorpse = { x: e.x, y: e.y, def: e.def, elite: e.elite, t: now() }; });
  const TRAITS = {
    fire: { name: `fire|огонь|olov`, mods: { dmgOut: (v, i, tg) => { if (tg && tg.addStatus && i && i.type === 'melee' && Math.random() < 0.35) tg.addStatus('burn', { t: 150, dps: 3 + G.CH.level() * 0.6 }); return v; } } },
    poison: { name: `poison|яд|zahar`, mods: { dmgOut: (v, i, tg) => { if (tg && tg.addStatus && i && i.type === 'melee') tg.addStatus('poison', { t: 180, dps: 1.5 + G.CH.level() * 0.25, max: 5 }); return v; } } },
    speed: { name: `speed|скорость|tezlik`, mods: { speed: v => v * 1.18 } },
    flight: { name: `flight|полёт|parvoz`, mods: { airJumps: v => v + 1 } },
    fury: { name: `fury|ярость|g'azab`, mods: { dmgOut: v => v * 1.2 } }
  };
  const traitOf = c => {
    const id = String((c.def && c.def.id) || '') + ' ' + String((c.def && c.def.biomes || []).join(' '));
    if (c.elite) return 'fury';
    if (c.def && c.def.fly) return 'flight';
    if (/fire|burn|lamp|oil|tandir|nightmare|flame/.test(id)) return 'fire';
    if (/snake|salt|poison|leech|rat|spider|toad|scorp/.test(id)) return 'poison';
    if (/wolf|dog|jackal|cat|hound|thief|runner|bat|bird|vulture/.test(id)) return 'speed';
    return ['fire', 'poison', 'speed', 'fury'][Math.abs(String(id).length) % 4];
  };
  SKILL('ys_drink', {
    name: N(`Someone else's memory|Чужая память|Begona xotira`), desc: N(`Taste a fresh corpse: carry one of its traits for 30 s.|Испиваешь свежего мертвеца: 30 с носишь его свойство.|Yangi jasaddan totasan: 30 s uning xususiyati sende.`),
    cooldown: 1800, dmg: 0, castT: 14, dur: 26, yd: { scal: { mem: 'C' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.fillStyle = '#7a2a40'; c.beginPath(); c.arc(0, 2, 5, 0, 7); c.fill(); c.fillStyle = '#c9b4ff'; c.fillRect(-1, -7, 2, 7); c.fillStyle = '#ffffff'; c.fillRect(-2, 1, 1, 1); }),
    canUse(p) { return lastCorpse && now() - lastCorpse.t < 6 && Math.abs(lastCorpse.x - p.x) < 90 ? true : t(`No fresh corpse nearby|Свежего мертвеца рядом нет|Yaqin atrofda yangi jasad yo'q`); },
    use(p) {
      const k = traitOf(lastCorpse), tr = TRAITS[k];
      G.Buffs.add('ys_drink', 30, { mods: tr.mods });
      G.CH.dirty();
      G.FX.burst(lastCorpse.x, lastCorpse.y - 8, 16, { speed: 1.5, life: 30, size: 2, color: '#c9b4ff', glow: true, grav: -0.05 });
      toast(tf(`You carry its {k} for 30 s|Его {k} — в тебе, 30 с|Uning {k}i 30 s sende`, { k: t(tr.name) }), '#c9b4ff');
      lastCorpse = null;
      songVoid(1);
      void p;
    }
  });
  PROG.TRAITS = TRAITS;
  // Memory fire (burn a tumar from the satchel)
  SKILL('ys_tumarfire', {
    name: N(`Memory fire|Огонь памяти|Xotira olovi`), desc: N(`Burn a tumar from your satchel: a blast as strong as the tumar.|Сжигаешь тумар из сумки: чем он лучше, тем сильнее взрыв.|Sumkadagi tumarni yondirasan: tumar qancha yaxshi bo'lsa, portlash shuncha kuchli.`),
    cooldown: 600, dmg: 60, castT: 12, dur: 24, yd: { scal: { mem: 'S' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.fillStyle = '#e2b452'; c.beginPath(); c.moveTo(0, -6); c.lineTo(6, 5); c.lineTo(-6, 5); c.closePath(); c.fill(); c.fillStyle = '#ff6a2a'; c.beginPath(); c.arc(0, 1, 3, 0, 7); c.fill(); }),
    canUse() { return G.YITEMS && G.YITEMS.bestTumar() ? true : t(`No tumar to burn|Сжигать нечего: тумаров нет|Yondiradigan tumar yo'q`); },
    use(p, item) {
      const tu = G.YITEMS.takeTumar(); if (!tu) return false;
      const k = [0.7, 1, 1.35, 1.8][tu.q || 0] || 1, dmg = pmag(p, item, 60) * k;
      const x = p.x + p.facing * 40;
      hitArea(p, { x: x - 52, y: p.y - 60, w: 104, h: 66 }, magic(item, dmg, { status: { burn: { t: 200, dps: 4 + G.CH.level() } }, kbx: 3.5, kby: -2.5, heavy: true, fxPal: 'fire' }));
      try { G.FX.explosion(x, p.y - 22, { size: 'm', pal: 'fire' }); } catch (e) { G.FX.ring(x, p.y - 22, 6, 60, '#ffb060', 20, { width: 3 }); }
      G.FX.flash('#fff0d0', 0.2); G.shake(0.4);
      songVoid(2, item);
    }
  });
  // Voice of the Well (pull)
  SKILL('ys_wellvoice', {
    name: N(`Voice of the Well|Голос Колодца|Quduq ovozi`), desc: N(`Drag the enemies around you into one point and stun them.|Стягиваешь врагов вокруг в одну точку и оглушаешь.|Atrofdagi dushmanlarni bir nuqtaga tortib, gangitasan.`),
    cooldown: 960, dmg: 18, castT: 14, dur: 30, yd: { scal: { mem: 'A' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.strokeStyle = '#5ac8d8'; c.lineWidth = 1.4; for (const r of [6, 3.5]) { c.beginPath(); c.arc(0, 0, r, 0, 7); c.stroke(); } c.fillStyle = '#ffffff'; c.fillRect(-1, -1, 2, 2); }),
    use(p, item) {
      const go = () => {
        const x = p.x + p.facing * 30;
        for (const e of nearEnemies(p, 150)) {
          if (isBossT(e)) continue;
          e.x += (x - e.x) * 0.75; e.vx = 0;
          e.addStatus('stun', { t: 50 });
          G.Combat.hit(p, e, magic(item, pmag(p, item, 18))(e));
        }
        G.FX.ring(x, p.cy, 120, 6, '#5ac8d8', 20, { width: 2 });
        sfx('magic', { x: p.x, pitch: 0.5 });
      };
      go(); songVoid(2, item); echo(item, go);
    }
  });
  // The Forbidden Song (key)
  SKILL('ys_forbidden', {
    name: N(`The Forbidden Song|Запретная песнь|Yashirin navo`), desc: N(`Burn a strong memory: a wave that erases the weak and breaks a boss's balance. Hollowness +12.|Сжигаешь сильное воспоминание: волна стирает слабых и сбивает босса с равновесия. Пустота +12.|Kuchli xotirani yondirasan: to'lqin zaiflarni o'chiradi, bossni muvozanatdan chiqaradi. Bo'shliq +12.`),
    cooldown: 3600, dmg: 60, castT: 22, dur: 40, yd: { scal: { mem: 'S' }, power: 1, skill: true, cat: 'technique', song: true },
    icon: icon(c => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(0, 0, 6.5, 0, 7); c.fill(); c.fillStyle = '#c9b4ff'; c.beginPath(); c.arc(0, 0, 4.5, 0, 7); c.fill(); c.fillStyle = '#2a1a40'; c.fillRect(-1, -4, 2, 8); c.fillRect(-4, -1, 8, 2); }),
    canUse() { return R().void + 12 >= VOID_MAX ? t(`Nothing left to burn|Больше нечего сжигать|Yondiradigan hech narsa qolmadi`) : true; },
    use(p, item) {
      const dmg = pmag(p, item, 60);
      for (const e of (G.world ? G.world.enemies.slice() : [])) {
        if (!e || e.dead || e.untargetable || Math.abs(e.x - p.x) > 260 || Math.abs(e.cy - p.cy) > 120) continue;
        if (isBossT(e)) { if (!e.isBossPart) { BAL.breakBoss(e); G.Combat.hit(p, e, magic(item, dmg)(e)); } continue; }
        if (!e.elite && e.hp < e.maxHp * 0.45) { G.Combat.hit(p, e, magic(item, e.hp + 1, { erase: true })(e)); continue; }
        G.Combat.hit(p, e, magic(item, dmg, { stun: 90, kbx: 4, kby: -3 })(e));
      }
      G.FX.flash('#ffffff', 0.55); G.shake(0.7);
      G.FX.ring(p.x, p.cy, 8, 260, '#ffffff', 34, { width: 4 }); G.FX.ring(p.x, p.cy, 4, 200, '#c9b4ff', 28, { width: 2 });
      sfx('magic', { x: p.x, pitch: 0.4 });
      G.CH.magicVoid(12, `the Forbidden Song|Запретная песнь|Yashirin navo`);
    }
  });
  // The last knock (key, Collection)
  SKILL('ys_lastknock', {
    name: N(`The last knock|Последний стук|So'nggi taqillatish`), desc: N(`Five blows nothing can interrupt; the last breaks any guard.|Пять ударов, которые не прервать; последний пробивает любую защиту.|To'xtatib bo'lmaydigan besh zarba; oxirgisi har qanday himoyani yoradi.`),
    cooldown: 1080, dmg: 22, castT: 2, dur: 70, yd: { scal: { str: 'B', agi: 'B' }, power: 1, skill: true, cat: 'technique' },
    icon: icon(c => { c.fillStyle = '#f2c14a'; for (let k = 0; k < 5; k++) c.fillRect(-7 + k * 3, 4 - k * 2, 2, 3 + k * 2); c.fillStyle = '#fff4d0'; c.fillRect(5, -6, 2, 12); }),
    showHeld: true,
    updateCast(p, item, ws) {
      p.invulnT = Math.max(p.invulnT || 0, 2);                // nothing interrupts it
      const k = ws.t;
      if (k > 4 && k <= 60 && (k - 4) % 12 === 0) {
        const n = (k - 4) / 12, last = n === 5;
        const w = G.run.slots.attack || item;
        p.vx = p.facing * (last ? 3 : 1.4);
        const wd = w && w.def && w.def.yd && w.def.yd.scal && !w.def.yd.skill ? G.Combat.playerDmg(w, last ? 40 : 20) : pmag(p, item, last ? 40 : 20);
        hitArea(p, front(p, last ? 46 : 36, 40, 38), tg => ({ dmg: wd, item, type: 'melee', heavy: last, stun: last ? 120 : 20, kbx: last ? 5 : 1.2, kby: last ? -3 : -0.5, pierce: true, dir: p.facing, poiseMul: last ? 4 : 1 }));
        G.FX.smear({ owner: p, ox: 3, oy: -18, r0: 8, r1: last ? 40 : 30, a0: n % 2 ? -2.2 : 1.6, a1: n % 2 ? 1.2 : -1.8, dir: p.facing, color: last ? '#ffffff' : '#ffe7a6', color2: '#f2c14a', life: 10 });
        sfx(last ? 'swing_heavy' : 'swing', { x: p.x });
        if (last) { G.shake(0.5); G.hitstop(8); }
      }
    },
    poseFn(p, item, ws) { const k = ((ws.t - 4) % 12) / 12; p.pose.armF = -2.2 + 3.4 * k * ((ws.t / 12 | 0) % 2 ? -1 : 1); p.pose.ext = 1.2; p.pose.item = G.run.slots.attack || null; p.pose.lean = 0.5; },
    use() { }
  });
  // Snares (Backbone)
  SKILL('ys_traps', {
    name: N(`Snares|Капканы|Qopqonlar`), desc: N(`A steel snare and a spill of lamp oil that slows.|Стальной капкан и лужа лампового масла, которая замедляет.|Po'lat qopqon va sekinlatadigan chiroq moyi.`),
    cooldown: 600, dmg: 14, yd: { scal: { agi: 'C', str: 'C' }, power: 1, skill: true, cat: 'technique' },
    icon: D.trap ? D.trap.icon : icon(c => { c.fillStyle = '#c8ccd8'; c.fillRect(-6, 2, 12, 2); }),
    use(p, item, ws) {
      if (D.trap && D.trap.use) { try { D.trap.use.call(D.trap, p, item, ws); } catch (e) { /* engine trap may refuse */ } }
      const x = p.x + p.facing * 18, y = p.y;
      oilPools.push({ x, y, until: now() + 8, hot: 0 });
      G.FX.burst(x, y - 2, 10, { speed: 1, life: 30, size: 2, color: '#3a2a10', grav: 0.1 });
    }
  });
  const oilPools = [];
  PROG.oilPools = oilPools;
  // oil slows; fire on it burns
  {
    const up0 = G.Enemy.prototype.update;
    G.Enemy.prototype.update = function () {
      // fear: run away, no contact damage
      if (this._fearT > 0 && !this.dead) {
        this._fearT--;
        const p = pl();
        this.hurtT = Math.max(this.hurtT || 0, 2); this.contactCD = Math.max(this.contactCD || 0, 2);
        if (p) { const d = Math.sign(this.x - p.x) || 1; this.facing = d; this.vx = d * Math.max(1.1, (this.speed || 1) * 1.3); }
        if (G.frame % 10 === 0) G.FX.spawn({ x: this.x, y: this.top - 6, vy: -0.6, life: 14, size: 1, color: '#c9b4ff', glow: true });
      }
      if (this._forgetT > 0) { this._forgetT--; if (G.frame % 12 === 0) G.FX.spawn({ x: this.x + G.U.rand(-5, 5), y: this.top - 4, vy: -0.4, life: 16, size: 1, color: '#9fd8ff', glow: true }); }
      if (oilPools.length && !this.dead) for (const o of oilPools) if (o.until > now() && Math.abs(this.x - o.x) < 26 && Math.abs(this.y - o.y) < 10) { this.addStatus('slow', { t: 20 }); if (this.st.burn && !o.hot) { o.hot = 1; o.until = now() + 4; } if (o.hot && G.frame % 20 === 0) this.addStatus('burn', { t: 90, dps: 4 + G.CH.level() * 0.8 }); }
      return up0.apply(this, arguments);
    };
    const cs0 = G.Enemy.prototype.canSee;
    G.Enemy.prototype.canSee = function (e, a) {
      a = a === undefined ? 220 : a;
      if (G.run && R && !R().ended) { const m = G.Perks.mod('sightMul', 1); if (m !== 1 && darkSurface()) a *= m; a *= G.Perks.mod('sightAll', 1); }
      return cs0.call(this, e, a);
    };
  }
  function darkSurface() {
    const lv = G.level, b = lv && lv.biome; if (!b || lv.isArena) return false;
    if (/karez|well|cistern|gut|deep|vault|tunnel/.test(b.id || '')) return false;
    const h = String(G.Light && G.Light.ambient || b.ambient || '#5a5070').replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16);
    const lum = ((n >> 16) & 255) * 0.3 + ((n >> 8) & 255) * 0.59 + (n & 255) * 0.11;
    return lum < 110;
  }
  PROG.darkSurface = darkSurface;
  // forgetting enemies strike at air
  {
    const hit0 = G.Combat.hit;
    G.Combat.hit = function (src, target, info) {
      if (src && src.faction === 'enemy') {
        const s = src.isBossPart ? src.boss : src;
        const own = s && (s._forgetT > 0 || (s.owner && s.owner._forgetT > 0));
        if (own && target === pl()) { if (G.frame % 8 === 0) G.FX.text(target.x, target.top - 8, t(`miss|мимо|tegmadi`), '#9fd8ff', { size: 6 }); return false; }
      }
      return hit0.apply(this, arguments);
    };
  }

  /* ================================================================ wiring */
  ON_STAGE.push(plan => {
    tmp.breathUsed = false; tmp.fortyUsed = false; tmp.fortyUntil = -1; tmp.pullUsed = false;
    ward.left = 0; oilPools.length = 0; lastCorpse = null;
    applyFlasks();
    void plan;
  });
  G.Events.on('bossStart', () => { tmp.breathUsed = false; });
  PROG.onMemory = () => { toast(t(`A memory returns. A point for Sado's tree (T)|Воспоминание вернулось. Очко в дерево Садо (T)|Xotira qaytdi. Sado daraxtiga ochko (T)`), C.mem); };

  // the old "think it over" mat at every chaikhana now opens the character screens
  G.ObjArt.treeMat = (ctx, o) => {
    const x = Math.round(o.x), y = Math.round(o.y);
    ctx.fillStyle = '#7a2a2a'; ctx.fillRect(x - 12, y - 2, 24, 2);
    ctx.fillStyle = '#e2b452'; ctx.fillRect(x - 10, y - 3, 20, 1);
    ctx.fillStyle = '#5a3a22'; ctx.fillRect(x - 1, y - 16, 2, 14);
    ctx.fillStyle = '#4fc25a'; ctx.fillRect(x - 6, y - 20, 12, 5); ctx.fillRect(x - 4, y - 24, 8, 4);
    ctx.fillStyle = '#9ff3e6'; ctx.fillRect(x - 3, y - 22, 1, 1); ctx.fillRect(x + 3, y - 19, 1, 1);
  };
  ON_STAGE.push((plan, biome, level) => {
    if (!plan || plan.type !== 'rest' || R().ended || !level || !level.spawn) return;
    const o = new G.Interactable(level.spawn.x + 70, level.spawn.y, { art: 'treeMat', w: 24, h: 24, prompt: N(`Think it over (skills)|Подумать (умения)|O'ylab ko'rish (mahoratlar)`) });
    o.onUse = () => { if (!busy) setTimeout(() => G.TREE_OPEN && G.TREE_OPEN(), 60); return true; };
    G.world.add(o);
    if (sadoAwake() && once('treeHint')) queue(() => stageT() > 300, () => subtitle(`Press T when you want to think about what you've learned — and what I can do for you.|Нажми T, когда захочешь подумать, чему ты научился. И что я могу для тебя сделать.|Nimalarni o'rganganingni, men senga nima qila olishimni o'ylab ko'rmoqchi bo'lsang — T ni bos.`));
  });

  Object.assign(PROG, {
    Y, S: SADO, BY, BRANCHES, NEED, SCOL, NNAME: nm, NDESC: ds,
    rank: rkY, rankS: rkS, branchPoints, whyNotY, whyNotS, buyY, buyS, resetYodchi, activeNodes,
    ptsS, earnedS, tmp, isBoss: isBossT,
    addXp: n => G.CH.addXp(n, 'combat'),
    ui: { open: false },
    active: activeNodes,
    pts: () => ({ y: G.CH.skillPoints(), s: ptsS(), lvl: G.CH.level(), xp: G.CH.S().xp })
  });
  G.PROG = PROG;
}
