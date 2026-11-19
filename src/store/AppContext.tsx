'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { BagItem, BuyerProfile, CurrencyCode, LocaleCode, Product } from '@/types';

const CURRENCY_RATES: Record<CurrencyCode, { symbol: string; rate: number }> = {
  BDT: { symbol: '৳', rate: 121.5 },
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  AED: { symbol: 'AED ', rate: 3.67 },
};

export function resolveTierForQty(product: Product, quantity: number) {
  const sorted = [...product.tiers].sort((a, b) => b.minQty - a.minQty);
  return sorted.find((t) => quantity >= t.minQty) ?? product.tiers[0];
}

interface ToastMessage {
  id: number;
  text: string;
}

interface AppContextValue {
  bag: BagItem[];
  rfqList: BagItem[];
  wishlist: string[];
  compareList: Product[];
  locale: LocaleCode;
  currency: CurrencyCode;
  deliverTo: string;
  bagDrawerOpen: boolean;
  bagDrawerTab: 'bag' | 'rfq';
  spotlightOpen: boolean;
  quickViewProduct: Product | null;
  buyer: BuyerProfile | null;
  toasts: ToastMessage[];
  totals: {
    pieces: number;
    subtotalUsd: number;
    totalCbm: number;
    totalWeightKg: number;
    recommendedFreight: string;
    containerFillPercent: number;
    containerTargetCbm: number;
  };
  formatPrice: (usd: number) => string;
  addToBag: (product: Product, quantity?: number) => void;
  updateBagQty: (sku: string, quantity: number) => void;
  removeFromBag: (sku: string) => void;
  clearBag: () => void;
  addToRfq: (product: Product, quantity?: number) => void;
  removeFromRfq: (sku: string) => void;
  convertBagToRfq: () => void;
  toggleWishlist: (sku: string) => void;
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
  setLocale: (loc: LocaleCode) => void;
  setCurrency: (cur: CurrencyCode) => void;
  setDeliverTo: (country: string) => void;
  openBagDrawer: (tab?: 'bag' | 'rfq') => void;
  closeBagDrawer: () => void;
  setSpotlightOpen: (v: boolean) => void;
  setQuickViewProduct: (p: Product | null) => void;
  signInDemo: (email?: string, company?: string) => void;
  signOut: () => void;
  notify: (text: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [bag, setBag] = useState<BagItem[]>([]);
  const [rfqList, setRfqList] = useState<BagItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [locale, setLocale] = useState<LocaleCode>('EN');
  const [currency, setCurrency] = useState<CurrencyCode>('BDT');
  const [deliverTo, setDeliverTo] = useState<string>('Bangladesh');
  const [bagDrawerOpen, setBagDrawerOpen] = useState(false);
  const [bagDrawerTab, setBagDrawerTab] = useState<'bag' | 'rfq'>('bag');
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Apply RTL direction automatically when Arabic is selected
  useEffect(() => {
    document.documentElement.dir = locale === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = locale.toLowerCase();
  }, [locale]);

  // Global Cmd+K / Ctrl+K Spotlight Shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const notify = (text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const formatPrice = (usd: number) => {
    const { symbol, rate } = CURRENCY_RATES[currency];
    const converted = usd * rate;
    return `${symbol}${converted.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const addToBag = (product: Product, quantity?: number) => {
    const qty = Math.max(product.moq, quantity ?? product.moq);
    const tier = resolveTierForQty(product, qty);
    setBag((prev) => {
      const existing = prev.find((i) => i.product.sku === product.sku);
      if (existing) {
        const nextQty = Math.min(product.availableStock, existing.quantity + qty);
        const nextTier = resolveTierForQty(product, nextQty);
        return prev.map((i) =>
          i.product.sku === product.sku
            ? { ...i, quantity: nextQty, unitPrice: nextTier.unitPrice, tierLabel: nextTier.label }
            : i
        );
      }
      return [...prev, { product, quantity: qty, unitPrice: tier.unitPrice, tierLabel: tier.label }];
    });
    notify(`Added ${qty} pcs of ${product.brand} ${product.category} to Wholesale Bag`);
    setBagDrawerTab('bag');
    setBagDrawerOpen(true);
  };

  const updateBagQty = (sku: string, quantity: number) => {
    setBag((prev) =>
      prev.map((item) => {
        if (item.product.sku !== sku) return item;
        const clamped = Math.max(item.product.moq, Math.min(item.product.availableStock, quantity));
        const tier = resolveTierForQty(item.product, clamped);
        return { ...item, quantity: clamped, unitPrice: tier.unitPrice, tierLabel: tier.label };
      })
    );
  };

  const removeFromBag = (sku: string) => setBag((prev) => prev.filter((i) => i.product.sku !== sku));
  const clearBag = () => setBag([]);

  const addToRfq = (product: Product, quantity?: number) => {
    const qty = Math.max(product.moq, quantity ?? product.moq);
    const tier = resolveTierForQty(product, qty);
    setRfqList((prev) => {
      if (prev.some((i) => i.product.sku === product.sku)) {
        return prev.map((i) =>
          i.product.sku === product.sku
            ? { ...i, quantity: qty, unitPrice: tier.unitPrice, tierLabel: tier.label }
            : i
        );
      }
      return [...prev, { product, quantity: qty, unitPrice: tier.unitPrice, tierLabel: tier.label }];
    });
    notify(`Added ${product.sku} to RFQ Quote List`);
    setBagDrawerTab('rfq');
    setBagDrawerOpen(true);
  };

  const removeFromRfq = (sku: string) => setRfqList((prev) => prev.filter((i) => i.product.sku !== sku));

  const convertBagToRfq = () => {
    setRfqList((prev) => {
      const merged = [...prev];
      bag.forEach((b) => {
        if (!merged.some((r) => r.product.sku === b.product.sku)) merged.push(b);
      });
      return merged;
    });
    setBagDrawerTab('rfq');
    notify('Wholesale Bag synced to Formal RFQ List');
  };

  const toggleWishlist = (sku: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(sku);
      notify(exists ? 'Removed from Saved Lots' : 'Saved lot to Wishlist');
      return exists ? prev.filter((s) => s !== sku) : [...prev, sku];
    });
  };

  const toggleCompare = (product: Product) => {
    setCompareList((prev) => {
      if (prev.some((p) => p.sku === product.sku)) {
        return prev.filter((p) => p.sku !== product.sku);
      }
      if (prev.length >= 4) {
        notify('Compare up to 4 stock lots side-by-side');
        return prev;
      }
      return [...prev, product];
    });
  };

  const signInDemo = (email = 'buying@nordicretail.eu', company = 'Nordic Retail Group') => {
    setBuyer({
      name: 'Henrik Lindholm',
      company,
      email,
      country: deliverTo,
      tier: 'Verified Importer',
      merchandiser: {
        name: 'Fakhrul Islam & Export Desk',
        role: 'Senior Sourcing Director · Dhaka',
        whatsapp: '+880 1620-853502',
        email: 'export@ayaanclothing.com',
      },
    });
    notify(`Signed in as ${company}`);
  };

  const signOut = () => {
    setBuyer(null);
    notify('Signed out of Buyer Portal');
  };

  const totals = useMemo(() => {
    const pieces = bag.reduce((acc, i) => acc + i.quantity, 0);
    const subtotalUsd = bag.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    const totalCbm = bag.reduce((acc, i) => acc + i.quantity * i.product.unitCbm, 0);
    const totalWeightKg = bag.reduce((acc, i) => acc + i.quantity * i.product.unitWeightKg, 0);

    let recommendedFreight = 'Air Express / Sample Lot';
    let containerTargetCbm = 2;
    if (totalCbm >= 2 && totalCbm < 20) {
      recommendedFreight = 'Sea LCL Consolidation';
      containerTargetCbm = 28;
    } else if (totalCbm >= 20 && totalCbm <= 30) {
      recommendedFreight = '20ft FCL Container Optimal';
      containerTargetCbm = 28;
    } else if (totalCbm > 30) {
      recommendedFreight = '40ft FCL Container';
      containerTargetCbm = 58;
    }

    const containerFillPercent = Math.min(100, Math.round((totalCbm / containerTargetCbm) * 100));
    return {
      pieces,
      subtotalUsd,
      totalCbm,
      totalWeightKg,
      recommendedFreight,
      containerFillPercent,
      containerTargetCbm,
    };
  }, [bag]);

  return (
    <AppContext.Provider
      value={{
        bag,
        rfqList,
        wishlist,
        compareList,
        locale,
        currency,
        deliverTo,
        bagDrawerOpen,
        bagDrawerTab,
        spotlightOpen,
        quickViewProduct,
        buyer,
        toasts,
        totals,
        formatPrice,
        addToBag,
        updateBagQty,
        removeFromBag,
        clearBag,
        addToRfq,
        removeFromRfq,
        convertBagToRfq,
        toggleWishlist,
        toggleCompare,
        clearCompare: () => setCompareList([]),
        setLocale,
        setCurrency,
        setDeliverTo,
        openBagDrawer: (tab = 'bag') => {
          setBagDrawerTab(tab);
          setBagDrawerOpen(true);
        },
        closeBagDrawer: () => setBagDrawerOpen(false),
        setSpotlightOpen,
        setQuickViewProduct,
        signInDemo,
        signOut,
        notify,
      }}
    >
      {children}
      {/* Ambient Floating Toast Stack */}
      <div className="pointer-events-none fixed top-20 right-4 z-[70] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="glass-surface pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-medium text-[#0A0B0E]"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            {t.text}
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
