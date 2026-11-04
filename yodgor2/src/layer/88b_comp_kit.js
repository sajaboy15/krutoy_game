/* =====================================================================
   88b_comp_kit.js — stage 7b: the companions in the story (GDD ch. 7).
   86–88 made Alp, Nargiza and Surayyo fight, level and hold opinions; nothing put them in the story. These files do:
     88b  this kit: arc state, the companions' journal, beats that wait for their moment, the talks by the fire,
          and how Alp and Nargiza come to walk with you
     88c  Alp — "The Name" (5 steps)            88d  Nargiza — "Bekzod" (5 steps)
     88e  Surayyo — "The Pleiades" (6 steps), the romance and its six outcomes
     88f  the Alp–Nargiza knot (Alp sold her brother)          88g  the camp: talks by the fire (~60)
   State: R().comp = { arc: {id: step}, f: {flags}, seen: {beats and talks shown} } (saved with the journey).
   Story facts read from the acts: F().alp (the fallen house), F().alpTumars (the Swallowed Streets),
   F().nargizaQ (the Spine), F().dreamBy, R().ended (the ending).
   ===================================================================== */
const COMP = G.COMP = { talks: [], beats: [] };
{
  REP_NAME.comp = `Companion|Спутник|Hamroh`;
  const S = COMP.S = () => {
    const r = R();
    if (!r.comp || typeof r.comp !== 'object') r.comp = {};
    const c = r.comp;
    for (const k of ['arc', 'f', 'seen']) if (!c[k] || typeof c[k] !== 'object') c[k] = {};
    return c;
  };
  COMP.f = (k, v) => { const c = S(); if (v === undefined) return c.f[k]; c.f[k] = v; save(); return v; };
  COMP.arc = (id, n) => { const c = S(); if (n === undefined) return c.arc[id] || 0; if (n > (c.arc[id] || 0)) { c.arc[id] = n; save(); } return c.arc[id]; };
  COMP.seen = k => !!S().seen[k];
  COMP.see = k => { S().seen[k] = 1; save(); };
  COMP.has = id => !!(G.PARTY && G.PARTY.has(id));                 // joined and not gone
  COMP.with = id => FAC.inParty(id);                               // walking with you right now
  COMP.app = (id, d, why) => (G.PARTY ? G.PARTY.approval(id, d, why) : 0);
  COMP.join = (id, app) => { if (!G.PARTY) return; G.PARTY.join(id); if (app) G.PARTY.approval(id, app, 'join'); };
  COMP.flag = (id, k, v) => (G.PARTY ? G.PARTY.flag(id, k, v) : undefined);
  COMP.story = id => !!(G.WORLD2 && G.WORLD2.story && G.WORLD2.story.done(id));
  COMP.region = () => (G.WORLD2 ? G.WORLD2.active : null);
  COMP.inside = () => (G.WORLD2 ? G.WORLD2.inside : null);
  COMP.moon = () => (G.WORLD2 && G.WORLD2.moonPhase ? G.WORLD2.moonPhase() : 0);
  COMP.name = id => (CAST[id] ? CAST[id].name : id);
  // is the hero near a named spot of the current region (L.w2.spots / entries)?
  COMP.near = (region, spot, r) => {
    if (COMP.region() !== region || COMP.inside()) return false;
    const L = G.level, p = G.world && G.world.player; if (!L || !L.w2 || !p) return false;
    const at = (L.w2.spots && L.w2.spots[spot]) || (L.w2.entries && L.w2.entries[spot]); if (!at) return false;
    return Math.abs(p.x - at.x) < (r || 90) && Math.abs(p.y - at.y) < 140;
  };
  // the companions' journal: one entry per arc (fac 'comp')
  const TITLE = { alp: `The Name|Имя|Ism`, nargiza: `Bekzod|Бекзод|Bekzod`, surayyo: `The Pleiades|Плеяды|Hulkar`, knot: `What Alp Sold|Что продал Алп|Alp nimani sotgan` };
  for (const k in TITLE) FAC.quest('c_' + k, { fac: 'comp', title: TITLE[k] });
  COMP.note = (id, text, where) => { const qid = 'c_' + id; if (FAC.q(qid).st === 'none') FAC.begin(qid, text, where); else FAC.stepTo(qid, text, where || null); };
  COMP.end = (id, br, text) => { if (FAC.q('c_' + id).st !== 'done') FAC.finish('c_' + id, br, text); };

  /* ---------------------------------------------------------------- beats: a scene that waits for its moment */
  // COMP.beat(key, when(), show(done)) — once; checked twice a second while nothing else is on
  COMP.beat = (key, when, show) => COMP.beats.push({ key, when, show });
  let tk = 0;
  G.WORLD2.ticks.push(() => {
    if (++tk % 30 || !R() || R().ended) return;
    if (!quiet()) return;
    for (const b of COMP.beats) {
      if (COMP.seen(b.key)) continue;
      let ok = false; try { ok = !!b.when(); } catch (e) { ok = false; }
      if (!ok) continue;
      COMP.see(b.key);
      scene(done => { try { b.show(done); } catch (e) { console.error('[comp] beat', b.key, e); done(); } });
      return;
    }
  });

  /* ---------------------------------------------------------------- talks by the fire (the camp-chaikhana) */
  // COMP.talk({ id, who: 'alp'|'nargiza'|'surayyo'|'all', pri, when(), lines | run(done) }) — once each.
  // After a rest one talk comes by itself (the most pressing); "Sit by the fire" in the chaikhana menu calls the next.
  COMP.talk = def => COMP.talks.push(Object.assign({ pri: 1 }, def));
  const present = who => (who === 'all' ? ['alp', 'nargiza', 'surayyo'].some(COMP.has) : [].concat(who).every(COMP.has));
  COMP.nextTalk = () => {
    let best = null;
    for (const d of COMP.talks) {
      if (COMP.seen('t:' + d.id) || !present(d.who)) continue;
      let ok = true; try { ok = !d.when || !!d.when(); } catch (e) { ok = false; }
      if (ok && (!best || d.pri > best.pri)) best = d;
    }
    return best;
  };
  COMP.runTalk = (d, done) => {
    COMP.see('t:' + d.id);
    const fin = () => { try { d.after && d.after(); } catch (e) { console.error(e); } done && done(); };
    try { if (d.run) d.run(fin); else play(typeof d.lines === 'function' ? d.lines() : d.lines, fin); } catch (e) { console.error('[comp] talk', d.id, e); fin(); }
  };
  G.WORLD2.hooks.rest.push(() => {
    const d = COMP.nextTalk(); if (!d) return;
    queue(() => quiet(), () => { if (!COMP.seen('t:' + d.id)) scene(done => COMP.runTalk(d, done)); }, 'camp');
  });
  G.WORLD2.restOpts.push(() => {
    const d = COMP.nextTalk(); if (!d) return null;
    return { label: t(`Sit by the fire with your people|Посидеть у огня со своими|O'zinikilar bilan olov yonida o'tirish`), run: () => { const d2 = COMP.nextTalk(); if (d2) scene(done => COMP.runTalk(d2, done)); } };
  });

  /* ================================================================ Alp comes along (after the fallen house, 70_act1.js) */
  // F().alp: 'helped' (he asks to come), 'paid' (he waits in the Tail), 'collected' (he watches you; later, coldly)
  COMP.beat('alp_join', () => COMP.story('a1_tail') && F().alp === 'helped' && !COMP.has('alp'), done => play([
    ['', `Alp finds you at the end of the row, dust still in his eyebrows.|Алп догоняет тебя в конце ряда — пыль ещё в бровях.|Alp seni qator oxirida quvib yetadi — qoshlarida hali ham chang.`],
    ['alp', `The boy is with Mehri. She feeds him. ...I'll go with you. You dig, I lift. That works.|Мальчишка у Мехри. Она его кормит. ...Я пойду с тобой. Ты копаешь, я поднимаю. Так получается.|Bola Mehrining yonida. U ovqat beryapti. ...Men sen bilan boraman. Sen kovlaysan, men ko'taraman. Shunday bo'ladi.`],
    ['hero', `I'm a yodchi, Alp. People don't like whoever walks with me.|Я ёдчи, Алп. Тех, кто ходит со мной, не любят.|Men yodchiman, Alp. Men bilan yurganlarni yoqtirishmaydi.`],
    ['alp', `People don't like me either. One. Two. Three. ...So we're even.|Меня тоже не любят. Раз. Два. Три. ...Значит, мы квиты.|Meni ham yoqtirishmaydi. Bir. Ikki. Uch. ...Demak, tengmiz.`],
    () => (sadoAwake() ? ['sado', `He counted. Like you do. I like him.|Он посчитал. Как ты. Он мне нравится.|U sanadi. Xuddi sendek. U menga yoqadi.`] : null)
  ], () => {
    COMP.join('alp', 20); COMP.arc('alp', 1);
    COMP.note('alp', `Alp walks with you: a Hollow giant who guards the Tail's orphans and doesn't remember his name, or why his wrists carry the scars of chains.|Алп идёт с тобой: Пустой великан, который бережёт сирот Хвоста и не помнит ни своего имени, ни откуда у него на запястьях шрамы от цепей.|Alp sen bilan: Dumdagi yetimlarni qo'riqlaydigan Bo'sh pahlavon. U na ismini, na bilagidagi zanjir izlari qayerdanligini eslaydi.`);
    done();
  }));
  FAC.npc('alp_tail', { name: `Alp|Алп|Alp`, look: 'alp', dx: 30, prompt: `Talk to Alp|Поговорить с Алпом|Alp bilan gaplashish`, idle: `Alp is mending a child's sandal with enormous, careful fingers.|Алп чинит детскую сандалию огромными осторожными пальцами.|Alp bolaning kovushini ulkan, ehtiyotkor barmoqlari bilan tuzatyapti.` },
    () => (COMP.story('a1_tail') && !COMP.has('alp') && !COMP.f('alpGone') ? [{ from: 6, to: 22, region: 'tail', spot: 'square' }] : []));
  FAC.talk.alp_tail = d => {
    const how = F().alp;
    if (how === 'collected' && !COMP.story('a1_bazaar')) { play([['alp', `Not yet. I'm still remembering your face.|Пока нет. Я ещё запоминаю твоё лицо.|Hali emas. Yuzingni hali eslab qolyapman.`]], d); return; }
    play(how === 'collected' ? [
      ['alp', `I remember your face. I said I would. ...I'll walk with you. To watch. Up close.|Твоё лицо я запомнил. Я же сказал. ...Пойду с тобой. Присматривать. Вблизи.|Yuzingni eslab qoldim. Aytgandim-ku. ...Sen bilan boraman. Kuzatish uchun. Yaqindan.`]
    ] : [
      ['alp', `You left water. Water is good. ...If you go where the children's fathers went, I want to see it.|Ты оставил воду. Вода — хорошо. ...Если ты пойдёшь туда, куда ушли отцы этих детей, я хочу это видеть.|Suv qoldirding. Suv yaxshi. ...Bu bolalarning otalari ketgan joyga borsang, men ham ko'rmoqchiman.`]
    ], () => {
      COMP.join('alp', how === 'collected' ? -25 : 0); COMP.arc('alp', 1);
      COMP.note('alp', `Alp walks with you: a Hollow giant who guards the Tail's orphans and doesn't remember his name, or why his wrists carry the scars of chains.|Алп идёт с тобой: Пустой великан, который бережёт сирот Хвоста и не помнит ни своего имени, ни откуда у него на запястьях шрамы от цепей.|Alp sen bilan: Dumdagi yetimlarni qo'riqlaydigan Bo'sh pahlavon. U na ismini, na bilagidagi zanjir izlari qayerdanligini eslaydi.`);
      d();
    });
  };

  /* ================================================================ Nargiza comes along (after the sermon, 70_act1.js a1_cloister) */
  const nargizaAsks = (done, again) => play(again ? [
    ['nargiza', `Changed your mind? He hasn't stopped calling. Neither have I.|Передумал? Он не перестал звать. И я не перестала.|Fikringdan qaytdingmi? U chaqirishdan to'xtamadi. Men ham.`]
  ] : [
    ['', `Nargiza catches you at the Cloister gate, out of breath, her white scarf crooked.|Наргиза догоняет тебя у ворот Обители — запыхалась, белый платок съехал набок.|Nargiza xonaqoh darvozasi oldida senga yetib oladi — nafasi bo'g'ziga tiqilgan, oq ro'moli bir yonga qiyshaygan.`],
    ['nargiza', `Take me down with you. Not into the Ustoz's well — the real one, where he is. He keeps saying one word, and up here I can't make it out.|Возьми меня с собой вниз. Не в колодец Устоз — в настоящий, где он. Он всё повторяет одно слово, а отсюда я его не разберу.|Meni ham pastga olib tush. Ustozning qudug'iga emas — haqiqiysiga, u bor joyga. U bitta so'zni takrorlayapti, bu yerdan esa tushunolmayman.`],
    ['hero', `And what will your Ustoz say?|А что скажет твоя Устоз?|Ustozing nima deydi?`],
    ['nargiza', `That I ran off with a yodchi. Which is true. I'll hum quietly, I promise. Mostly.|Что я сбежала с ёдчи. Что правда. Петь буду тихо, обещаю. В основном.|Yodchi bilan qochib ketdi, deydi. Bu rost ham. Sekin xirgoyi qilaman, va'da. Ko'pincha.`],
    () => (sadoAwake() ? ['sado', `She looked right at me just now. Right at me. Did you see?|Она только что посмотрела прямо на меня. Прямо на меня. Ты видел?|U hozirgina to'ppa-to'g'ri menga qaradi. To'ppa-to'g'ri. Ko'rdingmi?`] : null)
  ], () => ask(`Nargiza waits, already humming.|Наргиза ждёт и уже что-то напевает.|Nargiza kutib turibdi, allaqachon xirgoyi qilyapti.`, [
    { id: 'yes', label: `"Come. Keep up."|«Пошли. Не отставай.»|«Yur. Orqada qolma.»` },
    { id: 'no', label: `"Stay. It's safer behind white walls."|«Оставайся. За белыми стенами безопаснее.»|«Qol. Oq devorlar ortida xavfsizroq.»` }
  ], o => {
    if (o.id === 'yes') {
      COMP.join('nargiza', again ? 5 : 15); COMP.arc('nargiza', 1);
      COMP.note('nargiza', `Nargiza walks with you: a Singers' pupil who hears the Sleeper. She wants to go down where his voice is.|Наргиза идёт с тобой: ученица Певцов, которая слышит Спящего. Она хочет спуститься туда, где его голос.|Nargiza sen bilan: Uxlovchini eshitadigan xonandalar shogirdi. U ovozi bor joyga tushmoqchi.`, ['karez', 'story']);
      play([['nargiza', `Good. And don't look at me like that, I've walked further than the Bazaar before. Once.|Вот и хорошо. И не смотри так, я и дальше Базара ходила. Один раз.|Yaxshi. Bunday qarama, men Bozordan uzoqroqqa ham borganman. Bir marta.`]], done);
    } else {
      COMP.f('nargizaWait', 1); COMP.app('nargiza', -5);
      play([['nargiza', `Safer. That's what they say about cages too. ...I'll be at the gate.|Безопаснее. Про клетки так тоже говорят. ...Я буду у ворот.|Xavfsizroq. Qafas haqida ham shunday deyishadi. ...Darvoza oldida bo'laman.`]], done);
    }
  }));
  COMP.beat('nargiza_join', () => COMP.story('a1_cloister') && !COMP.has('nargiza') && COMP.region() === 'cloister', done => nargizaAsks(done, false));
  FAC.npc('nargiza_c', { name: `Nargiza|Наргиза|Nargiza`, look: 'nargiza', dx: -36, prompt: `Talk to Nargiza|Поговорить с Наргизой|Nargiza bilan gaplashish`, idle: `Nargiza is humming at the wall, as if it might hum back.|Наргиза напевает стене, будто та может подпеть.|Nargiza devorga xirgoyi qilyapti, go'yo u ham jo'r bo'ladigandek.` },
    () => (COMP.f('nargizaWait') && !COMP.has('nargiza') && COMP.moon() <= 1 ? [{ from: 7, to: 21, region: 'cloister', spot: 'story' }] : []));
  FAC.talk.nargiza_c = d => nargizaAsks(d, true);
}
