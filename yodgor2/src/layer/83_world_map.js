/* =====================================================================
   Stage 4 — the map: a painted scroll of the city on the Sleeper in
   cross-section (five tiers), regions revealed as visited, rooms revealed
   as seen, chaikhana lights, quest marks, the hero, fog over the unknown.
   [M] opens it while playing in the open city (also from the pause menu:
   press M there). Enter / click zooms into a region; inside a chaikhana
   [T] or Enter on a lit chaikhana travels there (free, only from a chaikhana).
   Data it keeps (save): sil{region:{w,h,b}} a 2x2-tile silhouette, pts{region:[...]}
   the places on it, seen{region: b64 bits of 8x8-tile cells}, charts (bought maps).
   ===================================================================== */
{
  const TS = G.TS, T = G.T, U = G.U, RD = Math.round;
  const CELL = 8;   // tiles per seen-cell
  const b64e = a => { let s = ''; for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); };
  const b64d = (s, n) => { const out = new Uint8Array(n); try { const r = atob(s || ''); for (let i = 0; i < r.length && i < n; i++) out[i] = r.charCodeAt(i); } catch (e) { /* empty */ } return out; };

  /* ---------------------------------------------------------------- silhouettes and points */
  W2.silhouette = (L, region) => {
    const w = Math.ceil(L.w / 2), h = Math.ceil(L.h / 2), bits = new Uint8Array(Math.ceil(w * h / 8));
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let n = 0;
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { const tt = L.get(x * 2 + b, y * 2 + a); if (tt === T.SOLID) n++; }
      if (n >= 2) bits[(y * w + x) >> 3] |= 1 << ((y * w + x) & 7);
    }
    const s = W2.S();
    W2._sil[region] = { w, h, bits, tw: L.w, th: L.h };
    // the places that appear on the map (tile coordinates)
    const pts = [];
    for (const o of (L.w2 && L.w2.objs) || []) {
      const k = o.type === 'exit' ? 'exit' : o.type;
      if (!['exit', 'chai', 'house', 'grate', 'hooktower', 'lightfloor', 'lightwall', 'sealed', 'stall'].includes(k)) continue;
      pts.push({ k, x: Math.round(o.x / TS), y: Math.round(o.y / TS), id: o.ex ? o.ex.id : (o.od && o.od.id) || '', to: o.ex && o.ex.to ? o.ex.to[0] : null, sid: o.gid || o.sid });
    }
    for (const id in (L.w2 && L.w2.spots) || {}) { const p = L.w2.spots[id]; pts.push({ k: 'spot', id, x: Math.round(p.x / TS), y: Math.round(p.y / TS) }); }
    if (s) { s.sil[region] = { w, h, b: b64e(bits), tw: L.w, th: L.h }; s.pts = s.pts || {}; s.pts[region] = pts; }
  };
  const silOf = region => {
    if (W2._sil[region]) return W2._sil[region];
    const s = W2.S(), z = s && s.sil[region];
    if (!z) return null;
    const v = { w: z.w, h: z.h, bits: b64d(z.b, Math.ceil(z.w * z.h / 8)), tw: z.tw, th: z.th };
    W2._sil[region] = v;
    return v;
  };
  // a bought map: the outlines of a region (generated now if it was never visited)
  W2.chart = region => {
    const s = W2.S(), def = W2.regions[region];
    if (!s || !def || def.todo) return;
    s.charts[region] = 1; save();
    if (s.sil[region]) return;
    const b = G.Biomes.get(W2.biomeOf(def));
    const prev = W2._gen;
    W2._gen = { def, seed: s.seeds[region] || def.seed || 1, entry: 'start' };
    try { (b.gen && b.gen.open ? G.LevelGen.open : G.LevelGen.generate)(b, 0); } catch (e) { console.error('[map] chart', e); } finally { W2._gen = prev; }
    save();
  };

  /* ---------------------------------------------------------------- what he has seen */
  const seenMem = {};   // region -> {w, h, bits, dirty}
  const seenOf = region => {
    let v = seenMem[region];
    if (v) return v;
    const s = W2.S(), sil = silOf(region);
    if (!sil) return null;
    const w = Math.ceil(sil.tw / CELL), h = Math.ceil(sil.th / CELL);
    v = { w, h, bits: b64d(s && s.seen[region], Math.ceil(w * h / 8)), dirty: false, n: 0 };
    seenMem[region] = v;
    return v;
  };
  W2.flushSeen = () => { const s = W2.S(); if (!s) return; for (const r in seenMem) if (seenMem[r].dirty) { s.seen[r] = b64e(seenMem[r].bits); seenMem[r].dirty = false; } };
  W2.hooks.newWorld.push(() => { for (const k in seenMem) delete seenMem[k]; for (const k in W2._sil) delete W2._sil[k]; });
  G.Events.on('newRun', () => { for (const k in seenMem) delete seenMem[k]; for (const k in W2._sil) delete W2._sil[k]; });
  W2.hooks.enter.push(def => { delete seenMem[def.id]; });   // re-read from the save (a load may have changed it)
  W2.isSeen = (region, tx, ty) => { const v = seenOf(region); if (!v) return false; const i = Math.floor(ty / CELL) * v.w + Math.floor(tx / CELL); return !!(v.bits[i >> 3] & (1 << (i & 7))); };
  let st = 0;
  W2.ticks.push(() => {
    if (W2.inside || ++st % 10) return;
    const v = seenOf(W2.active), cam = G.cam;
    if (!v || !cam) return;
    const x0 = Math.floor((cam.x - 40) / TS / CELL), x1 = Math.floor((cam.x + G.W + 40) / TS / CELL);
    const y0 = Math.floor((cam.y - 30) / TS / CELL), y1 = Math.floor((cam.y + G.H + 30) / TS / CELL);
    for (let y = Math.max(0, y0); y <= Math.min(v.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(v.w - 1, x1); x++) {
      const i = y * v.w + x;
      if (!(v.bits[i >> 3] & (1 << (i & 7)))) { v.bits[i >> 3] |= 1 << (i & 7); v.dirty = true; v.n++; }
    }
    if (v.dirty && st % 120 === 0) W2.flushSeen();
  });
  W2.seenCount = region => { const v = seenOf(region); if (!v) return 0; let n = 0; for (const b of v.bits) for (let k = 0; k < 8; k++) if (b & (1 << k)) n++; return n; };

  /* ---------------------------------------------------------------- the screen */
  const M = W2.map = { open: false, view: 'world', sel: null, t: 0, hits: [] };
  Object.defineProperty(W2, 'mapOpen', { get: () => M.open });
  let blocker = false;
  const known = () => { // regions shown on the scroll: visited, charted, or next to a visited one
    const s = W2.S(), out = {};
    if (!s) return out;
    for (const id in W2.regions) {
      const r = W2.regions[id];
      if (r.arena || !r.map) continue;             // a lair is part of the region that holds its gate
      if (s.visited[id]) { out[id] = 'visited'; continue; }
      if (s.charts[id]) { out[id] = 'charted'; continue; }
    }
    for (const id in s.visited) {
      const r = W2.regions[id]; if (!r) continue;
      for (const e in r.exits) { const to = r.exits[e].to && r.exits[e].to[0]; if (to && W2.regions[to] && !W2.regions[to].arena && W2.regions[to].map && !out[to]) out[to] = 'rumour'; }
    }
    return out;
  };
  W2.openMap = (tries) => {
    if (M.open || !W2.on() || G.Game.state !== 'play') return;
    if (G.UI.isOpen && G.UI.isOpen()) { if ((tries || 0) < 40) setTimeout(() => W2.openMap((tries || 0) + 1), 50); return; }
    W2.flushSeen();
    M.open = true; M.t = 0; M.view = 'world'; M.sel = W2.active; M.msg = '';
    blocker = true;
    G.UI.choice({ title: '', cancel: true, options: [{ label: ' ', value: null }], kind: 'scroll', onPick: () => { blocker = false; if (M.open) closeMap(true); } });
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    sfx('scroll');
  };
  function closeMap(fromModal) {
    if (!M.open) return;
    M.open = false;
    const m = G.UI._debug().modal;
    if (!fromModal && m && m.type === 'choice' && blocker) { m.picked = true; m.pickT = 0; m.pickVal = null; }
    blocker = false;
    try { G.input.keys.clear(); G.input.down = {}; G.input.lastPress = {}; } catch (e) { /* ignore */ }
    sfx('ui_back');
  }
  W2.closeMap = () => closeMap(false);
  // engine input muted while the scroll is open
  {
    const up0 = G.input.update;
    G.input.update = function () { if (M.open) { this.prev = this.down; this.down = {}; this.anyPressed = false; return; } return up0.apply(this, arguments); };
  }
  (function watch() { if (M.open && !(G.UI.isOpen && G.UI.isOpen())) M.open = false; requestAnimationFrame(watch); })();
  const order = () => { const k = known(); return Object.keys(k).sort((a, b) => W2.regions[a].map.x - W2.regions[b].map.x || W2.regions[a].map.y - W2.regions[b].map.y); };
  function step(dx, dy) {
    const k = known(), cur = W2.regions[M.sel] || W2.regions[W2.active];
    let best = null, bd = 1e9;
    for (const id in k) {
      if (id === M.sel) continue;
      const r = W2.regions[id].map, ddx = r.x - cur.map.x, ddy = r.y - cur.map.y;
      if (dx && Math.sign(ddx) !== dx) continue; if (dy && Math.sign(ddy) !== dy) continue;
      const d = Math.abs(ddx) * (dy ? 3 : 1) + Math.abs(ddy) * (dx ? 3 : 1);
      if (d < bd) { bd = d; best = id; }
    }
    if (best) { M.sel = best; sfx('ui_move'); }
  }
  function travelTo(id) {
    const s = W2.S();
    const ch = W2.chaiList().find(c => c.region === id && s.chai[c.id] && c.id !== W2.inside);
    if (!W2.inside) { M.msg = t(`Travel only from a chaikhana.|Перемещаться можно только из чайханы.|Faqat choyxonadan ko'chib o'tish mumkin.`); sfx('denied'); return; }
    if (!ch) { M.msg = t(`No chaikhana you know there.|Там нет знакомой чайханы.|U yerda tanish choyxona yo'q.`); sfx('denied'); return; }
    closeMap(false);
    setTimeout(() => W2.travel(ch.id), 60);
  }
  function key(k) {
    if (k === 'back') { if (M.view === 'region') { M.view = 'world'; sfx('ui_back'); } else closeMap(false); return; }
    if (k === 'map') { closeMap(false); return; }
    if (M.view === 'world') {
      if (k === 'left') step(-1, 0); else if (k === 'right') step(1, 0); else if (k === 'up') step(0, -1); else if (k === 'down') step(0, 1);
      else if (k === 'ok') { const kn = known()[M.sel]; if (kn === 'visited' || kn === 'charted') { M.view = 'region'; sfx('ui_select'); } else { M.msg = t(`You have not been there.|Ты там не был.|U yerda bo'lmagansan.`); sfx('denied'); } }
      else if (k === 'travel') travelTo(M.sel);
    } else if (k === 'ok' || k === 'travel') { if (k === 'travel') travelTo(M.sel); else { M.view = 'world'; sfx('ui_back'); } }
  }
  W2.mapKey = key;
  const KEYS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Enter: 'ok', Space: 'ok', KeyF: 'ok', KeyJ: 'ok', Escape: 'back', Backspace: 'back', KeyM: 'map', KeyT: 'travel', Tab: 'ok' };
  window.addEventListener('keydown', e => {
    if (!M.open) {
      if (e.code !== 'KeyM' || e.repeat || !W2.on()) return;
      const m = G.UI._debug().modal;
      if (m && m.type === 'pause' && !m.sub) { m.closing = true; m.closeT = 0; setTimeout(W2.openMap, 220); e.preventDefault(); return; }
      if (G.Game.state === 'play' && !(G.UI.isOpen && G.UI.isOpen()) && !busy) { W2.openMap(); e.preventDefault(); e.stopImmediatePropagation(); }
      return;
    }
    e.stopImmediatePropagation(); e.preventDefault();
    if (e.repeat) return;
    const k = KEYS[e.code]; if (k) key(k);
  }, true);
  window.addEventListener('keyup', e => { if (M.open) e.stopImmediatePropagation(); }, true);
  const toUI = e => { const c = document.getElementById('game') || document.querySelector('canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * G.W, y: (e.clientY - r.top) / r.height * G.H }; };
  window.addEventListener('pointerdown', e => {
    if (!M.open) return;
    const q = toUI(e); if (!q) return;
    e.stopImmediatePropagation(); e.preventDefault();
    for (const h of M.hits) if (q.x >= h.x && q.x < h.x + h.w && q.y >= h.y && q.y < h.y + h.h) { if (h.id === M.sel && M.view === 'world') key('ok'); else if (h.act) h.act(); else { M.sel = h.id; sfx('ui_move'); } return; }
  }, true);

  /* ---------------------------------------------------------------- painting */
  const COL = { paper: '#e9d9b4', paper2: '#d8c294', ink: '#3a2614', inkL: '#6a4a2a', red: '#a8323a', turq: '#2a8a9a', gold: '#c89a3a', fog: '#cbb68a', dark: '#1a1008' };
  let paperCv = null, sleeperCv = null;
  function paper(w, h) {
    if (paperCv && paperCv.width === w * 2) return paperCv;
    const k = 2, cv = document.createElement('canvas'); cv.width = w * k; cv.height = h * k;
    const c = cv.getContext('2d'); c.scale(k, k);
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#ecdcb8'); g.addColorStop(0.5, COL.paper); g.addColorStop(1, '#dcc59a');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = U.RNG(19);
    for (let i = 0; i < 2600; i++) { c.fillStyle = r.chance(0.5) ? 'rgba(120,80,40,0.05)' : 'rgba(255,250,230,0.07)'; c.fillRect(r.range(0, w), r.range(0, h), r.range(0.5, 2.5), r.range(0.5, 1.5)); }
    for (let i = 0; i < 18; i++) { const x = r.range(0, w), y = r.range(0, h), rr = r.range(8, 30), gg = c.createRadialGradient(x, y, 0, x, y, rr); gg.addColorStop(0, 'rgba(140,100,50,0.08)'); gg.addColorStop(1, 'rgba(140,100,50,0)'); c.fillStyle = gg; c.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    // burnt edges
    const e = c.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(90,50,20,0.35)'); e.addColorStop(0.04, 'rgba(90,50,20,0)'); e.addColorStop(0.96, 'rgba(90,50,20,0)'); e.addColorStop(1, 'rgba(90,50,20,0.35)');
    c.fillStyle = e; c.fillRect(0, 0, w, h);
    const e2 = c.createLinearGradient(0, 0, 0, h); e2.addColorStop(0, 'rgba(90,50,20,0.25)'); e2.addColorStop(0.05, 'rgba(90,50,20,0)'); e2.addColorStop(0.95, 'rgba(90,50,20,0)'); e2.addColorStop(1, 'rgba(90,50,20,0.3)');
    c.fillStyle = e2; c.fillRect(0, 0, w, h);
    paperCv = cv;
    return cv;
  }
  // the Sleeper: a long body lying under the city, the tail on the left, the head on the right
  function sleeper(w, h) {
    if (sleeperCv && sleeperCv.width === w * 2) return sleeperCv;
    const k = 2, cv = document.createElement('canvas'); cv.width = w * k; cv.height = h * k;
    const c = cv.getContext('2d'); c.scale(k, k);
    const back = x => h * (0.4 - 0.1 * Math.sin(x / w * Math.PI) - 0.04 * Math.sin(x / w * Math.PI * 3.2));
    c.beginPath(); c.moveTo(0, back(0) + 14);
    for (let x = 0; x <= w; x += 4) c.lineTo(x, back(x));
    c.lineTo(w, h * 0.92); c.quadraticCurveTo(w * 0.5, h * 1.02, 0, h * 0.86); c.closePath();
    const g = c.createLinearGradient(0, h * 0.3, 0, h); g.addColorStop(0, 'rgba(58,38,20,0.13)'); g.addColorStop(1, 'rgba(58,38,20,0.32)');
    c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(58,38,20,0.55)'; c.lineWidth = 0.7; c.stroke();
    // ribs and scales, sketched in ink
    c.strokeStyle = 'rgba(58,38,20,0.18)'; c.lineWidth = 0.5;
    for (let x = 20; x < w - 10; x += 14) { c.beginPath(); c.moveTo(x, back(x) + 4); c.quadraticCurveTo(x + 6, h * 0.66, x - 4, h * 0.88); c.stroke(); }
    for (let i = 0; i < 4; i++) { c.beginPath(); for (let x = 0; x <= w; x += 6) c.lineTo(x, back(x) + 18 + i * 22 + Math.sin(x * 0.05 + i) * 3); c.stroke(); }
    // the head (right): a closed eye
    c.strokeStyle = 'rgba(58,38,20,0.6)'; c.lineWidth = 0.8;
    c.beginPath(); c.ellipse(w - 30, back(w - 30) + 30, 9, 3, -0.2, 0, Math.PI); c.stroke();
    sleeperCv = cv;
    return cv;
  }
  const txt = (ctx, s, x, y, o) => FX.tt(ctx, s, x - (o.align === 'center' ? 200 : 0), y, 400, o);
  function lampAt(ctx, x, y, on, tm) {
    if (on) { const gg = ctx.createRadialGradient(x, y, 0, x, y, 7); gg.addColorStop(0, 'rgba(255,200,90,0.85)'); gg.addColorStop(1, 'rgba(255,170,60,0)'); ctx.fillStyle = gg; ctx.fillRect(x - 7, y - 7, 14, 14); }
    ctx.fillStyle = on ? '#ffcf6a' : '#8a7a5a'; ctx.beginPath(); ctx.arc(x, y, 1.6 + (on ? 0.3 * Math.sin(tm * 4 + x) : 0), 0, 6.3); ctx.fill();
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 0.35; ctx.stroke();
  }
  function heroAt(ctx, x, y, tm) {
    const b = Math.sin(tm * 3) * 0.8;
    ctx.fillStyle = COL.red; ctx.beginPath(); ctx.moveTo(x, y + b); ctx.lineTo(x - 3, y - 5 + b); ctx.lineTo(x + 3, y - 5 + b); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - 6 + b, 2.6, 0, 6.3); ctx.fill();
    ctx.fillStyle = '#ffe7a6'; ctx.beginPath(); ctx.arc(x, y - 6 + b, 1, 0, 6.3); ctx.fill();
  }
  function markAt(ctx, x, y, kind, tm) {
    const c = kind === 'trade' ? COL.gold : kind === 'person' ? COL.turq : kind === 'pin' ? COL.inkL : COL.red;
    const s = 2.6 + 0.4 * Math.sin(tm * 5);
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.lineTo(x + s, y); ctx.lineTo(x, y + s); ctx.lineTo(x - s, y); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = COL.dark; ctx.lineWidth = 0.4; ctx.stroke();
  }
  const markPos = (m) => { // a mark: px coordinates or a named spot
    if (typeof m.x === 'string') { const s = W2.S(), p = (s.pts && s.pts[m.region] || []).find(q => q.id === m.x); return p ? { tx: p.x, ty: p.y } : null; }
    return { tx: m.x / TS, ty: m.y / TS };
  };

  function drawWorld(ctx, X, Y, W, H, tm) {
    const s = W2.S(), kn = known();
    // tiers
    const tierY = { heights: 0.1, surface: 0.32, under: 0.58, deep: 0.78, dream: 0.93 };
    ctx.drawImage(sleeper(W, H), X, Y, W, H);
    for (const tr of W2.tiers) {
      const y = Y + H * tierY[tr.id];
      ctx.strokeStyle = 'rgba(58,38,20,0.18)'; ctx.setLineDash([2, 3]); ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(X + 6, y + 12); ctx.lineTo(X + W - 6, y + 12); ctx.stroke(); ctx.setLineDash([]);
      txt(ctx, t(tr.name).toUpperCase(), X + W - 6, y + 4, { size: 4.4, align: 'right', color: COL.inkL });
    }
    // links between known regions
    ctx.strokeStyle = 'rgba(58,38,20,0.45)'; ctx.lineWidth = 0.6;
    for (const id in kn) {
      const r = W2.regions[id]; if (!r.exits) continue;
      for (const e in r.exits) {
        const to = r.exits[e].to && r.exits[e].to[0]; if (!to || !kn[to] || to < id && kn[to] === 'visited' && r.exits[e].kind !== 'shaft') continue;
        const a = r.map, b = W2.regions[to].map;
        ctx.setLineDash(kn[to] === 'visited' && kn[id] === 'visited' ? [] : [1.5, 2]);
        ctx.beginPath(); ctx.moveTo(X + a.x * W, Y + a.y * H); ctx.lineTo(X + b.x * W, Y + b.y * H); ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    M.hits = [];
    // regions
    for (const id in W2.regions) {
      const r = W2.regions[id], st = kn[id];
      if (r.arena || !r.map) continue;
      const cx = X + r.map.x * W, cy = Y + r.map.y * H, w = r.map.w * W, h = r.map.h * H;
      const x0 = cx - w / 2, y0 = cy - h / 2;
      if (!st) { // fog
        ctx.fillStyle = 'rgba(203,182,138,0.55)'; ctx.beginPath(); ctx.ellipse(cx, cy, w * 0.45, h * 0.4, 0, 0, 6.3); ctx.fill();
        continue;
      }
      M.hits.push({ id, x: x0, y: y0, w, h });
      const sel = id === M.sel;
      ctx.save();
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x0, y0, w, h, 3) : ctx.rect(x0, y0, w, h);
      if (st === 'visited') { ctx.fillStyle = r.map.col; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; }
      else if (st === 'charted') { ctx.fillStyle = r.map.col; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1; }
      else { ctx.fillStyle = 'rgba(120,90,50,0.12)'; ctx.fill(); }
      ctx.lineWidth = sel ? 1.1 : 0.6; ctx.strokeStyle = sel ? COL.red : COL.ink; ctx.setLineDash(st === 'rumour' ? [1.5, 1.5] : []); ctx.stroke(); ctx.setLineDash([]);
      // the region's own outline in miniature
      const sil = (st === 'visited' || st === 'charted') && silOf(id);
      if (sil) {
        const cv = miniCv(id, sil);
        ctx.globalAlpha = 0.75; ctx.imageSmoothingEnabled = true; ctx.drawImage(cv, x0 + 2, y0 + 2, w - 4, h - 4); ctx.globalAlpha = 1;
      }
      ctx.restore();
      const name = st === 'rumour' ? t(r.name) + ' ?' : t(r.name);
      txt(ctx, name, cx, y0 - 7.5, { size: sel ? 5.4 : 4.8, align: 'center', color: sel ? COL.red : COL.ink });
      // chaikhana lights
      for (const c of W2.chaiList().filter(c => c.region === id)) if (s.visited[id]) { const p = (s.pts && s.pts[id] || []).find(q => q.k === 'chai' && q.id === c.id); const fx = p && sil ? p.x / sil.tw : 0.5; lampAt(ctx, x0 + fx * w, y0 + h - 3, !!s.chai[c.id], tm); }
      if (id === W2.active) heroAt(ctx, cx, cy + 2, tm);
      for (const mid in s.marks) { const m = s.marks[mid]; if (m.region === id) { const p = markPos(m); const fx = p && sil ? p.tx / sil.tw : 0.5; markAt(ctx, x0 + fx * w, y0 + 4, m.kind, tm); } }
    }
  }
  const miniCache = {};
  function miniCv(id, sil, fog) {
    const v = fog ? seenOf(id) : null;
    const key = id + (fog ? ':f' + (v ? v.n + ':' + W2.seenCount(id) : '') : '') + ':' + Object.keys(W2.S().open).length;
    const c0 = miniCache[id + (fog ? 'f' : '')];
    if (c0 && c0.key === key) return c0.cv;
    const cv = document.createElement('canvas'); cv.width = sil.w; cv.height = sil.h;
    const c = cv.getContext('2d'), img = c.createImageData(sil.w, sil.h), d = img.data;
    for (let y = 0; y < sil.h; y++) for (let x = 0; x < sil.w; x++) {
      const i = y * sil.w + x, solid = sil.bits[i >> 3] & (1 << (i & 7));
      const seen = !fog || W2.isSeen(id, x * 2, y * 2);
      const o = i * 4;
      if (!seen) { // fog: a haze over the unknown; a bought map shows the outline through it
        const n = ((x * 7 + y * 13) % 5) * 6;
        d[o] = 190 + n; d[o + 1] = 168 + n; d[o + 2] = 124 + n; d[o + 3] = fog === 'chart' ? (solid ? 120 : 60) : 95; continue;
      }
      if (solid) { const edge = !(sil.bits[(i - sil.w) >> 3] & (1 << ((i - sil.w) & 7))); d[o] = edge ? 40 : 82; d[o + 1] = edge ? 26 : 60; d[o + 2] = edge ? 14 : 38; d[o + 3] = edge ? 255 : 200; }
      else { d[o] = 0; d[o + 1] = 0; d[o + 2] = 0; d[o + 3] = 0; }
    }
    c.putImageData(img, 0, 0);
    miniCache[id + (fog ? 'f' : '')] = { key, cv };
    return cv;
  }
  function drawRegion(ctx, X, Y, W, H, tm) {
    const s = W2.S(), id = M.sel, r = W2.regions[id], sil = silOf(id);
    if (!r || !sil) return;
    const charted = !!s.charts[id];
    // crop the empty sky above the highest rock
    let r0 = 0;
    find: for (; r0 < sil.h; r0++) for (let x = 0; x < sil.w; x++) { const i = r0 * sil.w + x; if (sil.bits[i >> 3] & (1 << (i & 7))) break find; }
    r0 = Math.max(0, r0 - 5);
    const rows = sil.h - r0;
    const sc = Math.min(W / sil.w, H / rows), sy = Math.min(H / rows, sc * 2.4);   // heights drawn larger, as map-makers do
    const w = sil.w * sc, h = rows * sy, x0 = X + (W - w) / 2, y0 = Y + (H - h) / 2;
    ctx.fillStyle = 'rgba(120,90,50,0.08)'; ctx.fillRect(x0, y0, w, h);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(miniCv(id, sil, charted ? 'chart' : 'fog'), 0, r0, sil.w, rows, x0, y0, w, h);
    ctx.imageSmoothingEnabled = true;
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 0.6; ctx.strokeRect(x0, y0, w, h);
    const P = (tx, ty) => [x0 + tx / 2 * sc, y0 + (ty / 2 - r0) * sy];
    // places
    for (const p of (s.pts && s.pts[id]) || []) {
      const seen = W2.isSeen(id, p.x, p.y - 1);
      const [px, py] = P(p.x, p.y);
      if (p.k === 'chai' && (seen || charted)) { lampAt(ctx, px, py - 4, !!s.chai[p.id], tm); txt(ctx, t((W2.chaiDef(p.id) || {}).name || ''), px, py - 14, { size: 3.8, align: 'center', color: COL.ink }); continue; }
      if (!seen) continue;
      if (p.k === 'exit') {
        const to = p.to && W2.regions[p.to];
        ctx.fillStyle = to && !to.todo ? COL.turq : COL.inkL;
        ctx.beginPath(); ctx.moveTo(px, py - 6); ctx.lineTo(px + 3, py - 2); ctx.lineTo(px - 3, py - 2); ctx.closePath(); ctx.fill();
        if (to) txt(ctx, t(to.name), px, py - 13, { size: 3.6, align: 'center', color: to.todo ? COL.inkL : COL.ink });
      } else if (p.k === 'grate' || p.k === 'house') {
        const open = Object.keys(s.open).some(k => k.indexOf(id + ':' + (p.k === 'grate' ? 'grate:' : 'door:') + p.id) === 0);
        ctx.fillStyle = open ? COL.turq : COL.red; ctx.fillRect(px - 1.5, py - 5, 3, 4);
      } else if (p.k === 'hooktower') {
        ctx.strokeStyle = COL.inkL; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(px - 3, py - 10, 1.5, 0, 6.3); ctx.stroke();
      } else if (p.k === 'stall') {
        ctx.fillStyle = COL.gold; ctx.fillRect(px - 2, py - 3, 4, 2);
      }
    }
    for (const mid in s.marks) { const m = s.marks[mid]; if (m.region !== id) continue; const q = markPos(m); if (!q) continue; const [px, py] = P(q.tx, q.ty); markAt(ctx, px, py - 8, m.kind, tm); if (m.label) txt(ctx, t(m.label), px, py - 18, { size: 3.6, align: 'center', color: COL.red }); }
    if (id === W2.active && !W2.inside && G.world && G.world.player) { const p = G.world.player; const [px, py] = P(p.x / TS, p.y / TS); heroAt(ctx, px, py, tm); }
    if (id === W2.active && W2.inside) { const c = W2.chaiDef(W2.inside); const q = (s.pts[id] || []).find(x => x.k === 'chai' && x.id === c.id); if (q) { const [px, py] = P(q.x, q.y); heroAt(ctx, px, py - 6, tm); } }
  }

  function drawMap(ctx) {
    if (!M.open) return;
    M.t++;
    const tm = (G.time || 0), a = Math.min(1, M.t / 10);
    const s = W2.S();
    ctx.save();
    ctx.globalAlpha = 0.95 * a; ctx.fillStyle = '#07040a'; ctx.fillRect(0, 0, G.W, G.H);
    ctx.globalAlpha = a;
    const W = 440, H = 232, X = (G.W - W) / 2, Y = 20 + (1 - a) * 10;
    // rods
    for (const yy of [Y - 6, Y + H]) {
      const g = ctx.createLinearGradient(0, yy, 0, yy + 6); g.addColorStop(0, '#8a5a2a'); g.addColorStop(0.5, '#c88a4a'); g.addColorStop(1, '#5a3418');
      ctx.fillStyle = g; ctx.fillRect(X - 8, yy, W + 16, 6);
      ctx.fillStyle = '#e2b452'; ctx.beginPath(); ctx.arc(X - 9, yy + 3, 3.4, 0, 6.3); ctx.arc(X + W + 9, yy + 3, 3.4, 0, 6.3); ctx.fill();
    }
    ctx.drawImage(paper(W, H), X, Y, W, H);
    // a tile band along the top
    ctx.fillStyle = '#1d4c9a'; ctx.fillRect(X + 10, Y + 4, W - 20, 3);
    ctx.fillStyle = '#e2b452'; ctx.fillRect(X + 10, Y + 3.5, W - 20, 0.5); ctx.fillRect(X + 10, Y + 7, W - 20, 0.5);
    for (let x = X + 14; x < X + W - 12; x += 7) { ctx.fillStyle = (x / 7 | 0) & 1 ? '#8ff0e8' : '#eef3ec'; ctx.beginPath(); ctx.arc(x, Y + 5.5, 0.9, 0, 6.3); ctx.fill(); }
    // title
    const title = M.view === 'world' ? t(`The City on the Sleeper|Город на Спящем|Uxlovchi ustidagi shahar`) : t(W2.regions[M.sel].name);
    txt(ctx, title, G.W / 2, Y + 10, { size: 8.5, align: 'center', color: COL.ink });
    const hr = tf(`Day {d} · {h} · moon: {m}|День {d} · {h} · луна: {m}|{d}-kun · {h} · oy: {m}`, { d: s.day || 1, h: W2.clockText(), m: [t(`full|полная|to'lin`), t(`waning|убывает|kamaymoqda`), t(`old|старая|eski`), t(`almost new|почти новая|deyarli yangi`)][s.moon || 0] });
    txt(ctx, hr, X + W - 12, Y + 12, { size: 4.4, align: 'right', color: COL.inkL });
    if (M.view === 'world') drawWorld(ctx, X + 8, Y + 24, W - 16, H - 46, tm);
    else drawRegion(ctx, X + 14, Y + 30, W - 28, H - 58, tm);
    // legend and hints
    const hint = M.view === 'world'
      ? t(`←→↑↓ choose · Enter: open the region · M / Esc: close|←→↑↓ выбор · Enter: открыть регион · M / Esc: закрыть|←→↑↓ tanlash · Enter: hududni ochish · M / Esc: yopish`)
      : t(`Enter / Esc: back to the city|Enter / Esc: назад к городу|Enter / Esc: shaharga qaytish`);
    txt(ctx, hint + (W2.inside ? '  ·  ' + t(`T: travel to a chaikhana there|T: перейти в тамошнюю чайхану|T: u yerdagi choyxonaga o'tish`) : ''), G.W / 2, Y + H - 14, { size: 4.4, align: 'center', color: COL.inkL });
    // legend dots
    const lx = X + 14, ly = Y + H - 24;
    lampAt(ctx, lx, ly, true, tm); txt(ctx, t(`chaikhana|чайхана|choyxona`), lx + 5, ly - 2.5, { size: 3.8, color: COL.ink });
    markAt(ctx, lx + 52, ly, 'quest', tm); txt(ctx, t(`goal|цель|maqsad`), lx + 57, ly - 2.5, { size: 3.8, color: COL.ink });
    heroAt(ctx, lx + 92, ly + 3, tm); txt(ctx, t(`you|ты|sen`), lx + 97, ly - 2.5, { size: 3.8, color: COL.ink });
    if (M.msg) txt(ctx, M.msg, G.W / 2, Y + H - 34, { size: 5, align: 'center', color: COL.red });
    ctx.restore();
  }
  // drawn last (after the dialog/choice art of 98): registered at boot
  G.Events.on('boot', () => { SMOOTH_DRAW.push((ctx, st) => { try { drawMap(ctx); } catch (e) { console.error('[map]', e); } }); });
  // pause screen: the map is one key away
  SMOOTH_DRAW.push((ctx, st) => {
    const m = G.UI._debug().modal;
    if (!m || m.type !== 'pause' || m.sub || !W2.on()) return;
    FX.tt(ctx, t(`[M] Map of the city|[M] Карта города|[M] Shahar xaritasi`), 18, 214, 160, { size: 5.5, color: '#ffe7a6' });
  });
}
