import { Handle, Position } from '@xyflow/react';
import { Flag } from 'lucide-react';

export default function EndNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-red-500 rounded-xl shadow-sm w-48 overflow-hidden">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-red-500 border-2 border-white" />
      <div className="bg-red-50 px-3 py-2 flex items-center gap-2 border-b border-red-100">
        <Flag className="w-4 h-4 text-red-600" />
        <span className="font-semibold text-red-900 text-sm">结束节点</span>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{data.label || '流程结束'}</p>
      </div>
    </div>
  );
}
