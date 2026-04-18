import { useState } from "react";
import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import { Cpu, BookOpen, Activity, LogOut, Menu, X, Bot, ChevronLeft, ChevronRight, Key, ClipboardList } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: "模型中心", path: "/models", icon: <Cpu className="w-5 h-5 shrink-0" /> },
    { name: "智能体中心", path: "/agents", icon: <Bot className="w-5 h-5 shrink-0" /> },
    { name: "题库中心", path: "/datasets", icon: <BookOpen className="w-5 h-5 shrink-0" /> },
    { name: "测评中心", path: "/evaluations", icon: <Activity className="w-5 h-5 shrink-0" /> },
    { name: "工单中心", path: "/work-orders", icon: <ClipboardList className="w-5 h-5 shrink-0" /> },
    { name: "API 密钥", path: "/api-keys", icon: <Key className="w-5 h-5 shrink-0" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-14 bg-white border-b border-gray-200 px-4">
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">
          LLM 测评平台
        </h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transform transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-56" : "md:w-64"}`}
      >
        <div className={`h-14 md:h-16 flex items-center px-6 border-b border-gray-200 relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <h1 className={`text-xl font-bold text-gray-800 tracking-tight hidden md:block whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
            LLM 测评平台
          </h1>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight md:hidden">
            菜单
          </h1>
          
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 shadow-sm z-50 transition-colors"
            title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center py-2.5 rounded-md transition-colors duration-200 ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                } ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {item.icon}
              <span className={`whitespace-nowrap transition-all duration-300 ${
                isCollapsed ? "opacity-0 w-0 ml-0 overflow-hidden" : "opacity-100 ml-3"
              }`}>
                {item.name}
              </span>
            </NavLink>
          ))}
        </nav>
        
        <div className={`p-4 border-t border-gray-200 flex ${isCollapsed ? 'justify-center px-2' : ''}`}>
          <button
            onClick={handleLogout}
            title={isCollapsed ? "退出登录" : undefined}
            className={`flex items-center py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors ${
              isCollapsed ? "justify-center px-0 w-full" : "px-3 w-full"
            }`}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? "opacity-0 w-0 ml-0 overflow-hidden" : "opacity-100 ml-3"
            }`}>
              退出登录
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col relative z-0">
        <div className="flex-1 p-4 md:p-6 pb-safe">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
