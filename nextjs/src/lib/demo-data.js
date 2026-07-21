/**
 * nextjs/src/lib/demo-data.js
 * Comprehensive, realistic demo fallback dataset for DRISHTI platform.
 */

export const DEMO_FIRS = {
  firs: [
    {
      case_number: "FIR-2026-BL-4921",
      date_filed: "2026-07-18",
      time_filed: "14:20:00",
      crime_type_code: "vehicle_theft",
      crime_type: "Vehicle Theft (IPC 379)",
      description: "Stolen Pulsar 220 Black (KA-01-MJ-8821) outside Silk Board metro station approach road.",
      status: "under_investigation",
      case_status: "under_investigation",
      district_name: "Bengaluru Urban",
      police_station: "HSR Layout PS",
      location_name: "Silk Board Junction",
      location_lat: 12.9175,
      location_lng: 77.6215,
      accused_name: "Ramesh Kumar",
      risk_score: 94,
      investigation_office: "Inspector V. Sharma"
    },
    {
      case_number: "FIR-2026-MY-1103",
      date_filed: "2026-07-17",
      time_filed: "22:15:00",
      crime_type_code: "robbery",
      crime_type: "Armed Robbery (IPC 392)",
      description: "Two armed men on Pulsar bike intercepted commercial transport van carrying electronics.",
      status: "open",
      case_status: "open",
      district_name: "Mysuru",
      police_station: "Cubbon Park PS",
      location_name: "MG Road Corridor",
      location_lat: 12.9762,
      location_lng: 77.6033,
      accused_name: "Suresh Naidu",
      risk_score: 88,
      investigation_office: "Sub-Inspector K. Patil"
    },
    {
      case_number: "FIR-2026-BL-4920",
      date_filed: "2026-07-16",
      time_filed: "09:45:00",
      crime_type_code: "chain_snatching",
      crime_type: "Chain Snatching (IPC 379A)",
      description: "Gold chain snatched from pedestrian by two masked helmeted suspects near ITPL entrance.",
      status: "under_investigation",
      case_status: "under_investigation",
      district_name: "Bengaluru Urban",
      police_station: "Whitefield PS",
      location_name: "ITPL Main Road",
      location_lat: 12.9698,
      location_lng: 77.7499,
      accused_name: "Imran Khan",
      risk_score: 76,
      investigation_office: "Inspector R. Deshmukh"
    },
    {
      case_number: "FIR-2026-HB-0872",
      date_filed: "2026-07-15",
      time_filed: "18:30:00",
      crime_type_code: "burglary",
      crime_type: "Housebreaking / Burglary (IPC 406)",
      description: "Residential night break-in during owner travel. Jewels and cash looted.",
      status: "closed",
      case_status: "closed",
      district_name: "Hubballi-Dharwad",
      police_station: "Old Town PS",
      location_name: "Hubballi Old Town",
      location_lat: 15.3647,
      location_lng: 75.1240,
      accused_name: "Vikram Reddy",
      risk_score: 65,
      investigation_office: "Inspector S. Gowda"
    },
    {
      case_number: "FIR-2026-MG-0491",
      date_filed: "2026-07-14",
      time_filed: "11:10:00",
      crime_type_code: "cyber_fraud",
      crime_type: "Financial Cyber Fraud (IT Act 66D)",
      description: "Phishing scam impersonating KSP traffic fine portal, unauthorized wallet transfer of Rs 1.8 Lakh.",
      status: "under_investigation",
      case_status: "under_investigation",
      district_name: "Mangaluru",
      police_station: "Mangaluru East PS",
      location_name: "Kadur Road",
      location_lat: 12.9141,
      location_lng: 74.8560,
      accused_name: "Unknown Hacker",
      risk_score: 82,
      investigation_office: "Cyber Cell SP Office"
    },
    {
      case_number: "FIR-2026-BG-0312",
      date_filed: "2026-07-12",
      time_filed: "02:40:00",
      crime_type_code: "kidnapping",
      crime_type: "Attempted Kidnapping (IPC 363)",
      description: "SUV attempted forced pickup of student. Intercepted by night patrol unit.",
      status: "chargesheeted",
      case_status: "chargesheeted",
      district_name: "Belagavi",
      police_station: "Belagavi City PS",
      location_name: "Tilakwadi Circle",
      location_lat: 15.8497,
      location_lng: 74.4977,
      accused_name: "Anand Shinde",
      risk_score: 91,
      investigation_office: "Inspector G. Hegde"
    }
  ],
  total_count: 492
};

