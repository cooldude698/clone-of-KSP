# DRISHTI — ದೃಷ್ಟಿ

## Person 2: AI Engine Commander — Complete Step-by-Step Guide

**KSP × Hack2Skill Datathon 2026**
**Swapnil Gosh**

---

> **Your role in one sentence:**  
> You are the brain. Everything the investigator types or speaks goes through you. You decide what the answer is, what chart to show, what data to fetch, and how to say it in Kannada or English.

---

## READ THIS FIRST — Your Dependency Map

Before you write a single line of code, understand who gives you what and when.

### What You Need From Others (in order)

````text
FROM PERSON 1 (Vritika) — needed on Day 1 of your work:
  ✅ The .env file with all credentials (Gemini API key, Catalyst DB, Zia API key)
  ✅ GitHub repo access (your branch is: ai-engine)
  ✅ Catalyst project access (login credentials)
  ✅ Confirmation that Catalyst QuickML, Zia Services, NoSQL, SmartBrowz are enabled
  ✅ Confirmation that database tables exist and data is loaded
  ✅ The QuickML knowledge base URL (containing NCRB documents)

FROM PERSON 3 (Aman) — needed in Week 3:
  ✅ The URL/endpoint for: /api/analytics/hotspots
  ✅ The URL/endpoint for: /api/analytics/underreporting
  ✅ The URL/endpoint for: /api/analytics/victim-vulnerability
  ✅ The URL/endpoint for: /api/analytics/repeat-offenders
  ✅ The URL/endpoint for: /api/analytics/trends
  ✅ The exact JSON response format each endpoint returns
  → Ask Person 3 to share a Postman collection or just the JSON examples

FROM PERSON 4 (Vedesh) — needed in Week 4:
  ✅ The URL/endpoint for: /api/cameras/nearby
  ✅ The URL/endpoint for: /api/trail
  ✅ The URL/endpoint for: /api/anpr/check
  ✅ The exact JSON response format each endpoint returns
  → Ask Person 4 to share JSON examples of what each API returns
```text
### What You Give to Others (in order)

```text
TO PERSON 5 (Aryan) — needed when she starts chat UI (Week 2):
  📤 Your chat API endpoint URL (she calls this from the frontend)
  📤 The exact JSON request format she should send
  📤 The exact JSON response format she will receive
  📤 The VoiceInput component (React) — she embeds this in the chat UI
  📤 The PDF export button handler (she adds this to the Download button)
  → Share these as a simple text document in WhatsApp or a file in GitHub

TO PERSON 1 (Vritika) — for integration in Week 5:
  📤 Final deployed URL of your chat Catalyst Serverless Function
  📤 Any environment variables that were added after initial setup
```text
### The API Contract You Must Define on Day 1

Before coding anything, write down this contract. Save it in your GitHub as `ai-engine/API_CONTRACT.md`. Person 5 needs this immediately.

**Request format (what frontend sends to your API):**

```json
{
  "query": "How many vehicle thefts happened in Koramangala last month?",
  "language": "en",
  "conversation_id": "conv_abc123",
  "conversation_history": [
    { "role": "user", "content": "Previous question..." },
    { "role": "assistant", "content": "Previous answer..." }
  ]
}
```text
language values: `"en"` for English, `"hi"` for Hindi, `"kn"` for Kannada

**Response format (what your API sends back):**
This must strictly match SCHEMA.md!

```json
{
  "response_text": "There were 47 vehicle thefts in Koramangala in May 2026...",
  "language_detected": "en",
  "emotion": "alert",
  "urgency": "medium",
  "visualization": {
    "type": "bar_chart",
    "title": "Vehicle Thefts in Koramangala — May 2026",
    "data": {
      "labels": ["Week 1", "Week 2", "Week 3", "Week 4"],
      "values": [12, 8, 15, 12]
    }
  },
  "follow_up_suggestions": [
    "Which areas in Koramangala had the most thefts?",
    "Show me the accused profile for these cases"
  ],
  "needs_followup": false,
  "clarification_question": "",
  "needs_data": null,
  "confidence": 0.94,
  "data_sources": ["Catalyst Data Store — FIRs table"],
  "conversation_id": "conv_abc123"
}
```text
**Emotion and Urgency Mappings:**
- `emotion`: "neutral" (blue orb), "informative" (cyan), "alert" (amber), "urgent" (orange), "reassuring" (green).
- `urgency`: "low" (normal voice, green border), "medium" (slightly faster, amber border), "high" (elevated pace, orange border), "critical" (fast urgent voice, red border).

**Visualization types and when to use each:**

```text
"heatmap"       → when query asks about hotspots, density, where crimes cluster
"map_pins"      → when query asks about specific locations, addresses, crime spots
"bar_chart"     → when query compares categories or shows counts by group
"line_chart"    → when query asks about trends over time
"network_graph" → when query asks about connections between people/cases
"timeline"      → when query asks about a sequence of events in one case
"geo_trail"     → when query asks to trace a suspect or show movement
"none"          → when query is a simple factual question with no visual needed
```text
Save this file to GitHub now. Person 5 cannot start without it.

---

## YOUR COMPLETE TASK LIST (Overview)

```text
Day 1-2  → Setup: install tools, clone repo, run .env check
Day 3    → Feature 1: Core chat API (text only, no voice yet)
Day 4    → Feature 2: Visualization engine (AI picks the chart type)
Day 5    → Feature 3: Conversation memory (NoSQL history storage)
Week 2   → Feature 4: Voice input/output (Kannada + English)
Week 3   → Feature 5: Integrate Person 3's data APIs into chat responses
Week 4   → Feature 6: Integrate Person 4's camera APIs into chat responses
Week 4   → Feature 7: PDF export (SmartBrowz)
Week 5   → Integration testing with frontend (Person 5)
```text
---

## CRITICAL: No Hardcoding Rules for Your Module

These values must NEVER appear literally inside any `.js` file:

| What it is         | Wrong (hardcoded)                  | Correct (from .env)                      |
| ------------------ | ---------------------------------- | ---------------------------------------- |
| Gemini API key     | `"AIza..."`                        | `process.env.GEMINI_API_KEY`             |
| AI model name      | `"gemini-2.5-flash"`               | `process.env.GEMINI_MODEL`               |
| Max tokens         | `1024`                             | `parseInt(process.env.MAX_TOKENS)`       |
| Temperature        | `0.3`                              | `parseFloat(process.env.AI_TEMPERATURE)` |
| Person 3's API URL | `"http://localhost:3001/hotspots"` | `process.env.ANALYTICS_API_URL`          |
| Person 4's API URL | `"http://localhost:3002/cameras"`  | `process.env.CAMERA_API_URL`             |

Add these to your `.env` file (and to .env.example without values):

```text
GEMINI_API_KEY_1=your_gemini_api_key_1
GEMINI_API_KEY_2=your_gemini_api_key_2
GROQ_API_KEY=your_groq_api_key (Fallback)
GEMINI_MODEL=gemini-2.5-flash
MAX_TOKENS=2000
AI_TEMPERATURE=0.3
ANALYTICS_API_URL=http://localhost:3000/api/analytics
CAMERA_API_URL=http://localhost:3000/api/cameras
NOSQL_CONVERSATIONS_COLLECTION=conversations
MAX_CONVERSATION_HISTORY=15
```text
---

## DAY 1-2 — Setup Your Environment

### Step 1: Install Required Tools

**Check if Node.js is installed:**

```bash
node --version
```text
If you see `v18.x.x` or higher — good. If not:
Download from: **<https://nodejs.org**> → Download the LTS version → Install

**Check if npm is installed:**

```bash
npm --version
```text
Should show `9.x.x` or higher. npm comes with Node.js automatically.

**Install Catalyst CLI:**

```bash
npm install -g @zohocloud/catalystcli
```text
If this gives a permission error on Mac:

```bash
sudo npm install -g @zohocloud/catalystcli
```text
Verify install:

```bash
catalyst --version
```text
### Step 2: Clone the Repository and Set Up Your Branch

```bash
# Clone the repository (get the URL from Vedesh or from GitHub)
git clone <https://github.com/VEDESH_USERNAME/drishti-ksp.git>
cd drishti-ksp

