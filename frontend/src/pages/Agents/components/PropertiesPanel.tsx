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
                <option value="">使用智能体默认模型</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">系统提示词</label>
              <textarea
                value={data.systemPrompt || ''}
                onChange={(e) => updateData({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs"
                rows={6}
                placeholder="你是一个有用的助手..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">用户提示词模板</label>
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
