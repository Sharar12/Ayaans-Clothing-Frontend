"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRfq } from "@/context/RfqContext";

const NAV_LINKS = [
  { href: "/shop", label: "Catalog" },
  { href: "/stock-lots", label: "Stock Lots" },
  { href: "/manufacturing", label: "OEM" },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "Compliance" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { totalItemsCount, setDrawerOpen, setSearchOpen } = useRfq();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-hairline"
          : "bg-white border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Wordmark */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 group">
          <div className="w-8 h-8 shrink-0 bg-ink text-white flex items-center justify-center font-display font-bold text-sm tracking-tighter group-hover:rotate-3 transition-transform">
            AC
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <span className="font-display font-bold text-base tracking-tight text-ink leading-none">
              AYAAN CLOTHING
            </span>
            <span className="font-mono text-[10px] text-muted tracking-widest uppercase mt-0.5">
              DHAKA • EST. 2010
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex shrink-0 items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative whitespace-nowrap text-sm font-medium transition-colors ${active ? "text-ink" : "text-muted hover:text-ink"
                  }`}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-ink"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-hairline bg-surface/60 hover:border-ink/40 text-xs text-muted transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-ink" />
            <span>Search SKU...</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 bg-white border border-hairline rounded">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={() => setDrawerOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>RFQ</span>
            {totalItemsCount > 0 && (
              <motion.span
                key={totalItemsCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="ml-0.5 px-1.5 py-0.5 bg-white text-ink rounded-full font-mono text-[10px] font-bold"
              >
                {totalItemsCount}
              </motion.span>
            )}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-ink"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white border-b border-hairline overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-medium text-ink border-b border-hairline/60 last:border-0"
                >
                  {link.label}
                  <ArrowUpRight className="w-4 h-4 text-muted" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
