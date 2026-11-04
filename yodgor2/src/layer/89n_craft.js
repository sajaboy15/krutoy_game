/* 89n_craft.js — crafts (GDD ch. 15 "Ремёсла"):
   - Alchemy and kitchen: about 20 recipes. Brews (healing, resistances, vigour) at Zebo the herbalist; food (10-minute
     bonuses: plov +10% health, samsa stamina, bitter tea −3 Hollowness…) at any chaikhana. Ingredients: herbs gathered
     in the regions, provisions bought at the chaikhana, trophies taken from enemies.
   - Tumar crafting at Ma'ruf's forge (his wax workshop): wax + thread + a carrier (stone, bone, iron) + a "charge" = a
     charm. 16 charm recipes; recipes are found in the world (caches the notes point to) and bought.
   Materials: iron, bulat, bone, salt, wax (oil, white, black), silk thread, turquoise, garnet, lapis, herbs (wormwood,
   isiriq, sage), trophies (fangs, Hollow dust), leather, feathers, silk, carrier stones, provisions.
   State: R().craft = { known: {recipeId: 1} }. */
{
  const YI = G.YITEMS, ICO = YI.ICO, gear = YI.gear;
  const S = () => { const r = R(); if (!r.craft || typeof r.craft !== 'object') r.craft = {}; if (!r.craft.known) r.craft.known = {}; return r.craft; };
  const CRAFT = G.CRAFT = { S };

  /* ================================================================ materials */
  const MAT = (id, name, desc, icon, dropW, price, minStage) => gear({ id, type: 'material', name, desc, icon, dropW, price, minStage: minStage || 0 });
  MAT('mat_wax_white', `White wax|Белый воск|Oq mum`, `The Singers' wax: clean, slow to burn. For tumars that guard.|Воск Певцов: чистый, горит медленно. Для оберегающих тумаров.|Xonandalar mumi: toza, sekin yonadi. Qo'riqlovchi tumarlar uchun.`, ICO.wax('#f2ead0', '#ffffff'), 2, 25, 1);
  MAT('mat_wax_black', `Black wax|Чёрный воск|Qora mum`, `Wax mixed with ash and something worse. For tumars that bite.|Воск, смешанный с пеплом и кое-чем похуже. Для тумаров, которые кусаются.|Kul va undan ham yomonroq narsa aralashgan mum. Tishlaydigan tumarlar uchun.`, ICO.wax('#2a2030', '#c9b4ff'), 1, 60, 2);
  MAT('mat_wormwood', `Wormwood|Полынь|Shuvoq`, `Bitter, grey, everywhere on the steppe. Clears the head.|Горькая, серая, по всей степи. Прочищает голову.|Achchiq, kulrang, dashtning hamma yerida. Boshni tiniqlashtiradi.`, ICO.herb('#9aa88a'), 3, 8);
  MAT('mat_isiriq', `Isiriq|Исрык|Isiriq`, `Harmala seeds. Burned against the evil eye in every yard of the Tail.|Семена гармалы. В каждом дворе Хвоста их жгут от сглаза.|Isiriq urug'i. Dumning har bir hovlisida ko'z tegmasin deb tutatiladi.`, ICO.herb('#6a8a3a'), 3, 8);
  MAT('mat_sage', `Mountain sage|Горный шалфей|Tog' marmaragi`, `Soft, silver, smells of the Spine. Closes wounds.|Мягкий, серебристый, пахнет Хребтом. Затягивает раны.|Yumshoq, kumushrang, Tizma hidi keladi. Yaralarni bitiradi.`, ICO.herb('#a8c8b0'), 3, 10);
  MAT('mat_stone', `Carrier stone|Камень-носитель|Tosh-tashuvchi`, `A smooth river stone with a hole bored through. A tumar's heart sits on it.|Гладкий речной камень с просверлённой дырочкой. На нём держится сердце тумара.|Teshib qo'yilgan silliq daryo toshi. Tumarning yuragi shunga o'rnashadi.`, ICO.gem('#8a8070', '#c8c0b0'), 3, 15);
  MAT('mat_boneshard', `Bone carrier|Костяной носитель|Suyak tashuvchi`, `A knucklebone, cleaned and drilled. Holds memories that want to run.|Отмытая и просверленная косточка. Держит память, которая хочет сбежать.|Yuvilgan va teshilgan suyakcha. Qochmoqchi bo'lgan xotirani ushlab turadi.`, ICO.bone(), 3, 15);
  MAT('mat_turq', `Raw turquoise|Необработанная бирюза|Ishlov berilmagan feruza`, `Sky-coloured. Every bride in Yodgor wears one, for luck.|Цвета неба. В Ёдгоре её носит каждая невеста — на счастье.|Osmon rangida. Yodgorda har bir kelin omad uchun taqadi.`, ICO.gem('#2fb3b8', '#9ff3e6'), 1.5, 45, 1);
  MAT('mat_garnet', `Raw garnet|Необработанный гранат|Ishlov berilmagan granat`, `Red as pomegranate seeds. Keeps warmth, they say, and anger.|Красный, как зёрна граната. Хранит, говорят, тепло — и злость.|Anor donasidek qizil. Aytishlaricha, iliqlikni ham, g'azabni ham saqlaydi.`, ICO.gem('#a8202a', '#ff8a8a'), 1.5, 45, 1);
  MAT('mat_lapis', `Raw lapis|Необработанный лазурит|Ishlov berilmagan lojuvard`, `Deep blue with gold flecks, from the Spine. Cold to the touch even in summer.|Глубокая синева с золотыми искрами, с Хребта. Холодный на ощупь даже летом.|Oltin uchqunli to'q ko'k, Tizmadan. Yozda ham ushlasang sovuq.`, ICO.gem('#2a4ab8', '#8ab0ff'), 1.5, 45, 2);
  MAT('mat_leather', `Leather|Кожа|Charm`, `Tanned hide. For tumar pouches and straps.|Выделанная кожа. На мешочки для тумаров и ремешки.|Oshlangan teri. Tumar xaltachalari va tasmalar uchun.`, ICO.belt('#7a5a3a', '#4a3420'), 3, 12);
  MAT('mat_feather', `Eagle feather|Орлиное перо|Burgut pati`, `Long and barred. Berkut hunters say it remembers the wind.|Длинное, полосатое. Беркутчи говорят, оно помнит ветер.|Uzun, yo'l-yo'l. Burgutchilar aytadiki, u shamolni eslaydi.`, ICO.herb('#c8a878'), 1, 20, 1);
  MAT('mat_silk', `Silk|Шёлк|Shoyi`, `A length of Yodgor silk. Lighter than leather, and it holds a song.|Отрез ёдгорского шёлка. Легче кожи и держит песню.|Bir bo'lak Yodgor shoyisi. Charmdan yengil va qo'shiqni ushlab turadi.`, ICO.thread(), 1.5, 30, 1);
  MAT('mat_fang', `Fangs and claws|Клыки и когти|Qoziq tish va tirnoqlar`, `Trophies from beasts. Ground into brews; sewn into tumars of the hunt.|Трофеи со зверей. Толкут в отвары, вшивают в тумары охоты.|Hayvonlardan o'ljalar. Damlamalarga tuyiladi, ov tumarlariga tikiladi.`, ICO.bone(), 0, 10);
  MAT('mat_dust', `Hollow dust|Пыль Пустых|Bo'shlar changi`, `What is left of a shade or a Hollow when it falls: grey, weightless, faintly warm.|То, что остаётся от тени или Пустого, когда он падает: серое, невесомое, чуть тёплое.|Soya yoki bo'sh yiqilganda undan qoladigan narsa: kulrang, vaznsiz, biroz iliq.`, ICO.salt(), 0, 12);
  MAT('mat_food', `Provisions|Припасы|Oziq-ovqat`, `Rice, flour, a bit of mutton, onions, carrots. Enough for one dish.|Рис, мука, немного баранины, лук, морковь. На одно блюдо.|Guruch, un, ozgina qo'y go'shti, piyoz, sabzi. Bitta taomga yetadi.`, ICO.bowl('#c8a060', '#8a6a3a'), 0, 6);
  // the ids the notes' caches use (89m) → items
  const ALIAS = { iron: 'mat_iron', bulat: 'mat_bulat', bone: 'mat_boneshard', salt: 'mat_salt', thread: 'mat_thread', silk: 'mat_silk', wax_oil: 'mat_wax', wax_white: 'mat_wax_white', wax_black: 'mat_wax_black', stone: 'mat_stone', turquoise: 'mat_turq', garnet: 'mat_garnet', lapis: 'mat_lapis', leather: 'mat_leather', feather: 'mat_feather', herb_isiriq: 'mat_isiriq', herb_wormwood: 'mat_wormwood', herb_sage: 'mat_sage', fang: 'mat_fang', dust: 'mat_dust', food: 'mat_food' };
  const mid = k => ALIAS[k] || k;
  const nm = id => { const n = String(G.Items.defs[id] ? G.Items.defs[id].name : id); return n.indexOf('|') >= 0 ? t(n) : (window.__T ? window.__T(n) : n); };
  CRAFT.give = (k, n) => { const id = mid(k); if (!G.Items.defs[id]) { console.warn('[craft] no material', k); return; } YI.add(id, { n: n || 1 }); toast('+' + (n || 1) + ' ' + nm(id), '#c8d8a0'); };
  CRAFT.nm = nm;

  /* ================================================================ new brews and dishes */
  const CON = (id, name, desc, icon, use, price) => gear({ id, type: 'consumable', name, desc, icon, dropW: 0, price: price || 40, yd: { use } });
  CON('al_water', `Strong water|Крепкая вода|Quvvatli suv`, `Sage and salt boiled down. Mends 35% health at once.|Шалфей и соль, уваренные вместе. Сразу лечит 35% здоровья.|Birga qaynatilgan marmarak va tuz. Darhol 35% sog'liq tiklaydi.`, ICO.vial('#9ff3e6'), 'water', 45);
  CON('al_brine', `Brine of the flats|Рассол солончака|Sho'rxok sho'robi`, `3 min: poison and bleeding resistance +35%.|3 мин: сопротивление яду и кровотечению +35%.|3 daq.: zahar va qon ketishiga chidamlilik +35%.`, ICO.vial('#f4f0e8'), 'brine', 35);
  CON('al_waxward', `Wax-ward|Отвар от воска|Mumga qarshi damlama`, `3 min: wax resistance +50%. The Singers' songs slide off you.|3 мин: сопротивление воску +50%. Песни Певцов соскальзывают с тебя.|3 daq.: mumga chidamlilik +50%. Xonandalar qo'shig'i sendan sirg'alib ketadi.`, ICO.vial('#f2ead0'), 'waxward', 40);
  CON('al_smoke', `Isiriq smoke|Дым исрыка|Isiriq tutuni`, `5 min: Hollowness from magic −30%.|5 мин: Пустота от магии −30%.|5 daq.: sehrdan Bo'shliq −30%.`, ICO.herb('#6a8a3a'), 'smoke', 50);
  CON('al_wormwood', `Wormwood tincture|Настойка полыни|Shuvoq nastoykasi`, `3 min: +12% damage, but you take 6% more.|3 мин: +12% урона, но и получаешь на 6% больше.|3 daq.: +12% zarar, lekin o'zing ham 6% ko'proq olasan.`, ICO.vial('#9aa88a'), 'wormwood', 45);
  CON('al_ash', `Ash salve|Пепельная мазь|Kul malhami`, `3 min: burn resistance +50%.|3 мин: сопротивление горению +50%.|3 daq.: yonishga chidamlilik +50%.`, ICO.bowl('#5a5048', '#8a8078'), 'ash', 35);
  CON('al_nighteye', `Night-eye drops|Капли ночного глаза|Tungi ko'z tomchisi`, `3 min: enemies notice you 25% later.|3 мин: враги замечают тебя на 25% позже.|3 daq.: dushmanlar seni 25% kechroq payqaydi.`, ICO.vial('#5a4a8a'), 'nighteye', 45);
  CON('al_jackal', `Jackal broth|Шакалий отвар|Chiyabo'ri qaynatmasi`, `3 min: movement speed +10%.|3 мин: скорость бега +10%.|3 daq.: yugurish tezligi +10%.`, ICO.bowl('#8a6a44', '#c8a060'), 'jackal', 40);
  CON('fd_shurpa', `Shurpa|Шурпа|Sho'rva`, `10 min: damage taken −8%.|10 мин: получаемый урон −8%.|10 daq.: olinadigan zarar −8%.`, ICO.bowl('#a8602a', '#e8a860'), 'shurpa', 35);
  CON('fd_non', `Tandir bread|Тандырная лепёшка|Tandir non`, `Mends 15% health; 10 min: +5% health.|Лечит 15% здоровья; 10 мин: +5% здоровья.|15% sog'liq tiklaydi; 10 daq.: +5% sog'liq.`, ICO.samsa(), 'non', 15);
  CON('fd_navvot', `Tea with navvot|Чай с наввотом|Navvotli choy`, `10 min: stamina +15%.|10 мин: выносливость +15%.|10 daq.: chidam +15%.`, ICO.bowl('#c87a2a', '#ffe7a6'), 'navvot', 20);
  CON('fd_sumalak', `Sumalak|Сумаляк|Sumalak`, `A spring dish, stirred all night. Hollowness −1; 10 min: experience +10%.|Весеннее блюдо, которое мешают всю ночь. Пустота −1; 10 мин: опыт +10%.|Tun bo'yi kavlanadigan bahor taomi. Bo'shliq −1; 10 daq.: tajriba +10%.`, ICO.bowl('#6a3a1a', '#a8602a'), 'sumalak', 60);
  CON('fd_kazy', `Kazy|Казы|Qazi`, `Horse sausage, the travellers' kind. 10 min: +8% damage.|Конская колбаса, дорожная. 10 мин: +8% урона.|Ot go'shtidan qazi, yo'l uchun. 10 daq.: +8% zarar.`, ICO.ingot('#7a2a2a', '#c86a5a'), 'kazy', 50);
  const FX = {
    water: p => p.heal(Math.round(p.maxHp * 0.35)),
    brine: () => G.Buffs.add('al_brine', 180, { mods: { res_poison: v => v + 0.35, res_bleed: v => v + 0.35 } }),
    waxward: () => G.Buffs.add('al_waxward', 180, { mods: { res_wax: v => v + 0.5 } }),
    smoke: () => G.Buffs.add('al_smoke', 300, { mods: { voidMagic: v => v * 0.7 } }),
    wormwood: () => G.Buffs.add('al_wormwood', 180, { mods: { dmgOut: v => v * 1.12, dmgIn: v => v * 1.06 } }),
    ash: () => G.Buffs.add('al_ash', 180, { mods: { res_burn: v => v + 0.5 } }),
    nighteye: () => G.Buffs.add('al_nighteye', 180, { mods: { sightAll: v => v * 0.75 } }),
    jackal: () => G.Buffs.add('al_jackal', 180, { mods: { speed: v => v * 1.1 } }),
    shurpa: () => G.Buffs.add('fd_shurpa', 600, { mods: { dmgIn: v => v * 0.92 } }),
    non: p => { G.Buffs.add('fd_non', 600, { mods: { maxHp: v => v * 1.05 } }); CH().dirty(); CH().syncHp && CH().syncHp(); p.heal(Math.round(p.maxHp * 0.15)); },
    navvot: () => G.Buffs.add('fd_navvot', 600, { mods: { stamMax: v => v * 1.15 } }),
    sumalak: () => { addVoid(-1, `sumalak|сумаляк|sumalak`); G.Buffs.add('fd_sumalak', 600, { mods: { xp: v => v * 1.1 } }); },
    kazy: () => G.Buffs.add('fd_kazy', 600, { mods: { dmgOut: v => v * 1.08 } })
  };
  const CH = () => G.CH;
  {
    const use0 = YI.use;
    YI.use = u => {
      const e = YI.get(u); const d = e && G.Items.defs[e.id], k = d && d.yd && d.yd.use, p = G.world && G.world.player;
      if (k && FX[k] && p && !p.dead) {
        // one buff of a kind at a time: a second bowl renews it
        try { const L = G.Buffs.list(); const i = L.findIndex(b => b.id === e.id || b.id === 'al_' + k || b.id === 'fd_' + k); if (i >= 0) L.splice(i, 1); } catch (x) { /* ignore */ }
        FX[k](p); YI.remove(u, 1); sfx('drink'); CH().dirty();
        return true;
      }
      return use0(u);
    };
  }

  /* ================================================================ recipes */
  // [id, where, makes, needs {material: n}, price to learn (0 = known from the start)]
  const RC = CRAFT.RECIPES = [
    // brews (Zebo)
    ['r_water', 'herb', 'al_water', { herb_sage: 1, salt: 1 }, 0],
    ['r_bandage', 'herb', 'it_bandage', { thread: 1, herb_sage: 1 }, 0],
    ['r_antidote', 'herb', 'it_antidote', { herb_wormwood: 1, salt: 1 }, 40],
    ['r_firebrew', 'herb', 'it_firebrew', { herb_isiriq: 1, garnet: 1 }, 60],
    ['r_brine', 'herb', 'al_brine', { salt: 2, herb_sage: 1 }, 50],
    ['r_waxward', 'herb', 'al_waxward', { wax_white: 1, herb_sage: 1 }, 60],
    ['r_smoke', 'herb', 'al_smoke', { herb_isiriq: 2, wax_oil: 1 }, 70],
    ['r_wormwood', 'herb', 'al_wormwood', { herb_wormwood: 2, dust: 1 }, 80],
    ['r_ash', 'herb', 'al_ash', { salt: 1, wax_oil: 1, dust: 1 }, 50],
    ['r_nighteye', 'herb', 'al_nighteye', { dust: 2, herb_sage: 1 }, 80],
    ['r_jackal', 'herb', 'al_jackal', { fang: 2, food: 1 }, 50],
    ['r_tea', 'herb', 'it_bitter_tea', { herb_wormwood: 2, herb_isiriq: 1, herb_sage: 1 }, 120],
    // dishes (any chaikhana)
    ['r_plov', 'kitchen', 'it_plov', { food: 3 }, 0],
    ['r_samsa', 'kitchen', 'it_samsa', { food: 2 }, 0],
    ['r_non', 'kitchen', 'fd_non', { food: 1 }, 0],
    ['r_shurpa', 'kitchen', 'fd_shurpa', { food: 2, herb_sage: 1 }, 40],
    ['r_navvot', 'kitchen', 'fd_navvot', { food: 1, herb_isiriq: 1 }, 30],
    ['r_kazy', 'kitchen', 'fd_kazy', { food: 2, fang: 1 }, 60],
    ['r_sumalak', 'kitchen', 'fd_sumalak', { food: 3, herb_sage: 1 }, 100],
    ['r_shurpa_salt', 'kitchen', 'al_brine', { food: 1, salt: 2 }, 40],
    // tumars (Ma'ruf's wax workshop): wax + thread + carrier + charge
    ['t_salt', 'tumar', 'ch_salt', { wax_oil: 1, thread: 1, stone: 1, salt: 2 }, 0],
    ['t_widow', 'tumar', 'ch_widow', { wax_oil: 1, thread: 1, stone: 1, herb_sage: 2 }, 0],
    ['t_patience', 'tumar', 'ch_patience', { wax_white: 1, thread: 1, stone: 1, turquoise: 1 }, 120],
    ['t_fire', 'tumar', 'ch_fire', { wax_oil: 1, thread: 1, stone: 1, garnet: 1 }, 100],
    ['t_spine', 'tumar', 'ch_spine', { wax_oil: 1, thread: 1, stone: 1, lapis: 1 }, 100],
    ['t_wax', 'tumar', 'ch_wax', { wax_white: 2, thread: 1, bone: 1 }, 90],
    ['t_silence', 'tumar', 'ch_silence', { wax_white: 1, thread: 1, bone: 1, herb_isiriq: 2 }, 110],
    ['t_steel', 'tumar', 'ch_steel', { wax_oil: 1, thread: 1, iron: 2 }, 90],
    ['t_runner', 'tumar', 'ch_runner', { wax_oil: 1, thread: 1, bone: 1, fang: 2 }, 80],
    ['t_shadow', 'tumar', 'ch_shadow', { wax_black: 1, thread: 1, bone: 1, dust: 2 }, 130],
    ['t_hunger', 'tumar', 'ch_hunger', { wax_black: 1, thread: 1, bone: 1, fang: 3 }, 110],
    ['t_eye', 'tumar', 'ch_eye', { wax_white: 1, silk: 1, stone: 1, feather: 1, turquoise: 1 }, 140],
    ['t_stone', 'tumar', 'ch_stone', { wax_oil: 1, thread: 1, stone: 3 }, 80],
    ['t_loud', 'tumar', 'ch_loud', { wax_white: 1, silk: 1, bone: 1, feather: 2 }, 120],
    ['t_guard', 'tumar', 'ch_guard', { wax_oil: 1, leather: 2, thread: 1, iron: 1 }, 100],
    ['t_rage', 'tumar', 'ch_rage', { wax_black: 1, thread: 1, stone: 1, garnet: 2 }, 130]
  ];
  const RID = {}; RC.forEach(r => { RID[r[0]] = r; });
  CRAFT.known = () => { const k = S().known; return { have: RC.filter(r => !r[4] || k[r[0]]).length, all: RC.length }; };
  CRAFT.isKnown = id => { const r = RID[id]; return !!r && (!r[4] || !!S().known[id]); };
  CRAFT.learn = id => { const r = RID[id]; if (!r || CRAFT.isKnown(id)) return false; S().known[id] = 1; save(); toast(tf(`New recipe: {n}|Новый рецепт: {n}|Yangi retsept: {n}`, { n: nm(r[2]) }), '#c8d8a0'); sfx('scroll'); return true; };
  const can = r => Object.keys(r[3]).every(k => YI.count(mid(k)) >= r[3][k]);
  const needTxt = r => Object.keys(r[3]).map(k => { const n = r[3][k], h = YI.count(mid(k)); return nm(mid(k)) + ' ' + Math.min(h, n) + '/' + n; }).join(', ');
  CRAFT.make = id => {
    const r = RID[id]; if (!r || !CRAFT.isKnown(id) || !can(r)) return false;
    for (const k in r[3]) YI.take(mid(k), r[3][k]);
    YI.add(r[2]); CH().dirty(); save();
    return true;
  };
  CRAFT.can = id => !!RID[id] && can(RID[id]);
  // the menu: known recipes you can make first; the rest greyed out with what is missing
  const WHERE = {
    herb: `Zebo's pots: what to brew?|Горшки Зебо: что варить?|Zeboning qozonlari: nima qaynatamiz?`,
    kitchen: `The chaikhana's hearth: what to cook?|Очаг чайханы: что приготовить?|Choyxona o'chog'i: nima pishiramiz?`,
    tumar: `Ma'ruf's wax table: what to sew?|Восковой стол Маъруфа: что шить?|Ma'rufning mum stoli: nima tikamiz?`
  };
  function menu(where, done) {
    const L = RC.filter(r => r[1] === where && CRAFT.isKnown(r[0])).sort((a, b) => (can(b) ? 1 : 0) - (can(a) ? 1 : 0));
    const opts = L.slice(0, 12).map(r => ({ id: r[0], label: nm(r[2]) + ' — ' + needTxt(r), lock: can(r) ? null : `not enough|не хватает|yetmaydi` }));
    opts.push({ id: 'back', label: `Enough for now.|Пока хватит.|Hozircha yetadi.` });
    ask(WHERE[where], opts, o => {
      if (o.id === 'back') { done(); return; }
      if (CRAFT.make(o.id)) { sfx(where === 'tumar' ? 'ready' : 'drink'); toast(tf(`Made: {n}|Готово: {n}|Tayyor: {n}`, { n: nm(RID[o.id][2]) }), '#ffe7a6'); }
      menu(where, done);
    });
  }
  CRAFT.menu = menu;
  // buying a recipe from whoever teaches it
  function teach(where, done) {
    const L = RC.filter(r => r[1] === where && r[4] && !CRAFT.isKnown(r[0]));
    if (!L.length) { play([['', `There is nothing left they can teach you.|Больше им нечему тебя научить.|Ular senga o'rgatadigan boshqa narsa qolmadi.`]], done); return; }
    const opts = L.slice(0, 10).map(r => ({ id: r[0], price: r[4], label: nm(r[2]) + ' · ' + tf(`{n} tilla|{n} тилла|{n} tilla`, { n: r[4] }) }));
    opts.push({ id: 'back', label: `"Another time."|«В другой раз.»|«Boshqa safar.»` });
    ask(`Which recipe?|Какой рецепт?|Qaysi retsept?`, opts, o => { if (o.id !== 'back' && (G.run.gold || 0) >= o.price) { gold(-o.price); CRAFT.learn(o.id); } done(); });
  }
  CRAFT.teach = teach;

  /* ================================================================ where you craft */
  s6init(() => {
    const T0 = FAC.tradeOpts;
    FAC.tradeOpts = function (m) {
      const out = T0.apply(this, arguments);
      if (m === 'zebo') {
        out.push({ label: `— Let me use your pots.|— Дай поварить у тебя.|— Qozonlaringdan foydalanay.`, go: d => play([['zebo', `"Wash your hands first. Yodchi hands have been in everything."|«Сначала руки помой. Руки ёдчи где только не бывали».|«Avval qo'lingni yuv. Yodchining qo'li qayerga tegmagan deysan».`]], () => menu('herb', d)) });
        out.push({ label: `— Teach me a brew.|— Научи какому-нибудь отвару.|— Biror damlamani o'rgat.`, go: d => teach('herb', d) });
      }
      if (m === 'maruf') {
        out.push({ label: `— I want to sew a tumar at your wax table.|— Хочу сшить тумар за твоим восковым столом.|— Mum stolingda tumar tikmoqchiman.`, go: d => play([['maruf', `"The table's yours. Three turns, one knot. If you tie two, I'll know."|«Стол твой. Три оборота, один узел. Завяжешь два — я узнаю».|«Stol sening ixtiyoringda. Uch aylana, bitta tugun. Ikkita bog'lasang, bilib qolaman».`]], () => menu('tumar', d)) });
        out.push({ label: `— Show me a new pattern.|— Покажи новый узор.|— Yangi naqsh ko'rsat.`, go: d => teach('tumar', d) });
      }
      return out;
    };
    // Zebo and Ma'ruf sell what the crafts need
    try {
      const M = FAC.MERCH;
      const z0 = M.zebo.stock; M.zebo.stock = () => z0().concat([['material', d => /mat_(wormwood|isiriq|sage)$/.test(d.id), 3]]);
      const m0 = M.maruf.stock; M.maruf.stock = () => m0().concat([['material', d => /mat_(stone|boneshard|leather|thread)$/.test(d.id), 2]]);
    } catch (e) { console.error('[craft] merchants', e); }
  });
  // at a chaikhana: cook, and buy provisions
  if (G.WORLD2 && G.WORLD2.restOpts) {
    G.WORLD2.restOpts.push(() => ({ label: `Cook at the hearth|Готовить у очага|O'choqda ovqat pishirish`, run(done) { menu('kitchen', done); } }));
    G.WORLD2.restOpts.push(() => ({ label: `Buy provisions (6 tilla)|Купить припасы (6 тилла)|Oziq-ovqat olish (6 tilla)`, run(done) {
      const opts = [1, 3, 5].map(n => ({ id: n, price: 6 * n, label: tf(`{n} × provisions · {p} tilla|{n} × припасы · {p} тилла|{n} × oziq-ovqat · {p} tilla`, { n, p: 6 * n }) }));
      opts.push({ id: 0, label: `Nothing.|Ничего.|Hech narsa.` });
      ask(`The cook weighs out rice and onions.|Повар отвешивает рис и лук.|Oshpaz guruch va piyoz tortib beradi.`, opts, o => { if (o.id && (G.run.gold || 0) >= o.price) { gold(-o.price); YI.add('mat_food', { n: o.id }); sfx('coin'); } done(); });
    } }));
  }

  /* ================================================================ ingredients in the world */
  // herbs: one or two patches in each open region, gathered once a journey
  const HERB = {
    tail: ['isiriq', .35], potters: ['isiriq', .68], bazaar: ['isiriq', .3], rabat: ['wormwood', .3, 'wormwood', .72], tower: ['wormwood', .45],
    mines: ['sage', .42], spine: ['sage', .3, 'sage', .66], withers: ['sage', .45], old: ['wormwood', .55], cistern: ['sage', .4],
    karez: ['wormwood', .45], cloister: ['sage', .62], ark: ['isiriq', .58], streets: ['wormwood', .7], sand: ['wormwood', .4]
  };
  if (G.ObjArt) {
    G.ObjArt.w2herb = (ctx, o) => {
      const x = Math.round(o.x), y = Math.round(o.y), c = o.hc || '#7a9a4a', k = Math.sin((G.time || 0) * 1.4 + x) * .6;
      ctx.fillStyle = '#3a4a24'; ctx.fillRect(x - 4, y - 1, 9, 1);
      for (let i = -3; i <= 3; i += 2) { ctx.fillStyle = c; ctx.fillRect(x + i + Math.round(k * (i / 3)), y - 4 - Math.abs(i % 3), 1, 4 + Math.abs(i % 3)); }
      ctx.fillStyle = '#e8f0c0'; ctx.fillRect(x + Math.round(k), y - 6, 1, 1);
    };
  }
  const HC = { isiriq: '#6a8a3a', wormwood: '#9aa88a', sage: '#a8c8b0' };
  const HPROMPT = { isiriq: `Gather isiriq|Собрать исрык|Isiriq terish`, wormwood: `Gather wormwood|Собрать полынь|Shuvoq terish`, sage: `Gather sage|Собрать шалфей|Marmarak terish` };
  for (const reg in HERB) {
    const R0 = G.WORLD2 && G.WORLD2.regions && G.WORLD2.regions[reg]; if (!R0 || !R0.objects) continue;
    const a = HERB[reg];
    for (let i = 0; i < a.length; i += 2) {
      const h = a[i];
      R0.objects.push({ kind: 'relic', id: 'herb_' + reg + i, at: { frac: a[i + 1] }, art: 'w2herb', hc: HC[h], prompt: HPROMPT[h] });
    }
  }
  // the relic kind plays lines or gives at once; herbs give at once, so hook the take
  {
    const W2 = G.WORLD2, take0 = W2.take;
    W2.take = function (id) {
      const r = take0.apply(this, arguments);
      try { const m = /^herb_([a-z]+?)(\d+)$/.exec(String(id).replace(/^.*:/, '')); if (m) { const h = HERB[m[1]] && HERB[m[1]][+m[2]]; if (h) CRAFT.give('mat_' + h, 2); } } catch (e) { console.error('[craft] herb', e); }
      return r;
    };
  }
  // trophies: beasts drop fangs, the Hollow and shades drop dust (chance, straight into the satchel)
  const BEASTS = /bori|sher|snake|scorpion|rat|eel|leech|ibex|berkut|tiger|crow|worm/;
  const HOLLOWS = /hollow|prisoner|dummy|shade|ghul|walker|nightmare|guest|drowned|ember|jinn|peri|albasty_kin/;
  G.Events.on('kill', e => {
    try {
      if (!e || !e.def || e.isBoss || !G.run || !R().world) return;
      const id = String((G.CODEX && G.CODEX.baseOf(e.def)) || e.def.id);
      const k = e.elite ? 1 : 0.18;
      if (BEASTS.test(id) && Math.random() < k) CRAFT.give('mat_fang', e.elite ? 2 : 1);
      else if (HOLLOWS.test(id) && Math.random() < k) CRAFT.give('mat_dust', e.elite ? 2 : 1);
      else if (/guard|merc|gilded|warden|jailer|spearman/.test(id) && Math.random() < k * 0.6) CRAFT.give('mat_leather', 1);
      else if (/berkut|crow/.test(id) && Math.random() < 0.15) CRAFT.give('mat_feather', 1);
    } catch (x) { /* ignore */ }
  });

  /* ================================================================ recipes found in the notes' caches (89m) */
  const FOUND = { tail_children: 'r_antidote', pot_kiln: 't_fire', baz_thief: 't_guard', kar_map: 'r_brine', ark_clerk: 't_patience', clo_wax: 't_wax',
    rab_smuggler: 'r_smoke', tow_widow: 'r_jackal', str_coins: 't_steel', min_vein: 't_rage', cis_boats: 'r_waxward', old_digger: 't_stone',
    spi_hunter: 't_loud', wit_kite: 't_eye', wel_offering: 't_silence', hea_vein: 't_shadow', dre_list: 'r_nighteye', wed_groom: 'r_sumalak',
    san_well: 'r_tea', hou_dutar: 'r_kazy' };
  try { for (const b in FOUND) { const B = G.CODEX && G.CODEX.BOOK[b]; if (B && B.cache) B.cache.recipe = FOUND[b]; } } catch (e) { console.error('[craft] found', e); }
}
