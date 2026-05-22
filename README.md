# SpecForge

Turn messy product ideas into AI-coding-ready implementation context.

## Local API Setup

Create `.env` in the project root:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=1

KIMI_API_KEY=your_kimi_api_key
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=kimi-k2-0711-preview
KIMI_TEMPERATURE=1

API_PORT=8787
SPEC_ENGINE_RATE_LIMIT=20
SPEC_ENGINE_RATE_LIMIT_WINDOW_MS=3600000
```

Run the local API and Vite app together:

```bash
npm run dev:local
```

Open:

```text
http://127.0.0.1:5173
```

The browser calls `/api/generate-spec`, and Vite proxies that request to the local Node API at
`http://127.0.0.1:8787`. The app lets users switch between DeepSeek and Kimi, but API keys stay in
server-side environment variables.

## Vercel Deploy

The app includes a Vercel serverless endpoint at:

```text
api/generate-spec.js
```

For public deployment, the frontend does not send provider API keys. Configure the provider in Vercel
environment variables instead:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_TEMPERATURE=1

KIMI_API_KEY=your_kimi_api_key
KIMI_BASE_URL=https://api.moonshot.cn/v1
KIMI_MODEL=kimi-k2-0711-preview
KIMI_TEMPERATURE=1

SPEC_ENGINE_RATE_LIMIT=20
SPEC_ENGINE_RATE_LIMIT_WINDOW_MS=3600000
```

Optional access-code gate:

```env
SPEC_ENGINE_ACCESS_CODE=invite-code
VITE_REQUIRE_ACCESS_CODE=true
```

Run a Vercel-like local test if you have the Vercel CLI:

```bash
vercel dev
```

## Prompt Editing

The spec-generation prompt lives in:

```text
prompt/spec-generation-prompt.md
```

Edit the `System Prompt` and `User Prompt Template` sections there. Keep `{{IDEA}}` in the user
template; the local API replaces it with the user's input at runtime.

## Scripts

```bash
npm run dev        # Vite frontend only
npm run api        # Local API only
npm run dev:local  # Frontend + local API
npm run build      # Type-check and production build
```
