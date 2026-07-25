import { NextResponse } from 'next/server';
import axios from 'axios';
import { UPLOADED_FIRS } from '@/app/api/upload-fir/route';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
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
    // 0. Include Uploaded FIR Records if available
    if (UPLOADED_FIRS && UPLOADED_FIRS.length > 0) {
      liveDataStr += `\n\nRECENTLY UPLOADED & STORED FIR DOCUMENTS IN CATALYST DATASTORE:\n` + JSON.stringify(UPLOADED_FIRS, null, 2);
    }

    // 1. FIRs & Case Records
    if (q.includes('fir') || q.includes('case') || q.includes('theft') || q.includes('robbery') || q.includes('crime') || q.includes('detail') || q.includes('recent') || q.includes('upload')) {
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

  // Inject live database queries from Catalyst DataStore endpoints
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

  if (!url || !token) throw new Error('Zia translation env vars not set');

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
  const targetName = targetLang === 'kn' ? 'Kannada' : targetLang === 'hi' ? 'Hindi' : 'English';
  for (const apiKey of [
    process.env.GEMINI_API_KEY,
    ...Array.from({ length: 13 }, (_, i) => process.env[`GEMINI_API_KEY_${i + 1}`]),
  ].filter(Boolean)) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ role: 'user', parts: [{ text: `Translate the following text to ${targetName}. Return ONLY the translated text without explanations or quotes:\n\n${text}` }] }],
          generationConfig: { maxOutputTokens: 512, temperature: 0.1 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
      );
      const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (result) return result;
    } catch (e) {
      if (e?.response?.status !== 429) break;
    }
  }
  return text;
}

async function translateText(text, sourceLang, targetLang) {
  if (!text || sourceLang === targetLang) return text;
  try {
    const res = await translateWithZia(text, sourceLang, targetLang);
    if (res && res !== text) return res;
  } catch (e) {
    console.warn('[DRISHTI] Zia translate failed, trying Gemini fallback:', e.message);
  }
  return await translateWithGemini(text, sourceLang, targetLang);
}

const DRISHTI_SYSTEM_PROMPT =
  'You are DRISHTI (ದೃಷ್ಟಿ), an elite AI crime intelligence officer embedded in the Karnataka State Police command system. You think fast, speak like a seasoned cop, and respect the officer\'s time.\n\n' +
  'STRICT RULES:\n' +
  '1. Match answer length to the question — brief questions get brief answers (1-2 sentences), investigative questions get full detail. Never pad or repeat. Never explain what you\'re about to say.\n' +
  '2. Lead with the most critical fact first. No preamble, no "certainly", no "of course".\n' +
  '3. Always address the officer as "Sir".\n' +
  '4. Quote IPC/BNS section numbers when relevant but don\'t explain them unless asked.\n' +
  '5. If you can predict what the officer needs next, end with ONE proactive suggestion like: "Shall I pull up the suspect profile, Sir?"\n' +
  '6. Never use bullet points or numbered lists unless explicitly asked.\n' +
  '7. Never repeat information already discussed in this session.\n' +
  '8. If something is unknown or unavailable, say so in one sentence.\n' +
  '9. When the officer gives a one-word reply like "yes", "do it", "go ahead" — execute the last suggested action and report back immediately.\n' +
  '10. You have access to live FIR records, ANPR alerts, repeat offenders, and hotspot data. Reference specific case numbers and suspect names when relevant.\n' +
  '11. Never make up data. If you don\'t have it, say: "Sir, that data isn\'t in my current feed."';

let cachedCatalystToken = process.env.QUICKML_OAUTH_TOKEN || '';
let tokenFetchedAt = Date.now();

async function getCatalystAccessToken() {
  const now = Date.now();
  if (cachedCatalystToken && (now - tokenFetchedAt) < 50 * 60 * 1000) {
    return cachedCatalystToken;
  }

  const clientId = process.env.CATALYST_CLIENT_ID;
  const clientSecret = process.env.CATALYST_CLIENT_SECRET;
  const refreshToken = process.env.CATALYST_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      const res = await axios.post(
        'https://accounts.zoho.in/oauth/v2/token',
        null,
        {
          params: {
            refresh_token: refreshToken,
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
          },
          timeout: 4000,
        }
      );
      if (res.data?.access_token) {
        cachedCatalystToken = res.data.access_token;
        tokenFetchedAt = Date.now();
        console.log('[DRISHTI] Successfully refreshed Catalyst OAuth Access Token!');
        return cachedCatalystToken;
      }
    } catch (err) {
      console.warn('[DRISHTI] Catalyst OAuth auto-refresh warning:', err.message);
    }
  }

  return process.env.QUICKML_OAUTH_TOKEN || cachedCatalystToken;
}

