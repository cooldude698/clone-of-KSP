# DRISHTI — ದೃಷ್ಟಿ

## MEMBER 2: AI Engine Commander
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:**
> You are the brain of DRISHTI. You manage the LLM prompts, format the structural responses (JSON), handle voice processing (Kannada/English), and export reports.

---

## 1. Prerequisites & Branch Setup

Before writing any code, ensure you are working in isolation so you don't overwrite others.

```bash
# 1. Pull the latest repository updates
git pull origin main

# 2. Switch to your dedicated branch
git checkout ai-engine

# 3. Enter your directory and initialize
cd ai-engine
npm init -y
npm install @catalyst-platform/catalyst-node-sdk @anthropic-ai/sdk axios dotenv
```

---

## 2. Step-by-Step Vibe Coding Guides

Use these exact, heavily-engineered prompts in Claude (or another LLM) to generate robust code. 

### Feature 1: The Core Chat API (LLM Router)
**Where to put it:** `ai-engine/functions/chat/index.js`

**Prompt to copy-paste into Claude:**
> "Act as an expert Node.js developer specializing in Zoho Catalyst Serverless Functions and Anthropic's Claude API. Write a Catalyst serverless function (Express.js style handler) for a POST `/api/chat` route. 
> 
> **Inputs required:** `query` (string), `language` (en/kn), `conversation_history` (array of objects).
> **Process:**
> 1. Construct a system prompt for 'DRISHTI', an AI crime assistant for Karnataka State Police. Emphasize strict adherence to returning output ONLY as a JSON payload, with NO conversational filler text outside the JSON.
> 2. The JSON schema must strictly match: `{ "response_text": string, "visualization": { "type": "heatmap"|"map_pins"|"bar_chart"|"network_graph"|"timeline"|"geo_trail"|"none", "data_requirements": object }, "follow_up_suggestions": string[] }`
> 3. Do not hallucinate data. If the user asks for hotspots, return `"type": "heatmap"` and `"data_requirements": { "endpoint": "hotspots", "params": { "district": "..." } }`.
> 4. Call `claude-sonnet-4-5` via the `@anthropic-ai/sdk` using `process.env.ANTHROPIC_API_KEY`.
> 5. Log the interaction to Zoho Catalyst NoSQL `conversations` table.
> 6. Return standard HTTP 200 with the JSON. Add strict try/catch error handling."

### Feature 2: Voice Input/Output (Zia STT/TTS)
**Where to put it:** `frontend/components/VoiceInput.tsx` *(Coordinate with Member 5!)*

**Prompt:**
> "Write a React component `VoiceInput.tsx` in TypeScript + Tailwind CSS using Framer Motion for animations. 
> 
> **Requirements:**
> 1. A microphone button. When clicked, uses `MediaRecorder` API to capture audio. Show a pulsing red ring animation while recording.
> 2. A language toggle state (EN / KN).
> 3. When recording stops, convert the Blob to a File and send it to a backend endpoint `/api/voice/transcribe`.
> 4. Pass the transcribed text up to the parent component via `onTranscription(text)`.
> 5. Include an `autoPlayResponse` `useEffect` hook that listens for a `audioUrl` prop and plays the spoken response via `new Audio()`. Handle browser safety play permissions gracefully."

### Feature 3: PDF Investigation Report Export
**Where to put it:** `ai-engine/functions/export/index.js`

**Prompt:**
> "Write a Node.js Zoho Catalyst serverless function to generate PDF reports using Catalyst SmartBrowz.
> 1. Accept a POST body containing `conversation_history` (array of Q&A), `case_number`, and `investigator_name`.
> 2. Generate a clean, highly professional HTML template inline using inline CSS. It must look like an official 'Karnataka State Police Intelligence Report'. Dark navy header, DRISHTI logo placeholder, timestamp.
> 3. Feed the HTML string to Catalyst SmartBrowz `.createPdf()` method.
> 4. Return the generated PDF buffer as an attachment download (`Content-Type: application/pdf`). Catch and log exceptions."

---

## 3. Testing Quality & Performance

You must test your API locally before pushing. Do not push broken code.

**Test the Chat API using Postman or cURL:**
```bash
curl -X POST http://localhost:3000/server/chat \
-H "Content-Type: application/json" \
-d '{"query":"Where are the chain snatching hotspots?", "language":"en", "conversation_history":[]}'
```

**Quality Checklist:**
- [ ] Does the response come back as **100% valid JSON**? (If there is text before or after the `{...}`, the frontend will break).
- [ ] Is the Anthropic API key kept entirely in `.env` and *never* in the committed code?
- [ ] When you request Kannada (`"language": "kn"`), does the `response_text` actually return in Kannada script?

---

## 4. Git Workflow & Pull Request

When your feature is working locally, push it up and ask Member 1 for review.

```bash
# 1. Stage your changes
git add .

# 2. Write a clear, descriptive commit message
git commit -m "feat(ai-engine): add chat router and QuickML integration"

# 3. Push to your branch
git push origin ai-engine
```

**Creating the Pull Request (PR):**
1. Go to https://github.com/vedeshskhatri/kspdatathon2026/pulls
2. Click **"New Pull Request"**.
3. Base: `main` <- Compare: `ai-engine`.
4. Title: `Feature: AI Chat Engine & Visual Router`
5. Description: Write 2 bullet points on what works, what needs testing, and tag `@vedeshskhatri` (Member 1) to review and merge via GitHub UI.