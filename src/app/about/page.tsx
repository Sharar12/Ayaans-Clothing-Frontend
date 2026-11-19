'use client';

import React, { useState } from 'react';
import { MapPin, Calendar, Building2, Plane, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { api } from '@/services/api';
import { useApp } from '@/store/AppContext';
import { AmbientAura, BentoTile, GlassModal, PrismaticButton, Reveal, SpecBadge, VideoBackground } from '@/design-system/primitives';

export default function AboutPage() {
  const { notify } = useApp();
  const [visitOpen, setVisitOpen] = useState(false);
  const [visitForm, setVisitForm] = useState({ name: '', company: '', email: '', arrivalDate: '', guests: '2' });
  const [booked, setBooked] = useState(false);

  const handleBookVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.submitContact({ type: 'dhaka_visit', ...visitForm });
    setBooked(true);
    notify('Dhaka sourcing itinerary request sent to our VIP desk');
  };

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th.mp4"
        topOnly
        height="440px"
        opacity={0.33}
      />
      <AmbientAura variant="hero" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        {/* Heritage Opening */}
        <Reveal className="max-w-3xl">
          <SpecBadge tone="glass">Established 2010 · Uttara, Dhaka, Bangladesh</SpecBadge>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#0A0B0E] sm:text-6xl">
            15+ Years Connecting Global Retailers to Bangladesh’s Finest Apparel Mills.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-[#515154]">
            Founded in 2010 under the leadership of Fakhrul Islam, Ayaan Clothing has grown into a trusted government-registered
            RMG exporter, ISO 9001:2015 certified buying house, and direct stock-lot consolidator serving importers across
            Europe, the Middle East, the Americas, Africa, and Asia.
          </p>
        </Reveal>

        {/* Precision Impact Metrics */}
        <Reveal delay={0.1} className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            { num: '2010', label: 'Year Established' },
            { num: '600+', label: 'Partner Factories' },
            { num: '40+', label: 'Global Markets' },
            { num: 'BGMEA', label: 'Reg #1708 Member' },
            { num: 'AQL 2.5', label: 'Export QC Standard' },
          ].map((m) => (
            <div key={m.label} className="ambient-card rounded-3xl p-5 text-center">
              <p className="font-mono text-2xl font-semibold text-[#0A0B0E] sm:text-3xl">{m.num}</p>
              <p className="mt-1 text-xs text-[#6E6E73]">{m.label}</p>
            </div>
          ))}
        </Reveal>

        {/* Dhaka HQ Visual Story */}
        <Reveal delay={0.15} className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12">
          <div className="overflow-hidden rounded-[30px] border border-black/[0.06] md:col-span-7">
            <img
              src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1200&q=85"
              alt="Uttara Dhaka Apparel Showroom"
              className="h-80 w-full object-cover md:h-full"
            />
          </div>
          <div className="flex flex-col justify-between rounded-[30px] border border-black/[0.06] bg-[#FAFAFC] p-8 md:col-span-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-indigo-600">Headquarters &amp; Staging</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#0A0B0E]">Uttara Sector 11, Dhaka</h2>
              <p className="mt-3 text-sm leading-relaxed text-[#515154]">
                Located just 15 minutes from Hazrat Shahjalal International Airport (DAC), our showroom and dust-free
                inspection hub lets visiting buyers inspect live lots in person and seal shipments swiftly.
              </p>
            </div>
            <div className="mt-6 rounded-2xl bg-white p-4 text-xs text-[#515154] border border-black/[0.05]">
              <p className="flex items-start gap-2 font-medium text-[#0A0B0E]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                House #33 (2nd Floor), Road #12, Sector #11, Uttara, Dhaka-1230, Bangladesh
              </p>
            </div>
          </div>
        </Reveal>

        {/* VIP BUYER VISIT CONCIERGE */}
        <section id="visit-dhaka" className="mt-20">
          <Reveal className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-indigo-600">VIP Importer Hospitality</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-4xl">
                Visit Ayaan Clothing in Bangladesh
              </h2>
              <p className="mt-2 text-sm text-[#515154]">
                Flying to Dhaka to inspect stock lots or audit OEM factories? Our team handles every ground detail.
              </p>
            </div>
            <PrismaticButton size="lg" prismatic onClick={() => { setBooked(false); setVisitOpen(true); }}>
              <Calendar className="h-4 w-4" /> Schedule Dhaka Visit
            </PrismaticButton>
          </Reveal>

          <Reveal delay={0.1} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Official Visa Invitation Letter', desc: 'Business visa invitation documentation issued promptly on Ayaan Clothing BGMEA letterhead.' },
              { icon: Plane, title: 'DAC Airport Pickup & Chauffeur', desc: 'Private airport meet-and-greet and daily chauffeured transport between hotels and factories.' },
              { icon: Building2, title: 'Curated Hotel Guidance', desc: 'Corporate partner rates at executive hotels in Uttara, Gulshan, and Banani.' },
              { icon: CheckCircle2, title: 'Private Showroom Reviews', desc: 'Pre-staged racks of your requested brands, categories, and OEM fabric swatches.' },
              { icon: MapPin, title: 'Factory & Warehouse Tours', desc: 'Guided on-site visits across our vetted knitting, dyeing, denim, and stock-lot hubs.' },
              { icon: Calendar, title: 'Same-Trip Export Execution', desc: 'Finalize AQL 2.5 audits, proforma invoices, and container booking before you fly home.' },
            ].map((item) => (
              <BentoTile key={item.title} tint="indigo">
                <item.icon className="h-5 w-5 text-indigo-600" />
                <h3 className="mt-3 text-base font-semibold text-[#0A0B0E]">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#515154]">{item.desc}</p>
              </BentoTile>
            ))}
          </Reveal>
        </section>
      </div>

      {/* Dhaka Visit Scheduler Modal */}
      <GlassModal open={visitOpen} onClose={() => setVisitOpen(false)} maxWidth="max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#0A0B0E]">Schedule a Dhaka Sourcing Visit</h3>
            <button type="button" onClick={() => setVisitOpen(false)} className="cursor-pointer rounded-full bg-[#F5F5F7] p-2">
              <X className="h-4 w-4" />
            </button>
          </div>

          {booked ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
              <p className="mt-3 text-base font-semibold text-[#0A0B0E]">Visit Request Confirmed</p>
              <p className="mt-1 text-xs text-[#6E6E73]">
                Our Uttara hospitality desk will email your Visa Invitation guide &amp; showroom schedule within 12 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleBookVisit} className="mt-5 space-y-3.5">
              <input
                required
                placeholder="Your Full Name"
                value={visitForm.name}
                onChange={(e) => setVisitForm((f) => ({ ...f, name: e.target.value }))}
                className="luminous-input w-full rounded-2xl px-4 py-2.5 text-sm"
              />
              <input
                required
                placeholder="Company Name & Country"
                value={visitForm.company}
                onChange={(e) => setVisitForm((f) => ({ ...f, company: e.target.value }))}
                className="luminous-input w-full rounded-2xl px-4 py-2.5 text-sm"
              />
              <input
                required
                type="email"
                placeholder="Business Email"
                value={visitForm.email}
                onChange={(e) => setVisitForm((f) => ({ ...f, email: e.target.value }))}
                className="luminous-input w-full rounded-2xl px-4 py-2.5 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  required
                  type="date"
                  value={visitForm.arrivalDate}
                  onChange={(e) => setVisitForm((f) => ({ ...f, arrivalDate: e.target.value }))}
                  className="luminous-input rounded-2xl px-4 py-2.5 text-sm"
                />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={visitForm.guests}
                  onChange={(e) => setVisitForm((f) => ({ ...f, guests: e.target.value }))}
                  placeholder="Visitors"
                  className="luminous-input rounded-2xl px-4 py-2.5 text-sm"
                />
              </div>
              <PrismaticButton type="submit" prismatic className="w-full">
                Request Visa Support &amp; Airport Pickup
              </PrismaticButton>
            </form>
          )}
        </div>
      </GlassModal>
    </div>
  );
}
