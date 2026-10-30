import type { LucideIcon } from "lucide-react";

/**
 * The figure card used across the admin screens.
 *
 * Extracted once Customers, Orders and Products all needed it. A value here is
 * always derived from real data; a count of zero is shown as zero rather than
 * dressed up.
 */
export function Stat({ label, value, icon: Icon, tint, color, hint }: {
  label: string;
  value: string;
  icon: LucideIcon;
  tint: string;
  color: string;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E9E4D6] p-4 flex items-center gap-3.5">
      <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: tint }}>
        <Icon size={19} style={{ color }} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>{label}</p>
        <p className="text-[1.35rem] font-bold text-[#123D2B] leading-tight tabular-nums truncate"
          style={{ fontFamily: "var(--font-body)" }}>{value}</p>
        {hint && (
          <p className="text-[11px] text-[#A8B99C] leading-tight truncate"
            style={{ fontFamily: "var(--font-body)" }}>{hint}</p>
        )}
      </div>
    </div>
  );
}
