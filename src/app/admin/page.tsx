'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  AlertTriangle,
  Activity,
  ArrowRight,
  Landmark,
  Wallet,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { useAdminStaff } from '@/components/admin/AdminShell';
import { useApp } from '@/store/AppContext';
import type { BankAccountRecord } from '@/types/admin';
import { exportTableToExcel, exportTableToPdf } from '@/utils/exportReport';
import { AmbientAura, BentoTile, PrismaticButton, SpecBadge } from '@/design-system/primitives';

interface OverviewData {
  totalSalesUsd: number;
  totalExpensesUsd: number;
  netProfitUsd: number;
  buyersOweUsUsd: number;
  weOweFactoriesUsd: number;
  totalStockPcs: number;
  activeOrdersCount: number;
  newInboxCount: number;
  pendingBankSlips: number;
  usdToBdtRate: number;
  accounts: BankAccountRecord[];
  monthlyChart: { month: string; sales: number; expenses: number }[];
  statusCounts: { status: string; count: number }[];
  categoryStock: { name: string; pieces: number }[];
  lowStockItems: { id: string; name: string; brand: string; stock: number }[];
  activity: { id: string; time: string; actor: string; text: string }[];
}

const DONUT_COLORS = ['#6366f1', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899'];

export default function UnifiedAdminOverviewPage() {
  const { staff } = useAdminStaff();
  const { notify } = useApp();
  const [data, setData] = useState<OverviewData | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [fromDate, setFromDate] = useState('2026-10-01');
  const [toDate, setToDate] = useState('2026-11-30');

  useEffect(() => {
    adminApi.getOverview().then((res) => setData(res as OverviewData));
  }, []);

  if (!data) return <div className="p-8 text-xs text-[#6E6E73]">Loading dashboard charts...</div>;

  const isOwner = staff?.role === 'Owner';
  const maxChartVal = Math.max(...data.monthlyChart.map((m) => m.sales), 1);
  const totalOrdersForDonut = Math.max(1, data.statusCounts.reduce((s, c) => s + c.count, 0));
  const maxCatPcs = Math.max(...data.categoryStock.map((c) => c.pieces), 1);

  const handleExportPL = async (format: 'pdf' | 'excel') => {
    const report = await adminApi.getProfitLossReport(fromDate, toDate);
    const cols = [
      { key: 'id', label: 'ID' },
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: 'description', label: 'Description' },
      { key: 'usd', label: 'Amount (USD)' },
      { key: 'bdt', label: 'Amount (BDT ৳)' },
    ];
    const formattedRows = report.rows.map((r) => ({
      id: r.id,
      date: r.date,
      type: r.type,
      description: r.description,
      usd: `${r.amountUsd >= 0 ? '+' : '-'}$${Math.abs(r.amountUsd).toLocaleString()}`,
      bdt: `${r.amountBdt >= 0 ? '+' : '-'}৳${Math.abs(r.amountBdt).toLocaleString()}`,
    }));
    const summaryCards = [
      { label: 'Total Sales', value: `$${report.salesUsd.toLocaleString()}` },
      { label: 'Cash Collected', value: `$${report.cashCollectedUsd.toLocaleString()}` },
      { label: 'Total Expenses', value: `$${report.totalExpensesUsd.toLocaleString()}` },
      { label: 'Net Profit (USD)', value: `$${report.netProfitUsd.toLocaleString()}` },
      { label: 'Net Profit (BDT)', value: `৳${Math.round(report.netProfitUsd * report.usdToBdtRate).toLocaleString()}` },
    ];
    const subtitle = `Period: ${report.fromDate} to ${report.toDate} · Rate: 1 USD = ৳${report.usdToBdtRate}`;

    if (format === 'pdf') {
      exportTableToPdf({ title: 'Profit & Loss Statement', subtitle, columns: cols, rows: formattedRows, summaryCards });
    } else {
      exportTableToExcel({ filename: 'ayaan-profit-loss', title: 'Profit & Loss Statement', subtitle, columns: cols, rows: formattedRows, summaryCards });
      notify('Downloaded Profit & Loss Excel report!');
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl space-y-7 pb-12">
      <AmbientAura variant="subtle" />

      {/* Welcome Header */}
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <SpecBadge tone="emerald">Live Business ERP Overview</SpecBadge>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#0A0B0E] sm:text-4xl">
            Hello, {staff?.name.split(' ')[0]}
          </h1>
          <p className="mt-1 text-xs text-[#6E6E73]">
            Sales, due balances, live bank accounts, stock, and accountant reports in one clean view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/inbox" className="rounded-full border border-black/[0.08] bg-white px-4 py-2 text-xs font-medium text-[#0A0B0E] hover:bg-[#F5F5F7]">
            {data.newInboxCount} New Inbox →
          </Link>
          <Link href="/admin/orders" className="rounded-full bg-[#0A0B0E] px-4 py-2 text-xs font-medium text-white hover:bg-[#1E2028]">
            {data.pendingBankSlips} Bank Slip(s) to Check →
          </Link>
        </div>
      </div>

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <BentoTile tint="indigo" className="!p-5">
          <ShoppingBag className="h-5 w-5 text-indigo-600" />
          <p className="mt-3 text-xs text-[#6E6E73]">Total Sales</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-[#0A0B0E]">${data.totalSalesUsd.toLocaleString()}</p>
          <p className="font-mono text-[11px] text-[#6E6E73]">{data.activeOrdersCount} active orders</p>
        </BentoTile>

        <BentoTile tint="amber" className="!p-5">
          <TrendingUp className="h-5 w-5 text-amber-600" />
          <p className="mt-3 text-xs text-[#6E6E73]">Buyers Still Owe Us</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-amber-700">
            ${data.buyersOweUsUsd.toLocaleString()}
          </p>
          <p className="font-mono text-[11px] text-[#6E6E73]">Unpaid &amp; partial orders</p>
        </BentoTile>

        <BentoTile tint="rose" className="!p-5">
          <TrendingDown className="h-5 w-5 text-rose-500" />
          <p className="mt-3 text-xs text-[#6E6E73]">We Still Owe Factories</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-rose-600">
            {isOwner ? `$${data.weOweFactoriesUsd.toLocaleString()}` : 'Owner Only'}
          </p>
          <p className="font-mono text-[11px] text-[#6E6E73]">Open partner factory dues</p>
        </BentoTile>

        <BentoTile tint="emerald" className="!p-5">
          <Package className="h-5 w-5 text-emerald-600" />
          <p className="mt-3 text-xs text-[#6E6E73]">Real Net Profit</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-emerald-700">
            {isOwner ? `$${data.netProfitUsd.toLocaleString()}` : 'Owner Only'}
          </p>
          <p className="font-mono text-[11px] text-[#6E6E73]">
            {isOwner ? `≈ ৳${Math.round(data.netProfitUsd * data.usdToBdtRate).toLocaleString()}` : `${data.totalStockPcs.toLocaleString()} pcs in stock`}
          </p>
        </BentoTile>
      </div>

      {/* OWNER-ONLY LIVE BANK & CASH BALANCES + DATE-RANGE PROFIT & LOSS REPORT */}
      {isOwner && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* Live Bank & Cash Accounts */}
          <div className="ambient-card rounded-[28px] p-5 lg:col-span-7">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0A0B0E]">
                <Landmark className="h-4 w-4 text-indigo-600" /> Live Bank &amp; Cash Balances
              </h2>
              <Link href="/admin/records?entity=accounts" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                Manage Accounts →
              </Link>
            </div>
            <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {data.accounts.map((acc) => (
                <div key={acc.id} className="rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-semibold text-indigo-600">{acc.id}</span>
                    <Wallet className="h-3.5 w-3.5 text-[#6E6E73]" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-[#0A0B0E]">{acc.name}</p>
                  <p className="mt-1.5 font-mono text-base font-semibold text-[#0A0B0E]">
                    ${acc.balanceUsd.toLocaleString()}
                  </p>
                  <p className="font-mono text-[10px] text-[#6E6E73]">
                    ≈ ৳{Math.round(acc.balanceUsd * data.usdToBdtRate).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Date-Range Profit & Loss Exporter */}
          <div className="glass-surface rounded-[28px] p-5 lg:col-span-5 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#0A0B0E]">Profit &amp; Loss Report (For Accountant)</h2>
              <p className="mt-0.5 text-[11px] text-[#6E6E73]">
                Pick any date range to download a clean PDF or Excel sheet.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] text-[#6E6E73]">From Date</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="luminous-input mt-0.5 w-full rounded-xl px-2.5 py-1.5 font-mono text-xs" />
                </div>
                <div>
                  <label className="text-[10px] text-[#6E6E73]">To Date</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="luminous-input mt-0.5 w-full rounded-xl px-2.5 py-1.5 font-mono text-xs" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <PrismaticButton size="sm" prismatic onClick={() => handleExportPL('pdf')}>
                <FileText className="h-3.5 w-3.5" /> P&amp;L PDF
              </PrismaticButton>
              <PrismaticButton size="sm" variant="glass" onClick={() => handleExportPL('excel')}>
                <FileSpreadsheet className="h-3.5 w-3.5" /> P&amp;L Excel
              </PrismaticButton>
            </div>
          </div>
        </div>
      )}

      {/* CHARTS ROW: Monthly Sales vs Expenses + Orders Status Donut */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="ambient-card rounded-[28px] p-6 lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-[#0A0B0E]">Monthly Sales vs. Expenses (6 Months)</h2>
              <p className="text-xs text-[#6E6E73]">Hover any month to inspect exact Dollar totals.</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Sales</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-300" /> Expenses</span>
            </div>
          </div>

          <div className="mt-6 grid h-52 grid-cols-6 items-end gap-3 sm:gap-5">
            {data.monthlyChart.map((m, idx) => {
              const salesH = Math.max(12, Math.round((m.sales / maxChartVal) * 100));
              const expH = Math.max(8, Math.round((m.expenses / maxChartVal) * 100));
              return (
                <div
                  key={m.month}
                  onMouseEnter={() => setHoveredMonth(idx)}
                  onMouseLeave={() => setHoveredMonth(null)}
                  className="relative flex h-full flex-col items-center justify-end"
                >
                  {hoveredMonth === idx && (
                    <div className="glass-surface absolute -top-11 z-10 whitespace-nowrap rounded-xl px-2.5 py-1.5 font-mono text-[10px] text-[#0A0B0E]">
                      Sales ${(m.sales / 1000).toFixed(1)}k · Exp ${(m.expenses / 1000).toFixed(1)}k
                    </div>
                  )}
                  <div className="flex h-40 w-full items-end justify-center gap-1.5">
                    <div style={{ height: `${salesH}%` }} className="w-4 sm:w-6 rounded-t-xl bg-gradient-to-t from-indigo-600 to-violet-400" />
                    <div style={{ height: `${expH}%` }} className="w-4 sm:w-6 rounded-t-xl bg-gradient-to-t from-sky-300 to-cyan-200" />
                  </div>
                  <span className="mt-2 font-mono text-[11px] text-[#6E6E73]">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="ambient-card flex flex-col justify-between rounded-[28px] p-6 lg:col-span-4">
          <h2 className="text-base font-semibold text-[#0A0B0E]">Orders by Status</h2>
          <div className="my-4 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-36 w-36 -rotate-90">
              {(() => {
                let offset = 0;
                const r = 44;
                const circ = 2 * Math.PI * r;
                return data.statusCounts.map((s, idx) => {
                  const dash = (s.count / totalOrdersForDonut) * circ;
                  const seg = (
                    <circle
                      key={s.status}
                      cx="60"
                      cy="60"
                      r={r}
                      fill="transparent"
                      stroke={DONUT_COLORS[idx % DONUT_COLORS.length]}
                      strokeWidth="14"
                      strokeDasharray={`${dash} ${circ}`}
                      strokeDashoffset={-offset}
                    />
                  );
                  offset += dash;
                  return seg;
                });
              })()}
            </svg>
          </div>
          <div className="space-y-1.5 text-xs">
            {data.statusCounts.map((s, idx) => (
              <div key={s.status} className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-[#515154]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                  {s.status}
                </span>
                <span className="font-mono font-semibold text-[#0A0B0E]">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Stock + Low Stock + Live Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <div className="ambient-card rounded-[28px] p-6">
            <h2 className="text-sm font-semibold text-[#0A0B0E]">Stock by Category (Pieces)</h2>
            <div className="mt-4 space-y-3">
              {data.categoryStock.map((c) => (
                <div key={c.name}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#1D1D1F]">{c.name}</span>
                    <span className="font-mono text-[#515154]">{c.pieces.toLocaleString()} pcs</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#F5F5F7]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500"
                      style={{ width: `${Math.max(4, Math.round((c.pieces / maxCatPcs) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {data.lowStockItems.length > 0 && (
            <div className="rounded-[26px] border border-rose-200/70 bg-rose-50/50 p-5">
              <p className="flex items-center gap-2 text-xs font-semibold text-rose-800">
                <AlertTriangle className="h-4 w-4" /> Low Stock Warning
              </p>
              <div className="mt-3 space-y-2">
                {data.lowStockItems.map((it) => (
                  <div key={it.id} className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2 text-xs">
                    <span>
                      <strong className="font-mono text-indigo-600">{it.id}</strong> · {it.brand} — {it.name}
                    </span>
                    <Link
                      href={`/admin/manage?entity=items&mode=update&id=${it.id}`}
                      className="inline-flex items-center gap-1 font-mono font-semibold text-rose-600 hover:underline"
                    >
                      Only {it.stock} left <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-black/[0.07] bg-[#FAFAFC] p-6 lg:col-span-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0A0B0E]">
            <Activity className="h-4 w-4 text-indigo-600" /> Recent Activity
          </h2>
          <div className="mt-4 space-y-3">
            {data.activity.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-2xl border border-black/[0.05] bg-white p-3.5 text-xs">
                <div className="flex justify-between text-[10px] font-semibold text-[#6E6E73]">
                  <span className="text-indigo-600">{a.actor}</span>
                  <span className="font-mono">{a.time}</span>
                </div>
                <p className="mt-1 text-[#1D1D1F]">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
