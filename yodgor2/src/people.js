/* Ёдгор v2 — люди. Пиксельные фигуры NPC того же уровня, что и герой:
   разные телосложения (старики, дети, огромный Алп, женщины в многослойных платьях и
   платках, Певцы в высоких белых шапках, стража Дивана в золочёной броне, Тилла-бек в парче,
   люди в масках), дыхание, перенос веса, жесты при разговоре, узоры ткани (абр/икат, сюзане,
   парча, полосы), фонари, поворот к герою.
   API прежний: G.ObjArt.person(ctx, obj) / G.ObjArt.personFx; obj.look — ключ LOOKS или объект
   с теми же полями; obj.talking, obj.face, obj.lamp, obj.phase, obj.t, obj.alpha, obj.rim.
   Кадры запекаются один раз (A.bake: контур + контровой свет) и кэшируются по ключу. */
(function () {
  'use strict';
  const G = window.G;
  if (!G || !G.Art || !G.ObjArt) return;
  const A = G.Art;

  // ---------------------------------------------------------------- colour helpers
  const hex2 = h => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const rgb = (r, g, b) => '#' + ((1 << 24) | (Math.max(0, Math.min(255, Math.round(r))) << 16) | (Math.max(0, Math.min(255, Math.round(g))) << 8) | Math.max(0, Math.min(255, Math.round(b)))).toString(16).slice(1);
  const shade = (h, k) => { const [r, g, b] = hex2(h); return rgb(r * k, g * k, b * k); };
  const mix = (a, b, t) => { const p = hex2(a), q = hex2(b); return rgb(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t); };
  // light = brighter and a touch warmer; dark = darker and a touch cooler (hue-shifted ramps)
  const lite = (h, k = 0.28) => mix(shade(h, 1 + k), '#ffe6b0', 0.12);
  const dark = (h, k = 0.66) => mix(shade(h, k), '#1a1438', 0.18);
  const grey = h => { const [r, g, b] = hex2(h); const l = r * 0.3 + g * 0.55 + b * 0.15; return rgb(l * 0.62 + r * 0.38, l * 0.62 + g * 0.38, l * 0.66 + b * 0.36); };

  // ---------------------------------------------------------------- looks
  // Old keys/fields are kept. New optional fields: body (man|old|woman|child|girl|huge|noble|
  // guard|hound|singer|rebel), pat (ikat|suzani|brocade|stripes|atlas|patch|plain), patA/patB,
  // outer (a short over-garment colour), sash, lamp, tall.
  const LOOKS = {
    tailman: { body: 'man', robe: '#5a4636', trim: '#8a6a4a', skin: '#c8946a', head: 'doppi', headC: '#1c1a1e', headC2: '#e8e0cc', beard: 'short', pat: 'patch', sash: '#7a5a3a' },
    tailwoman: { body: 'woman', robe: '#4a3a46', trim: '#7a5a6a', skin: '#c8946a', head: 'scarf', headC: '#6a4a3a', headC2: '#a8805a', pat: 'atlas', patA: '#7a4a5a', patB: '#a8805a', outer: '#3a2c30' },
    widow: { body: 'woman', robe: '#3a2c2a', trim: '#5a4640', skin: '#b98a63', head: 'scarf', headC: '#2a2228', headC2: '#4a3e46', bent: 1, pat: 'plain', outer: '#2a2024' },
    hollow: { body: 'man', robe: '#4e4a44', trim: '#6a645a', skin: '#a8a49a', head: 'bare', hair: '#3a3634', hollow: 1, pat: 'patch' },
    alp: { body: 'huge', robe: '#4a4038', trim: '#7a6248', skin: '#b0a294', head: 'bare', hair: '#2a2420', scale: 1.22, scar: 1, hollow: 1, beard: 'short', pat: 'patch', sash: '#5a3a2a' },
    child: { body: 'child', robe: '#6a5236', trim: '#a07a4a', skin: '#d0a07a', head: 'doppi', headC: '#1c1a1e', headC2: '#e8e0cc', scale: 0.7, pat: 'plain' },
    girl: { body: 'girl', robe: '#7a3a4a', trim: '#b05a6a', skin: '#d0a07a', head: 'bare', hair: '#1a1210', braids: 1, scale: 0.72, pat: 'atlas', patA: '#c0586a', patB: '#e0b050' },
    caravan: { body: 'man', robe: '#6a4a2a', trim: '#c08a3a', skin: '#b8865c', head: 'turban', headC: '#e8dcc0', beard: 'long', beardC: '#3a2a1a', stripes: '#8a6a3a', pat: 'stripes', sash: '#3a5a6a' },
    singer: { body: 'singer', robe: '#2e2a5a', trim: '#e8e0f0', skin: '#c4916a', head: 'hat', headC: '#e8e0f0', headC2: '#2e2a5a', pat: 'plain', sash: '#e8e0f0' },
    shirin: { body: 'woman', robe: '#3a2f6e', trim: '#e2b452', skin: '#c4916a', head: 'scarf', headC: '#ece5d6', headC2: '#c8bfae', tall: 1, pat: 'suzani', patA: '#e2b452', patB: '#8a3a4a', outer: '#2a2250' },
    nargiza: { body: 'woman', robe: '#2a8f94', trim: '#e8f4ee', skin: '#d6a57c', head: 'doppi', headC: '#262634', headC2: '#e8f4ee', hair: '#17110f', braids: 1, pat: 'ikat', patA: '#e8f4ee', patB: '#1f6a70', outer: '#1f5a6e' },
    divan: { body: 'man', robe: '#8a1e2a', trim: '#e8b850', skin: '#c38f66', head: 'turban', headC: '#f2ead8', beard: 'short', beardC: '#17100c', feather: '#f2c14a', pat: 'ikat', patA: '#c0404a', patB: '#e8b850', sash: '#e8b850' },
    tillabek: { body: 'noble', robe: '#7a1424', trim: '#f0c040', skin: '#c38f66', head: 'turban', headC: '#fff4dc', beard: 'short', beardC: '#17100c', feather: '#f2c14a', scale: 1.08, gem: '#2fb3b8', pat: 'brocade', patA: '#c89a38', patB: '#a8303e', sash: '#f0c040' },
    guard: { body: 'guard', robe: '#6a1a22', trim: '#c8a040', skin: '#b8865c', head: 'helmet', headC: '#a89870', beard: 'short', beardC: '#2a1a10', spear: 1, armor: '#c8a040' },
    hound: { body: 'hound', robe: '#5a3a14', trim: '#f0c040', skin: '#b8865c', head: 'helmet', headC: '#d8b040', beard: 'none', scale: 1.15, armor: '#c8a040' },
    bride: { body: 'woman', robe: '#e8dcd0', trim: '#c03040', skin: '#d0a07a', head: 'veil', headC: '#c03040', headC2: '#f0c040', pat: 'suzani', patA: '#c03040', patB: '#f0c040' },
    gulnora: { body: 'woman', robe: '#5a6a4a', trim: '#8a9a6a', skin: '#d0a07a', head: 'scarf', headC: '#8a4a3a', headC2: '#c8945a', pat: 'atlas', patA: '#8a9a6a', patB: '#c8945a', outer: '#3a4a34' },
    rebel: { body: 'rebel', robe: '#22202a', trim: '#4a4656', skin: '#c08a62', head: 'hood', headC: '#2a2030', mask: '#e8e0d0', pat: 'plain' },
    oydin: { body: 'rebel', robe: '#17121a', trim: '#2a2030', skin: '#c08a62', head: 'hood', headC: '#2a2030', scar: 1, glow: '#7fe8dc', pat: 'plain' },
    elder: { body: 'old', robe: '#4a5a3a', trim: '#c9b48a', skin: '#c08a62', head: 'turban', headC: '#e8e0cc', beard: 'long', beardC: '#e8e4dc', staff: 1, pat: 'stripes', stripes: '#5e6e4a', sash: '#c9b48a' },
    auctioneer: { body: 'man', robe: '#a83a2a', trim: '#f0c040', skin: '#c8946a', head: 'turban', headC: '#f2ead8', beard: 'short', beardC: '#2a1810', pat: 'suzani', patA: '#f0c040', patB: '#2a6a8a', sash: '#2a6a8a', belly: 1 },
    inspector: { body: 'singer', robe: '#2e2a5a', trim: '#e8e0f0', skin: '#c4916a', head: 'hat', headC: '#e8e0f0', headC2: '#2e2a5a', beard: 'short', beardC: '#3a2a20', staff: 1, pat: 'plain', sash: '#e8e0f0' },
    mother: { body: 'woman', robe: '#5a3a5a', trim: '#8a6a8a', skin: '#c8946a', head: 'scarf', headC: '#7a3a3a', headC2: '#c08a5a', pat: 'atlas', patA: '#8a5a7a', patB: '#c08a5a', outer: '#3e2a3e' }
  };

  // ---------------------------------------------------------------- spec (derived, cached)
  const specCache = new WeakMap();
  function inferBody(L) {
    if (L.body) return L.body;
    const sc = L.scale || 1;
    if (sc < 0.8) return L.braids ? 'girl' : 'child';
    if (sc >= 1.14) return L.armor ? 'hound' : 'huge';
    if (L.armor || L.spear || L.head === 'helmet') return 'guard';
    if (L.head === 'hood') return 'rebel';
    if (L.head === 'scarf' || L.head === 'veil') return 'woman';
    if (L.head === 'hat') return 'singer';
    if (L.gem || sc > 1.04) return 'noble';
    if (L.beard === 'long' && L.staff) return 'old';
    return 'man';
  }
  // body proportions (feet at y=0, facing +x). fy = forehead row, sh = shoulder row
  const BODY = {
    man:    { fy: -25, sh: -19, waist: -11, hem: -3, sw: 4, ww: 4, hw: 5, legs: 'boots', arm: 2 },
    old:    { fy: -23, sh: -18, waist: -10, hem: -2, sw: 4, ww: 4, hw: 5, legs: 'boots', arm: 2, bend: 1 },
    singer: { fy: -26, sh: -20, waist: -12, hem: -1, sw: 4, ww: 3, hw: 5, legs: 'slip', arm: 2 },
    noble:  { fy: -26, sh: -20, waist: -11, hem: -2, sw: 5, ww: 6, hw: 6, legs: 'boots', arm: 2 },
    guard:  { fy: -25, sh: -19, waist: -11, hem: -4, sw: 5, ww: 4, hw: 5, legs: 'boots', arm: 2 },
    hound:  { fy: -29, sh: -22, waist: -13, hem: -5, sw: 6, ww: 5, hw: 6, legs: 'boots', arm: 3 },
    huge:   { fy: -31, sh: -24, waist: -14, hem: -4, sw: 7, ww: 6, hw: 7, legs: 'boots', arm: 3 },
    woman:  { fy: -24, sh: -18, waist: -11, hem: -1, sw: 3, ww: 3, hw: 5, legs: 'dress', arm: 2 },
    rebel:  { fy: -24, sh: -18, waist: -10, hem: -6, sw: 4, ww: 3, hw: 4, legs: 'boots', arm: 2 },
    child:  { fy: -16, sh: -11, waist: -6, hem: -2, sw: 3, ww: 3, hw: 3, legs: 'boots', arm: 1, small: 1 },
    girl:   { fy: -17, sh: -12, waist: -7, hem: -1, sw: 3, ww: 3, hw: 4, legs: 'dress', arm: 1, small: 1 }
  };
  function spec(L) {
    let S = specCache.get(L);
    if (S) return S;
    const type = inferBody(L), B = Object.assign({}, BODY[type] || BODY.man);
    if (L.tall) { B.fy -= 2; B.sh -= 2; B.waist -= 1; }
    if (L.bent && type === 'woman') { B.bend = 1; B.fy += 2; B.sh += 1; }
    if (L.hollow && type === 'man') { B.bend = 1; B.fy += 1; }
    if (type === 'woman' || type === 'girl') B.hw += 1;
    const hol = !!L.hollow, g = hol ? grey : (h => h);
    const robe = g(L.robe || '#5a4636');
    S = Object.assign(B, {
      type, L, hol,
      robe, robeD: dark(robe), robeL: lite(robe), robeX: dark(robe, 0.45),
      trim: g(L.trim || lite(robe, 0.5)), trimD: dark(g(L.trim || robe), 0.7),
      skin: hol ? mix(L.skin || '#c8946a', grey(L.skin || '#c8946a'), 0.5) : (L.skin || '#c8946a'),
      skinD: dark(hol ? mix(L.skin || '#c8946a', grey(L.skin || '#c8946a'), 0.5) : (L.skin || '#c8946a'), 0.8),
      hair: g(L.hair || '#1a1210'), beardC: g(L.beardC || L.hair || '#2a1810'),
      headC: g(L.headC || '#1c1a1e'), headC2: g(L.headC2 || lite(L.headC || '#1c1a1e', 0.4)),
      pat: L.pat || (L.stripes ? 'stripes' : type === 'noble' ? 'brocade' : 'plain'),
      patA: g(L.patA || L.stripes || lite(robe, 0.4)), patB: g(L.patB || L.trim || lite(robe, 0.6)),
      outer: L.outer ? g(L.outer) : null,
      sash: L.sash ? g(L.sash) : null,
      armor: L.armor ? g(L.armor) : null
    });
    specCache.set(L, S);
    return S;
  }

  // ---------------------------------------------------------------- pixel painter
  let c = null;
  const P = (x, y, col) => { c.fillStyle = col; c.fillRect(x, y, 1, 1); };
  const Rr = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const line = (x0, y0, x1, y1, col, w = 1) => A.thick(c, x0, y0, x1, y1, w, col);

  function patColor(S, x, y, base) {
    switch (S.pat) {
      case 'ikat': {
        const j = ((y * 7) % 5 === 0) ? 1 : 0, u = (((x + j) % 6) + 6) % 6, v = ((y % 8) + 8) % 8;
        const w = v === 0 || v === 7 ? -1 : v === 1 || v === 6 ? 0.5 : v === 2 || v === 5 ? 1 : 1.5;
        if (Math.abs(u - 2.5) <= w) return S.patA;
        if ((v === 0 || v === 7) && (u === 2 || u === 3)) return S.patB;
        return base;
      }
      case 'atlas': { // khan-atlas: wavy vertical bands
        const z = (((y >> 1) % 2) + 2) % 2, u = (((x + z) % 5) + 5) % 5;
        return u === 0 ? S.patA : u === 1 ? S.patB : u === 3 ? S.patA : base;
      }
      case 'suzani': { // round medallions with a contrasting heart
        const u = (((x) % 6) + 6) % 6, v = (((y + 2) % 7) + 7) % 7;
        if (u === 2 && v === 3) return S.patB;
        if ((u === 2 && (v === 2 || v === 4)) || (v === 3 && (u === 1 || u === 3))) return S.patA;
        return base;
      }
      case 'brocade': {
        const u = ((x % 4) + 4) % 4, v = ((y % 4) + 4) % 4;
        if ((u === 0 && v === 0) || (u === 2 && v === 2)) return S.patA;
        if ((u === 1 && v === 1) || (u === 3 && v === 3)) return S.patB;
        return base;
      }
      case 'stripes': return ((x % 3) + 3) % 3 === 0 ? S.patA : base;
      case 'patch': { const u = ((x + 40) % 9), v = ((y + 40) % 11); return (u >= 5 && u <= 7 && v >= 2 && v <= 4) ? S.robeL : base; }
      default: return base;
    }
  }

  // garment rows: from y0 to y1, half widths by row via fn, centre offset via cxf
  function garment(S, y0, y1, wf, cxf, colors, o = {}) {
    for (let y = y0; y <= y1; y++) {
      const [wl, wr] = wf(y), cx = cxf(y), xl = cx - wl, xr = cx + wr - 1;
      for (let x = xl; x <= xr; x++) {
        let col;
        if (o.hem && y === y1) col = (x % 3 === 0) ? colors.trim : colors.trimD;
        else if (x === xl) col = colors.X;
        else if (x === xl + 1) col = colors.D;
        else if (x === xr) col = o.frontTrim ? colors.trim : colors.L;
        else if (o.fold && x === cx - 1 && y > o.fold && (y & 1)) col = colors.D;
        else if (o.hem && y >= y1 - 2 && ((x + y) & 1)) col = colors.D;
        else if (y > y0 && y <= y0 + 3 && x === xr - 1) col = colors.L;
        else col = o.pat === false ? colors.B : patColor(S, x - cx, y, colors.B);
        P(x, y, col);
      }
    }
  }

  // ---------------------------------------------------------------- heads
  function face(S, cx, fy, f, o = {}) {
    const sk = S.skin, skD = S.skinD, small = S.small, big = S.type === 'huge' || S.type === 'hound';
    const rows = small ? 5 : big ? 7 : 6;
    Rr(cx - 2, fy, 5, rows, sk);
    if (big) { Rr(cx - 3, fy + 1, 1, rows - 1, skD); P(cx - 2, fy + rows - 1, skD); }
    Rr(cx - 2, fy + rows - 1, 2, 1, skD);
    P(cx - 2, fy + 2, skD); // ear
    if (!small && !o.noNose && !S.hol) P(cx + 3, fy + 3, sk);
    const eye = S.hol ? '#e8e4dc' : '#1a1012';
    if (f.blink && !S.hol) P(cx + 1, fy + 2, skD); else P(cx + 1, fy + 2, eye);
    if (!small && S.type !== 'woman' && S.type !== 'girl') P(cx, fy + 1, S.hair);
    if (S.hol) { P(cx, fy + 3, skD); P(cx + 1, fy + 3, skD); }
    if (!small) P(cx + 2, fy + (big ? 5 : 4), skD);
    if (S.L.scar) { P(cx + 2, fy + 1, '#8a3a2e'); P(cx + 2, fy + 3, '#8a3a2e'); }
    // beard
    const bc = S.beardC, bd = S.L.beard;
    if (bd === 'short' || bd === 'long') {
      const by = fy + (big ? 5 : 4);
      Rr(cx - 1, by, 4, 2, bc); P(cx - 1, by - 1, bc);
      if (big) Rr(cx - 2, by, 1, 2, bc);
      if (bd === 'long') { Rr(cx - 1, fy + 6, 4, 1, bc); Rr(cx, fy + 7, 3, 1, bc); Rr(cx, fy + 8, 2, 1, bc); P(cx + 1, fy + 9, bc); P(cx + 1, fy + 6, lite(bc, 0.2)); }
    }
  }
  function backHair(S, cx, fy) { Rr(cx - 3, fy - 1, 1, 4, S.hair); Rr(cx - 2, fy - 2, 4, 2, S.hair); }

  function head(S, cx, fy, f) {
    const L = S.L, h1 = S.headC, h2 = S.headC2, hD = dark(h1, 0.72), hL = lite(h1, 0.18);
    // braids hang behind the head, drawn first
    if (L.braids) {
      const len = S.small ? 8 : 13;
      line(cx - 3, fy + 1, cx - 4, fy + len, S.hair); line(cx - 2, fy + 2, cx - 3, fy + len + 1, S.hair);
      P(cx - 4, fy + len + 1, S.trim); P(cx - 3, fy + len + 2, S.trim);
    }
    switch (L.head) {
      case 'scarf': case 'hood': case 'veil': {
        const isHood = L.head === 'hood', isVeil = L.head === 'veil';
        const dropTo = isVeil ? S.waist + 2 : isHood ? S.sh + 3 : S.sh + 5;
        // drape down the back
        for (let y = fy - 1; y <= dropTo; y++) {
          const w = y < fy + 4 ? 2 : 3, x0 = cx - 3 - (y > fy + 5 ? 1 : 0);
          Rr(x0, y, w, 1, y === dropTo ? hD : h1);
          P(x0, y, hD);
          if (!isHood && ((y + x0) % 3 === 0)) P(x0 + 1, y, h2);
        }
        face(S, cx, fy, f, { noNose: isHood });
        // crown and framing
        Rr(cx - 3, fy - 3, 6, 1, h1); Rr(cx - 3, fy - 2, 7, 2, h1);
        P(cx - 3, fy - 3, hD);
        Rr(cx - 3, fy, 2, 5, h1);
        P(cx + 3, fy - 1, hL);
        if (isHood) { Rr(cx - 2, fy, 5, 1, h1); P(cx + 3, fy, h1); Rr(cx - 1, fy + 1, 2, 3, S.skinD); P(cx - 4, fy - 2, h1); }
        else { P(cx - 1, fy, h1); Rr(cx - 2, fy - 2, 5, 1, ((cx) % 2) ? h2 : hL); }
        if (isVeil) { Rr(cx - 2, fy - 1, 5, 1, h2); P(cx - 1, fy - 1, '#fff2c0'); P(cx + 1, fy - 1, '#fff2c0'); Rr(cx - 3, fy - 4, 5, 1, h1); }
        if (L.mask) { Rr(cx - 1, fy, 4, 5, L.mask); P(cx + 1, fy + 2, '#1a1012'); P(cx + 2, fy + 4, shade(L.mask, 0.7)); P(cx, fy + 1, '#a8343e'); P(cx, fy + 3, '#a8343e'); }
        // the lower edge of a scarf wraps under the chin
        if (!isHood && !isVeil) Rr(cx - 2, fy + 6, 3, 1, h1);
        break;
      }
      case 'turban': {
        face(S, cx, fy, f);
        const big = S.type === 'noble' ? 1 : 0;
        const tw = 8 + big, tx = cx - 4 - big;
        Rr(tx + 1, fy - 5 - big, tw - 2, 1, h1);
        Rr(tx, fy - 4 - big, tw, 4 + big, h1);
        Rr(tx + 1, fy, tw - 3, 1, h1);
        for (let y = fy - 4 - big; y <= fy; y++) for (let x = tx; x < tx + tw; x++) if (((x - y) % 3 + 3) % 3 === 0 && y > fy - 5 - big) P(x, y, hD);
        Rr(tx, fy - 1, tw - 1, 1, hD);
        P(tx + tw - 2, fy - 4 - big, hL); P(tx + tw - 3, fy - 5 - big, hL);
        P(tx, fy, hD); P(tx, fy + 1, hD); // tail
        if (L.gem) { P(cx + 2, fy - 3, L.gem); P(cx + 2, fy - 2, shade(L.gem, 0.7)); P(cx + 3, fy - 3, '#f0c040'); }
        if (L.feather) { line(cx + 1, fy - 5 - big, cx + 2, fy - 9 - big, L.feather); P(cx + 3, fy - 10 - big, L.feather); P(cx + 1, fy - 7 - big, '#fff2c0'); }
        break;
      }
      case 'hat': { // Singers: tall white felt hat with an indigo band
        face(S, cx, fy, f);
        backHair(S, cx, fy); Rr(cx - 2, fy - 1, 5, 1, S.hair);
        for (let k = 0; k < 9; k++) { const y = fy - 2 - k, w = k < 3 ? 6 : k < 7 ? 5 : 4, x0 = cx - 3 + (k >= 3 ? 0 : 0) + (k >= 7 ? 1 : 0); Rr(x0, y, w, 1, h1); P(x0, y, hD); P(x0 + w - 1, y, hL); }
        Rr(cx - 3, fy - 3, 6, 1, h2); Rr(cx - 3, fy - 2, 6, 1, dark(h1, 0.85));
        P(cx - 1, fy - 7, dark(h1, 0.85)); P(cx, fy - 9, dark(h1, 0.85));
        break;
      }
      case 'helmet': {
        face(S, cx, fy, f);
        const gold = S.type === 'hound';
        // aventail (mail at the back of the neck)
        for (let y = fy; y <= fy + 5; y++) for (let x = cx - 3; x <= cx - 2; x++) P(x, y, (x + y) % 2 ? dark(h1, 0.7) : h1);
        Rr(cx - 3, fy - 4, 6, 4, h1); Rr(cx - 2, fy - 5, 4, 1, h1);
        P(cx - 3, fy - 4, hD); Rr(cx - 3, fy - 1, 7, 1, dark(h1, 0.75));
        P(cx + 1, fy - 4, hL); P(cx + 2, fy - 3, hL);
        Rr(cx, fy - 7, 1, 2, h1); P(cx, fy - 8, lite(h1, 0.5));
        if (gold) { Rr(cx + 2, fy, 1, 3, h1); Rr(cx - 2, fy - 2, 4, 1, '#c04050'); }
        else P(cx - 1, fy - 2, '#c04050');
        break;
      }
      case 'doppi': {
        if (!L.braids) backHair(S, cx, fy);
        else { Rr(cx - 3, fy - 1, 1, 3, S.hair); Rr(cx - 2, fy - 1, 4, 1, S.hair); }
        face(S, cx, fy, f);
        const top = fy - (S.small ? 3 : 4);
        Rr(cx - 2, top, 5, 1, h1); Rr(cx - 3, top + 1, 6, fy - top - 1, h1);
        P(cx - 2, top + 1, h2); P(cx + 1, top + 1, h2); P(cx - 1, top + 2, h2);
        Rr(cx - 3, fy - 1, 6, 1, dark(h1, 0.8));
        P(cx - 3, top + 1, hD);
        break;
      }
      default: { // bare head
        face(S, cx, fy, f);
        Rr(cx - 2, fy - 2, 5, 2, S.hair); Rr(cx - 3, fy - 1, 1, S.small ? 3 : 4, S.hair); P(cx + 2, fy - 1, S.hair);
        if (S.type === 'huge') { Rr(cx - 3, fy - 2, 6, 1, S.hair); Rr(cx - 3, fy - 3, 5, 1, S.hair); }
      }
    }
  }

  // ---------------------------------------------------------------- the figure
  function figure(S, f) {
    const L = S.L;
    const b = f.breath, sft = f.shift;
    const sh = S.sh - b, fy = S.fy - b + (S.bend ? 1 : 0), waist = S.waist, hem = S.hem;
    const bend = S.bend ? 1 : 0;
    // centre per row: top leans forward when bent, weight shift moves the hips
    const cxf = y => {
      const t = Math.max(0, Math.min(1, (y - sh) / (hem - sh)));
      return Math.round((bend * 2 + sft) * (1 - t));
    };
    const top = cxf(sh), hx = top + (bend ? 1 : 0);
    const colors = { B: S.robe, D: S.robeD, L: S.robeL, X: S.robeX, trim: S.trim, trimD: S.trimD };
    const A0 = S.arm;

    // --- a cape behind the champion
    if (S.type === 'hound') {
      const cp = '#8a1e2a', cpD = '#5a1020';
      for (let y = sh; y <= hem + 2; y++) { const x0 = cxf(y) - S.sw - 1 - Math.floor((y - sh) / 6); Rr(x0, y, 3, 1, cp); P(x0, y, cpD); }
    }
    // --- far arm (hangs, darker)
    const fsx = top - S.sw + 2, fsy = sh + 2;
    line(fsx, fsy, fsx - 1, waist + 1, S.robeD, A0);
    P(fsx - 1, waist + 2, S.skinD);

    // --- staff / spear behind the near hand
    let hand = null; // near hand target
    const gst = f.gest;
    const nsx = top + S.sw - 2, nsy = sh + 2;
    if (L.staff || L.spear) hand = [nsx + 2, waist - 2];
    else if (f.lamp) hand = [nsx + 2, waist + 1];
    else if (gst === 1) hand = [nsx + 4, waist - 1];
    else if (gst === 2) hand = [nsx + 5, sh];
    else if (gst === 3) hand = [nsx + 3, sh - 1];
    else hand = [nsx + 1, waist + 2];
    if (S.hol && !L.staff) hand = [nsx + 1, waist + 3];
    if (L.spear) { line(hand[0], 0, hand[0], fy - 12, '#6a4a2a'); Rr(hand[0], fy - 16, 1, 4, '#d8dce0'); P(hand[0] - 1, fy - 13, '#d8dce0'); P(hand[0] + 1, fy - 13, '#8a929e'); P(hand[0], fy - 12, '#c04050'); }
    if (L.staff) { line(hand[0], 0, hand[0], fy - 4, '#7a4a26'); P(hand[0], fy - 5, '#a8743e'); P(hand[0] + 1, fy - 5, '#7a4a26'); }

    // --- legs and feet
    if (S.legs === 'boots') {
      const by = hem + 1;
      const back = -2 - (sft ? 1 : 0);
      Rr(back - 1, by, 3, -by, dark('#3a2a20', 0.9)); Rr(back - 1, -1, 4, 1, '#1e140e');
      Rr(1, by, 3, -by, '#4a3426'); Rr(1, -1, 4, 1, '#24180f'); P(3, by, '#6a4a32');
    } else {
      Rr(-3, -1, 3, 1, '#2a1c18'); Rr(1, -1, 3, 1, '#3a2620'); P(3, -1, S.trim);
    }

    // --- main garment
    const swF = y => {
      if (y === sh) return [S.sw - 1, S.sw - 1];
      if (y <= waist) { const t = (y - sh) / Math.max(1, waist - sh); const w = Math.round(S.sw + (S.ww - S.sw) * t + (L.belly && y > sh + 3 ? 1 : 0)); return [w, w]; }
      const t = (y - waist) / Math.max(1, hem - waist), w = Math.round(S.ww + (S.hw - S.ww) * t);
      return [w + (t > 0.6 ? 1 : 0), w];
    };
    garment(S, sh, hem, swF, cxf, colors, { hem: true, fold: waist + 1, frontTrim: S.type !== 'woman' && S.type !== 'girl' && S.type !== 'rebel' });

    // trousers under a short coat (rebels) / lozim cuffs (women)
    if (S.type === 'rebel') { Rr(-3, hem + 1, 3, -hem - 2, dark(S.robe, 0.8)); Rr(1, hem + 1, 3, -hem - 2, S.robeD); }
    if (S.legs === 'dress') { P(-2, -2, S.trim); P(2, -2, S.patB); }

    // coat opening with the shirt at the neck (men)
    if (S.type === 'man' || S.type === 'old' || S.type === 'noble' || S.type === 'singer' || S.type === 'huge') {
      for (let y = sh; y <= sh + 2; y++) { const cx = cxf(y); P(cx + 1 + (y - sh), y, S.trim); for (let x = cx + 2 + (y - sh); x <= cx + S.sw - 1; x++) P(x, y, S.hol ? '#a8a49a' : '#e2d6b8'); }
    }
    // outer garment (women's nimcha / camisole)
    if (S.outer) {
      const oD = dark(S.outer), oL = lite(S.outer, 0.2);
      garment(S, sh, waist + 2, y => { const w = swF(y); return [w[0] + (y > waist ? 1 : 0), w[1]]; }, cxf, { B: S.outer, D: oD, L: oL, X: dark(S.outer, 0.5), trim: S.trim, trimD: S.trimD }, { pat: false });
      for (let y = sh + 1; y <= waist + 2; y++) P(cxf(y) + swF(y)[1] - 2, y, S.trim);
    }
    // fur collar for the noble
    if (S.type === 'noble') { Rr(top - S.sw + 1, sh, S.sw * 2 - 1, 2, '#c8a878'); Rr(top - S.sw + 1, sh + 1, S.sw * 2 - 1, 1, '#9a7a52'); P(top + S.sw - 2, sh, '#e8d4a8'); }

    // armour
    if (S.armor) {
      const g1 = S.armor, g2 = dark(g1, 0.62), g3 = lite(g1, 0.35), g0 = dark(g1, 0.82);
      for (let y = sh + 1; y <= waist; y++) {
        const cx = cxf(y), [wl, wr] = swF(y);
        for (let x = cx - wl + 1; x <= cx + wr - 1; x++) {
          // overlapping lamellae: a bright upper lip, darker body, a shadow line every 2 rows
          const row = (y - sh) % 2, lip = row === 1;
          let col = lip ? ((x + y) % 2 ? g1 : g3) : ((x % 2) ? g0 : g2);
          if (x <= cx - wl + 2) col = lip ? g0 : g2;
          if (x === cx + wr - 1 && lip) col = g3;
          P(x, y, col);
        }
      }
      Rr(top - S.sw, sh, 3, 2, g1); P(top - S.sw, sh, g3); // pauldron
      Rr(top + S.sw - 2, sh, 3, 2, g3);
      Rr(cxf(waist) - S.ww, waist + 1, S.ww * 2, 1, '#6a4a2a'); P(cxf(waist) + 1, waist + 1, g3);
      if (S.type === 'hound') { for (let y = waist + 2; y < hem; y++) for (let x = -S.hw + 1; x < S.hw - 1; x++) if ((x + y) % 2 === 0) P(x + cxf(y), y, g2); }
      else { for (let y = waist + 2; y < hem; y++) for (let x = -S.hw + 1; x < S.hw - 1; x++) if ((x + y) % 3 === 0) P(x + cxf(y), y, '#8a8a94'); }
    }
    // sash
    if (S.sash && !S.armor) {
      const sy = waist - 1, cx = cxf(sy), w = swF(sy);
      Rr(cx - w[0], sy, w[0] + w[1], 2, S.sash); Rr(cx - w[0], sy + 1, w[0] + w[1], 1, dark(S.sash, 0.75));
      P(cx - w[0], sy, dark(S.sash, 0.6));
      Rr(cx + w[1] - 2, sy + 2, 1, 3, S.sash); P(cx + w[1] - 1, sy + 2, dark(S.sash, 0.75)); // hanging end
    }
    // a little tithe tag / tumar on many townsfolk (memory currency)
    if (L.glow) { P(top + 1, sh + 1, L.glow); P(top + 2, sh + 1, L.glow); P(top + 1, sh + 2, L.glow); }

    // --- head
    head(S, hx, fy, f);

    // --- near arm
    const W = A0;
    line(nsx, nsy, hand[0], hand[1], S.robe, W);
    if (W >= 2) line(nsx, nsy - 1, (nsx + hand[0]) / 2, (nsy + hand[1]) / 2 - 1, S.robeL, 1);
    const cfx = Math.round(nsx + (hand[0] - nsx) * 0.8), cfy = Math.round(nsy + (hand[1] - nsy) * 0.8);
    P(cfx, cfy, S.trim);
    const hs = S.type === 'huge' || S.type === 'hound' ? 3 : S.small ? 1 : 2;
    Rr(hand[0] - (hs > 1 ? 1 : 0), hand[1] - (hs > 1 ? 1 : 0), hs, hs, S.skin);
    if (gst === 2 && !L.staff && !L.spear && !f.lamp) P(hand[0] + 1, hand[1] - 2, S.skin); // open palm, fingers up

    // --- lantern (hangs from the near hand)
    let lampAt = null;
    if (f.lamp) {
      const lx = hand[0], ly = hand[1] + 1;
      P(lx, ly, '#3a2a1a'); P(lx, ly + 1, '#3a2a1a');
      Rr(lx - 1, ly + 2, 3, 1, '#6a4a2a');
      Rr(lx - 1, ly + 3, 3, 3, '#ffd27a'); P(lx, ly + 4, '#fff4d0'); P(lx - 1, ly + 3, '#e8a040');
      Rr(lx - 1, ly + 6, 3, 1, '#6a4a2a');
      lampAt = [lx, ly + 4];
    }
    return lampAt;
  }

  // ---------------------------------------------------------------- cache & draw
  const FW = 48, FH = 72, OX = 24, OY = 66;
  const frames = new Map();
  const ids = new WeakMap(); let nid = 0;
  const idOf = (look) => typeof look === 'string' ? look : (ids.get(look) || (ids.set(look, 'o' + (++nid)), ids.get(look)));
  function frame(L, look, f, flip, rimC) {
    const key = idOf(look) + '|' + (flip ? 1 : 0) + f.breath + f.shift + f.gest + (f.blink ? 1 : 0) + (f.lamp ? 1 : 0) + '|' + rimC;
    let cv = frames.get(key);
    if (cv) return cv;
    const S = spec(L);
    let lamp = null;
    cv = A.bake(FW, FH, ctx => {
      c = ctx;
      ctx.translate(OX, OY);
      if (flip) ctx.scale(-1, 1);
      lamp = figure(S, f);
      c = null;
    }, { outline: '#1a1018', rim: { color: rimC, dx: -1, dy: -1, a: 0.32 } });
    cv.lamp = lamp ? [flip ? -lamp[0] : lamp[0], lamp[1]] : null;
    if (frames.size > 1500) frames.clear();
    frames.set(key, cv);
    return cv;
  }
  const lookOf = obj => typeof obj.look === 'string' ? (LOOKS[obj.look] || LOOKS.tailman) : (obj.look || LOOKS.tailman);
  function params(obj, L) {
    const ph = (obj.phase || 0) * 0.137;
    const t = ((obj.t || 0) + (obj.phase || 0)) / 60;
    const hol = !!L.hollow;
    const f = {
      breath: Math.sin(t * (hol ? 1.1 : 1.6) + ph) > 0.2 ? 1 : 0,
      shift: Math.sin(t * (hol ? 0.7 : 0.38) + ph * 1.7) > 0.55 ? 1 : 0,
      blink: (((obj.t || 0) + (obj.phase || 0) * 13) % 230) < 7,
      gest: 0,
      lamp: !!obj.lamp
    };
    if (obj.talking && !hol) {
      const k = Math.floor(t * 2.6 + ph * 3);
      const r = Math.abs(Math.sin(k * 12.9898 + ph * 78.233) * 43758.5453) % 1;
      f.gest = r < 0.3 ? 0 : r < 0.6 ? 1 : r < 0.85 ? 2 : 3;
      f.breath = (k % 2);
    }
    return f;
  }
  function facing(obj) {
    const pl = G.world && G.world.player;
    if (obj.face) return obj.face < 0;
    if (!pl) return false;
    const dx = pl.x - obj.x;
    if (obj._flip === undefined) obj._flip = dx < 0;
    else if (dx < -5) obj._flip = true;
    else if (dx > 5) obj._flip = false;
    return obj._flip;
  }

  function drawPerson(ctx, obj) {
    const L = lookOf(obj);
    const f = params(obj, L);
    const flip = facing(obj);
    const cv = frame(L, obj.look || 'tailman', f, flip, obj.rim || '#ffe8c0');
    const x = Math.round(obj.x - OX), y = Math.round(obj.y - OY);
    const a = obj.alpha === undefined ? 1 : obj.alpha;
    if (a !== 1) ctx.globalAlpha = a;
    ctx.drawImage(cv, x, y);
    if (cv.lamp) { // live flame flicker inside the lantern
      const tt = (obj.t || 0) + (obj.phase || 0) * 7;
      const fl = Math.sin(tt * 0.31) + Math.sin(tt * 0.83 + 1.7);
      ctx.fillStyle = fl > 0.6 ? '#ffffff' : fl > -0.4 ? '#fff0b0' : '#ffb850';
      ctx.fillRect(x + OX + cv.lamp[0], y + OY + cv.lamp[1] - (fl > 0.9 ? 1 : 0), 1, 1);
    }
    if (a !== 1) ctx.globalAlpha = 1;
  }
  function drawPersonFx(ctx, obj) {
    const L = lookOf(obj);
    if (L.glow) G.Light.add(obj.x, obj.y - 20, 40, L.glow, 0.25);
    if (obj.lamp) {
      const tt = (obj.t || 0) + (obj.phase || 0) * 7;
      const fl = 0.06 * (Math.sin(tt * 0.31) + Math.sin(tt * 0.83 + 1.7));
      const flip = obj._flip;
      const S = spec(L);
      G.Light.add(obj.x + (flip ? -1 : 1) * (S.sw + 1), obj.y + S.waist + 6, 72, '#ffc070', 0.45 + fl);
    }
  }
  G.ObjArt.person = drawPerson;
  G.ObjArt.personFx = drawPersonFx;

  G.PEOPLE = { LOOKS, drawPerson, spec, _frames: frames };
})();

/* stage 7: Surayyo, the Tail's mirab — 31, practical work clothes (indigo work robe with rolled sleeves,
   a short leather vest, a sash), a terracotta headscarf tied back for work, the long hook-staff for sluices. */
(function () {
  const P = window.G && window.G.PEOPLE;
  if (P && P.LOOKS) P.LOOKS.surayyo = { body: 'woman', robe: '#2f4f74', trim: '#c9b48a', skin: '#c8946a', head: 'scarf', headC: '#b4553a', headC2: '#e0a070', tall: 1, pat: 'stripes', stripes: '#3d6690', outer: '#5e4430', sash: '#2f8a8a', staff: 1 };
})();
