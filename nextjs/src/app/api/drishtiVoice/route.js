import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

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

async function callZiaSTT(audioBase64, mimeType, lang) {
  const url  = getEnvOrThrow('QUICKML_STT_ENDPOINT_URL');
  const token = getEnvOrThrow('QUICKML_OAUTH_TOKEN');
  const orgId = getEnvOrThrow('CATALYST_ORG_ID');

  const audioBuffer = Buffer.from(audioBase64, 'base64');
  const form = new FormData();

  form.append('audio_file', audioBuffer, {
    filename: 'audio.webm',
    contentType: mimeType || 'audio/webm',
  });

  const locale = lang === 'kn' ? 'kn-IN' : 'en-IN';
  form.append('language', locale);

  const response = await axios.post(url, form, {
    headers: ziaHeaders(token, orgId, form.getHeaders()),
    timeout: 8000,
  });

  const data = response.data;
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

export async function POST(req) {
  try {
    const body = await req.json();
    const { mode, lang = 'en' } = body;

    if (mode === 'stt') {
      const { audioBase64, mimeType } = body;
      if (!audioBase64) {
        return NextResponse.json({ transcript: '', source: 'browser_fallback' }, { status: 200, headers: CORS });
      }
      try {
        const transcript = await callZiaSTT(audioBase64, mimeType, lang);
        return NextResponse.json({ transcript, source: 'zia' }, { status: 200, headers: CORS });
      } catch (err) {
        console.error('[drishtiVoice STT] Zia failed:', err.message);
        return NextResponse.json({ transcript: '', source: 'browser_fallback' }, { status: 200, headers: CORS });
      }
    }

    if (mode === 'tts') {
      const { text } = body;
      if (!text || !text.trim()) {
        return NextResponse.json({ audioBase64: '', source: 'browser_fallback' }, { status: 200, headers: CORS });
      }
      try {
        const { audioBase64, mimeType } = await callZiaTTS(text.trim(), lang);
        return NextResponse.json({ audioBase64, mimeType, source: 'zia' }, { status: 200, headers: CORS });
      } catch (err) {
        console.error('[drishtiVoice TTS] Zia failed:', err.message);
        return NextResponse.json({ audioBase64: '', source: 'browser_fallback' }, { status: 200, headers: CORS });
      }
    }

    return NextResponse.json({ transcript: '', audioBase64: '', source: 'browser_fallback' }, { status: 200, headers: CORS });
  } catch (err) {
    console.error('[drishtiVoice] Unhandled error:', err.message);
    return NextResponse.json({ transcript: '', audioBase64: '', source: 'browser_fallback' }, { status: 200, headers: CORS });
  }
}
