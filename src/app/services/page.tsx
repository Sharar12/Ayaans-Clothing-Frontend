'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Building2,
  ShieldCheck,
  Ship,
  Plane,
  Truck,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { AmbientAura, BentoTile, PrismaticButton, Reveal, SegmentedControl, SpecBadge, VideoBackground } from '@/design-system/primitives';

type ServiceTab = 'oem' | 'buying' | 'qc' | 'logistics';

const FABRICS = [
  { name: 'Single Jersey Cotton', gsm: '160–220 GSM', lead: '25–30 Days', baseUsd: 3.1 },
  { name: '3-End Brushed Fleece', gsm: '300–400 GSM', lead: '30–35 Days', baseUsd: 7.4 },
  { name: 'Honeycomb Piqué Polo', gsm: '200–240 GSM', lead: '25–30 Days', baseUsd: 4.2 },
  { name: 'Comfort Stretch Denim', gsm: '11–13 OZ', lead: '35–42 Days', baseUsd: 8.9 },
];

export default function ServicesPage() {
  const [tab, setTab] = useState<ServiceTab>('oem');
  const [selectedFabricIdx, setSelectedFabricIdx] = useState(0);
  const [oemQty, setOemQty] = useState(1000);
  const [includeLabels, setIncludeLabels] = useState(true);

  const fabric = FABRICS[selectedFabricIdx];
  const qtyFactor = oemQty >= 3000 ? 0.86 : oemQty >= 1500 ? 0.93 : 1;
  const estOemUnit = fabric.baseUsd * qtyFactor + (includeLabels ? 0.35 : 0);

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th.mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="hero" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <SpecBadge tone="glass">End-to-End Dhaka RMG Infrastructure</SpecBadge>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#0A0B0E] sm:text-6xl">
            Beyond Stock Lots. Full OEM Production &amp; Buying House Execution.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#515154]">
            Operate in Bangladesh with your own dedicated sourcing arm—covering custom private-label manufacturing,
            factory vetting across 600+ units, AQL 2.5 inspections, and worldwide Sea/Air logistics.
          </p>
        </Reveal>

        {/* Sticky Service Pill Selector */}
        <Reveal delay={0.08} className="mt-10">
          <SegmentedControl
            layoutId="servicesTab"
            value={tab}
            onChange={setTab}
            options={[
              { label: 'Fresh OEM Production', value: 'oem' },
              { label: 'Buying House Agent', value: 'buying' },
              { label: 'AQL 2.5 Quality Control', value: 'qc' },
              { label: 'Global Freight & Incoterms', value: 'logistics' },
            ]}
          />
        </Reveal>

        {/* TAB 1: CUSTOM OEM PRODUCTION + INTERACTIVE ESTIMATOR */}
        {tab === 'oem' && (
          <Reveal delay={0.12} className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-7">
              <BentoTile tint="indigo">
                <Layers className="h-6 w-6 text-indigo-600" />
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-[#0A0B0E]">
                  Private Label &amp; Custom Garment Manufacturing
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[#515154]">
                  From tech-pack sampling to export carton delivery, we produce custom woven, knit, fleece, and denim
                  collections with full private-label branding.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    'Custom GSM Fabric Knitting & Pantone Dyeing',
                    'Woven Neck Labels, Care Labels & Size Tabs',
                    'Embossed Hangtags, Polybags & EAN Barcodes',
                    'MOQ from 500–1,000 PCS per Style / Color',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 rounded-2xl bg-[#FAFAFC] p-3 text-xs font-medium text-[#1D1D1F]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </div>
                  ))}
                </div>
              </BentoTile>
            </div>

            {/* Interactive OEM Cost Estimator */}
            <div className="glass-surface rounded-[28px] p-6 lg:col-span-5">
              <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Interactive Estimator</p>
              <h3 className="mt-1 text-lg font-semibold text-[#0A0B0E]">Quick OEM Target Price Simulator</h3>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#515154]">Select Fabric Program</label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {FABRICS.map((f, idx) => (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => setSelectedFabricIdx(idx)}
                        className={`cursor-pointer rounded-2xl border p-3 text-left text-xs transition-all ${
                          selectedFabricIdx === idx
                            ? 'prismatic-ring border-transparent bg-white font-semibold'
                            : 'border-black/[0.06] bg-[#FAFAFC] text-[#515154]'
                        }`}
                      >
                        <p className="text-[#0A0B0E]">{f.name}</p>
                        <p className="font-mono text-[10px] text-[#6E6E73]">{f.gsm}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#515154]">Production Quantity</span>
                    <span className="font-mono font-semibold text-[#0A0B0E]">{oemQty.toLocaleString()} PCS</span>
                  </div>
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={250}
                    value={oemQty}
                    onChange={(e) => setOemQty(Number(e.target.value))}
                    className="mt-2 w-full accent-[#0A0B0E]"
                  />
                </div>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#F5F5F7] px-4 py-3 text-xs font-medium text-[#0A0B0E]">
                  <span>Include Custom Woven Labels, Hangtags &amp; Barcodes</span>
                  <input
                    type="checkbox"
                    checked={includeLabels}
                    onChange={(e) => setIncludeLabels(e.target.checked)}
                    className="h-4 w-4 accent-[#0A0B0E]"
                  />
                </label>

                <div className="rounded-2xl bg-[#0A0B0E] p-5 text-white">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-white/70">Indicative FOB Estimate</span>
                    <span className="font-mono text-2xl font-semibold">${estOemUnit.toFixed(2)}/pc</span>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-white/65">
                    Lead Time: {fabric.lead} · Est. Order Value: ${(estOemUnit * oemQty).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </p>
                </div>

                <Link href="/rfq?type=oem" className="block">
                  <PrismaticButton prismatic className="w-full">
                    Upload Tech Pack &amp; Get Exact Quote <ArrowRight className="h-4 w-4" />
                  </PrismaticButton>
                </Link>
              </div>
            </div>
          </Reveal>
        )}

        {/* TAB 2: BUYING HOUSE AGENT */}
        {tab === 'buying' && (
          <Reveal delay={0.12} className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: '600+ Audited Partner Units',
                desc: 'We match your exact garment complexity and price point to specialized knit, woven, sweater, or denim factories across Dhaka and Chattogram.',
              },
              {
                icon: Package,
                title: 'Multi-Style Consolidation',
                desc: 'Combine 15–20 stock-lot or OEM styles from multiple factories into one dust-free Uttara staging warehouse for a single optimized FCL/LCL shipment.',
              },
              {
                icon: ShieldCheck,
                title: 'On-Ground Negotiation & Merchandising',
                desc: 'Dedicated merchandisers track fabric booking, lab dips, inline sewing, and compliance documentation—protecting your timelines and margins.',
              },
            ].map((card) => (
              <BentoTile key={card.title} tint="sky">
                <card.icon className="h-6 w-6 text-sky-600" />
                <h3 className="mt-4 text-lg font-semibold text-[#0A0B0E]">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#515154]">{card.desc}</p>
              </BentoTile>
            ))}
          </Reveal>
        )}

        {/* TAB 3: AQL 2.5 QUALITY CONTROL */}
        {tab === 'qc' && (
          <Reveal delay={0.12} className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-4">
            {[
              { stage: '01', title: 'Fabric & GSM Audit', detail: '4-point fabric inspection, shrinkage testing, AZO-free reactive dye check.' },
              { stage: '02', title: 'Inline Cutting & Sewing', detail: 'Daily floor QC monitoring SPI stitch density, seam strength, and symmetry.' },
              { stage: '03', title: 'Finishing & Needle Check', detail: 'Steam pressing, thread trimming, metal/needle detection, and size measurements.' },
              { stage: '04', title: 'Final AQL 2.5 Sign-Off', detail: 'Random export carton audit with HD inspection photos & video approval before shipping.' },
            ].map((item) => (
              <BentoTile key={item.stage} tint="emerald">
                <span className="font-mono text-xs font-semibold text-emerald-600">STAGE {item.stage}</span>
                <h3 className="mt-3 text-lg font-semibold text-[#0A0B0E]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#515154]">{item.detail}</p>
              </BentoTile>
            ))}
          </Reveal>
        )}

        {/* TAB 4: GLOBAL FREIGHT & INCOTERMS */}
        {tab === 'logistics' && (
          <Reveal delay={0.12} className="mt-10 space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[
                { icon: Ship, mode: 'Sea FCL (20ft / 40ft)', capacity: '28 m³ – 58 m³', transit: '18–32 Days', best: 'Lowest landed freight cost per garment for full wholesale programs.' },
                { icon: Package, mode: 'Sea LCL Consolidation', capacity: '2 m³ – 20 m³', transit: '22–36 Days', best: 'Combine 10–20 mixed stock-lot styles in shared export containers.' },
                { icon: Plane, mode: 'Air Freight & Door-to-Door', capacity: '50 KG – 2,000 KG', transit: '4–8 Days', best: 'Rapid seasonal restocks directly from Dhaka (DAC) airport to your warehouse.' },
              ].map((m) => (
                <BentoTile key={m.mode} tint="amber">
                  <m.icon className="h-6 w-6 text-amber-600" />
                  <h3 className="mt-4 text-lg font-semibold text-[#0A0B0E]">{m.mode}</h3>
                  <p className="mt-1 font-mono text-xs text-indigo-600">
                    {m.capacity} · Est. {m.transit}
                  </p>
                  <p className="mt-2.5 text-sm text-[#515154]">{m.best}</p>
                </BentoTile>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-black/[0.06] bg-[#FAFAFC] p-6">
              <div className="flex items-center gap-3">
                <Truck className="h-5 w-5 text-[#0A0B0E]" />
                <div>
                  <p className="text-sm font-semibold text-[#0A0B0E]">Supported Commercial Incoterms</p>
                  <p className="text-xs text-[#6E6E73]">Full export customs clearance, GSP/CO certificates &amp; BL documentation.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                {['FOB Chattogram', 'CIF Destination', 'CNF', 'EXW Dhaka', 'DDP Door-to-Door'].map((term) => (
                  <span key={term} className="rounded-full bg-white px-3 py-1.5 border border-black/[0.07]">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
