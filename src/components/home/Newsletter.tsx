"use client";
import { useState, type FormEvent } from "react";
import { Facebook, MessageCircle, Mail, Check } from "lucide-react";
import { FACEBOOK_URL, WHATSAPP_URL } from "@/lib/constants";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Subscription failed");
      setState("done");
      setMessage(data.message ?? "You're on the list.");
      setEmail("");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <section className="bg-[#0F3324] border-t border-white/10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-7">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Copy */}
          <div className="text-center lg:text-left shrink-0">
            <h3 className="text-[1.3rem] lg:text-[1.5rem] text-white font-medium leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}>
              Join Our Wellness Community
            </h3>
            <p className="text-[12px] text-white/60 mt-0.5" style={{ fontFamily: "var(--font-body)" }}>
              Get exclusive updates, health tips and special offers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex-1 max-w-md w-full">
            <div className="flex">
              <div className="relative flex-1">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
                <input
                  type="email" required value={email} onChange={(e) => { setEmail(e.target.value); setState("idle"); }}
                  placeholder="Enter your email address" aria-label="Email address"
                  className="w-full h-11 pl-9 pr-3 text-[16px] sm:text-[13px] bg-white rounded-l-md text-[#252B23] placeholder-[#A8B99C] focus:outline-none focus:ring-1 focus:ring-[#C6A667]"
                  style={{ fontFamily: "var(--font-body)" }}
                />
              </div>
              <button type="submit" disabled={state === "loading" || state === "done"}
                className="h-11 px-6 bg-[#C6A667] hover:bg-[#B5935A] disabled:opacity-70 text-white text-[13px] font-medium rounded-r-md transition-colors flex items-center gap-1.5"
                style={{ fontFamily: "var(--font-body)" }}>
                {state === "done" ? <><Check size={14} /> Done</> : state === "loading" ? "..." : "Subscribe"}
              </button>
            </div>
            {message && (
              <p className={`mt-1.5 text-[11px] ${state === "error" ? "text-[#f0a0a0]" : "text-[#A8B99C]"}`}
                style={{ fontFamily: "var(--font-body)" }} role="status">
                {message}
              </p>
            )}
            <p className="mt-1.5 text-[10px] text-white/35" style={{ fontFamily: "var(--font-body)" }}>
              By subscribing you consent to receive updates. Unsubscribe at any time.
            </p>
          </form>

          {/* Social */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:border-[#C6A667] hover:text-[#C6A667] transition-colors">
              <Facebook size={14} />
            </a>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:border-[#C6A667] hover:text-[#C6A667] transition-colors">
              <MessageCircle size={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
