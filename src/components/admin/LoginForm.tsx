"use client";
import { useState, type FormEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, AlertCircle } from "lucide-react";

export function LoginForm() {
  const params = useSearchParams();
  const router = useRouter();
  const needsSetup = params.get("setup") === "1";
  const next = params.get("next") ?? "/admin";

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      // Signed in with the handover password. Going straight there means the
      // first thing she sees is the reason, not a bounce off the dashboard.
      if (data.mustChange) {
        router.push("/admin/password?first=1");
        router.refresh();
        return;
      }
      router.push(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#123D2B] flex items-center justify-center px-5">
      <div aria-hidden className="fixed inset-0 opacity-[0.07] pointer-events-none">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="loginLeaf" width="90" height="90" patternUnits="userSpaceOnUse" patternTransform="rotate(-15)">
              <path d="M45 16C45 16 29 26 29 43C29 54 36 62 45 62C54 62 61 54 61 43C61 26 45 16 45 16Z" fill="#C6A667" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loginLeaf)" />
        </svg>
      </div>

      <div className="relative w-full max-w-[380px]">
        <div className="flex flex-col items-center mb-7">
          <svg width="38" height="44" viewBox="0 0 32 36" fill="none">
            <path d="M16 2C16 2 4 8 4 20C4 27.7 9.3 34 16 34C22.7 34 28 27.7 28 20C28 8 16 2 16 2Z" fill="#A8B99C" opacity="0.5" />
            <path d="M16 8C16 8 8 13 8 23C8 29.1 11.6 34 16 34C20.4 34 24 29.1 24 23C24 13 16 8 16 8Z" fill="#C6A667" />
            <line x1="16" y1="9" x2="16" y2="33" stroke="#123D2B" strokeWidth="1" />
          </svg>
          <h1 className="mt-3 text-[1.5rem] text-white" style={{ fontFamily: "var(--font-heading)" }}>
            Wendy Herbals
          </h1>
          <p className="text-[11px] tracking-widest uppercase text-white/45 mt-0.5"
            style={{ fontFamily: "var(--font-body)" }}>
            Shop Management
          </p>
        </div>

        {needsSetup ? (
          <div className="bg-white rounded-xl p-6">
            <div className="flex gap-2.5">
              <AlertCircle size={18} className="text-[#B5713A] shrink-0 mt-0.5" />
              <div>
                <p className="text-[13.5px] font-semibold text-[#252B23]"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Sign-in is not set up yet
                </p>
                <p className="text-[12.5px] text-[#6b7265] mt-1.5 leading-relaxed"
                  style={{ fontFamily: "var(--font-body)" }}>
                  Add <code className="px-1 py-0.5 bg-[#F7F4E9] rounded text-[11.5px]">ADMIN_PASSWORD</code> and{" "}
                  <code className="px-1 py-0.5 bg-[#F7F4E9] rounded text-[11.5px]">ADMIN_SECRET</code> to{" "}
                  <code className="px-1 py-0.5 bg-[#F7F4E9] rounded text-[11.5px]">.env.local</code>, then restart the
                  server. Until then the dashboard stays locked.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="bg-white rounded-xl p-6">
            <label htmlFor="password" className="block text-[12px] font-medium text-[#252B23] mb-1.5"
              style={{ fontFamily: "var(--font-body)" }}>
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
              <input
                id="password" type="password" required autoFocus autoComplete="current-password"
                value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }}
                className="w-full h-11 pl-9 pr-3 bg-white border border-[#E7E0CF] rounded-md text-[16px] sm:text-[13px] text-[#252B23] focus:outline-none focus:border-[#175C3D]"
                style={{ fontFamily: "var(--font-body)" }}
              />
            </div>

            {error && (
              <p className="mt-2.5 text-[12px] text-[#C06014]" role="alert"
                style={{ fontFamily: "var(--font-body)" }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={busy || !password}
              className="mt-4 w-full h-11 bg-[#123D2B] text-white text-[13.5px] font-medium rounded-md hover:bg-[#175C3D] disabled:opacity-50 transition-colors"
              style={{ fontFamily: "var(--font-body)" }}>
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
