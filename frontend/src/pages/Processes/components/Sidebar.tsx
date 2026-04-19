import { FileText, CheckCircle, Briefcase, Flag } from 'lucide-react';

export default function Sidebar() {
  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/reactflow/label', label);
    event.dataTransfer.effectAllowed = 'move';
  };

  const nodeTypes = [
    { type: 'startNode', label: '开始节点', icon: <Flag className="w-5 h-5 text-green-500" />, desc: '流程的起点' },
    { type: 'approvalNode', label: '审批节点', icon: <CheckCircle className="w-5 h-5 text-blue-500" />, desc: '需要人员审批' },
    { type: 'taskNode', label: '工单处理节点', icon: <Briefcase className="w-5 h-5 text-orange-500" />, desc: '具体处理工单的任务' },
    { type: 'endNode', label: '结束节点', icon: <Flag className="w-5 h-5 text-red-500" />, desc: '流程的终点' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full z-10">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          节点库
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {nodeTypes.map((nt) => (
          <div
            key={nt.type}
            className="flex items-start p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:border-indigo-500 hover:shadow-md transition-all group"
            onDragStart={(event) => onDragStart(event, nt.type, nt.label)}
            draggable
          >
            <div className="mr-3 mt-0.5 p-1.5 bg-gray-50 rounded-md group-hover:bg-indigo-50 transition-colors">
              {nt.icon}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{nt.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{nt.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
