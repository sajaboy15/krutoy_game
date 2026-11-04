/* =====================================================================
   HUD additions: the Hollowness bar under health, colour draining
   from the world as he empties, and hooks for subtitles.
   ===================================================================== */
const FX = G.UI._fx;
const PIXEL_DRAW = [], SMOOTH_DRAW = [];
{
  const dp = G.UI.drawPixel;
  G.UI.drawPixel = function (ctx, state) {
    if (state === 'play' || state === 'dead') { try { drainColour(ctx); } catch (e) { /* ignore */ } }
    const r = dp.apply(this, arguments);
    for (const f of PIXEL_DRAW) { try { f(ctx, state); } catch (e) { console.error('[yodgor hud]', e); } }
    return r;
  };
  G.UI_SMOOTH = (ctx, state) => {
    for (const f of SMOOTH_DRAW) { try { f(ctx, state); } catch (e) { console.error('[yodgor hud]', e); } }
  };
}

// ≥ 50: a faint grey; ≥ 75: the world loses its colour; near 100 it is almost ash
function drainColour(ctx) {
  const v = R().void;
  if (v < 50 || !G.run) return;
  const k = v < 75 ? (v - 50) / 25 * 0.25 : 0.25 + (v - 75) / 25 * 0.55;
  ctx.save();
  ctx.globalCompositeOperation = 'saturation';
  ctx.globalAlpha = Math.min(0.85, k);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, G.W, G.H);
  ctx.restore();
}

const hudVoid = { shown: 0, flash: 0, last: -1 };
VOID_LISTENERS.push((v, before) => { if (v !== before) hudVoid.flash = 40; });
const hudVisible = st => st === 'play' && G.run && G.world && G.world.player && !(G.Game.stage && G.Game.stage.plan && G.Game.stage.plan.type === 'victory');

PIXEL_DRAW.push((ctx, st) => {
  if (!hudVisible(st)) return;
  const v = R().void;
  hudVoid.shown += (v - hudVoid.shown) * 0.08;
  if (hudVoid.flash > 0) hudVoid.flash--;
  const x = 4, y = 45, w = 96, h = 11;
  FX.lt(ctx, x, y, w, h, 'hud');
  const bw = w - 26, bx = x + 22, by = y + 4;
  // the tumar mark
  ctx.fillStyle = '#c9b4ff';
  for (let i = 0; i < 5; i++) ctx.fillRect(x + 6 + i, y + 3 + i, 9 - 2 * i, 1);
  ctx.fillStyle = '#1a1420'; ctx.fillRect(bx - 1, by - 1, bw + 2, 5);
  ctx.fillStyle = '#2a2236'; ctx.fillRect(bx, by, bw, 3);
  const fw = Math.round(bw * clamp(hudVoid.shown / VOID_MAX, 0, 1));
  const col = v >= 75 ? '#e8e0f0' : v >= 50 ? '#b49cff' : '#8a6ad8';
  ctx.fillStyle = hudVoid.flash > 0 && (hudVoid.flash >> 2) & 1 ? '#ffffff' : col;
  ctx.fillRect(bx, by, fw, 3);
  ctx.fillStyle = '#f2e6c8';
  for (const m of [50, 75]) ctx.fillRect(bx + Math.round(bw * m / VOID_MAX), by - 1, 1, 5);
});

/* ---------- language: menu item, page texts ---------- */
function langLabel() { return t(`Language|Язык|Til`) + ': ' + LANG.NAMES[LANG.lang]; }
function menuLang() {
  const M = G.MAIN_MENU;
  if (!Array.isArray(M)) return;
  let i = M.findIndex(x => x && x.act === 'lang');
  if (i < 0) M.push({ label: langLabel(), act: 'lang' }); else M[i].label = langLabel();
}
function pageTexts() {
  try {
    const g = document.getElementById('gate');
    if (g) {
      const p = g.querySelector('.play'), h = g.querySelector('.hint');
      if (p) p.textContent = t(`Play|Играть|O'ynash`);
      if (h) h.innerHTML = t(`A dark pixel action RPG about a city on the back of a sleeping spirit. Sound starts after you press.|Мрачная пиксельная экшен-RPG о городе на спине спящего духа. Звук появится, когда нажмёшь.|Uxlab yotgan ruhning ustidagi shahar haqida qorong'i piksel ekshn-RPG. Tugmani bossang, tovush yoqiladi.`)
        + '<br>' + t(`A/D run · Space jump · J strike · K shield · Shift roll · Q/E skills · R water · F use|A/D бег · Пробел прыжок · J удар · K щит · Shift перекат · Q/E приёмы · R вода · F действие|A/D yugurish · Probel sakrash · J zarba · K qalqon · Shift dumalash · Q/E usullar · R suv · F amal`);
    }
    const tb = { KeyR: `Water|Вода|Suv`, ShiftLeft: `Roll|Перекат|Dumalash`, Space: `Jump|Прыжок|Sakrash`, KeyJ: `Strike|Удар|Zarba` };
    for (const k in tb) { const b = document.querySelector('#touch [data-k="' + k + '"]'); if (b) b.textContent = t(tb[k]); }
  } catch (e) { /* ignore */ }
}
LANG.onChange(() => { menuLang(); pageTexts(); if (G.YODGOR && G.YODGOR.onLang) G.YODGOR.onLang(); });
menuLang(); pageTexts();
