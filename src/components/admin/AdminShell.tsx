'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PlusCircle,
  Table2,
  ShoppingBag,
  Warehouse,
  Inbox,
  Settings,
  LogOut,
  Lock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
} from 'lucide-react';
import Image from 'next/image';
import type { StaffRole } from '@/types/admin';
import { AmbientAura, PrismaticButton, SpecBadge } from '@/design-system/primitives';
import { APPLE_EASE, TACTILE_SPRING } from '@/design-system/motion';

export interface AdminStaffUser {
  name: string;
  role: StaffRole;
}

interface AdminStaffContextValue {
  staff: AdminStaffUser | null;
  signInStaff: (user: AdminStaffUser) => void;
  signOutStaff: () => void;
}

const AdminStaffContext = createContext<AdminStaffContextValue>({
  staff: null,
  signInStaff: () => {},
  signOutStaff: () => {},
});

export function useAdminStaff() {
  return useContext(AdminStaffContext);
}

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/manage', label: 'Create & Update', icon: PlusCircle },
  { href: '/admin/records', label: 'Records', icon: Table2 },
  { href: '/admin/orders', label: 'Orders & Money', icon: ShoppingBag },
  { href: '/admin/operations', label: 'Warehouses & Factories', icon: Warehouse },
  { href: '/admin/inbox', label: 'Inbox', icon: Inbox },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const ROLE_PRESETS: { name: string; role: StaffRole; note: string }[] = [
  { name: 'Fakhrul Islam', role: 'Owner', note: 'Full Admin & ERP Access' },
  { name: 'Nadia Rahman', role: 'Merchandiser', note: 'Quotes, Lots & Buyer Visits' },
  { name: 'R. Karim', role: 'QC Officer', note: 'AQL 2.5 Photos & Warehouse Checks' },
  { name: 'Tanvir Hasan', role: 'Accounts', note: 'Bank Wire Checks & Invoices' },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [staffUser, setStaffUser] = useState<AdminStaffUser | null>(null);
  const [email, setEmail] = useState('fakhrul@ayaanclothing.com');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dhakaClock, setDhakaClock] = useState('');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('ayaan_admin_staff') : null;
    if (saved) {
      try {
        setStaffUser(JSON.parse(saved));
      } catch {
        const defaultUser = { name: 'Fakhrul Islam', role: 'Owner' as StaffRole };
        setStaffUser(defaultUser);
        sessionStorage.setItem('ayaan_admin_staff', JSON.stringify(defaultUser));
      }
    } else {
      const defaultUser = { name: 'Fakhrul Islam', role: 'Owner' as StaffRole };
      setStaffUser(defaultUser);
      sessionStorage.setItem('ayaan_admin_staff', JSON.stringify(defaultUser));
    }

    const tick = () =>
      setDhakaClock(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }).format(new Date())
      );
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const signInStaff = (user: AdminStaffUser) => {
    setStaffUser(user);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ayaan_admin_staff', JSON.stringify(user));
    }
  };

  const signOutStaff = () => {
    setStaffUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('ayaan_admin_staff');
    }
  };

  if (!staffUser) {
    return (
      <div className="relative min-h-[85vh] bg-white px-4 py-14 sm:py-20">
        <AmbientAura variant="hero" />
        <div className="relative mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
            <div className="glass-surface flex flex-col justify-between overflow-hidden rounded-[32px] p-8 md:col-span-6 relative">
              <div>
                <div className="relative mb-5 h-44 w-full overflow-hidden rounded-2xl border border-black/[0.08] shadow-xs">
                  <Image
                    src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=85"
                    alt="Ayaan Clothing Garments Manufacturing & QC Floor"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-105"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white/90">
                      Dhaka Factory &amp; Logistics Hub
                    </span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 font-mono text-[10px] backdrop-blur-md">
                      Staff Secured
                    </span>
                  </div>
                </div>

                <SpecBadge tone="original">Ayaan Staff Workspace · Dhaka HQ</SpecBadge>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E]">
                  Admin &amp; ERP Control Center
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-[#515154]">
                  Simple, calm daily tools for Ayaan Clothing’s team—manage stock lots, answer buyer quotes, upload QC
                  photos, and confirm payments in plain English.
                </p>

                <div className="mt-6 space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-[#6E6E73]">
                    Quick 1-Click Staff Role Demo
                  </p>
                  {ROLE_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => signInStaff({ name: preset.name, role: preset.role })}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-black/[0.06] bg-white px-4 py-2.5 text-left transition-all hover:border-indigo-300 hover:shadow-xs"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#0A0B0E]">{preset.name}</p>
                        <p className="text-[11px] text-[#6E6E73]">{preset.note}</p>
                      </div>
                      <SpecBadge tone="neutral">{preset.role}</SpecBadge>
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-6 font-mono text-[10px] text-[#86868B]">Uttara Sector 11, Dhaka · BGMEA #1708</p>
            </div>

            <div className="ambient-card rounded-[32px] p-8 md:col-span-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0B0E]">
                  <Lock className="h-4 w-4 text-indigo-600" /> Staff Sign In
                </div>
                <Link
                  href="/account"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
                >
                  <UserCheck className="h-3.5 w-3.5" /> Customer Portal
                </Link>
              </div>

              {/* Quick Access Shortcuts */}
              <div className="mt-4 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#6E6E73] mb-2 font-semibold">
                  Quick Access Shortcuts
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => signInStaff({ name: 'Fakhrul Islam', role: 'Owner' })}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-black hover:shadow-2xs"
                  >
                    <Shield className="h-3.5 w-3.5 text-amber-400" />
                    Admin Login
                  </button>
                  <Link
                    href="/account"
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/70 px-3 py-2 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 hover:shadow-2xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Customer Login
                  </Link>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  signInStaff({ name: 'Fakhrul Islam', role: 'Owner' });
                }}
                className="mt-5 space-y-4"
              >
                <div>
                  <label className="text-xs font-medium text-[#515154]">Staff Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  Enter Admin Panel
                </PrismaticButton>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentNav = NAV_ITEMS.find((n) => n.href === pathname) || NAV_ITEMS[0];

  return (
    <AdminStaffContext.Provider value={{ staff: staffUser, signInStaff, signOutStaff }}>
      <div className="relative flex min-h-[calc(100vh-4rem)] bg-white">
        {/* Desktop Sidebar Rail */}
        <aside
          className={`hidden shrink-0 flex-col justify-between border-r border-black/[0.06] bg-[#FAFAFC]/85 p-3.5 backdrop-blur-xl transition-all duration-300 lg:flex ${
            collapsed ? 'w-[78px]' : 'w-[260px]'
          }`}
        >
          <div>
            {/* Top Identity Block */}
            <div className="mb-4 flex items-center justify-between rounded-2xl border border-black/[0.06] bg-white p-3 shadow-2xs">
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#0A0B0E]">{staffUser.name}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-indigo-600">
                    <Shield className="h-3 w-3" /> {staffUser.role}
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

            {/* Nav Items */}
            <nav className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
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
                        layoutId="adminNavPill"
                        transition={TACTILE_SPRING}
                        className="absolute inset-0 rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_10px_-3px_rgba(15,23,42,0.1)]"
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2.5">
                      <item.icon className={`h-4 w-4 shrink-0 ${active ? 'text-indigo-600' : ''}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </span>
                  </Link>
                );
              })}

              {/* Sign Out in Sidebar */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={signOutStaff}
                  title={collapsed ? 'Sign Out' : undefined}
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

          {!collapsed && (
            <div className="rounded-2xl border border-black/[0.06] bg-white p-3 text-center">
              <p className="font-mono text-[10px] text-[#6E6E73]">Dhaka Time: {dhakaClock}</p>
            </div>
          )}
        </aside>

        {/* Workspace Body */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Utility Header */}
          <div className="sticky top-16 z-20 flex h-14 items-center justify-between border-b border-black/[0.06] bg-white/82 px-4 backdrop-blur-2xl sm:px-6 lg:px-8">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[#F5F5F7] text-[#0A0B0E] lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#86868B] hidden sm:inline">
                Admin /
              </span>
              <h2 className="text-sm font-semibold tracking-[-0.01em] text-[#0A0B0E]">{currentNav.label}</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={signOutStaff}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/[0.08] bg-[#FAFAFC] px-3 py-1.5 text-xs font-medium text-[#515154] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-500" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Page Children */}
          <div className="relative flex-1 bg-white px-4 py-7 sm:px-6 lg:px-8">{children}</div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
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
                  <span className="text-sm font-semibold text-[#0A0B0E]">{staffUser.name}</span>
                  <button type="button" onClick={() => setMobileOpen(false)} className="rounded-full p-1.5 bg-[#F5F5F7]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
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
                        setMobileOpen(false);
                        signOutStaff();
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
      </div>
    </AdminStaffContext.Provider>
  );
}
