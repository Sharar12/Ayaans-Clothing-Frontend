import React from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import { ProductStudioView } from '@/components/views/ProductStudioView';

export default async function ProductDetailPage({ params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const [product, allProducts] = await Promise.all([api.getProductBySku(sku), api.getProducts()]);

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <p className="font-mono text-xs text-[#6E6E73]">SKU NOT FOUND</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0A0B0E]">This stock lot may have sold out.</h1>
        <p className="mt-2 text-sm text-[#515154]">
          New factory surplus lots arrive daily in our Dhaka warehouses. Browse active inventory or request similar stock.
        </p>
        <Link
          href="/catalog"
          className="mt-6 inline-block rounded-full bg-[#0A0B0E] px-6 py-2.5 text-sm font-medium text-white"
        >
          Back to Catalog
        </Link>
      </div>
    );
  }

  const related = allProducts.filter((p) => p.sku !== product.sku).slice(0, 4);
  return <ProductStudioView product={product} related={related} />;
}
