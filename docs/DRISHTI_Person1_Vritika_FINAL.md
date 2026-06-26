# DRISHTI — ದೃಷ್ಟಿ
## Person 1: Vritika — Complete Captain's Guide (Final, Fully Corrected)
**KSP × Hack2Skill Datathon 2026**

---

> **Your role in one sentence:** You are the foundation. You set up Catalyst, build the database schema, manage the GitHub repo, distribute credentials, run the team's daily rhythm, and lead integration and deployment. Nobody else on the team can properly start until your Day 1–2 work is done.

---

## YOUR COMPLETE TASK LIST — EVERY STEP

```
Day 1   → Catalyst account + credits + CLI install + login + project init + enable services
Day 1   → GitHub repo + branches + corrected .env.example
Day 2   → Build all 11 database tables + every column, by hand, in the console
Day 3   → Authentication test users created
Day 4   → Confirm Gemini API key works + distribute final .env to the whole team
Day 4   → Stratus bucket created + test the CLI import flow with a tiny dummy file
Day 5   → Share table schema + API contract expectations with Aman and the camera person
Week 2-4 → Daily management routine (every single day)
Week 5  → Integration sprint — build the API gateway function
Week 6  → Deploy everything (Functions + Slate)
Week 7  → Record demo, finalize GitHub README, submit
```

Work through every section below in order. Nothing here is optional.

---

## DAY 1 — Catalyst Account, CLI, and Project Setup

### Step 1: Create Your Catalyst Account
1. Go to **https://catalyst.zoho.com**
2. Click **Sign Up Free**
3. Use a personal email you'll keep checking for the next two months
4. Complete email verification
5. Fill in your profile: Name, Organisation = "Team DRISHTI"

### Step 2: Claim Your Free Hackathon Credits
1. Open a new tab: **https://catalyst.zoho.com/promotions.html?cn=KSPH26**
2. Click **Claim Credits**, enter code **KSPH26** if prompted
3. Confirm credits appear in your account dashboard
4. Screenshot this page and save it — useful if there's ever a billing dispute

### Step 3: Create Your Project
1. In the Catalyst dashboard, click **Create New Project**
2. Project name: **DRISHTI-KSP**
3. Region: **India**
4. Click **Create**

### Step 4: Install the Catalyst CLI
```bash
npm install -g zoho-catalyst-cli
catalyst --version
```
If the exact package name doesn't resolve, check **Settings → CLI** in your Catalyst dashboard for the current install command — Zoho occasionally renames packages.

### Step 5: Log In With the CLI
```bash
catalyst login
```
This opens your browser, you sign in with your Catalyst account, and the CLI stores an authenticated session. **This is the only credential anyone needs for database access** — there is no separate host, port, username, or password to find anywhere. If you ever see a guide telling you to look for those, ignore it — they don't exist in Catalyst.

### Step 6: Initialize the Project Locally
```bash
mkdir drishti-ksp && cd drishti-ksp
catalyst init
```
- Select your `DRISHTI-KSP` project when prompted
- Choose to initialize **Functions** when asked
- Choose to initialize a **Client** — pick the closest available option (Basic/React) if Next.js isn't directly listed; Person 5 will set up the real Next.js app separately in her own folder regardless
- This creates a `catalyst.json` file in your project — this file is what makes `catalyst serve` and `catalyst deploy` work for the whole team later, so don't delete it

### Step 7: Enable Services in the Dashboard
In Catalyst Dashboard → your project → left sidebar, enable each of these:
- **Data Store**
- **NoSQL**
- **Stratus**
- **Serverless Functions**
- **Authentication**
- **API Gateway**

