# Tasks
- [x] Task 1: Create Frontend Database Node Component
  - [x] SubTask 1.1: Create `DatabaseNode.tsx` in `frontend/src/pages/Agents/components/nodes/`.
  - [x] SubTask 1.2: Register the new node type in `Canvas.tsx`.
  - [x] SubTask 1.3: Add the Database Node to the `Sidebar.tsx` drag-and-drop list under a new or existing category (e.g., "数据流/外部集成").

- [x] Task 2: Implement Database Properties Panel
  - [x] SubTask 2.1: Add rendering logic in `PropertiesPanel.tsx` for `selectedNode.type === 'database'`.
  - [x] SubTask 2.2: Add form fields: Database Type (e.g., MySQL), Connection String, Execution Mode (Read-Only/Read-Write), and SQL Query textarea.
  - [x] SubTask 2.3: Add Parameter Mapping UI to map dynamic upstream variables (via VariableSelector) to SQL parameters securely.

- [ ] Task 3: Implement Backend Database Executor
  - [ ] SubTask 3.1: Install the `mysql2` package in `backend`.
  - [ ] SubTask 3.2: Add `executeDatabase` method to `DagEngine` in `backend/services/dag-engine.js`.
  - [ ] SubTask 3.3: Implement the logic to connect, safely execute parameterized queries using the injected context, return JSON rows, and close the connection.

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 is independent but depends on Task 2 for data contract structure