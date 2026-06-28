# DRISHTI — ದೃಷ್ಟಿ
## Person 2: Swapnil Ghosh — AI Engine Commander (Final, Fully Corrected)
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:** You are the brain. Every question an investigator types or speaks goes through your chat function, gets answered by Gemini, and comes back with the right chart automatically attached.

---

## WHAT CHANGED FROM THE ORIGINAL PLAN — READ THIS FIRST

1. **Gemini, not Anthropic.** The team is using Google's Gemini API directly. You already have `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-2.5-flash` in the shared `.env`. Every function prompt below is written around Gemini's Node.js SDK.
2. **No database host/port/password exist.** You will never connect to a raw MySQL-style database. All Data Store access happens through the Catalyst SDK running *inside* a Catalyst Function — that's the only way in.
3. **No Zia voice service.** Catalyst's Zia only covers OCR, face analytics, text analytics, object recognition, and barcode scanning — there is no speech-to-text or text-to-speech component. Voice is handled **entirely in the browser** using the Web Speech API. This needs zero API key and zero backend function.
4. **No Catalyst QuickML.** Skip it completely — Gemini is called directly, the same way you'd call any external AI API.
5. **Confirmed real folder structure — this is the one structural thing you must get right.** Catalyst's Functions feature expects **one single top-level `functions/` folder** sitting next to `catalyst.json` at the project root — not a `functions/` folder nested inside an `ai-engine/` subfolder. Every function you build (`chat`, `conversations`, `export-pdf`) is its own named subfolder directly inside that one shared `functions/` directory, each with its own `package.json`. You still work on the `ai-engine` **git branch** — that's just a branch name, it has nothing to do with the physical folder path.

---

## YOUR DEPENDENCY MAP

### What You Need From Others

```
FROM VRITIKA (Person 1) — needed Day 1:
  ✅ GitHub repo access, your branch: ai-engine
  ✅ The .env file: GEMINI_API_KEY, GEMINI_MODEL, CATALYST_PROJECT_ID, 
     CATALYST_ACCOUNT_ID, NEXT_PUBLIC_API_BASE_URL
  ✅ Confirmation that catalyst.json + .catalystrc exist at the project root 
     and catalyst serve runs without error
  ✅ Confirmation that the 11 Data Store tables + columns exist

FROM AMAN (Person 3) — needed Week 3:
  ✅ His analytics API URLs and exact JSON response formats (hotspots, trends, 
     repeat-offenders, victim-vulnerability, underreporting, firs)

FROM THE CAMERA-INTEL PERSON (Person 4) — needed Week 4:
  ✅ Their camera/trail/ANPR API URLs and exact JSON response formats
```

### What You Give to Others

```
TO PERSON 5 (UI/UX) — share by end of Day 3, even before voice is built:
  📤 API_CONTRACT.md (exact request/response JSON shape for /api/chat)
  📤 A real sample response from Postman, so she can build against actual data

TO PERSON 5 — share by end of Week 2:
  📤 Nothing backend-related needed for voice — tell her directly to use the 
     Web Speech API natively in her own component; you don't own this anymore

TO VRITIKA — for integration, Week 5:
  📤 Final deployed URL of your chat function
```

### Write This Contract on Day 1 — Save as `functions/API_CONTRACT.md`

