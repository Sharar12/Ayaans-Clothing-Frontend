import React from 'react';
import { VideoBackground } from '@/design-system/primitives';

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-white">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th (1).mp4"
        topOnly
        height="320px"
        opacity={0.33}
      />
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-widest text-[#6E6E73]">Legal &amp; Trade Confidentiality</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-[-0.03em] text-[#0A0B0E]">Privacy Policy</h1>
      <p className="mt-2 text-xs text-[#6E6E73]">Effective Date: January 2026 · Ayaan Clothing, Dhaka, Bangladesh</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-[#515154]">
        <section>
          <h2 className="text-base font-semibold text-[#0A0B0E]">1. Corporate Trade Information Collected</h2>
          <p className="mt-2">
            We collect business contact details, company names, shipping destinations, tech packs, and RFQ specifications
            solely to issue accurate commercial quotations, execute AQL 2.5 inspections, and coordinate international
            freight clearance.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-[#0A0B0E]">2. Strict NDA &amp; Private-Label Confidentiality</h2>
          <p className="mt-2">
            All OEM design files, private label artworks, buyer pricing tiers, and commercial consignee records are kept
            strictly confidential and are never sold or shared with competing buyers.
          </p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-[#0A0B0E]">3. Compliance &amp; Logistics Disclosure</h2>
          <p className="mt-2">
            Necessary shipment information is shared strictly with banking partners (L/C &amp; T/T settlement), licensed
            freight forwarders, and customs authorities required to export goods from Bangladesh. For privacy inquiries,
            contact <span className="font-mono text-[#0A0B0E]">export@ayaanclothing.com</span>.
          </p>
        </section>
      </div>
    </div>
    </div>
  );
}
