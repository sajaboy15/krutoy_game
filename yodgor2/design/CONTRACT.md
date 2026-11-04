# YODGOR v2 — shared contract for content files

Read first: `design/BIBLE.md` (story bible, cast, clue ladder, endings). This file fixes the ids, flags and APIs every content file must use, so the files written in parallel fit together.

Project: `/tmp/claude-0/-home-claude/08575428-f59d-530d-bee3-83e044270c16/scratchpad/yodgor2/`
- `src/i18n.js` languages (`t`, `tf`, `N`), `src/people.js` NPC figures (`G.PEOPLE.LOOKS`),
- `src/layer/00_base.js` state + scenes, `10_portraits.js`, `20_modes.js`, `30_hud.js`, `40_sado.js` (BARKS, subtitles), `50_story_api.js` (LAND/REST/BOSS/ENDING), `90_wire.js` (hooks, tables).
- All `src/layer/*.js` files are concatenated **in name order into one function scope** — top-level `const`s of earlier files are visible. Content files: `60_world.js` (world builder), `70_act1.js` (Prologue + Act I), `71_act2.js`, `72_act3.js` (Act III + endings). Do not edit files you do not own; if you need an API change, write it in your report.
- Build: `cd yodgor2 && YODGOR_OUT=/tmp/<yours> python3 build.py` (use your own out dir — others build in parallel). Tests: `test/lib.js` (`YODGOR_OUT=... YODGOR_SHOTS=... node test/x.js`). URL `?stage=N&god` loads plan entry N directly (god = invulnerable).

## Text rules
- Every player-visible string is three languages in one string: `` `English|Русский|O'zbekcha` `` (backticks; exactly two `|`). English is the source. Uzbek in **Latin** with ASCII apostrophe (o', g'), never Cyrillic letters. Russian natural literary Russian.
- In `play([...])` lines the text is that three-part string; `t()` resolves it at display time. Use `tf(str, {n: 5})` for `{n}` placeholders.
- Engine content names (enemies, items, perks, biomes) are registered with `N(\`...\`)`, which returns the English part.
- Dialog page ≤ 220 characters per language (longer text auto-splits into pages, but write tight). Poetic but clear: one image per line, concrete senses, no modern slang, no exposition dumps. Ravshan is laconic and dry. Sado is quick, curious, playful, sometimes uncannily old. Dark, adult, restrained.
- Ravshan's own lines use speaker `'hero'`. Sado in dialogs: speaker `'sado'`. Speakers available: see `CAST` in `00_base.js` (add none without need; minor voices use `crowd`, `neighbour`, `child`, `singer`, `memory`).

## APIs (from 00_base / 40_sado / 50_story_api)
```js
play([[who, text], [who, text], ...], then)       // a line may be a function returning a line or null (conditional)
ask(title, [{label, cost, price, lock, hide, ...your data}], o => ...) // cost = Hollowness change shown on the option; lock = reason text (option shown greyed)
scene(fn(done), after)                            // wrap any interactive sequence; content scene functions take (done)
addVoid(n, why)   trust(n)   rep('singers'|'divan'|'remember'|'tail'|'rabat', n)   gold(n)   know(text)  toast(text,col)
F() flags of the journey; R() journey state: R().void (0..100), R().trust (-10..10), R().tastes, R().mem, R().clues
once(key) -> true first time this journey;  seenEver(key) -> false the first time ever (saga)
bark(key) / G.SADO.subtitle(text)   // Sado's non-blocking subtitles; BARKS[key] = [lines]
LAND(planId, {name, sub, start, mid, stones, memory:{id, lines, after}, people:[{look, x?, lamp?}], exit(done)})
REST(planId, {name, sub, arrive(done), rustam(done), turab(done), farrukh(done), lullaby(done), people:[{look,x,y?,talk(done),prompt}]})
BOSS(engineBossId, {name, title, quote, lair, lairSub, pre:[lines], again:[texts], post(done), who:'boss', portrait})
ENDING(id, {title, scene() -> lines, epilogue() -> [texts]});  endGame(id);  finish(id)
DEATH_LINES.push(text)   // pool of lines for the death screen
ON_STAGE.push((plan, biome, level) => ...);  ON_NEWRUN.push(() => ...);  TICK.push(() => ...) per frame;  queue(when, show)
```
Automatic BARK keys: `<planId>:start` (soon after arrival), `<planId>:mid` (halfway), `memoryNear` (a lost memory is near), `lostTumar` (Oath tilla recovered). Writers may add their own keys and call `bark()`.
Lost memory per land: `memory: {id:'m_snow', lines:[...]}` — touching it plays the lines, then Hollowness −6 and `R().clues++`.
`people` stand ~70 px before the gate; walking up to them runs `exit(done)` once. Looks (`G.PEOPLE.LOOKS`): tailman, tailwoman, widow, hollow, alp, child, girl, caravan, singer, shirin, nargiza, divan, tillabek, guard, hound, bride, gulnora, rebel, oydin, elder, auctioneer, inspector, mother. A look may also be an object `{robe, trim, skin, head:'doppi|turban|scarf|hood|hat|helmet|veil|bare', headC, beard:'short|long', scale, ...}`.
Rest stops: the chaikhana has Rustam (aksakal → `rustam(done)`), the bakhshi (shaman → `turab(done)` then the song/perk offer), Farrukh (merchant → `farrukh(done)`). `arrive` plays once on arrival; `lullaby` is Sado's lullaby (once per rest; it should cost nothing, lower Hollowness by 4 if trust ≥ 2).

