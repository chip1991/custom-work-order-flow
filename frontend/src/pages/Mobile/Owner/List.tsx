import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowLeft, Loader2, Clock, CheckCircle2, ChevronRight, Star, Ticket as TicketIcon } from "lucide-react";
import { getTickets, Ticket } from "@/api/tickets";

export default function OwnerList() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTickets().then(data => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'closed': return 'text-gray-500 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return '待处理';
      case 'in_progress': return '处理中';
      case 'closed': return '已完结';
      default: return status;
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Navbar */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 flex-shrink-0 z-10 sticky top-0">
        <button onClick={() => navigate('/mobile/owner')} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center font-bold text-gray-900 mr-6">我的工单</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto mb-2" />
            加载中...
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">暂无工单记录</p>
          </div>
        ) : (
          tickets.map(t => (
            <div 
              key={t.id} 
              onClick={() => navigate(`/tickets/${t.id}`)} // 在PC端复用现有详情页展示
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-400">
                    <TicketIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{t.service?.name || '未知服务'}</h3>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">{t.ticketNo}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(t.status)}`}>
                  {getStatusText(t.status)}
                </span>
              </div>
              
              <div className="border-t border-dashed border-gray-100 pt-3 flex justify-between items-center mt-1">
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1 opacity-70" />
                  {dayjs(t.createdAt).format('MM-DD HH:mm')}
                </div>
                
                {t.status === 'closed' ? (
                  <div className="flex items-center text-xs text-orange-500 font-medium">
                    <Star className="w-3 h-3 mr-1" />
                    去评价
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-indigo-500 font-medium">
                    查看进度
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}