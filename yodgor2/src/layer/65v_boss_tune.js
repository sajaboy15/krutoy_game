/* 65v_boss_tune.js — stage 8a balance: how hard each redesigned boss hits (the moveset is the difficulty; this only scales
   the damage of its blows). Set from test/s8_deaths.js on the "average" bot (reacts in 200–300 ms, 7 of 10 dodges right):
   target 5–15 deaths for an average player over the game, the prologue's Glutton gentler. Hp is not touched (no sponges),
   except Ajdaho's (65h: its head is rarely in reach). */
{
  // measured 4 Nov: 3 average-bot runs per boss pooled (one run is far too noisy); see notes/s8_results.md
  const TUNE = { glutton: 1.4, kempir: 1.55, hound: .9, choir: 1.1, albasty: 1.6, barys: 1.35, aidahar: 1.4 };
  // Kampir and Albasty land too few blows for damage alone to matter: they rest less between strings (tempo, not numbers)
  const REST = { kempir: [32, 26, 22], albasty: [32, 26, 22] };
  if (G.BM && G.BM.specs) for (const id in TUNE) { const s = G.BM.specs[id]; if (!s) { console.warn('[tune] no boss', id); continue; } s.dmgK = TUNE[id]; if (REST[id]) s.rest = REST[id]; }
  G.BM_TUNE = TUNE;
}
