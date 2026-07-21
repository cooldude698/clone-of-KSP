# 🛡️ DRISHTI (ದೃಷ್ಟಿ) — Karnataka State Police AI Co-Pilot

> **Next-Generation Agentic Crime Intelligence & Command Platform**
> *Built for the KSP Datathon 2026*

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![Zoho Catalyst](https://img.shields.io/badge/Zoho_Catalyst-Serverless-orange)](https://catalyst.zoho.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Flash-8e44ad?logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Overview

**DRISHTI (ದೃಷ್ಟಿ)** is an AI-powered Crime Intelligence & Command Platform engineered specifically for the **Karnataka State Police (KSP)**. 

In traditional law enforcement workflows, investigating officers must manually query fragmented CCTNS databases, sift through complex GIS layers, and piece together suspect records. **DRISHTI** replaces friction with instant intelligence by serving as a **Voice & Text AI Co-Pilot** that understands natural language queries in **English, Kannada, and Hindi**, automatically executes background data tools, synthesizes actionable legal SOPs, and dynamically updates real-time command dashboards.

Whether deployed in a district Control Room or accessed by patrolling Hoysala units on the move, DRISHTI turns raw data into field-ready tactical decisions in seconds.

---

## 💡 The Problem & DRISHTI's Solution

| Challenge in Law Enforcement | How DRISHTI Solves It |
| :--- | :--- |
| **Siloed Crime Data**: Critical FIRs, suspect criminal history, and ANPR camera logs exist in disconnected databases. | **Unified Knowledge Graph & RAG**: Agentic AI retrieves FIRs, repeat offender records, and camera trails in a single unified view. |
| **Complex Query Interfaces**: Field officers cannot write SQL or navigate complex database filters during urgent incidents. | **Multilingual Voice Co-Pilot**: Officers speak naturally (*"Show all vehicle thefts in Bengaluru this month"*) in English or Kannada. |
| **High Latency & System Outages**: Unreliable network connections lead to blank/broken error screens on field dashboards. | **Zero-Downtime Fallback Architecture**: Client-side memory caching + instant demo fallback ensures full dashboard functionality 100% of the time. |
| **Unidentified Suspect Networks**: Gang links and co-accused relationships remain hidden inside textual FIR descriptions. | **Interactive D3 Network Graph**: Automatically maps suspect-to-suspect and suspect-to-FIR connections visually. |
| **Underreported Dark Zones**: Patrols focus only on reported FIR locations, missing unpatrolled high-vulnerability corridors. | **Dark Zone Predictive Analytics**: AI estimates unreported crime ratios to guide proactive Hoysala patrol allocation. |

---

## ⚡ Core Features & Capabilities

### 1. 🤖 Agentic AI Co-Pilot & QuickML RAG System
* **Dual-Engine RAG**: Powered by QuickML RAG primary engine and Gemini Flash with multi-turn function calling tools.
* **Legal SOP Integration**: Automatically cross-references queries against official KSP manuals, IPC/BNS sections, and IT Act guidelines.
* **Multilingual Voice & Text**: Speaks back natively in English or Kannada with real-time Speech-to-Text (STT) and Text-to-Speech (TTS).

### 2. 🛡️ Zero-Downtime Fallback System (`lib/fetch-with-fallback.js` & `lib/demo-data.js`)
* **Instant Resiliency**: If any cloud endpoint (FIRs, Hotspots, Trends, ANPR) is offline or delayed beyond 2 seconds, DRISHTI gracefully switches to rich, realistic Karnataka benchmark demo data.
* **In-Memory Session Cache**: Caches GET requests for 30s and blacklists unreachable endpoints for 15s to guarantee instant UI rendering.
* **System Status Indicator**: `SystemStatusFooter` displays live status with parallel health checks (`LIVE MATRIX` vs `DEMO MODE`).

### 3. 🗺️ Interactive GIS Crime Density Map
* **Heatmap & Hotspot Clustering**: Powered by Leaflet.js and CartoDB dark tiles.
* **Severity Scoring**: Automatically categorizes hotspots into `CRITICAL`, `HIGH`, `MEDIUM`, and `LOW` risk clusters based on violence weighting and recency.

### 4. 🚗 ANPR Surveillance & Suspect Geo-Trail Tracker
* **Live Camera Network**: Simulates overhead ANPR cameras, pedestrian face-recognition poles, and intersection CCTV streams.
* **Resilient Video Engine**: 3-layer fallback chain (Local MP4 → HTTPS CDN Stream → High-Tech HUD Canvas Overlay) ensuring camera tiles never show blank errors.
* **Vehicle Movement Reconstruction**: Visualizes timestamped sighting hops (`/dashboard/trail?plate=...`) on an interactive dark map with confidence scores and distance telemetry.

### 5. 🕸️ Organized Crime Network Graph
* Visualizes complex gang structures, primary accused, co-accused associates, fences, and linked FIR numbers in a node-edge graph.

### 6. 👤 Detailed Suspect Intelligence Dossiers (`/dashboard/suspect/[slug]`)
* Complete criminal dossiers featuring threat level badges, Modus Operandi breakdown, associated FIR case links, known hangouts, and chronological intelligence timelines.

### 7. 📊 Predictive Crime Analytics & Dark Zones
* Identifies monthly crime spikes and detects unpatrolled "Dark Zones" by comparing reported FIR counts against estimated crime volume.

---

## 🏗️ System Architecture

```text
┌───────────────────────────────────────────────────────────────────┐
│                    OFFICER INTERFACE (Browser)                    │
│   Voice (Web Speech STT/TTS)  │  Text Chat  │  Command Dashboard  │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│                 NEXT.JS 15 FRONTEND (App Router)                  │
│  • Theme System (Graphite & Oxblood / Dark Mode FOUC Script)      │
│  • Dynamic Lazy-Loaded Components (DrishtiOrb, DrishtiPanel)     │
│  • Client-Side Memory Caching & Fallback Engine                   │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │
            ┌─────────────────────┴─────────────────────┐
            ▼                                           ▼
┌───────────────────────────────┐           ┌───────────────────────┐
│ ZOHO CATALYST SERVERLESS API  │           │ DEMO DATA FALLBACK    │
│  /server/askDrishtiAI/        │           │  (lib/demo-data.js)   │
│  /server/firs/                │           │  Instant fallback if  │
│  /server/hotspots/            │           │  backend is offline   │
│  /server/trends/              │           └───────────────────────┘
│  /server/anpr-check/          │
│  /server/trail/               │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────────┐
│                     AI / RAG INTELLIGENCE LAYER                   │
│  • QuickML RAG (Primary Vector Retrieval)                         │
│  • Gemini 2.5 Flash API (Multi-turn Tool Calling & Key Rotation)  │
│  • KSP Police Manual SOP & Section Matching                       │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router, Client & Server Components) |
| **Styling & Theme** | Vanilla CSS Tokens + Tailwind CSS 3.4 (*Graphite & Oxblood Palette*) |
| **UI Components & Icons** | Lucide React, Framer Motion, GSAP |
| **GIS & Mapping** | Leaflet.js, React-Leaflet, CartoDB Dark Matter tiles |
| **Backend & Cloud Services** | Zoho Catalyst (Serverless Node.js 24 AdvancedIO Functions) |
| **AI Models & RAG** | Google Gemini 2.5 Flash, QuickML RAG, Zia Translation |
| **Audio Processing** | Web Audio API (Double-clap detection & Push-to-Talk) |
| **Version Control** | Git & GitHub (`main` branch) |

---

## 📁 Repository Structure

```text
kspdatathon2026/
├── functions/                     # Zoho Catalyst Serverless Node.js Functions
│   ├── askDrishtiAI/              # Primary RAG + Gemini tool calling AI endpoint
│   ├── chat/                      # Legacy/Fallback chat endpoint
│   ├── firs/                      # FIR database search & filter endpoint
│   ├── hotspots/                  # Crime hotspot calculation & severity endpoint
│   ├── trends/                    # Incident trend aggregation endpoint
│   ├── repeat-offenders/          # Repeat criminal risk profiling endpoint
│   ├── surveillance/              # ANPR camera network & check endpoint
│   ├── trail/                     # Vehicle movement reconstruction endpoint
│   └── underreporting/            # Dark zone predictive analysis endpoint
├── nextjs/                        # Next.js 15 Web Application
│   ├── public/                    # Static assets & sample surveillance video clips
│   │   └── videos/                # (traffic1.mp4, people1.mp4, etc.)
│   └── src/
│       ├── app/
│       │   ├── layout.js          # Root layout with FOUC dark mode script
│       │   ├── globals.css        # Graphite & Oxblood design system
│       │   ├── dashboard/
│       │   │   ├── page.js        # Main Command Dashboard Overview
│       │   │   ├── chat/          # Co-Pilot Voice & Text Chat Interface
│       │   │   ├── map/           # Dynamic GIS Crime Density Heatmap
│       │   │   ├── network/       # Organized Crime Suspect Network Graph
│       │   │   ├── surveillance/  # Live ANPR & CCTV Surveillance Wall
│       │   │   ├── analytics/     # Crime Trends & Dark Zone Analytics
│       │   │   ├── logs/          # Conversation History Audit Logs
│       │   │   ├── trail/         # Geo-Trail Tracker (`TrailMapView.jsx`)
│       │   │   ├── fir/[id]/      # FIR Case Dossier Detail View
│       │   │   └── suspect/[slug]/# Suspect Profile Dossier View
│       └── lib/
│           ├── demo-data.js       # Comprehensive Karnataka benchmark dataset
│           └── fetch-with-fallback.js # 2s timeout & memory caching fetch wrapper
├── catalyst.json                  # Zoho Catalyst project targets
└── README.md                      # Platform documentation
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js**: v20+ (for Next.js) or v24 (for Catalyst functions)
* **npm**: v10+
* **Zoho Catalyst CLI** (optional, for local function serving): `npm install -g zcatalyst-cli`

### 1. Clone Repository
```bash
git clone https://github.com/vedeshskhatri/kspdatathon2026.git
cd kspdatathon2026
```

### 2. Configure Environment Variables
Create `.env.local` inside `nextjs/`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### 3. Run Development Server

#### Option A: Next.js Frontend Only (with automatic Demo Fallback)
```bash
cd nextjs
npm install
npm run dev -- -p 3001
```
Open **`http://localhost:3001`** in your browser.

#### Option B: Full Local Stack (Catalyst Backend + Next.js Frontend)
**Terminal 1 (Catalyst Functions Backend)**:
```bash
catalyst serve
# Functions running at http://localhost:3000/server/
```

**Terminal 2 (Next.js App)**:
```bash
cd nextjs
npm run dev -- -p 3001
# App running at http://localhost:3001
```

---

## ☁️ Deployment Guide

### Deploying to Zoho Catalyst Cloud

1. **Login to Catalyst CLI**:
   ```bash
   catalyst login
   ```

2. **Deploy All Serverless Functions & Slate App**:
   ```bash
   catalyst deploy
   ```

3. **Verify Deployment URL**:
   Access the live deployed URL (e.g., `https://drishti-ksp-60073715607.development.catalystserverless.in/app/`).

---

## 🛡️ License

Built for the **Karnataka State Police Datathon 2026**. 
Distributed under the **MIT License**.

---

<p center>
<b>DRISHTI (ದೃಷ್ಟಿ) — Empowering Karnataka State Police with Agentic Intelligence.</b>
</p>
