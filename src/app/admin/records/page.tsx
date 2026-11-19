'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Plus, Edit3, Trash2, FileText, FileSpreadsheet } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { ENTITY_LABELS } from '@/mock-backend/admin-data';
import type { EntityKey } from '@/types/admin';
import { useApp } from '@/store/AppContext';
import { useAdminStaff } from '@/components/admin/AdminShell';
import { exportTableToExcel, exportTableToPdf } from '@/utils/exportReport';
import { PrismaticButton, SpecBadge } from '@/design-system/primitives';

const ENTITY_KEYS = Object.keys(ENTITY_LABELS) as EntityKey[];

// EVERY SINGLE TABLE STARTS WITH READABLE `ID` FIRST
const TABLE_COLUMNS: Record<EntityKey, { key: string; label: string; mono?: boolean }[]> = {
  items: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'code', label: 'Code', mono: true },
    { key: 'name', label: 'Clothing Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'stock', label: 'Stock', mono: true },
    { key: 'priceUsd', label: 'Price ($)', mono: true },
    { key: 'fullStockPriceUsd', label: 'Full Lot ($)', mono: true },
  ],
  categories: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'Category Name' },
    { key: 'audience', label: 'Audience' },
    { key: 'active', label: 'Active' },
  ],
  brands: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'Brand' },
    { key: 'country', label: 'Country' },
    { key: 'isOwnBrand', label: 'House Brand' },
  ],
  warehouses: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'Warehouse' },
    { key: 'location', label: 'Location' },
    { key: 'shelfCode', label: 'Zone' },
    { key: 'manager', label: 'Supervisor' },
    { key: 'boxesStored', label: 'Boxes', mono: true },
  ],
  factories: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'Factory Name' },
    { key: 'area', label: 'Area' },
    { key: 'specialty', label: 'Specialty' },
    { key: 'monthlyCapacity', label: 'Capacity/Mo', mono: true },
    { key: 'phone', label: 'Phone', mono: true },
  ],
  factory_orders: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'factoryName', label: 'Factory' },
    { key: 'itemName', label: 'Clothes' },
    { key: 'pieces', label: 'Pieces', mono: true },
    { key: 'totalCostUsd', label: 'Total ($)', mono: true },
    { key: 'paidUsd', label: 'Paid ($)', mono: true },
    { key: 'stage', label: 'Stage' },
  ],
  stock_movements: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'date', label: 'Date', mono: true },
    { key: 'itemId', label: 'Item ID', mono: true },
    { key: 'itemName', label: 'Item' },
    { key: 'direction', label: 'In / Out' },
    { key: 'quantity', label: 'Qty', mono: true },
    { key: 'reason', label: 'Reason' },
  ],
  buyers: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'company', label: 'Company' },
    { key: 'contactName', label: 'Buyer Name' },
    { key: 'country', label: 'Country' },
    { key: 'whatsapp', label: 'WhatsApp', mono: true },
    { key: 'isVip', label: 'VIP' },
  ],
  accounts: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'Account Name' },
    { key: 'accountType', label: 'Type' },
    { key: 'bankOrLocation', label: 'Bank / Safe' },
    { key: 'balanceUsd', label: 'Balance ($)', mono: true },
  ],
  expenses: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'isoDate', label: 'Date', mono: true },
    { key: 'title', label: 'Expense' },
    { key: 'category', label: 'Type' },
    { key: 'accountId', label: 'Account', mono: true },
    { key: 'amountUsd', label: 'Amount ($)', mono: true },
    { key: 'status', label: 'Status' },
  ],
  staff: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'name', label: 'Staff Name' },
    { key: 'role', label: 'Role' },
    { key: 'attendance', label: 'Today' },
    { key: 'monthlySalaryBdt', label: 'Salary (৳)', mono: true },
    { key: 'paidThisMonth', label: 'Paid?' },
  ],
  licenses_faqs: [
    { key: 'id', label: 'ID', mono: true },
    { key: 'entryType', label: 'Type' },
    { key: 'titleOrQuestion', label: 'Title / Question' },
    { key: 'regOrValidUntil', label: 'Reg / Note', mono: true },
  ],
};

