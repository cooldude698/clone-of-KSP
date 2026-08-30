/**
 * nextjs/src/lib/suspect-media.js
 * Centralized High-Fidelity Police Intelligence Facial & Surveillance Media Engine
 * Maps every suspect, FIR record, surveillance ANPR hit, and investigation chronicle entry
 * to authentic South Asian / Indian biometric mugshots and tactical camera capture stills.
 */

// Authentic curated South Asian / Indian portraits for Karnataka State Police suspects
const SUSPECT_MUGSHOTS = {
  'ramesh-kumar': {
    mugshot: '/mugshots/ramesh-kumar.jpg',
    surveillance_still: '/mugshots/ramesh-kumar.jpg',
    alias: 'Bullet Ramesh',
    cctns_id: 'SUS-8842',
    primary_crime: 'Inter-District Vehicle Theft & Fencing',
    anpr_camera: 'CAM-BLR-0045 (Silk Board TTMC Approach)',
    confidence: '98.4%',
    last_seen: 'Silk Board Junction Parking Bay 3, Bengaluru',
    vehicle: 'Hyundai i10 / Bajaj Pulsar (KA-01-MJ-8821)',
  },
  'vikram-malhotra': {
    mugshot: '/mugshots/vikram-malhotra.jpg',
    surveillance_still: '/mugshots/vikram-malhotra.jpg',
    alias: 'Vicky Blade',
    cctns_id: 'SUS-9104',
    primary_crime: 'Cyber Fraud & Cryptocurrency Extortion',
    anpr_camera: 'CAM-WF-0082 (ITPB Main Road Tower Pole)',
    confidence: '96.8%',
    last_seen: 'ITPB Tech Corridor, Whitefield, Bengaluru',
    vehicle: 'Yamaha R15 (KA-03-HA-8820)',
  },
  'anand-shinde': {
    mugshot: '/mugshots/anand-shinde.jpg',
    surveillance_still: '/mugshots/anand-shinde.jpg',
    alias: 'Buda Anand',
    cctns_id: 'SUS-9012',
    primary_crime: 'Organized Vehicle Theft & Border Transit',
    anpr_camera: 'CAM-RAI-0012 (Raichur Balay Circle)',
    confidence: '94.2%',
    last_seen: 'Balay Circle, Raichur Suburban Command',
    vehicle: 'Hero Splendor (KA-36-E-4491)',
  },
  'suresh-naidu': {
    mugshot: '/mugshots/suresh-naidu.jpg',
    surveillance_still: '/mugshots/suresh-naidu.jpg',
    alias: 'Snake Naidu',
    cctns_id: 'SUS-7104',
    primary_crime: 'Armed Robbery & Extortion Syndicate',
    anpr_camera: 'CAM-BLR-0088 (Indiranagar 100ft Road)',
    confidence: '97.5%',
    last_seen: 'Indiranagar 100ft Road / Cubbon Park Fringe',
    vehicle: 'TVS Apache RTR (KA-04-V-9901)',
  },
  'chetan-shetty': {
    mugshot: '/mugshots/chetan-shetty.jpg',
    surveillance_still: '/mugshots/chetan-shetty.jpg',
    alias: 'Chota Chetan',
    cctns_id: 'SUS-2223',
    primary_crime: 'Commercial Property Burglary & Theft',
    anpr_camera: 'CAM-KAL-0014 (Kalaburagi Ring Road)',
    confidence: '91.3%',
    last_seen: 'Thaman Market, Kalaburagi',
    vehicle: 'Honda Activa (KA-32-M-1120)',
  },
  'anand-gowda': {
    mugshot: '/mugshots/anand-gowda.jpg',
    surveillance_still: '/mugshots/anand-gowda.jpg',
    alias: 'Maddur Gowda',
    cctns_id: 'SUS-3302',
    primary_crime: 'Highway Extortion & Cattle Rustling',
    anpr_camera: 'CAM-MY-0012 (Maddur Toll Gate NH-275)',
    confidence: '95.1%',
    last_seen: 'Maddur Toll Plaza, NH-275 Mandya',
    vehicle: 'Mahindra Bolero Pickup (KA-11-P-7704)',
  },
  'vikram-singh': {
    mugshot: '/mugshots/vikram-singh.jpg',
    surveillance_still: '/mugshots/vikram-singh.jpg',
    alias: 'Vicky Singh',
    cctns_id: 'SUS-7712',
    primary_crime: 'Reckless Hit & Run / Road Rage',
    anpr_camera: 'CAM-KAL-0001 (Murty Circle Kalaburagi)',
    confidence: '93.7%',
    last_seen: 'Murty Circle, Kalaburagi Rural',
    vehicle: 'Hyundai Creta (KA-32-N-3309)',
  },
  'vikram-reddy': {
    mugshot: '/mugshots/vikram-reddy.jpg',
    surveillance_still: '/mugshots/vikram-reddy.jpg',
    alias: 'Vicky Reddy',
    cctns_id: 'SUS-5512',
    primary_crime: 'Residential Burglary & Gold Looting',
    anpr_camera: 'CAM-CHI-0002 (Ganesh Marg Market)',
    confidence: '89.6%',
    last_seen: 'Ganesh Marg, Chikkamagaluru',
    vehicle: 'Bajaj Discover (KA-18-H-5501)',
  },
  'bhavani-karpe': {
    mugshot: '/mugshots/bhavani-karpe.jpg',
    surveillance_still: '/mugshots/bhavani-karpe.jpg',
    alias: 'Karpe Madam',
    cctns_id: 'SUS-3401',
    primary_crime: 'Banking Phishing & Digital Loan Scams',
    anpr_camera: 'CAM-BLR-0033 (Prasad Circle Traffic)',
    confidence: '95.4%',
    last_seen: 'Prasad Circle, Bengaluru Urban',
    vehicle: 'Maruti Swift (KA-01-AB-1290)',
  },
  'farid-mirza': {
    mugshot: '/mugshots/farid-mirza.jpg',
    surveillance_still: '/mugshots/farid-mirza.jpg',
    alias: 'Chotta Mirza',
    cctns_id: 'SUS-6091',
    primary_crime: 'Armed Chain Snatching Syndicate',
    anpr_camera: 'CAM-BLR-0021 (Majestic Bus Stand)',
    confidence: '96.2%',
    last_seen: 'Majestic Inter-City Transit Terminal',
    vehicle: 'KTM Duke (KA-05-MJ-3312)',
  },
  'mahika-ramachandran': {
    mugshot: '/mugshots/mahika-ramachandran.jpg',
    surveillance_still: '/mugshots/mahika-ramachandran.jpg',
    alias: 'Mahi Iron',
    cctns_id: 'SUS-7801',
    primary_crime: 'Physical Assault & Turf Extortion',
    anpr_camera: 'CAM-BLR-0041 (Madiwala Lake Road)',
    confidence: '92.8%',
    last_seen: 'Padmanabhan Zila, Bengaluru Urban West',
    vehicle: 'Honda Dio (KA-05-EX-4412)',
  },
  'imran-khan': {
    mugshot: '/mugshots/imran-khan.jpg',
    surveillance_still: '/mugshots/imran-khan.jpg',
    alias: 'Helmet Imran',
    cctns_id: 'SUS-5921',
    primary_crime: 'Commercial MDMA & Narcotics Distribution',
    anpr_camera: 'CAM-BLR-0099 (Wadhwa Outer Ring Road)',
    confidence: '98.9%',
    last_seen: 'Near Wadhwa, Bengaluru Urban East',
    vehicle: 'Royal Enfield Classic (KA-03-NJ-1199)',
  },
  'basha-khan': {
    mugshot: '/mugshots/basha-khan.jpg',
    surveillance_still: '/mugshots/basha-khan.jpg',
    alias: 'Basha Bhai',
    cctns_id: 'SUS-4412',
    primary_crime: 'Highway Cargo Hijacking & Interception',
    anpr_camera: 'CAM-BLR-0012 (Tumakuru Highway Toll)',
    confidence: '94.6%',
    last_seen: 'Nelamangala Toll Post, Bengaluru Rural',
    vehicle: 'Tata 407 (KA-06-B-8811)',
  },
  'deepak-shetty': {
    mugshot: '/mugshots/deepak-shetty.jpg',
    surveillance_still: '/mugshots/deepak-shetty.jpg',
    alias: 'D-Shetty',
    cctns_id: 'SUS-5120',
    primary_crime: 'Financial Extortion & Land Encroachment',
    anpr_camera: 'CAM-MNG-0004 (Mangaluru Port Road)',
    confidence: '91.8%',
    last_seen: 'Hampankatta, Mangaluru City',
    vehicle: 'Toyota Fortuner (KA-19-M-9900)',
  },
  'ravi-shankar': {
    mugshot: '/mugshots/ravi-shankar.jpg',
    surveillance_still: '/mugshots/ravi-shankar.jpg',
    alias: 'Ravi Anna',
    cctns_id: 'SUS-3091',
    primary_crime: 'Illegal Sand Mining & River Transport',
    anpr_camera: 'CAM-SHI-0019 (Shivamogga Bypass)',
    confidence: '93.4%',
    last_seen: 'Bhadravathi Bypass, Shivamogga',
    vehicle: 'Mahindra Bolero (KA-14-E-2234)',
  },
  'saanvi-dara': {
    mugshot: '/mugshots/mahika-ramachandran.jpg',
    surveillance_still: '/mugshots/mahika-ramachandran.jpg',
    alias: 'Saanvi Madam',
    cctns_id: 'SUS-8102',
    primary_crime: 'Senior Citizen Extortion & Coercion',
    anpr_camera: 'CAM-UDU-0003 (Udupi Temple Square)',
    confidence: '90.2%',
    last_seen: 'Das Marg, Udupi Rural',
    vehicle: 'Honda Activa (KA-20-EA-1102)',
  }
};

