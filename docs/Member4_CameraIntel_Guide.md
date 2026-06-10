# DRISHTI — ದೃಷ್ಟಿ

## MEMBER 4: Camera Intel Commander
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:**
> You own the "wow factor." You write the visual math: the animated suspect geo-trails, the Chrono-criminal D3.js force graphs, and the live ANPR watchlist triggers.

---

## 1. Prerequisites & Branch Setup

```bash
git pull origin main
git checkout camera-intel

cd camera-intel
npm init -y
npm install @catalyst-platform/catalyst-node-sdk axios dotenv

# For the frontend viz components you'll build:
cd ../frontend
npm install react-leaflet leaflet d3 @types/d3 framer-motion
```

---

## 2. Step-by-Step Vibe Coding Guides

### Feature 1: The Camera Query API
**Where to put it:** `camera-intel/functions/cameras/index.js`

**Prompt for Claude:**
> "Write a Express-based Node.js Zoho Catalyst Serverless Function. Route `GET /api/cameras/nearby`.
> Read `lat`, `lng`, and `radius_meters` from the query string.
> Write a MySQL Haversine distance query to fetch all cameras from the `Cameras` table within that radius. Order the results by type (Safe City first) and then by distance. Add a calculated `relevance_score` to each result. Return valid JSON: `{ "total": int, "cameras": [ ... ] }`. Do not include conversational wrapper text."

### Feature 2: The Geo-Trail Simulator API (The Showstopper)
**Where to put it:** `camera-intel/functions/trail/index.js`

**Prompt for Claude:**
> "I need a Catalyst Severless Function POST route `/api/trail`. Expect a `crime_lat` and `crime_lng`. 
> 
> **Goal:** Simulate a criminal fleeing a crime scene and getting caught on cameras.
> 1. Query the Catalyst DB `Cameras` table for the nearest camera to the crime scene (First Sighting).
> 2. Then, iteratively generate 4 subsequent 'hops'. For each hop, artificially shift the lat/lng by 300-800m in a consistent direction vector to simulate driving down a road. Add 3 to 8 minutes to the timestamp. 
> 3. For each generated point, query the DB again for the *actual* closest camera to map the sighting to a real Bengaluru junction.
> 4. Generate a synthetic license plate ('KA-0X-XXXX') for the vehicle and confidence scores (degrading over time).
> 5. Output a JSON array defining the animated path. Strictly validate the logic so the hops form a contiguous path on a map, not random zig-zags."

### Feature 3: Chrono-Criminal D3.js Graph
**Where to put it:** `frontend/components/ChronoGraph.tsx`

**Prompt for Claude:**
> "Write a highly polished React component called `ChronoGraph.tsx` using `d3` and `TypeScript`.
> It receives props: `{ nodes: [], edges: [] }`. 
> 
> 1. Create a beautiful dark-mode D3 force-directed graph. Nodes represent criminals, Edges represent shared cases.
> 2. Add an HTML `<input type='range' />` at the bottom acting as a time slider from 2022 to 2026.
> 3. Implement D3 `.attr('opacity')` animation. Nodes and edges should only appear based on their `crime_date` relative to the slider value.
> 4. Color nodes red if their `risk_score` is high. Scale node radius based on `total_firs`. Add hover tooltips using D3."

### Feature 4: ANPR Cross-Match Event Trigger
**Where to put it:** `camera-intel/functions/anpr/index.js`

**Prompt for Claude:**
> "Write a Catalyst Serverless function to simulate an ANPR check returning 'wanted' hits.
> 1. POST `/api/anpr/check`. Accepts a `plate_number`.
> 2. Query Catalyst NoSQL `anpr_watchlist`. If a match returns `alert_active: true`, immediately write an alert into the SQL `Alerts` table.
> 3. Finally, trigger a Catalyst Signal Event (`catalyst.signal()`) to push a realtime notification to the frontend. Return the matched FIR details as JSON."

---

## 3. Testing Quality & Performance

**Test the Geo-Trail mapping visually:**
Before you submit your backend API, actually plug the JSON output into a basic map script. If your lat/lng sequence bounces back and forth across the city in 3 minutes, the demo will look stupid. **The vector trajectory simulation must look like realistic driving.**

**Test the ANPR Flow:**
```bash
curl -X POST http://localhost:3000/server/anpr/check \
-H "Content-Type: application/json" \
-d '{"plate_number":"KA-01-AB-1234", "camera_id":55}'
```

---

## 4. Git Workflow & Pull Request

```bash
git add .
git commit -m "feat(camera): built geo-trail simulation and D3 chrono graph"
git push origin camera-intel
```

Go to GitHub. Open a Pull Request from `camera-intel` merging into `main`. Ask Member 1 to perform a review.