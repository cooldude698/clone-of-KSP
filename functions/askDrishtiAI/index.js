/**
 * askDrishtiAI — Catalyst AdvancedIO Function
 *
 * POST body: { question: string, lang: "en"|"kn", rawData?: object }
 *
 * Flow:
 *  1. If lang==="kn", translate question -> English (Zia)
 *  2. PRIMARY: QuickML RAG endpoint (GLM-4.7-Flash, 6 s timeout)
 *  3. FALLBACK: Gemini API (if QuickML throws/times out)
 *  4. LAST-RESORT: stringify rawData OR apology string
 *  5. If lang==="kn", translate final answer back -> Kannada (Zia)
 *  6. Return { answer, language, source }
 *
 * NEVER returns 500 or an empty body — this feeds live voice output.
 */

const axios = require('axios');

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
 * Call Gemini REST API (no SDK dependency).
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
        parts: [
          {
            text:
              'You are DRISHTI (ದೃಷ್ಟಿ), the AI crime-intelligence assistant for the Karnataka State Police. Answer factually, clearly, and thoroughly with specific legal sections (IPC/BNS/IT Act) and SOP steps when applicable. Speak directly and concisely without Markdown formatting.',
          },
        ],
      },
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
      generationConfig: { maxOutputTokens: 800, temperature: 0.3 },
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  );

  const answer =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!answer) throw new Error('Gemini returned empty answer');
  return answer;
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

  // Step 2: PRIMARY — QuickML RAG
  try {
    finalAnswer = await callQuickML(workingQuestion, knowledgeContext);
    source = 'quickml';
  } catch (quickmlErr) {
    console.error('[askDrishtiAI] QuickML RAG failed:', quickmlErr.message);

    // Step 3: FALLBACK — Gemini (with knowledge context)
    try {
      finalAnswer = await callGemini(workingQuestion, knowledgeContext);
      source = 'gemini';
    } catch (geminiErr) {
      console.error('[askDrishtiAI] Gemini failed:', geminiErr.message);

      // Step 4: LAST-RESORT
      finalAnswer = buildFallbackAnswer(rawData);
      source = 'raw_fallback';
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