**Do not waste time looking for:** a Zia voice/speech option (doesn't exist — Zia only covers OCR, face analytics, text analytics, object recognition, barcode scanning), a QuickML "endpoint to copy" (it's a no-code pipeline builder behind early-access approval, not something you grab a key for in five minutes), or a database host/port/password screen (doesn't exist).

---

## DAY 1 — GitHub Repository Setup

### Step 1: Create the Repository
1. Go to **https://github.com**
2. Click **+** → **New repository**
3. Name: **drishti-ksp**
4. Description: `Intelligent Crime Intelligence Co-Pilot for Karnataka State Police — KSP × Hack2Skill Datathon 2026`
5. Visibility: **Public** (required for the hackathon submission)
6. Check **Add a README file**
7. .gitignore template: **Node**
8. Click **Create repository**

### Step 2: Add Every Team Member as a Collaborator
Repo → **Settings → Collaborators → Add people**. Add Aman, the AI engine person, the camera-intel person, and the UI/UX person by their GitHub usernames. Each accepts the email invite the same day.

### Step 3: Clone and Build the Folder Structure
```bash
git clone https://github.com/YOUR_USERNAME/drishti-ksp.git
cd drishti-ksp

mkdir -p ai-engine/functions
mkdir -p crime-database/functions
mkdir -p crime-database/data-scripts
mkdir -p crime-database/raw-data
mkdir -p crime-database/generated-csv
mkdir -p camera-intel/functions
mkdir -p camera-intel/data-scripts
mkdir -p frontend
mkdir -p deployment
mkdir -p docs

echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo "*.csv" >> .gitignore
echo "raw-data/" >> .gitignore
echo "generated-csv/" >> .gitignore
```

### Step 4: Create the Corrected .env.example — Commit This One
```bash
cat > .env.example << 'EOF'
# AI Engine — Gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Catalyst Project identifiers only — there is no DB host/port/user/password
CATALYST_PROJECT_ID=your_project_id
CATALYST_ACCOUNT_ID=your_account_id

# Frontend
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
EOF
git add .
git commit -m "Initial project structure and corrected env template"
git push origin main
```

### Step 5: Create Working Branches
```bash
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

### Step 6: Write the README
Paste this into Claude, copy the output into `README.md`:
```
Write a professional GitHub README for DRISHTI — an AI Crime Intelligence Co-Pilot 
for Karnataka State Police, built for the KSP × Hack2Skill Datathon 2026.

Include: project title (DRISHTI ದೃಷ್ಟಿ) with tagline "Intelligence that sees what 
others miss"; the problem (siloed KSP data systems, cameras not connected to crime 
database); the solution overview; 10 key features one-line each; what makes it 
unique (comparison table vs a typical chatbot); tech stack (Gemini API, Catalyst 
Data Store, Serverless Functions, Authentication, Slate, Stratus); real datasets 
used with links (NCRB/OpenCity Karnataka crime data, OpenStreetMap traffic signals, 
DataMeet Karnataka district boundaries, Census 2011); project folder structure; 
basic setup instructions; team section listing 5 members and roles; deployment 
via Catalyst Slate. Professional tone, no fluff.
```
Commit it.

---

## DAY 2 — Build the Database Schema (Manual, By Hand — No SQL)

There is no `CREATE TABLE` anywhere in Catalyst. Every table and every column is created by clicking through the console UI. This takes time — budget half a day. It only needs doing once.

### The Row-Limit-Aware Plan

Catalyst's development environment caps every table at **5,000 rows** and the entire project at **25,000 rows total**. Share this target table with Aman and the camera-intel person before anyone generates data:

| Table | Target Rows | Owner |
|---|---|---|
| Districts | ~20 | Aman |
| PoliceStations | ~120 | Aman |
| CrimeTypes | 15 | Aman |
| FIRs | ~2,500 | Aman |
| Accused | ~2,500 | Aman |
| Victims | ~2,500 | Aman |
| FIR_Accused | ~2,800 | Aman |
| FIR_Victims | ~2,500 | Aman |
| ANPR_Watchlist | ~800 | Aman |
| Cameras | ~2,000 | Camera-intel person |
| Alerts | ~50 (generated live) | Camera-intel person |
| **Total** | **~15,805** | Safely under 25,000 |

### Step 1: Create Each Table

Catalyst Dashboard → **Data Store → Tables List → + New Table**. Create these 11 tables, exact names, case-sensitive, no spaces:
```
Districts
PoliceStations
CrimeTypes
FIRs
Accused
Victims
FIR_Accused
FIR_Victims
Cameras
ANPR_Watchlist
Alerts
```

### Step 2: Add Every Column to Every Table

Click into each table → **Schema View → + New Column**. Available data types: Var Char (≤255 chars), Text (≤10,000 chars), Int, BigInt, Double, Boolean, Date, Foreign Key, Encrypted Text. There's no ENUM — for fields like `status`, use Var Char and enforce allowed values in your function code.

**Districts**
| Column | Type |
|---|---|
| name | Var Char |
| division | Var Char |
| population | Int |
| urban_population_pct | Double |
| area_sqkm | Double |
| lat_center | Double |
| lng_center | Double |

**PoliceStations**
| Column | Type |
|---|---|
| name | Var Char |
| district_name | Var Char |
| division | Var Char |
| address | Var Char |
| lat | Double |
| lng | Double |

**CrimeTypes**
| Column | Type |
|---|---|
| code | Var Char |
| name | Var Char |
| category | Var Char |
| ipc_section | Var Char |
| severity | Int |

**FIRs**
| Column | Type |
|---|---|
| case_number | Var Char |
| date_filed | Date |
| time_filed | Var Char |
| crime_type_code | Var Char |
| description | Text |
| status | Var Char |
| district_name | Var Char |
| police_station | Var Char |
| location_name | Var Char |
| location_lat | Double |
| location_lng | Double |
| investigation_officer | Var Char |
| year | Int |
| month | Int |
| hour_of_crime | Int |

**Accused**
| Column | Type |
|---|---|
| full_name | Var Char |
| alias | Var Char |
| age | Int |
| gender | Var Char |
| address | Text |
| district_name | Var Char |
| occupation | Var Char |
| prior_convictions | Int |
| modus_operandi | Text |
| risk_score | Int |

**Victims**
| Column | Type |
|---|---|
| full_name | Var Char |
| age | Int |
| gender | Var Char |
| occupation | Var Char |
| district_name | Var Char |
| vulnerability_score | Int |

**FIR_Accused**
| Column | Type |
|---|---|
| fir_case_number | Var Char |
| accused_full_name | Var Char |
| role | Var Char |

**FIR_Victims**
| Column | Type |
|---|---|
| fir_case_number | Var Char |
| victim_full_name | Var Char |

**Cameras**
| Column | Type |
|---|---|
| external_id | Var Char |
| name | Var Char |
| type | Var Char |
| lat | Double |
| lng | Double |
| district_name | Var Char |
| junction_name | Var Char |
| has_anpr | Boolean |
| has_face_recog | Boolean |
| is_active | Boolean |
| coverage_radius_m | Int |

**ANPR_Watchlist**
| Column | Type |
|---|---|
| plate_number | Var Char |
| fir_case_number | Var Char |
| crime_type | Var Char |
| alert_active | Boolean |
| priority | Var Char |

**Alerts**
| Column | Type |
|---|---|
| alert_type | Var Char |
| camera_external_id | Var Char |
| plate_number | Var Char |
| lat | Double |
| lng | Double |
| matched_fir_case_number | Var Char |
| description | Text |
| severity | Var Char |
| acknowledged | Boolean |

**Why natural keys instead of formal Foreign Keys:** Catalyst's "Foreign Key" column type exists, but wiring it up correctly takes longer than the hackathon timeline allows. Instead, `FIR_Accused` and `FIR_Victims` store the FIR's `case_number` and the person's `full_name` as plain text — your team's function code joins on these values directly. This is what the column lists above already assume.

### Step 3: Set Scopes & Permissions
For each table, open the **Scopes & Permissions** tab (next to Schema View). For the hackathon: allow full read/write access through your Catalyst Functions (server-side, authenticated automatically by running inside Catalyst's infrastructure), and don't worry about granular client-side permissions — nothing in this project writes directly from the browser.

---

## DAY 3 — Authentication Test Users

1. Catalyst Dashboard → **Authentication → User Management → Add User**
2. Create three test accounts:
   - `inspector@drishti.ksp`
   - `analyst@drishti.ksp`
   - `policymaker@drishti.ksp`
3. Set a password for each. Write them down.
4. If Catalyst Authentication offers a custom metadata/field option, add a `role` value per user. If it doesn't, that's fine — Person 5's login screen can simply let the person pick their role from a dropdown after logging in and store it in `localStorage`. This is a perfectly acceptable simplification for a hackathon demo.
5. Share these three sets of credentials with the whole team via a private Google Drive note or private WhatsApp message — never in GitHub.

---

## DAY 4 — Confirm Gemini Works, Create Stratus Bucket, Test the Import Flow

### Step 1: Verify the Gemini API Key
```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text":"Say hello in one word"}]}]}'
```
A JSON response with generated text back means the key works.

### Step 2: Distribute the Final, Corrected .env
```
GEMINI_API_KEY=<real key>
GEMINI_MODEL=gemini-2.5-flash
CATALYST_PROJECT_ID=<your project id>
CATALYST_ACCOUNT_ID=<your account id>
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```
Share via private Google Drive or WhatsApp. Tell the AI engine person directly: build the chat function around the **Gemini SDK** (`@google/generative-ai` for Node.js), not Anthropic. The JSON response schema, system prompt structure, and visualization-routing logic stay exactly the same — only the API call changes.

### Step 3: Create the Stratus Bucket
Catalyst Dashboard → **Stratus → Create Bucket** → name it `drishti-imports`. This is where CSV files get auto-uploaded during the data import step (Aman and the camera-intel person will use this once their CSVs are ready — they don't need to manually upload anything, the CLI handles it).

### Step 4: Test the Import Flow End-to-End With a Dummy File
Before Aman generates thousands of real rows, prove the pipeline works with something tiny:
```bash
echo "name,division,population,urban_population_pct,area_sqkm,lat_center,lng_center
Test District,Test,100000,50.5,200.0,12.97,77.59" > test.csv

