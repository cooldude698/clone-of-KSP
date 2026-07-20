# AI Agent Rules for DRISHTI KSP Project

## Catalyst Function Rules
1. **Node.js Stack Version**: Always set `"stack": "node20"` in `functions/<function_name>/catalyst-config.json`. Never use unsupported node versions like `node22` or `node24`.
2. **Environment Variables**: Always check `.env` and `nextjs/.env` for `CATALYST_ORG_ID=60073715607` and `QUICKML_OAUTH_TOKEN`.
3. **Local Dev Routing**: Keep `/server/:path*` -> `/api/:path*` rewrite in `next.config.mjs` synchronized with `src/app/api/*` routes and `functions/*`.
4. **Speech & Multilingual**: Maintain `en-IN` for browser Speech Recognition preview and Gemini JSON markdown parsing cleanup (`raw.replace(/^```json\s*/i, '')`).
