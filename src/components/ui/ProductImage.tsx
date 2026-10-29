import Image from "next/image";
import { cn } from "@/lib/cn";

const CATEGORY_TINT: Record<string, { from: string; to: string; mark: string }> = {
  "womens-wellness": { from: "#EFE9DD", to: "#DCD3C0", mark: "#A8B99C" },
  "mens-wellness": { from: "#E6EBE2", to: "#CFD9C8", mark: "#175C3D" },
  "herbal-collections": { from: "#E2EAE0", to: "#C8D6C4", mark: "#123D2B" },
  "body-care": { from: "#F3EDE0", to: "#E4D8BF", mark: "#C6A667" },
  "food-spices": { from: "#F5EBDC", to: "#E8D5B5", mark: "#B5713A" },
};

interface ProductImageProps {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Renders the product photo when one has been supplied, otherwise a branded
 * botanical placeholder. Product photography is imported through the admin;
 * nothing here invents or borrows an image from another product.
 */
export function ProductImage({ src, alt, category = "herbal-collections", className, sizes, priority }: ProductImageProps) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-[#EFE9DD]", className)}>
        <Image src={src} alt={alt} fill sizes={sizes ?? "(max-width:768px) 50vw, 25vw"} priority={priority}
          className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
    );
  }

  const tint = CATEGORY_TINT[category] ?? CATEGORY_TINT["herbal-collections"];

  return (
    <div
      className={cn("relative overflow-hidden flex items-center justify-center", className)}
      style={{ background: `linear-gradient(145deg, ${tint.from} 0%, ${tint.to} 100%)` }}
      role="img"
      aria-label={`${alt} — product photograph pending`}
    >
      <svg width="46%" height="46%" viewBox="0 0 64 72" fill="none" className="opacity-50 transition-transform duration-700 group-hover:scale-105">
        <path d="M32 4C32 4 8 16 8 40C8 55.464 18.536 68 32 68C45.464 68 56 55.464 56 40C56 16 32 4 32 4Z" fill={tint.mark} opacity="0.35" />
        <path d="M32 12C32 12 14 22 14 42C14 54.15 22.059 64 32 64C41.941 64 50 54.15 50 42C50 22 32 12 32 12Z" fill={tint.mark} opacity="0.5" />
        <line x1="32" y1="14" x2="32" y2="64" stroke={tint.mark} strokeWidth="1.5" opacity="0.8" />
        <path d="M32 28L22 22M32 38L20 32M32 48L23 44M32 28L42 22M32 38L44 32M32 48L41 44" stroke={tint.mark} strokeWidth="1.2" opacity="0.7" strokeLinecap="round" />
      </svg>
      <span className="absolute bottom-2 left-0 right-0 text-center text-[9px] uppercase tracking-widest font-medium"
        style={{ color: tint.mark, fontFamily: "var(--font-body)" }}>
        Photo pending
      </span>
    </div>
  );
}
