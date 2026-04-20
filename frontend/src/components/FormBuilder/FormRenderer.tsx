import React from 'react';

interface Field {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  options?: any[];
}

interface FormRendererProps {
  config: { fields: Field[] };
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  readonly?: boolean;
}

export default function FormRenderer({ config, value, onChange, readonly = false }: FormRendererProps) {
  const fields = config?.fields || [];

  const handleChange = (id: string, val: any) => {
    if (readonly) return;
    onChange({ ...value, [id]: val });
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            {field.required && <span className="text-red-500 mr-1">*</span>}
            {field.label}
          </label>

          {field.type === 'input' || field.type === 'text' ? (
            <input
              type="text"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              value={value[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={readonly}
              placeholder={`请输入${field.label}`}
            />
          ) : field.type === 'textarea' ? (
            <textarea
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              value={value[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={readonly}
              rows={3}
              placeholder={`请输入${field.label}`}
            />
          ) : field.type === 'select' || field.type === 'radio' ? (
            <select
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 bg-white"
              value={value[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={readonly}
            >
              <option value="" disabled>请选择</option>
              {field.options?.map((opt: any) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'date' ? (
            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
              value={value[field.id] || ''}
              onChange={(e) => handleChange(field.id, e.target.value)}
              disabled={readonly}
            />
          ) : (
            <div className="text-sm text-gray-500 italic p-2 border border-dashed border-gray-200 rounded bg-gray-50">
              不支持的组件类型: {field.type}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
