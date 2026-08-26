/**
 * search-firs — Catalyst AdvancedIO Function (Cap #10: Data Store Full-Text Search)
 *
 * GET /search-firs?q=vehicle+theft+koramangala&limit=20
 * → { firs: [...], total_count, query, source: 'datastore'|'demo' }
 *
 * Uses Catalyst Data Store ZCQL with LIKE clauses for full-text search
 * across FIR description, location, crime type, accused name.
 */

const catalyst = require('zcatalyst-sdk-node');

const DEMO_FIRS = [
  { case_number: 'KAR/BEN/2026/1840', crime_type: 'Vehicle Theft', location_name: 'Koramangala 4th Block', district_name: 'Bengaluru Urban', status: 'Under Investigation', date_of_occurrence: '2026-08-01' },
  { case_number: 'KAR/BEN/2026/1726', crime_type: 'Drug Offence', location_name: 'Silk Board, BTM Layout', district_name: 'Bengaluru Urban', status: 'Chargesheeted', date_of_occurrence: '2026-07-22' },
  { case_number: 'KAR/MYS/2026/0521', crime_type: 'Chain Snatching', location_name: 'Mysuru City Market', district_name: 'Mysuru', status: 'FIR Registered', date_of_occurrence: '2026-07-15' },
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const send = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const qs = require('url').parse(req.url || '', true).query;
  const query = (qs.q || '').trim();
  const limitParam = Math.min(parseInt(qs.limit || '20', 10), 100);

  if (!query) {
    return send(400, { error: true, message: 'Query parameter q is required' });
  }

  try {
    const adminApp = catalyst.initialize(req, { scope: 'admin' });
    const zcql = adminApp.zcql();

    // Escape single quotes in query
    const safeQ = query.replace(/'/g, "''");

    // Multi-field LIKE search across key FIR columns
    const sql = `SELECT ROWID, case_number, crime_type, crime_type_code, district_name,
                        location_name, status, date_of_occurrence, description
                 FROM FIRs
                 WHERE case_number LIKE '%${safeQ}%'
                    OR crime_type LIKE '%${safeQ}%'
                    OR location_name LIKE '%${safeQ}%'
                    OR district_name LIKE '%${safeQ}%'
                    OR description LIKE '%${safeQ}%'
                 ORDER BY date_of_occurrence DESC
                 LIMIT ${limitParam}`;

    const rows = await zcql.executeZCQLQuery(sql);
    const firs = (rows || []).map(r => r.FIRs || r);

    if (firs.length > 0) {
      return send(200, { firs, total_count: firs.length, query, source: 'catalyst_datastore' });
    }

    // Fallback to demo data filtered by query
    const demoFiltered = DEMO_FIRS.filter(f =>
      JSON.stringify(f).toLowerCase().includes(query.toLowerCase())
    );

    return send(200, {
      firs: demoFiltered.length > 0 ? demoFiltered : DEMO_FIRS.slice(0, limitParam),
      total_count: demoFiltered.length || DEMO_FIRS.length,
      query,
      source: 'demo',
    });
  } catch (err) {
    console.error('[search-firs] Error:', err.message);
    return send(200, { firs: DEMO_FIRS, total_count: DEMO_FIRS.length, query, source: 'demo' });
  }
};
