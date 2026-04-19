import { Handle, Position } from '@xyflow/react';
import { Code } from 'lucide-react';

export default function CodeNode({ data, selected }: any) {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${selected ? 'border-slate-500' : 'border-gray-200'} min-w-[200px]`}>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-slate-500"
      />
      <div className="bg-slate-50 rounded-t-lg p-2 flex items-center gap-2 border-b border-gray-100">
        <Code className="w-4 h-4 text-slate-600" />
        <span className="font-medium text-sm text-gray-700">代码节点</span>
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="text-sm font-semibold text-gray-800">{data.label || '执行代码'}</div>
        <div className="text-xs text-gray-500 truncate bg-gray-50 p-1 rounded font-mono">
          {data.language || 'javascript'}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-slate-500"
      />
    </div>
  );
}