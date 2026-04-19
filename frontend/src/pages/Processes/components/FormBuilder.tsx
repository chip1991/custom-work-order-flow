import React, { useState } from 'react';
import { Trash2, AlignLeft, FileText, Hash, Calendar, Paperclip, DollarSign, CircleDot, CheckSquare, CalendarRange, LayoutGrid, SlidersHorizontal, Eye, Plus, X, Settings, Image as ImageIcon } from 'lucide-react';

export interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  unit?: string;
  options?: { label: string; value: string }[];
  visibleCondition?: {
    dependentFieldId: string;
    operator: string;
    value: string;
  };
  maxImages?: number;
}

interface FormBuilderProps {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}

const FIELD_TYPES = [
  { type: 'text', label: '单行文本', icon: AlignLeft },
  { type: 'textarea', label: '多行文本', icon: FileText },
  { type: 'number', label: '数字', icon: Hash },
  { type: 'amount', label: '金额', icon: DollarSign },
  { type: 'radio', label: '单选', icon: CircleDot },
  { type: 'checkbox', label: '多选', icon: CheckSquare },
  { type: 'date', label: '日期', icon: Calendar },
  { type: 'dateRange', label: '日期区间', icon: CalendarRange },
  { type: 'attachment', label: '附件', icon: Paperclip },
  { type: 'image', label: '图片', icon: ImageIcon },
];

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'attributes' | 'settings'>('attributes');

  const addField = (type: string, label: string) => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(2, 9),
      name: label,
      type: type,
      required: false,
    };
    if (type === 'radio' || type === 'checkbox') {
      newField.options = [
        { label: '选项 1', value: 'option1' },
        { label: '选项 2', value: 'option2' },
      ];
    }
    onChange([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const removeField = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  };

  const updateSelectedField = (key: keyof FormField, value: any) => {
    if (!selectedFieldId) return;
    const newFields = fields.map(f => 
      f.id === selectedFieldId ? { ...f, [key]: value } : f
    );
    onChange(newFields);
  };

  const updateSelectedFieldOption = (index: number, key: 'label' | 'value', val: string) => {
    if (!selectedFieldId) return;
    const newFields = fields.map(f => {
      if (f.id === selectedFieldId && f.options) {
        const newOptions = [...f.options];
        newOptions[index] = { ...newOptions[index], [key]: val };
        return { ...f, options: newOptions };
      }
      return f;
    });
    onChange(newFields);
  };

  const addSelectedFieldOption = () => {
    if (!selectedFieldId) return;
    const newFields = fields.map(f => {
      if (f.id === selectedFieldId) {
        const currentOptions = f.options || [];
        const newOption = { label: `选项 ${currentOptions.length + 1}`, value: `option${currentOptions.length + 1}` };
        return { ...f, options: [...currentOptions, newOption] };
      }
      return f;
    });
    onChange(newFields);
  };

  const removeSelectedFieldOption = (index: number) => {
    if (!selectedFieldId) return;
    const newFields = fields.map(f => {
      if (f.id === selectedFieldId && f.options) {
        const newOptions = [...f.options];
        newOptions.splice(index, 1);
        return { ...f, options: newOptions };
      }
      return f;
    });
    onChange(newFields);
  };

  const updateVisibleCondition = (key: 'dependentFieldId' | 'operator' | 'value', val: string) => {
    if (!selectedFieldId) return;
    const newFields = fields.map(f => {
      if (f.id === selectedFieldId) {
        const currentCondition = f.visibleCondition || { dependentFieldId: '', operator: '===', value: '' };
        return {
          ...f,
          visibleCondition: { ...currentCondition, [key]: val }
        };
      }
      return f;
    });
    onChange(newFields);
  };

  const selectedField = fields.find(f => f.id === selectedFieldId);
  const otherFields = fields.filter(f => f.id !== selectedFieldId);

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden bg-gray-50">
      {/* 左侧：控件库 */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full z-10">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" />
            控件库
          </h2>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-2">
            {FIELD_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => addField(type, label)}
                className="group flex flex-col items-center justify-center p-3 border border-gray-200 rounded hover:border-indigo-500 hover:text-indigo-600 bg-white transition-colors gap-2"
              >
                <Icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-600" />
                <span className="text-xs text-gray-700 group-hover:text-indigo-600">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* 中间：预览画布 */}
      <main className="flex-1 relative bg-gray-50 overflow-y-auto p-6">
          {fields.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
              请从左侧拖拽或点击添加字段
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[400px]">
              {fields.map((field) => (
                <div
                  key={field.id}
                  onClick={() => setSelectedFieldId(field.id)}
                  className={`relative p-4 rounded-md border-2 cursor-pointer transition-all ${
                    selectedFieldId === field.id
                      ? 'border-indigo-500 bg-indigo-50/30'
                      : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {field.name} {field.required && <span className="text-red-500">*</span>}
                      {field.unit && <span className="text-gray-500 text-xs ml-1">({field.unit})</span>}
                    </label>
                    {field.visibleCondition?.dependentFieldId && (
                      <span title="配置了显示条件">
                        <Eye className="w-4 h-4 text-indigo-500" />
                      </span>
                    )}
                  </div>
                  
                  {field.description && (
                    <p className="text-xs text-gray-500 mb-2">{field.description}</p>
                  )}
                  
                  <div className="pointer-events-none">
                    {field.type === 'textarea' ? (
                      <textarea
                        disabled
                        placeholder={field.placeholder || `请输入${field.name}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                        rows={3}
                        value={field.defaultValue || ''}
                      />
                    ) : field.type === 'radio' ? (
                      <div className="space-y-2">
                        {field.options?.map((opt, idx) => (
                          <div key={idx} className="flex items-center">
                            <input type="radio" disabled className="h-4 w-4 text-indigo-600 border-gray-300" />
                            <label className="ml-2 block text-sm text-gray-500">{opt.label}</label>
                          </div>
                        ))}
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="space-y-2">
                        {field.options?.map((opt, idx) => (
                          <div key={idx} className="flex items-center">
                            <input type="checkbox" disabled className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                            <label className="ml-2 block text-sm text-gray-500">{opt.label}</label>
                          </div>
                        ))}
                      </div>
                    ) : field.type === 'dateRange' ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="date"
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="date"
                          disabled
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                        />
                      </div>
                    ) : field.type === 'attachment' ? (
                      <div className="w-full px-3 py-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 flex flex-col items-center justify-center text-gray-500 sm:text-sm">
                        <Paperclip className="w-5 h-5 mb-1 text-gray-400" />
                        <span>点击或拖拽上传附件</span>
                      </div>
                    ) : field.type === 'image' ? (
                      <div className="w-full px-3 py-4 border-2 border-dashed border-gray-300 rounded-md bg-gray-50 flex flex-col items-center justify-center text-gray-500 sm:text-sm">
                        <ImageIcon className="w-5 h-5 mb-1 text-gray-400" />
                        <span>点击或拖拽上传图片{field.maxImages ? ` (最多 ${field.maxImages} 张)` : ''}</span>
                      </div>
                    ) : field.type === 'amount' ? (
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">¥</span>
                        </div>
                        <input
                          type="number"
                          disabled
                          placeholder={field.placeholder || `请输入${field.name}`}
                          value={field.defaultValue || ''}
                          className="w-full pl-7 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                        />
                      </div>
                    ) : (
                      <input
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        disabled
                        placeholder={field.placeholder || `请输入${field.name}`}
                        value={field.defaultValue || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                      />
                    )}
                  </div>

                  {selectedFieldId === field.id && (
                    <button
                      onClick={(e) => removeField(field.id, e)}
                      className="absolute -top-3 -right-3 p-1.5 bg-white border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-colors z-10"
                      title="删除字段"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

      {/* 右侧：属性配置 */}
      <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full z-10 shadow-sm">
        <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={() => setActiveTab('attributes')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'attributes'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            字段属性
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            高级配置
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {!selectedField ? (
            <div className="text-center py-8 text-sm text-gray-500">
              请在画布中选择字段
            </div>
          ) : (
            <div className="space-y-6">
              
              {activeTab === 'attributes' && (
                <>
                  {/* 基础属性 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">基础属性</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">字段名称</label>
                  <input
                    type="text"
                    value={selectedField.name}
                    onChange={(e) => updateSelectedField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标识符 (ID)</label>
                  <input
                    type="text"
                    value={selectedField.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">字段类型</label>
                  <select
                    value={selectedField.type}
                    onChange={(e) => updateSelectedField('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    {FIELD_TYPES.map(t => (
                      <option key={t.type} value={t.type}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-2">
                  <input
                    type="checkbox"
                    id="required-checkbox"
                    checked={selectedField.required}
                    onChange={(e) => updateSelectedField('required', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="required-checkbox" className="ml-2 block text-sm text-gray-700">
                    必填项
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">描述信息</label>
                  <textarea
                    value={selectedField.description || ''}
                    onChange={(e) => updateSelectedField('description', e.target.value)}
                    placeholder="输入字段描述"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows={2}
                  />
                </div>
              </div>

              {/* 专属属性 */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">专属属性</h4>
                
                {(selectedField.type === 'text' || selectedField.type === 'textarea' || selectedField.type === 'number' || selectedField.type === 'amount') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">提示语 (Placeholder)</label>
                      <input
                        type="text"
                        value={selectedField.placeholder || ''}
                        onChange={(e) => updateSelectedField('placeholder', e.target.value)}
                        placeholder="输入提示语"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">默认值 (Default Value)</label>
                      <input
                        type="text"
                        value={selectedField.defaultValue || ''}
                        onChange={(e) => updateSelectedField('defaultValue', e.target.value)}
                        placeholder="输入默认值"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </>
                )}

                {(selectedField.type === 'number' || selectedField.type === 'amount') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">单位 (Unit)</label>
                    <input
                      type="text"
                      value={selectedField.unit || ''}
                      onChange={(e) => updateSelectedField('unit', e.target.value)}
                      placeholder="例如: 天、元"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}

                {selectedField.type === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">最大图片数量 (Max Images)</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedField.maxImages || ''}
                      onChange={(e) => updateSelectedField('maxImages', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                      placeholder="不限制"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                )}

                {(selectedField.type === 'radio' || selectedField.type === 'checkbox') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">选项列表</label>
                    <div className="space-y-2">
                      {selectedField.options?.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opt.label}
                            onChange={(e) => updateSelectedFieldOption(idx, 'label', e.target.value)}
                            placeholder="选项名"
                            className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                          <input
                            type="text"
                            value={opt.value}
                            onChange={(e) => updateSelectedFieldOption(idx, 'value', e.target.value)}
                            placeholder="值"
                            className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                          />
                          <button
                            onClick={() => removeSelectedFieldOption(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addSelectedFieldOption}
                        className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        添加选项
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                {/* 高级配置 */}
                <h4 className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">高级配置</h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">显示条件 (Visible Condition)</label>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-md border border-gray-200">
                    <select
                      value={selectedField.visibleCondition?.dependentFieldId || ''}
                      onChange={(e) => updateVisibleCondition('dependentFieldId', e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">无条件 (始终显示)</option>
                      {otherFields.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>

                    {selectedField.visibleCondition?.dependentFieldId && (
                      <div className="flex gap-2">
                        <select
                          value={selectedField.visibleCondition.operator}
                          onChange={(e) => updateVisibleCondition('operator', e.target.value)}
                          className="w-1/3 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="===">等于</option>
                          <option value="!==">不等于</option>
                          <option value=">">大于</option>
                          <option value="<">小于</option>
                          <option value="includes">包含</option>
                        </select>
                        <input
                          type="text"
                          value={selectedField.visibleCondition.value}
                          onChange={(e) => updateVisibleCondition('value', e.target.value)}
                          placeholder="条件值"
                          className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
