# 🛡️ DRISHTI (ದೃಷ್ಟಿ)

> Voice-Driven Conversational Intelligence for the Karnataka State Police
>
> Built for the KSP Hack2Skill Datathon 2026

## 🌟 The Vision

**DRISHTI** transforms how Karnataka State Police officers interact with vast amounts of intelligence data. Instead of digging through complex databases or writing SQL queries, officers can simply **talk** to DRISHTI using natural language—whether in English, Kannada, or Hindi.

Powered by Agentic AI and Zoho Catalyst, DRISHTI instantly processes the query, retrieves real-time crime data, and renders dynamic, interactive visualizations directly onto a unified command center dashboard. It doesn't just answer questions; it acts as a proactive partner in crime prevention and officer safety.

---

## 🔥 Killer Features (Datathon Highlights)

### 1. 🌙 Midnight Briefing Protocol

**Context-Aware Proactive AI.** When an officer initializes a secure session during night shifts (18:00 - 06:00), DRISHTI doesn't wait to be asked. It automatically bypasses the standard standby mode and delivers a proactive, voice-synthesized sector summary, instantly plotting active crime hotspots on the dashboard.

### 2. 🚨 Overwatch Geo-Fencing (Officer Safety)

**Predictive Threat Escalation.** When an officer queries suspect movement (triggering a `geo_trail`), DRISHTI’s intelligence engine automatically evaluates the route. If a suspect enters an unpatrolled sector, the AI escalates to `CRITICAL` urgency. The Siri-style orb begins pulsing red, and a high-alert warning banner drops from the UI to recommend the immediate dispatch of Hoysala units.

### 3. ⚡ Actionable Intelligence Workflows

**From Query to Field Action in 1 Click.**

- **[DOWNLOAD REPORT]**: Instantly compiles the multi-turn AI conversation and geographic intel into a highly-formatted, official KSP PDF intelligence report via Zoho Catalyst serverless functions.
- **[DISPATCH UNITS]**: Seamless mock integration simulating the instant WhatsApp/SMS dispatch of suspect intelligence packages to on-ground patrol units.

### 4. 🎙️ Advanced Audio Engineering

**Hands-Free Command.** Features robust double-clap wake detection (via Web Audio API) and persistent Push-To-Talk capabilities (Ctrl+Alt). DRISHTI speaks back natively in the officer's queried language, dynamically adapting its vocal tone and UI glow (calm, concerned, urgent, critical) based on the severity of the intelligence data.

### 5. 🗺️ Dynamic Multi-Modal Visualizations

DRISHTI doesn't just return text blocks. The Agentic AI autonomously routes queries to specific internal tools and renders rich visuals:

- Interactive Leaflet Heatmaps for crime density
- Suspect Network Graphs for organized crime
- Crime Trend Bar/Line Charts
- Pulsing Geo-Trail Polylines for active suspect tracking

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────┐
│                   OFFICER (Browser)                 │
│  Double Clap / Push-to-Talk → Web Speech API (STT)  │
│  DrishtiOrb (framer-motion + GSAP visual states)    │
│  DrishtiChat (response panel + visualizations)      │
│  Web Speech API (TTS) ← speaks response back        │
└───────────────────┬─────────────────────────────────┘
                    │ POST /server/chat/
                    ▼
┌─────────────────────────────────────────────────────┐
│            Zoho Catalyst (Serverless)               │
│  /server/chat/          — Gemini 2.5 Flash Agent    │
│  /server/export-pdf/    — Generates official reports│
│  /server/conversations/ — Fetches chat history      │
│  ... (Data endpoints for Hotspots, FIRs, Trends)    │
└───────────────────┬─────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│                  Gemini 2.5 Flash                   │
│  Key rotation: 15+ keys → Groq fallback             │
│  Structured JSON output enforced                    │
│  system-prompt.js defines DRISHTI persona           │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Frontend Engine**: Next.js 16, React, Tailwind CSS
- **Visuals & Motion**: Framer Motion, GSAP, Leaflet.js (Dynamic Maps)
- **Backend Infrastructure**: Zoho Catalyst (Serverless Node.js 24 AdvancedIO)
- **AI Brain**: Gemini 2.5 Flash (Agentic Function Calling, Fallback Rotation, Structured JSON)
- **Data Persistence**: Catalyst NoSQL (Conversation tracking & history)

---

## 📁 Repository Structure

```text
kspdatathon2026/
├── functions/
│   ├── chat/                    ← AI Engine (Agentic Loop & RAG)
│   ├── export-pdf/              ← PDF generation endpoint
│   ├── conversations/           ← Conversation history endpoint
│   ├── hotspots/                ← Mock crime databases...
│   ├── firs/
│   └── anpr-check/
├── nextjs/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.js          ← Main Command Dashboard
│   │   │   └── globals.css
│   │   └── components/
│   │       ├── DrishtiOrb.jsx   ← Animated Siri-style voice orb
│   │       ├── DrishtiChat.jsx  ← Response panel & Action Buttons
│   │       └── DrishtiVoice.jsx ← Voice hook (STT/TTS/clap detection)
│   └── package.json
└── catalyst.json
```

---

## 🚀 Quick Start Guide

### Prerequisites

- Node.js v24 (for Catalyst functions)
- Node.js v20 (for Next.js frontend)
- Zoho Catalyst CLI (`zcatalyst-cli`)
- Gemini API key(s) from Google AI Studio

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

---

## 🔐 Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY_1` | Yes | Primary Gemini API key |
| `GEMINI_API_KEY_2..15` | Recommended | Fallback keys for rate-limit rotation |
| `GROQ_API_KEY` | Optional | Groq fallback for ultra-fast text inference |
| `GEMINI_MODEL` | No | Default: `gemini-2.5-flash` |
| `NOSQL_CONVERSATIONS_COLLECTION` | No | Default: `conversations` |

---

**Built with ❤️ for the safety and security of Karnataka.**
