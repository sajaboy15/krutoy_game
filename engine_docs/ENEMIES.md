# Enemies & bosses — engine notes and tested recipes

Everything below is **runtime extension** (a script appended before `</body>`; `G.boot()` runs on `window.load`, so defs registered by the script exist before any level is populated). No engine edits were needed.

Files (all in `engine_docs/enemies/`):

| File | What |
|---|---|
| `enemy_kit.js` | `G.EK`: clone / recolor / scale / biome / behaviour helpers |
| `boss_kit.js` | `G.BK`: boss variant, champion-from-enemy, intro-card text (needs `enemy_kit.js`) |
| `recipe_clone.js` | kara_bori, ash_div, bone_archer (recipe 2a) |
| `recipe_behaviors.js` | ghul in Bukhara, rat_swift (haste), ghul_caller (volley + summon on death), toxic_ghul (pools) |
| `recipe_bosses.js` | kara_barys (variant), bori_khan (champion), tash_kumir (new boss from scratch) |
| `test_clone.js`, `test_behaviors.js`, `test_bosses.js` | Playwright tests; `lib.js` is the harness, `probe/` has the dump scripts |
| `main.pretty.js` | readable copy of the engine (TypeScript printer; line numbers below refer to it) |

**Harness tip.** After load, set `window.requestAnimationFrame = () => 0`. Otherwise the engine's own loop keeps simulating between `debugTick` calls, and screenshots don't match the state you set up. `lib.js` does this. Use `G.debugTick(0)` to render without simulating. To place a boss in a test, run `G.PLAN.splice(i,1,{type:'boss',biome,boss})` and then `G.Game.loadStage(i)`.

---

## 1. Regular enemies

### Registration and spawning
```js
G.Enemies = { defs:{}, register(def){ defs[def.id]=def },          // plain store, re-register = override
  list(biome) /* non-boss defs with def.biomes.includes(biome) */,  // wrapped later: empty pool -> [defs.dummy]
  spawn(id,x,y,opts) -> new (def.boss ? G.Boss : G.Enemy)(def,x,y,opts); world.add }
```
- **populate** (`Game.populate`, only for `type:'level'`): `list(level.biome.enemyBiome || level.biome.id)`. For each `level.spawns` point it makes a seeded weighted pick by `def.weight||10`. Flyers spawn 40 px higher. `spawn.elite` is set on 1–2 points per level by LevelGen. The spawn count per room comes from `biome.gen.enemies=[min,max]`.
- Enemy-biome ids: bukhara→`zindan`, steppe/kempir_lair→`steppe`, `bazaar`, alatoo/barys_shrine→`alatoo`, `afrasiab`, registan/registan_square→`registan`.
- **Stage scaling** is set in `loadStage` before `populate`: `diff.hpMul = 1+0.42*stage`, `diff.dmgMul = 1+0.2*stage`, where `stage = G.stageOf(planIndex)` counts level and boss entries. The Enemy constructor applies `hp*hpMul*(elite?3.2:1)` and `dmg*dmgMul*(elite?1.3:1)`. In a much longer PLAN this grows linearly; to change the curve, wrap `G.Game.populate` (a method, so it can be overridden) and set `G.diff` before calling the original. Bosses read `G.diff` when they spawn.
- **Elite**: hp ×3.2, dmg ×1.3, poise ≥0.6, kbResist ≥0.5, `scale` ×1.15 (coordinates only), gold outline/rim, sparkles and glow, gold ×4, guaranteed food and item drop. Some AIs also branch on `e.elite`; for example ghost_archer fires 3 arrows.

### Def fields (as read by the engine)
`id name biomes weight hp dmg speed w h (hitbox; x = feet centre, y = feet) fly grav sprite{w,h,ox,oy}` (the puppet canvas, with origin at the feet) `scale gold[min,max] sight(220) sightY(90) poise kbResist contact(false = no touch damage) contactMul(.5) blood debris[] deathDebris(14) outline rim{color,dx,dy,a} | rimC/rimA` (file 2, sun-direction getter) `barY ghostCol armor[] hurtRecover` and the hooks `init(e,opts) update(e) draw(ctx,e,frame) drawFx(ctx,e,frame) drawWorld onAggro(e) onDeath(e,info) onHit onInterrupt`. Instance-level hooks: `e.modDamageIn(dmg,hit)` and `e.onHurt(hit)`.

