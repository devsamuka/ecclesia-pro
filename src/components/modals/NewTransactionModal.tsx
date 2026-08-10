import React, { useState, useEffect } from 'react';
import { X, HeartHandshake, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  AccountType,
  PaymentMethod,
  Member,
} from '../../types';
import {
  createTransactionInSupabase,
  updateTransactionInSupabase,
} from '../../lib/transactionsService';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  editingTransaction?: Transaction | null;
  members: Member[];
  incomeCategories?: string[];
  expenseCategories?: string[];
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  members,
  incomeCategories = ['Dízimo', 'Oferta', 'Evento / Acampamento', 'Outros'],
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
}) => {
  const availableIncome = incomeCategories.length > 0 ? incomeCategories : ['Dízimo', 'Oferta', 'Evento / Acampamento', 'Outros'];
  const availableExpense = expenseCategories.length > 0 ? expenseCategories : ['Apoio Pastoral', 'Luz e Água', 'Manutenção e Conservação', 'Outros'];

  const [type, setType] = useState<TransactionType>('Entrada');
  const [category, setCategory] = useState<TransactionCategory>(availableIncome[0] || 'Dízimo');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [memberName, setMemberName] = useState<string>('');
  const [account, setAccount] = useState<AccountType>('Conta Dízimos & Ofertas');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('PIX');
  const [destinationFund, setDestinationFund] = useState<string>('Caixa Geral');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(false);

    if (editingTransaction) {
      setType(editingTransaction.type);
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setMemberName(editingTransaction.memberName || '');
      setAccount(editingTransaction.account);
      setPaymentMethod(editingTransaction.paymentMethod);
      setDestinationFund(editingTransaction.destinationFund || 'Caixa Geral');
      setNotes(editingTransaction.notes || '');
    } else {
      setType('Entrada');
      setCategory('Dízimo');
      setDescription('');
      setAmount('');
      setDate(new Date().toISOString().slice(0, 10));
      setMemberName('');
      setAccount('Conta Dízimos & Ofertas');
      setPaymentMethod('PIX');
      setDestinationFund('Caixa Geral');
      setNotes('');
    }
  }, [editingTransaction, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const numAmount = parseFloat(amount.toString().replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Por favor, informe um valor numérico válido para o lançamento.');
      return;
    }

    const trimmedMemberName = memberName.trim();
    const finalIsAnonymous = !trimmedMemberName;

    setIsSubmitting(true);

    const txPayload: Omit<Transaction, 'id'> = {
      type,
      category,
      description:
        description ||
        (category === 'Dízimo'
          ? `Dízimo de ${trimmedMemberName || 'Membro'}`
          : 'Oferta de Culto'),
      amount: numAmount,
      date,
      memberName: trimmedMemberName || undefined,
      memberId: undefined,
      isAnonymous: finalIsAnonymous,
      account,
      paymentMethod,
      status: editingTransaction ? editingTransaction.status : 'Concluído',
      destinationFund,
      notes,
    };

    let resultTx: Transaction | null = null;
    let error: any = null;

    if (editingTransaction && editingTransaction.id) {
      const res = await updateTransactionInSupabase(editingTransaction.id, txPayload);
      resultTx = res.data;
      error = res.error;
    } else {
      const res = await createTransactionInSupabase(txPayload);
      resultTx = res.data;
      error = res.error;
    }

    setIsSubmitting(false);

    if (error) {
      console.warn('Erro ao salvar lançamento no Supabase:', error);
      // Salva em memória caso o Supabase não esteja provisionado ou ocorra erro RLS
      const fallbackTx: Transaction = {
        id: editingTransaction ? editingTransaction.id : `tx-${Date.now()}`,
        ...txPayload,
      };
      onSave(fallbackTx);
      setSuccessMessage('Lançamento registrado localmente!');
      setTimeout(() => {
        onClose();
      }, 1000);
      return;
    }

    if (resultTx) {
      setSuccessMessage('Lançamento salvo no Supabase com sucesso!');
      onSave(resultTx);
      setTimeout(() => {
        onClose();
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-base">
              {editingTransaction ? 'Editar Lançamento Financeiro' : 'Novo Lançamento Financeiro'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setType('Entrada');
                if (!availableIncome.includes(category)) {
                  setCategory(availableIncome[0] || 'Dízimo');
                }
              }}
              className={`py-2 rounded-md font-bold cursor-pointer transition-all ${
                type === 'Entrada'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entrada (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('Saída');
                if (!availableExpense.includes(category)) {
                  setCategory(availableExpense[0] || 'Luz e Água');
                }
              }}
              className={`py-2 rounded-md font-bold cursor-pointer transition-all ${
                type === 'Saída'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saída (-)
            </button>
          </div>

          {/* Member Name Input (Optional) */}
          {type === 'Entrada' && (
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <label className="font-bold text-slate-700 block mb-1">
                Nome do Contribuinte (Opcional)
              </label>
              <input
                type="text"
                placeholder="Deixe em branco se for anônimo/coletivo"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
          )}

          {/* Category & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TransactionCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                {type === 'Entrada'
                  ? availableIncome.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  : availableExpense.map((cat) => (
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900"
              />
            </div>
          </div>

          {/* Description & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Dízimo do mês / Oferta"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Data do Lançamento</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              />
            </div>
          </div>

          {/* Account & Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Conta Bancária</label>
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value as AccountType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="Conta Dízimos & Ofertas">Conta Dízimos & Ofertas (Bradesco)</option>
                <option value="Fundo de Construção">Fundo de Construção (Itaú)</option>
                <option value="Fundo de Concílios & Sociedades">
                  Fundo de Concílios (Sicoob)
                </option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Forma de Pagamento</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
              >
                <option value="PIX">PIX (Instantâneo)</option>
                <option value="Dinheiro">Dinheiro (Espécie)</option>
                <option value="Transferência">Transferência Bancária</option>
                <option value="Boleto">Boleto</option>
              </select>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando no Supabase...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingTransaction ? 'Salvar Alterações' : 'Salvar Lançamento'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
