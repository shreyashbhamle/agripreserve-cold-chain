import {
  LayoutDashboard,
  Users,
  Truck,
  Snowflake,
  MapPinned,
  BarChart3,
  FileText,
  Gauge,
  Bell,
  Boxes,
  Settings,
  Route,
  ClipboardCheck,
  UserRound,
  Leaf,
  Radio,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";

interface SidebarProps {
  role: string;
  open: boolean;
  collapsed?: boolean;
  onClose: () => void;
  onToggleCollapse?: () => void;
}

const menuItems = {
  admin: [
    { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Management", path: "/admin/users", icon: Users },
    { label: "Cold Storage", path: "/admin/cold-storage", icon: Snowflake },
    { label: "Live Tracking", path: "/admin/live-tracking", icon: MapPinned },
    { label: "Shipments", path: "/admin/shipments", icon: Truck },
    {
      label: "Customs & Intl Trade",
      path: "/admin/international-trade",
      icon: Globe,
    },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Reports", path: "/admin/reports", icon: FileText },
    { label: "AI Insights", path: "/admin/ai-insights", icon: Gauge },
    { label: "Alerts", path: "/admin/alerts", icon: Bell },
    { label: "Inventory", path: "/admin/inventory", icon: Boxes },
    { label: "Settings", path: "/admin/settings", icon: Settings },
  ],
  farmer: [
    { label: "Dashboard", path: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "My Produce", path: "/farmer/produce", icon: Leaf },
    { label: "Shipments", path: "/farmer/shipments", icon: Truck },
    { label: "Inventory", path: "/farmer/inventory", icon: Boxes },
    { label: "IoT Monitoring", path: "/farmer/iot", icon: Radio },
    { label: "Sales & Mandi", path: "/farmer/sales", icon: Wallet },
    { label: "Reports", path: "/farmer/reports", icon: FileText },
    { label: "AI Insights", path: "/farmer/ai-insights", icon: Gauge },
    { label: "Profile", path: "/farmer/profile", icon: UserRound },
  ],
  driver: [
    { label: "Dashboard", path: "/driver/dashboard", icon: LayoutDashboard },
    { label: "Current Shipment", path: "/driver/current-shipment", icon: Truck },
    { label: "Live Tracking", path: "/driver/live-tracking", icon: MapPinned },
    { label: "Route & Navigation", path: "/driver/route-navigation", icon: Route },
    { label: "Temperature Monitor", path: "/driver/temperature-monitor", icon: Snowflake },
    { label: "Delivery Proof", path: "/driver/delivery-proof", icon: ClipboardCheck },
    { label: "My Trips", path: "/driver/my-trips", icon: FileText },
    { label: "Alerts", path: "/driver/alerts", icon: Bell },
    { label: "Profile", path: "/driver/profile", icon: UserRound },
  ],
  receiver: [
    { label: "Dashboard", path: "/receiver/dashboard", icon: LayoutDashboard },
    { label: "Incoming Shipments", path: "/receiver/incoming", icon: Truck },
    { label: "Quality Check", path: "/receiver/quality", icon: ClipboardCheck },
    { label: "Inventory", path: "/receiver/inventory", icon: Boxes },
    { label: "Demand Forecast", path: "/receiver/demand", icon: BarChart3 },
    { label: "Payments", path: "/receiver/payments", icon: Wallet },
    { label: "AI Insights", path: "/receiver/ai-insights", icon: Gauge },
    { label: "Reports", path: "/receiver/reports", icon: FileText },
    { label: "Profile", path: "/receiver/profile", icon: UserRound },
  ],
};

const roleAccentClasses: Record<
  string,
  { active: string; badge: string; label: string }
> = {
  admin: {
    active:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm",
    badge: "text-emerald-400",
    label: "Command Center",
  },
  farmer: {
    active:
      "bg-green-500/15 text-green-300 border border-green-500/30 shadow-sm",
    badge: "text-green-400",
    label: "Producer Portal",
  },
  driver: {
    active: "bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm",
    badge: "text-sky-400",
    label: "Fleet & Transit",
  },
  receiver: {
    active:
      "bg-violet-500/15 text-violet-300 border border-violet-500/30 shadow-sm",
    badge: "text-violet-400",
    label: "Receiving & Retail",
  },
};

export default function Sidebar({
  role,
  open,
  collapsed = false,
  onClose,
  onToggleCollapse,
}: SidebarProps) {
  const items = menuItems[role as keyof typeof menuItems] ?? [];
  const accent = roleAccentClasses[role] ?? roleAccentClasses.admin;

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-[#303846] bg-[#11151D] text-[#F1F5F9] transition-all duration-200 lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-20" : "w-64"}`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#303846] px-4">
          <Link
            to="/"
            className="flex items-center gap-2.5 min-w-0 focus:outline-none"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
              <Leaf size={19} />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-bold tracking-tight text-[#F1F5F9] truncate">
                  Agri<span className="text-emerald-400">Preserve</span>
                </h1>
                <p
                  className={`text-[10px] font-semibold uppercase tracking-wider truncate ${accent.badge}`}
                >
                  {accent.label}
                </p>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-[#303846] bg-[#171B24] text-[#9AA7BA] hover:text-white transition"
            >
              {collapsed ? (
                <ChevronRight size={15} />
              ) : (
                <ChevronLeft size={15} />
              )}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-3"
          aria-label={`${role} workspace navigation`}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? "justify-center px-2" : "gap-3 px-3.5"
                  } rounded-xl py-2.5 text-xs sm:text-sm font-medium transition ${
                    isActive
                      ? accent.active
                      : "text-[#9AA7BA] hover:bg-[#171B24] hover:text-[#F1F5F9] border border-transparent"
                  }`
                }
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="border-t border-[#303846] p-3">
          {collapsed ? (
            <div
              className="flex items-center justify-center rounded-xl bg-[#171B24] border border-[#303846] p-2.5 text-emerald-400"
              title="SQLite + Synthetic Telemetry Connected"
            >
              <ShieldCheck size={16} />
            </div>
          ) : (
            <div className="rounded-xl bg-[#171B24] border border-[#303846] p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#F1F5F9] capitalize">
                  {role} Workspace
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Connected
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#9AA7BA] leading-snug">
                Cold-chain telemetry &amp; SQLite persistence active.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}