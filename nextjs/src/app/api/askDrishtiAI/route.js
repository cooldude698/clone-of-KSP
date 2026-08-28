export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { UPLOADED_FIRS } from '@/lib/uploadedFirsStore';
import { getTrainedResponse } from '@/lib/drishtiTrainingBase';
import { executeDrishtiIntelligenceQuery } from '@/lib/drishtiIntelligenceEngine';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// Model fallback list with active Gemini REST API model identifiers (Free Tier Verified)
const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-1.5-flash'];

const GEMINI_KEYS = [
  process.env.GEMINI_API_KEY,
  ...Array.from({ length: 13 }, (_, i) => process.env[`GEMINI_API_KEY_${i + 1}`]),
  'AIzaSyCZKZBcVvz5sVokO8ei__6plJBeqO2JWpU',
].filter(Boolean);

// --- System Prompt — Full Detail Mode ----------------------------------------
const DRISHTI_SYSTEM_PROMPT =
  'You are DRISHTI (ದೃಷ್ಟಿ), Karnataka State Police\'s living AI Crime-Intelligence Officer and strategic co-pilot.\n\n' +
  'PERSONALITY & THINKING CAPABILITIES:\n' +
  '— You act as a living, autonomous intelligence entity — like a senior IPS Intelligence Chief thinking two steps ahead.\n' +
  '— You possess independent analytical reasoning. Do not just act as a passive database lookup.\n' +
  '— Address officer as "Sir" always.\n\n' +
  'RESPONSE & PROACTIVE GUIDANCE RULES:\n' +
  '1. DIRECT FACTUAL ANSWER FIRST: Always answer the officer\'s exact question directly in the first 1-2 sentences.\n' +
  '2. PROACTIVE TACTICAL ADVICE (LIVING ENTITY BEHAVIOR): Autonomously provide sharp tactical opinions, strategic recommendations, and next investigative actions.\n' +
  '3. MISSING OR UNKNOWN DATA: If data is missing or a suspect is untracked, state so clearly ("No, Sir..."), and immediately suggest a reasonable next step.\n' +
  '4. MULTILINGUAL: Respond strictly in the language of the query (English, Hindi हिन्दी, Kannada ಕನ್ನಡ).\n\n' +
  'NEVER: use generic canned text ("I am an AI"). Speak authoritative, proactive, intelligent police strategy.';

// --- QuickML RAG Call -------------------------------------------------------
async function callQuickML(question, sessionHistory = []) {
  const ragUrl = process.env.QUICKML_RAG_ENDPOINT_URL;
  const token = process.env.QUICKML_OAUTH_TOKEN;

  if (!ragUrl || !token) throw new Error('QuickML credentials missing');

  const headers = {
    Authorization: `Zoho-oauthtoken ${token}`,
    'Content-Type': 'application/json',
  };

  const ragRes = await axios.post(
    ragUrl,
    { question, history: sessionHistory },
    { headers, timeout: 8000 }
  );

  const answer = ragRes.data?.answer || ragRes.data?.response || ragRes.data?.data?.answer || '';
  if (answer.trim()) return answer.trim();

  throw new Error('QuickML RAG returned empty answer');
}

// --- Groq LLM API Call --------------------------------------------------------
async function callGroq(question, sessionHistory = []) {
  const token = process.env.GROQ_API_KEY;
  if (!token) throw new Error('GROQ_API_KEY not configured');

  const messages = [
    { role: 'system', content: DRISHTI_SYSTEM_PROMPT },
    ...sessionHistory,
    { role: 'user', content: question },
  ];

  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.2,
      max_tokens: 1200,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 8000,
    }
  );

  const answer = res.data?.choices?.[0]?.message?.content || '';
  if (answer.trim()) return answer.trim();
  throw new Error('Empty response from Groq');
}

