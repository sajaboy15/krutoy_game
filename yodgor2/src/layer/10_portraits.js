/* =====================================================================
   Portraits. Large shapes in portrait space, facial features as exact
   pixels of the 32×32 canvas: the engine cleans the palette, and
   anti-aliased mid-tones would turn into smudges.
   ===================================================================== */
const P = {
  ell(c, x, y, rx, ry, col) { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 6.283); c.fill(); },
  rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); },
  poly(c, pts, col) { c.fillStyle = col; c.beginPath(); for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.closePath(); c.fill(); },
  line(c, x1, y1, x2, y2, w, col) { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); },
  shoulders(c, col, spread, top) { c.fillStyle = col; c.beginPath(); c.moveTo(-spread, 34); c.quadraticCurveTo(-spread * 0.76, top, 0, top); c.quadraticCurveTo(spread * 0.76, top, spread, 34); c.fill(); },
  drape(c, col) { P.poly(c, [-18, 30, -19, 2, -15, -18, -8, -28, 0, -31, 8, -28, 15, -18, 19, 2, 18, 30, 8, 22, 0, 18, -8, 22], col); },
  face(c, skin, shade) { P.rect(c, -3.6, 4, 7.2, 9, shade); P.ell(c, 0, -2.5, 8.6, 11, skin); },
  px(c, list, col) {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = col;
    for (const [x, y, w, h] of list) c.fillRect(x, y, w || 1, h || 1);
    c.restore();
  },
  eyes(c, blink, col, y) {
    y = y || 14;
    if (blink) P.px(c, [[13, y + 1, 2, 1], [17, y + 1, 2, 1]], col);
    else P.px(c, [[13, y, 2, 2], [17, y, 2, 2]], col);
  },
  turban(c, col, line) { P.ell(c, 0, -14, 11.6, 6.6, col); P.ell(c, 0, -19, 9, 6.2, col); P.line(c, -10, -13, 9.5, -17.4, 1.8, line); },
  doppi(c, col, mark) {
    P.poly(c, [-10.6, -9, -10, -19, -6, -22, 6, -22, 10, -19, 10.6, -9], col);
    P.px(c, [[15, 6], [14, 7, 2, 1], [14, 8, 3, 1], [15, 9, 2, 1], [11, 8], [11, 9], [20, 8], [20, 9]], mark);
  }
};

