'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (context) => {
  const app = catalyst.initialize(context);
  const zcql = app.zcql();

  try {
    const watchlistCount = await zcql.executeZCQLQuery('SELECT COUNT(ROWID) FROM ANPR_Watchlist');
    console.log('ANPR_Watchlist row count:', watchlistCount);
  } catch (err) {
    console.error('ANPR_Watchlist query failed:', err.message);
  }

  try {
    const firCount = await zcql.executeZCQLQuery('SELECT COUNT(ROWID) FROM FIRs');
    console.log('FIRs row count:', firCount);
  } catch (err) {
    console.error('FIRs query failed:', err.message);
  }
};
