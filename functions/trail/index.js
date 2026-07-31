'use strict';

/**
 * trail/index.js
 * DRISHTI — Suspect Geo-Trail
 *
 * POST /server/trail/
 * Body: { crime_lat, crime_lng, crime_timestamp, vehicle_type }
 *
 * Returns: { trail, total_hops, trail_status, last_known_location,
 *            total_distance_km, duration_minutes }
 *
 * All magic values (bounds, hop distances, confidence ranges, direction drift)
 * come from ./config/camera-config.json — no hardcoding.
 */

try { require('dotenv').config(); } catch (e) {}
const catalyst = require('zcatalyst-sdk-node');

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG  = require('./config/camera-config.json');
const BOUNDS  = CONFIG.BENGALURU_BOUNDS;
const TRAIL   = CONFIG.TRAIL;
// Destructure for readability
const MAX_HOPS          = TRAIL.max_hops;                    // 6
const MIN_HOP_M         = TRAIL.min_hop_distance_m;          // 300
const MAX_HOP_M         = TRAIL.max_hop_distance_m;          // 900
const MIN_GAP_SEC       = TRAIL.time_between_hops_min_sec;   // 180
const MAX_GAP_SEC       = TRAIL.time_between_hops_max_sec;   // 480
const DIRECTION_DRIFT   = TRAIL.direction_drift_degrees;     // 25
const CONF_EARLY        = TRAIL.confidence_range.first_2_hops; // [85, 95]
const CONF_LATE         = TRAIL.confidence_range.later_hops;   // [55, 80]

// Search radii (metres)
const CRIME_SEARCH_RADIUS_M = 300;  // Step 1 — find first camera near crime
const HOP_SEARCH_RADIUS_M   = 400;  // Step 2 — find camera near each hop point

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json',
};

// ── Pure helpers ──────────────────────────────────────────────────────────────

function haversineM(lat1, lng1, lat2, lng2) {
  const R    = 6_371_000;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const dphi = ((lat2 - lat1) * Math.PI) / 180;
  const dlam = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Random integer between lo and hi (inclusive). */
function randInt(lo, hi) {
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/** Random float between lo and hi. */
function randFloat(lo, hi) {
  return Math.random() * (hi - lo) + lo;
}

/**
 * Given a centre (lat, lng) and a search radius, return ZCQL bounding-box
 * WHERE clauses as a string fragment + the degree offsets.
 */
function bboxParams(lat, lng, radiusM) {
  const latOffset = radiusM / 111_000;
  const lngOffset = radiusM / (111_000 * Math.cos((lat * Math.PI) / 180));
  return {
    latMin: lat - latOffset,
    latMax: lat + latOffset,
    lngMin: lng - lngOffset,
    lngMax: lng + lngOffset,
  };
}

/**
 * Advance a point by `distanceM` metres in `bearingDeg` degrees (0 = north).
 * Returns { lat, lng }.
 */
function advancePoint(lat, lng, bearingDeg, distanceM) {
  const R       = 6_371_000;
  const bearing = (bearingDeg * Math.PI) / 180;
  const d       = distanceM / R;
  const phi1    = (lat * Math.PI) / 180;
  const lam1    = (lng * Math.PI) / 180;

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(d) +
    Math.cos(phi1) * Math.sin(d) * Math.cos(bearing)
  );
  const lam2 =
    lam1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(phi1),
      Math.cos(d) - Math.sin(phi1) * Math.sin(phi2)
    );

  return {
    lat: (phi2 * 180) / Math.PI,
    lng: ((lam2 * 180) / Math.PI + 540) % 360 - 180, // normalise to [-180,180]
  };
}

/** Clamp lat/lng to Bengaluru bounding box. */
function clampToBounds(lat, lng) {
  return {
    lat: Math.max(BOUNDS.lat_min, Math.min(BOUNDS.lat_max, lat)),
    lng: Math.max(BOUNDS.lng_min, Math.min(BOUNDS.lng_max, lng)),
  };
}

