# 智能体编辑页交互改造 Plan

## 1. 摘要 (Summary)
用户希望优化智能体编辑页（Agent Editor）的交互布局：
1. 将左上角的标题区域由目前的“编辑 Agent 流程”改为直接显示智能体的**名称**（作为 `h1`），并在下方显示智能体的**描述**（作为 `p`）。
2. 在智能体标题旁边增加一个“编辑”按钮，点击后弹出一个 Modal 模态框，用于配置智能体的全局设置（名称、描述、绑定的底座模型等）。
3. 当用户点击画布空白处时（即未选中任何节点），右侧的属性面板不再显示 Agent 全局设置，而是直接隐藏或显示空状态占位。

## 2. 当前状态分析 (Current State Analysis)
- **头部区域 (`Editor.tsx`)**：目前 `h1` 显示的是硬编码的“新增/编辑 Agent 流程”，`p` 标签显示的是 `agentData.name`。
- **右侧面板 (`PropertiesPanel.tsx`)**：目前采用三元表达式 `{selectedNode ? renderNodeSettings() : renderAgentSettings()}`。当未选中节点时，右侧面板会渲染 Agent 的全局设置表单。
- **全局状态 (`agentData`)**：`agentData` 状态维护在 `Editor.tsx` 中，包含了 name, description, modelId 等信息，之前通过 props 传递给右侧面板进行双向绑定修改。

## 3. 拟定修改方案 (Proposed Changes)

### 3.1 创建 Agent 设置模态框组件
- **文件**：新建 `frontend/src/pages/Agents/components/AgentSettingsModal.tsx`
- **内容**：
  - 参考项目现有的 `ModelModal.tsx` 规范，实现一个标准的 Tailwind CSS 居中模态框。
  - 接收 `isOpen`, `onClose`, `agentData`, `onSave`, `models` 等 props。
  - 将原先在 `PropertiesPanel.tsx` 中的 `renderAgentSettings` 表单（包含名称、描述、默认模型）完整迁移到这个 Modal 中。
  - 表单内部维护一个临时的 `formData` 状态，点击“保存”时调用 `onSave(formData)` 回调将数据传回给父组件，并关闭弹窗。

### 3.2 改造头部区域 (`Editor.tsx`)
- **文件**：修改 `frontend/src/pages/Agents/Editor.tsx`
- **引入状态**：新增 `const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);`
- **头部 UI 调整**：
  - `h1`：显示 `{agentData.name || '未命名 Agent'}`。
  - 在 `h1` 旁边添加一个带 `Edit2` (Lucide 图标) 的编辑小按钮，点击触发 `setIsSettingsModalOpen(true)`。
  - `p`：显示 `{agentData.description || '暂无描述'}`。
- **引入 Modal**：在 `Editor.tsx` 的 JSX 中挂载 `<AgentSettingsModal />`，并将 `setAgentData` 作为保存回调传入。

### 3.3 改造右侧面板 (`PropertiesPanel.tsx`)
- **文件**：修改 `frontend/src/pages/Agents/components/PropertiesPanel.tsx`
- **移除 Agent 设置逻辑**：
  - 彻底删除 `renderAgentSettings` 函数。
  - 从组件的 Props 接口中移除 `agentData` 和 `onUpdateAgentData`。
- **修改渲染逻辑**：
  - 如果 `!selectedNode`，则 `return null;`，直接隐藏右侧面板（或者返回一个极简的“请选择节点”占位区，为保持画布纯净，推荐直接隐藏 `return null`）。

## 4. 假设与决策 (Assumptions & Decisions)
- **Modal 交互**：Agent 设置弹窗仅修改内存中的 `agentData` 状态，**不直接调用 API 发起保存请求**。真正的持久化依然由用户点击右上角的“保存 Agent”主按钮来统一提交（包含节点、连线和全局设置）。这保持了“所见即所得”和“统一提交”的逻辑一致性。
- **右侧面板隐藏**：决定采用 `if (!selectedNode) return null;` 的方式。当点击空白画布时，右侧面板完全消失，给编排节点提供最大化的画布空间。

## 5. 验证步骤 (Verification Steps)
1. 编译前端并确保无类型错误。
2. 打开智能体编辑页，确认左上角正确显示了智能体名称和描述。
3. 点击名称旁边的“编辑”按钮，确认能正确弹出模态框，且表单内回显了当前的名称、描述和模型。
4. 在模态框中修改名称并保存，确认模态框关闭，且左上角的名称立即更新。
5. 点击画布空白处，确认右侧的属性面板完全消失。
6. 点击画布中的某个节点（如 LLM 节点），确认右侧属性面板正常滑出并显示该节点的配置项。
7. 点击右上角的“保存 Agent”，确认所有修改（包含模态框里改的名称）都能成功保存到后端。