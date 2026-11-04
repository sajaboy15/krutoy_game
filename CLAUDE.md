# Ёдгор / Yodgor — project handoff for Claude Code

You are continuing work on **Ёдгор (Yodgor)**, a dark story-driven action-RPG by Sherzod (the author, a native Uzbek and Russian speaker). The game is an HTML5 canvas game (procedural pixel art, no image files) built on the "Kyok Bori" engine, shipped as a single HTML page and as a Windows exe (Go + WebView2 launcher). The author is building it as his entry into the games industry: work with maximum care, test everything, never fake results.

Talk to the author in **Russian**, short and clear. He reads Russian and Uzbek natively and will judge every line.

## Where things are
```
Yodgor_project/
  CLAUDE.md                ← this file
  yodgor2/                 ← THE GAME (all work happens here)
    build.py               ← builds dist/page.html + dist/standalone.html from ../kyok/index.html + patches + src
    src/i18n.js            ← UI dictionary RU→[EN,UZ], text hooks (window.__T)
    src/pixfont.js         ← built-in pixel font (Latin + Cyrillic), replaces web font
    src/lib/*.js           ← engine extension libraries (biome kit, enemy/boss kits, audio, hero art…)
    src/people.js          ← NPC figures
    src/layer/NN_*.js      ← the game layer, concatenated in name order into ONE scope (see below)
    patches/               ← build-time exact-string patches of the engine
    launcher/              ← Go WebView2 launcher (main.go), game.html is copied here before go build
    test/                  ← Playwright tests (lib.js, journey.js = full playthrough, bossexit.js, slots.js, tree.js, screens.js, gfx2.js, s3_*.js…)
    design/                ← BIBLE.md (story bible), STYLE.md (dialogue rules v3, BINDING), CONTRACT.md (text/tech rules), ART.md
  kyok/index.html          ← original engine (do not edit; build.py patches it)
  engine_docs/             ← engine notes: BIOMES.md, ENEMIES.md, ITEMS.md, HEAD.md, AUDIO.md + readable engine sources
  gdd/gdd.html, *.pdf      ← THE DESIGN DOCUMENT v1.1 (52 pages, Russian). The plan for everything. Read it.
```

## Build, run, test
- Build into your own folder: `cd yodgor2 && YODGOR_OUT=/tmp/yd python3 build.py` (default output is `dist/`). The build lints that every three-language string has exactly two `|`.
- Play: open `<out>/standalone.html` in Chrome. URL params: `?stage=N&god` loads plan entry N (god = invulnerable), `?resetgfx`.
- Tests (Node + Playwright with Chromium): `YODGOR_OUT=/tmp/yd node test/err.js` (quick load check), `node test/journey.js ru first` (full playthrough, strategies first|last|mix, langs en|ru|uz; env `MODE=souls DIE=1` for deaths; takes 20–40 min), `node test/bossexit.js`, `node test/slots.js`, `node test/tree.js`, `node test/screens.js`, `node test/gfx2.js`, `node test/s3_*.js`. A pass = reaches an ending, `"errs": []`, `"untranslated": []`.
- Exe: `cp dist/standalone.html launcher/game.html && cd launcher && GOPROXY=direct GOSUMDB=off GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags "-s -w -H windowsgui -X main.buildID=$(date +%s)" -o ../dist/Yodgor.exe .` (go.mod replaces golang.org/x/sys with github.com/golang/sys v0.30.0).

