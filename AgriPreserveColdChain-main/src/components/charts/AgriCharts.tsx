import { useState } from "react";

export interface ChartSeries {
  name: string;
  color: string;
  values: number[];
}

/**
 * Multi-series Line / Area Chart with interactive hover tooltip, gridlines, axis units, and legend.
 */
export function MultiLineChart({
  labels,
  series,
  unit = "",
  height = 230,
  referenceMax,
  referenceLabel,
  area = false,
}: {
  labels: string[];
  series: ChartSeries[];
  unit?: string;
  height?: number;
  referenceMax?: number;
  referenceLabel?: string;
  area?: boolean;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const allValues = series.flatMap((s) => s.values);
  if (referenceMax !== undefined) allValues.push(referenceMax);
  if (!labels.length || !allValues.length) {
    return (
      <div className="h-48 flex items-center justify-center text-xs text-[#9AA7BA] border border-dashed border-[#303846] rounded-xl">
        No time-series points available for current filter.
      </div>
    );
  }

  const minVal = Math.min(0, ...allValues);
  const maxVal = Math.max(...allValues, 1);
  const span = maxVal - minVal || 1;

  const padLeft = 44;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 32;
  const width = 620;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const xFor = (i: number) =>
    labels.length === 1
      ? padLeft + plotW / 2
      : padLeft + (i / (labels.length - 1)) * plotW;
  const yFor = (v: number) => padTop + plotH - ((v - minVal) / span) * plotH;

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(
    (t) => minVal + t * span,
  );

  return (
    <div className="w-full select-none">
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {series.map((s) => (
            <div key={s.name} className="inline-flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-[#F1F5F9] font-medium">{s.name}</span>
            </div>
          ))}
          {referenceMax !== undefined && (
            <div className="inline-flex items-center gap-1.5 text-rose-300">
              <span className="w-3 border-t border-dashed border-rose-400" />
              <span>{referenceLabel ?? `Threshold (${referenceMax}${unit})`}</span>
            </div>
          )}
        </div>
        {hoverIdx !== null && labels[hoverIdx] && (
          <div className="rounded-lg bg-[#1D2330] border border-[#303846] px-2.5 py-1 text-[11px] text-[#F1F5F9] flex items-center gap-2">
            <span className="text-[#9AA7BA] font-semibold">
              {labels[hoverIdx]}:
            </span>
            {series.map((s) => (
              <span key={s.name} style={{ color: s.color }} className="font-semibold">
                {s.name}: {s.values[hoverIdx] ?? 0}
                {unit}
              </span>
            ))}
          </div>
        )}
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        onMouseLeave={() => setHoverIdx(null)}
      >
        {/* Horizontal Gridlines & Y Labels */}
        {yTicks.map((tick, idx) => {
          const y = yFor(tick);
          return (
            <g key={idx}>
              <line
                x1={padLeft}
                y1={y}
                x2={width - padRight}
                y2={y}
                stroke="#303846"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padLeft - 6}
                y={y + 4}
                textAnchor="end"
                fill="#9AA7BA"
                fontSize="10"
              >
                {Math.round(tick * 10) / 10}
                {unit}
              </text>
            </g>
          );
        })}

        {/* Optional Reference Threshold Line */}
        {referenceMax !== undefined && (
          <line
            x1={padLeft}
            y1={yFor(referenceMax)}
            x2={width - padRight}
            y2={yFor(referenceMax)}
            stroke="#F87171"
            strokeDasharray="5 4"
            strokeWidth="1.5"
          />
        )}

        {/* Series Polylines & Optional Area Fills */}
        {series.map((s) => {
          const pts = s.values
            .map((v, idx) => `${xFor(idx).toFixed(1)},${yFor(v).toFixed(1)}`)
            .join(" ");
          const areaPts = `${xFor(0).toFixed(1)},${(padTop + plotH).toFixed(1)} ${pts} ${xFor(s.values.length - 1).toFixed(1)},${(padTop + plotH).toFixed(1)}`;
          return (
            <g key={s.name}>
              {area && (
                <polygon
                  points={areaPts}
                  fill={s.color}
                  fillOpacity="0.14"
                />
              )}
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pts}
              />
              {s.values.map((v, idx) => (
                <circle
                  key={idx}
                  cx={xFor(idx)}
                  cy={yFor(v)}
                  r={hoverIdx === idx ? 4.5 : 3}
                  fill="#0E1117"
                  stroke={s.color}
                  strokeWidth="2"
                />
              ))}
            </g>
          );
        })}

        {/* X Axis Labels & Interactive Columns */}
        {labels.map((lbl, idx) => {
          const x = xFor(idx);
          const showLabel =
            labels.length <= 8 ||
            idx === 0 ||
            idx === labels.length - 1 ||
            idx % Math.ceil(labels.length / 6) === 0;
          return (
            <g key={idx}>
              {hoverIdx === idx && (
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotH}
                  stroke="#9AA7BA"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              )}
              {showLabel && (
                <text
                  x={x}
                  y={height - 8}
                  textAnchor="middle"
                  fill="#9AA7BA"
                  fontSize="10"
                >
                  {lbl}
                </text>
              )}
              <rect
                x={x - plotW / Math.max(labels.length, 2) / 2}
                y={padTop}
                width={plotW / Math.max(labels.length, 2)}
                height={plotH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoverIdx(idx)}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Vertical Bar Chart for categories/volumes
 */
export function BarChartVertical({
  items,
  unit = "",
  height = 220,
}: {
  items: Array<{ label: string; value: number; color?: string; subtitle?: string }>;
  unit?: string;
  height?: number;
}) {
  if (!items.length) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-[#9AA7BA] border border-dashed border-[#303846] rounded-xl">
        No category data available.
      </div>
    );
  }
  const maxVal = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="w-full" style={{ minHeight: height }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end pt-4">
        {items.map((item) => {
          const pct = Math.max(8, Math.round((item.value / maxVal) * 100));
          const barColor = item.color ?? "#10B981";
          return (
            <div
              key={item.label}
              className="flex flex-col items-center bg-[#11151D] border border-[#303846]/80 rounded-xl p-3 hover:border-slate-500 transition-colors"
            >
              <span className="text-xs font-bold text-[#F1F5F9]">
                {item.value.toLocaleString()}
                {unit}
              </span>
              <div className="w-full h-28 flex items-end justify-center my-2 bg-[#171B24] rounded-lg p-1.5 overflow-hidden">
                <div
                  className="w-full rounded-md transition-all duration-500"
                  style={{
                    height: `${pct}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-[#F1F5F9] truncate max-w-full">
                {item.label}
              </span>
              {item.subtitle && (
                <span className="text-[10px] text-[#9AA7BA] truncate max-w-full">
                  {item.subtitle}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Horizontal Progress / Utilization Bars
 */
export function HorizontalBarList({
  items,
  unit = "%",
  max = 100,
}: {
  items: Array<{
    label: string;
    value: number;
    secondary?: string;
    color?: string;
  }>;
  unit?: string;
  max?: number;
}) {
  if (!items.length) {
    return (
      <div className="h-36 flex items-center justify-center text-xs text-[#9AA7BA]">
        No utilization metrics available.
      </div>
    );
  }
  const effectiveMax = Math.max(max, ...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const pct = Math.min(100, Math.round((item.value / effectiveMax) * 100));
        const barColor =
          item.color ??
          (pct > 85 ? "#F87171" : pct > 70 ? "#F59E0B" : "#10B981");
        return (
          <div key={item.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-[#F1F5F9] truncate">
                  {item.label}
                </span>
                {item.secondary && (
                  <span className="text-[#9AA7BA] text-[11px] truncate">
                    ({item.secondary})
                  </span>
                )}
              </div>
              <span className="font-bold text-[#F1F5F9] shrink-0">
                {item.value}
                {unit}
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#11151D] border border-[#303846] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Stacked Bar Chart (e.g. Alerts by Severity & Status, or Spoilage Causes)
 */
export function StackedBarChart({
  rows,
}: {
  rows: Array<{
    label: string;
    segments: Array<{ name: string; value: number; color: string }>;
  }>;
}) {
  if (!rows.length) {
    return (
      <div className="h-36 flex items-center justify-center text-xs text-[#9AA7BA]">
        No stacked distribution data available.
      </div>
    );
  }

  const legendItems = rows[0]?.segments ?? [];

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        {legendItems.map((seg) => (
          <div key={seg.name} className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-[#9AA7BA]">{seg.name}</span>
          </div>
        ))}
      </div>

      {rows.map((row) => {
        const total = row.segments.reduce((acc, s) => acc + s.value, 0) || 1;
        return (
          <div key={row.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-[#F1F5F9]">{row.label}</span>
              <span className="text-[#9AA7BA]">
                Total:{" "}
                <strong className="text-[#F1F5F9]">
                  {row.segments.reduce((acc, s) => acc + s.value, 0)}
                </strong>
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-[#11151D] border border-[#303846] overflow-hidden flex">
              {row.segments.map((seg) => {
                const widthPct = (seg.value / total) * 100;
                if (widthPct <= 0) return null;
                return (
                  <div
                    key={seg.name}
                    title={`${seg.name}: ${seg.value}`}
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: seg.color,
                    }}
                    className="h-full first:rounded-l-full last:rounded-r-full"
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Donut Chart with Center Metric & Legend
 */
export function DonutChart({
  segments,
  centerTitle,
  centerValue,
}: {
  segments: Array<{ label: string; value: number; color: string }>;
  centerTitle?: string;
  centerValue?: string | number;
}) {
  const total = segments.reduce((acc, s) => acc + s.value, 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
      <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 150 150" className="w-36 h-36 -rotate-90">
          <circle
            cx="75"
            cy="75"
            r={radius}
            fill="transparent"
            stroke="#1D2330"
            strokeWidth="16"
          />
          {total > 0 &&
            segments.map((seg) => {
              const frac = seg.value / total;
              const strokeDasharray = `${frac * circumference} ${circumference}`;
              const strokeDashoffset = -accumulated * circumference;
              accumulated += frac;
              return (
                <circle
                  key={seg.label}
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="16"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="butt"
                />
              );
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
          <span className="text-xl font-bold text-[#F1F5F9]">
            {centerValue ?? total}
          </span>
          {centerTitle && (
            <span className="text-[10px] uppercase tracking-wider text-[#9AA7BA]">
              {centerTitle}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 w-full space-y-2">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div
              key={seg.label}
              className="flex items-center justify-between text-xs rounded-xl bg-[#11151D] border border-[#303846]/70 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-[#F1F5F9] font-medium">{seg.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F1F5F9]">{seg.value}</span>
                <span className="text-[11px] text-[#9AA7BA]">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
