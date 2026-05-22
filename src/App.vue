<script setup lang="ts">
import { Analytics } from '@vercel/analytics/vue'
import { computed, onMounted, ref } from 'vue'

type SpecResult = {
  product_goal: string
  target_users: string[]
  core_features: string[]
  user_flow: string[]
  data_entities: string[]
  non_functional_requirements: string[]
  missing_logic: string[]
  architecture_suggestions: string[]
  tasks: string[]
}

const STORAGE_KEY = 'specforge:last-idea'
const PROVIDER_STORAGE_KEY = 'specforge:provider'
const ACCESS_CODE_STORAGE_KEY = 'specforge:access-code'

const idea = ref('')
const providerId = ref('deepseek')
const accessCode = ref('')
const showProviderSettings = ref(false)
const isGenerating = ref(false)
const errorMessage = ref('')
const copyStatus = ref('')
const result = ref<SpecResult | null>(null)
const requiresAccessCode = import.meta.env.VITE_REQUIRE_ACCESS_CODE === 'true'

const providers = [
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'kimi', label: 'Kimi' },
]

const exampleIdeas = [
  'Build an AI screenshot annotation tool for macOS.',
  'I want to build a simple AI note taking app.',
  'Create a lightweight customer feedback inbox for indie SaaS founders.',
]

const resultJson = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''))
const selectedProviderLabel = computed(
  () => providers.find((provider) => provider.id === providerId.value)?.label ?? 'DeepSeek',
)
const ideaCharacterCount = computed(() => idea.value.trim().length)

const markdownSpec = computed(() => {
  if (!result.value) return ''

  return [
    `# ${result.value.product_goal}`,
    '',
    '## Target Users',
    toMarkdownList(result.value.target_users),
    '',
    '## Core Features',
    toMarkdownList(result.value.core_features),
    '',
    '## User Flow',
    toMarkdownList(result.value.user_flow),
    '',
    '## Data Entities',
    toMarkdownList(result.value.data_entities),
    '',
    '## Non-functional Requirements',
    toMarkdownList(result.value.non_functional_requirements),
    '',
    '## Missing Logic Audit',
    toMarkdownList(result.value.missing_logic),
    '',
    '## Architecture Suggestions',
    toMarkdownList(result.value.architecture_suggestions),
    '',
    '## MVP Tasks',
    toMarkdownList(result.value.tasks),
  ].join('\n')
})

const contextPack = computed(() => {
  if (!result.value) return ''

  return `You are a senior software engineer.

Build the following MVP application.

Project Goal:
${result.value.product_goal}

Core Features:
${toPlainList(result.value.core_features)}

User Flow:
${toPlainList(result.value.user_flow)}

Data Entities:
${toPlainList(result.value.data_entities)}

Missing Logic Considerations:
${toPlainList(result.value.missing_logic)}

Architecture Suggestions:
${toPlainList(result.value.architecture_suggestions)}

Constraints:
- Keep implementation minimal
- Avoid overengineering
- Prioritize shipping speed
- Build only the MVP scope
- Prefer explicit state and error handling

Task:
Generate implementation steps and starter architecture.`
})

onMounted(() => {
  idea.value = getStoredValue(STORAGE_KEY, 'ai-spec-engine:last-idea') ?? ''
  providerId.value = localStorage.getItem(PROVIDER_STORAGE_KEY) ?? 'deepseek'
  accessCode.value = getStoredValue(ACCESS_CODE_STORAGE_KEY, 'ai-spec-engine:access-code') ?? ''
})

function toMarkdownList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n')
}

function toPlainList(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n')
}

function getStoredValue(primaryKey: string, legacyKey: string) {
  return localStorage.getItem(primaryKey) ?? localStorage.getItem(legacyKey)
}

function setExample(nextIdea: string) {
  idea.value = nextIdea
  errorMessage.value = ''
}

function selectProvider(nextProviderId: string) {
  providerId.value = nextProviderId
  saveProviderSettings()
}

