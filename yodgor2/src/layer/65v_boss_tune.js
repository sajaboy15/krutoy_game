/* 65v_boss_tune.js — stage 8a balance: how hard each redesigned boss hits (the moveset is the difficulty; this only scales
   the damage of its blows). Set from test/s8_deaths.js on the "average" bot (reacts in 200–300 ms, 7 of 10 dodges right):
   target 5–15 deaths for an average player over the game, the prologue's Glutton gentler. Hp is not touched (no sponges),
   except Ajdaho's (65h: its head is rarely in reach). */
{
  const TUNE = { glutton: 1.15, kempir: 1.3, hound: 1, choir: 1.15, albasty: 1.35, barys: 1.35, aidahar: 1 };
  if (G.BM && G.BM.specs) for (const id in TUNE) { const s = G.BM.specs[id]; if (s) s.dmgK = TUNE[id]; else console.warn('[tune] no boss', id); }
  G.BM_TUNE = TUNE;
}
