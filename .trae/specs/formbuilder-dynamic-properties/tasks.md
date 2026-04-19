# Tasks
- [ ] Task 1: 扩展 `FormField` 接口。在 `FormBuilder.tsx` 中增加 `description` (基础描述), `options` (选项列表), 和 `visibleCondition` (高级显隐条件: dependentFieldId, operator, value) 等类型定义。
- [ ] Task 2: 重构右侧属性面板结构。将现有的扁平输入框划分为三个区块：“基础属性” (字段名称, 标识符, 必填, 描述), “专属属性” (动态内容), “高级配置” (显隐条件等)。
- [ ] Task 3: 实现“专属属性”动态渲染。为 `text` / `textarea` 渲染占位符和默认值；为 `number` / `amount` 渲染单位；为 `radio` / `checkbox` 渲染一个可动态增删条目的“选项列表编辑器”。
- [ ] Task 4: 实现“高级配置”动态显隐属性。在右侧提供一个条件编辑器，允许选择“依赖字段”（下拉列表，过滤掉自身），选择“操作符”（如 `===`），输入“条件值”。
- [ ] Task 5: 改造中间画布预览逻辑。使 `radio` 和 `checkbox` 在画布中能遍历其 `options` 数组并渲染真实的选项结构；并在配置了 `visibleCondition` 的字段右上角显示一个“👁️ 条件显示”的标识角标。

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 2]
- [Task 4] depends on [Task 3]
- [Task 5] depends on [Task 4]