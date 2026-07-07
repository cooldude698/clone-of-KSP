const dbHelper = require('./db-helper');

module.exports = async (req, res) => {
    // Handle CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
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
        let countSql = "SELECT COUNT(case_number) FROM FIRs";
        let whereClauses = [];
        if (district) whereClauses.push(`district_name = '${district.replace(/'/g, "''")}'`);
        if (crime_type) whereClauses.push(`crime_type_code = '${crime_type.replace(/'/g, "''")}'`);
        if (status) whereClauses.push(`status = '${status.replace(/'/g, "''")}'`);
        if (whereClauses.length > 0) {
            countSql += " WHERE " + whereClauses.join(" AND ");
        }

        const countResult = await dbHelper.executeQuery(req, countSql);
        const total_count = countResult.length > 0 ? (countResult[0].FIRs.case_number || 0) : 0;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({
            firs: firs.map(f => f.FIRs),
            total_count: parseInt(total_count),
            filters_applied: { district, crime_type, date_from, date_to, status }
        }));
        res.end();
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ error: err.message }));
        res.end();
    }
};
