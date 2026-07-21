/**
 * askDrishtiAI — Catalyst AdvancedIO Function
 *
 * POST body: { question: string, lang: "en"|"kn", rawData?: object }
 *
 * Flow:
 *  1. If lang==="kn", translate question -> English (Zia)
 *  2. PRIMARY: QuickML RAG endpoint (GLM-4.7-Flash, 6 s timeout)
 *     NOTE: QuickML does NOT support OpenAI-style tools/function-calling.
 *     Primary path remains pure text-RAG — confirmed 2026-07-21.
 *  3. FALLBACK: Gemini REST API with 9 live-data tool declarations.
 *     Gemini can call fetch_hotspots, fetch_trends, fetch_firs,
 *     fetch_repeat_offenders, fetch_cameras_nearby, fetch_trail,
 *     fetch_anpr_check, fetch_network_graph, search_police_manuals.
 *     Tool logic ported from functions/chat/index.js (now deprecated).
 *  4. LAST-RESORT: stringify rawData OR apology string
 *  5. If lang==="kn", translate final answer back -> Kannada (Zia)
 *  6. Return { answer, language, source }
 *
 * NEVER returns 500 or an empty body — this feeds live voice output.
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
        Environment: 'Development',
      },
      timeout: 5000,
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

async function translateWithGemini(text, sourceLang, targetLang) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return text;
  const targetName = targetLang === 'kn' ? 'Kannada' : targetLang === 'hi' ? 'Hindi' : 'English';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  try {
    const response = await axios.post(
      url,
      {
        contents: [{ role: 'user', parts: [{ text: `Translate the following text to ${targetName}. Return ONLY the translated text without explanations or quotes:\n\n${text}` }] }],
        generationConfig: { maxOutputTokens: 512, temperature: 0.1 },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
    );
    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || text;
  } catch {
    return text;
  }
}

async function translateText(text, sourceLang, targetLang) {
  if (!text || sourceLang === targetLang) return text;
  try {
    const res = await translateWithZia(text, sourceLang, targetLang);
    if (res && res !== text) return res;
  } catch (e) {
    console.warn('[askDrishtiAI] Zia translate failed, using Gemini fallback:', e.message);
  }
  return await translateWithGemini(text, sourceLang, targetLang);
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

/**
 * callGemini — plain text fallback (no tools).
 * Used when a bare text answer is sufficient (voice last-resort path).
 * Uses GEMINI_API_KEY + GEMINI_MODEL env vars.
 */
async function callGemini(question, knowledgeContext = '') {
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
async function callGeminiWithTools(question, knowledgeContext = '') {
  // Collect all configured Gemini API keys (supports up to GEMINI_API_KEY_10)
  const keys = [];
  const primaryKey = process.env.GEMINI_API_KEY;
  if (primaryKey && primaryKey !== 'PASTE_KEY_HERE') keys.push(primaryKey);
  for (let i = 1; i <= 10; i++) {
    const k = process.env[`GEMINI_API_KEY_${i}`];
    if (k && k !== 'PASTE_KEY_HERE' && !keys.includes(k)) keys.push(k);
  }
  if (!keys.length) throw new Error('No GEMINI_API_KEY configured');

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

  const systemText = 'You are DRISHTI (ದೃಷ್ಟಿ), the AI crime-intelligence assistant for Karnataka State Police. Answer factually, clearly, and thoroughly with specific legal sections (IPC/BNS/IT Act) and SOP steps when applicable. When you need live data, call the provided tools. Speak directly and concisely without Markdown formatting.';

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

  throw lastError || new Error('All Gemini API keys failed');
}

/**
 * Build a plain-text summary from rawData or return an apology string.
 */
function buildFallbackAnswer(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return (
      "I'm currently unable to reach the intelligence network, Sir. " +
      'Please try again in a moment or consult the data panel directly.'
    );
  }
  try {
    const entries = Object.entries(rawData)
      .slice(0, 5) // cap at 5 fields to keep it speakable
      .map(([k, v]) => {
        const val =
          typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v);
        return `${k}: ${val}`;
      });
    return entries.length
      ? `Here is the available data: ${entries.join('. ')}.`
      : "I'm unable to retrieve a response right now, Sir.";
  } catch {
    return "I'm unable to retrieve a response right now, Sir.";
  }
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

  // Step 2: PRIMARY — QuickML RAG (text-only, no tool calling — confirmed unsupported)
  try {
    finalAnswer = await callQuickML(workingQuestion, knowledgeContext);
    source = 'quickml';
  } catch (quickmlErr) {
    console.error('[askDrishtiAI] QuickML RAG failed:', quickmlErr.message);

    // Step 3: FALLBACK — Gemini with 9 live-data tools (wrapped in 10s timeout)
    try {
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('callGeminiWithTools timed out after 10s')), 10000)
      );
      finalAnswer = await Promise.race([
        callGeminiWithTools(workingQuestion, knowledgeContext),
        timeoutPromise
      ]);
      source = 'gemini';
    } catch (geminiErr) {
      console.error('[askDrishtiAI] Gemini with tools failed or timed out:', geminiErr.message);

      // Step 4: LAST-RESORT plain Gemini (no tools, just context)
      try {
        finalAnswer = await callGemini(workingQuestion, knowledgeContext);
        source = 'gemini_plain';
      } catch (geminiPlainErr) {
        console.error('[askDrishtiAI] Gemini plain fallback failed:', geminiPlainErr.message);
        
        // Step 5: Demo AI pattern-matching fallback before raw apology string
        try {
          const { generateAIResponseFromDemoData } = require('../../nextjs/src/lib/demo-data');
          const demoRes = generateAIResponseFromDemoData(workingQuestion);
          finalAnswer = demoRes.answer;
          source = 'demo_ai';
        } catch (demoErr) {
          console.error('[askDrishtiAI] Demo data fallback failed:', demoErr.message);
          finalAnswer = buildFallbackAnswer(rawData);
          source = 'raw_fallback';
        }
      }
    }
  }

  // Step 5: Translate EN -> KN with Gemini fallback
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
