# DRISHTI — ದೃಷ್ಟಿ

## MEMBER 1: Captain's Complete Step-by-Step Guide

**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:**
> You are the architect of the foundation. Every other member builds on what you set up. You don't write complex features — you set up everything correctly so the team never has to stop and wait.

---

## CRITICAL RULE: No Hardcoding — What This Actually Means

Before touching anything, understand this clearly.

**Hardcoding = bad.** Hardcoding means putting actual values directly inside the code. Example:

```javascript
// WRONG — hardcoded
const API_KEY = "sk-ant-api03-xxxxxxx";
const DB_URL = "jdbc:mysql://abc123.catalyst.zoho.com/DRISHTI";
```

**Environment variables = correct.** Values live in a `.env` file, code reads from process:

```javascript
// CORRECT — environment variable
const API_KEY = process.env.ANTHROPIC_API_KEY;
const DB_URL = process.env.CATALYST_DB_URL;
```

**Same rule for data:**

- ❌ Do NOT write `lat: 12.9716, lng: 77.5946` inside code manually
- ✅ DO load coordinates from a database table that was populated from a real dataset

**The rule of thumb:** If you had to type a value yourself, it probably shouldn't be in the code.

---

## DATA PHILOSOPHY — Real vs Synthetic

This is the most important thing to understand before Day 1. We use **Real Data** wherever legally and publicly available. We use **Statistically Grounded Synthetic Data** where privacy laws prevent open access.

### What We Use Real Data For (download and load directly)

| Data Type | Source | What We Get |
| :--- | :--- | :--- |
| District-wise crime counts by type (2022-2024) | OpenCity / NCRB | Actual crime totals per district — our database matches these numbers |
| Bengaluru traffic junction GPS coordinates | OpenStreetMap via Overpass | Real lat/lng of actual junctions — used for BATCS camera locations |
| District boundary shapefiles | DataMeet GitHub | Real Karnataka district boundaries — used for heatmaps |
| Demographic data by district | Census 2011 Karnataka | Real population, age, gender distribution per district |
| Bengaluru traffic signal names | OpenCity | Real signal junction names matching Safe City/BATCS |

### What Must Be Synthetically Generated (and why that is acceptable)

| Data Type | Why Not Available Publicly | How We Handle It |
| :--- | :--- | :--- |
| Individual FIR records | Individual police cases are not public — privacy and security law | Generate synthetic FIRs that **MATCH** real NCRB district totals. If NCRB says 4,521 vehicle thefts in Bengaluru Urban in 2023, we generate exactly 4,521 individual vehicle theft FIRs distributed realistically. |
| Individual accused/victim names and details | Personal data — legally protected | Generate realistic synthetic profiles matching demographic distributions from Census |
| Exact Safe City camera GPS coordinates | Security sensitive — never published | Generate camera positions centered on real junction GPS from OSM, with small random offset |
| ANPR match events / camera footage data | Not public | Simulate using realistic timestamps and camera sequences |

**Why synthetic-but-statistically-grounded is NOT the same as random mock data:**
Random mock data is made up. Our synthetic data is generated to MATCH real NCRB statistics. If NCRB says Koramangala has more vehicle thefts than Yeshwantpur — our database reflects that. If NCRB says crimes spike in October-November — our data shows that. This is what makes DRISHTI credible in a demo.

---

## YOUR COMPLETE TASK LIST (Overview)

```
Day 1    → Catalyst account + project setup
Day 1    → GitHub repository + folder structure
Day 2    → Download all real datasets (5 sources)
Day 3    → Set up database schema in Catalyst Data Store
Day 3    → Write Python script to transform real data into DB
Day 4    → Load real data + generate synthetic FIRs from real distributions
Day 5    → Set up all API keys + .env files, share with team
Day 5    → Send team their access credentials
Week 2+  → Daily management routine
Week 5-6 → Integration sprint (connect all 4 modules)
Week 7   → Deploy on Catalyst AppSail
Week 7   → Record demo video
Week 7   → Submit on Hack2Skill
```

---

## DAY 1, PART A — Catalyst Project Setup

### Step 1: Create Your Catalyst Account

1. Open a browser. Go to: **https://catalyst.zoho.com**
2. Click **"Sign Up Free"** (top right corner)
3. Use your personal email (not a temp email — you need this to work for 2 months)
4. Complete email verification
5. Fill in your profile: Name, Organisation = "Team DRISHTI"

### Step 2: Claim Your Free Credits

1. After logging in, open a new tab
2. Go to: **https://catalyst.zoho.com/promotions.html?cn=KSPH26**
3. You will see a "Claim Credits" page
4. Click **"Claim Credits"** — enter promo code **KSPH26** if prompted
5. You should see a confirmation that credits have been added to your account
6. Go back to your Catalyst dashboard. You should see credits in your account.
7. **Screenshot this page and save it** — you may need it if there's any dispute

