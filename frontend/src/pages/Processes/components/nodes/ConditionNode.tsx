import { Handle, Position } from '@xyflow/react';
import { GitMerge } from 'lucide-react';

export default function ConditionNode({ data }: { data: any }) {
  const branches = data.branches || [
    { id: 'true', name: '是', conditionConfig: data.conditionConfig },
    { id: 'false', name: '否' }
  ];

  const renderConditionText = (config: any) => {
    if (!config) return '未配置';
    
    let conditions = [];
    let logicalOperator = 'AND';

    if (Array.isArray(config.conditions)) {
      conditions = config.conditions;
      logicalOperator = config.logicalOperator || 'AND';
    } else if (config.field) {
      conditions = [config];
    }

    if (conditions.length === 0) {
      return '未配置';
    }

    if (conditions.length === 1) {
      const cond = conditions[0];
      return `${cond.field || '未配置'} ${cond.operator || ''} ${cond.value || ''}`;
    }

    return `[${conditions.length}个条件] 满足${logicalOperator === 'AND' ? '所有' : '任一'}`;
  };

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
        
        <div className="flex flex-col gap-2 pt-2">
          {branches.map((branch: any, index: number) => (
            <div key={branch.id} className="relative flex flex-col gap-1 bg-gray-50 p-2 rounded border border-gray-100">
              <div className="flex justify-between items-center text-xs text-gray-700 font-medium">
                <span className="truncate w-32">{branch.name || `分支 ${index + 1}`}</span>
                <Handle 
                  type="source" 
                  position={Position.Right} 
                  id={branch.id} 
                  className="w-3 h-3 bg-orange-500 border-2 border-white !-right-4"
                />
              </div>
              <div className="text-[10px] text-gray-500">
                判断: {renderConditionText(branch.conditionConfig)}
              </div>
            </div>
          ))}
          
          <div className="relative flex justify-between items-center text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100 mt-1">
            <span className="truncate w-32">默认/否则</span>
            <Handle 
              type="source" 
              position={Position.Right} 
              id="default" 
              className="w-3 h-3 bg-orange-500 border-2 border-white !-right-4"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
