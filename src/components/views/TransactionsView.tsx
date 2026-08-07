import React, { useState } from 'react';
import {
  WalletCards,
  Search,
  Plus,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  FileCheck,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Transaction, ChurchAccount, UserRole } from '../../types';
import { formatPeriodLabel, isDateInPeriod } from '../../utils/periodUtils';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: ChurchAccount[];
  onOpenNewTransaction: () => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  onOpenReceiptModal: (transaction: Transaction) => void;
  selectedPeriod: string;
  activeRole?: UserRole;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  onOpenNewTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onOpenReceiptModal,
  selectedPeriod,
  activeRole = 'Tesoureiro',
}) => {
  const canManageFinances = activeRole === 'Tesoureiro' || activeRole === 'Administrador';
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Entrada' | 'Saída'>('Todos');
  const [accountFilter, setAccountFilter] = useState<string>('Todas');
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const periodTransactions = transactions.filter((tx) =>
    isDateInPeriod(tx.date, selectedPeriod)
  );

  const filtered = periodTransactions.filter((tx) => {
    const matchesSearch =
      searchTerm === '' ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memberName && tx.memberName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'Todos' || tx.type === typeFilter;
    const matchesAccount = accountFilter === 'Todas' || tx.account === accountFilter;

    return matchesSearch && matchesType && matchesAccount;
  });

  const totalIn = filtered
    .filter((t) => t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = filtered
    .filter((t) => t.type === 'Saída')
    .reduce((sum, t) => sum + t.amount, 0);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const exportCSV = () => {
    const headers = ['ID,Tipo,Categoria,Descrição,Valor,Data,Forma,Conta,Membro\n'];
    const rows = filtered.map(
      (t) =>
        `${t.id},${t.type},${t.category},"${t.description}",${t.amount},${t.date},${t.paymentMethod},"${t.account}","${t.memberName || ''}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ecclesia_Movimentacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const handleConfirmDelete = () => {
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
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0">
              <WalletCards className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Movimentações Financeiras e Livro Caixa
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Exibindo lançamentos de <strong className="text-teal-700">{formatPeriodLabel(selectedPeriod)}</strong> ({filtered.length} registros)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-200 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV</span>
          </button>

          {canManageFinances && (
            <button
              onClick={onOpenNewTransaction}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-md shadow-teal-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Lançamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Entradas Filtradas</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{formatBRL(totalIn)}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Saídas Filtradas</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{formatBRL(totalOut)}</p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500">Resultado Líquido</span>
            <p
              className={`text-2xl font-black mt-1 ${
                totalIn - totalOut >= 0 ? 'text-teal-700' : 'text-rose-700'
              }`}
            >
              {formatBRL(totalIn - totalOut)}
            </p>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-700 rounded-xl">
            <WalletCards className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filtrar movimentação, descrição ou categoria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="Todos">Todos os Tipos</option>
            <option value="Entrada">Entradas (+)</option>
            <option value="Saída">Saídas (-)</option>
          </select>

          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="Todas">Todas as Contas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.name}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List - Mobile Card Architecture (Mobile) & Table Architecture (Desktop) */}
      <div className="w-full">
        {/* Mobile View: Vertical Cards */}
        <div className="flex md:hidden flex-col gap-3 w-full">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200 text-xs">
              Nenhuma movimentação financeira encontrada.
            </div>
          ) : (
            filtered.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col w-full p-3 bg-white rounded-xl border border-slate-200 gap-2 shadow-2xs"
              >
                {/* Linha Superior do Item */}
                <div className="flex flex-row justify-between items-start w-full gap-2">
                  {/* Esquerda: Título/Descrição (texto com quebra de linha permitida) */}
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        tx.type === 'Entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-xs leading-snug break-words">
                        {tx.description}
                      </p>
                      {tx.notes && (
                        <p className="text-[10px] text-slate-400 break-words mt-0.5">{tx.notes}</p>
                      )}
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {tx.account} • {tx.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Direita: Valor financeiro em destaque, alinhado à direita, sem truncate */}
                  <div className="text-right shrink-0">
                    <span
                      className={`font-black text-sm whitespace-nowrap ${
                        tx.type === 'Entrada' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'Entrada' ? '+' : '-'} {formatBRL(tx.amount)}
                    </span>
                  </div>
                </div>

                {/* Linha Inferior do Item */}
                <div className="flex flex-row justify-between items-center w-full mt-1 pt-2 border-t border-slate-100 gap-2">
                  {/* Esquerda: Data completa */}
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </span>

                  {/* Direita: Tag/Badge de categoria e Ações */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {tx.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {tx.type === 'Saída' && (
                        <button
                          onClick={() => onOpenReceiptModal(tx)}
                          className="p-1 rounded text-teal-600 hover:bg-teal-50 cursor-pointer"
                          title="Ver Comprovante"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                        </button>
                      )}

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
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Conta Bancária</th>
                  <th className="py-3 px-4">Forma</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      Nenhuma movimentação financeira encontrada.
                    </td>
                  </tr>
                ) : (
                  filtered.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              tx.type === 'Entrada' ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <div>
                            <p className="font-bold text-slate-800">{tx.description}</p>
                            {tx.notes && <p className="text-[10px] text-slate-400">{tx.notes}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {tx.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-medium">{tx.account}</td>
                      <td className="py-3 px-4 text-slate-600 font-medium">{tx.paymentMethod}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {new Date(tx.date).toLocaleDateString('pt-BR')}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-sm">
                        <span className={tx.type === 'Entrada' ? 'text-emerald-600' : 'text-slate-900'}>
                          {tx.type === 'Entrada' ? '+' : '-'} {formatBRL(tx.amount)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {tx.type === 'Saída' && (
                            <button
                              onClick={() => onOpenReceiptModal(tx)}
                              className="p-1.5 rounded-lg text-teal-600 hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Ver Comprovante"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}

                          {canManageFinances && onEditTransaction && (
                            <button
                              onClick={() => onEditTransaction(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-teal-50 transition-colors cursor-pointer"
                              title="Editar Lançamento"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}

                          {canManageFinances && onDeleteTransaction && (
                            <button
                              onClick={() => setDeletingTx(tx)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Excluir Lançamento"
                            >
                              <Trash2 className="w-4 h-4" />
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
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Excluir Lançamento</h3>
                <p className="text-xs text-slate-500">Esta ação irá remover o lançamento do histórico.</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <p className="font-bold text-slate-900">{deletingTx.description}</p>
              <p>Categoria: <span className="font-semibold">{deletingTx.category}</span></p>
              <p>
                Valor:{' '}
                <span className="font-black text-slate-900">
                  {deletingTx.type === 'Entrada' ? '+' : '-'} {formatBRL(deletingTx.amount)}
                </span>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-md transition-all cursor-pointer"
              >
                Excluir Lançamento
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
    </div>
  );
};
