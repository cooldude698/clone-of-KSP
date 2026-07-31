# 🚀 Catalyst & Vibe Coding Guidelines (DRISHTI Project)

> **IMPORTANT FOR AI AGENTS & DEVELOPERS**: Read this guide before vibe coding, editing Catalyst functions, or deploying code to Zoho Catalyst.

---

## 1. Supported Node.js Stack (`node20`)
- **Rule**: All Catalyst AdvancedIO functions (`functions/*`) **MUST** use `"stack": "node20"` in their `catalyst-config.json`.
- **Reason**: Higher Node versions (e.g. `node22`, `node24`) are not supported by the Zoho Catalyst CLI deployment runner and will throw deployment errors (`Unsupported stack`).

### Valid `catalyst-config.json` Template:
```json
{
    "deployment": {
        "name": "functionName",
        "stack": "node20",
        "type": "advancedio",
        "env_variables": {}
    },
    "execution": {
        "main": "index.js"
    }
}
```

---

## 2. Environment Variables & Auth Protocol
Catalyst API requests to QuickML and Zia models **MUST** include:
- `CATALYST-ORG`: `60073715607`
- `Authorization`: `Zoho-oauthtoken <TOKEN>` (or `Bearer <TOKEN>`)

### Endpoint URLs (Configured in `.env` & `nextjs/.env`):
```env
CATALYST_ORG_ID=60073715607
QUICKML_OAUTH_TOKEN=your_quickml_oauth_token_here
QUICKML_RAG_ENDPOINT_URL=https://api.catalyst.zoho.in/quickml/v1/project/49149000000019001/rag/answer
QUICKML_TTS_ENDPOINT_URL=https://api.catalyst.zoho.in/quickml/api/v1/models/zia/tts/synthesize
QUICKML_TRANSLATE_ENDPOINT_URL=https://api.catalyst.zoho.in/quickml/api/v1/models/zia/translate
QUICKML_STT_ENDPOINT_URL=https://api.catalyst.zoho.in/quickml/api/v1/models/zia/audio/transcribe
```

---

## 3. Next.js Local Dev Proxy (`/server/:path*`)
To ensure local Next.js development works identically to production Catalyst deployment:
- `next.config.mjs` contains a rewrite rule mapping `/server/:path*` -> `/api/:path*`.
- Frontend calls `/server/askDrishtiAI/` and `/server/drishtiVoice/`.
- During local dev, Next.js handles these at `src/app/api/askDrishtiAI/route.js` and `src/app/api/drishtiVoice/route.js`.
- During production deployment, Catalyst routes `/server/*` directly to AdvancedIO Node functions!

---

## 4. Pre-Flight Checklist Before Vibe Coding / Deploying:
1. Verify `catalyst-config.json` uses `"stack": "node20"`.
2. Do **NOT** commit secrets into `.env` (ensure `.env` is listed in `.gitignore`).
3. Ensure Gemini JSON parsing handles markdown backticks (` ```json ... ``` `).
4. Run local server check (`npm run dev`) on `http://localhost:3000`.
