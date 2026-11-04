# Audio in the Kök Börü engine: music, sfx, and how to extend them

Everything here was checked against `kyok/main.js` (2026-10-28 build) and tested in headless Chromium. Live WebAudio runs there at 44.1 kHz.
Scratch folder: `engine_docs/audio/`
- Readable engine source: `main.pretty.js`. The audio module is lines 8376–11253.
- Library: `audio_ext.js`
- Build hook: `hook_audiokit.py`
- Example tracks: `tracks_dark.js`
- Recipes: `recipe_a/b/c/e_*.js`
- Tests: `test/run_all.js` and `test/death.js`
- WAV renders: `out/*.wav`
- Test results: `out/report.json`

## 1. How music works

**Everything is private.** The audio module is one IIFE. `G.Audio` is the only public object. It has:
- `init`, `unlock`, `music(name)`, `sfx(name, opts)`
- `setVolume(music, sfx)`, `muted`, `toggleMute`
- `setIntensity(v|null)`, `intensity`, `current`, `volume`, `ready`
- `tracks` and `sfxNames`. Both are **snapshot arrays**: tracks you add later are missing from them.
- `phraseLengths()`, `sfxStats()`
- `renderTest(name, secs, intensity, skipBars)`, an offline render through `OfflineAudioContext` that returns peak, rms and NaN stats.

**Tables inside the closure** (minified names):

| Name | What it is |
|---|---|
| `Ut` | Track table: `title bukhara zindan steppe bazaar alatoo afrasiab registan chaikhana boss_kempir boss_barys boss_aidahar death victory arena` |
| `Vt` | Aliases: `dawn→bukhara, samarkand→bazaar, eclipse→registan, boss→arena, rest→chaikhana, kempir_lair/barys_shrine/registan_square→arena, menu→title, gameover→death, win→victory, kempir/barys/aidahar→boss_*` |
| `$t(name)` | Name resolution, in this order: `Ut[name]` → `Vt[name]` → regex `/boss_?(kempir\|barys\|aidahar)/` → **`'arena'`**. A typo in a track name silently plays `arena`. |
| `Ct` | Pre-parsed melodic phrases (`tiA`, `bkB`, `chB`, …) |
| `Rt(str)` | Phrase parser (see the grammar below) |
| `bt` | Drum letters for `yt` patterns |
| `wt` | Bowed and wind voice presets |
| `I` | Plucked-string presets |
| `H` | Percussion one-shot generators. `"dum tek …"` is the list of these samples (`se`) that are pre-rendered at unlock. |
| `B` | The sfx table |

**Track = code object.** Section names are free text:
```js
Ut.zindan = { bpm:70, root:50, scale:ot, vol:.95, form:[["A",8],["B",8],["C",8],["B",8]], // [section, bars]
  spb:4, barLen:16, echoBeats:.75, loopFrom:0,     // optional: steps per beat, steps per bar, echo delay in beats, where the loop restarts
  setup(t){…},  bar(t, time){…},  step(t, time, stepInBar){…} }
```
- **Fields the scheduler reads:** `bpm`, `spb`, `barLen`, `vol`, `echoBeats`, `form`, `loopFrom`, `setup`, `bar`, `step`.
- **`root` and `scale` are informational only.** Each `step` hard-codes its roots and scale arrays.
- **Track state `t`:**
  - Position: `sec`, `sb` (bar in section), `barIdx`, `secLen`, `cycle`
  - `fill`: true on the last bar of a section, with 65% probability
  - `int`: combat intensity 0..1
  - `sd`: seconds per step
  - `barSteps`
  - Outputs: `out`, `wet` (reverb), `echo`
  - `nodes`, `strings`
- **Scheduler:**
  - `setInterval(25 ms)` with 0.2 s of lookahead.
  - `bar()` runs at step 0, then `step()` runs for each step.
  - Steps that arrive late are skipped.
  - Errors in `bar`/`step` are caught, but only the first one is logged (`console.warn("[audio] track", id, e)`), so a broken track goes partly quiet without further messages.
