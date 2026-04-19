# 流程表单配置器飞书化改造 Spec

## Why
用户希望表单配置功能能够向飞书审批对齐，提供更丰富的字段类型和更高级的配置属性，以支持复杂的业务工单流转需求。需要扩充现有的 `FormBuilder`，引入新控件并增加高级配置项。

## What Changes
- **扩充字段类型**：在 `FormBuilder.tsx` 的类型选择下拉框中，新增“人员 (User)”、“部门 (Department)”、“附件 (Attachment)”这三种飞书审批中常见的高频控件。
- **增强高级属性**：在 `FormField` 接口中新增 `placeholder`（提示语）、`defaultValue`（默认值）和 `unit`（单位）三个可选属性。
- **优化表单设计器 UI**：在 `FormBuilder.tsx` 的字段配置卡片中，增加一行“高级配置”区域，用于输入上述新增的三个属性。

## Impact
- Affected specs: 表单字段定义（Form Configuration）、属性动态扩展。
- Affected code:
  - `src/pages/Processes/components/FormBuilder.tsx`
  - `src/pages/Processes/Editor.tsx` (仅类型定义的引用，若有的话)

## MODIFIED Requirements
### Requirement: 高级表单字段与配置
系统应该提供类似飞书审批的丰富表单字段类型，并允许配置高级属性（如提示语、默认值、单位）。

#### Scenario: Success case
- **WHEN** 用户在“表单配置”选项卡中点击“添加字段”
- **THEN** 可以在字段类型下拉框中选择“人员”、“部门”或“附件”。
- **WHEN** 用户展开或查看字段的配置卡片
- **THEN** 在基础配置下方，会显示“高级配置”区域，允许输入该字段的“提示语 (Placeholder)”、“默认值”以及“单位”。
- **WHEN** 用户填写这些高级属性并保存流程
- **THEN** 这些配置将作为 `formConfig` 的一部分被正确序列化并持久化到数据库中。