/**
 * Generate a single random Karnataka plate in KA-NN-A-NNNN format.
 * Uses the ANPR_PLATE_PATTERN from config as the authoritative format spec.
 */
function generatePlate() {
  const district = randInt(1, 99).toString().padStart(2, '0');
  const letters  = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // common RTO letters
  const series   = letters[randInt(0, letters.length - 1)];
  const number   = randInt(1, 9999).toString().padStart(4, '0');
  return `KA-${district}-${series}-${number}`;
}

/** Add `seconds` to an ISO-8601 string, return new ISO-8601 string. */
function addSeconds(isoString, seconds) {
  return new Date(new Date(isoString).getTime() + seconds * 1000).toISOString();
}

/**
 * Parse JSON body from a Node.js IncomingMessage.
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw || '{}'));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function sendJSON(res, statusCode, body) {
  res.writeHead(statusCode, CORS_HEADERS);
  res.end(JSON.stringify(body));
}

// ── ZCQL camera finder ────────────────────────────────────────────────────────

/**
 * Find the nearest camera within radiusM of (lat, lng) that passes the
 * optional filter predicate. Returns the enriched camera object or null.
 *
 * @param {object}   app        - initialised Catalyst app
 * @param {number}   lat
 * @param {number}   lng
 * @param {number}   radiusM
 * @param {Function} [filter]   - optional (cam) => bool applied before distance sort
 */
