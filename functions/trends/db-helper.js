const catalyst = require('zcatalyst-sdk-node');

async function executeQuery(req, sqlQuery) {
    try {
        const adminApp = catalyst.initialize(req, { scope: 'admin' });
        const zcql = adminApp.zcql();
        const result = await zcql.executeZCQLQuery(sqlQuery);
        return result || [];
    } catch (error) {
        console.error("ZCQL Query failed:", sqlQuery, error);
        return [];
    }
}

async function getFIRsFiltered(req, filters) {
    const sanitize = (val) => val ? val.replace(/'/g, "''") : "";

    const district = sanitize(filters.district);
    const crime_type = sanitize(filters.crime_type);
    const status = sanitize(filters.status);
    
    let whereClauses = [];
    if (district) {
        whereClauses.push(`district_name = '${district}'`);
    }
    if (crime_type) {
        whereClauses.push(`crime_type_code = '${crime_type}'`);
    }
    if (status) {
        whereClauses.push(`status = '${status}'`);
    }

    let sql = "SELECT case_number, date_filed, time_filed, crime_type_code, description, status, district_name, police_station, location_name, location_lat, location_lng, investigation_office, year_filed, month_filed, hour_of_crime FROM FIRs";
    if (whereClauses.length > 0) {
        sql += " WHERE " + whereClauses.join(" AND ");
    }
    
    const limitVal = parseInt(filters.limit) || 50;
    sql += ` ORDER BY date_filed DESC LIMIT ${limitVal}`;

    let rows = await executeQuery(req, sql);

    if (filters.date_from || filters.date_to) {
        const fromDate = filters.date_from ? new Date(filters.date_from) : null;
        const toDate = filters.date_to ? new Date(filters.date_to) : null;
        
        rows = rows.filter(row => {
            const rowData = row.FIRs;
            if (!rowData || !rowData.date_filed) return false;
            const rowDate = new Date(rowData.date_filed);
            
            if (fromDate && rowDate < fromDate) return false;
            if (toDate && rowDate > toDate) return false;
            return true;
        });
    }

    return rows;
}

module.exports = {
    executeQuery,
    getFIRsFiltered
};
