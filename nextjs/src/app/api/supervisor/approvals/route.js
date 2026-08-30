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

let APPROVAL_ITEMS = [
  {
    id: 'APP-2026-081',
    fir_number: 'KAR/BEN/2024/1840',
    title: 'Final Closure Report & Charge Sheet (IPC §379 / §411)',
    officer_id: 'KSP-4092',
    officer_name: 'Insp. V. Sharma',
    station: 'Ashoknagar PS',
    request_type: 'FIR Final Closure',
    priority: 'HIGH',
    submitted_date: '2026-06-02',
    days_pending: 2,
    status: 'PENDING',
    summary: 'Investigation complete. 3 stolen two-wheelers recovered from Bidar fence depot. Accused Ramesh Kumar booked under Charge Sheet #14/2026. All witness panchanama signed.',
    checklist: [
      { label: 'Spot Panchanama attached', done: true },
      { label: 'Seizure memo signed by 2 witnesses', done: true },
      { label: 'FSL / Mechanical inspection report attached', done: true },
      { label: 'Prior criminal history dossier attached', done: true },
    ]
  },
  {
    id: 'APP-2026-084',
    fir_number: 'KAR/BEN/2024/1726',
    title: 'Case Escalation to CCB Narcotics Wing (NDPS §21(c) / §29)',
    officer_id: 'KSP-5120',
    officer_name: 'Insp. Anand Deshmukh',
    station: 'Indiranagar PS',
    request_type: 'CCB Organized Crime Escalation',
    priority: 'CRITICAL',
    submitted_date: '2026-06-03',
    days_pending: 1,
    status: 'PENDING',
    summary: 'Multi-district syndicate link detected connecting Bengaluru Urban, Tumakuru, and Koppal. Commercial quantity MDMA (140g) seized. Requires CCB specialized cyber tracking & inter-state warrant powers.',
    checklist: [
      { label: 'NDPS Section 50 Gazetted Officer record attached', done: true },
      { label: '72hr FSL Sample Dispatch initiated', done: true },
      { label: 'Syndicate Network Graph attached', done: true },
      { label: 'Financial account freeze request drafted', done: true },
    ]
  },
  {
    id: 'APP-2026-089',
    fir_number: 'KAR/BEN/2024/0747',
    title: 'Special Resource Request: State-Wide ANPR Deep Corridor Sweep',
    officer_id: 'KSP-3180',
    officer_name: 'Insp. Rajesh Rao',
    station: 'Cubbon Park PS',
    request_type: 'Resource Allocation',
    priority: 'MEDIUM',
    submitted_date: '2026-06-01',
    days_pending: 3,
    status: 'PENDING',
    summary: 'Request authorization to unlock 14-day historical ANPR footage across all National Highway toll plazas connecting Bengaluru to Hyderabad corridor for suspect vehicle KA-01-MJ-8821.',
    checklist: [
      { label: 'Case Diary Case Note #08 filed', done: true },
      { label: 'License plate verification confirmed with RTO', done: true },
      { label: 'Preliminary 2km CCTV footage reviewed', done: true },
    ]
  }
];

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get('status') || 'ALL';

    const items = filterStatus === 'ALL'
      ? APPROVAL_ITEMS
      : APPROVAL_ITEMS.filter(i => i.status === filterStatus);

    return NextResponse.json({
      pending_count: APPROVAL_ITEMS.filter(i => i.status === 'PENDING').length,
      total_items: items.length,
      approvals: items
    }, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { approval_id, action, remarks, supervisor_badge = 'KSP-SUP-1092' } = body;

    const item = APPROVAL_ITEMS.find(i => i.id === approval_id);
    if (!item) {
      return NextResponse.json({ error: true, message: 'Approval item not found' }, { status: 404, headers: CORS });
    }

    if (action === 'APPROVE') {
      item.status = 'APPROVED';
      item.decision = {
        action: 'APPROVED',
        signed_by: supervisor_badge,
        timestamp: new Date().toISOString(),
        remarks: remarks || 'Digitally signed and approved by DySP Command Desk.'
      };
    } else if (action === 'REJECT') {
      item.status = 'REJECTED';
      item.decision = {
        action: 'REJECTED',
        signed_by: supervisor_badge,
        timestamp: new Date().toISOString(),
        remarks: remarks || 'Rejected by Supervisor. Revision required.'
      };
    } else if (action === 'REQUEST_INFO') {
      item.status = 'INFO_REQUESTED';
      item.decision = {
        action: 'INFO_REQUESTED',
        signed_by: supervisor_badge,
        timestamp: new Date().toISOString(),
        remarks: remarks || 'Additional evidence / documents requested from Investigating Officer.'
      };
    }

    return NextResponse.json({
      success: true,
      message: `Approval request ${approval_id} updated with action ${action}`,
      approval: item
    }, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
