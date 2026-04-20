import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Bell, Briefcase, ChevronRight, ClipboardList, Clock, Search, MapPin, CheckCircle2 } from "lucide-react";
import { getTickets, Ticket, assignTicket } from "@/api/tickets";

export default function EmployeeHome() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter for employee view: open (grab pool) + assigned to me (processing)
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    getTickets({ status: "open" }).then(data => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const handleGrab = async (ticketId: string) => {
    if (!user) return;
    try {
      await assignTicket(ticketId, user.id);
      alert("抢单成功！");
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, assigneeId: user.id } : t));
    } catch (e: any) {
      alert("抢单失败：" + e.message);
    }
  };

  const poolTickets = tickets.filter(t => !t.assigneeId);
  const myTickets = tickets.filter(t => t.assigneeId === user?.id);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-slate-800 px-4 pt-10 pb-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">员工工作台</h1>
            <p className="text-xs opacity-80 mt-1">
              {user ? `${user.account} · 维修组` : '未登录'}
            </p>
          </div>
          <Bell className="w-5 h-5" />
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex divide-x divide-gray-100">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-indigo-600">{myTickets.length}</div>
            <div className="text-xs text-gray-500 mt-1">待我处理</div>
          </div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-orange-500">{poolTickets.length}</div>
            <div className="text-xs text-gray-500 mt-1">抢单池</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        {/* Grab Pool */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-900 flex items-center">
              <Briefcase className="w-4 h-4 mr-1 text-orange-500" /> 
              抢单大厅
            </h2>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4 text-gray-500 text-xs">加载中...</div>
            ) : poolTickets.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-xs shadow-sm border border-gray-100">
                当前暂无可接工单
              </div>
            ) : (
              poolTickets.map(t => (
                <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 text-sm">{t.service?.name || t.title}</h3>
                    <span className="text-[10px] text-gray-400">{dayjs(t.createdAt).format('MM-DD HH:mm')}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <MapPin className="w-3 h-3 mr-1" />
                    幸福社区 · {t.process?.name || '未知区域'}
                  </div>
                  <div className="flex justify-end border-t border-gray-50 pt-3">
                    <button 
                      onClick={() => handleGrab(t.id)}
                      className="bg-orange-500 text-white text-xs font-bold px-5 py-1.5 rounded-full active:bg-orange-600 transition-colors"
                    >
                      抢单
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Tasks */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-gray-900 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-indigo-500" /> 
              我的处理中
            </h2>
          </div>
          
          <div className="space-y-3">
            {myTickets.length === 0 && !loading ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-xs shadow-sm border border-gray-100">
                处理列表空空如也
              </div>
            ) : (
              myTickets.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => navigate(`/mobile/employee/task/${t.id}`)}
                  className="bg-white rounded-xl p-4 shadow-sm border border-indigo-50 active:bg-gray-50 transition-colors relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                  <div className="flex justify-between items-start mb-2 pl-1">
                    <h3 className="font-bold text-gray-900 text-sm">{t.title}</h3>
                    <span className="text-[10px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">处理中</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pl-1">
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      接单: {dayjs(t.updatedAt).format('HH:mm')}
                    </div>
                    <div className="flex items-center text-xs text-indigo-600 font-medium">
                      去处理 <ChevronRight className="w-3 h-3 ml-0.5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center pb-6">
        <div className="flex flex-col items-center text-indigo-600">
          <Briefcase className="w-6 h-6" />
          <span className="text-[10px] mt-1">工作台</span>
        </div>
        <div className="flex flex-col items-center text-gray-400">
          <ClipboardList className="w-6 h-6" />
          <span className="text-[10px] mt-1">我的</span>
        </div>
      </div>
    </div>
  );
}