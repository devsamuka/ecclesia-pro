import React, { useState } from 'react';
import {
  FileBarChart,
  Printer,
  CheckCircle2,
  Pencil,
  X,
  Save,
  UserCheck,
} from 'lucide-react';
import { Transaction, ChurchAccount, SuperiorPayment } from '../../types';
import { formatPeriodLabel, isDateInPeriod } from '../../utils/periodUtils';

interface ReportsViewProps {
  transactions: Transaction[];
  accounts: ChurchAccount[];
  superiorPayments: SuperiorPayment[];
  churchName: string;
  treasurerName: string;
  onTreasurerNameChange: (name: string) => void;
  accountsRelatorName: string;
  onAccountsRelatorNameChange: (name: string) => void;
  councilPresidentName: string;
  onCouncilPresidentNameChange: (name: string) => void;
  selectedPeriod: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  transactions,
  churchName,
  treasurerName,
  onTreasurerNameChange,
  accountsRelatorName,
  onAccountsRelatorNameChange,
  councilPresidentName,
  onCouncilPresidentNameChange,
  selectedPeriod,
}) => {
  // Modal / Form state for editing signatories
  const [isEditingSignatories, setIsEditingSignatories] = useState(false);
  const [editTreasurer, setEditTreasurer] = useState(treasurerName);
  const [editRelator, setEditRelator] = useState(accountsRelatorName);
  const [editPresident, setEditPresident] = useState(councilPresidentName);
  const [signatoriesSavedSuccess, setSignatoriesSavedSuccess] = useState(false);

  // Filter transactions for selected period
  const periodTransactions = transactions.filter((t) =>
    isDateInPeriod(t.date, selectedPeriod)
  );

  const totalIncome = periodTransactions
    .filter((t) => t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = periodTransactions
    .filter((t) => t.type === 'Saída')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Handle Save Signatories
  const handleSaveSignatories = (e: React.FormEvent) => {
    e.preventDefault();
    onTreasurerNameChange(editTreasurer || 'Tesoureiro (A definir)');
    onAccountsRelatorNameChange(editRelator || 'Relator (A definir)');
    onCouncilPresidentNameChange(editPresident || 'Presidente (A definir)');
    setIsEditingSignatories(false);
    setSignatoriesSavedSuccess(true);
    setTimeout(() => setSignatoriesSavedSuccess(false), 3000);
  };

  const handleOpenEditSignatories = () => {
    setEditTreasurer(treasurerName);
    setEditRelator(accountsRelatorName);
    setEditPresident(councilPresidentName);
    setIsEditingSignatories(true);
  };

  // Robust Print Handler
  const handlePrint = () => {
    try {
      window.focus();
      const printWin = window.open('', '_blank', 'width=850,height=900');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Balancete Mensal - ${churchName}</title>
              <style>
                @page { size: A4 portrait; margin: 15mm; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #0f172a; margin: 0; }
                .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 25px; }
                .header h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
                .header p.sub { font-size: 12px; color: #475569; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em; }
                .header p.date { font-size: 11px; color: #64748b; margin-top: 6px; }
                .grid { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 30px; }
                .card { flex: 1; padding: 18px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; text-align: center; }
                .card .label { font-size: 11px; font-weight: 800; color: #334155; display: block; text-transform: uppercase; }
                .card .value { font-size: 22px; font-weight: 900; margin-top: 8px; display: block; }
                .income { color: #047857; }
                .expense { color: #be123c; }
                .net { color: #0f766e; }
                .signatures { display: flex; justify-content: space-between; gap: 20px; margin-top: 80px; text-align: center; }
                .sig-box { flex: 1; border-top: 1.5px solid #64748b; padding-top: 10px; }
                .sig-box p.name { font-size: 13px; font-weight: 800; margin: 4px 0 2px 0; color: #0f172a; }
                .sig-box p.role { font-size: 11px; color: #475569; font-weight: 600; margin: 0; }
                .sig-box p.desc { font-size: 10px; color: #94a3b8; margin-top: 2px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${churchName}</h1>
                <p class="sub">Igreja Presbiteriana do Brasil • Balancete Mensal da Tesouraria</p>
                <p class="date">Exercício: <strong>${formatPeriodLabel(selectedPeriod)}</strong> &nbsp;•&nbsp; Emissão: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></p>
              </div>

              <div class="grid">
                <div class="card">
                  <span class="label">Total de Receitas</span>
                  <span class="value income">${formatBRL(totalIncome)}</span>
                </div>
                <div class="card">
                  <span class="label">Total de Despesas</span>
                  <span class="value expense">${formatBRL(totalExpense)}</span>
                </div>
                <div class="card">
                  <span class="label">Superávit em Caixa</span>
                  <span class="value net">${formatBRL(netBalance)}</span>
                </div>
              </div>

              <div class="signatures">
                <div class="sig-box">
                  <p class="name">${treasurerName}</p>
                  <p class="role">Tesoureiro da Igreja Local</p>
                </div>
                <div class="sig-box">
                  <p class="name">${accountsRelatorName}</p>
                  <p class="role">Relator da Com. de Exame de Contas</p>
                </div>
                <div class="sig-box">
                  <p class="name">${councilPresidentName}</p>
                  <p class="role">Presidente do Conselho</p>
                </div>
              </div>
            </body>
          </html>
        `);
        printWin.document.close();
        printWin.focus();
        setTimeout(() => {
          printWin.print();
        }, 300);
      } else {
        window.print();
      }
    } catch (e) {
      console.error('Error opening print window:', e);
      window.print();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full max-w-full overflow-x-hidden">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs print:hidden w-full min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-lg shrink-0">
              <FileBarChart className="w-5 h-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              Relatórios e Balancete Mensal do Conselho
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Geração de demonstrativos contábeis para prestação de contas aos membros e ao Presbitério
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenEditSignatories}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-colors border border-amber-200 cursor-pointer"
          >
            <Pencil className="w-4 h-4 text-amber-600" />
            <span>Editar Signatários</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-slate-900/10 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-200" />
            <span>Imprimir Balancete</span>
          </button>
        </div>
      </div>

      {/* Success Banner when Signatories Saved */}
      {signatoriesSavedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 print:hidden">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Nomes dos signatários (Tesoureiro, Relator e Presidente) atualizados com sucesso!</span>
        </div>
      )}

      {/* Official Balancete Printable Document Container */}
      <div className="printable-document bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Balancete Header */}
        <div className="text-center border-b border-slate-200 pb-6 space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            {churchName}
          </h3>
          <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
            Igreja Presbiteriana do Brasil • Balancete Mensal da Tesouraria
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500 pt-1">
            <span>Exercício: <strong className="text-slate-700">{formatPeriodLabel(selectedPeriod)}</strong></span>
            <span>•</span>
            <span>Data de Emissão: <strong className="text-slate-700">{new Date().toLocaleDateString('pt-BR')}</strong></span>
          </div>
        </div>

        {/* Balancete Summary Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 block uppercase">TOTAL DE RECEITAS</span>
            <span className="text-2xl font-black text-emerald-700 block mt-1">
              {formatBRL(totalIncome)}
            </span>
          </div>

          <div className="p-4 bg-rose-50/60 rounded-xl border border-rose-200">
            <span className="text-xs font-bold text-rose-800 block uppercase">TOTAL DE DESPESAS</span>
            <span className="text-2xl font-black text-rose-700 block mt-1">
              {formatBRL(totalExpense)}
            </span>
          </div>

          <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200">
            <span className="text-xs font-bold text-teal-800 block uppercase">SUPERÁVIT EM CAIXA</span>
            <span className="text-2xl font-black text-teal-700 block mt-1">
              {formatBRL(netBalance)}
            </span>
          </div>
        </div>

        {/* Council & Audit Signatures Section */}
        <div className="pt-10 border-t border-slate-200 print-page-break">
          <div className="flex items-center justify-between pb-4 print:hidden">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-extrabold text-slate-900 uppercase">
                Assinaturas e Homologação do Conselho
              </h4>
            </div>
            <button
              onClick={handleOpenEditSignatories}
              className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 underline cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Alterar Nomes dos Signatários</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-xs pt-4">
            <div className="space-y-1.5 pt-8 border-t border-slate-400">
              <p className="font-extrabold text-slate-900 text-sm">{treasurerName}</p>
              <p className="text-slate-600 font-medium text-[11px]">Tesoureiro da Igreja Local</p>
            </div>

            <div className="space-y-1.5 pt-8 border-t border-slate-400">
              <p className="font-extrabold text-slate-900 text-sm">{accountsRelatorName}</p>
              <p className="text-slate-600 font-medium text-[11px]">
                Relator da Comissão de Exame de Contas
              </p>
            </div>

            <div className="space-y-1.5 pt-8 border-t border-slate-400">
              <p className="font-extrabold text-slate-900 text-sm">{councilPresidentName}</p>
              <p className="text-slate-600 font-medium text-[11px]">Presidente do Conselho</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para Edição dos Nomes dos Signatários */}
      {isEditingSignatories && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
                  <Pencil className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Editar Nomes dos Signatários do Balancete
                </h3>
              </div>
              <button
                onClick={() => setIsEditingSignatories(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSignatories} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Nome do Tesoureiro da Igreja *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Santos"
                  value={editTreasurer}
                  onChange={(e) => setEditTreasurer(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Nome do Relator da Comissão de Exame de Contas *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Presb. Antônio Ferreira"
                  value={editRelator}
                  onChange={(e) => setEditRelator(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Nome do Presidente do Conselho *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pr. Ricardo Santos"
                  value={editPresident}
                  onChange={(e) => setEditPresident(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Signatários</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingSignatories(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
