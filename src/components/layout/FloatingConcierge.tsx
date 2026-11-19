'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, FileText, PhoneCall } from 'lucide-react';
import { APPLE_EASE } from '@/design-system/motion';

export function FloatingConcierge() {
  const [open, setOpen] = useState(false);
  const [dhakaTime, setDhakaTime] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(now);
      const hour24 = Number(
        new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', hour12: false }).format(now)
      );
      setDhakaTime(fmt);
      setIsOnline(hour24 >= 9 && hour24 <= 21);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801620853502';

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.24, ease: APPLE_EASE }}
            className="glass-surface w-72 rounded-3xl p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#0A0B0E]">Dhaka Export Desk</p>
                <p className="font-mono text-[11px] text-[#6E6E73]">
                  BST {dhakaTime || 'UTC+6'} · {isOnline ? 'Merchandisers Online' : '24/7 WhatsApp Desk'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="cursor-pointer rounded-full p-1 text-[#6E6E73] hover:bg-black/5"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3.5 space-y-2">
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                  'Hello Ayaan Clothing Export Desk, I would like to inquire about wholesale stock lots / OEM sourcing.'
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-2xl bg-emerald-500 px-3.5 py-2.5 text-xs font-semibold text-white transition-transform hover:scale-[1.01]"
              >
                <MessageCircle className="h-4 w-4" />
                Chat Direct on WhatsApp
              </a>
              <Link
                href="/rfq"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-2xl bg-[#F5F5F7] px-3.5 py-2.5 text-xs font-medium text-[#0A0B0E] hover:bg-[#EBEBF0]"
              >
                <FileText className="h-4 w-4 text-indigo-600" />
                Open Formal RFQ Studio
              </Link>
              <a
                href="tel:+8801620853502"
                className="flex items-center gap-2.5 rounded-2xl border border-black/[0.06] bg-white px-3.5 py-2.5 font-mono text-xs text-[#515154] hover:text-[#0A0B0E]"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                +880 1620-853502
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="glass-surface prismatic-ring prismatic-hover flex cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium text-[#0A0B0E]"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span>Export Desk</span>
        <span className="hidden font-mono text-[11px] text-[#6E6E73] sm:inline">· WhatsApp</span>
      </button>
    </div>
  );
}
