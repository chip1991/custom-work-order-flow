# 测评中心 UI 重做计划

## 摘要
本计划旨在对大模型测评平台前端的“测评中心”（`Evaluations` 目录下的 `List.tsx`, `Create.tsx`, `Detail.tsx`）进行彻底的 UI 重构。目标是将其视觉风格、色彩规范和交互组件与“模型中心”(`Models.tsx`) 保持高度一致，以提升全站的用户体验和设计统一性。

## 当前状态分析
- **色彩不一致**：测评中心目前的主题色为靛蓝色（`indigo-600`，如按钮、Focus 边框、状态图标），而模型中心和题库中心的主题色为蓝色（`blue-600`）。
- **组件样式差异**：
  - 测评中心的按钮、输入框的 Focus 光圈（`ring-indigo-500`）与模型中心（`ring-blue-500`）不同。
  - 加载动画（Loading Spinner）的颜色和粗细不统一。
  - 空状态（Empty State）的图标颜色和排版细节存在细微差别。
- **页面布局细节**：虽然之前已经做过基础的响应式改造，但某些边距、圆角、分割线（如 `divide-y`）的使用方式与 `Models.tsx` 的标准模板不完全对齐。

## 拟议变更 (Proposed Changes)

### 1. 全局色彩替换 (Color Palette Sync)
将 `Evaluations` 目录下所有组件中的 `indigo` 颜色类替换为对应的 `blue` 颜色类，使其与 `Models.tsx` 保持一致。
- `text-indigo-600` -> `text-blue-600`
- `bg-indigo-600` -> `bg-blue-600`
- `ring-indigo-500` -> `ring-blue-500`
- `border-indigo-500` -> `border-blue-500`
- `text-indigo-700`, `bg-indigo-50`, `bg-indigo-100` 等依此类推。

### 2. 测评任务列表页 (`Evaluations/List.tsx`)
- **头部与工具栏**：
  - 确保页面标题旁的 `<ListIcon>` 颜色改为 `text-blue-600`。
  - 统一“创建测评”按钮样式为 `bg-blue-600 hover:bg-blue-700 focus:ring-blue-100`。
  - 搜索框的 focus 状态统一为 `focus:ring-blue-500 focus:border-blue-500`。
- **加载与空状态**：
  - 将 Loading Spinner 的样式调整为 `border-blue-200 border-t-blue-600`，与 `Models.tsx` 完全一致。
  - 调整空状态的图标颜色和文字间距。
- **操作按钮**：
  - 列表右侧的“详情”按钮，将 `text-indigo-600` 改为 `text-blue-600 hover:text-blue-900`。

### 3. 创建测评任务页 (`Evaluations/Create.tsx`)
- **表单控件**：
  - 任务名称输入框的 focus 状态改为蓝色系。
  - 模型和题目选择列表中的 Checkbox 颜色由 `text-indigo-600` 改为 `text-blue-600`。
  - 选择区标题旁的图标（`<Cpu>`, `<HelpCircle>`）及“全选”按钮文本颜色改为蓝色系。
- **底部操作区**：
  - “保存并开始测评”按钮及 Loading 状态的颜色统一为蓝色系。

### 4. 测评详情与对比页 (`Evaluations/Detail.tsx`)
- **状态徽章 (Status Badges)**：
  - 虽然“已完成”、“运行中”、“失败”的红绿蓝基础语意色保持不变，但要检查 `running` 状态的徽章是否使用了标准的 `blue` 类。
- **侧边栏/顶部 Tabs (题目导航)**：
  - 当前激活的题目高亮背景从 `bg-indigo-50 text-indigo-700` 改为 `bg-blue-50 text-blue-700`。
- **对比矩阵卡片 (Results Matrix)**：
  - 模型名称旁的头像背景色从 `bg-indigo-100 text-indigo-600` 改为 `bg-blue-100 text-blue-600`。
  - 打字机效果的闪烁光标从 `bg-indigo-400` 改为 `bg-blue-400`。

## 假设与决策 (Assumptions & Decisions)
- **非破坏性修改**：本次重做仅限于 UI 层面的类名替换和样式微调，绝不修改任何与后端交互的 API 逻辑、状态管理逻辑（如 SSE 接收、轮询等）或已有的响应式布局结构。
- **一致性优先**：所有不确定的样式细节（如阴影大小、边框颜色），均以 `Models.tsx` 的实现为准（Source of Truth）。

## 验证步骤 (Verification)
1. 启动前端开发服务器。
2. 进入“测评中心”列表页，观察主色调是否已变为蓝色，搜索框 focus 颜色是否正确。
3. 点击“创建测评”，检查表单的 Checkbox、图标和底部按钮颜色。
4. 提交任务或进入某个任务详情页，检查题目导航的高亮色、模型头像底色以及流式输出光标的颜色是否统一为蓝色系。
5. 确认移动端和桌面端的响应式布局未受影响。