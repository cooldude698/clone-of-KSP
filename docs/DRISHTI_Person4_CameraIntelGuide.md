# DRISHTI — ದೃಷ್ಟಿ
## Person 4: Camera Intelligence & Network Commander — Complete Step-by-Step Guide
**KSP × Hack2Skill Datathon 2026**
**| Vedesh S Khatri**

---

> **Your role in one sentence:**  
> You build the features that make judges gasp. The geo-trail, the Chrono-Criminal Graph, and the camera integration are the three things no other team will have. Your work is the visual centrepiece of the entire demo.

---

## READ THIS FIRST — Your Dependency Map

### What You Need From Others (in order)

```
FROM PERSON 1 (Vritika) — needed on YOUR Day 1:
  ✅ The .env file with Catalyst DB credentials
  ✅ GitHub repo access — your branch is: camera-intel
  ✅ Catalyst project access (Signals enabled, NoSQL enabled)
  ✅ Confirmation that DB tables are created, especially:
       Cameras, ANPR_Watchlist, Alerts, FIRs, FIR_Accused, Accused
  → Message Vritka Day 1: "Need .env and confirm Cameras table exists"

FROM PERSON 3 (Aman) — needed by end of Week 2:
  ✅ Confirmation that FIR data is loaded (you query it for ANPR watchlist)
  ✅ Their FIRs API URL (you call it to get repeat offender data for graph)
  ✅ Their Repeat Offenders API URL + exact JSON response format
       (the Chrono-graph needs accused_id, name, fir dates, crime types)
  → Message Aman Week 2: "Is FIR data loaded? Share repeat-offenders 
    API URL and sample response. I need accused + FIR dates for the graph."
```

### What You Give to Others (in order)

```
TO PERSON 2 (Swapnil) — share by end of Week 3:
  📤 /api/cameras/nearby — URL + exact JSON response format
  📤 /api/trail — URL + exact JSON response format
  📤 /api/anpr/check — URL + exact JSON response format
  → Save in camera-intel/API_CONTRACT.md and share on WhatsApp

TO PERSON 5 (Aryan) — share by end of Week 4:
  📤 ChronoCriminalGraph.tsx React component
  📤 InvestigatorWall.tsx React component
  📤 GeoTrailCard.tsx React component (renders the animated trail map)
  → Push these to your branch, tell Person 5 which folder to copy from

TO PERSON 1 (Vritika) — for integration in Week 5:
  📤 All deployed Catalyst function URLs
  📤 Any new .env variables added
```

### Your API Contract — Define on Day 1

Save as `camera-intel/API_CONTRACT.md`:

```
GET /api/cameras/nearby
Query params: lat (float), lng (float), radius_meters (int, default 500),
              timestamp (ISO string, optional)
Returns:
{
  "cameras": [
    {
      "camera_id": 234,
      "external_id": "SC-BLR-0234",
      "name": "Koramangala 5th Block — Safe City CAM-A12",
      "type": "Safe_City",
      "lat": 12.9352,
      "lng": 77.6247,
      "distance_meters": 78,
      "has_anpr": true,
      "has_face_recog": true,
      "junction_name": "Koramangala 5th Block Junction",
      "relevance_score": 98,
      "coverage_radius_m": 50,
      "footage_window": {
        "from": "2026-04-15T15:30:00",
        "to": "2026-04-15T16:30:00"
      }
    }
  ],
  "total_found": 14,
  "anpr_capable_count": 4,
  "face_recog_capable_count": 2,
  "search_center": { "lat": 12.9350, "lng": 77.6245 },
  "search_radius_meters": 500
}

POST /api/trail
Body: {
  crime_lat: float,
  crime_lng: float,
  crime_timestamp: ISO string,
  vehicle_type: "motorcycle"|"car"|"auto"|"on_foot" (optional, default motorcycle)
}
Returns:
{
  "trail": [
    {
      "hop": 1,
      "camera_id": 234,
      "camera_name": "Silk Board Junction — BATCS",
      "camera_type": "BATCS",
      "lat": 12.9172,
      "lng": 77.6211,
      "timestamp": "2026-04-15T15:48:00",
      "plate_detected": "KA-03-MH-7823",
      "confidence": 92,
      "sighting_type": "ANPR",
      "distance_from_crime_km": 0.4
    }
  ],
  "total_hops": 5,
  "trail_status": "active",
  "last_known_location": {
    "lat": 12.9458,
    "lng": 77.6398,
    "district": "Indiranagar",
    "camera_name": "Indiranagar 100ft Road — Safe City"
  },
  "total_distance_km": 4.2,
  "duration_minutes": 23
}

POST /api/anpr/check
Body: { plate_number: string, camera_id: int, camera_name: string,
        lat: float, lng: float, timestamp: ISO string }
Returns (if match):
{
  "alert": true,
  "severity": "HIGH",
  "plate_number": "KA-03-MH-7823",
  "fir_case_number": "KAR/BLR/2025/01847",
  "original_crime": "vehicle_theft",
  "crime_date": "2025-11-12",
  "district": "Whitefield",
  "accused_name": "Name if known",
  "instructions": "Do not approach alone. Contact Whitefield PS immediately. FIR No: KAR/BLR/2025/01847",
  "alert_id": 1234
}
Returns (if no match):
{ "alert": false, "plate_number": "KA-03-MH-7823" }

GET /api/cameras/blind-spots
Returns:
{
  "blind_spots": [
    {
      "cell_lat": 12.9412,
      "cell_lng": 77.6105,
      "area_name": "Near BTM Layout Market",
      "crime_count": 23,
      "camera_count": 1,
      "crime_to_camera_ratio": 23.0,
      "risk_level": "critical",
      "recommendation": "Install 2-3 Safe City cameras within 300m radius"
    }
  ],
  "total_blind_spots": 8
}

GET /api/network/graph-data
Query params: min_connections (int, default 2), months_back (int, default 36)
Returns:
{
  "nodes": [
    {
      "id": "accused_145",
      "label": "Accused Name",
      "type": "accused",
      "total_firs": 7,
      "crime_types": ["vehicle_theft", "burglary"],
      "first_crime_date": "2023-02-14",
      "last_crime_date": "2026-03-01",
      "risk_score": 92,
      "size": 29,
      "color": "#ef4444"
    }
  ],
  "edges": [
    {
      "id": "edge_145_201",
      "source": "accused_145",
      "target": "accused_201",
      "fir_case_number": "KAR/BLR/2024/0891",
      "date": "2024-06-18",
      "crime_type": "robbery",
      "weight": 2
    }
  ],
  "date_range": {
    "min": "2023-01-01",
    "max": "2026-05-31"
  }
}
```

---

## CRITICAL — No Hardcoding Rules for Person 4

| What | Wrong | Correct |
|------|-------|---------|
| DB credentials | in code | `process.env.CATALYST_DB_*` |
| Bengaluru bounds | `12.85, 13.05` in code | `config.BENGALURU_BOUNDS.*` from config JSON |
| Trail hop distance | `600` in code | `config.TRAIL.max_hop_distance_m` |
| Confidence values | `92` in code | generated from realistic range in config |
| Camera type weights | `Safe_City > BATCS` in code | `config.CAMERA_TYPE_PRIORITY` array |
| Overpass API URL | `"https://overpass-api.de/..."` | `process.env.OVERPASS_API_URL` |
| Person 3 API URL | `"http://localhost:3001"` | `process.env.ANALYTICS_API_URL` |