const FALLBACK_PORTRAITS_MALE = [
  '/mugshots/vikram-malhotra.jpg',
  '/mugshots/imran-khan.jpg',
  '/mugshots/ramesh-kumar.jpg',
  '/mugshots/suresh-naidu.jpg',
  '/mugshots/anand-gowda.jpg',
  '/mugshots/anand-shinde.jpg',
  '/mugshots/basha-khan.jpg',
  '/mugshots/chetan-shetty.jpg',
  '/mugshots/deepak-shetty.jpg',
  '/mugshots/farid-mirza.jpg',
  '/mugshots/ravi-shankar.jpg',
  '/mugshots/vikram-reddy.jpg',
  '/mugshots/vikram-singh.jpg'
];

const FALLBACK_PORTRAITS_FEMALE = [
  '/mugshots/bhavani-karpe.jpg',
  '/mugshots/mahika-ramachandran.jpg'
];

function isFemaleName(name = '') {
  const n = String(name || '').toLowerCase();
  return (
    n.includes('bhavani') ||
    n.includes('mahika') ||
    n.includes('saanvi') ||
    n.includes('anita') ||
    n.includes('priya') ||
    n.includes('sunita') ||
    n.includes('kavitha') ||
    n.includes('lakshmi') ||
    n.includes('pooja') ||
    n.includes('devi') ||
    n.includes('kumari') ||
    n.includes('meera') ||
    n.includes('ananya')
  );
}

