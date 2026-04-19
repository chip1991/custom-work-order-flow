import { Handle, Position } from '@xyflow/react';
import { AlertTriangle } from 'lucide-react';

export default function EscalateNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-rose-500 rounded-xl shadow-sm w-56 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-rose-500 border-2 border-white" />
      <div className="bg-rose-50 px-3 py-2 flex items-center justify-between border-b border-rose-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span className="font-semibold text-rose-900 text-sm">低分升级节点</span>
        </div>
      </div>
      <div className="p-3 bg-white space-y-2">
        <div className="text-xs text-gray-700 font-medium">{data.label || '低分处理升级'}</div>
        <div className="text-xs text-gray-500">
          升级至: {data.target || '未配置'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-rose-500 border-2 border-white" />
    </div>
  );
}