function RecordsInner() {
  const searchParams = useSearchParams();
  const { notify } = useApp();
  const { staff } = useAdminStaff();

  const [entity, setEntity] = useState<EntityKey>((searchParams.get('entity') as EntityKey) || 'items');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const param = searchParams.get('entity') as EntityKey | null;
    if (param && ENTITY_KEYS.includes(param)) setEntity(param);
  }, [searchParams]);

  useEffect(() => {
    setSelectedIds([]);
    adminApi.listRecords(entity).then((res) => setRows(res as unknown as Record<string, unknown>[]));
  }, [entity]);

  const columns = TABLE_COLUMNS[entity];
  const filtered = rows.filter((r) => !search.trim() || JSON.stringify(r).toLowerCase().includes(search.toLowerCase()));

  // Rows targeted for Export = checked rows if any are checked, otherwise ALL currently visible filtered rows!
  const exportTargetRows =
    selectedIds.length > 0 ? filtered.filter((r) => selectedIds.includes(String(r.id))) : filtered;

  const allShowingSelected =
    filtered.length > 0 && filtered.every((r) => selectedIds.includes(String(r.id)));

  const toggleAllShowing = () => {
    if (allShowingSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((r) => String(r.id)));
    }
  };

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const plainStringForExport = (colKey: string, val: unknown): string => {
    if ((colKey === 'monthlySalaryBdt' || colKey === 'balanceUsd') && staff?.role !== 'Owner') return 'Restricted';
    if (typeof val === 'boolean') return colKey === 'isVip' ? (val ? 'VIP' : 'Standard') : val ? 'Yes' : 'No';
    if (colKey === 'monthlySalaryBdt') return `৳${Number(val).toLocaleString()}`;
    if (colKey.endsWith('Usd')) return `$${Number(val).toLocaleString()}`;
    return String(val ?? '—');
  };

  const buildExportPayload = () => {
    const formattedRows = exportTargetRows.map((r) => {
      const out: Record<string, string | number> = {};
      columns.forEach((c) => {
        out[c.key] = plainStringForExport(c.key, r[c.key]);
      });
      return out;
    });

    const scopeLabel =
      selectedIds.length > 0
        ? `${exportTargetRows.length} selected row(s)`
        : search.trim()
          ? `${exportTargetRows.length} filtered row(s) matching "${search}"`
          : `All ${exportTargetRows.length} showing row(s)`;

    return {
      filename: `ayaan-${entity}`,
      title: `${ENTITY_LABELS[entity]} Report`,
      subtitle: `Exported Scope: ${scopeLabel}`,
      columns: columns.map((c) => ({ key: c.key, label: c.label })),
      rows: formattedRows,
    };
  };

  const handleDownloadPdf = () => {
    if (exportTargetRows.length === 0) return notify('No rows showing to export');
    exportTableToPdf(buildExportPayload());
  };

  const handleDownloadExcel = () => {
    if (exportTargetRows.length === 0) return notify('No rows showing to export');
    exportTableToExcel(buildExportPayload());
    notify(`Downloaded Excel (${exportTargetRows.length} rows of ${ENTITY_LABELS[entity]})!`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Delete ${id}?`)) return;
    const updated = await adminApi.deleteRecord(entity, id);
    setRows(updated as unknown as Record<string, unknown>[]);
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    notify(`Deleted ${id}`);
  };

  const renderCell = (colKey: string, val: unknown) => {
    if ((colKey === 'monthlySalaryBdt' || colKey === 'balanceUsd') && staff?.role !== 'Owner') {
      return <span className="text-[#86868B]">Owner Only</span>;
    }
    if (colKey === 'id') {
      return <span className="rounded-lg bg-indigo-50/80 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700">{String(val)}</span>;
    }
    if (typeof val === 'boolean') {
      return (
        <SpecBadge tone={val ? 'emerald' : 'neutral'}>
          {colKey === 'isVip' ? (val ? 'VIP' : 'Standard') : val ? 'Yes' : 'No'}
        </SpecBadge>
      );
    }
    if (colKey === 'monthlySalaryBdt') return `৳${Number(val).toLocaleString()}`;
    if (colKey.endsWith('Usd')) return `$${Number(val).toLocaleString()}`;
    if (typeof val === 'number') return val.toLocaleString();
    return String(val ?? '—');
  };

  const exportBadgeCount =
    selectedIds.length > 0 ? `${exportTargetRows.length} Selected` : `All ${exportTargetRows.length} Showing`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">All Business Data</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Records Table
          </h1>
        </div>

        {/* Dynamic PDF & Excel Export Buttons Based on Currently Showing / Checked Data */}
        <div className="flex flex-wrap gap-2">
          <PrismaticButton size="sm" variant="glass" onClick={handleDownloadPdf}>
            <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF ({exportBadgeCount})
          </PrismaticButton>
          <PrismaticButton size="sm" variant="glass" onClick={handleDownloadExcel}>
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel ({exportBadgeCount})
          </PrismaticButton>
          <Link href={`/admin/manage?entity=${entity}&mode=create`}>
            <PrismaticButton size="sm" prismatic>
              <Plus className="h-3.5 w-3.5" /> Add New
            </PrismaticButton>
          </Link>
        </div>
      </div>

      {/* Dropdown Picker + Search Bar */}
      <div className="glass-surface flex flex-col gap-3 rounded-[26px] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-[#6E6E73]">Showing:</span>
          <select
            value={entity}
            onChange={(e) => setEntity(e.target.value as EntityKey)}
            className="luminous-input rounded-full px-4 py-2 text-xs font-semibold text-[#0A0B0E]"
          >
            {ENTITY_KEYS.map((k) => (
              <option key={k} value={k}>{ENTITY_LABELS[k]}</option>
            ))}
          </select>
          <span className="font-mono text-xs text-[#6E6E73]">({filtered.length} rows)</span>
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="cursor-pointer rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700"
            >
              {selectedIds.length} checked · Clear
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#86868B]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Filter by ID, name, or keyword...`}
            className="luminous-input w-full rounded-full py-2 pl-9 pr-4 text-xs"
          />
        </div>
      </div>

      {/* Data Table with Checkboxes & ID First Column */}
      <div className="overflow-x-auto rounded-[28px] border border-black/[0.07] bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-black/[0.06] bg-[#FAFAFC] text-[11px] uppercase tracking-wider text-[#6E6E73]">
            <tr>
              <th className="w-10 px-4 py-3.5">
                <input
                  type="checkbox"
                  checked={allShowingSelected}
                  onChange={toggleAllShowing}
                  aria-label="Select all showing rows"
                  className="h-3.5 w-3.5 cursor-pointer accent-[#0A0B0E]"
                />
              </th>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3.5">{c.label}</th>
              ))}
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {filtered.map((row) => {
              const id = String(row.id);
              const checked = selectedIds.includes(id);
              return (
                <tr key={id} className={`transition-colors ${checked ? 'bg-indigo-50/35' : 'hover:bg-[#FAFAFC]'}`}>
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleRow(id)}
                      className="h-3.5 w-3.5 cursor-pointer accent-[#0A0B0E]"
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className={`px-4 py-3.5 ${c.mono ? 'font-mono text-[#1D1D1F]' : 'text-[#0A0B0E]'}`}>
                      {renderCell(c.key, row[c.key])}
                    </td>
                  ))}
                  <td className="px-4 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Link
                        href={`/admin/manage?entity=${entity}&mode=update&id=${id}`}
                        className="inline-flex items-center gap-1 rounded-full bg-[#F5F5F7] px-3 py-1.5 text-[11px] font-medium text-[#0A0B0E] hover:bg-[#0A0B0E] hover:text-white"
                      >
                        <Edit3 className="h-3 w-3" /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(id)}
                        className="inline-flex cursor-pointer items-center justify-center rounded-full p-1.5 text-[#86868B] hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={columns.length + 2} className="p-10 text-center text-xs text-[#6E6E73]">
                  No records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminRecordsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#6E6E73]">Loading records...</div>}>
      <RecordsInner />
    </Suspense>
  );
}
