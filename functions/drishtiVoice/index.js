/**
 * drishtiVoice — Catalyst AdvancedIO Function
 * Handles two modes via a single endpoint:
 *
 *  MODE "stt":
 *    POST { mode:"stt", audioBase64:string, mimeType?:string, lang:"en"|"kn" }
 *    → { transcript:string, source:"zia"|"browser_fallback" }
 *    Primary: Catalyst Zia Audio-to-Text Transcription
 *    Fallback: returns { transcript:"", source:"browser_fallback" }
 *              so frontend falls back to existing Web Speech API
 *
 *  MODE "tts":
 *    POST { mode:"tts", text:string, lang:"en"|"kn" }
 *    → { audioBase64:string, mimeType:string, source:"zia"|"browser_fallback" }
 *    Primary: Catalyst Zia Text-to-Audio Synthesis
 *    Fallback: returns { audioBase64:"", source:"browser_fallback" }
 *              so frontend falls back to existing speechSynthesis
 *
 * Auth: Zoho-oauthtoken pattern (same as askDrishtiAI).
 * Timeout: 8 s for STT, 10 s for TTS.
 * Never returns 500 — voice output must always have a response.
 */

const axios = require('axios');
const FormData = require('form-data');

// ─── Shared auth headers ──────────────────────────────────────────────────────
function ziaHeaders(token, orgId, extraHeaders = {}) {
  return {
    Authorization: `Zoho-oauthtoken ${token}`,
    'CATALYST-ORG': orgId,
    Environment: 'Development',
    ...extraHeaders,
  };
}

function getEnvOrThrow(name) {
  const val = process.env[name];
  if (!val || val.startsWith('your_')) throw new Error(`${name} not configured`);
  return val;
}

// ─── STT via Zia Audio-to-Text ────────────────────────────────────────────────
async function callZiaSTT(audioBase64, mimeType, lang) {
  const url  = getEnvOrThrow('QUICKML_STT_ENDPOINT_URL');
  const token = getEnvOrThrow('QUICKML_OAUTH_TOKEN');
  const orgId = getEnvOrThrow('CATALYST_ORG_ID');

  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const form = new FormData();

  // Zia Audio-to-Text expects multipart with an "audio_file" field
  form.append('audio_file', audioBuffer, {
    filename: 'audio.webm',
    contentType: mimeType || 'audio/webm',
  });

  // Language hint (BCP-47 locale)
  const locale = lang === 'kn' ? 'kn-IN' : 'en-IN';
  form.append('language', locale);

  const response = await axios.post(url, form, {
    headers: ziaHeaders(token, orgId, form.getHeaders()),
    timeout: 8000,
  });

  const data = response.data;
  // Try multiple known Zia response shapes
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
}

// ─── TTS via Zia Text-to-Audio ────────────────────────────────────────────────
async function callZiaTTS(text, lang) {
  const url = process.env.QUICKML_TTS_ENDPOINT_URL || 'https://api.catalyst.zoho.in/quickml/api/v1/models/zia/tts/synthesize';
  const token = process.env.QUICKML_OAUTH_TOKEN;
  const orgId = process.env.CATALYST_ORG_ID || '60073715607';

  if (!token) throw new Error('QUICKML_OAUTH_TOKEN not configured');

  const langCode = lang?.startsWith('kn') ? 'kn' : 'en';
  const cleanText = text.replace(/[|*#`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);

  const payloads = [
    { text: cleanText, language: langCode, speaker: langCode === 'kn' ? 'Vidya' : 'Anna', pitch: 'moderate', speed: 'moderate', emotion: 'neutral' },
    { text: cleanText, language: langCode },
    { text: cleanText, language: langCode === 'kn' ? 'kn-IN' : 'en-IN' },
  ];

  const authHeaders = [
    token.startsWith('Zoho-oauthtoken ') || token.startsWith('Bearer ') ? token : `Zoho-oauthtoken ${token}`,
    token.startsWith('Bearer ') ? token : `Bearer ${token}`,
  ];

  let lastError = null;

  for (const authHeader of authHeaders) {
    for (const payload of payloads) {
      try {
        const response = await axios.post(
          url,
          payload,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: authHeader,
              'CATALYST-ORG': orgId,
            },
            timeout: 8000,
            responseType: 'arraybuffer',
          }
        );

        if (response.status === 200 && response.data && response.data.byteLength > 100) {
          const contentType = response.headers['content-type'] || 'audio/wav';
          const audioBase64 = Buffer.from(response.data).toString('base64');
          return { audioBase64, mimeType: contentType };
        }
      } catch (err) {
        lastError = err;
      }
    }
  }

  throw new Error(`Zia TTS failed: ${lastError?.message}`);
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

  // Parse body
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
      return send(200, { transcript: '', audioBase64: '', source: 'browser_fallback' });
    }
  }

  const { mode, lang = 'en' } = body;

  // ── STT mode ─────────────────────────────────────────────────────
  if (mode === 'stt') {
    const { audioBase64, mimeType } = body;

    if (!audioBase64) {
      return send(200, { transcript: '', source: 'browser_fallback' });
    }

    try {
      const transcript = await callZiaSTT(audioBase64, mimeType, lang);
      return send(200, { transcript, source: 'zia' });
    } catch (err) {
      console.error('[drishtiVoice STT] Zia failed:', err.message);
      // Tell frontend to use its own Web Speech transcript
      return send(200, { transcript: '', source: 'browser_fallback' });
    }
  }

  // ── TTS mode ─────────────────────────────────────────────────────
  if (mode === 'tts') {
    const { text } = body;

    if (!text || !text.trim()) {
      return send(200, { audioBase64: '', source: 'browser_fallback' });
    }

    try {
      const { audioBase64, mimeType } = await callZiaTTS(text.trim(), lang);
      return send(200, { audioBase64, mimeType, source: 'zia' });
    } catch (err) {
      console.error('[drishtiVoice TTS] Zia failed:', err.message);
      // Tell frontend to use its own speechSynthesis
      return send(200, { audioBase64: '', source: 'browser_fallback' });
    }
  }

  // Unknown mode
  return send(200, { transcript: '', audioBase64: '', source: 'browser_fallback' });
};
