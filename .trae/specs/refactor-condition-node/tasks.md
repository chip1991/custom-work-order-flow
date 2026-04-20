# Tasks
- [ ] Task 1: 升级 `conditionNode` 数据结构。在 `frontend/src/pages/Processes/components/PropertiesPanel.tsx` 中，当 `type === 'conditionNode'` 时，若原 `data.conditionConfig` 为旧格式（或为空），将其转换为新格式：`{ logicalOperator: 'AND', conditions: [] }`。
- [ ] Task 2: 重构 `PropertiesPanel.tsx` 中的条件配置 UI。
  - [ ] SubTask 2.1: 在顶部增加“满足以下 [所有(AND)/任一(OR)] 条件”的切换器（当 conditions 数量 > 1 时显示或常驻）。
  - [ ] SubTask 2.2: 使用 `map` 渲染 `conditions` 数组，每行包含：字段下拉框（从 `formConfig` 提取 `id` 和 `label`）、操作符下拉框（动态）、比较值输入框（动态）、删除按钮（Trash Icon）。
  - [ ] SubTask 2.3: 在底部增加“+ 添加条件”按钮，点击后向 `conditions` 数组 push 一个默认空对象 `{ field: '', operator: '==', value: '' }`。
- [ ] Task 3: 实现动态操作符与输入组件逻辑（在 `PropertiesPanel.tsx` 中）。
  - [ ] SubTask 3.1: 编写辅助函数，根据所选字段在 `formConfig` 中的 `type`（如 `text`, `number`, `select`, `radio`），返回适用的操作符列表（例如：数字 `['==', '!=', '>', '<', '>=', '<=']`，文本 `['==', '!=', 'contains', 'not_contains']`）。
  - [ ] SubTask 3.2: 编写辅助函数，根据字段 `type` 渲染“比较值”控件。若是 `select` 或 `radio`，则渲染 `<select>` 并遍历其 `options`；若是 `number`，渲染 `<input type="number">`；否则渲染 `<input type="text">`。
- [ ] Task 4: 优化 `ConditionNode.tsx` 的画布节点展示。修改 `frontend/src/pages/Processes/components/nodes/ConditionNode.tsx`：
  - 若 `conditions` 不存在或为空，显示“未配置”。
  - 若 `conditions` 长度为 1，寻找该字段在 `formConfig` 中的 label（或直接展示 field id）并拼接 `operator` 和 `value`（如：`金额 > 1000`）。
  - 若 `conditions` 长度 >= 2，显示如 `[2个条件] 满足所有`。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] can run in parallel with [Task 3]