import { connection } from "next/server";
import {
  Receipt, Download, MessageCircle, Phone, MapPin, Wallet, ExternalLink, Clock,
} from "lucide-react";
import { isSheetsReady, listOrders, activeSpreadsheetUrl, type SheetOrderRow } from "@/lib/sheets";
import { FORMAT_NGN } from "@/lib/constants";
import { Stat } from "@/components/admin/Stat";

export const instant = false;

/** 0803… → 234803…, so wa.me opens the right chat. */
const waLink = (phone: string) =>
  `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "234")}`;

/**
 * Status is a free-text column the owner edits in the spreadsheet, so it is
 * matched loosely and anything unrecognised is shown exactly as she typed it
 * rather than being forced into a bucket it may not belong in.
 */
function statusTone(status: string): { bg: string; fg: string } {
  const s = status.toLowerCase();
  if (!s) return { bg: "#F3F4F6", fg: "#6B7280" };
  if (s.includes("await") || s.includes("pending")) return { bg: "#FEF3C7", fg: "#92400E" };
  if (s.includes("paid") || s.includes("confirm")) return { bg: "#DBEAFE", fg: "#1E40AF" };
  if (s.includes("pack") || s.includes("process")) return { bg: "#EDE9FE", fg: "#5B21B6" };
  if (s.includes("dispatch") || s.includes("sent") || s.includes("ship")) return { bg: "#E0E7FF", fg: "#3730A3" };
  if (s.includes("deliver") || s.includes("complete")) return { bg: "#D1FAE5", fg: "#065F46" };
  if (s.includes("cancel") || s.includes("refund")) return { bg: "#FEE2E2", fg: "#991B1B" };
  return { bg: "#F3F4F6", fg: "#6B7280" };
}

const awaiting = (o: SheetOrderRow) => {
  const s = o.status.toLowerCase();
  return !s || s.includes("await") || s.includes("pending");
};

