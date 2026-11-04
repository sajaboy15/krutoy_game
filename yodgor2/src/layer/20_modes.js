/* =====================================================================
   Three ways to walk, difficulty, and what death means in each.
   wanderer = Pilgrim (Easy / Normal / Hard)
   souls    = The Oath (always hard; same land after death; tilla stays where you fell)
   classic  = No Return (death ends the journey)
   ===================================================================== */
const MODES = {
  wanderer: {
    name: N(`Pilgrim|Путник|Yo'lchi`), icon: 'yurt',
    tag: N(`Choose the weight|Тяжесть — на выбор|Og'irligini o'zing tanla`), tagC: '#9ff3e6',
    lines: [
      N(`Death returns you to the start of the land. The song takes a memory.|Умер — начинаешь землю сначала. Песня забирает одно воспоминание.|O'lsang, shu yerning boshiga qaytasan. Qo'shiq bitta xotirangni oladi.`),
      N(`Gear, scrolls and songs stay. Half the tilla is lost.|Снаряжение, свитки и песни при тебе. Половина тиллы пропадает.|Jihoz, bitiklar va qo'shiqlar o'zingda qoladi. Tillaning yarmi ketadi.`)
    ]
  },
  souls: {
    name: N(`The Oath|Клятва|Qasam`), icon: 'tumar',
    tag: N(`Always hard|Всегда тяжело|Doim og'ir`), tagC: '#f2c14a',
    lines: [
      N(`Death returns you to the same land, as it was. The song takes more.|После смерти земля встречает тебя такой же, какой была. Песня берёт больше.|O'lsang, o'sha yerga qaytasan — hammasi avvalgidek. Qo'shiq ko'proq oladi.`),
      N(`Your tilla stays where you fell. You may return for it once.|Тилла остаётся там, где ты пал. Вернуться за ней можно только раз.|Tillang yiqilgan joyingda qoladi. Uni faqat bir marta qaytib olish mumkin.`)
    ]
  },
  classic: {
    name: N(`No Return|Без возврата|Qaytishsiz`), icon: 'balbal',
    tag: N(`For the seasoned|Для бывалых|Tajribalilar uchun`), tagC: '#ff9a8a',
    lines: [
      N(`Death is final: the journey begins again from the Tail.|Смерть — это конец: поход начнётся заново, с Хвоста.|O'lim — bu oxiri: safar yana Dumdan boshlanadi.`),
      N(`For those who know the price of every memory.|Для тех, кто знает цену каждому воспоминанию.|Har bir xotiraning narxini biladiganlar uchun.`)
    ]
  }
};
const DIFF = {
  easy: { name: N(`Easy|Легко|Oson`), hp: 0.7, dmg: 0.6, voidDeath: 2 },
  normal: { name: N(`Normal|Обычно|O'rtacha`), hp: 1, dmg: 1, voidDeath: 4 },
  hard: { name: N(`Hard|Тяжело|Og'ir`), hp: 1.3, dmg: 1.4, voidDeath: 6 },
  oath: { name: N(`Oath|Клятва|Qasam`), hp: 1.25, dmg: 1.5, voidDeath: 5 }
};
G.MODES_UI.length = 0;
for (const id of ['wanderer', 'souls', 'classic']) G.MODES_UI.push(Object.assign({ id }, MODES[id]));

// small pixel icon for the Oath card: a tumar on a cord
let tumarIcon = null;
G.MODE_ICON = name => {
  if (name !== 'tumar') return null;
  if (tumarIcon) return tumarIcon;
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 18;
  const c = cv.getContext('2d');
  const r = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  r(3, 0, 1, 5, '#8a6a3a'); r(12, 0, 1, 5, '#8a6a3a'); r(4, 4, 8, 1, '#8a6a3a');
  for (let y = 0; y < 11; y++) { const w = 13 - y; r(Math.round(8 - w / 2), 6 + y, w, 1, y < 1 ? '#fff0b0' : '#e2b452'); }
  for (let y = 1; y < 8; y++) { const w = 9 - y; r(Math.round(8 - w / 2), 7 + y, w, 1, '#a8762a'); }
  r(7, 9, 2, 2, '#7fe8dc');
  tumarIcon = cv;
  return cv;
};