**ZCQL reminder:** Maximum 5 WHERE conditions. For camera queries, use bounding box (2 conditions: lat range + lng range) then exact distance calculation in JavaScript.

---

## YOUR COMPLETE TASK LIST (Overview)

```
Day 1      → Setup tools, clone branch, verify DB access, install npm packages
Day 2      → Download real camera location data from Overpass API (script)
Day 3      → Load camera registry into Catalyst Data Store
Day 4      → Build camera query API + test it
Day 4      → Build camera config file (no hardcoding)
Week 2     → Build suspect geo-trail API
Week 2     → Build ANPR check API + Catalyst Signals alert
Week 2     → Build ANPR watchlist builder API
Week 3     → Build network graph data API (for Chrono-graph)
Week 3     → Build Chrono-Criminal Graph React component
Week 4     → Build Investigator's Digital Wall React component
Week 4     → Build surveillance blind spot radar API
Week 4     → Share API contract with Person 2, share components with Person 5
Week 5-6   → Integration support, bug fixes
```

---

## DAY 1 — Setup Your Environment

### Step 1: Install Tools

Check Node.js:
```bash
node --version   # need v18+
npm --version    # need v9+
```
If not installed: **https://nodejs.org** → LTS version

Install Python (for the camera data download script):
```bash
python3 --version  # need 3.9+
pip3 install requests pandas
```

### Step 2: Clone and Set Up Your Branch

```bash
git clone https://github.com/VEDESH_USERNAME/drishti-ksp.git
cd drishti-ksp
git checkout camera-intel
git branch
# Should show: * camera-intel
```

Create your module structure:
```bash
mkdir -p camera-intel/functions/cameras
mkdir -p camera-intel/functions/trail
mkdir -p camera-intel/functions/anpr
mkdir -p camera-intel/functions/network
mkdir -p camera-intel/functions/blind-spots
mkdir -p camera-intel/data-scripts
mkdir -p camera-intel/raw-data
mkdir -p camera-intel/config
mkdir -p camera-intel/components

# Initialize npm
cd camera-intel
npm init -y
npm install zcatalyst-sdk-node dotenv axios
```

Frontend component dependencies (install in the frontend folder):
```bash
cd ../frontend
npm install d3 @types/d3 framer-motion react-leaflet leaflet
npm install @types/leaflet
```

### Step 3: Create Your .env File

Copy from Vedesh's .env. Add these extra variables:
```
# Catalyst (from Vedesh)
CATALYST_DB_HOST=xxxx
CATALYST_DB_PORT=3306
CATALYST_DB_NAME=DRISHTI_KSP
CATALYST_DB_USER=xxxx
CATALYST_DB_PASSWORD=xxxx
CATALYST_PROJECT_ID=xxxx
CATALYST_ACCOUNT_ID=xxxx

# Person 3's analytics API (update when they share URL)
ANALYTICS_API_URL=http://localhost:3001/api/analytics

# Overpass API for OSM data
OVERPASS_API_URL=https://overpass-api.de/api/interpreter

# Camera config
CAMERA_SEARCH_DEFAULT_RADIUS=500
MAX_TRAIL_HOPS=6
```

### Step 4: Create the Camera Config File

Create `camera-intel/config/camera-config.json`:

Paste this into Claude, copy output:
```
Create a JSON config file camera-config.json for DRISHTI camera intelligence module.

Include:

BENGALURU_BOUNDS:
  lat_min: 12.85, lat_max: 13.05, lng_min: 77.50, lng_max: 77.70

CAMERA_TYPE_PRIORITY: ["Safe_City", "BATCS", "MCCTNS_Commercial", "MCCTNS_RWA", "MCCTNS_Private"]

CAMERA_DISTRIBUTION:
  safe_city_count: 800
  batcs_count: 300
  mcctns_count: 3900

SAFE_CITY_PROPERTIES:
  has_anpr: true, has_face_recog: true, coverage_radius_m: 50

BATCS_PROPERTIES:
  has_anpr: true, has_face_recog: false, coverage_radius_m: 80

MCCTNS_PROPERTIES:
  has_anpr: false, has_face_recog: false, coverage_radius_m: 20

TRAIL:
  max_hop_distance_m: 900
  min_hop_distance_m: 300
  time_between_hops_min_sec: 180
  time_between_hops_max_sec: 480
  max_hops: 6
  confidence_range: { first_2_hops: [85, 95], later_hops: [55, 80] }
  direction_drift_degrees: 25

RELEVANCE_SCORING:
  base_score: 100
  distance_penalty_per_100m: 10
  anpr_bonus: 20
  face_recog_bonus: 15
  safe_city_type_bonus: 10

ANPR_PLATE_PATTERN: "KA-\\d{2}-[A-Z]{1,2}-\\d{4}"

BLIND_SPOT:
  grid_cell_degrees: 0.005
  min_crime_count: 5
  max_camera_count_for_blind_spot: 2
  critical_ratio_threshold: 10

Output valid JSON only.
```

### Step 5: Verify DB Access

Create `camera-intel/test-db.js`:
```
Write a Node.js test script that:
1. Loads .env using dotenv
2. Initializes zcatalyst-sdk-node in admin scope
3. Runs: SELECT COUNT(*) as total FROM Cameras
4. Runs: SELECT COUNT(*) as total FROM ANPR_Watchlist
5. Runs: SELECT COUNT(*) as total FROM FIRs
6. Prints each result with ✅ or ❌
Pattern: catalyst.initialize(req, { scope: 'admin' }).zcql().executeZCQLQuery(query)
Since there is no real req object in a test script, pass a mock: 
  const mockReq = { get: () => null };
  catalyst.initialize(mockReq, { scope: 'admin' })
```

```bash
node test-db.js
```

All three should show ✅. If Cameras shows 0 — that's fine, you load data in Day 3. If FIRs shows 0 — Person 3's data is not loaded yet, message them.

---

## DAY 2 — Download Real Camera Location Data from OSM

This is the most important data task. You get REAL GPS coordinates of traffic signals and junctions in Bengaluru from OpenStreetMap via the Overpass API.

### Understanding Overpass API

Overpass API is a free, public OpenStreetMap data query service. You send it a query and it returns JSON with matching map features. No signup needed.

The Overpass API endpoint: **https://overpass-api.de/api/interpreter**

The query to get all traffic signals in Bengaluru:
```
[out:json][timeout:90];
node["highway"="traffic_signals"]
  (12.85,77.50,13.05,77.70);
out body;
```

This returns all OSM nodes tagged as traffic signals within the Bengaluru bounding box.

### Step 1: Run the OSM Download Script

Create `camera-intel/data-scripts/download-osm-signals.py`:

