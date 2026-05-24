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

type Locale = 'en' | 'zh'

const STORAGE_KEY = 'specforge:last-idea'
const PROVIDER_STORAGE_KEY = 'specforge:provider'
const ACCESS_CODE_STORAGE_KEY = 'specforge:access-code'
const LOCALE_STORAGE_KEY = 'specforge:locale'

const idea = ref('')
const providerId = ref('deepseek')
const accessCode = ref('')
const locale = ref<Locale>('en')
const isGenerating = ref(false)
const errorMessage = ref('')
const copyStatus = ref('')
const result = ref<SpecResult | null>(null)
const requiresAccessCode = import.meta.env.VITE_REQUIRE_ACCESS_CODE === 'true'

const providers = [
  { id: 'deepseek', label: 'DeepSeek' },
  { id: 'kimi', label: 'Kimi' },
]

const messages = {
  en: {
    brandSubtitle: 'AI coding context compiler',
    capabilitiesLabel: 'Workbench capabilities',
    capabilities: ['Structured spec', 'Logic audit', 'Task order'],
    languageLabel: 'Language',
    workbench: 'MVP Workbench',
    headline: 'Turn messy ideas into coding context.',
    ideaHint: 'One sentence is enough. Chinese and English are both supported.',
    model: 'Model',
    accessCode: 'Access Code',
    accessCodePlaceholder: 'Optional gate',
    ideaPlaceholder: 'Describe your product idea...',
    characters: 'characters',
    shortcut: 'Ctrl/Command + Enter',
    examplesLabel: 'Example ideas',
    examples: [
      'Build an AI screenshot annotation tool for macOS.',
      'I want to build a simple AI note taking app.',
      'Create a lightweight customer feedback inbox for indie SaaS founders.',
    ],
    generate: 'Generate spec',
    thinking: 'Thinking...',
    retry: 'Retry',
    loading: 'Thinking through requirements, edge cases, and task order...',
    validationError: 'Please describe the product idea in one short sentence.',
    generationFallback: 'Generation failed. Please retry.',
    clipboardError: 'Clipboard access failed. Select the text and copy manually.',
    copySuccess: (label: string) => `${label} copied`,
    outputPreview: 'Output Preview',
    serverSideKeys: 'Server-side keys',
    previewTitle: 'Paste-ready context without product-management sprawl.',
    previewBody:
      'SpecForge converts a rough idea into requirements, missing-logic checks, architecture direction, and a task sequence your coding agent can act on.',
    previewSteps: ['01 Input idea', '02 Structure spec', '03 Audit gaps', '04 Copy prompt'],
    compiledContext: 'Compiled Context',
    readyToPaste: 'Ready to paste into your coding agent',
    features: 'features',
    gaps: 'gaps',
    tasks: 'tasks',
    structuredRequirements: 'Structured Requirements',
    copyMarkdown: 'Copy Markdown',
    markdownLabel: 'Markdown',
    targetUsers: 'Target Users',
    coreFeatures: 'Core Features',
    userFlow: 'User Flow',
    dataEntities: 'Data Entities',
    missingLogicDetection: 'Missing Logic Detection',
    auditBeforeCode: 'Audit before code',
    architectureSuggestions: 'Architecture Suggestions',
    starterDirection: 'Starter direction',
    taskBreakdown: 'Task Breakdown',
    dependencyAwareOrder: 'Dependency-aware order',
    claudeContextPack: 'Claude Context Pack',
    implementationPrompt: 'Implementation prompt',
    copyPrompt: 'Copy Prompt',
    copyJson: 'Copy JSON',
    promptLabel: 'Prompt',
    jsonLabel: 'JSON',
  },
  zh: {
    brandSubtitle: 'AI 编码上下文编译器',
    capabilitiesLabel: '工作台能力',
    capabilities: ['结构化规格', '逻辑审查', '任务顺序'],
    languageLabel: '语言',
    workbench: 'MVP 工作台',
    headline: '把模糊想法变成编码上下文。',
    ideaHint: '一句话就够了。支持中文和英文产品想法。',
    model: '模型',
    accessCode: '访问码',
    accessCodePlaceholder: '可选门禁',
    ideaPlaceholder: '描述你的产品想法...',
    characters: '字符',
    shortcut: 'Ctrl/Command + Enter',
    examplesLabel: '示例想法',
    examples: [
      '做一个 macOS AI 截图标注工具。',
      '我想做一个简单的 AI 笔记应用。',
      '为独立 SaaS 创始人做一个轻量客户反馈收件箱。',
    ],
    generate: '生成规格',
    thinking: '思考中...',
    retry: '重试',
    loading: '正在梳理需求、边界情况和任务顺序...',
    validationError: '请用一句简短的话描述产品想法。',
    generationFallback: '生成失败，请重试。',
    clipboardError: '剪贴板访问失败，请选中文本后手动复制。',
    copySuccess: (label: string) => `${label} 已复制`,
    outputPreview: '输出预览',
    serverSideKeys: '密钥在服务端',
    previewTitle: '生成可直接粘贴的上下文，不增加项目管理负担。',
    previewBody:
      'SpecForge 会把粗略想法整理成需求、缺失逻辑检查、架构方向，以及编码代理可以执行的任务序列。',
    previewSteps: ['01 输入想法', '02 结构化规格', '03 审查缺口', '04 复制提示词'],
    compiledContext: '已编译上下文',
    readyToPaste: '可直接粘贴到你的编码代理',
    features: '项功能',
    gaps: '个缺口',
    tasks: '个任务',
    structuredRequirements: '结构化需求',
    copyMarkdown: '复制 Markdown',
    markdownLabel: 'Markdown',
    targetUsers: '目标用户',
    coreFeatures: '核心功能',
    userFlow: '用户流程',
    dataEntities: '数据实体',
    missingLogicDetection: '缺失逻辑检测',
    auditBeforeCode: '编码前审查',
    architectureSuggestions: '架构建议',
    starterDirection: '起步方向',
    taskBreakdown: '任务拆解',
    dependencyAwareOrder: '依赖顺序',
    claudeContextPack: 'Claude 上下文包',
    implementationPrompt: '实现提示词',
    copyPrompt: '复制 Prompt',
    copyJson: '复制 JSON',
    promptLabel: 'Prompt',
    jsonLabel: 'JSON',
  },
} satisfies Record<Locale, {
  brandSubtitle: string
  capabilitiesLabel: string
  capabilities: string[]
  languageLabel: string
  workbench: string
  headline: string
  ideaHint: string
  model: string
  accessCode: string
  accessCodePlaceholder: string
  ideaPlaceholder: string
  characters: string
  shortcut: string
  examplesLabel: string
  examples: string[]
  generate: string
  thinking: string
  retry: string
  loading: string
  validationError: string
  generationFallback: string
  clipboardError: string
  copySuccess: (label: string) => string
  outputPreview: string
  serverSideKeys: string
  previewTitle: string
  previewBody: string
  previewSteps: string[]
  compiledContext: string
  readyToPaste: string
  features: string
  gaps: string
  tasks: string
  structuredRequirements: string
  copyMarkdown: string
  markdownLabel: string
  targetUsers: string
  coreFeatures: string
  userFlow: string
  dataEntities: string
  missingLogicDetection: string
  auditBeforeCode: string
  architectureSuggestions: string
  starterDirection: string
  taskBreakdown: string
  dependencyAwareOrder: string
  claudeContextPack: string
  implementationPrompt: string
  copyPrompt: string
  copyJson: string
  promptLabel: string
  jsonLabel: string
}>

