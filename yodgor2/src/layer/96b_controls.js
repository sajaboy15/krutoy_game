/* 96b_controls.js — the engine's Controls screen listed only its own twelve keys. Page 2 lists Yodgor's keys
   (inventory, character, skills, companions, journal, stance, orders, hook, Sado's light, graphics reset, full screen).
   ← / → (or A / D) turn the page while the screen is open (build.py patches the row list to ask G.CONTROLS_ROWS). */
{
  const ROWS2 = [
    ['Инвентарь', 'I', '—'], ['Персонаж, атрибуты', 'C', '—'], ['Навыки ёдчи', 'T', '—'], ['Спутники', 'O', '—'],
    ['Журнал', 'N', '—'], ['Книга ёдчи', 'Y', '—'], ['Стойка спутников', 'V', '—'], ['Приказ Алпу, Наргизе, Сурайё', '1 / 2 / 3', '—'], ['Крюк', 'G', '—'],
    ['Садо приглушает свет', 'B', '—'], ['Сбросить графику', 'F9', '—'], ['Во весь экран', 'F11', '—']
  ];
  const CT = G.CONTROLS = { page: 0, seen: 0 };
  G.CONTROLS_ROWS = (rows, ctx) => {
    const now = performance.now();
    if (now - CT.seen > 400) CT.page = 0;           // the screen was just opened
    CT.seen = now;
    try { const fx = G.UI._fx; fx.E(ctx, CT.page ? 'Стр. 2/2  ← →' : 'Стр. 1/2  ← →', 54, 36, { color: fx.c.dim, outline: null, shadow: fx.c.ink }); } catch (e) { /* ignore */ }
    // keys the player rebound (01_settings.js) show as they are now
    const S = G.SETTINGS, K = S && S.keyOf;
    if (!K) return CT.page ? ROWS2 : rows;
    const P1 = { 'Движение': () => K('left') + ' ' + K('right'), 'Прыжок, двойной прыжок': () => K('jump'), 'Основное оружие': () => K('attack'), 'Второе оружие, щит': () => K('secondary'), 'Перекат': () => K('roll'), 'Навыки': () => K('skill1') + ' / ' + K('skill2'), 'Испить кумыс': () => K('heal'), 'Взаимодействие': () => K('interact'), 'Карта': () => K('map') };
    const P2 = { 'Инвентарь': 'inv', 'Персонаж, атрибуты': 'char', 'Навыки ёдчи': 'skills', 'Спутники': 'party', 'Журнал': 'journal', 'Книга ёдчи': 'book', 'Стойка спутников': 'stance', 'Крюк': 'hook', 'Садо приглушает свет': 'light' };
    if (CT.page) return ROWS2.map(r => P2[r[0]] ? [r[0], K(P2[r[0]]).toUpperCase(), r[2]] : r[0].indexOf('Приказ') === 0 ? [r[0], K('order1') + ' / ' + K('order2') + ' / ' + K('order3'), r[2]] : r);
    if (!Object.keys(S.S.kb).length) return rows;
    return rows.map(r => P1[r[0]] ? [r[0], P1[r[0]]().toUpperCase(), r[2]] : r);
  };
  window.addEventListener('keydown', e => {
    if (performance.now() - CT.seen > 400) return;  // only while the Controls screen is drawn
    const c = e.code;
    if (c === 'ArrowLeft' || c === 'KeyA') { CT.page = 0; }
    else if (c === 'ArrowRight' || c === 'KeyD') { CT.page = 1; }
    else return;
    try { G.Audio && G.Audio.sfx('ui_move'); } catch (er) { /* ignore */ }
  }, true);
}
