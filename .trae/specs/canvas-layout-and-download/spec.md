# 画布底部控制栏及自动布局、下载图片功能 Spec

## Why
目前流程中心的节点配置画布中，原生的放大/缩小控制栏位于左下角，当左侧菜单较多时容易遮挡或显得不协调。同时，随着节点数量增多，用户手动排版连线效率低下，且缺乏将排版好的流程图导出为图片用于汇报的途径。

## What Changes
- 将 React Flow 原生的 `<Controls />` 组件的位置调整至底部居中 (`bottom-center`)。
- 引入图布局算法库 `dagre`，在底部的 `<Controls>` 内新增一个“自动布局 (Auto Layout)”按钮，点击后根据当前图的连线拓扑关系，自动计算并更新每个节点的 `x/y` 坐标，然后居中适应视图。
- 引入 `html-to-image` 库，在底部的 `<Controls>` 内新增一个“下载图片 (Download Image)”按钮，点击后将 `.react-flow__viewport` 内包含的完整流程图渲染为高清 PNG 并触发浏览器下载。

## Impact
- Affected specs: 流程图画布功能扩展 (Process Canvas Extensibility)。
- Affected code: `frontend/src/pages/Processes/components/Canvas.tsx`
- New Dependencies: `dagre`, `html-to-image`

## ADDED Requirements
### Requirement: 智能排版与图片导出
系统应该在画布底部提供居中的控制台，包含一键自动布局和导出高清流程图图片的功能，以提升流程设计的用户体验。

#### Scenario: Success case
- **WHEN** 用户在画布中随意拖放了多个节点和连线，然后点击底部的“自动布局”按钮
- **THEN** 节点会自动按照有向无环图的层次结构整齐排列，不重叠。
- **WHEN** 用户点击“下载图片”按钮
- **THEN** 浏览器会自动下载一张名为 `workflow.png` 的完整流程图图片。