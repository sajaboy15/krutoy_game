# Stage 8a — boss measurements (4 Nov 2026, evening)

Tests: `test/s8_moves.js` (every move forced), `test/s8_fight.js <pi> perfect|avg|god [cat] [limit] [party]` (S8_TRACE=1: per-hit traces), `test/s8_deaths.js` (one run) and `/tmp` pooled analysis of 3 runs (one run is far too noisy: the same build gave Ajdaho 10 and 0 deaths).

## Moves
All 62 moves of the 7 bosses start and end, no page errors. 8 utility moves strike nothing by themselves (summons, guard, darkness, ink, blizzard, chain strain, shed, eclipse).

## Perfect bot (reacts in 100 ms, always right)
Hits taken in a whole fight after the telegraph fixes: Glutton 2, Kampir 5, Hound 2–3, Choir 4, Albasty 3, Ak Bars 4, Ajdaho 9. Not 0 yet: part of it is the bot (rolling into a second pool, stamina), part may be real — see the traces.

## Average bot (200–300 ms, 7 of 10 dodges right) → estimated deaths of an average player
Damage table in `65v_boss_tune.js`. Pooled 3 runs each:

| Boss | before tuning | after | dmgK |
|---|---|---|---|
| Glutton (prologue) | 0 | 0.4 | 1.4 |
| Kampir | 0 | 0.3 (at 1.55; now 1.8, not re-measured) | 1.8, rests less |
| Hound | 19.6 (at 1.0) | ~9 expected | 0.9, triple's 3rd thrust 0.85 |
| Choir | 11.8 (at 1.15) | ~8 expected | 1.1 |
| Albasty | 0.2 | 9.4 | 1.6, rests less |
| Ak Bars | 6.3 | 6.3 | 1.35 |
| Ajdaho | 0.8 (at 1.0) | 17.8 at 1.4 → now 1.3 | 1.3, hp 720 |

## Kill time by weapon category (god bot: no dodging, swings non-stop = the floor)
| Босс | sabre | staff | knife | shield | ranged | dutar | focus |
|---|---|---|---|---|---|---|---|
| Обжора | 26 с | 28 с | 27 с | 27 с | не убит (15% за 10 мин) | 34 с | 78 с |
| Кампир | 38 с | 39 с | 31 с | 44 с | 50 с | 46 с | 54 с |
| Баходир | 32 с | 25 с | 21 с | 40 с | не убит (18% за 10 мин) | 35 с | 31 с |
| Хор | 61 с | 53 с | 40 с | 49 с | 34 с | 48 с | 37 с |
| Албасты | 37 с | 46 с | 27 с | 49 с | не убит (53% за 10 мин) | 51 с | не убит (62% за 10 мин) |
| Ак Барс | 36 с | 26 с | 28 с | 57 с | не убит (35% за 10 мин) | 34 с | 42 с |
| Аждахо | 88 с | 56 с | 43 с | 118 с | 147 с | 102 с | 90 с |

Ranged/focus failures are the bot's (it keeps 70 px and does not turn to a moving target; fallen bodies and the Hound's shield catch arrows); arrows hit when aimed (probe). Needs a hand check.

## Full party (old damage table)
Kill time −5…−15% (the party does not trivialise the fight). The companions are downed in most boss fights; they now read the telegraphs and dodge 3 of 4; the bot hero never revives them.
