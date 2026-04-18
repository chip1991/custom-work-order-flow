import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Model } from "@/lib/api";

export interface AgentSettingsData {
  name: string;
  description: string;
  modelId: string;
}

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AgentSettingsData) => void;
  agentData: AgentSettingsData;
  models: Model[];
}

export default function AgentSettingsModal({
  isOpen,
  onClose,
  onSave,
  agentData,
  models,
}: AgentSettingsModalProps) {
  const [formData, setFormData] = useState<AgentSettingsData>({
    name: "",
    description: "",
    modelId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: agentData.name || "",
        description: agentData.description || "",
        modelId: agentData.modelId || "",
      });
      setError("");
    }
  }, [isOpen, agentData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("名称不能为空");
      return;
    }
    if (!formData.modelId) {
      setError("请选择一个默认模型");
      return;
    }
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Agent 设置
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Agent Name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认模型 <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.modelId}
              onChange={(e) =>
                setFormData({ ...formData, modelId: e.target.value })
              }
            >
              <option value="" disabled>
                选择一个模型
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
