# 流程中心节点更新 Spec

## Why
为了更好地贴合物业工单的实际业务流转需求，需要将流程中心编辑器左侧的节点列表更新为一套专属的工单节点序列（如受理、回访、升级等），并确保这些节点可以被拖拽到画布中正常显示和连线。

## What Changes
- 修改左侧菜单栏的 `nodeTypes` 数组，重置为 8 个特定的工单节点（Start, Accept, Process, Approval, Evaluate, Callback, Escalate, End）。
- 在画布节点目录中新增缺失的 4 个节点 UI 组件（AcceptNode, EvaluateNode, CallbackNode, EscalateNode）。
- 在节点注册入口文件中注册这 4 个新节点，供 React Flow 渲染使用。

## Impact
- Affected specs: 流程可视化编排（Workflow Orchestration）。
- Affected code:
  - `src/pages/Processes/components/Sidebar.tsx`
  - `src/pages/Processes/components/nodes/index.ts`
  - `src/pages/Processes/components/nodes/*.tsx`

## MODIFIED Requirements
### Requirement: 左侧节点顺序与内容
系统应该在流程编辑器左侧显示特定顺序的物业工单节点。

#### Scenario: Success case
- **WHEN** 用户打开流程编辑器
- **THEN** 左侧侧边栏按顺序显示：开始节点、受理节点、处理节点、审批节点、评价节点、回访节点、低分升级节点、结束节点。

## ADDED Requirements
### Requirement: 新增专属流转节点
系统需要支持将新增的工单节点拖拽并渲染到画布中。

#### Scenario: Success case
- **WHEN** 用户将“受理节点”拖拽到中间画布
- **THEN** 画布中成功渲染出一个带有左/右连线触点（Handles）的受理节点UI。