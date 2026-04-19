import { Handle, Position } from '@xyflow/react';
import { Square } from 'lucide-react';

export default function EndNode({ data, selected }: any) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${selected ? 'border-red-500' : 'border-gray-200'} min-w-[150px]`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-red-500"
      />
      <div className="bg-red-50 rounded-t-lg p-2 flex items-center gap-2 border-b border-gray-100">
        <Square className="w-4 h-4 text-red-600" />
        <span className="font-medium text-sm text-gray-700">结束</span>
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500">{data.label || '流程结束'}</div>
      </div>
    </div>
  );
}
