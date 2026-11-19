import React from 'react';
import { VideoBackground } from '@/design-system/primitives';

export default function CommercialTermsPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th.mp4"
        topOnly
        height="320px"
        opacity={0.33}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-[#6E6E73]">Export Governance</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#0A0B0E]">Commercial Terms</h1>
      <p className="mt-2 text-xs text-[#6E6E73]">Ayaan Clothing · BGMEA Associate Member (Reg #1708)</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#515154]">
        <section>
          <h2 className="text-base font-semibold text-[#0A0B0E]">1. Wholesale Stock Lots &amp; Mixed Assortment</h2>
          <p className="mt-2">
            Ready stock lots represent genuine export factory overproduction, cancelled shipments, or surplus lots.
            Unless explicitly noted on the Proforma Invoice, stock lots ship in factory-packed assorted color and size
            ratios. All quantities are subject to final warehouse reservation upon Proforma confirmation.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-[#0A0B0E]">2. Quality Control &amp; Commercial Settlement</h2>
          <p className="mt-2">
            Every shipment undergoes AQL 2.5 pre-shipment verification. Payments are settled exclusively via verified
            Irrevocable L/C or Corporate T/T wire to Ayaan Clothing’s official Bangladeshi commercial export account.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-[#0A0B0E]">3. Independent Trademark Disclaimer</h2>
          <p className="mt-2">
            All third-party brand names and trademarks referenced on this platform are the sole property of their
            respective owners. Ayaan Clothing acts solely as an independent RMG manufacturer, buying house, and surplus
            exporter and claims no brand authorization or affiliation. Buyers are responsible for import clearance
            regulations in their destination territory.
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
