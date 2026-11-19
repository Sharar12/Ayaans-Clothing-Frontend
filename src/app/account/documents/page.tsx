'use client';

import React, { useEffect, useState } from 'react';
import { Download, Upload, Copy, Check, ShieldCheck, X } from 'lucide-react';
import { portalApi } from '@/services/portalApi';
import type { DocCategory, FinancialDocument } from '@/types/portal';
import { useApp } from '@/store/AppContext';
import { BentoTile, GlassModal, PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';

export default function FinancialVaultPage() {
  const { formatPrice, notify } = useApp();
  const [docs, setDocs] = useState<FinancialDocument[]>([]);
  const [category, setCategory] = useState<'ALL' | DocCategory>('ALL');
  const [uploadingDoc, setUploadingDoc] = useState<FinancialDocument | null>(null);
  const [fileName, setFileName] = useState('');
  const [copiedSwift, setCopiedSwift] = useState(false);

  useEffect(() => {
    portalApi.getDocuments().then(setDocs);
  }, []);

  const filtered = docs.filter((d) => category === 'ALL' || d.category === category);
  const totalBilled = docs.reduce((s, d) => s + (d.amountUsd || 0), 0);

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadingDoc) return;
    const updated = await portalApi.uploadPaymentProof(uploadingDoc.id, fileName || 'MT103-Wire-Receipt.pdf');
    setDocs(updated);
    setUploadingDoc(null);
    setFileName('');
    notify('T/T Swift / L/C draft uploaded — Dhaka Accounts Desk verifying');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Corporate Export Finance</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
          Invoices, L/C &amp; T/T Settlements &amp; Export Vault
        </h1>
      </div>

      {/* 4 Financial Summary Bento Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoTile tint="indigo" className="!p-5">
          <p className="text-[11px] text-[#6E6E73]">Total Invoiced (YTD)</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[#0A0B0E]">{formatPrice(totalBilled)}</p>
        </BentoTile>
        <BentoTile tint="emerald" className="!p-5">
          <p className="text-[11px] text-[#6E6E73]">Cleared Payments</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-emerald-700">{formatPrice(15646)}</p>
        </BentoTile>
        <BentoTile tint="amber" className="!p-5">
          <p className="text-[11px] text-[#6E6E73]">Pending Balance Wire</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-amber-700">{formatPrice(10374)}</p>
        </BentoTile>
        <BentoTile tint="sky" className="!p-5">
          <p className="text-[11px] text-[#6E6E73]">Active Sight L/C</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-indigo-700">{formatPrice(29450)}</p>
        </BentoTile>
      </div>

      {/* Verified Bangladesh Commercial Export Bank Card */}
      <div className="glass-surface flex flex-col justify-between gap-4 rounded-[26px] p-5 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" /> BGMEA-Verified Export Beneficiary Account (Dhaka, Bangladesh)
          </span>
          <p className="mt-1 font-mono text-xs text-[#0A0B0E]">
            Beneficiary: AYAAN CLOTHING · Bank: Dutch-Bangla Bank PLC (Uttara Branch) · SWIFT: DBBLBDDH
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText('AYAAN CLOTHING | SWIFT: DBBLBDDH | Uttara Branch, Dhaka-1230');
            setCopiedSwift(true);
            notify('Copied Official Export SWIFT Credentials');
            setTimeout(() => setCopiedSwift(false), 1800);
          }}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-[#0A0B0E] px-4 py-2 font-mono text-xs text-white"
        >
          {copiedSwift ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          Copy Bank SWIFT
        </button>
      </div>

      {/* Filter Bar */}
      <SegmentedControl
        layoutId="docCatFilter"
        value={category}
        onChange={setCategory}
        options={[
          { label: 'All Docs', value: 'ALL' },
          { label: 'Proforma (PI)', value: 'PI' },
          { label: 'Commercial (CI)', value: 'CI' },
          { label: 'Packing Lists', value: 'PL' },
          { label: 'BL / AWB', value: 'BL_AWB' },
          { label: 'Origin (GSP/CO)', value: 'CO_GSP' },
          { label: 'Receipts', value: 'RECEIPT' },
        ]}
      />

      {/* Document Ledger Table */}
      <div className="overflow-x-auto rounded-[28px] border border-black/[0.07] bg-white">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-black/[0.06] bg-[#FAFAFC] text-[11px] uppercase tracking-wider text-[#6E6E73]">
            <tr>
              <th className="px-5 py-3.5">Document</th>
              <th className="px-5 py-3.5">Order</th>
              <th className="px-5 py-3.5">Issued</th>
              <th className="px-5 py-3.5">Amount</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-[#FAFAFC]">
                <td className="px-5 py-4">
                  <p className="font-semibold text-[#0A0B0E]">{doc.title}</p>
                  <p className="font-mono text-[10px] text-[#6E6E73]">{doc.docNumber}</p>
                </td>
                <td className="px-5 py-4 font-mono text-[#515154]">{doc.orderId}</td>
                <td className="px-5 py-4 font-mono text-[#6E6E73]">{doc.issueDate}</td>
                <td className="px-5 py-4 font-mono font-semibold text-[#0A0B0E]">
                  {doc.amountUsd ? formatPrice(doc.amountUsd) : '—'}
                </td>
                <td className="px-5 py-4">
                  <SpecBadge
                    tone={
                      doc.paymentStatus === 'Paid' || doc.paymentStatus === 'Issued'
                        ? 'emerald'
                        : doc.paymentStatus === 'Pending Wire'
                          ? 'rose'
                          : 'original'
                    }
                  >
                    {doc.paymentStatus}
                  </SpecBadge>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    {(doc.paymentStatus === 'Pending Wire' || doc.paymentStatus === '30% Deposit Paid') && (
                      <button
                        type="button"
                        onClick={() => setUploadingDoc(doc)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                      >
                        <Upload className="h-3 w-3" /> Upload T/T / L/C
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => notify(`Downloading ${doc.docNumber}.pdf`)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[11px] font-medium text-[#0A0B0E] hover:bg-[#0A0B0E] hover:text-white"
                    >
                      <Download className="h-3 w-3" /> PDF
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upload Payment Proof Modal */}
      <GlassModal open={!!uploadingDoc} onClose={() => setUploadingDoc(null)} maxWidth="max-w-md">
        {uploadingDoc && (
          <form onSubmit={handleUploadProof} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0A0B0E]">Upload T/T MT103 or L/C Draft</h3>
              <button type="button" onClick={() => setUploadingDoc(null)} className="cursor-pointer rounded-full bg-[#F5F5F7] p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="font-mono text-xs text-[#6E6E73]">
              Linked Invoice: {uploadingDoc.docNumber} ({formatPrice(uploadingDoc.amountUsd || 0)})
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black/15 bg-[#FAFAFC] p-6 text-center hover:border-indigo-400">
              <Upload className="h-6 w-6 text-indigo-500" />
              <span className="mt-2 text-xs font-medium text-[#0A0B0E]">
                {fileName || 'Select Bank Wire Receipt PDF / JPG or L/C Swift Copy'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || 'Bank-Wire-MT103.pdf')}
              />
            </label>
            <PrismaticButton type="submit" prismatic className="w-full">
              Submit Proof to Dhaka Accounts
            </PrismaticButton>
          </form>
        )}
      </GlassModal>
    </div>
  );
}
