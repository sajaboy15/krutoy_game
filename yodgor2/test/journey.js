// Full journey (stage 5): the linear plan is gone — the story plays in the open city.
// This runs the scripted route through the regions (test/s5_route.js):
//   node test/journey.js <lang> <strat>      = node test/s5_route.js <lang> full tithe <strat>
// (the old linear version is kept in git history / the stage-5 scratch copy)
const { spawnSync } = require('child_process');
const lang = process.argv[2] || 'en', strat = process.argv[3] || 'first';
const r = spawnSync(process.execPath, [require('path').join(__dirname, 's5_route.js'), lang, 'full', 'tithe', strat], { stdio: 'inherit', env: process.env });
process.exit(r.status || 0);
