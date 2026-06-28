# DRISHTI — ದೃಷ್ಟಿ
## Person 3: Aman Jain — Data & Analytics Commander (Final, Fully Corrected)
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:** You are the foundation. The real Karnataka crime data lives in your tables, and the six analytics APIs you build are what every chart, every hotspot, and every repeat-offender alert in the whole platform is actually built from.

---

## WHAT CHANGED FROM THE ORIGINAL PLAN — READ THIS FIRST

1. **No database host/port/username/password exist.** You never connect with `mysql-connector-python` or anything like it. Data loading happens by generating plain CSV files locally (no Catalyst involved at all), then importing them with one confirmed CLI command: `catalyst ds:import [file] --table [TableName]`.
2. **Row limits are real and confirmed.** Catalyst's development environment caps every table at **5,000 rows** and the whole project at **25,000 rows total**. Your target counts below are already scaled to fit safely.
3. **Some column names you might plan to use are reserved keywords and will be rejected by the console.** Confirmed so far: `month` and `priority` both throw "Column name cannot contain reserved keywords." Use `month_filed`, `year_filed`, and `alert_priority` instead — already reflected in the schema below. If you hit the same error on any other column (`status`, `role`, `type`, `severity`, `category` are the most likely next candidates), rename it with a descriptive prefix (`case_status`, `accused_role`, `camera_type`, `alert_severity`, `crime_category`) and keep going — same fix every time.
4. **Your analytics functions live in ONE shared top-level `functions/` folder**, at the project root next to `catalyst.json` — confirmed directly from Catalyst's own docs and from the team's real terminal output. Not nested inside a `crime-database/` subfolder. Your function for hotspots goes in `functions/hotspots/`, sitting right alongside Swapnil's `functions/chat/` and the camera-intel person's `functions/cameras-nearby/` — all siblings in the same one folder.
5. **Joins use natural keys, not numeric IDs.** Since CSV import doesn't let you control Catalyst's auto-generated row IDs in advance, `FIR_Accused` and `FIR_Victims` link records using `fir_case_number` and `full_name` as plain text — not foreign key numbers. Your analytics functions join on these text values.

---

## YOUR DEPENDENCY MAP

### What You Need From Others

```
FROM VRITIKA (Person 1) — needed Day 1:
  ✅ GitHub repo access, your branch: crime-database
  ✅ Confirmation that all 11 Data Store tables + every column exist in the console
  ✅ Confirmation that catalyst.json + .catalystrc work (catalyst serve runs clean)
  ✅ A Stratus bucket existing (for the CSV import step)

FROM NOBODY ELSE:
  You can start dataset work, CSV generation, and the early API-building 
  independently from Day 1 once tables exist.
```

### What You Give to Others

```
TO THE CAMERA-INTEL PERSON — coordinate row budget, Week 1:
  📤 Confirm your total row count so theirs (Cameras, ~2000 rows) fits under 
     the shared 25,000/project ceiling

TO SWAPNIL (Person 2) — share by end of Week 2:
  📤 functions/API_CONTRACT_ANALYTICS.md — exact JSON response format for all 
     6 of your endpoints
  📤 Real Postman examples of each endpoint's actual response

TO VRITIKA — for integration, Week 5:
  📤 All 6 deployed function URLs
```

### Write This Contract by End of Week 2 — Save as `functions/API_CONTRACT_ANALYTICS.md`

