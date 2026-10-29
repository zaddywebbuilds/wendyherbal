import Link from "next/link";
import { connection } from "next/server";
import {
  ShoppingCart, ClipboardList, Users, Boxes, ArrowUpRight, Plus,
  LayoutGrid, ImagePlus, BarChart3, PenLine, PackageX, Inbox,
} from "lucide-react";
import { TrendChart, StatusDonut, CategoryBars } from "@/components/admin/Charts";
import {
  getDashboardStats, getOrderStatusCounts, getTopSelling, getRecentOrders,
  getSalesByCategory, getSalesSeries, getLowStockProducts,
} from "@/lib/admin-data";
import { FORMAT_NGN } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/products";

// Private dashboard: render per request against live figures rather than prerender.
export const instant = false;

export default async function AdminDashboard() {
  await connection();
  const now = new Date();
  const stats = getDashboardStats();
  const statusCounts = getOrderStatusCounts();
  const topSelling = getTopSelling();
  const recentOrders = getRecentOrders();
  const salesByCategory = getSalesByCategory();
  const salesSeries = getSalesSeries(now.getFullYear(), now.getMonth());
  const lowStock = getLowStockProducts();

  const KPIS = [
    { label: "Total Sales", value: FORMAT_NGN(stats.total_sales), icon: ShoppingCart, tint: "#E8F0EA", color: "#175C3D", delta: stats.sales_vs_last_month },
    { label: "Total Orders", value: String(stats.total_orders), icon: ClipboardList, tint: "#E7EEF6", color: "#2563EB", delta: stats.orders_vs_last_month },
    { label: "Total Customers", value: String(stats.total_customers), icon: Users, tint: "#F1EAF8", color: "#7C3AED", delta: stats.customers_vs_last_month },
    { label: "Products in Stock", value: String(stats.products_in_stock), icon: Boxes, tint: "#FBF0DE", color: "#B5713A", lowStock: stats.low_stock_count },
  ];

  const QUICK = [
    { label: "Add Product", href: "/admin/products/new", icon: Plus, tint: "#E8F0EA", color: "#175C3D" },
    { label: "Manage Orders", href: "/admin/orders", icon: ShoppingCart, tint: "#FBF0DE", color: "#B5713A" },
    { label: "Add Category", href: "/admin/categories", icon: LayoutGrid, tint: "#E7EEF6", color: "#2563EB" },
    { label: "Upload Images", href: "/admin/products/images", icon: ImagePlus, tint: "#F1EAF8", color: "#7C3AED" },
    { label: "View Reports", href: "/admin/reports", icon: BarChart3, tint: "#E8F0EA", color: "#175C3D" },
    { label: "Edit Homepage", href: "/admin/content", icon: PenLine, tint: "#FBE9E7", color: "#C06014" },
  ];

  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-[1.75rem] lg:text-[2.1rem] text-[#123D2B] font-medium flex items-center gap-2"
          style={{ fontFamily: "var(--font-heading)" }}>
          Welcome back, Admin!
          <svg width="22" height="24" viewBox="0 0 32 36" fill="none">
            <path d="M16 6C16 6 6 13 6 24C6 30.6 10.5 36 16 36C21.5 36 26 30.6 26 24C26 13 16 6 16 6Z" fill="#C6A667" />
            <line x1="16" y1="8" x2="16" y2="35" stroke="#123D2B" strokeWidth="1.2" />
          </svg>
        </h1>
        <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
          Here&rsquo;s what&rsquo;s happening with Wendy Herbals today.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {KPIS.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-white rounded-xl border border-[#E9E4D6] p-4 flex items-center gap-3.5">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: k.tint }}>
                <Icon size={19} style={{ color: k.color }} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>{k.label}</p>
                <p className="text-[1.45rem] font-bold text-[#123D2B] leading-tight tabular-nums truncate"
                  style={{ fontFamily: "var(--font-body)" }}>{k.value}</p>

                {typeof k.lowStock === "number" ? (
                  k.lowStock > 0 ? (
                    <p className="text-[11px] text-[#B5713A] flex items-center gap-1 mt-0.5"
                      style={{ fontFamily: "var(--font-body)" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" /> Low stock: {k.lowStock}
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                      All stock healthy
                    </p>
                  )
                ) : k.delta !== 0 ? (
                  <p className="text-[11px] flex items-center gap-0.5 mt-0.5 text-[#175C3D]"
                    style={{ fontFamily: "var(--font-body)" }}>
                    <ArrowUpRight size={12} /> {k.delta > 0 ? "+" : ""}{k.delta}% vs last month
                  </p>
                ) : (
                  <p className="text-[11px] text-[#A8B99C] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
                    No prior period to compare
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales / top selling / status */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr_0.9fr] gap-4 mb-5">
        {/* Sales overview */}
        <Card title="Sales Overview">
          <p className="text-[1.4rem] font-bold text-[#123D2B] tabular-nums leading-none"
            style={{ fontFamily: "var(--font-body)" }}>
            {FORMAT_NGN(stats.total_sales)}
          </p>
          <p className="text-[11.5px] text-[#6b7265] mt-1 mb-4" style={{ fontFamily: "var(--font-body)" }}>
            {now.toLocaleDateString("en-NG", { month: "long", year: "numeric" })} &middot; paid orders only
          </p>
          <TrendChart series={salesSeries} />
          <div className="flex justify-between mt-2 pl-12 text-[9px] text-[#A8B99C]"
            style={{ fontFamily: "var(--font-body)" }}>
            {[1, 5, 10, 15, 20, 25, salesSeries.length].map((d) => <span key={d}>{d}</span>)}
          </div>
        </Card>

        {/* Top selling */}
        <Card title="Top Selling Products" action={{ label: "View all", href: "/admin/products" }}>
          {topSelling.length === 0 ? (
            <Empty icon={PackageX} text="No sales recorded yet" sub="Top sellers appear once orders are paid." />
          ) : (
            <ol className="space-y-2.5">
              {topSelling.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2.5">
                  <span className="w-5 text-[12px] font-semibold text-[#A8B99C] tabular-nums shrink-0"
                    style={{ fontFamily: "var(--font-body)" }}>{i + 1}</span>
                  <span className="w-9 h-9 rounded-md bg-[#EFE9DD] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-[#252B23] truncate"
                      style={{ fontFamily: "var(--font-body)" }}>{p.name}</p>
                    <p className="text-[11px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>
                      {p.units} sold
                    </p>
                  </div>
                  <span className="text-[12.5px] font-semibold text-[#123D2B] tabular-nums shrink-0"
                    style={{ fontFamily: "var(--font-body)" }}>{FORMAT_NGN(p.revenue)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* Order status */}
        <Card title="Order Status" action={{ label: "View all", href: "/admin/orders" }}>
          <StatusDonut counts={statusCounts} />
        </Card>
      </div>

      {/* Recent orders / low stock */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-4 mb-5">
        <Card title="Recent Orders" action={{ label: "View all", href: "/admin/orders" }}>
          {recentOrders.length === 0 ? (
            <Empty icon={Inbox} text="No orders yet"
              sub="Orders placed through the store or WhatsApp will appear here." />
          ) : (
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-wider text-[#A8B99C] border-b border-[#EFE9DD]">
                    <th className="pb-2 font-semibold">Order #</th>
                    <th className="pb-2 font-semibold">Customer</th>
                    <th className="pb-2 font-semibold">Items</th>
                    <th className="pb-2 font-semibold">Amount</th>
                    <th className="pb-2 font-semibold">Status</th>
                    <th className="pb-2 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-[#F4F0E4] last:border-0 text-[12.5px]">
                      <td className="py-2.5">
                        <Link href={`/admin/orders/${o.id}`} className="font-medium text-[#175C3D] hover:underline">
                          {o.order_number}
                        </Link>
                      </td>
                      <td className="py-2.5 text-[#252B23]">{o.customer_name}</td>
                      <td className="py-2.5 text-[#6b7265]">{o.items.length}</td>
                      <td className="py-2.5 font-semibold text-[#123D2B] tabular-nums">{FORMAT_NGN(o.total)}</td>
                      <td className="py-2.5"><StatusPill status={o.status} /></td>
                      <td className="py-2.5 text-[#6b7265] whitespace-nowrap">
                        {new Date(o.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Low Stock Products" action={{ label: "View all", href: "/admin/inventory" }}>
          {lowStock.length === 0 ? (
            <Empty icon={Boxes} text="All stock healthy" sub="Nothing is below the reorder threshold." />
          ) : (
            <ul className="space-y-2.5">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-md bg-[#EFE9DD] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-medium text-[#252B23] truncate"
                      style={{ fontFamily: "var(--font-body)" }}>{p.name}</p>
                    <p className="text-[10.5px] text-[#A8B99C]" style={{ fontFamily: "var(--font-body)" }}>
                      {CATEGORY_LABELS[p.category]}
                    </p>
                  </div>
                  <span className="text-[13px] font-bold text-[#C06014] tabular-nums shrink-0"
                    style={{ fontFamily: "var(--font-body)" }}>{p.stock_count}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FBF0DE] text-[#B5713A] text-[10px] font-semibold shrink-0"
                    style={{ fontFamily: "var(--font-body)" }}>Low</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Category sales / quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-4">
        <Card title="Sales by Category">
          <CategoryBars data={salesByCategory} />
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {QUICK.map((q) => {
              const Icon = q.icon;
              return (
                <Link key={q.href} href={q.href}
                  className="flex flex-col items-center gap-2 p-3.5 rounded-lg border border-[#EFE9DD] hover:border-[#C6A667] hover:bg-[#FCFAF3] transition-colors text-center">
                  <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: q.tint }}>
                    <Icon size={16} style={{ color: q.color }} strokeWidth={1.8} />
                  </span>
                  <span className="text-[11.5px] font-medium text-[#252B23] leading-tight"
                    style={{ fontFamily: "var(--font-body)" }}>{q.label}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function Card({ title, action, children }: {
  title: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[14px] font-semibold text-[#123D2B]" style={{ fontFamily: "var(--font-body)" }}>
          {title}
        </h2>
        {action && (
          <Link href={action.href} className="text-[11.5px] text-[#175C3D] hover:underline shrink-0"
            style={{ fontFamily: "var(--font-body)" }}>
            {action.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function Empty({ icon: Icon, text, sub }: { icon: typeof PackageX; text: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-9 text-center">
      <Icon size={26} className="text-[#A8B99C] mb-2" strokeWidth={1.4} />
      <p className="text-[12.5px] font-medium text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>{text}</p>
      <p className="text-[11px] text-[#A8B99C] mt-0.5 max-w-[210px]" style={{ fontFamily: "var(--font-body)" }}>{sub}</p>
    </div>
  );
}

const PILL: Record<string, string> = {
  pending: "bg-[#FEF3C7] text-[#92400E]",
  confirmed: "bg-[#DBEAFE] text-[#1E40AF]",
  processing: "bg-[#EDE9FE] text-[#5B21B6]",
  dispatched: "bg-[#E0E7FF] text-[#3730A3]",
  delivered: "bg-[#D1FAE5] text-[#065F46]",
  cancelled: "bg-[#FEE2E2] text-[#991B1B]",
  refunded: "bg-[#F3F4F6] text-[#374151]",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold capitalize ${PILL[status] ?? PILL.refunded}`}
      style={{ fontFamily: "var(--font-body)" }}>
      {status}
    </span>
  );
}
