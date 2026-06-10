# DRISHTI — ದೃಷ್ಟಿ
## Person 3: Data & Analytics Commander — Complete Step-by-Step Guide
**KSP × Hack2Skill Datathon 2026**
**| Aman Jain**
---

> **Your role in one sentence:**  
> You are the foundation. Everything DRISHTI knows about crime comes from your database and your analytics APIs. If your data is wrong, the whole platform is wrong. If your APIs are fast, the whole demo is smooth.

---

## READ THIS FIRST — Your Dependency Map

### What You Need From Others (in order)

```
FROM PERSON 1 (Vritika) — needed on YOUR Day 1:
  ✅ The .env file with Catalyst DB credentials
       (CATALYST_DB_HOST, CATALYST_DB_PORT, CATALYST_DB_NAME,
        CATALYST_DB_USER, CATALYST_DB_PASSWORD)
  ✅ GitHub repo access — your branch is: crime-database
  ✅ Confirmation that all database tables are CREATED in Catalyst Data Store
       (Tables: Districts, PoliceStations, CrimeTypes, FIRs, Accused,
        Victims, FIR_Accused, FIR_Victims, Cameras, ANPR_Watchlist, Alerts)
  ✅ Catalyst project access (dashboard login)
  → Message Vritika: "Tables created? .env ready? Share when done."

FROM NOBODY ELSE:
  You do NOT need Person 2, 4, or 5 to start your work.
  You work independently from Day 1 to Week 4.
```

### What You Give to Others (in order)

```
TO PERSON 2 (Swapnil) — share by end of Week 2:
  📤 Your API contract document (exact JSON format for all 6 APIs)
  📤 Local URL of your running analytics server
  → Paste the API contract in WhatsApp + save in crime-database/API_CONTRACT.md

TO PERSON 4 (Vedesh) — share by end of Week 2:
  📤 Access to run ZCQL queries against the database
       (they need FIR data to build the ANPR watchlist)
  📤 Database credentials (they already have .env from Vedesh)
  → Tell Person 4: "DB is ready, tables are loaded. Your .env already has access."

TO PERSON 5 (Aryan) — share by end of Week 3:
  📤 Sample JSON output of trends API (she needs this for dashboard charts)
  📤 Sample JSON for hotspot API (for the analyst dashboard heatmap)
  → Send sample JSONs in WhatsApp

TO PERSON 1 (Vritka) — for integration in Week 5:
  📤 All 6 final deployed API endpoint URLs
  📤 Any environment variables added beyond initial .env
```

### Your API Contract — Define This on Day 1

Save this as `crime-database/API_CONTRACT.md` and share with Person 2 immediately.

```
GET /api/analytics/firs
Query params: district (string), crime_type (string), date_from (YYYY-MM-DD),
              date_to (YYYY-MM-DD), status (string), limit (int, default 50)
Returns:
{
  "firs": [
    {
      "case_number": "KAR/BLR/2025/01847",
      "date_filed": "2025-03-14",
      "crime_type_code": "vehicle_theft",
      "district_name": "Bengaluru Urban",
      "police_station": "Koramangala PS",
      "location_name": "5th Block Koramangala",
      "location_lat": 12.9352,
      "location_lng": 77.6245,
      "status": "open",
      "investigation_officer": "Inspector Ramesh Kumar"
    }
  ],
  "total_count": 1842,
  "filters_applied": { "district": "Bengaluru Urban", "crime_type": "vehicle_theft" }
}

GET /api/analytics/hotspots
Query params: district (string, optional), crime_type (string, optional),
              months_back (int, default 6)
Returns:
{
  "hotspots": [
    {
      "cell_lat": 12.9352,
      "cell_lng": 77.6245,
      "crime_count": 47,
      "severity_score": 72.5,
      "top_crime_types": ["vehicle_theft", "chain_snatching"],
      "district": "Bengaluru Urban",
      "area_name": "Koramangala 5th Block"
    }
  ],
  "total_crimes_analyzed": 8421,
  "analysis_period_months": 6,
  "grid_cell_size_meters": 500
}

GET /api/analytics/underreporting
Returns:
{
  "dark_zones": [
    {
      "district": "Yelahanka",
      "score": 78,
      "actual_rate_per_lakh": 212,
      "expected_rate_per_lakh": 487,
      "gap_percentage": 56.5,
      "reason": "FIR rate is 56.5% below state average",
      "recommended_action": "Increase community outreach and beat officer presence"
    }
  ],
  "state_average_rate_per_lakh": 441,
  "total_districts_analyzed": 15
}

GET /api/analytics/victim-vulnerability
Returns:
{
  "top_risk_profiles": [
    {
      "profile": "Women above 50, domestic workers, evening hours",
      "avg_vulnerability_score": 87,
      "victim_count": 234,
      "primary_crime_type": "chain_snatching",
      "high_risk_districts": ["Shivajinagar", "Jayanagar"]
    }
  ],
  "high_risk_windows": [
    {
      "time_window": "7pm-9pm",
      "district": "MG Road area",
      "crime_type": "chain_snatching",
      "victim_count_in_window": 156
    }
  ],
  "recommendation": "Deploy female beat officers near Shivajinagar markets 6pm-10pm"
}

GET /api/analytics/repeat-offenders
Returns:
{
  "high_risk_offenders": [
    {
      "accused_id": 145,
      "name": "Accused Name",
      "risk_score": 92,
      "total_firs": 7,
      "crime_types": ["vehicle_theft", "burglary"],
      "districts_active": ["Whitefield", "Koramangala", "HSR Layout"],
      "modus_operandi": "Targets parked vehicles near IT parks between 2-4pm",
      "last_crime_date": "2026-03-14",
      "status": "active"
    }
  ],
  "total_repeat_offenders": 87,
  "high_risk_count": 23
}

GET /api/analytics/trends
Query params: crime_type (string, optional), district (string, optional),
              groupby (monthly|quarterly|yearly, default monthly),
              year (int, optional)
Returns:
{
  "trend_data": [
    {
      "period": "Jan 2026",
      "period_start": "2026-01-01",
      "count": 847,
      "change_pct": 12.5,
      "is_spike": false
    }
  ],
  "seasonal_insight": "Vehicle theft consistently peaks in October-November",
  "overall_trend": "increasing",
  "average_per_period": 782,
  "spike_periods": ["Oct 2025", "Nov 2025"],
  "crime_type_filter": "vehicle_theft",
  "district_filter": null
}
```

---

## CRITICAL — No Hardcoding Rules for Person 3

