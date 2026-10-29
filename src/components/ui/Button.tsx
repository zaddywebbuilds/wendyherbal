import { cn } from "@/lib/cn";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "gold";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C6A667] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
          {
            "bg-[#123D2B] text-white hover:bg-[#175C3D] active:scale-[0.98]": variant === "primary",
            "border border-[#123D2B] text-[#123D2B] hover:bg-[#123D2B] hover:text-white active:scale-[0.98]": variant === "outline",
            "text-[#123D2B] hover:bg-[#123D2B]/10 active:scale-[0.98]": variant === "ghost",
            "bg-[#C6A667] text-white hover:bg-[#B5935A] active:scale-[0.98]": variant === "gold",
            "px-3 py-1.5 text-xs rounded-md": size === "sm",
            "px-5 py-2.5 text-sm rounded-lg": size === "md",
            "px-8 py-3.5 text-base rounded-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
