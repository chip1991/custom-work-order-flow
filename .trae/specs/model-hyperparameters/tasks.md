# Tasks

- [x] Task 1: 数据库与后端模型接口改造
  - [x] SubTask 1.1: 更新 `backend/prisma/schema.prisma`，在 `Model` 中增加 `temperature` (Float?), `topP` (Float?), `maxTokens` (Int?) 字段。
  - [x] SubTask 1.2: 执行 `npx prisma db push` 更新数据库。
  - [x] SubTask 1.3: 更新 `backend/routes/models.js`，在 POST 和 PUT 接口中接收并保存 `temperature`, `topP`, `maxTokens`。

- [x] Task 2: 执行引擎接入超参数
  - [x] SubTask 2.1: 更新 `backend/services/engine.js` 的 `runEvaluationStream` 方法，将模型配置中的超参数传递给 `openai.chat.completions.create`。

- [x] Task 3: 前端模型管理界面更新
  - [x] SubTask 3.1: 更新 `frontend/src/lib/api.ts` 中的 `Model` 接口定义，补充新字段。
  - [x] SubTask 3.2: 更新 `frontend/src/components/ModelModal.tsx`，增加 `Temperature` (0-2), `Top-P` (0-1), `Max Tokens` 的输入表单，并完善表单状态和回显逻辑。
  - [x] SubTask 3.3: 更新 `frontend/src/pages/Models.tsx`，在列表卡片和表格中展示参数配置概览（如 `Temp: 0.7 | TopP: 1 | Max: 2048`）。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1