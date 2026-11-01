"use client";
import { useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

const MIN_LENGTH = 10;

/**
 * Setting her own password.
 *
 * Reached two ways: forced, straight after signing in with the password we
 * handed over (`?first=1`), or chosen from Settings later. The copy changes
 * between the two, because "you must do this now" and "you asked to do this"
 * are different situations and reading the same sentence in both is
 * confusing.
 */
export function PasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const first = params.get("first") === "1";

  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const tooShort = next.length > 0 && next.length < MIN_LENGTH;
  const mismatch = confirm.length > 0 && next !== confirm;
  const ready = current.length > 0 && next.length >= MIN_LENGTH && next === confirm;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current, next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not change the password.");
        return;
      }
      setDone(true);
      // refresh() first so the new cookie, without the forced-change flag, is
      // the one in play by the time /admin is requested.
      router.refresh();
      router.push("/admin");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    // When the change is forced, this covers the admin chrome: leaving the nav
    // visible invites clicks that silently bounce back here with no
    // explanation. Coming from Settings by choice, the chrome stays and there
    // is a way out.
    <div className={
      first
        ? "fixed inset-0 z-50 overflow-y-auto bg-[#123D2B] flex items-center justify-center px-5 py-10"
        : "min-h-screen bg-[#123D2B] flex items-center justify-center px-5 py-10"
    }>
      <div aria-hidden className="fixed inset-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="pwLeaf" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
              <path d="M45 16C45 16 29 26 29 43C29 54 36 62 45 62C54 62 61 54 61 43C61 26 45 16 45 16Z" fill="#C6A667" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pwLeaf)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[400px]">
        <div className="flex flex-col items-center mb-6 text-center">
          <KeyRound size={30} className="text-[#C6A667]" strokeWidth={1.5} />
          <h1 className="mt-3 text-[1.4rem] text-white" style={{ fontFamily: "var(--font-heading)" }}>
            {first ? "Choose your own password" : "Change your password"}
          </h1>
          <p className="text-[12.5px] text-white/60 mt-1.5 leading-relaxed"
            style={{ fontFamily: "var(--font-body)" }}>
            {first
              ? "The password you were sent was only to get you in. Pick one of your own now — nobody else will know it."
              : "You will use the new one next time you sign in."}
          </p>
        </div>

        <form onSubmit={onSubmit} className="bg-white rounded-xl p-6"
          style={{ fontFamily: "var(--font-body)" }}>
          <Field
            id="current"
            label={first ? "The password you were sent" : "Your current password"}
            autoComplete="current-password"
            value={current}
            autoFocus
            onChange={(v) => { setCurrent(v); setError(null); }}
          />

          <div className="mt-4">
            <Field
              id="next"
              label="Your new password"
              autoComplete="new-password"
              value={next}
              onChange={(v) => { setNext(v); setError(null); }}
              hint={`At least ${MIN_LENGTH} characters.`}
              problem={tooShort ? `That is ${next.length} characters — use at least ${MIN_LENGTH}.` : null}
            />
          </div>

          <div className="mt-4">
            <Field
              id="confirm"
              label="Type it once more"
              autoComplete="new-password"
              value={confirm}
              onChange={(v) => { setConfirm(v); setError(null); }}
              problem={mismatch ? "The two do not match." : null}
            />
          </div>

          {error && (
            <p className="mt-3 flex items-start gap-1.5 text-[12px] text-[#C06014]" role="alert">
              <AlertCircle size={13} className="mt-px shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {done && (
            <p className="mt-3 flex items-center gap-1.5 text-[12px] text-[#175C3D]" role="status">
              <CheckCircle2 size={13} /> Saved. Taking you to the dashboard.
            </p>
          )}

          <button type="submit" disabled={busy || !ready}
            className="mt-5 w-full h-11 bg-[#123D2B] text-white text-[13.5px] font-medium rounded-md hover:bg-[#175C3D] disabled:opacity-50 transition-colors">
            {busy ? "Saving..." : "Save my password"}
          </button>

          <p className="mt-3.5 text-[11px] text-[#A8B99C] leading-relaxed">
            Write it down somewhere safe. There is no email on this site, so a forgotten
            password has to be reset by whoever set the shop up.
          </p>

          {!first && (
            <button type="button" onClick={() => router.push("/admin/settings")}
              className="mt-3 w-full text-[12px] font-medium text-[#6b7265] hover:text-[#123D2B] transition-colors">
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  id, label, value, onChange, autoComplete, autoFocus, hint, problem,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  autoFocus?: boolean;
  hint?: string;
  problem?: string | null;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] font-medium text-[#252B23] mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
        <input
          id={id} type="password" required autoComplete={autoComplete} autoFocus={autoFocus}
          value={value} onChange={(e) => onChange(e.target.value)}
          className="w-full h-11 pl-9 pr-3 bg-white border border-[#E7E0CF] rounded-md text-[16px] sm:text-[13px] text-[#252B23] focus:outline-none focus:border-[#175C3D]"
        />
      </div>
      {problem ? (
        <p className="mt-1 text-[11.5px] text-[#C06014]">{problem}</p>
      ) : hint ? (
        <p className="mt-1 text-[11.5px] text-[#A8B99C]">{hint}</p>
      ) : null}
    </div>
  );
}
