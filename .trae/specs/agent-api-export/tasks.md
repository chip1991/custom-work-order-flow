# Tasks

- [x] Task 1: 数据库与鉴权基础建设
  - [x] SubTask 1.1: 在 `backend/prisma/schema.prisma` 中新增 `ApiKey` 模型，用于存储外部调用的凭证（`id`, `key`, `name`, `createdAt`, `updatedAt`）。
  - [x] SubTask 1.2: 执行 `npx prisma db push` 更新数据库。
  - [x] SubTask 1.3: 新建 `backend/routes/api-keys.js`，实现 API Key 的生成和列表获取功能，并在 `server.js` 注册。

- [x] Task 2: 开放网关与执行引擎适配
  - [x] SubTask 2.1: 新建 `backend/routes/v1-chat.js`，并暴露 `POST /api/v1/chat/completions` 接口，要求其格式兼容 OpenAI（即请求体需包含 `model`、`messages` 和 `stream`）。
  - [x] SubTask 2.2: 在该路由中添加中间件，解析并验证 `Authorization: Bearer <API_KEY>`。
  - [x] SubTask 2.3: 提取请求体中的 `model` 字段作为 `Agent ID` 去数据库查询，若查到对应的 Agent，则将其 `systemPrompt` 插入到 `messages` 最前面。若未查到，抛出 404。
  - [x] SubTask 2.4: 在 `server.js` 中注册 `/api/v1/chat` 路由。

- [x] Task 3: 前端 API Key 管理 (可选/基础版)
  - [x] SubTask 3.1: 在前端设置页或单独的页面（如 `/settings/api-keys`）提供生成和管理 API Key 的简单界面（暂不作为重点，先确保后端功能可用，可简单实现或延后）。

- [x] Task 4: 前端 API 接入展示
  - [x] SubTask 4.1: 新建 `frontend/src/pages/Agents/components/ApiIntegrationModal.tsx` 组件。该组件接受 `agentId` 和 `agentName`，展示一个使用 `cURL` 或 `Python` 语言的调用代码片段，代码中的 `model` 字段替换为传入的 `agentId`。
  - [x] SubTask 4.2: 在 `frontend/src/pages/Agents/index.tsx` 的智能体卡片（或操作栏）中添加“API 接入”按钮（使用如 `Code` 或 `Link` 图标）。点击该按钮时，弹出上述的模态框，供用户一键复制调用代码。

# Task Dependencies
- Task 2 depends on Task 1
- Task 4 depends on Task 2