import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { FormField } from './FormBuilder';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNodeData: (id: string, data: any) => void;
  formConfig?: FormField[];
}

export default function PropertiesPanel({ selectedNode, onUpdateNodeData, formConfig = [] }: PropertiesPanelProps) {
  if (!selectedNode) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>请在画布中选择一个节点以查看其属性</p>
      </div>
    );
  }

  const { id, type, data } = selectedNode;
  const fieldPermissions: Record<string, string> = (data.fieldPermissions as Record<string, string>) || {};

  const handlePermissionChange = (fieldId: string, permission: string) => {
    const newPermissions = { ...fieldPermissions, [fieldId]: permission };
    onUpdateNodeData(id, { fieldPermissions: newPermissions });
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
          <h3 className="text-lg font-medium text-gray-900">表单字段权限</h3>
        </div>

        {formConfig.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            暂无全局表单字段，请先在“表单配置”中添加
          </p>
        ) : (
          <div className="space-y-4">
            {formConfig.map((field) => (
              <div key={field.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">{field.name || '未命名字段'}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    类型: {field.type} {field.required ? '(必填)' : ''}
                  </div>
                </div>
                <select
                  value={fieldPermissions[field.id] || 'editable'}
                  onChange={(e) => handlePermissionChange(field.id, e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="editable">可写 (Editable)</option>
                  <option value="readonly">只读 (Readonly)</option>
                  <option value="hidden">隐藏 (Hidden)</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
