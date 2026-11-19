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
import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_FINANCIAL_DOCS,
  INITIAL_PORTAL_NOTIFICATIONS,
  INITIAL_PORTAL_ORDERS,
  INITIAL_PORTAL_RFQS,
  INITIAL_QC_INSPECTIONS,
  INITIAL_VIP_DROPS,
  INITIAL_WATCHLIST_RULES,
} from './portal-data';

const wait = (ms = 110) => new Promise((r) => setTimeout(r, ms));

// Stateful in-memory session store (resets cleanly on full reload; replaced by MySQL in Laravel)
let notifications: PortalNotification[] = [...INITIAL_PORTAL_NOTIFICATIONS];
let orders: PortalOrderDetail[] = [...INITIAL_PORTAL_ORDERS];
let rfqs: PortalRfqRecord[] = [...INITIAL_PORTAL_RFQS];
let vipDrops: VipDropItem[] = [...INITIAL_VIP_DROPS];
let watchlist: WatchlistRule[] = [...INITIAL_WATCHLIST_RULES];
let inspections: QcInspectionReport[] = [...INITIAL_QC_INSPECTIONS];
let documents: FinancialDocument[] = [...INITIAL_FINANCIAL_DOCS];
let settings: BuyerCompanySettings = structuredClone(INITIAL_COMPANY_SETTINGS);

