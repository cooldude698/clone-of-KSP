# DRISHTI — ದೃಷ್ಟಿ
## Person 5: UI/UX & Experience Commander — Complete Step-by-Step Guide
**KSP × Hack2Skill Datathon 2026**
**| Aryan **
---

> **Your role in one sentence:**  
> You are what the judges see. Every second of the demo, they are looking at your work. A platform that works but looks like a student project loses. A platform that looks real wins — and yours will look real.

---

## READ THIS FIRST — Your Dependency Map

### What You Need From Others (in order)

```
FROM PERSON 1 (Vritika) — needed on YOUR Day 1:
  ✅ GitHub repo access — your branch is: frontend
  ✅ The .env file (you only need these keys):
       NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
       NEXT_PUBLIC_MAPS_TILE=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
       NEXT_PUBLIC_CATALYST_PROJECT_ID=xxxx
  ✅ Catalyst project access (dashboard login) — for Slate deployment later
  ✅ Catalyst Authentication test user credentials:
       inspector@drishti.ksp / [password]
       analyst@drishti.ksp / [password]
       policymaker@drishti.ksp / [password]
  → Message Vedesh Day 1: "Need .env, Slate access, and test user credentials"

FROM PERSON 2 (Swapnil) — needed in Week 2:
  ✅ camera-intel/API_CONTRACT.md (already on GitHub — describes chat request/response format)
  ✅ VoiceInput.tsx — React component for microphone input
  ✅ textToSpeech.ts — utility for reading responses aloud
  ✅ The live chat API URL (when their function is running)
  → Message Person 2 at start of Week 2: "Ready to integrate voice. Push components 
    to your branch. What's your chat API URL right now?"

FROM PERSON 4 (Vedesh) — needed in Week 4:
  ✅ ChronoCriminalGraph.tsx — the animated network graph component
  ✅ InvestigatorWall.tsx — the case board component
  ✅ GeoTrailCard.tsx — the animated suspect trail map
  → Message Person 4 at start of Week 4: "Ready to integrate your components.
    Which folder on your branch should I copy from?"
```

### What You Give to Others (in order)

```
TO PERSON 1 (Vritika) — end of Week 6:
  📤 Complete built frontend app (production build in /frontend/out or /.next)
  📤 List of all NEXT_PUBLIC_ environment variables that need to be set in Slate

TO WHOLE TEAM — end of Day 3:
  📤 The DRISHTI design system (colors, fonts, component styles)
  → Paste the color palette in WhatsApp so everyone knows the brand
  → They need it when writing demo content, README, and slides
```

### The Chat API Format You Must Know

Person 2 defined this. Read `camera-intel/API_CONTRACT.md` from GitHub.
The critical part you need to build the chat UI:

**You send:**
```json
{
  "query": "string — what the investigator typed or said",
  "language": "en or kn",
  "conversation_id": "string — unique ID for this conversation",
  "conversation_history": []
}
```

**You receive:**
```json
{
  "response_text": "The AI's answer — always present",
  "visualization": {
    "type": "heatmap | map_pins | bar_chart | line_chart | network_graph | timeline | geo_trail | none",
    "title": "Chart title string",
    "data": {}
  },
  "follow_up_suggestions": ["Q1?", "Q2?", "Q3?"],
  "conversation_id": "string"
}
```

Your chat UI renders `response_text` as text and passes `visualization` to the right card component.
If `visualization.type === "none"` — render text only.

---

## CRITICAL — No Hardcoding Rules for Person 5

| What | Wrong | Correct |
|------|-------|---------|
| Chat API URL | `"http://localhost:3000/api/chat"` in code | `process.env.NEXT_PUBLIC_API_BASE_URL + "/api/chat"` |
| Map tile URL | `"https://{s}.tile.openstreetmap.org/..."` in code | `process.env.NEXT_PUBLIC_MAPS_TILE` |
| Test user passwords | anywhere in code | NEVER — only in .env.local |
| Color hex codes | `"#0A1628"` inline in JSX | Tailwind config or CSS variables |
| Role permissions | `if (user === "admin")` | read from auth token/context |
| API base URL | `/api/chat` hardcoded | `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat` |

---

## YOUR COMPLETE TASK LIST (Overview)

```
Day 1-2  → Setup Next.js project, install all packages, verify dev server runs
Day 2    → Design system: color palette, typography, Tailwind config
Day 3-4  → Landing page + login screen
Week 1   → Main chat interface (three-panel shell with mock data)
Week 2   → Visualization cards (7 types: map, heatmap, bar, line, timeline, network, trail)
Week 2   → Integrate Person 2's VoiceInput.tsx + textToSpeech.ts
Week 2-3 → Role-based dashboards (Inspector, Analyst, Policymaker, Supervisor)
Week 3   → Connect chat to real Person 2 API (replace mock data)
Week 4   → Integrate Person 4's components (Chrono-graph, Digital Wall, Geo-Trail)
Week 4   → Alert notification panel (ANPR alerts from Person 4)
Week 4   → PDF download button (calls Person 2's export API)
Week 5   → Submission presentation deck (Canva, 12 slides)
Week 6   → Polish, accessibility, loading states, empty states
Week 7   → Catalyst Slate deployment
```

---

## DAY 1-2 — Setup Your Development Environment

### Step 1: Install Tools

**Check Node.js:**
```bash
node --version  # need v18+
```
If not installed: **https://nodejs.org** → LTS version → Install.

**Check npm:**
```bash
npm --version  # need v9+
```

**Install VS Code** (if not already): **https://code.visualstudio.com**

**Install these VS Code extensions** (makes coding much easier):
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier — Code formatter
- Auto Rename Tag

### Step 2: Clone Repository and Set Up Your Branch

```bash
git clone https://github.com/VEDESH_USERNAME/drishti-ksp.git
cd drishti-ksp
git checkout frontend
git branch
# Should show: * frontend
```

### Step 3: Create the Next.js App

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
# Answer prompts:
# Would you like to use src/ directory? → Yes
# Would you like to customize import alias? → No (press Enter)
```

Wait for it to finish (may take 2-3 minutes).

### Step 4: Install All Required Packages

```bash
npm install framer-motion
npm install recharts
npm install react-leaflet leaflet
npm install @types/leaflet
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tooltip
npm install d3 @types/d3
npm install uuid @types/uuid
```

Verify the dev server runs:
```bash
npm run dev
```
Open **http://localhost:3000** — you should see the default Next.js page. If yes — setup done.

### Step 5: Create Your .env.local File

In the `frontend/` folder, create `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_MAPS_TILE=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_CATALYST_PROJECT_ID=PASTE_FROM_VEDESH

