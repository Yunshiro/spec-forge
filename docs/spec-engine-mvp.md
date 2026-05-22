**AI Spec Engine — MVP Requirements Doc (Codex Ready)**

版本：v0.1 MVP
目标：供  OpenAI Codex / Claude Code / Cursor 等 AI coding agent 直接执行开发任务。
产品定位：

将模糊产品想法转换为结构化 AI coding context。

不是 PRD 工具。
不是文档编辑器。
不是项目管理工具。

核心是：

**“AI Coding Context Compiler”**



**1. Product Goal**

构建一个 Web App。

用户输入一句自然语言产品想法：

I want to build a simple AI note taking app

系统自动输出：

- Structured Requirements
- Missing Logic Detection
- Architecture Suggestions
- Task Breakdown
- Claude-ready Context Pack

目标：

让 Claude/Codex/Cursor 能更稳定地产生高质量代码。



**2. Target User**

**Primary Users**

**AI Coding Users**

使用：

- Claude
- Cursor
- Visual Studio Code
- OpenAI Codex CLI

的人群。



**User Characteristics**

- 独立开发者
- vibe coders
- AI-assisted programmers
- 不擅长系统化拆需求
- 经常遇到：

- AI hallucination
- context drift
- requirement missing
- project chaos



**3. MVP Scope**



**MUST HAVE**

**Input Idea**

用户输入产品想法。



**Requirement Structuring**

AI 自动生成：

- Product Goal
- User Roles
- Core Features
- User Flow
- Data Entities
- Non-functional Requirements



**Missing Logic Detection**

AI 自动发现：

- Missing auth flow
- Missing edge cases
- Missing state handling
- Missing error handling
- Missing permission logic



**Claude Context Pack**

生成：

**“Claude-ready implementation context”**

支持一键复制。



**Task Breakdown**

输出：

- MVP implementation steps
- coding order
- feature dependencies



**NOT IN MVP**

以下全部禁止：

- Team collaboration
- User accounts
- Billing
- Visual graph editor
- AI memory system
- Multi-project management
- Real-time sync
- Plugin ecosystem
- Multi-model orchestration



**4. Core User Flow**

User Input Idea

↓

Generate Structured Spec

↓

Generate Missing Logic Audit

↓

Generate Claude Context Pack

↓

Copy / Export



**5. Functional Requirements**



**5.1 Input Module**

**Description**

用户输入自然语言产品描述。



**UI**

**Components**

- textarea
- generate button



**Example Placeholder**

Describe your product idea...



Example:

Build an AI screenshot annotation tool for macOS.



**5.2 Requirement Structuring Engine**

**Description**

调用 Claude API。

将模糊描述转换为结构化 spec。



**Output Schema**

{

"product_goal": "",

"target_users": [],

"core_features": [],

"user_flow": [],

"data_entities": [],

"non_functional_requirements": []

}



**Requirements**

输出必须：

- concise
- implementation-oriented
- no fluff
- MVP-first



**5.3 Missing Logic Detection**

**Description**

分析 requirement。

自动检测遗漏。



**Example Output**

{

"missing_logic": [

"Authentication flow missing",

"Error state handling missing",

"Data persistence strategy undefined",

"Permission model undefined"

]

}



**Goal**

减少 AI coding 过程中的：

- ambiguity
- hallucination
- implementation drift



**5.4 Claude Context Pack Generator**

**Description**

生成：

**Claude-ready implementation prompt**



**Output Format**

You are a senior software engineer.



Build the following MVP application.



Project Goal:

...



Core Features:

...



User Flow:

...



Data Entities:

...



Missing Logic Considerations:

...



Constraints:

\- Keep implementation minimal

\- Avoid overengineering

\- Prioritize shipping speed



Task:

Generate implementation steps and starter architecture.



**Features**

**Copy Button**

支持：

- copy full prompt
- copy markdown
- copy JSON



**5.5 Task Breakdown Engine**

**Description**

自动拆解开发任务。



