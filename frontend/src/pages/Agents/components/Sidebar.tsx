import React from 'react';
import { Play, Cpu, Square } from 'lucide-react';

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
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
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
    </aside>
  );
}
