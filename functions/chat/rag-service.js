/**
 * RAG Service for DRISHTI - Karnataka State Police AI Assistant
 * Provides in-memory keyword-matched knowledge base for police SOPs and manuals.
 */

const knowledgeBase = [
  {
    keywords: ['vehicle', 'theft', 'stolen', 'car', 'bike', 'two wheeler'],
    content: `KARNATAKA STATE POLICE - STANDARD OPERATING PROCEDURE FOR VEHICLE THEFT INVESTIGATION
1. FIR Registration: Immediately register a First Information Report (FIR) under Section 379 IPC (Theft) or Section 411 IPC (Dishonestly receiving stolen property) if the stolen vehicle has already been located.
2. CCTNS Entry: The duty officer must register and enter all vehicle details (Registration Number, Engine Number, Chassis Number, Make, Model, Color, and unique identification marks) into the Crime and Criminal Tracking Network & Systems (CCTNS) within 2 hours of the complaint.
3. ANPR Alert: Immediately trigger an alert on the Automatic Number Plate Recognition (ANPR) and camera network systems. Put the vehicle's registration number on the regional watchlist database to flag any traffic or toll crossings.
4. Checkpoint Coordination: Notify traffic police and the control room to set up dynamic nakabandis/checkpoints at key entry/exit points of the jurisdiction.
5. RTO & Insurance Notification: Issue a formal notice/acknowledgment to the complainant for insurance claim purposes and update the regional transport office (RTO) to block any potential transfer of ownership.`
  },
  {
    keywords: ['robbery', 'chain', 'snatch', 'mobile', 'theft', 'armed'],
    content: `KARNATAKA STATE POLICE - STANDARD OPERATING PROCEDURE FOR ROBBERY AND CHAIN SNATCHING
1. Golden Hour Response: Within the first 30 minutes of receiving the alert, dispatch the nearest PCR (Police Control Room) mobile van and Hoysala patrol unit to the scene of occurrence. Block the immediate escape routes of the suspects.
2. Legal Sections: Register the FIR under Section 392 IPC (Robbery), Section 394 IPC (Voluntarily causing hurt in committing robbery), or Section 397 IPC (Robbery or dacoity, with attempt to cause death or grievous hurt) depending on the use of weapons.
3. Witness & Victim Statement: Collect detailed description of suspects (height, clothing, age, language spoken, accent) and the getaway vehicle (color, model, registration number/partial plate).
4. Hospital Coordination: If the victim or any witness has sustained injuries during the struggle or weapon attack, immediately coordinate with the nearest hospital, arrange for medical aid, and collect the Wound Certificate.
5. CCTV Sweep: Task the crime division to perform a prompt sweep of all CCTV cameras (Safe City cameras, private shops, residential apartments) within a 2 km radius of the incident spot to trace the direction of suspect movement.`
  },
  {
    keywords: ['kidnap', 'missing', 'abduction', 'child', 'person missing'],
    content: `KARNATAKA STATE POLICE - STANDARD OPERATING PROCEDURE FOR KIDNAPPING AND ABDUCTION
1. Immediate Action & FIR: Register the FIR immediately under Section 363 IPC (Kidnapping), Section 364 IPC (Kidnapping or abducting in order to murder), or Section 365 IPC (Kidnapping or abducting with intent secretly and wrongfully to confine person). Do not delay registration for jurisdiction check (register Zero FIR if necessary).
2. Phone Tracking: Coordinate with the Cyber Crime Cell to initiate real-time mobile tracking (CDR/IPDR analysis and tower location tracking) of the victim's and suspect's phones.
3. BDDS & Special Teams: In ransom cases, notify the Bomb Detection and Disposal Squad (BDDS) if suspicious packages are sent, and form specialized search teams under the supervision of the Deputy Commissioner of Police (DCP).
4. Media Management Protocol: Restrict the flow of information to media to ensure the safety of the victim. All updates must be authorized exclusively by the SP or DCP to prevent tipping off the abductors.
5. Family Liaison: Assign a dedicated Family Liaison Officer (FLO) of sub-inspector rank or above to support the victim's family, handle ransom calls if any, and maintain communications.`
  },
  {
    keywords: ['cyber', 'online', 'fraud', 'scam', 'digital', 'internet', 'UPI', 'bank'],
    content: `KARNATAKA STATE POLICE - STANDARD OPERATING PROCEDURE FOR CYBERCRIME AND FINANCIAL FRAUD
1. Statutory Provisions: Register complaints under Sections 66C (Identity theft), 66D (Cheating by personation using computer resource), or 67 (Publishing obscene material) of the Information Technology (IT) Act, 2000, alongside relevant sections of the Bharatiya Nyaya Sanhita (formerly IPC 420).
2. National Portal: Guide the victim to file an immediate report on the National Cyber Crime Reporting Portal (cybercrime.gov.in) or call the toll-free helpline number 1930.
3. Account Freeze (Golden Hour): Within 30 minutes of detection, coordinate with the Bank Nodal Officers and Payment Gateways using the Citizen Financial Cyber Fraud Reporting System to freeze the beneficiary accounts and block the flow of defrauded funds.
4. Digital Evidence: Secure email headers, IP logs, transaction screenshots, UPI transaction IDs, and URL links, maintaining the hash value for chain of custody.`
  },
  {
    keywords: ['domestic', 'violence', 'assault', 'wife', 'husband', 'family', 'DV'],
    content: `KARNATAKA STATE POLICE - STANDARD OPERATING PROCEDURE FOR DOMESTIC VIOLENCE CASES
1. PWDVA Notification: Under the Protection of Women from Domestic Violence Act (PWDVA), 2005, the station house officer (SHO) must notify the designated Protection Officer within 24 hours of receiving the domestic violence complaint.
2. Immediate Safety: Ensure the safety of the victim. If required, coordinate with registered shelter homes and NGOs for temporary safe accommodation.
3. Medical Examination: For physical assault, immediately arrange a mandatory medical examination at a government hospital. The medical report must document all signs of physical abuse.
4. FIR Registration: Register FIR under Section 498A IPC (Husband or relative of husband of a woman subjecting her to cruelty), and other appropriate assault sections (IPC 323/324/506).
5. Counseling & Legal Aid: Provide contact details of the District Legal Services Authority (DLSA) for legal aid and arrange professional counseling sessions if requested.`
  },
  {
    keywords: ['drug', 'narcotics', 'NDPS', 'ganja', 'cocaine', 'contraband'],
    content: `KARNATAKA STATE POLICE - STANDARD OPERATING PROCEDURE FOR NDPS CASES (DRUG SEIZURES)
1. Act Application: Register cases under the Narcotic Drugs and Psychotropic Substances (NDPS) Act, 1985, applying sections based on commercial, intermediate, or small quantities (Section 20 for Cannabis, Section 22 for Psychotropic substances, Section 27 for consumption).
2. Search & Panchanama: Conduct searches in the presence of a Gazetted Officer or a Magistrate as mandated by Section 50 NDPS Act. Draw a meticulous Panchanama (seizure memo) signed by at least two independent local witnesses at the spot of seizure.
3. FSL Sample Collection: Take duplicate samples of the seized contraband. Seal the samples in the presence of the Panches and the Investigating Officer, using a distinct station seal. Dispatch the samples to the Forensic Science Laboratory (FSL) within 72 hours for chemical analysis.
4. Special Court & Reporting: Submit a detailed report of the arrest and seizure to the immediate official superior within 48 hours (Section 57 NDPS). Ensure the accused is produced before the Special NDPS Court within 24 hours.
5. Informant Protection: Ensure complete anonymity of the drug informant in all official logs and reports.`
  },
  {
    keywords: ['FIR', 'first information report', 'complaint', 'register', 'case'],
    content: `KARNATAKA STATE POLICE - MANUAL ON FIR REGISTRATION PROCEDURE
1. Legal Obligation: Under Section 154 CrPC (or Section 173 BNSS), register an FIR immediately if the complaint discloses the commission of a cognizable offense.
2. Zero FIR: If the offense was committed outside the local police station limits, register a 'Zero FIR' immediately and transfer the file to the concerned police station within 24 hours without delay.
3. CCTNS Mandates: Ensure all mandatory fields in the CCTNS portal (complainant details, date/time of occurrence, place of occurrence, act and sections, detail of accused) are fully filled out.
4. Time-Bound Actions: The FIR copy must be dispatched to the concerned Magistrate within 24 hours of registration.
5. E-FIR & Acknowledgment: For non-heinous offenses like vehicle theft or document loss, support e-FIR filing. Provide a free printed copy of the FIR acknowledgment receipt to the complainant immediately.`
  },
  {
    keywords: ['ANPR', 'camera', 'CCTV', 'surveillance', 'plate', 'vehicle check'],
    content: `KARNATAKA STATE POLICE - PROTOCOL FOR ANPR & SURVEILLANCE CAMERA NETWORK
1. ANPR Watchlist: To track a suspect or stolen vehicle, send a formal request containing the vehicle registration number and case details to the District Control Room to trigger the Automatic Number Plate Recognition (ANPR) watchlist.
2. Camera Request: Request real-time monitoring and active surveillance feeds through the District Control Room or Safe City Command Center, detailing the target area and search parameters.
3. Footage Preservation: Issue an official letter to the concerned private establishment or civic agency to preserve CCTV footage within the critical 72-hour window, as many systems auto-delete recordings after 3 to 7 days.
4. Chain of Custody: When retrieving footage, copy the raw file to a new, unused storage medium (CD/USB). Obtain a certificate under Section 65B of the Indian Evidence Act (or Section 63 BSA) from the system administrator or person in charge of the device to validate the digital evidence.`
  },
  {
    keywords: ['patrol', 'beat', 'night', 'duty', 'PCR'],
    content: `KARNATAKA STATE POLICE - NIGHT PATROL AND BEAT MANAGEMENT PROCEDURE
1. Beat Book Maintenance: Every Beat Police Officer must carry the physical or digital Beat Book. Log the visits to critical points (banks, jewelry shops, senior citizen residences) by scanning QR codes or signing the beat registers.
2. PCR & Hoysala Coordination: Coordinate night patrols with Police Control Room (PCR) vans and Hoysala patrol vehicles. Ensure overlapping patrol routes to cover blind spots.
3. Suspicious Vehicle Checks: During night duty (10:00 PM to 5:00 AM), conduct random checks on suspicious vehicles, verify driver details on the e-Gujari or CCTNS vehicle database, and log any suspicious loitering.
4. Inter-Unit Communication: Beat officers and patrol teams must report their location, status, and any unusual activity to the station duty officer or control room every 2 hours without fail.`
  },
  {
    keywords: ['IPC', 'section', 'law', 'penal', 'code', 'charge', 'offence'],
    content: `KARNATAKA STATE POLICE - QUICK REFERENCE SHEET FOR CRIMINAL LAW SECTIONS (IPC / BNS)
Common Indian Penal Code (IPC) sections and corresponding offenses:
- Section 302: Punishment for Murder. Applied in cases of intentional homicide.
- Section 307: Attempt to Murder. Applied when there is intention and act towards murder.
- Section 376: Punishment for Rape. Applied in sexual assault cases.
- Section 379: Punishment for Theft. Applied in cases of simple theft (e.g., vehicle theft, pickpocketing).
- Section 392: Punishment for Robbery. Used in cases of theft with force/intimidation.
- Section 363: Punishment for Kidnapping. Applied for abduction/kidnapping of persons.
- Section 420: Cheating and dishonestly inducing delivery of property. Applied in scams and fraud.
- Section 498A: Husband or relative of husband of a woman subjecting her to cruelty. Applied in domestic abuse.
- Section 506: Punishment for Criminal Intimidation. Applied in cases of threat to life or property.`
  }
];