# Test credentials (for local dev only — NEVER commit this file)
CATALYST_AUTH_DOMAIN=PASTE_FROM_VEDESH
```

`.env.local` is already in Next.js's default `.gitignore` — it will never go to GitHub.

### Step 6: Clean Up Default Next.js Files

Delete the default homepage content:
```bash
# Replace src/app/page.tsx with a simple redirect
# Replace src/app/globals.css with your design system styles
```
You will fill these in Day 2-3.

---

## DAY 2 — Design System (The Visual Identity of DRISHTI)

This is the foundation everything else builds on. Do this before any page.

### Step 1: Generate the Design System

Paste this into Claude, copy the complete output:
```
Create a complete design system for DRISHTI — the AI crime intelligence platform 
for Karnataka State Police.

Brand: authoritative, modern, trustworthy, intelligent. NOT playful. NOT generic.

OUTPUT PART 1: Tailwind CSS config extension (tailwind.config.ts colors section)
Include these semantic color tokens:
- navy: { 950: deepest bg, 900: card bg, 800: elevated card, 700: border, 600: muted border }
- accent: { 500: primary blue, 400: hover blue, 300: light blue }
- alert: { 500: danger red (for critical alerts), 400: warning orange, 300: caution yellow }
- success: { 500: green }
- kannada-saffron: { 500: Karnataka saffron orange (for KSP branding elements) }

Specific hex values to use:
navy-950: #060d1a
navy-900: #0a1628
navy-800: #0f2035
navy-700: #1a3550
navy-600: #243f60
accent-500: #1d6fbf
accent-400: #2d83d9
accent-300: #5fa8f0
alert-500: #c8372d
alert-400: #e05a3a
alert-300: #f0a848
success-500: #1a8a5a
kannada-saffron-500: #d4611c

OUTPUT PART 2: src/app/globals.css
CSS custom properties that map to the above colors.
Also include:
- Font imports: IBM Plex Sans (body) and IBM Plex Mono (for case numbers/data)
  from: https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap
- Base styles: body background = navy-950, text = white, font = IBM Plex Sans
- Scrollbar styling: thin, dark, minimal

OUTPUT PART 3: src/lib/utils.ts
The standard shadcn utility function (cn) using clsx + tailwind-merge.

OUTPUT PART 4: Brand guidelines text (for WhatsApp sharing with team)
A short paragraph listing:
- Primary bg: #0a1628
- Card bg: #0f2035
- Accent: #1d6fbf
- Alert: #c8372d
- Success: #1a8a5a
- Font: IBM Plex Sans
- Mono font (for case numbers): IBM Plex Mono
```

Apply the output:
1. Replace content of `tailwind.config.ts` colors section with Part 1
2. Replace content of `src/app/globals.css` with Part 2
3. Create `src/lib/utils.ts` with Part 3
4. Paste Part 4 in your team WhatsApp group (everyone needs these colors)

### Step 2: Create Reusable Base Components

Create `src/components/ui/` folder. Paste this into Claude:
```
Write these reusable TypeScript React components for DRISHTI using Tailwind CSS.
All components use the color variables: bg-navy-900, bg-navy-800, border-navy-700,
text-white, text-gray-400, accent-500, etc.
All are dark-theme only.

1. Card.tsx — a div wrapper with bg-navy-900 border border-navy-700/50 rounded-lg p-4
   Props: children, className (optional)

2. Badge.tsx — inline badge
   Props: children, variant ("default"|"critical"|"warning"|"success"|"info")
   Variants: default=bg-navy-700, critical=bg-alert-500/20 text-alert-500 border-alert-500/30,
   warning=bg-alert-400/20 text-alert-400, success=bg-success-500/20 text-success-500,
   info=bg-accent-500/20 text-accent-400

3. Button.tsx — button component
   Props: children, onClick, variant ("primary"|"secondary"|"ghost"|"danger"),
          size ("sm"|"md"), disabled, loading (shows spinner if true), className
   primary=bg-accent-500 hover:bg-accent-400 text-white
   secondary=bg-navy-800 border border-navy-700 hover:border-navy-600 text-white
   ghost=hover:bg-navy-800 text-gray-400 hover:text-white
   danger=bg-alert-500/20 border border-alert-500/30 text-alert-500 hover:bg-alert-500/30

4. Spinner.tsx — loading spinner (animated circle, 20px default)
   Props: size ("sm"|"md"|"lg"), className

5. EmptyState.tsx — empty state message
   Props: icon (lucide icon component), title, description

6. Skeleton.tsx — loading skeleton
   Props: className (for sizing)
   Animated shimmer effect using CSS animate-pulse bg-navy-800

Export each as default and as named export in an index.ts barrel file.
```

---

## DAY 3-4 — Landing Page and Login Screen

Create `src/app/page.tsx`:

Paste this into Claude:
```
Build the DRISHTI landing page and login screen as a Next.js TypeScript page.

File: src/app/page.tsx

IMPORTANT: This file uses 'use client' directive at the top.

LAYOUT:
Two-column layout (100vh, no scroll on desktop):

LEFT COLUMN (60% width, dark navy bg):
  Top section:
  - DRISHTI logo: large text "DRISHTI" in white 48px font (IBM Plex Sans)
    with small Kannada text "ದೃಷ್ಟಿ" beside it in gray
  - Tagline: "Intelligence that sees what others miss" — gray-400, 18px

  Stats section (center of left column):
  Three animated stat counters — use Framer Motion to count from 0 to final value:
  Animate with: useMotionValue + useSpring, or simple setInterval counter in useEffect
  Duration: 2 seconds, ease-out
  
  Stat 1: "5,35,815+" — label: "cameras registered in MCCTNS"
  Stat 2: "7,000+" — label: "AI-enabled Safe City cameras"
  Stat 3: "169+" — label: "smart junction feeds (BATCS)"
  
  Each stat: large white number (36px, IBM Plex Mono), label in gray-400 below
  Add a subtle top border on each stat box: border-t border-accent-500/30

  Bottom of left column:
  - KSP text logo: "Karnataka State Police" with small text "State Crime Records Bureau"
    in gray-500, 12px
  - "Powered by Catalyst by Zoho" badge — very small, bottom-left

