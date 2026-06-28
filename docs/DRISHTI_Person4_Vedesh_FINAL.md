# DRISHTI — ದೃಷ್ಟಿ
## Person 4: Vedesh — Camera Intelligence & Network Commander (Final, Fully Corrected)
**Also: Team Lead & GitHub Repository Owner**
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:** You build the features that make judges gasp — the suspect geo-trail, the ANPR cross-match alert, and the Chrono-Criminal Graph — while also carrying the one piece of infrastructure responsibility nobody else on the team can do: you're the actual owner of the GitHub repository.

---

## YOUR DUAL ROLE — READ THIS FIRST

You have two jobs running in parallel. Don't let the second one get lost under the first.

**Job 1 — Camera Intelligence (the bulk of this guide):** real OSM camera data, the suspect geo-trail, ANPR watchlist matching, the criminal network graph, and the two most visually impressive frontend components in the whole platform.

**Job 2 — Repository Owner.** The repo lives at `github.com/vedeshskhatri/kspdatathon2026` — under your account, not Vritika's. This means a few admin actions can **only** be done by you, even though Vritika's guide (as Captain) assumes she's the one driving GitHub day-to-day:

- **Adding/removing collaborators** — GitHub only lets the account owner (or someone you explicitly grant Admin role to) manage this under **Settings → Collaborators**. If Vritika needs to add or remove anyone, she has to ask you to click the button, or you grant her Admin access once so she can do it herself going forward.
- **Branch protection rules** (if the team wants to require PR review before merging to `main`) — also owner/admin-only.
- **Repository visibility, transfer, deletion** — owner-only, full stop.
- **GitHub Pages / repo-level settings changes** — owner-only.

