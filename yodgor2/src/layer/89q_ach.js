/* 89q_ach.js — Stage 10: achievements, New Game+, play time (GDD ch. 20 "Достижения и НГ+", ch. 25 the 10-hour measure).
   - 40 achievements (endings, bosses, a boss without water, every companion's best outcome, the Oshiq champion,
     "not one Burning", collections…). Kept in the global save (saga.ach) — they belong to the player, not to a journey.
     Shown in the yodchi's book [Y], section "Deeds". G.ACH.unlock(id), G.ACH.check().
   - New Game+: after any ending, "New journey" asks whether to carry Ravshan over. Kept: level, attributes, skills,
     gear and the bestiary; story keys are not. Enemies ×1.4, every elite has two modifiers (and NG+ adds Swift and
     Warded), every boss gets one new move. Sado notices that the road is familiar (a few lines of her own in NG+).
   - Play time per journey (R().playT, seconds of play) and the totals, for the 10-hour measurement. */
{
  const AS = () => { if (!saga.ach || typeof saga.ach !== 'object') saga.ach = {}; return saga.ach; };
  const ACH = G.ACH = { S: AS, LIST: [] };
  const A = (id, name, desc, test) => ACH.LIST.push({ id, name, desc, test });
  const done = id => { try { return G.FAC && G.FAC.isDone(id); } catch (e) { return false; } };
  const f = k => { try { return G.COMP && G.COMP.f(k); } catch (e) { return null; } };
  const cnt = o => Object.keys(o || {}).filter(k => o[k]).length;
  const bossDown = id => !!(saga.codex && saga.codex.bs && saga.codex.bs[id]);
  const ended = id => !!(saga.endings && saga.endings[id]);

  // endings
  A('end_tithe', `The Great Tithe|Великая десятина|Buyuk ushr`, `Reach the Tithe ending.|Дойти до концовки «Десятина».|«Ushr» yakuniga yetish.`, () => ended('tithe'));
  A('end_chain', `The Chain|Цепь|Zanjir`, `Reach the Chain ending.|Дойти до концовки «Цепь».|«Zanjir» yakuniga yetish.`, () => ended('chain'));
  A('end_awake', `The Awakening|Пробуждение|Uyg'onish`, `Reach the Awakening ending.|Дойти до концовки «Пробуждение».|«Uyg'onish» yakuniga yetish.`, () => ended('awake'));
  A('end_tale', `The Tale|Сказание|Doston`, `Find the hidden ending: the Sleeper falls asleep on a story.|Найти скрытую концовку: Спящий засыпает под сказание.|Yashirin yakunni topish: Uxlovchi dostonga uxlab qoladi.`, () => ended('tale'));
  A('end_hollow', `Hollow|Пустой|Bo'sh`, `Lose yourself completely.|Потерять себя целиком.|O'zingni butunlay yo'qotish.`, () => ended('hollow'));
  // bosses
  const BN = [['glutton', `The Glutton|Обжора|Ochko'z`], ['kempir', `Yalmog'iz Kampir|Ялмагыз Кампир|Yalmog'iz Kampir`], ['hound', `The Gilded Hound|Позолоченный Пёс|Zarhal It`], ['choir', `The Silent Choir|Безмолвный Хор|Sokin xor`],
    ['albasty', `Albasty|Албасты|Albasti`], ['barys', `Ak Bars|Ак Барс|Oq Bars`], ['aidahar', `Ajdaho|Аждахо|Ajdaho`], ['seven', `The Seven|Семеро|Yettilik`]];
  for (const [id, nm] of BN) A('boss_' + id, nm, `Defeat this boss.|Одолеть этого босса.|Bu bossni yengish.`, () => bossDown(id));
  A('boss_faction', `Three voices|Три голоса|Uch ovoz`, `Defeat Shirin, Humo and Oydin.|Одолеть Ширин, Хумо и Ойдин.|Shirin, Humo va Oydinni yengish.`, () => ['f_shirin', 'f_humo', 'f_oydin'].every(bossDown));
  A('boss_dry', `Dry lips|Сухие губы|Quruq lab`, `Defeat a boss without drinking water once.|Одолеть босса, ни разу не испив воды.|Bir marta ham suv ichmay bossni yengish.`, () => !!AS()._dry);
  A('minibosses', `Eight names|Восемь имён|Sakkiz ism`, `Bring down all eight minibosses.|Повергнуть всех восьмерых мини-боссов.|Barcha sakkiz mini-bossni yiqitish.`, () => cnt(saga.mbDown) >= 8);
  // companions
  A('comp_alp', `He remembers|Он помнит|U eslaydi`, `Alp remembers his name and stays.|Алп вспоминает своё имя и остаётся.|Alp ismini eslaydi va qoladi.`, () => f('alpEnd') === 'redeemed' || !!AS()._alp);
  A('comp_nargiza', `She believes|Она верит|U ishonadi`, `Nargiza believes the voice.|Наргиза верит голосу.|Nargiza ovozga ishonadi.`, () => F().nargizaQ === 'believes' || !!AS()._narg);
  A('comp_surayyo', `Under the Pleiades|Под Плеядами|Hulkar ostida`, `Surayyo stays with you.|Сурайё остаётся с тобой.|Surayyo sen bilan qoladi.`, () => f('rom') === 'yes' || !!AS()._sur);
  A('comp_knot', `The knot untied|Развязанный узел|Yechilgan tugun`, `Nargiza forgives Alp.|Наргиза прощает Алпа.|Nargiza Alpni kechiradi.`, () => f('knot') === 'forgive' || !!AS()._knot);
  // factions and stories
  A('fac_singers', `The Well's voice|Голос Колодца|Quduq ovozi`, `Finish the Singers' arc.|Завершить арку Певцов.|Xonandalar yo'lini yakunlash.`, () => done('s6'));
  A('fac_divan', `The ledger's hand|Рука долговой книги|Daftar qo'li`, `Finish the Divan's arc.|Завершить арку Дивана.|Devon yo'lini yakunlash.`, () => done('d6'));
  A('fac_remember', `The ash cloak|Пепельный плащ|Kul plash`, `Finish the arc of Those Who Remember.|Завершить арку Помнящих.|Eslovchilar yo'lini yakunlash.`, () => done('r6'));
  A('sides', `Twenty doors|Двадцать дверей|Yigirma eshik`, `Finish twenty stories off the main road.|Завершить двадцать историй в стороне от главной дороги.|Asosiy yo'ldan chetdagi yigirmata hikoyani yakunlash.`, () => { try { return Object.keys(G.FAC.Q).filter(k => G.FAC.Q[k].fac === 'side' && G.FAC.isDone(k)).length >= 20; } catch (e) { return false; } });
  A('cameo', `The Blue Wolf|Синий волк|Ko'k bo'ri`, `See the premiere of Sherzod and Azamat's show.|Увидеть премьеру представления Шерзода и Азамата.|Sherzod va Azamat tomoshasining premyerasini ko'rish.`, () => done('cameo'));
  A('hunts', `The board is empty|Доска пуста|Taxta bo'sh`, `Close all ten hunting contracts.|Закрыть все десять охотничьих контрактов.|O'nta ov shartnomasini yopish.`, () => { try { return cnt(G.HUNT.S().done) >= 10; } catch (e) { return false; } });
  // the memory craft
  A('no_burn', `Not one Burning|Ни одного Сожжения|Birorta ham kuydirmay`, `Reach an ending without burning a single memory.|Дойти до концовки, не сжёгши ни одного воспоминания.|Birorta ham xotirani kuydirmay yakunga yetish.`, () => !!AS()._noburn);
  A('no_taste', `Clean hands|Чистые руки|Toza qo'llar`, `Reach an ending without tasting anyone's memory.|Дойти до концовки, не испив ни одного чужого воспоминания.|Birovning xotirasini totmay yakunga yetish.`, () => !!AS()._notaste);
  A('light', `A light step|Лёгкий шаг|Yengil qadam`, `Reach an ending with Hollowness under 30.|Дойти до концовки с Пустотой меньше 30.|Bo'shliq 30 dan kam holda yakunga yetish.`, () => !!AS()._light);
  A('back', `Back from the edge|С края обратно|Chekkadan qaytish`, `Rise above 70 Hollowness, then come back below 40.|Подняться выше 70 Пустоты и вернуться ниже 40.|Bo'shliqni 70 dan oshirib, keyin 40 dan pastga qaytarish.`, () => !!AS()._back);
  // collections
  A('oshiq_champion', `Oshiq champion|Чемпион Ошиқ|Oshiq chempioni`, `Win the Bazaar tournament.|Выиграть турнир на Базаре.|Bozor turnirida g'olib bo'lish.`, () => { try { return !!G.OSHIQ.S().champion; } catch (e) { return false; } });
  A('alchiks', `A full bag|Полный мешочек|To'la xalta`, `Collect all thirty alchiks.|Собрать все тридцать альчиков.|O'ttizta oshiqning barchasini yig'ish.`, () => { try { return G.OSHIQ.count() >= G.OSHIQ.BONES.length; } catch (e) { return false; } });
  A('notes', `The whole library|Вся библиотека|Butun kutubxona`, `Read all sixty notes and books.|Прочесть все шестьдесят записок и книг.|Oltmishta xat va kitobning barchasini o'qish.`, () => { try { return G.CODEX.readBooks().length >= G.CODEX.BOOKS.length; } catch (e) { return false; } });
  A('memories', `Toychoq|Тойчок|Toychoq`, `Find every lost memory of Ravshan.|Найти все потерянные воспоминания Равшана.|Ravshanning barcha yo'qolgan xotiralarini topish.`, () => { try { const L = G.CODEX.memList(); return L.length && L.every(m => saga.mem[m.id]); } catch (e) { return false; } });
  A('bestiary', `Where to hit|Куда бить|Qayerga urish`, `Know the weak spot of every creature in the bestiary.|Знать слабое место каждого существа в бестиарии.|Maxluqnomadagi har bir jonzotning zaif joyini bilish.`, () => { try { return G.CODEX.BEAST.every(b => G.CODEX.known(b[0])); } catch (e) { return false; } });
  A('craft10', `Wax on the fingers|Воск на пальцах|Barmoqlarda mum`, `Make ten things with your own hands.|Сделать своими руками десять вещей.|O'z qo'ling bilan o'nta narsa yasash.`, () => (saga.made || 0) >= 10);
  A('tumar', `Three turns, one knot|Три оборота, один узел|Uch aylana, bitta tugun`, `Sew your first tumar.|Сшить первый тумар.|Birinchi tumarni tikish.`, () => !!saga.sewn);
  A('level20', `An old hand|Старый мастер|Tajribali usta`, `Reach level 20.|Достичь 20-го уровня.|20-darajaga yetish.`, () => { try { return G.CH.level() >= 20; } catch (e) { return false; } });
  A('ngplus', `Again, Toychoq|Ещё раз, Тойчок|Yana bir bor, Toychoq`, `Begin a New Game+.|Начать Новую игру+.|Yangi o'yin+ ni boshlash.`, () => (saga.ngMax || 0) >= 1);
  A('tenhours', `A long road|Долгая дорога|Uzoq yo'l`, `Walk the city for ten hours, all journeys together.|Провести в городе десять часов, все походы вместе.|Shaharda barcha safarlar bilan birga o'n soat yurish.`, () => (saga.playT || 0) >= 36000);

  ACH.unlock = id => {
    const s = AS(); if (s[id]) return false;
    const a = ACH.LIST.find(x => x.id === id); if (!a) return false;
    s[id] = Date.now(); save();
    toast('★ ' + t(a.name), '#ffd77a'); sfx('victory', { vol: .4 });
    return true;
  };
  ACH.check = () => { for (const a of ACH.LIST) { if (AS()[a.id]) continue; let ok = false; try { ok = a.test(); } catch (e) { ok = false; } if (ok) ACH.unlock(a.id); } };
  ACH.count = () => ACH.LIST.filter(a => AS()[a.id]).length;
  // the conditions that need watching while you play
  G.Events.on('bossStart', () => { ACH._flasks0 = G.run ? G.run.flasks : null; ACH._drank = false; });
  {
    const u0 = G.YITEMS && G.YITEMS.use;
    let lastF = null;
    if (typeof TICK_STAGE !== 'undefined') TICK_STAGE.push(() => {
      if (!G.run) return;
      if (lastF != null && G.run.flasks < lastF) ACH._drank = true;
      lastF = G.run.flasks;
      const v = R().void;
      if (v > 70) R()._hi70 = 1;
      if (R()._hi70 && v < 40) AS()._back = AS()._back || 1;
      if ((G.run.gold || 0) >= 1000) AS()._rich = AS()._rich || 1;
    });
    void u0;
  }
  G.Events.on('bossDefeated', () => { if (!ACH._drank) { AS()._dry = 1; save(); } setTimeout(ACH.check, 500); });
  G.Events.on('kill', e => { if (e && e._mb) { saga.mbDown = saga.mbDown || {}; saga.mbDown[e._mb] = 1; save(); setTimeout(ACH.check, 300); } });
  // at an ending: the journey-wide conditions
  G.Events.on('state', st => {
    if (st !== 'victory') return;
    try {
      const r = R();
      if (!r.burns) AS()._noburn = 1;
      if (!r.tastes) AS()._notaste = 1;
      if (r.void < 30 && r.ended !== 'hollow') AS()._light = 1;
      if (G.COMP && G.COMP.f('alpEnd') === 'redeemed') AS()._alp = 1;
      if (F().nargizaQ === 'believes') AS()._narg = 1;
      if (G.COMP && G.COMP.f('rom') === 'yes') AS()._sur = 1;
      if (G.COMP && G.COMP.f('knot') === 'forgive') AS()._knot = 1;
      // what New Game+ will carry: Ravshan himself, not the story
      saga.ngCarry = JSON.parse(JSON.stringify(r.ch || null));
      saga.ngCarryNg = r.ng || 0;
      save();
    } catch (e) { console.error('[ach] ending', e); }
    setTimeout(ACH.check, 800);
  });
  // crafting counts (89n)
  if (G.CRAFT) { const mk0 = G.CRAFT.make; G.CRAFT.make = id => { const ok = mk0(id); if (ok) { saga.made = (saga.made || 0) + 1; if (/^t_/.test(id)) saga.sewn = 1; save(); setTimeout(ACH.check, 100); } return ok; }; }
  // now and then
  setInterval(() => { try { if (G.run && G.Game.state === 'play') ACH.check(); } catch (e) { /* ignore */ } }, 15000);

  /* ================================================================ play time */
  {
    let last = performance.now();
    const tickT = () => {
      const now = performance.now(), dt = Math.min(1, (now - last) / 1000); last = now;
      if (!G.run || G.Game.state !== 'play' || (G.UI.isOpen && G.UI.isOpen() && G.UI._debug().modal && G.UI._debug().modal.type === 'pause')) return;
      const r = R(); r.playT = (r.playT || 0) + dt; saga.playT = (saga.playT || 0) + dt;
    };
    if (typeof SMOOTH_DRAW !== 'undefined') SMOOTH_DRAW.push(() => { tickT(); });
    setInterval(save, 30000);
  }
  const hm = s => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return h + ':' + String(m).padStart(2, '0'); };
  ACH.time = () => ({ run: hm(R().playT), all: hm(saga.playT) });

  /* ================================================================ New Game+ */
  const NG = G.NGPLUS = {};
  NG.level = () => R().ng || 0;
  NG.can = () => !!saga.ngCarry && Object.keys(saga.endings || {}).length > 0;
  // after any ending, a new journey begins with the question (the first moment of the first land)
  let askNG = false;
  ON_NEWRUN.push(() => { askNG = NG.can(); });
  G.Events.on('stageStart', () => {
    if (!askNG) return;
    askNG = false;
    setTimeout(() => scene(done => ask(`Begin again as you are now?|Начать заново таким, каким ты стал?|Hozirgi holingda qaytadan boshlaysanmi?`, [
      { id: 'ng', label: `New Game+: keep level, skills, gear and the bestiary (enemies ×1.4)|Новая игра+: сохранить уровень, навыки, снаряжение и бестиарий (враги ×1,4)|Yangi o'yin+: daraja, mahorat, jihoz va maxluqnomani saqlash (dushmanlar ×1,4)` },
      { id: 'clean', label: `A clean start|Начать с чистого листа|Toza varaqdan boshlash` }
    ], o => { if (o.id === 'ng') carry(); done(); })), 900);
  });
  function carry() {
    try {
      const r = R(), c = JSON.parse(JSON.stringify(saga.ngCarry));
      // story keys stay in the old journey
      if (c && Array.isArray(c.inv)) { c.inv = c.inv.filter(e => { const d = G.Items.defs[e.id]; return !(d && d.yd && d.yd.type === 'key'); }); for (const k in c.eq || {}) if (c.eq[k] != null && !c.inv.some(e => e.u === c.eq[k])) c.eq[k] = null; }
      if (c) { c.legends = {}; r.ch = c; }
      r.ng = (saga.ngCarryNg || 0) + 1;
      saga.ngMax = Math.max(saga.ngMax || 0, r.ng);
      if (G.run) G.run.ngPlus = r.ng;
      save();
      G.CH.dirty(); if (G.CH.syncHp) G.CH.syncHp();
      toast(tf(`New Game+ {n}: the city remembers you, and it is harder now.|Новая игра+ {n}: город помнит тебя — и стал жёстче.|Yangi o'yin+ {n}: shahar seni eslaydi — va endi qattiqroq.`, { n: r.ng }), '#ffd77a');
      setTimeout(ACH.check, 500);
    } catch (e) { console.error('[ng+]', e); }
  }
  NG.carry = carry;
  // Sado feels the road is familiar (NG+ only: the player already knows the story)
  const NGS = [
    ['ngs1', `Ravshan… have we walked this street before? Not yesterday. Before. Like a song you know the end of.|Равшан… мы уже шли по этой улице? Не вчера. Раньше. Как песня, у которой знаешь конец.|Ravshan… bu ko'chadan avval o'tganmidik? Kecha emas. Undan oldin. Oxirini biladigan qo'shiqdek.`],
    ['ngs2', `I know what you're going to say. Don't. Let me be surprised.|Я знаю, что ты сейчас скажешь. Не говори. Дай мне удивиться.|Hozir nima deyishingni bilaman. Aytma. Hayron bo'lay.`],
    ['ngs3', `This time, count slower. One. Two. Three. There's more room between the numbers than you think.|В этот раз считай медленнее. Раз. Два. Три. Между числами больше места, чем тебе кажется.|Bu safar sekinroq sana. Bir. Ikki. Uch. Raqamlar orasida sen o'ylagandan ko'proq joy bor.`]
  ];
  ON_STAGE.push(() => {
    if (!(R().ng > 0)) return;
    const L = NGS.filter(x => !R().at['ng:' + x[0]]);
    if (!L.length) return;
    queue(() => quiet() && sadoAwake(), () => { const x = L[0]; R().at['ng:' + x[0]] = 1; save(); scene(done => play([['sado', x[1]]], done)); }, 'ngsado');
  });
  // a continued journey keeps its NG+ number on the engine's run
  G.Events.on('stageStart', () => { if (G.run && R().ng) G.run.ngPlus = R().ng; });
  // enemies ×1.4 (bosses included: their per-hit cap of 8% is a share of their health, so it scales with them)
  {
    const adj0 = G.ADJUST_DIFF;
    G.ADJUST_DIFF = function (diff, run) { if (adj0) adj0.apply(this, arguments); const n = R().ng || 0; if (n > 0) { const k = Math.pow(1.4, Math.min(n, 3)); diff.hpMul *= k; diff.dmgMul *= k; } };
  }
  // NG+ elite modifiers: Swift (acts faster), Warded (shrugs off the first status)
  if (G.ELITE_MODS) {
    G.ELITE_MODS.swift = { name: `Swift|Стремительный|Chaqqon`, col: '#9cf0a0', ng: true };
    G.ELITE_MODS.warded = { name: `Warded|Заговорённый|Duo o'qilgan`, col: '#e8e0c8', ng: true };
    const sp0 = G.Enemies.spawn;
    G.Enemies.spawn = function () {
      const e = sp0.apply(this, arguments);
      try {
        if (e && e._mods && (R().ng || 0) > 0 && Math.random() < .5 && e._mods.length < 3) {
          const k = Math.random() < .5 ? 'swift' : 'warded';
          if (!e._mods.includes(k)) e._mods.push(k);
          if (k === 'warded') { const as0 = e.addStatus.bind(e); let first = true; e.addStatus = (s, o) => { if (first) { first = false; try { G.FX.text(e.x, e.top - 8, t(`warded|заговорён|duo bor`), '#e8e0c8', { size: 6 }); } catch (x) { /* ignore */ } return; } return as0(s, o); }; }
        }
      } catch (x) { /* ignore */ }
      return e;
    };
    const u0 = G.Enemy.prototype.update;
    G.Enemy.prototype.update = function () { u0.apply(this, arguments); if (this._mods && this._mods.includes('swift') && !this.dead && this.t % 3 === 0) u0.apply(this, arguments); };
  }
  // every boss: one new move in NG+ (a named echo of the boss, telegraphed on the floor under you)
  const NGMOVE = {
    glutton: [`Tumar hail|Град тумаров|Tumar do'li`, '#ffd76a'], kempir: [`The crows' verdict|Приговор воронов|Qarg'alar hukmi`, '#8aff8a'], hound: [`Gilded rain|Золотой дождь|Oltin yomg'ir`, '#ffcf4a'],
    choir: [`The silent chord|Беззвучный аккорд|Ovozsiz akkord`, '#c9b4ff'], albasty: [`The drowning|Утопление|Cho'ktirish`, '#7fe8dc'], barys: [`Avalanche|Лавина|Ko'chki`, '#bff4ff'],
    aidahar: [`Ash fall|Пеплопад|Kul yog'ishi`, '#ff8a3a'], seven: [`The eighth voice|Восьмой голос|Sakkizinchi ovoz`, '#ffe7a6'], f_shirin: [`The last verse|Последний куплет|So'nggi band`, '#e8eef8'],
    f_humo: [`The ledger closes|Книга закрывается|Daftar yopiladi`, '#ffd76a'], f_oydin: [`Everything remembered|Всё вспомнено|Hammasi esga olindi`, '#c9b4ff']
  };
  s6init(() => {
    for (const id in NGMOVE) {
      const d = G.Enemies.defs[id]; if (!d || d._ngMove) continue;
      d._ngMove = true;
      const u0 = d.update;
      d.update = function (b) {
        if ((R().ng || 0) > 0 && b.mode === 'fight' && !b.dead) {
          if (b._ngS) { ngStep(b, id); return; }
          if (b.state === 'idle' || b.state === 'chase') { b._ngCD = (b._ngCD == null ? 420 : b._ngCD) - 1; if (b._ngCD <= 0) { b._ngCD = 600 + Math.random() * 240; b._ngS = { t: 0, xs: [] }; } }
        }
        return u0 ? u0.call(this, b) : undefined;
      };
    }
  });
  function ngStep(b, id) {
    const S = b._ngS, p = G.world.player, M = NGMOVE[id];
    b.vx = (b.vx || 0) * .8;
    if (S.t === 0) {
      toast(t(M[0]), M[1]);
      try { b.roar && b.roar({ color: M[1], shake: .2 }); } catch (e) { /* ignore */ }
      for (let i = 0; i < 3; i++) S.xs.push(p.x + (i - 1) * 46 + (Math.random() - .5) * 10);
      for (const x of S.xs) { const gy = G.level.groundBelow(x, p.y - 40, 120); if (gy === null) continue; try { G.world.add(new G.BossKit.Marker({ x, y: gy, w: 30, life: 50, color: M[1], style: 'column', hgt: 120 })); } catch (e) { /* ignore */ } }
    }
    if (S.t === 50) {
      for (const x of S.xs) {
        const gy = G.level.groundBelow(x, p.y - 40, 120); if (gy === null) continue;
        try { G.FX.burst(x, gy - 30, 18, { color: M[1], speed: 2.4, life: 30, size: 2, glow: true }); } catch (e) { /* ignore */ }
        if (p && !p.dead && Math.abs(p.x - x) < 17 && p.y > gy - 130 && p.y <= gy + 4) G.Combat.hit(b, p, { dmg: b.dmg * 0.9, kbx: 2, kby: -3, dir: Math.sign(p.x - x) || 1, type: 'magic' });
      }
      sfx('explosion', { x: p.x, vol: .5 });
    }
    if (++S.t > 80) b._ngS = null;
  }
}