- **Intensity:**
  - Recomputed every 0.4 s as (aggro enemies)/5, or 1 during a boss fight.
  - Smoothed (attack 0.35, release 0.08).
  - `setIntensity(v)` overrides it; `setIntensity(null)` returns to automatic.
  - When the player is below 25% HP, a `heartbeat` sfx plays every 1.1 s.

**Phrase grammar (`Rt`):** `deg[#|b][:steps][~][*][^][t]`
- `deg` is a scale degree; it can be negative.
- `r` is a rest. `|` is ignored.
- Default length is 2 steps. Steps are 16ths when `spb` is 4.
- `~` glides into this note from the previous one and holds the previous note legato.
- `*` adds an upper grace note. `^` accents the note (×1.15). `t` adds a trill.
- A bad token is warned about and skipped, which also shifts the timing of everything after it.
- Phrases are played as `Ft(t, voice, ph, time, 16*t.sb+a, rootMidi, scaleArr, {vel,dt,tr})` for voices and `Pt(t, bus, ph, time, idx, root, scale, inst, tremolo, vel)` for plucks. A phrase loops with its own length.

**Drum patterns:** `yt(0, bus, time, "D..tD.tTD.t.DtTj", stepInBar, vel)` plays one character per step. The pattern loops inside the bar.
- Engine letters: `D/d` dum, `T/t` tek, `k` tak, `j` jingle, `J` roll, `B/b` dauyl (big drum), `O` boom, `S/s` sub, `c` clap, `h` shaker, `m` tom.
- Any other character is a rest.

**Scales:**
- `et` aeolian, `at` dorian, `ot` phrygian, `st` hijaz (phrygian dominant), `nt` mixolydian, `it` major, `rt` major pentatonic, `lt` neutral `[0,2,3.5,5,7,9,10.5]`.
- Quarter tones work. Plucks round to the nearest half-semitone.

**Instruments** (all built on the track state; the opts objects are `{g, pan, wet, echo, lp}`):
- `ct(t,opts)`: a bus. The input gain feeds lowpass → pan → `t.out`, plus wet and echo sends.
- `new vt(t, midi, {g, ot, lp, sub, wet, pan})`: drone.
  - Two detuned saws plus a sub sine at half frequency.
  - `lp` is a **multiple of f**, not Hz.
  - With `ot` (a gain) it adds two narrow bandpassed overtones, which gives a throat-singing effect.
  - Methods: `.root(time, midi, tc)`, `.ot(time, harmonic, tc)`, `.breath(time)`.
- `new Mt(t, preset, opts)`: monophonic bowed or wind voice (`kobyz`, `flute`, `sato`, `surnay`). Method: `.note(time, midi, durSec, vel, {glide, grace, trill, slide})`.
- `ut(t, bus, time, midi, gain, inst, chokeKey)`: Karplus–Strong pluck, cached per instrument and half-semitone in the `X` map.
  - Presets: `dombra dutar tar tanbur komuz bass bowstr ui`.
  - `pt(…, [midis], …)` strums a chord.
- `mt(0, bus, time, sample, gain, rate)`: plays an `H` sample (`dum tek tak jingle roll dauyl boom sub tom clap shaker drip chain bell bird bird2 whisper`). `xt(0, bus, time, midi, gain)` plays the pitched bell.
- `Tt(0, bus, time, [midis], holdSec, level, {wave, att, rel, det})`: pad.
- `St(t, opts)`: choir formant bus to feed `Tt` into.
- `At(0, bus, time, midi, holdSec, level)`: karnay-style brass swell.
- `kt(t, amount, whistle)`: wind bed. `dt(t, buf)` loops a buffer (the white, brown or crackle beds).

**Signal graph and volume:**
- Track outputs go to `mDry`, `mWet` and `mEcho`. Each has gain `musicVol*0.55`.
- `mDry` → duck gain → master (0.9) → compressor (−16 dB, 4:1) → limiter (−2.5 dB).
- `mWet` → one shared convolver, a synthetic 2.8 s impulse at gain 0.8.
- `mEcho` → one shared delay with time `min(1.5, 60/bpm*echoBeats)`, feedback 0.32, lowpass at 2.6 kHz.
- sfx go to the master directly, plus an optional reverb send.
- Settings defaults are music 0.7 and sfx 0.8 (localStorage key `kokbori_settings_v1`), applied with `setVolume`.