```
GET /server/firs/
  params: district, crime_type, date_from, date_to, status, limit (default 50)
  returns: { firs: [...], total_count, filters_applied }

GET /server/hotspots/
  params: district (optional), crime_type (optional), months_back (default 6)
  returns: { hotspots: [{cell_lat, cell_lng, crime_count, severity_score, 
            top_crime_types, district, area_name}], total_crimes_analyzed, 
            analysis_period_months, grid_cell_size_meters }

GET /server/trends/
  params: crime_type (optional), district (optional), groupby (monthly|quarterly|yearly), year (optional)
  returns: { trend_data: [{period, period_start, count, change_pct, is_spike}], 
            seasonal_insight, overall_trend, average_per_period, spike_periods }

GET /server/repeat-offenders/
  params: min_firs (default 2), limit (default 20)
  returns: { high_risk_offenders: [{accused_id, name, risk_score, total_firs, 
            crime_types, districts_active, modus_operandi, last_crime_date}], 
            total_repeat_offenders, high_risk_count }

GET /server/victim-vulnerability/
  returns: { top_risk_profiles: [{profile, avg_vulnerability_score, victim_count, 
            primary_crime_type, high_risk_districts}], high_risk_windows: [...], 
            recommendation }

GET /server/underreporting/
  returns: { dark_zones: [{district, score, actual_rate_per_lakh, 
            expected_rate_per_lakh, gap_percentage, reason, recommended_action}], 
            state_average_rate_per_lakh, total_districts_analyzed }
```

---

## YOUR COMPLETE TASK LIST

```
Day 1   → Setup: clone repo, install Python tools, confirm tables exist
Day 1   → Confirm your 6 raw datasets are organized (already downloaded — verify placement)
Day 2   → Inspect real raw files, write the CSV generation script
Day 2   → Run the script, get 9 clean CSVs
Day 3   → catalyst login, catalyst ds:import each CSV, verify in console
Day 3   → Set up your function folders (catalyst function:create × 6)
Day 4   → Build FIRs API + Hotspot API
Day 5   → Build Trends API
Week 2  → Build Repeat Offenders + Victim Vulnerability + Under-Reporting APIs
Week 2  → Write and share API_CONTRACT_ANALYTICS.md with Swapnil
Week 3-4 → Support integration as Swapnil/camera-intel person wire into your APIs
```

---

## DAY 1 — Setup

### Step 1: Clone and Confirm the Foundation
```powershell
git clone https://github.com/vedeshskhatri/kspdatathon2026.git
cd kspdatathon2026
git checkout crime-database
catalyst serve
```
If this errors, stop and check with Vritika before doing anything else — same as everyone else's setup, you depend on her `catalyst.json` being correct first.

### Step 2: Install Python Tools
```powershell
python3 --version
pip install pandas faker
```
You do **not** need `mysql-connector-python`, `pymysql`, or any database driver. Remove any of these if already installed — they're not used anywhere in this corrected workflow.

### Step 3: Confirm Catalyst CLI Login
```powershell
catalyst login
```
If Vritika already ran this on your shared machine, this may already be authenticated. If you're on a separate laptop, run it yourself — it opens a browser, you sign into the same Catalyst account/project.

### Step 4: Confirm All 11 Tables Exist
Catalyst Dashboard → **Data Store → Tables List**. You should see:
```
Districts, PoliceStations, CrimeTypes, FIRs, Accused, Victims,
FIR_Accused, FIR_Victims, Cameras, ANPR_Watchlist, Alerts
```
Click into **FIRs** and **ANPR_Watchlist** specifically — confirm the columns read `year_filed`, `month_filed` (not `year`/`month`) and `alert_priority` (not `priority`). If Vritika hasn't made these renames yet, flag it to her now — your CSV headers below are written to match the corrected names, and a mismatch here will cause `catalyst ds:import` to silently skip those columns later.

---

## DAY 1 — Organize Your Already-Downloaded Datasets

You've already pulled all 6 real datasets. Confirm they're sitting in the right folders:

```powershell
mkdir -p crime-database/raw-data/ncrb
mkdir -p crime-database/raw-data/traffic-signals
mkdir -p crime-database/raw-data/boundaries
mkdir -p crime-database/raw-data/census
mkdir -p crime-database/raw-data/police-stations
mkdir -p crime-database/generated-csv
```

| Your file | Goes in |
|---|---|
| District-wise IPC Crimes CSV (your main file) | `raw-data/ncrb/district-wise-ipc-2024.csv` |
| IPC Crimes Under Various Heads CSV | `raw-data/ncrb/ipc-heads-2024.csv` |
| `bengaluru_signals.geojson` (from Overpass) — this one's the camera-intel person's input, but keep a copy here too if you reference it | `raw-data/traffic-signals/` |
| `karnataka_districts.geojson` (converted from the `DistrictMap_Karnataka.kmz`) | `raw-data/boundaries/` |
| Census/population CSV | `raw-data/census/karnataka_districts_census.csv` |
| Police stations CSV | `raw-data/police-stations/bengaluru_stations.csv` |

