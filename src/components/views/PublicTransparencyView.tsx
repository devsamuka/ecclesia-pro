import React, { useState } from 'react';
import {
  Cross,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  Building2,
  Lock,
  Printer,
  HeartHandshake,
  Landmark,
  Share2,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Transaction, ChurchAccount } from '../../types';
import { HISTORICAL_TRANSPARENCY_DATA } from '../../data/mockData';
import { LastUpdateBadge } from '../common/LastUpdateBadge';

interface PublicTransparencyViewProps {
  churchName: string;
  transactions: Transaction[];
  accounts: ChurchAccount[];
  onBackToAdmin: () => void;
  lastUpdated?: string;
}

export const PublicTransparencyView: React.FC<PublicTransparencyViewProps> = ({
  churchName,
  transactions,
  accounts,
  onBackToAdmin,
  lastUpdated = '28/07/2026 às 16:45',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    try {
      window.focus();
      const printWin = window.open('', '_blank', 'width=850,height=900');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Painel Público de Prestação de Contas - ${churchName}</title>
              <style>
                @page { size: A4 portrait; margin: 15mm; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 25px; color: #0f172a; margin: 0; background: #ffffff; }
                .header { text-align: center; border-bottom: 2px solid #0d9488; padding-bottom: 15px; margin-bottom: 25px; }
                .header h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
                .header p.sub { font-size: 12px; color: #475569; font-weight: 700; margin: 6px 0 0 0; text-transform: uppercase; letter-spacing: 0.05em; }
                .header p.date { font-size: 11px; color: #64748b; margin-top: 6px; }
                .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 25px; }
                .card { padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; text-align: center; }
                .card .label { font-size: 10px; font-weight: 800; color: #475569; display: block; text-transform: uppercase; }
                .card .value { font-size: 18px; font-weight: 900; margin-top: 6px; display: block; }
                .tithes { color: #0f766e; }
                .offerings { color: #047857; }
                .expenses { color: #be123c; }
                .balance { color: #0f172a; }
                .section-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 25px; margin-bottom: 12px; border-bottom: 1.5px solid #0d9488; padding-bottom: 6px; text-transform: uppercase; }
                .movement { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 6px; font-size: 11px; }
                .movement .desc { font-weight: 700; color: #1e293b; }
                .movement .date { color: #64748b; margin-right: 10px; font-weight: 700; font-family: monospace; }
                .movement .amount-in { color: #047857; font-weight: 900; }
                .movement .amount-out { color: #0f172a; font-weight: 900; }
                .badge-info { font-size: 11px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 10px 14px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${churchName}</h1>
                <p class="sub">Painel Público de Prestação de Contas Financeiras • Transparência</p>
                <p class="date">Atualização: <strong>${lastUpdated}</strong> &nbsp;•&nbsp; Emissão: <strong>${new Date().toLocaleDateString('pt-BR')}</strong></p>
              </div>

              <div class="badge-info">
                <strong>Transparência e Fidelidade ao Evangelho:</strong> O Conselho da ${churchName} disponibiliza a todos os membros o acompanhamento em tempo real do uso dos recursos sagrados da igreja.
              </div>

              <div class="grid">
                <div class="card">
                  <span class="label">Total Dízimos (Mês)</span>
                  <span class="value tithes">${formatBRL(currentMonthTithes)}</span>
                </div>
                <div class="card">
                  <span class="label">Total Ofertas (Mês)</span>
                  <span class="value offerings">${formatBRL(currentMonthOfferings)}</span>
                </div>
                <div class="card">
                  <span class="label">Total Despesas (Mês)</span>
                  <span class="value expenses">${formatBRL(currentMonthExpenses)}</span>
                </div>
                <div class="card">
                  <span class="label">Saldo em Caixa Atual</span>
                  <span class="value balance">${formatBRL(currentTotalCashBalance)}</span>
                </div>
              </div>

              <div class="section-title">Últimas Movimentações Coletivas (Anônimas)</div>
              ${collectiveMovements.map(item => `
                <div class="movement">
                  <div>
                    <span class="date">${item.date}</span>
                    <span class="desc">${item.desc}</span>
                  </div>
                  <span class="${item.type === 'Entrada' ? 'amount-in' : 'amount-out'}">
                    ${item.type === 'Entrada' ? '+' : '-'} ${formatBRL(item.amount)}
                  </span>
                </div>
              `).join('')}
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

  const handleCopyLink = async () => {
    const url = window.location.origin + '/painel-publico';
    try {
      // Tenta a API moderna (pode falhar em iframes)
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } else {
        throw new Error('Clipboard API não disponível ou contexto inseguro');
      }
    } catch (err) {
      // Fallback: Cria um textarea invisível e usa execCommand
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      } catch (fallbackErr) {
        alert(
          'Erro ao copiar: O ambiente bloqueou o acesso à área de transferência. Abra o sistema em uma nova aba para testar.'
        );
      }
    }
  };

  // Aggregate monthly numbers
  const currentMonthTithes = transactions
    .filter((t) => t.category === 'Dízimo' && t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthOfferings = transactions
    .filter((t) => t.category === 'Oferta' && t.type === 'Entrada')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'Saída')
    .reduce((sum, t) => sum + t.amount, 0);

  const currentTotalCashBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Anonymized aggregated movements list
  const collectiveMovements = [
    { date: '26/07', desc: 'Dízimos Coletivos da Semana (Membros)', type: 'Entrada', amount: 8450.0 },
    { date: '26/07', desc: 'Oferta de Culto Matutino e Vesperal', type: 'Entrada', amount: 1840.5 },
    { date: '24/07', desc: 'Pagamento Concessionária Luz (CEMIG - Templo)', type: 'Saída', amount: 680.4 },
    { date: '22/07', desc: 'Sustento e Apoio Missionário (JMN / Moçambique)', type: 'Saída', amount: 2500.0 },
    { date: '18/07', desc: 'Repasse Estatutário ao Presbitério e Sínodo (10%)', type: 'Saída', amount: 4285.0 },
    { date: '12/07', desc: 'Oferta Especial Fundo de Construção e Reformas', type: 'Entrada', amount: 5000.0 },
    { date: '10/07', desc: 'Pagamento Concessionária Água (COPASA)', type: 'Saída', amount: 320.15 },
  ];

  return (
    <div id="public-transparency-portal" className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16 w-full max-w-full overflow-x-hidden print:bg-white print:pb-0 print:p-0">
      {/* Top Header Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-12 py-4 shadow-md print:static print:bg-slate-900 print:text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-900/40">
              <Cross className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight">{churchName}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Transparência
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Painel Público de Prestação de Contas Financeiras • Atualizado em tempo real
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              id="back-to-admin-btn"
              onClick={onBackToAdmin}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-teal-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Painel do Tesoureiro</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 lg:px-12 pt-8 space-y-6">
        {/* Highlighted Visual Update Flag Widget */}
        <div className="print:hidden">
          <LastUpdateBadge lastUpdated={lastUpdated} variant="transparency" />
        </div>

        {/* Banner Announcement */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Transparência e Fidelidade ao Evangelho
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                O Conselho da {churchName} disponibiliza a todos os membros o acompanhamento em tempo real do uso dos recursos sagrados da igreja.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="print:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-bold border border-teal-200 transition-all cursor-pointer shrink-0"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Link copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-teal-600" />
                <span>Copiar Link de Compartilhamento</span>
              </>
            )}
          </button>
        </div>

        {/* 4 BIG AGGREGATED SUMMARY CARDS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Dízimos */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Dízimos (Mês)
              </span>
              <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                <HeartHandshake className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-teal-700 tracking-tight">
              {formatBRL(currentMonthTithes)}
            </p>
            <span className="text-[11px] text-slate-400 block font-medium">
              Devolução dos dizimistas membros
            </span>
          </div>

          {/* Card 2: Total Ofertas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Ofertas (Mês)
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 tracking-tight">
              {formatBRL(currentMonthOfferings)}
            </p>
            <span className="text-[11px] text-slate-400 block font-medium">
              Coletas de cultos e ofertas alçadas
            </span>
          </div>

          {/* Card 3: Total Despesas */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Despesas (Mês)
              </span>
              <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-rose-600 tracking-tight">
              {formatBRL(currentMonthExpenses)}
            </p>
            <span className="text-[11px] text-slate-400 block font-medium">
              Custos, sustentação e repasses
            </span>
          </div>

          {/* Card 4: Saldo em Caixa Atual */}
          <div className="bg-gradient-to-br from-slate-900 to-teal-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-2 print:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                Saldo em Caixa Atual
              </span>
              <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300">
                <Landmark className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-white tracking-tight">
              {formatBRL(currentTotalCashBalance)}
            </p>
            <span className="text-[11px] text-teal-300/80 block font-medium">
              Consolidado de todas as contas
            </span>
          </div>
        </section>

        {/* TREND LINE CHART */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Tendência do Saldo de Caixa (Últimos 6 Meses)
            </h3>
            <p className="text-xs text-slate-500">Evolução do patrimônio líquido da igreja</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={HISTORICAL_TRANSPARENCY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => formatBRL(val)} />
                <Line
                  type="monotone"
                  dataKey="saldoCaixa"
                  name="Saldo de Caixa"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#0d9488' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ÚLTIMAS MOVIMENTAÇÕES COLETIVAS (SEM NOMES DE MEMBROS) */}
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Últimas Movimentações Coletivas (Anônimas)
              </h3>
              <p className="text-xs text-slate-500">
                Resumo transparente dos lançamentos sem exposição de nomes individuais
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Privacidade Preservada</span>
            </div>
          </div>

          <div className="space-y-2">
            {collectiveMovements.map((item, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-400 text-[11px] font-bold">{item.date}</span>
                  <div>
                    <p className="font-bold text-slate-800">{item.desc}</p>
                    <p className="text-[10px] text-slate-400">Prestação de Contas Pública</p>
                  </div>
                </div>

                <span
                  className={`font-black text-sm ${
                    item.type === 'Entrada' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {item.type === 'Entrada' ? '+' : '-'} {formatBRL(item.amount)}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

