import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Bot, Cpu, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Agent, getAgents, deleteAgent } from "@/api/agents";
import ApiIntegrationModal from "./components/ApiIntegrationModal";

export default function Agents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAgent, setSelectedAgent] = useState<{ id: string; name: string } | null>(null);
  const itemsPerPage = 10;

  const loadAgents = async () => {
    try {
      setLoading(true);
      const data = await getAgents();
      setAgents(data);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此代理吗？")) return;
    try {
      await deleteAgent(id);
      setAgents(agents.filter(a => a.id !== id));
    } catch (error) {
      console.error("Failed to delete agent:", error);
      alert("删除失败");
    }
  };

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [agents, searchQuery]);

  const totalPages = Math.ceil(filteredAgents.length / itemsPerPage);
  const currentAgents = filteredAgents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/agents/new')}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增代理
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索代理名称..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Table / Mobile Cards */}
        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <div className="md:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <p>加载中...</p>
              </div>
            ) : currentAgents.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Bot className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900">未找到代理</p>
              </div>
            ) : (
              currentAgents.map((agent) => (
                <div key={agent.id} className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{agent.description || "无描述"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>模型: {agent.model?.name || agent.modelId}</span>
                  </div>
                  <div className="flex items-center justify-end space-x-4 border-t border-gray-100 pt-3 mt-3">
                    <button
                      onClick={() => setSelectedAgent({ id: agent.id, name: agent.name })}
                      className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center"
                    >
                      <Code className="w-4 h-4 mr-1" /> API Integration
                    </button>
                    <button
                      onClick={() => navigate(`/agents/${agent.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> 编辑
                    </button>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> 删除
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <table className="min-w-full divide-y divide-gray-200 hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  代理名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  绑定模型
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                      <p>加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : currentAgents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Bot className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">未找到代理</p>
                      <p className="text-sm mt-1">您可以尝试调整搜索条件或新增代理</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                          {agent.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-[200px]" title={agent.description || ""}>
                        {agent.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        {agent.model?.name || "未知模型"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => setSelectedAgent({ id: agent.id, name: agent.name })}
                          className="text-gray-500 hover:text-gray-900 transition-colors"
                          title="API Integration"
                        >
                          <Code className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/agents/${agent.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(agent.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredAgents.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  显示 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> 到 <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAgents.length)}</span> 条，
                  共 <span className="font-medium">{filteredAgents.length}</span> 条
                </p>
              </div>
              <div className="flex-1 sm:flex-none flex justify-center sm:justify-end">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">上一页</span>
                    &larr;
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">下一页</span>
                    &rarr;
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <ApiIntegrationModal
        isOpen={!!selectedAgent}
        onClose={() => setSelectedAgent(null)}
        agentId={selectedAgent?.id || ""}
        agentName={selectedAgent?.name || ""}
      />
    </div>
  );
}
