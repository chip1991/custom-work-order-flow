import { Handle, Position } from '@xyflow/react';
import { CheckCircle } from 'lucide-react';

export default function ApprovalNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-blue-500 rounded-xl shadow-sm w-56 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500 border-2 border-white" />
      <div className="bg-blue-50 px-3 py-2 flex items-center justify-between border-b border-blue-100">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-900 text-sm">审批节点</span>
        </div>
      </div>
      <div className="p-3 bg-white space-y-2">
        <div className="text-xs text-gray-700 font-medium">{data.label || '人工审批'}</div>
        <div className="text-xs text-gray-500">
          审批人: {data.assignee || '未配置'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    </div>
  );
}
