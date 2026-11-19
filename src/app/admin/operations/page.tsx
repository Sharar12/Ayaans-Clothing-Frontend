'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Warehouse,
  Building2,
  MapPin,
  Box,
  AlertTriangle,
  Truck,
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  MessageCircle,
  DollarSign,
  Search,
  FileText,
  FileSpreadsheet,
  Phone,
  Send,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import type {
  BankAccountRecord,
  FactoryOrderRecord,
  FactoryRecord,
  ItemRecord,
  StockMovementRecord,
  WarehouseRecord,
} from '@/types/admin';
import { useApp } from '@/store/AppContext';
import { exportTableToExcel, exportTableToPdf } from '@/utils/exportReport';
import { AmbientAura, BentoTile, GlassModal, PrismaticButton, SegmentedControl, SpecBadge } from '@/design-system/primitives';

interface OperationsState {
  warehouses: WarehouseRecord[];
  factories: FactoryRecord[];
  factoryOrders: FactoryOrderRecord[];
  items: ItemRecord[];
  accounts: BankAccountRecord[];
  stockMovements: StockMovementRecord[];
}

type RoutePreset = 'ALL' | 'WF' | 'WW' | 'FF';

interface NodeOption {
  value: string; // e.g., "W:WH-001" or "F:FAC-001"
  type: 'W' | 'F';
  id: string;
  label: string;
}

