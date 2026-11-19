'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  FileText,
  Sparkles,
  Ship,
  ShieldCheck,
  Receipt,
  Heart,
  Settings,
  Bell,
  Search,
  LogOut,
  MessageCircle,
  Lock,
  CheckCircle2,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
  UserCheck,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { portalApi } from '@/services/portalApi';
import type { PortalNotification } from '@/types/portal';
import { AmbientAura, PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';
import { APPLE_EASE, TACTILE_SPRING } from '@/design-system/motion';

const PORTAL_NAV = [
  { href: '/account', label: 'Overview', icon: LayoutDashboard },
  { href: '/account/orders', label: 'Orders & 10-Step', icon: Package },
  { href: '/account/rfqs', label: 'RFQs & Quotes', icon: FileText, badge: '1' },
  { href: '/account/vip-drops', label: 'VIP Early Drops', icon: Sparkles, live: true },
  { href: '/account/containers', label: 'Container & CBM', icon: Ship },
  { href: '/account/inspections', label: 'AQL 2.5 QC', icon: ShieldCheck, badge: '1' },
  { href: '/account/documents', label: 'Invoices & Vault', icon: Receipt },
  { href: '/account/saved', label: 'Saved & Reorder', icon: Heart },
  { href: '/account/settings', label: 'Company & Visits', icon: Settings },
];

export function PortalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { buyer, signInDemo, signOut, setSpotlightOpen, wishlist } = useApp();

  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);

  useEffect(() => {
    if (buyer) portalApi.getNotifications().then(setNotifications);
  }, [buyer]);

  const unreadCount = notifications.filter((n) => n.unread).length;
  const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '8801620853502';

  // UNAUTHENTICATED TRADE PORTAL GATE
  if (!buyer) {
    return (
      <div className="relative min-h-[85vh] bg-white px-4 py-14 sm:py-20">
        <AmbientAura variant="hero" />
        <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-12">
          <div className="glass-surface flex flex-col justify-between rounded-[32px] p-8 sm:p-10 md:col-span-6">
            <div>
              <SpecBadge tone="original">Verified Global Buyer Workspace</SpecBadge>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] text-[#0A0B0E] sm:text-4xl">
                Ayaan Trade Portal
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-[#515154]">
                Manage 10-step Dhaka exports, inspect HD AQL 2.5 QC galleries, reserve VIP early drops for 24 hours,
                and optimize 20ft/40ft container CBM in one luminous workspace.
              </p>
              <ul className="mt-7 space-y-3 text-xs text-[#1D1D1F]">
                {[
                  '12-hour VIP head start on fresh Uttara warehouse drops + 24h soft holds',
                  'Live 10-step shipment tracking & AQL 2.5 digital dispatch sign-off',
                  'Direct T/T Swift & L/C document vault with BGMEA-verified bank credentials',
                  'Dedicated Dhaka Senior Merchandiser & VIP Bangladesh trip concierge',
                ].map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-8 font-mono text-[11px] text-[#6E6E73]">
              ISO 9001:2015 · BGMEA Reg #1708 · Dhaka Since 2010
            </p>
          </div>

          <div className="ambient-card rounded-[32px] p-8 sm:p-10 md:col-span-6">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0B0E]">
                <Lock className="h-3.5 w-3.5 text-indigo-600" />
                {authMode === 'signin' ? 'Buyer Sign In' : 'Open Trade Account'}
              </span>
              <SegmentedControl
                layoutId="portalAuthMode"
                value={authMode}
                onChange={setAuthMode}
                options={[
                  { label: 'Sign In', value: 'signin' },
                  { label: 'Register', value: 'register' },
                ]}
              />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                signInDemo(email || 'buying@nordicretail.eu', company || 'Nordic Retail Group AB');
              }}
              className="mt-6 space-y-4"
            >
              {/* Instant 1-Click Role Shortcuts */}
              <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6E6E73] mb-2 font-semibold">
                  Quick Access Shortcuts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => signInDemo('buying@nordicretail.eu', 'Nordic Retail Group AB')}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/70 px-3 py-2 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:shadow-2xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Customer Login
                  </button>
                  <Link
                    href="/admin"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        sessionStorage.setItem(
                          'ayaan_admin_staff',
                          JSON.stringify({ name: 'Fakhrul Islam', role: 'Owner' })
                        );
                      }
                    }}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-black hover:shadow-2xs"
                  >
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    Admin Login
                  </Link>
                </div>
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="text-xs font-medium text-[#515154]">Company / Wholesale Store Name</label>
                  <input
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Nordic Retail Group AB"
                    className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-3 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-medium text-[#515154]">Business Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="buying@company.eu"
                  className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[#515154]">Password</label>
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-3 text-sm"
                />
              </div>
              <PrismaticButton type="submit" prismatic size="lg" className="w-full">
                {authMode === 'signin' ? 'Enter Buyer Portal' : 'Create Verified Trade Account'}
              </PrismaticButton>
            </form>

            <div className="mt-5 rounded-2xl bg-[#FAFAFC] p-3.5 text-center border border-black/[0.05]">
              <p className="text-[11px] text-[#6E6E73]">Quick testing accounts pre-loaded with orders &amp; data:</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => signInDemo('buying@nordicretail.eu', 'Nordic Retail Group AB')}
                  className="cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-semibold text-indigo-600 border border-black/[0.08] hover:bg-indigo-50"
                >
                  ⚡ Customer Demo
                </button>
                <Link
                  href="/admin"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      sessionStorage.setItem(
                        'ayaan_admin_staff',
                        JSON.stringify({ name: 'Fakhrul Islam', role: 'Owner' })
                      );
                    }
                  }}
                  className="cursor-pointer rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-800 border border-black/[0.08] hover:bg-neutral-100"
                >
                  🛡️ Admin Panel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentNav = PORTAL_NAV.find((n) => n.href === pathname) || PORTAL_NAV[0];

  // AUTHENTICATED 9-SECTION WORKSPACE SHELL
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] bg-white">
      {/* Desktop Frosted Left Navigation Rail */}
      <aside
        className={`hidden shrink-0 flex-col justify-between border-r border-black/[0.06] bg-[#FAFAFC]/85 p-3.5 backdrop-blur-xl transition-all duration-300 lg:flex ${
          collapsed ? 'w-[78px]' : 'w-[264px]'
        }`}
      >
        <div>
          {/* Company Identity Switcher */}
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-3 shadow-2xs">
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#0A0B0E]">{buyer.company}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-emerald-700">
                  <ShieldCheck className="h-3 w-3" /> KYC Verified
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label="Toggle Sidebar"
              className="mx-auto flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#0A0B0E] lg:mx-0"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* 9 Navigation Links with Gliding Spring Pill */}
          <nav className="space-y-1">
            {PORTAL_NAV.map((item) => {
              const active = pathname === item.href;
              const dynBadge = item.href === '/account/saved' && wishlist.length > 0 ? String(wishlist.length) : item.badge;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`relative flex items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-medium transition-colors ${
                    active ? 'text-[#0A0B0E]' : 'text-[#515154] hover:text-[#0A0B0E]'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="portalNavPill"
                      transition={TACTILE_SPRING}
                      className="absolute inset-0 rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.1)]"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-600' : ''}`} />
                    {!collapsed && <span>{item.label}</span>}
                  </span>
                  {!collapsed && (
                    <span className="relative z-10 flex items-center gap-1.5">
                      {item.live && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                      {dynBadge && (
                        <span className="rounded-full bg-[#0A0B0E] px-1.5 py-0.5 font-mono text-[10px] text-white">
                          {dynBadge}
                        </span>
                      )}
                    </span>
                  )}
                </Link>
              );
            })}
            {/* Sign Out Action in Sidebar */}
            <div className="pt-2">
              <button
                type="button"
                onClick={signOut}
                title={collapsed ? "Sign Out" : undefined}
                className="group flex w-full cursor-pointer items-center justify-between rounded-2xl px-3 py-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
              >
                <span className="flex items-center gap-2.5">
                  <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
                  {!collapsed && <span>Sign Out</span>}
                </span>
              </button>
            </div>
          </nav>
        </div>

        {/* Pinned Dedicated Dhaka Merchandiser Card */}
        {!collapsed && (
          <div className="mt-6 rounded-3xl border border-black/[0.06] bg-white p-4 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A0B0E] text-xs font-semibold text-white">
                FI
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-[#0A0B0E]">{buyer.merchandiser.name}</p>
                <p className="truncate text-[10px] text-[#6E6E73]">Dhaka Export Desk · Online</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1 rounded-full bg-emerald-500 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-600"
              >
                <MessageCircle className="h-3 w-3" /> WhatsApp
              </a>
              <a
                href="mailto:export@ayaanclothing.com"
                className="inline-flex items-center justify-center rounded-full bg-[#F5F5F7] py-1.5 text-[11px] font-medium text-[#0A0B0E] hover:bg-[#EAEAEF]"
              >
                Email
              </a>
            </div>
          </div>
        )}
      </aside>

      {/* Main Right Workspace Column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Portal Utility Strip */}
        <div className="sticky top-16 z-20 flex h-14 items-center justify-between border-b border-black/[0.06] bg-white/82 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F7] text-[#0A0B0E] lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#86868B] hidden sm:inline">
              Portal /
            </span>
            <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0A0B0E]">{currentNav.label}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSpotlightOpen(true)}
              className="hidden cursor-pointer items-center gap-2 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-xs text-[#6E6E73] hover:text-[#0A0B0E] md:inline-flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Search orders, SKUs...</span>
              <kbd className="font-mono text-[10px]">⌘K</kbd>
            </button>

            <button
              type="button"
              onClick={() => setNotifOpen(true)}
              className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F7] text-[#0A0B0E] hover:bg-[#EAEAEF]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute right-1 top-1 flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <Link href="/rfq" className="hidden sm:block">
              <PrismaticButton size="sm" prismatic>
                <Plus className="h-3.5 w-3.5" /> New RFQ
              </PrismaticButton>
            </Link>

            <button
              type="button"
              onClick={signOut}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#FAFAFC] px-3 py-1.5 text-xs font-medium text-[#515154] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut className="h-3.5 w-3.5 text-rose-500" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Active Section Viewport */}
        <div className="relative flex-1 bg-white px-4 py-7 sm:px-6 lg:px-8">{children}</div>
      </div>

      {/* Mobile Portal Drawer */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-white/55 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              className="relative z-10 flex h-full w-72 flex-col bg-white p-5 shadow-2xl border-r border-black/[0.08]"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0A0B0E]">{buyer.company}</span>
                <button type="button" onClick={() => setMobileNavOpen(false)} className="rounded-full p-1.5 bg-[#F5F5F7]">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <nav className="space-y-1">
                {PORTAL_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-medium ${
                      pathname === item.href ? 'bg-[#0A0B0E] text-white' : 'text-[#515154]'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileNavOpen(false);
                      signOut();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 hover:text-rose-700"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </nav>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Over Notifications Drawer */}
      <AnimatePresence>
        {notifOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifOpen(false)}
              className="fixed inset-0 bg-white/50 backdrop-blur-md"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.32, ease: APPLE_EASE }}
              className="relative z-10 flex h-full w-full max-w-sm flex-col border-l border-black/[0.08] bg-white/95 p-6 backdrop-blur-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#0A0B0E]">Trade Alerts &amp; Updates</h3>
                  <p className="font-mono text-[11px] text-[#6E6E73]">{unreadCount} unread notifications</p>
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={() => portalApi.markAllRead().then(setNotifications)}
                      className="cursor-pointer text-[11px] font-medium text-indigo-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                  <button type="button" onClick={() => setNotifOpen(false)} className="cursor-pointer rounded-full bg-[#F5F5F7] p-1.5">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2.5 overflow-y-auto">
                {notifications.map((n) => (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => setNotifOpen(false)}
                    className={`block rounded-2xl border p-3.5 transition-colors hover:bg-[#FAFAFC] ${
                      n.unread ? 'border-indigo-200/70 bg-indigo-50/30' : 'border-black/[0.06] bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-[#0A0B0E]">{n.title}</p>
                      <span className="font-mono text-[10px] text-[#86868B]">{n.time}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-[#515154]">{n.body}</p>
                  </Link>
                ))}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
