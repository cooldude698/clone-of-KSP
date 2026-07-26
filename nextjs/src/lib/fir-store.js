/**
 * nextjs/src/lib/fir-store.js
 * Shared FIR Registry to ensure 100% consistency between Dashboard and FIR Detail Views.
 */

export function getNormalizedCrimeCode(crimeType, crimeTypeCode) {
  const str = String(crimeTypeCode || crimeType || '').toLowerCase();
  if (str.includes('hit') || str.includes('run') || str.includes('accident')) return 'hit_and_run';
  if (str.includes('drug') || str.includes('narcot') || str.includes('ndps') || str.includes('substance')) return 'drug_offence';
  if (str.includes('theft') || str.includes('vehicle') || str.includes('auto')) return 'vehicle_theft';
  if (str.includes('burgla') || str.includes('housebreak')) return 'burglary';
  if (str.includes('robbery') || str.includes('snatch')) return 'robbery';
  if (str.includes('cyber') || str.includes('phish') || str.includes('hack')) return 'cybercrime';
  if (str.includes('fraud') || str.includes('cheat')) return 'fraud';
  if (str.includes('senior') || str.includes('elder')) return 'senior_citizen_crime';
  if (str.includes('domestic') || str.includes('women')) return 'domestic_violence';
  if (str.includes('assault') || str.includes('hurt')) return 'assault';
  return 'property_crime';
}

export function saveFIRsToStore(firs) {
  if (typeof window === 'undefined' || !Array.isArray(firs)) return;
  try {
    const store = {};
    firs.forEach(f => {
      if (f && f.case_number) {
        store[f.case_number] = f;
      }
    });
    localStorage.setItem('drishti_firs_registry', JSON.stringify(store));
  } catch (e) {}
}

export function getFIRFromStore(caseNumber) {
  if (typeof window !== 'undefined' && caseNumber) {
    try {
      const raw = localStorage.getItem('drishti_firs_registry');
      if (raw) {
        const store = JSON.parse(raw);
        if (store[caseNumber]) return store[caseNumber];
      }
    } catch (e) {}
  }
  return null;
}
