"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Trash2, Loader2, AlertTriangle, ImagePlus, X } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/products";
import type { Product } from "@/lib/types";

interface Props {
  /** Absent when creating. */
  product?: Product;
  /** Photographs already uploaded to the site, offered as choices. */
  availableImages: string[];
  /** False when edits would not survive a restart, which disables saving. */
  durable: boolean;
  /** True for products that live only in the store and can be deleted. */
  deletable: boolean;
}

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "error"; message: string };

export function ProductForm({ product, availableImages, durable, deletable }: Props) {
  const router = useRouter();
  const creating = !product;

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState(product?.category ?? "herbal-collections");
  const [priceText, setPriceText] = useState(
    product?.price === null || product?.price === undefined ? "" : String(product.price)
  );
  const [description, setDescription] = useState(product?.description ?? "");
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [stockCount, setStockCount] = useState(String(product?.stock_count ?? 0));
  const [published, setPublished] = useState(product?.is_published ?? true);
  const [ingredients, setIngredients] = useState(product?.ingredients ?? "");
  const [storage, setStorage] = useState(product?.storage_info ?? "");
  const [picking, setPicking] = useState(false);

  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "saving" });

    const payload = {
      name,
      category,
      price: priceText.trim() === "" ? null : Number(priceText),
      description,
      images,
      in_stock: inStock,
      stock_count: Number(stockCount) || 0,
      is_published: published,
      ingredients,
      storage_info: storage,
    };

    const res = await fetch(creating ? "/api/admin/products" : `/api/admin/products/${product!.sku}`, {
      method: creating ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ kind: "error", message: data.error ?? "Could not save. Please try again." });
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  async function remove() {
    const label = deletable ? "Delete this product?" : "Undo all edits and go back to the original?";
    if (!window.confirm(label)) return;

    setStatus({ kind: "saving" });
    const res = await fetch(`/api/admin/products/${product!.sku}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setStatus({ kind: "error", message: data.error ?? "Could not remove it." });
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  const saving = status.kind === "saving";

  return (
    <form onSubmit={submit} className="space-y-5" style={{ fontFamily: "var(--font-body)" }}>
      {!durable && (
        <Banner tone="warn">
          Saving is switched off because changes would not survive a restart. Add a KV store
          (Upstash Redis) in Vercel, then this page starts working.
        </Banner>
      )}
      {status.kind === "error" && <Banner tone="error">{status.message}</Banner>}

      <Field label="Product name" required>
        <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={140}
          className={inputClass} placeholder="Ginger Powder" />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Collection" required>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </Field>

        <Field label="Price in naira" hint="Leave empty for price on enquiry">
          <input value={priceText} onChange={(e) => setPriceText(e.target.value)}
            inputMode="numeric" className={inputClass} placeholder="15000" />
        </Field>
      </div>

      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
          maxLength={2000} className={`${inputClass} h-auto py-2.5 resize-y`}
          placeholder="What it is and how it is supplied. Do not describe what it treats." />
      </Field>

      <Field label="Photographs" hint="Pick from pictures already uploaded to the site">
        <div className="flex flex-wrap gap-2.5">
          {images.map((src) => (
            <span key={src} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#E9E4D6]">
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              <button type="button" onClick={() => setImages(images.filter((i) => i !== src))}
                aria-label="Remove this photograph"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                <X size={12} />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => setPicking((v) => !v)}
            className="w-20 h-20 rounded-lg border border-dashed border-[#C6A667] text-[#175C3D] flex flex-col items-center justify-center gap-1 text-[10.5px]">
            <ImagePlus size={17} />
            {picking ? "Close" : "Add"}
          </button>
        </div>

        {picking && (
          <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-[#E9E4D6] p-2 grid grid-cols-4 sm:grid-cols-6 gap-2">
            {availableImages.filter((src) => !images.includes(src)).map((src) => (
              <button key={src} type="button"
                onClick={() => { setImages([...images, src]); setPicking(false); }}
                className="relative aspect-square rounded-md overflow-hidden border border-[#EFE9DD] hover:border-[#175C3D]">
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
        <p className="mt-2 text-[11.5px] text-[#A8B99C] leading-relaxed">
          Uploading a new photograph from your phone is not built yet. Send new pictures to the
          developer and they appear in this list.
        </p>
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Stock count" hint="0 means you have not counted yet">
          <input value={stockCount} onChange={(e) => setStockCount(e.target.value)}
            inputMode="numeric" className={inputClass} />
        </Field>
        <div className="flex flex-col justify-end gap-3 pb-1">
          <Toggle checked={inStock} onChange={setInStock} label="In stock" />
          <Toggle checked={published} onChange={setPublished} label="Show on the website" />
        </div>
      </div>

      <Field label="Ingredients" hint="Optional. Shown on the product page when filled in">
        <textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={2}
          maxLength={2000} className={`${inputClass} h-auto py-2.5 resize-y`} />
      </Field>

      <Field label="Storage and safety" hint="Optional">
        <textarea value={storage} onChange={(e) => setStorage(e.target.value)} rows={2}
          maxLength={1000} className={`${inputClass} h-auto py-2.5 resize-y`} />
      </Field>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" disabled={saving || !durable}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-[#123D2B] text-white text-[13px] font-semibold disabled:opacity-50 hover:bg-[#175C3D] transition-colors">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {creating ? "Add product" : "Save changes"}
        </button>

        {!creating && (
          <button type="button" onClick={remove} disabled={saving || !durable}
            className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-[#E9E4D6] text-[#991B1B] text-[13px] font-medium disabled:opacity-50 hover:border-[#991B1B] transition-colors">
            <Trash2 size={15} />
            {deletable ? "Delete" : "Undo my edits"}
          </button>
        )}
      </div>

      {!creating && !deletable && (
        <p className="text-[11.5px] text-[#A8B99C] leading-relaxed max-w-prose">
          This product came with the website, so it cannot be deleted. Untick &ldquo;Show on the
          website&rdquo; to hide it, or use &ldquo;Undo my edits&rdquo; to put it back exactly as
          it was.
        </p>
      )}
    </form>
  );
}

const inputClass =
  "w-full h-11 px-3 bg-white border border-[#E9E4D6] rounded-lg text-[16px] sm:text-[13px] " +
  "text-[#252B23] placeholder-[#A8B99C] focus:outline-none focus:border-[#175C3D]";

function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[12px] font-medium text-[#252B23] mb-1.5">
        {label} {required && <span className="text-[#C06014]">*</span>}
      </span>
      {children}
      {hint && <span className="block mt-1 text-[11.5px] text-[#A8B99C]">{hint}</span>}
    </label>
  );
}

function Toggle({ checked, onChange, label }: {
  checked: boolean; onChange: (v: boolean) => void; label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer min-h-[28px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="w-5 h-5 accent-[#123D2B]" />
      <span className="text-[13px] text-[#252B23]">{label}</span>
    </label>
  );
}

function Banner({ tone, children }: { tone: "warn" | "error"; children: React.ReactNode }) {
  const style = tone === "error"
    ? { bg: "#FEE2E2", border: "#991B1B", fg: "#991B1B" }
    : { bg: "#FEF3C7", border: "#92400E", fg: "#92400E" };
  return (
    <div className="rounded-lg border-l-[3px] p-3.5 flex gap-2.5 text-[12.5px] leading-relaxed"
      style={{ background: style.bg, borderLeftColor: style.border, color: style.fg }}>
      <AlertTriangle size={16} className="shrink-0 mt-[1px]" />
      <span>{children}</span>
    </div>
  );
}
