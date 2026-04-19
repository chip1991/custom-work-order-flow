import React, { useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useReactFlow,
  Panel,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nodeTypes } from './nodes';
import CustomEdge from './edges/CustomEdge';

const edgeTypes = {
  default: CustomEdge,
};

interface CanvasProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodeSelect: (node: Node | null) => void;
  activeNodeId?: string | null;
}

const getId = () => `node_${Math.random().toString(36).substr(2, 9)}`;

export default function Canvas({ nodes, edges, setNodes, setEdges, onNodeSelect, activeNodeId }: CanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Highlight active node
  const displayNodes = React.useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      style: {
        ...node.style,
        boxShadow: activeNodeId === node.id ? '0 0 0 3px rgba(79, 70, 229, 0.5)' : node.style?.boxShadow,
        transition: 'box-shadow 0.3s ease',
      }
    }));
  }, [nodes, activeNodeId]);

  // Handle selection changes
  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    if (nodes.length > 0) {
      onNodeSelect(nodes[0]);
    } else {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );
  
  const onConnect: OnConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, markerEnd: { type: MarkerType.ArrowClosed }, type: 'default' }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: { label: `${type.toUpperCase()} Node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  return (
    <div className="flex-1 h-full w-full bg-gray-50 relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={displayNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'default' }}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <Panel position="top-left" className="bg-white px-3 py-1 shadow-sm rounded-md border border-gray-200 text-sm text-gray-500 font-medium">
          拖拽左侧节点到画布以构建流程
        </Panel>
      </ReactFlow>
    </div>
  );
}
