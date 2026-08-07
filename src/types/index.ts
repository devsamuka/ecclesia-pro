export type UserRole = 'Administrador' | 'Tesoureiro' | 'Presbítero' | 'Pastor';

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt?: string;
}

export type TransactionType = 'Entrada' | 'Saída';

export type TransactionCategory =
  | 'Dízimo'
  | 'Oferta'
  | 'Apoio Pastoral'
  | 'Cuidado Congregacional'
  | 'Manutenção e Conservação'
  | 'Luz e Água'
  | 'Apoio Missionário'
  | 'Educação Cristã e EBD'
  | 'Ação Social e Diaconia'
  | 'Repasse Presbitério'
  | 'Repasse Sínodo'
  | 'Evento / Acampamento'
  | 'Outros'
  | (string & {});

export type AccountType =
  | 'Conta Dízimos & Ofertas'
  | 'Fundo de Construção'
  | 'Fundo de Concílios & Sociedades'
  | 'Caixa Escolar / EBD'
  | 'Caixa Diaconia';

export type PaymentMethod = 'PIX' | 'Boleto' | 'Transferência' | 'Dinheiro' | 'Cartão';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  memberName?: string;
  memberId?: string;
  isAnonymous?: boolean;
  account: AccountType;
  paymentMethod: PaymentMethod;
  status: 'Concluído' | 'Pendente' | 'Cancelado';
  receiptUrl?: string;
  notes?: string;
  destinationFund?: string;
}

export interface UpcomingBill {
  id: string;
  supplier: string;
  category: TransactionCategory;
  amount: number;
  dueDate: string;
  status: 'A vencer' | 'Hoje' | 'Atrasado' | 'Pago';
  account: AccountType;
  autoPay?: boolean;
}

export interface SuperiorPayment {
  id: string;
  entity: 'Presbitério' | 'Sínodo' | 'Supremo Concílio' | 'TBN / Jubilação';
  description: string;
  dueDate: string;
  paymentDate?: string;
  amount: number;
  targetAmount: number;
  status: 'Pago' | 'Pendente' | 'Parcial';
  receiptNumber?: string;
}

export interface ChurchAccount {
  id: string;
  name: AccountType;
  bankName: string;
  accountNumber: string;
  balance: number;
  previousBalance: number;
  badgeColor: string;
  isDefault?: boolean;
}

export interface Member {
  id: string;
  name: string;
  role: 'Comungante' | 'Não-Comungante' | 'Oficial' | 'Visitante';
  email?: string;
  phone?: string;
  totalTitichedThisYear: number;
  lastTitheDate?: string;
  status: 'Ativo' | 'Inativo';
}

export interface MonthlyBudget {
  id: string;
  category: TransactionCategory;
  budgetedAmount: number;
  actualAmount: number;
  month: string; // e.g. "2026-07"
}

export interface AuditLog {
  id: string;
  user: string;
  role: UserRole;
  action: string;
  timestamp: string;
  details: string;
}

export interface SynodeGoal {
  synodName: string;
  presbyteryName: string;
  currentTransferred: number;
  targetQuota: number;
  percentage: number;
  dueDate: string;
}
