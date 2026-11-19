"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What is the minimum order quantity (MOQ) for Stock Lots vs. Custom OEM?",
    a: "Ready-made export stock lots start at 200–300 pieces per lot depending on the style. Custom OEM / private-label manufacturing starts at 500–1,000 pieces per style/colorway.",
  },
  {
    q: "Do you accept payments in BDT (৳) as well as international L/C and T/T?",
    a: "Yes. Domestic and regional wholesalers can settle in BDT (৳) via bank transfer or local L/C. International importers can pay via Irrevocable L/C at Sight or T/T Wire Transfer.",
  },
  {
    q: "How is garment quality verified before dispatch from Dhaka?",
    a: "Every order undergoes inline and final AQL 2.5 inspection under our ISO 9001:2015 protocol covering GSM accuracy, stitching density, colorfastness, shrinkage, and ratio packing. Third-party inspections (SGS / Intertek) are welcome.",
  },
  {
    q: "How fast can ready stock lots be shipped?",
    a: "Verified stock lots stored in our Uttara, Dhaka warehouse are packed and ready for Air Cargo or Chittagong Sea Port handover within 3 to 5 business days of order confirmation.",
  },
];

export function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="divide-y divide-hairline border-y border-hairline">
      {FAQS.map((item, idx) => {
        const isOpen = openIdx === idx;
        const panelId = `b2b-faq-panel-${idx}`;

        return (
          <div key={item.q} className="py-5">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIdx(isOpen ? null : idx)}
              className="w-full flex items-center justify-between text-left gap-4 group"
            >
              <span className="font-display font-semibold text-base text-ink group-hover:text-neutral-600 transition-colors">
                {item.q}
              </span>
              <span className="p-1.5 border border-hairline bg-surface shrink-0">
                {isOpen ? (
                  <Minus className="w-4 h-4 text-ink" />
                ) : (
                  <Plus className="w-4 h-4 text-ink" />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-muted pt-3 pr-8 leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
