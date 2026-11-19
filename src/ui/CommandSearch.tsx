"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRfq } from "@/context/RfqContext";
import { api } from "@/mock-backend/api";

export function CommandSearch() {
  const { isSearchOpen, setSearchOpen } = useRfq();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  const results = api.searchProducts(query);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="relative z-10 w-full max-w-xl bg-white border border-hairline shadow-2xl overflow-hidden"
          >
            <div className="flex items-center px-4 border-b border-hairline">
              <Search className="w-4 h-4 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by SKU, Brand (e.g. Levi's), or Garment..."
                className="w-full px-3 py-4 text-sm text-ink bg-transparent focus:outline-none"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4 text-muted hover:text-ink" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-hairline">
              {results.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{p.title}</p>
                    <p className="font-mono text-[11px] text-muted">
                      {p.brand} • {p.sku} • MOQ {p.moq}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted" />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