export default function AdminOperationsPage() {
  const { notify } = useApp();
  const [tab, setTab] = useState<'transfer' | 'warehouses' | 'factories'>('transfer');
  const [data, setData] = useState<OperationsState | null>(null);

  // Send / Receive (W <-> F, W <-> W, F <-> F) State
  const [routePreset, setRoutePreset] = useState<RoutePreset>('ALL');
  const [fromNode, setFromNode] = useState('F:FAC-001');
  const [toNode, setToNode] = useState('W:WH-001');
  const [itemId, setItemId] = useState('ITM-001');
  const [boxes, setBoxes] = useState('20');
  const [pieces, setPieces] = useState('480');
  const [shelf, setShelf] = useState('Zone A · Shelf 3');
  const [reason, setReason] = useState('');
  const [logFilter, setLogFilter] = useState<'All' | 'WF' | 'WW' | 'FF'>('All');

  // Warehouse & Factory Detail State
  const [selectedWhId, setSelectedWhId] = useState('WH-001');
  const [selectedFacId, setSelectedFacId] = useState('FAC-001');
  const [areaFilter, setAreaFilter] = useState('All');
  const [facSearch, setFacSearch] = useState('');
  const [payingFo, setPayingFo] = useState<FactoryOrderRecord | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payAccount, setPayAccount] = useState('ACC-002');

  useEffect(() => {
    adminApi.getOperationsBundle().then((res) => {
      const bundle = res as OperationsState;
      setData(bundle);
      if (bundle.factories[0]) setFromNode(`F:${bundle.factories[0].id}`);
      if (bundle.warehouses[0]) setToNode(`W:${bundle.warehouses[0].id}`);
      if (bundle.items[0]) setItemId(bundle.items[0].id);
    });
  }, []);

  if (!data) return <div className="p-8 text-xs text-[#6E6E73]">Loading Warehouses &amp; Factories...</div>;

  // ONLY CREATED WAREHOUSES (W) & CREATED FACTORIES (F) IN DROPDOWNS
  const warehouseOptions: NodeOption[] = data.warehouses.map((w) => ({
    value: `W:${w.id}`,
    type: 'W',
    id: w.id,
    label: `[W] ${w.id} — ${w.name}`,
  }));
  const factoryOptions: NodeOption[] = data.factories.map((f) => ({
    value: `F:${f.id}`,
    type: 'F',
    id: f.id,
    label: `[F] ${f.id} — ${f.name} (${f.area})`,
  }));
  const allNodes = [...warehouseOptions, ...factoryOptions];

  // Filter Send From & Receive At dropdowns strictly based on selected Route Preset
  const allowedFromOptions =
    routePreset === 'WW' ? warehouseOptions : routePreset === 'FF' ? factoryOptions : allNodes;

  const [fromType, fromId] = fromNode.split(':') as ['W' | 'F', string];
  const allowedToOptions = (() => {
    let list: NodeOption[] = allNodes;
    if (routePreset === 'WW') list = warehouseOptions;
    else if (routePreset === 'FF') list = factoryOptions;
    else if (routePreset === 'WF') list = fromType === 'W' ? factoryOptions : warehouseOptions;
    return list.filter((opt) => opt.value !== fromNode);
  })();

  const effectiveToNode = allowedToOptions.some((o) => o.value === toNode)
    ? toNode
    : allowedToOptions[0]?.value || '';
  const [toType, toId] = (effectiveToNode || 'W:WH-001').split(':') as ['W' | 'F', string];
  const currentRouteBadge = `${fromType} → ${toType}`;

  const applyPreset = (preset: RoutePreset) => {
    setRoutePreset(preset);
    if (preset === 'WW' && warehouseOptions.length >= 2) {
      setFromNode(warehouseOptions[0].value);
      setToNode(warehouseOptions[1].value);
    } else if (preset === 'FF' && factoryOptions.length >= 2) {
      setFromNode(factoryOptions[0].value);
      setToNode(factoryOptions[1].value);
    } else if (preset === 'WF' && factoryOptions[0] && warehouseOptions[0]) {
      setFromNode(factoryOptions[0].value);
      setToNode(warehouseOptions[0].value);
    }
  };

  const swapDirection = () => {
    if (!effectiveToNode) return;
    const prevFrom = fromNode;
    setFromNode(effectiveToNode);
    setToNode(prevFrom);
  };

  const handleSendReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!effectiveToNode || fromNode === effectiveToNode) {
      notify('Please pick two different created locations for Send From and Receive At.');
      return;
    }
    const res = await adminApi.sendReceiveTransfer({
      fromType,
      fromId,
      toType,
      toId,
      itemId,
      shelf,
      boxes: Number(boxes) || 1,
      pieces: Number(pieces) || 10,
      reason,
    });
    setData(res as OperationsState);
    setReason('');
    notify(`Recorded ${currentRouteBadge} movement (${boxes} boxes · ${pieces} pcs)!`);
  };

  const filteredMovements = data.stockMovements.filter((m) => {
    if (logFilter === 'All') return true;
    if (logFilter === 'WF') return m.routeType === 'W → F' || m.routeType === 'F → W';
    if (logFilter === 'WW') return m.routeType === 'W → W';
    if (logFilter === 'FF') return m.routeType === 'F → F';
    return true;
  });

  const exportMovements = (format: 'pdf' | 'excel') => {
    const cols = [
      { key: 'id', label: 'ID' },
      { key: 'date', label: 'Date' },
      { key: 'route', label: 'Route' },
      { key: 'from', label: 'Send From' },
      { key: 'to', label: 'Receive At' },
      { key: 'item', label: 'Item' },
      { key: 'boxes', label: 'Boxes' },
      { key: 'qty', label: 'Pieces' },
      { key: 'status', label: 'Status' },
    ];
    const rows = filteredMovements.map((m) => ({
      id: m.id,
      date: m.date,
      route: m.routeType || m.direction,
      from: m.fromLabel || m.warehouseName,
      to: m.toLabel || '—',
      item: `${m.itemId} · ${m.itemName}`,
      boxes: m.boxes ?? '—',
      qty: m.quantity,
      status: m.status || 'Received',
    }));
    const opts = {
      filename: 'ayaan-send-receive-log',
      title: 'Warehouse & Factory Send / Receive Log',
      subtitle: `Filter: ${logFilter} · ${rows.length} movements`,
      columns: cols,
      rows,
    };
    if (format === 'pdf') exportTableToPdf(opts);
    else {
      exportTableToExcel(opts);
      notify('Downloaded Send / Receive Excel sheet!');
    }
  };

  // Warehouse & Factory helpers
  const activeWh = data.warehouses.find((w) => w.id === selectedWhId) || data.warehouses[0];
  const allLots = data.warehouses.flatMap((w) => w.storedLots || []);
  const oldStockCount = allLots.filter((l) => l.daysStored >= 25).length;
  const totalBoxes = data.warehouses.reduce((s, w) => s + w.boxesStored, 0);

  const areas = ['All', ...Array.from(new Set(data.factories.map((f) => f.area)))];
  const filteredFactories = data.factories.filter((f) => {
    const matchA = areaFilter === 'All' || f.area === areaFilter;
    const matchQ = !facSearch.trim() || f.name.toLowerCase().includes(facSearch.toLowerCase()) || f.specialty.toLowerCase().includes(facSearch.toLowerCase());
    return matchA && matchQ;
  });
  const activeFac = data.factories.find((f) => f.id === selectedFacId) || filteredFactories[0] || data.factories[0];
  const facOrdersForActive = data.factoryOrders.filter((fo) => fo.factoryName === activeFac?.name);
  const facTotalOrdered = facOrdersForActive.reduce((s, fo) => s + fo.totalCostUsd, 0);
  const facTotalPaid = facOrdersForActive.reduce((s, fo) => s + fo.paidUsd, 0);
  const facTotalOwed = Math.max(0, facTotalOrdered - facTotalPaid);

  const jumpToSendFrom = (nodeVal: string, preset: RoutePreset = 'ALL') => {
    setRoutePreset(preset);
    setFromNode(nodeVal);
    setTab('transfer');
  };

  return (
    <div className="relative mx-auto max-w-6xl space-y-6 pb-12">
      <AmbientAura variant="cool" />

      {/* Header + 3-Tab Segmented Switcher */}
      <div className="relative flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-indigo-600">Warehouse (W) &amp; Factory (F) Control</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-3xl">
            Warehouses &amp; Factories
          </h1>
        </div>
        <SegmentedControl
          layoutId="opsMainTab"
          value={tab}
          onChange={setTab}
          options={[
            { label: 'Send / Receive (W ⇄ F)', value: 'transfer' },
            { label: `Warehouses (${data.warehouses.length})`, value: 'warehouses' },
            { label: `Factories (${data.factories.length})`, value: 'factories' },
          ]}
        />
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: UNIVERSAL SEND -> RECEIVE (W <-> F, W <-> W, F <-> F ONLY)     */}
      {/* ===================================================================== */}
      {tab === 'transfer' && (
        <div className="space-y-6">
          <form onSubmit={handleSendReceive} className="ambient-card rounded-[30px] p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
              <div>
                <h2 className="text-base font-semibold text-[#0A0B0E]">Send to Receive Transfer</h2>
                <p className="text-xs text-[#6E6E73]">
                  Dropdowns list only your created Warehouses (<strong>[W]</strong>) and created Factories (<strong>[F]</strong>).
                </p>
              </div>

              {/* Quick Route Mode Filter */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'ALL' as const, label: 'Any Route' },
                  { id: 'WF' as const, label: 'W ⇄ F' },
                  { id: 'WW' as const, label: 'W ⇄ W' },
                  { id: 'FF' as const, label: 'F ⇄ F' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => applyPreset(r.id)}
                    className={`cursor-pointer rounded-full px-3.5 py-1.5 font-mono text-xs font-medium ${
                      routePreset === r.id ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* SEND FROM  <-- [Swap & Route Badge] -->  RECEIVE AT */}
            <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-11">
              <div className="md:col-span-5">
                <label className="text-xs font-semibold text-[#0A0B0E]">Send From (Created W / F Only)</label>
                <select
                  value={fromNode}
                  onChange={(e) => setFromNode(e.target.value)}
                  className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-3 text-xs font-medium text-[#0A0B0E]"
                >
                  {(routePreset === 'ALL' || routePreset === 'WF' || routePreset === 'WW') && (
                    <optgroup label="Created Warehouses (W)">
                      {warehouseOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </optgroup>
                  )}
                  {(routePreset === 'ALL' || routePreset === 'WF' || routePreset === 'FF') && (
                    <optgroup label="Created Factories (F)">
                      {factoryOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Swap Button + Live Route Pill */}
              <div className="flex flex-col items-center justify-center gap-1.5 md:col-span-1">
                <SpecBadge tone="original" className="font-mono !text-[10px]">{currentRouteBadge}</SpecBadge>
                <button
                  type="button"
                  onClick={swapDirection}
                  title="Swap Send From & Receive At"
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/[0.08] bg-[#FAFAFC] text-[#0A0B0E] transition-colors hover:bg-[#0A0B0E] hover:text-white"
                >
                  <ArrowRightLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="md:col-span-5">
                <label className="text-xs font-semibold text-[#0A0B0E]">Receive At (Created W / F Only)</label>
                <select
                  value={effectiveToNode}
                  onChange={(e) => setToNode(e.target.value)}
                  className="luminous-input mt-1.5 w-full rounded-2xl px-4 py-3 text-xs font-medium text-[#0A0B0E]"
                >
                  {allowedToOptions.some((o) => o.type === 'W') && (
                    <optgroup label="Created Warehouses (W)">
                      {allowedToOptions
                        .filter((o) => o.type === 'W')
                        .map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </optgroup>
                  )}
                  {allowedToOptions.some((o) => o.type === 'F') && (
                    <optgroup label="Created Factories (F)">
                      {allowedToOptions
                        .filter((o) => o.type === 'F')
                        .map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

            {/* Item, Boxes, Pieces, Shelf & Note */}
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-12">
              <div className="sm:col-span-5">
                <label className="text-xs text-[#6E6E73]">Clothing Item (Created Items Only)</label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="luminous-input mt-1 w-full rounded-2xl px-4 py-2.5 text-xs font-medium"
                >
                  {data.items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.id} — {it.brand} {it.name} (Stock: {it.stock})
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[#6E6E73]">Boxes</label>
                <input type="number" min={1} required value={boxes} onChange={(e) => setBoxes(e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-3.5 py-2.5 font-mono text-xs" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-[#6E6E73]">Pieces</label>
                <input type="number" min={1} required value={pieces} onChange={(e) => setPieces(e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-3.5 py-2.5 font-mono text-xs" />
              </div>
              {toType === 'W' ? (
                <div className="sm:col-span-3">
                  <label className="text-xs text-[#6E6E73]">Put on Shelf (At {toId})</label>
                  <input value={shelf} onChange={(e) => setShelf(e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-3.5 py-2.5 text-xs" />
                </div>
              ) : (
                <div className="sm:col-span-3">
                  <label className="text-xs text-[#6E6E73]">Work Purpose</label>
                  <input placeholder="e.g., Wash / Relabel / Sew" value={reason} onChange={(e) => setReason(e.target.value)} className="luminous-input mt-1 w-full rounded-2xl px-3.5 py-2.5 text-xs" />
                </div>
              )}

              {toType === 'W' && (
                <div className="sm:col-span-12">
                  <input
                    placeholder="Short truck or delivery note (optional)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="luminous-input w-full rounded-2xl px-4 py-2.5 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/[0.06] pt-4">
              <p className="text-[11px] text-[#6E6E73]">
                {currentRouteBadge === 'F → W' && 'Adds boxes onto receiver warehouse shelf and increases live website stock.'}
                {currentRouteBadge === 'W → F' && 'Deducts boxes from sender warehouse shelf (sending back to factory).'}
                {currentRouteBadge === 'W → W' && 'Moves boxes cleanly from sender warehouse shelf to receiver warehouse shelf.'}
                {currentRouteBadge === 'F → F' && 'Logs direct factory-to-factory transfer (e.g., sewing mill to washing unit).'}
              </p>
              <PrismaticButton type="submit" prismatic size="md">
                <Send className="h-3.5 w-3.5" /> Record {currentRouteBadge} Transfer
              </PrismaticButton>
            </div>
          </form>

          {/* LIVE SEND & RECEIVE HISTORY TABLE */}
          <div className="rounded-[28px] border border-black/[0.07] bg-white overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] bg-[#FAFAFC] px-5 py-4">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-2 text-xs font-semibold text-[#0A0B0E]">Send &amp; Receive Log</span>
                {(['All', 'WF', 'WW', 'FF'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLogFilter(f)}
                    className={`cursor-pointer rounded-full px-3 py-1 font-mono text-[11px] font-medium ${
                      logFilter === f ? 'bg-[#0A0B0E] text-white' : 'bg-white text-[#515154] border border-black/[0.06]'
                    }`}
                  >
                    {f === 'All' ? 'All' : f === 'WF' ? 'W ⇄ F' : f === 'WW' ? 'W ⇄ W' : 'F ⇄ F'}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <PrismaticButton size="sm" variant="glass" onClick={() => exportMovements('pdf')}>
                  <FileText className="h-3.5 w-3.5 text-rose-500" /> PDF
                </PrismaticButton>
                <PrismaticButton size="sm" variant="glass" onClick={() => exportMovements('excel')}>
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Excel
                </PrismaticButton>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-black/[0.06] bg-[#FAFAFC] text-[10px] uppercase tracking-wider text-[#6E6E73]">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Route</th>
                    <th className="px-4 py-3">Send From → Receive At</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Boxes / PCS</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FAFAFC]">
                      <td className="px-4 py-3.5 font-mono font-semibold text-indigo-700">{m.id}</td>
                      <td className="px-4 py-3.5">
                        <SpecBadge tone={m.routeType === 'F → W' ? 'emerald' : m.routeType === 'W → F' ? 'rose' : 'original'} className="font-mono">
                          {m.routeType || m.direction}
                        </SpecBadge>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-[#0A0B0E]">{m.fromLabel || m.warehouseName}</p>
                        {m.toLabel && <p className="text-[11px] text-[#6E6E73]">→ {m.toLabel}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-[#0A0B0E]">{m.itemName}</p>
                        <p className="font-mono text-[10px] text-[#6E6E73]">{m.itemId} · {m.reason}</p>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {m.boxes ? `${m.boxes} boxes · ` : ''}{m.quantity.toLocaleString()} pcs
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {m.status === 'In Transit' ? (
                          <PrismaticButton
                            size="sm"
                            onClick={() =>
                              adminApi.markMovementReceived(m.id).then((res: any) => {
                                setData(res as OperationsState);
                                notify(`Confirmed ${m.id} received!`);
                              })
                            }
                          >
                            <CheckCircle2 className="h-3 w-3" /> Mark Received
                          </PrismaticButton>
                        ) : (
                          <SpecBadge tone="emerald">Received ✓</SpecBadge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: WAREHOUSES — SHELVES, FULLNESS, OLD STOCK & DISPATCH           */}
      {/* ===================================================================== */}
      {tab === 'warehouses' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <BentoTile tint="sky" className="!p-4"><p className="text-[11px] text-[#6E6E73]">Created Warehouses</p><p className="mt-1 font-mono text-2xl font-semibold">{data.warehouses.length}</p></BentoTile>
            <BentoTile tint="indigo" className="!p-4"><p className="text-[11px] text-[#6E6E73]">Total Boxes Stored</p><p className="mt-1 font-mono text-2xl font-semibold">{totalBoxes}</p></BentoTile>
            <BentoTile tint="rose" className="!p-4"><p className="text-[11px] text-[#6E6E73]">Old Stock (25+ Days)</p><p className="mt-1 font-mono text-2xl font-semibold text-rose-600">{oldStockCount}</p></BentoTile>
            <BentoTile tint="emerald" className="!p-4"><p className="text-[11px] text-[#6E6E73]">Quick Action</p><Link href="/admin/manage?entity=warehouses&mode=create" className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"><Plus className="h-3.5 w-3.5" /> Create Warehouse</Link></BentoTile>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-4">
              {data.warehouses.map((wh) => {
                const cap = wh.capacityBoxes || 150;
                const pct = Math.min(100, Math.round((wh.boxesStored / cap) * 100));
                return (
                  <button
                    key={wh.id}
                    type="button"
                    onClick={() => setSelectedWhId(wh.id)}
                    className={`w-full cursor-pointer rounded-[26px] border p-5 text-left transition-all ${
                      activeWh?.id === wh.id ? 'prismatic-ring border-transparent bg-white shadow-sm' : 'border-black/[0.06] bg-[#FAFAFC] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700">[W] {wh.id}</span>
                      <span className="font-mono text-[11px] font-semibold">{pct}% Full</span>
                    </div>
                    <h2 className="mt-2 text-base font-semibold text-[#0A0B0E]">{wh.name}</h2>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[#6E6E73]"><MapPin className="h-3 w-3" /> {wh.location}</p>
                    <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-[#515154]"><Phone className="h-3 w-3" /> {wh.manager}</p>
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500" style={{ width: `${pct}%` }} />
                    </div>
                  </button>
                );
              })}
            </div>

            {activeWh && (
              <div className="ambient-card rounded-[28px] p-6 lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-600"><Warehouse className="h-4 w-4" /> [W] {activeWh.id}</span>
                    <h2 className="text-xl font-semibold text-[#0A0B0E]">{activeWh.name}</h2>
                  </div>
                  <PrismaticButton size="sm" prismatic onClick={() => jumpToSendFrom(`W:${activeWh.id}`)}>
                    <ArrowRightLeft className="h-3.5 w-3.5" /> Send From {activeWh.id}
                  </PrismaticButton>
                </div>

                {(activeWh.storedLots || []).map((lot) => (
                  <div key={lot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-indigo-700 border border-black/[0.06]">{lot.itemId}</span>
                        <span className="font-mono text-[11px] text-[#515154]">{lot.shelf}</span>
                        {lot.daysStored >= 25 && <SpecBadge tone="rose"><AlertTriangle className="h-3 w-3" /> Old {lot.daysStored}d</SpecBadge>}
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#0A0B0E]">{lot.brand} — {lot.itemName}</p>
                      <p className="font-mono text-xs text-[#6E6E73]"><Box className="mr-1 inline h-3 w-3" />{lot.boxes} boxes · {lot.pieces.toLocaleString()} pcs</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setItemId(lot.itemId);
                          setBoxes(String(lot.boxes));
                          setPieces(String(lot.pieces));
                          jumpToSendFrom(`W:${activeWh.id}`);
                        }}
                        className="cursor-pointer rounded-full border border-black/[0.07] bg-white px-3 py-1.5 text-[11px] font-medium hover:bg-[#F5F5F7]"
                      >
                        Send W→W / W→F
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!window.confirm(`Load ${lot.boxes} boxes onto Chattogram port truck?`)) return;
                          adminApi.dispatchWarehouseLot(activeWh.id, lot.id).then((res) => {
                            setData(res as OperationsState);
                            notify(`Dispatched ${lot.boxes} boxes to port truck!`);
                          });
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#0A0B0E] px-3 py-1.5 text-[11px] font-medium text-white"
                      >
                        <Truck className="h-3 w-3" /> Port Truck
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: PARTNER FACTORIES — BUSY LOAD, ORDERS, MONEY OWED & SEND F->W  */}
      {/* ===================================================================== */}
      {tab === 'factories' && (
        <div className="space-y-6">
          <div className="glass-surface flex flex-wrap items-center justify-between gap-3 rounded-[26px] p-4">
            <div className="flex flex-wrap gap-1.5">
              {areas.map((a) => (
                <button key={a} type="button" onClick={() => setAreaFilter(a)} className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium ${areaFilter === a ? 'bg-[#0A0B0E] text-white' : 'bg-[#F5F5F7] text-[#515154]'}`}>
                  {a}
                </button>
              ))}
            </div>
            <div className="relative w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#86868B]" />
              <input value={facSearch} onChange={(e) => setFacSearch(e.target.value)} placeholder="Search factory..." className="luminous-input w-full rounded-full py-1.5 pl-8 pr-3 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="space-y-3 lg:col-span-5">
              {filteredFactories.map((fac) => {
                const fOwed = data.factoryOrders.filter((fo) => fo.factoryName === fac.name).reduce((s, fo) => s + Math.max(0, fo.totalCostUsd - fo.paidUsd), 0);
                const busy = fac.busyPercent ?? 55;
                return (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => setSelectedFacId(fac.id)}
                    className={`w-full cursor-pointer rounded-[26px] border p-5 text-left transition-all ${
                      activeFac?.id === fac.id ? 'prismatic-ring border-transparent bg-white shadow-sm' : 'border-black/[0.06] bg-[#FAFAFC] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-lg bg-indigo-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-700">[F] {fac.id}</span>
                      {fOwed > 0 && <SpecBadge tone="rose" className="!py-0.5 !text-[10px]">Owe ${fOwed.toLocaleString()}</SpecBadge>}
                    </div>
                    <h2 className="mt-2 text-base font-semibold text-[#0A0B0E]">{fac.name}</h2>
                    <p className="text-xs text-[#515154]">{fac.specialty} · {fac.area}</p>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-indigo-500" style={{ width: `${busy}%` }} />
                    </div>
                    <p className="mt-1 font-mono text-[10px] text-[#6E6E73]">{busy}% Busy · ★ {fac.rating ?? 4.8}</p>
                  </button>
                );
              })}
              <Link href="/admin/manage?entity=factories&mode=create" className="block">
                <PrismaticButton variant="glass" size="sm" className="w-full"><Plus className="h-3.5 w-3.5" /> Add Partner Factory</PrismaticButton>
              </Link>
            </div>

            {activeFac && (
              <div className="ambient-card rounded-[28px] p-6 lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.06] pb-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-indigo-600"><Building2 className="h-4 w-4" /> [F] {activeFac.id} · {activeFac.area}</span>
                    <h2 className="text-xl font-semibold text-[#0A0B0E]">{activeFac.name}</h2>
                    <p className="text-xs text-[#6E6E73]">{activeFac.manager} · <span className="font-mono">{activeFac.phone}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <PrismaticButton size="sm" variant="glass" onClick={() => jumpToSendFrom(`F:${activeFac.id}`)}>
                      <ArrowRightLeft className="h-3.5 w-3.5" /> Send F→W / F→F
                    </PrismaticButton>
                    <a href={`https://wa.me/${activeFac.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white">
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                  <div className="rounded-2xl bg-[#FAFAFC] p-3.5"><p className="font-sans text-[10px] text-[#6E6E73]">Ordered</p><p className="font-semibold text-base">${facTotalOrdered.toLocaleString()}</p></div>
                  <div className="rounded-2xl bg-emerald-50/75 p-3.5"><p className="font-sans text-[10px] text-emerald-700">Paid</p><p className="font-semibold text-base text-emerald-800">${facTotalPaid.toLocaleString()}</p></div>
                  <div className="rounded-2xl bg-rose-50/75 p-3.5"><p className="font-sans text-[10px] text-rose-700">Still Owe</p><p className="font-semibold text-base text-rose-700">${facTotalOwed.toLocaleString()}</p></div>
                </div>

                <div className="space-y-2.5">
                  {facOrdersForActive.map((fo) => {
                    const owed = Math.max(0, fo.totalCostUsd - fo.paidUsd);
                    return (
                      <div key={fo.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/[0.06] p-4">
                        <div>
                          <div className="flex items-center gap-2"><span className="font-mono text-xs font-semibold text-indigo-600">{fo.id}</span><SpecBadge tone={fo.stage === 'Arrived' ? 'emerald' : 'master'}>{fo.stage}</SpecBadge></div>
                          <p className="mt-1 text-sm font-semibold text-[#0A0B0E]">{fo.itemName}</p>
                          <p className="font-mono text-[11px] text-[#6E6E73]">{fo.pieces.toLocaleString()} pcs · Paid ${fo.paidUsd.toLocaleString()} / ${fo.totalCostUsd.toLocaleString()}</p>
                        </div>
                        {owed > 0 && (
                          <PrismaticButton size="sm" prismatic onClick={() => { setPayingFo(fo); setPayAmount(String(owed)); }}>
                            <DollarSign className="h-3 w-3" /> Pay (${owed.toLocaleString()})
                          </PrismaticButton>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAY FACTORY MODAL */}
      <GlassModal open={!!payingFo} onClose={() => setPayingFo(null)} maxWidth="max-w-md">
        {payingFo && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const amt = Number(payAmount);
              if (!amt || amt <= 0) return;
              await adminApi.recordFactoryPayment(payingFo.id, amt, payAccount, 'Paid from Factory Desk');
              const fresh = await adminApi.getOperationsBundle();
              setData(fresh as OperationsState);
              setPayingFo(null);
              notify(`Paid $${amt.toLocaleString()} to ${payingFo.factoryName} from ${payAccount}!`);
            }}
            className="p-6 space-y-4"
          >
            <h3 className="text-base font-semibold text-[#0A0B0E]">Pay Factory — {payingFo.id}</h3>
            <input required type="number" min={1} max={payingFo.totalCostUsd - payingFo.paidUsd} value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="luminous-input w-full rounded-2xl px-4 py-2.5 font-mono text-sm" />
            <select value={payAccount} onChange={(e) => setPayAccount(e.target.value)} className="luminous-input w-full rounded-2xl px-4 py-2.5 text-xs">
              {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.id} — {a.name} (${a.balanceUsd.toLocaleString()})</option>)}
            </select>
            <PrismaticButton type="submit" prismatic className="w-full">Confirm Payout &amp; Update Bank</PrismaticButton>
          </form>
        )}
      </GlassModal>
    </div>
  );
}