export const DEMO_HOTSPOTS = {
  hotspots: [
    {
      area_name: "Silk Board Junction Corridor",
      district: "Bengaluru Urban",
      crime_count: 48,
      severity_score: 9.5,
      risk_level: "critical",
      primary_crime: "Vehicle Theft & Extortion",
      lat: 12.9175,
      lng: 77.6215
    },
    {
      area_name: "MG Road Signal Approach",
      district: "Bengaluru Urban",
      crime_count: 32,
      severity_score: 8.2,
      risk_level: "high",
      primary_crime: "Armed Robbery & Snatching",
      lat: 12.9762,
      lng: 77.6033
    },
    {
      area_name: "Mysuru Palace West Gate",
      district: "Mysuru",
      crime_count: 24,
      severity_score: 7.1,
      risk_level: "high",
      primary_crime: "Tourist Pickpocketing",
      lat: 12.3051,
      lng: 76.6551
    },
    {
      area_name: "Hubballi Old Town Railway Approach",
      district: "Hubballi-Dharwad",
      crime_count: 18,
      severity_score: 5.8,
      risk_level: "medium",
      primary_crime: "Commercial Burglary",
      lat: 15.3647,
      lng: 75.1240
    },
    {
      area_name: "Mangaluru Port Container Yard",
      district: "Mangaluru",
      crime_count: 12,
      severity_score: 4.2,
      risk_level: "medium",
      primary_crime: "Cargo Pilferage",
      lat: 12.9141,
      lng: 74.8560
    }
  ]
};

export const DEMO_TRENDS = {
  trend_data: [
    { period: "2025-08", count: 142, change_pct: 2.1, is_spike: false },
    { period: "2025-09", count: 128, change_pct: -9.8, is_spike: false },
    { period: "2025-10", count: 165, change_pct: 28.9, is_spike: true },
    { period: "2025-11", count: 139, change_pct: -15.7, is_spike: false },
    { period: "2025-12", count: 184, change_pct: 32.3, is_spike: true },
    { period: "2026-01", count: 191, change_pct: 3.8, is_spike: false },
    { period: "2026-02", count: 172, change_pct: -9.9, is_spike: false },
    { period: "2026-03", count: 210, change_pct: 22.1, is_spike: false },
    { period: "2026-04", count: 245, change_pct: 16.6, is_spike: false },
    { period: "2026-05", count: 268, change_pct: 9.3, is_spike: false },
    { period: "2026-06", count: 289, change_pct: 7.8, is_spike: false },
    { period: "2026-07", count: 312, change_pct: 7.9, is_spike: false }
  ],
  seasonal_insight: "Crime analysis indicates peak vehicle theft frequency during weekend late-night windows (22:00-03:00) near transit hubs.",
  overall_trend: "increasing",
  average_per_period: 203.75,
  spike_periods: ["2025-10", "2025-12"]
};

export const DEMO_UNDERREPORTING = {
  dark_zones: [
    {
      area_name: "KSRTC Satellite Bus Stand Back Alley",
      district: "Bengaluru Urban",
      reported_crimes: 4,
      estimated_actual_crimes: 28,
      underreporting_index: 85.7,
      confidence_score: 92,
      primary_reason: "Lack of lighting & CCTV coverage leading to non-reporting"
    },
    {
      area_name: "Hebbal Flyover Lower Loop",
      district: "Bengaluru Urban",
      reported_crimes: 7,
      estimated_actual_crimes: 34,
      underreporting_index: 79.4,
      confidence_score: 88,
      primary_reason: "Transient victim population hesitant to file FIRs"
    },
    {
      area_name: "Banaswadi Outer Ring Service Road",
      district: "Bengaluru Urban",
      reported_crimes: 12,
      estimated_actual_crimes: 41,
      underreporting_index: 70.7,
      confidence_score: 84,
      primary_reason: "Late night commercial corridor blindspot"
    },
    {
      area_name: "Whitefield Inner Circle Park",
      district: "Bengaluru Urban",
      reported_crimes: 3,
      estimated_actual_crimes: 19,
      underreporting_index: 84.2,
      confidence_score: 89,
      primary_reason: "Low police patrol frequency during midnight hours"
    }
  ]
};

