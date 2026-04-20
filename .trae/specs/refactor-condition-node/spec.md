# 流程条件判断节点重构 Spec

## Why
目前流程引擎中的条件节点 (`conditionNode`) 仅支持单一的“文本输入字段+固定操作符+文本比较值”的配置方式。这种手动盲填字段名的方式极易出错，不支持多条件组合逻辑（AND/OR），且对不同类型的表单字段（如数字、下拉单选）缺乏针对性的输入组件和操作符适配，无法满足复杂业务流程（如“请假天数>3天 且 职级=员工”）的路由分发需求。

## What Changes
- **数据结构升级**：将原先单层的 `conditionConfig: { field, operator, value }` 重构为多条件组合对象 `conditionConfig: { logicalOperator: 'AND' | 'OR', conditions: [{ field, operator, value }, ...] }`。
- **字段选择联动化**：在属性面板中，将“判断字段”由手动输入改为下拉框，选项由外部传入的 `formConfig`（表单配置）动态生成，防止拼写错误。
- **动态操作符与输入组件**：
  - 根据选中的 `formConfig` 字段类型（如 `text`, `number`, `select`），动态渲染对应的操作符列表（例如：数字有 `>`, `<`；文本有 `contains`）。
  - 根据字段类型动态切换“比较值”的输入控件（例如：若字段类型为 `select`，则比较值变为下拉框并加载对应的 `options`）。
- **多条件交互 UI**：在属性面板增加添加、删除单独条件行的功能，并在顶部增加切换“满足所有条件 (AND)”或“满足任一条件 (OR)”的选项。
- **画布展示优化**：在 `ConditionNode.tsx` 画布节点上，当条件数量为 0 时显示“未配置”；为 1 时展示明细；大于等于 2 时，展示条件数量摘要，保持画布整洁。

## Impact
- Affected specs: 流程条件节点配置交互、条件路由数据结构。
- Affected code: 
  - `frontend/src/pages/Processes/components/PropertiesPanel.tsx`
  - `frontend/src/pages/Processes/components/nodes/ConditionNode.tsx`
  - *可能影响* 后端流程执行引擎（如评估逻辑），但目前主要侧重前端组装阶段的重构。

## ADDED Requirements
### Requirement: 动态且组合式的条件配置
系统在条件判断节点的属性配置面板中，应提供基于当前表单定义的强类型条件构建器，并支持多条规则的逻辑组合。

#### Scenario: Success case
- **WHEN** 用户在画布选中“条件判断”节点并在右侧添加一个新条件
- **THEN** 系统下拉列出所有在“表单配置”中定义过的字段供用户选择。
- **WHEN** 用户选择了一个类型为 `number` 的字段（如金额）
- **THEN** 操作符下拉框仅展示大于、小于、等于等数字比较符，且比较值输入框的类型变为 `number`。
- **WHEN** 用户配置了多条规则并保存
- **THEN** 画布中的节点自动更新摘要信息，如显示“[2个条件] 满足所有”。