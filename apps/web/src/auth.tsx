import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError, fetchMe, login as apiLogin, logout as apiLogout } from "./api";

type AuthState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; user: { id: string; email: string; role: "ADMIN" | "USER" } };

type AuthContextValue = {
  apiBase: string;
  state: AuthState;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider(props: { children: ReactNode }) {
  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE ?? "/api", []);
  const [state, setState] = useState<AuthState>({ status: "loading" });

  const refresh = useCallback(async () => {
    try {
      const res = await fetchMe(apiBase);
      setState({ status: "authenticated", user: res.user });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setState({ status: "anonymous" });
        return;
      }
      setState({ status: "anonymous" });
      throw err;
    }
  }, [apiBase]);

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string) => {
      await apiLogin(apiBase, { email, password });
      await refresh();
    },
    [apiBase, refresh]
  );

  const logout = useCallback(async () => {
    await apiLogout(apiBase);
    setState({ status: "anonymous" });
  }, [apiBase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      apiBase,
      state,
      refresh,
      login,
      logout
    }),
    [apiBase, state, refresh, login, logout]
  );

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is missing");
  return value;
}