### Step 3: Create Your Project

1. In the Catalyst dashboard, click **"Create New Project"**
2. Project name: **DRISHTI-KSP**
3. Select region: **India** (important for data residency)
4. Click **"Create"**

### Step 4: Enable All Required Services

In the project dashboard, go to the left sidebar. Enable each service below one by one.

1. **Data Store** → Click → Enable → Note the project ID shown
2. **NoSQL** → Click → Enable
3. **Stratus** (file/object storage) → Click → Enable → Create a bucket named: `drishti-files`
4. **Serverless Functions** → Click → Enable
5. **Zia Services** → Click → Enable → Inside Zia, individually enable:
   - Speech-to-Text (STT)
   - Text-to-Speech (TTS)
   - OCR
   - Object Recognition
6. **QuickML** → Click → Enable → Create a new LLM project named: `drishti-ai`
7. **SmartBrowz** → Click → Enable
8. **Authentication** → Click → Enable → Set "Allow Email/Password login" = ON
9. **Signals** → Click → Enable
10. **Cron** → Click → Enable
11. **AppSail** → Click → Enable
12. **Slate** (frontend hosting) → Click → Enable

### Step 5: Note Down All Credentials

Open a new text file on your computer called `credentials_PRIVATE.txt`. Write down:

```
Catalyst Project ID: [copy from Data Store settings]
Catalyst Account ID: [copy from Account → Settings]
Data Store URL: [shown in Data Store → Connection Details]
Data Store Username: [shown in Data Store → Connection Details]
Data Store Password: [generate from Data Store → Connection Details]
Zia API Key: [shown in Zia Services → API Keys]
QuickML Endpoint: [shown in QuickML → API Settings]
```

**IMPORTANT:** Do NOT commit this file to GitHub. Ever. Add it to .gitignore immediately.

---

## DAY 1, PART B — GitHub Repository Setup

*(Completed successfully during initialization)*

---

## DAY 2 — The Data Hunt

Your goal today is to download the raw data files that will serve as the foundation for our entire database.

### Step 1: Download Crime Statistics
Go to **https://data.opencity.in/dataset/karnataka-crime-data-2024** and download the CSV.
Also download the 2023 data: **https://data.opencity.in/dataset/crime-in-india-2023**

### Step 2: Download Traffic Signal Locations
1. Go to **https://overpass-turbo.eu/**
2. Move the map to cover Bengaluru
3. Run this query:
```
[out:json];
area[name="Bengaluru"]->.searchArea;
node["highway"="traffic_signals"](area.searchArea);
out body;
```
4. Export as GeoJSON. Save to `crime-database/raw-data/signals_osm.geojson`.

### Step 3: Get District Boundaries
Download the GeoJSON files for Karnataka districts from: **https://github.com/datameet/maps**
Save to `crime-database/raw-data/boundaries.geojson`

### Step 4: Get Demographic Baselines
Search for latest or Census demographic breakdowns from **https://censusindia.gov.in/census.website/data/census-tables** or open city datasets. We just need the percentage distributions of age and gender to weight our synthetic persona generation.

---

## DAY 3 & 4 — Build and Load the Database

### Step 1: Database Schema

Create `crime-database/schema.sql` and run it in Catalyst Data Store SQL Console:
*(See DRISHTI_Team_Manual.md Part 4 > Member 1 > Step 4 for the exact schema)*

### Step 2: The Data Synthesizer Script

You will write a Python script (`crime-database/data-scripts/load_data.py`) that reads the downloaded real CSV/GeoJSON files and generates the legally-mandated synthetic FIRs, Victims, and Accused to *perfectly match* the real statistics.

> Prompt to use with Claude/LLM to generate this script:
> "Write a Python script that reads a CSV of real NCRB Bengaluru crime counts per district per year, and a GeoJSON of real Bengaluru traffic signals. The script must connect to Zoho Catalyst Data Store and insert statistically matching synthetic FIR records, Accused, and Victims. Use Faker to generate names. Weight crime events based on the real stats. Distribute camera mock data centered around the real traffic signal GPS coordinates. Output standard SQL insert statements."

### Step 3: Run and Verify

```bash
cd crime-database
python data-scripts/load_data.py
```

Verify in Catalyst SQL console:
```sql
SELECT district_name, COUNT(*) AS count 
FROM FIRs GROUP BY district_name;
-- Results must align roughly with the NCRB actuals downloaded in Day 2
```

---

## DAY 5 — API Keys and Environment Variables

1. Get Anthropic API Key (`claude-sonnet-4-5`) from **https://console.anthropic.com**
2. In Catalyst Zia Services, generate the API Key.
3. In Catalyst Data Store, get the connection details.
4. Create `.env.example` in the root:

