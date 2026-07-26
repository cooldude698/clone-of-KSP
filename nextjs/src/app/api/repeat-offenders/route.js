import { NextResponse } from 'next/server';
import { UPLOADED_SUSPECTS } from '@/lib/uploadedFirsStore';
import { DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const allSuspects = [...UPLOADED_SUSPECTS, ...DEMO_REPEAT_OFFENDERS.suspects];
  const uniqueSuspects = [];
  const seen = new Set();

  for (const s of allSuspects) {
    const key = (s.name || s.accused_name || '').toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      uniqueSuspects.push(s);
    }
  }

  return NextResponse.json({
    high_risk_count: uniqueSuspects.length,
    suspects: uniqueSuspects,
  }, { status: 200, headers: CORS });
}

export async function POST(req) {
  return GET(req);
}
