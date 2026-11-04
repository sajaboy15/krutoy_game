/* =====================================================================
   Graphics v2 — settings like a PC game, and a clean post-processing
   pass that never washes the picture out.
   - Scaling: pixel-perfect (integer, letterboxed) or fit (sharp scaling)
   - Text layer at full screen resolution (was capped at 1600 px: blurry on big screens)
   - Post: emissive-only bloom (soft knee), light shafts, highlight roll-off,
     gentle S-curve, act mood, vignette, sharpening; grain and chromatic
     aberration are optional
   - Frame-rate cap (30/60/120/144/unlimited); V-sync is native in the exe
   ===================================================================== */
const GFX = { ok: false };
{
  const KEY = 'yodgor2_gfx2';
  const PRESETS = {
    low: { post: false, bloom: 0, rays: 0, vig: 0, grain: 0, ca: 0, sharp: 0 },
    medium: { post: true, bloom: 0.18, rays: 0, vig: 0.12, grain: 0, ca: 0, sharp: 0.08 },
    high: { post: true, bloom: 0.26, rays: 0.1, vig: 0.16, grain: 0, ca: 0, sharp: 0.12 },
    ultra: { post: true, bloom: 0.32, rays: 0.16, vig: 0.18, grain: 0.012, ca: 0, sharp: 0.15 }
  };
  const DEF = { preset: 'high', scaling: 'fit', fps: 0, bright: 0, grain: null, ca: null, rays: null };
  // settings saved by an older build are dropped once (a bad setting must never survive an update)
  const VER = 3, VKEY = 'yodgor2_gfx_ver';
  let saved = {};
  try { if (+localStorage.getItem(VKEY) === VER) saved = JSON.parse(localStorage.getItem(KEY) || '{}'); else { localStorage.setItem(VKEY, String(VER)); localStorage.removeItem(KEY); } } catch (e) { saved = {}; }
  // ?resetgfx (sent by the exe after a failed start) wipes the settings too
  try { if (/[?&]resetgfx\b/.test(location.search)) saved = {}; } catch (e) { /* ignore */ }
  const S = Object.assign({}, DEF, saved && typeof saved === 'object' ? saved : {});
  if (![0, 30, 60, 120, 144].includes(S.fps)) S.fps = 0;
  if (!(S.bright >= -2 && S.bright <= 2)) S.bright = 0;
  if (S.scaling !== 'fit' && S.scaling !== 'integer') S.scaling = 'fit';
  if (!PRESETS[S.preset]) S.preset = 'high';
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } };
  const P = () => {
    const p = Object.assign({}, PRESETS[S.preset]);
    if (S.grain != null) p.grain = S.grain ? 0.02 : 0;
    if (S.ca != null) p.ca = S.ca ? 0.004 : 0;
    if (S.rays != null) p.rays = S.rays ? Math.max(p.rays, 0.12) : 0;
    return p;
  };

  /* ---------- scaling: replace the page's fit with a sharper one ---------- */
  function resize() {
    const st = document.getElementById('stage');
    if (!st || !G.display || !G.hud) return;
    const dpr = window.devicePixelRatio || 1, ww = st.clientWidth, wh = st.clientHeight;
    let fit = Math.min(ww / G.W, wh / G.H);
    if (S.scaling === 'integer' && fit >= 1) fit = Math.max(1, Math.floor(fit * dpr) / dpr);
    else { const ifit = Math.floor(fit * dpr) / dpr; if (ifit >= fit * 0.97) fit = ifit; }
    const cw = Math.floor(G.W * fit), ch = Math.floor(G.H * fit);
    for (const c of [G.display, G.hud]) { c.style.width = cw + 'px'; c.style.height = ch + 'px'; }
    const hs = Math.min(cw * dpr, 3840) / G.W; // text at real screen resolution
    G.hud.width = Math.round(G.W * hs); G.hud.height = Math.round(G.H * hs);
    G.scale = 1; G.cssFit = fit; G.uiScale = G.hud.width / G.UW; if (G.dctx) G.dctx.imageSmoothingEnabled = false;
    const gate = document.getElementById('gate'); if (gate) { gate.style.width = cw + 'px'; gate.style.height = ch + 'px'; }
  }
  G.resize = resize;
  window.addEventListener('resize', () => setTimeout(resize, 30));
  // the page should look like an application, not a web page
  try {
    const css = document.createElement('style');
    css.textContent = 'html,body{background:#000!important;user-select:none;-webkit-user-select:none;cursor:default}body{padding:0!important}#stage{background:#000}canvas#game,canvas#fx{image-rendering:pixelated}body.yd-hide-cursor,body.yd-hide-cursor *{cursor:none!important}';
    document.head.appendChild(css);
    document.addEventListener('contextmenu', e => e.preventDefault());
    window.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && /^(KeyR|KeyW|KeyP|KeyS|KeyF|KeyU|Equal|Minus|Digit0|NumpadAdd|NumpadSubtract)$/.test(e.code)) e.preventDefault();
      if (e.code === 'F5') e.preventDefault();
    }, true);
    window.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, { passive: false });
    let idle = 0;
    window.addEventListener('mousemove', () => { idle = 0; document.body.classList.remove('yd-hide-cursor'); }, true);
    setInterval(() => { idle += 0.5; if (idle > 2.5 && G.Game && G.Game.state === 'play' && !(G.UI.isOpen && G.UI.isOpen())) document.body.classList.add('yd-hide-cursor'); }, 500);
  } catch (e) { /* ignore */ }

  /* ---------- frame-rate cap ---------- */
  const raf0 = window.requestAnimationFrame.bind(window);
  let last = 0;
  window.requestAnimationFrame = cb => raf0(function step(ts) {
    if (S.fps > 0) {
      const min = 1000 / S.fps - 0.6;
      if (ts - last < min) { raf0(step); return; }
      last = ts;
    }
    cb(ts);
  });

  /* ---------- the post-processing pass ---------- */
  let src = null, host = null, tried = false, cv = null, gl = null, PR = {}, tex = null, fb = [], W = 0, H = 0, buf = null;
  const VS = 'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  // bright pass: only what is really emissive (soft knee), no haze from bright skies
  const FS_BRIGHT = 'precision mediump float;varying vec2 uv;uniform sampler2D t;void main(){vec3 c=texture2D(t,vec2(uv.x,1.-uv.y)).rgb;float l=max(max(c.r,c.g),c.b);float s=max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b));float k=smoothstep(.78,1.,l)*(.35+.65*smoothstep(.05,.4,s));gl_FragColor=vec4(c*k,1.);}';
  const FS_BLUR = 'precision mediump float;varying vec2 uv;uniform sampler2D t;uniform vec2 d;void main(){vec3 s=texture2D(t,uv).rgb*.2270;s+=(texture2D(t,uv+d*1.3846).rgb+texture2D(t,uv-d*1.3846).rgb)*.3162;s+=(texture2D(t,uv+d*3.2308).rgb+texture2D(t,uv-d*3.2308).rgb)*.0703;gl_FragColor=vec4(s,1.);}';
  // light shafts: radial blur of the bright pass toward a light above the scene
  const FS_RAYS = 'precision mediump float;varying vec2 uv;uniform sampler2D t;uniform vec2 lp;void main(){vec2 d=(uv-lp)*(1./28.)*.9;vec2 c=uv;vec3 s=vec3(0.);float w=1.;for(int i=0;i<28;i++){c-=d;s+=texture2D(t,c).rgb*w;w*=.94;}gl_FragColor=vec4(s/14.,1.);}';
  const FS_FINAL = [
    'precision highp float;varying vec2 uv;uniform sampler2D t;uniform sampler2D b;uniform sampler2D r;uniform vec2 src;uniform vec2 dst;uniform float time;',
    'uniform float bloom;uniform float rays;uniform float vig;uniform float grain;uniform float ca;uniform float sharp;uniform float bright;uniform float integ;uniform vec3 tint;',
    'vec3 px(vec2 u){if(integ>.5)return texture2D(t,(floor(u*src)+.5)/src).rgb;vec2 tx=u*src;vec2 s=dst/src;vec2 cd=fract(tx)-.5;vec2 rr=.5-.5/s;vec2 q=(cd-clamp(cd,-rr,rr))*s+.5;return texture2D(t,(floor(tx)+q)/src).rgb;}',
    'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    'void main(){vec2 u=vec2(uv.x,1.-uv.y);vec2 c=u-.5;float e=dot(c,c);',
    'vec3 col=px(u);if(ca>0.){vec2 o=c*e*ca;col.r=px(u+o).r;col.b=px(u-o).b;}',
    // gentle sharpening against the source pixel neighbours
    'if(sharp>0.){vec2 o=.5/src;vec3 lw=vec3(.299,.587,.114);float n=dot(px(u+vec2(o.x,0.))+px(u-vec2(o.x,0.))+px(u+vec2(0.,o.y))+px(u-vec2(0.,o.y)),lw)*.25;col+=(dot(col,lw)-n)*sharp*(1.-integ);}',
    'col+=texture2D(b,uv).rgb*bloom;col+=texture2D(r,uv).rgb*rays*tint;',
    // highlight roll-off: no blown whites; soft S-curve; a little more colour; act mood
    'col-=max(col-.94,0.)*.45;float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.06);',
    'col=mix(col,col*col*(3.-2.*col),.12);col*=mix(vec3(1.),tint,.55);col*=1.+bright;',
    'col*=1.-vig*smoothstep(.18,.7,e*1.7);',
    'if(grain>0.)col+=(h(u*dst+fract(time)*61.)-.5)*grain;',
    'gl_FragColor=vec4(clamp(col,0.,1.),1.);}'
  ].join('');
  function sh(type, s) { const o = gl.createShader(type); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
  function prog(fs) {
    const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
    return { p, u, a: gl.getAttribLocation(p, 'p') };
  }
  function mkTex(w, h) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (w) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    return t;
  }
  function mkFb(w, h) { const t = mkTex(w, h); const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); return { f, t, w, h }; }
  function init() {
    src = G.display; host = src && src.parentNode;
    if (!src || !host) return false;
    cv = document.createElement('canvas'); cv.id = 'fx'; cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
    host.insertBefore(cv, src.nextSibling);
    gl = cv.getContext('webgl', { alpha: false, antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    if (!gl) return false;
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); fallback('context lost'); });
    PR.bright = prog(FS_BRIGHT); PR.blur = prog(FS_BLUR); PR.rays = prog(FS_RAYS); PR.fin = prog(FS_FINAL);
    buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    tex = mkTex(0, 0);
    // LINEAR: the sharp-bilinear sampler picks exact texel centres and blends only at seams (NEAREST dropped pixel columns)
    fb = [mkFb(G.W / 2, G.H / 2), mkFb(G.W / 2, G.H / 2), mkFb(G.W / 4, G.H / 4), mkFb(G.W / 4, G.H / 4)];
    return true;
  }
  function pass(pr, target, setU) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.f : null);
    gl.viewport(0, 0, target ? target.w : W, target ? target.h : H);
    gl.useProgram(pr.p); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(pr.a); gl.vertexAttribPointer(pr.a, 2, gl.FLOAT, false, 0, 0);
    setU(pr.u); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  const bind = (unit, t) => { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t); };
  const ACT_TINT = [[0.95, 0.98, 1.08], [1.05, 1.01, 0.95], [0.94, 1.02, 1.06], [1.04, 0.97, 1.06]];
  const tint = [1, 1, 1];
  function frame(state) {
    if (!tried && G.display) { tried = true; try { GFX.ok = init(); } catch (e) { console.warn('[gfx] off:', e && e.message); GFX.ok = false; } }
    if (!src) return;
    const p = P();
    if (!p.post || !GFX.ok) { if (cv) cv.style.display = 'none'; src.style.opacity = ''; return; }
    const rr = src.getBoundingClientRect(), hr = host.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(rr.width * dpr)), h = Math.max(1, Math.round(rr.height * dpr));
    if (w !== W || h !== H) { W = w; H = h; cv.width = w; cv.height = h; }
    cv.style.display = 'block';
    cv.style.left = (rr.left - hr.left) + 'px'; cv.style.top = (rr.top - hr.top) + 'px';
    cv.style.width = rr.width + 'px'; cv.style.height = rr.height + 'px';
    bind(0, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
    // bloom: bright -> half-res blur -> quarter-res wide blur
    pass(PR.bright, fb[0], u => { bind(0, tex); gl.uniform1i(u.t, 0); });
    pass(PR.blur, fb[1], u => { bind(0, fb[0].t); gl.uniform1i(u.t, 0); gl.uniform2f(u.d, 1 / fb[0].w, 0); });
    pass(PR.blur, fb[0], u => { bind(0, fb[1].t); gl.uniform1i(u.t, 0); gl.uniform2f(u.d, 0, 1 / fb[0].h); });
    pass(PR.blur, fb[2], u => { bind(0, fb[0].t); gl.uniform1i(u.t, 0); gl.uniform2f(u.d, 2 / fb[0].w, 0); });
    pass(PR.blur, fb[3], u => { bind(0, fb[2].t); gl.uniform1i(u.t, 0); gl.uniform2f(u.d, 0, 2 / fb[2].h); });
    if (p.rays > 0) pass(PR.rays, fb[1], u => { bind(0, fb[0].t); gl.uniform1i(u.t, 0); gl.uniform2f(u.lp, 0.5, 1.15); });
    const plan = G.Game.stage && G.Game.stage.plan;
    const want = state === 'title' ? [1, 1, 1] : ACT_TINT[(plan && plan.act) || 0] || [1, 1, 1];
    for (let k = 0; k < 3; k++) tint[k] += (want[k] - tint[k]) * 0.03;
    pass(PR.fin, null, u => {
      bind(0, tex); gl.uniform1i(u.t, 0);
      bind(1, fb[3].t); gl.uniform1i(u.b, 1);
      bind(2, p.rays > 0 ? fb[1].t : fb[3].t); gl.uniform1i(u.r, 2);
      gl.uniform2f(u.src, G.W, G.H); gl.uniform2f(u.dst, W, H); gl.uniform1f(u.time, (performance.now() / 1000) % 100);
      gl.uniform1f(u.bloom, p.bloom * 2.2); gl.uniform1f(u.rays, p.rays); gl.uniform1f(u.vig, p.vig);
      gl.uniform1f(u.grain, p.grain); gl.uniform1f(u.ca, p.ca); gl.uniform1f(u.sharp, p.sharp);
      gl.uniform1f(u.bright, (S.bright || 0) * 0.08); gl.uniform1f(u.integ, S.scaling === 'integer' ? 1 : 0);
      gl.uniform3f(u.tint, tint[0], tint[1], tint[2]);
    });
    gl.activeTexture(gl.TEXTURE0);
    src.style.opacity = '0';
    const tw = performance.now();
    if (watch.left > 0 && tw - watch.t > 700) { watch.t = tw; watchdog(); }
  }
  /* ---------- watchdog: the post pass must never leave a black screen ----------
     Every 0.7 s (for the first minute after start or after any change) a few
     pixels of the final picture are compared with the game canvas. If the game
     draws something and the post pass shows black twice in a row, the post pass
     is switched off and the plain canvas is shown again. */
  const watch = { t: 0, left: 90, bad: 0 };
  const px8 = new Uint8Array(4);
  function watchdog() {
    watch.left--;
    try {
      const sc = G.dctx && G.dctx.getImageData ? G.dctx : null;
      if (!sc) return;
      let srcSum = 0, outSum = 0;
      for (const [u, v] of [[0.25, 0.3], [0.5, 0.5], [0.75, 0.7], [0.4, 0.8], [0.6, 0.2]]) {
        const d = sc.getImageData(Math.floor(u * G.W), Math.floor(v * G.H), 1, 1).data; srcSum += d[0] + d[1] + d[2];
        gl.readPixels(Math.floor(u * W), Math.floor((1 - v) * H), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px8); outSum += px8[0] + px8[1] + px8[2];
      }
      if (gl.isContextLost && gl.isContextLost()) { fallback('context lost'); return; }
      watch.last = [srcSum, outSum];
      if (srcSum > 60 && outSum < 6) { if (++watch.bad >= 2) fallback('black output'); } else watch.bad = 0;
    } catch (e) { /* reading pixels can fail on some drivers: never fatal */ }
  }
  function fallback(why) {
    console.warn('[gfx] post pass off:', why);
    GFX.ok = false; S.preset = 'low'; store();
    if (cv) cv.style.display = 'none'; if (src) src.style.opacity = '';
    try { G.UI.toast(t(`Graphics were reset: the effects did not work on this computer|Графика сброшена: эффекты на этом компьютере не работают|Grafika asl holiga qaytarildi: effektlar bu kompyuterda ishlamadi`), '#f2c14a'); } catch (e) { /* ignore */ }
  }
  const prevSmooth = G.UI_SMOOTH;
  G.UI_SMOOTH = function (ctx, state) {
    try { frame(state); } catch (e) { console.warn('[gfx] off:', e && e.message); GFX.ok = false; if (cv) cv.style.display = 'none'; if (src) src.style.opacity = ''; }
    if (prevSmooth) prevSmooth.apply(this, arguments);
  };

  /* ---------- settings API (used by the Graphics menu) ---------- */
  GFX.S = S; GFX.PRESETS = PRESETS; GFX.watch = watch;
  GFX.set = (k, v) => { S[k] = v; store(); if (k === 'scaling') resize(); watch.left = 40; watch.bad = 0; if (k === 'preset' && v !== 'low' && !GFX.ok && gl && !(gl.isContextLost && gl.isContextLost())) GFX.ok = true; };
  GFX.reset = () => { for (const k in DEF) S[k] = DEF[k]; store(); resize(); watch.left = 40; watch.bad = 0; if (gl && !(gl.isContextLost && gl.isContextLost())) GFX.ok = true; try { G.UI.toast(t(`Graphics settings reset|Настройки графики сброшены|Grafika sozlamalari asl holiga qaytarildi`), '#f2c14a'); } catch (e) { /* ignore */ } };
  // F9 always resets the graphics settings, from any screen
  window.addEventListener('keydown', e => { if (e.code === 'F9') { e.preventDefault(); GFX.reset(); } }, true);
  GFX.cycle = (k, list) => { const i = list.indexOf(S[k]); GFX.set(k, list[(i + 1) % list.length]); };
  G.GFX = GFX;
}