Paste this into Claude and copy output:
```
Write a Python script download-osm-signals.py that:

1. Loads the Overpass API URL from .env using python-dotenv
   OVERPASS_API_URL = os.getenv('OVERPASS_API_URL', 'https://overpass-api.de/api/interpreter')

2. Sends this POST request to the Overpass API:
   URL: OVERPASS_API_URL
   POST data: 
   data = """
   [out:json][timeout:90];
   node["highway"="traffic_signals"]
     (12.85,77.50,13.05,77.70);
   out body;
   """
   Headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
   Use requests library. Timeout: 120 seconds.

3. Parse the JSON response:
   The response has a key "elements" which is an array of objects like:
   { "type": "node", "id": 12345678, "lat": 12.9352, "lon": 77.6245, "tags": {...} }

4. Extract all elements where type == "node" and lat/lon exist

5. For each element, extract:
   osm_id, lat, lon, and any junction name from tags 
   (look for tag keys: "name", "ref", "traffic_signals:direction")

6. Save as JSON file: camera-intel/raw-data/bengaluru_traffic_signals.json
   Format: { "count": N, "signals": [{"osm_id": N, "lat": N, "lon": N, "name": "..."}, ...] }

7. Also save as CSV: camera-intel/raw-data/bengaluru_traffic_signals.csv
   Columns: osm_id, lat, lon, name

8. Print progress: "Fetching Bengaluru traffic signals from OpenStreetMap..."
   Print result: "Downloaded X traffic signal locations"

Include error handling: if Overpass is slow or times out, retry once after 30 seconds.
```

Run it:
```bash
cd camera-intel
python3 data-scripts/download-osm-signals.py
```

Expected output: `Downloaded 800-2000 traffic signal locations`

If you get 0 or an error: Overpass might be temporarily slow. Wait 5 minutes and retry. Also try the web version manually: go to **https://overpass-turbo.eu/**, paste this query and click Run:
```
node["highway"="traffic_signals"](12.85,77.50,13.05,77.70);
out body;
```
Then Export → Download → as GeoJSON → Save manually to `raw-data/`.

### Step 2: Verify the Downloaded Data

```bash
python3 -c "
import json
with open('raw-data/bengaluru_traffic_signals.json') as f:
    data = json.load(f)
print(f'Total signals: {data[\"count\"]}')
print(f'Sample: {data[\"signals\"][:3]}')
# Verify coordinates are within Bengaluru
lats = [s[\"lat\"] for s in data[\"signals\"]]
lngs = [s[\"lon\"] for s in data[\"signals\"]]
print(f'Lat range: {min(lats):.4f} to {max(lats):.4f}')
print(f'Lng range: {min(lngs):.4f} to {max(lngs):.4f}')
"
```

Lat range should be roughly 12.85–13.05. Lng range should be 77.50–77.70. If coordinates are way off — wrong bounding box was used.

---

## DAY 3 — Load Camera Registry into Catalyst Data Store

### Step 1: Create the Camera Loading Script

Create `camera-intel/data-scripts/load-cameras.py`:

Paste this into Claude:
```
Write a Python script load-cameras.py that loads camera data into Catalyst Data Store.

Dependencies: mysql-connector-python, python-dotenv, json, random, math

The script loads REAL OSM traffic signal coordinates and generates camera records.

SECTION 1: Database connection
  Use mysql-connector-python with credentials from .env
  Same pattern as Person 3's script: mysql.connector.connect(host, port, user, password, database)

SECTION 2: load_batcs_cameras()
  Read raw-data/bengaluru_traffic_signals.json
  For each traffic signal (each is a real junction in Bengaluru):
    Generate a BATCS camera record:
    - camera_id: auto-increment
    - external_id: "BATCS-BLR-" + zero-padded osm_id last 5 digits
    - name: "BATCS Camera — " + (signal name if available, else lat/lng formatted)
    - type: "BATCS"
    - lat: signal lat + random.uniform(-0.0001, 0.0001) (small offset, <10m)
    - lng: signal lon + random.uniform(-0.0001, 0.0001)
    - has_anpr: True
    - has_face_recog: False
    - coverage_radius_m: 80
    - is_active: 1 for 95% of records, 0 for 5%
    - junction_name: derive from nearest known major junction name
      (hardcode a mapping of 20 major junctions: 
       Silk Board: ~12.9172,77.6211
       Marathahalli Bridge: ~12.9591,77.7009
       Hebbal Flyover: ~13.0358,77.5970
       KR Puram: ~13.0070,77.6960
       Whitefield Signal: ~12.9698,77.7499
       Koramangala 5th Block: ~12.9340,77.6240
       MG Road: ~12.9756,77.6099
       Indiranagar 100ft Road: ~12.9784,77.6408
       HSR Layout BDA Complex: ~12.9116,77.6370
       Electronic City Toll: ~12.8399,77.6769
       ... add 10 more real ones)
      Find the mapping entry with smallest distance, use that name if < 800m away
      Otherwise: leave junction_name as null

  Batch insert in groups of 100.
  Print: "Loaded X BATCS cameras from OSM data"

SECTION 3: load_safe_city_cameras()
  These are placed near clusters of BATCS cameras (simulating Safe City deployments
  near major intersections).
  
  Query: SELECT lat, lng FROM Cameras WHERE type = 'BATCS'
  
  For every 2 BATCS cameras that are within 300m of each other:
    Generate 1 Safe City camera between them:
    - lat: midpoint lat + random.uniform(-0.0005, 0.0005)
    - lng: midpoint lng + random.uniform(-0.0005, 0.0005)
    - type: "Safe_City"
    - external_id: "SC-BLR-" + sequential number (zero-padded 4 digits)
    - name: "Safe City Camera — " + nearby junction name if available
    - has_anpr: True
    - has_face_recog: True
    - coverage_radius_m: 50
    - is_active: 1 for 98% of records
  
  Target ~800 Safe City cameras total. If algorithm generates fewer, add random
  Safe City cameras at random points near commercial areas in Bengaluru center.
  
  Print: "Loaded X Safe City cameras"

SECTION 4: load_mcctns_cameras()
  Generate 3900 MCCTNS cameras (private/RWA/commercial) distributed across Bengaluru.
  
  Distribution:
  - 40% near residential areas (smaller lat/lng variations from residential zone centers)
  - 30% near commercial areas (near known shopping streets)
  - 20% near office areas (near IT corridors: Whitefield, Electronic City, Koramangala)
  - 10% random across city
  
  Type rotation: cycle through MCCTNS_Private (50%), MCCTNS_RWA (30%), MCCTNS_Commercial (20%)
  All: has_anpr=False, has_face_recog=False, coverage_radius_m=20
  
  Use these zone center coordinates for realistic clustering:
  Residential zones: Jayanagar (12.9282, 77.5838), JP Nagar (12.9091, 77.5847),
    Rajajinagar (12.9985, 77.5554), BTM Layout (12.9166, 77.6101),
    Banashankari (12.9263, 77.5460)
  Commercial zones: Commercial Street (12.9831, 77.6100), Brigade Road (12.9719, 77.6074),
    Chickpet (12.9623, 77.5762), Malleshwaram (13.0035, 77.5710)
  IT corridors: Whitefield (12.9698, 77.7499), Electronic City (12.8398, 77.6768),
    Manyata Tech Park (13.0475, 77.6219)
  
  For each zone center: generate cameras within radius 2km using random angle + 
  distance = random.uniform(0, 2000) meters converted to degrees.
  
  Batch insert in groups of 500.
  Print: "Loaded X MCCTNS cameras"

SECTION 5: update_camera_districts()
  This function assigns district_name to each camera based on its lat/lng.
  Use a simple bounding box lookup for major Bengaluru zones:
    lat > 13.0: "North Bengaluru (Yelahanka/Hebbal)"
    lat 12.97-13.0, lng 77.55-77.65: "Central Bengaluru"
    lat 12.93-12.97, lng 77.60-77.70: "East Bengaluru (Indiranagar/Whitefield)"
    lat 12.90-12.93: "South Bengaluru (Koramangala/HSR)"
    lat < 12.90: "South Bengaluru (JP Nagar/Electronic City)"
    lng > 77.70: "Whitefield/East Bengaluru"
    else: "Bengaluru Urban"
  
  UPDATE Cameras SET district_name = [calculated] WHERE camera_id = [id]
  Do this in Python, not SQL, to avoid ZCQL limitations.
  Process in batches of 1000.

Main: run all sections, print summary counts.
```

