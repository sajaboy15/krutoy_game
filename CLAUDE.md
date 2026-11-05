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

## Status (as of 5 Nov 2026)
Roadmap = GDD chapter 26. All ten stages now have their systems in; what is left is measuring, balancing and reading.
Review sheets for rewritten texts are in notes/. Branch: claude/kind-galileo-81p728.

**DONE**
- **Stage 1, fixes.** Black-screen watchdog + F9 + exe reset (96_gfx.js, launcher). Tale ending name flag. Sado tree spoiler masks. New Seven boss (65_boss_seven.js). Painted epilogue slides (99_epilogue.js, 105 variants).
- **Stage 2, dialogue.** Acts 70/71/72 and all system/world/item texts rewritten by meaning in RU/UZ. No moral tags; Hollowness cost hidden.
- **Stage 3, character system.** 62_balance, 64_progress, 66_character, 67_items, 68_inventory_ui; tests test/s3_*.js.
- **Stage 4, open-world framework.** 80–84_world_*.js; test/s4_*.js. W2 API in the 80_world_core.js header.
- **Stage 5, story in the open world.** 85a/85b/85c; test/s5_*.js. 17 regions, all 5 endings reachable.
- **Stage 6, factions.** 75–79; test/s6_*.js.
- **Stage 7a, companion systems.** 86_party, 87_party_ai, 88_party_ui; test/s7_*.js.
- **Stage 7b, companions in the story.** 88b kit, 88c Alp, 88d Nargiza, 88e Surayyo (romance), 88f the Alp–Nargiza knot, 88g/88h 64 camp talks; test/s7b_comp.js.
- **Stage 8a, boss movesets.** 65a–65h + 65v_boss_tune.js; tests s8_moves/s8_fight/s8_deaths; notes/s8_results.md. Perfect bot still takes 2–9 hits per fight.
- **Stage 8b, enemies.** 89o_enemies.js: 20 new types (66 regular types in 9 families), 7 elite modifiers (+2 in NG+), attack tokens (1/2/3 attackers by difficulty), Divan vs Those Who Remember. 89p_minibosses.js: the 8 GDD minibosses with their mechanics, top bar, 150 XP / 60–100 tilla. test/s8b_mb.js.
- **Stage 9, content.** Regions dressed (89_world_dress, 89b_world_folk). Side stories: 79m kit, 79n cameo «The Blue Wolf» (Sherzod & Azamat), 89c–89f (sd4–sd20; sd1–3 live in the acts). 89i Oshiq (30 alchiks, 12 opponents, tournament). 89j hunts (10 contracts). 89k 19 world events (+6 moments in 89b = 25). 89l yodchi's book [Y]: notes, memories, bestiary, collected, deeds, people, chronicle. 89m_books_a/b: 60 notes (20 point to caches with materials/recipes). 89n crafts: alchemy (Zebo), kitchen (chaikhana), tumar sewing (Ma'ruf), 36 recipes, herbs, trophies. Tests s9_*.js.
- **Stage 10, polish.** 01_settings.js: key remapping (keyboard + gamepad, engine and Yodgor keys), text speed, subtitle size, clean HUD, hints (menu: Options → Controls, text, screen). 89q_ach.js: 40 achievements, play-time counter, New Game+ (carry Ravshan, enemies ×1.4, one new move per boss, Sado's NG+ lines). 89r_music.js: night versions of region music. 99b_cutscenes.js: painted slides at each new moon (acts I–III). Tests s10_meta.js, s10_cut.js.

- **Bigger world (6 Nov).** 89s_world_big.js: Tail/Bazaar/Ark ~2× (25–32 screens), other regions +20–35%, more vertical segments, towers with roof caches, sealed and shortcut houses, chests along each region. 89t_crowd.js: people by role/region/hour (Bazaar 47 by day, Ark 41, Tail 33) with bubbles and rumours; they flee fights. 89k: 27 events, hubs hold up to 3. Tests s9_crowd.js.
- **New narrative quests (6 Nov), 2 per file, 4 endings each, linked to one another, returning people, epilogue slides:** 89w Bazaar (qb1 A Voice by the Minute, qb2 The Clerks Forget), 89x Tail/Potters (qt1 One Night for the Whole Street, qt2 Two Widows and a Bowl), 89y Ark/Cloister (qa1 Someone Else's Conscience, qc1 The Light Tithe), 89z Rabat/Mines (qr1 The Same Caravan, qm1 The Seventh Drift), 89zb underground (qk1 Still Water, qs1 On the Eve of the Feast). Tests s9_qbazaar/qtail/qark/qsalt/qunder.js (two endings each tested; the others only built and linted).

**NOT DONE / NEEDS THE AUTHOR**
- Side story 21 «A Father's Tithe» (BIBLE §10): the author said do NOT make it.
- A real 10-hour playthrough measurement (GDD ch. 25) and the final balance pass after it. s5_traverse.js measures regions; the counter in the book (Deeds → play time) measures a human run.
- Proofreading of all new RU/UZ texts by the author (stages 7b–10 added a lot: books, camp talks, events, bestiary).
- Boss perfect-bot still takes hits; ranged/focus builds on some bosses need a hand check.
- s9_side.js: sd12, sd7, sd16 stop on test flow (the bot's choice picker), not confirmed as game bugs.

**KNOWN ISSUES**
- Every boss downs the companions unless the hero revives them (by design: companions make fights harder).
- The yodchi's book moved from L to Y: L is the engine's second roll key.

## Working in parallel with the other chat
The author also works with Claude in a claude.ai chat on the same project. To avoid conflicts, agree on **file ownership** per task (one owner per file at a time) and sync through git (recommended: a private GitHub repo). Before starting, pull; after finishing a task, run the tests and commit with a clear message.

Suggested split when working in parallel:
Decide the split with the author at the start of each session.