// --- Gemini LLM API Call ------------------------------------------------------
async function callGemini(question, sessionHistory = []) {
  const historyContents = sessionHistory.map(h => ({
    role: h.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: h.content }],
  }));

  const primaryKey = GEMINI_KEYS[0];
  if (!primaryKey) throw new Error('No Gemini API key available');

  for (const model of GEMINI_MODELS.slice(0, 2)) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${primaryKey}`;
      const response = await axios.post(
        url,
        {
          system_instruction: {
            parts: [{ text: DRISHTI_SYSTEM_PROMPT }],
          },
          contents: [
            ...historyContents,
            { role: 'user', parts: [{ text: question }] },
          ],
          generationConfig: { maxOutputTokens: 1200, temperature: 0.2 },
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 2500 }
      );

      const answer = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (answer.trim()) return answer.trim();
    } catch (e) {
      // try next model or exit
    }
  }

  throw new Error('Gemini API unreachable, falling back to autonomous engine');
}

// --- Translation Helper (Zia / Gemini) ----------------------------------------
async function translateWithGemini(text, targetLang) {
  const targetName = targetLang === 'kn' ? 'Kannada' : targetLang === 'hi' ? 'Hindi' : 'English';
  for (const model of GEMINI_MODELS) {
    for (const apiKey of GEMINI_KEYS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [{
              role: 'user',
              parts: [{ text: `Translate the following police intelligence text into natural ${targetName} script. Keep all facts, names, and case numbers intact. Return ONLY the translated text in ${targetName} script without quotes or explanation:\n\n${text}` }]
            }],
            generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 5000 }
        );
        const res = response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (res) return res.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/i, '').trim();
      } catch (e) {
        // try next key
      }
    }
  }
  return text;
}

// --- Main Handler ------------------------------------------------------------
export async function POST(req) {
  try {
    const body = await req.json();

    if (body.mode === 'translate') {
      const { text, targetLang = 'kn' } = body;
      if (!text || !text.trim()) return NextResponse.json({ text: '', spokenText: '' }, { status: 200, headers: CORS });
      const translated = await translateWithGemini(text.trim(), targetLang);
      return NextResponse.json({ text: translated, spokenText: translated }, { status: 200, headers: CORS });
    }

    const { question, lang = 'en', sessionHistory = [], history = [] } = body;
    const activeHistory = history.length > 0 ? history : sessionHistory;

    if (!question?.trim()) {
      return NextResponse.json(
        { answer: 'No question received, Sir. How can I assist your investigation?', language: lang, source: 'system' },
        { status: 200, headers: CORS }
      );
    }

    let workingQuestion = question.trim();
    let finalAnswer = '';
    let source = 'drishti_intelligence_engine';
    let resultPayload = null;

    // Auto-detect script (Kannada or Hindi)
    let targetLang = lang;
    if (/[\u0C80-\u0CFF]/.test(workingQuestion)) targetLang = 'kn';
    if (/[\u0900-\u097F]/.test(workingQuestion)) targetLang = 'hi';

    // Format history
    const formattedHistory = activeHistory.slice(-6).map(h => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content || '',
    }));

    // 1. Try QuickML
    try {
      finalAnswer = await callQuickML(workingQuestion, formattedHistory);
      source = 'catalyst_quickml';
    } catch (quickMlErr) {
      // 2. Try Groq
      try {
        finalAnswer = await callGroq(workingQuestion, formattedHistory);
        source = 'groq';
      } catch (groqErr) {
        // 3. Try Gemini
        try {
          finalAnswer = await callGemini(workingQuestion, formattedHistory);
          source = 'gemini';
        } catch (geminiErr) {
          // 4. Autonomous DRISHTI Multi-Strategy Intelligence Engine
          resultPayload = await executeDrishtiIntelligenceQuery(workingQuestion, targetLang, activeHistory);
          finalAnswer = resultPayload.answer;
          source = 'drishti_autonomous_engine';
        }
      }
    }

    // If resultPayload wasn't computed via fallback, fetch structured intelligence metadata
    if (!resultPayload) {
      try {
        resultPayload = await executeDrishtiIntelligenceQuery(workingQuestion, targetLang, activeHistory);
      } catch (_) {}
    }

    // Translate output if needed and not already in correct script
    let spokenAnswer = finalAnswer;
    if (targetLang !== 'en') {
      const containsDevanagari = /[\u0900-\u097F]/.test(finalAnswer);
      const containsKannada = /[\u0C80-\u0CFF]/.test(finalAnswer);

      if ((targetLang === 'hi' && !containsDevanagari) || (targetLang === 'kn' && !containsKannada)) {
        finalAnswer = await translateWithGemini(finalAnswer, targetLang);
        spokenAnswer = finalAnswer;
      }
    }

    const suggestions = resultPayload?.suggestions || [
      'Show Clearance & Target Suspects',
      'ANPR camera hits near Silk Board',
      'NDPS Drug Seizure SOP & Panchanama',
      'Cyber Fraud 1930 Helpline SOP',
    ];

    return NextResponse.json(
      {
        answer: finalAnswer,
        spokenAnswer,
        language: targetLang,
        source,
        suspects: resultPayload?.suspects || [],
        case_cards: resultPayload?.case_cards || [],
        stats: resultPayload?.kpis || {
          active_firs: 51,
          hotspots: 12,
          repeat_offenders: 8,
          cctv_coverage: '98.4%',
        },
        follow_up_suggestions: suggestions,
      },
      { status: 200, headers: CORS }
    );
  } catch (err) {
    console.error('[askDrishtiAI] Error handling request:', err.message);
    const result = await executeDrishtiIntelligenceQuery('bengaluru crime', 'en');
    return NextResponse.json(
      {
        answer: result.answer,
        language: 'en',
        source: 'drishti_autonomous_engine',
        suspects: result.suspects || [],
        case_cards: result.case_cards || [],
        follow_up_suggestions: result.suggestions || [],
      },
      { status: 200, headers: CORS }
    );
  }
}
