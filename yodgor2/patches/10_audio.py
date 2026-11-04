"""Build-time hook: expose the audio module's private closure as window.G.AudioKit.

One exact replacement on the minified engine (kyok/main.js, also inlined in kyok/index.html).
It only ADDS an object before `t.Audio={`; nothing in the engine changes behaviour.
Use it from a build script in the same (old, new, count) format as yodgor/build.py:

    from hook_audiokit import AUDIO_HOOK
    REPLACE.append(AUDIO_HOOK)

Names on the left are what extension code uses; names on the right are the engine's
minified identifiers inside the audio IIFE (verified unique anchors, engine build of 2026-10-28).
"""

AUDIO_KIT = (
    't.AudioKit={'
    # tables
    'Ut:Ut,Vt:Vt,Ct:Ct,'
    'scales:{aeolian:et,dorian:at,phrygian:ot,hijaz:st,mixolydian:nt,major:it,penta:rt,neutral:lt},'
    'voices:wt,strings:I,drumMap:bt,percGen:H,percCache:O,sfxDefs:B,sfxCache:E,sfxMap:z,sfxAlias:W,'
    # music helpers (same signatures the built-in tracks use)
    'parse:Rt,deg:ft,bus:ct,lfo:ht,loop:dt,pluck:ut,strum:pt,dombraPat:gt,hit:mt,bell:xt,drums:yt,'
    'Voice:Mt,Drone:vt,wind:kt,choir:St,pad:Tt,brass:At,phrase:Ft,pluckPhrase:Pt,'
    # sample synthesis (render into Float32Array at the engine sample rate)
    'dsp:M,envAD:v,envGlide:k,envSweep:S,noiseHit:T,thump:A,crack:R,modes:F,click:P,swish:C,jingle:D,'
    'ks:L,ksCache:X,perc:_,sfxBufs:j,toBuf:G,shaper:V,mtof:w,rand:x,choose:b,clamp:y,'
    # scheduler internals
    'resolve:$t,start:Qt,nextBar:Zt,schedule:te,dispose:Jt,initNoise:$,'
    # live state (getters, because these are `let` bindings)
    'ctx:()=>o,graph:()=>s,current:()=>l,SR:()=>n,intensity:()=>c,noise:()=>({white:q,brown:Y,crackle:N,ir:K})'
    '};'
)

AUDIO_HOOK = ('let ne=!1;t.Audio={', 'let ne=!1;' + AUDIO_KIT + 't.Audio={', 1)

if __name__ == '__main__':
    print(AUDIO_HOOK[1])

REPLACEMENTS = [AUDIO_HOOK]