/**
 * Searches the in-memory knowledge base for matching entries based on keywords.
 * @param {string} query - The search query string.
 * @returns {string} - Combined content of the top 2 matching entries, or a fallback string.
 */
function searchPoliceManuals(query) {
  if (typeof query !== 'string' || !query.trim()) {
    return "Refer to Karnataka Police standing orders and CCTNS manual for procedural guidance.";
  }

  const queryLower = query.toLowerCase();

  const scoredEntries = knowledgeBase.map(entry => {
    let score = 0;
    for (const keyword of entry.keywords) {
      const kwLower = keyword.toLowerCase();
      let index = queryLower.indexOf(kwLower);
      while (index !== -1) {
        if (kwLower.length <= 3) {
          // Strict word boundary check for short terms (like car, DV, FIR, IPC, PCR, UPI)
          const charBefore = index > 0 ? queryLower[index - 1] : '';
          const charAfter = index + kwLower.length < queryLower.length ? queryLower[index + kwLower.length] : '';
          const isWordBoundaryBefore = !charBefore || /[^a-zA-Z0-9_]/.test(charBefore);
          const isWordBoundaryAfter = !charAfter || /[^a-zA-Z0-9_]/.test(charAfter);
          if (isWordBoundaryBefore && isWordBoundaryAfter) {
            score++;
          }
        } else {
          // Simple substring search for longer terms to allow tenses/plurals (e.g. kidnapping, stolen, vehicles)
          score++;
        }
        index = queryLower.indexOf(kwLower, index + kwLower.length);
      }
    }
    return { entry, score };
  });

  const matchingEntries = scoredEntries
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matchingEntries.length === 0) {
    return "Refer to Karnataka Police standing orders and CCTNS manual for procedural guidance.";
  }

  // Return top 2 entries' content joined by "\n\n---\n\n"
  const topContents = matchingEntries
    .slice(0, 2)
    .map(item => item.entry.content);

  return topContents.join("\n\n---\n\n");
}

module.exports = {
  searchPoliceManuals
};
