import { Handle, Position } from '@xyflow/react';
import { Play } from 'lucide-react';

export default function SubmitNode({ data, selected }: any) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${selected ? 'border-green-500' : 'border-gray-200'} min-w-[200px]`}>
      <div className="bg-green-50 rounded-t-lg p-2 flex items-center gap-2 border-b border-gray-100">
        <Play className="w-4 h-4 text-green-600" />
        <span className="font-medium text-sm text-gray-700">提交节点</span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="text-sm font-semibold text-gray-800">{data.label || '开始提交'}</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500"
      />
    </div>
  );
}
