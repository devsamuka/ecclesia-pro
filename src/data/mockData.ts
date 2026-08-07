import {
  ChurchAccount,
  Transaction,
  UpcomingBill,
  SuperiorPayment,
  Member,
  MonthlyBudget,
  SynodeGoal,
} from '../types';

export const INITIAL_CHURCH_NAME = '1ª Igreja Presbiteriana Central';
export const INITIAL_CHURCH_CNPJ = '12.345.678/0001-90';
export const INITIAL_PRESBYTERY_NAME = 'Presbitério Central de SP (PRST)';
export const INITIAL_SYNOD_NAME = 'Sínodo de São Paulo (SSP)';

export const INITIAL_ACCOUNTS: ChurchAccount[] = [
  {
    id: 'acc-1',
    name: 'Conta Dízimos & Ofertas',
    bankName: 'Banco Bradesco (PIX)',
    accountNumber: 'Ag 1234-5 / CC 98760-1',
    balance: 42850.0,
    previousBalance: 38400.0,
    badgeColor: 'teal',
    isDefault: true,
  },
  {
    id: 'acc-2',
    name: 'Fundo de Construção',
    bankName: 'Banco Itaú Unibanco',
    accountNumber: 'Ag 0411 / CC 54321-9',
    balance: 118400.0,
    previousBalance: 112000.0,
    badgeColor: 'emerald',
  },
  {
    id: 'acc-3',
    name: 'Fundo de Concílios & Sociedades',
    bankName: 'Sicoob Credi-Igreja',
    accountNumber: 'Ag 3001 / CC 12890-4',
    balance: 12300.0,
    previousBalance: 11500.0,
    badgeColor: 'cyan',
  },
];

export const INITIAL_SYNOD_GOAL: SynodeGoal = {
  synodName: 'Sínodo de São Paulo (SSP)',
  presbyteryName: 'Presbitério Central de SP (PRST)',
  currentTransferred: 4285.0,
  targetQuota: 4285.0, // 10% de dízimos do mês anterior
  percentage: 100,
  dueDate: '2026-07-31',
};

