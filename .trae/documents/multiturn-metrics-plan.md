# 多轮对话各轮次独立响应时间与完成时间改造计划

## 1. 摘要
用户希望在多轮对话中，大模型的“每一轮”回答都能独立展示其“首字响应时间”和“本轮总耗时”，而不是仅仅在整个题目最下方展示一个总时间。本计划将通过修改后端上下文存储结构、增加 SSE 回合完成事件，以及调整前端气泡渲染逻辑来实现该目标。

## 2. 当前状态分析
- **后端 (`engine.js`)**：目前大模型每轮回答结束后，仅将 `{ role: 'assistant', content: '...' }` 存入 `fullHistory`。每轮的 `timeTaken` 被累加为 `totalTimeTaken`，并在整题结束后统一落库到 `TaskResult` 表中。
- **前端 (`Detail.tsx`)**：在渲染时，前端依赖 `TaskResult` 表级别的 `timeTaken` 和 `firstTokenTime`，将其统一渲染在整个题目（所有气泡）的最下方。

## 3. 改造方案与具体修改文件

### 3.1 后端：在 `fullHistory` 中存储并广播单轮指标
**文件**：`backend/services/engine.js`
- **What & How**：
  1. 在大模型单轮调用（`runEvaluationStream`）完成后，向 `fullHistory` 存入 assistant 消息时，额外追加两个字段：
     ```javascript
     fullHistory.push({ 
       role: 'assistant', 
       content: res.fullResponse,
       timeTaken: res.timeTaken,
       firstTokenTime: res.firstTokenTime
     });
     ```
  2. 新增一个 SSE 广播事件 `turn_completed`，在单轮请求完成后立即将本轮的耗时指标推送给前端：
     ```javascript
     this.broadcast(taskId, {
       type: 'turn_completed',
       resultId: result.id,
       timeTaken: res.timeTaken,
       firstTokenTime: res.firstTokenTime
     });
     ```
  3. 保留原有的 `totalTimeTaken` 累加逻辑，以确保数据库 `TaskResult` 维度的宏观统计依然正确。

### 3.2 前端：支持单轮指标的状态更新与 UI 渲染
**文件**：`frontend/src/pages/Evaluations/Detail.tsx`
- **What & How**：
  1. **更新接口定义**：在 `Message` 接口中增加可选的 `timeTaken?: number` 和 `firstTokenTime?: number`。
  2. **监听 SSE 事件**：在 `handleSSEEvent` 中增加 `case 'turn_completed':`。当收到该事件时，找到 `result.messages` 数组中的最后一条（即当前的 `assistant` 回复），并将 `timeTaken` 和 `firstTokenTime` 赋值给它。
  3. **调整 UI 渲染位置**：
     - 删除原先位于 `displayMessages.map` 循环外底部的 `<Zap>` 和 `<Clock>` 指标渲染代码。
     - 在 `displayMessages.map` 循环内部，在渲染 `msg.role === 'assistant'` 气泡的下方，紧接着判断并渲染该条 `msg` 专属的 `<Zap>` 和 `<Clock>` 指标。

## 4. 假设与决策
- **数据兼容性**：由于前端采用可选字段 (`?:`) 且使用了容错渲染，旧的评测历史记录即便没有按轮次保存时间指标，也不会导致页面崩溃，只是不显示时间标签。
- **SSE 实时性**：增加 `turn_completed` 使得前端不需要等到整个题目（可能包含多轮）全部跑完才能看到每一轮的时间，提升了实时反馈体验。

## 5. 验证步骤
1. 修改完代码后，执行前端构建并重启前后端服务。
2. 进入测评中心，新建一个包含至少 2 轮 User 提问的多轮对话任务并启动。
3. 观察测评详情页：
   - 确认大模型第一轮回答结束后，该回答气泡的左下方立刻出现了本轮的首字响应时间和总耗时。
   - 确认第二轮回答结束后，第二轮气泡下方也出现了独立的时间指标。
4. 刷新页面，确认从数据库读取 JSON 历史记录后，各轮的时间指标依然正确回显。