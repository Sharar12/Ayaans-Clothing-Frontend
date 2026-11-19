'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, ZoomIn, ZoomOut, X, Award, CheckCircle2, Eye } from 'lucide-react';
import { api } from '@/services/api';
import type { Certification } from '@/types';
import { AmbientAura, BentoTile, GlassModal, Reveal, SpecBadge, VideoBackground } from '@/design-system/primitives';

export default function CompliancePage() {
  const [certs, setCerts] = useState<Certification[]>([]);
  const [inspecting, setInspecting] = useState<Certification | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    api.getCertifications().then(setCerts);
  }, []);

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/generated_video_july_24.mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="cool" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <Reveal className="max-w-3xl">
          <SpecBadge tone="emerald">
            <ShieldCheck className="h-3.5 w-3.5" /> Institutional Transparency · Verified Since 2010
          </SpecBadge>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#0A0B0E] sm:text-5xl">
            Compliance, Licensing &amp; Quality Vault
          </h1>
          <p className="mt-3 text-base leading-relaxed text-[#515154]">
            Trade with institutional confidence. Inspect Ayaan Clothing&apos;s active Bangladeshi government export
            licenses, BGMEA Associate Buying House membership, and ISO 9001:2015 certification directly below.
          </p>
        </Reveal>

        {/* Interactive Document Cards */}
        <Reveal delay={0.1} className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {certs.map((cert) => (
            <BentoTile key={cert.id} tint="emerald" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Award className="h-5 w-5" />
                  </span>
                  <SpecBadge tone="emerald">{cert.status}</SpecBadge>
                </div>

                <h2 className="mt-5 text-lg font-semibold tracking-[-0.015em] text-[#0A0B0E]">{cert.title}</h2>
                <p className="mt-1 text-xs text-[#6E6E73]">{cert.authority}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#515154]">{cert.scope}</p>
              </div>

              <div className="mt-6 border-t border-black/[0.06] pt-4">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-[#6E6E73]">REG ID</span>
                  <span className="font-semibold text-[#0A0B0E]">{cert.registrationNumber}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setInspecting(cert);
                  }}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0A0B0E] py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#1E2028]"
                >
                  <Eye className="h-3.5 w-3.5" /> Inspect Verified Record
                </button>
              </div>
            </BentoTile>
          ))}
        </Reveal>

        {/* Ethical & Factory Audit Strip */}
        <Reveal delay={0.15} className="mt-16 rounded-[30px] border border-black/[0.06] bg-[#FAFAFC] p-8 sm:p-10">
          <h2 className="text-xl font-semibold text-[#0A0B0E]">600+ Partner Factory Compliance Standards</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { title: 'Accord / RSC Structural Safety', text: 'Partner factories vetted for fire, electrical, and structural compliance in Dhaka & Chattogram.' },
              { title: 'OEKO-TEX & AZO-Free Dyes', text: 'Garments sourced for EU/UK/US export adhere to strict chemical safety and skin-contact standards.' },
              { title: 'Third-Party SGS / Intertek Ready', text: 'Buyers are welcome to book independent pre-shipment audits inside our staging warehouse anytime.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-white p-5 border border-black/[0.05]">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <p className="mt-3 text-sm font-semibold text-[#0A0B0E]">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#515154]">{item.text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Fullscreen Zoomable Document Inspector Lightbox */}
      <GlassModal open={!!inspecting} onClose={() => setInspecting(null)} maxWidth="max-w-4xl">
        {inspecting && (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
              <div>
                <p className="font-mono text-[11px] text-emerald-700">{inspecting.documentCode}</p>
                <h3 className="text-lg font-semibold text-[#0A0B0E]">{inspecting.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                  className="cursor-pointer rounded-full bg-[#F5F5F7] p-2 hover:bg-[#EAEAEF]"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs">{Math.round(zoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.75, Number((z + 0.25).toFixed(2))))}
                  className="cursor-pointer rounded-full bg-[#F5F5F7] p-2 hover:bg-[#EAEAEF]"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setInspecting(null)}
                  className="cursor-pointer rounded-full bg-[#F5F5F7] p-2 hover:bg-[#EAEAEF]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-12">
              {/* Zoomable Official Verification Facsimile */}
              <div className="overflow-auto rounded-2xl border border-black/[0.08] bg-[#F5F5F7] p-6 md:col-span-8">
                <div
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                  className="relative rounded-xl border border-black/10 bg-white p-8 shadow-sm transition-transform"
                >
                  <div className="flex items-center justify-between border-b border-black/10 pb-4">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6E6E73]">
                        Official Verified Registry Extract
                      </p>
                      <p className="mt-1 text-base font-bold text-[#0A0B0E]">AYAAN CLOTHING · BANGLADESH</p>
                    </div>
                    <ShieldCheck className="h-9 w-9 text-emerald-600" />
                  </div>
                  <div className="mt-6 space-y-3 text-xs">
                    <p><span className="text-[#6E6E73]">Certificate:</span> <strong>{inspecting.title}</strong></p>
                    <p><span className="text-[#6E6E73]">Issuing Authority:</span> {inspecting.authority}</p>
                    <p><span className="text-[#6E6E73]">Registration No.:</span> <span className="font-mono font-semibold">{inspecting.registrationNumber}</span></p>
                    <p><span className="text-[#6E6E73]">Proprietor / Entity:</span> Fakhrul Islam · Ayaan Clothing (Est. 2010)</p>
                    <p><span className="text-[#6E6E73]">Registered Office:</span> House #33 (2nd Floor), Road #12, Sector #11, Uttara, Dhaka-1230</p>
                    <p><span className="text-[#6E6E73]">Standing:</span> <span className="font-semibold text-emerald-700">{inspecting.status} ({inspecting.issueYear})</span></p>
                  </div>
                  <p className="mt-8 border-t border-dashed border-black/15 pt-3 font-mono text-[10px] text-[#86868B]">
                    WATERMARK: OFFICIAL SCANNED COPY AVAILABLE FOR BANK L/C &amp; CUSTOMS OPENING UPON VERIFIED BUYER REQUEST · export@ayaanclothing.com
                  </p>
                </div>
              </div>

              {/* Metadata Sidebar */}
              <div className="space-y-3 text-xs md:col-span-4">
                <div className="rounded-2xl bg-[#FAFAFC] p-4 border border-black/[0.05]">
                  <p className="text-[#6E6E73]">Verification Status</p>
                  <p className="mt-1 font-semibold text-emerald-700">{inspecting.status}</p>
                </div>
                <div className="rounded-2xl bg-[#FAFAFC] p-4 border border-black/[0.05]">
                  <p className="text-[#6E6E73]">Registration Number</p>
                  <p className="mt-1 font-mono font-semibold text-[#0A0B0E]">{inspecting.registrationNumber}</p>
                </div>
                <div className="rounded-2xl bg-[#FAFAFC] p-4 border border-black/[0.05]">
                  <p className="text-[#6E6E73]">Validity Window</p>
                  <p className="mt-1 font-semibold text-[#0A0B0E]">{inspecting.issueYear}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
