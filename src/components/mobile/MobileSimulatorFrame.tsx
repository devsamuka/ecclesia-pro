import React from 'react';
import { Smartphone, X } from 'lucide-react';

interface MobileSimulatorFrameProps {
  children: React.ReactNode;
  isSimulatedMobile: boolean;
  onCloseMobileSim: () => void;
}

export const MobileSimulatorFrame: React.FC<MobileSimulatorFrameProps> = ({
  children,
  isSimulatedMobile,
  onCloseMobileSim,
}) => {
  if (!isSimulatedMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex flex-col items-center justify-center">
      {/* Simulation Toolbar */}
      <div className="mb-4 flex items-center justify-between w-full max-w-sm text-slate-300 text-xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-teal-400" />
          <span className="font-bold text-white">Simulador Mobile (Smartphone View)</span>
        </div>
        <button
          onClick={onCloseMobileSim}
          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] border border-slate-700"
        >
          Sair do Modo Celular
        </button>
      </div>

      {/* Mock Phone Container */}
      <div className="w-full max-w-[390px] h-[820px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative overflow-hidden flex flex-col">
        {/* Dynamic Island / Notch */}
        <div className="w-32 h-5 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center z-50">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800" />
        </div>

        {/* Screen Area */}
        <div className="flex-1 bg-slate-50 rounded-[36px] overflow-y-auto relative scrollbar-none">
          {children}
        </div>

        {/* Home Indicator */}
        <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2" />
      </div>
    </div>
  );
};
