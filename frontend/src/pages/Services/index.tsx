import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Plus, Search, Trash2, ToggleLeft, ToggleRight, Package, Loader2 } from "lucide-react";
import { getProcesses, Process } from "@/api/processes";
import { createService, deleteService, getServices, Service, updateService } from "@/api/services";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createProcessId, setCreateProcessId] = useState("");
  const [createName, setCreateName] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [servicesData, processesData] = await Promise.all([getServices(), getProcesses()]);
      setServices(servicesData);
      setProcesses(processesData);
    } catch (error) {
      console.error("Failed to load services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim();
    if (!q) return services;
    return services.filter((s) => (s.name || "").toLowerCase().includes(q.toLowerCase()));
  }, [services, searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createProcessId || !createName.trim()) return;
    try {
      setCreating(true);
      const userId = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "null")?.id || null;
        } catch {
          return null;
        }
      })();
      await createService({
        processId: createProcessId,
        name: createName.trim(),
        createdById: userId,
      });
      await loadData();
      setIsCreateOpen(false);
      setCreateName("");
      setCreateProcessId("");
    } catch (error: any) {
      console.error("Failed to create service:", error);
      alert(error?.message || "创建失败");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleEnabled = async (service: Service) => {
    try {
      const updated = await updateService(service.id, { enabled: !service.enabled });
      setServices((prev) => prev.map((s) => (s.id === service.id ? updated : s)));
    } catch (error: any) {
      console.error("Failed to toggle service:", error);
      alert(error?.message || "更新失败");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除该服务项吗？")) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
    } catch (error: any) {
      console.error("Failed to delete service:", error);
      alert(error?.message || "删除失败");
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600" />
            服务目录
          </h1>
          <p className="text-sm text-gray-500 mt-1">发布流程为可用服务项，并对外提供工单入口。</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增服务
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索服务名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  服务名称
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  流程
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                      <p className="text-sm text-gray-500">加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServices.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{service.process?.name || service.processId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {service.enabled ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          启用
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          停用
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {service.updatedAt ? dayjs(service.updatedAt).format("YYYY-MM-DD HH:mm:ss") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleToggleEnabled(service)}
                          className={service.enabled ? "text-green-600 hover:text-green-900" : "text-gray-600 hover:text-gray-900"}
                          title={service.enabled ? "停用" : "启用"}
                        >
                          {service.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && filteredServices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">暂无服务</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">新增服务</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">选择流程</label>
                  <select
                    value={createProcessId}
                    onChange={(e) => setCreateProcessId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    required
                  >
                    <option value="">请选择...</option>
                    {processes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">服务名称</label>
                  <input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    placeholder="例如：报修服务"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={creating || !createName.trim() || !createProcessId}
                  className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? "创建中..." : "创建"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
