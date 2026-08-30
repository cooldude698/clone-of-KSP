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
  // ── Bengaluru Urban ──────────────────────────────────────────────────────
  { lat: 12.9175, lng: 77.6215, area: 'Silk Board Junction', count: 48, severity: 'critical', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'robbery', 'assault'] },
  { lat: 12.9774, lng: 77.5699, area: 'Majestic KSRTC Terminal', count: 42, severity: 'critical', district: 'Bengaluru Urban', top_crime_types: ['theft', 'drug_offence', 'assault'] },
  { lat: 12.9352, lng: 77.6245, area: 'Koramangala 80ft Road', count: 38, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['chain_snatching', 'burglary', 'drug_offence'] },
  { lat: 12.9784, lng: 77.6408, area: 'Indiranagar CMH Road', count: 34, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'robbery'] },
  { lat: 12.9760, lng: 77.6070, area: 'MG Road Brigade', count: 32, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['chain_snatching', 'assault', 'robbery'] },
  { lat: 12.9698, lng: 77.7500, area: 'Whitefield Hope Farm', count: 29, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['robbery', 'vehicle_theft', 'cybercrime'] },
  { lat: 12.9850, lng: 77.5990, area: 'Shivajinagar Bus Stand', count: 28, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['assault', 'robbery', 'theft'] },
  { lat: 13.0322, lng: 77.5206, area: 'Peenya Industrial Area', count: 27, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['drug_offence', 'burglary', 'vehicle_theft'] },
  { lat: 13.0090, lng: 77.6927, area: 'KR Puram Signal', count: 26, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['drug_offence', 'robbery', 'chain_snatching'] },
  { lat: 12.9116, lng: 77.6474, area: 'HSR Layout Sector 4', count: 26, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'burglary'] },
  { lat: 12.9562, lng: 77.7011, area: 'Marathahalli Bridge', count: 25, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['assault', 'robbery', 'theft'] },
  { lat: 12.9504, lng: 77.5119, area: 'Nayandahalli Junction', count: 24, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'robbery'] },
  { lat: 13.0456, lng: 77.6256, area: 'Hebbal Flyover Corridor', count: 24, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['chain_snatching', 'hit_and_run'] },
  { lat: 13.0255, lng: 77.5499, area: 'Yeshwanthpur Signal', count: 23, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'robbery'] },
  { lat: 13.1007, lng: 77.5963, area: 'Yelahanka New Town', count: 22, severity: 'high', district: 'Bengaluru Urban', top_crime_types: ['vehicle_theft', 'assault'] },
  { lat: 12.8458, lng: 77.6592, area: 'Electronic City Phase 1', count: 21, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['cybercrime', 'vehicle_theft'] },
  { lat: 12.9165, lng: 77.6101, area: 'BTM Layout 2nd Stage', count: 20, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['drug_offence', 'assault'] },
  { lat: 12.9263, lng: 77.6990, area: 'Bellandur Lake Road', count: 19, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['drug_offence', 'robbery'] },
  { lat: 12.9308, lng: 77.5832, area: 'Jayanagar 4th Block', count: 18, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['robbery', 'burglary'] },
  { lat: 12.9081, lng: 77.5840, area: 'JP Nagar Phase 3', count: 17, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['theft', 'hit_and_run'] },
  { lat: 12.9256, lng: 77.5475, area: 'Banashankari Temple Area', count: 16, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['chain_snatching', 'theft'] },
  { lat: 13.0104, lng: 77.5580, area: 'Rajajinagar ISKCON', count: 15, severity: 'medium', district: 'Bengaluru Urban', top_crime_types: ['fraud', 'cybercrime'] },

  // ── Mysuru District ──────────────────────────────────────────────────────
  { lat: 12.3115, lng: 76.6528, area: 'Devaraja Market Hub', count: 25, severity: 'high', district: 'Mysuru', top_crime_types: ['theft', 'robbery'] },
  { lat: 12.3082, lng: 76.6534, area: 'KR Circle Commercial Zone', count: 18, severity: 'medium', district: 'Mysuru', top_crime_types: ['chain_snatching', 'theft'] },
  { lat: 12.3105, lng: 76.6570, area: 'Mysuru Suburban Bus Stand', count: 21, severity: 'high', district: 'Mysuru', top_crime_types: ['robbery', 'extortion'] },
  { lat: 12.3350, lng: 76.6120, area: 'Vijayanagar 2nd Stage', count: 14, severity: 'medium', district: 'Mysuru', top_crime_types: ['burglary', 'theft'] },

  // ── Hubballi-Dharwad ─────────────────────────────────────────────────────
  { lat: 15.3520, lng: 75.1320, area: 'Hubballi CBT Old Bus Stand', count: 28, severity: 'high', district: 'Hubballi-Dharwad', top_crime_types: ['robbery', 'drug_offence'] },
  { lat: 15.4580, lng: 75.0080, area: 'Dharwad Court Circle', count: 16, severity: 'medium', district: 'Hubballi-Dharwad', top_crime_types: ['vehicle_theft', 'assault'] },
  { lat: 15.3620, lng: 75.0920, area: 'Gokul Road Industrial Area', count: 15, severity: 'medium', district: 'Hubballi-Dharwad', top_crime_types: ['burglary', 'theft'] },

  // ── Mangaluru ────────────────────────────────────────────────────────────
  { lat: 12.8703, lng: 74.8427, area: 'Hampankatta Central', count: 27, severity: 'high', district: 'Mangaluru', top_crime_types: ['drug_offence', 'smuggling'] },
  { lat: 12.9460, lng: 74.8120, area: 'Panambur Port Corridor', count: 22, severity: 'high', district: 'Mangaluru', top_crime_types: ['robbery', 'extortion'] },
  { lat: 13.0110, lng: 74.7930, area: 'Surathkal Junction', count: 16, severity: 'medium', district: 'Mangaluru', top_crime_types: ['vehicle_theft', 'assault'] },

  // ── Belagavi ─────────────────────────────────────────────────────────────
  { lat: 15.8560, lng: 74.5120, area: 'Khade Bazar Trade Hub', count: 24, severity: 'high', district: 'Belagavi', top_crime_types: ['robbery', 'extortion'] },
  { lat: 15.8620, lng: 74.5050, area: 'Bogarves Circle', count: 15, severity: 'medium', district: 'Belagavi', top_crime_types: ['assault', 'vehicle_theft'] },

  // ── Kalaburagi ───────────────────────────────────────────────────────────
  { lat: 17.3320, lng: 76.8390, area: 'Super Market Commercial', count: 26, severity: 'high', district: 'Kalaburagi', top_crime_types: ['robbery', 'assault'] },
  { lat: 17.3390, lng: 76.8290, area: 'Station Bazar', count: 21, severity: 'high', district: 'Kalaburagi', top_crime_types: ['drug_offence', 'theft'] },
  { lat: 17.3354, lng: 76.8412, area: 'Murty Circle Sector', count: 18, severity: 'medium', district: 'Kalaburagi', top_crime_types: ['hit_and_run', 'assault'] },

  // ── Shivamogga ───────────────────────────────────────────────────────────
  { lat: 13.9320, lng: 75.5720, area: 'Gandhi Bazar', count: 20, severity: 'high', district: 'Shivamogga', top_crime_types: ['robbery', 'chain_snatching'] },
  { lat: 13.9480, lng: 75.5560, area: 'Vinoba Nagar', count: 13, severity: 'medium', district: 'Shivamogga', top_crime_types: ['burglary', 'theft'] },

  // ── Tumakuru ─────────────────────────────────────────────────────────────
  { lat: 13.3392, lng: 77.1014, area: 'Town Hall Circle NH-48', count: 23, severity: 'high', district: 'Tumakuru', top_crime_types: ['robbery', 'drug_offence'] },
  { lat: 13.3150, lng: 77.1620, area: 'Kyathsandra Highway Hub', count: 17, severity: 'medium', district: 'Tumakuru', top_crime_types: ['vehicle_theft', 'robbery'] },

  // ── Udupi ────────────────────────────────────────────────────────────────
  { lat: 13.3409, lng: 74.7421, area: 'Service Bus Stand Hub', count: 15, severity: 'medium', district: 'Udupi', top_crime_types: ['fraud', 'theft'] },
  { lat: 13.3520, lng: 74.7860, area: 'Manipal Commercial Hub', count: 21, severity: 'high', district: 'Udupi', top_crime_types: ['drug_offence', 'cybercrime'] },

  // ── Bidar & Raichur ──────────────────────────────────────────────────────
  { lat: 17.9180, lng: 77.5140, area: 'Gandhi Gunj Border Market', count: 19, severity: 'high', district: 'Bidar', top_crime_types: ['robbery', 'contraband'] },
  { lat: 16.2076, lng: 77.3463, area: 'Raichur Station Road', count: 20, severity: 'high', district: 'Raichur', top_crime_types: ['robbery', 'vehicle_theft'] },
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
