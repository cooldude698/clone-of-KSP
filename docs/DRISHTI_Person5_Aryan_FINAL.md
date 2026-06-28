# DRISHTI — ದೃಷ್ಟಿ
## Person 5: Aryan — UI/UX & Experience Commander (Final, Fully Corrected)
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:** You are what the judges see. Every backend function the rest of the team builds is invisible until it shows up correctly inside your interface.

---

## WHAT CHANGED FROM THE ORIGINAL PLAN — READ THIS FIRST

1. **The API path convention is different from what was originally assumed.** Catalyst Functions are served locally at `http://localhost:3000/server/<function-name>/` — confirmed directly from the team's own terminal output. Not `/api/chat` — it's `/server/chat/`. Every fetch call in this guide uses the corrected path.
2. **Voice is entirely yours now, fully self-contained.** Nobody is handing you a `VoiceInput.tsx` component to copy — Catalyst has no speech service at all, so you build it yourself directly against the browser's native Web Speech API. No backend call, no API key, nothing to wait on from Swapnil.
3. **There's a folder-location ambiguity you need to resolve with Vedesh/Vritika before building anything — don't skip this step.** When `catalyst init` set up Slate, it asked for an app name and Vedesh typed `nextjs`. There is *also* a separately-configured Slate app called `kspdatathon2026` (deployment name `DRISHTI-KSP`, live at `https://kspdatathon2026-rhvbcvlo.onslate.in`) that was already used to configure the Authentication redirect URL earlier. These might be the same thing referenced two different ways, or they might be two separate Slate apps — find out which before you write a single line of frontend code, or you risk building in the wrong folder, the same way the team already had to untangle a duplicate-folder mess once before.
4. **Windows shell variable bug — you will hit this too.** When running `catalyst serve` locally, the auto-generated Next.js dev script uses Unix-style `$ZC_SLATE_PORT`, which Windows `cmd.exe` doesn't understand. Fixed below in Day 1.
5. **Some API response field names use corrected, non-reserved-keyword names** — `case_status` (not `status`), `year_filed`/`month_filed` (not `year`/`month`), `alert_priority` (not `priority`), `camera_type` (not `type`). Use these exact field names wherever you destructure API responses.

---

## STEP ZERO — Resolve the Folder Ambiguity First

Before Day 1 setup, run this and paste the output to Vedesh/Vritika, or check it yourself if you have repo access:
```powershell
cat catalyst.json
```
Look for the Slate section. It will show a `source` or folder path tied to the app. **Whatever folder path is listed there is where your real Next.js app must live** — not a separate `frontend/` folder you create independently. If it says `nextjs`, that's your actual working directory going forward; rename it later if you want, but don't create a second, competing Next.js project elsewhere in the repo.

Confirm with the team: is the `nextjs` folder from `catalyst init` the same Slate app as `kspdatathon2026` / `DRISHTI-KSP` (the one with the real `onslate.in` domain already wired into Authentication)? If they're different apps, flag it — you want to be building inside the one that's actually connected to the working Authentication redirect URL, or that redirect will point at the wrong place later.

---

## YOUR DEPENDENCY MAP

### What You Need From Others

```
FROM VRITIKA/VEDESH — Day 1:
  ✅ Confirmation of which Slate folder is the real one (see Step Zero)
  ✅ Catalyst Authentication test user credentials
  ✅ .env values: NEXT_PUBLIC_API_BASE_URL, CATALYST_PROJECT_ID

FROM SWAPNIL — needed Week 1, even before his function is finished:
  ✅ functions/API_CONTRACT.md (exact request/response JSON for /server/chat/)
  ✅ A real Postman response example once his function is running

FROM AMAN — needed Week 3:
  ✅ functions/API_CONTRACT_ANALYTICS.md (6 analytics endpoints, /server/ paths)

FROM VEDESH (camera-intel) — needed Week 4:
  ✅ ChronoCriminalGraph.tsx, InvestigatorWall.tsx
  ✅ functions/API_CONTRACT_CAMERA.md
```

