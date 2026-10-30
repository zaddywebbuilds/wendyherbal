import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/Sidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * The sidebar badge is deliberately not wired to the order sheet.
 *
 * This layout wraps every admin route including the login screen, so reading
 * the sheet here would mean a Google API call on each admin page load, one of
 * them unauthenticated, and it stops /admin/login from prerendering. The
 * awaiting-payment count lives on the Orders page, which reads the sheet once
 * for that purpose. A zero here renders no badge rather than a false one.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const badges = { orders: 0, messages: 0, contact: 0 };
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
