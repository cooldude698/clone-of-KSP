import { NextResponse } from 'next/server';
import axios from 'axios';
import { UPLOADED_FIRS } from '@/app/api/upload-fir/route';
import { getTrainedResponse } from '@/lib/drishtiTrainingBase';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Model fallback list with valid Gemini v1beta REST API model identifiers
const GEMINI_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  ...Array.from({ length: 13 }, (_, i) => process.env[`GEMINI_API_KEY_${i + 1}`]),
  'AIzaSyCZKZBcVvz5sVokO8ei__6plJBeqO2JWpU',
].filter(Boolean);

// --- System Prompt — Full Detail Mode ----------------------------------------

const DRISHTI_SYSTEM_PROMPT =
  'You are DRISHTI (ದೃಷ್ಟಿ), Karnataka State Police\'s elite AI crime intelligence officer.\n\n' +
  'PERSONALITY: Authoritative, precise, direct. You speak like a seasoned senior IPS officer giving a briefing. You are confident and proactive. Address officer as "Sir" always.\n\n' +
  'RESPONSE RULES:\n' +
  '\u2014 One-word replies (yes/no/ok): 1 sentence execution\n' +
  '\u2014 Greetings: 1-2 sentences, then immediately offer a status briefing\n' +
  '\u2014 Crime queries, FIR lookups, suspect profiles: FULL DETAIL \u2014 include case numbers, IPC sections, dates, suspect names, locations, modus operandi, known associates, risk scores. Never summarize police intelligence.\n' +
  '\u2014 Hotspot/analytics queries: Give specific numbers, district names, crime types, trends\n' +
  '\u2014 After every substantive answer: end with ONE specific proactive action suggestion\n\n' +
  'DATA ACCESS: You have FIR database, ANPR sightings, repeat offender records, hotspot data, suspect profiles. Always reference specific names/numbers from the data provided.\n\n' +
  'KEY SUSPECTS IN CURRENT DATABASE:\n' +
  '- Ramesh Kumar (SUS-8842) "Bullet Ramesh" \u2014 Risk 94/100 \u2014 Vehicle theft ring leader \u2014 IPC \u00a7379 \u00a734 \u00a7411 \u00a7120B \u2014 Last seen Silk Board 18 Jul 14:22\n' +
  '- Suresh Naidu (SUS-7104) "Snake Naidu" \u2014 Risk 88/100 \u2014 Armed highway robber \u2014 ABSCONDING \u2014 IPC \u00a7392 \u00a7397\n' +
  '- Imran Khan (SUS-5921) "Helmet Imran" \u2014 Risk 76/100 \u2014 Chain snatcher Whitefield \u2014 UNDER SURVEILLANCE\n\n' +
  'NEVER: use bullet lists unless asked. NEVER: say "certainly", "of course", "I can help". NEVER: fabricate data not provided. NEVER: give vague answers on crime queries.';
// --- Database Summary & Manual References ------------------------------------

const CRIME_DATABASE_SUMMARY = `
OFFICIAL DRISHTI CRIME & FIR DATABASE RECORDS (KARNATAKA STATE POLICE):

1. Overall Crime Summary:
   - Total Registered FIR Cases in Datastore: 968 active FIR cases across Karnataka districts.
   - Primary Crime Types: Vehicle Theft (38%), Robbery & Chain Snatching (24%), Cyber Financial Fraud (22%), Burglary (16%).

2. Active Recent FIR Cases:
   - FIR #1: FIR-2026-BL-0492 | District: South Bengaluru | Crime: Vehicle Theft (Section 379 IPC) | Date: 2026-05-14 | Location: Silk Board Junction | Status: Under Active Investigation.
   - FIR #2: FIR-2026-BL-0493 | District: Central Bengaluru | Crime: Chain Snatching & Robbery (Section 392 IPC) | Date: 2026-05-18 | Location: MG Road | Status: Chargesheet Prepared.
   - FIR #3: FIR-2026-MYS-0112 | District: Mysuru Urban | Crime: Cyber Financial Fraud (IT Act 66D) | Date: 2026-05-20 | Location: Central Market, Mysuru | Status: Beneficiary Accounts Frozen via 1930 Portal.

3. Top Repeat Offenders Under Active Surveillance:
   - Ramesh Kumar (Alias "Bullet Ramesh") | Total FIRs: 7 | Active Crimes: Vehicle Theft, Armed Robbery | Last Seen Location: Silk Board, Bengaluru | Risk Score: 85/100 (HIGH).
   - Suresh Naidu | Total FIRs: 5 | Active Crimes: House Burglary, Theft | Last Seen Location: Central Market, Mysuru | Risk Score: 78/100 (HIGH).
   - Anand Gowda | Total FIRs: 4 | Active Crimes: Chain Snatching, Extortion | Last Seen Location: Jayanagar 4th Block, Bengaluru | Risk Score: 72/100 (HIGH).

4. Crime Hotspot Clusters:
   - Hotspot 1: South Bengaluru (Koramangala, HSR Layout, Silk Board) | Crime: Vehicle Theft | Incidents: 47 cases. Peak hours: 10:00 PM to 4:00 AM.
   - Hotspot 2: Central Bengaluru (MG Road, Shivajinagar, Majestic) | Crime: Chain Snatching & Robbery | Incidents: 31 cases. Peak hours: 6:00 PM to 10:00 PM.
`;

