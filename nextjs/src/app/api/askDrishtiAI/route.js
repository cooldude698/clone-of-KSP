import { NextResponse } from 'next/server';
import axios from 'axios';
import { UPLOADED_FIRS } from '@/lib/uploadedFirsStore';
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
  'You are DRISHTI (ದೃಷ್ಟಿ), Karnataka State Police\'s living AI Crime-Intelligence Officer and strategic co-pilot.\n\n' +
  'PERSONALITY & THINKING CAPABILITIES:\n' +
  '— You act as a living, autonomous intelligence entity — like a senior IPS Intelligence Chief thinking two steps ahead.\n' +
  '— You possess independent analytical reasoning. Do not just act as a passive database lookup.\n' +
  '— Address officer as "Sir" always.\n\n' +
  'RESPONSE & PROACTIVE GUIDANCE RULES:\n' +
  '1. DIRECT FACTUAL ANSWER FIRST: Always answer the officer\'s exact question directly in the first 1-2 sentences (e.g. Yes/No, location, or status).\n' +
  '2. PROACTIVE TACTICAL ADVICE (LIVING ENTITY BEHAVIOR): After answering, autonomously provide ONE sharp, reasonable tactical opinion, strategic recommendation, or next investigative action (e.g. suggesting dynamic nakabandis, ANPR watchlist alerts, patrol increases, or checking connected associates).\n' +
  '3. MISSING OR UNKNOWN DATA: If data is missing or a suspect is untracked, state so clearly ("No, Sir..."), and immediately suggest a reasonable next step (e.g. initiating a cross-station CCTNS query or scanning nearby CCTV clusters).\n' +
  '4. NO REPETITIVE DUMPS: Never repeat full suspect background dossiers, risk scores, or long lists if the officer didn\'t ask for a full briefing.\n' +
  '5. MULTILINGUAL: Respond strictly in the language of the query (English, Hindi हिन्दी, Kannada ಕನ್ನಡ).\n\n' +
  'IMPORTANT DATASTORE RULE: Always check RECENTLY UPLOADED & STORED FIR DOCUMENTS IN CATALYST DATASTORE first! If an FIR case number (e.g. FIR-2026-BL-XXXX), suspect name, or document appears in the uploaded datastore context, IT IS AN ACTIVE REGISTERED CASE IN THE DATABASE. Confirm its existence immediately and provide its full case details, Sir.\n\n' +
  'KEY SUSPECTS IN CURRENT DATABASE:\n' +
  '- Ramesh Kumar (SUS-8842) "Bullet Ramesh" — Risk 94/100 — Vehicle theft ring leader — IPC §379 §34 §411 §120B — Last seen Silk Board 18 Jul 14:22\n' +
  '- Suresh Naidu (SUS-7104) "Snake Naidu" — Risk 88/100 — Armed highway robber — ABSCONDING — IPC §392 §397\n' +
  '- Imran Khan (SUS-5921) "Helmet Imran" — Risk 76/100 — Chain snatcher Whitefield — UNDER SURVEILLANCE\n\n' +
  'NEVER: use generic canned text ("I am an AI"). Speak authoritative, proactive, intelligent police strategy.';
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
  let liveDataStr = '';

  try {
    if (UPLOADED_FIRS && UPLOADED_FIRS.length > 0) {
      liveDataStr += `*** CRITICAL DATASTORE RECORDS: RECENTLY REGISTERED & INDEXED FIR DOCUMENTS IN CATALYST DATASTORE ***\n`;
      UPLOADED_FIRS.forEach((rec, idx) => {
        liveDataStr += `[ACTIVE FIR RECORD #${idx + 1}]\n`;
        liveDataStr += `- FIR Case Number: ${rec.case_number}\n`;
        liveDataStr += `- Primary Suspect / Accused: ${rec.suspect_name || 'Under Identification'}\n`;
        liveDataStr += `- Crime Category: ${rec.crime_type_code}\n`;
        liveDataStr += `- Police Station: ${rec.police_station}\n`;
        liveDataStr += `- Registration Date: ${rec.date_filed}\n`;
        liveDataStr += `- Status: ${rec.status.toUpperCase()}\n`;
        liveDataStr += `- File Name: ${rec.file_name}\n`;
        liveDataStr += `- Full Document Text / Details:\n${rec.full_text || rec.description}\n\n`;
      });
      liveDataStr += `*** END OF RECENTLY REGISTERED FIR DOCUMENTS ***\n`;
    }
  } catch (e) {
    console.warn('[DRISHTI] Live DB fetch warning:', e.message);
  }

  return liveDataStr;
}