export function getSuspectMedia(suspect) {
  if (!suspect) {
    return {
      mugshot: FALLBACK_PORTRAITS_MALE[0],
      surveillance_still: FALLBACK_PORTRAITS_MALE[0],
      alias: 'Unknown Operative',
      cctns_id: 'SUS-0000',
      primary_crime: 'General Offense on File',
      anpr_camera: 'CAM-KSP-DEFAULT',
      confidence: '85.0%',
      last_seen: 'Jurisdiction Area',
      vehicle: 'Unknown Vehicle',
    };
  }

  // 1. Extract name properly whether suspect is a string or an object
  const rawName = typeof suspect === 'string'
    ? suspect
    : (suspect.name || suspect.accused_name || suspect.suspect_name || suspect.target || '');
  const slug = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const idKey = typeof suspect === 'object' ? (suspect.suspect_id || suspect.id || '').toLowerCase() : '';

  if (slug && SUSPECT_MUGSHOTS[slug]) return SUSPECT_MUGSHOTS[slug];
  if (idKey && SUSPECT_MUGSHOTS[idKey]) return SUSPECT_MUGSHOTS[idKey];

  // Try partial name match
  if (slug) {
    for (const [key, media] of Object.entries(SUSPECT_MUGSHOTS)) {
      if (slug.includes(key) || key.includes(slug)) {
        return media;
      }
    }
  }

  // 2. If custom mugshot provided in object that starts with / or http
  if (typeof suspect === 'object' && (suspect.mugshot_url || suspect.mugshot)) {
    const customPic = suspect.mugshot_url || suspect.mugshot;
    if (!customPic.includes('undefined')) {
      return {
        mugshot: customPic,
        surveillance_still: suspect.surveillance_still || customPic,
        alias: suspect.alias || suspect.accused_alias || 'Unknown Alias',
        cctns_id: suspect.suspect_id || suspect.cctns_id || 'SUS-9999',
        primary_crime: suspect.primary_crime || suspect.crime_type || 'General Penal Offense',
        anpr_camera: suspect.anpr_camera || 'CAM-KSP-ACTIVE',
        confidence: suspect.confidence || '92.5%',
        last_seen: suspect.last_known_location || suspect.last_seen || 'Bengaluru Command Area',
        vehicle: suspect.vehicle || 'Unknown Vehicle',
      };
    }
  }

  // 3. Deterministic gender-based fallback from local Indian mugshot pools
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  const isFemale = isFemaleName(rawName) || (typeof suspect === 'object' && suspect.gender?.toLowerCase() === 'female');
  const pool = isFemale ? FALLBACK_PORTRAITS_FEMALE : FALLBACK_PORTRAITS_MALE;
  const index = Math.abs(hash) % pool.length;
  const chosenPic = pool[index];

  return {
    mugshot: chosenPic,
    surveillance_still: chosenPic,
    alias: (typeof suspect === 'object' && suspect.alias) ? suspect.alias : `${rawName.split(' ')[0] || 'Suspect'} Operative`,
    cctns_id: (typeof suspect === 'object' && suspect.suspect_id) ? suspect.suspect_id : `SUS-${Math.abs(hash % 9000 + 1000)}`,
    primary_crime: (typeof suspect === 'object' && (suspect.primary_crime || suspect.crime_type)) || 'Repeat Penal Offense',
    anpr_camera: 'CAM-BLR-INTERCEPT-01',
    confidence: `${(88 + (Math.abs(hash) % 10)).toFixed(1)}%`,
    last_seen: (typeof suspect === 'object' && (suspect.last_known_location || suspect.district_name)) || 'Bengaluru Urban Jurisdiction',
    vehicle: (typeof suspect === 'object' && suspect.vehicle) || 'Vehicle under ANPR scan',
  };
}
