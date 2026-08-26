/**
 * chat — Catalyst AdvancedIO Function (Clean QuickML RAG Proxy)
 *
 * Previously deprecated (was using Gemini). Now reactivated as a pure
 * Catalyst QuickML RAG endpoint — no external AI APIs.
 *
 * POST body: { message: string, history: Array<{role,content}>, lang?: 'en'|'kn' }
 * Response:  { response_text: string, source: 'quickml'|'local_fallback', lang }
 */

const axios = require('axios');

// ─── QuickML RAG call ─────────────────────────────────────────────────────────
async function callQuickML(question, knowledgeContext = '') {
  const token = process.env.QUICKML_OAUTH_TOKEN;
  const orgId = process.env.CATALYST_ORG_ID || '60073715607';

  if (!token) throw new Error('QUICKML_OAUTH_TOKEN not configured');

  const authHeader = token.startsWith('Zoho-oauthtoken ') || token.startsWith('Bearer ')
    ? token
    : `Zoho-oauthtoken ${token}`;

  const promptContent = knowledgeContext
    ? `OFFICER QUERY: ${question}\n\nKNOWLEDGE CONTEXT:\n${knowledgeContext}`
    : question;

  const targets = [
    {
      url: process.env.QUICKML_RAG_ENDPOINT_URL ||
        'https://api.catalyst.zoho.in/quickml/v1/project/49149000000019001/rag/answer',
      payload: {
        model: 'GLM-4.7-Flash',
        messages: [{ role: 'user', content: promptContent }],
        temperature: 0.2,
        max_tokens: 800
      }
    },
    {
      url: 'https://api.catalyst.zoho.in/quickml/v1/project/49149000000019001/glm/chat',
      payload: {
        model: 'crm-di-glm47b_30b_it',
        messages: [{ role: 'user', content: promptContent }],
        temperature: 0.2,
        max_tokens: 800
      }
    }
  ];

  let lastErr;
  for (const target of targets) {
    try {
      const response = await axios.post(target.url, target.payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: authHeader,
          'CATALYST-ORG': orgId,
        },
        timeout: 8000,
      });

      const data = response.data;
      const answer =
        data?.choices?.[0]?.message?.content ||
        data?.choices?.[0]?.delta?.content ||
        data?.output ||
        data?.answer ||
        '';

      if (answer && answer.trim()) return answer.trim();
    } catch (e) {
      lastErr = e;
    }
  }

  throw new Error(`QuickML endpoints failed: ${lastErr?.message}`);
}

// ─── Local smart fallback (no network calls) ──────────────────────────────────
function localFallback(question) {
  const q = (question || '').toLowerCase();
  if (q.includes('hotspot') || q.includes('crime zone') || q.includes('heatmap')) {
    return 'Top crime hotspots: Silk Board (48 incidents, Vehicle Theft), MG Road (32, Chain Snatching), Whitefield (27, Robbery). Peak hours: 10PM–4AM.';
  }
  if (q.includes('repeat') || q.includes('offender') || q.includes('ramesh')) {
    return 'Top repeat offenders: 1) Ramesh Kumar (Risk 94%, 7 FIRs, Vehicle Theft). 2) Suresh Naidu (Risk 88%, 5 FIRs, Robbery). 3) Imran Khan (Risk 76%, 4 FIRs, Narcotics).';
  }
  if (q.includes('fir') || q.includes('case')) {
    return 'Recent FIRs: KAR/BEN/2024/1840 (Vehicle Theft, Bengaluru Urban), KAR/RAI/2024/0123 (Vehicle Theft, Raichur), KAR/BEN/2024/1726 (Drug Offence, Bengaluru Urban). Total active cases: 968.';
  }
  if (q.includes('trend') || q.includes('monthly') || q.includes('statistic')) {
    return 'Crime trends 2026: Jan 142 | Feb 118 | Mar 167 | Apr 134 | May 189 | Jun 201 cases. Vehicle theft (+38%) and cybercrime (+22%) are rising fastest.';
  }
  return 'DRISHTI Intelligence System is operational. I can answer queries about crime hotspots, repeat offenders, FIR records, ANPR surveillance, and KSP standard operating procedures. Please ask a specific question, Sir.';
}

// ─── Main handler ─────────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const send = (code, data) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  if (req.method !== 'POST') {
    return send(405, { error: true, message: 'Method Not Allowed' });
  }

  let body = req.body;
  if (!body || Object.keys(body).length === 0) {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', c => { data += c; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw || '{}');
    } catch {
      return send(200, { response_text: localFallback(''), source: 'local_fallback', lang: 'en' });
    }
  }

  const { message, lang = 'en' } = body;

  if (!message || !message.trim()) {
    return send(200, {
      response_text: 'Please ask me a question, Sir.',
      source: 'local_fallback',
      lang,
    });
  }

  let responseText;
  let source;

  try {
    responseText = await callQuickML(message.trim());
    source = 'quickml';
  } catch (err) {
    console.error('[chat] QuickML failed:', err.message);
    responseText = localFallback(message);
    source = 'local_fallback';
  }

  return send(200, { response_text: responseText, source, lang });
};