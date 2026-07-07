'use strict';

/**
 * cameras-nearby/index.js
 * DRISHTI — Camera Intelligence
 *
 * GET /server/cameras-nearby/
 * Query params:
 *   lat            {number}  required  — centre latitude
 *   lng            {number}  required  — centre longitude
 *   radius_meters  {number}  optional  — search radius (default 500)
 *   timestamp      {string}  optional  — ISO-8601; builds footage_window ±30 min
 *
 * Returns: { cameras, total_found, anpr_capable_count, search_radius_meters }
 *
 * No hardcoded magic values — all bounds and scoring weights come from
 * ../../camera-intel/config/camera-config.json (loaded once at cold-start).
 */

require('dotenv').config();
const catalyst = require('zcatalyst-sdk-node');

// ── Config (loaded once at cold-start, not per-request) ──────────────────────
const CONFIG = require('./config/camera-config.json');
const BOUNDS = CONFIG.BENGALURU_BOUNDS;         // lat_min/max, lng_min/max
const SCORING = CONFIG.RELEVANCE_SCORING;       // base_score, penalties, bonuses

// ── Constants ─────────────────────────────────────────────────────────────────
const DEFAULT_RADIUS_M    = 500;
const FOOTAGE_WINDOW_MIN  = 30;   // minutes either side of timestamp
const ZCQL_ROW_LIMIT      = 200;

// ── CORS headers (sent on every response) ─────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Haversine distance in metres between two lat/lng points.
 */
