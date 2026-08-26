const fs = require('fs');
const path = require('path');

const newRoutes = [
  'stratus-upload', 'cache-hotspots', 'search-firs', 'ml-risk-score',
  'zia-automl-predict', 'zia-ocr', 'auth-verify', 'cron-night-recalc',
  'on-fir-insert', 'on-alert-broadcast', 'investigation-circuit',
  'send-alert-mail', 'push-notify'
];

const apiDir = path.resolve(__dirname, 'nextjs', 'src', 'app', 'api');

newRoutes.forEach(fnName => {
  const dir = path.join(apiDir, fnName);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const routeContent = `import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const fn = require('../../../../../functions/${fnName}/index.js');
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
    const fn = require('../../../../../functions/${fnName}/index.js');
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
`;

  fs.writeFileSync(path.join(dir, 'route.js'), routeContent);
});

console.log('Successfully created all 13 API route files in nextjs/src/app/api');