export const INITIAL_SUPERIOR_PAYMENTS: SuperiorPayment[] = [
  {
    id: 'sup-1',
    entity: 'Presbitério',
    description: 'Repasse Mensal Estatutário IPB (10% Dízimos)',
    dueDate: '2026-07-20',
    paymentDate: '2026-07-18',
    amount: 4285.0,
    targetAmount: 4285.0,
    status: 'Pago',
    receiptNumber: 'PRST-2026-07-884',
  },
  {
    id: 'sup-2',
    entity: 'TBN / Jubilação',
    description: 'Fundo de Jubilação e Assistência Pastoral IPB',
    dueDate: '2026-07-25',
    paymentDate: '2026-07-22',
    amount: 1420.0,
    targetAmount: 1420.0,
    status: 'Pago',
    receiptNumber: 'FJAP-9012',
  },
  {
    id: 'sup-3',
    entity: 'Sínodo',
    description: 'Quota Anual para Acampamento e Missões do Sínodo',
    dueDate: '2026-08-10',
    amount: 850.0,
    targetAmount: 850.0,
    status: 'Pendente',
  },
  {
    id: 'sup-4',
    entity: 'Supremo Concílio',
    description: 'Contribuição Fundo Distrital da Mocidade (UMP)',
    dueDate: '2026-07-15',
    paymentDate: '2026-07-12',
    amount: 450.0,
    targetAmount: 450.0,
    status: 'Pago',
    receiptNumber: 'SC-IPB-2291',
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    type: 'Entrada',
    category: 'Dízimo',
    description: 'Dízimo de João Silva',
    amount: 1500.0,
    date: '2026-07-26',
    memberName: 'João Silva',
    memberId: 'mem-1',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
    destinationFund: 'Caixa Geral',
    notes: 'Comprovante PIX via App Banco Bradesco',
  },
  {
    id: 'tx-102',
    type: 'Entrada',
    category: 'Oferta',
    description: 'Oferta de Culto Matutino (Domingo)',
    amount: 1840.5,
    date: '2026-07-26',
    isAnonymous: true,
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'Dinheiro',
    status: 'Concluído',
    destinationFund: 'Caixa Geral',
    notes: 'Coleta de salva no culto solene',
  },
  {
    id: 'tx-103',
    type: 'Saída',
    category: 'Luz e Água',
    description: 'Pagamento de Luz - CEMIG (Templo Sede)',
    amount: 680.4,
    date: '2026-07-24',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'Boleto',
    status: 'Concluído',
    notes: 'Conta referente a Junho/2026',
  },
  {
    id: 'tx-104',
    type: 'Saída',
    category: 'Apoio Missionário',
    description: 'Sustento Missionário - Pr. Marcos em Moçambique',
    amount: 2500.0,
    date: '2026-07-22',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
    notes: 'Repasse mensal Junta de Missões Nacionais',
  },
  {
    id: 'tx-105',
    type: 'Saída',
    category: 'Repasse Presbitério',
    description: 'Pagamento ao Sínodo & Presbitério (10% Conciliar IPB)',
    amount: 4285.0,
    date: '2026-07-18',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'Transferência',
    status: 'Concluído',
    notes: 'Comprovante repassado ao Tesoureiro do Presbitério',
  },
  {
    id: 'tx-106',
    type: 'Entrada',
    category: 'Dízimo',
    description: 'Dízimo de Maria Oliveira',
    amount: 2200.0,
    date: '2026-07-15',
    memberName: 'Maria Oliveira',
    memberId: 'mem-2',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
    destinationFund: 'Caixa Geral',
  },
  {
    id: 'tx-107',
    type: 'Saída',
    category: 'Apoio Pastoral',
    description: 'Prebenda Pastoral - Pr. Ricardo Santos',
    amount: 6800.0,
    date: '2026-07-05',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
    notes: 'Conforme orçamento aprovado pela Assembleia',
  },
  {
    id: 'tx-108',
    type: 'Entrada',
    category: 'Oferta',
    description: 'Oferta Especial Fundo de Construção',
    amount: 5000.0,
    date: '2026-07-12',
    memberName: 'Dr. Carlos Eduardo',
    memberId: 'mem-3',
    account: 'Fundo de Construção',
    paymentMethod: 'Transferência',
    status: 'Concluído',
    destinationFund: 'Fundo de Construção',
  },
  {
    id: 'tx-109',
    type: 'Saída',
    category: 'Luz e Água',
    description: 'Pagamento de Água - COPASA',
    amount: 320.15,
    date: '2026-07-10',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'Boleto',
    status: 'Concluído',
  },
  {
    id: 'tx-110',
    type: 'Saída',
    category: 'Manutenção e Conservação',
    description: 'Manutenção e Limpeza do Ar Condicionado do Nave',
    amount: 450.0,
    date: '2026-07-08',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
  },
  // --- LANÇAMENTOS DE JUNHO 2026 ---
  {
    id: 'tx-201',
    type: 'Entrada',
    category: 'Dízimo',
    description: 'Dízimo de João Silva',
    amount: 1500.0,
    date: '2026-06-25',
    memberName: 'João Silva',
    memberId: 'mem-1',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
  },
  {
    id: 'tx-202',
    type: 'Entrada',
    category: 'Oferta',
    description: 'Oferta de Culto - Junho',
    amount: 2100.0,
    date: '2026-06-20',
    isAnonymous: true,
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'Dinheiro',
    status: 'Concluído',
  },
  {
    id: 'tx-203',
    type: 'Saída',
    category: 'Apoio Pastoral',
    description: 'Prebenda Pastoral - Pr. Ricardo Santos (Junho)',
    amount: 6800.0,
    date: '2026-06-05',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
  },
  {
    id: 'tx-204',
    type: 'Saída',
    category: 'Repasse Presbitério',
    description: 'Repasse Estatutário 10% IPB (Junho)',
    amount: 4280.0,
    date: '2026-06-18',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'Transferência',
    status: 'Concluído',
  },
  // --- LANÇAMENTOS DE MAIO 2026 ---
  {
    id: 'tx-301',
    type: 'Entrada',
    category: 'Dízimo',
    description: 'Dízimo de Maria Oliveira',
    amount: 2200.0,
    date: '2026-05-15',
    memberName: 'Maria Oliveira',
    memberId: 'mem-2',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
  },
  {
    id: 'tx-302',
    type: 'Saída',
    category: 'Apoio Pastoral',
    description: 'Prebenda Pastoral - Pr. Ricardo Santos (Maio)',
    amount: 6800.0,
    date: '2026-05-05',
    account: 'Conta Dízimos & Ofertas',
    paymentMethod: 'PIX',
    status: 'Concluído',
  },
];

