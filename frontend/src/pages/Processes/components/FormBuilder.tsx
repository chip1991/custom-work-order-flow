import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

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

export default function FormBuilder({ fields, onChange }: FormBuilderProps) {
  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substring(2, 9),
      name: '',
      type: 'text',
      required: false,
    };
    onChange([...fields, newField]);
  };

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FormField, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    onChange(newFields);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">全局表单字段</h3>
        <button
          onClick={addField}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          添加字段
        </button>
      </div>

      {fields.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          暂无全局表单字段，点击右上角添加。
        </div>
      ) : (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm relative flex gap-4 items-start">
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">字段名称</label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(index, 'name', e.target.value)}
                      placeholder="例如: 请假天数"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">字段类型</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="text">单行文本 (Text)</option>
                      <option value="textarea">多行文本 (Textarea)</option>
                      <option value="number">数字 (Number)</option>
                      <option value="date">日期 (Date)</option>
                      <option value="select">下拉选择 (Select)</option>
                      <option value="user">人员 (User)</option>
                      <option value="department">部门 (Department)</option>
                      <option value="attachment">附件 (Attachment)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`required-${field.id}`}
                    checked={field.required}
                    onChange={(e) => updateField(index, 'required', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`required-${field.id}`} className="ml-2 block text-sm text-gray-700">
                    必填项
                  </label>
                </div>
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">高级配置</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">提示语 (Placeholder)</label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                        placeholder="输入提示语"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">默认值 (Default Value)</label>
                      <input
                        type="text"
                        value={field.defaultValue || ''}
                        onChange={(e) => updateField(index, 'defaultValue', e.target.value)}
                        placeholder="输入默认值"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">单位 (Unit)</label>
                      <input
                        type="text"
                        value={field.unit || ''}
                        onChange={(e) => updateField(index, 'unit', e.target.value)}
                        placeholder="例如: 天、元"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeField(index)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="删除字段"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}