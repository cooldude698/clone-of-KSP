import { loadCatalystFunction } from '@/lib/dynamic-fn-loader';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const MOCK_CONVERSATIONS = {
  conversations: [
    {
      ROWID: "LOG-8842",
      suspect_name: "Ramesh Kumar",
      topic: "Vehicle Theft & Chopshop Transit",
      category: "suspect_file",
      messages: JSON.stringify([
        { role: "user", content: "Show me repeat vehicle theft offenders in Bengaluru Urban" },
        { role: "assistant", content: "Found 7 FIRs linked to Ramesh Kumar (Risk Score: 94). Active ANPR watchpoint set at Silk Board." }
      ]),
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      ROWID: "LOG-7104",
      suspect_name: "Suresh Naidu",
      topic: "Armed Robbery Trail Analysis",
      category: "location_brief",
      messages: JSON.stringify([
        { role: "user", content: "What is the primary crime vector for Hosur Road corridor?" },
        { role: "assistant", content: "Suresh Naidu gang identified in multi-city robbery incidents along Mysuru/Vijayapura." }
      ]),
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    },
    {
      ROWID: "LOG-5921",
      suspect_name: "Imran Khan",
      topic: "Commercial Narcotics Seizure",
      category: "fir_tracked",
      messages: JSON.stringify([
        { role: "user", content: "Check FIR details for drug offenses in Bengaluru Urban East" },
        { role: "assistant", content: "FIR-2024-BEN-1726 registered under NDPS Act. Commercial payload intercepted." }
      ]),
      created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      ROWID: "LOG-6022",
      suspect_name: "Bhavani Karpe",
      topic: "Digital Arrest Cyber Fraud Ring",
      category: "suspect_file",
      messages: JSON.stringify([
        { role: "user", content: "Analyze cyber fraud scam call centers targeting seniors" },
        { role: "assistant", content: "Bhavani Karpe network flagged across Chikkamagaluru & Bengaluru. 12 bank accounts frozen." }
      ]),
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      ROWID: "LOG-9012",
      suspect_name: "Vikram Singh",
      topic: "Highway Hit & Run Watchlist",
      category: "fir_tracked",
      messages: JSON.stringify([
        { role: "user", content: "Show ANPR watchlist updates for NH-44 toll plazas" },
        { role: "assistant", content: "Vehicle registration KA-05-NB-1102 added to toll plaza blacklist." }
      ]),
      created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    }
  ],
  total_count: 5
};

export async function GET(req) {
  try {
    const fn = loadCatalystFunction('conversations');
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
    if (jsonResult.error || !jsonResult.conversations || !Array.isArray(jsonResult.conversations) || jsonResult.conversations.length === 0) {
      return NextResponse.json(MOCK_CONVERSATIONS, { status: 200 });
    }
    return NextResponse.json(jsonResult, { status: statusCode });
  } catch (err) {
    return NextResponse.json(MOCK_CONVERSATIONS, { status: 200 });
  }
}

export async function POST(req) {
  try {
    const fn = loadCatalystFunction('conversations');
    let body = {};
    try { body = await req.json(); } catch (_) {}
    let statusCode = 200;
    let jsonResult = {};
    const mockReq = {
      method: 'POST',
      url: req.url,
      body,
      on: (evt, cb) => {
        if (evt === 'data') cb(JSON.stringify(body));
        if (evt === 'end') cb();
      },
      getQueryParams: () => ({}),
      getMethod: () => 'POST'
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
    return NextResponse.json(jsonResult, { status: statusCode });
  } catch (err) {
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

export async function DELETE(req) {
  return NextResponse.json({ success: true }, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*' } });
}
