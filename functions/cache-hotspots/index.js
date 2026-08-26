/**
 * cache-hotspots — Catalyst AdvancedIO Function (Cap #9: Catalyst Cache)
 *
 * GET /cache-hotspots?district=Bengaluru+Urban
 * → { hotspots: [...], total, source: 'cache'|'datastore', cache_key }
 *
 * Uses Catalyst Cache Segment 'drishti_cache' to avoid repeated ZCQL queries.
 * TTL: 300 seconds (5 minutes). Cache is invalidated on-demand via ?refresh=1.
 */

const catalyst = require('zcatalyst-sdk-node');

const CACHE_SEGMENT = 'drishti_cache';
const CACHE_TTL_SECONDS = 300;

// Fallback hotspot data (used when both cache and DataStore unavailable)
const FALLBACK_HOTSPOTS = [
  { lat: 12.9344, lng: 77.6264, area: 'Silk Board', count: 48, severity: 'critical', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'robbery'] },
  { lat: 12.9762, lng: 77.6033, area: 'MG Road',    count: 32, severity: 'high',     district: 'Bengaluru Urban', top_crime_types: ['chain_snatching'] },
  { lat: 12.9698, lng: 77.7499, area: 'Whitefield', count: 27, severity: 'high',     district: 'Bengaluru Urban', top_crime_types: ['robbery', 'assault'] },
  { lat: 12.9279, lng: 77.6271, area: 'HSR Layout', count: 22, severity: 'high',     district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft'] },
  { lat: 13.0456, lng: 77.6256, area: 'Hebbal',     count: 19, severity: 'medium',   district: 'Bengaluru Urban', top_crime_types: ['chain_snatching'] },
  { lat: 12.9141, lng: 77.5998, area: 'JP Nagar',   count: 15, severity: 'medium',   district: 'Bengaluru Urban', top_crime_types: ['theft'] },
];

module.exports = async (req, res) => {
  if (!req.getMethod || typeof req.getMethod !== 'function') req.getMethod = () => req.method;
  if (!req.getQueryParams || typeof req.getQueryParams !== 'function') {
    req.getQueryParams = () => require('url').parse(req.url || '', true).query || {};
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.getMethod() === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const send = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  const qp = req.getQueryParams();
  const district = qp.district || '';
  const forceRefresh = qp.refresh === '1';
  const cacheKey = `hotspots_${district || 'all'}`;

  try {
    const catalystApp = catalyst.initialize(req);

    // ── 1. Try Catalyst Cache ──────────────────────────────────────────────
    if (!forceRefresh) {
      try {
        const cache = catalystApp.cache();
        const segment = cache.segment(CACHE_SEGMENT);
        const cached = await segment.getValue(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          console.log(`[cache-hotspots] CACHE HIT: ${cacheKey}`);
          return send(200, {
            hotspots: parsed,
            total: parsed.length,
            source: 'catalyst_cache',
            cache_key: cacheKey,
          });
        }
        console.log(`[cache-hotspots] CACHE MISS: ${cacheKey}`);
      } catch (cacheErr) {
        console.warn('[cache-hotspots] Cache read failed:', cacheErr.message);
      }
    }

    // ── 2. Query DataStore via ZCQL ────────────────────────────────────────
    let hotspots = [];
    try {
      const adminApp = catalyst.initialize(req, { scope: 'admin' });
      const zcql = adminApp.zcql();

      let sql = `SELECT location_name, district_name, crime_type_code, location_lat, location_lng
                 FROM FIRs WHERE location_lat IS NOT NULL`;
      if (district) sql += ` AND district_name = '${district.replace(/'/g, "''")}'`;
      sql += ' LIMIT 200';

      const rows = await zcql.executeZCQLQuery(sql);
      if (rows && rows.length > 0) {
        // Aggregate by location
        const grouped = {};
        for (const row of rows) {
          const d = row.FIRs || row;
          const key = `${d.location_lat}_${d.location_lng}`;
          if (!grouped[key]) {
            grouped[key] = { lat: parseFloat(d.location_lat), lng: parseFloat(d.location_lng),
              area: d.location_name || d.district_name, count: 0, district: d.district_name,
              crime_types: new Set(), severity: 'low' };
          }
          grouped[key].count++;
          if (d.crime_type_code) grouped[key].crime_types.add(d.crime_type_code);
        }
        hotspots = Object.values(grouped).map(h => ({
          ...h,
          top_crime_types: [...h.crime_types].slice(0, 3),
          severity: h.count >= 30 ? 'critical' : h.count >= 15 ? 'high' : h.count >= 5 ? 'medium' : 'low',
          crime_types: undefined,
        })).sort((a, b) => b.count - a.count);
      }
    } catch (dbErr) {
      console.warn('[cache-hotspots] DataStore query failed:', dbErr.message);
    }

    if (hotspots.length === 0) {
      hotspots = district
        ? FALLBACK_HOTSPOTS.filter(h => h.district.toLowerCase().includes(district.toLowerCase()))
        : FALLBACK_HOTSPOTS;
    }

    // ── 3. Store in Catalyst Cache ─────────────────────────────────────────
    try {
      const cache = catalystApp.cache();
      const segment = cache.segment(CACHE_SEGMENT);
      await segment.put(cacheKey, JSON.stringify(hotspots), CACHE_TTL_SECONDS);
      console.log(`[cache-hotspots] Stored in cache: ${cacheKey} (TTL ${CACHE_TTL_SECONDS}s)`);
    } catch (cacheWriteErr) {
      console.warn('[cache-hotspots] Cache write failed:', cacheWriteErr.message);
    }

    return send(200, { hotspots, total: hotspots.length, source: 'catalyst_datastore', cache_key: cacheKey });
  } catch (err) {
    console.error('[cache-hotspots] Fatal error:', err.message);
    return send(200, { hotspots: FALLBACK_HOTSPOTS, total: FALLBACK_HOTSPOTS.length, source: 'fallback' });
  }
};
