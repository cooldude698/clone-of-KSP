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
    const jurisdiction = searchParams.get('jurisdiction') || 'Bengaluru Central & East Division';

    const data = {
      jurisdiction,
      zone: 'East Zone - Tactical Sector 4',
      supervisor: {
        rank: 'Deputy Superintendent of Police (DySP)',
        name: 'K. S. Narayana Swamy',
        badge: 'KSP-SUP-1092',
        stations_covered: 4,
      },
      summary: {
        total_active_firs: 62,
        total_closed_month: 148,
        overall_clearance_rate: 82.5,
        avg_response_time_minutes: 16.8,
        sla_breach_count: 3,
        pending_approvals_count: 3,
        active_hoysala_patrols: 14,
        cctv_uptime_pct: 99.1,
      },
      workload_distribution: [
        { officer_id: 'KSP-4092', name: 'Insp. V. Sharma', station: 'Ashoknagar PS', active_cases: 12, max_capacity: 20, load_pct: 60, status: 'Optimal' },
        { officer_id: 'KSP-3180', name: 'Insp. Rajesh Rao', station: 'Cubbon Park PS', active_cases: 19, max_capacity: 20, load_pct: 95, status: 'Near Capacity' },
        { officer_id: 'KSP-2845', name: 'Insp. Priya Patel', station: 'Ulsoor PS', active_cases: 8, max_capacity: 20, load_pct: 40, status: 'Available' },
        { officer_id: 'KSP-5120', name: 'Insp. Anand Deshmukh', station: 'Indiranagar PS', active_cases: 23, max_capacity: 20, load_pct: 115, status: 'Overloaded' },
      ],
      stations: [
        { station_id: 'STN-BLR-01', name: 'Ashoknagar PS', officer_in_charge: 'Insp. V. Sharma', active_firs: 12, clearance_rate: 88, sla_breaches: 0, hoysala_units: 3 },
        { station_id: 'STN-BLR-02', name: 'Cubbon Park PS', officer_in_charge: 'Insp. Rajesh Rao', active_firs: 19, clearance_rate: 79, sla_breaches: 1, hoysala_units: 4 },
        { station_id: 'STN-BLR-03', name: 'Ulsoor PS', officer_in_charge: 'Insp. Priya Patel', active_firs: 8, clearance_rate: 92, sla_breaches: 0, hoysala_units: 3 },
        { station_id: 'STN-BLR-04', name: 'Indiranagar PS', officer_in_charge: 'Insp. Anand Deshmukh', active_firs: 23, clearance_rate: 71, sla_breaches: 2, hoysala_units: 4 },
      ],
      recent_escalations: [
        { id: 'ESC-901', fir: 'KAR/BEN/2024/1726', crime: 'NDPS Commercial Trafficking', urgency: 'CRITICAL', reason: '72hr FSL dispatch deadline in 4 hrs', station: 'Indiranagar PS' },
        { id: 'ESC-902', fir: 'KAR/BEN/2024/1840', crime: 'Organized Vehicle Theft Gang', urgency: 'HIGH', reason: 'Cross-border inter-district ANPR hit in Bidar', station: 'Ashoknagar PS' },
        { id: 'ESC-903', fir: 'KAR/BEN/2024/2250', crime: 'Highway Armed Robbery', urgency: 'HIGH', reason: 'SLA Investigation Progress Report Overdue by 48h', station: 'Cubbon Park PS' },
      ]
    };

    return NextResponse.json(data, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
