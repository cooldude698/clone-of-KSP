# DRISHTI — ದೃಷ್ಟಿ
## Person 1: Captain's Complete Step-by-Step Guide
**VRITIKA | KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:**  
> You are the architect of the foundation. Every other member builds on what you set up. You don't write complex features — you set up everything correctly so the team never has to stop and wait.

---

## CRITICAL RULE: No Hardcoding — What This Actually Means

Before touching anything, understand this clearly.

**Hardcoding = bad.** Hardcoding means putting actual values directly inside the code. Example:
```js
// WRONG — hardcoded
const API_KEY = "sk-ant-api03-xxxxxxx";
const DB_URL = "jdbc:mysql://abc123.catalyst.zoho.com/DRISHTI";
```

**Environment variables = correct.** Values live in a `.env` file, code reads from process:
```js
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

This is the most important thing to understand before Day 1.

### What We Use Real Data For (download and load directly)

| Data Type | Source | What We Get |
|-----------|--------|-------------|
| District-wise crime counts by type (2022-2024) | OpenCity / NCRB | Actual crime totals per district — our database matches these numbers |
| Bengaluru traffic junction GPS coordinates | OpenStreetMap via Overpass | Real lat/lng of actual junctions — used for BATCS camera locations |
| District boundary shapefiles | DataMeet GitHub | Real Karnataka district boundaries — used for heatmaps |
| Demographic data by district | Census 2011 Karnataka | Real population, age, gender distribution per district |
| Bengaluru traffic signal names | OpenCity | Real signal junction names matching Safe City/BATCS |

### What Must Be Synthetically Generated (and why that is acceptable)

| Data Type | Why Not Available Publicly | How We Handle It |
|-----------|---------------------------|------------------|
| Individual FIR records | Individual police cases are not public — privacy and security law | Generate synthetic FIRs that MATCH real NCRB district totals. If NCRB says 4,521 vehicle thefts in Bengaluru Urban in 2023, we generate exactly 4,521 individual vehicle theft FIRs distributed realistically. |
| Individual accused/victim names and details | Personal data — legally protected | Generate realistic synthetic profiles matching demographic distributions from Census |
| Exact Safe City camera GPS coordinates | Security sensitive — never published | Generate camera positions centered on real junction GPS from OSM, with small random offset |
| ANPR match events / camera footage data | Not public | Simulate using realistic timestamps and camera sequences |

**Why synthetic-but-statistically-grounded is NOT the same as random mock data:**
Random mock data is made up. Our synthetic data is generated to MATCH real NCRB statistics.
If NCRB says Koramangala has more vehicle thefts than Yeshwantpur — our database reflects that. If NCRB says crimes spike in October-November — our data shows that. This is what makes DRISHTI credible in a demo.

---

## YOUR COMPLETE TASK LIST (Overview)

```
Day 1    → Catalyst account + project setup
Day 1    → GitHub repository(repo done + folder structure
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
5. You will land on the project dashboard. This is your main workspace.

### Step 4: Enable All Required Services

In the project dashboard, go to the left sidebar. Enable each service below one by one. Click the service name → it will open → look for an "Enable" or "Activate" button.

Enable these in this order:

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

### Step 1: Create the Repository

1. Go to: **https://github.com**
2. Log in (or create an account if you don't have one)
3. Click the **"+"** icon → **"New repository"**
4. Repository name: **drishti-ksp**
5. Description: `Intelligent Crime Intelligence Co-Pilot for Karnataka State Police — KSP × Hack2Skill Datathon 2026`
6. Visibility: **Public** (required for hackathon submission)
7. Check **"Add a README file"**
8. .gitignore template: **Node**
9. Click **"Create repository"**

### Step 2: Add Team Members as Collaborators

1. Go to your new repo → **Settings** tab (top right of repo page)
2. Left sidebar → **Collaborators**
3. Click **"Add people"**
4. Enter each team member's GitHub username one by one
5. They will receive an email invitation — ask them to accept it the same day

### Step 3: Create the Folder Structure

On your computer, open Terminal (Mac/Linux) or Command Prompt (Windows).

```bash
# Clone the repo to your computer
git clone https://github.com/YOUR_GITHUB_USERNAME/drishti-ksp.git
cd drishti-ksp

# Create the folder structure
mkdir -p ai-engine/functions
mkdir -p crime-database/functions
mkdir -p crime-database/data-scripts
mkdir -p crime-database/raw-data
mkdir -p camera-intel/functions
mkdir -p frontend
mkdir -p deployment
mkdir -p docs

# Create a .gitignore for sensitive files
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "credentials_PRIVATE.txt" >> .gitignore
echo "node_modules/" >> .gitignore
echo "*.csv" >> .gitignore
echo "raw-data/" >> .gitignore
```

### Step 4: Create the Main README

Paste this prompt into Claude and copy the output into your `README.md` file:

```
Write a professional GitHub README for DRISHTI — an AI Crime Intelligence Co-Pilot 
for Karnataka State Police. This was built for the KSP × Hack2Skill Datathon 2026.

Include sections:
1. Project title with DRISHTI ದೃಷ್ಟಿ as heading, tagline: "Intelligence that sees what others miss"
2. Problem statement — current state of KSP data silos
3. Solution overview — what DRISHTI does
4. Key features (list of 10, one-line each)
5. What makes it unique — comparison table vs typical solutions
6. Tech stack — all Catalyst services used
7. Real datasets used — NCRB/OpenCity/OSM with links
8. Project structure — the folder breakdown
9. Setup & installation instructions (basic)
10. Team section — 5 members, roles listed
11. Deployment — Catalyst AppSail

Keep it impressive but honest. No fluff. Professional tone.
```

### Step 5: Create Environment Variable Templates

Create a file called `.env.example` (this IS committed to GitHub — it shows the team what variables are needed without actual values):

```bash
# Paste this into .env.example:
cat > .env.example << 'EOF'
# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Catalyst Project
CATALYST_PROJECT_ID=your_project_id
CATALYST_ACCOUNT_ID=your_account_id

# Catalyst Data Store (Database)
CATALYST_DB_HOST=your_db_host
CATALYST_DB_PORT=3306
CATALYST_DB_NAME=DRISHTI
CATALYST_DB_USER=your_db_user
CATALYST_DB_PASSWORD=your_db_password

# Catalyst Zia Services
CATALYST_ZIA_API_KEY=your_zia_api_key

# Catalyst QuickML
CATALYST_QUICKML_ENDPOINT=your_quickml_endpoint

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
EOF
```

Now commit everything:
```bash
git add .
git commit -m "Initial project structure and README"
git push origin main
```

### Step 6: Create Working Branches

```bash
# Create one branch per member (from main)
git checkout -b ai-engine
git push origin ai-engine
git checkout main

git checkout -b crime-database
git push origin crime-database
git checkout main

git checkout -b camera-intel
git push origin camera-intel
git checkout main

git checkout -b frontend
git push origin frontend
git checkout main
```

Each team member clones the repo and checks out their own branch:
```bash
git clone https://github.com/YOUR_USERNAME/drishti-ksp.git
cd drishti-ksp
git checkout [their-branch-name]
```

---

## DAY 2 — Collecting All Real Datasets

This is the most important day of your setup work. Go through each dataset below. Download everything. Organize it into the `crime-database/raw-data/` folder on your computer.

**Note:** The `raw-data/` folder is in `.gitignore` — you do NOT push this to GitHub (files are too large). You share downloaded files with Member 3 via WhatsApp/Google Drive directly.

---

### DATASET 1 — Karnataka District Crime Statistics (2022–2024)
**Source:** OpenCity Urban Data Portal  
**What it contains:** IPC and SLL crime counts by district, by crime type, for Karnataka  
**Why we need it:** To know how many crimes of each type happened in each district — our synthetic FIRs will match these real totals

**Step 1:** Go to: **https://data.opencity.in/dataset/karnataka-crime-data-2024**  
**Step 2:** Look for CSV/Excel download buttons on that page. Download all available files.  
**Step 3:** Also download 2023: **https://data.opencity.in/dataset/karnataka-crime-data-2023**  
**Step 4:** Also download 2022: **https://data.opencity.in/dataset/karnataka-crime-data-2022**  
**Step 5:** Save all files in `crime-database/raw-data/karnataka-crime/`

**If OpenCity has download issues, use the Karnataka state government version:**  
Go to: **https://karnataka.data.gov.in/catalog/crime-review-year-2023**  
Download the available datasets from this page.

**Backup — data.gov.in search:**  
Go to: **https://data.gov.in/search?title=crime+karnataka**  
Filter by "Karnataka" and download relevant crime statistics.

---

### DATASET 2 — Bengaluru City Crime Report (Police Data)
**Source:** OpenCity — Bengaluru City Police official data  
**What it contains:** Bengaluru-specific crime stats broken down by crime type, with more granular data than state-level  
**Why we need it:** Bengaluru is our primary demo city — we need Bengaluru-specific crime distributions

**Step 1:** Go to: **https://data.opencity.in/dataset/bengaluru-crime-data-2023**  
**Step 2:** Download all available files (PDF + CSV if available)  
**Step 3:** Save in `crime-database/raw-data/bengaluru-crime/`

**Also get NCRB national report for full context:**  
Go to: **https://data.opencity.in/dataset/crime-in-india-2023**  
Download the Crime in India 2023 Vol 1 and Vol 2 files.

**Direct NCRB PDF (2022):**  
**https://ncrb.gov.in/uploads/nationalcrimerecordsbureau/custom/1701607577CrimeinIndia2022Book1.pdf**  
Download this PDF — it contains Table 1A which gives state-wise totals. Karnataka data is in there.

---

### DATASET 3 — Bengaluru Traffic Signal Junction Locations
**Source:** OpenCity — Bengaluru City Traffic Police  
**What it contains:** Names of actual traffic signal junctions in Bengaluru (some with GPS data)  
**Why we need it:** These become our BATCS camera locations — real junction names with real coordinates

**Step 1:** Go to: **https://data.opencity.in/dataset/bengaluru-city-traffic-signal-data**  
**Step 2:** This dataset has signal timing data per junction. Download all available files.  
**Step 3:** Look at the junction names — these are real Bengaluru intersections  
**Step 4:** Save in `crime-database/raw-data/traffic-signals/`

**Then get GPS coordinates for these junctions using Overpass Turbo:**

1. Go to: **https://overpass-turbo.eu/**
2. Click the **Wizard** button (top left)
3. In the Wizard box, type: `traffic_signals in Bengaluru`
4. Click **"Build and run query"**
5. Wait 30-60 seconds — you will see a map of Bengaluru with hundreds of traffic signal points
6. Click **Export** → **GeoJSON** → Download the file
7. Save as `crime-database/raw-data/traffic-signals/bengaluru_signals.geojson`

This gives you the GPS coordinates of REAL traffic signals in Bengaluru. These are your BATCS camera locations.

**Note:** If Overpass Turbo is slow, try: **https://www.openstreetmap.org/export** — export the Bengaluru area as XML.

---

### DATASET 4 — Karnataka District Boundaries (GeoJSON / Shapefile)
**Source:** DataMeet India Maps — GitHub  
**What it contains:** Actual geographic boundary polygons for Karnataka's 31 districts  
**Why we need it:** For the heatmap visualization and the district-level analytics

**Step 1:** Go to: **https://github.com/datameet/maps**  
**Step 2:** Click on the folder **"States"** → **"Karnataka"**  
**Step 3:** Download `Karnataka_districts.geojson` or similar file  
**Step 4:** Save in `crime-database/raw-data/boundaries/`

**Alternative (direct download attempt):**  
Try: **https://raw.githubusercontent.com/datameet/maps/master/States/Karnataka/Karnataka_districts.geojson**  
If this works, right-click → Save As.

**If GitHub is slow, use this alternative:**  
Go to: **https://gadm.org/download_country.html**  
Select Country: India → Download the GeoJSON  
Extract Karnataka district data from it.

---

### DATASET 5 — Karnataka Census Demographic Data
**Source:** Census of India 2011  
**What it contains:** Population by district, age group breakdown, gender split, literacy rates  
**Why we need it:** For the victim vulnerability index and under-reporting radar — we need to know actual population per district to calculate crime rates

**Step 1:** Go to: **https://censusindia.gov.in/census.website/data/census-tables**  
**Step 2:** Look for Primary Census Abstract → State: Karnataka → Download  
**Step 3:** If the above is complex, use this simpler source:

Go to: **https://data.opencity.in**  
Search for "karnataka census population district"  
Download any available district-level population CSV

**Minimum data needed per district:**
- Total population
- Male/Female split
- Urban vs rural population
- Population under 18 and over 60

**If you can't find structured CSV, paste this into Claude:**
```
Give me the 2011 Census population data for Karnataka's top 15 districts including 
Bengaluru Urban, Bengaluru Rural, Mysuru, Belagavi, Dakshina Kannada, Kalaburagi, 
Ballari, Shivamogga, Mangaluru, Udupi, Dharwad, Bidar, Vijayapura, Raichur, Tumakuru.
For each: total population, urban population percentage, percentage under 18, 
percentage over 60, male/female ratio.
Output as CSV format.
```
Save that output as `crime-database/raw-data/census/karnataka_districts_census.csv`

---

### DATASET 6 — Bengaluru Police Station List with Locations
**Source:** Karnataka Police Official Website  
**What it contains:** Names and locations of police stations across Bengaluru  
**Why we need it:** Each FIR needs a police_station field — this should use real station names

**Step 1:** Go to: **https://www.ksp.gov.in**  
**Step 2:** Navigate to → Districts → Bengaluru City → Police Stations  
**Step 3:** Note down or copy the police station names (there should be 100+)

**Alternative — paste into Claude for a usable list:**
```
Give me a complete list of all police stations in Bengaluru City (Bengaluru Urban 
district), Karnataka, India. Include both the station name and the general area/ward 
it covers. Format as CSV: station_name, area, division (East/West/South/North/Central).
Use only real, existing Bengaluru City Police station names.
```
Save this as `crime-database/raw-data/police-stations/bengaluru_stations.csv`

---

## DAY 3, PART A — Set Up Database Schema in Catalyst Data Store

### Step 1: Access the Catalyst Data Store Console

1. Go to: **https://catalyst.zoho.com**
2. Click on your project **DRISHTI-KSP**
3. Left sidebar → **Data Store**
4. You will see the Data Store dashboard
5. Click on **"SQL Console"** (top right area of the Data Store page)
6. This opens a SQL editor — you will run CREATE TABLE commands here

### Step 2: Create All Tables

Copy and paste the following SQL into the SQL Console and run it. Run each block separately.

**Block 1 — Crime Reference Tables (District and Crime Type):**
```sql
-- Districts table (loaded from real census data)
CREATE TABLE IF NOT EXISTS Districts (
  district_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  division VARCHAR(50),
  population INT,
  urban_population_pct DECIMAL(5,2),
  area_sqkm DECIMAL(10,2),
  lat_center DECIMAL(9,6),
  lng_center DECIMAL(9,6),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Police stations (loaded from real KSP data)
CREATE TABLE IF NOT EXISTS PoliceStations (
  station_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  district_id INT,
  division VARCHAR(50),
  address VARCHAR(255),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  contact VARCHAR(20),
  FOREIGN KEY (district_id) REFERENCES Districts(district_id)
);

-- Crime types reference
CREATE TABLE IF NOT EXISTS CrimeTypes (
  crime_type_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  ipc_section VARCHAR(50),
  severity INT DEFAULT 1
);
```

**Block 2 — Main FIR, Accused, and Victims Tables:**
```sql
-- FIRs (First Information Reports)
CREATE TABLE IF NOT EXISTS FIRs (
  fir_id INT AUTO_INCREMENT PRIMARY KEY,
  case_number VARCHAR(50) UNIQUE NOT NULL,
  date_filed DATE NOT NULL,
  time_filed TIME NOT NULL,
  crime_type_id INT,
  crime_type_code VARCHAR(50),
  description TEXT,
  status ENUM('open','under_investigation','chargesheeted','closed','disposed') DEFAULT 'open',
  district_id INT,
  district_name VARCHAR(100),
  police_station VARCHAR(150),
  location_name VARCHAR(200),
  location_lat DECIMAL(9,6),
  location_lng DECIMAL(9,6),
  investigation_officer VARCHAR(100),
  officer_badge VARCHAR(20),
  year INT,
  month INT,
  hour_of_crime INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (crime_type_id) REFERENCES CrimeTypes(crime_type_id),
  FOREIGN KEY (district_id) REFERENCES Districts(district_id),
  INDEX idx_district (district_id),
  INDEX idx_crime_type (crime_type_code),
  INDEX idx_date (date_filed),
  INDEX idx_location (location_lat, location_lng),
  INDEX idx_status (status),
  INDEX idx_year_month (year, month)
);

-- Accused persons
CREATE TABLE IF NOT EXISTS Accused (
  accused_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  alias VARCHAR(100),
  age INT,
  gender ENUM('Male','Female','Other'),
  nationality VARCHAR(50) DEFAULT 'Indian',
  address TEXT,
  district_id INT,
  occupation VARCHAR(100),
  prior_convictions INT DEFAULT 0,
  modus_operandi TEXT,
  risk_score INT DEFAULT 0,
  photo_url VARCHAR(500),
  id_proof_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES Districts(district_id),
  INDEX idx_risk (risk_score)
);

-- Victims
CREATE TABLE IF NOT EXISTS Victims (
  victim_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  age INT,
  gender ENUM('Male','Female','Other'),
  occupation VARCHAR(100),
  address TEXT,
  district_id INT,
  vulnerability_score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES Districts(district_id)
);

-- FIR–Accused link table
CREATE TABLE IF NOT EXISTS FIR_Accused (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fir_id INT,
  accused_id INT,
  role VARCHAR(50) DEFAULT 'primary',
  FOREIGN KEY (fir_id) REFERENCES FIRs(fir_id),
  FOREIGN KEY (accused_id) REFERENCES Accused(accused_id),
  INDEX idx_fir (fir_id),
  INDEX idx_accused (accused_id)
);

-- FIR–Victim link table
CREATE TABLE IF NOT EXISTS FIR_Victims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fir_id INT,
  victim_id INT,
  FOREIGN KEY (fir_id) REFERENCES FIRs(fir_id),
  FOREIGN KEY (victim_id) REFERENCES Victims(victim_id),
  INDEX idx_fir (fir_id)
);
```

**Block 3 — Camera and Alert Tables:**
```sql
-- Camera registry
CREATE TABLE IF NOT EXISTS Cameras (
  camera_id INT AUTO_INCREMENT PRIMARY KEY,
  external_id VARCHAR(50) UNIQUE,
  name VARCHAR(200),
  type ENUM('Safe_City','BATCS','MCCTNS_Private','MCCTNS_RWA','MCCTNS_Commercial') NOT NULL,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  district_id INT,
  district_name VARCHAR(100),
  junction_name VARCHAR(200),
  has_anpr TINYINT(1) DEFAULT 0,
  has_face_recog TINYINT(1) DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  coverage_radius_m INT DEFAULT 30,
  installed_date DATE,
  last_maintenance DATE,
  FOREIGN KEY (district_id) REFERENCES Districts(district_id),
  INDEX idx_location (lat, lng),
  INDEX idx_type (type),
  INDEX idx_anpr (has_anpr)
);

-- ANPR Watchlist
CREATE TABLE IF NOT EXISTS ANPR_Watchlist (
  watchlist_id INT AUTO_INCREMENT PRIMARY KEY,
  plate_number VARCHAR(20) NOT NULL,
  fir_case_number VARCHAR(50),
  fir_id INT,
  crime_type VARCHAR(50),
  vehicle_description VARCHAR(200),
  alert_active TINYINT(1) DEFAULT 1,
  priority ENUM('high','medium','low') DEFAULT 'medium',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (fir_id) REFERENCES FIRs(fir_id),
  INDEX idx_plate (plate_number),
  INDEX idx_active (alert_active)
);

-- Alerts (ANPR matches, crime spikes, etc)
CREATE TABLE IF NOT EXISTS Alerts (
  alert_id INT AUTO_INCREMENT PRIMARY KEY,
  alert_type ENUM('anpr_match','crime_spike','repeat_offender_spotted','hotspot_emerging'),
  camera_id INT,
  plate_number VARCHAR(20),
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  matched_fir_id INT,
  description TEXT,
  severity ENUM('critical','high','medium','low') DEFAULT 'medium',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  acknowledged TINYINT(1) DEFAULT 0,
  acknowledged_by VARCHAR(100),
  FOREIGN KEY (camera_id) REFERENCES Cameras(camera_id),
  FOREIGN KEY (matched_fir_id) REFERENCES FIRs(fir_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_acknowledged (acknowledged)
);
```

---

## DAY 3, PART B — Load Real Data Into Database

After running the schema, you need to populate it with data. This requires a Python script.

### Step 1: Install Python Tools

If Python is not installed:  
Download from: **https://python.org/downloads** → Install Python 3.11+

Then install required libraries:
```bash
pip install pandas requests openpyxl mysql-connector-python python-dotenv faker
```

### Step 2: Create Your .env File

In the root of the project, create a file called `.env` (no extension):
```
CATALYST_DB_HOST=your_data_store_host_from_catalyst_dashboard
CATALYST_DB_PORT=3306
CATALYST_DB_NAME=DRISHTI_KSP
CATALYST_DB_USER=your_username
CATALYST_DB_PASSWORD=your_password
```

Get these values from: Catalyst Dashboard → Data Store → Connection Details

### Step 3: Create the Data Loading Script

Create a file: `crime-database/data-scripts/load_data.py`

Paste this prompt into Claude, copy the complete output as your script:

```
Write a complete Python script for loading real data into a MySQL database for a 
crime intelligence platform. The script reads from CSV files and generates synthetic 
FIR records that statistically match real NCRB data.

Database connection uses python-dotenv (.env file) and mysql-connector-python.

Script should have these sections, each as a separate function:

SECTION 1: load_districts()
- Read from file: crime-database/raw-data/census/karnataka_districts_census.csv
- Insert into Districts table
- If file doesn't exist, use a hardcoded list of 15 Karnataka districts with REAL 
  2011 Census population figures (include the actual numbers in the code as fallback only)

SECTION 2: load_police_stations()
- Read from: crime-database/raw-data/police-stations/bengaluru_stations.csv
- Insert into PoliceStations table with approximate lat/lng for each area
- These are real station names, just the coordinates are approximate

SECTION 3: load_crime_types()
- Insert these standard IPC crime type codes into CrimeTypes table:
  vehicle_theft, chain_snatching, burglary, robbery, assault, fraud, cybercrime, 
  drug_offence, murder, eve_teasing, kidnapping, hit_and_run, property_crime, 
  domestic_violence, senior_citizen_crime
- Map each to real IPC sections (e.g., vehicle_theft = IPC 379, robbery = IPC 392)

SECTION 4: load_cameras_from_osm()
- Read the GeoJSON file: crime-database/raw-data/traffic-signals/bengaluru_signals.geojson
- For each traffic signal point in the GeoJSON:
  - Create a BATCS camera record (type=BATCS, has_anpr=True)
  - Add a small random offset (max 20 meters = 0.0002 degrees) to lat/lng so 
    camera is not exactly at the signal center
- Also create Safe_City camera records near major junction clusters:
  - For every 3 BATCS cameras that are within 500m of each other, create 2 Safe_City 
    cameras with has_anpr=True and has_face_recog=True
- For MCCTNS cameras: generate 4000 random points within Bengaluru bounds 
  (lat 12.85-13.05, lng 77.50-77.70), type=MCCTNS_Private or MCCTNS_Commercial

SECTION 5: generate_firs_from_ncrb_data()
This is the most important function.
- Read the NCRB/OpenCity crime statistics CSV from: 
  crime-database/raw-data/karnataka-crime/
- Parse the district-wise crime counts by type
- For each district × crime_type combination, generate exactly that many FIR records 
  using the Faker library (Faker('en_IN') for Indian names)
- FIR record generation rules:
  - case_number: format "KAR/DIST_CODE/YEAR/NNNN" (sequential)
  - date_filed: distribute across the year weighted by real seasonal patterns 
    (vehicle theft higher in Diwali/festival months Oct-Nov, cyber crime consistent, 
    chain snatching peaks near crowded areas)
  - time_filed: more crimes between 8pm-2am (60%), daytime (40%)
  - location_lat/lng: random point within the district's approximate boundaries
  - investigation_officer: random Indian name from Faker
  - status: 60% open, 25% chargesheeted, 10% closed, 5% disposed
- Generate 15 "repeat accused" persons who each appear in 4-8 different FIRs

SECTION 6: generate_accused_and_victims()
Using Faker('en_IN'):
- For each FIR in the database, generate 1-2 accused records and 1 victim record
- Accused demographics should match Karnataka crime demographics from NCRB:
  - 75% male, 25% female
  - Age range 18-50 (peak at 22-35)
  - 30% have prior_convictions > 0
- Victim demographics:
  - Chain snatching: 65% women victims, 60% ages 40-70
  - Cybercrime: 45% elderly, 35% middle-aged
  - Vehicle theft: 70% male victims, working age 25-50
- Set vulnerability_score based on age/gender/crime_type

SECTION 7: generate_anpr_watchlist()
- Scan all FIRs in the database where description contains vehicle information
- OR: for vehicle_theft and robbery FIRs: generate a Karnataka plate number 
  (format: KA-XX-YY-NNNN) and add to ANPR_Watchlist
- Mark 70% as alert_active = True

Main function: call all sections in order with print statements showing progress.
Include: try/except around each section, print total records inserted.
```

### Step 4: Run the Data Loading Script

```bash
cd crime-database
python data-scripts/load_data.py
```

Watch the output. It should print:
```
Loading districts... ✓ (15 records)
Loading police stations... ✓ (X records)
Loading crime types... ✓ (15 records)
Loading cameras from OSM... ✓ (XXXX records)
Generating FIRs from NCRB data... ✓ (XXXX records)
Generating accused and victims... ✓ (XXXX records)
Building ANPR watchlist... ✓ (XXX records)
Done. Database ready.
```

If any section fails, copy the error message and paste into Claude with the prompt:
`"This Python script section is failing with this error: [paste error]. Fix it step by step."`

### Step 5: Verify Data Quality

In Catalyst Data Store → SQL Console, run these checks:

```sql
-- Check 1: Total FIR count (should be thousands, not hundreds)
SELECT COUNT(*) AS total_firs FROM FIRs;

-- Check 2: Crime distribution by district
SELECT district_name, COUNT(*) AS count 
FROM FIRs GROUP BY district_name ORDER BY count DESC LIMIT 10;

-- Check 3: Repeat offenders exist
SELECT accused_id, COUNT(*) AS fir_count 
FROM FIR_Accused GROUP BY accused_id 
HAVING fir_count > 3 ORDER BY fir_count DESC LIMIT 10;

-- Check 4: Camera count by type
SELECT type, COUNT(*) FROM Cameras GROUP BY type;

-- Check 5: ANPR watchlist has entries
SELECT COUNT(*) FROM ANPR_Watchlist WHERE alert_active = 1;

-- Check 6: Verify seasonal pattern exists
SELECT month, COUNT(*) FROM FIRs 
WHERE crime_type_code = 'vehicle_theft' 
GROUP BY month ORDER BY month;
```

If Check 3 returns no results, your repeat offender generation didn't work — go back and fix that section.

If Check 6 shows all months roughly equal (no seasonal pattern), the seasonal weighting isn't working — fix it.

---

## DAY 4 — API Keys and Environment Variable Setup

### Step 1: Get Anthropic API Key

1. Go to: **https://console.anthropic.com**
2. Create an account or sign in
3. Go to: **API Keys** → **Create Key**
4. Name it: `DRISHTI-KSP`
5. Copy the key (starts with `sk-ant-...`)
6. **Store it ONLY in your .env file — never paste it in code or send it in chat**

**Important:** Anthropic gives you free credits on signup. The claude-sonnet-4-5 model is what we use. Monitor usage at the console to make sure you don't exceed the free tier during development.

### Step 2: Get Catalyst Zia API Key

1. In Catalyst Dashboard → Your project → Zia Services
2. Click **API Keys** or **Access Token**
3. Generate a new key for the project
4. Copy it into your .env file as `CATALYST_ZIA_API_KEY`

### Step 3: Get Catalyst Data Store Connection Details

1. Catalyst Dashboard → Data Store → Connection Info (or Settings icon)
2. You will see: Host, Port, Database name, Username
3. Generate/copy the password
4. Put ALL of these in your .env file

### Step 4: Create One Master .env File and Distribute to Team

Create the final `.env` with ALL real values filled in:

```bash
# Create the final .env file
cat > .env << 'EOF'
# Anthropic
ANTHROPIC_API_KEY=sk-ant-XXXX

# Catalyst Project
CATALYST_PROJECT_ID=XXXX
CATALYST_ACCOUNT_ID=XXXX

# Catalyst Data Store
CATALYST_DB_HOST=XXXX.catalyst.zoho.com
CATALYST_DB_PORT=3306
CATALYST_DB_NAME=DRISHTI_KSP
CATALYST_DB_USER=XXXX
CATALYST_DB_PASSWORD=XXXX

# Catalyst Zia Services
CATALYST_ZIA_API_KEY=XXXX

# QuickML LLM Endpoint
CATALYST_QUICKML_ENDPOINT=https://quickml.catalyst.zoho.com/...

# Frontend (used by Next.js)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_MAPS_TILE=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
EOF
```

### Step 5: Distribute Credentials Securely to Team

**Do NOT send API keys on WhatsApp text or in GitHub commits.**

Use one of these methods:
- Google Drive: Upload the `.env` file to a private Google Drive folder, share only with the 4 members
- OR: Create a private WhatsApp group for just credentials, send the file there

Every team member should:
1. Clone the repo (if not done already)
2. Copy the `.env` file into the root of their local repo
3. Verify `.env` is listed in `.gitignore` (check that it says `.env` in the .gitignore file)
4. Never push the `.env` file to GitHub

---

## DAY 5 — Set Up Catalyst QuickML (AI Engine Foundation)

Even though Member 2 builds the AI features, you need to set up the QuickML foundation in the Catalyst dashboard.

### Step 1: Configure QuickML LLM Project

1. Catalyst Dashboard → QuickML → Your project `drishti-ai`
2. Under **LLM Configuration**:
   - Select model: **Claude (Anthropic)**
   - Paste your `ANTHROPIC_API_KEY`
   - Set max tokens: 2000
   - Temperature: 0.3 (for factual crime queries)
3. Save the configuration
4. Note the **API Endpoint URL** — paste this into the `.env` file as `CATALYST_QUICKML_ENDPOINT`

### Step 2: Create the Knowledge Base

1. Inside QuickML → **Knowledge Base** → **Create New**
2. Name: `drishti-crime-kb`
3. For now, upload the NCRB reports you downloaded as PDF files:
   - Karnataka crime statistics 2022
   - Karnataka crime statistics 2023
   - NCRB 2022 Book 1 PDF
4. This gives the AI actual knowledge about Karnataka crime context
5. The knowledge base will be queryable by Member 2's RAG pipeline

### Step 3: Set Up Catalyst Authentication

1. Catalyst Dashboard → Authentication
2. Under **User Management** → create test users for the demo:
   - `inspector@drishti.ksp` / password of your choice → Role: Inspector
   - `analyst@drishti.ksp` / password → Role: Analyst  
   - `policymaker@drishti.ksp` / password → Role: Policymaker
3. Under **Custom Claims** or **User Metadata** → add a field `role` to each user
4. Share these test credentials with all team members for testing

---

## WEEKS 2-6 — Daily Management Routine

You are not writing complex code during this phase. Your job is to keep the team moving.

### Every Day (5 minutes)

Send this message in your team WhatsApp group at 7:00 PM every day:

> 📍 **DRISHTI Daily Check-In**
> Reply with:
> ✅ Completed today:
> 🔴 Currently blocked on:
> 📅 Plan for tomorrow:

### When Someone Is Blocked (most common scenarios)

**Error they can't understand:**
Ask them to paste the full error + the relevant code.
Copy both into Claude with this prompt:
```
This is part of the DRISHTI project (crime intelligence platform).
[Member name] is building [their feature].
They are getting this error:
[paste error]
Their code:
[paste code]
Fix this step by step. Explain what was wrong in simple terms.
```
Share the fix back.

**API not working:**
Ask them to test in Postman first. If it works in Postman but not in code, it's a code issue. If it doesn't work in Postman, it's a configuration issue — check the .env file.

**"I don't know how to start":**
Ask them what specific step they're on. Share the prompt from the team manual for that exact step. Sit on a call and watch them run the prompt together.

### GitHub — Every 2 Days Minimum

Every 2 days, check GitHub to see if each member has pushed commits.
If someone hasn't committed in 3 days:
1. Message them directly (not in the group)
2. Ask what's blocking them specifically
3. Get on a 15-minute voice call and help them get unstuck

**How to merge code when a module is done:**

```bash
# You do this on your computer
git checkout main
git pull origin main
git merge origin/ai-engine --no-ff -m "Merge AI Engine module"
git push origin main

# Repeat for each module when it's ready:
git merge origin/crime-database --no-ff -m "Merge crime database module"
git merge origin/camera-intel --no-ff -m "Merge camera intelligence module"
git merge origin/frontend --no-ff -m "Merge frontend module"
```

If there are merge conflicts (GitHub shows red conflict lines), paste the conflicting code into Claude:
```
I have a GitHub merge conflict between these two files.
File from main: [paste]
File from branch: [paste]
Help me resolve this conflict and show me the final correct version.
```

### Weekly Milestone Check

At the end of each week, verify these are done:

**End of Week 1:**
- [ ] All 5 members can access the GitHub repo
- [ ] Catalyst project set up with all services enabled
- [ ] Real datasets downloaded (all 6 from Day 2)
- [ ] Database schema created (all tables)
- [ ] Data loading script run successfully
- [ ] .env file distributed to all members
- [ ] Member 5's landing page is visible in a browser

**End of Week 2:**
- [ ] Member 2's basic chat API returns a response when tested in Postman
- [ ] Member 3's hotspot API returns a JSON with coordinates
- [ ] Member 4's camera query returns real-ish data
- [ ] Member 5's chat interface renders in browser (even with mock data)

**End of Week 3:**
- [ ] Member 2's voice input works — can speak a query, see it transcribed
- [ ] Member 3's under-reporting and victim APIs working
- [ ] Member 4's geo-trail simulates 5 hops
- [ ] Member 5's role dashboards switch correctly

**End of Week 4:**
- [ ] Member 2's full response includes a visualization type in the JSON
- [ ] Member 3's trend API shows seasonal variation in the data
- [ ] Member 4's Chrono-graph animates when slider is dragged
- [ ] Member 5's visualization components render in the chat UI

---

## WEEK 5-6 — Integration Sprint

This is when you do your heaviest technical work. You connect all 4 modules together.

### Step 1: Understand the Integration Architecture

Draw this on paper. It helps to visualize it.

```
User (browser)
     ↓
Frontend (Catalyst Slate - Next.js)
     ↓ HTTP request
Main API Gateway (your Catalyst Serverless Function)
     ↓
AI Engine (Member 2's chat function)
     ↓ if data needed
Crime DB APIs (Member 3's functions)  
Camera Intel APIs (Member 4's functions)
     ↓
Catalyst Data Store (MySQL database)
     ↑
All results flow back up to Frontend
```

### Step 2: Create the Integration Router

Create file: `deployment/functions/gateway/index.js`

Paste this into Claude:
```
Write a Node.js Catalyst Serverless Function as an API gateway/router for the DRISHTI platform.

This function receives all requests from the frontend and routes them to the correct 
sub-function.

Routes to handle:
POST /api/chat 
  → calls the AI Engine function (ai-engine module)
  → if the AI response includes needs_data field, calls the appropriate data API:
    - needs_data.type === 'hotspots' → GET /api/analytics/hotspots with needs_data.params
    - needs_data.type === 'cameras' → GET /api/cameras/nearby with needs_data.params
    - needs_data.type === 'trail' → POST /api/trail with needs_data.params
    - needs_data.type === 'firs' → GET /api/firs with needs_data.params
  → merges the data back into the response
  → returns complete response to frontend

GET /api/analytics/hotspots → passes through to Member 3's hotspot function
GET /api/analytics/underreporting → passes through to Member 3
GET /api/analytics/victims → passes through to Member 3
GET /api/analytics/repeat-offenders → passes through to Member 3
GET /api/analytics/trends → passes through to Member 3
GET /api/cameras/nearby → passes through to Member 4's camera function
POST /api/trail → passes through to Member 4's trail function
POST /api/anpr/check → passes through to Member 4's ANPR function
GET /api/firs → queries Catalyst Data Store directly, returns filtered FIR list

All errors: return { error: true, message: "...", status: 500 }
All function URLs come from environment variables (FUNCTION_URL_AI_ENGINE, 
FUNCTION_URL_ANALYTICS, FUNCTION_URL_CAMERAS)
Use Catalyst SDK. Node.js. Include CORS headers.
```

### Step 3: Connect Frontend to Gateway

Once the gateway is deployed to Catalyst, update the frontend's API calls.

In the frontend `.env.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://YOUR_CATALYST_FUNCTION_URL
```

Then in the frontend code (Member 5's chat component), the API call should be:
```js
const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, language, conversation_id, conversation_history })
});
```

### Step 4: End-to-End Test (The Smoke Test)

Run through this test and make sure EVERYTHING works:

1. Open the frontend in browser
2. Login as `inspector@drishti.ksp`
3. Type in chat: "How many vehicle thefts happened in Bengaluru this year?"
4. Expected: response text + a bar chart showing monthly distribution
5. Type: "Show me where they happened"
6. Expected: a map with pins for the crime locations
7. Type: "Find cameras near Silk Board Junction"
8. Expected: a map with camera pins
9. Click "Trace Suspect" button
10. Expected: animated path across 5 camera points
11. Switch to Network Graph tab
12. Expected: Chrono-graph loads with real accused data from DB

If any step fails, note which step and debug that specific connection.

---

## WEEK 7, PART A — Deployment on Catalyst AppSail

### Step 1: Install Catalyst CLI

```bash
npm install -g @zohocloud/catalystcli
catalyst login
# Follow login prompts — use your Catalyst account credentials
```

### Step 2: Link CLI to Your Project

```bash
catalyst init
# Select project: DRISHTI-KSP
# This creates a catalyst.json in your project root
```

### Step 3: Deploy Frontend (Catalyst Slate)

```bash
cd frontend
# Build the Next.js app
npm run build
# Deploy to Catalyst Slate
catalyst deploy --frontend
```

After deployment, Catalyst gives you a URL like:
`https://drishti-ksp-XXXX.catalystserverless.com`

This is your live frontend URL. Test it by opening in browser.

### Step 4: Deploy Backend Functions

```bash
# From project root
catalyst deploy --functions
```

This deploys all Catalyst Serverless Functions in your project.

After deployment, in Catalyst Dashboard → Serverless Functions, you can see each function's URL.

### Step 5: Update Environment Variables in Catalyst

In Catalyst Dashboard → Serverless Functions → App Settings → Environment Variables:
Add each key-value pair from your `.env` file here.

This is how your deployed functions access API keys without hardcoding them.

### Step 6: Test the Deployed App

Open the deployed URL in your browser.
Run the full smoke test from Step 4 of Integration Sprint again.
If anything fails on the deployed version but worked locally, check:
- Environment variables are set in Catalyst (not just in local .env)
- Function URLs in gateway function point to the deployed URLs, not localhost

### Step 7: Get Your Deployment URL

The final deployed URL for submission will be:
`https://drishti-ksp-[your-project-id].catalystserverless.com`

Write this down — you need to submit it on Hack2Skill.

---

## WEEK 7, PART B — Recording the Demo Video

### What You Need

- Laptop with the deployed app open
- OBS Studio (free screen recorder): **https://obsproject.com**
- External microphone if possible (phone headphones work fine)
- Quiet room
- Someone to read the demo script while you click (or you do both)

### OBS Setup (5 minutes)

1. Download and install OBS from obsproject.com
2. Open OBS → Sources → click "+" → "Display Capture"
3. Select your main monitor
4. Click "+" → "Audio Input Capture" → select your microphone
5. Settings → Output → Recording → set path to Desktop
6. Click "Start Recording"

### Before Recording — Load Real Data Into Demo State

Run these SQL statements in Catalyst Data Store to make the demo impressive:
```sql
-- Ensure there are fresh ANPR alerts for demo
INSERT INTO Alerts (alert_type, plate_number, lat, lng, description, severity, timestamp)
VALUES ('anpr_match', 'KA-03-MH-7823', 12.9352, 77.6245, 
'Vehicle KA-03-MH-7823 spotted at Koramangala 5th Block junction. Matches FIR KAR/BLR/2026/1847 — vehicle theft.', 
'critical', NOW());

-- Ensure demo repeat offender exists
UPDATE Accused SET risk_score = 92 WHERE accused_id IN (
  SELECT accused_id FROM FIR_Accused GROUP BY accused_id HAVING COUNT(*) > 4 LIMIT 1
);
```

### Record the Demo

Follow the 5-minute demo script from the Team Manual exactly.
Record in one take if possible — 5 minutes is short.
If you make a mistake: keep going, don't restart mid-demo. Judges understand live demos.

### Upload the Demo Video

1. Go to Google Drive → upload the recorded video
2. Right-click the file → Share → "Anyone with link can view"
3. Copy the share link
4. This goes into your submission

---

## WEEK 7, PART C — Final Submission on Hack2Skill

### Step 1: Download the Submission Template

Go to:
**https://docs.google.com/presentation/d/1XWKQ3Hi3yKeDAQrHzQA4_vUF9pvC43Hjh7x7pr4jBpA/export/pptx**

This downloads the official submission PPT template. Open it in PowerPoint or Google Slides.
Fill in every field using Member 5's presentation deck content as the source.

### Step 2: Write the Submission Brief (1024 characters)

This is the text field in the submission form. Use the prompt from the main Team Manual to generate it, then paste it here. Make sure it's under 1024 characters exactly.

### Step 3: Verify All Links Work Before Submitting

Check these 4 things:
1. **GitHub repo** → open `https://github.com/YOUR_USERNAME/drishti-ksp` in incognito browser. Can you see it? Is the README good?
2. **Deployed app** → open the Catalyst AppSail URL in a fresh browser. Does it load? Can you log in?
3. **Demo video** → open the Google Drive link in incognito browser. Does it play?
4. **Submission PDF deck** → open the PDF. Is it the right file? Are all slides complete?

If any of these fail — fix before submitting. A broken link = disqualification risk.

### Step 4: Submit on Hack2Skill

Go to the hackathon submission page on Hack2Skill.
Fill in:
- Challenge: **Intelligent Conversational AI for KSP Crime Database**
- Prototype Brief: paste your 1024-character brief
- GitHub URL: `https://github.com/YOUR_USERNAME/drishti-ksp`
- Deployed solution URL: `https://drishti-ksp-XXXX.catalystserverless.com`
- Demo video URL: your Google Drive link
- Upload prototype deck PDF

Click Submit. Screenshot the confirmation page.

**Deadline: 26 July 2026, 11:59 PM IST. Do not cut it close. Submit by 25 July at the latest.**

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

*DRISHTI — ದೃಷ್ಟಿ | Person 1 Captain Guide | KSP × Hack2Skill 2026*
