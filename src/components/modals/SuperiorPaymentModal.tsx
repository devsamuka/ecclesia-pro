import React, { useState, useEffect } from 'react';
import { X, Landmark, CheckCircle2 } from 'lucide-react';
import { SuperiorPayment } from '../../types';

interface SuperiorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: SuperiorPayment) => void;
  editingPayment?: SuperiorPayment | null;
  defaultEntity?: 'Presbitério' | 'Sínodo' | 'Supremo Concílio' | 'TBN / Jubilação';
}

export const SuperiorPaymentModal: React.FC<SuperiorPaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPayment,
  defaultEntity = 'Presbitério',
}) => {
  const [entity, setEntity] = useState<'Presbitério' | 'Sínodo' | 'Supremo Concílio' | 'TBN / Jubilação'>(
    defaultEntity
  );
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentDate, setPaymentDate] = useState('');
  const [status, setStatus] = useState<'Pago' | 'Pendente' | 'Parcial'>('Pendente');
  const [receiptNumber, setReceiptNumber] = useState('');

  useEffect(() => {
    if (editingPayment) {
      setEntity(editingPayment.entity);
      setDescription(editingPayment.description);
      setAmount(editingPayment.amount.toString());
      setTargetAmount(editingPayment.targetAmount.toString());
      setDueDate(editingPayment.dueDate || new Date().toISOString().slice(0, 10));
      setPaymentDate(editingPayment.paymentDate || '');
      setStatus(editingPayment.status);
      setReceiptNumber(editingPayment.receiptNumber || '');
    } else {
      setEntity(defaultEntity);
      setDescription(
        defaultEntity === 'Presbitério'
          ? 'Repasse Mensal Estatutário Presbitério (10% Dízimos)'
          : defaultEntity === 'Sínodo'
          ? 'Quota Conciliar Sínodo'
          : 'Contribuição Conciliar'
      );
      setAmount('');
      setTargetAmount('');
      setDueDate(new Date().toISOString().slice(0, 10));
      setPaymentDate('');
      setStatus('Pendente');
      setReceiptNumber('');
    }
  }, [editingPayment, defaultEntity, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.toString().replace(',', '.'));
    const numTarget = parseFloat(targetAmount.toString().replace(',', '.')) || numAmount;

    if (!description || isNaN(numAmount) || numAmount < 0) return;

    const payment: SuperiorPayment = {
      id: editingPayment ? editingPayment.id : `sup-${Date.now()}`,
      entity,
      description,
      amount: numAmount,
      targetAmount: numTarget,
      dueDate,
      paymentDate: paymentDate ? paymentDate : status === 'Pago' ? new Date().toISOString().slice(0, 10) : undefined,
      status,
      receiptNumber: receiptNumber || undefined,
    };

    onSave(payment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {editingPayment ? 'Editar Contribuição Conciliar' : 'Nova Contribuição Conciliar'}
              </h3>
              <p className="text-xs text-slate-500">Gestão de repasses ao Presbitério e Sínodo</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Entidade Conciliar</label>
              <select
                value={entity}
                onChange={(e) =>
                  setEntity(e.target.value as 'Presbitério' | 'Sínodo' | 'Supremo Concílio' | 'TBN / Jubilação')
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Presbitério">Presbitério</option>
                <option value="Sínodo">Sínodo</option>
                <option value="Supremo Concílio">Supremo Concílio</option>
                <option value="TBN / Jubilação">TBN / Jubilação</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Pago' | 'Pendente' | 'Parcial')}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="Pendente">Pendente</option>
                <option value="Pago">Pago</option>
                <option value="Parcial">Parcial</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Descrição / Finalidade</label>
            <input
              type="text"
              required
              placeholder="Ex: Quota Estatutária IPB (10%), Fundo de Missões"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Valor do Repasse (R$)</label>
              <input
                type="text"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Meta / Quota Prevista (R$)</label>
              <input
                type="text"
                placeholder="0,00 (opcional)"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Data de Pagamento (opcional)</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => {
                  setPaymentDate(e.target.value);
                  if (e.target.value) setStatus('Pago');
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Nº Comprovante / Recibo (opcional)</label>
            <input
              type="text"
              placeholder="Ex: PRST-2026-08-102"
              value={receiptNumber}
              onChange={(e) => setReceiptNumber(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          <div className="flex gap-2 pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{editingPayment ? 'Salvar Alterações' : 'Cadastrar Contribuição'}</span>
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
