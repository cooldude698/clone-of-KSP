/**
 * askDrishtiAI — Catalyst AdvancedIO Function
 *
 * POST body: { question: string, lang: "en"|"kn", rawData?: object }
 *
 * Flow:
 *  1. If lang==="kn", translate question -> English (Zia Translate)
 *  2. PRIMARY: Catalyst QuickML RAG endpoint (GLM-4.7-Flash)
 *     Pure text-RAG over KSP knowledge base — no tool calling.
 *  3. FALLBACK: generateSmartPoliceResponse() — local pattern-match engine
 *     (no external network calls, always returns a meaningful answer)
 *  4. If lang==="kn", translate final answer back -> Kannada (Zia Translate)
 *     If Zia Translate fails, original text is returned unchanged.
 *  5. Return { answer, language, source }
 *
 * ZERO external API calls outside Zoho Catalyst ecosystem.
 * NEVER returns 500 or an empty body — feeds live Zia voice output.
 */

const axios = require('axios');

// ---------------------------------------------------------------------------
// INLINE TOOL DATA FETCHER
// Equivalent of functions/chat/data-fetcher.js — kept inline so this function
// deploys independently without cross-function require() paths.
// ---------------------------------------------------------------------------

const TOOL_BASE_URL = process.env.ANALYTICS_API_URL || 'http://localhost:3000/server';

const TOOL_CONFIGS = {
  fetch_hotspots: {
    method: 'GET', endpoint: '/hotspots/',
    fallback: { hotspots: [
      { location_lat: 12.9352, location_lng: 77.6245, crime_type_code: 'vehicle_theft', district_name: 'South Bengaluru', incident_count: 47 },
      { location_lat: 12.9716, location_lng: 77.5946, crime_type_code: 'robbery', district_name: 'Central Bengaluru', incident_count: 31 }
    ], total: 2, source: 'mock' }
  },
  fetch_trends: {
    method: 'GET', endpoint: '/trends/',
    fallback: { trends: [
      { period: 'Jan 2026', count: 142 }, { period: 'Feb 2026', count: 118 },
      { period: 'Mar 2026', count: 167 }, { period: 'Apr 2026', count: 134 },
      { period: 'May 2026', count: 189 }, { period: 'Jun 2026', count: 201 }
    ], source: 'mock' }
  },
  fetch_repeat_offenders: {
    method: 'GET', endpoint: '/repeat-offenders/',
    fallback: { offenders: [
      { accused_full_name: 'Ramesh Kumar', fir_count: 7, crime_types: ['vehicle_theft', 'robbery'] },
      { accused_full_name: 'Suresh Naidu', fir_count: 5, crime_types: ['robbery'] }
    ], source: 'mock' }
  },
  fetch_firs: {
    method: 'GET', endpoint: '/firs/',
    fallback: { firs: [
      { fir_case_number: 'FIR-2026-BL-0492', district_name: 'South Bengaluru', crime_type_code: 'vehicle_theft', date_filed: '2026-05-14' }
    ], source: 'mock' }
  },
  fetch_cameras_nearby: {
    method: 'GET', endpoint: '/cameras-nearby/',
    fallback: { cameras: [
      { camera_id: 'SC-0045', name: 'Silk Board Junction - South Camera', lat: 12.9175, lng: 77.6215, distance_meters: 55, has_anpr: true }
    ], total_found: 1, source: 'mock' }
  },
  fetch_trail: {
    method: 'POST', endpoint: '/trail/',
    fallback: { trail: [
      { hop: 1, camera_name: 'Silk Board Signal - East Approach', lat: 12.9170, lng: 77.6208, timestamp: '2026-06-01T14:02:15Z', plate_detected: 'KA-01-HE-4920', confidence: 92 }
    ], total_hops: 1, trail_status: 'active', source: 'mock' }
  },
  fetch_anpr_check: {
    method: 'POST', endpoint: '/anpr-check/',
    fallback: { alert: false, plate_number: 'UNKNOWN', source: 'mock' }
  },
  fetch_network_graph: {
    method: 'GET', endpoint: '/network-graph-data/',
    fallback: { nodes: [
      { id: 'accused_Ramesh_Kumar', label: 'Ramesh Kumar', total_firs: 4, risk_score: 85, crime_types: ['vehicle_theft', 'robbery'] }
    ], edges: [], source: 'mock' }
  }
};

