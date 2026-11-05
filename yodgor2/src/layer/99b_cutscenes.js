/* 99b_cutscenes.js — cutscenes (GDD ch. 26, stage 10): painted slides with a line under each, at the turns of the story.
   Each new moon of the Pledge Song (the three acts, W2.advanceMoon in 80_world_core.js) opens with three pictures of
   the city — how it changes after the milestone (the Singers tighten the tithe, the Divan closes streets, Those Who
   Remember set fires), drawn by the epilogue's painters (99_epilogue.js). Nothing here touches Sado (spoiler rule).
   Enter / Space / click / → next; Esc skips; every slide moves on by itself after ~7 s. */
{
  const EPI = G.EPILOGUE, W2 = G.WORLD2;
  if (!EPI || !EPI.def) { console.warn('[cut] no painter'); }
  const FXK = EPI && EPI.FXK;
  // the pictures
  if (EPI && EPI.def) {
    const d = EPI.def;
    d('cut:a1_tail', 'tail', { mood: 'night', lamps: [40, 100, 160, 222], lit: .45, fx: [FXK.ash(14, '#b8b4bc'), FXK.dust(8, '#ffc8a0')] });
    d('cut:a1_well', 'well', { fx: [FXK.motes(120, 60, 400, 200, '#e8eef8', 22)] });
    d('cut:a1_moon', 'city', { mood: 'night', lit: .3, moon: { x: 360, y: 36, r: 8, halo: '#8a9ad8' }, fx: [FXK.stars(50, 110), FXK.dust(8, '#c8c0d8')] });
    d('cut:a2_karez', 'karez', { fx: [FXK.motes(80, 80, 440, 220, '#9ff3e6', 18)] });
    d('cut:a2_heart', 'heart', { fx: [FXK.embers(260, 160, '#ff9a5a', 16)] });
    d('cut:a2_city', 'city', { mood: 'grey', lit: .55, chain: true, fx: [FXK.embers(380, 150, '#ffb050', 18), FXK.ash(20)] });
    d('cut:a3_dream', 'dream', { fx: [FXK.motes(60, 40, 460, 220, '#c9b4ff', 26)] });
    d('cut:a3_city', 'city', { mood: 'dusk', lit: .7, glow: [{ x: 260, y: 180, rx: 300, ry: 70, col: '#6a2a3a', a: .6 }], fx: [FXK.embers(200, 170, '#ffb050', 14), FXK.birds(6, 50)] });
    d('cut:a3_roof', 'roof', { fx: [FXK.stars(70, 120)] });
  }
  const CUTS = {
    1: [
      ['cut:a1_tail', `The Night of Payment is over. In the Tail, people count what they have left: a name, a recipe, the way home.|Ночь Уплаты позади. В Хвосте считают, что у них осталось: имя, рецепт, дорога домой.|To'lov kechasi ortda qoldi. Dumda nima qolganini sanashadi: ism, bir retsept, uyga yo'l.`],
      ['cut:a1_well', `In the Cloister the Singers count too. Their book is longer, and they read it aloud to something that never answers.|В Обители тоже считают — Певцы. Их книга длиннее, и они читают её вслух тому, кто никогда не отвечает.|Ibodatxonada Xonandalar ham sanaydi. Ularning daftari uzunroq, uni hech qachon javob bermaydiganga ovoz chiqarib o'qishadi.`],
      ['cut:a1_moon', `Above the roofs the moon begins to thin. When it is gone, the song bound to Ravshan will have finished with him.|Над крышами луна начинает таять. Когда её не станет, песня, которой связан Равшан, допоёт его до конца.|Tomlar uzra oy ozib boshlaydi. U yo'q bo'lganda, Ravshanni bog'lagan qo'shiq uni oxirigacha kuylab bo'ladi.`]
    ],
    2: [
      ['cut:a2_karez', `Under the city the water carries everything ever poured into it, downhill, the way it carries silt.|Под городом вода несёт всё, что в неё когда-либо влили, — под уклон, как ил.|Shahar ostida suv unga quyilgan hamma narsani loyqa kabi nishablikdan oqizadi.`],
      ['cut:a2_heart', `And under the water something turns in its sleep. Once every forty breaths, the stones grow warm.|А под водой что-то ворочается во сне. Раз в сорок вдохов камни теплеют.|Suv ostida esa nimadir uyquda ag'dariladi. Har qirq nafasda toshlar iliydi.`],
      ['cut:a2_city', `Half the moon is gone. The Divan closes streets, the Singers double the tithe, and somewhere a warehouse burns.|Половины луны уже нет. Диван перекрывает улицы, Певцы удваивают десятину, а где-то горит склад.|Oyning yarmi yo'q. Devon ko'chalarni yopmoqda, Xonandalar ushrni ikki baravar oshirmoqda, qayerdadir ombor yonmoqda.`]
    ],
    3: [
      ['cut:a3_dream', `The last nights. The city has started to dream out loud: streets that were never built, weddings nobody went to.|Последние ночи. Город начал видеть сны вслух: улицы, которых не строили, свадьбы, на которые никто не ходил.|So'nggi kechalar. Shahar ovoz chiqarib tush ko'ra boshladi: qurilmagan ko'chalar, hech kim bormagan to'ylar.`],
      ['cut:a3_city', `Every power in Yodgor has a plan for the Sleeper. Not one of them has asked it what it wants.|У каждой силы в Ёдгоре есть план на Спящего. Ни одна не спросила, чего хочет он сам.|Yodgordagi har bir kuchning Uxlovchi uchun rejasi bor. Birortasi ham undan nima istashini so'ramagan.`],
      ['cut:a3_roof', `On a roof in the Tail, Ravshan counts the stars. One. Two. Three. He loses count, and for once doesn't start again.|На крыше в Хвосте Равшан считает звёзды. Раз. Два. Три. Сбивается — и впервые не начинает заново.|Dumdagi tomda Ravshan yulduzlarni sanaydi. Bir. Ikki. Uch. Adashadi — va birinchi marta qaytadan boshlamaydi.`]
    ]
  };
  const CUT = G.CUTSCENE = { on: false, list: CUTS };
  const DUR = 420, XF = 40;
  let S = null;
  function play(list, done) {
    if (!EPI || !EPI.paintA || !list || !list.length) { done && done(); return; }
    S = { list, i: 0, t: 0, prev: null, done, blocker: true };
    CUT.on = true;
    G.UI.choice({ title: '', cancel: true, options: [{ label: ' ', value: null }], kind: 'scroll', onPick: () => { if (S) S.blocker = false; } });
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    try { G.Audio.sfx('scroll'); } catch (e) { /* ignore */ }
  }
  CUT.play = play;
  function next(skip) {
    if (!S) return;
    if (!skip && S.i < S.list.length - 1) { S.prev = { i: S.i, t: S.t }; S.i++; S.t = 0; try { G.Audio.sfx('ui_move'); } catch (e) { /* ignore */ } return; }
    end();
  }
  function end() {
    const cb = S && S.done;
    try { const m = G.UI._debug().modal; if (m && m.type === 'choice' && S.blocker) { m.picked = true; m.pickT = 0; m.pickVal = null; } } catch (e) { /* ignore */ }
    S = null; CUT.on = false;
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    if (cb) setTimeout(cb, 120);
  }
  window.addEventListener('keydown', e => {
    if (!S) return;
    e.stopImmediatePropagation(); e.preventDefault();
    if (e.repeat || S.t < 20) return;
    if (e.code === 'Escape') next(true);
    else if (['Enter', 'Space', 'ArrowRight', 'KeyD', 'KeyJ', 'KeyF'].includes(e.code)) next();
  }, true);
  window.addEventListener('keyup', e => { if (S) e.stopImmediatePropagation(); }, true);
  window.addEventListener('pointerdown', e => { if (S && S.t >= 20) { e.stopImmediatePropagation(); next(); } }, true);
  const font = (sz, w) => `${w || 400} ${sz}px Georgia, "Palatino Linotype", serif`;
  function wrap(c, s, w) { const out = []; let line = ''; for (const word of s.split(' ')) { const tr = line ? line + ' ' + word : word; if (c.measureText(tr).width > w && line) { out.push(line); line = word; } else line = tr; } out.push(line); return out; }
  SMOOTH_DRAW.push(ctx => {
    if (!S) return;
    S.t++;
    if (S.t > DUR) next();
    if (!S) return;
    const [id, text] = S.list[S.i];
    ctx.save();
    ctx.fillStyle = '#040208'; ctx.fillRect(0, 0, G.W, G.H);
    try {
      if (S.prev && S.t < XF) EPI.paintA(ctx, S.list[S.prev.i][0], S.prev.t + S.t, 1, 1 - S.t / XF);
      EPI.paintA(ctx, id, S.t, S.i % 2 ? -1 : 1, Math.min(1, S.t / XF));
    } catch (e) { console.error('[cut] paint', e); }
    ctx.globalAlpha = 1;
    // the line, low, over a soft shade
    const g = ctx.createLinearGradient(0, G.H - 70, 0, G.H); g.addColorStop(0, 'rgba(4,2,8,0)'); g.addColorStop(1, 'rgba(4,2,8,.85)'); ctx.fillStyle = g; ctx.fillRect(0, G.H - 70, G.W, 70);
    const a = Math.min(1, Math.max(0, (S.t - 24) / 30));
    ctx.globalAlpha = a;
    ctx.font = font(8.4); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const L = wrap(ctx, t(text), G.W - 90);
    L.forEach((l, i) => { const y = G.H - 18 - (L.length - i) * 11.5; ctx.fillStyle = 'rgba(0,0,0,.8)'; ctx.fillText(l, G.W / 2 + .5, y + .6); ctx.fillStyle = '#f2e6c8'; ctx.fillText(l, G.W / 2, y); });
    ctx.globalAlpha = .55 * a; ctx.font = font(5); ctx.fillStyle = '#c8b8a0';
    ctx.fillText((S.i + 1) + ' / ' + S.list.length + '   ·   ' + t(`Enter: next · Esc: skip|Enter — дальше · Esc — пропустить|Enter — keyingi · Esc — o'tkazish`), G.W / 2, G.H - 9);
    ctx.restore();
  });
  // the turns of the moon
  if (W2 && W2.hooks && W2.hooks.moon) W2.hooks.moon.push(m => {
    const list = CUTS[m]; if (!list) return;
    const k = 'cut:moon' + m; if (R().at[k]) return;
    R().at[k] = 1; save();
    queue(() => quiet(), () => scene(done => play(list, done)), 'cut' + m);
  });
}
