import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

loadEnv()

const requestBuckets = new Map()

export async function handleGenerateSpecRequest(body, options = {}) {
  const idea = String(body?.idea ?? '').trim()

  assertAccessCode(body?.accessCode)
  assertRateLimit(options.ipAddress)

  if (!isValidIdea(idea)) {
    return { statusCode: 400, payload: { error: 'Product idea is too short.' } }
  }

  if (idea.length > 4000) {
    return {
      statusCode: 400,
      payload: { error: 'Product idea is too long. Keep it under 4000 characters.' },
    }
  }

  const provider = resolveProviderConfig(body?.provider, options)
  const spec = await generateSpec(idea, provider)
  return { statusCode: 200, payload: { spec } }
}

async function generateSpec(idea, provider) {
  const promptTemplate = loadPromptTemplate()
  const providerResponse = await fetch(provider.chatCompletionsUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: provider.temperature,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: promptTemplate.systemPrompt,
        },
        {
          role: 'user',
          content: buildUserPrompt(idea, promptTemplate.userPromptTemplate),
        },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  })

  const payload = await providerResponse.json()

  if (!providerResponse.ok) {
    const message = payload?.error?.message ?? 'OpenAI-compatible API request failed.'
    throw new Error(message)
  }

  const content = payload?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('The provider returned an empty response.')
  }

  return normalizeSpec(parseJsonContent(content))
}

function resolveProviderConfig(provider, options) {
  const providerId = normalizeProviderId(provider?.id ?? options.providerId)
  const providerConfig = getProviderConfig(providerId)
  const apiKey = providerConfig.apiKey
  const baseUrl = providerConfig.baseUrl
  const model = providerConfig.model
  const temperature = resolveTemperature(providerConfig.temperature)

  if (!apiKey) {
    throw new Error(`Missing ${providerConfig.label} API key. Add it in environment variables.`)
  }

  if (!model) {
    throw new Error(`Missing ${providerConfig.label} model. Add it in environment variables.`)
  }

  return {
    apiKey,
    model,
    temperature,
    chatCompletionsUrl: toChatCompletionsUrl(baseUrl),
  }
}

function normalizeProviderId(value) {
  if (value === 'kimi') return 'kimi'

  return 'deepseek'
}

function getProviderConfig(providerId) {
  if (providerId === 'kimi') {
    return {
      label: 'Kimi',
      apiKey: process.env.KIMI_API_KEY,
      baseUrl: process.env.KIMI_BASE_URL ?? 'https://api.moonshot.cn/v1',
      model: process.env.KIMI_MODEL ?? 'kimi-k2-0711-preview',
      temperature: process.env.KIMI_TEMPERATURE ?? '1',
    }
  }

  return {
    label: 'DeepSeek',
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseUrl: process.env.DEEPSEEK_BASE_URL ?? process.env.OPENAI_COMPATIBLE_BASE_URL ?? 'https://api.deepseek.com',
    model: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
    temperature: process.env.DEEPSEEK_TEMPERATURE ?? process.env.OPENAI_COMPATIBLE_TEMPERATURE ?? '1',
  }
}

function assertAccessCode(accessCode) {
  const requiredAccessCode = process.env.SPEC_ENGINE_ACCESS_CODE?.trim()

  if (!requiredAccessCode) return

  if (String(accessCode ?? '').trim() !== requiredAccessCode) {
    const error = new Error('Invalid access code.')
    error.statusCode = 401
    throw error
  }
}

function assertRateLimit(ipAddress = 'anonymous') {
  const limit = Number(process.env.SPEC_ENGINE_RATE_LIMIT ?? 20)
  const windowMs = Number(process.env.SPEC_ENGINE_RATE_LIMIT_WINDOW_MS ?? 3600000)

  if (!Number.isFinite(limit) || limit <= 0) return

  const now = Date.now()
  const bucket = requestBuckets.get(ipAddress)

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(ipAddress, { count: 1, resetAt: now + windowMs })
    return
  }

  bucket.count += 1

  if (bucket.count > limit) {
    const error = new Error('Too many requests. Please try again later.')
    error.statusCode = 429
    throw error
  }
}

