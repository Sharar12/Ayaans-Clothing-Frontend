'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ZoomIn, ZoomOut, X, Eye } from 'lucide-react';
import { portalApi } from '@/services/portalApi';
import type { QcInspectionReport } from '@/types/portal';
import { useApp } from '@/store/AppContext';
import { GlassModal, PrismaticButton, SpecBadge } from '@/design-system/primitives';

export default function InspectionsPage() {
  const { notify } = useApp();
  const [reports, setReports] = useState<QcInspectionReport[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; caption: string } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [flagReportId, setFlagReportId] = useState<string | null>(null);
  const [flagNote, setFlagNote] = useState('');

  useEffect(() => {
    portalApi.getInspections().then(setReports);
  }, []);

  const handleApprove = async (id: string) => {
    const updated = await portalApi.reviewInspection(id, 'approved', 'Digitally approved by Buyer for container dispatch.');
    setReports(updated);
    notify(`AQL 2.5 Inspection ${id} approved — Chattogram dispatch authorized!`);
  };

  const handleFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReportId) return;
    const updated = await portalApi.reviewInspection(flagReportId, 'flagged', flagNote || 'Requested re-measurement check.');
    setReports(updated);
    setFlagReportId(null);
    setFlagNote('');
    notify('Re-inspection alert dispatched to Uttara Lead QA Engineer');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SpecBadge tone="emerald">
            <ShieldCheck className="h-3 w-3" /> ISO 2859-1 · AQL 2.5 Major / 4.0 Minor
          </SpecBadge>
          <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            AQL 2.5 Quality Control &amp; Inspection Gallery
          </h1>
        </div>
        <PrismaticButton
          size="sm"
          variant="glass"
          onClick={() => notify('Third-party SGS / Intertek warehouse audit slot requested')}
        >
          Book 3rd-Party SGS / Intertek Audit
        </PrismaticButton>
      </div>

      <div className="space-y-6">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className={`ambient-card rounded-[28px] p-6 ${rep.buyerApproval === 'pending' ? 'prismatic-ring' : ''}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-indigo-600">{rep.id}</span>
                  <span className="font-mono text-xs text-[#6E6E73]">Order {rep.orderId} · {rep.date}</span>
                  <SpecBadge
                    tone={
                      rep.buyerApproval === 'approved'
                        ? 'emerald'
                        : rep.buyerApproval === 'flagged'
                          ? 'rose'
                          : 'master'
                    }
                  >
                    {rep.buyerApproval === 'approved'
                      ? 'BUYER APPROVED'
                      : rep.buyerApproval === 'flagged'
                        ? 'RE-CHECK REQUESTED'
                        : 'AWAITING YOUR SIGN-OFF'}
                  </SpecBadge>
                </div>
                <p className="mt-2 text-xs text-[#515154]">
                  Auditor: <strong className="text-[#0A0B0E]">{rep.inspector}</strong> · {rep.standard}
                </p>
              </div>

              <div className="flex gap-3 font-mono text-xs">
                <div className="rounded-2xl bg-[#FAFAFC] px-3.5 py-2 text-center border border-black/[0.05]">
                  <p className="font-sans text-[10px] text-[#6E6E73]">Audited</p>
                  <p className="font-semibold text-[#0A0B0E]">{rep.sampleSize} pcs</p>
                </div>
                <div className="rounded-2xl bg-emerald-50/80 px-3.5 py-2 text-center border border-emerald-200/60">
                  <p className="font-sans text-[10px] text-emerald-700">Major Defects</p>
                  <p className="font-semibold text-emerald-800">{rep.majorDefects}</p>
                </div>
              </div>
            </div>

            {/* 5 Checkpoint Scorecard */}
            <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-5">
              {rep.checkpoints.map((cp) => (
                <div key={cp.label} className="rounded-2xl border border-black/[0.05] bg-[#FAFAFC] p-3">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                    <span>{cp.result}</span>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A0B0E]">{cp.label}</p>
                  <p className="mt-0.5 text-[11px] text-[#6E6E73]">{cp.detail}</p>
                </div>
              ))}
            </div>

            {/* HD Inspection Photo Grid */}
            <div className="mt-5">
              <p className="mb-2.5 text-xs font-semibold text-[#0A0B0E]">
                Dhaka Warehouse Inspection Photos ({rep.photos.length})
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {rep.photos.map((photo) => (
                  <button
                    key={photo.caption}
                    type="button"
                    onClick={() => {
                      setZoom(1);
                      setLightboxPhoto(photo);
                    }}
                    className="group relative cursor-pointer overflow-hidden rounded-2xl border border-black/[0.06] text-left"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="glass-pill inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold text-[#0A0B0E]">
                        <Eye className="h-3 w-3" /> Zoom
                      </span>
                    </div>
                    <p className="truncate bg-white px-2.5 py-1.5 text-[10px] font-medium text-[#515154]">
                      {photo.caption}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Buyer Digital Sign-Off Bar */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
              {rep.buyerNote ? (
                <p className="text-xs text-[#515154]">
                  <strong className="text-[#0A0B0E]">Buyer Sign-Off Note:</strong> {rep.buyerNote}
                </p>
              ) : (
                <p className="text-xs text-[#6E6E73]">
                  Authorize dispatch once you have verified photos and AQL tolerance scores.
                </p>
              )}

              {rep.buyerApproval !== 'approved' && (
                <div className="flex flex-wrap gap-2">
                  <PrismaticButton size="sm" prismatic onClick={() => handleApprove(rep.id)}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve AQL 2.5 &amp; Authorize Dispatch
                  </PrismaticButton>
                  <PrismaticButton size="sm" variant="glass" onClick={() => setFlagReportId(rep.id)}>
                    <AlertCircle className="h-3.5 w-3.5 text-rose-500" /> Flag Issue
                  </PrismaticButton>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Zoomable QC Photo Lightbox */}
      <GlassModal open={!!lightboxPhoto} onClose={() => setLightboxPhoto(null)} maxWidth="max-w-4xl">
        {lightboxPhoto && (
          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-[#0A0B0E]">{lightboxPhoto.caption}</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.25))} className="cursor-pointer rounded-full bg-[#F5F5F7] p-2">
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="font-mono text-xs">{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => setZoom((z) => Math.min(2, z + 0.25))} className="cursor-pointer rounded-full bg-[#F5F5F7] p-2">
                  <ZoomIn className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setLightboxPhoto(null)} className="cursor-pointer rounded-full bg-[#F5F5F7] p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-[#F5F5F7]">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.caption}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                className="w-full rounded-2xl transition-transform"
              />
            </div>
          </div>
        )}
      </GlassModal>

      {/* Flag Issue Modal */}
      <GlassModal open={!!flagReportId} onClose={() => setFlagReportId(null)} maxWidth="max-w-md">
        <form onSubmit={handleFlag} className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-[#0A0B0E]">Request QC Re-Verification</h3>
          <textarea
            required
            rows={4}
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            placeholder="Describe measurement tolerance, label check, or carton photo you need re-verified..."
            className="luminous-input w-full rounded-2xl p-3.5 text-sm"
          />
          <div className="flex justify-end gap-2">
            <PrismaticButton type="button" size="sm" variant="glass" onClick={() => setFlagReportId(null)}>
              Cancel
            </PrismaticButton>
            <PrismaticButton type="submit" size="sm">
              Send to QA Engineer
            </PrismaticButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
}
