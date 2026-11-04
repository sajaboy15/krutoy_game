/* audio_ext.js — runtime music/sfx layer for the Kök Börü engine (window.G.Audio).
 *
 * Load as an extra <script> AFTER the engine. Publishes window.G.Music.
 * Full features need the one-line build hook (hook_audiokit.py) that publishes G.AudioKit
 * (the audio module's private closure). Without the hook the layer falls back to a one-shot
 * probe that captures only the private track/alias tables: remap(), alias(), tempo/form
 * variants and voice/drone retuning still work; define() and pluck/drum re-voicing do not.
 *
 *   G.Music.define(name, spec)           data → engine track (uses the engine's phrase parser Rt)
 *   G.Music.variant(base, name, opts)    darker/slower/re-moded copy of an existing track
 *   G.Music.remap({request: track})      change what plays for a requested name (title, biome id, boss_*, death…)
 *   G.Music.alias({name: track})         engine-level alias (Vt) — only consulted for names that are not tracks
 *   G.Music.biome(id, track) / boss(id, track)   set biome.music / bossDef.music
 *   G.Music.sfx.define / replace / redirect
 *   G.Music.render(name, secs, {intensity, skipBars}) → {stats, buffer}; G.Music.wav(buffer) → ArrayBuffer
 */
(function () {
  'use strict';
  const G = window.G;
  const TAG = '[music]';
  if (!G || !G.Audio) { console.warn(TAG, 'G.Audio missing — load this after the engine'); return; }
  if (G.Music && G.Music.__ext) return; // loaded twice
  const A = G.Audio;
  const K = G.AudioKit || null;

  // ------------------------------------------------------------------ private tables
  // Without the build hook: Ut[name] / Vt[name] are plain-object lookups, so a temporary
  // non-enumerable getter on Object.prototype sees `this` === the table. renderTest() resolves the
  // name synchronously before its first await, renders 10 ms offline, and touches no live state.
  // It must run only AFTER the live AudioContext exists: renderTest before the first unlock() caches
  // the reverb impulse at 48 kHz and unlock() then fails on 44.1 kHz devices (ConvolverNode rate).
  function probeTables() {
    const got = {};
    const key = '__musicProbe_' + Math.random().toString(36).slice(2);
    Object.defineProperty(Object.prototype, key, {
      configurable: true, enumerable: false,
      get() {
        if (this && this.title && typeof this.title === 'object' && this.title.bpm) got.Ut = this;
        else if (this && typeof this.dawn === 'string') got.Vt = this;
        return undefined;
      }
    });
    try {
      const p = typeof A.renderTest === 'function' ? A.renderTest(key, 0.01) : null;
      if (p && p.catch) p.catch(() => {});
    } catch (e) { /* ignore */ } finally { delete Object.prototype[key]; }
    return got;
  }
  let Ut = null, Vt = null;
  const pending = [];
  const gotTables = tb => {
    Ut = tb.Ut || null; Vt = tb.Vt || null;
    if (!Ut) console.warn(TAG, 'track table not reachable; only remap()/sfx.redirect() will work');
    while (Ut && pending.length) { try { pending.shift()(); } catch (e) { console.warn(TAG, e); } }
  };
  if (K) gotTables({ Ut: K.Ut, Vt: K.Vt });
  else if (A.ready) gotTables(probeTables());
  else { // probe right after the first real unlock (context exists, before the engine's first ee())
    const unlock0 = A.unlock;
    A.unlock = function () { const r = unlock0.apply(this, arguments); if (!Ut) gotTables(probeTables()); return r; };
  }
  const whenTables = fn => (Ut ? fn() : void pending.push(fn));
  const needKit = what => { if (!K) throw new Error(TAG + ' ' + what + ' needs the AudioKit build hook (hook_audiokit.py)'); };

  // ------------------------------------------------------------------ scales
  const SCALES = {
    aeolian: [0, 2, 3, 5, 7, 8, 10], minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    hijaz: [0, 1, 4, 5, 7, 8, 10],        // phrygian dominant = engine "st" (afrasiab, aidahar)
    hijazkar: [0, 1, 4, 5, 7, 8, 11],     // double harmonic
    harmonic: [0, 2, 3, 5, 7, 8, 11],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    bayati: [0, 1.5, 3, 5, 7, 8, 10],     // neutral 2nd (quarter tone)
    saba: [0, 1.5, 3, 4, 7, 8, 10],       // diminished 4th — the most mournful maqam colour
    mixolydian: [0, 2, 4, 5, 7, 9, 10], major: [0, 2, 4, 5, 7, 9, 11],
    penta: [0, 2, 4, 7, 9], minpenta: [0, 3, 5, 7, 10],
    neutral: [0, 2, 3.5, 5, 7, 9, 10.5]   // engine "lt" (bazaar)
  };
  function scaleOf(m) {
    if (Array.isArray(m)) return m.slice();
    if (SCALES[m]) return SCALES[m];
    if (K && K.scales[m]) return K.scales[m];
    throw new Error(TAG + ' unknown mode ' + m + ' (known: ' + Object.keys(SCALES).join(' ') + ')');
  }
  const deg = (sc, d) => { const n = sc.length, o = Math.floor(d / n); return sc[d - o * n] + 12 * o; };
  // nearest scale tone at or below (quarter-tone tolerance) — lowers out-of-mode notes: B→B♭, E→E♭…
  function snap(midi, tonic, sc) {
    const rel = midi - tonic, oct = Math.floor(rel / 12), pc = rel - 12 * oct;
    let best = sc[0];
    for (const s of sc) if (s <= pc + 0.26 && s > best) best = s;
    return tonic + 12 * oct + best;
  }

  // ------------------------------------------------------------------ extra instruments (kit only)
  const VOICES = { // Mt presets: osc [type, mult, detune, gain], flt [type, f, Q, dB], vib [Hz, cents], noise [f|"track", Q, gain]
    ney: { osc: [['sine', 1, 0, .75], ['triangle', 1, 0, .16], ['sine', 2, 4, .035]], flt: [['lowpass', 2400, .7]], vib: [4.3, 11], att: .16, rel: .24, noise: ['track', 1.3, .75], chiff: .05, lvl: .5, glide: .14 },
    kobyz_dark: { osc: [['sawtooth', 1, 0, .5], ['sawtooth', 1, 7, .38], ['sawtooth', .5, -4, .2]], flt: [['highpass', 110, .7], ['peaking', 650, 1.3, 7], ['peaking', 1400, 2, 4], ['lowpass', 2300, .8]], vib: [4.6, 17], att: .22, rel: .32, noise: [1300, .9, .07], am: [21, .2], lvl: .34, glide: .18 },
    keen: { osc: [['triangle', 1, 0, .55], ['sine', 2, 6, .1], ['sawtooth', 1, 3, .08]], flt: [['peaking', 950, 1.6, 6], ['lowpass', 2600, .7]], vib: [6.2, 38], att: .12, rel: .35, noise: ['track', 2.2, .3], lvl: .42, glide: .22 }
  };
  const STRINGS = { // Karplus-Strong presets (see engine I): T60 s, S loop damping 0..0.5, bright excitation, pick position, click, body peaks
    dutar_dark: { T60: 3.4, S: .5, bright: .22, pick: .27, click: .03, body: [[140, 1, 4], [480, 1.2, 2.5]], len: 3.4 },
    tanbur_dark: { T60: 2.6, S: .32, bright: .5, pick: .12, click: .08, body: [[300, 1.4, 3], [1700, 2, 3]], len: 2.6 },
    chang: { T60: 4, S: .12, bright: .7, pick: .5, click: .04, body: [[620, 1.5, 3], [2400, 2, 2]], len: 4 }
  };
  function percGens() { // one-shot samples, rendered lazily (first use) at the engine sample rate
    const M = K.dsp, v = K.envAD, k = K.envGlide, S = K.envSweep, T = K.noiseHit, F = K.modes;
    return {
      frame() { // low frame drum (doira/bendir), no jingles
        const t = M.buf(1);
        M.osc(t, 0, 1, k(96, 56, .05), v(.002, .26));
        M.osc(t, 0, .4, k(150, 92, .04), v(.002, .06, .25));
        T(t, 0, .05, v(8e-4, .012, .45), 'bp', 650, .8);
        T(t, 0, .3, v(.004, .09, .18), 'lp', 260, .7, 'brown');
        return M.norm(t, .9);
      },
      frame_slap() { // muted rim slap
        const t = M.buf(.25);
        T(t, 0, .08, v(5e-4, .014, 2), 'bp', 1150, 1.3);
        M.osc(t, 0, .1, k(430, 330, .02), v(.001, .025, .35));
        return M.norm(t, .7);
      },
      heart() { // slow lub-dub of something huge
        const t = M.buf(.9);
        M.osc(t, 0, .45, k(62, 36, .07), v(.006, .13));
        M.osc(t, .2, .5, k(55, 33, .07), v(.006, .15, .75));
        T(t, 0, .1, v(.004, .03, .12), 'lp', 180, .7, 'brown');
        return M.norm(t, .92);
      },
      plunk() { // deep drop into still water
        const t = M.buf(.6);
        M.osc(t, 0, .25, S(260, 640, .07), v(.002, .07));
        M.osc(t, .015, .4, S(520, 760, .1), v(.002, .12, .25));
        return M.norm(t, .7);
      },
      gong() { // dark tam
        const t = M.buf(4);
        F(t, 0, [[98, 1, 2.6], [147.5, .55, 2.1], [205, .45, 1.5], [262, .3, 1.2], [371, .22, .8], [523, .12, .5]], 1, .004);
        T(t, 0, .4, v(.003, .1, .25), 'bp', 400, .9, 'brown');
        return M.norm(t, .85);
      }
    };
  }
  // new drum-pattern letters (engine: D d T t k j J B b O S s c h m; anything else = rest)
  const DRUM_CHARS = { F: ['frame', 1], f: ['frame', .55], L: ['frame_slap', .8], l: ['frame_slap', .45], H: ['heart', 1], w: ['plunk', .6], G: ['gong', .9] };
  if (K) {
    for (const [n, d] of Object.entries(VOICES)) if (!K.voices[n]) K.voices[n] = d;
    for (const [n, d] of Object.entries(STRINGS)) if (!K.strings[n]) K.strings[n] = d;
    for (const [n, g] of Object.entries(percGens())) if (!K.percGen[n]) K.percGen[n] = g;
    for (const [c, d] of Object.entries(DRUM_CHARS)) if (!K.drumMap[c]) K.drumMap[c] = d;
  }

  // ------------------------------------------------------------------ data → track compiler
  const TOK = /^(r|-?\d+)([#b]?)(?::(\d+))?([~*^t]*)$/; // same grammar as the engine's Rt
  function parsePhrase(p, where) {
    if (p == null || p === '') return null;
    if (typeof p === 'object' && p.ev) return p;
    if (typeof p === 'string' && p[0] === '@') {
      const ph = K.Ct[p.slice(1)];
      if (!ph) throw new Error(`${TAG} ${where}: no engine phrase ${p} (have ${Object.keys(K.Ct).join(' ')})`);
      return ph;
    }
    const bad = String(p).split(/[\s|]+/).filter(s => s && !TOK.test(s));
    if (bad.length) throw new Error(`${TAG} ${where}: bad phrase token(s): ${bad.join(' ')}`);
    return K.parse(String(p));
  }
  function parseForm(f) {
    if (Array.isArray(f)) return f.map(x => [String(x[0]), +x[1]]);
    return String(f).trim().split(/\s+/).map(tok => {
      const m = /^([^:]+):(\d+)$/.exec(tok);
      if (!m) throw new Error(TAG + ' bad form token "' + tok + '" (use "A:8 B:8")');
      return [m[1], +m[2]];
    });
  }
  const isMap = v => v && typeof v === 'object' && !Array.isArray(v) && !v.ev;
  // value or {A: …, B: …, '*': …} per section → fn(t)
  function perSec(v, prep) {
    const f = prep || (x => x);
    if (isMap(v)) { const m = {}; for (const k of Object.keys(v)) m[k] = f(v[k], k); return t => (t.sec in m ? m[t.sec] : m['*']); }
    const c = f(v, '*');
    return () => c;
  }
  function secSet(v, names) {
    if (v == null) return null;
    if (Array.isArray(v)) return new Set(v);
    const s = String(v);
    if (/[\s,]/.test(s)) return new Set(s.split(/[\s,]+/).filter(Boolean));
    if (names.has(s)) return new Set([s]);
    return new Set(s.split(''));
  }
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = a => (Array.isArray(a) ? a[Math.random() * a.length | 0] : a);
  const range = (v, d) => (v == null ? d : Array.isArray(v) ? rnd(v[0], v[1]) : v);
  const LAYER_TYPES = ['drone', 'voice', 'pluck', 'ostinato', 'drums', 'pad', 'brass', 'fx', 'bells', 'hit', 'wind', 'crackle', 'custom'];

  function makeLayer(L, cx, idx) {
    const type = LAYER_TYPES.find(k => L[k] != null);
    if (!type) throw new Error(`${TAG} ${cx.name} layer ${idx}: no type key (${LAYER_TYPES.join('/')})`);
    const where = `${cx.name} layer ${idx} (${type})`;
    const inSet = secSet(L.in, cx.names);
    const on = t => (!inSet || inSet.has(t.sec)) && (L.minInt == null || t.int >= L.minInt) && (L.maxInt == null || t.int <= L.maxInt);
    const root = L.root != null ? L.root : cx.root;
    const sc = L.mode != null ? scaleOf(L.mode) : cx.scale;
    const vel = t => (L.vel == null ? 1 : L.vel) + (L.velInt || 0) * t.int;
    const pos = (t, a) => (L.pos === 'global' ? t.barIdx : t.sb) * t.barSteps + a;
    const every = L.every || 1, off = L.offset || 0;
    const onBar = t => on(t) && (t.sb % every) === (off % every);
    const bus = (t, d) => K.bus(t, { g: L.g == null ? d.g : L.g, pan: L.pan || 0, wet: L.wet == null ? d.wet : L.wet, echo: L.echo == null ? (d.echo || 0) : L.echo, lp: L.lp || d.lp || 0 });
    if (L.voice && !K.voices[L.voice]) throw new Error(`${where}: unknown voice ${L.voice} (${Object.keys(K.voices).join(' ')})`);
    for (const k of ['pluck', 'ostinato']) if (L[k] && !K.strings[L[k]]) throw new Error(`${where}: unknown string ${L[k]} (${Object.keys(K.strings).join(' ')})`);
    // validate step patterns now: the engine treats unknown letters as silent rests
    const strings = v => (v == null ? [] : isMap(v) ? Object.values(v).flatMap(strings) : Array.isArray(v) ? v.flatMap(strings) : [String(v)]);
    if (type === 'drums') for (const p of strings(L.drums).concat(strings(L.fill)))
      for (const ch of p) if (!'.-_ '.includes(ch) && !K.drumMap[ch]) throw new Error(`${where}: unknown drum letter "${ch}" in "${p}" (have ${Object.keys(K.drumMap).join('')})`);
    if (type === 'ostinato') { const nn = (L.notes || []).length || 10; for (const p of strings(L.pattern)) for (const ch of p) {
      const i = ch >= '0' && ch <= '9' ? +ch : ch >= 'A' && ch <= 'J' ? ch.charCodeAt(0) - 65 : -1;
      if (i < 0 ? !'.-_ '.includes(ch) : i >= nn) throw new Error(`${where}: bad ostinato char "${ch}" in "${p}" (digits/A-J index notes[0..${nn - 1}], . = rest)`);
    } }
    switch (type) {
      case 'drone': {
        const breath = L.breath;
        const breathNow = t => (typeof breath === 'number' ? t.barIdx > 0 && t.barIdx % breath === 0
          : typeof breath === 'string' ? (([s, b]) => t.sec === s && t.sb === +b)(breath.split(':')) : false);
        return {
          setup(t, S) { S.d = new K.Drone(t, L.drone, { g: L.g == null ? .12 : L.g, ot: L.ot, wet: L.wet == null ? .4 : L.wet, lp: L.lp, sub: L.sub, pan: L.pan }); },
          bar(t, e, S) {
            if (inSet) S.d.br.gain.setTargetAtTime(inSet.has(t.sec) ? 1 : 0, e, .8);
            if (L.roots) { const r = L.roots[t.barIdx % L.roots.length]; if (r != null) S.d.root(e, r, L.rootTc || .3); }
            const he = L.harmEvery || 2;
            if (L.harm && L.ot && t.barIdx % he === 0) S.d.ot(e, L.harm[Math.floor(t.barIdx / he) % L.harm.length], L.harmTc || .5);
            if (breath && breathNow(t)) S.d.breath(e);
          }
        };
      }
      case 'voice': {
        const ph = perSec(L.phrase, (p, k) => parsePhrase(p, where + ' ' + k));
        return {
          setup(t, S) { S.v = new K.Voice(t, L.voice, { g: L.g == null ? .7 : L.g, pan: L.pan || 0, wet: L.wet == null ? .45 : L.wet, echo: L.echo || 0, lp: L.lp }); },
          step(t, e, a, S) { const p = on(t) && ph(t); if (p) K.phrase(t, S.v, p, e, pos(t, a), root, sc, { vel: vel(t), dt: L.dt || 0, tr: L.tr || 0 }); }
        };
      }
      case 'pluck': {
        const ph = perSec(L.phrase, (p, k) => parsePhrase(p, where + ' ' + k));
        return {
          setup(t, S) { S.b = bus(t, { g: .5, wet: .3 }); },
          step(t, e, a, S) { const p = on(t) && ph(t); if (p) K.pluckPhrase(t, S.b, p, e, pos(t, a), root, sc, L.pluck, !!L.trem, vel(t)); }
        };
      }
      case 'ostinato': {
        const pats = perSec(L.pattern);
        const notes = L.notes || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const pair = L.pair == null ? 0 : L.pair, oct = 12 * (L.oct || 0), key = L.key || 'os' + idx;
        return {
          setup(t, S) { S.b = bus(t, { g: .5, wet: .3 }); },
          step(t, e, a, S) {
            if (!on(t)) return;
            let p = pats(t); if (!p) return;
            if (Array.isArray(p)) p = p[t.sb % p.length];
            const ch = p[a % p.length];
            const sw = L.swing && ((a >> 1) & 1) && !(a & 1) ? L.swing * t.sd : 0;
            const v = vel(t) * (a % 4 === 0 ? 1 : .78) * rnd(.9, 1.04);
            if (ch >= '0' && ch <= '9') K.pluck(t, S.b, e + sw, root + oct + deg(sc, notes[+ch]), .8 * v, L.ostinato, key);
            else if (ch >= 'A' && ch <= 'J') K.strum(t, S.b, e + sw, [root + oct + deg(sc, pair), root + oct + deg(sc, notes[ch.charCodeAt(0) - 65])], .85 * v, L.ostinato);
          }
        };
      }
      case 'drums': {
        const pats = perSec(L.drums);
        return {
          setup(t, S) { S.b = bus(t, { g: .7, wet: .3 }); },
          step(t, e, a, S) {
            if (!on(t)) return;
            let p = pats(t);
            if (p) { if (Array.isArray(p)) p = p[t.sb % p.length]; K.drums(0, S.b, e, p, a, vel(t)); }
            if (L.fill && t.fill) K.drums(0, S.b, e, L.fill, a, L.fillVel || .8);
          }
        };
      }
      case 'pad': {
        const chords = perSec(L.pad);
        return {
          setup(t, S) { S.b = L.choir ? K.choir(t, { g: L.g == null ? .12 : L.g, wet: L.wet == null ? .6 : L.wet, pan: L.pan || 0 }) : bus(t, { g: .12, wet: .6 }); },
          bar(t, e, S) {
            if (!onBar(t)) return;
            const cs = chords(t); if (!cs || !cs.length) return;
            const c = cs[Math.floor(t.sb / every) % cs.length];
            const notes = L.degrees ? c.map(d => root + deg(sc, d)) : c;
            K.pad(0, S.b, e, notes, (L.hold || every) * t.barSteps * t.sd - .2, L.level == null ? .14 : L.level,
              { wave: L.wave || 'sawtooth', att: L.att == null ? 1.5 : L.att, rel: L.rel == null ? 2 : L.rel, det: L.det });
          }
        };
      }
      case 'brass': return {
        setup(t, S) { S.b = bus(t, { g: .45, wet: .5 }); },
        bar(t, e, S) { if (onBar(t)) [].concat(L.brass).forEach((m, i) => K.brass(0, S.b, e + .012 * i, m, L.hold == null ? 2.2 : L.hold, (L.level == null ? .45 : L.level) * (i ? .6 : 1))); }
      };
      case 'fx': return {
        setup(t, S) { S.b = bus(t, { g: .4, wet: .8, echo: .2 }); },
        bar(t, e, S) {
          if (!on(t)) return;
          const n = L.count ? (L.count[0] + Math.floor(Math.random() * (L.count[1] - L.count[0] + 1))) : (Math.random() < (L.chance == null ? .5 : L.chance) ? 1 : 0);
          for (let i = 0; i < n; i++) {
            const rate = L.pitchRange ? rnd(L.pitchRange[0], L.pitchRange[1]) : (L.pitch ? pick(L.pitch) : 1);
            K.hit(0, S.b, e + Math.floor(Math.random() * t.barSteps) * t.sd, pick(L.fx), range(L.gain, .5), rate);
          }
        }
      };
      case 'bells': return {
        setup(t, S) { S.b = bus(t, { g: .3, wet: .75, echo: .3 }); },
        step(t, e, a, S) {
          if (on(t) && a % (L.every || 4) === 0 && Math.random() < (L.chance == null ? .2 : L.chance))
            K.bell(0, S.b, e, root + 12 * (L.oct || 0) + deg(sc, pick(L.bells)), range(L.gain, .3));
        }
      };
      case 'hit': return {
        setup(t, S) { S.b = bus(t, { g: .7, wet: .4 }); },
        bar(t, e, S) { if (onBar(t)) K.hit(0, S.b, e + (L.at || 0) * t.sd, L.hit, L.gain == null ? .6 : L.gain, L.rate || 1); }
      };
      case 'wind': return { setup(t) { K.wind(t, L.wind, !!L.whistle); } };
      case 'crackle': return { setup(t) { K.loop(t, K.noise().crackle).connect(K.bus(t, { g: L.crackle, wet: L.wet == null ? .2 : L.wet, pan: L.pan || 0 })); } };
      case 'custom': return L.custom;
    }
  }
  function compileLayers(list, cx) {
    const layers = list.map((L, i) => makeLayer(L, cx, i));
    const run = (t, i, fn, args) => {
      const st = t._ml[cx.slot];
      if (st.dead[i]) return;
      try { fn.apply(layers[i], args); } catch (err) { st.dead[i] = 1; console.warn(TAG, cx.name, 'layer', i, 'disabled:', err); }
    };
    return {
      setup(t) {
        t._ml = t._ml || {};
        const st = t._ml[cx.slot] = { s: layers.map(() => ({})), dead: [] };
        layers.forEach((L, i) => L.setup && run(t, i, L.setup, [t, st.s[i], K]));
      },
      bar(t, e) { const st = t._ml[cx.slot]; layers.forEach((L, i) => L.bar && run(t, i, L.bar, [t, e, st.s[i], K])); },
      step(t, e, a) { const st = t._ml[cx.slot]; layers.forEach((L, i) => L.step && run(t, i, L.step, [t, e, a, st.s[i], K])); }
    };
  }
  function compile(name, spec) {
    needKit('define()');
    const form = parseForm(spec.form || 'A:8');
    if (!form.length || form.some(f => !(f[1] > 0))) throw new Error(TAG + ' ' + name + ': empty form');
    const cx = { name, slot: 'main', root: spec.root == null ? 50 : spec.root, scale: scaleOf(spec.mode || 'aeolian'), names: new Set(form.map(f => f[0])) };
    const body = compileLayers(spec.layers || [], cx);
    return {
      bpm: spec.bpm || 72, spb: spec.spb || 4, barLen: spec.barLen || 16, root: cx.root, scale: cx.scale,
      vol: spec.vol == null ? .85 : spec.vol, echoBeats: spec.echoBeats, loopFrom: spec.loopFrom || 0, form, spec,
      setup(t) { body.setup(t); },
      bar(t, e) { body.bar(t, e); },
      step(t, e, a) { body.step(t, e, a); }
    };
  }
  function register(name, def) {
    if (!Ut) throw new Error(TAG + ' track table not reachable');
    Ut[name] = def;
    if (Array.isArray(A.tracks) && !A.tracks.includes(name)) A.tracks.push(name);
    return def;
  }
  function define(name, spec) {
    const def = register(name, compile(name, spec));
    if (spec.alias) alias([].concat(spec.alias).reduce((m, a) => (m[a] = name, m), {}));
    return def;
  }

  // ------------------------------------------------------------------ variants of existing tracks
  function shiftPlucks(pitch) { // during one step/bar call: every pluck the base track asks for is re-pitched
    const X = K.ksCache, get0 = Map.prototype.get;
    X.get = function (key) {
      const m = /^(\D+)(\d+(?:\.\d+)?)$/.exec(key);
      if (!m) return get0.call(X, key);
      const midi = Math.round(2 * pitch(+m[2])) / 2, k2 = m[1] + midi;
      let v = get0.call(X, k2);
      if (!v) { const r = K.ks(K.mtof(midi), K.strings[m[1]] || K.strings.dombra); v = { buf: K.toBuf(r.data), rate: r.rate }; X.set(k2, v); }
      return v;
    };
    return () => { delete X.get; };
  }
  function patchDrums(map) { // during one call: drum letters muted (null), rescaled (number) or swapped ([sample, gain])
    const bt = K.drumMap, saved = [];
    for (const ch of Object.keys(map)) {
      const had = Object.prototype.hasOwnProperty.call(bt, ch), old = bt[ch], v = map[ch];
      saved.push([ch, had, old]);
      if (v == null) delete bt[ch];
      else if (typeof v === 'number') { if (old) bt[ch] = [old[0], old[1] * v]; }
      else bt[ch] = v;
    }
    return () => { for (const [ch, had, old] of saved) { if (had) bt[ch] = old; else delete bt[ch]; } };
  }
  const isNode = v => v && typeof v.connect === 'function' && v.context && typeof v.disconnect === 'function';
  const isVoice = v => v && typeof v.note === 'function' && Array.isArray(v.oscs);
  const isDrone = v => v && typeof v.root === 'function' && typeof v.breath === 'function' && Array.isArray(v.o);
  function retune(t, pitch, velMul) {
    for (const k of Object.keys(t)) {
      const v = t[k];
      if (isVoice(v)) {
        const n0 = v.note;
        v.note = function (time, midi, dur, vel, op) {
          if (pitch && op && (op.grace || op.trill)) { op = Object.assign({}, op); if (op.grace) op.grace = pitch(op.grace); if (op.trill) op.trill = pitch(op.trill); }
          return n0.call(this, time, pitch ? pitch(midi) : midi, dur, vel * (velMul || 1), op);
        };
      } else if (pitch && isDrone(v)) {
        const r0 = v.root, m0 = 69 + 12 * Math.log2(v.f / 440);
        v.root = function (time, midi, tc) { return r0.call(this, time, pitch(midi), tc); };
        v.root(t.out.context.currentTime, Math.round(2 * m0) / 2, .05);
      }
    }
  }
  function revoice(t, o) {
    const ctx = t.out.context;
    const chain = (src, sp) => { // src → [hp] → [lp] ; returns last node
      let last = src;
      if (sp.hp) { const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = sp.hp; f.Q.value = .5; last.connect(f); last = f; }
      if (sp.lp) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = sp.lp; f.Q.value = sp.q || .5; last.connect(f); last = f; }
      return last;
    };
    if (o.buses) {
      const keys = Object.keys(t).filter(k => isNode(t[k]) && !['out', 'wet', 'echo'].includes(k));
      for (const k of keys) {
        const sp = Object.assign({}, o.buses['*'] || {}, o.buses[k] || {});
        if (!Object.keys(sp).length) continue;
        const head = ctx.createGain();
        head.gain.value = sp.mute ? 0 : (sp.g == null ? 1 : sp.g);
        const last = chain(head, sp);
        last.connect(t[k]);
        if (sp.wet) { const w = ctx.createGain(); w.gain.value = sp.wet; last.connect(w); w.connect(t.wet); }
        t[k] = head;
      }
    }
    if (o.voices && o.voices.wet) for (const k of Object.keys(t)) if (isVoice(t[k])) { const w = ctx.createGain(); w.gain.value = o.voices.wet; t[k].env.connect(w); w.connect(t.wet); }
    if (o.tone && K) { // whole-track filter between the track outputs and the music buses
      const g = K.graph();
      for (const [n, dest] of [[t.out, g.mDry], [t.wet, g.mWet], [t.echo, g.mEcho]]) { n.disconnect(); chain(n, o.tone).connect(dest); }
    }
  }
  // fallback mode (no kit) queues variants until the tables are captured at the first unlock
  function variant(baseName, name, o) { return whenTables(() => variantNow(baseName, name, o)); }
  function variantNow(baseName, name, o) {
    o = o || {};
    const base = Ut && Ut[baseName];
    if (!base) throw new Error(TAG + ' variant: unknown base track ' + baseName);
    const tr = o.transpose || 0, sc = o.mode ? scaleOf(o.mode) : null;
    const tonic = (o.tonic != null ? o.tonic : base.root) + tr;
    const pitch = tr || sc ? (m => (sc ? snap(m + tr, tonic, sc) : m + tr)) : null;
    if (!K && (pitch || o.drums)) console.warn(TAG, 'variant', name, ': without AudioKit plucks keep their pitch and drum letters are unchanged');
    const form = o.form ? parseForm(o.form) : base.form;
    const extra = o.layers && o.layers.length ? (needKit('variant layers'), compileLayers(o.layers,
      { name, slot: 'extra', root: tonic, scale: sc || base.scale || SCALES.aeolian, names: new Set(form.map(f => f[0])) })) : null;
    const scoped = fn => {
      const undo = [];
      try {
        if (K && pitch) undo.push(shiftPlucks(pitch));
        if (K && o.drums) undo.push(patchDrums(o.drums));
        return fn();
      } finally { for (let i = undo.length - 1; i >= 0; i--) undo[i](); }
    };
    const def = Object.assign({}, base, {
      bpm: o.bpm || base.bpm, vol: o.vol != null ? o.vol : base.vol, echoBeats: o.echoBeats != null ? o.echoBeats : base.echoBeats,
      form, loopFrom: o.loopFrom != null ? o.loopFrom : base.loopFrom, root: tonic, scale: sc || base.scale, base: baseName,
      setup(t) {
        scoped(() => base.setup.call(base, t));
        if (pitch || (o.voices && o.voices.g)) retune(t, pitch, o.voices && o.voices.g);
        revoice(t, o);
        if (extra) extra.setup(t);
      },
      bar(t, e) { if (base.bar) scoped(() => base.bar.call(base, t, e)); if (extra) extra.bar(t, e); },
      step(t, e, a) { scoped(() => base.step.call(base, t, e, a)); if (extra) extra.step(t, e, a); }
    });
    return register(name, def);
  }

  // ------------------------------------------------------------------ routing: remap / alias / data fields
  const REMAP = Object.create(null);
  let lastAsked;
  const music0 = A.music;
  A.music = function (n) {
    lastAsked = n;
    return music0.call(A, n != null && REMAP[n] != null ? REMAP[n] : n);
  };
  function remap(map) { Object.assign(REMAP, map); return Object.assign({}, REMAP); }
  function alias(map) { return whenTables(() => { if (!Vt) throw new Error(TAG + ' alias table not reachable'); Object.assign(Vt, map); }); }
  function biome(id, track) { const b = G.Biomes && G.Biomes.defs[id]; if (!b) throw new Error(TAG + ' no biome ' + id); b.music = track; }
  function boss(id, track) { const d = G.Enemies && G.Enemies.defs[id]; if (!d) throw new Error(TAG + ' no enemy ' + id); d.music = track; }
  const refresh = () => { if (lastAsked !== undefined) { const cur = A.current; A.music(lastAsked); return [cur, A.current]; } };

  // ------------------------------------------------------------------ sfx
  const SFXMAP = Object.create(null);
  const sfx0 = A.sfx;
  A.sfx = function (name, opts) {
    const r = SFXMAP[name];
    if (r) {
      if (typeof r === 'string') name = r;
      else {
        name = r.to || name;
        opts = Object.assign({}, opts);
        if (r.pitch) opts.pitch = (opts.pitch || 1) * r.pitch;
        if (r.vol != null) opts.vol = (opts.vol == null ? 1 : opts.vol) * r.vol;
      }
    }
    return sfx0.call(A, name, opts);
  };
  const sfx = {
    redirect(map) { Object.assign(SFXMAP, map); },
    define(name, d) { // d = {vol, vars, max, prio 1..3, pv, wet, duck, gen(){ return Float32Array }}
      needKit('sfx.define');
      if (typeof d.gen !== 'function') throw new Error(TAG + ' sfx ' + name + ': gen() required');
      K.sfxDefs[name] = d; delete K.sfxCache[name];
      if (Array.isArray(A.sfxNames) && !A.sfxNames.includes(name)) A.sfxNames.push(name);
    },
    replace(name, gen, props) {
      needKit('sfx.replace');
      const d = K.sfxDefs[name]; if (!d) throw new Error(TAG + ' no sfx ' + name);
      d.gen = gen; Object.assign(d, props || {}); delete K.sfxCache[name];
    }
  };

  // ------------------------------------------------------------------ offline render (built-in renderTest + buffer capture)
  async function render(name, secs, opt) {
    opt = opt || {};
    const OAC = window.OfflineAudioContext;
    if (!OAC || typeof A.renderTest !== 'function') return null;
    // renderTest before the live context exists poisons the reverb cache (see probeTables)
    if (K ? !K.ctx() : !Ut) throw new Error(TAG + ' render(): call G.Audio.unlock() first');
    const proto = OAC.prototype, sr0 = proto.startRendering;
    let buffer = null, p;
    proto.startRendering = function () { return sr0.call(this).then(b => (buffer = b)); };
    try { p = A.renderTest(name, secs || 8, opt.intensity || 0, opt.skipBars || 0); } finally { proto.startRendering = sr0; }
    const stats = await p;
    return { stats, buffer };
  }
  function wav(buf) { // 16-bit PCM WAV of an AudioBuffer
    const ch = buf.numberOfChannels, n = buf.length, sr = buf.sampleRate;
    const dv = new DataView(new ArrayBuffer(44 + n * ch * 2));
    const str = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    str(0, 'RIFF'); dv.setUint32(4, 36 + n * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
    dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, sr, true);
    dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); str(36, 'data'); dv.setUint32(40, n * ch * 2, true);
    const data = []; for (let c = 0; c < ch; c++) data.push(buf.getChannelData(c));
    let o = 44;
    for (let i = 0; i < n; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, data[c][i])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
    return dv.buffer;
  }

  G.Music = {
    __ext: 1, kit: K, get tables() { return { Ut, Vt }; }, SCALES, scaleOf, deg, snap,
    define, compile, variant, register, remap, alias, biome, boss, refresh, sfx, render, wav,
    get remaps() { return Object.assign({}, REMAP); },
    info(name) { const d = Ut && Ut[name]; return d && { bpm: d.bpm, spb: d.spb || 4, barLen: d.barLen || 16, root: d.root, vol: d.vol, form: d.form, base: d.base, data: !!d.spec }; }
  };
})();
