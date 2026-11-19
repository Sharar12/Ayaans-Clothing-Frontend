import { mockBackend, type ProductFilterQuery } from '@/mock-backend/handlers';
import type { Brand, BuyerOrder, Certification, ExportStep, FaqItem, Product, RfqPayload } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function laravelFetch<T>(endpoint: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Laravel API Error (${res.status}): ${endpoint}`);
  const json = await res.json();
  return (json.data ?? json) as T;
}

export const api = {
  getProducts: (query: ProductFilterQuery = {}): Promise<Product[]> => {
    if (USE_MOCK) return mockBackend.getProducts(query);
    const params = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'All') params.set(k, String(v));
    });
    return laravelFetch<Product[]>(`/products?${params.toString()}`);
  },

  getProductBySku: (sku: string): Promise<Product | null> =>
    USE_MOCK ? mockBackend.getProductBySku(sku) : laravelFetch<Product | null>(`/products/${encodeURIComponent(sku)}`),

  getBrands: (): Promise<Brand[]> =>
    USE_MOCK ? mockBackend.getBrands() : laravelFetch<Brand[]>('/brands'),

  getBrandBySlug: (slug: string): Promise<{ brand: Brand | null; products: Product[] }> =>
    USE_MOCK ? mockBackend.getBrandBySlug(slug) : laravelFetch(`/brands/${encodeURIComponent(slug)}`),

  getExportSteps: (): Promise<ExportStep[]> =>
    USE_MOCK ? mockBackend.getExportSteps() : laravelFetch<ExportStep[]>('/export-steps'),

  getCertifications: (): Promise<Certification[]> =>
    USE_MOCK ? mockBackend.getCertifications() : laravelFetch<Certification[]>('/compliance'),

  getFaqs: (): Promise<FaqItem[]> =>
    USE_MOCK ? mockBackend.getFaqs() : laravelFetch<FaqItem[]>('/faqs'),

  getBuyerOrders: (): Promise<BuyerOrder[]> =>
    USE_MOCK ? mockBackend.getBuyerOrders() : laravelFetch<BuyerOrder[]>('/account/orders'),

  submitRfq: (payload: RfqPayload): Promise<{ rfqId: string; receivedAt: string }> =>
    USE_MOCK
      ? mockBackend.submitRfq(payload)
      : laravelFetch('/rfq', { method: 'POST', body: JSON.stringify(payload) }),

  submitContact: (payload: Record<string, string>): Promise<{ referenceId: string }> =>
    USE_MOCK
      ? mockBackend.submitContact(payload)
      : laravelFetch('/contact', { method: 'POST', body: JSON.stringify(payload) }),
};
