import { Outlet, Navigate } from "react-router-dom";

export default function MobileLayout() {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="h-screen w-full bg-gray-100 flex justify-center items-center">
      {/* 模拟手机外壳 */}
      <div className="w-full max-w-md h-full sm:h-[844px] sm:max-h-[90vh] bg-gray-50 sm:rounded-[3rem] shadow-2xl relative overflow-hidden border-[8px] border-gray-900 flex flex-col">
        {/* 顶部状态栏模拟 */}
        <div className="h-7 w-full bg-transparent absolute top-0 z-50 flex justify-between items-center px-6 pointer-events-none">
          <div className="text-[10px] font-medium mt-1">9:41</div>
          <div className="w-32 h-6 bg-black rounded-b-2xl mx-auto -mt-2"></div>
          <div className="flex items-center space-x-1 mt-1">
            <div className="w-3 h-3 rounded-full border border-black relative">
              <div className="absolute inset-0.5 bg-black rounded-full"></div>
            </div>
            <div className="w-4 h-2.5 bg-black rounded-sm relative">
              <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-black rounded-r-sm"></div>
            </div>
          </div>
        </div>

        {/* 实际内容区域 */}
        <div className="flex-1 overflow-hidden pt-8 pb-4 relative z-0">
          <Outlet />
        </div>
        
        {/* 底部横条模拟 */}
        <div className="h-1 w-1/3 bg-gray-800 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 z-50 pointer-events-none"></div>
      </div>
    </div>
  );
}