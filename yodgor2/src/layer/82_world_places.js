/* =====================================================================
   Stage 4 — what stands in a region: exits (street arches, wells, ropes,
   shafts, gates), chaikhanas (rest, fast travel, the old rest features),
   houses with doors, one-way shortcuts (doors, grates), ability gates
   (Sado's light, the yodchi hook) and their alternatives, secrets
   (cracked walls, hidden caches), minibosses, stalls and named spots.
   Every kind is { place(L, def, H, region) -> {x, y, tx, ty, ...}, spawn(o, L) }.
   place() runs right after generation (may carve tiles); spawn() after
   the engine populated the level (adds Interactables / decos).
   ===================================================================== */
{
  const TS = G.TS, T = G.T, U = G.U, RD = Math.round;
  const H = W2.H;
  const pl = () => G.world && G.world.player;
  const px = (x) => RD(x);

  /* ================================================================ keys (abilities) */
  // stage 4 implements light and hook; the others are data for stage 5 (gates already read them)
  W2.key('light', { name: `Sado's light|Свет Садо|Sado nuri`, from: `The prologue: Sado wakes|Пролог: Садо просыпается|Muqaddima: Sado uyg'onadi`, opens: `Dark places, hidden writing, passages seen only in her light|Тёмные места, скрытые надписи, проходы, видимые только в её свете|Qorong'i joylar, yashirin yozuvlar, faqat uning nurida ko'rinadigan yo'llar`, alt: ['lamp'] });
  W2.key('lamp', { name: `A smuggler's lamp|Лампа контрабандиста|Kontrabandachi chirog'i`, from: `Bought at the night market|Куплена на Ночном рынке|Tungi bozordan sotib olingan`, opens: `Shows what Sado shows, more dimly|Показывает то же, что Садо, но тусклее|Sado ko'rsatganini xiraroq ko'rsatadi` });
  W2.key('hook', { name: `The yodchi hook|Крюк ёдчи|Yodchi ilmog'i`, from: `Rustam's bag|Сумка Рустама|Rustamning xaltasi`, opens: `Laundry ropes, beams and rings: a pull to the point. Pulls light enemies.|Верёвки с бельём, балки, кольца: рывок к точке. Притягивает лёгких врагов.|Kir arqonlari, to'sinlar, halqalar: nuqtaga sakrash. Yengil dushmanlarni tortadi.`, alt: [] });
  W2.key('well_sign', { name: `The Sign of the Well|Знак Колодца|Quduq belgisi`, from: `The Singers' arc, or Farrukh's forgery|Арка Певцов или подделка у Фарруха|Xonandalar yo'li yoki Farruxning qalbakisi`, opens: `Singers' doors, the archive, the upper Cloister|Двери Певцов, архив, верхняя Обитель|Xonandalar eshiklari, arxiv, yuqori xonaqoh`, alt: ['forged_sign'], todo: true });
  W2.key('divan_seal', { name: `The Seal of the Divan|Печать Дивана|Devon muhri`, from: `The Divan's arc, or a theft in the Ark|Арка Дивана или кража в Арке|Devon yo'li yoki Arkdagi o'g'rilik`, opens: `The Ark gates, warehouses, the mines|Ворота Арка, склады, шахты|Ark darvozalari, omborlar, konlar`, alt: ['stolen_seal'], todo: true });
  W2.key('water', { name: `Breath of water|Дыхание воды|Suv nafasi`, from: `Victory over Albasty|Победа над Албасты|Albastini yengish`, opens: `Dives into flooded tunnels, currents|Нырки в затопленные тоннели, течения|Suv bosgan yo'llarga sho'ng'ish, oqimlar`, todo: true });
  W2.key('voice', { name: `Turab's voice|Голос Тураба|Turobning ovozi`, from: `The auction, or a quest|Торги — или поручение|Kimoshdi savdosi yoki topshiriq`, opens: `The singing doors of the old bakhshi|«Поющие двери» старых бахши|Keksa baxshilarning «kuylovchi eshiklari»`, todo: true });
  W2.key('breath', { name: `The Sleeper's breath|Вдох Спящего|Uxlovchining nafasi`, from: `The Spine, act II|Хребет, второй акт|Umurtqa, II qism`, opens: `A double jump on the updrafts from the cracks|Двойной прыжок на потоках из трещин|Yoriqlardan chiqqan oqimlarda qo'sh sakrash`, todo: true });
  // a key (or one of its alternatives) is held
  W2.can = k => { if (!k) return true; if (W2.hasKey(k)) return true; const K = W2.keys[k]; return !!(K && K.alt && K.alt.some(a => W2.hasKey(a))); };
  W2.lightOn = () => (W2.hasKey('light') && sadoAwake()) || W2.hasKey('lamp');

  /* ================================================================ a small interactable factory */
  function obj(x, y, o) {
    if (typeof o.prompt === 'string' && o.prompt.split('|').length === 3) o = Object.assign({}, o, { prompt: t(o.prompt) });
    const it = new G.Interactable(x, y, Object.assign({ w: 22, h: 26 }, o));
    if (o.interact === false) it.interact = false;
    it.layer = o.layer != null ? o.layer : -2;
    it._w2 = o.sid || true;
    G.world.add(it);
    return it;
  }
  W2.obj = obj;
  const say = (text, col) => toast(t(text), col || '#f2e6c8');
  const line = (text) => { if (!busy) scene(done => play([['hero', text]], done)); };

  /* ================================================================ zip: the hero moved along a path (hook, ladder, rope) */
  W2.zip = (p, o) => {
    if (!p || p._zip) return false;
    const proto = Object.getPrototypeOf(p);
    p._zip = Object.assign({ i: 0, speed: 4, pts: [] }, o);
    p.cancelAct && p.cancelAct();
    p.setState('cutscene'); p.invulnT = Math.max(p.invulnT || 0, 30);
    p.update = function () {
      const z = this._zip;
      if (!z) { delete this.update; return proto.update.call(this); }
      this.t++; this.stateT++;
      if (this.invulnT > 0) this.invulnT--;
      const q = z.pts[z.i];
      const dx = q.x - this.x, dy = q.y - this.y, d = Math.hypot(dx, dy), sp = z.speed * (z.ease ? Math.min(1, 0.35 + this.stateT / 14) : 1);
      if (d <= sp) { this.x = q.x; this.y = q.y; z.i++; }
      else { this.x += dx / d * sp; this.y += dy / d * sp; if (Math.abs(dx) > 1) this.facing = Math.sign(dx); }
      this.vx = 0; this.vy = 0; this.onGround = false;
      if (z.i >= z.pts.length) {
        this._zip = null; delete this.update;
        this.setState('normal'); this.vy = z.exitVy || 0; this.vx = z.exitVx || 0; this.invulnT = Math.max(this.invulnT, 12);
        if (z.onEnd) { try { z.onEnd(this); } catch (e) { console.error(e); } }
      }
      try { this.updateScarf(); } catch (e) { /* ignore */ }
      G.Light.add(this.x, this.y - 18, 90, '#bff8ff', 0.45);
    };
    return true;
  };

  /* ================================================================ covers: tiles that are there but not painted
     A cover keeps a picture of rock/floor (copied from nearby baked tiles) over tiles that are AIR in the bake.
     After the bake the tiles are set SOLID (they block); opening sets them AIR and fades the picture. */
  function chunkAt(L, layer, x, y) { const c = L.chunks, cx = Math.floor(x / 256), cy = Math.floor(y / 256); if (!c || cx < 0 || cy < 0 || cx >= c.cw || cy >= c.ch) return null; return c[layer][cy * c.cw + cx]; }
  function copyTile(L, dst, dx, dy, tx, ty) {
    const cv = chunkAt(L, 'front', tx * TS, ty * TS);
    if (!cv) return false;
    dst.drawImage(cv, (tx * TS) % 256, (ty * TS) % 256, TS, TS, dx, dy, TS, TS);
    return true;
  }
  // find a solid tile to copy for (tx,ty): `like` = 'deep' (inside rock) or 'top' (a floor surface tile)
  function sourceTile(L, tx, ty, like, avoid) {
    for (let r = 1; r < 14; r++) for (const dx of [-r, r, 0]) for (const dy of like === 'top' ? [0] : [-r, r, 0]) {
      const x = tx + dx, y = ty + dy;
      if (!L.in(x, y) || L.get(x, y) !== T.SOLID || (avoid && avoid(x, y))) continue;
      if (like === 'top' && L.get(x, y - 1) === T.SOLID) continue;
      if (like !== 'top' && (L.get(x, y - 1) !== T.SOLID || L.get(x, y + 1) !== T.SOLID || L.get(x - 1, y) !== T.SOLID || L.get(x + 1, y) !== T.SOLID)) continue;
      return [x, y];
    }
    return null;
  }
  // tiles: [[tx,ty,like]] -> cover object {cv, x, y, tiles, a}
  function makeCover(L, tiles, sid) {
    let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
    for (const [tx, ty] of tiles) { x0 = Math.min(x0, tx); y0 = Math.min(y0, ty); x1 = Math.max(x1, tx); y1 = Math.max(y1, ty); }
    const cv = G.makeCanvas((x1 - x0 + 1) * TS, (y1 - y0 + 1) * TS), c = cv.ctx;
    const set = new Set(tiles.map(([a, b]) => a + ',' + b));
    for (const [tx, ty, like] of tiles) {
      const s = sourceTile(L, tx, ty, like, (x, y) => set.has(x + ',' + y));
      if (s) copyTile(L, c, (tx - x0) * TS, (ty - y0) * TS, s[0], s[1]);
      else { c.fillStyle = '#1a1414'; c.fillRect((tx - x0) * TS, (ty - y0) * TS, TS, TS); }
    }
    const cover = { cv, x: x0 * TS, y: y0 * TS, tiles, a: 1, sid, open: false, gx: (tiles[0][0] + 0.5) * TS, gy: (tiles[0][1] + 0.5) * TS };
    return cover;
  }
  function coverDeco(cover, extra) {
    return {
      x: cover.x + cover.cv.width / 2, y: cover.y + cover.cv.height / 2, r: Math.max(cover.cv.width, cover.cv.height), layer: 'mid',
      draw(ctx, t) {
        if (cover.a <= 0.01) return;
        ctx.globalAlpha = cover.a; ctx.drawImage(cover.cv, cover.x, cover.y); ctx.globalAlpha = 1;
        if (extra && extra.draw) extra.draw(ctx, t, cover);
      },
      fx(ctx, t) { if (extra && extra.fx) extra.fx(ctx, t, cover); },
      update() { if (cover.open && cover.a > 0) cover.a = Math.max(0, cover.a - 0.03); }
    };
  }
  function solidify(L, tiles, v) { for (const [tx, ty] of tiles) L.set(tx, ty, v == null ? T.SOLID : v); }
  W2.cover = { makeCover, coverDeco, solidify };

  /* ================================================================ art (world coordinates, pixel style) */
  const OA = G.ObjArt;
  const R = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(px(x), px(y), w, h); };
  // a street arch at the edge of a region, with a hanging sign
  OA.w2arch = (ctx, o) => {
    const x = px(o.x), y = px(o.y), f = o.flip ? -1 : 1;
    R(ctx, x - 14, y - 46, 4, 46, '#3a2618'); R(ctx, x + 10, y - 46, 4, 46, '#3a2618');
    R(ctx, x - 13, y - 46, 2, 46, '#5a3a24'); R(ctx, x + 11, y - 46, 2, 46, '#5a3a24');
    R(ctx, x - 18, y - 52, 36, 6, '#2a1a10'); R(ctx, x - 17, y - 51, 34, 2, '#7a5232');
    R(ctx, x - 6, y - 58, 12, 6, '#2a1a10'); R(ctx, x - 5, y - 57, 10, 1, '#c89a5a');
    // the sign board with an arrow
    R(ctx, x - 9, y - 44, 18, 9, '#1a1008'); R(ctx, x - 8, y - 43, 16, 7, o.closed ? '#5a3a3a' : '#a07a48');
    R(ctx, x - 5, y - 40, 10, 1, '#2a1a10'); R(ctx, x + (f > 0 ? 3 : -4), y - 42, 1, 5, '#2a1a10'); R(ctx, x + (f > 0 ? 2 : -3), y - 41, 1, 3, '#2a1a10');
    if (o.closed) { R(ctx, x - 13, y - 20, 26, 2, '#4a4a52'); R(ctx, x - 13, y - 12, 26, 2, '#4a4a52'); }
  };
  OA.w2archFx = (ctx, o) => { G.Light.add(o.x, o.y - 30, 70, o.closed ? '#a07070' : '#ffd090', 0.35); };
  // a well with a pulley
  OA.w2well = (ctx, o) => {
    const x = px(o.x), y = px(o.y);
    R(ctx, x - 13, y - 12, 26, 12, '#3a3430'); R(ctx, x - 12, y - 11, 24, 3, '#7a7068'); R(ctx, x - 12, y - 8, 24, 1, '#5a524a');
    for (let i = 0; i < 6; i++) R(ctx, x - 11 + i * 4, y - 6 + (i & 1) * 2, 3, 2, '#4a443e');
    R(ctx, x - 14, y - 36, 3, 24, '#4a3020'); R(ctx, x + 11, y - 36, 3, 24, '#4a3020');
    R(ctx, x - 16, y - 38, 32, 3, '#2a1a10'); R(ctx, x - 15, y - 38, 30, 1, '#8a6038');
    R(ctx, x - 2, y - 36, 4, 4, '#6a5038');
    const k = Math.sin((G.time || 0) * 1.3) * 1;
    R(ctx, x, y - 32, 1, 18 + k, '#8a7458'); R(ctx, x - 3, y - 14 + k, 7, 5, '#5a4030'); R(ctx, x - 3, y - 14 + k, 7, 1, '#8a6a48');
    R(ctx, x - 9, y - 12, 18, 2, '#0a0806');
  };
  // a rope down from the dark (karez shafts), with a shaft of light from above
  OA.w2rope = (ctx, o) => {
    const x = px(o.x), y = px(o.y), top = px(o.ropeTop);
    for (let yy = top; yy < y - 2; yy += 1) R(ctx, x + RD(Math.sin(yy * 0.05 + (G.time || 0)) * 0.6), yy, 1, 1, (yy & 7) === 0 ? '#c8a878' : '#8a7458');
    for (let yy = top + 10; yy < y - 6; yy += 14) R(ctx, x - 1, yy, 3, 2, '#a88a60');
    R(ctx, x - 4, y - 3, 9, 3, '#3a2a1e');
  };
  OA.w2ropeFx = (ctx, o) => {
    const day = 1 - W2.nightK();
    const col = day > 0.5 ? '#d8f0ff' : '#8aa0e0';
    G.Light.add(o.x, o.ropeTop + 30, 70, col, 0.35 + 0.25 * day);
    G.Light.add(o.x, o.y - 20, 60, col, 0.18 + 0.2 * day);
  };
  // great closed gates (Ark, the Singers' stair, the caravan road, the deeper karez)
  OA.w2gate = (ctx, o) => {
    const x = px(o.x), y = px(o.y), w = 30, h = 44, open = o.isOpen;
    R(ctx, x - w / 2 - 5, y - h - 8, w + 10, h + 8, '#1a120e');
    R(ctx, x - w / 2 - 4, y - h - 7, w + 8, 4, o.trim || '#2a6a8a'); R(ctx, x - w / 2 - 4, y - h - 3, w + 8, 1, '#e2b452');
    if (open) { R(ctx, x - w / 2, y - h, w, h, '#06040a'); R(ctx, x - w / 2, y - h, 4, h, '#5a3a22'); R(ctx, x + w / 2 - 4, y - h, 4, h, '#5a3a22'); return; }
    R(ctx, x - w / 2, y - h, w, h, '#4a2e1a'); R(ctx, x - 1, y - h, 2, h, '#20140c');
    for (let yy = y - h + 6; yy < y - 2; yy += 9) for (let xx = x - w / 2 + 3; xx < x + w / 2 - 2; xx += 6) R(ctx, xx, yy, 2, 2, '#9a8a6a');
    R(ctx, x - w / 2, y - h, w, 2, '#6a4628');
    if (o.chain) { for (let i = 0; i < 9; i++) R(ctx, x - w / 2 + 2 + i * 3, y - h / 2 + RD(Math.sin(i / 8 * Math.PI) * 4), 3, 2, '#7a7a84'); R(ctx, x - 3, y - h / 2 + 3, 6, 6, '#c8a040'); }
    if (o.seal) { R(ctx, x - 4, y - h / 2 - 4, 8, 8, o.seal); R(ctx, x - 2, y - h / 2 - 2, 4, 4, '#f2e6c8'); }
  };
  OA.w2gateFx = (ctx, o) => { G.Light.add(o.x, o.y - 30, 60, o.isOpen ? '#ffe0a0' : '#c09070', 0.3); };
  // a door in a wall (houses): plank door with a bar on one side
  OA.w2door = (ctx, o) => {
    const x = px(o.x), y = px(o.y), h = o.hh || 56;
    if (o.isOpen) { R(ctx, x - 7, y - h, 3, h, '#3a2414'); R(ctx, x - 6, y - h, 1, h, '#6a4628'); return; }
    R(ctx, x - 7, y - h, 14, h, '#3a2414');
    for (let i = 0; i < 3; i++) R(ctx, x - 6 + i * 4, y - h + 1, 3, h - 2, i & 1 ? '#5a3a22' : '#6a4426');
    R(ctx, x - 7, y - h + 10, 14, 2, '#2a1a10'); R(ctx, x - 7, y - 14, 14, 2, '#2a1a10');
    R(ctx, x + (o.barSide || 1) * 3 - 1, y - 30, 3, 3, '#a89060');
    if (o.bar) R(ctx, x - 9, y - 30, 18, 3, '#7a5a30');
  };
  // an iron grate (karez)
  OA.w2grate = (ctx, o) => {
    const x = px(o.x), y = px(o.y), h = o.hh || 64, lift = RD(o.lift || 0);
    R(ctx, x - 9, y - h - 4, 18, 4, '#2a2420');
    for (let i = 0; i < 4; i++) R(ctx, x - 7 + i * 4, y - h - lift, 2, h - 2, '#4a4e56');
    R(ctx, x - 8, y - h + 8 - lift, 16, 2, '#3a3e46'); R(ctx, x - 8, y - 14 - lift, 16, 2, '#3a3e46');
    if (!o.isOpen) R(ctx, x + (o.wheelSide || 1) * 11 - 2, y - 32, 5, 5, '#8a6a3a');
  };
  // the hook ring, on a beam or a rope
  OA.w2ring = (ctx, o) => {
    const x = px(o.x), y = px(o.y);
    if (o.beamX != null) { // a roof beam sticking out of the wall, the ring on a short rope under it
      const bx = px(o.beamX), by = y - 16;
      R(ctx, Math.min(x - 6, bx), by - 1, Math.abs(bx - x) + 8, 4, '#3a2414'); R(ctx, Math.min(x - 6, bx), by - 1, Math.abs(bx - x) + 8, 1, '#7a5232');
      R(ctx, x - 6, by + 3, 2, 2, '#2a1a10');
    }
    R(ctx, x, y - 12, 1, 8, '#a08a68');
    const hot = o.hot ? '#ffe7a6' : '#b8b8c4', dark = '#4a4a56';
    R(ctx, x - 4, y - 5, 9, 1, hot); R(ctx, x - 4, y + 4, 9, 1, dark); R(ctx, x - 5, y - 4, 1, 8, hot); R(ctx, x + 5, y - 4, 1, 8, dark);
    R(ctx, x - 4, y - 4, 1, 1, hot); R(ctx, x + 4, y + 3, 1, 1, dark);
  };
  OA.w2ringFx = (ctx, o) => { if (o.hot) G.Glow.add(o.x, o.y - 1, 12, '#ffd77a', 0.5 + 0.2 * Math.sin((G.time || 0) * 6)); };
  // a lowered ladder
  OA.w2ladder = (ctx, o) => {
    const x = px(o.x), y0 = px(o.top), y1 = px(o.isOpen ? o.y : o.top + 30);
    R(ctx, x - 6, y0, 2, y1 - y0, '#6a4a2a'); R(ctx, x + 4, y0, 2, y1 - y0, '#6a4a2a');
    for (let yy = y0 + 4; yy < y1; yy += 7) R(ctx, x - 5, yy, 10, 2, '#8a6438');
  };
  // a chaikhana door (the facade is a static picture)
  OA.w2chaiDoor = (ctx, o) => {
    const x = px(o.x), y = px(o.y);
    R(ctx, x - 9, y - 34, 18, 34, '#140c08'); R(ctx, x - 8, y - 33, 16, 33, '#5a3418');
    R(ctx, x - 8, y - 33, 16, 3, '#2a1a10'); R(ctx, x - 1, y - 30, 2, 30, '#2a1a10');
    for (let k = 0; k < 4; k++) { R(ctx, x - 6, y - 26 + k * 7, 4, 4, '#7a4a24'); R(ctx, x + 2, y - 26 + k * 7, 4, 4, '#7a4a24'); }
    R(ctx, x - 3, y - 15, 2, 2, '#e2b452'); R(ctx, x + 1, y - 15, 2, 2, '#e2b452');
  };
  OA.w2chaiDoorFx = (ctx, o) => {
    const k = 0.85 + 0.15 * U.noise1((G.time || 0) * 5 + o.x, 3);
    G.Light.add(o.x, o.y - 20, 90, '#ffb060', 0.6 * k); G.Glow.add(o.x, o.y - 40, 16, '#ffcf7a', 0.35 * k);
  };
  // a key item lying somewhere (the hook in Rustam's bag, a lamp)
  OA.w2bag = (ctx, o) => {
    const x = px(o.x), y = px(o.y);
    R(ctx, x - 6, y - 8, 12, 8, '#5a3a22'); R(ctx, x - 5, y - 9, 10, 2, '#7a5232'); R(ctx, x - 1, y - 11, 2, 3, '#3a2414');
    R(ctx, x + 3, y - 6, 3, 3, '#9a9aa8');
  };
  OA.w2bagFx = (ctx, o) => G.Glow.add(o.x, o.y - 6, 12, '#ffe7a6', 0.3 + 0.2 * Math.sin((G.time || 0) * 4));

  /* ================================================================ exits */
  const entryAt = (L, tx, face, fromY) => { const gy = fromY != null ? H.ground(L, tx, fromY) : H.topGround(L, tx); return { x: tx * TS + TS / 2, y: (gy || L.h - 2) * TS, face }; };
  // where an exit leads: [region, entry] or null (closed for now)
  // ex.when(): stage 5's story lock — a three-language reason while the way is shut, or null when open
  const shutWhy = ex => { try { return ex.when ? ex.when() : null; } catch (e) { console.error('[world] when', e); return null; } };
  W2.shutWhy = shutWhy;
  const target = ex => (ex.to && W2.regions[ex.to[0]] && !W2.regions[ex.to[0]].todo && !shutWhy(ex) ? ex.to : null);
  W2.exitTarget = target;
  function useExit(o, it) {
    const ex = o.ex, tg = target(ex);
    const why = shutWhy(ex);
    if (why) { line(why); sfx('denied'); return true; }
    if (ex.key && !W2.can(ex.key)) {
      const K = W2.keys[ex.key];
      say(ex.locked || tf(`Closed. You need: {k}.|Закрыто. Нужно: {k}.|Yopiq. Kerak: {k}.`, { k: t(K ? K.name : ex.key) }), '#d9a0a0');
      sfx('denied');
      return true;
    }
    if (!tg) { if (ex.closed) line(ex.closed); else say(`The way is closed for now.|Путь пока закрыт.|Yo'l hozircha yopiq.`, '#d9a0a0'); return true; }
    W2.go(tg[0], tg[1], { sfx: ex.sfx });
    return true;
  }
  const toLabel = ex => { const tg = target(ex); const r = tg && W2.regions[tg[0]]; return ex.label ? t(ex.label) : (r ? tf(`To: {r}|Путь: {r}|Yo'l: {r}`, { r: t(r.name) }) : `A closed way|Закрытый путь|Yopiq yo'l`); };
  W2.kind('exit_street', {
    place(L, ex) {
      if (ex.at === 'left') { const tx = 3; const e = entryAt(L, 7, 1); return { tx, ty: e.y / TS - 1, x: tx * TS + 8, y: e.y, entry: e, side: -1 }; }
      if (ex.at === 'right') { const tx = L.w - 4; const e = entryAt(L, L.w - 8, -1); return { tx, ty: e.y / TS - 1, x: tx * TS + 8, y: e.y, entry: e, side: 1 }; }
      return null;
    },
    spawn(o) {
      const tg = target(o.ex);
      const it = obj(o.x, o.y, { art: 'w2arch', w: 30, h: 50, flip: o.side < 0, closed: !tg, prompt: toLabel(o.ex), onUse: () => useExit(o) });
      it.upd = self => { // walking through the arch leaves the region
        const p = pl(); if (!p || W2.busy || !target(o.ex) || p.state === 'door' || busy) return;
        if ((o.side < 0 && p.x < self.x - 2) || (o.side > 0 && p.x > self.x + 2)) useExit(o, self);
      };
    }
  });
  // a well or a drain on the street: down into the karez
  W2.kind('exit_well', {
    place(L, ex, H2) {
      if (ex.inHouse) return null; // placed by its house
      const r = H.site(L, ex.at.frac, { need: 6, head: 4 });
      if (!r) return null;
      const tx = r.tx + 3;
      return { tx, ty: r.ty, x: tx * TS, y: r.y, entry: { x: (tx + 2) * TS, y: r.y, face: -1 } };
    },
    spawn(o) {
      obj(o.x, o.y, { art: o.ex.art || 'w2well', w: 26, h: 30, prompt: o.ex.prompt || `Climb down the well|Спуститься в колодец|Quduqqa tushish`, onUse: () => useExit(o) });
    }
  });
  // a rope hanging from a shaft (karez -> up)
  W2.kind('exit_shaft', {
    place(L, ex) {
      // a room by fraction of the room list (room grid) or a floor spot by fraction
      const rooms = (L.rooms || []).filter(r => r.kind !== 'side' || ex.side);
      let tx, ty, gy;
      if (rooms.length) {
        const list = rooms.slice().sort((a, b) => a.ox - b.ox || a.oy - b.oy);
        const rm = ex.room != null ? (typeof ex.room === 'function' ? ex.room(list, L) : list[Math.min(list.length - 1, ex.room)]) : list[Math.min(list.length - 1, Math.floor(ex.at.frac * list.length))];
        if (!rm) return null;
        tx = rm.ox + Math.floor(rm.w * (ex.dx != null ? ex.dx : 0.5));
        gy = H.ground(L, tx, rm.oy + 1);
        if (!gy) { for (let d = 1; d < 8 && !gy; d++) { gy = H.ground(L, tx + d, rm.oy + 1); if (gy) tx += d; } }
        if (!gy) return null;
        // open the ceiling above the rope up to the top of the level (a shaft)
        let top = gy - 2; while (top > 0 && L.get(tx, top) === T.AIR) top--;
        // a shaft up through the rock, stopping short of any other room
        let y = top;
        for (; y >= 0; y--) {
          if (L.get(tx, y) !== T.SOLID || L.get(tx + 1, y) !== T.SOLID) break;
          if (y > 1 && (L.get(tx, y - 2) !== T.SOLID || L.get(tx + 1, y - 2) !== T.SOLID)) break;
          L.set(tx, y, T.AIR); L.set(tx + 1, y, T.AIR); L.back[L.idx(tx, y)] = 1; L.back[L.idx(tx + 1, y)] = 1;
        }
        ty = gy - 1;
        return { tx, ty, x: tx * TS + TS, y: gy * TS, top: Math.max(0, y + 1) * TS, entry: { x: (tx + 3) * TS, y: gy * TS, face: 1 } };
      }
      return null;
    },
    spawn(o) {
      obj(o.x, o.y, { art: 'w2rope', w: 16, h: 40, ropeTop: o.top, prompt: toLabel(o.ex), onUse: () => useExit(o) });
    }
  });
  // a great gate somewhere along the street (to the Ark, the Singers' stair, the Rabat road)
  W2.kind('exit_gate', {
    place(L, ex) {
      if (ex.onTower) return null; // placed by its tower
      if (!L.isOpen && L.rooms && L.rooms.length) {
        const list = L.rooms.slice().sort((a, b) => a.ox - b.ox || a.oy - b.oy);
        const rm = typeof ex.room === 'function' ? ex.room(list, L) : list[Math.floor((ex.at ? ex.at.frac : 0.5) * list.length)];
        if (!rm) return null;
        const tx = rm.ox + Math.floor(rm.w / 2), gy = H.ground(L, tx, rm.oy + 1);
        if (!gy) return null;
        return { tx, ty: gy - 1, x: tx * TS + 8, y: gy * TS, entry: { x: (tx - 3) * TS, y: gy * TS, face: -1 } };
      }
      const r = H.site(L, ex.at.frac, { need: 6, head: 5 });
      if (!r) return null;
      const tx = r.tx + 3;
      return { tx, ty: r.ty, x: tx * TS, y: r.y, entry: { x: (tx - 3) * TS, y: r.y, face: -1 } };
    },
    spawn(o) {
      const ex = o.ex;
      obj(o.x, o.y, { art: 'w2gate', w: 34, h: 50, chain: ex.chain, seal: ex.seal, trim: ex.trim, isOpen: !!target(ex) && W2.can(ex.key), prompt: toLabel(ex), onUse: () => useExit(o) });
    }
  });

  /* ================================================================ chaikhanas */
  // a chaikhana is an object of a region: {kind:'chai', id, name, look, at:{frac}}; inside is the engine's rest room
  W2.chaiDef = id => {
    for (const rid in W2.regions) for (const od of W2.regions[rid].objects) if (od.kind === 'chai' && od.id === id) return Object.assign({ region: rid }, od);
    return null;
  };
  W2.chaiList = () => { const out = []; for (const rid in W2.regions) for (const od of W2.regions[rid].objects) if (od.kind === 'chai') out.push(Object.assign({ region: rid }, od)); return out; };
  // the facade: mud-brick, a carved door, an awning on turquoise posts, a tapchan with a carpet, lanterns
  function facadeCv(o) {
    const w = 168, h = 104, cv = G.makeCanvas(w, h), c = cv.ctx;
    const r = (x, y, ww, hh, col) => { c.fillStyle = col; c.fillRect(x, y, ww, hh); };
    const rng = U.RNG(o.seed || 7);
    const wall = o.wall || '#a8825a', wallD = o.wallD || '#7a5a3c', wallL = o.wallL || '#c8a274';
    r(14, 30, 140, 74, wallD); r(16, 32, 136, 72, wall);
    for (let y = 34; y < 104; y += 5) for (let x = 16 + ((y / 5) & 1) * 6; x < 150; x += 12) r(x, y, 11, 1, wallD);
    for (let i = 0; i < 40; i++) r(rng.int(16, 148), rng.int(34, 100), rng.int(1, 3), 1, wallL);
    // flat roof with poles and a parapet
    r(8, 24, 152, 7, '#4a3220'); r(8, 24, 152, 2, '#8a6038'); for (let x = 12; x < 158; x += 9) r(x, 30, 3, 3, '#3a2414');
    // two lattice windows with warm light
    for (const wx of [30, 118]) { r(wx, 44, 20, 22, '#2a1a10'); r(wx + 1, 45, 18, 20, '#ffb860'); for (let k = 0; k < 18; k += 4) { r(wx + 1 + k, 45, 1, 20, '#5a3418'); r(wx + 1, 45 + k, 18, 1, '#5a3418'); } r(wx - 2, 42, 24, 3, '#6a4426'); }
    // the door niche (the door is an Interactable drawn on top)
    r(70, 54, 28, 50, '#2a1a10'); r(72, 50, 24, 6, '#2a6a8a'); for (let x = 72; x < 96; x += 4) r(x + 1, 52, 2, 2, '#e2b452');
    r(66, 48, 36, 3, '#e2b452');
    // awning on turquoise posts
    r(0, 38, 168, 5, '#5a3a22'); r(0, 38, 168, 1, '#9a6a3a');
    for (const x of [4, 52, 112, 160]) { r(x, 43, 4, 61, '#2a8a9a'); r(x + 1, 43, 1, 61, '#6ad0d8'); r(x - 1, 43, 6, 3, '#e2b452'); }
    // the tapchan with a red carpet and cushions
    r(4, 86, 54, 4, '#5a3418'); r(6, 90, 3, 14, '#3a2414'); r(52, 90, 3, 14, '#3a2414');
    r(6, 82, 50, 5, '#a8323a'); for (let x = 8; x < 54; x += 6) r(x, 83, 3, 2, '#e2b452');
    r(10, 78, 9, 5, '#2a5a9a'); r(40, 78, 9, 5, '#c89a3a');
    r(26, 76, 12, 3, '#d8c8a0'); r(29, 73, 6, 3, '#c8b88a'); // a low table with a teapot
    r(30, 70, 4, 3, '#2a8a9a');
    // the sign: a painted board
    r(54, 10, 60, 14, '#1a1008'); r(56, 12, 56, 10, '#2a6a8a'); for (let x = 58; x < 110; x += 5) r(x, 16, 3, 2, '#e2b452');
    return cv;
  }
  W2.facadeCv = facadeCv;
  W2.kind('chai', {
    place(L, od) {
      const r = L.isOpen ? H.site(L, od.at.frac, { need: 12, head: 8 }) : (H.runNear(L, od.at.frac, { need: 11, head: 7, ground: false }) || H.roomSite(L, od.at.frac, 12, 7));
      if (!r) return null;
      const x0 = r.tx * TS - 4, y = r.y;
      const cv = facadeCv(od);
      L.decos.push({ static: true, layer: 'back', bx: x0, by: y - cv.height, bw: cv.width, bh: cv.height, draw(ctx) { ctx.drawImage(cv, x0, y - cv.height); } });
      for (const lx of [x0 + 26, x0 + 142]) L.decos.push(G.BiomeKit.lantern(lx, y - 62, { color: '#c8302a', len: 4, lightR: 70 }));
      L.decos.push(W2.nightLight(x0 + 40, y - 48, { r: 46, a: 0.8, day: 0.4 }), W2.nightLight(x0 + 128, y - 48, { r: 46, a: 0.8, day: 0.4 }));
      const dx = x0 + 84;
      return { tx: Math.floor(dx / TS), ty: r.ty, x: dx, y, entry: { x: dx + 26, y, face: -1 } };
    },
    spawn(o) {
      obj(o.x, o.y, { art: 'w2chaiDoor', w: 18, h: 34, prompt: tf(`Enter: {n}|Войти: {n}|Kirish: {n}`, { n: t(o.od.name) }), onUse: () => { W2.go(W2.active, 'chai:' + o.od.id, { inside: o.od.id, sfx: 'door' }); return true; } });
      // steam over the facade
      if (G.level) G.level.dynDecos.push({ x: o.x - 54, y: o.y - 30, r: 40, layer: 'back', draw() {}, update(d) { if (Math.random() < 0.05 && G.onScreen(d.x, d.y, 30)) G.FX.spawn({ x: d.x + U.rand(-2, 2), y: d.y, vx: U.rand(-0.1, 0.2), vy: -U.rand(0.2, 0.4), life: 120, size: 2, size1: 6, shape: 'circle', color: '#e8e0d8', alpha: 0.25, drag: 0.99 }); } });
    }
  });
  // inside: the samovar becomes the dastarkhan (rest, travel, save), Rustam can speak, the shaman sings once per moon
  ON_STAGE.push((plan) => {
    if (!plan || !plan.world || plan.type !== 'rest' || !W2.S()) return;
    const ch = W2.chaiDef(plan.chai);
    if (!ch) return;
    const w = G.world;
    const sam = w.interactables.find(o => o.art === 'samovar');
    if (sam) { sam.prompt = t(`Sit at the dastarkhan (rest, travel)|Сесть за дастархан (отдых, путь)|Dasturxonga o'tirish (dam, yo'l)`); sam.onUse = () => { if (!busy) W2.dastarkhan(); return true; }; }
    const ak = w.interactables.find(o => o.art === 'aksakal');
    if (ak) {
      const host = ch.host || {};
      ak.prompt = t(host.prompt || `Sit with the host|Сесть рядом с хозяином|Mezbon yoniga o'tirish`);
      ak.onUse = () => { if (busy) return true; scene(done => (host.talk ? host.talk(done) : play([['rustam', `The tea is hot. The road will wait.|Чай горячий. Дорога подождёт.|Choy issiq. Yo'l kutib turadi.`]], done))); return true; };
    }
    const sh = w.interactables.find(o => o.art === 'shaman');
    const s = W2.S(), pk = ch.id + ':' + (s.moon || 0);
    if (sh && s.perk[pk]) { sh.usedUp = true; sh.interact = false; }
    if (sh) { const u0 = sh.onUse; sh.onUse = function () { const r = u0.apply(this, arguments); setTimeout(() => { if (sh.usedUp) { s.perk[pk] = 1; save(); } }, 400); return r; }; }
    // the rugs keep their goods for the day (no new stock by walking out and in again); what was bought stays gone
    try {
      s.stock = s.stock || {};
      const rugs = w.interactables.filter(o => o.art === 'shopRug').sort((a, b) => a.x - b.x);
      const st = s.stock[ch.id];
      if (st && st.day === s.day) {
        rugs.forEach((o, i) => {
          const e = st.items[i]; if (!e) return;
          if (e.sold) { o.dead = true; return; }
          if (e.food) { o.item = null; o.food = true; o.price = e.price; o.prompt = `Купить плов — ${o.price} тилла`; return; }
          const it = G.Items.create(e.id, 0); if (!it) return;
          it.q = e.q || 0; it.up = 0; it.mods = []; it.n = e.n || 1;
          const dd = it.def; Object.defineProperty(it, 'name', { configurable: true, get() { return LANG.T(dd.name) + (this.n > 1 ? ' ×' + this.n : ''); } });
          o.item = it; o.food = false; o.price = e.price; o.prompt = `Купить «${it.name}» — ${o.price} тилла`;
        });
      } else s.stock[ch.id] = { day: s.day, items: rugs.map(o => (o.item ? { id: o.item.id, q: o.item.q || 0, n: o.item.n || 1, price: o.price } : { food: true, price: o.price })) };
      rugs.forEach((o, i) => { const u0 = o.onUse; o.onUse = function () { const r = u0.apply(this, arguments); if (o.dead && s.stock[ch.id].items[i]) { s.stock[ch.id].items[i].sold = 1; save(); } return r; }; });
    } catch (e) { console.error('[world] stock', e); }
    for (const f of W2.hooks.chai || []) { try { f(ch, plan); } catch (e) { console.error(e); } }
  });
  W2.hooks.chai = [];
  W2.restOpts = W2.restOpts || [];
  W2.dastarkhan = () => {
    const s = W2.S(), ch = W2.chaiDef(W2.inside);
    if (!s || !ch) return;
    const others = W2.chaiList().filter(c => c.id !== ch.id && s.chai[c.id]);
    const opts = [
      { label: t(`Sleep until morning|Спать до утра|Tonggacha uxlash`), value: 'morning' },
      { label: t(`Sleep until night|Спать до ночи|Tungacha uxlash`), value: 'night' },
      { label: t(`Drink tea and go on (an hour)|Выпить чаю и идти дальше (час)|Choy ichib yo'lda davom etish (bir soat)`), value: 'tea' },
      { label: others.length ? t(`Travel to another chaikhana…|Перейти в другую чайхану…|Boshqa choyxonaga o'tish…`) : t(`Travel: no other chaikhana found yet|Перейти некуда: других чайхан ты ещё не нашёл|Yo'l: boshqa choyxona hali topilmagan`), value: others.length ? 'travel' : 'none', color: others.length ? undefined : '#7a7080' },
      { label: t(`Save the journey|Сохранить поход|Safarni saqlash`), value: 'save' },
      { label: t(`Get up|Встать|Turish`), value: null, color: '#9a8a78' }
    ];
    // extra rows from later files (the companions' talks by the fire): W2.restOpts = [() => ({label, value:'x:…', run()})]
    const ext = [];
    for (const f of W2.restOpts || []) { try { const o = f(ch); if (o) { ext.push(o); opts.splice(opts.length - 2, 0, { label: o.label, value: 'x:' + (ext.length - 1) }); } } catch (e) { console.error(e); } }
    G.UI.choice({
      title: tf(`{c} · {h}|{c} · {h}|{c} · {h}`, { c: t(ch.name), h: W2.clockText() }), cancel: true, options: opts,
      onPick: v => {
        if (!v) return;
        if (v === 'none') { setTimeout(W2.dastarkhan, 60); return; }
        if (typeof v === 'string' && v.indexOf('x:') === 0) { const o = ext[+v.slice(2)]; if (o) setTimeout(o.run, 60); return; }
        if (v === 'save') { W2.rest('tea', true); setTimeout(() => G.SAVE_MENU && G.SAVE_MENU(), 80); return; }
        if (v === 'travel') { setTimeout(W2.travelMenu, 60); return; }
        W2.rest(v);
      }
    });
  };
  // rest: health and water back, enemies return, the bench moves here, time moves, the journey is saved
  W2.rest = (how, quiet) => {
    const s = W2.S(), ch = W2.chaiDef(W2.inside), p = pl();
    if (!s || !ch) return;
    if (p) { p.heal(p.maxHp); p.recov = 0; }
    if (G.run) G.run.flasks = G.run.maxFlasks;
    try { if (G.CH && G.CH.syncHp) G.CH.syncHp(); } catch (e) { /* ignore */ }
    W2.respawnAll();
    s.bench = { region: ch.region, chai: ch.id };
    if (how === 'morning' || how === 'night') { W2.skipTo(how); G.FX.flash('#000000', 0.9); }
    else W2.addTime(60);
    s.cur = { region: ch.region, entry: 'chai:' + ch.id, inside: ch.id };
    save();
    for (const f of W2.hooks.rest) { try { f(ch, how); } catch (e) { console.error(e); } }
    try { checkpoint(); } catch (e) { console.error(e); }
    sfx('heal');
    if (!quiet) toast(how === 'morning' ? t(`You slept until morning. The city is the same; the streets are full again.|Ты проспал до утра. Город тот же, улицы снова полны.|Tonggacha uxlading. Shahar o'sha, ko'chalar yana to'la.`)
      : how === 'night' ? t(`You slept until night. The lamps are lit.|Ты проспал до ночи. Горят фонари.|Tungacha uxlading. Chiroqlar yongan.`)
        : t(`Strength restored, the flask is full. The journey is saved.|Силы вернулись, фляга полна. Поход сохранён.|Kuching qaytdi, idishing to'la. Safar saqlandi.`), '#7dff9a');
  };
  W2.travelMenu = () => {
    const s = W2.S(); if (!s) return;
    const list = W2.chaiList().filter(c => c.id !== W2.inside && s.chai[c.id]);
    G.UI.choice({
      title: t(`Where to?|Куда?|Qayerga?`), cancel: true,
      options: list.map(c => ({ label: t(c.name) + ' · ' + t(W2.regions[c.region].name), value: c.id })).concat([{ label: t(`Back|Назад|Orqaga`), value: null, color: '#9a8a78' }]),
      onPick: id => { if (!id) { setTimeout(W2.dastarkhan, 60); return; } W2.travel(id); }
    });
  };
  W2.travel = id => {
    const s = W2.S(), c = W2.chaiDef(id);
    if (!s || !c || !s.chai[id] || !W2.inside) return false;   // free travel, only from a chaikhana
    W2.addTime(30 * 60 / 60 * 1);  // half an hour on the road
    return W2.go(c.region, 'chai:' + id, { inside: id, sfx: 'door', speed: 0.025 });
  };

  /* ================================================================ houses: walls, a roof, doors (shortcuts live here) */
  // {kind:'house', id, at:{frac}, w, h, doors:{w:'open'|'shortcut'|'locked'|'crack'|'wall', e:...}, inside:[{kind,...}]}
  W2.kind('house', {
    place(L, od, H2, def) {
      const w = od.w || 14, h = od.h || 6;
      const r = H.site(L, od.at.frac, { need: w + 6, head: h + 3, fallback: false });
      if (!r) return null;
      const x0 = r.tx + 3, x1 = x0 + w - 1, fy = r.ty;     // fy: the floor's air row
      // steps of crates against the closed walls, so the roof can be climbed
      for (const side of ['w', 'e']) if (((od.doors || {})[side] || 'wall') !== 'open') { const sx = side === 'w' ? x0 - 5 : x1 + 4; H.fill(L, sx, fy - 1, sx + 1, fy, T.SOLID); }
      const top = fy - h;
      // walls (2 thick), roof (2 thick), back wall inside
      H.fill(L, x0 - 1, top - 1, x1 + 1, top, T.SOLID);
      H.fill(L, x0 - 1, top, x0, fy, T.SOLID); H.fill(L, x1, top, x1 + 1, fy, T.SOLID);
      H.back(L, x0 + 1, top + 1, x1 - 1, fy, 1);
      const doors = od.doors || {};
      const out = { tx: x0, ty: fy, x: (x0 + x1 + 1) / 2 * TS, y: (fy + 1) * TS, house: { x0, x1, top, fy }, doors: [] };
      for (const side of ['w', 'e']) {
        const k = doors[side] || 'wall';
        if (k === 'wall') continue;
        const dx0 = side === 'w' ? x0 - 1 : x1, dx1 = dx0 + 1;
        const tiles = [];
        for (let y = fy - 3; y <= fy; y++) for (let x = dx0; x <= dx1; x++) { L.set(x, y, T.AIR); tiles.push([x, y]); }
        out.doors.push({ side, kind: k, tiles, x: (dx0 + 1) * TS, y: (fy + 1) * TS });
      }
      H.struct(L, { kind: 'building', x0: x0 - 1, x1: x1 + 1, floorY: fy + 1, roofY: top - 1, w2: true, interior: { x0: x0 + 1, x1: x1 - 1, y0: top + 1, y1: fy } }, x0 - 2, top - 1, x1 + 2, fy);
      H.reserve(L, x0 - 3, x1 + 3);
      // inside objects (a well, a chest...) are placed now and get their own ids
      out.inside = [];
      for (const io of od.inside || []) {
        const tx = x0 + Math.round((x1 - x0) * (io.dx != null ? io.dx : 0.5));
        out.inside.push(Object.assign({}, io, { tx, x: tx * TS + TS / 2, y: (fy + 1) * TS }));
      }
      // closed doors block after the bake (the bake painted the opening)
      H.afterBake(L, () => { for (const d of out.doors) if (d.kind !== 'open' && !W2.isOpen(def.id + ':door:' + od.id + ':' + d.side)) solidify(L, d.tiles); });
      for (const io of out.inside) if (io.kind === 'exit_well') { const ex = def.exits[io.exit]; if (ex) { L.w2.entries[io.exit] = { x: io.x + 26, y: io.y, face: -1 }; L.w2.objs.push({ type: 'exit', ex: Object.assign({ id: io.exit }, ex), x: io.x, y: io.y, tx: io.tx, ty: fy, sid: def.id + ':exit:' + io.exit }); } }
      return out;
    },
    spawn(o, L) {
      const def = W2.regions[W2.active], hs = o.house;
      for (const d of o.doors) {
        const id = def.id + ':door:' + o.od.id + ':' + d.side;
        if (d.kind === 'open') continue;
        if (d.kind === 'crack') { crackWall(L, d.tiles, id); continue; }
        const inward = d.side === 'w' ? 1 : -1;   // the side from which a shortcut opens: inside the house
        const it = obj(d.x, d.y, { art: 'w2door', w: 18, h: 56, hh: 64, isOpen: W2.isOpen(id), bar: d.kind === 'shortcut', barSide: inward, sid: id });
        it.layer = -1;
        const fromInside = () => { const p = pl(); return p && (p.x - d.x) * inward > 0; };
        it.prompt = d.kind === 'shortcut' ? t(`Lift the bar|Снять засов|Zulfinni olish`) : t(`A locked door|Запертая дверь|Qulflangan eshik`);
        it.canUse = () => !it.isOpen;
        it.onUse = () => {
          if (it.isOpen) return true;
          if (d.kind === 'shortcut' && fromInside()) { openTiles(L, d.tiles); it.isOpen = true; it.interact = false; W2.setOpen(id); sfx('door'); G.shake(0.2); say(`A way back is open.|Путь назад открыт.|Qaytish yo'li ochildi.`, '#ffe7a6'); W2.stats.shortcuts = (W2.stats.shortcuts || 0) + 1; return true; }
          if (d.kind === 'shortcut') { say(o.od.barred || `Barred from the other side.|Заперто с другой стороны.|Narigi tomondan zulfinlangan.`, '#d9a0a0'); sfx('denied'); return true; }
          if (o.od.key && W2.can(o.od.key)) { openTiles(L, d.tiles); it.isOpen = true; it.interact = false; W2.setOpen(id); sfx('door'); return true; }
          say(o.od.locked || `Locked.|Заперто.|Qulflangan.`, '#d9a0a0'); sfx('denied'); return true;
        };
        if (it.isOpen) it.interact = false;
      }
      for (const io of o.inside || []) {
        const K = W2.kinds[io.kind];
        if (io.kind === 'exit_well') { const ex = def.exits[io.exit]; obj(io.x, io.y, { art: 'w2well', w: 26, h: 30, prompt: ex.prompt || `Climb down the well|Спуститься в колодец|Quduqqa tushish`, onUse: () => useExit({ ex: Object.assign({ id: io.exit }, ex) }) }); continue; }
        if (K && K.spawnAt) K.spawnAt(io, L, def.id + ':' + io.kind + ':' + o.od.id);
      }
    }
  });
  function openTiles(L, tiles) { solidify(L, tiles, T.AIR); }
  W2.openTiles = openTiles;

  /* ================================================================ one-way grate (rooms of the karez) */
  // {kind:'grate', id, between:[colA, colB] | at:{frac}, from:'e'|'w'} — a grate in the passage between two rooms
  W2.kind('grate', {
    place(L, od, H2, def) {
      const rooms = L.rooms || [];
      if (!rooms.length) return null;
      // the boundary between room columns c and c+1 crossed by the path; extra crossings are walled up
      const cols = Math.max(...rooms.map(r => r.c)) + 1, c = Math.max(0, Math.min(cols - 2, Math.round(od.at.frac * (cols - 1)) - 1));
      const crossing = rooms.filter(r => r.c === c && r.R);
      if (!crossing.length) return null;
      const main = crossing.find(r => r.path && r.kind !== 'side') || crossing[0];
      for (const r of crossing) if (r !== main) { const bx = r.ox + r.w - 1; for (let y = r.oy; y < r.oy + r.h; y++) { L.set(bx, y, T.SOLID); L.set(bx + 1, y, T.SOLID); } }
      const bx = main.ox + main.w - 1, tiles = [];
      // the opening: air tiles in the boundary columns
      let y0 = 99, y1 = -1;
      for (let y = main.oy; y < main.oy + main.h; y++) if (L.get(bx, y) === T.AIR || L.get(bx + 1, y) === T.AIR) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      if (y1 < 0) return null;
      // a single tall passage: make it exactly the floor opening, close the rest
      const fy = main.fy;
      for (let y = main.oy; y < main.oy + main.h; y++) if (y < fy - 4 || y > fy) { L.set(bx, y, T.SOLID); L.set(bx + 1, y, T.SOLID); }
      for (let y = fy - 4; y <= fy - 1; y++) { L.set(bx, y, T.AIR); L.set(bx + 1, y, T.AIR); L.back[L.idx(bx, y)] = 1; L.back[L.idx(bx + 1, y)] = 1; tiles.push([bx, y], [bx + 1, y]); }
      L.set(bx, fy, T.SOLID); L.set(bx + 1, fy, T.SOLID);
      const id = def.id + ':grate:' + od.id;
      H.afterBake(L, () => { if (!W2.isOpen(id)) solidify(L, tiles); });
      return { tx: bx, ty: fy - 1, x: (bx + 1) * TS, y: fy * TS, tiles, gid: id };
    },
    spawn(o, L) {
      const id = o.gid, from = o.od.from === 'w' ? -1 : 1;   // the side it can be opened from
      const it = obj(o.x, o.y, { art: 'w2grate', w: 20, h: 64, hh: 64, isOpen: W2.isOpen(id), wheelSide: from, sid: id, lift: W2.isOpen(id) ? 58 : 0 });
      it.layer = -1;
      it.prompt = t(`Turn the wheel|Повернуть ворот|G'ildirakni burash`);
      it.canUse = () => !it.isOpen;
      it.onUse = () => {
        const p = pl();
        if (it.isOpen) return true;
        if (p && (p.x - o.x) * from > 0) {
          it.isOpen = true; it.interact = false; W2.setOpen(id); sfx('door'); G.shake(0.25);
          it.upd = self => { if (self.lift < 58) { self.lift += 1.2; } else if (!self._done) { self._done = 1; openTiles(L, o.tiles); } };
          say(`The grate rises. A way back is open.|Решётка поднимается. Путь назад открыт.|Panjara ko'tarildi. Qaytish yo'li ochildi.`, '#ffe7a6');
          W2.stats.shortcuts = (W2.stats.shortcuts || 0) + 1;
        } else { say(o.od.barred || `The wheel is on the other side of the grate.|Ворот — по ту сторону решётки.|G'ildirak panjaraning narigi tomonida.`, '#d9a0a0'); sfx('denied'); }
        return true;
      };
      if (it.isOpen) it.interact = false;
    }
  });

  /* ================================================================ ability gate: the hook (a tower with a flat roof, a ring above) */
  // {kind:'hooktower', id, at:{frac}, h:11, w:5, top:[{kind:'cache'|'exit', ...}], ring:{dx, dy}}
  W2.kind('hooktower', {
    place(L, od, H2, def) {
      const w = od.w || 5, h = od.h || 11;
      const ok = r => {
        // nothing within reach that one could jump from onto the roof
        for (let x = r.tx - 4; x <= r.tx + w + 12; x++) {
          if (x >= r.tx + 4 && x < r.tx + 4 + w) continue;
          if (H.topSolid(L, x) < r.ty + 1 - h + 8) return false;
        }
        return true;
      };
      const r = H.site(L, od.at.frac, { need: w + 14, head: h + 8, pad: 0, test: ok, fallback: false });
      if (!r) return null;
      const x0 = r.tx + 4, x1 = x0 + w - 1, fy = r.ty, roof = fy - h + 1;
      // no floating beam near it may serve as a step up
      for (let x = r.tx - 12; x <= r.tx + w + 18; x++) for (let y = Math.max(0, roof - 4); y <= fy; y++) if (L.get(x, y) === T.PLAT) L.set(x, y, T.AIR);
      H.fill(L, x0, roof, x1, fy, T.SOLID);
      // a gatehouse: the street passes through an arch at its foot (only the roof needs the hook)
      H.fill(L, x0, fy - 3, x1, fy, T.AIR); H.back(L, x0, fy - 3, x1, fy, 1);
      // a little parapet so the roof reads as a roof
      L.set(x0, roof - 1, T.SOLID); L.set(x1, roof - 1, T.SOLID);
      const ring = { x: (x0 - 2) * TS + 8, y: (roof + 1) * TS };
      const top = { x: (x0 + x1 + 1) / 2 * TS, y: roof * TS };
      H.struct(L, { kind: 'tower', x0, x1, floorY: fy + 1, roofY: roof, w2: true }, x0 - 1, roof, x1 + 1, fy);
      for (const tp of od.top || []) if (tp.kind === 'exit') L.w2.entries[tp.exit] = { x: top.x - 8, y: top.y, face: -1 };
      return { tx: x0, ty: fy, x: top.x, y: top.y, ring, roof: { x0, x1, y: roof }, gid: def.id + ':hook:' + od.id };
    },
    spawn(o, L) {
      W2.ring(o.ring.x, o.ring.y, { land: { x: o.x - 4, y: o.y }, gid: o.gid, beamX: o.roof.x0 * TS });
      const def = W2.regions[W2.active];
      for (const tp of o.od.top || []) {
        if (tp.kind === 'cache') W2.kinds.cache.spawnAt({ x: o.x + (tp.dx || 0) * TS, y: o.y, loot: tp.loot }, L, o.gid + ':cache');
        if (tp.kind === 'exit') { const ex = def.exits[tp.exit]; if (ex) { obj(o.x + 12, o.y, { art: 'w2gate', w: 34, h: 50, chain: ex.chain, seal: ex.seal, trim: ex.trim, isOpen: !!target(ex) && W2.can(ex.key), prompt: toLabel(ex), onUse: () => useExit({ ex: Object.assign({ id: tp.exit }, ex) }) }); } }
      }
    }
  });
  // rings are not Interactables for F: the hook key (G) looks for the nearest ring in reach
  const rings = [];
  W2.ring = (x, y, o) => {
    const it = obj(x, y, { art: 'w2ring', w: 10, h: 14, interact: false, layer: 3 });
    it.land = o && o.land; it.gid = o && o.gid; it.beamX = o && o.beamX;
    rings.push(it);
    return it;
  };
  const HOOK_R = 290;
  function ringInReach(p) {
    let best = null, bd = 1e9;
    for (let i = rings.length - 1; i >= 0; i--) if (rings[i].dead || rings[i].world !== G.world) rings.splice(i, 1);
    for (const r of rings) {
      const dx = r.x - p.x, dy = r.y - (p.y - 20), d = Math.hypot(dx, dy);
      if (d > HOOK_R || dy > 10) continue;
      const k = d + (Math.sign(dx) === p.facing ? 0 : 60);
      if (k < bd) { bd = k; best = r; }
    }
    return best;
  }
  W2.ringInReach = () => { const p = pl(); return p && W2.hasKey('hook') && !p._zip ? ringInReach(p) : null; };
  const markHot = () => { const r = W2.on() ? W2.ringInReach() : null; for (const x of rings) x.hot = x === r; return r; };
  W2.ticks.push(markHot);
  // the hook: to a ring (then onto the roof beside it), or pull a light enemy
  let hookAt = -999;
  W2.useHook = () => {
    const p = pl();
    if (!p || p._zip || p.dead || busy || G.frame - hookAt < 24 || !W2.on()) return false;
    if (!W2.hasKey('hook')) return false;
    hookAt = G.frame;
    const r = ringInReach(p);
    if (r) {
      sfx('roll');
      const rope = new G.Entity(p.x, p.y);
      rope.layer = 6; rope.draw = ctx => { const q = pl(); if (!q || !q._zip) { rope.dead = true; return; } ctx.fillStyle = '#c8b090'; const n = 24; for (let i = 0; i <= n; i++) ctx.fillRect(RD(q.x + (r.x - q.x) * i / n), RD(q.y - 18 + (r.y + 2 - (q.y - 18)) * i / n + Math.sin(i / n * Math.PI) * 3), 1, 1); };
      G.world.add(rope);
      const pts = [{ x: r.x, y: r.y + 22 }];
      if (r.land) pts.push({ x: r.land.x, y: r.land.y - 6 });
      W2.zip(p, { pts, speed: 6.5, ease: true, exitVy: -1.5, onEnd: () => { W2.stats.hooks = (W2.stats.hooks || 0) + 1; } });
      G.FX.burst(r.x, r.y, 8, { speed: 1.5, life: 16, size: 1, color: '#ffe7a6', glow: true });
      return true;
    }
    // no ring: a light enemy in front is pulled in
    let best = null, bd = 160;
    for (const e of G.world.enemies) {
      if (e.dead || e.isBoss || e.untargetable) continue;
      const dx = e.x - p.x; if (Math.sign(dx) !== p.facing || Math.abs(e.y - p.y) > 60) continue;
      const d = Math.abs(dx); if (d < bd) { bd = d; best = e; }
    }
    if (!best) { sfx('whoosh'); return false; }
    const heavy = best.elite || (best.def && (best.def.heavy || (best.def.hp || 0) > 140));
    sfx('roll');
    const rope = new G.Entity(p.x, p.y); let life = 14;
    rope.layer = 6; rope.update = () => { if (--life <= 0) rope.dead = true; };
    rope.draw = ctx => { if (best.dead) return; ctx.fillStyle = '#c8b090'; for (let i = 0; i <= 20; i++) ctx.fillRect(RD(p.x + (best.x - p.x) * i / 20), RD(p.y - 18 + (best.cy - (p.y - 18)) * i / 20), 1, 1); };
    G.world.add(rope);
    if (heavy) { if (G.FX.text) G.FX.text(best.x, best.top - 10, t(`too heavy|слишком тяжёл|juda og'ir`), '#cfc6b8', { size: 6 }); return true; }
    // reel him in over a few ticks, then he stands stunned for a moment
    try { best.addStatus && best.addStatus('stun', { t: 60 }); } catch (e) { /* ignore */ }
    const tx = p.x + p.facing * 22;
    let n = 0;
    const reel = new G.Entity(best.x, best.y); reel.layer = -9;
    reel.update = () => { if (best.dead || ++n > 14) { reel.dead = true; return; } const nx = best.x + (tx - best.x) * 0.28; if (!G.level.solidPx(nx, best.y - 8)) best.x = nx; best.vx = 0; };
    G.world.add(reel);
    G.FX.burst(best.x, best.cy, 6, { speed: 1.5, life: 14, size: 1, color: '#c8b090' });
    W2.stats.pulls = (W2.stats.pulls || 0) + 1;
    return true;
  };
  window.addEventListener('keydown', e => {
    if (e.code !== 'KeyG' || e.repeat) return;
    if (G.Game.state !== 'play' || !W2.on() || (G.UI.isOpen && G.UI.isOpen()) || W2.mapOpen) return;
    if (W2.useHook()) e.preventDefault();
  });
  // the HUD hint when a ring is in reach
  SMOOTH_DRAW.push((ctx, st) => {
    if (st !== 'play' || !W2.on() || (G.UI.isOpen && G.UI.isOpen())) return;
    const r = markHot();
    if (!r) return;
    let sx = r.x - G.cam.rx, sy = r.y - G.cam.ry - 18, up = '';
    if (sy < 24) { sy = 24; up = ' ↑'; }   // the ring is above the screen: say so at the top edge
    sx = Math.max(30, Math.min(G.W - 30, sx));
    FX.tt(ctx, t(`[G] Hook|[G] Крюк|[G] Ilmoq`) + up, sx - 40, sy, 80, { size: 5.5, align: 'center', color: '#ffe7a6' });
  });

  /* ================================================================ ability gate: Sado's light (a floor or a wall that is not there) */
  // {kind:'lightfloor', id, at:{frac}, below:[{kind:'exit', exit} | {kind:'cache'}]} — a hatch hidden under painted floor
  W2.kind('lightfloor', {
    place(L, od, H2, def) {
      const r = H.site(L, od.at.frac, { need: 10, head: 4 });
      if (!r) return null;
      const x0 = r.tx + 3, fy = r.ty + 1, depth = od.depth || 7;   // fy: the floor row
      // a shaft 3 wide down into the earth, a small chamber at the bottom
      H.fill(L, x0, fy, x0 + 2, fy + depth, T.AIR);
      H.fill(L, x0 - 3, fy + depth - 3, x0 + 6, fy + depth, T.AIR);
      H.back(L, x0 - 3, fy, x0 + 6, fy + depth, 1);
      H.fill(L, x0, fy + 3, x0 + 2, fy + 3, T.PLAT);     // a step half way, to climb back out
      const block = [[x0, fy, 'top'], [x0 + 1, fy, 'top'], [x0 + 2, fy, 'top']];
      const hide = block.slice();
      for (let y = fy + 1; y <= fy + depth; y++) for (let x = x0 - 3; x <= x0 + 6; x++) if (L.get(x, y) !== T.SOLID) hide.push([x, y, 'deep']);
      const gid = def.id + ':light:' + od.id;
      H.afterBake(L, () => {
        const cv = makeCover(L, hide, gid); cv.tiles = block;
        L.w2covers = L.w2covers || {}; L.w2covers[gid] = cv;
        if (!W2.isOpen(gid)) solidify(L, block); else cv.a = 0, cv.open = true;
      });
      const bottom = { x: (x0 + 1) * TS + 8, y: (fy + depth + 1) * TS };
      const out = { tx: x0, ty: fy, x: (x0 + 1.5) * TS, y: fy * TS, gid, bottom, entry: { x: bottom.x + 24, y: bottom.y, face: -1 } };
      for (const b of od.below || []) if (b.kind === 'exit') L.w2.entries[b.exit] = out.entry;
      return out;
    },
    spawn(o, L) {
      const cv = L.w2covers && L.w2covers[o.gid];
      if (cv) L.dynDecos.push(coverDeco(cv, glyphs(o)));
      watchLight(o, cv, L);
      const def = W2.regions[W2.active];
      for (const b of o.od.below || []) {
        if (b.kind === 'exit') { const ex = def.exits[b.exit]; if (ex) obj(o.bottom.x, o.bottom.y, { art: 'w2rope', w: 16, h: 40, ropeTop: o.y - 8, prompt: ex.prompt || toLabel(ex), onUse: () => useExit({ ex: Object.assign({ id: b.exit }, ex) }) }); }
        if (b.kind === 'cache') W2.kinds.cache.spawnAt({ x: o.bottom.x - 30, y: o.bottom.y, loot: b.loot }, L, o.gid + ':cache');
      }
    }
  });
  // {kind:'lightwall', id, room | at, depth} — a passage into the rock behind a wall that is only painted
  W2.kind('lightwall', {
    place(L, od, H2, def) {
      // a wall face with thick rock behind it: carve a tunnel (2 tall) and a chamber
      const want = L.w * od.at.frac;
      const cand = [];
      for (const s of L.spots.floor) {
        if (s.plat) continue;
        for (const dir of [1, -1]) {
          const wx = s.tx + dir;
          if (L.get(wx, s.ty) !== T.SOLID || L.get(wx, s.ty - 1) !== T.SOLID || L.get(s.tx, s.ty - 1) !== T.AIR) continue;
          // rock: tunnel 7 long, chamber 6x4, margin 2
          let ok = true;
          const len = 7, cx0 = dir > 0 ? wx + len : wx - len - 5, cx1 = cx0 + 5;
          for (let x = Math.min(wx, cx0) - 2; x <= Math.max(wx + dir * len, cx1) + 2 && ok; x++) for (let y = s.ty - 5; y <= s.ty + 2 && ok; y++) {
            if (x === s.tx || (dir > 0 ? x < wx : x > wx)) continue;
            if (!L.in(x, y) || L.get(x, y) !== T.SOLID) ok = false;
          }
          if (ok) cand.push({ s, dir, wx, cx0, cx1, d: Math.abs(s.x - want) });
        }
      }
      if (!cand.length) return null;
      cand.sort((a, b) => a.d - b.d);
      const c = cand[0], ty = c.s.ty;
      for (let k = 0; k < 7; k++) for (const y of [ty - 1, ty]) { L.set(c.wx + c.dir * k, y, T.AIR); L.back[L.idx(c.wx + c.dir * k, y)] = 1; }
      H.fill(L, c.cx0, ty - 3, c.cx1, ty, T.AIR); H.back(L, c.cx0, ty - 3, c.cx1, ty, 1);
      const block = [[c.wx, ty - 1, 'deep'], [c.wx, ty, 'deep']];
      const hide = block.slice();
      for (let k = 1; k < 7; k++) for (const y of [ty - 1, ty]) hide.push([c.wx + c.dir * k, y, 'deep']);
      for (let y = ty - 3; y <= ty; y++) for (let x = c.cx0; x <= c.cx1; x++) hide.push([x, y, 'deep']);
      const gid = def.id + ':light:' + od.id;
      H.afterBake(L, () => {
        const cv = makeCover(L, hide, gid); cv.tiles = block;
        L.w2covers = L.w2covers || {}; L.w2covers[gid] = cv;
        if (!W2.isOpen(gid)) solidify(L, block); else cv.a = 0, cv.open = true;
      });
      const chamber = { x: ((c.cx0 + c.cx1 + 1) / 2) * TS, y: (ty + 1) * TS };
      return { tx: c.wx, ty, x: c.wx * TS + 8, y: (ty + 1) * TS, gid, chamber, dir: c.dir };
    },
    spawn(o, L) {
      const cv = L.w2covers && L.w2covers[o.gid];
      if (cv) L.dynDecos.push(coverDeco(cv, glyphs(o)));
      watchLight(o, cv, L);
      for (const b of o.od.inside || [{ kind: 'chest' }]) {
        if (b.kind === 'chest') W2.kinds.chest.spawnAt({ x: o.chamber.x, y: o.chamber.y }, L, o.gid + ':chest');
        if (b.kind === 'cache') W2.kinds.cache.spawnAt({ x: o.chamber.x, y: o.chamber.y, loot: b.loot }, L, o.gid + ':cache');
      }
    }
  });
  // the writing on a false surface glows in Sado's light
  function glyphs(o) {
    return {
      draw(ctx, t2, cover) {
        const p = pl(); if (!p || cover.open) return;
        const d = Math.hypot(p.x - cover.gx, p.y - 16 - cover.gy);
        const k = W2.lightOn() ? Math.max(0, 1 - d / 150) : 0;
        if (k <= 0) return;
        ctx.globalAlpha = k * (0.6 + 0.3 * Math.sin(t2 * 3));
        ctx.fillStyle = '#9ff3e6';
        const cx = RD(cover.gx + (cover.tiles.length > 2 ? TS : 0)), cy = RD(cover.gy);
        for (let i = 0; i < 5; i++) { ctx.fillRect(cx - 6 + i * 3, cy - 3 + ((i * 7) % 5), 2, 1); ctx.fillRect(cx - 5 + i * 3, cy + 1 - ((i * 5) % 3), 1, 2); }
        ctx.globalAlpha = 1;
      },
      fx(ctx, t2, cover) {
        const p = pl(); if (!p || cover.open || !W2.lightOn()) return;
        const d = Math.hypot(p.x - cover.gx, p.y - 16 - cover.gy);
        if (d < 150) G.Glow.add(cover.gx + (cover.tiles.length > 2 ? TS : 0), cover.gy, 16, '#9ff3e6', 0.4 * (1 - d / 150));
      }
    };
  }
  // stand close with her light: the false floor or wall goes, for good
  function watchLight(o, cv, L) {
    if (!cv || W2.isOpen(o.gid)) return;
    let told = false;
    const it = new G.Entity(o.x, o.y); it.layer = -5;
    it.update = () => {
      if (cv.open) { it.dead = true; return; }
      const p = pl(); if (!p) return;
      const d = Math.hypot(p.x - o.x, p.y - o.y);
      if (d < 150 && !told && W2.lightOn() && sadoAwake()) { told = true; subtitle(`Wait. Something's written here... this isn't a floor.|Стой. Тут что-то написано… это не пол.|To'xta. Bu yerda nimadir yozilgan... bu pol emas.`); }
      if (d < 44 && W2.lightOn()) {
        cv.open = true; solidify(L, cv.tiles, T.AIR); W2.setOpen(o.gid); sfx('scroll');
        G.FX.burst(o.x, o.y, 24, { speed: 2, life: 40, size: 2, size1: 0, color: '#9ff3e6', glow: true });
        W2.stats.lightGates = (W2.stats.lightGates || 0) + 1;
      }
    };
    G.world.add(it);
  }

  /* ================================================================ secrets: a cracked wall (strike it) */
  function crackWall(L, tiles, id) {
    if (W2.isOpen(id)) { solidify(L, tiles, T.AIR); return; }
    const cv = makeCover(L, tiles.map(([x, y]) => [x, y, 'deep']), id);
    solidify(L, tiles);
    L.dynDecos.push(coverDeco(cv, { draw(ctx) { if (cv.open) return; ctx.globalAlpha = cv.a; ctx.fillStyle = '#0a0606'; const x = cv.x + 8, y = cv.y + 6; for (let i = 0; i < 18; i++) ctx.fillRect(RD(x + Math.sin(i * 1.7) * 6), y + i * 2, 2, 1); ctx.fillRect(x - 4, y + 16, 9, 1); ctx.globalAlpha = 1; } }));
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const [tx, ty] of tiles) { x0 = Math.min(x0, tx * TS); x1 = Math.max(x1, tx * TS + TS); y0 = Math.min(y0, ty * TS); y1 = Math.max(y1, ty * TS + TS); }
    const b = new G.Breakable((x0 + x1) / 2, y1, 'w2crack');
    b.w = x1 - x0 + 4; b.h = y1 - y0; b.hits = 0; b.layer = -6;
    b.draw = () => {};
    b.smash = function (src) {
      if (this.dead) return;
      this.hits++;
      G.FX.debris(this.x, this.y - 20, 8, (src && src.facing) || 1, ['#5a4a40', '#3a2e28', '#7a6a5a'], { speed: 2 });
      G.shake(0.12); sfx('break');
      if (this.hits < 3) return;
      this.dead = true; cv.open = true; solidify(L, tiles, T.AIR); W2.setOpen(id);
      G.FX.debris(this.x, this.y - 20, 22, (src && src.facing) || 1, ['#5a4a40', '#3a2e28', '#7a6a5a'], { speed: 3 });
      say(`A hidden room.|Тайная комната.|Yashirin xona.`, '#ffe7a6');
      W2.stats.secrets = (W2.stats.secrets || 0) + 1;
    };
    G.world.add(b);
  }
  W2.crackWall = crackWall;

  /* ================================================================ chests and caches with stable ids */
  W2.kind('chest', {
    place(L, od) { const r = H.runNear(L, od.at.frac, { need: 3, head: 3 }); return r && { tx: r.tx + 1, ty: r.ty, x: (r.tx + 1) * TS + 8, y: r.y }; },
    spawn(o, L) { W2.kinds.chest.spawnAt(o, L, o.sid); },
    spawnAt(o, L, id) {
      G.Game.spawnObject({ kind: 'chest', x: o.x, y: o.y }, G.run.stage, L);
      const it = G.world.interactables[G.world.interactables.length - 1];
      if (!it || it.art !== 'chest') return;
      it._w2 = id;
      if (W2.isOpen(id)) { it.open = true; it.interact = false; return; }
      const u0 = it.onUse;
      it.onUse = function (p, self) { const r = u0.apply(this, arguments); W2.setOpen(id); W2.stats.chests = (W2.stats.chests || 0) + 1; return r; };
    }
  });
  W2.kind('cache', {
    place(L, od) { const r = H.runNear(L, od.at.frac, { need: 3, head: 3 }); return r && { tx: r.tx + 1, ty: r.ty, x: (r.tx + 1) * TS + 8, y: r.y }; },
    spawn(o, L) { W2.kinds.cache.spawnAt(Object.assign({ loot: o.od.loot }, o), L, o.sid); },
    spawnAt(o, L, id) {
      if (W2.taken(id)) return;
      const it = obj(o.x, o.y, { art: 'ydCache', w: 16, h: 12, prompt: N(`Search the cache|Осмотреть тайник|Yashirin joyni tintish`), sid: id });
      it.onUse = (p, self) => {
        if (self.usedUp) return true;
        self.usedUp = true; self.dead = true; W2.take(id);
        if (o.loot === 'gold') G.Pickups.gold(self.x, self.y - 10, 60 + 20 * (G.run.stage || 1));
        else if (typeof o.loot === 'function') o.loot(self);
        else try { G.YITEMS.openCache(self, p); } catch (e) { G.Pickups.gold(self.x, self.y - 10, 40); }
        try { if (G.CH) G.CH.addXp(10, 'explore'); } catch (e) { /* ignore */ }
        W2.stats.caches = (W2.stats.caches || 0) + 1;
        return true;
      };
    }
  });
  // a sealed little house with a cracked wall: a secret room
  W2.kind('sealed', {
    place(L, od, H2, def) { return W2.kinds.house.place(L, Object.assign({ w: 7, h: 5, doors: { [od.side || 'w']: 'crack' }, inside: [{ kind: 'cache', dx: 0.5, loot: od.loot }] }, od), H2, def); },
    spawn(o, L) { W2.kinds.house.spawn(o, L); }
  });
  // a key lying somewhere (or in a bag)
  W2.kind('keyitem', {
    place(L, od) { const r = H.runNear(L, od.at.frac, { need: 3, head: 3 }); return r && { tx: r.tx + 1, ty: r.ty, x: (r.tx + 1) * TS + 8, y: r.y }; },
    spawn(o) {
      const k = o.od.key;
      if (W2.hasKey(k)) return;
      obj(o.x, o.y, { art: 'w2bag', w: 14, h: 12, prompt: o.od.prompt || `Take|Взять|Olish`, onUse: (p, self) => { self.dead = true; W2.giveKey(k); if (o.od.then) o.od.then(); return true; } });
    }
  });

  /* ================================================================ a miniboss (an elite ambush that stays dead) */
  W2.kind('miniboss', {
    place(L, od) {
      if (!L.isOpen && L.rooms && L.rooms.length) {
        const list = L.rooms.slice().sort((a, b) => a.ox - b.ox);
        const rm = list[Math.floor(od.at.frac * list.length)];
        const tx = rm.ox + Math.floor(rm.w / 2), gy = H.ground(L, tx, rm.oy + 1);
        return gy && { tx, ty: gy - 1, x: tx * TS + 8, y: gy * TS };
      }
      const r = H.site(L, od.at.frac, { need: 14, head: 6, pad: 0 });
      return r && { tx: r.tx + 7, ty: r.ty, x: (r.tx + 7) * TS, y: r.y };
    },
    spawn(o) {
      const id = W2.active + ':mb:' + (o.od.id || 'mb');
      if (W2.S().mb[id]) return;
      const e = G.Enemies.spawn(o.od.enemy, o.x, o.y, { elite: true });
      if (!e) return;
      e._w2id = id; e._w2mb = id;
      if (o.od.hpMul) { e.maxHp = Math.round(e.maxHp * o.od.hpMul); e.hp = e.maxHp; }
      if (o.od.name) { e.w2name = o.od.name; }
      for (const add of o.od.adds || []) { const a = G.Enemies.spawn(add, o.x + U.rand(-60, 60), o.y); if (a) a._w2id = id + ':add' + Math.random(); }
    }
  });
  // a named place (people stand here by their schedule)
  W2.kind('spot', {
    place(L, od) {
      const r = H.runNear(L, od.at.frac, { need: 3, head: 3, outdoor: od.outdoor });
      if (!r) return null;
      L.w2.spots = L.w2.spots || {};
      const at = { x: (r.tx + 1) * TS + 8, y: r.y };
      L.w2.spots[od.id] = at;
      return Object.assign({ tx: r.tx + 1, ty: r.ty, entry: { x: at.x - 40, y: at.y, face: 1 } }, at);   // entry 'spot:<id>' (stage 5: tests, story jumps)
    }
  });
  // a stall: sells by day, a different seller (the secret market) by night
  W2.kind('stall', {
    place(L, od) {
      const r = H.site(L, od.at.frac, { need: 9, head: 4 });
      if (!r) return null;
      L.w2.spots = L.w2.spots || {};
      L.w2.spots[od.id] = { x: (r.tx + 1) * TS, y: r.y };
      return { tx: r.tx, ty: r.ty, x: (r.tx + 4) * TS, y: r.y };
    },
    spawn(o) {
      const open = W2.shopOpen(o.od.shop);
      const night = o.od.night && W2.shopOpen(o.od.night);
      if (!open && !night) {
        obj(o.x, o.y, { art: 'w2shut', w: 40, h: 24, interact: true, prompt: t(o.od.closedText || `Closed until morning|Закрыто до утра|Ertalabgacha yopiq`), onUse: () => true });
        return;
      }
      const st = (G.run.stage || 1);
      const kinds = night ? (o.od.nightKinds || ['consumable', 'charm', 'mod']) : (o.od.kinds || ['weapon', 'armour', 'consumable']);
      kinds.forEach((kind, i) => {
        G.Game.spawnObject({ kind: 'shop', x: o.x - 40 + i * 30, y: o.y, slot: 0 }, st, G.level);
        const rug = G.world.interactables[G.world.interactables.length - 1];
        if (!rug || rug.art !== 'shopRug') return;
        try {
          const it = G.YITEMS.dropFor(st + 1, { kind });
          if (it) {
            rug.item = it; rug.food = false;
            const e = { id: it.id, q: it.q || 0, up: 0 };
            rug.price = Math.round(G.YITEMS.price(e) * (G.YITEMS.typeOf(e.id) === 'material' ? (it.n || 1) : 1) * (night ? 1.25 : 1));
            rug.prompt = `Купить «${it.name}» — ${rug.price} тилла`;
          }
        } catch (e) { console.error('[world] stall', e); }
      });
      if (night && o.od.nightKey && !W2.hasKey(o.od.nightKey)) {
        const price = o.od.nightKeyPrice || 120;
        obj(o.x + 54, o.y, { art: 'w2bag', w: 14, h: 12, prompt: tf(`Buy a smuggler's lamp — {n} tilla|Купить лампу контрабандиста — {n} тилла|Kontrabandachi chirog'ini sotib olish — {n} tilla`, { n: price }), onUse: (p, self) => { if ((G.run.gold || 0) < price) { sfx('denied'); say(`Not enough tilla|Не хватает тилла|Tilla yetmaydi`, '#ff8a7a'); return true; } gold(-price); self.dead = true; W2.giveKey(o.od.nightKey); return true; } });
      }
    }
  });
  OA.w2shut = (ctx, o) => {
    const x = px(o.x), y = px(o.y);
    R(ctx, x - 20, y - 22, 40, 22, '#3a2618'); for (let i = 0; i < 8; i++) R(ctx, x - 19 + i * 5, y - 21, 4, 21, i & 1 ? '#5a3a22' : '#4a2e1a');
    R(ctx, x - 22, y - 26, 44, 4, '#2a1a10'); R(ctx, x - 2, y - 14, 4, 4, '#8a8a92');
  };
}
