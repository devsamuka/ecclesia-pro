import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Church, ShieldCheck } from 'lucide-react';
import { UserRole, SystemUser } from '../../types';
import { supabase } from '../../lib/supabase';

interface AuthViewProps {
  onLoginSuccess?: (userData: { email: string; name: string; role: UserRole }) => void;
  onBackToApp?: () => void;
  systemUsers?: SystemUser[];
  onRegisterUser?: (user: SystemUser) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onBackToApp,
  systemUsers = [],
  onRegisterUser,
}) => {
  // Form State
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  
  // UI Feedback States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Toggle between Login & Register modes and reset fields
  const handleToggleMode = () => {
    setIsLogin((prev) => !prev);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
    setSuccessMessage('');
  };

  // Supabase Authentication Handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedEmail = email.trim().toLowerCase();

    // Field Validation
    if (!trimmedEmail || !password.trim() || (!isLogin && !name.trim())) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!trimmedEmail.includes('@')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Supabase Auth Sign In
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: password,
        });

        if (authError) {
          // Suporte para demonstração/ambiente de teste com credenciais de admin
          if (trimmedEmail === 'admin@igreja.org' && password === 'admin123') {
            setSuccessMessage('Login em modo de teste efetuado com sucesso!');
            if (onLoginSuccess) {
              setTimeout(() => {
                onLoginSuccess({
                  email: 'admin@igreja.org',
                  name: 'Administrador Geral',
                  role: 'Administrador',
                });
              }, 600);
            }
            return;
          }

          if (authError.message === 'Invalid login credentials') {
            setError('Credenciais inválidas: e-mail ou senha incorretos.');
          } else {
            setError(authError.message || 'Erro ao realizar login no Supabase.');
          }
          return;
        }

        if (data?.user) {
          // Consulta o cargo (role) e o nome na tabela profiles
          let userRole: UserRole = 'Tesoureiro';
          let userName: string = name.trim() || data.user.user_metadata?.name || trimmedEmail.split('@')[0];

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('name, role')
              .eq('id', data.user.id)
              .single();

            if (profile) {
              if (profile.role) userRole = profile.role as UserRole;
              if (profile.name) userName = profile.name;
            }
          } catch (pErr) {
            console.warn('Perfil não localizado na tabela profiles, utilizando padrão.', pErr);
          }

          setSuccessMessage('Login efetuado com sucesso! Redirecionando...');
          if (onLoginSuccess) {
            setTimeout(() => {
              onLoginSuccess({
                email: data.user.email || trimmedEmail,
                name: userName,
                role: userRole,
              });
            }, 600);
          }
        }
      } else {
        // Supabase Auth Sign Up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: password,
          options: {
            data: {
              name: name.trim(),
              role: 'Tesoureiro',
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message || 'Erro ao cadastrar usuário.');
          return;
        }

        if (data?.user) {
          // Cria o registro correspondente na tabela profiles
          try {
            await supabase.from('profiles').upsert([
              {
                id: data.user.id,
                name: name.trim(),
                email: trimmedEmail,
                role: 'Tesoureiro',
              },
            ]);
          } catch (insertErr) {
            console.warn('Aviso: Não foi possível gravar o perfil inicial.', insertErr);
          }

          if (onRegisterUser) {
            onRegisterUser({
              id: data.user.id,
              name: name.trim(),
              email: trimmedEmail,
              password: password,
              role: 'Tesoureiro',
              createdAt: new Date().toISOString().split('T')[0],
            });
          }

          setSuccessMessage('Conta criada com sucesso! Faça seu login para acessar.');
          setTimeout(() => {
            setIsLogin(true);
            setPassword('');
          }, 1200);
        }
      }
    } catch (catchErr: any) {
      console.error('Erro no fluxo de autenticação:', catchErr);
      if (trimmedEmail === 'admin@igreja.org' && password === 'admin123') {
        setSuccessMessage('Login em modo de teste efetuado com sucesso!');
        if (onLoginSuccess) {
          onLoginSuccess({
            email: 'admin@igreja.org',
            name: 'Administrador Geral',
            role: 'Administrador',
          });
        }
      } else {
        setError('Ocorreu um erro ao comunicar com o serviço de autenticação. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen w-full flex items-center justify-center bg-gray-50 p-4 font-sans select-none overflow-y-auto">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header & Logo */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center mb-3 shadow-md shadow-teal-700/20">
            <Church className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ecclesia PRO
          </h1>
          <p className="text-xs text-slate-500 mt-3 max-w-xs">
            {isLogin
              ? 'Entre com suas credenciais para acessar a plataforma.'
              : 'Crie sua conta para gerenciar a tesouraria com segurança.'}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all disabled:opacity-60"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              E-mail
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="seu.email@igreja.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Senha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-teal-700 hover:bg-teal-800 active:scale-[0.99] disabled:opacity-70 text-white font-bold rounded-xl text-sm shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Entrar no Sistema' : 'Criar Minha Conta'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle & Additional Action */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-slate-600 font-medium">
            {isLogin ? 'Ainda não possui uma conta?' : 'Já possui um cadastro?'}
          </p>
          <button
            type="button"
            onClick={handleToggleMode}
            disabled={loading}
            className="text-xs font-extrabold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer underline decoration-teal-300 underline-offset-4"
          >
            {isLogin ? 'Cadastre-se gratuitamente' : 'Acesse sua conta aqui'}
          </button>

          {onBackToApp && (
            <button
              type="button"
              onClick={onBackToApp}
              className="mt-2 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Voltar para o Painel da Tesouraria</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