Run it:
```bash
python3 data-scripts/load-cameras.py
```

Expected output:
```
Loaded 1200+ BATCS cameras from OSM data
Loaded 800 Safe City cameras
Loaded 3900 MCCTNS cameras
Updated district names for all cameras
Total cameras loaded: ~5900
```

### Step 2: Verify Camera Data

In Catalyst Data Store SQL Console:
```sql
SELECT type, COUNT(*) as count FROM Cameras GROUP BY type;
SELECT COUNT(*) FROM Cameras WHERE has_anpr = 1;
SELECT COUNT(*) FROM Cameras WHERE lat < 12.85 OR lat > 13.05 OR lng < 77.50 OR lng > 77.70;
```

Third query must return 0 — no cameras outside Bengaluru bounds.

---

## DAY 4 — Build the Camera Query API (Your Foundation)

This teaches you the ZCQL bounding box + JavaScript distance pattern.
Every other API builds on this.

Create `camera-intel/functions/cameras/index.js`:

Paste this into Claude, copy complete output:
```
Build a Node.js Catalyst Serverless Function for the camera query API.

File: functions/cameras/index.js
Dependencies: zcatalyst-sdk-node, dotenv, require config from ../../config/camera-config.json

GET /api/cameras/nearby
Query params: lat, lng, radius_meters (default from config or env), timestamp

STEP 1: Parse and validate inputs
  lat = parseFloat(req.query.lat)
  lng = parseFloat(req.query.lng)
  radius = parseInt(req.query.radius_meters) || parseInt(process.env.CAMERA_SEARCH_DEFAULT_RADIUS) || 500
  timestamp = req.query.timestamp || new Date().toISOString()
  
  If lat or lng is NaN: return 400 { error: "lat and lng are required" }
  If lat not within config.BENGALURU_BOUNDS: return 400 { error: "Location outside Bengaluru" }

STEP 2: Convert radius to approximate degree offset
  METERS_PER_DEGREE_LAT = 111000
  METERS_PER_DEGREE_LNG = 111000 * Math.cos(lat * Math.PI / 180)
  latOffset = radius / METERS_PER_DEGREE_LAT
  lngOffset = radius / METERS_PER_DEGREE_LNG

STEP 3: Query camera registry with bounding box
  ZCQL pattern (admin scope):
  const adminApp = catalyst.initialize(req, { scope: 'admin' });
  const zcql = adminApp.zcql();
  
  Build ZCQL query using bounding box (2 WHERE conditions for lat, 2 for lng — but
  ZCQL BETWEEN only works for int/double, so use >= and <=):
  
  Query 1 (lat range):
  SELECT camera_id, external_id, name, type, lat, lng, district_name,
         junction_name, has_anpr, has_face_recog, is_active, coverage_radius_m
  FROM Cameras
  WHERE lat >= ${lat - latOffset} AND lat <= ${lat + latOffset}
  AND lng >= ${lng - lngOffset} AND lng <= ${lng + lngOffset}
  AND is_active = 1
  LIMIT 200
  
  Note: That's 5 WHERE conditions exactly (lat>=, lat<=, lng>=, lng<=, is_active=)
  Do NOT add more WHERE conditions to this query.

STEP 4: Calculate exact distances in JavaScript
  For each camera from result:
  
  Haversine formula:
  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + 
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * 
              Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  }
  
  Filter to keep only cameras where distance <= radius
  
STEP 5: Calculate relevance score for each camera
  Load scoring config: config.RELEVANCE_SCORING
  relevance = config.base_score 
    - Math.floor(distance / 100) * config.distance_penalty_per_100m
    + (camera.has_anpr ? config.anpr_bonus : 0)
    + (camera.has_face_recog ? config.face_recog_bonus : 0)
    + (camera.type === 'Safe_City' ? config.safe_city_type_bonus : 0)
  relevance = Math.max(0, Math.min(100, relevance))

STEP 6: Sort by relevance score descending (Safe City ANPR cameras first)

STEP 7: Build footage_window if timestamp provided
  footage_window = {
    from: new Date(new Date(timestamp).getTime() - 30*60*1000).toISOString(),
    to: new Date(new Date(timestamp).getTime() + 30*60*1000).toISOString()
  }

STEP 8: Return JSON matching API contract

CORS headers:
res.set('Access-Control-Allow-Origin', '*');
res.set('Content-Type', 'application/json');

Error handling: return 500 with { error: true, message: err.message }
Export as: module.exports = async (req, res) => { ... }
```

Test it (replace coordinates with Silk Board Junction):
```bash
node -e "
require('dotenv').config();
const fn = require('./functions/cameras/index.js');
const req = { query: { lat: '12.9172', lng: '77.6211', radius_meters: '500' }, get: () => null };
const res = { set: () => {}, json: (d) => console.log('Cameras found:', d.total_found, '\nFirst camera:', JSON.stringify(d.cameras[0], null, 2)) };
fn(req, res);
"
```

Expected: 10-30 cameras found, first camera has a junction name and relevance_score > 80.

---

## WEEK 2 — Build the Suspect Geo-Trail API

This is the showstopper feature. It traces a suspect's movement across real cameras.

