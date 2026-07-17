# DRISHTI ದೃಷ್ಟಿ — AI Engine

> Voice-driven conversational intelligence for Karnataka State Police  
> KSP Hack2Skill Datathon 2026

---

## Key Highlights (Datathon Features)

- **Midnight Briefing Protocol**: Context-aware proactive voice delivery. If an officer starts a session at night, DRISHTI bypasses the prompt and delivers an automated sector summary.
- **Overwatch Geo-Fencing (Officer Safety)**: Automatically tracks suspect movement (`geo_trail`). If suspects enter unpatrolled sectors, DRISHTI flashes a critical UI alert and escalates the chat priority.
- **Actionable Intelligence**: One-click generation of official KSP PDF intelligence reports and instant "Dispatch to Field Units" (mock WhatsApp/SMS) workflows.

## Architecture Overview

```text
┌─────────────────────────────────────────────────────┐
│                   OFFICER (Browser)                  │
│  Double Clap / Push-to-Talk → Web Speech API (STT)  │
│  DrishtiOrb (framer-motion + GSAP visual states)    │
│  DrishtiChat (response panel + visualizations)       │
│  Web Speech API (TTS) ← speaks response back        │
└───────────────────┬─────────────────────────────────┘
                    │ POST /server/chat/
                    ▼
┌─────────────────────────────────────────────────────┐
│            Zoho Catalyst (Serverless)                │
│  /server/chat/          — Gemini 2.5 Flash RAG      │
│  /server/hotspots/      — Crime hotspot data        │
│  /server/firs/          — FIR records               │
│  /server/trends/        — Crime trend analytics     │
│  /server/anpr-check/    — ANPR plate lookup         │
│  /server/cameras-nearby/ — Camera intel             │
│  /server/trail/         — Suspect trail             │
│  /server/network-graph-data/ — Network graph        │
│  /server/repeat-offenders/  — Repeat offender data  │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│                  Gemini 2.5 Flash                    │
│  Key rotation: 15+ keys → Groq fallback             │
│  Structured JSON output enforced                    │
│  system-prompt.js defines DRISHTI persona           │
└─────────────────────────────────────────────────────┘
```

---

## Repository Structure

```text
kspdatathon2026/
├── functions/
│   ├── chat/                    ← AI Engine (YOU ARE HERE)
│   │   ├── index.js             ← Main handler + Gemini integration
│   │   ├── system-prompt.js     ← DRISHTI persona + schema enforcement
│   │   ├── package.json
│   │   └── .env                 ← API keys (gitignored)
│   ├── hotspots/
│   ├── firs/
│   ├── trends/
│   ├── anpr-check/
│   ├── cameras-nearby/
│   ├── trail/
│   ├── network-graph-data/
│   ├── repeat-offenders/
│   ├── victim-vulnerability/
│   └── underreporting/
├── nextjs/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js          ← Main dashboard
│   │   │   ├── layout.js
│   │   │   └── globals.css
│   │   └── components/
│   │       ├── DrishtiOrb.jsx   ← Animated voice orb
│   │       ├── DrishtiChat.jsx  ← Response panel
│   │       └── DrishtiVoice.jsx ← Voice hook (STT/TTS/clap)
│   └── package.json
├── docs/
│   └── ai-engine/               ← You are reading this
├── camera-intel/                ← Teammate: CV pipeline
├── crime-database/              ← Synthetic dataset
└── catalyst.json
```

---

## Quick Start

### Prerequisites

- Node.js v24 (for Catalyst functions)
- Node.js v20 (for Next.js frontend)
- nvm installed
- Zoho Catalyst CLI (`zcatalyst-cli`)
- Gemini API key(s) from aistudio.google.com

### 1. Clone & Setup

```bash
git clone -b ai-engine https://github.com/vedeshskhatri/kspdatathon2026.git
cd kspdatathon2026
```

### 2. Configure API Keys

```bash
cp .env.example functions/chat/.env
nano functions/chat/.env
# Add: GEMINI_API_KEY_1=your_key_here
```

### 3. Start Catalyst Backend (Terminal 1)

```bash
nvm use 24
catalyst serve
# Functions available at http://localhost:3000/server/
```

### 4. Start Next.js Frontend (Terminal 2)

```bash
cd nextjs
nvm use 20
npm install --legacy-peer-deps
npm run dev -- -p 3001
# UI available at http://localhost:3001
```

### 5. Test Voice Backend

```bash
curl -X POST http://localhost:3000/server/chat/ \
  -H "Content-Type: application/json" \
  -d '{"query": "any hotspots forming in Whitefield?", "language": "en"}'
```

---

## Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY_1` | Yes | Primary Gemini API key |
| `GEMINI_API_KEY_2..15` | Recommended | Fallback keys for rotation |
| `GROQ_API_KEY` | Optional | Groq fallback (text only) |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `NOSQL_CONVERSATIONS_COLLECTION` | No | Default: `conversations` |
| `MAX_CONVERSATION_HISTORY` | No | Default: `10` |

---

## Branch Strategy

| Branch | Owner | Purpose |
| :--- | :--- | :--- |
| `main` | Team | Stable integration |
| `ai-engine` | Swapnil | Voice + RAG engine |
| `camera-intel` | Teammate | CV pipeline |
