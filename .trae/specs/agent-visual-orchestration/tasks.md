# Tasks

- [x] Task 1: 数据库与 API 扩展
  - [x] SubTask 1.1: 更新 `backend/prisma/schema.prisma`，在 `Agent` 表中新增 `workflow` (JSON 类型) 字段。
  - [x] SubTask 1.2: 执行 `npx prisma db push` 更新数据库结构并重启后端服务。
  - [x] SubTask 1.3: 更新 `backend/routes/agents.js` 中的 POST 和 PUT 接口，以接收和存储 `workflow` 参数。

- [x] Task 2: 前端依赖安装与环境准备
  - [x] SubTask 2.1: 在前端 `frontend` 目录安装 `@xyflow/react` 依赖。
  - [x] SubTask 2.2: 在 `frontend/src/api/agents.ts` 的 `Agent` 和 `CreateAgentDto` 等接口定义中补充 `workflow` 字段（任意对象/any）。

- [x] Task 3: 智能体可视化画布结构搭建
  - [x] SubTask 3.1: 将原有的 `frontend/src/pages/Agents/Editor.tsx` 重构为基于 `ReactFlowProvider` 的组件结构。
  - [x] SubTask 3.2: 拆分布局，实现左侧 Sidebar（可拖拽的组件库，提供 "LLM 节点"、"工具节点"）和右侧 Properties Panel（选中节点的配置项，如模型、Prompt）。
  - [x] SubTask 3.3: 定义并注册自定义节点组件（如 `StartNode`, `LLMNode`, `EndNode`），这些节点需要支持 React Flow 的 Handle（引脚连线）。

- [x] Task 4: 画布交互与数据持久化
  - [x] SubTask 4.1: 实现画布节点的拖拽添加逻辑（Drag and Drop）和节点间连线（onConnect）。
  - [x] SubTask 4.2: 实现选中节点后，右侧属性面板的数据双向绑定（更新选中节点的 data 属性）。
  - [x] SubTask 4.3: 在保存时，将 React Flow 的 `nodes` 和 `edges` 序列化，合并入现有的 Agent `name`, `description` 数据中一起发送至后端。
  - [x] SubTask 4.4: 在进入编辑页时，如果后端返回了 `workflow`，将其解析回 `nodes` 和 `edges` 并在画布中恢复显示。

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 3