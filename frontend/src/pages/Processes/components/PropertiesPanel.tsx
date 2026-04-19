import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Plus, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNodeData: (id: string, data: any) => void;
}

export default function PropertiesPanel({ selectedNode, onUpdateNodeData }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>请在画布中选择一个节点以查看其属性</p>
      </div>
    );
  }

  const { id, type, data } = selectedNode;
  const customFields: any[] = (data.customFields as any[]) || [];

  const handleFieldChange = (index: number, key: string, value: string) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], [key]: value };
    onUpdateNodeData(id, { customFields: newFields });
  };

  const addField = () => {
    const newFields = [...customFields, { name: '', type: 'text', required: false }];
    onUpdateNodeData(id, { customFields: newFields });
  };

  const removeField = (index: number) => {
    const newFields = customFields.filter((_: any, i: number) => i !== index);
    onUpdateNodeData(id, { customFields: newFields });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">基本属性</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">节点名称</label>
            <input
              type="text"
              value={(data.label as string) || ''}
              onChange={(e) => onUpdateNodeData(id, { label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          
          {type === 'approvalNode' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">审批人</label>
              <input
                type="text"
                value={(data.assignee as string) || ''}
                onChange={(e) => onUpdateNodeData(id, { assignee: e.target.value })}
                placeholder="例如: 张三"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {type === 'taskNode' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">处理组</label>
              <input
                type="text"
                value={(data.group as string) || ''}
                onChange={(e) => onUpdateNodeData(id, { group: e.target.value })}
                placeholder="例如: 维修组"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {type === 'condition' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">判断字段</label>
                <input
                  type="text"
                  value={((data.conditionConfig as any)?.field) || ''}
                  onChange={(e) => onUpdateNodeData(id, { conditionConfig: { ...(data.conditionConfig as any), field: e.target.value } })}
                  placeholder="例如: 工单类型"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">判断条件</label>
                <select
                  value={((data.conditionConfig as any)?.operator) || '='}
                  onChange={(e) => onUpdateNodeData(id, { conditionConfig: { ...(data.conditionConfig as any), operator: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="=">等于 (=)</option>
                  <option value="!=">不等于 (!=)</option>
                  <option value=">">大于 (&gt;)</option>
                  <option value="<">小于 (&lt;)</option>
                  <option value=">=">大于等于 (&gt;=)</option>
                  <option value="<=">小于等于 (&lt;=)</option>
                  <option value="contains">包含</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">比较值</label>
                <input
                  type="text"
                  value={((data.conditionConfig as any)?.value) || ''}
                  onChange={(e) => onUpdateNodeData(id, { conditionConfig: { ...(data.conditionConfig as any), value: e.target.value } })}
                  placeholder="例如: 维修"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">自定义表单字段</h3>
          <button
            onClick={addField}
            className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {customFields.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            暂无自定义字段
          </p>
        ) : (
          <div className="space-y-4">
            {customFields.map((field: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative group">
                <button
                  onClick={() => removeField(index)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">字段名称</label>
                  <input
                    type="text"
                    value={field.name}
                    onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
                    placeholder="例如: 报修类型"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">字段类型</label>
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(index, 'type', e.target.value)}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="text">单行文本 (Text)</option>
                    <option value="textarea">多行文本 (Textarea)</option>
                    <option value="number">数字 (Number)</option>
                    <option value="date">日期 (Date)</option>
                    <option value="select">下拉选择 (Select)</option>
                  </select>
                </div>
                
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id={`required-${index}`}
                    checked={field.required || false}
                    onChange={(e) => handleFieldChange(index, 'required', e.target.checked as any)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`required-${index}`} className="ml-2 block text-xs text-gray-700">
                    必填项
                  </label>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
