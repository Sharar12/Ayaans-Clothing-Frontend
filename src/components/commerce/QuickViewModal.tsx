'use client';

import React from 'react';
import Link from 'next/link';
import { X, ShoppingBag, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { GlassModal, PrismaticButton, SpecBadge } from '@/design-system/primitives';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, formatPrice, addToBag, addToRfq } = useApp();
  if (!quickViewProduct) return null;

  const p = quickViewProduct;

  return (
    <GlassModal open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} maxWidth="max-w-3xl">
      <div className="relative grid grid-cols-1 gap-6 p-6 md:grid-cols-12">
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          className="absolute right-4 top-4 cursor-pointer rounded-full bg-[#F5F5F7] p-2 text-[#515154] hover:text-[#0A0B0E]"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="md:col-span-5">
          <img
            src={p.images[0]}
            alt={p.title}
            className="aspect-[4/5] w-full rounded-2xl object-cover bg-[#F5F5F7]"
          />
        </div>

        <div className="flex flex-col justify-between md:col-span-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <SpecBadge tone={p.designType === 'ORIGINAL' ? 'original' : 'master'}>{p.designType}</SpecBadge>
              <SpecBadge tone="emerald">
                <ShieldCheck className="h-3 w-3" /> {p.aqlStandard}
              </SpecBadge>
            </div>
            <p className="mt-3 font-mono text-xs text-[#6E6E73]">
              {p.brand} · {p.sku}
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#0A0B0E]">{p.title}</h3>
            <p className="mt-2 text-xs leading-relaxed text-[#515154]">{p.fabric}</p>

            {/* Tiers Table */}
            <div className="mt-4 space-y-1.5">
              {p.tiers.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl bg-[#FAFAFC] px-3 py-2 text-xs border border-black/[0.05]"
                >
                  <span className="font-medium text-[#1D1D1F]">
                    {t.label} <span className="font-mono text-[#6E6E73]">({t.minQty}+ pcs)</span>
                  </span>
                  <span className="font-mono font-semibold text-[#0A0B0E]">{formatPrice(t.unitPrice)}/pc</span>
                </div>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px] text-[#515154]">
              <div className="rounded-xl bg-[#F5F5F7] p-2 text-center">MOQ: {p.moq}</div>
              <div className="rounded-xl bg-[#F5F5F7] p-2 text-center">Stock: {p.availableStock}</div>
              <div className="rounded-xl bg-[#F5F5F7] p-2 text-center">{p.gsm}</div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <PrismaticButton
              className="flex-1"
              onClick={() => {
                addToBag(p, p.moq);
                setQuickViewProduct(null);
              }}
            >
              <ShoppingBag className="h-4 w-4" /> Add MOQ ({p.moq})
            </PrismaticButton>
            <PrismaticButton
              variant="glass"
              onClick={() => {
                addToRfq(p, p.moq);
                setQuickViewProduct(null);
              }}
            >
              Add to RFQ
            </PrismaticButton>
            <Link
              href={`/product/${p.sku}`}
              onClick={() => setQuickViewProduct(null)}
              className="inline-flex items-center gap-1 px-2 text-xs font-medium text-indigo-600 hover:underline"
            >
              Full Spec Studio <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </GlassModal>
  );
}
