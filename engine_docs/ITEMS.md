# Items, skills, perks, pickups, shops and HUD — engine notes + tested recipes

Engine: `kyok/main.js` (minified). A pretty-printed copy for reading: `engine_docs/items/main.pretty.js`; line numbers `L…` below refer to it.
Everything here is **runtime** (extra `<script>` after the engine) except one optional HUD patch.

Files (all in `engine_docs/items/`):
| file | what |
|---|---|
| `items_ext.js` | helper `G.ItemsExt`: clone/recolor items, give/drop/altar/shop, 4 small engine hooks, altar bug fix |
| `hud_bar.js` | `G.HudBars`: extra bars under the HP panel in the stock HUD style |
| `recipes.js` | worked examples (a)…(e) below (ids `ex_*`) |
| `hud_inpanel_patch.py` | optional build-time patch: bars *inside* the HP panel (4 exact replacements) |
| `test/lib.js`, `test/recipes_test.js`, `test/hud_test.js`, `test/art_sheet.js` | Playwright tests (33/33 + 9/9 pass, no page errors) |

Load order: engine → `items_ext.js` → `hud_bar.js` → your content. Scripts run before the `load`→`boot`, so items registered there work with `?give=` and `G.START_WEAPON`.

Test harness tip: `test/lib.js open()` holds the page's `requestAnimationFrame` loop, so only `G.debugTick(n)` advances/renders → deterministic screenshots. Press actions with `G.input.keys.add('KeyJ'); G.debugTick(2); G.input.keys.delete('KeyJ')` (J attack, K secondary, Q/E skills, F interact, R flask).

---

## 1. Items (`G.Items`, L5260)

```js
register(def)   // sets def.slot = (kind 'skill'|'throw') ? 'skill' : 'weapon'; weight default 10; minStage default 0; defs[id]=def
create(id, tier=0) -> { id, def, tier, uid, cd:0, ammo:def.ammo||0, get name(){ name + ' +tier' } }; calls def.onCreate(item)
colorHex(item)  // STAT_COLORS[def.color]: red #e0443a, purple #a85cf0, green #4fc25a, none #d8d0c0
randomDrop(stage, {slot, exclude}) // !noDrop && minStage<=stage; prefers items not equipped; weighted by weight;
                                   // tier = floor(0.8*stage + (30% ? 1 : 0))
categoryOf(item) -> ['attack','secondary'] | ['skill1','skill2']
pickUp(player, drop) // free slot of the category -> equip; else UI.choice swap modal; old item dropped; toast; Events 'equip'
```
`G.run.slots = {attack, secondary, skill1, skill2}` (item instances). The HUD reads it every frame → writing a slot updates the HUD immediately.

### Def fields (common)
`id, name, desc, kind, color ('red'|'purple'|'green' = stat Батыр/Мерген/Тулпар), color2` (scaling uses the better of the two), `weight, minStage, priceMul, noDrop, ammo, onCreate(item)`,
`icon(ctx,size,item)` (drawn centred at 0,0), `held(ctx,item,ws,player)` (in-hand art), `drawFx/drawWorld(ctx,player,item,ws)`, `twoHand, wOff, poseFn(player,item,ws)`, `tick(player,item,ws)`.
Tooltip (`ge`, L40200): name, kind label, stat levels, desc, "Урон" from `combo[].dmg` / bow `dmg×count` / `def.dmg` (**display only for skills** — keep equal to what `use()` deals), shield Блок/Контрудар, "Перезарядка" from `cooldown`, ▲▼% vs. equipped.

### Kinds (`G.ItemKinds`, each `{start(p,item,ws)->bool, update(...)->done, pose(...), end?, guard?}`; add your own the same way)
- **wmelee** (all stock melee, L34327): `combo:[step]`, `air: step|[step]`, def `smearColor/smearColor2/critColor/tipLen/onHitEnemy/tick/onEnd`.
  Step: `pose` (slash|slash2|overhead|thrust|low|upper|spin|smash|jab), `poseOverride{a0,a1,ext0,ext1}`, `windup, active, recover` (frames), `chainAt, dmg, reach, box:[dx,dy,w,h]` (facing-relative), `lunge, hop, hang, kbx, kby, stun` (frames), `status:{burn|poison|bleed|freeze|stun|slow:{…}}`, `heavy, slam, slamK, hitstop, shake, glint, sfx, smear:{r0,r1,a0,a1,color,color2,life}|false`, `crit(p,enemy,ws)->bool, critMul` (default 1.75), `onStart/onFire/onActive/tick/poseFn`, `onHitEnemy(p,item,ws,enemy,wasCrit)` (also def-level).
  ⚠ `onHitEnemy` fires for every target the hitbox touched, **even if it took no damage** (invulnerable/boss intro). Use `onAnyHit` (below) for "on successful hit".
