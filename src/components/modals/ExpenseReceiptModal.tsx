import React from 'react';
import { X, Printer, FileText } from 'lucide-react';

export interface ExpenseReceiptData {
  description: string;
  amount: number;
  date: string;
  supplier?: string;
}

interface ExpenseReceiptModalProps {
  expense: ExpenseReceiptData | null;
  churchName: string;
  churchCnpj: string;
  treasurerName: string;
  onClose: () => void;
}

export const ExpenseReceiptModal: React.FC<ExpenseReceiptModalProps> = ({
  expense,
  churchName,
  churchCnpj,
  treasurerName,
  onClose,
}) => {
  if (!expense) return null;

  const formatBRL = (val: number) =>
    val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formattedDate = expense.date
    ? new Date(expense.date).toLocaleDateString('pt-BR')
    : new Date().toLocaleDateString('pt-BR');

  const formattedAmount = formatBRL(expense.amount);

  const handlePrintRecibo = () => {
    try {
      window.focus();
      const printWin = window.open('', '_blank', 'width=850,height=900');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Recibo de Pagamento - ${churchName}</title>
              <style>
                @page { size: A4 portrait; margin: 15mm; }
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; color: #0f172a; margin: 0; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
                .header p.cnpj { font-size: 13px; font-weight: 700; color: #475569; margin: 6px 0 0 0; }
                .divider { border-bottom: 2px solid #0f172a; margin: 20px 0 25px 0; }
                .title-box { text-align: center; padding: 14px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; margin-bottom: 30px; }
                .title-box h2 { font-size: 20px; font-weight: 900; text-transform: uppercase; margin: 0; color: #0f172a; }
                .body-text { font-size: 16px; line-height: 1.8; color: #1e293b; text-align: justify; margin-bottom: 35px; }
                .date-row { text-align: right; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 90px; }
                .signatures { display: flex; justify-content: space-between; gap: 40px; text-align: center; }
                .sig-box { flex: 1; border-top: 1.5px solid #0f172a; padding-top: 10px; }
                .sig-box p.name { font-size: 14px; font-weight: 800; margin: 4px 0 2px 0; color: #0f172a; }
                .sig-box p.role { font-size: 12px; color: #64748b; margin: 0; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${churchName || 'Igreja Presbiteriana do Brasil'}</h1>
                <p class="cnpj">CNPJ: ${churchCnpj || '00.000.000/0000-00'}</p>
              </div>
              <div class="divider"></div>
              <div class="title-box">
                <h2>RECIBO - Valor: ${formattedAmount}</h2>
              </div>
              <div class="body-text">
                Recebi(emos) de <strong>${churchName}</strong>, a importância de <strong>${formattedAmount}</strong>, referente ao pagamento de <strong>${expense.description}</strong>, pelo qual dou(amos) plena e geral quitação.
              </div>
              <div class="date-row">
                São Paulo - SP, ${formattedDate}.
              </div>
              <div class="signatures">
                <div class="sig-box">
                  <p class="name">${expense.supplier || 'Nome do Prestador/Recebedor'}</p>
                  <p class="role">CPF/CNPJ: _______________</p>
                </div>
                <div class="sig-box">
                  <p class="name">${treasurerName || 'Tesoureiro'}</p>
                  <p class="role">Tesoureiro</p>
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
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Modal Header (Hidden during print) */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Recibo de Pagamento de Despesa
              </h3>
              <p className="text-xs text-slate-500">
                Visualização otimizada para impressão em Folha A4 (Orientação Retrato)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable A4 Clean/White Receipt Document */}
        <div className="printable-document bg-white border border-slate-200 p-8 sm:p-12 rounded-xl space-y-8 text-slate-900 shadow-xs print:border-none print:shadow-none print:p-0">
          {/* Cabeçalho (Centralizado) */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              {churchName || 'Igreja Presbiteriana do Brasil'}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              CNPJ: {churchCnpj || '00.000.000/0000-00'}
            </p>
          </div>

          <div className="border-b-2 border-slate-900 my-4" />

          {/* Título (Centralizado e em destaque) */}
          <div className="text-center py-3 bg-slate-50 border border-slate-200 rounded-lg print:bg-transparent print:border-slate-800">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-wide uppercase">
              RECIBO - Valor: {formattedAmount}
            </h2>
          </div>

          {/* Corpo do Texto (Justificado) */}
          <div className="text-sm sm:text-base leading-relaxed text-slate-800 text-justify pt-2 space-y-4 font-normal">
            <p>
              Recebi(emos) de <strong className="font-bold text-slate-900">{churchName}</strong>, a importância de <strong className="font-bold text-slate-900">{formattedAmount}</strong>, referente ao pagamento de <strong className="font-bold text-slate-900">{expense.description}</strong>, pelo qual dou(amos) plena e geral quitação.
            </p>
          </div>

          {/* Data (Alinhado à direita) */}
          <div className="text-right text-xs sm:text-sm font-medium text-slate-700 pt-6">
            <p>São Paulo - SP, {formattedDate}.</p>
          </div>

          {/* Rodapé / Assinaturas (Alinhado ao centro, com espaço para assinar) */}
          <div className="pt-16 grid grid-cols-1 sm:grid-cols-2 gap-10 text-center text-xs sm:text-sm">
            <div className="space-y-1.5">
              <div className="w-48 sm:w-56 mx-auto border-b border-slate-900 mb-2" />
              <p className="font-bold text-slate-900">
                {expense.supplier || 'Nome do Prestador/Recebedor'}
              </p>
              <p className="text-slate-500 text-[11px]">CPF/CNPJ: _______________</p>
            </div>

            <div className="space-y-1.5">
              <div className="w-48 sm:w-56 mx-auto border-b border-slate-900 mb-2" />
              <p className="font-bold text-slate-900">
                {treasurerName || 'Tesoureiro'}
              </p>
              <p className="text-slate-500 text-[11px]">Tesoureiro</p>
            </div>
          </div>
        </div>

        {/* Modal Actions (Hidden during print) */}
        <div className="flex gap-2 pt-2 border-t border-slate-100 print:hidden">
          <button
            type="button"
            onClick={handlePrintRecibo}
            className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Recibo</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
