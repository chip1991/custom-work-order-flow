import { Handle, Position } from '@xyflow/react';
import { Inbox } from 'lucide-react';

export default function AcceptNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-indigo-500 rounded-xl shadow-sm w-56 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
      <div className="bg-indigo-50 px-3 py-2 flex items-center justify-between border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <Inbox className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-indigo-900 text-sm">受理节点</span>
        </div>
      </div>
      <div className="p-3 bg-white space-y-2">
        <div className="text-xs text-gray-700 font-medium">{data.label || '工单受理'}</div>
        <div className="text-xs text-gray-500">
          受理人: {data.assignee || '未配置'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-indigo-500 border-2 border-white" />
    </div>
  );
}
