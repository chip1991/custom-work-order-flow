# Tasks

- [x] Task 1: 数据库层扩展
  - [x] SubTask 1.1: 在 `backend/prisma/schema.prisma` 中的 `ApiKey` 模型里新增 `totalTokensUsed Int @default(0)` 字段。
  - [x] SubTask 1.2: 执行 `npx prisma db push` 更新数据库。
  - [x] SubTask 1.3: 更新 `backend/routes/api-keys.js` 的 GET 接口，返回包含 `totalTokensUsed` 的数据。

- [x] Task 2: 引擎层 (`engine.js`) 改造
  - [x] SubTask 2.1: 在 `runEvaluationStream` 等发起调用的地方，若 `stream` 为 true，追加 `stream_options: { include_usage: true }` 参数。
  - [x] SubTask 2.2: 在解析流的 `for await (const chunk of stream)` 循环中，判断并拦截带有 `chunk.usage` 的数据包，提取 `total_tokens`。
  - [x] SubTask 2.3: 在任务结束后，将提取到的 `total_tokens` 通过 `prisma.taskResult.update` 写入现有的 `tokensUsed` 字段中。

- [x] Task 3: 开放网关层 (`v1-chat.js`) 改造
  - [x] SubTask 3.1: 在 `/api/v1/chat/completions` 中同样追加 `stream_options: { include_usage: true }`（当 stream 为 true 时）。
  - [x] SubTask 3.2: 拦截流式数据的结尾或非流式的返回值，提取 `usage.total_tokens`。
  - [x] SubTask 3.3: 提取到数值后，异步调用 Prisma 将其累加到当前请求使用的 `ApiKey.totalTokensUsed` 字段中（例如：`prisma.apiKey.update({ data: { totalTokensUsed: { increment: tokens } } })`）。

- [x] Task 4: 前端展示优化
  - [x] SubTask 4.1: 修改 `frontend/src/pages/ApiKeys/index.tsx`，在列表中新增一列“已用 Tokens”，显示 `totalTokensUsed`。
  - [x] SubTask 4.2: 修改 `frontend/src/pages/Evaluations/Detail.tsx`，在显示耗时的旁边，展示当前回合或整体任务消耗的 Tokens 数量。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 1
- Task 4 depends on Task 1, 2, 3