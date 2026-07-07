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
        const min_firs = parseInt(queryParams.min_firs) || 2;
        const limit = parseInt(queryParams.limit) || 20;

        // Step 1: Query grouped links
        const groupSql = "SELECT accused_full_name, COUNT(ROWID) FROM FIR_Accused GROUP BY accused_full_name";
        const counts = await dbHelper.executeQuery(req, groupSql);

        // Filter and map offenders
        const filteredOffenders = counts
            .map(row => ({
                name: row.FIR_Accused.accused_full_name,
                firCount: parseInt(row.FIR_Accused.ROWID || 0)
            }))
            .filter(item => item.firCount >= min_firs);

        // Fetch detail records for each offender
        const highRiskOffenders = [];
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const violentCrimes = new Set([
            "chain_snatching", "robbery", "assault", "murder", 
            "eve_teasing", "kidnapping", "domestic_violence", "senior_citizen_crime"
        ]);

        for (const offender of filteredOffenders) {
            // Accused profile details
            const accSql = `SELECT * FROM Accused WHERE full_name = '${offender.name.replace(/'/g, "''")}' LIMIT 1`;
            const profileRes = await dbHelper.executeQuery(req, accSql);
            if (profileRes.length === 0) continue;

            const profile = profileRes[0].Accused;

            // Link offender to their FIR details via natural join
            const firSql = `SELECT f.crime_type_code, f.district_name, f.date_filed, f.status ` +
                           `FROM FIRs f, FIR_Accused fa ` +
                           `WHERE fa.fir_case_number = f.case_number AND fa.accused_full_name = '${offender.name.replace(/'/g, "''")}' ` +
                           `LIMIT 20`;
            const linkedFirs = await dbHelper.executeQuery(req, firSql);

            // Extract crime metadata
            const crimeTypes = new Set();
            const activeDistricts = new Set();
            let lastCrimeDate = null;
            let hasViolentCrime = false;

            linkedFirs.forEach(f => {
                const row = f.FIRs;
                crimeTypes.add(row.crime_type_code);
                activeDistricts.add(row.district_name);
                
                if (violentCrimes.has(row.crime_type_code)) {
                    hasViolentCrime = true;
                }

                if (row.date_filed) {
                    const d = new Date(row.date_filed);
                    if (!lastCrimeDate || d > lastCrimeDate) {
                        lastCrimeDate = d;
                    }
                }
            });

            // Calculate risk score (0-100)
            let risk_score = 0;
            // 1. FIR count weight
            if (offender.firCount === 1) risk_score += 10;
            else if (offender.firCount <= 3) risk_score += 25;
            else if (offender.firCount <= 5) risk_score += 45;
            else risk_score += 60;

            // 2. Recency
            if (lastCrimeDate && lastCrimeDate >= sixMonthsAgo) {
                risk_score += 20;
            }

            // 3. Violent crimes
            if (hasViolentCrime) {
                risk_score += 15;
            }

            // 4. District span
            if (activeDistricts.size >= 3) {
                risk_score += 10;
            }

            // 5. Prior convictions
            const priors = parseInt(profile.prior_convictions) || 0;
            if (priors > 0) {
                risk_score += 15;
            }

            risk_score = Math.min(100, risk_score);

            highRiskOffenders.push({
                accused_id: offender.name,
                name: offender.name,
                risk_score,
                total_firs: offender.firCount,
                crime_types: Array.from(crimeTypes),
                districts_active: Array.from(activeDistricts),
                modus_operandi: profile.modus_operandi || 'Unknown',
                last_crime_date: lastCrimeDate ? lastCrimeDate.toISOString().slice(0, 10) : null
            });
        }

        // Sort by risk score desc
        highRiskOffenders.sort((a, b) => b.risk_score - a.risk_score);

        const result = highRiskOffenders.slice(0, limit);
        const highRiskCount = highRiskOffenders.filter(o => o.risk_score > 70).length;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({
            high_risk_offenders: result,
            total_repeat_offenders: highRiskOffenders.length,
            high_risk_count: highRiskCount
        }));
        res.end();
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ error: err.message }));
        res.end();
    }
};
