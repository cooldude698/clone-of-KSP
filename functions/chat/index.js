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
const { fetchData } = require('./data-fetcher');
const { searchPoliceManuals } = require('./rag-service');

// Fallback logic for keys without pinging overhead
async function getWorkingKey(generateAction) {
  const keys = [];
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'PASTE_KEY_HERE') {
    keys.push(process.env.GEMINI_API_KEY);
  }
  for (let i = 1; i <= 10; i++) {
    const key = process.env[`GEMINI_API_KEY_${i}`];
    if (key && key !== 'PASTE_KEY_HERE' && !keys.includes(key)) keys.push(key);
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

  let body = req.body;
  if (!body || Object.keys(body).length === 0) {
    try {
      const raw = await new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => resolve(data));
        req.on('error', reject);
      });
      body = JSON.parse(raw || '{}');
    } catch (e) {
      return send(400, { error: true, message: 'Invalid JSON body' });
    }
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

    const { getSystemPrompt } = require('./system-prompt');
    const systemPrompt = getSystemPrompt(null);

    const rawText = await getWorkingKey(async (apiKey) => {
      const genAI = new GoogleGenerativeAI(apiKey);

      const tools = [{
        functionDeclarations: [
          {
            name: "fetch_hotspots",
            description: "Fetch crime hotspots coordinates and details for generating heatmaps or map pins.",
            parameters: {
              type: "OBJECT",
              properties: {
                district: { type: "STRING", description: "Optional district name filter (e.g. 'South Bengaluru')" },
                crime_type: { type: "STRING", description: "Optional crime type code (e.g. 'vehicle_theft', 'robbery')" },
                months_back: { type: "INTEGER", description: "Optional number of months to look back" }
              }
            }
          },
          {
            name: "fetch_trends",
            description: "Fetch crime trends and incident counts over time for bar or line charts.",
            parameters: {
              type: "OBJECT",
              properties: {
                crime_type: { type: "STRING", description: "Optional crime type code" },
                district: { type: "STRING", description: "Optional district name filter" },
                groupby: { type: "STRING", description: "Optional field to group by (e.g. 'month', 'year')" },
                year: { type: "INTEGER", description: "Optional year to filter" }
              }
            }
          },
          {
            name: "fetch_repeat_offenders",
            description: "Fetch list of repeat criminal offenders.",
            parameters: {
              type: "OBJECT",
              properties: {
                min_firs: { type: "INTEGER", description: "Optional minimum number of FIRs registered against the offender" },
                limit: { type: "INTEGER", description: "Optional maximum number of offenders to return" }
              }
            }
          },
          {
            name: "fetch_firs",
            description: "Fetch details of First Information Reports (FIRs).",
            parameters: {
              type: "OBJECT",
              properties: {
                district: { type: "STRING", description: "Optional district name filter" },
                crime_type: { type: "STRING", description: "Optional crime type code" },
                date_from: { type: "STRING", description: "Optional starting date (YYYY-MM-DD)" },
                date_to: { type: "STRING", description: "Optional ending date (YYYY-MM-DD)" }
              }
            }
          },
          {
            name: "fetch_cameras_nearby",
            description: "Fetch a list of nearby surveillance cameras around a specific latitude and longitude.",
            parameters: {
              type: "OBJECT",
              properties: {
                lat: { type: "NUMBER", description: "Latitude of the center point" },
                lng: { type: "NUMBER", description: "Longitude of the center point" },
                radius_meters: { type: "INTEGER", description: "Optional search radius in meters" },
                timestamp: { type: "STRING", description: "Optional ISO timestamp" }
              },
              required: ["lat", "lng"]
            }
          },
          {
            name: "fetch_trail",
            description: "Fetch suspect movement trail (hops) based on vehicle sightings.",
            parameters: {
              type: "OBJECT",
              properties: {
                crime_lat: { type: "NUMBER", description: "Latitude of the crime location" },
                crime_lng: { type: "NUMBER", description: "Longitude of the crime location" },
                crime_timestamp: { type: "STRING", description: "ISO timestamp of the crime" },
                vehicle_type: { type: "STRING", description: "Type of vehicle (e.g. 'two_wheeler', 'car')" }
              },
              required: ["crime_lat", "crime_lng", "crime_timestamp", "vehicle_type"]
            }
          },
          {
            name: "fetch_anpr_check",
            description: "Fetch Automatic Number Plate Recognition (ANPR) status/history for a vehicle plate and camera location.",
            parameters: {
              type: "OBJECT",
              properties: {
                plate_number: { type: "STRING", description: "License plate number of the vehicle" },
                camera_id: { type: "STRING", description: "ID of the surveillance camera" },
                camera_name: { type: "STRING", description: "Name of the camera location" },
                lat: { type: "NUMBER", description: "Latitude of the camera" },
                lng: { type: "NUMBER", description: "Longitude of the camera" },
                timestamp: { type: "STRING", description: "ISO timestamp of the sighting" }
              },
              required: ["plate_number", "camera_id", "camera_name", "lat", "lng", "timestamp"]
            }
          },
          {
            name: "fetch_network_graph",
            description: "Fetch criminal network connections graph data.",
            parameters: {
              type: "OBJECT",
              properties: {
                min_connections: { type: "INTEGER", description: "Optional minimum connection count filter" },
                months_back: { type: "INTEGER", description: "Optional months back to analyze connections" }
              }
            }
          },
          {
            name: "search_police_manuals",
            description: "Search in-memory police manuals and SOPs for standard procedures and IPC/BNS references.",
            parameters: {
              type: "OBJECT",
              properties: {
                query: { type: "STRING", description: "Procedural query or legal keyword (e.g., 'vehicle theft SOP', 'IPC 379')" }
              },
              required: ["query"]
            }
          }
        ]
      }];

      let modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      let model;
      try {
        model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemPrompt,
          tools
        });
      } catch (mErr) {
        model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: systemPrompt,
          tools
        });
      }

      const chat = model.startChat({
        history: conversationHistory.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }))
      });

      let response = await chat.sendMessage(query);

      let iterations = 0;
      while (iterations < 5) {
        const calls = response.response.functionCalls();
        if (!calls || calls.length === 0) {
          break;
        }

        iterations++;
        const toolResponses = [];

        for (const call of calls) {
          const { name, args } = call;
          let resultData;
          try {
            if (name === 'search_police_manuals') {
              resultData = searchPoliceManuals(args.query);
            } else {
              resultData = await fetchData(name, args);
            }
          } catch (toolErr) {
            console.error(`Error executing tool ${name}:`, toolErr);
            resultData = { error: true, message: toolErr.message || String(toolErr) };
          }

          toolResponses.push({
            functionResponse: {
              name: name,
              response: { result: resultData }
            }
          });
        }

        response = await chat.sendMessage(toolResponses);
      }

      return response.response.text();
    });

    let parsedResponse;
    try {
      const cleaned = rawText.replace(/```json|```/g, '').trim();
      parsedResponse = JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse Gemini response as JSON. Falling back to plain text formatting. Raw response:', rawText);
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