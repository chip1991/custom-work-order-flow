# 测评详情页“题目上下文”展示区改造计划

## 摘要
为解决大模型测评详情页中“只能看到大模型最终回复，看不到预设的测试题目/多轮对话”的问题，计划在 `frontend/src/pages/Evaluations/Detail.tsx` 的结果矩阵区域上方，新增一个“题目上下文（Context）”展示区。该区域将以气泡对话（Chat Bubbles）的形式渲染当前选中题目的 `messages` 数组，让用户在对比大模型回复时能够清晰地看到原始的测试输入。

## 当前状态分析
- **前端页面 (`Detail.tsx`)**：目前右侧主体区域的顶部仅展示了当前选中的题目名称，下方直接渲染各个大模型的横向对比卡片，完全没有渲染题目的预设多轮对话（`messages`）。
- **数据结构**：根据 `src/api/questions.ts`，每个题目对象（`Question`）中已经包含了一个 `messages` 数组，其子项结构为 `{ role: 'system' | 'user' | 'assistant', content: string }`。这意味着前端无需额外请求，直接使用现有的 `task.questions` 数据即可完成渲染。

## 拟议变更 (Proposed Changes)

### 修改文件：`frontend/src/pages/Evaluations/Detail.tsx`

1. **引入相关图标与状态**
   - 引入 `MessageSquare`, `ChevronDown`, `ChevronUp` 等 Lucide 图标。
   - 新增一个局部状态 `const [isContextExpanded, setIsContextExpanded] = useState(false);`，用于控制上下文区域的折叠/展开，避免多轮对话过长时挤压下方的大模型对比矩阵。

2. **获取当前题目的对话数据**
   - 在组件内部通过 `activeQuestionId` 获取当前选中的题目对象：
     ```typescript
     const activeQuestion = task.questions?.find(q => q.id === activeQuestionId);
     const messages = activeQuestion?.messages || [];
     ```

3. **插入“题目上下文”展示区 UI**
   - 在右侧“结果矩阵 (Results Matrix)”的标题栏（`h2` 标签所在位置）下方插入该区域。
   - **折叠面板头部 (Header)**：
     - 添加一个可点击的行，显示“查看题目上下文 (共 X 轮对话)”，右侧带有上下箭头图标。点击可切换 `isContextExpanded` 状态。
   - **对话气泡内容区 (Expanded Content)**：
     - 当 `isContextExpanded` 为 `true` 时，渲染一个带有内边距和背景色（如 `bg-gray-50`）的容器，设置 `max-h-64 overflow-y-auto` 以防内容过长。
     - 遍历 `messages` 数组，根据 `role` 渲染不同样式的气泡：
       - **System**: 灰色小字，居中或横向平铺，表示系统级设定。
       - **User**: 蓝色背景白字气泡，靠右对齐（模拟用户发送）。
       - **Assistant**: 白色背景黑字气泡带边框，靠左对齐（模拟 AI 历史回复）。
     - 文本内容使用 `whitespace-pre-wrap` 保留换行格式。

## 假设与决策 (Assumptions & Decisions)
- **折叠面板默认状态**：为了不破坏现有页面的第一视觉体验（直接看到大模型结果对比），上下文区域默认设为**折叠状态 (`false`)**。用户需要主动点击才能查看题目细节。
- **气泡样式参考**：气泡样式将采用类似微信或常规 Chat UI 的设计（User 居右，Assistant 居左），这能最直观地传达“多轮对话”的概念。
- **无破坏性修改**：本次改造仅涉及 UI 的增加，不修改任何核心的状态流转、SSE 接收机制或现有的横向对比矩阵逻辑。

## 验证步骤 (Verification)
1. 启动前端开发服务器。
2. 进入任意一个包含多轮对话（有 System、User、Assistant 角色）的测评任务详情页。
3. 检查右侧标题栏下方是否出现了“查看题目上下文”的折叠按钮。
4. 点击展开，验证 System、User 和 Assistant 的气泡是否按照设定的颜色和左右对齐方式正确渲染，且内容换行正常。
5. 切换左侧的不同题目，验证上下文内容是否能跟随当前激活的题目动态更新。
6. 检查整体页面布局（特别是下方的大模型对比矩阵）是否在上下文展开/折叠时发生错乱。