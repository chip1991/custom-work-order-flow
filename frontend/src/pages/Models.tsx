import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, Cpu, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import { Model, fetchModels, toggleModelStatus, deleteModel } from "@/lib/api";
import ModelModal from "@/components/ModelModal";

export default function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvider, setFilterProvider] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Model | null>(null);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await fetchModels();
      setModels(data);
    } catch (error) {
      console.error("Failed to load models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleToggleStatus = async (model: Model) => {
    try {
      await toggleModelStatus(model.id, !model.enabled);
      setModels(models.map(m => m.id === model.id ? { ...m, enabled: !m.enabled } : m));
    } catch (error) {
      console.error("Failed to toggle status:", error);
      alert("更新状态失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此模型吗？")) return;
    try {
      await deleteModel(id);
      setModels(models.filter(m => m.id !== id));
    } catch (error) {
      console.error("Failed to delete model:", error);
      alert("删除失败");
    }
  };

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvider = filterProvider === "all" || model.provider === filterProvider;
      return matchesSearch && matchesProvider;
    });
  }, [models, searchQuery, filterProvider]);

  const totalPages = Math.ceil(filteredModels.length / itemsPerPage);
  const currentModels = filteredModels.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const providers = useMemo(() => {
    const uniqueProviders = new Set(models.map(m => m.provider));
    return Array.from(uniqueProviders);
  }, [models]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-600" />
            模型中心
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            管理用于测评的大语言模型及其接口配置
          </p>
        </div>
        <button
          onClick={() => {
            setEditingModel(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增模型
        </button>
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
                placeholder="搜索模型名称..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              />
            </div>
            <select
              value={filterProvider}
              onChange={(e) => {
                setFilterProvider(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg border bg-white"
            >
              <option value="all">所有提供商</option>
              {providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / Mobile Cards */}
        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <div className="md:hidden divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p>加载中...</p>
              </div>
            ) : currentModels.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Cpu className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900">未找到模型</p>
              </div>
            ) : (
              currentModels.map((model) => (
                <div key={model.id} className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                        {model.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{model.provider}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleStatus(model)}
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        model.enabled 
                          ? "bg-green-100 text-green-800 hover:bg-green-200" 
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {model.enabled ? (
                        <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 已启用</>
                      ) : (
                        <><XCircle className="w-3.5 h-3.5 mr-1" /> 已停用</>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mb-3 truncate">
                    URL: {model.baseUrl || "默认接口"}
                  </div>
                  <div className="flex items-center justify-end space-x-4 border-t border-gray-100 pt-3 mt-3">
                    <button
                      onClick={() => {
                        setEditingModel(model);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> 编辑
                    </button>
                    <button
                      onClick={() => handleDelete(model.id)}
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
                  模型名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提供商
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base URL
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                      <p>加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : currentModels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Cpu className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">未找到模型</p>
                      <p className="text-sm mt-1">您可以尝试调整搜索条件或新增模型</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentModels.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm mr-3">
                          {model.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{model.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {model.provider}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.baseUrl || <span className="text-gray-400 italic">默认接口</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(model)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          model.enabled 
                            ? "bg-green-100 text-green-800 hover:bg-green-200" 
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {model.enabled ? (
                          <><CheckCircle2 className="w-3.5 h-3.5 mr-1" /> 已启用</>
                        ) : (
                          <><XCircle className="w-3.5 h-3.5 mr-1" /> 已停用</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => {
                            setEditingModel(model);
                            setIsModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(model.id)}
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
        {filteredModels.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  显示 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> 到 <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredModels.length)}</span> 条，
                  共 <span className="font-medium">{filteredModels.length}</span> 条
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
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
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

      <ModelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadModels}
        editingModel={editingModel}
      />
    </div>
  );
}
