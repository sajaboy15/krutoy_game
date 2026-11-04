# Hero head (replace the blue flame with a human head)

Patch: `engine_docs/head/patch_head.py` (`REPLACEMENTS=[(old,new,count)]`, 12 entries, each verified to occur exactly once in kyok/index.html; `apply(src)` asserts counts). Patched test page: `engine_docs/head/index_head.html` (`python3 -I head/patch_head.py`). No runtime script is required; everything is build-time.

## How the hero is drawn (original)
- Player module (`t.PLAYER_PAL=i;` ... `class p extends t.Actor`). `draw()` -> `a.puppet(ctx,x,y,{w:96,h:80,ox:48,oy:64,flip,outline:i.out,rim:{color:"#fff3d6",dx:-1,dy:-1,a:.35}}, c=>this.drawPuppet(c,pose))`. `a.process` thresholds alpha, **snaps every colour used by <4 pixels to the nearest frequent colour**, adds rim + outline. Hence head features use colours with >=4 px or accept snapping.
- `drawPuppet(o,s)`: scarf, back arm/leg, boots, front leg, torso sprite rows (`a.sprite("torso",f,c)` at `sh-[4,1]`), held item, front arm, hand, then a grey neck stump `o.fillStyle="#7a7268",o.fillRect(...n[1]-2,3,2)` and `this.neck={x:n[0],y:n[1]-2}`. Roll rotates the ctx about (0,-9) by `roll*90deg`. `drawDead(t)` rotates by `-1.5*o` and draws a pants line + torso at (-4,-26).
- Head = flame in `drawFx(o)`: `a.drawFlame(o,s,n,t.time,{w:9,h:13,pal:a.FLAME_SPIRIT,...})`, two white eye pixels, `t.Glow.add(...,"#6fe3d1",.55)`, wisp `t.FX.spawn` every 4 frames, roll glow, flame drifting off the corpse while dead.
- UI module: `Pt(t,key,x,y,time)` bakes 32x32 portraits (`translate(16,17),scale(.55)`); the hero is the default `else` branch (robe + collar + neck stub) plus `"hero"===e&&I&&a.drawFlame(...)`; hero excluded from blinking. `Ot()` backdrop (title, intro page>=3, victory) draws `Lt.hero=a.bake(34,36,...)` at `(Gt-12,Ht-33)` + a flame. Death screen draws a shrinking spirit flame at `(s/2,64)` above "КУТ УГАС".
- Not hero (left untouched): title-logo flame between the horns, "Классика" mode balbal icon flame, pause campfire, minimap marker, loading text. No HUD/touch hero icons.

## What the patch does

1. Adds palette keys `skinD,hair,cap,capW` to PLAYER_PAL and `G.HERO_HEAD` (7x9 pixel head sprite facing right, anchor = neck; closed-eye variant for hurt/dead/blink every 220 frames; head tucked +2,+6 while rolling; 12x20 portrait face map with blink; `fallen()` lying hero built from the real rig rotated -90deg; `deathIcon()`).
   - old: `t.PLAYER_PAL=i;`
   - new: `t.PLAYER_PAL=i;Object.assign(i,{skinD:"#a8825f",hair:"#2e2220",cap:"#231e2c",capW:"#eee6d2"});t.HERO_HEAD={v:1,rows:[".KKKWK.","KKKWKKK","KKKKKKK","HH…`

2. drawPuppet: draw head after the torso, before weapon/near arm.
   - old: `o.drawImage(S,0,e,S.width,1,T+a,A+e,S.width,1)}const F=s.item;`
   - new: `o.drawImage(S,0,e,S.width,1,T+a,A+e,S.width,1)}t.HERO_HEAD.draw(o,n[0],n[1]-2,this,s);const F=s.item;`

3. remove grey neck stump.
   - old: `o.fillStyle="#7a7268",o.fillRect(Math.round(n[0]-1),Math.round(n[1]-2),3,2),this.neck=`
   - new: `this.neck=`

4. drawDead: head on the corpse (eyes closed).
   - old: `t.drawImage(a.sprite("torso",f,c),-4,-26)}`
   - new: `t.drawImage(a.sprite("torso",f,c),-4,-26),window.G.HERO_HEAD.draw(t,0,-27,this,{dead:1})}`

5. drawFx: remove flame, eye dots, head glow, wisps, roll glow (item drawFx/debug kept; hit/death bursts in takeHit/die kept).
   - old: `let s,n;if("roll"!==this.state&&this.neck)if("dead"===this.state){const t=Math.min(1,this.stateT/24);s=this.x-22*this.facing*t,n=this.y-24+22*t}else s…`
   - new: (empty)