let pendingDiff = 'normal';
G.MODE_PICK = (id, start) => {
  if (id !== 'wanderer') { pendingDiff = id === 'souls' ? 'oath' : 'hard'; start(id); return; }
  const opts = [
    { v: 'easy', label: `Easy — for the story|Легко — ради истории|Oson — hikoya uchun`, color: '#bff7c6' },
    { v: 'normal', label: `Normal — as it was meant|Обычно — как задумано|O'rtacha — asl og'irlikda`, color: '#f2e6c8' },
    { v: 'hard', label: `Hard — the city does not forgive|Тяжело — город не прощает|Og'ir — shahar kechirmaydi`, color: '#ff9a8a' },
    { v: null, label: `Back|Назад|Orqaga`, color: '#9a8a78' }
  ];
  G.UI.choice({
    title: t(`How heavy is the road?|Насколько тяжёлой будет дорога?|Yo'l qanchalik og'ir bo'lsin?`), cancel: true,
    options: opts.map(o => ({ label: t(o.label), value: o.v, color: o.color })),
    onPick: v => { if (!v) return; pendingDiff = v; start(id); }
  });
};
const diffOf = run => DIFF[(run && run.diffLevel) || 'normal'] || DIFF.normal;
G.MODE_NAME = mode => {
  const m = MODES[mode] || MODES.wanderer;
  if (mode === 'wanderer' && G.run) return LANG.T(MODES.wanderer.name) + ' · ' + LANG.T(diffOf(G.run).name);
  return LANG.T(m.name);
};
G.MODE_DEATH = mode => mode === 'classic' ? t(`No Return: the road begins again|Без возврата: поход начнётся заново|Qaytishsiz: safar qaytadan boshlanadi`)
  : mode === 'souls' ? t(`The Oath: your tilla waits where you fell|Клятва: тилла ждёт там, где ты пал|Qasam: tillang yiqilgan joyingda kutadi`)
  : t(`Pilgrim: your gear stays with you|Путник: снаряжение при тебе|Yo'lchi: jihozing o'zingda qoladi`);
G.ADJUST_DIFF = (diff, run) => {
  const d = diffOf(run);
  diff.hpMul *= d.hp; diff.dmgMul *= d.dmg;
};

/* ---------- the Oath: a lost tumar with your tilla ---------- */
let lostTumar = null; // { pi, x, y, gold }
function dropLostTumar() {
  if (!G.run || G.run.mode !== 'souls') return;
  const pl = G.world && G.world.player;
  if (!pl) return;
  lostTumar = { pi: G.run.planIndex, x: pl.x, y: pl.y, gold: G.run.gold || 0 };
}
function placeLostTumar() {
  if (!lostTumar || !G.run || G.run.mode !== 'souls' || G.run.planIndex !== lostTumar.pi) { lostTumar = null; return; }
  const lt = lostTumar;
  G.run.gold = 0;
  if (!lt.gold) { lostTumar = null; return; }
  try {
    const o = new G.Interactable(lt.x, lt.y, {
      art: 'lostTumar', w: 14, h: 18,
      prompt: tf(`Take back your tumar ({n} tilla)|Забрать свой тумар ({n} тилла)|Tumaringni qaytarib ol ({n} tilla)`, { n: lt.gold }),
      onUse: (pl, obj) => { if (obj.usedUp) return true; obj.usedUp = true; obj.dead = true; gold(lt.gold); lostTumar = null; if (G.SADO) G.SADO.bark('lostTumar'); return true; }
    });
    G.world.add(o);
  } catch (e) { console.error('[yodgor]', e); }
}
G.ObjArt.lostTumar = (ctx, o) => {
  const k = Math.sin((G.time || 0) * 3) * 1.5;
  const x = Math.round(o.x), y = Math.round(o.y - 10 + k);
  ctx.fillStyle = '#e2b452';
  for (let i = 0; i < 7; i++) ctx.fillRect(x - 6 + i, y - 5 + i, 13 - 2 * i, 1);
  ctx.fillStyle = '#7fe8dc'; ctx.fillRect(x - 1, y - 3, 2, 2);
};
G.ObjArt.lostTumarFx = (ctx, o) => { try { G.Light.add(o.x, o.y - 10, 40, '#f2c14a', 0.5); } catch (e) { /* ignore */ } };
