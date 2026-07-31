'use strict';

/**
 * anpr-check/index.js
 * DRISHTI — ANPR Watchlist Checker & Builder
 *
 * ROUTE 1: POST /server/anpr-check/
 * Body: { plate_number, camera_id, camera_name, lat, lng, timestamp }
 *
 * ROUTE 2: POST /server/anpr-check/build-watchlist
 * Body: {} (one-time setup/updater call)
 *
 * All validation regex patterns and bounds come from ./config/camera-config.json.
 */

try { require('dotenv').config(); } catch (e) {}
const catalyst = require('zcatalyst-sdk-node');

// ── Config ────────────────────────────────────────────────────────────────────
const CONFIG             = require('./config/camera-config.json');
const PLATE_REGEX_STRING = CONFIG.ANPR_PLATE_PATTERN;

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendJSON(res, statusCode, body) {
  res.writeHead(statusCode, CORS_HEADERS);
  res.end(JSON.stringify(body));
}

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

// ── ROUTE 1: Watchlist Matcher ────────────────────────────────────────────────
async function handleCheck(req, res, app, body) {
  const { plate_number, camera_id, camera_name, lat, lng, timestamp } = body;

  if (!plate_number || camera_id === undefined || !camera_name || lat === undefined || lng === undefined || !timestamp) {
    return sendJSON(res, 400, {
      error: 'Missing required parameters: plate_number, camera_id, camera_name, lat, lng, and timestamp must be provided.',
    });
  }

  // ── STEP 1: Validate plate format using config regex ──────────────────────
  const plateRegex = new RegExp(`^${PLATE_REGEX_STRING}$`);
  if (!plateRegex.test(plate_number)) {
    return sendJSON(res, 200, {
      alert:        false,
      plate_number,
      reason:       'Invalid format',
    });
  }

  // Sanitise plate_number for safety
  const safePlate = plate_number.replace(/[^A-Za-z0-9-]/g, '');

  // ── STEP 2: ZCQL: Query ANPR_Watchlist table ──────────────────────────────
  // Note: alert_priority is used instead of priority. alert_active is boolean.
  const watchlistQuery =
    `SELECT plate_number, fir_case_number, crime_type, alert_priority ` +
    `FROM ANPR_Watchlist ` +
    `WHERE plate_number = '${safePlate}' AND alert_active = true ` +
    `LIMIT 1`;

  let watchlistResult;
  try {
    const queryRes = await app.zcql().executeZCQLQuery(watchlistQuery);
    watchlistResult = queryRes && queryRes.length > 0 ? (queryRes[0].ANPR_Watchlist || queryRes[0]) : null;
  } catch (err) {
    console.error('[anpr-check] ZCQL watchlist error:', err);
    return sendJSON(res, 500, { error: 'Database query failed (Watchlist check).', detail: err.message });
  }

  // ── STEP 3: If no match, return false alert ──────────────────────────────
  if (!watchlistResult) {
    return sendJSON(res, 200, {
      alert:        false,
      plate_number,
    });
  }

  // ── STEP 4: Fetch linked FIR by case_number ──────────────────────────────
  const safeCaseNumber = watchlistResult.fir_case_number.replace(/[^A-Za-z0-9-]/g, '');
  const firQuery =
    `SELECT crime_type_code, district_name, date_filed ` +
    `FROM FIRs ` +
    `WHERE case_number = '${safeCaseNumber}' ` +
    `LIMIT 1`;

  let firResult = null;
  try {
    const queryRes = await app.zcql().executeZCQLQuery(firQuery);
    firResult = queryRes && queryRes.length > 0 ? (queryRes[0].FIRs || queryRes[0]) : null;
  } catch (err) {
    console.error('[anpr-check] ZCQL FIR error:', err);
    return sendJSON(res, 500, { error: 'Database query failed (FIR lookup).', detail: err.message });
  }

  const crimeTypeCode = firResult ? firResult.crime_type_code : watchlistResult.crime_type;
  const districtName  = firResult ? firResult.district_name : 'Bengaluru Urban';
  const dateFiled     = firResult ? firResult.date_filed : new Date().toISOString();

  // ── STEP 5: Insert record into Alerts table ──────────────────────────────
  const severity = watchlistResult.alert_priority === 'high' ? 'critical' : 'high';
  const description =
    `ANPR Watchlist Match: Vehicle ${plate_number} detected at ${camera_name} ` +
    `(${lat}, ${lng}) associated with ${crimeTypeCode} case ${watchlistResult.fir_case_number}.`;

  let alertResponse;
  try {
    const datastore = app.datastore();
    const alertsTable = datastore.table('Alerts');
    const alertRow = {
      alert_type:              'anpr_match',
      camera_external_id:      String(camera_id),
      plate_number,
      lat:                     parseFloat(lat),
      lng:                     parseFloat(lng),
      matched_fir_case_number: watchlistResult.fir_case_number,
      description,
      severity,
      acknowledged:            false,
    };
    alertResponse = await alertsTable.insertRow(alertRow);
  } catch (err) {
    console.error('[anpr-check] Datastore Alerts insert error:', err);
    // Continue despite alert logging error to return the active match details
  }

  // ── STEP 6: Build instructions string ───────────────────────────────────
  let instructions = `Vehicle linked to FIR ${watchlistResult.fir_case_number}, contact ${districtName} PS.`;
  if (crimeTypeCode === 'vehicle_theft') {
    instructions = `Vehicle possibly stolen, do not approach alone, contact ${districtName} PS.`;
  } else if (crimeTypeCode === 'robbery' || crimeTypeCode === 'chain_snatching') {
    instructions = `Approach with backup, contact ${districtName} PS.`;
  }

  return sendJSON(res, 200, {
    alert:           true,
    severity,
    fir_case_number: watchlistResult.fir_case_number,
    original_crime:  crimeTypeCode,
    crime_date:      dateFiled,
    district:        districtName,
    instructions,
  });
}

