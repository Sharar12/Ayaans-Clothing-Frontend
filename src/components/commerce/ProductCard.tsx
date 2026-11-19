'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingBag, GitCompare, Play } from 'lucide-react';
import type { Product } from '@/types';
import { useApp } from '@/store/AppContext';
import { SpecBadge } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';

export function ProductCard({ product }: { product: Product }) {
  const { formatPrice, addToBag, toggleWishlist, wishlist, setQuickViewProduct, toggleCompare, compareList } = useApp();
  const isSaved = wishlist.includes(product.sku);
  const isCompared = compareList.some((p) => p.sku === product.sku);
  const lowestTier = product.tiers[product.tiers.length - 1];
  const stockPercent = Math.round((product.availableStock / product.initialStock) * 100);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: APPLE_EASE }}
      className="ambient-card group relative flex flex-col overflow-hidden rounded-[26px] bg-white"
    >
      {/* Pure Studio Image Stage */}
      <div className="relative aspect-[4/4.6] overflow-hidden bg-[#F5F5F7]">
        <Link href={`/product/${product.sku}`} className="block h-full w-full">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.045]"
          />
          {product.images[1] && (
            <img
              src={product.images[1]}
              alt={`${product.title} alternate`}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.045] group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          <SpecBadge tone={product.designType === 'ORIGINAL' ? 'original' : 'master'}>
            {product.designType}
          </SpecBadge>
          {product.isNewArrival && <SpecBadge tone="glass">NEW</SpecBadge>}
        </div>

        {/* Top-Right Save & Compare Icons */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5">
          <button
            type="button"
            aria-label="Save lot"
            onClick={() => toggleWishlist(product.sku)}
            className={`glass-pill flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors ${
              isSaved ? 'text-rose-500' : 'text-[#515154] hover:text-[#0A0B0E]'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-rose-500' : ''}`} />
          </button>
          <button
            type="button"
            aria-label="Compare lot"
            onClick={() => toggleCompare(product)}
            className={`glass-pill flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors ${
              isCompared ? 'bg-[#0A0B0E]! text-white!' : 'text-[#515154] hover:text-[#0A0B0E]'
            }`}
          >
            <GitCompare className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Warehouse Video Indicator */}
        {product.videoPreviewLabel && (
          <div className="pointer-events-none absolute bottom-14 left-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-md transition-opacity group-hover:opacity-0">
            <Play className="h-2.5 w-2.5 fill-white" />
            QC Video
          </div>
        )}

        {/* Frosted Quick-Action Bar gliding up on hover */}
        <div className="absolute inset-x-3 bottom-3 flex translate-y-3 items-center gap-1.5 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <button
            type="button"
            onClick={() => addToBag(product, product.moq)}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#0A0B0E]/92 py-2 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-[#0A0B0E]"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Add MOQ ({product.moq})
          </button>
          <button
            type="button"
            aria-label="Quick preview"
            onClick={() => setQuickViewProduct(product)}
            className="glass-pill flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#0A0B0E] hover:bg-white"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Editorial Product Specs Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold uppercase tracking-[0.12em] text-[#6E6E73]">{product.brand}</span>
          <span className="font-mono text-[#86868B]">{product.gsm}</span>
        </div>

        <Link
          href={`/product/${product.sku}`}
          className="mt-1 line-clamp-2 text-[14px] font-semibold leading-snug tracking-[-0.015em] text-[#0A0B0E] transition-colors hover:text-indigo-600"
        >
          {product.title}
        </Link>

        {/* Color Dots + Stock Meter */}
        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {product.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="h-3 w-3 rounded-full border border-black/15"
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] text-[#6E6E73]">
            {product.availableStock.toLocaleString()} pcs left
          </span>
        </div>

        {/* Subtle Stock Progress Micro-bar */}
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#F1F2F6]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
            style={{ width: `${stockPercent}%` }}
          />
        </div>

        {/* Bottom Pricing & MOQ Strip */}
        <div className="mt-auto flex items-end justify-between border-t border-black/[0.05] pt-3.5">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-[#86868B]">From (Full Lot)</p>
            <p className="font-mono text-base font-semibold tracking-tight text-[#0A0B0E]">
              {formatPrice(lowestTier.unitPrice)}
              <span className="text-[11px] font-normal text-[#6E6E73]">/pc</span>
            </p>
          </div>
          <div className="text-right font-mono text-[11px] text-[#515154]">
            <p>MOQ {product.moq}</p>
            <p className="text-[10px] text-[#86868B]">{product.audience}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
