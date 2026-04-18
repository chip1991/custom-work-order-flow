# Coze-like Agent Refactoring Spec

## Why
目前的智能体中心（Agent管理）模块功能较为基础。为了提供更强大的工作流编排能力，我们需要参考 Coze 的架构，对 Agent 模块进行全面升级，包括界面布局、节点类型扩展、调试沙盒以及后端的 DAG 调度引擎。

## What Changes
- 重构 Agent 编辑器界面为左中右三栏结构（左侧物料库、中间画布、右侧属性面板）。
- 增加测试预览抽屉（Playground），支持实时对话与节点运行轨迹追踪（Trace）。
- 扩展新的可视化节点类型：增强型 LLM 节点、知识库节点、插件/工具节点、逻辑控制节点（条件/循环）、代码节点。
- 后端引入 DAG（有向无环图）执行引擎，支持拓扑排序、上下文状态管理、变量替换与并发调度。
- 支持 Server-Sent Events (SSE) 流式输出节点执行结果。

## Impact
- Affected specs: 可视化编排能力、Agent API 执行引擎。
- Affected code:
  - 前端：`frontend/src/pages/Agents/Editor.tsx` 及 `components` 下的画布、节点、侧边栏、属性面板。
  - 后端：`backend/routes/v1-chat.js`、`backend/services/engine.js`、`backend/routes/agents.js` 等执行和管理逻辑。
  - 数据库：`schema.prisma` 可能需要调整以支持更复杂的节点状态存储或执行日志。

## ADDED Requirements
### Requirement: UI Layout & Playground
The system SHALL provide a three-column layout with a toggleable Playground drawer for testing.
#### Scenario: Test Agent in Playground
- **WHEN** user opens the Playground and sends a message
- **THEN** the system executes the DAG and streams the response back, highlighting active nodes on the canvas.

### Requirement: Node Types Expansion
The system SHALL support new nodes including Knowledge Base, Tools, and Conditions.

### Requirement: Backend DAG Engine
The system SHALL parse the workflow JSON into a DAG, resolve dependencies, and execute nodes in topological order.