# Switch to your branch
git checkout ai-engine

# Verify you are on the right branch
git branch
# Should show: * ai-engine
```text
### Step 3: Create Your Module Folder

```bash
cd ai-engine
npm init -y
npm install @google/generative-ai axios zcatalyst-sdk-node dotenv
```text
Create your `.env` file (paste the content below, fill in values from Vedesh):

```bash
touch .env
```text
Open `.env` in any text editor and paste:

```text
GEMINI_API_KEY=PASTE_FROM_VEDESH
GEMINI_MODEL=gemini-2.5-flash
MAX_TOKENS=2000
AI_TEMPERATURE=0.3
CATALYST_PROJECT_ID=PASTE_FROM_VEDESH
CATALYST_ACCOUNT_ID=PASTE_FROM_VEDESH
CATALYST_DB_HOST=PASTE_FROM_VEDESH
CATALYST_DB_PORT=3306
CATALYST_DB_NAME=DRISHTI_KSP
CATALYST_DB_USER=PASTE_FROM_VEDESH
CATALYST_DB_PASSWORD=PASTE_FROM_VEDESH
CATALYST_ZIA_API_KEY=PASTE_FROM_VEDESH
NOSQL_CONVERSATIONS_COLLECTION=conversations
MAX_CONVERSATION_HISTORY=15
ANALYTICS_API_URL=http://localhost:3000/api/analytics
CAMERA_API_URL=http://localhost:3000/api/cameras
```text
### Step 4: Verify Your Access to Catalyst Services

Run this test to confirm your credentials work:

Create file `ai-engine/test-connection.js`:

```bash
# Paste this prompt into Claude and copy the output as test-connection.js:
```text
Prompt:

```text
Write a Node.js script called test-connection.js that:
1. Loads environment variables from .env using dotenv
2. Tests Gemini API connection: sends a simple "Say hello in one word" message
  to gemini-2.5-flash, prints the response
3. Tests Catalyst NoSQL: initializes zcatalyst-sdk-node, reads from the
   'conversations' collection (expects empty, that is fine), prints success or error
4. Tests Catalyst Data Store: queries SELECT COUNT(*) FROM FIRs, prints the count
5. For each test: prints ✅ PASS or ❌ FAIL with the error message

Use async/await. Import dotenv at the top.
Show clear console output like: "Testing Gemini API... ✅ PASS — Response: Hi"
```text
Run it:

```bash
node test-connection.js
```text
All three should show ✅. If any fail, message Vedesh — it is a credentials issue, not your code.

---

## DAY 3 — Feature 1: Core Chat API (The Brain)

This is the most important thing you build. Everything else builds on top of this.

### Step 1: Create the System Prompt Config File

**This is NOT hardcoded in the function. It lives in a separate config file.**

Create file: `ai-engine/config/system-prompt.js`

Paste this prompt into Claude, copy the output as that file:

```text
Write a Node.js module that exports a function called getSystemPrompt().

The function takes no arguments and returns a string — the DRISHTI system prompt.

The system prompt should say:
You are DRISHTI (ದೃಷ್ಟಿ), the AI crime intelligence co-pilot for Karnataka State
Police. You assist investigators, analysts, supervisors, and policymakers in
querying and understanding crime data.

