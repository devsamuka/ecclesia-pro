import React, { useState } from 'react';
import {
  Wallet,
  Building2,
  Landmark,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  Calendar,
  CreditCard,
  Plus,
  Eye,
  FileCheck,
  Download,
  Filter,
  ShieldAlert,
  PiggyBank,
  ChevronRight,
  Receipt,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ChurchAccount,
  Transaction,
  UpcomingBill,
  SuperiorPayment,
  SynodeGoal,
  UserRole,
} from '../../types';
import {
  MONTHLY_COMPARISON_DATA,
  EXPENSES_BREAKDOWN_DATA,
} from '../../data/mockData';
import { formatPeriodLabel, isDateInPeriod } from '../../utils/periodUtils';
import { LastUpdateBadge } from '../common/LastUpdateBadge';

interface OverviewDashboardProps {
  accounts: ChurchAccount[];
  transactions: Transaction[];
  consolidatedBalance?: number; // Adicione esta linha
  upcomingBills: UpcomingBill[];
  superiorPayments: SuperiorPayment[];
  synodGoal: SynodeGoal;
  activeRole: UserRole;
  percentualPresbiterio?: number;
  percentualSinodo?: number;
  onOpenNewTransaction: () => void;
  onOpenNewBill: () => void;
  onMarkBillPaid: (billId: string) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenReceiptModal: (transaction: Transaction) => void;
  searchTerm: string;
  selectedPeriod: string;
  lastUpdated?: string;
  consolidatedBalance: number;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  accounts,
  transactions,
  upcomingBills,
  superiorPayments,
  synodGoal,
  activeRole,
  percentualPresbiterio = 10,
  percentualSinodo = 10,
  onOpenNewTransaction,
  onOpenNewBill,
  onMarkBillPaid,
  onNavigateToTab,
  onOpenReceiptModal,
  searchTerm,
  selectedPeriod,
  consolidatedBalance,
    lastUpdated = '28/07/2026 às 16:45',
}) => {
  const [transactionTab, setTransactionTab] = useState<
    'Tudo' | 'Dízimos/Ofertas' | 'Contas' | 'Geral'
  >('Tudo');

  const canManageFinances = activeRole === 'Tesoureiro' || activeRole === 'Administrador';

  // Transactions filtered strictly by selected period
  const periodTransactions = transactions.filter((t) =>
    isDateInPeriod(t.date, selectedPeriod)
  );

  // Period Metrics (Dízimos, Ofertas, Despesas)
  const periodIncome = periodTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodExpense = periodTransactions
    .filter((t) => t.type === 'Saída')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodTithes = periodTransactions
    .filter((t) => t.category === 'Dízimo' && t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const periodOfferings = periodTransactions
    .filter((t) => t.category === 'Oferta' && t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  // Total Consolidated Balance (UNFILTERED - Real Cash in Accounts)
  const totalConsolidatedBalance = accounts.reduce((acc, a) => acc + a.balance, 0);

  // Filtered transactions for recent table
  const filteredTransactions = periodTransactions.filter((tx) => {
    // Search filter
    const matchesSearch =
      searchTerm === '' ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memberName && tx.memberName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (transactionTab === 'Dízimos/Ofertas') {
      return tx.category === 'Dízimo' || tx.category === 'Oferta';
    }
    if (transactionTab === 'Contas') {
      return (
        tx.category === 'Luz e Água' ||
        tx.category === 'Manutenção e Conservação' ||
        tx.type === 'Saída'
      );
    }
    if (transactionTab === 'Geral') {
      return tx.category !== 'Dízimo' && tx.category !== 'Oferta';
    }
    return true;
  });

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Dízimo':
        return 'bg-teal-50 text-teal-700 border border-teal-100';
      case 'Oferta':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Luz e Água':
      case 'Manutenção e Conservação':
        return 'bg-red-50 text-red-700 border border-red-100';
      case 'Apoio Missionário':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  // Synod Quota based on period tithes & offerings and dynamic configured percentage
  const tithesAndOfferingsBase = periodTithes + periodOfferings;
  const calculatedSynodTarget = tithesAndOfferingsBase * ((percentualPresbiterio || 10) / 100);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      {/* Visual Update Flag Widget (Top of Dashboard) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs w-full min-w-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="w-2 h-2 rounded-full bg-teal-500"></span>
          <span>Visão Geral do Painel • Perfil: <strong className="text-teal-700">{activeRole}</strong></span>
        </div>
        <LastUpdateBadge lastUpdated={lastUpdated} variant="dashboard" />
      </div>

      {/* 1. TOP STAT CARDS (3 CARDS ACCORDING TO SPECIFICATION) */}
      <section id="saldos-totais-section">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Entradas do Mês (Dízimos e Ofertas) */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5" />
                Entradas ({formatPeriodLabel(selectedPeriod)})
              </span>
              <div className="bg-emerald-50 p-1.5 rounded-lg text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {formatBRL(periodIncome)}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                Dízimos: <strong className="text-teal-700">{formatBRL(periodTithes)}</strong> • Ofertas: <strong className="text-amber-700">{formatBRL(periodOfferings)}</strong>
              </p>
            </div>
          </div>

          {/* Card 2: Despesas do Mês */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5" />
                Despesas ({formatPeriodLabel(selectedPeriod)})
              </span>
              <div className="bg-rose-50 p-1.5 rounded-lg text-rose-600">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {formatBRL(periodExpense)}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">
                {periodTransactions.filter((t) => t.type === 'Saída').length} saídas registradas neste mês
              </p>
            </div>
          </div>

          {/* Card 3: Saldo Consolidado (EXCEÇÃO: SEM FILTRO DE MÊS) */}
          <div className="bg-white p-4 rounded-xl border border-teal-600/30 shadow-sm bg-gradient-to-br from-white to-teal-50/40 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-teal-800 uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-teal-600" />
                Saldo Consolidado
              </span>
              <div className="bg-teal-600 p-1.5 rounded-lg text-white shadow-xs">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              {formatBRL(consolidatedBalance)}
              </h3>
              <p className="text-[11px] text-slate-600 font-semibold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shrink-0" />
                Inclui saldo acumulado de meses anteriores
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN 12-COL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Presbitério e Sínodo Card (8 COLS) */}
        <section className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-600" />
              <h4 className="text-sm font-bold text-slate-900">
                Presbitério e Sínodo
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-medium">Sínodo de São Paulo / PRST Central</span>
          </div>

          <div className="p-5 flex flex-col md:flex-row items-center gap-6">
            {/* Ícone Institucional */}
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <Building2 className="w-8 h-8" />
            </div>

            {/* Stats Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Repasse Calculado ({percentualPresbiterio}%)</p>
                <p className="text-sm font-bold text-slate-800">{formatBRL(calculatedSynodTarget)}</p>
                <p className="text-[9px] text-slate-400 mt-1">Base: Dízimos e ofertas de {formatPeriodLabel(selectedPeriod)}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status Repasse</p>
                <p className="text-sm font-bold text-teal-700">Calculado no Mês</p>
                <button
                  onClick={() => onNavigateToTab('presbytery')}
                  className="text-[9px] text-teal-600 hover:text-teal-800 mt-1 font-semibold underline block cursor-pointer"
                >
                  Ver Histórico Conciliar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Detalhamento de Despesas Card (4 COLS) */}
        <section className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-xs p-4 h-fit self-start w-full">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900">Detalhamento de Despesas</h4>
            <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
              {formatPeriodLabel(selectedPeriod)}
            </span>
          </div>

          <div className="space-y-4">
            {periodExpense === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                Sem despesas lançadas em {formatPeriodLabel(selectedPeriod)}.
              </p>
            ) : (
              <>
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Apoio Pastoral</span>
                    <span className="font-bold text-slate-900">
                      {Math.round(
                        ((periodTransactions
                          .filter((t) => t.category === 'Apoio Pastoral')
                          .reduce((s, t) => s + t.amount, 0) || 0) /
                          periodExpense) *
                          100
                      ) || 0}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-teal-500 h-full"
                      style={{
                        width: `${
                          Math.round(
                            ((periodTransactions
                              .filter((t) => t.category === 'Apoio Pastoral')
                              .reduce((s, t) => s + t.amount, 0) || 0) /
                              periodExpense) *
                              100
                          ) || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Luz, Água & Utilidades</span>
                    <span className="font-bold text-slate-900">
                      {Math.round(
                        ((periodTransactions
                          .filter((t) => t.category === 'Luz e Água')
                          .reduce((s, t) => s + t.amount, 0) || 0) /
                          periodExpense) *
                          100
                      ) || 0}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full"
                      style={{
                        width: `${
                          Math.round(
                            ((periodTransactions
                              .filter((t) => t.category === 'Luz e Água')
                              .reduce((s, t) => s + t.amount, 0) || 0) /
                              periodExpense) *
                              100
                          ) || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">Repasse ao Presbitério</span>
                    <span className="font-bold text-slate-900">
                      {Math.round(
                        ((periodTransactions
                          .filter((t) => t.category === 'Repasse Presbitério')
                          .reduce((s, t) => s + t.amount, 0) || 0) /
                          periodExpense) *
                          100
                      ) || 0}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-400 h-full"
                      style={{
                        width: `${
                          Math.round(
                            ((periodTransactions
                              .filter((t) => t.category === 'Repasse Presbitério')
                              .reduce((s, t) => s + t.amount, 0) || 0) /
                              periodExpense) *
                              100
                          ) || 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Últimas Movimentações Card (12 COLS - FULL WIDTH) */}
        <section className="lg:col-span-12 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden w-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Movimentações de {formatPeriodLabel(selectedPeriod)}
              </h4>
              <p className="text-[10px] text-slate-500">
                {periodTransactions.length} lançamentos neste mês
              </p>
            </div>
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              {(['Tudo', 'Dízimos/Ofertas', 'Contas'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() =>
                    setTransactionTab(
                      tab === 'Dízimos/Ofertas'
                        ? 'Dízimos/Ofertas'
                        : tab === 'Contas'
                        ? 'Contas'
                        : 'Tudo'
                    )
                  }
                  className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer transition-colors ${
                    (tab === 'Tudo' && transactionTab === 'Tudo') ||
                    (tab === 'Dízimos/Ofertas' && transactionTab === 'Dízimos/Ofertas') ||
                    (tab === 'Contas' && transactionTab === 'Contas')
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-500 hover:bg-slate-200/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile View: Vertical Cards */}
          <div className="flex md:hidden flex-col gap-2 p-3 w-full">
            {filteredTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Nenhum lançamento encontrado em {formatPeriodLabel(selectedPeriod)}.
              </p>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex flex-col w-full p-3 bg-white rounded-lg border border-slate-200/90 gap-1.5 shadow-2xs"
                >
                  {/* Linha Superior */}
                  <div className="flex flex-row justify-between items-start w-full gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-xs leading-snug break-words">
                        {tx.description}
                      </p>
                      {tx.memberName && (
                        <p className="text-[10px] text-teal-700 font-semibold">{tx.memberName}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`font-black text-xs whitespace-nowrap ${
                          tx.type === 'Entrada' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'Entrada' ? '+' : '-'} {formatBRL(tx.amount)}
                      </span>
                    </div>
                  </div>

                  {/* Linha Inferior */}
                  <div className="flex flex-row justify-between items-center w-full pt-1.5 border-t border-slate-100 gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getCategoryBadgeClass(tx.category)}`}>
                      {tx.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[9px] border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Data</th>
                  <th className="px-4 py-2.5">Descrição</th>
                  <th className="px-4 py-2.5">Categoria</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                      Nenhum lançamento encontrado em {formatPeriodLabel(selectedPeriod)}.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {new Date(tx.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {tx.description}
                        {tx.memberName && (
                          <span className="block text-[10px] text-teal-700 font-semibold">{tx.memberName}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getCategoryBadgeClass(tx.category)}`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${tx.type === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'Entrada' ? '+' : '-'} {formatBRL(tx.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-right">
            <button
              onClick={() => onNavigateToTab('transactions')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1 cursor-pointer"
            >
              Ver histórico de {formatPeriodLabel(selectedPeriod)} ({periodTransactions.length}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </section>
      </div>

      {/* 3. CONTAS A PAGAR & CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contas a Pagar (5 cols) */}
        <section className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Contas a Pagar</h3>
                <p className="text-xs text-slate-500">Compromissos agendados no período</p>
              </div>

              {canManageFinances && (
                <button
                  onClick={onOpenNewBill}
                  className="p-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                  title="Agendar Nova Conta"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {upcomingBills.map((bill) => (
                <div
                  key={bill.id}
                  className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-800">{bill.supplier}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> Vence em:{' '}
                      {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{formatBRL(bill.amount)}</span>
                    {canManageFinances && (
                      <button
                        onClick={() => onMarkBillPaid(bill.id)}
                        className="text-[10px] font-bold text-teal-700 hover:text-teal-900 underline mt-0.5 cursor-pointer"
                      >
                        Pagar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateToTab('expenses')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors text-center cursor-pointer"
            >
              Gerenciar Todas as Despesas
            </button>
          </div>
        </section>

        {/* Comparativo Mensal Bar Chart (7 cols) */}
        <section className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Comparativo Mensal</h3>
              <p className="text-xs text-slate-500">Mês Selecionado ({formatPeriodLabel(selectedPeriod)}) vs. Mês Anterior</p>
            </div>
            <span className="self-start sm:self-auto text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
              Período Ativo: {formatPeriodLabel(selectedPeriod)}
            </span>
          </div>

          {/* Scrollable Container on Mobile to prevent label overlap & clipping */}
          <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
            <div className="h-72 min-w-[540px] sm:min-w-0 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MONTHLY_COMPARISON_DATA.map((item) => ({
                    ...item,
                    category: item.category.replace(' (10%)', ''),
                  }))}
                  margin={{ top: 10, right: 15, left: -10, bottom: 25 }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={50}
                    tickFormatter={(value: string) => (value.length > 14 ? `${value.slice(0, 12)}...` : value)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(value: number) => [formatBRL(value), '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                  <Bar dataKey="esteMes" name={`Mês Ativo (${formatPeriodLabel(selectedPeriod)})`} fill="#0d9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mesPassado" name="Mês Anterior" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