```env
# AI Engine
ANTHROPIC_API_KEY=
CATALYST_QUICKML_ENDPOINT=

# Services
CATALYST_ZIA_API_KEY=

# Database
CATALYST_DB_HOST=
CATALYST_DB_PORT=
CATALYST_DB_NAME=
CATALYST_DB_USER=
CATALYST_DB_PASS=

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

5. Ask all team members to copy `.env.example` to `.env` locally. Securely message them the real values.

---

## WEEK 5-6 — Integration Sprint

This is when you connect all 4 modules.

### The Integration Router
Create `deployment/functions/gateway/index.js` as the API gateway.

> Prompt to use:
> "Write a Node.js Catalyst Serverless Function as an API gateway for the DRISHTI platform. It routes POST /api/chat to the AI Engine, and if the AI requires data (needs_data.type), it fetches from the Crime DB APIs or Camera Intel APIs, merges the data, and returns the combined payload to the frontend. Ensure CORS headers."

Connect the frontend to this gateway:
```javascript
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, ...)
```

---

## WEEK 7 — Deployment & Demo

### Step 1: Catalyst AppSail Deployment

```bash
npm install -g @zohocloud/catalystcli
catalyst login
catalyst init # Link project

cd frontend
npm run build
catalyst deploy --frontend

cd ..
catalyst deploy --functions
```

In Catalyst Dashboard, paste the `.env` values into the Serverless Functions App Settings.

### Step 2: Record the Demo

- Seed the live database with a fresh "wanted plate" for the presentation.
- Open OBS Studio.
- Run exactly to the 5-Minute Script specified in the Team Manual.

---

## QUICK REFERENCE — All Real Dataset Links

| Dataset | URL | What You Download |
|---------|-----|-------------------|
| Karnataka Crime 2024 | https://data.opencity.in/dataset/karnataka-crime-data-2024 | CSV of district crime counts 2024 |
| Karnataka Crime 2023 | https://data.opencity.in/dataset/karnataka-crime-data-2023 | CSV of district crime counts 2023 |
| Bengaluru Crime 2023 | https://data.opencity.in/dataset/bengaluru-crime-data-2023 | Bengaluru city police crime report |
| Crime in India 2023 (NCRB) | https://data.opencity.in/dataset/crime-in-india-2023 | Full national NCRB report |
| Karnataka Crime Review 2023 | https://karnataka.data.gov.in/catalog/crime-review-year-2023 | State crime review data |
| NCRB 2022 PDF Direct | https://ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/1701607577CrimeinIndia2022Book1.pdf | Full NCRB 2022 Book 1 PDF |
| NCRB All Years | https://ncrb.gov.in/crime-in-india-table-resource | Browse all years |
| data.gov.in search | https://data.gov.in/search?title=crime+karnataka | Additional crime datasets |
| Bengaluru Traffic Signals | https://data.opencity.in/dataset/bengaluru-city-traffic-signal-data | Junction names and signal data |
| Bengaluru Signals GPS (OSM) | https://overpass-turbo.eu/ | Run: traffic_signals in Bengaluru → Export GeoJSON |
| Karnataka District Boundaries | https://github.com/datameet/maps | GeoJSON district boundaries |
| Census Karnataka | https://censusindia.gov.in/census.website/data/census-tables | Population data by district |
| KSP Official Website | https://www.ksp.gov.in | Police station list |
| OpenCity General | https://data.opencity.in | All urban India datasets |

---

## QUICK REFERENCE — All Catalyst Service Links

| Service | What It Does | Dashboard Path |
|---------|-------------|----------------|
| Catalyst Home | Main dashboard | https://catalyst.zoho.com |
| Data Store Docs | Database setup | https://docs.catalyst.zoho.com/en/data-store/ |
| QuickML Docs | AI/LLM/RAG | https://docs.catalyst.zoho.com/en/quickml/ |
| Zia Voice Docs | Speech to text/text to speech | https://docs.catalyst.zoho.com/en/services/zia-services/speech/ |
| Zia OCR Docs | Document scanning | https://docs.catalyst.zoho.com/en/services/zia-services/ocr/ |
| SmartBrowz Docs | PDF generation | https://docs.catalyst.zoho.com/en/smartbrowz/ |
| AppSail Docs | Docker deployment | https://docs.catalyst.zoho.com/en/appsail/ |
| Slate Docs | Frontend hosting | https://docs.catalyst.zoho.com/en/slate/ |
| Signals Docs | Real-time events | https://docs.catalyst.zoho.com/en/signals/ |
| CLI Install | Deploy from terminal | https://docs.catalyst.zoho.com/en/cli/ |
| Anthropic Console | Get API key | https://console.anthropic.com |

---
*DRISHTI — ದೃಷ್ಟಿ | Member 1 Guide | KSP × Hack2Skill 2026*