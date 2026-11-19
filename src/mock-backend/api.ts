import { MOCK_PRODUCTS, BRANDS } from "./data";
import { Product } from "./types";

// Adapt MOCK_PRODUCTS from main catalog types to legacy prototype types
const ADAPTED_PRODUCTS: Product[] = MOCK_PRODUCTS.map((p) => ({
  id: p.id,
  slug: p.sku.toLowerCase(),
  sku: p.sku,
  title: p.title,
  brand: p.brand,
  category: p.category,
  gender: (p.audience === 'Unisex' ? 'unisex' : p.audience === 'Men' ? 'men' : p.audience === 'Women' ? 'women' : 'unisex') as Product['gender'],
  type: (p.brand === 'OEM / Factory Direct' ? 'oem' : 'stock-lot') as Product['type'],
  status: p.availableStock > 0 ? 'in-stock' : 'sold-out',
  moq: p.moq,
  totalAvailable: p.availableStock,
  fabric: p.fabric || '100% Combed Cotton',
  gsm: p.gsm || '220 GSM',
  sizes: p.sizes,
  colors: p.colors,
  cbmPer100Pcs: p.unitCbm * 100,
  weightKgPer100Pcs: p.unitWeightKg * 100,
  images: [p.images[0] || '', p.images[1] || p.images[0] || ''],
  pricingTiers: p.tiers.map((t) => ({
    label: t.label,
    minQty: t.minQty,
    unitPriceBdt: Math.round(t.unitPrice * 121.5),
  })),
  description: p.description,
  specs: [
    { label: 'AQL Inspection', value: p.aqlStandard },
    { label: 'Packaging', value: `${p.pcsPerCarton} pcs/carton` },
    { label: 'Origin', value: 'Dhaka, Bangladesh' },
  ],
  featured: p.isFeatured,
}));

// Replace these functions with `fetch('https://your-laravel-api.com/api/...')` later.
export const api = {
  getProducts: (): Product[] => ADAPTED_PRODUCTS,

  getFeaturedProducts: (): Product[] =>
    ADAPTED_PRODUCTS.filter((p) => p.featured),

  getProductBySlug: (slug: string): Product | undefined =>
    ADAPTED_PRODUCTS.find((p) => p.slug === slug || p.sku.toLowerCase() === slug.toLowerCase()),

  getStockLots: (): Product[] =>
    ADAPTED_PRODUCTS.filter((p) => p.type === "stock-lot"),

  getOemProducts: (): Product[] =>
    ADAPTED_PRODUCTS.filter((p) => p.type === "oem"),

  getBrands: (): string[] => BRANDS,

  searchProducts: (query: string): Product[] => {
    const q = query.toLowerCase().trim();
    if (!q) return ADAPTED_PRODUCTS.slice(0, 4);
    return ADAPTED_PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  },
};