RIGHT COLUMN (40% width, slightly lighter bg navy-900):
  Login card (centered vertically, max-width 400px, mx-auto):
  
  - Small "DRISHTI" text + lock icon at top of card
  - Heading: "Secure Access" — 20px white
  - Subtext: "Karnataka State Police Internal System" — 12px gray-500

  Form fields (NOT using HTML form tag — use divs with onClick handlers):
  1. Employee ID input (text) — placeholder "KSP Employee ID"
  2. Password input (password type) — placeholder "Password"
  3. Role select dropdown:
     Options: Inspector | Crime Analyst | Supervisor | Policymaker
  4. Sign In button (full width, primary variant)
  
  On Sign In click:
  1. Set loading state = true
  2. Validate: employee_id and password not empty, role selected
  3. Call Catalyst Authentication:
     Use fetch to POST to Catalyst auth endpoint
     For now: store the role in localStorage('drishti_role') and localStorage('drishti_user')
     Then router.push('/dashboard')
  4. If error: show error message below the button in text-alert-500

  Note on Catalyst Auth integration: 
  The actual Catalyst auth call is:
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: employeeId + '@drishti.ksp', password, role })
  })
  Create a Next.js API route at src/app/api/auth/login/route.ts that
  validates credentials against Catalyst Authentication and returns the role.

  Bottom: "Authorised access only | All activity is logged and monitored"
  in gray-600, 11px, centered

ANIMATIONS (Framer Motion):
  Left column: child elements stagger up from y:30, opacity:0 to y:0, opacity:1
  Delay between each: 0.15s
  Right column login card: same animation, starts after left column

NO HARDCODED PASSWORDS OR CREDENTIALS IN THIS FILE.
Role and credentials are submitted to the API route and validated server-side.
Use 'use client' at top. TypeScript. Tailwind CSS.
```

Create the auth API route `src/app/api/auth/login/route.ts`:
```
Write a Next.js API route for DRISHTI login.

File: src/app/api/auth/login/route.ts

POST handler that:
1. Reads { email, password, role } from request body
2. For the hackathon: validate against these test accounts 
   (read from environment variables, NOT hardcoded):
   process.env.TEST_INSPECTOR_EMAIL / process.env.TEST_INSPECTOR_PASSWORD
   etc.
   
   But actually — for simplicity in the hackathon: accept any of the Catalyst 
   test users created by Vedesh. Call the Catalyst Authentication REST API to 
   verify credentials.

3. If valid: return { success: true, user: { email, role, name: "Officer Name" }, 
   token: "catalyst_token" }
4. If invalid: return 401 { success: false, message: "Invalid credentials" }

The actual Catalyst Auth verification:
POST https://[project-id].catalyst.zoho.com/baas/v1/auth/login
Body: { email, password }
Headers: { Content-Type: application/json }
The CATALYST_PROJECT_ID comes from process.env.NEXT_PUBLIC_CATALYST_PROJECT_ID

Use NextResponse for responses. No hardcoded credentials.
```

Test login works:
```bash
npm run dev
# Open http://localhost:3000
# Enter any Employee ID, any password, select Inspector
# Should redirect to /dashboard (which doesn't exist yet — 404 is fine for now)
```

---

## WEEK 1 — Main Chat Interface (Three-Panel Layout)

This is the most important screen. Take your time.

### Step 1: Create the Dashboard Layout

Create `src/app/dashboard/layout.tsx`:
```
Write a Next.js TypeScript layout component for the DRISHTI dashboard.

File: src/app/dashboard/layout.tsx
Add 'use client' at the top.

This is the shell for all dashboard pages. It renders:
1. Left sidebar (fixed, 240px wide)
2. Main content area (flex-1, whatever is injected as children)

LEFT SIDEBAR:
- Background: bg-navy-900 border-r border-navy-700/50
- Logo section at top: "DRISHTI" text + "ದೃಷ್ಟಿ" small text
- Role badge below logo: reads role from localStorage('drishti_role')
  Show with appropriate icon: Inspector (Shield), Analyst (BarChart), 
  Supervisor (Users), Policymaker (Globe) — use lucide-react icons

Navigation items (vertical list):
Each item: icon + label, hover:bg-navy-800, rounded-lg, cursor-pointer
- Chat (MessageCircle icon) → /dashboard/chat
- Overview (LayoutDashboard) → /dashboard
- Camera Map (Camera) → /dashboard/cameras
- Network Graph (Network) → /dashboard/network
- Reports (FileText) → /dashboard/reports
Active item: bg-accent-500/20 text-accent-400 border-l-2 border-accent-500

Recent Conversations (below nav):
Small section heading "Recent" in text-gray-500 text-xs
Show 3-4 mock conversation items as clickable text (truncated to 30 chars)
These are placeholders — will be real data when Person 2's API is connected.

Bottom of sidebar:
- User name from localStorage
- Logout button (small, ghost variant) → clears localStorage → router.push('/')

Use Next.js usePathname hook to determine active nav item.
```

### Step 2: Build the Chat Page (Core Screen)

Create `src/app/dashboard/chat/page.tsx`:

Paste this into Claude:
```
Build the DRISHTI chat interface page. This is the most important screen.

File: src/app/dashboard/chat/page.tsx
Add 'use client' at top.

STATE:
- messages: array of { id, role ('user'|'assistant'), content, visualization, timestamp, 
  follow_up_suggestions, isLoading }
- inputText: string
- conversationId: string (generate with uuid on first load, store in useState)
- language: 'en' | 'kn'
- isLoading: boolean
- rightPanelOpen: boolean
- selectedFIR: object | null (for right panel)

LAYOUT (three columns, 100% viewport height, no outer scroll):

LEFT: Dashboard layout handles this (sidebar is in layout.tsx)

CENTER PANEL (flex-1, flex flex-col):
  
  Top bar (48px, border-b border-navy-700/50):
  - Left: conversation title (editable on click) or "New Conversation"
  - Right: language toggle (EN / ಕನ್ನಡ), fullscreen button, clear conversation button

  Messages area (flex-1, overflow-y-auto, p-4 space-y-4):
  Renders message list. Two types:
  
  USER MESSAGE:
  - Right-aligned
  - bg-accent-500/20 border border-accent-500/30 rounded-lg rounded-tr-sm
  - Small timestamp below, right-aligned
  - Text content
  
  ASSISTANT MESSAGE:
  - Left-aligned, max-w-[80%]
  - bg-navy-800 border border-navy-700/50 rounded-lg rounded-tl-sm
  - "DRISHTI" label in gray-500 text-xs above the bubble
  - Text content (prose, text-gray-200)
  - If message.visualization exists and type !== 'none':
    Render <VisualizationRouter visualization={message.visualization} /> below text
  - Follow-up suggestion chips below visualization:
    Horizontal scrollable row of small clickable buttons (ghost variant, text-xs)
    On click: set inputText to that suggestion
  - Timestamp below, left-aligned
  
  LOADING STATE MESSAGE (when isLoading = true):
  Show an assistant message bubble with animated typing indicator:
  Three dots (●●●) pulsing with staggered animation (0ms, 150ms, 300ms delay)
  
  EMPTY STATE (no messages yet):
  Center of screen: DRISHTI icon + "Ask me anything about Karnataka crime data"
  Four suggestion chips:
  "Show crime hotspots in Bengaluru"
  "Who are the top repeat offenders this year?"
  "Find cameras near Silk Board Junction"
  "What are the seasonal crime trends?"

  Bottom input bar (border-t border-navy-700/50, p-3):
  - VoiceInput component (left of input) — placeholder until Person 2 provides it
  - Text input (flex-1, bg-navy-800 border border-navy-700 rounded-lg px-4 py-2.5)
    placeholder: "Ask about crime data, locations, suspects..."
    onKeyDown: Enter key triggers send
  - Send button (right of input, icon button)
  
  SEND FUNCTION sendMessage(text):
    if loading or text empty: return
    1. Add user message to messages array
    2. Set isLoading = true, add loading message
    3. Call chat API:
       const response = await fetch(
         process.env.NEXT_PUBLIC_API_BASE_URL + '/api/chat',
         { method: 'POST', headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             query: text, language,
             conversation_id: conversationId,
             conversation_history: messages.slice(-10).map(m => ({ 
               role: m.role, content: m.content 
             }))
           })
         }
       )
       const data = await response.json()
    4. Remove loading message, add assistant message with data.response_text 
       and data.visualization and data.follow_up_suggestions
    5. Set isLoading = false
    6. Scroll to bottom of messages div
    
    On error: add assistant message with content = "Sorry, I couldn't connect to 
    the DRISHTI intelligence server. Please try again."

