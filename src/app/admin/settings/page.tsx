'use client';

import React, { useEffect, useState } from 'react';
import { Save, ShieldCheck } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import type { UnifiedSiteSettings } from '@/types/admin';
import { useApp } from '@/store/AppContext';
import { PrismaticButton, SpecBadge } from '@/design-system/primitives';

export default function UnifiedAdminSettingsPage() {
  const { notify } = useApp();
  const [settings, setSettings] = useState<UnifiedSiteSettings | null>(null);

  useEffect(() => {
    adminApi.getSettings().then(setSettings);
  }, []);

  if (!settings) return <div className="p-8 text-xs text-[#6E6E73]">Loading settings...</div>;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await adminApi.saveSettings(settings);
    setSettings(saved);
    notify('Saved website, bank & Dollar-to-Taka settings!');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <SpecBadge tone="emerald">
          <ShieldCheck className="h-3 w-3" /> Global Website &amp; Money Controls
        </SpecBadge>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
          Settings
        </h1>
      </div>

      <form onSubmit={handleSave} className="ambient-card rounded-[30px] p-6 sm:p-8 space-y-6">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#0A0B0E]">Contact &amp; Office Info</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Company Name</label><input value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Official Email</label><input value={settings.exportEmail} onChange={(e) => setSettings({ ...settings, exportEmail: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Primary WhatsApp / Phone</label><input value={settings.whatsappPrimary} onChange={(e) => setSettings({ ...settings, whatsappPrimary: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Secondary Phone</label><input value={settings.whatsappSecondary} onChange={(e) => setSettings({ ...settings, whatsappSecondary: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div className="sm:col-span-2"><label className="text-xs text-[#6E6E73]">Dhaka Showroom Address</label><input value={settings.officeAddress} onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
          </div>
        </div>

        <div className="space-y-4 border-t border-black/[0.06] pt-6">
          <h2 className="text-sm font-semibold text-[#0A0B0E]">Official Bank Account &amp; Currency Rate</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Bank Beneficiary Name</label><input value={settings.bankBeneficiary} onChange={(e) => setSettings({ ...settings, bankBeneficiary: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Bank Branch</label><input value={settings.bankName} onChange={(e) => setSettings({ ...settings, bankName: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Bank SWIFT Code</label><input value={settings.bankSwift} onChange={(e) => setSettings({ ...settings, bankSwift: e.target.value })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Dollar to Taka Rate (1 USD = ৳)</label><input type="number" step="0.5" value={settings.usdToBdtRate} onChange={(e) => setSettings({ ...settings, usdToBdtRate: Number(e.target.value) || 121.5 })} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm font-semibold" /></div>
          </div>
        </div>

        <PrismaticButton type="submit" prismatic size="lg">
          <Save className="h-4 w-4" /> Save All Settings
        </PrismaticButton>
      </form>
    </div>
  );
}
