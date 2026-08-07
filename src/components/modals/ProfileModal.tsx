import React, { useState, useEffect } from 'react';
import { X, Camera, User, Mail, ShieldCheck, Check } from 'lucide-react';
import { UserRole } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    role: UserRole;
    email: string;
    avatarUrl?: string;
  };
  onSave: (updatedUser: { name: string; role: UserRole; avatarUrl?: string }) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [email, setEmail] = useState(currentUser.email);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(currentUser.avatarUrl);

  useEffect(() => {
    setName(currentUser.name);
    setRole(currentUser.role);
    setEmail(currentUser.email || 'tesouraria@ipb.org.br');
    setAvatarUrl(currentUser.avatarUrl);
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      role,
      avatarUrl,
    });
    onClose();
  };

  const getInitials = (str: string) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">Meu Perfil</h3>
            <p className="text-xs text-slate-500">Atualize suas informações do sistema</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar / Foto de Perfil */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-teal-700 text-white flex items-center justify-center text-xl font-black border-4 border-white shadow-md overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span>{getInitials(name)}</span>
                )}
              </div>
              <label
                htmlFor="profile-photo-input"
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-teal-600 text-white shadow-md hover:bg-teal-700 transition-colors cursor-pointer border-2 border-white"
                title="Alterar Foto"
              >
                <Camera className="w-3.5 h-3.5" />
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <span className="text-[11px] text-slate-400">Clique na câmera para alterar foto</span>
          </div>

          {/* Nome Completo */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-slate-800 font-medium"
              required
            />
          </div>

          {/* Cargo / Função (Bloqueado para edição por segurança) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              Cargo / Função
            </label>
            <input
              type="text"
              value={role}
              readOnly
              disabled
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
            />
          </div>

          {/* E-mail (Read-only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              E-mail
            </label>
            <input
              type="email"
              value={email}
              readOnly
              disabled
              className="w-full px-3.5 py-2.5 border border-slate-200 bg-slate-100 text-slate-500 rounded-xl text-sm font-medium cursor-not-allowed"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