## Code conventions (important)
- Layer files are concatenated into one IIFE scope in name order: shared helpers from 00_base.js (`t`, `tf`, `N`, `play`, `ask`, `hub`, `scene`, `R()`, `F()`, `save`, `addVoid`, `trust`, `rep`, `gold`, `once`, `toast`, `know`, BARKS, LAND/REST/BOSS/ENDING in 50_story_api.js…). Wrap new files in `{ … }`.
- All player-facing text: `t(\`English|Русский|O'zbekcha\`)` — exactly two `|`, ≤ 220 chars per part, no backticks or `${` inside, Uzbek in Latin script with ASCII apostrophe (o', g').
- **Write Russian and Uzbek from the meaning, never word for word** (the author's main complaint). See design/STYLE.md v3. No moral tags in choices (grey morality, Witcher style); Hollowness cost of choices is hidden.
- **Spoiler rule:** nothing may hint before Act II/III reveals that Sado is part of Ravshan's memory of his sister Oydin. The Sado skill tree uses `mask` names until `F().sadoFate` is set.

## Decisions the author already made (do not re-ask)
Target length strictly 10 h; open world (17 regions, see GDD ch.3); three yodchi branches **Взыскание / Хребет / Запретная песнь** (Uzbek: **Hisob-kitob / Bardosh / Yashirin navo**); attributes Сила/Ловкость/Стойкость/Память; 7 weapon categories, mods, 10 legendaries; armour + charms + inventory; merchants on the Bazaar; three factions with 6-quest arcs and double play; companions **Alp, Nargiza and Surayyo** (Surayyo = the only romance, the Tail's mirab, woven into the main plot; party of 4 incl. Ravshan); hard but fair combat, Dark-Souls-style boss movesets, no damage sponges; companions make fights harder, not easier; money is scarce, fast travel free from chaikhanas; Hollowness hidden in choices; honest names in Sado's tree after the reveal; no dialogue timers; voice acting secondary; Ошиқ mini-game with simplified rules. Full list: GDD chapter 27.

## Status (as of 4 Nov 2026, evening)
Roadmap = GDD chapter 26. Progress ≈ 62%. Review sheets for all rewritten texts are in notes/.

**DONE**
- **Stage 1, fixes.** Black-screen watchdog + F9 + exe reset (96_gfx.js, launcher). Tale ending name flag. Sado tree spoiler masks. New Seven boss (65_boss_seven.js). Painted epilogue slides (99_epilogue.js, 105 variants).
- **Stage 2, dialogue.** Acts 70/71/72 and all system/world/item texts rewritten by meaning in RU/UZ. No moral tags; Hollowness cost hidden.
- **Stage 3, character system.** 62_balance, 64_progress, 66_character, 67_items, 68_inventory_ui; tests test/s3_*.js. Attributes, levels, 3 branches, 47 weapons + 10 legendaries, armour sets, charms, inventory, smith. 8% per-hit boss cap.
- **Stage 4, open-world framework.** 80–84_world_*.js; test/s4_*.js. W2 API documented in the 80_world_core.js header.
- **Stage 5, story in the open world.** 85a_world_more, 85b_world_keys, 85c_world_story; test/s5_*.js. 17 regions, 58 two-way exits, 14 chaikhanas, all 5 endings reachable from "New journey"; s5_route.js plays them.
- **Stage 6, factions.** 75_factions, 76/77/78 arcs (18 quests), 79_economy_crime, faction bosses 65s_shirin / 65t_humo / 65u_oydin; test/s6_*.js. Reputation, double play, journal [N], merchants and haggling, stealth and crime.
- **Stage 7a, companion systems.** 86_party, 87_party_ai, 88_party_ui; test/s7_*.js. Alp / Nargiza / Surayyo in combat, approval, stances [V], orders 1/2/3, downed/revive, branches. Debug: `?stage=N&god&party=alp,nargiza,surayyo`.

- **Stage 8a, Souls-like boss movesets** (65a kit `G.BM` + 65b–65h). Every move fires (test/s8_moves.js); waves are telegraphed from the windup; companions read `G.BM` threats; Ajdaho hp 760. Results and open points: notes/stage8a_bosses.md.

**TOP PRIORITY NEXT (the author's complaint)**
- **Regions look empty.** Many are sparse or too dark: Swallowed Streets, Heart, Salt Mines, Tower of Silence, Rabat.
  - Cause: the art was made for the old short stages; the widened regions have bare walls and empty backgrounds.
  - Fix:
    - dress every region along its full length with decor, light, life, NPCs, events and secrets;
    - open up the deep regions' backgrounds;
    - make Tower vs Rabat and Withers vs Spine look clearly different.
  - Regions also give only 30–45% of the planned minutes (test/s5_traverse.js measures them).
  - Reference for quality: Ark gardens, Dream of the City, Tail at dusk.

**REMAINING STAGES**
- **7b.** Place the companions in the story: Alp/Nargiza/Surayyo personal arcs, the Alp–Nargiza knot, camp-chaikhana talks (~60 scenes), Surayyo romance (GDD ch.7).
- **8b.** Enemy families (~40 types), elites, 8 minibosses.
- **9.** 20 side stories (GDD ch.20), hunts, world events, Ошиқ mini-game, books, collections.
- **10.** Polish: cutscenes, key remapping, NG+, achievements, music by region/time, final balance, a real 10-hour measurement.

**KNOWN ISSUES**
- Companions cannot climb karez ladders (they catch up by teleport).
- Albasty wipes the party.
- The engine Controls screen does not list the new keys.
- Humo is drawn as a recoloured eagle.

**OPEN QUESTION FOR THE AUTHOR**
- design/BIBLE.md §10 (Sherzod and Bobokhon-aka, side story "A Father's Tithe"): it is unclear whether the author wants it. Do not implement it until he confirms.
## Working in parallel with the other chat
The author also works with Claude in a claude.ai chat on the same project. To avoid conflicts, agree on **file ownership** per task (one owner per file at a time) and sync through git (recommended: a private GitHub repo). Before starting, pull; after finishing a task, run the tests and commit with a clear message.

Suggested split when working in parallel:
Decide the split with the author at the start of each session.
