/* =====================================================================
   Sado — the voice in his head. Subtitles that never stop the game,
   a small light near Ravshan, and her reactions to what he does.
   BARKS (lines by situation) are filled in by the story files.
   ===================================================================== */
const BARKS = {};          // key -> [three-language lines]
const sub = { list: [], cur: null, t: 0 };
const sadoAwake = () => !!F().sado && !R().ended;

function subtitle(text, opt) {
  opt = opt || {};
  const item = { text, who: opt.who || 'sado', pri: opt.pri || 0, t: 0 };
  if (opt.now) { sub.list.unshift(item); if (sub.cur && sub.cur.pri <= item.pri) sub.cur = null; }
  else if (sub.list.length < 4) sub.list.push(item);
}
// bark: a line for this situation that she has not said yet in this journey
function bark(key, opt) {
  if (!sadoAwake() && !(opt && opt.force)) return false;
  const list = BARKS[key];
  if (!list || !list.length) return false;
  const used = R().at;
  let i = list.findIndex((_, j) => !used['b:' + key + ':' + j]);
  if (i < 0) { if (opt && opt.repeat) i = Math.floor(Math.random() * list.length); else return false; }
  used['b:' + key + ':' + i] = 1;
  const line = list[i];
  subtitle(typeof line === 'function' ? line() : line, opt);
  return true;
}

G.SADO = {
  bark, subtitle,
  feel(n) { wisp.pulse = n > 0 ? 40 : -40; },
  get awake() { return sadoAwake(); }
};

// crackle: past half-empty her words break up
function crackle(s, v) {
  if (v < 50) return s;
  const p = v >= 75 ? 0.16 : 0.07;
  let out = '', seed = (sub.cur && sub.cur.text.length) || 1;
  for (let i = 0; i < s.length; i++) {
    seed = (seed * 9301 + 49297 + i) % 233280;
    out += s[i] !== ' ' && seed / 233280 < p ? '·' : s[i];
  }
  return out;
}

const subVisible = st => st === 'play' && !(G.UI.isOpen && G.UI.isOpen()) && !G.Game.fadeCb;
function subUpdate() {
  if (!sub.cur) { sub.cur = sub.list.shift() || null; if (sub.cur) sub.t = 0; }
  if (!sub.cur) return;
  if (G.UI.isOpen && G.UI.isOpen()) return; // wait while a dialog is open
  sub.t++;
  const life = 110 + 2.2 * t(sub.cur.text).length;
  if (sub.t > life) sub.cur = null;
}
SMOOTH_DRAW.push((ctx, st) => {
  if (!sub.cur || !subVisible(st)) return;
  const life = 110 + 2.2 * t(sub.cur.text).length;
  const a = Math.min(1, sub.t / 10, (life - sub.t) / 16);
  if (a <= 0) return;
  const c = who(sub.cur.who);
  const name = c.name ? t(c.name) : '';
  const text = crackle(t(sub.cur.text), sub.cur.who === 'sado' ? R().void : 0);
  ctx.save();
  ctx.globalAlpha = a;
  FX.tt(ctx, (name ? name + ':  ' : '') + text, G.W / 2 - 150, G.H - 46 - 7 * ((G.SUB_SCALE || 1) - 1), 300, { size: 7 * (G.SUB_SCALE || 1), align: 'center', color: sub.cur.who === 'sado' ? '#bff8ee' : '#f2e6c8' });
  ctx.restore();
});
PIXEL_DRAW.push((ctx, st) => {
  if (!sub.cur || !subVisible(st)) return;
  const life = 110 + 2.2 * t(sub.cur.text).length;
  const a = Math.min(1, sub.t / 10, (life - sub.t) / 16);
  if (a <= 0) return;
  const lines = FX.J(t(sub.cur.text), 300, 7).length;
  const h = 6 + lines * 10;
  ctx.save();
  ctx.globalAlpha = a * 0.72;
  ctx.fillStyle = '#0b0710';
  ctx.fillRect(G.W / 2 - 158, G.H - 49, 316, h);
  ctx.globalAlpha = a;
  ctx.fillStyle = sub.cur.who === 'sado' ? '#5fd8c8' : '#d9a441';
  ctx.fillRect(G.W / 2 - 158, G.H - 49, 2, h);
  ctx.restore();
});

/* ---------- the light near him ---------- */
const wisp = { x: 0, y: 0, pulse: 0, obj: null };
G.ObjArt.sadoWisp = (ctx, o) => {
  if (!sadoAwake()) return;
  const v = R().void, dim = 1 - Math.min(0.7, v / 140);
  const tt = (G.time || 0);
  const r = 1 + (Math.sin(tt * 4) > 0.3 ? 1 : 0);
  ctx.globalAlpha = 0.6 + 0.4 * dim;
  ctx.fillStyle = wisp.pulse < -10 ? '#d9a0a0' : '#bff8ee';
  ctx.fillRect(Math.round(o.x) - r, Math.round(o.y) - r, 2 * r, 2 * r);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(Math.round(o.x), Math.round(o.y), 1, 1);
  ctx.globalAlpha = 1;
};
G.ObjArt.sadoWispFx = (ctx, o) => {
  if (!sadoAwake()) return;
  const v = R().void, dim = 1 - Math.min(0.7, v / 140);
  const dark = o.dark ? 1.6 : 1;
  try {
    G.Light.add(o.x, o.y, (o.dark ? 95 : 55) * (0.7 + 0.3 * dim), '#9ff3e6', (0.35 + (wisp.pulse > 10 ? 0.25 : 0)) * dim * dark);
    G.Glow.add(o.x, o.y, 14, '#9ff3e6', 0.5 * dim);
  } catch (e) { /* ignore */ }
};
function wispAttach() {
  if (!G.world || !G.Interactable) return;
  const pl = G.world.player;
  if (!pl) return;
  const o = new G.Interactable(pl.x, pl.y - 30, { art: 'sadoWisp', w: 4, h: 4 });
  o.interact = false; o.layer = 2;
  o.dark = !!(G.Game.stage && G.Game.stage.biome && G.Game.stage.biome.dark);
  o.upd = self => {
    const p = G.world && G.world.player;
    if (!p) return;
    const tt = (G.time || 0);
    let tx = p.x - 14 * (p.facing || 1) + Math.sin(tt * 1.3) * 5, ty = p.y - 34 + Math.sin(tt * 2.1) * 4;
    if (wisp.target) { tx = wisp.target.x; ty = wisp.target.y - 18; }
    self.x += (tx - self.x) * 0.06; self.y += (ty - self.y) * 0.06;
    if (wisp.pulse > 0) wisp.pulse--; else if (wisp.pulse < 0) wisp.pulse++;
  };
  G.world.add(o);
  wisp.obj = o; wisp.target = null;
}
