'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, Ship, Plane, ArrowRight, MessageCircle, FileSpreadsheet } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { PrismaticButton, SegmentedControl } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';

export function BagContainerDrawer() {
  const {
    bag,
    rfqList,
    bagDrawerOpen,
    bagDrawerTab,
    openBagDrawer,
    closeBagDrawer,
    updateBagQty,
    removeFromBag,
    removeFromRfq,
    convertBagToRfq,
    totals,
    formatPrice,
    deliverTo,
  } = useApp();

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801620853502';
  const waSummary = encodeURIComponent(
    `Hello Ayaan Export Desk,\nWholesale Inquiry (Deliver to: ${deliverTo}):\n` +
      bag
        .map((i) => `- ${i.product.sku} (${i.product.brand}): ${i.quantity} pcs @ $${i.unitPrice}/pc`)
        .join('\n') +
      `\nEst. Total: $${totals.subtotalUsd.toFixed(2)} | CBM: ${totals.totalCbm.toFixed(3)} m³ | Weight: ${totals.totalWeightKg.toFixed(1)} KG`
  );

  return (
    <AnimatePresence>
      {bagDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBagDrawer}
            className="fixed inset-0 bg-white/50 backdrop-blur-md"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.36, ease: APPLE_EASE }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-black/[0.08] bg-white/95 backdrop-blur-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4">
              <SegmentedControl
                layoutId="drawerTab"
                value={bagDrawerTab}
                onChange={(v) => openBagDrawer(v)}
                options={[
                  { label: `Wholesale Bag (${bag.length})`, value: 'bag' },
                  { label: `RFQ List (${rfqList.length})`, value: 'rfq' },
                ]}
              />
              <button
                type="button"
                onClick={closeBagDrawer}
                className="cursor-pointer rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* LIVE CONTAINER LOAD OPTIMIZER (B2B Signature Feature) */}
            {bagDrawerTab === 'bag' && (
              <div className="border-b border-black/[0.06] bg-[#FAFAFC] px-6 py-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-[#0A0B0E]">
                    {totals.totalCbm >= 2 ? (
                      <Ship className="h-3.5 w-3.5 text-indigo-600" />
                    ) : (
                      <Plane className="h-3.5 w-3.5 text-sky-500" />
                    )}
                    {totals.recommendedFreight}
                  </span>
                  <span className="font-mono text-[11px] text-[#515154]">
                    {totals.totalCbm.toFixed(3)} / {totals.containerTargetCbm} m³
                  </span>
                </div>

                {/* Iridescent Fill Bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(totals.totalCbm > 0 ? 4 : 0, totals.containerFillPercent)}%` }}
                    transition={{ duration: 0.5, ease: APPLE_EASE }}
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400"
                  />
                </div>

                <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-[#6E6E73]">
                  <span>Gross Wt: {totals.totalWeightKg.toFixed(1)} KG</span>
                  <span>Dest: {deliverTo}</span>
                </div>
              </div>
            )}

            {/* Items Scroll List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {bagDrawerTab === 'bag' ? (
                bag.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <p className="text-sm font-medium text-[#0A0B0E]">Your wholesale bag is empty</p>
                    <p className="mt-1 max-w-xs text-xs text-[#6E6E73]">
                      Combine multiple stock lots to calculate live CBM, gross weight, and container optimization.
                    </p>
                    <Link href="/catalog" onClick={closeBagDrawer} className="mt-4">
                      <PrismaticButton size="sm">Explore Ready Lots</PrismaticButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bag.map((item) => (
                      <div
                        key={item.product.sku}
                        className="rounded-2xl border border-black/[0.06] bg-white p-3.5 shadow-xs"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="h-16 w-16 rounded-xl object-cover bg-[#F5F5F7]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/product/${item.product.sku}`}
                                onClick={closeBagDrawer}
                                className="truncate text-xs font-semibold text-[#0A0B0E] hover:text-indigo-600"
                              >
                                {item.product.title}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeFromBag(item.product.sku)}
                                className="cursor-pointer text-[#86868B] hover:text-rose-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="font-mono text-[10px] text-[#6E6E73]">
                              {item.product.brand} · {item.tierLabel} · {formatPrice(item.unitPrice)}/pc
                            </p>

                            <div className="mt-2.5 flex items-center justify-between">
                              <div className="inline-flex items-center gap-1 rounded-full bg-[#F5F5F7] p-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateBagQty(item.product.sku, item.quantity - 10)}
                                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-[#0A0B0E] shadow-2xs"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="min-w-[44px] text-center font-mono text-xs font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateBagQty(item.product.sku, item.quantity + 10)}
                                  className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-white text-[#0A0B0E] shadow-2xs"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              <p className="font-mono text-xs font-semibold text-[#0A0B0E]">
                                {formatPrice(item.quantity * item.unitPrice)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : rfqList.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-[#0A0B0E]">No SKUs queued for quotation</p>
                  <p className="mt-1 max-w-xs text-xs text-[#6E6E73]">
                    Add ready lots or submit custom OEM specs directly in the RFQ Studio.
                  </p>
                  <Link href="/rfq" onClick={closeBagDrawer} className="mt-4">
                    <PrismaticButton size="sm">Open RFQ Studio</PrismaticButton>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {rfqList.map((item) => (
                    <div
                      key={item.product.sku}
                      className="flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-3"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="truncate text-xs font-semibold text-[#0A0B0E]">{item.product.title}</p>
                        <p className="font-mono text-[11px] text-[#6E6E73]">
                          {item.product.sku} · {item.quantity} pcs @ {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromRfq(item.product.sku)}
                        className="cursor-pointer rounded-full p-1.5 text-[#86868B] hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Totals & Actions */}
            <div className="border-t border-black/[0.06] bg-white p-6 space-y-3">
              {bagDrawerTab === 'bag' && bag.length > 0 && (
                <>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-[#6E6E73]">Est. FOB Subtotal ({totals.pieces.toLocaleString()} pcs)</span>
                    <span className="font-mono text-lg font-semibold text-[#0A0B0E]">
                      {formatPrice(totals.subtotalUsd)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={convertBagToRfq}
                      className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-black/10 bg-[#FAFAFC] py-2.5 text-xs font-medium text-[#0A0B0E] hover:bg-[#F0F0F5]"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" />
                      Sync to RFQ
                    </button>
                    <a
                      href={`https://wa.me/${waNumber}?text=${waSummary}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-500 py-2.5 text-xs font-semibold text-white hover:bg-emerald-600"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp Bag
                    </a>
                  </div>
                  <Link href="/rfq?source=bag" onClick={closeBagDrawer} className="block">
                    <PrismaticButton className="w-full" prismatic>
                      Request Proforma Invoice <ArrowRight className="h-4 w-4" />
                    </PrismaticButton>
                  </Link>
                </>
              )}

              {bagDrawerTab === 'rfq' && (
                <Link href="/rfq" onClick={closeBagDrawer} className="block">
                  <PrismaticButton className="w-full" prismatic>
                    Complete Formal RFQ ({rfqList.length} Lots) <ArrowRight className="h-4 w-4" />
                  </PrismaticButton>
                </Link>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
