'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ship, Plane, Download, Copy, Check, X, RefreshCw, ArrowUpRight } from 'lucide-react';
import { portalApi } from '@/services/portalApi';
import type { PortalOrderDetail } from '@/types/portal';
import { useApp } from '@/store/AppContext';
import { PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';

export default function AccountOrdersPage() {
  const { formatPrice, notify } = useApp();
  const [orders, setOrders] = useState<PortalOrderDetail[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | PortalOrderDetail['status']>('all');
  const [q, setQ] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PortalOrderDetail | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  const [copiedBl, setCopiedBl] = useState(false);

  useEffect(() => {
    portalApi.getOrders().then(setOrders);
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchQ =
      !q.trim() ||
      o.id.toLowerCase().includes(q.toLowerCase()) ||
      o.blOrAwbNumber.toLowerCase().includes(q.toLowerCase()) ||
      o.destinationPort.toLowerCase().includes(q.toLowerCase());
    return matchStatus && matchQ;
  });

  const openWarRoom = (ord: PortalOrderDetail) => {
    setSelectedOrder(ord);
    setActiveStepIdx(Math.max(0, ord.currentStep - 1));
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Export Visibility</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Orders &amp; 10-Step Shipment Tracker
          </h1>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#86868B]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search Order ID, BL/AWB..."
            className="luminous-input w-full rounded-full py-2 pl-9 pr-4 text-xs"
          />
        </div>
      </div>

      <SegmentedControl
        layoutId="orderStatusFilter"
        value={statusFilter}
        onChange={setStatusFilter}
        options={[
          { label: 'All Orders', value: 'all' },
          { label: 'Staging / OEM', value: 'staging' },
          { label: 'In AQL QC', value: 'qc' },
          { label: 'In Transit', value: 'in_transit' },
          { label: 'Delivered', value: 'delivered' },
        ]}
      />

      <div className="space-y-4">
        {filtered.map((ord) => (
          <div key={ord.id} className="ambient-card rounded-[28px] p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-indigo-600">{ord.id}</span>
                  <SpecBadge tone="neutral">{ord.type}</SpecBadge>
                  <SpecBadge tone={ord.status === 'delivered' ? 'emerald' : 'original'}>{ord.statusLabel}</SpecBadge>
                </div>
                <h2 className="mt-2 flex items-center gap-2 text-base font-semibold text-[#0A0B0E]">
                  {ord.freightMode === 'Air Express' ? (
                    <Plane className="h-4 w-4 text-sky-500" />
                  ) : (
                    <Ship className="h-4 w-4 text-indigo-600" />
                  )}
                  {ord.originPort} → {ord.destinationPort}
                </h2>
                <p className="mt-1 font-mono text-xs text-[#6E6E73]">
                  {ord.freightMode} · {ord.totalPieces.toLocaleString()} pcs · {ord.totalCbm} m³ · {ord.totalWeightKg} KG · BL/AWB: {ord.blOrAwbNumber}
                </p>
              </div>

              <div className="text-right">
                <p className="font-mono text-xl font-semibold text-[#0A0B0E]">{formatPrice(ord.totalUsd)}</p>
                <p className="font-mono text-[11px] text-[#6E6E73]">ETA: {ord.etaDate}</p>
              </div>
            </div>

            {/* 10-Step Progress Bar */}
            <div className="mt-5">
              <div className="grid grid-cols-10 gap-1.5">
                {ord.milestones.map((m) => (
                  <button
                    key={m.step}
                    type="button"
                    title={`${m.step}. ${m.label}`}
                    onClick={() => {
                      setSelectedOrder(ord);
                      setActiveStepIdx(m.step - 1);
                    }}
                    className={`h-2 cursor-pointer rounded-full transition-opacity hover:opacity-80 ${
                      m.step <= ord.currentStep
                        ? 'bg-gradient-to-r from-sky-400 to-indigo-500'
                        : 'bg-black/[0.06]'
                    }`}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#6E6E73]">
                <span className="font-mono">Stage {ord.currentStep}/10: {ord.milestones[ord.currentStep - 1]?.label}</span>
                <button
                  type="button"
                  onClick={() => openWarRoom(ord)}
                  className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#0A0B0E] hover:text-indigo-600"
                >
                  Open Shipment War Room <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SLIDE-OVER ORDER WAR ROOM DRAWER */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-white/55 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.34, ease: APPLE_EASE }}
              className="relative z-10 flex h-full w-full max-w-2xl flex-col overflow-y-auto border-l border-black/[0.08] bg-white/95 p-6 backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex items-start justify-between border-b border-black/[0.06] pb-4">
                <div>
                  <p className="font-mono text-xs font-semibold text-indigo-600">ORDER WAR ROOM · {selectedOrder.id}</p>
                  <h3 className="mt-0.5 text-xl font-semibold text-[#0A0B0E]">
                    {selectedOrder.originPort} → {selectedOrder.destinationPort}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="cursor-pointer rounded-full bg-[#F5F5F7] p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Carrier Telemetry */}
              <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl bg-[#FAFAFC] p-4 border border-black/[0.05] font-mono text-xs sm:grid-cols-4">
                <div>
                  <p className="font-sans text-[10px] text-[#6E6E73]">Carrier / Vessel</p>
                  <p className="mt-0.5 font-semibold text-[#0A0B0E]">{selectedOrder.vesselOrFlight}</p>
                </div>
                <div>
                  <p className="font-sans text-[10px] text-[#6E6E73]">BL / AWB No.</p>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(selectedOrder.blOrAwbNumber);
                      setCopiedBl(true);
                      notify('Copied BL/AWB Tracking ID');
                      setTimeout(() => setCopiedBl(false), 1500);
                    }}
                    className="mt-0.5 inline-flex cursor-pointer items-center gap-1 font-semibold text-indigo-600"
                  >
                    {selectedOrder.blOrAwbNumber}
                    {copiedBl ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div>
                  <p className="font-sans text-[10px] text-[#6E6E73]">Volume / Wt</p>
                  <p className="mt-0.5 font-semibold text-[#0A0B0E]">{selectedOrder.totalCbm}m³ · {selectedOrder.totalWeightKg}KG</p>
                </div>
                <div>
                  <p className="font-sans text-[10px] text-[#6E6E73]">Est. Arrival</p>
                  <p className="mt-0.5 font-semibold text-emerald-700">{selectedOrder.etaDate}</p>
                </div>
              </div>

              {/* Clickable 10-Step Milestone Inspector */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-[#0A0B0E]">Interactive 10-Step Export Log</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {selectedOrder.milestones.map((m, idx) => (
                    <button
                      key={m.step}
                      type="button"
                      onClick={() => setActiveStepIdx(idx)}
                      className={`cursor-pointer rounded-xl border p-2.5 text-left transition-all ${
                        activeStepIdx === idx
                          ? 'prismatic-ring border-transparent bg-white'
                          : m.completedAt
                            ? 'border-emerald-200/70 bg-emerald-50/40'
                            : 'border-black/[0.06] bg-[#FAFAFC] opacity-60'
                      }`}
                    >
                      <span className="font-mono text-[10px] font-semibold text-indigo-600">0{m.step}</span>
                      <p className="mt-0.5 line-clamp-2 text-[11px] font-medium text-[#0A0B0E]">{m.label}</p>
                    </button>
                  ))}
                </div>
                {selectedOrder.milestones[activeStepIdx] && (
                  <div className="mt-3 rounded-2xl bg-[#F5F5F7] p-3.5 text-xs">
                    <p className="font-semibold text-[#0A0B0E]">
                      Step {selectedOrder.milestones[activeStepIdx].step}: {selectedOrder.milestones[activeStepIdx].label}
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-[#515154]">
                      {selectedOrder.milestones[activeStepIdx].completedAt
                        ? `Completed ${selectedOrder.milestones[activeStepIdx].completedAt} · Officer: ${selectedOrder.milestones[activeStepIdx].officer}`
                        : 'Scheduled next in Dhaka export workflow.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Itemized SKU Manifest */}
              <div className="mt-6">
                <p className="text-xs font-semibold text-[#0A0B0E]">Itemized Garment Manifest</p>
                <div className="mt-2.5 space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.sku}
                      className="flex items-center justify-between rounded-2xl border border-black/[0.06] p-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-[#0A0B0E]">{item.brand} — {item.title}</p>
                        <p className="font-mono text-[11px] text-[#6E6E73]">
                          {item.sku} · {item.cartons} ctns · {item.sizeRatio}
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <p className="font-semibold text-[#0A0B0E]">{formatPrice(item.quantity * item.unitPriceUsd)}</p>
                        <p className="text-[10px] text-[#6E6E73]">
                          {item.quantity} × {formatPrice(item.unitPriceUsd)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="mt-auto flex flex-wrap gap-2 border-t border-black/[0.06] pt-5">
                <PrismaticButton
                  size="sm"
                  onClick={() => notify(`Downloading ZIP Export Bundle (PI, CI, PL, BL) for ${selectedOrder.id}`)}
                >
                  <Download className="h-3.5 w-3.5" /> Download Full Export Bundle (ZIP)
                </PrismaticButton>
                <PrismaticButton
                  size="sm"
                  variant="glass"
                  onClick={() => notify(`Cloned ${selectedOrder.id} manifest into new Reorder RFQ`)}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Reorder Similar Mix
                </PrismaticButton>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
