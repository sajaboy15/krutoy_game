# YODGOR — art direction for the graphics overhaul (binding)

Goal: the game must stop looking like a browser game. Target quality: hand-crafted modern pixel art in the league of **Blasphemous, Dead Cells, Eastward, Children of Morta, Hyper Light Drifter** — dense detail, strong silhouettes, rich layered backgrounds, living atmosphere, dramatic light. Everything is still procedural code (the engine has no image files): you paint with code into canvases, cache the results, and keep per-frame cost low.

## Fixed facts
- Base resolution 480×270, tile 16 px, the hero is ~28 px tall. The final frame goes through a WebGL post pass (bloom, light shafts, grade) in `src/layer/96_gfx.js` — do not duplicate bloom; do use emissive colours (bright, saturated pixels) for things that should glow.
- Engine knowledge: `../engine_docs/BIOMES.md` (biome fields, frame order, `drawSky`, `buildBackground` parallax layers, `decorate`/decos, `post`, `fogBehind`, `drawForeground`, `ambientFx`, `tiles`, `Art.pixTile`, PixKit, BiomeKit `K.variant`, grading), `../engine_docs/ENEMIES.md` (puppet drawing, `Art.puppet`, LUT recolour, BossKit drawing helpers), `../engine_docs/HEAD.md` (hero head), `../engine_docs/ITEMS.md`. Readable engine: `../engine_docs/biomes/main.unmin.js`, `../engine_docs/enemies/main.pretty.js`.
- World: `src/layer/60_world.js` defines every biome id (`G.WORLD.biomes`), enemy and boss; story/locations in `design/BIBLE.md`. Plan ids and what each place is: `design/CONTRACT.md`.
- Layer files are concatenated in name order into one scope after the libraries; a file you add must be self-contained (wrap in `{ }`), and must run after `60_world.js` if it modifies biomes (name it `61_…`–`63_…`). Never edit files you don't own.

## Look
- **Palette discipline**: each location has a limited, harmonious palette (6–10 key colours + shades), clear value structure: dark foreground silhouettes, mid-ground play layer readable, light/hazy far background (atmospheric perspective). Characters and enemies must always pop from the background (rim light, outline, value contrast).
- **Uzbek / Silk Road identity**: girih tiles, majolica (turquoise/cobalt/white), carved wooden columns (ayvan), suzani patterns, ikat (abr) cloth, brick muqarnas, domes, minarets, apricot trees, chinar (plane) trees, aryks (canals), tandir ovens, lanterns, bazaar awnings; in the deep: wet clay karez tunnels, the Sleeper's flesh-rock, salt crusts, drowned blue domes; the dream: impossible stacked cities, floating carpets of memory, ghostly lanterns.
- **Life in every scene**: parallax 4–6 layers, drifting clouds/smoke, birds, swaying trees and cloth, flickering lanterns, falling dust/snow/ash/petals/fireflies, water shimmer and reflections, distant lights in windows, god-ray shafts (geometry in the scene, not only the post pass).
- **Light**: dramatic, motivated: lanterns, windows, the moon, Sado's glow, magic. Use the engine light system (`G.Light.add`, deco `light`) and ambient/shade/deepShade per biome.
- **Animation**: smooth, weighty; secondary motion (cloth, hair, sashes, beards), anticipation and follow-through.

## Performance budget
Headless baseline is ~8 ms per frame. Your additions together must stay under +3 ms/frame on a busy screen. Bake static art into canvases once (cache by key), draw dynamic things cheaply, cull off-screen, cap particle counts.

## Verify
Build with your own `YODGOR_OUT=/tmp/<you> python3 build.py`; Playwright test pattern in `test/lib.js` (`?stage=N&god` loads plan entry N). Take screenshots of everything you touched at 1920×1080 (viewport) and compare before/after; iterate until it looks great. Zero page errors. Report with the screenshot paths that best show the result.
