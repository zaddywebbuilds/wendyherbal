"use client";
import { Search, Bell, Calendar, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export function AdminTopBar({ notifications = 0 }: { notifications?: number }) {
  // Resolved after mount so the prerender has no clock-dependent output.
  const [range, setRange] = useState("This month");
  useEffect(() => {
    const now = new Date();
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
    setRange(
      `${fmt(new Date(now.getFullYear(), now.getMonth(), 1))} – ${fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0))}`
    );
  }, []);

  return (
    <header className="h-[72px] shrink-0 bg-white border-b border-[#E9E4D6] flex items-center gap-4 px-5 lg:px-7">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
        <input type="search" placeholder="Search products, orders, customers..." aria-label="Search admin"
          className="w-full h-10 pl-10 pr-4 bg-[#F7F4E9] border border-transparent rounded-lg text-[13px] text-[#252B23] placeholder-[#A8B99C] focus:outline-none focus:border-[#175C3D] focus:bg-white transition-colors"
          style={{ fontFamily: "var(--font-body)" }} />
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        {/* Date range */}
        <button className="hidden md:flex items-center gap-2 h-10 px-3.5 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] text-[#252B23] hover:border-[#175C3D] transition-colors"
          style={{ fontFamily: "var(--font-body)" }}>
          <Calendar size={14} className="text-[#6b7265]" />
          {range}
          <ChevronDown size={13} className="text-[#6b7265]" />
        </button>

        {/* Notifications */}
        <button aria-label={`Notifications${notifications > 0 ? `, ${notifications} unread` : ""}`}
          className="relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#F7F4E9] transition-colors">
          <Bell size={17} className="text-[#4a5245]" strokeWidth={1.7} />
          {notifications > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#C06014] text-white text-[9px] font-bold flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* Account */}
        <button className="flex items-center gap-2 h-10 pl-1 pr-2.5 rounded-lg hover:bg-[#F7F4E9] transition-colors">
          <span className="w-8 h-8 rounded-full bg-[#123D2B] text-[#C6A667] text-[12px] font-bold flex items-center justify-center"
            style={{ fontFamily: "var(--font-body)" }}>A</span>
          <span className="hidden sm:inline text-[13px] font-medium text-[#252B23]"
            style={{ fontFamily: "var(--font-body)" }}>Admin</span>
          <ChevronDown size={13} className="text-[#6b7265]" />
        </button>
      </div>
    </header>
  );
}
