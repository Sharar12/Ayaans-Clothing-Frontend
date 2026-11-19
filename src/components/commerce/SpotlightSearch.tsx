'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, Sparkles, X } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { api } from '@/services/api';
import { GlassModal, SpecBadge } from '@/design-system/primitives';
import type { Brand, Product } from '@/types';

const QUICK_CHIPS = ['Zara', 'George', '380 GSM', 'Original', 'Peacoat', 'Hoodies', 'Ayaan'];

export function SpotlightSearch() {
  const { spotlightOpen, setSpotlightOpen, formatPrice } = useApp();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    if (!spotlightOpen) return;
    let active = true;
    Promise.all([api.getProducts({ q: query }), api.getBrands()]).then(([p, b]) => {
      if (!active) return;
      setProducts(p.slice(0, 6));
      setBrands(
        query.trim()
          ? b.filter((br) => br.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
          : b.slice(0, 6)
      );
    });
    return () => {
      active = false;
    };
  }, [spotlightOpen, query]);

  return (
    <GlassModal open={spotlightOpen} onClose={() => setSpotlightOpen(false)} maxWidth="max-w-2xl">
      <div className="p-4 sm:p-5">
        {/* Search Input with Prismatic Focus */}
        <div className="prismatic-ring flex items-center gap-3 rounded-2xl bg-white px-4 py-3">
          <Search className="h-5 w-5 text-indigo-500" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKU, Brand (Zara, Nike, George), Fabric GSM, Category..."
            className="w-full bg-transparent text-sm text-[#0A0B0E] placeholder:text-[#86868B] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="cursor-pointer rounded-full p-1 text-[#6E6E73] hover:bg-[#F5F5F7]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded-lg bg-[#F5F5F7] px-2 py-1 font-mono text-[10px] text-[#6E6E73] sm:block">
            ESC
          </kbd>
        </div>

        {/* Quick Chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6E6E73]">
            <Sparkles className="h-3 w-3 text-indigo-500" /> Popular:
          </span>
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setQuery(chip)}
              className="cursor-pointer rounded-full bg-[#F5F5F7] px-2.5 py-1 text-[11px] font-medium text-[#515154] transition-colors hover:bg-[#0A0B0E] hover:text-white"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Live Product Matches */}
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6E73]">
            Live Stock Lots ({products.length})
          </p>
          <div className="space-y-1.5">
            {products.map((p) => (
              <Link
                key={p.sku}
                href={`/product/${p.sku}`}
                onClick={() => setSpotlightOpen(false)}
                className="flex items-center justify-between gap-3 rounded-2xl p-2.5 transition-colors hover:bg-[#F5F5F7]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover bg-[#F5F5F7]"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0A0B0E]">{p.title}</p>
                    <p className="font-mono text-[11px] text-[#6E6E73]">
                      {p.brand} · {p.sku} · MOQ {p.moq} · {p.gsm}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <div className="text-right">
                    <p className="font-mono text-xs font-semibold text-[#0A0B0E]">
                      {formatPrice(p.tiers[0].unitPrice)}
                    </p>
                    <SpecBadge tone={p.designType === 'ORIGINAL' ? 'original' : 'master'} className="!py-0.5 !text-[10px]">
                      {p.designType}
                    </SpecBadge>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#86868B]" />
                </div>
              </Link>
            ))}
            {products.length === 0 && (
              <p className="rounded-2xl bg-[#FAFAFC] p-6 text-center text-sm text-[#6E6E73]">
                No ready lots match &ldquo;{query}&rdquo;. Submit a custom OEM or sourcing request on the{' '}
                <Link
                  href="/rfq"
                  onClick={() => setSpotlightOpen(false)}
                  className="font-medium text-indigo-600 underline"
                >
                  RFQ Studio
                </Link>
                .
              </p>
            )}
          </div>
        </div>

        {/* Brand Shortcuts */}
        {brands.length > 0 && (
          <div className="mt-5 border-t border-black/[0.06] pt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6E73]">Brands</p>
            <div className="flex flex-wrap gap-2">
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  onClick={() => setSpotlightOpen(false)}
                  className="rounded-full border border-black/[0.07] bg-white px-3 py-1 text-xs font-medium text-[#1D1D1F] hover:border-indigo-300"
                >
                  {b.name} <span className="font-mono text-[10px] text-[#6E6E73]">({b.activeLots})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </GlassModal>
  );
}
