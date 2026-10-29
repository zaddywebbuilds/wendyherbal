"use client";
import { FORMAT_NGN } from "@/lib/constants";

const EMPTY_NOTE = "No data for this period yet";

/* ------------------------------------------------------------------ */
/* Line / area trend                                                   */
/* ------------------------------------------------------------------ */
export function TrendChart({ series, height = 190 }: { series: { day: number; value: number }[]; height?: number }) {
  const max = Math.max(...series.map((d) => d.value), 0);

  if (max === 0) {
    return (
      <div className="relative" style={{ height }}>
        <GridLines height={height} max={0} />
        <EmptyOverlay />
      </div>
    );
  }

  const w = 100, h = 100;
  const step = w / Math.max(series.length - 1, 1);
  const pts = series.map((d, i) => [i * step, h - (d.value / max) * h] as const);
  const line = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;

  return (
    <div className="relative" style={{ height }}>
      <GridLines height={height} max={max} />
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 w-full h-full pl-12">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#175C3D" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#175C3D" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trendFill)" />
        <path d={line} fill="none" stroke="#175C3D" strokeWidth="0.7" vectorEffect="non-scaling-stroke"
          strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function GridLines({ height, max }: { height: number; max: number }) {
  const ticks = 4;
  return (
    <div className="absolute inset-0 flex flex-col justify-between" style={{ height }}>
      {Array.from({ length: ticks + 1 }).map((_, i) => {
        const v = max === 0 ? 0 : Math.round((max * (ticks - i)) / ticks);
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="w-10 text-right text-[9px] text-[#A8B99C] shrink-0 tabular-nums"
              style={{ fontFamily: "var(--font-body)" }}>
              {max === 0 ? (i === ticks ? "0" : "") : `₦${v >= 1000 ? `${Math.round(v / 1000)}K` : v}`}
            </span>
            <div className="flex-1 border-t border-dashed border-[#EFE9DD]" />
          </div>
        );
      })}
    </div>
  );
}

function EmptyOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pl-12">
      <p className="text-[12px] text-[#A8B99C]" style={{ fontFamily: "var(--font-body)" }}>
        {EMPTY_NOTE}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Donut                                                               */
/* ------------------------------------------------------------------ */
const STATUS_COLOR: Record<string, string> = {
  pending: "#F59E0B", confirmed: "#3B82F6", processing: "#8B5CF6",
  dispatched: "#6366F1", delivered: "#175C3D", cancelled: "#EF4444",
};

export function StatusDonut({ counts }: { counts: Record<string, number> }) {
  const entries = Object.entries(counts);
  const total = entries.reduce((s, [, v]) => s + v, 0);

  const R = 42, C = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[150px] h-[150px]">
        <svg viewBox="0 0 110 110" className="w-full h-full -rotate-90">
          <circle cx="55" cy="55" r={R} fill="none" stroke="#EFE9DD" strokeWidth="13" />
          {total > 0 && entries.map(([key, value]) => {
            if (value === 0) return null;
            const len = (value / total) * C;
            const el = (
              <circle key={key} cx="55" cy="55" r={R} fill="none"
                stroke={STATUS_COLOR[key] ?? "#A8B99C"} strokeWidth="13"
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />
            );
            offset += len;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[1.7rem] font-bold text-[#123D2B] leading-none tabular-nums"
            style={{ fontFamily: "var(--font-body)" }}>{total}</span>
          <span className="text-[10.5px] text-[#6b7265] mt-1" style={{ fontFamily: "var(--font-body)" }}>
            Total Orders
          </span>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4 w-full">
        {entries.map(([key, value]) => (
          <li key={key} className="flex items-center gap-1.5 text-[11px]" style={{ fontFamily: "var(--font-body)" }}>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: STATUS_COLOR[key] ?? "#A8B99C" }} />
            <span className="text-[#6b7265] capitalize truncate">{key}</span>
            <span className="ml-auto font-semibold text-[#252B23] tabular-nums">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bars                                                                */
/* ------------------------------------------------------------------ */
export function CategoryBars({ data }: { data: { key: string; label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 0);

  return (
    <div className="relative" style={{ height: 200 }}>
      <GridLines height={200} max={max} />
      <div className="absolute inset-0 pl-12 flex items-end justify-around gap-2 pb-6">
        {data.map((d) => {
          const pct = max === 0 ? 0 : (d.value / max) * 100;
          return (
            <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
              {d.value > 0 && (
                <span className="text-[9.5px] font-semibold text-[#123D2B] mb-1 tabular-nums"
                  style={{ fontFamily: "var(--font-body)" }}>
                  {FORMAT_NGN(d.value).replace("NGN", "₦").replace(/\s/g, "")}
                </span>
              )}
              <div className="w-full max-w-[46px] rounded-t transition-all duration-500"
                style={{
                  height: `${Math.max(pct, 1.5)}%`,
                  background: pct > 0 ? "linear-gradient(180deg,#1C6B47 0%,#123D2B 100%)" : "#EFE9DD",
                }} />
              <span className="mt-2 text-[9px] text-[#6b7265] text-center leading-tight w-full truncate"
                style={{ fontFamily: "var(--font-body)" }} title={d.label}>
                {d.label.replace("Natural ", "").replace("'s Wellness", "'s")}
              </span>
            </div>
          );
        })}
      </div>
      {max === 0 && <EmptyOverlay />}
    </div>
  );
}
