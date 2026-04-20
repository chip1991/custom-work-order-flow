import React, { useState } from 'react';
import { Node } from '@xyflow/react';
import { Trash2, Plus } from 'lucide-react';
import { FormField } from './FormBuilder';

interface PropertiesPanelProps {
  selectedNode: Node | null;
  onUpdateNodeData: (id: string, data: any) => void;
  formConfig?: FormField[];
  activeTab?: 'properties' | 'permissions';
}

export default function PropertiesPanel({ selectedNode, onUpdateNodeData, formConfig = [], activeTab = 'properties' }: PropertiesPanelProps) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

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
          
          {['approvalNode', 'taskNode', 'acceptNode', 'callbackNode', 'escalateNode'].includes(type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">处理人/处理组</label>
              <input
                type="text"
                value={(data.assignee as string) || (data.group as string) || ''}
                onChange={(e) => onUpdateNodeData(id, { assignee: e.target.value, group: e.target.value })}
                placeholder="例如: 张三 或 维修组"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          {['approvalNode', 'taskNode', 'acceptNode', 'callbackNode', 'escalateNode'].includes(type) && (
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

          {(type === 'condition' || type === 'conditionNode') && (() => {
            const branches = data.branches as any[] || [{
              id: 'branch_1',
              name: '分支 1',
              conditionConfig: data.conditionConfig || { logicalOperator: 'AND', conditions: [] }
            }];
            
            const activeBranchId = branches.some((b: any) => b.id === selectedBranchId) ? selectedBranchId : branches[0].id;
            const activeBranchIndex = branches.findIndex((b: any) => b.id === activeBranchId);
            const activeBranch = branches[activeBranchIndex];
            
            let currentConfig = { logicalOperator: 'AND', conditions: [] as any[] };
            const config = activeBranch.conditionConfig;
            
            if (config) {
              if (config.conditions) {
                currentConfig = config;
              } else if (config.field || config.operator || config.value) {
                currentConfig = {
                  logicalOperator: 'AND',
                  conditions: [{
                    field: config.field || '',
                    operator: config.operator || '=',
                    value: config.value || ''
                  }]
                };
              }
            }

            const handleBranchesUpdate = (newBranches: any[]) => {
              // Ensure we don't lose other data properties, but we should override conditionConfig at top level if needed? 
              // Usually we just save `branches` to node data.
              onUpdateNodeData(id, { branches: newBranches });
            };

            const handleUpdate = (newConfig: any) => {
              const newBranches = [...branches];
              newBranches[activeBranchIndex] = { ...activeBranch, conditionConfig: newConfig };
              handleBranchesUpdate(newBranches);
            };

            const addBranch = () => {
              const newId = `branch_${Date.now()}`;
              const newBranches = [...branches, {
                id: newId,
                name: `分支 ${branches.length + 1}`,
                conditionConfig: { logicalOperator: 'AND', conditions: [] }
              }];
              handleBranchesUpdate(newBranches);
              setSelectedBranchId(newId);
            };

            const removeBranch = (branchId: string, e: React.MouseEvent) => {
              e.stopPropagation();
              if (branches.length <= 1) return;
              const newBranches = branches.filter((b: any) => b.id !== branchId);
              handleBranchesUpdate(newBranches);
              if (selectedBranchId === branchId) {
                setSelectedBranchId(newBranches[0].id);
              }
            };
            
            const updateBranchName = (name: string) => {
              const newBranches = [...branches];
              newBranches[activeBranchIndex] = { ...activeBranch, name };
              handleBranchesUpdate(newBranches);
            };

            const addCondition = () => {
              handleUpdate({
                ...currentConfig,
                conditions: [...currentConfig.conditions, { field: '', operator: '=', value: '' }]
              });
            };

            const removeCondition = (index: number) => {
              const newConditions = [...currentConfig.conditions];
              newConditions.splice(index, 1);
              handleUpdate({ ...currentConfig, conditions: newConditions });
            };

            const updateCondition = (index: number, key: string, val: any) => {
              const newConditions = [...currentConfig.conditions];
              newConditions[index] = { ...newConditions[index], [key]: val };
              if (key === 'field') {
                newConditions[index].operator = '=';
                newConditions[index].value = '';
              }
              handleUpdate({ ...currentConfig, conditions: newConditions });
            };

            const getOperatorOptions = (fieldType: string) => {
              if (fieldType === 'number') {
                return (
                  <>
                    <option value="=">等于 (=)</option>
                    <option value="!=">不等于 (!=)</option>
                    <option value=">">大于 (&gt;)</option>
                    <option value="<">小于 (&lt;)</option>
                    <option value=">=">大于等于 (&gt;=)</option>
                    <option value="<=">小于等于 (&lt;=)</option>
                  </>
                );
              }
              if (fieldType === 'select' || fieldType === 'radio') {
                return (
                  <>
                    <option value="=">等于</option>
                    <option value="!=">不等于</option>
                  </>
                );
              }
              return (
                <>
                  <option value="=">等于 (=)</option>
                  <option value="!=">不等于 (!=)</option>
                  <option value="contains">包含</option>
                </>
              );
            };

            return (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900">分支设置</h4>
                
                <div className="flex flex-wrap gap-2">
                  {branches.map((branch: any) => (
                    <div
                      key={branch.id}
                      onClick={() => setSelectedBranchId(branch.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer border text-sm transition-colors ${
                        activeBranchId === branch.id 
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{branch.name}</span>
                      {branches.length > 1 && (
                        <Trash2 
                          className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 transition-colors" 
                          onClick={(e) => removeBranch(branch.id, e)}
                        />
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBranch}
                    className="flex items-center justify-center w-8 h-8 rounded-md border border-dashed border-gray-300 text-gray-400 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                    title="添加分支"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">分支名称</label>
                    <input
                      type="text"
                      value={activeBranch.name}
                      onChange={(e) => updateBranchName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">逻辑关系</label>
                  <select
                    value={currentConfig.logicalOperator || 'AND'}
                    onChange={(e) => handleUpdate({ ...currentConfig, logicalOperator: e.target.value })}
                    className="px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="AND">且 (AND)</option>
                    <option value="OR">或 (OR)</option>
                  </select>
                </div>

                <div className="space-y-3">
                  {currentConfig.conditions.map((cond: any, index: number) => {
                    const selectedField = formConfig.find(f => f.id === cond.field);
                    const fieldType = selectedField?.type || 'text';

                    return (
                      <div key={index} className="p-3 bg-gray-50 border border-gray-200 rounded-md space-y-3 relative">
                        <div className="absolute top-2 right-2">
                          <button
                            type="button"
                            onClick={() => removeCondition(index)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">判断字段</label>
                          <select
                            value={cond.field}
                            onChange={(e) => updateCondition(index, 'field', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="">-- 选择字段 --</option>
                            {formConfig.map(f => (
                              <option key={f.id} value={f.id}>{f.name || f.id}</option>
                            ))}
                          </select>
                        </div>

                        {cond.field && (
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-500 mb-1">判断条件</label>
                              <select
                                value={cond.operator}
                                onChange={(e) => updateCondition(index, 'operator', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              >
                                {getOperatorOptions(fieldType)}
                              </select>
                            </div>
                            
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-gray-500 mb-1">比较值</label>
                              {(fieldType === 'select' || fieldType === 'radio') && selectedField?.options ? (
                                <select
                                  value={cond.value}
                                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                  <option value="">-- 选择值 --</option>
                                  {selectedField.options.map((opt: { label: string; value: string }) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              ) : fieldType === 'number' ? (
                                <input
                                  type="number"
                                  value={cond.value}
                                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                  placeholder="输入数值"
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={cond.value}
                                  onChange={(e) => updateCondition(index, 'value', e.target.value)}
                                  placeholder="输入比较值"
                                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={addCondition}
                  className="w-full flex items-center justify-center gap-1 px-4 py-2 border border-dashed border-gray-300 rounded-md text-sm font-medium text-indigo-600 hover:bg-indigo-50 hover:border-indigo-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  添加条件
                </button>
                </div>
              </div>
            );
          })()}
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
