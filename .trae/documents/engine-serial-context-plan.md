# 测评引擎串行与连续对话改造计划

## 摘要
本计划旨在对后端测评执行引擎（`backend/services/engine.js`）进行重构。根据用户需求，将目前“所有模型和题目一次性并发执行”的逻辑，改造为**“按题目串行执行，题目间强制等待 10 秒”**；同时，将题目之间原本独立的对话，改造为**“针对每个模型独立维护上下文的连续多轮对话”**。本次改造仅涉及后端引擎代码，不修改数据库结构和前端页面。

## 当前状态分析
- **并发逻辑**：在 `startTask` 方法中，当前逻辑是通过双重循环生成所有 `(Model, Question)` 的组合数组，然后使用 `Promise.allSettled(promises)` 一次性将所有请求并发发送给大模型。
- **对话上下文**：在 `runEvaluation` 方法中，每次请求大模型时，只读取当前这道题的 `messages` 发送，大模型的回复仅存入数据库，并没有反向拼接回上下文中传递给下一题。这导致各个题目之间是完全独立的。

## 拟议变更 (Proposed Changes)

### 修改文件：`backend/services/engine.js`

#### 1. 改造 `startTask` 方法 (串行执行与上下文维护)
- **初始化专属记忆 (Memory)**：在遍历题目之前，创建一个 `Map`（如 `modelHistories`），为当前任务选中的每一个模型初始化一个空的数组 `[]`，用于存储该模型在整个任务过程中的对话历史。
- **外层串行循环**：使用常规的 `for` 循环遍历 `task.questions`。
- **内层并发执行**：在当前题目的循环内，遍历 `task.models`。
  - 从 `modelHistories` 取出该模型的历史记录。
  - 提取当前题目的 `messages`（提问）。
  - 将 **历史记录 + 当前提问** 合并为一个完整的上下文数组 `fullMessages`。
  - 将 `fullMessages` 作为新参数传递给 `runEvaluation`。
- **收集与保存回复**：修改内部逻辑，使得 `runEvaluation` 在执行完毕后能返回大模型的最终回复字符串。将 **当前提问 + 大模型的回复 (role: 'assistant')** 追加到该模型的 `modelHistories` 中。
- **等待 10 秒**：在当前题目的所有模型执行完毕（`await Promise.allSettled`）后，如果不是最后一道题，则使用 `await new Promise(resolve => setTimeout(resolve, 10000))` 强制休眠 10 秒。

#### 2. 改造 `runEvaluation` 方法 (接收外部上下文)
- **修改方法签名**：增加一个参数 `customMessages`，即 `async runEvaluation(taskId, combo, customMessages)`。
- **使用合并后的上下文**：在调用 OpenAI 接口时，不再从 `combo.question.messages` 中重新映射，而是直接使用传入的 `customMessages`：
  ```javascript
  const messages = customMessages || question.messages.map(m => ({ role: m.role, content: m.content }));
  ```
- **返回最终结果**：在流式接收完成并更新数据库（`status: 'success'`）后，增加 `return fullResponse;`，以便 `startTask` 能够拿到大模型的回答并追加到历史记录中。如果发生错误（catch 块），则 `return null;`。

## 假设与决策 (Assumptions & Decisions)
- **错误阻断策略**：如果某个模型在第 N 题回答失败（返回 `null`），为了防止后续题目的上下文错乱，我们在 `startTask` 拼接历史记录时，可以选择不把失败的轮次加入历史，或者仅追加 User 的提问。本计划倾向于：**如果回复失败，则不更新该模型的历史记录**，下一题依然基于上一次成功的历史继续提问。
- **前端无感知**：虽然底层的请求变成了串行且带上下文的，但前端 `Detail.tsx` 是通过 SSE 监听独立 `resultId` 的更新的。因此前端页面在展示时，依然会一道题一道题地自动渲染出结果，不需要任何修改。

## 验证步骤 (Verification)
1. 重启后端服务。
2. 在前端创建一个包含至少 2 个题目和 2 个模型的测评任务。
3. 观察后端控制台或前端详情页：
   - 验证第 1 题的两个模型是否同时开始输出。
   - 验证第 1 题输出完毕后，是否出现了大约 10 秒的停顿。
   - 验证 10 秒后，第 2 题是否开始输出。
4. 检查第 2 题大模型的回复内容，看它是否“记得”第 1 题中提到的概念或设定，以确认连续对话上下文传递成功。