export const DEMO_REPEAT_OFFENDERS = {
  high_risk_count: 38,
  suspects: [
    {
      suspect_id: "SUS-8842",
      name: "Ramesh Kumar",
      alias: "Bullet Ramesh",
      risk_score: 94,
      primary_modus_operandi: "Vehicle Theft & Inter-district Transport",
      associated_firs: ["FIR-2026-BL-4921", "FIR-2026-BL-1104", "FIR-2025-MY-892"],
      known_hangouts: ["Silk Board TTMC", "Hosur Border Checkpost"],
      status: "ACTIVE_WATCHLIST",
      phone: "+91 98450 12890"
    },
    {
      suspect_id: "SUS-7104",
      name: "Suresh Naidu",
      alias: "Snake Naidu",
      risk_score: 88,
      primary_modus_operandi: "Armed Robbery & Highway Interception",
      associated_firs: ["FIR-2026-MY-1103", "FIR-2025-BL-9912"],
      known_hangouts: ["Cubbon Park Fringe", "Kengeri Toll"],
      status: "ABSCONDING",
      phone: "+91 97412 88301"
    },
    {
      suspect_id: "SUS-5921",
      name: "Imran Khan",
      alias: "Helmet Imran",
      risk_score: 76,
      primary_modus_operandi: "Pillion Chain Snatching",
      associated_firs: ["FIR-2026-BL-4920"],
      known_hangouts: ["Whitefield ITPL Road", "Marathahalli Bridge"],
      status: "UNDER_SURVEILLANCE",
      phone: "+91 99001 44512"
    }
  ]
};

export const DEMO_NETWORK_GRAPH = {
  nodes: [
    { id: "SUS-8842", label: "Ramesh Kumar (SUS-8842)", type: "suspect", risk: 94, role: "Gang Leader" },
    { id: "SUS-7104", label: "Suresh Naidu (SUS-7104)", type: "suspect", risk: 88, role: "Co-Accused" },
    { id: "SUS-5921", label: "Imran Khan (SUS-5921)", type: "suspect", risk: 76, role: "Snatcher" },
    { id: "FIR-2026-BL-4921", label: "FIR-2026-BL-4921", type: "fir", crime: "Vehicle Theft" },
    { id: "FIR-2026-MY-1103", label: "FIR-2026-MY-1103", type: "fir", crime: "Armed Robbery" },
    { id: "FIR-2026-BL-4920", label: "FIR-2026-BL-4920", type: "fir", crime: "Chain Snatching" }
  ],
  edges: [
    { source: "SUS-8842", target: "FIR-2026-BL-4921", relation: "Primary Accused" },
    { source: "SUS-8842", target: "SUS-7104", relation: "Co-Accused associate" },
    { source: "SUS-7104", target: "FIR-2026-MY-1103", relation: "Primary Accused" },
    { source: "SUS-7104", target: "SUS-5921", relation: "Fence Contact" },
    { source: "SUS-5921", target: "FIR-2026-BL-4920", relation: "Primary Accused" }
  ]
};