RIGHT PANEL (w-80, fixed right, slides in with Framer Motion):
  Only visible when rightPanelOpen = true
  Slide animation: x: from 320 to 0 when open
  Close button (X icon) top right
  Content: selectedFIR details, camera alerts, evidence list
  For now: show placeholder content "Select a case from chat to see details"
  "Download Report" button at bottom (PDF export — connected in Week 4)

TypeScript. Tailwind CSS. Framer Motion for message entrance animations.
```

### Step 3: Create the VisualizationRouter

Create `src/components/visualization/VisualizationRouter.tsx`:
```
Write a React TypeScript component VisualizationRouter.

Import: React, and all card components (you'll create them next)
Props: { visualization: { type: string, title: string, data: any } }

Renders the appropriate card based on type:
- 'heatmap' → <HeatmapCard data={visualization.data} title={visualization.title} />
- 'map_pins' → <MapPinsCard data={visualization.data} title={visualization.title} />
- 'bar_chart' → <BarChartCard data={visualization.data} title={visualization.title} />
- 'line_chart' → <LineChartCard data={visualization.data} title={visualization.title} />
- 'network_graph' → <NetworkGraphCard data={visualization.data} title={visualization.title} />
- 'timeline' → <TimelineCard data={visualization.data} title={visualization.title} />
- 'geo_trail' → <GeoTrailCard data={visualization.data} title={visualization.title} />
- 'none' or undefined → return null

Wrap each card in:
- An error boundary (try/catch in parent render — if card throws, show a small
  gray message "Visualization unavailable" instead of crashing the page)
- A Framer Motion div: initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}

Export default VisualizationRouter.
```

---

## WEEK 2 — Build All Seven Visualization Cards

### Important: Leaflet SSR Fix for Next.js

Leaflet uses `window` which doesn't exist during server-side rendering.
All Leaflet-based components MUST be imported dynamically.

Create `src/components/visualization/dynamic-imports.ts`:
```
Write a Next.js TypeScript file that dynamically imports all Leaflet-dependent 
visualization components to avoid SSR errors.

Use Next.js dynamic() with ssr: false for:
- HeatmapCard
- MapPinsCard
- GeoTrailCard

Pattern:
import dynamic from 'next/dynamic';
export const HeatmapCardDynamic = dynamic(
  () => import('./HeatmapCard'),
  { ssr: false, loading: () => <div className="h-64 bg-navy-800 rounded animate-pulse" /> }
);

Export all three as named exports.
Update VisualizationRouter to import the Dynamic versions of these three components.
```

### Card 1: MapPinsCard

Create `src/components/visualization/MapPinsCard.tsx`:
```
Write a React TypeScript MapPinsCard component for DRISHTI.

IMPORTANT: Add 'use client' at top. This must NOT be server-side rendered.

Props: { 
  data: { locations: Array<{lat: number, lng: number, label: string, 
                             type: string, description?: string, color?: string}> },
  title: string 
}

Renders a Leaflet map (react-leaflet MapContainer) at height 280px showing
colored pins for each location.

Setup (required for react-leaflet in Next.js — add this at top of component):
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix default icon path issue in Next.js:
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

Map settings:
- Tile layer URL: process.env.NEXT_PUBLIC_MAPS_TILE (OpenStreetMap)
- Center: average lat/lng of all locations (or 12.9716, 77.5946 if empty)
- Zoom: auto-fit bounds of all markers
- Attribution: show OpenStreetMap attribution

Pin colors:
- type 'crime_scene': red circle marker
- type 'camera': blue circle marker
- type 'suspect': orange circle marker
- type 'safe_zone': green circle marker
- default: gray

Use CircleMarker from react-leaflet. Radius 8px.
On each CircleMarker: Tooltip showing label and description.
Show a title bar above the map: dark bg, title text.

Handle empty data: if no locations, show "No location data available" 
centered in a gray placeholder div.

TypeScript. Export default.
```

### Card 2: HeatmapCard

Create `src/components/visualization/HeatmapCard.tsx`:
```
Write a React TypeScript HeatmapCard component.
IMPORTANT: 'use client' at top.

Props: { 
  data: { points: Array<{lat: number, lng: number, intensity: number}> },
  title: string 
}

Renders a Leaflet map with a heatmap layer.

For the heatmap layer, use leaflet-heat library.
Since leaflet-heat has no TypeScript declarations, add at top:
// @ts-ignore
import 'leaflet.heat';

Create the heatmap layer in a useEffect after map is mounted:
const map = useMap(); // or useMapInstance
const heat = (L as any).heatLayer(
  points.map(p => [p.lat, p.lng, p.intensity / 10]),
  { radius: 25, blur: 15, maxZoom: 17, max: 1.0,
    gradient: { 0.4: '#1d6fbf', 0.65: '#f0a848', 1: '#c8372d' } }
);
heat.addTo(map);

Install leaflet-heat: npm install leaflet.heat

Map center: Bengaluru center (12.9716, 77.5946), zoom 12
Show title bar above map.
Handle empty data gracefully.

Note: The HeatmapLayer must be in a child component of MapContainer to use useMap().
Structure: <MapContainer> → <TileLayer /> → <HeatmapLayer points={...} /> </MapContainer>
TypeScript. Export default.
```

### Card 3 & 4: BarChartCard and LineChartCard

Create `src/components/visualization/BarChartCard.tsx`:
```
Write a React TypeScript BarChartCard using Recharts.

