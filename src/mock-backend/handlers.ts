import type { Brand, BuyerOrder, Certification, ExportStep, FaqItem, Product, RfqPayload } from '@/types';
import {
  MOCK_BRANDS,
  MOCK_CERTIFICATIONS,
  MOCK_EXPORT_STEPS,
  MOCK_FAQS,
  MOCK_ORDERS,
  MOCK_PRODUCTS,
} from './data';

const delay = (ms = 140) => new Promise((res) => setTimeout(res, ms));

export interface ProductFilterQuery {
  audience?: string;
  category?: string;
  brand?: string;
  designType?: string;
  q?: string;
  isNewArrival?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'moq_asc' | 'stock_desc';
}

export const mockBackend = {
  async getProducts(query: ProductFilterQuery = {}): Promise<Product[]> {
    await delay(80);
    let list = [...MOCK_PRODUCTS];

    if (query.audience && query.audience !== 'All') {
      list = list.filter((p) => p.audience.toLowerCase() === query.audience!.toLowerCase());
    }
    if (query.category && query.category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === query.category!.toLowerCase());
    }
    if (query.brand && query.brand !== 'All') {
      list = list.filter(
        (p) =>
          p.brandSlug.toLowerCase() === query.brand!.toLowerCase() ||
          p.brand.toLowerCase() === query.brand!.toLowerCase()
      );
    }
    if (query.designType && query.designType !== 'All') {
      list = list.filter((p) => p.designType === query.designType);
    }
    if (query.isNewArrival) {
      list = list.filter((p) => p.isNewArrival);
    }
    if (query.q && query.q.trim()) {
      const term = query.q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.category.toLowerCase().includes(term) ||
          p.fabric.toLowerCase().includes(term) ||
          p.gsm.toLowerCase().includes(term)
      );
    }

    switch (query.sort) {
      case 'price_asc':
        list.sort((a, b) => a.tiers[0].unitPrice - b.tiers[0].unitPrice);
        break;
      case 'price_desc':
        list.sort((a, b) => b.tiers[0].unitPrice - a.tiers[0].unitPrice);
        break;
      case 'moq_asc':
        list.sort((a, b) => a.moq - b.moq);
        break;
      case 'stock_desc':
        list.sort((a, b) => b.availableStock - a.availableStock);
        break;
      default:
        list.sort((a, b) => Number(b.isNewArrival) - Number(a.isNewArrival));
    }
    return list;
  },

  async getProductBySku(sku: string): Promise<Product | null> {
    await delay(60);
    return MOCK_PRODUCTS.find((p) => p.sku.toLowerCase() === sku.toLowerCase()) ?? null;
  },

  async getBrands(): Promise<Brand[]> {
    await delay(50);
    return MOCK_BRANDS;
  },

  async getBrandBySlug(slug: string): Promise<{ brand: Brand | null; products: Product[] }> {
    await delay(60);
    const brand = MOCK_BRANDS.find((b) => b.slug.toLowerCase() === slug.toLowerCase()) ?? null;
    const products = MOCK_PRODUCTS.filter((p) => p.brandSlug.toLowerCase() === slug.toLowerCase());
    return { brand, products };
  },

  async getExportSteps(): Promise<ExportStep[]> {
    return MOCK_EXPORT_STEPS;
  },

  async getCertifications(): Promise<Certification[]> {
    await delay(50);
    return MOCK_CERTIFICATIONS;
  },

  async getFaqs(): Promise<FaqItem[]> {
    await delay(50);
    return MOCK_FAQS;
  },

  async getBuyerOrders(): Promise<BuyerOrder[]> {
    await delay(80);
    return MOCK_ORDERS;
  },

  async submitRfq(payload: RfqPayload): Promise<{ rfqId: string; receivedAt: string }> {
    await delay(420);
    const id = `RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    if (typeof window !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('ayaan_rfq_history') || '[]');
      localStorage.setItem('ayaan_rfq_history', JSON.stringify([{ rfqId: id, ...payload }, ...existing]));
    }
    return { rfqId: id, receivedAt: new Date().toISOString() };
  },

  async submitContact(payload: Record<string, string>): Promise<{ referenceId: string }> {
    await delay(320);
    void payload;
    return { referenceId: `INQ-${Math.floor(10000 + Math.random() * 90000)}` };
  },
};
