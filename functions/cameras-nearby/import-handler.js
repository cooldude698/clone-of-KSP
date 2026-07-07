const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const catalyst = require('zcatalyst-sdk-node');

async function importTable(app, tableName, csvFilePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const datastore = app.datastore();
          const table = datastore.table(tableName);
          let inserted = 0;
          const BATCH_SIZE = 150;
          
          for (let i = 0; i < results.length; i += BATCH_SIZE) {
            const batch = results.slice(i, i + BATCH_SIZE);
            await table.insertRows(batch);
            inserted += batch.length;
          }
          resolve(inserted);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}

module.exports = async function handleImport(req, res) {
  const app = catalyst.initialize(req);
  const baseDir = path.join(__dirname, '../../../crime-database/generated-csv');
  
  try {
    const tables = [
      { file: 'firs_v3.csv', table: 'FIRs' },
      { file: 'fir_accused_v2.csv', table: 'FIR_Accused' },
      { file: 'accused.csv', table: 'Accused' }
    ];

    const stats = {};
    for (const t of tables) {
      console.log(`Starting full import for ${t.table}...`);
      try {
        const count = await importTable(app, t.table, path.join(baseDir, t.file));
        stats[t.table] = count;
      } catch (e) {
        console.error(`Failed to import ${t.table}: ${e.message}`);
        stats[t.table] = `Failed: ${e.message}`;
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, stats }));
  } catch (err) {
    console.error('Import error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
};
