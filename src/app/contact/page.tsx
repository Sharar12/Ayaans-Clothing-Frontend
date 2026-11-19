'use client';

import React, { useEffect, useState } from 'react';
import { MapPin, Mail, Phone, Clock, MessageCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { api } from '@/services/api';
import { useApp } from '@/store/AppContext';
import { AmbientAura, PrismaticButton, Reveal, SpecBadge, VideoBackground } from '@/design-system/primitives';

export default function ContactPage() {
  const { notify } = useApp();
  const [dhakaClock, setDhakaClock] = useState('');
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', message: '' });
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setDhakaClock(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await api.submitContact(form);
    setRefId(res.referenceId);
    notify(`Inquiry ${res.referenceId} received by Dhaka Export Desk`);
  };

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801620853502';

  return (
    <div className="relative min-h-screen bg-white pb-24">
      <VideoBackground
        src="/bg_videos/create_a_loop_bg_video_with_th.mp4"
        topOnly
        height="380px"
        opacity={0.33}
      />
      <AmbientAura variant="subtle" />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <SpecBadge tone="emerald">Direct Dhaka Export Desk</SpecBadge>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-[#0A0B0E] sm:text-5xl">
            Speak Directly With Our Merchandising Team.
          </h1>
          <p className="mt-3 text-sm text-[#515154]">
            Stock lot availability, private-label OEM quotations, compliance copies, or Dhaka showroom appointments.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Export Desk Directory */}
          <div className="space-y-4 lg:col-span-5">
            <div className="glass-surface rounded-[28px] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Export Desk Active
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-xs text-[#6E6E73]">
                  <Clock className="h-3.5 w-3.5" /> {dhakaClock || 'BST (UTC+6)'}
                </span>
              </div>

              <div className="space-y-3 border-t border-black/[0.06] pt-4 text-sm text-[#1D1D1F]">
                <p className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                  <span>House #33 (2nd Floor), Road #12, Sector #11, Uttara, Dhaka-1230, Bangladesh</span>
                </p>
                <p className="flex items-center gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-indigo-600" />
                  <a href="mailto:export@ayaanclothing.com" className="font-mono text-xs hover:underline">
                    export@ayaanclothing.com
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-indigo-600" />
                  <span className="font-mono text-xs">+880 1620-853502 · +880 1982-183886</span>
                </p>
              </div>

              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                <MessageCircle className="h-4 w-4" /> Launch Direct WhatsApp Export Desk
              </a>
            </div>

            {/* Minimalist Location Card */}
            <div className="rounded-[28px] border border-black/[0.07] bg-[#FAFAFC] p-6">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#6E6E73]">Location Coordinates</p>
              <p className="mt-1 text-sm font-semibold text-[#0A0B0E]">15 mins from Dhaka International Airport (DAC)</p>
              <a
                href="https://maps.google.com/?q=House+33+Road+12+Sector+11+Uttara+Dhaka+1230"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                Open Uttara Showroom in Google Maps <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Right Fast-Inquiry Form */}
          <div className="ambient-card rounded-[30px] p-7 sm:p-9 lg:col-span-7">
            {refId ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                <p className="mt-3 font-mono text-xs text-indigo-600">REFERENCE: {refId}</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#0A0B0E]">Message Received</h2>
                <p className="mt-2 text-sm text-[#515154]">
                  Thank you. Our Dhaka export desk will respond shortly.
                </p>
                <PrismaticButton variant="glass" className="mt-6" onClick={() => setRefId(null)}>
                  Send Another Message
                </PrismaticButton>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-semibold text-[#0A0B0E]">Fast Export Inquiry</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Your Full Name *"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="luminous-input rounded-2xl px-4 py-3 text-sm"
                  />
                  <input
                    required
                    placeholder="Company / Retail Group *"
                    value={form.company}
                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                    className="luminous-input rounded-2xl px-4 py-3 text-sm"
                  />
                  <input
                    required
                    type="email"
                    placeholder="Business Email *"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="luminous-input rounded-2xl px-4 py-3 text-sm"
                  />
                  <input
                    placeholder="WhatsApp / Phone"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="luminous-input rounded-2xl px-4 py-3 text-sm"
                  />
                </div>
                <textarea
                  required
                  rows={5}
                  placeholder="Share target categories, MOQ, destination port, or Dhaka visit dates..."
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  className="luminous-input w-full rounded-2xl p-4 text-sm"
                />
                <PrismaticButton type="submit" prismatic size="lg">
                  Send to Dhaka Export Desk
                </PrismaticButton>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
