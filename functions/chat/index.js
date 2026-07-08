require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');
const { getSystemPrompt } = require('./system-prompt');

module.exports = async (req, res) => {

  // Helper to send JSON response
  const send = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  // Read body manually (raw Node.js http)
  let body;
  try {
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => { data += chunk; });
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });
    body = JSON.parse(raw);
  } catch (e) {
    return send(400, { error: true, message: 'Invalid JSON body' });
  }

  try {
    // ── STEP 1: Read request body ──
    const { query, language, conversation_id, conversation_history } = body;

    if (!query) {
      return send(400, { error: true, message: 'query is required' });
    }

    const convId = conversation_id || `conv_${Date.now()}`;
    const lang = language || 'en';

    // ── STEP 2: Load conversation history from NoSQL ──
    let conversationHistory = conversation_history || [];
    try {
      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collection = nosql.collection(process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations');
      const doc = await collection.getDocument(convId);
      if (doc && doc.messages) {
        conversationHistory = doc.messages;
      }
    } catch (e) {
      // No existing conversation — start fresh
    }

    const maxHistory = parseInt(process.env.MAX_CONVERSATION_HISTORY || '10');
    if (conversationHistory.length > maxHistory) {
      conversationHistory = conversationHistory.slice(-maxHistory);
    }

    // ── STEP 3: Fetch FIR context from Data Store ──
    let contextData = null;
    try {
      const adminApp = catalyst.initialize(req, { scope: 'admin' });
      const zcql = adminApp.zcql();
      const keyword = query.replace(/['"]/g, '').split(' ').slice(0, 3).join(' ');
      const result = await zcql.executeQuery(
        `SELECT FIR_Number, District, Crime_Type, Date_of_Occurrence, Status FROM FIRs WHERE District LIKE '%${keyword}%' LIMIT 30`
      );
      if (result && result.length > 0) {
        contextData = result;
      }
    } catch (e) {
      // Continue without context
    }

    // ── STEP 4: Build Gemini model ──
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: getSystemPrompt(contextData)
    });

    // ── STEP 5: Send message ──
    const chat = model.startChat({
      history: conversationHistory.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    });

    const geminiResult = await chat.sendMessage(query);
    const rawText = geminiResult.response.text();

    // ── STEP 6: Parse JSON response ──
    let parsedResponse;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsedResponse = JSON.parse(cleaned);
    } catch (e) {
      parsedResponse = {
        response_text: rawText,
        visualization: { type: 'none', title: '', data: {} },
        follow_up_suggestions: [],
        needs_data: null,
        confidence: 0.5,
        language_detected: lang
      };
    }

    // ── STEP 7: Resolve needs_data ──
    if (parsedResponse.needs_data && parsedResponse.needs_data.type) {
      try {
        const params = parsedResponse.needs_data.params || {};
        let apiUrl = null;

        switch (parsedResponse.needs_data.type) {
          case 'hotspots':         apiUrl = 'http://localhost:3000/server/hotspots'; break;
          case 'trends':           apiUrl = 'http://localhost:3000/server/trends'; break;
          case 'repeat_offenders': apiUrl = 'http://localhost:3000/server/repeat-offenders'; break;
          case 'firs':             apiUrl = 'http://localhost:3000/server/firs'; break;
          case 'cameras':          apiUrl = 'http://localhost:3000/server/cameras-nearby'; break;
          case 'trail':            apiUrl = 'http://localhost:3000/server/trail'; break;
        }

        if (apiUrl) {
          const apiResponse = await axios.get(apiUrl, { params, timeout: 10000 });
          parsedResponse.visualization.data = apiResponse.data;
          parsedResponse.needs_data = null;
        }
      } catch (e) {
        parsedResponse.needs_data = null;
      }
    }

    // ── STEP 8: Save to NoSQL ──
    try {
      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collection = nosql.collection(process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations');

      conversationHistory.push({ role: 'user', content: query, timestamp: new Date().toISOString() });
      conversationHistory.push({ role: 'assistant', content: parsedResponse.response_text, timestamp: new Date().toISOString() });

      await collection.upsertDocument({
        document_id: convId,
        messages: conversationHistory,
        last_updated: new Date().toISOString()
      });
    } catch (e) {
      // NoSQL save failed — not fatal
    }

    // ── STEP 9: Return response ──
    return send(200, { ...parsedResponse, conversation_id: convId });

  } catch (err) {
    console.error('DRISHTI chat error:', err);
    return send(500, { error: true, message: 'AI service unavailable' });
  }
};