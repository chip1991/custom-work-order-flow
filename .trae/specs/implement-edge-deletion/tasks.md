# Tasks
- [x] Task 1: Enable Keyboard Edge Deletion
  - [x] SubTask 1.1: In `Canvas.tsx`, ensure the `<ReactFlow>` component has `deleteKeyCode={['Backspace', 'Delete']}` configured.
  - [x] SubTask 1.2: Ensure the outer div or container can properly receive keyboard focus so that the delete keypress works as intended.

- [x] Task 2: Implement Custom Hover Deletion Edge
  - [x] SubTask 2.1: Create `CustomEdge.tsx` in a new folder `frontend/src/pages/Agents/components/edges/`.
  - [x] SubTask 2.2: In `CustomEdge.tsx`, render the standard bezier edge and calculate the midpoint.
  - [x] SubTask 2.3: Render an `<EdgeLabelRenderer>` at the midpoint containing a delete button (trash icon).
  - [x] SubTask 2.4: Apply CSS so that the button is only visible when hovering over the edge, or when the edge is selected.
  - [x] SubTask 2.5: Implement the click handler for the delete button to filter out the current edge using `setEdges` (passed via React Flow context).

- [x] Task 3: Integrate Custom Edge into Canvas
  - [x] SubTask 3.1: Register `CustomEdge` in `Canvas.tsx` as the default edge type (`edgeTypes={{ default: CustomEdge }}`).
  - [x] SubTask 3.2: Ensure that newly created edges (`onConnect`) default to using this custom edge type.

# Task Dependencies
- Task 3 depends on Task 2