There are **two families**, and this matters for cloning:
- **File 1** (zindan, steppe and bazaar enemies) is registered through a wrapper `Y()` (pretty line 15825). It wraps `init/update/drawFx/onDeath`. The init gives each **instance** its own `draw` closure (puppet + HP bar at `barY`) and an `onHurt` that implements `armor` states (no flinch) and the `recover` state. **The puppet in these closures ignores `def.scale`.** The closures also read `armor, onHit, onInterrupt, hurtRecover, debris, deathDebris` from the **original** def object.
- **File 2** (alatoo, afrasiab, registan) is registered through `r()` (line 17842). It turns `rimC/rimA` into a getter that follows the biome's sun direction. These enemies use `Enemy.prototype.draw`, which passes `def.scale` to the puppet. Their helpers map local to world coordinates with `e.scale`.

### Enemy instance API
`player dx() dy() dist() facePlayer() canSee(p,r) setState(s) (resets stateT) walk(dir,spd) stop(k) edgeAhead() wallAhead() telegraph(frames) (red "!" + sfx) attackBox(x,y,w,h) (facing-relative) hitPlayer(box,opts) shoot(projOpts)`. Fields: `state stateT atkCD aggro hurtT teleT data{} home elite scale spr`. 
`Enemy.update` runs these steps in order: timers, status ticks, aggro check (`canSee(sight)` or damaged → `onAggro`), then stunned/hurt skip `def.update`, then physics (fly → moveX/moveY), contact damage, fall-out kill, elite sparkles.

### AI
Each AI is a hand-written state machine in `def.update` built on `e.state` and `e.stateT`, with no shared framework. The usual pattern is: wind-up state + `telegraph(n)`, then an attack state that calls `hitPlayer` once (`data.hit` latch), then `recover`, then `chase`. Movement helpers are exported as `G.EnemiesA.{go, chase, patrol, retreat, steer, roam, drop, rise, biped, Rope, blitLean, FXH}` (file-1 versions). The neutral states seen in a probe (`probe/states.json`) are `idle`, `chase`, `recover`, and for flyers `hover`/`circle`/`float`. Per-enemy states are listed in that file.

### Draw path (per-frame procedural, with cached parts)
Every frame, for every enemy on screen (`onScreen` culls):
1. `Art.puppet(ctx,x,y,opts,fn)` clears a shared offscreen canvas (`willReadFrequently`) and translates/flips/scales to the feet.
2. `def.draw` paints procedurally into it: limbs via `Art.thick` (1-px fillRects) and IK. It also blits **cached** pixel parts: `Art.sprite(key,rows,palette)` (keys `enA_*`/`eb_*`, a Map cache) and shaded parts cached in file-2 Maps.
3. `Art.process` makes one getImageData pass: alpha threshold 100, palette "snap" (rare colours become the nearest frequent colour), rim light, status tint/flash, 1-px outline.
4. The result is `drawImage`d onto the world canvas.

`drawFx` runs later on the main canvas, unlit (eyes, flames, `G.Glow.add`, `G.Light.add`). `FX.shatter` re-draws the enemy on death, so any recolour also applies to its death fragments.

## 2. Enemy recipes (tested)

### a) Clone with new stats and look — `EK.clone(baseId, newId, over, look)`
```js
EK.clone('bori','kara_bori',{ name:'Кара бөрі', biomes:['steppe','zindan'], weight:4, hp:70, dmg:14, speed:1.6 },
  { scale:1.3, sat:0.25, light:0.62, map:{'#ffe14a':'#ff3a3a'} });          // file-1 enemy
EK.clone('ice_div','ash_div',{ name:'Пепельный див', biomes:['afrasiab'], hp:150, rimC:'#ffc080' },
  { scale:1.2, fxUpdate:true, map:{'#e2f3fc':'#a89a90', '#aeecff':'#ffb040', /* …full palette… */} }); // file 2
```
What `clone` does:
- It copies property descriptors, which keeps the file-2 rim getter, and sets `biomes:[]` unless you give biomes.
- It swaps the closure-bound fields (debris, onHit…) onto the base def during the wrapped calls, so the clone's own values take effect.
- Fields you pass in `over` are treated as final colours.

