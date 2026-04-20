import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getServices, Service } from "@/api/services";
import { Search, Bell, Home, Wrench, ChevronRight, ClipboardList } from "lucide-react";

export default function OwnerHome() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices({ status: "published" }).then(data => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Header */}
      <div className="bg-indigo-600 px-4 pt-10 pb-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">幸福社区</h1>
            <p className="text-xs opacity-80 mt-1">您好，李业主</p>
          </div>
          <Bell className="w-5 h-5" />
        </div>
        <div className="mt-4 bg-white/20 rounded-full px-3 py-1.5 flex items-center">
          <Search className="w-4 h-4 mr-2 opacity-80" />
          <input type="text" placeholder="搜索报修、投诉服务" className="bg-transparent border-none text-sm w-full text-white placeholder-white/70 focus:outline-none" />
        </div>
      </div>

      {/* Services Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-gray-900">服务大厅</h2>
        </div>
        
        {loading ? (
          <div className="text-center py-10 text-gray-500 text-sm">加载中...</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {services.map(s => (
              <div 
                key={s.id} 
                onClick={() => navigate(`/mobile/owner/create/${s.id}`)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition-transform"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
                  <Wrench className="w-5 h-5" />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{s.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{s.description || "点击发起服务"}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100" onClick={() => navigate('/mobile/owner/list')}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mr-3">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-sm">我的工单</h3>
              <p className="text-xs text-gray-500 mt-0.5">查看进度与评价</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center pb-6">
        <div className="flex flex-col items-center text-indigo-600">
          <Home className="w-6 h-6" />
          <span className="text-[10px] mt-1">首页</span>
        </div>
        <div className="flex flex-col items-center text-gray-400" onClick={() => navigate('/mobile/owner/list')}>
          <ClipboardList className="w-6 h-6" />
          <span className="text-[10px] mt-1">工单</span>
        </div>
      </div>
    </div>
  );
}