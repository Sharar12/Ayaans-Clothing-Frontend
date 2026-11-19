'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, ShieldCheck, Sparkles, Ship, FileText, AlertCircle, Clock } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { portalApi } from '@/services/portalApi';
import type { PortalOrderDetail, PortalRfqRecord, QcInspectionReport, VipDropItem } from '@/types/portal';
import { AmbientAura, BentoTile, PrismaticButton, SpecBadge } from '@/design-system/primitives';

export default function AccountOverviewPage() {
  const { buyer, formatPrice } = useApp();
  const [orders, setOrders] = useState<PortalOrderDetail[]>([]);
  const [rfqs, setRfqs] = useState<PortalRfqRecord[]>([]);
  const [drops, setDrops] = useState<VipDropItem[]>([]);
  const [qcList, setQcList] = useState<QcInspectionReport[]>([]);

  useEffect(() => {
    Promise.all([
      portalApi.getOrders(),
      portalApi.getRfqs(),
      portalApi.getVipDrops(),
      portalApi.getInspections(),
    ]).then(([o, r, d, q]) => {
      setOrders(o);
      setRfqs(r);
      setDrops(d);
      setQcList(q);
    });
  }, []);

  const primaryOrder = orders[0];
  const pendingQc = qcList.filter((q) => q.buyerApproval === 'pending');
  const readyQuotes = rfqs.filter((r) => r.status === 'quote_ready');
  const ytdUsd = orders.reduce((s, o) => s + o.totalUsd, 0);
  const ytdPieces = orders.reduce((s, o) => s + o.totalPieces, 0);
  const stagedCbm = orders.filter((o) => o.status !== 'delivered').reduce((s, o) => s + o.totalCbm, 0);

  return (
    <div className="relative mx-auto max-w-6xl space-y-8 pb-12">
      <AmbientAura variant="subtle" />

      {/* Welcome Header */}
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <SpecBadge tone="emerald">
            <ShieldCheck className="h-3 w-3" /> Verified Importer · FOB / CIF / L/C Eligible
          </SpecBadge>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-4xl">
            Good day, {buyer?.name.split(' ')[0]} · {buyer?.company}
          </h1>
          <p className="mt-1 text-xs text-[#6E6E73]">
            Live overview of your Dhaka stock-lot reservations, AQL 2.5 audits, and container consolidations.
          </p>
        </div>
        <Link href="/catalog">
          <PrismaticButton size="sm" variant="glass">
            Browse Live Catalog <ArrowUpRight className="h-3.5 w-3.5" />
          </PrismaticButton>
        </Link>
      </div>

      {/* 4 Precision KPI Bento Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoTile tint="indigo" className="!p-5">
          <p className="text-[11px] font-medium text-[#6E6E73]">Active Shipments</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-[#0A0B0E]">
            {orders.filter((o) => o.status !== 'delivered').length}
          </p>
          <p className="mt-1 font-mono text-[11px] text-emerald-700">1 AQL Passed · 1 At Sea</p>
        </BentoTile>

        <BentoTile tint="rose" className="!p-5">
          <p className="text-[11px] font-medium text-[#6E6E73]">Quotes Awaiting Action</p>
          <p className="mt-2 font-mono text-3xl font-semibold text-[#0A0B0E]">{readyQuotes.length}</p>
          <p className="mt-1 font-mono text-[11px] text-indigo-600">{rfqs.length} total active RFQs</p>
        </BentoTile>

        <BentoTile tint="sky" className="!p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-[#6E6E73]">Active CBM Load</p>
            <Ship className="h-3.5 w-3.5 text-sky-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#0A0B0E]">{stagedCbm.toFixed(1)} m³</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400"
              style={{ width: `${Math.min(100, Math.round((stagedCbm / 58) * 100))}%` }}
            />
          </div>
        </BentoTile>

        <BentoTile tint="emerald" className="!p-5">
          <p className="text-[11px] font-medium text-[#6E6E73]">YTD Sourced Volume</p>
          <p className="mt-2 font-mono text-2xl font-semibold text-[#0A0B0E]">{formatPrice(ytdUsd)}</p>
          <p className="mt-1 font-mono text-[11px] text-[#6E6E73]">{ytdPieces.toLocaleString()} PCS exported</p>
        </BentoTile>
      </div>

      {/* Action Required + Active Shipment Spotlight */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Active 10-Step Shipment Spotlight */}
        {primaryOrder && (
          <div className="ambient-card rounded-[28px] p-6 lg:col-span-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] font-semibold text-indigo-600">
                  ACTIVE SHIPMENT · {primaryOrder.id}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-[#0A0B0E]">
                  {primaryOrder.originPort} → {primaryOrder.destinationPort}
                </h2>
                <p className="mt-0.5 font-mono text-xs text-[#6E6E73]">
                  {primaryOrder.freightMode} · {primaryOrder.totalPieces.toLocaleString()} pcs · {primaryOrder.totalCbm} m³ · ETA {primaryOrder.etaDate}
                </p>
              </div>
              <SpecBadge tone="emerald">{primaryOrder.statusLabel}</SpecBadge>
            </div>

            <div className="mt-6">
              <div className="flex justify-between font-mono text-[10px] text-[#6E6E73]">
                <span>01 Inquiry</span>
                <span>06 AQL 2.5 QC</span>
                <span>10 Exported ({primaryOrder.currentStep}/10)</span>
              </div>
              <div className="mt-2 grid grid-cols-10 gap-1.5">
                {Array.from({ length: 10 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 rounded-full ${
                      idx < primaryOrder.currentStep
                        ? 'bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500'
                        : 'bg-black/[0.06]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-black/[0.05] pt-4">
              <span className="font-mono text-xs text-[#515154]">Vessel: {primaryOrder.vesselOrFlight}</span>
              <Link href="/account/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
                Open Order War Room <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        {/* Action Required Stack */}
        <div className="rounded-[28px] border border-black/[0.07] bg-[#FAFAFC] p-6 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#0A0B0E]">Action Required</h2>
            <SpecBadge tone="rose">{pendingQc.length + readyQuotes.length} Pending</SpecBadge>
          </div>

          <div className="mt-4 space-y-3">
            {pendingQc.map((q) => (
              <Link
                key={q.id}
                href="/account/inspections"
                className="prismatic-ring block rounded-2xl bg-white p-3.5 transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0B0E]">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Approve AQL 2.5 Report ({q.orderId})
                </div>
                <p className="mt-1 text-[11px] text-[#6E6E73]">
                  0 major defects across {q.sampleSize} audited garments. Review {q.photos.length} HD photos.
                </p>
              </Link>
            ))}

            {readyQuotes.map((r) => (
              <Link
                key={r.id}
                href="/account/rfqs"
                className="block rounded-2xl border border-black/[0.06] bg-white p-3.5 transition-colors hover:border-indigo-300"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-[#0A0B0E]">
                  <span className="inline-flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-indigo-600" /> {r.id} Offer Ready
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-amber-700">
                    <Clock className="h-3 w-3" /> {r.validHoursLeft}h
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-[#6E6E73]">
                  Offered {formatPrice(r.offeredUnitPriceUsd)}/pc FOB · {r.quantity.toLocaleString()} pcs
                </p>
              </Link>
            ))}

            <Link
              href="/account/documents"
              className="block rounded-2xl border border-black/[0.06] bg-white p-3.5 transition-colors hover:border-indigo-300"
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0B0E]">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> Upload Balance T/T Swift Copy
              </div>
              <p className="mt-1 text-[11px] text-[#6E6E73]">Proforma PI-2026-4812 · 30% Deposit Paid</p>
            </Link>
          </div>
        </div>
      </div>

      {/* VIP Early-Access Drops Teaser */}
      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-indigo-600">
              <Sparkles className="h-3 w-3" /> 12-Hour Verified Buyer Head Start
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-[#0A0B0E]">
              Private Uttara Warehouse Arrivals
            </h2>
          </div>
          <Link href="/account/vip-drops" className="text-xs font-semibold text-indigo-600 hover:underline">
            View All &amp; 24h Holds →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {drops.slice(0, 3).map((d) => (
            <Link
              key={d.sku}
              href="/account/vip-drops"
              className="ambient-card flex items-center gap-3.5 rounded-3xl p-3.5"
            >
              <img src={d.image} alt={d.title} className="h-20 w-20 shrink-0 rounded-2xl object-cover bg-[#F5F5F7]" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-indigo-600">{d.brand}</span>
                  {d.heldByBuyer && <SpecBadge tone="emerald" className="!py-0 !text-[9px]">HELD</SpecBadge>}
                </div>
                <p className="mt-0.5 truncate text-xs font-semibold text-[#0A0B0E]">{d.title}</p>
                <p className="mt-1 font-mono text-xs font-semibold text-[#0A0B0E]">
                  {formatPrice(d.fullLotPriceUsd)}/pc <span className="font-normal text-[#6E6E73]">· {d.availableStock} pcs</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
