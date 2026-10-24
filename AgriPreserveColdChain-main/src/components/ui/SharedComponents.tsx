import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Info,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react";

export type RoleAccent = "admin" | "farmer" | "driver" | "receiver";

export const ROLE_ACCENT_STYLES: Record<
  RoleAccent,
  {
    badge: string;
    border: string;
    button: string;
    text: string;
    glow: string;
    hex: string;
  }
> = {
  admin: {
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    border: "border-emerald-500/30",
    button: "bg-emerald-500 hover:bg-emerald-400 text-slate-950",
    text: "text-emerald-400",
    glow: "from-emerald-500/10 to-transparent",
    hex: "#10B981",
  },
  farmer: {
    badge: "bg-green-500/15 text-green-300 border-green-500/30",
    border: "border-green-500/30",
    button: "bg-green-500 hover:bg-green-400 text-slate-950",
    text: "text-green-400",
    glow: "from-green-500/10 to-transparent",
    hex: "#22C55E",
  },
  driver: {
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    border: "border-sky-500/30",
    button: "bg-sky-500 hover:bg-sky-400 text-slate-950",
    text: "text-sky-400",
    glow: "from-sky-500/10 to-transparent",
    hex: "#38BDF8",
  },
  receiver: {
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    border: "border-violet-500/30",
    button: "bg-violet-500 hover:bg-violet-400 text-slate-950",
    text: "text-violet-400",
    glow: "from-violet-500/10 to-transparent",
    hex: "#A78BFA",
  },
};

