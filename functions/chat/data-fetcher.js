const axios = require('axios');

const BASE_URL = process.env.ANALYTICS_API_URL || 'http://localhost:3000/server';

const toolConfigs = {
  fetch_hotspots: {
    method: 'GET',
    endpoint: '/hotspots/',
    fallback: {
      hotspots: [
        { location_lat: 12.9352, location_lng: 77.6245, crime_type_code: "vehicle_theft", district_name: "South Bengaluru", incident_count: 47 },
        { location_lat: 12.9716, location_lng: 77.5946, crime_type_code: "robbery", district_name: "Central Bengaluru", incident_count: 31 }
      ],
      total: 2,
      source: "mock"
    }
  },
  fetch_trends: {
    method: 'GET',
    endpoint: '/trends/',
    fallback: {
      trends: [
        { period: "Jan 2026", count: 142 },
        { period: "Feb 2026", count: 118 },
        { period: "Mar 2026", count: 167 },
        { period: "Apr 2026", count: 134 },
        { period: "May 2026", count: 189 },
        { period: "Jun 2026", count: 201 }
      ],
      source: "mock"
    }
  },
  fetch_repeat_offenders: {
    method: 'GET',
    endpoint: '/repeat-offenders/',
    fallback: {
      offenders: [
        { accused_full_name: "Ramesh Kumar", fir_count: 7, crime_types: ["vehicle_theft", "robbery"] },
        { accused_full_name: "Suresh Naidu", fir_count: 5, crime_types: ["robbery"] }
      ],
      source: "mock"
    }
  },
  fetch_firs: {
    method: 'GET',
    endpoint: '/firs/',
    fallback: {
      firs: [
        { fir_case_number: "FIR-2026-BL-0492", district_name: "South Bengaluru", crime_type_code: "vehicle_theft", date_filed: "2026-05-14" }
      ],
      source: "mock"
    }
  },
  fetch_cameras_nearby: {
    method: 'GET',
    endpoint: '/cameras-nearby/',
    fallback: {
      cameras: [
        { camera_id: "SC-0045", name: "Silk Board Junction - South Camera", camera_type: "Safe_City", lat: 12.9175, lng: 77.6215, distance_meters: 55, has_anpr: true, has_face_recog: true, relevance_score: 100 },
        { camera_id: "BATCS-0102", name: "MG Road Signal East", camera_type: "BATCS", lat: 12.9762, lng: 77.6033, distance_meters: 210, has_anpr: true, has_face_recog: false, relevance_score: 80 }
      ],
      total_found: 2,
      anpr_capable_count: 2,
      source: "mock"
    }
  },
  fetch_trail: {
    method: 'POST',
    endpoint: '/trail/',
    fallback: {
      trail: [
        { hop: 1, camera_name: "Silk Board Signal - East Approach", lat: 12.9170, lng: 77.6208, timestamp: "2026-06-01T14:02:15Z", plate_detected: "KA-01-HE-4920", confidence: 92, sighting_type: "ANPR" },
        { hop: 2, camera_name: "HSR Layout 5th Main Camera", lat: 12.9135, lng: 77.6284, timestamp: "2026-06-01T14:08:45Z", plate_detected: "KA-01-HE-4920", confidence: 88, sighting_type: "ANPR" }
      ],
      total_hops: 2,
      trail_status: "active",
      source: "mock"
    }
  },
  fetch_anpr_check: {
    method: 'POST',
    endpoint: '/anpr-check/',
    fallback: {
      alert: false,
      plate_number: "UNKNOWN",
      source: "mock"
    }
  },
  fetch_network_graph: {
    method: 'GET',
    endpoint: '/network-graph-data/',
    fallback: {
      nodes: [
        { id: "accused_Ramesh_Kumar", label: "Ramesh Kumar", total_firs: 4, risk_score: 85, crime_types: ["vehicle_theft", "robbery"] }
      ],
      edges: [],
      source: "mock"
    }
  },
  fetch_officer_performance: {
    method: 'GET',
    endpoint: '/supervisor/performance/',
    fallback: {
      officers: [
        { officer_id: "KSP-4092", name: "Insp. V. Sharma", station: "Ashoknagar PS", clearance_rate: 88, avg_response_min: 14, active_cases: 12, sla_compliance: 96 },
        { officer_id: "KSP-3180", name: "Insp. Rajesh Rao", station: "Cubbon Park PS", clearance_rate: 79, avg_response_min: 18, active_cases: 19, sla_compliance: 84 },
        { officer_id: "KSP-2845", name: "Insp. Priya Patel", station: "Ulsoor PS", clearance_rate: 92, avg_response_min: 11, active_cases: 8, sla_compliance: 98 },
        { officer_id: "KSP-5120", name: "Insp. Anand Deshmukh", station: "Indiranagar PS", clearance_rate: 71, avg_response_min: 24, active_cases: 23, sla_compliance: 76 }
      ],
      jurisdiction: "Bengaluru Central & East Division",
      total_inspectors: 4,
      source: "mock"
    }
  },
  fetch_pending_approvals: {
    method: 'GET',
    endpoint: '/supervisor/approvals/',
    fallback: {
      pending_approvals: [
        { approval_id: "APP-2026-081", fir_number: "KAR/BEN/2024/1840", officer_name: "Insp. V. Sharma", request_type: "FIR Final Closure", priority: "HIGH", days_pending: 2 },
        { approval_id: "APP-2026-084", fir_number: "KAR/BEN/2024/1726", officer_name: "Insp. Anand Deshmukh", request_type: "CCB Organized Crime Escalation", priority: "CRITICAL", days_pending: 1 },
        { approval_id: "APP-2026-089", fir_number: "KAR/BEN/2024/0747", officer_name: "Insp. Rajesh Rao", request_type: "ANPR Deep Scan Request", priority: "MEDIUM", days_pending: 3 }
      ],
      total_pending: 3,
      source: "mock"
    }
  }
};

/**
 * Maps a tool name to its respective Catalyst microservice endpoint and makes the HTTP request.
 * If the request fails, it gracefully logs the error and returns the mock fallback.
 * 
 * @param {string} toolName - Name of the tool.
 * @param {object} params - Request parameters (sent as query parameters for GET, or body data for POST).
 * @returns {Promise<object>} Response data from the API, or mock fallback object on failure.
 */
async function fetchData(toolName, params) {
  const config = toolConfigs[toolName];
  if (!config) {
    const errorMsg = `Unknown tool name: ${toolName}`;
    console.error(`[data-fetcher] ERROR ${toolName}: ${errorMsg}`);
    return { error: true, message: errorMsg, source: "mock" };
  }

  try {
    const cleanBaseUrl = BASE_URL.replace(/\/$/, '');
    const cleanEndpoint = config.endpoint.replace(/^\//, '');
    const url = `${cleanBaseUrl}/${cleanEndpoint}`;

    const requestConfig = {
      method: config.method,
      url,
      timeout: 4000
    };

    if (config.method === 'GET') {
      requestConfig.params = params;
    } else if (config.method === 'POST') {
      requestConfig.data = params;
    }

    const response = await axios(requestConfig);
    return response.data;
  } catch (error) {
    const reason = error.message || error.toString();
    console.error(`[data-fetcher] ERROR ${toolName}: ${reason}`);
    return config.fallback;
  }
}

module.exports = { fetchData };
