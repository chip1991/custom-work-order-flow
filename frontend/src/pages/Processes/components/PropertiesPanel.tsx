import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { FormField } from './FormBuilder';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNodeData: (id: string, data: any) => void;
  formConfig?: FormField[];
  activeTab?: 'properties' | 'permissions';
}

export default function PropertiesPanel({ selectedNode, onUpdateNodeData, formConfig = [], activeTab = 'properties' }: PropertiesPanelProps) {
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
      {activeTab === 'properties' ? (
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

          {['taskNode', 'acceptNode', 'callbackNode', 'escalateNode'].includes(type) && (
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

          {(type === 'approvalNode' || ['taskNode', 'acceptNode', 'callbackNode', 'escalateNode'].includes(type)) && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">节点描述</label>
                <textarea
                  value={(data.description as string) || ''}
                  onChange={(e) => onUpdateNodeData(id, { description: e.target.value })}
                  placeholder="输入节点描述信息"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">审批方式</label>
                <select
                  value={(data.approvalType as string) || 'or'}
                  onChange={(e) => onUpdateNodeData(id, { approvalType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="or">或签 (一名审批人同意即可)</option>
                  <option value="and">会签 (所有审批人同意才可)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">办理时限 (小时)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={(data.timeLimit as number) || ''}
                  onChange={(e) => onUpdateNodeData(id, { timeLimit: Number(e.target.value) })}
                  placeholder="例如: 24"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
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
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">表单字段权限</h3>
          </div>

          {formConfig.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              暂无全局表单字段，请先在“表单配置”中添加
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">字段信息</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">可编辑</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">只读</th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">隐藏</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formConfig.map((field) => {
                    const currentPermission = fieldPermissions[field.id] || 'editable';
                    return (
                      <tr key={field.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{field.name || '未命名字段'}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            类型: {field.type} {field.required ? '(必填)' : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="radio"
                            name={`permission-${field.id}`}
                            value="editable"
                            checked={currentPermission === 'editable'}
                            onChange={(e) => handlePermissionChange(field.id, e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="radio"
                            name={`permission-${field.id}`}
                            value="readonly"
                            checked={currentPermission === 'readonly'}
                            onChange={(e) => handlePermissionChange(field.id, e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="radio"
                            name={`permission-${field.id}`}
                            value="hidden"
                            checked={currentPermission === 'hidden'}
                            onChange={(e) => handlePermissionChange(field.id, e.target.value)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
