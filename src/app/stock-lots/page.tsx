import { MOCK_PRODUCTS } from '@/mock-backend/data';
import { ProductCard } from '@/components/commerce/ProductCard';

export default function StockLotsPage() {
  const lots = MOCK_PRODUCTS.filter((p) => p.designType === 'ORIGINAL');
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="border-b border-black/[0.08] pb-8 mb-10">
        <span className="font-mono text-xs uppercase tracking-wider text-[#6E6E73]">Immediate Dispatch</span>
        <h1 className="font-bold text-4xl text-[#0A0B0E] mt-1 tracking-tight">
          Export Stock Lots & Surplus
        </h1>
        <p className="text-sm text-[#515154] mt-2 max-w-xl">
          QC-passed branded export surplus ready for immediate air or sea shipment from our Uttara, Dhaka warehouse.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {lots.map((product) => (
          <ProductCard key={product.sku} product={product} />
        ))}
      </div>
    </div>
  );
}
