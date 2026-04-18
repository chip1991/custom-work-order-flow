import React from 'react';
import { Play, CheckCircle, Settings } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-lg font-semibold text-gray-800">工单节点</h2>
        <p className="text-xs text-gray-500 mt-1">拖拽节点到右侧画布中</p>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        
        {/* 工单节点 */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">流程节点</h3>
          <div className="space-y-3">
            <div
              className="bg-white border-2 border-green-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'submit')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <Play className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">提交节点</div>
                <div className="text-xs text-gray-500">工单起点</div>
              </div>
            </div>

            <div
              className="bg-white border-2 border-orange-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'approve')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">审批节点</div>
                <div className="text-xs text-gray-500">审批流转</div>
              </div>
            </div>

            <div
              className="bg-white border-2 border-purple-200 rounded-lg p-3 cursor-grab hover:shadow-md transition-shadow flex items-center gap-3"
              onDragStart={(event) => onDragStart(event, 'process')}
              draggable
            >
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <div className="font-medium text-gray-800">处理节点</div>
                <div className="text-xs text-gray-500">工单处理</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
