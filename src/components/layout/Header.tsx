"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Search, User, Heart, ShoppingBag, Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { NAV_LINKS } from "@/lib/constants";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { cn } from "@/lib/cn";

export function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  const itemCount = useCartStore((s) => s.itemCount());
  const wishlistCount = useWishlistStore((s) => s.ids.length);
  const toggleCart = useCartStore((s) => s.toggleCart);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
    setMobileOpen(false);
  }

  return (
    <>
      <header className={cn(
        "sticky top-0 z-50 bg-[#F7F4E9] transition-shadow duration-300",
        scrolled ? "shadow-[0_1px_16px_rgba(18,61,43,0.10)]" : "border-b border-[#E7E0CF]"
      )}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-[60px] lg:h-[68px]">
            <Logo variant="dark" className="shrink-0" />

            {/* Desktop nav */}
            <nav className="hidden xl:flex items-center gap-5 ml-6 mr-auto">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href}
                  className="relative text-[13px] font-medium text-[#252B23] hover:text-[#123D2B] transition-colors py-2 group whitespace-nowrap"
                  style={{ fontFamily: "var(--font-body)" }}>
                  {link.label}
                  <span className="absolute bottom-1 left-0 h-[1.5px] w-0 bg-[#C6A667] transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>

            {/* Search */}
            <form onSubmit={onSearch} className="hidden md:flex items-center ml-auto xl:ml-0 flex-1 max-w-[320px]">
              <div className="relative flex w-full">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder="Search products, herbs, spices..."
                  aria-label="Search products"
                  className="w-full h-9 pl-9 pr-3 text-[13px] bg-white border border-[#E7E0CF] rounded-l-md text-[#252B23] placeholder-[#A8B99C] focus:outline-none focus:border-[#175C3D] transition-colors"
                  style={{ fontFamily: "var(--font-body)" }}
                />
                <button type="submit" aria-label="Search"
                  className="h-9 px-3.5 bg-[#175C3D] hover:bg-[#123D2B] text-white rounded-r-md transition-colors flex items-center justify-center">
                  <Search size={15} />
                </button>
              </div>
            </form>

            {/* Utilities */}
            <div className="flex items-center gap-0.5 shrink-0 ml-auto md:ml-2">
              <Link href="/account" aria-label="Account"
                className="p-2 text-[#252B23] hover:text-[#123D2B] transition-colors hidden sm:flex">
                <User size={18} strokeWidth={1.6} />
              </Link>

              <Link href="/wishlist" aria-label="Wishlist"
                className="p-2 text-[#252B23] hover:text-[#123D2B] transition-colors relative hidden sm:flex">
                <Heart size={18} strokeWidth={1.6} />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#C6A667] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] px-1 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <button onClick={toggleCart} aria-label={`Shopping bag, ${mounted ? itemCount : 0} items`}
                className="p-2 text-[#252B23] hover:text-[#123D2B] transition-colors relative">
                <ShoppingBag size={18} strokeWidth={1.6} />
                {mounted && itemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#175C3D] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] px-1 flex items-center justify-center animate-in zoom-in duration-200">
                    {itemCount}
                  </span>
                )}
              </button>

              <button onClick={() => setMobileOpen(true)} aria-label="Open menu"
                className="xl:hidden p-2 text-[#252B23]">
                <Menu size={20} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-[60] xl:hidden transition-opacity duration-300",
        mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
        <div className="absolute inset-0 bg-[#123D2B]/50 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />
        <nav className={cn(
          "absolute top-0 left-0 bottom-0 w-[82%] max-w-[330px] bg-[#F7F4E9] flex flex-col transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between px-5 h-[60px] border-b border-[#E7E0CF]">
            <Logo variant="dark" />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 text-[#252B23]">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={onSearch} className="px-5 py-4 border-b border-[#E7E0CF]">
            <div className="relative flex">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8B99C] pointer-events-none" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} type="search" placeholder="Search products..."
                className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-[#E7E0CF] rounded-l-md focus:outline-none focus:border-[#175C3D]"
                style={{ fontFamily: "var(--font-body)" }} />
              <button type="submit" aria-label="Search" className="h-10 px-4 bg-[#175C3D] text-white rounded-r-md">
                <Search size={15} />
              </button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto px-5 py-2">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className="block py-3.5 text-[15px] font-medium text-[#252B23] border-b border-[#E7E0CF]/60 hover:text-[#123D2B] transition-colors"
                style={{ fontFamily: "var(--font-body)" }}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-[#E7E0CF] flex gap-5">
            <Link href="/account" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>
              <User size={16} /> Account
            </Link>
            <Link href="/wishlist" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm text-[#252B23]" style={{ fontFamily: "var(--font-body)" }}>
              <Heart size={16} /> Wishlist{mounted && wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
