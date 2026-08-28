export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { UPLOADED_SUSPECTS } from '@/lib/uploadedFirsStore';
import { DEMO_REPEAT_OFFENDERS } from '@/lib/demo-data';

const DISK_FILE = path.join(process.cwd(), 'src/lib/uploaded_firs_disk.json');

function getDiskSuspects() {
  try {
    if (fs.existsSync(DISK_FILE)) {
      const raw = fs.readFileSync(DISK_FILE, 'utf8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.suspects)) return data.suspects;
    }
  } catch {}
  return [];
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  const diskSuspects = getDiskSuspects();
  const allSuspects = [...diskSuspects, ...UPLOADED_SUSPECTS, ...DEMO_REPEAT_OFFENDERS.suspects];
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