- **melee** (legacy, L5362): same step fields minus air/onHitEnemy.
- **bow**: `drawT, recover, dmg, count, spread, speed, recoil, crit(p,enemy,proj), status, pierce, arrowColor, trailColor, projectile:{…Projectile fields}`, `onFire(p,item,proj)`. Arrow hits carry no `info.item` — set `proj.info = {...proj.info, item}` in `onFire` if you need it.
- **gun** `aimT, recover, fire(p,item,ws)`; **sling** `whirlT, recover, fire`; **chakram** `windT, recover` (fixed 12 dmg); **shield** `parryWindow, block (0.75), parryDmg (20), onParry(p,item,info)` (blocks frontal hits only, ranged from any side).
- **skill** = **throw** (same object, L5566): `cooldown` (frames, 300), `castT` (frame `use` fires, 4), `dur` (total frames, 14), `use(p,item,ws)` (**return false → no cooldown**), `updateCast, poseFn, showHeld, held, drawFx`. Cooldown = `cooldown × Perks.mod('cooldown')`; `item.cd/cdMax` drive the HUD pie. `Items.tick()` counts down all slots.

Attack flow: `Player.updateNormal` (L5913) → for action in attack/secondary/skill1/skill2: `input.consume` → `startItem(action, run.slots[action])` → `player.act = {action,item,kind,ws}`; `kind.update` each frame until it returns true. `ws.cancelable === false` blocks jump/roll cancel.

### Damage (`G.Combat`, L4519)
- `playerDmg(item, base) = base × 1.15^stats[color] (or color2 if higher) × (1 + 0.12×tier)` — used by every weapon/skill, and by the tooltip.
- `hit(src, target, info)`: player side `info.dmg *= Perks.mod('dmgOut',1,info,target)`, crit → `× (critMul||1.75)`; `target.takeHit`: frozen target takes ×1.3 (non-burn hit) and thaws; statuses applied; `info.stun` → stun frames. Then `Perks.emit('onHit', target, info)`. `target.lastHit = info` (final dmg).
- `area(src, box, infoFn, hitSet)` — hit everything in a box once per set (also smashes urns).
- Statuses (`Actor.addStatus`, L4408): `burn{t,dps}` (no stack), `poison/bleed{t,dps,stacks,max=5}` (dps per stack; tick every 20f = dps×stacks/3), `freeze{t}`/`stun{t}` (enemy stunned), `slow{t}` (enemy walk ×0.5, player run ×0.55).
- Enemy scaling per stage: `hp × (1+0.42·stage)`, `dmg × (1+0.2·stage)`.

### Where items come from
| source | code |
|---|---|
| altar (level side rooms, alternates with chests) | `randomDrop(stage)` floating `ItemDrop` (L6720) |
| chest | gold + `randomDrop(stage)` on open |
| elite kill / boss kill | `randomDrop(stage)` / `randomDrop(stage+1)` + scroll + food |
| chaikhana rugs (L6778) | slot0 any `randomDrop(stage+1)`, slot1 skills only, slot2 50% plov else any; price `round((60+40·stage)·(1+0.15·tier)·priceMul)`; F buys → drop → F picks up |
| debug URL | `?stage=N&god&give=id1,id2&perks=a,b&stats=r,p,g&seed=S` |

⚠ **Stock bug**: standing on the floor at an altar, `Player.findNearby` picks the altar stand (non-usable Interactable) over its floating item, so F does nothing unless airborne (verified on the stock build). `items_ext.js` fixes it (`X.fixAltarFocus`, stands get `canUse: () => false`).

⚠ Retry ("Возродиться здесь") restores `Game.snap` taken at stage start (`slots {id,tier}`, perks, stats, gold/2) and recreates items with `create()` → anything picked up mid-stage and per-instance fields are lost. `X.give()` also writes the snap. Custom fields you put on `G.run` (e.g. `run.exMemory`) are **not** reset by retry.

## 2. Perks (`G.Perks`, L5603)
```js
register({id, name, desc, icon(ctx,size), mods:{…}, onAdd(run), <events>})
add(id)  has(id)  mod(name, base, a, b)  emit(event, a, b)  random(n, exclude)
```
- mods (value → value): `dmgOut(v, info, target)` (may set `info.crit=true`), `dmgIn(v, info)`, `maxHp, speed, airJumps, cheatDeath, heal` (flask), `cooldown, gold`.
- events: `onHit(target, info)`, `onKill(enemy, info)`, `onHurt(info, dmg)`, `onStageStart(planEntry)`, `onParry(info)`, `onDodge(info)`, `onRoll(player)`, `onHeal(amount)`, `onSkill(item)`.
- `maxHp` mods need `onAdd(){ G.world.player.syncStats(false) }` to apply immediately (as `barys_heart`).
- Shaman: `Game.offerPerk` → `Perks.random(3)` = 3 random **unowned registered** perks → card choice → `add`. New perks enter the pool automatically (`noOffer` via items_ext to exclude).
- Timed modifiers: `G.Buffs.add(id, seconds, {mods, tick(player,buff), drawFx(ctx,player,buff), onEnd})` (merged into `Perks.mod`; used by smoke bomb/tumar).
- Icons: `G.WeaponsLib.makeIcon(draw)` — vector drawing in a 16-unit box at 0,0, baked with outline/rim like stock perks.

