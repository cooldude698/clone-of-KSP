import { NextResponse } from 'next/server';

export async function runCatalystHandler(handlerFn, request) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    let body = {};
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.method !== 'OPTIONS') {
      try {
        body = await request.json();
      } catch (e) {
        body = {};
      }
    }

    let statusCode = 200;
    let headersMap = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
    let responseBody = null;

    const reqMock = {
      method: request.method,
      getMethod: () => request.method,
      getQueryParams: () => queryParams,
      query: queryParams,
      body,
      headers: Object.fromEntries(request.headers.entries()),
      on: (event, handler) => {
        if (event === 'data') handler(JSON.stringify(body));
        if (event === 'end') handler();
      }
    };

    const resMock = {
      writeHead: (code, headers) => {
        statusCode = code;
        if (headers) headersMap = { ...headersMap, ...headers };
      },
      setHeader: (key, val) => { headersMap[key] = val; },
      end: (data) => {
        if (data) {
          try {
            responseBody = typeof data === 'string' ? JSON.parse(data) : data;
          } catch (e) {
            responseBody = data;
          }
        }
      },
      write: (data) => {
        if (data) {
          try {
            responseBody = typeof data === 'string' ? JSON.parse(data) : data;
          } catch (e) {
            responseBody = data;
          }
        }
      }
    };

    await handlerFn(reqMock, resMock);

    if (typeof responseBody === 'string') {
      return new NextResponse(responseBody, { status: statusCode, headers: headersMap });
    }
    return NextResponse.json(responseBody || {}, { status: statusCode, headers: headersMap });
  } catch (err) {
    console.error('Catalyst Adapter error:', err);
    return NextResponse.json({ error: true, message: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
