import React, { useState, useEffect } from 'react';
import {
  Settings,
  Church,
  Landmark,
  Building,
  Save,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Check,
  X,
  Percent,
  Tag,
  Plus,
  Pencil,
  Users
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
        setUsersError('Não foi possível carregar os usuários do Supabase.');
        if (systemUsers && systemUsers.length > 0) setUsers(systemUsers);
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
      setUsersError('Erro de comunicação com o serviço de banco de dados.');
      if (systemUsers && systemUsers.length > 0) setUsers(systemUsers);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Usuarios') {
      fetchUsers();
    }
  }, [activeTab]);

  // Form states for single church editing
  const [inputChurch, setInputChurch] = useState(churchName);
  const [inputCnpj, setInputCnpj] = useState(churchCnpj);
  const [inputPresbytery, setInputPresbytery] = useState(presbyteryName);
  const [inputSynod, setInputSynod] = useState(synodName);
  const [inputPercentualPresbiterio, setInputPercentualPresbiterio] = useState<number>(percentualPresbiterio);
  const [inputPercentualSinodo, setInputPercentualSinodo] = useState<number>(percentualSinodo);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // NOVO: BUSCAR DADOS DA IGREJA NO SUPABASE
  useEffect(() => {
    const fetchChurchSettings = async () => {
      try {
        const { data, error } = await supabase.from('church_settings').select('*').eq('id', 1).single();
        if (data && !error) {
          setInputChurch(data.church_name || churchName);
          setInputCnpj(data.church_cnpj || churchCnpj);
          setInputPresbytery(data.presbytery_name || presbyteryName);
          setInputSynod(data.synod_name || synodName);
          setInputPercentualPresbiterio(data.percentual_presbiterio || percentualPresbiterio);
          setInputPercentualSinodo(data.percentual_sinodo || percentualSinodo);
          
          // Sincroniza com o resto do sistema
          if (data.church_name) onChurchNameChange(data.church_name);
          if (data.church_cnpj) onChurchCnpjChange(data.church_cnpj);
          if (data.presbytery_name) onPresbyteryNameChange(data.presbytery_name);
          if (data.synod_name) onSynodNameChange(data.synod_name);
          if (data.percentual_presbiterio && onPercentualPresbiterioChange) onPercentualPresbiterioChange(data.percentual_presbiterio);
          if (data.percentual_sinodo && onPercentualSinodoChange) onPercentualSinodoChange(data.percentual_sinodo);
        }
      } catch (err) {
        console.error('Erro ao buscar configurações da igreja:', err);
      }
    };

    if (activeTab === 'Geral') {
      fetchChurchSettings();
    }
  }, [activeTab]);

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

  // NOVO: SALVAR DADOS DA IGREJA NO SUPABASE
  const handleSaveActiveOrg = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Salva no banco de dados real
      const { error } = await supabase.from('church_settings').upsert({
        id: 1,
        church_name: inputChurch || 'Igreja Presbiteriana sem nome',
        church_cnpj: inputCnpj || '00.000.000/0000-00',
        presbytery_name: inputPresbytery || 'Presbitério não informado',
        synod_name: inputSynod || 'Sínodo não informado',
        percentual_presbiterio: inputPercentualPresbiterio || 10,
        percentual_sinodo: inputPercentualSinodo || 10
      });

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        alert('Ocorreu um erro ao salvar no banco de dados. Certifique-se de ter criado a tabela no Supabase conforme as instruções.');
        return;
      }

      // 2. Atualiza a tela do sistema
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
    } catch (err) {
      console.error('Falha na conexão ao salvar:', err);
    }
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
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('Geral')}
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
          className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
            className={`pb-3 px-3 transition-colors border-b-2 cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
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
          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Dados da Igreja, Presbitério e Sínodo atualizados e salvos com sucesso!</span>
            </div>
          )}

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
                <span>Limpar Campos</span>
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

      {/* TAB: PERMISSÕES */}
      {activeTab === 'Permissoes' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Matriz de Permissões
          </h3>
          <p className="text-sm text-slate-600">
            Esta área gerencia as permissões de acesso de cada função do sistema (Tesoureiro, Administrador, Conselho).
          </p>
        </div>
      )}

      {/* TAB: USUARIOS */}
      {activeTab === 'Usuarios' && activeRole === 'Administrador' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4 relative">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Gestão de Usuários
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                A gestão de usuários e acesso ao sistema foi movida para este painel. Os usuários carregados do Supabase estão sincronizados.
              </p>
            </div>
            
            {/* Botão de Adicionar Novo Usuário */}
            <button
              onClick={() => {
                setEditingUser(null);
                setUserNameInput('');
                setUserEmailInput('');
                setUserPasswordInput('');
                setUserRoleInput('Tesoureiro');
                setIsUserModalOpen(true);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Usuário</span>
            </button>
          </div>

          {/* Renderização dinâmica da lista de usuários */}
          {isLoadingUsers ? (
            <div className="p-8 text-center text-slate-500 text-sm font-bold flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              Carregando usuários do banco de dados...
            </div>
          ) : usersError ? (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-sm font-bold text-center">
              {usersError}
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-bold">
              Nenhum usuário encontrado no sistema.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {users.map((user) => (
                <div key={user.id} className="flex flex-col justify-between p-4 bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors rounded-xl shadow-sm gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-inner">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 leading-tight">{user.name}</p>
                        <p className="text-xs font-medium text-slate-500">{user.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border ${
                      user.role === 'Administrador' 
                        ? 'bg-rose-100 text-rose-800 border-rose-200' 
                        : 'bg-teal-100 text-teal-800 border-teal-200'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  {/* Botões de Ação do Usuário (Editar/Excluir) */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                    <button 
                      onClick={() => {
                        setEditingUser(user);
                        setUserNameInput(user.name);
                        setUserEmailInput(user.email);
                        setUserRoleInput(user.role);
                        setUserPasswordInput(''); // Não mostramos a senha por segurança
                        setIsUserModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                    <button 
                      className="px-3 py-1.5 bg-white border border-rose-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      onClick={() => alert(`A função de excluir o usuário ${user.name} precisa ser conectada ao Supabase!`)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal de Criação/Edição de Usuário */}
          {isUserModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
                    {editingUser ? <Pencil className="w-4 h-4 text-teal-600" /> : <Plus className="w-4 h-4 text-teal-600" />}
                    {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                  </h3>
                  <button 
                    onClick={() => setIsUserModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form className="p-5 space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Função de salvar precisa ser conectada!"); }}>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                    <input 
                      type="text" 
                      required
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
                    <input 
                      type="email" 
                      required
                      value={userEmailInput}
                      onChange={(e) => setUserEmailInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="joao@igreja.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {editingUser ? 'Nova Senha (deixe em branco para não alterar)' : 'Senha de Acesso'}
                    </label>
                    <input 
                      type="password" 
                      required={!editingUser}
                      value={userPasswordInput}
                      onChange={(e) => setUserPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nível de Acesso (Perfil)</label>
                    <select 
                      value={userRoleInput}
                      onChange={(e) => setUserRoleInput(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
                    >
                      <option value="Tesoureiro">Tesoureiro (Acesso padrão)</option>
                      <option value="Conselho">Conselho (Apenas visualização)</option>
                      <option value="Administrador">Administrador (Acesso total)</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                    <button 
                      type="button"
                      onClick={() => setIsUserModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmittingUser}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs shadow-md shadow-teal-600/20 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {isSubmittingUser ? (
                         <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                         <Save className="w-3.5 h-3.5" />
                      )}
                      <span>{editingUser ? 'Salvar Alterações' : 'Criar Usuário'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
