import React from 'react';
import { Play, Cpu, Square, Database, Puzzle, GitBranch, Code, Server } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">节点组件</h2>
        <p className="text-xs text-gray-500 mt-1">拖拽节点到右侧画布中</p>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        
        {/* 基础节点 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">基础节点</h3>
          <div className="space-y-3">
            <div
              className="bg-white border-2 border-green-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'start')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">开始节点</div>
                <div className="text-xs text-gray-500">流程起点</div>
              </div>
            </div>

            <div
              className="bg-white border-2 border-red-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'end')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <Square className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">结束节点</div>
                <div className="text-xs text-gray-500">流程终点</div>
              </div>
            </div>
          </div>
        </div>

        {/* 核心节点 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">核心节点</h3>
          <div className="space-y-3">
            <div
              className="bg-white border-2 border-blue-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'llm')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">LLM 节点</div>
                <div className="text-xs text-gray-500">调用大语言模型</div>
              </div>
            </div>

            <div
              className="bg-white border-2 border-purple-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'knowledge_base')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">知识库节点</div>
                <div className="text-xs text-gray-500">检索私有知识</div>
              </div>
            </div>

            <div
              className="bg-white border-2 border-orange-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'plugin')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Puzzle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">插件/工具</div>
                <div className="text-xs text-gray-500">执行外部工具</div>
              </div>
            </div>
          </div>
        </div>

        {/* 逻辑节点 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">逻辑节点</h3>
          <div className="space-y-3">
            <div
              className="bg-white border-2 border-teal-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'condition')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                <GitBranch className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">条件节点</div>
                <div className="text-xs text-gray-500">条件分支判断</div>
              </div>
            </div>

            <div
              className="bg-white border-2 border-slate-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'code')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Code className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">代码节点</div>
                <div className="text-xs text-gray-500">执行自定义代码</div>
              </div>
            </div>
          </div>
        </div>

        {/* 外部集成 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">外部集成</h3>
          <div className="space-y-3">
            <div
              className="bg-white border-2 border-indigo-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'database')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">数据库节点</div>
                <div className="text-xs text-gray-500">执行SQL查询</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