Props: { 
  data: { labels: string[], values: number[], x_label?: string, y_label?: string,
          colors?: string[] },
  title: string 
}

Renders a Recharts BarChart:
- ResponsiveContainer width="100%" height={240}
- BarChart data: mapped from labels+values to [{name: label, value: N}]
- XAxis dataKey="name", tick fill="#9ca3af", fontSize 11
- YAxis tick fill="#9ca3af", fontSize 11
- CartesianGrid strokeDasharray="3 3" stroke="#1a3550" (navy-700)
- Bar dataKey="value" fill="#1d6fbf" radius={[4,4,0,0]}
  If colors provided: use Cell component to color each bar differently
- Tooltip: custom dark styled (bg-navy-800 border-navy-700 text-white)
- If x_label: XAxis label at bottom
- If y_label: YAxis label on left

Show title bar above chart.
Handle empty data.
Export default.
```

```
Write a React TypeScript LineChartCard using Recharts.

Props: { 
  data: { labels: string[], datasets: Array<{label: string, values: number[], color: string}> },
  title: string 
}

Renders a Recharts LineChart with multiple lines (one per dataset).
ResponsiveContainer height 240.
Each dataset becomes a Line: dataKey=label, stroke=dataset.color, 
strokeWidth 2, dot={false}
Legend at top if multiple datasets.
Same dark styling as BarChartCard.
Show title. Handle empty data.
Export default.
```

### Card 5: TimelineCard

Create `src/components/visualization/TimelineCard.tsx`:
```
Write a React TypeScript TimelineCard — no external libraries needed.

Props: { 
  data: { events: Array<{date: string, title: string, description: string,
                          type: string}> },
  title: string 
}

Renders a vertical timeline:
- Left edge: a vertical line (2px bg-navy-700)
- Each event: a circle dot on the line (colored by type), title right of dot, 
  date in gray below title, description in smaller gray text
- type colors: 
  'fir' → bg-accent-500
  'arrest' → bg-alert-500
  'chargsheet' → bg-alert-400
  'court' → bg-success-500
  default → bg-navy-600
- max-height: 300px, overflow-y: auto
- Animate each event with Framer Motion stagger

Show title bar. Handle empty data.
Export default.
```

### Card 6: NetworkGraphCard (Mini version)

Create `src/components/visualization/NetworkGraphCard.tsx`:
```
Write a React TypeScript NetworkGraphCard for inline display in chat messages.

Props: { 
  data: { nodes: Array<{id, label, type, size, color}>, 
          edges: Array<{source, target, label, color}> },
  title: string 
}

This is a SMALL version (height 280px) of the network graph for inline in chat.
It does NOT animate over time (that is the Chrono-graph from Person 4).
This just shows a static force-directed layout.

Use D3 force simulation:
const simulation = d3.forceSimulation(nodes)
  .force('link', d3.forceLink(edges).id(d => d.id).distance(60))
  .force('charge', d3.forceManyBody().strength(-150))
  .force('center', d3.forceCenter(width/2, height/2));

Render in SVG using useRef + useEffect.
Nodes: circles, radius = d.size || 8, fill = d.color
Labels: text below each circle, 10px, white
Edges: lines, stroke = e.color || '#243f60', stroke-width 1.5

Show title. Dark background. Handle empty/small data.
Export default.
```

### Card 7: GeoTrailCard (from Person 4)

Person 4 provides `GeoTrailCard.tsx`. You integrate it:

1. Copy `GeoTrailCard.tsx` from `camera-intel/components/` into `frontend/src/components/visualization/`
2. In `VisualizationRouter.tsx`, import it dynamically (ssr:false — it uses Leaflet)
3. Test it renders with sample trail data

If Person 4 hasn't delivered it yet — create a placeholder:
```
Write a temporary placeholder GeoTrailCard.tsx that:
- Shows "Camera trail visualization" as a heading
- Renders a Leaflet map with a simple polyline from trail data
- Each point shows a circle marker with the camera name as tooltip
- Animates the polyline drawing using L.polyline with setLatLngs in a useEffect interval

Props: { data: { trail: Array<{lat, lng, timestamp, camera_name, confidence}> }, title: string }
```
Replace with Person 4's version when they deliver it.

---

## WEEK 2 — Integrate Person 2's Voice Components

By Week 2, Person 2 should have pushed `VoiceInput.tsx` and `textToSpeech.ts` to their `ai-engine` branch.

### Step 1: Copy Person 2's Components

```bash
# From project root (not inside frontend/)
cp ai-engine/frontend/components/VoiceInput.tsx frontend/src/components/VoiceInput.tsx
cp ai-engine/frontend/utils/textToSpeech.ts frontend/src/utils/textToSpeech.ts
```

If Person 2 hasn't pushed yet — create a temporary placeholder:
```
Write a simple placeholder VoiceInput.tsx component that:
- Shows a microphone icon button (Mic from lucide-react)
- On click: uses browser's Web Speech API (webkitSpeechRecognition)
  with lang = language === 'en' ? 'en-IN' : 'kn-IN'
- Calls onTranscription(text, language) with the recognized speech
- Shows a pulsing animation while recording
- Props: { onTranscription: (text: string, lang: 'en'|'kn') => void, language: 'en'|'kn' }
```

### Step 2: Wire VoiceInput into the Chat Interface

In `chat/page.tsx`, replace the microphone button placeholder:

```
In the bottom input bar of the chat page, replace the placeholder mic button with:

<VoiceInput 
  language={language}
  onTranscription={(text, lang) => {
    setInputText(text);
    setLanguage(lang);
    // Auto-send after a short delay so user can see the transcription
    setTimeout(() => sendMessage(text), 800);
  }}
  onError={(err) => console.warn('Voice error:', err)}
/>

Import VoiceInput from '@/components/VoiceInput'
```

### Step 3: Wire Text-to-Speech into Chat

In `chat/page.tsx`, after receiving an AI response:

```
In the sendMessage function, after adding the assistant message:
import { speakText } from '@/utils/textToSpeech';

// Auto-read the response if language is Kannada
if (language === 'kn' && data.response_text) {
  speakText(data.response_text.substring(0, 300), 'kn');
}
// For English: only speak if user explicitly clicks the speaker icon on the message
```

Add a small speaker icon button on each assistant message. On click: `speakText(message.content, language)`.

---

## WEEK 2-3 — Role-Based Dashboards

Create `src/app/dashboard/page.tsx`:

Paste this into Claude:
```
Build the DRISHTI role-based overview dashboard page.

