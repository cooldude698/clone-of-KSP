import { NextResponse } from 'next/server';
import { UPLOADED_FIRS } from '@/lib/uploadedFirsStore';
import { DEMO_FIRS } from '@/lib/demo-data';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const caseNumber = searchParams.get('case_number');

  const allFirs = [...UPLOADED_FIRS, ...DEMO_FIRS.firs];
  const uniqueFirs = [];
  const seen = new Set();

  for (const f of allFirs) {
    if (!seen.has(f.case_number)) {
      seen.add(f.case_number);
      uniqueFirs.push(f);
    }
  }

  if (caseNumber) {
    const matched = uniqueFirs.filter(f => f.case_number.toLowerCase() === caseNumber.toLowerCase());
    return NextResponse.json({ firs: matched, total_count: matched.length }, { status: 200, headers: CORS });
  }

  return NextResponse.json({ firs: uniqueFirs, total_count: uniqueFirs.length }, { status: 200, headers: CORS });
}

export async function POST(req) {
  return GET(req);
}