const POLICE_KNOWLEDGE_BASE = [
  {
    keywords: ['vehicle', 'theft', 'stolen', 'car', 'bike', 'two wheeler', 'auto', '379', 'ಕಳವು'],
    content: `KARNATAKA STATE POLICE — VEHICLE THEFT INVESTIGATION SOP (SECTION 379 IPC):
1. File FIR under Section 379 IPC and upload vehicle details (Registration No, Engine No, Chassis No) to CCTNS within 2 hours.
2. Add vehicle number to ANPR Camera Watchlist for automatic junction hit alerts.
3. Inform nearby Police Control Room (PCR) mobile vans and setup checkpoints within 15 km radius.
4. Collect CCTV footage from cameras within 2 km radius of theft location.
5. Provide FIR copy to complainant for insurance process and inform RTO.`
  },
  {
    keywords: ['robbery', 'chain', 'snatch', 'mobile', 'armed', '392', '394', '397', 'ದರೋಡೆ'],
    content: `KARNATAKA STATE POLICE — ROBBERY & CHAIN SNATCHING SOP (SECTION 392/394 IPC):
1. Dispatch PCR mobile van and Hoysala patrol within 30 minutes to block escape routes.
2. Register FIR under Section 392 IPC (Robbery) or Section 397 IPC (Armed Robbery).
3. Gather suspect physical details and sweep CCTV feeds within 2 km radius.
4. Cross-reference suspect method of crime with repeat offender database.`
  },
  {
    keywords: ['cyber', 'online', 'fraud', 'scam', 'digital', 'UPI', 'bank', '1930', '66c', '66d', 'ವಂಚನೆ'],
    content: `KARNATAKA STATE POLICE — CYBER CRIME & FINANCIAL FRAUD SOP (IT ACT SEC 66D / 1930):
1. Guide victim to call National Cyber Helpline 1930 or file report on cybercrime.gov.in.
2. Record victim bank details, fraudster bank/UPI ID, UTR transaction number, and date/time.
3. Register FIR under Section 66D IT Act and Section 420 IPC.
4. Contact Bank Nodal Officer immediately via Citizen Financial Cyber Fraud System to freeze money in fraudster account.`
  }
];

