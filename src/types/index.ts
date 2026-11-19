export type Audience = 'Men' | 'Women' | 'Boys' | 'Girls' | 'Unisex';
export type DesignType = 'ORIGINAL' | 'MASTER COPY';
export type LocaleCode = 'EN' | 'BN' | 'AR' | 'ES' | 'FR';
export type CurrencyCode = 'BDT' | 'USD' | 'EUR' | 'GBP' | 'AED';

export interface PricingTier {
  id: 'standard' | 'bulk' | 'full_stock';
  label: string;
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
  savingsPercent: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  brand: string;
  brandSlug: string;
  audience: Audience;
  category: string;
  designType: DesignType;
  labelStatus: 'Original Labels Intact' | 'De-labeled for Export' | 'Custom Label Ready';
  moq: number;
  availableStock: number;
  initialStock: number;
  unitCbm: number;      // Cubic meters per piece
  unitWeightKg: number; // Gross weight KG per piece
  pcsPerCarton: number;
  gsm: string;
  fabric: string;
  aqlStandard: string;
  sizes: string[];
  colors: ProductColor[];
  tiers: PricingTier[];
  images: string[];
  videoPreviewLabel?: string;
  isNewArrival: boolean;
  isFeatured: boolean;
  arrivedAgo: string;
  assortmentNote: string;
  description: string;
}

export interface Brand {
  slug: string;
  name: string;
  origin: string;
  specialty: string;
  activeLots: number;
  isOwnLabel?: boolean;
}

export interface Certification {
  id: string;
  title: string;
  shortTitle: string;
  authority: string;
  registrationNumber: string;
  issueYear: string;
  status: 'Verified Active';
  scope: string;
  documentCode: string;
}

export interface FaqItem {
  id: string;
  category:
  | 'Authenticity & Stock Lots'
  | 'MOQ & Assortment'
  | 'Pricing & Payment'
  | 'Custom OEM'
  | 'Quality & Inspection'
  | 'Shipping & Incoterms'
  | 'Visiting Bangladesh';
  question: string;
  answer: string;
}

export interface ExportStep {
  step: string;
  title: string;
  summary: string;
  sla: string;
}

export interface BagItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  tierLabel: string;
}

export interface RfqPayload {
  sourcingType: 'Stock Lots' | 'Custom OEM' | 'Buying Agent' | 'Mixed Inquiry';
  audiences: Audience[];
  categories: string[];
  targetQuantity: string;
  targetBudget: string;
  destinationCountry: string;
  shippingMethod: 'Sea FCL' | 'Sea LCL' | 'Air Freight' | 'Door-to-Door';
  incoterm: 'FOB Chattogram' | 'CIF' | 'DDP' | 'EXW';
  paymentMethod: 'L/C (Letter of Credit)' | 'T/T Bank Wire' | 'Mixed / Discuss';
  companyName: string;
  contactName: string;
  email: string;
  whatsapp: string;
  notes: string;
  attachedFileName?: string;
  items: { sku: string; title: string; quantity: number; unitPrice: number }[];
}

export interface BuyerOrder {
  id: string;
  date: string;
  totalUsd: number;
  totalPieces: number;
  totalCbm: number;
  currentStep: number; // 1 to 10
  statusLabel: string;
  destination: string;
  freightMode: string;
  itemsSummary: string;
}

export interface BuyerProfile {
  name: string;
  company: string;
  email: string;
  country: string;
  tier: 'Verified Importer';
  merchandiser: {
    name: string;
    role: string;
    whatsapp: string;
    email: string;
  };
}