**The practical fix, do this once, early:** Go to **Settings → Collaborators → [Vritika's username] → change role to Admin**. This gives her the same day-to-day GitHub powers you have, so she can run her Captain duties without needing you to personally click things while you're deep in camera/network code. You stay the formal owner (matters for billing/ownership transfer only), she gets practical control.

---

## WHAT CHANGED FROM THE ORIGINAL PLAN

1. **No database host/port/username/password exist.** Camera data loads the same way Aman's data does: generate a CSV locally, then `catalyst ds:import cameras.csv --table Cameras`. No MySQL connection anywhere.
2. **Row limit: Cameras gets a ~2,000 row budget**, confirmed with Aman so your combined totals stay under the project-wide 25,000 cap.
3. **Reserved keyword check needed.** Aman's tables already hit this twice (`month`, `priority`). Your `Cameras` table has a column literally named `type` — if Catalyst rejects it the same way, rename to `camera_type`. Check this before generating any CSV data so you don't have to regenerate.
4. **Your backend functions live in ONE shared top-level `functions/` folder** at the project root, next to `catalyst.json` — confirmed from real terminal output and Catalyst's own docs. Not nested inside a `camera-intel/` subfolder. Your `cameras-nearby` function sits right alongside Swapnil's `chat` and Aman's `hotspots` — all siblings in that one folder.
5. **ANPR Watchlist joins use `alert_priority`, not `priority`** — Aman already built this table with the corrected name. Make sure your functions read/write that exact column name.
6. **Joins use natural keys** (`plate_number`, `fir_case_number`, `full_name`) — not numeric foreign keys — same pattern as Aman's functions, since CSV-imported rows don't get predictable IDs.

---

## YOUR DEPENDENCY MAP

### What You Need From Others

```
FROM VRITIKA — Day 1:
  ✅ Confirmation Cameras table + columns exist (check the "type" column for the 
     reserved-keyword issue before you generate data)
  ✅ catalyst.json / .catalystrc working at the project root

FROM AMAN — Week 2:
  ✅ Confirmation FIRs and ANPR_Watchlist tables are loaded with real data 
     (your ANPR-check function reads plates from his watchlist)
  ✅ His row budget total, so your ~2,000 Cameras rows stay under the shared 
     25,000/project ceiling together

FROM NOBODY ELSE for the geo-trail, network graph, or frontend components — 
those only depend on your own Cameras table being loaded.
```

### What You Give to Others

```
TO SWAPNIL — share by end of Week 3:
  📤 functions/API_CONTRACT_CAMERA.md — exact JSON formats for cameras-nearby, 
     trail, and anpr-check
  📤 Real Postman examples

TO PERSON 5 (UI/UX) — share by end of Week 4:
  📤 ChronoCriminalGraph.tsx
  📤 InvestigatorWall.tsx
  📤 A working network-graph-data function URL for her to fetch from

TO THE WHOLE TEAM — ongoing, since you own the repo:
  📤 Collaborator access, branch protection decisions, repo-level settings
```

### Write This Contract by End of Week 3 — Save as `functions/API_CONTRACT_CAMERA.md`

```
GET /server/cameras-nearby/
  params: lat, lng, radius_meters (default 500), timestamp (optional)
  returns: { cameras: [{camera_id, external_id, name, camera_type, lat, lng, 
            distance_meters, has_anpr, has_face_recog, junction_name, 
            relevance_score, footage_window}], total_found, anpr_capable_count, 
            search_radius_meters }

POST /server/trail/
  body: { crime_lat, crime_lng, crime_timestamp, vehicle_type }
  returns: { trail: [{hop, camera_id, camera_name, lat, lng, timestamp, 
            plate_detected, confidence, sighting_type, distance_from_crime_km}], 
            total_hops, trail_status, last_known_location, total_distance_km }

POST /server/anpr-check/
  body: { plate_number, camera_id, camera_name, lat, lng, timestamp }
  returns (if match): { alert: true, severity, fir_case_number, original_crime, 
            crime_date, district, instructions }
  returns (if no match): { alert: false, plate_number }

GET /server/network-graph-data/
  params: min_connections (default 2), months_back (default 36)
  returns: { nodes: [...], edges: [...], date_range: {min, max} }
```

---

## YOUR COMPLETE TASK LIST

```
Day 1   → Repo owner task: grant Vritika Admin access on GitHub
Day 1   → Setup: clone repo, confirm Cameras table + "type" column name
Day 2   → Generate cameras.csv from real Overpass data + synthetic overlay
Day 2   → catalyst ds:import cameras.csv --table Cameras
Day 3   → Set up function folders (catalyst function:create × 4 backend functions)
Day 4   → Build cameras-nearby function
Week 2  → Build suspect geo-trail function
Week 2  → Build ANPR watchlist-check + watchlist-build functions (needs Aman's data)
Week 3  → Build network-graph-data function
Week 3  → Build ChronoCriminalGraph.tsx component
Week 4  → Build InvestigatorWall.tsx component
Week 4  → Build blind-spots function (optional, time permitting)
Week 4  → Hand off API contract + components to Swapnil and Person 5
```

---

## DAY 1 — Repo Owner Task First

```
GitHub → your repo → Settings → Collaborators → find Vritika → 
Change role → Admin
```
Do this before anything else today — it removes yourself as a bottleneck for the rest of the project.

---

## DAY 1 — Camera Setup

### Step 1: Clone and Confirm
```powershell
git clone https://github.com/vedeshskhatri/kspdatathon2026.git
cd kspdatathon2026
git checkout camera-intel
catalyst serve
```

### Step 2: Check the Cameras Table for Reserved Keywords
Catalyst Dashboard → Data Store → **Cameras** → Schema View. Look at the `type` column specifically. If it's already there with no error, leave it — but flag this to whoever's adding columns: if you ever need to edit/recreate it and Catalyst rejects "type," rename to `camera_type` and update every reference below accordingly. The script and functions in this guide already use `camera_type` to be safe — if your table currently has it named just `type`, either rename the column now or change the script's output header to match.

### Step 3: Confirm Your Row Budget With Aman
Message him: *"Confirming — Cameras gets ~2,000 rows, your tables total ~13,755. That's ~15,755 combined, well under 25,000. Good to go?"*

---

## NO-HARDCODING RULES

| What | Wrong | Correct |
|---|---|---|
| Overpass API URL | `"https://overpass-api.de/..."` in code | `process.env.OVERPASS_API_URL` |
| Bengaluru bounds | `12.85, 13.05` in code | values from a config JSON |
| Trail hop distances | `600` in code | config file values |
| ANPR plate regex | inline magic string repeated everywhere | one config constant, imported |

`.env` additions:
```
OVERPASS_API_URL=https://overpass-api.de/api/interpreter
ANALYTICS_API_URL=http://localhost:3000/server/firs
```

---

## DAY 2 — Generate Cameras CSV From Real OSM Data

### Step 1: Confirm Your Overpass File Exists
```powershell
dir crime-database/raw-data/traffic-signals
```
You should already have `bengaluru_signals.geojson` from the Overpass Turbo export done earlier in the project (the real traffic signal junction coordinates query: `traffic_signals in Bengaluru`).

### Step 2: Generate the Cameras CSV

Paste this into Claude:
```
Write a Python script generate-cameras-csv.py for DRISHTI.

This script ONLY reads a local GeoJSON file and writes a local CSV. No database 
connection of any kind.

INPUT: crime-database/raw-data/traffic-signals/bengaluru_signals.geojson
(standard Overpass GeoJSON: a "features" array, each with geometry.coordinates 
as [lng, lat], and a properties object that may contain a "name" tag)

OUTPUT: crime-database/generated-csv/cameras.csv
Target: exactly 2000 rows total (confirmed row budget for the dev environment's 
5000/table, 25000/project limits)

IMPORTANT — use "camera_type" as the column name, NOT "type" (Catalyst rejects 
"type" as a reserved keyword in some configurations — using camera_type avoids 
the risk entirely).

Columns: external_id, name, camera_type, lat, lng, district_name, junction_name, 
has_anpr, has_face_recog, is_active, coverage_radius_m

DISTRIBUTION across the 2000 target rows:
- 400 rows: camera_type="BATCS" — generated from real OSM traffic signal points 
  in the GeoJSON. Add a tiny random offset (±0.0001 degrees, under 10m) so the 
  camera isn't exactly on the signal node. has_anpr=True, has_face_recog=False, 
  coverage_radius_m=80. If the GeoJSON has fewer than 400 real signal points, 
  use as many as exist and note the actual count.
- 300 rows: camera_type="Safe_City" — placed near clusters of 2+ BATCS points 
  within 300m of each other (midpoint + small random offset). has_anpr=True, 
  has_face_recog=True, coverage_radius_m=50. If clustering doesn't yield 300, 
  fill the remainder with random points near these known major Bengaluru 
  junction coordinates: Silk Board (12.9172,77.6211), Marathahalli Bridge 
  (12.9591,77.7009), Hebbal Flyover (13.0358,77.5970), KR Puram (13.0070,77.6960), 
  Whitefield Signal (12.9698,77.7499), Koramangala 5th Block (12.9340,77.6240), 
  MG Road (12.9756,77.6099), Indiranagar 100ft Road (12.9784,77.6408), 
  HSR Layout (12.9116,77.6370), Electronic City Toll (12.8399,77.6769).
- 1300 rows: camera_type rotating through "MCCTNS_Private" (50%), "MCCTNS_RWA" 
  (30%), "MCCTNS_Commercial" (20%). has_anpr=False, has_face_recog=False, 
  coverage_radius_m=20. Distribute across these zone centers with random offset 
  up to 2km: Jayanagar (12.9282,77.5838), JP Nagar (12.9091,77.5847), 
  Rajajinagar (12.9985,77.5554), BTM Layout (12.9166,77.6101), 
  Banashankari (12.9263,77.5460), Commercial Street (12.9831,77.6100), 
  Malleshwaram (13.0035,77.5710), Whitefield (12.9698,77.7499), 
  Electronic City (12.8398,77.6768), Manyata Tech Park (13.0475,77.6219)

For all rows: external_id = camera_type prefix + zero-padded sequential number 
(e.g. "BATCS-0001", "SC-0001", "MC-0001"). junction_name: nearest known major 
junction name if within 800m, else null. is_active = True for 95% of rows.

district_name: derive from lat/lng using simple bounding boxes:
lat > 13.0 → "North Bengaluru"; lat 12.97-13.0 & lng 77.55-77.65 → "Central Bengaluru"; 
lat 12.93-12.97 & lng 77.60-77.70 → "East Bengaluru"; lat 12.90-12.93 → "South Bengaluru"; 
lng > 77.70 → "Whitefield/East Bengaluru"; else → "Bengaluru Urban"

Print final counts by camera_type and confirm zero rows fall outside lat 12.85-13.05, 
lng 77.50-77.70.
```

Run it:
```powershell
python3 data-scripts/generate-cameras-csv.py
```

### Step 3: Import
```powershell
catalyst ds:import crime-database/generated-csv/cameras.csv --table Cameras
```
Type `y` for the report, check for skipped rows. Verify in ZCQL Console:
```sql
SELECT camera_type, COUNT(*) FROM Cameras GROUP BY camera_type
SELECT COUNT(*) FROM Cameras WHERE lat < 12.85 OR lat > 13.05
```
Second query must return 0.

---

## DAY 3 — Set Up Your Function Folders

All in the shared root-level `functions/` folder:
```powershell
catalyst function:create
```
Repeat for these package names, each AdvancedIO, Node.js, `index.js` entry, install deps Yes:
```
cameras-nearby
trail
anpr-check
network-graph-data
```
For each:
```powershell
cd functions/cameras-nearby
npm install zcatalyst-sdk-node dotenv axios
```
(repeat for the other three)

---

## DAY 4 — Build Cameras-Nearby Function

`functions/cameras-nearby/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/cameras-nearby/
Query params: lat, lng, radius_meters (default 500), timestamp (optional)

STEP 1: Validate lat/lng are numbers within Bengaluru bounds (12.85-13.05, 
77.50-77.70). Return 400 if not.

STEP 2: Convert radius to degree offsets:
latOffset = radius_meters / 111000
lngOffset = radius_meters / (111000 * Math.cos(lat * Math.PI/180))

STEP 3: ZCQL bounding-box query (5 WHERE conditions exactly — the max allowed):
SELECT camera_id, external_id, name, camera_type, lat, lng, district_name, 
junction_name, has_anpr, has_face_recog, coverage_radius_m
FROM Cameras
WHERE lat >= [lat-latOffset] AND lat <= [lat+latOffset]
AND lng >= [lng-lngOffset] AND lng <= [lng+lngOffset]
AND is_active = true
LIMIT 200

STEP 4: Calculate exact Haversine distance in JavaScript for each result, filter 
to keep only those within the actual radius_meters.

STEP 5: relevance_score = 100 - floor(distance/100)*10 + (has_anpr?20:0) + 
(has_face_recog?15:0) + (camera_type==='Safe_City'?10:0), clamped 0-100.

STEP 6: Sort by relevance_score descending.

STEP 7: If timestamp provided, build footage_window = ±30 minutes around it.

Return: { cameras: [...], total_found, anpr_capable_count: count where 
has_anpr=true, search_radius_meters: radius_meters }

CORS headers, error handling, export as module.exports = async (req, res) => {...}
```

Test:
```powershell
catalyst serve
curl "http://localhost:3000/server/cameras-nearby/?lat=12.9172&lng=77.6211&radius_meters=500"
```

---

## WEEK 2 — Suspect Geo-Trail Function

`functions/trail/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: POST /server/trail/
Body: { crime_lat, crime_lng, crime_timestamp, vehicle_type }

STEP 1: Find the nearest ANPR-capable camera within 300m of the crime scene 
using the same bounding-box + Haversine pattern as cameras-nearby. This is the 
first sighting point.

STEP 2: Generate up to 6 hops:
  - direction: random 0-360 on hop 1, then previous_direction ± 25 degrees 
    for subsequent hops (simulates turning, not teleporting)
  - hop_distance_m: random between 300-900
  - Calculate next approximate lat/lng using the direction and distance 
    (standard meters-to-degrees conversion)
  - Find the nearest real camera within 400m of that point using the bounding-box 
    query. If none found, stop the loop and set trail_status = 'lost'.
  - Time gap per hop: random 180-480 seconds, added to a running timestamp 
    starting from crime_timestamp
  - Plate: generate once on hop 1 if that camera has_anpr (format KA-NN-A-NNNN), 
    reuse the same plate for every subsequent hop
  - Confidence: hops 1-2 → random 85-95, hops 3+ → random 55-80
  - sighting_type: 'ANPR' if camera has_anpr, else 'Visual'

STEP 3: If all 6 hops complete, trail_status = 'active'.

STEP 4: Calculate total_distance_km (sum of hop distances) and last_known_location 
(last hop's camera lat/lng/district_name/camera_name).

Return: { trail: [...], total_hops, trail_status, last_known_location, 
total_distance_km, duration_minutes }

CORS headers, error handling, export pattern as above.
```

---

## WEEK 2 — ANPR Functions (Needs Aman's Data Loaded First)

Confirm with Aman that `ANPR_Watchlist` has real rows before testing this.

`functions/anpr-check/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function handling two routes.

ROUTE 1: POST /server/anpr-check/
Body: { plate_number, camera_id, camera_name, lat, lng, timestamp }

STEP 1: Validate plate format with regex KA-\d{2}-[A-Z]{1,2}-\d{4}. If invalid, 
return { alert: false, plate_number, reason: "Invalid format" }

STEP 2: ZCQL: SELECT plate_number, fir_case_number, crime_type, alert_priority 
FROM ANPR_Watchlist WHERE plate_number = '[plate]' AND alert_active = true LIMIT 1
(note the column is "alert_priority", not "priority" — Aman's table already 
uses the corrected name)

STEP 3: If no match: return { alert: false, plate_number }

STEP 4: If match: fetch the linked FIR by case_number:
SELECT crime_type_code, district_name, date_filed FROM FIRs 
WHERE case_number = '[fir_case_number]' LIMIT 1

STEP 5: Insert into Alerts table: alert_type='anpr_match', camera_external_id, 
plate_number, lat, lng, matched_fir_case_number, description, 
alert_severity (use 'critical' if watchlist alert_priority='high' else 'high'), 
acknowledged=false

STEP 6: Build instructions string based on crime_type_code (vehicle_theft → 
"Vehicle possibly stolen, do not approach alone, contact [district] PS"; 
robbery/chain_snatching → "Approach with backup, contact [district] PS"; 
default → "Vehicle linked to FIR [case_number], contact [district] PS")

Return: { alert: true, severity, fir_case_number, original_crime: crime_type_code, 
crime_date: date_filed, district, instructions }

ROUTE 2: POST /server/anpr-check/build-watchlist (one-time setup call)
STEP 1: ZCQL: SELECT case_number, description FROM FIRs WHERE crime_type_code = 
'vehicle_theft' LIMIT 1000 (run separately for 'robbery' and 'chain_snatching' too, 
merge results in JavaScript — ZCQL doesn't reliably support IN() with multiple values)
STEP 2: Extract plates from description using the regex, INSERT into 
ANPR_Watchlist for each unique plate not already there (alert_active=true, 
alert_priority='medium' by default)
Return: { plates_added, total_watchlist_checked }

CORS headers, error handling for both routes, export pattern as above.
```

Test the watchlist builder once, then test a real match:
```powershell
curl -X POST http://localhost:3000/server/anpr-check/build-watchlist
# then grab a real plate from ZCQL: SELECT plate_number FROM ANPR_Watchlist LIMIT 1
curl -X POST http://localhost:3000/server/anpr-check/ -H "Content-Type: application/json" -d "{\"plate_number\":\"<real plate>\",\"camera_id\":1,\"lat\":12.93,\"lng\":77.62,\"timestamp\":\"2026-06-01T14:00:00Z\"}"
```

---

## WEEK 3 — Network Graph Data Function

`functions/network-graph-data/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/network-graph-data/
Query params: min_connections (default 2), months_back (default 36)

NOTE: joins use full_name and case_number as natural keys, not numeric IDs.

STEP 1: SELECT accused_full_name, COUNT(*) as fir_count FROM FIR_Accused 
GROUP BY accused_full_name ORDER BY fir_count DESC LIMIT 200
STEP 2: Filter in JavaScript: keep fir_count >= min_connections
STEP 3: For each name, fetch Accused details: SELECT * FROM Accused WHERE 
full_name = '[name]' LIMIT 1. Build node: {id: "accused_"+name, label: full_name, 
type: "accused", total_firs: fir_count, risk_score, size: 8+(fir_count*3), 
color: risk_score>70?"#ef4444":risk_score>40?"#f97316":"#3b82f6"}
STEP 4: For each, fetch their FIRs: SELECT f.case_number, f.crime_type_code, 
f.date_filed FROM FIRs f, FIR_Accused fa WHERE fa.fir_case_number = f.case_number 
AND fa.accused_full_name = '[name]' LIMIT 20. Set node.crime_types, 
first_crime_date, last_crime_date from this.
STEP 5: Find edges — for FIRs linked to 2+ accused (from FIR_Accused data already 
fetched), create an edge between each pair sharing that case_number. Deduplicate, 
increment weight for each additional shared FIR.
STEP 6: Filter out nodes with zero edges. Calculate date_range min/max across 
all nodes.

Return: { nodes: [...], edges: [...], date_range: {min, max} }
CORS headers, error handling, export pattern as above.
```

---

## WEEK 3 — Chrono-Criminal Graph Component (Frontend, for Person 5)

This goes in your `camera-intel` branch under a `components/` folder — Person 5 copies it into her Next.js app later.

Create `camera-intel/components/ChronoCriminalGraph.tsx`. Paste this into Claude:
```
Build a React TypeScript component ChronoCriminalGraph.tsx using D3.js.

Props: { nodes: GraphNode[], edges: GraphEdge[], date_range: {min, max}, 
onNodeClick?: (nodeId: string) => void, height?: number }

GraphNode: { id, label, type, total_firs, crime_types, first_crime_date, 
last_crime_date, risk_score, size, color }
GraphEdge: { id, source, target, fir_case_number, date, crime_type, weight }

Use useRef for the SVG element, useEffect for D3 force simulation initialization 
(charge -200, link distance 80, center force). Use d3.select to update existing 
elements via .data() with key = node.id — never destroy and recreate the whole 
SVG on each tick.

Time slider at the bottom (input type="range"), Play/Pause button, speed 
options 1x/5x/20x. On play: advance currentDate by (speed * 7 days) every 100ms 
via setInterval, until reaching date_range.max.

Node visible (opacity 1, transition 300ms) if node.first_crime_date <= currentDate, 
else opacity 0. Edge visible if edge.date <= currentDate AND both connected nodes 
are visible.

Nodes with risk_score > 70 get a second pulsing ring circle (r = size+6, stroke 
#ef4444, CSS @keyframes pulse animating opacity 0.8 to 0.2).

Tooltip on hover showing name, total_firs, crime_types, risk_score.
Labels below each visible node, 10px white text, truncated to 12 chars.

Edge colors by crime_type: vehicle_theft #3b82f6, robbery #ef4444, burglary 
#f97316, chain_snatching #f59e0b, assault #dc2626, fraud #8b5cf6, cybercrime 
#06b6d4, drug_offence #10b981, other #6b7280

TypeScript strict, no any types. Export default.
```

---

## WEEK 4 — Investigator's Wall Component (Frontend)

Create `camera-intel/components/InvestigatorWall.tsx`. Paste this into Claude:
```
Build a React TypeScript component InvestigatorWall.tsx.

Props: { fir: {case_number, crime_type, date_filed, location_name, case_status, 
description, police_station}, accused: AccusedRecord[], victims: VictimRecord[], 
related_firs: {case_number, crime_type, date_filed, link_reason}[], 
case_summary: string, isLoading?: boolean }

Dark navy background (#0a1628). Top: horizontal timeline showing FIR Filed → 
Investigation Started → Chargesheet Filed → Case Closed, filled/empty dots based 
on case_status. Center: main FIR card with crime_type badge, case_number in 
monospace, location/date/station, description excerpt, status badge. 
Left column: accused cards (avatar circle, name, age/gender, risk_score badge 
green/orange/red, prior_convictions warning if >0, modus_operandi truncated). 
Right column: victim cards (vulnerability_score badge). Bottom row: related_firs 
cards connected to the center card via animated dashed red SVG lines 
(strokeDashoffset animation on mount). Bottom-left: AI case_summary text box 
labeled "DRISHTI Analysis", skeleton loader if isLoading.

Framer Motion entrance animations, staggered by 100ms per card. Tailwind CSS. 
TypeScript strict. Export default.
```

---

## TESTING CHECKLIST

- [ ] `catalyst serve` runs clean
- [ ] `SELECT camera_type, COUNT(*) FROM Cameras GROUP BY camera_type` shows the expected ~400/300/1300 split
- [ ] Zero cameras outside Bengaluru bounds
- [ ] `cameras-nearby` for Silk Board coordinates returns 10-30 results, ANPR cameras ranked first
- [ ] `trail` POST returns 4-6 hops, each a different real camera, timestamps 3-8 min apart, consistent plate across hops
- [ ] `anpr-check/build-watchlist` adds 500+ plates (after Aman's FIR data is loaded)
- [ ] `anpr-check` with a real watchlist plate returns `alert: true` with a real FIR case number and district
- [ ] `network-graph-data` returns 10+ nodes, 8+ edges, valid date_range
- [ ] ChronoCriminalGraph: Play button animates nodes/edges in over time, high-risk nodes pulse
- [ ] InvestigatorWall: renders with mock data, animated lines draw correctly
- [ ] Vritika confirms she has Admin access on the GitHub repo

---

## QUICK REFERENCE

| Resource | URL |
|---|---|
| Overpass Turbo | https://overpass-turbo.eu/ |
| Catalyst CLI command reference | https://docs.catalyst.zoho.com/en/cli/v1/cli-command-reference/ |
| `ds:import` docs | https://docs.catalyst.zoho.com/en/cli/v1/data-store-import-and-export/import-operation/ |
| Catalyst Functions (AdvancedIO) | https://docs.catalyst.zoho.com/en/cloud-scale/help/functions/advanced-io-functions/ |
| ZCQL WHERE limits | https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/where/ |
| D3.js force simulation | https://d3js.org/d3-force/simulation |
| Framer Motion | https://www.framer.com/motion/ |
| GitHub collaborator permissions | https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories |

---

*DRISHTI — ದೃಷ್ಟಿ | Person 4 (Vedesh) Camera Intelligence Guide — Final | KSP × Hack2Skill 2026*