| What | Wrong | Correct |
|------|-------|---------|
| DB credentials | written in script | `process.env.CATALYST_DB_*` |
| Grid cell size | `0.005` in code | `config.HOTSPOT_GRID_SIZE` from config file |
| Under-reporting threshold | `40` in code | `config.UNDERREPORTING_THRESHOLD_PCT` |
| Risk score weights | `0.3, 0.2, 0.5` in code | `config.RISK_WEIGHTS` from config file |
| Population data | numbers in code | loaded from `census-data.json` file |
| Max results | `20` in code | `parseInt(process.env.MAX_HOTSPOTS)` or config |
| NCRB crime distributions | typed manually | loaded from downloaded CSV files |

**Important ZCQL limit to know:**  
ZCQL supports a maximum of five WHERE conditions in a single query. If you need more filters, run two queries and merge results in JavaScript.

---

## YOUR COMPLETE TASK LIST (Overview)

```
Day 1      → Setup tools, clone branch, verify DB access
Day 2      → Download all real datasets (NCRB, census, OpenCity)
Day 3      → Write and run Python data loading script (FIRs, accused, victims)
Day 4      → Verify data quality, create analytics config file
Day 5      → Build FIRs API (the simplest, builds your ZCQL confidence)
Week 2     → Build Hotspot Detection API
Week 2     → Build Trends API
Week 3     → Build Repeat Offenders API
Week 3     → Build Victim Vulnerability API
Week 3     → Build Under-Reporting Radar API
Week 4     → Share all API contracts with Person 2 + run integration test
Week 5-6   → Support integration, fix any data bugs found during testing
```

---

## DAY 1 — Setup Your Environment

### Step 1: Install Tools

**Check Python:**
```bash
python --version
# OR
python3 --version
```
Need Python 3.9 or higher. If not installed: **https://python.org/downloads**

**Check Node.js:**
```bash
node --version
```
Need v18+. If not installed: **https://nodejs.org** → Download LTS

**Install Python data libraries:**
```bash
pip install pandas mysql-connector-python python-dotenv faker openpyxl requests
# If you get permission errors on Mac/Linux:
pip3 install pandas mysql-connector-python python-dotenv faker openpyxl requests
```

**Install Node.js dependencies:**
```bash
npm install -g @zohocloud/catalystcli
```

### Step 2: Clone and Set Up Your Branch

```bash
git clone https://github.com/VEDESH_USERNAME/drishti-ksp.git
cd drishti-ksp
git checkout crime-database
git branch
# Should show: * crime-database
```

Create your module structure:
```bash
mkdir -p crime-database/functions/firs
mkdir -p crime-database/functions/hotspots
mkdir -p crime-database/functions/underreporting
mkdir -p crime-database/functions/victim-vulnerability
mkdir -p crime-database/functions/repeat-offenders
mkdir -p crime-database/functions/trends
mkdir -p crime-database/data-scripts
mkdir -p crime-database/raw-data/ncrb
mkdir -p crime-database/raw-data/census
mkdir -p crime-database/config
```

**Note:** `raw-data/` is in .gitignore — downloaded files never go to GitHub.

Initialize Node.js:
```bash
cd crime-database
npm init -y
npm install zcatalyst-sdk-node dotenv express
```

### Step 3: Create Your .env File

Copy the .env from Vedesh. Add these extra variables for your module:
```
# Catalyst DB (from Vritka)
CATALYST_DB_HOST=xxxx
CATALYST_DB_PORT=3306
CATALYST_DB_NAME=DRISHTI_KSP
CATALYST_DB_USER=xxxx
CATALYST_DB_PASSWORD=xxxx
CATALYST_PROJECT_ID=xxxx
CATALYST_ACCOUNT_ID=xxxx

# Analytics configuration (you set these)
MAX_HOTSPOTS=25
MAX_REPEAT_OFFENDERS=20
MAX_TRENDS_PERIODS=24
ANALYTICS_PORT=3001
```

### Step 4: Verify Database Access

Create `crime-database/test-db.js`:
```
Write a Node.js script test-db.js that:
1. Loads .env using dotenv
2. Initializes zcatalyst-sdk-node in admin scope
3. Runs this ZCQL query:
   SELECT COUNT(*) as total FROM FIRs
4. Runs: SELECT COUNT(*) as total FROM Accused
5. Runs: SELECT COUNT(*) as total FROM Cameras
6. Prints the results for each
7. If any query returns an error: prints ❌ FAIL with the error message
8. If all succeed: prints ✅ Database connection working, FIR count: X

Note: Use catalyst.initialize with { scope: 'admin' } for analytics queries.
Pattern: const adminApp = catalyst.initialize(req, { scope: 'admin' });
         const zcql = adminApp.zcql();
         const result = await zcql.executeZCQLQuery('SELECT COUNT(*) as total FROM FIRs');
```

Run it:
```bash
node test-db.js
```

If you get `✅ Database connection working` — you are ready for Day 2.

If you get an error — message Vedesh immediately. It is a credentials problem.

---

## DAY 2 — Download Real Datasets

All downloads go into `crime-database/raw-data/`. This folder is in `.gitignore`.
After downloading, share the files with Vedesh via Google Drive (he needs them too).

### DATASET 1 — Karnataka District Crime Statistics (Most Important)
**URL:** **https://data.opencity.in/dataset/karnataka-crime-data-2024**

This is total IPC and SLL crimes at city and district level for 2023 in Karnataka — public domain data with CSV and PDF downloads.

Steps:
1. Go to the URL above
2. Download every available CSV file on the page
3. Also download from 2023: **https://data.opencity.in/dataset/karnataka-crime-data-2023**
4. Also download from 2022: **https://data.opencity.in/dataset/karnataka-crime-data-2022**
5. Save all in: `crime-database/raw-data/ncrb/`

**What you are looking for in these files:**
- A table with columns like: District, Murder, Robbery, Burglary, Theft, Auto Theft, etc.
- Total counts per district per crime type
- These real totals are what your synthetic FIRs must match

### DATASET 2 — NCRB District-Wise IPC Crimes (All India)
**URL:** **https://data.gov.in/catalog/district-wise-crimes-under-various-sections-indian-penal-code-ipc-crimes**

This is district-wise data on crimes committed under IPC including Murder, Attempt to Murder, Rape, Kidnapping, Dacoity, Robbery, Burglary, Theft, Auto Theft, Riots, Cheating, and other IPC crimes.

Steps:
1. Go to the URL above
2. Filter by State: Karnataka
3. Download the most recent year available as CSV
4. Save in: `crime-database/raw-data/ncrb/ipc-district-wise.csv`

### DATASET 3 — KSP SCRB Crime Review 2023
**URL:** **https://www.data.gov.in/catalog/crime-review-year-2023**

