/* =====================================================================
   The game as an application: Options -> Language, Display & Graphics;
   Exit in the main menu; F11 toggles fullscreen. Inside the Windows exe
   (WebView2) fullscreen, window size, V-sync and exit are native.
   ===================================================================== */
{
  const isApp = () => typeof window.yodgorQuit === 'function';
  const FS_KEY = 'yodgor2_fullscreen', RES_KEY = 'yodgor2_res', VS_KEY = 'yodgor2_vsync';
  const RES = ['1280x720', '1600x900', '1920x1080', '2560x1440'];
  let fsOn = false, res = '1600x900', vsync = true;
  try {
    const v = localStorage.getItem(FS_KEY); fsOn = v == null ? isApp() : v === '1';
    res = localStorage.getItem(RES_KEY) || res; vsync = localStorage.getItem(VS_KEY) !== '0';
  } catch (e) { /* ignore */ }
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } };
  function applyFs(on) {
    fsOn = on; put(FS_KEY, on ? '1' : '0');
    try {
      if (isApp()) { window.yodgorFullscreen(on); if (!on) applyRes(res); return; }
      const d = document;
      if (on && !d.fullscreenElement && d.documentElement.requestFullscreen) d.documentElement.requestFullscreen().catch(() => {});
      if (!on && d.fullscreenElement && d.exitFullscreen) d.exitFullscreen().catch(() => {});
    } catch (e) { /* ignore */ }
  }
  function applyRes(r) {
    res = r; put(RES_KEY, r);
    if (isApp() && !fsOn && typeof window.yodgorWindow === 'function') { const [w, h] = r.split('x').map(Number); window.yodgorWindow(w, h); }
  }
  function applyVsync(on) { vsync = on; put(VS_KEY, on ? '1' : '0'); if (isApp() && typeof window.yodgorVsync === 'function') window.yodgorVsync(on); }
  document.addEventListener('fullscreenchange', () => { if (!isApp()) fsOn = !!document.fullscreenElement; menu(); });
  window.addEventListener('keydown', e => { if (e.code === 'F11') { e.preventDefault(); applyFs(!fsOn); menu(); } }, true);
  setTimeout(() => { if (isApp()) { if (fsOn) applyFs(true); else applyRes(res); } }, 400);
  // tell the exe that this start worked (it resets risky options if a start never reports in)
  setTimeout(() => { try { if (typeof window.yodgorAlive === 'function') window.yodgorAlive(); } catch (e) { /* ignore */ } }, 6000);

  const quit = () => { if (isApp()) { try { save(); } catch (e) { /* ignore */ } window.yodgorQuit(); } };
  const on = b => (b ? t(`On|Вкл|Yoqiq`) : t(`Off|Выкл|O'chiq`));
  const PRESET = { low: `Low (classic pixels)|Низкое (чистые пиксели)|Past (sof piksellar)`, medium: `Medium|Среднее|O'rtacha`, high: `High|Высокое|Yuqori`, ultra: `Ultra|Ультра|Ultra` };
  const SCALE = { fit: `Fill the screen|На весь экран|Ekranni to'ldirish`, integer: `Pixel-perfect|Пиксель в пиксель|Pikselma-piksel` };
  const FPS = { 0: `Unlimited|Без ограничений|Cheklovsiz`, 30: '30', 60: '60', 120: '120', 144: '144' };

  function display(back) {
    const S = G.GFX ? G.GFX.S : {};
    const opts = [
      { value: 'fs', label: t(`Display mode|Режим экрана|Ekran rejimi`) + ': ' + (fsOn ? t(`Fullscreen|Полный экран|To'liq ekran`) : t(`Windowed|В окне|Oynada`)) + '  (F11)' },
      { value: 'res', label: t(`Window size|Размер окна|Oyna o'lchami`) + ': ' + res.replace('x', '×') + (fsOn ? t(` (windowed)| (в окне)| (oynada)`) : '') , hide: !isApp() },
      { value: 'vsync', label: 'V-Sync: ' + on(vsync) + t(` (on restart)| (после перезапуска)| (qayta ishga tushirilgach)`), hide: !isApp() },
      { value: 'fps', label: t(`Frame rate limit|Ограничение FPS|FPS cheklovi`) + ': ' + t(FPS[S.fps || 0] || String(S.fps)) },
      { value: 'scale', label: t(`Scaling|Масштабирование|Masshtab`) + ': ' + t(SCALE[S.scaling || 'fit']) },
      { value: 'preset', label: t(`Graphics quality|Качество графики|Grafika sifati`) + ': ' + t(PRESET[S.preset || 'high']) + (G.GFX && !G.GFX.ok && S.preset !== 'low' ? t(` (WebGL unavailable)| (WebGL недоступен)| (WebGL mavjud emas)`) : '') },
      { value: 'rays', label: t(`Light shafts|Лучи света|Nur tutamlari`) + ': ' + on(S.rays == null ? S.preset === 'high' || S.preset === 'ultra' : S.rays) },
      { value: 'grain', label: t(`Film grain|Плёночное зерно|Plyonka donadorligi`) + ': ' + on(S.grain == null ? S.preset === 'ultra' : S.grain) },
      { value: 'bright', label: t(`Brightness|Яркость|Yorqinlik`) + ': ' + ((S.bright || 0) > 0 ? '+' : '') + (S.bright || 0) },
      { value: 'reset', label: t(`Reset graphics settings|Сбросить настройки графики|Grafika sozlamalarini asl holiga qaytarish`) + '  (F9)' },
      { value: null, label: t(`Back|Назад|Orqaga`), color: '#9a8a78' }
    ].filter(o => !o.hide);
    G.UI.choice({
      title: t(`Display & graphics|Экран и графика|Ekran va grafika`), cancel: true, options: opts,
      onPick: v => {
        if (!v) { back(); return; }
        const X = G.GFX;
        if (v === 'fs') applyFs(!fsOn);
        if (v === 'res') applyRes(RES[(RES.indexOf(res) + 1) % RES.length]);
        if (v === 'vsync') applyVsync(!vsync);
        if (X && v === 'fps') X.cycle('fps', [0, 30, 60, 120, 144]);
        if (X && v === 'scale') X.cycle('scaling', ['fit', 'integer']);
        if (X && v === 'preset') { X.cycle('preset', ['low', 'medium', 'high', 'ultra']); X.set('rays', null); X.set('grain', null); }
        if (X && v === 'rays') X.set('rays', !(X.S.rays == null ? X.S.preset === 'high' || X.S.preset === 'ultra' : X.S.rays));
        if (X && v === 'grain') X.set('grain', !(X.S.grain == null ? X.S.preset === 'ultra' : X.S.grain));
        if (X && v === 'ca') X.set('ca', !X.S.ca);
        if (X && v === 'reset') { X.reset(); applyVsync(true); }
        if (X && v === 'bright') X.set('bright', ((X.S.bright || 0) + 3) % 5 - 2); // -2..+2
        menu(); display(back);
      }
    });
  }
  function options() {
    G.UI.choice({
      title: t(`Language & display|Язык и экран|Til va ekran`), cancel: true,
      options: [
        { label: t(`Language|Язык|Til`) + ': ' + LANG.NAMES[LANG.lang], value: 'lang' },
        { label: t(`Display & graphics|Экран и графика|Ekran va grafika`), value: 'gfx' },
        { label: t(`Back|Назад|Orqaga`), value: null, color: '#9a8a78' }
      ],
      onPick: v => {
        if (v === 'lang') { LANG.cycle(); menu(); options(); }
        if (v === 'gfx') display(options);
      }
    });
  }
  G.MENU_ACT = act => {
    if (act === 'options') { options(); return true; }
    if (act === 'quit') { quit(); return true; }
    return false;
  };
  function menu() {
    const M = G.MAIN_MENU;
    if (!Array.isArray(M)) return;
    const li = M.findIndex(x => x && x.act === 'lang');
    if (li >= 0) M.splice(li, 1);
    const oi = M.findIndex(x => x && x.act === 'options');
    const ol = t(`Language & display|Язык и экран|Til va ekran`);
    if (oi < 0) { const at = M.findIndex(x => x && x.label === 'Управление'); M.splice(at < 0 ? M.length : at, 0, { label: ol, act: 'options' }); } else M[oi].label = ol;
    const qi = M.findIndex(x => x && x.act === 'quit');
    const ql = t(`Exit the game|Выйти из игры|O'yindan chiqish`);
    if (isApp()) { if (qi < 0) M.push({ label: ql, act: 'quit' }); else M[qi].label = ql; } else if (qi >= 0) M.splice(qi, 1);
  }
  LANG.onChange(menu);
  G.Events.on('state', st => { if (st === 'title') menu(); });
  menu();
  setTimeout(menu, 1000);
  G.APP = { isApp, applyFs, quit, options, display, get fullscreen() { return fsOn; } };
}