// ── ROUTE 2: Watchlist Builder ──────────────────────────────────────────────
async function handleBuildWatchlist(req, res, app) {
  // Query existing plates in watchlist to prevent duplicates
  let existingPlates = new Set();
  try {
    const existingRes = await app.zcql().executeZCQLQuery('SELECT plate_number FROM ANPR_Watchlist LIMIT 2000');
    if (existingRes) {
      existingRes.forEach((row) => {
        const p = row.ANPR_Watchlist || row;
        if (p.plate_number) existingPlates.add(p.plate_number);
      });
    }
  } catch (err) {
    console.warn('[anpr-check] Failed to query existing watchlist plates. Proceeding with caution.', err);
  }

  // Fetch FIRs from three crime types where plates are likely embedded in descriptions
  const crimeTypes = ['vehicle_theft', 'robbery', 'chain_snatching'];
  let allFirs = [];

  for (const ctype of crimeTypes) {
    const q = `SELECT case_number, description, crime_type_code FROM FIRs WHERE crime_type_code = '${ctype}' LIMIT 1000`;
    try {
      const queryRes = await app.zcql().executeZCQLQuery(q);
      if (queryRes) {
        allFirs = allFirs.concat(queryRes.map((r) => r.FIRs || r));
      }
    } catch (err) {
      console.error(`[anpr-check] Failed to query FIRs for ${ctype}:`, err);
    }
  }

  const plateRegex = new RegExp(PLATE_REGEX_STRING);
  const rowsToInsert = [];
  const processedPlates = new Set();

  for (const fir of allFirs) {
    if (!fir.description) continue;
    const match = fir.description.match(plateRegex);
    if (match) {
      const plate = match[0];
      if (!existingPlates.has(plate) && !processedPlates.has(plate)) {
        processedPlates.add(plate);

        // Check if repeat offender
        const isRepeat =
          fir.description.toLowerCase().includes('repeat') ||
          fir.description.toLowerCase().includes('offender') ||
          fir.description.toLowerCase().includes('habitual');

        rowsToInsert.push({
          plate_number:   plate,
          fir_case_number: fir.case_number,
          crime_type:     fir.crime_type_code,
          alert_active:   true,
          alert_priority: isRepeat ? 'high' : 'medium',
        });
      }
    }
  }

  let platesAdded = 0;
  if (rowsToInsert.length > 0) {
    try {
      const datastore     = app.datastore();
      const watchlistTable = datastore.table('ANPR_Watchlist');
      // Catalyst Node SDK insertRows accepts an array of rows
      const insertResult  = await watchlistTable.insertRows(rowsToInsert);
      platesAdded         = insertResult ? insertResult.length : rowsToInsert.length;
    } catch (err) {
      console.error('[anpr-check] Watchlist bulk insert error:', err);
      return sendJSON(res, 500, { error: 'Failed to insert watchlist rows.', detail: err.message });
    }
  }

  return sendJSON(res, 200, {
    plates_added:             platesAdded,
    total_watchlist_checked:  allFirs.length,
  });
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  const app = catalyst.initialize(req);

  // Handle pre-flight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const urlPath = (req.url || '').split('?')[0];

  if (req.method === 'POST') {
    // Route matching
    if (urlPath === '/' || urlPath === '' || urlPath === '/anpr-check' || urlPath === '/anpr-check/') {
      let body;
      try {
        body = await readBody(req);
      } catch (err) {
        return sendJSON(res, 400, { error: 'Invalid JSON body.' });
      }
      return handleCheck(req, res, app, body);
    } else if (urlPath === '/build-watchlist' || urlPath === '/anpr-check/build-watchlist') {
      return handleBuildWatchlist(req, res, app);
    } else {
      return sendJSON(res, 404, { error: 'Not found.' });
    }
  } else {
    return sendJSON(res, 405, { error: 'Method not allowed. Use POST.' });
  }
};
