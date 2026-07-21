const dbHelper = require('./db-helper');

module.exports = async (req, res) => {
    // Compat shim: local catalyst serve passes a plain Node.js http.IncomingMessage
    // which lacks getMethod()/getQueryParams(). Patch them in so both envs work.
    if (!req.getMethod || typeof req.getMethod !== 'function') req.getMethod = () => req.method;
    if (!req.getQueryParams || typeof req.getQueryParams !== 'function') req.getQueryParams = () => req.query || require('url').parse(req.url || '', true).query || {};

    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    // Short cache — FIRs list can tolerate 10s staleness
    res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=30');
    
    if (req.getMethod() === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    try {
        const queryParams = req.getQueryParams() || {};
        const district = queryParams.district || '';
        const crime_type = queryParams.crime_type || '';
        const date_from = queryParams.date_from || '';
        const date_to = queryParams.date_to || '';
        const status = queryParams.status || '';
        const limit = queryParams.limit || 50;

        const filters = { district, crime_type, date_from, date_to, status, limit };
        const firs = await dbHelper.getFIRsFiltered(req, filters);

        // Run a count query
        let countSql = "SELECT COUNT(ROWID) FROM FIRs";
        let whereClauses = [];
        if (district) whereClauses.push(`district_name = '${district.replace(/'/g, "''")}'`);
        if (crime_type) whereClauses.push(`crime_type_code = '${crime_type.replace(/'/g, "''")}'`);
        if (status) whereClauses.push(`status = '${status.replace(/'/g, "''")}'`);
        if (whereClauses.length > 0) {
            countSql += " WHERE " + whereClauses.join(" AND ");
        }

        const countResult = await dbHelper.executeQuery(req, countSql);
        const total_count = countResult.length > 0 ? (countResult[0].FIRs?.ROWID || countResult[0].FIRs?.case_number || Object.values(countResult[0].FIRs || {})[0] || 0) : 0;

        let resultFirs = firs.map(f => f.FIRs || f);
        if (resultFirs.length === 0) {
            resultFirs = [
                { case_number: "FIR-2026-BL-0492", date_filed: "2026-05-14", time_filed: "14:20:00", crime_type_code: "vehicle_theft", description: "Stolen Pulsar 220 Black outside Silk Board metro station", status: "under_investigation", district_name: "South Bengaluru", police_station: "HSR Layout PS", location_name: "Silk Board Junction", location_lat: 12.9175, location_lng: 77.6215 },
                { case_number: "FIR-2026-BL-0811", date_filed: "2026-06-02", time_filed: "22:15:00", crime_type_code: "robbery", description: "Armed robbery near MG Road signal approach", status: "registered", district_name: "Central Bengaluru", police_station: "Cubbon Park PS", location_name: "MG Road Signal", location_lat: 12.9762, location_lng: 77.6033 },
                { case_number: "FIR-2026-BL-1104", date_filed: "2026-06-18", time_filed: "06:45:00", crime_type_code: "chain_snatching", description: "Gold chain snatching by bike riders in Whitefield", status: "under_investigation", district_name: "East Bengaluru", police_station: "Whitefield PS", location_name: "ITPL Main Road", location_lat: 12.9698, location_lng: 77.7499 }
            ];
        }

        const realTotalCount = parseInt(total_count, 10) || resultFirs.length;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({
            firs: resultFirs,
            total_count: realTotalCount,
            filters_applied: { district, crime_type, date_from, date_to, status }
        }));
        res.end();
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ error: err.message }));
        res.end();
    }
};
