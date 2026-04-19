# Refactor Database Node Config Spec

## Why
目前的数据库节点在配置时要求用户手动输入包含账号密码和特殊字符的 `mysql://...` 连接字符串，对非开发人员（小白用户）极度不友好且容易出错（如密码带有 `@` 等特殊字符未转义会导致连接失败）。我们需要将配置面板拆分为更直观的“表单模式”，并在后端进行安全的兼容适配。

## What Changes
- **前端：双模式切换与表单拆分**。在 `PropertiesPanel.tsx` 中，为 `database` 节点新增 `configMode`（表单模式/URI模式）切换开关。表单模式下提供 Host, Port, Username, Password, Database Name 等独立输入框。
- **后端：连接字符串适配器**。在 `dag-engine.js` 的 `executeDatabase` 中，判断 `configMode`：
  - 若为 `uri` 或空（兼容旧数据），则沿用原有的 `connectionString`。
  - 若为 `form`，则使用 `encodeURIComponent` 安全地拼接各字段，动态生成符合底层驱动要求的 URI。

## Impact
- Affected specs: `add-database-node`
- Affected code:
  - 前端：`frontend/src/pages/Agents/components/PropertiesPanel.tsx`
  - 后端：`backend/services/dag-engine.js`

## ADDED Requirements
### Requirement: Dual Mode Database Configuration
The system SHALL allow users to configure database connection using either a simple Form (Host, Port, User, Pass, DB) or an advanced URI string.

#### Scenario: Success case
- **WHEN** user selects Form mode and inputs credentials with special characters in the password
- **THEN** the system saves the split fields, and the backend safely encodes the credentials to connect to the database without errors.

## MODIFIED Requirements
### Requirement: Database Execution Adapter
The existing Database Executor MUST adapt to the new `configMode` payload structure while remaining backward compatible with nodes saved previously using only `connectionString`.