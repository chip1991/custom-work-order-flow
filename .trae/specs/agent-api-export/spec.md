# Agent API 开放 (Agent API Export) Spec

## Why
目前平台上的 Agent 仅能通过内部管理界面进行配置，无法直接输出给外部使用。为了让平台具备 BaaS (Backend as a Service) 的商业价值，我们需要为每个 Agent 提供标准的开放 API（兼容 OpenAI 协议），允许第三方系统（如企业微信、独立App）通过 API 接口直接对接调用。

## What Changes
- **后端架构**：
  - 新增 API 密钥（ApiKey）数据库表，用于颁发和管理开发者的调用凭证。
  - 新增专门面向第三方调用的开放路由网关（如 `/api/v1/chat/completions`）。
  - 实现基于 `Authorization: Bearer <API_KEY>` 的请求鉴权中间件。
  - 核心执行逻辑复用或提取 `engine.js`，使第三方请求能够加载指定的 Agent 及其系统指令、参数等。
- **前端交互**：
  - 在 Agent 列表页或详情页增加一个“API 接入”按钮。
  - 点击按钮弹出一个抽屉或模态框，展示对应 Agent 的唯一 ID（即 `model` 参数），并提供一段现成的调用示例代码（如 cURL），方便开发者一键复制。

## Impact
- Affected specs: 智能体管理功能。
- Affected code:
  - `backend/prisma/schema.prisma`
  - `backend/routes/api-keys.js` (新建)
  - `backend/routes/v1-chat.js` (新建)
  - `backend/server.js`
  - `frontend/src/pages/Agents/index.tsx`
  - `frontend/src/pages/Agents/components/ApiIntegrationModal.tsx` (新建)

## ADDED Requirements
### Requirement: 生成并展示 Agent 调用 API
系统应当为每个 Agent 提供符合 OpenAI 接口规范的调用方式，并向用户展示包含代码片段的接入文档。

#### Scenario: Success case
- **WHEN** 用户在智能体管理列表，点击某个 Agent 的“API 接入”按钮。
- **THEN** 系统弹出包含 cURL 示例代码的面板，该代码中包含系统的 API Base URL 和当前 Agent 的 ID，且用户复制该代码带上自己的 API Key 后可以在终端直接发起调用。