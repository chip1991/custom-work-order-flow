import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit2, Trash2, ClipboardList, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkOrderFlow, getWorkOrders, deleteWorkOrder } from "@/api/work-orders";

export default function WorkOrders() {
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrderFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadWorkOrders = async () => {
    try {
      setLoading(true);
      const data = await getWorkOrders();
      setWorkOrders(data);
    } catch (error) {
      console.error("Failed to load work orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkOrders();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除此工单流程吗？")) return;
    try {
      await deleteWorkOrder(id);
      setWorkOrders(workOrders.filter(w => w.id !== id));
    } catch (error) {
      console.error("Failed to delete work order:", error);
      alert("删除失败");
    }
  };

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      const matchesSearch = wo.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [workOrders, searchQuery]);

  const totalPages = Math.ceil(filteredWorkOrders.length / itemsPerPage);
  const currentWorkOrders = filteredWorkOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/work-orders/new')}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增工单流程
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
                placeholder="搜索工单流程名称..."
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
            ) : currentWorkOrders.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-900">未找到工单流程</p>
              </div>
            ) : (
              currentWorkOrders.map((wo) => (
                <div key={wo.id} className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                        {wo.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{wo.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{wo.description || "无描述"}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-4 border-t border-gray-100 pt-3 mt-3">
                    <button
                      onClick={() => navigate(`/work-orders/${wo.id}/edit`)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
                    >
                      <Edit2 className="w-4 h-4 mr-1" /> 编辑
                    </button>
                    <button
                      onClick={() => handleDelete(wo.id)}
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
                  工单名称
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  描述
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
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
              ) : currentWorkOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <ClipboardList className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">未找到工单流程</p>
                      <p className="text-sm mt-1">您可以尝试调整搜索条件或新增工单流程</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentWorkOrders.map((wo) => (
                  <tr key={wo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                          {wo.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{wo.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-[200px]" title={wo.description || ""}>
                        {wo.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(wo.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => navigate(`/work-orders/${wo.id}/edit`)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(wo.id)}
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
        {filteredWorkOrders.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="flex-1 flex items-center justify-between">
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  显示 <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> 到 <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredWorkOrders.length)}</span> 条，
                  共 <span className="font-medium">{filteredWorkOrders.length}</span> 条
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
    </div>
  );
}