This is the official Crime Review published by the State Crime Records Bureau (SCRB), Karnataka — IPC SLL statistics, available via Karnataka Police Computer Wing.

Steps:
1. Go to the URL
2. Click "Zip Download" or download individual CSV/PDF files
3. Save in: `crime-database/raw-data/ncrb/ksp-crime-review-2023/`

### DATASET 4 — NCRB Full 2023 Report (for demographic distributions)
**URL:** **https://data.opencity.in/dataset/crime-in-india-2023**

This has multiple tables including:
- Victims of murder by gender and age group
- Crime against women — category wise
- Crime against senior citizens
- Accused demographics

Steps:
1. Go to the URL
2. Download the Excel/CSV files (look for XLSX download buttons)
3. Specifically look for and download:
   - "City-wise Cases Registered 156_3 under IPC during 2023" (XLSX)
   - Any table with victim age/gender breakdown
4. Save in: `crime-database/raw-data/ncrb/`

### DATASET 5 — Karnataka Census Population Data
**URL:** **https://censusindia.gov.in/census.website/data/census-tables**

If the census website is slow or complex, use this alternative approach:

Go to Claude and paste:
```
Give me Karnataka district population data from Census 2011 (the most recent census)
in CSV format. Include these 30 districts of Karnataka:
Bengaluru Urban, Bengaluru Rural, Mysuru, Belagavi, Dakshina Kannada, 
Kalaburagi, Ballari, Shivamogga, Mangaluru/Dakshina Kannada, Udupi, 
Dharwad, Bidar, Vijayapura, Raichur, Tumakuru, Hassan, Mandya, Chamarajanagar,
Chikkamagaluru, Kodagu, Chikkaballapur, Kolar, Ramanagara, Yadgir,
Koppal, Gadag, Haveri, Uttara Kannada, Bagalkot, Chitradurga

For each district provide:
total_population, male_population, female_population, urban_population,
rural_population, literacy_rate_pct, population_under_18, population_over_60,
population_density_per_sqkm, area_sqkm

Use real 2011 Census figures. Output ONLY CSV.
```
Save the output as: `crime-database/raw-data/census/karnataka-districts-2011.csv`

---

## DAY 3 — Write the Data Loading Script

This is the most critical thing you build. Take your time here. A good data script means all APIs work correctly. A bad one means everything is wrong.

### Step 1: Understand the Data Philosophy

Before writing any code, read this.

**What the script does:**
1. Reads real NCRB data → learns how many crimes of each type happen in each district
2. Uses those REAL totals to generate individual FIR records (synthetic but statistically correct)
3. Generates accused and victim records with realistic demographics
4. Loads everything into Catalyst Data Store

**Why this is not "fake data":**
If NCRB says Bengaluru Urban had 4,521 vehicle thefts in 2023 — our database will have 4,521 vehicle theft FIR records for Bengaluru Urban in 2023. The FIR numbers, addresses, and names are synthetic but the COUNTS and DISTRIBUTIONS are real. This is called statistically grounded synthetic data.

### Step 2: Create the Analytics Config File

Create `crime-database/config/analytics-config.json`:

Paste this into Claude and use the output:
```
Create a JSON config file for DRISHTI analytics. This file contains all tunable 
parameters so nothing needs to be hardcoded in the analytics functions.

Include:

HOTSPOT_DETECTION:
  grid_cell_degrees: 0.005 (approximately 500m at Bengaluru's latitude)
  min_crimes_for_hotspot: 3
  recency_weight_30days: 1.5
  violent_crime_weight: 2.0
  max_results: 25

UNDERREPORTING:
  threshold_below_average_pct: 40
  min_population_for_analysis: 100000
  expected_rate_per_lakh_population: 450

RISK_SCORING (for repeat offenders):
  weights:
    fir_count: { 1: 10, 2: 20, 3: 35, 4: 50, 5: 60, "6+": 70 }
    recency_months_6: 20
    recency_months_12: 10
    has_violent_crimes: 15
    multi_district: 10
    has_prior_convictions: 15
  max_score: 100
  high_risk_threshold: 70

VULNERABILITY_SCORING (for victims):
  weights:
    age_under18: 30
    age_over60: 30
    age_18to30: 15
    gender_female: 20
    occupation_vulnerable: 15
    crime_severity_high: 15
    time_night: 10
    location_hotspot: 10
  max_score: 100

SEASONAL_PATTERNS:
  vehicle_theft_peak_months: [10, 11, 12]
  chain_snatching_peak_months: [10, 11]
  cybercrime_stable_months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  fraud_peak_months: [1, 3, 4]
  
BENGALURU_BOUNDS:
  lat_min: 12.85
  lat_max: 13.05
  lng_min: 77.50
  lng_max: 77.70

Output valid JSON only.
```

### Step 3: Create the Population Data File

Create `crime-database/config/census-data.json` by running this script:

Create `crime-database/data-scripts/prepare-census.py`:
```
Write a Python script prepare-census.py that:
1. Reads crime-database/raw-data/census/karnataka-districts-2011.csv
2. Calculates for each district:
   - fir_population_base: use urban_population for urban districts, 
     total_population * 0.4 for rural districts
     (crimes are more urban, so we weight toward urban population)
3. Outputs a JSON file: crime-database/config/census-data.json
   Format: { "districts": [ { "name": "...", "total_population": N, 
     "fir_population_base": N, "urban_pct": N, "over_60_count": N, 
     "under_18_count": N, "lat_center": N, "lng_center": N } ] }
4. Also hardcode approximate lat/lng center for each Karnataka district 
   (use real approximate values — look them up):
   Bengaluru Urban: 12.9716, 77.5946
   Mysuru: 12.2958, 76.6394
   Belagavi: 15.8497, 74.4977
   Mangaluru: 12.9141, 74.8560
   Hubli-Dharwad: 15.3647, 75.1240
   etc.
Include error handling. Print progress.
```

Run it:
```bash
cd crime-database
python3 data-scripts/prepare-census.py
```

### Step 4: Create the Main Data Loading Script

Create `crime-database/data-scripts/load-ncrb-data.py`:

