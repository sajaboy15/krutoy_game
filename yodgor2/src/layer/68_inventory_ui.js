/* =====================================================================
   The character screens (GDD ch. 14): EQUIPMENT [I] · CHARACTER [C] ·
   SKILLS [T]. One overlay with three pages, drawn in the style of
   98_ui_art.js (majolica tiles, gold rules, girih, serif titles) on the
   HD layer, pixel icons scaled crisp.
   Keyboard: arrows/WASD move · Enter/Space choose · Esc back · Q/E inner
   tabs · Tab / Shift+Tab pages · I C T jump · X unequip/sell · R respec.
   Mouse: hover, click, right-click (unequip/back), wheel. Gamepad: d-pad /
   stick, A, B, X, Y, LB/RB tabs, LT/RT pages, Start close.
   The world is paused with an empty engine choice underneath (as the old
   tree did); engine input is muted while the screens are open.
   ===================================================================== */
{
  const YI = G.YITEMS, CH = G.CH, PR = G.PROG, ID = G.Items.defs;
  const UI = G.CHUI = { open: false, page: 'inv', tab: 0, sel: 0, scroll: 0, zone: 'grid', eqSel: 0, menu: null, msg: '', msgT: 0, t: 0, smith: false,
    attrSel: 0, pend: { str: 0, agi: 0, end: 0, mem: 0 }, charZone: 'attr', respecArm: 0, skTab: 0, skSel: 0, hover: null, mx: -1, my: -1 };
  const PAGES = ['inv', 'char', 'skills'];
  const PAGE_NAME = { inv: `Equipment|Снаряжение|Jihozlar`, char: `Character|Персонаж|Qahramon`, skills: `Skills|Умения|Mahoratlar` };
  const PAGE_KEY = { inv: 'I', char: 'C', skills: 'T' };
  // [stage 7 hook] extra pages (86–88_party.js): UI.EXT[page] = { draw(ctx, HIT, api), key(c, shift), help() }, UI.EXT_KEY[code] = page
  UI.PAGES = PAGES; UI.PAGE_NAME = PAGE_NAME; UI.PAGE_KEY = PAGE_KEY; UI.EXT = {}; UI.EXT_KEY = {};
  try { LANG._ui['Снаряжение'] = ['Equipment', 'Jihozlar']; } catch (e) { /* ignore */ }
  const TABS = [
    { key: 'weapon', name: `Weapons|Оружие|Qurollar`, types: ['weapon'] },
    { key: 'armour', name: `Armour|Броня|Sovut`, types: ['armour'] },
    { key: 'charm', name: `Charms|Обереги|Himoya tumarlari`, types: ['charm'] },
    { key: 'tumar', name: `Tumars|Тумары|Tumarlar`, types: ['tumar', 'skill'] },
    { key: 'cons', name: `Consumables|Припасы|Sarf buyumlari`, types: ['consumable'] },
    { key: 'mat', name: `Materials|Материалы|Materiallar`, types: ['material', 'mod'] },
    { key: 'key', name: `Key|Важное|Muhim`, types: ['key'] }
  ];
  TABS[2].name = `Charms|Обереги|Himoya tumarlari`;
  const EQ = [
    { k: 'head', name: `Head|Голова|Bosh`, x: 22, y: 50, tab: 1 }, { k: 'body', name: `Body|Тело|Tana`, x: 22, y: 78, tab: 1 },
    { k: 'belt', name: `Belt|Пояс|Kamar`, x: 22, y: 106, tab: 1 }, { k: 'boots', name: `Boots|Сапоги|Etik`, x: 22, y: 134, tab: 1 },
    { k: 'attack', name: `Main · J|Основное · J|Asosiy · J`, x: 126, y: 50, tab: 0 }, { k: 'secondary', name: `Second · K|Второе · K|Ikkinchi · K`, x: 126, y: 78, tab: 0 },
    { k: 'skill1', name: `Technique · Q|Приём · Q|Usul · Q`, x: 126, y: 106, tab: 3 }, { k: 'skill2', name: `Technique · E|Приём · E|Usul · E`, x: 126, y: 134, tab: 3 },
    { k: 'charm1', name: `Charm|Оберег|Tumar`, x: 56, y: 162, tab: 2 }, { k: 'charm2', name: `Charm|Оберег|Tumar`, x: 92, y: 162, tab: 2 }
  ];
  const pl = () => (G.world && G.world.player) || null;
  const SERIF = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, "DejaVu Serif", serif';
  const SANS = G.FONT_UI || '"Rubik", "Trebuchet MS", sans-serif';
  const K = () => Math.max(1, Math.min(6, G.uiScale || (G.hud ? G.hud.width / G.UW : 2)));
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  const COL = { ink: '#07040a', gold: '#e2b452', goldL: '#ffe7a6', goldD: '#7a5420', cob: '#1d4c9a', cobD: '#0c2350', turq: '#2fb3b8', turqL: '#8ff0e8', white: '#eef3ec', cream: '#f2e6c8', dim: '#9a8c9e', bad: '#ff8a7a', good: '#9cf0a0', red: '#a8323a' };
  const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };

  /* ================================================================ ornament (after 98_ui_art.js) */
  const CACHE = new Map();
  function baked(key, w, h, paint) {
    const k = K(), id = key + '@' + k;
    let c = CACHE.get(id);
    if (c) return c;
    c = document.createElement('canvas'); c.width = Math.ceil(w * k); c.height = Math.ceil(h * k); c.uw = w; c.uh = h;
    const x = c.getContext('2d'); x.scale(k, k);
    try { paint(x, w, h); } catch (e) { console.error('[chui]', key, e); }
    CACHE.set(id, c);
    if (CACHE.size > 120) CACHE.delete(CACHE.keys().next().value);
    return c;
  }
  function star8(c, x, y, r, fill, stroke, lw) {
    c.beginPath();
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, rr = i & 1 ? r * 0.62 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 0.4; c.stroke(); }
  }
  function rosette(c, x, y, r) { star8(c, x, y, r + 0.6, COL.ink); star8(c, x, y, r, COL.gold, COL.goldD, 0.3); star8(c, x, y, r * 0.55, COL.turq); c.fillStyle = COL.goldL; c.beginPath(); c.arc(x - r * 0.12, y - r * 0.12, r * 0.18, 0, 6.3); c.fill(); }
  function diamond(c, x, y, r, fill) { c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath(); c.fillStyle = fill; c.fill(); }
  function tileBand(c, x0, y, x1, h) {
    c.save(); c.beginPath(); c.rect(x0, y, x1 - x0, h); c.clip();
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, COL.cob); g.addColorStop(1, COL.cobD);
    c.fillStyle = g; c.fillRect(x0, y, x1 - x0, h);
    const s = h * 1.15;
    for (let x = x0 + s / 2, i = 0; x < x1 + s; x += s, i++) {
      const cy = y + h / 2;
      c.fillStyle = i & 1 ? COL.turq : COL.white;
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; c.beginPath(); c.ellipse(x + Math.cos(a) * h * 0.2, cy + Math.sin(a) * h * 0.2, h * 0.2, h * 0.09, a, 0, 6.3); c.fill(); }
      c.fillStyle = COL.gold; c.beginPath(); c.arc(x, cy, h * 0.09, 0, 6.3); c.fill();
      diamond(c, x + s / 2, cy, h * 0.16, i & 1 ? COL.white : COL.turq);
    }
    c.restore();
  }
  function girih(c, x0, y0, w, h, step, col, lw) {
    c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
    c.strokeStyle = col; c.lineWidth = lw || 0.3;
    for (let y = y0 - step; y < y0 + h + step; y += step) for (let x = x0 - step; x < x0 + w + step; x += step) {
      const cx = x + ((Math.round((y - y0) / step) & 1) ? step / 2 : 0);
      star8(c, cx, y, step * 0.34, null, col, lw);
      c.beginPath(); c.moveTo(cx + step * 0.34, y); c.lineTo(cx + step * 0.66, y); c.stroke();
    }
    c.restore();
  }
  function goldRule(c, x0, y, x1, w) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, COL.goldD); g.addColorStop(0.5, COL.goldL); g.addColorStop(1, COL.goldD); c.fillStyle = g; c.fillRect(x0, y, x1 - x0, w || 0.6); }
  function chamfer(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.lineTo(x + w, y + r); c.lineTo(x + w, y + h - r); c.lineTo(x + w - r, y + h); c.lineTo(x + r, y + h); c.lineTo(x, y + h - r); c.lineTo(x, y + r); c.closePath(); }
  // big panel with a tile band and rosettes
  function panel(ctx, x, y, w, h, o) {
    o = o || {};
    const m = 6;
    const c = baked('p' + w + 'x' + h + (o.band ? 'b' : '') + (o.tone || ''), w + 2 * m, h + 2 * m, cc => {
      cc.save(); cc.filter = `blur(${2.5 * K()}px)`; cc.fillStyle = 'rgba(0,0,0,0.7)'; chamfer(cc, m - 1, m + 1.5, w + 2, h + 1, 3); cc.fill(); cc.restore();
      chamfer(cc, m, m, w, h, 3); cc.fillStyle = COL.ink; cc.fill();
      chamfer(cc, m + 0.8, m + 0.8, w - 1.6, h - 1.6, 2.4);
      const g = cc.createLinearGradient(0, m, 0, m + h);
      const T2 = o.tone === 'dark' ? ['#1a1224', '#120c1a', '#0a0610'] : o.tone === 'warm' ? ['#2a1c1a', '#1a1014', '#0d0810'] : ['#231a33', '#170f22', '#0d0814'];
      g.addColorStop(0, T2[0]); g.addColorStop(0.45, T2[1]); g.addColorStop(1, T2[2]); cc.fillStyle = g; cc.fill();
      cc.save(); cc.clip(); girih(cc, m, m, w, h, 9, 'rgba(226,180,82,0.05)', 0.35);
      const rg = cc.createRadialGradient(m + w * 0.3, m, 0, m + w * 0.3, m, w * 0.7); rg.addColorStop(0, 'rgba(255,220,160,0.07)'); rg.addColorStop(1, 'rgba(255,220,160,0)'); cc.fillStyle = rg; cc.fillRect(m, m, w, h);
      cc.restore();
      cc.lineWidth = 0.55; cc.strokeStyle = COL.gold; chamfer(cc, m + 1.6, m + 1.6, w - 3.2, h - 3.2, 2); cc.stroke();
      cc.lineWidth = 0.3; cc.strokeStyle = rgba(COL.gold, 0.45); chamfer(cc, m + 2.8, m + 2.8, w - 5.6, h - 5.6, 1.6); cc.stroke();
      if (o.band) { tileBand(cc, m + 6, m - 0.2, m + w - 6, 3.2); goldRule(cc, m + 6, m - 0.8, m + w - 6, 0.6); goldRule(cc, m + 6, m + 3, m + w - 6, 0.5); }
      for (const [px, py] of [[m + 2.2, m + 2.2], [m + w - 2.2, m + 2.2], [m + 2.2, m + h - 2.2], [m + w - 2.2, m + h - 2.2]]) rosette(cc, px, py, 2.6);
      diamond(cc, m + w / 2, m + h - 0.4, 1.8, COL.ink); diamond(cc, m + w / 2, m + h - 0.4, 1.3, COL.gold); diamond(cc, m + w / 2, m + h - 0.4, 0.6, COL.turq);
    });
    ctx.drawImage(c, x - m, y - m, c.uw, c.uh);
  }
  // small inset (cells, boxes)
  function inset(ctx, x, y, w, h, o) {
    o = o || {};
    ctx.save();
    chamfer(ctx, x, y, w, h, 1.4); ctx.fillStyle = o.fill || 'rgba(8,5,12,0.82)'; ctx.fill();
    ctx.lineWidth = o.lw || 0.45; ctx.strokeStyle = o.stroke || rgba(COL.gold, 0.35); ctx.stroke();
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = 4; ctx.lineWidth = 0.8; ctx.strokeStyle = o.glow; chamfer(ctx, x, y, w, h, 1.4); ctx.stroke(); }
    ctx.restore();
  }
  // a name plate (pointed ends)
  function plate(ctx, x, y, w, col, on) {
    const h = 12;
    const c = baked('pl' + Math.round(w) + col + (on ? 1 : 0), w + 8, h + 8, cc => {
      const X0 = 4, Y0 = 4;
      const P = dx => { cc.beginPath(); cc.moveTo(X0 + dx, Y0 + h / 2); cc.lineTo(X0 + 5 + dx * 0.4, Y0 + dx * 0.4); cc.lineTo(X0 + w - 5 - dx * 0.4, Y0 + dx * 0.4); cc.lineTo(X0 + w - dx, Y0 + h / 2); cc.lineTo(X0 + w - 5 - dx * 0.4, Y0 + h - dx * 0.4); cc.lineTo(X0 + 5 + dx * 0.4, Y0 + h - dx * 0.4); cc.closePath(); };
      P(0); cc.fillStyle = COL.ink; cc.fill();
      P(0.8); const g = cc.createLinearGradient(0, Y0, 0, Y0 + h); g.addColorStop(0, mix(col, '#ffffff', on ? 0.2 : 0.08)); g.addColorStop(0.5, col); g.addColorStop(1, mix(col, '#000000', 0.45)); cc.fillStyle = g; cc.fill();
      cc.lineWidth = on ? 0.7 : 0.45; cc.strokeStyle = on ? COL.goldL : rgba(COL.gold, 0.6); P(1.5); cc.stroke();
      if (on) { diamond(cc, X0 + 2.6, Y0 + h / 2, 1.3, COL.goldL); diamond(cc, X0 + w - 2.6, Y0 + h / 2, 1.3, COL.goldL); }
    });
    ctx.drawImage(c, x - 4, y - 4, c.uw, c.uh);
  }
  /* ---------- text ---------- */
  function font(o) { return `${o.style || ''} ${o.weight || 400} ${o.size || 6}px ${o.serif ? SERIF : SANS}`; }
  // text is baked once per string, style and screen scale (fillText is slow on software canvases)
  const TC = new Map();
  let MC = null;
  function txt(ctx, s, x, y, o) {
    o = o || {}; s = String(s == null ? '' : s);
    if (!s) return 0;
    const k = K(), f = font(o), col = o.color || COL.cream, sh = o.shadow !== false;
    const key = s + '\u0001' + f + col + (sh ? 1 : 0) + '@' + k;
    let c = TC.get(key);
    if (!c) {
      if (!MC) MC = document.createElement('canvas').getContext('2d');
      MC.font = f;
      const tw = MC.measureText(s).width, w = Math.ceil(tw) + 3, h = Math.ceil((o.size || 6) * 1.55) + 2;
      c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w * k)); c.height = Math.max(1, Math.ceil(h * k)); c.uw = w; c.uh = h; c.tw = tw;
      const x2 = c.getContext('2d'); x2.scale(k, k); x2.font = f; x2.textBaseline = 'top';
      if (sh) { x2.fillStyle = 'rgba(0,0,0,0.75)'; x2.fillText(s, 1.35, 1.45); }
      x2.fillStyle = col; x2.fillText(s, 1, 1);
      TC.set(key, c);
      if (TC.size > 1600) TC.delete(TC.keys().next().value);
    }
    const ax = o.align === 'center' ? x - c.tw / 2 : o.align === 'right' ? x - c.tw : x;
    ctx.drawImage(c, ax - 1, y - 1, c.uw, c.uh);
    return c.tw;
  }
  const WRAP = new Map();
  function wrap(ctx, s, w, o) {
    const key = s + '|' + w + '|' + font(o);
    let L = WRAP.get(key);
    if (L) return L;
    ctx.font = font(o);
    L = [];
    for (const para of String(s).split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        const tr = line ? line + ' ' + word : word;
        if (ctx.measureText(tr).width > w && line) { L.push(line); line = word; } else line = tr;
      }
      L.push(line);
    }
    if (WRAP.size > 600) WRAP.clear();
    WRAP.set(key, L);
    return L;
  }
  function para(ctx, s, x, y, w, o) {
    o = o || {}; const lh = o.lh || (o.size || 6) * 1.32;
    const L = wrap(ctx, s, w, o);
    const n = o.maxLines ? Math.min(o.maxLines, L.length) : L.length;
    for (let i = 0; i < n; i++) txt(ctx, L[i], x, y + i * lh, o);
    return n * lh;
  }
  function icon(ctx, def, item, x, y, size) {
    if (!def || !def.icon) return;
    ctx.save(); ctx.translate(x, y); ctx.imageSmoothingEnabled = false;
    try { def.icon(ctx, size || 16, item || { def }); } catch (e) { /* ignore */ }
    ctx.restore();
  }

  /* ================================================================ state helpers */
  const S = () => CH.S();
  const typeOf = id => YI.typeOf(id);
  const qcol = e => YI.QUAL[(e && e.q) || 0].col;
  const nameOf = e => LANG.T(ID[e.id].name) + (e.up ? ' +' + e.up : '');
  const itemsOf = tab => {
    const T2 = TABS[tab].types, s = S();
    const L = s.inv.filter(e => ID[e.id] && T2.includes(typeOf(e.id)));
    L.sort((a, b) => (YI.equippedIn(b.u) ? 1 : 0) - (YI.equippedIn(a.u) ? 1 : 0) || (b.q || 0) - (a.q || 0) || ((ID[b.id].yd || {}).tier || 0) - ((ID[a.id].yd || {}).tier || 0) || (a.u - b.u));
    return L;
  };
  const GRID = { x: 162, y: 56, cols: 6, rows: 7, cell: 24 };
  function selEntry() {
    if (UI.page !== 'inv') return null;
    if (UI.zone === 'equip') { const u = S().eq[EQ[UI.eqSel].k]; return u ? YI.get(u) : null; }
    return itemsOf(UI.tab)[UI.sel] || null;
  }
  const say = (m, col) => { UI.msg = m; UI.msgT = 150; UI.msgCol = col || COL.goldL; };

  /* ================================================================ open / close */
  let blocker = false;
  function open(page, o) {
    if (UI.open) { setPage(page); return; }
    if (!G.run || G.Game.state !== 'play' || R().ended) return;
    if (G.UI.isOpen && G.UI.isOpen()) return;
    const p = pl(); if (!p || p.dead) return;
    UI.open = true; UI.t = 0; UI.menu = null; UI.msg = ''; UI.smith = !!(o && o.smith); UI.respecArm = 0;
    UI.pend = { str: 0, agi: 0, end: 0, mem: 0 };
    setPage(page || 'inv');
    if (UI.smith) { UI.tab = 0; UI.zone = 'grid'; UI.sel = 0; }
    if (PR) PR.ui.open = true;
    blocker = true;
    G.UI.choice({ title: '', cancel: true, options: [{ label: ' ', value: null }], onPick: () => { blocker = false; if (UI.open) close(true); } });
    sfx('ui_select');
    padPrev = readPad();
  }
  function close(fromModal) {
    if (!UI.open) return;
    UI.open = false; if (PR) PR.ui.open = false;
    const m = G.UI._debug().modal;
    if (!fromModal && m && m.type === 'choice' && blocker) { m.picked = true; m.pickT = 0; m.pickVal = null; }
    blocker = false; UI.menu = null;
    try { G.input.keys.clear(); G.input.mouse.l = G.input.mouse.r = false; G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    for (const e of S().inv) e.isNew = 0;
    CH.syncHp(); save(); sfx('ui_back');
    setTimeout(() => { try { YI.flushBurn(); } catch (e) { console.error(e); } }, 120);
  }
  function setPage(pg) {
    if (!PAGES.includes(pg)) pg = 'inv';
    UI.page = pg; UI.menu = null; UI.hover = null; UI.respecArm = 0; UI.msgT = 0;
  }
  G.INV_OPEN = o => open('inv', o);
  G.CHAR_OPEN = () => open('char');
  G.TREE_OPEN = () => open('skills');
  UI.openPage = open; UI.close = close; UI.selEntry = () => selEntry(); UI.itemsOf = t2 => itemsOf(t2);
  // engine input is muted while the screens are open
  {
    const up0 = G.input.update;
    G.input.update = function () {
      if (UI.open) { this.prev = this.down; this.down = {}; this.anyPressed = false; return; }
      return up0.apply(this, arguments);
    };
  }
  (function watch() { if (UI.open && !(G.UI.isOpen && G.UI.isOpen())) { UI.open = false; if (PR) PR.ui.open = false; } requestAnimationFrame(watch); })();

  /* ================================================================ actions */
  function actionsFor(e) {
    if (!e) return [];
    const ty = typeOf(e.id), A = [], eqk = YI.equippedIn(e.u), d = ID[e.id];
    const lab = (en, ru, uz) => `${en}|${ru}|${uz}`;
    if (ty === 'weapon') {
      if (eqk !== 'attack') A.push({ k: 'eqA', label: lab('Equip: main hand (J)', 'Взять в основную руку (J)', 'Asosiy qurol qilish (J)') });
      if (eqk !== 'secondary') A.push({ k: 'eqB', label: lab('Equip: second (K)', 'Взять вторым оружием (K)', 'Ikkinchi qurol qilish (K)') });
    } else if (ty === 'skill') {
      if (eqk !== 'skill1') A.push({ k: 'eqQ', label: lab('Put on Q', 'Поставить на Q', "Q ga qo'yish") });
      if (eqk !== 'skill2') A.push({ k: 'eqE', label: lab('Put on E', 'Поставить на E', "E ga qo'yish") });
    } else if (ty === 'armour') { if (!eqk) A.push({ k: 'eq', label: lab('Wear', 'Надеть', 'Kiyish') }); }
    else if (ty === 'charm') {
      if (eqk !== 'charm1') A.push({ k: 'eqC1', label: lab('Wear: first charm', 'Надеть первым оберегом', 'Birinchi tumar qilib taqish') });
      if (eqk !== 'charm2') A.push({ k: 'eqC2', label: lab('Wear: second charm', 'Надеть вторым оберегом', 'Ikkinchi tumar qilib taqish') });
    } else if (ty === 'consumable') A.push({ k: 'use', label: lab('Use', 'Использовать', 'Ishlatish') });
    else if (ty === 'tumar' && e.id !== 'tu_blank') { A.push({ k: 'drink', label: lab('Taste (a gift, Hollowness)', 'Испить (дар, Пустота)', "Totish (sovg'a, Bo'shliq)") }); A.push({ k: 'burn', label: lab('Burn (a blast, Hollowness)', 'Сжечь (взрыв, Пустота)', "Yondirish (portlash, Bo'shliq)") }); }
    if (eqk) A.push({ k: 'uneq', label: lab('Take off', 'Снять', 'Yechish') });
    if (UI.smith && ty === 'weapon') {
      const c = YI.upgradeCost(e);
      if (c) A.push({ k: 'upg', label: `Upgrade to +${(e.up || 0) + 1}: ${c.gold} tilla, ${LANG.T(ID[c.mat].name)} ×${c.n}|Улучшить до +${(e.up || 0) + 1}: ${c.gold} тилла, ${LANG.T(ID[c.mat].name)} ×${c.n}|+${(e.up || 0) + 1} gacha yaxshilash: ${c.gold} tilla, ${LANG.T(ID[c.mat].name)} ×${c.n}`, why: YI.canUpgrade(e) });
      const free = YI.socketCount(e) - (e.mods || []).length;
      if (free > 0) for (const m of S().inv.filter(x => typeOf(x.id) === 'mod' && !(e.mods || []).includes(x.id))) A.push({ k: 'sock', mod: m.u, label: `Set: ${LANG.T(ID[m.id].name)}|Вставить: ${LANG.T(ID[m.id].name)}|O'rnatish: ${LANG.T(ID[m.id].name)}` });
      (e.mods || []).forEach((m, i) => A.push({ k: 'unsock', i, label: `Remove: ${LANG.T(ID[m].name)}|Вынуть: ${LANG.T(ID[m].name)}|Chiqarish: ${LANG.T(ID[m].name)}` }));
    }
    if (YI.atRest() && YI.sellPrice(e) > 0 && !eqk) A.push({ k: 'sell', label: `Sell for ${YI.sellPrice(e)} tilla|Продать за ${YI.sellPrice(e)} тилла|${YI.sellPrice(e)} tillaga sotish` });
    void d;
    return A;
  }
  function doAction(e, a) {
    if (!a) return;
    if (a.why) { say(a.why, COL.bad); sfx('denied'); return; }
    const k = a.k;
    if (k === 'eqA') YI.equip(e.u, 'attack'); else if (k === 'eqB') YI.equip(e.u, 'secondary');
    else if (k === 'eqQ') YI.equip(e.u, 'skill1'); else if (k === 'eqE') YI.equip(e.u, 'skill2');
    else if (k === 'eq') YI.equip(e.u); else if (k === 'eqC1') YI.equip(e.u, 'charm1'); else if (k === 'eqC2') YI.equip(e.u, 'charm2');
    else if (k === 'uneq') YI.unequip(YI.equippedIn(e.u));
    else if (k === 'use') { if (YI.use(e.u)) say(t(`Used.|Использовано.|Ishlatildi.`)); }
    else if (k === 'drink') { if (YI.drink(e.u)) say(t(`You tasted someone else's memory.|Ты испил чужое воспоминание.|Begona xotirani totding.`), '#ffe2a8'); }
    else if (k === 'burn') { if (YI.burn(e.u)) { say(t(`It will burn when you close the satchel.|Он вспыхнет, когда закроешь сумку.|Sumkani yopganingda yonib ketadi.`), '#ffb070'); } }
    else if (k === 'upg') { if (YI.upgrade(e.u)) { say(tf(`{n} — upgraded.|{n} — улучшено.|{n} — yaxshilandi.`, { n: nameOf(e) }), COL.good); flashUp = 30; } }
    else if (k === 'sock') { if (YI.socket(e.u, a.mod)) say(t(`The stone is set.|Вставка на месте.|Qadama o'rnatildi.`), COL.good); }
    else if (k === 'unsock') { if (YI.unsocket(e.u, a.i)) say(t(`The stone is out.|Вставка вынута.|Qadama olindi.`)); }
    else if (k === 'sell') { if (YI.sell(e.u)) say(t(`Sold.|Продано.|Sotildi.`), COL.gold); }
    UI.menu = null;
    clampSel();
  }
  let flashUp = 0;
  function clampSel() { const n = itemsOf(UI.tab).length; UI.sel = cl(UI.sel, 0, Math.max(0, n - 1)); const row = Math.floor(UI.sel / GRID.cols); if (row < UI.scroll) UI.scroll = row; if (row >= UI.scroll + GRID.rows) UI.scroll = row - GRID.rows + 1; }
  function confirmInv() {
    if (UI.zone === 'equip') {
      const q = EQ[UI.eqSel], u = S().eq[q.k];
      UI.tab = q.tab; UI.zone = 'grid';
      const L = itemsOf(UI.tab), i = u ? L.findIndex(e => e.u === u) : -1;
      UI.sel = i >= 0 ? i : 0; clampSel(); sfx('ui_move');
      return;
    }
    const e = selEntry(); if (!e) { sfx('denied'); return; }
    const A = actionsFor(e);
    if (!A.length) { sfx('denied'); return; }
    // the obvious action at once when there is only one
    if (A.length === 1 && A[0].k !== 'sell' && A[0].k !== 'burn') { doAction(e, A[0]); return; }
    UI.menu = { e, A, sel: 0 }; sfx('ui_select');
  }
  function unequipSel() {
    if (UI.zone === 'equip') { const k = EQ[UI.eqSel].k; if (S().eq[k]) YI.unequip(k); return; }
    const e = selEntry(); if (!e) return;
    const k = YI.equippedIn(e.u);
    if (k) YI.unequip(k);
    else if (YI.atRest() && YI.sellPrice(e) > 0) doAction(e, { k: 'sell' });
  }

  /* ---------- character page ---------- */
  const ATTRS = CH.ATTRS;
  const pendSum = () => ATTRS.reduce((a, k) => a + UI.pend[k], 0);
  function attrPlus(k, d) {
    const s = S();
    if (d > 0) { if (pendSum() >= s.free) { say(t(`No attribute points — gain a level|Нет очков атрибутов — получи уровень|Atribut ochkosi yo'q — keyingi darajaga chiq`), COL.bad); sfx('denied'); return; } if (s.attr[k] + s.bonus[k] + UI.pend[k] >= CH.ATTR_MAX) { sfx('denied'); return; } UI.pend[k]++; sfx('ui_move'); }
    else if (UI.pend[k] > 0) { UI.pend[k]--; sfx('ui_move'); }
  }
  function attrConfirm() {
    if (!pendSum()) { sfx('denied'); return; }
    for (const k of ATTRS) while (UI.pend[k] > 0) { CH.addPoint(k); UI.pend[k]--; }
    sfx('scroll'); say(t(`Your training settles in.|Выучка закрепилась.|O'rganganlaring mustahkamlandi.`), COL.good);
  }
  function doRespec() {
    const cost = CH.respecCost();
    if (UI.respecArm <= 0) { UI.respecArm = 180; say(cost ? tf(`Unlearn everything for {n} tilla? Press again.|Переучиться за {n} тилла? Нажми ещё раз.|{n} tillaga qaytadan o'rganasanmi? Yana bos.`, { n: cost }) : t(`Unlearn everything — this once for free? Press again.|Переучиться? В этот раз бесплатно. Нажми ещё раз.|Qaytadan o'rganasanmi? Bu safar tekin. Yana bos.`), COL.goldL); sfx('ui_select'); return; }
    const r = CH.respec();
    UI.respecArm = 0; UI.pend = { str: 0, agi: 0, end: 0, mem: 0 };
    if (r.ok) say(t(`Everything you learned is yours to place again.|Всё выученное можно распределить заново.|O'rganganlaringning hammasini qaytadan taqsimlash mumkin.`), COL.good);
    else { say(r.why, COL.bad); sfx('denied'); }
  }

  /* ---------- skills page ---------- */
  const skNodes = () => (UI.skTab === 0 ? PR.Y : PR.S);
  function skLayout() {
    const out = [];
    if (UI.skTab === 0) {
      const bw = 140, gap = 10, x0 = Math.round(G.W / 2 - (3 * bw + 2 * gap) / 2);
      PR.Y.forEach((n, i) => {
        const inT = PR.Y.filter(m => m.br === n.br && m.tier === n.tier), j = inT.indexOf(n);
        const bx = x0 + n.br * (bw + gap);
        out.push({ n, i, x: bx + 24 + j * 42, y: 84 + n.tier * 30, r: 10, col: n.br * 3 + j, row: n.tier });
      });
      return { out, x0, bw, gap };
    }
    const bw = 190, gap = 16, x0 = Math.round(G.W / 2 - (2 * bw + gap) / 2);
    const cnt = [0, 0];
    PR.S.forEach((n, i) => { const k = cnt[n.col]++; out.push({ n, i, x: x0 + n.col * (bw + gap) + 60 + (k % 2) * 70, y: 96 + Math.floor(k / 2) * 52, r: 12, col: n.col * 2 + (k % 2), row: Math.floor(k / 2) }); });
    return { out, x0, bw, gap };
  }
  function skMove(dx, dy) {
    const L = skLayout().out, cur = L.find(b => b.i === UI.skSel) || L[0];
    let best = null, bd = 1e9;
    for (const b of L) {
      if (b === cur) continue;
      const ddx = b.col - cur.col, ddy = b.row - cur.row;
      if (dx && Math.sign(ddx) !== dx) continue; if (dy && Math.sign(ddy) !== dy) continue;
      const d = (dx ? Math.abs(ddx) * 10 + Math.abs(ddy) * 3 : Math.abs(ddy) * 10 + Math.abs(ddx) * 3);
      if (d < bd) { bd = d; best = b; }
    }
    if (best) { UI.skSel = best.i; sfx('ui_move'); }
  }
  function skBuy() {
    const n = skNodes()[UI.skSel]; if (!n) return;
    const why = UI.skTab === 0 ? PR.whyNotY(n) : PR.whyNotS(n);
    if (why) { say(why, COL.bad); sfx('denied'); return; }
    const ok = UI.skTab === 0 ? PR.buyY(n.id) : PR.buyS(n.id);
    if (ok) { sfx('scroll'); say((UI.skTab === 0 ? t(n.name) : PR.NNAME(n)) + ' — ' + t(`learned|изучено|o'rganilgan`), COL.good); flashNode = { i: UI.skSel, t: 30 }; }
  }
  let flashNode = null;

  /* ================================================================ input */
  const pageStep = d => { const i = PAGES.indexOf(UI.page); setPage(PAGES[(i + d + PAGES.length) % PAGES.length]); sfx('ui_move'); };
  function key(c, shift) {
    if (UI.menu) {
      const M = UI.menu;
      if (c === 'up') { M.sel = (M.sel + M.A.length - 1) % M.A.length; sfx('ui_move'); }
      else if (c === 'down') { M.sel = (M.sel + 1) % M.A.length; sfx('ui_move'); }
      else if (c === 'ok') doAction(M.e, M.A[M.sel]);
      else if (c === 'back') { UI.menu = null; sfx('ui_back'); }
      return;
    }
    if (c === 'close') { close(); return; }
    if (c === 'back') { if (UI.page === 'inv' && UI.zone === 'equip') { UI.zone = 'grid'; return; } close(); return; }
    if (c === 'page+') { pageStep(shift ? -1 : 1); return; }
    if (c === 'page-') { pageStep(-1); return; }
    if (UI.EXT[UI.page]) { UI.EXT[UI.page].key(c, shift); return; } // [stage 7 hook]
    if (UI.page === 'inv') {
      if (c === 'tab-' || c === 'tab+') { UI.tab = (UI.tab + (c === 'tab+' ? 1 : -1) + TABS.length) % TABS.length; UI.sel = 0; UI.scroll = 0; UI.zone = 'grid'; sfx('ui_move'); return; }
      if (UI.zone === 'equip') {
        const q = EQ[UI.eqSel];
        if (c === 'up' || c === 'down') { const d = c === 'up' ? -1 : 1; UI.eqSel = (UI.eqSel + d + EQ.length) % EQ.length; sfx('ui_move'); }
        else if (c === 'left' || c === 'right') {
          const same = EQ.filter(e => Math.abs(e.y - q.y) < 4 && e !== q);
          const tgt = same.find(e => (c === 'right' ? e.x > q.x : e.x < q.x));
          if (tgt) UI.eqSel = EQ.indexOf(tgt); else if (c === 'right') { UI.zone = 'grid'; }
          sfx('ui_move');
        } else if (c === 'ok') confirmInv(); else if (c === 'x') unequipSel();
        return;
      }
      const n = itemsOf(UI.tab).length, C2 = GRID.cols;
      if (c === 'left') { if (UI.sel % C2 === 0) { UI.zone = 'equip'; } else UI.sel--; sfx('ui_move'); }
      else if (c === 'right') { if (UI.sel % C2 < C2 - 1 && UI.sel + 1 < n) UI.sel++; sfx('ui_move'); }
      else if (c === 'up') { if (UI.sel >= C2) UI.sel -= C2; sfx('ui_move'); }
      else if (c === 'down') { if (UI.sel + C2 < n) UI.sel += C2; sfx('ui_move'); }
      else if (c === 'ok') confirmInv();
      else if (c === 'x') unequipSel();
      clampSel();
      return;
    }
    if (UI.page === 'char') {
      const k = ATTRS[UI.attrSel];
      if (c === 'up') { UI.attrSel = (UI.attrSel + 3) % 4; sfx('ui_move'); }
      else if (c === 'down') { UI.attrSel = (UI.attrSel + 1) % 4; sfx('ui_move'); }
      else if (c === 'right' || c === 'ok') { if (c === 'ok' && pendSum() > 0 && S().free - pendSum() <= 0) attrConfirm(); else attrPlus(k, 1); }
      else if (c === 'left') attrPlus(k, -1);
      else if (c === 'y' || c === 'confirm') attrConfirm();
      else if (c === 'r') doRespec();
      else if (c === 'x') { UI.pend = { str: 0, agi: 0, end: 0, mem: 0 }; sfx('ui_back'); }
      return;
    }
    if (UI.page === 'skills') {
      if (c === 'tab-' || c === 'tab+') { UI.skTab = 1 - UI.skTab; UI.skSel = 0; sfx('ui_move'); return; }
      if (c === 'left') skMove(-1, 0); else if (c === 'right') skMove(1, 0); else if (c === 'up') skMove(0, -1); else if (c === 'down') skMove(0, 1);
      else if (c === 'ok') skBuy();
    }
  }
  const KEYMAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Enter: 'ok', Space: 'ok', KeyJ: 'ok', KeyF: 'ok', Escape: 'back', Backspace: 'back', KeyQ: 'tab-', KeyE: 'tab+', Tab: 'page+',
    KeyX: 'x', KeyR: 'r', KeyY: 'y', KeyV: 'confirm', BracketLeft: 'page-', BracketRight: 'page+'
  };
  window.addEventListener('keydown', e => {
    const c = e.code;
    if (!UI.open) {
      if (G.Game.state !== 'play' || !G.run || (G.UI.isOpen && G.UI.isOpen()) || busy) return;
      const pg = c === 'KeyI' ? 'inv' : c === 'KeyC' ? 'char' : c === 'KeyT' ? 'skills' : UI.EXT_KEY[c] || null; // [stage 7 hook] EXT_KEY
      if (pg) { open(pg); e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    e.stopImmediatePropagation(); e.preventDefault();
    if (e.repeat && (c === 'Enter' || c === 'Space' || c === 'KeyJ' || c === 'KeyF')) return;
    const pg = c === 'KeyI' ? 'inv' : c === 'KeyC' ? 'char' : c === 'KeyT' ? 'skills' : UI.EXT_KEY[c] || null; // [stage 7 hook] EXT_KEY
    if (pg) { if (UI.page === pg) close(); else { setPage(pg); sfx('ui_move'); } return; }
    const k = KEYMAP[c];
    if (k) key(k, e.shiftKey);
  }, true);
  window.addEventListener('keyup', e => { if (UI.open) e.stopImmediatePropagation(); }, true);
  // mouse
  const HIT = [];
  const toUI = e => { const c = document.getElementById('game') || document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * G.W, y: (e.clientY - r.top) / r.height * G.H }; };
  const hitAt = (x, y) => { for (let i = HIT.length - 1; i >= 0; i--) { const h = HIT[i]; if (x >= h.x && x < h.x + h.w && y >= h.y && y < h.y + h.h) return h; } return null; };
  window.addEventListener('pointermove', e => {
    if (!UI.open) return;
    const q = toUI(e); if (!q) return;
    UI.mx = q.x; UI.my = q.y;
    const h = hitAt(q.x, q.y);
    if (h && h.hover) h.hover();
  }, true);
  window.addEventListener('pointerdown', e => {
    if (!UI.open) return;
    const q = toUI(e); if (!q) return;
    e.stopImmediatePropagation(); e.preventDefault();
    const h = hitAt(q.x, q.y);
    if (e.button === 2) { if (h && h.right) h.right(); else key('back'); return; }
    if (h && h.click) h.click(); else if (UI.menu) { UI.menu = null; sfx('ui_back'); }
  }, true);
  window.addEventListener('pointerup', e => { if (UI.open) { e.stopImmediatePropagation(); } }, true);
  window.addEventListener('mousedown', e => { if (UI.open) e.stopImmediatePropagation(); }, true);
  window.addEventListener('mouseup', e => { if (UI.open) e.stopImmediatePropagation(); }, true);
  window.addEventListener('wheel', e => {
    if (!UI.open || UI.page !== 'inv') return;
    const n = itemsOf(UI.tab).length, rows = Math.ceil(n / GRID.cols);
    UI.scroll = cl(UI.scroll + Math.sign(e.deltaY), 0, Math.max(0, rows - GRID.rows));
    e.preventDefault();
  }, { passive: false, capture: true });
  // gamepad
  let padPrev = {};
  function readPad() {
    const out = {};
    let ps = []; try { ps = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { ps = []; }
    for (const g of ps || []) {
      if (!g) continue;
      const b = i => !!(g.buttons[i] && g.buttons[i].pressed);
      if (b(12) || g.axes[1] < -0.6) out.up = 1; if (b(13) || g.axes[1] > 0.6) out.down = 1;
      if (b(14) || g.axes[0] < -0.6) out.left = 1; if (b(15) || g.axes[0] > 0.6) out.right = 1;
      if (b(0)) out.ok = 1; if (b(1)) out.back = 1; if (b(2)) out.x = 1; if (b(3)) out.y = 1;
      if (b(4)) out['tab-'] = 1; if (b(5)) out['tab+'] = 1; if (b(6)) out['page-'] = 1; if (b(7)) out['page+'] = 1;
      if (b(9) || b(8)) out.close = 1;
    }
    return out;
  }
  let padRep = { k: null, t: 0 };
  (function padLoop() {
    try {
      if (UI.open) {
        const cur = readPad();
        for (const k in cur) if (!padPrev[k]) { key(k === 'y' && UI.page !== 'char' ? 'page+' : k); padRep = { k, t: 0 }; }
        if (padRep.k && cur[padRep.k] && ['up', 'down', 'left', 'right'].includes(padRep.k)) { padRep.t++; if (padRep.t > 22 && padRep.t % 6 === 0) key(padRep.k); }
        padPrev = cur;
      } else {
        // Select (Back) opens the satchel from the field
        const cur = readPad();
        if (cur.close && !padPrev.close && G.Game.state === 'play' && G.run && !(G.UI.isOpen && G.UI.isOpen())) { /* Start is the pause menu: leave it to the engine */ }
        padPrev = cur;
      }
    } catch (e) { /* ignore */ }
    requestAnimationFrame(padLoop);
  })();

  /* ================================================================ drawing */
  const vis = () => UI.open && G.run && G.Game.state === 'play';
  // pixel pass: a dark field under everything (cheap, full screen)
  const PIX_UI = ctx => {
    if (!vis()) return;
    ctx.save(); ctx.globalAlpha = 1; ctx.fillStyle = '#07040a'; ctx.fillRect(0, 0, G.W, G.H); ctx.restore();
  };
  // the hero, live, with the gear on
  let hv = null;
  function heroCanvas() {
    const p = pl(); if (!p) return null;
    if (!hv) { hv = document.createElement('canvas'); hv.width = 72; hv.height = 72; hv.at = -9; }
    if (UI.t - hv.at < 3 && UI.t >= hv.at) return hv;
    hv.at = UI.t;
    const c = hv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 72, 72);
    const sv = { facing: p.facing, flashT: p.flashT, invulnT: p.invulnT, state: p.state, act: p.act };
    try {
      p.facing = 1; p.flashT = 0; p.invulnT = 0; if (p.state !== 'normal') p.state = 'normal'; p.act = null;
      c.translate(36 - Math.round(p.x), 66 - Math.round(p.y));
      p.draw(c);
    } catch (e) { /* drawing only */ } finally { Object.assign(p, sv); }
    return hv;
  }
  const SMOOTH_UI = (ctx, st) => {
    if (!vis()) return;
    UI.t++; if (UI.msgT > 0) UI.msgT--; if (UI.respecArm > 0) UI.respecArm--; if (flashUp > 0) flashUp--;
    if (flashNode && --flashNode.t <= 0) flashNode = null;
    HIT.length = 0;
    ctx.save(); ctx.imageSmoothingEnabled = true;
    try {
      const k = cl(UI.t / 10, 0, 1);
      ctx.globalAlpha = k;
      // vignette
      ctx.drawImage(baked('vig', G.W, G.H, (c, w, h) => { const vg = c.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, 300); vg.addColorStop(0, 'rgba(40,20,50,0.0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)'); c.fillStyle = vg; c.fillRect(0, 0, w, h); }), 0, 0, G.W, G.H);
      panel(ctx, 8, 8, G.W - 16, G.H - 16, { band: true });
      header(ctx);
      if (UI.page === 'inv') drawInv(ctx); else if (UI.page === 'char') drawChar(ctx); else if (UI.EXT[UI.page]) UI.EXT[UI.page].draw(ctx, HIT); else drawSkills(ctx); // [stage 7 hook]
      footer(ctx);
      if (UI.menu) drawMenu(ctx);
    } catch (e) { console.error('[chui]', e); }
    ctx.restore();
    void st;
  };
  // drawn last, over the cards, toasts and HUD frames of 98_ui_art.js
  setTimeout(() => { PIXEL_DRAW.push(PIX_UI); SMOOTH_DRAW.push(SMOOTH_UI); }, 0);
  function header(ctx) {
    const W2 = PAGES.length > 4 ? 56 : PAGES.length > 3 ? 70 : 92, gap = PAGES.length > 4 ? 4 : 6, x0 = G.W / 2 - (PAGES.length * W2 + (PAGES.length - 1) * gap) / 2 + (PAGES.length > 4 ? 26 : PAGES.length > 3 ? 22 : 0); // [stage 7 hook] page count
    PAGES.forEach((pg, i) => {
      const x = x0 + i * (W2 + gap), on = UI.page === pg;
      plate(ctx, x, 16, W2, on ? '#5a3a14' : '#241a30', on);
      txt(ctx, t(PAGE_NAME[pg]).toUpperCase() + '  [' + PAGE_KEY[pg] + ']', x + W2 / 2, PAGES.length > 4 ? 19.2 : 18.6, { size: PAGES.length > 4 ? 4.4 : 5.6, weight: 600, align: 'center', color: on ? COL.goldL : COL.dim, serif: true });
      HIT.push({ x, y: 14, w: W2, h: 15, click: () => { setPage(pg); sfx('ui_move'); } });
    });
    // left: name and level; right: tilla and Hollowness
    const s = S();
    txt(ctx, t(`Ravshan, yodchi|Равшан, ёдчи|Ravshan, yodchi`), 22, 15, { size: 7, serif: true, weight: 600, color: COL.goldL });
    txt(ctx, tf(`level {n}|уровень {n}|{n}-daraja`, { n: s.lvl }) + (s.free > 0 ? '  ·  ' + tf(`{n} attribute pts|{n} оч. атрибутов|{n} atribut ochkosi`, { n: s.free }) : '') + (CH.skillPoints() > 0 ? '  ·  ' + tf(`{n} skill pts|{n} оч. умений|{n} mahorat ochkosi`, { n: CH.skillPoints() }) : ''), 22, 24.5, { size: 4.6, color: s.free > 0 || CH.skillPoints() > 0 ? COL.goldL : COL.dim });
    const gx = G.W - 22;
    txt(ctx, (G.run.gold || 0) + ' ' + t(`tilla|тилла|tilla`), gx, 15, { size: 6.4, align: 'right', color: '#ffd77a', weight: 600 });
    txt(ctx, tf(`Hollowness {n}|Пустота {n}|Bo'shliq {n}`, { n: R().void }), gx, 24.5, { size: 4.6, align: 'right', color: '#c9b4ff' });
    if (UI.smith) txt(ctx, t(`AT THE SMITH'S ANVIL|У НАКОВАЛЬНИ КУЗНЕЦА|TEMIRCHI SANDONIDA`), G.W / 2, 31.5, { size: 4.4, align: 'center', color: '#ffb070', weight: 600 });
    else if (YI.atRest()) txt(ctx, tf(`A buyer in the chaikhana · can still pay {n} tilla|Скупщик в чайхане · может заплатить ещё {n} тилла|Choyxonadagi xaridor · yana {n} tilla to'lay oladi`, { n: Math.max(0, YI.sellLeft()) }), G.W / 2, 31.5, { size: 4.2, align: 'center', color: COL.dim });
  }
  function footer(ctx) {
    const y = G.H - 21;
    if (UI.msgT > 0 && UI.msg) { ctx.globalAlpha = cl(UI.msgT / 20, 0, 1); txt(ctx, UI.msg, G.W / 2, y - 10, { size: 5.6, align: 'center', color: UI.msgCol || COL.goldL, weight: 600 }); ctx.globalAlpha = 1; }
    const pad = G.input.lastDevice === 'pad';
    const H2 = UI.EXT[UI.page] ? UI.EXT[UI.page].help(pad) : UI.page === 'inv' // [stage 7 hook]
      ? (pad ? t(`D-pad move · A choose · X take off/sell · LB/RB tabs · LT/RT pages · B back|Крестовина — выбор · A — действие · X — снять/продать · LB/RB — вкладки · LT/RT — страницы · B — назад|Krestovina — tanlash · A — amal · X — yechish/sotish · LB/RB — bo'limlar · LT/RT — sahifalar · B — orqaga`)
        : t(`Arrows move · Enter choose · X take off / sell · Q/E tabs · Tab pages · Esc close · right click: take off|Стрелки — выбор · Enter — действие · X — снять / продать · Q/E — вкладки · Tab — страницы · Esc — закрыть · правая кнопка — снять|Strelkalar — tanlash · Enter — amal · X — yechish / sotish · Q/E — bo'limlar · Tab — sahifalar · Esc — yopish · o'ng tugma — yechish`))
      : UI.page === 'char'
        ? (pad ? t(`Up/down attribute · right + · left − · Y confirm · X reset · B back|Вверх/вниз — атрибут · вправо + · влево − · Y — подтвердить · X — сброс · B — назад|Yuqori/past — atribut · o'ngga + · chapga − · Y — tasdiq · X — bekor · B — orqaga`)
          : t(`Up/down attribute · → add · ← remove · V confirm · X reset · R unlearn · Esc close|Вверх/вниз — атрибут · → добавить · ← убрать · V — подтвердить · X — сброс · R — переучиться · Esc — закрыть|Yuqori/past — atribut · → qo'shish · ← olish · V — tasdiq · X — bekor · R — qayta o'rganish · Esc — yopish`))
        : (pad ? t(`Move · A learn · LB/RB the yodchi / Sado · B back|Выбор · A — изучить · LB/RB — ёдчи / Садо · B — назад|Tanlash · A — o'rganish · LB/RB — yodchi / Sado · B — orqaga`)
          : t(`Arrows move · Enter learn · Q/E the yodchi / Sado · Tab pages · Esc close|Стрелки — выбор · Enter — изучить · Q/E — ёдчи / Садо · Tab — страницы · Esc — закрыть|Strelkalar — tanlash · Enter — o'rganish · Q/E — yodchi / Sado · Tab — sahifalar · Esc — yopish`));
    goldRule(ctx, 30, y - 1.5, G.W - 30, 0.3);
    txt(ctx, H2, G.W / 2, y + 1, { size: 4.4, align: 'center', color: COL.dim });
  }

  /* ---------- the inventory page ---------- */
  function slotBox(ctx, x, y, e, sel, label, o) {
    o = o || {};
    const q = e ? YI.QUAL[e.q || 0] : null, s = 22;
    inset(ctx, x, y, s, s, { fill: e ? `rgba(${hex(q.col).join(',')},0.10)` : 'rgba(8,5,12,0.85)', stroke: sel ? COL.goldL : e ? rgba(q.col, 0.6) : rgba(COL.gold, 0.25), lw: sel ? 0.9 : 0.5, glow: sel ? COL.gold : null });
    if (e) icon(ctx, ID[e.id], null, x + s / 2, y + s / 2, 16);
    else if (label) txt(ctx, label, x + s / 2, y + s / 2 - 2, { size: 3.6, align: 'center', color: 'rgba(200,180,150,0.45)', shadow: false });
    if (e && e.up) txt(ctx, '+' + e.up, x + s - 1.5, y + 1, { size: 4, align: 'right', color: COL.goldL, weight: 700 });
    if (e && e.n > 1) txt(ctx, '×' + e.n, x + s - 1.5, y + s - 6, { size: 4, align: 'right', color: COL.cream, weight: 600 });
    if (e && e.isNew && UI.t % 40 < 30) { ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(x + 3, y + 3, 1.2, 0, 7); ctx.fill(); }
    if (o.eqMark) { ctx.fillStyle = COL.gold; ctx.beginPath(); ctx.moveTo(x + 1, y + s - 1); ctx.lineTo(x + 6, y + s - 1); ctx.lineTo(x + 1, y + s - 6); ctx.closePath(); ctx.fill(); }
    if (e && ID[e.id].yd && ID[e.id].yd.legend) { ctx.strokeStyle = rgba('#ffb648', 0.5 + 0.3 * Math.sin(UI.t * 0.1)); ctx.lineWidth = 0.5; chamfer(ctx, x - 1, y - 1, s + 2, s + 2, 1.6); ctx.stroke(); }
  }
  function drawInv(ctx) {
    const s = S();
    // equipment column
    panel(ctx, 16, 38, 136, 198, { tone: 'dark' });
    txt(ctx, t(`WORN AND CARRIED|НА СЕБЕ|USTINGDA`), 84, 41, { size: 4.6, align: 'center', color: COL.gold, weight: 600, serif: true });
    // hero preview
    const hc = heroCanvas();
    if (hc) {
      const sc = 1.65, w = 72 * sc;
      const g = ctx.createRadialGradient(84, 104, 2, 84, 104, 50); g.addColorStop(0, 'rgba(255,214,140,0.18)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(46, 50, 76, 110);
      ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(hc, 84 - w / 2, 152 - 66 * sc, w, w); ctx.restore();
      ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(84, 152, 18, 2.4, 0, 0, 7); ctx.fill();
    }
    EQ.forEach((q, i) => {
      const u = s.eq[q.k], e = u ? YI.get(u) : null, sel = UI.zone === 'equip' && UI.eqSel === i;
      slotBox(ctx, q.x, q.y, e, sel, t(q.name).split(' · ')[0]);
      const sk = (q.k === 'skill1' || q.k === 'skill2') && G.run.slots[q.k];
      if (sk && sk.cd > 0) { ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(q.x + 1, q.y + 1 + 20 * (1 - sk.cd / (sk.cdMax || sk.cd)), 20, 20 * sk.cd / (sk.cdMax || sk.cd)); }
      HIT.push({ x: q.x, y: q.y, w: 22, h: 22, hover: () => { if (!UI.menu && (UI.zone !== 'equip' || UI.eqSel !== i)) { UI.zone = 'equip'; UI.eqSel = i; } }, click: () => { UI.zone = 'equip'; UI.eqSel = i; confirmInv(); }, right: () => { if (s.eq[q.k]) YI.unequip(q.k); } });
    });
    // weight class and the set
    const rs = CH.rollStats(), sets = YI.sets();
    const yy = 192;
    goldRule(ctx, 26, yy - 3, 142, 0.3);
    txt(ctx, t(`Weight|Вес|Og'irlik`) + ': ' + CH.weight() + '  ·  ' + t(`roll|перекат|dumalash`) + ': ' + t(rs.name).toLowerCase(), 24, yy, { size: 4.6, color: COL.cream });
    txt(ctx, t(`Armour|Броня|Sovut`) + ': −' + Math.round(CH.armor() * 100) + '%  ·  ' + t(`balance|равновесие|muvozanat`) + ' ' + Math.round(CH.poise() * 100) + '%', 24, yy + 7.5, { size: 4.6, color: COL.cream });
    let sy = yy + 16;
    for (const k in sets) { const st = YI.SETS[k]; if (!st) continue; const full = sets[k] >= st.n; txt(ctx, (full ? '✦ ' : '◇ ') + t(st.name) + ' ' + sets[k] + '/' + st.n, 24, sy, { size: 4.4, color: full ? '#9cf0a0' : COL.dim }); sy += 7; if (sy > 238) break; }
    // tabs
    const tx0 = 160, tw = 22.6;
    TABS.forEach((tb, i) => {
      const x = tx0 + i * tw, on = UI.tab === i;
      inset(ctx, x, 38, tw - 1.5, 14, { fill: on ? 'rgba(90,58,20,0.85)' : 'rgba(20,14,26,0.85)', stroke: on ? COL.goldL : rgba(COL.gold, 0.25), lw: on ? 0.7 : 0.4 });
      tabGlyph(ctx, tb.key, x + (tw - 1.5) / 2, 45, on);
      const nNew = itemsOf(i).filter(e => e.isNew).length;
      if (nNew && UI.t % 40 < 30) { ctx.fillStyle = '#ffe066'; ctx.beginPath(); ctx.arc(x + tw - 4, 40.5, 1.1, 0, 7); ctx.fill(); }
      HIT.push({ x, y: 38, w: tw - 1.5, h: 14, click: () => { UI.tab = i; UI.sel = 0; UI.scroll = 0; UI.zone = 'grid'; sfx('ui_move'); } });
    });
    txt(ctx, t(TABS[UI.tab].name).toUpperCase(), tx0 + 79, 54.5, { size: 4.6, align: 'center', color: COL.goldL, weight: 600, serif: true });
    // grid
    const L = itemsOf(UI.tab), gy = GRID.y + 8;
    for (let r = 0; r < GRID.rows; r++) for (let c = 0; c < GRID.cols; c++) {
      const i = (r + UI.scroll) * GRID.cols + c, x = GRID.x + c * GRID.cell, y = gy + r * GRID.cell, e = L[i];
      const sel = UI.zone === 'grid' && UI.sel === i && !!e;
      slotBox(ctx, x, y, e || null, sel || (UI.zone === 'grid' && UI.sel === i && !e), '', { eqMark: e && YI.equippedIn(e.u) });
      if (e) HIT.push({ x, y, w: 22, h: 22, hover: () => { if (!UI.menu) { UI.zone = 'grid'; UI.sel = i; } }, click: () => { UI.zone = 'grid'; UI.sel = i; confirmInv(); }, right: () => { UI.zone = 'grid'; UI.sel = i; unequipSel(); } });
    }
    const rows = Math.ceil(L.length / GRID.cols);
    if (rows > GRID.rows) { const h = GRID.rows * GRID.cell, sh = h * GRID.rows / rows; ctx.fillStyle = rgba(COL.gold, 0.2); ctx.fillRect(GRID.x + GRID.cols * GRID.cell + 1, gy, 1.5, h); ctx.fillStyle = COL.gold; ctx.fillRect(GRID.x + GRID.cols * GRID.cell + 1, gy + UI.scroll / rows * h, 1.5, sh); }
    if (!L.length) txt(ctx, t(`Nothing here yet.|Пока ничего нет.|Hozircha hech narsa yo'q.`), GRID.x + 72, gy + 70, { size: 5, align: 'center', color: COL.dim, style: 'italic' });
    // details
    drawDetails(ctx, selEntry());
  }
  function tabGlyph(ctx, k, x, y, on) {
    const c = on ? COL.goldL : '#9a8c7e';
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 0.8; ctx.lineCap = 'round';
    ctx.beginPath();
    if (k === 'weapon') { ctx.moveTo(-3.5, 3.5); ctx.lineTo(3.5, -3.5); ctx.moveTo(-1.5, 0.5); ctx.lineTo(0.5, 2.5); ctx.stroke(); }
    else if (k === 'armour') { ctx.moveTo(-3, -3); ctx.lineTo(3, -3); ctx.lineTo(3.4, 1); ctx.lineTo(0, 4); ctx.lineTo(-3.4, 1); ctx.closePath(); ctx.stroke(); }
    else if (k === 'charm') { ctx.moveTo(0, -3.5); ctx.lineTo(3.5, 3); ctx.lineTo(-3.5, 3); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 1, 0.9, 0, 7); ctx.fill(); }
    else if (k === 'tumar') { ctx.moveTo(-3, -3); ctx.lineTo(0, -1); ctx.lineTo(3, -3); ctx.moveTo(0, -1); ctx.lineTo(3, 3); ctx.lineTo(-3, 3); ctx.closePath(); ctx.stroke(); }
    else if (k === 'cons') { ctx.arc(0, 1, 3, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-1, -2); ctx.lineTo(-1, -4); ctx.moveTo(1, -2); ctx.lineTo(1, -4); ctx.stroke(); }
    else if (k === 'mat') { ctx.moveTo(-4, 2.5); ctx.lineTo(-2.5, -1.5); ctx.lineTo(4, -1.5); ctx.lineTo(2.5, 2.5); ctx.closePath(); ctx.stroke(); }
    else if (k === 'key') { ctx.arc(-1.5, 0, 2, 0, 7); ctx.moveTo(0.5, 0); ctx.lineTo(4, 0); ctx.moveTo(3, 0); ctx.lineTo(3, 1.8); ctx.stroke(); }
    ctx.restore();
  }
  const LET_COL = { S: '#ffb648', A: '#ffe066', B: '#9cf0a0', C: '#8fd0ff', D: '#b8a8c8' };
  function stepsOf(d) { return d.combo ? d.combo.map(s => s.dmg) : null; }
  function wDmg(e) {
    const it = YI.makeInst(e), d = it.def;
    if (d.combo) return { light: d.combo.map(s => Math.round(G.Combat.playerDmg(it, s.dmg))), heavy: d.heavyStep ? Math.round(G.Combat.playerDmg(it, d.heavyStep.dmg)) : null, avg: d.combo.reduce((a, s) => a + G.Combat.playerDmg(it, s.dmg), 0) / d.combo.length };
    if (d.kind === 'ydcast') return { light: [Math.round(G.Combat.playerDmg(it, d.boltDmg))], heavy: Math.round(G.Combat.playerDmg(it, d.burnDmg)), avg: G.Combat.playerDmg(it, d.boltDmg) };
    if (d.kind === 'shield') return { light: [Math.round(G.Combat.playerDmg(it, d.parryDmg || 20))], heavy: null, avg: G.Combat.playerDmg(it, d.parryDmg || 20), block: d.block };
    if (d.kind === 'bow') return { light: [Math.round(G.Combat.playerDmg(it, d.dmg || 10))], count: d.count || 1, heavy: null, avg: G.Combat.playerDmg(it, d.dmg || 10) * (d.count || 1) };
    if (d.kind === 'sling') return { light: [Math.round(G.Combat.playerDmg(it, 15))], heavy: null, avg: G.Combat.playerDmg(it, 15) };
    if (d.kind === 'gun') { const base = d.id === 'yd_heavy_xbow' ? 38 : 30; return { light: [Math.round(G.Combat.playerDmg(it, base))], heavy: null, avg: G.Combat.playerDmg(it, base) }; }
    if (d.slot === 'skill') return { light: d.dmg ? [Math.round(G.Combat.playerDmg(it, d.dmg))] : [], heavy: null, avg: d.dmg ? G.Combat.playerDmg(it, d.dmg) : 0 };
    return { light: [], heavy: null, avg: 0 };
  }
  const deltaTxt = (ctx, a, b, x, y) => {
    if (!(a > 0) || !(b > 0)) return;
    const p = Math.round((a / b - 1) * 100);
    txt(ctx, p === 0 ? '=' : (p > 0 ? '▲' : '▼') + Math.abs(p) + '%', x, y, { size: 4.6, align: 'right', color: p > 0 ? COL.good : p < 0 ? COL.bad : COL.dim, weight: 700 });
  };
  function drawDetails(ctx, e) {
    const x = 324, y = 38, w = 140, h = 198;
    panel(ctx, x, y, w, h, { tone: 'warm' });
    if (!e) { txt(ctx, t(`Choose something.|Выбери вещь.|Biror narsa tanla.`), x + w / 2, y + 90, { size: 5, align: 'center', color: COL.dim, style: 'italic' }); return; }
    const d = ID[e.id], ty = typeOf(e.id), q = YI.QUAL[e.q || 0], yd = d.yd || {};
    let cy = y + 6;
    inset(ctx, x + 6, cy, 26, 26, { stroke: rgba(q.col, 0.7), fill: `rgba(${hex(q.col).join(',')},0.12)` });
    icon(ctx, d, null, x + 19, cy + 13, 20);
    const nm = nameOf(e) + (e.n > 1 ? '  ×' + e.n : '');
    const nl = wrap(ctx, nm, w - 44, { size: 6, weight: 700, serif: true });
    nl.slice(0, 2).forEach((l, i) => txt(ctx, l, x + 36, cy + 1 + i * 7, { size: 6, weight: 700, color: q.col, serif: true }));
    let sub = '';
    if (ty === 'weapon') sub = t(YI.CAT[yd.cat].name) + (yd.sub ? '' : '') + '  ·  ' + t(q.name);
    else if (ty === 'armour') sub = t({ head: `Head|Голова|Bosh`, body: `Body|Тело|Tana`, belt: `Belt|Пояс|Kamar`, boots: `Boots|Сапоги|Etik` }[yd.slot]) + '  ·  ' + t(CH.ROLL[yd.cls].name).toLowerCase() + (e.q ? '  ·  ' + t(q.name) : '');
    else sub = t({ charm: `Charm|Оберег|Himoya tumari`, skill: `Technique|Приём|Usul`, consumable: `Consumable|Припас|Sarf buyumi`, material: `Material|Материал|Material`, mod: `Stone or wax inlay|Камень или воск для вставки|Tosh yoki mum qadama`, tumar: `Memory tumar|Тумар памяти|Xotira tumari`, key: `Key item|Важная вещь|Muhim buyum` }[ty] || '');
    txt(ctx, sub, x + 36, cy + (nl.length > 1 ? 15 : 9), { size: 4.3, color: COL.dim });
    const eqk = YI.equippedIn(e.u);
    if (eqk) txt(ctx, t(`worn|надето|kiyilgan`), x + w - 6, cy + 20, { size: 4.2, align: 'right', color: COL.gold, weight: 600 });
    cy += 31;
    goldRule(ctx, x + 6, cy, x + w - 6, 0.35); cy += 3;
    const row = (label, val, col, cmp) => { txt(ctx, label, x + 8, cy, { size: 4.6, color: COL.dim }); txt(ctx, val, x + w - (cmp ? 30 : 8), cy, { size: 4.8, align: 'right', color: col || COL.goldL, weight: 600 }); if (cmp) cmp(x + w - 8, cy); cy += 7.4; };
    if (ty === 'weapon' || ty === 'skill') {
      if (ty === 'weapon') {
        // scaling letters
        const at = CH.attrs();
        CH.ATTRS.forEach((k, i) => {
          const bx = x + 8 + i * 32, L2 = (yd.scal || {})[k] || '–', req = yd.req && yd.req[k];
          inset(ctx, bx, cy, 29, 13, { fill: 'rgba(10,6,14,0.8)', stroke: rgba(COL.gold, 0.2) });
          txt(ctx, t(CH.ATTR_SHORT[k]), bx + 2, cy + 1.2, { size: 3.6, color: COL.dim });
          txt(ctx, L2, bx + 26.5, cy + 0.4, { size: 7, align: 'right', color: LET_COL[L2] || '#5a4a5a', weight: 700, serif: true });
          if (req) txt(ctx, '≥' + req, bx + 2, cy + 7, { size: 3.6, color: at[k] >= req ? COL.dim : COL.bad, weight: 600 });
        });
        cy += 16;
        if (CH.reqShort(YI.makeInst(e))) { txt(ctx, t(`You lack the attributes: damage ×0.6, stamina ×1.5.|Не хватает атрибутов: урон ×0,6, выносливость ×1,5.|Atributlar yetmaydi: zarar ×0,6, chidam ×1,5.`), x + 8, cy, { size: 4.2, color: COL.bad }); cy += 7; }
      }
      const D2 = wDmg(e);
      // compare like with like: the worn weapon of the same category and kind (a shield with a shield)
      const same = x => x && x.u !== e.u && ID[x.id].yd && ID[x.id].yd.cat === yd.cat && (ID[x.id].yd.sub || '') === (yd.sub || '');
      const other = ty === 'weapon' && !eqk ? [S().eq.attack, S().eq.secondary].map(u => u && YI.get(u)).find(same) || null : null;
      const oD = other ? wDmg(other) : null;
      if (D2.light.length) row(d.kind === 'shield' ? t(`Counter-blow|Контрудар|Qarshi zarba`) : d.kind === 'ydcast' ? t(`Bolt|Сгусток|O'q`) : t(`Damage|Урон|Zarar`), D2.light.join('·') + (D2.count > 1 ? ' ×' + D2.count : ''), null, oD ? (xx, yy2) => deltaTxt(ctx, D2.avg, oD.avg, xx, yy2) : null);
      if (D2.heavy) row(d.kind === 'ydcast' ? t(`Burn (hold)|Сожжение (удерж.)|Yondirish (bosib)`) : t(`Charged (hold)|Заряженный (удерж.)|Zaryadlangan (bosib)`), String(D2.heavy));
      if (D2.block) row(t(`Block|Блок|To'sish`), Math.round(D2.block * 100) + '%');
      if (d.kind === 'shield') row(t(`Parry window|Окно парирования|Qaytarish oynasi`), ((d.parryWindow || 9) / 60).toFixed(2) + ' s');
      if (ty === 'weapon') row(t(`Stamina per swing|Выносливость на удар|Har zarbaga chidam`), String(CH.costOf(YI.makeInst(e), false)));
      if (d.cooldown) row(t(`Cooldown|Перезарядка|Tiklanish`), (d.cooldown * G.Perks.mod('cooldown', 1) / 60).toFixed(1) + ' s');
      if (ty === 'weapon') {
        row(t(`Upgrade|Улучшение|Yaxshilash`), '+' + (e.up || 0) + ' / 5', (e.up || 0) >= 5 ? COL.gold : COL.cream);
        const C2 = YI.CAT[yd.cat];
        if (C2 && C2.good) { cy += 0.5; cy += para(ctx, t(`Strong|Сильные стороны|Kuchli tomoni`) + ': ' + t(C2.good), x + 8, cy, w - 16, { size: 4.2, color: '#a8d8a0', maxLines: 2, lh: 5.4 }); cy += para(ctx, t(`Weak|Слабые стороны|Zaif tomoni`) + ': ' + t(C2.bad), x + 8, cy, w - 16, { size: 4.2, color: '#d8a0a0', maxLines: 2, lh: 5.4 }); cy += 1.5; }
        const ns = YI.socketCount(e);
        if (ns) { const ms = e.mods || []; txt(ctx, t(`Sockets|Гнёзда|Uyalar`), x + 8, cy, { size: 4.6, color: COL.dim }); for (let i = 0; i < ns; i++) { const m = ms[i]; const bx = x + w - 8 - (ns - i) * 13; inset(ctx, bx, cy - 1.5, 11, 11, { stroke: m ? COL.gold : rgba(COL.gold, 0.3) }); if (m) icon(ctx, ID[m], null, bx + 5.5, cy + 4, 9); } cy += 10; for (const m of e.mods || []) { cy += para(ctx, '· ' + t(YI.MODS[m].name) + ': ' + t(YI.MODS[m].desc), x + 8, cy, w - 16, { size: 4.2, color: '#c8e8c0', maxLines: 2 }); } }
        if (d.legendName) { cy += 1; txt(ctx, '✦ ' + LANG.T(d.legendName), x + 8, cy, { size: 5, color: '#ffb648', weight: 700, serif: true }); cy += 7; cy += para(ctx, LANG.T(d.legendDesc), x + 8, cy, w - 16, { size: 4.3, color: '#ffe2b8', maxLines: 5 }); }
      }
    } else if (ty === 'armour') {
      const qk = 1 + 0.1 * (e.q || 0);
      const cur = S().eq[yd.slot] && S().eq[yd.slot] !== e.u ? YI.get(S().eq[yd.slot]) : null;
      const ca = cur ? ID[cur.id].yd.armor * (1 + 0.1 * (cur.q || 0)) : 0;
      row(t(`Armour|Броня|Sovut`), String(Math.round(yd.armor * qk)), null, cur ? (xx, yy2) => deltaTxt(ctx, yd.armor * qk, ca, xx, yy2) : null);
      row(t(`Weight|Вес|Og'irlik`), String(yd.weight), cur && cur && yd.weight > ID[cur.id].yd.weight ? COL.bad : null);
      const RN = { bleed: `bleeding|кровотечение|qon ketishi`, poison: `poison|яд|zahar`, burn: `burning|горение|yonish`, frost: `cold|холод|sovuq`, wax: `wax|воск|mum`, void: `Hollowness|Пустота|Bo'shliq` };
      for (const r in yd.res || {}) row(t(`Resist|Сопр.|Chid.`) + ' ' + t(RN[r]), '+' + Math.round(yd.res[r] * qk * 100) + '%', COL.good);
      for (const f in yd.flat || {}) row(f === 'hp' ? t(`Health|Здоровье|Sog'liq`) : t(`Stamina|Выносливость|Chidam`), '+' + yd.flat[f], COL.good);
      if (yd.flasks) row(t(`Flasks|Фляги|Idishlar`), '+' + yd.flasks, COL.good);
      if (yd.set) { const st = YI.SETS[yd.set], have = YI.sets()[yd.set] || 0; cy += 1; txt(ctx, t(st.name) + '  ' + have + '/' + st.n, x + 8, cy, { size: 4.8, color: have >= st.n ? COL.good : '#c8b0e0', weight: 600, serif: true }); cy += 7; cy += para(ctx, t(st.bonus), x + 8, cy, w - 16, { size: 4.2, color: have >= st.n ? '#c8f0c0' : COL.dim, maxLines: 4 }); }
    } else if (ty === 'mod') { row(t(`Where|Где|Qayerda`), '', null); cy -= 7.4; txt(ctx, t(ID[e.id].yd.where || ''), x + w - 8, cy, { size: 4.4, align: 'right', color: COL.cream }); cy += 8; }
    // description
    cy += 2; goldRule(ctx, x + 6, cy, x + w - 6, 0.3); cy += 3;
    cy += para(ctx, LANG.T(d.desc || ''), x + 8, cy, w - 16, { size: 4.6, color: COL.cream, style: 'italic', maxLines: 8 });
    // smith: next upgrade
    if (UI.smith && ty === 'weapon') {
      const c = YI.upgradeCost(e);
      cy = Math.max(cy + 3, y + h - 34);
      inset(ctx, x + 6, cy, w - 12, 16, { fill: 'rgba(40,20,10,0.7)', stroke: flashUp > 0 ? COL.goldL : rgba('#ffb070', 0.5) });
      if (c) { txt(ctx, tf(`Next: +{u} · {g} tilla · {m} ×{n}|Дальше: +{u} · {g} тилла · {m} ×{n}|Keyingi: +{u} · {g} tilla · {m} ×{n}`, { u: (e.up || 0) + 1, g: c.gold, m: LANG.T(ID[c.mat].name), n: c.n }), x + w / 2, cy + 2, { size: 4.4, align: 'center', color: YI.canUpgrade(e) ? COL.bad : COL.good, weight: 600 }); txt(ctx, YI.canUpgrade(e) || t(`Enter — upgrade|Enter — улучшить|Enter — yaxshilash`), x + w / 2, cy + 8.5, { size: 4, align: 'center', color: COL.dim }); }
      else txt(ctx, t(`Upgraded to +5. Nothing more to add.|Улучшено до +5. Больше нечего добавить.|+5 gacha yaxshilangan.`), x + w / 2, cy + 5, { size: 4.4, align: 'center', color: COL.gold });
    }
    // price / sale
    const sp = YI.sellPrice(e);
    if (sp && YI.atRest()) txt(ctx, tf(`Sells for {n} tilla|Продать за {n} тилла|{n} tillaga sotish`, { n: sp }), x + w - 8, y + h - 9, { size: 4.2, align: 'right', color: '#ffd77a' });
  }
  function drawMenu(ctx) {
    const M = UI.menu, w = 132, lh = 10, h = M.A.length * lh + 12;
    const x = 186, y = cl(110 - h / 2, 40, G.H - h - 24);
    panel(ctx, x, y, w, h, { tone: 'dark' });
    M.A.forEach((a, i) => {
      const yy = y + 6 + i * lh, on = M.sel === i;
      if (on) { ctx.fillStyle = 'rgba(226,180,82,0.18)'; ctx.fillRect(x + 4, yy - 1, w - 8, lh - 1); }
      txt(ctx, t(a.label), x + 9, yy + 1, { size: 4.8, color: a.why ? '#8a7a80' : on ? COL.goldL : COL.cream, weight: on ? 600 : 400 });
      HIT.push({ x: x + 4, y: yy - 1, w: w - 8, h: lh - 1, hover: () => { M.sel = i; }, click: () => doAction(M.e, a) });
    });
  }

  /* ---------- the character page ---------- */
  const ATTR_DESC = {
    str: `Staffs, clubs and maces, charged blows, breaking guards. Checks: intimidate, break a door, hold.|Посохи, дубины и булавы, заряженные удары, пробивание защиты. Проверки: запугать, выбить дверь, удержать.|Hassa, to'qmoq va gurzilar, zaryadlangan zarbalar, himoyani yorish. Tekshiruvlar: qo'rqitish, eshik buzish, ushlab turish.`,
    agi: `Sabres, knives, slings and bows; swing speed; critical chance. Checks: a lock, a theft, passing unseen.|Сабли, ножи, праща и лук; скорость ударов; шанс крита. Проверки: замок, кража, пройти незаметно.|Qilich, pichoq, sopqon va kamon; zarba tezligi; kritik ehtimoli. Tekshiruvlar: qulf, o'g'irlik, sezdirmay o'tish.`,
    end: `Health +12 and stamina +5 per point. Checks: endure, drink poison, keep silent under questioning.|Здоровье +12 и выносливость +5 за очко. Проверки: выдержать, выпить отраву, смолчать на допросе.|Har ochkoga sog'liq +12 va chidam +5. Tekshiruvlar: chidash, zahar ichish, so'roqda tilni tiyish.`,
    mem: `The Forbidden Song, dutars, drums and tumar foci; less Hollowness from magic. Checks: Taste, Plant, see through a lie.|Запретная песнь, дутары, бубны и тумары-фокусы; меньше Пустоты от магии. Проверки: Проба, Вселение, распознать ложь.|Yashirin navo, dutor, doira va tumar-fokuslar; sehrdan kamroq Bo'shliq. Tekshiruvlar: Totish, Ekish, yolg'onni ilg'ash.`
  };
  function drawChar(ctx) {
    const s = S(), at = CH.attrs(), p = pl();
    // left: portrait card
    panel(ctx, 16, 38, 112, 198, { tone: 'dark' });
    const hc = heroCanvas();
    if (hc) { const sc = 1.6, w = 72 * sc; const g = ctx.createRadialGradient(72, 104, 2, 72, 104, 50); g.addColorStop(0, 'rgba(255,214,140,0.16)'); g.addColorStop(1, 'rgba(255,214,140,0)'); ctx.fillStyle = g; ctx.fillRect(22, 44, 100, 110); ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(hc, 72 - w / 2, 150 - 66 * sc, w, w); ctx.restore(); }
    txt(ctx, tf(`LEVEL {n}|УРОВЕНЬ {n}|{n}-DARAJA`, { n: s.lvl }), 72, 156, { size: 7, align: 'center', color: COL.goldL, weight: 700, serif: true });
    const need = CH.xpNeed(s.lvl), xk = s.lvl >= CH.MAXLVL ? 1 : cl(s.xp / need, 0, 1);
    inset(ctx, 26, 166, 92, 6, {}); ctx.fillStyle = '#e2b452'; ctx.fillRect(27, 167, 90 * xk, 4); ctx.fillStyle = '#ffe7a6'; ctx.fillRect(27, 167, 90 * xk, 1);
    txt(ctx, s.lvl >= CH.MAXLVL ? t(`The road's end|Предел пути|Yo'l chegarasi`) : s.xp + ' / ' + need + ' ' + t(`experience|опыта|tajriba`), 72, 174, { size: 4.2, align: 'center', color: COL.dim });
    const lg = CH.xpLog();
    txt(ctx, tf(`quests {q} · fights {c} · exploring {e}|задания {q} · бои {c} · поиски {e}|topshiriqlar {q} · janglar {c} · izlanish {e}`, { q: lg.quest || 0, c: lg.combat || 0, e: lg.explore || 0 }), 72, 181, { size: 3.7, align: 'center', color: '#7a6c80' });
    // respec
    const rc = CH.respecCost();
    const rb = { x: 24, y: 208, w: 96, h: 18 };
    inset(ctx, rb.x, rb.y, rb.w, rb.h, { fill: UI.respecArm > 0 ? 'rgba(90,40,20,0.85)' : 'rgba(20,12,24,0.85)', stroke: UI.respecArm > 0 ? '#ffb070' : rgba(COL.gold, 0.35) });
    txt(ctx, t(`Unlearn|Переучиться|Qayta o'rganish`), rb.x + rb.w / 2, rb.y + 2.5, { size: 4.6, align: 'center', color: COL.cream, weight: 600 });
    txt(ctx, (rc ? rc + ' ' + t(`tilla|тилла|tilla`) : t(`once, free|один раз бесплатно|bir marta bepul`)) + '  ·  R', rb.x + rb.w / 2, rb.y + 9.5, { size: 4, align: 'center', color: rc ? '#ffd77a' : COL.good });
    HIT.push({ x: rb.x, y: rb.y, w: rb.w, h: rb.h, click: doRespec });
    txt(ctx, t(`(later: the herbalist in the Tail)|(позже — у травницы в Хвосте)|(keyinroq — Dumdagi tabibda)`), 72, 228, { size: 3.6, align: 'center', color: '#6a5c70' });

    // middle: attributes
    panel(ctx, 134, 38, 176, 198, { tone: 'warm' });
    txt(ctx, t(`ATTRIBUTES|АТРИБУТЫ|ATRIBUTLAR`), 222, 42, { size: 5.4, align: 'center', color: COL.gold, weight: 700, serif: true });
    const left = s.free - pendSum();
    txt(ctx, tf(`points to place: {n}|свободных очков: {n}|bo'sh ochko: {n}`, { n: left }), 222, 50, { size: 4.4, align: 'center', color: left > 0 ? COL.goldL : COL.dim });
    ATTRS.forEach((k, i) => {
      const y = 59 + i * 38, sel = UI.attrSel === i, base = at[k], pv = UI.pend[k];
      inset(ctx, 140, y, 164, 35, { fill: sel ? 'rgba(80,52,20,0.55)' : 'rgba(12,8,16,0.7)', stroke: sel ? COL.goldL : rgba(COL.gold, 0.22), lw: sel ? 0.8 : 0.4 });
      txt(ctx, t(CH.ATTR_NAME[k]), 146, y + 3, { size: 6.2, color: sel ? COL.goldL : COL.cream, weight: 700, serif: true });
      // value and pips with diminishing marks
      const v = base + pv;
      txt(ctx, String(v), 296, y + 2, { size: 8, align: 'right', color: pv ? COL.good : COL.goldL, weight: 700, serif: true });
      for (let j = 0; j < 20; j++) {
        const px = 146 + j * 5.2, py = y + 12;
        ctx.fillStyle = j < base ? (j < 10 ? '#e2b452' : j < 15 ? '#c8a050' : '#9a8050') : j < v ? '#9cf0a0' : 'rgba(80,60,90,0.6)';
        ctx.fillRect(px, py, 4.2, j < 10 ? 3 : j < 15 ? 2.4 : 1.8);
        if (j === 10 || j === 15) { ctx.fillStyle = rgba(COL.gold, 0.5); ctx.fillRect(px - 0.8, py - 1, 0.3, 5); }
      }
      // buttons
      const bm = { x: 254, y: y + 3, w: 9, h: 8 }, bp = { x: 266, y: y + 3, w: 9, h: 8 };
      for (const [b, s2, f] of [[bm, '−', () => { UI.attrSel = i; attrPlus(k, -1); }], [bp, '+', () => { UI.attrSel = i; attrPlus(k, 1); }]]) {
        inset(ctx, b.x, b.y, b.w, b.h, { fill: 'rgba(30,20,10,0.9)', stroke: rgba(COL.gold, 0.5) });
        txt(ctx, s2, b.x + b.w / 2, b.y + 0.6, { size: 6, align: 'center', color: COL.goldL, weight: 700 });
        HIT.push(Object.assign({ click: f }, b));
      }
      HIT.push({ x: 140, y, w: 110, h: 35, hover: () => { UI.attrSel = i; } });
      para(ctx, t(ATTR_DESC[k]), 146, y + 17.5, 150, { size: 3.9, color: COL.dim, maxLines: 3, lh: 5 });
    });
    if (pendSum() > 0) {
      const cb = { x: 168, y: 214, w: 52, h: 13 }, xb = { x: 226, y: 214, w: 52, h: 13 };
      inset(ctx, cb.x, cb.y, cb.w, cb.h, { fill: 'rgba(30,70,30,0.85)', stroke: COL.good }); txt(ctx, t(`Confirm · V|Принять · V|Tasdiqlash · V`), cb.x + cb.w / 2, cb.y + 4, { size: 4.6, align: 'center', color: '#e8ffe0', weight: 600 });
      inset(ctx, xb.x, xb.y, xb.w, xb.h, { fill: 'rgba(60,20,20,0.85)', stroke: COL.bad }); txt(ctx, t(`Reset · X|Сброс · X|Bekor · X`), xb.x + xb.w / 2, xb.y + 4, { size: 4.6, align: 'center', color: '#ffe0d8', weight: 600 });
      HIT.push(Object.assign({ click: attrConfirm }, cb), Object.assign({ click: () => { UI.pend = { str: 0, agi: 0, end: 0, mem: 0 }; } }, xb));
    } else txt(ctx, t(`Full effect to 10 · 70% to 15 · 40% to 20|Полный эффект до 10 · 70% до 15 · 40% до 20|10 gacha to'liq · 15 gacha 70% · 20 gacha 40%`), 222, 218, { size: 4, align: 'center', color: '#7a6c80' });

    // right: derived
    panel(ctx, 316, 38, 148, 198, { tone: 'dark' });
    txt(ctx, t(`THE YODCHI IN NUMBERS|ЁДЧИ В ЦИФРАХ|YODCHI RAQAMLARDA`), 390, 42, { size: 5, align: 'center', color: COL.gold, weight: 700, serif: true });
    let cy = 52;
    const pv = Object.assign({}, at); for (const k of ATTRS) pv[k] += UI.pend[k];
    const hpNow = p ? p.maxHp : 100;
    const hpPrev = Math.round((BAL.HP_BASE + BAL.HP_END * BAL.eff(pv.end) + BAL.HP_LVL * (s.lvl - 1) + CH.gearStat('hp')) * G.Perks.mod('maxHp', 1));
    const r2 = (label, v, o) => { txt(ctx, label, 322, cy, { size: 4.6, color: COL.dim }); txt(ctx, v, 458, cy, { size: 4.8, align: 'right', color: (o && o.col) || COL.cream, weight: 600 }); cy += 7.2; };
    r2(t(`Health|Здоровье|Sog'liq`), hpNow + (hpPrev !== hpNow ? ' → ' + hpPrev : ''), { col: hpPrev !== hpNow ? COL.good : null });
    r2(t(`Stamina|Выносливость|Chidam`), String(CH.maxStam()));
    r2(t(`Damage reduction|Снижение урона|Zarar kamayishi`), Math.round(CH.armor() * 100) + '%');
    r2(t(`Balance (poise)|Равновесие|Muvozanat`), Math.round(CH.poise() * 100) + '%');
    const rs = CH.rollStats();
    r2(t(`Roll|Перекат|Dumalash`), t(rs.name) + ' · ' + (rs.rollI / 60).toFixed(2) + ' s');
    r2(t(`Critical chance|Шанс крита|Kritik ehtimoli`), Math.round(CH.critChance() * 100) + '%');
    const aw = G.run.slots.attack;
    if (aw) { const D2 = wDmg(YI.get(aw.iu) || { id: aw.id, q: 0, up: 0 }); r2(t(`Main weapon|Основное оружие|Asosiy qurol`), D2.light.join('·') + (D2.heavy ? ' / ' + D2.heavy : '')); }
    r2(t(`Hollowness from magic|Пустота от магии|Sehrdan Bo'shliq`), '×' + CH.voidMagicMul().toFixed(2));
    cy += 2; goldRule(ctx, 322, cy, 458, 0.3); cy += 3;
    txt(ctx, t(`Resistances (max 60%)|Сопротивления (макс. 60%)|Chidamlilik (eng ko'pi 60%)`), 322, cy, { size: 4.4, color: COL.gold, weight: 600 }); cy += 7;
    const RES = [['bleed', `Bleeding|Кровотечение|Qon ketishi`, '#d0283c'], ['poison', `Poison|Яд|Zahar`, '#7bd34a'], ['burn', `Burning|Горение|Yonish`, '#ff7a2a'], ['frost', `Cold|Холод|Sovuq`, '#9fe4ff'], ['wax', `Wax|Воск|Mum`, '#f2ead0'], ['void', `Oblivion|Забвение|Unutish`, '#c9b4ff']];
    for (const [k, n2, c2] of RES) {
      const v = CH.res(k);
      txt(ctx, t(n2), 322, cy, { size: 4.2, color: COL.cream });
      ctx.fillStyle = 'rgba(60,40,70,0.7)'; ctx.fillRect(372, cy + 1.5, 60, 2.6); ctx.fillStyle = c2; ctx.fillRect(372, cy + 1.5, 100 * v, 2.6);
      txt(ctx, Math.round(v * 100) + '%', 458, cy, { size: 4.2, align: 'right', color: v > 0 ? COL.cream : '#6a5c70' });
      cy += 6.2;
    }
    cy += 2; goldRule(ctx, 322, cy, 458, 0.3); cy += 3;
    // Hollowness with thresholds
    const vd = R().void;
    txt(ctx, t(`Hollowness|Пустота|Bo'shliq`) + '  ' + vd + ' / 100', 322, cy, { size: 4.6, color: '#c9b4ff', weight: 600 }); cy += 7;
    inset(ctx, 322, cy, 136, 6, {}); ctx.fillStyle = vd >= 75 ? '#e8e0f0' : vd >= 50 ? '#b49cff' : '#8a6ad8'; ctx.fillRect(323, cy + 1, 134 * vd / 100, 4);
    for (const m of [30, 50, 75]) { ctx.fillStyle = COL.goldL; ctx.fillRect(323 + 134 * m / 100, cy - 0.5, 0.5, 7); }
    cy += 8;
    const note = vd >= 75 ? t(`The world loses its colour; people notice.|Мир теряет цвета; люди это замечают.|Dunyo rangsizlanadi; odamlar buni sezadi.`) : vd >= 50 ? t(`Sado's voice is cracking.|Голос Садо прерывается.|Sadoning ovozi uzilib-uzilib chiqyapti.`) : vd >= 30 ? t(`Magic grows stronger.|Магия крепнет.|Sehr kuchaymoqda.`) : t(`Still yourself.|Ты пока ещё ты.|Hali o'zingsan.`);
    para(ctx, note, 322, cy, 136, { size: 4, color: COL.dim, style: 'italic', maxLines: 2 });
    cy += 10;
    // checks preview
    txt(ctx, t(`Checks|Проверки|Tekshiruvlar`) + ':  ' + ATTRS.map(k => t(CH.ATTR_SHORT[k]) + ' ' + at[k]).join(' · '), 322, cy, { size: 3.9, color: '#8a7c90' });
  }

  /* ---------- the skills page ---------- */
  function nodeGlyph(ctx, n, x, y, col) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 0.9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const k = n.icon || n.id;
    ctx.beginPath();
    const G2 = {
      hand: () => { ctx.moveTo(-4, 4); ctx.lineTo(3, -3); ctx.moveTo(1, -4); ctx.lineTo(4, -1); ctx.stroke(); },
      knock: () => { ctx.moveTo(-4, 4); ctx.lineTo(1, -1); ctx.stroke(); ctx.fillRect(0, -4, 4, 4); },
      eye: () => { ctx.ellipse(0, 0, 4.5, 2.5, 0, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 1.2, 0, 7); ctx.fill(); },
      count: () => { for (let i = 0; i < 4; i++) ctx.fillRect(-4 + i * 2.2, -3, 1, 6); ctx.moveTo(-5, 3); ctx.lineTo(5, -3); ctx.stroke(); },
      blood: () => { ctx.moveTo(0, -4); ctx.quadraticCurveTo(4, 1, 0, 4); ctx.quadraticCurveTo(-4, 1, 0, -4); ctx.fill(); },
      parry: () => { ctx.arc(0, 0, 4, -2.2, 0.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-3, 3); ctx.lineTo(3, -3); ctx.stroke(); },
      execute: () => { ctx.moveTo(-4, -4); ctx.lineTo(4, 4); ctx.moveTo(4, -4); ctx.lineTo(-4, 4); ctx.stroke(); },
      twin: () => { ctx.moveTo(-4, 4); ctx.lineTo(1, -3); ctx.moveTo(4, 4); ctx.lineTo(-1, -3); ctx.stroke(); },
      volley: () => { for (const a of [-0.5, 0, 0.5]) { ctx.moveTo(-4, 2); ctx.lineTo(-4 + Math.cos(a - 0.5) * 8, 2 + Math.sin(a - 0.5) * 8); } ctx.stroke(); },
      debt: () => { ctx.rect(-3.5, -3.5, 7, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.moveTo(0, -2); ctx.lineTo(0, 2); ctx.stroke(); },
      nothing: () => { ctx.arc(0, 0, 3.8, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-3, 3); ctx.lineTo(3, -3); ctx.stroke(); },
      last: () => { for (let i = 0; i < 5; i++) ctx.fillRect(-5 + i * 2.2, 3 - i * 1.6, 1.3, 1.6 + i * 1.6); },
      route: () => { ctx.moveTo(-4, 3); ctx.quadraticCurveTo(0, -6, 4, 3); ctx.stroke(); },
      roll: () => { ctx.arc(0, 0, 3.6, 0.4, 5.6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(3.4, -2); ctx.lineTo(4.4, 0.6); ctx.lineTo(1.8, 0.2); ctx.fill(); },
      chapan: () => { ctx.moveTo(-3, -4); ctx.lineTo(3, -4); ctx.lineTo(4, 4); ctx.lineTo(-4, 4); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, 4); ctx.stroke(); },
      breath: () => { ctx.moveTo(-4, -1); ctx.quadraticCurveTo(0, -4, 4, -1); ctx.moveTo(-4, 2); ctx.quadraticCurveTo(0, -1, 4, 2); ctx.stroke(); },
      block: () => { ctx.moveTo(0, -4); ctx.lineTo(4, -2); ctx.lineTo(3, 2); ctx.lineTo(0, 4); ctx.lineTo(-3, 2); ctx.lineTo(-4, -2); ctx.closePath(); ctx.stroke(); },
      salt: () => { ctx.fillRect(-3, 0, 2.5, 2.5); ctx.fillRect(0.5, -2, 3, 3); ctx.fillRect(-1, 2.5, 2, 2); },
      streets: () => { ctx.moveTo(-4, 4); ctx.lineTo(-4, -2); ctx.lineTo(0, -4); ctx.lineTo(4, -2); ctx.lineTo(4, 4); ctx.stroke(); ctx.beginPath(); ctx.arc(2, -5, 1, 0, 7); ctx.fill(); },
      herbs: () => { ctx.moveTo(0, 4); ctx.lineTo(0, -3); ctx.stroke(); ctx.beginPath(); ctx.ellipse(-2, -1, 2, 1, 0.5, 0, 7); ctx.ellipse(2, -2, 2, 1, -0.5, 0, 7); ctx.fill(); },
      traps: () => { ctx.arc(0, 1, 3.5, Math.PI, 0); ctx.stroke(); for (let i = -3; i <= 3; i += 2) { ctx.beginPath(); ctx.moveTo(i, 1); ctx.lineTo(i, -1.5); ctx.stroke(); } },
      spine: () => { for (let i = 0; i < 4; i++) ctx.fillRect(-2, -4 + i * 2.2, 4, 1.4); },
      command: () => { ctx.moveTo(-4, 4); ctx.lineTo(-4, -4); ctx.lineTo(3, -2.5); ctx.lineTo(-4, -1); ctx.stroke(); },
      forty: () => { ctx.font = '700 5px ' + SERIF; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('40', 0, 0.3); },
      spark: () => { ctx.moveTo(-2, -4); ctx.lineTo(1, -0.5); ctx.lineTo(-1, 0.5); ctx.lineTo(2, 4); ctx.stroke(); },
      whisper: () => { ctx.arc(-1, 0, 2, -1, 1); ctx.stroke(); ctx.beginPath(); ctx.arc(-1, 0, 4, -0.9, 0.9); ctx.stroke(); },
      wax: () => { ctx.ellipse(0, 1, 4, 3, 0, 0, 7); ctx.fill(); },
      forget: () => { ctx.arc(0, 0, 3.6, 0.6, 5.6); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 0.9, 0, 7); ctx.fill(); },
      dutarN: () => { ctx.ellipse(-2, 2, 2.5, 2, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(4, -4); ctx.stroke(); },
      alien: () => { ctx.arc(0, 1, 3, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -1); ctx.stroke(); },
      cheap: () => { ctx.arc(0, 0, 3.6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(2, 0); ctx.stroke(); },
      tfire: () => { ctx.moveTo(0, -4); ctx.lineTo(4, 3); ctx.lineTo(-4, 3); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 1, 1.4, 0, 7); ctx.fill(); },
      echo: () => { for (const r of [1.5, 3, 4.5]) { ctx.beginPath(); ctx.arc(-2, 0, r, -0.8, 0.8); ctx.stroke(); } },
      well: () => { ctx.arc(0, 0, 4, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 2, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 0.7, 0, 7); ctx.fill(); },
      reson: () => { ctx.moveTo(-4, 0); for (let i = 0; i <= 8; i++) ctx.lineTo(-4 + i, Math.sin(i * 1.4) * 3); ctx.stroke(); },
      song: () => { star8(ctx, 0, 0, 4.5, col); }
    };
    (G2[k] || (() => { ctx.arc(0, 0, 2.5, 0, 7); ctx.fill(); }))();
    ctx.restore();
  }
  function drawSkills(ctx) {
    const tab = UI.skTab;
    // tab plates
    const tw = 112;
    for (let k = 0; k < 2; k++) {
      const x = G.W / 2 - tw - 4 + k * (tw + 8), on = tab === k;
      plate(ctx, x, 37, tw, on ? (k ? '#14524e' : '#5a3a14') : '#241a30', on);
      const lab = k === 0 ? t(`THE YODCHI|ЁДЧИ|YODCHI`) + '  ·  ' + tf(`points {n}|очков: {n}|ochko: {n}`, { n: CH.skillPoints() }) : t(`SADO|САДО|SADO`) + '  ·  ' + tf(`points {n}|очков: {n}|ochko: {n}`, { n: PR.ptsS() });
      txt(ctx, lab + '   ' + (k ? 'E' : 'Q'), x + tw / 2, 39.4, { size: 4.8, align: 'center', color: on ? (k ? '#bff8ee' : COL.goldL) : COL.dim, weight: 600, serif: true });
      HIT.push({ x, y: 36, w: tw, h: 13, click: () => { UI.skTab = k; UI.skSel = 0; sfx('ui_move'); } });
    }
    const Lo = skLayout(), list = skNodes();
    if (tab === 0) {
      PR.BRANCHES.forEach((b, i) => {
        const bx = Lo.x0 + i * (Lo.bw + Lo.gap), pts = PR.branchPoints(i);
        panel(ctx, bx, 54, Lo.bw, 140, { tone: 'dark' });
        txt(ctx, t(b.name).toUpperCase(), bx + Lo.bw / 2, 57, { size: 5.4, align: 'center', color: b.col, weight: 700, serif: true });
        txt(ctx, tf(`{n} points in the branch|{n} очков в ветви|shoxda {n} ochko`, { n: pts }), bx + Lo.bw / 2, 64.5, { size: 3.8, align: 'center', color: COL.dim });
        for (let tier = 0; tier < 4; tier++) {
          const y = 84 + tier * 30, open2 = pts >= PR.NEED[tier];
          ctx.fillStyle = open2 ? rgba(b.col, 0.07) : 'rgba(0,0,0,0.25)'; ctx.fillRect(bx + 4, y - 13, Lo.bw - 8, 27);
          txt(ctx, String(PR.NEED[tier]), bx + 7, y - 3, { size: 4.4, color: open2 ? b.col : '#5a4c60', weight: 700 });
          if (!open2) { ctx.strokeStyle = 'rgba(120,100,130,0.35)'; ctx.setLineDash([1, 1.4]); ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(bx + 14, y - 13); ctx.lineTo(bx + Lo.bw - 6, y - 13); ctx.stroke(); ctx.setLineDash([]); }
        }
        // links between tiers
        ctx.strokeStyle = rgba(b.col, 0.25); ctx.lineWidth = 0.5;
        for (let tier = 0; tier < 3; tier++) for (let j = 0; j < 3; j++) { const x = bx + 24 + j * 42; ctx.beginPath(); ctx.moveTo(x, 84 + tier * 30 + 11); ctx.lineTo(x, 84 + (tier + 1) * 30 - 11); ctx.stroke(); }
      });
    } else {
      PR.SCOL.forEach((c, i) => { const bx = Lo.x0 + i * (Lo.bw + Lo.gap); panel(ctx, bx, 54, Lo.bw, 140, { tone: 'dark' }); txt(ctx, t(c).toUpperCase(), bx + Lo.bw / 2, 58, { size: 5.4, align: 'center', color: '#9ff3e6', weight: 700, serif: true }); });
    }
    for (const b of Lo.out) {
      const n = b.n, r = tab === 0 ? PR.rank(n.id) : PR.rankS(n.id), sel = UI.skSel === b.i;
      const why = tab === 0 ? PR.whyNotY(n) : PR.whyNotS(n);
      const locked = r === 0 && (tab === 0 ? PR.branchPoints(n.br) < PR.NEED[n.tier] : !!(n.need && !n.need()));
      const bc = tab === 0 ? PR.BRANCHES[n.br].col : '#9ff3e6';
      const canBuy = !why;
      ctx.save();
      if (sel) { ctx.shadowColor = bc; ctx.shadowBlur = 6; }
      ctx.beginPath(); if (n.key) { ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.PI / 4); ctx.rect(-b.r * 0.85, -b.r * 0.85, b.r * 1.7, b.r * 1.7); ctx.restore(); } else ctx.arc(b.x, b.y, b.r, 0, 7);
      ctx.fillStyle = r > 0 ? mix(bc, '#000000', 0.55) : locked ? '#120c16' : '#1c1424'; ctx.fill();
      ctx.lineWidth = sel ? 1.1 : 0.7; ctx.strokeStyle = sel ? COL.goldL : r > 0 ? bc : canBuy ? rgba(bc, 0.9) : 'rgba(110,90,120,0.6)'; ctx.stroke();
      ctx.restore();
      if (canBuy && UI.t % 50 < 30) { ctx.strokeStyle = rgba(bc, 0.5); ctx.lineWidth = 0.4; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 2, 0, 7); ctx.stroke(); }
      if (flashNode && flashNode.i === b.i) { ctx.strokeStyle = rgba('#ffffff', flashNode.t / 30); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 6 * (1 - flashNode.t / 30), 0, 7); ctx.stroke(); }
      nodeGlyph(ctx, tab === 0 ? n : { icon: ['eye', 'parry', 'breath', 'song', 'route', 'whisper', 'forget', 'alien'][b.i] }, b.x, b.y, r > 0 ? '#fff4d8' : locked ? '#5a4c60' : bc);
      for (let k = 0; k < n.max; k++) { ctx.fillStyle = k < r ? bc : 'rgba(90,70,100,0.8)'; ctx.fillRect(b.x - n.max * 2 + k * 4 + 0.5, b.y + b.r + 1.8, 3, 1.6); }
      if (n.active) { txt(ctx, 'Q/E', b.x + b.r - 1, b.y - b.r - 2, { size: 3.2, color: '#c9b4ff', weight: 700 }); }
      HIT.push({ x: b.x - b.r - 2, y: b.y - b.r - 2, w: 2 * b.r + 4, h: 2 * b.r + 4, hover: () => { UI.skSel = b.i; }, click: () => { if (UI.skSel === b.i) skBuy(); else { UI.skSel = b.i; sfx('ui_move'); } } });
    }
    // detail
    const n = list[UI.skSel] || list[0];
    if (!n) return;
    const r = tab === 0 ? PR.rank(n.id) : PR.rankS(n.id), why = tab === 0 ? PR.whyNotY(n) : PR.whyNotS(n);
    panel(ctx, 30, 199, G.W - 60, 36, { tone: 'warm' });
    const nm2 = tab === 0 ? t(n.name) : PR.NNAME(n), ds2 = tab === 0 ? t(n.desc) : PR.NDESC(n);
    txt(ctx, nm2 + '   ' + r + '/' + n.max, 38, 202, { size: 6, color: tab === 0 ? PR.BRANCHES[n.br].col : '#9ff3e6', weight: 700, serif: true });
    para(ctx, ds2, 38, 210, G.W - 76, { size: 4.6, color: COL.cream, maxLines: 3, lh: 6 });
    txt(ctx, why || t(`Enter — learn|Enter — изучить|Enter — o'rganish`), G.W - 38, 202.5, { size: 4.6, align: 'right', color: why ? COL.bad : COL.good, weight: 600 });
    if (tab === 1) txt(ctx, t(`Her points come from the story: memories you find, her trust, the truth.|Её очки даёт история: найденные воспоминания, её доверие, правда.|Uning ochkolarini voqealar beradi: topilgan xotiralar, ishonchi, haqiqat.`), G.W / 2, 194.5, { size: 4, align: 'center', color: '#7a8a90', style: 'italic' });
  }

  UI._dbg = { panel, txt, inset, plate, heroCanvas, baked, CACHE, para };
  // a hint on the field when points are waiting
  SMOOTH_DRAW.push((ctx, st) => {
    if (st !== 'play' || UI.open || !G.run || R().ended || (G.UI.isOpen && G.UI.isOpen())) return;
    const a = CH.skillPoints(), b = PR.ptsS(), c = S().free;
    if (a <= 0 && b <= 0 && c <= 0) return;
    const parts = [];
    if (c > 0) parts.push('[C] ' + tf(`attributes +{n}|атрибуты +{n}|atributlar +{n}`, { n: c }));
    if (a > 0) parts.push('[T] ' + tf(`yodchi +{n}|ёдчи +{n}|yodchi +{n}`, { n: a }));
    if (b > 0) parts.push(tf(`Sado +{n}|Садо +{n}|Sado +{n}`, { n: b }));
    txt(ctx, parts.join('   '), 104, 47.5, { size: 4.8, color: '#f2c14a', weight: 600 });
  });
}