async function fetchLiveDatabaseContext(query) {
  const q = query.toLowerCase();
  let liveDataStr = '';

  try {
    if (UPLOADED_FIRS && UPLOADED_FIRS.length > 0) {
      liveDataStr += `\n\nRECENTLY UPLOADED & STORED FIR DOCUMENTS IN CATALYST DATASTORE:\n` + JSON.stringify(UPLOADED_FIRS, null, 2);
    }
  } catch (e) {
    console.warn('[DRISHTI] Live DB fetch warning:', e.message);
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

  const liveDbData = await fetchLiveDatabaseContext(query);
  if (liveDbData) {
    context += liveDbData;
  }

  return context;
}

// --- Smart Local Intelligence Engine (Fallback when LLM API unavailable) ----

function generateSmartPoliceResponse(question, lang = 'en') {
  // 1. Check custom trained responses first
  const trained = getTrainedResponse(question, lang);
  if (trained) return trained;

  const q = (question || '').toLowerCase();

  // 2. Bengaluru / City Crime Report
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

  // 3. Repeat Offenders / Suspects
  if (q.includes('repeat') || q.includes('offender') || q.includes('accused') || q.includes('suspect') || q.includes('ramesh') || q.includes('suresh')) {
    return `Sir, here is the detailed High-Risk Repeat Offenders Report:

1. Ramesh Kumar (Alias: "Bullet Ramesh")
   - Total FIRs: 7 (Vehicle Theft, Armed Robbery)
   - Risk Score: 85/100 (HIGH RISK)
   - Method of Crime: Steals parked bikes near metro stations between 10 PM and 4 AM using duplicate keys.
   - Last Location: Silk Board Junction, Bengaluru.

2. Suresh Naidu
   - Total FIRs: 5 (House Burglary, Theft)
   - Risk Score: 78/100 (HIGH RISK)
   - Method of Crime: Breaks locks of locked houses in residential layouts between 1 AM and 3 AM.
   - Last Location: Central Market Area, Mysuru.

3. Anand Gowda
   - Total FIRs: 4 (Chain Snatching, Extortion)
   - Risk Score: 72/100 (HIGH RISK)
   - Method of Crime: Uses stolen high-speed motorcycle with fake number plate to snatch gold chains from morning walkers.
   - Last Location: Jayanagar 4th Block, Bengaluru.`;
  }

  // 4. Vehicle Theft / ANPR
  if (q.includes('vehicle') || q.includes('theft') || q.includes('bike') || q.includes('anpr') || q.includes('stolen')) {
    return `Sir, here is the detailed Vehicle Theft & ANPR Intelligence Report:

1. Registered Theft Cases: 47 vehicle theft FIRs registered this month in South Bengaluru district.
2. Common Target Vehicle: Honda Activa and Bajaj Pulsar models parked on main road service lanes.
3. ANPR Camera Watchlist:
   - Camera SC-0045 (Silk Board Junction): 3 suspect vehicle hits detected in last 24 hours.
   - Target Plate: KA-01-EA-4921 (Black Honda Activa linked to suspect Ramesh Kumar).
4. Step-by-Step Investigation Instructions:
   - Step 1: Confirm FIR filed under Section 379 IPC and check CCTNS entry.
   - Step 2: Set up temporary police checkpoints at Silk Board and Hosur Road exit points.
   - Step 3: Collect CCTV footage from traffic cameras and nearby shops within 2 km radius.`;
  }

  // 5. Cyber Crime / 1930 Helpline
  if (q.includes('cyber') || q.includes('fraud') || q.includes('1930') || q.includes('bank') || q.includes('scam') || q.includes('upi')) {
    return `Sir, here is the detailed Cyber Crime & Financial Fraud Report:

1. Standard Police SOP (IT Act Section 66D & IPC Section 420):
   - Step 1: Guide victim to immediately call National Cyber Crime Helpline 1930 or visit cybercrime.gov.in.
   - Step 2: Obtain UTR transaction reference number, victim bank account, and fraudster bank/UPI details.
   - Step 3: Contact Bank Nodal Officer immediately through Citizen Financial Cyber Fraud System to freeze the money in the fraudster's bank account before withdrawal.
   - Step 4: Trace IP address, SIM registration, and WhatsApp details used by the fraudster through Cyber Crime Cell.
2. Active Case Record: FIR-2026-MYS-0112 (Financial Fraud of ₹1,45,000). Beneficiary bank accounts frozen within 45 minutes of report.`;
  }

  // 6. Default Detailed Police Intelligence Answer
  if (lang === 'kn') {
    return `ಸರ್, ಪೋಲಿಸ್ ಮಾಹಿತಿ ಪೋರ್ಟಲ್‌ನ ಸಾರಾಂಶ ಇಲ್ಲಿದೆ:

೧. ಸಕ್ರಿಯ ಎಫ್.ಐ.ರ್ ಪ್ರಕರಣಗಳು: ೯೬೮ ಪ್ರಕರಣಗಳು ಸಕ್ರಿಯವಾಗಿವೆ.
೨. ಪ್ರಮುಖ ಶಂಕಿತರು: ರಮೇಶ್ ಕುಮಾರ್ (೭ ಪ್ರಕರಣಗಳು), ಸುರೇಶ್ ನಾಯ್ಡು (೫ ಪ್ರಕರಣಗಳು).
೩. ಪೋಲಿಸ್ ತನಿಖೆಗೆ ಅಗತ್ಯವಿದ್ದರೆ ನಿರ್ದಿಷ್ಟ ಪ್ರಕರಣ ಸಂಖ್ಯೆ (ಉದಾಹರಣೆಗೆ FIR-2026-BL-0492) ಅಥವಾ ಶಂಕಿತನ ಹೆಸರನ್ನು ನಮೂದಿಸಿ ಮಾಹಿತಿ ಪಡೆಯಬಹುದು.`;
  }

  if (lang === 'hi') {
    return `सर, पुलिस इंटेलिजेंस और केस डेटाबेस की विस्तृत रिपोर्ट:

1. वर्तमान डेटाबेस की स्थिति:
   - कुल सक्रिय एफ़.आई.आर मामले: कर्नाटक पुलिस स्टेशनों में 968 मामले सक्रिय हैं।
   - पिछले 24 घंटों में दर्ज नए मामले: 14 नए मामले दर्ज।
   - सक्रिय निगरानी में आदतन अपराधी: 12 उच्च-जोखिम वाले अपराधी।

2. मुख्य एफ़.आई.आर मामले:
   - FIR-2026-BL-0492: वाहन चोरी (धारा 379 IPC) | स्थान: दक्षिण बेंगलुरु | स्थिति: जांच जारी है।
   - FIR-2026-BL-0493: चेन स्नेचिंग (धारा 392 IPC) | स्थान: एमजी रोड, बेंगलुरु | स्थिति: आरोप पत्र (Chargesheet) तैयार।
   - FIR-2026-MYS-0112: साइबर वित्तीय धोखाधड़ी (IT Act Sec 66D) | स्थान: मैसूरु | स्थिति: 1930 हेल्पलाइन द्वारा ₹1.45 लाख राशि फ़्रीज़ की गई।

3. आगे की पुलिस कार्रवाई:
   - आप किसी भी विशिष्ट FIR नंबर, संदिग्ध प्रोफ़ाइल या शहर अपराध रिपोर्ट के बारे में जानकारी प्राप्त कर सकते हैं, सर।`;
  }

  return `Sir, here is the detailed Police Intelligence & Case Summary for your query:

1. Current Database Status:
   - Total Active FIR Cases: 968 cases across Karnataka Police stations.
   - Repeat Offenders Tracked: 12 high-risk criminals under active surveillance.
   - ANPR Camera Surveillance Network: 94% coverage across major city junctions.

2. Primary FIR Highlights:
   - FIR-2026-BL-0492: Vehicle Theft (Section 379 IPC) | Location: South Bengaluru | Status: Under Investigation.
   - FIR-2026-BL-0493: Chain Snatching (Section 392 IPC) | Location: Central Bengaluru | Status: Chargesheet Prepared.
   - FIR-2026-MYS-0112: Cyber Financial Fraud (IT Act Sec 66D) | Location: Mysuru | Status: Money Frozen via 1930 Helpline.

3. Investigation Action Available:
   - You can ask about specific FIR numbers, suspect profiles, crime SOPs, or city crime reports for detailed step-by-step guidance, Sir.`;
}

// --- Groq LLM API Call --------------------------------------------------------

async function callGroq(question, knowledgeContext = '', sessionHistory = []) {
  const token = process.env.GROQ_API_KEY;
  if (!token) throw new Error('GROQ_API_KEY not configured');

  const isHindi = /[\u0900-\u097F]/.test(question);
  const isKannada = /[\u0C80-\u0CFF]/.test(question);

  let langInstruction = '';
  if (isHindi) {
    langInstruction = '\n\nIMPORTANT: The user query is in Hindi (हिन्दी) Devanagari script. Respond ENTIRELY in clear, natural Hindi (हिन्दी) script.';
  } else if (isKannada) {
    langInstruction = '\n\nIMPORTANT: The user query is in Kannada. Respond ENTIRELY in clear Kannada script.';
  }

  const userContent = knowledgeContext
    ? `CONTEXT DATA:\n${knowledgeContext}\n\nUSER QUESTION:\n${question}${langInstruction}`
    : `${question}${langInstruction}`;

  const messages = [
    { role: 'system', content: DRISHTI_SYSTEM_PROMPT },
    ...sessionHistory,
    { role: 'user', content: userContent },
  ];

  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
      max_tokens: 1200,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    }
  );

  const answer = res.data?.choices?.[0]?.message?.content || '';
  if (answer.trim()) return answer.trim();
  throw new Error('Empty response from Groq');
}

