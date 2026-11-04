/* =====================================================================
   Stage 5 — the story in the open city ("Перенос сюжета").
   The prologue (the Night of Payment and the Vault) still plays as two
   linear stages; when the Glutton falls the journey wakes in the Tail's
   chaikhana and from then on everything happens in the connected world.

   The old 33 plan entries stay as data (their ids, acts, biomes) so old
   saves and ?stage=N land on the same story point; loading entry 2..31
   enters the world there (enterAt). Each entry has a home:
     LAND  -> a region: start on arrival, the people at its 'story' spot,
              the lost memory at 'mem', the stones, the barks, the mid scene
     REST  -> a chaikhana host (Rustam, Turab's mime, Farrukh, the lullaby)
     BOSS  -> a lair (an arena region) behind a gate of its host region
   A chapter is done (R().at['done:<id>']) when its people's scene, its
   rest's arrival or its boss's last scene has played.

   Acts run in parallel threads (GDD ch.5):
     Act I   after the Tail: Turab's voice (Bazaar) / the Ark (+ Hound) /
             the Cloister (+ Choir), in any order; plus the Rabat and the
             Tower. Two of the three -> the Well opens, the water turns
             bitter; the moon wanes when he goes down to the smugglers'
             den (warning first). Davron's caravan does not wait for that.
     Act II  the karez, the streets, the cistern (water), Old Yodgor,
             the Well and the Seven, the Spine (breath) and Ak Bars, the
             Heart (warning; the moon is a sickle; the city cracks).
             The third Act I thread and the side regions stay open until then.
     Act III the dream: the wedding and the Year of Sand in any order, the
             dream chaikhana, Your House; the nest (warning; new moon).
   Difficulty follows the moon and the act's progress, not the hero's level.
   ===================================================================== */
{
  const STORY = W2.story = G.STORY_W = {};
  const S2 = () => W2.S();
  const moon = () => { const s = S2(); return s ? s.moon || 0 : 0; };
  const join3 = (xs, sep) => {
    const ps = xs.filter(Boolean).map(x => String(x).split('|'));
    return [0, 1, 2].map(i => ps.map(p => p[i] || p[0]).join(sep || ' · ')).join('|');
  };

  /* ================================================================ the chapters */
  const BEATS = [
    { id: 'p_tail', type: 'land', act: 0 },
    { id: 'b_vault', type: 'boss', boss: 'glutton', act: 0 },
    { id: 'r_plane', type: 'rest', chai: 'tail_plane', act: 1, after: [] },
    { id: 'a1_tail', type: 'land', region: 'tail', act: 1, after: ['r_plane'] },
    { id: 'a1_rabat', type: 'land', region: 'rabat', act: 1, after: ['a1_tail'], thread: 'rabat' },
    { id: 'b_tower', type: 'boss', boss: 'kempir', arena: 'tower_top', act: 1, after: ['a1_rabat'], thread: 'rabat' },
    { id: 'r_salt', type: 'rest', chai: 'rabat_salt', act: 1, after: ['b_tower'], thread: 'rabat' },
    { id: 'a1_bazaar', type: 'land', region: 'bazaar', act: 1, after: ['a1_tail'], thread: 'voice' },
    { id: 'a1_ark', type: 'land', region: 'ark', act: 1, after: ['a1_tail'], thread: 'ark' },
    { id: 'b_court', type: 'boss', boss: 'hound', arena: 'court', act: 1, after: ['a1_ark'], thread: 'ark' },
    { id: 'r_ark', type: 'rest', chai: 'ark_wall', act: 1, after: ['b_court'], thread: 'ark' },
    { id: 'a1_cloister', type: 'land', region: 'cloister', act: 1, after: ['a1_tail'], thread: 'cloister' },
    { id: 'b_choir', type: 'boss', boss: 'choir', arena: 'choir', act: 1, after: ['a1_cloister'], thread: 'cloister' },
    { id: 'r_den', type: 'rest', chai: 'karez_den', act: 2, after: ['@m1'] },
    { id: 'a2_karez', type: 'land', region: 'karez', act: 2, after: ['r_den'] },
    { id: 'a2_streets', type: 'land', region: 'streets', act: 2, after: ['a2_karez'] },
    { id: 'b_cistern', type: 'boss', boss: 'albasty', arena: 'lair', act: 2, after: ['a2_streets'] },
    { id: 'r_lamp', type: 'rest', chai: 'last_lamp', act: 2, after: ['b_cistern'] },
    { id: 'a2_old', type: 'land', region: 'old', act: 2, after: ['b_cistern'] },
    { id: 'a2_well', type: 'land', region: 'well', act: 2, after: ['a2_old'] },
    { id: 'b_seven', type: 'boss', boss: 'seven', arena: 'bottom', act: 2, after: ['a2_well'] },
    { id: 'r_rib', type: 'rest', chai: 'ribs', act: 2, after: ['b_seven'] },
    { id: 'a2_spine', type: 'land', region: 'spine', act: 2, after: ['b_seven'] },
    { id: 'b_shrine', type: 'boss', boss: 'barys', arena: 'shrine', act: 2, after: ['a2_spine'] },
    { id: 'r_spine', type: 'rest', chai: 'spine_chai', act: 2, after: ['b_shrine'] },
    { id: 'a2_heart', type: 'land', region: 'heart', act: 2, after: ['b_shrine'], milestone: 2 },
    { id: 'a3_dream', type: 'land', region: 'dream', act: 3, after: ['a2_heart'] },
    { id: 'a3_wedding', type: 'land', region: 'wedding', act: 3, after: ['a3_dream'] },
    { id: 'a3_sand', type: 'land', region: 'sand', act: 3, after: ['a3_dream'] },
    { id: 'r_dream', type: 'rest', chai: 'dream_chai', act: 3, after: ['a3_dream'] },
    { id: 'a3_house', type: 'land', region: 'house', act: 3, after: ['a3_wedding', 'a3_sand'] },
    { id: 'b_nightmare', type: 'boss', boss: 'aidahar', arena: 'nest', act: 3, after: ['a3_house'], milestone: 3 }
  ];
  const BY = {}, LAND_AT = {}, REST_AT = {}, ARENA_BEAT = {}, BOSS_BEAT = {};
  BEATS.forEach((b, i) => {
    b.i = i; BY[b.id] = b;
    if (b.type === 'land' && b.region) LAND_AT[b.region] = b.id;
    if (b.type === 'rest') REST_AT[b.chai] = b.id;
    if (b.arena) { ARENA_BEAT[b.arena] = b.id; W2.regions[b.arena].beat = b.id; }
    if (b.boss) BOSS_BEAT[(BOSSES[b.boss] && BOSSES[b.boss].id) || b.boss] = b.id;
  });
  STORY.BEATS = BEATS; STORY.BY = BY; STORY.LAND_AT = LAND_AT; STORY.REST_AT = REST_AT; STORY.LANDS = LANDS;
  const ACT1_THREADS = ['a1_bazaar', 'b_court', 'b_choir'];      // voice / Ark / Cloister: two of three open the Well
  const ACT1_ALL = ['a1_rabat', 'b_tower', 'a1_bazaar', 'a1_ark', 'b_court', 'a1_cloister', 'b_choir'];

  const done = id => !!(R().at && R().at['done:' + id]);
  const closed = b => {
    const m = moon();
    if (b.thread === 'rabat' && m >= 1 && !done('a1_rabat')) return true;      // Davron's caravan did not wait
    if (b.act === 1 && m >= 2) return true;                                     // the waking city cracked
    if (b.act === 2 && m >= 2 && b.type === 'rest') return true;
    if (b.act === 3 && m >= 3 && b.type === 'rest') return true;
    return false;
  };
  const after = b => (b.after || []).every(a => (a === '@m1' ? moon() >= 1 : done(a)));
  const available = b => !!b && !done(b.id) && after(b) && !closed(b) && (b.act < 2 || moon() >= 1) && (b.act < 3 || moon() >= 2);
  STORY.done = done; STORY.available = id => available(BY[id]); STORY.closed = id => closed(BY[id]);
  const nameOf = b => b.type === 'land' ? (LANDS[b.id] && LANDS[b.id].name) : b.type === 'rest' ? (RESTS[b.id] && RESTS[b.id].name) : ((BOSSES[b.boss] && (BOSSES[b.boss].lair || BOSSES[b.boss].name)) || b.id);
  const hostOf = b => b.type === 'land' ? [b.region, 'story'] : b.type === 'rest' ? [W2.chaiDef(b.chai) && W2.chaiDef(b.chai).region, b.chai] : b.arena ? W2.regions[b.arena].out : null;

  /* ================================================================ the story's hooks into the shared files */
  const inWorld = () => !!(G.run && W2.isWorldPI(G.run.planIndex) && R().world);
  G.STORY_KEY = () => {
    if (!inWorld()) return PI();
    if (W2.inside) return REST_AT[W2.inside] || ('chai:' + W2.inside);
    const d = W2.regions[W2.active];
    if (d && d.arena) return ARENA_BEAT[d.id] || ('w:' + d.id);
    return LAND_AT[W2.active] || ('w:' + W2.active);
  };
  G.STORY_ACT = id => (BY[id] && BY[id].type === 'land' ? BY[id].act : null);
  G.STORY_REACHED = i => (BEATS[i] ? done(BEATS[i].id) : false);
  // which chapter lives in the active region (its stones, its memory, its scenes)
  G.STORY_LAND = () => { const id = LAND_AT[W2.active]; if (!id) return null; const b = BY[id]; return done(id) || available(b) ? id : null; };
  // stones of a region: its chapter's (they tell of the place, whenever he comes), else the region's own
  G.STORY_STONES = () => { const id = LAND_AT[W2.active]; if (id && LANDS[id] && LANDS[id].stones && LANDS[id].stones.length) return { id, list: LANDS[id].stones }; return W2.regionStones ? W2.regionStones(W2.active) : null; };
  // which rest is served in this chaikhana (from its chapter on, while its act lasts)
  G.STORY_REST = () => { const id = REST_AT[W2.inside]; if (!id) return null; const b = BY[id]; return (done(id) || available(b)) && !closed(b) ? id : null; };
  G.STORY_RESTED = id => { if (BY[id] && !done(id)) markDone(id); };
  // a boss's last scene has played: record it, leave the lair through its gate on the next load
  G.STORY_BOSS_DONE = bossId => {
    if (!inWorld()) return false;
    const id = BOSS_BEAT[bossId];
    const s = S2();
    s.bosses = s.bosses || {}; s.bosses[bossId] = 1;
    const d = W2.regions[W2.active];
    if (id && !done(id)) markDone(id, true);
    if (d && d.arena && d.out && !R().ended) { s.cur = { region: d.out[0], entry: d.out[1], inside: null }; save(); try { checkpoint(); } catch (e) { console.error(e); } s.cur = { region: d.id, entry: 'start', inside: null }; save(); }
    return true;
  };
  // Turab's mime in the salt-well chaikhana points to an auction that may already be over
  if (RESTS.r_salt) RESTS.r_salt.turabIf = () => !done('a1_bazaar');

  /* ================================================================ marking chapters done, keys, milestones */
  function markDone(id, quiet) {
    R().at['done:' + id] = 1; save();
    const b = BY[id];
    if (b && b.type === 'land') { try { if (G.CH && G.CH.landDone) G.CH.landDone(id); } catch (e) { console.error('[story] xp', e); } }
    try { rewards(id); } catch (e) { console.error('[story] rewards', e); }
    progress();
    W2.autosave && W2.autosave();
  }
  STORY.markDone = markDone;
  const legend = (k, o) => { try { if (G.CH && G.CH.grantLegend) G.CH.grantLegend(k, o); } catch (e) { console.error('[story] legend', e); } };
  // what a finished chapter gives: keys of the world, legendary weapons (stage 3 notes)
  function rewards(id) {
    const f = F();
    if (id === 'b_cistern') W2.giveKey('water');
    if (id === 'a2_spine') W2.giveKey('breath');
    if (id === 'b_seven') legend('seven_link');
    if (id === 'b_shrine' && f.barys === 'killed') legend('akbars');
    if (id === 'b_court' && f.hound === 'killed') legend('gilded_fang');
    if (id === 'b_court' && f.hound === 'shown') { legend('gilded_fang', { gift: true }); try { G.CH.S().legends.gilded_gift = 1; } catch (e) { /* ignore */ } }   // 67 reads 'gilded_gift'
    if (id === 'a1_rabat' && (f.davron === 'led' || f.davron === 'bluff')) legend('davron');
  }
  // keys and legends that follow flags set inside scenes (voice at the auction, Turab's words, the tales, Rustam)
  function flagKeys() {
    const f = F();
    if ((f.voice === 'bought' || f.voice === 'stolen' || f.turabSpoke) && !W2.hasKey('voice')) W2.giveKey('voice');
    if (f.tales && !W2.hasKey('tales')) W2.giveKey('tales', W2.hasKey('voice'));
    if (f.turabSpoke) legend('turab');
    if (R().at.a3_rustam) legend('rustam');          // the dream chaikhana: Rustam's last words, said with his own mouth
  }
  const M1_LINES = [
    ['', `Deep under the city something gives way, like a breath let out after holding it too long. By evening the water in every well tastes bitter.|Глубоко под городом что-то поддаётся — словно кто-то долго не дышал и наконец выдохнул. К вечеру вода во всех колодцах горчит.|Shahar ostida, juda chuqurda nimadir bo'shab ketadi — xuddi uzoq ushlab turilgan nafas chiqqandek. Kechga borib hamma quduqlardagi suv achchiq tortadi.`],
    () => (sadoAwake() ? ['sado', `The Well is open. I can feel it from here. Everything that went down is waiting. The smugglers' den, Ravshan. The karez.|Колодец открылся. Я отсюда чувствую. Всё, что ушло вниз, ждёт. Логово контрабандистов, Равшан. Кяризы.|Quduq ochildi. Shu yerdan sezib turibman. Pastga ketgan hamma narsa kutyapti. Kontrabandachilar ini, Ravshan. Korizlar.`] : null)
  ];
  const STEWARD = [['', `On your way out a Divan steward presses a wax seal into your palm. "The Ark receives yodchi today. Tilla-bek wants a look at the man who stood at his auction."|На выходе распорядитель Дивана вкладывает тебе в ладонь восковую печать. «Сегодня Арк принимает ёдчи. Тилла-бек желает взглянуть на человека, что стоял у него на торгах».|Chiqishda Devon xizmatchisi kaftingga mum muhr qo'yadi. «Bugun Ark yodchilarni qabul qiladi. Tilla-bek uning savdosida turgan odamga bir nazar solmoqchi».`]];
  function progress() {
    if (!R().world) return;
    try { flagKeys(); } catch (e) { console.error('[story] keys', e); }
    // two of three Act I threads: the Well opens
    if (!R().at.m1armed && moon() === 0 && ACT1_THREADS.filter(done).length >= 2) {
      R().at.m1armed = 1; save();
      queue(() => quiet() && inWorld() && !W2.busy, () => scene(done2 => play(M1_LINES, done2)), 'm1');
    }
    refreshObjective();
  }
  STORY.progress = progress;
  // the objective line: two or three goals of this moment; marks on the map for each
  function goals() {
    const out = [];
    if (R().at.m1armed && moon() === 0) out.push(BY.r_den);
    for (const b of BEATS) {
      if (b.act === 0 || !available(b)) continue;
      if (b.type === 'rest' && b.id !== 'r_plane' && b.id !== 'r_den') continue;   // rests come by themselves; they are not goals
      if (!out.includes(b)) out.push(b);
    }
    return out;
  }
  STORY.goals = () => goals().map(b => b.id);
  function refreshObjective() {
    const s = S2(); if (!s) return;
    const g = goals();
    for (const k in s.marks) if (k.startsWith('st:')) delete s.marks[k];
    for (const b of g.slice(0, 4)) { const h = hostOf(b); if (h && h[0]) s.marks['st:' + b.id] = { region: h[0], x: h[1], y: 0, kind: 'quest', label: nameOf(b) }; }
    const names = g.slice(0, 3).map(nameOf).filter(Boolean);
    s.obj = names.length ? join3(names) : null;
    save();
  }

  /* ================================================================ the milestone warning (GDD ch.4) */
  const WARN = `If you go on, some business in the city may not wait for you.|Если продолжишь, часть дел в городе может не дождаться тебя.|Davom etsang, shahardagi ba'zi ishlar seni kutib turmasligi mumkin.`;
  const GO_ON = `Go on|Идти дальше|Davom etish`, NOT_YET = `Not yet|Ещё не время|Hali emas`;
  // what will close: the open chapters that do not survive this moon
  const willClose = to => BEATS.filter(b => available(b) && b.type !== 'rest' && ((to >= 1 && b.thread === 'rabat' && !done('a1_rabat')) || (to >= 2 && b.act === 1) || (to >= 3 && b.act === 2)));
  function warn(to, yes, no) {
    const list = willClose(to).map(nameOf).filter(Boolean);
    const title = list.length ? join3([WARN, join3(list, ', ')], ' ') : WARN;
    scene(fin => ask(title, [{ label: GO_ON, id: 'go' }, { label: NOT_YET, id: 'no' }], o => { fin(); if (o.id === 'go') yes(); else if (no) no(); }));
  }
  STORY.warn = warn;
  const MOON = [null,
    `The moon wanes. The Singers tighten the tithe; the Divan closes streets.|Луна убывает. Певцы ужесточают сбор, Диван перекрывает улицы.|Oy kamaymoqda. Xonandalar ushrni kuchaytirmoqda, Devon ko'chalarni to'smoqda.`,
    `The moon is a thin sickle. Up above, the city is cracking.|От луны остался тонкий серп. Наверху город трескается.|Oydan ingichka o'roq qoldi. Tepada shahar yorilmoqda.`,
    `The new moon. The song in you is close to its last verse.|Новолуние. Песня в тебе близка к последнему куплету.|Yangi oy. Ichingdagi qo'shiq so'nggi bandiga yaqin.`];
  W2.hooks.moon.push(m => { if (MOON[m]) toast(t(MOON[m]), '#c9b4ff'); progress(); });
  // milestones on the way: the den (moon 1), the nest (moon 3); the Heart (moon 2) waits at its people
  {
    const go0 = W2.go;
    W2.go = (region, entry, o) => {
      o = o || {};
      if (!o.force && !o._warned && R().world && W2.S()) {
        const m = moon();
        if (o.inside === 'karez_den' && R().at.m1armed && m === 0) { if (busy) return false; warn(1, () => { W2.advanceMoon(); go0(region, entry, Object.assign({}, o, { _warned: true })); }); return false; }
        if (region === 'nest' && m < 3 && available(BY.b_nightmare)) { if (busy) return false; warn(3, () => { W2.advanceMoon(); go0(region, entry, Object.assign({}, o, { _warned: true })); }); return false; }
      }
      return go0(region, entry, o);
    };
  }

  /* ================================================================ who may pass where, and when (exits of 84/85a) */
  const NOT_YET_LAIR = `Not yet. Whatever waits behind this door has no reason to open it for you.|Рано. Тому, кто ждёт за этой дверью, пока незачем тебе открывать.|Hali erta. Bu eshik ortida kutayotgan kimsaga senga eshik ochishga hozircha sabab yo'q.`;
  const SILENT = `Silence behind the door now. There is no one left to fight there.|За дверью теперь тишина. Сражаться там больше не с кем.|Eshik ortida endi sukunat. U yerda jang qiladigan hech kim qolmadi.`;
  const GONE = `That door belongs to a city that is no more.|Эта дверь — из города, которого больше нет.|Bu eshik endi yo'q shaharniki.`;
  const ex = (r, id) => (W2.regions[r] && W2.regions[r].exits[id]) || {};
  for (const rid in W2.regions) for (const eid in W2.regions[rid].exits) {
    const e = W2.regions[rid].exits[eid], to = e.to && e.to[0], beat = to && ARENA_BEAT[to];
    if (beat) e.when = () => (done(beat) ? SILENT : closed(BY[beat]) ? GONE : !available(BY[beat]) ? NOT_YET_LAIR : null);
  }
  { const e = ex('tail', 'rabat'), txt = e.closed; e.when = () => (!done('a1_tail') ? txt : null); }
  { const e = ex('potters', 'west'), txt = e.closed; e.when = () => (!done('a1_rabat') ? txt : null); }
  ex('karez', 'deeper').when = () => (!done('a2_karez') ? `The sluice is chained. The smugglers say it opens when the water turns bitter.|Шлюз на цепи. Контрабандисты говорят: откроется, когда вода загорчит.|Shlyuz zanjirband. Kontrabandachilar aytadi: suv achchiq tortganda ochiladi.` : null);
  ex('cloister', 'depth').when = () => (!done('a2_old') ? `The shaft to the Well is sealed with white wax. Not this way, not yet.|Шахта к Колодцу запечатана белым воском. Не здесь и не сейчас.|Quduqqa tushadigan shaxta oq mum bilan muhrlangan. Bu yerdan emas, hozir emas.` : null);
  ex('old', 'depth').when = () => (!done('a2_old') ? `The masked ones guard the shaft. "Not yet," they say without a word.|Шахту стерегут люди в масках. «Рано», — говорят они без слов.|Shaxtani niqobli odamlar qo'riqlaydi. «Hali erta», deyishadi ular so'zsiz.` : null);
  ex('well', 'heart').when = () => (!(done('b_seven') && done('b_shrine')) ? `The way to the Heart is a throat of black water. It isn't ready to swallow you yet.|Путь к Сердцу — горло чёрной воды. Оно ещё не готово тебя проглотить.|Yurakka yo'l — qora suvdan iborat bo'g'iz. U seni yutishga hali tayyor emas.` : moon() >= 2 ? GONE : null);
  ex('dream', 'house').when = () => (!(done('a3_wedding') && done('a3_sand')) ? `The door of your house won't open. The dream wants to show you more first.|Дверь твоего дома не открывается. Сон хочет сперва показать тебе больше.|Uyingning eshigi ochilmaydi. Tush avval senga ko'proq narsa ko'rsatmoqchi.` : null);
  // after the Heart the waking city is behind: chaikhanas of the dream and of the city do not connect
  {
    const cl0 = W2.chaiList;
    const dreamT = id => { const c = W2.regions[id]; return !!(c && c.tier === 'dream'); };
    W2.chaiList = () => { const here = W2.active || (S2() && S2().cur.region); const d = dreamT(here); return cl0().filter(c => dreamT(c.region) === d); };
  }

  /* ================================================================ difficulty: by the moon and the act, not by the hero */
  W2.stageOf = def => {
    const base = typeof def.stage === 'function' ? def.stage() : (def.stage || 1);
    const s = S2(); if (!s) return base;
    if (def.arena) {
      // Act I lairs come in any order: the more of the act is behind him, the harder the lair (the linear
      // order gives the stage-3 numbers back: Kampir 1.74, the Hound ~2.94 (was 3.04), the Choir ~3.74 (was 3.91))
      if (def.act === 1) { const k = ACT1_ALL.filter(id => id !== def.beat && done(id)).length; return Math.min(4.1, 1.34 + 0.4 * k); }
      return base;
    }
    const act = def.act || 1;
    if (act === 1) {
      const p = ACT1_ALL.filter(done).length;                // the moon of Act I: each chapter hardens the streets
      const a1 = base + 0.35 * p;
      return moon() >= 1 ? Math.max(a1, def.stage2 || base + 2.45) : a1;
    }
    if (def.id === 'mines') return Math.max(base, frontier() - 0.6);
    return base;
  };
  // the stage of the furthest chapter reached (for optional regions of Act II)
  const STAGE_OF = { a2_karez: 4.35, a2_streets: 4.78, b_cistern: 5.22, a2_old: 5.65, a2_well: 6.09, b_seven: 6.52, a2_spine: 6.96, b_shrine: 7.39, a2_heart: 7.83 };
  function frontier() { let v = 3.9; for (const id in STAGE_OF) if (done(id)) v = Math.max(v, STAGE_OF[id]); return v; }
  W2.regions.karez.stage2 = 4.35;
  // after each milestone the old streets get the new act's ambushes (GDD ch.18): more of the night,
  // and elites among them, in the regions of Act I
  {
    const ns0 = W2.nightSpawns;
    if (ns0) W2.nightSpawns = function (L, plan, killed) {
      const d = W2.regions[plan && plan.region], m = moon();
      if (!d || !d.night || (d.act || 1) !== 1 || m < 1) return ns0.apply(this, arguments);
      const n0 = d.night, nn = Object.assign({}, n0, { extra: (n0.extra || 4) + 2 * Math.min(2, m), elite: true });
      d.night = nn;
      try { return ns0.apply(this, arguments); } finally { d.night = n0; }
    };
  }
  W2.actOf = def => (def.arena ? def.act : Math.min(3, moon() + 1));
  STORY.stageNow = () => { const d = W2.regions[W2.active]; return d ? W2.stageOf(d) : null; };

  /* ================================================================ arriving in a region: the chapter's scenes */
  const regMemory = def => (def.memory ? { id: 'w:' + def.id, memory: def.memory, people: [] } : null);
  W2.onEnter('*', (def, o) => {
    if (!def || def.arena) return;
    const L = o.level, spots = (L && L.w2 && L.w2.spots) || {};
    const id = LAND_AT[def.id], b = id && BY[id], Ld = id && LANDS[id];
    if (Ld && (available(b) || done(id))) {
      try { if (Ld.memory) placeMemory(Ld, L, spots.mem || null); } catch (e) { console.error('[story] memory', e); }
    } else if (def.memory) {
      try { placeMemory(regMemory(def), L, spots.mem || null); } catch (e) { console.error('[story] memory', e); }
    }
    if (Ld && available(b)) {
      landScenes(Ld, spots.mid ? spots.mid.x : L.pw * 0.45);
      const at = spots.story || (L.w2.entries.start && { x: L.pw * 0.8, y: L.groundBelow(L.pw * 0.8, 40, L.ph) || L.spawn.y });
      if (Ld.people && Ld.people.length && Ld.exit && at) {
        const ms = b.milestone;
        const opts = {
          any: true,
          after: group => { for (const g of group) { g.talking = false; } landFinished(id, group); }
        };
        if (ms) opts.when = (resume, decline) => {
          if (R().at['warnok:' + id]) return true;
          if (busy) return false;
          warn(ms, () => { R().at['warnok:' + id] = 1; save(); resume(); }, decline);
          return false;
        };
        spawnPeopleAt(Ld, at, opts);
      } else if (!Ld.exit) queue(() => stageT() > 400, () => landFinished(id, []));
    }
    progress();
  });
  // the people's scene has played: the chapter is done; some chapters change the world at once
  function landFinished(id, group) {
    if (done(id)) return;
    const after = () => { markDone(id); for (const g of group || []) { g.dead = true; } };
    if (id === 'a1_bazaar' && !W2.hasKey('divan_seal')) { scene(fin => play(STEWARD, () => { W2.giveKey('divan_seal'); fin(); }), after); return; }
    if (id === 'a2_heart') {
      after();
      W2.advanceMoon();
      setTimeout(() => W2.go('dream', 'start', { force: true, speed: 0.012 }), 200);
      return;
    }
    after();
  }
  STORY.landFinished = landFinished;
  // boss record (every lair) and the chapter of a boss with no scene after it
  G.Events.on('bossDefeated', boss => {
    if (!inWorld()) return;
    const id = boss && boss.def && boss.def.id, B = Object.values(BOSSES).find(x => (x.engineId || x.id) === id);
    const s = S2(); s.bosses = s.bosses || {}; s.bosses[B ? B.id : id] = 1; save();
    if (B && !B.post) G.STORY_BOSS_DONE(B.id);
  });

  /* ================================================================ chaikhanas: the rest's people (Rustam, Farrukh) and the hook */
  const FORGE_PRICE = 60;
  const FORGE = [['farrukh', `A Sign of the Well? Wax, a seal-ring and a steady hand. Mine shakes, so it comes out just like the real thing. Sixty tilla.|Знак Колодца? Воск, перстень-печатка и твёрдая рука. У меня рука дрожит — потому и выходит в точности как настоящий. Шестьдесят тилла.|Quduq belgisimi? Mum, muhr-uzuk va qattiq qo'l. Meniki qaltiraydi — shuning uchun xuddi haqiqiysidek chiqadi. Oltmish tilla.`]];
  const needSign = () => moon() < 2 && !W2.can('well_sign');
  function offerForgery(fin) {
    play(FORGE, () => ask('', [{ label: `"Make me one."|«Сделай мне такой.»|«Menga ham bittasini yasab ber.»`, id: 'buy', price: FORGE_PRICE }, { label: `"Not today."|«Не сегодня.»|«Bugun emas.»`, id: 'no' }], o => { if (o.id === 'buy') W2.giveKey('forged_sign'); fin(); }));
  }
  STORY.offerForgery = offerForgery;
  ON_STAGE.push(plan => {
    if (!plan || !plan.world || plan.type !== 'rest' || !R().world) return;
    const ch = W2.chaiDef(plan.chai); if (!ch) return;
    const Rs = curRest(), w = G.world;
    const ak = w.interactables.find(o => o.art === 'aksakal');
    if (ak && Rs && Rs.rustam) {
      ak.prompt = t(Rs.rustamPrompt || `Sit with Rustam-aka|Сесть рядом с Рустамом-ака|Rustam aka yoniga o'tirish`);
      ak.onUse = () => {
        if (busy) return true;
        scene(fin => Rs.rustam(() => { if (ch.host && ch.host.talk && !W2.hasKey('hook')) ch.host.talk(fin); else fin(); }), progress);
        return true;
      };
    }
    // Farrukh's merchant: his rest's talk when there is one; in Act I he also forges the Sign of the Well
    const m = w.interactables.find(o => o.art === 'merchant');
    if (m) {
      const u0 = m.onUse, i0 = m.interact, p0 = m.prompt;
      m.interact = true;
      if (!(Rs && Rs.farrukh)) m.prompt = t(`Talk to Farrukh|Говорить с Фаррухом|Farrux bilan gaplashish`);
      m.onUse = function (p, self) {
        if (busy || R().ended) return true;
        if (needSign()) {
          const opts = [];
          if (Rs && Rs.farrukh) opts.push({ label: `— What's new, Farrukh?|— Что нового, Фаррух?|— Nima gaplar, Farrux?`, id: 'talk' });
          opts.push({ label: `— Can you make me a Sign of the Well?|— Сможешь сделать мне Знак Колодца?|— Menga Quduq belgisini yasab bera olasanmi?`, id: 'sign' });
          if (!(Rs && Rs.farrukh) && i0 !== false && u0) opts.push({ label: `— Show me your goods.|— Покажи товар.|— Molingni ko'rsat.`, id: 'trade' });
          opts.push({ label: `"Another time."|«В другой раз.»|«Boshqa safar.»`, id: 'no' });
          scene(fin => ask('', opts, o => {
            if (o.id === 'talk') { Rs.farrukh(() => { fin(); progress(); }); return; }
            if (o.id === 'sign') { offerForgery(fin); return; }
            fin();
            if (o.id === 'trade') setTimeout(() => u0.call(m, p, self), 30);
          }));
          return true;
        }
        if (Rs && Rs.farrukh) { scene(Rs.farrukh, progress); return true; }
        return u0 ? u0.apply(this, arguments) : true;
      };
      void p0;
    }
  });
  // Turab's voice comes back wherever he next sits with him: the auction (any thread order) is enough,
  // the Ark's chaikhana is no longer the only place (in the linear order it was the next rest after the Bazaar)
  {
    const op0 = G.Game.offerPerk;
    G.Game.offerPerk = function (obj) {
      const f = F(), Rs = curRest();
      if (inWorld() && W2.inside && obj && !obj._yod && !busy && !R().ended && (f.voice === 'bought' || f.voice === 'stolen') && !f.turabSpoke &&
          RESTS.r_ark && RESTS.r_ark.turab && !(Rs && Rs.id === 'r_ark') && moon() < 2) {
        const self = this, args = arguments;
        obj._yod = 1;
        scene(done => RESTS.r_ark.turab(done), () => { progress(); op0.apply(self, args); });
        return;
      }
      return op0.apply(this, arguments);
    };
  }
  // the lullaby on rest (the dastarkhan), once per rest, as in the linear chaikhanas
  W2.hooks.rest.push(ch => {
    const id = REST_AT[ch.id], Rs = id && G.STORY_REST() === id && RESTS[id];
    if (!Rs || !Rs.lullaby) return;
    const kl = sceneKey('lullaby', id);
    if (R().at[kl] || !sadoAwake()) return;
    queue(() => quiet(), () => { if (R().at[kl]) return; R().at[kl] = 1; save(); scene(Rs.lullaby); }, 'lull');
  });

  /* ================================================================ entering the story at an old plan entry (new journey, old saves, ?stage=N) */
  const VICTORY = G.PLAN.findIndex(p => p.type === 'victory');
  function ensureWorld() {
    const r = R();
    if (r.world) return r.world;
    r.world = W2.blank();
    for (const id in W2.regions) r.world.seeds[id] = W2.regions[id].seed || 1;
    for (const f of W2.hooks.newWorld || []) { try { f(r.world); } catch (e) { console.error(e); } }
    r.f.sado = r.f.sado || 1;
    save();
    return r.world;
  }
  function enterAt(i) {
    const s = ensureWorld();
    const r = R();
    // every chapter before i is behind him (the linear order); keys and moon follow
    for (let j = 0; j < i && j < BEATS.length; j++) r.at['done:' + BEATS[j].id] = 1;
    if (i >= 13) r.at.m1armed = 1;
    const m = i >= 31 ? 3 : i >= 26 ? 2 : i >= 13 ? 1 : 0;
    if ((s.moon || 0) < m) s.moon = m;
    s.keys.light = 1;
    if (i > 2) s.keys.hook = 1;
    if (i > 7 || done('a1_bazaar')) s.keys.divan_seal = 1;
    if (i > 10) s.keys.well_sign = s.keys.well_sign || (s.keys.forged_sign ? 0 : 1);
    if (done('b_cistern')) s.keys.water = 1;
    if (done('a2_spine')) s.keys.breath = 1;
    const b = BEATS[i];
    if (b.type === 'rest') { const c = W2.chaiDef(b.chai); s.cur = { region: c.region, entry: 'chai:' + c.id, inside: c.id }; s.chai[c.id] = 1; s.bench = { region: c.region, chai: c.id }; }
    else if (b.type === 'boss') s.cur = { region: b.arena, entry: 'start', inside: null };
    else s.cur = { region: b.region, entry: 'start', inside: null };
    if (i === 2) { s.chai.tail_plane = 1; s.bench = { region: 'tail', chai: 'tail_plane' }; }
    save();
    try { flagKeys(); } catch (e) { /* ignore */ }
    refreshObjective();
  }
  STORY.enterAt = enterAt;
  STORY.isLegacyIndex = i => typeof i === 'number' && i >= 2 && i < VICTORY;
  {
    const ls1 = G.Game.loadStage;
    G.Game.loadStage = function (i, retry) {
      if (STORY.isLegacyIndex(i)) {
        try { enterAt(i); }
        catch (e) {
          console.error('[story] enter', e);
          toast(t(`This old save can't be carried into the open city. Start a new journey.|Это старое сохранение не переносится в открытый город. Начни новый поход.|Bu eski saqlanmani ochiq shaharga o'tkazib bo'lmaydi. Yangi safarni boshla.`), '#ff8a7a');
          return ls1.call(this, 0, retry);
        }
        const s = S2();
        return ls1.call(this, s.cur.inside ? W2.WRI : (W2.regions[s.cur.region] && W2.regions[s.cur.region].arena ? W2.WBI : W2.WPI), retry);
      }
      return ls1.apply(this, arguments);
    };
  }
  // a world started directly (?world, tests): the story stands right after the prologue
  W2.hooks.newWorld.push(s => {
    const r = R();
    r.at['done:p_tail'] = 1; r.at['done:b_vault'] = 1;
    s.obj = null;
  });
  W2.story = STORY;
  ON_STAGE.push(plan => { if (plan && plan.world && R().world) { try { progress(); } catch (e) { console.error(e); } } });
  // tests: where the story stands
  STORY.debug = () => ({ moon: moon(), done: BEATS.filter(b => done(b.id)).map(b => b.id), goals: STORY.goals(), keys: Object.keys((S2() || {}).keys || {}), at: W2.active, inside: W2.inside, stage: STORY.stageNow() });
}