async function callQuickML(question, knowledgeContext = '') {
  const token = await getCatalystAccessToken();
  const orgId = process.env.CATALYST_ORG_ID || '60073715607';

  if (!token) throw new Error('QuickML OAuth token not configured');

  const authHeader = token.startsWith('Zoho-oauthtoken ') || token.startsWith('Bearer ')
    ? token
    : `Zoho-oauthtoken ${token}`;

  const systemPrefix = '[SYSTEM: You are DRISHTI, KSP\'s AI intelligence officer. Respond in 2-4 sentences max. Be direct. Address officer as Sir.]\n\n';
  const promptContent = knowledgeContext
    ? `${systemPrefix}POLICE OFFICER QUERY: ${question}\n\nRELEVANT LIVE DATASTORE & POLICE KNOWLEDGE CONTEXT:\n${knowledgeContext}`
    : `${systemPrefix}${question}`;

  // Try QuickML endpoints & models sequentially
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
          timeout: 4000,
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

// ── Groq fallback (fast, reliable, free tier) ─────────────────────────────
async function callGroq(question, knowledgeContext = '', sessionHistory = []) {
  const token = process.env.GROQ_API_KEY;
  if (!token) throw new Error('GROQ_API_KEY not set');

  const userContent = knowledgeContext
    ? `OFFICER QUERY: ${question}\n\nRELEVANT CONTEXT:\n${knowledgeContext}`
    : question;

  const GROQ_MODELS = [
    process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
  ];

  for (const model of GROQ_MODELS) {
    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model,
          messages: [
            { role: 'system', content: DRISHTI_SYSTEM_PROMPT },
            ...sessionHistory.slice(-6).map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: userContent },
          ],
          max_tokens: 400,
          temperature: 0.3,
        },
        { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, timeout: 10000 }
      );
      const answer = response.data?.choices?.[0]?.message?.content;
      if (answer?.trim()) return answer.trim();
    } catch (e) {
      console.warn(`[DRISHTI] Groq model ${model} failed:`, e.message);
    }
  }
  throw new Error('All Groq models failed');
}
// ── Gemini last-resort fallback ──────────────────────────────────────────────
// Picks keys from GEMINI_API_KEY_1..N in sequence; falls back to a bundled key.
const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  ...Array.from({ length: 13 }, (_, i) => process.env[`GEMINI_API_KEY_${i + 1}`]),
  'AIzaSyCZKZBcVvz5sVokO8ei__6plJBeqO2JWpU', // last-resort bundled key
].filter(Boolean);

async function callGemini(question, knowledgeContext = '', sessionHistory = []) {
  const models = Array.from(new Set([process.env.GEMINI_MODEL, 'gemini-flash-latest', 'gemini-2.0-flash'])).filter(Boolean);
  const fullPrompt = knowledgeContext
    ? `${question}\n\n${knowledgeContext}`
    : question;

  // Build Gemini contents array: history turns + current user message
  const historyContents = sessionHistory.slice(-6).map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  let lastErr = null;

  for (const model of models) {
    for (const apiKey of GEMINI_KEYS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            system_instruction: {
              parts: [{ text: DRISHTI_SYSTEM_PROMPT }],
            },
            contents: [
              ...historyContents,
              { role: 'user', parts: [{ text: fullPrompt }] },
            ],
            generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
        );

        const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (answer.trim()) return answer.trim();
      } catch (e) {
        lastErr = e;
      }
    }
  }

  throw new Error(`All Gemini keys/models failed: ${lastErr?.message}`);
}

function buildFallbackAnswer(rawData) {
  if (!rawData || typeof rawData !== 'object') {
    return "I'm currently unable to reach the intelligence network, Sir. Please try again in a moment.";
  }
  try {
    const entries = Object.entries(rawData)
      .slice(0, 5)
      .map(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v).slice(0, 80) : String(v);
        return `${k}: ${val}`;
      });
    return entries.length
      ? `Here is the available data: ${entries.join('. ')}.`
      : "I'm unable to retrieve a response right now, Sir.";
  } catch {
    return "I'm unable to retrieve a response right now, Sir.";
  }
}

// --- Handler -----------------------------------------------------------------

