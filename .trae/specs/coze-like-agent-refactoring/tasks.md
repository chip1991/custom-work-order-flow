# Tasks
- [x] Task 1: UI Layout Enhancement
  - [x] SubTask 1.1: Refactor Editor.tsx to strict Left-Center-Right layout.
  - [x] SubTask 1.2: Add Playground drawer/panel component.
- [x] Task 2: Node Types Expansion (Frontend)
  - [x] SubTask 2.1: Create Knowledge Base Node component and properties form.
  - [x] SubTask 2.2: Create Plugin/Tool Node component and properties form.
  - [x] SubTask 2.3: Create Condition/Code Node components.
  - [x] SubTask 2.4: Update Sidebar to categorize available nodes.
- [x] Task 3: Backend DAG Engine Implementation
  - [x] SubTask 3.1: Implement DAG parser and topological sorting.
  - [x] SubTask 3.2: Implement Context manager for variable substitution (`{{node.output}}`).
  - [x] SubTask 3.3: Implement executors for new node types (Knowledge, Tool, Condition).
- [x] Task 4: Playground Integration & Streaming
  - [x] SubTask 4.1: Connect Playground to DAG engine execution API.
  - [x] SubTask 4.2: Implement SSE streaming for execution results and trace logs.
  - [x] SubTask 4.3: Add real-time visual feedback (node highlighting) during execution.

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 3