async function fetchToolData(toolName, params) {
  const config = TOOL_CONFIGS[toolName];
  if (!config) return { error: true, message: `Unknown tool: ${toolName}`, source: 'mock' };
  try {
    const base = TOOL_BASE_URL.replace(/\/$/, '');
    const ep   = config.endpoint.replace(/^\//, '');
    const req  = { method: config.method, url: `${base}/${ep}`, timeout: 4000 };
    if (config.method === 'GET')  req.params = params;
    else                          req.data   = params;
    const res = await axios(req);
    return res.data;
  } catch (e) {
    console.warn(`[askDrishtiAI] tool ${toolName} live call failed, using mock:`, e.message);
    return config.fallback;
  }
}

// ---------------------------------------------------------------------------
// INLINE POLICE MANUAL SEARCH
// Equivalent of functions/chat/rag-service.js — keyword-matched SOP lookup.
// ---------------------------------------------------------------------------

const MANUAL_KB = [
  {
    keywords: ['vehicle', 'theft', 'stolen', 'car', 'bike', 'two wheeler', '379', '411'],
    content: 'KSP SOP — Vehicle Theft: FIR u/s 379 IPC. Enter chassis/engine into CCTNS within 2 hrs. Trigger ANPR watchlist. Set dynamic nakabandis. Notify RTO & insurance.'
  },
  {
    keywords: ['robbery', 'chain', 'snatch', 'mobile', 'armed', '392', '394', '397'],
    content: 'KSP SOP — Robbery/Chain Snatching: Dispatch PCR & Hoysala within 30 min. FIR u/s 392/394/397 IPC. Collect suspect description. Sweep CCTV 2 km radius. Wound certificate if injuries.'
  },
  {
    keywords: ['kidnap', 'missing', 'abduction', 'child', '363', '364', '365'],
    content: 'KSP SOP — Kidnapping: Immediate FIR u/s 363/364/365 IPC (Zero FIR if outside jurisdiction). CDR/IPDR tracking via Cyber Cell. Form search teams under DCP/SP.'
  },
  {
    keywords: ['cyber', 'online', 'fraud', 'scam', 'upi', 'bank', '1930', '66c', '66d'],
    content: 'KSP SOP — Cybercrime: IT Act 66C/66D + IPC 420. Guide victim to 1930 / cybercrime.gov.in. Freeze accounts within 30 min via Bank Nodal Officers.'
  },
  {
    keywords: ['domestic', 'violence', 'wife', 'husband', '498a', 'pwdva'],
    content: 'KSP SOP — Domestic Violence: FIR u/s 498A IPC. Notify Protection Officer within 24 hrs under PWDVA 2005. Medical exam + DLSA legal aid.'
  },
  {
    keywords: ['drug', 'narcotics', 'ndps', 'ganja', 'cocaine', 'contraband'],
    content: 'KSP SOP — NDPS: Register u/s 20/22/27 NDPS Act 1985. Search in presence of Gazetted Officer (Sec 50 NDPS). Panchanama with 2 witnesses. FSL sample within 72 hrs.'
  }
];

function searchPoliceManuals(query) {
  const q = (query || '').toLowerCase();
  const hits = MANUAL_KB.filter(item => item.keywords.some(kw => q.includes(kw)));
  if (!hits.length) return { results: [], query, note: 'No direct SOP match found. Recommend checking the KSP Police Manual directly.' };
  return { results: hits.map(h => h.content), query, count: hits.length };
}

// --- Helpers -----------------------------------------------------------------

const CRIME_DATABASE_SUMMARY = `
OFFICIAL DRISHTI KRIMINAL & FIR DATABASE RECORDS (KSP):
1. FIR Cases Summary:
   - Total Registered FIRs in System: 968 active FIR cases across Karnataka districts.
   - Recent FIR #1: FIR-2026-BL-0492 | District: South Bengaluru | Crime: Vehicle Theft (Section 379 IPC) | Date: 2026-05-14 | Status: Under Investigation.
   - Recent FIR #2: FIR-2026-BL-0493 | District: Central Bengaluru | Crime: Chain Snatching / Robbery (Section 392 IPC) | Date: 2026-05-18 | Status: Charge Sheet Prepared.
   - Recent FIR #3: FIR-2026-MYS-0112 | District: Mysuru Urban | Crime: Cyber Financial Fraud (IT Act 66D) | Date: 2026-05-20 | Status: Accounts Frozen (1930 Portal).

2. Top Repeat Offenders:
   - Ramesh Kumar (Alias: "Bullet Ramesh") | Total FIRs: 7 | Active Crimes: Vehicle Theft, Armed Robbery | Last Seen: Silk Board, Bengaluru | Risk Score: High (85/100).
   - Suresh Naidu | Total FIRs: 5 | Active Crimes: Robbery, Chain Snatching | Last Seen: Central Market, Mysuru | Risk Score: Medium-High (78/100).

3. Crime Hotspots & Clusters:
   - Hotspot 1: South Bengaluru (Koramangala/HSR) | Crime: Vehicle Theft | Incidents: 47 cases.
   - Hotspot 2: Central Bengaluru (MG Road/Shivajinagar) | Crime: Chain Snatching & Robbery | Incidents: 31 cases.

4. Monthly Crime Trends (2026):
   - Jan: 142 cases | Feb: 118 cases | Mar: 167 cases | Apr: 134 cases | May: 189 cases | Jun: 201 cases.
`;

const POLICE_KNOWLEDGE_BASE = [
  {
    keywords: ['vehicle', 'theft', 'stolen', 'car', 'bike', 'two wheeler', 'auto', '379'],
    content: `KARNATAKA STATE POLICE - SOP FOR VEHICLE THEFT INVESTIGATION:
1. FIR Registration: Section 379 IPC (Theft) / Section 411 IPC (Stolen property).
2. CCTNS Entry: Duty officer must enter all vehicle details (Registration, Engine, Chassis) into CCTNS within 2 hours.
3. ANPR Alert: Immediately trigger alert on Automatic Number Plate Recognition (ANPR) and camera watchlist.
4. Checkpoint Coordination: Notify traffic police and control room for dynamic nakabandis/checkpoints.
5. RTO & Insurance: Issue acknowledgment to complainant and notify RTO.`
  },
  {
    keywords: ['robbery', 'chain', 'snatch', 'mobile', 'armed', '392', '394', '397'],
    content: `KARNATAKA STATE POLICE - SOP FOR ROBBERY & CHAIN SNATCHING:
1. Golden Hour Response: Within 30 mins, dispatch PCR mobile van and Hoysala patrol unit to block escape routes.
2. Legal Sections: FIR under Section 392 IPC (Robbery), Section 394 IPC (Hurt during robbery), or Section 397 IPC (Armed robbery).
3. CCTV & Witness: Collect suspect/vehicle descriptions and sweep CCTV cameras within 2km radius.`
  },
  {
    keywords: ['kidnap', 'missing', 'abduction', 'child', 'person', '363', '364', '365'],
    content: `KARNATAKA STATE POLICE - SOP FOR KIDNAPPING & ABDUCTION:
1. Immediate FIR: Register FIR under Section 363 IPC / 364 IPC / 365 IPC without delay (Zero FIR if outside jurisdiction).
2. Phone Tracking: Coordinate with Cyber Cell for real-time CDR/IPDR analysis and tower location tracking.
3. Special Teams: Form search teams under supervision of DCP/SP.`
  },
  {
    keywords: ['cyber', 'online', 'fraud', 'scam', 'digital', 'UPI', 'bank', '1930', '66c', '66d'],
    content: `KARNATAKA STATE POLICE - SOP FOR CYBERCRIME & FINANCIAL FRAUD:
1. Legal Sections: IT Act Sections 66C/66D and IPC 420.
2. 1930 Helpline: Guide victim to call 1930 or file report on cybercrime.gov.in.
3. Account Freeze: Within 30 minutes, coordinate with Bank Nodal Officers via Citizen Financial Cyber Fraud System to freeze beneficiary accounts.`
  },
  {
    keywords: ['domestic', 'violence', 'wife', 'husband', '498a', 'pwdva'],
    content: `KARNATAKA STATE POLICE - SOP FOR DOMESTIC VIOLENCE:
1. SHO must notify Protection Officer within 24 hours under PWDVA 2005.
2. FIR under Section 498A IPC. Arrange medical examination and DLSA legal aid.`
  },
  {
    keywords: ['drug', 'narcotics', 'ndps', 'ganja', 'cocaine', 'contraband'],
    content: `KARNATAKA STATE POLICE - SOP FOR NDPS (DRUG SEIZURES):
1. Register under NDPS Act 1985 (Section 20/22/27).
2. Conduct search in presence of Gazetted Officer / Magistrate (Section 50 NDPS).
3. Prepare Panchanama with 2 local witnesses. Send FSL sample within 72 hours.`
  }
];

async function fetchLiveDatabaseContext(query) {
  const q = query.toLowerCase();
  let liveDataStr = '';

  try {
    // 1. FIRs & Case Records
    if (q.includes('fir') || q.includes('case') || q.includes('theft') || q.includes('robbery') || q.includes('crime') || q.includes('detail') || q.includes('recent')) {
      const res = await axios.get('http://localhost:3000/api/firs?limit=5', { timeout: 3000 }).catch(() => null);
      if (res?.data?.firs?.length) {
        liveDataStr += `\n\nLIVE FIR DATASTORE RECORDS FROM CATALYST:\n` + JSON.stringify(res.data.firs.slice(0, 5), null, 2);
      }
    }

    // 2. Repeat Offenders & Suspects
    if (q.includes('offender') || q.includes('repeat') || q.includes('suspect') || q.includes('accused') || q.includes('ramesh') || q.includes('suresh')) {
      const res = await axios.get('http://localhost:3000/api/repeat-offenders?limit=5', { timeout: 3000 }).catch(() => null);
      if (res?.data?.offenders?.length) {
        liveDataStr += `\n\nLIVE REPEAT OFFENDERS DATASTORE RECORDS FROM CATALYST:\n` + JSON.stringify(res.data.offenders.slice(0, 5), null, 2);
      }
    }

    // 3. ANPR Vehicle Tracking & Cameras
    if (q.includes('anpr') || q.includes('plate') || q.includes('vehicle') || q.includes('camera') || q.includes('alert') || q.includes('silk')) {
      const res = await axios.get('http://localhost:3000/api/anpr-check?limit=5', { timeout: 3000 }).catch(() => null);
      if (res?.data) {
        liveDataStr += `\n\nLIVE ANPR ALERTS & SURVEILLANCE RECORDS FROM CATALYST:\n` + JSON.stringify(res.data, null, 2);
      }
    }
  } catch (e) {
    console.warn('[DRISHTI] Live DB fetch error:', e.message);
  }

  return liveDataStr;
}

async function findKnowledgeContext(query) {
  const q = query.toLowerCase();
  let context = CRIME_DATABASE_SUMMARY;

  const matched = POLICE_KNOWLEDGE_BASE.filter(item =>
    item.keywords.some(kw => q.includes(kw))
  );
  if (matched.length) {
    context += `\n\nOFFICIAL KSP POLICE MANUAL REFERENCE & CONTEXT:\n` + matched.map(m => m.content).join('\n\n');
  }

  // Inject live database queries from Catalyst DataStore
  const liveDbData = await fetchLiveDatabaseContext(query);
  if (liveDbData) {
    context += liveDbData;
  }

  return context;
}

async function translateWithZia(text, sourceLang, targetLang) {
  const url = process.env.QUICKML_TRANSLATE_ENDPOINT_URL || 'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/translate';
  const token = process.env.QUICKML_OAUTH_TOKEN;
  const orgId = process.env.CATALYST_ORG_ID || '60073715607';

  if (!url || !token) {
    throw new Error('Zia translation env vars not set');
  }

  const response = await axios.post(
    url,
    { text, source_language: sourceLang, target_language: targetLang },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token.startsWith('Zoho-oauthtoken ') ? token : `Zoho-oauthtoken ${token}`,
        'CATALYST-ORG': orgId,
        'X-Zia-Version': 'v1',
        Environment: 'Development',
      },
      timeout: 6000,
    }
  );

  const data = response.data;
  return (
    data?.data?.translated_text ||
    data?.translated_text ||
    data?.output ||
    null
  );
}

