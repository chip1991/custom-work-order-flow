# Tasks

- [x] Task 1: 数据库改造与后端 API 建设
  - [x] SubTask 1.1: 在 `backend/prisma/schema.prisma` 中新增 `Agent` 模型（包含 `id`, `name`, `description`, `modelId`, `systemPrompt`, `tools`, `createdAt`, `updatedAt`），并与 `Model` 表建立关联。
  - [x] SubTask 1.2: 运行 `npx prisma db push` 更新数据库。
  - [x] SubTask 1.3: 编写 `backend/routes/agents.js`，实现智能体的增删改查 (CRUD) 接口。
  - [x] SubTask 1.4: 在 `backend/server.js` 中注册 `/api/agents` 路由。

- [ ] Task 2: 前端基础建设
  - [ ] SubTask 2.1: 编写 `frontend/src/api/agents.ts` 封装与后端的交互请求。
  - [ ] SubTask 2.2: 在 `frontend/src/components/Layout.tsx` 的侧边栏导航中新增“智能体中心”菜单项。
  - [ ] SubTask 2.3: 在 `frontend/src/App.tsx` 中注册 `/agents` 路由。

- [ ] Task 3: 前端页面建设
  - [ ] SubTask 3.1: 开发 `frontend/src/pages/Agents.tsx` (智能体列表页)，展示已有智能体及其绑定的基础模型。
  - [ ] SubTask 3.2: 开发 `frontend/src/components/AgentModal.tsx` (编辑/创建弹窗)，包含选择底座模型（下拉框）、配置 System Prompt 等表单字段。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2