## The plan (ids are fixed; world builder creates biomes/bosses; writers fill LAND/REST/BOSS)
| # | id | type | act | where | boss id |
|---|---|---|---|---|---|
| 0 | p_tail | level | 0 | The Tail at night (Night of Payment) | |
| 1 | b_vault | boss | 0 | The Singers' Vault | glutton |
| 2 | r_plane | rest | 1 | Chaikhana of the Two Plane Trees | |
| 3 | a1_tail | level | 1 | The Tail, the morning after | |
| 4 | a1_rabat | level | 1 | The Rabat and the Salt Road | |
| 5 | b_tower | boss | 1 | Tower of Silence | kempir (renamed Yalmog'iz Kampir) |
| 6 | r_salt | rest | 1 | Chaikhana by the salt well | |
| 7 | a1_bazaar | level | 1 | The Memory Bazaar | |
| 8 | a1_ark | level | 1 | The Ark, gardens of the Divan | |
| 9 | b_court | boss | 1 | The Hound's court | hound |
| 10 | r_ark | rest | 1 | Chaikhana under the Ark wall | |
| 11 | a1_cloister | level | 1 | The Cloister of the Singers | |
| 12 | b_choir | boss | 1 | The hall of the Silent Choir | choir |
| 13 | r_den | rest | 2 | Smugglers' den, upper Karez | |
| 14 | a2_karez | level | 2 | The Karez (dark) | |
| 15 | a2_streets | level | 2 | The Swallowed Streets | |
| 16 | b_cistern | boss | 2 | The great cistern | albasty |
| 17 | r_lamp | rest | 2 | The Last Lamp | |
| 18 | a2_old | level | 2 | Old Yodgor | |
| 19 | a2_well | level | 2 | The Founders' Well | |
| 20 | b_seven | boss | 2 | The bottom of the Well | seven |
| 21 | r_rib | rest | 2 | Chaikhana in the ribs | |
| 22 | a2_spine | level | 2 | The Spine of the Sleeper | |
| 23 | b_shrine | boss | 2 | The shrine on the withers | barys (Ak Bars) |
| 24 | r_spine | rest | 2 | Chaikhana on the Spine | |
| 25 | a2_heart | level | 2 | The Heart | |
| 26 | a3_dream | level | 3 | The Dream of the City | |
| 27 | a3_wedding | level | 3 | The Drowned Wedding | |
| 28 | a3_sand | level | 3 | The Year of Sand | |
| 29 | r_dream | rest | 3 | The dream chaikhana | |
| 30 | a3_house | level | 3 | Your House | |
| 31 | b_nightmare | boss | 3 | The Nightmare's nest | aidahar (renamed Ajdaho) |
| 32 | victory | victory | | | |

Ownership: `70_act1.js` = entries 0–12, `71_act2.js` = 13–25, `72_act3.js` = 26–31 + all ENDINGs + the finale scene after Ajdaho (BOSS aidahar post → choices → `endGame`). Generic death lines and generic BARKS (combat, low health, idle) go in `70_act1.js`.

## Flags contract (`F()`), who sets / who reads
Prologue/Act I (70): `sado` 1 (set in glutton post: she wakes) · `widow` force|fake|paid|written · `alp` helped|paid|collected · `davron` led|reported|bribe|bluff · `chain` carried|seal|silent · `voice` bought|stolen|left (Turab's voice; bought/stolen → Turab can speak later) · `gulnora` returned|left|blackmail · `tillabek` accepted|refused (his offer) · `hound` shown|killed|spared · `truth` 1 (tasted the founders' tumar from Farrukh: there was no treaty) · `nargiza` down|stayed (she comes down into the Karez or not) · `rustamMem` 1..4 (how many of Rustam's memories tasted; Act I does 1–3) · `oydinName` 1 (heard the name Oydin in Rustam's memory 2).
Act II (71): `rustamMem` 4 (the key) · `masked` 1 (met the masked woman) · `alpTumars` returned|destroyed|choice · `oydin` joined|took|let|shown|tasted (sister reveal) · `seven` 1 · `barys` freed|chained|killed · `name` 1 (learned the name Obi-Hayot) · `nargizaQ` believes|returned|silenced · `tales` 1 (Turab's tales heard; needs voice and name) · `faction` singers|divan|remember (whose plan starts at the Heart; strongest rep, Oydin joined → remember).
Act III (72): `sadoFate` remember|keep|oydin|tale · final choice → ending id `tithe` | `chain` | `awake` | `tale` | `hollow`.
Rep keys: singers, divan, remember, tail, rabat. Trust: mercy/honesty +1..2, cruelty/betrayal −1..2.
Hollowness: tasting a memory +8; paying with his own memory +15; cruel choices +3..6; lost memory −6; lullaby −4; Mehri's gift −8; sister memory −30. Thresholds 50/75 have their own scenes (Act writers may add lines via BARKS `void50`, `void75` — owned by 70).
Tale ending requires: nargizaQ believes, truth, name, tales, (sadoFate tale or remember), void < 60.

## World contract (60_world.js)
Biomes per plan entry, all named with `N()` in three languages by the LAND/REST/BOSS files (world builder only sets biome ids and placeholder names). Enemies: new and renamed enemies with three-language names fitting the lore (Hollow, Singers' wardens, Divan mercenaries, karez creatures, dream things). Bosses: engine ids `glutton, kempir, hound, choir, albasty, seven, barys, aidahar`. Weapons/skills/perks: renamed to the lore and new lore weapons. Music: dark tracks mapped to lands. Difficulty curve over 33 entries.
