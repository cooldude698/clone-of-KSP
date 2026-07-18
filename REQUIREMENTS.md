# DRISHTI ದೃಷ್ಟಿ — Requirements

---

## Functional Requirements

### FR-01: Voice Activation
- [ ] System SHALL detect two claps within 600ms and activate listening state
- [ ] System SHALL support push-to-talk via spacebar hold
- [ ] System SHALL support push-to-talk via on-screen button hold
- [ ] System SHALL provide immediate visual feedback on activation (orb state change)

### FR-02: Speech Recognition
- [ ] System SHALL transcribe officer speech in English (en-IN)
- [ ] System SHALL transcribe officer speech in Hindi (hi-IN)
- [ ] System SHALL transcribe officer speech in Kannada (kn-IN)
- [ ] System SHALL display live transcript while officer is speaking
- [ ] System SHALL fall back to text input if STT fails

### FR-03: AI Response
- [ ] System SHALL respond to queries about crime hotspots
- [ ] System SHALL respond to queries about FIR records
- [ ] System SHALL respond to queries about crime trends
- [ ] System SHALL respond to queries about repeat offenders
- [ ] System SHALL respond to queries about suspect networks
- [ ] System SHALL respond to ANPR plate lookup queries
- [ ] System SHALL respond to nearby camera queries
- [ ] System SHALL maintain conversation context across turns
- [ ] System SHALL return structured JSON for every response

### FR-04: Voice Output
- [ ] System SHALL speak `response_text` back to officer via TTS
- [ ] System SHALL match TTS language to detected query language
- [ ] System SHALL fall back to text-only display if TTS fails

### FR-05: Visualization
- [ ] System SHALL render hotspot map when `visualization.type = hotspot_map`
- [ ] System SHALL render bar chart when `visualization.type = bar_chart`
- [ ] System SHALL render line chart when `visualization.type = line_chart`
- [ ] System SHALL render network graph when `visualization.type = network_graph`
- [ ] System SHALL render stat cards when `visualization.type = stat_card`
- [ ] System SHALL render FIR list when `visualization.type = fir_list`

### FR-06: Proactive Suggestions
- [ ] System SHALL display follow-up query chips after every response
- [ ] System SHALL allow officer to tap a chip to send that query

### FR-07: Resilience
- [ ] System SHALL rotate through 15+ Gemini API keys on rate limit
- [ ] System SHALL fall back to Groq if all Gemini keys fail
- [ ] System SHALL return a graceful degraded response if all AI fails
- [ ] System SHALL never show a raw error to the officer

---

## Non-Functional Requirements

### NFR-01: Performance
- Voice-to-response round trip: < 3 seconds on good network
- Orb animation: 60fps constant
- Visualization render: < 500ms after response received

### NFR-02: Reliability
- API fallback chain ensures 99%+ response availability
- No single point of failure in AI layer

### NFR-03: Usability
- Zero training required for basic voice queries
- Interface operable by non-technical police officers
- All critical UI elements visible in dim control room lighting (dark theme)

### NFR-04: Multilingual
- UI labels in English
- Voice I/O in English, Hindi, Kannada
- Response text matches query language

### NFR-05: Security
- No real PII in synthetic dataset
- API keys in `.env`, never committed to git
- No autonomous actions — all AI outputs require officer confirmation

### NFR-06: Compatibility
- Tested on: Chrome 120+ (primary), Brave (secondary)
- Web Speech API requires Chrome/Brave — Firefox not supported
- Minimum screen: 1280x720

---

## Acceptance Criteria (Demo Day)

- [ ] Officer says "Whitefield hotspot" → DRISHTI responds with map in < 3s
- [ ] Double clap wakes DRISHTI from idle state
- [ ] Response spoken back in same language as query
- [ ] Follow-up chip tapped → next query sent automatically
- [ ] Orb visually changes state through full idle→listen→think→speak cycle
- [ ] All 12 Catalyst functions running simultaneously without error
