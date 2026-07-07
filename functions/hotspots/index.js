const dbHelper = require('./db-helper');

module.exports = async (req, res) => {
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
        const months_back = parseInt(queryParams.months_back) || 6;

        // Calculate date cutoff
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - (months_back * 30));
        const cutoffStr = cutoffDate.toISOString().slice(0, 10);

        let sql = `SELECT location_lat, location_lng, crime_type_code, district_name, date_filed FROM FIRs WHERE date_filed >= '${cutoffStr}'`;
        if (district) {
            sql += ` AND district_name = '${district.replace(/'/g, "''")}'`;
        }
        if (crime_type) {
            sql += ` AND crime_type_code = '${crime_type.replace(/'/g, "''")}'`;
        }
        sql += " LIMIT 10000";

        const firs = await dbHelper.executeQuery(req, sql);
        
        // Define violent crimes
        const violentCrimes = new Set([
            "chain_snatching", "robbery", "assault", "murder", 
            "eve_teasing", "kidnapping", "domestic_violence", "senior_citizen_crime"
        ]);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Grid bucketing
        const cells = {};
        let totalCrimes = 0;

        firs.forEach(f => {
            const row = f.FIRs;
            const lat = parseFloat(row.location_lat);
            const lng = parseFloat(row.location_lng);
            if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

            totalCrimes++;
            const gridLat = Math.floor(lat / 0.005);
            const gridLng = Math.floor(lng / 0.005);
            const cellKey = `${gridLat},${gridLng}`;

            if (!cells[cellKey]) {
                cells[cellKey] = {
                    gridLat,
                    gridLng,
                    crimeCount: 0,
                    violentCount: 0,
                    recentCount: 0,
                    crimes: [],
                    districts: {}
                };
            }

            const cell = cells[cellKey];
            cell.crimeCount++;
            cell.crimes.push(row.crime_type_code);
            
            if (violentCrimes.has(row.crime_type_code)) {
                cell.violentCount++;
            }
            
            const fileDate = new Date(row.date_filed);
            if (fileDate >= thirtyDaysAgo) {
                cell.recentCount++;
            }

            const distName = row.district_name || 'Unknown';
            cell.districts[distName] = (cell.districts[distName] || 0) + 1;
        });

        // Calculate severity score & generate hotspots list
        const hotspots = [];
        for (const key in cells) {
            const cell = cells[key];
            if (cell.crimeCount < 3) continue; // Min 3 crimes for hotspot

            const severity_score = cell.crimeCount + (cell.violentCount * 1.0) + (cell.recentCount * 0.5);
            
            // Get top 3 crime types
            const crimeCounts = {};
            cell.crimes.forEach(c => { crimeCounts[c] = (crimeCounts[c] || 0) + 1; });
            const top_crime_types = Object.keys(crimeCounts)
                .sort((a, b) => crimeCounts[b] - crimeCounts[a])
                .slice(0, 3);

            // Get dominant district
            const dominantDistrict = Object.keys(cell.districts)
                .sort((a, b) => cell.districts[b] - cell.districts[a])[0] || 'Unknown';

            // Calculate grid center coordinate
            const cell_lat = roundTo((cell.gridLat + 0.5) * 0.005, 5);
            const cell_lng = roundTo((cell.gridLng + 0.5) * 0.005, 5);

            hotspots.push({
                cell_lat,
                cell_lng,
                crime_count: cell.crimeCount,
                severity_score: roundTo(severity_score, 2),
                top_crime_types,
                district: dominantDistrict,
                area_name: `${dominantDistrict} Grid Cell`
            });
        }

        // Sort by severity score desc, take top 25
        hotspots.sort((a, b) => b.severity_score - a.severity_score);
        const result = hotspots.slice(0, 25);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({
            hotspots: result,
            total_crimes_analyzed: totalCrimes,
            analysis_period_months: months_back,
            grid_cell_size_meters: 500
        }));
        res.end();
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ error: err.message }));
        res.end();
    }
};

function roundTo(num, decimals) {
    return parseFloat(num.toFixed(decimals));
}
