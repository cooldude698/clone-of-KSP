// Shared persistent in-memory store for DRISHTI FIR records & suspects
// Isomorphic (works seamlessly in both server API routes and client browser components)

const INITIAL_VIKRAM_FIR = {
  case_number: 'FIR-2026-BL-9104',
  suspect_name: 'Vikram Malhotra',
  accused_name: 'Vikram Malhotra',
  date_filed: '2026-07-22',
  time_filed: '13:45:00',
  crime_type_code: 'cyber_fraud',
  crime_type: 'Cyber Fraud',
  district_name: 'Bengaluru Urban',
  police_station: 'Whitefield Cyber Crime PS / CEN Command',
  location_name: 'ITPB Main Road, Whitefield Tech Park Corridor, Bengaluru',
  status: 'under_investigation',
  case_status: 'under_investigation',
  investigation_office: 'ACP Meena K. Swamy',
  risk_score: 88,
  description: 'FIR registered at Whitefield Cyber Crime PS for Cyber Fraud. Primary Suspect: Vikram Malhotra (Alias: Vicky Blade / Shadow Vicky). Location: ITPB Main Road, Whitefield. Offence Brief: Spear-phishing tokens deployed to compromise corporate executive credentials, extorting cryptocurrency payments.',
  full_text: `================================================================================
          KARNATAKA STATE POLICE (KSP) — FIRST INFORMATION REPORT (FIR)
            [Under Section 154 Cr.P.C. / Section 173 Bharatiya Nagarik Suraksha Sanhita]
================================================================================

1. DISTRICT & POLICE STATION DETAILS:
   - State: Karnataka
   - District: Bengaluru Urban (Cyber & Economic Offences Division)
   - Police Station: Whitefield Cyber Crime PS / CEN Command
   - Year: 2026
   - FIR Case Number: FIR-2026-BL-9104
   - Date & Time of FIR Registration: 22-JUL-2026 at 13:45:00 IST

2. ACTS & LEGAL SECTIONS:
   - Section 66D IT Act: Punishment for Cheating by Personation using Computer Resource
   - Section 66E IT Act: Violation of Data Privacy & Unauthorized Credentials Theft
   - Section 384 IPC: Extortion of Funds
   - Section 420 IPC: Cheating and Dishonestly Inducing Delivery of Property

3. OCCURRENCE OF OFFENCE:
   - Date & Time From: 22-JUL-2026 at 11:30:00 IST
   - Place of Occurrence: ITPB Main Road, Whitefield Tech Park Corridor, Bengaluru
   - Distance & Direction from PS: 2.5 KM North from Whitefield CEN Police Station
   - Geo-Coordinates: Lat 12.9860° N, Lng 77.7380° E

4. COMPLAINANT / INFORMANT DETAILS:
   - Name: Dr. Rajesh V. Nambiar
   - Father's Name: Sri V. K. Nambiar
   - Occupation: Vice President of Technology, Apex Cloud Solutions Ltd.
   - Contact Number: +91 99001 XXXXX
   - Address: Suite 501, Tech Tower 3, ITPB Main Road, Whitefield, Bengaluru - 560066

5. ACCUSED & SUSPECT PROFILE (IDENTIFIED BY CYBER CELL & CCTNS DATASTORE):
   - Primary Suspect Name: Vikram Malhotra
   - Alias / Street Name: "Vicky Blade" / "Shadow Vicky"
   - CCTNS Suspect ID: SUS-9104
   - Age: 29 Years | Gender: Male
   - Criminal Risk Score: 88/100 (HIGH RISK CYBER & FINANCIAL OFFENDER)
   - Prior Active FIRs: 4 Active FIR Cases in Bengaluru & Mysuru Cyber Cells
   - Modus Operandi (MO): Deploys spear-phishing tokens to compromise corporate executive credentials, hijacks active sessions, extorts cryptocurrency payments, and launders funds via decentralized P2P crypto exchanges.

6. STOLEN ASSETS & FRAUDULENT TRANSACTION SPECIFICATIONS:
   - Extorted Amount / Valuables: ₹14,50,000/- (Rupees Fourteen Lakh Fifty Thousand Only)
   - Destination Crypto Wallet Address: 0x71C92a83F11B902A7911A0413bC217594
   - Fraudulent UPI VPA Handle: vicky.malhotra@okicici
   - Beneficiary Bank Branch: Federal Bank, Indiranagar Branch, Bengaluru
   - Target System IP Address: 185.220.101.42 (Routed via Encrypted Proxy)

7. SURVEILLANCE & DIGITAL EVIDENCE LOG:
   - Surveillance Camera ID: CAM-WF-0082 (ITPB Junction Gate 2 Tower Pole)
   - Suspect Vehicle Detected: Black Yamaha R15 (Registration: KA-03-HA-8820)
   - Sighting Timestamp: 22-JUL-2026 at 12:05:30 IST
   - Cyber Tower IPDR Sighting: Connected to Cell Tower ID #WF-4091 within 300m radius of victim location.

8. INVESTIGATION BRIEF & ACTION DIRECTIVES:
   - Action Taken: FIR Registered under IT Act §§ 66D, 66E & IPC §§ 384, 420.
   - Bank Account Freeze: Emergency freeze order issued via National Cyber Helpline 1930 portal to stop fund withdrawal.
   - ANPR Alert Status: Registration KA-03-HA-8820 added to Whitefield ANPR Watchlist grid.
   - Investigating Officer (IO): ACP Meena K. Swamy (Badge # KSP-5120, Whitefield CEN PS).

================================================================================
                     OFFICIAL DIGITAL SEAL — KARNATAKA STATE POLICE
================================================================================`,
  source: 'Uploaded FIR Document',
  file_name: 'FIR_SAMPLE_VIKRAM_MALHOTRA.txt',
  uploaded_at: '2026-07-26T13:45:00.000Z'
};

const INITIAL_VIKRAM_SUSPECT = {
  name: 'Vikram Malhotra',
  accused_name: 'Vikram Malhotra',
  alias: 'Vicky Blade / Shadow Vicky',
  risk_score: 88,
  status: 'Active Absconding',
  district: 'Bengaluru Urban',
  district_name: 'Bengaluru Urban',
  active_firs: 1,
  primary_crime: 'Cyber Fraud & Extortion',
  primary_modus_operandi: 'Cyber Fraud & Extortion',
  known_hangouts: ['ITPB Main Road', 'Hope Farm Signal', 'Whitefield Tech Park'],
  last_known_location: 'ITPB Main Road, Whitefield Tech Park Corridor, Bengaluru',
  cases: ['FIR-2026-BL-9104'],
  police_station: 'Whitefield Cyber Crime PS / CEN Command'
};

if (!globalThis.UPLOADED_FIRS || globalThis.UPLOADED_FIRS.length === 0) {
  globalThis.UPLOADED_FIRS = [INITIAL_VIKRAM_FIR];
}
if (!globalThis.UPLOADED_SUSPECTS || globalThis.UPLOADED_SUSPECTS.length === 0) {
  globalThis.UPLOADED_SUSPECTS = [INITIAL_VIKRAM_SUSPECT];
}

export function persistUploadedStore(firs, suspects) {
  globalThis.UPLOADED_FIRS = firs;
  globalThis.UPLOADED_SUSPECTS = suspects;
}

export const UPLOADED_FIRS = globalThis.UPLOADED_FIRS;
export const UPLOADED_SUSPECTS = globalThis.UPLOADED_SUSPECTS;
