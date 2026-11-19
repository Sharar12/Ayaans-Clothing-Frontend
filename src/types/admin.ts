export type AdminRole = 'Owner' | 'Merchandiser' | 'Warehouse' | 'QC Officer' | 'Accounts';

export type EntityKey =
  | 'items'
  | 'categories'
  | 'brands'
  | 'warehouses'
  | 'factories'
  | 'factory_orders'
  | 'stock_movements'
  | 'buyers'
  | 'accounts'
  | 'expenses'
  | 'staff'
  | 'licenses_faqs';

export interface StaffSession {
  name: string;
  email: string;
  role: AdminRole;
}

export interface CategoryRecord {
  id: string;
  name: string;
  audience: 'Men' | 'Women' | 'Boys' | 'Girls' | 'Unisex' | 'All';
  active: boolean;
}

export interface BrandRecord {
  id: string;
  name: string;
  country: string;
  isOwnBrand: boolean;
  active: boolean;
}

export interface ItemRecord {
  id: string;
  code: string;
  name: string;
  brand: string;
  category: string;
  audience: 'Men' | 'Women' | 'Boys' | 'Girls' | 'Unisex';
  authenticity: 'Original' | 'Master Copy';
  sizes: string;
  colors: string;
  minQty: number;
  stock: number;
  priceUsd: number;
  bulkPriceUsd: number;
  fullStockPriceUsd: number;
  boxWeightKg: number;
  photo: string;
  isNew: boolean;
  active: boolean;
}

export type StaffRole = AdminRole;

export interface WarehouseShelfLot {
  id: string;
  itemId: string;
  itemName: string;
  brand: string;
  shelf: string;
  boxes: number;
  pieces: number;
  daysStored: number;
  readyForTruck: boolean;
}

export interface WarehouseRecord {
  id: string;
  name: string;
  location: string;
  shelfCode: string;
  manager: string;
  phone: string;
  boxesStored: number;
  capacityBoxes?: number;
  storedLots?: WarehouseShelfLot[];
  active: boolean;
}

export interface FactoryRecord {
  id: string;
  name: string;
  area: string;
  specialty: string;
  monthlyCapacity: number;
  busyPercent?: number;
  rating?: number;
  safetyBadges?: string[];
  manager: string;
  phone: string;
  active: boolean;
}

export interface FactoryOrderRecord {
  id: string;
  factoryName: string;
  itemName: string;
  pieces: number;
  costPerPieceUsd: number;
  totalCostUsd: number;
  paidUsd: number;
  stage: 'Ordered' | 'Sewing' | 'Ready' | 'Arrived';
  dueDate: string;
}

export interface StockMovementRecord {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  warehouseName: string;
  direction: 'Stock In' | 'Stock Out' | 'Transfer';
  quantity: number;
  reason: string;
  routeType?: 'W-to-W' | 'F-to-W' | 'W-to-F' | string;
  fromLabel?: string;
  toLabel?: string;
  boxes?: number;
  status?: 'In Transit' | 'Received' | 'Completed' | string;
}

export interface BuyerRecord {
  id: string;
  company: string;
  contactName: string;
  email: string;
  whatsapp: string;
  country: string;
  address: string;
  isVip: boolean;
  active: boolean;
}

export interface BankAccountRecord {
  id: string;
  name: string;
  accountType: 'USD Export Bank' | 'Local Taka Bank' | 'Office Cash';
  bankOrLocation: string;
  balanceUsd: number;
  active: boolean;
}

export interface ExpenseRecord {
  id: string;
  isoDate: string; // YYYY-MM-DD for Date-Range P&L Reports
  date: string;
  title: string;
  category: 'Factory Payout' | 'Shipping & Truck' | 'Staff Salary' | 'Office & Utility';
  accountId: string;
  amountUsd: number;
  status: 'Paid' | 'Due Soon';
}

export interface StaffRecord {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  attendance: 'Present' | 'Factory Visit' | 'Leave';
  monthlySalaryBdt: number;
  paidThisMonth: boolean;
  active: boolean;
}

export interface LicenseFaqRecord {
  id: string;
  entryType: 'Official License' | 'Buyer FAQ';
  titleOrQuestion: string;
  detailOrAnswer: string;
  regOrValidUntil: string;
  active: boolean;
}

export type OrderStepStatus = 'Pending' | 'Packing' | 'Quality Check' | 'Shipped' | 'Delivered';

export interface PaymentEntry {
  id: string;
  date: string;
  amountUsd: number;
  accountId: string;
  method: string;
  note: string;
}

export interface UnifiedOrder {
  id: string;
  orderCode: string;
  isoDate: string; // YYYY-MM-DD
  date: string;
  dueDate: string;
  buyerCompany: string;
  buyerWhatsapp: string;
  itemsSummary: string;
  totalPieces: number;
  totalUsd: number;
  paidUsd: number;
  status: OrderStepStatus;
  shippingMode: 'Sea Container' | 'Shared Sea Box' | 'Air Express';
  carrierName: string;
  trackingNumber: string;
  destination: string;
  arrivalDate: string;
  paymentStatus: 'Unpaid' | 'Partial Paid' | 'Bank Slip Uploaded' | 'Paid';
  bankSlipFile?: string;
  payments: PaymentEntry[];
  qualityPassed: boolean;
  qualityPhotos: { url: string; caption: string }[];
}

export interface UnifiedInboxItem {
  id: string;
  type: 'Price Quote' | 'Dhaka Visit' | 'Contact Message';
  date: string;
  buyerCompany: string;
  contactName: string;
  whatsapp: string;
  country: string;
  subject: string;
  message: string;
  quantity?: number;
  targetPriceUsd?: number;
  offeredPriceUsd?: number;
  visitDates?: string;
  guests?: number;
  status: 'New' | 'Replied' | 'Converted to Order' | 'Confirmed';
}

export interface UnifiedSiteSettings {
  companyName: string;
  exportEmail: string;
  whatsappPrimary: string;
  whatsappSecondary: string;
  officeAddress: string;
  bankBeneficiary: string;
  bankName: string;
  bankSwift: string;
  usdToBdtRate: number;
}

export interface ActivityLogItem {
  id: string;
  time: string;
  actor: string;
  text: string;
}

export interface ProfitLossSummary {
  fromDate: string;
  toDate: string;
  salesUsd: number;
  cashCollectedUsd: number;
  factoryPayoutsUsd: number;
  shippingUsd: number;
  salariesUsd: number;
  officeUsd: number;
  totalExpensesUsd: number;
  netProfitUsd: number;
  usdToBdtRate: number;
  rows: { id: string; date: string; type: string; description: string; amountUsd: number; amountBdt: number }[];
}

export interface EntityRecordMap {
  items: ItemRecord;
  categories: CategoryRecord;
  brands: BrandRecord;
  warehouses: WarehouseRecord;
  factories: FactoryRecord;
  factory_orders: FactoryOrderRecord;
  stock_movements: StockMovementRecord;
  buyers: BuyerRecord;
  accounts: BankAccountRecord;
  expenses: ExpenseRecord;
  staff: StaffRecord;
  licenses_faqs: LicenseFaqRecord;
}
