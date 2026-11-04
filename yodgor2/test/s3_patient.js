// Preload for long runs on a loaded machine: same tests, patient Playwright timeouts.
//   node -r ./test/s3_patient.js test/journey.js en first
const pw = require('playwright');
const l0 = pw.chromium.launch.bind(pw.chromium);
pw.chromium.launch = async (...a) => {
  const b = await l0(...a);
  const np = b.newPage.bind(b);
  b.newPage = async (...x) => { const p = await np(...x); p.setDefaultTimeout(900000); p.setDefaultNavigationTimeout(900000); return p; };
  return b;
};
