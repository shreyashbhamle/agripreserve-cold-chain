import {
  Bell,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  UserCircle,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { agriApi } from "../../services/api";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user, logout, notify } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{
    shipments: Array<Record<string, unknown>>;
    produce: Array<Record<string, unknown>>;
    facilities: Array<Record<string, unknown>>;
    alerts: Array<Record<string, unknown>>;
  } | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<
    Array<{
      id: number;
      user_role: string;
      title: string;
      message: string;
      category: string;
      link: string;
      is_read: number;
      created_at: string;
    }>
  >([]);

  const loadNotifications = () => {
    if (!user) return;
    agriApi
      .notifications(user.role)
      .then((res) => {
        setUnreadCount(res.unread_count);
        setNotifications(res.items);
      })
      .catch(() => {
        // Fallback notifications when backend is offline
        setUnreadCount(2);
        setNotifications([
          {
            id: 1,
            user_role: user.role,
            title: "Critical Thermal Excursion: AP1025",
            message:
              "Bananas shipment AP1025 recorded 9.3°C near Pimpalgaon. Immediate check advised.",
            category: "alert",
            link: `/${user.role}/dashboard`,
            is_read: 0,
            created_at: new Date().toISOString(),
          },
          {
            id: 2,
            user_role: user.role,
            title: "High Risk Warning: AP1028",
            message:
              "Okra shipment AP1028 reached 11.4°C with door OPEN event.",
            category: "alert",
            link: `/${user.role}/dashboard`,
            is_read: 0,
            created_at: new Date().toISOString(),
          },
        ]);
      });
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = window.setTimeout(() => {
      agriApi
        .search(q)
        .then((res) => setSearchResults(res))
        .catch(() => setSearchResults(null));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [search]);

  const handleLogout = () => {
    agriApi.logout().catch(() => {});
    logout();
    notify("Signed out", "Your cold-chain session has been closed.", "info");
    navigate("/login", { replace: true });
  };

  const handleProfile = () => {
    setShowProfileMenu(false);
    if (user?.role === "admin") navigate("/admin/settings");
    else if (user?.role) navigate(`/${user.role}/profile`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = search.trim().toLowerCase();
    if (!query || !user) return;

    if (query.includes("ap10") || query.includes("ship")) {
      if (user.role === "admin") navigate("/admin/shipments");
      else if (user.role === "farmer") navigate("/farmer/shipments");
      else if (user.role === "driver") navigate("/driver/current-shipment");
      else navigate("/receiver/incoming");
    } else if (query.includes("user")) {
      if (user.role === "admin") navigate("/admin/users");
    } else if (query.includes("storage") || query.includes("cold")) {
      if (user.role === "admin") navigate("/admin/cold-storage");
    } else if (query.includes("alert") || query.includes("risk")) {
      if (user.role === "admin") navigate("/admin/alerts");
      else if (user.role === "driver") navigate("/driver/alerts");
      else navigate(`/${user.role}/ai-insights`);
    } else if (query.includes("inventory") || query.includes("stock")) {
      if (user.role === "driver") navigate("/driver/current-shipment");
      else navigate(`/${user.role}/inventory`);
    } else if (query.includes("quality")) {
      if (user.role === "receiver") navigate("/receiver/quality");
    } else if (query.includes("demand") || query.includes("forecast")) {
      if (user.role === "receiver") navigate("/receiver/demand");
      else navigate(`/${user.role}/ai-insights`);
    } else if (query.includes("ai") || query.includes("copilot")) {
      if (user.role === "driver") navigate("/driver/temperature-monitor");
      else navigate(`/${user.role}/ai-insights`);
    } else {
      notify(
        `Search filter applied: "${search}"`,
        "Select a matching record from the search dropdown or navigate via the sidebar.",
        "info",
      );
    }
    setSearch("");
    setSearchResults(null);
  };

  const markAllRead = () => {
    if (!user) return;
    agriApi
      .markAllNotificationsRead(user.role)
      .then(() => {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
      })
      .catch(() => {
        setUnreadCount(0);
      });
  };

  const segments = location.pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#303846] bg-[#11151D]/95 px-4 backdrop-blur-md md:px-6">
      {/* LEFT: Mobile Menu + Breadcrumbs + Global Search */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl border border-[#303846] bg-[#171B24] p-2 text-[#9AA7BA] hover:text-white lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumbs */}
        <nav
          aria-label="Breadcrumb"
          className="hidden xl:flex items-center gap-1.5 text-xs text-[#9AA7BA] shrink-0 mr-2"
        >
          <Link to="/" className="hover:text-white transition">
            AgriPreserve
          </Link>
          {segments.map((seg, idx) => (
            <span key={seg + idx} className="inline-flex items-center gap-1.5">
              <ChevronRight size={13} className="text-slate-600" />
              <span
                className={
                  idx === segments.length - 1
                    ? "font-semibold text-[#F1F5F9] capitalize"
                    : "capitalize"
                }
              >
                {seg.replace(/-/g, " ")}
              </span>
            </span>
          ))}
        </nav>

        {/* Global Search */}
        <div className="relative hidden w-full max-w-md md:block">
          <form onSubmit={handleSearchSubmit}>
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9AA7BA]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shipments (AP1025), crops, facilities, alerts..."
              className="h-9 w-full rounded-xl border border-[#303846] bg-[#0E1117] pl-9 pr-9 text-xs text-[#F1F5F9] placeholder-[#9AA7BA] outline-none transition focus:border-emerald-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSearchResults(null);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA7BA] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </form>

          {/* Live Search Results Dropdown */}
          {searchResults && (
            <div className="absolute left-0 top-full mt-2 w-full rounded-2xl border border-[#303846] bg-[#171B24] p-3 shadow-2xl z-50 space-y-2.5 text-xs">
              {searchResults.shipments.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                    Shipments
                  </p>
                  {searchResults.shipments.map((s) => (
                    <button
                      key={String(s.id)}
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSearchResults(null);
                        if (user?.role === "admin") navigate("/admin/shipments");
                        else if (user?.role === "farmer")
                          navigate("/farmer/shipments");
                        else if (user?.role === "driver")
                          navigate("/driver/current-shipment");
                        else navigate("/receiver/incoming");
                      }}
                      className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-[#1D2330] flex items-center justify-between text-[#F1F5F9]"
                    >
                      <span>
                        <b>{String(s.id)}</b> · {String(s.product)}
                      </span>
                      <span className="text-[#9AA7BA]">
                        {String(s.origin)} → {String(s.destination)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.facilities.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400 mb-1">
                    Cold Storage Hubs
                  </p>
                  {searchResults.facilities.map((f) => (
                    <button
                      key={String(f.id)}
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSearchResults(null);
                        if (user?.role === "admin")
                          navigate("/admin/cold-storage");
                      }}
                      className="w-full text-left rounded-lg px-2.5 py-1.5 hover:bg-[#1D2330] flex items-center justify-between text-[#F1F5F9]"
                    >
                      <span>
                        <b>{String(f.name)}</b>
                      </span>
                      <span className="text-[#9AA7BA]">{String(f.status)}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchResults.shipments.length === 0 &&
                searchResults.facilities.length === 0 &&
                searchResults.produce.length === 0 &&
                searchResults.alerts.length === 0 && (
                  <p className="text-[#9AA7BA] py-2 text-center">
                    No matching cold-chain records for &ldquo;{search}&rdquo;.
                  </p>
                )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Role Pill + Notifications + Profile */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#303846] bg-[#171B24] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
          {user?.role} Portal
        </span>

        {/* Notification Center */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((prev) => !prev);
              setShowProfileMenu(false);
            }}
            className="relative rounded-xl border border-[#303846] bg-[#171B24] p-2 text-[#9AA7BA] transition hover:text-white"
            aria-label="Open notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-[#303846] bg-[#171B24] p-3.5 shadow-2xl z-50">
              <div className="mb-3 flex items-center justify-between border-b border-[#303846] pb-2.5">
                <div>
                  <h3 className="text-sm font-bold text-[#F1F5F9]">
                    Cold-Chain Notifications
                  </h3>
                  <p className="text-[11px] text-[#9AA7BA]">
                    {unreadCount} unread operational alerts
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#1D2330] px-2 py-1 text-[11px] text-emerald-400 hover:text-emerald-300"
                    >
                      <CheckCheck size={13} /> Mark read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="rounded-lg p-1 text-[#9AA7BA] hover:text-white"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      agriApi.markNotificationRead(n.id).catch(() => {});
                      setShowNotifications(false);
                      navigate(n.link || `/${user?.role}/dashboard`);
                    }}
                    className={`w-full text-left rounded-xl border p-3 transition ${
                      n.is_read
                        ? "border-[#303846]/60 bg-[#11151D]/60 text-[#9AA7BA]"
                        : "border-emerald-500/30 bg-[#1D2330] text-[#F1F5F9]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#F1F5F9] truncate">
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#9AA7BA] leading-relaxed">
                      {n.message}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#303846] bg-[#171B24] px-2.5 py-1.5 hover:bg-[#1D2330] transition"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
              <UserCircle size={19} />
            </div>
            <div className="hidden text-left sm:block">
              <p className="max-w-[130px] truncate text-xs font-semibold text-[#F1F5F9]">
                {user?.name}
              </p>
              <p className="text-[10px] capitalize text-[#9AA7BA]">
                {user?.role}
              </p>
            </div>
            <ChevronDown size={14} className="hidden text-[#9AA7BA] sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-[#303846] bg-[#171B24] p-2 shadow-2xl z-50 text-xs">
              <div className="px-3 py-2 border-b border-[#303846] mb-1">
                <p className="font-semibold text-[#F1F5F9] truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-[#9AA7BA] truncate">
                  {user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleProfile}
                className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-[#F1F5F9] hover:bg-[#1D2330]"
              >
                <UserCircle size={15} className="text-emerald-400" />
                Profile &amp; Account
              </button>
              <button
                type="button"
                onClick={handleProfile}
                className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-[#F1F5F9] hover:bg-[#1D2330]"
              >
                <Settings size={15} className="text-sky-400" />
                Workspace Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full rounded-xl px-3 py-2 text-left text-rose-400 hover:bg-rose-950/30 mt-1"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}