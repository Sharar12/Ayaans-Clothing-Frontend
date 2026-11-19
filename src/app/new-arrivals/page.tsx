'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, MessageCircle, ShoppingBag, CheckCircle2, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import type { Product } from '@/types';
import { useApp } from '@/store/AppContext';
import { AmbientAura, PrismaticButton, Reveal, SpecBadge, VideoBackground } from '@/design-system/primitives';

export default function NewArrivalsPage() {
  const { formatPrice, addToBag, notify } = useApp();
  const [drops, setDrops] = useState<Product[]>([]);
  const [broadcastEmail, setBroadcastEmail] = useState('');
  const [broadcastWa, setBroadcastWa] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    api.getProducts({ isNewArrival: true }).then(setDrops);
  }, []);

  const totalNewPieces = drops.reduce((sum, p) => sum + p.availableStock, 0);
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801620853502';

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastEmail && !broadcastWa) return;
    setSubscribed(true);
    notify('Subscribed to Daily Dhaka Warehouse Arrival Broadcasts');
  };

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th (1).mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="hero" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        {/* Live Feed Header */}
        <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-medium text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Updated Today · Uttara Central Warehouse, Dhaka
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#0A0B0E] sm:text-5xl">
              Daily Warehouse Drops
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#515154]">
              Fresh export factory surplus arrives daily and sells out fast. Inspect live remaining quantities and lock
              cartons immediately via Wholesale Bag or WhatsApp Desk.
            </p>
          </div>

          <div className="glass-surface rounded-2xl px-5 py-3.5 font-mono">
            <p className="text-[10px] uppercase tracking-wider text-[#6E6E73]">Fresh Stock Ready Today</p>
            <p className="text-2xl font-semibold text-[#0A0B0E]">{totalNewPieces.toLocaleString()} PCS</p>
          </div>
        </Reveal>

        {/* Video-First Large Drop Cards */}
        <Reveal delay={0.1} className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {drops.map((p) => {
            const pctLeft = Math.round((p.availableStock / p.initialStock) * 100);
            const fullLotPrice = p.tiers[p.tiers.length - 1].unitPrice;
            const waText = encodeURIComponent(
              `URGENT LOT LOCK: SKU ${p.sku} (${p.brand} - ${p.title}). Please share HD warehouse video & reserve availability.`
            );

            return (
              <article key={p.sku} className="ambient-card group flex flex-col overflow-hidden rounded-[28px] bg-white">
                <div className="relative aspect-[4/3.6] overflow-hidden bg-[#F5F5F7]">
                  <Link href={`/product/${p.sku}`}>
                    <img
                      src={p.images[0]}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                  <div className="absolute left-3.5 top-3.5 flex gap-2">
                    <SpecBadge tone="glass">{p.arrivedAgo}</SpecBadge>
                    <SpecBadge tone={p.designType === 'ORIGINAL' ? 'original' : 'master'}>{p.designType}</SpecBadge>
                  </div>
                  <Link
                    href={`/product/${p.sku}`}
                    className="glass-pill absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold text-[#0A0B0E]"
                  >
                    <Play className="h-3 w-3 fill-[#0A0B0E]" />
                    {p.videoPreviewLabel || 'Inspect Warehouse Video'}
                  </Link>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between font-mono text-[11px] text-[#6E6E73]">
                    <span className="font-sans font-semibold uppercase tracking-wider text-indigo-600">{p.brand}</span>
                    <span>{p.gsm} · MOQ {p.moq}</span>
                  </div>

                  <Link
                    href={`/product/${p.sku}`}
                    className="mt-1.5 text-base font-semibold tracking-[-0.015em] text-[#0A0B0E] hover:text-indigo-600"
                  >
                    {p.title}
                  </Link>

                  {/* Scarcity Stock Bar */}
                  <div className="mt-4 rounded-2xl bg-[#FAFAFC] p-3 border border-black/[0.05]">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-[#515154]">Remaining Stock</span>
                      <span className="font-semibold text-[#0A0B0E]">
                        {p.availableStock.toLocaleString()} / {p.initialStock.toLocaleString()} pcs
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400"
                        style={{ width: `${pctLeft}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#86868B]">Full Stock Takeover</p>
                      <p className="font-mono text-xl font-semibold text-[#0A0B0E]">
                        {formatPrice(fullLotPrice)}
                        <span className="text-xs font-normal text-[#6E6E73]">/pc</span>
                      </p>
                    </div>
                    <p className="font-mono text-xs text-[#6E6E73]">MOQ {formatPrice(p.tiers[0].unitPrice)}/pc</p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2 pt-2">
                    <PrismaticButton size="sm" onClick={() => addToBag(p, p.moq)}>
                      <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
                    </PrismaticButton>
                    <a
                      href={`https://wa.me/${waNumber}?text=${waText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> Lock Lot
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </Reveal>

        {/* Daily Buyer Broadcast Opt-In Card */}
        <Reveal delay={0.15} className="relative mt-16 overflow-hidden rounded-[32px] border border-black/[0.07] bg-[#FAFAFC] p-8 sm:p-12">
          <AmbientAura variant="cool" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <SpecBadge tone="glass">
                <Sparkles className="h-3 w-3 text-indigo-500" /> Priority Buyer Broadcast
              </SpecBadge>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
                Receive Daily Dhaka Arrivals Before Public Listing.
              </h2>
              <p className="mt-2 text-sm text-[#515154]">
                Get morning WhatsApp &amp; email stock sheets featuring live packing lists, GSM specs, and warehouse
                walkthrough videos.
              </p>
            </div>

            <div className="lg:col-span-6">
              {subscribed ? (
                <div className="glass-surface flex items-center gap-3 rounded-2xl p-5 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  You are enrolled in Ayaan Clothing&apos;s Daily Dhaka Arrival Broadcast. Expect your first stock sheet
                  shortly!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="glass-surface grid grid-cols-1 gap-3 rounded-3xl p-5 sm:grid-cols-2">
                  <input
                    type="email"
                    required
                    value={broadcastEmail}
                    onChange={(e) => setBroadcastEmail(e.target.value)}
                    placeholder="Business Email"
                    className="luminous-input rounded-2xl px-4 py-2.5 text-xs"
                  />
                  <input
                    type="text"
                    value={broadcastWa}
                    onChange={(e) => setBroadcastWa(e.target.value)}
                    placeholder="WhatsApp (+Country Code)"
                    className="luminous-input rounded-2xl px-4 py-2.5 text-xs"
                  />
                  <PrismaticButton type="submit" prismatic className="sm:col-span-2">
                    Join Priority Buyer Broadcast
                  </PrismaticButton>
                </form>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
