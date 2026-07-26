/**
 * DRISHTI — Police AI Knowledge Base & Training File
 * 
 * HOW TO TRAIN DRISHTI AI:
 * You can easily add custom questions, crime statistics, suspect records, or police SOPs
 * to this file. DRISHTI will automatically use these training rules to answer queries
 * in simple, detailed English, Kannada, or Hindi.
 *
 * TO ADD A NEW TRAINING RULE:
 * Simply add an object to DRISHTI_CUSTOM_TRAINING:
 * {
 *   keywords: ['your', 'search', 'keywords'],
 *   englishAnswer: "Clear, detailed response for officers in simple English...",
 *   kannadaAnswer: "ಸ್ಪಷ್ಟ ಮತ್ತು ವಿವರವಾದ ಉತ್ತರ...",
 *   hindiAnswer: "स्पष्ट और विस्तृत उत्तर..."
 * }
 */

export const DRISHTI_CUSTOM_TRAINING = [
  {
    id: 'indiranagar_crime_report',
    keywords: ['indiranagar', 'indira nagar', 'ಇಂದಿರಾನಗರ', 'इंदिरानगर'],
    englishAnswer: `INDIRANAGAR POLICE JURISDICTION CRIME REPORT & INTELLIGENCE:

1. Jurisdiction Overview:
   - Police Station: Indiranagar Police Station (East Zone, Bengaluru).
   - Total Registered Cases (2026): 38 active FIRs.
   - Primary Offenses: Night-time Mobile & Chain Snatching (42%), Vehicle Theft near Pubs/Restaurants (35%), Commercial Burglaries (23%).

2. Specific Crime Hotspots in Indiranagar:
   - 100 Feet Road & 12th Main Junction: High risk for mobile snatching between 10:00 PM and 2:00 AM.
   - 80 Feet Road & HAL 2nd Stage: Vehicle theft target zone for parked 2-wheelers.

3. Active Suspect Under Watch:
   - Anand Gowda (Alias "Speedy Anand"): Wanted in 3 chain snatching cases on 100 Feet Road. Drives black KTM Duke motorcycle. Risk Score: 76/100 (HIGH).

4. Recommended Police Actions:
   - Deploy 2 Hoysala patrol vans on 100 Feet Road during weekend evening hours (8 PM - 2 AM).
   - Verify CCTV feeds from commercial establishments on 12th Main Road.`,
    kannadaAnswer: `ಇಂದಿರಾನಗರ ಪೋಲಿಸ್ ಠಾಣೆ ಅಪರಾಧ ವರದಿ:

೧. ಒಟ್ಟು ಸಕ್ರಿಯ ಪ್ರಕರಣಗಳು: ೩೮ ಎಫ್.ಐ.ಆರ್ నమోదు ಆಗಿವೆ.
೨. ಪ್ರಮುಖ ಅಪರಾಧಗಳು: ರಾತ್ರಿ ವೇಳೆ ಮೊಬೈಲ್ ಹಾಗೂ ಸರಗಳ್ಳತನ (೪೨%), ವಾಹನ ಕಳವು (೩೫%).
೩. ಪ್ರಮುಖ ಪ್ರದೇಶ: ೧೦೦ ಫೀಟ್ ರಸ್ತೆ ಮತ್ತು ೧೨ನೇ ಮೇನ್ ಜಂಕ್ಷನ್ (ರಾತ್ರಿ ೧೦ ರಿಂದ ೨ ಗಂಟೆ).
೪. ಪ್ರಮುಖ ಶಂಕಿತ: ಆನಂದ್ ಗೌಡ (೩ ಸರಗಳ್ಳತನ ಪ್ರಕರಣಗಳು).
೫. ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮ: ೧೦೦ ಫೀಟ್ ರಸ್ತೆಯಲ್ಲಿ ಹೊಯ್ಸಳ ಗಸ್ತು ವಾಹನ ಹೆಚ್ಚಿಸಬೇಕು.`,
    hindiAnswer: `इंदिरानगर पुलिस स्टेशन अपराध रिपोर्ट:

1. कुल सक्रिय मामले: 38 एफ.आई.आर दर्ज हैं।
2. मुख्य अपराध: रात के समय मोबाइल और चेन स्नैचिंग (42%), वाहन चोरी (35%)।
3. मुख्य हॉटस्पॉट: 100 फीट रोड और 12वीं मेन जंक्शन (रात 10 बजे से 2 बजे तक)।
4. प्रमुख संदिग्ध: आनंद गौड़ा (3 चेन स्नैचिंग मामले)।
5. पुलिस कार्रवाई: 100 फीट रोड पर रात की गश्त बढ़ाएं और सीसीटीवी फुटेज की जांच करें।`
  },
  {
    id: 'bengaluru_crime_report',
    keywords: ['ಬೆಂಗಳೂರಿನ ಅಪರಾಧ', 'ಅಪರಾಧ ವರದಿ', 'bengaluru crime', 'bangalore crime', 'crime report bengaluru', 'bengaluru report', 'city crime', 'बेंगलुरु'],
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
   - ANPR ಕ್ಯಾಮೆರಾಗಳ ಮೂಲಕ ಕೆ.ಎ-೦೧-ಇಎ-೪೯೨೧ (ಬ್ಲ್ಯಾಕ್ ಆಕ್ಟಿವಾ) ವಾಹನವನ್ನು ಪತ್ತೆಹಚ್ಚಬೇಕು.`,
    hindiAnswer: `बेंगलुरु शहर अपराध और खुफिया रिपोर्ट:

1. कुल सक्रिय मामले: बेंगलुरु शहरी जिले में 489 एफ.आई.आर दर्ज हैं।
2. मुख्य अपराध श्रेणी: वाहन चोरी (38%), डकैती और चेन स्नैचिंग (24%), साइबर धोखाधड़ी (22%)।
3. प्रमुख हॉटस्पॉट:
   - दक्षिण बेंगलुरु (कोरमंगला, सिल्क बोर्ड): वाहन चोरी के 47 मामले। (रात 10 बजे से सुबह 4 बजे तक)।
   - मध्य बेंगलुरु (एमजी रोड, मैजेस्टिक): चेन स्नैचिंग के 31 मामले। (शाम 6 बजे से रात 10 बजे तक)।
4. मुख्य संदिग्ध: रमेश कुमार (7 मामले, जोखिम स्कोर: 85/100)।
5. आवश्यक पुलिस कार्रवाई: सिल्क बोर्ड और कोरमंगला में रात की गश्त बढ़ाएं।`
  },
  {
    id: 'mysuru_crime_report',
    keywords: ['mysuru', 'mysore', 'mysuru crime', 'mysore report', 'ಮೈಸೂರು', 'मैसूर'],
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
೪. ಕೈಗೊಳ್ಳಬೇಕಾದ ಕ್ರಮ: ದೇವರಾಜ ಮಾರ್ಕೆಟ್ ಪ್ರದೇಶದಲ್ಲಿ ಬಿಗಿ ಪೋಲಿಸ್ ಕಾವಲು ನಿಯೋಜಿಸುವುದು.`,
    hindiAnswer: `मैसूर जिला अपराध रिपोर्ट:

1. कुल मामले: मैसूर जिले में 142 सक्रिय एफ.आई.आर।
2. मुख्य अपराध: साइबर धोखाधड़ी (40%), घर की चोरी (30%)।
3. मुख्य संदिग्ध: सुरेश नायडू (5 मामले)।
4. कार्रवाई: सेंट्रल मार्केट के आसपास सादे कपड़ों में पुलिस तैनात करें।`
  },
  {
    id: 'repeat_offenders',
    keywords: ['repeat', 'offender', 'accused', 'suspect', 'gang', 'habitual', 'ಶಂಕಿತರು', 'ಅಪರಾಧಿಗಳು', 'अपराधी'],
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
೩. ಆನಂದ್ ಗೌಡ: ೪ ಎಫ್.ಐ.ಆರ್ (ಸರಗಳ್ಳತನ). ಅಪಾಯದ ಮಟ್ಟ: ೭೨/೧೦೦.`,
    hindiAnswer: `उच्च जोखिम वाले आदतन अपराधियों की सूची:

1. रमेश कुमार (उपनाम: बुलेट रमेश): 7 मामले (वाहन चोरी)। जोखिम स्कोर: 85/100 (उच्च)।
2. सुरेश नायडू: 5 मामले (घर की चोरी)। जोखिम स्कोर: 78/100 (उच्च)।
3. आनंद गौड़ा: 4 मामले (चेन स्नैचिंग)। जोखिम स्कोर: 72/100 (उच्च)।`
  },
  {
    id: 'vehicle_theft_sop',
    keywords: ['vehicle', 'theft', 'stolen', 'bike', 'car', 'auto', '379', 'ಕಳವು', 'ವಾಹನ', 'चोरी'],
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
೪. ಸುತ್ತಮುತ್ತಲಿನ ಸಿಸಿಟಿವಿ ದೃಶ್ಯಾವಳಿಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`,
    hindiAnswer: `वाहन चोरी जांच निर्देश (धारा 379 आईपीसी):

1. धारा 379 आईपीसी के तहत एफआईआर दर्ज करें और 2 घंटे के भीतर CCTNS में वाहन विवरण दर्ज करें।
2. ANPR कैमरा वॉचलिस्ट में वाहन नंबर जोड़ें।
3. 15 किमी के दायरे में जांच चौकियां (चेकपॉइंट) स्थापित करें।
4. 2 किमी के भीतर सीसीटीवी फुटेज की जांच करें।`
  },
  {
    id: 'cyber_fraud_sop',
    keywords: ['cyber', 'online', 'fraud', 'bank', 'upi', '1930', 'scam', 'money', 'ಸೈಬರ್', 'ವಂಚನೆ', 'साइबर'],
    englishAnswer: `CYBER CRIME & FINANCIAL FRAUD INSTRUCTIONS (IT ACT SEC 66D / 1930 HELPLINE):

Step 1: Ask the victim to immediately call National Cyber Crime Helpline 1930 or log onto cybercrime.gov.in.

Step 2: Note down the transaction details: Victim Bank Account, Fraudster Bank Account / UPI ID, Transaction Reference (UTR) Number, and Date/Time.

Step 3: Register FIR under Section 66D IT Act and Section 420 IPC.

Step 4: Contact the Bank Nodal Officer immediately through Citizen Financial Cyber Fraud Reporting Management System (CFCFRMS) to freeze the money in the fraudster's bank account before it is withdrawn.

Step 5: Track the IP address, mobile number, and WhatsApp details used by the fraudster with the Cyber Crime Unit.`,
    kannadaAnswer: `ಸೈಬರ್ ಅಪರಾಧ ಮತ್ತು ಹಣಕಾಸು ವಂಚನೆ ಮಾರ್ಗದರ್ಶಿ (೧೯೩೦ ಸಹಾಯವಾಣಿ):

೧. ಸಂತ್ರಸ್ತರಿಗೆ ತಕ್ಷಣ ೧೯೩೦ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಲು ತಿಳಿಸಿ.
೨. ವಂಚಕನ ಬ್ಯಾಂಕ್ ಖಾತೆ ಮತ್ತು ಯು.ಪಿ.ಐ ವಿವರಗಳನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.
೩. ೩೦ ನಿಮಿಷಗಳ ಒಳಗೆ ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿಗಳನ್ನು ಸಂಪರ್ಕಿಸಿ ವಂಚಕನ ಖಾತೆಯನ್ನು ಫ್ರೀಜ್ ಮಾಡಿ.`,
    hindiAnswer: `साइबर अपराध और वित्तीय धोखाधड़ी निर्देश (1930 हेल्पलाइन):

1. पीड़ित को तुरंत राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करने के लिए कहें।
2. बैंक खाता, यूपीआई आईडी और यूटीआर नंबर नोट करें।
3. बैंक नोडल अधिकारी से संपर्क करके धोखाधड़ी करने वाले के खाते में पैसे तुरंत फ्रीज करें।`
  },
  {
    id: 'last_24_hours_cases',
    keywords: ['24', '24 घंटे', '24 घंटे में', '24 घंटे में नए मामले', 'पिछले 24 घंटे', 'नये मामले', 'मामले कितने हैं', 'कितने हैं', 'recent cases', 'last 24 hours', '24 hours'],
    englishAnswer: `POLICE INTELLIGENCE REPORT — LAST 24 HOURS CASE BRIEFING:

1. 24-Hour Summary:
   - New FIR Cases Filed (Last 24 Hours): 14 new FIRs registered across Karnataka stations.
   - High-Priority Incidents: 4 vehicle theft cases, 3 cyber helpline 1930 fraud blocks, 2 mobile snatchings.

2. Major Cases Registered:
   - FIR-2026-BL-0492: Vehicle Theft (Section 379 IPC) | Location: South Bengaluru | Status: Under Investigation.
   - FIR-2026-BL-0493: Chain Snatching (Section 392 IPC) | Location: MG Road | Status: Chargesheet Prepared.
   - FIR-2026-MYS-0112: Cyber Financial Fraud | Location: Mysuru | Status: ₹1.45 Lakh Frozen via 1930 Helpline.

3. Surveillance & ANPR Camera Alerts:
   - 3 ANPR camera hits for black Honda Activa (KA-01-EA-4921) near Silk Board Junction.
   - 12 high-risk repeat offenders under active 24-hour surveillance.`,
    kannadaAnswer: `ಕಳೆದ ೨೪ ಗಂಟೆಗಳ ಅಪರಾಧ ವರದಿ ಮತ್ತು ಎಫ್.ಐ.ಆರ್ ಮಾಹಿತಿ:

೧. ಕಳೆದ ೨೪ ಗಂಟೆಗಳ ಸಾರಾಂಶ:
   - ಹೊಸದಾಗಿ ದಾಖಲಾದ ಪ್ರಕರಣಗಳು: ಒಟ್ಟು ೧೪ ನೂತನ ಎಫ್.ಐ.ಆರ್ ಪ್ರಕರಣಗಳು ದಾಖಲಾಗಿವೆ.
   - ಪ್ರಮುಖ ಅಪರಾಧಗಳು: ೪ ವಾಹನ ಕಳವು ಪ್ರಕರಣಗಳು, ೩ ಸೈಬರ್ ೧೯೩೦ ಹೆಲ್ಪ್‌ಲೈನ್ ಹಣ ಫ್ರೀಜ್ ಪ್ರಕರಣಗಳು, ೨ ಮೊಬೈಲ್ ಕಳವು ಪ್ರಕರಣಗಳು.

೨. ದಾಖಲಾದ ಪ್ರಮುಖ ಎಫ್.ಐ.ಆರ್ ಪ್ರಕರಣಗಳು:
   - FIR-2026-BL-0492: ವಾಹನ ಕಳವು (IPC Section 379) | ಪ್ರದೇಶ: ದಕ್ಷಿಣ ಬೆಂಗಳೂರು | ಸ್ಥಿತಿ: ತನಿಖೆಯಲ್ಲಿದೆ.
   - FIR-2026-BL-0493: ಸರಗಳ್ಳತನ (IPC Section 392) | ಪ್ರದೇಶ: ಎಂ.ಜಿ. ರಸ್ತೆ | ಸ್ಥಿತಿ: ಚಾರ್ಜ್‌ಶೀಟ್ ಸಿದ್ಧವಾಗಿದೆ.
   - FIR-2026-MYS-0112: ಸೈಬರ್ ಆರ್ಥಿಕ ವಂಚನೆ | ಪ್ರದೇಶ: ಮೈಸೂರು | ಸ್ಥಿತಿ: ₹೧.೪೫ ಲಕ್ಷ ಹಣ ಫ್ರೀಜ್ ಮಾಡಲಾಗಿದೆ.

೩. ಸಿ.ಸಿ.ಟಿ.ವಿ ಮತ್ತು ANPR ಕ್ಯಾಮೆರಾ ಗಸ್ತು:
   - ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್‌ನಲ್ಲಿ ಕಪ್ಪು ಆಕ್ಟಿವಾ (KA-01-EA-4921) ವಾಹನ ೩ ಬಾರಿ ಪತ್ತೆಯಾಗಿದೆ.`,
    hindiAnswer: `सर, पिछले 24 घंटों की पुलिस इंटेलिजेंस और एफ.आई.आर रिपोर्ट:

1. पिछले 24 घंटों का सारांश:
   - नए दर्ज मामले (पिछले 24 घंटे): कर्नाटक के विभिन्न पुलिस स्टेशनों में कुल 14 नए एफ.आई.आर दर्ज किए गए हैं।
   - प्रमुख घटनाएं: 4 वाहन चोरी के मामले, 3 साइबर हेल्पलाइन 1930 धोखाधड़ी के मामले, 2 मोबाइल छीनने के मामले।

2. दर्ज किए गए प्रमुख एफ़.ಐ.ಆರ್ मामले:
   - FIR-2026-BL-0492: वाहन चोरी (धारा 379 IPC) | स्थान: दक्षिण बेंगलुरु | स्थिति: जांच जारी है।
   - FIR-2026-BL-0493: चेन स्नेचिंग (धारा 392 IPC) | स्थान: एमजी रोड, बेंगलुरु | स्थिति: आरोप पत्र (Chargesheet) तैयार।
   - FIR-2026-MYS-0112: साइबर वित्तीय धोखाधड़ी (IT Act 66D) | स्थान: मैसूरु | स्थिति: 1930 हेल्पलाइन द्वारा ₹1.45 लाख राशि फ़्रीज़ की गई।

3. सर्विलांस और ANPR कैमरा अलर्ट:
   - सिल्क बोर्ड जंक्शन के पास संदिग्ध काली होंडा एक्टिवा (KA-01-EA-4921) के 3 ANPR कैमरा अलर्ट मिले हैं।
   - 12 उच्च-जोखिम वाले आदतन अपराधी 24 घंटे सक्रिय निगरानी में हैं।`
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
      if (lang === 'kn') return item.kannadaAnswer || item.englishAnswer;
      if (lang === 'hi') return item.hindiAnswer || item.englishAnswer;
      return item.englishAnswer;
    }
  }

  return null;
}
