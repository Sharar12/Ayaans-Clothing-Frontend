'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { api } from '@/services/api';
import { portalApi } from '@/services/portalApi';
import type { Product } from '@/types';
import type { PortalOrderDetail } from '@/types/portal';
import { ProductCard } from '@/components/commerce/ProductCard';
import { PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';

export default function SavedAndReorderPage() {
  const { wishlist, formatPrice, notify } = useApp();
  const [tab, setTab] = useState<'saved' | 'reorder'>('saved');
  const [savedProducts, setSavedProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<PortalOrderDetail[]>([]);

  useEffect(() => {
    api.getProducts().then((all) => setSavedProducts(all.filter((p) => wishlist.includes(p.sku))));
    portalApi.getOrders().then(setOrders);
  }, [wishlist]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Fast Replenishment</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Saved Stock Lots &amp; 1-Click Reorder
          </h1>
        </div>
        <SegmentedControl
          layoutId="savedTab"
          value={tab}
          onChange={setTab}
          options={[
            { label: `Saved Lots (${savedProducts.length})`, value: 'saved' },
            { label: `Past Order Templates (${orders.length})`, value: 'reorder' },
          ]}
        />
      </div>

      {tab === 'saved' ? (
        savedProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {savedProducts.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] border border-black/[0.06] bg-[#FAFAFC] p-12 text-center">
            <p className="text-base font-semibold text-[#0A0B0E]">Your saved lots board is empty</p>
            <p className="mt-1 text-xs text-[#6E6E73]">
              Tap the heart icon on any stock lot in the catalog to monitor stock depletion here.
            </p>
            <Link href="/catalog" className="mt-5 inline-block">
              <PrismaticButton size="sm">
                Explore Live Catalog <ArrowRight className="h-3.5 w-3.5" />
              </PrismaticButton>
            </Link>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="ambient-card flex flex-col justify-between gap-4 rounded-[26px] p-6 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-indigo-600">{ord.id}</span>
                  <SpecBadge tone="neutral">{ord.type}</SpecBadge>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-[#0A0B0E]">
                  {ord.items.map((i) => `${i.brand} (${i.quantity})`).join(' + ')}
                </p>
                <p className="mt-1 font-mono text-xs text-[#6E6E73]">
                  {ord.totalPieces.toLocaleString()} pcs · {ord.totalCbm} m³ · Last FOB {formatPrice(ord.totalUsd)}
                </p>
              </div>
              <PrismaticButton
                size="sm"
                prismatic
                onClick={() => notify(`Copied ${ord.id} garment mix into fresh Reorder RFQ!`)}
              >
                <RefreshCw className="h-3.5 w-3.5" /> Repeat Order / Similar Mix
              </PrismaticButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