File: src/app/dashboard/page.tsx
Add 'use client' at top.

Read the current role from localStorage('drishti_role') on mount.

Render a different dashboard layout based on role:

INSPECTOR DASHBOARD:
  Top row: 3 KPI cards (using Card component):
  - "My Open Cases" (number from API — for now: show 12 as placeholder)
  - "Active Alerts" (number — show 3)
  - "Cases Resolved This Month" (show 7)
  
  Second row:
  - "My Cases" table: columns — Case No, Crime Type, Location, Date Filed, Status
    5 rows of realistic mock data using real Bengaluru area names
    Status badges using Badge component (open=info, closed=success, etc.)
  
  Third row:
  - "Active ANPR Alerts" — a panel showing 3 mock alert cards
    Each: plate number, camera location, matched FIR, time
    Red border on left edge of each card
  
  Fourth row:
  - "Quick Query" bar (same input as chat page) → on submit redirect to /dashboard/chat 
    with the query as a URL param

ANALYST DASHBOARD:
  Top row: city-wide stats (fetch from Person 3's analytics API if available,
  else show loading skeleton):
  - Total FIRs this year
  - Most reported crime type
  - Highest crime district
  - Charge-sheet rate
  
  Second row:
  - "Monthly Crime Trend" — LineChartCard with 12 months of data
    Fetch from: process.env.NEXT_PUBLIC_API_BASE_URL + '/api/analytics/trends?groupby=monthly'
    Show loading skeleton until data loads
  
  Third row:
  - "Top Crime Districts" — BarChartCard (district vs crime count)
  - "Under-Reporting Zones" — list cards with red warning badges
  
  Fourth row:
  - "Victim Vulnerability Summary" — BarChartCard showing age groups vs risk scores

SUPERVISOR DASHBOARD:
  - Team overview table (5 mock officer rows): name, open cases, closed cases, solve rate
  - "Cases Pending > 30 days" alert list (3 mock entries)
  - District crime ranking (ordered list, 1-10)

POLICYMAKER DASHBOARD:
  - 4 large KPI cards (prominent): YTD crimes, YoY change %, solved rate, at-risk districts
  - Large LineChart showing multi-year crime trend (3 years)
  - District crime heatmap summary (text-based ranking table)
  - Top 3 sociological risk factors (text cards with icons)

All API calls: use useEffect + useState, show Skeleton loading component while waiting.
Never crash if API fails — show empty state message instead.
TypeScript. Tailwind CSS. 
```

---

## WEEK 4 — Integrate Person 4's Components

### Step 1: Copy Person 4's Components

```bash
cp camera-intel/components/ChronoCriminalGraph.tsx frontend/src/components/ChronoCriminalGraph.tsx
cp camera-intel/components/InvestigatorWall.tsx frontend/src/components/InvestigatorWall.tsx
```

### Step 2: Create the Network Graph Page

Create `src/app/dashboard/network/page.tsx`:
```
Write a Next.js page for the DRISHTI criminal network visualization.

File: src/app/dashboard/network/page.tsx
'use client' at top.

The page:
1. On load: fetch data from Person 4's API:
   GET process.env.NEXT_PUBLIC_API_BASE_URL + '/api/network/graph-data?min_connections=2'
   
2. While loading: show a skeleton placeholder (dark gray animated box, full height)

3. When data loads: render ChronoCriminalGraph with the data
   Import it dynamically (ssr: false — it uses D3 which needs window):
   const ChronoCriminalGraph = dynamic(() => import('@/components/ChronoCriminalGraph'), { ssr: false })

4. Below the graph: a small stats row
   "X criminal nodes | Y connections | Spanning YYYY-YYYY"

5. When user clicks a node (onNodeClick callback):
   Show a slide-in panel on the right (Framer Motion x animation)
   In this panel: show InvestigatorWall for that accused person's connected cases
   Fetch case data from: GET /api/analytics/firs?accused_id=[id]

Page heading: "Criminal Network Analysis" with a subtitle 
"Drag the slider to see network evolution over time"

Tailwind. TypeScript.
```

### Step 3: Wire InvestigatorWall into Chat Right Panel

In `chat/page.tsx`, update the right panel:
```
Update the right panel in the chat page to show InvestigatorWall when a case is selected.

When the AI response mentions a specific FIR case number (parse response_text for 
pattern KAR/[A-Z]+/\d+/\d+):
1. Set selectedFIR to that case number
2. Fetch case details: GET /api/analytics/firs?case_number=[number]&limit=1
3. Fetch accused: GET /api/analytics/firs?case_number=[number] 
   (the response should include accused via the linked data)
4. Set rightPanelOpen = true

In the right panel, render:
<InvestigatorWall 
  fir={selectedFIR}
  accused={selectedAccused}
  victims={selectedVictims}
  related_firs={relatedFIRs}
  case_summary={aiCaseSummary}
  isLoading={isLoadingCase}
/>

Import InvestigatorWall normally (no dynamic needed — it uses Framer Motion not Leaflet):
import InvestigatorWall from '@/components/InvestigatorWall'
```

---

## WEEK 4 — Alert Notifications and PDF Download

### Step 1: ANPR Alert Notification

Create `src/components/AlertNotification.tsx`:
```
Write a React TypeScript component AlertNotification.

This component polls for ANPR alerts every 5 seconds and shows a notification.

State: alerts (array), hasNewAlert (boolean), isPanelOpen (boolean)

On mount: setInterval every 5000ms calling:
  fetch(process.env.NEXT_PUBLIC_API_BASE_URL + '/api/anpr/alerts')
  → { alerts: [...], count: N }
  
  If new alerts found (count > previous count):
    Set hasNewAlert = true
    Play a subtle alert sound (optional: use Web Audio API)

Render:
- A bell icon button in the top-right of the dashboard
- If hasNewAlert: red pulsing dot on the bell icon (CSS animate-ping)
- On click: toggle alert panel

Alert panel (absolute positioned, top-right, w-80):
  Dark card with list of alerts:
  Each alert: 
  - Red left border if severity='critical', orange if 'high'
  - Plate number in monospace font (IBM Plex Mono)
  - "spotted at [camera_name]" in gray
  - "Matches FIR [case_number]" in text-alert-500
  - Timestamp
  - "View Case" button → sets selectedFIR in parent and opens right panel

Clear dot when panel is opened.
Framer Motion for panel entrance: y:-10 opacity:0 → y:0 opacity:1

Export default AlertNotification.
```

Add `<AlertNotification />` to the dashboard layout's top bar.

### Step 2: PDF Download Button

In `chat/page.tsx`, wire the Download Report button in the right panel:
```
Add PDF download functionality to the chat page.

