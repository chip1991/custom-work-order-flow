import { Handle, Position } from '@xyflow/react';
import { Star } from 'lucide-react';

export default function EvaluateNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-yellow-500 rounded-xl shadow-sm w-56 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-yellow-500 border-2 border-white" />
      <div className="bg-yellow-50 px-3 py-2 flex items-center justify-between border-b border-yellow-100">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-600" />
          <span className="font-semibold text-yellow-900 text-sm">评价节点</span>
        </div>
      </div>
      <div className="p-3 bg-white space-y-2">
        <div className="text-xs text-gray-700 font-medium">{data.label || '用户评价'}</div>
        <div className="text-xs text-gray-500">
          评价方式: {data.method || '未配置'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-yellow-500 border-2 border-white" />
    </div>
  );
}
