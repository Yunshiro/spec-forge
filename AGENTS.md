# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project Overview

SpecForge is a Vue/Vite web app that turns a short product idea into structured, AI-coding-ready implementation context.

The generation prompt lives in `prompt/spec-generation-prompt.md`.

## Project Structure

The app has three main parts:

- Frontend UI: `src/App.vue` and `src/style.css`
- Shared spec generation engine: `server/spec-engine.mjs`
- API wrappers:
  - Local Node API: `server/local-api.mjs`
  - Vercel serverless endpoint: `api/generate-spec.js`

## Common Commands

Use these from the repository root:

```bash
npm run dev
npm run api
npm run dev:local
npm run build
```

Command purposes:

- `npm run dev`: run the Vite frontend only.
- `npm run api`: run the local Node API only.
- `npm run dev:local`: run both the local API and Vite frontend.
- `npm run build`: run Vue type checking and build the production app.

The local frontend is served at `http://127.0.0.1:5173`.
Vite proxies `/api` requests to `http://127.0.0.1:8787`.

## Environment

Local API configuration is read from `.env` in the project root. Use `.env.example` as the template.

Provider API keys must stay server-side. Do not add browser-side API key inputs or expose provider secrets in frontend code.

Supported provider environment variables include:

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_BASE_URL`
- `DEEPSEEK_MODEL`
- `DEEPSEEK_TEMPERATURE`
- `KIMI_API_KEY`
- `KIMI_BASE_URL`
- `KIMI_MODEL`
- `KIMI_TEMPERATURE`
- `SPEC_ENGINE_ACCESS_CODE`
- `SPEC_ENGINE_RATE_LIMIT`
- `SPEC_ENGINE_RATE_LIMIT_WINDOW_MS`

## Architecture Notes

`server/spec-engine.mjs` should remain the single source of truth for provider resolution, prompt loading, response validation, rate limiting, and spec normalization.

Both API wrappers should stay thin:

- Parse or normalize the request body.
- Pass request metadata such as client IP into `handleGenerateSpecRequest`.
- Convert the result or thrown error into an HTTP response.

Keep the prompt format in `prompt/spec-generation-prompt.md` compatible with `loadPromptTemplate()`:

- It must include `## System Prompt`.
- It must include `## User Prompt Template`.
- The user prompt template must include `{{IDEA}}`.

## Frontend Notes

The frontend is currently implemented mostly in a single component, `src/App.vue`.

Preserve these behaviors unless intentionally changing product scope:

- Store the last idea in localStorage under `specforge:last-idea`.
- Store selected provider in `specforge:provider`.
- Store access code in `specforge:access-code`.
- Support Chinese and English product ideas.
- Allow generation with Ctrl/Command + Enter.
- Provide copy actions for Markdown, prompt, and JSON outputs.

The app intentionally avoids user accounts, billing, project management, multi-model orchestration, and other non-MVP scope unless the user explicitly asks for them.

## Styling Guidelines

The UI is a dense MVP workbench, not a marketing landing page. Keep changes practical and focused.

When changing `src/style.css`:

- Preserve responsive behavior for mobile and desktop.
- Avoid text overflow inside buttons, cards, and compact controls.
- Keep cards and controls at small radii consistent with the current design.
- Do not introduce a large design-system dependency unless specifically requested.

## Testing And Verification

Before finishing code changes, prefer running:

```bash
npm run build
```

For API changes, also exercise the local API path when possible with `npm run dev:local`.

For frontend UI changes, inspect the app in a browser at `http://127.0.0.1:5173` and check both desktop and narrow widths.

## Known Implementation Detail

The frontend sends provider selection as `providerId` in the JSON request body. If changing provider selection behavior, confirm that both the local API and Vercel endpoint pass this value into `handleGenerateSpecRequest`, or update the shared engine to read the same request field consistently.

## Dependency Policy

This project is intentionally small. Avoid adding new dependencies unless they solve a clear problem that is awkward to handle with Vue, Vite, or the existing Node standard library.

If dependencies are added, update `package.json` and `package-lock.json` together.

## Git Hygiene

Do not revert unrelated user changes. Keep commits and patches scoped to the requested task.


## Rules

- If the user's request is unclear, ask clarifying questions before making changes.
- If the user asks in Chinese, reply in Chinese.