Paste this prompt into Claude and copy the entire output:
```
Write a complete Python data loading script for DRISHTI crime database.

File: data-scripts/load-ncrb-data.py

DEPENDENCIES: pandas, mysql-connector-python, python-dotenv, faker, json, random, datetime

The script loads data from the .env file (DB credentials) and from these config files:
- crime-database/config/analytics-config.json
- crime-database/config/census-data.json

SECTION 1: Database connection
def get_db_connection():
  Connect to MySQL using credentials from .env using mysql-connector-python.
  Set charset to utf8mb4.
  Return the connection object.
  Include retry logic: try 3 times before failing.

SECTION 2: load_districts_and_police_stations()
  Read census-data.json → insert each district into Districts table
  For police stations: generate 5-8 realistic police station names per district
  using real Karnataka PS naming conventions: "[Area] Police Station"
  For Bengaluru Urban: use these REAL police station names:
  Koramangala PS, Whitefield PS, Indiranagar PS, Yelahanka PS, Hebbal PS,
  Shivajinagar PS, Marathahalli PS, HSR Layout PS, BTM Layout PS, 
  JP Nagar PS, Jayanagar PS, Rajajinagar PS, Malleswaram PS,
  Electronic City PS, Banashankari PS, Basavanagudi PS, Ulsoor PS,
  HAL Airport PS, Banaswadi PS, KR Puram PS, RT Nagar PS
  Each station gets approximate GPS coordinates within its area.

SECTION 3: load_crime_types()
  Insert these crime type mappings into CrimeTypes table:
  vehicle_theft → IPC 379/378, severity 2
  chain_snatching → IPC 392/356, severity 3
  burglary → IPC 454/457, severity 3
  robbery → IPC 392, severity 4
  assault → IPC 323/324/325, severity 3
  fraud → IPC 420, severity 2
  cybercrime → IT Act 66/66C/66D, severity 2
  drug_offence → NDPS Act 20/22, severity 3
  murder → IPC 302, severity 5
  eve_teasing → IPC 354/509, severity 2
  kidnapping → IPC 363/364, severity 5
  hit_and_run → IPC 304A/279, severity 3
  property_crime → IPC 427/447, severity 1
  domestic_violence → IPC 498A, severity 3
  senior_citizen_crime → IPC (various), severity 3

SECTION 4: read_ncrb_crime_totals()
  Try to read from raw-data/ncrb/ folder.
  Look for any CSV file that has district names and crime type columns.
  Parse the file: identify district column (likely named 'District' or 'DISTRICT')
  and crime count columns.
  
  If CSV files cannot be read (wrong format, missing), fall back to these 
  REAL NCRB 2023 statistics for Karnataka (use these as hardcoded fallback ONLY):
  
  Return a dict like: { 'Bengaluru Urban': { 'vehicle_theft': 4521, 
    'chain_snatching': 1834, 'burglary': 2103, 'robbery': 412, 
    'fraud': 8921, 'cybercrime': 12043, ... }, ... }
  
  Use these approximate REAL NCRB 2023 values as fallback:
  Bengaluru Urban: vehicle_theft=4521, fraud=8921, cybercrime=12043,
    burglary=2103, chain_snatching=1834, robbery=412, assault=2841,
    murder=206, domestic_violence=2103, senior_citizen_crime=649
  Mysuru: vehicle_theft=1243, fraud=2103, burglary=876, 
    chain_snatching=412, cybercrime=1834, assault=921
  Belagavi: vehicle_theft=876, fraud=1243, burglary=654, assault=1102
  Dakshina Kannada: vehicle_theft=654, fraud=987, cybercrime=876
  Kalaburagi: vehicle_theft=543, fraud=765, assault=876, burglary=432
  (add 10 more districts with proportionally smaller numbers)

SECTION 5: generate_and_load_firs(crime_totals)
  For each district × crime_type with count > 0:
    For each FIR to generate (count):
      date_filed: distribute across 2022-2025 with seasonal weighting
        (use analytics-config SEASONAL_PATTERNS — months in peak list get 
        2x weight when choosing the month)
      time_filed: 60% between 18:00-02:00, 40% between 06:00-18:00
      case_number: format "KAR/{DIST_CODE}/{YEAR}/{NNNN:04d}" 
        where DIST_CODE is first 3 letters of district uppercase
        and NNNN is sequential per district per year
      location_lat, location_lng: random point within ±0.1 degrees 
        of district center
      police_station: randomly pick from that district's stations
      investigation_officer: generate Indian name using Faker('en_IN')
      status: weighted random — 50% open, 30% under_investigation, 
        15% chargesheeted, 5% closed
      description: generate a 1-sentence description appropriate for crime type
        Example for vehicle_theft: 
        "Vehicle KA-{random}-{random} stolen from {location_name} parking area"
        Include a vehicle plate number format KA-XX-YY-NNNN for vehicle crimes
        
  Use batch INSERT for efficiency (insert 500 rows at a time, not one by one)
  Print progress every 1000 rows

SECTION 6: generate_accused(db_connection)
  Query all FIRs from DB.
  For each FIR generate 1 primary accused (2 accused for robbery/chain_snatching).
  
  Accused demographics matching NCRB 2023 Karnataka patterns:
  - 75% male, 25% female
  - Age distribution: 18-25 (35%), 26-35 (30%), 36-45 (20%), 46+ (15%)
  - prior_convictions: 25% have > 0, 8% have > 2
  - Occupation: daily_labourer (25%), unemployed (20%), driver (15%), 
    shopkeeper (10%), student (8%), other (22%)
  - Names: use Faker('kn_IN') for Kannada names, Faker('en_IN') for others
    (70% Kannada names, 30% other South Indian names)
  - modus_operandi: pick from a list of 15 realistic MO descriptions per crime type
    e.g., for vehicle_theft: 
    ["Breaks window with stone then hotwires", "Uses duplicate key",
     "Targets vehicles parked near markets during peak hours",
     "Operates in pairs — one distracts, one steals"]
  
  IMPORTANT — Repeat Offenders:
  After generating all accused, pick 15 random accused and assign them to 
  4-8 additional FIRs each (insert extra FIR_Accused records).
  These are your "repeat offenders" — critical for the demo.
  Set their risk_score = 70-95.
  Set their prior_convictions = 3-8.

SECTION 7: generate_victims(db_connection)
  Query all FIRs. For each FIR generate 1 victim.
  
  Victim demographics matching NCRB 2023 patterns:
  - chain_snatching: 65% female, age 40-70
  - cybercrime: 45% elderly (55+), 35% middle aged (35-55)
  - vehicle_theft: 70% male, age 25-50
  - domestic_violence: 95% female, age 20-45
  - senior_citizen_crime: 100% age 60+, 55% female
  - assault: 60% male, age 20-40
  - murder: 55% male, age 25-50
  
  Calculate vulnerability_score using analytics-config VULNERABILITY_SCORING weights.

SECTION 8: update_anpr_watchlist(db_connection)
  Query all FIRs where crime_type_code IN ('vehicle_theft', 'robbery', 
  'chain_snatching') AND status != 'closed'.
  
  For each: scan description column for plate pattern KA-\d{2}-[A-Z]{1,2}-\d{4}
  If found: insert into ANPR_Watchlist table.
  If not found but crime_type = 'vehicle_theft': generate a plate and add to 
  FIR description, then insert into ANPR_Watchlist.
  
  Set 80% as alert_active = 1.
  For the 15 repeat offenders' FIRs: set priority = 'high'.

Main execution: call all sections in order with progress printing.
Print summary at end: districts loaded, police stations, crime types, FIRs generated,
accused generated, victims generated, ANPR watchlist entries.
```

