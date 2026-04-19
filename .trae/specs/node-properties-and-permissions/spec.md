# 节点属性扩展与表单权限 UI 重构 Spec

## Why
当前节点编辑器的“节点属性”仅包含最基础的字段（如处理人），且“表单权限”使用纵向列表加下拉框的布局，当字段较多时操作繁琐且不够直观。在标准的工单（BPM）引擎中，自定义节点需要支持诸如多签策略、超时规则等丰富的属性配置，同时表单权限的分配应采用矩阵式的三列打勾 UI，以提升用户的配置效率。

## What Changes
- **扩展节点属性**：在 `PropertiesPanel.tsx` 中，针对“任务节点（TaskNode）”和“审批节点（ApprovalNode）”补充更丰富的基本属性：
  - “审批方式”（如或签、会签）。
  - “超时时效”（数字输入框，单位为小时）。
  - “节点说明”（文本域）。
- **重构表单权限 UI**：在 `PropertiesPanel.tsx` 的“表单字段权限”选项卡下：
  - 移除现有的纵向列表与 `<select>` 控件。
  - 使用 `table` 布局或 `grid` 网格，构建包含表头（字段名称、可编辑、只读、隐藏）的矩阵面板。
  - 将每个字段映射为一行，通过三个互斥的 `<input type="radio">` （分别对应 `editable`, `readonly`, `hidden`）来实现一键打勾式的权限配置。
  - 选中对应单选框时，复用并调用现有的 `handlePermissionChange` 事件。

## Impact
- Affected specs: 节点配置界面 (Node Configuration UI)、表单字段权限分配。
- Affected code: `frontend/src/pages/Processes/components/PropertiesPanel.tsx`

## ADDED Requirements
### Requirement: 标准化工单节点属性与权限矩阵
系统应允许管理员对自定义节点设置审批规则与超时时效，并通过矩阵式的直观界面快速分配表单各字段的读写权限。

#### Scenario: Success case
- **WHEN** 用户在“节点配置”中选中一个审批节点并切换到“表单权限”Tab
- **THEN** 系统展示一个包含 4 列（字段信息、可写、可读、隐藏）的表格，每个字段各占一行，用户可以直接点击表格中的单选框完成权限分配。