**Switching tracks (`music(name)` → `ee()`):**
- Requesting the track that is already playing (same resolved name) does nothing.
- Otherwise the old track fades out over 1.5 s and the new one fades in over 1.5 s.
- For `death`: 0.8 s out, 0.4 s in.
- `music(null)` fades to silence over 2 s.
- Every instrument is rebuilt in `setup` each time a track starts.

**Names the game requests:**

| When | Name requested |
|---|---|
| Title screen | `'title'` |
| Stage start | `biome.music \|\| biome.id`. Biomes carry `music:` (e.g. `bukhara`, `steppe`, `kempir_lair→'boss_kempir'`). Rest stops use the `chaikhana` biome. |
| Boss stage start | `biome.music \|\| 'boss'` |
| Boss fight start | `bossDef.music \|\| 'boss_'+id` (defs have `music: 'boss_kempir'`, etc.) |
| Boss killed | `'chaikhana'`, or `'victory'` after aidahar |
| Player death | `'death'` |
| Run won | `'victory'` |
| Fallback biome | `music: 'zindan'` |

## 2. Sfx

- `G.Audio.sfx(name, {x, vol 0..2, pitch})`.
  - `x` is a world position; it gives stereo pan and distance attenuation relative to the camera.
- **50 sfx definitions** in `B`, each `{vol, vars, max, prio, pv, wet, duck, gen()}`:
  - `swing swing_heavy whoosh throw hit hit_heavy crit boss_hit enemy_die player_hurt jump double_jump land roll step climb coin pickup chest door heal drink parry shield_up shield_block bow arrow_hit explosion fire ice thunder magic telegraph stomp stomp_start scroll buy denied ready break death boss_roar ui_move ui_select ui_back victory summon poison heartbeat blip`
  - `vars` variants are pre-rendered (at unlock).
  - `pv` is random pitch variation (default ±5%).
  - `duck` dips the music: explosion, thunder, stomp, death, boss_roar.
- **Unknown names** go through a keyword table `z`:
  - `roar|scream`→boss_roar, `slam|quake`→stomp, `spell|orb`→magic, and so on.
  - Anything that matches nothing plays `blip`.
  - A static scan found 44 names actually requested; all are direct `B` keys.
- **Voice limits:**
  - Per sfx: at most `max` starts within 50 ms.
  - Globally: 40 voices for prio<3, 28 for prio<2, 56 absolute.

## 3. How to extend it

### Build hook (one exact replacement; optional, but needed for new instruments and tracks)

`hook_audiokit.py` defines `AUDIO_HOOK = ('let ne=!1;t.Audio={', 'let ne=!1;t.AudioKit={…};t.Audio={', 1)`. Add it to yodgor's `REPLACE` list; the anchor is unique.

It publishes `G.AudioKit` with:
- Tables: `Ut Vt Ct scales voices strings drumMap percGen sfxDefs sfxCache …`
- Helpers, under the engine signatures above: `parse deg bus pluck strum hit bell drums Voice Drone wind choir pad brass phrase pluckPhrase dsp envAD … ks ksCache toBuf mtof`
- Scheduler internals: `resolve start schedule`
- Getters: `ctx() graph() current() SR() intensity() noise()`

It only adds an object; engine behaviour is unchanged.

### Runtime layer `audio_ext.js` → `G.Music`

Load it after the engine (`build_test.py` shows the pattern).

- **Without the hook** it still captures `Ut` and `Vt`, right after the first unlock. It does this with a one-shot, non-enumerable `Object.prototype` getter probe through `renderTest`.
  - What works in this mode: remap, alias, tempo/form variants, and voice/drone retuning.
  - Calls made before then are queued.

Tested recipes (code is in the files):

