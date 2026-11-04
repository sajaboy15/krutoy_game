/* =====================================================================
   Companions on screen: portrait chips under the hero's panel (health,
   the commanded skill's cooldown with its key, downed timer), the stance
   wheel (hold V), the revive prompt, Surayyo's portraits and cast entry,
   and the COMPANIONS page [O] in the character screens (68_inventory_ui:
   three branches per companion, gear slots, stance, mood).
   ===================================================================== */
{
  const PX = G.PARTY._px, PARTY = G.PARTY, DEF = PX.DEF, IDS = PX.IDS;
  const fr = () => G.frame || 0;
  const pl = () => (G.world && G.world.player) || null;
  const cl = (v, a, b) => (v < a ? a : v > b ? b : v);

  /* ================================================================ Surayyo: portraits and the cast */
  CAST.surayyo = { name: 'Surayyo|Сурайё|Surayyo', portrait: 'surayyo' };
  G.PORTRAIT_BG = G.PORTRAIT_BG || {};
  G.PORTRAIT_BG.surayyo = '#1d3446';
  G.PORTRAITS.surayyo = (c, b) => {
    P.shoulders(c, '#2f4f74', 34, 7);
    P.poly(c, [-13, 34, -12, 12, -4, 8, -6, 34], '#5e4430'); P.poly(c, [13, 34, 12, 12, 4, 8, 6, 34], '#5e4430');   // the vest
    P.poly(c, [-5, 9, 0, 17, 5, 9], '#c9b48a');
    P.drape(c, '#b4553a');                                     // the headscarf, tied back for work
    P.face(c, '#c8946a', '#a8764f');
    P.ell(c, 0, -13.5, 10.4, 5.4, '#b4553a'); P.line(c, -9.5, -11, 9.5, -12.5, 1.6, '#e0a070');
    P.poly(c, [-8.6, -9.4, -4, -11.2, 3, -11.4, 8.6, -9.2, 4, -9.8, -3, -9.6], '#2a1a12');   // hair at the brow
    P.line(c, 14, -30, 20, 34, 2.2, '#7a5230'); P.line(c, 14, -30, 10, -33, 1.6, '#b8c0c8');  // the hook-staff over her shoulder
    P.eyes(c, b, '#1e1410');
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#1e1410');
    P.px(c, [[14, 19, 4, 1], [13, 18], [18, 18]], '#7a3a2a');   // a wide smile
    P.px(c, [[16, 16, 1, 2]], '#a8764f');
  };
  // 98_ui_art.js loads after this file: her hi-res portrait spec goes in once everything is loaded (and lazily)
  const addSpec = () => { try {
    const UA = G.UI_ART;
    if (UA && UA.SPEC && !UA.SPEC.surayyo) UA.SPEC.surayyo = { name: 'Surayyo', f: 1, skin: '#c8946a', hair: '#2a1a12', head: 'scarf', headC: '#b4553a', headM: '#e0a070', under: '#2a1a12', robe: '#2f4f74', robe2: '#16283e', trim: '#c9b48a', shirt: '#e6dcc6', eye: '#1e1410', smile: 1, rim: '#9fd8ff', bg: ['#1d3446', '#060c14'], light: '#ffe2b8', jaw: 0.35 };
  } catch (e) { /* ignore */ } };
  setTimeout(addSpec, 0); ON_NEWRUN.push(addSpec);
  try { if (G.UI_ART && G.UI_ART.SPEC) { /* plate colour for dialogs */ } } catch (e) { /* ignore */ }

  /* ================================================================ a small head for the chips (cut from the figure) */
  const HEADS = new Map();
  function headIcon(id) {
    if (HEADS.has(id)) return HEADS.get(id);
    const F = PX.rawFigure ? PX.rawFigure(id) : null;
    if (!F || !F.f[0]) return null;
    const S = F.S, c = G.makeCanvas(12, 12, true), y0 = 66 + S.fy - 4;
    c.ctx.drawImage(F.f[0], 24 - 6, y0, 12, 12, 0, 0, 12, 12);
    G.Art.process(c.ctx, 12, 12, { outline: '#140c14' });
    HEADS.set(id, c);
    return c;
  }

  // the chip's face: the dialogue portrait (98_ui_art), cropped to the head and drawn in the smooth pass
  const FACE = { x: 24, y: 29, w: 52, h: 48 };     // the head in the 100×144 portrait
  const hiRes = id => { addSpec(); const UA = G.UI_ART; return !!(UA && UA.on !== false && UA._fig && UA._bg && UA.SPEC && UA.SPEC[id]); };
  function face(ctx, id, x, y, w, h, alpha, tint) {
    const UA = G.UI_ART;
    try {
      const bg = UA._bg(id), f = UA._fig(id, false), k = f.width / 100, kb = bg.width / 100;
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.globalAlpha *= alpha; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bg, FACE.x * kb, FACE.y * kb, FACE.w * kb, FACE.h * kb, x, y, w, h);
      ctx.drawImage(f, FACE.x * k, FACE.y * k, FACE.w * k, FACE.h * k, x, y, w, h);
      if (tint) { ctx.fillStyle = tint; ctx.fillRect(x, y, w, h); }
      ctx.restore();
    } catch (e) { /* the pixel head stays */ }
  }
  PX.face = face;
  /* ================================================================ HUD chips (pixel pass: frames, bars; smooth pass: text) */
  const CH0 = { x: 4, y: 60, w: 84, h: 15, gap: 2 };
  const hudOn = st => st === 'play' && G.run && pl() && !R().ended && !(G.Game.stage && G.Game.stage.plan && G.Game.stage.plan.type === 'victory');
  const hudShow = () => { const h = G.UI._debug().hud; return h ? cl(h.show || 0, 0, 1) : 1; };
  const chipList = () => PARTY.active().map(id => ({ id, c: PARTY.actor(id), m: PX.M(id) }));
  PIXEL_DRAW.push((ctx, st) => {
    if (!hudOn(st) || (G.CHUI && G.CHUI.open)) return;
    const L = chipList(); if (!L.length) return;
    const a = hudShow(); if (a < 0.05) return;
    ctx.save(); ctx.globalAlpha = a;
    L.forEach((q, i) => {
      const x = CH0.x, y = CH0.y + i * (CH0.h + CH0.gap), w = CH0.w, h = CH0.h, c = q.c, D = DEF[q.id];
      const down = c && c.downed, out = q.m.out || !c;
      ctx.fillStyle = 'rgba(11,7,16,0.82)'; ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
      ctx.fillStyle = down && (fr() >> 3) & 1 ? '#a8323a' : '#6a4a2a'; ctx.fillRect(x + 2, y, w - 4, 1); ctx.fillRect(x + 2, y + h - 1, w - 4, 1); ctx.fillRect(x, y + 2, 1, h - 4); ctx.fillRect(x + w - 1, y + 2, 1, h - 4);
      ctx.fillStyle = '#c9963c'; ctx.fillRect(x + 3, y, w - 6, 1);
      ctx.fillStyle = '#120c14'; ctx.fillRect(x + 1, y + 1, 1, 1); ctx.fillRect(x + w - 2, y + 1, 1, 1);
      // the head
      const hi = headIcon(q.id);
      ctx.fillStyle = D.col; ctx.globalAlpha = a * 0.25; ctx.fillRect(x + 2, y + 2, 12, 11); ctx.globalAlpha = a * (out ? 0.35 : 1);
      if (hi && !hiRes(q.id)) ctx.drawImage(hi, x + 2, y + 2);
      ctx.globalAlpha = a;
      // health / the downed timer
      const bx = x + 16, by = y + 3, bw = 46;
      ctx.fillStyle = '#1a1420'; ctx.fillRect(bx - 1, by - 1, bw + 2, 5);
      ctx.fillStyle = '#3a1418'; ctx.fillRect(bx, by, bw, 3);
      if (down) { ctx.fillStyle = (fr() >> 2) & 1 ? '#ff6a6a' : '#e8434f'; ctx.fillRect(bx, by, Math.round(bw * c.downT / 1800), 3); if (c.rev > 0) { ctx.fillStyle = '#9cf0a0'; ctx.fillRect(bx, by + 2, Math.round(bw * c.rev / 120), 1); } }
      else if (!out) { const f = cl(c.hp / c.maxHp, 0, 1); ctx.fillStyle = f < 0.3 ? '#e8434f' : '#c4302f'; ctx.fillRect(bx, by, Math.round(bw * f), 3); ctx.fillStyle = '#ff9a8a'; ctx.fillRect(bx, by, Math.round(bw * f), 1); if (c._ward > 0) { ctx.fillStyle = '#8ff6ef'; ctx.fillRect(bx, by + 2, Math.min(bw, Math.round(bw * c._ward / c.maxHp * 3)), 1); } }
      // the commanded skill: the key in a tile that fills as it cools down
      const kx = x + w - 16, ky = y + 2;
      ctx.fillStyle = '#07040a'; ctx.fillRect(kx, ky, 13, 11);
      const ready = c && !down && !out ? 1 - cl(c.skillCD / (D.skill.cd * 60), 0, 1) : 0;
      ctx.fillStyle = ready >= 1 ? D.col : '#2a3a4a'; ctx.globalAlpha = a * (ready >= 1 ? 0.55 + 0.2 * Math.sin(fr() * 0.12) : 0.9);
      const fh = Math.round(11 * ready); ctx.fillRect(kx, ky + 11 - fh, 13, fh);
      ctx.globalAlpha = a;
      ctx.fillStyle = ready >= 1 ? '#ffe7a6' : '#6a4a2a'; ctx.fillRect(kx, ky, 13, 1); ctx.fillRect(kx, ky + 10, 13, 1); ctx.fillRect(kx, ky, 1, 11); ctx.fillRect(kx + 12, ky, 1, 11);
    });
    ctx.restore();
  });
  SMOOTH_DRAW.push((ctx, st) => {
    if (!hudOn(st) || (G.CHUI && G.CHUI.open)) return;
    const a = hudShow(); if (a < 0.05) return;
    const L = chipList();
    ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'top';
    L.forEach((q, i) => {
      const x = CH0.x, y = CH0.y + i * (CH0.h + CH0.gap), w = CH0.w, c = q.c, D = DEF[q.id], down = c && c.downed, out = q.m.out || !c;
      if (hiRes(q.id)) face(ctx, q.id, x + 2, y + 2, 12, 11, out ? 0.4 : 1, down ? 'rgba(160,20,30,' + (0.25 + 0.15 * Math.sin(fr() * 0.2)) + ')' : out ? 'rgba(20,10,30,0.5)' : null);
      ctx.font = '600 4.1px ' + (G.FONT_UI || 'sans-serif');
      let label = t(D.name);
      if (down) label += ' · ' + Math.ceil(c.downT / 60) + t(`s|с|s`);
      else if (out) label += ' · ' + t(`until rest|до привала|dam olguncha`);
      ctx.fillStyle = down ? '#ff8a7a' : out ? '#8a7a8a' : '#f2e6c8';
      ctx.fillText(label, x + 16, y + 7.6);
      // key and cooldown
      ctx.font = '700 6px ' + (G.FONT_UI || 'sans-serif'); ctx.textAlign = 'center';
      const cd = c && !down && !out ? Math.ceil(c.skillCD / 60) : 0;
      ctx.fillStyle = cd > 0 || down || out ? '#8a7a70' : '#1a1018';
      ctx.fillText(D.keyN, x + w - 9.5, y + 3.6);
      if (cd > 0) { ctx.font = '600 3.4px ' + (G.FONT_UI || 'sans-serif'); ctx.fillStyle = '#c9b48a'; ctx.fillText(cd + '', x + w - 9.5, y + 9.3); }
      ctx.textAlign = 'left';
    });
    if (L.length) {
      const y = CH0.y + L.length * (CH0.h + CH0.gap) + 0.5;
      ctx.font = '600 3.8px ' + (G.FONT_UI || 'sans-serif'); ctx.globalAlpha = a * 0.9;
      const sl = '[V] ' + t(PARTY.STANCE_NAME[PARTY.stance()]);
      ctx.fillStyle = 'rgba(8,5,12,0.85)'; ctx.fillText(sl, CH0.x + 2.4, y + 0.4);
      ctx.fillStyle = '#e2c98a'; ctx.fillText(sl, CH0.x + 2, y);
    }
    // revive prompt and the stance wheel, over the world
    const p = pl(), cam = G.cam;
    if (p && cam) {
      for (const c of PX.actors()) if (c.downed && Math.abs(c.x - p.x) < 30 && Math.abs(c.y - p.y) < 26) {
        const sx = c.x - cam.x, sy = c.y - cam.y - 40;
        ctx.globalAlpha = a; ctx.font = '600 5px ' + (G.FONT_UI || 'sans-serif'); ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillText(t(`Hold [F] to help up|Держи [F], чтобы поднять|Turg'izish uchun [F] ni bosib tur`), sx + 0.5, sy + 0.5);
        ctx.fillStyle = '#9cf0a0'; ctx.fillText(t(`Hold [F] to help up|Держи [F], чтобы поднять|Turg'izish uchun [F] ni bosib tur`), sx, sy);
        ctx.textAlign = 'left';
      }
      const Rd = PX.radial;
      if (Rd.open && PARTY.active().length) {
        const cx = p.x - cam.x, cy = p.cy - cam.y - 6, r = 26;
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = 'rgba(8,5,12,0.72)'; ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, 6.3); ctx.fill();
        ctx.strokeStyle = 'rgba(226,180,82,0.7)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.arc(cx, cy, r + 14, 0, 6.3); ctx.stroke();
        const pos = [[0, -1], [1, 0], [0, 1], [-1, 0]];
        PX.STANCES.forEach((s, i) => {
          const on = Rd.sel === i, px2 = cx + pos[i][0] * r, py2 = cy + pos[i][1] * r * 0.8;
          ctx.fillStyle = on ? 'rgba(90,58,20,0.95)' : 'rgba(36,26,48,0.9)';
          ctx.beginPath(); ctx.ellipse(px2, py2, 17, 6, 0, 0, 6.3); ctx.fill();
          ctx.strokeStyle = on ? '#ffe7a6' : 'rgba(226,180,82,0.5)'; ctx.lineWidth = on ? 0.7 : 0.4; ctx.stroke();
          ctx.font = (on ? '700 ' : '500 ') + '3.9px ' + (G.FONT_UI || 'sans-serif'); ctx.textAlign = 'center';
          ctx.fillStyle = on ? '#ffe7a6' : '#c9b48a';
          ctx.fillText((i + 1) + ' · ' + t(PARTY.STANCE_NAME[s]), px2, py2 - 2.2);
        });
        ctx.font = '500 3.5px ' + (G.FONT_UI || 'sans-serif'); ctx.fillStyle = '#e8dcc8';
        const sd = Rd.sel >= 0 ? t(PARTY.STANCE_DESC[PX.STANCES[Rd.sel]]) : '';
        if (sd) { const tw = ctx.measureText(sd).width + 8; ctx.fillStyle = 'rgba(8,5,12,0.78)'; ctx.fillRect(cx - tw / 2, cy + r + 15.2, tw, 5.2); ctx.fillStyle = '#f2e6c8'; }
        ctx.fillText(sd, cx, cy + r + 16);
        ctx.textAlign = 'left';
      }
    }
    ctx.restore();
  });
  // the whole party in the pause stats? (kept small: the chips say enough)

  /* ================================================================ the COMPANIONS page [O] */
  const CU = G.CHUI;
  if (CU && CU.EXT) {
    const UI = CU, D0 = () => UI._dbg;
    UI.PAGES.push('party'); UI.PAGE_NAME.party = `Companions|Спутники|Hamrohlar`; UI.PAGE_KEY.party = 'O'; UI.EXT_KEY.KeyO = 'party';
    const PS = { who: 0, sel: 0, menu: null, flash: 0 };
    PX.page = PS;
    const COL = { gold: '#e2b452', goldL: '#ffe7a6', dim: '#9a8c9e', cream: '#f2e6c8', bad: '#ff8a7a', good: '#9cf0a0', ink: '#07040a' };
    const joined = () => PX.P().order.filter(id => PARTY.has(id));
    const cur = () => { const J = joined(); if (!J.length) return null; PS.who = cl(PS.who, 0, J.length - 1); return J[PS.who]; };
    // a live figure, drawn crisp at ×2
    const FIG = G.makeCanvas(84, 84, true);
    function figure(id) {
      const c = FIG.ctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, 84, 84);
      const a = PARTY.actor(id);
      const fake = { id, def: DEF[id], anim: 'idle', animT: UI.t, t: UI.t, facing: 1, flashT: 0, downed: false, st: {}, shieldT: 0, alpha: 1, x: 42, y: 78, runPh: 0 };
      try { PX.drawFigure(c, fake); } catch (e) { /* ignore */ }
      void a;
      return FIG;
    }
    // cells: stance ×4, gear ×3, nodes 3×6
    function cells(id) {
      const out = [];
      PX.STANCES.forEach((s, i) => out.push({ kind: 'stance', s, x: 24 + (i % 2) * 58, y: 150 + Math.floor(i / 2) * 15, w: 55, h: 12 }));
      ['weapon', 'armour', 'charm'].forEach((g, i) => out.push({ kind: 'gear', g, x: 24 + i * 39, y: 196, w: 36, h: 26 }));
      DEF[id].branches.forEach((b, bi) => b.nodes.forEach((n, i) => out.push({ kind: 'node', bi, i, n, x: 160 + bi * 104, y: 58 + i * 22 + (i === 5 ? 4 : 0), w: 96, h: 18 })));
      return out;
    }
    function activate(id, cl0) {
      if (!cl0) return;
      if (cl0.kind === 'stance') { PARTY.stance(id, cl0.s); sfx('ui_select'); }
      else if (cl0.kind === 'gear') {
        const L = (G.YITEMS.list() || []).filter(e => PX.fits(id, cl0.g, e));
        const opts = L.map(e => ({ e, label: itemName(e) }));
        if (PARTY.gearOf(id, cl0.g)) opts.unshift({ off: true, label: t(`Take off|Снять|Yechish`) });
        if (!opts.length) { msg(t(`Nothing fits.|Ничего подходящего.|Mos narsa yo'q.`), COL.bad); sfx('denied'); return; }
        PS.menu = { id, g: cl0.g, opts, sel: 0 };
        sfx('ui_select');
      } else {
        const why = PARTY.whyNot(id, cl0.n[0]);
        if (!why) { PARTY.learn(id, cl0.n[0]); PS.flash = 30; sfx('ready'); msg(t(cl0.n[1]) + ' — ' + t(`learned|изучено|o'rganildi`), COL.good); }
        else { sfx('denied'); msg(whyText(id, cl0, why), COL.bad); }
      }
    }
    const itemName = e => { const d = G.Items.defs[e.id]; let n = d ? LANG.T(d.name || e.id) : e.id; if (e.up) n += ' +' + e.up; const h = G.YITEMS.equippedIn(e.u), who = PX.held(e.u); if (h) n += ' · ' + t(`on Ravshan|на Равшане|Ravshanda`); else if (who) n += ' · ' + t(DEF[who].name); return n; };
    const whyText = (id, c0, why) => why === 'learned' ? t(`Already learned.|Уже изучено.|Allaqachon o'rganilgan.`)
      : why === 'points' ? t(`No points: one comes with each level.|Нет очков: по одному за каждый уровень.|Ochko yo'q: har darajada bittadan.`)
        : why === 'order' ? t(`Learn the nodes above it first.|Сначала изучи узлы выше.|Avval yuqoridagi tugunlarni o'rgan.`)
          : why === 'branch' ? tf(`Needs {n} points in this branch.|Нужно {n} очка в этой ветке.|Bu tarmoqda {n} ochko kerak.`, { n: PARTY.KEY_NEED })
            : t(PX.KEY_LOCK[id]);
    function msg(s, col) { UI.msg = s; UI.msgT = 150; UI.msgCol = col; }
    function move(dx, dy) {
      const id = cur(); if (!id) return;
      const C2 = cells(id), a = C2[PS.sel] || C2[0];
      const ax = a.x + a.w / 2, ay = a.y + a.h / 2;
      let best = -1, bd = 1e9;
      C2.forEach((b, i) => {
        if (i === PS.sel) return;
        const bx = b.x + b.w / 2 - ax, by = b.y + b.h / 2 - ay;
        if (dx && Math.sign(bx) !== dx) return; if (dy && Math.sign(by) !== dy) return;
        if (dx && Math.abs(bx) < 4) return; if (dy && Math.abs(by) < 4) return;
        const d = dx ? Math.abs(bx) + Math.abs(by) * 2.2 : Math.abs(by) + Math.abs(bx) * 2.2;
        if (d < bd) { bd = d; best = i; }
      });
      if (best >= 0) { PS.sel = best; sfx('ui_move'); }
    }
    UI.EXT.party = {
      help: pad => (pad ? t(`Move · A choose · LB/RB companion · B back|Выбор · A — действие · LB/RB — спутник · B — назад|Tanlash · A — amal · LB/RB — hamroh · B — orqaga`)
        : t(`Arrows move · Enter learn / equip / stance · Q/E companion · Tab pages · Esc close|Стрелки — выбор · Enter — изучить / надеть / стойка · Q/E — спутник · Tab — страницы · Esc — закрыть|Strelkalar — tanlash · Enter — o'rganish / kiyish / holat · Q/E — hamroh · Tab — sahifalar · Esc — yopish`)),
      key(c) {
        const id = cur(); if (!id) return;
        if (PS.menu) {
          const M = PS.menu;
          if (c === 'up') { M.sel = (M.sel + M.opts.length - 1) % M.opts.length; sfx('ui_move'); }
          else if (c === 'down') { M.sel = (M.sel + 1) % M.opts.length; sfx('ui_move'); }
          else if (c === 'ok') { const o = M.opts[M.sel]; if (o.off) PARTY.unequip(M.id, M.g); else PARTY.equip(M.id, M.g, o.e.u); PS.menu = null; }
          else if (c === 'back' || c === 'x') { PS.menu = null; sfx('ui_back'); }
          return;
        }
        if (c === 'tab-' || c === 'tab+') { const n = joined().length; if (n > 1) { PS.who = (PS.who + (c === 'tab+' ? 1 : -1) + n) % n; sfx('ui_move'); } return; }
        if (c === 'left') move(-1, 0); else if (c === 'right') move(1, 0); else if (c === 'up') move(0, -1); else if (c === 'down') move(0, 1);
        else if (c === 'ok') activate(id, cells(id)[PS.sel]);
        else if (c === 'x') { const c0 = cells(id)[PS.sel]; if (c0 && c0.kind === 'gear' && PARTY.gearOf(id, c0.g)) { PARTY.unequip(id, c0.g); sfx('ui_back'); } }
      },
      draw(ctx, HIT) {
        const { panel, txt, inset, plate, para } = D0();
        const J = joined();
        if (!J.length) {
          panel(ctx, 120, 90, 240, 60, { tone: 'dark' });
          txt(ctx, t(`Nobody walks with you yet.|С тобой пока никто не идёт.|Hozircha sen bilan hech kim yo'q.`), G.W / 2, 114, { size: 6.4, align: 'center', color: COL.dim, serif: true, style: 'italic' });
          return;
        }
        const id = cur(), D = DEF[id], m = PX.M(id), C2 = cells(id);
        PS.sel = cl(PS.sel, 0, C2.length - 1);
        if (PS.flash > 0) PS.flash--;
        // companion tabs
        J.forEach((k, i) => {
          const w = 70, x = 22 + i * (w + 4), on = k === id;
          plate(ctx, x, 36, w, on ? '#3a2a14' : '#1d1626', on);
          txt(ctx, t(DEF[k].name).toUpperCase(), x + w / 2, 38.6, { size: 5.2, align: 'center', color: on ? DEF[k].col : COL.dim, weight: 700, serif: true });
          HIT.push({ x, y: 34, w, h: 15, click: () => { PS.who = i; PS.sel = 0; PS.menu = null; sfx('ui_move'); } });
        });
        // left: the figure, role, mood, the order
        panel(ctx, 16, 54, 132, 190, { tone: 'dark' });
        ctx.save(); ctx.imageSmoothingEnabled = false; ctx.drawImage(figure(id), 0, 0, 84, 84, -4, -6, 84 * 1.5, 84 * 1.5); ctx.restore();
        const ax = 104;
        txt(ctx, t(D.name), ax, 60, { size: 8, color: D.col, weight: 700, serif: true });
        para(ctx, t(D.role), ax, 70, 42, { size: 4.2, color: COL.cream, lh: 5.4 });
        const a = PARTY.actor(id);
        const hpTxt = m.out ? t(PX.gen(id, `out until rest|выбыл до привала|dam olguncha safdan chiqdi`, `out until rest|выбыла до привала|dam olguncha safdan chiqdi`)) : a ? (a.downed ? t(`down|лежит без сил|yiqilgan`) : Math.round(a.hp) + '/' + a.maxHp) : t(`not with you now|сейчас не с тобой|hozir sen bilan emas`);
        txt(ctx, t(`Health|Здоровье|Sog'liq`), ax, 84, { size: 3.8, color: COL.dim }); txt(ctx, hpTxt, ax, 89, { size: 4.6, color: COL.cream, weight: 600 });
        txt(ctx, t(`Mood|Настроение|Kayfiyat`), ax, 97, { size: 3.8, color: COL.dim }); txt(ctx, t(PARTY.MOOD_NAME[PARTY.mood(id)]), ax, 102, { size: 4.6, color: COL.goldL, weight: 600 });
        txt(ctx, tf(`{n} points|Очков: {n}|{n} ochko`, { n: PARTY.points(id) }), ax, 110, { size: 4.6, color: PARTY.points(id) > 0 ? COL.goldL : COL.dim, weight: 600 });
        // the order
        inset(ctx, 22, 119, 120, 25, { fill: 'rgba(20,14,28,0.9)' });
        txt(ctx, tf(`Order · key {k}|Приказ · клавиша {k}|Buyruq · {k} tugmasi`, { k: D.keyN }) + '  ·  ' + tf(`{n} s|{n} с|{n} s`, { n: D.skill.cd }), 26, 121, { size: 3.7, color: COL.dim });
        txt(ctx, t(D.skill.name), 26, 126, { size: 5, color: D.col, weight: 700 });
        para(ctx, t(D.skill.desc), 26, 132.5, 112, { size: 3.6, color: COL.cream, lh: 4.4, maxLines: 2 });
        // stance and gear
        txt(ctx, t(`Stance|Стойка|Holat`), 24, 145, { size: 3.8, color: COL.dim });
        txt(ctx, t(`Gear|Снаряжение|Jihoz`), 24, 190.5, { size: 3.8, color: COL.dim });
        C2.forEach((c0, i) => {
          const sel = i === PS.sel && !PS.menu;
          if (c0.kind === 'stance') {
            const on = m.stance === c0.s;
            inset(ctx, c0.x, c0.y, c0.w, c0.h, { fill: on ? 'rgba(90,58,20,0.9)' : 'rgba(12,8,18,0.85)', stroke: sel ? COL.goldL : on ? COL.gold : 'rgba(226,180,82,0.3)', glow: sel ? 'rgba(255,231,166,0.6)' : null });
            txt(ctx, t(PARTY.STANCE_NAME[c0.s]), c0.x + c0.w / 2, c0.y + 3, { size: 4, align: 'center', color: on ? COL.goldL : COL.dim, weight: on ? 700 : 500 });
          } else if (c0.kind === 'gear') {
            const e = PARTY.gearOf(id, c0.g), d = e && G.Items.defs[e.id];
            inset(ctx, c0.x, c0.y, c0.w, c0.h, { stroke: sel ? COL.goldL : 'rgba(226,180,82,0.35)', glow: sel ? 'rgba(255,231,166,0.6)' : null });
            if (d && d.icon) { ctx.save(); ctx.translate(c0.x + c0.w / 2 - 6, c0.y + 3); ctx.imageSmoothingEnabled = false; try { d.icon(ctx, 12, e); } catch (x) { /* ignore */ } ctx.restore(); }
            else txt(ctx, '—', c0.x + c0.w / 2, c0.y + 5, { size: 6, align: 'center', color: '#5a4c60' });
            txt(ctx, t({ weapon: `Weapon|Оружие|Qurol`, armour: `Armour|Броня|Sovut`, charm: `Charm|Оберег|Tumar` }[c0.g]), c0.x + c0.w / 2, c0.y + 18, { size: 3.5, align: 'center', color: COL.dim });
          } else {
            const n = c0.n, b = D.branches[c0.bi], r = PARTY.rank(id, n[0]), why = PARTY.whyNot(id, n[0]);
            const key = c0.i === 5, can = !why;
            const fill = r ? 'rgba(52,40,20,0.95)' : can ? 'rgba(24,30,22,0.92)' : 'rgba(12,8,18,0.85)';
            inset(ctx, c0.x, c0.y, c0.w, c0.h, { fill, stroke: sel ? COL.goldL : r ? b.col : key ? 'rgba(201,180,255,0.5)' : 'rgba(226,180,82,0.28)', glow: sel ? 'rgba(255,231,166,0.6)' : PS.flash && r && sel ? b.col : null, lw: key ? 0.7 : 0.45 });
            // a small glyph: filled diamond learned, ring available, lock for a story key
            const gx = c0.x + 7, gy = c0.y + c0.h / 2;
            ctx.save();
            ctx.beginPath(); ctx.moveTo(gx, gy - 4); ctx.lineTo(gx + 4, gy); ctx.lineTo(gx, gy + 4); ctx.lineTo(gx - 4, gy); ctx.closePath();
            ctx.fillStyle = r ? b.col : '#120c18'; ctx.fill(); ctx.lineWidth = 0.6; ctx.strokeStyle = r || can ? b.col : '#4a3c50'; ctx.stroke();
            if (key && !r && why === 'story') { ctx.fillStyle = '#c9b4ff'; ctx.fillRect(gx - 1.2, gy - 0.5, 2.4, 2); ctx.strokeStyle = '#c9b4ff'; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.arc(gx, gy - 0.6, 1.1, Math.PI, 0); ctx.stroke(); }
            ctx.restore();
            txt(ctx, t(n[1]), c0.x + 14, c0.y + 2.4, { size: 4.2, color: r ? COL.goldL : can ? COL.cream : '#8a7c90', weight: r || key ? 700 : 500 });
            txt(ctx, r ? t(`learned|изучено|o'rganildi`) : key ? t(`key node|ключевой узел|kalit tugun`) : can ? t(`can learn|можно изучить|o'rgansa bo'ladi`) : '', c0.x + 14, c0.y + 9.6, { size: 3.3, color: r ? b.col : key ? '#c9b4ff' : COL.good });
          }
          HIT.push({ x: c0.x, y: c0.y, w: c0.w, h: c0.h, hover: () => { if (!PS.menu) PS.sel = i; }, click: () => { if (PS.menu) return; PS.sel = i; activate(id, c0); }, right: () => { if (c0.kind === 'gear' && PARTY.gearOf(id, c0.g)) { PARTY.unequip(id, c0.g); sfx('ui_back'); } } });
        });
        // branch titles
        D.branches.forEach((b, bi) => {
          const x = 160 + bi * 104;
          txt(ctx, t(b.name).toUpperCase(), x + 48, 48.5, { size: 4.8, align: 'center', color: b.col, weight: 700, serif: true });
          txt(ctx, PARTY.branchPoints(id, bi) + '/5', x + 96, 48.8, { size: 3.8, align: 'right', color: COL.dim });
          ctx.fillStyle = 'rgba(226,180,82,0.25)'; ctx.fillRect(x + 6, 56, 84, 0.4); ctx.fillRect(x + 6, 166.5, 84, 0.4);
        });
        // details of the selected cell
        const s0 = C2[PS.sel];
        panel(ctx, 160, 196, 304, 46, { tone: 'dark' });
        if (s0 && s0.kind === 'node') {
          const n = s0.n, why = PARTY.whyNot(id, n[0]);
          txt(ctx, t(n[1]), 168, 200, { size: 6, color: D.branches[s0.bi].col, weight: 700, serif: true });
          para(ctx, t(n[2]), 168, 209, 288, { size: 4.6, color: COL.cream, lh: 5.8, maxLines: 3 });
          txt(ctx, why === 'learned' ? t(`Learned.|Изучено.|O'rganilgan.`) : why ? whyText(id, s0, why) : t(`Enter — learn (1 point)|Enter — изучить (1 очко)|Enter — o'rganish (1 ochko)`), 168, 231, { size: 4, color: why && why !== 'learned' ? '#b8a0a8' : COL.good, style: 'italic' });
        } else if (s0 && s0.kind === 'gear') {
          const e = PARTY.gearOf(id, s0.g);
          txt(ctx, e ? itemName(e) : t(`Empty slot|Пустой слот|Bo'sh joy`), 168, 200, { size: 6, color: COL.goldL, weight: 700, serif: true });
          const hint = s0.g === 'weapon' ? tf(`Their weapon: {w}. It changes the damage of every blow.|Своё оружие: {w}. От него зависит урон каждого удара.|O'z quroli: {w}. Har zarbaning kuchi shunga bog'liq.`, { w: t(D.weaponName) })
            : s0.g === 'armour' ? t(`A body piece from your bags: it takes the edge off blows.|Нагрудная броня из твоих сумок: смягчает удары.|Xurjunlaringdagi ko'krak sovuti: zarbalarni yumshatadi.`)
              : t(`One charm: a little more health and its resistances.|Один оберег: немного здоровья и его стойкость к напастям.|Bitta tumar: biroz sog'liq va uning himoyasi.`);
          para(ctx, hint, 168, 209, 288, { size: 4.6, color: COL.cream, lh: 5.8, maxLines: 2 });
          txt(ctx, t(`Enter — choose · X — take off|Enter — выбрать · X — снять|Enter — tanlash · X — yechish`), 168, 231, { size: 4, color: COL.dim, style: 'italic' });
        } else if (s0 && s0.kind === 'stance') {
          txt(ctx, t(PARTY.STANCE_NAME[s0.s]), 168, 200, { size: 6, color: COL.goldL, weight: 700, serif: true });
          para(ctx, t(PARTY.STANCE_DESC[s0.s]), 168, 209, 288, { size: 4.6, color: COL.cream, lh: 5.8, maxLines: 2 });
          txt(ctx, t(`In the field: tap V for the next stance, hold V for the wheel.|В поле: V — следующая стойка, удерживай V — колесо стоек.|Maydonda: V — keyingi holat, V ni bosib tursang — holatlar g'ildiragi.`), 168, 231, { size: 4, color: COL.dim, style: 'italic' });
        }
        // the gear menu
        if (PS.menu) {
          const M2 = PS.menu, h = 14 + M2.opts.length * 9;
          panel(ctx, 40, 120, 200, Math.min(120, h), {});
          M2.opts.slice(0, 12).forEach((o, i) => {
            const y = 126 + i * 9, on = i === M2.sel;
            if (on) inset(ctx, 46, y - 1.5, 188, 8.5, { fill: 'rgba(90,58,20,0.9)', stroke: COL.goldL });
            txt(ctx, o.label, 50, y, { size: 4.4, color: on ? COL.goldL : o.off ? COL.bad : COL.cream, weight: on ? 700 : 500 });
            HIT.push({ x: 46, y: y - 1.5, w: 188, h: 8.5, hover: () => { M2.sel = i; }, click: () => { M2.sel = i; UI.EXT.party.key('ok'); } });
          });
        }
      }
    };
    PX.drawFigureFake = figure;
  }
  // levels: a hint when companion points wait (on the field, small)
  G.Events.on('levelUp', () => { if (PARTY.active().length && once('party_lvl_hint')) toast(t(`Companions learn too — [O]|Спутники тоже растут — [O]|Hamrohlar ham o'smoqda — [O]`), '#e8d8a8'); });
}
