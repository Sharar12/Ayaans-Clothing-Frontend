"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRfq } from "@/context/RfqContext";

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToRfq } = useRfq();

  return (
    <AnimatePresence>
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuickViewProduct(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative z-10 w-full max-w-3xl bg-white border border-hairline grid md:grid-cols-2 overflow-hidden shadow-2xl"
          >
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-20 p-2 bg-white/90 border border-hairline hover:bg-ink hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-[4/5] bg-surface">
              <Image
                src={quickViewProduct.images[0]}
                alt={quickViewProduct.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6 md:p-8 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs text-muted uppercase">
                  {quickViewProduct.brand} • {quickViewProduct.sku}
                </span>
                <h3 className="font-display font-bold text-2xl text-ink mt-1">
                  {quickViewProduct.title}
                </h3>
                <p className="text-sm text-muted mt-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="mt-5 space-y-2 border-t border-b border-hairline py-4 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">Fabric</span>
                    <span className="text-ink">{quickViewProduct.fabric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Weight / Gauge</span>
                    <span className="text-ink">{quickViewProduct.gsm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">MOQ</span>
                    <span className="text-ink">{quickViewProduct.moq} pcs</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    addToRfq(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-3 bg-ink text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add {quickViewProduct.moq} pcs to RFQ
                </button>
                <Link
                  href={`/product/${quickViewProduct.slug}`}
                  onClick={() => setQuickViewProduct(null)}
                  className="w-full py-3 border border-hairline text-ink text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 hover:border-ink transition-colors"
                >
                  Full Specs & CBM Calculator
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