**Request (frontend → you):**
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
```

**Response (you → frontend):**
```json
{
  "response_text": "There were 47 vehicle thefts in Koramangala in May 2026...",
  "visualization": {
    "type": "bar_chart",
    "title": "Vehicle Thefts in Koramangala — May 2026",
    "data": { "labels": ["Week 1","Week 2","Week 3","Week 4"], "values": [12,8,15,12] }
  },
  "follow_up_suggestions": [
    "Which areas in Koramangala had the most thefts?",
    "Show me the accused profile for these cases",
    "How does this compare to last year?"
  ],
  "needs_data": null,
  "confidence": 0.94,
  "language_detected": "en",
  "conversation_id": "conv_abc123"
}
```

**Visualization types and when each applies:**
```
heatmap        → hotspot/density questions
map_pins       → specific locations, camera positions
bar_chart      → comparing categories/counts
line_chart     → trends over time
network_graph  → connections between people/cases
timeline       → sequence of events in one case
geo_trail      → suspect movement across cameras
none           → simple factual answer, no visual needed
```

Push this file to GitHub the moment it's written — Person 5 is blocked without it.

---

## YOUR COMPLETE TASK LIST

```
Day 1   → Setup: clone repo, install Gemini SDK, verify .env, confirm catalyst serve works
Day 1   → Write and push API_CONTRACT.md
Day 2-3 → Build the core chat function (functions/chat/)
Day 4   → Build the visualization-data-filling logic (no separate service — it's inside chat)
Day 5   → Build conversation memory (NoSQL, inside the same chat function)
Week 2  → Hand voice entirely to the frontend (Web Speech API) — confirm with Person 5
Week 3  → Integrate Aman's analytics APIs into the chat function
Week 4  → Integrate camera-intel APIs into the chat function
Week 4  → Build the PDF export function (functions/export-pdf/, using SmartBrowz)
Week 5  → Support Vritika's integration sprint
```

---

## DAY 1 — Setup

### Step 1: Confirm the Shared Foundation Works
```powershell
git clone https://github.com/vedeshskhatri/kspdatathon2026.git
cd kspdatathon2026
git checkout ai-engine
catalyst serve
```
If this throws `Could not understand the targets` or similar, that means `catalyst.json` isn't correctly set up yet at the root — go back to Vritika before doing anything else. Don't try to fix Catalyst project config yourself; that's her job and she's already solved this exact error once.

### Step 2: Find the Real Functions Folder
```powershell
dir functions
```
You should see at least one existing function folder (the sample one created during `catalyst init`, likely named something like `drishti_ksp_function`). **This is the folder where all your new functions go too** — not inside any `ai-engine/` subfolder.

### Step 3: Add Your First Real Function
From the project root (same level as `catalyst.json`):
```powershell
catalyst function:create
```
*(If this exact command doesn't resolve, run `catalyst --help` to find the current subcommand name for adding a function — Zoho occasionally adjusts these, but the flow below is identical regardless of the exact command name.)*

When prompted:
- **Function type:** AdvancedIO
- **Runtime:** Node.js (latest available version shown)
- **Package name:** `chat`
- **Entry point:** `index.js`
- **Author:** your email
- **Install dependencies now?** Yes

This creates `functions/chat/` with its own `package.json` and `node_modules`.

### Step 4: Install the Gemini SDK Inside That Function
```powershell
cd functions/chat
npm install @google/generative-ai dotenv zcatalyst-sdk-node axios
```

### Step 5: Verify Gemini Works
```powershell
cd ..\..
node -e "
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });
model.generateContent('Say hello in one word').then(r => console.log(r.response.text()));
"
```
If you see a word printed back, Gemini is working correctly.

---

## DAY 1 — No Hardcoding Rules

| What | Wrong | Correct |
|---|---|---|
| Gemini key | `"AIzaSy..."` in code | `process.env.GEMINI_API_KEY` |
| Model name | `"gemini-2.5-flash"` in code | `process.env.GEMINI_MODEL` |
| Aman's API URL | `"http://localhost:3000/..."` | `process.env.ANALYTICS_API_URL` |
| Camera API URL | `"http://localhost:3000/..."` | `process.env.CAMERA_API_URL` |
| Max conversation history | `10` in code | `parseInt(process.env.MAX_CONVERSATION_HISTORY)` |

Add to your `.env`:
```
ANALYTICS_API_URL=http://localhost:3000/server/hotspots
CAMERA_API_URL=http://localhost:3000/server/cameras-nearby
NOSQL_CONVERSATIONS_COLLECTION=conversations
MAX_CONVERSATION_HISTORY=10
```

---

## DAY 2-3 — Build the Core Chat Function

### Step 1: Write the System Prompt Config

Create `functions/chat/system-prompt.js`. Paste this into Claude, copy the output:
```
Write a Node.js module system-prompt.js that exports getSystemPrompt(contextData).

It returns a string — the DRISHTI system prompt for a Gemini model.

The prompt must instruct the model:
- You are DRISHTI (ದೃಷ್ಟಿ), AI crime intelligence co-pilot for Karnataka State Police
- Respond in the SAME language the user used (English or Kannada)
- Return ONLY valid JSON, no markdown fences, no preamble — your entire output 
  must be parseable as JSON matching this exact schema:
  {
    "response_text": string,
    "visualization": {
      "type": "heatmap"|"map_pins"|"bar_chart"|"line_chart"|"network_graph"|"timeline"|"geo_trail"|"none",
      "title": string,
      "data": object
    },
    "follow_up_suggestions": [string, string, string],
    "needs_data": { "type": "hotspots"|"cameras"|"firs"|"trail"|"repeat_offenders"|"trends"|null, "params": object },
    "confidence": number (0 to 1),
    "language_detected": "en"|"kn"
  }
- Choose visualization type by query intent: locations→map_pins, density→heatmap, 
  comparisons→bar_chart, trends-over-time→line_chart, connections→network_graph, 
  case-event-sequence→timeline, suspect-movement→geo_trail, simple-fact→none
- If real data is needed (camera locations, live hotspots), set needs_data 
  accordingly instead of inventing numbers
- Never hallucinate crime statistics. If unsure, say so in response_text.
- contextData (if provided) is real data already fetched from the crime database — 
  append it to the prompt as: "REAL DATA CONTEXT: " + JSON.stringify(contextData)

