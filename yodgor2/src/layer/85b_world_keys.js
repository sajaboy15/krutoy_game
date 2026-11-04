/* =====================================================================
   Stage 5 — the five keys that were data only in stage 4 get their effects
   (GDD ch.3, "Способности-ключи"), each with its alternative:
     water       Breath of water (Albasty)      dives: flooded sluices and tunnels
                                                 between regions, pools with things
                                                 at the bottom                     kinds exit_dive, divepool
     breath      the Sleeper's breath (Spine)   rides the updrafts from the cracks:
                                                 a column of air lifts him up a
                                                 tower no jump reaches            kind updraft
     well_sign   the Sign of the Well           the Singers' doors (archive, cells,
                 alt: Farrukh's forgery          candle galleries)                kind singersdoor, house key
     divan_seal  the Seal of the Divan          the Divan's doors (cellar, customs,
                 alt: a stolen seal              stores, treasury)                kind divandoor, house key
     voice       Turab's voice                  the singing doors of the old
                 alt: Turab's tales              bakhshi (a tale and a cache)     kind songdoor
   ===================================================================== */
{
  const TS = G.TS, T = G.T, U = G.U, RD = Math.round;
  const H = W2.H, OA = G.ObjArt;
  const pl = () => G.world && G.world.player;
  const say = (text, col) => toast(t(text), col || '#f2e6c8');
  const R2 = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(RD(x), RD(y), w, h); };
  function obj(x, y, o) {
    if (typeof o.prompt === 'string' && o.prompt.split('|').length === 3) o = Object.assign({}, o, { prompt: t(o.prompt) });
    const it = new G.Interactable(x, y, Object.assign({ w: 22, h: 26 }, o));
    if (o.interact === false) it.interact = false;
    it.layer = o.layer != null ? o.layer : -2;
    it._w2 = o.sid || true;
    G.world.add(it);
    return it;
  }

  /* ================================================================ the keys, now real */
  const K0 = W2.keys;
  for (const k of ['well_sign', 'divan_seal', 'water', 'voice', 'breath']) if (K0[k]) delete K0[k].todo;
  if (K0.voice) K0.voice.alt = ['tales'];
  W2.key('forged_sign', { name: `A forged Sign of the Well|Поддельный Знак Колодца|Qalbaki Quduq belgisi`, from: `Farrukh, in any chaikhana|Фаррух, в любой чайхане|Farrux, istalgan choyxonada`, opens: `What the real Sign opens, if nobody looks closely|То же, что настоящий Знак, — если не присматриваться|Haqiqiy belgi ochadigan narsani — agar diqqat bilan qaralmasa` });
  W2.key('stolen_seal', { name: `A stolen Divan seal|Краденая печать Дивана|O'g'irlangan Devon muhri`, from: `A theft in the Ark|Кража в Арке|Arkdagi o'g'rilik`, opens: `The Divan's doors|Двери Дивана|Devon eshiklari` });
  W2.key('tales', { name: `Turab's tales|Сказания Тураба|Turobning ertaklari`, from: `Turab, in the ribs of the Sleeper|Тураб, в рёбрах Спящего|Turob, Uxlovchining qovurg'alarida`, opens: `The singing doors answer the old words too|Поющие двери откликаются и на старые слова|Kuylovchi eshiklar eski so'zlarga ham javob beradi` });

  /* ================================================================ water: dives */
  // a pool of black water in a dip of the floor (open levels) or on a room's floor (labyrinths)
  OA.w2pool = (ctx, o) => {
    const x = RD(o.x), y = RD(o.y), k = (G.time || 0);
    R2(ctx, x - 22, y - 3, 44, 3, '#1a2428');
    R2(ctx, x - 20, y - 5, 40, 3, '#0a1a20');
    for (let i = 0; i < 5; i++) R2(ctx, x - 18 + ((i * 9 + RD(k * 6)) % 36), y - 5, 3, 1, '#2a6a7a');
    R2(ctx, x - 24, y - 6, 4, 6, '#3a3430'); R2(ctx, x + 20, y - 6, 4, 6, '#3a3430');
    if (o.open) { ctx.globalAlpha = 0.5 + 0.3 * Math.sin(k * 3); R2(ctx, x - 1, y - 9, 2, 3, '#9ff3e6'); ctx.globalAlpha = 1; }
  };
  OA.w2poolFx = (ctx, o) => { try { G.Light.add(o.x, o.y - 4, 40, '#3aa0b0', 0.25); } catch (e) { /* ignore */ } };
  const poolSite = (L, od) => {
    if (!L.isOpen && L.rooms && L.rooms.length) {
      const list = L.rooms.slice().sort((a, b) => a.ox - b.ox || a.oy - b.oy);
      const rm = typeof od.room === 'function' ? od.room(list, L) : list[Math.floor(((od.at && od.at.frac) || 0.5) * list.length)];
      if (!rm) return null;
      const tx = rm.ox + Math.floor(rm.w / 2), gy = H.ground(L, tx, rm.oy + 1);
      return gy ? { tx, ty: gy - 1, x: tx * TS + 8, y: gy * TS } : null;
    }
    const r = H.site(L, od.at.frac, { need: 8, head: 4 });
    return r ? { tx: r.tx + 4, ty: r.ty, x: (r.tx + 4) * TS, y: r.y } : null;
  };
  const DIVE_LOCKED = `Black water. Without air in your chest you won't get through.|Чёрная вода. Без воздуха в груди тут не пройти.|Qora suv. Ko'kragingda havo bo'lmasa, bu yerdan o'tib bo'lmaydi.`;
  W2.kind('exit_dive', {
    place(L, ex) { const r = poolSite(L, ex); return r && Object.assign(r, { entry: { x: r.x + 34, y: r.y, face: -1 } }); },
    spawn(o) {
      const ex = o.ex;
      const it = obj(o.x, o.y, { art: 'w2pool', w: 40, h: 14, open: W2.can(ex.key), prompt: ex.label || `Dive|Нырнуть|Sho'ng'ish`, sid: o.sid });
      it.onUse = () => {
        if (busy || W2.busy) return true;
        const why = W2.shutWhy(ex);
        if (why) { say(why, '#d9a0a0'); sfx('denied'); return true; }
        if (ex.key && !W2.can(ex.key)) { say(ex.locked || DIVE_LOCKED, '#d9a0a0'); sfx('denied'); return true; }
        const tg = W2.exitTarget(ex);
        if (!tg) { say(`The water goes nowhere for now.|Вода пока никуда не ведёт.|Suv hozircha hech qayerga olib bormaydi.`, '#d9a0a0'); return true; }
        say(`You fill your chest with the cistern's breath and go under.|Ты набираешь в грудь дыхание цистерны и уходишь под воду.|Ko'kragingni sardobaning nafasi bilan to'ldirib, suv ostiga sho'ng'iysan.`, '#9ff3e6');
        try { G.FX.burst(o.x, o.y - 4, 18, { speed: 2, life: 26, size: 2, size1: 0, color: '#9ff3e6' }); } catch (e) { /* ignore */ }
        W2.stats.dives = (W2.stats.dives || 0) + 1;
        W2.go(tg[0], tg[1], { sfx: 'roll', speed: 0.025 });
        return true;
      };
    }
  });
  // a pool with something at the bottom: a dive brings it up (once)
  W2.kind('divepool', {
    place(L, od) { return poolSite(L, od); },
    spawn(o, L) {
      const id = o.sid;
      const it = obj(o.x, o.y, { art: 'w2pool', w: 40, h: 14, open: W2.can('water') && !W2.taken(id), prompt: `Black water. Something glints at the bottom|Чёрная вода. На дне что-то блестит|Qora suv. Tubida nimadir yaltiraydi`, sid: id });
      if (W2.taken(id)) { it.interact = false; return; }
      it.onUse = (p, self) => {
        if (busy || self.usedUp) return true;
        if (!W2.can('water')) { say(DIVE_LOCKED, '#d9a0a0'); sfx('denied'); return true; }
        self.usedUp = true; self.interact = false; self.open = false; W2.take(id);
        sfx('roll');
        try { G.FX.burst(self.x, self.y - 4, 22, { speed: 2.4, life: 30, size: 2, size1: 0, color: '#9ff3e6' }); } catch (e) { /* ignore */ }
        try { G.YITEMS.openCache(self, p); } catch (e) { G.Pickups.gold(self.x, self.y - 10, 80); }
        try { if (G.CH) G.CH.addXp(20, 'explore'); } catch (e) { /* ignore */ }
        say(`You dive and bring it up from the bottom.|Ты ныряешь и достаёшь это со дна.|Sho'ng'ib, uni tubidan olib chiqasan.`, '#9ff3e6');
        W2.stats.dives = (W2.stats.dives || 0) + 1;
        return true;
      };
    }
  });

  /* ================================================================ breath: the updrafts */
  // a tower no jump reaches (the hooktower's shape, no ring); at its foot a crack breathes warm air.
  // With the Sleeper's breath the column of air lifts him to the roof; without it, it only pushes.
  const NO_RIDE = `The air from the crack pushes at you, but you can't ride it. Not yet.|Воздух из трещины толкает тебя, но оседлать его не выходит. Пока.|Yoriqdan chiqqan havo seni turtadi, lekin uni minib bo'lmayapti. Hozircha.`;
  OA.w2vent = (ctx, o) => {
    const x = RD(o.x), y = RD(o.y), k = G.time || 0;
    R2(ctx, x - 9, y - 2, 18, 2, '#1a1010');
    for (let i = -7; i <= 7; i += 2) R2(ctx, x + i, y - 3 - (Math.abs(i) < 4 ? 1 : 0), 1, 1, '#3a2a2a');
    if (o.live) { ctx.globalAlpha = 0.35 + 0.15 * Math.sin(k * 5); R2(ctx, x - 6, y - 4, 12, 2, '#f4e8ff'); ctx.globalAlpha = 1; }
  };
  W2.kind('updraft', {
    place(L, od, H2, def) {
      const r = W2.kinds.hooktower.place(L, od, H2, def);
      if (!r) return null;
      r.vent = { x: r.ring.x, y: (r.tx === undefined ? 0 : 0) + (od._fy || 0) };
      // the floor under the ring column: the tower's foot
      const fy = H.ground(L, Math.floor(r.ring.x / TS), Math.floor(r.ring.y / TS));
      r.vent.y = (fy || Math.floor(r.ring.y / TS) + (od.h || 11)) * TS;
      r.gid = def.id + ':draft:' + od.id;
      return r;
    },
    spawn(o, L) {
      W2.kinds.hooktower.spawn(o, L);
      // the hooktower put a ring up: not here, the air is the way
      for (const it of G.world.interactables) if (it.art === 'w2ring' && Math.abs(it.x - o.ring.x) < 2 && Math.abs(it.y - o.ring.y) < 2) it.dead = true;
      const v = o.vent, top = o.y - 40;
      const vent = obj(v.x, v.y, { art: 'w2vent', w: 18, h: 6, interact: false, live: W2.hasKey('breath') });
      let told = 0;
      const ent = new G.Entity(v.x, v.y); ent.layer = -9;
      ent.update = () => {
        const p = pl();
        vent.live = W2.hasKey('breath');
        if (Math.random() < (vent.live ? 0.5 : 0.15) && G.onScreen(v.x, v.y, 60)) G.FX.spawn({ x: v.x + U.rand(-6, 6), y: v.y - 4, vx: U.rand(-0.1, 0.1), vy: -U.rand(1.2, vent.live ? 3.6 : 1.6), life: vent.live ? 70 : 30, size: 1, size1: 0, shape: 'sq', color: '#f4e8ff', alpha: 0.6, drag: 1 });
        if (!p || p.dead || busy) return;
        if (Math.abs(p.x - v.x) > 15 || p.y > v.y + 4 || p.y < top) return;
        if (vent.live) {
          p.vy = Math.max(p.vy - 1.1, -6.2);
          p.airJumps = Math.max(p.airJumps || 0, 1);
          if (p.state === 'normal' && p.onGround) p.onGround = false;
          W2.stats.rides = (W2.stats.rides || 0) + (ent.riding ? 0 : 1); ent.riding = true;
        } else {
          if (p.vy > -1.5) p.vy -= 0.25;
          if (told-- <= 0) { told = 240; say(NO_RIDE, '#cfc6e8'); }
        }
      };
      ent.draw = () => {};
      G.world.add(ent);
      const u0 = ent.update;
      ent.update = function () { const p = pl(); if (p && (Math.abs(p.x - v.x) > 15 || p.y < top)) ent.riding = false; u0(); };
    }
  });

  /* ================================================================ houses on hollow ground */
  // the street site of stage 4 wants solid earth all the way down; the underground regions stand on
  // vaults and caves. A house there takes any floor run that is wide and tall enough.
  for (const kn of ['house', 'sealed']) {
    const K = W2.kinds[kn], p0 = K.place;
    K.place = function (L, od, H2, def) {
      const r = p0.call(this, L, od, H2, def);
      if (r) return r;
      const site0 = H.site;
      H.site = (L2, f, o) => H.runNear(L2, f, Object.assign({}, o, { ground: false, outdoor: false }));
      try { return p0.call(this, L, od, H2, def); } finally { H.site = site0; }
    };
  }

  /* ================================================================ the Singers', the Divan's and the singing doors */
  const DOORS = {
    singersdoor: {
      key: 'well_sign', seal: '#3a6ab0', trim: '#e8eef8',
      prompt: `A white door with the Sign of the Well|Белая дверь со Знаком Колодца|Quduq belgisi tushirilgan oq eshik`,
      locked: `The blue Sign of the Well on white wood. Singers' business. A real Sign would open it, and so would a good forgery.|Синий Знак Колодца на белом дереве. Дела Певцов. Откроет настоящий Знак — или хорошая подделка.|Oq yog'ochda ko'k Quduq belgisi. Xonandalarning ishi. Uni haqiqiy belgi ochadi — yoki yaxshi qalbakisi.`
    },
    divandoor: {
      key: 'divan_seal', seal: '#a8323a', trim: '#e2b452',
      prompt: `A cedar door under the Divan's seal|Кедровая дверь под печатью Дивана|Devon muhri bosilgan sadr eshik`,
      locked: `A storehouse of the Divan. Without the Seal, or a seal that went missing from someone's belt, it stays shut.|Склад Дивана. Без Печати — или печати, пропавшей у кого-нибудь с пояса, — он останется закрытым.|Devon ombori. Muhrsiz — yoki kimningdir belidan yo'qolgan muhrsiz — u yopiqligicha qoladi.`
    },
    songdoor: {
      key: 'voice', seal: '#c87a2a', trim: '#e8c890',
      prompt: `A door of carved apricot wood|Дверь резного абрикосового дерева|O'ymakor o'rik yog'ochidan eshik`,
      locked: `No lock, no handle. Old bakhshi words run round the frame. It wants a voice, or the old tales.|Ни замка, ни ручки. По раме вьются старые слова бахши. Ей нужен голос — или старые сказания.|Na qulfi bor, na tutqichi. Ramkasi bo'ylab keksa baxshilarning so'zlari aylanadi. Unga ovoz kerak — yoki eski ertaklar.`,
      opens: `You hum what Turab's voice taught you. The words on the frame answer one by one, and the door swings open.|Ты напеваешь то, чему научил голос Тураба. Слова на раме отзываются одно за другим, и дверь открывается.|Turobning ovozi o'rgatgan kuyni xirgoyi qilasan. Ramkadagi so'zlar birin-ketin javob beradi va eshik ochiladi.`
    }
  };
  const TALES = [
    `Inside the door, a tale in old letters: "The Teller had no name. Every night he gave the spirit a story, and the oasis grew by one tree."|На внутренней стороне двери — сказание старыми буквами: «У Сказителя не было имени. Каждую ночь он дарил духу историю, и оазис прибавлял по дереву».|Eshikning ichki tomonida eski harflar bilan ertak: «Ertakchining ismi yo'q edi. Har kecha u ruhga bir hikoya hadya qilardi, voha esa bittadan daraxtga ko'payardi».`,
    `Carved inside the door: "When the Seven came with their sums, the bakhshi stopped telling. The spirit waited a night, then a year. Then it was chained."|Вырезано изнутри двери: «Когда Семеро пришли со своими подсчётами, бахши перестали рассказывать. Дух ждал ночь, потом год. А потом его сковали».|Eshik ichiga o'yib yozilgan: «Yettilar o'z hisob-kitoblari bilan kelganda, baxshilar ertak aytishni to'xtatdi. Ruh bir kecha kutdi, keyin bir yil. Keyin uni kishanlashdi».`,
    `Painted inside, under a dutar: "A tale is the only tithe you pay and still keep."|Написано внутри, под дутаром: «Сказка — единственная десятина, которую отдаёшь и всё равно оставляешь себе».|Ichkariga, dutor ostiga yozilgan: «Ertak — berib ham o'zingda qoladigan yagona ushr».`
  ];
  OA.w2tale = (ctx, o) => { const x = RD(o.x), y = RD(o.y); R2(ctx, x - 5, y - 18, 10, 18, '#5a3a22'); R2(ctx, x - 4, y - 17, 8, 16, '#c8a070'); for (let i = 0; i < 4; i++) R2(ctx, x - 3, y - 15 + i * 4, 6, 1, '#5a3a22'); };
  for (const kind in DOORS) {
    const D = DOORS[kind];
    W2.kind(kind, {
      place(L, od, H2, def) {
        const inside = [{ kind: 'cache', dx: kind === 'songdoor' ? 0.7 : 0.5 }];
        // crowded streets: try a little to either side before giving up
        const f0 = od.at.frac;
        for (const sz of [[9, 5], [7, 4]]) for (const d of [0, 0.07, -0.07, 0.14, -0.14, 0.21, -0.21, 0.3, -0.3]) {
          const f = Math.max(0.06, Math.min(0.94, f0 + d));
          const r = W2.kinds.house.place(L, Object.assign({ w: sz[0], h: sz[1], doors: { w: 'locked', e: 'wall' }, key: D.key, locked: D.locked, inside }, od, { at: { frac: f } }), H2, def);
          if (r) return r;
        }
        return null;
      },
      spawn(o, L) {
        const def = W2.regions[W2.active];
        o.od = Object.assign({ key: D.key, locked: D.locked }, o.od);
        W2.kinds.house.spawn(o, L);
        const id = def.id + ':door:' + o.od.id + ':w';
        const d = o.doors.find(q => q.side === 'w');
        const it = G.world.interactables.find(q => q.art === 'w2door' && q._w2 === id);
        if (d) {
          // the emblem over the door: a seal in the house's colours
          const ex = d.x, ey = d.y - 70;
          L.dynDecos.push({ x: ex, y: ey, r: 12, layer: 'back', draw(ctx) { ctx.fillStyle = D.trim; ctx.fillRect(RD(ex - 6), RD(ey - 6), 12, 12); ctx.fillStyle = D.seal; ctx.fillRect(RD(ex - 4), RD(ey - 4), 8, 8); ctx.fillStyle = D.trim; ctx.fillRect(RD(ex - 1), RD(ey - 3), 2, 6); }, update() {} });
        }
        if (it) {
          it.prompt = t(D.prompt);
          const u0 = it.onUse;
          it.onUse = function () {
            if (!it.isOpen && W2.can(D.key)) { W2.stats.keyDoors = (W2.stats.keyDoors || 0) + 1; if (D.opens) say(D.opens, '#ffe7a6'); }
            return u0.apply(this, arguments);
          };
        }
        if (kind === 'songdoor' && d) {
          const tale = TALES[(def.id.length + o.od.id.length) % TALES.length];
          const hs = o.house, tx = (hs.x0 + 2) * TS + 8, ty = (hs.fy + 1) * TS;
          const st = obj(tx, ty, { art: 'w2tale', w: 12, h: 20, prompt: `Read the old words|Прочесть старые слова|Eski so'zlarni o'qish` });
          st.onUse = () => { if (busy) return true; if (!st.read) { st.read = true; try { if (G.CH) G.CH.addXp(30, 'explore'); } catch (e) { /* ignore */ } } scene(done => play([['stone', tale]], done)); return true; };
        }
      }
    });
  }

  /* ================================================================ enemies that spawned inside the rock */
  // The region generator sometimes drops a walker into a solid tile (a ledge built over its spawn point):
  // it can neither move nor be hit. On arrival, lift each such one to the nearest free air above, or remove it.
  function unstick() {
    const L = G.level, w = G.world;
    if (!L || !w || !W2.on()) return 0;
    const S = (x, y) => L.get(x, y) === T.SOLID;
    let n = 0;
    for (const e of w.enemies) {
      if (!e || e.dead || e.flying || e.fly) continue;
      const tx = Math.floor(e.x / TS), ty = Math.floor((e.y - 8) / TS);
      if (!S(tx, ty)) continue;
      let k = 1;
      while (k <= 10 && (S(tx, ty - k) || S(tx, ty - k - 1))) k++;
      if (k <= 10) { e.y = (ty - k + 1) * TS - 0.01; e.vy = 0; }
      else { e.dead = true; e.noLoot = true; }
      n++;
    }
    W2.stats.unstuck = (W2.stats.unstuck || 0) + n;
    return n;
  }
  W2.unstick = unstick;
  ON_STAGE.push(plan => { if (plan && plan.world && plan.type === 'level') { queue(() => stageT() > 2, unstick); queue(() => stageT() > 40, unstick); } });

  /* ================================================================ a relic: a thing to take once (a key's alternative, a legend) */
  // {kind:'relic', id, at:{frac} | (inside a house) dx, prompt, key?, legend?, lines?, when?()}
  OA.w2claw = (ctx, o) => {
    const x = RD(o.x), y = RD(o.y), k = Math.sin((G.time || 0) * 2) * 0.5 + 0.5;
    R2(ctx, x - 7, y - 2, 14, 2, '#2a3634');
    for (let i = 0; i < 9; i++) R2(ctx, x - 5 + i, y - 4 - Math.round(Math.sin(i / 8 * Math.PI) * 5) + (i > 6 ? i - 6 : 0), 1, 2, i > 6 ? '#e8f4f0' : '#9ab8b0');
    ctx.globalAlpha = 0.3 + 0.3 * k; R2(ctx, x + 2, y - 10, 1, 1, '#bff4ec'); ctx.globalAlpha = 1;
  };
  OA.w2clawFx = (ctx, o) => { try { G.Light.add(o.x, o.y - 6, 34, '#3aa0a0', 0.3); } catch (e) { /* ignore */ } };
  W2.kind('relic', {
    place(L, od) { const r = H.runNear(L, od.at.frac, { need: 3, head: 3 }); return r && { tx: r.tx + 1, ty: r.ty, x: (r.tx + 1) * TS + 8, y: r.y }; },
    spawn(o, L) { W2.kinds.relic.spawnAt(Object.assign({}, o.od, { x: o.x, y: o.y }), L, o.sid); },
    spawnAt(o, L, id) {
      if (W2.taken(id) || (o.when && !o.when())) return;
      if (o.key && W2.can(o.key.replace(/^stolen_seal$/, 'divan_seal').replace(/^forged_sign$/, 'well_sign'))) return;
      if (o.legend && G.CH && G.CH.S && G.CH.S().legends && G.CH.S().legends[o.legend]) return;
      const it = obj(o.x, o.y, { art: o.art || 'w2bag', w: 14, h: 12, prompt: o.prompt || `Take|Взять|Olish`, sid: id });
      it.onUse = (p, self) => {
        if (self.usedUp || busy) return true;
        const give = () => {
          self.usedUp = true; self.dead = true; W2.take(id);
          if (o.key) W2.giveKey(o.key);
          if (o.legend && G.CH && G.CH.grantLegend) G.CH.grantLegend(o.legend);
          sfx('ready');
        };
        if (o.lines) scene(done => play(o.lines, () => { give(); done(); })); else give();
        return true;
      };
    }
  });
}