Create `camera-intel/functions/trail/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for suspect geo-trail simulation.

File: functions/trail/index.js
Load config from: ../../config/camera-config.json
Dependencies: zcatalyst-sdk-node, dotenv

POST /api/trail
Body: { crime_lat, crime_lng, crime_timestamp, vehicle_type }

STEP 1: Parse and validate inputs
  crime_lat = parseFloat(req.body.crime_lat)
  crime_lng = parseFloat(req.body.crime_lng)
  crime_timestamp = req.body.crime_timestamp || new Date().toISOString()
  vehicle_type = req.body.vehicle_type || 'motorcycle'
  
  Load config: const config = require('../../config/camera-config.json');
  const trailConfig = config.TRAIL;

STEP 2: Find cameras near crime scene (first sighting)
  Call the same bounding box query logic from camera function (radius = 300m).
  Prefer ANPR-capable cameras: sort by has_anpr DESC, distance ASC
  Pick the 2 closest ANPR cameras as potential first sighting cameras.
  Pick 1 randomly from those 2.
  
  If no ANPR cameras found: use the closest camera regardless of type.
  
  This is hop[0] (not counted yet — it's the "crime scene area").

STEP 3: Generate trail hops
  trail = []
  current_lat = crime_lat
  current_lng = crime_lng
  current_time = new Date(crime_timestamp)
  
  For hop 1 to trailConfig.max_hops:
    a. Choose a direction:
       If hop === 1: random direction 0-360 degrees
       Else: previous direction + random.uniform(-trailConfig.direction_drift_degrees,
             +trailConfig.direction_drift_degrees) (simulate turning)
    
    b. Choose distance for this hop:
       hop_distance_m = trailConfig.min_hop_distance_m + 
         Math.random() * (trailConfig.max_hop_distance_m - trailConfig.min_hop_distance_m)
    
    c. Calculate next approximate position:
       METERS_PER_LAT = 111000
       METERS_PER_LNG = 111000 * Math.cos(current_lat * Math.PI / 180)
       direction_rad = direction * Math.PI / 180
       next_lat = current_lat + (Math.sin(direction_rad) * hop_distance_m) / METERS_PER_LAT
       next_lng = current_lng + (Math.cos(direction_rad) * hop_distance_m) / METERS_PER_LNG
    
    d. Check bounds: if next_lat or next_lng is outside config.BENGALURU_BOUNDS
       reverse direction (simulate returning toward city center)
    
    e. Find nearest camera to (next_lat, next_lng) using ZCQL bounding box query
       (radius 400m). If no camera found within 400m: trail_status = 'lost', break.
    
    f. Determine sighting time:
       hop_time_seconds = trailConfig.time_between_hops_min_sec + 
         Math.random() * (trailConfig.time_between_hops_max_sec - trailConfig.time_between_hops_min_sec)
       current_time = new Date(current_time.getTime() + hop_time_seconds * 1000)
    
    g. Generate plate if vehicle type:
       If hop === 1 AND camera.has_anpr:
         Generate a Karnataka plate: "KA-" + random 2-digit + "-" + random letter + "-" + random 4-digit
         plate_detected = generated_plate
       If hop > 1: same plate from hop 1 (plate stays consistent through trail)
       If camera.has_anpr is false: plate_detected = null
    
    h. Calculate confidence based on hop number:
       conf_range = hop <= 2 ? trailConfig.confidence_range.first_2_hops 
                             : trailConfig.confidence_range.later_hops
       confidence = conf_range[0] + Math.random() * (conf_range[1] - conf_range[0])
       confidence = Math.round(confidence)
    
    i. Add to trail:
       trail.push({
         hop: hop,
         camera_id: nearest_camera.camera_id,
         camera_name: nearest_camera.name,
         camera_type: nearest_camera.type,
         lat: nearest_camera.lat,
         lng: nearest_camera.lng,
         timestamp: current_time.toISOString(),
         plate_detected: plate_detected,
         confidence: confidence,
         sighting_type: nearest_camera.has_anpr ? 'ANPR' : 'Visual',
         distance_from_crime_km: calculateDistanceKm(crime_lat, crime_lng, nearest_camera.lat, nearest_camera.lng)
       })
    
    j. Update current position to camera position for next hop
  
STEP 4: Determine trail status
  trail_status = trail.length >= trailConfig.max_hops ? 'active' : 'lost'

STEP 5: Calculate total distance
  Sum all hop distances from crime scene to last sighting.

STEP 6: Get last known location details
  last_camera = trail[trail.length - 1]
  last_known = { lat, lng, camera_name, district_name from the camera record }

STEP 7: Calculate total duration
  duration_minutes = (last_timestamp - crime_timestamp) / 60000

STEP 8: Return response matching API contract

Include haversineDistance and calculateDistanceKm helper functions.
CORS headers. Error handling. Export as Catalyst function.
```

---

## WEEK 2 — Build the ANPR Cross-Match API

### Step 1: Build the Watchlist Check Function

Create `camera-intel/functions/anpr/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function handling ANPR operations.

File: functions/anpr/index.js
Dependencies: zcatalyst-sdk-node, dotenv

ROUTE 1: POST /api/anpr/check
Body: { plate_number, camera_id, camera_name, lat, lng, timestamp }

STEP 1: Validate plate format
  Load pattern from config: config.ANPR_PLATE_PATTERN
  const plateRegex = new RegExp(config.ANPR_PLATE_PATTERN);
  If plate doesn't match pattern: return { alert: false, plate_number, reason: "Invalid format" }

STEP 2: Check against ANPR_Watchlist table
  ZCQL query (admin scope):
  SELECT watchlist_id, plate_number, fir_case_number, fir_id, crime_type,
         vehicle_description, alert_active, priority
  FROM ANPR_Watchlist
  WHERE plate_number = '[plate_number]' AND alert_active = 1
  LIMIT 1

STEP 3: If no match found: return { alert: false, plate_number }

STEP 4: If match found:
  a. Fetch the linked FIR details:
     SELECT case_number, crime_type_code, district_name, date_filed, 
            police_station, description
     FROM FIRs WHERE ROWID = [watchlist.fir_id]
  
  b. Try to get accused name for this FIR:
     SELECT a.full_name FROM Accused a, FIR_Accused fa
     WHERE fa.accused_id = a.ROWID AND fa.fir_id = [fir_id]
     LIMIT 1
  
  c. Insert into Alerts table:
     INSERT INTO Alerts (alert_type, camera_id, plate_number, lat, lng,
       matched_fir_id, description, severity, timestamp)
     VALUES ('anpr_match', [camera_id], '[plate]', [lat], [lng],
       [fir_id], 'Plate [plate] spotted at [camera_name]', 
       [watchlist.priority === 'high' ? 'critical' : 'high'],
       '[timestamp]')
     
     Get the inserted ROWID (new alert_id).
  
  d. Generate instructions string based on crime type:
     vehicle_theft → "Vehicle possibly stolen. Do not approach alone. Contact [district] PS."
     robbery/chain_snatching → "Suspect in robbery case. Approach with backup. Contact [district] PS."
     drug_offence → "Suspected narcotics case vehicle. Contact Narcotics division and [district] PS."
     default → "Vehicle linked to active FIR [case_number]. Contact [district] PS immediately."
  
  e. Return alert response matching API contract

ROUTE 2: POST /api/anpr/build-watchlist (called once after FIR data is loaded)

STEP 1: Query all open FIRs with vehicle-related crime types:
  SELECT fir_id, case_number, crime_type_code, district_name, description
  FROM FIRs
  WHERE crime_type_code IN ('vehicle_theft', 'robbery', 'chain_snatching')
  AND status = 'open'
  LIMIT 5000
  
  Note: Run this as multiple queries if needed (ZCQL IN clause may not be supported —
  run 3 separate queries for each crime_type and merge results in JavaScript)

STEP 2: For each FIR, extract plate numbers from description field:
  const plateRegex = /KA-\d{2}-[A-Z]{1,2}-\d{4}/g;
  const matches = fir.description.match(plateRegex) || [];
  
  For each matched plate: insert into ANPR_Watchlist if not already there
  (check: SELECT COUNT(*) FROM ANPR_Watchlist WHERE plate_number = '[plate]' LIMIT 1)

STEP 3: Return { watchlist_built: true, plates_added: N, total_watchlist: M }

ROUTE 3: GET /api/anpr/alerts (for frontend polling)

Query recent unacknowledged alerts:
  SELECT * FROM Alerts WHERE acknowledged = 0 
  ORDER BY timestamp DESC LIMIT 20
  
  Return: { alerts: [...], count: N }

CORS headers. Route all three paths using req.method + req.path or a simple path check.
Export as Catalyst function.
```

### Step 2: Set Up Catalyst Signals for Real-Time Alerts

Catalyst Signals routes events to targets automatically. For ANPR alerts:

