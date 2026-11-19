'use client';

import React, { useEffect, useState } from 'react';
import { Calculator, MessageCircle, Send, CheckCircle2, Calendar, ShoppingBag } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import type { UnifiedInboxItem } from '@/types/admin';
import { useApp } from '@/store/AppContext';
import { PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';

export default function UnifiedAdminInboxPage() {
  const { notify } = useApp();
  const [items, setItems] = useState<UnifiedInboxItem[]>([]);
  const [filter, setFilter] = useState<'All' | UnifiedInboxItem['type']>('All');
  const [selectedId, setSelectedId] = useState<string>('');
  const [offerPrice, setOfferPrice] = useState('4.95');

  // Quick Profit Helper State
  const [calcOpen, setCalcOpen] = useState(false);
  const [calc, setCalc] = useState({ fabric: 2.1, sewing: 0.9, packing: 0.45, sell: 4.95 });

  useEffect(() => {
    adminApi.getInbox().then((list) => {
      setItems(list);
      if (list[0]) setSelectedId(list[0].id);
    });
  }, []);

  const filtered = items.filter((i) => filter === 'All' || i.type === filter);
  const active = items.find((i) => i.id === selectedId) || filtered[0];

  const unitCost = calc.fabric + calc.sewing + calc.packing;
  const unitProfit = calc.sell - unitCost;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Incoming Customer Requests</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Inbox (Quotes, Visits &amp; Messages)
          </h1>
        </div>
        <SegmentedControl
          layoutId="inboxFilter"
          value={filter}
          onChange={setFilter}
          options={[
            { label: 'All', value: 'All' },
            { label: 'Price Quotes', value: 'Price Quote' },
            { label: 'Dhaka Visits', value: 'Dhaka Visit' },
            { label: 'Messages', value: 'Contact Message' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left List */}
        <div className="space-y-2.5 lg:col-span-4">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedId(item.id);
                if (item.targetPriceUsd) setOfferPrice(String(item.targetPriceUsd));
              }}
              className={`w-full cursor-pointer rounded-3xl border p-4 text-left transition-all ${
                active?.id === item.id
                  ? 'prismatic-ring border-transparent bg-white shadow-sm'
                  : 'border-black/[0.06] bg-[#FAFAFC] hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <SpecBadge tone={item.type === 'Price Quote' ? 'original' : item.type === 'Dhaka Visit' ? 'emerald' : 'neutral'} className="!py-0.5 !text-[10px]">
                  {item.type}
                </SpecBadge>
                <span className="font-mono text-[10px] text-[#86868B]">{item.date}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-[#0A0B0E]">{item.buyerCompany}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-[#515154]">{item.subject}</p>
              <p className="mt-2 font-mono text-[10px] text-indigo-600">Status: {item.status}</p>
            </button>
          ))}
        </div>

        {/* Right Workspace */}
        {active && (
          <div className="ambient-card rounded-[28px] p-6 lg:col-span-8 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.06] pb-4">
              <div>
                <SpecBadge tone="neutral">{active.type} · {active.status}</SpecBadge>
                <h2 className="mt-2 text-xl font-semibold text-[#0A0B0E]">{active.subject}</h2>
                <p className="text-xs text-[#6E6E73]">
                  {active.contactName} · {active.buyerCompany} ({active.country})
                </p>
              </div>
              <a
                href={`https://wa.me/${active.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>

            <div className="rounded-2xl bg-[#FAFAFC] p-4 text-sm leading-relaxed text-[#1D1D1F]">
              {active.message}
            </div>

            {/* PRICE QUOTE ACTIONS + QUICK PROFIT CALCULATOR */}
            {active.type === 'Price Quote' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-[#515154]">
                    Qty: <strong>{active.quantity?.toLocaleString()} pcs</strong> · Buyer Target: ${active.targetPriceUsd}/pc
                  </span>
                  <button
                    type="button"
                    onClick={() => setCalcOpen((v) => !v)}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
                  >
                    <Calculator className="h-3.5 w-3.5" /> {calcOpen ? 'Hide' : 'Quick Profit Calculator'}
                  </button>
                </div>

                {calcOpen && (
                  <div className="rounded-2xl border border-indigo-200/60 bg-indigo-50/35 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                      <div><label className="text-[10px] text-[#515154]">Fabric ($)</label><input type="number" step="0.1" value={calc.fabric} onChange={(e) => setCalc({ ...calc, fabric: Number(e.target.value) })} className="luminous-input mt-1 w-full rounded-xl px-2.5 py-1.5 font-mono text-xs" /></div>
                      <div><label className="text-[10px] text-[#515154]">Sewing ($)</label><input type="number" step="0.1" value={calc.sewing} onChange={(e) => setCalc({ ...calc, sewing: Number(e.target.value) })} className="luminous-input mt-1 w-full rounded-xl px-2.5 py-1.5 font-mono text-xs" /></div>
                      <div><label className="text-[10px] text-[#515154]">Packing ($)</label><input type="number" step="0.1" value={calc.packing} onChange={(e) => setCalc({ ...calc, packing: Number(e.target.value) })} className="luminous-input mt-1 w-full rounded-xl px-2.5 py-1.5 font-mono text-xs" /></div>
                      <div><label className="text-[10px] font-semibold text-indigo-700">Your Offer ($)</label><input type="number" step="0.1" value={calc.sell} onChange={(e) => { const v = Number(e.target.value); setCalc({ ...calc, sell: v }); setOfferPrice(String(v)); }} className="luminous-input mt-1 w-full rounded-xl px-2.5 py-1.5 font-mono text-xs font-semibold" /></div>
                    </div>
                    <p className="font-mono text-xs font-semibold text-emerald-700">
                      Cost ${unitCost.toFixed(2)}/pc → Net Profit ${unitProfit.toFixed(2)}/pc · Total Profit on {active.quantity || 1000} pcs: ${Math.round(unitProfit * (active.quantity || 1000)).toLocaleString()} (≈ ৳{Math.round(unitProfit * (active.quantity || 1000) * 121.5).toLocaleString()})
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-[#F5F5F7] p-4">
                  <input
                    type="number"
                    step="0.05"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="luminous-input w-32 rounded-xl px-3 py-2 font-mono text-sm font-semibold"
                  />
                  <PrismaticButton
                    size="sm"
                    onClick={() => {
                      adminApi.replyInbox(active.id, 'Replied', Number(offerPrice)).then(setItems);
                      notify(`Sent price offer $${offerPrice}/pc to ${active.buyerCompany}`);
                    }}
                  >
                    <Send className="h-3.5 w-3.5" /> Send Price Offer
                  </PrismaticButton>
                  <PrismaticButton
                    size="sm"
                    prismatic
                    onClick={() => {
                      adminApi.convertQuoteToOrder(active.id).then((res: any) => {
                        setItems(res.inbox);
                        notify(`Created live Order ${res.newOrderCode} in Orders & Transactions!`);
                      });
                    }}
                  >
                    <ShoppingBag className="h-3.5 w-3.5" /> Turn Into Real Order
                  </PrismaticButton>
                </div>
              </div>
            )}

            {/* DHAKA VISIT CONFIRMATION */}
            {active.type === 'Dhaka Visit' && (
              <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4 space-y-3">
                <p className="flex items-center gap-2 font-mono text-xs font-semibold text-[#0A0B0E]">
                  <Calendar className="h-4 w-4 text-indigo-600" /> {active.visitDates} · {active.guests} Guests
                </p>
                <PrismaticButton
                  size="sm"
                  prismatic
                  onClick={() => {
                    adminApi.replyInbox(active.id, 'Confirmed').then(setItems);
                    notify(`Confirmed Dhaka trip & Visa Invitation Letter for ${active.buyerCompany}!`);
                  }}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Visit &amp; Send Visa Letter
                </PrismaticButton>
              </div>
            )}

            {/* CONTACT MESSAGE ACTION */}
            {active.type === 'Contact Message' && (
              <PrismaticButton
                size="sm"
                onClick={() => {
                  adminApi.replyInbox(active.id, 'Replied').then(setItems);
                  notify('Marked message as Replied');
                }}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark as Replied
              </PrismaticButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
