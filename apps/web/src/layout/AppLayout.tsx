import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export function AppLayout() {
  const { state, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const user = state.status === "authenticated" ? state.user : null;

  return (
    <div className="appShell">
      <header className="topbar">
        <div className="topbarLeft">
          <Link className="brand" to="/">
            LLM Eval Platform
          </Link>
        </div>
        <div className="topbarRight">
          {user && (
            <>
              <span className="muted">{user.email}</span>
              <button
                className="button"
                type="button"
                onClick={() => {
                  logout()
                    .then(() => navigate("/login"))
                    .catch(() => navigate("/login"));
                }}
              >
                登出
              </button>
            </>
          )}
          {!user && location.pathname !== "/login" && (
            <Link className="button primary" to="/login">
              登录
            </Link>
          )}
        </div>
      </header>

      <div className="body">
        <aside className="sidebar">
          <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/">
            仪表盘
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/projects">
            项目
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/runs">
            评测运行
          </NavLink>
          <NavLink className={({ isActive }) => (isActive ? "navItem active" : "navItem")} to="/compare">
            对比
          </NavLink>
        </aside>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
