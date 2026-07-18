# DRISHTI ದೃಷ್ಟಿ — Build Memory

> This file is updated every time a significant build decision is made, a step is completed, or a blocker is resolved. It is the source of truth for current build state.

**Last Updated:** July 17, 2026  
**Current Phase:** Frontend Build — Step 2 (Orb Component)

---

## Environment

| Item | Value |
|------|-------|
| OS | CachyOS (Arch Linux) |
| Shell | Fish |
| IDE | Antigravity |
| Node (Catalyst) | v24.18.0 via nvm |
| Node (Next.js) | v20.20.2 via nvm |
| Catalyst CLI | zcatalyst-cli v1.27.0 |
| Next.js | 16.2.10 (upgraded from 14.2.5) |
| Repo | github.com/vedeshskhatri/kspdatathon2026 |
| Branch | ai-engine |

---

## Completed Steps

### ✅ Step 0 — Environment Setup
- Switched from Windows to Linux (CachyOS)
- Installed nvm + Node 18, 20, 24
- Installed zcatalyst-cli v1.27.0
- Configured node24.bin path for Catalyst
- Confirmed `catalyst serve` runs all 12 functions

### ✅ Step 1 — Catalyst Backend Running
- All 12 functions serving locally:
  - `drishti_ksp_function`, `cameras-nearby`, `trail`, `anpr-check`
  - `network-graph-data`, `firs`, `hotspots`, `trends`
  - `repeat-offenders`, `victim-vulnerability`, `underreporting`, `chat`
- Functions available at `http://localhost:3000/server/<name>/`

### ✅ Step 1b — Next.js Running
- Upgraded Next.js from 14.2.5 to 16.2.10 (fixed silent crash on Node 20)
- Running at `http://localhost:3001` with `nvm use 20`
- GSAP installed (`npm install gsap`)
- `npm install --legacy-peer-deps` required due to react-leaflet peer conflict

---

## In Progress

### 🔄 Step 2 — DRISHTI Orb Component
- Building `nextjs/src/components/DrishtiOrb.jsx`
- 4 states: idle / listening / thinking / speaking
- framer-motion + GSAP for animations
- Canvas particle system
- Double-clap wake detection via Web Audio API

---

## Pending Steps

### ⏳ Step 3 — DrishtiVoice Hook
- `useDrishtiVoice` hook
- Web Speech API STT (en-IN, hi-IN, kn-IN)
- Web Speech API TTS
- Double-clap detection integration

### ⏳ Step 4 — DrishtiChat Panel
- Slide-up response panel
- Response text display
- Follow-up suggestion chips
- Visualization container

### ⏳ Step 5 — Page Wiring
- Replace default Next.js page
- KSP dark dashboard layout
- Wire Orb + Voice + Chat together
- POST to `/server/chat/` on transcript ready

### ⏳ Step 6 — API Key Setup
- Get 15+ Gemini keys from friends
- Create `functions/chat/.env`
- Implement key rotation in `index.js`
- Add Groq fallback

### ⏳ Step 7 — Visualization Engine
- Render Leaflet map for `hotspot_map`
- D3 charts for `bar_chart` / `line_chart`
- Network graph for `network_graph`
- Stat cards for `stat_card`
- FIR list for `fir_list`

### ⏳ Step 8 — Three Language Tests
- English query test
- Hindi query test
- Kannada query test
- Confirm schema fields in all three

### ⏳ Step 9 — Integration with Camera Intel
- Connect ANPR response to camera teammate's output
- Test `/server/anpr-check/` and `/server/cameras-nearby/`

### ⏳ Step 10 — Demo Polish
- Pre-warm Catalyst functions before demo
- Cache common query responses
- Test full voice → response → visualization → TTS loop
- Final UX review

---

## Key Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| Jul 17 | Use Web Speech API over Gemini Live | Simpler, no quota risk, demo-safe |
| Jul 17 | Double-clap via Web Audio API | No external library, hands-free for officers |
| Jul 17 | 15+ Gemini key rotation | Rate limit immunity during demo |
| Jul 17 | Groq as text-only fallback | No voice API but fast JSON generation |
| Jul 17 | Next.js upgraded to 16.x | 14.x silent crash on Node 20 |
| Jul 17 | nvm use 20 for Next.js, nvm use 24 for Catalyst | Node version isolation per terminal |
| Jul 17 | framer-motion + GSAP together | State transitions vs continuous loops |

---

## Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| `functions/chat/.env` missing | ⏳ Pending | Need API keys from friends first |
| react-leaflet peer conflict | ✅ Workaround | `--legacy-peer-deps` flag |
| Next.js workspace root warning | ✅ Ignore | Harmless, lockfile detection |
| Web Speech API Kannada accuracy | ⚠️ Known limitation | Hindi/English fallback available |