These folders are already in `.gitignore` — never commit raw data files to GitHub, only the generated CSVs and your scripts.

---

## DAY 2 — Inspect Real Files, Then Generate Your 9 CSVs

### Step 1: Inspect Before Writing Any Logic

Government CSVs are inconsistent. Look at the real structure first:
```powershell
python3 -c "
import pandas as pd
df = pd.read_csv('raw-data/ncrb/district-wise-ipc-2024.csv')
print('Columns:', list(df.columns))
print(df.head(10))
"
```
Repeat for `ipc-heads-2024.csv`, the census CSV, and the police stations CSV. Keep the printed column names and sample rows handy — you'll paste them into the script-generation prompt next.

### Step 2: Generate the CSV-Writing Script

Paste this into Claude — **fill in the real column names and sample rows from Step 1**:

```
Write a complete Python script generate-csvs.py for DRISHTI.

This script ONLY reads local files and writes local CSV files. No database 
connection of any kind.

INPUT FILES (real, already downloaded):
- raw-data/ncrb/district-wise-ipc-2024.csv 
  [PASTE actual column names and 3 sample rows from Step 1]
- raw-data/ncrb/ipc-heads-2024.csv
  [PASTE actual column names and sample rows]
- raw-data/census/karnataka_districts_census.csv
  [PASTE actual column names and sample rows, or "not available, use fallback"]
- raw-data/police-stations/bengaluru_stations.csv
  [PASTE actual column names and sample rows, or "not available, use fallback"]

OUTPUT FILES (write to crime-database/generated-csv/), exact target row counts —
do not exceed these (Catalyst dev environment caps at 5000 rows/table, 
25000 total/project, and Cameras (~2000 rows) is being loaded separately by 
another team member, so stay within this budget):

districts.csv → 20 rows
  columns: name, division, population, urban_population_pct, area_sqkm, 
  lat_center, lng_center

police_stations.csv → 120 rows
  columns: name, district_name, division, address, lat, lng

crime_types.csv → 15 rows (fixed reference list, write these exact rows):
  vehicle_theft|Vehicle Theft|Property|IPC 379|2
  chain_snatching|Chain Snatching|Violent|IPC 392|3
  burglary|Burglary|Property|IPC 454|3
  robbery|Robbery|Violent|IPC 392|4
  assault|Assault|Violent|IPC 323|3
  fraud|Fraud|Economic|IPC 420|2
  cybercrime|Cybercrime|Economic|IT Act 66|2
  drug_offence|Drug Offence|Other|NDPS 20|3
  murder|Murder|Violent|IPC 302|5
  eve_teasing|Eve Teasing|Violent|IPC 354|2
  kidnapping|Kidnapping|Violent|IPC 363|5
  hit_and_run|Hit and Run|Other|IPC 304A|3
  property_crime|Property Crime|Property|IPC 427|1
  domestic_violence|Domestic Violence|Violent|IPC 498A|3
  senior_citizen_crime|Senior Citizen Crime|Violent|IPC various|3
  columns: code, name, category, ipc_section, severity

firs.csv → 2500 rows
  IMPORTANT — use these EXACT column names (not "year"/"month"/"status" — those 
  are Catalyst reserved keywords and will break the import):
  case_number, date_filed, time_filed, crime_type_code, description, 
  case_status, district_name, police_station, location_name, location_lat, 
  location_lng, investigation_officer, year_filed, month_filed, hour_of_crime
  
  Parse district-wise-ipc-2024.csv to get REAL relative proportions of crimes 
  per district. Map whatever crime columns actually exist in that file to the 
  closest matching code from crime_types.csv. Scale real proportions down to 
  exactly 2500 total rows while preserving real ratios between districts and 
  crime types.
  Apply seasonal weighting: vehicle_theft and chain_snatching get double weight 
  in October-December when randomly assigning date_filed within 2024-2025.
  case_number format: KAR/[district 3-letter code]/[year]/[seq 4-digit]
  case_status values: 50% "open", 30% "under_investigation", 15% "chargesheeted", 5% "closed"
  For vehicle_theft/robbery/chain_snatching: embed a fake Karnataka plate 
  (format KA-NN-A-NNNN or KA-NN-AA-NNNN) inside the description text.

accused.csv → 2500 rows
  columns: full_name, alias, age, gender, address, district_name, occupation, 
  prior_convictions, modus_operandi, risk_score
  Faker('en_IN') names. 75% male, age skew 18-45, 25% prior_convictions > 0.
  Pick 15 as "repeat offenders": risk_score 70-95, prior_convictions 3-8. 
  Everyone else: risk_score 0-50.

victims.csv → 2500 rows
  columns: full_name, age, gender, occupation, district_name, vulnerability_score
  Faker('en_IN') names. Vary demographics by likely associated crime type.

fir_accused.csv → 2800 rows
  columns: fir_case_number, accused_full_name, accused_role
  Link by case_number and full_name (natural keys, not row numbers — Catalyst 
  assigns its own IDs after import). Link the 15 repeat offenders to 4-8 FIRs each.

fir_victims.csv → 2500 rows
  columns: fir_case_number, victim_full_name
  Same natural-key linking pattern.

anpr_watchlist.csv → 800 rows
  IMPORTANT — use "alert_priority" not "priority" (reserved keyword):
  columns: plate_number, fir_case_number, crime_type, alert_active, alert_priority
  Extract plate numbers embedded in firs.csv descriptions (regex 
  KA-\d{2}-[A-Z]{1,2}-\d{4}). Take up to 800 unique plates. 80% alert_active=True. 
  Repeat offenders' plates get alert_priority=high, others medium.

Main function: run all sections in order, print row counts per output file, 
print warnings if real input data was missing and fallback logic was used.
```

