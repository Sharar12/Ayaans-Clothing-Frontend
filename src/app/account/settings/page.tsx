'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, MapPin, Calendar, Users, Globe, Plus, Download, CheckCircle2, LogOut } from 'lucide-react';
import { portalApi } from '@/services/portalApi';
import type { BuyerCompanySettings, TeamMember } from '@/types/portal';
import { useApp } from '@/store/AppContext';
import { PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';
import type { CurrencyCode, LocaleCode } from '@/types';

type SettingsTab = 'kyc' | 'addresses' | 'visits' | 'team' | 'prefs';

export default function AccountSettingsPage() {
  const { locale, currency, setLocale, setCurrency, notify, signOut } = useApp();
  const [tab, setTab] = useState<SettingsTab>('kyc');
  const [data, setData] = useState<BuyerCompanySettings | null>(null);

  const [newAddr, setNewAddr] = useState({ label: '', consigneeName: '', portOrCity: '', country: '', brokerContact: '' });
  const [newVisit, setNewVisit] = useState({ arrivalDate: '', departureDate: '', visitors: '2' });
  const [newMember, setNewMember] = useState({ name: '', email: '', role: 'Purchasing Manager' as TeamMember['role'] });

  useEffect(() => {
    portalApi.getSettings().then(setData);
  }, []);

  if (!data) return <div className="p-8 text-xs text-[#6E6E73]">Loading workspace settings...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Enterprise Account Controls</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
          Company KYC, Dhaka Visits &amp; Settings
        </h1>
      </div>

      <SegmentedControl
        layoutId="settingsSubTab"
        value={tab}
        onChange={setTab}
        options={[
          { label: 'Company & KYC', value: 'kyc' },
          { label: 'Ports & Consignees', value: 'addresses' },
          { label: 'Dhaka Visits', value: 'visits' },
          { label: 'Team Roles', value: 'team' },
          { label: 'Preferences', value: 'prefs' },
        ]}
      />

      {/* SUB-TAB A: COMPANY PROFILE & KYC */}
      {tab === 'kyc' && (
        <div className="ambient-card rounded-[28px] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[#0A0B0E]">Verified Importer Entity</h2>
            <SpecBadge tone="emerald">
              <ShieldCheck className="h-3.5 w-3.5" /> {data.kycStatus}
            </SpecBadge>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[#6E6E73]">Legal Company Name</label>
              <input
                value={data.companyName}
                onChange={(e) => setData({ ...data, companyName: e.target.value })}
                className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#6E6E73]">VAT / EORI / Import Reg No.</label>
              <input
                value={data.vatOrEori}
                onChange={(e) => setData({ ...data, vatOrEori: e.target.value })}
                className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#6E6E73]">Business Classification</label>
              <input
                value={data.businessType}
                onChange={(e) => setData({ ...data, businessType: e.target.value })}
                className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-[#6E6E73]">Default Incoterm</label>
              <select
                value={data.defaultIncoterm}
                onChange={(e) => setData({ ...data, defaultIncoterm: e.target.value as BuyerCompanySettings['defaultIncoterm'] })}
                className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"
              >
                <option value="FOB Chattogram">FOB Chattogram</option>
                <option value="CIF">CIF Destination Port</option>
                <option value="DDP">DDP Door Delivered</option>
                <option value="EXW">EXW Dhaka Hub</option>
              </select>
            </div>
          </div>
          <PrismaticButton
            size="sm"
            onClick={() => portalApi.updateSettings(data).then((s) => { setData(s); notify('Company profile saved'); })}
          >
            Save Entity Profile
          </PrismaticButton>
        </div>
      )}

      {/* SUB-TAB B: CONSIGNEE & PORT ADDRESSES */}
      {tab === 'addresses' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {data.addresses.map((a) => (
              <div key={a.id} className="ambient-card rounded-[24px] p-5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0B0E]">
                    <MapPin className="h-3.5 w-3.5 text-indigo-600" /> {a.label}
                  </span>
                  {a.isDefault && <SpecBadge tone="emerald">Default</SpecBadge>}
                </div>
                <p className="mt-2 text-sm font-medium text-[#0A0B0E]">{a.consigneeName}</p>
                <p className="font-mono text-xs text-[#515154]">{a.portOrCity} · {a.country}</p>
                <p className="mt-1 text-[11px] text-[#6E6E73]">Broker: {a.brokerContact}</p>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              portalApi
                .addAddress({ ...newAddr, isDefault: false })
                .then((s) => {
                  setData(s);
                  setNewAddr({ label: '', consigneeName: '', portOrCity: '', country: '', brokerContact: '' });
                  notify('Consignee port saved');
                });
            }}
            className="rounded-[26px] border border-black/[0.06] bg-[#FAFAFC] p-6 space-y-3"
          >
            <p className="text-xs font-semibold text-[#0A0B0E]">Add Destination Port / Notify Party</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input required placeholder="Label (e.g., Dubai Jebel Ali)" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} className="luminous-input rounded-2xl px-3.5 py-2 text-xs" />
              <input required placeholder="Consignee Entity" value={newAddr.consigneeName} onChange={(e) => setNewAddr({ ...newAddr, consigneeName: e.target.value })} className="luminous-input rounded-2xl px-3.5 py-2 text-xs" />
              <input required placeholder="Port / Airport Code" value={newAddr.portOrCity} onChange={(e) => setNewAddr({ ...newAddr, portOrCity: e.target.value })} className="luminous-input rounded-2xl px-3.5 py-2 text-xs" />
              <input required placeholder="Country" value={newAddr.country} onChange={(e) => setNewAddr({ ...newAddr, country: e.target.value })} className="luminous-input rounded-2xl px-3.5 py-2 text-xs" />
            </div>
            <PrismaticButton type="submit" size="sm">
              <Plus className="h-3.5 w-3.5" /> Save Consignee Address
            </PrismaticButton>
          </form>
        </div>
      )}

      {/* SUB-TAB C: DHAKA VISITS & VISA CONCIERGE */}
      {tab === 'visits' && (
        <div className="space-y-4">
          {data.visits.map((v) => (
            <div key={v.id} className="ambient-card flex flex-wrap items-center justify-between gap-4 rounded-[26px] p-6">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="font-mono text-xs font-semibold text-[#0A0B0E]">
                    {v.arrivalDate} → {v.departureDate} ({v.visitors} Visitors)
                  </span>
                  <SpecBadge tone={v.visaLetterReady ? 'emerald' : 'master'}>{v.status}</SpecBadge>
                </div>
                <p className="mt-1.5 text-xs text-[#515154]">{v.chauffeurNote}</p>
              </div>
              {v.visaLetterReady && (
                <PrismaticButton size="sm" variant="glass" onClick={() => notify('Downloading BGMEA Visa Invitation PDF')}>
                  <Download className="h-3.5 w-3.5" /> Visa Invitation PDF
                </PrismaticButton>
              )}
            </div>
          ))}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              portalApi
                .scheduleDhakaVisit({
                  arrivalDate: newVisit.arrivalDate,
                  departureDate: newVisit.departureDate,
                  visitors: Number(newVisit.visitors) || 1,
                })
                .then((s) => {
                  setData(s);
                  setNewVisit({ arrivalDate: '', departureDate: '', visitors: '2' });
                  notify('New Dhaka trip submitted — VIP hospitality team notified');
                });
            }}
            className="rounded-[26px] border border-black/[0.06] bg-[#FAFAFC] p-6"
          >
            <p className="text-xs font-semibold text-[#0A0B0E]">Request New Uttara Showroom &amp; Factory Tour</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4">
              <input required type="date" value={newVisit.arrivalDate} onChange={(e) => setNewVisit({ ...newVisit, arrivalDate: e.target.value })} className="luminous-input rounded-2xl px-3 py-2 text-xs" />
              <input required type="date" value={newVisit.departureDate} onChange={(e) => setNewVisit({ ...newVisit, departureDate: e.target.value })} className="luminous-input rounded-2xl px-3 py-2 text-xs" />
              <input type="number" min={1} max={10} value={newVisit.visitors} onChange={(e) => setNewVisit({ ...newVisit, visitors: e.target.value })} placeholder="Visitors" className="luminous-input rounded-2xl px-3 py-2 text-xs" />
              <PrismaticButton type="submit" size="sm">Book Visit</PrismaticButton>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB D: TEAM ACCESS & ROLES */}
      {tab === 'team' && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-[26px] border border-black/[0.07] bg-white">
            {data.team.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.05] px-6 py-4 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-[#0A0B0E]">{m.name}</p>
                  <p className="font-mono text-xs text-[#6E6E73]">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <SpecBadge tone="neutral">{m.role}</SpecBadge>
                  <SpecBadge tone={m.status === 'Active' ? 'emerald' : 'master'}>{m.status}</SpecBadge>
                </div>
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              portalApi.inviteTeamMember(newMember).then((s) => {
                setData(s);
                setNewMember({ name: '', email: '', role: 'Purchasing Manager' });
                notify(`Invited ${newMember.email} as ${newMember.role}`);
              });
            }}
            className="grid grid-cols-1 gap-3 rounded-[26px] border border-black/[0.06] bg-[#FAFAFC] p-6 sm:grid-cols-12"
          >
            <input required placeholder="Colleague Name" value={newMember.name} onChange={(e) => setNewMember({ ...newMember, name: e.target.value })} className="luminous-input rounded-2xl px-3.5 py-2 text-xs sm:col-span-3" />
            <input required type="email" placeholder="Work Email" value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} className="luminous-input rounded-2xl px-3.5 py-2 text-xs sm:col-span-4" />
            <select value={newMember.role} onChange={(e) => setNewMember({ ...newMember, role: e.target.value as TeamMember['role'] })} className="luminous-input rounded-2xl px-3 py-2 text-xs sm:col-span-3">
              <option value="Purchasing Manager">Purchasing Manager</option>
              <option value="Finance Officer">Finance Officer</option>
              <option value="QC Officer">QC Officer</option>
              <option value="Admin">Admin</option>
            </select>
            <PrismaticButton type="submit" size="sm" className="sm:col-span-2">
              <Users className="h-3.5 w-3.5" /> Invite
            </PrismaticButton>
          </form>
        </div>
      )}

      {/* SUB-TAB E: PREFERENCES & SECURITY */}
      {tab === 'prefs' && (
        <div className="ambient-card rounded-[28px] p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-[#0A0B0E]">
                <Globe className="h-4 w-4 text-indigo-600" /> Workspace Language (Supports Arabic RTL)
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(['EN', 'BN', 'AR', 'ES', 'FR'] as LocaleCode[]).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLocale(l)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium ${
                      locale === l ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'
                    }`}
                  >
                    {l === 'BN' ? 'বাংলা' : l === 'AR' ? 'العربية' : l}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-[#0A0B0E]">Default Pricing Currency</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(['USD', 'EUR', 'GBP', 'AED'] as CurrencyCode[]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCurrency(c)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-xs font-medium ${
                      currency === c ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-black/[0.06] pt-5 text-xs">
            {[
              { key: 'whatsappAlerts' as const, label: 'Instant WhatsApp alerts for AQL 2.5 photos & VIP stock drops' },
              { key: 'emailAlerts' as const, label: 'Email PDF copies of Proforma Invoices & Bills of Lading' },
              { key: 'twoFactorEnabled' as const, label: 'Two-Factor Authentication (2FA) for Finance & Dispatch Sign-Off' },
            ].map((toggle) => (
              <label key={toggle.key} className="flex cursor-pointer items-center justify-between rounded-2xl bg-[#FAFAFC] px-4 py-3">
                <span className="flex items-center gap-2 font-medium text-[#0A0B0E]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {toggle.label}
                </span>
                <input
                  type="checkbox"
                  checked={data[toggle.key]}
                  onChange={(e) => {
                    const next = { ...data, [toggle.key]: e.target.checked };
                    setData(next);
                    portalApi.updateSettings({ [toggle.key]: e.target.checked });
                    notify('Preference updated');
                  }}
                  className="h-4 w-4 accent-[#0A0B0E]"
                />
              </label>
            ))}
          </div>

          <div className="border-t border-black/[0.06] pt-5">
            <button
              type="button"
              onClick={signOut}
              className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-2.5 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-100"
            >
              <LogOut className="h-4 w-4" /> Sign Out of Buyer Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