## 3. `items_ext.js` API (all tested)
```js
const X = G.ItemsExt;
X.clone(baseId, newId, patch, {dmgMul, speedMul, recolor})   // deep-copies combo/air; returns registered def
X.colorFn({map:{'#d4ddf0':'#a8f0e8'}, hue, sat, light, minSat}) // recolour spec
X.recolorIcon(icon, spec)  X.recolorHeld(held, spec)          // held: remaps WeaponsLib.pen colours while drawing
X.give(id, tier, slot?, {dropOld, keepOnRetry=true, toast=true})
X.drop(id, tier, x?, y?, onAltar)   X.altar(id, tier, x, y)   X.shopRug(id, tier, x, y, price?)
X.forceNext('altar'|'shop', id, tier, {slot, biome})          // next spawned altar/shop rug gets this item
X.perk(def)   X.perkIcon(draw)
```
New optional def fields enabled by its hooks: `def.dmgMul` (wraps `Combat.playerDmg`, tooltip shows it), `def.onAnyHit(player, target, info, item)` (wraps `Combat.hit`, successful hits with `info.item`), skill `def.canUse(p,item) → true | 'message'` (wraps `ItemKinds.skill.start`: refused = text + "denied", no cast, no cooldown), perk `noOffer`.
Pen art (`G.WeaponsLib`): `heldOf(penDraw)`, `pixIcon(penDraw,{ang,cu,cv,outline,post})`, `pen` (`line(u0,v0,u1,v1,w,col)`, `dot, path, disc, ring, poly`; u along blade from hand), `worldDraw`, `handW(p)`, `wpt(p,u,v)`, `FXL` (sparks/fire/ice/dirt/smoke), `Buffs`.

## 4. Recipes (in `recipes.js`, verified by `test/recipes_test.js`)
**(a) clone + retune + recolour**
```js
const saber = X.clone('kylysh', 'ex_tithe_saber',
  { name: 'Сабля десятины', desc: '…', color: 'purple', weight: 6 },
  { speedMul: 0.85, dmgMul: 1.1, recolor: { map: { '#d4ddf0': '#a8f0e8', '#e0b050': '#8a7ad8', /*…*/ } } });
saber.combo[2].stun = 40;           // steps are plain copied data
```
Checked: windups 5/5/10→4/4/9, base untouched, playerDmg 12→13.2, smear colours changed, hits land. (a2) `ex_singer_sword`: own pen art via `heldOf`/`pixIcon`.
**(b) special on-hit** (`ex_memory_sickle`, clone of `oraq`, `recolor:{hue:175,minSat:0.3}`)
```js
onAnyHit(player, target, info, item) { MEM.gain(info.crit ? 3 : 1);
  if (info.crit) player.heal(Math.round(player.maxHp * 0.03)); G.ExRecipes.onSickleHit?.(target, info); }
// + every step: st.status = { ...st.status, slow: { t: 90 } }
```
Checked against an independent `Combat.hit` spy: 7 hits → 7 callbacks, 4 crits → +12 HP, slow + bleed 5 stacks.
**(c) skill with custom cost, stock visuals** (`ex_singer_drum` from `dauylpaz`)
```js
const drum0 = G.Items.defs.dauylpaz;
X.clone('dauylpaz', 'ex_singer_drum', { name: 'Бубен Певца', cooldown: 420, noDrop: true,
  canUse: () => MEM.v >= 10 || 'Нужно 10 памяти',
  use(p, item, ws) { MEM.spend(10); drum0.use.call(this, p, item, ws); p.heal(p.maxHp * 0.05); } }, { dmgMul: 1.25 });
```
Checked: refused w/o memory (cd 0), cast spends 10, cd 420, stun, 14×1.25=17.5 dmg, heal. (c2) `ex_memory_bolt`: raw `new G.Projectile({…, info:{item, type:'skill', skill:true}})` → onAnyHit +2 works.
**(d) perk** `ex_echo_tamga`: `mods:{maxHp:v=>v*1.1}`, `onAdd` syncStats (100→110), `onKill` +5; appears in `Perks.random`.
**(e) placement**: `X.forceNext('shop','ex_singer_drum',0,{slot:1}); G.Game.loadStage(1)` → rug sells it (price 120), F buy → F pick → skill1. `X.forceNext('altar','ex_memory_sickle',2)` → stock altar; full weapons → swap modal → kylysh dropped. `X.give()` → slot + HUD + snap. Also `?give=ex_…` and `G.START_WEAPON='ex_tithe_saber'` work; retry keeps `give` items, drops raw `run.slots` writes.

