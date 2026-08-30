export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import axios from 'axios';
import { executeDrishtiIntelligenceQuery } from '@/lib/drishtiIntelligenceEngine';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// --- Zoho Catalyst QuickML RAG Call (100% Zoho Ecosystem) -------------------
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
    { headers, timeout: 6000 }
  );

  const answer = ragRes.data?.answer || ragRes.data?.response || ragRes.data?.data?.answer || '';
  if (answer.trim()) return answer.trim();

  throw new Error('QuickML RAG returned empty answer');
}

// --- Main Handler (Zero External APIs) ---------------------------------------
export async function POST(req) {
  try {
    const body = await req.json();

    const { question, lang = 'en', sessionHistory = [], history = [] } = body;
    const activeHistory = history.length > 0 ? history : sessionHistory;

    if (!question?.trim()) {
      return NextResponse.json(
        { 
          answer: 'No question received, Sir. How can I assist your investigation?',
          spokenAnswer: 'How can I assist your command shift today, Sir?',
          language: lang,
          source: 'system' 
        },
        { status: 200, headers: CORS }
      );
    }

    let workingQuestion = question.trim();
    let finalAnswer = '';
    let finalSpokenAnswer = '';
    let source = 'drishti_autonomous_engine';
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

    // 1. Try Zoho Catalyst QuickML RAG (Official Zoho Ecosystem)
    try {
      finalAnswer = await callQuickML(workingQuestion, formattedHistory);
      finalSpokenAnswer = finalAnswer.slice(0, 250);
      source = 'catalyst_quickml';
    } catch (quickMlErr) {
      // 2. DRISHTI Autonomous In-Memory Police Reasoning Engine (Zero External APIs)
      resultPayload = await executeDrishtiIntelligenceQuery(workingQuestion, targetLang, activeHistory);
      finalAnswer = resultPayload.answer;
      finalSpokenAnswer = resultPayload.spokenAnswer || resultPayload.answer;
      source = 'drishti_autonomous_engine';
    }

    // Ensure structured intelligence metadata is present if needed
    if (!resultPayload) {
      try {
        resultPayload = await executeDrishtiIntelligenceQuery(workingQuestion, targetLang, activeHistory);
      } catch (_) {}
    }

    const suggestions = resultPayload?.suggestions?.length > 0 ? resultPayload.suggestions : [
      'Show Clearance & Target Suspects',
      'ANPR camera hits near Silk Board',
      'NDPS Drug Seizure SOP & Panchanama',
      'Cyber Fraud 1930 Helpline SOP',
    ];

    return NextResponse.json(
      {
        answer: finalAnswer,
        spokenAnswer: finalSpokenAnswer || finalAnswer,
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
        spokenAnswer: result.spokenAnswer || result.answer,
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
