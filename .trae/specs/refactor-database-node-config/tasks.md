# Tasks
- [x] Task 1: Update Frontend Database Configuration UI
  - [x] SubTask 1.1: In `PropertiesPanel.tsx`, add a `configMode` property (form vs uri) to the Database Node configuration.
  - [x] SubTask 1.2: Add a mode switch (e.g., Radio group or Buttons) between "表单模式" (Form) and "URI 模式" (URI).
  - [x] SubTask 1.3: If `configMode === 'form'`, display individual inputs: Host, Port, Username, Password (with eye toggle or simply type="password"), and Database Name.
  - [x] SubTask 1.4: Update existing logic to keep the connection string input visible only when `configMode === 'uri'`.

- [x] Task 2: Implement Backend Adapter in DAG Engine
  - [x] SubTask 2.1: In `dag-engine.js` `executeDatabase` method, retrieve the node data properties.
  - [x] SubTask 2.2: Add logic to build the `connectionString` dynamically if `configMode === 'form'`, securely encoding the username and password using `encodeURIComponent`.
  - [x] SubTask 2.3: Keep fallback compatibility (if `configMode` is missing or `uri`, use the existing `connectionString`).

# Task Dependencies
- Task 2 depends on Task 1 (for payload structure validation)