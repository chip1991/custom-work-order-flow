import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export default function StartNode({ data, selected }: any) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${selected ? 'border-green-500' : 'border-gray-200'} min-w-[150px]`}>
      <div className="bg-green-50 rounded-t-lg p-2 flex items-center gap-2 border-b border-gray-100">
        <Play className="w-4 h-4 text-green-600" />
        <span className="font-medium text-sm text-gray-700">开始</span>
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500">{data.label || '入口点'}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
}
