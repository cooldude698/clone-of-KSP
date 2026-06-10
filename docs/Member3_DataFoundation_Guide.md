# DRISHTI — ದೃಷ್ಟಿ

## MEMBER 3: Data & Analytics Commander
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:**
> You are the foundation. You design the database schema, write the Python scripts that load the synthetic records matching NCRB realities, and build the analytical APIs the AI uses.

---

## 1. Prerequisites & Branch Setup

```bash
# 1. Pull the latest code
git pull origin main

# 2. Switch to your dedicated branch
git checkout crime-data

# 3. Initialize your workspace
cd crime-database
npm init -y
npm install @catalyst-platform/catalyst-node-sdk axios dotenv
# For the python scripts
pip install faker mysql-connector-python python-dotenv
```

---

## 2. Step-by-Step Vibe Coding Guides

Use these exact prompts in Claude. Keep your APIs blazing fast (do the math in SQL where possible, not deep iterative processing in script).

### Feature 1: The Mock Data Generator Script
**Where to put it:** `crime-database/data-scripts/load_data.py`

**Prompt:**
> "Act as a Data Engineer for law enforcement intelligence. Write a Python script to populate a MySQL database using `mysql-connector-python` and `Faker`. 
> 1. It must read env variables for the Zoho Catalyst Data Store connection.
> 2. It must load 500 FIRs matching real Bengaluru crime profiles. Ensure geolocation lat/longs strictly fall within Bengaluru boundaries (from sample OpenCity bounding box).
> 3. Generate Victims with weighted vulnerability profiles (Elderly, Students).
> 4. Generate Accused. Crucially, force 10-15 of these accused to appear in *multiple* FIRs (3+ cases each). We need repeat offenders for our risk network graph.
> 5. Output beautiful `rich` terminal progress bars as the script inserts batches into Catalyst."

### Feature 2: Hotspot & Victim Vulnerability APIs
**Where to put it:** `crime-database/functions/analytics/` (We group them into one express-style Catalyst serverless function with routes)

**Prompt:**
> "Write a Node.js Zoho Catalyst serverless function handling multiple Express routes for Crime Analytics.
> 
> **Route 1: GET /api/hotspots**
> Query params: `district`, `months_back`.
> Logic: Run an SQL query via Catalyst SDK to fetch counts of FIRs grouped by a bounded lat/lng coordinate rounding logic (to create grid cells). Calculate a 'severity_score' prioritizing violent crimes. Return top 25 JSON results of `{ cell_lat, cell_lng, severity_score, crime_types }`.
> 
> **Route 2: GET /api/victim-vulnerability**
> Logic: Fetch victims via Catalyst SDK. Calculate arbitrary vulnerability scores ranging from 0-100 where `age > 60 = 30 points`, `crime = assault = +20`. Return JSON grouping by top risk demographics and recommended locations to patrol."

### Feature 3: Repeat Offender Graph API
**Where to put it:** `crime-database/functions/analytics/` (Add to existing router)

**Prompt:**
> "Add a new route `GET /api/repeat-offenders` to the Express router. 
> 
> Fetch all accused who have `>1` entry in the `FIR_Accused` mapping table. For each, sum their total cases and calculate a geographic spread (count unique districts they hit). Build a Node/Edge JSON payload structured perfectly for D3.js: `{ "nodes": [{ "id": 1, "name": "...", "total_firs": 4, "risk_score": 88 }], "edges": [{ "source": "accused_1", "target": "case_101" }] }`. Return strictly as JSON. No formatting fluff."

---

## 3. Testing Quality & Performance

**Test the Data Generator:**
Run your python script: `python data-scripts/load_data.py`. 
Login to Catalyst → Data Store → SQL Console:
```sql
SELECT district, count(*) FROM FIR_Accused JOIN Accused... 
```
If your SQL queries show `0` for repeat offenders, **your data generation logic failed.** Fix it before writing the APIs!

**Test the APIs:**
```bash
curl "http://localhost:3000/server/analytics/hotspots?months_back=6"
```
**Quality Checklist:**
- [ ] Do the latitude and longitude coordinates actually render inside Bengaluru if plotted on Google Maps?
- [ ] Is the data query fast? Under 800ms? Add database indexes via Catalyst SQL if it hangs.

---

## 4. Git Workflow & Pull Request

```bash
git add .
git commit -m "feat(data): created python generators and hotpot analytics endpoints"
git push origin crime-data
```

Go to GitHub. Open a PR from `crime-data` to `main`. Ask Member 1 (Captain) to review.