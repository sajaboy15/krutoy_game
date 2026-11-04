/* =====================================================================
   Stage 5 — the rest of the open city (GDD ch.3): 13 regions more, the
   seven lairs, fourteen chaikhanas in all, the links of the five tiers.
   Geography only (data); who may pass where, and when, is the story's
   business (85c_world_story.js sets ex.when on the exits named here).

     surface   Tail · Potters · Bazaar (stage 4) · Rabat and the Salt Road ·
               Tower of Silence · Ark and the Divan gardens · Cloister
     under     Upper Karez (stage 4) · Swallowed Streets · Great Cistern ·
               Salt Mines · Old Yodgor
     heights   Spine of the Sleeper · Withers and the Sky Caravanserai
     depths    Founders' Well · the Heart
     dream     the Dream of the City, the Drowned Wedding, the Year of Sand,
               Your House (four zones; the fifth, the Nightmare's nest, is a lair)
   A lair (def.arena) is a region the engine builds as a boss arena; its gate
   leads back out (def.out). Looks: lengthened variants of the land biomes
   of 60_world.js (wider levels, more structure), graded for the new places.
   ===================================================================== */
(function worldMore() {
  const K = G.BiomeKit, DEFS = G.Biomes.defs;
  if (!K || !W2) { console.error('[world5] libraries missing'); return; }
  const TOD = { night: '#46528e', dusk: '#ffa070' };
  const LN = id => (typeof LANDS !== 'undefined' && LANDS[id] && LANDS[id].name) || null;
  const RN = id => (typeof RESTS !== 'undefined' && RESTS[id] && RESTS[id].name) || null;
  const BL = id => (typeof BOSSES !== 'undefined' && BOSSES[id]) || {};

  /* ================================================================ looks: wider versions of the land biomes */
  const V = (base, id, o, tod) => {
    if (!DEFS[base]) { console.warn('[world5] no base biome', base); return null; }
    try { const d = K.variant(base, id, o); if (tod) d.w2tod = TOD; return d; } catch (e) { console.error('[world5] biome', id, e); return null; }
  };
  const seg = (o) => Object.assign({ building: 3, terrace: 3, plain: 2, hills: 2, bridge: 1.5, colonnade: 1, tower: 1.5, chasm: 1, cliff: 1.5, islands: 0.6, arena: 1.5 }, o || {});
  V('yd_salt', 'w_rabat', { gen: { width: 470, enemies: [1, 2], segments: seg({ plain: 4, hills: 3, building: 2, terrace: 2 }) } }, true);
  V('yd_salt', 'w_tower', {
    gen: { width: 380, enemies: [1, 2], segments: seg({ tower: 3, cliff: 3, plain: 1, building: 1 }) },
    gradeTiles: [{ map: [[0, '#0e0c10'], [0.4, '#4a4448'], [0.75, '#9a9088'], [1, '#e0d8c8']], k: 0.6 }, { sat: 0.6 }],
    gradeBg: [{ sat: 0.45 }, { mul: '#b0a8a8' }], gradeSky: [{ sat: 0.4 }, { mul: '#a8a0a8' }],
    def: { music: 'yd_ash' }
  }, true);
  V('yd_ark', 'w_ark', { gen: { width: 480, enemies: [1, 2], segments: seg({ colonnade: 3, building: 4, terrace: 3 }) } }, true);
  V('yd_cloister', 'w_cloister', { gen: { width: 440, enemies: [1, 2], segments: seg({ tower: 3, colonnade: 2, terrace: 3, building: 3 }) } }, true);
  V('yd_streets', 'w_streets', { gen: { width: 440, enemies: [1, 3], segments: seg({ building: 4, chasm: 2 }) } });
  V('yd_streets', 'w_mines', {
    gen: { width: 400, enemies: [1, 3], segments: seg({ cliff: 3, chasm: 2, building: 1, colonnade: 0.5 }) },
    gradeTiles: [{ map: [[0, '#14161a'], [0.4, '#5a6068'], [0.75, '#b8c0c8'], [1, '#f4f8fc']], k: 0.55 }, { sat: 0.5 }],
    gradeBg: [{ sat: 0.5 }, { mul: '#c8d0d8' }], def: { music: 'yd_salt' }
  });
  V('yd_karez', 'w_cistern', {
    gen: { cols: 8, enemies: [2, 3] },
    gradeTiles: [{ map: [[0, '#04100e'], [0.4, '#0e4a4a'], [0.75, '#3aa0a0'], [1, '#bff4ec']], k: 0.5 }],
    def: { music: 'yd_tunnels' }
  });
  V('yd_old', 'w_old', { gen: { width: 480, enemies: [1, 3], segments: seg({ building: 3, colonnade: 2, chasm: 1.5 }) } });
  V('yd_spine', 'w_spine', { gen: { width: 480, enemies: [1, 3], segments: seg({ cliff: 3, hills: 3, islands: 1.5, chasm: 1.5 }) } });
  V('yd_spine', 'w_withers', {
    gen: { width: 380, enemies: [1, 3], segments: seg({ islands: 3, cliff: 2, building: 2, plain: 2 }) },
    gradeTiles: [{ map: [[0, '#140c1c'], [0.4, '#5a3a6a'], [0.75, '#c8a0c0'], [1, '#fff0e0']], k: 0.4 }],
    gradeSky: [{ mul: '#e8c8f0' }, { add: '#100818' }]
  });
  V('yd_well', 'w_well', { gen: { width: 400, enemies: [1, 3], segments: seg({ cliff: 3, chasm: 2, tower: 2 }) } });
  V('yd_heart', 'w_heart', { gen: { cols: 9, enemies: [2, 3] } });
  V('yd_dream_city', 'w_dream', { gen: { width: 440, enemies: [1, 3] } });
  V('yd_wedding', 'w_wedding', { gen: { width: 400, enemies: [1, 3] } });
  V('yd_sand', 'w_sand', { gen: { width: 400, enemies: [1, 3] } });
  V('yd_house', 'w_house', { gen: { width: 360, enemies: [1, 3] } });
  for (const id of ['w_rabat', 'w_tower', 'w_ark', 'w_cloister', 'w_streets', 'w_mines', 'w_cistern', 'w_old', 'w_spine', 'w_withers', 'w_well', 'w_heart', 'w_dream', 'w_wedding', 'w_sand', 'w_house']) if (!DEFS[id]) console.warn('[world5] biome missing', id);

  /* ================================================================ the four stage-4 regions: new links */
  const R0 = W2.regions;
  // the bazaar's chaikhana gives its old name to the salt well on the Salt Road (where Rustam's route drinks, r_salt)
  { const b = R0.bazaar.objects.find(o => o.kind === 'chai'); if (b) b.name = `Chaikhana of the Copper Row|Чайхана Медного ряда|Mis rastasi choyxonasi`; }
  R0.tail.exits.rabat.to = ['rabat', 'tail'];
  R0.potters.exits.west.to = ['tower', 'east'];
  R0.bazaar.exits.east.to = ['ark', 'west'];
  R0.bazaar.exits.stair.to = ['cloister', 'west'];
  R0.potters.objects.push(
    { kind: 'chai', id: 'potters_kiln', at: { frac: 0.12 }, look: 'yd_chai_dusk', name: `Chaikhana by the Cold Kiln|Чайхана у холодной печи|Sovuq xumdon choyxonasi`, seed: 21, wall: '#b07a54', wallD: '#7a4a2c' },
    { kind: 'spot', id: 'mem', at: { frac: 0.74 } }
  );
  R0.potters.stones = [
    `"Clay remembers the hand that shaped it. Wax remembers nothing. Seal the tumar with wax." The potters' guild rule.|«Глина помнит руку, что её лепила. Воск не помнит ничего. Запечатывай тумар воском». Правило цеха гончаров.|«Loy uni yasagan qo'lni eslaydi. Mum hech narsani eslamaydi. Tumarni mum bilan muhrla». Kulollar uyushmasining qoidasi.`,
    `Scratched on a kiln: "Fired three hundred bowls for a Divan wedding. Not one came back."|Нацарапано на печи: «Обжёг триста чаш к свадьбе в Диване. Ни одна не вернулась».|Xumdonga tirnab yozilgan: «Devondagi to'y uchun uch yuzta kosa pishirdim. Bittasi ham qaytmadi».`
  ];
  R0.potters.memory = { id: 'm_w_potters', lines: [
    ['memory', `You are seven. A potter lets you press your palm into a wet bowl before the firing. "Now it will remember you," he says.|Тебе семь. Гончар разрешает тебе вдавить ладонь в сырую чашу перед обжигом. «Теперь она тебя запомнит», — говорит он.|Yetti yoshdasan. Kulol kuydirishdan oldin ho'l kosaga kaftingni bosishga ruxsat beradi. «Endi u seni eslab qoladi», deydi u.`],
    ['memory', `A year later you see the bowl on a nobleman's table in the Bazaar, full of sherbet. Your hand is still in it. Nobody notices.|Через год ты видишь эту чашу на столе какого-то вельможи на Базаре, полную шербета. Твоя ладонь всё ещё в ней. Никто не замечает.|Bir yildan keyin o'sha kosani bozorda, qandaydir a'yonning dasturxonida, sharbatga to'la holda ko'rasan. Kafting hali ham unda. Hech kim sezmaydi.`]
  ] };
  R0.bazaar.objects.push({ kind: 'spot', id: 'story', at: { frac: 0.42 } }, { kind: 'spot', id: 'mem', at: { frac: 0.22 } });
  R0.tail.objects.push({ kind: 'spot', id: 'story', at: { frac: 0.58 } }, { kind: 'spot', id: 'mem', at: { frac: 0.66 } });
  R0.karez.objects.push({ kind: 'spot', id: 'story', at: { frac: 0.62 } }, { kind: 'spot', id: 'mem', at: { frac: 0.38 } });
  // the karez joins everything from below (GDD ch.3): the Ark's cellar, the Cloister's archive drain,
  // the Salt Mines, the sluice down to the Swallowed Streets and the flooded way to Old Yodgor
  {
    const k = R0.karez, roomAt = frac => list => { const cols = Math.max(...list.map(r => r.c)) + 1, c = Math.min(cols - 1, Math.round(frac * (cols - 1))); return list.filter(r => r.c === c).sort((a, b) => a.r - b.r)[0]; };
    const lowAt = frac => list => { const rows = Math.max(...list.map(r => r.r)); const cand = list.filter(r => r.r >= rows - 1); cand.sort((a, b) => Math.abs(a.c - frac * 9) - Math.abs(b.c - frac * 9)); return cand[0] || roomAt(frac)(list); };
    delete k.exits.deeper.key;
    k.exits.deeper.locked = null;
    k.exits.deeper.label = `The sluice to the Swallowed Streets|Шлюз к Проглоченным улицам|Yutilgan ko'chalarga shlyuz`;
    k.exits.cellar = { kind: 'shaft', room: roomAt(0.9), dx: 0.25, to: ['ark', 'cellar'], key: 'light', label: `A crack up into a cellar|Трещина вверх, в погреб|Yuqoriga, yerto'laga ochilgan yoriq`, locked: `Only a crack in the rock. Something is written beside it, too faint to read in the dark.|Просто трещина в камне. Рядом что-то написано, но в темноте не разобрать.|Toshdagi oddiy yoriq. Yonida nimadir yozilgan, lekin qorong'ida o'qib bo'lmaydi.` };
    k.exits.archive = { kind: 'shaft', room: roomAt(0.7), dx: 0.7, to: ['cloister', 'drain'], key: 'light', label: `Up the archive drain|Вверх по стоку архива|Arxiv ariqchasidan yuqoriga`, locked: `Only a crack in the rock. Something is written beside it, too faint to read in the dark.|Просто трещина в камне. Рядом что-то написано, но в темноте не разобрать.|Toshdagi oddiy yoriq. Yonida nimadir yozilgan, lekin qorong'ida o'qib bo'lmaydi.` };
    k.exits.mines = { kind: 'gate', room: lowAt(0.08), to: ['mines', 'karez'], trim: '#c8d0d8', label: `The convicts' gallery to the Salt Mines|Галерея каторжных к Соляным шахтам|Mahkumlar yo'lagi — Tuz konlariga` };
    // Davron's "old karez mouths behind the dunes": a hidden way between the Rabat and the karez (Sado's light shows the hatch)
    k.exits.dunes = { kind: 'shaft', room: roomAt(0.26), dx: 0.5, to: ['rabat', 'mouths'], label: `Up the old karez mouth to the dunes|Наверх по старому устью кяриза, к барханам|Eski koriz og'zidan yuqoriga, barxanlarga` };
    k.exits.sluice = { kind: 'dive', room: lowAt(0.32), to: ['old', 'karez'], key: 'water', label: `The flooded sluice|Затопленный шлюз|Suv bosgan shlyuz` };
  }

  /* ================================================================ helpers */
  const chai = (id, frac, look, name, o) => Object.assign({ kind: 'chai', id, at: { frac }, look, name, seed: (id.length * 7) % 29 + 3 }, o || {});
  const spot = (id, frac) => ({ kind: 'spot', id, at: { frac } });
  const bossGate = (to, frac, o) => Object.assign({ kind: 'gate', at: { frac }, to: [to, 'start'], trim: '#5a1a1a', seal: '#8a2a2a', label: BL(o && o.boss).lair || `A lair|Логово|Uya` }, o || {});
  const roomFrac = frac => list => { const s = list.slice().sort((a, b) => a.ox - b.ox); return s[Math.min(s.length - 1, Math.floor(frac * s.length))]; };
  const lowRoom = frac => list => { const rows = Math.max(...list.map(r => r.r)); const cand = list.filter(r => r.r >= rows - 1).sort((a, b) => a.ox - b.ox); return cand[Math.min(cand.length - 1, Math.floor(frac * cand.length))] || list[0]; };

  /* ================================================================ 6. THE RABAT AND THE SALT ROAD */
  W2.region('rabat', {
    name: LN('a1_rabat') || `The Rabat and the Salt Road|Рабат и Соляная дорога|Rabot va Tuz yo'li`,
    sub: `Forty rooms around a well, forty days for a stranger|Сорок комнат вокруг колодца, сорок дней для чужака|Quduq atrofida qirq xona, musofirga qirq kun`,
    tier: 'surface', act: 1, stage: 1.2, seed: 81051, biome: 'w_rabat',
    map: { x: 0.085, y: 0.43, w: 0.12, h: 0.08, col: '#e8d8b8' },
    night: { extra: 5, pool: [['yd_scavenger', 8], ['assassin', 4], ['jinn', 2]] },
    exits: {
      tail: { at: 'right', to: ['tail', 'rabat'], label: `Back to the Tail|Назад, в Хвост|Dumga qaytish` },
      road: { at: 'left', to: ['tower', 'salt'], label: `The Salt Road to the Tower of Silence|Соляной тракт к Башне Молчания|Tuz yo'li — Sukunat minorasiga` },
      mouths: { kind: 'shaft', hidden: true, to: ['karez', 'dunes'], prompt: `Down the old karez mouth|Вниз, в старое устье кяриза|Eski koriz og'ziga tushish` },
      mines: { kind: 'gate', at: { frac: 0.36 }, to: ['mines', 'rabat'], key: 'divan_seal', trim: '#c8d0d8', seal: '#a8323a', label: `The convicts' descent to the Salt Mines|Спуск каторжных в Соляные шахты|Mahkumlar tushadigan yo'l — Tuz konlariga`, locked: `Divan guards at the descent. "Debtors go down. Others show the Seal."|Стража Дивана у спуска. «Вниз — только должники. Остальные — с Печатью».|Tushish yo'lida Devon soqchilari. «Pastga faqat qarzdorlar tushadi. Qolganlar — muhr bilan».` }
    },
    objects: [
      chai('rabat_salt', 0.18, 'yd_chai_dusk', RN('r_salt') || `Chaikhana by the Salt Well|Чайхана у солёного колодца|Sho'r quduq choyxonasi`, { wall: '#c8a878', wallD: '#8a6a44' }),
      { kind: 'house', id: 'sarai', at: { frac: 0.55 }, w: 16, h: 5, doors: { w: 'open', e: 'shortcut' }, inside: [{ kind: 'cache', dx: 0.7 }], barred: `The caravanserai's back gate. Barred from the yard.|Задние ворота караван-сарая. Засов со двора.|Karvonsaroyning orqa darvozasi. Hovli tomondan zulfinlangan.` },
      { kind: 'hooktower', id: 'minaret', at: { frac: 0.7 }, h: 12, top: [{ kind: 'cache', loot: 'gold' }] },
      { kind: 'sealed', id: 'salt', at: { frac: 0.9 }, side: 'w' },
      { kind: 'divandoor', id: 'customs', at: { frac: 0.28 } },
      { kind: 'miniboss', id: 'raider', at: { frac: 0.62 }, enemy: 'assassin', hpMul: 1.6, adds: ['yd_scavenger', 'yd_scavenger'] },
      { kind: 'stall', id: 'caravan', shop: 'rabat', at: { frac: 0.45 }, kinds: ['material', 'consumable', 'charm'] },
      { kind: 'lightfloor', id: 'mouths', at: { frac: 0.11 }, below: [{ kind: 'exit', exit: 'mouths' }] },
      spot('story', 0.8), spot('mem', 0.64), spot('well', 0.5), spot('dunes', 0.08)
    ]
  });

  /* ================================================================ 7. THE TOWER OF SILENCE AND THE GRAVEYARD OF TUMARS */
  W2.region('tower', {
    name: `The Tower of Silence|Башня Молчания|Sukunat minorasi`, sub: `The graveyard of empty tumars|Кладбище пустых тумаров|Bo'sh tumarlar qabristoni`,
    tier: 'surface', act: 1, stage: 1.6, seed: 82061, biome: 'w_tower',
    map: { x: 0.08, y: 0.24, w: 0.1, h: 0.1, col: '#a09890' },
    night: { extra: 6, pool: [['yd_hollow', 10], ['zindan_prisoner', 4]], elite: true },
    stones: [
      `"Here the empty are laid down. Here no one sings." Carved at the foot of the Tower.|«Здесь кладут пустых. Здесь никто не поёт». Вырезано у подножия Башни.|«Bu yerga bo'shlarni yotqizishadi. Bu yerda hech kim kuylamaydi». Minora poyiga o'yib yozilgan.`,
      `A heap of empty tumars, the wax cracked, the cords rotted. Thousands of them. Crows nest in the cords.|Груда пустых тумаров: воск потрескался, шнурки истлели. Их тысячи. В шнурках гнездятся вороны.|Bo'sh tumarlar uyumi: mumi yorilgan, iplari chirigan. Ular minglab. Iplar orasida qarg'alar in qurgan.`
    ],
    memory: { id: 'm_w_tower', lines: [
      ['memory', `Rustam-aka teaches you to tie a tumar cord: three turns, one knot, never two. "Two knots and the memory chokes," he says.|Рустам-ака учит тебя завязывать шнурок тумара: три оборота, один узел, никогда два. «Два узла — и память задохнётся», — говорит он.|Rustam aka senga tumar ipini bog'lashni o'rgatadi: uch aylana, bitta tugun, hech qachon ikkita emas. «Ikki tugun bo'lsa, xotira bo'g'iladi», deydi u.`],
      ['memory', `You tie two anyway, to see. He doesn't shout. He just unties it, slowly, as if it hurts him.|Ты всё равно завязываешь два — проверить. Он не кричит. Просто развязывает, медленно, будто ему больно.|Sen baribir ikkita bog'laysan — sinab ko'rish uchun. U baqirmaydi. Faqat sekin yechadi, go'yo og'riyotgandek.`],
      ['hero', `He was a good teacher. That's the worst part.|Он был хорошим учителем. Вот что хуже всего.|U yaxshi ustoz edi. Eng yomoni ham shu.`]
    ] },
    exits: {
      east: { at: 'right', to: ['potters', 'west'], label: `To the Potters' Quarter|В Квартал гончаров|Kulollar mahallasiga` },
      salt: { at: 'left', to: ['rabat', 'road'], label: `The Salt Road to the Rabat|Соляной тракт к Рабату|Tuz yo'li — Rabotga` },
      top: bossGate('tower_top', 0.56, { boss: 'kempir', label: BL('kempir').lair || `Up the Tower|Наверх, на Башню|Minoraga chiqish` })
    },
    objects: [
      { kind: 'lightwall', id: 'ossuary', at: { frac: 0.3 }, inside: [{ kind: 'cache' }] },
      { kind: 'hooktower', id: 'crows', at: { frac: 0.8 }, h: 13, top: [{ kind: 'cache' }] },
      { kind: 'sealed', id: 'urns', at: { frac: 0.18 }, side: 'e' },
      { kind: 'miniboss', id: 'vulture', at: { frac: 0.42 }, enemy: 'yd_hollow', hpMul: 1.8, adds: ['yd_hollow', 'zindan_prisoner'] },
      spot('mem', 0.7), spot('story', 0.5)
    ]
  });

  /* ================================================================ 4. THE ARK AND THE GARDENS OF THE DIVAN */
  W2.region('ark', {
    name: LN('a1_ark') || `The Ark: Gardens of the Divan|Арк: сады Дивана|Ark: Devon bog'lari`,
    sub: `Sweet water in marble channels|Сладкая вода в мраморных арыках|Marmar ariqlarda shirin suv`,
    tier: 'surface', act: 1, stage: 1.4, seed: 83071, biome: 'w_ark',
    map: { x: 0.81, y: 0.315, w: 0.13, h: 0.09, col: '#e0b860' },
    night: { extra: 4, pool: [['guard', 8], ['assassin', 5]] },
    exits: {
      west: { at: 'left', to: ['bazaar', 'east'], label: `The gate to the Bazaar|Ворота на Базар|Bozorga darvoza` },
      court: bossGate('court', 0.82, { boss: 'hound' }),
      cellar: { kind: 'well', inHouse: true, to: ['karez', 'cellar'], prompt: `Down through Tilla-bek's cellar|Вниз, через погреб Тилла-бека|Tilla-bekning yerto'lasi orqali pastga` },
      updraft: { kind: 'gate', onTower: true, to: ['spine', 'ark'], key: 'breath', trim: '#c8e0f0', label: `The air currents up to the Spine|Воздушные потоки к Хребту|Umurtqaga ko'tariluvchi havo oqimlari` }
    },
    objects: [
      chai('ark_wall', 0.14, 'yd_chai_dusk', RN('r_ark') || `Chaikhana under the Ark Wall|Чайхана под стеной Арка|Ark devori tagidagi choyxona`, { wall: '#d8b888', wallD: '#a07a50' }),
      { kind: 'house', id: 'cellar', at: { frac: 0.36 }, w: 15, h: 5, doors: { w: 'locked', e: 'shortcut' }, key: 'divan_seal', locked: `A cedar door under the Divan's seal: Tilla-bek's cellar of a thousand childhoods.|Кедровая дверь под печатью Дивана: погреб «тысячи детств» Тилла-бека.|Devon muhri bosilgan sadr eshik: Tilla-bekning «ming bolalik» yerto'lasi.`, barred: `Barred from inside the cellar.|Заперто изнутри погреба.|Yerto'la ichidan zulfinlangan.`, inside: [{ kind: 'exit_well', exit: 'cellar', dx: 0.3 }, { kind: 'cache', dx: 0.75 }, { kind: 'relic', dx: 0.55, key: 'stolen_seal', prompt: `Take the spare seal off the steward's hook|Снять запасную печать с крючка распорядителя|Xizmatchining ilgagidan zaxira muhrni olish`, lines: [['', `A row of hooks by the cellar stairs, each with a steward's seal on a cord. Nobody counts the spares.|Ряд крючков у лестницы погреба, на каждом — печать распорядителя на шнурке. Запасные никто не считает.|Yerto'la zinasi yonida bir qator ilgaklar, har birida ipga osilgan xizmatchi muhri. Zaxiralarini hech kim sanamaydi.`]] }] },
      { kind: 'updraft', id: 'cracks', at: { frac: 0.62 }, h: 14, top: [{ kind: 'exit', exit: 'updraft' }] },
      { kind: 'hooktower', id: 'pavilion', at: { frac: 0.5 }, h: 11, top: [{ kind: 'cache' }] },
      { kind: 'divandoor', id: 'treasury', at: { frac: 0.72 } },
      { kind: 'miniboss', id: 'steward', at: { frac: 0.44 }, enemy: 'guard', hpMul: 1.7, adds: ['guard', 'assassin'] },
      spot('story', 0.9), spot('mem', 0.58), spot('roses', 0.25)
    ]
  });

  /* ================================================================ 5. THE CLOISTER OF THE SINGERS */
  W2.region('cloister', {
    name: LN('a1_cloister') || `The Cloister of the Singers|Обитель Певцов|Xonandalar xonaqohi`,
    sub: LANDS.a1_cloister && LANDS.a1_cloister.sub || `White walls over the mouth of the Well|Белые стены над устьем Колодца|Quduq og'zi ustidagi oq devorlar`,
    tier: 'surface', act: 1, stage: 1.6, seed: 84081, biome: 'w_cloister',
    map: { x: 0.665, y: 0.175, w: 0.12, h: 0.08, col: '#c8d4f0' },
    night: { extra: 4, pool: [['torch_zealot', 8], ['yd_hollow', 5]] },
    exits: {
      west: { at: 'left', to: ['bazaar', 'stair'], label: `Down the Singers' stair to the Bazaar|Вниз по лестнице Певцов, на Базар|Xonandalar zinasidan pastga, bozorga` },
      choir: bossGate('choir', 0.74, { boss: 'choir' }),
      drain: { kind: 'well', inHouse: true, art: 'w2drain', to: ['karez', 'archive'], prompt: `Down the archive drain into the karez|Вниз по стоку архива, в кяризы|Arxiv ariqchasidan pastga, korizlarga` },
      wall: { kind: 'gate', onTower: true, to: ['spine', 'cloister'], trim: '#e8eef8', label: `Along the outer wall up to the Spine|По внешней стене вверх, к Хребту|Tashqi devor bo'ylab yuqoriga, Umurtqaga` },
      depth: { kind: 'gate', at: { frac: 0.92 }, to: ['well', 'cloister'], trim: '#1a2a4a', seal: '#e8e0d0', label: `The shaft down to the Founders' Well|Шахта вниз, к Колодцу основателей|Asoschilar qudug'iga tushadigan shaxta` }
    },
    objects: [
      chai('cloister_guest', 0.12, 'yd_chai_dusk', `The Pilgrims' Guesthouse|Странноприимный дом|Ziyoratchilar mehmonxonasi`, { wall: '#e0e0e8', wallD: '#a8b0c0', wallL: '#f4f4f8' }),
      { kind: 'house', id: 'archive', at: { frac: 0.3 }, w: 16, h: 5, doors: { w: 'locked', e: 'shortcut' }, key: 'well_sign', locked: `A white door with the blue Sign of the Well: the archive of the debt books.|Белая дверь с синим Знаком Колодца: архив долговых книг.|Ko'k Quduq belgisi tushirilgan oq eshik: qarz daftarlari arxivi.`, barred: `Barred from inside the archive.|Заперто изнутри архива.|Arxiv ichidan zulfinlangan.`, inside: [{ kind: 'exit_well', exit: 'drain', dx: 0.25 }, { kind: 'cache', dx: 0.7, loot: self => { try { G.Pickups.gold(self.x, self.y - 10, 60); if (!(G.CH && G.CH.grantLegend && G.CH.grantLegend('first_wax'))) G.YITEMS.openCache(self, G.world.player); } catch (e) { console.error(e); } } }] },
      { kind: 'hooktower', id: 'bells', at: { frac: 0.52 }, h: 14, w: 6, top: [{ kind: 'exit', exit: 'wall' }, { kind: 'cache', dx: -1.6 }] },
      { kind: 'singersdoor', id: 'cells', at: { frac: 0.64 } },
      { kind: 'songdoor', id: 'bakhshi', at: { frac: 0.85 } },
      { kind: 'miniboss', id: 'warden', at: { frac: 0.42 }, enemy: 'torch_zealot', hpMul: 1.7, adds: ['torch_zealot'] },
      spot('story', 0.68), spot('mem', 0.2)
    ]
  });

  /* ================================================================ 11. THE SALT MINES */
  W2.region('mines', {
    name: `The Salt Mines|Соляные шахты|Tuz konlari`, sub: `Debtors cut salt from the Sleeper's body|Должники рубят соль из тела Спящего|Qarzdorlar Uxlovchining tanasidan tuz qazishadi`,
    tier: 'under', act: 2, stage: 3.6, seed: 85091, biome: 'w_mines', outdoor: false,
    map: { x: 0.13, y: 0.64, w: 0.12, h: 0.08, col: '#d0d8e0' },
    stones: [
      `"Salt does not remember. Salt is honest." Carved over the shaft by someone who never had to cut it.|«Соль не помнит. Соль честна». Вырезано над шахтой — тем, кому самому рубить её не пришлось.|«Tuz eslamaydi. Tuz halol». Shaxta ustiga o'yib yozilgan — uni o'zi qazishiga to'g'ri kelmagan kimsa tomonidan.`,
      `Tally marks on the wall, in rows of seven. Under the last row, a child's drawing of a horse.|Зарубки на стене, рядами по семь. Под последним рядом — детский рисунок лошади.|Devorda yettitadan qator-qator chiziqlar. Oxirgi qator ostida — bolaning chizgan oti.`
    ],
    memory: { id: 'm_w_mines', lines: [
      ['memory', `Your first round with Rustam-aka, down in the mines. A debtor pays with the last thing he has: the smell of rain on salt.|Твой первый обход с Рустамом-ака, внизу, в шахтах. Должник платит последним, что у него есть: запахом дождя на соли.|Rustam aka bilan birinchi aylanishing, pastda, konlarda. Qarzdor oxirgi bor narsasi bilan to'laydi: tuz ustidagi yomg'ir hidi bilan.`],
      ['memory', `On the way up Rustam-aka buys you a hot flatbread and says nothing. You understand that this is how he says sorry.|На обратном пути Рустам-ака покупает тебе горячую лепёшку и молчит. Ты понимаешь: так он просит прощения.|Qaytishda Rustam aka senga issiq non olib beradi va indamaydi. Tushunasan: u shunday kechirim so'raydi.`]
    ] },
    exits: {
      rabat: { at: 'left', to: ['rabat', 'mines'], label: `Up to the Rabat|Наверх, в Рабат|Yuqoriga, Rabotga` },
      karez: { at: 'right', to: ['karez', 'mines'], label: `The convicts' gallery to the karez|Галерея каторжных к кяризам|Mahkumlar yo'lagi — korizlarga` }
    },
    objects: [
      chai('mines_camp', 0.5, 'yd_chai_under', `The Debtors' Kettle|Котёл должников|Qarzdorlar qozoni`, { wall: '#9aa0a8', wallD: '#5a6068', wallL: '#c8d0d8' }),
      { kind: 'divandoor', id: 'stores', at: { frac: 0.3 } },
      { kind: 'lightwall', id: 'vein', at: { frac: 0.7 }, inside: [{ kind: 'chest' }] },
      { kind: 'cache', id: 'tally', at: { frac: 0.82 } },
      { kind: 'miniboss', id: 'overseer', at: { frac: 0.62 }, enemy: 'jailer', hpMul: 1.6, adds: ['zindan_prisoner', 'zindan_prisoner'] },
      spot('mem', 0.4), spot('story', 0.2)
    ]
  });

  /* ================================================================ 9. THE SWALLOWED STREETS */
  W2.region('streets', {
    name: LN('a2_streets') || `The Swallowed Streets|Проглоченные улицы|Yutilgan ko'chalar`,
    sub: `A whole street the wall swallowed|Целая улица, проглоченная стеной|Devor yutib yuborgan butun bir ko'cha`,
    tier: 'under', act: 2, stage: 4.8, seed: 86101, biome: 'w_streets', outdoor: false,
    map: { x: 0.33, y: 0.7, w: 0.14, h: 0.08, col: '#6a7a80' },
    exits: {
      east: { at: 'right', to: ['karez', 'deeper'], label: `Up the sluice to the karez|Вверх по шлюзу, в кяризы|Shlyuzdan yuqoriga, korizlarga` },
      west: { at: 'left', to: ['cistern', 'streets'], label: `On to the Great Cistern|Дальше, к Большой цистерне|Davom — Katta sardobaga` }
    },
    objects: [
      chai('buried', 0.16, 'yd_chai_under', `Chaikhana in a Swallowed House|Чайхана в погребённом доме|Ko'milgan uydagi choyxona`, { wall: '#6a6460', wallD: '#3a3634', wallL: '#8a8480' }),
      { kind: 'songdoor', id: 'tellers', at: { frac: 0.4 } },
      { kind: 'divandoor', id: 'cache', at: { frac: 0.72 } },
      { kind: 'lightwall', id: 'shop', at: { frac: 0.55 }, inside: [{ kind: 'cache' }] },
      { kind: 'miniboss', id: 'looter', at: { frac: 0.6 }, enemy: 'yd_scavenger', hpMul: 1.9, adds: ['yd_hollow', 'yd_hollow'] },
      spot('story', 0.84), spot('mem', 0.3)
    ]
  });

  /* ================================================================ 10. THE GREAT CISTERN (rooms) */
  W2.region('cistern', {
    name: `The Great Cistern|Большая цистерна|Katta sardoba`, sub: `A flooded dome under the old streets|Затопленный купол под старыми улицами|Eski ko'chalar ostidagi suv bosgan gumbaz`,
    tier: 'under', act: 2, stage: 5.0, seed: 87111, biome: 'w_cistern', outdoor: false,
    map: { x: 0.55, y: 0.72, w: 0.12, h: 0.08, col: '#3aa0a0' },
    stones: [
      `"For the Water Festival, the boats go out from the north stair." The stair ends in black water.|«На Праздник воды лодки отходят от северной лестницы». Лестница уходит в чёрную воду.|«Suv bayramida qayiqlar shimoliy zinadan jo'naydi». Zina qora suvga tushib ketadi.`,
      `Children's tumars, tied to the roots in bunches, like onions drying. The water licks at the lowest.|Детские тумары, связанные пучками на корнях, как лук на просушке. Вода лижет нижние.|Bolalar tumarlari ildizlarga dasta-dasta bog'langan, xuddi quritilayotgan piyozdek. Suv eng pastdagilarini yalaydi.`
    ],
    memory: { id: 'm_w_cistern', lines: [
      ['memory', `The Water Festival. All the Tail goes down to the old cistern and floats lamps on little boats. Yours sinks first. Everyone laughs, and so do you.|Праздник воды. Весь Хвост спускается к старой цистерне и пускает лампы на лодочках. Твоя тонет первой. Все смеются — и ты тоже.|Suv bayrami. Butun Dum eski sardobaga tushib, qayiqchalarda chiroq suzdiradi. Seningki birinchi bo'lib cho'kadi. Hamma kuladi, sen ham.`],
      ['memory', `That was the last year they held it. The next spring the Singers sealed the cistern "for the Well".|Это был последний год, когда его устраивали. Следующей весной Певцы запечатали цистерну «для Колодца».|O'sha yil bayram oxirgi marta o'tkazildi. Keyingi bahor xonandalar sardobani «Quduq uchun» muhrlab qo'yishdi.`]
    ] },
    exits: {
      streets: { kind: 'shaft', room: roomFrac(0.99), dx: 0.5, to: ['streets', 'west'], label: `Up to the Swallowed Streets|Наверх, к Проглоченным улицам|Yuqoriga, Yutilgan ko'chalarga` },
      lair: Object.assign(bossGate('lair', 0.5, { boss: 'albasty' }), { room: lowRoom(0.4) }),
      dive: { kind: 'dive', room: lowRoom(0.05), to: ['old', 'cistern'], key: 'water', label: `The flooded tunnel to Old Yodgor|Затопленный тоннель к Старому Ёдгору|Eski Yodgorga suv bosgan tunnel` }
    },
    objects: [
      chai('last_lamp', 0.75, 'yd_chai_under', RN('r_lamp') || `The Last Lamp|Последняя лампа|So'nggi chiroq`, { wall: '#4a5a58', wallD: '#2a3634', wallL: '#6a7a78' }),
      { kind: 'lightwall', id: 'roots', at: { frac: 0.3 }, inside: [{ kind: 'cache' }] },
      { kind: 'divepool', id: 'festival', at: { frac: 0.6 } },
      { kind: 'chest', id: 'boats', at: { frac: 0.2 } },
      // the Albasty's claw, left on the ledge of her nest (after her: b_cistern) — the legend 'albasty'
      { kind: 'relic', id: 'claw', at: { frac: 0.5 }, art: 'w2claw', legend: 'albasty', when: () => !!(R().at && R().at['done:b_cistern']),
        prompt: `Take the Albasty's claw|Взять коготь Албасты|Albastining tirnog'ini olish`,
        lines: [['', `Washed up by the lair's grate: one of her claws, long as a sickle, still cold. The water around it is quiet.|У решётки логова его вынесло водой: один из её когтей, длинный, как серп, и всё ещё холодный. Вода вокруг тиха.|Uya panjarasi yonida suv chiqarib tashlagan: uning tirnoqlaridan biri, o'roqdek uzun, hali ham sovuq. Atrofidagi suv jim.`],
          ['sado', `Take it. She kept them in the dark. Let something of hers go out into the light.|Возьми. Она держала их в темноте. Пусть хоть что-то от неё выйдет на свет.|Ol. U ularni qorong'ida saqlardi. Undan hech bo'lmasa bir narsa yorug'likka chiqsin.`]] },
      { kind: 'miniboss', id: 'leechmother', at: { frac: 0.85 }, enemy: 'yd_albasty_kin', hpMul: 1.6, adds: ['yd_leech', 'yd_leech', 'yd_leech'] },
      spot('mem', 0.45)
    ]
  });

  /* ================================================================ 12. OLD YODGOR */
  W2.region('old', {
    name: LN('a2_old') || `Old Yodgor|Старый Ёдгор|Eski Yodgor`,
    sub: `Crimson ruins, the den of Those Who Remember|Багровые руины, логово Помнящих|Qizg'ish xarobalar, Eslaganlar ini`,
    tier: 'under', act: 2, stage: 5.6, seed: 88121, biome: 'w_old', outdoor: false,
    map: { x: 0.78, y: 0.64, w: 0.14, h: 0.09, col: '#a84a3a' },
    exits: {
      karez: { kind: 'dive', at: { frac: 0.06 }, to: ['karez', 'sluice'], key: 'water', label: `The flooded sluice up to the karez|Затопленный шлюз наверх, в кяризы|Suv bosgan shlyuz — yuqoriga, korizlarga` },
      cistern: { kind: 'dive', at: { frac: 0.22 }, to: ['cistern', 'dive'], key: 'water', label: `The flooded tunnel to the Great Cistern|Затопленный тоннель к Большой цистерне|Katta sardobaga suv bosgan tunnel` },
      ribs: { kind: 'gate', at: { frac: 0.6 }, to: ['spine', 'ribs'], trim: '#e8d8c8', label: `Up the ribs to the Spine|Вверх по рёбрам, к Хребту|Qovurg'alar bo'ylab yuqoriga, Umurtqaga` },
      depth: { kind: 'gate', at: { frac: 0.94 }, to: ['well', 'old'], trim: '#1a2a4a', label: `The shaft down to the Founders' Well|Шахта вниз, к Колодцу основателей|Asoschilar qudug'iga tushadigan shaxta` }
    },
    objects: [
      chai('ribs', 0.5, 'yd_chai_under', RN('r_rib') || `Chaikhana in the Ribs|Чайхана в рёбрах|Qovurg'alar orasidagi choyxona`, { wall: '#c8b8a8', wallD: '#8a7a6a', wallL: '#e8d8c8' }),
      { kind: 'songdoor', id: 'teller', at: { frac: 0.36 } },
      { kind: 'hooktower', id: 'dome', at: { frac: 0.76 }, h: 13, top: [{ kind: 'cache' }] },
      { kind: 'lightwall', id: 'crypt', at: { frac: 0.3 }, inside: [{ kind: 'chest' }] },
      { kind: 'updraft', id: 'rift', at: { frac: 0.68 }, h: 15, top: [{ kind: 'cache', loot: 'gold' }] },
      { kind: 'miniboss', id: 'masked', at: { frac: 0.44 }, enemy: 'assassin', hpMul: 1.8, adds: ['yd_hollow'] },
      spot('story', 0.86), spot('mem', 0.14)
    ]
  });

  /* ================================================================ 13. THE SPINE OF THE SLEEPER */
  W2.region('spine', {
    name: LN('a2_spine') || `The Spine of the Sleeper|Хребет Спящего|Uxlovchining umurtqasi`,
    sub: `Snow on the vertebrae, wind for wings|Снег на позвонках, ветер-трамплин|Umurtqalarda qor, qanot bo'ladigan shamol`,
    tier: 'heights', act: 2, stage: 6.9, seed: 89131, biome: 'w_spine',
    map: { x: 0.48, y: 0.09, w: 0.2, h: 0.08, col: '#e8f0f8' },
    exits: {
      ribs: { at: 'left', to: ['old', 'ribs'], label: `Down the ribs to Old Yodgor|Вниз по рёбрам, в Старый Ёдгор|Qovurg'alar bo'ylab pastga, Eski Yodgorga` },
      cloister: { kind: 'gate', at: { frac: 0.22 }, to: ['cloister', 'wall'], trim: '#e8eef8', label: `Down the outer wall to the Cloister|Вниз по внешней стене, в Обитель|Tashqi devor bo'ylab pastga, xonaqohga` },
      ark: { kind: 'gate', at: { frac: 0.44 }, to: ['ark', 'updraft'], trim: '#c8e0f0', label: `Down the air currents to the Ark|Вниз по воздушным потокам, в Арк|Havo oqimlari bo'ylab pastga, Arkka` },
      withers: { kind: 'gate', onTower: true, to: ['withers', 'spine'], key: 'breath', trim: '#e8c8f0', label: `Up the winds to the Withers|Вверх по ветрам, на Холку|Shamollar bo'ylab yuqoriga, Yag'ringa` }
    },
    objects: [
      chai('spine_chai', 0.32, 'yd_chai_night', RN('r_spine') || `Chaikhana on the Spine|Чайхана на хребте|Umurtqadagi choyxona`, { wall: '#d8dce8', wallD: '#8a90a0', wallL: '#f4f8fc' }),
      { kind: 'updraft', id: 'winds', at: { frac: 0.86 }, h: 15, top: [{ kind: 'exit', exit: 'withers' }] },
      { kind: 'updraft', id: 'gust', at: { frac: 0.62 }, h: 13, top: [{ kind: 'cache' }] },
      { kind: 'hooktower', id: 'vertebra', at: { frac: 0.54 }, h: 12, top: [{ kind: 'cache', loot: 'gold' }] },
      { kind: 'sealed', id: 'shepherd', at: { frac: 0.12 }, side: 'e' },
      { kind: 'miniboss', id: 'snowcat', at: { frac: 0.72 }, enemy: 'yd_hollow', hpMul: 2.0, adds: ['yd_hollow'] },
      spot('story', 0.78), spot('mem', 0.66)
    ]
  });

  /* ================================================================ 14. THE WITHERS AND THE SKY CARAVANSERAI */
  W2.region('withers', {
    name: `The Withers and the Sky Caravanserai|Холка и Небесный караван-сарай|Yag'rin va Samoviy karvonsaroy`,
    sub: `The last caravanserai above the clouds|Последний караван-сарай над облаками|Bulutlar ustidagi so'nggi karvonsaroy`,
    tier: 'heights', act: 2, stage: 7.2, seed: 90141, biome: 'w_withers',
    map: { x: 0.8, y: 0.08, w: 0.12, h: 0.08, col: '#d8b8e0' },
    stones: [
      `"Traders from the edge of the world: pay the Rabat, not the Well. Up here, no one is sung." Painted over the caravanserai gate.|«Торговцы с края света: платите Рабату, не Колодцу. Здесь, наверху, никого не выпевают». Написано над воротами караван-сарая.|«Dunyo chetidan kelgan savdogarlar: Rabotga to'lang, Quduqqa emas. Bu yerda, tepada, hech kimni kuylab bo'shatishmaydi». Karvonsaroy darvozasi ustiga yozilgan.`,
      `A bowl of snow on a stone, left as an offering. Someone has drawn a leopard's paw in the snow.|Чаша снега на камне, оставленная как подношение. Кто-то нарисовал на снегу лапу барса.|Tosh ustida nazr qilib qoldirilgan bir kosa qor. Kimdir qorga barsning panjasini chizib qo'ygan.`
    ],
    memory: { id: 'm_w_withers', lines: [
      ['memory', `Rustam-aka points up at the Spine, white with snow above the roofs. "Caravans from the edge of the world stop up there. One day I'll take you." He never did.|Рустам-ака показывает на Хребет, белый от снега над крышами. «Там, наверху, останавливаются караваны с края света. Когда-нибудь возьму тебя». Так и не взял.|Rustam aka tomlar ustida qordan oqargan Umurtqani ko'rsatadi. «Ana u yerda dunyo chetidan kelgan karvonlar to'xtaydi. Bir kun seni olib boraman». Olib bormadi.`],
      ['hero', `Well. I'm here now, Rustam-aka.|Ну вот. Я здесь, Рустам-ака.|Mana. Men shu yerdaman, Rustam aka.`]
    ] },
    exits: {
      spine: { at: 'left', to: ['spine', 'withers'], label: `Down the winds to the Spine|Вниз по ветрам, на Хребет|Shamollar bo'ylab pastga, Umurtqaga` },
      shrine: bossGate('shrine', 0.78, { boss: 'barys' })
    },
    objects: [
      chai('sky_sarai', 0.3, 'yd_chai_night', `The Sky Caravanserai|Небесный караван-сарай|Samoviy karvonsaroy`, { wall: '#d8c8e0', wallD: '#8a7a9a', wallL: '#f4ecf8' }),
      { kind: 'updraft', id: 'cloud', at: { frac: 0.55 }, h: 15, top: [{ kind: 'cache', loot: 'gold' }] },
      { kind: 'stall', id: 'edge', shop: 'sky', at: { frac: 0.18 }, kinds: ['weapon', 'armour', 'mod'] },
      { kind: 'sealed', id: 'bales', at: { frac: 0.9 }, side: 'w' },
      { kind: 'miniboss', id: 'eagle', at: { frac: 0.66 }, enemy: 'assassin', hpMul: 2.0, adds: ['jinn'] },
      spot('mem', 0.45), spot('story', 0.6)
    ]
  });

  /* ================================================================ 15. THE FOUNDERS' WELL */
  W2.region('well', {
    name: LN('a2_well') || `The Founders' Well|Колодец основателей|Asoschilar qudug'i`,
    sub: `Candle galleries, black water|Свечные галереи, чёрная вода|Sham galereyalari, qora suv`,
    tier: 'deep', act: 2, stage: 6.1, seed: 91151, biome: 'w_well', outdoor: false,
    map: { x: 0.63, y: 0.835, w: 0.13, h: 0.07, col: '#3a4a7a' },
    exits: {
      cloister: { at: 'left', to: ['cloister', 'depth'], label: `Up the shaft to the Cloister|Вверх по шахте, в Обитель|Shaxtadan yuqoriga, xonaqohga` },
      old: { kind: 'gate', at: { frac: 0.3 }, to: ['old', 'depth'], trim: '#a84a3a', label: `Up the shaft to Old Yodgor|Вверх по шахте, в Старый Ёдгор|Shaxtadan yuqoriga, Eski Yodgorga` },
      bottom: bossGate('bottom', 0.62, { boss: 'seven' }),
      heart: { at: 'right', to: ['heart', 'well'], label: `Down the black throat to the Heart|Вниз, чёрным горлом, к Сердцу|Qora bo'g'iz orqali pastga, Yurakka` }
    },
    objects: [
      { kind: 'lightwall', id: 'names', at: { frac: 0.45 }, inside: [{ kind: 'cache' }] },
      { kind: 'singersdoor', id: 'candles', at: { frac: 0.2 } },
      { kind: 'miniboss', id: 'inspector', at: { frac: 0.8 }, enemy: 'torch_zealot', hpMul: 2.0, adds: ['yd_hollow', 'yd_hollow'] },
      spot('story', 0.52), spot('mem', 0.38)
    ]
  });

  /* ================================================================ 16. THE HEART (rooms) */
  W2.region('heart', {
    name: LN('a2_heart') || `The Heart|Сердце|Yurak`, sub: `Walls that beat|Стены, которые бьются|Uradigan devorlar`,
    tier: 'deep', act: 2, stage: 7.8, seed: 92161, biome: 'w_heart', outdoor: false,
    map: { x: 0.42, y: 0.82, w: 0.12, h: 0.07, col: '#8a2a3a' },
    exits: {
      well: { kind: 'shaft', room: roomFrac(0.0), dx: 0.4, to: ['well', 'heart'], label: `Back up to the Well|Назад, наверх, к Колодцу|Orqaga, yuqoriga, Quduqqa` }
    },
    objects: [
      { kind: 'lightwall', id: 'vein', at: { frac: 0.5 }, inside: [{ kind: 'cache' }] },
      spot('story', 0.9), spot('mem', 0.6)
    ]
  });

  /* ================================================================ 17. THE DREAM OF THE CITY — four zones (and the nest) */
  W2.region('dream', {
    name: LN('a3_dream') || `The Dream of the City|Сон о городе|Shahar tushi`, sub: LANDS.a3_dream && LANDS.a3_dream.sub || '',
    tier: 'dream', act: 3, stage: 8.3, seed: 93171, biome: 'w_dream',
    map: { x: 0.5, y: 0.93, w: 0.14, h: 0.06, col: '#6a7ad8' },
    exits: {
      wedding: { at: 'right', to: ['wedding', 'dream'], label: LN('a3_wedding') },
      sand: { at: 'left', to: ['sand', 'dream'], label: LN('a3_sand') },
      house: { kind: 'gate', at: { frac: 0.66 }, to: ['house', 'dream'], trim: '#5a3a22', seal: '#2a6a8a', label: LN('a3_house') }
    },
    objects: [
      chai('dream_chai', 0.4, 'yd_chai_dream', RN('r_dream') || `The Dream Chaikhana|Чайхана во сне|Tushdagi choyxona`, { wall: '#8a8ac8', wallD: '#4a4a8a', wallL: '#c8c8f0' }),
      { kind: 'hooktower', id: 'lamps', at: { frac: 0.62 }, h: 12, top: [{ kind: 'cache' }] },
      { kind: 'sealed', id: 'mornings', at: { frac: 0.2 }, side: 'e' },
      spot('story', 0.86), spot('mem', 0.55)
    ]
  });
  W2.region('wedding', {
    name: LN('a3_wedding') || `The Drowned Wedding|Утонувшая свадьба|Cho'kkan to'y`, sub: LANDS.a3_wedding && LANDS.a3_wedding.sub || '',
    tier: 'dream', act: 3, stage: 8.7, seed: 94181, biome: 'w_wedding',
    map: { x: 0.7, y: 0.93, w: 0.12, h: 0.06, col: '#3a6a9a' },
    exits: { dream: { at: 'left', to: ['dream', 'wedding'], label: LN('a3_dream') } },
    objects: [{ kind: 'divepool', id: 'dowry', at: { frac: 0.5 } }, spot('story', 0.86), spot('mem', 0.6)]
  });
  W2.region('sand', {
    name: LN('a3_sand') || `The Year of Sand|Год Песка|Qum yili`, sub: LANDS.a3_sand && LANDS.a3_sand.sub || '',
    tier: 'dream', act: 3, stage: 9.1, seed: 95191, biome: 'w_sand',
    map: { x: 0.3, y: 0.93, w: 0.12, h: 0.06, col: '#d8b060' },
    exits: { dream: { at: 'right', to: ['dream', 'sand'], label: LN('a3_dream') } },
    objects: [{ kind: 'updraft', id: 'dune', at: { frac: 0.45 }, h: 13, top: [{ kind: 'cache' }] }, spot('story', 0.14), spot('mem', 0.6)]
  });
  W2.region('house', {
    name: LN('a3_house') || `Your House|Твой дом|Sening uying`, sub: LANDS.a3_house && LANDS.a3_house.sub || '',
    tier: 'dream', act: 3, stage: 9.6, seed: 96201, biome: 'w_house',
    map: { x: 0.88, y: 0.93, w: 0.1, h: 0.06, col: '#c89a64' },
    exits: {
      dream: { at: 'left', to: ['dream', 'house'], label: LN('a3_dream') },
      nest: bossGate('nest', 0.9, { boss: 'aidahar' })
    },
    objects: [spot('story', 0.6), spot('mem', 0.3)]
  });

  /* ================================================================ the lairs: boss arenas built by the engine */
  const lair = (id, boss, biome, out, act, stage) => W2.region(id, {
    name: BL(boss).lair || BL(boss).name || id, sub: BL(boss).lairSub || '', tier: W2.regions[out[0]].tier, act, stage, seed: 1,
    arena: { boss, biome }, out, beat: null, exits: {}, objects: []
  });
  lair('tower_top', 'kempir', 'yd_tower', ['tower', 'top'], 1, 1.74);
  lair('court', 'hound', 'yd_court', ['ark', 'court'], 1, 3.04);
  lair('choir', 'choir', 'yd_choir_hall', ['cloister', 'choir'], 1, 3.91);
  lair('lair', 'albasty', 'yd_cistern', ['cistern', 'lair'], 2, 5.22);
  lair('bottom', 'seven', 'yd_well_bottom', ['well', 'bottom'], 2, 6.52);
  lair('shrine', 'barys', 'yd_withers', ['withers', 'shrine'], 2, 7.39);
  lair('nest', 'aidahar', 'yd_nest', ['house', 'nest'], 3, 10);
  W2.isArena = id => !!(W2.regions[id] && W2.regions[id].arena);
  // stage-4 placeholders are gone; every region loads
  for (const id in W2.regions) { delete W2.regions[id].todo; delete W2.regions[id]._todo; }

  /* ================================================================ shops and people of the new regions */
  W2.shop('rabat', { open: [6, 21] });
  W2.shop('sky', { open: [7, 19] });
  const talker = (id, name, look, lines, sched) => {
    W2.npc(id, { name, look, talk(done) { play([['', pick(lines)]], done); } });
    W2.schedule(id, sched);
  };
  talker('caravaneer', `A caravan woman|Караванщица|Karvonchi ayol`, { robe: '#8a6a3a', trim: '#e2b452', skin: '#b08060', head: 'scarf', headC: '#a8323a' }, [
    `"Forty days. Then pay, leave, or the Well. My camels have better rights than my children."|«Сорок дней. Потом плати, уходи или Колодец. У моих верблюдов прав больше, чем у моих детей».|«Qirq kun. Keyin to'la, ket yoki Quduq. Tuyalarimning haqqi bolalarimnikidan ko'proq».`,
    `"The salt pans eat your boots in a week and your feet in a month. Buy good boots, yodchi."|«Солончаки съедают сапоги за неделю, а ноги — за месяц. Купи хорошие сапоги, ёдчи».|«Sho'rxok etikni bir haftada, oyoqni bir oyda yeydi. Yaxshi etik ol, yodchi».`
  ], [{ from: 6, to: 21, region: 'rabat', spot: 'well' }]);
  talker('gardener', `A Divan gardener|Садовник Дивана|Devon bog'boni`, { robe: '#3a5a3a', trim: '#c8a040', skin: '#a07858', head: 'doppi', headC: '#1a3a1a', beard: 'short' }, [
    `"Roses drink first, then the horses, then us. The order of the Ark."|«Сначала пьют розы, потом кони, потом мы. Порядок Арка».|«Avval atirgullar ichadi, keyin otlar, keyin biz. Arkning tartibi shu».`,
    `"There's a cellar under the pavilion. I don't go near it. The children in there laugh all night, and none of them are real."|«Под павильоном погреб. Я туда не хожу. Там дети смеются всю ночь, и ни один из них не настоящий».|«Ayvon tagida yerto'la bor. Men u yerga yaqinlashmayman. U yerda bolalar tuni bilan kulishadi, birortasi ham haqiqiy emas».`
  ], [{ from: 6, to: 20, region: 'ark', spot: 'roses' }]);
  talker('novice', `A novice Singer|Послушница Певцов|Xonandalar shogirdasi`, { robe: '#e8e8f0', trim: '#3a6ab0', skin: '#c8a080', head: 'scarf', headC: '#e8e8f0' }, [
    `"We practise the Pledge Song on stones. If the stone cracks, we sang it right."|«Песню залога мы разучиваем на камнях. Треснул камень — значит, спели правильно».|«Garov qo'shig'ini toshlarda mashq qilamiz. Tosh yorilsa, to'g'ri kuylagan bo'lamiz».`,
    `"Ustoz says the Well is grateful. I've never heard it say thank you."|«Устоз говорит, что Колодец благодарен. Я ни разу не слышала, чтобы он сказал спасибо».|«Ustoz Quduq minnatdor deydi. Uning rahmat deganini hech eshitmaganman».`
  ], [{ from: 7, to: 19, region: 'cloister', spot: 'story' }]);
  talker('debtor', `A debtor|Должник|Qarzdor`, { robe: '#5a5a60', trim: '#8a8a90', skin: '#a08068', head: 'none', beard: 'long' }, [
    `"Three more years of salt and my grandson is free. Or four. They change the sum when it rains."|«Ещё три года соли — и внук свободен. Или четыре. Сумма меняется, когда идёт дождь».|«Yana uch yil tuz — keyin nevaram ozod. Yoki to'rt. Yomg'ir yog'sa, hisob o'zgaradi».`,
    `"They say the salt down here is the Sleeper's sweat. Then he's afraid of something. You don't sweat this much for nothing."|«Говорят, здешняя соль — пот Спящего. Значит, он чего-то боится. Столько не потеют просто так».|«Bu yerdagi tuz Uxlovchining teri, deyishadi. Demak, u nimadandir qo'rqyapti. Bekordan-bekorga bunchalik terlamaydi».`
  ], [{ from: 0, to: 24, region: 'mines', spot: 'story' }]);
  talker('skytrader', `A trader from the edge of the world|Торговец с края света|Dunyo chetidan kelgan savdogar`, { robe: '#5a3a6a', trim: '#e8c8f0', skin: '#d8b090', head: 'turban', headC: '#e8c8f0', beard: 'short' }, [
    `"Where I come from, memories aren't sold. We just forget them, like honest people."|«Там, откуда я, воспоминаниями не торгуют. Мы их просто забываем, как честные люди».|«Men kelgan joyda xotira sotilmaydi. Biz ularni oddiygina unutamiz, halol odamlardek».`,
    `"The white leopard took two of my mules. I don't mind. It asked first, in its way."|«Белый барс забрал двух моих мулов. Я не в обиде. Он сначала спросил — по-своему».|«Oq bars ikkita xachirimni olib ketdi. Xafa emasman. Avval so'radi — o'zicha».`
  ], [{ from: 7, to: 19, region: 'withers', spot: 'story' }]);
  /* ================================================================ more secrets (GDD ch.3: 2–4 per region) */
  {
    const more = (r, list) => { const d = W2.regions[r]; if (d) for (const o of list) if (!d.objects.some(q => q.id === o.id && q.kind === o.kind)) d.objects.push(o); };
    more('bazaar', [{ kind: 'lightwall', id: 'debtors', at: { frac: 0.14 }, inside: [{ kind: 'cache' }] }]);
    more('withers', [{ kind: 'hooktower', id: 'prayerpole', at: { frac: 0.42 }, h: 13, top: [{ kind: 'cache', loot: 'gold' }] }]);
    more('well', [{ kind: 'sealed', id: 'founders', at: { frac: 0.9 }, side: 'w' }]);
    more('heart', [{ kind: 'chest', id: 'valve', at: { frac: 0.3 } }]);
    more('dream', [{ kind: 'lightwall', id: 'nursery', at: { frac: 0.8 }, inside: [{ kind: 'cache' }] }]);
    more('wedding', [{ kind: 'sealed', id: 'gifts', at: { frac: 0.25 }, side: 'e' }]);
    more('sand', [{ kind: 'sealed', id: 'buried', at: { frac: 0.82 }, side: 'w' }]);
    more('house', [{ kind: 'lightwall', id: 'cupboard', at: { frac: 0.45 }, inside: [{ kind: 'cache' }] }, { kind: 'sealed', id: 'attic', at: { frac: 0.78 }, side: 'w' }]);
  }

  /* ================================================================ townsfolk: 3–8 people per region (GDD ch.3) */
  // each stands at a spot of its region by its hours (W2.schedule); two or three lines, picked at random.
  // Spots they need are added here as well; dx keeps two people at one spot apart.
  {
    const addSpot = (r, id, frac) => { const d = W2.regions[r]; if (d && !d.objects.some(o => o.kind === 'spot' && o.id === id)) d.objects.push(spot(id, frac)); };
    const folk = (id, r, sp, frac, hours, name, look, lines, dx) => {
      addSpot(r, sp, frac);
      W2.npc(id, { name, look, dx: dx || 0, talk(done) { play([['', pick(lines)]], done); } });
      W2.schedule(id, [{ from: hours[0], to: hours[1], region: r, spot: sp }]);
    };
    const DAY = [6, 21], ALL = [0, 24], NIGHT = [20, 6];
    // the Tail
    folk('laundress', 'tail', 'ropes', 0.22, DAY, `A laundress|Прачка|Kir yuvuvchi ayol`, { robe: '#5a6a8a', trim: '#d8d0c0', skin: '#b08068', head: 'scarf', headC: '#c8b8a0' }, [
      `"Hang a shirt out on the Night of Payment and the collectors take it for a flag. Nobody washes that week."|«Вывесишь рубаху в Ночь Уплаты — сборщики примут за флаг. В ту неделю никто не стирает».|«To'lov kechasi ko'ylak ossang, yig'uvchilar uni bayroq deb o'ylaydi. O'sha hafta hech kim kir yuvmaydi».`,
      `"The ropes are older than me. My mother tied them. I don't remember her face, but I remember her knots."|«Верёвки старше меня. Их мать натягивала. Лица её не помню, а узлы помню».|«Arqonlar mendan qari. Ularni onam tortgan. Yuzini eslamayman, tugunlarini eslayman».`
    ]);
    folk('waterboy', 'tail', 'square', 0.3, DAY, `A water carrier|Водонос|Mesh ko'taruvchi`, { robe: '#7a6a4a', trim: '#a89a6a', skin: '#a07858', head: 'doppi', headC: '#3a2a1a' }, [
      `"Mehri's well is the only sweet one left in the Tail. The rest taste of tumar wax."|«Колодец Мехри — последний сладкий в Хвосте. Остальные отдают воском тумаров».|«Mehrining qudug'i — Dumda qolgan yagona chuchuk quduq. Qolganlarida tumar mumining ta'mi bor».`,
      `"Two coppers a skin, yodchi. For you, three. You people always look thirsty."|«Две медяшки за бурдюк, ёдчи. Тебе — три. Вы, ёдчи, всегда выглядите так, будто пить хотите».|«Meshi ikki chaqa, yodchi. Senga — uch. Sizlar doim chanqaganga o'xshaysizlar».`
    ], 30);
    // the Potters' Quarter
    folk('waxgirl', 'potters', 'wax', 0.4, DAY, `A wax-maker's apprentice|Ученица воскобойщика|Mum ustasining shogirdasi`, { robe: '#a08a5a', trim: '#f2ead0', skin: '#c8a080', head: 'scarf', headC: '#e8dcc0' }, [
      `"Master says wax should be poured at dusk, when people forget the most. I think he just likes the light."|«Мастер говорит, воск надо лить в сумерках, когда люди больше всего забывают. По-моему, ему просто нравится свет».|«Usta mumni shomda quyish kerak deydi, odamlar eng ko'p unutadigan paytda. Menimcha, unga shunchaki yorug'lik yoqadi».`,
      `"My hands smell of honey all year. And nobody in my family remembers my grandmother. I'm sure those two things aren't connected."|«У меня руки круглый год пахнут мёдом. А бабушку у нас в семье никто не помнит. Уверена, одно с другим не связано».|«Qo'llarim yil bo'yi asal hidi beradi. Oilamizda esa buvimni hech kim eslamaydi. Ishonamanki, ikkisining aloqasi yo'q».`
    ]);
    folk('kilnwife', 'potters', 'kilnyard', 0.62, DAY, `The potter's wife|Жена гончара|Kulolning xotini`, { robe: '#6a3a2a', trim: '#c88a5a', skin: '#b08060', head: 'scarf', headC: '#8a4a3a' }, [
      `"Karim talks to the clay like it's a grandchild. To me he hasn't said a full sentence since the spring tithe."|«Карим говорит с глиной, как с внуком. Со мной с весенней десятины ни одного целого предложения».|«Karim loy bilan nevarasi bilan gaplashgandek gaplashadi. Men bilan esa bahorgi ushrdan beri bitta to'liq gap aytmagan».`,
      `"Mind the cold kiln. Children hide in it from the collectors. Sometimes they fall asleep, and we light it in the morning."|«Осторожней с холодной печью. Дети прячутся в ней от сборщиков. Бывает, засыпают, а мы утром разжигаем».|«Sovuq xumdondan ehtiyot bo'l. Bolalar unda yig'uvchilardan yashirinadi. Ba'zan uxlab qolishadi, biz esa ertalab o't yoqamiz».`
    ], -34);
    // the Bazaar
    folk('crier', 'bazaar', 'auction', 0.4, [8, 20], `An auction crier|Глашатай торгов|Kimoshdi jarchisi`, { robe: '#8a2a2a', trim: '#e2b452', skin: '#c89a78', head: 'turban', headC: '#e2b452', beard: 'short' }, [
      `"Today: a first kiss, slightly used! A grandfather's laugh, one owner! The smell of Samarkand bread, bid low and dream high!"|«Сегодня: первый поцелуй, почти не ношенный! Дедушкин смех, один владелец! Запах самаркандской лепёшки — ставь мало, мечтай много!»|«Bugun: birinchi o'pich, deyarli ishlatilmagan! Bobojonning kulgisi, bitta egasi bo'lgan! Samarqand nonining hidi — oz tik, ko'p orzu qil!»`,
      `"Everything has a price, yodchi. The trick is to sell before you know what it was worth."|«У всего есть цена, ёдчи. Фокус в том, чтобы продать, пока не понял, сколько оно стоило».|«Hamma narsaning narxi bor, yodchi. Gap — nima turishini bilmasdan oldin sotib ulgurishda».`
    ], 40);
    folk('teaseller', 'bazaar', 'carto', 0.52, [7, 22], `A tea seller|Продавец чая|Choy sotuvchi`, { robe: '#3a5a4a', trim: '#c8a040', skin: '#a07858', head: 'doppi', headC: '#1a2a1a', beard: 'long' }, [
      `"Green tea for the morning, black for the evening, and for the Night of Payment — nothing. You'll want to remember the taste of something."|«Зелёный чай с утра, чёрный вечером, а в Ночь Уплаты — ничего. Захочется запомнить вкус хоть чего-то».|«Ertalab ko'k choy, kechqurun qora choy, To'lov kechasi esa — hech narsa. Hech bo'lmasa bir narsaning ta'mini eslab qolging keladi».`,
      `"The cartographer sells you outlines. I sell you rumours. Mine are cheaper and about as accurate."|«Картограф продаёт очертания. Я продаю слухи. Мои дешевле и примерно такие же точные».|«Xaritachi shakllarni sotadi. Men mish-mishlarni sotaman. Meniki arzonroq va taxminan shuncha aniq».`
    ], -40);
    // the upper Karez
    folk('lampboy', 'karez', 'lamps', 0.2, ALL, `A lamp boy|Мальчик с лампой|Chiroqli bola`, { robe: '#4a3a2a', trim: '#e2b452', skin: '#a07a5a', head: 'none' }, [
      `"Copper for a light, yodchi? Down here the dark has teeth. Not the smugglers. The dark."|«Медяк за свет, ёдчи? Тут, внизу, у темноты зубы есть. Не у контрабандистов. У темноты».|«Yorug'lik uchun bir chaqa, yodchi? Bu yerda, pastda, qorong'ining tishi bor. Kontrabandachilarning emas. Qorong'ining».`,
      `"I was born up there. I don't remember it. My mother sold that year so we could eat. It's fine. Down here nobody asks."|«Я родился наверху. Не помню. Мать продала тот год, чтобы нам было что есть. Ничего. Тут никто не спрашивает».|«Men tepada tug'ilganman. Eslamayman. Onam ovqatga pul bo'lsin deb o'sha yilni sotgan. Mayli. Bu yerda hech kim so'ramaydi».`
    ]);
    folk('ferryman', 'karez', 'den', 0.83, [6, 20], `A raft-man|Плотовщик|Solchi`, { robe: '#2a3a3a', trim: '#5a7a7a', skin: '#8a6a50', head: 'hood', headC: '#1a2a2a', beard: 'long' }, [
      `"The water runs toward the Well. Always. Whatever you drop in a karez, the Singers get it in the end."|«Вода бежит к Колодцу. Всегда. Что ни урони в кяриз — в конце концов достанется Певцам».|«Suv Quduq tomon oqadi. Doim. Korizga nima tushirsang ham, oxiri Xonandalarga yetib boradi».`,
      `"I ferry crates, not questions. But if you're asking — the sluice past the den opens when the water turns bitter."|«Я вожу ящики, а не вопросы. Но раз уж спрашиваешь — шлюз за логовом откроется, когда вода загорчит».|«Men savol emas, yashik tashiyman. Lekin so'rasang — in ortidagi shlyuz suv achchiq tortganda ochiladi».`
    ], 40);
    // the Rabat
    folk('camelboy', 'rabat', 'well', 0.5, DAY, `A camel boy|Погонщик верблюдов|Tuyakash bola`, { robe: '#8a6a3a', trim: '#c8a878', skin: '#a07050', head: 'scarf', headC: '#e8d8b8' }, [
      `"This one's called Kumush. She bites inspectors. Only inspectors. Nobody taught her that."|«Эту зовут Кумуш. Она кусает смотрителей. Только смотрителей. Никто её этому не учил».|«Buning oti Kumush. U nozirlarni tishlaydi. Faqat nozirlarni. Hech kim o'rgatmagan».`,
      `"On the salt flats you see your own house sometimes, with your mother in the door. Don't walk toward it."|«На солончаках иногда видишь свой дом и маму в дверях. Не иди к нему».|«Sho'rxokda ba'zan o'z uyingni, eshikda onangni ko'rasan. Unga qarab yurma».`
    ], 34);
    folk('clerk', 'rabat', 'customs', 0.3, [8, 18], `A customs clerk|Таможенный писарь|Bojxona mirzasi`, { robe: '#3a3a5a', trim: '#a8323a', skin: '#c8a080', head: 'doppi', headC: '#1a1a2a' }, [
      `"Name, city, debts, and how many days you've been inside the walls. Forty is the limit. After forty, the Well writes the rest."|«Имя, город, долги и сколько дней ты в стенах. Сорок — предел. После сорока остальное пишет Колодец».|«Ism, shahar, qarzlar va devor ichida necha kun bo'lganing. Qirq — chegara. Qirqdan keyin qolganini Quduq yozadi».`,
      `"I don't decide anything, yodchi. I just write very neatly."|«Я ничего не решаю, ёдчи. Я просто очень аккуратно пишу».|«Men hech narsani hal qilmayman, yodchi. Men shunchaki juda chiroyli yozaman».`
    ]);
    // the Tower of Silence
    folk('gravedigger', 'tower', 'heap', 0.25, DAY, `A tumar-digger|Копатель тумаров|Tumar kovlovchi`, { robe: '#4a4448', trim: '#9a9088', skin: '#9a7a60', head: 'none', beard: 'long' }, [
      `"Empty tumars, yodchi. I dig for the cords — good silk, some of them. The wax I leave. Nobody wants empty wax."|«Пустые тумары, ёдчи. Я копаю ради шнурков — бывает, хороший шёлк. Воск оставляю. Пустой воск никому не нужен».|«Bo'sh tumarlar, yodchi. Men iplari uchun kovlayman — ba'zan yaxshi ipak chiqadi. Mumni qoldiraman. Bo'sh mum hech kimga kerak emas».`,
      `"Sometimes one isn't quite empty. A smell, a word. I put those back. It feels like robbing a sleeper."|«Иногда попадается не совсем пустой. Запах, слово. Такие я кладу обратно. Как будто спящего обираешь».|«Ba'zan bittasi to'liq bo'sh bo'lmaydi. Bir hid, bir so'z. Ularni joyiga qo'yaman. Uxlayotgan odamni talagandek bo'ladi».`
    ]);
    folk('crowwoman', 'tower', 'mem', 0.7, DAY, `A woman feeding crows|Женщина, кормящая ворон|Qarg'alarni boqayotgan ayol`, { robe: '#2a2428', trim: '#5a5058', skin: '#b08a70', head: 'scarf', headC: '#1a161a' }, [
      `"The crows carry the last bits away. That's a kind of remembering too. Better than the Well."|«Вороны уносят последние крохи. Это тоже своего рода память. Лучше, чем Колодец».|«Qarg'alar oxirgi ushoqlarni olib ketadi. Bu ham bir xil eslash. Quduqdan yaxshiroq».`,
      `"My husband is in that heap. Somewhere. I don't look for him. I just bring bread."|«Мой муж — в этой куче. Где-то. Я его не ищу. Я просто приношу хлеб».|«Erim shu uyumda. Qayerdadir. Uni izlamayman. Shunchaki non olib kelaman».`
    ], -30);
    folk('mourner', 'tower', 'story', 0.5, [9, 17], `A hired mourner|Наёмная плакальщица|Yollanma yig'ichi`, { robe: '#1a1a20', trim: '#4a4a58', skin: '#c8a080', head: 'scarf', headC: '#0a0a10' }, [
      `"I weep for those whose families forgot them. Five tilla a funeral. Business is very good."|«Я плачу по тем, кого забыли родные. Пять тилла за похороны. Дела идут очень хорошо».|«Qarindoshlari unutganlar uchun yig'layman. Bir janoza — besh tilla. Ishlarim juda yaxshi».`,
      `"I don't know their names. I make them up. Nobody has ever corrected me."|«Имён я не знаю. Придумываю. Ни разу никто не поправил».|«Ismlarini bilmayman. O'zim to'qiyman. Hech kim bir marta ham to'g'rilamagan».`
    ], 50);
    // the Ark
    folk('guardsman', 'ark', 'gate', 0.08, DAY, `A Divan guardsman|Стражник Дивана|Devon soqchisi`, { robe: '#6a1a1a', trim: '#e2b452', skin: '#b08060', head: 'turban', headC: '#e8e0d0', beard: 'short' }, [
      `"Move along, yodchi. The gardens are for those who own their memories. You collect other people's."|«Проходи, ёдчи. Сады — для тех, кто владеет своей памятью. А ты собираешь чужую».|«O'tib ket, yodchi. Bog'lar o'z xotirasiga egalar uchun. Sen esa boshqalarnikini yig'asan».`,
      `"Tilla-bek doesn't sleep. People say he drinks other men's sleep instead. I've never seen him yawn."|«Тилла-бек не спит. Говорят, он вместо сна пьёт чужой. Я ни разу не видел, чтобы он зевал».|«Tilla-bek uxlamaydi. Aytishlaricha, o'rniga boshqalarning uyqusini ichadi. Uning esnaganini hech ko'rmaganman».`
    ]);
    folk('scribe', 'ark', 'roses', 0.25, [8, 18], `A Divan scribe|Писец Дивана|Devon kotibi`, { robe: '#e0d8c0', trim: '#3a5a3a', skin: '#c8a080', head: 'doppi', headC: '#3a5a3a' }, [
      `"Every childhood in the cellar has a ledger number. Mine is four hundred and twelve. I sold it to buy this pen."|«У каждого детства в погребе есть номер в книге. Моё — четыреста двенадцатое. Я продал его, чтобы купить это перо».|«Yerto'ladagi har bir bolalikning daftarda raqami bor. Meniki — to'rt yuz o'n ikkinchi. Shu qalamni olish uchun sotganman».`,
      `"The Divan doesn't take memories. It buys them. There's a difference, and we have it in writing."|«Диван не забирает память. Он её покупает. Разница есть, и она у нас записана».|«Devon xotirani tortib olmaydi. Sotib oladi. Farqi bor, va bizda u yozib qo'yilgan».`
    ], -36);
    // the Cloister
    folk('pilgrim', 'cloister', 'gate', 0.06, DAY, `A pilgrim|Паломник|Ziyoratchi`, { robe: '#a89878', trim: '#e8e8f0', skin: '#a07858', head: 'turban', headC: '#e8e8e0', beard: 'long' }, [
      `"I walked forty days to give the Well my worst year. They told me it doesn't accept gifts. Only debts."|«Я шёл сорок дней, чтобы отдать Колодцу свой худший год. Мне сказали: подарков он не берёт. Только долги».|«Quduqqa eng yomon yilimni berish uchun qirq kun yurdim. Menga aytishdi: u sovg'a olmaydi. Faqat qarz».`,
      `"Listen to the bells. Seven of them, one cracked. They say each rang for a founder."|«Послушай колокола. Их семь, один треснул. Говорят, каждый звонил по одному из основателей».|«Qo'ng'iroqlarni tingla. Ular yettita, bittasi yorilgan. Aytishlaricha, har biri bitta asoschi uchun chalingan».`
    ]);
    folk('bookkeeper', 'cloister', 'books', 0.36, [8, 19], `A debt-book keeper|Хранитель долговых книг|Qarz daftarlari saqlovchisi`, { robe: '#e8e8f0', trim: '#3a6ab0', skin: '#c8a080', head: 'doppi', headC: '#3a6ab0', beard: 'short' }, [
      `"Every name in the archive is a debt, and every debt is a song. We keep both in alphabetical order."|«Каждое имя в архиве — долг, а каждый долг — песня. И то и другое мы храним по алфавиту».|«Arxivdagi har bir ism — qarz, har bir qarz esa — qo'shiq. Ikkalasini ham alifbo tartibida saqlaymiz».`,
      `"The door with the blue sign is the archive. No sign, no reading. Even the Ustoz knocks."|«Дверь с синим знаком — архив. Нет знака — нет чтения. Даже Устоз стучит».|«Ko'k belgili eshik — arxiv. Belgi yo'q — o'qish yo'q. Hatto Ustoz ham taqillatadi».`
    ]);
    // the Salt Mines
    folk('saltcutter', 'mines', 'face', 0.55, ALL, `A salt cutter|Рубщица соли|Tuz qazuvchi ayol`, { robe: '#6a6a70', trim: '#c8d0d8', skin: '#9a8070', head: 'scarf', headC: '#c8d0d8' }, [
      `"Cut along the vein and it comes away clean. Cut across and it weeps. Yes, salt weeps. Down here you get used to it."|«Руби вдоль жилы — отходит чисто. Поперёк — плачет. Да, соль плачет. Здесь привыкаешь».|«Tomir bo'ylab chopsang — toza ko'chadi. Ko'ndalang chopsang — yig'laydi. Ha, tuz yig'laydi. Bu yerda ko'nikib ketasan».`,
      `"They whisper about a rising. I don't care who wins. I want a window."|«Шепчутся о бунте. Мне всё равно, кто победит. Я хочу окно».|«Qo'zg'olon haqida shivirlashyapti. Kim yutishi menga baribir. Men deraza istayman».`
    ]);
    folk('minewarden', 'mines', 'rabat', 0.08, ALL, `A Divan overseer|Надсмотрщик Дивана|Devon nazoratchisi`, { robe: '#5a1a1a', trim: '#c8d0d8', skin: '#b08060', head: 'turban', headC: '#3a1a1a', beard: 'short' }, [
      `"A yodchi down here? Collecting what? They've got nothing left but the debt."|«Ёдчи здесь, внизу? Что собирать-то? У них ничего не осталось, кроме долга».|«Yodchi bu yerda, pastdami? Nimani yig'asan? Ularda qarzdan boshqa hech narsa qolmagan».`,
      `"I was a debtor too, once. Then I learned to hold the whip. It's lighter than the pick."|«Я тоже был должником. Потом научился держать плеть. Она легче кирки».|«Men ham bir vaqtlar qarzdor edim. Keyin qamchi ushlashni o'rgandim. U ketmondan yengil».`
    ], 40);
    // the Swallowed Streets
    folk('sweeper', 'streets', 'lane', 0.5, ALL, `A woman sweeping|Женщина с метлой|Supurayotgan ayol`, { robe: '#5a5450', trim: '#8a8480', skin: '#b08a70', head: 'scarf', headC: '#3a3634' }, [
      `"Somebody has to sweep. Nobody walks here, but somebody has to sweep."|«Кто-то же должен мести. Здесь никто не ходит, но кто-то же должен мести».|«Kimdir supurishi kerak-ku. Bu yerda hech kim yurmaydi, lekin kimdir supurishi kerak».`,
      `"My house is the third one. The wall took the second floor and my son with it. I keep the first floor clean for when he comes down."|«Мой дом — третий. Стена забрала второй этаж, а с ним сына. Первый я держу в чистоте — вдруг спустится».|«Mening uyim — uchinchisi. Devor ikkinchi qavatni, u bilan o'g'limni ham olib ketdi. Birinchi qavatni toza tutaman — tushib qolsa».`
    ]);
    folk('picker', 'streets', 'mem', 0.3, ALL, `A scavenger|Старьёвщик|Eskifurush`, { robe: '#4a4038', trim: '#7a6a58', skin: '#9a7a60', head: 'hood', headC: '#2a2420', beard: 'short' }, [
      `"Spoons, buttons, a cradle. Everything here was somebody's morning. I sell them to the Bazaar as antiques."|«Ложки, пуговицы, колыбель. Всё здесь было чьим-то утром. Продаю на Базар как старину».|«Qoshiqlar, tugmalar, beshik. Bu yerdagi hamma narsa kimningdir tongi bo'lgan. Bozorga antiqa deb sotaman».`,
      `"Listen at the walls if you like. The children in there don't answer, but they do stop singing."|«Послушай стены, если хочешь. Дети там не отвечают, но петь перестают».|«Xohlasang devorlarga quloq sol. U yerdagi bolalar javob bermaydi, lekin qo'shig'ini to'xtatadi».`
    ], -30);
    folk('streetelder', 'streets', 'story', 0.84, ALL, `An old man on a doorstep|Старик на пороге|Ostonadagi chol`, { robe: '#3a3a40', trim: '#6a6a70', skin: '#a08068', head: 'doppi', headC: '#2a2a2a', beard: 'long' }, [
      `"This was Kumush Street. Silver-workers. The founders built a wall through it in one night and sang over the mortar."|«Это была Кумушная улица. Серебряники. Основатели за одну ночь провели через неё стену и пели над раствором».|«Bu Kumush ko'chasi edi. Kumushgarlar. Asoschilar bir kechada undan devor o'tkazib, qorishma ustida kuylashgan».`,
      `"I'm the only one who remembers the street. I'm the only one who never left it. Make of that what you like."|«Улицу помню один я. И один я её не покидал. Понимай как хочешь».|«Ko'chani faqat men eslayman. Undan faqat men ketmaganman. Xohlaganingcha tushun».`
    ], 46);
    // the Great Cistern
    folk('boatman', 'cistern', 'mem', 0.45, ALL, `A boatman without a boat|Лодочник без лодки|Qayiqsiz qayiqchi`, { robe: '#2a3a3a', trim: '#3aa0a0', skin: '#8a6a50', head: 'none', beard: 'long' }, [
      `"I ran the boats for the Water Festival. Forty years. Then the Singers sealed it, and the boats sank on their own, out of grief."|«Я водил лодки на Празднике воды. Сорок лет. Потом Певцы запечатали купол, и лодки сами утонули — с горя».|«Suv bayramida qayiq haydardim. Qirq yil. Keyin Xonandalar gumbazni muhrladi, qayiqlar esa g'amdan o'zi cho'kib ketdi».`,
      `"Don't drink the water. Don't sing near the water. And if something sings back — don't listen."|«Не пей воду. Не пой у воды. А если что-то запоёт в ответ — не слушай».|«Suvni ichma. Suv yonida kuylama. Agar nimadir javob qaytarib kuylasa — tinglama».`
    ], 40);
    folk('diver', 'cistern', 'pool', 0.62, ALL, `A diver|Ныряльщица|G'avvos qiz`, { robe: '#1a3a4a', trim: '#9ff3e6', skin: '#a08068', head: 'none' }, [
      `"There are lamps at the bottom still lit. A whole festival of them. You'd need to hold your breath for a year."|«На дне ещё горят лампы. Целый праздник. Год надо не дышать, чтобы добраться».|«Tubida hali ham chiroqlar yonib turibdi. Butun bir bayram. Yetib borish uchun bir yil nafas olmasliging kerak».`,
      `"The tunnel west goes all the way to Old Yodgor. Without a gift from the water, you'd drown halfway."|«Тоннель на запад тянется до самого Старого Ёдгора. Без дара воды утонешь на полпути».|«G'arbdagi tunnel to'g'ri Eski Yodgorgacha boradi. Suvning in'omisiz yarim yo'lda cho'kasan».`
    ]);
    // Old Yodgor
    folk('masked', 'old', 'mask', 0.56, ALL, `A masked sentinel|Страж в маске|Niqobli qorovul`, { robe: '#4a1a1a', trim: '#a84a3a', skin: '#e8e0d8', head: 'hood', headC: '#2a0a0a' }, [
      `"We remember so that someone does. Walk softly. The ruins are older than the song."|«Мы помним, чтобы хоть кто-то помнил. Ступай тише. Руины старше песни».|«Kimdir eslab qolsin deb eslaymiz. Sekin yur. Xarobalar qo'shiqdan qadimiyroq».`,
      `"You've got a yodchi's hands. Here, that's not a recommendation."|«У тебя руки ёдчи. Здесь это не рекомендация».|«Qo'llaring yodchinikiga o'xshaydi. Bu yerda bu tavsiyanoma emas».`
    ]);
    folk('carver', 'old', 'dome', 0.76, ALL, `A child carving names|Ребёнок, вырезающий имена|Ism o'yayotgan bola`, { robe: '#6a3a2a', trim: '#c89a7a', skin: '#c8a080', head: 'none' }, [
      `"I carve the names they tell me, so they're somewhere other than in people. People forget. Stone's slower."|«Я вырезаю имена, которые мне говорят, чтобы они были где-то ещё, кроме людей. Люди забывают. Камень медленнее».|«Menga aytilgan ismlarni o'yaman, ular odamlardan boshqa joyda ham bo'lsin deb. Odamlar unutadi. Tosh sekinroq».`,
      `"Do you have a name you want carved? You can say it. I won't tell anyone it's yours."|«Хочешь, вырежу какое-нибудь имя? Скажи. Я никому не скажу, что оно твоё».|«O'yib qo'yadigan ismingiz bormi? Ayting. Sizniki ekanini hech kimga aytmayman».`
    ], -30);
    folk('remember_woman', 'old', 'story', 0.86, NIGHT, `A woman humming|Напевающая женщина|Xirgoyi qilayotgan ayol`, { robe: '#3a1a2a', trim: '#a84a6a', skin: '#b08a70', head: 'scarf', headC: '#4a1a2a' }, [
      `(She hums the Alla and does not stop to talk. Her hands keep the beat on her knee.)|(Она напевает «Аллу» и не прерывается, чтобы поговорить. Ладонь отбивает такт по колену.)|(U «Alla»ni xirgoyi qiladi va gaplashish uchun to'xtamaydi. Kafti tizzasida ritm uradi.)`,
      `"There's a girl among us who knew your name before you came. Don't ask me which. She'll find you."|«Среди нас есть девушка, которая знала твоё имя до того, как ты пришёл. Не спрашивай, кто. Она сама тебя найдёт».|«Oramizda sen kelmasdan oldin isming bilgan qiz bor. Kimligini so'rama. U o'zi seni topadi».`
    ], 40);
    // the Spine
    folk('shepherd', 'spine', 'flock', 0.2, DAY, `A shepherd|Пастух|Cho'pon`, { robe: '#d8dce8', trim: '#8a90a0', skin: '#a07050', head: 'turban', headC: '#f4f8fc', beard: 'long' }, [
      `"The sheep graze on the Sleeper's back. When he shudders they lie down all at once. They know before I do."|«Овцы пасутся на спине Спящего. Когда он вздрагивает, они ложатся все разом. Они знают раньше меня».|«Qo'ylar Uxlovchining yelkasida o'tlaydi. U seskanganda hammasi birdan yotib oladi. Ular mendan oldin biladi».`,
      `"The white leopard takes a sheep in winter. One. Never two. That's a fair tax. Fairer than the Well's."|«Белый барс берёт одну овцу за зиму. Одну. Никогда двух. Это честный налог. Честнее, чем у Колодца».|«Oq bars qishda bitta qo'y oladi. Bitta. Hech qachon ikkita emas. Bu halol soliq. Quduqnikidan halolroq».`
    ]);
    folk('herbwoman', 'spine', 'mem', 0.66, DAY, `A gatherer of snow herbs|Собирательница снежных трав|Qor o'tlari teruvchi`, { robe: '#5a6a7a', trim: '#e8f0f8', skin: '#b08a70', head: 'scarf', headC: '#e8f0f8' }, [
      `"Herbs from the vertebrae help you sleep without dreaming. The Divan buys every leaf. I wonder why."|«Травы с позвонков помогают спать без снов. Диван скупает каждый лист. Интересно, зачем».|«Umurtqadagi o'tlar tushsiz uxlashga yordam beradi. Devon har bir bargini sotib oladi. Qiziq, nimaga».`,
      `"Stand over a crack and breathe in when he breathes out. That's how the old climbers went up. Most of them."|«Встань над трещиной и вдохни, когда он выдыхает. Так поднимались старые скалолазы. Большинство из них».|«Yoriq ustida tur va u nafas chiqarganda sen nafas ol. Eski cho'qqiga chiquvchilar shunday ko'tarilgan. Ko'pchiligi».`
    ], -30);
    // the Withers
    folk('muleteer', 'withers', 'mem', 0.45, [7, 20], `A muleteer|Погонщик мулов|Xachirkash`, { robe: '#5a4a6a', trim: '#d8c8e0', skin: '#c8a080', head: 'turban', headC: '#8a7a9a', beard: 'short' }, [
      `"Up here we trade in salt, silk and silence. Silence sells best. Everyone below is sick of singing."|«Здесь, наверху, торгуют солью, шёлком и тишиной. Тишина идёт лучше всего. Внизу все устали от пения».|«Bu yerda, tepada, tuz, ipak va sukunat bilan savdo qilamiz. Sukunat eng yaxshi sotiladi. Pastdagilar qo'shiqdan charchagan».`,
      `"The clouds never come up past the sarai gate. The leopard doesn't let them, they say."|«Облака никогда не поднимаются выше ворот сарая. Говорят, барс не пускает».|«Bulutlar hech qachon saroy darvozasidan yuqori chiqmaydi. Aytishlaricha, bars qo'ymaydi».`
    ], 40);
    folk('cloudmonk', 'withers', 'ledge', 0.84, ALL, `A hermit on the ledge|Отшельник на уступе|Tokchadagi zohid`, { robe: '#e8e0f0', trim: '#8a7a9a', skin: '#a08068', head: 'none', beard: 'long' }, [
      `"I came up to forget. It doesn't work. Up here everything is too clear."|«Я поднялся сюда, чтобы забыть. Не выходит. Здесь всё слишком ясно».|«Unutish uchun bu yerga chiqdim. Bo'lmayapti. Bu yerda hamma narsa haddan tashqari ravshan».`,
      `"The shrine past the ledge belongs to the leopard. Go in with a question, not a blade. Or both, if you must."|«Святилище за уступом — барсово. Входи с вопросом, а не с клинком. Или с обоими, если уж надо».|«Tokcha ortidagi ziyoratgoh barsniki. Pichoq bilan emas, savol bilan kir. Yoki kerak bo'lsa ikkalasi bilan».`
    ]);
    // the Founders' Well
    folk('candlekeeper', 'well', 'candles', 0.24, ALL, `A candle-keeper|Свечник|Shamchi`, { robe: '#e8e8f0', trim: '#e2b452', skin: '#c8a080', head: 'doppi', headC: '#3a6ab0' }, [
      `"One candle for every name the Well has eaten. I light new ones every day. The galleries are getting crowded."|«Одна свеча на каждое имя, что съел Колодец. Каждый день зажигаю новые. В галереях становится тесно».|«Quduq yutgan har bir ism uchun bitta sham. Har kuni yangilarini yoqaman. Galereyalar tiqilib qolyapti».`,
      `"The black water doesn't reflect candles. It reflects what the candles are for."|«Чёрная вода не отражает свечи. Она отражает то, ради чего их зажгли».|«Qora suv shamlarni aks ettirmaydi. U shamlar nima uchun yoqilganini aks ettiradi».`
    ]);
    folk('wellsinger', 'well', 'story', 0.52, ALL, `An old Singer|Старая Певица|Keksa Xonanda`, { robe: '#f0f0f8', trim: '#3a6ab0', skin: '#c8a888', head: 'scarf', headC: '#f0f0f8' }, [
      `"I sang here for sixty years. I never once looked down. Now I'm too old to lie, so I look."|«Я пела здесь шестьдесят лет. Ни разу не посмотрела вниз. Теперь я слишком стара, чтобы лгать, — вот и смотрю».|«Bu yerda oltmish yil kuyladim. Bir marta ham pastga qaramadim. Endi yolg'on gapirishga juda qariman — shuning uchun qarayman».`,
      `"The Seven are still down there. Not dead. Waiting to be paid. Everyone in this city is waiting to be paid."|«Семеро всё ещё там, внизу. Не мертвы. Ждут оплаты. Все в этом городе ждут оплаты».|«Yettovlon hali ham pastda. O'lmagan. To'lovni kutishyapti. Bu shahardagi hamma to'lovni kutyapti».`
    ], 40);
  }
  // a region's own biome (a w_* variant of a land biome) carries the region's name, not the land's it was
  // copied from (the HUD under the minimap reads the biome: the Tower said "The Rabat", the Mines "The Swallowed Streets")
  for (const id in W2.regions) {
    const d = W2.regions[id], bid = typeof d.biome === 'string' ? d.biome : null;
    if (!bid || !/^w_/.test(bid) || !DEFS[bid] || !d.name) continue;
    try { DEFS[bid].name = N(d.name); if (d.sub) DEFS[bid].subtitle = N(d.sub); } catch (e) { console.error('[world5] name', id, e); }
  }
  // the regions' own stones and memories (regions that hold no chapter): read by 85c
  W2.regionStones = id => { const d = W2.regions[id]; return d && d.stones ? { id: 'w:' + id, list: d.stones } : null; };
})();