function resolveTemperature(value) {
  const rawTemperature = ensureProviderValue(value, '1')
  const temperature = Number(rawTemperature)

  if (!Number.isFinite(temperature) || temperature < 0 || temperature > 2) {
    throw new Error('Temperature must be a number between 0 and 2.')
  }

  return temperature
}

function ensureProviderValue(value, fallback) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function toChatCompletionsUrl(baseUrl) {
  if (!baseUrl) {
    throw new Error('Missing API base URL.')
  }

  const trimmedUrl = baseUrl.trim().replace(/\/+$/, '')
  const url = new URL(trimmedUrl)

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('API base URL must start with http:// or https://.')
  }

  if (url.pathname.endsWith('/chat/completions')) {
    return url.toString()
  }

  if (url.pathname.endsWith('/v1')) {
    return `${url.toString().replace(/\/+$/, '')}/chat/completions`
  }

  return `${url.toString().replace(/\/+$/, '')}/chat/completions`
}

function loadPromptTemplate() {
  const promptPath = resolve(process.cwd(), 'prompt/spec-generation-prompt.md')
  const content = readFileSync(promptPath, 'utf8')
  const systemPrompt = extractSection(content, 'System Prompt')
  const userPromptTemplate = extractSection(content, 'User Prompt Template')

  if (!systemPrompt || !userPromptTemplate.includes('{{IDEA}}')) {
    throw new Error('Invalid prompt/spec-generation-prompt.md. Keep {{IDEA}} in the user template.')
  }

  return { systemPrompt, userPromptTemplate }
}

function extractSection(content, heading) {
  const headingMarker = `## ${heading}`
  const startIndex = content.indexOf(headingMarker)

  if (startIndex === -1) return ''

  const sectionStart = startIndex + headingMarker.length
  const nextHeadingIndex = content.indexOf('\n## ', sectionStart)
  const sectionEnd = nextHeadingIndex === -1 ? content.length : nextHeadingIndex

  return content.slice(sectionStart, sectionEnd).trim()
}

function buildUserPrompt(idea, template) {
  return template.replaceAll('{{IDEA}}', idea)
}

function isValidIdea(input) {
  const cjkCharacters = input.match(/[\u4e00-\u9fff]/g)?.length ?? 0
  const nonWhitespaceCharacters = input.replace(/\s/g, '').length

  return cjkCharacters >= 2 || nonWhitespaceCharacters >= 5
}

function parseJsonContent(content) {
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  return JSON.parse(cleaned)
}

function normalizeSpec(spec) {
  return {
    product_goal: ensureString(spec.product_goal),
    target_users: ensureStringArray(spec.target_users),
    core_features: ensureStringArray(spec.core_features),
    user_flow: ensureStringArray(spec.user_flow),
    data_entities: ensureStringArray(spec.data_entities),
    non_functional_requirements: ensureStringArray(spec.non_functional_requirements),
    missing_logic: ensureStringArray(spec.missing_logic),
    architecture_suggestions: ensureStringArray(spec.architecture_suggestions),
    tasks: ensureStringArray(spec.tasks),
  }
}

function ensureString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : 'MVP product goal undefined'
}

function ensureStringArray(value) {
  if (!Array.isArray(value)) return []

  return value.map((item) => String(item).trim()).filter(Boolean)
}

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env')

  try {
    const content = readFileSync(envPath, 'utf8')

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) continue

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) continue

      const key = trimmed.slice(0, separatorIndex).trim()
      const rawValue = trimmed.slice(separatorIndex + 1).trim()
      const value = rawValue.replace(/^["']|["']$/g, '')

      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // Vercel provides environment variables directly; local .env is optional.
  }
}
