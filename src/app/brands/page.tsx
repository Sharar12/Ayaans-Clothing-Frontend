'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowUpRight, Sparkles } from 'lucide-react';
import { api } from '@/services/api';
import type { Brand } from '@/types';
import { AmbientAura, Reveal, SpecBadge, VideoBackground } from '@/design-system/primitives';

export default function BrandsDirectoryPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [q, setQ] = useState('');
  const [letter, setLetter] = useState('ALL');

  useEffect(() => {
    api.getBrands().then(setBrands);
  }, []);

  const letters = ['ALL', ...Array.from(new Set(brands.map((b) => b.name[0].toUpperCase()))).sort()];
  const filtered = brands.filter((b) => {
    const matchQ =
      !q.trim() ||
      b.name.toLowerCase().includes(q.toLowerCase()) ||
      b.specialty.toLowerCase().includes(q.toLowerCase()) ||
      b.origin.toLowerCase().includes(q.toLowerCase());
    const matchL = letter === 'ALL' || b.name[0].toUpperCase() === letter;
    return matchQ && matchL;
  });

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/generated_video_july_24.mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="subtle" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-600">Global Stock-Lot Index</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-5xl">
            Global Brands. Factory-Direct Surplus.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#515154]">
            Browse active ready-stock lots by label or explore our flagship Ayaan own-label &amp; OEM production line.
          </p>
        </Reveal>

        {/* Search + A-Z Jump Bar */}
        <Reveal delay={0.08} className="mt-8 flex flex-col gap-4 rounded-3xl border border-black/[0.06] bg-[#FAFAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#86868B]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search brand or specialty..."
              className="luminous-input w-full rounded-full py-2 pl-10 pr-4 text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {letters.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLetter(l)}
                className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                  letter === l
                    ? 'bg-[#0A0B0E] text-white'
                    : 'bg-white text-[#515154] border border-black/[0.06] hover:text-[#0A0B0E]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Brands Bento Wall */}
        <Reveal delay={0.12} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((brand) => (
            <Link
              key={brand.slug}
              href={`/brands/${brand.slug}`}
              className={`ambient-card group flex flex-col justify-between rounded-[26px] p-6 ${
                brand.isOwnLabel ? 'prismatic-ring bg-gradient-to-br from-white via-white to-indigo-50/40' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xl font-semibold tracking-[-0.03em] text-[#0A0B0E]">{brand.name}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#86868B] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#0A0B0E]" />
                </div>
                <p className="mt-1 font-mono text-[11px] text-[#6E6E73]">{brand.origin}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#515154]">{brand.specialty}</p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-black/[0.05] pt-3.5">
                {brand.isOwnLabel ? (
                  <SpecBadge tone="original">
                    <Sparkles className="h-3 w-3" /> Own Label &amp; OEM
                  </SpecBadge>
                ) : (
                  <SpecBadge tone="emerald">{brand.activeLots} Active Lots</SpecBadge>
                )}
                <span className="text-[11px] font-medium text-[#6E6E73] group-hover:text-[#0A0B0E]">Inspect →</span>
              </div>
            </Link>
          ))}
        </Reveal>

        {/* Legal Notice */}
        <Reveal delay={0.15} className="mt-14 rounded-3xl border border-black/[0.06] bg-[#FAFAFC] p-6 text-xs leading-relaxed text-[#6E6E73]">
          <strong className="font-semibold text-[#0A0B0E]">Independent Surplus &amp; Sourcing Notice:</strong> Brand
          names listed represent authentic factory surplus, overproduction, or cancelled export shipments sourced across
          Bangladesh. All trademarks remain the property of their respective owners.
        </Reveal>
      </div>
    </div>
  );
}
