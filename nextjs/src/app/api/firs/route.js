import { loadCatalystFunction } from '@/lib/dynamic-fn-loader';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { DEMO_FIRS } from '@/lib/demo-data';

export async function GET(req) {
  try {
    const fn = loadCatalystFunction('firs');
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    let statusCode = 200;
    let jsonResult = {};
    const mockReq = {
      method: 'GET',
      url: req.url,
      getQueryParams: () => queryObj,
      getMethod: () => 'GET'
    };
    const mockRes = {
      setHeader: () => {},
      writeHead: (code) => { statusCode = code; },
      end: (data) => {
        if (!data) return;
        try { jsonResult = JSON.parse(data); } catch { jsonResult = { data }; }
      },
      write: (data) => {
        if (!data) return;
        try { jsonResult = JSON.parse(data); } catch { jsonResult = { data }; }
      }
    };
    await fn(mockReq, mockRes);
    if (jsonResult.error || !jsonResult.firs || !Array.isArray(jsonResult.firs) || jsonResult.firs.length === 0) {
      return NextResponse.json(DEMO_FIRS, { status: 200 });
    }
    return NextResponse.json(jsonResult, { status: statusCode });
  } catch (err) {
    return NextResponse.json(DEMO_FIRS, { status: 200 });
  }
}

export async function POST(req) {
  return GET(req);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}
