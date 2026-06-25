# DRISHTI — ದೃಷ್ಟಿ

Intelligence that sees what others miss.

## Setup At A Glance

This repository is currently a docs-first scaffold for the DRISHTI team. Use the guides in `docs/` as the source of truth, and follow the steps below in order.

1. Read the captain guide first: `docs/DRISHTI_Person1_CaptainGuide (1).md`.
2. Use `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-2.5-flash` for the AI engine instead of Anthropic.
3. Copy `.env.example` to `.env` and fill in your real Catalyst and Gemini values.
4. Keep secrets out of GitHub. The root `.gitignore` already excludes `.env`, `.env.local`, `credentials_PRIVATE.txt`, and raw data files.
5. Follow the person-specific guides in `docs/` as each module is assigned.

## Suggested Order

1. Captain setup and Catalyst project creation.
2. AI engine configuration with Gemini 2.5 Flash.
3. Crime database loading and synthetic data generation.
4. Camera intelligence setup.
5. Frontend integration and deployment.

## Files To Know

- `docs/DRISHTI_Person1_CaptainGuide (1).md` for project setup and data loading.
- `docs/DRISHTI_Person2_AIEngineGuide.md` for the chat and AI pipeline.
- `docs/DRISHTI_Person3_DataAnalyticsGuide.md` for crime analytics.
- `docs/DRISHTI_Person4_CameraIntelGuide.md` for camera intelligence.
- `docs/DRISHTI_Person5_UIUXGuide.md` for the frontend.

## Environment Variables

The shared setup now uses Gemini 2.5 Flash.

- `GEMINI_API_KEY`
- `GEMINI_MODEL=gemini-2.5-flash`
- Catalyst database and project variables from the captain guide

If you want, I can turn the next setup step into concrete project files and commands.
