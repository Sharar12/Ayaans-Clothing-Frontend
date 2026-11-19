"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowRight, Box } from "lucide-react";

const PRESETS = [
  { name: "Heavyweight Hoodie (420 GSM)", baseBdt: 1180, cbmPer100: 0.48, weightPer100: 68 },
  { name: "Pima Cotton Tee (210 GSM)", baseBdt: 390, cbmPer100: 0.18, weightPer100: 24 },
  { name: "Selvedge Denim Jacket (13.5 OZ)", baseBdt: 1650, cbmPer100: 0.56, weightPer100: 84 },
  { name: "12GG Merino Blend Sweater", baseBdt: 1090, cbmPer100: 0.34, weightPer100: 44 },
];

export function InteractiveEstimator() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [qty, setQty] = useState(1000);

  const preset = PRESETS[selectedIdx];
  const discount = qty >= 3000 ? 0.78 : qty >= 1000 ? 0.88 : 1;
  const unitPrice = Math.round((preset.baseBdt * discount) / 10) * 10;
  const totalBdt = unitPrice * qty;
  const cbm = (qty / 100) * preset.cbmPer100;
  const weightKg = (qty / 100) * preset.weightPer100;
  const containerFit =
    cbm > 26 ? "40ft FCL Container" : cbm > 12 ? "20ft FCL Container" : "LCL Sea / Air Cargo";

  return (
    <div className="border border-hairline glass-panel p-8 md:p-12 grid lg:grid-cols-12 gap-10 items-center shadow-sm">
      <div className="lg:col-span-6 space-y-6">
        <div className="inline-flex items-center gap-2 font-mono text-xs uppercase text-muted">
          <Calculator className="w-4 h-4 text-ink" />
          Instant B2B Cost & Logistics Estimator
        </div>
        <h3 className="font-display font-bold text-3xl text-ink leading-tight">
          Simulate Your Bulk Order in BDT (৳)
        </h3>
        <p className="text-sm text-muted leading-relaxed">
          Select a garment program and slide your target volume to estimate Ex-Dhaka unit pricing,
          total FOB value, and export shipping volume (CBM).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {PRESETS.map((item, idx) => (
            <button
              key={item.name}
              type="button"
              aria-pressed={selectedIdx === idx}
              onClick={() => setSelectedIdx(idx)}
              className={`p-3.5 text-left border text-xs font-medium transition-all ${
                selectedIdx === idx
                  ? "border-ink bg-ink text-white"
                  : "border-hairline bg-surface/40 text-ink hover:border-ink/50"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>

        <div className="pt-2">
          <div className="flex justify-between font-mono text-xs mb-2">
            <label htmlFor="bulk-order-volume" className="text-muted uppercase">
              Order Volume
            </label>
            <span className="text-ink font-bold">{qty.toLocaleString("en-BD")} PCS</span>
          </div>
          <input
            id="bulk-order-volume"
            type="range"
            min={200}
            max={5000}
            step={100}
            value={qty}
            onChange={(event) => setQty(Number(event.target.value))}
            className="w-full accent-ink cursor-pointer"
          />
          <div className="flex justify-between font-mono text-[10px] text-muted mt-1">
            <span>200 pcs (Stock Lot)</span>
            <span>1,000 pcs (-12%)</span>
            <span>3,000+ pcs (-22%)</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-6 bg-surface border border-hairline p-8 space-y-6">
        <div className="flex items-center justify-between gap-3 border-b border-hairline pb-4">
          <span className="font-mono text-xs uppercase text-muted">Estimated Quote</span>
          <span className="px-2.5 py-1 bg-white border border-hairline font-mono text-[11px] text-ink flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5" /> {containerFit}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 font-mono">
          <div>
            <span className="block text-[10px] uppercase text-muted">Est. Unit Price</span>
            <span className="text-2xl sm:text-3xl font-bold text-ink">
              ৳{unitPrice.toLocaleString("en-BD")}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-muted">Est. Total (BDT)</span>
            <span className="text-2xl sm:text-3xl font-bold text-ink">
              ৳{totalBdt.toLocaleString("en-BD")}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-muted">Shipping Volume</span>
            <span className="text-lg font-bold text-ink">{cbm.toFixed(2)} CBM</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase text-muted">Gross Weight</span>
            <span className="text-lg font-bold text-ink">{weightKg.toFixed(0)} KG</span>
          </div>
        </div>

        <Link
          href="/rfq"
          className="w-full py-4 bg-ink text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors"
        >
          Lock This Quote via Official RFQ
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
