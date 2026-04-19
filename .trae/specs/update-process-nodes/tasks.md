# Tasks
- [x] Task 1: 创建新增的四个节点组件。在 `src/pages/Processes/components/nodes/` 目录下创建 `AcceptNode.tsx`、`EvaluateNode.tsx`、`CallbackNode.tsx` 和 `EscalateNode.tsx`，并配置好样式和左右 Handles 连线点。
- [x] Task 2: 注册新节点。在 `src/pages/Processes/components/nodes/index.ts` 中引入并注册这四个新节点，使其可以被 React Flow 渲染。
- [x] Task 3: 修改侧边栏顺序。在 `src/pages/Processes/components/Sidebar.tsx` 的 `nodeTypes` 数组中，重新配置并排序 8 个节点：开始节点、受理节点、处理节点、审批节点、评价节点、回访节点、低分升级节点、结束节点。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]