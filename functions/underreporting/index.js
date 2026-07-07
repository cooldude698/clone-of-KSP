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
        // Step 1: Query FIRs counts per district
        const sqlCount = "SELECT district_name, COUNT(case_number) FROM FIRs GROUP BY district_name";
        const firCounts = await dbHelper.executeQuery(req, sqlCount);

        // Step 2: Query Districts population data
        const sqlDist = "SELECT name, population FROM Districts";
        const districtsData = await dbHelper.executeQuery(req, sqlDist);

        const populationMap = {};
        districtsData.forEach(d => {
            populationMap[d.Districts.name] = parseInt(d.Districts.population || 0);
        });

        // Step 3: Calculate rate per lakh
        const districtRates = [];
        let totalRatesSum = 0;
        let validDistrictsCount = 0;

        firCounts.forEach(f => {
            const dName = f.FIRs.district_name;
            const firCount = parseInt(f.FIRs.case_number || 0);
            const pop = populationMap[dName];

            if (pop && pop > 0) {
                const rate_per_lakh = (firCount / pop) * 100000;
                districtRates.push({
                    district: dName,
                    firCount,
                    population: pop,
                    rate_per_lakh
                });
            }
        });

        // Step 4: Calculate state average rate (excluding outliers beyond 3 SD)
        let state_average_rate_per_lakh = 0;
        if (districtRates.length > 0) {
            const rates = districtRates.map(r => r.rate_per_lakh);
            const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
            const variance = rates.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / rates.length;
            const sd = Math.sqrt(variance);

            const filteredRates = rates.filter(r => Math.abs(r - mean) <= 3 * sd);
            state_average_rate_per_lakh = filteredRates.reduce((a, b) => a + b, 0) / filteredRates.length;
        }

        // Step 5: Flag dark zones (rates < state_average * 0.6)
        const dark_zones = [];
        const threshold = state_average_rate_per_lakh * 0.6;

        districtRates.forEach(r => {
            if (r.rate_per_lakh < threshold) {
                const gap_percentage = ((state_average_rate_per_lakh - r.rate_per_lakh) / state_average_rate_per_lakh) * 100;
                const score = Math.min(100, Math.round(gap_percentage * 1.5));
                
                let reason = "Minor reporting gap";
                let recommended_action = "Monitor closely and conduct awareness programs";

                if (score > 85) {
                    reason = "Critical dark zone: Severe underreporting threshold crossed";
                    recommended_action = "Immediate investigation into reporting barriers required";
                } else if (score > 65) {
                    reason = "Significant underreporting: Beat policing gaps suspected";
                    recommended_action = "Deploy community outreach and increase beat officer visits";
                } else if (score > 40) {
                    reason = "Moderate underreporting: Low awareness of digital filing";
                }

                dark_zones.push({
                    district: r.district,
                    score,
                    actual_rate_per_lakh: parseFloat(r.rate_per_lakh.toFixed(2)),
                    expected_rate_per_lakh: parseFloat(state_average_rate_per_lakh.toFixed(2)),
                    gap_percentage: parseFloat(gap_percentage.toFixed(2)),
                    reason,
                    recommended_action
                });
            }
        });

        // Sort by score desc
        dark_zones.sort((a, b) => b.score - a.score);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({
            dark_zones,
            state_average_rate_per_lakh: parseFloat(state_average_rate_per_lakh.toFixed(2)),
            total_districts_analyzed: districtRates.length
        }));
        res.end();
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ error: err.message }));
        res.end();
    }
};
