# DRISHTI ದೃಷ್ಟಿ — Tech Stack

---

## Frontend

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.x | App router, SSR, routing |
| UI Library | React | 18.x | Component model |
| Styling | Tailwind CSS | 3.4.x | Utility-first CSS |
| Animation | framer-motion | 12.x | State transitions, orb animations |
| Animation | GSAP | 3.x | Continuous organic animation loops |
| Maps | Leaflet + react-leaflet | 1.9 / 5.x | Crime hotspot map rendering |
| Charts | D3.js | 7.x | Bar/line/network visualizations |
| Voice (STT) | Web Speech API | Browser native | Officer speech to text |
| Voice (TTS) | Web Speech API | Browser native | DRISHTI speaks responses |
| Wake Detection | Web Audio API | Browser native | Double-clap detection |

---

## Backend

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Platform | Zoho Catalyst | Serverless function hosting |
| Runtime | Node.js v24 | Function execution |
| AI Model | Gemini 2.5 Flash | RAG, JSON generation, intelligence |
| AI Fallback | Groq (Llama 3.3 70B) | Text fallback if all Gemini keys fail |
| Key Strategy | 15+ Gemini keys rotating | Rate limit immunity |
| Storage | Catalyst NoSQL | Conversation history per session |
| Functions | 12 serverless endpoints | Data + AI serving |

---

## Data Layer

| Source | Type | Purpose |
|--------|------|---------|
| Synthetic Crime DB | JSON/CSV | FIRs, hotspots, trends, offenders |
| Camera Intel | CV pipeline output | ANPR, nearby cameras (teammate) |
| NoSQL Collections | Catalyst NoSQL | Conversation memory |

---

## Dev Tools

| Tool | Purpose |
|------|---------|
| Antigravity IDE | Primary development environment |
| Fish shell | Terminal |
| nvm | Node version management (v20 + v24) |
| zcatalyst-cli | Catalyst local dev server |
| Git | Version control, ai-engine branch |
| Brave Browser | Testing (Web Speech API support) |

---

## Key Architecture Decisions

### Why Zoho Catalyst?
Hackathon constraint — provided platform. Serverless Node.js with NoSQL included. No GPU access.

### Why Web Speech API over Gemini Live?
- No API quota concerns
- No additional cost
- Works offline for STT (partial)
- Simpler implementation for hackathon timeline
- Gemini Live can be swapped in post-hackathon

### Why Gemini 2.5 Flash over GPT-4?
- Structured JSON output enforcement
- Multilingual (Kannada/Hindi/English) capability
- Free tier sufficient with key rotation
- Fastest inference for real-time voice UX

### Why Double-Clap Wake Word?
- Hands-free for officers in field or control room
- No always-on microphone privacy concerns
- Unique, memorable interaction model
- Implemented via Web Audio API energy spike detection — no external dependency

### Why framer-motion + GSAP together?
- framer-motion: state-based transitions (idle→listening→thinking→speaking)
- GSAP: continuous organic animation loops (breathing, morphing, particles)
- They complement each other without conflict
