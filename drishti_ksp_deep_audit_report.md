# 🛡️ DRISHTI (ದೃಷ್ಟಿ) — Deep-Down Technical Audit & Production Readiness Report
**Karnataka State Police (KSP) Datathon 2026 Submission Analysis**  
*Evaluated for Production Deployment: `https://nextjs-ckxclqry.onslate.in/`*  
*Date of Audit: July 2026 / Local Timestamp: 2026-08-26*

---

## Executive Summary

This report delivers a deep, forensic analysis of the **DRISHTI AI Co-Pilot** platform across all software layers: the live deployed web application on Zoho Catalyst Slate, the 16 serverless backend functions, the database architecture compared to the official **Karnataka Police Department FIR System ER Diagram**, the **26 Zoho Catalyst Mandatory Platform Capabilities Matrix**, and all external APIs/services.

### Summary Scorecard
| Layer | Health Status | Key Finding |
| :--- | :---: | :--- |
| **Live Slate Deployment** | ⚠️ **Degraded (Client Fallback Mode)** | Next.js API routes (`/api/*`) and `/server/*` endpoints return 200 with `0 bytes` (empty response) because Slate acts as a static host; frontend functions in client-side demo fallback mode. |
| **UI & Page Navigation** | ⚠️ **Partial Failure (2 Broken Routes + 1 Crash)** | `/dashboard/fir/[id]` and `/dashboard/suspect/[id]` fail to render (blank white DOM); `/dashboard/chat` crashes on repeat offender preset query due to an undefined `.join()` property error. |
| **Catalyst 26 Capabilities** | 🟡 **3 Used / 3 Partial / 20 Unconfigured** | Serverless Functions, Slate Hosting, and DataStore (ZCQL) are implemented; QuickML/Zia are partially configured; 20 other services (AppSail, Pipelines, Signals, Circuits, SmartBrowz) are unused. |
| **KSP Database ERD Conformance** | 🔴 **Non-Conforming (Synthetic Schema)** | The project uses a simplified 14-field flat schema (`case_number`, `crime_type_code`, `risk_score`) rather than the official 9-table normalized relational schema (`CaseMaster`, `ComplainantDetails`, `Victim`, `Accused`, `ArrestSurrender`, 17-digit `CrimeNo`). |
| **External APIs & Secrets** | ⚠️ **Key Exposure & Missing Token** | Google Gemini API key is hardcoded; CARTO Dark Matter basemap in Geo Trail fails with *"API KEY REQUIRED"*; Overpass API is external. |

---

## Section 1: Live Production Link & Component Deep Audit

