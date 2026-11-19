'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ship, Plane, Box, CheckCircle2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { portalApi } from '@/services/portalApi';
import { AmbientAura, PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';

type ContainerMode = 'air' | 'lcl' | 'fcl20' | 'fcl40' | 'hc40';

const MODES: Record<ContainerMode, { label: string; maxCbm: number; maxKg: number; estFreightUsd: number }> = {
  air: { label: 'Air Express', maxCbm: 3, maxKg: 500, estFreightUsd: 1650 },
  lcl: { label: 'Sea LCL', maxCbm: 18, maxKg: 6000, estFreightUsd: 1180 },
  fcl20: { label: '20ft FCL', maxCbm: 28, maxKg: 18000, estFreightUsd: 2150 },
  fcl40: { label: '40ft FCL', maxCbm: 58, maxKg: 24000, estFreightUsd: 3350 },
  hc40: { label: '40ft High Cube', maxCbm: 68, maxKg: 26000, estFreightUsd: 3650 },
};

interface ConsolidationLot {
  id: string;
  source: 'Uttara Reserved' | 'Active Wholesale Bag';
  title: string;
  pcs: number;
  cbm: number;
  kg: number;
  selected: boolean;
}

export default function ContainerPlannerPage() {
  const { bag, formatPrice, notify } = useApp();
  const [mode, setMode] = useState<ContainerMode>('fcl20');
  const [lots, setLots] = useState<ConsolidationLot[]>([]);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    portalApi.getOrders().then((orders) => {
      const stagedLots: ConsolidationLot[] = orders
        .filter((o) => o.status !== 'delivered')
        .flatMap((o) =>
          o.items.map((i) => ({
            id: `${o.id}-${i.sku}`,
            source: 'Uttara Reserved' as const,
            title: `${i.brand} · ${i.title}`,
            pcs: i.quantity,
            cbm: Number(((o.totalCbm / o.totalPieces) * i.quantity).toFixed(2)),
            kg: Number(((o.totalWeightKg / o.totalPieces) * i.quantity).toFixed(0)),
            selected: true,
          }))
        );

      const bagLots: ConsolidationLot[] = bag.map((b) => ({
        id: `bag-${b.product.sku}`,
        source: 'Active Wholesale Bag' as const,
        title: `${b.product.brand} · ${b.product.title}`,
        pcs: b.quantity,
        cbm: Number((b.quantity * b.product.unitCbm).toFixed(2)),
        kg: Number((b.quantity * b.product.unitWeightKg).toFixed(0)),
        selected: true,
      }));

      setLots([...stagedLots, ...bagLots]);
    });
  }, [bag]);

  const activeLots = lots.filter((l) => l.selected);
  const totalPcs = activeLots.reduce((s, l) => s + l.pcs, 0);
  const totalCbm = activeLots.reduce((s, l) => s + l.cbm, 0);
  const totalKg = activeLots.reduce((s, l) => s + l.kg, 0);

  const spec = MODES[mode];
  const fillPct = Math.min(100, Math.round((totalCbm / spec.maxCbm) * 100));
  const estFreightPerPiece = totalPcs > 0 ? spec.estFreightUsd / totalPcs : 0;

  const toggleLot = (id: string) =>
    setLots((prev) => prev.map((l) => (l.id === id ? { ...l, selected: !l.selected } : l)));

  return (
    <div className="relative mx-auto max-w-6xl space-y-7 pb-12">
      <AmbientAura variant="cool" />

      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Freight Engineering</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Live Container &amp; Consolidation Planner
          </h1>
          <p className="mt-1 text-xs text-[#6E6E73]">
            Combine multiple stock lots &amp; OEM cartons into one Chattogram shipment to minimize landed freight cost per garment.
          </p>
        </div>

        <SegmentedControl
          layoutId="containerMode"
          value={mode}
          onChange={setMode}
          options={(Object.keys(MODES) as ContainerMode[]).map((k) => ({ label: MODES[k].label, value: k }))}
        />
      </div>

      {/* Interactive Container Load Bay Visualizer */}
      <div className="glass-surface relative rounded-[30px] p-6 sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0B0E]">
                {mode === 'air' ? <Plane className="h-4 w-4 text-sky-600" /> : <Ship className="h-4 w-4 text-indigo-600" />}
                {spec.label} Volumetric Bay
              </span>
              <span className="font-mono text-sm font-semibold text-[#0A0B0E]">
                {totalCbm.toFixed(2)} / {spec.maxCbm} m³ ({fillPct}%)
              </span>
            </div>

            {/* Volumetric Graphic Gauge */}
            <div className="mt-4 h-14 w-full overflow-hidden rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(fillPct, totalCbm > 0 ? 5 : 0)}%` }}
                transition={{ duration: 0.55, ease: APPLE_EASE }}
                className="flex h-full items-center justify-end rounded-xl bg-gradient-to-r from-sky-400 via-indigo-500 to-rose-400 px-3 font-mono text-xs font-semibold text-white"
              >
                {fillPct >= 18 ? `${fillPct}% LOADED` : ''}
              </motion.div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="rounded-2xl bg-white p-3.5 border border-black/[0.05]">
                <p className="font-sans text-[10px] text-[#6E6E73]">Consolidated Pieces</p>
                <p className="mt-0.5 text-base font-semibold text-[#0A0B0E]">{totalPcs.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl bg-white p-3.5 border border-black/[0.05]">
                <p className="font-sans text-[10px] text-[#6E6E73]">Gross Payload</p>
                <p className="mt-0.5 text-base font-semibold text-[#0A0B0E]">{totalKg.toLocaleString()} KG</p>
              </div>
              <div className="rounded-2xl bg-white p-3.5 border border-black/[0.05]">
                <p className="font-sans text-[10px] text-[#6E6E73]">Remaining Capacity</p>
                <p className="mt-0.5 text-base font-semibold text-indigo-600">
                  {Math.max(0, spec.maxCbm - totalCbm).toFixed(2)} m³
                </p>
              </div>
            </div>
          </div>

          {/* Landed Cost Simulator */}
          <div className="flex flex-col justify-between rounded-3xl bg-[#0A0B0E] p-6 text-white lg:col-span-5">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-sky-300">
                Freight Cost Efficiency Simulator
              </p>
              <p className="mt-3 font-mono text-3xl font-semibold">{formatPrice(estFreightPerPiece)} / pc</p>
              <p className="mt-1 text-xs text-white/70">
                Est. {spec.label} base freight ({formatPrice(spec.estFreightUsd)}) amortized across{' '}
                {totalPcs.toLocaleString()} consolidated pieces.
              </p>
            </div>

            <div className="mt-6">
              {locked ? (
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 px-4 py-3 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Consolidation plan sent to Chattogram Freight Desk!
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setLocked(true);
                    notify(`Locked ${spec.label} consolidation plan (${totalCbm.toFixed(2)} m³)`);
                  }}
                  className="w-full cursor-pointer rounded-full bg-white py-3 text-xs font-semibold text-[#0A0B0E] transition-transform hover:scale-[1.01]"
                >
                  Lock Consolidation Plan &amp; Request Vessel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lot Assignment Table */}
      <div className="overflow-hidden rounded-[28px] border border-black/[0.07] bg-white">
        <div className="flex items-center justify-between border-b border-black/[0.06] bg-[#FAFAFC] px-6 py-4">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#0A0B0E]">
            <Box className="h-4 w-4 text-indigo-600" /> Select Lots to Consolidate in This Shipment
          </span>
          <span className="font-mono text-[11px] text-[#6E6E73]">{activeLots.length} of {lots.length} selected</span>
        </div>
        <div className="divide-y divide-black/[0.05]">
          {lots.map((l) => (
            <label
              key={l.id}
              className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-6 py-4 text-xs transition-colors hover:bg-[#FAFAFC]"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={l.selected}
                  onChange={() => toggleLot(l.id)}
                  className="h-4 w-4 accent-[#0A0B0E]"
                />
                <div>
                  <p className="font-semibold text-[#0A0B0E]">{l.title}</p>
                  <SpecBadge tone={l.source === 'Uttara Reserved' ? 'emerald' : 'original'} className="mt-1 !py-0 !text-[10px]">
                    {l.source}
                  </SpecBadge>
                </div>
              </div>
              <div className="flex items-center gap-5 font-mono text-[#515154]">
                <span>{l.pcs.toLocaleString()} pcs</span>
                <span>{l.kg} KG</span>
                <span className="font-semibold text-[#0A0B0E]">{l.cbm} m³</span>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
