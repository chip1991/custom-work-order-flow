# Tasks
- [ ] Task 1: 扩展工单自定义节点的“基本属性”。在 `PropertiesPanel.tsx` 中针对 `task` 和 `approval` 类型的节点，增加“节点说明”（`description`）、“审批/处理方式”（`approvalType`: `or` | `and`）和“处理时效”（`timeLimit` 小时）等常用基础属性的输入框，并调用 `onUpdateNodeData`。
- [ ] Task 2: 重构“表单权限”网格布局框架。在 `PropertiesPanel.tsx` 的 `activeTab === 'permissions'` 条件分支中，将现有的 `flex-col` 列表移除，替换为 `table` 结构或四列 `grid`（`grid-cols-4`），并添加固定的表头（字段名称、可编辑、只读、隐藏）。
- [ ] Task 3: 实现“表单权限”的“三列打勾”逻辑。遍历 `formConfig`，在每一行中：首列渲染字段信息（名称、类型、是否必填），后三列各渲染一个 `<input type="radio">`。三个 `radio` 的 `name` 必须绑定为该字段 ID 以保证互斥，其 `checked` 状态分别判断为 `editable`, `readonly`, `hidden`，并在 `onChange` 时触发 `handlePermissionChange`。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]