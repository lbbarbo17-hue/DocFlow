'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';
import {
  authApi,
  setAuthToken,
  setTenantId,
  ApiError,
  alunosApi,
  documentosApi,
  contratosApi,
} from '@/lib/api';
import { mapAlunoResponseToStudent } from '@/context/AppContext';
import {
  Shield,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  KeyRound,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole, setToastMessage, setStudentDirect, loginUser } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const passStrength = calculatePasswordStrength(password);
  const strengthLabels = [
    { label: 'Muito Curta', color: 'bg-slate-700 text-slate-400', emoji: '😴' },
    { label: 'Fraca', color: 'bg-rose-500 text-rose-300', emoji: '⚠️' },
    { label: 'Média', color: 'bg-amber-500 text-amber-300', emoji: '🤔' },
    { label: 'Forte', color: 'bg-sky-500 text-sky-300', emoji: '🔥' },
    { label: 'Suprema & Segura', color: 'bg-emerald-400 text-emerald-300', emoji: '🛡️' },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const emailClean = identifier.trim();

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

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#065373', '#226a8b', '#3f81a3', '#5b98bb', '#77afd3', '#38bdf8'],
        });
      } catch {
      }

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
        } catch {
        }
        router.push('/estudante');
      } else if (role === 'COORDENADOR') {
        router.push('/coordenador');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      if (err instanceof ApiError && err.status !== 500 && err.status !== 502 && err.status !== 503) {
        setToastMessage({
          title: 'Falha na Autenticação',
          desc: err.message || 'Credenciais inválidas no DocFlow.',
          type: 'error',
        });
        setIsLoading(false);
        return;
      }

      const loginResult = loginUser(emailClean);

      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#065373', '#226a8b', '#3f81a3', '#5b98bb', '#77afd3', '#38bdf8'],
        });
      } catch {
      }

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

  const quickLogin = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden select-none font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#065373]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#0284c7]/20 rounded-full blur-[140px] pointer-events-none" />

      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#065373] to-[#0284c7] flex items-center justify-center shadow-lg shadow-[#065373]/30 border border-cyan-400/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              DocFlow
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold">
                PROD
              </span>
            </span>
            <p className="text-[11px] text-slate-400 font-medium">Compliance Documental Estudantil</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Criptografia SHA-256 e LGPD Ativos</span>
        </div>
      </header>

      <main className="w-full max-w-md mx-auto px-5 py-4 z-10 my-auto">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Portal Corporativo</h1>
            <p className="text-xs text-slate-400 mt-1">
              Acesse com seu e-mail institucional ou credencial única
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                E-mail ou Matrícula
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="seu.email@instituicao.gov.br"
                  className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 font-medium transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Senha de Acesso</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {showPassword ? (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Ocultar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Exibir</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950/80 border border-slate-700/80 hover:border-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-2xl px-4 py-3 text-xs text-white placeholder:text-slate-500 font-medium transition-all outline-none"
                />
              </div>

              {password.length > 0 && (
                <div className="mt-2.5 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <KeyRound className="w-3 h-3 text-cyan-400" />
                      <span>Força da Senha:</span>
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${strengthLabels[passStrength].color}`}
                    >
                      {strengthLabels[passStrength].emoji} {strengthLabels[passStrength].label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden flex gap-1 p-0.5 border border-slate-800">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all duration-300 ${
                          passStrength >= step
                            ? passStrength === 1
                              ? 'bg-rose-500'
                              : passStrength === 2
                              ? 'bg-amber-500'
                              : passStrength === 3
                              ? 'bg-sky-500'
                              : 'bg-emerald-400'
                            : 'bg-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-400/20"
                />
                <span>Lembrar credencial</span>
              </label>

              <button
                type="button"
                onClick={() =>
                  setToastMessage({
                    title: 'Recuperação de Acesso',
                    desc: 'Solicite a redefinição de senha ao Coordenador Pedagógico ou Super Administrador.',
                    type: 'info',
                  })
                }
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#065373] via-[#0284c7] to-[#38bdf8] hover:from-[#05435c] hover:to-[#0284c7] text-white font-extrabold text-xs shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Validando Credenciais...</span>
                </>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
              Perfis de Teste Homologados
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickLogin('admin@docflow.com.br', 'Admin@DocFlow2026')}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    SuperAdmin
                  </span>
                  <Zap className="w-3 h-3 text-purple-400 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="text-xs font-bold text-white mt-1 truncate">Admin Geral</p>
                <p className="text-[10px] text-slate-400 truncate">admin@docflow</p>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('marcelo.souza@etec.sp.gov.br', 'DocFlow@2026')}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                    Coordenador
                  </span>
                  <Zap className="w-3 h-3 text-cyan-400 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="text-xs font-bold text-white mt-1 truncate">Prof. Marcelo</p>
                <p className="text-[10px] text-slate-400 truncate">ETEC Politécnica</p>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('beatriz.ramos@aluno.etec.sp.gov.br', 'DocFlow@2026')}
                className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    Estudante
                  </span>
                  <Zap className="w-3 h-3 text-emerald-400 opacity-60 group-hover:opacity-100" />
                </div>
                <p className="text-xs font-bold text-white mt-1 truncate">Beatriz Helena</p>
                <p className="text-[10px] text-slate-400 truncate">100% Conforme</p>
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 z-10">
        <p>© 2026 DocFlow — Todos os direitos reservados.</p>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            Sessão segura de 8 horas
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            ISO/IEC 27001 & LGPD
          </span>
        </div>
      </footer>
    </div>
  );
}
