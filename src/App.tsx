/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Sidebar, NavItem } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { TithingLedgerView } from './components/views/TithingLedgerView';
import { TransactionsView } from './components/views/TransactionsView';
import { PresbyterySynodView } from './components/views/PresbyterySynodView';
import { ExpensesView } from './components/views/ExpensesView';
import { BudgetsView } from './components/views/BudgetsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';
import { PublicTransparencyView } from './components/views/PublicTransparencyView';
import { AuthView } from './components/views/AuthView';
import { NewTransactionModal } from './components/modals/NewTransactionModal';
import { NewBillModal } from './components/modals/NewBillModal';
import { BudgetModal } from './components/modals/BudgetModal';
import { MemberReceiptModal } from './components/modals/MemberReceiptModal';
import { MobileSimulatorFrame } from './components/mobile/MobileSimulatorFrame';
import {
  INITIAL_CHURCH_NAME,
  INITIAL_CHURCH_CNPJ,
  INITIAL_PRESBYTERY_NAME,
  INITIAL_SYNOD_NAME,
  INITIAL_ACCOUNTS,
  INITIAL_SYNOD_GOAL,
  INITIAL_SUPERIOR_PAYMENTS,
  INITIAL_TRANSACTIONS,
  INITIAL_UPCOMING_BILLS,
  INITIAL_MEMBERS,
  INITIAL_BUDGETS,
} from './data/mockData';
import {
  getPrevPeriod,
  getNextPeriod,
  formatCurrentDateTime,
  getInitialLastUpdatedTimestamp,
  isDateInPeriod,
} from './utils/periodUtils';
import {
  UserRole,
  SystemUser,
  Transaction,
  UpcomingBill,
  ChurchAccount,
  SuperiorPayment,
  Member,
  MonthlyBudget,
  SynodeGoal,
} from './types';
import { supabase } from './lib/supabase';
import { fetchTransactionsFromSupabase, createTransactionInSupabase, updateTransactionInSupabase } from './lib/transactionsService';

