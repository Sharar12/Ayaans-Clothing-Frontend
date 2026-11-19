import { adminMockBackend } from '@/mock-backend/admin-handlers';
import type { EntityKey, EntityRecordMap, ProfitLossSummary, UnifiedInboxItem, UnifiedOrder, UnifiedSiteSettings } from '@/types/admin';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Admin API Error (${res.status}): ${path}`);
  const json = await res.json();
  return (json.data ?? json) as T;
}

export const adminApi = {
  getOverview: () => (USE_MOCK ? adminMockBackend.getOverview() : apiFetch('/admin/overview')),
  getProfitLossReport: (fromDate: string, toDate: string): Promise<ProfitLossSummary> =>
    USE_MOCK
      ? adminMockBackend.getProfitLossReport(fromDate, toDate)
      : apiFetch(`/admin/reports/profit-loss?from=${fromDate}&to=${toDate}`),

  listRecords: <K extends EntityKey>(entity: K) =>
    USE_MOCK ? adminMockBackend.listRecords(entity) : apiFetch<EntityRecordMap[K][]>(`/admin/records/${entity}`),
  createRecord: <K extends EntityKey>(entity: K, payload: Omit<EntityRecordMap[K], 'id'>) =>
    USE_MOCK
      ? adminMockBackend.createRecord(entity, payload)
      : apiFetch<EntityRecordMap[K][]>(`/admin/records/${entity}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateRecord: <K extends EntityKey>(entity: K, id: string, payload: Partial<EntityRecordMap[K]>) =>
    USE_MOCK
      ? adminMockBackend.updateRecord(entity, id, payload)
      : apiFetch<EntityRecordMap[K][]>(`/admin/records/${entity}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteRecord: <K extends EntityKey>(entity: K, id: string) =>
    USE_MOCK
      ? adminMockBackend.deleteRecord(entity, id)
      : apiFetch<EntityRecordMap[K][]>(`/admin/records/${entity}/${id}`, { method: 'DELETE' }),

  getOrdersBundle: () => (USE_MOCK ? adminMockBackend.getOrdersBundle() : apiFetch<any>('/admin/orders')),
  updateOrder: (id: string, patch: Partial<UnifiedOrder>) =>
    USE_MOCK
      ? adminMockBackend.updateOrder(id, patch)
      : apiFetch<UnifiedOrder[]>(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  recordBuyerPayment: (orderId: string, amountUsd: number, accountId: string, method: string, note: string) =>
    USE_MOCK
      ? adminMockBackend.recordBuyerPayment(orderId, amountUsd, accountId, method, note)
      : apiFetch<any>(`/admin/orders/${orderId}/payments`, {
          method: 'POST',
          body: JSON.stringify({ amountUsd, accountId, method, note }),
        }),
  recordFactoryPayment: (foId: string, amountUsd: number, accountId: string, note: string) =>
    USE_MOCK
      ? adminMockBackend.recordFactoryPayment(foId, amountUsd, accountId, note)
      : apiFetch<any>(`/admin/factory-orders/${foId}/payments`, {
          method: 'POST',
          body: JSON.stringify({ amountUsd, accountId, note }),
        }),
  advanceFactoryOrder: (id: string) =>
    USE_MOCK ? adminMockBackend.advanceFactoryOrder(id) : apiFetch(`/admin/factory-orders/${id}/advance`, { method: 'POST' }),
  markExpensePaid: (id: string) =>
    USE_MOCK ? adminMockBackend.markExpensePaid(id) : apiFetch<any>(`/admin/expenses/${id}/paid`, { method: 'POST' }),

  getInbox: () => (USE_MOCK ? adminMockBackend.getInbox() : apiFetch<UnifiedInboxItem[]>('/admin/inbox')),
  replyInbox: (id: string, status: UnifiedInboxItem['status'], offeredPriceUsd?: number) =>
    USE_MOCK
      ? adminMockBackend.replyInbox(id, status, offeredPriceUsd)
      : apiFetch<UnifiedInboxItem[]>(`/admin/inbox/${id}`, { method: 'PATCH', body: JSON.stringify({ status, offeredPriceUsd }) }),
  convertQuoteToOrder: (id: string) =>
    USE_MOCK ? adminMockBackend.convertQuoteToOrder(id) : apiFetch(`/admin/inbox/${id}/convert`, { method: 'POST' }),

  getSettings: () => (USE_MOCK ? adminMockBackend.getSettings() : apiFetch<UnifiedSiteSettings>('/admin/settings')),
  saveSettings: (next: UnifiedSiteSettings) =>
    USE_MOCK
      ? adminMockBackend.saveSettings(next)
      : apiFetch<UnifiedSiteSettings>('/admin/settings', { method: 'PUT', body: JSON.stringify(next) }),

  getOperationsBundle: () => (USE_MOCK ? adminMockBackend.getOperationsBundle() : apiFetch<any>('/admin/operations')),
  sendReceiveTransfer: (payload: {
    fromType: 'W' | 'F';
    fromId: string;
    toType: 'W' | 'F';
    toId: string;
    itemId: string;
    shelf: string;
    boxes: number;
    pieces: number;
    reason: string;
  }) =>
    USE_MOCK
      ? (adminMockBackend as any).sendReceiveTransfer(payload)
      : apiFetch<any>('/admin/operations/transfer', { method: 'POST', body: JSON.stringify(payload) }),
  markMovementReceived: (movId: string) =>
    USE_MOCK
      ? (adminMockBackend as any).markMovementReceived(movId)
      : apiFetch<any>(`/admin/operations/movements/${movId}/receive`, { method: 'POST' }),
  addWarehouseStockIn: (whId: string, itemId: string, shelf: string, boxes: number, pieces: number, reason: string) =>
    USE_MOCK
      ? adminMockBackend.addWarehouseStockIn(whId, itemId, shelf, boxes, pieces, reason)
      : apiFetch(`/admin/warehouses/${whId}/stock-in`, { method: 'POST', body: JSON.stringify({ itemId, shelf, boxes, pieces, reason }) }),
  toggleLotReadyForTruck: (whId: string, lotId: string) =>
    USE_MOCK
      ? adminMockBackend.toggleLotReadyForTruck(whId, lotId)
      : apiFetch(`/admin/warehouses/${whId}/lots/${lotId}/ready`, { method: 'POST' }),
  transferWarehouseLot: (fromWhId: string, lotId: string, toWhId: string) =>
    USE_MOCK
      ? adminMockBackend.transferWarehouseLot(fromWhId, lotId, toWhId)
      : apiFetch(`/admin/warehouses/${fromWhId}/transfer`, { method: 'POST', body: JSON.stringify({ lotId, toWhId }) }),
  dispatchWarehouseLot: (whId: string, lotId: string) =>
    USE_MOCK
      ? adminMockBackend.dispatchWarehouseLot(whId, lotId)
      : apiFetch(`/admin/warehouses/${whId}/lots/${lotId}/dispatch`, { method: 'POST' }),
  updateFactoryBusy: (facId: string, busyPercent: number) =>
    USE_MOCK
      ? adminMockBackend.updateFactoryBusy(facId, busyPercent)
      : apiFetch(`/admin/factories/${facId}/busy`, { method: 'PATCH', body: JSON.stringify({ busyPercent }) }),
};
