import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Agent, createAgent, updateAgent } from "@/api/agents";
import { Model, fetchModels } from "@/lib/api";

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingAgent?: Agent | null;
}

export default function AgentModal({ isOpen, onClose, onSuccess, editingAgent }: AgentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    systemPrompt: "",
    modelId: "",
  });
  const [models, setModels] = useState<Model[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = async () => {
    try {
      const data = await fetchModels();
      setModels(data);
      if (!editingAgent && data.length > 0) {
        setFormData((prev) => ({ ...prev, modelId: data[0].id }));
      }
    } catch (error) {
      console.error("Failed to load models:", error);
    }
  };

  useEffect(() => {
    if (editingAgent) {
      setFormData({
        name: editingAgent.name,
        description: editingAgent.description || "",
        systemPrompt: editingAgent.systemPrompt || "",
        modelId: editingAgent.modelId,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        systemPrompt: "",
        modelId: models.length > 0 ? models[0].id : "",
      });
    }
    setError("");
  }, [editingAgent, isOpen, models]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("代理名称不能为空");
      return;
    }
    if (!formData.modelId) {
      setError("请选择一个模型");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      if (editingAgent) {
        await updateAgent(editingAgent.id, formData);
      } else {
        await createAgent(formData);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingAgent ? "编辑代理" : "新增代理"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          <form id="agent-form" onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                代理名称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如: 代码助手"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="代理功能的简短描述"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                绑定模型 *
              </label>
              <select
                value={formData.modelId}
                onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="" disabled>请选择模型</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.provider})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                系统提示词 (System Prompt)
              </label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] font-mono text-sm"
                placeholder="You are a helpful assistant..."
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button
            form="agent-form"
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