1. Go to Catalyst Dashboard → **Signals**
2. Click **"Create Publisher"** → select **Custom Publisher**
3. Name it: `anpr-alert-publisher`
4. Click **"Create Target"** → select **Function** as target type
5. Create a Catalyst Serverless Function called `alert-processor` that handles incoming alert events
6. Create a **Rule** linking the publisher to the target

For the hackathon demo, polling the Alerts table every 5 seconds is simpler and more reliable than full Signals setup. Add this to your ANPR function's route 3 (`GET /api/anpr/alerts`) and have the frontend call it every 5 seconds.

The Signals configuration adds bonus points for using Catalyst services fully — set it up if you have time, but the demo works without it.

---

## WEEK 3 — Build the Network Graph Data API

This powers the Chrono-Criminal Graph. It needs data from Person 3's DB.

Create `camera-intel/functions/network/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for criminal network graph data.

File: functions/network/index.js
Dependencies: zcatalyst-sdk-node, dotenv

GET /api/network/graph-data
Query params: min_connections (int, default 2), months_back (int, default 36)

This builds the data for the Chrono-Criminal Graph visualization.

STEP 1: Get all repeat accused (those in 2+ FIRs)
  
  Step 1a: Get FIR counts per accused:
  SELECT accused_id, COUNT(*) as fir_count FROM FIR_Accused
  GROUP BY accused_id HAVING fir_count >= [min_connections]
  ORDER BY fir_count DESC LIMIT 100
  
  If ZCQL doesn't support HAVING directly: fetch all, filter in JavaScript.
  Try: SELECT accused_id, COUNT(*) as fir_count FROM FIR_Accused GROUP BY accused_id
  ORDER BY fir_count DESC LIMIT 200
  Then filter in JS: results.filter(r => r.fir_count >= min_connections)

STEP 2: For each repeat accused, fetch their details
  Batch into groups of 5 (to respect ZCQL OR condition limit):
  SELECT ROWID as accused_id, full_name, prior_convictions, risk_score,
         modus_operandi FROM Accused 
  WHERE ROWID = X OR ROWID = Y OR ROWID = Z OR ROWID = A OR ROWID = B
  
  Build node object for each:
  {
    id: "accused_" + accused_id,
    label: full_name,
    type: "accused",
    total_firs: fir_count,
    crime_types: [],  // filled in step 3
    first_crime_date: null,  // filled in step 3
    last_crime_date: null,
    risk_score: risk_score || 0,
    size: 8 + (fir_count * 3),  // size grows with crimes
    color: risk_score > 70 ? "#ef4444" : risk_score > 40 ? "#f97316" : "#3b82f6"
  }

STEP 3: For each accused, get their FIR history
  Query (JOIN syntax in ZCQL: FROM Table1 t1, Table2 t2 WHERE t1.col = t2.col):
  SELECT f.ROWID as fir_id, f.case_number, f.crime_type_code, f.district_name,
         f.date_filed, f.status, fa.accused_id
  FROM FIRs f, FIR_Accused fa
  WHERE fa.fir_id = f.ROWID AND fa.accused_id = [accused_id]
  ORDER BY f.date_filed ASC
  LIMIT 20
  
  From results: update node.crime_types, node.first_crime_date, node.last_crime_date

STEP 4: Find edges (co-accused connections)
  For each pair of nodes that share at least one FIR:
  Find accused pairs from FIR_Accused: two accused with the same fir_id
  
  Approach: for each FIR that has 2+ accused (from FIR_Accused data already fetched),
  create edges between all accused pairs in that FIR.
  
  Deduplicate edges (same pair may share multiple FIRs — weight += 1 for each shared FIR)
  
  Edge format:
  {
    id: "edge_" + source_accused_id + "_" + target_accused_id,
    source: "accused_" + source_id,
    target: "accused_" + target_id,
    fir_case_number: fir.case_number (use most recent shared FIR),
    date: fir.date_filed,
    crime_type: fir.crime_type_code,
    weight: shared_fir_count
  }

STEP 5: Filter nodes with no edges
  Keep only nodes that appear in at least one edge.

STEP 6: Calculate date range
  min_date = earliest first_crime_date across all nodes
  max_date = latest last_crime_date across all nodes

STEP 7: Return response matching API contract

CORS headers. Error handling. Export as Catalyst function.
```

---

## WEEK 3 — Build the Chrono-Criminal Graph Component

This is the most visually impressive component in DRISHTI. Take your time here.

Create `camera-intel/components/ChronoCriminalGraph.tsx`:

Paste this into Claude — copy the COMPLETE output carefully:
```
Build a React TypeScript component ChronoCriminalGraph.tsx using D3.js.

The component receives graph data and shows a time-animated criminal network.

Import:
import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

Interface:
interface GraphNode {
  id: string; label: string; type: string; total_firs: number;
  crime_types: string[]; first_crime_date: string; last_crime_date: string;
  risk_score: number; size: number; color: string;
}
interface GraphEdge {
  id: string; source: string; target: string; fir_case_number: string;
  date: string; crime_type: string; weight: number;
}
interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  date_range: { min: string; max: string };
  onNodeClick?: (nodeId: string) => void;
  height?: number;
}

State: currentDate (Date), isPlaying (boolean), speed (1|5|20), 
       visibleNodes (Set<string>), visibleEdges (Set<string>),
       hoveredNode (string|null), tooltip ({ x, y, node } | null)

REFS: svgRef (SVGSVGElement), simulationRef (d3.Simulation)

LAYOUT:
- Full width container, height = props.height || 500
- SVG fills container (use ResizeObserver for responsive width)
- Time slider bar at the bottom (30px height)
- Play/Pause button (⏵/⏸) + speed buttons (1× 5× 20×)
- Status text: "Showing crimes up to [currentDate formatted]"

ANIMATION LOGIC:
- On play: setInterval runs every 100ms
  Each tick: advance currentDate by (speed × 7 days)
  If currentDate > date_range.max: stop playing, set currentDate = max
- Update visibleNodes: include node if node.first_crime_date <= currentDate
- Update visibleEdges: include edge if edge.date <= currentDate 
  AND both source and target nodes are in visibleNodes

D3 FORCE SIMULATION:
- Initialize once on mount with all nodes (even hidden ones use 0 opacity)
- Forces: charge strength -200, link distance 80, center force
- On simulation tick: update SVG element positions
- When visibleNodes changes: update opacity not position

SVG RENDERING:
Draw in this order (SVG z-order — drawn last = on top):
1. Edges: <line> elements, stroke = crime_type color mapping
   opacity: edge in visibleEdges ? 0.7 : 0
   stroke-width: edge.weight > 1 ? 2.5 : 1.5
   Animate opacity change with transition(300ms)

2. Node circles: <circle> r = node.size, fill = node.color
   opacity: node in visibleNodes ? 1 : 0
   If risk_score > 70: add a pulsing ring (second circle, same center,
   r = size + 6, fill none, stroke = #ef4444, stroke-width 1.5,
   animate with CSS: @keyframes pulse { 0%,100%{opacity:0.8} 50%{opacity:0.2} })
   On hover: show tooltip div (absolutely positioned) with node details

3. Labels: <text> 10px, white, centered under circle
   Only show if node in visibleNodes
   text = node.label (truncate to 12 chars)

TOOLTIP:
When hovering a node, show an absolutely positioned div:
  Name, total_firs count, crime_types list, last crime date, risk score badge

SLIDER:
<input type="range"> min=0 max=totalDays value=currentDayIndex
On change: update currentDate, trigger animation recompute

PERFORMANCE NOTE:
Use d3.select(svgRef.current) to update existing elements, not full re-render.
Use .data() with key function = node.id for element binding.

COLORS for crime types (use consistently):
vehicle_theft: #3b82f6 (blue), robbery: #ef4444 (red), burglary: #f97316 (orange),
chain_snatching: #f59e0b (amber), assault: #dc2626 (dark red), fraud: #8b5cf6 (purple),
cybercrime: #06b6d4 (cyan), drug_offence: #10b981 (green), other: #6b7280 (gray)

Export default ChronoCriminalGraph;
TypeScript strict mode, no any types.
```

