# Token Usage Tracking Spec

## Why
目前平台调用大模型（内部测评和外部 API 调用）时，没有对消耗的 Token 数量进行统计。为了后续的精细化运营、成本控制以及对外部调用进行计费或额度限制，需要引入全局的 Token 用量统计能力。

## What Changes
- **执行引擎改造 (`engine.js`)**：在调用 OpenAI 兼容接口时，增加 `stream_options: { include_usage: true }` 参数，并在解析流式返回结果时拦截最后的 `usage` 统计块。
- **开放 API 改造 (`v1-chat.js`)**：同理开启 `include_usage: true`，并在网关层提取流式或非流式的 `usage` 数据。
- **数据库落地**：
  - **内部测评**：利用现有的 `TaskResult.tokensUsed` 字段，将引擎统计到的消耗写入。
  - **外部 API**：在 `ApiKey` 模型中新增 `totalTokensUsed` 字段用于累加该 Key 消耗的总 Token 数。
- **前端展示**：
  - 在测评详情页（`Evaluations/Detail.tsx`）展示每一轮对话或最终结果消耗的 Tokens 数量。
  - 在 API Keys 列表页展示每个 Key 的累计消耗量。

## Impact
- Affected specs: 智能体管理功能、测评功能。
- Affected code:
  - `backend/prisma/schema.prisma`
  - `backend/services/engine.js`
  - `backend/routes/v1-chat.js`
  - `frontend/src/pages/Evaluations/Detail.tsx`
  - `frontend/src/pages/ApiKeys/index.tsx`

## ADDED Requirements
### Requirement: 大模型 Token 统计与记录
系统 SHALL 在大模型调用结束后，正确提取并存储本次交互所消耗的 Token 数量（包含流式与非流式调用）。

#### Scenario: Success case
- **WHEN** 平台内部执行测评任务，或者第三方通过 API Key 成功调用接口时
- **THEN** 后台能够从大模型返回值中解析出 `usage.total_tokens`，并将其记录到数据库中，前端可在对应的页面查看该统计数据。