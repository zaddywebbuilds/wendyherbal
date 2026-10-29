import { connection } from "next/server";
import { Users, Download, MessageCircle, Phone, Mail, Wallet, ExternalLink } from "lucide-react";
import { isSheetsReady, listCustomers, activeSpreadsheetUrl, type SheetCustomer } from "@/lib/sheets";
import { FORMAT_NGN } from "@/lib/constants";

export const instant = false;

/** 0803… → 234803…, so wa.me opens the right chat. */
const waLink = (phone: string) =>
  `https://wa.me/${phone.replace(/\D/g, "").replace(/^0/, "234")}`;

export default async function CustomersPage() {
  await connection();

  const configured = await isSheetsReady();
  const sheetUrl = await activeSpreadsheetUrl();
  let customers: SheetCustomer[] = [];
  let loadError: string | null = null;

  if (configured) {
    try {
      customers = await listCustomers();
    } catch (err) {
      console.error("Failed to load customers:", err);
      loadError = "Could not read the order sheet. Try reconnecting from Settings.";
    }
  }

  const consented = customers.filter((c) => c.consent);
  const lifetime = customers.reduce((s, c) => s + c.spent, 0);

  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Customers
          </h1>
          <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            Everyone who has placed an order, so you can follow up.
          </p>
        </div>

        <div className="flex gap-2.5">
          {sheetUrl && (
            <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-4 bg-[#123D2B] text-white rounded-lg text-[12.5px] font-medium hover:bg-[#175C3D] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              <ExternalLink size={14} /> Open Google Sheet
            </a>
          )}
          {customers.length > 0 && (
            <a href="/api/admin/customers/export"
              className="inline-flex items-center gap-2 h-10 px-4 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] font-medium text-[#252B23] hover:border-[#175C3D] transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              <Download size={14} /> Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Stat label="Total customers" value={String(customers.length)} icon={Users} tint="#E8F0EA" color="#175C3D" />
        <Stat label="Opted in to updates" value={String(consented.length)} icon={MessageCircle} tint="#E7EEF6" color="#2563EB" />
        <Stat label="Lifetime value" value={FORMAT_NGN(lifetime)} icon={Wallet} tint="#FBF0DE" color="#B5713A" />
      </div>

      <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
        {!configured ? (
          <Empty
            title="The order book is not connected yet"
            body="Go to Settings and connect your Google account. Until then checkout still works and every order arrives on WhatsApp, but buyer details are not saved here."
          />
        ) : loadError ? (
          <Empty title="Could not read the sheet" body={loadError} />
        ) : customers.length === 0 ? (
          <Empty
            title="No customers yet"
            body="As soon as someone checks out, their name, phone number and delivery details are written to the Google Sheet and appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wider text-[#A8B99C] border-b border-[#EFE9DD]">
                  <th className="pb-2.5 font-semibold">Customer</th>
                  <th className="pb-2.5 font-semibold">Contact</th>
                  <th className="pb-2.5 font-semibold">Location</th>
                  <th className="pb-2.5 font-semibold text-right">Orders</th>
                  <th className="pb-2.5 font-semibold text-right">Spent</th>
                  <th className="pb-2.5 font-semibold">Updates</th>
                  <th className="pb-2.5 font-semibold text-right">Reach out</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.phone} className="border-b border-[#F4F0E4] last:border-0 text-[12.5px]">
                    <td className="py-3">
                      <p className="font-medium text-[#252B23]">{c.name}</p>
                      {c.firstOrder && (
                        <p className="text-[11px] text-[#A8B99C]">First order {c.firstOrder}</p>
                      )}
                    </td>
                    <td className="py-3">
                      <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-[#175C3D] hover:underline">
                        <Phone size={12} /> {c.phone}
                      </a>
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-[#6b7265] hover:underline mt-0.5">
                          <Mail size={12} /> {c.email}
                        </a>
                      )}
                    </td>
                    <td className="py-3 text-[#6b7265]">
                      {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="py-3 text-right tabular-nums text-[#252B23]">{c.orders}</td>
                    <td className="py-3 text-right tabular-nums font-semibold text-[#123D2B]">
                      {FORMAT_NGN(c.spent)}
                    </td>
                    <td className="py-3">
                      {c.consent ? (
                        <span className="px-2 py-0.5 rounded-full bg-[#D1FAE5] text-[#065F46] text-[10.5px] font-semibold">
                          Opted in
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] text-[10.5px] font-semibold">
                          Orders only
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <a href={waLink(c.phone)} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#E8F0EA] text-[#175C3D] text-[11.5px] font-medium hover:bg-[#d8e6dd] transition-colors">
                        <MessageCircle size={12} /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mt-4 text-[11px] text-[#A8B99C] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              Only message customers marked &ldquo;Opted in&rdquo; about products and offers.
              The rest gave their details to complete an order, which is not consent to marketing.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tint, color }: {
  label: string; value: string; icon: typeof Users; tint: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#E9E4D6] p-4 flex items-center gap-3.5">
      <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: tint }}>
        <Icon size={19} style={{ color }} strokeWidth={1.8} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] text-[#6b7265]" style={{ fontFamily: "var(--font-body)" }}>{label}</p>
        <p className="text-[1.35rem] font-bold text-[#123D2B] leading-tight tabular-nums truncate"
          style={{ fontFamily: "var(--font-body)" }}>{value}</p>
      </div>
    </div>
  );
}

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center px-6">
      <Users size={30} className="text-[#A8B99C] mb-2.5" strokeWidth={1.4} />
      <p className="text-[13.5px] font-medium text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>{title}</p>
      <p className="text-[12px] text-[#A8B99C] mt-1 max-w-md leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>{body}</p>
    </div>
  );
}
