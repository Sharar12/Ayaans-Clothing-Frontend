'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, HelpCircle } from 'lucide-react';
import { api } from '@/services/api';
import type { FaqItem } from '@/types';
import { AmbientAura, PrismaticButton, Reveal, VideoBackground } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const [openId, setOpenId] = useState<string | null>('faq-1');

  useEffect(() => {
    api.getFaqs().then(setFaqs);
  }, []);

  const categories = ['All', ...Array.from(new Set(faqs.map((f) => f.category)))];
  const filtered = faqs.filter((f) => {
    const matchCat = activeCat === 'All' || f.category === activeCat;
    const matchQ =
      !query.trim() ||
      f.question.toLowerCase().includes(query.toLowerCase()) ||
      f.answer.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/generate_a_white_background_wi.mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="subtle" />

      <div className="relative mx-auto max-w-4xl px-4 pt-14 sm:px-6">
        <Reveal className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-600">Wholesale Buyer Guide</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-5xl">
            Frequently Asked Questions
          </h1>

          {/* Prismatic Search Input */}
          <div className="prismatic-ring mx-auto mt-7 flex max-w-xl items-center gap-3 rounded-full bg-white px-5 py-3 shadow-xs">
            <Search className="h-4 w-4 text-indigo-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search MOQ, L/C payment, AQL 2.5, labels, CBM shipping..."
              className="w-full bg-transparent text-sm text-[#0A0B0E] placeholder:text-[#86868B] focus:outline-none"
            />
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCat(cat)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  activeCat === cat ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154] hover:text-[#0A0B0E]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Spring-Animated Accordions */}
        <Reveal delay={0.1} className="mt-10 space-y-3">
          {filtered.map((item) => {
            const expanded = openId === item.id;
            return (
              <div
                key={item.id}
                className="overflow-hidden rounded-3xl border border-black/[0.07] bg-white transition-shadow hover:shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(expanded ? null : item.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-indigo-600">{item.category}</span>
                    <p className="mt-0.5 text-sm font-semibold text-[#0A0B0E] sm:text-base">{item.question}</p>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#6E6E73] transition-transform duration-300 ${
                      expanded ? 'rotate-180 text-[#0A0B0E]' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: APPLE_EASE }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-black/[0.05] px-6 py-4 text-sm leading-relaxed text-[#515154]">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </Reveal>

        {/* Contextual Help CTA */}
        <Reveal delay={0.15} className="mt-12 flex flex-col items-center justify-between gap-4 rounded-3xl border border-black/[0.06] bg-[#FAFAFC] p-7 sm:flex-row">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-indigo-600" />
            <div>
              <p className="text-sm font-semibold text-[#0A0B0E]">Have a specific sourcing or container question?</p>
              <p className="text-xs text-[#6E6E73]">Speak directly with our senior Dhaka merchandisers.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/rfq"><PrismaticButton size="sm">Request Quote</PrismaticButton></Link>
            <Link href="/contact"><PrismaticButton size="sm" variant="glass">Contact Desk</PrismaticButton></Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