catalyst ds:import test.csv --table Districts
```
Watch the CLI stream the job status. On success, type `y` to download the report file and confirm 1 row was written. Check **Data Store → Districts → Data View** in the console to see it. Then delete that test row manually from the console before real data comes in.

If this works, the entire import pipeline is proven — Aman and the camera-intel person can now run the exact same `catalyst ds:import [file] --table [name]` pattern with confidence.

---

## DAY 5 — Hand Off Clearly to the Rest of the Team

Send these in your team WhatsApp group, each as a separate clear message:

**To Aman:**
> "Tables are live in Catalyst — all 11, columns added. Stratus bucket `drishti-imports` exists. I tested `catalyst ds:import` with a dummy row and it works. You're clear to start generating your CSVs and importing — follow the Data Setup guide. Row budget: ~13,755 total across your 9 tables, please don't exceed 5,000 in any single one."

**To the camera-intel person:**
> "Same as above — Cameras table is ready with all its columns. Your row budget is ~2,000 for Cameras. Use the identical `catalyst ds:import` command once your CSV is generated from the Overpass data."

**To the AI engine person:**
> "Use Gemini, not Anthropic — here's the key. Build your chat function with `@google/generative-ai`. Database access only happens through Catalyst Functions using the SDK, never a direct connection. Push your API_CONTRACT.md to your branch as soon as you've defined the request/response JSON shape — Person 5 needs it before she can build the chat UI."

**To Person 5 (UI/UX):**
> "You can start the Next.js project and design system today — you don't need anything from anyone else for Day 1. I'll share Catalyst Slate access when we get to deployment in Week 6."

---

## WEEKS 2-4 — Daily Management Routine

### Every Day, 7:00 PM
Send this in the team WhatsApp group:
> 📍 **DRISHTI Daily Check-In**
> ✅ Completed today:
> 🔴 Currently blocked on:
> 📅 Plan for tomorrow:

### When Someone Is Blocked
Ask them to paste the **full error** and the **relevant code**. Paste both into Claude with:
```
This is part of the DRISHTI project (crime intelligence platform for Karnataka 
Police), using Catalyst Functions + the Node.js SDK (or Gemini API for the AI 
engine). [Name] is building [feature]. They are getting this error:
[paste error]
Their code:
[paste code]
Fix this step by step, explain what was wrong in simple terms.
```
A good first question to ask anyone stuck on a Catalyst error: **"are you trying to connect with a host/port, or are you using the SDK/CLI?"** — if it's the former, that's always the bug.

### GitHub — Check Every 2 Days
```bash
git checkout main
git pull origin main
git merge origin/ai-engine --no-ff -m "Merge AI Engine module"
git push origin main
```
Repeat for `crime-database`, `camera-intel`, `frontend` as each becomes ready. If GitHub shows a merge conflict, paste both conflicting versions into Claude and ask for the resolved final version.

### Weekly Milestone Checks

**End of Week 1:** All 5 members can access GitHub. All 11 tables + columns exist. Test users created. Gemini key verified and distributed. Test CSV import succeeded.

**End of Week 2:** Aman's data is loaded and verified via ZCQL `SELECT COUNT(*)`. Camera-intel person's Cameras table is loaded. AI engine person has a basic chat function returning a response. Person 5's chat UI shell renders with mock data.

**End of Week 3:** AI engine integrates Aman's analytics APIs. Voice input (Web Speech API) works in the browser. Person 5 connects the real chat API.

**End of Week 4:** AI engine integrates the camera-intel person's APIs. Chrono-Criminal Graph and Investigator's Wall components exist and render. PDF export works.

---

## WEEK 5 — Integration Sprint

### Step 1: Understand the Architecture
```
Frontend (Catalyst Slate)
     ↓
