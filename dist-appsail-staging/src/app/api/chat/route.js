import { NextResponse } from 'next/server';
import { executeDrishtiIntelligenceQuery } from '@/lib/drishtiIntelligenceEngine';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = body.message || body.question || body.query || '';
    const lang = body.lang || 'en';
    const role = body.role || 'Officer';
    const history = body.history || body.sessionHistory || [];

    if (!question.trim()) {
      return NextResponse.json({
        reply: `Jai Hind, ${role}. How can DRISHTI AI assist your command operations today?`,
        response: `Jai Hind, ${role}. How can DRISHTI AI assist your command operations today?`,
        suggestions: ['Show Clearance & Target Suspects', 'Inspect Ramesh Kumar Dossier', 'Analyze Crime Hotspots'],
      }, { status: 200, headers: CORS });
    }

    const intelResult = await executeDrishtiIntelligenceQuery(question, lang, history);

    return NextResponse.json({
      reply: intelResult.answer,
      response: intelResult.answer,
      answer: intelResult.answer,
      suspects: intelResult.suspects || [],
      case_cards: intelResult.case_cards || [],
      suggestedActions: intelResult.suggestions || [],
      follow_up_suggestions: intelResult.suggestions || [],
      stats: intelResult.kpis || {},
      source: 'drishti_intelligence_engine',
    }, { status: 200, headers: CORS });
  } catch (err) {
    console.error('[/api/chat] Intelligence processing error:', err.message);
    const fallback = await executeDrishtiIntelligenceQuery('bengaluru crime status', 'en');
    return NextResponse.json({
      reply: fallback.answer,
      response: fallback.answer,
      answer: fallback.answer,
      source: 'drishti_intelligence_engine',
    }, { status: 200, headers: CORS });
  }
}
