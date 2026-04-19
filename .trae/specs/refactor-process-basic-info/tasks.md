# Tasks
- [ ] Task 1: 修复后端的 `PUT` 接口解析问题。在 `backend/routes/processes.js` 的 `PUT /:id` 路由中，修改 `updateData` 构建逻辑：确保 `timeLimit` 为合法整数（避免 `NaN`），确保 `communities` 始终为 `string` 类型（使用 `typeof` 和 `JSON.stringify` 判断），确保 `status` 为 `string` 类型。
- [ ] Task 2: 在 `frontend/src/pages/Processes/Editor.tsx` 中，将“适用小区”的 `<input type="text">` 改为一个包含多个常见小区选项的 Checkbox 列表（如“朝阳小区”、“海淀小区”、“望京小区”等）。用户勾选时，更新 `processData.communities` 数组。
- [ ] Task 3: 在 `frontend/src/pages/Processes/Editor.tsx` 中，将“处理时效”的单一 `<input type="number">` 拆分为三个并排的输入框（天、小时、分钟）。通过计算 `processData.timeLimit` 分解渲染，并在 `onChange` 时换算回总分钟数进行存储（`总分钟 = 天*1440 + 小时*60 + 分钟`）。
- [ ] Task 4: 在 `frontend/src/pages/Processes/Editor.tsx` 中，为“启用状态”的 `<select>` 下拉框增加 `<option value="draft">草稿</option>` 选项。

# Task Dependencies
- [Task 2], [Task 3], [Task 4] can run in parallel.
- [Task 1] can run in parallel with frontend tasks.