export const DEMO_TRAIL = {
  trail: [
    {
      hop: 1,
      camera_id: "CAM-BLR-0010",
      camera_name: "Vijayanagar TTMC CCTV",
      lat: 12.9651,
      lng: 77.5348,
      timestamp: "2026-07-18T14:22:10Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 98.4,
      sighting_type: "ANPR Sighting",
      distance_from_crime_km: 0.2
    },
    {
      hop: 2,
      camera_id: "CAM-BLR-0012",
      camera_name: "MG Road BATCS Signal Pole 5",
      lat: 12.9737,
      lng: 77.6138,
      timestamp: "2026-07-18T14:35:45Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 96.1,
      sighting_type: "ANPR Sighting",
      distance_from_crime_km: 3.4
    },
    {
      hop: 3,
      camera_id: "CAM-BLR-0015",
      camera_name: "Hebbal Flyover Dome 15",
      lat: 13.0064,
      lng: 77.5787,
      timestamp: "2026-07-18T14:52:00Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 92.8,
      sighting_type: "ANPR Sighting",
      distance_from_crime_km: 7.8
    },
    {
      hop: 4,
      camera_id: "CAM-BLR-0035",
      camera_name: "Silk Board Junction BTP Panning",
      lat: 12.9344,
      lng: 77.6123,
      timestamp: "2026-07-18T15:10:30Z",
      plate_detected: "KA-01-MJ-8821",
      confidence: 89.5,
      sighting_type: "Visual Sweep",
      distance_from_crime_km: 12.1
    }
  ],
  total_hops: 4,
  trail_status: "active",
  last_known_location: {
    lat: 12.9344,
    lng: 77.6123,
    camera_name: "Silk Board Junction BTP Panning"
  },
  total_distance_km: 12.1,
  duration_minutes: 48
};

export const DEMO_ANPR_RESULT = {
  alert: true,
  severity: "CRITICAL",
  plate_number: "KA-01-MJ-8821",
  status: "STOLEN_VEHICLE",
  vehicle_details: {
    make_model: "Bajaj Pulsar 220",
    color: "Black",
    owner_name: "Vikram Sharma"
  },
  fir_match: {
    case_number: "FIR-2026-BL-4921",
    police_station: "HSR Layout PS",
    date_filed: "2026-07-18"
  },
  last_sighting: {
    camera_name: "Vijayanagar TTMC CCTV",
    timestamp: "2026-07-18T14:22:10Z",
    confidence: 98.4
  }
};

export const DEMO_AI_INSIGHTS = [
  {
    insight: "Spike detected in late-night Pulsar motorbikes around Silk Board TTMC corridor. High probability of inter-state fence transport.",
    type: "alert",
    severity: "critical"
  },
  {
    insight: "Suspect Ramesh Kumar (SUS-8842) tracked moving North towards Hebbal Toll approach. Suggest dispatching patrol team.",
    type: "opportunity",
    severity: "high"
  },
  {
    insight: "Dark zone identified at Banaswadi Outer Ring service road — 70% crime underreporting estimated due to missing streetlamps.",
    type: "trend",
    severity: "medium"
  }
];

/**
 * Generate a contextually relevant AI response based on pattern matching user input against DEMO datasets.
 * @param {string} userQuestion 
 * @returns {{ answer: string, source: string, confidence: number }}
 */