const resultJson = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''))
const ideaCharacterCount = computed(() => idea.value.trim().length)
const t = computed(() => messages[locale.value])
const exampleIdeas = computed(() => t.value.examples)

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
- Before starting implementation, scan the current project for existing requirement documents
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
  locale.value = normalizeLocale(localStorage.getItem(LOCALE_STORAGE_KEY))
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

function normalizeLocale(value: string | null): Locale {
  return value === 'zh' ? 'zh' : 'en'
}

function setLocale(nextLocale: Locale) {
  locale.value = nextLocale
  localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  errorMessage.value = ''
  copyStatus.value = ''
}

function setExample(nextIdea: string) {
  idea.value = nextIdea
  errorMessage.value = ''
  copyStatus.value = ''
}

async function generateSpec() {
  const normalizedIdea = idea.value.trim()
  errorMessage.value = ''
  copyStatus.value = ''

  if (!isValidIdea(normalizedIdea)) {
    errorMessage.value = t.value.validationError
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
      throw new Error(payload.error ?? t.value.generationFallback)
    }

    result.value = payload.spec
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : t.value.generationFallback
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
    copyStatus.value = t.value.copySuccess(label)
  } catch {
    errorMessage.value = t.value.clipboardError
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
    <header class="top-bar">
      <div class="brand-lockup">
        <span class="brand-mark">SF</span>
        <div>
          <p class="eyebrow">SpecForge</p>
          <p class="brand-subtitle">{{ t.brandSubtitle }}</p>
        </div>
      </div>
      <div class="top-actions">
        <div class="top-meta" :aria-label="t.capabilitiesLabel">
          <span v-for="capability in t.capabilities" :key="capability">{{ capability }}</span>
        </div>
        <div class="language-toggle" :aria-label="t.languageLabel" role="group">
          <button
            type="button"
            :class="{ active: locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="setLocale('en')"
          >
            EN
          </button>
          <button
            type="button"
            :class="{ active: locale === 'zh' }"
            :aria-pressed="locale === 'zh'"
            @click="setLocale('zh')"
          >
            中文
          </button>
        </div>
      </div>
    </header>

    <section class="workspace-panel">
      <form class="input-panel" @submit.prevent="generateSpec">
        <div class="panel-header">
          <div>
            <p class="section-kicker">{{ t.workbench }}</p>
            <h1>{{ t.headline }}</h1>
            <p id="idea-hint" class="panel-caption">
              {{ t.ideaHint }}
            </p>
          </div>
          <label class="provider-select">
            <span>{{ t.model }}</span>
            <select v-model="providerId" @change="saveProviderSettings">
              <option v-for="provider in providers" :key="provider.id" :value="provider.id">
                {{ provider.label }}
              </option>
            </select>
          </label>
        </div>

        <div v-if="requiresAccessCode" class="access-row">
          <label for="access-code">{{ t.accessCode }}</label>
          <input
            id="access-code"
            v-model="accessCode"
            type="password"
            :placeholder="t.accessCodePlaceholder"
            autocomplete="off"
            @change="saveProviderSettings"
          />
        </div>

        <textarea
          id="idea"
          v-model="idea"
          aria-describedby="idea-hint idea-status"
          :placeholder="t.ideaPlaceholder"
          rows="8"
          @keydown.ctrl.enter.prevent="generateSpec"
          @keydown.meta.enter.prevent="generateSpec"
        />
        <div id="idea-status" class="textarea-footer">
          <span>{{ ideaCharacterCount }} {{ t.characters }}</span>
          <span>{{ t.shortcut }}</span>
        </div>
        <div class="example-row" :aria-label="t.examplesLabel">
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
            {{ isGenerating ? t.thinking : t.generate }}
          </button>
          <button
            class="secondary-button"
            type="button"
            :disabled="!idea.trim() || isGenerating"
            @click="generateSpec"
          >
            {{ t.retry }}
          </button>
        </div>
        <div class="status-region" role="status" aria-live="polite">
          <div v-if="isGenerating" class="loading-state">
            <span class="loading-dot"></span>
            <span>{{ t.loading }}</span>
          </div>
          <p v-if="errorMessage" class="status-message error">{{ errorMessage }}</p>
          <p v-else-if="copyStatus" class="status-message success">{{ copyStatus }}</p>
        </div>
      </form>

      <aside class="context-panel" aria-label="Output preview">
        <div class="context-header">
          <p class="section-kicker">{{ t.outputPreview }}</p>
          <span class="status-pill">{{ t.serverSideKeys }}</span>
        </div>
        <h2>{{ t.previewTitle }}</h2>
        <p>
          {{ t.previewBody }}
        </p>
        <div class="preview-steps">
          <span v-for="step in t.previewSteps" :key="step">{{ step }}</span>
        </div>
      </aside>
    </section>

    <section v-if="result" class="results-grid" aria-live="polite">
      <div class="result-summary">
        <div>
          <p class="section-kicker">{{ t.compiledContext }}</p>
          <h2>{{ t.readyToPaste }}</h2>
        </div>
        <div class="summary-counts">
          <span>{{ result.core_features.length }} {{ t.features }}</span>
          <span>{{ result.missing_logic.length }} {{ t.gaps }}</span>
          <span>{{ result.tasks.length }} {{ t.tasks }}</span>
        </div>
      </div>

      <article class="output-card wide">
        <div class="card-heading">
          <div>
            <p class="section-kicker">{{ t.structuredRequirements }}</p>
            <h2>{{ result.product_goal }}</h2>
          </div>
          <button class="copy-button" type="button" @click="copyText(t.markdownLabel, markdownSpec)">
            {{ t.copyMarkdown }}
          </button>
        </div>
        <div class="spec-columns">
          <section>
            <h3>{{ t.targetUsers }}</h3>
            <ul>
              <li v-for="user in result.target_users" :key="user">{{ user }}</li>
            </ul>
          </section>
          <section>
            <h3>{{ t.coreFeatures }}</h3>
            <ul>
              <li v-for="feature in result.core_features" :key="feature">{{ feature }}</li>
            </ul>
          </section>
          <section>
            <h3>{{ t.userFlow }}</h3>
            <ol>
              <li v-for="step in result.user_flow" :key="step">{{ step }}</li>
            </ol>
          </section>
          <section>
            <h3>{{ t.dataEntities }}</h3>
            <div class="tag-list">
              <span v-for="entity in result.data_entities" :key="entity">{{ entity }}</span>
            </div>
          </section>
        </div>
      </article>

      <article class="output-card">
        <p class="section-kicker">{{ t.missingLogicDetection }}</p>
        <h2>{{ t.auditBeforeCode }}</h2>
        <ul class="dense-list">
          <li v-for="item in result.missing_logic" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="output-card">
        <p class="section-kicker">{{ t.architectureSuggestions }}</p>
        <h2>{{ t.starterDirection }}</h2>
        <ul class="dense-list">
          <li v-for="item in result.architecture_suggestions" :key="item">{{ item }}</li>
        </ul>
      </article>

      <article class="output-card">
        <p class="section-kicker">{{ t.taskBreakdown }}</p>
        <h2>{{ t.dependencyAwareOrder }}</h2>
        <ol class="dense-list">
          <li v-for="task in result.tasks" :key="task">{{ task }}</li>
        </ol>
      </article>

      <article class="output-card prompt-card">
        <div class="card-heading">
          <div>
            <p class="section-kicker">{{ t.claudeContextPack }}</p>
            <h2>{{ t.implementationPrompt }}</h2>
          </div>
          <div class="copy-group">
            <button class="copy-button" type="button" @click="copyText(t.promptLabel, contextPack)">
              {{ t.copyPrompt }}
            </button>
            <button class="copy-button" type="button" @click="copyText(t.jsonLabel, resultJson)">
              {{ t.copyJson }}
            </button>
          </div>
        </div>
        <pre>{{ contextPack }}</pre>
      </article>
    </section>
  </main>
</template>