const INITIAL_USERS: SystemUser[] = [
  {
    id: '1',
    name: 'Administrador Geral',
    email: 'admin@igreja.org',
    password: 'admin123',
    role: 'Administrador',
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export default function App() {
  // Authentication State (System Lock)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Centralized Users State
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);

  const handleAddUser = (newUser: SystemUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleEditUser = (updatedUser: SystemUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  // Navigation & View States
  const [currentTab, setCurrentTab] = useState<NavItem>('overview');
  const [isPublicTransparency, setIsPublicTransparency] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.pathname.includes('/painel-publico') ||
        window.location.hash.includes('painel-publico')
      );
    }
    return false;
  });

  useEffect(() => {
    const handleLocationChange = () => {
      if (
        window.location.pathname.includes('/painel-publico') ||
        window.location.hash.includes('painel-publico')
      ) {
        setIsPublicTransparency(true);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);
  const [activeRole, setActiveRole] = useState<UserRole>('Tesoureiro');
  const [treasurerName, setTreasurerName] = useState<string>('Carlos Santos');
  const [userEmail, setUserEmail] = useState<string>('tesouraria@ipb.org.br');
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>(undefined);

  // Monitor Supabase Active Session and Auth State Changes (F5 Persistence)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, role, email')
            .eq('id', session.user.id)
            .single();

          setUserEmail(session.user.email || 'tesouraria@ipb.org.br');
          if (profile) {
            if (profile.name) setTreasurerName(profile.name);
            if (profile.role) setActiveRole(profile.role as UserRole);
          }
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão ativa no Supabase:', err);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, role, email')
          .eq('id', session.user.id)
          .single();

        setUserEmail(session.user.email || '');
        if (profile) {
          if (profile.name) setTreasurerName(profile.name);
          if (profile.role) setActiveRole(profile.role as UserRole);
        }
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erro ao encerrar sessão no Supabase:', err);
    } finally {
      setIsAuthenticated(false);
    }
  };
  const [churchName, setChurchName] = useState<string>(INITIAL_CHURCH_NAME);
  const [churchCnpj, setChurchCnpj] = useState<string>(INITIAL_CHURCH_CNPJ);
  const [presbyteryName, setPresbyteryName] = useState<string>(INITIAL_PRESBYTERY_NAME);
  const [synodName, setSynodName] = useState<string>(INITIAL_SYNOD_NAME);
  const [percentualPresbiterio, setPercentualPresbiterio] = useState<number>(10);
  const [percentualSinodo, setPercentualSinodo] = useState<number>(10);
  const handleUpdateProfile = (updated: { name: string; role: UserRole; avatarUrl?: string }) => {
    setTreasurerName(updated.name);
    setActiveRole(updated.role);
    if (updated.avatarUrl !== undefined) {
      setUserAvatarUrl(updated.avatarUrl);
    }
  };
  const [accountsRelatorName, setAccountsRelatorName] = useState<string>('Presb. Antônio Ferreira');
  const [councilPresidentName, setCouncilPresidentName] = useState<string>('Pr. Ricardo Santos');
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isSimulatedMobile, setIsSimulatedMobile] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Period Navigation State (Default: July 2026)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-07');

  const handlePrevPeriod = () => {
    setSelectedPeriod((prev) => getPrevPeriod(prev));
  };

  const handleNextPeriod = () => {
    setSelectedPeriod((prev) => getNextPeriod(prev));
  };

  // Domain Data States
  const [accounts, setAccounts] = useState<ChurchAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>(() =>
    getInitialLastUpdatedTimestamp(INITIAL_TRANSACTIONS)
  );

  // Fetch real transactions from Supabase on mount and whenever authentication occurs
  useEffect(() => {
    let isMounted = true;
    const loadRealTransactions = async () => {
      setIsLoadingTransactions(true);
      const { data, error } = await fetchTransactionsFromSupabase();
      if (isMounted) {
        if (!error && data) {
          setTransactions(data);
          setLastUpdated(formatCurrentDateTime(new Date()));
        } else {
          console.warn('Utilizando fallback inicial para dados de transação:', error);
          setTransactions(INITIAL_TRANSACTIONS);
        }
        setIsLoadingTransactions(false);
      }
    };

    loadRealTransactions();

    return () => {
      isMounted = false;
    };
  }, []);
 const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [superiorPayments, setSuperiorPayments] = useState<SuperiorPayment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