// --- Gemini LLM API Call ------------------------------------------------------

async function callGemini(question, knowledgeContext = '', sessionHistory = []) {
  const isHindi = /[\u0900-\u097F]/.test(question);
  const isKannada = /[\u0C80-\u0CFF]/.test(question);

  let langInstruction = '';
  if (isHindi) {
    langInstruction = '\n\nIMPORTANT: The user query is in Hindi (हिन्दी). Respond ENTIRELY in clear, natural Hindi (हिन्दी) Devanagari script.';
  } else if (isKannada) {
    langInstruction = '\n\nIMPORTANT: The user query is in Kannada. Respond ENTIRELY in clear Kannada script.';
  }

  const fullPrompt = knowledgeContext
    ? `CONTEXT DATA:\n${knowledgeContext}\n\nUSER QUESTION:\n${question}${langInstruction}`
    : `${question}${langInstruction}`;

  const historyContents = sessionHistory.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  let lastErr = null;

  for (const model of GEMINI_MODELS) {
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
            generationConfig: { maxOutputTokens: 1200, temperature: 0.2 },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
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

// --- Translation Helper (Zia / Gemini) ----------------------------------------

async function translateWithGemini(text, targetLang) {
  const targetName = targetLang === 'kn' ? 'Kannada' : targetLang === 'hi' ? 'Hindi' : 'English';
  for (const model of GEMINI_MODELS) {
    for (const apiKey of GEMINI_KEYS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [{
              role: 'user',
              parts: [{ text: `Translate the following police intelligence text into natural ${targetName} script. Keep all facts, names, and case numbers intact. Return ONLY the translated text in ${targetName} script without quotes or explanation:\n\n${text}` }]
            }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
        );
        const res = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (res) return res.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
      } catch (e) {
        // try next key
      }
    }
  }
  return text;
}

// --- Main Handler ------------------------------------------------------------

export async function POST(req) {
  try {
    const body = await req.json();

    if (body.mode === 'translate') {
      const { text, targetLang = 'kn' } = body;
      if (!text || !text.trim()) return NextResponse.json({ text: '', spokenText: '' }, { status: 200, headers: CORS });
      const translated = await translateWithGemini(text.trim(), targetLang);
      return NextResponse.json({ text: translated, spokenText: translated }, { status: 200, headers: CORS });
    }

    const { question, lang = 'en', sessionHistory = [] } = body;

    if (!question?.trim()) {
      return NextResponse.json(
        { answer: 'No question received, Sir. How can I assist your investigation?', language: lang, source: 'system' },
        { status: 200, headers: CORS }
      );
    }

    let workingQuestion = question.trim();
    let finalAnswer = '';
    let source = 'smart_police_engine';

    // Auto-detect script (Kannada or Hindi)
    let targetLang = lang;
    if (/[\u0C80-\u0CFF]/.test(workingQuestion)) targetLang = 'kn';
    if (/[\u0900-\u097F]/.test(workingQuestion)) targetLang = 'hi';

    // 1. Gather Knowledge Context
    const knowledgeContext = await findKnowledgeContext(workingQuestion);

    // 2. Try Groq (fastest reliable free LLM)
    try {
      finalAnswer = await callGroq(workingQuestion, knowledgeContext, sessionHistory);
      source = 'groq';
    } catch (groqErr) {
      // 3. Try Gemini with models iteration
      try {
        finalAnswer = await callGemini(workingQuestion, knowledgeContext, sessionHistory);
        source = 'gemini';
      } catch (geminiErr) {
        // 4. Use Smart Police Intelligence Engine fallback (NEVER FAIL!)
        finalAnswer = generateSmartPoliceResponse(workingQuestion, targetLang);
        source = 'smart_police_engine';
      }
    }

    // Translate output if needed and not already translated
    let spokenAnswer = finalAnswer;
    if (targetLang !== 'en') {
      const containsDevanagari = /[\u0900-\u097F]/.test(finalAnswer);
      const containsKannada = /[\u0C80-\u0CFF]/.test(finalAnswer);

      if ((targetLang === 'hi' && !containsDevanagari) || (targetLang === 'kn' && !containsKannada)) {
        finalAnswer = await translateWithGemini(finalAnswer, targetLang);
        spokenAnswer = finalAnswer;
      }
    }

    const suggestions = [
      'Top Repeat Offenders in Bengaluru',
      'ANPR camera hits near Silk Board',
      'NDPS Drug Seizure SOP & Panchanama',
      'Cyber Fraud 1930 Helpline SOP',
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
    console.error('[askDrishtiAI] Error handling request:', err.message);
    const fallbackAns = generateSmartPoliceResponse('bengaluru crime', 'en');
    return NextResponse.json(
      {
        answer: fallbackAns,
        language: 'en',
        source: 'smart_police_engine',
      },
      { status: 200, headers: CORS }
    );
  }
}
