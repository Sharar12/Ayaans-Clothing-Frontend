import { portalMockBackend } from '@/mock-backend/portal-handlers';
import type {
  BuyerCompanySettings,
  ConsigneeAddress,
  DhakaVisitTrip,
  FinancialDocument,
  PortalNotification,
  PortalOrderDetail,
  PortalRfqRecord,
  QcInspectionReport,
  TeamMember,
  VipDropItem,
  WatchlistRule,
} from '@/types/portal';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function authFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Portal API Error (${res.status}): ${path}`);
  const json = await res.json();
  return (json.data ?? json) as T;
}

export const portalApi = {
  getNotifications: (): Promise<PortalNotification[]> =>
    USE_MOCK ? portalMockBackend.getNotifications() : authFetch('/account/notifications'),
  markAllRead: (): Promise<PortalNotification[]> =>
    USE_MOCK ? portalMockBackend.markAllRead() : authFetch('/account/notifications/read-all', { method: 'POST' }),

  getOrders: (): Promise<PortalOrderDetail[]> =>
    USE_MOCK ? portalMockBackend.getOrders() : authFetch('/account/orders'),

  getRfqs: (): Promise<PortalRfqRecord[]> =>
    USE_MOCK ? portalMockBackend.getRfqs() : authFetch('/account/rfqs'),
  acceptRfq: (rfqId: string): Promise<{ rfqs: PortalRfqRecord[]; newOrderId: string }> =>
    USE_MOCK ? portalMockBackend.acceptRfq(rfqId) : authFetch(`/account/rfqs/${rfqId}/accept`, { method: 'POST' }),
  submitCounterOffer: (rfqId: string, targetUnitPriceUsd: number, note: string): Promise<PortalRfqRecord[]> =>
    USE_MOCK
      ? portalMockBackend.submitCounterOffer(rfqId, targetUnitPriceUsd, note)
      : authFetch(`/account/rfqs/${rfqId}/counter`, {
          method: 'POST',
          body: JSON.stringify({ targetUnitPriceUsd, note }),
        }),

  getVipDrops: (): Promise<VipDropItem[]> =>
    USE_MOCK ? portalMockBackend.getVipDrops() : authFetch('/account/vip-drops'),
  toggleHoldDrop: (sku: string): Promise<VipDropItem[]> =>
    USE_MOCK ? portalMockBackend.toggleHoldDrop(sku) : authFetch(`/account/vip-drops/${sku}/hold`, { method: 'POST' }),

  getWatchlist: (): Promise<WatchlistRule[]> =>
    USE_MOCK ? portalMockBackend.getWatchlist() : authFetch('/account/watchlist'),
  addWatchlistRule: (rule: Omit<WatchlistRule, 'id'>): Promise<WatchlistRule[]> =>
    USE_MOCK
      ? portalMockBackend.addWatchlistRule(rule)
      : authFetch('/account/watchlist', { method: 'POST', body: JSON.stringify(rule) }),
  deleteWatchlistRule: (id: string): Promise<WatchlistRule[]> =>
    USE_MOCK ? portalMockBackend.deleteWatchlistRule(id) : authFetch(`/account/watchlist/${id}`, { method: 'DELETE' }),

  getInspections: (): Promise<QcInspectionReport[]> =>
    USE_MOCK ? portalMockBackend.getInspections() : authFetch('/account/inspections'),
  reviewInspection: (id: string, decision: 'approved' | 'flagged', note: string): Promise<QcInspectionReport[]> =>
    USE_MOCK
      ? portalMockBackend.reviewInspection(id, decision, note)
      : authFetch(`/account/inspections/${id}/review`, { method: 'POST', body: JSON.stringify({ decision, note }) }),

  getDocuments: (): Promise<FinancialDocument[]> =>
    USE_MOCK ? portalMockBackend.getDocuments() : authFetch('/account/documents'),
  uploadPaymentProof: (docId: string, fileName: string): Promise<FinancialDocument[]> =>
    USE_MOCK
      ? portalMockBackend.uploadPaymentProof(docId, fileName)
      : authFetch(`/account/documents/${docId}/proof`, { method: 'POST', body: JSON.stringify({ fileName }) }),

  getSettings: (): Promise<BuyerCompanySettings> =>
    USE_MOCK ? portalMockBackend.getSettings() : authFetch('/account/settings'),
  updateSettings: (patch: Partial<BuyerCompanySettings>): Promise<BuyerCompanySettings> =>
    USE_MOCK
      ? portalMockBackend.updateSettings(patch)
      : authFetch('/account/settings', { method: 'PATCH', body: JSON.stringify(patch) }),
  addAddress: (addr: Omit<ConsigneeAddress, 'id'>): Promise<BuyerCompanySettings> =>
    USE_MOCK
      ? portalMockBackend.addAddress(addr)
      : authFetch('/account/addresses', { method: 'POST', body: JSON.stringify(addr) }),
  scheduleDhakaVisit: (trip: Omit<DhakaVisitTrip, 'id' | 'status' | 'chauffeurNote' | 'visaLetterReady'>): Promise<BuyerCompanySettings> =>
    USE_MOCK
      ? portalMockBackend.scheduleDhakaVisit(trip)
      : authFetch('/account/visits', { method: 'POST', body: JSON.stringify(trip) }),
  inviteTeamMember: (member: Omit<TeamMember, 'id' | 'status'>): Promise<BuyerCompanySettings> =>
    USE_MOCK
      ? portalMockBackend.inviteTeamMember(member)
      : authFetch('/account/team', { method: 'POST', body: JSON.stringify(member) }),
};