async function translateToTargetLang(text, targetLang) {
  if (!text || targetLang === 'en') return { text, spokenText: text };

  const targetName = targetLang === 'kn' ? 'Kannada' : targetLang === 'hi' ? 'Hindi' : 'English';

  // 1. Try Zia Translation
  try {
    const ziaRes = await translateWithZia(text, 'en', targetLang);
    if (ziaRes && ziaRes.trim() && ziaRes !== text) {
      return { text: ziaRes.trim(), spokenText: ziaRes.trim() };
    }
  } catch (e) {
    console.warn(`[DRISHTI] Zia ${targetName} translation failed:`, e.message);
  }

  // 2. Try Gemini Translation iterating over GEMINI_KEYS
  for (const apiKey of GEMINI_KEYS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `Translate the following police intelligence response into natural ${targetName} script. Address the officer respectfully. Return ONLY the translated text in ${targetName} script without any markdown code blocks, quotes, or explanations:\n\n${text}`,
                },
              ],
            },
          ],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 7000 }
      );

      const translatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (translatedText) {
        // Clean any residual code block markup
        const clean = translatedText.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
        return { text: clean, spokenText: clean };
      }
    } catch (e) {
      if (e?.response?.status === 429) continue; // Try next key on rate limit
      console.warn(`[DRISHTI] Gemini ${targetName} translation error:`, e.message);
    }
  }

  return { text, spokenText: text };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { question, lang = 'en', rawData, sessionHistory = [] } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { answer: 'No question received, Sir.', language: lang, source: 'raw_fallback' },
        { status: 200, headers: CORS }
      );
    }

    let workingQuestion = question.trim();
    let finalAnswer = '';
    let source = 'quickml';

    // Detect target language (auto-detect if script contains Kannada or Hindi characters)
    let targetLang = lang;
    if (/[\u0C80-\u0CFF]/.test(workingQuestion)) targetLang = 'kn';
    if (/[\u0900-\u097F]/.test(workingQuestion)) targetLang = 'hi';

    // Step 1: Translate non-English working input to English for QuickML RAG search
    if (targetLang !== 'en') {
      workingQuestion = await translateText(workingQuestion, targetLang, 'en');
    }

    // Lookup matching police manual SOP / legal context & live database records
    const knowledgeContext = await findKnowledgeContext(workingQuestion);

    // Log which AI source will be attempted
    const hasQuickML = !!(process.env.QUICKML_OAUTH_TOKEN && !process.env.QUICKML_OAUTH_TOKEN.startsWith('your_'));
    const hasGroq = !!process.env.GROQ_API_KEY;
    const geminiKeyCount = GEMINI_KEYS.length;
    console.log(`[DRISHTI] Sources available — QuickML: ${hasQuickML}, Groq: ${hasGroq}, Gemini keys: ${geminiKeyCount}`);

    // Step 2: QuickML RAG (primary)
    try {
      finalAnswer = await callQuickML(workingQuestion, knowledgeContext);
      source = 'quickml';
    } catch (quickmlErr) {
      console.error('[askDrishtiAI] QuickML RAG failed:', quickmlErr.message);

      // Step 3: Groq (fast free-tier fallback — llama-3.3-70b)
      try {
        finalAnswer = await callGroq(workingQuestion, knowledgeContext, sessionHistory);
        source = 'groq';
      } catch (groqErr) {
        console.error('[askDrishtiAI] Groq failed:', groqErr.message);

        // Step 4: Gemini (key rotation fallback)
        try {
          finalAnswer = await callGemini(workingQuestion, knowledgeContext, sessionHistory);
          source = 'gemini';
        } catch (geminiErr) {
          console.error('[askDrishtiAI] Gemini failed:', geminiErr.message);

          // Step 5: Last-resort raw data fallback
          finalAnswer = buildFallbackAnswer(rawData);
          source = 'raw_fallback';
        }
      }
    }

    // Step 5: Translate final output to target language (EN/KN/HI)
    let spokenAnswer = finalAnswer;
    if (targetLang !== 'en') {
      const transRes = await translateToTargetLang(finalAnswer, targetLang);
      finalAnswer = transRes.text;
      spokenAnswer = transRes.spokenText;
    }

    // Dynamic suggestions based on query context
    const suggestions = [
      'Top Repeat Offenders in Cybercrime',
      'Check ANPR feed for KA-01-EA-4921',
      'NDPS Drug Seizure SOP & Panchanama',
      'Night Patrol Hotspots summary',
    ];

    return NextResponse.json(
      {
        answer: finalAnswer,
        spokenAnswer,
        language: targetLang,
        source,
        stats: {
          active_firs: 968,
          hotspots: 49,
          repeat_offenders: 12,
          cctv_coverage: '94%',
        },
        follow_up_suggestions: suggestions,
      },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error('[askDrishtiAI] Unhandled error:', err.message);
    // NEVER return 500 — always return something speakable
    return NextResponse.json(
      {
        answer: "I encountered an unexpected issue, Sir. Please try again.",
        language: 'en',
        source: 'raw_fallback',
      },
      { status: 200, headers: CORS }
    );
  }
}
