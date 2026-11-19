"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import { Product } from "@/mock-backend/types";
import { useRfq } from "@/context/RfqContext";

export function ProductCard({ product }: { product: Product }) {
  const { addToRfq, setQuickViewProduct } = useRfq();
  const lowestPrice = Math.min(...product.pricingTiers.map((t) => t.unitPriceBdt));

  return (
    <motion.div
      layout
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="group flex flex-col bg-white border border-hairline hover:border-ink/50 hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
    >
      {/* Image with Hover Crossfade */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
          />
          <Image
            src={product.images[1]}
            alt={`${product.title} alternate`}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover opacity-0 scale-105 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm text-[10px] font-mono uppercase tracking-wider text-ink border border-hairline">
            {product.type === "stock-lot" ? "Stock Lot" : "OEM Custom"}
          </span>
          <span className="px-2 py-0.5 bg-ink/85 text-white text-[10px] font-mono">
            {product.gsm}
          </span>
        </div>

        {/* Slide-Up Quick Action Bar */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={() => setQuickViewProduct(product)}
            className="flex-1 py-2.5 bg-white/95 backdrop-blur-md text-ink text-xs font-medium border border-hairline hover:bg-ink hover:text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          <button
            onClick={() => addToRfq(product)}
            className="flex-1 py-2.5 bg-ink text-white text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add RFQ
          </button>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-1">
            <span>{product.brand}</span>
            <span>{product.sku}</span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="font-display font-semibold text-sm text-ink hover:underline line-clamp-1"
          >
            {product.title}
          </Link>
          {/* Color Swatches */}
          <div className="flex items-center gap-1.5 mt-2.5">
            {product.colors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                style={{ backgroundColor: c.hex }}
                className="w-3 h-3 rounded-full border border-hairline"
              />
            ))}
            <span className="text-[10px] font-mono text-muted ml-1">
              {product.gender}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-hairline flex items-end justify-between">
          <div>
            <span className="block text-[10px] font-mono uppercase text-muted">
              From / Unit
            </span>
            <span className="font-mono font-bold text-sm text-ink">
              ৳{lowestPrice.toLocaleString("en-BD")}
            </span>
          </div>
          <div className="text-right">
            <span className="block text-[10px] font-mono uppercase text-muted">
              MOQ
            </span>
            <span className="font-mono text-xs text-ink">
              {product.moq.toLocaleString()} pcs
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
