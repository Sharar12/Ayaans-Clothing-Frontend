'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { GlassModal, PrismaticButton } from '@/design-system/primitives';

export function CompareDock() {
  const { compareList, toggleCompare, clearCompare, formatPrice, addToBag } = useApp();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="glass-surface fixed bottom-5 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full px-4 py-2"
          >
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0B0E]">
              <GitCompare className="h-3.5 w-3.5 text-indigo-600" />
              Compare ({compareList.length}/4)
            </span>
            <div className="hidden items-center gap-1.5 sm:flex">
              {compareList.map((p) => (
                <button
                  key={p.sku}
                  type="button"
                  onClick={() => toggleCompare(p)}
                  title={`Remove ${p.title}`}
                  className="group relative h-8 w-8 cursor-pointer overflow-hidden rounded-full border border-black/10"
                >
                  <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <X className="h-3 w-3 text-white" />
                  </span>
                </button>
              ))}
            </div>
            <PrismaticButton size="sm" onClick={() => setModalOpen(true)}>
              Compare Specs
            </PrismaticButton>
            <button
              type="button"
              onClick={clearCompare}
              className="cursor-pointer rounded-full p-1 text-[#6E6E73] hover:text-[#0A0B0E]"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassModal open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="max-w-5xl">
        <div className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-[#0A0B0E]">Side-by-Side B2B Lot Comparison</h3>
              <p className="text-xs text-[#6E6E73]">Evaluate landed margins, GSM, MOQ, and CBM volume instantly.</p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="cursor-pointer rounded-full bg-[#F5F5F7] p-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06]">
                  <th className="py-3 pr-4 font-semibold text-[#6E6E73]">Specification</th>
                  {compareList.map((p) => (
                    <th key={p.sku} className="min-w-[180px] p-3">
                      <img src={p.images[0]} alt={p.title} className="mb-2 h-24 w-full rounded-xl object-cover" />
                      <p className="font-semibold text-[#0A0B0E]">{p.title}</p>
                      <p className="font-mono text-[10px] text-[#6E6E73]">{p.brand} · {p.sku}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05] font-mono">
                {[
                  { label: 'Design Type', fn: (p: (typeof compareList)[0]) => p.designType },
                  { label: 'Standard Unit Price', fn: (p: (typeof compareList)[0]) => formatPrice(p.tiers[0].unitPrice) },
                  { label: 'Full Stock Unit Price', fn: (p: (typeof compareList)[0]) => formatPrice(p.tiers[2].unitPrice) },
                  { label: 'MOQ / Available', fn: (p: (typeof compareList)[0]) => `${p.moq} / ${p.availableStock} pcs` },
                  { label: 'GSM / Weight', fn: (p: (typeof compareList)[0]) => `${p.gsm} · ${p.unitWeightKg} KG/pc` },
                  { label: 'Unit CBM', fn: (p: (typeof compareList)[0]) => `${p.unitCbm} m³` },
                  { label: 'Label Status', fn: (p: (typeof compareList)[0]) => p.labelStatus },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-3 pr-4 font-sans font-medium text-[#6E6E73]">{row.label}</td>
                    {compareList.map((p) => (
                      <td key={p.sku} className="p-3 text-[#0A0B0E]">{row.fn(p)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="py-3 pr-4 font-sans font-medium text-[#6E6E73]">Action</td>
                  {compareList.map((p) => (
                    <td key={p.sku} className="p-3">
                      <PrismaticButton size="sm" onClick={() => addToBag(p, p.moq)}>
                        Add MOQ
                      </PrismaticButton>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </GlassModal>
    </>
  );
}
