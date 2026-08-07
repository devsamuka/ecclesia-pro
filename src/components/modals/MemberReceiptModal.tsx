import React from 'react';
import { X, Printer, Cross, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Transaction } from '../../types';

interface MemberReceiptModalProps {
  transaction: Transaction | null;
  churchName: string;
  onClose: () => void;
}

export const MemberReceiptModal: React.FC<MemberReceiptModalProps> = ({
  transaction,
  churchName,
  onClose,
}) => {
  if (!transaction) return null;

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <h3 className="font-extrabold text-slate-900 text-sm">
              Comprovante Oficial de Dízimos e Ofertas
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Printable Card */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 p-6 rounded-xl space-y-4 text-xs">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold">
                <Cross className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-xs">{churchName}</h4>
                <p className="text-[10px] text-slate-500">Igreja Presbiteriana do Brasil (IPB)</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-400">
              #{transaction.id.toUpperCase()}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Contribuinte / Membro:</span>
              <span className="font-bold text-slate-900">
                {transaction.isAnonymous
                  ? 'Membro Anônimo'
                  : transaction.memberName || 'Contribuição Diversa'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Tipo de Contribuição:</span>
              <span className="font-bold text-teal-700">{transaction.category}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Data do Recebimento:</span>
              <span className="font-mono text-slate-800">
                {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Forma de Pagamento:</span>
              <span className="font-bold text-slate-800">{transaction.paymentMethod}</span>
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
              <span className="font-bold text-slate-700">Valor Recebido:</span>
              <span className="font-black text-teal-700">{formatBRL(transaction.amount)}</span>
            </div>
          </div>

          {/* Treasurer Signature Line */}
          <div className="pt-6 border-t border-slate-200 text-center space-y-1">
            <div className="w-48 mx-auto border-b border-slate-400" />
            <p className="font-bold text-slate-800 text-[11px]">Tesouraria do Conselho IPB</p>
            <p className="text-[9px] text-slate-400">“Cada um contribua segundo propôs no seu coração” (2 Co 9:7)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
