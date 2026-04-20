import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowRight, Loader2, AlertTriangle, Clock } from "lucide-react";
import { getSlaTickets, Ticket } from "@/api/tickets";

export default function Sla() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<(Ticket & { slaStatus: string; remainingHours: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getSlaTickets();
        setTickets(data);
      } catch (error) {
        console.error("Failed to load SLA tickets:", error);
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SLA 监控与预警</h1>
          <p className="text-sm text-gray-500 mt-1">展示超时或即将超时的工单。</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center">
          <div className="bg-red-100 p-3 rounded-lg mr-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <div className="text-sm text-red-600 font-medium">已超时工单</div>
            <div className="text-2xl font-bold text-red-700">
              {tickets.filter(t => t.slaStatus === 'overdue').length}
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-center">
          <div className="bg-yellow-100 p-3 rounded-lg mr-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <div className="text-sm text-yellow-600 font-medium">即将超时 (剩余&lt;20%)</div>
            <div className="text-2xl font-bold text-yellow-700">
              {tickets.filter(t => t.slaStatus === 'warning').length}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="text-sm font-medium text-gray-900">预警工单列表</div>
        </div>

        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态 / 处理人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  剩余时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  创建时间
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <div className="font-medium text-indigo-600">{t.ticketNo}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{t.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        {t.slaStatus === 'overdue' ? (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">已超时</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">即将超时</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        处理人: {t.assignee?.account || '待分配'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {t.slaStatus === 'overdue' ? (
                        <span className="text-red-600">超 {Math.abs(Number(t.remainingHours))}h</span>
                      ) : (
                        <span className="text-yellow-600">剩 {t.remainingHours}h</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.createdAt ? dayjs(t.createdAt).format("YYYY-MM-DD HH:mm") : "-"}
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
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">暂无预警工单，SLA 状况良好</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
