'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DocFlowLogo } from '@/components/DocFlowLogo';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import {
  authApi,
  setAuthToken,
  setTenantId,
  alunosApi,
  documentosApi,
  contratosApi,
  ApiError,
} from '@/lib/api';
import { mapAlunoResponseToStudent } from '@/context/AppContext';
import confetti from 'canvas-confetti';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  KeyRound,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole, setToastMessage, setStudentDirect, loginUser, setSystemUsers, setActiveCoordinatorUserId, setActiveInstitution } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    const emailClean = identifier.trim();
    let hasError = false;

    if (!emailClean) {
      setEmailError('Informe seu e-mail cadastrado.');
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      setEmailError('Digite um formato de e-mail válido.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Informe sua senha de acesso.');
      hasError = true;
    } else if (password.length < 6) {
      setPasswordError('A senha deve conter no mínimo 6 caracteres.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await authApi.login(emailClean, password);
      setAuthToken(data.access_token);
      if (data.user?.tenant_id) {
        setTenantId(data.user.tenant_id);
      }

      let role: UserRole = 'ESTUDANTE';
      if (data.user?.perfil === 'ADMIN' || data.user?.perfil === 'SUPERADMIN') {
        role = 'SUPERADMIN';
      } else if (data.user?.perfil === 'COORDENADOR' || data.user?.perfil === 'RH') {
        role = 'COORDENADOR';
      } else if (data.user?.perfil === 'ESTUDANTE') {
        role = 'ESTUDANTE';
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('docflow_current_user', JSON.stringify(data.user));
        localStorage.setItem('docflow_user_role', role);
      }

      setCurrentRole(role);
      const localSync = loginUser(emailClean);

      if (role === 'COORDENADOR' && data.user?.id) {
        const coordUser = {
          id: data.user.id,
          nome: data.user.nome,
          email: data.user.email,
          role: 'COORDENADOR' as UserRole,
          cargo: 'Coordenador Pedagógico',
          status: 'ATIVO' as const,
          ultimoAcesso: 'Agora',
          instituicao: 'ETEC Politécnica de São Paulo',
        };
        setSystemUsers((prev) => {
          const exists = prev.some(
            (u) => u.id === coordUser.id || u.email.toLowerCase() === coordUser.email.toLowerCase()
          );
          return exists
            ? prev.map((u) => (u.id === coordUser.id ? { ...u, ...coordUser } : u))
            : [...prev, coordUser];
        });
        setActiveCoordinatorUserId(data.user.id);
        setActiveInstitution('ETEC Politécnica de São Paulo');
        if (typeof window !== 'undefined') {
          localStorage.setItem('docflow_active_coord_id', data.user.id);
          localStorage.setItem('docflow_active_institution', 'ETEC Politécnica de São Paulo');
        }
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#065373', '#226a8b', '#3f81a3', '#5b98bb', '#77afd3', '#38bdf8'],
        });
      } catch {}

      setToastMessage({
        title: 'Bem-vindo ao DocFlow! 🚀',
        desc: `Autenticado com sucesso como ${data.user?.nome || localSync.user?.nome || 'Usuário'}.`,
        type: 'success',
      });

      if (role === 'ESTUDANTE') {
        try {
          const [alunos, docs, contratos] = await Promise.all([
            alunosApi.list().catch(() => []),
            documentosApi.listAll().catch(() => []),
            contratosApi.list().catch(() => []),
          ]);
          const matched = alunos.find(
            (a) => a.email.toLowerCase() === emailClean.toLowerCase()
          );
          if (matched) {
            const mapped = mapAlunoResponseToStudent(matched, docs, contratos);
            setStudentDirect(mapped);
          }
        } catch {}
        router.push('/estudante');
      } else if (role === 'COORDENADOR') {
        router.push('/coordenador');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      if (err instanceof ApiError && err.status !== 500 && err.status !== 502 && err.status !== 503) {
        const errorMsg = err.message || 'E-mail ou senha incorretos.';
        setGeneralError(errorMsg);
        setEmailError('Verifique o e-mail digitado');
        setPasswordError('Verifique a senha digitada');
        setToastMessage({
          title: 'Falha na Autenticação',
          desc: errorMsg,
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      const loginResult = loginUser(emailClean);

      if (!loginResult || !loginResult.user) {
        const msg = 'E-mail ou senha não encontrados no sistema.';
        setGeneralError(msg);
        setEmailError('E-mail não localizado');
        setPasswordError('Senha incorreta');
        setToastMessage({
          title: 'Falha na Autenticação',
          desc: msg,
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#065373', '#226a8b', '#3f81a3', '#5b98bb', '#77afd3', '#38bdf8'],
        });
      } catch {}

      setToastMessage({
        title: 'Bem-vindo ao DocFlow! 🚀',
        desc: `Autenticação realizada com sucesso${
          loginResult.user?.nome ? ` como ${loginResult.user.nome}` : ''
        }.`,
        type: 'success',
      });

      router.push(loginResult.route);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#043c53] relative overflow-hidden flex items-center justify-center p-4 lg:p-8 font-sans selection:bg-cyan-400 selection:text-slate-900">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#065373] rounded-full blur-3xl opacity-70 animate-pulse-glow pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[32rem] h-[32rem] bg-[#226a8b] rounded-full blur-3xl opacity-60 animate-pulse-glow pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#3f81a3]/30 rounded-full blur-2xl pointer-events-none" />

      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(#77afd3 1px, transparent 1px), radial-gradient(#77afd3 1px, #043c53 1px)',
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center py-6 sm:py-0">
        <div className="order-2 lg:order-1 lg:col-span-6 space-y-4 sm:space-y-6 text-white text-center lg:text-left">
          <div className="inline-flex items-center px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
            <DocFlowLogo inverted size="lg" showSubtitle />
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Sua carreira sem{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-[#77afd3] to-white">
                burocracia documental.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-cyan-100/80 max-w-lg leading-relaxed mx-auto lg:mx-0">
              Envie seus comprovantes, RG e TCE direto do seu celular ou computador com confirmação
              imediata, sem risco de perder o estágio e com total proteção dos seus dados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group text-left animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 text-cyan-300" />
              </div>
              <h4 className="font-bold text-sm text-white">Upload Rápido & Fácil</h4>
              <p className="text-xs text-cyan-100/70 mt-1 leading-snug">
                Envie fotos ou PDFs dos seus documentos em instantes. Tudo rápido, aprovado na hora e sem complicação.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] group text-left animate-float-reverse">
              <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <h4 className="font-bold text-sm text-white">Privacidade & Segurança</h4>
              <p className="text-xs text-cyan-100/70 mt-1 leading-snug">
                Seus dados pessoais sensíveis ficam protegidos e com visualização restrita para sua segurança.
              </p>
            </div>

            <div className="sm:col-span-2 p-3.5 rounded-2xl bg-gradient-to-r from-[#226a8b]/60 to-[#065373]/60 backdrop-blur-md border border-white/15 flex items-center gap-3.5 text-left">
              <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Avisos de Renovação</p>
                <p className="text-[11px] text-cyan-100/80">
                  O sistema avisa com antecedência quando chegar a hora de renovar o comprovante da faculdade ou curso técnico.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6 w-full max-w-md mx-auto">
          <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/80 backdrop-blur-2xl border border-white/20 shadow-2xl p-5 sm:p-8 text-white overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#77afd3] to-[#226a8b]" />

            <div className="space-y-1 mb-6">
              <h3 className="text-lg font-bold text-white tracking-tight">Entrar na sua conta</h3>
              <p className="text-xs text-slate-400">
                Informe seu e-mail e senha cadastrados para acessar a plataforma.
              </p>
            </div>

            <form noValidate onSubmit={handleLoginSubmit} className="space-y-4">
              {generalError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{generalError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>E-mail</span>
                  </span>
                </label>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (emailError) setEmailError('');
                    if (generalError) setGeneralError('');
                  }}
                  placeholder="seu.email@exemplo.com"
                  className={`w-full bg-slate-950/90 border ${
                    emailError
                      ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/40'
                      : 'border-slate-700 focus:border-cyan-400 focus:ring-cyan-400'
                  } focus:ring-1 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all font-sans outline-none`}
                />
                {emailError && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Senha</span>
                  </label>
                  <Link
                    href="/esqueceu-senha"
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 transition-colors"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                      if (generalError) setGeneralError('');
                    }}
                    placeholder="••••••••••••"
                    className={`w-full bg-slate-950/90 border ${
                      passwordError
                        ? 'border-rose-500 focus:border-rose-400 focus:ring-rose-400/40'
                        : 'border-slate-700 focus:border-cyan-400 focus:ring-cyan-400'
                    } focus:ring-1 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 transition-all font-mono outline-none pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-rose-400 font-medium flex items-center gap-1.5 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#065373] focus:ring-cyan-400 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Lembrar meu dispositivo</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#065373] via-[#226a8b] to-[#3f81a3] hover:from-[#0a6d96] hover:to-[#226a8b] text-white py-3 px-4 font-bold text-xs shadow-lg shadow-[#065373]/50 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
              >
                <div className="absolute top-0 bottom-0 w-24 bg-white/20 skew-x-12 animate-shine pointer-events-none" />

                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                    <span>Entrando no DocFlow...</span>
                  </>
                ) : (
                  <>
                    <span>Acessar Plataforma</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-cyan-300" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Ambiente Seguro • Guarda Digital com Conformidade</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
