# 模型参数调优 (Hyperparameters) Spec

## Why
目前系统的模型配置仅支持基础的 URL 和 API Key。为了能够在不同严谨度和生成长度的需求下测试模型的表现，系统需要支持对各个模型单独配置高级超参数（Temperature、Top-P、Max Tokens），从而实现更专业的评测能力。

## What Changes
- 扩展 `Model` 数据库表结构，新增 `temperature`、`topP` 和 `maxTokens` 可选字段。
- 更新后端的模型增改 API，以支持保存和更新这些超参数。
- 改造执行引擎，在调用 OpenAI 兼容接口时，动态注入模型配置的超参数。
- 在前端 `Model` 类型定义中补充超参数字段。
- 在前端模型新增/编辑弹窗中增加超参数配置表单项。
- 在前端模型列表页展示这些参数的当前配置状态。

## Impact
- Affected specs: 模型管理功能、测评任务执行能力。
- Affected code: 
  - `backend/prisma/schema.prisma`
  - `backend/routes/models.js`
  - `backend/services/engine.js`
  - `frontend/src/lib/api.ts`
  - `frontend/src/components/ModelModal.tsx`
  - `frontend/src/pages/Models.tsx`

## ADDED Requirements
### Requirement: 独立模型参数配置
系统应当允许用户在添加或编辑模型时，配置 `Temperature`、`Top-P` 和 `Max Tokens`，并在评测执行时应用这些参数。

#### Scenario: Success case
- **WHEN** 用户在模型弹窗中填写了超参数并保存，然后使用该模型发起测评任务
- **THEN** 数据库应正确保存配置的参数，并且引擎在发起流式请求时，应将配置的 `temperature`、`top_p` 和 `max_tokens` 携带在 OpenAI 请求参数中。