async function generateSpec() {
  const normalizedIdea = idea.value.trim()
  errorMessage.value = ''
  copyStatus.value = ''

  if (!isValidIdea(normalizedIdea)) {
    errorMessage.value = 'Please describe the product idea in one short sentence.'
    return
  }

  isGenerating.value = true
  localStorage.setItem(STORAGE_KEY, normalizedIdea)
  saveProviderSettings()

  try {
    const requestBody: {
      idea: string
      providerId: string
      accessCode?: string
    } = {
      idea: normalizedIdea,
      providerId: providerId.value,
    }

    if (requiresAccessCode) {
      requestBody.accessCode = accessCode.value.trim()
    }

    const response = await fetch('/api/generate-spec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const payload = (await response.json()) as { spec?: SpecResult; error?: string }

    if (!response.ok || !payload.spec) {
      throw new Error(payload.error ?? 'Generation failed. Please retry.')
    }

    result.value = payload.spec
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Generation failed. Please retry.'
  } finally {
    isGenerating.value = false
  }
}

function saveProviderSettings() {
  localStorage.setItem(ACCESS_CODE_STORAGE_KEY, accessCode.value.trim())
  localStorage.setItem(PROVIDER_STORAGE_KEY, providerId.value)
}

async function copyText(label: string, content: string) {
  if (!content) return

  try {
    await navigator.clipboard.writeText(content)
    copyStatus.value = `${label} copied`
  } catch {
    errorMessage.value = 'Clipboard access failed. Select the text and copy manually.'
  }
}

function isValidIdea(input: string) {
  const cjkCharacters = input.match(/[\u4e00-\u9fff]/g)?.length ?? 0
  const nonWhitespaceCharacters = input.replace(/\s/g, '').length

  return cjkCharacters >= 2 || nonWhitespaceCharacters >= 5
}
</script>

<template>
  <Analytics />
  <main class="app-shell">
    <section class="intro-panel">
      <div class="intro-copy">
        <div class="brand-row">
          <div class="brand-lockup">
            <span class="brand-mark">SF</span>
            <div>
              <p class="eyebrow">SpecForge</p>
              <p class="brand-subtitle">AI coding context compiler</p>
            </div>
          </div>
          <span class="status-pill">MVP Workbench</span>
        </div>
        <h1>Turn messy ideas into Claude-ready coding context.</h1>
        <p class="lede">
          Structure requirements, catch missing logic, and generate an implementation prompt before
          your coding agent starts drifting.
        </p>
        <div class="hero-metrics" aria-label="Output modules">
          <span>Structured spec</span>
          <span>Logic audit</span>
          <span>Task order</span>
        </div>
      </div>

      <form class="input-panel" @submit.prevent="generateSpec">
        <div class="panel-header">
          <div>
            <label for="idea">Product idea</label>
            <p class="panel-caption">One sentence is enough. Chinese and English are both supported.</p>
          </div>
          <button
            class="settings-toggle"
            type="button"
            :aria-expanded="showProviderSettings"
            @click="showProviderSettings = !showProviderSettings"
          >
            Provider
          </button>
        </div>

        <div class="provider-strip">
          <span>Provider</span>
          <strong>{{ selectedProviderLabel }}</strong>
        </div>

        <div v-if="showProviderSettings" class="provider-settings">
          <div class="provider-options" role="radiogroup" aria-label="Provider">
            <button
              v-for="provider in providers"
              :key="provider.id"
              class="provider-option"
              :class="{ active: providerId === provider.id }"
              type="button"
              role="radio"
              :aria-checked="providerId === provider.id"
              @click="selectProvider(provider.id)"
            >
              {{ provider.label }}
            </button>
          </div>

          <div v-if="requiresAccessCode" class="field-row">
            <label for="access-code">Access Code</label>
            <input
              id="access-code"
              v-model="accessCode"
              type="password"
              placeholder="Optional gate"
              autocomplete="off"
              @change="saveProviderSettings"
            />
          </div>
          <p class="settings-note">Provider keys are configured on the server, not in the browser.</p>
        </div>

        <textarea
          id="idea"
          v-model="idea"
          placeholder="Describe your product idea..."
          rows="8"
          @keydown.ctrl.enter.prevent="generateSpec"
          @keydown.meta.enter.prevent="generateSpec"
        />
        <div class="textarea-footer">
          <span>{{ ideaCharacterCount }} characters</span>
          <span>Ctrl/Command + Enter</span>
        </div>
        <div class="example-row" aria-label="Example ideas">
          <button
            v-for="example in exampleIdeas"
            :key="example"
            type="button"
            class="example-button"
            @click="setExample(example)"
          >
            {{ example }}
          </button>
        </div>
        <div class="action-row">
          <button class="primary-button" type="submit" :disabled="isGenerating">
            <span v-if="isGenerating" class="button-spinner" aria-hidden="true"></span>
            {{ isGenerating ? 'Thinking...' : 'Generate spec' }}
          </button>
          <button
            class="secondary-button"
            type="button"
            :disabled="!idea.trim() || isGenerating"
            @click="generateSpec"
          >
            Retry
          </button>
        </div>
        <div v-if="isGenerating" class="loading-state" role="status">
          <span class="loading-dot"></span>
          <span>Thinking through requirements, edge cases, and task order...</span>
        </div>
        <p v-if="errorMessage" class="status-message error">{{ errorMessage }}</p>
        <p v-else-if="copyStatus" class="status-message success">{{ copyStatus }}</p>
      </form>
    </section>

    <section v-if="result" class="results-grid" aria-live="polite">
      <div class="result-summary">
        <div>
          <p class="section-kicker">Compiled Context</p>
          <h2>Ready to paste into your coding agent</h2>
        </div>
        <div class="summary-counts">
          <span>{{ result.core_features.length }} features</span>
          <span>{{ result.missing_logic.length }} gaps</span>
          <span>{{ result.tasks.length }} tasks</span>
        </div>
      </div>

      <article class="output-card wide">
        <div class="card-heading">
          <div>
            <p class="section-kicker">Structured Requirements</p>
            <h2>{{ result.product_goal }}</h2>
          </div>
          <button class="copy-button" type="button" @click="copyText('Markdown', markdownSpec)">
            Copy Markdown
          </button>
        </div>
        <div class="spec-columns">
          <section>
            <h3>Target Users</h3>
            <ul>
              <li v-for="user in result.target_users" :key="user">{{ user }}</li>
            </ul>
          </section>
          <section>
            <h3>Core Features</h3>
            <ul>
              <li v-for="feature in result.core_features" :key="feature">{{ feature }}</li>
            </ul>
          </section>
          <section>
            <h3>User Flow</h3>
            <ol>
              <li v-for="step in result.user_flow" :key="step">{{ step }}</li>
            </ol>
          </section>
          <section>
            <h3>Data Entities</h3>
            <div class="tag-list">
              <span v-for="entity in result.data_entities" :key="entity">{{ entity }}</span>
            </div>
          </section>
        </div>
      </article>

      <article class="output-card">
        <p class="section-kicker">Missing Logic Detection</p>
        <h2>Audit before code</h2>
        <ul class="dense-list">
          <li v-for="item in result.missing_logic" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="output-card">
        <p class="section-kicker">Architecture Suggestions</p>
        <h2>Starter direction</h2>
        <ul class="dense-list">
          <li v-for="item in result.architecture_suggestions" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="output-card">
        <p class="section-kicker">Task Breakdown</p>
        <h2>Dependency-aware order</h2>
        <ol class="dense-list">
          <li v-for="task in result.tasks" :key="task">{{ task }}</li>
        </ol>
      </article>

      <article class="output-card prompt-card">
        <div class="card-heading">
          <div>
            <p class="section-kicker">Claude Context Pack</p>
            <h2>Implementation prompt</h2>
          </div>
          <div class="copy-group">
            <button class="copy-button" type="button" @click="copyText('Prompt', contextPack)">
              Copy Prompt
            </button>
            <button class="copy-button" type="button" @click="copyText('JSON', resultJson)">
              Copy JSON
            </button>
          </div>
        </div>
        <pre>{{ contextPack }}</pre>
      </article>
    </section>

    <section v-else class="empty-state">
      <div>
        <p class="section-kicker">Fast in, fast out</p>
        <h2>Paste one product idea and generate a focused MVP plan in seconds.</h2>
      </div>
      <div class="empty-steps">
        <span>01 Input idea</span>
        <span>02 Structure spec</span>
        <span>03 Audit missing logic</span>
        <span>04 Copy context pack</span>
      </div>
    </section>
  </main>
</template>
