import React, { useState, useRef, useEffect } from 'react';
import { Model } from '@/lib/api';
import { Settings, SlidersHorizontal, Plus } from 'lucide-react';
import { Node, Edge } from '@xyflow/react';

interface PropertiesPanelProps {
  selectedNode: any | null;
  onUpdateNodeData: (id: string, data: any) => void;
  models: Model[];
  nodes: Node[];
  edges: Edge[];
}

function getUpstreamNodes(targetNodeId: string, nodes: Node[], edges: Edge[]): Node[] {
  const upstreamNodes = new Map<string, Node>();
  const visited = new Set<string>();

  const traverse = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const incomingEdges = edges.filter(e => e.target === nodeId);
    for (const edge of incomingEdges) {
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode) {
        if (!upstreamNodes.has(sourceNode.id)) {
           upstreamNodes.set(sourceNode.id, sourceNode);
        }
        traverse(sourceNode.id);
      }
    }
  };

  traverse(targetNodeId);
  return Array.from(upstreamNodes.values());
}

const VariableSelector = ({ 
  upstreamNodes, 
  onSelect 
}: { 
  upstreamNodes: Node[], 
  onSelect: (variable: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (upstreamNodes.length === 0) return null;

  return (
    <div className="relative inline-block text-left ml-2" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center text-xs text-indigo-600 hover:text-indigo-800"
      >
        <Plus className="w-3 h-3 mr-1" />
        插入变量
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 max-h-60 overflow-y-auto" role="menu" aria-orientation="vertical">
            {upstreamNodes.map((node) => (
              <button
                key={node.id}
                onClick={() => {
                  onSelect(`{{${node.id}.output}}`);
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
              >
                {node.data?.label || node.id}.output
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PropertiesPanel({
  selectedNode,
  onUpdateNodeData,
  models,
  nodes,
  edges,
}: PropertiesPanelProps) {

  const renderNodeSettings = () => {
    if (!selectedNode) return null;

    const data = selectedNode.data || {};
    const updateData = (newData: any) => {
      onUpdateNodeData(selectedNode.id, { ...data, ...newData });
    };

    const upstreamNodes = getUpstreamNodes(selectedNode.id, nodes, edges);

    const handleInsertVariable = (field: string, variable: string) => {
      const currentValue = data[field] || '';
      updateData({ [field]: currentValue + (currentValue.endsWith(' ') || currentValue === '' ? '' : ' ') + variable });
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
                <option value="">使用智能体默认模型</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span>系统提示词</span>
                <VariableSelector
                  upstreamNodes={upstreamNodes}
                  onSelect={(v) => handleInsertVariable('systemPrompt', v)}
                />
              </label>
              <textarea
                value={data.systemPrompt || ''}
                onChange={(e) => updateData({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={6}
                placeholder="你是一个有用的助手..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span>用户提示词模板</span>
                <VariableSelector
                  upstreamNodes={upstreamNodes}
                  onSelect={(v) => handleInsertVariable('userPrompt', v)}
                />
              </label>
              <textarea
                value={data.userPrompt || ''}
                onChange={(e) => updateData({ userPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={4}
                placeholder="来自上一个节点的输入..."
              />
            </div>
          </>
        )}

        {selectedNode.type === 'knowledge_base' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择知识库</label>
              <select
                value={data.kbId || ''}
                onChange={(e) => updateData({ kbId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">请选择知识库</option>
                <option value="kb-1">企业产品文档</option>
                <option value="kb-2">内部维基</option>
                <option value="kb-3">客服QA对</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">检索策略</label>
              <select
                value={data.strategy || 'hybrid'}
                onChange={(e) => updateData({ strategy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="vector">向量检索</option>
                <option value="keyword">全文检索</option>
                <option value="hybrid">混合检索</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Top K (返回数量)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={data.topK || 3}
                onChange={(e) => updateData({ topK: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </>
        )}

        {selectedNode.type === 'plugin' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">选择插件/工具</label>
              <select
                value={data.pluginId || ''}
                onChange={(e) => updateData({ pluginId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">请选择工具</option>
                <option value="web_search">网络搜索 (Web Search)</option>
                <option value="calculator">计算器 (Calculator)</option>
                <option value="weather">天气查询 (Weather API)</option>
                <option value="github">GitHub API</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">参数映射 (JSON)</label>
              <textarea
                value={data.params || '{\n  "query": "{{input}}"\n}'}
                onChange={(e) => updateData({ params: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={5}
              />
            </div>
          </>
        )}

        {selectedNode.type === 'condition' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">条件表达式 (JavaScript)</label>
              <textarea
                value={data.condition || 'input.length > 0'}
                onChange={(e) => updateData({ condition: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={3}
                placeholder="例如: input.includes('error')"
              />
            </div>
            <p className="text-xs text-gray-500">
              如果表达式返回 true，将执行绿色分支；否则执行红色分支。
            </p>
          </>
        )}

        {selectedNode.type === 'code' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">编程语言</label>
              <select
                value={data.language || 'javascript'}
                onChange={(e) => updateData({ language: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">代码实现</label>
              <textarea
                value={data.code || 'function main(input) {\n  return input;\n}'}
                onChange={(e) => updateData({ code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={8}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
        <Settings className="w-12 h-12 mb-4 text-gray-300" />
        <p>请在左侧画布中选择一个节点以查看和编辑其属性。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-y-auto z-10">
      <div className="p-4">
        {renderNodeSettings()}
      </div>
    </div>
  );
}