### What You Give to Others
```
You don't block anyone else. You're the last link in the chain — everything 
flows into your interface, nothing flows out of it to another team member's code.
```

---

## NO-HARDCODING RULES

| What | Wrong | Correct |
|---|---|---|
| API base URL | `"http://localhost:3000/api"` | `process.env.NEXT_PUBLIC_API_BASE_URL` |
| Function path | `/chat` | `/server/chat/` (note trailing slash, confirmed Catalyst convention) |
| Map tile URL | inline string | `process.env.NEXT_PUBLIC_MAPS_TILE` |
| Test credentials | anywhere in code | `.env.local` only, never committed |
| API field names | guessing `status`/`year`/`priority` | use the corrected `case_status`/`year_filed`/`month_filed`/`alert_priority`/`camera_type` |

Corrected `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/server
NEXT_PUBLIC_MAPS_TILE=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_CATALYST_PROJECT_ID=<from Vritika>
```

---

## YOUR COMPLETE TASK LIST

```
Day 1   → Resolve folder ambiguity, fix Windows port bug, install packages
Day 2   → Design system (colors, fonts, base components)
Day 3-4 → Landing page + login
Week 1  → Chat interface shell with mock data
Week 2  → All 7 visualization cards + your own VoiceInput.tsx (Web Speech API)
Week 2-3 → Role-based dashboards
Week 3  → Connect chat to Swapnil's real /server/chat/ endpoint
Week 4  → Integrate Vedesh's Chrono-Graph + Investigator's Wall
Week 4  → Alert notifications + PDF download button
Week 5  → Submission deck
Week 6  → Deploy via Slate, final polish
```

---

## DAY 1 — Setup + the Windows Port Fix

### Step 1: Confirm the Real Folder, Then Enter It
```powershell
cd nextjs
```
(or whatever Step Zero confirmed is the real path)

### Step 2: Install Packages
```powershell
npm install framer-motion recharts react-leaflet leaflet @types/leaflet
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install d3 @types/d3 uuid @types/uuid
npm install leaflet.heat
```

### Step 3: Fix the Windows Port Bug Before Your First `catalyst serve`

Open your `package.json` inside the Next.js folder and find the `"dev"` script. If it looks like:
```json
"dev": "next dev --port $ZC_SLATE_PORT"
```
This will fail on Windows with `'$ZC_SLATE_PORT' is not a non-negative number`. Fix it with `cross-env-shell`:
```powershell
npm install cross-env --save-dev
```
Change the script to:
```json
"dev": "cross-env-shell next dev --port %ZC_SLATE_PORT%"
```
`cross-env-shell` resolves environment variables correctly regardless of whether the underlying shell is Windows `cmd`, PowerShell, or bash — so this fix is also safe for any Mac/Linux teammates testing your frontend.

### Step 4: Test the Fix
```powershell
catalyst serve
```
You should see your Next.js app's URL printed without the port error this time.

---

## DAY 2 — Design System

### Step 1: Generate It

Paste this into Claude, copy the output:
```
Create a complete design system for DRISHTI, an AI crime intelligence platform 
for Karnataka State Police. Brand: authoritative, modern, trustworthy. Not playful.

OUTPUT 1: Tailwind config color extension —
navy-950 #060d1a, navy-900 #0a1628, navy-800 #0f2035, navy-700 #1a3550, 
navy-600 #243f60, accent-500 #1d6fbf, accent-400 #2d83d9, accent-300 #5fa8f0, 
alert-500 #c8372d, alert-400 #e05a3a, alert-300 #f0a848, success-500 #1a8a5a, 
kannada-saffron-500 #d4611c

OUTPUT 2: globals.css — import IBM Plex Sans (body) and IBM Plex Mono 
(case numbers/data) from Google Fonts. Base styles: navy-950 background, 
white text. Thin dark scrollbar.

OUTPUT 3: src/lib/utils.ts — standard shadcn cn() utility using clsx + tailwind-merge.

OUTPUT 4: short brand guidelines paragraph to paste in the team WhatsApp.
```
Apply each part to the matching file. Share Output 4 with the team immediately.

