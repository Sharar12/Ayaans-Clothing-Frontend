"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ArrowRight, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRfq } from "@/context/RfqContext";

export function RfqDrawer() {
  const {
    items,
    isDrawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeFromRfq,
    totalEstimatedValue,
    totalCbm,
  } = useRfq();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white border-l border-hairline flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-hairline flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-ink">
                  RFQ Quote Cart
                </h2>
                <p className="font-mono text-xs text-muted">
                  B2B Wholesale & Export Inquiry
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 hover:bg-surface rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-ink" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <Package className="w-10 h-10 text-muted/40 mb-3" />
                  <p className="font-display font-medium text-ink">
                    Your RFQ cart is empty
                  </p>
                  <p className="text-xs text-muted mt-1 max-w-[220px]">
                    Add stock lots or OEM styles to calculate CBM and request an official export quote.
                  </p>
                </div>
              ) : (
                items.map(({ product, quantity, selectedTierPrice }) => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-3 border border-hairline bg-surface/40"
                  >
                    <div className="relative w-16 h-20 bg-surface shrink-0">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-medium text-xs text-ink truncate">
                          {product.title}
                        </h4>
                        <button
                          onClick={() => removeFromRfq(product.id)}
                          className="text-muted hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-mono text-[11px] text-muted mt-0.5">
                        ৳{selectedTierPrice.toFixed(2)} / pc
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-hairline bg-white">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 100)}
                            className="px-2 py-1 text-xs hover:bg-surface"
                          >
                            -
                          </button>
                          <span className="px-2.5 py-1 font-mono text-xs">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 100)}
                            className="px-2 py-1 text-xs hover:bg-surface"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-mono text-xs font-semibold text-ink">
                          ৳{(quantity * selectedTierPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {items.length > 0 && (
              <div className="p-6 border-t border-hairline bg-surface/50 space-y-4">
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Est. Shipping Volume</span>
                    <span>{totalCbm.toFixed(2)} CBM</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-ink pt-2 border-t border-hairline">
                    <span>Est. FOB Total</span>
                    <span>৳{totalEstimatedValue.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  href="/rfq"
                  onClick={() => setDrawerOpen(false)}
                  className="w-full py-3.5 bg-ink text-white text-xs font-medium tracking-wide uppercase flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
                >
                  Proceed to Official RFQ
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
