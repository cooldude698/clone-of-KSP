import { loadCatalystFunction } from '@/lib/dynamic-fn-loader';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req) {
  try {
    const fn = loadCatalystFunction('export-pdf');
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
    return NextResponse.json(jsonResult, { status: statusCode, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { conversation_id, title, officer_name, badge_number, messages } = body;

    // If messages are passed directly, build HTML and return base64
    if (messages && messages.length > 0) {
      const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
      const messagesHtml = messages.map(msg => {
        const isUser = msg.role === 'user' || msg.role === 'officer';
        const roleLabel = isUser ? 'OFFICER' : 'DRISHTI AI';
        const cssClass = isUser ? 'user' : 'assistant';
        return `<div class="message-block ${cssClass}">
          <div class="role-label">${roleLabel} <span class="timestamp">${msg.timestamp || ''}</span></div>
          <div class="message-text">${(msg.content || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        </div>`;
      }).join('\n');

      const htmlContent = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>DRISHTI Intelligence Report</title><style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.6; margin: 30px; }
        .header-bar { background: #0f172a; color: #fff; padding: 20px; border-radius: 8px; margin-bottom: 24px; }
        .logo { font-size: 16px; font-weight: bold; margin-bottom: 6px; letter-spacing: 1.5px; }
        .title { font-size: 20px; margin-bottom: 10px; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 6px; }
        .meta { font-family: monospace; font-size: 11px; color: #94a3b8; }
        .message-block { margin-bottom: 16px; padding: 12px 16px; border-radius: 6px; }
        .message-block.user { border-left: 4px solid #2563eb; background: #f0f9ff; }
        .message-block.assistant { border-left: 4px solid #0f172a; background: #f8fafc; border: 1px solid #e2e8f0; }
        .role-label { font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 4px; color: #334155; }
        .timestamp { font-weight: normal; color: #94a3b8; margin-left: 8px; }
        .message-text { font-size: 13px; white-space: pre-wrap; word-break: break-word; }
        .footer { margin-top: 36px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
      </style></head><body>
        <div class="header-bar">
          <div class="logo">🔵 KARNATAKA STATE POLICE — DRISHTI AI</div>
          <div class="title">${title || 'Intelligence Briefing Session Log'}</div>
          <div class="meta">Officer: ${officer_name || 'Insp. KSP Command'} &nbsp;|&nbsp; Badge: ${badge_number || 'KA-POL-8842'} &nbsp;|&nbsp; Generated: ${dateStr}</div>
        </div>
        <div>${messagesHtml}</div>
        <div class="footer">CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE — DRISHTI KSP COMMAND</div>
      </body></html>`;

      const content_base64 = Buffer.from(htmlContent).toString('base64');
      return NextResponse.json({
        success: true,
        filename: `DRISHTI_Report_${Date.now()}.html`,
        content_base64,
        content_type: 'text/html',
      }, { status: 200, headers: CORS });
    }

    // Otherwise execute Catalyst export-pdf function directly
    const fn = loadCatalystFunction('export-pdf');
    let statusCode = 200;
    let jsonResult = {};
    const mockReq = {
      method: 'POST',
      url: req.url,
      getBody: () => body,
      body,
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
    return NextResponse.json(jsonResult, { status: statusCode, headers: CORS });
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500, headers: CORS });
  }
}