---

## WEEK 4 — Build the Investigator's Digital Wall Component

Create `camera-intel/components/InvestigatorWall.tsx`:

Paste this into Claude:
```
Build a React TypeScript component InvestigatorWall.tsx.

The investigator's digital wall shows a visual case board for one FIR.

Props interface:
{
  fir: { case_number: string; crime_type: string; date_filed: string; 
         location_name: string; status: string; description: string; 
         police_station: string; };
  accused: Array<{ accused_id: number; full_name: string; age: number; 
    gender: string; prior_convictions: number; risk_score: number; 
    modus_operandi: string; }>;
  victims: Array<{ victim_id: number; full_name: string; age: number; 
    gender: string; vulnerability_score: number; }>;
  related_firs: Array<{ case_number: string; crime_type: string; 
    date_filed: string; link_reason: string; }>;
  case_summary: string;
  isLoading?: boolean;
}

LAYOUT (CSS Grid or absolute positioning):
- Container: full width, min-height 600px, background #0a1628 (dark navy)
- All cards: rounded-lg border border-gray-700/50 background #111827

TOP ROW — Timeline bar (full width):
Show 4-6 key events from the FIR lifecycle as horizontal timeline:
  FIR Filed → Investigation Started → (if chargesheeted: Chargesheet Filed) → (if closed: Case Closed)
  Use the fir.status to determine which stages are complete.
  Complete stages: filled dot, blue line connecting them.
  Incomplete: empty dot, dashed gray line.

CENTER CARD — Main FIR details:
  Large badge with crime_type (red background for violent, orange for theft, etc.)
  Case number in monospace font
  Location, date, police station
  First 150 chars of description
  Status badge

LEFT COLUMN — Accused cards (scroll if many):
  For each accused:
  - Placeholder avatar circle (initials of name, colored by risk_score)
  - Name (bold), age & gender
  - Risk score badge: 0-40=green, 41-70=orange, 71-100=red pulsing
  - Prior convictions indicator (if > 0: show count with warning icon)
  - Modus operandi text (italic, truncated to 60 chars)
  Show max 3, add "View all X accused" button if more

RIGHT COLUMN — Victim cards:
  For each victim:
  - Placeholder avatar circle (green tones)
  - Name, age & gender
  - Vulnerability score badge
  Show max 3, "View all X victims" if more

BOTTOM ROW — Related FIRs with connecting lines:
  Show related_firs as cards in a horizontal row
  Each card: case_number, crime_type, date, link_reason (in italic)
  Draw SVG lines from each related_fir card up to the center FIR card
  Lines: dashed, #ef4444 (red), 1.5px stroke
  Animate lines: use strokeDashoffset animation on mount (draws from center outward)

BOTTOM-LEFT — AI Case Summary box:
  Dark gray background (#1f2937)
  Label: "DRISHTI Analysis" with a small AI icon
  case_summary text (prose, 14px)
  Show skeleton loader if isLoading is true

ENTRANCE ANIMATIONS (using Framer Motion):
  Wrap each major section in motion.div
  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
  Stagger: accused cards delay 0.1s each, victim cards delay 0.1s each,
  related FIRs delay 0.2s each.
  SVG connecting lines: animate strokeDashoffset from full length to 0 
  (draws the line) on mount, delay 0.5s

Use Tailwind CSS for all styling. TypeScript strict mode.
Include SVG line drawing logic using useRef and getBoundingClientRect 
to position lines between elements.
Export default InvestigatorWall;
```

---

## WEEK 4 — Build the Surveillance Blind Spot Radar API

Create `camera-intel/functions/blind-spots/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for surveillance blind spot detection.

File: functions/blind-spots/index.js
Load config from: ../../config/camera-config.json

GET /api/cameras/blind-spots

STEP 1: Fetch crime coordinate data from FIRs table
  Query (admin scope):
  SELECT location_lat, location_lng, crime_type_code, district_name 
  FROM FIRs WHERE location_lat IS NOT NULL AND status != 'closed'
  LIMIT 10000
  
  Also apply a date filter: only last 12 months
  WHERE date_filed >= '[12 months ago]'
  (Add this as a 3rd WHERE condition if needed)

STEP 2: Fetch camera locations
  SELECT lat, lng, type, has_anpr FROM Cameras WHERE is_active = 1
  LIMIT 10000

STEP 3: Build crime density grid
  const cellSize = config.BLIND_SPOT.grid_cell_degrees  // 0.005
  crimeDensity = {}  // key: "lat_cell,lng_cell", value: count
  
  For each FIR: 
    cellKey = Math.floor(fir.lat/cellSize) + "," + Math.floor(fir.lng/cellSize)
    crimeDensity[cellKey] = (crimeDensity[cellKey] || 0) + 1

STEP 4: Build camera density grid
  cameraDensity = {}
  For each camera:
    cellKey = Math.floor(cam.lat/cellSize) + "," + Math.floor(cam.lng/cellSize)
    // A camera covers multiple cells (coverage_radius / cellSize in degrees)
    // For simplicity: count camera in its own cell + 8 surrounding cells
    for offLat in [-1, 0, 1]:
      for offLng in [-1, 0, 1]:
        neighborKey = (Math.floor(cam.lat/cellSize) + offLat) + "," +
                      (Math.floor(cam.lng/cellSize) + offLng)
        cameraDensity[neighborKey] = (cameraDensity[neighborKey] || 0) + 1

STEP 5: Find blind spots
  For each cell in crimeDensity:
    crime_count = crimeDensity[key]
    camera_count = cameraDensity[key] || 0
    
    If crime_count >= config.BLIND_SPOT.min_crime_count
    AND camera_count <= config.BLIND_SPOT.max_camera_count_for_blind_spot:
      
      ratio = crime_count / Math.max(1, camera_count)
      risk_level = ratio > 20 ? "critical" : ratio > 10 ? "high" : "medium"
      
      // Convert cell key back to lat/lng center
      [latCell, lngCell] = key.split(',').map(Number)
      cell_lat = (latCell + 0.5) * cellSize
      cell_lng = (lngCell + 0.5) * cellSize
      
      // Find area name from known Bengaluru areas lookup
      area_name = lookupAreaName(cell_lat, cell_lng)  // simple distance-based lookup
      
      recommendation = camera_count === 0 ? 
        "No cameras in this area — urgent camera deployment needed" :
        "Install " + Math.ceil(ratio/5) + " additional cameras within 300m radius"
      
      Push to blind_spots array.

STEP 6: Sort by crime_count descending, return top 20.

STEP 7: Return matching API contract.

Include a lookupAreaName function that takes lat/lng and returns the nearest
named area from a hardcoded list of 15 major Bengaluru area names with 
approximate center coordinates (same list used in camera loading script).

CORS headers. Error handling. Export as Catalyst function.
```

