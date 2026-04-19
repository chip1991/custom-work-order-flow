# 流程中心基础信息重构 Spec

## Why
目前流程中心编辑器的“基础信息”Tab存在几个用户体验和数据持久化的问题：
1. “适用小区”是纯文本输入框，要求用户手动输入逗号分隔，容易出错且体验差。
2. “处理时效”仅支持单一的数字框（小时），不够直观，通常需要支持天、小时、分钟维度的组合配置。
3. “启用状态”缺乏“草稿”选项，不符合工单流程生命周期的常见需求。
4. 后端接口在处理 `timeLimit` 和 `communities` 更新时缺乏严格的类型转换和容错机制，导致 Prisma ORM 校验失败，抛出 "Failed to update process" 错误。

## What Changes
- **重构适用小区组件**：将文本输入框改为多选的 Checkbox 组合（由于当前没有引入第三方 UI 库，使用原生 HTML Checkbox 和 CSS 模拟多选下拉的效果）。
- **拆分处理时效组件**：将原本单一的 `timeLimit` 输入框拆分为三个并排的数字输入框（天、小时、分钟）。前端在渲染时将其拆解，在 `onChange` 时将三者换算合并回总分钟数进行状态存储。
- **扩充启用状态选项**：在 `status` 的 `<select>` 标签中追加 `<option value="draft">草稿</option>`。
- **强化后端接口容错**：在 `backend/routes/processes.js` 的 `PUT /:id` 路由中，增加严格的类型转换逻辑。确保 `timeLimit` 为合法整数，`communities` 为字符串，避免 Prisma 报错。

## Impact
- Affected specs: 流程基础信息配置、后端更新接口容错。
- Affected code: 
  - `frontend/src/pages/Processes/Editor.tsx`
  - `backend/routes/processes.js`

## ADDED Requirements
### Requirement: 易用的基础信息配置与稳定的保存机制
系统应提供直观的多选小区交互、多维度的时效配置，并确保用户提交的任何数据都能被后端安全解析并成功保存。

#### Scenario: Success case
- **WHEN** 用户在基础信息中勾选多个小区，设置时效为 1天 2小时 30分钟，并点击保存
- **THEN** 前端正确换算数据，后端接口容错解析并成功存入数据库，不再弹出 500 更新失败错误。