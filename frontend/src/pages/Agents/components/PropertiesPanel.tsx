import React from 'react';
import { Model } from '@/lib/api';
import { Settings, SlidersHorizontal } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: any | null;
  onUpdateNodeData: (id: string, data: any) => void;
  models: Model[];
}

export default function PropertiesPanel({
  selectedNode,
  onUpdateNodeData,
  models,
}: PropertiesPanelProps) {

  const renderNodeSettings = () => {
    if (!selectedNode) return null;

    const data = selectedNode.data || {};
    const updateData = (newData: any) => {
      onUpdateNodeData(selectedNode.id, { ...data, ...newData });
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
          <SlidersHorizontal className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-800">节点设置 ({selectedNode.type})</h3>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(e) => updateData({ label: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        {selectedNode.type === 'llm' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择模型</label>
              <select
                value={data.modelId || ''}
                onChange={(e) => updateData({ modelId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">使用 Agent 默认模型</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">系统提示词 (System Prompt)</label>
              <textarea
                value={data.systemPrompt || ''}
                onChange={(e) => updateData({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={6}
                placeholder="You are a helpful assistant..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户提示词模板 (User Prompt)</label>
              <textarea
                value={data.userPrompt || ''}
                onChange={(e) => updateData({ userPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={4}
                placeholder="Input from previous node..."
              />
            </div>
          </>
        )}
      </div>
    );
  };

  if (!selectedNode) return null;

  return (
    <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full overflow-y-auto shadow-sm z-10">
      <div className="p-4">
        {renderNodeSettings()}
      </div>
    </aside>
  );
}
