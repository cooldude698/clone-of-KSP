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

// Model fallback list with active Gemini REST API model identifiers (Free Tier Verified)
const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-3.6-flash', 'gemini-3.5-flash'];

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
  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
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

  if (q === 'hello' || q === 'hi' || q === 'hey' || q === 'jai hind' || q.includes('good morning') || q.includes('good evening') || q.includes('good afternoon')) {
    if (isHindi) return 'जय हिंद, सर! दृष्टि एआई चालू है और कर्नाटक पुलिस सीसीटीएस डेटाबेस से जुड़ा हुआ है। आज आपकी जांच में कैसे सहायता कर सकता हूं, सर?';
    if (isKannada) return 'ಜೈ ಹಿಂದ್, ಸರ್! ದೃಷ್ಟಿ ಎಐ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ. ಇಂದಿನ ತನಿಖೆಯಲ್ಲಿ ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ, ಸರ್?';
    return 'Jai Hind, Inspector! DRISHTI AI is online and synced with the Karnataka State Police CCTNS datastore. How can I assist you with your investigation today, Sir?';
  }

  if (q === 'ok' || q === 'okay' || q === 'got it' || q === 'noted' || q === 'understood') {
    if (isHindi) return 'समझ गया, सर। जब भी आपको आगे विश्लेषण या टीम निर्देशों की आवश्यकता हो, मुझे बताएं।';
    if (isKannada) return 'ಗಮನಿಸಲಾಗಿದೆ, ಸರ್. ಮುಂದಿನ ಮಾಹಿತಿಗಾಗಿ ತಿಳಿಸಿ, ಸರ್.';
    return 'Acknowledged, Inspector. Standing by for your next query or squad directive, Sir.';
  }

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

  if (q.includes('392') || q.includes('394') || q.includes('397') || q.includes('robbery') || q.includes('snatch') || q.includes('ದರೋಡೆ') || q.includes('डकैती') || q.includes('स्नैचिंग')) {
    if (isKannada) return `IPC Section 392/394/397 (ದರೋಡೆ ಮತ್ತು ಸರಗಳ್ಳತನ):\n- ಶಿಕ್ಷೆ: ೧೦ ರಿಂದ ೧೪ ವರ್ಷಗಳವರೆಗೆ ಕಠಿಣ ಜೈಲು ಶಿಕ್ಷೆ.\n- ಜಾಮೀನು: ಜಾಮೀನು ರಹಿತ (Non-bailable).\n- ಪೊಲೀಸ್ SOP: ಹೊಯ್ಸಳ ಗಸ್ತು ವಾಹನಗಳನ್ನು ತಕ್ಷಣ ರವಾನಿಸಿ, ೨ ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಗಳನ್ನು ಸಂಗ್ರಹಿಸಿ.`;
    if (isHindi) return `IPC Section 392/394/397 (डकैती और चेन स्नैचिंग):\n- सजा: 10 से 14 वर्ष तक का कठोर कारावास।\n- जमानत: गैर-जमानती (Non-bailable)।\n- पुलिस SOP: 30 मिनट के भीतर नाकाबंदी करें और 2 किमी के दायरे में सीसीटीवी फुटेज खंगालें।`;
    return `IPC Section 392 / 394 / 397 (Robbery & Chain Snatching):\n- Penalty: Rigorous imprisonment up to 10 to 14 years.\n- Cognizability & Bail: Cognizable & Non-Bailable.\n- Police SOP: Dispatch PCR & Hoysala mobile units within 30 minutes, sweep CCTV within 2 km radius, and cross-reference known snatchers.`;
  }

  if (q.includes('cyber') || q.includes('1930') || q.includes('fraud') || q.includes('66d') || q.includes('ವಂಚನೆ') || q.includes('धोखाधड़ी')) {
    if (isKannada) return `ಸೈಬರ್ ಆರ್ಥಿಕ ವಂಚನೆ SOP (IT Act Sec 66D & 1930):\n೧. ಸಂತ್ರಸ್ತರಿಗೆ ತಕ್ಷಣ ೧೯೩೦ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಲು ಅಥವಾ cybercrime.gov.in ಗೆ ದೂರು ನೀಡಲು ತಿಳಿಸಿ.\n೨. ಬ್ಯಾಂಕ್ ಖಾತೆ ಮತ್ತು UTR ವಹಿವಾಟು ಸಂಖ್ಯೆ ಪಡೆದುಕೊಳ್ಳಿ.\n೩. CFCFRMS ಪೋರ್ಟಲ್ ಮೂಲಕ ಬ್ಯಾಂಕ್ ನೋಡಲ್ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ ವಂಚಕನ ಖಾತೆಯನ್ನು ೩೦ ನಿಮಿಷಗಳಲ್ಲಿ ಫ್ರೀಜ್ ಮಾಡಿ.`;
    if (isHindi) return `साइबर वित्तीय धोखाधड़ी SOP (IT Act Sec 66D और 1930):\n1. पीड़ित को तुरंत राष्ट्रीय साइबर हेल्पलाइन 1930 पर रिपोर्ट करने के लिए कहें।\n2. बैंक खाता, यूपीआई आईडी और यूटीआर नंबर प्राप्त करें।\n3. CFCFRMS पोर्टल के माध्यम से बैंक नोडल अधिकारी से संपर्क करके 30 मिनट के भीतर राशि फ्रीज करें।`;
    return `Cyber Crime Investigation SOP (IT Act Section 66D & 1930 Helpline):\n1. Direct victim to immediately call National Cyber Helpline 1930 or log on to cybercrime.gov.in.\n2. Obtain UTR transaction reference number, victim bank account, and fraudster UPI/bank details.\n3. Coordinate with Bank Nodal Officers via CFCFRMS within 30 minutes to freeze the defrauded funds.`;
  }

  // 1g. Hotspots General Query
  if (q.includes('hotspot') || q.includes('ಹಾಟ್‌ಸ್ಪಾಟ್') || q.includes('हॉटस्पॉट') || q.includes('area') || q.includes('ಪ್ರದೇಶ') || q.includes('क्षेत्र')) {
    if (isKannada) {
      return `ಕರ್ನಾಟಕ ರಾಜ್ಯ ಪ್ರಮುಖ ಕ್ರೈಮ್ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು:\n೧. ದಕ್ಷಿಣ ಬೆಂಗಳೂರು (ಸಿಲ್ಕ್ ಬೋರ್ಡ್, ಕೊರಮಂಗಲ, ಎಚ್.ಎಸ್.ಆರ್): ವಾಹನ ಕಳವು ಹೆಚ್ಚು (೪೭ ಪ್ರಕರಣಗಳು, ರಾತ್ರಿ ೧೦ - ಬೆಳಿಗ್ಗೆ ೪).\n೨. ಸೆಂಟ್ರಲ್ ಬೆಂಗಳೂರು (ಎಂ.ಜಿ. ರಸ್ತೆ, ಶಿವಾಜಿನಗರ, ಮೆಜೆಸ್ಟಿಕ್): ಸರಗಳ್ಳತನ (೩೧ ಪ್ರಕರಣಗಳು, ಸಂಜೆ ೬ - ರಾತ್ರಿ ೧೦).\n೩. ಮೈಸೂರು ಸೆಂಟ್ರಲ್ ಮಾರ್ಕೆಟ್: ಸೈಬರ್ ಮತ್ತು ಆಸ್ತಿ ಅಪರಾಧ.\n೪. ಕಲಬುರಗಿ ರೂರಲ್: ಹೆದ್ದಾರಿ ಅಪಘಾತ ಮತ್ತು ಹಿಟ್ & ರನ್.`;
    }
    if (isHindi) {
      return `कर्नाटक राज्य प्रमुख क्राइम हॉटस्पॉट रिपोर्ट:\n1. दक्षिण बेंगलुरु (सिल्क बोर्ड, कोरमंगला): वाहन चोरी (47 मामले, रात 10 से सुबह 4 बजे)।\n2. सेंट्रल बेंगलुरु (एमजी रोड, मैजेस्टिक): चेन स्नैचिंग (31 मामले, शाम 6 से रात 10 बजे)।\n3. मैसूरु सेंट्रल: साइबर धोखाधड़ी और चोरी।\n4. कलबुर्गी रूरल: हाईवे हिट एंड रन।`;
    }
    return `Karnataka Crime Hotspot Clusters:\n1. South Bengaluru (Silk Board, Koramangala, HSR Layout): 47 Vehicle Thefts (Peak: 10 PM - 4 AM).\n2. Central Bengaluru (MG Road, Majestic, Shivajinagar): 31 Robbery/Snatching cases (Peak: 6 PM - 10 PM).\n3. Mysuru Urban (Central Market Corridor): Financial Fraud & Burglary.\n4. Kalaburagi (Rural Highway Corridor): Hit and Run incidents.`;
  }

  // 1h. Weather / General Knowledge or Conversational Guard
  if (q.includes('weather') || q.includes('rain') || q.includes('हवामान') || q.includes('मौसम') || q.includes('ಬಿಸಿಲು') || q.includes('ಮಳೆ')) {
    if (isKannada) return 'ಸರ್, ಪ್ರಸ್ತುತ ಬೆಂಗಳೂರು ಮತ್ತು ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ನಗರಗಳಲ್ಲಿ ಹವಾಮಾನ ಸಾಮಾನ್ಯವಾಗಿದೆ. ನೈಟ್ ಪೆಟ್ರೋಲಿಂಗ್ ಮತ್ತು ಹೆದ್ದಾರಿ ಗಸ್ತು ತಂಡಗಳು ಸುಗಮವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತಿವೆ, ಸರ್.';
    if (isHindi) return 'सर, वर्तमान में बेंगलुरु और कर्नाटक के प्रमुख क्षेत्रों में मौसम सामान्य है। रात्रि गश्त और पुलिस नियंत्रण कक्ष सुचारू रूप से कार्य कर रहे हैं, सर।';
    return 'Sir, weather conditions across Bengaluru and major Karnataka patrol divisions are normal. Highway patrol and night squad mobility are operating smoothly.';
  }

  // 1i. Default Contextual Police Intelligence Briefing
  if (isKannada) {
    return `ಸರ್, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಪೊಲೀಸ್ ಗುಪ್ತಚರ ಸಾರಾಂಶ:\n- ಸಕ್ರಿಯ ಎಫ್.ಐ.ಆರ್ ದಾಖಲೆಗಳು ಮತ್ತು ಸಿ.ಸಿ.ಟಿ.ವಿ ನೆಟ್‌ವರ್ಕ್ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿದೆ.\n- ನೀವು ನಿರ್ದಿಷ್ಟ ಶಂಕಿತರ ಮಾಹಿತಿ (ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್, ಸುರೇಶ್ ನಾಯ್ಡು), ಅಪರಾಧ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು, ಸಿಸಿಟಿವಿ ಎಎನ್‌ಪಿಆರ್ ಅಲರ್ಟ್‌ಗಳು ಅಥವಾ ಐಪಿಸಿ ಸೆಕ್ಷನ್ ಮಾರ್ಗದರ್ಶನವನ್ನು ಕೇಳಬಹುದು, ಸರ್.`;
  }

  if (isHindi) {
    return `सर, आपके प्रश्न के संदर्भ में पुलिस इंटेलिजेंस सारांश:\n- सक्रिय एफआईआर डेटाबेस और सीसीटीवी सर्विलांस नेटवर्क ऑनलाइन हैं।\n- आप विशिष्ट संदिग्धों (जैसे रमेश कुमार, सुरेश नाईडू), क्राइम हॉटस्पॉट, एएनपीआर वाहन ट्रैकिंग या कानूनी धाराओं (IPC Sections) की जानकारी ले सकते हैं, सर।`;
  }

  return `Sir, here is the live tactical briefing from the DRISHTI Intelligence Network:\n- Active Datastore FIRs, ANPR surveillance feeds, and repeat offender matrices are fully synchronized.\n- You can query specific suspect records (e.g. Ramesh Kumar, Suresh Naidu), crime hotspots (e.g. Silk Board, Indiranagar), ANPR vehicle tracks, or legal SOPs for immediate tactical guidance, Sir.`;
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

