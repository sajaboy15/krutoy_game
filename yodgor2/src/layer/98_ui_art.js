/* =====================================================================
   UI art — dialogue presentation, choices, toasts, cards, HUD frames,
   Sado's subtitles and the title logo.
   - Painted HD portraits (bust in a majolica arch) baked once per screen
     scale on the text layer; idle: blink, breathing, Sado's pulse.
   - The engine still owns input, timing and the typewriter: we only hide
     its drawing for a moment (alpha 0 / skipped card) and draw our own
     from the same state, so nothing about the flow changes.
   ===================================================================== */
{
  const UA = G.UI_ART = { on: true, stats: { bakes: 0 } };
  const D = () => G.UI._debug();
  const K = () => Math.max(1, Math.min(6, G.uiScale || (G.hud ? G.hud.width / G.UW : 2)));
  const FR = () => G.frame || 0;
  const SERIF = '"Palatino Linotype", "Book Antiqua", Palatino, Georgia, "DejaVu Serif", serif';
  const SANS = G.FONT_UI || '"Rubik", "Trebuchet MS", sans-serif';
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);
  const oc = x => 1 - Math.pow(1 - cl(x, 0, 1), 3);
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; };
  const rng = seed => { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let x = s; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; };
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; };
  const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgba = (h, a) => { const [r, g, b] = hex(h); return `rgba(${r},${g},${b},${a})`; };
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join(''); };
  const dark = (h, k) => mix(h, '#000000', k), light = (h, k) => mix(h, '#ffffff', k);

  /* ---------- caches (keyed by screen scale) ---------- */
  const CACHE = new Map();
  function baked(key, w, h, paint) {
    const k = K(), id = key + '@' + k;
    let c = CACHE.get(id);
    if (c) { CACHE.delete(id); CACHE.set(id, c); return c; }
    c = mk(w * k, h * k); c.uw = w; c.uh = h;
    const x = c.getContext('2d'); x.scale(k, k);
    try { paint(x, w, h, k); } catch (e) { console.error('[ui art]', key, e); }
    UA.stats.bakes++;
    CACHE.set(id, c);
    if (CACHE.size > 40) CACHE.delete(CACHE.keys().next().value);
    return c;
  }
  const blit = (ctx, c, x, y, w, h) => { if (c) ctx.drawImage(c, x, y, w === undefined ? c.uw : w, h === undefined ? c.uh : h); };

  /* ---------- HD text ---------- */
  // glowing text is baked once (shadowBlur every frame is expensive)
  function glowTxt(ctx, s, x, y, o) {
    const pad = (o.glowR || 4) * 2 + 2, size = o.size || 7;
    const key = 'gt|' + s + '|' + size + '|' + (o.weight || 400) + (o.style || '') + (o.font || 'S') + '|' + (o.grad ? o.grad.join() : o.color) + '|' + o.glow + (o.glowR || 4) + '|' + (o.ls || 0) + (o.stroke || '');
    const w = tw(ctx, s, o);
    const c = baked(key, w + pad * 2, size * 1.4 + pad * 2, cc => {
      const oo = Object.assign({}, o, { align: 'left' });
      if (o.grad) { const g = cc.createLinearGradient(0, pad, 0, pad + size); o.grad.forEach((col, i) => g.addColorStop(i / (o.grad.length - 1), col)); oo.color = g; }
      txtRaw(cc, s, pad, pad, oo);
    });
    const ax = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.drawImage(c, ax - pad, y - pad, c.uw, c.uh);
  }
  function txt(ctx, s, x, y, o) {
    o = o || {};
    s = String(s);
    if (o.glow) return glowTxt(ctx, s, x, y, o);
    txtRaw(ctx, s, x, y, o);
  }
  function txtRaw(ctx, s, x, y, o) {
    ctx.font = (o.style || '') + ' ' + (o.weight || 400) + ' ' + (o.size || 7) + 'px ' + (o.font || SANS);
    ctx.textAlign = o.align || 'left'; ctx.textBaseline = o.base || 'top';
    if (o.ls) { try { ctx.letterSpacing = o.ls + 'px'; } catch (e) { /* old */ } }
    if (o.glow) { ctx.save(); ctx.shadowColor = o.glow; ctx.shadowBlur = (o.glowR || 4) * K(); ctx.fillStyle = o.glow; ctx.fillText(s, x, y); ctx.restore(); }
    if (o.shadow !== false) { ctx.fillStyle = o.shadow || 'rgba(8,4,12,0.85)'; ctx.fillText(s, x + (o.sx || 0), y + (o.sy === undefined ? (o.size || 7) * 0.1 : o.sy)); }
    if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.strokeW || 1; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = o.color || '#f2e6c8'; ctx.fillText(s, x, y);
    if (o.ls) { try { ctx.letterSpacing = '0px'; } catch (e) { /* old */ } }
  }
  const TWM = new Map();
  function tw(ctx, s, o) {
    o = o || {};
    const key = (o.style || '') + (o.weight || 400) + '|' + (o.size || 7) + (o.font || 'S') + '|' + (o.ls || 0) + '|' + s;
    let v = TWM.get(key);
    if (v === undefined) { v = twRaw(ctx, s, o); if (TWM.size > 800) TWM.clear(); TWM.set(key, v); }
    return v;
  }
  function twRaw(ctx, s, o) {
    ctx.font = (o.style || '') + ' ' + (o.weight || 400) + ' ' + (o.size || 7) + 'px ' + (o.font || SANS);
    if (o.ls) { try { ctx.letterSpacing = o.ls + 'px'; } catch (e) { /* old */ } }
    const w = ctx.measureText(String(s)).width;
    if (o.ls) { try { ctx.letterSpacing = '0px'; } catch (e) { /* old */ } }
    return w;
  }

  /* =====================================================================
     ORNAMENT: majolica tiles, girih stars, gold rules
     ===================================================================== */
  const COL = {
    ink: '#07040a', panel: '#160f20', panel2: '#21182e', gold: '#e2b452', goldL: '#ffe7a6', goldD: '#7a5420',
    cob: '#1d4c9a', cobD: '#0c2350', turq: '#2fb3b8', turqL: '#8ff0e8', white: '#eef3ec', cream: '#f2e6c8', red: '#a8323a'
  };
  function star8(c, x, y, r, fill, stroke, lw) {
    c.beginPath();
    for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 - Math.PI / 2, rr = i & 1 ? r * 0.62 : r; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 0.4; c.stroke(); }
  }
  function rosette(c, x, y, r) {
    star8(c, x, y, r + 0.6, COL.ink);
    star8(c, x, y, r, COL.gold, COL.goldD, 0.3);
    star8(c, x, y, r * 0.55, COL.turq);
    c.fillStyle = COL.goldL; c.beginPath(); c.arc(x - r * 0.12, y - r * 0.12, r * 0.18, 0, 6.3); c.fill();
  }
  function diamond(c, x, y, r, fill, stroke) {
    c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r, y); c.lineTo(x, y + r); c.lineTo(x - r, y); c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.lineWidth = 0.35; c.stroke(); }
  }
  // a tile band (cobalt ground, white/turquoise four-petal flowers, gold seams), along x from x0..x1
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
  // faint girih lattice
  function girih(c, x0, y0, w, h, step, col, lw) {
    c.save(); c.beginPath(); c.rect(x0, y0, w, h); c.clip();
    c.strokeStyle = col; c.lineWidth = lw || 0.3;
    for (let y = y0 - step; y < y0 + h + step; y += step) {
      for (let x = x0 - step, i = 0; x < x0 + w + step; x += step, i++) {
        const cx = x + ((Math.round((y - y0) / step) & 1) ? step / 2 : 0), cy = y;
        star8(c, cx, cy, step * 0.34, null, col, lw);
        c.beginPath(); c.moveTo(cx + step * 0.34, cy); c.lineTo(cx + step * 0.66, cy); c.stroke();
      }
    }
    c.restore();
  }
  function goldRule(c, x0, y, x1, w) {
    const g = c.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, COL.goldD); g.addColorStop(0.5, COL.goldL); g.addColorStop(1, COL.goldD);
    c.fillStyle = g; c.fillRect(x0, y, x1 - x0, w || 0.6);
  }
  function chamfer(c, x, y, w, h, r) {
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.lineTo(x + w, y + r); c.lineTo(x + w, y + h - r); c.lineTo(x + w - r, y + h);
    c.lineTo(x + r, y + h); c.lineTo(x, y + h - r); c.lineTo(x, y + r); c.closePath();
  }

  /* ---------- the dialog/choice panel ---------- */
  // m = margin for the drop shadow; body at (m, m, w, h)
  function panelArt(w, h, o) {
    o = o || {};
    const m = 6;
    return baked('panel' + w + 'x' + h + (o.band ? 'b' : '') + (o.key || ''), w + 2 * m, h + 2 * m, c => {
      c.save(); c.filter = `blur(${2.5 * K()}px)`; c.fillStyle = 'rgba(0,0,0,0.75)'; chamfer(c, m - 1, m + 1.5, w + 2, h + 1, 3); c.fill(); c.restore();
      chamfer(c, m, m, w, h, 3); c.fillStyle = COL.ink; c.fill();
      chamfer(c, m + 0.8, m + 0.8, w - 1.6, h - 1.6, 2.4);
      const g = c.createLinearGradient(0, m, 0, m + h);
      g.addColorStop(0, o.top || '#231a33'); g.addColorStop(0.45, o.mid || '#170f22'); g.addColorStop(1, o.bot || '#0d0814');
      c.fillStyle = g; c.fill();
      c.save(); c.clip();
      girih(c, m, m, w, h, 9, 'rgba(226,180,82,0.045)', 0.35);
      const rg = c.createRadialGradient(m + w * 0.3, m, 0, m + w * 0.3, m, w * 0.7);
      rg.addColorStop(0, 'rgba(255,220,160,0.07)'); rg.addColorStop(1, 'rgba(255,220,160,0)');
      c.fillStyle = rg; c.fillRect(m, m, w, h);
      c.restore();
      // frame: gold double line
      c.lineWidth = 0.55; c.strokeStyle = COL.gold;
      chamfer(c, m + 1.6, m + 1.6, w - 3.2, h - 3.2, 2); c.stroke();
      c.lineWidth = 0.3; c.strokeStyle = rgba(COL.gold, 0.45);
      chamfer(c, m + 2.8, m + 2.8, w - 5.6, h - 5.6, 1.6); c.stroke();
      if (o.band) {
        tileBand(c, m + 6, m - 0.2, m + w - 6, 3.2);
        goldRule(c, m + 6, m - 0.8, m + w - 6, 0.6); goldRule(c, m + 6, m + 3, m + w - 6, 0.5);
      }
      // corners
      for (const [x, y] of [[m + 2.2, m + 2.2], [m + w - 2.2, m + 2.2], [m + 2.2, m + h - 2.2], [m + w - 2.2, m + h - 2.2]]) rosette(c, x, y, 2.6);
      // bottom centre knot
      diamond(c, m + w / 2, m + h - 0.4, 1.8, COL.ink); diamond(c, m + w / 2, m + h - 0.4, 1.3, COL.gold); diamond(c, m + w / 2, m + h - 0.4, 0.6, COL.turq);
    });
  }
  const drawPanel = (ctx, x, y, w, h, o) => { const c = panelArt(w, h, o); ctx.drawImage(c, x - 6, y - 6, c.uw, c.uh); };

  // name cartouche (pointed ends)
  function plateArt(w, col) {
    const h = 13, m = 4;
    return baked('plate' + Math.round(w) + col, w + 2 * m, h + 2 * m, c => {
      const x = m, y = m;
      const P = (dx) => { c.beginPath(); c.moveTo(x + dx, y + h / 2); c.lineTo(x + 5 + dx * 0.4, y + dx * 0.4); c.lineTo(x + w - 5 - dx * 0.4, y + dx * 0.4); c.lineTo(x + w - dx, y + h / 2); c.lineTo(x + w - 5 - dx * 0.4, y + h - dx * 0.4); c.lineTo(x + 5 + dx * 0.4, y + h - dx * 0.4); c.closePath(); };
      c.save(); c.filter = `blur(${1.5 * K()}px)`; c.fillStyle = 'rgba(0,0,0,0.7)'; c.translate(0, 1); P(-0.5); c.fill(); c.restore();
      P(0); c.fillStyle = COL.ink; c.fill();
      P(0.8); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, light(col, 0.12)); g.addColorStop(0.5, col); g.addColorStop(1, dark(col, 0.45)); c.fillStyle = g; c.fill();
      c.lineWidth = 0.55; c.strokeStyle = COL.gold; P(1.5); c.stroke();
      c.save(); P(1.5); c.clip(); girih(c, x, y, w, h, 6, 'rgba(255,230,170,0.08)', 0.3); c.restore();
      diamond(c, x + 2.6, y + h / 2, 1.3, COL.goldL); diamond(c, x + w - 2.6, y + h / 2, 1.3, COL.goldL);
    });
  }

  /* ---------- the portrait arch ---------- */
  const ARCH = { w: 100, h: 144, spring: 46 };
  function archPath(c, x, y, w, h, spring, keep) {
    // pointed (four-centred) arch
    if (!keep) c.beginPath();
    c.moveTo(x, y + h); c.lineTo(x, y + spring);
    c.bezierCurveTo(x, y + spring * 0.42, x + w * 0.3, y + spring * 0.12, x + w / 2, y);
    c.bezierCurveTo(x + w * 0.7, y + spring * 0.12, x + w, y + spring * 0.42, x + w, y + spring);
    c.lineTo(x + w, y + h); c.closePath();
  }
  function archFrame() {
    const { w, h, spring } = ARCH, m = 6;
    return baked('archF', w + 2 * m, h + 2 * m, c => {
      const x = m, y = m;
      c.save(); c.beginPath(); c.rect(0, 0, w + 2 * m, h + 2 * m); archPath(c, x + 2, y + 3, w - 4, h - 3, spring, true); c.clip('evenodd');
      c.filter = `blur(${3 * K()}px)`; c.fillStyle = 'rgba(0,0,0,0.7)'; archPath(c, x - 1, y + 2, w + 2, h, spring); c.fill(); c.restore();
      // inner shadow under the band
      c.save(); archPath(c, x + 4.2, y + 5.6, w - 8.4, h - 5.6, spring - 3.2); c.clip(); c.filter = `blur(${2 * K()}px)`; c.lineWidth = 3; c.strokeStyle = 'rgba(0,0,0,0.6)'; archPath(c, x + 4.2, y + 5.6, w - 8.4, h - 5.6, spring - 3.2); c.stroke(); c.restore();
      // band
      c.save();
      archPath(c, x, y, w, h, spring); archPath(c, x + 4.2, y + 5.6, w - 8.4, h - 5.6, spring - 3.2, true);
      c.clip('evenodd');
      c.fillStyle = COL.ink; c.fillRect(x - 2, y - 2, w + 4, h + 4);
      archPath(c, x + 0.7, y + 0.9, w - 1.4, h - 0.9, spring - 0.3); c.fillStyle = COL.cobD; c.fill();
      // tiles around the band
      const r = rng(7);
      for (let i = 0; i < 160; i++) {
        const t = i / 160, P = archPt(t, x + 2.1, y + 2.8, w - 4.2, h - 2.8, spring - 1.6);
        if (!P) continue;
        c.fillStyle = i % 2 ? COL.turq : COL.white;
        if (i % 4 === 0) { diamond(c, P[0], P[1], 1.25, COL.white); c.fillStyle = COL.gold; c.beginPath(); c.arc(P[0], P[1], 0.45, 0, 6.3); c.fill(); }
        else if (i % 4 === 2) { diamond(c, P[0], P[1], 0.85, COL.turq); }
        void r;
      }
      c.restore();
      c.lineWidth = 0.7; c.strokeStyle = COL.gold; archPath(c, x + 0.4, y + 0.5, w - 0.8, h - 0.5, spring); c.stroke();
      c.lineWidth = 0.55; archPath(c, x + 4.2, y + 5.6, w - 8.4, h - 5.6, spring - 3.2); c.stroke();
      c.lineWidth = 0.3; c.strokeStyle = rgba(COL.goldL, 0.5); archPath(c, x + 5.0, y + 6.6, w - 10, h - 6.6, spring - 3.8); c.stroke();
      // keystone and springers
      rosette(c, x + w / 2, y + 2.6, 3.4);
      for (const sx of [x + 2.1, x + w - 2.1]) { diamond(c, sx, y + spring, 2.4, COL.ink); diamond(c, sx, y + spring, 1.8, COL.gold); diamond(c, sx, y + spring, 0.8, COL.turq); }
      // sill
      const sy = y + h - 5;
      c.fillStyle = COL.ink; c.fillRect(x - 2, sy - 0.6, w + 4, 6.4);
      const g = c.createLinearGradient(0, sy, 0, sy + 5); g.addColorStop(0, '#5a3c1a'); g.addColorStop(1, '#2a1a0c'); c.fillStyle = g; c.fillRect(x - 1.4, sy, w + 2.8, 5);
      goldRule(c, x - 1.4, sy, x + w + 1.4, 0.6);
      for (let i = 0; i < 9; i++) diamond(c, x + 6 + i * (w - 12) / 8, sy + 2.7, 1, i % 2 ? COL.turq : COL.gold);
    });
  }
  // point along the arch outline, t in 0..1 from bottom-left, up, over, down to bottom-right
  function archPt(t, x, y, w, h, spring) {
    const side = h - spring, curve = w * 0.9, L = 2 * side + 2 * curve;
    let d = t * L;
    if (d < side) return [x, y + h - d];
    d -= side;
    if (d < 2 * curve) {
      const u = d / (2 * curve);
      const bz = (p0, p1, p2, p3, s) => { const q = 1 - s; return q * q * q * p0 + 3 * q * q * s * p1 + 3 * q * s * s * p2 + s * s * s * p3; };
      if (u < 0.5) { const s = u * 2; return [bz(x, x, x + w * 0.3, x + w / 2, s), bz(y + spring, y + spring * 0.42, y + spring * 0.12, y, s)]; }
      const s = (u - 0.5) * 2; return [bz(x + w / 2, x + w * 0.7, x + w, x + w, s), bz(y, y + spring * 0.12, y + spring * 0.42, y + spring, s)];
    }
    d -= 2 * curve;
    if (d < side) return [x + w, y + spring + d];
    return null;
  }

  /* =====================================================================
     PORTRAITS — painted busts, 100×144 units, facing a little to the right
     ===================================================================== */
  const PW = 100, PH = 144;
  const SPEC = {
    hero: { name: 'Ravshan', skin: '#c4916a', hair: '#1e1716', beard: 'short', beardC: '#1e1716', head: 'doppi', headC: '#15121a', robe: '#2b3a6b', robe2: '#1c2648', trim: '#d9a441', shirt: '#e6dcc6', fur: '#5e4632', eye: '#3a2414', tired: 1, rim: '#8ff0e8', bg: ['#2a3a6a', '#0b0f22'], light: '#ffd9a0', jaw: 0.6 },
    aksakal: { name: 'Rustam', skin: '#b88865', age: 1, hair: '#e6e0d6', beard: 'long', beardC: '#ece7de', head: 'turban', headC: '#e6dcc4', robe: '#6a3a28', robe2: '#3e2016', ikat: '#c88a3a', trim: '#c9963c', shirt: '#d8cdb6', eye: '#6a6258', hollow: 1, rim: '#f2c27a', bg: ['#5a3a2e', '#140b08'], light: '#ffcf96', jaw: 0.5 },
    shaman: { name: 'Turab', skin: '#b07e5c', age: 0.8, hair: '#9a948a', beard: 'thin', beardC: '#a8a298', mous: 'long', head: 'doppi', headC: '#1f5a50', headM: '#e2b452', robe: '#1f4a56', robe2: '#10282e', ikat: '#4fa89a', trim: '#c9963c', shirt: '#c8bca0', scarf: '#5a2a2a', eye: '#2a1e16', rim: '#8ff0e8', bg: ['#1f4a56', '#071618'], light: '#ffd9a0', jaw: 0.3, gaunt: 1 },
    shirin: { name: 'Shirin', f: 1, skin: '#c4916a', age: 0.9, hair: '#e8e2d6', longHair: 1, head: 'veil', headC: '#ece5d6', robe: '#3a2f6e', robe2: '#1e1840', trim: '#e2b452', shirt: '#ece5d6', eye: '#2a1a12', stern: 1, pendant: '#e2b452', rim: '#c9b4ff', bg: ['#2b2446', '#0a0816'], light: '#ffe2b8', jaw: 0.3 },
    nargiza: { name: 'Nargiza', f: 1, skin: '#d6a57c', hair: '#141010', braids: 1, head: 'cap', headC: '#262634', headM: '#e8f4ee', robe: '#2a8f94', robe2: '#13484c', trim: '#e8f4ee', shirt: '#e8f4ee', eye: '#2a1a14', waves: '#8ff6ef', rim: '#8ff6ef', bg: ['#17384a', '#06121a'], light: '#ffe6c0', jaw: 0.2, young: 1 },
    oydin: { name: 'Oydin', f: 1, skin: '#c08a62', hair: '#120d15', head: 'hood', headC: '#2a2030', robe: '#1e1724', robe2: '#0e0a12', trim: '#5a4a62', shirt: '#2a2030', eye: '#1a1210', glint: '#7fe8dc', tumar: '#7fe8dc', rim: '#7fe8dc', bg: ['#3a1620', '#0e0507'], light: '#ffcfa0', jaw: 0.45, stern: 0.5 },
    oydinMask: { name: 'Masked', f: 1, skin: '#c08a62', hair: '#120d15', head: 'hood', headC: '#2a2030', robe: '#1e1724', robe2: '#0e0a12', trim: '#5a4a62', shirt: '#2a2030', eye: '#1a1210', glint: '#7fe8dc', mask: '#e8e0d0', rim: '#7fe8dc', bg: ['#1c1420', '#060408'], light: '#e8e0ff', jaw: 0.45 },
    farrukh: { name: 'Farrukh', skin: '#c8956a', hair: '#2a1810', mous: 'thin', stubble: 1, head: 'turban', headC: '#ece3cf', jewel: '#e8a030', robe: '#8a2a30', robe2: '#4a1218', ikat: '#e0703a', trim: '#e8b850', shirt: '#e9dfc8', eye: '#2a1810', smirk: 1, earring: '#f2c14a', rim: '#ffb860', bg: ['#6a3a14', '#170a04'], light: '#ffd9a0', jaw: 0.5 },
    widow: { name: 'Mehri', f: 1, skin: '#b98a63', age: 0.55, hair: '#2a2024', head: 'scarf', headC: '#3d3439', headM: '#6a5a62', robe: '#4a3428', robe2: '#251810', trim: '#7a6050', shirt: '#3d3439', eye: '#1e1614', sad: 1, rim: '#d9c8b8', bg: ['#352d33', '#0c090c'], light: '#ffd8b0', jaw: 0.3 },
    divan: { name: 'Envoy', skin: '#c38f66', hair: '#17100c', beard: 'full', beardC: '#17100c', head: 'turban', headC: '#f2ead8', jewel: '#e8b850', plume: '#f2c14a', robe: '#8a1e2a', robe2: '#4a0c14', trim: '#e8b850', shirt: '#f2ead8', eye: '#17100c', rim: '#ffcf70', bg: ['#3a2412', '#100804'], light: '#ffe0b0', jaw: 0.6 },
    tillabek: { name: 'Tilla-bek', skin: '#c38f66', age: 0.6, hair: '#3a3030', temples: '#c8c0b8', beard: 'full', beardC: '#3a3030', beardS: '#a8a098', head: 'turban', headC: '#fff4dc', jewel: '#2fb3b8', plume: '#f2c14a', robe: '#7a1424', robe2: '#3a060e', trim: '#f0c040', shirt: '#fff4dc', eye: '#17100c', smile: 1, rim: '#ffd27a', bg: ['#4a1a1a', '#120404'], light: '#ffe6b8', jaw: 0.55, chain: '#f0c040' },
    obi: { special: 'obi', name: 'Obi-Hayot', bg: ['#0e3a52', '#020a12'] },
    sado: { special: 'sado', name: 'Sado', bg: ['#0d2a2c', '#020808'] },
    stone: { special: 'stone', name: 'Stone', bg: ['#3a3a48', '#0c0c12'] },
    alp: { name: 'Alp', skin: '#b0a294', hair: null, stubble: 1, bald: 1, head: null, robe: '#4a4038', robe2: '#221c18', strap: '#7a6248', trim: '#6a5a48', shirt: '#2a2420', eye: '#c8c4bc', hollow: 1, scar: 1, rim: '#d8d0c0', bg: ['#3a3634', '#0c0b0a'], light: '#f0e0c8', jaw: 0.95, big: 1 },
    davron: { name: 'Davron', skin: '#a87850', age: 0.6, hair: '#8a8278', beard: 'full', beardC: '#8a8278', head: 'turban', headC: '#e8dcc0', robe: '#6a4a2a', robe2: '#3a2614', stripes: '#9a7a44', trim: '#c9963c', shirt: '#d8ccb0', eye: '#2a1a10', bell: '#d8a840', rim: '#ffc880', bg: ['#4a3418', '#120c04'], light: '#ffd8a0', jaw: 0.6 },
    inspector: { name: 'Inspector', skin: '#c4916a', hair: '#1a1420', mous: 'thin', head: 'hat', headC: '#e8e0f0', headM: '#2e2a5a', robe: '#2e2a5a', robe2: '#14122e', trim: '#e8e0f0', shirt: '#e8e0f0', eye: '#4a5060', cold: 1, cord: '#e8e0f0', rim: '#b8c8ff', bg: ['#1e1c3a', '#06060e'], light: '#e8e8ff', jaw: 0.5 },
    singer: { name: 'Singer', skin: '#c4916a', hair: '#1a1420', head: 'hat', headC: '#e8e0f0', headM: '#2e2a5a', robe: '#2e2a5a', robe2: '#14122e', trim: '#e8e0f0', shirt: '#e8e0f0', eye: '#1a1420', closed: 1, sing: 1, rim: '#c9b4ff', bg: ['#22204a', '#06060e'], light: '#e8e8ff', jaw: 0.35 },
    gulnora: { name: 'Gulnora', f: 1, skin: '#d0a07a', hair: '#2a1a12', head: 'scarf', headC: '#4f7a3a', headM: '#8a4a3a', under: '#8a4a3a', robe: '#5a6a4a', robe2: '#2a3420', trim: '#c9963c', shirt: '#e8dcc8', eye: '#1e1410', freckles: 1, sad: 0.5, rim: '#ffd8a0', bg: ['#2e3a24', '#0a0e06'], light: '#fff0c8', jaw: 0.15, young: 1 },
    bride: { name: 'Bride', f: 1, skin: '#d0a07a', hair: '#1e1410', head: 'veil', headC: '#c03040', coins: '#f0c040', robe: '#e8dcd0', robe2: '#a89888', trim: '#f0c040', shirt: '#e8dcd0', eye: '#1e1410', rim: '#ffb0a0', bg: ['#3a1820', '#0e0406'], light: '#fff0d8', jaw: 0.2, young: 1 },
    bahodir: { name: 'Bahodir', skin: '#b8865c', hair: '#1a1008', mous: 'thick', stubble: 1, head: 'helmet', headC: '#d8b040', robe: '#c8a040', robe2: '#5a4410', armor: 1, trim: '#f2d27a', shirt: '#5a2a1a', eye: '#1a1008', rim: '#ffe08a', bg: ['#3a2a0c', '#0e0a02'], light: '#fff0c0', jaw: 0.85, big: 0.5 },
    auctioneer: { name: 'Auctioneer', skin: '#c8946a', hair: '#2a1810', mous: 'thick', beard: 'short', beardC: '#2a1810', head: 'turban', headC: '#f2ead8', jewel: '#c03040', robe: '#a83a2a', robe2: '#5a1a10', trim: '#f0c040', shirt: '#f2ead8', eye: '#2a1810', grin: 1, rim: '#ffc870', bg: ['#3a1c14', '#100604'], light: '#ffe0b0', jaw: 0.65 }
  };
  // generic people: a stable look from the key
  function genericSpec(key) {
    const r = rng(hash(key || 'x'));
    const pick = a => a[Math.floor(r() * a.length)];
    const f = r() < 0.4;
    const robe = pick(['#6a3a28', '#2b3a6b', '#4a5a3a', '#7a2a30', '#3a3a5a', '#5a4a2a']);
    return {
      name: key, f, skin: pick(['#c4916a', '#b88865', '#d0a07a', '#a87850']), hair: pick(['#1e1716', '#2a1810', '#3a3030']),
      beard: f ? null : pick([null, 'short', 'full']), beardC: '#2a1e18', head: f ? pick(['scarf', 'veil']) : pick(['doppi', 'turban', 'doppi']),
      headC: f ? pick(['#7a3a3a', '#3a5a6a', '#6a5a3a']) : pick(['#15121a', '#e6dcc4', '#2a3a2a']), headM: '#e8dcc8',
      robe, robe2: dark(robe, 0.5), trim: '#c9963c', shirt: '#e6dcc6', eye: '#2a1a12', rim: '#ffd8a0', bg: [mix(robe, '#20182a', 0.5), '#0a080c'], light: '#ffd9a0', jaw: r()
    };
  }
  const specOf = key => SPEC[key] || genericSpec(String(key));

  // geometry of the head (units)
  const HX = 50, HY = 64;
  function headGeo(s) {
    const big = s.big || 0;
    const hw = (s.f ? 14.6 : 15.6) + big * 1.6, top = HY - 27 - big, chin = HY + 25 + big * 1.5;
    return { cx: HX, cy: HY, hw, top, chin, jaw: s.jaw || 0.4, tx: 1.6 };
  }
  function facePath(c, g, inflate) {
    const i = inflate || 0, { cx, cy, hw, top, chin, jaw } = g;
    const w = hw + i, jw = (0.56 + jaw * 0.2) * w;
    c.beginPath();
    c.moveTo(cx, top - i);
    c.bezierCurveTo(cx + w * 0.92, top - i, cx + w, cy - 16, cx + w, cy - 3);
    c.bezierCurveTo(cx + w, cy + 7, cx + w * 0.93, cy + 12, cx + jw + 1, cy + 18 + jaw * 2);
    c.bezierCurveTo(cx + jw * 0.6, chin + i - 1 - jaw, cx + 5 + jaw * 2, chin + i, cx + 0.6, chin + i);
    c.bezierCurveTo(cx - 5 - jaw * 2, chin + i, cx - jw * 0.6, chin + i - 1 - jaw, cx - jw - 1, cy + 18 + jaw * 2);
    c.bezierCurveTo(cx - w * 0.93, cy + 12, cx - w, cy + 7, cx - w, cy - 3);
    c.bezierCurveTo(cx - w, cy - 16, cx - w * 0.92, top - i, cx, top - i);
    c.closePath();
  }
  const blurOn = (c, u) => { c.filter = `blur(${u * K()}px)`; };
  const blurOff = c => { c.filter = 'none'; };
  function softEll(c, x, y, rx, ry, col, a, blur) {
    c.save(); c.globalAlpha = a; blurOn(c, blur); c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.3); c.fill(); c.restore();
  }
  function strands(c, r, n, fn) { for (let i = 0; i < n; i++) fn(r(), r(), r(), i); }

  /* ---------- body ---------- */
  function paintBody(c, s, g, r) {
    const big = s.big || 0, sh = 98 - big * 3;
    const spread = 2 - big * 4;
    const P = () => { c.beginPath(); c.moveTo(spread - 4, PH + 2); c.lineTo(spread - 4, 124); c.bezierCurveTo(spread + 2, 108, 22, sh + 1, 38 - big * 2, sh); c.lineTo(62 + big * 2, sh); c.bezierCurveTo(78, sh + 1, 98 - spread, 108, 104 - spread, 124); c.lineTo(104 - spread, PH + 2); c.closePath(); };
    // neck
    const nw = (7.6 + big * 2.4) * 1.25;
    c.fillStyle = dark(s.skin, 0.12); c.beginPath(); c.moveTo(g.cx - nw * 0.85, g.cy + 10); c.lineTo(g.cx + nw * 0.85, g.cy + 10); c.lineTo(g.cx + nw * 1.15, sh + 4); c.lineTo(g.cx - nw * 1.15, sh + 4); c.closePath(); c.fill();
    c.save(); c.beginPath(); c.rect(g.cx - nw, g.cy + 10, nw * 2, 40); c.clip();
    softEll(c, g.cx + 1, g.chin + 1, nw + 3, 5, dark(s.skin, 0.6), 0.7, 1.6);
    const ng = c.createLinearGradient(g.cx - nw, 0, g.cx + nw, 0); ng.addColorStop(0, 'rgba(0,0,0,0)'); ng.addColorStop(1, 'rgba(20,8,4,0.35)'); c.fillStyle = ng; c.fillRect(g.cx - nw, g.cy, nw * 2, 50);
    c.restore();
    if (s.scarf) { // Turab: the cloth over the throat where the voice was
      c.fillStyle = s.scarf; c.beginPath(); c.ellipse(g.cx, sh - 4, nw + 3, 6, 0, 0, 6.3); c.fill();
      c.strokeStyle = dark(s.scarf, 0.4); c.lineWidth = 0.5; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(g.cx - nw - 2, sh - 7 + i * 2.2); c.quadraticCurveTo(g.cx, sh - 4 + i * 2.2, g.cx + nw + 2, sh - 7 + i * 2.2); c.stroke(); }
    }
    // robe
    P();
    const rg = c.createLinearGradient(0, sh, 0, PH); rg.addColorStop(0, light(s.robe, 0.08)); rg.addColorStop(1, s.robe2 || dark(s.robe, 0.5)); c.fillStyle = rg; c.fill();
    c.save(); P(); c.clip();
    if (s.ikat) { // abr ikat: blurred-edge vertical flames
      c.globalAlpha = 0.5;
      for (let x = 4; x < 100; x += 9) {
        c.fillStyle = s.ikat; blurOn(c, 0.5);
        c.beginPath(); for (let y = sh; y <= PH; y += 3) c.lineTo(x + Math.sin(y * 0.35 + x) * 1.6, y); for (let y = PH; y >= sh; y -= 3) c.lineTo(x + 2.4 + Math.sin(y * 0.35 + x + 1) * 1.6, y); c.fill();
      }
      blurOff(c); c.globalAlpha = 1;
    }
    if (s.stripes) { c.globalAlpha = 0.55; c.fillStyle = s.stripes; for (let x = 3; x < 100; x += 6) c.fillRect(x, sh, 1.6, PH - sh); c.globalAlpha = 1; }
    if (s.armor) { // gilded lamellar
      for (let y = sh + 4; y < PH; y += 5) for (let x = (y / 5 & 1) ? 0 : 3; x < 100; x += 6) {
        const lg = c.createLinearGradient(0, y, 0, y + 5); lg.addColorStop(0, '#fff0b0'); lg.addColorStop(0.3, '#d8b040'); lg.addColorStop(1, '#6a4a10');
        c.fillStyle = lg; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5.4, y); c.lineTo(x + 5.4, y + 4); c.quadraticCurveTo(x + 2.7, y + 6, x, y + 4); c.fill();
      }
    }
    // side shading + light
    const sg = c.createLinearGradient(0, 0, 100, 0); sg.addColorStop(0, 'rgba(255,230,190,0.10)'); sg.addColorStop(0.45, 'rgba(0,0,0,0)'); sg.addColorStop(1, 'rgba(0,0,0,0.45)'); c.fillStyle = sg; c.fillRect(0, sh, 100, PH - sh);
    // folds
    c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 0.8; blurOn(c, 0.6);
    for (const fx of [20, 30, 72, 82]) { c.beginPath(); c.moveTo(fx, sh + 14); c.quadraticCurveTo(fx + 3, sh + 28, fx - 1, PH); c.stroke(); }
    blurOff(c);
    c.restore();
    if (s.fur) { // fur collar
      c.fillStyle = s.fur;
      for (let i = 0; i < 70; i++) { const t = i / 70, x = 22 + t * 56, y = sh + 2 + Math.sin(t * Math.PI) * -1 + (r() - 0.5) * 2; c.beginPath(); c.ellipse(x, y + 2, 3.2, 2.2, r() * 3, 0, 6.3); c.fill(); }
      c.fillStyle = light(s.fur, 0.25); for (let i = 0; i < 40; i++) { const x = 22 + r() * 56, y = sh + 1 + r() * 3; c.fillRect(x, y, 0.5, 1.6); }
    }
    // collar: V and trims
    const vx = g.cx, vy = sh + 22;
    c.fillStyle = s.shirt || '#e6dcc6';
    c.beginPath(); c.moveTo(vx - 9, sh - 0.5); c.lineTo(vx + 9, sh - 0.5); c.lineTo(vx, vy); c.closePath(); c.fill();
    c.save(); c.beginPath(); c.moveTo(vx - 9, sh - 0.5); c.lineTo(vx + 9, sh - 0.5); c.lineTo(vx, vy); c.closePath(); c.clip(); softEll(c, vx, sh, 9, 6, '#000', 0.35, 2); c.restore();
    if (s.tumar) { // Oydin's tumar under the collarbone, glowing through
      const tg = c.createRadialGradient(vx + 2, sh + 9, 0, vx + 2, sh + 9, 8); tg.addColorStop(0, rgba(s.tumar, 0.9)); tg.addColorStop(1, rgba(s.tumar, 0)); c.fillStyle = tg; c.fillRect(vx - 8, sh, 20, 20);
      c.fillStyle = '#e8fffb'; c.beginPath(); c.moveTo(vx + 2, sh + 6); c.lineTo(vx + 4.5, sh + 11); c.lineTo(vx - 0.5, sh + 11); c.closePath(); c.fill();
    }
    const lapel = (dir) => {
      c.beginPath(); c.moveTo(vx + dir * 9, sh - 1); c.lineTo(vx + dir * 13.5, sh - 1); c.lineTo(vx + dir * 3, vy + 6); c.lineTo(vx, vy); c.closePath();
    };
    for (const dir of [-1, 1]) {
      lapel(dir); const lg = c.createLinearGradient(vx, sh, vx + dir * 12, vy); lg.addColorStop(0, light(s.trim, 0.25)); lg.addColorStop(1, dark(s.trim, 0.35)); c.fillStyle = lg; c.fill();
      c.save(); lapel(dir); c.clip();
      c.fillStyle = rgba(dark(s.trim, 0.6), 0.7);
      for (let k = 0; k < 6; k++) { const t = k / 6, x = vx + dir * (11 - t * 8), y = sh + 1 + t * (vy - sh + 2); diamond(c, x, y, 1.1, rgba(dark(s.trim, 0.55), 0.8)); }
      c.restore();
    }
    if (s.strap) { c.fillStyle = s.strap; c.beginPath(); c.moveTo(22, sh + 4); c.lineTo(30, sh); c.lineTo(80, PH); c.lineTo(70, PH); c.closePath(); c.fill(); c.fillStyle = '#c8a060'; c.fillRect(48, 118, 5, 4); }
    if (s.pendant) { c.strokeStyle = s.pendant; c.lineWidth = 0.5; c.beginPath(); c.moveTo(vx - 8, sh); c.quadraticCurveTo(vx, sh + 14, vx + 8, sh); c.stroke(); diamond(c, vx, sh + 9, 2.4, s.pendant, dark(s.pendant, 0.5)); diamond(c, vx, sh + 9, 1, '#2fb3b8'); }
    if (s.chain) { c.strokeStyle = s.chain; c.lineWidth = 0.7; c.setLineDash([1, 0.6]); c.beginPath(); c.moveTo(vx - 14, sh + 2); c.quadraticCurveTo(vx, sh + 22, vx + 14, sh + 2); c.stroke(); c.setLineDash([]); rosette(c, vx, sh + 13, 2.6); }
    if (s.cord) { c.strokeStyle = s.cord; c.lineWidth = 0.6; c.beginPath(); c.moveTo(vx - 10, sh); c.lineTo(vx - 4, PH); c.stroke(); c.fillStyle = '#6a5a8a'; c.fillRect(vx - 6.5, 126, 5, 7); }
    if (s.bell) { c.strokeStyle = '#3a2a1a'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(vx - 6, sh); c.lineTo(vx + 2, sh + 16); c.stroke(); const bg = c.createRadialGradient(vx + 1, sh + 17, 0, vx + 2, sh + 19, 4); bg.addColorStop(0, '#fff0a0'); bg.addColorStop(1, s.bell); c.fillStyle = bg; c.beginPath(); c.moveTo(vx - 1.5, sh + 16); c.lineTo(vx + 5.5, sh + 16); c.lineTo(vx + 6.5, sh + 22); c.lineTo(vx - 2.5, sh + 22); c.closePath(); c.fill(); }
  }

  /* ---------- head ---------- */
  function paintHairBack(c, s, g, r) {
    if (s.longHair) {
      c.fillStyle = s.hair;
      c.beginPath(); c.moveTo(g.cx - g.hw - 3, g.cy - 14); c.bezierCurveTo(g.cx - g.hw - 8, g.cy + 20, g.cx - g.hw - 6, g.cy + 40, g.cx - g.hw - 9, 118);
      c.lineTo(g.cx + g.hw + 9, 118); c.bezierCurveTo(g.cx + g.hw + 6, g.cy + 40, g.cx + g.hw + 8, g.cy + 20, g.cx + g.hw + 3, g.cy - 14); c.closePath(); c.fill();
      c.strokeStyle = rgba(dark(s.hair, 0.35), 0.6); c.lineWidth = 0.35;
      strands(c, r, 50, (a, b) => { const x = g.cx + (a < 0.5 ? -1 : 1) * (g.hw + 1 + b * 7); c.beginPath(); c.moveTo(x, g.cy - 10); c.quadraticCurveTo(x + (a - 0.5) * 6, g.cy + 20, x + (a - 0.5) * 4, 116); c.stroke(); });
    }
    if (s.braids) {
      for (const dir of [-1, 1]) {
        const x0 = g.cx + dir * (g.hw - 1);
        for (let i = 0; i < 11; i++) {
          const y = g.cy + 6 + i * 4.6, x = x0 + dir * (2 + i * 0.25) + Math.sin(i * 1.3) * 0.4;
          const bg = c.createLinearGradient(x - 3, y, x + 3, y); bg.addColorStop(0, light(s.hair, 0.18)); bg.addColorStop(1, s.hair);
          c.fillStyle = bg; c.beginPath(); c.ellipse(x, y, 2.9 - i * 0.06, 2.8, dir * 0.5, 0, 6.3); c.fill();
          c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(x - 2.4, y - 1); c.quadraticCurveTo(x, y + 1.2, x + 2.4, y - 1); c.stroke();
        }
        c.fillStyle = '#c03040'; c.fillRect(x0 + dir * 4.4 - 1.4, g.cy + 57, 2.8, 2);
      }
    }
  }
  function paintFace(c, s, g, r, blink) {
    const { cx, cy, hw } = g, tx = g.tx, sk = s.skin, shade = dark(sk, 0.42);
    // ears
    if (s.head !== 'veil' && s.head !== 'scarf' && s.head !== 'hood' && s.head !== 'helmet' && !s.longHair) {
      for (const dir of [-1, 1]) {
        c.fillStyle = dir < 0 ? sk : dark(sk, 0.15); c.beginPath(); c.ellipse(cx + dir * (hw + 0.6), cy + 1, 2.8, 5.6, dir * 0.15, 0, 6.3); c.fill();
        c.fillStyle = dark(sk, 0.35); c.beginPath(); c.ellipse(cx + dir * (hw + 0.9), cy + 1.5, 1.3, 3.4, dir * 0.15, 0, 6.3); c.fill();
        if (s.earring && dir > 0) { c.fillStyle = s.earring; c.beginPath(); c.arc(cx + hw + 1.2, cy + 7.4, 1.1, 0, 6.3); c.fill(); }
      }
    }
    // skin
    facePath(c, g); const fg = c.createLinearGradient(cx - hw, g.top, cx + hw, g.chin); fg.addColorStop(0, light(sk, 0.1)); fg.addColorStop(0.6, sk); fg.addColorStop(1, dark(sk, 0.18)); c.fillStyle = fg; c.fill();
    c.save(); facePath(c, g); c.clip();
    // form shading
    const sg = c.createLinearGradient(cx - 2, 0, cx + hw + 2, 0); sg.addColorStop(0, rgba(shade, 0)); sg.addColorStop(1, rgba(shade, 0.62)); c.fillStyle = sg; c.fillRect(cx - 2, g.top - 4, hw + 6, 70);
    softEll(c, cx - 5, cy - 13, 11, 7, '#fff4e0', 0.26, 3); softEll(c, cx - 7, cy + 3, 5, 6, '#fff0dc', 0.14, 2.4);
    softEll(c, cx - 8 + tx, cy + 6, 4.5, 3.4, '#e06a5a', s.f ? 0.22 : 0.12, 2.4);
    softEll(c, cx + 8 + tx, cy + 6, 4, 3.2, '#c05048', s.f ? 0.16 : 0.08, 2.4);
    softEll(c, cx + tx, g.chin + 4, hw * 0.7, 6, shade, 0.45, 2.4);
    if (s.gaunt || s.age >= 0.8) { softEll(c, cx - 9 + tx, cy + 9, 3, 5, shade, 0.3, 1.6); softEll(c, cx + 9 + tx, cy + 9, 3, 5, shade, 0.4, 1.6); }
    // sockets
    softEll(c, cx - 6.6 + tx, cy - 2.2, 5, 3.2, shade, s.tired || s.hollow ? 0.55 : 0.38, 1.4);
    softEll(c, cx + 6.6 + tx, cy - 2.2, 5, 3.2, shade, s.tired || s.hollow ? 0.62 : 0.45, 1.4);
    // nose
    c.save(); blurOn(c, 0.5); c.strokeStyle = rgba(shade, 0.6); c.lineWidth = 0.9;
    c.beginPath(); c.moveTo(cx + 1.8 + tx, cy - 2); c.quadraticCurveTo(cx + 2.8 + tx, cy + 4, cx + 3 + tx, cy + 8.2); c.stroke(); c.restore();
    softEll(c, cx - 0.6 + tx, cy + 3, 1, 4, '#fff6e8', 0.22, 0.6);
    c.fillStyle = rgba(dark(sk, 0.55), 0.85);
    c.beginPath(); c.ellipse(cx - 1.6 + tx, cy + 9.4, 1.2, 0.6, 0.2, 0, 6.3); c.fill();
    c.beginPath(); c.ellipse(cx + 2.4 + tx, cy + 9.4, 1.2, 0.6, -0.2, 0, 6.3); c.fill();
    softEll(c, cx + 0.4 + tx, cy + 8.6, 2.6, 1.4, light(sk, 0.15), 0.5, 0.5);
    // age lines
    if (s.age) {
      c.strokeStyle = rgba(shade, 0.35 * s.age); c.lineWidth = 0.35;
      for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(cx - 7 + tx, cy - 13 + i * 1.6); c.quadraticCurveTo(cx + tx, cy - 14 + i * 1.6, cx + 7 + tx, cy - 13 + i * 1.6); c.stroke(); }
      for (const dir of [-1, 1]) { c.beginPath(); c.moveTo(cx + dir * 3.6 + tx, cy + 10); c.quadraticCurveTo(cx + dir * 7 + tx, cy + 13, cx + dir * 6.5 + tx, cy + 17); c.stroke(); for (let i = 0; i < 2; i++) { c.beginPath(); c.moveTo(cx + dir * 10.4 + tx, cy - 2 + i * 1.6); c.lineTo(cx + dir * 12.6 + tx, cy - 3 + i * 2.2); c.stroke(); } }
    }
    if (s.stubble) { c.fillStyle = rgba(dark(s.hair || '#2a1810', 0.1), 0.28); for (let i = 0; i < 300; i++) { const a = r() * 6.28, d = r(); const x = cx + tx + Math.cos(a) * hw * 0.8 * d, y = cy + 15 + Math.abs(Math.sin(a)) * 10 * d; if (y > cy + 9) c.fillRect(x, y, 0.35, 0.35); } }
    if (s.freckles) { c.fillStyle = rgba(dark(sk, 0.45), 0.55); for (let i = 0; i < 26; i++) { const x = cx + tx + (r() < 0.5 ? -1 : 1) * (4 + r() * 7), y = cy + 3 + r() * 5; c.beginPath(); c.arc(x, y, 0.3 + r() * 0.25, 0, 6.3); c.fill(); } }
    if (s.scar) { c.strokeStyle = '#7a4a3a'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(cx + 9 + tx, cy - 12); c.lineTo(cx + 6 + tx, cy + 3); c.stroke(); c.strokeStyle = 'rgba(255,220,200,0.35)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(cx + 9.4 + tx, cy - 12); c.lineTo(cx + 6.4 + tx, cy + 3); c.stroke(); }
    c.restore();
    paintEyes(c, s, g, blink);
    paintMouth(c, s, g);
  }
  function paintEyes(c, s, g, blink) {
    const { cx, cy } = g, tx = g.tx, ink = '#140a08';
    const brow = (s.stern ? 0.9 : 0) + (s.cold ? 0.5 : 0) - (s.sad ? 0.9 : 0);
    for (const dir of [-1, 1]) {
      const ex = cx + dir * 6.4 + tx + (dir > 0 ? -0.3 : 0), ey = cy - 2, w = dir > 0 ? 3.0 : 3.2, h = 1.55;
      if (s.mask) continue;
      const closed = blink || s.closed;
      if (!closed) {
        c.save();
        c.beginPath(); c.moveTo(ex - w, ey); c.quadraticCurveTo(ex, ey - h * 1.6, ex + w, ey - 0.2); c.quadraticCurveTo(ex, ey + h * 1.15, ex - w, ey); c.closePath();
        c.fillStyle = s.hollow ? '#d8d2c8' : '#efe6da'; c.fill(); c.clip();
        const look = s.hollow ? -0.6 : 0.5;
        const ir = 1.45;
        const ig = c.createRadialGradient(ex + look, ey - 0.1, 0, ex + look, ey - 0.1, ir); ig.addColorStop(0, light(s.eye, 0.25)); ig.addColorStop(0.7, s.eye); ig.addColorStop(1, dark(s.eye, 0.5));
        c.fillStyle = ig; c.beginPath(); c.arc(ex + look, ey - 0.1, ir, 0, 6.3); c.fill();
        if (!s.hollow) { c.fillStyle = '#080404'; c.beginPath(); c.arc(ex + look, ey - 0.1, 0.62, 0, 6.3); c.fill(); }
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(ex - w, ey - h * 1.6, 2 * w, 1.0);
        if (s.glint) { c.fillStyle = s.glint; c.beginPath(); c.arc(ex + look + 0.5, ey - 0.6, 0.38, 0, 6.3); c.fill(); }
        c.fillStyle = '#ffffff'; c.beginPath(); c.arc(ex + look - 0.5, ey - 0.6, 0.32, 0, 6.3); c.fill();
        c.restore();
        // upper lid
        c.strokeStyle = ink; c.lineWidth = 0.75; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - w - 0.2, ey + 0.1); c.quadraticCurveTo(ex, ey - h * 1.75, ex + w + 0.3, ey - 0.3); c.stroke();
        if (s.f) { c.lineWidth = 0.4; c.beginPath(); c.moveTo(ex + dir * w, ey - 0.3 * (dir > 0 ? 1 : 0)); c.lineTo(ex + dir * (w + 1), ey - 0.9); c.stroke(); }
        c.strokeStyle = rgba(dark(s.skin, 0.5), 0.6); c.lineWidth = 0.3;
        c.beginPath(); c.moveTo(ex - w + 0.6, ey + 0.5); c.quadraticCurveTo(ex, ey + h * 1.25, ex + w - 0.3, ey + 0.3); c.stroke();
        if (s.tired) { c.beginPath(); c.moveTo(ex - w + 0.8, ey + 1.5); c.quadraticCurveTo(ex, ey + 2.6, ex + w - 0.4, ey + 1.3); c.stroke(); }
        if (s.sad) { c.strokeStyle = 'rgba(200,80,70,0.35)'; c.beginPath(); c.moveTo(ex - w + 0.6, ey + 0.8); c.quadraticCurveTo(ex, ey + 1.6, ex + w - 0.3, ey + 0.6); c.stroke(); }
        // crease
        c.strokeStyle = rgba(dark(s.skin, 0.45), 0.55); c.lineWidth = 0.3; c.beginPath(); c.moveTo(ex - w + 0.4, ey - 1.4); c.quadraticCurveTo(ex, ey - h * 2.4, ex + w, ey - 1.6); c.stroke();
      } else {
        c.strokeStyle = ink; c.lineWidth = 0.7; c.lineCap = 'round';
        c.beginPath(); c.moveTo(ex - w, ey + 0.2); c.quadraticCurveTo(ex, ey + 1.3, ex + w, ey); c.stroke();
        if (s.f) { c.lineWidth = 0.35; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(ex - 1.5 + i * 1.5, ey + 0.9); c.lineTo(ex - 1.7 + i * 1.5, ey + 1.7); c.stroke(); } }
      }
      // brow
      const bc = s.brow || (s.age >= 0.8 ? s.hair : s.hair || '#1e1410') || '#1e1410';
      c.strokeStyle = bc === null ? '#5a4a40' : bc; c.lineCap = 'round';
      const inner = ex - dir * w * 0.9, outer = ex + dir * (w + 0.8);
      const iy = ey - 3.6 + brow * 0.9, oy = ey - 4.2 - brow * 0.2 + (s.sad ? 0.9 : 0);
      c.lineWidth = s.f ? 0.8 : 1.15;
      c.beginPath(); c.moveTo(inner, iy); c.quadraticCurveTo(ex, Math.min(iy, oy) - 1.2, outer, oy); c.stroke();
      if (s.hollow && !s.bald) { /* nothing */ }
    }
    if (s.mask) paintMask(c, s, g, blink);
  }
  function paintMouth(c, s, g) {
    if (s.mask) return;
    const { cx, cy } = g, tx = g.tx, my = cy + 15.2, lip = dark(mix(s.skin, '#a03838', s.f ? 0.45 : 0.25), 0.12), line = dark(s.skin, 0.62);
    const w = s.grin ? 5.6 : 4.4;
    const up = (s.smile ? 0.8 : 0) + (s.grin ? 1.2 : 0) - (s.sad ? 0.6 : 0);
    if (s.sing) {
      c.fillStyle = '#2a1014'; c.beginPath(); c.ellipse(cx + tx, my + 0.6, 2.2, 1.9, 0, 0, 6.3); c.fill();
      c.strokeStyle = lip; c.lineWidth = 0.8; c.stroke(); return;
    }
    // lower lip
    c.fillStyle = lip; c.beginPath(); c.moveTo(cx - w + tx, my - up * 0.5); c.quadraticCurveTo(cx + tx, my + 2.6, cx + w + tx, my - up * (s.smirk ? 1.1 : 0.5)); c.quadraticCurveTo(cx + tx, my + 0.4, cx - w + tx, my - up * 0.5); c.fill();
    softEll(c, cx + tx - 0.4, my + 1.4, 1.8, 0.6, '#ffe8e0', 0.25, 0.4);
    // upper lip
    c.fillStyle = dark(lip, 0.15); c.beginPath(); c.moveTo(cx - w + tx, my - up * 0.5); c.quadraticCurveTo(cx - 1.4 + tx, my - 1.6, cx + tx, my - 1.0); c.quadraticCurveTo(cx + 1.4 + tx, my - 1.6, cx + w + tx, my - up * (s.smirk ? 1.1 : 0.5)); c.quadraticCurveTo(cx + tx, my + 0.3, cx - w + tx, my - up * 0.5); c.fill();
    c.strokeStyle = line; c.lineWidth = 0.55; c.lineCap = 'round';
    c.beginPath(); c.moveTo(cx - w - 0.2 + tx, my - up * 0.5 - 0.1); c.quadraticCurveTo(cx + tx, my + 0.5 - up * 0.3, cx + w + 0.2 + tx, my - up * (s.smirk ? 1.2 : 0.5) - 0.1); c.stroke();
    if (s.grin) { c.fillStyle = '#f0e8dc'; c.beginPath(); c.moveTo(cx - w + 1 + tx, my - up * 0.4); c.quadraticCurveTo(cx + tx, my + 1.2, cx + w - 1 + tx, my - up * 0.4); c.quadraticCurveTo(cx + tx, my, cx - w + 1 + tx, my - up * 0.4); c.fill(); }
  }
  function paintMask(c, s, g, blink) {
    const { cx, cy, hw } = g;
    c.save();
    c.beginPath(); c.moveTo(cx, g.top + 9); c.bezierCurveTo(cx + hw * 0.95, g.top + 9, cx + hw * 0.95, cy + 10, cx + hw * 0.6, cy + 18); c.quadraticCurveTo(cx, g.chin + 1, cx - hw * 0.6, cy + 18); c.bezierCurveTo(cx - hw * 0.95, cy + 10, cx - hw * 0.95, g.top + 9, cx, g.top + 9); c.closePath();
    const mg = c.createRadialGradient(cx - 4, cy - 6, 2, cx, cy, 24); mg.addColorStop(0, '#fbf6ec'); mg.addColorStop(0.7, s.mask); mg.addColorStop(1, '#a89e8c');
    c.fillStyle = mg; c.fill();
    c.clip();
    // cracks
    c.strokeStyle = 'rgba(90,80,70,0.45)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(cx + 10, g.top + 12); c.lineTo(cx + 7, cy - 6); c.lineTo(cx + 9, cy); c.stroke();
    c.restore();
    // painted brows & mouth line
    c.strokeStyle = '#6a5a4a'; c.lineWidth = 0.9; c.lineCap = 'round';
    for (const dir of [-1, 1]) { c.beginPath(); c.moveTo(cx + dir * 2.6, cy - 5.6); c.quadraticCurveTo(cx + dir * 6.5, cy - 8.4, cx + dir * 10.4, cy - 5.4); c.stroke(); }
    c.lineWidth = 0.6; c.beginPath(); c.moveTo(cx - 3, cy + 14.4); c.lineTo(cx + 3, cy + 14.4); c.stroke();
    // eye holes, eyes glinting inside
    for (const dir of [-1, 1]) {
      const ex = cx + dir * 6.4;
      c.fillStyle = '#0a0608'; c.beginPath(); c.ellipse(ex, cy - 1.8, 3.2, blink ? 0.6 : 1.7, 0, 0, 6.3); c.fill();
      if (!blink) { c.fillStyle = s.glint; c.beginPath(); c.arc(ex + 0.7, cy - 2, 0.55, 0, 6.3); c.fill(); }
    }
    // a red thread pattern on the cheek
    c.strokeStyle = 'rgba(168,50,58,0.65)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(cx - 10, cy + 4); c.lineTo(cx - 7, cy + 8); c.lineTo(cx - 10, cy + 12); c.stroke();
  }
  function paintHair(c, s, g, r) {
    const { cx, cy, hw, top } = g;
    if (s.bald) {
      c.save(); facePath(c, g); c.clip(); softEll(c, cx - 5, top + 5, 9, 4, '#ffffff', 0.25, 1.6); c.restore(); return;
    }
    if (!s.hair) return;
    // hairline cap (under any headwear)
    c.save(); facePath(c, g, 0.6); c.clip();
    c.fillStyle = s.hair;
    c.beginPath(); c.moveTo(cx - hw - 2, cy - 2); c.bezierCurveTo(cx - hw, cy - 10, cx - hw * 0.6, top + 9, cx - 2, top + 8.5); c.bezierCurveTo(cx + hw * 0.6, top + 9, cx + hw, cy - 10, cx + hw + 2, cy - 2); c.lineTo(cx + hw + 2, top - 4); c.lineTo(cx - hw - 2, top - 4); c.closePath(); c.fill();
    if (s.temples) { softEll(c, cx - hw + 0.4, cy - 5, 2.2, 5, s.temples, 0.8, 0.6); softEll(c, cx + hw - 0.4, cy - 5, 2.2, 5, s.temples, 0.7, 0.6); }
    c.strokeStyle = rgba(light(s.hair, 0.3), 0.35); c.lineWidth = 0.3;
    strands(c, r, 30, (a, b) => { const x = cx - hw + a * hw * 2; c.beginPath(); c.moveTo(x, top); c.quadraticCurveTo(x + (b - 0.5) * 4, top + 6, x + (a - 0.5) * 6, top + 10); c.stroke(); });
    c.restore();
  }
  function paintBeard(c, s, g, r) {
    const { cx, cy, hw, chin } = g, tx = g.tx;
    if (s.beard) {
      const long = s.beard === 'long', full = s.beard === 'full' || long, thin = s.beard === 'thin';
      const bc = s.beardC;
      const bottom = long ? chin + 22 : full ? chin + 6 : thin ? chin + 6 : chin + 2.6;
      c.save();
      const B = () => {
        c.beginPath(); c.moveTo(cx - hw + 0.4, cy + 1);
        c.bezierCurveTo(cx - hw + 1, cy + 14, cx - (thin ? 4 : 9), bottom - 2, cx + tx, bottom);
        c.bezierCurveTo(cx + (thin ? 4 : 9), bottom - 2, cx + hw - 1, cy + 14, cx + hw - 0.4, cy + 1);
        c.lineTo(cx + hw - 3.4, cy + 4); c.quadraticCurveTo(cx + tx + 5, cy + 10, cx + tx + 5.8, cy + 15);
        c.quadraticCurveTo(cx + tx, cy + 19.2, cx + tx - 5.8, cy + 15); c.quadraticCurveTo(cx + tx - 5, cy + 10, cx - hw + 3.4, cy + 4); c.closePath();
      };
      if (thin) { c.globalAlpha = 0.8; }
      B(); const bg = c.createLinearGradient(0, cy, 0, bottom); bg.addColorStop(0, bc); bg.addColorStop(1, dark(bc, 0.25)); c.fillStyle = bg; c.fill();
      c.clip();
      if (s.beardS) { softEll(c, cx + tx, chin + 3, 3.4, 6, s.beardS, 0.45, 1.6); }
      const sc = c.createLinearGradient(cx, 0, cx + hw, 0); sc.addColorStop(0, 'rgba(0,0,0,0)'); sc.addColorStop(1, 'rgba(0,0,0,0.4)'); c.fillStyle = sc; c.fillRect(cx, cy, hw + 2, 40);
      c.lineWidth = 0.3;
      strands(c, r, long ? 120 : 70, (a, b, d) => {
        const x = cx - hw + a * hw * 2, y = cy + 4 + b * (bottom - cy - 6);
        c.strokeStyle = d < 0.5 ? rgba(light(bc, 0.35), 0.5) : rgba(dark(bc, 0.45), 0.5);
        c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + (cx - x) * 0.15, y + 3, x + (cx - x) * 0.25, y + 5 + (long ? 3 : 0)); c.stroke();
      });
      c.restore();
    }
    const mous = s.mous || (s.beard && s.beard !== 'thin' ? 'beard' : null);
    if (mous) {
      const mc = s.beardC || s.hair || '#1a1008', my = cy + 12.4;
      const thick = mous === 'thick' || mous === 'beard' ? 1 : 0, long = mous === 'long';
      c.fillStyle = mous === 'beard' ? dark(mc, 0.1) : mc;
      for (const dir of [-1, 1]) {
        c.beginPath(); c.moveTo(cx + tx + dir * 0.2, my - 0.2);
        c.bezierCurveTo(cx + tx + dir * 3, my - 1.6 - thick * 0.6, cx + tx + dir * 6, my - 0.8, cx + tx + dir * (long ? 6.4 : 6.6), my + (long ? 9 : 2.2 + thick));
        c.bezierCurveTo(cx + tx + dir * 5, my + 0.6 + thick * 0.6, cx + tx + dir * 3, my + 0.8 + thick * 0.8, cx + tx + dir * 0.2, my + 0.9);
        c.closePath(); c.fill();
      }
      c.strokeStyle = rgba(light(mc, 0.35), 0.45); c.lineWidth = 0.25;
      for (let i = 0; i < 12; i++) { const dir = i & 1 ? 1 : -1, k = (i >> 1) / 6; c.beginPath(); c.moveTo(cx + tx + dir * (1 + k * 4), my - 0.6); c.lineTo(cx + tx + dir * (2 + k * 5), my + 1.4); c.stroke(); }
    }
  }
  function paintHeadwear(c, s, g, r) {
    const { cx, cy, hw, top } = g, col = s.headC;
    if (s.head === 'doppi') { // chust doppi: square-ish black cap with white pepper motifs
      const y0 = top + 9, y1 = top - 5;
      const P = () => { c.beginPath(); c.moveTo(cx - hw - 0.8, y0 + 1); c.lineTo(cx - hw + 0.4, y1 + 4); c.quadraticCurveTo(cx, y1 - 1.6, cx + hw - 0.4, y1 + 4); c.lineTo(cx + hw + 0.8, y0 + 1); c.quadraticCurveTo(cx, y0 - 1.6, cx - hw - 0.8, y0 + 1); c.closePath(); };
      P(); const dg = c.createLinearGradient(cx - hw, 0, cx + hw, 0); dg.addColorStop(0, light(col, 0.18)); dg.addColorStop(0.5, col); dg.addColorStop(1, dark(col, 0.4)); c.fillStyle = dg; c.fill();
      c.save(); P(); c.clip();
      const m = s.headM || '#efe8d8';
      for (const [x, rot] of [[cx - 8, -0.3], [cx + 0.5, 0], [cx + 9, 0.3]]) { // qalampir (pepper) motifs
        c.save(); c.translate(x, y0 - 6.5); c.rotate(rot); c.fillStyle = m;
        c.beginPath(); c.moveTo(0, -4); c.bezierCurveTo(3.4, -2.6, 2.6, 2.6, 0.2, 3.6); c.bezierCurveTo(-1.6, 2, -2.6, -1.4, 0, -4); c.fill();
        c.fillStyle = col; c.beginPath(); c.ellipse(0.3, 0, 0.7, 1.8, 0.2, 0, 6.3); c.fill();
        c.restore();
      }
      c.strokeStyle = rgba(m, 0.6); c.lineWidth = 0.35; c.beginPath(); c.moveTo(cx - hw, y0 - 1.4); c.quadraticCurveTo(cx, y0 - 3.4, cx + hw, y0 - 1.4); c.stroke();
      c.restore();
      c.fillStyle = s.headM || '#efe8d8'; c.fillRect(cx - hw - 0.8, y0 + 0.2, hw * 2 + 1.6, 0.9);
      return;
    }
    if (s.head === 'turban') {
      const y0 = top + 9;
      const layer = (yy, ww, hh, rot, shade) => { c.save(); c.translate(cx, yy); c.rotate(rot); const tg = c.createLinearGradient(-ww, -hh, ww, hh); tg.addColorStop(0, light(col, 0.2)); tg.addColorStop(0.55, col); tg.addColorStop(1, dark(col, 0.25 + shade)); c.fillStyle = tg; c.beginPath(); c.ellipse(0, 0, ww, hh, 0, 0, 6.3); c.fill(); c.restore(); };
      layer(y0 - 12, hw + 1.5, 9, 0, 0.1);
      layer(y0 - 4, hw + 3.4, 6.2, -0.06, 0.15);
      layer(y0 - 9, hw + 2.6, 5, 0.12, 0.05);
      layer(y0 - 15, hw - 1, 5.4, -0.1, 0);
      c.strokeStyle = rgba(dark(col, 0.45), 0.6); c.lineWidth = 0.45;
      for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(cx - hw - 2, y0 - 2 - i * 3); c.quadraticCurveTo(cx, y0 - 7 - i * 3.4 + (i & 1) * 3, cx + hw + 2, y0 - 6 - i * 2.4); c.stroke(); }
      softEll(c, cx, y0 + 1.4, hw, 1.6, '#000', 0.4, 1);
      if (s.jewel) { const jx = cx + 1, jy = y0 - 10; rosette(c, jx, jy, 2.6); c.fillStyle = s.jewel; c.beginPath(); c.arc(jx, jy, 1.4, 0, 6.3); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(jx - 0.4, jy - 0.5, 0.4, 0, 6.3); c.fill(); }
      if (s.plume) { c.strokeStyle = s.plume; c.lineWidth = 1.1; c.beginPath(); c.moveTo(cx + 2, y0 - 12); c.quadraticCurveTo(cx + 6, y0 - 22, cx + 12, y0 - 26); c.stroke(); c.lineWidth = 0.3; for (let i = 0; i < 10; i++) { const t = i / 10, x = cx + 2 + t * 10, y = y0 - 12 - t * 14; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 2.6, y + 1.4); c.stroke(); } }
      return;
    }
    if (s.head === 'veil' || s.head === 'scarf' || s.head === 'hood') {
      const hood = s.head === 'hood', veil = s.head === 'veil';
      const w = hw + (hood ? 6.5 : 4.4), yTop = top - (hood ? 7 : 4);
      const P = () => { c.beginPath(); c.moveTo(cx - w - (hood ? 8 : 6), 112); c.bezierCurveTo(cx - w - 3, cy + 16, cx - w - 1, yTop + 10, cx, yTop); c.bezierCurveTo(cx + w + 1, yTop + 10, cx + w + 3, cy + 16, cx + w + (hood ? 8 : 6), 112); c.lineTo(cx + hw - 1.6, 112); c.bezierCurveTo(cx + hw + 1, cy + 14, cx + hw + 1.8, cy - 6, cx + hw - 1.6, top + 8); c.quadraticCurveTo(cx, top + 2.6, cx - hw + 1.6, top + 8); c.bezierCurveTo(cx - hw - 1.8, cy - 6, cx - hw - 1, cy + 14, cx - hw + 1.6, 112); c.closePath(); };
      P(); const vg = c.createLinearGradient(cx - w, 0, cx + w, 0); vg.addColorStop(0, light(col, 0.14)); vg.addColorStop(0.5, col); vg.addColorStop(1, dark(col, 0.45)); c.fillStyle = vg; c.fill();
      c.save(); P(); c.clip();
      if (s.under) { c.fillStyle = s.under; c.beginPath(); c.ellipse(cx, top + 6.5, hw + 1, 3.8, 0, 0, 6.3); c.fill(); }
      softEll(c, cx, cy, hw + 2, 30, '#000', 0.45, 2.4);
      c.strokeStyle = rgba(dark(col, 0.5), 0.5); c.lineWidth = 0.5;
      for (let i = 0; i < 7; i++) { const x = cx - w + i * w / 3.2; c.beginPath(); c.moveTo(x, yTop + 8); c.quadraticCurveTo(x - 3 + i, cy + 20, x - 6 + i * 2, 114); c.stroke(); }
      if (s.headM && !hood) { c.fillStyle = s.headM; for (let i = 0; i < 26; i++) { const x = cx - w + r() * w * 2, y = yTop + 4 + r() * 70; c.beginPath(); c.arc(x, y, 0.55, 0, 6.3); c.fill(); } }
      if (s.coins) { for (let i = -3; i <= 3; i++) { const x = cx + i * 3.4, y = top + 7.2 + Math.abs(i) * 0.7; c.fillStyle = dark(s.coins, 0.4); c.beginPath(); c.arc(x, y + 0.3, 1.4, 0, 6.3); c.fill(); c.fillStyle = s.coins; c.beginPath(); c.arc(x, y, 1.3, 0, 6.3); c.fill(); } }
      c.restore();
      if (veil) { c.strokeStyle = rgba(light(col, 0.4), 0.6); c.lineWidth = 0.4; c.beginPath(); c.moveTo(cx - hw + 1.6, top + 8); c.quadraticCurveTo(cx, top + 2.6, cx + hw - 1.6, top + 8); c.stroke(); }
      if (s.longHair) { c.fillStyle = s.hair; for (const dir of [-1, 1]) { c.beginPath(); c.moveTo(cx + dir * (hw - 1.5), top + 9); c.quadraticCurveTo(cx + dir * (hw + 0.5), cy + 6, cx + dir * (hw - 0.6), cy + 22); c.lineTo(cx + dir * (hw + 2.6), cy + 22); c.quadraticCurveTo(cx + dir * (hw + 2.6), cy, cx + dir * (hw + 1), top + 8); c.closePath(); c.fill(); } }
      return;
    }
    if (s.head === 'cap') { // Singers' apprentice cap with white diamonds
      const y0 = top + 9;
      c.fillStyle = col; c.beginPath(); c.moveTo(cx - hw - 0.6, y0 + 1); c.lineTo(cx - hw + 1, top - 4); c.quadraticCurveTo(cx, top - 8, cx + hw - 1, top - 4); c.lineTo(cx + hw + 0.6, y0 + 1); c.quadraticCurveTo(cx, y0 - 1.6, cx - hw - 0.6, y0 + 1); c.fill();
      for (const x of [-8, 0, 8]) { diamond(c, cx + x, top + 1.6 - (x === 0 ? 1.4 : 0), 2.4, s.headM); diamond(c, cx + x, top + 1.6 - (x === 0 ? 1.4 : 0), 0.9, col); }
      return;
    }
    if (s.head === 'hat') { // tall white hat of the Singers
      const y0 = top + 8.5;
      const hg = c.createLinearGradient(cx - hw, 0, cx + hw, 0); hg.addColorStop(0, '#ffffff'); hg.addColorStop(0.5, col); hg.addColorStop(1, dark(col, 0.35));
      c.fillStyle = hg; c.beginPath(); c.moveTo(cx - hw - 0.6, y0); c.lineTo(cx - hw * 0.62, top - 28); c.quadraticCurveTo(cx, top - 31, cx + hw * 0.62, top - 28); c.lineTo(cx + hw + 0.6, y0); c.closePath(); c.fill();
      c.fillStyle = s.headM; c.fillRect(cx - hw - 0.6, y0 - 4, hw * 2 + 1.2, 3.2);
      c.fillStyle = COL.gold; for (let i = -3; i <= 3; i++) diamond(c, cx + i * 4, y0 - 2.4, 0.8, COL.gold);
      softEll(c, cx, y0 + 1, hw, 1.4, '#000', 0.4, 1);
      return;
    }
    if (s.head === 'helmet') {
      const y0 = top + 11;
      const hg = c.createLinearGradient(cx - hw, top, cx + hw, y0); hg.addColorStop(0, '#fff3c0'); hg.addColorStop(0.35, col); hg.addColorStop(1, '#5a3c0c');
      c.fillStyle = hg; c.beginPath(); c.moveTo(cx - hw - 2.4, y0 + 8); c.lineTo(cx - hw - 2, y0 - 4); c.bezierCurveTo(cx - hw, top - 6, cx - 4, top - 10, cx, top - 14); c.bezierCurveTo(cx + 4, top - 10, cx + hw, top - 6, cx + hw + 2, y0 - 4); c.lineTo(cx + hw + 2.4, y0 + 8); c.lineTo(cx + hw - 1, y0 + 2); c.quadraticCurveTo(cx, y0 - 2, cx - hw + 1, y0 + 2); c.closePath(); c.fill();
      c.fillStyle = '#5a3c0c'; c.fillRect(cx + g.tx - 0.9, y0 - 2, 1.8, 12); c.fillStyle = '#fff0b0'; c.fillRect(cx + g.tx - 0.9, y0 - 2, 0.6, 12);
      c.strokeStyle = '#6a4a10'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(cx - hw, y0 - 3); c.quadraticCurveTo(cx, y0 - 7, cx + hw, y0 - 3); c.stroke();
      for (let i = -2; i <= 2; i++) diamond(c, cx + i * 5, y0 - 5 + Math.abs(i) * 0.7, 1, '#2fb3b8');
      c.fillStyle = '#c03040'; c.beginPath(); c.moveTo(cx, top - 14); c.quadraticCurveTo(cx + 6, top - 22, cx + 3, top - 26); c.quadraticCurveTo(cx + 1, top - 20, cx, top - 14); c.fill();
    }
  }
  function paintWaves(c, s, g) { // Nargiza hears the Sleeper
    c.save(); c.strokeStyle = s.waves; c.lineCap = 'round';
    for (let i = 0; i < 3; i++) { c.globalAlpha = 0.8 - i * 0.22; c.lineWidth = 0.8; c.beginPath(); c.arc(g.cx + g.hw + 1, g.cy, 4 + i * 4, -0.8, 0.8); c.stroke(); }
    c.restore();
  }

  // the figure (transparent background), with a rim light from the right
  function paintFigure(c, s, blink, key) {
    const g = headGeo(s), r = rng(hash(key || 'k'));
    const HS = 1.22, head = fn => { c.save(); c.translate(50, 100); c.scale(HS, HS); c.translate(-50, -100); fn(); c.restore(); };
    head(() => paintHairBack(c, s, g, rng(hash(key + 'h'))));
    paintBody(c, s, g, r);
    head(() => {
      paintFace(c, s, g, rng(hash(key + 'f')), blink);
      paintHair(c, s, g, rng(hash(key + 'hh')));
      paintBeard(c, s, g, rng(hash(key + 'b')));
      paintHeadwear(c, s, g, rng(hash(key + 'w')));
      if (s.waves) paintWaves(c, s, g);
    });
    // warm key light from the upper left over the whole figure
    c.save(); c.globalCompositeOperation = 'source-atop';
    const kl = c.createRadialGradient(28, 40, 4, 34, 56, 70); kl.addColorStop(0, rgba(s.light || '#ffd9a0', 0.28)); kl.addColorStop(1, rgba(s.light || '#ffd9a0', 0));
    c.fillStyle = kl; c.fillRect(0, 0, PW, PH);
    const sh = c.createLinearGradient(0, 100, 0, PH); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,0.35)');
    c.fillStyle = sh; c.fillRect(0, 100, PW, PH - 100);
    c.restore();
  }
  function rimLight(fig, col, a, k) {
    const w = fig.width, h = fig.height;
    const rim = mk(w, h), rc = rim.getContext('2d');
    rc.drawImage(fig, 0, 0);
    rc.globalCompositeOperation = 'source-in'; rc.fillStyle = col; rc.fillRect(0, 0, w, h);
    rc.globalCompositeOperation = 'destination-out'; rc.drawImage(fig, -1.6 * k, 0.4 * k);
    const fc = fig.getContext('2d');
    fc.save(); fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = 'source-atop'; fc.globalAlpha = a; fc.filter = `blur(${0.5 * k}px)`; fc.drawImage(rim, 0, 0); fc.restore();
    // key light from the left, very soft
    const kc = mk(w, h), kk = kc.getContext('2d');
    kk.drawImage(fig, 0, 0); kk.globalCompositeOperation = 'source-in'; kk.fillStyle = 'rgba(255,236,200,1)'; kk.fillRect(0, 0, w, h);
    kk.globalCompositeOperation = 'destination-out'; kk.drawImage(fig, 1.2 * k, 0);
    fc.save(); fc.setTransform(1, 0, 0, 1, 0, 0); fc.globalCompositeOperation = 'source-atop'; fc.globalAlpha = 0.25; fc.filter = `blur(${0.6 * k}px)`; fc.drawImage(kc, 0, 0); fc.restore();
  }
  function grain(c, w, h, a, seed) {
    const r = rng(seed); c.save(); c.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < 900; i++) { c.fillStyle = r() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a * 1.4})`; c.fillRect(r() * w, r() * h, 0.4, 0.4); }
    c.restore();
  }

  // background inside the arch
  function portraitBg(key) {
    const s = specOf(key);
    return baked('pbg_' + key, PW, PH, (c, w, h) => {
      const g = c.createRadialGradient(w * 0.45, h * 0.42, 4, w * 0.5, h * 0.5, h * 0.75);
      g.addColorStop(0, light(s.bg[0], 0.12)); g.addColorStop(0.55, s.bg[0]); g.addColorStop(1, s.bg[1]);
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      girih(c, 0, 0, w, h, 14, rgba(light(s.bg[0], 0.5), 0.08), 0.4);
      const lg = c.createRadialGradient(w * 0.5, h * 0.36, 0, w * 0.5, h * 0.36, 40); lg.addColorStop(0, rgba(s.light || '#ffd9a0', 0.22)); lg.addColorStop(1, rgba(s.light || '#ffd9a0', 0)); c.fillStyle = lg; c.fillRect(0, 0, w, h);
    });
  }
  function portraitFig(key, blink) {
    const s = specOf(key);
    if (s.special === 'sado' || s.special === 'obi' || s.special === 'stone') return specialFig(key, s, blink);
    return baked('pfig_' + key + (blink ? '_b' : ''), PW, PH, (c, w, h, k) => {
      paintFigure(c, s, blink, key);
      rimLight(c.canvas, s.rim || '#ffd8a0', 0.75, k);
      grain(c, w, h, 0.05, hash(key));
    });
  }

  /* ---------- the special ones ---------- */
  function specialFig(key, s, blink) {
    return baked('pfig_' + key + (blink ? '_b' : ''), PW, PH, (c, w, h, k) => {
      if (s.special === 'sado') paintSado(c, k);
      else if (s.special === 'obi') paintObi(c, blink, k);
      else paintStone(c, blink, k);
    });
  }
  // Sado: a girl made of light, two braids, the face never quite there
  function sadoShape(c, g) {
    const { cx, cy } = g;
    c.beginPath();
    c.ellipse(cx, cy - 2, 12.4, 15.4, 0, 0, 6.3);
    c.moveTo(cx - 6, cy + 12); c.lineTo(cx + 6, cy + 12); c.lineTo(cx + 6.5, 102); c.lineTo(cx - 6.5, 102); c.closePath();
    c.moveTo(4, PH + 2); c.bezierCurveTo(8, 112, 26, 101, 40, 100); c.lineTo(60, 100); c.bezierCurveTo(74, 101, 92, 112, 96, PH + 2); c.closePath();
  }
  function paintSado(c, k) {
    const g = { cx: 50, cy: 66 };
    const r = rng(77);
    // outer haze
    c.save(); blurOn(c, 6); c.globalAlpha = 0.7; c.fillStyle = '#2fb3a8'; sadoShape(c, g); c.fill(); c.restore(); c.save(); blurOn(c, 1.2); c.globalAlpha = 0.5; c.fillStyle = '#7fe8dc'; sadoShape(c, g); c.fill(); c.restore();
    // braids
    for (const dir of [-1, 1]) {
      for (let i = 0; i < 12; i++) {
        const x = g.cx + dir * (11 + i * 0.35) + Math.sin(i * 1.1) * 0.5, y = g.cy + 4 + i * 4.4;
        const bg = c.createRadialGradient(x, y, 0, x, y, 3.2); bg.addColorStop(0, 'rgba(220,255,250,0.85)'); bg.addColorStop(1, 'rgba(95,216,200,0.15)');
        c.fillStyle = bg; c.beginPath(); c.ellipse(x, y, 2.6 - i * 0.07, 2.6, dir * 0.4, 0, 6.3); c.fill();
      }
    }
    // body of light
    c.save(); sadoShape(c, g); c.clip();
    const bg = c.createLinearGradient(0, 40, 0, PH); bg.addColorStop(0, 'rgba(190,255,245,0.85)'); bg.addColorStop(0.5, 'rgba(95,216,200,0.55)'); bg.addColorStop(1, 'rgba(30,110,110,0.05)');
    c.fillStyle = bg; c.fillRect(0, 0, PW, PH);
    // inner currents
    c.strokeStyle = 'rgba(230,255,252,0.45)'; c.lineWidth = 0.4;
    for (let i = 0; i < 26; i++) { const x = 10 + r() * 80, y = 40 + r() * 100; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 4, y - 6, x - 4, y - 12, x + 1, y - 18); c.stroke(); }
    // face: light, a hint of a nose and the line of a cheek, no eyes
    softEll(c, g.cx + 1, g.cy - 1, 8, 10, '#ffffff', 0.5, 3.2); softEll(c, g.cx - 3, g.cy - 4, 4, 5, '#ffffff', 0.4, 2);
    softEll(c, g.cx + 6, g.cy + 3, 3, 7, '#3aa8a0', 0.3, 2.4);
    c.restore();
    // hair line: parting and fringe of light
    c.strokeStyle = 'rgba(240,255,252,0.7)'; c.lineWidth = 0.6;
    c.beginPath(); c.arc(g.cx, g.cy - 2, 13.6, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.beginPath(); c.moveTo(g.cx, g.cy - 18); c.lineTo(g.cx - 1, g.cy - 10); c.stroke();
    // sparks
    for (let i = 0; i < 40; i++) { const a = r() * 6.28, d = 14 + r() * 30; c.fillStyle = `rgba(230,255,250,${0.3 + r() * 0.6})`; c.beginPath(); c.arc(g.cx + Math.cos(a) * d, g.cy + 10 + Math.sin(a) * d * 1.3, 0.3 + r() * 0.5, 0, 6.3); c.fill(); }
    void k;
  }
  function paintObi(c, blink, k) {
    const r = rng(31), cx = 50, cy = 60;
    // a vast face of water filling the arch
    const fg = c.createRadialGradient(cx - 6, cy - 10, 4, cx, cy + 10, 70); fg.addColorStop(0, '#5fd0e0'); fg.addColorStop(0.5, '#1d6f8f'); fg.addColorStop(1, '#06243a');
    c.fillStyle = fg; c.beginPath(); c.moveTo(-4, PH + 2); c.bezierCurveTo(-6, 60, 10, 6, cx, 4); c.bezierCurveTo(90, 6, 106, 60, 104, PH + 2); c.closePath(); c.fill();
    c.save(); c.clip();
    // streams
    for (let i = 0; i < 44; i++) { const x = r() * 100, y = r() * 60; c.strokeStyle = `rgba(160,240,250,${0.15 + r() * 0.3})`; c.lineWidth = 0.4 + r() * 0.8; c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 2, y + 20, x - 2, y + 50, x + (r() - 0.5) * 4, PH); c.stroke(); }
    // brow ridge & sockets
    softEll(c, cx, cy - 4, 30, 8, '#03121e', 0.7, 3);
    softEll(c, cx - 14, cy + 2, 9, 6, '#020a12', 0.9, 2);
    softEll(c, cx + 14, cy + 2, 9, 6, '#020a12', 0.9, 2);
    // eyes: white light
    for (const dir of [-1, 1]) {
      const ex = cx + dir * 14, ey = cy + 2;
      if (!blink) { const eg = c.createRadialGradient(ex, ey, 0, ex, ey, 6); eg.addColorStop(0, '#ffffff'); eg.addColorStop(0.3, '#cffcff'); eg.addColorStop(1, 'rgba(143,232,240,0)'); c.fillStyle = eg; c.fillRect(ex - 7, ey - 7, 14, 14); }
      else { c.strokeStyle = '#cffcff'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(ex - 4, ey); c.quadraticCurveTo(ex, ey + 1.6, ex + 4, ey); c.stroke(); }
    }
    // nose, mouth: a crack of dark water
    softEll(c, cx + 2, cy + 18, 4, 8, '#04192a', 0.6, 2);
    c.strokeStyle = '#020a12'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(cx - 14, cy + 38); c.quadraticCurveTo(cx, cy + 34, cx + 14, cy + 38); c.stroke();
    // a beard of falling water
    for (let i = 0; i < 30; i++) { const x = cx - 22 + r() * 44; c.strokeStyle = `rgba(200,250,255,${0.2 + r() * 0.35})`; c.lineWidth = 0.5 + r() * 0.6; c.beginPath(); c.moveTo(x, cy + 40); c.quadraticCurveTo(x + (r() - 0.5) * 6, cy + 60, x + (r() - 0.5) * 10, PH); c.stroke(); }
    // salt crust on the brow
    c.fillStyle = 'rgba(240,250,250,0.6)'; for (let i = 0; i < 90; i++) { const x = cx - 30 + r() * 60, y = cy - 30 + r() * 18; c.fillRect(x, y, 0.5 + r(), 0.5); }
    c.restore();
    void k;
  }
  function paintStone(c, blink, k) {
    const r = rng(19), cx = 50;
    const sg = c.createLinearGradient(20, 0, 80, 0); sg.addColorStop(0, '#8a8a98'); sg.addColorStop(0.5, '#6a6a7a'); sg.addColorStop(1, '#3a3a48');
    c.fillStyle = sg; c.beginPath(); c.moveTo(24, PH + 2); c.lineTo(26, 50); c.bezierCurveTo(26, 26, 40, 20, cx, 20); c.bezierCurveTo(62, 20, 74, 26, 74, 50); c.lineTo(76, PH + 2); c.closePath(); c.fill();
    c.save(); c.clip();
    for (let i = 0; i < 400; i++) { c.fillStyle = r() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)'; c.fillRect(20 + r() * 60, 20 + r() * 124, 0.6 + r(), 0.6); }
    // a carved balbal face
    c.strokeStyle = '#2a2a36'; c.lineWidth = 1.1;
    c.beginPath(); c.moveTo(36, 54); c.quadraticCurveTo(42, 50, 48, 54); c.moveTo(52, 54); c.quadraticCurveTo(58, 50, 64, 54); c.stroke();
    c.beginPath(); c.moveTo(50, 56); c.lineTo(49, 70); c.lineTo(53, 70); c.stroke();
    c.beginPath(); c.moveTo(43, 81); c.quadraticCurveTo(50, 80, 57, 81); c.stroke();
    c.beginPath(); c.moveTo(38, 74); c.quadraticCurveTo(36, 90, 50, 92); c.quadraticCurveTo(64, 90, 62, 74); c.stroke();
    // glowing inscription lines (memory)
    c.strokeStyle = blink ? 'rgba(255,226,168,0.4)' : 'rgba(255,226,168,0.85)'; c.lineWidth = 0.6;
    for (let i = 0; i < 6; i++) { const y = 102 + i * 6; c.beginPath(); for (let x = 32; x < 68; x += 3) c.lineTo(x, y + (r() - 0.5) * 2); c.stroke(); }
    c.restore();
    void k;
  }

  /* ---------- drawing a portrait (with idle life) ---------- */
  const portraitIdle = { key: null, blinkAt: 0, born: 0 };
  function drawPortrait(ctx, key, x, y, a, opts) {
    opts = opts || {};
    const s = specOf(key);
    const f = FR();
    if (portraitIdle.key !== key) { portraitIdle.key = key; portraitIdle.blinkAt = f + 90 + (hash(key) % 60); portraitIdle.born = f; }
    if (f > portraitIdle.blinkAt + 8) portraitIdle.blinkAt = f + 140 + ((f * 7919) % 160);
    const blink = f >= portraitIdle.blinkAt && f < portraitIdle.blinkAt + 7 && !s.closed;
    const { w, h, spring } = ARCH;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    // window
    ctx.save();
    archPath(ctx, x + 4.2, y + 5.6, w - 8.4, h - 5.6, spring - 3.2); ctx.clip();
    blit(ctx, portraitBg(key), x, y, PW, PH);
    const t = f / 60;
    if (s.special === 'sado') drawSadoLive(ctx, x, y, t);
    else {
      const breath = Math.sin(t * 1.7 + hash(key) % 7) * 0.5 + 0.5;
      const fig = portraitFig(key, blink);
      const dy = -breath * 0.7 + (opts.enter || 0);
      // body breathes (slight stretch from the bottom), head rides on it
      ctx.drawImage(fig, 0, 0, fig.width, fig.height, x, y + dy, PW, PH - dy);
      if (s.special === 'obi') drawObiLive(ctx, x, y, t);
    }
    // light falling in from the top of the arch
    const lg = ctx.createLinearGradient(0, y, 0, y + h); lg.addColorStop(0, 'rgba(255,240,210,0.10)'); lg.addColorStop(0.4, 'rgba(255,240,210,0)'); lg.addColorStop(0.8, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = lg; ctx.fillRect(x, y, w, h);
    ctx.restore();
    blit(ctx, archFrame(), x - 6, y - 6);
    ctx.restore();
  }
  function drawSadoLive(ctx, x, y, t) {
    const v = (typeof R === 'function' && R()) ? R().void || 0 : 0;
    const dim = 1 - Math.min(0.6, v / 160);
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2);
    const fig = portraitFig('sado', false);
    const cx = x + 50, cy = y + 64;
    // glow behind
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const gg = ctx.createRadialGradient(cx, cy, 2, cx, cy, 56); gg.addColorStop(0, `rgba(143,240,232,${(0.35 + 0.25 * pulse) * dim})`); gg.addColorStop(1, 'rgba(143,240,232,0)');
    ctx.fillStyle = gg; ctx.fillRect(x, y, 100, 144);
    ctx.restore();
    // the figure, drifting a little, flickering at high Hollowness
    const fl = v >= 50 ? (Math.sin(t * 37) > 0.85 ? 0.45 : 1) : 1;
    ctx.save(); ctx.globalAlpha *= (0.75 + 0.25 * pulse) * dim * fl;
    ctx.drawImage(fig, 0, 0, fig.width, fig.height, x + Math.sin(t * 0.9) * 0.8, y + Math.sin(t * 1.3) * 1.2, PW, PH);
    ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.18 * pulse;
    ctx.drawImage(fig, 0, 0, fig.width, fig.height, x, y, PW, PH);
    ctx.restore();
    // motes rising
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      const ph = (t * (0.06 + (i % 5) * 0.012) + i * 0.137) % 1;
      const mx = x + 14 + ((i * 37) % 72) + Math.sin(t + i) * 3, my = y + 144 - ph * 150;
      ctx.fillStyle = `rgba(200,255,250,${(1 - ph) * 0.8 * dim})`; ctx.beginPath(); ctx.arc(mx, my, 0.5 + (i % 3) * 0.3, 0, 6.3); ctx.fill();
    }
    ctx.restore();
  }
  function drawObiLive(ctx, x, y, t) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const ph = (t * 0.25 + i * 0.071) % 1, mx = x + 10 + ((i * 53) % 80);
      ctx.fillStyle = `rgba(170,240,255,${0.35 * (1 - ph)})`; ctx.fillRect(mx, y + 20 + ph * 124, 0.5, 3);
    }
    ctx.restore();
  }
  UA.drawPortrait = drawPortrait;
  UA.specOf = specOf; UA._fig = portraitFig; UA._bg = portraitBg;
  UA.SPEC = SPEC; // [stage 7 hook] companions add their portrait specs (88_party_ui.js)

  /* =====================================================================
     STATE PEEKING: hide the engine's drawing of what we redraw
     ===================================================================== */
  const live = { dlg: null, ch: null, card: null, boss: null, bossT: 0, sub: null, lastSpeaker: null, lastPortrait: null, lastDlgEnd: -999 };
  const listChoice = m => m && m.type === 'choice' && m.kind !== 'scroll' && m.kind !== 'perk' && !m.item && !(G.PROG && G.PROG.ui && G.PROG.ui.open);
  let saved = null;
  function before(state) {
    saved = null;
    if (!UA.on) return;
    const d = D(), m = d.modal, sv = {};
    if (live.prevModal && live.prevModal.type === 'dialog' && m !== live.prevModal) live.lastDlgEnd = FR();
    live.prevModal = m;
    if (m && (m.type === 'dialog' || listChoice(m))) { sv.m = m; sv.mt = m.t; m.t = 0; }
    const card = d.card;
    if (card && !(card.delay > 0)) { sv.card = card; sv.cardDelay = card.delay; card.delay = 1; }
    const bc = d.bossCard;
    if (bc) {
      const e = bossE(bc);
      sv.bc = bc; sv.bcT = bc.t;
      if (bc.t >= 14) bc.t = e >= 0.977 ? 13 : 18 * (1 - Math.cbrt(1 - e));
    }
    if (typeof sub !== 'undefined' && sub.cur && typeof subVisible === 'function' && subVisible(state)) { sv.sub = sub.cur; sub.cur = null; }
    if (state === 'title' && typeof window.__T === 'function') {
      const T0 = window.__T;
      sv.T = T0;
      window.__T = s => (s === 'ЁДГОР' || s === 'ГОРОД НА СПЯЩЕМ ДЭВЕ' ? '' : T0(s));
    }
    live.dlg = sv.m && sv.m.type === 'dialog' ? sv.m : null;
    live.ch = sv.m && sv.m.type === 'choice' ? sv.m : null;
    live.mt = sv.m ? sv.mt : 0;
    live.card = sv.card || null;
    live.boss = sv.bc || null; live.bossT = sv.bc ? sv.bcT : 0;
    live.sub = sv.sub || null;
    saved = sv;
  }
  function after() {
    const sv = saved; saved = null;
    if (!sv) return;
    if (sv.m) sv.m.t = sv.mt;
    if (sv.card) sv.card.delay = sv.cardDelay;
    if (sv.bc) sv.bc.t = sv.bcT;
    if (sv.sub && typeof sub !== 'undefined' && !sub.cur) sub.cur = sv.sub;
    if (sv.T) window.__T = sv.T;
  }
  function bossE(bc) { const t = bc.t, e = bc.life; return t < 18 ? oc(t / 18) : t > e - 24 ? cl((e - t) / 24, 0, 1) : 1; }
  {
    const dp = G.UI.drawPixel, dd = G.UI.draw;
    G.UI.drawPixel = function (ctx, state) { before(state); try { return dp.apply(this, arguments); } finally { after(); } };
    G.UI.draw = function (ctx, state) { before(state); try { return dd.apply(this, arguments); } finally { after(); } };
  }
  // remember who spoke last (a choice right after keeps their portrait)
  {
    const dlg = G.UI.dialog;
    G.UI.dialog = function (o) { try { if (o && o.portrait !== undefined) { live.lastPortrait = o.portrait; live.lastSpeaker = o.speaker; } } catch (e) { /* ignore */ } return dlg.apply(this, arguments); };
  }

  /* =====================================================================
     DIALOG
     ===================================================================== */
  const SPEAKER_COL = { sado: '#9ff3e6', obi: '#9fe8ff', oydin: '#ffd2c0', oydinMask: '#e8e0ff', shirin: '#e0d0ff', tillabek: '#ffd27a', hero: '#ffe7a6', stone: '#ffe2a8' };
  const PLATE_COL = { sado: '#14524e', obi: '#0e3a52', shirin: '#3a2f6e', nargiza: '#1f5a60', oydin: '#5a1a28', oydinMask: '#2a2030', tillabek: '#6a1420', divan: '#6a1420', hero: '#22305a', aksakal: '#5a3020', shaman: '#1f4a56', farrukh: '#6a2a20', widow: '#3d3439', alp: '#3a3634', davron: '#5a4020', bahodir: '#6a5010', gulnora: '#3a4a2a', bride: '#6a1828' };
  function layoutDlg(hasP) {
    return hasP ? { px: 8, py: 118, x: 112, y: 196, w: 360, h: 66, tx: 124 } : { x: 40, y: 196, w: 400, h: 66, tx: 54 };
  }
  function drawBackdrop(ctx, a) {
    const g = ctx.createLinearGradient(0, 150, 0, 270); g.addColorStop(0, 'rgba(6,3,10,0)'); g.addColorStop(1, `rgba(6,3,10,${0.72 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, 150, G.W, 120);
  }
  function drawDialog(ctx) {
    const m = live.dlg; if (!m) return;
    const a = oc(live.mt / 10) * (m.closing ? 1 - m.closeT / 8 : 1);
    if (a <= 0.001) return;
    const hasP = !!m.portrait;
    const L = layoutDlg(hasP), yo = Math.round(12 * (1 - a));
    // the panel fits the longest page (bottom stays put)
    if (m.pages && m.pages.length) {
      const nl = Math.max(1, ...m.pages.map(p => p.length));
      const h = Math.max(38, Math.round(22 + nl * 10.6));
      L.y += L.h - h; L.h = h;
    }
    ctx.save();
    ctx.globalAlpha = a;
    if (hasP) drawPortrait(ctx, m.portrait, L.px - Math.round(8 * (1 - a)), L.py + yo, 1);
    drawPanel(ctx, L.x, L.y + yo, L.w, L.h, { band: true });
    // name
    if (m.speaker) {
      const col = PLATE_COL[m.portrait] || '#3a2018', nc = SPEAKER_COL[m.portrait] || '#ffe7a6';
      const nw = Math.ceil(tw(ctx, m.speaker, { size: 8, weight: 700, font: SERIF, ls: 0.4 })) + 26;
      const pc = plateArt(nw, col);
      ctx.drawImage(pc, L.x + 8 - 4, L.y + yo - 9 - 4, pc.uw, pc.uh);
      txt(ctx, m.speaker, L.x + 8 + nw / 2, L.y + yo - 9 + 2.4, { size: 8, weight: 700, font: SERIF, color: nc, align: 'center', ls: 0.4, sy: 0.7 });
    }
    // text with the engine's typewriter state
    const pages = m.pages;
    if (pages && pages[m.page]) {
      const lines = pages[m.page];
      let d = Math.floor(m.chars);
      const ty = L.y + yo + 12;
      lines.forEach((line, i) => {
        if (d <= 0) return;
        const part = line.slice(0, d); d -= line.length + 1;
        FX.Z(ctx, part, L.tx, ty + i * 10.6, { size: 7.4, color: '#f4ead6', shadow: '#05020a' });
      });
      const full = lines.join(' ').length;
      if (m.chars >= full) {
        const bob = Math.sin(FR() / 9) * 1.2, ax = L.x + L.w - 14, ay = L.y + yo + L.h - 12 + bob;
        ctx.save();
        if (m.page < pages.length - 1) { ctx.fillStyle = COL.gold; ctx.beginPath(); ctx.moveTo(ax - 3, ay); ctx.lineTo(ax + 3, ay); ctx.lineTo(ax, ay + 3.4); ctx.closePath(); ctx.fill(); ctx.fillStyle = COL.goldL; ctx.fillRect(ax - 2, ay, 4, 0.6); }
        else { diamond(ctx, ax, ay + 1.5, 2.6, COL.ink); diamond(ctx, ax, ay + 1.5, 2.1, COL.gold); diamond(ctx, ax, ay + 1.5, 0.9, COL.turq); }
        ctx.restore();
      }
      if (pages.length > 1) {
        for (let i = 0; i < pages.length; i++) {
          const dx = L.x + L.w / 2 - 4 * (pages.length - 1) + 8 * i, dy = L.y + yo + L.h - 6;
          diamond(ctx, dx, dy, i === m.page ? 1.8 : 1.2, i === m.page ? COL.gold : '#5a4a3a');
        }
      }
    }
    ctx.restore();
  }

  /* =====================================================================
     CHOICES
     ===================================================================== */
  const TAGS = {
    kind: ['help', 'mercy', 'forgive', 'give', 'give her', 'promise', 'remember her', 'keep her', 'listen', 'pay', 'stay',
      'помочь', 'пощадить', 'простить', 'отдать', 'пообещать', 'вспомнить', 'оставить', 'слушать', 'заплатить', 'посидеть',
      'yordam', 'rahm', 'kechirish', 'berish', "va'da", 'eslash', 'saqlash', 'tinglash', "to'lash", "o'tirish"],
    cruel: ['kill', 'threaten', 'punish', 'betray', 'chain', 'steal', 'take', 'take the memory', 'profit', 'sell', 'accuse', 'break',
      'убить', 'угрожать', 'наказать', 'выдать', 'сковать', 'украсть', 'взять', 'забрать память', 'нажиться', 'продать', 'обвинить', 'разбить',
      "o'ldirish", "do'q", 'jazo', 'xiyonat', "bog'lash", "o'g'irlash", 'olish', 'xotirani olish', 'foyda', 'sotish', 'ayblash', 'sindirish'],
    guile: ['lie', 'persuade', 'advise', 'солгать', 'убедить', 'посоветовать', "yolg'on", 'ishontirish', 'maslahat'],
    truth: ['truth', 'ask', 'talk', 'evidence', 'show', 'open', 'правда', 'спросить', 'заговорить', 'улика', 'показать', 'открыть', 'haqiqat', 'rost', "so'rash", 'gapirish', 'dalil', "ko'rsatish", 'ochish'],
    memory: ['taste', 'taste the memory', 'burn', 'drink', 'tale', 'tell a tale', 'испить', 'испить память', 'попробовать', 'сжечь', 'выпить', 'сказание', 'рассказать', 'totish', 'xotirani totish', 'yoqish', 'ichish', 'doston'],
    quiet: ['leave', 'stay silent', 'refuse', 'agree', 'join', 'уйти', 'промолчать', 'отказать', 'не прощать', 'согласиться', 'присоединиться', 'ketish', 'indamaslik', 'jim turish', 'rad etish', 'kechirmaslik', "rozi bo'lish", "qo'shilish"]
  };
  const TAGC = { kind: ['#1f6a4a', '#9ff0c0'], cruel: ['#7a1c22', '#ffb0a0'], guile: ['#5a2a6a', '#e0b8ff'], truth: ['#1d4c7a', '#b8dcff'], memory: ['#6a4a10', '#ffe2a8'], quiet: ['#3a3440', '#d8d0dc'], other: ['#4a3a20', '#f2d8a0'] };
  const TAGMAP = {};
  for (const k in TAGS) for (const w of TAGS[k]) TAGMAP[w] = k;
  const tagKind = s => TAGMAP[String(s).toLowerCase().trim()] || 'other';
  function choiceLayout(m, hasP) {
    const n = m.options.length;
    const x = hasP ? 116 : 62, w = 356;
    return { x, w, y: 58, h: 18 * n + 22, rowX: x + 10, rowW: w - 20, n };
  }
  function drawChoice(ctx) {
    const m = live.ch; if (!m) return;
    const i0 = oc(live.mt / 12), a = i0 * (m.picked ? 1 - cl((m.pickT - 6) / 10, 0, 1) : 1);
    if (a <= 0.001) return;
    const hasP = !!live.lastPortrait && FR() - live.lastDlgEnd < 240 && live.lastDlgEnd > 0;
    const L = choiceLayout(m, hasP);
    m._yd = L;
    ctx.save();
    ctx.globalAlpha = a;
    if (hasP) drawPortrait(ctx, live.lastPortrait, 8, 118, 1);
    const yo = Math.round(8 * (1 - i0));
    drawPanel(ctx, L.x, L.y + yo, L.w, L.h, { band: true });
    // title
    if (m.title) {
      const ts = String(m.title);
      let size = 8; while (size > 6 && tw(ctx, ts, { size, weight: 700, font: SERIF }) > L.w - 40) size -= 0.5;
      const nw = Math.min(L.w - 10, Math.ceil(tw(ctx, ts, { size, weight: 700, font: SERIF })) + 30);
      const pc = plateArt(nw, '#2a1830');
      ctx.drawImage(pc, L.x + L.w / 2 - nw / 2 - 4, L.y + yo - 10 - 4, pc.uw, pc.uh);
      txt(ctx, ts, L.x + L.w / 2, L.y + yo - 10 + 2.6 + (8 - size) * 0.5, { size, weight: 700, font: SERIF, color: '#ffe7a6', align: 'center', sy: 0.7 });
    }
    // rows (same rows as the engine's hit boxes: y = 70 + 18 i)
    m.options.forEach((o, i) => {
      const ry = 70 + 18 * i + yo, sel = i === m.sel, lift = (m.lift && m.lift[i]) || 0;
      const rx = L.rowX, rw = L.rowW;
      const locked = o.color === '#7a7080';
      if (sel) {
        const g = ctx.createLinearGradient(rx, 0, rx + rw, 0);
        g.addColorStop(0, 'rgba(226,180,82,0.32)'); g.addColorStop(0.6, 'rgba(226,180,82,0.10)'); g.addColorStop(1, 'rgba(226,180,82,0)');
        ctx.fillStyle = g; ctx.fillRect(rx, ry - 2, rw, 16);
        goldRule(ctx, rx, ry - 2, rx + rw * 0.7, 0.35); goldRule(ctx, rx, ry + 13.6, rx + rw * 0.7, 0.35);
        const pul = 0.5 + 0.5 * Math.sin(FR() / 8);
        ctx.save(); ctx.globalAlpha *= 0.5 + 0.5 * pul; ctx.globalCompositeOperation = 'lighter';
        const gg = ctx.createRadialGradient(rx + 4, ry + 6, 0, rx + 4, ry + 6, 9); gg.addColorStop(0, 'rgba(255,220,140,0.6)'); gg.addColorStop(1, 'rgba(255,220,140,0)'); ctx.fillStyle = gg; ctx.fillRect(rx - 6, ry - 4, 20, 20);
        ctx.restore();
      }
      // gem
      const gx = rx + 4 + lift * 1.5, gy = ry + 6;
      diamond(ctx, gx, gy, sel ? 2.6 : 1.9, COL.ink); diamond(ctx, gx, gy, sel ? 2.1 : 1.4, sel ? COL.gold : '#6a5440'); if (sel) diamond(ctx, gx, gy, 0.8, COL.turqL);
      // number
      let x = rx + 10 + lift * 2;
      txt(ctx, (i + 1) + '.', x, ry + 3, { size: 6, weight: 700, color: sel ? '#ffe7a6' : '#8a7a68', font: SERIF });
      x += 8;
      let label = String(o.label || ''), tag = null;
      const mt = label.match(/^\[([^\]]+)\]\s*(.*)$/);
      if (mt) { tag = mt[1]; label = mt[2]; }
      if (tag) {
        // grey morality: a tag only names a mechanic (a check, a craft) and is never coloured by intent
        const [bg, fg] = TAGC.quiet;
        const tws = tw(ctx, tag, { size: 5.6, weight: 700, ls: 0.3 }) + 7;
        ctx.fillStyle = COL.ink; chamfer(ctx, x - 0.6, ry + 0.4, tws + 1.2, 11.2, 2); ctx.fill();
        const tg = ctx.createLinearGradient(0, ry + 1, 0, ry + 11); tg.addColorStop(0, light(bg, sel ? 0.25 : 0.1)); tg.addColorStop(1, dark(bg, 0.3));
        ctx.fillStyle = tg; chamfer(ctx, x, ry + 1, tws, 10, 1.6); ctx.fill();
        ctx.strokeStyle = sel ? rgba(fg, 0.9) : rgba(fg, 0.4); ctx.lineWidth = 0.35; chamfer(ctx, x + 0.5, ry + 1.5, tws - 1, 9, 1.3); ctx.stroke();
        txt(ctx, tag, x + tws / 2, ry + 3.3, { size: 5.6, weight: 700, color: locked ? '#9a9098' : fg, align: 'center', ls: 0.3, sy: 0.4 });
        x += tws + 4;
      }
      const maxW = rx + rw - 4 - x;
      let col = locked ? '#7a7080' : o.color && o.color !== '#f2e6c8' ? o.color : sel ? '#fff3d6' : '#e8dcc4';
      if (sel && !locked && (!o.color || o.color === '#f2e6c8')) col = '#fff3d6';
      let size = 7;
      while (size > 5.6 && tw(ctx, label, { size }) > maxW) size -= 0.2;
      if (tw(ctx, label, { size }) > maxW) {
        // two lines
        const words = label.split(' '); let l1 = '';
        for (const wd of words) { const tr = l1 ? l1 + ' ' + wd : wd; if (tw(ctx, tr, { size: 5.8 }) > maxW) break; l1 = tr; }
        const l2 = label.slice(l1.length).trim();
        txt(ctx, l1, x, ry - 0.6, { size: 5.8, color: col, shadow: '#05020a' });
        txt(ctx, l2, x, ry + 6.2, { size: 5.8, color: col, shadow: '#05020a' });
      } else txt(ctx, label, x, ry + 2.6 - (size - 7) * 0.4, { size, color: col, shadow: '#05020a', glow: null });
    });
    // footer hint
    const hint = t(`↑↓  choose     Enter  accept|↑↓  выбор     Enter  принять|↑↓  tanlash     Enter  tasdiqlash`) + (m.cancel !== false ? t(`     Esc  back|     Esc  назад|     Esc  orqaga`) : '');
    txt(ctx, hint, G.W / 2 + (hasP ? 54 : 0), G.H - 16, { size: 6, color: '#a89880', align: 'center' });
    ctx.restore();
  }
  // wider rows for the mouse
  {
    const pos = e => { const cv = G.hud || G.display; if (!cv) return null; const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * G.W, (e.clientY - r.top) / r.height * G.H]; };
    const rowAt = (m, p) => {
      const L = m._yd; if (!L || !p) return -1;
      for (let i = 0; i < m.options.length; i++) { const ry = 70 + 18 * i; if (p[0] >= L.rowX && p[0] < L.rowX + L.rowW && p[1] >= ry - 2 && p[1] < ry + 16) return i; }
      return -1;
    };
    const inEngine = (p, i) => p[0] >= G.W / 2 - 110 && p[0] < G.W / 2 + 110 && p[1] >= 70 + 18 * i && p[1] < 86 + 18 * i;
    window.addEventListener('mousemove', e => {
      const m = D().modal; if (!UA.on || !listChoice(m) || m.picked || m.t < 10) return;
      const p = pos(e), i = rowAt(m, p); if (i >= 0 && i !== m.sel && !inEngine(p, i)) { m.sel = i; sfx('ui_move'); }
    }, true);
    window.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      const m = D().modal; if (!UA.on || !listChoice(m) || m.picked || m.t < 10) return;
      const p = pos(e), i = rowAt(m, p); if (i < 0 || inEngine(p, i)) return;
      m.sel = i; m.picked = true; m.pickT = 0; m.pickVal = m.options[i].value; sfx('ui_select');
    }, true);
  }

  /* =====================================================================
     TOASTS (our own list; the engine's stays empty)
     ===================================================================== */
  const TOASTS = [];
  let toastFrame = 0;
  G.UI.toast = function (text, color) {
    TOASTS.push({ text: String(text), color: color || '#f2d27a', t: 0, life: 190 });
    if (TOASTS.length > 4) TOASTS.shift();
  };
  function drawToasts(ctx) {
    const f = FR(), dt = cl(f - toastFrame, 0, 10); toastFrame = f;
    for (const o of TOASTS) o.t += dt;
    for (let i = TOASTS.length - 1; i >= 0; i--) if (TOASTS[i].t > TOASTS[i].life) TOASTS.splice(i, 1);
    if (!TOASTS.length) return;
    const bb = D().bb;
    let y = G.H - 22 - (bb && bb.boss && bb.show > 0 ? 34 : 0);
    ctx.save();
    for (let i = TOASTS.length - 1; i >= 0; i--) {
      const o = TOASTS[i], n = oc(o.t / 10), q = cl((o.life - o.t) / 24, 0, 1), s = __T(o.text);
      let size = 6.6; while (size > 5.4 && tw(ctx, s, { size }) > 230) size -= 0.2;
      const w = Math.min(250, tw(ctx, s, { size })) + 26, h = 14, x = G.W - 8 - w + 30 * (1 - n);
      ctx.globalAlpha = n * q;
      const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, 'rgba(14,8,20,0.96)'); g.addColorStop(1, 'rgba(26,16,34,0.92)');
      ctx.fillStyle = COL.ink; chamfer(ctx, x - 0.8, y - 0.8, w + 1.6, h + 1.6, 3); ctx.fill();
      ctx.fillStyle = g; chamfer(ctx, x, y, w, h, 2.6); ctx.fill();
      ctx.strokeStyle = rgba(o.color, 0.6); ctx.lineWidth = 0.4; chamfer(ctx, x + 1, y + 1, w - 2, h - 2, 2); ctx.stroke();
      ctx.fillStyle = rgba(o.color, 0.18); ctx.fillRect(x + 1.2, y + 1.2, 12, h - 2.4);
      diamond(ctx, x + 7.4, y + h / 2, 3, COL.ink); diamond(ctx, x + 7.4, y + h / 2, 2.4, o.color); diamond(ctx, x + 7.4, y + h / 2, 0.9, '#ffffff');
      txt(ctx, s, x + 15, y + (h - size) / 2 + 0.2, { size, color: light(o.color, 0.55), shadow: '#05020a' });
      y -= Math.round(17 * Math.min(1, n + 0.2) * q);
    }
    ctx.restore();
  }

  /* =====================================================================
     STAGE CARD, BOSS CARD
     ===================================================================== */
  function drawStageCard(ctx) {
    const c = live.card; if (!c) return;
    const e = c.t, a = c.life;
    let o = e < 12 ? oc(e / 12) : e > a - 24 ? cl((a - e) / 24, 0, 1) : 1;
    const hud = D().hud; if (hud && hud.near && hud.near.item) o *= 1 - cl(hud.nearT / 6, 0, 1);
    if (o <= 0.01) return;
    const n = oc(cl((e - 4) / 18, 0, 1)), yo = -6 * (1 - o);
    ctx.save();
    ctx.globalAlpha = o;
    if (0) { const band = ctx.createLinearGradient(0, 0, G.W, 0); band.addColorStop(0.2, 'rgba(6,3,10,0)'); band.addColorStop(0.4, 'rgba(6,3,10,0.6)'); band.addColorStop(0.6, 'rgba(6,3,10,0.6)'); band.addColorStop(0.8, 'rgba(6,3,10,0)');
    ctx.fillStyle = band; ctx.fillRect(0, 34 + yo, G.W, 66); }
    const title = __T(String(c.title || '')), sub = c.sub ? __T(String(c.sub)) : '', label = c.label ? __T(String(c.label)) : '';
    if (label) txt(ctx, label.toUpperCase(), G.W / 2, 41 + yo, { size: 6, weight: 700, color: '#9ff6ff', align: 'center', ls: 2.2, glow: 'rgba(80,220,220,0.5)', glowR: 4 });
    let size = 15; while (size > 9 && tw(ctx, title, { size, weight: 700, font: SERIF, ls: 1 }) > 250) size -= 0.5;
    txt(ctx, title, G.W / 2, 54 + yo + (15 - size) * 0.5, { size, weight: 700, font: SERIF, color: '#fff3d6', align: 'center', ls: 1, glow: 'rgba(255,200,120,0.35)', glowR: 8, sy: 1 });
    // ornament rule
    const wdt = 60 + 150 * n, y = 76 + yo;
    goldRule(ctx, G.W / 2 - wdt / 2, y, G.W / 2 - 6, 0.6); goldRule(ctx, G.W / 2 + 6, y, G.W / 2 + wdt / 2, 0.6);
    rosette(ctx, G.W / 2, y + 0.3, 3.2);
    if (n > 0.2) for (const d of [-1, 1]) { diamond(ctx, G.W / 2 + d * (wdt / 2 + 3), y + 0.3, 1.6, COL.turq); diamond(ctx, G.W / 2 + d * wdt * 0.3, y + 0.3, 1.1, COL.gold); }
    if (sub) { ctx.globalAlpha = o * n; txt(ctx, sub, G.W / 2, 83 + yo, { size: 7.4, style: 'italic', font: SERIF, color: '#efe0c4', align: 'center' }); }
    ctx.restore();
  }
  function drawBossCard(ctx) {
    const bc = live.boss; if (!bc) return;
    const e = live.bossT, life = bc.life, g = (() => { const t = e; return t < 18 ? oc(t / 18) : t > life - 24 ? cl((life - t) / 24, 0, 1) : 1; })();
    const mH = 30 * g;
    ctx.save();
    // letterbox with a tile hem
    if (mH > 4) { tileBand(ctx, 0, mH - 3.2, G.W, 3.2); goldRule(ctx, 0, mH, G.W, 0.5); tileBand(ctx, 0, G.H - mH, G.W, 3.2); goldRule(ctx, 0, G.H - mH - 0.5, G.W, 0.5); }
    const x = e < 14 ? 0 : e < 26 ? (e - 14) / 12 : e > life - 30 ? cl((life - e) / 26, 0, 1) : 1;
    if (x > 0) {
      const S = (G.STORY && G.STORY.bosses) || {}, o = bc.boss || {}, def = o.def || {}, info = S[def.id] || {};
      const name = String(__T(String(info.name || def.name || 'Boss'))).toUpperCase(), title = def.title || info.title || '', quote = info.quote || '';
      const b = G.H - 92, y = -10 * (1 - oc(cl((e - 14) / 12, 0, 1)));
      ctx.globalAlpha = x;
      let size = 24; while (size > 12 && tw(ctx, name, { size, weight: 700, font: SERIF, ls: 2 }) > G.W - 30) size -= 0.5;
      const flash = e >= 14 && e < 20;
      const gr = flash ? ['#ffffff', '#ffffff', '#ffe0d0'] : ['#ffd0a0', '#ff6a4a', '#9a1a1a'];
      txt(ctx, name, G.W / 2, Math.round(b + y), { size, weight: 700, font: SERIF, grad: gr, align: 'center', ls: 2, glow: 'rgba(255,60,30,0.6)', glowR: 10, stroke: '#1a0404', strokeW: 1.2, sy: 1.2 });
      const M = 280 * oc(cl((e - 20) / 22, 0, 1)), ry = b + size + 8;
      goldRule(ctx, G.W / 2 - M / 2, ry, G.W / 2 - 5, 0.6); goldRule(ctx, G.W / 2 + 5, ry, G.W / 2 + M / 2, 0.6);
      diamond(ctx, G.W / 2, ry + 0.3, 3, COL.ink); diamond(ctx, G.W / 2, ry + 0.3, 2.4, '#ff9a7a'); diamond(ctx, G.W / 2, ry + 0.3, 1, '#fff0e0');
      if (title) txt(ctx, __T(String(title)), G.W / 2, ry + 5, { size: 8, style: 'italic', font: SERIF, color: '#f6e0c8', align: 'center' });
      if (quote) { ctx.globalAlpha = x * cl((e - 46) / 24, 0, 1); const qs = __T(String(quote)); txt(ctx, /^["«“„']/.test(qs) ? qs : '“' + qs + '”', G.W / 2, ry + 17, { size: 6.6, style: 'italic', font: SERIF, color: '#c8a090', align: 'center' }); }
    }
    ctx.restore();
  }

  /* =====================================================================
     SADO'S SUBTITLES
     ===================================================================== */
  function drawSubtitle(ctx) {
    const cur = live.sub; if (!cur || live.boss) return;
    const life = 110 + 2.2 * t(cur.text).length;
    const a = Math.min(1, sub.t / 10, (life - sub.t) / 16);
    if (a <= 0) return;
    const sado = cur.who === 'sado';
    const c = who(cur.who), name = c.name ? t(c.name) : '';
    const text = crackle(t(cur.text), sado ? R().void : 0);
    const lines = FX.J(text, 290, 7);
    const h = 10 + lines.length * 10, w = 320, x = G.W / 2 - w / 2, y = G.H - 50 - (lines.length - 1) * 4;
    const col = sado ? '#8ff0e8' : '#e2b452';
    ctx.save(); ctx.globalAlpha = a;
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    g.addColorStop(0, 'rgba(6,3,10,0)'); g.addColorStop(0.12, 'rgba(6,3,10,0.78)'); g.addColorStop(0.88, 'rgba(6,3,10,0.78)'); g.addColorStop(1, 'rgba(6,3,10,0)');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const lg = ctx.createLinearGradient(x, 0, x + w, 0); lg.addColorStop(0, rgba(col, 0)); lg.addColorStop(0.5, rgba(col, 0.8)); lg.addColorStop(1, rgba(col, 0));
    ctx.fillStyle = lg; ctx.fillRect(x, y, w, 0.5); ctx.fillRect(x, y + h - 0.5, w, 0.5);
    // name tab
    if (name) {
      const nw = tw(ctx, name.toUpperCase(), { size: 5.4, weight: 700, ls: 1.6 }) + 14;
      ctx.fillStyle = COL.ink; chamfer(ctx, G.W / 2 - nw / 2 - 0.6, y - 5.6, nw + 1.2, 9.2, 2.2); ctx.fill();
      ctx.fillStyle = sado ? '#0f3a38' : '#3a2410'; chamfer(ctx, G.W / 2 - nw / 2, y - 5, nw, 8, 2); ctx.fill();
      ctx.strokeStyle = rgba(col, 0.8); ctx.lineWidth = 0.35; chamfer(ctx, G.W / 2 - nw / 2 + 0.6, y - 4.4, nw - 1.2, 6.8, 1.6); ctx.stroke();
      txt(ctx, name.toUpperCase(), G.W / 2, y - 3.6, { size: 5.4, weight: 700, color: col, align: 'center', ls: 1.6, sy: 0.4 });
    }
    // her light
    if (sado) {
      const p = 0.5 + 0.5 * Math.sin(FR() / 12), ox = x + 26, oy = y + h / 2;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const og = ctx.createRadialGradient(ox, oy, 0, ox, oy, 9 + 3 * p); og.addColorStop(0, 'rgba(220,255,250,0.9)'); og.addColorStop(0.3, 'rgba(120,230,220,0.45)'); og.addColorStop(1, 'rgba(120,230,220,0)');
      ctx.fillStyle = og; ctx.fillRect(ox - 14, oy - 14, 28, 28); ctx.restore();
    }
    lines.forEach((l, i) => FX.Z(ctx, l, G.W / 2, y + 6 + i * 10, { size: 7, align: 'center', color: sado ? '#d8fff8' : '#f2e6c8', shadow: '#05020a', style: 'italic' }));
    ctx.restore();
  }

  /* =====================================================================
     HUD FRAMES (pixel pass: ornaments on the edges of the engine's boxes)
     ===================================================================== */
  function pxRosette(ctx, x, y) {
    ctx.fillStyle = '#120c14'; ctx.fillRect(x - 2, y - 1, 5, 3); ctx.fillRect(x - 1, y - 2, 3, 5);
    ctx.fillStyle = '#c9963c'; ctx.fillRect(x - 1, y, 3, 1); ctx.fillRect(x, y - 1, 1, 3);
    ctx.fillStyle = '#9ff6ff'; ctx.fillRect(x, y, 1, 1);
  }
  function pxFrame(ctx, x, y, w, h, opt) {
    opt = opt || {};
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(x + 2, y, w - 4, 1); ctx.fillRect(x + 2, y + h - 1, w - 4, 1); ctx.fillRect(x, y + 2, 1, h - 4); ctx.fillRect(x + w - 1, y + 2, 1, h - 4);
    ctx.fillStyle = '#c9963c'; ctx.fillRect(x + 3, y, w - 6, 1);
    // majolica tiles on the top edge
    if (opt.tiles) for (let i = x + 6, k = 0; i < x + w - 6; i += 4, k++) { ctx.fillStyle = k & 1 ? '#2fb3b8' : '#1d4c9a'; ctx.fillRect(i, y - 1, 3, 2); ctx.fillStyle = '#eef3ec'; if (!(k & 1)) ctx.fillRect(i + 1, y - 1, 1, 1); }
    pxRosette(ctx, x + 1, y + 1); pxRosette(ctx, x + w - 2, y + 1); pxRosette(ctx, x + 1, y + h - 2); pxRosette(ctx, x + w - 2, y + h - 2);
  }
  function hudFrames(ctx, st) {
    if (st !== 'play' || !G.run || !G.world || !G.world.player) return;
    const d = D(), hud = d.hud, bb = d.bb, run = G.run, p = G.world.player;
    const card = d.bossCard; const ee = card ? bossE({ t: live.bossT || card.t, life: card.life }) : 0;
    const l = oc(hud.show || 0) * (1 - ee);
    if (l <= 0.01) return;
    ctx.save(); ctx.globalAlpha = l;
    const f = cl(Math.round(84 + 0.3 * (p.maxHp - 100)), 84, 150), h = 7 * (run.maxFlasks || 0) + 12, g = 9 + 4 * String(Math.round(hud.goldShown || 0)).length - 1;
    const x = Math.max(f + 40, h + g + 18, 64);
    pxFrame(ctx, 4, 4, x, 39, { tiles: true });
    pxFrame(ctx, 4, 45, 96, 11);
    // a tumar charm hanging from the box
    ctx.fillStyle = '#6a4a2a'; ctx.fillRect(4 + x - 8, 43, 1, 3);
    ctx.fillStyle = '#120c14'; ctx.fillRect(4 + x - 10, 46, 5, 4); ctx.fillRect(4 + x - 9, 50, 3, 1);
    ctx.fillStyle = '#c9b4ff'; ctx.fillRect(4 + x - 9, 47, 3, 2); ctx.fillRect(4 + x - 8, 49, 1, 1);
    // minimap
    const lv = G.level;
    if (lv && !lv.isRest && !lv.isArena) pxFrame(ctx, G.W - 104, 4, 100, 56, { tiles: true });
    // skill shelf
    const m = d.modal;
    if (!m || m.type !== 'dialog') {
      const y = G.H - 34;
      ctx.globalAlpha = l * 0.85; ctx.fillStyle = '#0b0710'; ctx.fillRect(3, y + 25, 106, 3);
      ctx.globalAlpha = l; ctx.fillStyle = '#6a4a2a'; ctx.fillRect(3, y + 25, 106, 1); ctx.fillStyle = '#c9963c'; ctx.fillRect(5, y + 25, 102, 1);
      for (let i = 0; i < 13; i++) { ctx.fillStyle = i & 1 ? '#2fb3b8' : '#1d4c9a'; ctx.fillRect(6 + i * 8, y + 26, 4, 1); }
      pxRosette(ctx, 3, y + 26); pxRosette(ctx, 108, y + 26);
      ctx.fillStyle = '#c9963c'; ctx.fillRect(55, y + 4, 1, 18); ctx.fillStyle = '#6a4a2a'; ctx.fillRect(56, y + 4, 1, 18);
    }
    void bb;
    ctx.restore();
  }

  /* =====================================================================
     TITLE: logo, glow, motes
     ===================================================================== */
  const MOTES = [];
  function logoArt(word) {
    const W = 260, H = 64;
    return baked('logo_' + word, W, H, (c, w, h) => {
      let size = 34; c.font = `700 ${size}px ${SERIF}`;
      try { c.letterSpacing = '6px'; } catch (e) { /* old */ }
      while (c.measureText(word).width > w - 20 && size > 20) { size -= 1; c.font = `700 ${size}px ${SERIF}`; }
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const y = h / 2 + 2;
      c.save(); c.filter = `blur(${2 * K()}px)`; c.fillStyle = 'rgba(0,0,0,0.85)'; c.fillText(word, w / 2 + 0.6, y + 2.2); c.restore();
      c.lineJoin = 'round'; c.lineWidth = 3.2; c.strokeStyle = '#1a0c06'; c.strokeText(word, w / 2, y);
      c.lineWidth = 1.4; c.strokeStyle = '#7a4a14'; c.strokeText(word, w / 2, y);
      const g = c.createLinearGradient(0, y - size / 2, 0, y + size / 2); g.addColorStop(0, '#fff6d0'); g.addColorStop(0.38, '#f6d27a'); g.addColorStop(0.55, '#d89a30'); g.addColorStop(1, '#8a4c14');
      c.fillStyle = g; c.fillText(word, w / 2, y);
      // inner bevel highlight
      c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(255,255,240,0.5)'; c.fillRect(0, y - size / 2, w, size * 0.12); c.restore();
      // a turquoise inlay line through the letters
      c.save(); c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(47,179,184,0.85)'; c.fillRect(0, y + size * 0.14, w, size * 0.035); c.restore();
      try { c.letterSpacing = '0px'; } catch (e) { /* old */ }
    });
  }
  function logoGlow(word) {
    const lc = logoArt(word);
    return baked('logoG_' + word, lc.uw, lc.uh, (c, w, h, k) => { c.filter = `blur(${5 * k}px)`; c.drawImage(lc, 0, 0, w, h); });
  }
  let shineCv = null;
  function drawTitle(ctx, st) {
    if (st !== 'title') return;
    const TT = D().TT; if (!TT) return;
    const f = FR(), tm = f / 60;
    const o = cl(TT.t / 40, 0, 1), i = TT.screen !== 'main', l = oc(cl(TT.pageT / 12, 0, 1)), ff = i ? 1 - l : TT.pageT < 12 && TT.t > 40 ? l : 1;
    const top = Math.round(10 - 10 * (1 - oc(o)) - (i ? 12 * l : 0));
    // motes and light, behind the logo
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = o;
    for (let k = 0; k < 3; k++) {
      const ang = -0.5 + k * 0.12 + Math.sin(tm * 0.2 + k) * 0.03;
      ctx.save(); ctx.translate(70 + k * 40, -20); ctx.rotate(ang);
      const rg = ctx.createLinearGradient(-12, 0, 12, 0); rg.addColorStop(0, 'rgba(255,220,160,0)'); rg.addColorStop(0.5, `rgba(255,220,160,${0.05 + 0.02 * Math.sin(tm + k)})`); rg.addColorStop(1, 'rgba(255,220,160,0)');
      ctx.fillStyle = rg; ctx.fillRect(-12, 0, 24, 380); ctx.restore();
    }
    if (MOTES.length < 46) for (let k = MOTES.length; k < 46; k++) MOTES.push({ x: Math.random() * G.W, y: Math.random() * G.H, v: 0.08 + Math.random() * 0.2, s: Math.random() * 6.28, r: 0.4 + Math.random() * 0.9, c: Math.random() < 0.7 ? [255, 214, 140] : [160, 240, 230] });
    for (const m of MOTES) {
      m.y -= m.v; m.x += Math.sin(tm * 0.7 + m.s) * 0.12;
      if (m.y < -4) { m.y = G.H + 4; m.x = Math.random() * G.W; }
      const tk = 0.5 + 0.5 * Math.sin(tm * 2 + m.s * 3);
      ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${0.25 + 0.5 * tk})`;
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.3); ctx.fill();
    }
    ctx.restore();
    // logo
    const word = t(`YODGOR|ЁДГОР|YODGOR`);
    const lc = logoArt(word), lg = logoGlow(word);
    const lx = G.W / 2 - lc.uw / 2, ly = top + 22;
    ctx.save();
    ctx.globalAlpha = o * ff;
    ctx.imageSmoothingEnabled = true;
    // backing medallion: a slow girih star
    ctx.save(); ctx.translate(G.W / 2, ly + lc.uh / 2); ctx.rotate(tm * 0.03); ctx.globalAlpha *= 0.22;
    star8(ctx, 0, 0, 46, null, 'rgba(242,210,122,0.9)', 0.5); star8(ctx, 0, 0, 38, null, 'rgba(47,179,184,0.8)', 0.4); ctx.restore();
    const gp = 0.55 + 0.45 * Math.sin(tm * 1.3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.55 * gp; ctx.drawImage(lg, lx, ly, lg.uw, lg.uh); ctx.restore();
    ctx.drawImage(lc, lx, ly, lc.uw, lc.uh);
    // a shine passing through the letters
    const k = K(), cw = Math.ceil(lc.uw * k), chh = Math.ceil(lc.uh * k);
    if (!shineCv || shineCv.width !== cw || shineCv.height !== chh) shineCv = mk(cw, chh);
    const sc = shineCv.getContext('2d');
    const ph = ((tm * 0.22) % 1.6) - 0.3;
    if (ph > -0.2 && ph < 1.2) {
      sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalCompositeOperation = 'copy'; sc.drawImage(lc, 0, 0);
      sc.globalCompositeOperation = 'source-in';
      const sx = ph * cw, sg = sc.createLinearGradient(sx - 40 * k, 0, sx + 40 * k, chh * 0.4); sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,240,0.85)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      sc.fillStyle = sg; sc.fillRect(0, 0, cw, chh);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha *= 0.7; ctx.drawImage(shineCv, lx, ly, lc.uw, lc.uh); ctx.restore();
    }
    // subtitle ribbon (also covers the engine's rules)
    const sub = t(`THE CITY ON A SLEEPING DIV|ГОРОД НА СПЯЩЕМ ДЭВЕ|UXLAYOTGAN DEV USTIDAGI SHAHAR`);
    const sw = tw(ctx, sub, { size: 6.4, weight: 700, ls: 2.4 }) + 26, sy = top + 70;
    const pc = plateArt(Math.ceil(sw), '#0f3a40');
    ctx.drawImage(pc, G.W / 2 - Math.ceil(sw) / 2 - 4, sy - 4, pc.uw, pc.uh);
    txt(ctx, sub, G.W / 2, sy + 3.4, { size: 6.4, weight: 700, color: '#bff8f0', align: 'center', ls: 2.4, sy: 0.5 });
    for (const d of [-1, 1]) {
      const x0 = G.W / 2 + d * (sw / 2 + 6), x1 = G.W / 2 + d * (sw / 2 + 46);
      goldRule(ctx, Math.min(x0, x1), sy + 6.2, Math.max(x0, x1), 0.6);
      diamond(ctx, x1 + d * 3, sy + 6.5, 2.2, COL.ink); diamond(ctx, x1 + d * 3, sy + 6.5, 1.7, COL.gold); diamond(ctx, x1 + d * 3, sy + 6.5, 0.6, COL.turq);
    }
    ctx.restore();
  }

  /* =====================================================================
     HOOKS
     ===================================================================== */
  // bake the frames and the two voices we hear most while the player is still on the title
  setTimeout(() => { try { archFrame(); for (const k of ['hero', 'sado']) { portraitBg(k); portraitFig(k, false); } } catch (e) { /* later */ } }, 2500);
  // when a dialog closes, note the time (a following choice keeps the portrait)
  // large translucent fills go on the 480x270 pass (cheap), under the HD art
  function drawUnder(ctx) {
    const d = live.dlg, ch = live.ch;
    if (d) { const a = oc(live.mt / 10) * (d.closing ? 1 - d.closeT / 8 : 1); if (a > 0) drawBackdrop(ctx, a); }
    if (ch) {
      const a = oc(live.mt / 12) * (ch.picked ? 1 - cl((ch.pickT - 6) / 10, 0, 1) : 1);
      if (a > 0) { ctx.fillStyle = `rgba(5,2,9,${0.5 * a})`; ctx.fillRect(0, 0, G.W, G.H); drawBackdrop(ctx, a); }
    }
    const c = live.card;
    if (c) {
      const e = c.t, L = c.life; let o = e < 12 ? oc(e / 12) : e > L - 24 ? cl((L - e) / 24, 0, 1) : 1;
      const hud = D().hud; if (hud && hud.near && hud.near.item) o *= 1 - cl(hud.nearT / 6, 0, 1);
      if (o > 0.01) {
        const band = ctx.createLinearGradient(0, 0, G.W, 0); band.addColorStop(0.15, 'rgba(6,3,10,0)'); band.addColorStop(0.38, `rgba(6,3,10,${0.6 * o})`); band.addColorStop(0.62, `rgba(6,3,10,${0.6 * o})`); band.addColorStop(0.85, 'rgba(6,3,10,0)');
        ctx.fillStyle = band; ctx.fillRect(0, Math.round(34 - 6 * (1 - o)), G.W, 66);
      }
    }
    const bc = live.boss;
    if (bc) {
      const e = live.bossT, life = bc.life, g = e < 18 ? oc(e / 18) : e > life - 24 ? cl((life - e) / 24, 0, 1) : 1, mH = Math.round(30 * g);
      ctx.fillStyle = '#05030a'; ctx.fillRect(0, 0, G.W, mH); ctx.fillRect(0, G.H - mH, G.W, mH);
      const x = e < 14 ? 0 : e < 26 ? (e - 14) / 12 : e > life - 30 ? cl((life - e) / 26, 0, 1) : 1;
      if (x > 0) { const b = G.H - 92, band = ctx.createLinearGradient(0, 0, G.W, 0); band.addColorStop(0, 'rgba(10,2,4,0)'); band.addColorStop(0.5, `rgba(10,2,4,${0.5 * x})`); band.addColorStop(1, 'rgba(10,2,4,0)'); ctx.fillStyle = band; ctx.fillRect(0, b - 12, G.W, 66); }
    }
  }
  const ST = UA.stats; ST.ms = 0; ST.n = 0;
  PIXEL_DRAW.push((ctx, st) => { if (!UA.on) return; const t0 = performance.now(); hudFrames(ctx, st); ctx.save(); try { drawUnder(ctx); } finally { ctx.restore(); } ST.ms += performance.now() - t0; });
  SMOOTH_DRAW.push((ctx, st) => {
    if (!UA.on) return;
    const t0 = performance.now(); ST.n++;
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    try {
      drawTitle(ctx, st);
      drawStageCard(ctx);
      drawBossCard(ctx);
      drawSubtitle(ctx);
      drawToasts(ctx);
      drawChoice(ctx);
      drawDialog(ctx);
    } finally { ctx.restore(); ST.ms += performance.now() - t0; }
  });
}
