import { Handle, Position } from '@xyflow/react';
import { GitMerge } from 'lucide-react';

export default function ConditionNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-orange-500 rounded-xl shadow-sm w-56 relative">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-orange-500 border-2 border-white" />
      
      <div className="bg-orange-50 px-3 py-2 flex items-center justify-between border-b border-orange-100 rounded-t-lg">
        <div className="flex items-center gap-2">
          <GitMerge className="w-4 h-4 text-orange-600" />
          <span className="font-semibold text-orange-900 text-sm">条件判断</span>
        </div>
      </div>
      
      <div className="p-3 bg-white space-y-2 rounded-b-lg">
        <div className="text-xs text-gray-700 font-medium">{data.label || '条件分支'}</div>
        <div className="text-xs text-gray-500">
          判断: {data.conditionConfig?.field || '未配置'} {data.conditionConfig?.operator || ''} {data.conditionConfig?.value || ''}
        </div>
        
        <div className="flex flex-col items-end gap-3 pt-2 relative">
          <div className="text-[10px] text-gray-500 pr-1">是</div>
          <div className="text-[10px] text-gray-500 pr-1">否</div>
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true" 
        style={{ top: '68%' }}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="false" 
        style={{ top: '88%' }}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </div>
  );
}