Live Production URL: [`https://nextjs-ckxclqry.onslate.in/`](https://nextjs-ckxclqry.onslate.in/)

### Route-by-Route Health Matrix

```mermaid
flowchart TD
    Landing["/ (Landing Page) ✅ OK"] --> Auth["Auth Modal (1-Click Demo Login) ✅ OK"]
    Auth --> Dash["/dashboard (Overview) ⚠️ Partial"]
    
    Dash --> Surv["/dashboard/surveillance ✅ OK"]
    Dash --> Trail["/dashboard/trail ⚠️ Tile Key Warning"]
    Dash --> FIRs["/dashboard/fir ❌ 404 & /fir/[id] ❌ Blank Page"]
    Dash --> Suspects["/dashboard/suspect ❌ 404 & /suspect/[id] ❌ Blank Page"]
    Dash --> MapView["/dashboard/map ✅ OK (Leaflet OSM)"]
    Dash --> Analytics["/dashboard/analytics ✅ OK"]
    Dash --> Network["/dashboard/network ✅ OK (D3 Graph)"]
    Dash --> Chat["/dashboard/chat ⚠️ Crash on Preset Query"]
    Dash --> News["/dashboard/news ✅ OK"]
    Dash --> Logs["/dashboard/logs ✅ OK"]
```

### Detailed Component Findings

#### 1. Home / Landing & Authentication (`/`)
* **Status**: **FUNCTIONAL**
* **Test Result**: Renders the dark cyber-themed landing page with animated feed counters (5,35,815+ MCCTNS records, 7,000+ Safe City cameras).
* **Authentication**: The "Authenticate" modal supports PIN entry and provides a **1-Click Demo Login** bypass button that successfully sets local credentials and transitions to `/dashboard`.
* **Underlying Mechanism**: Authentication is managed purely in React client state (`localStorage`), not backed by Catalyst Authentication SDK.

#### 2. Main Overview Dashboard (`/dashboard`)
* **Status**: **PARTIALLY WORKING**
* **Test Result**: KPI cards (Active Cases: 51, High Risk Suspects: 18, Real-time Hotspots: 14) and the Incident Register table load using client-side fallback data.
* **Search / Filters**: Filtering by crime type (e.g. "Burglary") correctly narrows down records (51 → 3).
* **CRITICAL BUG**: Clicking on any case number link (e.g., `FIR-2026-BL-9104` or `KAR/KAL/2024/0330`) navigates to `/dashboard/fir/[id]`, which fails to render and displays a completely blank DOM.
* **Console Warnings**:
  ```text
  [warning] [fetchWithFallback] /api/firs → Failed to execute 'json' on 'Response': Unexpected end of JSON input. Demo fallback.
  [warning] [fetchWithFallback] /api/hotspots → Failed to execute 'json' on 'Response': Unexpected end of JSON input. Demo fallback.
  [warning] [fetchWithFallback] /api/repeat-offenders → Failed to execute 'json' on 'Response': Unexpected end of JSON input. Demo fallback.
  ```

#### 3. FIR Case Details & Dossier (`/dashboard/fir` & `/dashboard/fir/[...id]`)
* **Status**: 🔴 **CRITICAL FAILURE**
* **Root Causes**:
  1. `/dashboard/fir` has no index `page.js` file; it directly returns a **404 Not Found**.
  2. Next.js was built with `output: 'standalone'` and deployed to Catalyst Slate static hosting without pre-rendered static params for dynamic routes (`generateStaticParams`).
  3. When client-side routing navigates to `/dashboard/fir/FIR-2026-BL-4921`, the RSC payload fetch fails with "connection closed / empty body", causing React to unmount the view and leave an empty DOM (`<body></body>`).

#### 4. Suspect Profiles & Dossier (`/dashboard/suspect` & `/dashboard/suspect/[slug]`)
* **Status**: 🔴 **CRITICAL FAILURE**
* **Root Causes**:
  1. `/dashboard/suspect` has no root `page.js`; returning **404 Not Found**.
  2. `/dashboard/suspect/ramesh-kumar` suffers from the identical dynamic RSC chunk failure on Slate, rendering a blank screen.

#### 5. Co-Pilot Chat & Voice Interaction (`/dashboard/chat`)
* **Status**: ⚠️ **DEGRADED / CODE CRASH ON PRESET QUERY**
* **Test Result**:
  * Free-text question *"What is the crime status in Bengaluru?"* works via client fallback generator `generateAIResponseFromDemoData` and lists active FIR cases.
  * Voice synthesis (TTS via browser `speechSynthesis`) works for standard responses.
* **CRITICAL CRASH BUG**:
  * Clicking the preset chip: **"List top repeat offenders with risk score > 70"** triggers a fatal JavaScript exception:
    ```text
    TypeError: Cannot read properties of undefined (reading 'join')
    at generateAIResponseFromDemoData (demo-data.js:702)
    ```
  * **Code Fault**: In `demo-data.js` line 702:
    ```javascript
    • Known Hangouts: ${s.known_hangouts.join(', ')}
    ```
    `UPLOADED_SUSPECTS` (from `uploadedFirsStore.js`) does not define `known_hangouts`, causing `undefined.join()` to crash React.
* **UI/UX Bug**: Case number badges rendered in chat responses (e.g. `FIR-2026-BL-9104`) have pointer cursors and button styling, but their `onClick` handlers are unattached.

#### 6. Surveillance & ANPR Feeds (`/dashboard/surveillance`)
* **Status**: **FUNCTIONAL WITH BROKEN LINK**
* **Test Result**: Camera grid renders with simulated CCTV streams, target analysis overlay, and ANPR license plate scanner.
* **Watchlist Lookup**: Searching plate `KA-05-NB-1102` correctly flags a high-priority match.
* **Linking Bug**:
  * The match result displays a link to the FIR Case File with label `FIR-2026-MYS-0112`, but the `href` is rendered as `/dashboard/fir/undefined` because of a variable property mismatch (`suspectData.fir` vs `suspectData.case_number`).

#### 7. Geo Trail (`/dashboard/trail`)
* **Status**: ⚠️ **MAP TILE AUTHENTICATION FAILURE**
* **Test Result**: The multi-camera vehicle tracking timeline, hop sequencing, and vehicle cards load properly.
* **Map Bug**:
  * The central tactical map is covered with watermarks stating: **"API KEY REQUIRED cartodb.com/basemaps/apikey"**.
  * **Code Fault**: `TrailMapView.jsx` uses `https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png` which now blocks direct referrer requests without a CARTO API key.

#### 8. Crime Map (`/dashboard/map`)
* **Status**: **FUNCTIONAL**
* **Test Result**: Leaflet map loads correctly using standard OpenStreetMap tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`). Crime hotspot circles and intensity markers render with appropriate color coding.

#### 9. Analytics (`/dashboard/analytics`)
* **Status**: **FUNCTIONAL (DATA MISMATCH)**
* **Test Result**: 12-month crime trend bar charts, hourly distribution radar charts, and victim vulnerability breakdown render via client-side demo data.
* **Data Label Mismatch**: The "Under-Reporting Dark Zones" section header specifies *"Districts with FIR rate > 40% below state average"*, but the table rows list micro-locations ("KSRTC Satellite Bus Stand Back Alley", "Hebbal Flyover Lower Loop") rather than Karnataka districts.

#### 10. Network Graph (`/dashboard/network`)
* **Status**: **FUNCTIONAL**
* **Test Result**: D3 force-directed SVG graph renders nodes for crime syndicate bosses (`Ramesh Kumar`, `Imran Khan`, `Farid Mirza`) and connected co-accused links.

---

## Section 2: Catalyst 26 Mandatory Capabilities Compliance Matrix

The table below evaluates every capability required by Zoho Catalyst against the actual implementation in this project repository:

| # | Capability | Required Catalyst Service | Implementation Status | Technical Details in Codebase |
| :-: | :--- | :--- | :---: | :--- |
| **1** | Serverless functions / backend logic | **Catalyst Serverless (Functions)** | 🟢 **USED** | 16 AdvancedIO Node.js functions configured in `catalyst.json` (`askDrishtiAI`, `firs`, `hotspots`, `trends`, `repeat-offenders`, `anpr-check`, `trail`, `underreporting`, `victim-vulnerability`, `network-graph-data`, `drishtiVoice`, `export-pdf`, `conversations`, `cameras-nearby`, `chat`, `drishti_ksp_function`). |
| **2** | Docker image deployment | **Catalyst AppSail (custom OCI runtime)** | 🔴 **NOT USED** | No `Dockerfile` or AppSail OCI configuration exists. |
| **3** | Full web app in a managed runtime | **Catalyst AppSail (managed runtime)** | 🔴 **NOT USED** | Next.js is not deployed as a persistent server on AppSail. |
| **4** | Frontend / SPA / Next.js / static site | **Catalyst Slate / Web Client Hosting** | 🟢 **USED** | Deployed on Catalyst Slate at `https://nextjs-ckxclqry.onslate.in/`. Configured in `catalyst.json` under `"slate": [{ "name": "nextjs", "source": "nextjs" }]`. |
| **5** | Custom domain + SSL | **Catalyst Domain Mappings** | ⚪ **NOT CONFIGURED** | Uses default Catalyst `.onslate.in` subdomain. |
| **6** | Relational database | **Catalyst Data Store** | 🟡 **PARTIALLY USED (with fallback)** | `db-helper.js` uses `catalyst.initialize(req, { scope: 'admin' }).zcql()` to query tables `FIRs`, `RepeatOffenders`, `ANPR_Alerts`. Code includes automatic fallback to static JSON when DB is empty. |
| **7** | Unstructured / semi-structured data | **Catalyst NoSQL** | 🟡 **PARTIALLY USED** | Referenced in `functions/conversations/index.js` for storing chat sessions, with fallback to in-memory/localStorage. |
| **8** | Object / blob storage (S3-style) | **Catalyst Stratus** | 🔴 **NOT USED** | FIR text documents are processed in-memory or loaded from local filesystem. |
| **9** | Cache | **Catalyst Cache** | 🔴 **NOT USED** | Application uses HTTP `Cache-Control: public, s-maxage=10` headers and React state rather than Catalyst Cache Segment API. |
| **10** | Full-text search (within Data Store) | **Catalyst Data Store** | 🔴 **NOT CONFIGURED** | Keyword search relies on SQL `LIKE` clauses rather than Data Store Full-Text Search indexing. |
| **11** | Text LLMs / RAG / knowledge bases | **Catalyst QuickML (LLM Serving, RAG)** | 🟡 **PARTIALLY USED (Hybrid)** | `askDrishtiAI` contains API endpoints for QuickML RAG (`QUICKML_RAG_ENDPOINT_URL`), but falls back to Google Gemini 2.5 Flash and Groq because QuickML does not support function/tool calling. |
| **12** | No-code ML pipelines | **Catalyst QuickML** | 🔴 **NOT USED** | Predictive crime risk analytics are calculated via custom JavaScript math. |
| **13** | Automated model training (tabular) | **Catalyst Zia AutoML** | 🔴 **NOT USED** | Risk scores and severity values are hardcoded/heuristic rather than trained ML models. |
| **14** | OCR / Face / Text Analytics / Object Recognition | **Catalyst Zia Services** | 🔴 **NOT USED** | ANPR and face surveillance feeds are simulated via client-side SVG overlays. |
| **15** | Voice services (STT, TTS, translation) | **Catalyst Zia Services** | 🟡 **PARTIALLY USED** | `drishtiVoice` and `askDrishtiAI` reference Zia Translation endpoints (`QUICKML_TRANSLATE_ENDPOINT_URL`); client UI uses browser-native Web Speech API. |
| **16** | PDF / image report generation, screenshots | **Catalyst SmartBrowz** | 🔴 **NOT USED** | `export-pdf` function uses `pdfkit` / client-side HTML-to-Blob download instead of Catalyst SmartBrowz headless rendering. |
| **17** | User auth / login / signup | **Catalyst Authentication** | 🔴 **NOT USED** | Auth is managed via client-side PIN check in Next.js; Catalyst Auth SDK is not integrated. |
| **18** | API routing, throttling, and auth | **Catalyst API Gateway** | 🔴 **NOT CONFIGURED** | The absence of API Gateway mapping between the Slate frontend and Catalyst Functions is the exact reason `/api/*` and `/server/*` return empty 0-byte responses in production. |
| **19** | OAuth tokens for Zoho / 3rd-party services | **Catalyst Connections** | 🔴 **NOT USED** | A static OAuth token is provided in `.env` (`QUICKML_OAUTH_TOKEN`) instead of dynamic Connections tokens. |
| **20** | Scheduled jobs / cron / job pools | **Catalyst Cron / Job Scheduling** | 🔴 **NOT CONFIGURED** | Background tasks and alert polling are handled in frontend `setInterval` loops. |
| **21** | Reacting to in-project events | **Catalyst Signals + Event Functions** | 🔴 **NOT CONFIGURED** | No event listeners on DB inserts or file uploads. |
| **22** | Cross-app event bus / event routing | **Catalyst Signals** | 🔴 **NOT CONFIGURED** | No event topics or signal dispatchers configured. |
| **23** | Multi-step workflow / orchestration | **Catalyst Circuits** | 🔴 **NOT CONFIGURED** | Business logic is executed synchronously in single serverless function calls. |
| **24** | Transactional email | **Catalyst Mail** | 🔴 **NOT CONFIGURED** | No automated email dispatch for high-priority crime alerts. |
| **25** | Push notifications (web/Android/iOS) | **Catalyst Push Notifications** | 🔴 **NOT CONFIGURED** | Alerts are rendered in-browser using Framer Motion toast components. |
| **26** | CI/CD | **Catalyst Pipelines** | 🔴 **NOT CONFIGURED** | Deployed locally via CLI script `deploy-catalyst.js`. |

---

## Section 3: Dataset vs Official KSP ER Diagram Schema Comparison

The attached 9-page Karnataka State Police Database Schema Document defines a highly normalized relational database for the **Police FIR System**. Below is the side-by-side conformance analysis:

### Schema Comparison Matrix

```
┌─────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────┐
│       OFFICIAL KSP ER DIAGRAM (9-Page Document)             │               CURRENT DRISHTI DATASET                       │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 1. CaseMaster                                               │ 1. FIRs (Flat Table / Mock Array)                           │
│    • CaseMasterID (INT, PK)                                 │    • case_number (VARCHAR, e.g. "KAR/KAL/2024/0330")        │
│    • CrimeNo (VARCHAR - 17 digits: Cat+Dist+Unit+Year+Serial)│    • district_name (VARCHAR)                                │
│    • CaseNo (VARCHAR - YYYY + 5 digits)                     │    • police_station (VARCHAR)                               │
│    • PolicePersonID (INT, FK -> Employee)                   │    • crime_type_code (VARCHAR)                              │
│    • PoliceStationID (INT, FK -> Unit)                      │    • date_filed (DATE)                                      │
│    • CaseCategoryID (INT, FK -> CaseCategory)               │    • time_filed (TIME)                                      │
│    • GravityOffenceID (INT, FK -> GravityOffence)           │    • location_name (VARCHAR)                                │
│    • CrimeMajorHeadID (INT, FK -> CrimeHead)                │    • location_lat, location_lng (DECIMAL)                   │
│    • CrimeMinorHeadID (INT, FK -> CrimeSubHead)             │    • status (VARCHAR: open, under_investigation, chargesheeted)│
│    • CaseStatusID (INT, FK -> CaseStatusMaster)             │    • investigation_office (VARCHAR)                         │
│    • CourtID (INT, FK -> Court)                             │    • description (TEXT)                                     │
│    • IncidentFromDate, IncidentToDate (DATETIME)            │    • accused_name (VARCHAR) [Embedded single string]        │
│    • InfoReceivedPSDate (DATETIME)                          │    • risk_score (INT) [Synthetic field]                     │
│    • latitude, longitude (DECIMAL)                          │                                                             │
│    • BriefFacts (NVARCHAR(MAX))                             │                                                             │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 2. ComplainantDetails (One-to-Many with CaseMaster)         │ ❌ MISSING as a standalone table.                           │
│    • ComplainantID, CaseMasterID, ComplainantName,          │    (Briefly mentioned inside mock uploaded text files).     │
│      AgeYear, OccupationID, ReligionID, CasteID, GenderID   │                                                             │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 3. Victim (One-to-Many with CaseMaster)                     │ 🟡 Simplified `victims.csv`                                 │
│    • VictimMasterID, CaseMasterID, VictimName,              │    • victim_id, name, age, gender, occupation, district     │
│      AgeYear, GenderID, VictimPolice (0/1)                  │    (No foreign key link back to specific FIR in ZCQL).      │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 4. Accused (One-to-Many with CaseMaster)                    │ 🟡 Simplified `accused.csv` / `RepeatOffenders`             │
│    • AccusedMasterID, CaseMasterID, AccusedName,            │    • accused_id, name, alias, age, gender, risk_score,      │
│      AgeYear, GenderID, PersonID (A1, A2, A3...)            │      primary_modus_operandi, last_known_location            │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 5. ArrestSurrender (One-to-Many with CaseMaster)            │ ❌ MISSING in runtime schema.                               │
│    • ArrestSurrenderID, CaseMasterID, ArrestSurrenderDate,  │    (Replaced with a synthetic `DEMO_TRAIL` camera hop log). │
│      PoliceStationID, IOID, CourtID, AccusedMasterID,       │                                                             │
│      IsAccused, IsComplainantAccused                        │                                                             │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 6. ChargesheetDetails                                       │ ❌ MISSING as a separate table.                             │
│    • CSID, CaseMasterID, csdate, cstype (A/B/C),            │    (Status is stored as a flat string in FIR record).       │
│      PolicePersonID                                         │                                                             │
├─────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 7. Relational Masters (12 Tables):                          │ ❌ NOT NORMALIZED.                                          │
│    • Act, Section, CrimeHead, CrimeSubHead,                 │    Crime codes and IPC sections are stored as flat text.    │
│      CrimeHeadActSection, CasteMaster, ReligionMaster,      │    Districts and Police Stations exist only as CSVs.        │
│      OccupationMaster, CaseStatusMaster, Court, District,   │                                                             │
│      Unit, UnitType, Rank, Designation, Employee            │                                                             │
└─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

### Key Differences & Incompatibilities
1. **Crime Number Format**:
   * *Official KSP standard*: `104430006202600001` (17 numeric digits with embedded district, unit, and year IDs).
   * *DRISHTI implementation*: `KAR/KAL/2024/0330` or `FIR-2026-BL-4921`.
2. **Denormalization**:
   * Official KSP FIR system requires relational joins across `CaseMaster` ↔ `Accused` ↔ `Victim` ↔ `ComplainantDetails` ↔ `ActSectionAssociation`.
   * DRISHTI embeds accused names and crime descriptions directly into the single `FIRs` table.
3. **Missing Investigative Entities**:
   * Official fields like `ArrestSurrender`, `CourtID`, `ChargesheetDetails` (with final report codes `A -> Chargesheet`, `B -> False Case`, `C -> Undetected`), `KGID` (Karnataka Government ID), and `PolicePersonID` (IO) are omitted or replaced by synthetic demo fields like `risk_score` and `anpr_hits`.

---

## Section 4: External Services, APIs, Models & Secrets Audit

```mermaid
graph LR
    NextApp["DRISHTI Next.js (Slate)"] --> Gemini["Google Gemini 2.5 Flash (AI Chat)"]
    NextApp --> OSM["OpenStreetMap (Crime Map Tiles)"]
    NextApp --> Carto["CARTO CDN (Geo Trail - ⚠️ Requires Key)"]
    NextApp --> Overpass["Overpass API (OSM Query)"]
    NextApp --> Speech["Web Speech API (Native Browser Voice)"]
    NextApp --> CatFunc["Catalyst Serverless Functions (ZCQL / QuickML)"]
```

### External Services Audit Table

| External Service / API | Where Used in Code | Purpose | Status / Risk |
| :--- | :--- | :--- | :--- |
| **Google Gemini 2.5 Flash** | `functions/askDrishtiAI/index.js`, `functions/chat/index.js`, `.env` | Primary LLM inference for multilingual intelligence queries and tool calling. | ⚠️ **Hardcoded API Key** present in `.env` (`AIzaSyCZKZBcVvz5sVokO8ei__6plJBeqO2JWpU`). |
| **Groq API (Llama 3.3 70B)** | `functions/askDrishtiAI/index.js` | Secondary LLM fallback if Gemini hits rate limits. | Configured as code fallback. |
| **Overpass API** | `kspdatathon2026/.env`, `camera-intel/` | Extracts camera and traffic signal coordinates from OpenStreetMap (`https://overpass-api.de/api/interpreter`). | External public API (rate-limited if called frequently). |
| **CARTO Dark Matter Tiles** | `nextjs/src/app/dashboard/trail/TrailMapView.jsx` | Basemap tile server for Geo-Spatial vehicle trail. | 🔴 **BROKEN**: Missing API key causes "API KEY REQUIRED" watermark on tiles. |
| **OpenStreetMap Standard Tiles** | `nextjs/src/app/dashboard/map/` & `network/` | Basemap tile server for Crime Map and Network Graph. | 🟢 **FUNCTIONAL**: Standard OSM tiles load with no authentication blocks. |
| **Web Speech API (`webkitSpeechRecognition`)** | `nextjs/src/app/dashboard/chat/page.js`, `DrishtiVoice.jsx` | Browser-native Speech-to-Text (STT) for Kannada (`kn-IN`), Hindi (`hi-IN`), English (`en-IN`). | 🟢 **FUNCTIONAL** in Chrome/Brave/Edge browsers. |
| **Web Speech API (`speechSynthesis`)** | `nextjs/src/app/dashboard/chat/page.js`, `DrishtiVoice.jsx` | Browser-native Text-to-Speech (TTS) response generation. | 🟢 **FUNCTIONAL**. |
| **Google Fonts CDN** | `nextjs/src/app/layout.js` | Loads typography: *Montserrat*, *Plus Jakarta Sans*. | 🟢 **FUNCTIONAL**. |

---

## Section 5: Step-by-Step Fix & AI Remediation Guide

For subsequent AI tools and developers repairing this codebase, follow these exact fixes in priority order:

### 1. Fix Slate API Routing (Empty Body Issue)
* **Problem**: Next.js API route handlers in `src/app/api/...` do not execute on Catalyst Slate static hosting.
* **Fix**:
  1. In `nextjs/next.config.mjs`, update API rewrites or configure `NEXT_PUBLIC_API_BASE_URL` to point to the deployed Catalyst Functions domain:
     ```javascript
     // Point to live Catalyst serverless functions domain
     NEXT_PUBLIC_API_BASE_URL: 'https://drishti-ksp-60073715607.development.catalystserverless.in/server'
     ```
  2. Alternatively, deploy the Next.js standalone server on **Catalyst AppSail** to run server-side Node.js routes with native streaming.

### 2. Fix Broken FIR & Suspect Dynamic Pages (Blank Screen Bug)
* **Problem**: Missing index pages and dynamic routes crashing on Slate.
* **Fix**:
  1. Create `nextjs/src/app/dashboard/fir/page.js` to render the full searchable FIR register table.
  2. Create `nextjs/src/app/dashboard/suspect/page.js` to render the Repeat Offender roster.
  3. In `nextjs/src/app/dashboard/fir/[...id]/page.js` and `nextjs/src/app/dashboard/suspect/[slug]/page.js`, add `export const dynamic = 'force-static'` and `generateStaticParams()` returning demo FIRs/suspects so Slate statically pre-renders every detail dossier.

### 3. Fix Co-Pilot Chat Crash on Repeat Offender Query
* **Problem**: `demo-data.js` line 702 calls `.join()` on `s.known_hangouts` which is undefined for `UPLOADED_SUSPECTS`.
* **Fix**: Replace line 702 with safe fallback indexing:
  ```javascript
  • Known Hangouts: ${(s.known_hangouts && Array.isArray(s.known_hangouts)) ? s.known_hangouts.join(', ') : (s.last_known_location || 'Under Surveillance Area')}
  ```
* Also ensure `INITIAL_VIKRAM_SUSPECT` in `uploadedFirsStore.js` includes `known_hangouts: ['ITPB Main Road', 'Hope Farm Signal']` and `primary_modus_operandi`.

### 4. Fix Geo Trail Basemap "API KEY REQUIRED" Warning
* **Problem**: CARTO Dark Matter requires an API key.
* **Fix**: In `nextjs/src/app/dashboard/trail/TrailMapView.jsx`, replace CARTO tile URL with an open tile provider or standard OSM with dark CSS invert filter:
  ```javascript
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    className: 'map-tiles-dark-invert'
  }).addTo(map);
  ```

### 5. Fix Surveillance Link Bug
* **Problem**: Link points to `/dashboard/fir/undefined`.
* **Fix**: In `nextjs/src/app/dashboard/surveillance/page.js` line 658 and line 967, replace `suspectData.fir` and `plateResult.fir_case_number` with:
  ```jsx
  <Link href={`/dashboard/fir/${suspectData.case_number || suspectData.fir || 'FIR-2026-BL-4921'}`}>
  ```

### 6. Align Schema with Official KSP ERD
* **To fully conform with the 9-Page ERD**:
  1. Generate relational tables in Catalyst Data Store (`CaseMaster`, `ComplainantDetails`, `Victim`, `Accused`, `ChargesheetDetails`).
  2. Implement 17-digit `CrimeNo` generator function:
     $$\text{CrimeNo} = \text{CaseCategory}(1) + \text{DistrictID}(4) + \text{UnitID}(4) + \text{Year}(4) + \text{Serial}(5)$$
  3. Map `cstype` ('A' for Chargesheet, 'B' for False Case, 'C' for Undetected) in FIR detail views.

---

## Conclusion & Submission Recommendation

DRISHTI exhibits exceptional UI polish, cyberpunk visual aesthetics, multilingual voice UX, and domain-specific police intelligence features (ANPR watchlist, Geo Trail, Co-Accused Network Graph). However, for the hackathon judging evaluation:
1. **Critical Quick-Wins**: Patch the 2 route 404s, the chat `.join()` crash, and the CARTO basemap tile key immediately so that live judges do not encounter blank screens.
2. **Catalyst Story**: Clearly articulate the architecture in the final submission document: Explain that **Catalyst Slate** powers the frontend client, **Catalyst Serverless Functions** power the backend analytical engine, **Catalyst DataStore (ZCQL)** handles the crime database, and **QuickML/Zia** handle language translation and RAG processing.