Your capabilities:
- Answering questions about crime patterns, trends, FIRs, accused persons,
  victims, and locations across Karnataka
- Analyzing data from the Karnataka State Police database
- Understanding context from NCRB (National Crime Records Bureau) reports
- Providing insights grounded in criminology and sociology

Rules you must ALWAYS follow:
1. Respond in the SAME language the user used. English query = English response.
   Kannada query = Kannada response.
2. You MUST return ONLY valid JSON — no preamble, no markdown, no explanation
   outside the JSON. Your entire response must be parseable as JSON.
3. Always use this EXACT JSON schema:
   {
     "response_text": "your answer here",
     "visualization": {
       "type": "one of: heatmap, map_pins, bar_chart, line_chart, network_graph, timeline, geo_trail, none",
       "title": "descriptive title for the chart or map",
       "data": {}
     },
     "follow_up_suggestions": ["question 1?", "question 2?", "question 3?"],
     "needs_data": {
       "type": "one of: hotspots, cameras, firs, trail, repeat_offenders, trends, null",
       "params": {}
     },
     "confidence": 0.0 to 1.0,
     "data_sources": ["sources you used"],
     "language_detected": "en or kn"
   }
4. Choose visualization type intelligently:
   - "heatmap": where crimes cluster geographically, density maps
   - "map_pins": specific incident locations, camera locations
   - "bar_chart": comparing categories, crime type counts, district comparisons
   - "line_chart": trends over time, month-by-month changes
   - "network_graph": connections between accused, criminal networks
   - "timeline": sequence of events in a specific case
   - "geo_trail": suspect movement across camera locations
   - "none": simple factual answers with no visual needed
5. If you need external data (camera locations, real-time hotspots) set
   needs_data.type to the appropriate value. Otherwise set needs_data to null.
6. Never hallucinate crime data. If you do not have data, say so clearly in
   response_text and set visualization.type to "none".
7. Keep response_text concise and professional — you are a law enforcement tool.
8. Always suggest 2-3 relevant follow-up questions in follow_up_suggestions.

The function should also accept an optional contextData parameter (JSON object)
that gets appended to the system prompt as:
"CURRENT DATA CONTEXT: [JSON.stringify(contextData)]"
This is how real data from the database gets injected into your reasoning.

Export: module.exports = { getSystemPrompt };
```text
### Step 2: Build the Core Chat Function

Create file: `ai-engine/functions/chat/index.js`

Paste this prompt into Claude, copy the complete output:

```text
Build a complete Node.js Catalyst Advanced I/O Serverless Function for the DRISHTI
chat API. This is the core AI engine.

File: functions/chat/index.js

It handles POST requests to /api/chat.

IMPORTS NEEDED:
- require('dotenv').config()
- Gemini SDK: const { GoogleGenerativeAI } = require('@google/generative-ai')
- Catalyst SDK: const catalyst = require('zcatalyst-sdk-node')
- axios for calling other APIs
- The system prompt config: const { getSystemPrompt } = require('../../config/system-prompt')

REQUEST BODY:
{
  query: string,
  language: 'en' | 'kn',
  conversation_id: string,
  conversation_history: [{role, content}]  // can be empty array
}

STEP 1 — Initialize:
- Initialize Gemini client using process.env.GEMINI_API_KEY
- Initialize Catalyst app using catalyst.initialize(req)
- Get Catalyst NoSQL using app.nosql()

STEP 2 — Load conversation history from NoSQL:
- Try to read document conversation_id from collection process.env.NOSQL_CONVERSATIONS_COLLECTION
- If document exists: use its messages array as the conversation history
- If document doesn't exist OR if conversation_history in request body is provided and
  longer: use the one from request body
- Trim to last MAX_CONVERSATION_HISTORY (from env) messages to prevent context overflow

STEP 3 — Query the crime database for relevant context:
- Build a ZCQL query on the FIRs table:
  - If query mentions a district name, filter by district_name
  - If query mentions a crime type keyword (theft, snatching, burglary, etc.), filter by crime_type_code
  - If query mentions a time period (last month, 2024, this year), filter by date_filed
  - Limit to 50 most recent matching FIRs
- Format these FIRs as a compact JSON summary (just key fields: case_number, crime_type_code, district_name, date_filed, status, location_name)
- This becomes the contextData for the system prompt

STEP 4 — Prepare messages for Gemini:
- Build messages array:
  [
    ...conversation_history (last 10 messages),
    { role: 'user', content: query }
  ]
- System prompt = getSystemPrompt(contextData from Step 3)

STEP 5 — Call AI (Gemini + Groq Fallback):
- Implement an API Key Rotation strategy looping through GEMINI_API_KEY_1 to GEMINI_API_KEY_15.
- If a Gemini key hits a rate limit, automatically rotate to the next key.
- IF ALL Gemini keys fail, fallback to Groq (Llama 3.3 70B) for text-only inference.
const { GoogleGenerativeAI } = require('@google/generative-ai');
// Pseudocode for API calling loop:
let result = null;
for(let key of geminiKeys) {
   try {
     const genAI = new GoogleGenerativeAI(key);
     // ... generate content
     result = ...;
     break; // Success
   } catch(e) { continue; /* try next key */ }
}
if (!result) {
   // Fallback to Groq API
}

STEP 6 — Parse the response:
- Extract text from result.response.text()
- Try to parse as JSON (the AI should return valid JSON)
- If JSON parse fails: wrap the text in a default response object with type "none"

STEP 7 — If needs_data is set in response:
- If needs_data.type === 'hotspots':
  call process.env.ANALYTICS_API_URL + '/hotspots' with needs_data.params using axios
  inject the result into visualization.data
- If needs_data.type === 'cameras':
  call process.env.CAMERA_API_URL + '/nearby' with needs_data.params using axios
  inject result into visualization.data
