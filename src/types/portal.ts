export type PortalOrderStatus = 'staging' | 'qc' | 'in_transit' | 'delivered';

export interface OrderMilestoneLog {
  step: number;
  label: string;
  completedAt: string | null;
  officer?: string;
  artifact?: string;
}

export interface OrderLineItem {
  sku: string;
  brand: string;
  title: string;
  quantity: number;
  cartons: number;
  unitPriceUsd: number;
  sizeRatio: string;
}

export interface PortalOrderDetail {
  id: string;
  date: string;
  type: 'Stock Lot Consolidation' | 'Custom OEM Production';
  status: PortalOrderStatus;
  statusLabel: string;
  currentStep: number; // 1..10
  totalUsd: number;
  totalPieces: number;
  totalCbm: number;
  totalWeightKg: number;
  freightMode: '20ft FCL' | '40ft FCL' | 'Sea LCL' | 'Air Express';
  originPort: string;
  destinationPort: string;
  vesselOrFlight: string;
  blOrAwbNumber: string;
  etaDate: string;
  items: OrderLineItem[];
  milestones: OrderMilestoneLog[];
}

export type RfqRecordStatus = 'under_review' | 'quote_ready' | 'negotiating' | 'converted' | 'expired';

export interface PortalRfqRecord {
  id: string;
  createdAt: string;
  title: string;
  sourcingType: 'Stock Lots' | 'Custom OEM' | 'Buying Agent';
  status: RfqRecordStatus;
  quantity: number;
  offeredUnitPriceUsd: number;
  targetUnitPriceUsd?: number;
  estCbm: number;
  labelStatus: string;
  incoterm: string;
  validHoursLeft: number;
  merchandiserNote: string;
  oemSamplingStage?: number; // 1..5 for Custom OEM
  counterHistory: { by: 'Buyer' | 'Ayaan Desk'; text: string; at: string }[];
}

export interface VipDropItem {
  sku: string;
  brand: string;
  title: string;
  category: string;
  gsm: string;
  designType: 'ORIGINAL' | 'MASTER COPY';
  moq: number;
  availableStock: number;
  unitPriceUsd: number;
  fullLotPriceUsd: number;
  unitCbm: number;
  image: string;
  earlyAccessHoursLeft: number;
  heldByBuyer: boolean;
  holdExpiresIn: string;
  warehouseNote: string;
}

export interface WatchlistRule {
  id: string;
  brand: string;
  category: string;
  maxUnitUsd: number;
  channel: 'WhatsApp + Email' | 'WhatsApp Only' | 'Email Only';
}

export interface QcCheckpoint {
  label: string;
  result: 'Pass' | 'Pending';
  detail: string;
}

export interface QcInspectionReport {
  id: string;
  orderId: string;
  date: string;
  inspector: string;
  standard: string;
  sampleSize: number;
  majorDefects: number;
  minorDefects: number;
  buyerApproval: 'pending' | 'approved' | 'flagged';
  buyerNote?: string;
  checkpoints: QcCheckpoint[];
  photos: { url: string; caption: string }[];
}

export type DocCategory = 'PI' | 'CI' | 'PL' | 'BL_AWB' | 'CO_GSP' | 'RECEIPT';

export interface FinancialDocument {
  id: string;
  docNumber: string;
  orderId: string;
  category: DocCategory;
  title: string;
  issueDate: string;
  amountUsd?: number;
  paymentStatus: 'Paid' | '30% Deposit Paid' | 'L/C Opened' | 'Pending Wire' | 'Verifying Proof' | 'Issued';
  proofFileName?: string;
}

export interface PortalNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  href: string;
  unread: boolean;
  tone: 'emerald' | 'indigo' | 'amber';
}

export interface ConsigneeAddress {
  id: string;
  label: string;
  consigneeName: string;
  portOrCity: string;
  country: string;
  brokerContact: string;
  isDefault: boolean;
}

export interface DhakaVisitTrip {
  id: string;
  arrivalDate: string;
  departureDate: string;
  visitors: number;
  status: 'Confirmed · Visa Issued' | 'Itinerary Reviewing';
  chauffeurNote: string;
  visaLetterReady: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Purchasing Manager' | 'Finance Officer' | 'QC Officer';
  status: 'Active' | 'Invited';
}

export interface BuyerCompanySettings {
  companyName: string;
  businessType: string;
  vatOrEori: string;
  country: string;
  kycStatus: 'Verified Importer' | 'Under Review';
  defaultIncoterm: 'FOB Chattogram' | 'CIF' | 'DDP' | 'EXW';
  whatsappAlerts: boolean;
  emailAlerts: boolean;
  twoFactorEnabled: boolean;
  addresses: ConsigneeAddress[];
  visits: DhakaVisitTrip[];
  team: TeamMember[];
}
