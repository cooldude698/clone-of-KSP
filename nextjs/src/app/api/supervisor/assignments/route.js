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

// In-memory store for session demonstrations
let UNASSIGNED_CASES = [
  {
    case_number: 'KAR/BEN/2026/0491',
    crime_type: 'vehicle_theft',
    crime_title: 'Commercial Fleet Two-Wheeler Theft Ring',
    station: 'Indiranagar PS',
    date_filed: '2026-06-03 08:30',
    severity: 'HIGH',
    recommended_officer_id: 'KSP-2845',
    recommended_officer_name: 'Insp. Priya Patel (Ulsoor PS)',
    recommendation_reason: 'Current load 8/20 (Available), high clearance rate (92%), station distance 2.4 km',
    assigned_to: null,
  },
  {
    case_number: 'KAR/BEN/2026/0498',
    crime_type: 'cyber_fraud',
    crime_title: 'CFCFRMS Multi-Account UPI Spoofing',
    station: 'Cubbon Park PS',
    date_filed: '2026-06-03 10:15',
    severity: 'MEDIUM',
    recommended_officer_id: 'KSP-2845',
    recommended_officer_name: 'Insp. Priya Patel (Ulsoor PS)',
    recommendation_reason: 'Cyber Forensic specialization, low active workload',
    assigned_to: null,
  },
  {
    case_number: 'KAR/BEN/2026/0502',
    crime_type: 'robbery',
    crime_title: 'Armed Expressway Hijack & Cargo Snatch',
    station: 'Ashoknagar PS',
    date_filed: '2026-06-03 12:40',
    severity: 'CRITICAL',
    recommended_officer_id: 'KSP-4092',
    recommended_officer_name: 'Insp. V. Sharma (Ashoknagar PS)',
    recommendation_reason: 'Organized Crime specialist, on-site station match, 88% clearance',
    assigned_to: null,
  },
  {
    case_number: 'KAR/BEN/2026/0511',
    crime_type: 'drug_offence',
    crime_title: 'Synthetic Methamphetamine Parcel Intercept',
    station: 'Indiranagar PS',
    date_filed: '2026-06-03 15:00',
    severity: 'CRITICAL',
    recommended_officer_id: 'KSP-4092',
    recommended_officer_name: 'Insp. V. Sharma (Ashoknagar PS)',
    recommendation_reason: 'Rebalance from overloaded Indiranagar PS (Insp. Deshmukh at 23 cases) to Ashoknagar PS (12 cases)',
    assigned_to: null,
  },
];

export async function GET() {
  return NextResponse.json({
    unassigned_count: UNASSIGNED_CASES.filter(c => !c.assigned_to).length,
    cases: UNASSIGNED_CASES,
    officer_workloads: [
      { officer_id: 'KSP-4092', name: 'Insp. V. Sharma', station: 'Ashoknagar PS', active: 12, capacity: 20, status: 'Optimal' },
      { officer_id: 'KSP-3180', name: 'Insp. Rajesh Rao', station: 'Cubbon Park PS', active: 19, capacity: 20, status: 'Near Capacity' },
      { officer_id: 'KSP-2845', name: 'Insp. Priya Patel', station: 'Ulsoor PS', active: 8, capacity: 20, status: 'Available' },
      { officer_id: 'KSP-5120', name: 'Insp. Anand Deshmukh', station: 'Indiranagar PS', active: 23, capacity: 20, status: 'Overloaded' },
    ]
  }, { status: 200, headers: CORS });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { case_number, officer_id, officer_name, supervisor_remarks } = body;

    const caseItem = UNASSIGNED_CASES.find(c => c.case_number === case_number);
    if (!caseItem) {
      return NextResponse.json({ error: true, message: 'Case not found' }, { status: 404, headers: CORS });
    }

    caseItem.assigned_to = {
      officer_id,
      officer_name,
      assigned_at: new Date().toISOString(),
      supervisor_remarks: supervisor_remarks || 'Assigned via Supervisor Command Desk'
    };

    return NextResponse.json({
      success: true,
      message: `Case ${case_number} successfully assigned to ${officer_name}`,
      case: caseItem
    }, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
