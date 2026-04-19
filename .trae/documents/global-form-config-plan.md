# 流程表单全局配置与节点权限重构 Spec

## Why
当前流程中心（Process Center）的表单字段可能是在各个节点内部单独配置的，这会导致配置重复且难以维护全局数据结构。用户希望采用“配置与权限分离”的模式：在顶部的“表单配置”选项卡中集中定义所有的全局表单字段，而在“节点配置”选项卡中选中特定节点时，属性面板仅用来分配这些全局字段在该节点的访问权限（可见、只读、可写）。

## What Changes
- 在 `src/pages/Processes/Editor.tsx` 中增加对全局 `formConfig` 状态的管理，并在处于 `'form'`（表单配置）Tab 时渲染全局表单字段配置器。
- 修改 `src/pages/Processes/components/PropertiesPanel.tsx`，移除原有的节点内表单字段定义逻辑，改为接收全局的 `formConfig`。
- 在 `PropertiesPanel.tsx` 中针对选中的节点，渲染全局表单字段的权限控制列表，允许用户为每个字段配置 `'hidden'`（隐藏）、`'readonly'`（只读）或 `'editable'`（可写），并将其存入节点的 `data.fieldPermissions` 中。

## Impact
- Affected specs: 流程可视化编排（Workflow Orchestration）、节点属性配置。
- Affected code:
  - `src/pages/Processes/Editor.tsx`
  - `src/pages/Processes/components/PropertiesPanel.tsx`
  - 后端 `Process` 模型的 `formConfig` 数据存储（可能需要扩展 Prisma schema 或与现有的流程数据一起序列化存储）。

## MODIFIED Requirements
### Requirement: 全局表单配置与节点级权限控制
系统应该提供全局的表单字段定义功能，并在节点级别提供这些字段的权限控制。

#### Scenario: Success case
- **WHEN** 用户点击顶部的“表单配置”选项卡
- **THEN** 页面展示全局表单设计器，用户可以添加“请假天数”、“请假事由”等全局字段，定义其类型和名称。
- **WHEN** 用户切换回“节点配置”选项卡，并在画布中选中一个流转节点（如审批节点）
- **THEN** 右侧的属性面板展示刚刚定义的全局字段列表，并允许用户为该节点单独设置“请假天数”为只读，“审批意见”为可写。