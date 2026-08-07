import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  Building,
  Zap,
  UserCheck,
  Heart,
  Wrench,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { UpcomingBill, Transaction, UserRole } from '../../types';
import { formatPeriodLabel, isDateInPeriod } from '../../utils/periodUtils';
import { ExpenseReceiptModal, ExpenseReceiptData } from '../modals/ExpenseReceiptModal';

interface ExpensesViewProps {
  upcomingBills: UpcomingBill[];
  transactions: Transaction[];
  onOpenNewBill: () => void;
  onEditBill?: (bill: UpcomingBill) => void;
  onDeleteBill?: (billId: string) => void;
  onMarkBillPaid: (billId: string) => void;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (txId: string) => void;
  selectedPeriod: string;
  churchName?: string;
  churchCnpj?: string;
  treasurerName?: string;
  activeRole?: UserRole;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  upcomingBills,
  transactions,
  onOpenNewBill,
  onEditBill,
  onDeleteBill,
  onMarkBillPaid,
  onEditTransaction,
  onDeleteTransaction,
  selectedPeriod,
  churchName = '1ª Igreja Presbiteriana Central',
  churchCnpj = '12.345.678/0001-90',
  treasurerName = 'Carlos Santos',
  activeRole = 'Tesoureiro',
}) => {
  const canManageFinances = activeRole === 'Tesoureiro' || activeRole === 'Administrador';
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingBill, setDeletingBill] = useState<UpcomingBill | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [receiptExpense, setReceiptExpense] = useState<ExpenseReceiptData | null>(null);

  const expenseTransactions = transactions.filter(
    (tx) => tx.type === 'Saída' && isDateInPeriod(tx.date, selectedPeriod)
  );

  const filteredBills = upcomingBills.filter((b) =>
    b.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const categoryIcons: Record<string, React.ElementType> = {
    'Luz e Água': Zap,
    'Apoio Pastoral': UserCheck,
    'Apoio Missionário': Heart,
    'Manutenção e Conservação': Wrench,
    'Educação Cristã e EBD': Building,
  };

  const handleConfirmDeleteBill = () => {
    if (deletingBill && onDeleteBill) {
      onDeleteBill(deletingBill.id);
    }
    setDeletingBill(null);
  };

  const handleConfirmDeleteTx = () => {
    if (deletingTx && onDeleteTransaction) {
      onDeleteTransaction(deletingTx.id);
    }
    setDeletingTx(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs w-full min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-800 rounded-lg shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Contas e Despesas Operacionais
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão de fornecedores, concessionárias de serviços públicos e apoio pastoral
          </p>
        </div>

        {canManageFinances && (
          <button
            onClick={onOpenNewBill}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Agendar Nova Conta a Pagar</span>
          </button>
        )}
      </div>

      {/* Contas a Pagar Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <h3 className="text-base font-extrabold text-slate-900">Contas Pendentes e A Vencer</h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar fornecedor (COPASA, CEMIG)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
            />
          </div>
        </div>

        {filteredBills.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs font-bold text-slate-500">
            Nenhuma conta pendente encontrada.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBills.map((bill) => {
              const Icon = categoryIcons[bill.category] || Receipt;
              return (
                <div
                  key={bill.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-all shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-200/80 text-slate-700">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{bill.supplier}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">{bill.category}</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {bill.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Vencimento</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(bill.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Valor</span>
                        <span className="font-black text-slate-900 text-sm">
                          {formatBRL(bill.amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canManageFinances && (
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => onMarkBillPaid(bill.id)}
                        className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pagar</span>
                      </button>

                      {onEditBill && (
                        <button
                          onClick={() => onEditBill(bill)}
                          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-teal-50 text-slate-600 hover:text-teal-700 transition-colors shadow-xs cursor-pointer"
                          title="Editar Conta"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteBill && (
                        <button
                          onClick={() => setDeletingBill(bill)}
                          className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition-colors shadow-xs cursor-pointer"
                          title="Excluir Conta"
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
      </div>

      {/* Histórico de Despesas Pagas */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 shadow-xs w-full">
        <h3 className="text-base font-extrabold text-slate-900 mb-4">
          Histórico de Saídas Concluídas
        </h3>

        {/* Mobile View: Vertical Cards */}
        <div className="flex md:hidden flex-col gap-3 w-full">
          {expenseTransactions.length === 0 ? (
            <p className="py-6 text-center text-slate-400 font-medium text-xs">
              Nenhuma saída registrada.
            </p>
          ) : (
            expenseTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col w-full p-3 bg-white rounded-xl border border-slate-200 gap-2 shadow-2xs"
              >
                {/* Linha Superior */}
                <div className="flex flex-row justify-between items-start w-full gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-xs leading-snug break-words">
                      {tx.description}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{tx.account}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-sm text-slate-900 whitespace-nowrap">
                      - {formatBRL(tx.amount)}
                    </span>
                  </div>
                </div>

                {/* Linha Inferior */}
                <div className="flex flex-row justify-between items-center w-full mt-1 pt-2 border-t border-slate-100 gap-2">
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {tx.category}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          setReceiptExpense({
                            description: tx.description,
                            amount: tx.amount,
                            date: tx.date,
                            supplier: tx.description,
                          })
                        }
                        className="px-2 py-1 rounded bg-teal-50 text-teal-700 hover:bg-teal-100 cursor-pointer flex items-center gap-1 text-[10px] font-bold border border-teal-200"
                        title="Gerar Recibo"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Recibo</span>
                      </button>
                      {canManageFinances && onEditTransaction && (
                        <button
                          onClick={() => onEditTransaction(tx)}
                          className="p-1 rounded text-slate-500 hover:text-teal-700 hover:bg-teal-50 cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canManageFinances && onDeleteTransaction && (
                        <button
                          onClick={() => setDeletingTx(tx)}
                          className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Fornecedor / Item</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Conta Saída</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3 text-right">Valor</th>
                <th className="py-2.5 px-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenseTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-medium">
                    Nenhuma saída registrada.
                  </td>
                </tr>
              ) : (
                expenseTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{tx.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{tx.account}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatBRL(tx.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() =>
                            setReceiptExpense({
                              description: tx.description,
                              amount: tx.amount,
                              date: tx.date,
                              supplier: tx.description,
                            })
                          }
                          className="px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 transition-colors cursor-pointer flex items-center gap-1 font-bold text-[11px]"
                          title="Gerar Recibo"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>Gerar Recibo</span>
                        </button>
                        {canManageFinances && onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                            title="Editar Despesa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canManageFinances && onDeleteTransaction && (
                          <button
                            onClick={() => setDeletingTx(tx)}
                            className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Excluir Despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Confirmação Exclusão da Conta a Pagar */}
      {deletingBill && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Excluir Conta a Pagar</h3>
                <p className="text-xs text-slate-500">Esta ação irá remover o agendamento.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{deletingBill.supplier}</p>
              <p>Categoria: <span className="font-semibold">{deletingBill.category}</span></p>
              <p>
                Valor: <span className="font-black text-slate-900">{formatBRL(deletingBill.amount)}</span>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDeleteBill}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
              >
                Excluir Conta
              </button>
              <button
                onClick={() => setDeletingBill(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação Exclusão do Histórico de Despesa */}
      {deletingTx && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Excluir Despesa</h3>
                <p className="text-xs text-slate-500">Esta ação irá remover o registro do histórico.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{deletingTx.description}</p>
              <p>
                Valor: <span className="font-black text-slate-900">{formatBRL(deletingTx.amount)}</span>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDeleteTx}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
              >
                Excluir Despesa
              </button>
              <button
                onClick={() => setDeletingTx(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão do Recibo da Despesa */}
      <ExpenseReceiptModal
        expense={receiptExpense}
        churchName={churchName}
        churchCnpj={churchCnpj}
        treasurerName={treasurerName}
        onClose={() => setReceiptExpense(null)}
      />
    </div>
  );
};
