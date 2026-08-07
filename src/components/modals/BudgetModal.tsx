import React, { useState, useEffect } from 'react';
import { X, Target, CheckCircle2 } from 'lucide-react';
import { MonthlyBudget, TransactionCategory } from '../../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: MonthlyBudget) => void;
  editingBudget?: MonthlyBudget | null;
  expenseCategories?: string[];
}

const CATEGORIES: TransactionCategory[] = [
  'Luz e Água',
  'Apoio Pastoral',
  'Apoio Missionário',
  'Manutenção e Conservação',
  'Educação Cristã e EBD',
  'Ação Social e Diaconia',
  'Cuidado Congregacional',
  'Evento / Acampamento',
  'Repasse Presbitério',
  'Repasse Sínodo',
  'Outros',
];

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBudget,
  expenseCategories,
}) => {
  const availableCategories = expenseCategories && expenseCategories.length > 0 ? expenseCategories : CATEGORIES;
  const [category, setCategory] = useState<TransactionCategory>(availableCategories[0] || 'Luz e Água');
  const [budgetedAmount, setBudgetedAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category);
      setBudgetedAmount(editingBudget.budgetedAmount.toString());
      setActualAmount(editingBudget.actualAmount.toString());
      setMonth(editingBudget.month || new Date().toISOString().slice(0, 7));
    } else {
      setCategory('Luz e Água');
      setBudgetedAmount('');
      setActualAmount('0');
      setMonth(new Date().toISOString().slice(0, 7));
    }
  }, [editingBudget, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBudgeted = parseFloat(budgetedAmount.replace(',', '.'));
    const numActual = parseFloat((actualAmount || '0').replace(',', '.')) || 0;

    if (isNaN(numBudgeted) || numBudgeted <= 0) return;

    const budgetToSave: MonthlyBudget = {
      id: editingBudget ? editingBudget.id : `bgt-${Date.now()}`,
      category,
      budgetedAmount: numBudgeted,
      actualAmount: numActual,
      month,
    };

    onSave(budgetToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingBudget ? 'Editar Meta / Orçamento' : 'Novo Orçamento / Meta'}
              </h3>
              <p className="text-xs text-slate-500">Definição de teto orçamentário por categoria</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Categoria Orçamentária</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor Orçado / Teto (R$)</label>
              <input
                type="text"
                required
                placeholder="0,00"
                value={budgetedAmount}
                onChange={(e) => setBudgetedAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Executado Atual (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Mês de Referência</label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingBudget ? 'Salvar Alterações' : 'Criar Meta Orçamentária'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
