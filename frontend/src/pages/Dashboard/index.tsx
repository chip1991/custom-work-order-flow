import { useEffect, useState } from "react";
import { Loader2, Ticket, CheckCircle2, Clock, AlertTriangle, Activity } from "lucide-react";
import { getDashboardStats } from "@/api/tickets";

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">数据报表</h1>
        <p className="text-sm text-gray-500 mt-1">全局工单指标统计与监控。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tickets */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">工单总数</div>
            <Ticket className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 text-3xl font-bold text-gray-900">{stats?.total || 0}</div>
          <div className="mt-1 text-sm text-gray-500">
            <span className="text-green-600 font-medium">{stats?.open || 0}</span> 处理中
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">完结率</div>
            <CheckCircle2 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 text-3xl font-bold text-gray-900">{stats?.completionRate || 0}%</div>
          <div className="mt-1 text-sm text-gray-500">
            累计完结 {stats?.closed || 0} 单
          </div>
        </div>

        {/* Average Time */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">平均解决时长</div>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="mt-4 text-3xl font-bold text-gray-900">{stats?.avgTimeHours || 0} <span className="text-xl text-gray-500">小时</span></div>
          <div className="mt-1 text-sm text-gray-500">基于已完结工单统计</div>
        </div>

        {/* SLA Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-500">SLA 预警</div>
            <AlertTriangle className={`w-5 h-5 ${(stats?.overdue || 0) > 0 ? 'text-red-500' : 'text-gray-400'}`} />
          </div>
          <div className="mt-4 flex items-baseline space-x-4">
            <div>
              <span className="text-3xl font-bold text-red-600">{stats?.overdue || 0}</span>
              <span className="text-sm text-gray-500 ml-1">超时</span>
            </div>
            <div>
              <span className="text-3xl font-bold text-yellow-600">{stats?.warning || 0}</span>
              <span className="text-sm text-gray-500 ml-1">临期</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-base font-bold text-gray-900 mb-4">工单趋势</div>
          <div className="h-64 flex items-end justify-between space-x-2 relative pb-8">
            {/* Fake simple CSS bar chart */}
            {[40, 70, 45, 90, 65, 80, 100].map((val, i) => (
              <div key={i} className="w-full h-full bg-indigo-50 rounded-t-sm relative group">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t-sm transition-all duration-500" 
                  style={{ height: `${val}%` }}
                ></div>
                <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-400">
                  {i + 1}月
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-base font-bold text-gray-900 mb-4">项目维度对比</div>
          <div className="space-y-4 mt-8">
            {[
              { name: "A区住宅一期", val: 85 },
              { name: "B区商业中心", val: 65 },
              { name: "C区产业园", val: 40 },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-900 font-medium">{item.val}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${item.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