export default async function OrdersPage() {
  await connection();

  const configured = await isSheetsReady();
  const sheetUrl = await activeSpreadsheetUrl();
  let orders: SheetOrderRow[] = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      orders = await listOrders();
    } catch (err) {
      console.error("Failed to load orders:", err);
      loadError = "Could not read the order sheet. Try reconnecting from Settings.";
    }
  }

  const unpaid = orders.filter(awaiting);
  // Only what is actually written in the sheet. It is not revenue until the
  // transfer has been checked, so the label says "recorded".
  const recorded = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Orders
          </h1>
          <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            Every order placed on the website, newest first.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {sheetUrl && (
            <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 bg-[#123D2B] text-white rounded-lg text-[12.5px] font-medium hover:bg-[#175C3D] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              <ExternalLink size={14} /> Open Google Sheet
            </a>
          )}
          {orders.length > 0 && (
            <a href="/api/admin/orders/export"
              className="inline-flex items-center gap-2 h-10 px-4 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] font-medium text-[#252B23] hover:border-[#175C3D] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              <Download size={14} /> Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Stat label="Total orders" value={String(orders.length)} icon={Receipt} tint="#E8F0EA" color="#175C3D" />
        <Stat label="Awaiting payment" value={String(unpaid.length)} icon={Clock} tint="#FEF3C7" color="#92400E" />
        <Stat label="Value recorded" value={FORMAT_NGN(recorded)} icon={Wallet} tint="#FBF0DE" color="#B5713A" />
      </div>

      <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
        {!configured ? (
          <Empty
            title="The order book is not connected yet"
            body="Go to Settings and connect your Google account. Until then checkout still works and every order reaches you on WhatsApp, but nothing is saved here."
          />
        ) : loadError ? (
          <Empty title="Could not read the sheet" body={loadError} />
        ) : orders.length === 0 ? (
          <Empty
            title="No orders yet"
            body="When someone checks out, the order is written to your Google Sheet and appears here straight away."
          />
        ) : (
          <>
            {/* Table on a laptop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
                <thead>
                  <tr className="text-[10.5px] uppercase tracking-wider text-[#A8B99C] border-b border-[#EFE9DD]">
                    <th className="pb-2.5 font-semibold">Order</th>
                    <th className="pb-2.5 font-semibold">Customer</th>
                    <th className="pb-2.5 font-semibold">Items</th>
                    <th className="pb-2.5 font-semibold">Deliver to</th>
                    <th className="pb-2.5 font-semibold text-right">Total</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold text-right">Reach out</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const tone = statusTone(o.status);
                    return (
                      <tr key={o.row} className="border-b border-[#F4F0E4] last:border-0 text-[12.5px] align-top">
                        <td className="py-3">
                          <p className="font-semibold text-[#252B23]">{o.orderNumber}</p>
                          {o.date && <p className="text-[11px] text-[#A8B99C]">{o.date}</p>}
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-[#252B23]">{o.name}</p>
                          <a href={`tel:${o.phone}`} className="flex items-center gap-1.5 text-[#175C3D] hover:underline">
                            <Phone size={12} /> {o.phone}
                          </a>
                        </td>
                        <td className="py-3 text-[#6b7265] max-w-[22ch]">
                          <span className="line-clamp-3">{o.items || "Not recorded"}</span>
                        </td>
                        <td className="py-3 text-[#6b7265] max-w-[22ch]">
                          <span className="line-clamp-3">{o.deliverTo || "Not recorded"}</span>
                          {o.notes && (
                            <span className="block mt-1 text-[11px] text-[#A8B99C] line-clamp-2">
                              Note: {o.notes}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-right tabular-nums font-semibold text-[#123D2B] whitespace-nowrap">
                          {o.total > 0 ? FORMAT_NGN(o.total) : "Not recorded"}
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold whitespace-nowrap"
                            style={{ background: tone.bg, color: tone.fg }}>
                            {o.status || "No status"}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <a href={waLink(o.phone)} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E8F0EA] text-[#175C3D] text-[11.5px] font-medium hover:bg-[#d8e6dd] transition-colors">
                            <MessageCircle size={12} /> WhatsApp
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cards on a phone, where a seven column table is unreadable */}
            <ul className="md:hidden space-y-3">
              {orders.map((o) => {
                const tone = statusTone(o.status);
                return (
                  <li key={o.row} className="rounded-lg border border-[#EFE9DD] p-3.5"
                    style={{ fontFamily: "var(--font-body)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[#252B23]">{o.orderNumber}</p>
                        {o.date && <p className="text-[11px] text-[#A8B99C]">{o.date}</p>}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold shrink-0"
                        style={{ background: tone.bg, color: tone.fg }}>
                        {o.status || "No status"}
                      </span>
                    </div>

                    <p className="mt-2.5 text-[13px] font-medium text-[#252B23]">{o.name}</p>
                    {o.items && <p className="mt-1 text-[12px] text-[#6b7265]">{o.items}</p>}

                    {o.deliverTo && (
                      <p className="mt-1.5 flex gap-1.5 text-[12px] text-[#6b7265]">
                        <MapPin size={12} className="mt-0.5 shrink-0" /> {o.deliverTo}
                      </p>
                    )}
                    {o.notes && <p className="mt-1 text-[11.5px] text-[#A8B99C]">Note: {o.notes}</p>}

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <span className="text-[14px] font-semibold text-[#123D2B] tabular-nums">
                        {o.total > 0 ? FORMAT_NGN(o.total) : "Not recorded"}
                      </span>
                      <a href={waLink(o.phone)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#E8F0EA] text-[#175C3D] text-[12px] font-medium">
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>

            <p className="mt-4 text-[11px] text-[#A8B99C] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Status is the column you edit in the Google Sheet. Change it there and it changes
              here. This page only reads; it never writes to your sheet.
            </p>
          </>
        )}
      </section>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <Receipt size={30} className="text-[#A8B99C] mb-2.5" strokeWidth={1.4} />
      <p className="text-[13.5px] font-medium text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>{title}</p>
      <p className="text-[12px] text-[#A8B99C] mt-1 max-w-md leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{body}</p>
    </div>
  );
}