What `look` does:
- **Colour.** By default (`mode:'lut'`) a per-pixel LUT runs on the puppet canvas inside the draw callback, before `Art.process`.
  - `map` gives exact palette swaps. Colours within `near` (default 28) of a map key snap to that key's target, which catches anti-aliased and scaled in-between colours.
  - Everything else gets the HSL shift `hue/sat/light`.
  - Blood, debris, outline and rim are remapped too.
  - `drawFx` is recoloured through a ctx **Proxy**: fillStyle is mapped, drawImage sources go through a LUT with a memo cache, and Glow/Light colours are mapped.
  - Projectiles fired via `e.shoot` are recoloured.
  - `fxUpdate:true` also maps particles that `update` and `onDeath` spawn.
- **Scale.** Hitbox, sprite box and `barY` are multiplied by k, and `attackBox` is wrapped (×k) per instance.
  - File 2 gets `def.scale`.
  - File 1 gets `ctx.scale` inside the draw, and the local points in `e.data` (eyes…) are scaled.
  - Smoothing is turned off (crisp). Without that, smoothing produced olive and cyan fringe colours.

**Render cost** (24 copies, `e.draw` only, ms per frame, headless; `shots/clone_report.json`):

| | base | LUT | ctx.filter post-pass | ctx.filter while drawing |
|---|---|---|---|---|
| bori (52×30) | 3.3–3.8 | 3.3–3.4 | 7.0–8.0 | **196–198** |
| ice_div (76×64) | 7.4–7.8 | 9.1–10.2 | 11.5 | — |

- Scale ×1.5 alone raised bori from about 3.5 to 5–6.4, because of the bigger canvas.
- drawFx through the Proxy costs about 0.06 ms for all 24; `fx:'filter'` costs about 0.2–0.4 ms.

**Use the LUT** (about 0.0–0.1 ms per enemy). **Never set `ctx.filter` before drawing**: it filters every fillRect, about 8 ms per enemy. The CSS hue-rotate is a colour matrix and also gives less exact colours than the HSL/LUT.

Screenshots: `shots/sprite_clone_ice_div_ash_div_…bone_archer.png` (isolated sprites, best view), `clone_lineup_file1(_zoom).png`, `clone_lineup_file2(_zoom).png`, `clone_elites(_zoom).png`, `clone_fight_*.png`, `clone_death.png`.

Death debris colours were verified: kara_bori drops greys, ash_div drops embers and ash.

### b) Existing enemy in another biome
`EK.addToBiome('ghul','zindan',4)` pushes the biome into `def.biomes`. The optional weight is per biome: `EK` wraps `Enemies.list` to return `Object.create(def,{weight})`.

Tested over 6 Bukhara seeds: 10 ghul, 8 toxic_ghul, 2 ghul_caller and 2 rat_swift appeared among the native zindan enemies. `EK.removeFromBiome` is the inverse.

