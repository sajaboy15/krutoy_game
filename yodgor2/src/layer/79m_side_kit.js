/* 79m_side_kit.js — the side stories' shared tools (GDD ch. 20): the journal shows them beside the faction work,
   their people come back later, and each one can leave a slide in the epilogue.
     SIDE.quest(id, def)          a FAC quest with fac 'side' (journal label "Side story")
     SIDE.epi(k, fn(e), picture)  an epilogue slide (fn returns the three-language text or null); picture = an existing
                                  slide painting to borrow ('tail:stories', 'city:tale'…)
     SIDE.flag(k[, v])            persistent facts of the side stories (R().f6.n with the 'side:' prefix)
     SIDE.hour()                  the world clock (0–24)
   Rules (GDD ch. 20): a riddle and a turn, two or more ways through, no clean good outcome, people return. */
const SIDE = G.SIDE = {};
{
  REP_NAME.side = `Side story|Побочная история|Qo'shimcha hikoya`;
  SIDE.quest = (id, def) => FAC.quest(id, Object.assign({ fac: 'side' }, def));
  SIDE.flag = (k, v) => FAC.flag('side:' + k, v);
  SIDE.hour = () => (G.WORLD2 && G.WORLD2.hour ? G.WORLD2.hour() : 12);
  SIDE.night = () => { const h = SIDE.hour(); return h >= 19 || h < 2; };
  SIDE.moon = () => (G.WORLD2 && G.WORLD2.moonPhase ? G.WORLD2.moonPhase() : 0);
  SIDE.epi = (k, fn, picture) => {
    FAC.EPI[k] = e => { const text = fn(e); return text ? { k, v: e, e, text } : null; };
    if (picture) s6init(() => { try { G.EPILOGUE && G.EPILOGUE.alias && G.EPILOGUE.alias(k, picture); } catch (x) { /* ignore */ } });
  };
  SIDE.party = id => FAC.inParty(id);
}
