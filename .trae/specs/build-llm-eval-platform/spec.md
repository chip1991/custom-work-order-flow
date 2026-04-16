# 大模型测评平台（全栈）Spec

## Why
团队需要一个可落地、可复现、可对比的测评平台，用统一的数据集与指标对不同大模型/不同版本进行评测，并沉淀评测资产与结果，支持后续回归与迭代。

## What Changes
- 新增一个可部署的全栈大模型测评平台（前端 Web + 后端 API + 数据库持久化）。
- 提供真实的 CRUD 管理能力：项目、模型/版本、数据集/样本、Prompt 模板、指标、评测计划、评测运行、运行结果。
- 提供真实的评测执行能力：按评测计划对样本调用模型真实推理，并计算指标后落库，可在页面查询与对比。
- 提供基础安全能力：账号登录、会话管理、组织/项目隔离（以 Project 为隔离单位）、基础审计（可选，MVP 仅记录创建者与时间）。
- **BREAKING**：无（当前仓库为初始化状态）。

## Impact
- Affected specs: 认证与权限、测评资产管理、测评编排与执行、结果可视化与对比、系统设置
- Affected code: 新增前端应用、后端服务、数据库 schema、评测执行引擎

## ADDED Requirements

### Requirement: 身份认证与会话
系统 SHALL 提供基于邮箱+密码的登录能力，并为已登录用户提供会话态访问控制。

#### Scenario: 登录成功
- **WHEN** 用户输入有效邮箱与密码提交登录
- **THEN** 系统创建会话并跳转到仪表盘

#### Scenario: 未登录访问受保护资源
- **WHEN** 未登录用户访问受保护页面或 API
- **THEN** 前端跳转登录页 / API 返回 401

**用户字段**
- id: string
- email: string（唯一）
- name: string
- passwordHash: string
- role: `OWNER` | `ADMIN` | `MEMBER` | `VIEWER`
- createdAt: datetime
- updatedAt: datetime

### Requirement: 项目管理（Project）
系统 SHALL 提供项目的创建、查询、更新、删除，并以项目为数据隔离单位。

**Project 字段**
- id: string
- name: string
- description: string（可选）
- tags: string[]（可选）
- createdByUserId: string
- createdAt: datetime
- updatedAt: datetime

#### Scenario: 新建项目
- **WHEN** 登录用户提交项目表单
- **THEN** 项目被持久化并出现在列表中

### Requirement: 模型与版本管理（Model / ModelVersion）
系统 SHALL 支持配置可调用的大模型，并支持按版本管理不同 endpoint/modelName/默认参数。

**Model 字段**
- id: string
- projectId: string
- name: string
- provider: `OPENAI` | `ANTHROPIC` | `AZURE_OPENAI` | `GOOGLE` | `ALIYUN` | `BAIDU` | `BYTEDANCE` | `TENCENT` | `DEEPSEEK` | `CUSTOM`
- modelType: `LLM_CHAT` | `LLM_COMPLETION`
- status: `ACTIVE` | `DISABLED` | `DEPRECATED`
- tags: string[]（可选）
- createdAt / updatedAt: datetime

**ModelVersion 字段**
- id: string
- modelId: string
- versionName: string（如 2026-04-16 / v1.2.0）
- endpointType: `OPENAI_COMPAT_HTTP` | `CUSTOM_HTTP`
- baseUrl: string
- apiKeyId: string（引用密钥；系统不在日志中输出明文）
- remoteModelName: string（对端模型名）
- defaultParamsJson: json（temperature/maxTokens/topP 等）
- isBaseline: boolean
- createdAt: datetime

#### Scenario: 配置模型版本并健康检查
- **WHEN** 用户保存模型版本并点击“健康检查”
- **THEN** 后端尝试以极小请求调用模型，返回成功/失败原因

### Requirement: 数据集与样本管理（Dataset / Sample）
系统 SHALL 支持导入与维护数据集与样本，并在评测运行时使用指定样本集合。

**Dataset 字段**
- id: string
- projectId: string
- name: string
- taskType: `QA` | `SUMMARIZATION` | `TRANSLATION` | `CODE_GEN` | `RAG_QA` | `SAFETY` | `CLASSIFICATION` | `OTHER`
- languages: (`ZH` | `EN` | `JA` | `KO` | `FR` | `DE` | `ES` | `OTHER`)[]
- description: string（可选）
- tags: string[]（可选）
- createdAt / updatedAt: datetime

