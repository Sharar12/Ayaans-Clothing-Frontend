"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Product } from "@/mock-backend/types";
import { ProductCard } from "@/ui/ProductCard";

const TABS = ["All", "Hoodies", "Jackets", "T-Shirts", "Sweaters", "Activewear"];

export function FeaturedTabs({ products }: { products: Product[] }) {
  const [activeTab, setActiveTab] = useState("All");

  const filtered =
    activeTab === "All"
      ? products.slice(0, 8)
      : products.filter((product) => product.category === activeTab).slice(0, 4);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs uppercase text-muted">
            Live Warehouse Inventory • 108+ Active Lots
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink mt-1">
            Explore Wholesale Lots (BDT ৳)
          </h2>
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Wholesale product categories">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab)}
                className={`relative isolate px-4 py-2 text-xs font-mono uppercase transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-muted hover:text-ink border border-hairline"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="home-cat-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 -z-10 bg-ink"
                  />
                )}
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted">
          No products are currently listed in this category.
        </p>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-4 border border-ink text-ink text-xs font-mono uppercase tracking-wider hover:bg-ink hover:text-white transition-colors"
        >
          Browse All {products.length} Wholesale Lots
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
