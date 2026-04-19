import { Handle, Position } from '@xyflow/react';
import { PhoneCall } from 'lucide-react';

export default function CallbackNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-teal-500 rounded-xl shadow-sm w-56 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-teal-500 border-2 border-white" />
      <div className="bg-teal-50 px-3 py-2 flex items-center justify-between border-b border-teal-100">
        <div className="flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-teal-600" />
          <span className="font-semibold text-teal-900 text-sm">回访节点</span>
        </div>
      </div>
      <div className="p-3 bg-white space-y-2">
        <div className="text-xs text-gray-700 font-medium">{data.label || '客户回访'}</div>
        <div className="text-xs text-gray-500">
          回访人: {data.assignee || '未配置'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-teal-500 border-2 border-white" />
    </div>
  );
}
