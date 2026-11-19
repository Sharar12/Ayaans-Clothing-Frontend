import React from 'react';
import Link from 'next/link';
import { ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-black/[0.06] bg-[#FAFAFC]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#0A0B0E] text-xs font-bold text-white">
                AC
              </span>
              <div>
                <p className="text-sm font-semibold tracking-[-0.02em] text-[#0A0B0E]">AYAAN CLOTHING</p>
                <p className="text-[11px] text-[#6E6E73]">RMG Manufacturer · Stock Lot Exporter · Buying House</p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#6E6E73]">
              Direct from Dhaka since 2010. Connecting global wholesalers, outlet chains, and private-label brands to
              600+ verified Bangladeshi garment factories with AQL 2.5 precision.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-mono text-[11px] text-[#1D1D1F]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                ISO 9001:2015
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-mono text-[11px] text-[#1D1D1F]">
                BGMEA Reg #1708
              </span>
            </div>
          </div>

          {/* Sitemap Columns */}
          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0A0B0E]">Catalog</p>
            <ul className="space-y-2 text-sm text-[#6E6E73]">
              {['Men', 'Women', 'Boys', 'Girls', 'Unisex'].map((a) => (
                <li key={a}>
                  <Link href={`/catalog?audience=${a}`} className="transition-colors hover:text-[#0A0B0E]">
                    {a}&apos;s Apparel
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/new-arrivals" className="transition-colors hover:text-[#0A0B0E]">
                  Daily Warehouse Drops
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0A0B0E]">Sourcing</p>
            <ul className="space-y-2 text-sm text-[#6E6E73]">
              <li><Link href="/brands" className="hover:text-[#0A0B0E]">Brands Directory</Link></li>
              <li><Link href="/services" className="hover:text-[#0A0B0E]">Custom OEM &amp; Buying House</Link></li>
              <li><Link href="/rfq" className="hover:text-[#0A0B0E]">Request Quotation (RFQ)</Link></li>
              <li><Link href="/compliance" className="hover:text-[#0A0B0E]">Certifications Vault</Link></li>
              <li><Link href="/account" className="hover:text-[#0A0B0E]">Buyer Portal</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#0A0B0E]">Dhaka Export Desk</p>
            <div className="space-y-2.5 text-sm text-[#515154]">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6E6E73]" />
                <span>House #33 (2nd Floor), Road #12, Sector #11, Uttara, Dhaka-1230, Bangladesh</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#6E6E73]" />
                <a href="mailto:export@ayaanclothing.com" className="font-mono text-xs hover:text-[#0A0B0E]">
                  export@ayaanclothing.com
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#6E6E73]" />
                <span className="font-mono text-xs">+880 1620-853502 · +880 1982-183886</span>
              </p>
              <div className="flex gap-4 pt-2 text-xs text-[#6E6E73]">
                <Link href="/about" className="hover:text-[#0A0B0E]">Visit Bangladesh</Link>
                <Link href="/faq" className="hover:text-[#0A0B0E]">Buyer FAQ</Link>
                <Link href="/contact" className="hover:text-[#0A0B0E]">Contact</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Trademark Notice */}
        <div className="mt-12 border-t border-black/[0.06] pt-6">
          <p className="text-[11px] leading-relaxed text-[#86868B]">
            Trademark Disclaimer: All third-party brand names, trademarks, and labels referenced in stock-lot listings
            belong exclusively to their respective owners. Ayaan Clothing operates as an independent Ready-Made Garments
            manufacturer, buying house, and factory-surplus exporter based in Bangladesh and claims no brand affiliation.
          </p>
          <div className="mt-4 flex flex-col items-start justify-between gap-3 text-xs text-[#6E6E73] sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} Ayaan Clothing Bangladesh. Established 2010. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-[#0A0B0E]">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#0A0B0E]">Commercial Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
