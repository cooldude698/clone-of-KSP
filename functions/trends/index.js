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
        const crime_type = queryParams.crime_type || '';
        const district = queryParams.district || '';
        const groupby = queryParams.groupby || 'monthly';
        const year = queryParams.year || '';

        let sql = "SELECT date_filed, crime_type_code, district_name FROM FIRs";
        let whereClauses = [];
        if (crime_type) whereClauses.push(`crime_type_code = '${crime_type.replace(/'/g, "''")}'`);
        if (district) whereClauses.push(`district_name = '${district.replace(/'/g, "''")}'`);
        if (whereClauses.length > 0) {
            sql += " WHERE " + whereClauses.join(" AND ");
        }
        sql += " LIMIT 50000";

        let firs = await dbHelper.executeQuery(req, sql);

        // Filter by year in JS if provided
        if (year) {
            firs = firs.filter(f => f.FIRs.date_filed && f.FIRs.date_filed.startsWith(year));
        }

        // Group by period
        const periodCounts = {};
        const monthlyCounts = {}; // For seasonal insights (regardless of groupby)

        firs.forEach(f => {
            const row = f.FIRs;
            if (!row.date_filed) return;

            const date = new Date(row.date_filed);
            const y = date.getFullYear();
            const m = date.getMonth() + 1; // 1-12
            
            // For seasonal insights
            monthlyCounts[m] = (monthlyCounts[m] || 0) + 1;

            let period = "";
            if (groupby === 'yearly') {
                period = `${y}`;
            } else if (groupby === 'quarterly') {
                const q = Math.ceil(m / 3);
                period = `${y}-Q${q}`;
            } else { // default monthly
                period = `${y}-${String(m).padStart(2, '0')}`;
            }

            periodCounts[period] = (periodCounts[period] || 0) + 1;
        });

        // Sort periods
        const sortedPeriods = Object.keys(periodCounts).sort();
        const trend_data = [];
        let totalCount = 0;

        sortedPeriods.forEach((period, idx) => {
            const count = periodCounts[period];
            totalCount += count;
            let change_pct = 0;

            if (idx > 0) {
                const prevCount = periodCounts[sortedPeriods[idx - 1]];
                change_pct = prevCount > 0 ? ((count - prevCount) / prevCount) * 100 : 0;
            }

            trend_data.push({
                period,
                period_start: period,
                count,
                change_pct: parseFloat(change_pct.toFixed(2)),
                is_spike: change_pct > 25
            });
        });

        // Determine seasonal insight
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const peakMonth = Object.keys(monthlyCounts).sort((a, b) => monthlyCounts[b] - monthlyCounts[a])[0];
        const seasonal_insight = peakMonth 
            ? `Crime analysis indicates a peak frequency in the month of ${months[peakMonth - 1]}.`
            : "No distinct seasonal variation detected.";

        // Determine overall trend (first half vs second half)
        let overall_trend = "stable";
        if (trend_data.length >= 2) {
            const mid = Math.floor(trend_data.length / 2);
            const firstHalf = trend_data.slice(0, mid).reduce((sum, item) => sum + item.count, 0) / mid;
            const secondHalf = trend_data.slice(mid).reduce((sum, item) => sum + item.count, 0) / (trend_data.length - mid);
            const pct = ((secondHalf - firstHalf) / firstHalf) * 100;
            
            if (pct > 10) overall_trend = "increasing";
            else if (pct < -10) overall_trend = "decreasing";
        }

        const average_per_period = trend_data.length > 0 ? parseFloat((totalCount / trend_data.length).toFixed(2)) : 0;
        const spike_periods = trend_data.filter(item => item.is_spike).map(item => item.period);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({
            trend_data,
            seasonal_insight,
            overall_trend,
            average_per_period,
            spike_periods
        }));
        res.end();
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.write(JSON.stringify({ error: err.message }));
        res.end();
    }
};