### Step 5: Run the Script

```bash
cd crime-database
python3 data-scripts/load-ncrb-data.py
```

This will take 5-15 minutes depending on how many records are generated.

Watch for progress output. If it fails at any section, read the error and paste into Claude for a fix.

Expected final output:
```
✅ Districts loaded: 30
✅ Police stations loaded: 180
✅ Crime types loaded: 15
✅ FIRs generated: ~45,000 to ~80,000 (depends on NCRB totals)
✅ Accused generated: ~50,000
✅ Victims generated: ~45,000
✅ ANPR watchlist entries: ~12,000
Data loading complete.
```

### Step 6: Verify Data Quality in ZCQL Console

Go to Catalyst Dashboard → Data Store → SQL Console (or ZCQL Console).

Run these verification queries:
```sql
-- 1. Total FIRs (should be tens of thousands)
SELECT COUNT(*) as total FROM FIRs;

-- 2. Crime distribution — should reflect NCRB proportions
SELECT crime_type_code, COUNT(*) as count 
FROM FIRs GROUP BY crime_type_code ORDER BY count DESC;

-- 3. District distribution — Bengaluru Urban should be highest
SELECT district_name, COUNT(*) as count 
FROM FIRs GROUP BY district_name ORDER BY count DESC LIMIT 10;

-- 4. Seasonal verification for vehicle theft (Oct-Dec should be higher)
SELECT month, COUNT(*) as count FROM FIRs 
WHERE crime_type_code = 'vehicle_theft'
GROUP BY month ORDER BY month;

-- 5. Repeat offenders exist
SELECT accused_id, COUNT(*) as fir_count FROM FIR_Accused 
GROUP BY accused_id HAVING fir_count > 3 ORDER BY fir_count DESC LIMIT 10;

-- 6. ANPR watchlist has entries
SELECT COUNT(*) as total FROM ANPR_Watchlist WHERE alert_active = 1;

-- 7. Victims have variety in vulnerability scores
SELECT vulnerability_score, COUNT(*) as count FROM Victims 
GROUP BY vulnerability_score ORDER BY vulnerability_score DESC LIMIT 10;
```

If Check 4 shows all months roughly equal → seasonal weighting failed → fix the script.
If Check 5 returns no results → repeat offender generation failed → fix the script.
Both of these are critical for the demo.

---

## DAY 4 — Create Analytics Config and Helper Functions

### Step 1: Create the Shared DB Helper

Create `crime-database/utils/db-helper.js`:

Paste this into Claude:
```
Write a Node.js utility module db-helper.js for DRISHTI.

Purpose: provides reusable database query functions for all analytics functions.

All functions use zcatalyst-sdk-node in admin scope.
Import: require('dotenv').config()

Pattern for ZCQL queries (CONFIRMED SDK pattern):
const catalyst = require('zcatalyst-sdk-node');
const adminApp = catalyst.initialize(req, { scope: 'admin' });
const zcql = adminApp.zcql();
const result = await zcql.executeZCQLQuery('SELECT ... FROM ...');
// result is an array of objects

IMPORTANT ZCQL LIMIT: Maximum 5 WHERE conditions per query.
If more filters are needed, run multiple queries and merge in JavaScript.

Export these functions:

async function executeQuery(req, sqlQuery)
  Runs a ZCQL query and returns the array of result objects.
  On error: logs the error and returns empty array (never throws).

async function getFIRsFiltered(req, filters)
  filters: { district, crime_type, date_from, date_to, status, limit }
  Build a ZCQL SELECT query on FIRs table.
  Apply filters using WHERE conditions (max 3 conditions at once due to ZCQL limit).
  If more than 3 filters: run two queries and intersect results by fir_id.
  ORDER BY date_filed DESC.
  LIMIT to filters.limit (default 50, max 500).
  Return array of FIR objects.

async function getDistrictCounts(req, crime_type, months_back)
  SELECT district_name, COUNT(*) as count FROM FIRs 
  WHERE crime_type_code = ? AND date_filed > [cutoff date]
  GROUP BY district_name
  Return array of { district_name, count }.

async function getAllFIRCoordinates(req, filters)
  SELECT fir_id, location_lat, location_lng, crime_type_code, 
         district_name, date_filed FROM FIRs
  Apply basic date/type filter if provided.
  Return array of coordinate objects (for hotspot calculation).
  Note: This may return large datasets — always apply a date filter.

async function getRepeatAccused(req)
  This requires a JOIN query (not possible in ZCQL directly).
  Workaround: 
  Step 1: SELECT accused_id, COUNT(*) as fir_count FROM FIR_Accused GROUP BY accused_id
  Step 2: Filter in JavaScript to keep only accused_id where fir_count > 1
  Step 3: For each repeated accused_id: SELECT * FROM Accused WHERE ROWID = accused_id
  Return array of accused with fir_count added.

async function getVictimsByFIRType(req, crime_type)
  SELECT Victims.* FROM Victims, FIR_Victims, FIRs 
  (ZCQL supports JOINs — use: SELECT v.age, v.gender, v.vulnerability_score 
   FROM Victims v, FIR_Victims fv, FIRs f 
   WHERE fv.victim_id = v.ROWID AND fv.fir_id = f.ROWID 
   AND f.crime_type_code = '[crime_type]' LIMIT 500)
  Return victim array.

Export all as named exports: { executeQuery, getFIRsFiltered, getDistrictCoordinates,
getAllFIRCoordinates, getRepeatAccused, getVictimsByFIRType }
```

### Step 2: Create the Hotspot Calculator Utility

