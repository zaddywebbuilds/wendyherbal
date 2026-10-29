import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { ORDERS } from "@/lib/admin-data";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Live counts only — a zero count renders no badge.
  const badges = {
    orders: ORDERS.filter((o) => o.status === "pending").length,
    messages: 0,
    contact: 0,
  };
  const notifications = badges.orders + badges.messages + badges.contact;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F4E9]">
      <AdminSidebar badges={badges} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar notifications={notifications} />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