### c) Behaviour tweaks (tested; `shots/behav_*.png`)
- `EK.haste(def,1.5)` runs extra `Enemy.update` calls per frame (AI, physics and timers; status damage ticks only once). In the test the swift rat covered 98 px against 63 px in 40 frames. A plain `speed` override only affects walking, because many attacks use hard-coded velocities.
- `EK.volley(def,{count,every,windup,speed,color,…})` adds a telegraphed fan of `e.shoot` projectiles layered over the base AI. It starts only from neutral states, and the base AI is frozen during the wind-up. Test: 3 projectiles fired.
- `EK.deathSummon(def,{id,count})` uses `G.Enemies.spawn` in `onDeath` (it marks the summons so they can't chain). Test: 2 rat_div appeared.
- `EK.deathHazard(def,{kind:'fire'|'poison'|'ice'|'spirit'|'gold'})` and `EK.trailHazard(def,{every})` drop a `BossKit.FirePool` on the ground.
- Overriding `def.update` with a wrapper is the general hook. For per-instance changes, set them in `init`, e.g. `e.shoot`, `e.attackBox`, `e.modDamageIn`.

---

## 3. Bosses

`G.Boss extends G.Enemy`; `Enemies.spawn` picks it when `def.boss`.

**Flow** (`Game.updateBossStage`, line 5542):
1. For PLAN `{type:'boss',biome,boss}`, `loadStage` builds `LevelGen.arena(biome, {seed,...biome.arena,...def.arena})`. Arena options are `w, h, platforms:[[x,y,len]], outdoor, wallH`. Floor row is `fy=h-4`. Player spawns at x=4 tiles, the boss at `w-12`.
2. When `player.x > 9 tiles`, the gate closes and the boss is spawned with `{boss:true}`. Then `Game.boss` is set, `UI.bossIntro(boss)` runs, `Audio.music(def.music || 'boss_'+id)` plays (unknown names fall back to `arena`), and the `'bossStart'` event fires.
3. When `boss.dead`, the stage is cleared: gate opens, door appears, gold, item, a scroll and food drop, `run.bossesKilled` is updated, music switches (`'aidahar'`→victory, else chaikhana), and `'bossDefeated'` fires.

**UI.** The intro card (220 f) uses the name `STORY.bosses[id].name || def.name`, the title `def.title || STORY…title`, and the quote `STORY.bosses[id].quote`. The HP bar shows while `Game.boss && stage.bossStarted`. Phase ticks come from `def.phases || boss.phaseAt`. Phase names appear as `UI.toast`. Debug views: `UI._debug().bossCard / .bb`.

**Modes** (`boss.mode`):
- **intro** (invulnerable, camera focus). `def.intro(b,t)` returns true to finish, or the intro ends at `introLen`.
- **fight** runs `checkPhase()`, then `def.update(b)`.
  - A phase starts when hp ≤ `maxHp*phaseAt[phase-1]`. That enters mode **phase** (invulnerable): `onPhaseInterrupt`, then `phaseAnim(b,t)`, a roar at `phaseRoarAt` (30), `phaseLen`, then `onPhase(b,n)`.
  - It enrages at `enrageAt` (0.2): `spd = enrageSpd||1.18`, `onEnrage`.
- **dying** comes from `die()`. It runs `cleanup()` (owned hazards and minions vanish), slow-mo, and `onDying`, then `deathAnim` and automatic explosions at `deathPoint` until `deathLen`. Then `finishDeath`: `onDeath`, `'kill'` event.

Hits are ignored, with a clang, unless in fight mode. Stun becomes nothing and freeze becomes slow.

**Boss def extras**: `title phaseAt phaseNames roarColor music arena introLen phaseLen deathLen deathColors fxPal rims(sunSign,b)->[rim,rim2] camX camY telePos setup(b) (end of constructor) start(b) (first update) intro update always (every frame, all modes) onPhaseInterrupt phaseAnim onPhase onEnrage onDying deathAnim deathPoint onDeath drawBoss(ctx,b) drawFx noPhys modDamageIn(b,dmg,hit) onHurt(b,hit) enrageAt enrageSpd kbResist`.

**Boss instance API**: `entered()` (true once per state), `tele(n)` (telegraph, ×0.85 when enraged; returns the frames), `pick([[name,w]...])` (weighted, damps the last two picks), `rest([cdP1,cdP2,cdP3])`, `roar({color,x,y,push,shake,flash})`, `add(ent)` / `own(ent)` (cleaned up on death or phase), `minion(id,x,y)`, `minionsAlive(id)`, `spdK()`, `popts()` (flash/tint/rims/outline/alpha for the puppet), `wpt(lx,ly,rot)`, `contact` (touch-damage multiplier), `alpha`, `untargetable`, `boxOv`, `parts` (`BossKit.BossPart` = extra hurtboxes with a damage multiplier).

**Existing bosses** (all draw with `BossKit.puppet` and cached shaded parts):
- **kempir** (1000 hp, phases .62/.30, witch-green). The witch has 7 heads, each a BossPart (×0.6, ×1 while biting).
  - Attacks: bite (1–5 heads lunge), spit (head projectiles), leap (marker, then landing Shockwaves both ways with poison), sweep (staff, melee).
  - Phase 2 adds rain (witch Pillars across the arena), breath (a moving floor fire line), and crows (`kempir_crow` minions, up to 2).
  - Phase 3 adds frenzy.
- **barys** (950, .60/.30, ice). Snow leopard.
  - Attacks: pounce (marker, ballistic jump, a double pounce in phase ≥2), swipe (2–3 hits, slow), tail (behind it), crack (IceCrack that spawns IceSpikes, both ways in phase 3).
  - Phase 2 adds icicles (jumps onto a platform, then ice Meteors).
  - Phase 3 adds dash (vanishes; spirit runners `Et` cross the arena 3 times).
- **aidahar** (900, .66/.33, fire, `noPhys` flying serpent; 11 body BossParts ×0.25). Head is at `hx,hy`.
  - Attacks: dive (column marker, then a fall with stuck/vulnerable time), breath (a sweep that leaves FirePools), bite (aim-line marker, then lunge).
  - Phase 2 adds meteors (sun Meteors) and spears (sun Pillars on the player).
  - Phase 3 adds strafe (lobbed fire projectiles that leave pools).
  - Its id is special-cased for victory music and for no final explosion.

## 4. Boss recipes (tested: `test_bosses.js`, `shots/boss_*.png`, `boss_contact_sheet.png`)

All three were placed into PLAN and checked: intro card shown with the new id, HP bar, phase 2 entered, defeat. The defeat check passed for bori_khan and tash_kumir in `test_bosses.js` (`bossDefeated` event, `bossesKilled`). For kara_barys the test read the result too early (the death animation runs 190 frames); `probe/kb.js` confirms it then reaches `dead` and the stage is cleared. No page errors.

**a) Variant — `BK.variant(baseId,newId,over,tune)`**
```js
BK.variant('barys','kara_barys',{ name:'Кара Барс', hp:1300, phaseAt:[.66,.4,.15], phaseNames:[null,'…','…','…'] },
  { look:{sat:.15, light:.45, map:{'#bff4ff':'#c070ff'}}, weights:{dash:0, icicles:2}, restMul:.8, teleMul:.9,
    extra:{ pillars:{ w:3, phase:2, update(b,t){ /*…*/ return t>=110; } } } });
BK.story('kara_barys',{name:'Кара Барс', title:'Тень ледника', quote:'«…»'});
```
- **Tuning.** It wraps the instance's `pick` (attack weights multiplied by `weights`, 0 removes an attack, plus the `extra` attacks), `rest` (×restMul) and `tele` (×teleMul, which also scales the wind-ups because AIs schedule on its return value). `spd` is the movement tempo.
- **Extra attacks.** These are states handled before the base `update`; return true to go back to idle. Seen in the test: `pillars` fired and `dash` never did.
- **Recolour.** `drawBoss` gets a ctx Proxy that LUT-recolours each puppet canvas it blits (`'live'`, so content isn't cached). `drawFx`, particles and Glow/Light are mapped too.
- **Gotcha.** Hazards keep the base palette unless it is mapped: Pillar uses `kind2` and Meteor uses fixed colours.

**b) Champion — `BK.champion(enemyId,newId,o)`**
This makes a `boss:true` def that reuses the enemy's `init/update/draw/drawFx`:
- `drawBoss` uses `Art.puppet` at `scale:k`.
- `setup` deletes the file-1 per-instance `draw` so that `Boss.prototype.draw` is used.
- `attackBox` is ×k, and `dx()` is divided by k so the AI's distance checks match the bigger body.
- Contact damage comes from `b.contact`.
- There is a fade-in, poof and roar intro.
- Scripted `extra` attacks run from neutral states with their own cooldown; otherwise the base AI runs.

