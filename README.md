# DRISHTI (ದೃಷ್ಟಿ) — AI Crime Intelligence Co-Pilot
> **Intelligence that sees what others miss.**

Developed for the **Karnataka State Police (KSP) × Hack2Skill Datathon 2026** by Team VRITIKA.

---

## 📌 Problem Statement
The Karnataka State Police (KSP) operates across various modern digital platforms, but critical investigative data remains trapped in functional silos (e.g., district crime databases, census demographics, and localized surveillance systems). Crucially, existing street-level camera feeds operate independently of the central crime databases. Investigators lack a unified, intelligent system that can correlate camera feed logs, spatial-temporal criminal history, and population demographics in real-time, slowing down case resolution and crime prevention.

## 💡 Solution Overview
**DRISHTI (ದೃಷ್ಟಿ)** is an AI-powered Crime Intelligence Co-Pilot designed to break these data silos. By combining a natural language interface with real-time relational analytics and simulated camera intelligence, DRISHTI empowers KSP investigators to query databases instantly in English and Kannada, visualize crime hotspots, map chronological relationship graphs, and track suspects' geo-trails across surveillance networks in a unified, modern web application.

---

## 🚀 10 Key Features
1. **Interactive Co-Pilot Chat**: Direct natural language query translation and database execution in English and Kannada using the Gemini API.
2. **Dynamic Crime Hotspot Mapping**: Spatial-temporal mapping of high-crime density locations across Karnataka with customizable date and category filters.
3. **Chrono-Criminal Relationship Graph**: An interactive node-based timeline visualization mapping suspect networks, syndicates, and chronological case associations.
4. **Live Surveillance Feed Simulation**: Real-time camera feed dashboards with mock video processing simulating vehicle and license plate recognition.
5. **Interactive Geo-Trail Reconstruction**: Visual mapping and path-finding of suspect movements across multiple camera locations.
6. **Predictive Crime Analytics**: Automated forecasting of regional crime trends using regression analysis on historical KSP datasets.
7. **Unified Demographics Dashboard**: Cross-referencing crime rates with population density, literacy rates, and police station jurisdictions.
8. **Officer Case Manager**: Dynamic workload distribution board monitoring open cases, solve rates, and squad assignments.
9. **Catalyst Zia Multi-lingual Support**: Seamless localization translating vernacular search inputs into structured queries.
10. **Secure Audit Logging**: Blockchain-inspired tamper-proof log trail tracking investigator queries and system access for maximum accountability.

---

## ⚡ What Makes DRISHTI Unique

| Feature / Capability | Typical AI Chatbots | DRISHTI (ದೃಷ್ಟಿ) AI Co-Pilot |
| :--- | :--- | :--- |
| **Data Scope** | Static training data / Web search only | Real-time queries on live KSP databases |
| **Visual Interfaces** | Text-only output | Interactive maps, Recharts graphs, and relationship trees |
| **Surveillance Integration** | None | Live camera stream simulation and suspect geo-tracking |
| **Local Language Execution** | Generic machine translation | Native Kannada query understanding to SQL execution |
| **Predictive Analytics** | Basic text predictions | Geographic-demographic hot spot forecasting models |

---

## 🛠️ Technology Stack
DRISHTI is built natively on the **Zoho Catalyst** serverless ecosystem:
- **AI Core**: Google Gemini API (`gemini-2.5-flash`) for translation, SQL query generation, and intelligence.
- **Database**: [Zoho Catalyst Data Store](https://catalyst.zoho.com) (Relational MySQL engine) holding crime records, demographics, and camera locations.
- **Serverless Compute**: Zoho Catalyst Serverless Functions (Node.js/AppSail) for API endpoints and data processing.
- **Security & IAM**: Zoho Catalyst Authentication for secure officer login and session management.
- **Frontend / Framework**: Next.js (React) styled with optimized TailwindCSS.
- **Deployment**: Zoho Catalyst Slate (automated CI/CD hosting).

---

## 📊 Real Datasets Used
DRISHTI leverages authenticated, real-world data sources:
* **Karnataka District Crime Statistics (2022–2024)**: OpenCity [2024](https://data.opencity.in/dataset/karnataka-crime-data-2024) \| [2023](https://data.opencity.in/dataset/karnataka-crime-data-2023) \| [2022](https://data.opencity.in/dataset/karnataka-crime-data-2022)
* **Bengaluru City Crime Report**: OpenCity Bengaluru Police [Crime Data](https://data.opencity.in/dataset/bengaluru-crime-data-2023)
* **Bengaluru Traffic Signal Junction Locations**: OpenCity Bengaluru Traffic [Signal Junctions](https://data.opencity.in/dataset/bengaluru-city-traffic-signal-data)
* **Karnataka District Boundaries**: DataMeet Karnataka GeoJSON boundary sets.
* **Demographics (Census 2011)**: Karnataka District Census Population & Literacy tables.

---

## 📂 Project Structure
```text
kspdatathon2026/
├── nextjs/                 # Next.js web application frontend & page routing
│   ├── components/         # Reusable UI components (maps, charts, panels)
│   ├── pages/              # Route pages (analytics, map, timeline, chat)
│   └── cli-config.json     # Slate development server port configuration
├── functions/              # Zoho Catalyst Serverless Functions
│   └── drishti_ksp_func/   # Main Node.js API processing queries & data
├── crime-database/         # Database seeding, schema creation, & ETL scripts
│   └── raw-data/           # Raw CSV/GeoJSON datasets (gitignored)
├── camera-intel/           # Camera simulation models & routing logs
├── docs/                   # Team guidelines and architecture specs
├── catalyst.json           # Main Zoho Catalyst deployment configuration
└── README.md               # Main project overview and guide
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+) & npm
- Zoho Catalyst CLI (`npm install -g zcatalyst-cli`)
- Gemini API Key

### Steps
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/vedeshskhatri/kspdatathon2026.git
   cd kspdatathon2026
   ```

2. **Configure Environment Variables:**
   Copy the template and fill in your keys:
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies:**
   ```bash
   cd nextjs
   npm install
   ```

4. **Run Locally:**
   From the project root:
   ```bash
   catalyst serve
   ```
   *The Next.js developer server will launch automatically on the configured port using Catalyst's local emulator.*

---

## 👥 Team DHRISHTI
* **Vritika** — *Coordinator* (Person 1)
* **Swapnil Gosh** — *AI Engine Commander* (Person 2)
* **Aman Jain** — *Data & Analytics Commander* (Person 3)
* **Vedesh S Khatri** — *Camera Network Commander* (Person 4)
* **Aryan** — *UI/UX & Experience Commander* (Person 5)

---

## 🌐 Deployment
DRISHTI is configured for zero-downtime automated deployment to **Zoho Catalyst AppSail / Slate**.
* The nextJS web app builds and deploys directly into Slate.
* Backend APIs run in Zoho Catalyst Serverless Functions.
* Every push to the `main` branch automatically triggers the Catalyst Slate deployment pipeline.
