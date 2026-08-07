import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  User,
  Church,
  ShieldCheck,
  Calendar,
  LogOut,
} from 'lucide-react';
import { UserRole } from '../../types';
import { formatPeriodLabel } from '../../utils/periodUtils';
import { ProfileModal } from '../modals/ProfileModal';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  activeRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  churchName: string;
  userName?: string;
  userEmail?: string;
  userAvatarUrl?: string;
  onUpdateProfile?: (updated: { name: string; role: UserRole; avatarUrl?: string }) => void;
  onOpenNewTransaction: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedPeriod: string;
  onPrevPeriod: () => void;
  onNextPeriod: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  activeRole,
  churchName,
  userName,
  userEmail = 'tesouraria@ipb.org.br',
  userAvatarUrl,
  onUpdateProfile,
  onOpenNewTransaction,
  searchTerm,
  onSearchChange,
  selectedPeriod,
  onPrevPeriod,
  onNextPeriod,
  onLogout,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const canManageFinances = activeRole === 'Tesoureiro' || activeRole === 'Administrador';

  const roleUserNames: Record<UserRole, string> = {
    Administrador: 'Administrador',
    Tesoureiro: 'Tesoureiro',
    Presbítero: 'Presb. Antônio Ferreira',
    Pastor: 'Pr. Ricardo Santos',
  };

  const displayName = userName || roleUserNames[activeRole] || 'Tesoureiro';

  const notifications = [
    { id: 1, text: 'Repasse do Presbitério de R$ 4.285,00 confirmado com sucesso.', time: '10 min atrás', unread: true },
    { id: 2, text: 'Conta COPASA vence em 2 dias (R$ 345,80).', time: '1 hora atrás', unread: true },
    { id: 3, text: 'Relatório Mensal de Junho arquivado pelo Conselho.', time: 'Ontem', unread: false },
  ];

  return (
    <header id="app-header" className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30 print:hidden w-full box-border px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-7xl mx-auto h-16 flex flex-row justify-between items-center gap-2 sm:gap-4 min-w-0">
        {/* Left Side: Mobile Toggle & Greeting */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            id="open-mobile-sidebar-btn"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Oculto no mobile para liberar espaço conforme especificação */}
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight whitespace-nowrap">
              Olá, {displayName}
            </h2>
          </div>
        </div>

        {/* Global Period Filter (Mês/Ano) - Centralizado */}
        <div id="global-period-filter" className="flex items-center bg-teal-50/90 hover:bg-teal-100 border border-teal-200/90 rounded-xl p-0.5 sm:p-1 shadow-2xs transition-all shrink-0">
          <button
            id="prev-period-btn"
            onClick={onPrevPeriod}
            className="p-1 sm:p-1.5 rounded-lg text-teal-800 hover:bg-white hover:text-teal-950 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Mês Anterior"
            aria-label="Mês Anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>

          <div className="flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-0.5 text-[11px] sm:text-xs font-extrabold text-teal-950 min-w-[95px] sm:min-w-[115px] justify-center select-none">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-600 shrink-0" />
            <span className="tracking-tight whitespace-nowrap">{formatPeriodLabel(selectedPeriod)}</span>
          </div>

          <button
            id="next-period-btn"
            onClick={onNextPeriod}
            className="p-1 sm:p-1.5 rounded-lg text-teal-800 hover:bg-white hover:text-teal-950 shadow-2xs cursor-pointer transition-all active:scale-95"
            title="Próximo Mês"
            aria-label="Próximo Mês"
          >
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Center/Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 min-w-0">
          {/* Search Bar with min-w-0 and shrink prevention */}
          <div className="relative hidden md:block min-w-0 shrink">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              id="header-search-input"
              type="text"
              placeholder="Buscar lançamentos..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-slate-100 rounded-full pl-9 pr-4 py-1.5 text-sm w-36 lg:w-48 max-w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 transition-all placeholder:text-slate-400 min-w-0 shrink"
            />
          </div>

          {/* Static Church Display */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200">
            <Church className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-800 truncate max-w-[200px]">{churchName}</span>
          </div>

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              id="role-switcher-btn"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Menu do usuário"
            >
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[11px]">
                {activeRole[0]}
              </div>
              <span className="hidden sm:inline-block">{activeRole}</span>
              <ChevronDown className="w-3 h-3 text-teal-700" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800 truncate">{displayName}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{activeRole}</p>
                </div>

                <button
                  id="my-profile-btn"
                  onClick={() => {
                    setShowRoleDropdown(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full text-left px-3 py-2 mt-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-900 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Meu Perfil</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer rounded-b-xl"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sair do Sistema</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
              aria-label="Notificações"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800">Notificações e Alertas</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 text-teal-800">
                    3 Novas
                  </span>
                </div>
                <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-lg text-xs border ${
                        n.unread ? 'bg-teal-50/50 border-teal-100' : 'bg-slate-50 border-slate-100'
                      }`}
                    >
                      <p className="text-slate-800 font-medium">{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* New Transaction Button (Hidden on Mobile, Visible on Desktop md+) */}
          {canManageFinances && (
            <button
              id="open-new-transaction-btn"
              onClick={onOpenNewTransaction}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all cursor-pointer transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Novo Lançamento</span>
            </button>
          )}
        </div>
      </div>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={{
          name: displayName,
          role: activeRole,
          email: userEmail,
          avatarUrl: userAvatarUrl,
        }}
        onSave={(updated) => {
          if (onUpdateProfile) {
            onUpdateProfile(updated);
          }
        }}
      />
    </header>
  );
};
