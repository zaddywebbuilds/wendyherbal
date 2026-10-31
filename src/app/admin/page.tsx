import Link from "next/link";
import { connection } from "next/server";
import {
  ShoppingCart, ClipboardList, Users, Boxes, ArrowUpRight, Plus,
  LayoutGrid, Settings, PackageX, Inbox,
} from "lucide-react";
import { TrendChart, StatusDonut, CategoryBars } from "@/components/admin/Charts";
import { getDashboardData, percentChange } from "@/lib/dashboard-data";
import { FORMAT_NGN } from "@/lib/constants";
import { CATEGORY_LABELS } from "@/lib/products";

// Private dashboard: render per request against live figures rather than prerender.
export const instant = false;

export default async function AdminDashboard() {
  await connection();
  const now = new Date();
  const data = await getDashboardData(now);
  const {
    topSelling, recent: recentOrders, byCategory: salesByCategory,
    series: salesSeries, lowStock, itemsReadable,
  } = data;

  // The donut takes a plain record; buckets with no orders are already gone.
  const statusCounts = Object.fromEntries(data.statusCounts.map((s) => [s.label, s.count]));

  const KPIS = [
    {
      label: "Order value", value: FORMAT_NGN(data.recordedValue),
      icon: ShoppingCart, tint: "#E8F0EA", color: "#175C3D",
      delta: percentChange(data.valueThisMonth, data.valueLastMonth),
    },
    {
      label: "Total Orders", value: String(data.orderCount),
      icon: ClipboardList, tint: "#E7EEF6", color: "#2563EB",
      delta: percentChange(data.ordersThisMonth, data.ordersLastMonth),
    },
    {
      label: "Total Customers", value: String(data.customerCount),
      icon: Users, tint: "#F1EAF8", color: "#7C3AED", delta: null,
    },
    {
      label: "Products in Stock", value: String(data.productsInStock),
      icon: Boxes, tint: "#FBF0DE", color: "#B5713A", lowStock: lowStock.length,
    },
  ];

  // Every one of these goes somewhere. Add Category, Upload Images, View
  // Reports and Edit Homepage were removed: none of those screens exists.
  // Photographs are uploaded from the product form itself now.
  const QUICK = [
    { label: "Add Product", href: "/admin/products/new", icon: Plus, tint: "#E8F0EA", color: "#175C3D" },
    { label: "Manage Orders", href: "/admin/orders", icon: ShoppingCart, tint: "#FBF0DE", color: "#B5713A" },
    { label: "Edit Products", href: "/admin/products", icon: LayoutGrid, tint: "#E7EEF6", color: "#2563EB" },
    { label: "Inventory", href: "/admin/inventory", icon: Boxes, tint: "#F1EAF8", color: "#7C3AED" },
    { label: "Customers", href: "/admin/customers", icon: Users, tint: "#E8F0EA", color: "#175C3D" },
    { label: "Settings", href: "/admin/settings", icon: Settings, tint: "#FBE9E7", color: "#C06014" },
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

      {!data.configured && (
        <div className="mb-5 rounded-xl border-l-[3px] border-[#92400E] bg-[#FEF3C7] p-4 text-[12.5px] leading-relaxed text-[#92400E]"
          style={{ fontFamily: "var(--font-body)" }}>
          <p className="font-semibold">The order book is not connected yet</p>
          <p>
            Connect your Google account in Settings. Until then checkout still works and every
            order reaches you on WhatsApp, but these figures have nothing to read.
          </p>
        </div>
      )}
      {data.error && (
        <div className="mb-5 rounded-xl border-l-[3px] border-[#991B1B] bg-[#FEE2E2] p-4 text-[12.5px] leading-relaxed text-[#991B1B]"
          style={{ fontFamily: "var(--font-body)" }}>
          {data.error}
        </div>
      )}

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
                ) : typeof k.delta === "number" && k.delta !== 0 ? (
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
            {FORMAT_NGN(data.valueThisMonth)}
          </p>
          <p className="text-[11.5px] text-[#6b7265] mt-1 mb-4" style={{ fontFamily: "var(--font-body)" }}>
            {now.toLocaleDateString("en-NG", { month: "long", year: "numeric" })} &middot; excludes cancelled and refunded
          </p>
          <TrendChart series={salesSeries} />
          <div className="flex justify-between mt-2 pl-12 text-[9px] text-[#A8B99C]"
            style={{ fontFamily: "var(--font-body)" }}>
            {[1, 5, 10, 15, 20, 25, salesSeries.length].map((d) => <span key={d}>{d}</span>)}
          </div>
        </Card>

        {/* Top selling */}
        <Card title="Top Selling Products" action={{ label: "View all", href: "/admin/products" }}>
          {!itemsReadable ? (
            <Empty icon={PackageX} text="No sales recorded yet"
              sub="Top sellers are worked out from the items column of each order." />
          ) : topSelling.length === 0 ? (
            <Empty icon={PackageX} text="Nothing to rank yet" sub="No order items matched the catalogue." />
          ) : (
            <ol className="space-y-2.5">
              {topSelling.map((p, i) => (
                <li key={p.name} className="flex items-center gap-2.5">
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
                    style={{ fontFamily: "var(--font-body)" }}>
                    {p.revenue > 0 ? FORMAT_NGN(p.revenue) : "On enquiry"}
                  </span>
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
                    <tr key={o.row} className="border-b border-[#F4F0E4] last:border-0 text-[12.5px]">
                      <td className="py-2.5">
                        <Link href="/admin/orders" className="font-medium text-[#175C3D] hover:underline">
                          {o.orderNumber}
                        </Link>
                      </td>
                      <td className="py-2.5 text-[#252B23]">{o.name}</td>
                      <td className="py-2.5 text-[#6b7265] max-w-[18ch]">
                        <span className="line-clamp-1">{o.items || "Not recorded"}</span>
                      </td>
                      <td className="py-2.5 font-semibold text-[#123D2B] tabular-nums">{FORMAT_NGN(o.total)}</td>
                      <td className="py-2.5"><StatusPill status={o.status || "no status"} /></td>
                      <td className="py-2.5 text-[#6b7265] whitespace-nowrap">{o.date}</td>
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
