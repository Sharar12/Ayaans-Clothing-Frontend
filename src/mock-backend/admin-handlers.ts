import type {
  ActivityLogItem,
  EntityKey,
  EntityRecordMap,
  ProfitLossSummary,
  UnifiedInboxItem,
  UnifiedOrder,
  UnifiedSiteSettings,
} from '@/types/admin';
import {
  ENTITY_ID_PREFIX,
  ENTITY_LABELS,
  INITIAL_ACTIVITY,
  INITIAL_INBOX,
  INITIAL_ORDERS,
  INITIAL_RECORDS,
  INITIAL_SETTINGS,
  MONTHLY_CHART_SEED,
} from './admin-data';

const wait = (ms = 60) => new Promise((r) => setTimeout(r, ms));

const db: { [K in EntityKey]: EntityRecordMap[K][] } = structuredClone(INITIAL_RECORDS);
let orders: UnifiedOrder[] = structuredClone(INITIAL_ORDERS);
let inbox: UnifiedInboxItem[] = structuredClone(INITIAL_INBOX);
let settings: UnifiedSiteSettings = structuredClone(INITIAL_SETTINGS);
let activity: ActivityLogItem[] = structuredClone(INITIAL_ACTIVITY);

function nextReadableId(prefix: string, existing: { id: string }[]): string {
  const nums = existing
    .map((r) => Number(r.id.split('-')[1]))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

function logAction(actor: string, text: string) {
  activity = [{ id: nextReadableId('ACT', activity), time: 'Just now', actor, text }, ...activity.slice(0, 14)];
}

function adjustAccountBalance(accountId: string, deltaUsd: number) {
  db.accounts = db.accounts.map((acc) =>
    acc.id === accountId ? { ...acc, balanceUsd: Math.round((acc.balanceUsd + deltaUsd) * 100) / 100 } : acc
  );
}

export const adminMockBackend = {
  async getOverview() {
    await wait();
    const totalSalesUsd = orders.reduce((s, o) => s + o.totalUsd, 0);
    const totalExpensesUsd = db.expenses.reduce((s, e) => s + e.amountUsd, 0);
    const netProfitUsd = totalSalesUsd - totalExpensesUsd;
    const buyersOweUsUsd = orders.reduce((s, o) => s + Math.max(0, o.totalUsd - o.paidUsd), 0);
    const weOweFactoriesUsd = db.factory_orders.reduce((s, fo) => s + Math.max(0, fo.totalCostUsd - fo.paidUsd), 0);
    const totalStockPcs = db.items.filter((i) => i.active).reduce((s, i) => s + i.stock, 0);
    const lowStockItems = db.items.filter((i) => i.stock <= 150);

    const statusCounts = ['Pending', 'Packing', 'Quality Check', 'Shipped', 'Delivered'].map((status) => ({
      status,
      count: orders.filter((o) => o.status === status).length,
    }));

    const categoryStock = db.categories.slice(0, 5).map((cat) => ({
      name: cat.name,
      pieces: db.items.filter((i) => i.category === cat.name).reduce((s, i) => s + i.stock, 0),
    }));

    return {
      totalSalesUsd,
      totalExpensesUsd,
      netProfitUsd,
      buyersOweUsUsd,
      weOweFactoriesUsd,
      totalStockPcs,
      activeOrdersCount: orders.filter((o) => o.status !== 'Delivered').length,
      newInboxCount: inbox.filter((i) => i.status === 'New').length,
      pendingBankSlips: orders.filter((o) => o.paymentStatus === 'Bank Slip Uploaded').length,
      usdToBdtRate: settings.usdToBdtRate,
      accounts: structuredClone(db.accounts),
      monthlyChart: MONTHLY_CHART_SEED,
      statusCounts,
      categoryStock,
      lowStockItems,
      activity: [...activity],
    };
  },

  async getProfitLossReport(fromDate: string, toDate: string): Promise<ProfitLossSummary> {
    await wait(90);
    const matchedOrders = orders.filter((o) => o.isoDate >= fromDate && o.isoDate <= toDate);
    const matchedExpenses = db.expenses.filter((e) => e.isoDate >= fromDate && e.isoDate <= toDate);

    const salesUsd = matchedOrders.reduce((s, o) => s + o.totalUsd, 0);
    const cashCollectedUsd = matchedOrders.reduce((s, o) => s + o.paidUsd, 0);
    const sumCat = (cat: EntityRecordMap['expenses']['category']) =>
      matchedExpenses.filter((e) => e.category === cat).reduce((s, e) => s + e.amountUsd, 0);

    const factoryPayoutsUsd = sumCat('Factory Payout');
    const shippingUsd = sumCat('Shipping & Truck');
    const salariesUsd = sumCat('Staff Salary');
    const officeUsd = sumCat('Office & Utility');
    const totalExpensesUsd = factoryPayoutsUsd + shippingUsd + salariesUsd + officeUsd;
    const netProfitUsd = salesUsd - totalExpensesUsd;
    const fx = settings.usdToBdtRate;

    const rows = [
      ...matchedOrders.map((o) => ({
        id: o.id,
        date: o.isoDate,
        type: 'Sales (+)',
        description: `${o.buyerCompany} — ${o.itemsSummary}`,
        amountUsd: o.totalUsd,
        amountBdt: Math.round(o.totalUsd * fx),
      })),
      ...matchedExpenses.map((e) => ({
        id: e.id,
        date: e.isoDate,
        type: `Expense (${e.category})`,
        description: e.title,
        amountUsd: -e.amountUsd,
        amountBdt: -Math.round(e.amountUsd * fx),
      })),
    ].sort((a, b) => b.date.localeCompare(a.date));

    return {
      fromDate,
      toDate,
      salesUsd,
      cashCollectedUsd,
      factoryPayoutsUsd,
      shippingUsd,
      salariesUsd,
      officeUsd,
      totalExpensesUsd,
      netProfitUsd,
      usdToBdtRate: fx,
      rows,
    };
  },

  async listRecords<K extends EntityKey>(entity: K): Promise<EntityRecordMap[K][]> {
    await wait();
    return structuredClone(db[entity]);
  },

  async createRecord<K extends EntityKey>(entity: K, payload: Omit<EntityRecordMap[K], 'id'>): Promise<EntityRecordMap[K][]> {
    await wait(100);
    const id = nextReadableId(ENTITY_ID_PREFIX[entity], db[entity]);
    const created = { ...payload, id } as EntityRecordMap[K];
    (db[entity] as any) = [created, ...db[entity]];

    if (entity === 'stock_movements') {
      const mv = created as EntityRecordMap['stock_movements'];
      db.items = db.items.map((item) => {
        if (item.id !== mv.itemId) return item;
        const delta = mv.direction === 'Stock In' ? mv.quantity : mv.direction === 'Stock Out' ? -mv.quantity : 0;
        return { ...item, stock: Math.max(0, item.stock + delta) };
      });
      logAction('Staff', `${id}: ${mv.direction} (${mv.quantity} pcs) for ${mv.itemName}`);
    } else if (entity === 'expenses') {
      const exp = created as EntityRecordMap['expenses'];
      if (exp.status === 'Paid' && exp.accountId) adjustAccountBalance(exp.accountId, -exp.amountUsd);
      logAction('Accounts', `Logged Expense ${id} ($${exp.amountUsd.toLocaleString()})`);
    } else {
      logAction('Staff', `Created ${id} in ${ENTITY_LABELS[entity]}`);
    }
    return structuredClone(db[entity]);
  },

  async updateRecord<K extends EntityKey>(entity: K, id: string, payload: Partial<EntityRecordMap[K]>): Promise<EntityRecordMap[K][]> {
    await wait(90);
    (db[entity] as any) = db[entity].map((row) => (row.id === id ? { ...row, ...payload, id } : row));
    logAction('Staff', `Updated ${id} in ${ENTITY_LABELS[entity]}`);
    return structuredClone(db[entity]);
  },

  async deleteRecord<K extends EntityKey>(entity: K, id: string): Promise<EntityRecordMap[K][]> {
    await wait(80);
    (db[entity] as any) = db[entity].filter((row) => row.id !== id);
    logAction('Staff', `Deleted ${id} from ${ENTITY_LABELS[entity]}`);
    return structuredClone(db[entity]);
  },

  async getOrdersBundle() {
    await wait();
    return {
      orders: structuredClone(orders),
      factoryOrders: structuredClone(db.factory_orders),
      accounts: structuredClone(db.accounts),
      expenses: structuredClone(db.expenses),
      usdToBdtRate: settings.usdToBdtRate,
    };
  },

  async updateOrder(id: string, patch: Partial<UnifiedOrder>): Promise<UnifiedOrder[]> {
    await wait(100);
    orders = orders.map((o) => (o.id === id ? { ...o, ...patch } : o));
    logAction('Staff', `Updated Order ${id}`);
    return structuredClone(orders);
  },

  async recordBuyerPayment(orderId: string, amountUsd: number, accountId: string, method: string, note: string) {
    await wait(120);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    orders = orders.map((o) => {
      if (o.id !== orderId) return o;
      const nextPaid = Math.min(o.totalUsd, o.paidUsd + amountUsd);
      const nextStatus: UnifiedOrder['paymentStatus'] =
        nextPaid >= o.totalUsd ? 'Paid' : nextPaid > 0 ? 'Partial Paid' : 'Unpaid';
      return {
        ...o,
        paidUsd: nextPaid,
        paymentStatus: nextStatus,
        payments: [
          { id: `PAY-${Date.now().toString().slice(-3)}`, date: today, amountUsd, accountId, method, note },
          ...o.payments,
        ],
      };
    });
    adjustAccountBalance(accountId, amountUsd);
    logAction('Accounts', `Received +$${amountUsd.toLocaleString()} for ${orderId} into ${accountId}`);
    return { orders: structuredClone(orders), accounts: structuredClone(db.accounts) };
  },

  async recordFactoryPayment(foId: string, amountUsd: number, accountId: string, note: string) {
    await wait(120);
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    let factoryName = '';
    db.factory_orders = db.factory_orders.map((fo) => {
      if (fo.id !== foId) return fo;
      factoryName = fo.factoryName;
      return { ...fo, paidUsd: Math.min(fo.totalCostUsd, fo.paidUsd + amountUsd) };
    });
    adjustAccountBalance(accountId, -amountUsd);
    const expId = nextReadableId('EXP', db.expenses);
    db.expenses = [
      {
        id: expId,
        isoDate: todayIso,
        date: todayLabel,
        title: `Factory Payout — ${factoryName} (${foId}) ${note ? `· ${note}` : ''}`,
        category: 'Factory Payout',
        accountId,
        amountUsd,
        status: 'Paid',
      },
      ...db.expenses,
    ];
    logAction('Accounts', `Paid -$${amountUsd.toLocaleString()} to ${factoryName} (${foId}) from ${accountId}`);
    return {
      factoryOrders: structuredClone(db.factory_orders),
      accounts: structuredClone(db.accounts),
      expenses: structuredClone(db.expenses),
    };
  },

  async advanceFactoryOrder(id: string) {
    await wait(80);
    const seq: EntityRecordMap['factory_orders']['stage'][] = ['Ordered', 'Sewing', 'Ready', 'Arrived'];
    db.factory_orders = db.factory_orders.map((fo) => {
      if (fo.id !== id) return fo;
      return { ...fo, stage: seq[Math.min(seq.length - 1, seq.indexOf(fo.stage) + 1)] };
    });
    logAction('Staff', `Advanced Factory Order ${id}`);
    return structuredClone(db.factory_orders);
  },

  async markExpensePaid(id: string) {
    await wait(80);
    const target = db.expenses.find((e) => e.id === id);
    if (target && target.status !== 'Paid') adjustAccountBalance(target.accountId, -target.amountUsd);
    db.expenses = db.expenses.map((e) => (e.id === id ? { ...e, status: 'Paid' } : e));
    logAction('Accounts', `Marked Expense ${id} as Paid`);
    return { expenses: structuredClone(db.expenses), accounts: structuredClone(db.accounts) };
  },

  async getInbox(): Promise<UnifiedInboxItem[]> {
    await wait();
    return structuredClone(inbox);
  },

  async replyInbox(id: string, status: UnifiedInboxItem['status'], offeredPriceUsd?: number): Promise<UnifiedInboxItem[]> {
    await wait(100);
    inbox = inbox.map((i) => (i.id === id ? { ...i, status, offeredPriceUsd: offeredPriceUsd ?? i.offeredPriceUsd } : i));
    logAction('Desk', `Updated ${id} (${status})`);
    return structuredClone(inbox);
  },

  async convertQuoteToOrder(id: string): Promise<{ inbox: UnifiedInboxItem[]; newOrderCode: string }> {
    await wait(130);
    const quote = inbox.find((i) => i.id === id);
    const code = nextReadableId('ORD', orders);
    const todayIso = new Date().toISOString().slice(0, 10);
    if (quote) {
      const unit = quote.offeredPriceUsd || quote.targetPriceUsd || 5;
      const qty = quote.quantity || 500;
      orders = [
        {
          id: code,
          orderCode: code,
          isoDate: todayIso,
          date: 'Today',
          dueDate: 'In 14 Days',
          buyerCompany: quote.buyerCompany,
          buyerWhatsapp: quote.whatsapp,
          itemsSummary: quote.subject,
          totalPieces: qty,
          totalUsd: Math.round(qty * unit),
          paidUsd: 0,
          status: 'Pending',
          shippingMode: 'Shared Sea Box',
          carrierName: 'Pending Booking',
          trackingNumber: 'Pending',
          destination: quote.country,
          arrivalDate: 'TBD',
          paymentStatus: 'Unpaid',
          payments: [],
          qualityPassed: false,
          qualityPhotos: [],
        },
        ...orders,
      ];
      inbox = inbox.map((i) => (i.id === id ? { ...i, status: 'Converted to Order' } : i));
      logAction('Desk', `Converted ${id} into Order ${code}`);
    }
    return { inbox: structuredClone(inbox), newOrderCode: code };
  },

  async getSettings(): Promise<UnifiedSiteSettings> {
    await wait(40);
    return structuredClone(settings);
  },

  async saveSettings(next: UnifiedSiteSettings): Promise<UnifiedSiteSettings> {
    await wait(90);
    settings = structuredClone(next);
    logAction('Owner', `Saved global website & bank settings`);
    return structuredClone(settings);
  },

  async sendReceiveTransfer(payload: {
    fromType: 'W' | 'F';
    fromId: string;
    toType: 'W' | 'F';
    toId: string;
    itemId: string;
    shelf: string;
    boxes: number;
    pieces: number;
    reason: string;
  }) {
    await wait(120);
    const item = db.items.find((i) => i.id === payload.itemId);
    const fromLabel =
      payload.fromType === 'W'
        ? db.warehouses.find((w) => w.id === payload.fromId)?.name || payload.fromId
        : db.factories.find((f) => f.id === payload.fromId)?.name || payload.fromId;
    const toLabel =
      payload.toType === 'W'
        ? db.warehouses.find((w) => w.id === payload.toId)?.name || payload.toId
        : db.factories.find((f) => f.id === payload.toId)?.name || payload.toId;

    const routeType = `${payload.fromType} → ${payload.toType}`;
    const movId = nextReadableId('MOV', db.stock_movements);

    db.stock_movements = [
      {
        id: movId,
        date: 'Today',
        itemId: payload.itemId,
        itemName: item?.name || 'Stock Lot Item',
        warehouseName: `${fromLabel} → ${toLabel}`,
        direction: 'Transfer',
        quantity: payload.pieces,
        reason: payload.reason || `Transfer from ${fromLabel} to ${toLabel}`,
        routeType,
        fromLabel,
        toLabel,
        boxes: payload.boxes,
        status: payload.toType === 'W' ? 'In Transit' : 'Completed',
      },
      ...db.stock_movements,
    ];

    if (payload.toType === 'W') {
      const wh = db.warehouses.find((w) => w.id === payload.toId);
      if (wh && item) {
        const lotId = `LOT-${Date.now().toString().slice(-3)}`;
        wh.storedLots = [
          {
            id: lotId,
            itemId: item.id,
            itemName: item.name,
            brand: item.brand,
            shelf: payload.shelf || wh.shelfCode,
            boxes: payload.boxes,
            pieces: payload.pieces,
            daysStored: 0,
            readyForTruck: false,
          },
          ...(wh.storedLots || []),
        ];
        wh.boxesStored = wh.storedLots.reduce((s, l) => s + l.boxes, 0);
      }
    }

    logAction('Operations', `Dispatched ${payload.boxes} boxes from ${fromLabel} to ${toLabel}`);
    return this.getOperationsBundle();
  },

  async markMovementReceived(movId: string) {
    await wait(80);
    db.stock_movements = db.stock_movements.map((m) =>
      m.id === movId ? { ...m, status: 'Received' } : m
    );
    logAction('Operations', `Confirmed receipt of transfer ${movId}`);
    return this.getOperationsBundle();
  },

  async getOperationsBundle() {
    await wait();
    return {
      warehouses: structuredClone(db.warehouses),
      factories: structuredClone(db.factories),
      factoryOrders: structuredClone(db.factory_orders),
      items: structuredClone(db.items),
      accounts: structuredClone(db.accounts),
      stockMovements: structuredClone(db.stock_movements),
    };
  },

  async addWarehouseStockIn(whId: string, itemId: string, shelf: string, boxes: number, pieces: number, reason: string) {
    await wait(110);
    const item = db.items.find((i) => i.id === itemId);
    const wh = db.warehouses.find((w) => w.id === whId);
    if (item && wh) {
      const lotId = `LOT-${Date.now().toString().slice(-3)}`;
      wh.storedLots = [
        { id: lotId, itemId: item.id, itemName: item.name, brand: item.brand, shelf, boxes, pieces, daysStored: 0, readyForTruck: false },
        ...(wh.storedLots || []),
      ];
      wh.boxesStored = wh.storedLots.reduce((s, l) => s + l.boxes, 0);
      item.stock += pieces;
      const movId = nextReadableId('MOV', db.stock_movements);
      db.stock_movements = [
        { id: movId, date: 'Today', itemId: item.id, itemName: item.name, warehouseName: wh.name, direction: 'Stock In', quantity: pieces, reason: reason || `Received at ${shelf}` },
        ...db.stock_movements,
      ];
      logAction('Warehouse', `Received +${boxes} boxes (${pieces} pcs) of ${item.id} into ${wh.id}`);
    }
    return this.getOperationsBundle();
  },

  async toggleLotReadyForTruck(whId: string, lotId: string) {
    await wait(70);
    const wh = db.warehouses.find((w) => w.id === whId);
    if (wh?.storedLots) {
      wh.storedLots = wh.storedLots.map((l) => (l.id === lotId ? { ...l, readyForTruck: !l.readyForTruck } : l));
    }
    return this.getOperationsBundle();
  },

  async transferWarehouseLot(fromWhId: string, lotId: string, toWhId: string) {
    await wait(110);
    const fromWh = db.warehouses.find((w) => w.id === fromWhId);
    const toWh = db.warehouses.find((w) => w.id === toWhId);
    const lot = fromWh?.storedLots?.find((l) => l.id === lotId);
    if (fromWh && toWh && lot && fromWhId !== toWhId) {
      fromWh.storedLots = (fromWh.storedLots || []).filter((l) => l.id !== lotId);
      fromWh.boxesStored = fromWh.storedLots.reduce((s, l) => s + l.boxes, 0);
      toWh.storedLots = [{ ...lot, shelf: `${toWh.shelfCode} · Transferred` }, ...(toWh.storedLots || [])];
      toWh.boxesStored = toWh.storedLots.reduce((s, l) => s + l.boxes, 0);
      const movId = nextReadableId('MOV', db.stock_movements);
      db.stock_movements = [
        { id: movId, date: 'Today', itemId: lot.itemId, itemName: lot.itemName, warehouseName: `${fromWh.id} → ${toWh.id}`, direction: 'Transfer', quantity: lot.pieces, reason: `Moved ${lot.boxes} boxes to ${toWh.name}` },
        ...db.stock_movements,
      ];
      logAction('Warehouse', `Transferred ${lot.boxes} boxes (${lot.brand}) from ${fromWh.id} to ${toWh.id}`);
    }
    return this.getOperationsBundle();
  },

  async dispatchWarehouseLot(whId: string, lotId: string) {
    await wait(110);
    const wh = db.warehouses.find((w) => w.id === whId);
    const lot = wh?.storedLots?.find((l) => l.id === lotId);
    if (wh && lot) {
      wh.storedLots = (wh.storedLots || []).filter((l) => l.id !== lotId);
      wh.boxesStored = wh.storedLots.reduce((s, l) => s + l.boxes, 0);
      db.items = db.items.map((it) => (it.id === lot.itemId ? { ...it, stock: Math.max(0, it.stock - lot.pieces) } : it));
      const movId = nextReadableId('MOV', db.stock_movements);
      db.stock_movements = [
        { id: movId, date: 'Today', itemId: lot.itemId, itemName: lot.itemName, warehouseName: wh.name, direction: 'Stock Out', quantity: lot.pieces, reason: `Loaded ${lot.boxes} boxes onto Chattogram port truck` },
        ...db.stock_movements,
      ];
      logAction('Warehouse', `Dispatched ${lot.boxes} boxes (${lot.itemName}) from ${wh.id} to port truck`);
    }
    return this.getOperationsBundle();
  },

  async updateFactoryBusy(facId: string, busyPercent: number) {
    await wait(60);
    db.factories = db.factories.map((f) => (f.id === facId ? { ...f, busyPercent } : f));
    return this.getOperationsBundle();
  },
};
