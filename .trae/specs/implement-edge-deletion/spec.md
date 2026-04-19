# Implement Edge Deletion Spec

## Why
目前在 Agent 工作流编排画布中，用户连接了节点后无法删除连线，这极大地影响了用户的编排体验。我们需要参考 Coze 的交互设计，为系统增加直观的连线删除功能（键盘删除与悬浮按钮删除）。

## What Changes
- **前端：启用键盘删除支持**。在 `Canvas.tsx` 中为 `<ReactFlow>` 组件配置 `deleteKeyCode={['Backspace', 'Delete']}`，确保用户选中连线时可以通过键盘快捷键进行删除。
- **前端：实现自定义连线组件 (Custom Edge)**。新建 `CustomEdge.tsx`，在默认连线的基础上增加一个悬浮可见的“删除”按钮（垃圾桶图标）。当点击该按钮时，通过事件回调将该连线从 `edges` 状态中移除。

## Impact
- Affected specs: `coze-like-agent-refactoring`
- Affected code:
  - 前端：`frontend/src/pages/Agents/components/Canvas.tsx`
  - 前端：`frontend/src/pages/Agents/components/edges/CustomEdge.tsx` (New)

## ADDED Requirements
### Requirement: Keyboard Edge Deletion
The system SHALL allow users to delete a selected edge by pressing the Backspace or Delete key.
#### Scenario: Success case
- **WHEN** user clicks on an edge to select it and presses Backspace
- **THEN** the edge is removed from the canvas.

### Requirement: Hover Edge Deletion
The system SHALL display a delete button when the user hovers over an edge, which deletes the edge upon clicking.
#### Scenario: Success case
- **WHEN** user hovers over a connected edge
- **THEN** a small trash/delete icon appears in the middle of the edge. Clicking it removes the edge.