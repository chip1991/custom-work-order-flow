import { Handle, Position } from '@xyflow/react';
import { Flag } from 'lucide-react';

export default function StartNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-green-500 rounded-xl shadow-sm w-48 overflow-hidden">
      <div className="bg-green-50 px-3 py-2 flex items-center gap-2 border-b border-green-100">
        <Flag className="w-4 h-4 text-green-600" />
        <span className="font-semibold text-green-900 text-sm">开始节点</span>
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-500">{data.label || '流程开始'}</p>
      </div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-green-500 border-2 border-white" />
    </div>
  );
}