### Step 3: Run It
```powershell
python3 data-scripts/generate-csvs.py
```
You should get 9 CSV files in `crime-database/generated-csv/`. Open a couple in Excel to sanity-check — district names spelled consistently, dates in range, no obviously broken rows.

---

## DAY 3 — Import Into Catalyst

### Step 1: Confirm CLI Login
```powershell
catalyst login
```

### Step 2: Run the Import — One Command Per File

Confirmed working syntax:
```powershell
catalyst ds:import crime-database/generated-csv/districts.csv --table Districts
catalyst ds:import crime-database/generated-csv/police_stations.csv --table PoliceStations
catalyst ds:import crime-database/generated-csv/crime_types.csv --table CrimeTypes
catalyst ds:import crime-database/generated-csv/firs.csv --table FIRs
catalyst ds:import crime-database/generated-csv/accused.csv --table Accused
catalyst ds:import crime-database/generated-csv/victims.csv --table Victims
catalyst ds:import crime-database/generated-csv/fir_accused.csv --table FIR_Accused
catalyst ds:import crime-database/generated-csv/fir_victims.csv --table FIR_Victims
catalyst ds:import crime-database/generated-csv/anpr_watchlist.csv --table ANPR_Watchlist
```

Each command auto-uploads the CSV to Stratus and runs the import — no manual upload step. After each one finishes, type `y` when offered the report download, and check it for skipped rows.

**If any column gets silently skipped or the whole import errors with a schema mismatch:** the CSV header almost certainly doesn't match the console's column name exactly (case-sensitive). Open the CSV header row and the table's Schema View side by side and compare letter-for-letter — this catches 90% of import failures.

### Step 3: Verify in the Console
Data Store → click into any table → **Data View** tab, or run in **ZCQL Console**:
```sql
SELECT COUNT(*) FROM FIRs
SELECT district_name, COUNT(*) FROM FIRs GROUP BY district_name
SELECT crime_type_code, COUNT(*) FROM FIRs GROUP BY crime_type_code ORDER BY COUNT(*) DESC
```
Confirm row counts roughly match targets, vehicle_theft/fraud near the top, murder near the bottom, Bengaluru Urban dominating the district breakdown.

