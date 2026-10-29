import { Leaf, ShieldCheck, Sparkles, Truck, Phone } from "lucide-react";
import { WHATSAPP_NUMBER } from "@/lib/constants";

export function TopBar() {
  return (
    <div className="bg-[#123D2B] text-white/85 text-[11px] tracking-wide"
      style={{ fontFamily: "var(--font-body)" }}>
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between gap-4">
        {/* Left: brand promises */}
        <div className="flex items-center gap-4 overflow-hidden">
          <span className="flex items-center gap-1.5 shrink-0">
            <Leaf size={12} className="text-[#C6A667]" /> Natural Ingredients
          </span>
          <span className="hidden sm:flex items-center gap-1.5 shrink-0">
            <ShieldCheck size={12} className="text-[#C6A667]" /> Trusted Quality
          </span>
          <span className="hidden lg:flex items-center gap-1.5 shrink-0">
            <Sparkles size={12} className="text-[#C6A667]" /> Wellness for a Healthier Tomorrow
          </span>
        </div>

        {/* Right: delivery + contact */}
        <div className="flex items-center gap-4 shrink-0">
          <span className="hidden md:flex items-center gap-1.5">
            <Truck size={12} className="text-[#C6A667]" /> Delivery Across Nigeria
          </span>
          <a href={`tel:${WHATSAPP_NUMBER}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone size={12} className="text-[#C6A667]" /> {WHATSAPP_NUMBER}
          </a>
          <span className="hidden sm:inline text-white/50">NGN &#8358;</span>
        </div>
      </div>
    </div>
  );
}
