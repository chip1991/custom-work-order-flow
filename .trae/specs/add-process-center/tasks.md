# Tasks
- [x] Task 1: 增加流程中心导航菜单和路由。在原有导航“智能体中心”后添加“流程中心”，并配置对应的前端路由。
- [x] Task 2: 创建流程中心列表页。实现流程配置的列表展示，包含新建流程的入口。
- [x] Task 3: 搭建流程编辑器页面框架。参考 `Editor.tsx`，实现顶部导航、左侧节点栏、中间画布区、右侧属性面板的三栏式布局。
- [x] Task 4: 实现流转节点的可视化画布。集成 `@xyflow/react`，支持物业工单流转节点（如：开始节点、审批节点、工单处理节点、结束节点）的拖拽和连线。
- [x] Task 5: 实现节点自定义属性面板。在右侧面板中，支持对选中流转节点配置“自定义表单字段”（例如：字段名称、字段类型等属性的增删改）。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]
