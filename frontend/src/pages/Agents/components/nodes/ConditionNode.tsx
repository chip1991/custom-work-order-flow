import { Handle, Position } from '@xyflow/react';
import { GitBranch } from 'lucide-react';

export default function ConditionNode({ data, selected }: any) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${selected ? 'border-teal-500' : 'border-gray-200'} min-w-[200px]`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-teal-500"
      />
      <div className="bg-teal-50 rounded-t-lg p-2 flex items-center gap-2 border-b border-gray-100">
        <GitBranch className="w-4 h-4 text-teal-600" />
        <span className="font-medium text-sm text-gray-700">条件节点</span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="text-sm font-semibold text-gray-800">{data.label || '判断条件'}</div>
        <div className="text-xs text-gray-500 truncate bg-gray-50 p-1 rounded">
          {data.condition || 'IF...ELSE'}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="w-3 h-3 bg-green-500"
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="w-3 h-3 bg-red-500"
        style={{ top: '70%' }}
      />
    </div>
  );
}