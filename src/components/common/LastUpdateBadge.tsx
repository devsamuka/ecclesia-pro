import React from 'react';
import { Clock, RefreshCw, ShieldCheck } from 'lucide-react';

interface LastUpdateBadgeProps {
  lastUpdated: string;
  variant?: 'dashboard' | 'transparency';
  className?: string;
}

export const LastUpdateBadge: React.FC<LastUpdateBadgeProps> = ({
  lastUpdated,
  variant = 'dashboard',
  className = '',
}) => {
  if (variant === 'transparency') {
    return (
      <div
        id="flag-atualizacao-transparencia"
        className={`bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white border border-teal-500/40 px-4 py-2.5 rounded-xl shadow-md flex flex-wrap items-center justify-between gap-3 backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <ShieldCheck className="w-4 h-4 text-teal-400 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 ring-4 ring-emerald-400/20" />
            <span className="text-xs font-bold tracking-tight text-teal-100">
              Dados atualizados em: <strong className="text-white font-extrabold">{lastUpdated}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-teal-300 font-semibold bg-teal-500/10 px-2.5 py-1 rounded-md border border-teal-500/20">
          <RefreshCw className="w-3 h-3 text-teal-400 animate-spin-slow" />
          <span>Sincronização em tempo real</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="flag-atualizacao-dashboard"
      className={`inline-flex items-center gap-2 bg-teal-50/90 hover:bg-teal-100/80 border border-teal-200/80 text-teal-900 px-3 py-1.5 rounded-lg text-xs font-medium shadow-2xs transition-all ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
      </span>
      <Clock className="w-3.5 h-3.5 text-teal-700 shrink-0" />
      <span className="tracking-tight select-none">
        Dados atualizados em: <strong className="font-bold text-teal-950">{lastUpdated}</strong>
      </span>
    </div>
  );
};
