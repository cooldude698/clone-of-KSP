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

export async function GET() {
  try {
    const data = {
      jurisdiction: 'Bengaluru Central & East Division',
      total_critical: 2,
      total_high: 3,
      total_medium: 2,
      escalations: [
        {
          id: 'ESC-001',
          urgency: 'CRITICAL',
          fir_number: 'KAR/BEN/2024/1726',
          crime_type: 'Commercial NDPS Trafficking',
          station: 'Indiranagar PS',
          assigned_officer: 'Insp. Anand Deshmukh',
          time_remaining: '3h 45m remaining',
          deadline_type: 'Mandatory 72-Hour FSL Sample Dispatch Deadline',
          reason: 'Seized 140g MDMA samples require Gazetted Officer signature and immediate escort to Forensic Science Laboratory, Madiwala. Non-compliance violates NDPS §52A.',
          action_recommended: 'Issue immediate dispatch directive to IO and assign Reserve Constable escort vehicle.',
          orb_urgency_state: 'critical',
        },
        {
          id: 'ESC-002',
          urgency: 'CRITICAL',
          fir_number: 'KAR/BEN/2024/0912',
          crime_type: 'POCSO Act §4 / §6 Offence',
          station: 'Ulsoor PS',
          assigned_officer: 'Insp. Priya Patel',
          time_remaining: '24h remaining',
          deadline_type: 'Statutory 60-Day Charge Sheet Filing Deadline',
          reason: 'Investigation complete; final medical report from Bowring Hospital arrived. Charge Sheet must be filed before Special POCSO Court within 24 hours.',
          action_recommended: 'Sign off preliminary draft and authorize public prosecutor review.',
          orb_urgency_state: 'critical',
        },
        {
          id: 'ESC-003',
          urgency: 'HIGH',
          fir_number: 'KAR/BEN/2024/1840',
          crime_type: 'Organized Vehicle Theft Syndicate',
          station: 'Ashoknagar PS',
          assigned_officer: 'Insp. V. Sharma',
          time_remaining: 'Active Hit',
          deadline_type: 'Inter-District ANPR Camera Match Sighting',
          reason: 'Suspect Hyundai i10 (KA-01-MJ-8821) logged crossing Humnabad Toll Plaza heading towards Bidar. Fencing connection confirmed.',
          action_recommended: 'Transmit inter-district alert to SP Bidar Control Room for interception checkpoint.',
          orb_urgency_state: 'alert',
        },
        {
          id: 'ESC-004',
          urgency: 'HIGH',
          fir_number: 'KAR/BEN/2024/2250',
          crime_type: 'Armed Highway Robbery',
          station: 'Cubbon Park PS',
          assigned_officer: 'Insp. Rajesh Rao',
          time_remaining: '48h OVERDUE',
          deadline_type: 'SLA Investigation Fortnightly Progress Report',
          reason: 'Case Diary entries not updated since 10 days. Suspect Suresh Naidu remains untraced.',
          action_recommended: 'Issue supervisory explanation notice to IO and transfer supplementary CCTV review to CEN Cell.',
          orb_urgency_state: 'alert',
        },
        {
          id: 'ESC-005',
          urgency: 'MEDIUM',
          fir_number: 'KAR/BEN/2024/0380',
          crime_type: 'Cyber Phishing ₹4.8 Lakh',
          station: 'Cubbon Park PS',
          assigned_officer: 'Insp. Rajesh Rao',
          time_remaining: '12h remaining',
          deadline_type: '1930 Helpline Account Lien Re-Verification',
          reason: 'Bank Nodal Officer requests formal judicial requisition under CrPC §91 to sustain permanent freeze on 3 beneficiary accounts.',
          action_recommended: 'Sign electronic CrPC §91 requisition document.',
          orb_urgency_state: 'normal',
        }
      ]
    };

    return NextResponse.json(data, { status: 200, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
