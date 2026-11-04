// Stage 6 smoke: the world loads with the faction layer, people stand where they should, Habiba offers the first job.
const T = require('./s6_lib');
(async () => {
  const b = await T.chromium.launch();
  const p = await T.start(b, { region: 'potters', lang: process.argv[2] || 'ru' });
  const log = [], R = {};
  await T.go(p, 'potters', 9, log);
  R.people = await T.W(p, () => G.world.ents.filter(e => e._w2npc).map(e => e._w2npc));
  R.props = await T.W(p, () => G.world.ents.filter(e => e._f6).map(e => e._f6));
  await T.talk(p, 'habiba', log, [/looking for|кого-то ищете|qidiryapsizmi/, /look into|Разберусь|Surishtirib/]);
  R.after = await T.fac(p);
  R.errs = p._errs.slice(0, 10); R.untr = await T.untranslated(p);
  console.log(JSON.stringify(R, null, 1)); console.log(log.join('\n'));
  await b.close();
})();
