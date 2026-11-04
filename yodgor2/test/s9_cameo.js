// The cameo side story "The Blue Wolf" (79n): offer, licence, light, premiere at night, each ending once.
//   node test/s9_cameo.js [lang=ru]
const T = require('./s6_lib');
const lang = process.argv[2] || 'ru';
const PLANS = [['pay', 'oil', 'dance'], ['press', 'taste', 'home'], ['part', 'sado', 'crowd']];
(async () => {
  const b = await T.chromium.launch();
  const out = [];
  for (const [lic, li, end] of PLANS) {
    const p = await T.start(b, { region: 'bazaar', lang });
    await T.watchText(p);
    const W = (f, a) => p.evaluate(f, a);
    await W(() => { G.run.gold = 500; const s = G.CH && G.CH.S(); if (s) { while (s.lvl < 8) G.CH.addXp(G.CH.xpNeed(s.lvl) - s.xp); } const c0 = G.CH.check; G.CH.check = (k, n, x) => (k === 'collection' ? { ok: true, have: n, need: n } : c0(k, n, x)); G.WORLD2.setHour && G.WORLD2.setHour(12); });
    const talk = async (id, pick) => {
      await W(id => { G.WORLD2.syncPeople(); const o = G.world.ents.find(e => e._w2npc === id && !e.dead); if (!o) throw new Error('no npc ' + id); const pl = G.world.player; pl.x = o.x - 18; pl.y = o.y; o.onUse(pl, o); }, id);
      const log = []; await T.drain(p, log, { pick }); return log;
    };
    const want = (...ids) => (opts) => { for (const id of ids) { const i = opts.findIndex(o => o && o.includes(id)); if (i >= 0) return i; } return null; };
    const L = [];
    L.push(...await talk('sherzod', (o, title) => { const i = o.findIndex(x => /Помогу|I'll help|Yordam/.test(x)); return i >= 0 ? i : null; }));
    const LIC = { pay: /сорок|forty|Qirq tilla/, press: /Подписывай|Sign it|Imzola/, part: /писарь\?|clerk in it|mirza bo'lsa/ };
    L.push(...await talk('qobil', o => { const i = o.findIndex(x => LIC[lic].test(x)); return i >= 0 ? i : null; }));
    const LI = { oil: /масла|oil|moy/, taste: /Испить|Taste|Totib/, sado: /Садо|Sado/ };
    L.push(...await talk('azamat', o => { let i = o.findIndex(x => LI[li].test(x)); if (li === 'taste' && i < 0) i = o.findIndex(x => /Сжечь|Burn|Yoqish/.test(x)); return i >= 0 ? i : null; }));
    await W(() => G.WORLD2.setHour(21)); await T.tick(p, 10);
    const END = { dance: /пляшут|dances|raqs/, home: /идёт домой|goes home|uyiga ketadi/, crowd: /Спроси|Ask them|so'ra/ };
    L.push(...await talk('sherzod', o => { const i = o.findIndex(x => END[end].test(x)); return i >= 0 ? i : null; }));
    const r = await W(() => ({ q: G.FAC.q('cameo'), lic: G.FAC.flag('side:cam_licence'), light: G.FAC.flag('side:cam_light'), gold: G.run.gold }));
    out.push({ plan: [lic, li, end], st: r.q.st, br: r.q.br, lic: r.lic, light: r.light, gold: r.gold, lines: L.length, errs: p._errs.slice(0, 3), untranslated: (await T.untranslated(p)).filter(s => !/^Level|^Уровень/.test(s)) });
    console.log(JSON.stringify(out[out.length - 1]));
    await p.close();
  }
  await b.close();
})();
