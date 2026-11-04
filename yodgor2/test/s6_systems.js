// Stage 6 — systems: reputation thresholds and their effects, merchants (hours, prices × standing, haggling, selling),
// theft → witness → bounty → clearing, stealth (suspicion, backstab ×3 / knives ×4), Sado's light.
const T = require('./s6_lib');
const lang = process.argv[2] || 'ru';
const R = { lang, ok: [], fail: [] };
const W = (p, f, a) => p.evaluate(f, a);
const check = (name, cond, extra) => (cond ? R.ok : R.fail).push(name + (extra !== undefined ? ' ' + JSON.stringify(extra) : ''));
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'bazaar', lang });
  const log = [];
  // 1. thresholds: the story's rep units ×6, tiers only
  const tiers = await W(p, () => { const out = {}; for (const v of [-60, -20, 0, 25, 65]) { G.YODGOR.run.rep.divan = v / 6; out[v] = G.FAC.tier('divan'); } G.YODGOR.run.rep.divan = 0; return out; });
  check('tiers', tiers[-60] === 'enemy' && tiers[-20] === 'distrust' && tiers[0] === 'stranger' && tiers[25] === 'own' && tiers[65] === 'trusted', tiers);
  // a crossed threshold makes its own toast; rep() of the story still works
  await W(p, () => { G.FAC.add('divan', 25); });
  check('add→own', (await W(p, () => G.FAC.tier('divan'))) === 'own');
  // 2. prices × standing
  const prices = await W(p, () => {
    const e = G.FAC.econ.stock('shavkat')[0]; const out = {};
    for (const v of [-20, 0, 25, 65]) { G.YODGOR.run.rep.divan = v / 6; out[v] = G.FAC.price('shavkat', e); }
    G.YODGOR.run.rep.divan = 0; return out;
  });
  check('price by standing', prices[-20] > prices[0] && prices[0] > prices[25] && prices[25] > prices[65], prices);
  // 3. hours: Shavkat by day, Zulfiya at night; the stock is fixed for the visit
  await T.go(p, 'bazaar', 10, log);
  const day = await W(p, () => G.world.ents.filter(e => e._w2npc).map(e => e._w2npc));
  await T.go(p, 'bazaar', 23, log);
  const night = await W(p, () => G.world.ents.filter(e => e._w2npc).map(e => e._w2npc));
  check('hours', day.includes('shavkat') && !day.includes('zulfiya') && night.includes('zulfiya') && !night.includes('shavkat'), { day, night });
  // 4. buying at Shavkat (by day), haggling success and failure
  await T.go(p, 'bazaar', 10, log);
  const g0 = await W(p, () => G.run.gold), inv0 = await W(p, () => G.YITEMS.list().length);
  await T.talk(p, 'shavkat', log, [/Show me your goods|Покажи товар|Molingni/, /./]);
  const g1 = await W(p, () => G.run.gold), inv1 = await W(p, () => G.YITEMS.list().length);
  check('bought', g1 < g0 && inv1 > inv0, { g0, g1 });
  const hag = await W(p, () => { const e = G.FAC.econ.stock('shavkat')[1] || G.FAC.econ.stock('shavkat')[0]; const a = G.FAC.price('shavkat', e); G.CH.S().attr.mem = 12; G.CH.dirty(); return { a, e }; });
  await T.talk(p, 'shavkat', log, [/talk about the price|о цене поговорим|Narx haqida/, /catch the lie|поймать в ней ложь|yolg'onni ilg'ash/]);
  const hagB = await W(p, e => G.FAC.price('shavkat', e), hag.e);
  check('haggle −20%', Math.abs(hagB - Math.round(hag.a * .8)) <= 1, { before: hag.a, after: hagB });
  await W(p, () => { G.CH.S().attr.agi = 1; G.CH.dirty(); G.FAC.S().merch.zebo = {}; });
  await T.go(p, 'tail', 10, log);
  const z0 = await W(p, () => G.FAC.price('zebo', G.FAC.econ.stock('zebo')[0]));
  await T.talk(p, 'zebo', log, [/talk about the price|о цене поговорим|Narx haqida/, /so fast he counts|так быстро|shunday tez/]);
  await T.go(p, 'tail', 10, log);   // a new visit: the failed haggle lasts until the next act
  const z1 = await W(p, () => G.FAC.price('zebo', G.FAC.econ.stock('zebo')[0]));
  check('failed haggle +10% until next act', z1 > z0, { z0, z1 });
  // 5. selling at Ibrohim: 30%, the cap per act
  await T.go(p, 'bazaar', 12, log);
  const s0 = await W(p, () => G.run.gold);
  await T.talk(p, 'ibrohim', log, [/things to sell|Есть что продать|Sotadigan narsam/, /tilla|тилла/]);
  const s1 = await W(p, () => G.run.gold);
  check('sold', s1 > s0, { s0, s1 });
  // 6. the quartermaster opens at "One of us" only
  const qm = await W(p, () => { G.YODGOR.run.rep.divan = 0; const a = G.FAC.tradeOpts('nodira').length; G.YODGOR.run.rep.divan = 30 / 6; const b2 = G.FAC.tradeOpts('nodira').length; return { a, b2 }; });
  check('quartermaster at One of us', qm.a === 0 && qm.b2 > 0, qm);
  // 7. Enemy: the merchant refuses; patrols come in the district
  await W(p, () => { G.YODGOR.run.rep.divan = -70 / 6; });
  await T.go(p, 'bazaar', 12, log);
  const patrol = await W(p, () => G.world.ents.filter(e => e._f6patrol === 'divan' && !e.dead).length);
  check('enemy patrols', patrol >= 2, patrol);
  const refuse = await W(p, () => G.FAC.tradeOpts('shavkat').length === 1);
  check('enemy: merchant refuses', refuse);
  await W(p, () => { G.YODGOR.run.rep.divan = 0; for (const e of G.world.ents) if (e._f6patrol) e.dead = true; });
  // 8. theft caught → bounty → fine clears it
  await T.go(p, 'bazaar', 10, log);
  await W(p, () => { G.CH.S().attr.agi = 1; G.CH.S().attr.mem = 1; G.CH.dirty(); });
  await T.talk(p, 'shavkat', log, [/Pocket something|сунуть что-нибудь в рукав|yengga solish/, /Walk away fast|Быстро уйти|Tez ketish/]);
  const w1 = await W(p, () => ({ wanted: G.FAC.wanted('divan'), st: G.FAC.standing('divan'), n: (G.FAC.S().bounty.divan || {}).n }));
  check('theft witnessed → bounty −15', w1.wanted && w1.st <= -15, w1);
  await T.go(p, 'bazaar', 10, log);
  const guards = await W(p, () => G.world.ents.filter(e => e._f6patrol === 'divan' && !e.dead).length);
  check('wanted: guards come', guards >= 2, guards);
  await W(p, () => { for (const e of G.world.ents) if (e._f6patrol) e.dead = true; });
  await T.talk(p, 'ibrohim', log, [/Pay the fine|Заплатить штраф|Jarimani/]);
  check('fine clears', !(await W(p, () => G.FAC.wanted('divan'))));
  // Singers: confession and tithe
  await W(p, () => { G.FAC.S().bounty.singers = { n: 40 }; G.YODGOR.run.rep.singers = 0; });
  await T.go(p, 'cloister', 14, log);
  const v0 = await W(p, () => G.YODGOR.run.void);
  await T.talk(p, 'habiba', log, [/confess|покаяться|Tavba/]);
  check('confession clears, costs memory', !(await W(p, () => G.FAC.wanted('singers'))) && (await W(p, () => G.YODGOR.run.void)) > v0);
  // 9. burglary at night in the Tail: a chest, a lockpick, the companions' reaction
  await W(p, () => { G.FAC.S().picks = 3; G.CH.S().attr.agi = 14; G.CH.dirty(); });
  await T.go(p, 'tail', 2, log);
  const c0 = await W(p, () => G.run.gold);
  await T.useProp(p, 'chest_tail', log, [/Pick the lock|Вскрыть замок|Qulfni/]);
  const c1 = await W(p, () => ({ g: G.run.gold, crimes: G.FAC.S().crimes }));
  check('burglary', c1.g > c0 && c1.crimes >= 2, { c0, c1 });
  // 10. stealth: an enemy that hasn't noticed him takes ×3 (knife ×4); from behind at night it doesn't notice
  const st = await W(p, () => {
    const pl = G.world.player, L = G.level;
    const e = G.Enemies.spawn('yd_divan_merc', pl.x + 150, pl.y); e.facing = 1; e.aggro = false; e._s6aware = 0;
    const out = { vis: +G.FAC.visibility().toFixed(2) };
    for (let i = 0; i < 40; i++) G.debugTick(1);
    out.noticedFromBehind = !!e.aggro;
    const hitInfo = () => ({ dmg: 10, type: 'melee', item: G.run.slots.attack, kbx: 0, kby: 0 });
    const ea = G.Enemies.spawn('yd_divan_merc', pl.x + 150, pl.y); ea.facing = 1; const i1 = hitInfo(); G.Combat.hit(pl, ea, i1); out.dmg1 = i1.dmg;
    const e2 = G.Enemies.spawn('yd_divan_merc', pl.x + 150, pl.y); e2.facing = 1; e2.aggro = true; const i2 = hitInfo(); G.Combat.hit(pl, e2, i2); out.dmg2 = i2.dmg; ea.dead = true;
    const e3 = G.Enemies.spawn('yd_divan_merc', pl.x - 60, pl.y); e3.facing = 1; e3.aggro = false;
    for (let i = 0; i < 200 && !e3.aggro; i++) G.debugTick(1); out.noticedInFront = !!e3.aggro;
    e.dead = e2.dead = e3.dead = true;
    out.backstabs = G.FAC.stats.backstabs; void L;
    return out;
  });
  check('night: unseen from behind', !st.noticedFromBehind, st);
  check('backstab ×3', Math.abs(st.dmg1 / st.dmg2 - 3) < 0.01 || Math.abs(st.dmg1 / st.dmg2 - 4) < 0.01, st);
  check('noticed in front', st.noticedInFront, st);
  await T.shot(p, 's6_systems_' + lang);
  R.errs = p._errs.slice(0, 12); R.untranslated = (await T.untranslated(p)).filter(s => !/^Level \d|^Уровень|^Daraja/.test(s));
  console.log(JSON.stringify(R, null, 1));
  require('fs').writeFileSync(T.OUT + '/s6_systems_' + lang + '.log', log.join('\n'));
  await b.close();
})();
