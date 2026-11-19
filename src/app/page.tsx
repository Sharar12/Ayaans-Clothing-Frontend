'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Building2,
  Ship,
  Award,
  Layers,
  CheckCircle2,
  Play,
} from 'lucide-react';
import { api } from '@/services/api';
import type { Brand, Certification, ExportStep, Product } from '@/types';
import {
  AmbientAura,
  BentoTile,
  PrismaticButton,
  Reveal,
  SegmentedControl,
  SpecBadge,
  VideoBackground,
} from '@/design-system/primitives';
import { ProductCard } from '@/components/commerce/ProductCard';
import { APPLE_EASE, STAGGER_CONTAINER } from '@/design-system/motion';

const AUDIENCE_SHOWCASE = [
  { name: 'Men', tagline: 'Outerwear, Denim, Executive Polos', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
  { name: 'Women', tagline: 'Organic Tees, Fine Knitwear & Essentials', img: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80' },
  { name: 'Boys', tagline: 'EU-Compliant Cargo Twill & Fleece', img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=800&q=80' },
  { name: 'Girls', tagline: 'AZO-Free Poplin Sets & Knitwear', img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80' },
  { name: 'Unisex', tagline: '380 GSM Heavy Hoodies & Thermal Layers', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [steps, setSteps] = useState<ExportStep[]>([]);
  const [certs, setCerts] = useState<Certification[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  useEffect(() => {
    Promise.all([api.getProducts(), api.getBrands(), api.getExportSteps(), api.getCertifications()]).then(
      ([p, b, s, c]) => {
        setProducts(p);
        setBrands(b);
        setSteps(s);
        setCerts(c);
      }
    );
  }, []);

  const filteredLots =
    activeCategory === 'All'
      ? products.slice(0, 8)
      : products.filter((p) => p.category === activeCategory).slice(0, 8);

  return (
    <div className="bg-white">
      {/* 1. AMBIENT LUMINOUS WHITE HERO (Section 1 - With 2 Video Backgrounds at 1x speed) */}
      <section className="relative overflow-hidden pb-20 pt-16 sm:pt-24">
        <VideoBackground
          src="/bg_videos/create_a_loop_bg_video_with_th (1).mp4"
          srcSecondary="/bg_videos/create_a_loop_bg_video_with_th.mp4"
          opacity={0.33}
          playbackRate={1.0}
          split
        />
        <AmbientAura variant="hero" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <Reveal amount={0.5}>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/85 px-4 py-1.5 text-xs font-medium text-[#1D1D1F] shadow-xs backdrop-blur-xl prismatic-ring">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>ISO 9001:2015 Certified · BGMEA Reg #1708 · Dhaka Since 2010</span>
            </div>

            <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.038em] text-[#0A0B0E] sm:text-6xl lg:text-[72px]">
              Export-Grade Apparel. Sourced{' '}
              <span className="text-iridescent">Direct</span> from Bangladesh.
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#515154] sm:text-lg">
              Original branded stock lots, factory surplus, and bespoke OEM production across{' '}
              <strong className="font-semibold text-[#0A0B0E]">600+ verified partner factories</strong>—inspected to AQL
              2.5 and shipped worldwide via Air, LCL &amp; FCL.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/catalog">
                <PrismaticButton size="lg" prismatic>
                  Explore Live Catalog <ArrowRight className="h-4 w-4" />
                </PrismaticButton>
              </Link>
              <Link href="/rfq">
                <PrismaticButton size="lg" variant="glass">
                  Submit Wholesale RFQ
                </PrismaticButton>
              </Link>
              <Link
                href="/new-arrivals"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#515154] transition-colors hover:text-[#0A0B0E]"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> Watch Daily Drops
              </Link>
            </div>
          </Reveal>

          {/* Hero Floating Glass Architectural Stage */}
          <Reveal amount={0.3} delay={0.15} className="relative mx-auto mt-14 max-w-6xl">
            <div className="ambient-card relative overflow-hidden rounded-[32px] bg-[#F5F5F7] p-2.5 sm:p-3.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                <div className="relative overflow-hidden rounded-[24px] sm:col-span-7">
                  <img
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=85"
                    alt="Export apparel showroom"
                    className="h-72 w-full object-cover sm:h-[420px]"
                  />
                  {/* Floating Glass Telemetry Widget */}
                  <div className="glass-surface absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl px-4 py-3 text-left sm:right-auto sm:min-w-[300px]">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-indigo-600">Live Warehouse Lot</p>
                      <p className="text-xs font-semibold text-[#0A0B0E]">George Organic Cotton Tee · 180 GSM</p>
                    </div>
                    <span className="rounded-full bg-[#0A0B0E] px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
                      $1.95/pc
                    </span>
                  </div>
                </div>

                <div className="grid grid-rows-2 gap-2.5 sm:col-span-5">
                  <div className="relative overflow-hidden rounded-[24px] bg-white p-6 text-left border border-black/[0.05]">
                    <div className="flex items-center justify-between">
                      <SpecBadge tone="emerald">
                        <ShieldCheck className="h-3 w-3" /> AQL 2.5 Verified
                      </SpecBadge>
                      <span className="font-mono text-xs text-[#6E6E73]">EST. 2010</span>
                    </div>
                    <p className="mt-5 font-mono text-4xl font-semibold tracking-tight text-[#0A0B0E]">600+</p>
                    <p className="mt-1 text-sm font-medium text-[#1D1D1F]">Partner Garment Factories &amp; Warehouses</p>
                    <p className="mt-1 text-xs text-[#6E6E73]">Direct factory floor allocation across Dhaka, Gazipur &amp; Chattogram.</p>
                  </div>

                  <div className="relative overflow-hidden rounded-[24px]">
                    <img
                      src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85"
                      alt="Quality inspected garments"
                      className="h-full min-h-[180px] w-full object-cover"
                    />
                    <div className="glass-surface absolute bottom-3 right-3 rounded-full px-3.5 py-1.5 font-mono text-[11px] font-medium text-[#0A0B0E]">
                      Sea FCL · LCL · Air Worldwide
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2. INFINITE MINIMALIST BRAND STOCK-LOT MARQUEE */}
      <section className="border-y border-black/[0.05] bg-[#FAFAFC] py-7 overflow-hidden">
        <div className="mx-auto mb-4 max-w-7xl px-4 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#86868B]">
            Global Retail Stock Lots Regularly Sourced
          </p>
        </div>
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex items-center gap-12 px-6">
            {[...brands, ...brands].map((brand, idx) => (
              <Link
                key={`${brand.slug}-${idx}`}
                href={`/brands/${brand.slug}`}
                className="shrink-0 text-xl font-semibold tracking-[-0.03em] text-[#86868B]/75 transition-all hover:scale-105 hover:text-[#0A0B0E]"
              >
                {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. APPLE-STYLE BENTO GRID — THE AYAAN ECOSYSTEM (Section 3 - Tall section with 2 video blocks & gap) */}
      <section className="relative overflow-hidden py-24">
        <VideoBackground src="/bg_videos/create_a_loop_bg_video_with_th.mp4" opacity={0.33} split />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-600">Institutional Capabilities</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-5xl">
              Engineered for High-Margin Global Apparel Importers.
            </h2>
          </Reveal>

          <motion.div
            variants={STAGGER_CONTAINER}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-12"
          >
          <BentoTile tint="indigo" className="md:col-span-7 bg-[#FAFAFC]">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <SpecBadge tone="original">Core Pillar 01</SpecBadge>
                <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[#0A0B0E]">
                  Original Brand Stock Lots &amp; Factory Surplus
                </h3>
                <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#515154]">
                  Immediate access to cancelled EU/US retail orders, factory overruns, and seasonal shipment excess at
                  60–75% below retail production cost. Combine 20+ styles in a single shipment.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-xs">
                <span className="rounded-full bg-white px-3 py-1.5 border border-black/[0.06]">MOQ from 30 PCS</span>
                <span className="rounded-full bg-white px-3 py-1.5 border border-black/[0.06]">Daily Dhaka Arrivals</span>
                <span className="rounded-full bg-white px-3 py-1.5 border border-black/[0.06]">Live CBM Optimizer</span>
              </div>
            </div>
          </BentoTile>

          <BentoTile tint="sky" className="md:col-span-5">
            <Building2 className="h-7 w-7 text-sky-600" />
            <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[#0A0B0E]">
              15+ Years · 600+ Factories
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[#515154]">
              On-ground buying house presence in Uttara, Dhaka—negotiating direct mill rates and auditing compliance
              across Bangladesh’s top RMG clusters.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-black/[0.06] pt-4 font-mono">
              <div>
                <p className="text-lg font-semibold text-[#0A0B0E]">2010</p>
                <p className="text-[10px] text-[#6E6E73]">Founded</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#0A0B0E]">40+</p>
                <p className="text-[10px] text-[#6E6E73]">Countries</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-[#0A0B0E]">AQL 2.5</p>
                <p className="text-[10px] text-[#6E6E73]">QC Standard</p>
              </div>
            </div>
          </BentoTile>

          <BentoTile tint="rose" className="md:col-span-4">
            <Layers className="h-6 w-6 text-rose-500" />
            <h3 className="mt-4 text-xl font-semibold text-[#0A0B0E]">Fresh OEM Manufacturing</h3>
            <p className="mt-2 text-sm text-[#515154]">
              Custom GSM fabrics, private woven labels, hangtags &amp; retail barcode cartons starting at 500–1,000 pcs.
            </p>
            <Link href="/services" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#0A0B0E] hover:text-indigo-600">
              Explore OEM Configurator <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </BentoTile>

          <BentoTile tint="emerald" className="md:col-span-4">
            <Award className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-4 text-xl font-semibold text-[#0A0B0E]">Strict AQL 2.5 QC &amp; Packing</h3>
            <p className="mt-2 text-sm text-[#515154]">
              Dust-free staging warehouse with needle detection, GSM checks, measurement logs, and HD pre-shipment videos.
            </p>
            <Link href="/compliance" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#0A0B0E] hover:text-indigo-600">
              Inspect Compliance Vault <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </BentoTile>

          <BentoTile tint="amber" className="md:col-span-4">
            <Ship className="h-6 w-6 text-amber-600" />
            <h3 className="mt-4 text-xl font-semibold text-[#0A0B0E]">Global Multimodal Freight</h3>
            <p className="mt-2 text-sm text-[#515154]">
              Sea 20ft/40ft FCL, consolidated LCL, Air Express, and Door-to-Door DDP clearance from Chattogram &amp; Dhaka.
            </p>
            <Link href="/rfq" className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#0A0B0E] hover:text-indigo-600">
              Get Landed Freight Quote <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </BentoTile>
        </motion.div>
        </div>
      </section>

      {/* 4. FILTERABLE READY-STOCK LOTS SHOWCASE */}
      <section className="border-t border-black/[0.05] bg-[#FAFAFC]/60 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6E6E73]">Live Inventory</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-4xl">
                Featured Ready-Stock Lots
              </h2>
            </div>
            <SegmentedControl
              layoutId="homeCategory"
              value={activeCategory}
              onChange={setActiveCategory}
              options={['All', 'T-Shirts', 'Hoodies', 'Jackets', 'Sweaters', 'Pants', 'Activewear'].map((c) => ({
                label: c,
                value: c,
              }))}
            />
          </Reveal>

          <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredLots.map((product) => (
              <ProductCard key={product.sku} product={product} />
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-12 text-center">
            <Link href="/catalog">
              <PrismaticButton variant="glass" size="lg">
                Browse All Lots &amp; B2B Spec Table <ArrowRight className="h-4 w-4" />
              </PrismaticButton>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 5. SHOP BY AUDIENCE (5 EDITORIAL PORTRAIT CARDS) (Section 5 - With Video Background) */}
      <section className="relative overflow-hidden py-24">
        <VideoBackground src="/bg_videos/generate_a_white_background_wi.mp4" opacity={0.33} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#6E6E73]">5 Core Divisions</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-4xl">
              Shop by Audience
            </h2>
          </div>
          <Link href="/catalog" className="hidden text-sm font-medium text-indigo-600 hover:underline sm:inline">
            Explore All Audiences →
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {AUDIENCE_SHOWCASE.map((aud) => (
            <Link
              key={aud.name}
              href={`/catalog?audience=${aud.name}`}
              className="ambient-card group relative aspect-[3/4.2] overflow-hidden rounded-[26px] bg-[#F5F5F7]"
            >
              <img
                src={aud.img}
                alt={aud.name}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute inset-x-4 bottom-4 text-white">
                <p className="text-lg font-semibold tracking-[-0.02em]">{aud.name}</p>
                <p className="mt-0.5 text-[11px] text-white/80 line-clamp-2">{aud.tagline}</p>
              </div>
            </Link>
          ))}
        </Reveal>
        </div>
      </section>

      {/* 6. INTERACTIVE 10-STEP EXPORT PIPELINE */}
      <section className="relative border-y border-black/[0.06] bg-[#FAFAFC] py-24 overflow-hidden">
        <AmbientAura variant="cool" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-600">Transparent Workflow</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-4xl">
              10-Step Export Execution — From Inquiry to Destination Port
            </h2>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5 lg:col-span-8">
              {steps.map((s, idx) => {
                const active = activeStepIdx === idx;
                return (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => setActiveStepIdx(idx)}
                    className={`cursor-pointer rounded-2xl border p-3.5 text-left transition-all ${
                      active
                        ? 'prismatic-ring border-transparent bg-white shadow-sm'
                        : 'border-black/[0.06] bg-white/75 hover:bg-white'
                    }`}
                  >
                    <span className="font-mono text-xs font-semibold text-indigo-600">{s.step}</span>
                    <p className="mt-1 text-xs font-semibold leading-snug text-[#0A0B0E]">{s.title}</p>
                  </button>
                );
              })}
            </div>

            {steps[activeStepIdx] && (
              <div className="glass-surface flex flex-col justify-between rounded-3xl p-7 lg:col-span-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-indigo-600">
                      STAGE {steps[activeStepIdx].step} / 10
                    </span>
                    <SpecBadge tone="emerald">SLA: {steps[activeStepIdx].sla}</SpecBadge>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-[#0A0B0E]">
                    {steps[activeStepIdx].title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#515154]">{steps[activeStepIdx].summary}</p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" /> Backed by signed Proforma &amp; AQL 2.5 Audit
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* 7. VERIFIED COMPLIANCE VAULT PREVIEW (Section 7 - With Video Background) */}
      <section className="relative overflow-hidden py-24">
        <VideoBackground src="/bg_videos/generated_video_july_24.mp4" opacity={0.33} />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-emerald-700">Institutional Trust</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-4xl">
              Verified Compliance &amp; Government Licenses
            </h2>
          </div>
          <Link href="/compliance">
            <PrismaticButton variant="glass" size="sm">
              Open Interactive Document Vault <ArrowUpRight className="h-3.5 w-3.5" />
            </PrismaticButton>
          </Link>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {certs.map((c) => (
            <Link
              key={c.id}
              href="/compliance"
              className="ambient-card group flex flex-col justify-between rounded-3xl p-5"
            >
              <div>
                <div className="flex items-center justify-between">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <ArrowUpRight className="h-4 w-4 text-[#86868B] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0A0B0E]" />
                </div>
                <p className="mt-4 text-sm font-semibold text-[#0A0B0E]">{c.shortTitle}</p>
                <p className="mt-1 font-mono text-[11px] text-[#6E6E73]">{c.registrationNumber}</p>
              </div>
              <p className="mt-4 text-[11px] font-medium text-emerald-700">{c.status}</p>
            </Link>
          ))}
        </Reveal>
        </div>
      </section>

      {/* 8. DHAKA VISIT CONCIERGE & FINAL AMBIENT CTA (With Video Background) */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-[36px] border border-black/[0.07] bg-[#FAFAFC] p-10 text-center sm:p-16">
          <VideoBackground src="/bg_videos/create_a_loop_bg_video_with_th (1).mp4" opacity={0.33} />
          <AmbientAura variant="warm" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <SpecBadge tone="glass">VIP Buyer Hospitality · Uttara, Dhaka</SpecBadge>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-5xl">
              Visit Our Warehouses in Dhaka or Request a Live Quote Today.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#515154] sm:text-base">
              We arrange Visa Invitation Letters, DAC airport pickup, hotel guidance, and curated factory inspections
              for visiting wholesale importers.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/rfq">
                <PrismaticButton size="lg" prismatic>
                  Start Formal RFQ <ArrowRight className="h-4 w-4" />
                </PrismaticButton>
              </Link>
              <Link href="/about#visit-dhaka">
                <PrismaticButton size="lg" variant="glass">
                  Plan Dhaka Sourcing Trip
                </PrismaticButton>
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