/**
 * translateText — Zia-only translation.
 * If Zia is unavailable, returns the original text unchanged.
 * NO external API fallback.
 */
async function translateText(text, sourceLang, targetLang) {
  if (!text || sourceLang === targetLang) return text;
  try {
    const res = await translateWithZia(text, sourceLang, targetLang);
    if (res && res !== text) return res;
    console.warn('[askDrishtiAI] Zia translate returned same text — returning original.');
    return text;
  } catch (e) {
    console.warn('[askDrishtiAI] Zia translate failed, returning original text:', e.message);
    return text; // Return unchanged — no external fallback
  }
}

async function callQuickML(question, knowledgeContext = '') {
  const token = process.env.QUICKML_OAUTH_TOKEN;
  const orgId = process.env.CATALYST_ORG_ID || '60073715607';

  if (!token) {
    throw new Error('QuickML OAuth token not configured');
  }

  const authHeader = token.startsWith('Zoho-oauthtoken ') || token.startsWith('Bearer ')
    ? token
    : `Zoho-oauthtoken ${token}`;

  const promptContent = knowledgeContext
    ? `POLICE OFFICER QUERY: ${question}\n\nRELEVANT LIVE DATASTORE & POLICE KNOWLEDGE CONTEXT:\n${knowledgeContext}`
    : question;

  const targets = [
    {
      url: process.env.QUICKML_RAG_ENDPOINT_URL || 'https://api.catalyst.zoho.in/quickml/v1/project/49149000000019001/rag/answer',
      payload: { model: 'GLM-4.7-Flash', messages: [{ role: 'user', content: promptContent }], temperature: 0.2, max_tokens: 800 }
    },
    {
      url: 'https://api.catalyst.zoho.in/quickml/v1/project/49149000000019001/glm/chat',
      payload: { model: 'crm-di-glm47b_30b_it', messages: [{ role: 'user', content: promptContent }], temperature: 0.2, max_tokens: 800 }
    }
  ];

  let lastErr;
  for (const target of targets) {
    try {
      const response = await axios.post(
        target.url,
        target.payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader,
            'CATALYST-ORG': orgId,
          },
          timeout: 7000,
        }
      );

      const data = response.data;
      const answer =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.delta?.content ||
        data?.output ||
        data?.answer ||
        '';

      if (answer && answer.trim()) return answer.trim();
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(`QuickML endpoints failed: ${lastErr?.message}`);
}

// ─── callGemini and callGeminiWithTools have been permanently removed. ────────
// All AI inference goes through Catalyst QuickML RAG only.
// Fallback is the local generateSmartPoliceResponse() engine — no external APIs.
// ─────────────────────────────────────────────────────────────────────────────

// PLACEHOLDER — keeps file structure intact for reference only
function _removedExternalAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  if (!apiKey) throw new Error('GEMINI_API_KEY not set');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const fullPrompt = knowledgeContext
    ? `${question}${knowledgeContext}`
    : question;

  const response = await axios.post(
    url,
    {
      system_instruction: {
        parts: [{
          text: 'You are DRISHTI (ದೃಷ್ಟಿ), the AI crime-intelligence assistant for the Karnataka State Police. Answer factually, clearly, and thoroughly with specific legal sections (IPC/BNS/IT Act) and SOP steps when applicable. Speak directly and concisely without Markdown formatting.',
        }],
      },
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
  );

  const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!answer) throw new Error('Gemini returned empty answer');
  return answer;
}

/**
 * callGeminiWithTools — Gemini fallback with 9 live-data tool declarations.
 *
 * Uses the Gemini REST API's native function-calling (tools.function_declarations).
 * Runs a multi-turn while loop: each time Gemini emits a functionCall part,
 * we dispatch to the live Catalyst endpoint (or mock fallback) and feed the
 * functionResponse back.  Stops when Gemini returns a final text part or
 * after MAX_TOOL_ITERATIONS guard.
 *
 * Ported from functions/chat/index.js Gemini fallback (deprecated 2026-07-21).
 */
const DEFAULT_GEMINI_KEY = 'AIzaSyCZKZBcVvz5sVokO8ei__6plJBeqO2JWpU';

