import { Handle, Position } from '@xyflow/react';
import { Briefcase } from 'lucide-react';

export default function TaskNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-orange-500 rounded-xl shadow-sm w-56 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500 border-2 border-white" />
      <div className="bg-orange-50 px-3 py-2 flex items-center justify-between border-b border-orange-100">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-orange-600" />
          <span className="font-semibold text-orange-900 text-sm">工单处理节点</span>
        </div>
      </div>
      <div className="p-3 bg-white space-y-2">
        <div className="text-xs text-gray-700 font-medium">{data.label || '处理工单'}</div>
        <div className="text-xs text-gray-500">
          处理组: {data.group || '未配置'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-orange-500 border-2 border-white" />
    </div>
  );
}