Create a downloadReport() async function:
1. Set downloadLoading = true
2. Call: POST process.env.NEXT_PUBLIC_API_BASE_URL + '/api/export/pdf'
   Body: {
     conversation_id: conversationId,
     investigator_name: localStorage.getItem('drishti_user') || 'KSP Officer',
     case_reference: selectedFIR?.case_number || conversationId,
     role: localStorage.getItem('drishti_role') || 'Inspector'
   }
3. Receive PDF blob:
   const blob = await response.blob();
4. Trigger browser download:
   const url = URL.createObjectURL(blob);
   const a = document.createElement('a');
   a.href = url;
   a.download = 'DRISHTI_Report_' + conversationId + '.pdf';
   a.click();
   URL.revokeObjectURL(url);
5. Set downloadLoading = false

Wire to the "Download Report" button in the right panel.
Show a loading spinner on the button while downloading.
```

---

## WEEK 5-6 — Submission Presentation Deck

The official submission requires uploading a PDF deck.

### Step 1: Download the Official Template

Download the official PPTX template:
**https://docs.google.com/presentation/d/1XWKQ3Hi3yKeDAQrHzQA4_vUF9pvC43Hjh7x7pr4jBpA/export/pptx**

Open it in Google Slides (upload to your Google Drive) or PowerPoint.

### Step 2: Generate Slide Content

Paste this into Claude to get the full slide content:
```
Write the complete slide-by-slide content for the DRISHTI hackathon presentation.
DRISHTI is an AI crime intelligence co-pilot for Karnataka State Police.

For each slide give: headline (≤8 words), 4-5 bullet points (≤12 words each), 
visual description for right side.

Slide 1 — Title
Headline: DRISHTI ದೃಷ್ಟಿ — KSP Crime Intelligence Co-Pilot
Team: [Team Name] | KSP × Hack2Skill Datathon 2026
Visual: DRISHTI logo on dark background

Slide 2 — The Problem
Headline: Karnataka's intelligence is siloed
Bullets: 5.35 lakh cameras not connected to crime database | investigators manually 
cross-reference three separate systems | MCCTNS, Safe City, BATCS: zero integration | 
reactive policing with no real-time intelligence layer
Visual: Three disconnected silos diagram with red X between them

Slide 3 — The Scale of Existing Infrastructure
Headline: The infrastructure exists — nothing connects it
Bullets: Safe City: 7,000+ AI cameras with ANPR + face recognition | 
MCCTNS: 5,35,815 cameras geotagged | BATCS: 169+ AI traffic junctions | 
SCRB crime database: thousands of FIRs, accused, victim records | 
zero cross-system intelligence layer
Visual: Bengaluru map with the three camera network types shown

Slide 4 — Our Solution
Headline: DRISHTI: the unification layer
Bullets: Conversational AI over crime database in Kannada and English | 
every query auto-generates the right visualization | connects to existing cameras 
via natural language | suspects traced across camera networks automatically | 
built on Catalyst by Zoho
Visual: DRISHTI chat interface screenshot

Slide 5 — Differentiation
Headline: Why nobody else is building this
Visual: Comparison table — DRISHTI vs generic chatbot: 
camera integration, live geo-trail, Kannada voice, chrono-graph, victim VVI

Slide 6 — Feature 1: Conversational AI
Headline: Ask in Kannada, get instant intelligence
Bullets: English and Kannada (voice and text) | 
context-aware follow-ups without repeating yourself | 
every answer includes the right chart or map automatically | 
PDF investigation report with one click | powered by Catalyst QuickML
Visual: Chat interface with inline heatmap

Slide 7 — Feature 2: Camera Integration
Headline: Connect what KSP already built
Bullets: query "find cameras near this crime" → MCCTNS registry responds instantly | 
ANPR watchlist from active FIRs synced to Safe City cameras | 
BATCS junction feeds for vehicle movement analysis | 
surveillance blind spot radar for patrol deployment
Visual: Map showing camera pins near a crime location

Slide 8 — Feature 3: Suspect Geo-Trail + ANPR Match
Headline: Watch the suspect move in real time
Bullets: crime reported → DRISHTI queries cameras in 500m radius automatically | 
suspect traced across BATCS junctions step by step | 
ANPR match fires alert linking vehicle to a second FIR | 
cross-jurisdiction case links discovered in seconds
Visual: Animated trail map with 5 camera hops

Slide 9 — Feature 4: Chrono-Criminal Graph
Headline: Watch gangs form — drag the timeline
Bullets: every accused in the database as an animated node | 
drag a time slider: watch gang connections emerge over months | 
high-risk offenders pulse red automatically | 
network formation visible that no spreadsheet can show
Visual: Chrono-graph screenshot with time slider at bottom

Slide 10 — Feature 5: Victim VVI + Under-Reporting Radar
Headline: Prevent crimes before they happen
Bullets: Victim Vulnerability Index: identifies at-risk populations by demographics | 
predicts where and when specific victim types face highest risk | 
Under-Reporting Radar: finds areas where crimes are systematically under-reported | 
evidence-based preventive patrol deployment
Visual: Two small charts — victim vulnerability heatmap + dark zones map

Slide 11 — Tech Stack
Headline: Built entirely on Catalyst by Zoho
Visual: Architecture diagram showing Catalyst services:
QuickML (AI/RAG) | Zia Services (Voice/OCR) | Data Store (crime DB) | 
NoSQL (conversations) | Slate (frontend) | AppSail (deployment) | 
SmartBrowz (PDF) | Authentication | Signals (alerts) | Stratus (files)

Slide 12 — Impact + Conclusion
Headline: DRISHTI makes existing investment actually work
Bullets: KSP has spent crores on Safe City and BATCS infrastructure | 
DRISHTI is the intelligence layer that activates it | 
investigators save hours per case via automated case linking | 
preventive deployment guided by data not intuition | 
built in 7 weeks — ready for pilot deployment
Final line: "Not a chatbot. Not a dashboard. The intelligence layer KSP needed."
```

### Step 3: Build the Deck in Canva

1. Go to **https://canva.com** → Create new presentation → 1920×1080
2. Choose a dark, minimal template
3. For each slide: use the content from Claude above
4. Color scheme: dark navy (#0a1628) backgrounds, white text, blue (#1d6fbf) accents
5. Add screenshots of the actual running app for slides 4, 6, 7, 8, 9, 10
6. Export as PDF → this is your submission file

---

## CATALYST SLATE DEPLOYMENT

When Vedesh asks you to deploy (Week 7):

### Step 1: Set Environment Variables in Catalyst Slate Console

1. Go to Catalyst Dashboard → **Slate**
2. Select your app (or create new from GitHub)
3. Go to **Environment Variables** in Slate settings
4. Add each `NEXT_PUBLIC_*` variable from your `.env.local`
5. Also add `CATALYST_AUTH_DOMAIN` and any server-side variables

### Step 2: Connect GitHub to Slate

1. In Slate → **Connect Repository**
2. Select GitHub → select `drishti-ksp` repo
3. Branch: `main` (Vedesh's final integrated branch)
4. Build command: `npm run build`
5. Output directory: `.next`
6. Click Deploy

Every time Vedesh merges to `main`, Slate auto-deploys.

### Step 3: Verify Deployment

1. Catalyst Slate gives you a URL like: `https://drishti-ksp-[id].catalystappsail.com`
2. Open it in browser
3. Login with test credentials
4. Run through the full demo flow

