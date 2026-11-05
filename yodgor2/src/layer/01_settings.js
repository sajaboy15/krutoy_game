/* 01_settings.js — the settings of GDD ch. 23 that the engine did not have:
   - key remapping, keyboard and gamepad: the engine's own actions (movement, jump, attack, roll, techniques, flask,
     interact, map) are rebound in its tables (build.py exposes them as G.KEYMAP_KB / G.KEYMAP_PAD); Yodgor's own keys
     (inventory, character, journal, book, stance, hook, orders…) are translated here: a rebound key is replayed to the
     rest of the game as the default one. First in the layer, so this listener runs before every other one.
   - text speed (the typewriter), subtitle size (Sado's lines during play), a clean screen (the HUD shows only in a
     fight or when hurt), hints on or off.
   Stored in this browser (localStorage 'yd_settings'): they are a player's conveniences, not part of a save. */
{
  const KEY = 'yd_settings';
  const SET = (() => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } })();
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(SET)); } catch (e) { /* ignore */ } };
  SET.kb = SET.kb || {}; SET.pad = SET.pad || {}; SET.lk = SET.lk || {};
  const ST = G.SETTINGS = { S: SET, store };
  const apply = () => {
    G.TEXT_SPEED = SET.textSpeed || 1;
    G.SUB_SCALE = SET.subScale || 1;
    G.HINTS = SET.hints !== false;
    G.HUD_WANT = SET.cleanHud ? hudWant : null;
  };
  // the HUD on a clean screen: in a fight, when hurt, in a boss arena; fades out otherwise
  let lastFight = -9999;
  function hudWant() {
    try {
      const p = G.world && G.world.player; if (!p) return 1;
      if (G.Game.boss || p.hp < p.maxHp * 0.6) return 1;
      for (const e of G.world.enemies) if (!e.dead && e.aggro && Math.abs(e.x - p.x) < 280) { lastFight = G.frame; return 1; }
      return G.frame - lastFight < 150 ? 1 : 0;
    } catch (e) { return 1; }
  }

  /* ================================================================ actions */
  // the engine's: name, and whether the arrow keys stay as a second key
  const EA = [
    ['left', `Move left|Влево|Chapga`, 'ArrowLeft'], ['right', `Move right|Вправо|O'ngga`, 'ArrowRight'], ['up', `Up, climb|Вверх, лезть|Yuqoriga, tirmashish`, 'ArrowUp'], ['down', `Down|Вниз|Pastga`, 'ArrowDown'],
    ['jump', `Jump|Прыжок|Sakrash`], ['attack', `Main weapon|Основное оружие|Asosiy qurol`], ['secondary', `Second weapon, shield|Второе оружие, щит|Ikkinchi qurol, qalqon`],
    ['roll', `Roll|Перекат|Dumalash`], ['skill1', `Technique 1|Приём 1|Usul 1`], ['skill2', `Technique 2|Приём 2|Usul 2`], ['heal', `Drink water|Испить воды|Suv ichish`],
    ['interact', `Interact|Взаимодействие|Harakat`], ['map', `Map|Карта|Xarita`]
  ];
  // Yodgor's own, with the code the rest of the layer listens for
  const LA = [
    ['inv', `Inventory|Инвентарь|Inventar`, 'KeyI'], ['char', `Character|Персонаж|Qahramon`, 'KeyC'], ['skills', `Yodchi skills|Навыки ёдчи|Yodchi mahoratlari`, 'KeyT'],
    ['party', `Companions|Спутники|Hamrohlar`, 'KeyO'], ['journal', `Journal|Журнал|Jurnal`, 'KeyN'], ['book', `Yodchi's book|Книга ёдчи|Yodchi kitobi`, 'KeyY'],
    ['stance', `Companions' stance|Стойка спутников|Hamrohlar holati`, 'KeyV'], ['hook', `Hook|Крюк|Ilmoq`, 'KeyG'], ['light', `Sado dims her light|Садо приглушает свет|Sado nurini pasaytiradi`, 'KeyB'],
    ['order1', `Order: Alp|Приказ Алпу|Alpga buyruq`, 'Digit1'], ['order2', `Order: Nargiza|Приказ Наргизе|Nargizaga buyruq`, 'Digit2'], ['order3', `Order: Surayyo|Приказ Сурайё|Surayyoga buyruq`, 'Digit3']
  ];
  ST.EA = EA; ST.LA = LA;
  const LDEF = {}; LA.forEach(a => { LDEF[a[0]] = a[2]; });
  // the engine's defaults, kept for "reset"
  let DEF_KB = null, DEF_PAD = null;
  function applyEngine() {
    const K = G.KEYMAP_KB, P = G.KEYMAP_PAD; if (!K) return false;
    if (!DEF_KB) { DEF_KB = {}; for (const k in K) DEF_KB[k] = K[k].slice(); DEF_PAD = {}; for (const k in P) DEF_PAD[k] = P[k].slice(); }
    for (const k in DEF_KB) K[k] = DEF_KB[k].slice();
    for (const k in DEF_PAD) P[k] = DEF_PAD[k].slice();
    for (const a of EA) {
      const c = SET.kb[a[0]]; if (c) K[a[0]] = a[2] ? [c, a[2]] : [c];
      const b = SET.pad[a[0]]; if (b != null) P[a[0]] = [b];
    }
    return true;
  }
  ST.applyEngine = applyEngine;
  // the tables appear on the engine's first input update
  { let n = 0; const iv = setInterval(() => { if (applyEngine() || ++n > 600) clearInterval(iv); }, 100); }

  /* ---------------------------------------------------------------- names of keys */
  const KN = { Space: `Space|Пробел|Probel`, ShiftLeft: 'Shift', ShiftRight: 'Shift', ControlLeft: 'Ctrl', ControlRight: 'Ctrl', AltLeft: 'Alt', AltRight: 'Alt', ArrowLeft: '←', ArrowRight: '→', ArrowUp: '↑', ArrowDown: '↓', Enter: 'Enter', Tab: 'Tab', Backspace: '⌫', Escape: 'Esc', CapsLock: 'Caps' };
  const keyName = c => { if (!c) return '—'; if (KN[c]) return KN[c].indexOf('|') >= 0 ? t(KN[c]) : KN[c]; return c.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num '); };
  const PADN = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'SEL', 'START', 'LS', 'RS', 'D↑', 'D↓', 'D←', 'D→'];
  ST.keyName = keyName;
  ST.keyOf = id => { const a = EA.find(x => x[0] === id); if (a) { const K = G.KEYMAP_KB; return keyName(SET.kb[id] || (K && K[id] && K[id][0]) || ''); } return keyName(SET.lk[id] || LDEF[id]); };
  ST.padOf = id => { const P = G.KEYMAP_PAD; const b = SET.pad[id] != null ? SET.pad[id] : P && P[id] ? P[id][0] : null; return b == null ? '—' : (PADN[b] || 'B' + b); };

  /* ================================================================ Yodgor's own keys, translated */
  let wait = null;                                   // a key being rebound: { group:'kb'|'lk', id, done }
  const mapLK = () => { const m = {}; for (const id in SET.lk) m[SET.lk[id]] = id; return m; };
  function replay(type, code, src) {
    const ev = new KeyboardEvent(type, { code, key: src.key, bubbles: true, cancelable: true, repeat: src.repeat, shiftKey: src.shiftKey, ctrlKey: src.ctrlKey, altKey: src.altKey });
    ev._yd = true;
    (document.activeElement || document.body || window).dispatchEvent(ev);
  }
  const onKey = e => {
    if (e._yd) return;
    if (wait) {
      if (e.type !== 'keydown') { e.stopImmediatePropagation(); return; }
      e.stopImmediatePropagation(); e.preventDefault();
      if (e.repeat) return;
      const w = wait; wait = null;
      if (e.code !== 'Escape') bind(w.group, w.id, e.code);
      w.done();
      return;
    }
    if (!Object.keys(SET.lk).length) return;
    const m = mapLK(), id = m[e.code];
    if (id && LDEF[id] !== e.code) { e.stopImmediatePropagation(); e.preventDefault(); replay(e.type, LDEF[id], e); return; }
    // a default key whose action moved elsewhere no longer opens it
    const moved = LA.find(a => a[2] === e.code && SET.lk[a[0]] && SET.lk[a[0]] !== e.code);
    if (moved && !id) { e.stopImmediatePropagation(); }
  };
  window.addEventListener('keydown', onKey, true);
  window.addEventListener('keyup', onKey, true);
  function bind(group, id, code) {
    if (group === 'kb') {
      // a key already on another action of the engine: they swap
      const K = G.KEYMAP_KB || {};
      const cur = SET.kb[id] || (K[id] && K[id][0]);
      for (const a of EA) { if (a[0] === id) continue; const c = SET.kb[a[0]] || (K[a[0]] && K[a[0]][0]); if (c === code) SET.kb[a[0]] = cur; }
      SET.kb[id] = code;
      applyEngine();
    } else if (group === 'lk') {
      const cur = SET.lk[id] || LDEF[id];
      for (const a of LA) { if (a[0] === id) continue; const c = SET.lk[a[0]] || a[2]; if (c === code) SET.lk[a[0]] = cur; }
      SET.lk[id] = code;
      for (const a of LA) if (SET.lk[a[0]] === a[2]) delete SET.lk[a[0]];
    }
    store();
    try { G.Audio.sfx('ui_select'); } catch (x) { /* ignore */ }
  }
  ST.bind = bind;
  // the gamepad: the first button pressed while waiting
  function waitPad(id, done) {
    const was = {};
    const pads = () => (navigator.getGamepads ? [...navigator.getGamepads()] : []).filter(Boolean);
    for (const p of pads()) p.buttons.forEach((b, i) => { if (b.pressed) was[i] = 1; });
    let n = 0;
    const iv = setInterval(() => {
      if (++n > 400) { clearInterval(iv); done(); return; }       // 8 s, then give up
      for (const p of pads()) for (let i = 0; i < p.buttons.length; i++) {
        if (p.buttons[i].pressed && !was[i]) { clearInterval(iv); for (const a of EA) if (a[0] !== id && SET.pad[a[0]] === i) delete SET.pad[a[0]]; SET.pad[id] = i; applyEngine(); store(); done(); return; }
        if (!p.buttons[i].pressed) was[i] = 0;
      }
    }, 20);
  }

  /* ================================================================ the menus (opened from "Settings" in 97_app.js) */
  const close = () => { try { const m = G.UI._debug().modal; if (m && m.type === 'choice') { m.picked = true; m.pickT = 0; m.pickVal = null; } } catch (e) { /* ignore */ } };
  const onoff = v => t(v ? `on|вкл.|yoq.` : `off|выкл.|o'ch.`);
  ST.menu = function menu(back) {
    const sp = SET.textSpeed || 1, ss = SET.subScale || 1;
    G.UI.choice({
      title: t(`Settings|Настройки игры|O'yin sozlamalari`), cancel: true,
      options: [
        { label: t(`Keyboard|Клавиатура|Klaviatura`), value: 'kb' },
        { label: t(`Gamepad|Геймпад|Geympad`), value: 'pad' },
        { label: t(`Text speed|Скорость текста|Matn tezligi`) + ': ' + (sp < 1 ? t(`slow|медленно|sekin`) : sp > 1.5 ? t(`instant|сразу|darhol`) : sp > 1 ? t(`fast|быстро|tez`) : t(`normal|обычно|odatiy`)), value: 'speed' },
        { label: t(`Subtitle size|Размер субтитров|Subtitr hajmi`) + ': ' + Math.round(ss * 100) + '%', value: 'sub' },
        { label: t(`Clean screen (HUD only in a fight)|Чистый экран (HUD только в бою)|Toza ekran (HUD faqat jangda)`) + ': ' + onoff(!!SET.cleanHud), value: 'hud' },
        { label: t(`Hints|Подсказки|Maslahatlar`) + ': ' + onoff(SET.hints !== false), value: 'hints' },
        { label: t(`Back|Назад|Orqaga`), value: null, color: '#9a8a78' }
      ],
      onPick: v => {
        if (!v) { back && back(); return; }
        if (v === 'kb') { kbMenu(() => menu(back)); return; }
        if (v === 'pad') { padMenu(() => menu(back)); return; }
        if (v === 'speed') { const L = [0.6, 1, 1.6, 4]; SET.textSpeed = L[(L.indexOf(sp) + 1) % L.length]; }
        if (v === 'sub') { const L = [1, 1.2, 1.4, 0.85]; SET.subScale = L[(L.indexOf(ss) + 1) % L.length]; }
        if (v === 'hud') SET.cleanHud = !SET.cleanHud;
        if (v === 'hints') SET.hints = SET.hints === false;
        store(); apply(); menu(back);
      }
    });
  };
  function kbMenu(back, top) {
    const rows = EA.map(a => ({ label: t(a[1]) + ':  ' + ST.keyOf(a[0]), value: 'e:' + a[0] })).concat(LA.map(a => ({ label: t(a[1]) + ':  ' + ST.keyOf(a[0]), value: 'l:' + a[0] })));
    rows.push({ label: t(`Reset to defaults|Сбросить по умолчанию|Asl holiga qaytarish`), value: 'reset', color: '#ffb070' });
    rows.push({ label: t(`Back|Назад|Orqaga`), value: null, color: '#9a8a78' });
    G.UI.choice({
      title: t(`Keyboard: choose an action, then press a key (Esc: keep)|Клавиатура: выбери действие и нажми клавишу (Esc — оставить)|Klaviatura: amalni tanla va tugmani bos (Esc — qoldirish)`), cancel: true, options: rows, sel: top || 0,
      onPick: v => {
        if (!v) { back(); return; }
        if (v === 'reset') { SET.kb = {}; SET.lk = {}; store(); applyEngine(); kbMenu(back); return; }
        const [g, id] = v.split(':');
        const nm = t((g === 'e' ? EA : LA).find(a => a[0] === id)[1]);
        // ask for the key: a one-line modal that the next key press closes
        setTimeout(() => {
          G.UI.choice({ title: tf(`Press a key for "{a}"…|Нажми клавишу для «{a}»…|«{a}» uchun tugmani bos…`, { a: nm }), cancel: false, options: [{ label: t(`(Esc: keep the old one)|(Esc — оставить прежнюю)|(Esc — eskisini qoldirish)`), value: null, color: '#9a8a78' }], onPick: () => { } });
          wait = { group: g === 'e' ? 'kb' : 'lk', id, done: () => { close(); setTimeout(() => kbMenu(back, rows.findIndex(r => r.value === v)), 260); } };
        }, 240);
      }
    });
  }
  function padMenu(back) {
    const rows = EA.map(a => ({ label: t(a[1]) + ':  ' + ST.padOf(a[0]), value: a[0] }));
    rows.push({ label: t(`Reset to defaults|Сбросить по умолчанию|Asl holiga qaytarish`), value: 'reset', color: '#ffb070' });
    rows.push({ label: t(`Back|Назад|Orqaga`), value: null, color: '#9a8a78' });
    G.UI.choice({
      title: t(`Gamepad: choose an action, then press a button|Геймпад: выбери действие и нажми кнопку|Geympad: amalni tanla va tugmani bos`), cancel: true, options: rows,
      onPick: v => {
        if (!v) { back(); return; }
        if (v === 'reset') { SET.pad = {}; store(); applyEngine(); padMenu(back); return; }
        const nm = t(EA.find(a => a[0] === v)[1]);
        setTimeout(() => {
          G.UI.choice({ title: tf(`Press a button for "{a}"…|Нажми кнопку для «{a}»…|«{a}» uchun tugmani bos…`, { a: nm }), cancel: false, options: [{ label: t(`(8 s, or Esc: keep the old one)|(8 с или Esc — оставить прежнюю)|(8 s yoki Esc — eskisini qoldirish)`), value: null, color: '#9a8a78' }], onPick: () => { } });
          let over = false;
          const fin = () => { if (over) return; over = true; window.removeEventListener('keydown', esc, true); close(); setTimeout(() => padMenu(back), 260); };
          const esc = e => { if (e.code === 'Escape') { e.stopImmediatePropagation(); fin(); } };
          window.addEventListener('keydown', esc, true);
          waitPad(v, fin);
        }, 240);
      }
    });
  }
  apply();
}
