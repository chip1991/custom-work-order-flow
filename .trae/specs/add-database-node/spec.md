# Add Database Node Spec

## Why
在 AI 工作流编排中，大模型缺乏持久化记忆以及对结构化数据的精确操作能力。为了提供更强大的 Agent 编排体验，我们需要参考 Coze 增加一个“连接外部数据库 (Database)”节点，允许 Agent 在执行过程中读写真实的业务数据库。

## What Changes
- **前端：新增数据库节点组件**。在左侧物料库和中间画布中支持 `DatabaseNode`。
- **前端：新增数据库属性配置面板**。在 `PropertiesPanel.tsx` 中支持配置数据库类型、连接字符串、执行模式、SQL 语句以及安全的参数映射。
- **后端：新增 `database` 节点执行器**。在 `DagEngine` 中解析前端传来的 SQL 和参数，使用 `mysql2` 驱动执行真实的数据库操作，并将结果集转化为 JSON 数组返回。

## Impact
- Affected specs: `coze-like-agent-refactoring`, `coze-advanced-features`
- Affected code:
  - 前端：`frontend/src/pages/Agents/components/nodes/DatabaseNode.tsx` (New), `frontend/src/pages/Agents/components/Sidebar.tsx`, `frontend/src/pages/Agents/components/PropertiesPanel.tsx`
  - 后端：`backend/services/dag-engine.js`，`backend/package.json` (需要安装 `mysql2`)

## ADDED Requirements
### Requirement: Database Node UI
The system SHALL provide a draggable Database node and a properties panel to configure its connection and query.

### Requirement: Database Execution
The system SHALL safely execute the parameterized SQL query against the specified external database during workflow execution.
#### Scenario: Success case
- **WHEN** the DAG Engine encounters a Database node with a valid query and mapped parameters
- **THEN** it connects to the database, executes the parameterized query to prevent SQL injection, and sets the returned rows as the node's output context.