export const INITIAL_UPCOMING_BILLS: UpcomingBill[] = [
  {
    id: 'bill-1',
    supplier: 'COPASA - Companhia de Saneamento',
    category: 'Luz e Água',
    amount: 345.8,
    dueDate: '2026-07-30',
    status: 'A vencer',
    account: 'Conta Dízimos & Ofertas',
  },
  {
    id: 'bill-2',
    supplier: 'CEMIG - Energia Elétrica',
    category: 'Luz e Água',
    amount: 720.5,
    dueDate: '2026-08-02',
    status: 'A vencer',
    account: 'Conta Dízimos & Ofertas',
  },
  {
    id: 'bill-3',
    supplier: 'Aluguel do Anexo Educacional',
    category: 'Educação Cristã e EBD',
    amount: 2800.0,
    dueDate: '2026-08-05',
    status: 'A vencer',
    account: 'Conta Dízimos & Ofertas',
    autoPay: true,
  },
  {
    id: 'bill-4',
    supplier: 'Apoio Pastoral / Prebenda do Mês',
    category: 'Apoio Pastoral',
    amount: 6800.0,
    dueDate: '2026-08-05',
    status: 'A vencer',
    account: 'Conta Dízimos & Ofertas',
  },
  {
    id: 'bill-5',
    supplier: 'Livraria Cultura Cristã (Material EBD)',
    category: 'Educação Cristã e EBD',
    amount: 410.0,
    dueDate: '2026-08-10',
    status: 'A vencer',
    account: 'Conta Dízimos & Ofertas',
  },
];

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem-1',
    name: 'João Silva',
    role: 'Comungante',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    totalTitichedThisYear: 10500.0,
    lastTitheDate: '2026-07-26',
    status: 'Ativo',
  },
  {
    id: 'mem-2',
    name: 'Maria Oliveira',
    role: 'Comungante',
    email: 'maria.oliveira@email.com',
    phone: '(11) 97654-3210',
    totalTitichedThisYear: 15400.0,
    lastTitheDate: '2026-07-15',
    status: 'Ativo',
  },
  {
    id: 'mem-3',
    name: 'Dr. Carlos Eduardo',
    role: 'Oficial',
    email: 'carlos.eduardo@advocacia.com',
    phone: '(11) 96543-2109',
    totalTitichedThisYear: 28000.0,
    lastTitheDate: '2026-07-12',
    status: 'Ativo',
  },
  {
    id: 'mem-4',
    name: 'Presb. Antônio Ferreira',
    role: 'Oficial',
    email: 'antonio.ferreira@ipb.org.br',
    phone: '(11) 95432-1098',
    totalTitichedThisYear: 12000.0,
    lastTitheDate: '2026-07-02',
    status: 'Ativo',
  },
  {
    id: 'mem-5',
    name: 'Diác. Roberto Lima',
    role: 'Oficial',
    email: 'roberto.lima@email.com',
    phone: '(11) 94321-0987',
    totalTitichedThisYear: 8900.0,
    lastTitheDate: '2026-06-28',
    status: 'Ativo',
  },
];

export const INITIAL_BUDGETS: MonthlyBudget[] = [
  { id: 'b-1', category: 'Apoio Pastoral', budgetedAmount: 7000, actualAmount: 6800, month: '2026-07' },
  { id: 'b-2', category: 'Repasse Presbitério', budgetedAmount: 4300, actualAmount: 4285, month: '2026-07' },
  { id: 'b-3', category: 'Apoio Missionário', budgetedAmount: 2500, actualAmount: 2500, month: '2026-07' },
  { id: 'b-4', category: 'Luz e Água', budgetedAmount: 1100, actualAmount: 1000.55, month: '2026-07' },
  { id: 'b-5', category: 'Cuidado Congregacional', budgetedAmount: 1500, actualAmount: 1200, month: '2026-07' },
  { id: 'b-6', category: 'Manutenção e Conservação', budgetedAmount: 1200, actualAmount: 450, month: '2026-07' },
  { id: 'b-7', category: 'Educação Cristã e EBD', budgetedAmount: 800, actualAmount: 410, month: '2026-07' },
];

