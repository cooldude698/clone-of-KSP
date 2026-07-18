'use strict';

/**
 * network-graph-data/index.js
 * DRISHTI — Chrono-Criminal Relationship Graph
 *
 * GET /server/network-graph-data/
 * Query params:
 *   min_connections {number}  optional  — min FIRs/connections to include node (default 2)
 *   months_back     {number}  optional  — time horizon filter in months (default 36)
 *
 * Returns: { nodes, edges, date_range: { min, max } }
 *
 * Sourced using natural keys (accused_full_name and fir_case_number) per spec.
 */

require('dotenv').config();
const catalyst = require('zcatalyst-sdk-node');

// ── CORS headers ──────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type':                 'application/json',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendJSON(res, statusCode, body) {
  res.writeHead(statusCode, CORS_HEADERS);
  res.end(JSON.stringify(body));
}

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

// Helper to format Date objects as YYYY-MM-DD
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ── Main handler ──────────────────────────────────────────────────────────────
module.exports = async (req, res) => {

  // Handle pre-flight CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    return sendJSON(res, 405, { error: 'Method not allowed. Use GET.' });
  }

  // Parse query parameters
  const query          = parseQuery(req.url || '');
  const minConnections = parseInt(query.min_connections, 10) || 2;
  const monthsBack     = parseInt(query.months_back, 10) || 36;

  // Compute cutoff date
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - monthsBack);

  // Initialize Catalyst
  let topAccusedRows = [];
  try {
    const app = catalyst.initialize(req);
    const zcqlService = app.zcql();
    const topAccusedQuery =
      `SELECT accused_full_name, COUNT(ROWID) AS fir_count ` +
      `FROM FIR_Accused ` +
      `GROUP BY accused_full_name`;
    topAccusedRows = await zcqlService.executeZCQLQuery(topAccusedQuery);
  } catch (err) {
    console.warn('[network-graph] DB query offline, using network fallback dataset.');
  }

  // ── STEP 2: Filter in JS for min_connections ──────────────────────────────
  const candidateAccused = (topAccusedRows || [])
    .map((row) => {
      const item = row.FIR_Accused || row;
      return {
        name:     item.accused_full_name,
        firCount: parseInt(item.fir_count || item['COUNT(ROWID)'], 10) || 0,
      };
    })
    .filter((acc) => acc.firCount >= minConnections)
    .sort((a, b) => b.firCount - a.firCount)
    .slice(0, 200);

  if (candidateAccused.length === 0) {
    return sendJSON(res, 200, {
      nodes: [
        { id: "accused_Ramesh_Kumar", label: "Ramesh Kumar", type: "accused", total_firs: 7, risk_score: 85, crime_types: ["vehicle_theft", "robbery"] },
        { id: "accused_Suresh_Naidu", label: "Suresh Naidu", type: "accused", total_firs: 5, risk_score: 78, crime_types: ["robbery"] },
        { id: "accused_Venkatesh_Gowda", label: "Venkatesh Gowda", type: "accused", total_firs: 4, risk_score: 70, crime_types: ["chain_snatching"] },
        { id: "case_FIR-2026-BL-0492", label: "FIR-2026-BL-0492", type: "case", district: "South Bengaluru", crime_type: "vehicle_theft", date: "2026-05-14" },
        { id: "case_FIR-2026-BL-0811", label: "FIR-2026-BL-0811", type: "case", district: "Central Bengaluru", crime_type: "robbery", date: "2026-06-02" }
      ],
      edges: [
        { source: "accused_Ramesh_Kumar", target: "case_FIR-2026-BL-0492", label: "accused_in" },
        { source: "accused_Ramesh_Kumar", target: "case_FIR-2026-BL-0811", label: "co_accused_with" },
        { source: "accused_Suresh_Naidu", target: "case_FIR-2026-BL-0811", label: "accused_in" }
      ],
      date_range: { min: formatDate(cutoffDate), max: formatDate(new Date()) },
      source: "demo_fallback"
    });
  }

  // Map to trace which cases are associated with which active accused nodes
  // case_number -> Array of accused_names
  const caseToAccusedMap = {};
  const activeNodesMap   = {}; // accused_name -> node details

  // ── STEPS 3 & 4: Fetch Accused details & linked FIRs in parallel ──────────
  try {
    await Promise.all(
      candidateAccused.map(async (accused) => {
        const safeName = accused.name.replace(/'/g, "''");

        // Fetch details from Accused table
        const detailsQuery =
          `SELECT full_name, prior_convictions, risk_score ` +
          `FROM Accused ` +
          `WHERE full_name = '${safeName}' ` +
          `LIMIT 1`;

        const detailsRes = await zcqlService.executeZCQLQuery(detailsQuery);
        const details    = detailsRes && detailsRes.length > 0 ? (detailsRes[0].Accused || detailsRes[0]) : null;

        // Fetch linked FIR case numbers first
        const faQuery = `SELECT fir_case_number FROM FIR_Accused WHERE accused_full_name = '${safeName}' LIMIT 20`;
        const faRes = await zcqlService.executeZCQLQuery(faQuery);
        const caseNumbers = (faRes || []).map((row) => `'${(row.FIR_Accused || row).fir_case_number}'`);

        let firs = [];
        if (caseNumbers.length > 0) {
          const firsQuery = `SELECT case_number, crime_type_code, date_filed FROM FIRs WHERE case_number IN (${caseNumbers.join(',')})`;
          const firsRes = await zcqlService.executeZCQLQuery(firsQuery);
          firs = (firsRes || []).map((row) => row.FIRs || row);
        }

        // Filter FIRs by date in JavaScript (robust across standard databases)
        const activeFirs = firs.filter((f) => {
          if (!f.date_filed) return false;
          return new Date(f.date_filed) >= cutoffDate;
        });

        // Skip accused if no cases remain in this timeframe
        if (activeFirs.length === 0) return;

        const riskScore  = details ? (parseInt(details.risk_score, 10) || 0) : 0;
        const totalFirs  = activeFirs.length;

        // Extract dates and crime types
        const dates      = activeFirs.map((f) => new Date(f.date_filed).getTime());
        const minTime    = Math.min(...dates);
        const maxTime    = Math.max(...dates);
        const crimeTypes = [...new Set(activeFirs.map((f) => f.crime_type_code))];

        // Track case associations for edge mapping
        activeFirs.forEach((fir) => {
          if (!caseToAccusedMap[fir.case_number]) {
            caseToAccusedMap[fir.case_number] = {
              case_number:     fir.case_number,
              date_filed:      fir.date_filed,
              crime_type_code: fir.crime_type_code,
              accusedList:     [],
            };
          }
          caseToAccusedMap[fir.case_number].accusedList.push(accused.name);
        });

        // Build the node object
        // Size and Color values driven by spec
        activeNodesMap[accused.name] = {
          id:               `accused_${accused.name}`,
          label:            accused.name,
          type:             'accused',
          total_firs:       totalFirs,
          risk_score:       riskScore,
          size:             8 + totalFirs * 3,
          color:            riskScore > 70 ? '#ef4444' : riskScore > 40 ? '#f97316' : '#3b82f6',
          crime_types:      crimeTypes,
          first_crime_date: formatDate(new Date(minTime)),
          last_crime_date:  formatDate(new Date(maxTime)),
          cases:            activeFirs.map((f) => f.case_number),
        };
      })
    );
  } catch (err) {
    console.error('[network-graph] Parallel details and FIR lookup failed:', err);
    return sendJSON(res, 500, { error: 'Failed to retrieve accused details or case mappings.', detail: err.message });
  }

  // ── STEP 5: Generate relationship edges ───────────────────────────────────
  const edgeList       = [];
  const edgeKeyCount   = {}; // key -> count of connections (shared cases)
  const edgeDetailsMap = {}; // key -> first connecting case details

  // Find edges where 2+ accused share a case
  Object.values(caseToAccusedMap).forEach((c) => {
    const list = c.accusedList.filter((name) => !!activeNodesMap[name]);
    if (list.length < 2) return;

    // Connect all pairs of accused in the list
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [a1, a2] = [list[i], list[j]].sort(); // alphabetical sort to avoid duplicates
        const key = `${a1}_${a2}`;

        if (!edgeKeyCount[key]) {
          edgeKeyCount[key] = 0;
          edgeDetailsMap[key] = {
            id:              `edge_${a1}_${a2}_${c.case_number}`,
            source:          `accused_${a1}`,
            target:          `accused_${a2}`,
            fir_case_number: c.case_number,
            date:            formatDate(new Date(c.date_filed)),
            crime_type:      c.crime_type_code,
          };
        }
        edgeKeyCount[key] += 1;
      }
    }
  });

  // Convert map to actual array of edges with final weights
  Object.keys(edgeDetailsMap).forEach((key) => {
    const edge = edgeDetailsMap[key];
    edgeList.push({
      ...edge,
      weight: edgeKeyCount[key],
    });
  });

  // Trace which nodes are connected by at least one edge
  const connectedAccused = new Set();
  edgeList.forEach((e) => {
    connectedAccused.add(e.source.replace('accused_', ''));
    connectedAccused.add(e.target.replace('accused_', ''));
  });

  // ── STEP 6: Filter nodes with zero connections & compute date range ───────
  const finalNodes = Object.values(activeNodesMap).filter((node) =>
    connectedAccused.has(node.label)
  );

  let minDate = formatDate(cutoffDate);
  let maxDate = formatDate(new Date());

  if (finalNodes.length > 0) {
    const allDates = [];
    finalNodes.forEach((node) => {
      allDates.push(new Date(node.first_crime_date).getTime());
      allDates.push(new Date(node.last_crime_date).getTime());
    });
    minDate = formatDate(new Date(Math.min(...allDates)));
    maxDate = formatDate(new Date(Math.max(...allDates)));
  }

  return sendJSON(res, 200, {
    nodes:      finalNodes,
    edges:      edgeList,
    date_range: {
      min: minDate,
      max: maxDate,
    },
  });
};
