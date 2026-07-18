# DRISHTI ದೃಷ್ಟಿ — Product Requirements Document

**Version:** 1.0.0  
**Date:** July 2026  
**Author:** AI Engine Team — KSP Hack2Skill Datathon 2026  
**Status:** Active Development

---

## 1. Executive Summary

DRISHTI (ದೃಷ್ಟಿ — meaning "Vision" in Kannada) is a conversational voice intelligence platform built for the Karnataka State Police. It enables officers to interact with live crime data, camera feeds, suspect records, and patrol intelligence through a natural voice interface — in Kannada, Hindi, or English — without requiring any technical expertise.

DRISHTI is not a chatbot. It is a proactive, context-aware intelligence companion that surfaces patterns, flags anomalies, and assists decision-making in real time.

---

## 2. Problem Statement

Karnataka State Police officers currently face:

- Fragmented data across multiple systems (FIRs, ANPR, crime databases, camera networks)
- No unified query interface for non-technical personnel
- Language barriers — most officers are more comfortable in Kannada/Hindi than English interfaces
- Delayed intelligence — pattern recognition happens manually and too slowly
- No voice-driven interaction for field or control room use

---

## 3. Goals & Success Metrics

| Goal | Metric | Target |
| ------ | -------- | -------- |
| Voice query response time | Time from speech to response | < 3 seconds |
| Multilingual accuracy | STT accuracy across EN/HI/KN | > 85% |
| System uptime | Availability during demo | 99.9% |
| Officer adoption proxy | Ease-of-use rating from judges | > 4.5/5 |
| Data coverage | % of queries answered from dataset | > 90% |

---

## 4. User Personas

### Primary: Field Intelligence Officer

- Works in control room or field
- Comfortable with Kannada, basic Hindi
- Needs quick answers without navigating dashboards
- Uses DRISHTI for hotspot queries, suspect lookups, patrol recommendations

### Secondary: Station House Officer (SHO)

- Reviews trends and reports
- Needs summary views and trend data
- Uses DRISHTI for weekly briefings and anomaly alerts

### Tertiary: Datathon Judge

- Evaluates technical innovation, UX polish, and real-world applicability
- Needs a seamless, impressive demo experience

---

## 5. Core Features

### F1 — Voice Activation

- **Double-clap wake word:** Two audio energy spikes within 600ms window triggers DRISHTI
- **Push-to-talk:** Spacebar hold or button press as secondary activation
- **Visual feedback:** Orb state changes instantly on activation

### F2 — Multilingual Voice I/O

- **STT:** Web Speech API with `en-IN`, `hi-IN`, `kn-IN` language support
- **TTS:** Web Speech API speechSynthesis for voice responses
- **Auto-detect:** Language detection in Gemini response schema

### F3 — Conversational Intelligence

- **Backend:** Zoho Catalyst serverless function (`/server/chat/`)
- **AI:** Gemini 2.5 Flash with structured JSON output
- **Context:** Conversation history maintained per session via NoSQL
- **Fallback chain:** 15+ Gemini API keys rotating → Groq → degraded response

### F4 — Structured Response Schema

Every DRISHTI response includes:

- `response_text` — spoken + displayed answer
- `visualization` — type + data for frontend widget rendering
- `emotion` — drives orb color/animation state
- `urgency` — drives voice prosody and visual urgency indicators
- `follow_up_suggestions` — proactive next query chips
- `language_detected` — for TTS language matching

### F5 — Visualization Engine

Dynamic widgets rendered based on `visualization.type`:

- `hotspot_map` — Leaflet map with crime density overlays
- `bar_chart` / `line_chart` — D3.js trend visualizations
- `network_graph` — suspect network connections
- `stat_card` — quick numeric summaries
- `fir_list` — scrollable FIR records

### F6 — Camera Intelligence Integration

- Receives CV data from camera-intel module (teammate integration)
- ANPR plate lookup via `/server/anpr-check/`
- Nearby camera query via `/server/cameras-nearby/`

---

## 6. Out of Scope (v1.0)

- Real-time video streaming in UI
- Autonomous AI actions without officer confirmation
- Gemini Live API voice (deferred post-hackathon)
- Production deployment hardening

---

## 7. Constraints

- **Platform:** Zoho Catalyst serverless (no GPU, no persistent processes)
- **Voice:** Web Speech API only (no Gemini Live in v1)
- **Data:** Synthetic crime dataset (Karnataka geography)
- **Time:** Hackathon deadline — July 2026

---

## 8. Risks

| Risk | Likelihood | Mitigation |
| ------ | ----------- | ------------ |
| Gemini API rate limit during demo | Medium | 15-key rotation + Groq fallback |
| Web Speech API Kannada accuracy | High | Hindi/English fallback + text input |
| Network failure during demo | Low | Cached responses for common queries |
| Catalyst cold start latency | Medium | Pre-warm functions before demo |