Bori-khan (`scale 2.2`, 700 hp) mixes wolf states (lwind/leap/swind/snap) with `quake` (Marker, then `BossKit.ballistic` jump, then `BossKit.Shockwave` both ways) and, in phase 2, `howl` (`b.minion('bori')`, at most 3).
- Notes: bosses never flinch, `onAggro` doesn't fire, and file-1 eye glows are rescaled. Any other local points used by the base `drawFx` stay unscaled.

**c) New boss from scratch** (`tash_kumir` in `recipe_bosses.js`, about 60 lines, works): a def with `boss:true, hp, w, h, phaseAt, arena, introLen`, plus:
- `intro(b,t)` (fade and roar, then return true),
- an `update` switch: `idle`, then `b.pick(...)`, then attack states built from `b.entered()`, `d.W=b.tele(n)`, the action at `stateT===d.W`, and `b.rest([...])`,
- `drawBoss` via `BossKit.puppet(ctx,b.x,b.y,{...b.popts(),w,h,ox,oy,flip}, c=>{ BossKit.ball(c,x,y,rx,ry,[4 shades],lx,ly) … })`,
- `drawFx` for glows,
- `BK.story(id,…)` for the card quote.

Everything else (phases, invulnerability, death sequence, bar, drops) comes free from `G.Boss`. A production boss mostly adds a richer drawing (`BossKit.ball/tube/cel/shape` plus cached parts) and more states.