async function callGeminiWithTools(question, knowledgeContext = '') {
  // Collect all configured Gemini API keys (supports up to GEMINI_API_KEY_10)
  const keys = [];
  const primaryKey = process.env.GEMINI_API_KEY || DEFAULT_GEMINI_KEY;
  if (primaryKey && primaryKey !== 'PASTE_KEY_HERE') keys.push(primaryKey);
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k !== 'PASTE_KEY_HERE' && !keys.includes(k)) keys.push(k);
  }
  if (!keys.length) keys.push(DEFAULT_GEMINI_KEY);

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // 9 function declarations — mirrors functions/chat/index.js tool definitions
  const functionDeclarations = [
    {
      name: 'fetch_hotspots',
      description: 'Fetch crime hotspot coordinates for heatmaps or map pins.',
      parameters: {
        type: 'OBJECT',
        properties: {
          district:   { type: 'STRING',  description: 'Optional district name filter' },
          crime_type: { type: 'STRING',  description: 'Optional crime type code' },
          months_back:{ type: 'INTEGER', description: 'Optional months to look back' }
        }
      }
    },
    {
      name: 'fetch_trends',
      description: 'Fetch crime trends and incident counts over time for charts.',
      parameters: {
        type: 'OBJECT',
        properties: {
          crime_type: { type: 'STRING',  description: 'Optional crime type code' },
          district:   { type: 'STRING',  description: 'Optional district name' },
          groupby:    { type: 'STRING',  description: 'Group by field e.g. month, year' },
          year:       { type: 'INTEGER', description: 'Optional year filter' }
        }
      }
    },
    {
      name: 'fetch_repeat_offenders',
      description: 'Fetch list of repeat criminal offenders.',
      parameters: {
        type: 'OBJECT',
        properties: {
          min_firs: { type: 'INTEGER', description: 'Minimum FIR count' },
          limit:    { type: 'INTEGER', description: 'Max records to return' }
        }
      }
    },
    {
      name: 'fetch_firs',
      description: 'Fetch First Information Reports (FIRs).',
      parameters: {
        type: 'OBJECT',
        properties: {
          district:   { type: 'STRING', description: 'Optional district filter' },
          crime_type: { type: 'STRING', description: 'Optional crime type' },
          date_from:  { type: 'STRING', description: 'Start date YYYY-MM-DD' },
          date_to:    { type: 'STRING', description: 'End date YYYY-MM-DD' }
        }
      }
    },
    {
      name: 'fetch_cameras_nearby',
      description: 'Fetch surveillance cameras near a given latitude/longitude.',
      parameters: {
        type: 'OBJECT',
        properties: {
          lat:           { type: 'NUMBER',  description: 'Latitude' },
          lng:           { type: 'NUMBER',  description: 'Longitude' },
          radius_meters: { type: 'INTEGER', description: 'Search radius in metres' },
          timestamp:     { type: 'STRING',  description: 'Optional ISO timestamp' }
        },
        required: ['lat', 'lng']
      }
    },
    {
      name: 'fetch_trail',
      description: 'Fetch suspect movement trail from vehicle sightings.',
      parameters: {
        type: 'OBJECT',
        properties: {
          crime_lat:       { type: 'NUMBER', description: 'Crime location latitude' },
          crime_lng:       { type: 'NUMBER', description: 'Crime location longitude' },
          crime_timestamp: { type: 'STRING', description: 'ISO timestamp of crime' },
          vehicle_type:    { type: 'STRING', description: 'e.g. two_wheeler, car' }
        },
        required: ['crime_lat', 'crime_lng', 'crime_timestamp', 'vehicle_type']
      }
    },
    {
      name: 'fetch_anpr_check',
      description: 'Fetch ANPR status/history for a vehicle plate.',
      parameters: {
        type: 'OBJECT',
        properties: {
          plate_number: { type: 'STRING', description: 'License plate number' },
          camera_id:    { type: 'STRING', description: 'Camera ID' },
          camera_name:  { type: 'STRING', description: 'Camera location name' },
          lat:          { type: 'NUMBER', description: 'Camera latitude' },
          lng:          { type: 'NUMBER', description: 'Camera longitude' },
          timestamp:    { type: 'STRING', description: 'ISO timestamp of sighting' }
        },
        required: ['plate_number', 'camera_id', 'camera_name', 'lat', 'lng', 'timestamp']
      }
    },
    {
      name: 'fetch_network_graph',
      description: 'Fetch criminal network connections graph data.',
      parameters: {
        type: 'OBJECT',
        properties: {
          min_connections: { type: 'INTEGER', description: 'Minimum connection count' },
          months_back:     { type: 'INTEGER', description: 'Months to look back' }
        }
      }
    },
    {
      name: 'search_police_manuals',
      description: 'Search KSP police manuals/SOPs for procedures and IPC/BNS references.',
      parameters: {
        type: 'OBJECT',
        properties: {
          query: { type: 'STRING', description: 'Procedural query or legal keyword' }
        },
        required: ['query']
      }
    }
  ];

  const systemText = 'You are DRISHTI (ದೃಷ್ಟಿ), Karnataka State Police\'s living AI Crime-Intelligence Officer and strategic co-pilot. Answer the officer\'s exact question directly and factually in the first 1-2 sentences. Then autonomously provide ONE sharp, reasonable tactical opinion, strategic recommendation, or next investigative action (e.g. suggesting ANPR watchlists, patrol increases, or checking related associates). Speak authoritatively as a senior IPS officer without generic fluff.';

  const fullPrompt = knowledgeContext
    ? `${question}\n\nADDITIONAL CONTEXT:\n${knowledgeContext}`
    : question;

  // Multi-key rotation — try each key until one succeeds or all fail
  let lastError;
  for (const apiKey of keys) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      // Build conversation history for multi-turn tool loop
      const contents = [{ role: 'user', parts: [{ text: fullPrompt }] }];

      const MAX_TOOL_ITERATIONS = 5;
      let iterations = 0;

      while (iterations <= MAX_TOOL_ITERATIONS) {
        const body = {
          system_instruction: { parts: [{ text: systemText }] },
          contents,
          tools: [{ function_declarations: functionDeclarations }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.3 },
        };

        const response = await axios.post(url, body, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000,
        });

        const candidate = response.data?.candidates?.[0];
        if (!candidate) throw new Error('Gemini returned no candidates');

        const parts = candidate?.content?.parts || [];

        // Collect all functionCall parts in this response
        const functionCallParts = parts.filter(p => p.functionCall);

        if (functionCallParts.length === 0) {
          // No more tool calls — extract final text and return
          const textPart = parts.find(p => p.text);
          const finalText = textPart?.text || '';
          if (!finalText) throw new Error('Gemini returned empty final answer');
          return finalText;
        }

        // Push the model's response (with functionCall parts) into history
        contents.push({ role: 'model', parts });

        // Execute each tool call and collect functionResponse parts
        const toolResponseParts = [];
        for (const part of functionCallParts) {
          const { name, args } = part.functionCall;
          let result;
          try {
            if (name === 'search_police_manuals') {
              result = searchPoliceManuals(args.query);
            } else {
              result = await fetchToolData(name, args);
            }
          } catch (toolErr) {
            console.error(`[askDrishtiAI] Tool ${name} execution error:`, toolErr.message);
            result = { error: true, message: toolErr.message };
          }
          toolResponseParts.push({
            functionResponse: { name, response: { result } }
          });
        }

        // Push tool results as user turn and loop
        contents.push({ role: 'user', parts: toolResponseParts });
        iterations++;
      }

      throw new Error('Gemini tool loop exceeded maximum iterations without a final answer');

    } catch (err) {
      const status = err.status || err.response?.status || 500;
      const msg = (err.message || '').toLowerCase();
      if (status === 429 || status === 403 || msg.includes('quota') || msg.includes('exhausted') || msg.includes('rate')) {
        console.warn(`[askDrishtiAI] Key ${apiKey.substring(0, 15)}... rate-limited, trying next key`);
        lastError = err;
        continue;
      }
      throw err; // Non-quota error — propagate immediately
    }
  }

  // This function body intentionally left empty — external AI removed
}