API Gateway Function (you build this)
     ↓
AI Engine Function (Gemini-based chat)
     ↓ if data needed
Analytics Functions (Aman) ←→ Camera Functions (camera-intel person)
     ↓
Catalyst Data Store
```

### Step 2: Build the Gateway Function
Paste this into Claude:
```
Write a Node.js Catalyst Serverless Function as an API gateway for DRISHTI.

Routes:
POST /api/chat → calls the AI Engine function, which itself calls Gemini and, 
  if it needs real data, calls the analytics or camera functions internally
GET /api/analytics/* → passes through to Aman's analytics functions
GET /api/cameras/* and POST /api/trail and POST /api/anpr/* → passes through to 
  the camera-intel person's functions
GET /api/firs → queries Catalyst Data Store directly using the SDK

All function URLs come from environment variables set in this Function's config, 
not hardcoded. Use zcatalyst-sdk-node. Include CORS headers and error handling 
that never crashes — always return a JSON error object on failure.
```

### Step 3: Run the Full Smoke Test
Walk through this exact sequence yourself before anyone else does:
1. Login as `inspector@drishti.ksp`
2. Type a chat query about crime hotspots → confirm a real chart appears
3. Ask a follow-up question → confirm it remembers context
4. Ask to find cameras near a location → confirm a real map with pins appears
5. Trigger the suspect geo-trail → confirm an animated path appears
6. Open the Network Graph page → confirm nodes and edges render
7. Download a PDF report → confirm it opens and looks correct

If any step fails, that's the priority bug — fix it before moving to deployment.

---

## WEEK 6 — Deployment

### Step 1: Set Environment Variables for Functions
Catalyst Dashboard → **Serverless Functions → [your function] → Environment Variables**. Add `GEMINI_API_KEY` and `GEMINI_MODEL` here so the deployed version can reach Gemini. There are no database environment variables to add — Functions get Data Store access automatically just by running inside Catalyst.

### Step 2: Deploy Functions
```bash
catalyst deploy --only functions
```

### Step 3: Deploy the Frontend via Slate
Confirm with Person 5 that her Next.js app is ready, then:
```bash
catalyst deploy --only slate
```
Slate supports automated deployments from GitHub directly too — you can optionally connect the repo in the console under **Slate** settings so every push to `main` auto-deploys.

### Step 4: Verify the Live Deployment
Open the live URL Catalyst gives you. Repeat the full smoke test from Week 5, but on the deployed version, not localhost. Fix anything that breaks only in production (usually a missing environment variable).

---

## WEEK 7 — Demo Recording and Submission

### Step 1: Record the Demo
Use **OBS Studio** (free: https://obsproject.com). Follow this 5-minute flow on the **live deployed URL**:
1. Login as Inspector, show the stat counters on the landing page
2. Ask a chat query in English about crime hotspots — inline heatmap appears
3. Ask a follow-up — context maintained
4. Find cameras near a crime location — map with pins appears
5. Trigger the suspect geo-trail — animated path, ANPR alert fires
6. Open the Chrono-Criminal Graph — drag the time slider, watch the network form
7. Open the Investigator's Digital Wall for one case
8. Download the PDF report

### Step 2: Upload the Video
Google Drive → upload → right-click → **Share → Anyone with the link can view** → copy the link.

### Step 3: Finalize Everything for Submission
1. **GitHub repo** — confirm public, README complete, open in incognito to double check
2. **Deployed app URL** — open in incognito, log in, confirm it works
3. **Demo video link** — open in incognito, confirm it plays
4. **Submission deck PDF** — confirm Person 5's Canva export is the final version

### Step 4: Download the Official Submission Template
**https://docs.google.com/presentation/d/1XWKQ3Hi3yKeDAQrHzQA4_vUF9pvC43Hjh7x7pr4jBpA/export/pptx**

### Step 5: Submit on Hack2Skill
Fill in: Challenge = **Intelligent Conversational AI for KSP Crime Database**, Prototype Brief (≤1024 characters), GitHub URL, deployed solution URL, demo video URL, prototype deck PDF upload. Click Submit. Screenshot the confirmation.

**Deadline: 26 July 2026, 11:59 PM IST. Submit by 25 July at the latest — do not wait until the last hour.**

---

## QUICK REFERENCE — Every Link You Need

| Resource | URL |
|---|---|
| Catalyst Console | https://catalyst.zoho.com |
| Catalyst hackathon credits | https://catalyst.zoho.com/promotions.html?cn=KSPH26 |
| Catalyst CLI command reference | https://docs.catalyst.zoho.com/en/cli/v1/cli-command-reference/ |
| Catalyst CLI login | https://docs.catalyst.zoho.com/en/cli/v1/login/login-from-cli/ |
| Data Store columns/types | https://docs.catalyst.zoho.com/en/cloud-scale/help/data-store/columns/ |
| Data Store import (`ds:import`) | https://docs.catalyst.zoho.com/en/cli/v1/data-store-import-and-export/import-operation/ |
| Data Store row limits | confirmed: 5,000/table, 25,000/project in development |
| Catalyst Authentication | https://docs.catalyst.zoho.com/en/cloud-scale/help/authentication/introduction/ |
| Catalyst Slate | https://docs.catalyst.zoho.com/en/slate/help/introduction |
| Catalyst Stratus | https://docs.catalyst.zoho.com/en/cloud-scale/help/stratus/objects/introduction/ |
| Gemini API docs | https://ai.google.dev/gemini-api/docs |
| Gemini Node.js SDK | https://www.npmjs.com/package/@google/generative-ai |
| OBS Studio | https://obsproject.com |
| Hackathon submission template | https://docs.google.com/presentation/d/1XWKQ3Hi3yKeDAQrHzQA4_vUF9pvC43Hjh7x7pr4jBpA/export/pptx |
| Hack2Skill portal | https://hack2skill.com |

---

*DRISHTI — ದೃಷ್ಟಿ | Person 1 (Vritika) Complete Captain Guide | KSP × Hack2Skill 2026*
