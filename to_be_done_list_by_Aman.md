# DRISHTI - To-Do List & Handover for Aman

## 🌟 What DRISHTI Stands For

**DRISHTI (ದೃಷ್ಟಿ)** is a Voice-Driven Conversational Intelligence platform built for the Karnataka State Police (KSP Hack2Skill Datathon 2026). It transforms how police officers interact with intelligence data by allowing them to talk to the system using natural language (English, Kannada, Hindi). Powered by Agentic AI and Zoho Catalyst, it processes queries, retrieves real-time crime data, and renders interactive visualizations on a unified command center dashboard to assist in crime prevention and officer safety.

## 🚀 How to Initialize the Server

The project uses a Next.js frontend (Node.js v20) and a Zoho Catalyst serverless backend (Node.js v24). You need two separate terminals to run the project locally.

### 1. Setup & Environment

Ensure you have cloned the repository and set up your API keys:

```bash
cp .env.example functions/chat/.env
# Add GEMINI_API_KEY_1 to functions/chat/.env
```

### 2. Start Catalyst Backend (Terminal 1)

```bash
nvm use 24
catalyst serve
# Functions available at http://localhost:3000/server/
```

### 3. Start Next.js Frontend (Terminal 2)

```bash
cd nextjs
nvm use 20
npm install --legacy-peer-deps
npm run dev -- -p 3001
# UI available at http://localhost:3001
```

## 🚨 Critical Issues & Bugs to Fix

- [ ] **Voice Model Failure**: Drishti is currently failing to pick up voice, recognize speech, or provide output. This is the top priority for debugging and testing.
- [ ] **Missing Dedicated Pages**: There are currently no separate pages for features like Camera, Intel, Crime Databases, etc. These need to be created and structured according to project requirements.
- [ ] **Broken Functions**: Most of Drishti's core functions are currently failing. You need to go through the features, debug them, and test if they are working properly.
- [ ] **Poor Structure & UI/UX Issues**: The project structure needs improvement. Furthermore, recent features lack a proper user interface on the landing page, making the experience not user-friendly.

## 🛠️ Step-by-Step Takeover Guide

1. **Step 1: Get the Environment Running**
   - Follow the server initialization steps to get both the frontend and backend running on your local machine. Do not start coding until both are running without fatal crash errors.
2. **Step 2: Debug the Voice Model**
   - Investigate the Web Speech API integrations (STT/TTS) and the communication with the backend. Fix the recognition and output pipelines.
3. **Step 3: Fix Core Functions**
   - Go through existing agentic functions (Hotspots, FIRs, etc.) and check why they are failing to return or render data. Debug the AI response payload and rendering logic.
4. **Step 4: Restructure & Add Missing Pages**
   - Scaffold the missing pages (Camera, Intel, Crime Databases) in the Next.js `app` directory. Link them properly from the main dashboard to improve the structure.
5. **Step 5: Audit & Discover Hidden Issues**
   - Review recent commits and added features. Flag and fix problems not explicitly stated here, especially those affecting the user interface on the landing page.

*Note: Please refer to the provided voice messages for additional context on the issues mentioned above.*
