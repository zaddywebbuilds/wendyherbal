import { connection } from "next/server";
import {
  CheckCircle2, AlertCircle, ExternalLink, Table2, ShieldCheck, Landmark, Info,
} from "lucide-react";
import { loadConnection } from "@/lib/token-store";
import { storageKind, storageIsDurable } from "@/lib/token-store";
import { isOAuthConfigured } from "@/lib/google-oauth";
import { isServiceAccountConfigured } from "@/lib/sheets";
import { BANK_DETAILS, WHATSAPP_NUMBER } from "@/lib/constants";

export const instant = false;

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string; disconnected?: string }>;
}) {
  await connection();
  const params = await searchParams;

  const conn = await loadConnection();
  const oauthReady = isOAuthConfigured();
  const serviceAccount = isServiceAccountConfigured();
  const durable = storageIsDurable();
  const kind = storageKind();

  return (
    <div className="p-5 lg:p-7 max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-[1.75rem] text-[#123D2B] font-medium"
          style={{ fontFamily: "var(--font-heading)" }}>
          Settings
        </h1>
        <p className="text-[13px] text-[#6b7265] mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
          Where your orders are saved, and how customers pay you.
        </p>
      </div>

      {/* Flash messages */}
      {params.connected && (
        <Banner tone="ok" icon={CheckCircle2}
          title="Google account connected"
          body={`Your order book has been created${params.connected !== "1" ? ` in ${params.connected}` : ""}. New orders will appear in it straight away.`} />
      )}
      {params.disconnected && (
        <Banner tone="info" icon={Info}
          title="Google account disconnected"
          body="New orders will not be saved until you connect again. Your spreadsheet is untouched and still in your Google Drive." />
      )}
      {params.error && (
        <Banner tone="warn" icon={AlertCircle} title="Could not connect" body={params.error} />
      )}

      {/* ---------------- order book ---------------- */}
      <section className="bg-white rounded-xl border border-[#E9E4D6] p-5 mb-4">
        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 rounded-xl bg-[#E8F0EA] flex items-center justify-center shrink-0">
            <Table2 size={20} className="text-[#175C3D]" strokeWidth={1.8} />
          </span>

          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-[#123D2B]"
              style={{ fontFamily: "var(--font-body)" }}>
              Your order book
            </h2>
            <p className="text-[12.5px] text-[#6b7265] mt-0.5 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}>
              Every order and customer is saved to a Google Sheet in your own Google Drive,
              so you can open it on your phone and call or message buyers any time.
            </p>

            {conn ? (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-[12.5px] text-[#175C3D] font-medium"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <CheckCircle2 size={15} />
                  Connected{conn.connectedEmail ? ` as ${conn.connectedEmail}` : ""}
                </div>

                <div className="flex flex-wrap gap-2.5 mt-3.5">
                  <a href={conn.spreadsheetUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 bg-[#123D2B] text-white rounded-lg text-[12.5px] font-medium hover:bg-[#175C3D] transition-colors"
                    style={{ fontFamily: "var(--font-body)" }}>
                    <ExternalLink size={14} /> Open my order book
                  </a>

                  <form action="/api/google/disconnect" method="post">
                    <button type="submit"
                      className="h-10 px-4 bg-white border border-[#E9E4D6] rounded-lg text-[12.5px] font-medium text-[#6b7265] hover:border-[#C06014] hover:text-[#C06014] transition-colors"
                      style={{ fontFamily: "var(--font-body)" }}>
                      Disconnect
                    </button>
                  </form>
                </div>

                <p className="mt-3 text-[11px] text-[#A8B99C]" style={{ fontFamily: "var(--font-body)" }}>
                  Connected {new Date(conn.connectedAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              </div>
            ) : serviceAccount ? (
              <div className="mt-4 flex items-center gap-2 text-[12.5px] text-[#175C3D] font-medium"
                style={{ fontFamily: "var(--font-body)" }}>
                <CheckCircle2 size={15} />
                Using a shared spreadsheet set up by your developer.
              </div>
            ) : oauthReady ? (
              <div className="mt-4">
                <a href="/api/google/connect"
                  className="inline-flex items-center gap-2.5 h-11 px-5 bg-white border border-[#E9E4D6] rounded-lg text-[13px] font-medium text-[#252B23] hover:border-[#175C3D] hover:shadow-sm transition-all"
                  style={{ fontFamily: "var(--font-body)" }}>
                  <GoogleMark />
                  Connect my Google account
                </a>
                <p className="mt-2.5 text-[11.5px] text-[#6b7265] leading-relaxed max-w-md"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Google will ask you to allow access. This shop can only see the one
                  spreadsheet it creates for you — never the rest of your Drive, your
                  photos or your email.
                </p>
              </div>
            ) : (
              <p className="mt-4 text-[12.5px] text-[#B5713A] leading-relaxed"
                style={{ fontFamily: "var(--font-body)" }}>
                Your developer needs to set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
                before this button will work.
              </p>
            )}

            {/* Durability warning — a connection that silently vanishes is worse
                than one that never worked. */}
            {oauthReady && !durable && (
              <div className="mt-4 flex gap-2.5 p-3 bg-[#FBF0DE] border border-[#C6A667]/40 rounded-lg">
                <AlertCircle size={15} className="text-[#B5713A] shrink-0 mt-0.5" />
                <p className="text-[11.5px] leading-relaxed text-[#6b4a22]"
                  style={{ fontFamily: "var(--font-body)" }}>
                  This deployment has no persistent storage, so a connection made here
                  would be lost when the server restarts. Add a Vercel KV / Upstash Redis
                  store and set <code>KV_REST_API_URL</code> and <code>KV_REST_API_TOKEN</code>.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- payment ---------------- */}
      <section className="bg-white rounded-xl border border-[#E9E4D6] p-5 mb-4">
        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 rounded-xl bg-[#FBF0DE] flex items-center justify-center shrink-0">
            <Landmark size={20} className="text-[#B5713A]" strokeWidth={1.8} />
          </span>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold text-[#123D2B]"
              style={{ fontFamily: "var(--font-body)" }}>
              How customers pay
            </h2>
            <p className="text-[12.5px] text-[#6b7265] mt-0.5 mb-3.5"
              style={{ fontFamily: "var(--font-body)" }}>
              Bank transfer, then they send you the receipt on WhatsApp.
            </p>

            <dl className="space-y-2" style={{ fontFamily: "var(--font-body)" }}>
              <Row label="Bank" value={BANK_DETAILS.bank} />
              <Row label="Account number" value={BANK_DETAILS.accountNumber} />
              <Row label="Account name" value={BANK_DETAILS.accountName} />
              <Row label="WhatsApp" value={WHATSAPP_NUMBER} />
            </dl>

            <p className="mt-3.5 text-[11px] text-[#A8B99C]" style={{ fontFamily: "var(--font-body)" }}>
              To change these, ask your developer to update them in the site settings file.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- storage detail ---------------- */}
      <section className="bg-white rounded-xl border border-[#E9E4D6] p-5">
        <div className="flex items-start gap-3.5">
          <span className="w-11 h-11 rounded-xl bg-[#E7EEF6] flex items-center justify-center shrink-0">
            <ShieldCheck size={20} className="text-[#2563EB]" strokeWidth={1.8} />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-[#123D2B]"
              style={{ fontFamily: "var(--font-body)" }}>
              Security
            </h2>
            <ul className="mt-2 space-y-1.5 text-[12.5px] text-[#6b7265]"
              style={{ fontFamily: "var(--font-body)" }}>
              <li>• Your Google permission is encrypted before it is stored.</li>
              <li>• This shop can only open the spreadsheet it created for you.</li>
              <li>• Disconnecting stops new orders saving; your spreadsheet stays yours.</li>
              <li className="text-[11.5px] text-[#A8B99C] pt-1">
                Connection storage: {kind === "redis" ? "Redis (durable)" : kind === "file" ? "local file (durable)" : "none (will not survive a restart)"}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------- pieces ---------------- */

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-[#F4F0E4] last:border-0">
      <dt className="text-[12px] text-[#6b7265]">{label}</dt>
      <dd className="text-[13px] font-semibold text-[#123D2B]">{value}</dd>
    </div>
  );
}

function Banner({ tone, icon: Icon, title, body }: {
  tone: "ok" | "warn" | "info";
  icon: typeof CheckCircle2;
  title: string;
  body: string;
}) {
  const styles = {
    ok: "bg-[#E8F0EA] border-[#175C3D]/25 text-[#175C3D]",
    warn: "bg-[#FBE9E7] border-[#C06014]/30 text-[#C06014]",
    info: "bg-[#F7F4E9] border-[#C6A667]/35 text-[#6b4a22]",
  }[tone];

  return (
    <div className={`flex gap-2.5 p-3.5 rounded-lg border mb-4 ${styles}`}>
      <Icon size={17} className="shrink-0 mt-0.5" />
      <div>
        <p className="text-[13px] font-semibold" style={{ fontFamily: "var(--font-body)" }}>{title}</p>
        <p className="text-[12px] mt-0.5 opacity-90 leading-relaxed"
          style={{ fontFamily: "var(--font-body)" }}>{body}</p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.1z" />
      <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.4l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.6 28.1c-.4-1.3-.7-2.7-.7-4.1s.2-2.8.7-4.1v-5.7H4.3C2.8 17.1 2 20.4 2 24s.8 6.9 2.3 9.8l7.3-5.7z" />
      <path fill="#EA4335" d="M24 10.8c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.3 30 2 24 2 15.4 2 7.9 6.9 4.3 14.2l7.3 5.7c1.7-5.2 6.6-9.1 12.4-9.1z" />
    </svg>
  );
}