Create `crime-database/utils/hotspot-calculator.js`:
```
Write a Node.js utility hotspot-calculator.js.

It takes an array of crime coordinates and returns hotspot grid cells.

function calculateHotspots(crimePoints, config)
  crimePoints: array of { fir_id, location_lat, location_lng, crime_type_code, date_filed }
  config: object from analytics-config.json (HOTSPOT_DETECTION section)

Algorithm:
1. Create a grid: divide lat/lng space into cells of size config.grid_cell_degrees
   Cell key = Math.floor(lat / cellSize) + ',' + Math.floor(lng / cellSize)
2. For each crime point: assign to its grid cell
3. For each cell with crimes:
   base_score = crime_count
   violent_bonus = count of violent crimes in cell × (config.violent_crime_weight - 1)
   recency_bonus = count of crimes in last 30 days × (config.recency_weight_30days - 1)
   total_score = base_score + violent_bonus + recency_bonus
4. Filter cells with crime_count >= config.min_crimes_for_hotspot
5. Sort by total_score descending
6. Return top config.max_results cells

For each returned cell:
  cell_lat = (Math.floor(lat / cellSize) + 0.5) * cellSize  (center of cell)
  cell_lng = similarly
  top_crime_types: top 3 crime types by count in this cell
  district: most common district in this cell
  area_name: derive from lat/lng (use a simple lookup of known Bengaluru area coordinates)

Return array of hotspot objects matching the API contract format.

Export as: module.exports = { calculateHotspots };
```

---

## DAY 5 — Build the FIRs API (Simplest — Start Here)

Building this first teaches you the ZCQL pattern. All other APIs use the same pattern.

Create `crime-database/functions/firs/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for the FIRs API.

File: functions/firs/index.js

GET /api/analytics/firs
Query parameters: district, crime_type, date_from (YYYY-MM-DD), 
                  date_to (YYYY-MM-DD), status, limit (default 50)

ZCQL implementation:
1. Initialize Catalyst in admin scope: 
   const adminApp = catalyst.initialize(req, { scope: 'admin' });
   const zcql = adminApp.zcql();

2. Build the ZCQL query dynamically:
   Base: SELECT fir_id, case_number, date_filed, time_filed, crime_type_code,
         district_name, police_station, location_name, location_lat, location_lng,
         status, investigation_officer FROM FIRs
   
   Build WHERE conditions array (max 3 due to ZCQL limit):
   - If district provided: add "district_name = 'VALUE'"
   - If crime_type provided: add "crime_type_code = 'VALUE'"  
   - If status provided: add "status = 'VALUE'"
   
   Add: ORDER BY date_filed DESC LIMIT [limit]
   
   Note: date_from and date_to filtering — do this in JavaScript after fetching
   (to avoid hitting the 5 WHERE condition limit with other filters)

3. Execute query:
   const results = await zcql.executeZCQLQuery(queryString);
   
4. Apply date filtering in JavaScript:
   if (date_from) filter results where date_filed >= date_from
   if (date_to) filter results where date_filed <= date_to

5. Also run a count query (separate ZCQL call):
   SELECT COUNT(*) as total FROM FIRs [with same district/crime_type WHERE]

6. Return JSON matching the API contract:
{
  firs: [mapped results],
  total_count: N,
  filters_applied: { district, crime_type, date_from, date_to, status }
}

IMPORTANT: Sanitize all query parameter inputs before building ZCQL query.
Replace single quotes with empty string. Never concatenate user input directly.

Add CORS headers:
res.set('Access-Control-Allow-Origin', '*');
res.set('Content-Type', 'application/json');

Handle errors: return 500 with { error: true, message: error.message }
Export as: module.exports = async (req, res) => { ... }
```

Test it:
```bash
# Test locally using a mock request
node -e "
const fn = require('./functions/firs/index.js');
const req = { query: { district: 'Bengaluru Urban', crime_type: 'vehicle_theft', limit: '10' } };
const res = { set: () => {}, status: (c) => ({ json: (d) => console.log('STATUS:', c, JSON.stringify(d, null, 2)) }), json: (d) => console.log(JSON.stringify(d, null, 2)) };
fn(req, res);
"
```

Expected: JSON with array of FIRs for Bengaluru Urban vehicle theft.

---

## WEEK 2 — Build the Hotspot Detection API

Create `crime-database/functions/hotspots/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for crime hotspot detection.

File: functions/hotspots/index.js

GET /api/analytics/hotspots
Query params: district (optional), crime_type (optional), months_back (int, default 6)

Dependencies:
- zcatalyst-sdk-node (admin scope)
- dotenv
- analytics-config from: require('../../config/analytics-config.json')
- hotspot-calculator from: require('../../utils/hotspot-calculator')

STEP 1: Parse query parameters
  district = req.query.district || null
  crime_type = req.query.crime_type || null
  months_back = parseInt(req.query.months_back) || 6
  date_cutoff = new Date(Date.now() - months_back * 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]  // format YYYY-MM-DD

STEP 2: Query crime coordinates from database
  Initialize Catalyst admin scope.
  Build ZCQL query:
    SELECT fir_id, location_lat, location_lng, crime_type_code, district_name,
           date_filed FROM FIRs 
    WHERE date_filed >= '[date_cutoff]'
    [AND district_name = '[district]' if provided — count as 2nd WHERE condition]
    [AND crime_type_code = '[crime_type]' if provided — count as 3rd WHERE condition]
    LIMIT 10000
    
  Execute query. If result is empty, return empty hotspots array.

STEP 3: Filter out records where location_lat or location_lng is null or 0

STEP 4: Call hotspot calculator:
  const config = require('../../config/analytics-config.json');
  const hotspots = calculateHotspots(filteredResults, config.HOTSPOT_DETECTION);

STEP 5: Count total crimes analyzed
  const totalCrimes = filteredResults.length;

STEP 6: Return response matching API contract

CORS headers. Error handling — return 500 on any uncaught error.
Export as Catalyst function.
```

---

## WEEK 2 — Build the Trends API

Create `crime-database/functions/trends/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for crime trend analysis.

File: functions/trends/index.js

GET /api/analytics/trends
Query params: crime_type (optional), district (optional),
              groupby (monthly|quarterly|yearly, default monthly),
              year (optional, e.g., 2025)

STEP 1: Parse parameters and determine date grouping:
  monthly: group by YYYY-MM
  quarterly: group by YYYY-Q1/Q2/Q3/Q4
  yearly: group by YYYY

STEP 2: Query FIRs from database:
  SELECT fir_id, date_filed, crime_type_code, district_name FROM FIRs
  WHERE [crime_type filter if provided]
  [AND district filter if provided]
  LIMIT 50000
  
  Apply year filter in JavaScript if year param provided.

STEP 3: Group and count in JavaScript:
  Use a Map keyed by period string (e.g., "2025-03" for monthly)
  Count crimes per period
  Sort by period chronologically

STEP 4: Calculate change percentages:
  For each period after the first: 
  change_pct = ((current_count - prev_count) / prev_count) * 100
  Round to 1 decimal place
  is_spike = change_pct > 25

STEP 5: Identify seasonal insight:
  Load analytics-config.json SEASONAL_PATTERNS
  Check which months have the most crimes for the filtered crime_type
  Generate a natural-language seasonal insight string

STEP 6: Calculate overall trend:
  Compare average of first half of periods vs second half
  If second half average > first half by 10%: "increasing"
  If second half average < first half by 10%: "decreasing"
  Otherwise: "stable"

STEP 7: Return response matching API contract:
{
  trend_data: [...],
  seasonal_insight: "...",
  overall_trend: "increasing|decreasing|stable",
  average_per_period: N,
  spike_periods: [...],
  crime_type_filter: "...",
  district_filter: "..."
}

CORS headers. Error handling. Export as Catalyst function.
```

