/**
 * drishtiVoice — Catalyst AdvancedIO Function (v2 — Production Reliable)
 *
 * Handles two modes:
 *
 *  MODE "stt":
 *    POST multipart/form-data OR JSON { mode:"stt", audioBase64, mimeType, lang }
 *    → { transcript, source: "zia"|"browser_fallback" }
 *
 *  MODE "tts":
 *    POST JSON { mode:"tts", text, lang }
 *    → { audioBase64, mimeType, source: "zia"|"browser_fallback" }
 *
 * Key fixes over v1:
 *  1. FormData boundary bug fixed — axios sets correct multipart content-type
 *  2. Content-type validation on TTS response — detects Zia error HTML pages
 *  3. Token read from env (Catalyst Connections preferred) with proper prefix
 *  4. AbortController-based timeout (not axios timeout which can hang)
 *  5. X-Zia-Version header added (required by newer Zia endpoints)
 *  6. Never returns 500 — always browser_fallback so frontend degrades cleanly
 *
 * ZERO external API calls outside Zoho Catalyst ecosystem.
 */

const axios = require('axios');
const FormData = require('form-data');

// ─── Auth helpers ─────────────────────────────────────────────────────────────
function getZiaToken() {
  const raw = process.env.QUICKML_OAUTH_TOKEN || '';
  if (!raw) throw new Error('QUICKML_OAUTH_TOKEN not configured');
  if (raw.startsWith('Zoho-oauthtoken ') || raw.startsWith('Bearer ')) return raw;
  return `Zoho-oauthtoken ${raw}`;
}

function getOrgId() {
  return process.env.CATALYST_ORG_ID || '60073715607';
}

function ziaHeaders(extra = {}) {
  return {
    Authorization: getZiaToken(),
    'CATALYST-ORG': getOrgId(),
    'X-Zia-Version': 'v1',
    Environment: 'Development',
    ...extra,
  };
}

// ─── STT via Zia Audio-to-Text ────────────────────────────────────────────────
async function callZiaSTT(audioBase64, mimeType, lang) {
  const url =
    process.env.QUICKML_STT_ENDPOINT_URL ||
    'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/audio/transcribe';

  const audioBuffer = Buffer.from(audioBase64, 'base64');

  // Build FormData correctly — axios will set the multipart boundary automatically
  const form = new FormData();
  form.append('audio_file', audioBuffer, {
    filename: mimeType?.includes('ogg') ? 'audio.ogg' : 'audio.webm',
    contentType: mimeType || 'audio/webm;codecs=opus',
  });
  form.append('language', lang === 'kn' ? 'kn-IN' : 'en-IN');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await axios.post(url, form, {
      headers: ziaHeaders(form.getHeaders()),
      signal: controller.signal,
      // Do NOT set timeout here — use AbortController above
    });

    clearTimeout(timer);

    const data = response.data;

    // Detect if Zia returned an HTML error page (common Zia bug)
    if (typeof data === 'string' && data.trim().startsWith('<')) {
      throw new Error('Zia STT returned HTML error page instead of JSON');
    }

    const transcript =
      data?.data?.transcript_text ||
      data?.data?.transcript ||
      data?.transcript_text ||
      data?.transcript ||
      data?.text ||
      data?.output ||
      '';

    if (!transcript) throw new Error('Zia STT returned empty transcript');
    return transcript;
  } finally {
    clearTimeout(timer);
  }
}

// ─── TTS via Zia Text-to-Audio ────────────────────────────────────────────────
async function callZiaTTS(text, lang) {
  const url =
    process.env.QUICKML_TTS_ENDPOINT_URL ||
    'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/tts/synthesize';

  const langCode = lang?.startsWith('kn') ? 'kn' : 'en';
  // Strip markdown characters that garble TTS
  const cleanText = text
    .replace(/[|*#`_~>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);

  // Try multiple payload variants — Zia API shape varies between environments
  const payloads = [
    { text: cleanText, language: langCode, speaker: langCode === 'kn' ? 'Vidya' : 'Anna', speed: 'moderate', pitch: 'moderate' },
    { text: cleanText, language: langCode === 'kn' ? 'kn-IN' : 'en-IN' },
    { text: cleanText, language: langCode },
  ];

  let lastError = null;
  for (const payload of payloads) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);

    try {
      const response = await axios.post(url, payload, {
        headers: ziaHeaders({ 'Content-Type': 'application/json' }),
        signal: controller.signal,
        responseType: 'arraybuffer',
      });

      clearTimeout(timer);

      // Validate that we got actual audio, not an HTML/JSON error page
      const contentType = response.headers['content-type'] || '';
      const isAudio = contentType.startsWith('audio/') || contentType.includes('octet-stream');

      if (!isAudio || !response.data || response.data.byteLength < 200) {
        // Convert buffer to string to log the actual error
        const errMsg = Buffer.from(response.data).toString('utf8').slice(0, 200);
        throw new Error(`Zia TTS non-audio response (${contentType}): ${errMsg}`);
      }

      const audioBase64 = Buffer.from(response.data).toString('base64');
      return { audioBase64, mimeType: contentType };
    } catch (err) {
      clearTimeout(timer);
      lastError = err;
      // Continue to next payload variant
    }
  }

  throw new Error(`Zia TTS all variants failed: ${lastError?.message}`);
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
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

  // Parse JSON body
  let body = req.body;
  if (!body || Object.keys(body).length === 0) {
    try {
      const raw = await new Promise((resolve, reject) => {
        let buf = '';
        req.on('data', c => { buf += c; });
        req.on('end', () => resolve(buf));
        req.on('error', reject);
      });
      body = JSON.parse(raw || '{}');
    } catch {
      // Return browser_fallback so frontend can handle gracefully
      return send(200, { transcript: '', audioBase64: '', source: 'browser_fallback' });
    }
  }

  const { mode, lang = 'en' } = body;

  // ── STT ───────────────────────────────────────────────────────────────────
  if (mode === 'stt') {
    const { audioBase64, mimeType } = body;

    if (!audioBase64) {
      return send(200, { transcript: '', source: 'browser_fallback' });
    }

    try {
      const transcript = await callZiaSTT(audioBase64, mimeType, lang);
      console.log('[drishtiVoice STT] ✅ Zia transcript received, length:', transcript.length);
      return send(200, { transcript, source: 'zia' });
    } catch (err) {
      console.error('[drishtiVoice STT] Zia failed:', err.message);
      return send(200, { transcript: '', source: 'browser_fallback' });
    }
  }

  // ── TTS ───────────────────────────────────────────────────────────────────
  if (mode === 'tts') {
    const { text } = body;

    if (!text || !text.trim()) {
      return send(200, { audioBase64: '', source: 'browser_fallback' });
    }

    try {
      const { audioBase64, mimeType } = await callZiaTTS(text.trim(), lang);
      console.log('[drishtiVoice TTS] ✅ Zia audio received, mimeType:', mimeType);
      return send(200, { audioBase64, mimeType, source: 'zia' });
    } catch (err) {
      console.error('[drishtiVoice TTS] Zia failed:', err.message);
      return send(200, { audioBase64: '', source: 'browser_fallback' });
    }
  }

  // Unknown mode — return safe fallback
  return send(200, { transcript: '', audioBase64: '', source: 'browser_fallback' });
};
