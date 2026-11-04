/* 96b_controls.js — the engine's Controls screen listed only its own twelve keys. Page 2 lists Yodgor's keys
   (inventory, character, skills, companions, journal, stance, orders, hook, Sado's light, graphics reset, full screen).
   ← / → (or A / D) turn the page while the screen is open (build.py patches the row list to ask G.CONTROLS_ROWS). */
{
  const ROWS2 = [
    ['Инвентарь', 'I', '—'], ['Персонаж, атрибуты', 'C', '—'], ['Навыки ёдчи', 'T', '—'], ['Спутники', 'O', '—'],
    ['Журнал', 'N', '—'], ['Стойка спутников', 'V', '—'], ['Приказ Алпу, Наргизе, Сурайё', '1 / 2 / 3', '—'], ['Крюк', 'G', '—'],
    ['Садо приглушает свет', 'B', '—'], ['Сбросить графику', 'F9', '—'], ['Во весь экран', 'F11', '—']
  ];
  const CT = G.CONTROLS = { page: 0, seen: 0 };
  G.CONTROLS_ROWS = (rows, ctx) => {
    const now = performance.now();
    if (now - CT.seen > 400) CT.page = 0;           // the screen was just opened
    CT.seen = now;
    try { const fx = G.UI._fx; fx.E(ctx, CT.page ? 'Стр. 2/2  ← →' : 'Стр. 1/2  ← →', 54, 36, { color: fx.c.dim, outline: null, shadow: fx.c.ink }); } catch (e) { /* ignore */ }
    return CT.page ? ROWS2 : rows;
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
