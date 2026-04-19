# 智能体可视化编排 (Agent Visual Orchestration) Spec

## Why
目前的智能体管理仅提供了简单的表单式配置（选择模型、填写System Prompt），无法满足复杂任务（如条件分支、多模型协作、工具链调用）的编排需求。为了降低复杂业务逻辑的开发门槛，需要将静态表单升级为“基于有向无环图(DAG)的可视化拖拽编排”界面，使非研发人员也能像搭积木一样构建 AI 智能体工作流。

## What Changes
- **后端/数据库**：
  - 在 `Agent` 数据模型中增加 `workflow` (JSON 类型) 字段，用于存储前端序列化的节点(Nodes)与连线(Edges)结构数据。
  - 更新对应的 `api/agents` 路由接口，支持对 `workflow` 数据的读写。
- **前端UI与交互**：
  - 引入可视化图表编排库（推荐 `@xyflow/react` 即 React Flow）。
  - 彻底重构 `frontend/src/pages/Agents/Editor.tsx`，摒弃原有的基础表单。
  - 采用经典的三段式布局：左侧组件库面板（拖拽源）、中部无限画布区（React Flow Canvas）、右侧属性配置面板（选中节点时弹出参数设置）。
  - 支持至少 3 种基础节点类型：`Start`（开始）、`LLM`（大语言模型推理）、`End`（结束）。

## Impact
- Affected specs: 智能体管理功能。
- Affected code:
  - `backend/prisma/schema.prisma`
  - `backend/routes/agents.js`
  - `frontend/package.json`
  - `frontend/src/api/agents.ts`
  - `frontend/src/pages/Agents/Editor.tsx`

## ADDED Requirements
### Requirement: 拖拽式工作流编排
系统应当允许用户通过拖拽节点和连线的方式定义智能体的执行逻辑，并能将其作为 JSON 保存。

#### Scenario: Success case
- **WHEN** 用户进入智能体编辑页，从左侧组件库拖出一个 "LLM" 节点到画布中，并将其与 "Start" 和 "End" 节点相连，然后在右侧面板配置该 LLM 节点的 Prompt。点击保存。
- **THEN** 系统将画布上的 Nodes 和 Edges 数组序列化为 JSON 存入数据库 `workflow` 字段，并在下次打开该页面时能够精确还原画布状态。