/* 89r_music.js — music by region and by time of day (GDD ch. 4: "at night the light and sound change: windows light
   up, the music is the night one"). Every region already has its own track (60_world.js, the biome's music); on the
   surface and the heights the night now brings a night version of it: no bright percussion, a darker tone, more echo,
   wind. The switch happens only when the region's own music is playing (never over a boss, a scene or a chaikhana). */
{
  const MU = G.Music, W2 = G.WORLD2;
  const BASE = ['yd_roofs', 'yd_ash', 'yd_salt', 'yd_bazaar', 'yd_old', 'yd_spine', 'yd_sand', 'yd_palace', 'yd_cloister', 'yd_dream', 'yd_house', 'yd_wedding'];
  const NIGHT = {};
  if (MU && MU.variant) {
    for (const b of BASE) {
      try {
        MU.variant(b, b + '_n', {
          tone: { lp: 1800 }, voices: { wet: .6 },
          drums: { j: null, J: null, c: null, k: null, T: null, t: null, h: null },
          layers: [{ wind: .05 }, { crackle: .025, pan: .2 }]
        });
        NIGHT[b] = b + '_n';
      } catch (e) { console.warn('[music] night', b, e && e.message); }
    }
  }
  let base = null;
  G.Events.on('stageStart', () => { base = null; setTimeout(() => { try { base = G.Audio && G.Audio.current; if (base && /_n$/.test(base)) base = base.replace(/_n$/, ''); } catch (e) { /* ignore */ } }, 600); });
  setInterval(() => {
    try {
      if (!base || !G.Audio || G.Game.state !== 'play' || !W2 || !W2.on || !W2.on() || G.Game.boss) return;
      const R0 = W2.regions[W2.active]; if (!R0) return;
      const open = R0.tier === 'surface' || R0.tier === 'heights';
      const want = open && W2.isNight && W2.isNight() && NIGHT[base] ? NIGHT[base] : base;
      const cur = G.Audio.current;
      if (cur !== want && (cur === base || cur === NIGHT[base])) G.Audio.music(want);
    } catch (e) { /* ignore */ }
  }, 2500);
  G.MUSIC_NIGHT = NIGHT;
}