Export: module.exports = { getSystemPrompt };
```

### Step 2: Build the Function Itself

Create `functions/chat/index.js`. Paste this into Claude, copy the complete output:
```
Build a complete Node.js Catalyst AdvancedIO Function for the DRISHTI chat API,
using the Gemini API (not Anthropic).

File: functions/chat/index.js

IMPORTS:
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');
const { getSystemPrompt } = require('./system-prompt');

REQUEST BODY: { query, language, conversation_id, conversation_history }

STEP 1 — Initialize:
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const catalystApp = catalyst.initialize(req);
const nosql = catalystApp.nosql();

STEP 2 — Load conversation history:
Try reading the document with ID = conversation_id from the NoSQL collection 
named process.env.NOSQL_CONVERSATIONS_COLLECTION. If it exists, use its stored 
messages array; otherwise use conversation_history from the request body. 
Trim to the last process.env.MAX_CONVERSATION_HISTORY messages.

STEP 3 — Query relevant FIR context from Data Store (best-effort, never fatal):
Use admin scope: const adminApp = catalyst.initialize(req, { scope: 'admin' });
const zcql = adminApp.zcql();
Try a simple ZCQL SELECT on FIRs filtered by any district/crime-type keyword 
detected in the query (max 3 WHERE conditions — ZCQL allows up to 5 total). 
Limit 30 rows. If this fails for any reason, continue with empty context — 
never let this break the main response.

STEP 4 — Build the Gemini model with system instruction:
const systemPrompt = getSystemPrompt(contextDataFromStep3);
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL, 
  systemInstruction: systemPrompt 
});

STEP 5 — Start a chat session with history and send the new message:
const chat = model.startChat({
  history: conversationHistory.map(m => ({ 
    role: m.role === 'assistant' ? 'model' : 'user', 
    parts: [{ text: m.content }] 
  }))
});
const result = await chat.sendMessage(query);
const rawText = result.response.text();

STEP 6 — Parse the JSON response:
Strip any markdown code fences if present (```json ... ```), then JSON.parse(). 
If parsing fails, build a fallback object: 
{ response_text: rawText, visualization: { type: 'none' }, follow_up_suggestions: [], needs_data: null, confidence: 0.5, language_detected: language }

STEP 7 — Resolve needs_data if present:
If parsedResponse.needs_data.type is set, call the matching external API using 
axios (process.env.ANALYTICS_API_URL or process.env.CAMERA_API_URL + the right 
path and params), inject the result into parsedResponse.visualization.data, then 
set needs_data to null. Wrap in try/catch — never fail the whole request if this 
external call fails, just proceed without the extra data.

STEP 8 — Save the conversation to NoSQL:
Append the new user message and assistant response, upsert the document with 
document_id = conversation_id into the conversations collection. Wrap in try/catch.

STEP 9 — Return:
res.status(200).json({ ...parsedResponse, conversation_id });
Set headers: res.set('Access-Control-Allow-Origin', '*'); 
res.set('Content-Type', 'application/json');

CATCH block for the whole function: return 500 with 
{ error: true, message: "AI service unavailable" } — never let the function crash 
without a response.

Export: module.exports = async (req, res) => { ... }
```

### Step 3: Test It Locally
```powershell
catalyst serve
```
In a separate terminal:
```powershell
curl -X POST http://localhost:3000/server/chat/ ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"How many thefts happened in Bengaluru last month?\",\"language\":\"en\",\"conversation_id\":\"test001\",\"conversation_history\":[]}"
```
Expected: a JSON response with `response_text`, `visualization`, `follow_up_suggestions` filled in.

---

## DAY 4 — The "Visualization Engine" Is Just Smarter Prompting + Data Filling

There's no separate visualization service to build. The intelligence lives entirely in two places you've already built: the system prompt (Day 2) telling Gemini which chart type fits which question, and Step 7 above (filling real data into whatever `needs_data` request Gemini makes). If charts come back looking wrong or empty during testing, the fix is almost always tightening the wording in `system-prompt.js`, not writing new code.

---

## DAY 5 — Conversation Management API (Optional Extra Endpoint)

If there's time, add a small second function for listing/deleting past conversations — same `catalyst function:create` flow, package name `conversations`, querying/deleting NoSQL documents. This is a nice-to-have, not required for the demo to work — the core chat function already reads and writes conversation history correctly on its own.

---

## WEEK 2 — Voice Is Not Your Job Anymore

Tell Person 5 directly: voice input and output are pure frontend, using the browser's built-in Web Speech API (`webkitSpeechRecognition` for input, `speechSynthesis` for output, with `lang = 'kn-IN'` for Kannada). No API key, no backend function, nothing for you to build. Your only involvement is making sure your chat function's response JSON includes clean `response_text` that's reasonable to read aloud (not overly long, no special characters that read badly).

---

## WEEK 3 — Integrate Aman's Analytics APIs

### Step 1: Get His Real Response Format
Message Aman: *"Send me a real Postman response example for your hotspots, trends, and repeat-offenders endpoints."*

### Step 2: Update Your Data-Fetching Logic
Update Step 7 of your chat function (or split it into a helper file `functions/chat/data-fetcher.js` if it's getting long):
```
Add functions to data-fetcher.js, each using axios with a 10-second timeout, 
returning null on any failure (never throwing):