**Example Output**

{

"tasks": [

"Initialize frontend project",

"Setup API route",

"Implement spec generation",

"Implement missing logic audit",

"Build output UI"

]

}



**Constraints**

任务必须：

- ordered
- dependency-aware
- MVP-oriented



**6. Technical Requirements**



**Frontend**

**Stack**

- Vue3
- Vite
- TailwindCSS



**Requirements**

- single-page app
- responsive
- dark mode default
- keyboard friendly



**Backend**

**Stack**

推荐：

- Hono
  or
- Nitro



**Endpoint**

POST /api/generate-spec



**AI Provider**

**Primary**

- Claude API

MVP ONLY SUPPORTS CLAUDE.



**Storage**

MVP:

- no database required

可选：

- localStorage only



**7. Prompt Engineering**



**System Prompt**

You are an expert software architect and AI coding workflow designer.



Your task is to transform vague software ideas into:

1. structured requirements
2. missing logic analysis
3. implementation-ready AI coding context



Focus on:

\- clarity

\- implementation practicality

\- MVP-first thinking

\- reducing ambiguity for AI coding agents



**Prompt Pipeline**

**Step 1**

Generate structured requirements.



**Step 2**

Audit missing logic.



**Step 3**

Generate Claude context pack.



**8. UX Requirements**



**Core UX Principle**

**“Fast in, fast out”**

用户应该：

- 30秒内得到结果
- 不需要 onboarding
- 不需要 setup



**UI Style**

推荐：

- dark
- minimal
- developer aesthetic
- terminal-inspired



**9. Performance Requirements**



**Response Time**

目标：

- <15 seconds



**Failure Handling**

必须：

- graceful API error
- retry support
- loading state



**10. Success Metrics**



**MVP Validation Goals**

| **Metric**               | **Target** |
| ------------------------ | ---------- |
| Generate Completion Rate | >70%       |
| Copy Context Pack Rate   | >40%       |
| Return Usage             | >20%       |
| Paid Interest            | >1%        |



**11. Biggest Risks**



**Risk 1**

Users think:

“I can do this directly in Claude.”



**Mitigation**

强调：

- structure
- audit
- implementation stability

而不是：
“AI生成”。



**Risk 2**

Low frequency usage.



**Mitigation**

定位：

- project kickoff
- feature planning
- architecture iteration



**Risk 3**

Claude/Cursor eventually absorbs features.



**Mitigation**

长期方向：

- dependency intelligence
- requirement evolution
- context governance



**12. Future Roadmap (NOT MVP)**



**Phase 2**

- project memory
- spec evolution
- repo analysis
- Cursor extension
- Codex integration



**Phase 3**

- multi-agent workflow
- architecture graph
- AI governance layer



**13. Final Product Positioning**

AI Spec Engine is a context compiler for AI software development.



**14. Codex Execution Notes**

适用于：

- OpenAI Codex
- Codex CLI
- Claude Code
- Cursor Agent workflows

建议：

- repository-first development
- markdown-based outputs
- modular prompt pipeline
- agent-readable JSON structures



**15. Recommended Repository Structure**

/apps

/web



/packages

/prompt-engine

/spec-parser

/context-generator



/api

generate-spec.ts



**16. MVP Development Priority**

**Week 1**

- input UI
- Claude API integration
- requirement generation



**Week 2**

- missing logic audit
- context pack
- copy/export



**Week 3**

- polish UI
- launch demo
- X/GitHub distribution



**17. Launch Strategy**

**Core Message**

不要说：

❌ “AI PRD generator”

要说：

**✅** **“Turn messy ideas into Claude-ready coding context.”**



**Demo Strategy**

Before:

Build a task app

After:

Structured AI implementation context

\+ edge case analysis

\+ architecture hints

\+ implementation tasks



**18. Final Reality Reminder**

这个产品真正卖的不是：

- 文档
- prompt
- AI生成

而是：

**“减少 AI coding chaos。”**

 