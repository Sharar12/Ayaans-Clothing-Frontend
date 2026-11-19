'use client';

import React, { useEffect, useState } from 'react';
import { Sparkles, Lock, Clock, Play, Bell, Trash2, Plus } from 'lucide-react';
import { portalApi } from '@/services/portalApi';
import type { VipDropItem, WatchlistRule } from '@/types/portal';
import { useApp } from '@/store/AppContext';
import { AmbientAura, PrismaticButton, SpecBadge } from '@/design-system/primitives';

export default function VipDropsPage() {
  const { formatPrice, notify } = useApp();
  const [drops, setDrops] = useState<VipDropItem[]>([]);
  const [rules, setRules] = useState<WatchlistRule[]>([]);
  const [newRule, setNewRule] = useState({ brand: '', category: '', maxUnitUsd: '6.50', channel: 'WhatsApp + Email' as WatchlistRule['channel'] });

  useEffect(() => {
    Promise.all([portalApi.getVipDrops(), portalApi.getWatchlist()]).then(([d, w]) => {
      setDrops(d);
      setRules(w);
    });
  }, []);

  const toggleHold = async (sku: string, currentlyHeld: boolean) => {
    const updated = await portalApi.toggleHoldDrop(sku);
    setDrops(updated);
    notify(currentlyHeld ? `Released 24h soft hold on ${sku}` : `Locked 24-hour exclusive soft hold on ${sku}!`);
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.brand || !newRule.category) return;
    const updated = await portalApi.addWatchlistRule({
      brand: newRule.brand,
      category: newRule.category,
      maxUnitUsd: Number(newRule.maxUnitUsd) || 8,
      channel: newRule.channel,
    });
    setRules(updated);
    setNewRule({ brand: '', category: '', maxUnitUsd: '6.50', channel: 'WhatsApp + Email' });
    notify('Automated Stock Radar alert activated');
  };

  return (
    <div className="relative mx-auto max-w-6xl space-y-10 pb-12">
      <AmbientAura variant="warm" />

      <div className="relative rounded-[30px] border border-black/[0.07] bg-white/80 p-7 backdrop-blur-xl">
        <SpecBadge tone="original">
          <Sparkles className="h-3 w-3" /> Verified Importer Preview · 12 Hours Ahead of Public Catalog
        </SpecBadge>
        <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em] text-[#0A0B0E] sm:text-4xl">
          VIP Private Drops &amp; 24-Hour Carton Holds
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-[#515154]">
          Place an instant zero-deposit <strong>24-hour soft hold</strong> on newly arrived Uttara warehouse lots while
          reviewing with your buying team.
        </p>
      </div>

      {/* Private Drop Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {drops.map((d) => (
          <article
            key={d.sku}
            className={`ambient-card flex flex-col overflow-hidden rounded-[28px] bg-white ${
              d.heldByBuyer ? 'prismatic-ring' : ''
            }`}
          >
            <div className="relative aspect-[4/3.6] overflow-hidden bg-[#F5F5F7]">
              <img src={d.image} alt={d.title} className="h-full w-full object-cover" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <SpecBadge tone="glass">Public in {d.earlyAccessHoursLeft}h</SpecBadge>
                {d.heldByBuyer && (
                  <SpecBadge tone="emerald">
                    <Clock className="h-3 w-3" /> Held: {d.holdExpiresIn}
                  </SpecBadge>
                )}
              </div>
              <button
                type="button"
                onClick={() => notify(`Requesting live WhatsApp warehouse reel for ${d.sku}`)}
                className="glass-pill absolute bottom-3 left-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold text-[#0A0B0E]"
              >
                <Play className="h-3 w-3 fill-[#0A0B0E]" /> Warehouse Reel
              </button>
            </div>

            <div className="flex flex-1 flex-col p-5">
              <div className="flex justify-between font-mono text-[11px] text-[#6E6E73]">
                <span className="font-sans font-semibold text-indigo-600">{d.brand}</span>
                <span>{d.gsm}</span>
              </div>
              <h2 className="mt-1 text-sm font-semibold text-[#0A0B0E]">{d.title}</h2>
              <p className="mt-2 text-xs leading-relaxed text-[#515154]">{d.warehouseNote}</p>

              <div className="mt-4 flex items-baseline justify-between border-t border-black/[0.05] pt-3.5 font-mono">
                <div>
                  <p className="font-sans text-[10px] text-[#86868B]">Full Lot Price</p>
                  <p className="text-lg font-semibold text-[#0A0B0E]">{formatPrice(d.fullLotPriceUsd)}/pc</p>
                </div>
                <div className="text-right text-[11px] text-[#6E6E73]">
                  <p>{d.availableStock} pcs ready</p>
                  <p>MOQ {d.moq}</p>
                </div>
              </div>

              <div className="mt-4 pt-1">
                <PrismaticButton
                  size="sm"
                  variant={d.heldByBuyer ? 'glass' : 'obsidian'}
                  prismatic={!d.heldByBuyer}
                  className="w-full"
                  onClick={() => toggleHold(d.sku, d.heldByBuyer)}
                >
                  <Lock className="h-3.5 w-3.5" />
                  {d.heldByBuyer ? 'Release 24h Soft Hold' : 'Lock 24-Hour Soft Hold'}
                </PrismaticButton>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Custom Watchlist Radar */}
      <section className="rounded-[28px] border border-black/[0.07] bg-[#FAFAFC] p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-[#0A0B0E]">Automated Stock-Alert Radar</h2>
        </div>
        <p className="mt-1 text-xs text-[#6E6E73]">
          Get instant Dhaka desk pings whenever matching surplus brands hit your target FOB price ceiling.
        </p>

        <div className="mt-5 space-y-2">
          {rules.map((r) => (
            <div
              key={r.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-black/[0.06] bg-white px-4 py-3 text-xs"
            >
              <div>
                <span className="font-semibold text-[#0A0B0E]">{r.brand}</span>
                <span className="mx-2 text-[#86868B]">·</span>
                <span className="text-[#515154]">{r.category}</span>
                <span className="mx-2 text-[#86868B]">·</span>
                <span className="font-mono font-semibold text-emerald-700">Max {formatPrice(r.maxUnitUsd)}/pc</span>
              </div>
              <div className="flex items-center gap-3">
                <SpecBadge tone="neutral">{r.channel}</SpecBadge>
                <button
                  type="button"
                  onClick={() => portalApi.deleteWatchlistRule(r.id).then(setRules)}
                  className="cursor-pointer text-[#86868B] hover:text-rose-500"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddRule} className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-12">
          <input
            required
            placeholder="Target Brand (e.g., H&M, Nike)"
            value={newRule.brand}
            onChange={(e) => setNewRule((f) => ({ ...f, brand: e.target.value }))}
            className="luminous-input rounded-2xl px-3.5 py-2 text-xs sm:col-span-3"
          />
          <input
            required
            placeholder="Category (e.g., Denim, Tees)"
            value={newRule.category}
            onChange={(e) => setNewRule((f) => ({ ...f, category: e.target.value }))}
            className="luminous-input rounded-2xl px-3.5 py-2 text-xs sm:col-span-4"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Max USD/pc"
            value={newRule.maxUnitUsd}
            onChange={(e) => setNewRule((f) => ({ ...f, maxUnitUsd: e.target.value }))}
            className="luminous-input rounded-2xl px-3.5 py-2 font-mono text-xs sm:col-span-2"
          />
          <PrismaticButton type="submit" size="sm" className="sm:col-span-3">
            <Plus className="h-3.5 w-3.5" /> Add Radar Rule
          </PrismaticButton>
        </form>
      </section>
    </div>
  );
}
