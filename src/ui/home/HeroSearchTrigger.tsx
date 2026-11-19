"use client";

import { Search } from "lucide-react";
import { useRfq } from "@/context/RfqContext";

export function HeroSearchTrigger() {
  const { setSearchOpen } = useRfq();

  return (
    <button
      type="button"
      onClick={() => setSearchOpen(true)}
      className="w-full max-w-lg flex items-center justify-between px-4 py-3.5 bg-surface/70 hover:bg-surface border border-hairline hover:border-ink/40 transition-all text-left group"
    >
      <span className="flex items-center gap-3 text-sm text-muted group-hover:text-ink transition-colors">
        <Search className="w-4 h-4 text-ink" />
        <span>Search 108+ lots by SKU, Brand (Levi&apos;s, Zara), or GSM...</span>
      </span>
      <kbd className="hidden sm:inline-block font-mono text-[10px] px-2 py-1 bg-white border border-hairline text-ink">
        ⌘K
      </kbd>
    </button>
  );
}
