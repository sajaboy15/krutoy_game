/* =====================================================================
   Sound guard. Some systems start the page with the audio context
   suspended or lose it when the window is hidden/minimised. Every key,
   click and focus brings it back; if sound has still not started, a
   small hint says so on the title screen.
   ===================================================================== */
const audioCtx = () => { try { return G.AudioKit && G.AudioKit.ctx && G.AudioKit.ctx(); } catch (e) { return null; } };
const audioKick = () => {
  try {
    if (!G.Audio) return;
    G.Audio.unlock();
    const c = audioCtx();
    if (c && c.state !== 'running' && c.resume) c.resume().catch(() => {});
    if (G.Audio.muted && !audioKick.userMuted) G.Audio.muted = false;
    if (c && c.state === 'running' && !G.Audio.current && G.Game.state === 'title') G.Audio.music('title');
  } catch (e) { console.warn('[sound]', e); }
};
for (const ev of ['pointerdown', 'keydown', 'touchstart', 'focus', 'visibilitychange'])
  (ev === 'focus' || ev === 'visibilitychange' ? window : document).addEventListener(ev, () => { if (!document.hidden) audioKick(); }, { passive: true, capture: true });
setInterval(() => { const c = audioCtx(); if (c && c.state === 'suspended' && !document.hidden && document.hasFocus()) audioKick(); }, 2000);

SMOOTH_DRAW.push((ctx, st) => {
  if (st !== 'title') return;
  const c = audioCtx();
  if (c && c.state === 'running') return;
  if (!(G.UI._debug().TT.t > 120)) return;
  FX.tt(ctx, t(`No sound? Click the game window or press any key.|Нет звука? Щёлкни по окну игры или нажми любую клавишу.|Tovush yo'qmi? O'yin oynasiga bos yoki istalgan tugmani bos.`), G.W / 2 - 150, G.H - 34, 300, { size: 6.5, align: 'center', color: '#f2c14a' });
});
G.SOUND_STATUS = () => { const c = audioCtx(); return { ready: !!(G.Audio && G.Audio.ready), state: c && c.state, rate: c && c.sampleRate, track: G.Audio && G.Audio.current, muted: G.Audio && G.Audio.muted }; };
