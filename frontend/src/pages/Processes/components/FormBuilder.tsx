import React, { useState } from 'react';
import { Trash2, AlignLeft, FileText, Hash, Calendar, Paperclip, DollarSign, CircleDot, CheckSquare, CalendarRange } from 'lucide-react';

export interface FormField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  placeholder?: string;
  defaultValue?: string;
  unit?: string;
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
];

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const addField = (type: string, label: string) => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(2, 9),
      name: label,
      type: type,
      required: false,
    };
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

  const selectedField = fields.find(f => f.id === selectedFieldId);

  return (
    <div className="flex h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      {/* 左侧：控件库 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-sm font-medium text-gray-900">控件库</h3>
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
      </div>

      {/* 中间：预览画布 */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h3 className="text-sm font-medium text-gray-900">表单预览</h3>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
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
                  </div>
                  
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
                        <div className="flex items-center">
                          <input type="radio" disabled className="h-4 w-4 text-indigo-600 border-gray-300" />
                          <label className="ml-2 block text-sm text-gray-500">选项 1</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" disabled className="h-4 w-4 text-indigo-600 border-gray-300" />
                          <label className="ml-2 block text-sm text-gray-500">选项 2</label>
                        </div>
                      </div>
                    ) : field.type === 'checkbox' ? (
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" disabled className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                          <label className="ml-2 block text-sm text-gray-500">选项 1</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" disabled className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                          <label className="ml-2 block text-sm text-gray-500">选项 2</label>
                        </div>
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
        </div>
      </div>

      {/* 右侧：属性配置 */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <h3 className="text-sm font-medium text-gray-900">字段属性</h3>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {!selectedField ? (
            <div className="text-center py-8 text-sm text-gray-500">
              请在画布中选择字段
            </div>
          ) : (
            <div className="space-y-4">
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

              <div className="pt-4 border-t border-gray-100 mt-4 space-y-4">
                <h4 className="text-sm font-medium text-gray-900">高级配置</h4>
                
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
