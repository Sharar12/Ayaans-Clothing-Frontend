"use client";

import { motion } from "framer-motion";

type AuraVariant = "hero" | "estimator" | "cta";

export function AmbientAura({ variant = "hero" }: { variant?: AuraVariant }) {
  if (variant === "hero") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        {/* Top-right soft sky and violet glow */}
        <motion.div
          animate={{ x: [0, 24, -12, 0], y: [0, -18, 14, 0], scale: [1, 1.08, 0.96, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 right-[-8%] h-[460px] w-[460px] rounded-full bg-gradient-to-tr from-sky-200/50 via-indigo-200/45 to-fuchsia-200/40 blur-[110px]"
        />
        {/* Mid-left soft peach and rose glow */}
        <motion.div
          animate={{ x: [0, -20, 16, 0], y: [0, 20, -12, 0], scale: [1, 0.94, 1.06, 1] }}
          transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-36 -left-24 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-rose-200/40 via-amber-100/45 to-emerald-100/40 blur-[110px]"
        />
      </div>
    );
  }

  if (variant === "estimator") {
    return (
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/2 left-1/4 h-[360px] w-[520px] -translate-y-1/2 rounded-full bg-gradient-to-r from-cyan-200/40 via-violet-200/35 to-rose-200/40 blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 h-[300px] w-[380px] rounded-full bg-gradient-to-l from-emerald-200/35 via-sky-200/35 to-indigo-200/30 blur-[110px]" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
      <div className="absolute -top-20 left-1/2 h-[320px] w-[620px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-200/45 via-fuchsia-200/35 to-amber-200/45 blur-[115px]" />
    </div>
  );
}
