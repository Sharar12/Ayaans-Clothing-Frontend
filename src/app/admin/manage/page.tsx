'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, Trash2, AlertTriangle, ArrowRight } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { ENTITY_LABELS } from '@/mock-backend/admin-data';
import type { BankAccountRecord, EntityKey, ItemRecord, WarehouseRecord } from '@/types/admin';
import { useApp } from '@/store/AppContext';
import { AmbientAura, PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';

const ENTITY_KEYS = Object.keys(ENTITY_LABELS) as EntityKey[];

function defaultFormFor(entity: EntityKey): Record<string, unknown> {
  const todayIso = new Date().toISOString().slice(0, 10);
  switch (entity) {
    case 'categories':
      return { name: '', audience: 'All', active: true };
    case 'brands':
      return { name: '', country: 'Bangladesh', isOwnBrand: false, active: true };
    case 'items':
      return {
        code: `AYC-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        brand: 'Zara',
        category: 'Hoodies',
        audience: 'Unisex',
        authenticity: 'Original',
        sizes: 'S, M, L, XL',
        colors: 'White, Black, Navy',
        minQty: 50,
        stock: 500,
        priceUsd: 8.5,
        bulkPriceUsd: 7.2,
        fullStockPriceUsd: 6.4,
        boxWeightKg: 14,
        photo: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80',
        isNew: true,
        active: true,
      };
    case 'warehouses':
      return { name: '', location: 'Uttara, Dhaka', shelfCode: 'Zone A', manager: '', phone: '+880 1', boxesStored: 0, active: true };
    case 'factories':
      return { name: '', area: 'Gazipur', specialty: 'Knitwear & Hoodies', monthlyCapacity: 100000, manager: '', phone: '+880 1', active: true };
    case 'factory_orders':
      return { factoryName: 'Apex Knit Composite Ltd.', itemName: '', pieces: 1000, costPerPieceUsd: 3.2, totalCostUsd: 3200, paidUsd: 0, stage: 'Ordered', dueDate: 'Dec 20, 2026' };
    case 'stock_movements':
      return { date: 'Today', itemId: 'ITM-001', itemName: 'Heavyweight Boxy Brushed Hoodie', warehouseName: 'Uttara Main Hub (Sector 11)', direction: 'Stock In', quantity: 200, reason: '' };
    case 'buyers':
      return { company: '', contactName: '', email: '', whatsapp: '+', country: 'United Kingdom', address: '', isVip: false, active: true };
    case 'accounts':
      return { name: '', accountType: 'Local Taka Bank', bankOrLocation: 'Dhaka', balanceUsd: 0, active: true };
    case 'expenses':
      return { isoDate: todayIso, date: 'Today', title: '', category: 'Factory Payout', accountId: 'ACC-002', amountUsd: 1000, status: 'Paid' };
    case 'staff':
      return { name: '', email: '', role: 'Merchandiser', attendance: 'Present', monthlySalaryBdt: 55000, paidThisMonth: false, active: true };
    case 'licenses_faqs':
      return { entryType: 'Buyer FAQ', titleOrQuestion: '', detailOrAnswer: '', regOrValidUntil: 'Active 2026', active: true };
  }
}

function recordDisplayLabel(r: Record<string, unknown>): string {
  const id = String(r.id || '');
  const label = String(r.name || r.company || r.title || r.titleOrQuestion || r.itemName || '');
  return id ? `${id} — ${label}` : label;
}

function CreateUpdateInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { notify } = useApp();

  const [mode, setMode] = useState<'create' | 'update'>(
    searchParams.get('mode') === 'update' ? 'update' : 'create'
  );
  const [entity, setEntity] = useState<EntityKey>((searchParams.get('entity') as EntityKey) || 'items');
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [selectedId, setSelectedId] = useState<string>(searchParams.get('id') || '');
  const [form, setForm] = useState<Record<string, unknown>>(defaultFormFor(entity));

  const [itemsList, setItemsList] = useState<ItemRecord[]>([]);
  const [warehousesList, setWarehousesList] = useState<WarehouseRecord[]>([]);
  const [accountsList, setAccountsList] = useState<BankAccountRecord[]>([]);

  useEffect(() => {
    const pe = searchParams.get('entity') as EntityKey | null;
    const pm = searchParams.get('mode');
    const pid = searchParams.get('id');
    if (pe && ENTITY_KEYS.includes(pe)) setEntity(pe);
    if (pm === 'update' || pm === 'create') setMode(pm);
    if (pid) setSelectedId(pid);
  }, [searchParams]);

  useEffect(() => {
    Promise.all([
      adminApi.listRecords(entity),
      adminApi.listRecords('items'),
      adminApi.listRecords('warehouses'),
      adminApi.listRecords('accounts'),
    ]).then(([rows, its, whs, accs]) => {
      const typedRows = rows as unknown as Record<string, unknown>[];
      setRecords(typedRows);
      setItemsList(its);
      setWarehousesList(whs);
      setAccountsList(accs);

      if (mode === 'update' && typedRows.length > 0) {
        const match = typedRows.find((r) => r.id === selectedId) || typedRows[0];
        setSelectedId(String(match.id));
        setForm({ ...match });
      } else {
        setForm(defaultFormFor(entity));
      }
    });
  }, [entity, mode, selectedId]);

  const setField = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const priceWarn =
    entity === 'items' &&
    (Number(form.bulkPriceUsd) > Number(form.priceUsd) || Number(form.fullStockPriceUsd) > Number(form.bulkPriceUsd));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (priceWarn) {
      notify('Full Stock price should be lower than Bulk price, and Bulk lower than Standard price.');
      return;
    }

    const payload = { ...form };
    if (entity === 'factory_orders') {
      payload.totalCostUsd = Math.round(Number(payload.pieces || 0) * Number(payload.costPerPieceUsd || 0));
    }

    if (mode === 'create') {
      const fresh = await adminApi.createRecord(entity, payload as never);
      const newestId = String((fresh[0] as unknown as Record<string, unknown>)?.id || '');
      notify(`Created ${newestId} in ${ENTITY_LABELS[entity]}!`);
      setForm(defaultFormFor(entity));
      setRecords(fresh as unknown as Record<string, unknown>[]);
    } else if (selectedId) {
      const fresh = await adminApi.updateRecord(entity, selectedId, payload as never);
      notify(`Updated ${selectedId} in ${ENTITY_LABELS[entity]}!`);
      setRecords(fresh as unknown as Record<string, unknown>[]);
    }
  };

  const handleDelete = async () => {
    if (!selectedId || !window.confirm(`Delete ${selectedId}? This cannot be undone.`)) return;
    await adminApi.deleteRecord(entity, selectedId);
    notify(`Deleted ${selectedId}`);
    router.push(`/admin/records?entity=${entity}`);
  };

  return (
    <div className="relative mx-auto max-w-4xl space-y-6 pb-12">
      <AmbientAura variant="subtle" />

      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Universal Form Studio</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Create &amp; Update
          </h1>
        </div>
        <Link href={`/admin/records?entity=${entity}`} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline">
          View {ENTITY_LABELS[entity]} Table <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mode Toggle + Entity Selector + Record Picker (with IDs!) */}
      <div className="glass-surface flex flex-col gap-3 rounded-[26px] p-4 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          layoutId="createUpdateToggle"
          value={mode}
          onChange={(m) => {
            setMode(m);
            if (m === 'create') setForm(defaultFormFor(entity));
          }}
          options={[
            { label: 'Create New', value: 'create' },
            { label: 'Update Existing', value: 'update' },
          ]}
        />

        <div className="flex flex-1 flex-wrap justify-end gap-2">
          <select
            value={entity}
            onChange={(e) => {
              setEntity(e.target.value as EntityKey);
              setSelectedId('');
            }}
            className="luminous-input rounded-full px-4 py-2 text-xs font-semibold text-[#0A0B0E]"
          >
            {ENTITY_KEYS.map((k) => (
              <option key={k} value={k}>{ENTITY_LABELS[k]}</option>
            ))}
          </select>

          {mode === 'update' && records.length > 0 && (
            <select
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                const found = records.find((r) => r.id === e.target.value);
                if (found) setForm({ ...found });
              }}
              className="luminous-input max-w-xs rounded-full px-4 py-2 font-mono text-xs text-[#0A0B0E]"
            >
              {records.map((r) => (
                <option key={String(r.id)} value={String(r.id)}>
                  {recordDisplayLabel(r)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="ambient-card rounded-[30px] p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-3">
          <h2 className="text-base font-semibold text-[#0A0B0E]">
            {mode === 'create' ? `Create New ${ENTITY_LABELS[entity]}` : `Editing Record`}
          </h2>
          <SpecBadge tone={mode === 'create' ? 'neutral' : 'original'} className="font-mono">
            {mode === 'create' ? 'ID: Auto-Generated' : `ID: ${selectedId}`}
          </SpecBadge>
        </div>

        {/* 1. ITEMS */}
        {entity === 'items' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="text-xs text-[#6E6E73]">Clothing Name *</label><input required value={String(form.name || '')} onChange={(e) => setField('name', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Item Code</label><input required value={String(form.code || '')} onChange={(e) => setField('code', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Brand</label><input required value={String(form.brand || '')} onChange={(e) => setField('brand', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Category</label><input required value={String(form.category || '')} onChange={(e) => setField('category', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div>
              <label className="text-xs text-[#6E6E73]">Audience</label>
              <select value={String(form.audience || 'Unisex')} onChange={(e) => setField('audience', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm">
                {['Men', 'Women', 'Boys', 'Girls', 'Unisex'].map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-[#6E6E73]">Stock (Pieces)</label><input type="number" min={0} value={Number(form.stock || 0)} onChange={(e) => setField('stock', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Smallest Order Qty</label><input type="number" min={1} value={Number(form.minQty || 50)} onChange={(e) => setField('minQty', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <div className="grid grid-cols-3 gap-2.5 sm:col-span-2">
              <div><label className="text-[11px] text-[#6E6E73]">Standard ($)</label><input type="number" step="0.05" value={Number(form.priceUsd || 0)} onChange={(e) => setField('priceUsd', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-xl px-3 py-2 font-mono text-xs" /></div>
              <div><label className="text-[11px] text-[#6E6E73]">Bulk ($)</label><input type="number" step="0.05" value={Number(form.bulkPriceUsd || 0)} onChange={(e) => setField('bulkPriceUsd', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-xl px-3 py-2 font-mono text-xs" /></div>
              <div><label className="text-[11px] text-[#6E6E73]">Full Lot ($)</label><input type="number" step="0.05" value={Number(form.fullStockPriceUsd || 0)} onChange={(e) => setField('fullStockPriceUsd', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-xl px-3 py-2 font-mono text-xs" /></div>
            </div>
            {priceWarn && (
              <p className="flex items-center gap-2 rounded-2xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700 sm:col-span-2">
                <AlertTriangle className="h-4 w-4" /> Full Lot price should be cheaper than Bulk &amp; Standard price.
              </p>
            )}
            <div className="flex gap-5 pt-1 text-xs sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={Boolean(form.active)} onChange={(e) => setField('active', e.target.checked)} className="accent-[#0A0B0E]" /> Live on Website</label>
              <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={Boolean(form.isNew)} onChange={(e) => setField('isNew', e.target.checked)} className="accent-[#0A0B0E]" /> Daily New Drop</label>
            </div>
          </div>
        )}

        {/* 2. CATEGORIES */}
        {entity === 'categories' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Category Name *</label><input required value={String(form.name || '')} onChange={(e) => setField('name', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Audience</label><select value={String(form.audience || 'All')} onChange={(e) => setField('audience', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm">{['All', 'Men', 'Women', 'Boys', 'Girls', 'Unisex'].map((a) => <option key={a}>{a}</option>)}</select></div>
          </div>
        )}

        {/* 3. BRANDS */}
        {entity === 'brands' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Brand Name *</label><input required value={String(form.name || '')} onChange={(e) => setField('name', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Country</label><input value={String(form.country || '')} onChange={(e) => setField('country', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <label className="flex cursor-pointer items-center gap-2 text-xs"><input type="checkbox" checked={Boolean(form.isOwnBrand)} onChange={(e) => setField('isOwnBrand', e.target.checked)} className="accent-[#0A0B0E]" /> Ayaan House Brand</label>
          </div>
        )}

        {/* 4. WAREHOUSES */}
        {entity === 'warehouses' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Warehouse Name *</label><input required value={String(form.name || '')} onChange={(e) => setField('name', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Location</label><input required value={String(form.location || '')} onChange={(e) => setField('location', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Zone / Shelf</label><input value={String(form.shelfCode || '')} onChange={(e) => setField('shelfCode', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Supervisor</label><input value={String(form.manager || '')} onChange={(e) => setField('manager', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Phone</label><input value={String(form.phone || '')} onChange={(e) => setField('phone', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Boxes Stored</label><input type="number" value={Number(form.boxesStored || 0)} onChange={(e) => setField('boxesStored', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
          </div>
        )}

        {/* 5. PARTNER FACTORIES */}
        {entity === 'factories' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Factory Name *</label><input required value={String(form.name || '')} onChange={(e) => setField('name', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Area</label><input required value={String(form.area || '')} onChange={(e) => setField('area', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Specialty</label><input value={String(form.specialty || '')} onChange={(e) => setField('specialty', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Monthly Capacity (PCS)</label><input type="number" value={Number(form.monthlyCapacity || 0)} onChange={(e) => setField('monthlyCapacity', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Manager</label><input value={String(form.manager || '')} onChange={(e) => setField('manager', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Phone</label><input value={String(form.phone || '')} onChange={(e) => setField('phone', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
          </div>
        )}

        {/* 6. FACTORY ORDERS */}
        {entity === 'factory_orders' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Factory Name *</label><input required value={String(form.factoryName || '')} onChange={(e) => setField('factoryName', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Clothes Being Made *</label><input required value={String(form.itemName || '')} onChange={(e) => setField('itemName', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Total Pieces</label><input type="number" value={Number(form.pieces || 0)} onChange={(e) => setField('pieces', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Cost ($ / pc)</label><input type="number" step="0.05" value={Number(form.costPerPieceUsd || 0)} onChange={(e) => setField('costPerPieceUsd', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Already Paid to Factory ($)</label><input type="number" min={0} value={Number(form.paidUsd || 0)} onChange={(e) => setField('paidUsd', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Stage</label><select value={String(form.stage || 'Ordered')} onChange={(e) => setField('stage', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm">{['Ordered', 'Sewing', 'Ready', 'Arrived'].map((s) => <option key={s}>{s}</option>)}</select></div>
          </div>
        )}

        {/* 7. STOCK MOVEMENTS */}
        {entity === 'stock_movements' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-[#6E6E73]">Choose Item</label>
              <select
                value={String(form.itemId || '')}
                onChange={(e) => {
                  const found = itemsList.find((i) => i.id === e.target.value);
                  setField('itemId', e.target.value);
                  if (found) setField('itemName', found.name);
                }}
                className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"
              >
                {itemsList.map((i) => <option key={i.id} value={i.id}>{i.id} — {i.name} ({i.stock} pcs)</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#6E6E73]">Warehouse</label>
              <select value={String(form.warehouseName || '')} onChange={(e) => setField('warehouseName', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm">
                {warehousesList.map((w) => <option key={w.id} value={w.name}>{w.id} — {w.name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-[#6E6E73]">Direction</label><select value={String(form.direction || 'Stock In')} onChange={(e) => setField('direction', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"><option value="Stock In">Stock In (+ Add)</option><option value="Stock Out">Stock Out (- Remove)</option><option value="Transfer">Transfer</option></select></div>
            <div><label className="text-xs text-[#6E6E73]">Pieces</label><input type="number" min={1} value={Number(form.quantity || 100)} onChange={(e) => setField('quantity', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <div className="sm:col-span-2"><label className="text-xs text-[#6E6E73]">Reason *</label><input required value={String(form.reason || '')} onChange={(e) => setField('reason', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
          </div>
        )}

        {/* 8. BUYERS */}
        {entity === 'buyers' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Company *</label><input required value={String(form.company || '')} onChange={(e) => setField('company', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Contact Name *</label><input required value={String(form.contactName || '')} onChange={(e) => setField('contactName', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Email</label><input type="email" value={String(form.email || '')} onChange={(e) => setField('email', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">WhatsApp</label><input value={String(form.whatsapp || '')} onChange={(e) => setField('whatsapp', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Country</label><input value={String(form.country || '')} onChange={(e) => setField('country', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Address / Port</label><input value={String(form.address || '')} onChange={(e) => setField('address', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <label className="flex cursor-pointer items-center gap-2 text-xs sm:col-span-2"><input type="checkbox" checked={Boolean(form.isVip)} onChange={(e) => setField('isVip', e.target.checked)} className="accent-[#0A0B0E]" /> Verified VIP Buyer</label>
          </div>
        )}

        {/* 9. BANK & CASH ACCOUNTS (NEW!) */}
        {entity === 'accounts' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Account Name *</label><input required placeholder="e.g., USD Export Bank" value={String(form.name || '')} onChange={(e) => setField('name', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div>
              <label className="text-xs text-[#6E6E73]">Account Type</label>
              <select value={String(form.accountType || 'Local Taka Bank')} onChange={(e) => setField('accountType', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm">
                <option>USD Export Bank</option>
                <option>Local Taka Bank</option>
                <option>Office Cash</option>
              </select>
            </div>
            <div><label className="text-xs text-[#6E6E73]">Bank Branch / Safe Location</label><input value={String(form.bankOrLocation || '')} onChange={(e) => setField('bankOrLocation', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Current Balance (USD Equivalent)</label><input type="number" step="1" value={Number(form.balanceUsd || 0)} onChange={(e) => setField('balanceUsd', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
          </div>
        )}

        {/* 10. EXPENSES */}
        {entity === 'expenses' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="text-xs text-[#6E6E73]">Expense Description *</label><input required value={String(form.title || '')} onChange={(e) => setField('title', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Date</label><input type="date" value={String(form.isoDate || '')} onChange={(e) => { setField('isoDate', e.target.value); setField('date', e.target.value); }} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Category</label><select value={String(form.category || 'Factory Payout')} onChange={(e) => setField('category', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm">{['Factory Payout', 'Shipping & Truck', 'Staff Salary', 'Office & Utility'].map((c) => <option key={c}>{c}</option>)}</select></div>
            <div>
              <label className="text-xs text-[#6E6E73]">Paid From Account</label>
              <select value={String(form.accountId || 'ACC-002')} onChange={(e) => setField('accountId', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm">
                {accountsList.map((a) => <option key={a.id} value={a.id}>{a.id} — {a.name}</option>)}
              </select>
            </div>
            <div><label className="text-xs text-[#6E6E73]">Amount (USD)</label><input type="number" min={1} value={Number(form.amountUsd || 0)} onChange={(e) => setField('amountUsd', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
          </div>
        )}

        {/* 11. STAFF */}
        {entity === 'staff' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Staff Name *</label><input required value={String(form.name || '')} onChange={(e) => setField('name', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div><label className="text-xs text-[#6E6E73]">Email *</label><input required type="email" value={String(form.email || '')} onChange={(e) => setField('email', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-xs" /></div>
            <div><label className="text-xs text-[#6E6E73]">Role</label><select value={String(form.role || 'Merchandiser')} onChange={(e) => setField('role', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"><option value="Owner">Owner</option><option value="Merchandiser">Merchandiser</option><option value="Warehouse">Warehouse</option></select></div>
            <div><label className="text-xs text-[#6E6E73]">Attendance</label><select value={String(form.attendance || 'Present')} onChange={(e) => setField('attendance', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"><option>Present</option><option>Factory Visit</option><option>Leave</option></select></div>
            <div><label className="text-xs text-[#6E6E73]">Monthly Salary (৳ BDT)</label><input type="number" value={Number(form.monthlySalaryBdt || 0)} onChange={(e) => setField('monthlySalaryBdt', Number(e.target.value))} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 font-mono text-sm" /></div>
            <label className="flex cursor-pointer items-center gap-2 self-end pb-2.5 text-xs"><input type="checkbox" checked={Boolean(form.paidThisMonth)} onChange={(e) => setField('paidThisMonth', e.target.checked)} className="accent-[#0A0B0E]" /> Paid This Month</label>
          </div>
        )}

        {/* 12. LICENSES & FAQS */}
        {entity === 'licenses_faqs' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><label className="text-xs text-[#6E6E73]">Entry Type</label><select value={String(form.entryType || 'Buyer FAQ')} onChange={(e) => setField('entryType', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm"><option>Official License</option><option>Buyer FAQ</option></select></div>
            <div><label className="text-xs text-[#6E6E73]">Reg # / Valid Until</label><input value={String(form.regOrValidUntil || '')} onChange={(e) => setField('regOrValidUntil', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div className="sm:col-span-2"><label className="text-xs text-[#6E6E73]">Title / Question *</label><input required value={String(form.titleOrQuestion || '')} onChange={(e) => setField('titleOrQuestion', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-sm" /></div>
            <div className="sm:col-span-2"><label className="text-xs text-[#6E6E73]">Details / Answer *</label><textarea required rows={3} value={String(form.detailOrAnswer || '')} onChange={(e) => setField('detailOrAnswer', e.target.value)} className="luminous-input mt-1 w-full rounded-2xl p-3.5 text-sm" /></div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-5">
          {mode === 'update' && selectedId ? (
            <button type="button" onClick={handleDelete} className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100">
              <Trash2 className="h-3.5 w-3.5" /> Delete {selectedId}
            </button>
          ) : (
            <span />
          )}
          <PrismaticButton type="submit" prismatic size="lg">
            <Save className="h-4 w-4" />
            {mode === 'create' ? `Save New ${ENTITY_LABELS[entity]}` : `Save Changes (${selectedId})`}
          </PrismaticButton>
        </div>
      </form>
    </div>
  );
}

export default function AdminManagePage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-[#6E6E73]">Loading studio...</div>}>
      <CreateUpdateInner />
    </Suspense>
  );
}
