'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Globe,
  User,
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { PrismaticButton } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';
import type { CurrencyCode, LocaleCode } from '@/types';

const NAV_LINKS = [
  { label: 'Daily Drops', href: '/new-arrivals', live: true },
  { label: 'Brands', href: '/brands' },
  { label: 'OEM & Services', href: '/services' },
  { label: 'Compliance', href: '/compliance' },
  { label: 'About', href: '/about' },
];

const AUDIENCES = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
const CATEGORIES = ['T-Shirts', 'Hoodies', 'Sweaters', 'Jackets', 'Pants', 'Trousers', 'Activewear', 'Polo Shirts', 'Knitwear'];
const COUNTRIES = ['Bangladesh', 'United Kingdom', 'Germany', 'United Arab Emirates', 'United States', 'France', 'Spain', 'Saudi Arabia', 'Canada'];

export function Navbar() {
  const pathname = usePathname();
  const {
    bag,
    rfqList,
    totals,
    locale,
    currency,
    deliverTo,
    setLocale,
    setCurrency,
    setDeliverTo,
    openBagDrawer,
    setSpotlightOpen,
    buyer,
  } = useApp();

  const [megaOpen, setMegaOpen] = useState(false);
  const [localeOpen, setLocaleOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const totalBadgeCount = bag.length + rfqList.length;

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] bg-white/78 backdrop-blur-2xl saturate-180">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Wordmark */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#0A0B0E] text-xs font-bold tracking-tighter text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
              AC
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-400 to-rose-400 ring-2 ring-white" />
            </span>
            <div className="leading-none whitespace-nowrap">
              <span className="block text-[15px] font-semibold tracking-[-0.03em] text-[#0A0B0E]">
                AYAAN
              </span>
              <span className="block text-[9px] font-medium uppercase tracking-[0.22em] text-[#6E6E73]">
                Clothing · Dhaka
              </span>
            </div>
          </Link>

          {/* Center Desktop Navigation */}
          <nav className="hidden shrink-0 items-center gap-1 lg:flex">
            <div
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
              className="relative"
            >
              <Link
                href="/catalog"
                className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                  pathname.startsWith('/catalog')
                    ? 'bg-[#F5F5F7] text-[#0A0B0E]'
                    : 'text-[#515154] hover:bg-[#F5F5F7]/80 hover:text-[#0A0B0E]'
                }`}
              >
                Catalog
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
              </Link>

              {/* Solid Opaque Mega-Menu */}
              <AnimatePresence>
                {megaOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                    transition={{ duration: 0.24, ease: APPLE_EASE }}
                    className="absolute left-0 top-full mt-2 w-[620px] rounded-3xl border border-black/[0.08] bg-white p-6 shadow-[0_20px_50px_-12px_rgba(10,11,14,0.18)] ring-1 ring-black/[0.04]"
                  >
                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-4 space-y-2 border-r border-black/[0.06] pr-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6E73]">
                          Audiences
                        </p>
                        {AUDIENCES.map((aud) => (
                          <Link
                            key={aud}
                            href={`/catalog?audience=${aud}`}
                            onClick={() => setMegaOpen(false)}
                            className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-sm font-medium text-[#1D1D1F] transition-colors hover:bg-[#F5F5F7]"
                          >
                            {aud}
                            <ArrowUpRight className="h-3.5 w-3.5 text-[#86868B]" />
                          </Link>
                        ))}
                        <div className="pt-2">
                          <Link
                            href="/catalog?designType=ORIGINAL"
                            onClick={() => setMegaOpen(false)}
                            className="block rounded-xl bg-indigo-50/70 px-3 py-2 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                          >
                            Original Surplus Lots →
                          </Link>
                        </div>
                      </div>

                      <div className="col-span-8">
                        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6E6E73]">
                          Categories
                        </p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {CATEGORIES.map((cat) => (
                            <Link
                              key={cat}
                              href={`/catalog?category=${encodeURIComponent(cat)}`}
                              onClick={() => setMegaOpen(false)}
                              className="rounded-xl px-3 py-1.5 text-sm text-[#515154] transition-colors hover:bg-[#F5F5F7] hover:text-[#0A0B0E]"
                            >
                              {cat}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#F5F5F7] via-indigo-50/40 to-sky-50/50 p-3.5 border border-black/[0.04]">
                          <div>
                            <p className="text-xs font-semibold text-[#0A0B0E]">Need Custom Private Label?</p>
                            <p className="text-[11px] text-[#6E6E73]">OEM production from 500 pcs/style</p>
                          </div>
                          <Link
                            href="/services"
                            onClick={() => setMegaOpen(false)}
                            className="rounded-full bg-[#0A0B0E] px-3 py-1.5 text-[11px] font-medium text-white"
                          >
                            OEM Desk
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV_LINKS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-[#F5F5F7] text-[#0A0B0E]'
                      : 'text-[#515154] hover:bg-[#F5F5F7]/80 hover:text-[#0A0B0E]'
                  }`}
                >
                  {item.live && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Utility Controls */}
          <div className="flex shrink-0 items-center gap-2">
            {/* Cmd+K Spotlight Search Trigger */}
            <button
              type="button"
              onClick={() => setSpotlightOpen(true)}
              className="glass-pill prismatic-ring prismatic-hover hidden shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs text-[#6E6E73] transition-colors hover:text-[#0A0B0E] sm:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search SKU, Brand...</span>
              <kbd className="rounded bg-[#F5F5F7] px-1.5 py-0.5 font-mono text-[10px] text-[#515154]">⌘K</kbd>
            </button>

            <button
              type="button"
              aria-label="Search"
              onClick={() => setSpotlightOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#515154] hover:bg-[#F5F5F7] sm:hidden"
            >
              <Search className="h-4 w-4" />
            </button>

            {/* Locale / Currency / Ship-to Popover */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setLocaleOpen((o) => !o)}
                className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-medium text-[#515154] hover:bg-[#F5F5F7] hover:text-[#0A0B0E]"
              >
                <Globe className="h-3.5 w-3.5" />
                <span className="font-mono">{locale}·{currency}</span>
              </button>
              <AnimatePresence>
                {localeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="glass-surface absolute right-0 top-full mt-2 w-72 rounded-2xl p-4"
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
                          Language (Supports Arabic RTL)
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(['EN', 'BN', 'AR', 'ES', 'FR'] as LocaleCode[]).map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() => setLocale(l)}
                              className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium ${
                                locale === l ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'
                              }`}
                            >
                              {l === 'BN' ? 'বাংলা' : l === 'AR' ? 'العربية' : l}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
                          Display Currency
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(['BDT', 'USD', 'EUR', 'GBP', 'AED'] as CurrencyCode[]).map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setCurrency(c)}
                              className={`cursor-pointer rounded-full px-2.5 py-1 font-mono text-xs ${
                                currency === c ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
                          Deliver To Destination
                        </p>
                        <select
                          value={deliverTo}
                          onChange={(e) => setDeliverTo(e.target.value)}
                          className="luminous-input w-full rounded-xl px-3 py-1.5 text-xs text-[#0A0B0E]"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bag + Live CBM Trigger */}
            <button
              type="button"
              onClick={() => openBagDrawer('bag')}
              className="relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F5F5F7] px-3 text-xs font-medium text-[#0A0B0E] transition-colors hover:bg-[#EAEAEF]"
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              {totals.totalCbm > 0 && (
                <span className="hidden font-mono text-[11px] text-[#515154] xl:inline">
                  {totals.totalCbm.toFixed(2)}m³
                </span>
              )}
              {totalBadgeCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0A0B0E] px-1 font-mono text-[10px] text-white">
                  {totalBadgeCount}
                </span>
              )}
            </button>

            {/* Buyer Portal Icon */}
            <Link
              href="/account"
              aria-label="Buyer Portal"
              className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                buyer ? 'bg-indigo-50 text-indigo-700' : 'text-[#515154] hover:bg-[#F5F5F7] hover:text-[#0A0B0E]'
              }`}
            >
              <User className="h-4 w-4" />
            </Link>

            {/* Primary Request Quote CTA */}
            <Link href="/rfq" className="hidden shrink-0 sm:block">
              <PrismaticButton size="sm" prismatic className="whitespace-nowrap">
                <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                Request Quote
              </PrismaticButton>
            </Link>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen((m) => !m)}
              className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#0A0B0E] hover:bg-[#F5F5F7] lg:hidden"
              aria-label="Toggle Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed inset-x-0 top-16 z-30 border-b border-black/10 bg-white/95 p-5 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'Master Catalog', href: '/catalog' },
                ...NAV_LINKS,
                { label: 'Wholesale FAQ', href: '/faq' },
                { label: 'Contact Export Desk', href: '/contact' },
                { label: 'Buyer Portal', href: '/account' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl px-4 py-2.5 text-sm font-medium text-[#0A0B0E] hover:bg-[#F5F5F7]"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/rfq" onClick={() => setMobileOpen(false)} className="mt-2">
                <PrismaticButton className="w-full" prismatic>
                  Submit Wholesale RFQ
                </PrismaticButton>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
