"use client";

import React, { createContext, useContext, useState } from "react";
import { Product, RfqItem } from "@/mock-backend/types";

interface RfqContextType {
  items: RfqItem[];
  isDrawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  addToRfq: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromRfq: (productId: string) => void;
  clearRfq: () => void;
  totalItemsCount: number;
  totalEstimatedValue: number;
  totalCbm: number;
}

const RfqContext = createContext<RfqContextType | undefined>(undefined);

function getTierPrice(product: Product, qty: number): number {
  const sorted = [...product.pricingTiers].sort((a, b) => b.minQty - a.minQty);
  const match = sorted.find((t) => qty >= t.minQty);
  return match ? match.unitPriceBdt : product.pricingTiers[0].unitPriceBdt;
}

export function RfqProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<RfqItem[]>([]);
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setSearchOpen] = useState(false);

  const addToRfq = (product: Product, quantity?: number) => {
    const qty = quantity || product.moq;
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        const newQty = existing.quantity + qty;
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: newQty, selectedTierPrice: getTierPrice(product, newQty) }
            : i
        );
      }
      return [...prev, { product, quantity: qty, selectedTierPrice: getTierPrice(product, qty) }];
    });
    setDrawerOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? {
              ...i,
              quantity: Math.max(i.product.moq, quantity),
              selectedTierPrice: getTierPrice(i.product, Math.max(i.product.moq, quantity)),
            }
          : i
      )
    );
  };

  const removeFromRfq = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearRfq = () => setItems([]);

  const totalItemsCount = items.length;
  const totalEstimatedValue = items.reduce(
    (sum, i) => sum + i.quantity * i.selectedTierPrice,
    0
  );
  const totalCbm = items.reduce(
    (sum, i) => sum + (i.quantity / 100) * i.product.cbmPer100Pcs,
    0
  );

  return (
    <RfqContext.Provider
      value={{
        items,
        isDrawerOpen,
        setDrawerOpen,
        quickViewProduct,
        setQuickViewProduct,
        isSearchOpen,
        setSearchOpen,
        addToRfq,
        updateQuantity,
        removeFromRfq,
        clearRfq,
        totalItemsCount,
        totalEstimatedValue,
        totalCbm,
      }}
    >
      {children}
    </RfqContext.Provider>
  );
}

export const useRfq = () => {
  const ctx = useContext(RfqContext);
  if (!ctx) throw new Error("useRfq must be used within RfqProvider");
  return ctx;
};
