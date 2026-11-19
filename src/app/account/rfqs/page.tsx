'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, MessageCircle, Plus, FileText } from 'lucide-react';
import { portalApi } from '@/services/portalApi';
import type { PortalRfqRecord } from '@/types/portal';
import { useApp } from '@/store/AppContext';
import { PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';

const OEM_STAGES = ['Tech Pack', 'Lab Dip', 'Proto Sample (DHL)', 'PP Sample', 'Bulk Line'];

export default function AccountRfqsPage() {
  const { formatPrice, notify } = useApp();
  const [rfqs, setRfqs] = useState<PortalRfqRecord[]>([]);
  const [filter, setFilter] = useState<'all' | 'quote_ready' | 'negotiating' | 'converted'>('all');
  const [counterOpenId, setCounterOpenId] = useState<string | null>(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');

  useEffect(() => {
    portalApi.getRfqs().then(setRfqs);
  }, []);

  const filtered = rfqs.filter((r) => filter === 'all' || r.status === filter);

  const handleAccept = async (id: string) => {
    const res = await portalApi.acceptRfq(id);
    setRfqs(res.rfqs);
    notify(`Quote accepted! Stock reserved under Order ${res.newOrderId} & Proforma generated.`);
  };

  const handleCounter = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    const updated = await portalApi.submitCounterOffer(id, Number(counterPrice) || 5.0, counterNote || 'Please review target FOB rate.');
    setRfqs(updated);
    setCounterOpenId(null);
    setCounterPrice('');
    setCounterNote('');
    notify(`Counter-offer transmitted to Dhaka Merchandising Desk for ${id}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Price &amp; Sampling Desk</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Active RFQs, Counter-Offers &amp; OEM Sampling
          </h1>
        </div>
        <Link href="/rfq">
          <PrismaticButton size="sm" prismatic>
            <Plus className="h-3.5 w-3.5" /> Start New RFQ
          </PrismaticButton>
        </Link>
      </div>

      <SegmentedControl
        layoutId="rfqFilter"
        value={filter}
        onChange={setFilter}
        options={[
          { label: 'All Quotes', value: 'all' },
          { label: 'Quote Ready', value: 'quote_ready' },
          { label: 'Negotiating', value: 'negotiating' },
          { label: 'Converted', value: 'converted' },
        ]}
      />

      <div className="space-y-5">
        {filtered.map((rfq) => {
          const isReady = rfq.status === 'quote_ready';
          return (
            <div
              key={rfq.id}
              className={`ambient-card rounded-[28px] p-6 ${isReady ? 'prismatic-ring bg-white' : 'bg-white'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-indigo-600">{rfq.id}</span>
                    <SpecBadge tone={rfq.sourcingType === 'Custom OEM' ? 'original' : 'neutral'}>
                      {rfq.sourcingType}
                    </SpecBadge>
                    <SpecBadge tone={rfq.status === 'converted' ? 'emerald' : isReady ? 'original' : 'glass'}>
                      {rfq.status.replace('_', ' ').toUpperCase()}
                    </SpecBadge>
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-[#0A0B0E]">{rfq.title}</h2>
                  <p className="mt-1 font-mono text-xs text-[#6E6E73]">
                    {rfq.quantity.toLocaleString()} pcs · {rfq.estCbm} m³ · {rfq.incoterm} · {rfq.labelStatus}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-[#86868B]">Ayaan Formal Offer</p>
                  <p className="font-mono text-2xl font-semibold text-[#0A0B0E]">
                    {formatPrice(rfq.offeredUnitPriceUsd)}
                    <span className="text-xs font-normal text-[#6E6E73]">/pc</span>
                  </p>
                  <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[11px] text-amber-700">
                    <Clock className="h-3 w-3" /> Valid {rfq.validHoursLeft}h
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[#FAFAFC] p-4 text-xs text-[#515154] border border-black/[0.05]">
                <strong className="text-[#0A0B0E]">Dhaka Merchandiser Note:</strong> {rfq.merchandiserNote}
              </div>

              {/* OEM Sampling Stage Pipeline (When Custom OEM) */}
              {rfq.oemSamplingStage && (
                <div className="mt-4 rounded-2xl border border-indigo-200/50 bg-indigo-50/30 p-4">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-indigo-700">
                    OEM Tech Pack &amp; Sampling Pipeline
                  </p>
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {OEM_STAGES.map((stage, idx) => {
                      const done = idx < (rfq.oemSamplingStage || 0);
                      return (
                        <div
                          key={stage}
                          className={`rounded-xl p-2 text-center text-[11px] font-medium ${
                            done ? 'bg-[#0A0B0E] text-white' : 'bg-white text-[#6E6E73] border border-black/[0.05]'
                          }`}
                        >
                          {stage}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Negotiation Audit Log */}
              <div className="mt-4 space-y-1.5">
                {rfq.counterHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-[#515154]">
                    <span>
                      <strong className="text-[#0A0B0E]">{h.by}:</strong> {h.text}
                    </span>
                    <span className="font-mono text-[10px] text-[#86868B]">{h.at}</span>
                  </div>
                ))}
              </div>

              {/* Action Controls */}
              {rfq.status !== 'converted' && (
                <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-black/[0.06] pt-4">
                  <PrismaticButton size="sm" prismatic onClick={() => handleAccept(rfq.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Accept &amp; Convert to Proforma Order
                  </PrismaticButton>
                  <PrismaticButton
                    size="sm"
                    variant="glass"
                    onClick={() => {
                      setCounterOpenId(counterOpenId === rfq.id ? null : rfq.id);
                      setCounterPrice(String(rfq.targetUnitPriceUsd || rfq.offeredUnitPriceUsd));
                    }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Counter-Offer / Adjust
                  </PrismaticButton>
                  <button
                    type="button"
                    onClick={() => notify(`Exported Formal Quotation PDF for ${rfq.id}`)}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1 text-xs font-medium text-[#515154] hover:text-[#0A0B0E]"
                  >
                    <FileText className="h-3.5 w-3.5" /> Quote PDF
                  </button>
                </div>
              )}

              {/* Inline Counter-Offer Drawer */}
              {counterOpenId === rfq.id && (
                <form
                  onSubmit={(e) => handleCounter(e, rfq.id)}
                  className="mt-4 grid grid-cols-1 gap-3 rounded-2xl bg-[#F5F5F7] p-4 sm:grid-cols-12"
                >
                  <input
                    required
                    type="number"
                    step="0.05"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Target USD / pc"
                    className="luminous-input rounded-xl px-3 py-2 font-mono text-xs sm:col-span-3"
                  />
                  <input
                    required
                    value={counterNote}
                    onChange={(e) => setCounterNote(e.target.value)}
                    placeholder="Specify target volume, incoterm, or shipping window..."
                    className="luminous-input rounded-xl px-3 py-2 text-xs sm:col-span-6"
                  />
                  <PrismaticButton type="submit" size="sm" className="sm:col-span-3">
                    Send Proposal
                  </PrismaticButton>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