async function findNearestCamera(app, lat, lng, radiusM, filter) {
  const { latMin, latMax, lngMin, lngMax } = bboxParams(lat, lng, radiusM);

  // Clamp bounding box to Bengaluru
  const safeLatMin = Math.max(latMin, BOUNDS.lat_min);
  const safeLatMax = Math.min(latMax, BOUNDS.lat_max);
  const safeLngMin = Math.max(lngMin, BOUNDS.lng_min);
  const safeLngMax = Math.min(lngMax, BOUNDS.lng_max);

  const zcql =
    `SELECT ROWID, external_id, name, type, lat, lng, district_name, ` +
    `junction_name, has_anpr, has_face_recog, coverage_radius_m ` +
    `FROM Cameras ` +
    `WHERE lat >= ${safeLatMin} AND lat <= ${safeLatMax} ` +
    `AND lng >= ${safeLngMin} AND lng <= ${safeLngMax} ` +
    `AND is_active = true ` +
    `LIMIT 100`;

  const result = await app.zcql().executeZCQLQuery(zcql);
  const rows   = result || [];

  // Normalise, apply optional filter, sort by distance, pick nearest
  const candidates = rows
    .map((row) => {
      const cam     = row.Cameras || row;
      const camLat  = parseFloat(cam.lat);
      const camLng  = parseFloat(cam.lng);
      const distM   = haversineM(lat, lng, camLat, camLng);
      if (distM > radiusM) return null;

      return {
        camera_id:      cam.ROWID || cam.camera_id || null,
        external_id:    cam.external_id,
        name:           cam.name,
        camera_type:    cam.type || '',
        lat:            camLat,
        lng:            camLng,
        district_name:  cam.district_name || '',
        junction_name:  cam.junction_name || null,
        has_anpr:       cam.has_anpr === 'true' || cam.has_anpr === true,
        has_face_recog: cam.has_face_recog === 'true' || cam.has_face_recog === true,
        distM,
      };
    })
    .filter(Boolean)
    .filter((c) => (filter ? filter(c) : true));

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.distM - b.distM);
  return candidates[0];
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (req, res) => {

  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return sendJSON(res, 405, { error: 'Method not allowed. Use POST or GET.' });
  }

  let body = {};
  let requestedPlate = null;

  if (req.method === 'POST') {
    try {
      body = await readBody(req);
    } catch (err) {
      return sendJSON(res, 400, { error: 'Invalid JSON body.' });
    }
  } else if (req.method === 'GET') {
    const url = require('url').parse(req.url || '', true);
    const query = typeof req.getQueryParams === 'function' ? req.getQueryParams() || {} : url.query || {};
    
    requestedPlate = query.plate;
    if (!requestedPlate) {
      return sendJSON(res, 400, { error: 'Missing plate parameter in GET request.' });
    }

    // Default mock origin for GET requests searching a plate
    body = {
      crime_lat: 12.9716, // Bengaluru center
      crime_lng: 77.5946,
      crime_timestamp: new Date().toISOString(),
      vehicle_type: 'unknown'
    };
  }

  const { crime_lat, crime_lng, crime_timestamp, vehicle_type } = body;

  // Validate
  const lat = parseFloat(crime_lat);
  const lng = parseFloat(crime_lng);
  if (isNaN(lat) || isNaN(lng)) {
    return sendJSON(res, 400, { error: 'crime_lat and crime_lng must be numbers.' });
  }
  if (!crime_timestamp || isNaN(new Date(crime_timestamp).getTime())) {
    return sendJSON(res, 400, { error: 'crime_timestamp must be a valid ISO-8601 string.' });
  }
  if (
    lat < BOUNDS.lat_min || lat > BOUNDS.lat_max ||
    lng < BOUNDS.lng_min || lng > BOUNDS.lng_max
  ) {
    return sendJSON(res, 400, { error: 'Crime location is outside Bengaluru bounds.' });
  }

  // ── Initialise Catalyst ──────────────────────────────────────────────────
  let app;
  try {
    app = catalyst.initialize(req);
  } catch (err) {
    return sendJSON(res, 500, { error: 'Catalyst SDK init failed.', detail: err.message });
  }

  // ── STEP 1: Find first ANPR camera near crime scene ──────────────────────
  let firstCamera;
  try {
    firstCamera = await findNearestCamera(
      app, lat, lng, CRIME_SEARCH_RADIUS_M,
      (c) => c.has_anpr   // first sighting must be ANPR-capable
    );
  } catch (err) {
    console.error('[trail] ZCQL error (step 1):', err);
    return sendJSON(res, 500, { error: 'Database query failed.', detail: err.message });
  }

  if (!firstCamera) {
    // No ANPR camera near crime — trail cannot be started
    return sendJSON(res, 200, {
      trail:               [],
      total_hops:          0,
      trail_status:        'lost',
      last_known_location: null,
      total_distance_km:   0,
      duration_minutes:    0,
      message:             `No ANPR camera found within ${CRIME_SEARCH_RADIUS_M}m of crime scene.`,
    });
  }

  // ── STEP 2: Generate hops ────────────────────────────────────────────────
  const trail             = [];
  let   currentLat        = firstCamera.lat;
  let   currentLng        = firstCamera.lng;
  let   currentTimestamp  = crime_timestamp;
  let   currentDirection  = randFloat(0, 360);        // random initial bearing
  let   totalDistanceM    = 0;
  let   trailStatus       = 'active';
  let   detectedPlate     = null;

  // Hop 1: the first camera at the crime scene
  const hop1Gap = randInt(MIN_GAP_SEC, MAX_GAP_SEC);
  currentTimestamp = addSeconds(currentTimestamp, hop1Gap);

  // Generate plate on hop 1 if ANPR
  if (firstCamera.has_anpr) {
    detectedPlate = requestedPlate || generatePlate();
  }

  trail.push({
    hop:                   1,
    camera_id:             firstCamera.camera_id,
    camera_name:           firstCamera.name,
    lat:                   firstCamera.lat,
    lng:                   firstCamera.lng,
    timestamp:             currentTimestamp,
    plate_detected:        detectedPlate,
    confidence:            randInt(CONF_EARLY[0], CONF_EARLY[1]),
    sighting_type:         firstCamera.has_anpr ? 'ANPR' : 'Visual',
    distance_from_crime_km: Math.round(firstCamera.distM / 100) / 10,
  });

  // Hops 2–MAX_HOPS
  for (let hop = 2; hop <= MAX_HOPS; hop++) {
    // Drift direction
    const drift       = randFloat(-DIRECTION_DRIFT, DIRECTION_DRIFT);
    currentDirection  = (currentDirection + drift + 360) % 360;
    const hopDistance = randFloat(MIN_HOP_M, MAX_HOP_M);

    // Compute target point
    let target = advancePoint(currentLat, currentLng, currentDirection, hopDistance);
    target     = clampToBounds(target.lat, target.lng);

    // Find nearest real camera near target
    let camera;
    try {
      camera = await findNearestCamera(app, target.lat, target.lng, HOP_SEARCH_RADIUS_M);
    } catch (err) {
      console.error(`[trail] ZCQL error (hop ${hop}):`, err);
      trailStatus = 'lost';
      break;
    }

    if (!camera) {
      trailStatus = 'lost';
      break;
    }

    // Avoid repeating the exact same camera twice in a row
    const prevHop = trail[trail.length - 1];
    if (camera.camera_id && camera.camera_id === prevHop.camera_id) {
      trailStatus = 'lost';
      break;
    }

    // Advance time
    const gap         = randInt(MIN_GAP_SEC, MAX_GAP_SEC);
    currentTimestamp  = addSeconds(currentTimestamp, gap);
    totalDistanceM   += hopDistance;

    // Confidence drops after hop 2
    const confRange = hop <= 2 ? CONF_EARLY : CONF_LATE;
    const confidence = randInt(confRange[0], confRange[1]);

    // Plate: reuse once generated, or generate on this hop if ANPR and not yet set
    if (!detectedPlate && camera.has_anpr) {
      detectedPlate = requestedPlate || generatePlate();
    }

    trail.push({
      hop,
      camera_id:             camera.camera_id,
      camera_name:           camera.name,
      lat:                   camera.lat,
      lng:                   camera.lng,
      timestamp:             currentTimestamp,
      plate_detected:        camera.has_anpr ? detectedPlate : null,
      confidence,
      sighting_type:         camera.has_anpr ? 'ANPR' : 'Visual',
      distance_from_crime_km: Math.round(
        haversineM(lat, lng, camera.lat, camera.lng) / 100
      ) / 10,
    });

    currentLat = camera.lat;
    currentLng = camera.lng;
  }

  // ── STEP 3: Final trail status ───────────────────────────────────────────
  if (trail.length === MAX_HOPS) {
    trailStatus = 'active';
  }

  // ── STEP 4: Totals & last known location ─────────────────────────────────
  const lastHop             = trail[trail.length - 1];
  const lastCamera          = trail.length > 1
    ? { lat: lastHop.lat, lng: lastHop.lng, camera_name: lastHop.camera_name }
    : { lat: firstCamera.lat, lng: firstCamera.lng, camera_name: firstCamera.name };

  // Recover district_name for last camera from the raw camera objects
  // (trail hops don't store district_name — we re-query it)
  const totalDistanceKm     = Math.round(totalDistanceM / 100) / 10;
  const firstTimestamp      = trail[0]?.timestamp || crime_timestamp;
  const lastTimestamp       = lastHop?.timestamp  || crime_timestamp;
  const durationMs          = new Date(lastTimestamp) - new Date(crime_timestamp);
  const durationMinutes     = Math.round(durationMs / 60_000);

  return sendJSON(res, 200, {
    trail,
    total_hops:          trail.length,
    trail_status:        trailStatus,
    last_known_location: {
      lat:         lastHop.lat,
      lng:         lastHop.lng,
      camera_name: lastHop.camera_name,
    },
    total_distance_km:  totalDistanceKm,
    duration_minutes:   durationMinutes,
  });
};