export function generateAIResponseFromDemoData(userQuestion = '') {
  const q = userQuestion.toLowerCase().trim();

  // Pattern 1: Hotspots / Top Crimes / High Risk Areas
  if (q.includes('hotspot') || q.includes('top crime') || q.includes('high risk area') || q.includes('where is crime')) {
    const topHotspots = DEMO_HOTSPOTS.hotspots.slice(0, 3).map((h, i) => 
      `${i + 1}) **${h.area_name}** (${h.district}) — ${h.crime_count} incidents logged (Severity Score: ${h.severity_score}/10). Primary offense: ${h.primary_crime}.`
    ).join('\n');
    return {
      answer: `Based on active DRISHTI analytics, here are the primary crime hotspots across Karnataka:\n\n${topHotspots}\n\n*Recommendation*: Increase beat patrol frequency along the Silk Board & MG Road corridors.`,
      source: 'demo_ai',
      confidence: 0.88
    };
  }

  // Pattern 2: Specific Location / District (Silk Board, MG Road, Bengaluru, Mysuru, Hubballi)
  if (q.includes('silk board') || q.includes('mg road') || q.includes('bengaluru') || q.includes('mysuru') || q.includes('district')) {
    const matchingCases = DEMO_FIRS.firs.filter(f => 
      q.includes(f.district_name.toLowerCase()) || 
      q.includes(f.location_name.toLowerCase()) || 
      q.includes('bengaluru')
    ).slice(0, 3);

    const caseList = (matchingCases.length > 0 ? matchingCases : DEMO_FIRS.firs.slice(0, 3)).map(f => 
      `• **${f.case_number}** (${f.crime_type}): ${f.description} [Status: ${f.status.toUpperCase()}]`
    ).join('\n');

    return {
      answer: `Here are the active cases recorded for the requested sector:\n\n${caseList}\n\nAll units in the sector have been alerted to watch for suspicious vehicle activity.`,
      source: 'demo_ai',
      confidence: 0.85
    };
  }

  // Pattern 3: Repeat Offenders / High-Risk Suspects
  if (q.includes('suspect') || q.includes('offender') || q.includes('repeat') || q.includes('criminal') || q.includes('gang')) {
    const suspectList = DEMO_REPEAT_OFFENDERS.suspects.map((s, i) => 
      `${i + 1}) **${s.name}** ("${s.alias}") — Risk Score: **${s.risk_score}/100**\n   • Modus Operandi: ${s.primary_modus_operandi}\n   • Known Hangouts: ${s.known_hangouts.join(', ')}\n   • Status: ${s.status}`
    ).join('\n\n');

    return {
      answer: `DRISHTI Repeat Offender Matrix identifies **${DEMO_REPEAT_OFFENDERS.high_risk_count} high-risk targets**. Top active suspects:\n\n${suspectList}`,
      source: 'demo_ai',
      confidence: 0.90
    };
  }

  // Pattern 4: Trends / Analytics / Monthly Patterns
  if (q.includes('trend') || q.includes('analytic') || q.includes('pattern') || q.includes('monthly') || q.includes('spike')) {
    return {
      answer: `**Crime Trend Analysis (12-Month Window)**:\n\n• **Overall Direction**: ${DEMO_TRENDS.overall_trend.toUpperCase()}\n• **Average Per Period**: ${DEMO_TRENDS.average_per_period} incidents/month\n• **Recent Peak**: July 2026 recorded 312 FIRs.\n\n*Key Seasonal Insight*: ${DEMO_TRENDS.seasonal_insight}`,
      source: 'demo_ai',
      confidence: 0.86
    };
  }

  // Pattern 5: ANPR / Plate Search / Stolen Vehicles
  if (q.includes('anpr') || q.includes('plate') || q.includes('stolen') || q.includes('vehicle') || q.includes('ka-')) {
    const res = DEMO_ANPR_RESULT;
    return {
      answer: `🚨 **ANPR ALERT: ${res.status} DETECTED**\n\n• **Target Plate**: ${res.plate_number}\n• **Vehicle**: ${res.vehicle_details.make_model} (${res.vehicle_details.color})\n• **Matched FIR**: ${res.fir_match.case_number} (${res.fir_match.police_station})\n• **Last CCTV Sighting**: ${res.last_sighting.camera_name} (Confidence: ${res.last_sighting.confidence}%)\n\nAutomated intercept alert broadcasted to nearby patrol units.`,
      source: 'demo_ai',
      confidence: 0.95
    };
  }

  // Pattern 6: Geo Trail / Sightings / Cameras
  if (q.includes('trail') || q.includes('sighting') || q.includes('camera') || q.includes('movement') || q.includes('route')) {
    const trailHops = DEMO_TRAIL.trail.map(h => 
      `• **Hop ${h.hop}** (${h.timestamp.split('T')[1].slice(0,8)}): ${h.camera_name} — Distance from crime: ${h.distance_from_crime_km}km [${h.sighting_type}]`
    ).join('\n');

    return {
      answer: `**Vehicle Geo-Trail Timeline for KA-01-MJ-8821**:\n\n${trailHops}\n\n**Total Distance**: ${DEMO_TRAIL.total_distance_km}km across ${DEMO_TRAIL.total_hops} camera checkpoints. Last known location: ${DEMO_TRAIL.last_known_location.camera_name}.`,
      source: 'demo_ai',
      confidence: 0.92
    };
  }

  // Fallback for general or unrecognized questions
  const insightsSummary = DEMO_AI_INSIGHTS.map(i => `• [${i.severity.toUpperCase()}] ${i.insight}`).join('\n');
  return {
    answer: `Based on active DRISHTI intelligence, here is the current operational brief:\n\n${insightsSummary}\n\nFeel free to ask me about specific **hotspots**, **FIR records**, **suspect profiles**, **ANPR vehicle lookups**, or **geo-trails**.`,
    source: 'demo_ai',
    confidence: 0.75
  };
}

