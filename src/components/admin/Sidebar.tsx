"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardList, Package, FolderTree, Users, Boxes, Star,
  FileText, Tag, Truck, BarChart3, Settings, Store, MessageCircle, Monitor,
  Mail, Inbox, Send, HelpCircle, ChevronsLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Only screens that exist are linked.
 *
 * The approved mockup also showed Categories, Reviews, Blog & Content,
 * Promotions, Delivery & Shipping, Reports, three sales channels, Messages,
 * Contact Form, Newsletter and Help & Docs. None was ever built, so each was
 * a link to a 404. They are listed in HANDOFF.md; restoring one is a single
 * line here once its screen exists.
 */
const MAIN = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Orders", href: "/admin/orders", icon: ClipboardList, badgeKey: "orders" },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Inventory", href: "/admin/inventory", icon: Boxes },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface Props {
  /** Live counts. Absent or zero renders no badge — never a placeholder number. */
  badges?: Partial<Record<"orders" | "messages" | "contact", number>>;
}

export function AdminSidebar({ badges = {} }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const Item = ({ item }: { item: { label: string; href: string; icon: typeof Package; badgeKey?: string } }) => {
    const Icon = item.icon;
    const active = pathname === item.href;
    const count = item.badgeKey ? badges[item.badgeKey as keyof typeof badges] ?? 0 : 0;

    return (
      <Link href={item.href} title={collapsed ? item.label : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg transition-colors",
          collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2.5",
          active ? "bg-[#1C5438] text-white" : "text-white/65 hover:bg-white/8 hover:text-white"
        )}>
        <Icon size={17} strokeWidth={1.7} className="shrink-0" />
        {!collapsed && (
          <>
            <span className="text-[13px] font-medium truncate" style={{ fontFamily: "var(--font-body)" }}>
              {item.label}
            </span>
            {count > 0 && (
              <span className="ml-auto shrink-0 min-w-[20px] h-[19px] px-1.5 rounded-full bg-[#C06014] text-white text-[10px] font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </>
        )}
        {collapsed && count > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#C06014]" />
        )}
      </Link>
    );
  };

  const SectionLabel = ({ children }: { children: string }) =>
    collapsed ? <div className="h-px bg-white/10 mx-3 my-3" /> : (
      <p className="px-3 pt-5 pb-2 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/35"
        style={{ fontFamily: "var(--font-body)" }}>
        {children}
      </p>
    );

  return (
    <aside className={cn(
      "hidden lg:flex flex-col bg-[#123D2B] shrink-0 transition-[width] duration-300",
      collapsed ? "w-[68px]" : "w-[240px]"
    )}>
      {/* Brand */}
      <div className={cn("flex items-center gap-2.5 h-[72px] shrink-0 border-b border-white/10",
        collapsed ? "justify-center px-0" : "px-5")}>
        <svg width="26" height="30" viewBox="0 0 32 36" fill="none" className="shrink-0">
          <path d="M16 2C16 2 4 8 4 20C4 27.732 9.268 34 16 34C22.732 34 28 27.732 28 20C28 8 16 2 16 2Z" fill="#A8B99C" opacity="0.5" />
          <path d="M16 8C16 8 8 13 8 23C8 29.075 11.6 34 16 34C20.4 34 24 29.075 24 23C24 13 16 8 16 8Z" fill="#C6A667" />
          <line x1="16" y1="9" x2="16" y2="33" stroke="#123D2B" strokeWidth="1" />
        </svg>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white text-[14px] font-semibold tracking-wide leading-none truncate"
              style={{ fontFamily: "var(--font-heading)" }}>
              WENDY HERBALS
            </p>
            <p className="text-[8px] text-white/45 tracking-wider uppercase mt-1 truncate"
              style={{ fontFamily: "var(--font-body)" }}>
              Rooted in Nature
            </p>
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} aria-label="Collapse sidebar"
            className="ml-auto p-1 text-white/40 hover:text-white transition-colors">
            <ChevronsLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)} aria-label="Expand sidebar"
          className="mx-auto mt-2 p-1.5 text-white/40 hover:text-white transition-colors">
          <ChevronRight size={16} />
        </button>
      )}

      {/* Nav */}
      <nav className={cn("flex-1 overflow-y-auto py-3", collapsed ? "px-2" : "px-3")}>
        <div className="space-y-0.5">
          {MAIN.map((i) => <Item key={i.href} item={i} />)}
        </div>
      </nav>

      {/* Account */}
      <div className={cn("shrink-0 border-t border-white/10", collapsed ? "p-2" : "p-3")}>
        <Link href="/admin/settings"
          className={cn("flex items-center gap-2.5 rounded-lg bg-white/6 hover:bg-white/10 transition-colors",
            collapsed ? "justify-center p-2" : "p-2.5")}>
          <span className="w-8 h-8 rounded-full bg-[#C6A667] text-[#123D2B] text-[12px] font-bold flex items-center justify-center shrink-0"
            style={{ fontFamily: "var(--font-body)" }}>
            A
          </span>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-medium text-white leading-tight truncate"
                style={{ fontFamily: "var(--font-body)" }}>Admin</p>
              <p className="text-[10.5px] text-white/45 leading-tight truncate"
                style={{ fontFamily: "var(--font-body)" }}>Wendy Herbals</p>
            </div>
          )}
          {!collapsed && <ChevronRight size={14} className="text-white/35 shrink-0" />}
        </Link>
      </div>
    </aside>
  );
}
