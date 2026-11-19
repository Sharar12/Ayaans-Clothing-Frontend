import React, { Suspense } from 'react';
import { CatalogView } from '@/components/views/CatalogView';

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl p-12 text-sm text-[#6E6E73]">Loading catalog...</div>}>
      <CatalogView />
    </Suspense>
  );
}
