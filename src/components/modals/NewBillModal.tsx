import React, { useState, useEffect } from 'react';
import { X, Receipt, CheckCircle2 } from 'lucide-react';
import { UpcomingBill, TransactionCategory, AccountType } from '../../types';

interface NewBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: UpcomingBill) => void;
  editingBill?: UpcomingBill | null;
  expenseCategories?: string[];
}

export const NewBillModal: React.FC<NewBillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBill,
  expenseCategories = [
    'Luz e Água',
    'Apoio Pastoral',
    'Apoio Missionário',
    'Manutenção e Conservação',
    'Educação Cristã e EBD',
    'Ação Social e Diaconia',
    'Outros',
  ],
}) => {
  const availableCategories = expenseCategories.length > 0 ? expenseCategories : [
    'Luz e Água',
    'Apoio Pastoral',
    'Apoio Missionário',
    'Manutenção e Conservação',
    'Educação Cristã e EBD',
    'Ação Social e Diaconia',
    'Outros',
  ];

  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState<TransactionCategory>(availableCategories[0] || 'Luz e Água');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [account, setAccount] = useState<AccountType>('Conta Dízimos & Ofertas');

  useEffect(() => {
    if (editingBill) {
      setSupplier(editingBill.supplier);
      setCategory(editingBill.category);
      setAmount(editingBill.amount.toString());
      setDueDate(editingBill.dueDate);
      setAccount(editingBill.account || 'Conta Dízimos & Ofertas');
    } else {
      setSupplier('');
      setCategory('Luz e Água');
      setAmount('');
      setDueDate(new Date().toISOString().slice(0, 10));
      setAccount('Conta Dízimos & Ofertas');
    }
  }, [editingBill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.toString().replace(',', '.'));
    if (!supplier || isNaN(num) || num <= 0) return;

    const billToSave: UpcomingBill = {
      id: editingBill ? editingBill.id : `bill-${Date.now()}`,
      supplier,
      category,
      amount: num,
      dueDate,
      status: editingBill ? editingBill.status : 'A vencer',
      account,
    };

    onSave(billToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
              <Receipt className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {editingBill ? 'Editar Conta a Pagar' : 'Agendar Conta a Pagar'}
            </h3>
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
            <label className="font-bold text-slate-700 block mb-1">Fornecedor / Concessionária</label>
            <input
              type="text"
              required
              placeholder="Ex: COPASA, CEMIG, Aluguel"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor (R$)</label>
              <input
                type="text"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Data de Vencimento</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Conta Prevista</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value as AccountType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              >
                <option value="Conta Dízimos & Ofertas">Conta Dízimos & Ofertas</option>
                <option value="Fundo de Construção">Fundo de Construção</option>
                <option value="Fundo de Concílios & Sociedades">Fundo de Concílios</option>
                <option value="Caixa Escolar / EBD">Caixa Escolar / EBD</option>
                <option value="Caixa Diaconia">Caixa Diaconia</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingBill ? 'Salvar Alterações' : 'Agendar Vencimento'}</span>
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
