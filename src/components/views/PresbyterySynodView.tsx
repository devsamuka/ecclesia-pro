import React, { useState } from 'react';
import {
  Landmark,
  CheckCircle2,
  FileText,
  Printer,
  Building,
  Plus,
  Pencil,
  Trash2,
  Building2,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { SuperiorPayment, SynodeGoal, Transaction, UserRole } from '../../types';
import { SuperiorPaymentModal } from '../modals/SuperiorPaymentModal';
import { isDateInPeriod } from '../../utils/periodUtils';

interface PresbyterySynodViewProps {
  superiorPayments: SuperiorPayment[];
  synodGoal: SynodeGoal;
  totalMonthlyTithes: number;
  percentualPresbiterio?: number;
  percentualSinodo?: number;
  onAddSuperiorPayment?: (payment: SuperiorPayment) => void;
  onUpdateSuperiorPayment?: (payment: SuperiorPayment) => void;
  onDeleteSuperiorPayment?: (id: string) => void;
  transactions?: Transaction[];
  selectedPeriod?: string;
  activeRole?: UserRole;
}

export const PresbyterySynodView: React.FC<PresbyterySynodViewProps> = ({
  superiorPayments,
  synodGoal,
  totalMonthlyTithes,
  percentualPresbiterio = 10,
  percentualSinodo = 10,
  onAddSuperiorPayment,
  onUpdateSuperiorPayment,
  onDeleteSuperiorPayment,
  transactions,
  selectedPeriod,
  activeRole = 'Tesoureiro',
}) => {
  const canManageFinances = activeRole === 'Tesoureiro' || activeRole === 'Administrador';
  const [activeGuide, setActiveGuide] = useState<SuperiorPayment | null>(null);
  const [activeTab, setActiveTab] = useState<'Todos' | 'Presbitério' | 'Sínodo' | 'Outros'>('Todos');

  // Modal States for CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<SuperiorPayment | null>(null);
  const [defaultEntityModal, setDefaultEntityModal] = useState<
    'Presbitério' | 'Sínodo' | 'Supremo Concílio' | 'TBN / Jubilação'
  >('Presbitério');

  // Delete Confirmation State
  const [deletingPayment, setDeletingPayment] = useState<SuperiorPayment | null>(null);

  // Dynamic Config States
  const [taxaPresbiterio, setTaxaPresbiterio] = useState<number>(percentualPresbiterio);
  const [taxaSinodo, setTaxaSinodo] = useState<number>(percentualSinodo);

  const getDefaultDueDate = (day: number = 10) => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [vencimentoPresbiterio, setVencimentoPresbiterio] = useState<string>(getDefaultDueDate(10));
  const [vencimentoSinodo, setVencimentoSinodo] = useState<string>(getDefaultDueDate(10));

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Filtered Payments
  const filteredPayments = superiorPayments.filter((p) => {
    if (activeTab === 'Presbitério') return p.entity === 'Presbitério';
    if (activeTab === 'Sínodo') return p.entity === 'Sínodo';
    if (activeTab === 'Outros')
      return p.entity === 'Supremo Concílio' || p.entity === 'TBN / Jubilação';
    return true;
  });

  // Calculate separate metrics for Presbitério and Sínodo
  const presbyteryPayments = superiorPayments.filter((p) => p.entity === 'Presbitério');
  const presbyteryPaidTotal = presbyteryPayments
    .filter((p) => p.status === 'Pago')
    .reduce((sum, p) => sum + p.amount, 0);

  const synodPayments = superiorPayments.filter((p) => p.entity === 'Sínodo');
  const synodPaidTotal = synodPayments
    .filter((p) => p.status === 'Pago')
    .reduce((sum, p) => sum + p.amount, 0);

  // Base total income (Tithes + Offerings) for the current selected month
  const monthIncomeBase =
    transactions && selectedPeriod
      ? transactions
          .filter(
            (t) =>
              (t.category === 'Dízimo' || t.category === 'Oferta') &&
              t.type === 'Entrada' &&
              isDateInPeriod(t.date, selectedPeriod)
          )
          .reduce((sum, t) => sum + t.amount, 0)
      : totalMonthlyTithes;

  // Dynamic calculated target amounts based on configured percentages over total income (Dízimos + Ofertas)
  const calculatedPresbyteryTarget = (monthIncomeBase * taxaPresbiterio) / 100;
  const presbyteryPending = Math.max(0, calculatedPresbyteryTarget - presbyteryPaidTotal);

  const calculatedSynodTarget = (monthIncomeBase * taxaSinodo) / 100;
  const synodPending = Math.max(0, calculatedSynodTarget - synodPaidTotal);

  // Validation for overdue status
  const isOverdue = (dueDateStr: string, pendingAmount: number) => {
    if (pendingAmount <= 0 || !dueDateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dueDateStr.split('-').map(Number);
    if (!year || !month || !day) return false;
    const dueDate = new Date(year, month - 1, day, 23, 59, 59);

    return today > dueDate;
  };

  const isPresbyteryOverdue = isOverdue(vencimentoPresbiterio, presbyteryPending);
  const isSynodOverdue = isOverdue(vencimentoSinodo, synodPending);

  const handleOpenCreateModal = (
    entity: 'Presbitério' | 'Sínodo' | 'Supremo Concílio' | 'TBN / Jubilação' = 'Presbitério'
  ) => {
    setEditingPayment(null);
    setDefaultEntityModal(entity);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (payment: SuperiorPayment) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
  };

  const handleSavePayment = (payment: SuperiorPayment) => {
    if (editingPayment) {
      if (onUpdateSuperiorPayment) {
        onUpdateSuperiorPayment(payment);
      }
    } else {
      if (onAddSuperiorPayment) {
        onAddSuperiorPayment(payment);
      }
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (deletingPayment && onDeleteSuperiorPayment) {
      onDeleteSuperiorPayment(deletingPayment.id);
    }
    setDeletingPayment(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      {/* Header Banner - Softened Light Theme on Mobile, Dark Gradient on Desktop */}
      <div className="bg-white md:bg-gradient-to-r md:from-slate-900 md:via-slate-800 md:to-teal-950 text-slate-800 md:text-white p-4 sm:p-6 rounded-xl shadow-xs md:shadow-md border border-slate-200 md:border-slate-800 w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 md:p-3 bg-teal-50 md:bg-teal-500/20 text-teal-700 md:text-teal-300 rounded-xl border border-teal-200 md:border-teal-500/30 shrink-0">
              <Landmark className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base md:text-xl font-extrabold text-slate-900 md:text-white tracking-tight leading-snug">
                  Presbitério & Sínodo (Igreja Presbiteriana do Brasil)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 md:bg-teal-400 text-teal-800 md:text-slate-950 uppercase shrink-0">
                  Estatuto IPB Art. 88
                </span>
              </div>
              <p className="hidden md:block text-xs text-slate-300 mt-1">
                Gestão dos repasses conciliares.
              </p>
            </div>
          </div>

          {/* Oculto no mobile para evitar ações redundantes e superlotação */}
          {canManageFinances && (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => handleOpenCreateModal('Presbitério')}
                className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Repasse Presbitério</span>
              </button>
              <button
                onClick={() => handleOpenCreateModal('Sínodo')}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Repasse Sínodo</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SEPARATE SUMMARY CARDS: PRESBITÉRIO VS. SÍNODO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Presbitério Summary Card */}
        <div className="bg-white rounded-xl border border-teal-200 p-4 md:p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-600" />
          <div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-50 text-teal-700 font-bold shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Presbitério</h4>
                  <p className="text-[11px] text-slate-500">
                    PRST Central • {presbyteryPayments.length} lançamento(s)
                  </p>
                </div>
              </div>
              {canManageFinances && (
                <button
                  onClick={() => handleOpenCreateModal('Presbitério')}
                  className="w-full sm:w-auto justify-center px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-teal-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Contribuição</span>
                </button>
              )}
            </div>

            {/* Config Controls (Taxa & Vencimento) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200/80 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[11px]">Alíquota (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxaPresbiterio}
                  onChange={(e) => setTaxaPresbiterio(Math.max(0, Number(e.target.value) || 0))}
                  disabled={!canManageFinances}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[11px]">Vencimento:</span>
                <input
                  type="date"
                  value={vencimentoPresbiterio}
                  onChange={(e) => setVencimentoPresbiterio(e.target.value)}
                  disabled={!canManageFinances}
                  className="px-2 py-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">VALOR CALCULADO</span>
                <span className="text-sm font-extrabold text-slate-800 block mt-0.5">
                  {formatBRL(calculatedPresbyteryTarget)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Total Pago</span>
                <span className="text-sm font-extrabold text-teal-700 block mt-0.5">
                  {formatBRL(presbyteryPaidTotal)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Pendente</span>
                  {isPresbyteryOverdue && (
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                      Em Atraso
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-amber-700 block mt-0.5">
                  {formatBRL(presbyteryPending)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sínodo Summary Card */}
        <div className="bg-white rounded-xl border border-sky-200 p-4 md:p-5 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-sky-600" />
          <div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-700 font-bold shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Sínodo</h4>
                  <p className="text-[11px] text-slate-500">
                    Sínodo de São Paulo (SSP) • {synodPayments.length} lançamento(s)
                  </p>
                </div>
              </div>
              {canManageFinances && (
                <button
                  onClick={() => handleOpenCreateModal('Sínodo')}
                  className="w-full sm:w-auto justify-center px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-sky-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Nova Contribuição</span>
                </button>
              )}
            </div>

            {/* Config Controls (Taxa & Vencimento) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200/80 mb-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[11px]">Alíquota (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxaSinodo}
                  onChange={(e) => setTaxaSinodo(Math.max(0, Number(e.target.value) || 0))}
                  disabled={!canManageFinances}
                  className="w-16 px-2 py-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-600 text-[11px]">Vencimento:</span>
                <input
                  type="date"
                  value={vencimentoSinodo}
                  onChange={(e) => setVencimentoSinodo(e.target.value)}
                  disabled={!canManageFinances}
                  className="px-2 py-1 text-xs font-bold border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">VALOR CALCULADO</span>
                <span className="text-sm font-extrabold text-slate-800 block mt-0.5">
                  {formatBRL(calculatedSynodTarget)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Total Pago</span>
                <span className="text-sm font-extrabold text-sky-700 block mt-0.5">
                  {formatBRL(synodPaidTotal)}
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block truncate">Pendente</span>
                  {isSynodOverdue && (
                    <span className="text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                      <AlertTriangle className="w-2.5 h-2.5 text-rose-600" />
                      Em Atraso
                    </span>
                  )}
                </div>
                <span className="text-sm font-extrabold text-amber-700 block mt-0.5">
                  {formatBRL(synodPending)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Superior Payments List Section with Filter Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Gerenciamento de Contribuições e Repasses
            </h3>
            <p className="text-xs text-slate-500">
              Crie, edite e remova os lançamentos do Presbitério e Sínodo
            </p>
          </div>

          {/* Separation Tabs: Todos | Presbitério | Sínodo | Outros */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold self-start sm:self-auto border border-slate-200">
            {(['Todos', 'Presbitério', 'Sínodo', 'Outros'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Payments List */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Landmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">Nenhuma contribuição encontrada nesta categoria.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Clique nos botões acima para adicionar um novo repasse.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPayments.map((p) => (
              <div
                key={p.id}
                className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-lg text-white font-bold text-xs shrink-0 ${
                      p.entity === 'Presbitério'
                        ? 'bg-teal-600'
                        : p.entity === 'Sínodo'
                        ? 'bg-sky-600'
                        : 'bg-purple-600'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm">{p.description}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.entity === 'Presbitério'
                            ? 'bg-teal-100 text-teal-800 border border-teal-200'
                            : p.entity === 'Sínodo'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : 'bg-purple-100 text-purple-800 border border-purple-200'
                        }`}
                      >
                        {p.entity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Vencimento: {new Date(p.dueDate).toLocaleDateString('pt-BR')}
                      {p.paymentDate &&
                        ` • Pago em: ${new Date(p.paymentDate).toLocaleDateString('pt-BR')}`}
                      {p.receiptNumber && ` • Recibo: ${p.receiptNumber}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-200">
                  <div className="text-right">
                    <span className="text-base font-black text-slate-900 block">
                      {formatBRL(p.amount)}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.status === 'Pago'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'Parcial'
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Actions Buttons: Ver Guia | Editar | Excluir */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveGuide(p)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                      title="Ver Guia Oficial"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span className="hidden sm:inline">Guia</span>
                    </button>

                    {canManageFinances && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-teal-50 text-slate-600 hover:text-teal-700 font-bold text-xs shadow-xs cursor-pointer transition-colors"
                          title="Editar Contribuição"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingPayment(p)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs shadow-xs cursor-pointer transition-colors"
                          title="Excluir Contribuição"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Superior Payment Create/Edit Modal */}
      <SuperiorPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePayment}
        editingPayment={editingPayment}
        defaultEntity={defaultEntityModal}
      />

      {/* Delete Confirmation Modal */}
      {deletingPayment && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Confirmar Exclusão</h3>
                <p className="text-xs text-slate-500">Esta ação não poderá ser desfeita.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{deletingPayment.description}</p>
              <p>Entidade: <span className="font-semibold">{deletingPayment.entity}</span></p>
              <p>Valor: <span className="font-bold text-slate-900">{formatBRL(deletingPayment.amount)}</span></p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
              >
                Excluir Contribuição
              </button>
              <button
                onClick={() => setDeletingPayment(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Guia Conciliar */}
      {activeGuide && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Guia Oficial de Repasse Conciliar - IPB
                </h3>
              </div>
              <button
                onClick={() => setActiveGuide(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Entidade Beneficiária:</span>
                <span className="font-bold text-slate-800">{activeGuide.entity}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Descrição da Quota:</span>
                <span className="font-bold text-slate-800">{activeGuide.description}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Vencimento:</span>
                <span className="font-bold text-slate-800">
                  {new Date(activeGuide.dueDate).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 font-medium">Valor Total:</span>
                <span className="font-extrabold text-teal-700 text-sm">
                  {formatBRL(activeGuide.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Número do Comprovante:</span>
                <span className="font-mono text-slate-800 font-bold">
                  {activeGuide.receiptNumber || 'GERANDO-PIX-IPB-9921'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Guia Oficial</span>
              </button>

              <button
                onClick={() => setActiveGuide(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