export function PageHeader({
  role = "admin",
  eyebrow,
  title,
  description,
  actions,
  dataMode = "SYNTHETIC DEMO DATASET",
}: {
  role?: RoleAccent;
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  dataMode?: string;
}) {
  const accent = ROLE_ACCENT_STYLES[role];
  return (
    <div
      className={`rounded-2xl border border-[#303846] bg-gradient-to-r ${accent.glow} bg-[#171B24] p-5 md:p-6 shadow-xl`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {eyebrow && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${accent.badge}`}
              >
                {eyebrow}
              </span>
            )}
            {dataMode && (
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-[#1D2330] px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Info className="w-3 h-3 text-sky-400" />
                {dataMode}
              </span>
            )}
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#F1F5F9]">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-[#9AA7BA] max-w-3xl leading-relaxed">
            {description}
          </p>
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive = true,
  icon,
  sparkline,
  to,
  badge,
  tooltip,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  icon?: ReactNode;
  sparkline?: number[];
  to?: string;
  badge?: string;
  tooltip?: string;
}) {
  const minVal = sparkline && sparkline.length ? Math.min(...sparkline) : 0;
  const maxVal = sparkline && sparkline.length ? Math.max(...sparkline) : 1;
  const range = maxVal - minVal || 1;
  const points =
    sparkline && sparkline.length > 1
      ? sparkline
          .map((v, idx) => {
            const x = (idx / (sparkline.length - 1)) * 72;
            const y = 22 - ((v - minVal) / range) * 18;
            return `${x.toFixed(1)},${y.toFixed(1)}`;
          })
          .join(" ")
      : "";

  const content = (
    <div
      title={tooltip}
      className="group relative h-full rounded-2xl border border-[#303846] bg-[#171B24] hover:bg-[#1D2330]/90 hover:border-slate-600 p-4 transition-all flex flex-col justify-between shadow-lg"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-[#9AA7BA] truncate">
              {title}
            </p>
            {badge && (
              <span className="rounded bg-slate-800 border border-slate-700 px-1.5 py-0.2 text-[10px] font-medium text-slate-300">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-xl md:text-2xl font-bold tracking-tight text-[#F1F5F9]">
            {value}
          </p>
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-[#1D2330] border border-[#303846] text-emerald-400 shrink-0 group-hover:scale-105 transition-transform">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#303846]/60 flex items-center justify-between gap-2">
        <div className="min-w-0">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                trendPositive ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {trendPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {trend}
            </span>
          )}
          {subtitle && (
            <p className="text-[11px] text-[#9AA7BA] truncate">{subtitle}</p>
          )}
        </div>
        {points && (
          <svg
            width="74"
            height="24"
            viewBox="0 0 74 24"
            className="shrink-0 overflow-visible"
            aria-hidden="true"
          >
            <polyline
              fill="none"
              stroke={trendPositive ? "#10B981" : "#F59E0B"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
          </svg>
        )}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-2xl">
        {content}
      </Link>
    );
  }
  return content;
}

export function ChartCard({
  title,
  subtitle,
  badge = "SYNTHETIC DEMO",
  rightSlot,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-5 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-wrap items-start justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm md:text-base font-semibold text-[#F1F5F9]">
                {title}
              </h3>
              {badge && (
                <span className="rounded-md bg-[#1D2330] border border-[#303846] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#9AA7BA]">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[#9AA7BA] mt-0.5">{subtitle}</p>
            )}
          </div>
          {rightSlot && <div className="shrink-0">{rightSlot}</div>}
        </div>
        <div className="w-full">{children}</div>
      </div>
      {footer && (
        <div className="mt-4 pt-3 border-t border-[#303846]/70 text-xs text-[#9AA7BA]">
          {footer}
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = (status || "").toLowerCase();
  let classes = "bg-slate-800 text-slate-300 border-slate-700";

  if (
    normalized.includes("delivered") ||
    normalized.includes("normal") ||
    normalized.includes("online") ||
    normalized.includes("active") ||
    normalized.includes("paid") ||
    normalized.includes("accepted") ||
    normalized.includes("resolved") ||
    normalized.includes("compliant") ||
    normalized.includes("fresh") ||
    normalized.includes("good") ||
    normalized.includes("low")
  ) {
    classes = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
  } else if (
    normalized.includes("transit") ||
    normalized.includes("assigned") ||
    normalized.includes("loading") ||
    normalized.includes("acknowledged") ||
    normalized.includes("processing") ||
    normalized.includes("info")
  ) {
    classes = "bg-sky-500/15 text-sky-300 border-sky-500/30";
  } else if (
    normalized.includes("risk") ||
    normalized.includes("warning") ||
    normalized.includes("delayed") ||
    normalized.includes("pending") ||
    normalized.includes("expiring") ||
    normalized.includes("medium") ||
    normalized.includes("conditional") ||
    normalized.includes("partial") ||
    normalized.includes("investigating")
  ) {
    classes = "bg-amber-500/15 text-amber-300 border-amber-500/30";
  } else if (
    normalized.includes("critical") ||
    normalized.includes("high") ||
    normalized.includes("rejected") ||
    normalized.includes("spoiled") ||
    normalized.includes("offline") ||
    normalized.includes("open") ||
    normalized.includes("excursion") ||
    normalized.includes("cancelled")
  ) {
    classes = "bg-rose-500/15 text-rose-300 border-rose-500/30";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

export function FilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters,
  actions,
}: {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#303846] bg-[#171B24] p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[210px] max-w-md">
          <Search className="w-4 h-4 text-[#9AA7BA] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#11151D] border border-[#303846] text-xs md:text-sm text-[#F1F5F9] placeholder-[#9AA7BA] focus:outline-none focus:border-emerald-500"
          />
        </div>
        {filters}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#303846] bg-[#171B24]/60 p-8 text-center">
      <p className="text-sm font-semibold text-[#F1F5F9]">{title}</p>
      <p className="text-xs text-[#9AA7BA] mt-1 max-w-md mx-auto">
        {description}
      </p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-[#1D2330] border border-[#303846]"
        />
      ))}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-rose-200">
            Operational Data Notice
          </p>
          <p className="text-xs text-rose-300/90 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 px-3 py-1.5 text-xs font-semibold text-rose-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
}

export function ExportButton({
  label = "Export CSV",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-xl border border-[#303846] bg-[#1D2330] hover:bg-slate-700/70 px-3.5 py-2 text-xs font-semibold text-[#F1F5F9] transition-colors"
    >
      <Download className="w-3.5 h-3.5 text-emerald-400" />
      {label}
    </button>
  );
}

export function DataSourceBanner({
  mode = "SYNTHETIC_DEMO",
  note = "Metrics and time-series on this screen are computed from the local SQLite database seeded from datasets/synthetic/*.csv.",
}: {
  mode?: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-[#303846] bg-[#11151D] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#9AA7BA]">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>{note}</span>
      </div>
      <span className="inline-flex items-center gap-1 rounded bg-[#1D2330] border border-[#303846] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
        <AlertTriangle className="w-3 h-3" />
        {mode}
      </span>
    </div>
  );
}