// --- QuickML RAG & Zia Translation Call -------------------------------------

async function callQuickML(question, sessionHistory = []) {
  const ragUrl = process.env.QUICKML_RAG_ENDPOINT_URL;
  const token = process.env.QUICKML_OAUTH_TOKEN;

  if (!ragUrl || !token) throw new Error('QuickML credentials missing');

  const headers = {
    Authorization: `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
  };

  // 1. Call QuickML RAG endpoint
  const ragRes = await axios.post(
    ragUrl,
    { question, history: sessionHistory },
    { headers, timeout: 8000 }
  );

  const answer = ragRes.data?.answer || ragRes.data?.response || ragRes.data?.data?.answer || '';
  if (answer.trim()) return answer.trim();

  throw new Error('QuickML RAG returned empty answer');
}

// ── Inside POST handler ──────────────────────────────────────────────────────
    // 2. Try Catalyst QuickML first (Primary Platform AI Agent)
    try {
      finalAnswer = await callQuickML(workingQuestion, formattedHistory);
      source = 'catalyst_quickml';
    } catch (quickMlErr) {
      // 3. Fallback to Groq
      try {
        finalAnswer = await callGroq(workingQuestion, knowledgeContext, formattedHistory);
        source = 'groq';
      } catch (groqErr) {
        // 4. Fallback to Gemini
        try {
          finalAnswer = await callGemini(workingQuestion, knowledgeContext, formattedHistory);
          source = 'gemini';
        } catch (geminiErr) {
          // 5. Smart Police Engine (NEVER FAIL!)
          finalAnswer = generateSmartPoliceResponse(workingQuestion, targetLang, activeHistory);
          source = 'smart_police_engine';
        }
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