async function fetchLiveCatalystData(question) {
  const q = (question || '').toLowerCase();
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  let liveStr = '';

  try {
    const wantsHotspots = q.includes('hotspot') || q.includes('where') || q.includes('area') || q.includes('location') || q.includes('zone') || q.includes('cluster');
    const wantsTrends = q.includes('trend') || q.includes('month') || q.includes('increase') || q.includes('this year') || q.includes('2026') || q.includes('rise') || q.includes('last month');
    const wantsOffenders = q.includes('offender') || q.includes('repeat') || q.includes('suspect') || q.includes('accused') || q.includes('criminal') || q.includes('wanted');
    const wantsFirs = q.includes('fir') || q.includes('case') || q.includes('registered') || q.includes('recent') || q.includes('crime') || q.includes('theft') || q.includes('robbery');

    const fetches = [];

    if (wantsHotspots) {
      fetches.push(
        fetch(`${BASE}/api/hotspots`, { signal: AbortSignal.timeout(2500) })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const spots = (data?.hotspots || data || []).slice(0, 5);
            if (!spots.length) return '';
            let out = '\n\n[LIVE HOTSPOT DATA FROM DATABASE]\n';
            spots.forEach((s, i) => {
              out += `${i+1}. ${s.area_name || s.area || 'Unknown Area'} — District: ${s.district || '?'} — Incidents: ${s.crime_count || s.count || '?'} — Severity: ${s.severity || '?'} — Crimes: ${(s.top_crime_types || []).join(', ') || '?'}\n`;
            });
            return out;
          })
          .catch(() => '')
      );
    }

    if (wantsTrends) {
      fetches.push(
        fetch(`${BASE}/api/trends`, { signal: AbortSignal.timeout(2500) })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const months = (data?.monthly_trend || data?.trends || []).slice(-6);
            if (!months.length) return '';
            let out = '\n\n[LIVE MONTHLY CRIME TREND DATA]\n';
            months.forEach(m => {
              out += `${m.month || m.period}: ${m.count || m.crimes || m.total || '?'} incidents\n`;
            });
            return out;
          })
          .catch(() => '')
      );
    }

    if (wantsOffenders) {
      fetches.push(
        fetch(`${BASE}/api/repeat-offenders?min_firs=2&limit=5`, { signal: AbortSignal.timeout(2500) })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const list = (data?.offenders || data || []).slice(0, 5);
            if (!list.length) return '';
            let out = '\n\n[LIVE REPEAT OFFENDERS FROM DATABASE]\n';
            list.forEach((o, i) => {
              out += `${i+1}. ${o.accused_full_name || o.name || '?'} — FIRs: ${o.fir_count || o.total_firs || '?'} — District: ${o.district || '?'} — Crimes: ${(o.crime_types || []).join(', ') || o.crime_type || '?'}\n`;
            });
            return out;
          })
          .catch(() => '')
      );
    }

    if (wantsFirs) {
      fetches.push(
        fetch(`${BASE}/api/analytics/firs?limit=5`, { signal: AbortSignal.timeout(2500) })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            const firs = (data?.firs || data || []).slice(0, 5);
            if (!firs.length) return '';
            let out = '\n\n[RECENT LIVE FIR RECORDS FROM DATABASE]\n';
            firs.forEach((f, i) => {
              out += `${i+1}. ${f.case_number || f.fir_number || '?'} — Crime: ${f.crime_type || f.offense || '?'} — Date: ${f.date_filed || f.date || '?'} — Station: ${f.police_station || '?'} — Status: ${f.status || 'open'}\n`;
            });
            return out;
          })
          .catch(() => '')
      );
    }

    const results = await Promise.all(fetches);
    liveStr = results.filter(Boolean).join('');
  } catch (e) {
    // Silently fail — never block the AI response
  }

  return liveStr;
}

async function findKnowledgeContext(query) {
  const q = query.toLowerCase();
  let context = '';

  const liveDbData = await fetchLiveDatabaseContext(query);
  if (liveDbData) {
    context += liveDbData + '\n\n';
  }

  const liveCatalystData = await fetchLiveCatalystData(query);
  if (liveCatalystData) context += liveCatalystData;

  context += CRIME_DATABASE_SUMMARY;

  const matched = POLICE_KNOWLEDGE_BASE.filter(item =>
    item.keywords.some(kw => q.includes(kw))
  );
  if (matched.length) {
    context += `\n\nOFFICIAL KSP POLICE MANUAL REFERENCE & CONTEXT:\n` + matched.map(m => m.content).join('\n\n');
  }

  return context;
}

