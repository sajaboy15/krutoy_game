// Stage 3: levels and attributes, diminishing returns, upgrades and mods, armour weight and the roll,
// stamina, resist caps, no scrolls anywhere, save → load.   node test/s3_char.js
const L = require('./s3_lib');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=3&god');
  p.setDefaultTimeout(300000);
  await L.tick(p, 40);
  for (let i = 0; i < 40 && (await L.modal(p)); i++) { await L.press(p, 'Escape'); await L.press(p, 'Enter'); await L.tick(p, 10); }
  const R = {}, bad = [];
  const ok = (name, cond, info) => { R[name] = cond ? 'ok' : 'FAIL ' + JSON.stringify(info); if (!cond) bad.push(name); };
  const ev = f => p.evaluate(f);

  // ---------- levels ----------
  const lv = await ev(() => {
    const s = G.CH.S(); const l0 = s.lvl, f0 = s.free, sp0 = G.CH.skillPoints();
    const need = G.CH.xpNeed(s.lvl) - s.xp;
    G.CH.addXp(need);
    const one = { lvl: s.lvl - l0, free: s.free - f0, sp: G.CH.skillPoints() - sp0 };
    G.CH.addXp(10000000);
    return { one, cap: s.lvl, need100: G.CH.xpNeed(1), need10: G.CH.xpNeed(10) };
  });
  ok('levelUp gives +1 attribute and +1 skill point', lv.one.lvl === 1 && lv.one.free === 1 && lv.one.sp === 1, lv.one);
  ok('level cap 30', lv.cap === 30, lv.cap);
  ok('threshold 100·L^1.35', lv.need100 === 100 && lv.need10 === Math.round(100 * Math.pow(10, 1.35)), lv);

  // ---------- attributes ----------
  const at = await ev(() => {
    const s = G.CH.S(), pl = G.world.player;
    const hp = () => { pl.syncStats(false); return pl.maxHp; };
    const mk = id => G.YITEMS.makeInst({ id, u: -1, q: 0, up: 0, mods: [] });
    const dm = (id, base) => G.Combat.playerDmg(mk(id), base || 10);
    const out = { hp: [], staff: [], sabre: [], focus: [], dutar: [], crit: [] };
    for (const k of ['str', 'agi', 'end', 'mem']) s.attr[k] = 1; G.CH.dirty();
    const base = { hp: hp(), staff: dm('yd_yodchi_staff'), sabre: dm('yd_caravan_klych'), focus: dm('yd_apprentice_tumar'), dutar: dm('yd_tail_dutar'), crit: G.CH.critChance() };
    for (let n = 1; n <= 20; n++) {
      for (const k of ['str', 'agi', 'end', 'mem']) s.attr[k] = n; G.CH.dirty();
      out.hp.push(hp()); out.staff.push(+dm('yd_yodchi_staff').toFixed(2)); out.sabre.push(+dm('yd_caravan_klych').toFixed(2)); out.focus.push(+dm('yd_apprentice_tumar').toFixed(2)); out.crit.push(+G.CH.critChance().toFixed(3));
    }
    for (const k of ['str', 'agi', 'end', 'mem']) s.attr[k] = 3; G.CH.dirty();
    out.base = base; out.stam = G.CH.maxStam();
    out.eff = [10, 15, 20].map(n => G.BAL.eff(n));
    return out;
  });
  const dHp = (a, b2) => at.hp[b2 - 1] - at.hp[a - 1];
  ok('Endurance: +12 health per point to 10', Math.abs(dHp(9, 10) - 12) <= 1, at.hp);
  ok('Endurance: 70% from 11 to 15', Math.abs(dHp(14, 15) - 8.4) <= 1, at.hp);
  ok('Endurance: 40% from 16 to 20', Math.abs(dHp(19, 20) - 4.8) <= 1, at.hp);
  ok('diminishing returns curve (10 / 13.5 / 15.5)', at.eff.join() === '10,13.5,15.5', at.eff);
  ok('Strength raises staff damage', at.staff[19] > at.staff[2] * 1.5, at.staff);
  ok('Agility raises sabre damage and crit', at.sabre[19] > at.sabre[2] * 1.5 && at.crit[19] > at.crit[2], { s: at.sabre, c: at.crit });
  ok('Memory raises tumar-focus damage', at.focus[19] > at.focus[2] * 1.5, at.focus);

  // ---------- upgrades, quality, mods ----------
  const up = await ev(() => {
    const s = G.CH.S(); G.run.gold = 99999;
    const e = G.CH.give('yd_caravan_klych', { q: 2, quiet: true }); G.YITEMS.equip(e.u, 'attack');
    const d0 = G.Combat.playerDmg(G.run.slots.attack, 10);
    G.CH.give('mat_iron', { n: 3, quiet: true }); G.CH.give('mat_bulat', { n: 3, quiet: true }); G.CH.give('mat_bone', { n: 1, quiet: true });
    const steps = [];
    for (let i = 0; i < 5; i++) { G.YITEMS.upgrade(e.u); steps.push(+(G.Combat.playerDmg(G.run.slots.attack, 10) / d0).toFixed(3)); }
    const sixth = G.YITEMS.upgrade(e.u);
    // mods
    G.CH.give('m_ruby', { quiet: true }); G.CH.give('m_lapis', { quiet: true }); G.CH.give('w_black', { quiet: true });
    const sock = [];
    for (const id of ['m_ruby', 'm_lapis', 'w_black']) { const m = s.inv.find(x => x.id === id); sock.push(G.YITEMS.socket(e.u, m.u)); }
    const it = G.run.slots.attack;
    // ruby: bleeding builds; lapis: cold builds; black wax: +1% per 2 Hollowness
    const en = G.world.enemies.find(x => !x.dead && !x.isBoss); en.hp = en.maxHp = 1e6; en.invulnT = 0;
    const pl = G.world.player; pl.x = en.x - 14; pl.facing = 1;
    for (let i = 0; i < 4; i++) G.Combat.hit(pl, en, { dmg: 1, item: it, type: 'melee', dir: 1 });
    const bu = en._bu || {};
    G.YODGOR.set({ void: 0 }); const a = G.Perks.mod('dmgOut', 100, { item: it }, en);
    G.YODGOR.set({ void: 40 }); const bb = G.Perks.mod('dmgOut', 100, { item: it }, en);
    G.YODGOR.set({ void: 0 });
    const out = { steps, sixth, sock, bleed: Math.round((bu.bleed || {}).v || 0), frost: Math.round((bu.frost || {}).v || 0), black: +(bb / a).toFixed(3), mods: it.mods, gold: G.run.gold };
    // unsocket returns the mod
    G.YITEMS.unsocket(e.u, 0); out.after = G.YITEMS.get(e.u).mods.slice(); out.back = G.YITEMS.count('m_ruby');
    return out;
  });
  ok('upgrades +1…+5 add 8% each', JSON.stringify(up.steps) === JSON.stringify([1.08, 1.16, 1.24, 1.32, 1.4]), up.steps);
  ok('no upgrade past +5', up.sixth === false, up.sixth);
  ok('masterwork has two sockets (third refused)', up.sock.join() === 'true,true,false', up.sock);
  ok('blood ruby builds bleeding', up.bleed > 30, up);
  ok('lapis builds cold', up.frost > 20, up);
  ok('mods can be taken out for free', up.after.join() === 'm_lapis' && up.back === 1, up);
  const bw = await ev(() => { const e = G.CH.give('yd_wax_knife', { q: 1, quiet: true }); const m = G.CH.give('w_black', { quiet: true }); G.YITEMS.socket(e.u, G.CH.S().inv.find(x => x.id === 'w_black').u); G.YITEMS.equip(e.u, 'attack'); const it = G.run.slots.attack; G.YODGOR.set({ void: 0 }); const a = G.Perks.mod('dmgOut', 100, { item: it }, {}); G.YODGOR.set({ void: 40 }); const b2 = G.Perks.mod('dmgOut', 100, { item: it }, {}); G.YODGOR.set({ void: 0 }); return +(b2 / a).toFixed(3); });
  ok('black wax: +1% per 2 Hollowness', bw === 1.2, bw);

  // ---------- armour weight and the roll ----------
  const roll = await ev(() => {
    const s = G.CH.S(), cls = () => ({ c: G.CH.rollClass(), I: G.MOVE.rollI, spd: G.MOVE.rollSpd, w: G.CH.weight(), cost: G.CH.rollStats().cost });
    for (const k of ['head', 'body', 'belt', 'boots']) G.YITEMS.unequip(k);
    G.YITEMS.equip(s.inv.find(x => x.id === 'yd_caravan_klych').u, 'attack'); G.YITEMS.unequip('secondary');
    G.world.player.update(); const light = cls();
    for (const id of ['ar_divan_helm', 'ar_divan_lamellar', 'ar_divan_belt', 'ar_divan_greaves']) { const e = G.CH.give(id, { quiet: true }); G.YITEMS.equip(e.u); }
    G.world.player.update(); const heavy = cls();
    const setOn = G.YITEMS.sets().divan;
    for (const k of ['head', 'body', 'belt', 'boots']) G.YITEMS.unequip(k);
    for (const id of ['ar_yodchi_doppi', 'ar_yodchi_chapan', 'ar_yodchi_sash', 'ar_yodchi_boots']) G.YITEMS.equip(s.inv.find(x => x.id === id).u);
    G.YITEMS.equip(s.inv.find(x => x.id === 'kalkan').u, 'secondary');   // the starting kit: sabre, shield, yodchi clothes
    G.world.player.update(); const medium = cls();
    return { light, medium, heavy, setOn, poiseHeavy: 0 };
  });
  ok('weight classes: light / medium / heavy', roll.light.c === 'light' && roll.medium.c === 'medium' && roll.heavy.c === 'heavy', roll);
  ok('heavier armour: shorter, slower, dearer roll', roll.light.I > roll.medium.I && roll.medium.I > roll.heavy.I && roll.light.spd > roll.heavy.spd && roll.heavy.cost > roll.light.cost, roll);

  // ---------- stamina ----------
  const st = await ev(() => {
    G.godMode = false; const pl = G.world.player; G.CH.st.v = G.CH.maxStam();
    const v0 = G.CH.st.v; pl.startRoll(1); const afterRoll = G.CH.st.v;
    G.CH.st.v = 0; G.CH.spend(1);
    const denied = pl.startItem('attack', G.run.slots.attack) === false;
    G.godMode = true; return { v0, afterRoll, denied, lock: G.CH.st.lock };
  });
  ok('a roll costs stamina', st.afterRoll < st.v0, st);
  ok('no stamina: attacks refused, rolls locked for a second', st.denied && st.lock >= 50, st);

  // ---------- caps ----------
  const cap = await ev(() => {
    const s = G.CH.S(), pl = G.world.player;
    // stack every damage reduction we have
    for (const id of ['b_chapan', 'b_chapan']) G.PROG.buyY(id, true);
    for (const id of ['ch_steel', 'ch_stone']) { const e = G.CH.give(id, { quiet: true }); G.YITEMS.equip(e.u); }
    for (const id of ['ar_divan_helm', 'ar_divan_lamellar', 'ar_divan_belt', 'ar_divan_greaves']) G.YITEMS.equip(s.inv.find(x => x.id === id).u);
    G.run.perks.push('stone_skin'); G.CH.dirty();
    const m = G.Perks.mod('dmgIn', 1, { dmg: 10, type: 'melee' });
    const salt = G.CH.give('ch_salt', { quiet: true }); G.YITEMS.equip(salt.u, 'charm1'); const a2 = G.CH.give('it_antidote', { quiet: true }); G.YITEMS.use(a2.u);
    const res = G.CH.res('poison');
    G.run.perks.splice(G.run.perks.indexOf('stone_skin'), 1); G.CH.S().sk = {}; G.CH.dirty();
    return { m: +m.toFixed(3), res };
  });
  ok('damage reduction never above 60%', cap.m >= 0.4 - 1e-9, cap);
  ok('resistances never above 60%', cap.res <= 0.6 + 1e-9, cap);

  // ---------- no scrolls ----------
  const sc = await ev(async () => {
    const found = [];
    for (const pi of [0, 3, 7, 14, 26]) {
      G.Game.loadStage(pi); await new Promise(r => setTimeout(r, 80));
      for (const o of G.world.interactables) if (o.art === 'scroll' || /Свиток/.test(o.prompt || '')) found.push(pi + ':' + o.art);
    }
    // drops never hand out a scroll and never ask for a colour
    const drops = []; for (let i = 0; i < 300; i++) { const it = G.Items.randomDrop(5); drops.push(it && it.def.kind); }
    G.Game.loadStage(2); await new Promise(r => setTimeout(r, 80));
    const rugs = G.world.interactables.filter(o => o.art === 'shopRug').map(o => o.item ? o.item.id + ':' + o.price : 'plov:' + o.price);
    return { found, kinds: [...new Set(drops)], caches: 0, rugs };
  });
  ok('no scroll objects in lands', sc.found.length === 0, sc.found);
  ok('drops are our items', sc.kinds.every(k => ['ydm', 'ydcast', 'shield', 'bow', 'sling', 'gun', 'ydgear', 'skill', 'throw'].includes(k)), sc.kinds);
  R.shopRugs = sc.rugs;

  // ---------- save -> load ----------
  const sv = await ev(async () => {
    G.Game.loadStage(3); await new Promise(r => setTimeout(r, 150));
    const s = G.CH.S();
    const e = s.inv.find(x => x.id === 'yd_caravan_klych'); G.YITEMS.equip(e.u, 'attack');
    G.PROG.buyY('c_hand', true); G.PROG.buyY('s_spark', true);
    G.CH.addAttr('mem', 2);
    const snap = () => { const c = G.CH.S(); return JSON.stringify({ lvl: c.lvl, xp: c.xp, attr: c.attr, bonus: c.bonus, free: c.free, sk: c.sk, inv: c.inv.map(x => [x.id, x.q, x.up, x.mods, x.n]), eq: c.eq, slots: Object.values(G.run.slots).map(x => x && [x.id, x.up, x.q, (x.mods || []).join()]) }); };
    // checkpoint = start of a land: reload this land so it is written, then save into slot 3
    G.Game.loadStage(3); await new Promise(r => setTimeout(r, 150));
    const before = snap();
    localStorage.setItem('yodgor2_slot_3', JSON.stringify(G.YODGOR.checkpoint));
    // wreck the state, then load the slot
    G.CH.S().inv.length = 0; G.CH.S().lvl = 1;
    const c = JSON.parse(localStorage.getItem('yodgor2_slot_3'));
    G.YODGOR.continueRun(c); await new Promise(r => setTimeout(r, 300));
    const after = snap();
    return { same: before === after, before: before.slice(0, 300), after: after.slice(0, 300) };
  });
  ok('save → load restores level, attributes, nodes, inventory, upgrades, mods and slots', sv.same, sv);

  R.errs = p._errs;
  console.log(JSON.stringify(R, null, 1));
  console.log(bad.length ? 'FAILED: ' + bad.join('; ') : 'ALL OK');
  await b.close();
  process.exit(bad.length || p._errs.length ? 1 : 0);
})();
