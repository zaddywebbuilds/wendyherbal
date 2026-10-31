import { connection } from "next/server";
import { Mail, Download, ShieldCheck } from "lucide-react";
import { Stat } from "@/components/admin/Stat";
import { loadSubscribers, newsletterStorageIsDurable } from "@/lib/newsletter-store";

export const metadata = { title: "Newsletter" };
export const instant = false;

export default async function NewsletterPage() {
  await connection();
  const { subscribers } = await loadSubscribers();
  const durable = newsletterStorageIsDurable();

  const thisMonth = new Date().toISOString().slice(0, 7);
  const newThisMonth = subscribers.filter((s) => s.consentedAt.startsWith(thisMonth)).length;

  return (
    <div className="p-5 lg:p-7 max-w-[1700px]">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
            style={{ fontFamily: "var(--font-heading)" }}>
            Newsletter
          </h1>
          <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
            People who asked to hear about new products.
          </p>
        </div>

        {subscribers.length > 0 && (
          <a href="/api/admin/newsletter/export"
            className="inline-flex items-center gap-2 h-10 px-4 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] font-medium text-[#252B23] hover:border-[#175C3D] transition-colors"
            style={{ fontFamily: "var(--font-body)" }}>
            <Download size={14} /> Export CSV
          </a>
        )}
      </div>

      {!durable && (
        <div className="mb-5 rounded-xl border-l-[3px] border-[#92400E] bg-[#FEF3C7] p-4 text-[12.5px] leading-relaxed text-[#92400E]"
          style={{ fontFamily: "var(--font-body)" }}>
          <p className="font-semibold">Sign-ups are not being saved</p>
          <p>
            This deployment has nowhere durable to keep them, so the form tells people to message
            on WhatsApp instead of pretending they are on a list. Add a KV store in Vercel.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Stat label="On the list" value={String(subscribers.length)} icon={Mail}
          tint="#E8F0EA" color="#175C3D" hint="Each one asked to be here" />
        <Stat label="Joined this month" value={String(newThisMonth)} icon={ShieldCheck}
          tint="#E7EEF6" color="#2563EB" />
      </div>

      <section className="bg-white rounded-xl border border-[#E9E4D6] p-4">
        {subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center px-6">
            <Mail size={30} className="text-[#A8B99C] mb-2.5" strokeWidth={1.4} />
            <p className="text-[13.5px] font-medium text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>
              Nobody has signed up yet
            </p>
            <p className="text-[12px] text-[#A8B99C] mt-1 max-w-md leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}>
              Addresses from the form at the bottom of the homepage appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ fontFamily: "var(--font-body)" }}>
              <thead>
                <tr className="text-[10.5px] uppercase tracking-wider text-[#A8B99C] border-b border-[#EFE9DD]">
                  <th className="pb-2.5 font-semibold">Email</th>
                  <th className="pb-2.5 font-semibold">Agreed on</th>
                  <th className="pb-2.5 font-semibold">From</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.email} className="border-b border-[#F4F0E4] last:border-0 text-[12.5px]">
                    <td className="py-2.5">
                      <a href={`mailto:${s.email}`} className="text-[#175C3D] hover:underline">{s.email}</a>
                    </td>
                    <td className="py-2.5 text-[#6b7265]">{s.consentedAt.slice(0, 10)}</td>
                    <td className="py-2.5 text-[#6b7265]">{s.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-[11px] text-[#A8B99C] leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
          Everyone here ticked the box asking for updates. Customers who only placed an order did
          not, and are on the Customers page instead. Do not mix the two.
        </p>
      </section>
    </div>
  );
}
