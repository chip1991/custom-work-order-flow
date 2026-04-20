import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowRight, Loader2 } from "lucide-react";
import { getTickets, Ticket } from "@/api/tickets";

export default function Dispatch() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTickets({ status: "open" });
        setTickets(data);
      } catch (error) {
        console.error("Failed to load open tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">调度中心</h1>
          <p className="text-sm text-gray-500 mt-1">占位页：当前展示开放工单列表。</p>
        </div>
        <button
          onClick={() => navigate("/tickets?status=open")}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          前往工单台账（开放）
          <ArrowRight className="w-4 h-4 ml-2" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="text-sm font-medium text-gray-900">开放工单</div>
        </div>

        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  服务
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
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.ticketNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{t.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {t.service?.name || t.serviceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.updatedAt ? dayjs(t.updatedAt).format("YYYY-MM-DD HH:mm:ss") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${t.id}`);
                        }}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                      >
                        详情 <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">暂无开放工单</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