6. Pt default branch -> `window.G.HERO_HEAD.portrait(a,e)` (front face: doppi with white pepper motif, brows, eyes, beard, fur collar, robe).
   - old: `:(a.fillStyle="#2b3a6b",a.beginPath(),a.moveTo(-30,34),a.quadraticCurveTo(-22,8,0,8),a.quadraticCurveTo(22,8,30,34),a.fill(),a.fillStyle="#e8b850",a.f…`
   - new: `:window.G.HERO_HEAD.portrait(a,e)}),{outline:null})`

7. Portrait: hero blinks, flame removed.
   - old: `(e,n%200<7&&"stone"!==e&&"hero"!==e),o+2,s+2),"hero"===e&&I&&a.drawFlame(t,o+18,s+18,n/60,{pal:a.FLAME_SPIRIT,w:9,h:13,glow:"#6fe3d1",glowR:12,glowA:.35})}`
   - new: `(e,n%200<7&&"stone"!==e),o+2,s+2)}`

8. Lt.hero bake 34x44, translate(12,41).
   - old: `Lt.hero=a.bake(34,36,(t=>{t.translate(12,33);`
   - new: `Lt.hero=a.bake(34,44,(t=>{t.translate(12,41);`

9. Lt.hero: head instead of neck stump.
   - old: `t.fillStyle="#5f584f",t.fillRect(-1.5,-27.5,3.5,3),`
   - new: `window.G.HERO_HEAD.draw(t,0,-27,null,{}),`

10. Ot: draw at Ht-41, no flame.
   - old: `o.drawImage(Lt.hero,Gt-12,Ht-33),a.drawFlame(o,t+1,e-1,h,{pal:a.FLAME_SPIRIT,w:9,h:14,glow:"#6fe3d1",glowR:18,glowA:.4})}`
   - new: `o.drawImage(Lt.hero,Gt-12,Ht-41)}`

11. Heal pose (optional): flask raised to the mouth (5,-24) instead of the old flame position.
   - old: `a.nh=[e.lerp(4,2,t),e.lerp(-13,-26,t)],a.flask=!0`
   - new: `a.nh=[e.lerp(4,5,t),e.lerp(-13,-24,t)],a.flask=!0`

12. Death screen: fallen hero (2x) on a ground line instead of the flame.
   - old: `I&&(e.globalAlpha=i*h,a.drawFlame(e,s/2,64,X/60,{pal:a.FLAME_SPIRIT,w:u(13*f)+3,h:u(22*f)+4,glowR:u(24*f),glowA:.3}),e.globalAlpha=i,ut(e,s/2-7,64,14,…`
   - new: `I&&(e.globalAlpha=i,window.G.HERO_HEAD.deathIcon(e,s/2,64));`


Exact full strings: see `REPLACEMENTS` in patch_head.py (the head module source is `HERO_HEAD_JS`, joined to one line). Compatible with the yodgor portrait hook (`PORTRAITS`/`PORTRAIT_BG` replacements do not overlap; with that hook `G.PORTRAITS.hero` would still override).

Design: skin `PLAYER_PAL.skin #c9a27f`, shade `#a8825f`, hair/beard `#2e2220`, doppi `#231e2c` with `#eee6d2` motif (in-game the 2 motif pixels get snapped to the nearest light colour — reads as a small cream mark; can be removed by replacing `W` with `K` in `rows`). Tweak at runtime via `G.HERO_HEAD.rows/face/tuck` and bump `G.HERO_HEAD.v` (sprite cache key).

Story/text still referring to the flame head (not changed here): intro pages 3–4 in story data, "КУТ УГАС", "Кут не угас!", loading "Кут летит дальше…". Player light `t.Light.add(...,"#bff8ff",.45)` in update and cyan hurt/death/double-jump bursts kept as generic FX.

## Verification (Playwright, no console/page errors)
Scripts in head/: `poses2.js` (studio renders of every state), `poses.js` (in-game crops + death screen), `ui.js` (title, intro, dialogs, death, victory), `lab*.js`/`ptlab.js` design labs. Screenshots in `engine_docs/head/out/`:
- poses: sheet_p1.png (idle/run/jump), sheet_p2.png (attacks, shield, heal), sheet_p3.png (roll, double jump, stomp), sheet_p4.png (hurt, facing left, death fall), sheet_final.png
- UI: u_title.png, u_title_hero.png, u_intro3.png, u_intro3_hero.png, u_dialog_hero.png, u_pt_hero.png (vs u_pt_aksakal.png), u_death.png, u_death_icon.png, u_victory.png, u_victory_hero.png
