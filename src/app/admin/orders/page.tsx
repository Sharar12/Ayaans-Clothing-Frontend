'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Printer,
  Upload,
  X,
  MessageCircle,
  ShieldCheck,
  DollarSign,
  Landmark,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import type { BankAccountRecord, ExpenseRecord, FactoryOrderRecord, OrderStepStatus, UnifiedOrder } from '@/types/admin';
import { useApp } from '@/store/AppContext';
import { exportTableToPdf } from '@/utils/exportReport';
import { GlassModal, PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';
import { APPLE_EASE } from '@/design-system/motion';

const STEP_FLOW: OrderStepStatus[] = ['Pending', 'Packing', 'Quality Check', 'Shipped', 'Delivered'];

export default function UnifiedAdminOrdersPage() {
  const { notify } = useApp();
  const [tab, setTab] = useState<'buyer' | 'factory' | 'accounts' | 'money'>('buyer');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStepStatus>('All');
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [factoryOrders, setFactoryOrders] = useState<FactoryOrderRecord[]>([]);
  const [accounts, setAccounts] = useState<BankAccountRecord[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [fxRate, setFxRate] = useState(121.5);

  // Active Buyer Order Drawer + Partial Payment inputs
  const [activeOrder, setActiveOrder] = useState<UnifiedOrder | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payAccount, setPayAccount] = useState('ACC-001');
  const [payNote, setPayNote] = useState('');

  // Factory Partial Payment Modal
  const [payingFo, setPayingFo] = useState<FactoryOrderRecord | null>(null);
  const [foPayAmount, setFoPayAmount] = useState('');
  const [foPayAccount, setFoPayAccount] = useState('ACC-002');
  const [foPayNote, setFoPayNote] = useState('');

  useEffect(() => {
    adminApi.getOrdersBundle().then((res) => {
      setOrders(res.orders);
      setFactoryOrders(res.factoryOrders);
      setAccounts(res.accounts);
      setExpenses(res.expenses);
      setFxRate(res.usdToBdtRate);
    });
  }, []);

  const buyersOweUs = orders.reduce((s, o) => s + Math.max(0, o.totalUsd - o.paidUsd), 0);
  const weOweFactories = factoryOrders.reduce((s, f) => s + Math.max(0, f.totalCostUsd - f.paidUsd), 0);
  const filteredOrders = orders.filter((o) => statusFilter === 'All' || o.status === statusFilter);

  const patchActive = async (patch: Partial<UnifiedOrder>, toastText: string) => {
    if (!activeOrder) return;
    const updated = await adminApi.updateOrder(activeOrder.id, patch);
    setOrders(updated);
    setActiveOrder(updated.find((o) => o.id === activeOrder.id) || null);
    notify(toastText);
  };

  const handleRecordBuyerPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return;
    const res = await adminApi.recordBuyerPayment(activeOrder.id, amt, payAccount, 'Bank Wire', payNote || 'Installment received');
    setOrders(res.orders);
    setAccounts(res.accounts);
    setActiveOrder(res.orders.find((o: UnifiedOrder) => o.id === activeOrder.id) || null);
    setPayAmount('');
    setPayNote('');
    notify(`Recorded +$${amt.toLocaleString()} into ${payAccount}!`);
  };

  const handleRecordFactoryPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFo) return;
    const amt = Number(foPayAmount);
    if (!amt || amt <= 0) return;
    const res = await adminApi.recordFactoryPayment(payingFo.id, amt, foPayAccount, foPayNote);
    setFactoryOrders(res.factoryOrders);
    setAccounts(res.accounts);
    setExpenses(res.expenses);
    setPayingFo(null);
    setFoPayAmount('');
    setFoPayNote('');
    notify(`Paid $${amt.toLocaleString()} to ${payingFo.factoryName} from ${foPayAccount}!`);
  };

  const printOfficialBill = (ord: UnifiedOrder) => {
    exportTableToPdf({
      title: `Official Bill & Packing Slip — ${ord.id}`,
      subtitle: `Buyer: ${ord.buyerCompany} · Destination: ${ord.destination} · Carrier: ${ord.carrierName} (${ord.trackingNumber})`,
      summaryCards: [
        { label: 'Order Total', value: `$${ord.totalUsd.toLocaleString()}` },
        { label: 'Paid So Far', value: `$${ord.paidUsd.toLocaleString()}` },
        { label: 'Balance Still Due', value: `$${Math.max(0, ord.totalUsd - ord.paidUsd).toLocaleString()}` },
        { label: 'Status', value: ord.paymentStatus },
      ],
      columns: [
        { key: 'id', label: 'Order ID' },
        { key: 'items', label: 'Clothes Summary' },
        { key: 'pieces', label: 'Total Pieces' },
        { key: 'mode', label: 'Shipping' },
        { key: 'total', label: 'Total (USD)' },
      ],
      rows: [
        {
          id: ord.id,
          items: ord.itemsSummary,
          pieces: ord.totalPieces.toLocaleString(),
          mode: ord.shippingMode,
          total: `$${ord.totalUsd.toLocaleString()}`,
        },
      ],
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Header + Who Owes Who Strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Orders, Dues &amp; Bank Accounts</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Orders &amp; Transactions
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-xs">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-amber-800">
            Buyers Owe Us: <strong>${buyersOweUs.toLocaleString()}</strong>
          </span>
          <span className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-rose-700">
            We Owe Factories: <strong>${weOweFactories.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      <SegmentedControl
        layoutId="ordersMainTab"
        value={tab}
        onChange={setTab}
        options={[
          { label: `Buyer Orders (${orders.length})`, value: 'buyer' },
          { label: `Factory Orders (${factoryOrders.length})`, value: 'factory' },
          { label: `Bank & Cash (${accounts.length})`, value: 'accounts' },
          { label: 'Money In & Out', value: 'money' },
        ]}
      />

      {/* TAB 1: BUYER ORDERS WITH PAID / DUE PROGRESS */}
      {tab === 'buyer' && (
        <>
          <div className="flex flex-wrap gap-1.5">
            {(['All', ...STEP_FLOW] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium ${
                  statusFilter === st ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="space-y-3.5">
            {filteredOrders.map((ord) => {
              const due = Math.max(0, ord.totalUsd - ord.paidUsd);
              const pct = Math.min(100, Math.round((ord.paidUsd / Math.max(1, ord.totalUsd)) * 100));
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setActiveOrder(ord);
                    setPayAmount(due > 0 ? String(due) : '');
                  }}
                  className={`ambient-card cursor-pointer rounded-[26px] p-5 ${
                    ord.paymentStatus === 'Bank Slip Uploaded' ? 'prismatic-ring' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">
                          {ord.id}
                        </span>
                        <SpecBadge tone={ord.status === 'Delivered' ? 'emerald' : 'original'}>{ord.status}</SpecBadge>
                        <SpecBadge
                          tone={
                            ord.paymentStatus === 'Paid'
                              ? 'emerald'
                              : ord.paymentStatus === 'Bank Slip Uploaded'
                                ? 'rose'
                                : 'master'
                          }
                        >
                          {ord.paymentStatus}
                        </SpecBadge>
                      </div>
                      <h2 className="mt-1.5 text-base font-semibold text-[#0A0B0E]">{ord.buyerCompany}</h2>
                      <p className="mt-0.5 text-xs text-[#515154]">{ord.itemsSummary}</p>
                    </div>

                    <div className="text-right font-mono">
                      <p className="text-lg font-semibold text-[#0A0B0E]">${ord.totalUsd.toLocaleString()}</p>
                      <p className="text-[11px] text-emerald-700">Paid: ${ord.paidUsd.toLocaleString()}</p>
                      {due > 0 && <p className="text-[11px] font-semibold text-amber-700">Due: ${due.toLocaleString()}</p>}
                    </div>
                  </div>

                  {/* Partial Payment Visual Bar */}
                  <div className="mt-3.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-indigo-600">
                      {pct}% paid · Manage <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* TAB 2: FACTORY ORDERS WITH PAID / OWED TRACKING */}
      {tab === 'factory' && (
        <div className="space-y-3.5">
          {factoryOrders.map((fo) => {
            const owed = Math.max(0, fo.totalCostUsd - fo.paidUsd);
            return (
              <div key={fo.id} className="ambient-card flex flex-wrap items-center justify-between gap-4 rounded-[26px] p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">{fo.id}</span>
                    <SpecBadge tone={fo.stage === 'Arrived' ? 'emerald' : 'master'}>{fo.stage}</SpecBadge>
                    {owed > 0 ? (
                      <SpecBadge tone="rose">Still Owe ${owed.toLocaleString()}</SpecBadge>
                    ) : (
                      <SpecBadge tone="emerald">Fully Paid</SpecBadge>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-[#0A0B0E]">
                    {fo.itemName} — <span className="text-[#515154]">{fo.factoryName}</span>
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-[#6E6E73]">
                    {fo.pieces.toLocaleString()} pcs · Total ${fo.totalCostUsd.toLocaleString()} · Paid ${fo.paidUsd.toLocaleString()} · Due {fo.dueDate}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {owed > 0 && (
                    <PrismaticButton
                      size="sm"
                      prismatic
                      onClick={() => {
                        setPayingFo(fo);
                        setFoPayAmount(String(owed));
                      }}
                    >
                      <DollarSign className="h-3.5 w-3.5" /> Pay Factory
                    </PrismaticButton>
                  )}
                  {fo.stage !== 'Arrived' && (
                    <PrismaticButton
                      size="sm"
                      variant="glass"
                      onClick={() => {
                        adminApi.advanceFactoryOrder(fo.id).then((list) => setFactoryOrders(list as FactoryOrderRecord[]));
                        notify(`Moved ${fo.id} to next sewing stage!`);
                      }}
                    >
                      Move Stage →
                    </PrismaticButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: LIVE BANK & CASH ACCOUNTS */}
      {tab === 'accounts' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {accounts.map((acc) => (
            <div key={acc.id} className="ambient-card rounded-[28px] p-6">
              <div className="flex items-center justify-between">
                <span className="rounded-lg bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">{acc.id}</span>
                <Landmark className="h-4 w-4 text-[#6E6E73]" />
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#0A0B0E]">{acc.name}</h3>
              <p className="text-xs text-[#6E6E73]">{acc.bankOrLocation}</p>
              <p className="mt-4 font-mono text-2xl font-semibold text-[#0A0B0E]">
                ${acc.balanceUsd.toLocaleString()}
              </p>
              <p className="font-mono text-xs text-emerald-700">
                ≈ ৳{Math.round(acc.balanceUsd * fxRate).toLocaleString()} BDT
              </p>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: MONEY IN & OUT LEDGER */}
      {tab === 'money' && (
        <div className="overflow-x-auto rounded-[28px] border border-black/[0.07] bg-white">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-black/[0.06] bg-[#FAFAFC] text-[11px] uppercase tracking-wider text-[#6E6E73]">
              <tr>
                <th className="px-5 py-3.5">ID</th>
                <th className="px-5 py-3.5">Date &amp; Entry</th>
                <th className="px-5 py-3.5">Account</th>
                <th className="px-5 py-3.5">USD / Taka (৳)</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {orders.flatMap((o) =>
                o.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#FAFAFC]">
                    <td className="px-5 py-3.5 font-mono font-semibold text-indigo-600">{p.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#0A0B0E]">Buyer Paid — {o.buyerCompany} ({o.id})</p>
                      <p className="font-mono text-[10px] text-[#6E6E73]">{p.date} · {p.note}</p>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[#515154]">{p.accountId}</td>
                    <td className="px-5 py-3.5 font-mono font-semibold text-emerald-700">
                      +${p.amountUsd.toLocaleString()}
                      <span className="block text-[10px] font-normal text-[#86868B]">৳{Math.round(p.amountUsd * fxRate).toLocaleString()}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right"><SpecBadge tone="emerald">Received</SpecBadge></td>
                  </tr>
                ))
              )}
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-[#FAFAFC]">
                  <td className="px-5 py-3.5 font-mono font-semibold text-indigo-600">{e.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-[#0A0B0E]">{e.title}</p>
                    <p className="font-mono text-[10px] text-[#6E6E73]">{e.date} · {e.category}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[#515154]">{e.accountId}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold text-rose-600">
                    -${e.amountUsd.toLocaleString()}
                    <span className="block text-[10px] font-normal text-[#86868B]">৳{Math.round(e.amountUsd * fxRate).toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {e.status === 'Due Soon' ? (
                      <PrismaticButton
                        size="sm"
                        onClick={() =>
                          adminApi.markExpensePaid(e.id).then((r) => {
                            setExpenses(r.expenses);
                            setAccounts(r.accounts);
                            notify(`Marked ${e.id} Paid & deducted from ${e.accountId}`);
                          })
                        }
                      >
                        Mark Paid
                      </PrismaticButton>
                    ) : (
                      <SpecBadge tone="emerald">Paid</SpecBadge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SLIDE-OVER ORDER DRAWER (Partial Payments + Status + Tracking + Quality Photos + Print PDF) */}
      <AnimatePresence>
        {activeOrder && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveOrder(null)}
              className="fixed inset-0 bg-white/55 backdrop-blur-md"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: APPLE_EASE }}
              className="relative z-10 flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-black/[0.08] bg-white/95 p-6 backdrop-blur-2xl shadow-2xl space-y-5"
            >
              <div className="flex items-start justify-between border-b border-black/[0.06] pb-4">
                <div>
                  <span className="rounded-lg bg-indigo-50 px-2 py-0.5 font-mono text-xs font-semibold text-indigo-700">{activeOrder.id}</span>
                  <h2 className="mt-1 text-xl font-semibold text-[#0A0B0E]">{activeOrder.buyerCompany}</h2>
                  <p className="text-xs text-[#6E6E73]">{activeOrder.itemsSummary}</p>
                </div>
                <button type="button" onClick={() => setActiveOrder(null)} className="cursor-pointer rounded-full bg-[#F5F5F7] p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* 1. Order Status Steps */}
              <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                <p className="text-xs font-semibold text-[#0A0B0E]">Order Step</p>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {STEP_FLOW.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => patchActive({ status: st }, `${activeOrder.id} moved to ${st}`)}
                      className={`cursor-pointer rounded-xl py-2 text-[10px] font-semibold ${
                        activeOrder.status === st ? 'bg-[#0A0B0E] text-white' : 'bg-white text-[#515154] border border-black/[0.06]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. PARTIAL PAYMENTS & BANK ACCOUNT RECORDING */}
              <div className="rounded-2xl border border-black/[0.07] p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  <div className="rounded-xl bg-[#FAFAFC] p-2.5"><p className="font-sans text-[10px] text-[#6E6E73]">Order Total</p><p className="font-semibold">${activeOrder.totalUsd.toLocaleString()}</p></div>
                  <div className="rounded-xl bg-emerald-50/80 p-2.5"><p className="font-sans text-[10px] text-emerald-700">Paid So Far</p><p className="font-semibold text-emerald-800">${activeOrder.paidUsd.toLocaleString()}</p></div>
                  <div className="rounded-xl bg-amber-50/80 p-2.5"><p className="font-sans text-[10px] text-amber-800">Still Due</p><p className="font-semibold text-amber-900">${Math.max(0, activeOrder.totalUsd - activeOrder.paidUsd).toLocaleString()}</p></div>
                </div>

                {activeOrder.bankSlipFile && (
                  <p className="font-mono text-[11px] text-indigo-600">Uploaded Slip: {activeOrder.bankSlipFile}</p>
                )}

                {activeOrder.totalUsd > activeOrder.paidUsd && (
                  <form onSubmit={handleRecordBuyerPayment} className="grid grid-cols-1 gap-2 rounded-2xl bg-[#FAFAFC] p-3 sm:grid-cols-12">
                    <input
                      required
                      type="number"
                      min={1}
                      max={activeOrder.totalUsd - activeOrder.paidUsd}
                      placeholder="Amount ($)"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="luminous-input rounded-xl px-3 py-1.5 font-mono text-xs sm:col-span-4"
                    />
                    <select
                      value={payAccount}
                      onChange={(e) => setPayAccount(e.target.value)}
                      className="luminous-input rounded-xl px-2.5 py-1.5 text-xs sm:col-span-4"
                    >
                      {accounts.map((a) => <option key={a.id} value={a.id}>{a.id} · {a.name}</option>)}
                    </select>
                    <PrismaticButton type="submit" size="sm" prismatic className="sm:col-span-4">
                      <CheckCircle2 className="h-3 w-3" /> Add Payment
                    </PrismaticButton>
                    <input
                      placeholder="Short note (e.g., 70% Balance Wire)"
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      className="luminous-input rounded-xl px-3 py-1.5 text-xs sm:col-span-12"
                    />
                  </form>
                )}

                {activeOrder.payments.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] font-semibold uppercase text-[#6E6E73]">Payment History</p>
                    {activeOrder.payments.map((p) => (
                      <div key={p.id} className="flex justify-between rounded-xl bg-[#FAFAFC] px-3 py-2 font-mono text-[11px]">
                        <span>{p.id} · {p.date} ({p.accountId})</span>
                        <span className="font-semibold text-emerald-700">+${p.amountUsd.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Shipping & Tracking */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-[#6E6E73]">Ship or Airline</label>
                  <input value={activeOrder.carrierName} onChange={(e) => setActiveOrder({ ...activeOrder, carrierName: e.target.value })} className="luminous-input mt-1 w-full rounded-xl px-3 py-2" />
                </div>
                <div>
                  <label className="text-[11px] text-[#6E6E73]">Tracking Number</label>
                  <input value={activeOrder.trackingNumber} onChange={(e) => setActiveOrder({ ...activeOrder, trackingNumber: e.target.value })} className="luminous-input mt-1 w-full rounded-xl px-3 py-2 font-mono" />
                </div>
                <div className="col-span-2">
                  <PrismaticButton size="sm" variant="glass" onClick={() => patchActive({ carrierName: activeOrder.carrierName, trackingNumber: activeOrder.trackingNumber }, 'Saved shipping tracking info')}>
                    Save Tracking Details
                  </PrismaticButton>
                </div>
              </div>

              {/* 4. Quality Check Photos */}
              <div className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0B0E]">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" /> Quality Check Photos
                  </span>
                  <button
                    type="button"
                    onClick={() => patchActive({ qualityPassed: !activeOrder.qualityPassed }, 'Updated Quality Check')}
                    className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-semibold ${activeOrder.qualityPassed ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                  >
                    {activeOrder.qualityPassed ? 'Quality Passed ✓' : 'Mark Quality Passed'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeOrder.qualityPhotos.map((p, i) => (
                    <img key={i} src={p.url} alt={p.caption} className="h-14 w-16 rounded-xl object-cover" />
                  ))}
                  <label className="flex h-14 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-black/20 bg-white text-[10px]">
                    <Upload className="h-3.5 w-3.5" /> Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        patchActive(
                          { qualityPhotos: [...activeOrder.qualityPhotos, { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80', caption: f.name }] },
                          'Uploaded warehouse quality photo!'
                        );
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* 5. Official Bill PDF & WhatsApp */}
              <div className="mt-auto flex flex-wrap gap-2 border-t border-black/[0.06] pt-4">
                <PrismaticButton size="sm" onClick={() => printOfficialBill(activeOrder)}>
                  <Printer className="h-3.5 w-3.5" /> Download Bill PDF
                </PrismaticButton>
                <a
                  href={`https://wa.me/${activeOrder.buyerWhatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600"
                >
                  <MessageCircle className="h-3.5 w-3.5" /> Message Buyer
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PAY FACTORY PARTIAL / FULL MODAL */}
      <GlassModal open={!!payingFo} onClose={() => setPayingFo(null)} maxWidth="max-w-md">
        {payingFo && (
          <form onSubmit={handleRecordFactoryPayment} className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#0A0B0E]">Pay Factory — {payingFo.id}</h3>
              <button type="button" onClick={() => setPayingFo(null)} className="cursor-pointer rounded-full bg-[#F5F5F7] p-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-[#515154]">
              <strong>{payingFo.factoryName}</strong> · Still owed:{' '}
              <span className="font-mono font-semibold text-rose-600">
                ${(payingFo.totalCostUsd - payingFo.paidUsd).toLocaleString()}
              </span>
            </p>
            <input
              required
              type="number"
              min={1}
              max={payingFo.totalCostUsd - payingFo.paidUsd}
              placeholder="Amount to Pay ($)"
              value={foPayAmount}
              onChange={(e) => setFoPayAmount(e.target.value)}
              className="luminous-input w-full rounded-2xl px-4 py-2.5 font-mono text-sm"
            />
            <select value={foPayAccount} onChange={(e) => setFoPayAccount(e.target.value)} className="luminous-input w-full rounded-2xl px-4 py-2.5 text-xs">
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.id} — {a.name} (Bal: ${a.balanceUsd.toLocaleString()})
                </option>
              ))}
            </select>
            <input
              placeholder="Payment note (e.g., Final sewing balance)"
              value={foPayNote}
              onChange={(e) => setFoPayNote(e.target.value)}
              className="luminous-input w-full rounded-2xl px-4 py-2.5 text-xs"
            />
            <PrismaticButton type="submit" prismatic className="w-full">
              Confirm Payout &amp; Update Bank Balance
            </PrismaticButton>
          </form>
        )}
      </GlassModal>
    </div>
  );
}
