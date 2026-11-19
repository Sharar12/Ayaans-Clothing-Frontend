'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Copy,
  Heart,
  ShieldCheck,
  ShoppingBag,
  FileText,
  MessageCircle,
  Printer,
  Play,
  Package,
  Layers,
  Box,
} from 'lucide-react';
import type { Product } from '@/types';
import { resolveTierForQty, useApp } from '@/store/AppContext';
import { AmbientAura, PrismaticButton, Reveal, SpecBadge, VideoBackground } from '@/design-system/primitives';
import { ProductCard } from '@/components/commerce/ProductCard';

export function ProductStudioView({ product, related }: { product: Product; related: Product[] }) {
  const { formatPrice, addToBag, addToRfq, toggleWishlist, wishlist, notify } = useApp();
  const [activeMedia, setActiveMedia] = useState<number | 'video'>(0);
  const [quantity, setQuantity] = useState(product.moq);
  const [copied, setCopied] = useState(false);

  const isSaved = wishlist.includes(product.sku);
  const activeTier = useMemo(() => resolveTierForQty(product, quantity), [product, quantity]);

  const subtotalUsd = quantity * activeTier.unitPrice;
  const estCbm = quantity * product.unitCbm;
  const estWeightKg = quantity * product.unitWeightKg;
  const estCartons = Math.ceil(quantity / product.pcsPerCarton);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801620853502';
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Hello Ayaan Clothing, I am inquiring about SKU ${product.sku} (${product.brand} - ${product.title}). Quantity: ${quantity} pcs (${activeTier.label} @ $${activeTier.unitPrice}/pc). Est CBM: ${estCbm.toFixed(3)} m³.`
  )}`;

  const copySku = () => {
    navigator.clipboard?.writeText(product.sku);
    setCopied(true);
    notify(`Copied SKU ${product.sku}`);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="relative bg-white pb-24">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th.mp4"
        topOnly
        height="320px"
        opacity={0.33}
      />
      <AmbientAura variant="subtle" />

      <div className="relative mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Top Breadcrumb & SKU Bar */}
        <Reveal className="mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6E6E73]">
          <nav className="flex items-center gap-1.5">
            <Link href="/catalog" className="hover:text-[#0A0B0E]">Catalog</Link>
            <span>/</span>
            <Link href={`/catalog?audience=${product.audience}`} className="hover:text-[#0A0B0E]">{product.audience}</Link>
            <span>/</span>
            <Link href={`/brands/${product.brandSlug}`} className="hover:text-[#0A0B0E]">{product.brand}</Link>
            <span>/</span>
            <span className="font-medium text-[#0A0B0E]">{product.category}</span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={copySku}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#F5F5F7] px-3 py-1 font-mono text-[11px] text-[#0A0B0E] hover:bg-[#EAEAEF]"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              {product.sku}
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-black/[0.08] bg-white px-3 py-1 text-[11px] font-medium text-[#515154] hover:text-[#0A0B0E]"
            >
              <Printer className="h-3 w-3" /> Spec PDF
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.sku)}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-black/[0.08] bg-white"
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : 'text-[#515154]'}`} />
            </button>
          </div>
        </Reveal>

        {/* Main 55 / 45 Asymmetric Studio Split */}
        <Reveal delay={0.1} className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Column: Studio Media + Technical Spec Bento */}
          <div className="space-y-6 lg:col-span-7">
            <div className="relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-[#F6F7FA]">
              {activeMedia === 'video' ? (
                <div className="flex aspect-[4/4.3] flex-col items-center justify-center bg-gradient-to-br from-[#F5F5F7] via-indigo-50/40 to-sky-50/50 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0A0B0E] text-white shadow-lg">
                    <Play className="ml-0.5 h-6 w-6 fill-white" />
                  </div>
                  <p className="mt-4 text-base font-semibold text-[#0A0B0E]">
                    {product.videoPreviewLabel || 'Warehouse QC Inspection Reel'}
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-[#6E6E73]">
                    Live HD inspection footage from our Uttara, Dhaka warehouse is sent immediately upon WhatsApp or RFQ
                    verification for this lot.
                  </p>
                  <a href={waHref} target="_blank" rel="noreferrer" className="mt-5">
                    <PrismaticButton size="sm">Request Full HD Warehouse Video</PrismaticButton>
                  </a>
                </div>
              ) : (
                <img
                  src={product.images[activeMedia] || product.images[0]}
                  alt={product.title}
                  className="aspect-[4/4.3] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                />
              )}

              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <SpecBadge tone={product.designType === 'ORIGINAL' ? 'original' : 'master'}>
                  {product.designType}
                </SpecBadge>
                <SpecBadge tone="glass">{product.arrivedAgo}</SpecBadge>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveMedia(i)}
                  className={`h-20 w-20 cursor-pointer overflow-hidden rounded-2xl border-2 transition-all ${
                    activeMedia === i ? 'border-[#0A0B0E] shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="h-full w-full object-cover" />
                </button>
              ))}
              <button
                type="button"
                onClick={() => setActiveMedia('video')}
                className={`flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 bg-[#F5F5F7] text-[11px] font-medium transition-all ${
                  activeMedia === 'video' ? 'border-indigo-500 text-indigo-700' : 'border-transparent text-[#515154]'
                }`}
              >
                <Play className="h-4 w-4" />
                QC Video
              </button>
            </div>

            {/* Technical Specifications Bento Grid */}
            <div className="rounded-[26px] border border-black/[0.07] bg-[#FAFAFC] p-6">
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0A0B0E]">
                Technical Garment &amp; Export Specifications
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#515154]">{product.description}</p>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4 border border-black/[0.05]">
                  <p className="text-[11px] text-[#6E6E73]">Fabric &amp; Composition</p>
                  <p className="mt-1 text-xs font-semibold text-[#0A0B0E]">{product.fabric}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 border border-black/[0.05]">
                  <p className="text-[11px] text-[#6E6E73]">Fabric Weight &amp; QC</p>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#0A0B0E]">
                    {product.gsm} · {product.aqlStandard}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4 border border-black/[0.05]">
                  <p className="text-[11px] text-[#6E6E73]">Label Compliance Status</p>
                  <p className="mt-1 text-xs font-semibold text-[#0A0B0E]">{product.labelStatus}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 border border-black/[0.05]">
                  <p className="text-[11px] text-[#6E6E73]">Master Carton Packing</p>
                  <p className="mt-1 font-mono text-xs font-semibold text-[#0A0B0E]">
                    {product.pcsPerCarton} pcs / export carton
                  </p>
                </div>
              </div>

              {/* Sizes & Colorways */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] pt-4">
                <div>
                  <p className="mb-1.5 text-[11px] text-[#6E6E73]">Assorted Sizes</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.sizes.map((s) => (
                      <span key={s} className="rounded-lg bg-white px-2.5 py-1 font-mono text-[11px] font-medium border border-black/[0.06]">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[11px] text-[#6E6E73]">Colorways Included</p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((c) => (
                      <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] border border-black/[0.06]">
                        <span className="h-2.5 w-2.5 rounded-full border border-black/15" style={{ backgroundColor: c.hex }} />
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Transparency Assortment Callout */}
              <div className="mt-4 rounded-2xl bg-indigo-50/60 p-3.5 text-xs text-indigo-950 border border-indigo-200/40">
                <strong className="font-semibold">Export Lot Assortment Note:</strong> {product.assortmentNote}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky B2B Order & Logistics Engine */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-5 rounded-[28px] border border-black/[0.08] bg-white p-6 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.1)]">
              <div>
                <div className="flex items-center justify-between">
                  <Link href={`/brands/${product.brandSlug}`} className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                    {product.brand}
                  </Link>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" /> Ready in Dhaka
                  </span>
                </div>
                <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E]">
                  {product.title}
                </h1>
                <p className="mt-1.5 font-mono text-xs text-[#6E6E73]">
                  MOQ: {product.moq} pcs · Available Stock: {product.availableStock.toLocaleString()} pcs
                </p>
              </div>

              {/* Interactive Tiered Pricing Matrix */}
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6E73]">
                  Volume Pricing Tiers (Click to Select)
                </p>
                {product.tiers.map((tier) => {
                  const selected = activeTier.id === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setQuantity(tier.minQty)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                        selected
                          ? 'prismatic-ring border-transparent bg-white shadow-sm'
                          : 'border-black/[0.07] bg-[#FAFAFC] hover:bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#0A0B0E]">{tier.label}</span>
                          {tier.savingsPercent > 0 && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-semibold text-emerald-700">
                              Save {tier.savingsPercent}%
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 font-mono text-[11px] text-[#6E6E73]">
                          {tier.maxQty ? `${tier.minQty} – ${tier.maxQty} pcs` : `${tier.minQty.toLocaleString()} pcs (Full Lot)`}
                        </p>
                      </div>
                      <p className="font-mono text-base font-semibold text-[#0A0B0E]">
                        {formatPrice(tier.unitPrice)}
                        <span className="text-[11px] font-normal text-[#6E6E73]">/pc</span>
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Quantity Stepper & Quick Presets */}
              <div className="rounded-2xl bg-[#F5F5F7] p-4">
                <div className="flex items-center justify-between">
                  <label htmlFor="qty-input" className="text-xs font-semibold text-[#0A0B0E]">
                    Order Quantity (PCS)
                  </label>
                  <input
                    id="qty-input"
                    type="number"
                    min={product.moq}
                    max={product.availableStock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(product.moq, Math.min(product.availableStock, Number(e.target.value) || product.moq))
                      )
                    }
                    className="luminous-input w-28 rounded-xl px-3 py-1.5 text-right font-mono text-sm font-semibold text-[#0A0B0E]"
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {[product.moq, Math.min(250, product.availableStock), Math.min(500, product.availableStock), product.availableStock]
                    .filter((v, i, arr) => arr.indexOf(v) === i && v >= product.moq)
                    .map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setQuantity(preset)}
                        className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[11px] transition-colors ${
                          quantity === preset ? 'bg-[#0A0B0E] text-white' : 'bg-white text-[#515154] hover:text-[#0A0B0E]'
                        }`}
                      >
                        {preset === product.availableStock ? `Full (${preset})` : `${preset} pcs`}
                      </button>
                    ))}
                </div>
              </div>

              {/* Live Logistics Telemetry Strip */}
              <div className="grid grid-cols-2 gap-2.5 font-mono">
                <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-[#6E6E73]">Est. FOB Total</p>
                  <p className="mt-0.5 text-base font-semibold text-[#0A0B0E]">{formatPrice(subtotalUsd)}</p>
                </div>
                <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
                  <p className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider text-[#6E6E73]">
                    <Box className="h-3 w-3 text-indigo-500" /> Est. Volume (CBM)
                  </p>
                  <p className="mt-0.5 text-base font-semibold text-[#0A0B0E]">{estCbm.toFixed(3)} m³</p>
                </div>
                <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
                  <p className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider text-[#6E6E73]">
                    <Layers className="h-3 w-3 text-sky-500" /> Gross Weight
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0A0B0E]">{estWeightKg.toFixed(1)} KG</p>
                </div>
                <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
                  <p className="flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider text-[#6E6E73]">
                    <Package className="h-3 w-3 text-emerald-500" /> Master Cartons
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0A0B0E]">~{estCartons} ctns</p>
                </div>
              </div>

              {/* Action Stack */}
              <div className="space-y-2.5 pt-1">
                <PrismaticButton size="lg" prismatic className="w-full" onClick={() => addToBag(product, quantity)}>
                  <ShoppingBag className="h-4 w-4" /> Add {quantity.toLocaleString()} PCS to Wholesale Bag
                </PrismaticButton>
                <div className="grid grid-cols-2 gap-2">
                  <PrismaticButton variant="glass" onClick={() => addToRfq(product, quantity)}>
                    <FileText className="h-3.5 w-3.5" /> Add to RFQ
                  </PrismaticButton>
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp SKU
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Related Lots Carousel */}
        {related.length > 0 && (
          <Reveal delay={0.15} className="mt-20 border-t border-black/[0.06] pt-14">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-[#6E6E73]">Freight Consolidation</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E]">
                  Combine With Ready Lots to Optimize CBM
                </h2>
              </div>
              <Link href="/catalog" className="text-xs font-medium text-indigo-600 hover:underline">
                View All Lots →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.sku} product={item} />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
