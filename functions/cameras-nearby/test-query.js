const catalyst = require('zcatalyst-sdk-node');

// Set environment variables for local testing
process.env.CATALYST_PROJECT_ID = '49149000000019001';

const app = catalyst.initialize();
const zcql = app.zcql();

zcql.executeZCQLQuery("SELECT accused_full_name, COUNT(ROWID) AS fir_count FROM FIR_Accused GROUP BY accused_full_name ORDER BY fir_count DESC LIMIT 200")
  .then(res => {
    console.log('Query success:', res);
  })
  .catch(err => {
    console.error('Query failed:', err);
  });