---

## DAY 3-4 — Set Up Your Six Function Folders

All six of these go inside the **same shared top-level `functions/` folder** at the project root — not inside `crime-database/`. Run this once per function, from the project root:

```powershell
catalyst function:create
```
*(If this exact command doesn't resolve on your CLI version, run `catalyst --help` to find the current name — the rest of the flow is identical.)*

Repeat six times, using these exact package names:
```
firs
hotspots
trends
repeat-offenders
victim-vulnerability
underreporting
```
Each time: Function type = **AdvancedIO**, Runtime = **Node.js** (latest), Entry point = `index.js`, install dependencies = **Yes**.

For each one, install the shared dependencies:
```powershell
cd functions/firs
npm install zcatalyst-sdk-node dotenv
cd ../hotspots
npm install zcatalyst-sdk-node dotenv
```
(...repeat for the remaining four)

---

## DAY 4-5, WEEK 2 — Build the Six Functions

### Shared Helper First

Create `functions/firs/db-helper.js` (you'll copy this same file into each of your other 5 function folders too, since each Catalyst function folder is self-contained with its own dependencies):

```
Write a Node.js utility module db-helper.js for DRISHTI analytics functions.

Uses zcatalyst-sdk-node in admin scope:
const adminApp = catalyst.initialize(req, { scope: 'admin' });
const zcql = adminApp.zcql();
const result = await zcql.executeZCQLQuery('SELECT ...');

IMPORTANT ZCQL LIMITS: max 5 WHERE conditions per query. For JOINs, syntax is:
FROM Table1 t1, Table2 t2 WHERE t1.column = t2.column

Export:
async function executeQuery(req, sqlQuery) — runs a ZCQL query, returns array, 
  never throws (logs error, returns empty array on failure)

async function getFIRsFiltered(req, filters) — { district, crime_type, date_from, 
  date_to, case_status, limit }. Build ZCQL with up to 3 WHERE conditions from 
  these filters (leave headroom under the 5-condition limit). Apply date_from/
  date_to filtering in JavaScript after fetching, not in ZCQL, to avoid hitting 
  the limit. ORDER BY date_filed DESC LIMIT [filters.limit || 50].
```

### Function 1: FIRs API

`functions/firs/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/firs/
Query params: district, crime_type, date_from, date_to, status, limit (default 50)

Use db-helper's getFIRsFiltered(). Map req.query.status to the case_status column 
(remember the table column is named case_status, not status, due to the reserved 
keyword fix).

Also run a separate COUNT query with the same filters for total_count.

Return: { firs: [...], total_count, filters_applied: {district, crime_type, 
date_from, date_to, status} }

Sanitize all string inputs (strip single quotes) before building ZCQL query strings.
CORS headers, error handling, export as module.exports = async (req, res) => {...}
```

### Function 2: Hotspots API

`functions/hotspots/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/hotspots/
Query params: district (optional), crime_type (optional), months_back (default 6)

STEP 1: Calculate date_cutoff = today minus months_back*30 days, format YYYY-MM-DD
STEP 2: ZCQL query FIRs for location_lat, location_lng, crime_type_code, 
district_name, date_filed WHERE date_filed >= date_cutoff (plus district/crime_type 
filters if provided, staying under 5 WHERE conditions). LIMIT 10000.
STEP 3: Filter out rows where location_lat or location_lng is null/0.
STEP 4: Grid-bucket the coordinates: cell size 0.005 degrees (~500m). 
  Key = Math.floor(lat/0.005) + ',' + Math.floor(lng/0.005)
STEP 5: For each cell with crime_count >= 3: 
  severity_score = crime_count + (violent_crime_count * 1.0) + 
  (crimes_in_last_30_days * 0.5)
STEP 6: Sort by severity_score descending, take top 25.
STEP 7: For each: cell_lat/cell_lng = cell center, top_crime_types = top 3 by 
count in that cell, district = most common district in that cell.

Return: { hotspots: [...], total_crimes_analyzed, analysis_period_months: 
months_back, grid_cell_size_meters: 500 }
CORS headers, error handling, export pattern as above.
```

### Function 3: Trends API

`functions/trends/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/trends/
Query params: crime_type (optional), district (optional), 
groupby (monthly|quarterly|yearly, default monthly), year (optional)

STEP 1: ZCQL query FIRs for date_filed, crime_type_code, district_name 
(with up to 3 WHERE filters). LIMIT 50000. Apply year filter in JavaScript if given.
STEP 2: Group by period string based on groupby (e.g. "2025-03" for monthly) 
using a Map, count per period, sort chronologically.
STEP 3: Calculate change_pct vs previous period for each period after the first. 
is_spike = change_pct > 25.
STEP 4: Determine seasonal_insight — check which months have the most crimes 
for the filtered crime_type, write a one-sentence insight.
STEP 5: overall_trend: compare average of first half vs second half of periods — 
"increasing" if >10% higher, "decreasing" if >10% lower, else "stable".

Return: { trend_data: [...], seasonal_insight, overall_trend, average_per_period, 
spike_periods: [...] }
CORS headers, error handling, export pattern as above.
```

### Function 4: Repeat Offenders API

`functions/repeat-offenders/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/repeat-offenders/
Query params: min_firs (default 2), limit (default 20)

NOTE: Joins use natural keys (full_name/case_number), not numeric IDs, since 
CSV-imported rows don't have predictable ROWIDs.

STEP 1: ZCQL: SELECT accused_full_name, COUNT(*) as fir_count FROM FIR_Accused 
GROUP BY accused_full_name ORDER BY fir_count DESC LIMIT 200
STEP 2: Filter in JavaScript: keep only entries where fir_count >= min_firs
STEP 3: For each remaining name, fetch their Accused record: 
SELECT * FROM Accused WHERE full_name = '[name]' LIMIT 1
STEP 4: For each, fetch their FIRs via join on case_number:
SELECT f.crime_type_code, f.district_name, f.date_filed, f.case_status, fa.fir_case_number
FROM FIRs f, FIR_Accused fa
WHERE fa.fir_id = f.case_number AND fa.accused_full_name = '[name]'
(adjust join condition to match actual column names — FIR_Accused stores 
fir_case_number which equals FIRs.case_number)
LIMIT 20
STEP 5: Calculate risk_score (0-100): fir_count weight (1=10, 2-3=25, 4-5=45, 
6+=60), +20 if most recent FIR within 6 months, +15 if any violent crime type 
in their history, +10 if active in 3+ districts, +15 if prior_convictions > 0. Cap at 100.
STEP 6: Sort by risk_score descending, take top [limit].

Return: { high_risk_offenders: [{accused_id: full_name (used as identifier), 
name, risk_score, total_firs, crime_types, districts_active, modus_operandi, 
last_crime_date}], total_repeat_offenders, high_risk_count: count where risk_score > 70 }
CORS headers, error handling, export pattern as above.
```

### Function 5: Victim Vulnerability API

`functions/victim-vulnerability/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/victim-vulnerability/

STEP 1: ZCQL join: SELECT v.age, v.gender, v.occupation, v.district_name, 
v.vulnerability_score, f.crime_type_code, f.time_filed, f.location_lat, f.location_lng
FROM Victims v, FIR_Victims fv, FIRs f
WHERE fv.victim_full_name = v.full_name AND fv.fir_case_number = f.case_number
LIMIT 5000
STEP 2: Group by profile = age_group ('under_18'|'18-30'|'31-50'|'51-60'|'over_60') 
+ gender + occupation_category. Count, average vulnerability_score, most common 
crime_type, most common districts per group.
STEP 3: Top 5 profiles by average vulnerability_score.
STEP 4: For victims with vulnerability_score > 70: group by time_window 
(derived from time_filed: morning/day/evening/night/late_night) + district + 
crime_type. Find combinations with count > 10, top 5 by count.
STEP 5: Generate a one-sentence recommendation from the top profile and window.

Return: { top_risk_profiles: [...], high_risk_windows: [...], recommendation }
CORS headers, error handling, export pattern as above.
```

### Function 6: Under-Reporting API

`functions/underreporting/index.js`:
```
Build a Node.js Catalyst AdvancedIO Function: GET /server/underreporting/

STEP 1: ZCQL: SELECT district_name, COUNT(*) as fir_count FROM FIRs 
GROUP BY district_name
STEP 2: Load population per district from your districts.csv data — query 
Districts table: SELECT name, population FROM Districts
STEP 3: For each district with population data: 
rate_per_lakh = (fir_count / population) * 100000
STEP 4: Calculate state average rate (mean across districts, excluding extreme 
outliers beyond 3 standard deviations).
STEP 5: Flag districts where rate_per_lakh < state_average * 0.6 (40% below 
average) as dark zones. gap_percentage = ((average - rate) / average) * 100. 
score = min(100, round(gap_percentage * 1.5)).
STEP 6: Generate reason and recommended_action strings based on score severity 
(>85 = "Immediate investigation into reporting barriers required", >65 = 
"Deploy community outreach and increase beat officer visits", >40 = "Monitor 
closely and conduct awareness programs").
STEP 7: Sort by score descending.

Return: { dark_zones: [...], state_average_rate_per_lakh, total_districts_analyzed }
CORS headers, error handling, export pattern as above.
```

---

## TESTING CHECKLIST

- [ ] `catalyst serve` runs clean from the project root with no target errors
- [ ] `SELECT COUNT(*) FROM FIRs` in ZCQL Console returns ~2500
- [ ] District breakdown shows Bengaluru Urban dominating
- [ ] Crime type breakdown shows vehicle_theft/fraud near top, murder near bottom
- [ ] Vehicle theft counts are visibly higher in Oct-Nov-Dec than Feb-Mar (seasonal check)
- [ ] At least 10-15 accused show up with 4+ linked FIRs (repeat offenders)
- [ ] `GET /server/firs/?district=Bengaluru%20Urban&crime_type=vehicle_theft&limit=5` returns 5 real-looking FIR records
- [ ] `GET /server/hotspots/?months_back=6` returns 20-25 cells, all coordinates within Bengaluru bounds (lat 12.85-13.05, lng 77.50-77.70)
- [ ] `GET /server/trends/?groupby=monthly&crime_type=vehicle_theft` shows visible seasonal variation, not flat
- [ ] `GET /server/repeat-offenders/` top result has risk_score > 80, 4+ FIRs, 2+ districts
- [ ] `GET /server/victim-vulnerability/` returns 5 profiles, all with avg score > 60
- [ ] `GET /server/underreporting/` flags 2-5 districts with gap_percentage > 40%
- [ ] Each response returns in under 5 seconds
- [ ] Swapnil confirms he can successfully call your hotspots/trends/repeat-offenders endpoints from his chat function and gets real data back

---

## QUICK REFERENCE

| Resource | URL |
|---|---|
| Catalyst CLI command reference | https://docs.catalyst.zoho.com/en/cli/v1/cli-command-reference/ |
| `ds:import` full docs | https://docs.catalyst.zoho.com/en/cli/v1/data-store-import-and-export/import-operation/ |
| Data Store row limits | confirmed: 5,000/table, 25,000/project in development |
| ZCQL introduction | https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/introduction/ |
| ZCQL WHERE clause limits | https://docs.catalyst.zoho.com/en/cloud-scale/help/zcql/where/ |
| Catalyst Functions (AdvancedIO) | https://docs.catalyst.zoho.com/en/cloud-scale/help/functions/advanced-io-functions/ |
| Python Faker | https://faker.readthedocs.io/en/master/ |
| Karnataka Crime data (OpenCity) | https://data.opencity.in/dataset/karnataka-crime-data-2024 |

---

*DRISHTI — ದೃಷ್ಟಿ | Person 3 (Aman Jain) Data & Analytics Guide — Final | KSP × Hack2Skill 2026*
