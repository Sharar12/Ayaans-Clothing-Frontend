'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APPLE_EASE, REVEAL_VARIANTS, TACTILE_SPRING } from './motion';

/** Ultra-soft colorful atmospheric glow placed behind focal pure-white sections */
export function AmbientAura({
  variant = 'hero',
  className = '',
}: {
  variant?: 'hero' | 'subtle' | 'warm' | 'cool';
  className?: string;
}) {
  const palettes = {
    hero: (
      <>
        <div className="animate-aura pointer-events-none absolute -top-28 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-300/20 via-indigo-300/20 to-rose-300/20 blur-[110px]" />
        <div className="animate-aura-delayed pointer-events-none absolute top-12 right-[12%] h-[260px] w-[340px] rounded-full bg-gradient-to-tr from-amber-200/20 via-pink-200/15 to-cyan-200/20 blur-[95px]" />
      </>
    ),
    subtle: (
      <div className="animate-aura pointer-events-none absolute -top-16 left-1/2 h-[280px] w-[560px] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-200/20 via-violet-200/15 to-emerald-200/20 blur-[100px]" />
    ),
    warm: (
      <div className="animate-aura pointer-events-none absolute inset-0 mx-auto h-[320px] w-[600px] rounded-full bg-gradient-to-r from-amber-200/20 via-rose-200/20 to-indigo-200/20 blur-[105px]" />
    ),
    cool: (
      <div className="animate-aura pointer-events-none absolute inset-0 mx-auto h-[300px] w-[580px] rounded-full bg-gradient-to-r from-cyan-200/20 via-sky-200/20 to-indigo-200/20 blur-[105px]" />
    ),
  };

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {palettes[variant]}
    </div>
  );
}

/** Clean, Line-Free Background Video Stage with 33% Opacity, 1x Native Speed, Dual-Tile Support & Faded Borders */
export function VideoBackground({
  src,
  srcSecondary,
  opacity = 0.33,
  playbackRate = 1.0,
  className = '',
  split = false,
  topOnly = false,
  height = '380px',
}: {
  src: string;
  srcSecondary?: string;
  opacity?: number;
  playbackRate?: number;
  className?: string;
  split?: boolean;
  topOnly?: boolean;
  height?: string;
}) {
  const attachVideoRef = (el: HTMLVideoElement | null) => {
    if (el) {
      el.playbackRate = playbackRate;
    }
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 overflow-hidden video-fade-mask ${
        topOnly ? 'left-0 right-0 top-0' : 'inset-0'
      } ${className}`}
      style={topOnly ? { height } : undefined}
    >
      {split ? (
        /* If section height is huge, render 2 synchronized instances with an elegant gap between them */
        <div className="flex h-full w-full flex-col justify-between gap-24">
          <div className="relative h-[46%] w-full overflow-hidden">
            <video
              ref={attachVideoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity }}
            >
              <source src={src} type="video/mp4" />
            </video>
            {/* Top/bottom smooth feather */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
          </div>

          <div className="relative h-[46%] w-full overflow-hidden">
            <video
              ref={attachVideoRef}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity }}
            >
              <source src={srcSecondary || src} type="video/mp4" />
            </video>
            {/* Top/bottom smooth feather */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
          </div>
        </div>
      ) : (
        /* Single Instance (Full Height or Top-Aligned Hero Title Banner) */
        <div className="relative h-full w-full overflow-hidden">
          <video
            ref={attachVideoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover object-top transition-opacity duration-700"
            style={{ opacity }}
          >
            <source src={src} type="video/mp4" />
          </video>
          {/* Subtle perimeter white fade so borders softly dissolve into the page background */}
          <div
            className={`absolute inset-0 bg-gradient-to-b ${
              topOnly
                ? 'from-transparent via-white/20 to-white'
                : 'from-white/80 via-transparent to-white/85'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-white/40" />
        </div>
      )}
    </div>
  );
}

/** Magnetic Apple-grade primary/secondary button with specular hover sheen & prismatic focus */
interface PrismaticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'obsidian' | 'glass' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  prismatic?: boolean;
  children: React.ReactNode;
}

