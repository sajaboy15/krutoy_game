// Stage 3 screenshots at 1920×1080: equipment, character, skills (three branches + Sado), every weapon
// category in hand, legendaries, armour sets on the hero.   node test/s3_shots.js [lang]
const L = require('./lib');
const path = require('path');
const lang = process.argv[2] || 'en';
(async () => {
  const b = await L.chromium.launch();
  const p = await b.newPage({ viewport: { width: 480, height: 270 } });
  p.setDefaultTimeout(400000);
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  const url = 'file://' + path.join(process.env.YODGOR_OUT || path.join(__dirname, '..', 'dist'), 'standalone.html');
  await p.goto(url + '?stage=2&god', { timeout: 400000 });
  await p.waitForTimeout(1500);
  await p.evaluate(l => { const g = document.getElementById('gate'); if (g) g.hidden = true; G.LANG.set(l); }, lang);
  const tick = n => p.evaluate(n => G.debugTick(n), n);
  // everything runs at a tiny viewport; only the captures are taken at 1920×1080
  const big = async on => { await p.setViewportSize(on ? { width: 1920, height: 1080 } : { width: 480, height: 270 }); await p.waitForTimeout(200); await p.evaluate(() => G.debugTick(1)); };
  const shot = async (name, clip) => { await big(true); await p.screenshot({ path: path.join(L.out, 's3_' + name + '_' + lang + '.png'), clip, timeout: 600000 }); await big(false); };
  // let every scene play out (choices: the first), until the land is quiet for a while
  const quiet = async () => {
    let calm = 0;
    for (let i = 0; i < 900 && calm < 12; i++) {
      await tick(10);
      const m = await L.modal(p);
      if (!m || (m.type === 'choice' && m.title === '' && (m.options || [])[0] === ' ')) { calm++; continue; }
      calm = 0;
      if (m.type === 'choice') { await tick(14); await p.evaluate(() => { G.UI._debug().modal.sel = 0; }); }
      await p.keyboard.press('Enter'); await tick(4); await p.keyboard.press('Enter');
    }
  };
  await tick(40); await quiet(); await tick(300); await quiet();
  // a well-travelled yodchi: level 16, a full satchel
  await p.evaluate(() => {
    G.CH.addXp(46000);
    const s = G.CH.S(); for (const [k, v] of [['str', 6], ['agi', 9], ['end', 5], ['mem', 4]]) for (let i = 0; i < v; i++) G.CH.addPoint(k);
    const give = (id, q, up, n) => G.CH.give(id, { q: q || 0, up: up || 0, n: n || 1, quiet: true });
    for (const id of ['yd_caravan_klych', 'muz_kylysh', 'yd_divan_glaive', 'kanjar', 'yd_hook_knife', 'yd_guard_mace', 'yd_divan_shield', 'sadak', 'multuk', 'yd_bakhshi_dutar', 'yd_singer_doira', 'yd_ash_tumar']) give(id, Math.floor(Math.random() * 3), Math.floor(Math.random() * 4));
    for (const id of ['ar_divan_helm', 'ar_divan_lamellar', 'ar_divan_belt', 'ar_divan_greaves', 'ar_singer_robe', 'ar_ash_cloak', 'ar_caravan_turban', 'ar_quilted_chapan', 'ar_herbalist_belt']) give(id, Math.floor(Math.random() * 2));
    for (const id of ['ch_count', 'ch_blood', 'ch_wind', 'ch_silence', 'ch_dream', 'ch_shepherd']) give(id);
    for (const [id, n] of [['mat_iron', 4], ['mat_bulat', 2], ['mat_bone', 1], ['m_ruby', 1], ['w_oil', 1], ['m_lapis', 1], ['it_plov', 2], ['it_samsa', 1], ['it_bitter_tea', 1], ['tu_memory', 3]]) give(id, 0, 0, n);
    G.CH.grantLegend('rustam'); G.CH.grantLegend('turab'); G.CH.grantLegend('first_wax');
    for (const id of ['c_hand', 'c_hand', 'c_knock', 'c_eye', 'c_count', 'b_route', 'b_roll', 'b_chapan', 's_spark', 's_wax']) G.PROG.buyY(id, true);
    const e = s.inv.find(x => x.id === 'muz_kylysh'); e.q = 2; e.up = 3; e.mods = ['m_lapis']; G.YITEMS.equip(e.u, 'attack');
    G.YITEMS.equip(s.inv.find(x => x.id === 'ch_wind').u, 'charm1'); G.YITEMS.equip(s.inv.find(x => x.id === 'ch_count').u, 'charm2');
    G.run.gold = 1840; G.YODGOR.set({ void: 34 });
  });
  await tick(20);
  // the three screens
  await p.keyboard.press('KeyI'); await tick(12); await p.keyboard.press('ArrowRight'); await tick(6);
  await shot('inventory');
  await p.keyboard.press('KeyE'); await tick(4); await p.keyboard.press('ArrowRight'); await tick(4); await shot('inventory_armour');
  await p.keyboard.press('KeyC'); await tick(10); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await tick(6); await shot('character');
  await p.keyboard.press('KeyT'); await tick(10);
  for (const [i, n] of [[0, 'skills_collection'], [13, 'skills_backbone'], [26, 'skills_song']]) { await p.evaluate(i => { G.CHUI.skSel = i; }, i); await tick(4); await shot(n); }
  await p.keyboard.press('KeyE'); await tick(6); await shot('skills_sado');
  await p.keyboard.press('Escape'); await tick(30);
  // the smith's view
  await p.evaluate(() => G.INV_OPEN({ smith: true })); await tick(12); await p.keyboard.press('ArrowRight'); await tick(4); await shot('smith');
  await p.keyboard.press('Escape'); await tick(30);
  if (process.env.S3_UI_ONLY) { console.log(JSON.stringify({ errs })); await b.close(); return; }
  // weapons in hand: one per category, mid-swing, cropped around the hero (in the Tail)
  await p.evaluate(() => G.Game.loadStage(3)); await tick(60); await quiet(); await tick(300); await quiet();
  const crop = async name => {
    await big(true);
    const c = await p.evaluate(() => { const pl = G.world.player, k = 1920 / 480; return { x: Math.max(0, (pl.x - G.cam.rx - 60) * k), y: Math.max(0, (pl.y - G.cam.ry - 70) * k), w: 120 * k, h: 90 * k }; });
    await p.screenshot({ path: path.join(L.out, 's3_' + name + '_' + lang + '.png'), clip: { x: c.x, y: c.y, width: c.w, height: c.h }, timeout: 600000 });
    await big(false);
  };
  const swing = async (id, o) => {
    o = o || {};
    await p.evaluate(([id, o]) => {
      const s = G.CH.S(); let e = s.inv.find(x => x.id === id);
      if (!e) e = G.CH.give(id, { q: o.q || 2, up: o.up || 2, quiet: true });
      G.YITEMS.equip(e.u, 'attack'); G.world.enemies.forEach(en => { en.x = -9999; });
      const pl = G.world.player; pl.facing = 1; pl.vx = 0;
    }, [id, o]);
    await tick(30);
    await p.keyboard.down('KeyJ'); await tick(o.hold || 2); await p.keyboard.up('KeyJ'); await tick(o.at || 9);
  };
  for (const [id, name, o] of [['muz_kylysh', 'hand_sabre'], ['yd_divan_glaive', 'hand_staff'], ['kanjar', 'hand_knife'], ['yd_guard_mace', 'hand_mace'], ['sadak', 'hand_bow', { at: 8 }], ['multuk', 'hand_crossbow', { at: 20 }], ['sopak', 'hand_sling', { at: 12 }], ['yd_bakhshi_dutar', 'hand_dutar', { at: 8 }], ['yd_singer_doira', 'hand_drum', { at: 10 }], ['yd_ash_tumar', 'hand_focus', { at: 6 }], ['leg_rustam_staff', 'legend_rustam_charged', { hold: 30, at: 10 }], ['leg_turab_dutar', 'legend_turab', { at: 8 }], ['leg_first_wax', 'legend_first_wax', { at: 5 }]]) {
    await swing(id, o); await crop(name);
  }
  // shield raised
  await p.evaluate(() => { const s = G.CH.S(); const e = s.inv.find(x => x.id === 'yd_divan_shield'); G.YITEMS.equip(e.u, 'secondary'); });
  await tick(10); await p.keyboard.down('KeyK'); await tick(14); await crop('hand_shield'); await p.keyboard.up('KeyK'); await tick(20);
  // all legendaries in the satchel
  await p.evaluate(() => { for (const k in G.CH.LEGENDS) G.CH.grantLegend(k); G.YODGOR.set({ f: { oydin: 1 } }); });
  await p.keyboard.press('KeyI'); await tick(12); await p.evaluate(() => { G.CHUI.tab = 0; G.CHUI.zone = 'grid'; const L2 = G.CH.S().inv; G.CHUI.sel = 0; }); await tick(4);
  await p.evaluate(() => { const items = G.CH.S().inv.filter(e => G.Items.defs[e.id].yd && G.Items.defs[e.id].yd.legend); const all = []; }); await shot('legendaries');
  await p.keyboard.press('Escape'); await tick(30);
  // armour sets on the hero
  for (const set of ['yodchi', 'divan', 'singers', 'ash', 'caravan', 'smuggler']) {
    await p.evaluate(set => {
      const s = G.CH.S(), pfx = { yodchi: 'ar_yodchi_', divan: 'ar_divan_', singers: 'ar_singer_', ash: 'ar_ash_', caravan: 'ar_caravan_', smuggler: 'ar_smug_' }[set];
      for (const id in G.Items.defs) if (id.startsWith(pfx)) { let e = s.inv.find(x => x.id === id); if (!e) e = G.CH.give(id, { quiet: true }); G.YITEMS.equip(e.u); }
      const pl = G.world.player; pl.facing = 1; pl.act = null;
    }, set);
    await tick(24); await crop('armour_' + set);
  }
  console.log(JSON.stringify({ errs }));
  await b.close();
})();