- **(a) New track in engine code format.** See `recipe_a_new_track.js`: `G.AudioKit.Ut.yd_lament = {bpm, form, setup, bar, step}`, then `G.Audio.music('yd_lament')`.
- **(b) Darker variant.** See `recipe_b_dark_variant.js`:
  ```js
  G.Music.variant('bukhara','bukhara_night',{ bpm:76, transpose:-3, mode:'phrygian',
    drums:{j:null,J:null,c:null,T:['tom',.55],t:['tek',.2]},
    buses:{pc:{lp:1400,wet:.25},bdL:{mute:true},bdR:{mute:true},pad:{mute:true}},
    voices:{wet:.3}, tone:{lp:3800}, layers:[{drone:28,g:.1,lp:2.5,wet:.6},{wind:.05}] })
  ```
  How each option is applied:
  - **Mode change:** every pitch is moved at the instrument level. Voices (`.note`) and the drone (`.root`) are wrapped on the instance, and plucks are re-pitched through a temporary `ksCache.get` override during each `step`/`bar`. Out-of-mode notes snap down (B→B♭).
  - **`drums`:** the drum letters are patched only for the duration of the call.
  - **`buses`:** a filter, gain or mute is inserted in front of each bus head on `t`.
  - **Not retuned:** pads and bells, which use literal pitches. Mute them instead.
- **(c) Remap.** See `recipe_c_remap.js`:
  - `G.Music.remap({title:'yd_title', bukhara:'yd_roofs', chaikhana:'yd_dream', death:'yd_tunnels'})` wraps `G.Audio.music`. Use this for names that already exist as tracks, because `$t` returns an existing track before it ever consults an alias.
  - `G.Music.biome('steppe','yd_tunnels')` and `G.Music.boss('kempir','yd_boss_water')` set the `music` field on the data.
  - `G.Music.alias({boss:'yd_boss_water'})` writes to `Vt`.
  - For new biomes, just give them `music:'…'`.
- **(d) Tracks as data, via the engine's own parser.** See `tracks_dark.js`. The schema:
  ```js
  G.Music.define('yd_tunnels', { bpm:50, root:40, mode:'phrygian', vol:.95, form:'A:8 B:8 C:8', layers:[
    {drone:40, ot:4, harm:[6,7,6,5], breath:4},  {wind:.03},  {drums:'H.......', lp:700},
    {fx:['drip','plunk'], count:[1,3], pitch:[.5,.75,1], wet:.9, echo:.45},
    {voice:'kobyz_dark', root:52, phrase:{B:'0:32~ | 1:16 0:16 | …', C:'…'}},
    {pad:[[40,47,52],[41,48,53]], choir:true, every:2, in:'C'} ]})
  ```
  - **Layer types:** `drone voice pluck ostinato drums pad brass fx bells hit wind crackle custom`.
  - **Common keys:**
    - `in` (sections), `minInt`/`maxInt`, `vel`/`velInt`, `root`, `mode`
    - `g pan wet echo lp`, `every`/`offset`
    - Per-section values via `{A:…, B:…, '*':…}`
    - `'@chB'` reuses an engine phrase
  - **`ostinato` patterns:** digits index into `notes`. `A`–`J` play that note as a double-stop with the drone string (`pair` degree).
  - **Extra modes:** `bayati saba hijaz hijazkar harmonic locrian minpenta …`.
  - **Added instruments:** voices `ney kobyz_dark keen`; strings `dutar_dark tanbur_dark chang`.
  - **Added drum letters:** `F/f` frame drum, `L/l` muted slap, `H` heartbeat, `w` water plunk, `G` gong.
  - **Validation:** bad phrase tokens, drum letters and voice names throw at `define()` time. A layer that throws at runtime is disabled with one warning; the rest of the track keeps playing.
- **(e) Sfx.** See `recipe_e_sfx.js`:
  - `G.Music.sfx.redirect({coin:{pitch:.8}})` works at runtime with no hook.
  - `sfx.define(name, {vol,vars,max,prio,wet,gen(){return Float32Array}})` and `sfx.replace` need the hook.
- **Offline audition.** `await G.Music.render(name, secs, {intensity, skipBars})` returns `{stats, buffer}` (the buffer is captured from `renderTest`). `G.Music.wav(buffer)` turns it into a 16-bit WAV.

### Example tracks (`tracks_dark.js`, all verified)

