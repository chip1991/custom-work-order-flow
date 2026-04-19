# 智能体中心 (Agent Center) Spec

## Why
目前大模型评测平台只支持基础的大语言模型（Model）。为了评测具备"系统指令"和"工具调用"能力的高阶实体，我们需要引入"智能体"（Agent）的概念，将其作为独立实体进行配置和评测。这将使平台从单纯的模型能力评测扩展到应用级的 Agent 评测。

## What Changes
- 新增 `Agent` 数据库表，包含名称、描述、关联的底座模型、系统提示词（systemPrompt）、可用工具（tools）等字段。
- 新增后端 `agents` 路由，提供智能体的 CRUD 接口。
- 新增前端“智能体中心”页面及侧边栏导航，支持创建和管理智能体。
- 改造核心执行引擎 (`engine.js`)，支持在发起对话前预先注入智能体的 `systemPrompt` 作为系统指令，并保留后续接入 Function Calling 的基础结构。

## Impact
- Affected specs: 模型管理、任务创建、测评引擎执行。
- Affected code:
  - `backend/prisma/schema.prisma`
  - `backend/routes/agents.js` (新建)
  - `backend/server.js`
  - `backend/services/engine.js`
  - `frontend/src/App.tsx`
  - `frontend/src/components/Layout.tsx`
  - `frontend/src/pages/Agents.tsx` (新建)
  - `frontend/src/components/AgentModal.tsx` (新建)
  - `frontend/src/api/agents.ts` (新建)

## ADDED Requirements
### Requirement: 智能体创建与管理
系统应当允许用户基于现有的大语言模型，创建自定义的智能体，配置名称、系统提示词和工具列表。

#### Scenario: Success case
- **WHEN** 用户在“智能体中心”填写名称、选择底座模型并配置系统提示词后保存。
- **THEN** 数据库应正确记录该智能体，并在智能体列表中展示其信息。

### Requirement: 智能体评测执行支持
执行引擎在调用模型接口时，需要判断当前调用的是基础大模型还是智能体。如果是智能体，必须能够正确注入其系统指令。