import React, { useState } from 'react';
import { Target, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { MonthlyBudget, UserRole } from '../../types';

interface BudgetsViewProps {
  budgets: MonthlyBudget[];
  onOpenNewBudget?: () => void;
  onEditBudget?: (budget: MonthlyBudget) => void;
  onDeleteBudget?: (budgetId: string) => void;
  activeRole?: UserRole;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  onOpenNewBudget,
  onEditBudget,
  onDeleteBudget,
  activeRole = 'Tesoureiro',
}) => {
  const canManageBudgets =
    activeRole === 'Tesoureiro' ||
    activeRole === 'Administrador' ||
    activeRole === 'Presbítero';
  const [deletingBudget, setDeletingBudget] = useState<MonthlyBudget | null>(null);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.budgetedAmount, 0);
  const totalActual = budgets.reduce((acc, b) => acc + b.actualAmount, 0);

  const handleConfirmDelete = () => {
    if (deletingBudget && onDeleteBudget) {
      onDeleteBudget(deletingBudget.id);
    }
    setDeletingBudget(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs w-full min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Metas e Orçamentos Aprovados
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Acompanhamento e gestão da execução orçamentária do Conselho da Igreja
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Orçamento Total</span>
              <span className="font-bold text-slate-900">{formatBRL(totalBudgeted)}</span>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[10px] text-slate-400 block font-medium">Executado</span>
              <span className="font-bold text-teal-700">{formatBRL(totalActual)}</span>
            </div>
          </div>

          {canManageBudgets && onOpenNewBudget && (
            <button
              onClick={onOpenNewBudget}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Nova Meta Orçamentária</span>
            </button>
          )}
        </div>
      </div>

      {/* Budget Cards Grid */}
      {budgets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
          <Target className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">Nenhuma meta orçamentária cadastrada.</p>
          <p className="text-[11px] text-slate-400">Clique no botão acima para adicionar uma nova meta.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => {
            const percent = b.budgetedAmount > 0
              ? Math.min(Math.round((b.actualAmount / b.budgetedAmount) * 100), 100)
              : 0;
            const isOverBudget = b.actualAmount > b.budgetedAmount;

            return (
              <div
                key={b.id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.category}</h4>
                      {b.month && <span className="text-[10px] text-slate-400 block font-mono">Ref: {b.month}</span>}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        isOverBudget
                          ? 'bg-rose-100 text-rose-800'
                          : percent > 85
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {percent}% Executado
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOverBudget ? 'bg-rose-500' : 'bg-teal-600'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Orçado</span>
                      <span className="font-bold text-slate-700">{formatBRL(b.budgetedAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Realizado</span>
                      <span className="font-black text-slate-900">{formatBRL(b.actualAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {canManageBudgets && (
                  <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100">
                    {onEditBudget && (
                      <button
                        onClick={() => onEditBudget(b)}
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-teal-50 text-slate-600 hover:text-teal-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        title="Editar Meta"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteBudget && (
                      <button
                        onClick={() => setDeletingBudget(b)}
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        title="Excluir Meta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Confirmação de Exclusão de Orçamento/Meta */}
      {deletingBudget && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Excluir Meta Orçamentária</h3>
                <p className="text-xs text-slate-500">Esta ação irá remover a meta orçamentária.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{deletingBudget.category}</p>
              <p>Valor Orçado: <span className="font-black text-slate-900">{formatBRL(deletingBudget.budgetedAmount)}</span></p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
              >
                Excluir Meta
              </button>
              <button
                onClick={() => setDeletingBudget(null)}
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
