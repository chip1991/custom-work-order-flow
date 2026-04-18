import React from 'react';
import { Node, Edge } from '@xyflow/react';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNodeData: (nodeId: string, newData: any) => void;
  nodes: Node[];
  edges: Edge[];
}

export default function PropertiesPanel({
  selectedNode,
  onUpdateNodeData,
}: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>请在画布中选择一个节点</p>
        <p className="text-sm mt-2">点击节点以编辑其属性</p>
      </div>
    );
  }

  const { id, type, data } = selectedNode;

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">
          {type === 'submit' ? '提交节点' : type === 'approve' ? '审批节点' : type === 'process' ? '处理节点' : '节点'} 设置
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
            <input
              type="text"
              value={data.label as string || ''}
              onChange={(e) => onUpdateNodeData(id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="输入节点名称"
            />
          </div>

          {type === 'approve' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">审批人</label>
              <input
                type="text"
                value={data.approver as string || ''}
                onChange={(e) => onUpdateNodeData(id, { approver: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="例如: admin, manager"
              />
            </div>
          )}

          {type === 'process' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">处理人</label>
              <input
                type="text"
                value={data.processor as string || ''}
                onChange={(e) => onUpdateNodeData(id, { processor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="例如: operator, support"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
