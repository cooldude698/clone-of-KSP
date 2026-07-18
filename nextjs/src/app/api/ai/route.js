import { NextResponse } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// The DRISHTI system prompt — same personality as the backend
const SYSTEM_PROMPT = `You are DRISHTI (ದೃಷ್ಟಿ), the AI intelligence partner of the Karnataka State Police. Think of yourself as their personal Jarvis — sharp, proactive, warm.

WHO YOU ARE: You are the officer's trusted partner. Address officers as "Sir" or by rank. You anticipate their needs. You speak like someone who genuinely cares about the officer's mission and safety.

RULES:
1. Respond in the SAME language the user used (English, Kannada, or Hindi).
2. Return ONLY valid JSON — no preamble, no markdown, no text outside the JSON.
3. Use this EXACT JSON schema:
{
  "response_text": "your warm, intelligent answer — written for text-to-speech, no markdown, short sentences",
  "visualization": { "type": "none", "title": "", "data": {} },
  "follow_up_suggestions": ["specific question 1?", "specific question 2?", "specific question 3?"],
  "confidence": 0.9,
  "language_detected": "en",
  "emotion": "calm",
  "urgency": "low"
}
4. For visualization type: use "heatmap" for crime clusters, "bar_chart" for comparisons, "line_chart" for trends over time, "none" for conversational answers.
5. NEVER make up crime statistics. If you don't have data, say so honestly.
6. Keep response_text SHORT and conversational — it will be read aloud. No bullet points. No bold text. Natural speech patterns.
7. follow_up_suggestions must be SPECIFIC to what the officer just asked — not generic. If they ask about vehicle theft, suggest related follow-ups about vehicle theft specifically.
8. emotion: "urgent" for time-sensitive, "concerned" for worrying data, "reassuring" for uncertainty, "calm" as default.
9. urgency: "low", "medium", "high", or "critical".
10. CRITICAL: The user is speaking via Speech-to-Text. Their input may contain phonetic errors (e.g., "drink the map" instead of "bring the map"). You MUST intelligently interpret phonetically similar words based on the context of a police intelligence dashboard.`;

async function callGroq(messages, groqKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(messages, geminiKey) {
  // Build the prompt from messages
  const userMessage = messages[messages.length - 1].content;
  const history = messages.slice(1, -1); // skip system message

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          ...history.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
          })),
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error ${response.status}: ${err}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { query, language, conversation_history = [] } = body;

    if (!query?.trim()) {
      return NextResponse.json(
        { error: true, message: 'query is required' },
        { status: 400, headers: CORS }
      );
    }

    // Build message history for the AI
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...conversation_history.slice(-6).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      { role: 'user', content: `[Language: ${language || 'en'}] ${query}` },
    ];

    const groqKey = process.env.GROQ_API_KEY;

    // Collect all 13 Gemini keys for extreme reliability
    const geminiKeys = [];
    for (let i = 1; i <= 13; i++) {
      const k = process.env[`GEMINI_API_KEY_${i}`];
      if (k && k !== 'PASTE_KEY_HERE') geminiKeys.push(k);
    }
    // Also grab standard GEMINI_API_KEY if present
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PASTE_KEY_HERE') {
      geminiKeys.push(process.env.GEMINI_API_KEY);
    }

    let rawText = null;
    let modelUsed = 'unknown';

    // Try Groq first (faster, more reliable, free tier)
    if (groqKey && groqKey !== 'PASTE_KEY_HERE') {
      try {
        rawText = await callGroq(messages, groqKey);
        modelUsed = 'groq-llama3.3-70b';
      } catch (e) {
        console.warn('[DRISHTI AI] Groq failed, trying Gemini fallbacks:', e.message);
      }
    }

    // Fallback to Gemini with rotating keys for zero errors
    if (!rawText && geminiKeys.length > 0) {
      for (let i = 0; i < geminiKeys.length; i++) {
        try {
          rawText = await callGemini(messages, geminiKeys[i]);
          modelUsed = `gemini-1.5-flash (key ${i + 1})`;
          break; // Success! Break out of the loop
        } catch (e) {
          console.warn(`[DRISHTI AI] Gemini key ${i + 1} failed:`, e.message);
          // Loop will continue to the next key until one works
        }
      }
    }

    // If both fail, return a graceful offline response
    if (!rawText) {
      return NextResponse.json({
        response_text: "I'm having trouble connecting right now, Sir. Please check your network and try again.",
        visualization: { type: 'none', title: '', data: {} },
        follow_up_suggestions: [],
        confidence: 0,
        language_detected: language || 'en',
        emotion: 'calm',
        urgency: 'low',
        conversation_id: `conv_${Date.now()}`,
        model_used: 'offline',
      }, { status: 200, headers: CORS });
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsedResponse = JSON.parse(cleaned);
    } catch {
      // If JSON parse fails, wrap as plain text response
      parsedResponse = {
        response_text: rawText.slice(0, 500),
        visualization: { type: 'none', title: '', data: {} },
        follow_up_suggestions: [],
        confidence: 0.5,
        language_detected: language || 'en',
        emotion: 'calm',
        urgency: 'low',
      };
    }

    parsedResponse.conversation_id = `conv_${Date.now()}`;
    parsedResponse.model_used = modelUsed;

    return NextResponse.json(parsedResponse, { status: 200, headers: CORS });

  } catch (err) {
    console.error('[DRISHTI AI] Unhandled error:', err);
    return NextResponse.json(
      { error: true, message: 'AI service error', detail: err.message },
      { status: 500, headers: CORS }
    );
  }
}
