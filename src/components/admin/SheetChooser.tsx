"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, FolderOpen, Loader2, AlertCircle } from "lucide-react";

/* Minimal shape of the Picker globals we touch. */
declare global {
  interface Window {
    gapi?: { load: (name: string, cb: () => void) => void };
    google?: {
      picker: {
        PickerBuilder: new () => PickerBuilder;
        ViewId: { SPREADSHEETS: string };
        Action: { PICKED: string; CANCEL: string };
        Feature: { NAV_HIDDEN: string };
      };
    };
  }
}

interface PickerBuilder {
  addView(view: string): PickerBuilder;
  setOAuthToken(token: string): PickerBuilder;
  setDeveloperKey(key: string): PickerBuilder;
  setTitle(title: string): PickerBuilder;
  enableFeature(f: string): PickerBuilder;
  setCallback(cb: (data: { action: string; docs?: { id: string }[] }) => void): PickerBuilder;
  build(): { setVisible(v: boolean): void };
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.appendChild(el);
  });
}

export function SheetChooser({ pickerEnabled }: { pickerEnabled: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"create" | "pick" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (body: { mode: "create" | "link"; spreadsheetId?: string }) => {
      const res = await fetch("/api/google/sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not save that choice.");
      router.refresh();
    },
    [router]
  );

  async function onCreate() {
    setBusy("create");
    setError(null);
    try {
      await save({ mode: "create" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  async function onPick() {
    setBusy("pick");
    setError(null);
    try {
      const res = await fetch("/api/google/sheet");
      const { accessToken, apiKey, error: e } = await res.json();
      if (!res.ok) throw new Error(e ?? "Could not start the picker.");
      if (!apiKey) throw new Error("NEXT_PUBLIC_GOOGLE_API_KEY is not set.");

      await loadScript("https://apis.google.com/js/api.js");
      await new Promise<void>((resolve) => window.gapi!.load("picker", () => resolve()));

      const picker = new window.google!.picker.PickerBuilder()
        .addView(window.google!.picker.ViewId.SPREADSHEETS)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setTitle("Choose the sheet your orders should go to")
        .enableFeature(window.google!.picker.Feature.NAV_HIDDEN)
        .setCallback((data) => {
          if (data.action === window.google!.picker.Action.PICKED && data.docs?.[0]) {
            save({ mode: "link", spreadsheetId: data.docs[0].id })
              .catch((err) => setError(err instanceof Error ? err.message : "Could not link that sheet."))
              .finally(() => setBusy(null));
          } else if (data.action === window.google!.picker.Action.CANCEL) {
            setBusy(null);
          }
        })
        .build();

      picker.setVisible(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the picker.");
      setBusy(null);
    }
  }

  return (
    <div className="mt-4">
      <p className="text-[12.5px] font-medium text-[#252B23] mb-2.5"
        style={{ fontFamily: "var(--font-body)" }}>
        Where should your orders be saved?
      </p>

      <div className="grid sm:grid-cols-2 gap-2.5">
        <button onClick={onCreate} disabled={busy !== null}
          className="flex items-start gap-3 p-3.5 text-left bg-white border border-[#E9E4D6] rounded-lg hover:border-[#175C3D] hover:shadow-sm disabled:opacity-60 transition-all">
          <span className="w-9 h-9 rounded-lg bg-[#E8F0EA] flex items-center justify-center shrink-0">
            {busy === "create"
              ? <Loader2 size={16} className="text-[#175C3D] animate-spin" />
              : <FilePlus2 size={16} className="text-[#175C3D]" strokeWidth={1.8} />}
          </span>
          <span>
            <span className="block text-[12.5px] font-semibold text-[#252B23]"
              style={{ fontFamily: "var(--font-body)" }}>
              Make me a new one
            </span>
            <span className="block text-[11.5px] text-[#6b7265] mt-0.5 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}>
              Creates a fresh order book in your Google Drive.
            </span>
          </span>
        </button>

        <button onClick={onPick} disabled={busy !== null || !pickerEnabled}
          className="flex items-start gap-3 p-3.5 text-left bg-white border border-[#E9E4D6] rounded-lg hover:border-[#175C3D] hover:shadow-sm disabled:opacity-60 disabled:hover:border-[#E9E4D6] disabled:hover:shadow-none transition-all">
          <span className="w-9 h-9 rounded-lg bg-[#FBF0DE] flex items-center justify-center shrink-0">
            {busy === "pick"
              ? <Loader2 size={16} className="text-[#B5713A] animate-spin" />
              : <FolderOpen size={16} className="text-[#B5713A]" strokeWidth={1.8} />}
          </span>
          <span>
            <span className="block text-[12.5px] font-semibold text-[#252B23]"
              style={{ fontFamily: "var(--font-body)" }}>
              Use a sheet I already have
            </span>
            <span className="block text-[11.5px] text-[#6b7265] mt-0.5 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}>
              {pickerEnabled
                ? "Pick your existing list. Your rows are kept."
                : "Needs NEXT_PUBLIC_GOOGLE_API_KEY set."}
            </span>
          </span>
        </button>
      </div>

      {error && (
        <p className="mt-2.5 flex items-start gap-1.5 text-[11.5px] text-[#C06014]" role="alert"
          style={{ fontFamily: "var(--font-body)" }}>
          <AlertCircle size={13} className="shrink-0 mt-0.5" /> {error}
        </p>
      )}

      <p className="mt-3 text-[11px] text-[#A8B99C] leading-relaxed"
        style={{ fontFamily: "var(--font-body)" }}>
        Every order goes to this one sheet and nowhere else. You can change it later.
      </p>
    </div>
  );
}
