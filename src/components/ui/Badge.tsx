import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "forest" | "gold" | "sage" | "cream" | "red" | "blue" | "purple";
  className?: string;
}

export function Badge({ children, variant = "forest", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-[#123D2B]/10 text-[#123D2B]": variant === "forest",
          "bg-[#C6A667]/20 text-[#8B6914]": variant === "gold",
          "bg-[#A8B99C]/30 text-[#4a5e42]": variant === "sage",
          "bg-[#EFE9DD] text-[#252B23]": variant === "cream",
          "bg-red-100 text-red-700": variant === "red",
          "bg-blue-100 text-blue-700": variant === "blue",
          "bg-purple-100 text-purple-700": variant === "purple",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
