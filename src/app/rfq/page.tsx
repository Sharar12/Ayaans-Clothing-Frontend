'use client';

import React, { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { api } from '@/services/api';
import type { Audience, RfqPayload } from '@/types';
import { AmbientAura, PrismaticButton, Reveal, SpecBadge, VideoBackground } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';

const AUDIENCES: Audience[] = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
const CATEGORIES = ['T-Shirts', 'Hoodies', 'Sweaters', 'Jackets', 'Pants', 'Trousers', 'Activewear', 'Polo Shirts', 'Knitwear'];

function RfqStudioInner() {
  const searchParams = useSearchParams();
  const { bag, rfqList, formatPrice, deliverTo, notify } = useApp();

  const importedItems = searchParams.get('source') === 'bag' && bag.length > 0 ? bag : rfqList.length > 0 ? rfqList : bag;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<RfqPayload, 'items'>>({
    sourcingType: searchParams.get('type') === 'oem' ? 'Custom OEM' : 'Stock Lots',
    audiences: ['Men', 'Women'],
    categories: ['T-Shirts', 'Hoodies'],
    targetQuantity: '1,000 – 3,000 PCS',
    targetBudget: '$3.50 – $8.50 / pc',
    destinationCountry: deliverTo,
    shippingMethod: 'Sea LCL',
    incoterm: 'FOB Chattogram',
    paymentMethod: 'T/T Bank Wire',
    companyName: '',
    contactName: '',
    email: '',
    whatsapp: '',
    notes: searchParams.get('brand') ? `Interested in fresh ${searchParams.get('brand')} stock lots.` : '',
    attachedFileName: '',
  });

  const toggleAudience = (aud: Audience) =>
    setForm((f) => ({
      ...f,
      audiences: f.audiences.includes(aud) ? f.audiences.filter((a) => a !== aud) : [...f.audiences, aud],
    }));

  const toggleCategory = (cat: string) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(cat) ? f.categories.filter((c) => c !== cat) : [...f.categories, cat],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.submitRfq({
        ...form,
        items: importedItems.map((i) => ({
          sku: i.product.sku,
          title: i.product.title,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      });
      setSubmittedId(res.rfqId);
      notify(`RFQ ${res.rfqId} submitted to Dhaka Export Desk`);
    } finally {
      setSubmitting(false);
    }
  };

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801620853502';

  if (submittedId) {
    return (
      <div className="relative mx-auto max-w-2xl px-4 py-24 text-center">
        <AmbientAura variant="hero" />
        <div className="glass-surface relative z-10 rounded-[32px] p-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="mt-5 font-mono text-xs font-semibold text-indigo-600">TRACKING ID: {submittedId}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E]">
            Formal Quotation Request Received
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#515154]">
            A senior Ayaan Clothing merchandiser in Dhaka will send your itemized Proforma Quote, packing list, and
            live inspection videos within <strong>4–12 business hours</strong>.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                `Hello Ayaan Export Desk, I just submitted ${submittedId} (${form.companyName || form.contactName}).`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              <MessageCircle className="h-4 w-4" /> Continue on WhatsApp
            </a>
            <PrismaticButton variant="glass" onClick={() => setSubmittedId(null)}>
              Submit Another RFQ
            </PrismaticButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th (1).mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="subtle" />

      <div className="relative mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SpecBadge tone="glass">Formal B2B Quotation Studio</SpecBadge>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-5xl">
            Request Export Quotation (RFQ)
          </h1>
          <p className="mt-2 text-sm text-[#515154]">
            Receive FOB/CIF pricing, exact CBM &amp; carton packing lists, and warehouse QC photos within 4–12 hours.
          </p>
        </Reveal>

        {/* Step Indicator Bar */}
        <Reveal delay={0.08} className="mt-8 flex flex-wrap gap-2">
          {[
            { n: 1, label: '01 Sourcing Mode' },
            { n: 2, label: '02 Specs & Tech Pack' },
            { n: 3, label: '03 Logistics & Terms' },
            { n: 4, label: '04 Buyer Details' },
          ].map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => setStep(s.n)}
              className={`cursor-pointer rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-all ${
                step === s.n
                  ? 'bg-[#0A0B0E] text-white shadow-sm'
                  : step > s.n
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[#F5F5F7] text-[#6E6E73]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </Reveal>

        <Reveal delay={0.12} className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Multi-Step Form */}
          <form onSubmit={handleSubmit} className="ambient-card rounded-[30px] p-6 sm:p-8 lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: APPLE_EASE }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-[#0A0B0E]">Select Your Sourcing Requirement</h2>
                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {(['Stock Lots', 'Custom OEM', 'Buying Agent', 'Mixed Inquiry'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, sourcingType: mode }))}
                          className={`cursor-pointer rounded-2xl border p-4 text-left transition-all ${
                            form.sourcingType === mode
                              ? 'prismatic-ring border-transparent bg-white shadow-xs'
                              : 'border-black/[0.07] bg-[#FAFAFC]'
                          }`}
                        >
                          <p className="text-sm font-semibold text-[#0A0B0E]">{mode}</p>
                          <p className="mt-1 text-xs text-[#6E6E73]">
                            {mode === 'Stock Lots' && 'Ready original branded surplus & cancelled factory orders.'}
                            {mode === 'Custom OEM' && 'Private label production with your specs, labels & hangtags.'}
                            {mode === 'Buying Agent' && 'Dedicated Dhaka sourcing & AQL 2.5 factory management.'}
                            {mode === 'Mixed Inquiry' && 'Combine ready lots + fresh custom replenishment.'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-[#0A0B0E]">Target Audiences</p>
                    <div className="flex flex-wrap gap-2">
                      {AUDIENCES.map((aud) => (
                        <button
                          key={aud}
                          type="button"
                          onClick={() => toggleAudience(aud)}
                          className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                            form.audiences.includes(aud)
                              ? 'bg-[#0A0B0E] text-white'
                              : 'bg-[#F5F5F7] text-[#515154]'
                          }`}
                        >
                          {aud}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: APPLE_EASE }}
                  className="space-y-6"
                >
                  <div>
                    <p className="mb-2.5 text-xs font-semibold text-[#0A0B0E]">Garment Categories</p>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium ${
                            form.categories.includes(cat) ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-[#515154]">Estimated Volume</label>
                      <input
                        value={form.targetQuantity}
                        onChange={(e) => setForm((f) => ({ ...f, targetQuantity: e.target.value }))}
                        className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-[#515154]">Target Unit Budget (FOB)</label>
                      <input
                        value={form.targetBudget}
                        onChange={(e) => setForm((f) => ({ ...f, targetBudget: e.target.value }))}
                        className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-[#515154]">Attach Tech Pack / Reference Sheet (Optional)</label>
                    <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/10 bg-[#FAFAFC] p-6 text-center transition-colors hover:border-indigo-400">
                      <Upload className="h-5 w-5 text-indigo-500" />
                      <span className="mt-2 text-xs font-medium text-[#0A0B0E]">
                        {form.attachedFileName || 'Click to attach PDF, Excel BOQ, or Reference Image'}
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) =>
                          setForm((f) => ({ ...f, attachedFileName: e.target.files?.[0]?.name || '' }))
                        }
                      />
                    </label>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: APPLE_EASE }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="text-xs font-medium text-[#515154]">Destination Country / Port</label>
                    <input
                      value={form.destinationCountry}
                      onChange={(e) => setForm((f) => ({ ...f, destinationCountry: e.target.value }))}
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#515154]">Preferred Freight Mode</label>
                    <select
                      value={form.shippingMethod}
                      onChange={(e) => setForm((f) => ({ ...f, shippingMethod: e.target.value as RfqPayload['shippingMethod'] }))}
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    >
                      <option value="Sea FCL">Sea FCL (20ft / 40ft)</option>
                      <option value="Sea LCL">Sea LCL Consolidation</option>
                      <option value="Air Freight">Air Freight Express</option>
                      <option value="Door-to-Door">Door-to-Door (DDP)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#515154]">Incoterms</label>
                    <select
                      value={form.incoterm}
                      onChange={(e) => setForm((f) => ({ ...f, incoterm: e.target.value as RfqPayload['incoterm'] }))}
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    >
                      <option value="FOB Chattogram">FOB Chattogram</option>
                      <option value="CIF">CIF Destination Port</option>
                      <option value="DDP">DDP Door Delivered</option>
                      <option value="EXW">EXW Dhaka Warehouse</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#515154]">Preferred Payment Term</label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value as RfqPayload['paymentMethod'] }))}
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    >
                      <option value="T/T Bank Wire">T/T Corporate Bank Wire</option>
                      <option value="L/C (Letter of Credit)">Irrevocable Sight L/C</option>
                      <option value="Mixed / Discuss">Discuss with Merchandiser</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-[#515154]">Additional Sourcing Notes</label>
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                      placeholder="Label preference (intact / de-labeled), target ship window, special GSM requirements..."
                      className="luminous-input mt-1.5 w-full rounded-2xl p-4 text-sm"
                    />
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25, ease: APPLE_EASE }}
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <div>
                    <label className="text-xs font-medium text-[#515154]">Full Name *</label>
                    <input
                      required
                      value={form.contactName}
                      onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))}
                      placeholder="e.g., Sarah Jenkins"
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#515154]">Company / Store Name *</label>
                    <input
                      required
                      value={form.companyName}
                      onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
                      placeholder="e.g., Urban Outlet Europe Ltd."
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#515154]">Business Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="buying@company.com"
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#515154]">WhatsApp / Direct Phone *</label>
                    <input
                      required
                      value={form.whatsapp}
                      onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                      placeholder="+44 7700 900123"
                      className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-2.5 text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Wizard Navigation Controls */}
            <div className="mt-8 flex items-center justify-between border-t border-black/[0.06] pt-6">
              {step > 1 ? (
                <PrismaticButton type="button" variant="glass" onClick={() => setStep((s) => s - 1)}>
                  <ArrowLeft className="h-4 w-4" /> Previous
                </PrismaticButton>
              ) : (
                <span />
              )}

              {step < 4 ? (
                <PrismaticButton type="button" onClick={() => setStep((s) => s + 1)}>
                  Continue <ArrowRight className="h-4 w-4" />
                </PrismaticButton>
              ) : (
                <PrismaticButton type="submit" prismatic disabled={submitting}>
                  {submitting ? 'Transmitting to Dhaka Desk...' : 'Submit Formal RFQ'}
                </PrismaticButton>
              )}
            </div>
          </form>

          {/* Right Sticky Live Summary & SLA Card */}
          <aside className="space-y-4 lg:col-span-4">
            <div className="glass-surface sticky top-24 rounded-[28px] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0B0E]">
                <FileText className="h-4 w-4 text-indigo-600" /> Quote Summary
              </div>

              <div className="mt-4 space-y-2 border-b border-black/[0.06] pb-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#6E6E73]">Mode</span>
                  <span className="font-medium text-[#0A0B0E]">{form.sourcingType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6E73]">Destination</span>
                  <span className="font-medium text-[#0A0B0E]">{form.destinationCountry}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6E73]">Freight / Term</span>
                  <span className="font-mono text-[#0A0B0E]">{form.shippingMethod} · {form.incoterm}</span>
                </div>
              </div>

              {importedItems.length > 0 && (
                <div className="mt-4 space-y-2 border-b border-black/[0.06] pb-4">
                  <p className="font-mono text-[11px] uppercase text-[#6E6E73]">
                    Attached Stock Lots ({importedItems.length})
                  </p>
                  {importedItems.map((i) => (
                    <div key={i.product.sku} className="flex justify-between text-xs">
                      <span className="truncate pr-2 text-[#1D1D1F]">
                        {i.product.brand} {i.product.category} ({i.quantity})
                      </span>
                      <span className="font-mono font-medium text-[#0A0B0E]">
                        {formatPrice(i.quantity * i.unitPrice)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-2xl bg-emerald-50/75 p-4 text-xs text-emerald-900 border border-emerald-200/50">
                <p className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="h-4 w-4" /> 4–12 Hour Export Desk SLA
                </p>
                <p className="mt-1 leading-relaxed text-emerald-800">
                  Every RFQ receives verified Proforma pricing, CBM packing estimates, and warehouse inspection photos
                  directly from our Uttara, Dhaka desk.
                </p>
              </div>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}

export default function RfqPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-12 text-sm text-[#6E6E73]">Loading RFQ Studio...</div>}>
      <RfqStudioInner />
    </Suspense>
  );
}