## 5. Reusable attack pieces (signatures)
- **Projectiles.** `e.shoot(o)`, or `G.world.add(new G.Projectile(o))`. Options: `x y vx vy r(3) dmg life(180) grav pierce noClip kbx kby color spin homing homingDelay light{r,color,a} trail{every,life,size,color,glow} status{burn|poison|bleed:{t,dps},slow|freeze|stun:{t}} heavy crit info{dmgColor} update2(p) onWall(p) onHit(p,target) onDie(p) drawFn(ctx,p) fxFn(ctx,p)`. Without drawFn/fxFn a default bolt is drawn.
- **Damage.**
  - `e.hitPlayer(box,opts)`.
  - `G.Combat.hit(src,target,{dmg,kbx,kby,dir,type,status,heavy,noFlinch,stun,dmgColor})`.
  - `G.Combat.area(src,box,hitOpts|fn,hitSet)`.
  - A `BossKit.Hazard` subclass has `hitBox(box,opts)` (respects `rehit`).
- **`G.BossKit` hazards.** These work in normal levels too (`arena()` falls back to the level bounds).
  - `Marker({x,y,w,life,color,style:'floor'|'column'|'hline'|'aim',hgt,x1,y1,follow})` is a telegraph.
  - `Shockwave(x,y,dir,{spd,life,pal,color,dmg,status,h})`.
  - `FirePool(x,y,{w,life,dmg,rehit,pal,glowC,status})`.
  - `IceSpike(x,y,delay,{H,dmg})`.
  - `IceCrack(x,y,dir,{spd,step,delay,H,dmg,owner})`.
  - `Meteor(x,floorY,delay,{kind2:'sun'|'ice',R,dmg})`.
  - `Pillar(x,floorY,delay,{kind2:'sun'|'witch',w,dur,dmg})`.
  - `BossPart(boss,mul,w,h)`.
  - Other helpers: `arena()` gives `{x0,x1,floor,top,cx}`, plus `plats()`, `ballistic(ent,tx,ty,vy0,maxVx)`, `pushPlayer(x,vx,vy)`, `windPlayer(dx)`, `puppet/wpuppet/ball/tube/cel/shape/SP`.
  - Enemy-level: `G.FireGround(x,y,w,dmg,life)` and `G.Shockwave(x,y,dir,owner,dmg)`.
- **FX.** `spawn({x,y,vx,vy,life,size,size1,color,color2,grav,drag,shape,glow,light,update})`, `burst(x,y,n,{speed,spread,angle,colors,…})`, `sparks(x,y,n,dir,{color,color2,speed})`, `debris(x,y,n,dir,cols,{speed})`, `dust(x,y,n,spd,cols)`, `ring(x,y,r0,r1,color,life,{width})`, `flash(color,a)`, `flashLight(x,y,r,life,color)`, `text(x,y,str,color,{size,life})`. The palette-name based ones (`pal`/`kind` ∈ `hit fire witch ice spirit gold blood violet`) are `hitStar flashRing slash shockwave(x,floorY,r,{pal}) explosion(x,y,{size:'s'|'m'|'l',pal}) magicBurst(x,y,pal,{size}) poof(x,y,{pal,r}) smokePuff iceShards embers wisps dustFan deathBurst`, plus `FX.smear({owner,ox,oy,r0,r1,a0,a1,dir,color,color2,life})` for swing arcs.
  - Screen and audio: `G.shake(a)`, `G.hitstop(n)`, `G.slowmo(scale,n)`, `G.kick(x,y)`, `G.Glow.add(x,y,r,color,a)`, `G.Light.add(...)`, `G.Audio.sfx(name,{x,pitch,vol})`.
  - SFX names: swing, swing_heavy, whoosh, hit_heavy, explosion, fire, ice, magic, summon, stomp, boss_roar, telegraph, poison, thunder, …
  - Events: `G.Events.on('bossStart'|'bossDefeated'|'kill'|'stageStart', fn)`.

## Gotchas
- Cloning a file-1 enemy with `Object.assign({}, def)` is not enough: its debris, onHit, onInterrupt, hurtRecover and armor still come from the original's closures. `EK.clone` works around this for everything except `armor`.
- `def.scale` is honoured only by file-2 enemies and `Art.puppet` callers. AI distances, projectile origins (file 1) and some FX points stay unscaled, so prefer scale ≤1.5 for regular enemies.
- Accessor `rim` on file-2 defs is non-configurable. Copy the other descriptors and build your own getter, as `EK.clone` does.
- Boss hits are ignored outside `fight` mode, including during phase transitions. Any death test must wait `deathLen` frames.
- A new boss id with no music falls back to the `arena` track. Hard-coded ids: `'aidahar'` (victory music, no final explosion) and `kempir_crow`.
- `G.PLAN` is read at `loadStage`, so edit it at runtime before a run starts.
