import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

import type { User } from "../types/auth";

export interface ToastMessage {
  id: string;
  title: string;
  message?: string;
  type: "success" | "info" | "warning" | "error";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token?: string, rememberMe?: boolean) => void;
  updateUser: (partial: Partial<User>) => void;
  logout: () => void;
  toasts: ToastMessage[];
  notify: (title: string, message?: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser =
      localStorage.getItem("agripreserve_user") ||
      sessionStorage.getItem("agripreserve_user");

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem("agripreserve_user");
      sessionStorage.removeItem("agripreserve_user");
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return (
      localStorage.getItem("agripreserve_token") ||
      sessionStorage.getItem("agripreserve_token")
    );
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const notify = useCallback(
    (
      title: string,
      message?: string,
      type: ToastMessage["type"] = "info",
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-3), { id, title, message, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
      }, 4200);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const login = (
    loggedInUser: User,
    sessionToken?: string,
    rememberMe = true,
  ) => {
    setUser(loggedInUser);
    const activeToken = sessionToken ?? `local-session-${loggedInUser.id}`;
    setToken(activeToken);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("agripreserve_user", JSON.stringify(loggedInUser));
    storage.setItem("agripreserve_token", activeToken);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      if (localStorage.getItem("agripreserve_user")) {
        localStorage.setItem("agripreserve_user", JSON.stringify(updated));
      }
      if (sessionStorage.getItem("agripreserve_user")) {
        sessionStorage.setItem("agripreserve_user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("agripreserve_user");
    localStorage.removeItem("agripreserve_token");
    sessionStorage.removeItem("agripreserve_user");
    sessionStorage.removeItem("agripreserve_token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        updateUser,
        logout,
        toasts,
        notify,
        dismissToast,
      }}
    >
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
          role="region"
          aria-label="Notifications"
        >
          {toasts.map((t) => {
            const borderColors = {
              success: "border-emerald-500/50 bg-[#171B24]/95 text-emerald-300",
              info: "border-sky-500/50 bg-[#171B24]/95 text-sky-300",
              warning: "border-amber-500/50 bg-[#171B24]/95 text-amber-300",
              error: "border-rose-500/50 bg-[#171B24]/95 text-rose-300",
            }[t.type];
            return (
              <div
                key={t.id}
                className={`pointer-events-auto rounded-xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all flex items-start justify-between gap-3 ${borderColors}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-100">
                    {t.title}
                  </p>
                  {t.message && (
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                      {t.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(t.id)}
                  className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded"
                  aria-label="Dismiss notification"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}