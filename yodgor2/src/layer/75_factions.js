/* =====================================================================
   Stage 6 — the factions (GDD ch. 6, 19, 20): reputation, the double play,
   the quest journal, and the shared tools the three arcs are written with.
     76_faction_singers.js   the Singers of the Well (Shirin)       s1..s6
     77_faction_divan.js     the Divan (Tilla-bek)                  d1..d6
     78_faction_remember.js  Those Who Remember (Oydin)             r1..r6
     79_economy_crime.js     merchants, haggling, stealth, crime
     65s/65t/65u             the three faction-final bosses
   Reputation: one number per faction, −100…+100, shown only as a threshold
     (Enemy ≤ −50 · Distrust −49…−10 · Stranger · One of us ≥ +20 · Trusted ≥ +60).
     It is the story's own R().rep scaled by 6, so the story's rep(k, ±1..3) calls
     and the Heart's choice of plan (whose(), topRep()) read the same standing.
     FAC.add(k, n) changes it on the −100…100 scale.
   State: R().f6 (saved with the journey, checkpoints and slots).
   W2 (80+) is not initialised yet when this file runs: world work goes into
   s6init(fn), run once right after the whole layer has loaded.
   ===================================================================== */
const S6_INIT = [];
const s6init = f => S6_INIT.push(f);
Promise.resolve().then(() => { for (const f of S6_INIT) { try { f(); } catch (e) { console.error('[s6] init', e); } } });
const FAC = G.FAC = { Q: {}, NPC: {}, talk: {}, props: [] };
{
  /* ================================================================ state */
  const F6 = FAC.S = () => {
    const r = R();
    if (!r.f6 || typeof r.f6 !== 'object') r.f6 = {};
    const s = r.f6;
    const want = { q: {}, susp: { singers: 0, divan: 0, remember: 0 }, spy: {}, bounty: {}, merch: {}, jr: [], n: {}, picks: 0, crimes: 0 };
    for (const k in want) if (s[k] == null || typeof s[k] !== typeof want[k]) s[k] = want[k];
    return s;
  };
  FAC.flag = (k, v) => { const n = F6().n; if (v === undefined) return n[k]; n[k] = v; save(); return v; };
  const W2x = () => G.WORLD2;
  const moon = () => { const W = W2x(); return W && W.moonPhase ? W.moonPhase() : 0; };
  FAC.act = () => Math.min(3, moon() + 1);

  /* ================================================================ three-language helpers */
  // glue three-language strings part by part: cat3('a|b|c', ' ', 'd|e|f') -> 'a d|b e|c f'
  const cat3 = FAC.cat3 = (...xs) => {
    const ps = xs.filter(x => x != null && x !== '').map(x => String(x).split('|'));
    return [0, 1, 2].map(i => ps.map(p => (p.length === 3 ? p[i] : p[0])).join('')).join('|');
  };
  const fmt3 = FAC.fmt3 = (s, o) => String(s).split('|').map((p, i) => p.replace(/\{(\w+)\}/g, (m, k) => { const v = o[k]; if (v == null) return m; const vs = String(v).split('|'); return vs.length === 3 ? vs[i] : vs[0]; })).join('|');

  /* ================================================================ reputation */
  const BIG = FAC.BIG = ['singers', 'divan', 'remember'];
  const ALL = FAC.ALL = ['singers', 'divan', 'remember', 'tail', 'rabat'];
  const standing = FAC.standing = k => clamp(Math.round(((R().rep || {})[k] || 0) * 6), -100, 100);
  const tierOf = FAC.tier = k => { const v = standing(k); return v <= -50 ? 'enemy' : v <= -10 ? 'distrust' : v < 20 ? 'stranger' : v < 60 ? 'own' : 'trusted'; };
  const TIER_RANK = { enemy: 0, distrust: 1, stranger: 2, own: 3, trusted: 4 };
  FAC.atLeast = (k, tier) => TIER_RANK[tierOf(k)] >= TIER_RANK[tier];
  FAC.TIER_NAME = {
    enemy: `Enemy|Враг|Dushman`, distrust: `Distrust|Недоверие|Ishonchsizlik`, stranger: `Stranger|Чужой|Begona`,
    own: `One of us|Свой|O'zimizdan`, trusted: `Trusted|Доверенный|Ishonchli`
  };
  const TIER_MSG = {
    enemy: `{who}: to them you are an enemy now.|{who}: для них ты теперь враг.|{who}: endi ular uchun dushmansan.`,
    distrust: `{who}: they no longer trust you.|{who}: тебе больше не доверяют.|{who}: endi senga ishonishmaydi.`,
    stranger: `{who}: you're a stranger to them again.|{who}: для них ты снова чужой.|{who}: ular uchun yana begonasan.`,
    own: `{who}: they count you as one of their own.|{who}: теперь ты для них свой.|{who}: endi seni o'zlaridan deb bilishadi.`,
    trusted: `{who}: they trust you with what they hide from others.|{who}: тебе доверяют то, что прячут от чужих.|{who}: begonalardan yashirganini senga ishonib aytishadi.`
  };
  const TIER_COL = { enemy: '#ff8a7a', distrust: '#d9a0a0', stranger: '#d8d0c0', own: '#f2d27a', trusted: '#ffe7a6' };
  FAC.TIER_COL = TIER_COL;
  const LIS = [];
  FAC.onTier = fn => LIS.push(fn);
  // the story's rep() keeps working; a crossed threshold gets its own line
  {
    const rep0 = rep;
    rep = function (k, n, quiet) {
      const before = REP_NAME[k] ? tierOf(k) : null;
      rep0(k, n, quiet);
      if (!before) return;
      const after = tierOf(k);
      if (after !== before) {
        setTimeout(() => toast(t(fmt3(TIER_MSG[after], { who: REP_NAME[k] })), TIER_COL[after]), 700);
        for (const f of LIS) { try { f(k, after, before); } catch (e) { console.error('[s6] tier', e); } }
      }
    };
  }
  // n on the −100…100 scale; the story's units are a sixth of that
  FAC.add = (k, n, quiet) => {
    if (!n) return;
    const room = n > 0 ? 100 - standing(k) : -100 - standing(k);
    const m = n > 0 ? Math.min(n, Math.max(0, room)) : Math.max(n, Math.min(0, room));
    rep(k, (m || n * 0.001) / 6, quiet);
  };
  // price, by the standing with the merchant's people (GDD ch. 6 and 15)
  FAC.priceMul = k => (!k ? 1 : { enemy: 1.3, distrust: 1.3, stranger: 1, own: 0.85, trusted: 0.7 }[tierOf(k)]);

  /* ================================================================ companions: reactions by their values (GDD ch. 7) */
  const inParty = FAC.inParty = id => { try { return !!(G.PARTY && G.PARTY.has(id) && G.PARTY.active().includes(id)); } catch (e) { return false; } };
  const joined = id => { try { return !!(G.PARTY && G.PARTY.has(id)); } catch (e) { return false; } };
  // approval changes for whoever has joined (they hear of it); returns nothing
  FAC.react = (deltas, why) => { for (const id in deltas) if (joined(id)) { try { G.PARTY.approval(id, deltas[id], why || null); } catch (e) { /* ignore */ } } };
  // a line from a companion who walks with him now (or null): use inside play([...])
  FAC.cl = (id, text) => () => (inParty(id) ? [id, text] : null);
  FAC.anyComp = () => ['alp', 'nargiza', 'surayyo'].filter(inParty);

  /* ================================================================ checks: [Strength 7] — failure is also a story */
  const CHECK_NAME = {
    str: `Strength|Сила|Kuch`, agi: `Agility|Ловкость|Chaqqonlik`, end: `Endurance|Стойкость|Chidamlilik`, mem: `Memory|Память|Xotira`,
    collection: `Collection|Взыскание|Hisob-kitob`, backbone: `Backbone|Хребет|Bardosh`, song: `Forbidden Song|Запретная песнь|Yashirin navo`
  };
  FAC.check = (kind, need) => { try { return G.CH.check(kind, need); } catch (e) { return { ok: false, have: 0, need }; } };
  // an option whose label carries its requirement: chk('str', 7, `"Move."|«Подвинься.»|«Suril.»`, {id:'x'}) -> o.ok on pick
  FAC.chk = (kind, need, label, data, how) => {
    const c = FAC.check(kind, need);
    const tag = cat3('[', CHECK_NAME[kind], how ? cat3(': ', how) : '', ' ' + need + '] ');
    return Object.assign({ label: cat3(tag, label), ok: c.ok, chk: c }, data || {});
  };
  // memory craft in dialogue: labels say what he does (GDD ch. 11), the cost is read from the meaning
  FAC.CRAFT = { taste: `[Taste]|[Испить]|[Totib ko'rish]`, plant: `[Plant]|[Вселить]|[Joylash]`, take: `[Take]|[Взять]|[Olib qo'yish]`, burn: `[Burn]|[Сжечь]|[Yoqish]` };
  FAC.craft = (k, label, data) => Object.assign({ label: cat3(FAC.CRAFT[k], ' ', label) }, data || {});
  // tasting a thing or a place: a short scene of its past (GDD ch. 11). Free for objects; a living person pays a little of himself.
  FAC.taste = (lines, done, o) => {
    o = o || {};
    R().tastes = (R().tastes || 0) + 1; save();
    sfx('scroll');
    play([['', o.intro || `You press the wax to your lips. The world goes thin, and somebody else's minute rises through it.|Прижимаешь воск к губам. Мир истончается, и сквозь него поднимается чужая минута.|Mumni labingga bosasan. Dunyo yupqalashadi, uning ichidan birovning bir daqiqasi ko'tariladi.`]].concat(lines), () => {
      if (o.person) addVoid(3, `someone else's memory|чужая память|birovning xotirasi`);
      done && done();
    });
  };
  // planting into a person: +2 Hollowness, Nargiza minds it (GDD ch. 11, 22)
  FAC.plant = (why) => { addVoid(2, why || `a planted memory|вселённая память|joylangan xotira`); FAC.react({ nargiza: -10 }, 'plant'); };
  FAC.takeMem = (why) => { addVoid(4, why || `a taken memory|взятая память|olingan xotira`); FAC.react({ nargiza: -20, alp: -5 }, 'take'); };

  /* ================================================================ quests and the journal */
  const qs = FAC.q = id => F6().q[id] || { st: 'none' };
  FAC.isDone = id => qs(id).st === 'done';
  FAC.isActive = id => qs(id).st === 'active';
  FAC.br = id => qs(id).br || null;
  FAC.quest = (id, def) => { FAC.Q[id] = Object.assign({ id }, def); return FAC.Q[id]; };
  const note = (id, text) => { const s = F6(); s.jr.push({ id, t: text, d: (W2x() && W2x().S() && W2x().S().day) || 1 }); if (s.jr.length > 120) s.jr.splice(0, 40); };
  function markQ(id, region, spot) {
    const W = W2x(); if (!W || !W.mark) return;
    const Q = FAC.Q[id];
    if (region) W.mark('f6:' + id, region, spot || 'story', 0, 'quest', Q && Q.title); else W.unmark('f6:' + id);
  }
  // begin / move / finish. where = [region, spot] for the map mark
  FAC.begin = (id, text, where) => {
    const s = F6(); if (s.q[id] && s.q[id].st !== 'none') return FAC.stepTo(id, text, where);
    s.q[id] = { st: 'active', t: text, at: Date.now() };
    note(id, text); save();
    if (where) markQ(id, where[0], where[1]);
    const Q = FAC.Q[id];
    toast(t(cat3(`New in the journal: |Новое в журнале: |Jurnalda yangi: `, Q ? Q.title : '')), '#ffe7a6');
    sfx('scroll');
  };
  FAC.stepTo = (id, text, where) => {
    const s = F6(); const q = s.q[id] || (s.q[id] = { st: 'active' });
    q.t = text; note(id, text); save();
    if (where) markQ(id, where[0], where[1]); else if (where === null) markQ(id, null);
  };
  const LISTEN_DONE = [];
  FAC.onDone = fn => LISTEN_DONE.push(fn);
  FAC.finish = (id, br, text, o) => {
    o = o || {};
    const s = F6(); const q = s.q[id] || (s.q[id] = {});
    if (q.st === 'done') return;
    q.st = o.failed ? 'failed' : 'done'; q.br = br; q.t = text; q.day = (W2x() && W2x().S() && W2x().S().day) || 1;
    note(id, text); markQ(id, null);
    const Q = FAC.Q[id];
    // the double play: whatever one great faction gains, the others' watchers notice (GDD ch. 6)
    if (Q && BIG.includes(Q.fac) && !o.failed) for (const k of BIG) if (k !== Q.fac && arcStarted(k) && !arcClosed(k)) s.susp[k] = (s.susp[k] || 0) + (o.susp || 1);
    save();
    toast(t(cat3(o.failed ? `Ended badly: |Закончилось плохо: |Yomon tugadi: ` : `Done: |Завершено: |Yakunlandi: `, Q ? Q.title : '')), o.failed ? '#d9a0a0' : '#bff7c6');
    if (G.CH && G.CH.questXp && !o.noXp) { try { G.CH.questXp(o.xp || (Q && Q.n >= 5 ? 'major' : 'normal')); } catch (e) { /* ignore */ } }
    for (const f of LISTEN_DONE) { try { f(id, br); } catch (e) { console.error('[s6] done', e); } }
    try { FAC.refreshMarks && FAC.refreshMarks(); } catch (e) { /* ignore */ }
  };
  const arcStarted = FAC.arcStarted = k => ['s1', 'd1', 'r1'].some(id => FAC.Q[id] && FAC.Q[id].fac === k && qs(id).st === 'done');
  const arcClosed = FAC.arcClosed = k => !!F6().n['closed_' + k];
  FAC.closeArc = (k, why) => { F6().n['closed_' + k] = why || 1; save(); };
  FAC.susp = (k, n) => { const s = F6(); s.susp[k] = Math.max(0, (s.susp[k] || 0) + n); save(); };
  FAC.suspOf = k => F6().susp[k] || 0;

  /* ================================================================ people: npc(id, def, hours) with a schedule that can depend on the story */
  // sched: () => [{from, to, region, spot}] — read every time the world asks where they are
  FAC.npc = (id, def, sched) => {
    FAC.NPC[id] = { def, sched };
    s6init(() => {
      const W = W2x();
      W.npc(id, Object.assign({}, def, { talk(done, o) { const f = FAC.talk[id]; if (f) f(done, o); else play([['', def.idle || `…|…|…`]], done); } }));
      Object.defineProperty(W.npcs[id], 'sched', { configurable: true, get() { try { return (sched && sched()) || []; } catch (e) { return []; } }, set() { } });
    });
  };
  // spots the arcs need, added to the regions before they are first built
  const SPOTS = [];
  FAC.spot = (region, id, frac) => SPOTS.push([region, id, frac]);
  s6init(() => { const W = W2x(); for (const [r, id, frac] of SPOTS) { const d = W.regions[r]; if (d && !d.objects.some(o => o.kind === 'spot' && o.id === id)) d.objects.push({ kind: 'spot', id, at: { frac } }); } });
  // things to use at a spot when the story wants them: prop(region, spot, {art, prompt, when(), use(done, it), dx})
  FAC.prop = (region, spot, o) => FAC.props.push(Object.assign({ region, spot }, o));
  s6init(() => {
    W2x().onEnter('*', (def, info) => {
      const L = info.level, spots = (L && L.w2 && L.w2.spots) || {};
      for (const pr of FAC.props) {
        if (pr.region !== def.id) continue;
        try {
          if (pr.when && !pr.when()) continue;
          const at = spots[pr.spot] || (L.w2.entries && L.w2.entries[pr.spot]);
          if (!at) { console.warn('[s6] no spot', pr.region, pr.spot); continue; }
          const it = new G.Interactable(at.x + (pr.dx || 0), at.y, { art: pr.art || 'f6glint', w: pr.w || 16, h: pr.h || 18, prompt: t(typeof pr.prompt === 'function' ? pr.prompt() : pr.prompt) });
          it.layer = -1; it._f6 = pr.id || pr.spot;
          it.onUse = () => {
            if (busy || R().ended) return true;
            if (pr.when && !pr.when()) { it.dead = true; return true; }
            scene(done => pr.use(() => { if (pr.once !== false && pr.when && !pr.when()) it.dead = true; done(); }, it));
            return true;
          };
          G.world.add(it);
          if (pr.spawn) pr.spawn(it, at, L);
        } catch (e) { console.error('[s6] prop', e); }
      }
    });
  });
  // small object art for the arcs: a glint, a wax crate, a stack of debt books, a household chest
  const RR = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
  G.ObjArt.f6glint = (c, o) => {
    const k = (Math.sin((G.time || 0) * 3) + 1) / 2, x = Math.round(o.x), y = Math.round(o.y);
    RR(c, x - 1, y - 9 - k * 2, 2, 2, '#ffe7a6'); RR(c, x - 3, y - 8 - k * 2, 6, 1, 'rgba(255,231,166,0.5)'); RR(c, x, y - 11 - k * 2, 1, 6, 'rgba(255,231,166,0.5)');
  };
  G.ObjArt.f6glintFx = (c, o) => { try { G.Glow.add(o.x, o.y - 9, 14, '#ffe7a6', 0.4); } catch (e) { /* ignore */ } };
  G.ObjArt.f6crate = (c, o) => { const x = Math.round(o.x), y = Math.round(o.y); RR(c, x - 9, y - 10, 18, 10, '#5a3a22'); RR(c, x - 9, y - 10, 18, 1, '#8a5a32'); RR(c, x - 8, y - 6, 16, 1, '#3a2412'); RR(c, x - 6, y - 12, 12, 2, '#f2ead0'); RR(c, x - 3, y - 13, 2, 1, '#ffffff'); };
  G.ObjArt.f6books = (c, o) => { const x = Math.round(o.x), y = Math.round(o.y); const cols = ['#3a6ab0', '#e8e8f0', '#8a2a2a', '#3a6ab0']; cols.forEach((col, i) => { RR(c, x - 8 + (i & 1), y - 4 - i * 3, 16 - (i & 1) * 2, 3, col); RR(c, x - 8 + (i & 1), y - 4 - i * 3, 16 - (i & 1) * 2, 1, '#120c14'); }); };
  G.ObjArt.f6chest = (c, o) => { const x = Math.round(o.x), y = Math.round(o.y); RR(c, x - 8, y - 9, 16, 9, '#6a4220'); RR(c, x - 8, y - 9, 16, 2, '#8a5a32'); RR(c, x - 8, y - 5, 16, 1, '#3e2412'); RR(c, x - 1, y - 6, 2, 3, o.open ? '#3e2412' : '#e2b452'); };
  G.ObjArt.f6fire = (c, o) => { const x = Math.round(o.x), y = Math.round(o.y), f = (G.frame >> 2) & 3; RR(c, x - 6, y - 3, 12, 3, '#3a2412'); RR(c, x - 4, y - 7 - f, 8, 4 + f, '#ff8a2a'); RR(c, x - 2, y - 9 - f, 4, 3, '#ffe060'); };

  /* ================================================================ the double play: spies and the check at quest 4 (GDD ch. 6) */
  // each great faction keeps one watcher among the townsfolk of 85a; once exposed, they talk differently
  FAC.SPY = {
    singers: { npc: 'pilgrim', name: `Sobir the pilgrim|Паломник Собир|Ziyoratchi Sobir`, look: 'pilgrim' },
    divan: { npc: 'teaseller', name: `Botir the tea seller|Чайщик Ботир|Choyfurush Botir`, look: 'teaseller' },
    remember: { npc: 'lampboy', name: `Jasur the lamp boy|Жасур с лампой|Chiroqli Jasur`, look: 'lampboy' }
  };
  CAST.spy_singers = { name: FAC.SPY.singers.name, portrait: null };
  CAST.spy_divan = { name: FAC.SPY.divan.name, portrait: null };
  CAST.spy_remember = { name: FAC.SPY.remember.name, portrait: null };
  // caught? (rivals' quests done while this arc ran; or "one of us" with all three at once — that never stays hidden)
  FAC.caught = k => FAC.suspOf(k) >= 3 || BIG.every(x => FAC.atLeast(x, 'own'));
  // what the watcher saw: the most telling rival work, said plainly
  const SEEN = {
    s: `fetching and carrying for Ustoz Shirin's people|бегал по поручениям людей Устоз Ширин|Ustoz Shirinning odamlariga xizmat qilib yurganini`,
    d: `going in and out of the Divan's doors like a steward|входил в двери Дивана, как свой распорядитель|Devon eshiklaridan o'z xizmatchisidek kirib-chiqib yurganini`,
    r: `meeting masked people at the Bazaar after midnight|встречался с людьми в масках на Базаре после полуночи|yarim tundan keyin Bozorda niqobli odamlar bilan uchrashganini`
  };
  const seenBy = k => { const o = []; if (k !== 'singers' && arcStarted('singers')) o.push(SEEN.s); if (k !== 'divan' && arcStarted('divan')) o.push(SEEN.d); if (k !== 'remember' && arcStarted('remember')) o.push(SEEN.r); return o[0] || SEEN.r; };
  // the scene: the leader (lead = CAST key) and the watcher; then(out) with out = 'confess'|'blame'|'pay'|'silence'|'take'|'clear'
  FAC.suspicionCheck = (k, lead, then) => {
    const s = F6();
    if (!FAC.caught(k)) { s.spy[k] = s.spy[k] || 'unseen'; save(); then('clear'); return; }
    const spy = 'spy_' + k, comp = FAC.anyComp().filter(c => c !== 'surayyo')[0] || null;
    const LEAD_Q = {
      singers: `Sobir walked here from the Bazaar. Tell me he's lying, yodchi. I'd like him to be lying.|Собир пришёл сюда с Базара. Скажи, что он лжёт, ёдчи. Мне бы хотелось, чтобы он лгал.|Sobir bu yerga Bozordan keldi. Yolg'on gapiryapti, de, yodchi. Uning yolg'on gapirayotganini juda istardim.`,
      divan: `Botir pours tea for half the city, and remembers every cup. He remembers you. Explain, and do it charmingly.|Ботир наливает чай половине города и помнит каждую пиалу. Тебя он тоже помнит. Объяснись. И, будь добр, красиво.|Botir shaharning yarmiga choy quyadi va har bir piyolani eslab qoladi. Seni ham eslab qolgan. Tushuntir. Iloji bo'lsa, chiroyli qilib.`,
      remember: `The boy with the lamp sees everyone who goes down. He saw you go up, too. Up to them.|Мальчишка с лампой видит всех, кто спускается. И видел, как ты поднимался. К ним.|Chiroqli bola pastga tushganlarning hammasini ko'radi. Sening yuqoriga chiqqaningni ham ko'rgan. Ularning oldiga.`
    };
    play([
      ['', `Someone stands at the leader's elbow: a face you have walked past a hundred times without seeing it.|У локтя главного стоит человек — лицо, мимо которого ты проходил сотню раз и ни разу не видел.|Boshliqning yonida bir odam turibdi — yuz marta yonidan o'tib, bir marta ham ko'rmagan yuzing.`],
      [spy, tf(`I saw him {what}. More than once. I wrote down the days.|Я видел, как он {what}. Не раз. Дни записал.|Men uning {what} ko'rdim. Bir marta emas. Kunlarini yozib qo'yganman.`, { what: t(seenBy(k)) })],
      [lead, LEAD_Q[k]],
      () => (sadoAwake() ? ['sado', `He's got a list. Of course he does. Everyone in this city keeps a list.|У него список. Ну конечно. В этом городе у всех списки.|Uning ro'yxati bor. Albatta-da. Bu shaharda hammaning ro'yxati bor.`] : null)
    ], () => {
      const opts = [
        { id: 'confess', label: `"It's true. I worked for them as well. I needed to see all three hands."|«Правда. Я работал и на них. Мне надо было видеть все три руки.»|«To'g'ri. Ularga ham ishladim. Uchala qo'lni ham ko'rishim kerak edi.»` },
        comp ? { id: 'blame', label: fmt3(`"It was {who}, carrying news behind my back."|«Это {who} носил вести у меня за спиной.»|«Bu {who} — mening orqamdan xabar tashib yurgan.»`, { who: CAST[comp].name }) }
          : { id: 'blame', label: `"Ask Farrukh. He sells everybody to everybody. He sold them me."|«Спросите Фарруха. Он всех продаёт всем. Меня им тоже продал.»|«Farruxdan so'rang. U hammani hammaga sotadi. Meni ham ularga sotgan.»` },
        { id: 'pay', price: 120, label: `Later, alone, you count tilla into the watcher's palm. "You saw a tired yodchi. That's all."|Позже, наедине, ты отсчитываешь тилла в ладонь соглядатаю. «Ты видел усталого ёдчи. И всё.»|Keyinroq, yolg'iz qolganda, kuzatuvchining kaftiga tilla sanab berasan. «Sen charchagan yodchini ko'rding. Bor-yo'g'i shu.»` },
        FAC.chk('mem', 6, `Take from him what he saw. He will keep the rest of himself.|Забрать у него то, что он видел. Остальное при нём останется.|Undan ko'rganini olib qo'yish. Qolgani o'zida qoladi.`, { id: 'take' }, `Take|Взять|Olib qo'yish`),
        { id: 'silence', label: `Find him after dark, where nobody walks. A list needs someone to read it.|Найти его после темноты, там, где никто не ходит. Списку нужен тот, кто его прочтёт.|Qorong'i tushgach, hech kim yurmaydigan joyda uni topish. Ro'yxatni o'qiydigan odam bo'lishi kerak.` }
      ];
      ask(`The watcher waits. So does everyone else.|Соглядатай ждёт. И все остальные тоже.|Kuzatuvchi kutyapti. Qolganlar ham.`, opts, o => {
        s.spy[k] = o.id; s.susp[k] = 0; save();
        const after = lines => play(lines, () => then(o.id));
        if (o.id === 'confess') {
          FAC.add(k, -10); trust(1);
          after([[lead, {
            singers: `Then you're honest, and that's worse. Honest men don't stop. Go on serving the Well. We'll watch your hands.|Значит, ты честен, а это хуже. Честные не останавливаются. Служи Колодцу дальше. За руками твоими мы проследим.|Demak, halolsan, bu esa yomonroq. Halollar to'xtamaydi. Quduqqa xizmat qilishda davom et. Qo'llaringni kuzatib turamiz.`,
            divan: `How refreshing. A spy who admits it. I'll keep you — honesty is rare enough to be worth something. Just never twice.|Как свежо. Шпион, который сознаётся. Я тебя оставлю: честность нынче редкость, а редкость чего-то стоит. Только дважды не попадайся.|Qanday yangilik. Tan oladigan josus. Seni qoldiraman: halollik hozir kamyob, kamyob narsa esa qadrli. Faqat ikkinchi marta qo'lga tushma.`,
            remember: `You told the truth. That's all we ask of anyone. It's also why we'll never trust you with the night of the fire.|Ты сказал правду. Больше мы ни от кого и не требуем. Поэтому же день пожара тебе и не доверим.|Rostini aytding. Biz hech kimdan bundan ortiq narsa so'ramaymiz. Shuning uchun ham yong'in kunini senga ishonmaymiz.`
          }[k]]]);
        } else if (o.id === 'blame') {
          if (comp) { G.PARTY.approval(comp, -30, 'blamed'); FAC.flag('blamed_' + comp, k); }
          else FAC.flag('blamed_farrukh', k);
          after([
            comp ? [comp, { alp: `...Alp heard. Alp will remember.|...Алп слышал. Алп запомнит.|...Alp eshitdi. Alp eslab qoladi.`, nargiza: `Me? You... fine. Fine, yodchi. I'll sing along to that.|Я? Ты... ладно. Ладно, ёдчи. Подпою и этому.|Menmi? Sen... mayli. Mayli, yodchi. Bunga ham jo'r bo'laman.`, surayyo: `You'd hand me over for that? All right. Now I know what I weigh to you.|За такое ты меня сдашь? Хорошо. Теперь я знаю, сколько я для тебя вешу.|Shu uchun meni tutib berasanmi? Yaxshi. Endi senga qanchalik og'ir kelishimni bilaman.` }[comp]] : ['', `Farrukh isn't here to argue. That makes it easy, and it'll cost him later.|Фарруха тут нет, спорить некому. Это легко — а расплачиваться потом будет он.|Farrux bu yerda yo'q, bahslashadigan odam yo'q. Bu oson — to'lovni esa keyin u to'laydi.`],
            [lead, `So someone else carries the blame, and you carry on. That's how the city works. Go.|Значит, вину несёт другой, а ты несёшь дальше службу. Так город и устроен. Иди.|Demak, aybni boshqa ko'taradi, sen esa xizmatingni davom ettirasan. Shahar shunday qurilgan. Bor.`]
          ]);
          trust(-1);
        } else if (o.id === 'pay') {
          FAC.flag('paid_' + k, 1);
          after([[spy, `He counts the coins twice, like a yodchi. "I saw nothing. Today."|Он пересчитывает монеты дважды, как ёдчи. «Ничего я не видел. Сегодня.»|U tangalarni yodchidek ikki marta sanaydi. «Hech narsa ko'rmadim. Bugun.»`], [lead, `Then it was nothing. Next time, yodchi, be nothing more quietly.|Значит, ничего и не было. В следующий раз, ёдчи, будь «ничем» потише.|Demak, hech narsa bo'lmagan. Keyingi safar, yodchi, «hech narsa»ni sekinroq qil.`]]);
        } else if (o.id === 'take') {
          if (o.ok) {
            FAC.takeMem(`what the watcher saw|то, что видел соглядатай|kuzatuvchi ko'rgan narsa`);
            after([['', `You sing low, close to his ear. A week of his life comes out of him like a splinter. He blinks at his own list as if someone else wrote it.|Ты поёшь низко, у самого его уха. Неделя его жизни выходит, как заноза. Он смотрит на свой список, будто его писал кто-то другой.|Uning qulog'iga yaqin, past ovozda kuylaysan. Hayotining bir haftasi zirapchadek chiqib ketadi. U o'z ro'yxatiga xuddi birov yozgandek qaraydi.`], [lead, `...He doesn't remember. Then neither will I. Get out of my sight before I start thinking.|...Он не помнит. Тогда и я не буду. Уйди с глаз, пока я не начал думать.|...U eslamayapti. Unda men ham eslamayman. O'ylay boshlamasimdan ko'zimdan yo'qol.`]]);
          } else {
            s.spy[k] = 'confess'; FAC.add(k, -20); FAC.takeMem();
            after([['', `The song catches in your throat. He feels you reaching into him and screams. Everyone hears what you tried to do.|Песня застревает в горле. Он чувствует, как ты лезешь к нему внутрь, и кричит. Все слышат, что ты пытался сделать.|Qo'shiq tomog'ingda tiqilib qoladi. U ichiga qo'l suqayotganingni sezib, qichqiradi. Nima qilmoqchi bo'lganingni hamma eshitadi.`], [lead, `So it's true, and worse. Stay in our work, yodchi. Where we can see you.|Значит, правда — и даже хуже. Оставайся при деле, ёдчи. Там, где мы тебя видим.|Demak, rost, hatto undan ham yomon. Ishingda qol, yodchi. Biz ko'rib turadigan joyda.`]]);
          }
        } else {
          FAC.flag('killed_' + k, 1); FAC.crime && FAC.crime('murder', { fac: 'tail', quiet: true, why: 'spy' });
          addVoid(4, `a man who kept a list|человек, который вёл список|ro'yxat yuritgan odam`); trust(-2);
          FAC.react({ nargiza: -30, alp: -15, surayyo: -10 }, 'murder');
          after([
            ['', `That night you find him by the drain, counting his list by lamplight. It is quick. The list goes into the water. The lamp you leave burning.|Ночью ты находишь его у стока: он перечитывает список при лампе. Всё быстро. Список уходит в воду. Лампу ты оставляешь гореть.|Kechasi uni ariq bo'yida topasan: chiroq yorug'ida ro'yxatini qayta o'qiyapti. Hammasi tez bo'ladi. Ro'yxat suvga ketadi. Chiroqni yonib turgan holda qoldirasan.`],
            () => (sadoAwake() ? ['sado', `...You didn't even count. You always count.|...Ты даже не считал. Ты всегда считаешь.|...Hatto sanamading ham. Doim sanaysan-ku.`] : null),
            [lead, `My watcher didn't come back. I'll think the canal took him. Don't make me think anything else.|Мой человек не вернулся. Буду думать, что его забрал канал. Не заставляй меня думать иначе.|Odamim qaytmadi. Uni ariq olib ketgan deb o'ylayman. Boshqacha o'ylashga majbur qilma.`]
          ]);
        }
      });
    });
  };
  // the exposed watchers speak differently afterwards (characters return)
  s6init(() => {
    const W = W2x();
    for (const k of BIG) {
      const id = FAC.SPY[k].npc, n = W.npcs[id]; if (!n) continue;
      const talk0 = n.talk;
      n.talk = function (done, o) {
        const how = F6().spy[k];
        if (FAC.flag('killed_' + k)) { done(); return; }
        if (!how || how === 'unseen' || how === 'clear') return talk0.apply(this, arguments);
        const L = {
          confess: `"No hard feelings, yodchi. You told them yourself. I just wrote it down first."|«Без обид, ёдчи. Ты сам им всё сказал. Я просто записал раньше.»|«Xafa bo'lma, yodchi. O'zing hammasini aytding. Men shunchaki oldinroq yozib qo'ydim.»`,
          blame: `"Clever, that. Making someone else carry it. I've written that down too."|«Ловко ты. Чтобы нёс другой. Это я тоже записал.»|«Epchil ish. Boshqaga ko'tartirish. Buni ham yozib qo'ydim.»`,
          pay: `"Fine weather. I see nothing in it. I see nothing in anything, these days."|«Хорошая погода. Ничего в ней не вижу. Я теперь вообще ничего не вижу.»|«Havo yaxshi. Unda hech narsa ko'rmayapman. Hozir umuman hech narsa ko'rmayman.»`,
          take: `"Do I know you? I keep losing a week, somewhere around the time you came."|«Мы знакомы? Я всё теряю неделю — где-то как раз тогда, когда ты появился.»|«Tanishmidik? Bir haftani yo'qotib qo'yaveraman — sen paydo bo'lgan paytlarda.»`
        }[how];
        play([['', L || `…|…|…`]], done);
      };
    }
  });
  // a watcher who took money comes back once (quest 5 of that arc calls this)
  FAC.paidBack = (k, done) => {
    if (FAC.flag('paid_' + k) !== 1) { done(); return; }
    FAC.flag('paid_' + k, 2);
    play([['spy_' + k, `Tilla goes quickly, yodchi. Silence goes slower. Another sixty and it lasts till the new moon.|Тилла уходит быстро, ёдчи. Молчание — медленнее. Ещё шестьдесят, и его хватит до новолуния.|Tilla tez tugaydi, yodchi. Sukunat — sekinroq. Yana oltmish bersang, yangi oygacha yetadi.`]], () => ask('', [
      { id: 'pay', price: 60, label: `Pay him again.|Заплатить ещё раз.|Unga yana to'lash.` },
      { id: 'no', label: `"Go and tell them. See who pays you after that."|«Иди, расскажи. Посмотрим, кто тебе потом заплатит.»|«Bor, aytib ber. Keyin senga kim to'larkin, ko'ramiz.»` }
    ], o => { if (o.id === 'no') { FAC.add(k, -15); toast(t(`The watcher talked.|Соглядатай заговорил.|Kuzatuvchi gapirib qo'ydi.`), '#d9a0a0'); } done(); }));
  };

  /* ================================================================ standing in the world: doors, patrols, the Tail and the Rabat */
  // whose streets these are (GDD ch. 3 table: "owner")
  FAC.DISTRICT = { tail: 'tail', potters: 'tail', bazaar: 'divan', ark: 'divan', mines: 'divan', cloister: 'singers', tower: 'singers', well: 'singers', rabat: 'rabat', withers: 'rabat', old: 'remember', karez: null, streets: null, cistern: null, spine: null };
  const PATROL = { divan: ['yd_divan_merc', 'guard'], singers: ['yd_warden', 'torch_zealot'], remember: ['assassin', 'assassin'], tail: ['zindan_prisoner', 'yd_hollow'], rabat: ['guard', 'yd_divan_merc'] };
  const ENEMY_ON_STREET = `{who} watch you from the doorways. They won't wait for you to pass.|{who} следят за тобой из дверей. Ждать, пока ты пройдёшь, они не станут.|{who} eshiklardan seni kuzatyapti. O'tib ketishingni kutib o'tirishmaydi.`;
  FAC.wanted = k => !!(F6().bounty[k] && F6().bounty[k].n > 0);
  s6init(() => {
    const W = W2x();
    W.onEnter('*', (def, info) => {
      if (def.arena || def.tier === 'dream') return;
      const k = FAC.DISTRICT[def.id];
      const hostile = [];
      if (k && (tierOf(k) === 'enemy' || FAC.wanted(k))) hostile.push(k);
      // a great faction at war with you sends people beyond its own streets too, at night
      for (const b of BIG) if (b !== k && tierOf(b) === 'enemy' && W.isNight() && !hostile.includes(b) && Math.random() < 0.5) hostile.push(b);
      if (!hostile.length) return;
      const L = info.level, pl = G.world.player;
      const floor = ((L.spots && L.spots.floor) || []).filter(s2 => Math.abs((s2.x != null ? s2.x : s2.tx * G.TS) - pl.x) > 260);
      if (!floor.length) return;
      let n = 0;
      for (const f of hostile) {
        const pool = PATROL[f] || PATROL.divan;
        for (let i = 0; i < 2 + (W.isNight() ? 1 : 0); i++) {
          const sp = floor[(i * 7 + n * 13 + (def.id.length * 3)) % floor.length];
          const e = G.Enemies.spawn(pool[i % pool.length], sp.x != null ? sp.x : sp.tx * G.TS, sp.y != null ? sp.y : sp.ty * G.TS);
          if (e) { e._f6patrol = f; e._s6aware = 1; n++; }
        }
        setTimeout(() => toast(t(fmt3(ENEMY_ON_STREET, { who: REP_NAME[f] })), '#ff8a7a'), 1200);
      }
    });
    // the Singers' and the Divan's own doors stay shut to those they distrust (GDD ch. 6: "part of the doors closed")
    const SHUT = {
      singers: `A novice opens the hatch, looks at you, and closes it again. "Not for you. Not now."|Послушница открывает окошко, смотрит на тебя и закрывает. «Не для тебя. Не сейчас.»|Shogird ayol tuynukni ochib, senga qaraydi va yana yopadi. «Sen uchun emas. Hozir emas.»`,
      divan: `A steward on the other side of the cedar says, without opening: "The House of the Humo is not receiving you."|Распорядитель за кедровой дверью говорит, не открывая: «Дом Хумо тебя не принимает.»|Sadr eshik ortidagi xizmatchi ochmasdan aytadi: «Humo xonadoni sizni qabul qilmaydi.»`
    };
    const guard = (kind, k) => {
      const K = W.kinds[kind]; if (!K || !K.spawn) return;
      const sp0 = K.spawn;
      K.spawn = function (o, L) {
        const r = sp0.apply(this, arguments);
        try {
          const def = W.regions[W.active];
          const isK = kind !== 'house' || (o.od && ((o.od.key === 'well_sign' && k === 'singers') || (o.od.key === 'divan_seal' && k === 'divan')));
          if (isK) for (const it of G.world.interactables) {
            if (it.art !== 'w2door' || it._f6guard || !String(it._w2 || '').startsWith(def.id + ':door:' + o.od.id)) continue;
            it._f6guard = 1; const u0 = it.onUse;
            it.onUse = function () { if (!it.isOpen && TIER_RANK[tierOf(k)] <= TIER_RANK.distrust) { toast(t(SHUT[k]), '#d9a0a0'); sfx('denied'); return true; } return u0.apply(this, arguments); };
          }
        } catch (e) { console.error('[s6] door', e); }
        return r;
      };
    };
    guard('singersdoor', 'singers'); guard('divandoor', 'divan'); guard('house', 'singers'); guard('house', 'divan');
  });
  // the Tail: neighbours throw pots at whoever chases its own (One of us); stones from the roofs at those it distrusts (GDD ch. 6)
  {
    let cd = 0;
    TICK.push(() => {
      const W = W2x();
      if (!W || !W.on || !W.on() || busy || !G.world || !G.world.player || W.inside) return;
      if (W.active !== 'tail' && W.active !== 'potters') return;
      if (--cd > 0) return;
      cd = 60;
      const pl = G.world.player, tr = TIER_RANK[tierOf('tail')];
      if (tr >= TIER_RANK.own) {
        const foes = (G.world.enemies || []).filter(e => e && !e.dead && !e.isBoss && Math.abs(e.x - pl.x) < 200 && Math.abs(e.y - pl.y) < 90);
        if (foes.length && Math.random() < (tr === 4 ? 0.22 : 0.12)) {
          const e = foes[0];
          try { e.hp -= Math.max(4, e.maxHp * 0.15); if (e.addStatus) e.addStatus('stun', { t: 45 }); if (e.hp <= 0 && e.die) e.die(); G.FX.text(e.x, e.top - 14, t(`A pot from a roof!|Горшок с крыши!|Tomdan tovoq!`), '#ffe7a6', { size: 6, life: 50 }); sfx('hit', { x: e.x }); } catch (x) { /* ignore */ }
          cd = 420;
        }
      } else if (tr <= TIER_RANK.distrust && Math.random() < 0.06) {
        try { if (pl.hp > 6) pl.hp -= 2; G.FX.text(pl.x, pl.top - 14, t(`A stone, from nowhere.|Камень, неизвестно откуда.|Qayerdandir tosh.`), '#d9a0a0', { size: 6, life: 50 }); sfx('hit', { x: pl.x }); } catch (x) { /* ignore */ }
        cd = 900;
      }
    });
  }
  // the Tail's people shut their doors to those it distrusts: their talk becomes a turned back
  s6init(() => {
    const W = W2x();
    for (const id in W.npcs) {
      const n = W.npcs[id];
      const tailFolk = (n.sched || []).some && (n.sched || []).some(x => x.region === 'tail' || x.region === 'potters');
      if (!tailFolk || FAC.NPC[id]) continue;
      const t0 = n.talk;
      n.talk = function (done) {
        if (TIER_RANK[tierOf('tail')] <= TIER_RANK.distrust) { play([['', pick([`They turn their back and go on with their work, as if you were weather.|Отворачиваются и продолжают работать, будто ты — погода.|Orqa o'girib, ishini davom ettiradi — go'yo sen ob-havosan.`, `A door closes a little louder than it needs to.|Дверь закрывается чуть громче, чем нужно.|Eshik keragidan sal qattiqroq yopiladi.`])]], done); return; }
        return t0 ? t0.apply(this, arguments) : done();
      };
    }
  });
  // the Rabat at One of us: the caravan-bashi carry you along their routes (both caravanserais become yours to travel to)
  FAC.onTier((k, after) => {
    if (k !== 'rabat' || TIER_RANK[after] < TIER_RANK.own) return;
    const W = W2x(), s = W && W.S(); if (!s) return;
    for (const c of W.chaiList ? W.chaiList() : []) if (c.region === 'rabat' || c.region === 'withers') s.chai[c.id] = 1;
    save();
    toast(t(`The caravan-bashi of the Rabat will take you along their routes: the Rabat's chaikhanas are open to your travel.|Караван-баши Рабата возьмут тебя на свои маршруты: чайханы Рабата открыты для твоих переходов.|Rabot karvonboshilari seni o'z yo'llariga olib ketadi: Rabot choyxonalari sen uchun ochiq.`), '#ffe7a6');
  });

  /* ================================================================ the HUD: the faction step you followed last, under the story's objective */
  FAC.tracked = () => { const s = F6(); for (let i = s.jr.length - 1; i >= 0; i--) { const q = s.q[s.jr[i].id]; if (q && q.st === 'active') return { id: s.jr[i].id, t: q.t }; } return null; };
  SMOOTH_DRAW.push((ctx, st) => {
    const W = W2x();
    if (st !== 'play' || !W || !W.on() || !G.world || !G.world.player || (G.UI.isOpen && G.UI.isOpen()) || W.mapOpen || FAC.J.open) return;
    const tr = FAC.tracked(); if (!tr) return;
    const Q = FAC.Q[tr.id];
    const s = W.S(), y = 92 + (s && s.obj ? 20 : 10);
    FX.tt(ctx, '◇ ' + t(Q ? Q.title : ''), G.W - 6, y, 170, { size: 5.2, align: 'right', color: '#e8d8a8' });
  });

  /* ================================================================ the journal: [N] (GDD ch. 23) — quests by faction, and where you stand */
  const J = FAC.J = { open: false, tab: 0, sel: 0, t: 0, blocker: false };
  const TABS = [`Faction work|Дела фракций|Fraksiya ishlari`, `Standing|Положение|Mavqe`, `Done|Завершённое|Yakunlangan`];
  const FAC_TITLE = { singers: REP_NAME.singers, divan: REP_NAME.divan, remember: REP_NAME.remember, tail: REP_NAME.tail, rabat: REP_NAME.rabat };
  FAC.J.list = () => {
    const s = F6(), out = [];
    for (const id in FAC.Q) {
      const Q = FAC.Q[id], q = s.q[id];
      if (!q || q.st === 'none') continue;
      out.push({ id, Q, q });
    }
    return out;
  };
  function openJ() {
    const W = W2x();
    if (J.open || G.Game.state !== 'play' || busy) return;
    if (G.UI.isOpen && G.UI.isOpen()) return;
    J.open = true; J.t = 0; J.sel = 0; J.blocker = true;
    G.UI.choice({ title: '', cancel: true, options: [{ label: ' ', value: null }], kind: 'scroll', onPick: () => { J.blocker = false; if (J.open) closeJ(true); } });
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    sfx('scroll'); void W;
  }
  function closeJ(fromModal) {
    if (!J.open) return;
    J.open = false;
    const m = G.UI._debug().modal;
    if (!fromModal && m && m.type === 'choice' && J.blocker) { m.picked = true; m.pickT = 0; m.pickVal = null; }
    J.blocker = false;
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    sfx('ui_back');
  }
  FAC.openJournal = openJ; FAC.closeJournal = () => closeJ(false);
  window.addEventListener('keydown', e => {
    if (!J.open) {
      if (e.code !== 'KeyN' || e.repeat || !R().world) return;
      const m = G.UI._debug().modal;
      if (m && m.type === 'pause' && !m.sub) { m.closing = true; m.closeT = 0; setTimeout(openJ, 220); e.preventDefault(); return; }
      if (G.Game.state === 'play' && !(G.UI.isOpen && G.UI.isOpen())) { openJ(); e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    e.stopImmediatePropagation(); e.preventDefault();
    if (e.repeat) return;
    const c = e.code;
    if (c === 'Escape' || c === 'KeyN' || c === 'Backspace') { closeJ(false); return; }
    if (c === 'ArrowLeft' || c === 'KeyA' || c === 'KeyQ') { J.tab = (J.tab + 2) % 3; J.sel = 0; sfx('ui_move'); }
    if (c === 'ArrowRight' || c === 'KeyD' || c === 'KeyE' || c === 'Tab') { J.tab = (J.tab + 1) % 3; J.sel = 0; sfx('ui_move'); }
    if (c === 'ArrowUp' || c === 'KeyW') { J.sel = Math.max(0, J.sel - 1); sfx('ui_move'); }
    if (c === 'ArrowDown' || c === 'KeyS') { J.sel++; sfx('ui_move'); }
  }, true);
  window.addEventListener('keyup', e => { if (J.open) e.stopImmediatePropagation(); }, true);
  // drawing (smooth layer, after the dialog art)
  const font = (sz, w, serif) => `${w || 400} ${sz}px ${serif ? 'Georgia, serif' : 'system-ui, sans-serif'}`;
  const wrapT = (ctx, s, w, f) => { ctx.font = f; const out = []; for (const para of String(s).split('\n')) { let line = ''; for (const word of para.split(' ')) { const tr = line ? line + ' ' + word : word; if (ctx.measureText(tr).width > w && line) { out.push(line); line = word; } else line = tr; } out.push(line); } return out; };
  const text = (ctx, s, x, y, o) => { ctx.font = font(o.size || 6, o.weight, o.serif); ctx.textBaseline = 'top'; ctx.textAlign = o.align || 'left'; ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.fillText(s, x + 0.4, y + 0.5); ctx.fillStyle = o.color || '#f2e6c8'; ctx.fillText(s, x, y); };
  const para = (ctx, s, x, y, w, o) => { const f = font(o.size || 6, o.weight, o.serif), L = wrapT(ctx, s, w, f), lh = (o.size || 6) * 1.34; const n = Math.min(o.max || 99, L.length); for (let i = 0; i < n; i++) text(ctx, L[i], x, y + i * lh, o); return n * lh; };
  function drawJ(ctx) {
    if (!J.open) return;
    J.t++;
    const a = Math.min(1, J.t / 8), s = F6();
    ctx.save();
    ctx.globalAlpha = a; ctx.fillStyle = '#07040a'; ctx.fillRect(0, 0, G.W, G.H);
    const X = 30, Y = 18, Wd = G.W - 60, H = G.H - 36;
    ctx.fillStyle = '#16101c'; ctx.fillRect(X, Y, Wd, H);
    ctx.strokeStyle = '#e2b452'; ctx.lineWidth = 0.8; ctx.strokeRect(X + 2, Y + 2, Wd - 4, H - 4);
    ctx.fillStyle = '#1d4c9a'; ctx.fillRect(X + 8, Y + 6, Wd - 16, 2);
    text(ctx, t(`Journal|Журнал|Jurnal`), G.W / 2, Y + 11, { size: 9, align: 'center', serif: true, color: '#ffe7a6', weight: 700 });
    TABS.forEach((tb, i) => text(ctx, (i === J.tab ? '◆ ' : '') + t(tb), X + 20 + i * (Wd - 40) / 3, Y + 26, { size: 6, color: i === J.tab ? '#ffe7a6' : '#9a8a78', weight: i === J.tab ? 700 : 400 }));
    ctx.fillStyle = 'rgba(226,180,82,0.35)'; ctx.fillRect(X + 10, Y + 36, Wd - 20, 0.6);
    const y0 = Y + 42;
    if (J.tab === 1) {
      let y = y0;
      for (const k of ALL) {
        const tr = tierOf(k);
        text(ctx, t(FAC_TITLE[k]), X + 24, y, { size: 6.4, serif: true });
        text(ctx, t(FAC.TIER_NAME[tr]), X + 150, y, { size: 6.4, color: TIER_COL[tr], weight: 700 });
        if (FAC.wanted(k)) text(ctx, t(`wanted|в розыске|qidiruvda`), X + 240, y, { size: 5.6, color: '#ff8a7a', weight: 700 });
        y += 12;
      }
      y += 6;
      const lp = s.picks || 0;
      text(ctx, tf(`Lockpicks: {n}|Отмычки: {n}|Shaqildoqlar: {n}`, { n: lp }), X + 24, y, { size: 5.6, color: '#c8b8a0' });
      y += 14;
      para(ctx, t(`Standing shows only as a threshold. Below "Distrust" prices rise and doors shut; at "Enemy" they come for you in the street. "One of us" opens a faction's work and its quartermaster; "Trusted" opens its end.|Положение видно только как порог. Ниже «Недоверия» растут цены и закрываются двери; «Враг» — за тобой придут на улице. «Свой» открывает дела фракции и её интенданта; «Доверенный» — финал её арки.|Mavqe faqat ostona bo'lib ko'rinadi. «Ishonchsizlik»dan pastda narx oshadi, eshiklar yopiladi; «Dushman»ni ko'chada izlashadi. «O'zimizdan» fraksiya ishlari va ta'minotchisini ochadi; «Ishonchli» — yo'l oxirini.`), X + 24, y, Wd - 48, { size: 5.2, color: '#9a8a78' });
    } else {
      const want = J.tab === 0 ? (q => q.st === 'active') : (q => q.st === 'done' || q.st === 'failed');
      const list = FAC.J.list().filter(r => want(r.q));
      if (!list.length) text(ctx, t(J.tab === 0 ? `Nothing open. Faction people will find you, or you them.|Открытых дел нет. Люди фракций найдут тебя — или ты их.|Ochiq ish yo'q. Fraksiya odamlari seni topadi — yoki sen ularni.` : `Nothing finished yet.|Пока ничего не завершено.|Hozircha hech narsa yakunlanmagan.`), X + 24, y0 + 4, { size: 6, color: '#9a8a78' });
      J.sel = Math.min(J.sel, Math.max(0, list.length - 1));
      const top = Math.max(0, J.sel - 5);
      let y = y0;
      list.slice(top, top + 7).forEach((r, i) => {
        const on = top + i === J.sel;
        text(ctx, (on ? '▸ ' : '  ') + t(r.Q.title), X + 16, y, { size: 6, color: on ? '#ffe7a6' : '#e8d8b8', weight: on ? 700 : 400, serif: true });
        text(ctx, t(REP_NAME[r.Q.fac] || ''), X + Wd - 16, y, { size: 5, color: '#9a8a78', align: 'right' });
        y += 10;
      });
      const r = list[J.sel];
      if (r) {
        ctx.fillStyle = 'rgba(226,180,82,0.25)'; ctx.fillRect(X + 10, Y + H - 66, Wd - 20, 0.6);
        let yy = Y + H - 60;
        const hist = s.jr.filter(e => e.id === r.id).slice(-3);
        for (const e of hist) yy += para(ctx, '· ' + t(e.t), X + 18, yy, Wd - 36, { size: 5.4, color: e === hist[hist.length - 1] ? '#f2e6c8' : '#a89a88', max: 3 }) + 2;
      }
    }
    text(ctx, t(`← → sections · ↑ ↓ choose · N / Esc: close|← → разделы · ↑ ↓ выбор · N / Esc: закрыть|← → bo'limlar · ↑ ↓ tanlash · N / Esc: yopish`), G.W / 2, Y + H - 10, { size: 4.6, align: 'center', color: '#9a8a78' });
    ctx.restore();
  }
  G.Events.on('boot', () => { SMOOTH_DRAW.push(ctx => { try { drawJ(ctx); } catch (e) { console.error('[s6] journal', e); } }); });
  // the pause screen: the journal is one key away
  SMOOTH_DRAW.push((ctx, st) => {
    const m = G.UI._debug().modal;
    if (!m || m.type !== 'pause' || m.sub || !R().world) return;
    FX.tt(ctx, t(`[N] Journal|[N] Журнал|[N] Jurnal`), 18, 224, 160, { size: 5.5, color: '#ffe7a6' });
  });

  /* ================================================================ marks: quest givers waiting for him (map) */
  FAC.refreshMarks = () => {
    const W = W2x(); if (!W || !W.S || !W.S()) return;
    for (const id in FAC.Q) {
      const Q = FAC.Q[id], q = qs(id);
      if (q.st === 'none' && Q.offer && Q.offer() && Q.where) W.mark('f6:' + id, Q.where[0], Q.where[1], 0, 'person', Q.title);
      else if (q.st === 'none') W.unmark('f6:' + id);
    }
  };
  s6init(() => { W2x().onEnter('*', () => { try { FAC.refreshMarks(); } catch (e) { console.error('[s6] marks', e); } }); });

  /* ================================================================ the arc finals: lairs of the three new bosses, and the finale */
  // lair(id, bossId, biome) — out: back to the dream street where the leader waited
  FAC.lair = (id, boss, biome) => s6init(() => {
    W2x().region(id, { name: (BOSSES[boss] && (BOSSES[boss].lair || BOSSES[boss].name)) || id, sub: (BOSSES[boss] && BOSSES[boss].lairSub) || '', tier: 'dream', act: 3, stage: 9.4, seed: 7, arena: { boss, biome }, out: ['dream', 'spot:f_final'], beat: null, exits: {}, objects: [] });
  });
  FAC.goLair = id => { const W = W2x(); setTimeout(() => W.go(id, 'start', { force: true, speed: 0.02 }), 60); };
  // after a fight against a faction, the plan under way at the finale cannot be that faction's any more
  FAC.retarget = k => {
    const f = F();
    if (f.faction !== k) return;
    const rp = R().rep || {};
    const other = BIG.filter(x => x !== k && !FAC.flag('fought_' + x)).sort((a, b) => (rp[b] || 0) - (rp[a] || 0))[0];
    if (other) { f.faction = other; save(); }
  };
  // epilogue: a leader you fought in the dream gets their own slide (the rest of 72's epilogue stays as it is)
  FAC.EPI = {};
  s6init(() => {
    for (const e of ['tithe', 'chain', 'awake', 'tale']) {
      const E = ENDINGS[e]; if (!E || !E.epilogue) continue;
      const ep0 = E.epilogue;
      E.epilogue = function () {
        let out = ep0.apply(this, arguments) || [];
        try {
          for (const k in FAC.EPI) {
            const slide = FAC.EPI[k](e); if (!slide) continue;
            const i = out.findIndex(x => x && typeof x === 'object' && x.k === slide.k);
            if (i >= 0) out[i] = slide; else out.splice(Math.max(0, out.length - 2), 0, slide);
          }
        } catch (x) { console.error('[s6] epilogue', x); }
        return out;
      };
    }
  });

  /* ================================================================ a person's menu: their quests first, then what 79 adds (trade, bounties) */
  FAC.EXTRA = {};
  FAC.extra = (npc, fn) => (FAC.EXTRA[npc] = FAC.EXTRA[npc] || []).push(fn);
  FAC.extras = npc => (FAC.EXTRA[npc] || []).map(f => { try { return f(); } catch (e) { console.error('[s6] extra', e); return null; } }).filter(Boolean);
  const BYE = `"Another time."|«В другой раз.»|«Boshqa safar.»`;
  // opts: [{label, go(done)}]; empty quest options and no extras -> the idle line
  FAC.menu = (npc, title, opts, done, idle) => {
    const list = (opts || []).filter(Boolean).concat(FAC.extras(npc));
    if (!list.length) { play([['', idle || FAC.NPC[npc] && FAC.NPC[npc].def.idle || `…|…|…`]], done); return; }
    ask(title || '', list.concat([{ id: 'bye', label: BYE }]), o => { if (o.go) o.go(done); else if (o.run) o.run(done); else done(); });
  };

  /* ================================================================ tests */
  FAC.debug = () => { const s = F6(); return { stand: Object.fromEntries(ALL.map(k => [k, standing(k)])), tier: Object.fromEntries(ALL.map(k => [k, tierOf(k)])), q: JSON.parse(JSON.stringify(s.q)), susp: s.susp, spy: s.spy, bounty: s.bounty, n: s.n }; };
}
