import { NextResponse } from 'next/server';

const BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/server' 
  : '/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Proxy a Next.js Request to a Catalyst serverless function URL.
 * Works for GET, POST, etc.
 */
export async function proxyCatalystFunction(functionName, request) {
  const inUrl = new URL(request.url);
  const targetUrl = `${BASE}/${functionName}${inUrl.pathname.replace(/.*\/api\/[^/]+/, '')}${inUrl.search}`;

  const isBody = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  let body;
  if (isBody) {
    try { body = await request.text(); } catch { body = undefined; }
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...(isBody && body ? { body } : {}),
    });

    if (!res.ok && res.status >= 500) {
      // Fallback: return clean empty array/object so UI unblocks
      return NextResponse.json({ status: 'degraded', firs: [], hotspots: [], trend_data: [] }, { status: 200, headers: CORS });
    }

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, {
      status: res.status,
      headers: CORS,
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'degraded', firs: [], hotspots: [], trend_data: [], message: err.message },
      { status: 200, headers: CORS }
    );
  }
}

export function optionsResponse() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
