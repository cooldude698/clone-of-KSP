import { NextResponse } from 'next/server';

const BASE = 'https://drishti-ksp-60073715607.development.catalystserverless.in/server';

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

    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    return NextResponse.json(data, {
      status: res.status,
      headers: CORS,
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: err.message },
      { status: 500, headers: CORS }
    );
  }
}

export function optionsResponse() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
