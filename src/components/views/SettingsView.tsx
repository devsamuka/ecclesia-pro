import React, { useState, useEffect } from 'react';
import {
  Settings,
  Church,
  Landmark,
  Building,
  Save,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
  Percent,
  Tag,
  Plus,
  Pencil,
  Users,
  UserPlus,
  Key,
  Mail,
  User as UserIcon,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { UserRole, SystemUser } from '../../types';
import { supabase } from '../../lib/supabase';

interface SettingsViewProps {
  activeRole?: UserRole;
  systemUsers?: SystemUser[];
  onAddUser?: (user: SystemUser) => void;
  onEditUser?: (user: SystemUser) => void;
  onDeleteUser?: (id: string) => void;
  churchName: string;
  onChurchNameChange: (name: string) => void;
  churchCnpj: string;
  onChurchCnpjChange: (cnpj: string) => void;
  presbyteryName: string;
  onPresbyteryNameChange: (name: string) => void;
  synodName: string;
  onSynodNameChange: (name: string) => void;
  percentualPresbiterio?: number;
  onPercentualPresbiterioChange?: (val: number) => void;
  percentualSinodo?: number;
  onPercentualSinodoChange?: (val: number) => void;
  incomeCategories?: string[];
  onAddIncomeCategory?: (cat: string) => void;
  onEditIncomeCategory?: (index: number, newName: string) => void;
  onDeleteIncomeCategory?: (index: number) => void;
  expenseCategories?: string[];
  onAddExpenseCategory?: (cat: string) => void;
  onEditExpenseCategory?: (index: number, newName: string) => void;
  onDeleteExpenseCategory?: (index: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  activeRole = 'Tesoureiro',
  systemUsers = [],
  onAddUser,
  onEditUser,
  onDeleteUser,
  churchName,
  onChurchNameChange,
  churchCnpj,
  onChurchCnpjChange,
  presbyteryName,
  onPresbyteryNameChange,
  synodName,
  onSynodNameChange,
  percentualPresbiterio = 10,
  onPercentualPresbiterioChange,
  percentualSinodo = 10,
  onPercentualSinodoChange,
  incomeCategories = ['Dízimo', 'Oferta', 'Evento / Acampamento', 'Outros'],
  onAddIncomeCategory,
  onEditIncomeCategory,
  onDeleteIncomeCategory,
  expenseCategories = [
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
  ],
  onAddExpenseCategory,
  onEditExpenseCategory,
  onDeleteExpenseCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'Geral' | 'Categorias' | 'Permissoes' | 'Usuarios'>('Geral');

  // Gestão de Usuários (Exclusivo Administrador com Supabase)
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string>('');
  const [isSubmittingUser, setIsSubmittingUser] = useState<boolean>(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [userNameInput, setUserNameInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [userPasswordInput, setUserPasswordInput] = useState('');
  const [userRoleInput, setUserRoleInput] = useState<UserRole>('Tesoureiro');

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError('');
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (error) {
        console.warn('Aviso ao buscar perfis do Supabase:', error.message || error);
        setUsersError('Não foi possível carregar os usuários do Supabase.');
        if (systemUsers && systemUsers.length > 0) {
          setUsers(systemUsers);
        }
      } else if (data) {
        const mapped: SystemUser[] = data.map((row: any) => ({
          id: String(row.id),
          name: row.name || row.email?.split('@')[0] || 'Usuário',
          email: row.email || '',
          role: (row.role as UserRole) || 'Tesoureiro',
          createdAt: row.created_at
            ? new Date(row.created_at).toISOString().split('T')[0]
            : row.createdAt || undefined,
        }));
        setUsers(mapped);
      }
    } catch (err: any) {
      console.error('Exceção ao carregar usuários:', err);
      setUsersError('Erro de comunicação com o serviço de banco de dados.');
      if (systemUsers && systemUsers.length > 0) {
        setUsers(systemUsers);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Usuarios') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleOpenNewUser = () => {
    setEditingUser(null);
    setUserNameInput('');
    setUserEmailInput('');
    setUserPasswordInput('');
    setUserRoleInput('Tesoureiro');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: SystemUser) => {
    setEditingUser(user);
    setUserNameInput(user.name);
    setUserEmailInput(user.email);
    setUserPasswordInput('');
    setUserRoleInput(user.role);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput.trim() || !userEmailInput.trim()) return;

    setIsSubmittingUser(true);
    try {
      if (editingUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name: userNameInput.trim(),
            email: userEmailInput.trim().toLowerCase(),
            role: userRoleInput,
          })
          .eq('id', editingUser.id);

        if (error) {
          console.warn('Aviso ao atualizar perfil no Supabase:', error);
        }

        const updated: SystemUser = {
          ...editingUser,
          name: userNameInput.trim(),
          email: userEmailInput.trim().toLowerCase(),
          role: userRoleInput,
        };
        if (onEditUser) onEditUser(updated);
      } else {
        const newUserId = crypto.randomUUID ? crypto.randomUUID() : `usr-${Date.now()}`;
        const { error } = await supabase.from('profiles').insert([
          {
            id: newUserId,
            name: userNameInput.trim(),
            email: userEmailInput.trim().toLowerCase(),
            role: userRoleInput,
          },
        ]);

        if (error) {
          console.warn('Aviso ao inserir perfil no Supabase:', error);
        }

        const newUser: SystemUser = {
          id: newUserId,
          name: userNameInput.trim(),
          email: userEmailInput.trim().toLowerCase(),
          role: userRoleInput,
          createdAt: new Date().toISOString().split('T')[0],
        };
        if (onAddUser) onAddUser(newUser);
      }

      await fetchUsers();
      setIsUserModalOpen(false);
    } catch (err) {
      console.error('Erro ao salvar usuário:', err);
    } finally {
      setIsSubmittingUser(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) {
          console.warn('Erro ao deletar perfil do Supabase:', error);
        }
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (onDeleteUser) onDeleteUser(userId);
      } catch (err) {
        console.error('Erro ao excluir usuário:', err);
      }
    }
  };

  // Form states for single church editing
  const [inputChurch, setInputChurch] = useState(churchName);
  const [inputCnpj, setInputCnpj] = useState(churchCnpj);
  const [inputPresbytery, setInputPresbytery] = useState(presbyteryName);
  const [inputSynod, setInputSynod] = useState(synodName);
  const [inputPercentualPresbiterio, setInputPercentualPresbiterio] = useState<number>(percentualPresbiterio);
  const [inputPercentualSinodo, setInputPercentualSinodo] = useState<number>(percentualSinodo);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Category CRUD Local UI State
  const [newIncomeInput, setNewIncomeInput] = useState('');
  const [editingIncomeIndex, setEditingIncomeIndex] = useState<number | null>(null);
  const [editingIncomeText, setEditingIncomeText] = useState('');

  const [newExpenseInput, setNewExpenseInput] = useState('');
  const [editingExpenseIndex, setEditingExpenseIndex] = useState<number | null>(null);
  const [editingExpenseText, setEditingExpenseText] = useState('');

  // Delete Confirmation State
  const [isClearActiveConfirmOpen, setIsClearActiveConfirmOpen] = useState(false);

  // Category Handlers
  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIncomeInput.trim() && onAddIncomeCategory) {
      onAddIncomeCategory(newIncomeInput.trim());
      setNewIncomeInput('');
    }
  };

  const handleSaveIncomeEdit = (index: number) => {
    if (editingIncomeText.trim() && onEditIncomeCategory) {
      onEditIncomeCategory(index, editingIncomeText.trim());
    }
    setEditingIncomeIndex(null);
    setEditingIncomeText('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpenseInput.trim() && onAddExpenseCategory) {
      onAddExpenseCategory(newExpenseInput.trim());
      setNewExpenseInput('');
    }
  };

  const handleSaveExpenseEdit = (index: number) => {
    if (editingExpenseText.trim() && onEditExpenseCategory) {
      onEditExpenseCategory(index, editingExpenseText.trim());
    }
    setEditingExpenseIndex(null);
    setEditingExpenseText('');
  };

  // Handle Save Form
  const handleSaveActiveOrg = (e: React.FormEvent) => {
    e.preventDefault();
    onChurchNameChange(inputChurch || 'Igreja Presbiteriana sem nome');
    onChurchCnpjChange(inputCnpj || '00.000.000/0000-00');
    onPresbyteryNameChange(inputPresbytery || 'Presbitério não informado');
    onSynodNameChange(inputSynod || 'Sínodo não informado');
    if (onPercentualPresbiterioChange) {
      onPercentualPresbiterioChange(Number(inputPercentualPresbiterio) || 10);
    }
    if (onPercentualSinodoChange) {
      onPercentualSinodoChange(Number(inputPercentualSinodo) || 10);
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Handle Clear/Delete Active Form values
  const handleConfirmClearActive = () => {
    setInputChurch('');
    setInputCnpj('');
    setInputPresbytery('');
    setInputSynod('');
    setInputPercentualPresbiterio(10);
    setInputPercentualSinodo(10);
    onChurchNameChange('Igreja Presbiteriana (A definir)');
    onChurchCnpjChange('00.000.000/0000-00');
    onPresbyteryNameChange('Presbitério (A definir)');
    onSynodNameChange('Sínodo (A definir)');
    if (onPercentualPresbiterioChange) onPercentualPresbiterioChange(10);
    if (onPercentualSinodoChange) onPercentualSinodoChange(10);
    setIsClearActiveConfirmOpen(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs w-full min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-100 text-slate-800 rounded-lg shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Configurações e Parâmetros Institucionais
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão dos dados da Igreja Presbiteriana, Presbitério, Sínodo e Matriz de Permissões
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Acesso Restrito: Tesouraria & Conselho</span>
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('Geral')}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'Geral'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Church className="w-4 h-4" />
          <span>Dados da Igreja, Presbitério e Sínodo</span>
        </button>

        <button
          onClick={() => setActiveTab('Categorias')}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'Categorias'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Gerenciamento de Categorias</span>
        </button>

        <button
          onClick={() => setActiveTab('Permissoes')}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'Permissoes'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Matriz de Permissões</span>
        </button>

        {activeRole === 'Administrador' && (
          <button
            id="tab-system-users"
            onClick={() => setActiveTab('Usuarios')}
            className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'Usuarios'
                ? 'border-teal-600 text-teal-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários do Sistema</span>
          </button>
        )}
      </div>

      {/* TAB 1: GERAL (Igreja, Presbitério, Sínodo) */}
      {activeTab === 'Geral' && (
        <div className="space-y-6">
          {/* Success Banner */}
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Dados da Igreja, Presbitério e Sínodo atualizados e salvos com sucesso!</span>
            </div>
          )}

          {/* Form: Edição dos Nomes Ativos */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Identificação da Igreja e Concílios Superiores
                </h3>
                <p className="text-xs text-slate-500">
                  Insira ou atualize o nome da sua Igreja local, Presbitério (PRST) e Sínodo (SND)
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsClearActiveConfirmOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir / Limpar Campos</span>
              </button>
            </div>

            <form onSubmit={handleSaveActiveOrg} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Church className="w-4 h-4 text-teal-600" />
                    <span>Nome da Igreja Presbiteriana</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1ª Igreja Presbiteriana Central"
                    value={inputChurch}
                    onChange={(e) => setInputChurch(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-teal-600" />
                    <span>CNPJ da Igreja</span>
                  </label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={inputCnpj}
                    onChange={(e) => setInputCnpj(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-teal-600" />
                    <span>Nome do Presbitério (PRST)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Presbitério Central de SP (PRST)"
                    value={inputPresbytery}
                    onChange={(e) => setInputPresbytery(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-teal-600" />
                    <span>Nome do Sínodo (SND)</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sínodo de São Paulo (SSP)"
                    value={inputSynod}
                    onChange={(e) => setInputSynod(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-teal-600" />
                    <span>Percentual de Repasse - Presbitério (%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={inputPercentualPresbiterio}
                    onChange={(e) => setInputPercentualPresbiterio(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-sky-600" />
                    <span>Percentual de Repasse - Sínodo (%)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    required
                    value={inputPercentualSinodo}
                    onChange={(e) => setInputPercentualSinodo(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: GERENCIAMENTO DE CATEGORIAS */}
      {activeTab === 'Categorias' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-teal-600" />
                <span>Gerenciamento de Categorias de Entrada e Saída</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cadastre, edite e remova tipos de receitas e despesas para personalização dos lançamentos da tesouraria.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Lista de Categorias de Entrada */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h4 className="text-xs font-extrabold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Categorias de Entrada (Receitas)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {incomeCategories.length} itens
                  </span>
                </div>

                {/* Form Adicionar Entrada */}
                <form onSubmit={handleAddIncome} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova categoria de entrada..."
                    value={newIncomeInput}
                    onChange={(e) => setNewIncomeInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!newIncomeInput.trim()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </form>

                {/* Listagem Entradas */}
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {incomeCategories.map((cat, idx) => (
                    <div
                      key={`inc-${idx}`}
                      className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-2xs hover:border-slate-300 transition-all text-xs"
                    >
                      {editingIncomeIndex === idx ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingIncomeText}
                            onChange={(e) => setEditingIncomeText(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveIncomeEdit(idx)}
                            className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded cursor-pointer"
                            title="Salvar alteração"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIncomeIndex(null);
                              setEditingIncomeText('');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-slate-700 truncate">{cat}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingIncomeIndex(idx);
                                setEditingIncomeText(cat);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Editar categoria"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteIncomeCategory && onDeleteIncomeCategory(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Excluir categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de Categorias de Saída */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                  <h4 className="text-xs font-extrabold text-rose-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Categorias de Saída (Despesas)
                  </h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {expenseCategories.length} itens
                  </span>
                </div>

                {/* Form Adicionar Saída */}
                <form onSubmit={handleAddExpense} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nova categoria de saída..."
                    value={newExpenseInput}
                    onChange={(e) => setNewExpenseInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                  <button
                    type="submit"
                    disabled={!newExpenseInput.trim()}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar</span>
                  </button>
                </form>

                {/* Listagem Saídas */}
                <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                  {expenseCategories.map((cat, idx) => (
                    <div
                      key={`exp-${idx}`}
                      className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-2xs hover:border-slate-300 transition-all text-xs"
                    >
                      {editingExpenseIndex === idx ? (
                        <div className="flex items-center gap-1.5 flex-1">
                          <input
                            type="text"
                            value={editingExpenseText}
                            onChange={(e) => setEditingExpenseText(e.target.value)}
                            className="flex-1 px-2 py-1 text-xs bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveExpenseEdit(idx)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded cursor-pointer"
                            title="Salvar alteração"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpenseIndex(null);
                              setEditingExpenseText('');
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="font-bold text-slate-700 truncate">{cat}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingExpenseIndex(idx);
                                setEditingExpenseText(cat);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                              title="Editar categoria"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteExpenseCategory && onDeleteExpenseCategory(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Excluir categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MATRIZ DE PERMISSÕES */}
      {activeTab === 'Permissoes' && (
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 w-full max-w-full overflow-x-hidden">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              Matriz de Acesso e Segurança por Perfil
            </h3>
            <p className="text-xs text-slate-500">
              Regras de permissões configuradas conforme a constituição e prática das tesourarias da IPB
            </p>
          </div>

          {/* Mobile View: Vertical Cards */}
          <div className="flex md:hidden flex-col gap-4 w-full">
            {/* Card 1 */}
            <div className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
                Módulo de Configurações e Dados da Igreja
              </div>
              <div className="p-3 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Tesoureiro:</span>
                  <span className="text-emerald-600 font-black px-2 py-0.5 rounded bg-emerald-50">
                    Acesso Total
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Presbítero (Conselho):</span>
                  <span className="text-teal-600 font-bold px-2 py-0.5 rounded bg-teal-50">
                    Acesso Total
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Pastor:</span>
                  <span className="text-rose-600 font-bold px-2 py-0.5 rounded bg-rose-50">
                    Acesso Negado (Restrito)
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
                Lançamento de Dízimos & Ofertas
              </div>
              <div className="p-3 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Tesoureiro:</span>
                  <span className="text-emerald-600 font-black px-2 py-0.5 rounded bg-emerald-50">
                    Acesso Total
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Presbítero (Conselho):</span>
                  <span className="text-slate-700 font-semibold">Leitura / Auditoria</span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Pastor:</span>
                  <span className="text-slate-700 font-semibold">Leitura Resumida</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
                Aprovação de Contas a Pagar
              </div>
              <div className="p-3 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Tesoureiro:</span>
                  <span className="text-emerald-600 font-bold px-2 py-0.5 rounded bg-emerald-50">
                    Executa
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Presbítero (Conselho):</span>
                  <span className="text-teal-600 font-bold px-2 py-0.5 rounded bg-teal-50">
                    Aprova
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Pastor:</span>
                  <span className="text-teal-600 font-bold px-2 py-0.5 rounded bg-teal-50">
                    Aprova
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="flex flex-col w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-slate-800 text-xs">
                Repasse ao Presbitério (10%) e Sínodo
              </div>
              <div className="p-3 flex flex-col gap-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 font-medium">Tesoureiro:</span>
                  <span className="text-emerald-600 font-bold px-2 py-0.5 rounded bg-emerald-50">
                    Transfere / Emite Guia
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Presbítero (Conselho):</span>
                  <span className="text-emerald-600 font-bold px-2 py-0.5 rounded bg-emerald-50">
                    Homologa / Fiscaliza
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                  <span className="text-slate-500 font-medium">Pastor:</span>
                  <span className="text-slate-700 font-semibold">Acompanha</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop View: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Módulo / Funcionalidade</th>
                  <th className="py-3 px-4 text-center">Tesoureiro</th>
                  <th className="py-3 px-4 text-center">Presbítero (Conselho)</th>
                  <th className="py-3 px-4 text-center">Pastor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    Módulo de Configurações e Dados da Igreja
                  </td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-extrabold bg-emerald-50/50">
                    Acesso Total
                  </td>
                  <td className="py-3 px-4 text-center text-teal-600 font-bold bg-teal-50/30">
                    Acesso Total
                  </td>
                  <td className="py-3 px-4 text-center text-rose-600 font-bold bg-rose-50/30">
                    Acesso Negado (Restrito)
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Lançamento de Dízimos & Ofertas</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">Acesso Total</td>
                  <td className="py-3 px-4 text-center text-slate-600">Leitura / Auditoria</td>
                  <td className="py-3 px-4 text-center text-slate-600">Leitura Resumida</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Aprovação de Contas a Pagar</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">Executa</td>
                  <td className="py-3 px-4 text-center text-teal-600 font-bold">Aprova</td>
                  <td className="py-3 px-4 text-center text-teal-600 font-bold">Aprova</td>
                </tr>
                <tr>
                  <td className="py-3 px-4">Repasse ao Presbitério (10%) e Sínodo</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">Transfere / Emite Guia</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">Homologa / Fiscaliza</td>
                  <td className="py-3 px-4 text-center text-slate-600">Acompanha</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: USUÁRIOS DO SISTEMA (Exclusivo Administrador) */}
      {activeTab === 'Usuarios' && activeRole === 'Administrador' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Gestão de Usuários e Níveis de Acesso
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Cadastre, edite e gerencie o nível de privilégios de todos os usuários do sistema.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchUsers}
                disabled={isLoadingUsers}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                title="Recarregar usuários do banco"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin text-teal-600' : ''}`} />
              </button>
              <button
                id="add-new-user-btn"
                onClick={handleOpenNewUser}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>Novo Usuário</span>
              </button>
            </div>
          </div>

          {/* Feedback de Erro */}
          {usersError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{usersError}</span>
              </div>
              <button
                onClick={fetchUsers}
                className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-900 rounded font-bold text-[11px] cursor-pointer shrink-0"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {/* User List Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {isLoadingUsers ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-600">Carregando usuários do Supabase...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">Nenhum usuário cadastrado no Supabase</p>
                <p className="text-xs text-slate-400">Clique em "Novo Usuário" para cadastrar um perfil.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Usuário / Nome</th>
                      <th className="py-3 px-4">E-mail</th>
                      <th className="py-3 px-4">Cargo / Função</th>
                      <th className="py-3 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {users.map((user) => {
                      const getBadgeClass = (r: UserRole) => {
                        switch (r) {
                          case 'Administrador':
                            return 'bg-purple-100 text-purple-800 border-purple-200';
                          case 'Tesoureiro':
                            return 'bg-teal-100 text-teal-800 border-teal-200';
                          case 'Presbítero':
                            return 'bg-blue-100 text-blue-800 border-blue-200';
                          case 'Pastor':
                            return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                          default:
                            return 'bg-slate-100 text-slate-800 border-slate-200';
                        }
                      };

                      return (
                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-black flex items-center justify-center border border-slate-200 text-xs shrink-0">
                              {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{user.name || 'Sem nome'}</p>
                              {user.createdAt && (
                                <p className="text-[10px] text-slate-400 font-normal">Criado em: {user.createdAt}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">
                            {user.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                                title="Editar Usuário"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Excluir Usuário"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Administrativo de Cadastro/Edição de Usuário */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-800 font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingUser ? 'Atualize as permissões e dados do usuário' : 'Preencha os dados e defina o cargo'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="Ex: joao@ipb.org.br"
                  value={userEmailInput}
                  onChange={(e) => setUserEmailInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? 'Deixe em branco para manter a atual' : 'Digite a senha inicial'}
                  value={userPasswordInput}
                  onChange={(e) => setUserPasswordInput(e.target.value)}
                  required={!editingUser}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Cargo / Função (Nível de Acesso)
                </label>
                <select
                  value={userRoleInput}
                  onChange={(e) => setUserRoleInput(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-bold bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Tesoureiro">Tesoureiro</option>
                  <option value="Presbítero">Presbítero</option>
                  <option value="Pastor">Pastor</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmittingUser}
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingUser}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmittingUser ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingUser ? 'Salvar Alterações' : 'Cadastrar Usuário'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmação Limpar Campos Ativos */}
      {isClearActiveConfirmOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Excluir / Limpar Dados</h3>
                <p className="text-xs text-slate-500">Deseja limpar os nomes da Igreja, Presbitério e Sínodo?</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmClearActive}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
              >
                Confirmar e Limpar
              </button>
              <button
                onClick={() => setIsClearActiveConfirmOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
