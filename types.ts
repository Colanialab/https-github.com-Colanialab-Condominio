
export interface Owner {
  id: string;
  name: string;
  unit: string;
  millesimi: number;
  email: string;
  phone: string;
}

export interface Payment {
  id: string;
  ownerId: string;
  amount: number;
  date: string;
  type: 'Quota' | 'Straordinario';
  description: string;
}

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number; 
  withholdingAmount?: number;
  netAmount?: number;
  supplierName?: string;
  supplierVat?: string;
  date: string;
  dueDate?: string;
  paid: boolean;
  withholdingPaid?: boolean;
  divisionType: 'Millesimi' | 'Equally';
}

export interface LegalNotice {
  id: string;
  protocolNumber: string;
  recipientId: string; // ID Condomino
  subject: string;
  content: string;
  date: string;
  type: 'Convocazione' | 'Verbale' | 'Diffida' | 'Circolare';
  status: 'Inviata' | 'Consegnata' | 'Letta';
}

export interface Supplier {
  id: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  vatNumber?: string;
  notes?: string;
}

export interface InsurancePolicy {
  id: string;
  providerName: string;
  policyNumber: string;
  type: string;
  annualPremium: number;
  startDate: string;
  expiryDate: string;
  status: 'Attiva' | 'Scaduta' | 'In Rinnovo';
  notes?: string;
}

export interface ExternalInteraction {
  id: string;
  entityId?: string; // ID fornitore o assicurazione (opzionale se non censito)
  entityName: string; // fallback nome
  type: 'Email' | 'Telefono' | 'Incontro' | 'PEC' | 'Altro';
  subject: string;
  notes: string;
  date: string;
  attachments?: string[];
}

export interface TaxPayment {
  id: string;
  expenseId: string;
  taxCode: string; 
  amount: number;
  paymentDate: string;
  period: string; 
}

export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  data: string; 
}

export interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  type: 'Deadline' | 'Maintenance' | 'Meeting';
}

export interface CondoSettings {
  condoName: string;
  logo: string | null;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  taxCode: string;
  administrator: string;
  adminPhone: string;
  iban: string;
  notes: string;
}

export interface DebtAction {
  id: string;
  ownerId: string;
  type: 'Sollecito Bonario' | 'Diffida' | 'Decreto Ingiuntivo' | 'Altro';
  date: string;
  amount: number;
  notes: string;
  documentId?: string;
}

export interface AppState {
  owners: Owner[];
  payments: Payment[];
  expenses: Expense[];
  taxPayments: TaxPayment[];
  legalNotices: LegalNotice[];
  externalInteractions: ExternalInteraction[];
  debtActions?: DebtAction[];
  suppliers?: Supplier[];
  insurancePolicies?: InsurancePolicy[];
  documents: Document[];
  events: Event[];
  settings: CondoSettings;
  regulation?: string;
}