### Step 2: Base Components
Paste into Claude: Card.tsx, Badge.tsx (variants: default/critical/warning/success/info), Button.tsx (variants: primary/secondary/ghost/danger), Spinner.tsx, EmptyState.tsx, Skeleton.tsx — all dark-theme, Tailwind, using the color tokens above. (Same component specs as the original plan — these didn't need any correction.)

---

## DAY 3-4 — Landing Page + Login

Same overall design as originally planned (two-column layout, animated stat counters, login card) — paste this corrected version into Claude:
```
Build the DRISHTI landing page and login screen, Next.js TypeScript, 'use client'.

LEFT COLUMN: "DRISHTI" + "ದೃಷ್ಟಿ" heading, tagline "Intelligence that sees what 
others miss". Three Framer Motion count-up stats: "5,35,815+ cameras registered 
in MCCTNS", "7,000+ AI-enabled Safe City cameras", "169+ smart junction feeds 
(BATCS)". Bottom: "Karnataka State Police" + "Powered by Catalyst by Zoho".

RIGHT COLUMN: Login card — Employee ID, Password, Role dropdown 
(Inspector/Analyst/Supervisor/Policymaker), Sign In button.

On Sign In: 
1. setLoading(true)
2. Call Catalyst Authentication via a Next.js API route at 
   src/app/api/auth/login/route.ts (NOT a direct client-side call)
3. On success: store role in localStorage, router.push to your dashboard route
4. On error: show message in alert-500 text

Do NOT hardcode any test credentials anywhere in this file. NO HTML <form> tag — 
use onClick handlers. Tailwind, Framer Motion stagger entrance animation.
```

Create the auth API route:
```
Write a Next.js API route src/app/api/auth/login/route.ts.

POST handler: read { email, password, role } from body. Call Catalyst 
Authentication's login endpoint server-side (this avoids exposing project 
internals to the client). On success return { success: true, user: {email, role} }. 
On failure return 401 { success: false, message: "Invalid credentials" }.

No hardcoded credentials anywhere in this file.
```

---

## WEEK 1 — Chat Interface Shell

Same three-panel layout as the original plan (left nav from your dashboard layout, center chat, right slide-in panel) — this structure didn't need correction, only the API calls inside it do (covered in Week 3 below). Build it now with **mock data only** — don't wire the real API yet.

Paste the same dashboard layout and chat page prompts from the original plan into Claude exactly as before — empty state with 4 suggestion chips, message bubbles, loading dots, follow-up suggestion chips, right panel skeleton. Nothing here changes structurally.

---

## WEEK 2 — Visualization Cards + Your Own Voice Component

### The 7 Visualization Cards
Build all seven exactly as originally planned — MapPinsCard, HeatmapCard, BarChartCard, LineChartCard, TimelineCard, NetworkGraphCard, GeoTrailCard — using `dynamic(() => import(...), { ssr: false })` for the three Leaflet-based ones (MapPins, Heatmap, GeoTrail) to avoid the `window is not defined` SSR crash. None of these needed correction — the design was always SDK/library-correct, not Catalyst-dependent.

### Your Own VoiceInput.tsx — Build This Yourself, No Copying

Create `src/components/VoiceInput.tsx`:
```
Build a React TypeScript component VoiceInput.tsx for DRISHTI. This uses ONLY 
the browser's native Web Speech API — no backend call, no API key.

Props: { onTranscription: (text: string, language: 'en'|'kn') => void, 
onError: (error: string) => void, disabled?: boolean }

State: isRecording, selectedLanguage ('en'|'kn', default 'en'), isSupported

On mount: check if window.SpeechRecognition || window.webkitSpeechRecognition 
exists. If not, isSupported=false, show disabled mic with tooltip "Voice not 
supported — use Chrome".

Language toggle button: "EN" / "ಕನ್ನಡ".

Mic button: circle, 44px, pulsing red when recording (lucide-react Mic/MicOff icons).

Recognition setup:
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = selectedLanguage === 'en' ? 'en-IN' : 'kn-IN';
recognition.continuous = false;
recognition.interimResults = false;
recognition.onresult = (e) => onTranscription(e.results[0][0].transcript, selectedLanguage);
recognition.onerror = (e) => { onError('Voice error: ' + e.error); setIsRecording(false); };
recognition.onend = () => setIsRecording(false);

Status text below button: "Tap to speak" / "Listening..." / "Got it! ✓"
Cleanup recognition on unmount. Tailwind, dark-theme compatible. Export default.
```

Create `src/utils/textToSpeech.ts`:
```
Write a TypeScript utility for text-to-speech using ONLY the browser's native 
speechSynthesis API — no backend call.

export function speakText(text: string, language: 'en'|'kn'): void
  const utterance = new SpeechSynthesisUtterance(text.substring(0, 300));
  utterance.lang = language === 'en' ? 'en-IN' : 'kn-IN';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
  (wrap in try/catch, fail silently if unsupported)

export function stopSpeaking(): void — window.speechSynthesis.cancel()
export function isSpeaking(): boolean — return window.speechSynthesis.speaking
```

Wire both into your chat page: mic button calls `onTranscription` → sets input text → auto-sends. After receiving an assistant response, if `language === 'kn'`, call `speakText` automatically; for English, add a small speaker icon on each message that calls `speakText` on click.

---

## WEEK 2-3 — Role-Based Dashboards

Same structure as originally planned (Inspector/Analyst/Supervisor/Policymaker views) — build with mock data first, then in Week 3 wire the Analyst dashboard's trend chart to Aman's real `/server/trends/` endpoint. **When you do, use the corrected field names**: the trends response uses `case_status`, not `status`, if you're displaying FIR status anywhere; districts use `district_name`.

---

## WEEK 3 — Connect to Real Backend Functions (Corrected Paths)

### Step 1: Get Swapnil's Real Function Path
Confirm with him: his function package name is `chat`, so the real local URL is:
```
http://localhost:3000/server/chat/
```

### Step 2: Update Your Chat Send Function
```
Update the sendMessage function in your chat page to call the corrected path:

const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: text, language: selectedLanguage,
      conversation_id: conversationId,
      conversation_history: messages.slice(-10).map(m => ({ role: m.role, content: m.content }))
    })
  }
);
const data = await response.json();
```
Note the trailing slash on `/chat/` — Catalyst's serving convention includes it; omitting it may 404.

### Step 3: Same Correction for Every Other Endpoint You Call

| Feature | Corrected path |
|---|---|
| Chat | `/server/chat/` |
| Hotspots | `/server/hotspots/` |
| Trends | `/server/trends/` |
| Repeat offenders | `/server/repeat-offenders/` |
| Victim vulnerability | `/server/victim-vulnerability/` |
| Under-reporting | `/server/underreporting/` |
| Cameras nearby | `/server/cameras-nearby/` |
| Suspect trail | `/server/trail/` |
| ANPR check | `/server/anpr-check/` |
| Network graph data | `/server/network-graph-data/` |
| PDF export | `/server/export-pdf/` |

Every `fetch()` call anywhere in your app should be built as `${process.env.NEXT_PUBLIC_API_BASE_URL}/[name]/` using this table — not the original `/api/...` guess.

---

## WEEK 4 — Integrate Vedesh's Components + Alerts + PDF

### Step 1: Copy Components
```powershell
cp ../functions/../camera-intel/components/ChronoCriminalGraph.tsx src/components/
cp ../functions/../camera-intel/components/InvestigatorWall.tsx src/components/
```
(Adjust the relative path to wherever Vedesh's `camera-intel` branch actually places them — confirm with him.)

### Step 2: Network Graph Page
```
Build src/app/dashboard/network/page.tsx. On load, fetch 
`${NEXT_PUBLIC_API_BASE_URL}/network-graph-data/?min_connections=2`. Show a 
skeleton while loading. Render ChronoCriminalGraph dynamically 
(dynamic(() => import('@/components/ChronoCriminalGraph'), {ssr:false})) since 
it uses D3 + window. On node click, fetch case details from 
`${NEXT_PUBLIC_API_BASE_URL}/firs/?...` and show InvestigatorWall in a slide-in 
right panel.
```

### Step 3: Alert Notifications
```
Build AlertNotification.tsx. Poll `${NEXT_PUBLIC_API_BASE_URL}/anpr-check/alerts/` 
every 5 seconds (confirm this exact path with Vedesh — if his alerts route is 
named differently, adjust). Bell icon, red pulsing dot on new alerts, dropdown 
panel showing plate_number, camera location, matched fir_case_number.
```

### Step 4: PDF Download
```
Add a downloadReport() function calling POST `${NEXT_PUBLIC_API_BASE_URL}/export-pdf/` 
with { conversation_id, investigator_name, case_reference, role }. Receive blob, 
trigger browser download as DRISHTI_Report_[id].pdf.
```

---

## WEEK 5 — Submission Deck

Same as originally planned — download the template, generate the 12-slide content with Claude, build in Canva with real screenshots from your actual running app. No corrections needed here.

---

## WEEK 6 — Deployment

### Step 1: Confirm the Right Slate App One Final Time
Before deploying, re-confirm with Vedesh/Vritika which Slate app/deployment this connects to — the one tied to `https://kspdatathon2026-rhvbcvlo.onslate.in` should be the one judges actually see.

### Step 2: Set Environment Variables in Catalyst Console
Slate app settings → Environment Variables → add `NEXT_PUBLIC_API_BASE_URL` pointing to the **production** function base URL (Vritika/Vedesh will have this once functions are deployed — it won't be `localhost:3000` anymore).

### Step 3: Deploy
```powershell
catalyst deploy --only slate
```

### Step 4: Full Smoke Test on the Live URL
Open the real deployed link, log in, run through every feature — chat, voice, all 7 visualizations, network graph, alerts, PDF download. Anything that worked on `localhost` but fails live is almost always a missing or wrong environment variable.

---

## TESTING CHECKLIST

- [ ] `catalyst serve` runs without the `$ZC_SLATE_PORT` error
- [ ] Landing page stats count up, login redirects correctly
- [ ] Chat empty state + mock send/receive works before touching the real API
- [ ] All 7 visualization cards render with hardcoded test data, no SSR crashes
- [ ] VoiceInput works in Chrome — English and Kannada toggle, transcription appears
- [ ] Text-to-speech reads back a response when triggered
- [ ] Real `/server/chat/` call (with trailing slash) returns and renders correctly
- [ ] Every other `/server/...` endpoint called uses the corrected path table above
- [ ] Network graph page loads Vedesh's ChronoCriminalGraph without a `window is not defined` crash
- [ ] Alert bell shows a red dot when a real ANPR alert fires
- [ ] PDF download produces an actual readable PDF
- [ ] A non-technical friend says the app "looks like a real government tool"

---

## QUICK REFERENCE

| Resource | URL |
|---|---|
| Catalyst Slate docs | https://docs.catalyst.zoho.com/en/slate/help/introduction |
| Catalyst Functions serving convention | https://docs.catalyst.zoho.com/en/cloud-scale/help/functions/advanced-io-functions/ |
| cross-env / cross-env-shell | https://www.npmjs.com/package/cross-env |
| Web Speech API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |
| react-leaflet | https://react-leaflet.js.org/docs/start-introduction |
| Recharts | https://recharts.org/en-US/api |
| D3.js | https://d3js.org |
| Framer Motion | https://www.framer.com/motion/ |

---

*DRISHTI — ದೃಷ್ಟಿ | Person 5 (Aryan) UI/UX Guide — Final | KSP × Hack2Skill 2026*