---

## TESTING CHECKLIST — Complete Before Handing Off

### Test 1 — Camera Data Integrity
```sql
SELECT type, COUNT(*) FROM Cameras GROUP BY type;
SELECT COUNT(*) FROM Cameras WHERE lat < 12.85 OR lat > 13.05;
SELECT COUNT(*) FROM Cameras WHERE has_anpr = 1;
```
- [ ] BATCS cameras > 1000 (from real OSM data)
- [ ] Safe City cameras ≈ 800
- [ ] Zero cameras outside Bengaluru bounds
- [ ] ANPR-capable cameras > 1100

### Test 2 — Camera Query API
```bash
curl "http://localhost:3000/api/cameras/nearby?lat=12.9172&lng=77.6211&radius_meters=500"
```
- [ ] Returns 10-30 cameras
- [ ] First result has relevance_score > 80
- [ ] All returned cameras have lat/lng within Bengaluru
- [ ] ANPR-capable cameras appear before non-ANPR

### Test 3 — Geo-Trail API
```bash
curl -X POST http://localhost:3000/api/trail \
  -H "Content-Type: application/json" \
  -d '{"crime_lat":12.9172,"crime_lng":77.6211,"crime_timestamp":"2026-04-15T15:45:00Z"}'
```
- [ ] Returns 4-6 hops
- [ ] Each hop has a different camera (not the same camera repeated)
- [ ] Timestamps are 3-8 minutes apart
- [ ] Plate is consistent across all hops (same plate, different cameras)
- [ ] trail_status is "active" or "lost" (not undefined)

### Test 4 — ANPR Watchlist Build
```bash
curl -X POST http://localhost:3000/api/anpr/build-watchlist
```
- [ ] Returns plates_added > 5000

### Test 5 — ANPR Check (must trigger alert)
```bash
# First get a real plate from the watchlist
# Run in ZCQL console: SELECT plate_number FROM ANPR_Watchlist LIMIT 1
# Use that plate in this test:
curl -X POST http://localhost:3000/api/anpr/check \
  -H "Content-Type: application/json" \
  -d '{"plate_number":"KA-XX-XX-XXXX","camera_id":1,"camera_name":"Test Camera","lat":12.93,"lng":77.62,"timestamp":"2026-06-01T14:00:00Z"}'
```
- [ ] Returns { alert: true, severity, fir_case_number, instructions }
- [ ] A new record appears in Alerts table

### Test 6 — Network Graph Data
```bash
curl "http://localhost:3000/api/network/graph-data?min_connections=3"
```
- [ ] Returns at least 10 nodes
- [ ] Returns at least 8 edges
- [ ] Each node has first_crime_date and last_crime_date
- [ ] date_range.min and max are valid dates

### Test 7 — Chrono-Criminal Graph (browser)
Open in browser. Click Play button.
- [ ] Nodes appear one by one as time advances
- [ ] Edges appear when both connected nodes are visible
- [ ] High-risk nodes (risk_score > 70) have pulsing red ring
- [ ] Dragging slider backward resets, dragging forward re-animates
- [ ] Clicking a node triggers onNodeClick callback (check console.log)

### Test 8 — Investigator's Digital Wall (browser)
Pass mock FIR with 2 accused and 2 victims as props.
- [ ] All cards render correctly
- [ ] SVG connecting lines appear and animate from center outward
- [ ] Risk score badges are color-coded correctly (green/orange/red)
- [ ] Case summary text appears at the bottom

### Test 9 — Blind Spot Radar
```bash
curl "http://localhost:3000/api/cameras/blind-spots"
```
- [ ] Returns 5-15 blind spots
- [ ] All blind spots have crime_count >= 5
- [ ] Coordinates are within Bengaluru bounds
- [ ] "critical" risk level spots have highest crime_count

### Test 10 — Person 2 Integration (Week 4)
Person 2 sends a camera query from their chat function.
- [ ] Chat query "Find cameras near Silk Board" triggers your cameras API
- [ ] Response shows cameras on map in chat UI (Person 5's frontend)

---

## WHAT YOU HAND OFF

**To Person 2 (end of Week 3):**
- `camera-intel/API_CONTRACT.md` pushed to GitHub on your branch
- Message: "Camera APIs running at http://localhost:3000. Update your .env: CAMERA_API_URL=http://localhost:3000/api/cameras. Check API_CONTRACT.md for exact formats."

**To Person 5 (end of Week 4):**
Push to GitHub. Message Person 5:
> "Components ready. Copy these 3 files from camera-intel/components/ to your frontend/components/ folder:
> 1. ChronoCriminalGraph.tsx — install d3: npm install d3 @types/d3
> 2. InvestigatorWall.tsx — needs framer-motion (already installed)
> 3. Both need the network graph data API for data: GET /api/network/graph-data"

---

## QUICK REFERENCE — All Links You Need

| Resource | URL |
|---------|-----|
| Overpass Turbo (manual queries) | https://overpass-turbo.eu/ |
| Overpass API direct endpoint | https://overpass-api.de/api/interpreter |
| OSM Traffic Signals tag reference | https://wiki.openstreetmap.org/wiki/Tag:highway%3Dtraffic_signals |
| D3.js force directed graph example | https://observablehq.com/@d3/force-directed-graph |
| D3.js docs | https://d3js.org |
| D3 simulation docs | https://d3js.org/d3-force/simulation |
| Leaflet.js quickstart | https://leafletjs.com/examples/quick-start/ |
| Leaflet animated polyline | https://leafletjs.com/reference.html#polyline |
| Framer Motion docs | https://www.framer.com/motion/ |
| react-leaflet docs | https://react-leaflet.js.org/docs/start-introduction |
| Catalyst ZCQL WHERE docs | https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/where/ |
| Catalyst Signals intro | https://docs.catalyst.zoho.com/en/signals/getting-started/introduction/ |
| Catalyst Node.js SDK | https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/overview/ |
| Catalyst project dashboard | https://catalyst.zoho.com |

---

## WHEN YOU ARE STUCK — Exact Pattern to Follow

1. Copy the full error + relevant code
2. Paste into Claude with this context:

```
I am building the Camera Intelligence module for DRISHTI (Karnataka Police crime 
intelligence platform). I am using:
- Node.js + zcatalyst-sdk-node for backend APIs
- React + TypeScript + D3.js for the Chrono-Criminal Graph component
- Real OSM traffic signal GPS coordinates for camera locations
- ZCQL (max 5 WHERE conditions) for database queries
- Haversine distance formula for camera proximity calculations

I am getting this error:
[PASTE FULL ERROR]

My code:
[PASTE RELEVANT SECTION]

Fix this step by step. Note: ZCQL does not support spatial functions — all 
distance calculations happen in JavaScript after a bounding box ZCQL query.
```

3. Test the fix before moving on
4. If D3 animation is not working: paste your useEffect code and ask Claude specifically about D3 + React lifecycle timing (very common issue)
5. Message Vedesh if stuck > 30 minutes

---

*DRISHTI — ದೃಷ್ಟಿ | Person 4 Camera Intelligence Guide | KSP × Hack2Skill 2026*
