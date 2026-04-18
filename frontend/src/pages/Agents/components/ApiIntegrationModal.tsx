import { useState } from "react";
import { X, Check, Copy } from "lucide-react";

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentId: string;
  agentName: string;
}

export default function ApiIntegrationModal({
  isOpen,
  onClose,
  agentId,
  agentName,
}: ApiIntegrationModalProps) {
  const [activeTab, setActiveTab] = useState<"curl" | "python">("curl");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl = window.location.origin;

  const snippets = {
    curl: `curl ${baseUrl}/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_API_KEY>" \\
  -d '{
    "model": "${agentId}",
    "messages": [
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'`,
    python: `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}/api/v1",
    api_key="<YOUR_API_KEY>"
)

response = client.chat.completions.create(
    model="${agentId}",
    messages=[
        {"role": "user", "content": "Hello!"}
    ]
)

print(response.choices[0].message.content)`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              API 集成 - {agentName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              使用 OpenAI 兼容格式调用此代理
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-lg mb-6 w-fit">
            <button
              onClick={() => setActiveTab("curl")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "curl"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              cURL
            </button>
            <button
              onClick={() => setActiveTab("python")}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === "python"
                  ? "bg-white text-gray-900 shadow-sm ring-1 ring-gray-200"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Python
            </button>
          </div>

          <div className="relative group">
            <div className="absolute right-4 top-4 z-10">
              <button
                onClick={handleCopy}
                className="p-2 bg-gray-800/50 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg backdrop-blur-sm transition-all duration-200"
                title="复制"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <pre className="bg-[#1E1E1E] text-gray-300 p-6 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed border border-gray-800">
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>

          <div className="mt-6 bg-blue-50/50 border border-blue-100 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">注意事项</h4>
            <ul className="text-sm text-blue-800 space-y-1.5 list-disc list-inside">
              <li>请确保您已在"API Keys"页面创建并获取了有效的 API Key。</li>
              <li>此接口完全兼容 OpenAI SDK。</li>
              <li>流式响应 (stream: true) 同样受支持。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