- If needs_data.type === 'trail':
  call process.env.CAMERA_API_URL + '/trail' with needs_data.params using axios
  inject result into visualization.data
- Set needs_data to null after resolving

STEP 8 — Save conversation to NoSQL:
- Append user message and assistant response to messages array
- Upsert document with document_id = conversation_id in NoSQL collection
- Include: { conversation_id, user_role: req.body.user_role || 'inspector',
  messages: [...], last_updated: new Date().toISOString() }

STEP 9 — Return response:
Return HTTP 200 with the parsed JSON object plus conversation_id added to it.

ERROR HANDLING:
- If Gemini API fails: return 500 with { error: true, message: "AI service unavailable" }
- If DB query fails: still proceed — just use empty contextData
- If NoSQL save fails: still return the response — don't fail the request

Add CORS headers:
res.set('Access-Control-Allow-Origin', '*');
res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
res.set('Content-Type', 'application/json');

Export as: module.exports = async (req, res) => { ... }
```text
### Step 3: Test the Chat API in Isolation

First test it without the Catalyst function runner — just run it as a plain Node.js script.

Create `ai-engine/test-chat.js`:

```text
Write a Node.js test script for the chat API. It should:
1. Load .env using dotenv
2. Create a mock req object: { body: { query: "How many thefts happened in Bengaluru
   last month?", language: "en", conversation_id: "test_001", conversation_history: [] } }
3. Create a mock res object with a set() method (does nothing) and a status().json()
   chain (prints the response and exits)
4. Require the chat function from './functions/chat/index.js'
5. Call the function with the mock req and res
6. Print the full response
```text
Run it:

```bash
cd ai-engine
node test-chat.js
```text
Expected output: A JSON object with `response_text`, `visualization`, `follow_up_suggestions`. If you see this — Feature 1 is done.

**If you get an error:** Copy the FULL error message and paste into Claude:
`"My DRISHTI chat function is giving this error: [paste error]. The relevant code is [paste function]. Fix it."`

---

## DAY 4 — Feature 2: Visualization Engine (The Magic)

The viz engine is NOT a separate service. It is BUILT INTO your system prompt and JSON parsing logic. The AI decides what visualization type to use based on the query. Your job is to make sure:

1. The system prompt clearly instructs the AI on when to use each visualization type ✅ (done in Day 3)
2. The data format for each visualization type is standardized so Person 5 can render it
3. When the AI returns `needs_data`, you fetch real data and inject it correctly

### Step 1: Define Standardized Data Formats for Each Visualization

Create file: `ai-engine/config/viz-schemas.js`

Paste this into Claude and copy the output:

```text
Write a Node.js module viz-schemas.js that exports an object VIZ_SCHEMAS with
the expected data format for each visualization type.

Include these types with their exact data shape:

heatmap: {
  points: [{ lat: number, lng: number, intensity: number (1-10), crime_type: string }]
}

map_pins: {
  locations: [{ lat: number, lng: number, label: string, type: string,
    color: string (red/blue/orange/green), description: string }]
}

bar_chart: {
  labels: string[],
  values: number[],
  colors: string[] (optional),
  x_label: string,
  y_label: string
}

line_chart: {
  labels: string[],
  datasets: [{ label: string, values: number[], color: string }]
}

network_graph: {
  nodes: [{ id: string, label: string, type: string (accused/victim/location/case),
    size: number, color: string, risk_score: number }],
  edges: [{ source: string, target: string, label: string, color: string }]
}

timeline: {
  events: [{ date: string, title: string, description: string,
    type: string (fir/arrest/chargsheet/court/other), icon: string }]
}

geo_trail: {
  trail: [{ lat: number, lng: number, timestamp: string, camera_name: string,
    camera_type: string, confidence: number, plate_detected: string }],
  last_known: { lat: number, lng: number, district: string },
  trail_status: string
}

For each schema, include a comment explaining when AI should use this type.
Export as: module.exports = { VIZ_SCHEMAS };
```text
### Step 2: Add a Data Validator and Filler

Create file: `ai-engine/utils/viz-validator.js`

Paste this into Claude:

```text
Write a Node.js utility function called validateAndFillVizData(vizObject, dbData).

vizObject is what Gemini returned: { type, title, data }
dbData is real data from the database (can be null)

The function should:
1. Check if vizObject.type is valid (one of the known types)
2. If dbData is provided and non-empty:
   - For heatmap type: if dbData has hotspots array, transform it to the points format
   - For map_pins type: if dbData has locations or cameras array, transform to locations format
   - For geo_trail type: if dbData has trail array, use it directly
   - For bar_chart/line_chart: use AI's data as-is (AI generates this from context)
   - For network_graph: if dbData has nodes and edges, use them; else use AI's data
3. Return the validated vizObject with data filled from dbData where available
4. Never throw an error — if anything is wrong, return the original vizObject unchanged

Export as: module.exports = { validateAndFillVizData };
```text
Import and use this in your chat function right after parsing the AI response and after fetching `needs_data` results.

---

## DAY 5 — Feature 3: Conversation Memory (NoSQL)

The conversation history is already built into the chat function (you stored it in NoSQL in Day 3). Now add a separate API to manage conversations.

### Step 1: Create Conversation Management APIs

Create file: `ai-engine/functions/conversations/index.js`

Paste this into Claude:

```text
Build a Node.js Catalyst Serverless Function that handles conversation management.

It uses Express routing inside a single Catalyst function.
Use zcatalyst-sdk-node for NoSQL access.
Load .env with dotenv.
Collection name from: process.env.NOSQL_CONVERSATIONS_COLLECTION

Routes:
GET /api/conversations
  - Get all conversations for the current user (filter by user_id if provided in query)
  - Returns: { conversations: [{ conversation_id, last_updated, preview (first 60 chars
    of last message), message_count }] }
  - Sort by last_updated descending

GET /api/conversations/:conversation_id
  - Get full conversation history for a specific conversation_id
  - Returns: { conversation_id, messages: [...], last_updated }

DELETE /api/conversations/:conversation_id
  - Delete a conversation document from NoSQL
  - Returns: { deleted: true, conversation_id }

POST /api/conversations/new
  - Generate a new unique conversation_id (format: conv_ + timestamp + random 4 chars)
  - Return: { conversation_id }
  - Do NOT create the document yet — it gets created on first chat message

For all routes: add CORS headers, handle errors with try/catch, return proper HTTP status codes.
```text
---

## WEEK 2 — Feature 4: Voice Input and Output (Kannada + English)

### Important Note About Voice in This Project

The hackathon requires using Catalyst Zia Services for voice. When you check your Catalyst dashboard:

1. Go to Catalyst Dashboard → Zia Services
2. Look for "Speech" or "Voice" tab
3. If you see Speech-to-Text and Text-to-Speech options there — use those APIs

**If Catalyst Zia does NOT have Speech-to-Text:**
Use the Web Speech API. This is built into all modern browsers (Chrome, Edge, Android). It supports Kannada (`kn-IN`) natively. No API key needed. This is actually faster and works better for a demo. You still use Zia Text Analytics on the transcribed text for language detection and keyword extraction.

**Check if Zia has voice by:**

- Go to: **<https://docs.catalyst.zoho.com/en/zia-services/help/**>
- Look for "Speech" in the left sidebar

### Step 1: Voice Input Component (Frontend — React)

This is a React component that Person 5 will embed in the chat UI. Create it in the frontend folder but share with Person 5.

Create file: `frontend/components/VoiceInput.tsx`

Paste this into Claude:

```text
Build a React TypeScript component called VoiceInput for the DRISHTI chat interface.

Props interface:
{
  onTranscription: (text: string, language: 'en' | 'kn') => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

State:
- isRecording: boolean
- selectedLanguage: 'en' | 'kn' (default 'en')
- isSupported: boolean (check if Web Speech API is available)

The component:

1. On mount: check if window.SpeechRecognition or window.webkitSpeechRecognition exists.
   If not: set isSupported = false, show a disabled mic button with tooltip
   "Voice not supported in this browser. Use Chrome."

2. Language toggle button: shows "EN" or "ಕನ್ನಡ". On click: toggles selectedLanguage.

3. Microphone button & Wake Detection:
   - Must support **Double-Clap Wake Detection** using the Web Audio API (energy spike detection).
   - Must support **Push-to-Talk** (hold spacebar or hold the on-screen mic button).
   - When not recording: shows microphone icon (use lucide-react Mic icon)
   - When recording: shows a pulsing red circle + MicOff icon

4. Recording logic using Web Speech API:
   const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
   recognition.lang = selectedLanguage === 'en' ? 'en-IN' : (selectedLanguage === 'kn' ? 'kn-IN' : 'hi-IN');
   recognition.continuous = false;
   recognition.interimResults = false;
   recognition.onresult = (event) => {
     const transcript = event.results[0][0].transcript;
     onTranscription(transcript, selectedLanguage);
   };
   recognition.onerror = (event) => {
     onError('Voice recognition error: ' + event.error);
     setIsRecording(false);
   };
   recognition.onend = () => setIsRecording(false);

5. Show a small status text below the button:
   - Not recording: "Tap to speak"
   - Recording: "Listening... speak now"
   - After transcription: "Got it! ✓"

6. Styling: Tailwind CSS. The mic button should be a circle, 44px diameter.
   Dark theme compatible (colors use CSS variables or Tailwind dark: variants).

Include: proper cleanup of recognition on component unmount.
Export as default.
```text
### Step 2: Text-to-Speech (AI Reads Response Back)

Create file: `frontend/utils/textToSpeech.ts`

Paste this into Claude:

```text
Write a TypeScript utility module for text-to-speech in the DRISHTI frontend.

Primary approach: Use Catalyst Zia TTS API (call via the backend function).
Fallback: Use browser's speechSynthesis API (Web Speech API).

Export these functions:

async function speakText(text: string, language: 'en' | 'kn'): Promise<void>
  - First: try to call the backend TTS endpoint: POST /api/voice/tts
    with body { text: text.substring(0, 500), language }
    The backend returns an audio blob
    Play it: const audio = new Audio(URL.createObjectURL(blob)); audio.play();
  - If the backend call fails (or endpoint doesn't exist yet):
    Fall back to browser speechSynthesis:
    const utterance = new SpeechSynthesisUtterance(text.substring(0, 300));
    utterance.lang = language === 'en' ? 'en-IN' : 'kn-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  - If speechSynthesis also fails: just do nothing, don't throw an error

function stopSpeaking(): void
  - Cancels any ongoing speech: window.speechSynthesis.cancel()

function isSpeaking(): boolean
  - Returns window.speechSynthesis.speaking

Export all three as named exports.
```text
### Step 3: Backend TTS Catalyst Function (using Zia if available)

Create file: `ai-engine/functions/voice/index.js`

Paste this into Claude:

```text
Build a Node.js Catalyst Serverless Function for text-to-speech.

POST /api/voice/tts
Body: { text: string, language: 'en' | 'kn' }

APPROACH 1 (try first): Check if Catalyst Zia Services has TTS.
Initialize Catalyst: const app = catalyst.initialize(req);
Try: const zia = app.zia();
Attempt to call Zia's speech synthesis if the method exists.

If Zia TTS method exists and works: use it to synthesize speech, return audio data.

APPROACH 2 (fallback if Zia TTS unavailable):
Call the Zia Text Analytics API instead to at least process the text,
then return a 404 so the frontend knows to fall back to browser TTS.
Return: res.status(404).json({ message: "TTS not available, use browser fallback" })

The frontend handles the 404 gracefully by switching to browser speechSynthesis.

POST /api/voice/stt
Body: FormData with audio file + language field

Try Catalyst Zia's speech recognition if available.
If not available: return 404 so frontend uses Web Speech API directly.

Add CORS headers.
Note in code comments:
"If Zia adds STT/TTS support after this was written, replace the fallback with:
const zia = app.zia(); const result = await zia.speechToText(audioBuffer, language);"
```text
---

## WEEK 3 — Feature 5: Integrate Person 3's Analytics APIs

By Week 3, Person 3 should have their APIs running. You now need to make your chat function call their data when needed.

### Step 1: Get Person 3's API Format

Before coding, message Person 3 and ask:

> "Can you share the exact JSON response your hotspot API returns? Just copy-paste an example from Postman. I need this to integrate it into the chat function."

### Step 2: Add Analytics Data Fetcher

Create file: `ai-engine/utils/data-fetcher.js`

Paste this into Claude with the ACTUAL response formats from Person 3 included:

```text
Build a Node.js utility module data-fetcher.js for DRISHTI.

All base URLs come from environment variables.

Export these async functions:

async function fetchHotspots(params)
  - GET request to process.env.ANALYTICS_API_URL + '/hotspots'
  - params can include: district, crime_type, months_back
  - Return the JSON response or null if request fails

async function fetchUnderReporting()
  - GET request to process.env.ANALYTICS_API_URL + '/underreporting'
  - Return JSON or null

async function fetchVictimVulnerability()
  - GET request to process.env.ANALYTICS_API_URL + '/victim-vulnerability'
  - Return JSON or null

async function fetchRepeatOffenders()
  - GET request to process.env.ANALYTICS_API_URL + '/repeat-offenders'
  - Return JSON or null

async function fetchTrends(params)
  - GET request to process.env.ANALYTICS_API_URL + '/trends'
  - params can include: crime_type, district, groupby
  - Return JSON or null

async function fetchFIRs(filters)
  - GET request to process.env.ANALYTICS_API_URL + '/firs' with filters as query params
  - Return JSON or null

All functions: use axios with a 10-second timeout.
On network error or timeout: log the error and return null.
Never throw — always return null on failure.

Export all as named exports.
```text
### Step 3: Wire Analytics into the Chat Function

Update your `functions/chat/index.js` to use the data fetcher.

In the section where you handle `needs_data`, update it:

```text
Add this to your existing chat function (functions/chat/index.js):

After parsing the AI response and finding needs_data is not null:

const { fetchHotspots, fetchFIRs, fetchTrends, fetchRepeatOffenders } = require('../../utils/data-fetcher');
const { validateAndFillVizData } = require('../../utils/viz-validator');

let resolvedData = null;
if (parsedResponse.needs_data && parsedResponse.needs_data.type) {
  const params = parsedResponse.needs_data.params || {};

  switch (parsedResponse.needs_data.type) {
    case 'hotspots':
      resolvedData = await fetchHotspots(params);
      break;
    case 'trends':
      resolvedData = await fetchTrends(params);
      break;
    case 'firs':
      resolvedData = await fetchFIRs(params);
      break;
    case 'repeat_offenders':
      resolvedData = await fetchRepeatOffenders();
      break;
  }
  parsedResponse.needs_data = null;
}

parsedResponse.visualization = validateAndFillVizData(
  parsedResponse.visualization,
  resolvedData
);
```text
---

## WEEK 4 — Feature 6: Integrate Person 4's Camera APIs

Same pattern as Week 3. Get the JSON response format from Person 4 first.

Message Person 4:

> "Can you share the exact JSON output for /api/cameras/nearby and /api/trail? Just a copy-paste example from your Postman tests."

### Step 1: Add Camera Fetchers to data-fetcher.js

Update `ai-engine/utils/data-fetcher.js` — add these functions:

```text
Add these functions to data-fetcher.js:

async function fetchCamerasNearby(lat, lng, radiusMeters, timestamp)
  - GET request to process.env.CAMERA_API_URL + '/nearby'
  - Query params: lat, lng, radius_meters: radiusMeters, timestamp
  - Return JSON or null on failure

async function fetchSuspectTrail(crimeLat, crimeLng, crimeTimestamp, vehicleType)
  - POST request to process.env.CAMERA_API_URL + '/trail'
  - Body: { crime_lat: crimeLat, crime_lng: crimeLng, crime_timestamp: crimeTimestamp,
    vehicle_type: vehicleType || 'motorcycle' }
  - Return JSON or null on failure

async function checkAnprPlate(plateNumber, cameraId, timestamp)
  - POST request to process.env.CAMERA_API_URL + '/anpr/check'
  - Body: { plate_number: plateNumber, camera_id: cameraId, timestamp }
  - Return JSON or null on failure
```text
Then update the switch statement in the chat function to handle camera types:

```text
Add to the switch in chat/index.js:

case 'cameras':
  if (params.lat && params.lng) {
    resolvedData = await fetchCamerasNearby(params.lat, params.lng, params.radius_meters || 500, params.timestamp);
  }
  break;

case 'trail':
  if (params.crime_lat && params.crime_lng) {
    resolvedData = await fetchSuspectTrail(params.crime_lat, params.crime_lng, params.crime_timestamp, params.vehicle_type);
  }
  break;
```text
---

## WEEK 4 — Feature 7: PDF Export (Catalyst SmartBrowz)

This is confirmed to work from official Catalyst docs. The SmartBrowz SDK method is:
`await smartbrowz.convertToPdf(convertDetails)` — confirmed.

### Step 1: Create the SmartBrowz Template

Before writing code, create the template in Catalyst dashboard:

1. Go to: Catalyst Dashboard → SmartBrowz → Templates
2. Click "New Template"
3. Name it: `drishti-investigation-report`
4. Note the Template ID (a number like `2075000000021001`) — save this in your .env:
   `SMARTBROWZ_TEMPLATE_ID=2075000000021001`

In the template editor, paste this HTML/CSS (click the HTML tab):

Paste this into Claude and use the output as your SmartBrowz template:

```text
Write an HTML/CSS/LiquidJS template for a DRISHTI Investigation Report PDF.

The template uses LiquidJS syntax for dynamic data.
Dynamic data object structure:
{
  investigator_name: string,
  case_reference: string,
  date_generated: string,
  role: string,
  conversation: [
    {
      role: 'user' | 'assistant',
      content: string,
      visualization_title: string (can be empty),
      timestamp: string
    }
  ]
}

Template design:
- Page: A4, clean white background, 20mm margins
- Header:
  - Left: "DRISHTI ದೃಷ್ಟಿ" in dark navy (12pt, bold)
  - Center: "Intelligence Report — CONFIDENTIAL" (10pt, gray)
  - Right: Karnataka State Police crest placeholder (just a bordered circle with "KSP")
  - Bottom border: 2px solid dark navy
- Report meta section:
  "Investigator: [investigator_name] | Role: [role] | Date: [date_generated] | Ref: [case_reference]"
  Light gray background box, 10pt
- Conversation section:
  For each message in conversation (using LiquidJS for loop):
  - User message: right-aligned box, light blue background, label "Investigator [timestamp]"
  - Assistant message: left-aligned box, light gray background, label "DRISHTI Analysis"
  - If visualization_title is not empty: show a dashed border box with the text
    "[Chart: visualization_title]" in italic — this is where the chart would appear
- Footer:
  "Generated by DRISHTI AI Platform | Karnataka State Police | For Official Use Only"
  Gray, 8pt, center aligned

Output only the HTML/CSS. Use LiquidJS syntax: {{ variable }}, {% for item in array %} etc.
```text
### Step 2: Create the PDF Export Function

Create file: `ai-engine/functions/export-pdf/index.js`

Paste this into Claude:

```text
Build a Node.js Catalyst Serverless Function for PDF export using SmartBrowz.

File: functions/export-pdf/index.js

POST /api/export/pdf
Body:
{
  conversation_id: string,
  investigator_name: string,
  case_reference: string,
  role: string
}

STEP 1: Initialize Catalyst:
const app = catalyst.initialize(req);

STEP 2: Fetch conversation from NoSQL:
const nosql = app.nosql();
const collection = nosql.collection(process.env.NOSQL_CONVERSATIONS_COLLECTION);
const doc = await collection.getDocumentDetails(req.body.conversation_id);
if (!doc) return res.status(404).json({ error: "Conversation not found" });

STEP 3: Build the template data object:
const templateData = {
  investigator_name: req.body.investigator_name || 'KSP Officer',
  case_reference: req.body.case_reference || req.body.conversation_id,
  date_generated: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
  role: req.body.role || 'Inspector',
  conversation: doc.content.messages.map(m => ({
    role: m.role,
    content: m.content,
    visualization_title: m.visualization_title || '',
    timestamp: new Date(m.timestamp || Date.now()).toLocaleTimeString('en-IN')
  }))
};

STEP 4: Generate PDF using SmartBrowz:
const smartbrowz = app.smartbrowz();
const result = await smartbrowz.generateFromTemplate(
  process.env.SMARTBROWZ_TEMPLATE_ID,
  {
    pdf_options: {
      format: 'A4',
      display_header_footer: false,
      print_background: true
    },
    page_options: {
      javascript_enabled: false
    }
  },
  templateData
);

STEP 5: Return the PDF as a downloadable file:
res.set('Content-Type', 'application/pdf');
res.set('Content-Disposition', 'attachment; filename="DRISHTI_Report_' +
  req.body.conversation_id + '.pdf"');
res.send(result);

CATCH block: return 500 with { error: "PDF generation failed", message: err.message }

Add CORS headers. Export as module.exports = async (req, res) => { ... }
```text
Reference for SmartBrowz SDK: **<https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/smartbrowz/generate-pdfnscreenshot**>

---

## TESTING CHECKLIST — Complete This Before Telling Vedesh You're Done

Run every test below. Only check off when it actually passes.

### Test 1 — Basic Chat Response

```bash
cd ai-engine
node test-chat.js
```text
Expected: JSON with `response_text` (not empty), `visualization.type` (not null), `follow_up_suggestions` (array of 3)

- [ ] PASS

### Test 2 — Kannada Language Detection

Update test-chat.js with a Kannada query:
`query: "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಕಳ್ಳತನ ತೋರಿಸು"` (meaning: show theft in Bengaluru)

Expected: `language_detected: "kn"` AND `response_text` is in Kannada

- [ ] PASS

### Test 3 — Visualization Type Selection

Test these queries and verify the visualization type chosen is logical:

| Query                                                    | Expected viz type                   |
| -------------------------------------------------------- | ----------------------------------- |
| "Show crime hotspots in Bengaluru"                       | heatmap                             |
| "Where did thefts happen near Koramangala?"              | map_pins                            |
| "How many thefts per month in 2025?"                     | line_chart                          |
| "Compare crime types across districts"                   | bar_chart                           |
| "What is the accused network for FIR KAR/BLR/2025/0234?" | network_graph                       |
| "What is your name?"                                     | none                                |
| "Find cameras near Silk Board"                           | map_pins (with needs_data: cameras) |

- [ ] At least 5 of 7 correct

### Test 4 — Conversation Memory (Follow-up)

Run two sequential queries:

1. `"Show me thefts in Koramangala last month"` → save conversation_id from response
2. Same conversation_id, `"Which of those had arrests?"` → AI should understand "those" refers to Koramangala thefts

Expected: Second response references Koramangala without being told again

- [ ] PASS

### Test 5 — Analytics API Integration (after Week 3)

Set ANALYTICS_API_URL in .env to point to Person 3's running server.
Query: "Show me crime hotspots in Bengaluru"
Expected: `visualization.data.points` has real coordinates (not empty)

- [ ] PASS

### Test 6 — Camera API Integration (after Week 4)

Set CAMERA_API_URL in .env to point to Person 4's running server.
Query: "Find cameras near Silk Board Junction, there was a snatching at 3pm"
Expected: `visualization.data.locations` has camera pin data

- [ ] PASS

### Test 7 — Voice Input (browser test)

Open the frontend (Member 5's app) in Chrome.
Click the mic button. Say: "Show me vehicle thefts in Whitefield"
Expected: Text appears in chat input field. Send it. Get an AI response.

- [ ] PASS

### Test 8 — Kannada Voice Input

Click language toggle to "ಕನ್ನಡ". Click mic. Say a simple query in Kannada.
Expected: Kannada text appears in chat input. AI responds in Kannada.

- [ ] PASS

### Test 9 — PDF Export

After a 3-message conversation, call the PDF export API.
Expected: A PDF file downloads. It contains the conversation. It looks professional.

- [ ] PASS

### Test 10 — Error Resilience

Temporarily change GEMINI_API_KEY to an invalid value. Run a query.
Expected: API returns `{ error: true, message: "AI service unavailable" }` — it does NOT crash the server.
Restore the key after testing.

- [ ] PASS

---

## WHAT YOU HAND OFF TO PERSON 5 (Girl — UI/UX)

Person 5 needs these from you to build the chat UI. When each item is ready, share with her immediately — don't wait until everything is done.

**Share at end of Day 3 (even before voice is done):**

- The `API_CONTRACT.md` file you created on Day 1
- The chat API URL (local for now: `<http://localhost:3000/api/chat`>)
- A screenshot of a real API response from Postman — she uses this to understand the data shape

**Share at end of Week 2:**

- The `VoiceInput.tsx` component (React) — she copies it into her `frontend/components/` folder
- The `textToSpeech.ts` utility — she copies it into `frontend/utils/`

**Share at end of Week 4:**

- The `export-pdf` function URL — she connects this to the "Download Report" button
- The final list of all your API endpoints for Vedesh's integration work

---

## QUICK REFERENCE — All Links You Need

| Resource                              | URL                                                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------- |
| Google AI Studio (get API key)        | <https://aistudio.google.com/app/apikey>                                             |
| Gemini API docs                       | <https://ai.google.dev/gemini-api/docs>                                              |
| Gemini Node.js SDK                    | <https://www.npmjs.com/package/@google/generative-ai>                                |
| Gemini generateContent reference      | <https://ai.google.dev/api/generate-content>                                         |
| Catalyst Node.js SDK docs             | <https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/overview/>                          |
| Catalyst Serverless Functions docs    | <https://docs.catalyst.zoho.com/en/serverless-functions/>                            |
| Catalyst NoSQL docs                   | <https://docs.catalyst.zoho.com/en/nosql/>                                           |
| Catalyst SmartBrowz PDF (Node.js SDK) | <https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/smartbrowz/generate-pdfnscreenshot> |
| Catalyst SmartBrowz Templates         | <https://docs.catalyst.zoho.com/en/smartbrowz/help/templates/customize-templates/>   |
| Catalyst Zia Services overview        | <https://docs.catalyst.zoho.com/en/zia-services/help/>                               |
| Catalyst Data Store ZCQL              | <https://docs.catalyst.zoho.com/en/data-store/help/zcql/>                            |
| Web Speech API (browser STT/TTS)      | <https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API>                    |
| Web Speech API Kannada example        | <https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition>                 |
| Catalyst project dashboard            | <https://catalyst.zoho.com>                                                          |

---

## WHEN YOU ARE STUCK — Exact Pattern to Follow

1. **Copy the FULL error** (the entire stack trace, not just the last line)
2. **Copy the relevant code section** (the function where the error happens)
3. **Open a new Gemini chat** and paste:

```text
I am building the AI Engine module for DRISHTI — a crime intelligence platform
for Karnataka Police. I am using Node.js, Catalyst Serverless Functions, and
the Gemini SDK.

I am getting this error:
[PASTE FULL ERROR]

The relevant code is:
[PASTE CODE]

The .env variables involved are:
GEMINI_MODEL, GEMINI_API_KEY, MAX_TOKENS (do NOT paste actual values)

Fix this step by step. Explain what was wrong.
```text
1. **Test the fix** before moving on
2. **If still stuck**: message Vedesh with the error + what you tried. He escalates.

---

_DRISHTI — ದೃಷ್ಟಿ | Person 2 AI Engine Guide | KSP × Hack2Skill 2026_


---

## APPENDIX: Aman's Handover & Current Issues (July 18, 2026)

**If you are taking over the AI Engine, be aware of these CURRENT BUGS:**
1. **Voice Model Failure**: The Web Speech API integrations (STT/TTS) are currently failing to pick up voice or provide output. This is a top priority to fix.
2. **Missing Pages**: Camera, Intel, and Crime Database pages need to be scaffolded.
3. **Broken Functions**: Most of the core agentic functions (Hotspots, FIRs, etc.) are currently failing. You must debug the AI response payload and rendering logic.
````