export const portalMockBackend = {
  async getNotifications(): Promise<PortalNotification[]> {
    await wait(50);
    return [...notifications];
  },

  async markAllRead(): Promise<PortalNotification[]> {
    notifications = notifications.map((n) => ({ ...n, unread: false }));
    return [...notifications];
  },

  async getOrders(): Promise<PortalOrderDetail[]> {
    await wait();
    return [...orders];
  },

  async getRfqs(): Promise<PortalRfqRecord[]> {
    await wait();
    return [...rfqs];
  },

  async acceptRfq(rfqId: string): Promise<{ rfqs: PortalRfqRecord[]; newOrderId: string }> {
    await wait(240);
    const target = rfqs.find((r) => r.id === rfqId);
    const newOrderId = `AYC-2026-${Math.floor(5000 + Math.random() * 900)}`;
    rfqs = rfqs.map((r) => (r.id === rfqId ? { ...r, status: 'converted' } : r));
    if (target) {
      orders = [
        {
          id: newOrderId,
          date: 'Today',
          type: target.sourcingType === 'Custom OEM' ? 'Custom OEM Production' : 'Stock Lot Consolidation',
          status: 'staging',
          statusLabel: 'Confirmed · Reserved in Uttara Hub',
          currentStep: 5,
          totalUsd: Math.round(target.quantity * target.offeredUnitPriceUsd),
          totalPieces: target.quantity,
          totalCbm: target.estCbm,
          totalWeightKg: Math.round(target.quantity * 0.42),
          freightMode: target.estCbm > 20 ? '20ft FCL' : 'Sea LCL',
          originPort: 'Chattogram (BDCGP)',
          destinationPort: settings.addresses[0]?.portOrCity || 'Rotterdam (NLRTM)',
          vesselOrFlight: 'Assigning Vessel Space',
          blOrAwbNumber: 'Pending Shipment',
          etaDate: 'TBD upon T/T',
          items: [
            {
              sku: target.id,
              brand: 'Ayaan Confirmed Lot',
              title: target.title,
              quantity: target.quantity,
              cartons: Math.ceil(target.quantity / 30),
              unitPriceUsd: target.offeredUnitPriceUsd,
              sizeRatio: 'Assorted Export Ratio',
            },
          ],
          milestones: orders[0].milestones.map((m, idx) => ({
            ...m,
            completedAt: idx < 5 ? 'Today' : null,
          })),
        },
        ...orders,
      ];
      documents = [
        {
          id: `doc-${Date.now()}`,
          docNumber: `PI-${newOrderId}`,
          orderId: newOrderId,
          category: 'PI',
          title: `Proforma Invoice — ${target.title}`,
          issueDate: 'Today',
          amountUsd: Math.round(target.quantity * target.offeredUnitPriceUsd),
          paymentStatus: 'Pending Wire',
        },
        ...documents,
      ];
    }
    return { rfqs: [...rfqs], newOrderId };
  },

  async submitCounterOffer(rfqId: string, targetUnitPriceUsd: number, note: string): Promise<PortalRfqRecord[]> {
    await wait(200);
    rfqs = rfqs.map((r) =>
      r.id === rfqId
        ? {
            ...r,
            status: 'negotiating',
            targetUnitPriceUsd,
            counterHistory: [
              ...r.counterHistory,
              { by: 'Buyer', text: `Proposed $${targetUnitPriceUsd.toFixed(2)}/pc — ${note}`, at: 'Just now' },
            ],
          }
        : r
    );
    return [...rfqs];
  },

  async getVipDrops(): Promise<VipDropItem[]> {
    await wait();
    return [...vipDrops];
  },

  async toggleHoldDrop(sku: string): Promise<VipDropItem[]> {
    await wait(140);
    vipDrops = vipDrops.map((d) =>
      d.sku === sku ? { ...d, heldByBuyer: !d.heldByBuyer, holdExpiresIn: !d.heldByBuyer ? '23h 59m' : '24h 00m' } : d
    );
    return [...vipDrops];
  },

  async getWatchlist(): Promise<WatchlistRule[]> {
    await wait(60);
    return [...watchlist];
  },

  async addWatchlistRule(rule: Omit<WatchlistRule, 'id'>): Promise<WatchlistRule[]> {
    await wait(120);
    watchlist = [{ id: `wr-${Date.now()}`, ...rule }, ...watchlist];
    return [...watchlist];
  },

  async deleteWatchlistRule(id: string): Promise<WatchlistRule[]> {
    watchlist = watchlist.filter((w) => w.id !== id);
    return [...watchlist];
  },

  async getInspections(): Promise<QcInspectionReport[]> {
    await wait();
    return [...inspections];
  },

  async reviewInspection(id: string, decision: 'approved' | 'flagged', note: string): Promise<QcInspectionReport[]> {
    await wait(180);
    inspections = inspections.map((ins) =>
      ins.id === id ? { ...ins, buyerApproval: decision, buyerNote: note } : ins
    );
    return [...inspections];
  },

  async getDocuments(): Promise<FinancialDocument[]> {
    await wait();
    return [...documents];
  },

  async uploadPaymentProof(docId: string, fileName: string): Promise<FinancialDocument[]> {
    await wait(240);
    documents = documents.map((d) =>
      d.id === docId ? { ...d, paymentStatus: 'Verifying Proof', proofFileName: fileName } : d
    );
    return [...documents];
  },

  async getSettings(): Promise<BuyerCompanySettings> {
    await wait();
    return structuredClone(settings);
  },

  async updateSettings(patch: Partial<BuyerCompanySettings>): Promise<BuyerCompanySettings> {
    await wait(160);
    settings = { ...settings, ...patch };
    return structuredClone(settings);
  },

  async addAddress(addr: Omit<ConsigneeAddress, 'id'>): Promise<BuyerCompanySettings> {
    await wait(140);
    const next: ConsigneeAddress = { id: `addr-${Date.now()}`, ...addr };
    settings.addresses = addr.isDefault
      ? [next, ...settings.addresses.map((a) => ({ ...a, isDefault: false }))]
      : [...settings.addresses, next];
    return structuredClone(settings);
  },

  async scheduleDhakaVisit(trip: Omit<DhakaVisitTrip, 'id' | 'status' | 'chauffeurNote' | 'visaLetterReady'>): Promise<BuyerCompanySettings> {
    await wait(160);
    settings.visits = [
      {
        id: `vis-${Date.now()}`,
        ...trip,
        status: 'Itinerary Reviewing',
        chauffeurNote: 'Uttara VIP Hospitality Desk assigning DAC airport chauffeur',
        visaLetterReady: false,
      },
      ...settings.visits,
    ];
    return structuredClone(settings);
  },

  async inviteTeamMember(member: Omit<TeamMember, 'id' | 'status'>): Promise<BuyerCompanySettings> {
    await wait(140);
    settings.team = [...settings.team, { id: `tm-${Date.now()}`, ...member, status: 'Invited' }];
    return structuredClone(settings);
  },
};