function haversineM(lat1, lng1, lat2, lng2) {
  const R     = 6_371_000;
  const phi1  = (lat1 * Math.PI) / 180;
  const phi2  = (lat2 * Math.PI) / 180;
  const dphi  = ((lat2 - lat1) * Math.PI) / 180;
  const dlam  = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dphi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(dlam / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Parse URL query string into a plain object.
 */
function parseQuery(url) {
  const idx = url.indexOf('?');
  if (idx === -1) return {};
  const qs = url.slice(idx + 1);
  return Object.fromEntries(
    qs.split('&').map((pair) => {
      const [k, v] = pair.split('=');
      return [decodeURIComponent(k), decodeURIComponent(v ?? '')];
    })
  );
}

/**
 * Send a JSON response.
 */
function sendJSON(res, statusCode, body) {
  res.writeHead(statusCode, CORS_HEADERS);
  res.end(JSON.stringify(body));
}

/**
 * Compute footage_window ±30 min around a timestamp string.
 * Returns { start, end } ISO-8601 strings, or null if timestamp is invalid.
 */
function buildFootageWindow(timestamp) {
  const ts = new Date(timestamp);
  if (isNaN(ts.getTime())) return null;
  const windowMs = FOOTAGE_WINDOW_MIN * 60 * 1000;
  return {
    start: new Date(ts.getTime() - windowMs).toISOString(),
    end:   new Date(ts.getTime() + windowMs).toISOString(),
  };
}

/**
 * Compute relevance_score for a camera given its distance from the search centre.
 * Formula (from spec):
 *   base - floor(dist/100)*penalty + anpr_bonus + face_bonus + safe_city_bonus
 * Clamped to [0, 100].
 */
function computeRelevanceScore(distanceM, hasAnpr, hasFaceRecog, cameraType) {
  const base         = SCORING.base_score;                  // 100
  const penalty      = SCORING.distance_penalty_per_100m;   // 10
  const anprBonus    = hasAnpr      ? SCORING.anpr_bonus          : 0;  // 20
  const faceBonus    = hasFaceRecog ? SCORING.face_recog_bonus    : 0;  // 15
  const typeBonus    = cameraType === 'Safe_City' ? SCORING.safe_city_type_bonus : 0; // 10

  const raw = base - Math.floor(distanceM / 100) * penalty + anprBonus + faceBonus + typeBonus;
  return Math.max(0, Math.min(100, raw));
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (req, res) => {

  // Handle pre-flight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  // ── STEP 1: Parse & validate query params ────────────────────────────────
  const query       = parseQuery(req.url || '');

  if (query.test === 'import') {
    return require('./import-handler')(req, res);
  }

  const lat         = parseFloat(query.lat);
  const lng         = parseFloat(query.lng);
  const radiusM     = parseInt(query.radius_meters, 10) || DEFAULT_RADIUS_M;
  const timestamp   = query.timestamp || null;

  if (isNaN(lat) || isNaN(lng)) {
    return sendJSON(res, 400, {
      error: 'Missing required params: lat and lng must be numbers.',
    });
  }

  if (
    lat < BOUNDS.lat_min || lat > BOUNDS.lat_max ||
    lng < BOUNDS.lng_min || lng > BOUNDS.lng_max
  ) {
    return sendJSON(res, 400, {
      error: `Location outside Bengaluru bounds. ` +
             `lat must be ${BOUNDS.lat_min}–${BOUNDS.lat_max}, ` +
             `lng must be ${BOUNDS.lng_min}–${BOUNDS.lng_max}.`,
    });
  }

  if (radiusM <= 0 || radiusM > 10000) {
    return sendJSON(res, 400, {
      error: 'radius_meters must be between 1 and 10000.',
    });
  }

  // ── STEP 2: Convert radius to degree offsets ─────────────────────────────
  const latOffset = radiusM / 111_000;
  const lngOffset = radiusM / (111_000 * Math.cos((lat * Math.PI) / 180));

  const latMin = lat - latOffset;
  const latMax = lat + latOffset;
  const lngMin = lng - lngOffset;
  const lngMax = lng + lngOffset;

  // ── STEP 3: ZCQL bounding-box query (exactly 5 WHERE clauses) ────────────
  // NOTE: The Cameras table has the column named "type" (not camera_type) due
  // to the Catalyst import constraint. We alias it back to camera_type in the
  // response shape for API contract consistency.
  const zcql =
    `SELECT ROWID, external_id, name, type, lat, lng, district_name, ` +
    `junction_name, has_anpr, has_face_recog, coverage_radius_m ` +
    `FROM Cameras ` +
    `WHERE lat >= ${latMin} AND lat <= ${latMax} ` +
    `AND lng >= ${lngMin} AND lng <= ${lngMax} ` +
    `AND is_active = true ` +
    `LIMIT ${ZCQL_ROW_LIMIT}`;

  let rawRows;
  try {
    const app       = catalyst.initialize(req);
    const zcqlService = app.zcql();
    const result    = await zcqlService.executeZCQLQuery(zcql);
    rawRows = result || [];
  } catch (err) {
    console.error('[cameras-nearby] ZCQL error:', err);
    return sendJSON(res, 500, {
      error: 'Database query failed.',
      detail: err.message,
    });
  }

  // ── STEP 4: Haversine exact filter ───────────────────────────────────────
  const footage_window = timestamp ? buildFootageWindow(timestamp) : null;

  const withinRadius = rawRows
    .map((row) => {
      // Catalyst returns each row as { Cameras: { ... } }
      const cam = row.Cameras || row;

      const camLat  = parseFloat(cam.lat);
      const camLng  = parseFloat(cam.lng);
      const distM   = haversineM(lat, lng, camLat, camLng);

      if (distM > radiusM) return null;   // outside true radius — discard

      const hasAnpr      = cam.has_anpr      === 'true' || cam.has_anpr      === true;
      const hasFaceRecog = cam.has_face_recog === 'true' || cam.has_face_recog === true;
      const cameraType   = cam.type || '';

      const relevance_score = computeRelevanceScore(distM, hasAnpr, hasFaceRecog, cameraType);

      const camera = {
        camera_id:        cam.ROWID || cam.camera_id || null,
        external_id:      cam.external_id,
        name:             cam.name,
        camera_type:      cameraType,        // renamed back from "type" for API contract
        lat:              camLat,
        lng:              camLng,
        distance_meters:  Math.round(distM * 10) / 10,
        has_anpr:         hasAnpr,
        has_face_recog:   hasFaceRecog,
        junction_name:    cam.junction_name || null,
        relevance_score,
      };

      if (footage_window) {
        camera.footage_window = footage_window;
      }

      return camera;
    })
    .filter(Boolean);

  // ── STEP 5 & 6: Already scored above — just sort ─────────────────────────
  withinRadius.sort((a, b) => b.relevance_score - a.relevance_score);

  // ── STEP 7: Build response ────────────────────────────────────────────────
  const anpr_capable_count = withinRadius.filter((c) => c.has_anpr).length;

  return sendJSON(res, 200, {
    cameras:              withinRadius,
    total_found:          withinRadius.length,
    anpr_capable_count,
    search_radius_meters: radiusM,
  });
};