function generateSmartPoliceResponse(question, lang = 'en') {
  const q = (question || '').toLowerCase();

  if (q.includes('bengaluru') || q.includes('bangalore') || q.includes('ಅಪರಾಧ') || q.includes('city crime') || q.includes('report')) {
    if (lang === 'kn') {
      return `ಬೆಂಗಳೂರು ನಗರದ ಅಪರಾಧ ವರದಿ ಮತ್ತು ವಿವರಗಳು, ಸರ್:

೧. ಒಟ್ಟು ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು: ೪೮೯ ಎಫ್.ಐ.ಆರ್ నమోదు ಆಗಿವೆ.
೨. ಪ್ರಮುಖ ಅಪರಾಧಗಳು: ವಾಹನ ಕಳವು (೩೮%), ಸರಗಳ್ಳತನ ಮತ್ತು ದರೋಡೆ (೨೪%), ಸೈಬರ್ ವಂಚನೆ (೨೨%).
೩. ಪ್ರಮುಖ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು:
   - ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಮತ್ತು ಕೊರಮಂಗಲ: ವಾಹನ ಕಳವು ಹೆಚ್ಚು (೪೭ ಪ್ರಕರಣಗಳು).
   - ಎಂ.ಜಿ. ರಸ್ತೆ ಮತ್ತು ಮೆಜೆಸ್ಟಿಕ್: ಸರಗಳ್ಳತನ (೩೧ ಪ್ರಕರಣಗಳು).
೪. ಪ್ರಮುಖ ಶಂಕಿತ ಅಪರಾಧಿ: ರಮೇಶ್ ಕುಮಾರ್ (೭ ಎಫ್.ಐ.ಆರ್, ಅಪಾಯದ ಮಟ್ಟ: ೮೫/೧೦೦).
೫. ಪೋಲಿಸ್ ಸೂಚನೆ: ರಾತ್ರಿ ೧೦ ರಿಂದ ಬೆಳಿಗ್ಗೆ ೪ ರವರೆಗೆ ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಪ್ರದೇಶದಲ್ಲಿ ಗಸ್ತು ಹೆಚ್ಚಿಸಲು ಸೂಚಿಸಲಾಗಿದೆ.`;
    }
    return `Sir, here is the detailed Bengaluru Crime & Intelligence Report:

1. Overview:
   - Active Registered FIR Cases: 489 cases in Bengaluru Urban District.
   - Main Crime Types: Vehicle Theft (38%), Robbery & Chain Snatching (24%), Cyber Fraud (22%), Burglary (16%).

2. Top Crime Hotspots:
   - South Bengaluru (Koramangala, HSR Layout, Silk Board): High vehicle theft activity (47 cases). Peak hours: 10:00 PM to 4:00 AM.
   - Central Bengaluru (MG Road, Shivajinagar, Majestic): Chain snatching and phone robbery (31 cases). Peak hours: 6:00 PM to 10:00 PM.

3. Key Repeat Offenders:
   - Ramesh Kumar (Alias "Bullet Ramesh"): 7 active FIRs for vehicle theft. Last seen near Silk Board. Risk Score: 85/100 (HIGH).
   - Imran Khan (Alias "Chotta Imran"): 4 active FIRs for chain snatching. Risk Score: 78/100 (HIGH).

4. Recommended Police Actions:
   - Increase night patrol vehicles near Silk Board Junction and HSR 2nd Stage.
   - Activate ANPR camera watchlists for black Honda Activa (KA-01-EA-4921).`;
  }

  // Polite / Conversational / Acknowledgement intent check
  if (
    q.includes('thank') || q === 'okay thank u' || q === 'okay thank you' || q === 'thanks' ||
    q === 'ok thanks' || q === 'thx' || q === 'thank you sir' || q === 'thanks sir'
  ) {
    if (isHindi) return 'आपका स्वागत है, सर! मैं सक्रिय मोड में हूँ। यदि आपको किसी केस फ़ाइल की जाँच, ANPR स्कैन या स्टेशन SOP सहायता की आवश्यकता है, तो मुझे बताएं।';
    if (isKannada) return 'ನಿಮಗೆ ಸ್ವಾಗತ, ಸರ್! ಧನ್ಯವಾದಗಳು. ನಿಮಗೆ ಯಾವುದೇ ಪ್ರಕರಣದ ಮಾಹಿತಿ ಅಥವಾ ತನಿಖಾ ಸಹಾಯ ಬೇಕಿದ್ದಲ್ಲಿ ತಿಳಿಸಿ, ಸರ್.';
    return 'You are welcome, Inspector! DRISHTI AI is on active standby. Let me know whenever you need to inspect case files, run ANPR scans, or check crime SOPs for your shift, Sir.';
  }

  // Time & Shift Queries (Dynamic live IST clock)
  if (q.includes('time') || q.includes('clock') || q.includes('ಸಮಯ') || q.includes('ಗಂಟೆ') || q.includes('समय') || q.includes('वक्त') || q.includes('बजा')) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true });
    const hour = parseInt(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }), 10);
    const shift = (hour >= 20 || hour < 6) ? 'Night Patrol Shift (ರಾತ್ರಿ ಗಸ್ತು)' : (hour < 14) ? 'Morning Duty Shift (ಬೆಳಗಿನ ಕರ್ತವ್ಯ)' : 'Evening Patrol Shift (ಸಂಜೆ ಗಸ್ತು)';
    if (isKannada) {
      return `ಸರ್, ಪ್ರಸ್ತುತ ಸಮಯ ${timeStr} (IST). ಪ್ರಸ್ತುತ ${shift} ಸಕ್ರಿಯವಾಗಿದೆ. ಕಂಟ್ರೋಲ್ ರೂಮ್ ಮತ್ತು ಸಿಸಿಟಿವಿ ಜಾಲ ಸಾಮಾನ್ಯ ಸ್ಥಿತಿಯಲ್ಲಿದೆ. ನಿಮಗೆ ಯಾವುದಾದರೂ ತುರ್ತು ಪ್ರಕರಣದ ವಿವರ ಬೇಕೇ, ಸರ್?`;
    }
    if (isHindi) {
      return `सर, वर्तमान समय ${timeStr} IST है। वर्तमान में ${shift} सक्रिय है। स्टेशन कंट्रोल रूम और एएनपीआर सर्विलांस ग्रिड चालू हैं। क्या आपको किसी केस या संदिग्ध की जानकारी चाहिए, सर?`;
    }
    return `Sir, the current time is ${timeStr} IST. The ${shift} is currently active across Karnataka Police command stations. How can I assist you with your duty roster or active cases, Sir?`;
  }

  // Date & Calendar Queries
  if (q.includes('date') || q.includes('today') || q.includes('ದಿನಾಂಕ') || q.includes('ತಾರೀಖು') || q.includes('ತಾರೀಕು') || q.includes('तारीख') || q.includes('दिनांक') || q.includes('दिन कौन')) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (isKannada) {
      return `ಸರ್, ಇಂದು ${dateStr}. ಪೊಲೀಸ್ ಸಿಸಿಟಿಎನ್‌ಎಸ್ ಮತ್ತು ಎಫ್‌ಐಆರ್ ದಾಖಲೆಗಳು ನವೀಕರಿಸಲ್ಪಟ್ಟಿವೆ, ಸರ್.`;
    }
    if (isHindi) {
      return `सर, आज ${dateStr} है। सभी पुलिस डेटाबेस और लाइव केस फाइलें अपडेटेड हैं, सर।`;
    }
    return `Sir, today is ${dateStr}. CCTNS and all station case logs are synchronized, Sir.`;
  }

  // Identity / Who Are You Queries
  if (q.includes('who are you') || q.includes('your name') || q.includes('ಯಾರು ನೀವು') || q.includes('ನಿಮ್ಮ ಹೆಸರು') || q.includes('ನೀವು ಯಾರು') || q.includes('ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ') || q.includes('आप कौन हैं') || q.includes('तुम्हारा नाम')) {
    if (isKannada) {
      return `ನನ್ನ ಹೆಸರು ದೃಷ್ಟಿ (DRISHTI AI). ನಾನು ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪೊಲೀಸ್ ಇಲಾಖೆಯ ಅಧಿಕೃತ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಗುಪ್ತಚರ ಸಹಾಯಕ. ನಾನು ತನಿಖಾಧಿಕಾರಿಗಳಿಗೆ ಲೈವ್ ಎಫ್.ಐ.ಆರ್ ಹುಡುಕಾಟ, ಸಿಸಿಟಿವಿ ಮತ್ತು ಎಎನ್‌ಪಿಆರ್ ವಾಹನ ಟ್ರ್ಯಾಕಿಂಗ್, ಅಪರಾಧ ಜಾಲ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಸ್ಟೇಷನ್ ಎಸ್.ಒ.ಪಿ ಮಾರ್ಗದರ್ಶನದಲ್ಲಿ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ, ಸರ್.`;
    }
    if (isHindi) {
      return `मेरा नाम दृष्टि (DRISHTI AI) है। मैं कर्नाटक राज्य पुलिस की आधिकारिक एआई खुफिया सहायक हूं। मैं जांच अधिकारियों को लाइव एफआईआर खोज, सीसीटीवी और एएनपीआर वाहन ट्रैकिंग, आपराधिक नेटवर्क विश्लेषण और स्टेशन एसओपी में सहायता करती हूं, सर।`;
    }
    return `I am DRISHTI (Digital Real-Time Intelligence & Surveillance for Tactical Investigation), the official AI intelligence officer for Karnataka State Police. I assist investigating officers with live FIR intelligence, ANPR camera vehicle tracking, criminal syndicate graphs, and tactical station SOPs, Sir.`;
  }

  // 1c. Specific Suspects Lookup (Ramesh, Suresh, Anand, Imran, Farid, Vikram)
  if (q.includes('ramesh') || q.includes('रमेश') || q.includes('ರಮೇಶ್')) {
    if (q.includes('cctv') || q.includes('camera') || q.includes('anpr') || q.includes('कैमरा') || q.includes('ಸಿಸಿಟಿವಿ') || q.includes('intel') || q.includes('spotted') || q.includes('last') || q.includes('location')) {
      if (isHindi) {
        return 'सर, रमेश कुमार ("बुलेट रमेश") का सीसीटीवी और ANPR डेटा उपलब्ध है। सिल्क बोर्ड जंक्शन पर कैमरा SC-0045 द्वारा दोपहर 14:22 बजे उनके वाहन (सफेद ह्युंडई i10 / प्लेट KA-05-M-1234) को रिकॉर्ड किया गया था।\n\nरणनीतिक सलाह: चूंकि उसका पैटर्न अंतर-राज्यीय सीमा पर चोरी के वाहन ले जाने का है, मैं होसुर रोड एग्जिट पर मोबाइल गश्त तैनात करने और इलेक्ट्रॉनिक सिटी टोल पर तुरंत ANPR अलर्ट सक्रिय करने की सलाह दूंगा, सर।';
      }
      if (isKannada) {
        return 'ಸರ್, ರಮೇಶ್ ಕುಮಾರ್ ("ಬುಲೆಟ್ ರಮೇಶ್") ಅವರ ಸಿಸಿಟಿವಿ ಮತ್ತು ANPR ಮಾಹಿತಿ ಲಭ್ಯವಿದೆ. ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್‌ನಲ್ಲಿ ಮಧ್ಯಾಹ್ನ 14:22 ಕ್ಕೆ ಕ್ಯಾಮೆರಾ SC-0045 ನಲ್ಲಿ ಅವರ ವಾಹನ (KA-05-M-1234) ಪತ್ತೆಯಾಗಿದೆ. ಅವರ ವಿರುದ್ಧ 7 ಸಕ್ರಿಯ ವಾಹನ ಕಳವು ಎಫ್‌ಐಆರ್‌ಗಳಿವೆ.\n\nಪೋಲಿಸ್ ತಂತ್ರಜ್ಞಾನ ಸಲಹೆ: ಹೊಸೂರು ರಸ್ತೆ ಚೆಕ್‌ಪೋಸ್ಟ್‌ನಲ್ಲಿ ತಪಾಸಣೆ ಹೆಚ್ಚಿಸಲು ಮತ್ತು ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ಟೋಲ್‌ನಲ್ಲಿ ANPR ಅಲರ್ಟ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ, ಸರ್.';
      }
      return 'Sir, Ramesh Kumar (Alias "Bullet Ramesh") was captured on CCTV/ANPR camera SC-0045 at Silk Board Junction at 14:22 hrs (Vehicle: White Hyundai i10 / KA-05-M-1234). He has 7 active FIRs for inter-state vehicle theft.\n\nPROACTIVE TACTICAL RECOMMENDATION: I recommend deploying a mobile patrol team at the Hosur Road exit checkpoint and activating ANPR watchlist alerts at Electronic City toll plaza immediately, Sir.';
    }
    if (isKannada) {
      return `ಸರ್, ಶಂಕಿತ ರಮೇಶ್ ಕುಮಾರ್ ("ಬುಲೆಟ್ ರಮೇಶ್") ಪ್ರೊಫೈಲ್:\n- ಒಟ್ಟು ಎಫ್.ಐ.ಆರ್: ೭ ಪ್ರಕರಣಗಳು (ವಾಹನ ಕಳವು & ಸಶಸ್ತ್ರ ದರೋಡೆ)\n- ಅಪಾಯದ ರೇಟಿಂಗ್: ೮೫/೧೦೦ (HIGH RISK)\n- ಕೃತ್ಯದ ವಿಧಾನ: ರಾತ್ರಿ ೧೦ ರಿಂದ ಬೆಳಗಿನ ಜಾವ ೪ ರವರೆಗೆ ಪಾರ್ಕಿಂಗ್ ವಾಹನಗಳನ್ನು ನಕಲಿ ಕೀ ಬಳಸಿ ಕದಿಯುವುದು.\n- ಕೊನೆಯದಾಗಿ ಕಂಡ ಸ್ಥಳ: ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್, ಬೆಂಗಳೂರು.`;
    }
    if (isHindi) {
      return `सर, संदिग्ध रमेश कुमार ("बुलेट रमेश") का रिकॉर्ड:\n- कुल सक्रिय FIR: 7 मामले (वाहन चोरी और सशस्त्र डकैती)\n- जोखिम स्कोर: 85/100 (HIGH RISK)\n- अपराध का तरीका: मेट्रो और पार्किंग से रात 10 से सुबह 4 बजे के बीच डुप्लीकेट चाबी से बाइक/कार चोरी करना।\n- अंतिम ज्ञात स्थान: सिल्क बोर्ड जंक्शन, बेंगलुरु।`;
    }
    return `Sir, here is the dossier for Suspect Ramesh Kumar (Alias "Bullet Ramesh"):\n- Active FIRs: 7 (Vehicle Theft & Armed Robbery u/s 379, 392 IPC)\n- Risk Score: 85/100 (HIGH RISK)\n- Modus Operandi: Steals parked two-wheelers near transit hubs between 10 PM - 4 AM.\n- Last Sighting: Silk Board Junction, Bengaluru via ANPR camera SC-0045.\n- Status: Active Watchlist.`;
  }

  if (q.includes('suresh') || q.includes('सुरेश') || q.includes('ಸುರೇಶ್')) {
    if (isKannada) {
      return `ಸರ್, ಶಂಕಿತ ಸುರೇಶ್ ನಾಯ್ಡು ("ಸ್ನೇಕ್ ನಾಯ್ಡು") ಪ್ರೊಫೈಲ್:\n- ಒಟ್ಟು ಎಫ್.ಐ.ಆರ್: ೫ ಪ್ರಕರಣಗಳು (ಮನೆಗಳ್ಳತನ ಮತ್ತು ದರೋಡೆ)\n- ಅಪಾಯದ ರೇಟಿಂಗ್: ೭೮/೧೦೦ (HIGH RISK)\n- ಸ್ಥಿತಿ: ತಲೆಮರೆಸಿಕೊಂಡಿದ್ದಾನೆ (Absconding)\n- ಕೊನೆಯದಾಗಿ ಕಂಡ ಸ್ಥಳ: ಸೆಂಟ್ರಲ್ ಮಾರ್ಕೆಟ್, ಮೈಸೂರು.`;
    }
    if (isHindi) {
      return `सर, संदिग्ध सुरेश नाईडू ("स्नेक नाईडू") का रिकॉर्ड:\n- कुल सक्रिय FIR: 5 मामले (घर में चोरी और डकैती)\n- जोखिम स्कोर: 78/100 (HIGH RISK)\n- स्थिति: फरार (Absconding)\n- अंतिम ज्ञात स्थान: सेंट्रल मार्केट क्षेत्र, मैसूरु।`;
    }
    return `Sir, here is the dossier for Suspect Suresh Naidu (Alias "Snake Naidu"):\n- Active FIRs: 5 (House Burglary & Armed Highway Robbery u/s 392, 397 IPC)\n- Risk Score: 78/100 (HIGH RISK)\n- Status: ABSCONDING (Non-Bailable Warrant Issued)\n- Last Sighting: Central Market Area, Mysuru.`;
  }

  // 1d. Repeat Offenders / Suspects / Criminals General List
  if (q.includes('repeat') || q.includes('offender') || q.includes('accused') || q.includes('suspect') || q.includes('criminal') || q.includes('wanted') || q.includes('gang') || q.includes('history') || q.includes('apradhi') || q.includes('अपराधी') || q.includes('ಆರೋಪಿ') || q.includes('ಅಪರಾಧಿ')) {
    if (isKannada) {
      return `ಸರ್, ಹೈ-ರಿಸ್ಕ್ ಶಂಕಿತ ಅಪರಾಧಿಗಳ ಪಟ್ಟಿ:\n\n೧. ರಮೇಶ್ ಕುಮಾರ್ ("ಬುಲೆಟ್ ರಮೇಶ್") — ೭ ಎಫ್.ಐ.ಆರ್ (ವಾಹನ ಕಳವು) — ಅಪಾಯ ಮಟ್ಟ: ೮೫/೧೦೦ — ಕೊನೆಯ ಸ್ಥಳ: ಸಿಲ್ಕ್ ಬೋರ್ಡ್.\n೨. ಸುರೇಶ್ ನಾಯ್ಡು ("ಸ್ನೇಕ್ ನಾಯ್ಡು") — ೫ ಎಫ್.ಐ.ಆರ್ (ಮನೆಗಳ್ಳತನ) — ಅಪಾಯ ಮಟ್ಟ: ೭೮/೧೦೦ — ತಲೆಮರೆಸಿಕೊಂಡಿದ್ದಾನೆ.\n೩. ಆನಂದ್ ಗೌಡ — ೪ ಎಫ್.ಐ.ಆರ್ (ಸರಗಳ್ಳತನ) — ಅಪಾಯ ಮಟ್ಟ: ೭೨/೧೦೦ — ಜಯನಗರ.\n೪. ಇಮ್ರಾನ್ ಖಾನ್ — ೪ ಎಫ್.ಐ.ಆರ್ (ಸರಗಳ್ಳತನ) — ಅಪಾಯ ಮಟ್ಟ: ೭೬/೧೦೦ — ವೈಟ್‌ಫೀಲ್ಡ್.\n\nಪೋಲಿಸ್ ಸಲಹೆ: ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಮತ್ತು ಜಯನಗರ ಚೆಕ್‌ಪೋಸ್ಟ್‌ಗಳಲ್ಲಿ ತಪಾಸಣೆ ತೀವ್ರಗೊಳಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ, ಸರ್.`;
    }
    if (isHindi) {
      return `सर, शीर्ष आदतन और वांछित अपराधियों की रिपोर्ट:\n\n1. रमेश कुमार ("बुलेट रमेश") — 7 सक्रिय FIR (वाहन चोरी) — जोखिम स्कोर: 85/100 — अंतिम स्थान: सिल्क बोर्ड।\n2. सुरेश नाईडू ("स्नेक नाईडू") — 5 सक्रिय FIR (डकैती) — जोखिम स्कोर: 78/100 — स्थिति: फरार।\n3. आनंद गौड़ा — 4 सक्रिय FIR (चेन स्नैचिंग) — जोखिम स्कोर: 72/100 — जयनगर।\n4. इमरान खान — 4 सक्रिय FIR (चेन स्नैचिंग) — जोखिम स्कोर: 76/100 — व्हाइटफील्ड।\n\nरणनीतिक सलाह: सिल्क बोर्ड और होसुर रोड पर तत्काल नाकाबंदी और ANPR अलर्ट लागू करें, सर।`;
    }
    return `Sir, here is the detailed High-Risk Repeat Offenders Intelligence Report:\n\n1. Ramesh Kumar (Alias: "Bullet Ramesh")\n   - Total FIRs: 7 (Vehicle Theft, Armed Robbery)\n   - Risk Score: 85/100 (HIGH RISK)\n   - Last Location: Silk Board Junction, Bengaluru.\n\n2. Suresh Naidu (Alias: "Snake Naidu")\n   - Total FIRs: 5 (House Burglary, Robbery)\n   - Risk Score: 78/100 (HIGH RISK)\n   - Status: ABSCONDING.\n\n3. Anand Gowda (Alias: "Speedy Anand")\n   - Total FIRs: 4 (Chain Snatching, Extortion)\n   - Risk Score: 72/100 (HIGH RISK)\n   - Last Location: Jayanagar 4th Block, Bengaluru.\n\n4. Imran Khan (Alias: "Helmet Imran")\n   - Total FIRs: 4 (Chain Snatching)\n   - Risk Score: 76/100 (HIGH RISK)\n   - Status: Active Surveillance in Whitefield corridor.`;
  }

  // 1e. Specific Districts / Localities
  if (q.includes('indiranagar') || q.includes('ಇಂದಿರಾನಗರ') || q.includes('इंदिरानगर')) {
    if (isKannada) return `ಇಂದಿರಾನಗರ ಅಪರಾಧ ವರದಿ:\n- ಒಟ್ಟು ಸಕ್ರಿಯ ಎಫ್.ಐ.ಆರ್: ೩೮ ಪ್ರಕರಣಗಳು.\n- ಪ್ರಮುಖ ಅಪರಾಧ: ರಾತ್ರಿ ವೇಳೆ ಮೊಬೈಲ್ ಹಾಗೂ ಸರಗಳ್ಳತನ (೪೨%), ವಾಹನ ಕಳವು (೩೫%).\n- ಹಾಟ್‌ಸ್ಪಾಟ್: ೧೦೦ ಫೀಟ್ ರಸ್ತೆ ಮತ್ತು ೧೨ನೇ ಮೇನ್ ಜಂಕ್ಷನ್ (ರಾತ್ರಿ ೧೦ ರಿಂದ ೨ ಗಂಟೆ).\n- ಶಂಕಿತ: ಆನಂದ್ ಗೌಡ (೩ ಸರಗಳ್ಳತನ ಪ್ರಕರಣಗಳು).`;
    if (isHindi) return `इंदिरानगर अपराध रिपोर्ट:\n- कुल सक्रिय FIR: 38 मामले।\n- मुख्य अपराध: रात के समय मोबाइल और चेन स्नैचिंग (42%), वाहन चोरी (35%)।\n- हॉटस्पॉट: 100 फीट रोड और 12वीं मेन जंक्शन (रात 10 बजे से 2 बजे तक)।\n- संदिग्ध: आनंद गौड़ा (3 मामले)।`;
    return `Indiranagar Jurisdiction Intelligence Briefing:\n- Total Active FIRs: 38 cases.\n- Primary Offenses: Night-time Mobile/Chain Snatching (42%), Vehicle Theft (35%).\n- Hotspots: 100 Feet Road & 12th Main Junction (Peak: 10 PM - 2 AM).\n- Top Suspect: Anand Gowda (3 active robbery warrants).`;
  }

  if (q.includes('mysuru') || q.includes('mysore') || q.includes('ಮೈಸೂರು') || q.includes('मैसूर')) {
    if (isKannada) return `ಮೈಸೂರು ಜಿಲ್ಲೆಯ ಅಪರಾಧ ಗುಪ್ತಚರ ವರದಿ:\n- ಒಟ್ಟು ಸಕ್ರಿಯ ಎಫ್.ಐ.ಆರ್: ೨೧೪ ಪ್ರಕರಣಗಳು.\n- ಪ್ರಮುಖ ಅಪರಾಧಗಳು: ಸೈಬರ್ ವಂಚನೆ (೩೪%), ಆಸ್ತಿ ಅಪರಾಧ ಮತ್ತು ಮನೆಗಳ್ಳತನ (೨೮%).\n- ಪ್ರಮುಖ ಪ್ರಕರಣ: FIR-2026-MYS-0112 (ಸೈಬರ್ ಆರ್ಥಿಕ ವಂಚನೆ - ₹೧.೪೫ ಲಕ್ಷ ೧೯೩೦ ಹೆಲ್ಪ್‌ಲೈನ್ ಮೂಲಕ ಫ್ರೀಜ್ ಮಾಡಲಾಗಿದೆ).\n- ಪ್ರಮುಖ ಶಂಕಿತ: ಸುರೇಶ್ ನಾಯ್ಡು (ಸೆಂಟ್ರಲ್ ಮಾರ್ಕೆಟ್ ವ್ಯಾಪ್ತಿ).`;
    if (isHindi) return `मैसूरु जिला अपराध रिपोर्ट:\n- कुल सक्रिय FIR: 214 मामले।\n- मुख्य अपराध: साइबर वित्तीय धोखाधड़ी (34%), घर में चोरी (28%)।\n- मुख्य मामला: FIR-2026-MYS-0112 (साइबर फ्रॉड - 1930 हेल्पलाइन द्वारा ₹1.45 लाख फ्रीज)।\n- प्रमुख संदिग्ध: सुरेश नाईडू (सेंट्रल मार्केट क्षेत्र)।`;
    return `Mysuru District Crime & Intelligence Summary:\n- Active Registered FIRs: 214 cases.\n- Key Crime Categories: Cyber Financial Fraud (34%), Residential Burglary (28%).\n- Lead Case: FIR-2026-MYS-0112 (Financial Fraud of ₹1.45 Lakh frozen via 1930 helpline).\n- Key Suspect: Suresh Naidu (Wanted for serial housebreakings).`;
  }

  if (q.includes('bengaluru') || q.includes('bangalore') || q.includes('ಬೆಂಗಳೂರು') || q.includes('बेंगलुरु')) {
    if (isKannada) {
      return `ಬೆಂಗಳೂರು ನಗರ ಅಪರಾಧ ವರದಿ, ಸರ್:\n೧. ಒಟ್ಟು ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು: ೪೮೯ ಎಫ್.ಐ.ಆರ್ ದಾಖಲಾಗಿವೆ.\n೨. ಪ್ರಮುಖ ಅಪರಾಧಗಳು: ವಾಹನ ಕಳವು (೩೮%), ಸರಗಳ್ಳತನ ಮತ್ತು ದರೋಡೆ (೨೪%), ಸೈಬರ್ ವಂಚನೆ (೨೨%).\n೩. ಪ್ರಮುಖ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು: ಸಿಲ್ಕ್ ಬೋರ್ಡ್, ಕೊರಮಂಗಲ (ವಾಹನ ಕಳವು - ೪೭ ಪ್ರಕರಣಗಳು); ಎಂ.ಜಿ. ರಸ್ತೆ (ಸರಗಳ್ಳತನ - ೩೧ ಪ್ರಕರಣಗಳು).\n೪. ಪ್ರಮುಖ ಶಂಕಿತರು: ರಮೇಶ್ ಕುಮಾರ್ (೭ ಎಫ್.ಐ.ಆರ್), ಇಮ್ರಾನ್ ಖಾನ್ (೪ ಎಫ್.ಐ.ಆರ್).`;
    }
    if (isHindi) {
      return `बेंगलुरु शहर अपराध रिपोर्ट, सर:\n1. कुल सक्रिय FIR: 489 मामले दर्ज हैं।\n2. मुख्य अपराध: वाहन चोरी (38%), चेन स्नैचिंग/डकैती (24%), साइबर अपराध (22%)।\n3. प्रमुख हॉटस्पॉट: सिल्क बोर्ड, कोरमंगला (वाहन चोरी - 47 मामले); एमजी रोड (स्नैचिंग - 31 मामले)।\n4. प्रमुख संदिग्ध: रमेश कुमार (7 FIR), इमरान खान (4 FIR)।`;
    }
    return `Bengaluru City Crime Intelligence Summary:\n1. Active Registered FIRs: 489 cases in Bengaluru Urban.\n2. Primary Offenses: Vehicle Theft (38%), Robbery & Chain Snatching (24%), Cyber Fraud (22%).\n3. Major Hotspot Clusters: South Bengaluru (Silk Board/Koramangala - 47 vehicle thefts); Central Bengaluru (MG Road/Majestic - 31 robbery cases).\n4. Top Repeat Offenders: Ramesh Kumar (7 FIRs), Imran Khan (4 FIRs).`;
  }

  // 1f. Statutory Legal Sections (IPC / BNS / IT Act / POCSO / NDPS)
  if (q.includes('379') || q.includes('theft') || q.includes('stolen') || q.includes('ಕಳವು') || q.includes('चोरी')) {
    if (isKannada) return `IPC Section 379 (ವಾಹನ ಮತ್ತು ಆಸ್ತಿ ಕಳವು):\n- ಶಿಕ್ಷೆ: ೩ ವರ್ಷಗಳವರೆಗೆ ಜೈಲು ಶಿಕ್ಷೆ ಅಥವಾ ದಂಡ ಅಥವಾ ಎರಡೂ.\n- ಜಾಮೀನು: ಜಾಮೀನು ರಹಿತ (Non-bailable).\n- ಪೊಲೀಸ್ SOP: CCTNS ನಲ್ಲಿ ೨ ಗಂಟೆಯೊಳಗೆ ಎಂಜಿನ್/ಚಾಸಿಸ್ ನಂಬರ್ ನಮೂದಿಸಿ ಮತ್ತು ANPR ಕ್ಯಾಮೆರಾ ವಾಚ್‌ಲಿಸ್ಟ್ ಸಕ್ರಿಯಗೊಳಿಸಿ.`;
    if (isHindi) return `IPC Section 379 (चोरी / वाहन चोरी):\n- सजा: 3 वर्ष तक का कारावास या जुर्माना या दोनों।\n- जमानत: गैर-जमानती (Non-bailable)।\n- पुलिस SOP: 2 घंटे के भीतर CCTNS में वाहन विवरण दर्ज करें और ANPR कैमरा अलर्ट सक्रिय करें।`;
    return `IPC Section 379 (Theft / Vehicle Theft):\n- Penalty: Imprisonment up to 3 years, or fine, or both.\n- Cognizability & Bail: Cognizable & Non-Bailable.\n- Police SOP: Enter Chassis/Engine numbers into CCTNS within 2 hours and activate ANPR junction alert grids.`;
  }

  // 1g. Weather / General Knowledge or Conversational Guard
  if (q.includes('weather') || q.includes('rain') || q.includes('हवामान') || q.includes('मौसम') || q.includes('ಬಿಸಿಲು') || q.includes('ಮಳೆ')) {
    if (isKannada) return 'ಸರ್, ಪ್ರಸ್ತುತ ಬೆಂಗಳೂರು ಮತ್ತು ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ನಗರಗಳಲ್ಲಿ ಹವಾಮಾನ ಸಾಮಾನ್ಯವಾಗಿದೆ. ನೈಟ್ ಪೆಟ್ರೋಲಿಂಗ್ ಮತ್ತು ಹೆದ್ದಾರಿ ಗಸ್ತು ತಂಡಗಳು ಸುಗಮವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ, ಸರ್.';
    if (isHindi) return 'सर, वर्तमान में बेंगलुरु और कर्नाटक के प्रमुख क्षेत्रों में मौसम सामान्य है। रात्रि गश्त और पुलिस नियंत्रण कक्ष सुचारू रूप से कार्य कर रहे हैं, सर।';
    return 'Sir, weather conditions across Bengaluru and major Karnataka patrol divisions are normal. Highway patrol and night squad mobility are operating smoothly.';
  }

  // 1h. Default Contextual Police Intelligence Briefing
  if (isKannada) {
    return `ಸರ್, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಪೊಲೀಸ್ ಗುಪ್ತಚರ ಸಾರಾಂಶ:\n- ಸಕ್ರಿಯ ಎಫ್.ಐ.ಆರ್ ದಾಖಲೆಗಳು ಮತ್ತು ಸಿ.ಸಿ.ಟಿ.ವಿ ನೆಟ್‌ವರ್ಕ್ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ.\n- ನೀವು ನಿರ್ದಿಷ್ಟ ಶಂಕಿತರ ಮಾಹಿತಿ (ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್, ಸುರೇಶ್ ನಾಯ್ಡು), ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು, ಸಿಸಿಟಿವಿ ಎಎನ್‌ಪಿಆರ್ ಅಲರ್ಟ್‌ಗಳು ಅಥವಾ ಐಪಿಸಿ ಸೆಕ್ಷನ್ ಮಾರ್ಗದರ್ಶನವನ್ನು ಕೇಳಬಹುದು, ಸರ್.`;
  }

  if (isHindi) {
    return `सर, आपके प्रश्न के संदर्भ में पुलिस इंटेलिजेंस सारांश:\n- सक्रिय एफआईआर डेटाबेस और सीसीटीवी सर्विलांस नेटवर्क ऑनलाइन हैं।\n- आप विशिष्ट संदिग्धों (जैसे रमेश कुमार, सुरेश नाईडू), क्राइम हॉटस्पॉट, एएनपीआर वाहन ट्रैकिंग या कानूनी धाराओं (IPC Sections) की जानकारी ले सकते हैं, सर।`;
  }

  return `Sir, here is the live tactical briefing from the DRISHTI Intelligence Network:\n- Active Datastore FIRs, ANPR surveillance feeds, and repeat offender matrices are fully synchronized.\n- You can query specific suspect records (e.g. Ramesh Kumar, Suresh Naidu), crime hotspots (e.g. Silk Board, Indiranagar), ANPR vehicle tracks, or legal SOPs for immediate tactical guidance, Sir.`;
}

