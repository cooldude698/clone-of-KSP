export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const stationFilter = searchParams.get('station') || 'ALL';

    const officer_activity_logs = [
      { id: 'LOG-8812', timestamp: '2026-06-03 16:42:10', officer_id: 'KSP-4092', officer_name: 'Insp. V. Sharma', station: 'Ashoknagar PS', action: 'FIR_CLOSURE_SUBMITTED', details: 'Submitted Final Closure Report for FIR-2024-1840', ip_address: '10.24.18.91', status: 'SUCCESS' },
      { id: 'LOG-8811', timestamp: '2026-06-03 16:15:04', officer_id: 'KSP-5120', officer_name: 'Insp. Anand Deshmukh', station: 'Indiranagar PS', action: 'EVIDENCE_ACCESSED', details: 'Viewed NDPS Seizure Memo for FIR-2024-1726', ip_address: '10.24.19.14', status: 'SUCCESS' },
      { id: 'LOG-8810', timestamp: '2026-06-03 15:40:22', officer_id: 'KSP-3180', officer_name: 'Insp. Rajesh Rao', station: 'Cubbon Park PS', action: 'ANPR_SCAN_REQUESTED', details: 'Requested 14-day ANPR corridor tracking for KA-01-MJ-8821', ip_address: '10.24.16.42', status: 'SUCCESS' },
      { id: 'LOG-8809', timestamp: '2026-06-03 14:28:50', officer_id: 'KSP-2845', officer_name: 'Insp. Priya Patel', station: 'Ulsoor PS', action: 'CASE_STATUS_UPDATED', details: 'Updated FIR-2024-0303 to Accused Identified', ip_address: '10.24.17.88', status: 'SUCCESS' },
      { id: 'LOG-8808', timestamp: '2026-06-03 13:10:18', officer_id: 'KSP-5120', officer_name: 'Insp. Anand Deshmukh', station: 'Indiranagar PS', action: 'LOGIN', details: 'Authenticated via KSP Single Sign-On Biometric Portal', ip_address: '10.24.19.14', status: 'SUCCESS' },
      { id: 'LOG-8807', timestamp: '2026-06-03 12:05:33', officer_id: 'KSP-4092', officer_name: 'Insp. V. Sharma', station: 'Ashoknagar PS', action: 'PANCHANAMA_EXPORTED', details: 'Exported official PDF panchanama memo for FIR-2024-0747', ip_address: '10.24.18.91', status: 'SUCCESS' },
      { id: 'LOG-8806', timestamp: '2026-06-03 11:22:45', officer_id: 'KSP-3180', officer_name: 'Insp. Rajesh Rao', station: 'Cubbon Park PS', action: 'SUSPECT_SEARCH', details: 'Searched dossier for alias Snake Naidu in CCTNS', ip_address: '10.24.16.42', status: 'SUCCESS' },
    ];

    const ai_query_logs = [
      { id: 'AI-LOG-904', timestamp: '2026-06-03 16:30:12', officer_id: 'KSP-4092', officer_name: 'Insp. V. Sharma', query: 'SOP for vehicle theft charge sheet under Section 379 IPC', ai_tool_used: 'search_police_manuals', latency_ms: 480, status: 'VERIFIED' },
      { id: 'AI-LOG-903', timestamp: '2026-06-03 15:55:40', officer_id: 'KSP-5120', officer_name: 'Insp. Anand Deshmukh', query: 'Show all repeat offenders linked to commercial MDMA in East Division', ai_tool_used: 'fetch_repeat_offenders', latency_ms: 620, status: 'VERIFIED' },
      { id: 'AI-LOG-902', timestamp: '2026-06-03 14:10:05', officer_id: 'KSP-3180', officer_name: 'Insp. Rajesh Rao', query: 'Locate ANPR camera hits for vehicle KA-01-MJ-8821 near Silk Board', ai_tool_used: 'fetch_trail', latency_ms: 710, status: 'VERIFIED' },
      { id: 'AI-LOG-901', timestamp: '2026-06-03 12:45:18', officer_id: 'KSP-2845', officer_name: 'Insp. Priya Patel', query: 'Crime trend comparison for cyber phishing across 2026 Q1 and Q2', ai_tool_used: 'fetch_trends', latency_ms: 540, status: 'VERIFIED' },
    ];

    const filtered_activity = stationFilter === 'ALL'
      ? officer_activity_logs
      : officer_activity_logs.filter(l => l.station.toLowerCase().includes(stationFilter.toLowerCase()));

    return NextResponse.json({
      jurisdiction: 'Bengaluru Central & East Division',
      total_activity_events: filtered_activity.length,
      total_ai_queries: ai_query_logs.length,
      compliance_status: '100% CCTNS & DPDP Act Compliant',
      officer_activity_logs: filtered_activity,
      ai_query_logs: ai_query_logs
    }, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
