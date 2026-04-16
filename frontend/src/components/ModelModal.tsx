import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Model, createModel, updateModel } from "@/lib/api";

interface ModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingModel?: Model | null;
}

export default function ModelModal({ isOpen, onClose, onSuccess, editingModel }: ModelModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    provider: "OpenAI",
    baseUrl: "",
    apiKey: "",
    enabled: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingModel) {
      setFormData({
        name: editingModel.name,
        provider: editingModel.provider,
        baseUrl: editingModel.baseUrl || "",
        apiKey: editingModel.apiKey || "",
        enabled: editingModel.enabled,
      });
    } else {
      setFormData({
        name: "",
        provider: "OpenAI",
        baseUrl: "",
        apiKey: "",
        enabled: true,
      });
    }
    setError("");
  }, [editingModel, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("模型名称不能为空");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (editingModel) {
        await updateModel(editingModel.id, formData);
      } else {
        await createModel(formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingModel ? "编辑模型" : "新增模型"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模型名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：gpt-4"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              提供商 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OpenAI">OpenAI</option>
              <option value="Anthropic">Anthropic</option>
              <option value="Azure">Azure</option>
              <option value="Ollama">Ollama</option>
              <option value="Custom">自定义</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base URL
            </label>
            <input
              type="text"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="默认使用官方接口"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="输入 API 密钥"
            />
          </div>

          <div className="flex items-center mt-4">
            <input
              id="enabled"
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900">
              启用此模型
            </label>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? "保存中..." : "保存"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
