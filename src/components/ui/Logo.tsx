import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  variant?: "dark" | "light";
  className?: string;
}

export function Logo({ variant = "dark", className }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-[#123D2B]";
  const subColor = variant === "light" ? "text-white/70" : "text-[#A8B99C]";

  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      {/* Botanical leaf mark */}
      <svg width="32" height="36" viewBox="0 0 32 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 2C16 2 4 8 4 20C4 27.732 9.268 34 16 34C22.732 34 28 27.732 28 20C28 8 16 2 16 2Z"
          fill={variant === "light" ? "rgba(255,255,255,0.2)" : "#A8B99C"}
        />
        <path
          d="M16 6C16 6 7 11 7 21C7 27.075 11.029 32 16 32C20.971 32 25 27.075 25 21C25 11 16 6 16 6Z"
          fill={variant === "light" ? "rgba(255,255,255,0.4)" : "#175C3D"}
        />
        <path
          d="M16 10C16 10 10 14 10 22C10 26.418 12.686 30 16 30C19.314 30 22 26.418 22 22C22 14 16 10 16 10Z"
          fill={variant === "light" ? "white" : "#123D2B"}
        />
        {/* Center vein */}
        <line x1="16" y1="10" x2="16" y2="30" stroke={variant === "light" ? "rgba(255,255,255,0.5)" : "#C6A667"} strokeWidth="0.8" />
      </svg>

      <div className="flex flex-col">
        <span
          className={cn("text-lg font-semibold tracking-wide leading-none", textColor)}
          style={{ fontFamily: "var(--font-heading)" }}
        >
          WENDY HERBALS
        </span>
        <span
          className={cn("text-[9px] tracking-widest uppercase leading-none mt-0.5", subColor)}
          style={{ fontFamily: "var(--font-body)" }}
        >
          Rooted in Nature. Inspired by Wellness.
        </span>
      </div>
    </Link>
  );
}
