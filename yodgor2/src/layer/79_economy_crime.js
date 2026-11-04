/* =====================================================================
   Stage 6 — the economy (GDD ch. 15) and stealth and crime (GDD ch. 22).
   Merchants: named people at their places and hours (W2 schedules); stock by act
     and by standing; price = base × standing of the merchant's people (±30%)
     × event (the Bazaar fire +25%) × haggling (−20% this visit, or +10% until
     the next act after a failed haggle). Selling at 30% to the buyer Ibrohim
     (200 tilla per act), buying back what you sold. Quartermasters for "One of us".
   Stealth: the engine's enemies take notice through canSee() before they turn
     on you (aggro); here they see only in front of them, by the light and the
     noise you make, and fill a suspicion meter first ("?" → "!" and the alarm
     spreads to their neighbours). A blow on one that has not noticed you: ×3,
     knives ×4. [B] dims Sado's light (harder to see you, harder for you to see).
   Crime: theft (from merchants), lockpicking and burglary (household chests at
     night), killing people who are not fighters; a witness → the district's
     faction: −15 and a bounty (guards come for you). Clearing it: a fine (the
     Divan, the Rabat, Those Who Remember), confession and a tithe (the Singers),
     work (the Tail), or planting a memory in the witness on the spot.
   Companions react: Alp — theft from the poor, killing the unarmed; Nargiza —
     violence against ordinary people; Surayyo — anything done to the Tail.
   ===================================================================== */
{
  const F6 = FAC.S, cat3 = FAC.cat3;
  const W2x = () => G.WORLD2;
  const YI = () => G.YITEMS;
  const ID = () => G.Items.defs;
  const pl = () => (G.world && G.world.player) || null;
  const act = () => FAC.act();
  const day = () => { const s = W2x() && W2x().S(); return (s && s.day) || 1; };
  const nameOf = id => { try { return LANG.T(ID()[id].name); } catch (e) { return id; } };

  /* ================================================================ merchants (GDD ch. 15 table) */
  CAST.shavkat = { name: `Shavkat the armourer|Оружейник Шавкат|Qurolsoz Shavkat`, portrait: 'davron' };
  CAST.maruf = { name: `Ma'ruf the smith|Кузнец Маъруф|Temirchi Ma'ruf`, portrait: 'davron' };
  CAST.zebo = { name: `Zebo the herbalist|Травница Зебо|Giyohfurush Zebo`, portrait: 'widow' };
  CAST.ibrohim = { name: `Ibrohim the buyer|Скупщик Иброхим|Xaridor Ibrohim`, portrait: 'auctioneer' };
  CAST.sayfi = { name: `Sayfi the smuggler|Контрабандист Сайфи|Kontrabandachi Sayfi`, portrait: 'farrukh' };
  CAST.haydar = { name: `Haydar the cartographer|Картограф Хайдар|Xaritachi Haydar`, portrait: null };
  CAST.farrukh_m = { name: CAST.farrukh.name, portrait: 'farrukh' };
  const LK = {
    shavkat: { robe: '#4a3a2a', trim: '#c8a040', skin: '#a07858', head: 'turban', headC: '#3a2a1a', beard: 'short', scale: 1.05 },
    maruf: { robe: '#3a2a20', trim: '#8a5a32', skin: '#a07050', head: 'doppi', headC: '#1a1a1a', beard: 'long', scale: 1.08 },
    zebo: { robe: '#4a6a3a', trim: '#c8d8a0', skin: '#b08868', head: 'scarf', headC: '#6a8a4a' },
    ibrohim: { robe: '#5a4a6a', trim: '#e2b452', skin: '#c89a78', head: 'turban', headC: '#e8e0d0', beard: 'long' },
    sayfi: { robe: '#2a3a3a', trim: '#6a8a8a', skin: '#a07a5a', head: 'hood', headC: '#1a2a2a' },
    haydar: { robe: '#6a5a3a', trim: '#e8d8a8', skin: '#c8a080', head: 'doppi', headC: '#3a5a8a', beard: 'short' },
    farrukh: { robe: '#7a3a2a', trim: '#e2b452', skin: '#c89a78', head: 'turban', headC: '#c8a040' }
  };
  // stock: [kind, filter(def) | null, count]; fac: whose standing sets the price; buyer: buys from you
  const M = FAC.MERCH = {
    shavkat: { fac: 'divan', where: () => [{ from: 8, to: 20, region: 'bazaar', spot: 'copper' }], stock: () => [['weapon', d => ['sabre', 'staff', 'knife', 'ranged'].includes(d.yd.cat) && d.yd.sub !== 'crossbow', 3 + act()]],
      hello: `Shavkat lays a blade across his forearm like a fishmonger with a carp. "Balanced. Ugly. Kills."|Шавкат кладёт клинок на предплечье, как торговец рыбой — сазана. «Сбалансирован. Уродлив. Убивает».|Shavkat tig'ni bilagiga baliqchi zog'orani qo'ygandek qo'yadi. «Muvozanatli. Xunuk. O'ldiradi».` },
    maruf: { fac: 'tail', smith: true, where: () => [{ from: 7, to: 19, region: 'potters', spot: 'pots' }], stock: () => [['material', d => /mat_(iron|bulat|bone|salt|wax)/.test(d.id), 3], ['mod', null, act() >= 2 ? 2 : 1]],
      hello: `Ma'ruf doesn't stop hammering. "Iron, bulat, bone of the Sleeper. Bring me a blade and tilla, and I'll make it worse for your enemies."|Маъруф не перестаёт стучать. «Железо, булат, кость Спящего. Принеси клинок и тиллу — и я сделаю его хуже. Для твоих врагов».|Ma'ruf bolg'asini to'xtatmaydi. «Temir, bulat, Uxlovchining suyagi. Tig' va tilla olib kel — dushmanlaring uchun uni yomonroq qilaman».` },
    zebo: { fac: 'tail', where: () => [{ from: 6, to: 18, region: 'tail', spot: 'square' }], stock: () => [['consumable', null, 4], ['material', d => /mat_(herbs|thread)/.test(d.id), 2]],
      hello: `Zebo sniffs you. "Bitter water, lamp smoke and not enough sleep. I have something for two of those."|Зебо принюхивается к тебе. «Горькая вода, ламповый дым и недосып. От двух из трёх у меня кое-что есть».|Zebo seni hidlab ko'radi. «Achchiq suv, chiroq tutuni va uyqusizlik. Uchtadan ikkitasiga menda dori bor».` },
    ibrohim: { fac: 'divan', buyer: true, where: () => [{ from: 0, to: 24, region: 'bazaar', spot: 'f_buyer' }], stock: () => [['material', d => /mat_(bulat|bone)/.test(d.id), 2], ['tumar', null, 1]],
      hello: `Ibrohim weighs your bag with his eyes before you open it. "I buy everything. At a third. That's the sound of honesty, yodchi."|Иброхим взвешивает твою сумку глазами, ещё до того как ты её открыл. «Покупаю всё. За треть. Так звучит честность, ёдчи».|Ibrohim xaltangni ochmasingdanoq ko'zi bilan tortib ko'radi. «Hamma narsani olaman. Uchdan biriga. Halollik shunday eshitiladi, yodchi».` },
    farrukh_m: { fac: null, buyer: 'tumar', where: () => [{ from: 18, to: 24, region: 'bazaar', spot: 'auction' }, { from: 0, to: 5, region: 'karez', spot: 'den' }], stock: () => [['tumar', null, 2], ['charm', null, 2]],
      hello: `Farrukh spreads his hands over a cloth of tumars. "Somebody's first kiss, somebody's last laugh. Today only, which is what I say every day."|Фаррух разводит руками над платком с тумарами. «Чей-то первый поцелуй, чей-то последний смех. Только сегодня — я так говорю каждый день».|Farrux tumarli ro'mol ustida qo'llarini yoyadi. «Kimningdir birinchi o'pichi, kimningdir so'nggi kulgisi. Faqat bugun — buni har kuni aytaman».` },
    sayfi: { fac: null, picks: 30, where: () => [{ from: 0, to: 24, region: 'karez', spot: 'lamps' }], stock: () => [['armour', d => d.yd.set === 'smuggler', 2], ['consumable', null, 1]],
      hello: `Sayfi doesn't get up. "Smuggler's leather, picks, and the way through, if you pay for it. Down here, the way is the dear part."|Сайфи не встаёт. «Кожа контрабандиста, отмычки и проход, если заплатишь. Тут, внизу, проход — самое дорогое».|Sayfi o'rnidan turmaydi. «Kontrabandachi charmi, shaqildoqlar va yo'l, to'lasang. Bu yerda, pastda, yo'l eng qimmat narsa».` },
    haydar: { fac: 'divan', charts: true, where: () => [{ from: 8, to: 18, region: 'bazaar', spot: 'carto' }], stock: () => [],
      hello: `Haydar unrolls a corner of a map and rolls it back before you can read it. "Outlines, yodchi. The city's skin. Thirty tilla a district."|Хайдар разворачивает уголок карты и сворачивает, прежде чем ты успеваешь прочесть. «Очертания, ёдчи. Кожа города. Тридцать тилла за квартал».|Haydar xarita burchagini ochadi va o'qib ulgurmasingdan yana o'raydi. «Shakllar, yodchi. Shaharning terisi. Har bir mavze o'ttiz tilla».` },
    // quartermasters (GDD ch. 6, 15): "One of us" with their people; they live in the arcs' files
    nodira: { fac: 'divan', qm: 'divan', stock: () => [['armour', d => d.yd.set === 'divan', 2], ['weapon', d => d.yd.cat === 'shield' || d.yd.sub === 'crossbow', 2]] },
    habiba: { fac: 'singers', qm: 'singers', stock: () => [['armour', d => d.yd.set === 'singers', 2], ['weapon', d => d.yd.cat === 'dutar', 2], ['mod', null, 1]] },
    zulfiya: { fac: 'remember', qm: 'remember', night: true, picks: 25, stock: () => [['mod', null, 2], ['charm', null, 2], ['armour', d => d.yd.set === 'ash', 1]] },
    caravaneer: { fac: 'rabat', stock: () => [['weapon', d => d.yd.sub === 'bow', 2], ['armour', d => d.yd.set === 'caravan', 2], ['charm', null, act() >= 2 ? 1 : 0]] },
    skytrader: { fac: 'rabat', stock: () => [['charm', null, 2], ['weapon', d => d.yd.cat === 'ranged', 1], ['armour', d => d.yd.set === 'caravan', 1]] }
  };
  FAC.spot('bazaar', 'f_buyer', 0.64);
  for (const id of ['shavkat', 'maruf', 'zebo', 'ibrohim', 'sayfi', 'haydar', 'farrukh_m'])
    FAC.npc(id, { name: CAST[id].name, look: LK[id === 'farrukh_m' ? 'farrukh' : id], dx: { shavkat: 20, maruf: 30, zebo: -50, ibrohim: 0, sayfi: 50, haydar: 36, farrukh_m: -40 }[id] }, () => (W2x().moonPhase() >= 2 ? [] : M[id].where()));

  /* ---------------------------------------------------------------- the stock: fixed per merchant, act and two-day span (no rerolling by walking out) */
  const rng = seed => () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const hash = s => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff; return h; };
  const stageNow = () => [2.4, 5.4, 8.2][act() - 1] || 2.4;
  function stock(id) {
    const m = M[id], s = F6(); const mm = s.merch[id] || (s.merch[id] = {});
    const key = act() + ':' + Math.floor(day() / 2) + ':' + FAC.tier(m.fac || 'tail');
    if (mm.key === key && mm.items) return mm.items;
    const r = rng(hash(id) + act() * 101 + Math.floor(day() / 2) * 7);
    const st = stageNow() + (FAC.tier(m.fac || 'x') === 'trusted' ? 1 : 0), out = [];
    for (const [kind, filt, n] of m.stock()) {
      let L = []; try { L = YI().dropPool(st, kind).filter(d => d && d.yd && (!filt || filt(d))); } catch (e) { /* ignore */ }
      for (let i = 0; i < n && L.length; i++) {
        const d = L.splice(Math.floor(r() * L.length), 1)[0];
        const ty = YI().typeOf(d.id);
        let q = (ty === 'weapon' || ty === 'armour') ? (act() >= 2 ? 1 : (r() < 0.3 ? 1 : 0)) : 0;
        out.push({ id: d.id, q, n: ty === 'material' ? 1 + (r() < 0.5 ? 1 : 0) : 1 });
      }
    }
    // the Trusted get one thing nobody else is shown (GDD ch. 6): a masterwork from the back room
    if (FAC.tier(m.fac || 'x') === 'trusted') { const w = out.find(e => ['weapon', 'armour'].includes(YI().typeOf(e.id))); if (w) { w.q = 2; w.unique = 1; } }
    mm.key = key; mm.items = out; mm.bought = {}; save();
    return out;
  }
  // price for one entry here and now
  const visitKey = () => { const s = W2x() && W2x().S(); return (W2x() && W2x().active) + ':' + ((s && s.entered && s.entered[W2x().active]) || 0) + ':' + day(); };
  FAC.price = (mid, e) => {
    const m = M[mid] || {}, mm = F6().merch[mid] || {};
    let p = YI().price({ id: e.id, q: e.q || 0, up: 0 }) * (e.n || 1);
    p *= FAC.priceMul(m.fac);
    if (FAC.flag('bazaarFire') && FAC.flag('fireAct') === undefined) FAC.flag('fireAct', act());
    if (FAC.flag('bazaarFire') && FAC.flag('fireAct') === act() && (m.where && m.where().some(w => w.region === 'bazaar'))) p *= 1.25;
    if (mm.haggle === visitKey()) p *= 0.8;
    if (mm.angry === act()) p *= 1.1;
    return Math.max(1, Math.round(p));
  };

  /* ---------------------------------------------------------------- the trade menu */
  const QN = q => (q ? ' · ' + t((G.YITEMS.QUAL[q] || {}).name || '') : '');
  const refuses = mid => {
    const m = M[mid];
    if (m.fac && FAC.wanted(m.fac)) return `"Pay what you owe the law first. Then we'll talk about what you owe me."|«Сначала заплати, что должен закону. Потом поговорим о том, что должен мне».|«Avval qonunga qarzingni to'la. Keyin menga qarzing haqida gaplashamiz».`;
    if (m.fac && FAC.tier(m.fac) === 'enemy') return `"Not to you. Not today, not ever. Walk on."|«Тебе — нет. Ни сегодня, ни потом. Иди своей дорогой».|«Senga — yo'q. Bugun ham, keyin ham. Yo'lingdan qolma».`;
    if (m.qm && !FAC.atLeast(m.qm, 'own')) return null;
    return null;
  };
  function buyMenu(mid, done) {
    const list = stock(mid), mm = F6().merch[mid];
    const opts = list.map((e, i) => (mm.bought && mm.bought[i]) ? null : { id: 'b' + i, i, price: FAC.price(mid, e), label: nameOf(e.id) + (e.n > 1 ? ' ×' + e.n : '') + QN(e.q) + (e.unique ? ' ★' : '') }).filter(Boolean);
    if (M[mid].picks) opts.push({ id: 'pick', price: Math.round(M[mid].picks * FAC.priceMul(M[mid].fac)), label: `Lockpicks, three|Отмычки, три штуки|Shaqildoq, uchta` });
    if (!opts.length) { play([['', `Sold out until the next caravan.|Распродано до следующего каравана.|Keyingi karvongacha hammasi sotilgan.`]], done); return; }
    opts.push({ id: 'back', label: `"That's all."|«Это всё.»|«Shu, xolos.»` });
    ask(tf(`Your purse: {n} tilla|В кошельке: {n} тилла|Hamyonda: {n} tilla`, { n: (G.run && G.run.gold) || 0 }), opts, o => {
      if (o.id === 'back') { done(); return; }
      if (o.id === 'pick') { F6().picks = (F6().picks || 0) + 3; save(); toast(t(`Lockpicks +3|Отмычки +3|Shaqildoq +3`), '#ffe7a6'); buyMenu(mid, done); return; }
      const e = list[o.i]; mm.bought = mm.bought || {}; mm.bought[o.i] = 1; save();
      try { G.CH.give(e.id, { q: e.q || 0, n: e.n || 1 }); } catch (x) { console.error('[s6] give', x); }
      buyMenu(mid, done);
    });
  }
  // selling: Ibrohim buys everything not worn or sacred, at 30% of its price, 200 tilla per act; Farrukh only tumars
  const SELL_CAP = 200;
  function sellMenu(mid, done) {
    const s = F6(), mm = s.merch[mid] || (s.merch[mid] = {});
    const left = SELL_CAP - ((mm.soldAct === act() && mm.soldSum) || 0);
    const only = M[mid].buyer === 'tumar' ? 'tumar' : null;
    const inv = YI().list().filter(e => { const ty = YI().typeOf(e.id); return ty && ty !== 'key' && ty !== 'skill' && !YI().equippedIn(e.u) && YI().sellPrice(e) > 0 && (!only || ty === only); }).slice(0, 7);
    const opts = inv.map(e => ({ id: 's', e, label: tf(`{n}{q} — {p} tilla|{n}{q} — {p} тилла|{n}{q} — {p} tilla`, { n: nameOf(e.id), q: QN(e.q), p: YI().sellPrice(e) }), lock: YI().sellPrice(e) > left ? `he's out of tilla this time|у него кончилась тилла|uning tillasi tugadi` : null }));
    opts.push({ id: 'back', label: `"That's all."|«Это всё.»|«Shu, xolos.»` });
    ask(tf(`He has {n} tilla left for you this time.|У него для тебя осталось {n} тилла.|Unda sen uchun {n} tilla qoldi.`, { n: Math.max(0, left) }), opts, o => {
      if (o.id === 'back') { done(); return; }
      const e = o.e, p = YI().sellPrice(e);
      mm.soldAct = act(); mm.soldSum = (mm.soldAct === act() ? (mm.soldSum || 0) : 0) + p;
      s.merch.sold = (s.merch.sold || []).concat([{ id: e.id, q: e.q || 0, up: e.up || 0, p, act: act() }]).slice(-6);
      YI().remove(e.u, 1); gold(p); save();
      sellMenu(mid, done);
    });
  }
  function buyBack(mid, done) {
    const s = F6(), list = (s.merch.sold || []).filter(x => x.act === act());
    if (!list.length) { play([['ibrohim', `I keep things a while. You didn't sell me anything I'd keep.|Я держу вещи какое-то время. Ты мне ничего такого не продавал.|Narsalarni bir muddat saqlayman. Sen menga saqlaydigan hech narsa sotmagansan.`]], done); return; }
    const opts = list.map((x, i) => ({ id: 'bb', x, price: Math.round(x.p * 1.6), label: nameOf(x.id) + QN(x.q) }));
    opts.push({ id: 'back', label: `"That's all."|«Это всё.»|«Shu, xolos.»` });
    ask('', opts, o => {
      if (o.id === 'back') { done(); return; }
      s.merch.sold.splice(s.merch.sold.indexOf(o.x), 1); save();
      try { G.CH.give(o.x.id, { q: o.x.q, up: o.x.up }); } catch (e) { /* ignore */ }
      done();
    });
  }
  // haggling (GDD ch. 15): three ways in; success −20% this visit, failure +10% until the next act
  function haggle(mid, done) {
    const mm = F6().merch[mid] || (F6().merch[mid] = {});
    ask(`How do you go about it?|С какой стороны зайдёшь?|Qaysi tomondan kirasan?`, [
      FAC.chk('collection', 2, `"Twenty years I've collected tithes. I know what a thing costs and what you paid for it."|«Двадцать лет я собираю десятину. Я знаю, сколько вещь стоит и почём ты её взял».|«Yigirma yildan beri ushr yig'aman. Narsa qancha turishini va uni necha pulga olganingni bilaman».`, { id: 'press' }, `Pressure|Давление|Bosim`),
      FAC.chk('mem', 5, `Listen to how he says the price, and catch the lie in it.|Послушать, как он называет цену, и поймать в ней ложь.|Narxni qanday aytayotganiga quloq solib, undagi yolg'onni ilg'ash.`, { id: 'lie' }, `Spot a lie|Распознать ложь|Yolg'onni ilg'ash`),
      FAC.chk('agi', 6, `Count the coins into his hand so fast he counts one short.|Отсчитать монеты в его ладонь так быстро, чтобы он одной не досчитался.|Tangalarni kaftiga shunday tez sanab berishki, bittasini sanamay qolsin.`, { id: 'coin' }, `Switch a coin|Подменить монету|Tangani almashtirish`),
      { id: 'no', label: `"Never mind."|«Неважно.»|«Mayli, qo'y.»` }
    ], o => {
      if (o.id === 'no') { done(); return; }
      mm.hTried = visitKey();
      if (o.ok) { mm.haggle = visitKey(); save(); toast(t(`He gives way: everything is cheaper this visit.|Он уступает: сегодня всё дешевле.|U yon berdi: bu safar hammasi arzonroq.`), '#bff7c6'); play([['', pick([`He sighs like a man watching his own camel walk away.|Он вздыхает, как человек, на глазах у которого уходит его верблюд.|U o'z tuyasi ketib qolayotganini ko'rib turgan odamdek xo'rsinadi.`, `"For you. Only because the day is long."|«Только для тебя. И только потому, что день длинный».|«Faqat sen uchun. Faqat kun uzun bo'lgani uchun».`])]], done); }
      else { mm.angry = act(); save(); toast(t(`He's offended: his prices go up until the moon changes.|Он обиделся: цены выше, пока луна не сменится.|U xafa bo'ldi: oy o'zgarguncha narxlari baland.`), '#d9a0a0'); play([['', pick([`"So that's what you think of me." The prices on the cloth change while you watch.|«Вот, значит, как ты обо мне думаешь». Цены на платке меняются у тебя на глазах.|«Demak, men haqimda shunday o'ylaysan». Ro'moldagi narxlar ko'z o'ngingda o'zgaradi.`, `He counts the coins back into your palm, one by one, slowly, insultingly.|Он отсчитывает монеты обратно тебе в ладонь, по одной, медленно, оскорбительно.|U tangalarni birma-bir, sekin, haqoratomuz tarzda kaftingga qaytarib sanaydi.`])]], done); }
    });
  }
  // stealing from a merchant: an action in plain words, an Agility check, a witness if it fails
  function steal(mid, done) {
    const list = stock(mid), mm = F6().merch[mid];
    const i = list.findIndex((e, k) => !(mm.bought && mm.bought[k]));
    if (i < 0) { done(); return; }
    const c = FAC.check('agi', 5 + act());
    if (c.ok) {
      mm.bought = mm.bought || {}; mm.bought[i] = 1; save();
      try { G.CH.give(list[i].id, { q: list[i].q || 0, n: list[i].n || 1 }); } catch (e) { /* ignore */ }
      FAC.crime('theft', { fac: M[mid].fac, seen: false, poor: M[mid].fac === 'tail' });
      play([['', `It's in your sleeve before he finishes the sentence.|Вещь у тебя в рукаве раньше, чем он договаривает фразу.|U gapini tugatmasidan oldin narsa yengingda.`]], done);
    } else {
      FAC.crime('theft', { fac: M[mid].fac || FAC.DISTRICT[W2x().active] || 'divan', seen: true, poor: M[mid].fac === 'tail' }, done);
    }
  }
  function charts(done) {
    const s = W2x().S(), regs = Object.keys(W2x().regions).filter(r => W2x().regions[r].map && !s.visited[r] && !s.charts[r] && W2x().regions[r].tier !== 'dream').slice(0, 6);
    const opts = regs.map(r => ({ id: r, price: 30, label: t(W2x().regions[r].name) }));
    opts.push({ id: 'back', label: `"That's all."|«Это всё.»|«Shu, xolos.»` });
    ask('', opts, o => { if (o.id !== 'back') { s.charts[o.id] = 1; save(); toast(tf(`Chart: {n}|Карта: {n}|Xarita: {n}`, { n: t(W2x().regions[o.id].name) }), '#ffe7a6'); } done(); });
  }
  // a merchant's options (also added to quartermasters' menus)
  function tradeOpts(mid) {
    const m = M[mid], out = [];
    const why = refuses(mid);
    if (why) return [{ label: `— Show me your goods.|— Покажи товар.|— Molingni ko'rsat.`, go: d => play([['', why]], d) }];
    if (m.qm && !FAC.atLeast(m.qm, 'own')) return [];
    if (m.night && !(W2x().isNight && W2x().isNight())) return [];
    if (m.stock().length || m.picks) out.push({ label: `— Show me your goods.|— Покажи товар.|— Molingni ko'rsat.`, go: d => buyMenu(mid, d) });
    if (m.smith) out.push({ label: `— Work on my weapon.|— Поработай над моим оружием.|— Qurolim ustida ishla.`, go: d => { d(); setTimeout(() => G.INV_OPEN && G.INV_OPEN({ smith: true }), 80); } });
    if (m.charts) out.push({ label: `— Which districts have you drawn?|— Какие кварталы у тебя нарисованы?|— Qaysi mavzelarni chizgansan?`, go: charts });
    if (m.buyer) out.push({ label: `— I have things to sell.|— Есть что продать.|— Sotadigan narsam bor.`, go: d => sellMenu(mid, d) });
    if (mid === 'ibrohim') out.push({ label: `— I want back something I sold you.|— Хочу выкупить то, что продал.|— Sotganimni qaytarib olmoqchiman.`, go: d => buyBack(mid, d) });
    const mm = F6().merch[mid] || {};
    if (m.stock().length && mm.hTried !== visitKey()) out.push({ label: `— Let's talk about the price.|— Давай о цене поговорим.|— Narx haqida gaplashaylik.`, go: d => haggle(mid, d) });
    if (m.stock().length && !m.qm) out.push({ label: `Pocket something while he's counting.|Пока он считает, сунуть что-нибудь в рукав.|U sanayotganda biror narsani yengga solish.`, go: d => steal(mid, d) });
    return out;
  }
  FAC.tradeOpts = tradeOpts;
  for (const mid of ['shavkat', 'maruf', 'zebo', 'ibrohim', 'sayfi', 'haydar', 'farrukh_m']) {
    FAC.talk[mid] = d => {
      const m = M[mid];
      const t0 = CAST[mid].name, tier = m.fac ? cat3(' · ', REP_NAME[m.fac], ': ', FAC.TIER_NAME[FAC.tier(m.fac)]) : '';
      play([[mid, m.hello]], () => FAC.menu(mid, cat3(t0, tier), tradeOpts(mid), d));
    };
  }
  for (const q of ['nodira', 'habiba', 'zulfiya']) FAC.extra(q, () => { const o = tradeOpts(q); return o.length ? o[0] && Object.assign({}, o[0], { label: `— Show me what you keep for your own.|— Покажи, что держишь для своих.|— O'zinikilar uchun saqlaganingni ko'rsat.` }) : null; });
  // the caravan traders of the Rabat and the Withers (townsfolk of 85a) open their packs too
  s6init(() => {
    for (const id of ['caravaneer', 'skytrader']) {
      const n = W2x().npcs[id]; if (!n) continue;
      const t0 = n.talk;
      n.talk = function (done) { const ex = tradeOpts(id); if (!ex.length) return t0.apply(this, arguments); FAC.menu(id, cat3(n.name, ' · ', REP_NAME.rabat, ': ', FAC.TIER_NAME[FAC.tier('rabat')]), ex, done); };
    }
  });

  /* ================================================================ crime: witnesses, bounties, clearing them */
  const FINE = { theft: 40, burglary: 60, murder: 150, lock: 20 };
  const WANTED = { singers: `the Singers|Певцы|Xonandalar`, divan: `the Divan|Диван|Devon`, remember: `Those Who Remember|Помнящие|Eslaganlar`, tail: `the Tail|Хвост|Dum`, rabat: `the Rabat|Рабат|Rabot` };
  // FAC.crime(kind, {fac, seen, poor, quiet, n}, done?) — done given: a scene that may let him plant a memory in the witness
  FAC.crime = (kind, o, done) => {
    o = o || {};
    const s = F6(); s.crimes = (s.crimes || 0) + 1; save();
    // the companions know, witness or not
    if (kind === 'murder') FAC.react({ nargiza: -25, alp: -15, surayyo: -10 }, 'murder');
    else if (o.poor || o.fac === 'tail') FAC.react({ alp: -10, surayyo: -10 }, 'theft from the poor');
    else FAC.react({ alp: -3 }, 'theft');
    if (!o.seen) { done && done(); return; }
    const k = o.fac || 'divan';
    const book = () => {
      const b = s.bounty[k] || (s.bounty[k] = { n: 0 });
      b.n += (FINE[kind] || 40) * (o.n || 1); b.kind = kind; save();
      FAC.add(k, -15, true);
      toast(t(cat3(`Wanted by |Тебя ищут: |Seni qidirmoqda: `, WANTED[k])), '#ff8a7a'); sfx('denied');
    };
    if (!done || o.quiet) { book(); done && done(); return; }
    play([['', pick([`A woman at a window has seen everything. She opens her mouth to shout.|Женщина в окне всё видела. Она открывает рот, чтобы закричать.|Derazadagi ayol hammasini ko'rdi. Baqirish uchun og'iz ochyapti.`, `A boy with a water jar stops dead and stares at your hands.|Мальчишка с кувшином замирает и смотрит на твои руки.|Ko'zachali bola joyida qotib, qo'llaringga tikilib qoladi.`])]], () => ask('', [
      FAC.chk('mem', 5, `Look into the witness's eyes and sing: you saw a tired man, nothing more.|Посмотреть свидетелю в глаза и вселить: ты видел усталого человека, и только.|Guvohning ko'ziga qarab joylash: sen charchagan odamni ko'rding, bor-yo'g'i shu.`, { id: 'plant' }, `Plant|Вселить|Joylash`),
      { id: 'run', label: `Walk away fast, and don't look back.|Быстро уйти и не оглядываться.|Tez ketish va ortga qaramaslik.` }
    ], c => {
      if (c.id === 'plant' && c.ok) { FAC.plant(`a witness who saw nothing|свидетель, который ничего не видел|hech narsa ko'rmagan guvoh`); play([['', `The witness blinks, frowns at nothing, and goes back to what they were doing.|Свидетель моргает, хмурится в пустоту и возвращается к своим делам.|Guvoh ko'zini pirpiratadi, bo'shliqqa qarab qovog'ini soladi va ishiga qaytadi.`]], done); return; }
      book(); done();
    }));
  };
  // clearing a bounty: the Divan's fine, the Singers' confession and tithe, the Tail's work (GDD ch. 22)
  const clearOpt = (k, how) => () => {
    if (!FAC.wanted(k)) return null;
    const b = F6().bounty[k];
    if (how === 'fine') return { label: tf(`— Pay the fine to {who}. ({n} tilla)|— Заплатить штраф: {who}. ({n} тилла)|— Jarimani to'lash: {who}. ({n} tilla)`, { who: t(WANTED[k]), n: b.n }), go: d => { if ((G.run.gold || 0) < b.n) { play([['', `Not enough tilla. The ledger waits.|Тиллы не хватает. Книга подождёт.|Tilla yetmaydi. Daftar kutib turadi.`]], d); return; } gold(-b.n); b.n = 0; save(); toast(t(`The bounty is lifted.|Розыск снят.|Qidiruv bekor qilindi.`), '#bff7c6'); d(); } };
    if (how === 'confess') return { label: `— I want to confess, and pay the tithe for it.|— Хочу покаяться и заплатить за это десятину.|— Tavba qilib, buning uchun ushr to'lamoqchiman.`, go: d => play([['habiba', `Sit. Say it. The Well takes the rest.|Садись. Говори. Остальное возьмёт Колодец.|O'tir. Gapir. Qolganini Quduq oladi.`]], () => { addVoid(5, `a confession, paid in memory|покаяние, оплаченное памятью|xotira bilan to'langan tavba`); b.n = 0; save(); toast(t(`The Singers forgive you.|Певцы тебя простили.|Xonandalar seni kechirdi.`), '#bff7c6'); d(); }) };
    if (how === 'work') return { label: `— Let me work it off. Water, roofs, whatever needs doing.|— Дай отработать. Вода, крыши — что нужно.|— Ishlab uzay. Suv, tomlar — nima kerak bo'lsa.`, go: d => play([['', `Six hours of carrying water up the Tail's stairs. By the end people are calling you by name again, not unkindly.|Шесть часов таскаешь воду по лестницам Хвоста. К концу тебя снова зовут по имени — без злости.|Olti soat Dum zinalaridan suv tashiysan. Oxiriga borib seni yana ismingdan chaqirishadi — yomonlik bilan emas.`]], () => { try { W2x().addTime(360); } catch (e) { /* ignore */ } b.n = 0; FAC.add('tail', 3, true); save(); toast(t(`The Tail forgives you.|Хвост тебя простил.|Dum seni kechirdi.`), '#bff7c6'); d(); }) };
    return null;
  };
  FAC.extra('nodira', clearOpt('divan', 'fine'));
  FAC.extra('habiba', clearOpt('singers', 'confess'));
  FAC.extra('zebo', clearOpt('tail', 'work'));
  FAC.extra('zulfiya', clearOpt('remember', 'fine'));
  FAC.extra('ibrohim', clearOpt('divan', 'fine'));
  s6init(() => {
    for (const [id, k] of [['clerk', 'rabat'], ['guardsman', 'divan']]) {
      const n = W2x().npcs[id]; if (!n) continue;
      const t0 = n.talk;
      n.talk = function (done) { const o = clearOpt(k, 'fine')(); if (!o) return t0.apply(this, arguments); FAC.menu(id, '', [o], done); };
    }
  });

  /* ================================================================ burglary: household chests at night (GDD ch. 22) */
  const CHESTS = [['tail', 'ropes', -70, true], ['potters', 'kilnyard', 70, true], ['bazaar', 'carto', 90, false], ['ark', 'roses', -80, false], ['rabat', 'customs', 60, false]];
  for (const [region, spot, dx, poor] of CHESTS) FAC.prop(region, spot, {
    id: 'chest_' + region, art: 'f6chest', dx, prompt: `A household chest in a dark courtyard|Сундук во тёмном дворе|Qorong'i hovlidagi sandiq`,
    when: () => W2x().isNight() && !FAC.flag('chest_' + region + '_' + act()),
    use: (d, it) => {
      const picks = F6().picks || 0;
      ask(`The lock is old. The house is asleep. Mostly.|Замок старый. Дом спит. Почти весь.|Qulf eski. Uy uxlayapti. Deyarli hammasi.`, [
        FAC.chk('agi', 3 + act(), picks ? tf(`Pick the lock. ({n} picks left)|Вскрыть замок отмычкой. (осталось {n})|Qulfni shaqildoq bilan ochish. ({n} ta qoldi)`, { n: picks }) : `Pick the lock with a bent nail.|Вскрыть замок гнутым гвоздём.|Qulfni egilgan mix bilan ochish.`, { id: 'pick' }, `Lockpicking|Взлом|Qulf ochish`),
        FAC.chk('str', 6, `Force the lid. It will make a noise.|Сорвать крышку. Будет шумно.|Qopqoqni sindirib ochish. Shovqin bo'ladi.`, { id: 'force' }),
        { id: 'no', label: `Leave it.|Не трогать.|Tegmaslik.` }
      ], o => {
        if (o.id === 'no') { d(); return; }
        const usedPick = o.id === 'pick' && picks > 0;
        const ok = o.id === 'pick' ? (usedPick ? FAC.check('agi', 1 + act()).ok : o.ok) : o.ok;
        if (!ok) { if (usedPick) { F6().picks = picks - 1; save(); } play([['', `The lock holds. Somewhere in the house a floorboard creaks.|Замок держится. Где-то в доме скрипит половица.|Qulf bo'sh kelmaydi. Uyning qayeridadir pol taxtasi g'ichirlaydi.`]], () => afterNoise(d, 1.4, region)); return; }
        FAC.flag('chest_' + region + '_' + act(), 1); it.open = true; it.dead = true;
        const g = Math.round((10 + Math.random() * 20) * (0.8 + 0.5 * act()) * (poor ? 0.6 : 1.3));
        gold(g);
        if (Math.random() < 0.4) { try { const e = YI().dropFor(stageNow(), { kind: Math.random() < 0.5 ? 'consumable' : 'material' }); if (e) G.CH.give(e.id, { q: e.q || 0, n: e.n || 1 }); } catch (x) { /* ignore */ } }
        const seen = FAC.witness(o.id === 'force' ? 2 : 1);
        FAC.crime('burglary', { fac: FAC.DISTRICT[region] || 'tail', seen: !!seen, poor }, d);
      });
    }
  });
  const afterNoise = (d, k, region) => { const seen = FAC.witness(k); if (seen) FAC.crime('lock', { fac: FAC.DISTRICT[region] || 'tail', seen: true }, d); else d(); };
  // is anyone watching? townsfolk in sight by day; at night only those close, or a guard who has noticed him
  FAC.witness = (noise) => {
    const p = pl(); if (!p) return null;
    const night = W2x().isNight(), R0 = (night ? 90 : 210) * (noise || 1) * (FAC.dim ? 0.8 : 1);
    for (const o of G.world.ents) {
      if (!o || o.dead || o === p) continue;
      if (o._w2npc && Math.abs(o.x - p.x) < R0 && Math.abs(o.y - p.y) < 60) return o;
      if (o.isEnemy !== false && o.def && !o.isBoss && o.aggro && Math.abs(o.x - p.x) < R0 * 1.4 && Math.abs(o.y - p.y) < 70) return o;
    }
    return null;
  };

  /* ================================================================ stealth (GDD ch. 22) */
  FAC.dim = false;
  window.addEventListener('keydown', e => {
    if (e.code !== 'KeyB' || e.repeat || !R().world || G.Game.state !== 'play' || (G.UI.isOpen && G.UI.isOpen())) return;
    if (!sadoAwake()) return;
    FAC.dim = !FAC.dim;
    toast(t(FAC.dim ? `Sado dims her light. Harder to see you; harder for you to see.|Садо приглушает свет. Тебя труднее заметить — но и тебе труднее видеть.|Sado nurini xiralashtiradi. Seni payqash qiyinroq — lekin senga ham ko'rish qiyinroq.` : `Sado's light comes back.|Свет Садо возвращается.|Sadoning nuri qaytdi.`), '#9ff3e6');
  });
  {
    const a0 = G.ObjArt.sadoWisp, f0 = G.ObjArt.sadoWispFx;
    G.ObjArt.sadoWisp = function (ctx) { if (FAC.dim) ctx.globalAlpha = 0.35; const r = a0.apply(this, arguments); ctx.globalAlpha = 1; return r; };
    G.ObjArt.sadoWispFx = function () { if (FAC.dim) return; return f0.apply(this, arguments); };
  }
  // how visible he is, 0.3 .. 1.2: light (night, the dark below, Sado's light), noise (armour, running, attacking), the party
  const darkHere = () => { const b = G.level && G.level.biome; return !!(b && (b.dark || /karez|cistern|well|tunnel|mines|old/.test(b.id || ''))); };
  FAC.visibility = () => {
    const p = pl(); if (!p) return 1;
    let v = 1;
    const night = W2x() && W2x().on() && W2x().isNight();
    if (darkHere()) v *= (sadoAwake() && !FAC.dim) ? 0.8 : 0.55;
    else if (night) v *= FAC.dim ? 0.5 : 0.62;
    else if (FAC.dim) v *= 0.95;
    try { const w = G.CH.rollClass(); if (w === 'heavy') v *= 1.15; else if (w === 'light') v *= 0.9; } catch (e) { /* ignore */ }
    if (Math.abs(p.vx || 0) > 2.2) v *= 1.15;
    try { const act2 = (G.PARTY && G.PARTY.active()) || []; if (act2.some(id => G.PARTY.stance(id) !== 'silent')) v *= 1.15; } catch (e) { /* ignore */ }
    return Math.max(0.3, Math.min(1.25, v));
  };
  const stealthOn = e => !!(G.world && e && !e.isBoss && !e.isBossPart && !(G.level && G.level.isArena) && R().world && !e._f6patrol);
  {
    const EP = G.Enemy.prototype, cs0 = EP.canSee;
    EP.canSee = function (tg, a) {
      const p = pl();
      if (this.aggro || tg !== p || !stealthOn(this)) return cs0.apply(this, arguments);
      a = a === undefined ? 220 : a;
      const fr = G.frame || 0;
      if (this._s6f === fr) return (this._s6aware || 0) >= 1;
      this._s6f = fr;
      const dx = p.x - this.x, near = Math.abs(dx) < 30 && Math.abs(p.cy - this.cy) < 30;
      const ahead = Math.sign(dx) === (this.facing || 1) || near;
      const vis = FAC.visibility(), range = a * vis;
      let seen = ahead && cs0.call(this, tg, range);
      if (seen) {
        const d = Math.hypot(dx, p.cy - this.cy);
        this._s6aware = (this._s6aware || 0) + (near ? 0.25 : 0.012 + 0.05 * Math.max(0, 1 - d / Math.max(1, range)));
        this._s6lost = 0;
        if (this._s6aware > 0.45 && Math.abs(dx) > 4) this.facing = dx > 0 ? 1 : -1;
        if (fr % 24 === 0 && this._s6aware < 1) { try { G.FX.text(this.x, this.top - 10, '?', '#ffe060', { size: 8, life: 22 }); } catch (e) { /* ignore */ } }
      } else if (this._s6aware > 0) this._s6aware = Math.max(0, this._s6aware - 0.004);
      if ((this._s6aware || 0) >= 1) { alarm(this); return true; }
      return false;
    };
    const up0 = EP.update;
    EP.update = function () {
      const p = pl();
      // the alarm fades if he gets well away and out of sight for a while (they search, then give up)
      if (this.aggro && p && stealthOn(this) && this._s6alarmed) {
        if (Math.abs(p.x - this.x) > 520) { if (++this._s6lost > 300) { this.aggro = false; this._s6aware = 0.5; this._s6alarmed = false; } } else this._s6lost = 0;
      }
      return up0.apply(this, arguments);
    };
  }
  function alarm(e) {
    if (e._s6alarmed) return;
    e._s6alarmed = true; e._s6aware = 1; e._s6lost = 0;
    try { G.FX.text(e.x, e.top - 12, '!', '#ff5a3a', { size: 10, life: 40 }); sfx('alert', { x: e.x }); } catch (x) { /* ignore */ }
    // it calls its own: neighbours within earshot come too
    for (const o of G.world.enemies || []) if (o !== e && !o.dead && !o.aggro && stealthOn(o) && Math.abs(o.x - e.x) < 200 && Math.abs(o.y - e.y) < 90) { o._s6aware = Math.max(o._s6aware || 0, 0.8); }
  }
  // noise: attacking, rolling and heavy landings carry to those nearby
  TICK.push(() => {
    const p = pl(); if (!p || !G.world || !R().world || busy) return;
    const loud = (p.act ? 1 : 0) + (p.state === 'roll' ? 0.6 : 0);
    if (!loud) return;
    let r = 70 * loud; try { if (G.CH.rollClass() === 'heavy') r *= 1.5; } catch (e) { /* ignore */ }
    for (const o of G.world.enemies || []) if (!o.dead && !o.aggro && stealthOn(o) && Math.abs(o.x - p.x) < r && Math.abs(o.y - p.y) < 60) o._s6aware = Math.min(1, (o._s6aware || 0) + 0.08 * loud);
  });
  // a blow on one who hasn't noticed him: ×3, knives ×4 (GDD ch. 22); after it, everyone knows
  {
    const hit0 = G.Combat.hit;
    G.Combat.hit = function (src, target, info) {
      const p = pl();
      if (p && src === p && info && target && target !== p && target.def && stealthOn(target) && !target.aggro && !target.dead && (info.type === 'melee' || !info.type)) {
        const knife = info.item && info.item.def && info.item.def.yd && info.item.def.yd.cat === 'knife';
        info.dmg = (info.dmg || 0) * (knife ? 4 : 3); info.crit = false; info.backstab6 = true;
        FAC.stats.backstabs = (FAC.stats.backstabs || 0) + 1;
        try { G.FX.text(target.x, target.top - 14, t(`From the shadow!|Из тени!|Soyadan!`), '#c9b4ff', { size: 7, life: 40 }); } catch (e) { /* ignore */ }
        target._s6aware = 1;
        const r = hit0.apply(this, arguments);
        if (!target.dead) alarm(target);
        return r;
      }
      if (target && target !== p && target.def && src === p && !target.aggro) target._s6aware = 1;
      return hit0.apply(this, arguments);
    };
  }
  FAC.stats = {};
  // patrols sent after him (Enemy standing, bounties) know who they're looking for
  ON_STAGE.push(() => { setTimeout(() => { try { for (const e of (G.world && G.world.enemies) || []) if (e._f6patrol) { e.aggro = true; e._s6aware = 1; } } catch (x) { /* ignore */ } }, 50); });

  /* ================================================================ tests */
  FAC.econ = { stock, price: FAC.price, buyMenu, sellMenu, haggle, steal, visitKey };
}
