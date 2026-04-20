# 流程中心列表页重构与操作扩展 Spec

## Why
目前流程中心列表页面 (`/processes`) 仅展示了流程的“名称”和“描述”，信息密度过低。同时，操作列仅有“编辑”和“删除”，且点击编辑后默认跳转至“节点配置”页面，不符合用户期望优先查看或修改“基础信息”的习惯。此外，用户需要快速复制已有流程作为模板的手段，并希望能够追踪版本信息。

## What Changes
- **列表字段扩充**：将表格的列扩展为：流程名称、描述、适用项目、节点数、状态、版本、创建时间、更新时间。
  - *适用项目*：解析 `communities` 字段展示为 Tag。
  - *节点数*：解析 `nodes` JSON 数组计算长度。
  - *状态*：映射 `status` 字段为带颜色的中文标签（如：启用、停用、草稿）。
  - *版本*：由于数据库暂无版本字段，前端写死显示 `V1.0`。
  - *时间*：使用 `dayjs` 格式化展示 `createdAt` 和 `updatedAt`。
- **操作列功能扩充**：将操作列改为下拉菜单（Dropdown/Action Menu）形式或并排图标形式，包含：
  - *查看版本信息*：点击后由于无后端支持，暂弹窗或 Toast 提示“暂无历史版本”。
  - *编辑流程*：保留，但调整跳转逻辑。
  - *复制流程*：调用现有的 `createProcess` API，将名称加上“ - 副本”后创建新流程并刷新列表。
  - *删除流程*：保留现有逻辑。
- **编辑跳转逻辑优化**：
  - 修改列表页的“编辑”按钮，将路由从 `/processes/:id/edit` 变更为带参数的 `/processes/:id/edit?tab=basic`。
  - 修改 `Editor.tsx`，通过 `useSearchParams` 读取 URL 参数，初始化 `activeTab` 状态，使从列表点击“编辑”时默认进入“基础信息”Tab。

## Impact
- Affected specs: 流程列表视图，流程编辑器路由。
- Affected code: 
  - `frontend/src/pages/Processes/index.tsx`
  - `frontend/src/pages/Processes/Editor.tsx`

## ADDED Requirements
### Requirement: 丰富列表信息与操作
系统应在流程列表提供更详尽的元数据展示（如节点数、适用项目等），并支持流程复制和友好的编辑跳转交互。

#### Scenario: Success case
- **WHEN** 用户在列表页点击“编辑流程”
- **THEN** 系统跳转至编辑器，并默认高亮且显示“基础信息”选项卡的内容。
- **WHEN** 用户在列表页点击“复制流程”
- **THEN** 系统自动创建一个名称带“ - 副本”的新流程，并更新当前列表。