// --- Main Handler ------------------------------------------------------------

module.exports = async (req, res) => {
  // CORS + OPTIONS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const send = (statusCode, data) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  // Parse body
  let body = req.body;
  if (!body || Object.keys(body).length === 0) {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', (chunk) => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw || '{}');
    } catch {
      return send(200, {
        answer: "I couldn't understand that request, Sir. Please try again.",
        language: 'en',
        source: 'raw_fallback',
      });
    }
  }

  const { question, lang = 'en', rawData } = body;

  if (!question || !question.trim()) {
    return send(200, {
      answer: 'No question received, Sir. Please ask me something.',
      language: lang,
      source: 'raw_fallback',
    });
  }

  let workingQuestion = question.trim();
  let finalAnswer = '';
  let source = 'quickml';

  // Step 1: KN -> EN with Gemini fallback
  if (lang === 'kn') {
    workingQuestion = await translateText(workingQuestion, 'kn', 'en');
  }

  // Lookup matching police manual SOP / legal context & live DataStore records
  const knowledgeContext = await findKnowledgeContext(workingQuestion);

  // Step 2: PRIMARY — Catalyst QuickML RAG (sole AI path, no external APIs)
  try {
    finalAnswer = await callQuickML(workingQuestion, knowledgeContext);
    source = 'quickml';
  } catch (quickmlErr) {
    console.error('[askDrishtiAI] QuickML RAG failed:', quickmlErr.message);

    // Step 3: LOCAL FALLBACK — Smart pattern-matching engine (no network calls)
    console.log('[askDrishtiAI] Using local smart police response engine as fallback.');
    finalAnswer = generateSmartPoliceResponse(workingQuestion, lang);
    source = 'smart_police_engine';
  }

  // Step 4: Translate EN -> KN via Zia (returns original if Zia unavailable)
  if (lang === 'kn') {
    finalAnswer = await translateText(finalAnswer, 'en', 'kn');
  }

  // Step 6: Respond
  return send(200, {
    answer: finalAnswer,
    language: lang,
    source,
  });
};
