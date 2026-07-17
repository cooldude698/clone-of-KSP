// --- START FETCH & HEADERS POLYFILL ---
if (!global.Headers) {
  global.Headers = class Headers {
    constructor(init = {}) {
      this.map = {};
      if (init) {
        if (init instanceof Headers) {
          this.map = { ...init.map };
        } else if (Array.isArray(init)) {
          for (const [key, value] of init) {
            this.set(key, value);
          }
        } else {
          for (const [key, value] of Object.entries(init)) {
            this.set(key, value);
          }
        }
      }
    }
    set(name, value) { this.map[name.toLowerCase()] = String(value); }
    append(name, value) {
      const key = name.toLowerCase();
      this.map[key] = this.map[key] ? `${this.map[key]}, ${value}` : String(value);
    }
    get(name) { return this.map[name.toLowerCase()] || null; }
    has(name) { return name.toLowerCase() in this.map; }
    forEach(callback, thisArg) {
      for (const [key, value] of Object.entries(this.map)) {
        callback.call(thisArg, value, key, this);
      }
    }
  };
}

if (!global.fetch) {
  const axios = require('axios');
  global.fetch = async (url, options = {}) => {
    try {
      const headers = {};
      if (options.headers) {
        if (options.headers instanceof global.Headers) {
          options.headers.forEach((value, key) => { headers[key] = value; });
        } else if (Array.isArray(options.headers)) {
          for (const [key, value] of options.headers) headers[key] = value;
        } else {
          for (const [key, value] of Object.entries(options.headers)) headers[key] = value;
        }
      }
      const response = await axios({
        url,
        method: options.method || 'GET',
        data: options.body,
        headers,
        responseType: 'text'
      });
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        statusText: response.statusText,
        text: async () => response.data,
        json: async () => typeof response.data === 'string' ? JSON.parse(response.data) : response.data
      };
    } catch (error) {
      if (error.response) {
        return {
          ok: false,
          status: error.response.status,
          statusText: error.response.statusText,
          text: async () => typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data),
          json: async () => typeof error.response.data === 'string' ? JSON.parse(error.response.data) : error.response.data
        };
      }
      throw error;
    }
  };
}
// --- END POLYFILL ---

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');

// Fallback logic for keys without pinging overhead
async function getWorkingKey(generateAction) {
  const keys = [];
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key && key !== 'PASTE_KEY_HERE') keys.push(key);
  }

  let lastError = null;
  for (const key of keys) {
    try {
      return await generateAction(key);
    } catch (err) {
      const status = err.status || (err.response && err.response.status) || 500;
      const msg = (err.message || '').toLowerCase();
      if (status === 429 || status === 403 || msg.includes('429') || msg.includes('403') || msg.includes('quota') || msg.includes('exhausted')) {
        console.warn(`Key starting with ${key.substring(0, 15)} hit rate limit. Trying next...`);
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError || new Error("All API keys failed or no keys found.");
}

module.exports = async (req, res) => {
  const send = (statusCode, data) => {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify(data));
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

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
    const { query, language, conversation_id, conversation_history } = body;
    if (!query) {
      return send(400, { error: true, message: 'query is required' });
    }

    const convId = conversation_id || `conv_${Date.now()}`;
    const lang = language || 'en';

    let conversationHistory = conversation_history || [];
    try {
      const catalystApp = catalyst.initialize(req);
      const nosql = catalystApp.nosql();
      const collection = nosql.collection(process.env.NOSQL_CONVERSATIONS_COLLECTION || 'conversations');
      const doc = await collection.getDocument(convId);
      if (doc && doc.messages) {
        conversationHistory = doc.messages;
      }
    } catch (e) {}

    const maxHistory = parseInt(process.env.MAX_CONVERSATION_HISTORY || '10');
    if (conversationHistory.length > maxHistory) {
      conversationHistory = conversationHistory.slice(-maxHistory);
    }

    const systemPrompt = `You are DRISHTI, a voice-driven police intelligence assistant for Karnataka State Police.
Always respond in Kannada if the user's query is in Kannada. Otherwise, respond in English.
Your response MUST be a valid JSON object with exactly this structure:
{
  "response_text": "Your answer to the user",
  "visualization": {
    "type": "none",
    "title": "",
    "data": {}
  },
  "follow_up_suggestions": ["Suggestion 1", "Suggestion 2"],
  "confidence": 0.95,
  "language_detected": "en"
}
Auto-select visualization type based on query: heatmap, bar_chart, line_chart, map_pins, network_graph, or none.
Do not wrap in \`\`\`json. Only output the raw JSON object.`;

    const rawText = await getWorkingKey(async (apiKey) => {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-flash-latest',
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({
        history: conversationHistory.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      });

      const result = await chat.sendMessage(query);
      return result.response.text();
    });

    let parsedResponse;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsedResponse = JSON.parse(cleaned);
    } catch (e) {
      parsedResponse = {
        response_text: rawText,
        visualization: { type: 'none', title: '', data: {} },
        follow_up_suggestions: [],
        confidence: 0.5,
        language_detected: lang
      };
    }
    
    parsedResponse.conversation_id = convId;

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
    } catch (e) {}

    return send(200, parsedResponse);

  } catch (err) {
    console.error('DRISHTI chat error:', err);
    return send(500, { error: true, message: 'AI service unavailable' });
  }
};