export type ProductType = "stock-lot" | "oem";
export type StockStatus = "in-stock" | "limited" | "sold-out";
export type GenderCategory = "Men" | "Women" | "Boys" | "Girls" | "Unisex";

export interface PricingTier {
  label: string;
  minQty: number;
  unitPriceBdt: number; // BDT (৳)
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  title: string;
  brand: string;
  category: string;
  gender: GenderCategory;
  type: ProductType;
  status: StockStatus;
  moq: number;
  totalAvailable: number;
  fabric: string;
  gsm: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  cbmPer100Pcs: number;
  weightKgPer100Pcs: number;
  images: [string, string];
  pricingTiers: PricingTier[];
  description: string;
  specs: ProductSpec[];
  featured?: boolean;
}

export interface RfqItem {
  product: Product;
  quantity: number;
  selectedTierPrice: number;
}