async function fetchHotspots(params) — GET process.env.ANALYTICS_API_URL + '/hotspots'
async function fetchTrends(params) — GET process.env.ANALYTICS_API_URL + '/trends'
async function fetchRepeatOffenders() — GET process.env.ANALYTICS_API_URL + '/repeat-offenders'
async function fetchFIRs(filters) — GET process.env.ANALYTICS_API_URL + '/firs'
```
Wire these into the switch statement on `needs_data.type` in your main chat function.

---

## WEEK 4 — Integrate Camera-Intel APIs + Build PDF Export

### Step 1: Camera Integration
Same pattern as Week 3 — get the real response format from the camera-intel person, add `fetchCamerasNearby()` and `fetchSuspectTrail()` to your data-fetcher, wire into the switch statement.

### Step 2: PDF Export Function
```powershell
catalyst function:create
```
Package name: `export-pdf`. Then:
```
Build a Node.js Catalyst AdvancedIO Function for PDF export using SmartBrowz.

File: functions/export-pdf/index.js

POST request body: { conversation_id, investigator_name, case_reference, role }

STEP 1: Initialize Catalyst, fetch the conversation document from NoSQL by 
conversation_id (same collection as the chat function).

STEP 2: Build a templateData object: investigator_name, case_reference, 
date_generated (Asia/Kolkata locale string), role, and the conversation messages 
array mapped to { role, content, timestamp }.

STEP 3: Use Catalyst SmartBrowz to generate a PDF:
const smartbrowz = catalystApp.smartbrowz();
const result = await smartbrowz.generateFromTemplate(TEMPLATE_ID, pdfOptions, templateData);
(TEMPLATE_ID comes from process.env.SMARTBROWZ_TEMPLATE_ID — ask Vritika to create 
the template in the Catalyst console under SmartBrowz → Templates first, and share 
the template ID with you.)

STEP 4: Return the PDF as a downloadable file:
res.set('Content-Type', 'application/pdf');
res.set('Content-Disposition', 'attachment; filename="DRISHTI_Report.pdf"');
res.send(result);

Error handling, CORS headers, export as module.exports = async (req, res) => {...}
```

If Vritika hasn't set up the SmartBrowz template yet, flag it to her — this one function genuinely needs a small piece of console setup from her side first.

---

## TESTING CHECKLIST

- [ ] `node -e "..."` Gemini test prints a word back
- [ ] `catalyst serve` runs without the "Could not understand targets" error
- [ ] POST to `/server/chat/` with a simple English query returns valid JSON
- [ ] Same query in Kannada returns `language_detected: "kn"` and Kannada text
- [ ] Two sequential calls with the same `conversation_id` show the second response understands context from the first
- [ ] Query like "show hotspots" sets `visualization.type` to `heatmap`, not `none`
- [ ] Once Aman's API is live: a hotspot query returns real coordinates in `visualization.data`, not empty
- [ ] Once camera API is live: a "find cameras near X" query returns real camera pins
- [ ] PDF export returns an actual downloadable PDF, not an error
- [ ] Killing the Gemini key temporarily and re-testing returns a clean `{ error: true, message: "AI service unavailable" }` instead of crashing

---

## QUICK REFERENCE

| Resource | URL |
|---|---|
| Gemini API docs | https://ai.google.dev/gemini-api/docs |
| Gemini Node.js SDK | https://www.npmjs.com/package/@google/generative-ai |
| Gemini chat/history docs | https://ai.google.dev/gemini-api/docs/text-generation#multi-turn-conversations |
| Catalyst CLI command reference | https://docs.catalyst.zoho.com/en/cli/v1/cli-command-reference/ |
| Catalyst Functions (AdvancedIO) | https://docs.catalyst.zoho.com/en/cloud-scale/help/functions/advanced-io-functions/ |
| Catalyst NoSQL | https://docs.catalyst.zoho.com/en/cloud-scale/help/nosql/introduction/ |
| Catalyst SmartBrowz PDF | https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/smartbrowz/generate-pdfnscreenshot |
| Web Speech API (browser voice) | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |

---

*DRISHTI — ದೃಷ್ಟಿ | Person 2 (Swapnil Ghosh) AI Engine Guide — Final | KSP × Hack2Skill 2026*
