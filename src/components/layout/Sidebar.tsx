import React from 'react';
import {
  LayoutDashboard,
  HeartHandshake,
  WalletCards,
  Landmark,
  Receipt,
  Target,
  FileBarChart,
  Settings,
  Eye,
  Cross,
  X,
} from 'lucide-react';
import { UserRole } from '../../types';

export type NavItem =
  | 'overview'
  | 'tithing'
  | 'transactions'
  | 'presbytery'
  | 'expenses'
  | 'budgets'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: NavItem;
  onTabChange: (tab: NavItem) => void;
  activeRole: UserRole;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenPublicTransparency: () => void;
  churchName: string;
  isSimulatedMobile?: boolean;
  onToggleMobileSim?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  activeRole,
  isMobileOpen,
  onCloseMobile,
  onOpenPublicTransparency,
  churchName,
}) => {
  const allMenuItems: { id: NavItem; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'tithing', label: 'Dízimos e Ofertas', icon: HeartHandshake },
    { id: 'transactions', label: 'Movimentações', icon: WalletCards },
    { id: 'presbytery', label: 'Presbitério e Sínodo', icon: Landmark },
    { id: 'expenses', label: 'Despesas', icon: Receipt },
    { id: 'budgets', label: 'Metas e Orçamentos', icon: Target },
    { id: 'reports', label: 'Relatórios', icon: FileBarChart },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (item.id === 'settings') {
      return activeRole === 'Tesoureiro' || activeRole === 'Presbítero' || activeRole === 'Administrador';
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed lg:relative top-0 left-0 h-full overflow-y-auto z-50 w-64 bg-[#0F172A] text-slate-200 flex flex-col justify-between transition-transform duration-300 shrink-0 print:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div>
          <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-white shadow-md shadow-teal-500/20">
                <Cross className="w-4 h-4 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-white tracking-tight">Ecclesia</span>
                  <span className="text-teal-400 font-bold text-xs">PRO</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium truncate max-w-[130px]" title={churchName}>
                  {churchName}
                </p>
              </div>
            </div>

            <button
              id="close-mobile-sidebar-btn"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Badge */}
          <div className="mx-4 mt-4 p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-medium text-slate-300">Acesso: {activeRole}</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-800/50">
              IPB
            </span>
          </div>

          {/* Navigation Menu */}
          <nav className="px-4 mt-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onTabChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white font-medium shadow-md shadow-teal-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isActive ? 'bg-white/20 text-white' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Links & Status */}
        <div className="p-4 space-y-3">
          {/* Transparency Public Link Button */}
          <button
            id="open-public-transparency-btn"
            onClick={onOpenPublicTransparency}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-emerald-300 text-xs font-bold transition-all shadow-sm group cursor-pointer"
          >
            <Eye className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>Painel de Transparência</span>
          </button>
        </div>
      </aside>
    </>
  );
};