| Track | Brief | Design |
|---|---|---|
| `yd_title` | dark title | D phrygian, 54 bpm, overtone drone, low kobyz lament, ney answers, frame drum, gong; ends on a choir and bells |
| `yd_roofs` | night rooftops of a poor district | A bayati (quarter-tone 2nd), 68 bpm, tired swung dark dutar, ney, muffled frame drum, embers, drips, whispers |
| `yd_tunnels` | water tunnels inside a sleeping giant | E phrygian, 50 bpm, breathing drone, 25-bpm heartbeat, drips and plunks, slow kobyz, power-chord choir |
| `yd_palace` | gilded palace of tyrants | D hijaz-kar, 80 bpm, court tanbur, karnay swells, dauyl and tom ceremony, surnay muffled as if through walls, gold bells |
| `yd_dream` | dream city of others' memories | F# minor, 63 bpm. Replays the engine's own melodies (chaikhana, bukhara, old title) in minor over sine shimmer and whispers |
| `yd_boss_water` | grief-mad water spirit | 12/8 at 112 bpm, hijaz plus a keening saba wail, kobyz drive, booms, water, whispered breakdown |

## 4. Test results (`test/run_all.js`, `test/death.js`)

- **Live playback.** Every new track became `G.Audio.current`, with no errors or warnings. In the first 5 s each one started 5–23 buffer sources and 12–32 oscillators.
- **Offline renders.** 20 s WAVs are in `out/`. There were 0 NaN samples and 0 silent 250 ms windows.

| Render | RMS | Peak | Spectral centroid |
|---|---|---|---|
| `yd_title` | −20.1 dB | 0.54 | 1.2 kHz |
| `yd_roofs` | −21.5 dB | 0.41 | 3.0 kHz |
| `yd_tunnels` | −17.2 dB | 0.66 | 1.2 kHz |
| `yd_palace` | −19.3 dB | 0.62 | 1.8 kHz |
| `yd_dream` | −23.5 dB (after raising `vol` to 1.25) | | 2.4 kHz |
| `yd_boss_water` | −16.4 dB | 0.61 | 2.2 kHz |
| Engine tracks, for comparison | −15 to −22 dB | | 2.0–3.6 kHz |

- **Variant.** `bukhara` measures −18.3 dB and a 3.57 kHz centroid. `bukhara_night` measures −16.8 dB and a **1.09 kHz** centroid, at 76 bpm instead of 108.
- **Remap through real game transitions:**

| Transition | Plays |
|---|---|
| Title | `yd_title` |
| Stage 0 (bukhara) | `yd_roofs` |
| Rest (chaikhana) | `yd_dream` |
| Steppe | `yd_tunnels` |
| Kempir arena stage start | `boss_kempir` (that biome's `music` was not changed) |
| Kempir fight start | `yd_boss_water` |
| Death | `yd_tunnels` |

- **No hook.** The tables are captured after unlock. A queued `variant('title','title_low',…)` plus a remap played correctly (`out/nohook_title_low.wav`, −22.4 dB).

## 5. Gotchas

1. **Never call `renderTest` (or `G.Music.render`) before the first `G.Audio.unlock()`.** Doing so caches the reverb impulse at 48 kHz. On 44.1 kHz devices `unlock` then throws (ConvolverNode sample-rate mismatch) and there is no audio for the whole session. This was reproduced. `audio_ext.js` guards against it.
2. **A `setup()` that throws is retried every 25 ms.** The engine's `l` stays null, so it keeps calling `setup`, and every attempt leaks running, connected oscillators. Never let `setup` throw. `define()` wraps each layer in try/catch.
3. **Unknown track names silently play `arena`.** Aliases in `Vt` are ignored for names that already exist in `Ut`; use `remap` for those.
4. **`G.Audio.tracks` and `sfxNames` are snapshots.** The ext pushes new names into them.
5. **Voices are monophonic, and drones run for the whole track.** To gate a drone by section, use its `br` gain (the ext does this when you give the layer `in`).
6. **The reverb and echo buses are shared.** Each track start retimes the echo delay with `echoBeats`.
7. **New instrument names must not end in a digit.** The pluck cache key is instrument name + MIDI number.
8. **Unknown drum letters are silent rests.** A bad phrase token is skipped and shifts the timing. `define()` validates both.
9. **Built-in step functions hard-code pitches.** That is why variants retune at the instrument level and cannot shift pads or bells.
