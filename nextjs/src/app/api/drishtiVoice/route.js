import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';
import { EdgeTTS } from '@seepine/edge-tts';

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

  const locale = lang === 'kn' ? 'kn-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
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

  const langCode = lang?.startsWith('kn') ? 'kn' : lang?.startsWith('hi') ? 'hi' : 'en';
  const speaker = langCode === 'kn' ? 'Vidya' : langCode === 'hi' ? 'Kajal' : 'Anna';
  const cleanText = text.replace(/[|*#`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500);

  const payloads = [
    { text: cleanText, language: langCode, speaker, pitch: 'moderate', speed: 'moderate', emotion: 'neutral' },
    { text: cleanText, language: langCode },
    { text: cleanText, language: langCode === 'kn' ? 'kn-IN' : langCode === 'hi' ? 'hi-IN' : 'en-IN' },
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

  if (lastError?.response) {
    console.error('[Zia TTS] HTTP Status:', lastError.response.status);
    console.error('[Zia TTS] Response body:', JSON.stringify(lastError.response.data)?.slice(0, 300));
  }
  throw new Error(`Zia TTS failed: ${lastError?.message}`);
}

async function callNeuralTTS(text, lang) {
  const cleanText = text.replace(/[|*#`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800);
  const voice = lang?.startsWith('kn')
    ? 'kn-IN-SapnaNeural'
    : lang?.startsWith('hi')
    ? 'hi-IN-SwaraNeural'
    : 'en-IN-NeerjaNeural';

  // EdgeTTS WebSockets hang inside Next.js's runtime — run it in a child process instead
  const { execFile } = await import('child_process');
  const { promisify } = await import('util');
  const execFileAsync = promisify(execFile);

  const nodeScript = `
const { EdgeTTS } = require('@seepine/edge-tts');
(async () => {
  try {
    const tts = new EdgeTTS({ voice: '${voice}' });
    const result = await tts.call(${JSON.stringify(cleanText)});
    if (result && result.data && result.data.length > 100) {
      process.stdout.write(result.data.toString('base64'));
    } else {
      process.exit(1);
    }
  } catch (e) {
    process.stderr.write(e.message);
    process.exit(1);
  }
})();
`;

  const { stdout } = await execFileAsync(process.execPath, ['-e', nodeScript], {
    timeout: 12000,
    maxBuffer: 10 * 1024 * 1024, // 10MB
    cwd: process.cwd(),
    env: { ...process.env, NODE_PATH: `${process.cwd()}/node_modules` },
  });

  if (stdout && stdout.length > 100) {
    return { audioBase64: stdout, mimeType: 'audio/mpeg' };
  }
  throw new Error('EdgeTTS child process returned empty audio');
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
      // 1. Try Microsoft Neural TTS (Human-like voice profile with natural pauses)
      try {
        const { audioBase64, mimeType } = await callNeuralTTS(text.trim(), lang);
        return NextResponse.json({ audioBase64, mimeType, source: 'neural_tts' }, { status: 200, headers: CORS });
      } catch (neuralErr) {
        console.warn('[drishtiVoice TTS] Neural TTS failed, trying Zia:', neuralErr.message);
      }

      // 2. Fall back to Zia TTS
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
