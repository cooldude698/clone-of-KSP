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

const OFFICERS_DATA = [
  {
    officer_id: 'KSP-4092',
    name: 'Insp. V. Sharma',
    station: 'Ashoknagar PS',
    phone: '+91 94808 01042',
    email: 'v.sharma@ksp.gov.in',
    joined_station: '12 Jan 2024',
    specialization: 'Organized Crime & Vehicle Theft',
    active_cases: 12,
    closed_cases_month: 28,
    clearance_rate: 88,
    avg_response_min: 14,
    sla_compliance: 96,
    status: 'Optimal Load',
    recent_cases: [
      { case_number: 'KAR/BEN/2024/1840', crime_type: 'Vehicle Theft', date: '2026-05-14', status: 'Pending Closure Sign-Off', sla_status: 'Compliant' },
      { case_number: 'KAR/BEN/2024/0747', crime_type: 'Two-Wheeler Theft', date: '2026-05-22', status: 'ANPR Trail Active', sla_status: 'Compliant' },
      { case_number: 'KAR/BEN/2024/0114', crime_type: 'Mobile Snatching', date: '2026-06-01', status: 'Witness Exam Completed', sla_status: 'Compliant' },
    ]
  },
  {
    officer_id: 'KSP-3180',
    name: 'Insp. Rajesh Rao',
    station: 'Cubbon Park PS',
    phone: '+91 94808 01088',
    email: 'rajesh.rao@ksp.gov.in',
    joined_station: '04 Mar 2023',
    specialization: 'Commercial Robbery & Financial Fraud',
    active_cases: 19,
    closed_cases_month: 21,
    clearance_rate: 79,
    avg_response_min: 18,
    sla_compliance: 84,
    status: 'Near Capacity',
    recent_cases: [
      { case_number: 'KAR/BEN/2024/2250', crime_type: 'Armed Robbery', date: '2026-05-18', status: 'Ballistics Report Awaited', sla_status: 'SLA Overdue 48h' },
      { case_number: 'KAR/BEN/2024/0675', crime_type: 'Jewellery Extortion', date: '2026-05-25', status: 'CCTV Sweep Completed', sla_status: 'Compliant' },
      { case_number: 'KAR/BEN/2024/0380', crime_type: 'Cyber Phishing', date: '2026-05-30', status: 'Account Frozen 1930', sla_status: 'Compliant' },
    ]
  },
  {
    officer_id: 'KSP-2845',
    name: 'Insp. Priya Patel',
    station: 'Ulsoor PS',
    phone: '+91 94808 01099',
    email: 'priya.patel@ksp.gov.in',
    joined_station: '18 Nov 2024',
    specialization: 'Women & Child Safety / Cyber Forensic',
    active_cases: 8,
    closed_cases_month: 34,
    clearance_rate: 92,
    avg_response_min: 11,
    sla_compliance: 98,
    status: 'Available for Assignment',
    recent_cases: [
      { case_number: 'KAR/BEN/2024/0303', crime_type: 'Cyber Imposter Scam', date: '2026-05-20', status: 'Accused Traced', sla_status: 'Compliant' },
      { case_number: 'KAR/BEN/2024/0125', crime_type: 'Chain Snatching', date: '2026-06-02', status: 'Spot Panchanama Filed', sla_status: 'Compliant' },
    ]
  },
  {
    officer_id: 'KSP-5120',
    name: 'Insp. Anand Deshmukh',
    station: 'Indiranagar PS',
    phone: '+91 94808 01112',
    email: 'anand.deshmukh@ksp.gov.in',
    joined_station: '10 Aug 2022',
    specialization: 'Narcotics & Night Highway Patrol',
    active_cases: 23,
    closed_cases_month: 16,
    clearance_rate: 71,
    avg_response_min: 24,
    sla_compliance: 76,
    status: 'Overloaded - Rebalance Advised',
    recent_cases: [
      { case_number: 'KAR/BEN/2024/1726', crime_type: 'Commercial MDMA Trafficking', date: '2026-05-19', status: 'FSL Dispatch Pending', sla_status: 'Critical SLA Clock 4h' },
      { case_number: 'KAR/BEN/2024/0122', crime_type: 'Narcotics Contraband', date: '2026-05-24', status: 'Inter-State Link Probed', sla_status: 'SLA Overdue 24h' },
      { case_number: 'KAR/BEN/2024/0492', crime_type: 'Night Bar Extortion', date: '2026-05-29', status: 'NBW Issued', sla_status: 'Compliant' },
    ]
  }
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const officerId = searchParams.get('officer_id');

    if (officerId) {
      const officer = OFFICERS_DATA.find(o => o.officer_id === officerId);
      if (!officer) {
        return NextResponse.json({ error: true, message: 'Officer not found' }, { status: 404, headers: CORS });
      }
      return NextResponse.json({ officer }, { status: 200, headers: CORS });
    }

    return NextResponse.json({
      jurisdiction: 'Bengaluru Central & East Division',
      total_inspectors: OFFICERS_DATA.length,
      average_clearance_rate: 82.5,
      average_response_time_min: 16.8,
      officers: OFFICERS_DATA
    }, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
