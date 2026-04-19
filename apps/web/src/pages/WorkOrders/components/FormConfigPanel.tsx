import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface FormField {
  id: string;
  label: string;
  key: string;
  type: string;
  required: boolean;
}

interface FormConfigPanelProps {
  formSchema: FormField[];
  setFormSchema: React.Dispatch<React.SetStateAction<FormField[]>>;
}

export default function FormConfigPanel({ formSchema, setFormSchema }: FormConfigPanelProps) {
  const addField = () => {
    setFormSchema([
      ...formSchema,
      {
        id: Math.random().toString(36).substr(2, 9),
        label: '新字段',
        key: `field_${formSchema.length + 1}`,
        type: 'text',
        required: false,
      }
    ]);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormSchema(formSchema.map(field => field.id === id ? { ...field, ...updates } : field));
  };

  const removeField = (id: string) => {
    setFormSchema(formSchema.filter(field => field.id !== id));
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between border-b pb-4 mb-4 flex-shrink-0">
        <h3 className="text-lg font-medium text-gray-900">表单配置</h3>
        <button
          onClick={addField}
          className="inline-flex items-center p-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-1" />
          添加字段
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {formSchema.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>暂无自定义字段</p>
            <p className="text-sm mt-1">点击右上角添加</p>
          </div>
        ) : (
          formSchema.map((field) => (
            <div key={field.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative">
              <button
                onClick={() => removeField(field.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="space-y-3 mt-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">字段名称 (Label)</label>
                  <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">字段键名 (Key)</label>
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => updateField(field.id, { key: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">类型 (Type)</label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="text">文本 (Text)</option>
                      <option value="number">数字 (Number)</option>
                      <option value="boolean">布尔 (Boolean)</option>
                      <option value="date">日期 (Date)</option>
                    </select>
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center space-x-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(field.id, { required: e.target.checked })}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">必填</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