G.PORTRAIT_BG = {
  shirin: '#2b2446', nargiza: '#17384a', oydin: '#36161f', oydinMask: '#1c1420', farrukh: '#2c3322', widow: '#352d33',
  divan: '#3a2412', tillabek: '#401a1a', obi: '#0a2232', sado: '#0d2a2c', alp: '#2a2a2a', davron: '#3a2c18',
  inspector: '#1e1c3a', gulnora: '#2e3a24', bride: '#3a1820', bahodir: '#3a2a0c', auctioneer: '#3a1c14', singer: '#1e1c3a'
};
G.PORTRAITS = {
  // Sado: no face — a small light, and inside it, if you look long, two braids
  sado(c, b) {
    const k = (Date.now() / 900) % 6.283;
    P.ell(c, 0, 2, 22, 22, '#14403f');
    P.ell(c, 0, 2, 15, 15, '#1f6d66');
    P.ell(c, 0, 2, 9, 9, '#5fd8c8');
    P.ell(c, 0, 2, 4.5, 4.5, '#e6fff9');
    P.px(c, [[10, 18, 1, 6], [21, 18, 1, 6]], '#5fd8c8'); // two braids in the glow
    P.px(c, [[16 + Math.round(Math.cos(k) * 9), 17 + Math.round(Math.sin(k) * 9)]], '#e6fff9');
    if (!b) P.px(c, [[14, 15], [17, 15]], '#14403f');
  },
  shirin(c, b) {
    P.shoulders(c, '#3a2f6e', 34, 6);
    P.rect(c, -6.2, 12, 2.4, 22, '#e2b452'); P.rect(c, 3.8, 12, 2.4, 22, '#e2b452');
    P.drape(c, '#ece5d6');
    P.face(c, '#c4916a', '#a8764f');
    P.rect(c, -10.6, -6, 2, 14, '#c8bfae'); P.rect(c, 8.6, -6, 2, 14, '#c8bfae');
    P.ell(c, 0, -14, 10.6, 5.2, '#ece5d6');
    P.rect(c, -9, -11.4, 18, 2, '#e2b452');
    P.poly(c, [-5, 12.6, 5, 12.6, 0, 21.5], '#e2b452');
    P.eyes(c, b, '#2a1a12');
    P.px(c, [[12, 12, 2, 1], [14, 13], [18, 12, 2, 1], [17, 13]], '#2a1a12');
    P.px(c, [[14, 19, 4, 1]], '#2a1a12');
    P.px(c, [[16, 16, 1, 2]], '#a8764f');
  },
  nargiza(c, b) {
    P.shoulders(c, '#2a8f94', 32, 8);
    P.poly(c, [-6.5, 9, 0, 20, 6.5, 9, 3.5, 9, 0, 15, -3.5, 9], '#e8f4ee');
    P.line(c, -9.5, -2, -12.5, 27, 4.8, '#17110f'); P.line(c, 9.5, -2, 12.5, 27, 4.8, '#17110f');
    P.ell(c, 0, -8, 11.6, 13, '#17110f');
    P.face(c, '#d6a57c', '#b3825c');
    P.poly(c, [-9.6, -8.6, -6, -14.6, 0, -15.6, 6, -14.6, 9.6, -8.6, 5, -11.4, 0, -12, -5, -11.4], '#17110f');
    P.poly(c, [-9.6, -14, -9, -21, -4, -24.5, 4, -24.5, 9, -21, 9.6, -14], '#262634');
    P.rect(c, -7, -20.5, 2.6, 2.6, '#e8f4ee'); P.rect(c, -1.3, -22, 2.6, 2.6, '#e8f4ee'); P.rect(c, 4.4, -20.5, 2.6, 2.6, '#e8f4ee');
    c.strokeStyle = '#8ff6ef'; c.lineWidth = 1.8;
    c.beginPath(); c.arc(11.5, -3, 4.2, -0.9, 0.9); c.stroke();
    c.beginPath(); c.arc(11.5, -3, 8, -0.8, 0.8); c.stroke();
    P.eyes(c, b, '#17110f');
    if (!b) P.px(c, [[13, 14], [17, 14]], '#e8f4ee');
    P.px(c, [[13, 12, 2, 1], [17, 12, 2, 1]], '#17110f');
    P.px(c, [[15, 18, 2, 1]], '#b3825c');
  },
  oydin(c, b) {
    P.shoulders(c, '#17121a', 36, 4);
    P.poly(c, [-19, 30, -18, 0, -15, -18, -8, -28, 0, -31, 8, -28, 15, -18, 18, 0, 19, 30], '#2a2030');
    P.ell(c, 0, -3, 11.6, 14.6, '#120d15');
    P.face(c, '#c08a62', '#9a6a4a');
    P.poly(c, [-9, -6, -7, -12.4, -1, -13.8, 4.6, -12.6, 0.4, -10.4, -5, -7.6], '#120d15');
    P.poly(c, [-2.5, 10, 2.5, 10, 9, 20, 4, 24, -4, 24, -9, 20], '#c08a62');
    P.eyes(c, b, '#120d15');
    if (!b) P.px(c, [[14, 14], [18, 14]], '#7fe8dc');
    P.px(c, [[12, 13, 3, 1], [17, 13, 3, 1]], '#120d15');
    P.px(c, [[12, 16], [13, 17], [13, 18], [14, 19]], '#8a4434');
    P.px(c, [[15, 19, 3, 1]], '#9a6a4a');
    P.px(c, [[18, 23, 3, 1], [19, 24, 1, 1], [17, 22], [21, 22]], '#7fe8dc');
  },
  // Oydin before the reveal: a white clay mask under the hood
  oydinMask(c, b) {
    P.shoulders(c, '#17121a', 36, 4);
    P.poly(c, [-19, 30, -18, 0, -15, -18, -8, -28, 0, -31, 8, -28, 15, -18, 18, 0, 19, 30], '#2a2030');
    P.ell(c, 0, -3, 11.6, 14.6, '#120d15');
    P.ell(c, 0, -2.5, 8.6, 11, '#e8e0d0');
    P.rect(c, -3.6, 4, 7.2, 6, '#c8bfae');
    if (b) P.px(c, [[13, 15, 2, 1], [17, 15, 2, 1]], '#120d15');
    else P.px(c, [[13, 14, 2, 2], [17, 14, 2, 2]], '#120d15');
    P.px(c, [[15, 19, 2, 1]], '#8a8070');
    P.px(c, [[11, 11], [12, 12], [20, 11], [19, 12]], '#8a8070'); // painted brows
  },
  farrukh(c, b) {
    P.shoulders(c, '#8a2a30', 32, 8);
    for (const x of [-21, -13, 11, 19]) P.rect(c, x, 14, 2.8, 20, '#c0454a');
    P.poly(c, [-5.5, 9, 0, 18, 5.5, 9], '#e9dfc8');
    P.face(c, '#c8956a', '#a7785a');
    P.turban(c, '#ece3cf', '#c9bea6');
    P.px(c, [[11, 11, 1, 4], [20, 11, 1, 4]], '#2a1810');
    if (b) P.px(c, [[13, 15, 2, 1], [17, 15, 2, 1]], '#2a1810');
    else P.px(c, [[13, 14, 2, 1], [17, 14, 2, 1], [13, 15], [18, 15]], '#2a1810');
    P.px(c, [[13, 16, 2, 1], [17, 16, 2, 1]], '#a7785a');
    P.px(c, [[14, 18, 4, 1], [13, 19], [18, 19]], '#2a1810');
    P.px(c, [[16, 20, 2, 1]], '#a7785a');
  },
  widow(c, b) {
    P.shoulders(c, '#4a3428', 33, 7);
    P.drape(c, '#3d3439');
    for (const [x, y] of [[-14.5, 10], [-15.5, -6], [12.5, 10], [13.5, -6], [-10.5, 20], [8.5, 20]]) P.rect(c, x, y, 2.4, 2.4, '#5a4c55');
    P.face(c, '#b98a63', '#94684a');
    P.ell(c, 0, -14, 10.6, 5.2, '#3d3439');
    P.eyes(c, b, '#1e1614');
    P.px(c, [[12, 13], [13, 12, 2, 1], [17, 12, 2, 1], [19, 13]], '#1e1614');
    P.px(c, [[14, 10, 4, 1], [13, 17, 1, 2], [18, 17, 1, 2]], '#94684a');
    P.px(c, [[14, 20], [15, 19, 2, 1], [17, 20]], '#1e1614');
  },
  divan(c, b) {
    P.shoulders(c, '#8a1e2a', 36, 6);
    for (let i = 0; i < 6; i++) P.rect(c, -24 + i * 9.4, 18 + (i % 2) * 6, 2.8, 2.8, '#e8b850');
    P.poly(c, [-7, 7, -2, 34, -5, 34, -10.5, 9], '#e8b850'); P.poly(c, [7, 7, 2, 34, 5, 34, 10.5, 9], '#e8b850');
    P.ell(c, 0, -3.5, 9.2, 12, '#c38f66');
    P.poly(c, [-9.2, -2, -8.6, 6, -4, 13, 0, 15.5, 4, 13, 8.6, 6, 9.2, -2, 6, 3, 2.6, 4.4, -2.6, 4.4, -6, 3], '#17100c');
    P.ell(c, 0, -15.5, 13.6, 7.4, '#f2ead8');
    P.ell(c, 0, -21, 10.6, 7, '#f2ead8');
    P.line(c, -12, -14, 11, -19, 2, '#d8ccb2');
    P.ell(c, 0, -16.5, 2.6, 2.6, '#e8b850');
    P.line(c, 2, -24, 9, -33, 2.8, '#f2c14a'); P.line(c, 9, -33, 12.5, -30.5, 2.2, '#f2c14a');
    P.eyes(c, b, '#17100c', 13);
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#17100c');
    P.px(c, [[14, 17, 4, 1]], '#17100c');
  },
  // Tilla-bek: older, silver at the temples, a turquoise in the turban, a gentle smile
  tillabek(c, b) {
    P.shoulders(c, '#7a1424', 36, 6);
    for (let i = 0; i < 7; i++) P.rect(c, -26 + i * 8.4, 16 + (i % 2) * 7, 2.6, 2.6, '#f0c040');
    P.poly(c, [-7, 7, -2, 34, -5, 34, -10.5, 9], '#f0c040'); P.poly(c, [7, 7, 2, 34, 5, 34, 10.5, 9], '#f0c040');
    P.ell(c, 0, -3.5, 9.2, 12, '#c38f66');
    P.poly(c, [-9.2, -2, -8.6, 6, -4, 13, 0, 15.5, 4, 13, 8.6, 6, 9.2, -2, 6, 3, 2.6, 4.4, -2.6, 4.4, -6, 3], '#3a3030');
    P.rect(c, -9.4, -6, 2.2, 6, '#c8c0b8'); P.rect(c, 7.2, -6, 2.2, 6, '#c8c0b8');
    P.ell(c, 0, -15.5, 13.6, 7.4, '#fff4dc');
    P.ell(c, 0, -21, 10.6, 7, '#fff4dc');
    P.line(c, -12, -14, 11, -19, 2, '#e0d4bc');
    P.ell(c, 0, -16.5, 2.8, 2.8, '#2fb3b8');
    P.line(c, 2, -24, 9, -33, 2.8, '#f2c14a'); P.line(c, 9, -33, 12.5, -30.5, 2.2, '#f2c14a');
    P.eyes(c, b, '#17100c', 13);
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#3a3030');
    P.px(c, [[13, 18], [14, 19, 4, 1], [18, 18]], '#17100c'); // the smile
  },
  obi(c, b) {
    P.poly(c, [-26, 34, -20, 10, -16, -12, -10, -26, 0, -31, 10, -26, 16, -12, 20, 10, 26, 34], '#14506a');
    P.poly(c, [-18, 34, -14, 8, -11, -12, -6, -22, 0, -25, 6, -22, 11, -12, 14, 8, 18, 34], '#1f7f99');
    P.poly(c, [-9, 34, -7, 6, -5, -10, 0, -16, 5, -10, 7, 6, 9, 34], '#3fb8cc');
    for (const [x, y] of [[-14, -2], [-5, 4], [4, 1], [13, -3]]) P.rect(c, x, y, 1.8, 22, '#8fe8f0');
    c.strokeStyle = '#8fe8f0'; c.lineWidth = 1.8; c.beginPath(); c.ellipse(0, 24, 18, 3, 0, 0, 6.283); c.stroke();
    if (b) P.px(c, [[12, 13, 3, 1], [17, 13, 3, 1]], '#eaffff');
    else P.px(c, [[12, 12, 3, 2], [17, 12, 3, 2], [13, 11], [18, 11]], '#eaffff');
  },
  // Alp: huge, shaved head, a scar through the brow, eyes that look a little past you
  alp(c, b) {
    P.shoulders(c, '#4a4038', 40, 2);
    P.poly(c, [-8, 6, 8, 6, 12, 34, -12, 34], '#7a6248');
    P.face(c, '#b0a294', '#8e8276');
    P.ell(c, 0, -10, 9.4, 6.4, '#b0a294');
    P.rect(c, -5, 7, 10, 4, '#2a2420');
    if (b) P.px(c, [[13, 15, 2, 1], [17, 15, 2, 1]], '#3a3430');
    else P.px(c, [[13, 14, 2, 2], [17, 14, 2, 2]], '#d8d4cc');
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#3a3430');
    P.px(c, [[18, 10], [18, 11], [19, 12], [19, 13]], '#7a4a3a'); // scar
    P.px(c, [[14, 19, 4, 1]], '#3a3430');
  },
  // Davron: sun-dark, a striped chapan, a grey beard, a camel-bell on a cord
  davron(c, b) {
    P.shoulders(c, '#6a4a2a', 34, 6);
    for (const x of [-22, -16, -10, 8, 14, 20]) P.rect(c, x, 12, 2, 22, '#8a6a3a');
    P.face(c, '#b8865c', '#946a46');
    P.poly(c, [-8, 2, 8, 2, 7, 10, 3, 16, 0, 17, -3, 16, -7, 10], '#8a8278');
    P.turban(c, '#e8dcc0', '#c8bca0');
    P.ell(c, 0, 26, 3.2, 3.6, '#d8a840');
    P.eyes(c, b, '#2a1a10');
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#8a8278');
    P.px(c, [[14, 18, 4, 1]], '#5a4a40');
  },
  // Inspector of the Well: tall white hat of the Singers, a ledger cord, cold eyes
  inspector(c, b) {
    P.shoulders(c, '#2e2a5a', 34, 6);
    P.rect(c, -1.2, 10, 2.4, 24, '#e8e0f0');
    P.face(c, '#c4916a', '#a8764f');
    P.poly(c, [-9, -10, 9, -10, 7, -30, -7, -30], '#e8e0f0');
    P.rect(c, -9, -12, 18, 2.4, '#2e2a5a');
    P.rect(c, -5, 7, 10, 3, '#3a2a20');
    P.eyes(c, b, '#1a1420');
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#1a1420');
    P.px(c, [[14, 19, 4, 1]], '#1a1420');
  },
  singer(c, b) {
    P.shoulders(c, '#2e2a5a', 34, 6);
    P.poly(c, [-5, 9, 0, 18, 5, 9], '#e8e0f0');
    P.face(c, '#c4916a', '#a8764f');
    P.poly(c, [-9, -10, 9, -10, 7, -30, -7, -30], '#e8e0f0');
    P.rect(c, -9, -12, 18, 2.4, '#2e2a5a');
    if (b) P.px(c, [[13, 15, 2, 1], [17, 15, 2, 1]], '#1a1420');
    else P.px(c, [[13, 14, 2, 1], [17, 14, 2, 1]], '#1a1420'); // eyes always half-closed: singing
    P.px(c, [[15, 19, 2, 2]], '#5a3040');
  },
  // Gulnora: green headscarf over a red one, freckles, a girl who has been crying and stopped
  gulnora(c, b) {
    P.shoulders(c, '#5a6a4a', 32, 8);
    P.drape(c, '#8a4a3a');
    P.face(c, '#d0a07a', '#ac805c');
    P.ell(c, 0, -14, 10.6, 5.2, '#8a4a3a');
    P.rect(c, -9, -11.4, 18, 2, '#a86a52');
    P.eyes(c, b, '#1e1410');
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#1e1410');
    P.px(c, [[12, 17], [13, 18], [19, 17], [18, 18]], '#ac805c'); // freckles
    P.px(c, [[15, 20, 2, 1]], '#8a4a3a');
  },
  bride(c, b) {
    P.shoulders(c, '#e8dcd0', 32, 8);
    P.drape(c, '#c03040');
    P.face(c, '#d0a07a', '#ac805c');
    P.ell(c, 0, -14, 10.6, 5.2, '#c03040');
    for (let i = -8; i <= 8; i += 4) P.rect(c, i, -12, 2, 2, '#f0c040');
    P.eyes(c, b, '#1e1410');
    P.px(c, [[12, 12, 3, 1], [17, 12, 3, 1]], '#1e1410');
    P.px(c, [[15, 19, 2, 1]], '#c03040');
  },
  // Bahodir: the Gilded Hound — a gold helmet, a broad face, a loyalty that is not his
  bahodir(c, b) {
    P.shoulders(c, '#c8a040', 38, 4);
    for (let y = 14; y < 34; y += 5) P.rect(c, -24, y, 48, 1.6, '#8a6a20');
    P.face(c, '#b8865c', '#946a46');
    P.poly(c, [-11, -2, -11, -14, -6, -22, 0, -24, 6, -22, 11, -14, 11, -2, 7, -8, -7, -8], '#d8b040');
    P.rect(c, -1.5, -30, 3, 8, '#d8b040');
    P.rect(c, -1, -8, 2, 10, '#d8b040'); // nose guard
    P.eyes(c, b, '#1a1008');
    P.px(c, [[14, 19, 4, 1]], '#1a1008');
  },
  auctioneer(c, b) {
    P.shoulders(c, '#a83a2a', 34, 6);
    for (const x of [-20, -12, 10, 18]) P.rect(c, x, 14, 2.6, 20, '#f0c040');
    P.face(c, '#c8946a', '#a6764e');
    P.turban(c, '#f2ead8', '#d8ccb2');
    P.rect(c, -5, 8, 10, 3, '#2a1810');
    P.eyes(c, b, '#2a1810');
    P.px(c, [[12, 11, 3, 1], [17, 11, 3, 1]], '#2a1810');
    P.px(c, [[13, 18, 6, 1]], '#7a2a20'); // a wide, practised smile
  }
};