const [budgets, setBudgets] = useState<MonthlyBudget[]>([]);
  const [synodGoal, setSynodGoal] = useState<SynodeGoal>(INITIAL_SYNOD_GOAL);

  // Dynamic Category Lists State
  const [incomeCategories, setIncomeCategories] = useState<string[]>([
    'Dízimo',
    'Oferta',
    'Evento / Acampamento',
    'Outros',
  ]);

  const [expenseCategories, setExpenseCategories] = useState<string[]>([
    'Apoio Pastoral',
    'Cuidado Congregacional',
    'Manutenção e Conservação',
    'Luz e Água',
    'Apoio Missionário',
    'Educação Cristã e EBD',
    'Ação Social e Diaconia',
    'Repasse Presbitério',
    'Repasse Sínodo',
    'Outros',
  ]);

  const handleAddIncomeCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed || incomeCategories.includes(trimmed)) return;
    setIncomeCategories((prev) => [...prev, trimmed]);
  };

  const handleEditIncomeCategory = (index: number, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setIncomeCategories((prev) => {
      const copy = [...prev];
      copy[index] = trimmed;
      return copy;
    });
  };

  const handleDeleteIncomeCategory = (index: number) => {
    setIncomeCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExpenseCategory = (cat: string) => {
    const trimmed = cat.trim();
    if (!trimmed || expenseCategories.includes(trimmed)) return;
    setExpenseCategories((prev) => [...prev, trimmed]);
  };

  const handleEditExpenseCategory = (index: number, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setExpenseCategories((prev) => {
      const copy = [...prev];
      copy[index] = trimmed;
      return copy;
    });
  };

  const handleDeleteExpenseCategory = (index: number) => {
    setExpenseCategories((prev) => prev.filter((_, i) => i !== index));
  };

  // Modal States
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState<boolean>(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [isNewBillModalOpen, setIsNewBillModalOpen] = useState<boolean>(false);
  const [editingBill, setEditingBill] = useState<UpcomingBill | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<MonthlyBudget | null>(null);
  const [activeReceiptTx, setActiveReceiptTx] = useState<Transaction | null>(null);

  // Handlers
  const handleSaveTransaction = async (savedTx: Transaction) => {
    // 1. Verificamos se é uma Edição (já existe na tela) ou Criação Nova
    const isEditing = transactions.some((t) => t.id === savedTx.id);
    
    let dbResult;

    if (isEditing) {
      // Dispara a atualização no Supabase
      dbResult = await updateTransactionInSupabase(savedTx.id, savedTx);
    } else {
      // Dispara a criação no Supabase (Removemos o ID temporário gerado no front-end para usar o ID real do banco)
      const { id, ...txWithoutId } = savedTx;
      dbResult = await createTransactionInSupabase(txWithoutId);
    }

    // 2. Trava de segurança: Se o banco falhou, a gente avisa e não atualiza a tela enganando o usuário
    if (dbResult.error || !dbResult.data) {
      console.error("Erro ao salvar no banco:", dbResult.error);
      alert("Houve um erro ao salvar a transação. Verifique sua conexão e tente novamente.");
      return; 
    }

    // Esta é a transação final, com o ID correto e validada pelo Supabase
    const finalTx = dbResult.data;

    // 3. Sucesso! Agora sim atualizamos a tela (memória do React)
    setTransactions((prev) => {
      if (isEditing) {
        return prev.map((t) => (t.id === finalTx.id ? finalTx : t));
      }
      return [finalTx, ...prev];
    });

    // Atualiza o relógio de "Última atualização"
    setLastUpdated(formatCurrentDateTime(new Date()));

    // 4. Atualiza o saldo das contas no layout
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.name === finalTx.account) {
          const delta = finalTx.type === 'Entrada' ? finalTx.amount : -finalTx.amount;
          return { ...acc, balance: acc.balance + delta };
        }
        return acc;
      })
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setLastUpdated(formatCurrentDateTime(new Date()));
  };

  const handleSaveBill = (savedBill: UpcomingBill) => {
    setUpcomingBills((prev) => {
      const exists = prev.some((b) => b.id === savedBill.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBill.id ? savedBill : b));
      }
      return [savedBill, ...prev];
    });
  };

  const handleDeleteBill = (billId: string) => {
    setUpcomingBills((prev) => prev.filter((b) => b.id !== billId));
  };

  const handleSaveBudget = (savedBudget: MonthlyBudget) => {
    setBudgets((prev) => {
      const exists = prev.some((b) => b.id === savedBudget.id);
      if (exists) {
        return prev.map((b) => (b.id === savedBudget.id ? savedBudget : b));
      }
      return [savedBudget, ...prev];
    });
  };

  const handleDeleteBudget = (budgetId: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== budgetId));
  };

  const handleMarkBillPaid = (billId: string) => {
    const billToPay = upcomingBills.find((b) => b.id === billId);
    if (!billToPay) return;

    // Create a transaction record
    const paidTx: Transaction = {
      id: `tx-paid-${Date.now()}`,
      type: 'Saída',
      category: billToPay.category,
      description: `Pagamento de ${billToPay.supplier}`,
      amount: billToPay.amount,
      date: new Date().toISOString().slice(0, 10),
      account: billToPay.account,
      paymentMethod: 'Boleto',
      status: 'Concluído',
      notes: `Liquidado via Tesouraria em ${new Date().toLocaleDateString('pt-BR')}`,
    };

    setTransactions((prev) => [paidTx, ...prev]);
    setLastUpdated(formatCurrentDateTime(new Date()));

    // Deduct from account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.name === billToPay.account) {
          return { ...acc, balance: acc.balance - billToPay.amount };
        }
        return acc;
      })
    );

    // Remove from upcoming bills
    setUpcomingBills((prev) => prev.filter((b) => b.id !== billId));
  };

  const handleAddSuperiorPayment = (newPayment: SuperiorPayment) => {
    setSuperiorPayments((prev) => [newPayment, ...prev]);
  };

  const handleUpdateSuperiorPayment = (updatedPayment: SuperiorPayment) => {
    setSuperiorPayments((prev) =>
      prev.map((p) => (p.id === updatedPayment.id ? updatedPayment : p))
    );
  };

  const handleDeleteSuperiorPayment = (id: string) => {
    setSuperiorPayments((prev) => prev.filter((p) => p.id !== id));
  };

  // Total tithes for calculations (filtered by selected month/period)
  const totalMonthlyTithes = transactions
    .filter((t) => t.category === 'Dízimo' && t.type === 'Entrada' && isDateInPeriod(t.date, selectedPeriod))
    .reduce((sum, t) => sum + t.amount, 0);

  // If Public Transparency Portal mode is enabled
  if (isPublicTransparency) {
    return (
      <PublicTransparencyView
        churchName={churchName}
        transactions={transactions}
        accounts={accounts}
        onBackToAdmin={() => {
          if (typeof window !== 'undefined' && window.location.pathname.includes('/painel-publico')) {
            window.history.pushState({}, '', '/');
          }
          setIsPublicTransparency(false);
        }}
        lastUpdated={lastUpdated}
      />
    );
  }

  // System Lock: Render AuthView when not authenticated
  if (!isAuthenticated) {
    return (
      <AuthView
        systemUsers={users}
        onRegisterUser={handleAddUser}
        onLoginSuccess={(user) => {
          if (user.name) setTreasurerName(user.name);
          if (user.email) setUserEmail(user.email);
          if (user.role) setActiveRole(user.role);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <MobileSimulatorFrame
      isSimulatedMobile={isSimulatedMobile}
      onCloseMobileSim={() => setIsSimulatedMobile(false)}
    >
      <div id="app-root-layout" className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900 font-sans">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
          }}
          activeRole={activeRole}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
          onOpenPublicTransparency={() => setIsPublicTransparency(true)}
          churchName={churchName}
          isSimulatedMobile={isSimulatedMobile}
          onToggleMobileSim={() => setIsSimulatedMobile(!isSimulatedMobile)}
        />

        {/* Main Content Area */}
        <div className="flex-1 h-full overflow-y-auto flex flex-col min-w-0 w-full">
          <Header
            onOpenMobileMenu={() => setIsMobileOpen(true)}
            activeRole={activeRole}
            userName={treasurerName}
            userEmail={userEmail}
            userAvatarUrl={userAvatarUrl}
            onUpdateProfile={handleUpdateProfile}
            onRoleChange={(role) => {
              setActiveRole(role);
              if (role !== 'Tesoureiro' && role !== 'Presbítero' && role !== 'Administrador' && currentTab === 'settings') {
                setCurrentTab('overview');
              }
            }}
            churchName={churchName}
            onOpenNewTransaction={() => {
              setEditingTx(null);
              setIsNewTxModalOpen(true);
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedPeriod={selectedPeriod}
            onPrevPeriod={handlePrevPeriod}
            onNextPeriod={handleNextPeriod}
            onLogout={handleLogout}
          />

          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 overflow-x-hidden">
            {currentTab === 'overview' && (
              <OverviewDashboard
                accounts={accounts}
                transactions={transactions}
                upcomingBills={upcomingBills}
                superiorPayments={superiorPayments}
                synodGoal={synodGoal}
                activeRole={activeRole}
                percentualPresbiterio={percentualPresbiterio}
                percentualSinodo={percentualSinodo}
                onOpenNewTransaction={() => {
                  setEditingTx(null);
                  setIsNewTxModalOpen(true);
                }}
                onOpenNewBill={() => setIsNewBillModalOpen(true)}
                onMarkBillPaid={handleMarkBillPaid}
                onNavigateToTab={(tab) => setCurrentTab(tab as NavItem)}
                onOpenReceiptModal={setActiveReceiptTx}
                searchTerm={searchTerm}
                selectedPeriod={selectedPeriod}
                lastUpdated={lastUpdated}
              />
            )}

            {currentTab === 'tithing' && (
              <TithingLedgerView
                transactions={transactions}
                members={members}
                onOpenNewTransaction={() => {
                  setEditingTx(null);
                  setIsNewTxModalOpen(true);
                }}
                onOpenReceiptModal={setActiveReceiptTx}
                selectedPeriod={selectedPeriod}
                activeRole={activeRole}
              />
            )}

            {currentTab === 'transactions' && (
              <TransactionsView
                transactions={transactions}
                accounts={accounts}
                isLoading={isLoadingTransactions}
                onOpenNewTransaction={() => {
                  setEditingTx(null);
                  setIsNewTxModalOpen(true);
                }}
                onEditTransaction={(tx) => {
                  setEditingTx(tx);
                  setIsNewTxModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                onOpenReceiptModal={setActiveReceiptTx}
                selectedPeriod={selectedPeriod}
                activeRole={activeRole}
              />
            )}

            {currentTab === 'presbytery' && (
              <PresbyterySynodView
                superiorPayments={superiorPayments}
                synodGoal={synodGoal}
                totalMonthlyTithes={totalMonthlyTithes}
                percentualPresbiterio={percentualPresbiterio}
                percentualSinodo={percentualSinodo}
                onAddSuperiorPayment={handleAddSuperiorPayment}
                onUpdateSuperiorPayment={handleUpdateSuperiorPayment}
                onDeleteSuperiorPayment={handleDeleteSuperiorPayment}
                transactions={transactions}
                selectedPeriod={selectedPeriod}
                activeRole={activeRole}
              />
            )}

            {currentTab === 'expenses' && (
              <ExpensesView
                upcomingBills={upcomingBills}
                transactions={transactions}
                onOpenNewBill={() => {
                  setEditingBill(null);
                  setIsNewBillModalOpen(true);
                }}
                onEditBill={(bill) => {
                  setEditingBill(bill);
                  setIsNewBillModalOpen(true);
                }}
                onDeleteBill={handleDeleteBill}
                onMarkBillPaid={handleMarkBillPaid}
                onEditTransaction={(tx) => {
                  setEditingTx(tx);
                  setIsNewTxModalOpen(true);
                }}
                onDeleteTransaction={handleDeleteTransaction}
                selectedPeriod={selectedPeriod}
                churchName={churchName}
                churchCnpj={churchCnpj}
                treasurerName={treasurerName}
                activeRole={activeRole}
              />
            )}

            {currentTab === 'budgets' && (
              <BudgetsView
                budgets={budgets}
                onOpenNewBudget={() => {
                  setEditingBudget(null);
                  setIsBudgetModalOpen(true);
                }}
                onEditBudget={(budget) => {
                  setEditingBudget(budget);
                  setIsBudgetModalOpen(true);
                }}
                onDeleteBudget={handleDeleteBudget}
                activeRole={activeRole}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView
                transactions={transactions}
                accounts={accounts}
                superiorPayments={superiorPayments}
                churchName={churchName}
                treasurerName={treasurerName}
                onTreasurerNameChange={setTreasurerName}
                accountsRelatorName={accountsRelatorName}
                onAccountsRelatorNameChange={setAccountsRelatorName}
                councilPresidentName={councilPresidentName}
                onCouncilPresidentNameChange={setCouncilPresidentName}
                selectedPeriod={selectedPeriod}
              />
            )}

            {currentTab === 'settings' && (
              activeRole === 'Tesoureiro' || activeRole === 'Presbítero' || activeRole === 'Administrador' ? (
                <SettingsView
                  activeRole={activeRole}
                  systemUsers={users}
                  onAddUser={handleAddUser}
                  onEditUser={handleEditUser}
                  onDeleteUser={handleDeleteUser}
                  churchName={churchName}
                  onChurchNameChange={setChurchName}
                  churchCnpj={churchCnpj}
                  onChurchCnpjChange={setChurchCnpj}
                  presbyteryName={presbyteryName}
                  onPresbyteryNameChange={setPresbyteryName}
                  synodName={synodName}
                  onSynodNameChange={setSynodName}
                  percentualPresbiterio={percentualPresbiterio}
                  onPercentualPresbiterioChange={setPercentualPresbiterio}
                  percentualSinodo={percentualSinodo}
                  onPercentualSinodoChange={setPercentualSinodo}
                  incomeCategories={incomeCategories}
                  expenseCategories={expenseCategories}
                  onAddIncomeCategory={handleAddIncomeCategory}
                  onEditIncomeCategory={handleEditIncomeCategory}
                  onDeleteIncomeCategory={handleDeleteIncomeCategory}
                  onAddExpenseCategory={handleAddExpenseCategory}
                  onEditExpenseCategory={handleEditExpenseCategory}
                  onDeleteExpenseCategory={handleDeleteExpenseCategory}
                />
              ) : (
                <div className="bg-white p-8 rounded-xl border border-rose-200 text-center space-y-3 max-w-lg mx-auto my-12 shadow-sm">
                  <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto font-bold text-lg">
                    !
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900">Acesso Restrito</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    O módulo de Configurações é restrito aos cargos de <span className="font-bold text-slate-800">Tesoureiro</span> e <span className="font-bold text-slate-800">Presbítero</span> (Conselho). Seu perfil atual ({activeRole}) não possui autorização para esta área.
                  </p>
                  <button
                    onClick={() => setCurrentTab('overview')}
                    className="mt-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    Voltar para Visão Geral
                  </button>
                </div>
              )
            )}
          </main>
        </div>

        {/* Prominent Floating Action Button for Mobile Access */}
        <button
          id="floating-new-transaction-btn"
          onClick={() => {
            setEditingTx(null);
            setIsNewTxModalOpen(true);
          }}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-2xl shadow-teal-600/40 hover:bg-teal-700 active:scale-95 transition-all z-50 border-2 border-white cursor-pointer"
          aria-label="Novo Lançamento"
          title="Novo Lançamento Rápido"
        >
          <Plus className="w-7 h-7 stroke-[3]" />
        </button>

        {/* Interactive Modals */}
        <NewTransactionModal
          isOpen={isNewTxModalOpen}
          onClose={() => {
            setIsNewTxModalOpen(false);
            setEditingTx(null);
          }}
          onSave={handleSaveTransaction}
          editingTransaction={editingTx}
          members={members}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />

        <NewBillModal
          isOpen={isNewBillModalOpen}
          onClose={() => {
            setIsNewBillModalOpen(false);
            setEditingBill(null);
          }}
          onSave={handleSaveBill}
          editingBill={editingBill}
          expenseCategories={expenseCategories}
        />

        <BudgetModal
          isOpen={isBudgetModalOpen}
          onClose={() => {
            setIsBudgetModalOpen(false);
            setEditingBudget(null);
          }}
          onSave={handleSaveBudget}
          editingBudget={editingBudget}
          expenseCategories={expenseCategories}
        />

        <MemberReceiptModal
          transaction={activeReceiptTx}
          churchName={churchName}
          onClose={() => setActiveReceiptTx(null)}
        />
      </div>
    </MobileSimulatorFrame>
  );
}