---

## WEEK 3 — Build the Repeat Offenders API

Create `crime-database/functions/repeat-offenders/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for repeat offender risk analysis.

File: functions/repeat-offenders/index.js

GET /api/analytics/repeat-offenders
Query params: min_firs (int, default 2), limit (int, default 20)

IMPORTANT: ZCQL does not support direct JOINs with GROUP BY for this use case.
Use this two-step approach:

STEP 1: Get FIR count per accused from FIR_Accused table:
  SELECT accused_id, COUNT(*) as fir_count FROM FIR_Accused 
  GROUP BY accused_id ORDER BY fir_count DESC LIMIT 200
  
  This gives you the top 200 most-frequent accused persons.

STEP 2: Filter by min_firs in JavaScript:
  Keep only entries where fir_count >= (req.query.min_firs || 2)

STEP 3: For each repeat accused (up to limit × 2), fetch their details:
  Batch into groups of 10.
  For each batch: run ZCQL:
    SELECT * FROM Accused WHERE ROWID = [id1] OR ROWID = [id2] ... (up to 5 per query)
  
  Note: ZCQL WHERE allows OR conditions. Use: WHERE ROWID = X OR ROWID = Y OR ROWID = Z

STEP 4: For each accused, fetch their FIRs:
  SELECT f.crime_type_code, f.district_name, f.date_filed, f.status
  FROM FIRs f, FIR_Accused fa
  WHERE fa.fir_id = f.ROWID AND fa.accused_id = [accused_id]
  LIMIT 20
  
  Note on ZCQL joins: format is: FROM Table1 t1, Table2 t2 WHERE t1.col = t2.col

STEP 5: Calculate risk score for each accused:
  Load config from analytics-config.json RISK_SCORING section.
  Apply weights based on:
  - fir_count (use config.weights.fir_count lookup table)
  - Most recent crime within 6 months? Add config.recency_months_6
  - Has violent crimes in history? Add config.has_violent_crimes weight
  - Active in 3+ districts? Add config.multi_district weight
  - prior_convictions > 0? Add config.has_prior_convictions weight
  Cap at config.max_score (100)

STEP 6: Sort by risk_score descending, take top [limit]

STEP 7: Return response matching API contract

CORS headers. Error handling. Export as Catalyst function.
```

---

## WEEK 3 — Build the Victim Vulnerability API

Create `crime-database/functions/victim-vulnerability/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for victim vulnerability analysis.

File: functions/victim-vulnerability/index.js

GET /api/analytics/victim-vulnerability

STEP 1: Load configuration:
  const config = require('../../config/analytics-config.json');
  const censusData = require('../../config/census-data.json');

STEP 2: Query all victims with their linked FIR crime type:
  Use a JOIN query:
  SELECT v.victim_id, v.age, v.gender, v.occupation, v.district_id,
         v.vulnerability_score, f.crime_type_code, f.district_name, 
         f.time_filed, f.location_lat, f.location_lng
  FROM Victims v, FIR_Victims fv, FIRs f
  WHERE fv.victim_id = v.ROWID AND fv.fir_id = f.ROWID
  LIMIT 5000

STEP 3: Recalculate vulnerability scores using config weights:
  Apply VULNERABILITY_SCORING weights from config.
  This ensures scores always reflect the latest config, not stale DB values.

STEP 4: Group victims by demographic profile:
  Create profile key = age_group + '|' + gender + '|' + occupation_category
  age_groups: under_18, 18-30, 31-50, 51-60, over_60
  occupation categories: student, working_adult, senior, domestic, other
  
  For each profile group: 
  - Count victims
  - Average vulnerability score
  - Most common crime type
  - Most common districts

STEP 5: Find top 5 highest-average-vulnerability profiles

STEP 6: Find high-risk time windows:
  For victims with vulnerability_score > 70:
  Group by: time_window (morning 6-9, day 9-17, evening 17-20, night 20-24, late_night 0-6)
  AND district_name AND crime_type_code
  Find combinations with count > 10
  Sort by count descending, take top 5

STEP 7: Generate recommendation string:
  Based on top risk profile and time window, generate a deployment recommendation.
  e.g., "Deploy female beat officers near [district] markets during [time_window]"

STEP 8: Return response matching API contract

CORS headers. Error handling. Export as Catalyst function.
```

---

## WEEK 3 — Build the Under-Reporting Radar API

Create `crime-database/functions/underreporting/index.js`:

Paste this into Claude:
```
Build a Node.js Catalyst Serverless Function for crime under-reporting detection.

File: functions/underreporting/index.js

GET /api/analytics/underreporting

STEP 1: Load population data:
  const censusData = require('../../config/census-data.json');
  const config = require('../../config/analytics-config.json');
  
  Build a map: districtPopulation = { 'Bengaluru Urban': 9621551, ... }
  (from censusData.districts array)

STEP 2: Get total FIRs per district from database:
  SELECT district_name, COUNT(*) as fir_count FROM FIRs 
  GROUP BY district_name
  
  Build a map: districtFIRs = { 'Bengaluru Urban': 45231, ... }

STEP 3: Calculate FIR rate per lakh population:
  For each district:
  population = districtPopulation[district] || null
  If population null: skip (we don't have census data for this district)
  fir_population_base = use fir_population_base from censusData (urban-weighted)
  rate_per_lakh = (fir_count / fir_population_base) * 100000
  Round to nearest integer.

STEP 4: Calculate state average rate:
  avg = mean of all districts' rate_per_lakh (exclude outliers > 3 std deviations)

STEP 5: Identify dark zones:
  threshold = config.UNDERREPORTING.threshold_below_average_pct (e.g., 40%)
  For each district:
  expected_rate = state_average
  if district_rate < expected_rate × (1 - threshold/100):
    gap_pct = ((expected_rate - district_rate) / expected_rate) × 100
    score = Math.min(100, Math.round(gap_pct × 1.5))
    
    Classify reason:
    - gap > 70%: "FIR rate is extremely low — possible systemic under-reporting"
    - gap > 50%: "FIR rate is significantly below state average"
    - gap > 40%: "FIR rate is below state average — possible under-reporting"
    
    Recommended action based on score:
    - score > 85: "Immediate investigation into reporting barriers required"
    - score > 65: "Deploy community outreach teams and increase beat officer visits"
    - score > 40: "Monitor closely and conduct community awareness programs"

STEP 6: Sort dark zones by score descending.

STEP 7: Return response matching API contract.

CORS headers. Error handling. Export.
```