export const HISTORICAL_TRANSPARENCY_DATA = [
  { month: 'Fev/26', receitas: 38200, despesas: 31000, saldoCaixa: 142000 },
  { month: 'Mar/26', receitas: 41500, despesas: 34200, saldoCaixa: 149300 },
  { month: 'Abr/26', receitas: 39800, despesas: 33100, saldoCaixa: 156000 },
  { month: 'Mai/26', receitas: 44100, despesas: 35800, saldoCaixa: 164300 },
  { month: 'Jun/26', receitas: 42800, despesas: 34900, saldoCaixa: 172200 },
  { month: 'Jul/26', receitas: 45300, despesas: 36100, saldoCaixa: 173550 },
];

export const MONTHLY_COMPARISON_DATA = [
  { category: 'Dízimos/Ofertas', esteMes: 45300, mesPassado: 42800 },
  { category: 'Apoio Pastoral', esteMes: 6800, mesPassado: 6800 },
  { category: 'Presbitério', esteMes: 4285, mesPassado: 4280 },
  { category: 'Apoio Missionário', esteMes: 2500, mesPassado: 2500 },
  { category: 'Luz e Água', esteMes: 1000, mesPassado: 1150 },
  { category: 'Manutenção', esteMes: 450, mesPassado: 1800 },
];

export const EXPENSES_BREAKDOWN_DATA = [
  { name: 'Apoio Pastoral', value: 6800, color: '#0d9488' }, // teal-600
  { name: 'Repasse Presbitério', value: 4285, color: '#059669' }, // emerald-600
  { name: 'Apoio Missionário', value: 2500, color: '#0284c7' }, // sky-600
  { name: 'Luz e Água', value: 1000, color: '#d97706' }, // amber-600
  { name: 'Cuidado Congregacional', value: 1200, color: '#8b5cf6' }, // violet-600
  { name: 'Manutenção', value: 450, color: '#e11d48' }, // rose-600
  { name: 'Educação Cristã', value: 410, color: '#6366f1' }, // indigo-600
];

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- SUPABASE DDL SCHEMA FOR ECCLESIA FINANCE (IPB)
-- Multi-Tenant Church Treasury & Transparency SaaS
-- ==========================================

-- 1. CHURCHES TABLE (Organizações / Igrejas)
CREATE TABLE IF NOT EXISTS public.churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    presbytery_name VARCHAR(150),
    synod_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ACCOUNTS TABLE (Contas Bancárias)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. MEMBERS TABLE (Rol de Membros IPB)
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Comungante' CHECK (role IN ('Comungante', 'Não-Comungante', 'Oficial', 'Visitante')),
    email VARCHAR(255),
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TRANSACTIONS TABLE (Lançamentos de Dízimos, Ofertas e Despesas)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    account_id UUID REFERENCES public.accounts(id),
    member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('Entrada', 'Saída')),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Concluído',
    destination_fund VARCHAR(100) DEFAULT 'Caixa Geral',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SUPERIOR_PAYMENTS TABLE (Repasses Presbitério / Sínodo / IPB)
CREATE TABLE IF NOT EXISTS public.superior_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    entity VARCHAR(50) NOT NULL, -- Presbitério, Sínodo, TBN
    description VARCHAR(255) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    amount DECIMAL(12,2) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pendente',
    receipt_number VARCHAR(100)
);

-- 6. BUDGETS TABLE (Orçamentos Anuais / Mensais do Conselho)
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    budgeted_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2) DEFAULT 0.00,
    month_year VARCHAR(7) NOT NULL -- YYYY-MM
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- Allow authenticated treasurers and elders full access
CREATE POLICY "Tesoureiro and Presbíteros full management"
ON public.transactions FOR ALL
USING (auth.jwt() ->> 'role' IN ('Tesoureiro', 'Presbítero', 'Pastor'));

-- Public Transparency Policy (Anonymized View)
CREATE POLICY "Public Transparency View"
ON public.transactions FOR SELECT
USING (status = 'Concluído');
`;