If something fails: check Slate deployment logs (Catalyst Dashboard → Slate → your deployment → Logs).

Docs reference: **https://docs.catalyst.zoho.com/en/slate/help/introduction**

---

## TESTING CHECKLIST

### Test 1 — Landing Page
```bash
npm run dev
# Open http://localhost:3000
```
- [ ] Stats counter animates from 0 to final values on page load
- [ ] Login form submits without errors
- [ ] Redirects to /dashboard after login
- [ ] Role badge in sidebar shows correctly

### Test 2 — Chat Interface (mock data)
- [ ] Empty state shows with 4 suggestion chips
- [ ] Typing a message and pressing Enter sends it
- [ ] Loading dots animation shows while "waiting" for response
- [ ] Assistant message renders with follow-up suggestion chips
- [ ] Clicking a suggestion pre-fills the input

### Test 3 — Visualization Cards
Create a test page `src/app/test-viz/page.tsx` with hardcoded test data for each card type:
- [ ] MapPinsCard: shows a Leaflet map with 3 pins (no SSR crash)
- [ ] HeatmapCard: shows a Bengaluru map with color intensity overlay
- [ ] BarChartCard: renders 6-month data bar chart
- [ ] LineChartCard: renders multi-line trend chart
- [ ] TimelineCard: shows 5 case events vertically
- [ ] NetworkGraphCard: shows nodes and edges (D3 renders)

### Test 4 — Chat with Real API (Week 3)
Connect to Person 2's running chat API:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001  # Person 2's server
```
- [ ] Type "Show crime hotspots in Bengaluru" → response includes heatmap visualization
- [ ] Type "ಬೆಂಗಳೂರಿನಲ್ಲಿ ಅಪರಾಧ" → response is in Kannada
- [ ] Follow-up question maintains context without repeating district

### Test 5 — Voice Input
Open in Chrome (only browser that supports Web Speech API reliably):
- [ ] Mic button visible and clickable
- [ ] Clicking mic, speaking, then clicking again stops recording
- [ ] Transcribed text appears in input field
- [ ] Language toggle switches between EN and ಕನ್ನಡ

### Test 6 — Role Dashboards
- [ ] Login as Inspector → inspector-specific cards render
- [ ] Login as Analyst → trend chart and under-reporting data show
- [ ] Login as Policymaker → KPI cards and YoY chart show
- [ ] None crash with empty API data (show skeleton or empty state)

### Test 7 — Person 4 Components (Week 4)
- [ ] /dashboard/network loads Chrono-graph without crash
- [ ] Play button starts the time animation
- [ ] Nodes appear and disappear as time slider moves
- [ ] Clicking a node opens InvestigatorWall in slide-in panel

### Test 8 — ANPR Alerts
- [ ] Alert bell icon in top bar
- [ ] When Person 4's API returns an alert, red dot appears on bell
- [ ] Clicking bell opens alert panel with details

### Test 9 — PDF Download
- [ ] "Download Report" button in right panel
- [ ] Clicking it triggers PDF download in browser
- [ ] Downloaded PDF opens and shows conversation content

### Test 10 — Non-Technical Review (Most Important)
Show the running app to someone not on the team (friend or family member).
Ask: "Does this look like a real government intelligence platform or a student project?"
- [ ] They say it looks professional and real
If they say it looks like a student project: improve the landing page and dashboard styling before submitting.

---

## QUICK REFERENCE — All Links You Need

| Resource | URL |
|---------|-----|
| Catalyst Slate docs | https://docs.catalyst.zoho.com/en/slate/help/introduction |
| Catalyst Slate deployment guide | https://docs.catalyst.zoho.com/en/slate/help/quick-start-guide |
| Next.js App Router docs | https://nextjs.org/docs/app |
| Tailwind CSS docs | https://tailwindcss.com/docs |
| Framer Motion docs | https://www.framer.com/motion/ |
| shadcn/ui components | https://ui.shadcn.com |
| react-leaflet docs | https://react-leaflet.js.org/docs/start-introduction |
| leaflet-heat plugin | https://github.com/Leaflet/Leaflet.heat |
| Recharts docs | https://recharts.org/en-US/api |
| Lucide icons | https://lucide.dev |
| D3.js docs | https://d3js.org |
| IBM Plex Sans Google Font | https://fonts.google.com/specimen/IBM+Plex+Sans |
| Canva (for presentation) | https://canva.com |
| Submission template download | https://docs.google.com/presentation/d/1XWKQ3Hi3yKeDAQrHzQA4_vUF9pvC43Hjh7x7pr4jBpA/export/pptx |
| Catalyst project dashboard | https://catalyst.zoho.com |
| Hackathon submission | https://hack2skill.com |

---

## WHEN YOU ARE STUCK — Exact Pattern to Follow

1. Copy the error + relevant code section
2. Paste into Claude with this context:

```
I am building the frontend for DRISHTI — an AI crime intelligence platform 
for Karnataka State Police. I am using:
- Next.js 14 with App Router and TypeScript
- Tailwind CSS for styling
- Framer Motion for animations
- react-leaflet for maps (Leaflet must NOT be server-side rendered)
- Recharts for charts
- D3.js for the force-directed graph
- Dark navy theme (bg: #0a1628, cards: #0f2035)

I am getting this error:
[PASTE FULL ERROR]

My code:
[PASTE RELEVANT COMPONENT]

Common issues I know about:
- Leaflet window errors: must use dynamic() with ssr: false
- D3 + React: must use useRef and useEffect, not direct DOM manipulation in render

Fix this step by step.
```

3. If a visualization card crashes: add a try/catch wrapper around its render and show an error fallback instead of crashing the whole page
4. For map issues: the most common error in Next.js is `window is not defined` — always fix with `dynamic(() => import(...), { ssr: false })`
5. Message Vedesh if stuck for more than 30 minutes

---

*DRISHTI — ದೃಷ್ಟಿ | Person 5 UI/UX Guide | KSP × Hack2Skill 2026*