---

## TESTING CHECKLIST — Complete Before Telling Vedesh You're Done

### Test 1 — Data Integrity
Run all 7 SQL verification queries from Day 3 Step 6.
- [ ] Total FIRs > 30,000
- [ ] Vehicle theft is top crime in Bengaluru Urban
- [ ] Oct-Nov-Dec has higher vehicle theft than Feb-Mar
- [ ] At least 10 accused with 4+ FIRs
- [ ] ANPR watchlist > 5,000 entries

### Test 2 — FIRs API
```bash
curl "http://localhost:3001/api/analytics/firs?district=Bengaluru%20Urban&crime_type=vehicle_theft&limit=5"
```
Expected: 5 FIR objects with valid lat/lng, case numbers in KAR/BLR/YYYY/NNNN format
- [ ] PASS

### Test 3 — Hotspot API
```bash
curl "http://localhost:3001/api/analytics/hotspots?months_back=6"
```
Expected: 20-25 hotspot objects, all with lat within 12.85-13.05, lng within 77.5-77.7
- [ ] PASS — all coordinates are within Bengaluru bounds

Test 4 — Hotspot Distribution Check (critical for demo):
The top hotspot should be near a commercial/busy area (Koramangala, MG Road, Whitefield)
NOT in the middle of nowhere. If hotspots are in random empty areas → data generation had wrong GPS distribution → fix the loading script.
- [ ] Top 3 hotspots are in recognizable Bengaluru areas

### Test 5 — Trends API
```bash
curl "http://localhost:3001/api/analytics/trends?groupby=monthly&crime_type=vehicle_theft"
```
Expected: 24+ monthly periods, October-November months have higher counts, overall_trend is not always "stable"
- [ ] PASS — seasonal pattern visible in data

### Test 6 — Repeat Offenders API
```bash
curl "http://localhost:3001/api/analytics/repeat-offenders"
```
Expected: Top offender has risk_score > 80, fir_count > 4, districts_active has 2+ districts
- [ ] PASS

### Test 7 — Victim Vulnerability API
```bash
curl "http://localhost:3001/api/analytics/victim-vulnerability"
```
Expected: top_risk_profiles has 5 items, each with avg_vulnerability_score > 60
- [ ] PASS

### Test 8 — Under-Reporting API
```bash
curl "http://localhost:3001/api/analytics/underreporting"
```
Expected: 2-5 dark zones identified, each with gap_percentage > 40%, scores > 40
- [ ] PASS

### Test 9 — Person 2 Integration Test (Week 3)
Person 2 will call your APIs from their chat function.
They should send you a Postman test showing:
- hotspot query for "Bengaluru" → your API returns data → appears in chat response
- [ ] Integration works with Person 2

### Test 10 — Performance Check
```bash
time curl "http://localhost:3001/api/analytics/hotspots?months_back=12"
```
Expected: Response in under 5 seconds. If slower — add a LIMIT to your ZCQL query.
- [ ] Under 5 seconds

---

## WHAT YOU HAND OFF TO PERSON 2 (End of Week 2)

Save `crime-database/API_CONTRACT.md` to GitHub on your branch.
Then share these with Person 2:

**Message to send Person 2:**
> "APIs are ready. Here's what each one returns: [paste API_CONTRACT.md]
> Running locally at http://localhost:3001
> Update your .env: ANALYTICS_API_URL=http://localhost:3001/api/analytics
> Final deployed URL coming in Week 5 after Vedesh deploys."

Also tell Person 2:
- The largest dataset (hotspots with months_back=12) takes ~3 seconds — they should show a loading indicator
- All APIs return empty arrays gracefully — never throw errors to the caller
- The trends API response has a `seasonal_insight` field they can display directly as text

---

## QUICK REFERENCE — All Links You Need

| Resource | URL |
|---------|-----|
| Karnataka Crime 2024 (OpenCity) | https://data.opencity.in/dataset/karnataka-crime-data-2024 |
| Karnataka Crime 2023 (OpenCity) | https://data.opencity.in/dataset/karnataka-crime-data-2023 |
| Bengaluru Crime 2023 | https://data.opencity.in/dataset/bengaluru-crime-data-2023 |
| NCRB District IPC Crime (data.gov.in) | https://data.gov.in/catalog/district-wise-crimes-under-various-sections-indian-penal-code-ipc-crimes |
| KSP SCRB Crime Review 2023 | https://www.data.gov.in/catalog/crime-review-year-2023 |
| NCRB 2023 Full Report | https://data.opencity.in/dataset/crime-in-india-2023 |
| NCRB Full Stats Portal | https://ncrb.gov.in/crime-in-india-table-resource |
| Census India Data | https://censusindia.gov.in/census.website/data/census-tables |
| Catalyst ZCQL Introduction | https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/introduction/ |
| Catalyst ZCQL WHERE clause rules | https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/where/ |
| Catalyst Node.js SDK + ZCQL | https://docs.catalyst.zoho.com/en/sdk/nodejs/v2/overview/ |
| Python Faker (for synthetic names) | https://faker.readthedocs.io/en/master/ |
| mysql-connector-python docs | https://dev.mysql.com/doc/connector-python/en/ |
| Catalyst project dashboard | https://catalyst.zoho.com |

---

## WHEN YOU ARE STUCK — Exact Pattern to Follow

1. Copy the full error stack trace
2. Copy the code section causing the issue
3. Paste into Claude with this exact context:

```
I am building the Data & Analytics module for DRISHTI (crime intelligence for 
Karnataka Police). I am using:
- Python 3.11 for data loading
- Node.js + zcatalyst-sdk-node for analytics APIs
- Catalyst Data Store with ZCQL (max 5 WHERE conditions per query)
- Real NCRB crime data as the statistical base for synthetic FIR generation

I am getting this error:
[PASTE FULL ERROR]

My code:
[PASTE RELEVANT CODE SECTION]

Fix this step by step. Note any ZCQL limitations I need to work around.
```

4. If the fix involves ZCQL: **always check you're not exceeding 5 WHERE conditions**
5. If the fix involves JOIN queries: **ZCQL JOIN syntax is: FROM Table1 t1, Table2 t2 WHERE t1.col = t2.col**
6. Message Vedesh if still stuck after 30 minutes of trying

---

*DRISHTI — ದೃಷ್ಟಿ | Person 3 Data & Analytics Guide | KSP × Hack2Skill 2026*
