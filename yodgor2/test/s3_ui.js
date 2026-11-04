// Stage 3: the character screens with keyboard and mouse (and the pause-menu entry).   node test/s3_ui.js
const L = require('./s3_lib');
(async () => {
  const b = await L.chromium.launch();
  const p = await L.open(b, '?stage=2&god');
  await L.tick(p, 40);
  const drain = async () => { for (let i = 0; i < 300; i++) { await L.tick(p, 8); const m = await L.modal(p); if (!m) { await L.tick(p, 10); if (!(await L.modal(p))) return; continue; } if (m.type === 'choice') { await L.tick(p, 14); await p.evaluate(() => { G.UI._debug().modal.sel = 0; }); } await L.press(p, 'Enter'); await L.press(p, 'Enter'); } };
  await drain(); await L.tick(p, 200); await drain();
  const R = {}, bad = [];
  const ok = (n, c, info) => { R[n] = c ? 'ok' : 'FAIL ' + JSON.stringify(info); if (!c) bad.push(n); };
  const st = () => p.evaluate(() => ({ open: G.CHUI.open, page: G.CHUI.page, tab: G.CHUI.tab, sel: G.CHUI.sel, zone: G.CHUI.zone, menu: !!G.CHUI.menu, attack: G.run.slots.attack && G.run.slots.attack.id, second: G.run.slots.secondary && G.run.slots.secondary.id, modal: !!G.UI._debug().modal }));
  await p.evaluate(() => { G.CH.addXp(5000); G.CH.give('yd_caravan_klych', { quiet: true }); G.CH.give('sadak', { quiet: true }); });
  // keyboard
  await L.press(p, 'KeyI'); await L.tick(p, 6);
  let s = await st(); ok('I opens the equipment page and pauses the world', s.open && s.page === 'inv' && s.modal, s);
  const t0 = await p.evaluate(() => G.Game.stage.t); await L.tick(p, 30); const t1 = await p.evaluate(() => G.Game.stage.t);
  ok('the world is paused', t1 === t0, [t0, t1]);
  for (let i = 0; i < 8; i++) { const id = await p.evaluate(() => { const e = G.CHUI.selEntry(); return e && e.id; }); if (id === 'yd_caravan_klych') break; await L.press(p, 'ArrowRight'); }
  await L.press(p, 'Enter'); await L.tick(p, 4);
  s = await st(); ok('Enter on a weapon opens its actions', s.menu, s);
  await L.press(p, 'Enter'); await L.tick(p, 4);
  s = await st(); ok('first action equips it in the main hand', s.attack === 'yd_caravan_klych' && !s.menu, s);
  await L.press(p, 'KeyE'); await L.tick(p, 3); s = await st(); ok('E switches the category tab', s.tab === 1, s);
  await L.press(p, 'KeyQ'); await L.tick(p, 3);
  await L.press(p, 'Tab'); await L.tick(p, 3); s = await st(); ok('Tab goes to the character page', s.page === 'char', s);
  const a0 = await p.evaluate(() => G.CH.attrs().str);
  await L.press(p, 'ArrowRight'); await L.press(p, 'ArrowRight'); await L.press(p, 'KeyV'); await L.tick(p, 3);
  const a1 = await p.evaluate(() => G.CH.attrs().str);
  ok('→ → V adds two points of Strength', a1 === a0 + 2, [a0, a1]);
  await L.press(p, 'KeyT'); await L.tick(p, 4); s = await st(); ok('T jumps to the skills page', s.page === 'skills', s);
  await p.evaluate(() => { G.CHUI.skSel = 0; }); await L.press(p, 'Enter'); await L.tick(p, 3);
  ok('Enter learns the selected node', await p.evaluate(() => G.PROG.rank('c_hand') === 1), null);
  await L.press(p, 'Escape'); await L.tick(p, 20); s = await st(); ok('Esc closes; the world runs again', !s.open && !s.modal, s);
  // mouse
  await L.press(p, 'KeyI'); await L.tick(p, 8);
  const box = await p.evaluate(() => { const c = document.getElementById('game').getBoundingClientRect(); return { x: c.left, y: c.top, k: c.width / 480 }; });
  const at = (x, y) => [box.x + x * box.k, box.y + y * box.k];
  // grid cell (col 2, row 0): x 162 + 2*24 + 11, y 64 + 11
  let [mx, my] = at(162 + 24 + 11, 64 + 11);
  await p.mouse.move(mx, my); await L.tick(p, 3);
  s = await st(); ok('hovering a cell selects it', s.zone === 'grid' && s.sel === 1, s);
  await p.mouse.click(mx, my); await L.tick(p, 4);
  s = await st(); ok('clicking a cell opens its actions', s.menu, s);
  // click the second action (equip second) in the menu: menu at x 186, first row y≈ cl(110-h/2)+6
  const menu = await p.evaluate(() => { const M = G.CHUI.menu; const h = M.A.length * 10 + 12; return { y: Math.max(40, Math.min(110 - h / 2, 270 - h - 24)), n: M.A.length, labels: M.A.map(a => a.k) }; });
  const row = menu.labels.indexOf('eqB');
  [mx, my] = at(186 + 40, menu.y + 6 + row * 10 + 4);
  await p.mouse.click(mx, my); await L.tick(p, 4);
  s = await st(); ok('clicking “Equip: second” puts it in the second slot', s.second && !s.menu, Object.assign(s, menu));
  // right click on the equipped second slot (x 126, y 78) takes it off
  [mx, my] = at(126 + 11, 78 + 11);
  await p.mouse.click(mx, my, { button: 'right' }); await L.tick(p, 4);
  s = await st(); ok('right click on a worn slot takes it off', !s.second, s);
  // page plates
  [mx, my] = at(240, 21);
  await p.mouse.click(mx, my); await L.tick(p, 4); s = await st(); ok('clicking the CHARACTER plate switches page', s.page === 'char', s);
  // + button for Agility (row 1): x 266..275, y 59+38+3
  const g0 = await p.evaluate(() => G.CH.attrs().agi);
  [mx, my] = at(270, 59 + 38 + 7); await p.mouse.click(mx, my); await L.tick(p, 3);
  [mx, my] = at(168 + 26, 214 + 7); await p.mouse.click(mx, my); await L.tick(p, 3);
  ok('mouse: + then Confirm adds Agility', (await p.evaluate(() => G.CH.attrs().agi)) === g0 + 1, g0);
  await L.press(p, 'Escape'); await L.tick(p, 20);
  // pause menu → Equipment
  await L.press(p, 'Escape'); await L.tick(p, 20);
  const labels = await p.evaluate(() => G.UI._debug().modal ? null : null);
  await p.evaluate(() => { const m = G.UI._debug().modal; if (m) m.sel = 4; }); await L.press(p, 'Enter'); await L.tick(p, 40); await p.waitForTimeout(400); await L.tick(p, 10);
  s = await st(); ok('pause menu → Equipment opens the screens', s.open && s.page === 'inv', s);
  await L.press(p, 'Escape'); await L.tick(p, 20);
  R.errs = p._errs;
  console.log(JSON.stringify(R, null, 1));
  console.log(bad.length ? 'FAILED: ' + bad.join('; ') : 'UI OK (keyboard, mouse, pause menu)');
  await b.close();
  process.exit(bad.length ? 1 : 0);
})();
