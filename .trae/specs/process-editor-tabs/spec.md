# 流程编辑器顶部 Tab 切换 Spec

## Why
用户希望在流程中心编辑页面的顶部增加“基础信息”、“表单配置”和“节点配置”三个步骤的切换，以更好地组织和隔离不同维度的流程配置信息。需要保证切换步骤时不破坏原有画布（节点配置）内部复杂的节点状态。

## What Changes
- 在 `src/pages/Processes/Editor.tsx` 中引入 Tab 状态管理。
- 改造 Header，通过绝对定位将 Tab 切换器居中对齐于顶部导航栏。
- 重构页面主体渲染逻辑：对于非节点配置 Tab 渲染占位面板；对于原有的节点配置区域，使用动态 CSS `display: flex/none` 切换显示隐藏，避免 React 卸载画布组件导致数据丢失。

## Impact
- Affected specs: 流程可视化编排（Workflow Orchestration）、页面布局与导航。
- Affected code: `src/pages/Processes/Editor.tsx`

## MODIFIED Requirements
### Requirement: 编辑器多步骤切换布局
系统应该在编辑器顶部提供三个配置步骤的切换入口。

#### Scenario: Success case
- **WHEN** 用户进入流程编辑页面
- **THEN** 顶部 Header 居中显示“基础信息”、“表单配置”、“节点配置”三个选项卡，默认选中“节点配置”，下方主体展示原有的画布内容。
- **WHEN** 用户点击“基础信息”
- **THEN** 原有画布隐藏（状态保留），页面主体切换为基础信息的占位表单。
- **WHEN** 用户切回“节点配置”
- **THEN** 原有的拖拽节点和连线状态完整恢复展示。