**Sample 字段**
- id: string
- datasetId: string
- input: text（或 json string）
- expectedOutput: text（可选）
- contextJson: json（可选，RAG 用）
- metadataJson: json（可选，domain/difficulty 等）
- tags: string[]（可选）
- createdAt / updatedAt: datetime

#### Scenario: 数据集导入
- **WHEN** 用户上传 JSONL/CSV（MVP 支持 JSONL）
- **THEN** 系统解析为样本并持久化，提供失败行定位

### Requirement: Prompt 模板管理（PromptTemplate）
系统 SHALL 提供 Prompt 模板的创建、版本化（MVP 可先用单版本字段）、并在评测时渲染变量。

**PromptTemplate 字段**
- id: string
- projectId: string
- name: string
- promptType: `CHAT` | `COMPLETION`
- template: text（支持 {{var}}）
- variablesJson: json（数组：name/type/required/defaultValue）
- tags: string[]（可选）
- createdAt / updatedAt: datetime

### Requirement: 指标管理（Metric）
系统 SHALL 支持配置并在运行时计算指标（MVP：exact_match、contains、length、latency_ms、cost_estimate）。

**Metric 字段**
- id: string
- projectId: string
- name: string
- metricType: `EXACT_MATCH` | `CONTAINS` | `LENGTH` | `LATENCY_MS` | `COST_ESTIMATE`
- valueType: `NUMBER` | `PERCENT` | `BOOLEAN`
- higherIsBetter: boolean
- configJson: json（可选）
- createdAt / updatedAt: datetime

### Requirement: 评测计划（EvaluationPlan）
系统 SHALL 支持创建评测计划，绑定数据集、模型版本候选、Prompt 模板与指标，并可触发运行。

**EvaluationPlan 字段**
- id: string
- projectId: string
- name: string
- datasetId: string
- promptTemplateId: string
- candidateModelVersionIds: string[]
- metricIds: string[]
- sampleStrategy: `ALL` | `RANDOM_N`
- sampleSize: number（sampleStrategy=RANDOM_N 时必填）
- runtimeConfigJson: json（timeoutMs/maxConcurrency/retryCount）
- createdAt / updatedAt: datetime

### Requirement: 评测运行与结果（EvaluationRun / RunCase / MetricResult）
系统 SHALL 允许用户基于评测计划创建运行；运行 SHALL 真实调用模型生成输出，计算指标并持久化；用户 SHALL 可查询运行详情、按指标筛选案例，并进行 A/B 对比。

**EvaluationRun 字段**
- id: string
- projectId: string
- planId: string
- status: `QUEUED` | `RUNNING` | `SUCCEEDED` | `FAILED` | `CANCELED`
- baselineModelVersionId: string（可选，用于 delta）
- createdByUserId: string
- startedAt / finishedAt: datetime（可选）
- errorMessage: string（可选）
- createdAt / updatedAt: datetime

**RunCase 字段**
- id: string
- runId: string
- sampleId: string
- modelVersionId: string
- renderedPrompt: text
- modelOutput: text
- latencyMs: number
- promptTokens: number（可选）
- completionTokens: number（可选）
- totalTokens: number（可选）
- cost: number（可选）
- errorType: `NONE` | `TIMEOUT` | `RATE_LIMIT` | `MODEL_ERROR` | `PARSER_ERROR` | `UNKNOWN`
- errorMessage: string（可选）
- createdAt: datetime

**MetricResult 字段**
- id: string
- runCaseId: string
- metricId: string
- valueNumber: number（可选）
- valueBoolean: boolean（可选）
- valuePercent: number（可选）

#### Scenario: 触发运行并查看结果
- **WHEN** 用户在计划详情点击“运行”
- **THEN** 系统创建 EvaluationRun（QUEUED），后台执行后将状态置为 SUCCEEDED/FAILED，并可在运行详情看到每个样本的模型输出与指标结果

#### Scenario: 对比两个运行
- **WHEN** 用户选择两个运行进入对比页
- **THEN** 系统展示各指标的差值、并支持定位差异最大的案例集合

### Requirement: 前端页面能力（列表/表单/筛选/排序/分页）
系统 SHALL 为核心实体提供标准化页面能力：
- 列表：分页、排序、关键词搜索、条件筛选
- 表单：新增、编辑、字段校验
- 详情：只读信息、关联资源跳转
- 删除：二次确认；支持批量删除（MVP 可先单条）

## MODIFIED Requirements
无（初始化仓库）。

## REMOVED Requirements
无。
