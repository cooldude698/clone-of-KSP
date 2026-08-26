import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const fn = require('../../../../../functions/zia-automl-predict/index.js');
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
        try { jsonResult = JSON.parse(data); } catch { jsonResult = { data }; }
      }
    };
    await fn(mockReq, mockRes);
    return NextResponse.json(jsonResult, { status: statusCode });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const fn = require('../../../../../functions/zia-automl-predict/index.js');
    let body = {};
    try { body = await req.json(); } catch (_) {}
    let statusCode = 200;
    let jsonResult = {};
    const mockReq = {
      method: 'POST',
      url: req.url,
      body,
      getQueryParams: () => ({}),
      getMethod: () => 'POST'
    };
    const mockRes = {
      setHeader: () => {},
      writeHead: (code) => { statusCode = code; },
      end: (data) => {
        try { jsonResult = JSON.parse(data); } catch { jsonResult = { data }; }
      }
    };
    await fn(mockReq, mockRes);
    return NextResponse.json(jsonResult, { status: statusCode });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 });
  }
}