export function PrismaticButton({
  variant = 'obsidian',
  size = 'md',
  prismatic = false,
  className = '',
  children,
  ...rest
}: PrismaticButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-[15px] gap-2.5',
  };

  const variantClasses = {
    obsidian:
      'bg-[#0A0B0E] text-white hover:bg-[#191B22] shadow-[0_8px_24px_-10px_rgba(10,11,14,0.45)]',
    glass:
      'glass-pill text-[#0A0B0E] hover:bg-white hover:shadow-[0_12px_28px_-12px_rgba(99,102,241,0.2)]',
    ghost: 'bg-transparent text-[#515154] hover:text-[#0A0B0E] hover:bg-[#F5F5F7]',
  };

  return (
    <motion.button
      whileHover={{ y: -1.5 }}
      whileTap={{ scale: 0.98 }}
      transition={TACTILE_SPRING}
      className={`group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-full font-medium whitespace-nowrap tracking-[-0.01em] transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${
        prismatic ? 'prismatic-ring prismatic-hover' : ''
      } ${className}`}
      {...(rest as React.ComponentProps<typeof motion.button>)}
    >
      {variant === 'obsidian' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

/** Apple Bento Tile with live cursor-following iridescent ambient radial spotlight */
export function BentoTile({
  children,
  className = '',
  tint = 'indigo',
}: {
  children: React.ReactNode;
  className?: string;
  tint?: 'indigo' | 'sky' | 'rose' | 'emerald' | 'amber';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState({ x: 0, y: 0, active: false });

  const tintRgb: Record<string, string> = {
    indigo: 'rgba(129, 140, 248, 0.11)',
    sky: 'rgba(56, 189, 248, 0.12)',
    rose: 'rgba(244, 114, 182, 0.10)',
    emerald: 'rgba(52, 211, 153, 0.11)',
    amber: 'rgba(251, 191, 36, 0.11)',
  };

  return (
    <motion.div
      ref={ref}
      variants={REVEAL_VARIANTS}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: APPLE_EASE }}
      onMouseMove={(e) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        setSpot({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
      }}
      onMouseLeave={() => setSpot((s) => ({ ...s, active: false }))}
      className={`ambient-card relative overflow-hidden rounded-[28px] p-7 ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(380px circle at ${spot.x}px ${spot.y}px, ${tintRgb[tint]}, transparent 65%)`,
        }}
      />
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  );
}

/** Technical B2B Spec Pill / Status Badge */
export function SpecBadge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'original' | 'master' | 'emerald' | 'rose' | 'glass';
  className?: string;
}) {
  const tones = {
    neutral: 'bg-[#F5F5F7] text-[#3A3A3D] border-black/5',
    original: 'bg-indigo-50/90 text-indigo-700 border-indigo-200/60',
    master: 'bg-amber-50/90 text-amber-700 border-amber-200/70',
    emerald: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/60',
    rose: 'bg-rose-50/90 text-rose-600 border-rose-200/60',
    glass: 'glass-pill text-[#0A0B0E]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Spring-gliding Apple Segmented Pill Switcher */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  className = '',
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (val: T) => void;
  layoutId: string;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex flex-wrap items-center gap-1 rounded-full bg-[#F5F5F7] p-1 border border-black/[0.04] ${className}`}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`relative cursor-pointer rounded-full px-4 py-1.5 text-xs sm:text-[13px] font-medium transition-colors ${
              active ? 'text-[#0A0B0E]' : 'text-[#6E6E73] hover:text-[#0A0B0E]'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={TACTILE_SPRING}
                className="absolute inset-0 rounded-full bg-white shadow-[0_2px_8px_-2px_rgba(15,23,42,0.12)] border border-black/[0.04]"
              />
            )}
            <span className="relative z-10">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Smooth Bidirectional Scroll-Triggered Reveal Wrapper (Appears & Disappears on Scroll Up/Down) */
export function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  once = false,
  amount = 0.15,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  once?: boolean;
  amount?: number;
}) {
  const getInitial = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 32, filter: 'blur(6px)' };
      case 'down':
        return { opacity: 0, y: -32, filter: 'blur(6px)' };
      case 'left':
        return { opacity: 0, x: -36, filter: 'blur(6px)' };
      case 'right':
        return { opacity: 0, x: 36, filter: 'blur(6px)' };
      case 'none':
      default:
        return { opacity: 0, filter: 'blur(6px)' };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
      viewport={{ once, amount }}
      transition={{ duration: 0.65, delay, ease: APPLE_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Frosted Depth-of-Field Modal Shell */
export function GlassModal({
  open,
  onClose,
  maxWidth = 'max-w-3xl',
  children,
}: {
  open: boolean;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/55 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.32, ease: APPLE_EASE }}
            className={`relative z-10 w-full ${maxWidth} max-h-[90vh] overflow-y-auto rounded-[28px] bg-white/95 backdrop-blur-2xl border border-black/[0.08] shadow-[0_32px_90px_-24px_rgba(15,23,42,0.22)]`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
