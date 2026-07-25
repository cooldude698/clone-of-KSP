/**
 * DRISHTI — Police AI Knowledge Base & Training File
 * 
 * HOW TO TRAIN DRISHTI AI:
 * You can easily add custom questions, crime statistics, suspect records, or police SOPs
 * to this file. DRISHTI will automatically use these training rules to answer queries
 * in simple, detailed English (or Kannada/Hindi).
 *
 * TO ADD A NEW TRAINING RULE:
 * Simply add an object to DRISHTI_CUSTOM_TRAINING:
 * {
 *   keywords: ['your', 'search', 'keywords'],
 *   englishAnswer: "Clear, detailed response for officers in simple English...",
 *   kannadaAnswer: "ಸ್ಪಷ್ಟ ಮತ್ತು ವಿವರವಾದ ಉತ್ತರ..."
 * }
 */

export const DRISHTI_CUSTOM_TRAINING = [
  {
    id: 'bengaluru_crime_report',
    keywords: ['ಬೆಂಗಳೂರಿನ ಅಪರಾಧ', 'ಅಪರಾಧ ವರದಿ', 'bengaluru crime', 'bangalore crime', 'crime report bengaluru', 'bengaluru report', 'city crime'],
    englishAnswer: `BENGALURU CITY CRIME & INTELLIGENCE REPORT:

1. Overview:
   - Total Registered Cases (2026): 489 active FIRs across Bengaluru Urban District.
   - Primary Crime Categories: Vehicle Theft (38%), Robbery & Chain Snatching (24%), Cyber Fraud (22%), Others (16%).

2. Crime Hotspots:
   - South Bengaluru (Koramangala, HSR Layout, Silk Board): High vehicle theft activity (47 cases). Peak hours: 10:00 PM to 4:00 AM.
   - Central Bengaluru (MG Road, Shivajinagar, Majestic): Chain snatching and phone robbery (31 cases). Peak hours: 6:00 PM to 10:00 PM.

3. Key Suspects Under Surveillance:
   - Ramesh Kumar (Alias "Bullet Ramesh"): Wanted in 7 vehicle theft cases. Last detected near Silk Board Junction. Risk Score: 85/100 (HIGH).
   - Imran Khan (Alias "Chotta Imran"): Wanted in 4 chain snatching FIRs near Majestic. Risk Score: 78/100 (HIGH).

4. Active Police Action Required:
   - Increase night patrols at Silk Board, Koramangala 5th Block, and HSR 2nd Stage.
   - Activate ANPR camera watchlists for black Honda Activa (KA-01-EA-4921) and red Pulsar 220 (KA-05-MD-8812).`,
    kannadaAnswer: `ಬೆಂಗಳೂರು ನಗರ ಅಪರಾಧ ಮತ್ತು ಮಾಹಿತಿಯ ಪೂರ್ಣ ವರದಿ:

೧. ಒಟ್ಟು ಪ್ರಕರಣಗಳ ವಿವರ:
   - ೨೦೨೬ರಲ್ಲಿ ಬೆಂಗಳೂರು ನಗರದಲ್ಲಿ ಒಟ್ಟು ೪೮೯ ಸಕ್ರಿಯ ಎಫ್.ಐ.ಆರ್ నమోదు ಆಗಿವೆ.
   - ಪ್ರಮುಖ ಅಪರಾಧಗಳು: ವಾಹನ ಕಳವು (೩೮%), ಸರಗಳ್ಳತನ ಮತ್ತು ದರೋಡೆ (೨೪%), ಸೈಬರ್ ವಂಚನೆ (೨೨%).

೨. ಅಪರಾಧ ಹೆಚ್ಚಿರುವ ಪ್ರಮುಖ ಪ್ರದೇಶಗಳು (ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳು):
   - ದಕ್ಷಿಣ ಬೆಂಗಳೂರು (ಕೊರಮಂಗಲ, ಎಚ್.ಎಸ್.ಆರ್ ಲೇಔಟ್, ಸಿಲ್ಕ್ ಬೋರ್ಡ್): ರಾತ್ರಿ ೧೦ ರಿಂದ ಬೆಳಿಗ್ಗೆ ೪ ರವರೆಗೆ ವಾಹನ ಕಳವು ಹೆಚ್ಚು. (೪೭ ಪ್ರಕರಣಗಳು).
   - ಕೇಂದ್ರ ಬೆಂಗಳೂರು (ಎಂ.ಜಿ. ರಸ್ತೆ, ಶಿವಾಜಿನಗರ, ಮೆಜೆಸ್ಟಿಕ್): ಸಂಜೆ ೬ ರಿಂದ ರಾತ್ರಿ ೧೦ ರವರೆಗೆ ಸರಗಳ್ಳತನ ಹೆಚ್ಚು. (೩೧ ಪ್ರಕರಣಗಳು).

೩. ಪ್ರಮುಖ ಶಂಕಿತ ಅಪರಾಧಿಗಳು:
   - ರಮೇಶ್ ಕುಮಾರ್ (ಅಲಿಯಾಸ್ "ಬುಲೆಟ್ ರಮೇಶ್"): ೭ ವಾಹನ ಕಳವು ಪ್ರಕರಣಗಳಲ್ಲಿ ಬೇಕಾಗಿದ್ದಾನೆ. ಅಪಾಯದ ಮಟ್ಟ: ೮೫/೧೦೦ (ಹೆಚ್ಚು).
   - ಇಮ್ರಾನ್ ಖಾನ್ (ಅಲಿಯಾಸ್ "ಚೋಟಾ ಇಮ್ರಾನ್"): ೪ ಸರಗಳ್ಳತನ ಪ್ರಕರಣಗಳಲ್ಲಿ ಬೇಕಾಗಿದ್ದಾನೆ. ಅಪಾಯದ ಮಟ್ಟ: ೭೮/೧೦೦ (ಹೆಚ್ಚು).

೪. ಪೋಲಿಸ್ ಅಧಿಕಾರಿಗಳು ತಕ್ಷಣ ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ಕ್ರಮಗಳು:
   - ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಮತ್ತು ಕೊರಮಂಗಲ ಪ್ರದೇಶದಲ್ಲಿ ರಾತ್ರಿ ಗಸ್ತು ಹೆಚ್ಚಿಸಬೇಕು.
   - ANPR ಕ್ಯಾಮೆರಾಗಳ ಮೂಲಕ ಕೆ.ಎ-೦೧-ಇಎ-೪೯೨೧ (ಬ್ಲ್ಯಾಕ್ ಆಕ್ಟಿವಾ) ವಾಹನವನ್ನು ಪತ್ತೆಹಚ್ಚಬೇಕು.`
  },
  {
    id: 'mysuru_crime_report',
    keywords: ['mysuru', 'mysore', 'mysuru crime', 'mysore report', 'ಮೈಸೂರು'],
    englishAnswer: `MYSURU DISTRICT CRIME & INTELLIGENCE REPORT:

1. Overview:
   - Total Registered Cases: 142 active FIRs in Mysuru District.
   - Main Categories: Cyber Fraud (40%), Burglary (30%), Tourist Related Offenses (20%), Other (10%).

2. Crime Hotspots:
   - Central Market & Devaraja Market: Pickpocketing & mobile snatching.
   - Vijayanagar & Kuvempunagar: House burglaries during night hours.

3. Key Suspect:
   - Suresh Naidu: 5 active FIRs for burglary and theft. Last seen near Central Market, Mysuru. Risk Score: 78/100.

4. Action Plan:
   - Deploy plainclothes officers around Central Market.
   - Coordinate with Cyber Crime Cell for 1930 portal bank freezes on online fraud victims.`,
    kannadaAnswer: `ಮೈಸೂರು ಜಿಲ್ಲೆಯ ಅಪರಾಧ ವರದಿ:

೧. ಒಟ್ಟು ಪ್ರಕರಣಗಳು: ೧೪೨ ಸಕ್ರಿಯ ಎಫ್.ಐ.ಆರ್.
೨. ಪ್ರಮುಖ ಅಪರಾಧಗಳು: ಸೈಬರ್ ವಂಚನೆ (೪೦%), ಮನೆಗಳ್ಳತನ (೩೦%).
೩. ಪ್ರಮುಖ ಶಂಕಿತ: ಸುರೇಶ್ ನಾಯ್ಡು (೫ ಪ್ರಕರಣಗಳು).
೪. ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮ: ದೇವರಾಜ ಮಾರ್ಕೆಟ್ ಪ್ರದೇಶದಲ್ಲಿ ಬಿಗಿ ಪೋಲಿಸ್ ಕಾವಲು ನಿಯೋಜಿಸುವುದು.`
  },
  {
    id: 'repeat_offenders',
    keywords: ['repeat', 'offender', 'accused', 'suspect', 'gang', 'habitual', 'ಶಂಕಿತರು', 'ಅಪರಾಧಿಗಳು'],
    englishAnswer: `HIGH-RISK REPEAT OFFENDERS LIST (KSP DATABASE):

1. Ramesh Kumar (Alias: "Bullet Ramesh")
   - Total FIRs: 7 (Vehicle Theft, Armed Robbery)
   - Risk Score: 85/100 (HIGH)
   - Modus Operandi: Targets parked two-wheelers near metro stations and bus stops between 10 PM and 4 AM using master keys.
   - Last Known Location: Silk Board Junction / HSR 6th Sector, Bengaluru.

2. Suresh Naidu
   - Total FIRs: 5 (House Burglary, Theft)
   - Risk Score: 78/100 (HIGH)
   - Modus Operandi: Conducts daytime recce of locked houses in residential layouts; breaks locks using iron rods between 1 AM and 3 AM.
   - Last Known Location: Devaraja Market Area, Mysuru.

3. Anand Gowda
   - Total FIRs: 4 (Chain Snatching, Extortion)
   - Risk Score: 72/100 (HIGH)
   - Modus Operandi: Rides stolen high-speed motorcycle with fake number plate; targets elderly women walking alone in morning hours.
   - Last Known Location: Jayanagar 4th Block, Bengaluru.`,
    kannadaAnswer: `ಹೆಚ್ಚು ಅಪಾಯಕಾರಿ ಶಂಕಿತ ಅಪರಾಧಿಗಳ ಪಟ್ಟಿ:

೧. ರಮೇಶ್ ಕುಮಾರ್ (ಅಲಿಯಾಸ್: ಬುಲೆಟ್ ರಮೇಶ್): ೭ ಎಫ್.ಐ.ಆರ್ (ವಾಹನ ಕಳವು). ಅಪಾಯದ ಮಟ್ಟ: ೮೫/೧೦೦.
೨. ಸುರೇಶ್ ನಾಯ್ಡು: ೫ ಎಫ್.ಐ.ಆರ್ (ಮನೆಗಳ್ಳತನ). ಅಪಾಯದ ಮಟ್ಟ: ೭೮/೧೦೦.
೩. ಆನಂದ್ ಗೌಡ: ೪ ಎಫ್.ಐ.ಆರ್ (ಸರಗಳ್ಳತನ). ಅಪಾಯದ ಮಟ್ಟ: ೭೨/೧೦೦.`
  },
  {
    id: 'vehicle_theft_sop',
    keywords: ['vehicle', 'theft', 'stolen', 'bike', 'car', 'auto', '379', 'ಕಳವು', 'ವಾಹನ'],
    englishAnswer: `VEHICLE THEFT INVESTIGATION INSTRUCTIONS (SECTION 379 IPC):

Step 1: Immediately file FIR under Section 379 IPC and enter full vehicle details (Registration No, Engine No, Chassis No, Color) into CCTNS within 2 hours.

Step 2: Add vehicle registration number to the ANPR Camera Alert Watchlist to automatically trace camera hits across junctions.

Step 3: Alert all nearby Police Control Room (PCR) mobile vans and setup temporary checkpoints on main exit roads within 15 km radius.

Step 4: Request CCTV footage from public cameras, shops, and smart city traffic feeds within 2 km of the theft location.

Step 5: Provide official FIR copy to complainant for insurance claim process and alert the Regional Transport Office (RTO).`,
    kannadaAnswer: `ವಾಹನ ಕಳವು ತನಿಖಾ ಮಾರ್ಗದರ್ಶಿ (ಸೆಕ್ಷನ್ ೩೭೯ ಐ.ಪಿ.ಸಿ):

೧. ಎಫ್.ಐ.ಆರ್ ದಾಖಲಿಸಿ ೨ ಗಂಟೆಯೊಳಗೆ CCTNS ತಂತ್ರಾಂಶದಲ್ಲಿ ವಾಹನದ ವಿವರಗಳನ್ನು నమోదు ಮಾಡಿ.
೨. ANPR ಕ್ಯಾಮೆರಾ ವ್ಯವಸ್ಥೆಯಲ್ಲಿ ವಾಹನ ಸಂಖ್ಯೆಯನ್ನು ಸೇರಿಸಿ.
೩. ೧೫ ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ಚೆಕ್‌ಪೋಸ್ಟ್ ಹಾಕಿ ತಪಾಸಣೆ ನಡೆಸಿ.
೪. ಸುತ್ತಮುತ್ತಲಿನ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಾವಳಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`
  },
  {
    id: 'cyber_fraud_sop',
    keywords: ['cyber', 'online', 'fraud', 'bank', 'upi', '1930', 'scam', 'money', 'ಸೈಬರ್', 'ವಂಚನೆ'],
    englishAnswer: `CYBER CRIME & FINANCIAL FRAUD INSTRUCTIONS (IT ACT SEC 66D / 1930 HELPLINE):

Step 1: Ask the victim to immediately call National Cyber Crime Helpline 1930 or log onto cybercrime.gov.in.

Step 2: Note down the transaction details: Victim Bank Account, Fraudster Bank Account / UPI ID, Transaction Reference (UTR) Number, and Date/Time.

Step 3: Register FIR under Section 66D IT Act and Section 420 IPC.

Step 4: Contact the Bank Nodal Officer immediately through Citizen Financial Cyber Fraud Reporting Management System (CFCFRMS) to freeze the money in the fraudster's bank account before it is withdrawn.

Step 5: Track the IP address, mobile number, and WhatsApp details used by the fraudster with the Cyber Crime Unit.`,
    kannadaAnswer: `ಸೈಬರ್ ಅಪರಾಧ ಮತ್ತು ಹಣಕಾಸು ವಂಚನೆ ಮಾರ್ಗದರ್ಶಿ (೧೯೩೦ ಸಹಾಯವಾಣಿ):

೧. ಸಂತ್ರಸ್ತರಿಗೆ ತಕ್ಷಣ ೧೯೩೦ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಲು ತಿಳಿಸಿ.
೨. ವಂಚಕನ ಬ್ಯಾಂಕ್ ಖಾತೆ ಮತ್ತು ಯು.ಪಿ.ಐ ವಿವರಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.
೩. ೩೦ ನಿಮಿಷಗಳ ಒಳಗೆ ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ವಂಚಕನ ಖಾತೆಯನ್ನು ಫ್ರೀಜ್ ಮಾಡಿ.`
  }
];

/**
 * Searches the training base for a matching query.
 */
export function getTrainedResponse(queryText, lang = 'en') {
  if (!queryText || typeof queryText !== 'string') return null;
  const q = queryText.toLowerCase().trim();

  for (const item of DRISHTI_CUSTOM_TRAINING) {
    const match = item.keywords.some(kw => q.includes(kw.toLowerCase()));
    if (match) {
      if (lang === 'kn') return item.kannadaAnswer;
      return item.englishAnswer;
    }
  }

  return null;
}