## 5. HUD
Per frame (render fn L6926): world → `G.dctx` (480×270 game canvas) → **pixel pass** `G.UI.drawPixel(G.uictx, state)` on `G.uiPx` (480×270, cleared each frame, composited onto dctx) → fade → **text pass** `G.UI.draw(G.hctx, state)` on the overlay canvas `#hud` with `setTransform(G.hud.width/480)` (so draw in 480×270 units). Both call the same layout `Ye(ctx,state)` with flag `I`: sprites/bars/pixel fonts draw only in the pixel pass, Rubik text only in the text pass. Helpers are closure-private; HUD state via `G.UI._debug()` → `{modal, hud: Se (show, goldShown, hpTrail…), bossCard, card}`.

Play HUD (L40579, UI coords): panel `lt(4,4,W,39,'hud')`, `W = max(f+40, 7·maxFlasks+keycap+3 + 9+goldTextW + 18, 64)`, HP bar width `f = clamp(round(84+0.3·(maxHp−100)),84,150)`; HP frame (8,8,f+2,9), fill (9,9,·,7) with trail/recov segments and 25-HP ticks, text at (f+14,10); flasks (7+7i, 20), heal key (8+7·maxFlasks+1, 21); gold coin (W−1−goldW, 22); stats ◆ (8+20i, 33); player status icons (W+7+10k, 6); perk icons centred (14+18k, 54) ×12; slots (6|30|60|84, 238) 22×22 with cooldown pie, "+tier", ammo; minimap (376,4); biome name/timer right. Colours: hp #d8423a/#ff7a5a/#7a1c22, frame ink #120c14 / inner #2a1e2a.

**Custom bar (runtime, `hud_bar.js`)**
```js
G.HudBars.add({ id: 'memory', value: () => mem / max, text: () => mem + '/' + max,
                color: '#4ec9b8', hi: '#9ff6ff', lo: '#22706e', visible: () => true });
```
Wraps `G.UI.drawPixel`; before the stock HUD draws, paints a second "hud" panel at y=44 (same width, bar frame/fill/3×5 digits copied from the engine, same fade alpha incl. boss card); stock perk row is pushed down by wrapping perk icons (translate when drawn on `G.uictx` at y=54, size 16). Drawing first keeps tooltips/toasts/modals on top. Verified: pixel colours, width tracks HP bar (maxHp 125, 3 flasks, gamepad keycap), pause, chaikhana, boss card.
**Optional in-panel variant**: apply `hud_inpanel_patch.py` (4 unique exact replacements; add the tuples to the build's REPLACE list) → bars sit right under the HP bar inside the panel; `hud_bar.js` auto-detects it; with no bars the HUD is identical to stock.

## 6. Gotchas
- `weight` defaults to **10** (stock 5–10) → new items drop often; use `minStage`, `noDrop`.
- `Items.create(unknownId)` → null + `console.warn('no item')`; saves/snaps store ids — never remove a shipped id.
- `Items.register` with an existing id replaces the def; live instances keep the old `item.def`.
- Skill `use` constants aren't tunable without rewriting → use `dmgMul`; tooltip "Урон" needs `def.dmg`.
- Projectile hits carry no item unless you put it in `info`; bow arrows: add in `onFire`.
- `onHitEnemy` ≠ successful hit (see above). Tooltip kind label: wmelee shows "Оружие".
- HUD helpers aren't exported; `hud_bar.js` copies them — if the engine's HUD layout changes, recheck the y=54 perk row and panel formulas.

## Screenshots (`engine_docs/items/shots/`)
`art_sheet.png` (icons top / held art bottom: kylysh, tithe saber, singer sword, oraq, sickle, knives, bolt), `a_saber_swing.png`, `a_hud_slot.png`, `b_sickle_hits.png`, `c_drum_refused.png`, `c_drum_cast.png`, `c_drum_cooldown_hud.png`, `d_hud_bar_perks.png`, `d_hud_bar_crop.png`, `d_perk_offer.png`, `e_shop_tooltip.png`, `e_after_buy_hud.png`, `e_altar.png`, `e_swap_modal.png`, `e_manual_altar_rug.png`, `g_sword_swing.png`, `g_bolt_flight.png`, `hud_compare.png` (stock | runtime bar | low HP+pad+wide | in-panel patch | patch with no bars), `hud_runtime_pause.png`, `hud_runtime_chaikhana.png`, `hud_runtime_boss.png`.
