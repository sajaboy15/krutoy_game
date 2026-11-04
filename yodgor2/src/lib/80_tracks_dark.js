/* tracks_dark.js — example dark Central-Asian tracks as DATA (needs audio_ext.js + AudioKit hook).
 * Phrases use the engine's own Rt grammar: "deg[#|b][:steps][~ glide][* grace][^ accent][t trill]", r = rest, | ignored.
 * Steps are 16ths (spb 4, barLen 16) unless spb/barLen say otherwise; 8 bars = 128 steps.
 * Drum letters: D/d dum, T/t tek, k tak, j/J jingle/roll, B/b dauyl, O boom, S/s sub, c clap, h shaker, m tom,
 *               + F/f frame, L/l frame slap, H heartbeat, w water plunk, G gong (added by audio_ext.js).
 */
(function () {
  const M = window.G && G.Music;
  if (!M || !M.kit) { console.warn('[music] tracks_dark.js needs audio_ext.js and the AudioKit hook'); return; }

  // Dark title: overtone drone, low kobyz lament, ney answers, frame drum, gong, choir + bells coda
  M.define('yd_title', {
    bpm: 54, root: 50, mode: 'phrygian', vol: .95, echoBeats: 1.5, form: 'A:8 B:8 C:4',
    layers: [
      { drone: 38, g: .2, ot: 5, harm: [8, 9, 8, 6, 7, 6, 8, 12], harmEvery: 2, lp: 3, sub: .7, wet: .55, breath: 'C:2' },
      { wind: .05 },
      { voice: 'kobyz_dark', g: .9, pan: -.1, wet: .5, echo: .12, phrase: {
        A: '0:16~ | 1:6 0:2 -1:8 | 0:12* r:4 | -2:6~ -1:2 0:8 | 1:12~ 2:4 | 3:6* 2:2 1:8 | 0:16~ | r:16',
        B: '4:8~ 3:4 2:4 1:16 | 0:8 1:4 0:4 -1:16~ | -2:12 -1:2 -2:2 -3:16 | -2:8~ -1:8 0:16~' } },
      { voice: 'ney', root: 62, in: 'B', g: .6, pan: .25, wet: .6, echo: .3,
        phrase: 'r:16 4:4~ 5:4 4:8 | r:16 2:6 1:2 0:8 | r:16 1:4 0:4 -1:8* | r:16 0:16~' },
      { drums: { A: ['F...............', '................'], B: ['F.......f.......', 'F...........l...'] }, in: 'A B', g: .6, wet: .5, lp: 1600, vel: .8 },
      { hit: 'gong', every: 8, in: 'A', gain: .5 },
      { pad: [[38, 45, 50, 53], [36, 43, 48, 51]], choir: true, every: 2, hold: 2, level: .1, att: 2.5, rel: 3, in: 'C' },
      { bells: [0, 4, 7], oct: 1, chance: .25, every: 8, gain: [.15, .3], in: 'C' }
    ]
  });

  // Night rooftops of a poor district: tired swung dutar in bayati, ney, muffled frame drum, gutters dripping
  M.define('yd_roofs', {
    bpm: 68, root: 45, mode: 'bayati', vol: .9, form: 'A:8 B:8 C:8 B:8',
    layers: [
      { wind: .04 }, { crackle: .05, pan: -.3 },
      { drone: 33, g: .07, lp: 2.5, wet: .45 },
      { ostinato: 'dutar_dark', notes: [0, 2, 3, 4, -1, 1], pair: -3, swing: .2, g: .55, pan: -.15, wet: .35, vel: .8, pattern: {
        '*': ['A..1..0.2..1.0..', 'A..1..2.3..2.1..', 'D..3..2.1..0.1..', 'A.......4...0...'],
        C: ['A.1.0.1.2.1.0.4.', 'A.1.0.1.3.2.1.0.'] } },
      { voice: 'ney', root: 57, in: 'B', g: .55, pan: .15, wet: .5, echo: .25,
        phrase: '0:8~ 1:4 2:4 3:12* 2:4 | 1:8 0:8 -1:16~ | 0:6 1:2 2:8 4:8 3:8 | 2:24~ r:8' },
      { voice: 'kobyz_dark', in: 'C', g: .7, pan: .1, wet: .45,
        phrase: '4:16~ 3:8 2:8 | 1:12 0:4 0:16~ | -1:8 0:8 1:8 2:8 | 0:32~' },
      { drums: { B: ['F.......l.....f.', 'F...........f...'], C: ['F...l...F..fl...', 'F...l...F...l.f.'] }, g: .55, wet: .45, lp: 1800, vel: .8, fill: '............l.lL' },
      { fx: ['drip'], chance: .25, pitch: [.7, .84, 1], gain: [.15, .3], wet: .9, echo: .3 },
      { fx: ['whisper'], chance: .1, gain: [.12, .2], wet: .95, echo: .4, in: 'B C' },
      { fx: ['chain'], chance: .08, gain: [.08, .15], pitch: [.6, .7], wet: .9 }
    ]
  });

  // Water tunnels inside a sleeping giant: breathing drone, 25-bpm heartbeat, drips, slow low kobyz, power-chord choir
  M.define('yd_tunnels', {
    bpm: 50, root: 40, mode: 'phrygian', vol: .95, echoBeats: 1.5, form: 'A:8 B:8 C:8',
    layers: [
      { drone: 40, g: .2, ot: 4, harm: [6, 7, 6, 5, 8, 6, 7, 9], harmEvery: 2, lp: 2.5, sub: .8, wet: .6, breath: 4 },
      { wind: .03 },
      { drums: 'H.......', g: .75, wet: .45, lp: 700, vel: .9 },
      { fx: ['drip', 'plunk'], count: [1, 3], pitch: [.5, .63, .75, .84, 1], gain: [.2, .5], wet: .9, echo: .45 },
      { voice: 'ney', root: 64, in: 'A', g: .4, wet: .8, echo: .4, phrase: 'r:64 | 4:16~ 3:8 2:8 | 1:32~' },
      { voice: 'kobyz_dark', root: 52, g: .75, wet: .6, echo: .15, phrase: {
        B: '0:32~ | 1:16 0:16 | -1:24~ 0:8 | 1:8 2:8 1:16~',
        C: '3:16~ 2:8 1:8 | 0:24 r:8 | -2:16~ -1:16 | 0:32~' } },
      { pad: [[40, 47, 52], [41, 48, 53], [40, 47, 52], [38, 45, 50]], choir: true, every: 2, hold: 2, level: .1, att: 3, rel: 4, g: .14, in: 'C' },
      { hit: 'gong', every: 8, gain: .35, rate: .7, in: 'B' }
    ]
  });

  // Gilded palace of tyrants: hijaz-kar court lute, karnay swells, ceremonial dauyl/tom, muffled surnay through walls
  M.define('yd_palace', {
    bpm: 80, root: 50, mode: 'hijazkar', vol: .8, form: 'A:8 B:8 C:8 D:4',
    layers: [
      { drone: 38, g: .12, ot: 3, harm: [6, 8, 7, 6], harmEvery: 2, wet: .35 },
      { ostinato: 'tanbur_dark', notes: [0, 1, 2, 3, 4, -1], pair: -3, g: .4, pan: -.2, wet: .3, vel: .6, in: 'B C D',
        pattern: ['A.0.1.0.A.0.2.1.', 'A.0.1.0.D.3.2.1.', 'E.4.3.2.D.2.1.0.', 'A.5.0.1.A...A...'] },
      { drums: { A: 'B...............', B: ['B.......m.......', 'B.......m...m.m.'], C: ['B.....m.B...m.m.', 'B.....m.B.m.mmmm'], D: 'B.B.B.B.mmmmTTTT' },
        g: .75, wet: .3, vel: .9, fill: '............mmTT' },
      { drums: '....t.......t...', g: .4, lp: 2400, minInt: .3, vel: .6, in: 'B C D' },
      { brass: [38, 45], every: 4, hold: 2.4, level: .45, in: 'B C' },
      { voice: 'kobyz_dark', in: 'B', g: .7, wet: .4, phrase: '0:16~ | 1:8 0:8 | -1:12* 0:4 | 1:16 | 2:8~ 1:8 | 0:8 -1:8 | 0:16~ | r:16' },
      { voice: 'surnay', root: 62, lp: 2200, g: .45, wet: .45, echo: .12, in: 'C',
        phrase: '4:4^ 3:2 2:2 1:8* | 2:4 1:2 0:2 1:8 | 4:4^ 5:2 4:2 6:8~ | 5:4 4:4 3:8 | 2:4 3:2 2:2 1:4 0:4 | 1:8 -1:8 | 0:16~ | r:16' },
      { pad: [[50, 54, 57], [51, 55, 58]], choir: true, every: 2, hold: 2, level: .14, att: .8, rel: 1.5, in: 'D' },
      { bells: [0, 2, 4, 6], oct: 2, chance: .12, every: 4, gain: [.1, .2], in: 'B C' },
      { hit: 'gong', every: 8, gain: .55, in: 'A B C' }
    ]
  });

  // Dream city of 300 years of other people's memories: the engine's OWN melodies (@chB chaikhana, @bkB bukhara,
  // @tiA old title) replayed in F# minor over sine shimmer, whispers, chimes; D section overlaps two memories.
  M.define('yd_dream', {
    bpm: 63, root: 54, mode: 'aeolian', vol: 1.25, echoBeats: 1.5, form: 'A:8 B:8 C:8 D:8',
    layers: [
      { pad: [[66, 69, 73, 78], [62, 66, 69, 74], [59, 62, 66, 71], [61, 64, 68, 73]], every: 2, hold: 2, level: .07, att: 3, rel: 4, wave: 'sine', det: [-14, 13], g: .14, wet: .85, echo: .4 },
      { drone: 42, g: .07, lp: 2, wet: .6 },
      { voice: 'flute', root: 66, phrase: '@chB', in: 'A D', g: .45, wet: .7, echo: .4, vel: .75 },
      { voice: 'ney', root: 66, phrase: '@bkB', in: 'B', g: .5, wet: .7, echo: .4 },
      { voice: 'kobyz_dark', root: 54, phrase: '@tiA', in: 'C D', g: .6, wet: .6, echo: .3, vel: .8 },
      { ostinato: 'chang', root: 66, notes: [0, 2, 4, 7, 9], pattern: ['0.1.2.3.2.1.0...', '0.1.2.4.3.2.1...'], g: .25, wet: .65, echo: .4, vel: .7, in: 'D' },
      { fx: ['whisper'], chance: .35, gain: [.12, .25], wet: .95, echo: .35, pitch: [.8, .9, 1.1] },
      { bells: [0, 2, 4, 6, 7], oct: 1, chance: .18, every: 4, gain: [.1, .25] },
      { drums: ['................', '........j.......'], vel: .35, lp: 3000, wet: .8, echo: .3, in: 'C D' }
    ]
  });

  // Boss — grief-mad water spirit: 12/8 at 112, keening saba wail, driving hijaz kobyz, booms, water, grief whispers
  M.define('yd_boss_water', {
    bpm: 112, spb: 3, barLen: 12, root: 50, mode: 'hijaz', vol: .7, loopFrom: 1, form: 'in:2 A:8 B:8 C:4 A:8 D:8',
    layers: [
      { drone: 38, g: .14, ot: 3, harm: [7, 11, 13, 8], harmEvery: 1, wet: .35, roots: [38, 38, 39, 38, 36, 36, 39, 38] },
      { drums: { in: ['B...........', '............'], A: 'B..D.tB..DtT', B: 'B..D.tB.tDtT', C: 'B...........', D: 'B.tD.tB.tDTT' },
        g: .8, wet: .25, vel: .9, fill: '......tTtTDD' },
      { drums: 'F.fF.fF.fF.f', g: .5, wet: .3, minInt: .5, vel: .4, velInt: .4, in: 'A B D' },
      { hit: 'boom', every: 4, gain: .6, in: 'B C D' },
      { voice: 'keen', root: 62, mode: 'saba', in: 'A D', g: .75, wet: .5, echo: .2,
        phrase: '4:6~ 3:3 2:3 | 1:9t 0:3 | 2:3 1:3 0:3 -1:3 | 0:12~ | 4:3^ 5:3 4:3 3:3 | 2:6~ 1:6* | 0:9 -1:3 | 0:12~' },
      { voice: 'kobyz_dark', in: 'B', g: .8, pan: -.1, wet: .35,
        phrase: '0:3^ 0:3 1:3 0:3 | -1:6 0:6 | 0:3^ 1:3 3:3 2:3 | 1:12~ | 0:3^ 0:3 1:3 0:3 | -1:6 -2:6 | -3:6~ -2:3 -1:3 | 0:12' },
      { ostinato: 'bass', root: 38, notes: [0, 1, -1, -2], key: 'b', g: .5, wet: .1, vel: .9, in: 'in A B D',
        pattern: { '*': '0..0.10..0.1', in: '0...........' } },
      { pad: [[50, 54, 57, 62], [51, 55, 58, 63], [48, 51, 55, 60], [50, 54, 57, 62]], choir: true, every: 1, hold: 1, level: .13, att: .5, rel: 1.2, g: .16, in: 'C D' },
      { fx: ['plunk', 'drip'], count: [0, 2], pitch: [.5, .6, .75], gain: [.3, .5], wet: .8, echo: .3 },
      { fx: ['whisper'], chance: .6, gain: [.25, .4], wet: .9, pitch: [.7, .8], in: 'C' }
    ]
  });
})();