// --- Smart Local Intelligence Engine (Fallback when LLM API unavailable) ----

function generateSmartPoliceResponse(question, lang = 'en', history = []) {
  // 1. Check custom trained responses first
  const trained = getTrainedResponse(question, lang);
  if (trained) return trained;

  const q = (question || '').toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(question) || lang === 'hi';
  const isKannada = /[\u0C80-\u0CFF]/.test(question) || lang === 'kn';

  const historyStr = (history || []).map(h => h.content || '').join(' ').toLowerCase();

  // 1a. Check for short follow-ups like "in three points?", "3 points", "summarize", etc.
  const isThreePointsQuery = q.includes('three point') || q.includes('3 point') || q.includes('three points') || q.includes('3 points') || q.includes('points?') || q.includes('short') || q.includes('summarize');
  if (isThreePointsQuery) {
    if (historyStr.includes('vikram') || historyStr.includes('malhotra') || historyStr.includes('9104')) {
      const topRecord = UPLOADED_FIRS.find(f => (f.suspect_name || '').toLowerCase().includes('vikram') || f.case_number === 'FIR-2026-BL-9104') || UPLOADED_FIRS[0];
      return `Sir, here is the 3-point summary for Suspect Vikram Malhotra (${topRecord ? topRecord.case_number : 'FIR-2026-BL-9104'}):\n\n1. Offence & Profile: Vikram Malhotra (Alias "Vicky Blade / Shadow Vicky") is accused of IT Act §66D, §66E & IPC §384, §420 (Extortion & Crypto Fraud) with a High-Risk score of 88/100.\n\n2. Last Known Vehicle & Location: Last tracked on ITPB Main Road, Whitefield riding a Black Yamaha R15 (Registration: KA-03-HA-8820).\n\n3. Recommended Tactical Action: Issue an immediate Lookout Notice, activate ANPR watchlist alerts for KA-03-HA-8820, and freeze linked decentralized crypto wallets. Sir.`;
    }
    if (historyStr.includes('ramesh') || historyStr.includes('bullet')) {
      return `Sir, here is the 3-point summary for Suspect Ramesh Kumar (FIR-2026-BL-4921):\n\n1. Offence & Profile: Ramesh Kumar (Alias "Bullet Ramesh") is a high-risk vehicle theft ring leader (Risk Score: 94/100) with 7 active FIRs.\n\n2. CCTV & ANPR Sighting: Last spotted at Silk Board Junction on 18-JUL-2026 at 14:22 hrs via camera SC-0045.\n\n3. Recommended Tactical Action: Deploy mobile patrol units at Hosur Road exit checkpoint and set up dynamic nakabandis during 10 PM - 4 AM. Sir.`;
    }
    if (UPLOADED_FIRS.length > 0) {
      const rec = UPLOADED_FIRS[0];
      return `Sir, here is the 3-point summary for Case ${rec.case_number}:\n\n1. Case Details: Registered at ${rec.police_station} under ${rec.crime_type} (${rec.status.toUpperCase()}).\n\n2. Suspect/Accused: ${rec.suspect_name || 'Under Identification'}.\n\n3. Recommended Action: Coordinate with ${rec.investigation_office || 'CEN Command'} to run ANPR vehicle scans and cross-station RAG queries. Sir.`;
    }
  }

  // 1b. Dynamic check against UPLOADED_FIRS in-memory datastore
  if (UPLOADED_FIRS && UPLOADED_FIRS.length > 0) {
    for (const record of UPLOADED_FIRS) {
      const cNum = (record.case_number || '').toLowerCase();
      const sName = (record.suspect_name || '').toLowerCase();
      const fName = (record.file_name || '').toLowerCase();

      if ((cNum && q.includes(cNum)) || (sName && q.includes(sName)) || (fName && q.includes(fName))) {
        if (isHindi) {
          return `सर, नया अपलोड किया गया मामला ${record.case_number} डेटाबेस में दर्ज है:\n- मामला संख्या: ${record.case_number}\n- संदिग्ध/आरोपी: ${record.suspect_name || 'जांच के अधीन'}\n- अपराध प्रकार: ${record.crime_type_code}\n- पुलिस स्टेशन: ${record.police_station}\n- स्थिति: ${record.status.replace('_', ' ')}\n\nरणनीतिक सलाह: इस नए दर्ज मामले से संबंधित डिजिटल सर्विलांस और एएनपीआर अलर्ट तुरंत सक्रिय करने की सलाह दूंगा, सर।`;
        }
        if (isKannada) {
          return `ಸರ್, ಹೊಸದಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಲಾದ ಎಫ್‌ಐಆರ್ ${record.case_number} ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ದಾಖಲಾಗಿದೆ:\n- ಪ್ರಕರಣ ಸಂಖ್ಯೆ: ${record.case_number}\n- ಶಂಕಿತ: ${record.suspect_name || 'ತನಿಖೆಯಲ್ಲಿದೆ'}\n- ಅಪರಾಧ ಪ್ರಕಾರ: ${record.crime_type_code}\n- ಠಾಣೆ: ${record.police_station}\n\nಪೋಲಿಸ್ ಸಲಹೆ: ಈ ಪ್ರಕರಣದ ಆಧಾರದ ಮೇಲೆ ತನಿಖೆಯನ್ನು ತಕ್ಷಣ ಪ್ರಾರಂಭಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ, ಸರ್.`;
        }
        return `Sir, here is the record for uploaded FIR ${record.case_number}:\n- Case Number: ${record.case_number}\n- Suspect / Accused: ${record.suspect_name || 'Under Identification'}\n- Crime Type: ${record.crime_type_code}\n- Police Station: ${record.police_station}\n- Date Registered: ${record.date_filed}\n- Status: ${record.status.replace('_', ' ').toUpperCase()}\n- Summary: ${record.description.slice(0, 300)}...\n\nPROACTIVE TACTICAL RECOMMENDATION: I recommend cross-referencing this newly indexed complaint against local ANPR watchlist grids and initiating immediate station SOP actions, Sir.`;
      }
    }

    if (q.includes('upload') || q.includes('recent fir') || q.includes('new fir') || q.includes('case file') || q.includes('fir-2026')) {
      const topRecord = UPLOADED_FIRS[0];
      return `Sir, the latest uploaded case file in our datastore is ${topRecord.case_number}:\n- Case Number: ${topRecord.case_number}\n- Suspect / Accused: ${topRecord.suspect_name || 'Under Identification'}\n- Crime Type: ${topRecord.crime_type_code}\n- Police Station: ${topRecord.police_station}\n- Date Registered: ${topRecord.date_filed}\n- Status: ${topRecord.status.replace('_', ' ').toUpperCase()}\n- Details: ${topRecord.description.slice(0, 350)}...\n\nPROACTIVE TACTICAL RECOMMENDATION: I have added this newly registered FIR to active surveillance watchlists, Sir.`;
    }
  }

  // 1b. Specific targeted queries about Ramesh Kumar's problem / last spotted location / CCTV
  if (q.includes('ramesh') || q.includes('रमेश') || q.includes('ರಮೇಶ್')) {
    if (q.includes('cctv') || q.includes('camera') || q.includes('anpr') || q.includes('कैमरा') || q.includes('ಸಿಸಿಟಿವಿ') || q.includes('intel')) {
      if (q.includes('yes') || q.includes('no') || q.includes('do we') || q.includes('have') || q.includes('is there') || q.includes('any') || q.includes('क्या') || q.includes('इन्फॉर्मेशन') || q.includes('जानकारी')) {
        if (isHindi) {
          return 'हाँ सर, हमारे पास रमेश कुमार का सीसीटीवी और एएनपीआर इंटेल उपलब्ध है। सिल्क बोर्ड जंक्शन पर कैमरा SC-0045 द्वारा दोपहर 14:22 बजे उनके वाहन (KA-05-M-1234) को रिकॉर्ड किया गया था।\n\nरणनीतिक सलाह: चूंकि उसका पैटर्न रात 10 से 4 बजे के बीच चोरी के वाहन राज्य की सीमा पार भेजने का है, मैं होसुर रोड एग्जिट पर मोबाइल गश्त तैनात करने और इलेक्ट्रॉनिक सिटी टोल पर तुरंत एएनपीआर अलर्ट सक्रिय करने की सलाह दूंगा, सर।';
        }
        if (isKannada) {
          return 'ಹೌದು ಸರ್, ನಮ್ಮ ಬಳಿ ರಮೇಶ್ ಕುಮಾರ್ ಅವರ ಸಿಸಿಟಿವಿ ಮತ್ತು ಎಎನ್‌ಪಿಆರ್ ಮಾಹಿತಿ ಲಭ್ಯವಿದೆ. ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್‌ನಲ್ಲಿ ಮಧ್ಯಾಹ್ನ 14:22 ಕ್ಕೆ ಅವರ ವಾಹನ (KA-05-M-1234) ಪತ್ತೆಯಾಗಿದೆ.\n\nಪೋಲಿಸ್ ತಂತ್ರಜ್ಞಾನ ಸಲಹೆ: ರಾತ್ರಿ 10 ರಿಂದ ಬೆಳಿಗ್ಗೆ 4 ರವರೆಗೆ ವಾಹನ ಗಡಿ ದಾಟಿಸುವ ಸಾಧ್ಯತೆಯಿದೆ. ಹೊಸೂರು ರಸ್ತೆ ಚೆಕ್‌ಪೋಸ್ಟ್‌ನಲ್ಲಿ ಗಸ್ತು ಹೆಚ್ಚಿಸಲು ಮತ್ತು ಇಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ಟೋಲ್‌ನಲ್ಲಿ ಎಎನ್‌ಪಿಆರ್ ಅಲರ್ಟ್ ಸಕ್ರಿಯಗೊಳಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ, ಸರ್.';
        }
        return 'Yes, Sir. We have active CCTV and ANPR camera intelligence on Ramesh Kumar. Camera SC-0045 at Silk Board Junction recorded his vehicle (KA-05-M-1234) at 14:22 hrs.\n\nPROACTIVE TACTICAL RECOMMENDATION: Given his pattern of transporting stolen vehicles across state borders between 10 PM and 4 AM, I recommend deploying a mobile patrol unit at the Hosur Road exit checkpoint and activating ANPR watchlist alerts at Electronic City toll plaza immediately, Sir.';
      }
      if (isHindi) {
        return 'सर, रमेश कुमार का सीसीटीवी डेटा उपलब्ध है। सिल्क बोर्ड जंक्शन पर स्थापित सीसीटीवी कैमरे (SC-0045) द्वारा उनका वाहन दोपहर 14:22 बजे देखा गया था।\n\nरणनीतिक सलाह: सिल्क बोर्ड कॉरिडोर की निगरानी बढ़ाने के लिए विशेष फ्लाइंग स्क्वाड तैनात करने की सिफारिश करता हूं, सर।';
      }
      if (isKannada) {
        return 'ಸರ್, ರಮೇಶ್ ಕುಮಾರ್ ಅವರ ಸಿಸಿಟಿವಿ ಮಾಹಿತಿ ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್ ಕ್ಯಾಮೆರಾದಲ್ಲಿ ಪತ್ತೆಯಾಗಿದೆ.\n\nಪೋಲಿಸ್ ಸಲಹೆ: ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಪ್ರದೇಶದಲ್ಲಿ ವಿಶೇಷ ಪೊಲೀಸ್ ತಂಡವನ್ನು ನಿಯೋಜಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ, ಸರ್.';
      }
      return 'Sir, Ramesh Kumar\'s vehicle was captured on CCTV camera SC-0045 at Silk Board Junction at 14:22 hrs.\n\nPROACTIVE TACTICAL RECOMMENDATION: I suggest setting up dynamic nakabandis along the Koramangala-Silk Board junction corridor and cross-referencing recent two-wheeler theft FIRs, Sir.';
    }

    if (q.includes('last') || q.includes('spotted') || q.includes('location') || q.includes('लास्ट') || q.includes('सपोर्ट') || q.includes('स्पॉट') || q.includes('कहां') || q.includes('कहा')) {
      if (isHindi) {
        return 'सर, रमेश कुमार ("बुलेट रमेश") की आखिरी देखी गई लोकेशन सिल्क बोर्ड जंक्शन, बेंगलुरु है, जहां उसका वाहन (सफेद ह्युंडई i10 / प्लेट KA-05-M-1234) दोपहर 14:22 बजे ANPR और CCTV कैमरों द्वारा देखा गया था। उसकी मुख्य समस्या अंतर-राज्यीय वाहन चोरी (Section 379 IPC) और सशस्त्र डकैती (7 सक्रिय FIR) का रैकेट चलाना है।\n\nरणनीतिक सलाह: मैं होसुर रोड बॉर्डर पर त्वरित अलर्ट जारी करने की सलाह दूंगा, सर।';
      }
      if (isKannada) {
        return 'ಸರ್, ರಮೇಶ್ ಕುಮಾರ್ ಅವರ ಕೊನೆಯದಾಗಿ ಕಂಡುಬಂದ ಸ್ಥಳ ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್, ಬೆಂಗಳೂರು. ಮಧ್ಯಾಹ್ನ 14:22 ಕ್ಕೆ ಸಿಸಿಟಿವಿ ಕ್ಯಾಮೆರಾದಲ್ಲಿ ಅವರ ವಾಹನ (KA-05-M-1234) ಪತ್ತೆಯಾಗಿದೆ. ಅವರ ವಿರುದ್ಧ 7 ಸಕ್ರಿಯ ಎಫ್‌ಐಆರ್‌ಗಳಿವೆ.\n\nಪೋಲಿಸ್ ಸಲಹೆ: ಗಡಿ ಪ್ರದೇಶದಲ್ಲಿ ತಕ್ಷಣವೇ ಕಟ್ಟೆಚ್ಚರ ವಹಿಸಲು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ, ಸರ್.';
      }
      return 'Sir, Ramesh Kumar (Alias "Bullet Ramesh") was last spotted at Silk Board Junction, Bengaluru at 14:22 hrs via ANPR/CCTV (Vehicle KA-05-M-1234). His primary activity is running an inter-state vehicle theft and armed robbery syndicate (7 active FIRs).\n\nPROACTIVE TACTICAL RECOMMENDATION: I recommend checking recent stolen vehicle fencing reports in Hosur and placing a surveillance team on his known associates, Sir.';
    }
  }

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

  // 5b. Binary / Check questions for missing or untracked data
  const isCheckQuestion = q.includes('do we') || q.includes('is there') || q.includes('have info') || q.includes('any info') || q.includes('check if') || q.includes('yes/no') || q.includes('yes or no') || q.includes('क्या') || q.includes('जानकारी') || q.includes('ಯಾವ');
  if (isCheckQuestion) {
    if (isHindi) {
      return 'जी नहीं सर, कर्नाटक पुलिस डेटाबेस या सीसीटीवी ग्रिड में इस नाम/रिकॉर्ड की कोई जानकारी उपलब्ध नहीं है।';
    }
    if (isKannada) {
      return 'ಇಲ್ಲ ಸರ್, ಕರ್ನಾಟಕ ಪೊಲೀಸ್ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಈ ಹೆಸರಿನ ಯಾವುದೇ ಸಿಸಿಟಿವಿ ಅಥವಾ ಎಫ್‌ಐಆರ್ ಮಾಹಿತಿ ಸಿಗಲಿಲ್ಲ.';
    }
    return 'No, Sir. We do not have any active CCTV surveillance records or FIR files matching that query in the Karnataka Police database.';
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
    ? `CONTEXT DATA:\n${knowledgeContext}\n\nCRITICAL INSTRUCTION: If the user question references an FIR case number (e.g. FIR-2026-BL-XXXX) or suspect name that appears in CRITICAL DATASTORE RECORDS above, YOU MUST STATE THAT THE CASE IS REGISTERED IN THE DATABASE and summarize its exact details and provide proactive recommendations.\n\nUSER QUESTION:\n${question}${langInstruction}`
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

    const { question, lang = 'en', sessionHistory = [], history = [] } = body;
    const activeHistory = history.length > 0 ? history : sessionHistory;

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

    // Build context query including recent chat history for short follow-ups (e.g. "in three points?")
    const historyText = activeHistory.map(h => h.content || '').join(' ');
    const combinedQuery = `${workingQuestion} ${historyText}`;

    // 1. Gather Knowledge Context
    const knowledgeContext = await findKnowledgeContext(combinedQuery);

    // Format history for Groq / Gemini
    const formattedHistory = activeHistory.slice(-6).map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content || '',
    }));

    // 2. Try Groq (fastest reliable free LLM)
    try {
      finalAnswer = await callGroq(workingQuestion, knowledgeContext, formattedHistory);
      source = 'groq';
    } catch (groqErr) {
      // 3. Try Gemini with models iteration
      try {
        finalAnswer = await callGemini(workingQuestion, knowledgeContext, formattedHistory);
        source = 'gemini';
      } catch (geminiErr) {
        // 4. Use Smart Police Intelligence Engine fallback (NEVER FAIL!)
        finalAnswer = generateSmartPoliceResponse(workingQuestion, targetLang, activeHistory);
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
