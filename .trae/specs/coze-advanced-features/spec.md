# Coze Advanced Features Spec

## Why
在完成了基础的三栏式布局和占位符执行引擎之后，需要将当前的系统升级为一个可真正在生产环境中运行的高级 AI 工作流编排平台。核心痛点在于：当前复杂节点仅返回静态占位符、DAG 引擎调度为低效的串行逻辑，且用户只能手动输入复杂的变量路径（如 `{{node.output}}`）。

## What Changes
- **后端：真实的 LLM 节点执行**。将 `dag-engine.js` 中的占位符执行器替换为真实的 OpenAI 客户端调用逻辑，通过数据库获取对应的 API 凭证，并将上游节点的输出动态注入到 Prompt 中。
- **后端：真正的并发 DAG 调度**。摒弃串行的 `for...of` 循环，采用基于“入度计数器（In-Degree Counter）”的异步并发调度机制。
- **前端：可视化变量选择器**。在节点属性配置面板（PropertiesPanel）中增加变量选择组件，自动反推当前节点的可访问上游依赖，让用户能直观地通过下拉列表选择变量，而非手动输入。

## Impact
- Affected specs: `coze-like-agent-refactoring`
- Affected code:
  - 后端：`backend/services/dag-engine.js`，`backend/routes/agents.js`。
  - 前端：`frontend/src/pages/Agents/components/PropertiesPanel.tsx`，可能需要增加新的选择器组件或重构输入框。

## ADDED Requirements
### Requirement: Real LLM Execution
The system SHALL execute the LLM Node using the actual configured AI Model, passing context variables properly substituted.

### Requirement: Concurrent Scheduling
The system SHALL execute independent nodes simultaneously.
#### Scenario: Success case
- **WHEN** workflow contains two parallel Plugin nodes and one LLM node depending on them
- **THEN** the system executes both Plugin nodes at the same time, and waits for both to finish before executing the LLM node.

### Requirement: Visual Variable Selection
The system SHALL provide a dropdown selector for inserting upstream variables.
#### Scenario: Success case
- **WHEN** user edits a property in the Properties Panel
- **THEN** user can select upstream node outputs from a visual list instead of typing `{{node_id.output}}`.