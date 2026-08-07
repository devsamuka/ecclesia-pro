import React, { useState } from 'react';
import {
  HeartHandshake,
  Search,
  Plus,
  FileCheck,
  User,
  Filter,
  Download,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { Transaction, Member, UserRole } from '../../types';
import { formatPeriodLabel, isDateInPeriod } from '../../utils/periodUtils';

interface TithingLedgerViewProps {
  transactions: Transaction[];
  members: Member[];
  onOpenNewTransaction: () => void;
  onOpenReceiptModal: (transaction: Transaction) => void;
  selectedPeriod: string;
  activeRole?: UserRole;
}

export const TithingLedgerView: React.FC<TithingLedgerViewProps> = ({
  transactions,
  members,
  onOpenNewTransaction,
  onOpenReceiptModal,
  selectedPeriod,
  activeRole = 'Tesoureiro',
}) => {
  const canManageFinances = activeRole === 'Tesoureiro' || activeRole === 'Administrador';
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Todos' | 'Dízimo' | 'Oferta'>('Todos');
  const [fundFilter, setFundFilter] = useState<string>('Todos');

  const periodTransactions = transactions.filter((tx) =>
    isDateInPeriod(tx.date, selectedPeriod)
  );

  const titheTransactions = periodTransactions.filter(
    (tx) => tx.category === 'Dízimo' || tx.category === 'Oferta'
  );

  const filtered = titheTransactions.filter((tx) => {
    const matchesSearch =
      searchTerm === '' ||
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.memberName && tx.memberName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'Todos' || tx.category === typeFilter;
    const matchesFund =
      fundFilter === 'Todos' || (tx.destinationFund && tx.destinationFund === fundFilter);

    return matchesSearch && matchesType && matchesFund;
  });

  const totalTithes = titheTransactions
    .filter((tx) => tx.category === 'Dízimo')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalOfferings = titheTransactions
    .filter((tx) => tx.category === 'Oferta')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs w-full min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Lançamentos de Dízimos e Ofertas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestão individualizada e confidencial dos membros da igreja
          </p>
        </div>

        {canManageFinances && (
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-md shadow-teal-600/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Novo Lançamento de Membro</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Total Dízimos</span>
          <p className="text-2xl font-black text-teal-700 mt-1">{formatBRL(totalTithes)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Fidelidade congregacional</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Total Ofertas</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{formatBRL(totalOfferings)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Ofertas voluntárias</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500">Total Arrecadado Mês</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {formatBRL(totalTithes + totalOfferings)}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nome do membro ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="Todos">Todos os Tipos</option>
              <option value="Dízimo">Dízimos</option>
              <option value="Oferta">Ofertas</option>
            </select>

            <select
              value={fundFilter}
              onChange={(e) => setFundFilter(e.target.value)}
              className="py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="Todos">Todas as Destinações</option>
              <option value="Caixa Geral">Caixa Geral</option>
              <option value="Fundo de Construção">Fundo de Construção</option>
              <option value="Ação Social">Ação Social</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile View: Vertical Cards */}
      <div className="flex md:hidden flex-col gap-3 w-full">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 font-medium bg-white rounded-xl border border-slate-200 text-xs">
            Nenhum dízimo ou oferta encontrado.
          </div>
        ) : (
          filtered.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-col w-full p-3 bg-white rounded-xl border border-slate-200 gap-2 shadow-2xs"
            >
              {/* Linha Superior */}
              <div className="flex flex-row justify-between items-start w-full gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {tx.isAnonymous ? 'A' : (tx.memberName ? tx.memberName[0] : 'C')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-xs leading-snug break-words">
                      {tx.isAnonymous ? 'Membro Anônimo / Culto' : (tx.memberName || 'Contribuição Diversa')}
                    </p>
                    <p className="text-[10px] text-slate-400 break-words mt-0.5">{tx.description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Destinação: {tx.destinationFund || 'Caixa Geral'} • {tx.paymentMethod}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-black text-sm text-emerald-600 whitespace-nowrap">
                    + {formatBRL(tx.amount)}
                  </span>
                </div>
              </div>

              {/* Linha Inferior */}
              <div className="flex flex-row justify-between items-center w-full mt-1 pt-2 border-t border-slate-100 gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(tx.date).toLocaleDateString('pt-BR')}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      tx.category === 'Dízimo'
                        ? 'bg-teal-100 text-teal-800 border border-teal-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {tx.category}
                  </span>
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
                <th className="py-3 px-4">Membro / Contribuinte</th>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Destinação</th>
                <th className="py-3 px-4">Forma de Pagamento</th>
                <th className="py-3 px-4">Data</th>
                <th className="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                        {tx.isAnonymous ? 'A' : (tx.memberName ? tx.memberName[0] : 'C')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {tx.isAnonymous ? 'Membro Anônimo / Culto' : (tx.memberName || 'Contribuição Diversa')}
                        </p>
                        <p className="text-[10px] text-slate-400">{tx.description}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        tx.category === 'Dízimo'
                          ? 'bg-teal-100 text-teal-800 border border-teal-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {tx.category}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-700">
                    {tx.destinationFund || 'Caixa Geral'}
                  </td>

                  <td className="py-3 px-4 font-medium text-slate-600">{tx.paymentMethod}</td>

                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                    {new Date(tx.date).toLocaleDateString('pt-BR')}
                  </td>

                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    {formatBRL(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
