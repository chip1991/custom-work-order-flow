# Tasks
- [x] Task 1: Concurrent DAG Scheduling (Backend)
  - [x] SubTask 1.1: Refactor `parseAndSort` in `dag-engine.js` to compute `inDegree` and output dependencies instead of a flat sorted array.
  - [x] SubTask 1.2: Refactor `run` loop to use asynchronous Promise pool handling ready nodes concurrently (where `inDegree === 0`).
  - [x] SubTask 1.3: Properly handle Skip/Branch logic for Condition Nodes to skip unreachable downstream nodes.

- [x] Task 2: Real LLM Execution Integration (Backend)
  - [x] SubTask 2.1: Import `OpenAI` client (or similar) into `dag-engine.js`.
  - [x] SubTask 2.2: Retrieve Model settings (API Key, Base URL) from database when initializing the Engine or LLM Executor.
  - [x] SubTask 2.3: Replace LLM Node placeholder with actual OpenAI chat completion request, passing substituted `systemPrompt` and `userPrompt`.
  - [x] SubTask 2.4: Ensure streaming chunks emit SSE events.

- [x] Task 3: Visual Variable Selector (Frontend)
  - [x] SubTask 3.1: Create a utility function to compute accessible upstream nodes for a given selected node.
  - [x] SubTask 3.2: Update `PropertiesPanel.tsx` (or Node-specific forms) to include a dropdown/popover component for inserting `{{upstreamNode.output}}` visually.

# Task Dependencies
- Task 2 depends on Task 1 (for robust scheduling)
- Task 3 is independent but better done after backend is stable.