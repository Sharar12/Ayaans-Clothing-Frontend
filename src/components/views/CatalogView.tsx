'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LayoutGrid, Table2, Search, ShoppingBag, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { api } from '@/services/api';
import type { Product } from '@/types';
import { useApp } from '@/store/AppContext';
import { ProductCard } from '@/components/commerce/ProductCard';
import { AmbientAura, PrismaticButton, Reveal, SegmentedControl, SpecBadge, VideoBackground } from '@/design-system/primitives';

const AUDIENCES = ['All', 'Men', 'Women', 'Boys', 'Girls', 'Unisex'];
const CATEGORIES = ['All', 'T-Shirts', 'Hoodies', 'Sweaters', 'Jackets', 'Pants', 'Trousers', 'Activewear', 'Polo Shirts', 'Knitwear'];

export function CatalogView() {
  const params = useSearchParams();
  const { formatPrice, addToBag } = useApp();

  const [audience, setAudience] = useState(params.get('audience') || 'All');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [designType, setDesignType] = useState(params.get('designType') || 'All');
  const [search, setSearch] = useState(params.get('q') || '');
  const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'moq_asc' | 'stock_desc'>('newest');
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAudience(params.get('audience') || 'All');
    setCategory(params.get('category') || 'All');
    setDesignType(params.get('designType') || 'All');
  }, [params]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    api
      .getProducts({ audience, category, designType, q: search, sort })
      .then((res) => {
        if (active) {
          setProducts(res);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [audience, category, designType, search, sort]);

  const resetAll = () => {
    setAudience('All');
    setCategory('All');
    setDesignType('All');
    setSearch('');
    setSort('newest');
  };

  return (
    <div className="relative min-h-screen bg-white">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th (1).mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="subtle" />

      {/* Editorial Header */}
      <section className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8">
        <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#6E6E73]">
              Dhaka Ready-Stock &amp; OEM Inventory
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-5xl">
              Master Wholesale Catalog
            </h1>
          </div>
          <p className="font-mono text-xs text-[#6E6E73]">
            Showing <span className="font-semibold text-[#0A0B0E]">{products.length}</span> verified export lots
          </p>
        </Reveal>
      </section>

      {/* Sticky Frosted Control Bar */}
      <div className="sticky top-16 z-20 border-y border-black/[0.06] bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              layoutId="catalogAudience"
              value={audience}
              onChange={setAudience}
              options={AUDIENCES.map((a) => ({ label: a, value: a }))}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="luminous-input rounded-full px-3.5 py-1.5 text-xs font-medium text-[#0A0B0E]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>

            <select
              value={designType}
              onChange={(e) => setDesignType(e.target.value)}
              className="luminous-input rounded-full px-3.5 py-1.5 text-xs font-medium text-[#0A0B0E]"
            >
              <option value="All">All Design Types</option>
              <option value="ORIGINAL">Original Surplus</option>
              <option value="MASTER COPY">Master Copy</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#86868B]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter SKU, brand, GSM..."
                className="luminous-input w-48 rounded-full py-1.5 pl-8 pr-3 text-xs"
              />
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="luminous-input rounded-full px-3 py-1.5 text-xs text-[#515154]"
            >
              <option value="newest">Newest Drops</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="moq_asc">Lowest MOQ</option>
              <option value="stock_desc">Largest Stock</option>
            </select>

            {/* Gallery vs B2B Spec-Table Mode Toggle */}
            <div className="inline-flex rounded-full bg-[#F5F5F7] p-0.5 border border-black/[0.04]">
              <button
                type="button"
                onClick={() => setViewMode('gallery')}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  viewMode === 'gallery' ? 'bg-white text-[#0A0B0E] shadow-xs' : 'text-[#6E6E73]'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                  viewMode === 'table' ? 'bg-white text-[#0A0B0E] shadow-xs' : 'text-[#6E6E73]'
                }`}
              >
                <Table2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Spec Table</span>
              </button>
            </div>

            {(audience !== 'All' || category !== 'All' || designType !== 'All' || search) && (
              <button
                type="button"
                onClick={resetAll}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Area */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="h-96 animate-pulse rounded-[26px] bg-[#F5F5F7]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Reveal className="mx-auto max-w-md rounded-3xl border border-black/[0.06] bg-[#FAFAFC] p-10 text-center">
            <SlidersHorizontal className="mx-auto h-7 w-7 text-[#86868B]" />
            <h3 className="mt-3 text-base font-semibold text-[#0A0B0E]">No stock lots match your filters</h3>
            <p className="mt-1 text-xs text-[#6E6E73]">
              Try resetting filters or request custom sourcing across our 600+ Dhaka factories.
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <PrismaticButton size="sm" variant="glass" onClick={resetAll}>
                Reset Filters
              </PrismaticButton>
              <Link href="/rfq">
                <PrismaticButton size="sm">Request Custom Lot</PrismaticButton>
              </Link>
            </div>
          </Reveal>
        ) : viewMode === 'gallery' ? (
          <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </Reveal>
        ) : (
          /* High-Efficiency B2B Spec-Table Mode */
          <Reveal className="overflow-x-auto rounded-3xl border border-black/[0.07] bg-white shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-black/[0.06] bg-[#FAFAFC] text-[11px] uppercase tracking-wider text-[#6E6E73]">
                <tr>
                  <th className="px-4 py-3.5">Lot / SKU</th>
                  <th className="px-4 py-3.5">Brand</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">GSM</th>
                  <th className="px-4 py-3.5">MOQ</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">MOQ Price</th>
                  <th className="px-4 py-3.5">Full Lot</th>
                  <th className="px-4 py-3.5">CBM/pc</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {products.map((p) => (
                  <tr key={p.sku} className="transition-colors hover:bg-[#FAFAFC]">
                    <td className="px-4 py-3">
                      <Link href={`/product/${p.sku}`} className="flex items-center gap-3">
                        <img src={p.images[0]} alt={p.title} className="h-10 w-10 rounded-lg object-cover bg-[#F5F5F7]" />
                        <div>
                          <p className="font-semibold text-[#0A0B0E] hover:text-indigo-600">{p.title}</p>
                          <p className="font-mono text-[10px] text-[#6E6E73]">{p.sku}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-[#0A0B0E]">{p.brand}</td>
                    <td className="px-4 py-3">
                      <SpecBadge tone={p.designType === 'ORIGINAL' ? 'original' : 'master'}>{p.designType}</SpecBadge>
                    </td>
                    <td className="px-4 py-3 font-mono text-[#515154]">{p.gsm}</td>
                    <td className="px-4 py-3 font-mono">{p.moq}</td>
                    <td className="px-4 py-3 font-mono">{p.availableStock.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono font-medium">{formatPrice(p.tiers[0].unitPrice)}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                      {formatPrice(p.tiers[p.tiers.length - 1].unitPrice)}
                    </td>
                    <td className="px-4 py-3 font-mono text-[#6E6E73]">{p.unitCbm}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => addToBag(p, p.moq)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#0A0B0E] px-3 py-1.5 text-[11px] font-medium text-white hover:bg-[#1F222A]"
                      >
                        <ShoppingBag className="h-3 w-3" /> Add
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        )}
      </section>
    </div>
  );
}
